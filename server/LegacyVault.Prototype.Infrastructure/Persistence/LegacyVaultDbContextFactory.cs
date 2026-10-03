using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LegacyVault.Prototype.Infrastructure.Persistence;

public class LegacyVaultDbContextFactory : IDesignTimeDbContextFactory<LegacyVaultDbContext>
{
    public LegacyVaultDbContext CreateDbContext(string[] args)
    {
        var connection = Environment.GetEnvironmentVariable("ConnectionStrings__LegacyVault")
            ?? throw new InvalidOperationException("Set ConnectionStrings__LegacyVault before running dotnet ef.");
        return new LegacyVaultDbContext(new DbContextOptionsBuilder<LegacyVaultDbContext>().UseSqlServer(connection).Options);
    }
}
