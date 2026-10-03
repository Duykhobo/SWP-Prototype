using System.Security.Claims;

namespace LegacyVault.Prototype.WebApi.Security;

public static class CurrentPerson
{
    public static Guid Id(ClaimsPrincipal user)
    {
        if (user.Identity?.IsAuthenticated == true && Guid.TryParse(user.FindFirst("person_id")?.Value, out var id) && id != Guid.Empty)
            return id;
        throw new UnauthorizedAccessException("A verified person_id claim is required.");
    }
}
