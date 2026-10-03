using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using LegacyVault.Prototype.Infrastructure.Persistence;
using Microsoft.IdentityModel.Tokens;

namespace LegacyVault.Prototype.WebApi.Security;

public sealed class JwtTokenIssuer
{
    private readonly string _issuer;
    private readonly string _audience;
    private readonly SymmetricSecurityKey _key;
    private readonly int _minutes;

    public JwtTokenIssuer(IConfiguration configuration)
    {
        _issuer = configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer is required.");
        _audience = configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience is required.");
        var secret = Convert.FromBase64String(configuration["Jwt:SigningKeyBase64"] ?? "");
        if (secret.Length < 32 || string.IsNullOrWhiteSpace(_issuer) || string.IsNullOrWhiteSpace(_audience))
            throw new InvalidOperationException("Configure JWT issuer, audience and a random signing key of at least 32 bytes.");
        _key = new SymmetricSecurityKey(secret);
        _minutes = configuration.GetValue("Jwt:AccessTokenMinutes", 15);
        if (_minutes is < 5 or > 60) throw new InvalidOperationException("JWT lifetime must be between 5 and 60 minutes.");
    }

    public TokenValidationParameters ValidationParameters => new()
    {
        ValidateIssuer = true, ValidIssuer = _issuer,
        ValidateAudience = true, ValidAudience = _audience,
        ValidateLifetime = true, RequireExpirationTime = true,
        RequireSignedTokens = true, ValidateIssuerSigningKey = true,
        IssuerSigningKey = _key, ValidAlgorithms = [SecurityAlgorithms.HmacSha256],
        NameClaimType = "email", RoleClaimType = "role", ClockSkew = TimeSpan.FromSeconds(30)
    };

    public (string Token, DateTimeOffset ExpiresAt) Issue(UserRecord user)
    {
        var now = DateTimeOffset.UtcNow;
        var expiry = now.AddMinutes(_minutes);
        var claims = new List<Claim>
        {
            new("sub", user.Id.ToString()), new("person_id", user.PersonId.ToString()),
            new("email", user.Email), new("jti", Guid.NewGuid().ToString("N")),
            new("iat", now.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };
        claims.AddRange(user.Roles.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(role => new Claim("role", role)));
        var token = new JwtSecurityToken(_issuer, _audience, claims, now.UtcDateTime, expiry.UtcDateTime,
            new SigningCredentials(_key, SecurityAlgorithms.HmacSha256));
        return (new JwtSecurityTokenHandler().WriteToken(token), expiry);
    }
}
