using Microsoft.EntityFrameworkCore;

namespace LegacyVault.Prototype.Infrastructure.Persistence;

public class LegacyVaultDbContext(DbContextOptions<LegacyVaultDbContext> options) : DbContext(options)
{
    public DbSet<PersonRecord> Persons => Set<PersonRecord>();
    public DbSet<UserRecord> Users => Set<UserRecord>();
    public DbSet<CaseRecord> Cases => Set<CaseRecord>();
    public DbSet<CaseBundleRecord> CaseBundles => Set<CaseBundleRecord>();
    public DbSet<CaseBundleItemRecord> CaseBundleItems => Set<CaseBundleItemRecord>();
    public DbSet<CaseBundleItemRecipientRecord> CaseBundleItemRecipients => Set<CaseBundleItemRecipientRecord>();
    public DbSet<BeneficiaryHandoverDecisionRecord> BeneficiaryHandoverDecisions => Set<BeneficiaryHandoverDecisionRecord>();
    public DbSet<RecipientAuthorizationRecord> RecipientAuthorizations => Set<RecipientAuthorizationRecord>();
    public DbSet<CommitmentRecord> Commitments => Set<CommitmentRecord>();
    public DbSet<AccessGrantRecord> AccessGrants => Set<AccessGrantRecord>();

    public DbSet<AccessGrantItemRecord> AccessGrantItems => Set<AccessGrantItemRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder) => CoreModelV1.Configure(modelBuilder);
}
