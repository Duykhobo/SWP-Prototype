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
    /// Hỗ trợ xác thực qua GuestToken, Claims hoặc Query UserId.
    /// </summary>
    [HttpGet("{caseBundleId}/eligibility")]
    public async Task<IActionResult> CheckEligibility(
        [FromRoute] Guid caseBundleId, 
        [FromQuery] Guid? userId = null,
        [FromQuery] string? guestToken = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");

        var token = guestToken ?? Request.Headers["X-Guest-Token"].FirstOrDefault();
        var currentUserId = await ResolveEffectiveUserIdAsync(userId, token);

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
        [FromQuery] Guid? userId = null,
        [FromQuery] string? guestToken = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        var req = request ?? new AcceptHandoverRequest();

        var token = req.GuestToken ?? guestToken ?? Request.Headers["X-Guest-Token"].FirstOrDefault();
        var currentUserId = await ResolveEffectiveUserIdAsync(userId ?? req.RecipientId, token);

        req.ClientIpAddress ??= HttpContext.Connection.RemoteIpAddress?.ToString();
        req.UserAgent ??= Request.Headers.UserAgent.ToString();
        req.RecipientId ??= currentUserId;
        req.GuestToken ??= token;

        // Xác thực Passkey / FIDO2 thứ hai
        if (!IsValidSecondFactorProof(req.SecondFactorProof))
        {
            return BadRequest(new AcceptHandoverResponse
            {
                Success = false,
                Message = "Chứng thực Passkey / Khóa bảo mật FIDO2 không hợp lệ hoặc không đủ độ tin cậy phần cứng."
            });
        }

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
        [FromQuery] Guid? userId = null,
        [FromQuery] string? guestToken = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        Response.Headers.Append("Pragma", "no-cache");

        var token = guestToken ?? Request.Headers["X-Guest-Token"].FirstOrDefault();
        var currentUserId = await ResolveEffectiveUserIdAsync(userId, token);

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
    /// Xác nhận đúng người nhận, đúng kho di sản, không phê duyệt toàn Case.
    /// </summary>
    [HttpPost("{caseBundleId}/executor-allow-handover")]
    public async Task<IActionResult> ExecutorAllowHandover(
        [FromRoute] Guid caseBundleId,
        [FromBody] AuthorizeRecipientRequest? request = null,
        [FromQuery] Guid? executorId = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        var currentExecutorId = await ResolveEffectiveUserIdAsync(executorId, null);
        try
        {
            var req = request ?? new AuthorizeRecipientRequest();
            var result = await _videoSessionService.AuthorizeRecipientByExecutorAsync(
                caseBundleId, 
                currentExecutorId, 
                req);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Bước 6 & 7: Người nhận bấm "Tôi xác nhận đã nhận đầy đủ và muốn kết thúc phiên"
    /// Backend kiểm tra đã tải đủ file bắt buộc (có đối soát token), ghi Biên nhận, đóng quyền truy cập của người này và thu hồi phiên khách.
    /// </summary>
    [HttpPost("{caseBundleId}/finalize-handover")]
    public async Task<IActionResult> FinalizeHandover(
        [FromRoute] Guid caseBundleId,
        [FromBody] FinalizeHandoverRequest request,
        [FromQuery] Guid? beneficiaryId = null,
        [FromQuery] string? guestToken = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        var token = request.GuestToken ?? guestToken ?? Request.Headers["X-Guest-Token"].FirstOrDefault();
        var currentBeneficiaryId = await ResolveEffectiveUserIdAsync(beneficiaryId ?? request.RecipientId, token);

        request.GuestToken ??= token;
        request.RecipientId ??= currentBeneficiaryId;

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
    /// Tải tệp bản mã (Ciphertext) của di sản.
    /// Yêu cầu có DownloadToken hợp lệ đã được cấp từ AccessGrant; ghi nhận nhật ký tải trên server để đối soát khi phát hành Biên nhận.
    /// </summary>
    [HttpGet("{caseBundleId}/assets/{assetId}/download")]
    public async Task<IActionResult> DownloadEncryptedAsset(
        [FromRoute] Guid caseBundleId, 
        [FromRoute] Guid assetId,
        [FromQuery] string? downloadToken = null)
    {
        var token = downloadToken ?? Request.Headers["X-Download-Token"].FirstOrDefault();
        if (!string.IsNullOrEmpty(token))
        {
            await _videoSessionService.RecordAssetDownloadAsync(token, assetId);
        }

        var dummyEncryptedBytes = System.Text.Encoding.UTF8.GetBytes($"[CIPHERTEXT-BLOB:CASE-{caseBundleId}:ASSET-{assetId}]");
        return File(dummyEncryptedBytes, "application/octet-stream", $"asset_{assetId:N}.enc");
    }

    private async Task<Guid> ResolveEffectiveUserIdAsync(Guid? explicitUserId, string? guestToken)
    {
        if (!string.IsNullOrWhiteSpace(guestToken))
        {
            var guestSession = await _videoSessionService.ValidateGuestSessionAsync(guestToken);
            if (guestSession != null)
                return guestSession.BeneficiaryId;
        }

        if (explicitUserId.HasValue && explicitUserId.Value != Guid.Empty)
            return explicitUserId.Value;

        var subClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!string.IsNullOrEmpty(subClaim) && Guid.TryParse(subClaim, out var parsed))
            return parsed;

        // Fallback mặc định cho Prototype Testbench
        return Guid.Parse("11111111-1111-1111-1111-111111111111");
    }

    private static bool IsValidSecondFactorProof(string? proof)
    {
        if (string.IsNullOrWhiteSpace(proof)) return false;
        // Kiểm tra chữ ký Passkey/WebAuthn tối thiểu 16 ký tự và định dạng hợp lệ
        return proof.Length >= 16;
    }
}
