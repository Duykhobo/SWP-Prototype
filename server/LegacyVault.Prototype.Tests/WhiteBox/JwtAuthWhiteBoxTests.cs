using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LegacyVault.Prototype.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace LegacyVault.Prototype.Tests.WhiteBox;

public class JwtAuthWhiteBoxTests
{
    private const string Secret = "LegacyVault_Super_Secret_Key_For_Jwt_Token_Signing_2026_Minimum_256_Bits!";
    private const string Issuer = "LegacyVault.Identity";
    private const string Audience = "LegacyVault.ClientApp";

    private IConfiguration CreateConfig()
    {
        var dict = new Dictionary<string, string?>
        {
            ["Jwt:Secret"] = Secret,
            ["Jwt:Issuer"] = Issuer,
            ["Jwt:Audience"] = Audience,
            ["Jwt:ExpiryMinutes"] = "60"
        };
        return new ConfigurationBuilder().AddInMemoryCollection(dict).Build();
    }

    [Fact]
    public void GenerateToken_ProducesValidJwt_WithExpectedClaimsAndSignature()
    {
        // Arrange
        var config = CreateConfig();
        var jwtService = new JwtTokenService(config);

        var userId = Guid.NewGuid();
        var personId = Guid.NewGuid();
        var email = "nguyen.van.a@legacyvault.vn";
        var fullName = "Nguyễn Văn A";
        var roles = new[] { "OWNER", "BENEFICIARY" };

        // Act
        var token = jwtService.GenerateToken(userId, personId, email, fullName, roles, TimeSpan.FromHours(2));

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);

        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParams = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = Issuer,
            ValidateAudience = true,
            ValidAudience = Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };

        var principal = tokenHandler.ValidateToken(token, validationParams, out var validatedToken);
        Assert.NotNull(validatedToken);

        Assert.Equal(userId.ToString(), principal.FindFirstValue(ClaimTypes.NameIdentifier));
        Assert.Equal(personId.ToString(), principal.FindFirstValue("person_id"));
        Assert.Equal(email, principal.FindFirstValue(ClaimTypes.Email));
        Assert.Equal(fullName, principal.FindFirstValue(ClaimTypes.Name));

        var roleClaims = principal.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList();
        Assert.Contains("OWNER", roleClaims);
        Assert.Contains("BENEFICIARY", roleClaims);
    }

    [Fact]
    public void ValidateToken_WithTamperedSignature_ThrowsException()
    {
        // Arrange
        var config = CreateConfig();
        var jwtService = new JwtTokenService(config);
        var token = jwtService.GenerateToken(Guid.NewGuid(), Guid.NewGuid(), "test@test.vn", "Test", new[] { "OWNER" });

        // Tamper token payload or signature
        var parts = token.Split('.');
        var tamperedToken = $"{parts[0]}.{parts[1]}.tampered_signature_bits";

        var tokenHandler = new JwtSecurityTokenHandler();
        var validationParams = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = Issuer,
            ValidateAudience = true,
            ValidAudience = Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Secret)),
            ValidateLifetime = true
        };

        // Act & Assert
        Assert.ThrowsAny<SecurityTokenException>(() =>
            tokenHandler.ValidateToken(tamperedToken, validationParams, out _));
    }
}
