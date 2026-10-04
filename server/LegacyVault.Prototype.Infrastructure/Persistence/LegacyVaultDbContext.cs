using LegacyVault.Prototype.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace LegacyVault.Prototype.Infrastructure.Persistence;

public class LegacyVaultDbContext : DbContext
{
    public LegacyVaultDbContext(DbContextOptions<LegacyVaultDbContext> options) : base(options)
    {
    }

    // 1. Danh tính & Vai trò
    public DbSet<Person> Persons => Set<Person>();
    public DbSet<User> Users => Set<User>();
    public DbSet<StaffRole> StaffRoles => Set<StaffRole>();

    // 2. Kho nguồn, Tài sản & Thi hành
    public DbSet<OwnerVaultConfig> OwnerVaultConfigs => Set<OwnerVaultConfig>();
    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<ContentVersion> ContentVersions => Set<ContentVersion>();
    public DbSet<ExecutorAssignment> ExecutorAssignments => Set<ExecutorAssignment>();

    // 3. Kế hoạch di sản, Phiên bản & Gói
    public DbSet<EstatePlan> EstatePlans => Set<EstatePlan>();
    public DbSet<EstatePlanVersion> EstatePlanVersions => Set<EstatePlanVersion>();
    public DbSet<Bundle> Bundles => Set<Bundle>();
    public DbSet<BundleAsset> BundleAssets => Set<BundleAsset>();
    public DbSet<HandoverPolicy> HandoverPolicies => Set<HandoverPolicy>();
    public DbSet<AssetDesignationVersion> AssetDesignationVersions => Set<AssetDesignationVersion>();

    // 4. Giám sát sinh tồn (DMS)
    public DbSet<DmsPolicy> DmsPolicies => Set<DmsPolicy>();
    public DbSet<DmsCycle> DmsCycles => Set<DmsCycle>();
    public DbSet<DmsNotice> DmsNotices => Set<DmsNotice>();

    // 5. Hồ sơ di sản, Thẩm định, Phong tỏa & Kiểm toán
    public DbSet<Case> Cases => Set<Case>();
    public DbSet<DeathCertificate> DeathCertificates => Set<DeathCertificate>();
    public DbSet<CaseAssignment> CaseAssignments => Set<CaseAssignment>();
    public DbSet<VerificationDecision> VerificationDecisions => Set<VerificationDecision>();
    public DbSet<Hold> Holds => Set<Hold>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    // 6. Snapshot bàn giao, Lịch hẹn & Phiên làm việc
    public DbSet<CaseBundle> CaseBundles => Set<CaseBundle>();
    public DbSet<CaseBundleItem> CaseBundleItems => Set<CaseBundleItem>();
    public DbSet<HandoverSchedule> HandoverSchedules => Set<HandoverSchedule>();
    public DbSet<ScheduleParticipant> ScheduleParticipants => Set<ScheduleParticipant>();
    public DbSet<HandoverNotice> HandoverNotices => Set<HandoverNotice>();
    public DbSet<WorkSession> WorkSessions => Set<WorkSession>();
    public DbSet<SessionParticipant> SessionParticipants => Set<SessionParticipant>();
    public DbSet<RecipientAuthorization> RecipientAuthorizations => Set<RecipientAuthorization>();

    // 7. Đồng thuận, Cấp quyền, Tải về & Kho cá nhân
    public DbSet<BeneficiaryHandoverDecision> BeneficiaryHandoverDecisions => Set<BeneficiaryHandoverDecision>();
    public DbSet<Commitment> Commitments => Set<Commitment>();
    public DbSet<AccessGrant> AccessGrants => Set<AccessGrant>();
    public DbSet<AccessGrantAsset> AccessGrantAssets => Set<AccessGrantAsset>();
    public DbSet<DownloadEvent> DownloadEvents => Set<DownloadEvent>();
    public DbSet<HandoverReceipt> HandoverReceipts => Set<HandoverReceipt>();
    public DbSet<PersonalVault> PersonalVaults => Set<PersonalVault>();
    public DbSet<PersonalVaultItem> PersonalVaultItems => Set<PersonalVaultItem>();

    // 8. Bảng giá, Thuê bao & Thanh toán
    public DbSet<SubscriptionPlan> SubscriptionPlans => Set<SubscriptionPlan>();
    public DbSet<VaultSubscription> VaultSubscriptions => Set<VaultSubscription>();
    public DbSet<PaymentOrderDb> PaymentOrders => Set<PaymentOrderDb>();
    public DbSet<PaymentTransaction> PaymentTransactions => Set<PaymentTransaction>();
    public DbSet<PaymentReceipt> PaymentReceipts => Set<PaymentReceipt>();
    public DbSet<IdempotencyRecordDb> IdempotencyRecords => Set<IdempotencyRecordDb>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // =========================================================================
        // 1. DANH TÍNH CỐT LÕI & VAI TRÒ
        // =========================================================================
        modelBuilder.Entity<Person>(b =>
        {
            b.ToTable("PERSONS");
            b.HasKey(p => p.Id);
            b.HasIndex(p => p.Email).IsUnique();
            b.Property(p => p.FullName).HasMaxLength(200).IsRequired();
            b.Property(p => p.Email).HasMaxLength(256).IsRequired();
            b.Property(p => p.IdentityCard).HasMaxLength(50);
            b.Property(p => p.PhoneNumber).HasMaxLength(20);
        });

        modelBuilder.Entity<User>(b =>
        {
            b.ToTable("USERS");
            b.HasKey(u => u.Id);
            b.HasIndex(u => u.Email).IsUnique();
            b.HasIndex(u => u.PersonId).IsUnique();
            b.Property(u => u.Email).HasMaxLength(256).IsRequired();
            b.Property(u => u.PasswordHash).HasMaxLength(500);
            b.Property(u => u.PasswordSalt).HasMaxLength(100);
            b.Property(u => u.OidcSubject).HasMaxLength(256);
            b.Property(u => u.Roles).HasMaxLength(200);
            b.Property(u => u.Status).HasMaxLength(50);

            b.HasOne(u => u.Person)
             .WithOne(p => p.User)
             .HasForeignKey<User>(u => u.PersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<StaffRole>(b =>
        {
            b.ToTable("STAFF_ROLES");
            b.HasKey(sr => sr.Id);
            b.HasIndex(sr => sr.UserId);
            b.Property(sr => sr.RoleCode).HasMaxLength(50).IsRequired();

            b.HasOne(sr => sr.User)
             .WithMany(u => u.StaffRoles)
             .HasForeignKey(sr => sr.UserId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        // =========================================================================
        // 2. KHO NGUỒN, TÀI SẢN & THI HÀNH
        // =========================================================================
        modelBuilder.Entity<OwnerVaultConfig>(b =>
        {
            b.ToTable("OWNER_VAULTS");
            b.HasKey(v => v.Id);
            b.HasIndex(v => v.OwnerPersonId).IsUnique();
            b.Property(v => v.Title).HasMaxLength(200).IsRequired();
            b.Property(v => v.Status).HasMaxLength(50).IsRequired();
            b.Property(v => v.Tier).HasMaxLength(50).IsRequired();

            b.HasOne(v => v.OwnerPerson)
             .WithOne(p => p.OwnerVault)
             .HasForeignKey<OwnerVaultConfig>(v => v.OwnerPersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Asset>(b =>
        {
            b.ToTable("ASSETS");
            b.HasKey(a => a.Id);
            b.HasIndex(a => a.VaultId);
            b.Property(a => a.Title).HasMaxLength(200).IsRequired();
            b.Property(a => a.AssetType).HasMaxLength(50).IsRequired();
            b.Property(a => a.Status).HasMaxLength(50).IsRequired();

            b.HasOne(a => a.Vault)
             .WithMany(v => v.Assets)
             .HasForeignKey(a => a.VaultId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ContentVersion>(b =>
        {
            b.ToTable("CONTENT_VERSIONS");
            b.HasKey(cv => cv.Id);
            b.HasIndex(cv => cv.AssetId);
            b.Property(cv => cv.CiphertextStorageKey).HasMaxLength(500).IsRequired();
            b.Property(cv => cv.ChecksumSha256).HasMaxLength(64).IsRequired();
            b.Property(cv => cv.NonceHex).HasMaxLength(32);
            b.Property(cv => cv.AuthTagHex).HasMaxLength(32);
            b.Property(cv => cv.MimeType).HasMaxLength(100);

            b.HasOne(cv => cv.Asset)
             .WithMany(a => a.ContentVersions)
             .HasForeignKey(cv => cv.AssetId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ExecutorAssignment>(b =>
        {
            b.ToTable("EXECUTOR_ASSIGNMENTS");
            b.HasKey(ea => ea.Id);
            b.HasIndex(ea => ea.VaultId);
            b.HasIndex(ea => ea.ExecutorPersonId);
            b.Property(ea => ea.Status).HasMaxLength(50).IsRequired();

            b.HasOne(ea => ea.Vault)
             .WithMany(v => v.ExecutorAssignments)
             .HasForeignKey(ea => ea.VaultId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(ea => ea.ExecutorPerson)
             .WithMany(p => p.ExecutorAssignments)
             .HasForeignKey(ea => ea.ExecutorPersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================================================================
        // 3. KẾ HOẠCH DI SẢN, PHIÊN BẢN, GÓI & CHỈ ĐỊNH PHÂN CẤP
        // =========================================================================
        modelBuilder.Entity<EstatePlan>(b =>
        {
            b.ToTable("ESTATE_PLANS");
            b.HasKey(ep => ep.Id);
            b.HasIndex(ep => ep.VaultId);
            b.Property(ep => ep.Title).HasMaxLength(200).IsRequired();
            b.Property(ep => ep.Status).HasMaxLength(50).IsRequired();

            b.HasOne(ep => ep.Vault)
             .WithMany(v => v.EstatePlans)
             .HasForeignKey(ep => ep.VaultId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<EstatePlanVersion>(b =>
        {
            b.ToTable("ESTATE_PLAN_VERSIONS");
            b.HasKey(epv => epv.Id);
            b.HasIndex(epv => epv.EstatePlanId);
            b.Property(epv => epv.Status).HasMaxLength(50).IsRequired();

            b.HasOne(epv => epv.EstatePlan)
             .WithMany(ep => ep.Versions)
             .HasForeignKey(epv => epv.EstatePlanId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Bundle>(b =>
        {
            b.ToTable("BUNDLES");
            b.HasKey(bd => bd.Id);
            b.HasIndex(bd => bd.EstatePlanVersionId);
            b.Property(bd => bd.Title).HasMaxLength(200).IsRequired();
            b.Property(bd => bd.RecipientMode).HasMaxLength(50).IsRequired();
            b.Property(bd => bd.NormalizedRecipientSet).HasMaxLength(500);

            b.HasOne(bd => bd.EstatePlanVersion)
             .WithMany(epv => epv.Bundles)
             .HasForeignKey(bd => bd.EstatePlanVersionId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<BundleAsset>(b =>
        {
            b.ToTable("BUNDLE_ASSETS");
            b.HasKey(ba => new { ba.BundleId, ba.AssetId });

            b.HasOne(ba => ba.Bundle)
             .WithMany(bd => bd.BundleAssets)
             .HasForeignKey(ba => ba.BundleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(ba => ba.Asset)
             .WithMany(a => a.BundleAssets)
             .HasForeignKey(ba => ba.AssetId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HandoverPolicy>(b =>
        {
            b.ToTable("HANDOVER_POLICIES");
            b.HasKey(hp => hp.Id);
            b.HasIndex(hp => hp.BundleId).IsUnique();

            b.HasOne(hp => hp.Bundle)
             .WithOne(bd => bd.HandoverPolicy)
             .HasForeignKey<HandoverPolicy>(hp => hp.BundleId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AssetDesignationVersion>(b =>
        {
            b.ToTable("ASSET_DESIGNATION_VERSIONS");
            b.HasKey(adv => adv.Id);
            b.HasIndex(adv => adv.EstatePlanVersionId);
            b.HasIndex(adv => adv.AssetId);
            b.HasIndex(adv => adv.BeneficiaryPersonId);
            b.Property(adv => adv.NormalizedRecipientSet).HasMaxLength(500);
            b.Property(adv => adv.RecipientMode).HasMaxLength(50);

            b.HasOne(adv => adv.EstatePlanVersion)
             .WithMany(epv => epv.AssetDesignationVersions)
             .HasForeignKey(adv => adv.EstatePlanVersionId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(adv => adv.Asset)
             .WithMany(a => a.AssetDesignationVersions)
             .HasForeignKey(adv => adv.AssetId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(adv => adv.BeneficiaryPerson)
             .WithMany(p => p.AssetDesignations)
             .HasForeignKey(adv => adv.BeneficiaryPersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================================================================
        // 4. GIÁM SÁT SINH TỒN (DMS)
        // =========================================================================
        modelBuilder.Entity<DmsPolicy>(b =>
        {
            b.ToTable("DMS_POLICIES");
            b.HasKey(dp => dp.Id);
            b.HasIndex(dp => dp.VaultId).IsUnique();

            b.HasOne(dp => dp.Vault)
             .WithOne(v => v.DmsPolicy)
             .HasForeignKey<DmsPolicy>(dp => dp.VaultId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DmsCycle>(b =>
        {
            b.ToTable("DMS_CYCLES");
            b.HasKey(dc => dc.Id);
            b.HasIndex(dc => dc.DmsPolicyId);
            b.Property(dc => dc.Status).HasMaxLength(50).IsRequired();

            b.HasOne(dc => dc.DmsPolicy)
             .WithMany(dp => dp.Cycles)
             .HasForeignKey(dc => dc.DmsPolicyId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<DmsNotice>(b =>
        {
            b.ToTable("DMS_NOTICES");
            b.HasKey(dn => dn.Id);
            b.HasIndex(dn => dn.DmsCycleId);
            b.HasIndex(dn => dn.RecipientPersonId);
            b.Property(dn => dn.NoticeType).HasMaxLength(50).IsRequired();
            b.Property(dn => dn.Channel).HasMaxLength(50).IsRequired();
            b.Property(dn => dn.DeliveryStatus).HasMaxLength(50).IsRequired();

            b.HasOne(dn => dn.DmsCycle)
             .WithMany(dc => dc.Notices)
             .HasForeignKey(dn => dn.DmsCycleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(dn => dn.RecipientPerson)
             .WithMany(p => p.DmsNotices)
             .HasForeignKey(dn => dn.RecipientPersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================================================================
        // 5. HỒ SƠ DI SẢN, THẨM ĐỊNH, PHONG TỎA & KIỂM TOÁN
        // =========================================================================
        modelBuilder.Entity<Case>(b =>
        {
            b.ToTable("CASES");
            b.HasKey(c => c.Id);
            b.HasIndex(c => c.VaultId);
            b.HasIndex(c => c.DmsCycleId).IsUnique();
            b.Property(c => c.Status).HasMaxLength(50).IsRequired();

            b.HasOne(c => c.Vault)
             .WithMany(v => v.Cases)
             .HasForeignKey(c => c.VaultId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(c => c.DmsCycle)
             .WithOne(dc => dc.Case)
             .HasForeignKey<Case>(c => c.DmsCycleId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<DeathCertificate>(b =>
        {
            b.ToTable("DEATH_CERTIFICATES");
            b.HasKey(dc => dc.Id);
            b.HasIndex(dc => dc.CaseId);
            b.Property(dc => dc.StorageKey).HasMaxLength(500).IsRequired();
            b.Property(dc => dc.ChecksumSha256).HasMaxLength(64).IsRequired();
            b.Property(dc => dc.MimeType).HasMaxLength(100);

            b.HasOne(dc => dc.Case)
             .WithMany(c => c.DeathCertificates)
             .HasForeignKey(dc => dc.CaseId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CaseAssignment>(b =>
        {
            b.ToTable("CASE_ASSIGNMENTS");
            b.HasKey(ca => ca.Id);
            b.HasIndex(ca => ca.CaseId);
            b.HasIndex(ca => ca.AssignedPersonId);
            b.Property(ca => ca.Status).HasMaxLength(50).IsRequired();

            b.HasOne(ca => ca.Case)
             .WithMany(c => c.CaseAssignments)
             .HasForeignKey(ca => ca.CaseId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(ca => ca.AssignedPerson)
             .WithMany(p => p.CaseAssignments)
             .HasForeignKey(ca => ca.AssignedPersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<VerificationDecision>(b =>
        {
            b.ToTable("VERIFICATION_DECISIONS");
            b.HasKey(vd => vd.Id);
            b.HasIndex(vd => vd.CaseId);
            b.HasIndex(vd => vd.VerifierPersonId);
            b.HasIndex(vd => vd.CaseAssignmentId);
            b.Property(vd => vd.DecisionStatus).HasMaxLength(50).IsRequired();

            b.HasOne(vd => vd.Case)
             .WithMany(c => c.VerificationDecisions)
             .HasForeignKey(vd => vd.CaseId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(vd => vd.VerifierPerson)
             .WithMany(p => p.VerificationDecisions)
             .HasForeignKey(vd => vd.VerifierPersonId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(vd => vd.CaseAssignment)
             .WithMany(ca => ca.VerificationDecisions)
             .HasForeignKey(vd => vd.CaseAssignmentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Hold>(b =>
        {
            b.ToTable("HOLDS");
            b.HasKey(h => h.Id);
            b.HasIndex(h => h.VaultId);
            b.HasIndex(h => h.CaseId);
            b.Property(h => h.HoldType).HasMaxLength(50).IsRequired();
            b.Property(h => h.Reason).HasMaxLength(500).IsRequired();

            b.HasOne(h => h.Vault)
             .WithMany(v => v.Holds)
             .HasForeignKey(h => h.VaultId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(h => h.Case)
             .WithMany(c => c.Holds)
             .HasForeignKey(h => h.CaseId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(h => h.PlacedByPerson)
             .WithMany(p => p.PlacedHolds)
             .HasForeignKey(h => h.PlacedByPersonId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(h => h.ReleasedByPerson)
             .WithMany(p => p.ReleasedHolds)
             .HasForeignKey(h => h.ReleasedByPersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AuditLog>(b =>
        {
            b.ToTable("AUDIT_LOGS");
            b.HasKey(al => al.Id);
            b.HasIndex(al => al.PerformedByPersonId);
            b.HasIndex(al => al.VaultId);
            b.HasIndex(al => al.CaseId);
            b.Property(al => al.Action).HasMaxLength(100).IsRequired();
            b.Property(al => al.ClientIp).HasMaxLength(45);
            b.Property(al => al.UserAgent).HasMaxLength(500);
            b.Property(al => al.PayloadHash).HasMaxLength(64);

            b.HasOne(al => al.PerformedByPerson)
             .WithMany(p => p.AuditLogs)
             .HasForeignKey(al => al.PerformedByPersonId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(al => al.Vault)
             .WithMany(v => v.AuditLogs)
             .HasForeignKey(al => al.VaultId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(al => al.Case)
             .WithMany(c => c.AuditLogs)
             .HasForeignKey(al => al.CaseId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================================================================
        // 6. SNAPSHOT BÀN GIAO, LỊCH HẸN & PHIÊN LÀM VIỆC LIVEKIT
        // =========================================================================
        modelBuilder.Entity<CaseBundle>(b =>
        {
            b.ToTable("CASE_BUNDLES");
            b.HasKey(cb => cb.Id);
            b.HasIndex(cb => cb.CaseId);
            b.HasIndex(cb => cb.SourceBundleId);
            b.Property(cb => cb.Title).HasMaxLength(200).IsRequired();
            b.Property(cb => cb.RecipientMode).HasMaxLength(50).IsRequired();
            b.Property(cb => cb.NormalizedRecipientSet).HasMaxLength(500);
            b.Property(cb => cb.Status).HasMaxLength(50).IsRequired();
            b.Property(cb => cb.RowVersion).IsRowVersion();

            b.HasOne(cb => cb.Case)
             .WithMany(c => c.CaseBundles)
             .HasForeignKey(cb => cb.CaseId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(cb => cb.SourceBundle)
             .WithMany(bd => bd.CaseBundles)
             .HasForeignKey(cb => cb.SourceBundleId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<CaseBundleItem>(b =>
        {
            b.ToTable("CASE_BUNDLE_ITEMS");
            b.HasKey(i => i.Id);
            b.HasIndex(i => new { i.CaseBundleId, i.AssetId }).IsUnique();
            b.Property(i => i.Title).HasMaxLength(200).IsRequired();
            b.Property(i => i.MimeType).HasMaxLength(100);
            b.Property(i => i.CiphertextHash).HasMaxLength(64);
            b.Property(i => i.CiphertextStorageKey).HasMaxLength(500);

            b.HasOne(i => i.CaseBundle)
             .WithMany(cb => cb.Items)
             .HasForeignKey(i => i.CaseBundleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(i => i.Asset)
             .WithMany()
             .HasForeignKey(i => i.AssetId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(i => i.ContentVersion)
             .WithMany(cv => cv.CaseBundleItems)
             .HasForeignKey(i => i.ContentVersionId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(i => i.AssetDesignationVersion)
             .WithMany(adv => adv.CaseBundleItems)
             .HasForeignKey(i => i.AssetDesignationVersionId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HandoverSchedule>(b =>
        {
            b.ToTable("HANDOVER_SCHEDULES");
            b.HasKey(hs => hs.Id);
            b.HasIndex(hs => hs.CaseBundleId);
            b.HasIndex(hs => hs.ScheduledByPersonId);

            b.HasOne(hs => hs.CaseBundle)
             .WithMany(cb => cb.HandoverSchedules)
             .HasForeignKey(hs => hs.CaseBundleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(hs => hs.ScheduledByPerson)
             .WithMany()
             .HasForeignKey(hs => hs.ScheduledByPersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ScheduleParticipant>(b =>
        {
            b.ToTable("SCHEDULE_PARTICIPANTS");
            b.HasKey(sp => sp.Id);
            b.HasIndex(sp => sp.HandoverScheduleId);
            b.HasIndex(sp => sp.PersonId);
            b.Property(sp => sp.RoleInSchedule).HasMaxLength(50).IsRequired();
            b.Property(sp => sp.ConfirmationStatus).HasMaxLength(50).IsRequired();
            b.Property(sp => sp.Notes).HasMaxLength(500);

            b.HasOne(sp => sp.HandoverSchedule)
             .WithMany(hs => hs.Participants)
             .HasForeignKey(sp => sp.HandoverScheduleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(sp => sp.Person)
             .WithMany(p => p.ScheduleParticipants)
             .HasForeignKey(sp => sp.PersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HandoverNotice>(b =>
        {
            b.ToTable("HANDOVER_NOTICES");
            b.HasKey(hn => hn.Id);
            b.HasIndex(hn => hn.HandoverScheduleId);
            b.HasIndex(hn => hn.RecipientPersonId);
            b.Property(hn => hn.NoticeType).HasMaxLength(50).IsRequired();
            b.Property(hn => hn.Status).HasMaxLength(50).IsRequired();

            b.HasOne(hn => hn.HandoverSchedule)
             .WithMany(hs => hs.Notices)
             .HasForeignKey(hn => hn.HandoverScheduleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(hn => hn.RecipientPerson)
             .WithMany(p => p.HandoverNotices)
             .HasForeignKey(hn => hn.RecipientPersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<WorkSession>(b =>
        {
            b.ToTable("WORK_SESSIONS");
            b.HasKey(ws => ws.Id);
            b.HasIndex(ws => ws.CaseBundleId);
            b.HasIndex(ws => ws.HandoverScheduleId);
            b.HasIndex(ws => ws.LivekitRoomName).IsUnique();
            b.Property(ws => ws.LivekitRoomName).HasMaxLength(100).IsRequired();
            b.Property(ws => ws.Status).HasMaxLength(50).IsRequired();
            b.Property(ws => ws.VerificationOutcome).HasMaxLength(50).IsRequired();

            b.HasOne(ws => ws.CaseBundle)
             .WithMany(cb => cb.WorkSessions)
             .HasForeignKey(ws => ws.CaseBundleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(ws => ws.HandoverSchedule)
             .WithMany(hs => hs.WorkSessions)
             .HasForeignKey(ws => ws.HandoverScheduleId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<SessionParticipant>(b =>
        {
            b.ToTable("SESSION_PARTICIPANTS");
            b.HasKey(sp => sp.Id);
            b.HasIndex(sp => sp.WorkSessionId);
            b.HasIndex(sp => sp.PersonId);
            b.Property(sp => sp.Role).HasMaxLength(50).IsRequired();

            b.HasOne(sp => sp.WorkSession)
             .WithMany(ws => ws.Participants)
             .HasForeignKey(sp => sp.WorkSessionId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(sp => sp.Person)
             .WithMany(p => p.SessionParticipants)
             .HasForeignKey(sp => sp.PersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RecipientAuthorization>(b =>
        {
            b.ToTable("RECIPIENT_AUTHORIZATIONS");
            b.HasKey(r => r.Id);
            b.HasIndex(r => new { r.CaseBundleId, r.RecipientPersonId });
            b.Property(r => r.Notes).HasMaxLength(500);

            b.HasOne(r => r.CaseBundle)
             .WithMany(cb => cb.RecipientAuthorizations)
             .HasForeignKey(r => r.CaseBundleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(r => r.RecipientPerson)
             .WithMany(p => p.RecipientAuthorizations)
             .HasForeignKey(r => r.RecipientPersonId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(r => r.ApprovedByExecutorPerson)
             .WithMany()
             .HasForeignKey(r => r.ApprovedByExecutorPersonId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(r => r.WorkSession)
             .WithMany(ws => ws.RecipientAuthorizations)
             .HasForeignKey(r => r.WorkSessionId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================================================================
        // 7. ĐỒNG THUẬN NHÓM, CẤP QUYỀN, TẢI VỀ & KHO CÁ NHÂN
        // =========================================================================
        modelBuilder.Entity<BeneficiaryHandoverDecision>(b =>
        {
            b.ToTable("BENEFICIARY_DECISIONS");
            b.HasKey(d => d.Id);
            b.HasIndex(d => new { d.CaseBundleId, d.RecipientPersonId }).IsUnique();
            b.Property(d => d.DecisionStatus).HasMaxLength(50).IsRequired();

            b.HasOne(d => d.CaseBundle)
             .WithMany(cb => cb.Decisions)
             .HasForeignKey(d => d.CaseBundleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(d => d.RecipientPerson)
             .WithMany(p => p.BeneficiaryDecisions)
             .HasForeignKey(d => d.RecipientPersonId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(d => d.Commitment)
             .WithMany(c => c.Decisions)
             .HasForeignKey(d => d.CommitmentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Commitment>(b =>
        {
            b.ToTable("COMMITMENTS");
            b.HasKey(c => c.Id);
            b.HasIndex(c => c.CaseBundleId);
            b.Property(c => c.PolicyMode).HasMaxLength(50).IsRequired();
            b.Property(c => c.ClientIpAddress).HasMaxLength(45);
            b.Property(c => c.UserAgent).HasMaxLength(500);

            b.HasOne(c => c.CaseBundle)
             .WithMany(cb => cb.Commitments)
             .HasForeignKey(c => c.CaseBundleId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<AccessGrant>(b =>
        {
            b.ToTable("ACCESS_GRANTS");
            b.HasKey(g => g.Id);
            b.HasIndex(g => g.DownloadToken).IsUnique();
            b.HasIndex(g => new { g.CaseBundleId, g.RecipientPersonId, g.CommitmentId }).IsUnique();
            b.Property(g => g.Status).HasMaxLength(50).IsRequired();
            b.Property(g => g.DownloadToken).HasMaxLength(64).IsRequired();

            b.HasOne(g => g.CaseBundle)
             .WithMany(cb => cb.AccessGrants)
             .HasForeignKey(g => g.CaseBundleId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(g => g.RecipientPerson)
             .WithMany(p => p.AccessGrants)
             .HasForeignKey(g => g.RecipientPersonId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(g => g.Commitment)
             .WithMany(c => c.AccessGrants)
             .HasForeignKey(g => g.CommitmentId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AccessGrantAsset>(b =>
        {
            b.ToTable("ACCESS_GRANT_ASSETS");
            b.HasKey(aga => new { aga.AccessGrantId, aga.AssetId });

            b.HasOne(aga => aga.AccessGrant)
             .WithMany(ag => ag.AccessGrantAssets)
             .HasForeignKey(aga => aga.AccessGrantId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(aga => aga.Asset)
             .WithMany(a => a.AccessGrantAssets)
             .HasForeignKey(aga => aga.AssetId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DownloadEvent>(b =>
        {
            b.ToTable("DOWNLOAD_ATTEMPTS");
            b.HasKey(e => e.Id);
            b.HasIndex(e => e.AccessGrantId);
            b.HasIndex(e => e.AssetId);
            b.Property(e => e.ClientIpAddress).HasMaxLength(45);
            b.Property(e => e.UserAgent).HasMaxLength(500);

            b.HasOne(e => e.AccessGrant)
             .WithMany(g => g.DownloadEvents)
             .HasForeignKey(e => e.AccessGrantId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(e => e.Asset)
             .WithMany()
             .HasForeignKey(e => e.AssetId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<HandoverReceipt>(b =>
        {
            b.ToTable("HANDOVER_RECEIPTS");
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

            b.HasOne(r => r.CaseBundle)
             .WithMany(cb => cb.HandoverReceipts)
             .HasForeignKey(r => r.CaseBundleId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(r => r.BeneficiaryPerson)
             .WithMany(p => p.HandoverReceipts)
             .HasForeignKey(r => r.BeneficiaryPersonId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PersonalVault>(b =>
        {
            b.ToTable("PERSONAL_VAULTS");
            b.HasKey(pv => pv.Id);
            b.HasIndex(pv => pv.OwnerPersonId);
            b.Property(pv => pv.Tier).HasMaxLength(50).IsRequired();

            b.HasOne(pv => pv.OwnerPerson)
             .WithMany(p => p.PersonalVaults)
             .HasForeignKey(pv => pv.OwnerPersonId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PersonalVaultItem>(b =>
        {
            b.ToTable("PERSONAL_VAULT_ITEMS");
            b.HasKey(pvi => pvi.Id);
            // Unique chống nhập trùng một tài sản vào kho cá nhân
            b.HasIndex(pvi => new { pvi.PersonalVaultId, pvi.AssetId }).IsUnique();

            b.HasOne(pvi => pvi.PersonalVault)
             .WithMany(pv => pv.Items)
             .HasForeignKey(pvi => pvi.PersonalVaultId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(pvi => pvi.SourceAccessGrant)
             .WithMany(ag => ag.PersonalVaultItems)
             .HasForeignKey(pvi => pvi.SourceAccessGrantId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(pvi => pvi.Asset)
             .WithMany(a => a.PersonalVaultItems)
             .HasForeignKey(pvi => pvi.AssetId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        // =========================================================================
        // 8. BẢNG GIÁ, THUÊ BAO & THANH TOÁN (SEPAY)
        // =========================================================================
        modelBuilder.Entity<SubscriptionPlan>(b =>
        {
            b.ToTable("SUBSCRIPTION_PLANS");
            b.HasKey(sp => sp.Id);
            b.HasIndex(sp => sp.PlanCode).IsUnique();
            b.Property(sp => sp.PlanCode).HasMaxLength(50).IsRequired();
            b.Property(sp => sp.Name).HasMaxLength(100).IsRequired();
            b.Property(sp => sp.Category).HasMaxLength(50).IsRequired();
        });

        modelBuilder.Entity<VaultSubscription>(b =>
        {
            b.ToTable("VAULT_SUBSCRIPTIONS");
            b.HasKey(vs => vs.Id);
            b.HasIndex(vs => vs.VaultId).IsUnique();
            b.Property(vs => vs.Status).HasMaxLength(50).IsRequired();

            b.HasOne(vs => vs.Vault)
             .WithOne(v => v.VaultSubscription)
             .HasForeignKey<VaultSubscription>(vs => vs.VaultId)
             .OnDelete(DeleteBehavior.Cascade);

            b.HasOne(vs => vs.Plan)
             .WithMany(p => p.VaultSubscriptions)
             .HasForeignKey(vs => vs.PlanId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PaymentOrderDb>(b =>
        {
            b.ToTable("PAYMENT_ORDERS");
            b.HasKey(po => po.Id);
            b.HasIndex(po => po.OrderCode).IsUnique();
            b.HasIndex(po => po.PersonId);
            b.HasIndex(po => po.PlanId);
            b.HasIndex(po => po.VaultId);
            b.Property(po => po.OrderCode).HasMaxLength(50).IsRequired();
            b.Property(po => po.Status).HasMaxLength(50).IsRequired();
            b.Property(po => po.SepayTransactionId).HasMaxLength(100);
            b.Property(po => po.QrCodeUrl).HasMaxLength(500);
            b.Property(po => po.SnapshotPlanTier).HasMaxLength(50);

            b.HasOne(po => po.Person)
             .WithMany(p => p.PaymentOrders)
             .HasForeignKey(po => po.PersonId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(po => po.Plan)
             .WithMany(p => p.PaymentOrders)
             .HasForeignKey(po => po.PlanId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(po => po.Vault)
             .WithMany(v => v.PaymentOrders)
             .HasForeignKey(po => po.VaultId)
             .OnDelete(DeleteBehavior.Restrict);

            b.HasOne(po => po.Subscription)
             .WithMany(vs => vs.PaymentOrders)
             .HasForeignKey(po => po.SubscriptionId)
             .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PaymentTransaction>(b =>
        {
            b.ToTable("PAYMENT_TRANSACTIONS");
            b.HasKey(pt => pt.Id);
            b.HasIndex(pt => pt.OrderId);
            b.HasIndex(pt => pt.BankTransactionId).IsUnique();
            b.Property(pt => pt.BankTransactionId).HasMaxLength(100).IsRequired();

            b.HasOne(pt => pt.Order)
             .WithMany(po => po.Transactions)
             .HasForeignKey(pt => pt.OrderId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<PaymentReceipt>(b =>
        {
            b.ToTable("PAYMENT_RECEIPTS");
            b.HasKey(pr => pr.Id);
            b.HasIndex(pr => pr.OrderId).IsUnique();
            b.HasIndex(pr => pr.ReceiptCode).IsUnique();
            b.Property(pr => pr.ReceiptCode).HasMaxLength(50).IsRequired();

            b.HasOne(pr => pr.Order)
             .WithOne(po => po.Receipt)
             .HasForeignKey<PaymentReceipt>(pr => pr.OrderId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<IdempotencyRecordDb>(b =>
        {
            b.ToTable("IDEMPOTENCY_RECORDS");
            b.HasKey(ir => ir.Id);
            b.HasIndex(ir => ir.ProviderEventId).IsUnique();
            b.Property(ir => ir.ProviderEventId).HasMaxLength(256).IsRequired();
            b.Property(ir => ir.OrderId).HasMaxLength(100);
        });

        // =========================================================================
        // SEED DATA: CÁC GÓI CƯỚC CHUẨN SRS VÀ GÓI ĐA NIÊN HẠN (1Y, 5Y, 10Y)
        // =========================================================================
        modelBuilder.Entity<SubscriptionPlan>().HasData(
            new SubscriptionPlan
            {
                Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                PlanCode = "OWNER_FREE",
                Name = "Két Di Sản Miễn Phí (Owner Free)",
                Category = "OWNER",
                PriceVnd = 0,
                DurationDays = 0,
                StorageQuotaMb = 20,
                MaxAssetsQuota = 3,
                AllowEstatePlan = false,
                AllowPdfExport = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new SubscriptionPlan
            {
                Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                PlanCode = "LEGACY_XS",
                Name = "Két Di Sản XS (1 Năm)",
                Category = "OWNER",
                PriceVnd = 199_000,
                DurationDays = 365,
                StorageQuotaMb = 200,
                MaxAssetsQuota = 20,
                AllowEstatePlan = true,
                AllowPdfExport = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new SubscriptionPlan
            {
                Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                PlanCode = "LEGACY_XS_5Y",
                Name = "Két Di Sản XS (5 Năm - Tiết Kiệm 20%)",
                Category = "OWNER",
                PriceVnd = 799_000,
                DurationDays = 1825,
                StorageQuotaMb = 250,
                MaxAssetsQuota = 25,
                AllowEstatePlan = true,
                AllowPdfExport = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new SubscriptionPlan
            {
                Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
                PlanCode = "LEGACY_XS_10Y",
                Name = "Két Di Sản XS Bền Vững (10 Năm - Khóa Giá)",
                Category = "OWNER",
                PriceVnd = 1_290_000,
                DurationDays = 3650,
                StorageQuotaMb = 300,
                MaxAssetsQuota = 30,
                AllowEstatePlan = true,
                AllowPdfExport = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new SubscriptionPlan
            {
                Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
                PlanCode = "LEGACY_XS_MAX",
                Name = "Két Di Sản XS MAX (1 Năm - Toàn Diện)",
                Category = "OWNER",
                PriceVnd = 399_000,
                DurationDays = 365,
                StorageQuotaMb = 500,
                MaxAssetsQuota = 50,
                AllowEstatePlan = true,
                AllowPdfExport = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new SubscriptionPlan
            {
                Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
                PlanCode = "LEGACY_XS_MAX_5Y",
                Name = "Két Di Sản XS MAX (5 Năm - Trọn Gói)",
                Category = "OWNER",
                PriceVnd = 1_590_000,
                DurationDays = 1825,
                StorageQuotaMb = 600,
                MaxAssetsQuota = 60,
                AllowEstatePlan = true,
                AllowPdfExport = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new SubscriptionPlan
            {
                Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
                PlanCode = "LEGACY_XS_MAX_10Y",
                Name = "Két Di Sản XS MAX Hoàng Gia (10 Năm)",
                Category = "OWNER",
                PriceVnd = 2_490_000,
                DurationDays = 3650,
                StorageQuotaMb = 1000,
                MaxAssetsQuota = 100,
                AllowEstatePlan = true,
                AllowPdfExport = true,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new SubscriptionPlan
            {
                Id = Guid.Parse("88888888-8888-8888-8888-888888888888"),
                PlanCode = "RECIPIENT_FREE",
                Name = "Kho Nhận Di Sản Miễn Phí",
                Category = "RECIPIENT",
                PriceVnd = 0,
                DurationDays = 0,
                StorageQuotaMb = 20,
                MaxAssetsQuota = 2,
                AllowEstatePlan = false,
                AllowPdfExport = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            },
            new SubscriptionPlan
            {
                Id = Guid.Parse("99999999-9999-9999-9999-999999999999"),
                PlanCode = "RECIPIENT_PLUS",
                Name = "Kho Nhận Di Sản Mở Rộng (30 Ngày)",
                Category = "RECIPIENT",
                PriceVnd = 49_000,
                DurationDays = 30,
                StorageQuotaMb = 200,
                MaxAssetsQuota = 10,
                AllowEstatePlan = false,
                AllowPdfExport = false,
                CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
            }
        );
    }
}
