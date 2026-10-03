using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using LegacyVault.Prototype.Infrastructure.Persistence;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;

namespace LegacyVault.Prototype.Tests.Integration;

// CI supplies a disposable SQL Server database, not EF's in-memory provider.
[CollectionDefinition("SQL Server", DisableParallelization = true)]
public class SqlServerCollection : ICollectionFixture<SqlServerFixture> { }

public sealed class SqlServerFixture : IAsyncLifetime
{
    public LegacyVaultDbContext CreateContext() => new(new DbContextOptionsBuilder<LegacyVaultDbContext>()
        .UseSqlServer(Environment.GetEnvironmentVariable("ConnectionStrings__LegacyVault")
            ?? throw new InvalidOperationException("Integration tests require ConnectionStrings__LegacyVault pointing to a disposable SQL Server database.")).Options);
    public async Task InitializeAsync()
    {
        await using var db = CreateContext();
        await db.Database.MigrateAsync();
    }
    public Task DisposeAsync() => Task.CompletedTask;
}

[Collection("SQL Server")]
public class IdentityPersistenceTests(SqlServerFixture fixture)
{
    [Fact]
    public async Task RegisterAndLogin_SurviveNewHost_AndRejectForgedIdentity()
    {
        var email = $"identity-{Guid.NewGuid():N}@example.com";
        string token; Guid personId;
        using (var host = new WebApplicationFactory<Program>())
        using (var client = host.CreateClient())
        {
            var register = await client.PostAsJsonAsync("/api/v1/auth/register", new { email, password = "Long-Test-Password!", fullName = "Persistence test", role = "ADMIN", personId = Guid.NewGuid() });
            Assert.Equal(HttpStatusCode.OK, register.StatusCode);
            var body = await register.Content.ReadFromJsonAsync<JsonElement>();
            token = body.GetProperty("accessToken").GetString()!;
            personId = body.GetProperty("user").GetProperty("personId").GetGuid();
            Assert.DoesNotContain("ADMIN", body.GetProperty("user").GetProperty("roles").EnumerateArray().Select(x => x.GetString()));
            var duplicate = await client.PostAsJsonAsync("/api/v1/auth/register", new { email = "  " + email.ToUpperInvariant() + "  ", password = "Long-Test-Password!" });
            Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/payment/orders?personId=" + personId)).StatusCode);
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", "jwt_demo_owner_fake");
            Assert.Equal(HttpStatusCode.Unauthorized, (await client.GetAsync("/api/v1/payment/orders")).StatusCode);
        }
        using var nextHost = new WebApplicationFactory<Program>();
        using var nextClient = nextHost.CreateClient();
        var login = await nextClient.PostAsJsonAsync("/api/v1/auth/password-login", new { email, password = "Long-Test-Password!" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var result = await login.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal(personId, result.GetProperty("user").GetProperty("personId").GetGuid());
        nextClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        Assert.Equal(HttpStatusCode.OK, (await nextClient.GetAsync("/api/v1/payment/orders")).StatusCode);
        await using var db = fixture.CreateContext();
        var account = await db.Users.SingleAsync(x => x.NormalizedEmail == email.ToUpperInvariant());
        Assert.NotEqual("Long-Test-Password!", account.PasswordHash);
        account.IsDisabled = true; await db.SaveChangesAsync();
        Assert.Equal(HttpStatusCode.Unauthorized, (await nextClient.GetAsync("/api/v1/payment/orders")).StatusCode);
    }

    [Fact]
    public async Task DemoAndLegacyControllers_AreDisabledByDefault()
    {
        using var host = new WebApplicationFactory<Program>(); using var client = host.CreateClient();
        Assert.Equal(HttpStatusCode.NotFound, (await client.PostAsJsonAsync("/api/v1/auth/demo-login", new { role = "ADMIN" })).StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, (await client.GetAsync("/api/case-bundles/guest/arbitrary-token")).StatusCode);
    }

    [Fact]
    public async Task InitialMigration_MatchesModel_AndBundlesRemainIndependent()
    {
        await using var db = fixture.CreateContext();
        Assert.False(db.Database.HasPendingModelChanges());
        var person = new PersonRecord { Id = Guid.NewGuid(), FullName = "Owner" };
        var executor = new PersonRecord { Id = Guid.NewGuid(), FullName = "Executor" };
        var legalCase = new CaseRecord { Id = Guid.NewGuid(), OwnerPersonId = person.Id, ExecutorPersonId = executor.Id };
        var a = new CaseBundleRecord { Id = Guid.NewGuid(), Case = legalCase, CaseId = legalCase.Id, Name = "A" };
        var b = new CaseBundleRecord { Id = Guid.NewGuid(), Case = legalCase, CaseId = legalCase.Id, Name = "B" };
        db.AddRange(person, executor, legalCase, a, b); await db.SaveChangesAsync();
        Assert.NotEmpty(a.RowVersion);
        Assert.Equal(2, await db.CaseBundles.CountAsync(x => x.CaseId == legalCase.Id));
        var commitment = new CommitmentRecord { Id = Guid.NewGuid(), CaseBundleId = a.Id, CommittedAt = DateTimeOffset.UtcNow };
        db.Commitments.Add(commitment); await db.SaveChangesAsync();
        db.AccessGrants.Add(new AccessGrantRecord { Id = Guid.NewGuid(), CaseBundleId = b.Id, RecipientPersonId = person.Id, CommitmentId = commitment.Id,
            IssuedAt = DateTimeOffset.UtcNow, ExpiresAt = DateTimeOffset.UtcNow.AddHours(72), DownloadTokenHash = new string('a', 64) });
        // A commitment in bundle A cannot issue a grant in bundle B.
        await Assert.ThrowsAsync<DbUpdateException>(() => db.SaveChangesAsync());
    }
}
