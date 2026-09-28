using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IOidcValidationService _oidcService;

    public AuthController(IOidcValidationService oidcService)
    {
        _oidcService = oidcService;
    }

    /// <summary>
    /// Xác thực Google OpenID Connect ID Token và tự động trích xuất thông tin người dùng
    /// </summary>
    [HttpPost("google-oidc")]
    public async Task<IActionResult> ValidateGoogleOidc([FromBody] GoogleOidcRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.IdToken))
        {
            return BadRequest(new { success = false, message = "ID Token is required." });
        }

        var userInfo = await _oidcService.ValidateGoogleIdTokenAsync(request.IdToken, request.ClientId, ct);

        return Ok(new
        {
            success = userInfo.IsValid,
            user = userInfo,
            simulatedAccessToken = "ram_jwt_access_token_" + Guid.NewGuid().ToString("N"),
            roles = new[] { "OWNER", "BENEFICIARY" }
        });
    }

    [HttpGet("roles")]
    public IActionResult GetAvailableRoles()
    {
        return Ok(new[]
        {
            new { role = "OWNER", description = "Chủ sở hữu kho di sản" },
            new { role = "EXECUTOR", description = "Người thực thi di sản" },
            new { role = "VERIFIER", description = "Công chứng viên / Người thẩm định chứng tử" },
            new { role = "BENEFICIARY", description = "Người thụ hưởng / nhận di sản" },
            new { role = "ADMIN", description = "Quản trị viên hệ thống (Không nắm khóa giải mã)" }
        });
    }
}

public class GoogleOidcRequest
{
    public string IdToken { get; set; } = string.Empty;
    public string? ClientId { get; set; }
}
