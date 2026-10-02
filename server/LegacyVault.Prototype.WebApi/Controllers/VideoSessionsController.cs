using System.Security.Claims;
using System.Text.Json;
using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[Route("api/video-sessions")]
public class VideoSessionsController : ControllerBase
{
    private readonly IVideoSessionService _videoSessionService;
    private readonly ILiveKitVideoService _liveKitService;
    private readonly ILogger<VideoSessionsController> _logger;

    public VideoSessionsController(
        IVideoSessionService videoSessionService,
        ILiveKitVideoService liveKitService,
        ILogger<VideoSessionsController> logger)
    {
        _videoSessionService = videoSessionService;
        _liveKitService = liveKitService;
        _logger = logger;
    }

    /// <summary>
    /// Tạo yêu cầu phiên gọi video (Thẩm định bàn giao hoặc Cứu hộ)
    /// </summary>
    [HttpPost("request")]
    public async Task<IActionResult> RequestSession([FromBody] CreateVideoSessionRequest request)
    {
        var currentUserId = GetCurrentUserId(request.SubjectUserId);
        var result = await _videoSessionService.RequestSessionAsync(request, currentUserId);
        return Ok(result);
    }

    /// <summary>
    /// Thẩm định viên (Verifier) xác nhận chốt lịch hẹn
    /// </summary>
    [HttpPost("{sessionId}/confirm-schedule")]
    public async Task<IActionResult> ConfirmSchedule(
        [FromRoute] Guid sessionId, 
        [FromBody] ConfirmScheduleDto dto)
    {
        var currentUserId = GetCurrentUserId(dto.VerifierId);
        var result = await _videoSessionService.ConfirmScheduleAsync(sessionId, dto.ScheduledAt, currentUserId);
        return Ok(result);
    }

    /// <summary>
    /// Cấp Access Token ngắn hạn (TTL 5 phút) để gia nhập phòng LiveKit Cloud
    /// </summary>
    [HttpPost("{sessionId}/join-token")]
    public async Task<IActionResult> GetJoinToken(
        [FromRoute] Guid sessionId, 
        [FromQuery] Guid? userId = null)
    {
        // Chống lưu cache token bảo mật
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        Response.Headers.Append("Pragma", "no-cache");

        var currentUserId = GetCurrentUserId(userId);
        var tokenResponse = await _videoSessionService.GetJoinTokenAsync(sessionId, currentUserId);
        return Ok(tokenResponse);
    }

    /// <summary>
    /// Verifier ghi nhận kết quả thẩm định (PASS, FAIL, REQUIRE_MORE_DOCS, INCONCLUSIVE) kèm Checklist
    /// </summary>
    [HttpPost("{sessionId}/submit-verdict")]
    public async Task<IActionResult> SubmitVerdict(
        [FromRoute] Guid sessionId, 
        [FromBody] SubmitVerdictRequest request,
        [FromQuery] Guid? verifierId = null)
    {
        var currentVerifierId = GetCurrentUserId(verifierId);
        var result = await _videoSessionService.SubmitVerdictAsync(sessionId, request, currentVerifierId);
        return Ok(result);
    }

    /// <summary>
    /// Kết thúc phiên gọi và kích hoạt thu hồi phòng trên LiveKit Cloud
    /// </summary>
    [HttpPost("{sessionId}/end")]
    public async Task<IActionResult> EndSession(
        [FromRoute] Guid sessionId, 
        [FromQuery] Guid? userId = null)
    {
        var currentUserId = GetCurrentUserId(userId);
        var result = await _videoSessionService.EndSessionAsync(sessionId, currentUserId);
        return Ok(result);
    }

    /// <summary>
    /// Lấy chi tiết phiên gọi video
    /// </summary>
    [HttpGet("{sessionId}")]
    public async Task<IActionResult> GetSessionDetail(
        [FromRoute] Guid sessionId, 
        [FromQuery] Guid? userId = null)
    {
        var currentUserId = GetCurrentUserId(userId);
        var detail = await _videoSessionService.GetSessionDetailAsync(sessionId, currentUserId);
        return Ok(detail);
    }

    /// <summary>
    /// P0: Owner kích hoạt Emergency Hold và tự động mở phiên xác minh cứu hộ khẩn cấp
    /// </summary>
    [HttpPost("rescue/hold")]
    public async Task<IActionResult> TriggerRescueHold([FromBody] TriggerRescueHoldDto dto)
    {
        var currentUserId = GetCurrentUserId(dto.OwnerId);
        var result = await _videoSessionService.TriggerRescueHoldAsync(dto.CaseId, currentUserId, dto.Reason);
        return Ok(result);
    }

    /// <summary>
    /// P0: Verifier phân xử giải tỏa Hold sau khi xác minh (APPROVED_ALIVE hoặc REJECTED_FRAUD)
    /// </summary>
    [HttpPost("rescue/adjudicate")]
    public async Task<IActionResult> AdjudicateRescueHold([FromBody] ResumeHoldRequest request, [FromQuery] Guid? verifierId = null)
    {
        var currentVerifierId = GetCurrentUserId(verifierId);
        var result = await _videoSessionService.AdjudicateRescueHoldAsync(
            request.CaseId, 
            currentVerifierId, 
            request.Decision, 
            request.AdjudicationNotes);
        return Ok(result);
    }

    /// <summary>
    /// Webhook nhận sự kiện người tham gia từ LiveKit Cloud với xác minh chữ ký SHA256 JWT
    /// </summary>
    [HttpPost("/api/webhooks/livekit")]
    public async Task<IActionResult> LiveKitWebhook()
    {
        Request.EnableBuffering();
        using var reader = new StreamReader(Request.Body, leaveOpen: true);
        var rawBody = await reader.ReadToEndAsync();
        Request.Body.Position = 0;

        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        var rawBytes = System.Text.Encoding.UTF8.GetBytes(rawBody);

        // Xác minh chữ ký số của LiveKit Cloud
        var isValid = _liveKitService.VerifyWebhookSignature(authHeader, rawBytes);
        if (!isValid)
        {
            _logger.LogWarning("Webhook từ chối: Chữ ký không hợp lệ từ IP {Ip}", HttpContext.Connection.RemoteIpAddress);
            return Unauthorized("Chữ ký Webhook không hợp lệ.");
        }

        try
        {
            using var doc = JsonDocument.Parse(rawBody);
            var root = doc.RootElement;

            var eventId = root.TryGetProperty("id", out var idProp) ? idProp.GetString() ?? Guid.NewGuid().ToString() : Guid.NewGuid().ToString();
            var eventType = root.TryGetProperty("event", out var evProp) ? evProp.GetString() ?? string.Empty : string.Empty;
            
            string roomName = string.Empty;
            if (root.TryGetProperty("room", out var roomProp) && roomProp.TryGetProperty("name", out var rNameProp))
            {
                roomName = rNameProp.GetString() ?? string.Empty;
            }

            string? participantIdentity = null;
            if (root.TryGetProperty("participant", out var partProp) && partProp.TryGetProperty("identity", out var idenProp))
            {
                participantIdentity = idenProp.GetString();
            }

            await _videoSessionService.HandleWebhookEventAsync(eventId, eventType, roomName, participantIdentity, rawBody);
            return Ok(new { success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi xử lý LiveKit Webhook.");
            return BadRequest("Payload không hợp lệ.");
        }
    }

    private Guid GetCurrentUserId(Guid? fallbackUserId = null)
    {
        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                       ?? User.FindFirst("sub")?.Value;

        if (Guid.TryParse(subClaim, out var parsed))
            return parsed;

        if (fallbackUserId.HasValue && fallbackUserId.Value != Guid.Empty)
            return fallbackUserId.Value;

        // Fallback mặc định cho Swagger Prototype Testing
        return Guid.Parse("11111111-1111-1111-1111-111111111111");
    }
}

public class ConfirmScheduleDto
{
    public DateTime ScheduledAt { get; set; }
    public Guid? VerifierId { get; set; }
}

public class TriggerRescueHoldDto
{
    public Guid CaseId { get; set; }
    public Guid? OwnerId { get; set; }
    public string? Reason { get; set; }
}
