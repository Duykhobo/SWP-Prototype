using LegacyVault.Prototype.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LegacyVault.Prototype.Infrastructure.Persistence;

public class LegacyVaultDbContext : DbContext
{
    public LegacyVaultDbContext(DbContextOptions<LegacyVaultDbContext> options) : base(options)
    {
    }

    public DbSet<Person> Persons => Set<Person>();
    public DbSet<User> Users => Set<User>();
    public DbSet<OwnerVaultConfig> OwnerVaultConfigs => Set<OwnerVaultConfig>();
    public DbSet<Case> Cases => Set<Case>();
    public DbSet<CaseBundle> CaseBundles => Set<CaseBundle>();
    public DbSet<CaseBundleItem> CaseBundleItems => Set<CaseBundleItem>();
    public DbSet<BeneficiaryHandoverDecision> BeneficiaryHandoverDecisions => Set<BeneficiaryHandoverDecision>();
    public DbSet<Commitment> Commitments => Set<Commitment>();
    public DbSet<RecipientAuthorization> RecipientAuthorizations => Set<RecipientAuthorization>();
    public DbSet<AccessGrant> AccessGrants => Set<AccessGrant>();
    public DbSet<DownloadEvent> DownloadEvents => Set<DownloadEvent>();
    public DbSet<HandoverReceipt> HandoverReceipts => Set<HandoverReceipt>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Person & User (1:0..1)
        modelBuilder.Entity<Person>(b =>
        {
            b.HasKey(p => p.Id);
            b.HasIndex(p => p.Email).IsUnique();
            b.Property(p => p.FullName).HasMaxLength(200).IsRequired();
            b.Property(p => p.Email).HasMaxLength(256).IsRequired();
            b.Property(p => p.IdentityCard).HasMaxLength(50);
            b.Property(p => p.PhoneNumber).HasMaxLength(20);
        });

        modelBuilder.Entity<User>(b =>
        {
            b.HasKey(u => u.Id);
            b.HasIndex(u => u.Email).IsUnique();
            b.HasIndex(u => u.PersonId).IsUnique();
            b.Property(u => u.Email).HasMaxLength(256).IsRequired();
            b.Property(u => u.PasswordHash).HasMaxLength(500);
            b.Property(u => u.PasswordSalt).HasMaxLength(100);
            b.Property(u => u.Roles).HasMaxLength(200);
            b.Property(u => u.Status).HasMaxLength(50);

            b.HasOne(u => u.Person)
             .WithOne(p => p.User)
             .HasForeignKey<User>(u => u.PersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // OwnerVaultConfig
        modelBuilder.Entity<OwnerVaultConfig>(b =>
        {
            b.HasKey(v => v.Id);
            b.HasIndex(v => v.OwnerPersonId);
            b.Property(v => v.Title).HasMaxLength(200).IsRequired();
            b.Property(v => v.Status).HasMaxLength(50).IsRequired();
            b.Property(v => v.Tier).HasMaxLength(50).IsRequired();
        });

        // Case
        modelBuilder.Entity<Case>(b =>
        {
            b.HasKey(c => c.Id);
            b.HasIndex(c => c.VaultId);
            b.HasIndex(c => c.ExecutorPersonId);
            b.Property(c => c.Status).HasMaxLength(50).IsRequired();

            b.HasMany(c => c.CaseBundles)
             .WithOne(cb => cb.Case)
             .HasForeignKey(cb => cb.CaseId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // CaseBundle
        modelBuilder.Entity<CaseBundle>(b =>
        {
            b.HasKey(cb => cb.Id);
            b.HasIndex(cb => cb.CaseId);
            b.Property(cb => cb.Title).HasMaxLength(200).IsRequired();
            b.Property(cb => cb.RecipientMode).HasMaxLength(50).IsRequired();
            b.Property(cb => cb.NormalizedRecipientSet).HasMaxLength(500);
            b.Property(cb => cb.Status).HasMaxLength(50).IsRequired();
            b.Property(cb => cb.RowVersion).IsRowVersion();

            b.HasMany(cb => cb.Items)
             .WithOne(i => i.CaseBundle)
             .HasForeignKey(i => i.CaseBundleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasMany(cb => cb.Decisions)
             .WithOne(d => d.CaseBundle)
             .HasForeignKey(d => d.CaseBundleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasMany(cb => cb.Commitments)
             .WithOne(c => c.CaseBundle)
             .HasForeignKey(c => c.CaseBundleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasMany(cb => cb.AccessGrants)
             .WithOne(g => g.CaseBundle)
             .HasForeignKey(g => g.CaseBundleId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // CaseBundleItem (Snapshot Item)
        modelBuilder.Entity<CaseBundleItem>(b =>
        {
            b.HasKey(i => i.Id);
            b.HasIndex(i => new { i.CaseBundleId, i.AssetId }).IsUnique();
            b.Property(i => i.Title).HasMaxLength(200).IsRequired();
            b.Property(i => i.MimeType).HasMaxLength(100);
            b.Property(i => i.CiphertextHash).HasMaxLength(64);
            b.Property(i => i.CiphertextStorageKey).HasMaxLength(500);
        });

        // BeneficiaryHandoverDecision
        modelBuilder.Entity<BeneficiaryHandoverDecision>(b =>
        {
            b.HasKey(d => d.Id);
            b.HasIndex(d => new { d.CaseBundleId, d.RecipientPersonId }).IsUnique();
            b.Property(d => d.DecisionStatus).HasMaxLength(50).IsRequired();

            b.HasOne(d => d.Commitment)
             .WithMany(c => c.Decisions)
             .HasForeignKey(d => d.CommitmentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // Commitment
        modelBuilder.Entity<Commitment>(b =>
        {
            b.HasKey(c => c.Id);
            b.HasIndex(c => c.CaseBundleId);
            b.HasIndex(c => c.CaseId);
            b.Property(c => c.PolicyMode).HasMaxLength(50).IsRequired();
            b.Property(c => c.ClientIpAddress).HasMaxLength(45);
            b.Property(c => c.UserAgent).HasMaxLength(500);
        });

        // RecipientAuthorization
        modelBuilder.Entity<RecipientAuthorization>(b =>
        {
            b.HasKey(r => r.Id);
            b.HasIndex(r => new { r.CaseBundleId, r.BeneficiaryPersonId });
            b.Property(r => r.Notes).HasMaxLength(500);
        });

        // AccessGrant
        modelBuilder.Entity<AccessGrant>(b =>
        {
            b.HasKey(g => g.Id);
            b.HasIndex(g => g.DownloadToken).IsUnique();
            // Unique constraint chống cấp trùng Grant cho cùng người nhận và cùng cam kết
            b.HasIndex(g => new { g.CaseBundleId, g.RecipientPersonId, g.CommitmentId }).IsUnique();
            b.Property(g => g.Status).HasMaxLength(50).IsRequired();
            b.Property(g => g.DownloadToken).HasMaxLength(64).IsRequired();

            b.HasOne(g => g.Commitment)
             .WithMany(c => c.AccessGrants)
             .HasForeignKey(g => g.CommitmentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // DownloadEvent
        modelBuilder.Entity<DownloadEvent>(b =>
        {
            b.HasKey(e => e.Id);
            b.HasIndex(e => e.AccessGrantId);
            b.Property(e => e.ClientIpAddress).HasMaxLength(45);
            b.Property(e => e.UserAgent).HasMaxLength(500);

            b.HasOne(e => e.AccessGrant)
             .WithMany(g => g.DownloadEvents)
             .HasForeignKey(e => e.AccessGrantId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // HandoverReceipt
        modelBuilder.Entity<HandoverReceipt>(b =>
        {
            b.HasKey(r => r.ReceiptId);
            b.HasIndex(r => r.ReceiptNumber).IsUnique();
            b.HasIndex(r => r.AccessGrantId).IsUnique();
            b.Property(r => r.ReceiptNumber).HasMaxLength(60).IsRequired();
            b.Property(r => r.SignatureType).HasMaxLength(50).IsRequired();
            b.Property(r => r.SignatureHash).HasMaxLength(64);
            b.Property(r => r.ReceiptContentHash).HasMaxLength(64);
            b.Property(r => r.ReceiptAuditDigest).HasMaxLength(128);

            b.HasOne(r => r.AccessGrant)
             .WithOne(g => g.HandoverReceipt)
             .HasForeignKey<HandoverReceipt>(r => r.AccessGrantId)
             .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
