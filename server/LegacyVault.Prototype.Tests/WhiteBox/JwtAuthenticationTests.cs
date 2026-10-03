using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using LegacyVault.Prototype.Infrastructure.Persistence;
using LegacyVault.Prototype.WebApi.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace LegacyVault.Prototype.Tests.WhiteBox;

public class JwtAuthenticationTests
{
    private static JwtTokenIssuer Issuer(string audience = "test-client", string issuer = "test-issuer", string key = "12345678901234567890123456789012") => new(new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["Jwt:Issuer"] = issuer, ["Jwt:Audience"] = audience,
            ["Jwt:SigningKeyBase64"] = Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(key))
        }).Build());

    [Fact]
    public void SignedToken_BindsAccountAndPerson_AndRejectsWrongTrustSettings()
    {
        var user = new UserRecord { Id = Guid.NewGuid(), PersonId = Guid.NewGuid(), Email = "test@example.com", Roles = "OWNER" };
        var issuer = Issuer(); var token = issuer.Issue(user);
        var handler = new JwtSecurityTokenHandler { MapInboundClaims = false };
        var principal = handler.ValidateToken(token.Token, issuer.ValidationParameters, out _);
        Assert.Equal(user.PersonId, CurrentPerson.Id(principal));
        Assert.Equal(user.Id.ToString(), principal.FindFirst("sub")!.Value);
        Assert.True(principal.IsInRole("OWNER"));
        Assert.ThrowsAny<SecurityTokenException>(() => handler.ValidateToken(token.Token, Issuer(audience: "other").ValidationParameters, out _));
        Assert.ThrowsAny<SecurityTokenException>(() => handler.ValidateToken(token.Token, Issuer(issuer: "other").ValidationParameters, out _));
        Assert.ThrowsAny<SecurityTokenException>(() => handler.ValidateToken(token.Token, Issuer(key: "different-key-12345678901234567890").ValidationParameters, out _));
        var expired = issuer.ValidationParameters;
        expired.LifetimeValidator = (_, expiry, _, _) => expiry > DateTime.UtcNow.AddHours(1);
        Assert.ThrowsAny<SecurityTokenException>(() => handler.ValidateToken(token.Token, expired, out _));
    }

    [Fact]
    public void MissingSigningKey_OrUnverifiedPerson_FailsClosed()
    {
        Assert.ThrowsAny<Exception>(() => new JwtTokenIssuer(new ConfigurationBuilder().Build()));
        Assert.Throws<UnauthorizedAccessException>(() => CurrentPerson.Id(new ClaimsPrincipal(new ClaimsIdentity([new Claim("person_id", Guid.NewGuid().ToString())]))));
    }
}
