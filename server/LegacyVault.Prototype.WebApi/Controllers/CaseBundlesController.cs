using System.Security.Claims;
using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[Route("api/case-bundles")]
public class CaseBundlesController : ControllerBase
{
    private readonly IVideoSessionService _videoSessionService;
    private readonly ILogger<CaseBundlesController> _logger;

    public CaseBundlesController(
        IVideoSessionService videoSessionService,
        ILogger<CaseBundlesController> logger)
    {
        _videoSessionService = videoSessionService;
        _logger = logger;
    }

    /// <summary>
    /// Kiểm tra điều kiện bàn giao di sản trong hoặc ngoài phòng gọi video (Zero-Trust)
    /// </summary>
    [HttpGet("{caseBundleId}/eligibility")]
    public async Task<IActionResult> CheckEligibility(
        [FromRoute] Guid caseBundleId, 
        [FromQuery] Guid? userId = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        var currentUserId = GetCurrentUserId(userId);
        var result = await _videoSessionService.GetHandoverEligibilityAsync(caseBundleId, currentUserId);
        return Ok(result);
    }

    /// <summary>
    /// Người nhận (Beneficiary) bấm "Chấp nhận nhận di sản" (Bước 4 và 5 của quy trình bàn giao)
    /// Backend kiểm tra toàn bộ điều kiện, chống race condition với Rescue Hold, ghi Commitment và cấp AccessGrant.
    /// </summary>
    [HttpPost("{caseBundleId}/accept")]
    public async Task<IActionResult> AcceptHandover(
        [FromRoute] Guid caseBundleId, 
        [FromBody] AcceptHandoverRequest? request = null,
        [FromQuery] Guid? userId = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        var currentUserId = GetCurrentUserId(userId);
        var req = request ?? new AcceptHandoverRequest();
        req.ClientIpAddress ??= HttpContext.Connection.RemoteIpAddress?.ToString();
        req.UserAgent ??= Request.Headers.UserAgent.ToString();

        var result = await _videoSessionService.AcceptHandoverAsync(caseBundleId, currentUserId, req);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    /// <summary>
    /// Kênh bảo mật riêng cấp phát vật liệu giải mã di sản (Key Envelope / Salt / IV).
    /// Hoàn toàn tách biệt khỏi LiveKit Video Socket; chỉ cấp khi AccessGrant ACTIVE và không có Rescue Hold.
    /// </summary>
    [HttpPost("{caseBundleId}/decrypt-key")]
    public async Task<IActionResult> GetDecryptionKey(
        [FromRoute] Guid caseBundleId,
        [FromQuery] Guid? userId = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        Response.Headers.Append("Pragma", "no-cache");

        var currentUserId = GetCurrentUserId(userId);
        try
        {
            var keyMaterial = await _videoSessionService.GetDecryptionKeyMaterialAsync(caseBundleId, currentUserId);
            return Ok(keyMaterial);
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Bước 4: Người thực thi (Executor) bấm "Xác nhận người nhận & cho phép nhận di sản"
    /// </summary>
    [HttpPost("{caseBundleId}/executor-allow-handover")]
    public async Task<IActionResult> ExecutorAllowHandover(
        [FromRoute] Guid caseBundleId,
        [FromBody] AuthorizeRecipientRequest? request = null,
        [FromQuery] Guid? executorId = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        var currentExecutorId = GetCurrentUserId(executorId);
        try
        {
            var result = await _videoSessionService.AuthorizeRecipientByExecutorAsync(
                caseBundleId, 
                currentExecutorId, 
                request ?? new AuthorizeRecipientRequest());
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Bước 6 & 7: Người nhận bấm "Tôi xác nhận đã nhận đầy đủ và muốn kết thúc phiên"
    /// Backend kiểm tra đã tải đủ file bắt buộc, ghi Biên nhận (HandoverReceipt), đóng quyền truy cập và thu hồi phiên khách.
    /// </summary>
    [HttpPost("{caseBundleId}/finalize-handover")]
    public async Task<IActionResult> FinalizeHandover(
        [FromRoute] Guid caseBundleId,
        [FromBody] FinalizeHandoverRequest request,
        [FromQuery] Guid? beneficiaryId = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        var currentBeneficiaryId = GetCurrentUserId(beneficiaryId);
        try
        {
            var result = await _videoSessionService.FinalizeHandoverSessionAsync(caseBundleId, currentBeneficiaryId, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Khởi tạo hoặc lấy link mời phiên khách giới hạn (không cần đăng nhập Google)
    /// </summary>
    [HttpPost("{caseBundleId}/guest-session")]
    public async Task<IActionResult> CreateGuestSession(
        [FromRoute] Guid caseBundleId,
        [FromQuery] Guid? beneficiaryId = null,
        [FromQuery] Guid? executorId = null,
        [FromQuery] Guid? sessionId = null)
    {
        var benId = beneficiaryId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
        var execId = executorId ?? Guid.Parse("22222222-2222-2222-2222-222222222222");
        var sId = sessionId ?? Guid.NewGuid();

        var guest = await _videoSessionService.GetOrCreateGuestSessionAsync(caseBundleId, benId, execId, sId);
        return Ok(guest);
    }

    /// <summary>
    /// Xác thực phiên khách giới hạn bằng guestToken
    /// </summary>
    [HttpGet("guest/{guestToken}")]
    public async Task<IActionResult> ValidateGuest([FromRoute] string guestToken)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        var guest = await _videoSessionService.ValidateGuestSessionAsync(guestToken);
        if (guest == null)
            return NotFound(new { success = false, message = "Phiên khách không hợp lệ, đã hết hạn hoặc đã hoàn tất." });

        return Ok(guest);
    }

    /// <summary>
    /// Tải tệp bản mã (Ciphertext) của di sản
    /// </summary>
    [HttpGet("{caseBundleId}/assets/{assetId}/download")]
    public IActionResult DownloadEncryptedAsset([FromRoute] Guid caseBundleId, [FromRoute] Guid assetId)
    {
        var dummyEncryptedBytes = System.Text.Encoding.UTF8.GetBytes($"[CIPHERTEXT-BLOB:CASE-{caseBundleId}:ASSET-{assetId}]");
        return File(dummyEncryptedBytes, "application/octet-stream", $"asset_{assetId:N}.enc");
    }

    private Guid GetCurrentUserId(Guid? explicitUserId)
    {
        if (explicitUserId.HasValue && explicitUserId.Value != Guid.Empty)
            return explicitUserId.Value;

        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(subClaim) && Guid.TryParse(subClaim, out var parsed))
            return parsed;

        // Fallback default user ID cho Prototype Testbench
        return Guid.Parse("12345678-1234-1234-1234-123456789abc");
    }
}
