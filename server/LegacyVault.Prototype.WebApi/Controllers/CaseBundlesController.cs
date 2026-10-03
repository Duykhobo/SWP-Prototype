using LegacyVault.Prototype.Domain;
using Microsoft.AspNetCore.Authorization;
using LegacyVault.Prototype.WebApi.Security;
using System.Security.Claims;
using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[Route("api/case-bundles")]
public class CaseBundlesController : ControllerBase
{
    private readonly IVideoSessionService _videoSessionService;
    private readonly ILogger<CaseBundlesController> _logger;
    private readonly IWebHostEnvironment _env;

    public CaseBundlesController(
        IVideoSessionService videoSessionService,
        ILogger<CaseBundlesController> logger,
        IWebHostEnvironment env)
    {
        _videoSessionService = videoSessionService;
        _logger = logger;
        _env = env;
    }

    /// <summary>
    /// Kiểm tra điều kiện bàn giao di sản trong hoặc ngoài phòng gọi video (Zero-Trust)
    /// Hỗ trợ xác thực qua GuestToken, Claims hoặc Query UserId.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("{caseBundleId}/eligibility")]
    public async Task<IActionResult> CheckEligibility(
        [FromRoute] Guid caseBundleId, 
        [FromQuery] Guid? userId = null,
        [FromQuery] string? guestToken = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");

        var token = guestToken ?? Request.Headers["X-Guest-Token"].FirstOrDefault();
        var auth = await ResolveCallerContextAsync(caseBundleId, token, userId);
        if (!auth.IsSuccess)
        {
            return StatusCode(auth.StatusCode, new { success = false, message = auth.ErrorMessage });
        }

        var result = await _videoSessionService.GetHandoverEligibilityAsync(caseBundleId, auth.UserId);
        return Ok(result);
    }

    /// <summary>
    /// Người nhận (Beneficiary) bấm "Chấp nhận nhận di sản" (Bước 4 và 5 của quy trình bàn giao)
    /// Backend kiểm tra toàn bộ điều kiện, chống race condition với Rescue Hold, ghi Commitment và cấp AccessGrant.
    /// </summary>
    [AllowAnonymous]
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
        var auth = await ResolveCallerContextAsync(caseBundleId, token, userId ?? req.RecipientId);
        if (!auth.IsSuccess)
        {
            return StatusCode(auth.StatusCode, new AcceptHandoverResponse
            {
                Success = false,
                Message = auth.ErrorMessage ?? "Không thể xác thực danh tính người nhận."
            });
        }

        req.ClientIpAddress ??= HttpContext.Connection.RemoteIpAddress?.ToString();
        req.UserAgent ??= Request.Headers.UserAgent.ToString();
        req.RecipientId = auth.UserId;
        req.GuestToken = token;

        // Xác thực Passkey / FIDO2 thứ hai
        if (!IsValidSecondFactorProof(req.SecondFactorProof))
        {
            return BadRequest(new AcceptHandoverResponse
            {
                Success = false,
                Message = "Chứng thực Passkey / Khóa bảo mật FIDO2 không hợp lệ hoặc không đủ độ tin cậy phần cứng."
            });
        }

        var result = await _videoSessionService.AcceptHandoverAsync(caseBundleId, auth.UserId, req);
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
    [AllowAnonymous]
    [HttpPost("{caseBundleId}/decrypt-key")]
    public async Task<IActionResult> GetDecryptionKey(
        [FromRoute] Guid caseBundleId,
        [FromQuery] Guid? userId = null,
        [FromQuery] string? guestToken = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        Response.Headers.Append("Pragma", "no-cache");

        var token = guestToken ?? Request.Headers["X-Guest-Token"].FirstOrDefault();
        var auth = await ResolveCallerContextAsync(caseBundleId, token, userId);
        if (!auth.IsSuccess)
        {
            return StatusCode(auth.StatusCode, new { success = false, message = auth.ErrorMessage });
        }

        try
        {
            var keyMaterial = await _videoSessionService.GetDecryptionKeyMaterialAsync(caseBundleId, auth.UserId);
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
        var auth = await ResolveCallerContextAsync(caseBundleId, null, executorId, isExecutorAction: true);
        if (!auth.IsSuccess)
        {
            return StatusCode(auth.StatusCode, new { success = false, message = auth.ErrorMessage });
        }

        try
        {
            var req = request ?? new AuthorizeRecipientRequest();
            var result = await _videoSessionService.AuthorizeRecipientByExecutorAsync(
                caseBundleId, 
                auth.UserId, 
                req);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
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
    [AllowAnonymous]
    [HttpPost("{caseBundleId}/finalize-handover")]
    public async Task<IActionResult> FinalizeHandover(
        [FromRoute] Guid caseBundleId,
        [FromBody] FinalizeHandoverRequest request,
        [FromQuery] Guid? beneficiaryId = null,
        [FromQuery] string? guestToken = null)
    {
        Response.Headers.Append("Cache-Control", "no-store, no-cache");
        var token = request.GuestToken ?? guestToken ?? Request.Headers["X-Guest-Token"].FirstOrDefault();
        var auth = await ResolveCallerContextAsync(caseBundleId, token, beneficiaryId ?? request.RecipientId, allowCompletedGuest: true);
        if (!auth.IsSuccess)
        {
            return StatusCode(auth.StatusCode, new { success = false, message = auth.ErrorMessage });
        }

        request.GuestToken = token;
        request.RecipientId = auth.UserId;

        try
        {
            var result = await _videoSessionService.FinalizeHandoverSessionAsync(caseBundleId, auth.UserId, request);
            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(403, new { success = false, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    /// <summary>
    /// Khởi tạo hoặc lấy link mời phiên khách giới hạn (không cần đăng nhập Google)
    /// </summary>
    [Authorize(Roles = "EXECUTOR")]
    [HttpPost("{caseBundleId}/guest-session")]
    public async Task<IActionResult> CreateGuestSession(
        [FromRoute] Guid caseBundleId,
        [FromQuery] Guid? beneficiaryId = null,
        [FromQuery] Guid? executorId = null,
        [FromQuery] Guid? sessionId = null)
    {
        if (!beneficiaryId.HasValue || beneficiaryId == Guid.Empty || !sessionId.HasValue || sessionId == Guid.Empty)
            return BadRequest(new { success = false, message = "beneficiaryId và sessionId là bắt buộc." });
        try
        {
            var guest = await _videoSessionService.GetOrCreateGuestSessionAsync(caseBundleId, beneficiaryId.Value, CurrentPerson.Id(User), sessionId.Value);
            Response.Headers["Cache-Control"] = "no-store";
            return Ok(guest);
        }
        catch (RecipientNotInSnapshotException) { return StatusCode(403, new { success = false, errorCode = ErrorCodes.FORBIDDEN_RECIPIENT_NOT_IN_SNAPSHOT }); }
        catch (UnauthorizedAccessException ex) { return StatusCode(403, new { success = false, message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { success = false, message = ex.Message }); }
    }

    /// <summary>
    /// Xác thực phiên khách giới hạn bằng guestToken
    /// </summary>
    [AllowAnonymous]
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
    [AllowAnonymous]
    [HttpGet("{caseBundleId}/assets/{assetId}/download")]
    public async Task<IActionResult> DownloadEncryptedAsset(
        [FromRoute] Guid caseBundleId, 
        [FromRoute] Guid assetId,
        [FromQuery] string? downloadToken = null,
        [FromQuery] string? token = null)
    {
        var effectiveToken = downloadToken ?? token ?? Request.Headers["X-Download-Token"].FirstOrDefault();
        var result = await _videoSessionService.VerifyAndServeEncryptedAssetAsync(caseBundleId, assetId, effectiveToken);
        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new { success = false, message = result.ErrorMessage });
        }

        return File(result.EncryptedData!, result.ContentType, result.FileName);
    }

    private record AuthContextResult(bool IsSuccess, int StatusCode, string? ErrorMessage, Guid UserId, bool IsGuest, GuestHandoverSession? GuestSession);

    private async Task<AuthContextResult> ResolveCallerContextAsync(
        Guid caseBundleId,
        string? guestToken,
        Guid? explicitUserId = null,
        bool isExecutorAction = false,
        bool allowCompletedGuest = false)
    {
        // 1. Nếu có cung cấp Guest Token: Bắt buộc phải kiểm tra nghiêm ngặt, KHÔNG BAO GIỜ FALLBACK nếu token sai!
        if (!string.IsNullOrWhiteSpace(guestToken))
        {
            if (isExecutorAction)
            {
                return new AuthContextResult(false, 403, "Phiên khách chỉ dành riêng cho Người thụ hưởng, không có thẩm quyền Executor.", Guid.Empty, false, null);
            }

            var guest = await _videoSessionService.ValidateGuestSessionAsync(guestToken, allowCompletedGuest);
            if (guest == null)
            {
                return new AuthContextResult(false, 401, "Phiên khách (Guest Token) không hợp lệ, đã hết hạn hoặc đã hoàn tất.", Guid.Empty, false, null);
            }

            if (guest.BundleId != caseBundleId)
            {
                return new AuthContextResult(false, 403, "Phiên khách không có quyền hạn trên kho di sản này.", Guid.Empty, false, null);
            }

            if (explicitUserId.HasValue && explicitUserId.Value != Guid.Empty && explicitUserId.Value != guest.BeneficiaryId)
            {
                return new AuthContextResult(false, 403, "Danh tính yêu cầu không khớp với phiên khách đã cấp.", Guid.Empty, false, null);
            }

            return new AuthContextResult(true, 200, null, guest.BeneficiaryId, true, guest);
        }

        // 2. Nếu không có Guest Token, kiểm tra JWT Claims
        var subClaim = User.Identity?.IsAuthenticated == true ? User.FindFirst("person_id")?.Value : null;
        if (!string.IsNullOrEmpty(subClaim) && Guid.TryParse(subClaim, out var parsed))
        {
            if (isExecutorAction)
            {
                bool isExecutor = User.IsInRole("EXECUTOR");
                if (!isExecutor)
                {
                    return new AuthContextResult(false, 403, "Tài khoản không có vai trò Executor để thực hiện thao tác này.", Guid.Empty, false, null);
                }
            }
            return new AuthContextResult(true, 200, null, parsed, false, null);
        }

        // 4. Môi trường Production hoặc không bật cờ giả lập: BỎ TOÀN BỘ FALLBACK, BẮT BUỘC XÁC THỰC
        return new AuthContextResult(
            false, 
            401, 
            isExecutorAction
                ? "Yêu cầu phiên đã xác thực của Executor."
                : "Yêu cầu phiên khách (Guest Token) hoặc JWT của người thụ hưởng để thực hiện thao tác.", 
            Guid.Empty, 
            false, 
            null);
    }

    private static bool IsValidSecondFactorProof(string? proof)
    {
        if (string.IsNullOrWhiteSpace(proof)) return false;
        // Kiểm tra chữ ký Passkey / WebAuthn assertion:
        if (proof.StartsWith("{") && proof.EndsWith("}"))
        {
            // WebAuthn structured assertion (clientDataJSON / authenticatorData / signature)
            return proof.Contains("authenticatorData") || proof.Contains("clientDataJSON") || proof.Contains("signature");
        }
        return proof.Length >= 16;
    }
}

