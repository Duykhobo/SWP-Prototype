using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;

namespace LegacyVault.Prototype.Infrastructure.Persistence.Migrations;

[DbContext(typeof(LegacyVaultDbContext))]
public class LegacyVaultDbContextModelSnapshot : ModelSnapshot
{
    protected override void BuildModel(ModelBuilder b)
    {
        b.HasAnnotation("ProductVersion", "8.0.29");
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.PersonRecord", e =>
        {
            e.Property<Guid>("Id").ValueGeneratedNever().HasColumnType("uniqueidentifier");
            e.Property<string>("FullName").IsRequired().HasMaxLength(200).HasColumnType("nvarchar(200)");
            e.Property<string>("Phone").HasMaxLength(30).HasColumnType("nvarchar(30)");
            e.Property<DateTimeOffset>("CreatedAt").HasColumnType("datetimeoffset");
            e.HasKey("Id");
            e.ToTable("Persons");
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.UserRecord", e =>
        {
            e.Property<Guid>("Id").ValueGeneratedNever().HasColumnType("uniqueidentifier");
            e.Property<Guid>("PersonId").HasColumnType("uniqueidentifier");
            e.Property<string>("Email").IsRequired().HasMaxLength(320).HasColumnType("nvarchar(320)");
            e.Property<string>("NormalizedEmail").IsRequired().HasMaxLength(320).HasColumnType("nvarchar(320)");
            e.Property<string>("PasswordHash").HasMaxLength(1000).HasColumnType("nvarchar(1000)");
            e.Property<string>("GoogleSubject").HasMaxLength(255).HasColumnType("nvarchar(255)");
            e.Property<string>("Roles").IsRequired().HasMaxLength(200).HasColumnType("nvarchar(200)");
            e.Property<bool>("IsDisabled").HasColumnType("bit");
            e.Property<bool>("IsDemo").HasColumnType("bit");
            e.Property<DateTimeOffset>("CreatedAt").HasColumnType("datetimeoffset");
            e.HasKey("Id");
            e.HasIndex("NormalizedEmail").IsUnique();
            e.HasIndex("GoogleSubject").IsUnique().HasFilter("[GoogleSubject] IS NOT NULL");
            e.HasIndex("PersonId").IsUnique();
            e.ToTable("Users");
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.CaseRecord", e =>
        {
            e.Property<Guid>("Id").ValueGeneratedNever().HasColumnType("uniqueidentifier");
            e.Property<Guid>("OwnerPersonId").HasColumnType("uniqueidentifier");
            e.Property<Guid>("ExecutorPersonId").HasColumnType("uniqueidentifier");
            e.Property<string>("Status").IsRequired().HasMaxLength(30).HasColumnType("nvarchar(30)");
            e.Property<DateTimeOffset?>("SubmittedAt").HasColumnType("datetimeoffset");
            e.Property<bool>("RescueHold").HasColumnType("bit");
            e.Property<bool>("SecurityHold").HasColumnType("bit");
            e.Property<bool>("LegalHold").HasColumnType("bit");
            e.Property<byte[]>("RowVersion").IsRequired().IsConcurrencyToken().ValueGeneratedOnAddOrUpdate().HasColumnType("rowversion");
            e.HasKey("Id");
            e.HasIndex("OwnerPersonId");
            e.HasIndex("ExecutorPersonId");
            e.ToTable("Cases");
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleRecord", e =>
        {
            e.Property<Guid>("Id").ValueGeneratedNever().HasColumnType("uniqueidentifier");
            e.Property<Guid>("CaseId").HasColumnType("uniqueidentifier");
            e.Property<string>("Name").IsRequired().HasMaxLength(200).HasColumnType("nvarchar(200)");
            e.Property<string>("GroupPolicy").IsRequired().HasMaxLength(30).HasColumnType("nvarchar(30)");
            e.Property<DateTimeOffset?>("SnapshottedAt").HasColumnType("datetimeoffset");
            e.Property<DateTimeOffset?>("HandoverNotBefore").HasColumnType("datetimeoffset");
            e.Property<byte[]>("RowVersion").IsRequired().IsConcurrencyToken().ValueGeneratedOnAddOrUpdate().HasColumnType("rowversion");
            e.HasKey("Id");
            e.HasIndex("CaseId");
            e.ToTable("CaseBundles");
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleItemRecord", e =>
        {
            e.Property<Guid>("Id").ValueGeneratedNever().HasColumnType("uniqueidentifier");
            e.Property<Guid>("CaseBundleId").HasColumnType("uniqueidentifier");
            e.Property<Guid>("AssetId").HasColumnType("uniqueidentifier");
            e.Property<Guid>("ContentVersionId").HasColumnType("uniqueidentifier");
            e.Property<Guid>("DesignationVersionId").HasColumnType("uniqueidentifier");
            e.HasKey("Id");
            e.HasIndex("CaseBundleId", "AssetId").IsUnique();
            e.ToTable("CaseBundleItems");
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleItemRecipientRecord", e =>
        {
            e.Property<Guid>("CaseBundleItemId").HasColumnType("uniqueidentifier");
            e.Property<Guid>("RecipientPersonId").HasColumnType("uniqueidentifier");
            e.HasKey("CaseBundleItemId", "RecipientPersonId");
            e.HasIndex("RecipientPersonId");
            e.ToTable("CaseBundleItemRecipients");
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.CommitmentRecord", e =>
        {
            e.Property<Guid>("Id").ValueGeneratedNever().HasColumnType("uniqueidentifier");
            e.Property<Guid>("CaseBundleId").HasColumnType("uniqueidentifier");
            e.Property<DateTimeOffset>("CommittedAt").HasColumnType("datetimeoffset");
            e.Property<byte[]>("RowVersion").IsRequired().IsConcurrencyToken().ValueGeneratedOnAddOrUpdate().HasColumnType("rowversion");
            e.HasKey("Id");
            e.HasAlternateKey("CaseBundleId", "Id");
            e.ToTable("Commitments");
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.BeneficiaryHandoverDecisionRecord", e =>
        {
            e.Property<Guid>("Id").ValueGeneratedNever().HasColumnType("uniqueidentifier");
            e.Property<Guid>("CaseBundleId").HasColumnType("uniqueidentifier");
            e.Property<Guid>("RecipientPersonId").HasColumnType("uniqueidentifier");
            e.Property<string>("DecisionStatus").IsRequired().HasMaxLength(30).HasColumnType("nvarchar(30)");
            e.Property<DateTimeOffset>("DecidedAt").HasColumnType("datetimeoffset");
            e.Property<Guid?>("CommitmentId").HasColumnType("uniqueidentifier");
            e.HasKey("Id");
            e.HasIndex("CaseBundleId", "RecipientPersonId").IsUnique();
            e.HasIndex("CaseBundleId", "CommitmentId");
            e.HasIndex("RecipientPersonId");
            e.ToTable("BeneficiaryHandoverDecisions");
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.RecipientAuthorizationRecord", e =>
        {
            e.Property<Guid>("Id").ValueGeneratedNever().HasColumnType("uniqueidentifier");
            e.Property<Guid>("CaseBundleId").HasColumnType("uniqueidentifier");
            e.Property<Guid>("RecipientPersonId").HasColumnType("uniqueidentifier");
            e.Property<Guid>("ExecutorPersonId").HasColumnType("uniqueidentifier");
            e.Property<Guid>("EvidenceId").HasColumnType("uniqueidentifier");
            e.Property<DateTimeOffset>("AuthorizedAt").HasColumnType("datetimeoffset");
            e.HasKey("Id");
            e.HasIndex("CaseBundleId", "RecipientPersonId").IsUnique();
            e.HasIndex("RecipientPersonId");
            e.HasIndex("ExecutorPersonId");
            e.ToTable("RecipientAuthorizations");
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.AccessGrantRecord", e =>
        {
            e.Property<Guid>("Id").ValueGeneratedNever().HasColumnType("uniqueidentifier");
            e.Property<Guid>("CaseBundleId").HasColumnType("uniqueidentifier");
            e.Property<Guid>("RecipientPersonId").HasColumnType("uniqueidentifier");
            e.Property<Guid>("CommitmentId").HasColumnType("uniqueidentifier");
            e.Property<string>("Status").IsRequired().HasMaxLength(30).HasColumnType("nvarchar(30)");
            e.Property<DateTimeOffset>("IssuedAt").HasColumnType("datetimeoffset");
            e.Property<DateTimeOffset>("ExpiresAt").HasColumnType("datetimeoffset");
            e.Property<string>("DownloadTokenHash").IsRequired().HasMaxLength(64).IsUnicode(false).HasColumnType("varchar(64)");
            e.Property<byte[]>("RowVersion").IsRequired().IsConcurrencyToken().ValueGeneratedOnAddOrUpdate().HasColumnType("rowversion");
            e.HasKey("Id");
            e.HasIndex("CaseBundleId", "RecipientPersonId", "CommitmentId").IsUnique();
            e.HasIndex("CaseBundleId", "CommitmentId");
            e.HasIndex("RecipientPersonId");
            e.HasIndex("DownloadTokenHash").IsUnique();
            e.ToTable("AccessGrants");
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.UserRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.PersonRecord", "Person").WithOne().HasForeignKey("LegacyVault.Prototype.Infrastructure.Persistence.UserRecord", "PersonId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.CaseRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.PersonRecord", null).WithMany().HasForeignKey("OwnerPersonId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.CaseRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.PersonRecord", null).WithMany().HasForeignKey("ExecutorPersonId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.CaseRecord", "Case").WithMany().HasForeignKey("CaseId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleItemRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleRecord", "CaseBundle").WithMany().HasForeignKey("CaseBundleId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleItemRecipientRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleItemRecord", "CaseBundleItem").WithMany().HasForeignKey("CaseBundleItemId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleItemRecipientRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.PersonRecord", null).WithMany().HasForeignKey("RecipientPersonId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.CommitmentRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleRecord", null).WithMany().HasForeignKey("CaseBundleId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.BeneficiaryHandoverDecisionRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleRecord", null).WithMany().HasForeignKey("CaseBundleId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.BeneficiaryHandoverDecisionRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.PersonRecord", null).WithMany().HasForeignKey("RecipientPersonId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.RecipientAuthorizationRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleRecord", null).WithMany().HasForeignKey("CaseBundleId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.RecipientAuthorizationRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.PersonRecord", null).WithMany().HasForeignKey("RecipientPersonId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.AccessGrantRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.CaseBundleRecord", null).WithMany().HasForeignKey("CaseBundleId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.AccessGrantRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.PersonRecord", null).WithMany().HasForeignKey("RecipientPersonId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.RecipientAuthorizationRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.PersonRecord", null).WithMany().HasForeignKey("ExecutorPersonId").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.BeneficiaryHandoverDecisionRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.CommitmentRecord", null).WithMany().HasForeignKey("CaseBundleId", "CommitmentId").HasPrincipalKey("CaseBundleId", "Id").OnDelete(DeleteBehavior.Restrict);
        });
        b.Entity("LegacyVault.Prototype.Infrastructure.Persistence.AccessGrantRecord", e =>
        {
            e.HasOne("LegacyVault.Prototype.Infrastructure.Persistence.CommitmentRecord", null).WithMany().HasForeignKey("CaseBundleId", "CommitmentId").HasPrincipalKey("CaseBundleId", "Id").OnDelete(DeleteBehavior.Restrict).IsRequired();
        });
    }
}
