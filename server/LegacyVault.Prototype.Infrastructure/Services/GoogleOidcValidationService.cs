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

    public async Task<OidcUserInfo> ValidateGoogleIdTokenAsync(string idToken, string? clientId = null, CancellationToken ct = default)
    {
        // The audience is a server-side trust setting, never a value chosen by the caller.
        string? googleClientId = Environment.GetEnvironmentVariable("GOOGLE_OIDC_CLIENT_ID")
            ?? _config["GoogleOidc:ClientId"];

        if (string.IsNullOrWhiteSpace(googleClientId) || googleClientId.Contains("YOUR_"))
        {
            _logger.LogError("Google OIDC client ID is not configured.");
            return new OidcUserInfo { IsValid = false };
        }

        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings
            {
                Audience = new[] { googleClientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
            if (!payload.EmailVerified || string.IsNullOrWhiteSpace(payload.Subject))
                return new OidcUserInfo { IsValid = false };

            _logger.LogInformation("Google ID Token verified for subject {Subject}", payload.Subject);

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
            _logger.LogWarning(ex, "Google ID Token validation failed.");
            return new OidcUserInfo { IsValid = false };
        }
    }
}
