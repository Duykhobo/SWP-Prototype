namespace LegacyVault.Prototype.Application.Interfaces;

public class OidcUserInfo
{
    public bool IsValid { get; set; }
    public string Subject { get; set; } = string.Empty; // Google Sub ID
    public string Email { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Picture { get; set; } = string.Empty;
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public DateTime ExpiryTime { get; set; }
}

public interface IOidcValidationService
{
    Task<OidcUserInfo> ValidateGoogleIdTokenAsync(string idToken, string? clientId = null, CancellationToken ct = default);
}
