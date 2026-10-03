using Microsoft.EntityFrameworkCore;

namespace LegacyVault.Prototype.Infrastructure.Persistence;

// Initial core mappings. Generate a new migration whenever these mappings change.
internal static class CoreModelV1
{
    public static void Configure(ModelBuilder b)
    {
        b.HasAnnotation("ProductVersion", "8.0.29");
        b.Entity<PersonRecord>(e =>
        {
            e.ToTable("Persons"); e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.FullName).HasMaxLength(200);
            e.Property(x => x.Phone).HasMaxLength(30);
        });
        b.Entity<UserRecord>(e =>
        {
            e.ToTable("Users"); e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.Email).HasMaxLength(320);
            e.Property(x => x.NormalizedEmail).HasMaxLength(320);
            e.Property(x => x.PasswordHash).HasMaxLength(1000);
            e.Property(x => x.GoogleSubject).HasMaxLength(255);
            e.Property(x => x.Roles).HasMaxLength(200);
            e.HasIndex(x => x.NormalizedEmail).IsUnique();
            e.HasIndex(x => x.GoogleSubject).IsUnique().HasFilter("[GoogleSubject] IS NOT NULL");
            e.HasOne(x => x.Person).WithOne().HasForeignKey<UserRecord>(x => x.PersonId).OnDelete(DeleteBehavior.Restrict);
        });
        b.Entity<CaseRecord>(e =>
        {
            e.ToTable("Cases"); e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.Status).HasMaxLength(30);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.HasOne<PersonRecord>().WithMany().HasForeignKey(x => x.OwnerPersonId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<PersonRecord>().WithMany().HasForeignKey(x => x.ExecutorPersonId).OnDelete(DeleteBehavior.Restrict);
        });
        b.Entity<CaseBundleRecord>(e =>
        {
            e.ToTable("CaseBundles"); e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.Name).HasMaxLength(200);
            e.Property(x => x.GroupPolicy).HasMaxLength(30);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.HasOne(x => x.Case).WithMany().HasForeignKey(x => x.CaseId).OnDelete(DeleteBehavior.Restrict);
        });
        b.Entity<CaseBundleItemRecord>(e =>
        {
            e.ToTable("CaseBundleItems"); e.HasKey(x => x.Id);
            e.HasAlternateKey(x => new { x.CaseBundleId, x.Id });
            e.Property(x => x.Id).ValueGeneratedNever();
            e.HasIndex(x => new { x.CaseBundleId, x.AssetId }).IsUnique();
            e.HasOne(x => x.CaseBundle).WithMany().HasForeignKey(x => x.CaseBundleId).OnDelete(DeleteBehavior.Restrict);
        });
        b.Entity<CaseBundleItemRecipientRecord>(e =>
        {
            e.ToTable("CaseBundleItemRecipients");
            e.HasKey(x => new { x.CaseBundleItemId, x.RecipientPersonId });
            e.HasAlternateKey(x => new { x.CaseBundleId, x.CaseBundleItemId, x.RecipientPersonId });
            e.HasOne(x => x.CaseBundleItem).WithMany().HasForeignKey(x => new { x.CaseBundleId, x.CaseBundleItemId })
                .HasPrincipalKey(x => new { x.CaseBundleId, x.Id }).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<PersonRecord>().WithMany().HasForeignKey(x => x.RecipientPersonId).OnDelete(DeleteBehavior.Restrict);
        });
        b.Entity<CommitmentRecord>(e =>
        {
            e.ToTable("Commitments"); e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedNever();
            e.HasAlternateKey(x => new { x.CaseBundleId, x.Id });
            e.Property(x => x.RowVersion).IsRowVersion();
            e.HasOne<CaseBundleRecord>().WithMany().HasForeignKey(x => x.CaseBundleId).OnDelete(DeleteBehavior.Restrict);
        });
        b.Entity<BeneficiaryHandoverDecisionRecord>(e =>
        {
            e.ToTable("BeneficiaryHandoverDecisions"); e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.DecisionStatus).HasMaxLength(30);
            e.HasIndex(x => new { x.CaseBundleId, x.RecipientPersonId }).IsUnique();
            e.HasOne<CaseBundleRecord>().WithMany().HasForeignKey(x => x.CaseBundleId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<PersonRecord>().WithMany().HasForeignKey(x => x.RecipientPersonId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<CommitmentRecord>().WithMany().HasForeignKey(x => new { x.CaseBundleId, x.CommitmentId })
                .HasPrincipalKey(x => new { x.CaseBundleId, x.Id }).OnDelete(DeleteBehavior.Restrict);
        });
        b.Entity<RecipientAuthorizationRecord>(e =>
        {
            e.ToTable("RecipientAuthorizations"); e.HasKey(x => x.Id);
            e.Property(x => x.Id).ValueGeneratedNever();
            e.HasIndex(x => new { x.CaseBundleId, x.RecipientPersonId }).IsUnique();
            e.HasOne<CaseBundleRecord>().WithMany().HasForeignKey(x => x.CaseBundleId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<PersonRecord>().WithMany().HasForeignKey(x => x.RecipientPersonId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<PersonRecord>().WithMany().HasForeignKey(x => x.ExecutorPersonId).OnDelete(DeleteBehavior.Restrict);
        });
        b.Entity<AccessGrantRecord>(e =>
        {
            e.ToTable("AccessGrants"); e.HasKey(x => x.Id);
            e.HasAlternateKey(x => new { x.CaseBundleId, x.Id, x.RecipientPersonId });
            e.Property(x => x.Id).ValueGeneratedNever();
            e.Property(x => x.Status).HasMaxLength(30);
            e.Property(x => x.DownloadTokenHash).HasMaxLength(64).IsUnicode(false);
            e.Property(x => x.RowVersion).IsRowVersion();
            e.HasIndex(x => new { x.CaseBundleId, x.RecipientPersonId, x.CommitmentId }).IsUnique();
            e.HasIndex(x => x.DownloadTokenHash).IsUnique();
            e.HasOne<CaseBundleRecord>().WithMany().HasForeignKey(x => x.CaseBundleId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<PersonRecord>().WithMany().HasForeignKey(x => x.RecipientPersonId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<CommitmentRecord>().WithMany().HasForeignKey(x => new { x.CaseBundleId, x.CommitmentId })
                .HasPrincipalKey(x => new { x.CaseBundleId, x.Id }).OnDelete(DeleteBehavior.Restrict);
        });
        b.Entity<AccessGrantItemRecord>(e =>
        {
            e.ToTable("AccessGrantItems");
            e.HasKey(x => new { x.AccessGrantId, x.CaseBundleItemId });
            e.HasOne<AccessGrantRecord>().WithMany().HasForeignKey(x => new { x.CaseBundleId, x.AccessGrantId, x.RecipientPersonId })
                .HasPrincipalKey(x => new { x.CaseBundleId, x.Id, x.RecipientPersonId }).OnDelete(DeleteBehavior.Restrict);
            e.HasOne<CaseBundleItemRecipientRecord>().WithMany().HasForeignKey(x => new { x.CaseBundleId, x.CaseBundleItemId, x.RecipientPersonId })
                .HasPrincipalKey(x => new { x.CaseBundleId, x.CaseBundleItemId, x.RecipientPersonId }).OnDelete(DeleteBehavior.Restrict);
        });
    }
}
