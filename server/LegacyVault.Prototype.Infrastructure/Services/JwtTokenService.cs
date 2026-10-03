using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace LegacyVault.Prototype.Infrastructure.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _config;
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expiryMinutes;

    public JwtTokenService(IConfiguration config)
    {
        _config = config;
        _secretKey = _config["Jwt:Secret"] ?? "LegacyVault_Super_Secret_Key_For_Jwt_Token_Signing_2026_Minimum_256_Bits!";
        _issuer = _config["Jwt:Issuer"] ?? "LegacyVault.Identity";
        _audience = _config["Jwt:Audience"] ?? "LegacyVault.ClientApp";
        _expiryMinutes = int.TryParse(_config["Jwt:ExpiryMinutes"], out var exp) ? exp : 1440;
    }

    public string GenerateToken(Guid userId, Guid personId, string email, string fullName, IEnumerable<string> roles, TimeSpan? expiry = null)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N")),
            new(ClaimTypes.NameIdentifier, userId.ToString()),
            new("person_id", personId.ToString()),
            new(JwtRegisteredClaimNames.Email, email),
            new(ClaimTypes.Email, email),
            new(ClaimTypes.Name, fullName),
            new("full_name", fullName)
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
            claims.Add(new Claim("role", role));
        }

        var expires = DateTime.UtcNow.Add(expiry ?? TimeSpan.FromMinutes(_expiryMinutes));

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expires,
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
