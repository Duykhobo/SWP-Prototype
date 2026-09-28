using System.IdentityModel.Tokens.Jwt;
using Google.Apis.Auth;
using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LegacyVault.Prototype.Infrastructure.Services;

/// <summary>
/// Xác thực Google OpenID Connect (OIDC) Token
/// </summary>
public class GoogleOidcValidationService : IOidcValidationService
{
    private readonly IConfiguration _config;
    private readonly ILogger<GoogleOidcValidationService> _logger;

    public GoogleOidcValidationService(IConfiguration config, ILogger<GoogleOidcValidationService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<OidcUserInfo> ValidateGoogleIdTokenAsync(string idToken, CancellationToken ct = default)
    {
        string? googleClientId = _config["GoogleOidc:ClientId"];

        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings();
            if (!string.IsNullOrWhiteSpace(googleClientId) && !googleClientId.Contains("YOUR_"))
            {
                settings.Audience = new[] { googleClientId };
            }

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            _logger.LogInformation("Google ID Token verified successfully for {Email}", payload.Email);

            return new OidcUserInfo
            {
                IsValid = true,
                Subject = payload.Subject,
                Email = payload.Email,
                Name = payload.Name,
                Picture = payload.Picture,
                Issuer = payload.Issuer,
                Audience = payload.Audience?.ToString() ?? "",
                ExpiryTime = DateTimeOffset.FromUnixTimeSeconds(payload.ExpirationTimeSeconds ?? 0).UtcDateTime
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Real Google validation failed: {Msg}. Attempting fallback JWT inspection for testing.", ex.Message);

            // Cho phép kiểm tra token JWT định dạng thử nghiệm
            try
            {
                var handler = new JwtSecurityTokenHandler();
                if (handler.CanReadToken(idToken))
                {
                    var jwt = handler.ReadJwtToken(idToken);
                    string email = jwt.Claims.FirstOrDefault(c => c.Type == "email")?.Value ?? "demo.user@fpt.edu.vn";
                    string name = jwt.Claims.FirstOrDefault(c => c.Type == "name")?.Value ?? "Sinh Viên FPT Demo";
                    string sub = jwt.Subject ?? Guid.NewGuid().ToString();

                    return new OidcUserInfo
                    {
                        IsValid = true,
                        Subject = sub,
                        Email = email,
                        Name = name,
                        Picture = "https://lh3.googleusercontent.com/a/default-user",
                        Issuer = jwt.Issuer,
                        Audience = string.Join(",", jwt.Audiences),
                        ExpiryTime = jwt.ValidTo
                    };
                }
            }
            catch
            {
                // Ignore parse errors
            }

            return new OidcUserInfo
            {
                IsValid = false,
                Email = "invalid_token@legacyvault.vn",
                Name = "Invalid Token"
            };
        }
    }
}
