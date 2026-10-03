namespace LegacyVault.Prototype.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateToken(Guid userId, Guid personId, string email, string fullName, IEnumerable<string> roles, TimeSpan? expiry = null);
}
