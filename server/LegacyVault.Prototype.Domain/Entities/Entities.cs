using System.ComponentModel.DataAnnotations;

namespace LegacyVault.Prototype.Domain.Entities;

// =========================================================================
// 1. DANH TÍNH CỐT LÕI & VAI TRÒ HỆ THỐNG
// =========================================================================

public class Person
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string? IdentityCard { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? User { get; set; }
    public OwnerVaultConfig? OwnerVault { get; set; }
    public List<PersonalVault> PersonalVaults { get; set; } = new();
    public List<ExecutorAssignment> ExecutorAssignments { get; set; } = new();
    public List<AssetDesignationVersion> AssetDesignations { get; set; } = new();
    public List<DmsNotice> DmsNotices { get; set; } = new();
    public List<CaseAssignment> CaseAssignments { get; set; } = new();
    public List<VerificationDecision> VerificationDecisions { get; set; } = new();
    public List<Hold> PlacedHolds { get; set; } = new();
    public List<Hold> ReleasedHolds { get; set; } = new();
    public List<AuditLog> AuditLogs { get; set; } = new();
    public List<ScheduleParticipant> ScheduleParticipants { get; set; } = new();
    public List<HandoverNotice> HandoverNotices { get; set; } = new();
    public List<SessionParticipant> SessionParticipants { get; set; } = new();
    public List<RecipientAuthorization> RecipientAuthorizations { get; set; } = new();
    public List<BeneficiaryHandoverDecision> BeneficiaryDecisions { get; set; } = new();
    public List<AccessGrant> AccessGrants { get; set; } = new();
    public List<HandoverReceipt> HandoverReceipts { get; set; } = new();
    public List<PaymentOrderDb> PaymentOrders { get; set; } = new();
}

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PersonId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;
    public string? OidcSubject { get; set; }
    public string Roles { get; set; } = "OWNER";
    public string Status { get; set; } = "ACTIVE";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Person Person { get; set; } = null!;
    public List<StaffRole> StaffRoles { get; set; } = new();
}

public class StaffRole
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public string RoleCode { get; set; } = "VERIFIER"; // VERIFIER, ADMIN, NOTARY_OPERATOR
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public Guid? AssignedByUserId { get; set; }

    // Navigation
    public User User { get; set; } = null!;
}

// =========================================================================
// 2. KHO NGUỒN, TÀI SẢN & THI HÀNH
// =========================================================================

public class OwnerVaultConfig
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerPersonId { get; set; }
    public string Title { get; set; } = "Két Di Sản Mặc Định";
    public string Status { get; set; } = "ACTIVE"; // ACTIVE, CHECKIN_PENDING, FROZEN_INACTIVITY, PURGED
    public string Tier { get; set; } = "LEGACY_XS";
    public int HeartbeatIntervalDays { get; set; } = 30;
    public int GracePeriodDays { get; set; } = 7;
    public DateTime? LastCheckInAt { get; set; }
    public DateTime? NextCheckInDue { get; set; }
    public int StorageQuotaMb { get; set; } = 200;
    public int MaxAssetsQuota { get; set; } = 20;
    public bool HasActiveDispute { get; set; }
    public bool HasLegalHoldFlag { get; set; }
    public bool HasRescueHoldFlag { get; set; }
    public bool HasSecurityHoldFlag { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Person OwnerPerson { get; set; } = null!;
    public List<Asset> Assets { get; set; } = new();
    public List<ExecutorAssignment> ExecutorAssignments { get; set; } = new();
    public List<EstatePlan> EstatePlans { get; set; } = new();
    public DmsPolicy? DmsPolicy { get; set; }
    public List<Case> Cases { get; set; } = new();
    public List<Hold> Holds { get; set; } = new();
    public List<AuditLog> AuditLogs { get; set; } = new();
    public VaultSubscription? VaultSubscription { get; set; }
    public List<PaymentOrderDb> PaymentOrders { get; set; } = new();
}

public class Asset
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VaultId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string AssetType { get; set; } = "DOCUMENT"; // DOCUMENT, CREDENTIAL, MESSAGE, FINANCIAL
    public string Status { get; set; } = "ACTIVE";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public OwnerVaultConfig Vault { get; set; } = null!;
    public List<ContentVersion> ContentVersions { get; set; } = new();
    public List<BundleAsset> BundleAssets { get; set; } = new();
    public List<AssetDesignationVersion> AssetDesignationVersions { get; set; } = new();
    public List<AccessGrantAsset> AccessGrantAssets { get; set; } = new();
    public List<PersonalVaultItem> PersonalVaultItems { get; set; } = new();
}

public class ContentVersion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AssetId { get; set; }
    public int VersionNumber { get; set; } = 1;
    public string CiphertextStorageKey { get; set; } = string.Empty;
    public string ChecksumSha256 { get; set; } = string.Empty;
    public string WrappedDataKey { get; set; } = string.Empty;
    public string NonceHex { get; set; } = string.Empty;
    public string AuthTagHex { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string MimeType { get; set; } = "application/octet-stream";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Asset Asset { get; set; } = null!;
    public List<CaseBundleItem> CaseBundleItems { get; set; } = new();
}

public class ExecutorAssignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VaultId { get; set; }
    public Guid ExecutorPersonId { get; set; }
    public string Status { get; set; } = "INVITED"; // INVITED, ACCEPTED, DECLINED, RESIGNED
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public DateTime? AcceptedAt { get; set; }
    public DateTime? ResignedAt { get; set; }

    // Navigation
    public OwnerVaultConfig Vault { get; set; } = null!;
    public Person ExecutorPerson { get; set; } = null!;
}

// =========================================================================
// 3. KẾ HOẠCH DI SẢN, PHIÊN BẢN, GÓI & CHỈ ĐỊNH PHÂN CẤP
// =========================================================================

public class EstatePlan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VaultId { get; set; }
    public string Title { get; set; } = "Kế Hoạch Di Sản Mặc Định";
    public string Status { get; set; } = "ACTIVE";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public OwnerVaultConfig Vault { get; set; } = null!;
    public List<EstatePlanVersion> Versions { get; set; } = new();
}

public class EstatePlanVersion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EstatePlanId { get; set; }
    public int VersionNumber { get; set; } = 1;
    public string Status { get; set; } = "ACTIVE"; // DRAFT, ACTIVE, SUPERSEDED
    public DateTime? ActivatedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public EstatePlan EstatePlan { get; set; } = null!;
    public List<Bundle> Bundles { get; set; } = new();
    public List<AssetDesignationVersion> AssetDesignationVersions { get; set; } = new();
}

public class Bundle
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EstatePlanVersionId { get; set; }
    public string Title { get; set; } = "Gói Bàn Giao Di Sản";
    public string RecipientMode { get; set; } = "SINGLE_RECIPIENT"; // SINGLE_RECIPIENT, CO_OWNED
    public string NormalizedRecipientSet { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public EstatePlanVersion EstatePlanVersion { get; set; } = null!;
    public List<BundleAsset> BundleAssets { get; set; } = new();
    public HandoverPolicy? HandoverPolicy { get; set; }
    public List<CaseBundle> CaseBundles { get; set; } = new();
}

public class BundleAsset
{
    public Guid BundleId { get; set; }
    public Guid AssetId { get; set; }
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Bundle Bundle { get; set; } = null!;
    public Asset Asset { get; set; } = null!;
}

public class HandoverPolicy
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BundleId { get; set; }
    public int ResponseWindowDays { get; set; } = 7;
    public bool RequireVideoSession { get; set; }
    public int ConsensusThresholdPercent { get; set; } = 100;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Bundle Bundle { get; set; } = null!;
}

public class AssetDesignationVersion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EstatePlanVersionId { get; set; }
    public Guid AssetId { get; set; }
    public Guid BeneficiaryPersonId { get; set; }
    public string NormalizedRecipientSet { get; set; } = string.Empty;
    public string RecipientMode { get; set; } = "SINGLE_RECIPIENT";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public EstatePlanVersion EstatePlanVersion { get; set; } = null!;
    public Asset Asset { get; set; } = null!;
    public Person BeneficiaryPerson { get; set; } = null!;
    public List<CaseBundleItem> CaseBundleItems { get; set; } = new();
}

// =========================================================================
// 4. GIÁM SÁT SINH TỒN (DEAD MAN'S SWITCH)
// =========================================================================

public class DmsPolicy
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VaultId { get; set; }
    public int IntervalDays { get; set; } = 30;
    public int GracePeriodDays { get; set; } = 7;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public OwnerVaultConfig Vault { get; set; } = null!;
    public List<DmsCycle> Cycles { get; set; } = new();
}

public class DmsCycle
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DmsPolicyId { get; set; }
    public DateTime ScheduledCheckInAt { get; set; }
    public DateTime? ActualCheckInAt { get; set; }
    public string Status { get; set; } = "PENDING"; // PENDING, CHECKED_IN, GRACE_PERIOD, EXPIRED
    public DateTime GraceExpiresAt { get; set; }

    // Navigation
    public DmsPolicy DmsPolicy { get; set; } = null!;
    public List<DmsNotice> Notices { get; set; } = new();
    public Case? Case { get; set; }
}

public class DmsNotice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid DmsCycleId { get; set; }
    public Guid RecipientPersonId { get; set; }
    public string NoticeType { get; set; } = "CHECK_IN_REMINDER"; // CHECK_IN_REMINDER, GRACE_WARNING, EXECUTOR_ALERT
    public string Channel { get; set; } = "EMAIL"; // EMAIL, SMS, IN_APP
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public string DeliveryStatus { get; set; } = "SENT";

    // Navigation
    public DmsCycle DmsCycle { get; set; } = null!;
    public Person RecipientPerson { get; set; } = null!;
}

// =========================================================================
// 5. HỒ SƠ DI SẢN, THẨM ĐỊNH, PHONG TỎA & KIỂM TOÁN
// =========================================================================

public class Case
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VaultId { get; set; }
    public Guid? DmsCycleId { get; set; }
    public Guid? EstatePlanId { get; set; }
    public Guid? ExecutorPersonId { get; set; }
    public Guid? VerifierPersonId { get; set; }
    public string Status { get; set; } = "DRAFT"; // DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, CLOSED
    public string? RejectionReason { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? DecidedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public OwnerVaultConfig Vault { get; set; } = null!;
    public DmsCycle? DmsCycle { get; set; }
    public List<DeathCertificate> DeathCertificates { get; set; } = new();
    public List<CaseAssignment> CaseAssignments { get; set; } = new();
    public List<VerificationDecision> VerificationDecisions { get; set; } = new();
    public List<Hold> Holds { get; set; } = new();
    public List<AuditLog> AuditLogs { get; set; } = new();
    public List<CaseBundle> CaseBundles { get; set; } = new();
}

public class DeathCertificate
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseId { get; set; }
    public string StorageKey { get; set; } = string.Empty;
    public string ChecksumSha256 { get; set; } = string.Empty;
    public string MimeType { get; set; } = "application/pdf";
    public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Case Case { get; set; } = null!;
}

public class CaseAssignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseId { get; set; }
    public Guid AssignedPersonId { get; set; }
    public DateTime AssignedAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "ASSIGNED"; // ASSIGNED, IN_REVIEW, COMPLETED

    // Navigation
    public Case Case { get; set; } = null!;
    public Person AssignedPerson { get; set; } = null!;
    public List<VerificationDecision> VerificationDecisions { get; set; } = new();
}

public class VerificationDecision
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseId { get; set; }
    public Guid VerifierPersonId { get; set; }
    public Guid? CaseAssignmentId { get; set; }
    public string DecisionStatus { get; set; } = "APPROVED"; // APPROVED, REJECTED, REQUIRE_MORE_DOCS
    public string? StatementNote { get; set; }
    public DateTime DecidedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Case Case { get; set; } = null!;
    public Person VerifierPerson { get; set; } = null!;
    public CaseAssignment? CaseAssignment { get; set; }
}

public class Hold
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VaultId { get; set; }
    public Guid? CaseId { get; set; }
    public string HoldType { get; set; } = "DISPUTE_HOLD"; // DISPUTE_HOLD, LEGAL_HOLD, RESCUE_HOLD, SECURITY_HOLD
    public string Reason { get; set; } = string.Empty;
    public Guid? PlacedByPersonId { get; set; }
    public DateTime PlacedAt { get; set; } = DateTime.UtcNow;
    public Guid? ReleasedByPersonId { get; set; }
    public DateTime? ReleasedAt { get; set; }

    // Navigation
    public OwnerVaultConfig Vault { get; set; } = null!;
    public Case? Case { get; set; }
    public Person? PlacedByPerson { get; set; }
    public Person? ReleasedByPerson { get; set; }
}

public class AuditLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Action { get; set; } = string.Empty;
    public Guid? PerformedByPersonId { get; set; }
    public Guid? VaultId { get; set; }
    public Guid? CaseId { get; set; }
    public string? ClientIp { get; set; }
    public string? UserAgent { get; set; }
    public string? PayloadHash { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Person? PerformedByPerson { get; set; }
    public OwnerVaultConfig? Vault { get; set; }
    public Case? Case { get; set; }
}

// =========================================================================
// 6. SNAPSHOT BÀN GIAO, LỊCH HẸN & PHIÊN LÀM VIỆC LIVEKIT
// =========================================================================

public class CaseBundle
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseId { get; set; }
    public Guid? SourceBundleId { get; set; }
    public string Title { get; set; } = "Gói Bàn Giao Di Sản";
    public string RecipientMode { get; set; } = "SINGLE_RECIPIENT"; // SINGLE_RECIPIENT, CO_OWNED
    public string NormalizedRecipientSet { get; set; } = string.Empty;
    public string Status { get; set; } = "PENDING_RESPONSE";
    public DateTime? HandoverStartedAt { get; set; }
    public DateTime? InitialResponseDueAt { get; set; }
    public DateTime? FreezeStartedAt { get; set; }
    public DateTime? FreezeExpiresAt { get; set; }

    [Timestamp]
    public byte[]? RowVersion { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Case Case { get; set; } = null!;
    public Bundle? SourceBundle { get; set; }
    public List<CaseBundleItem> Items { get; set; } = new();
    public List<HandoverSchedule> HandoverSchedules { get; set; } = new();
    public List<WorkSession> WorkSessions { get; set; } = new();
    public List<RecipientAuthorization> RecipientAuthorizations { get; set; } = new();
    public List<BeneficiaryHandoverDecision> Decisions { get; set; } = new();
    public List<Commitment> Commitments { get; set; } = new();
    public List<AccessGrant> AccessGrants { get; set; } = new();
    public List<HandoverReceipt> HandoverReceipts { get; set; } = new();
}

public class CaseBundleItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseBundleId { get; set; }
    public Guid AssetId { get; set; }
    public Guid ContentVersionId { get; set; }
    public Guid? AssetDesignationVersionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string MimeType { get; set; } = "application/octet-stream";
    public string CiphertextHash { get; set; } = string.Empty;
    public string CiphertextStorageKey { get; set; } = string.Empty;
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public CaseBundle CaseBundle { get; set; } = null!;
    public Asset Asset { get; set; } = null!;
    public ContentVersion ContentVersion { get; set; } = null!;
    public AssetDesignationVersion? AssetDesignationVersion { get; set; }
}

public class HandoverSchedule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseBundleId { get; set; }
    public int ScheduleVersion { get; set; } = 1;
    public DateTimeOffset ScheduledDeliveryDate { get; set; }
    public Guid ScheduledByPersonId { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public CaseBundle CaseBundle { get; set; } = null!;
    public Person ScheduledByPerson { get; set; } = null!;
    public List<ScheduleParticipant> Participants { get; set; } = new();
    public List<HandoverNotice> Notices { get; set; } = new();
    public List<WorkSession> WorkSessions { get; set; } = new();
}

public class ScheduleParticipant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid HandoverScheduleId { get; set; }
    public Guid PersonId { get; set; }
    public string RoleInSchedule { get; set; } = "BENEFICIARY"; // BENEFICIARY, EXECUTOR, VERIFIER, NOTARY
    public string ConfirmationStatus { get; set; } = "PENDING"; // PENDING, CONFIRMED, DECLINED, RESCHEDULED
    public DateTime? RespondedAt { get; set; }
    public string? Notes { get; set; }

    // Navigation
    public HandoverSchedule HandoverSchedule { get; set; } = null!;
    public Person Person { get; set; } = null!;
}

public class HandoverNotice
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid HandoverScheduleId { get; set; }
    public Guid RecipientPersonId { get; set; }
    public string NoticeType { get; set; } = "SCHEDULE_INVITE"; // SCHEDULE_INVITE, SCHEDULE_REMINDER, SCHEDULE_CHANGED
    public DateTime SentAt { get; set; } = DateTime.UtcNow;
    public string Status { get; set; } = "SENT";

    // Navigation
    public HandoverSchedule HandoverSchedule { get; set; } = null!;
    public Person RecipientPerson { get; set; } = null!;
}

public class WorkSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseBundleId { get; set; }
    public Guid? HandoverScheduleId { get; set; }
    public string LivekitRoomName { get; set; } = string.Empty;
    public string Status { get; set; } = "REQUESTED"; // REQUESTED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    public string VerificationOutcome { get; set; } = "PENDING"; // PENDING, PASS, FAIL, INCONCLUSIVE
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }

    // Navigation
    public CaseBundle CaseBundle { get; set; } = null!;
    public HandoverSchedule? HandoverSchedule { get; set; }
    public List<SessionParticipant> Participants { get; set; } = new();
    public List<RecipientAuthorization> RecipientAuthorizations { get; set; } = new();
}

public class SessionParticipant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid WorkSessionId { get; set; }
    public Guid PersonId { get; set; }
    public string Role { get; set; } = "BENEFICIARY"; // HOST_VERIFIER, SUBJECT_USER, CO_BENEFICIARY, OBSERVER
    public DateTime? JoinedAt { get; set; }
    public DateTime? LeftAt { get; set; }
    public bool IdentityVerified { get; set; }

    // Navigation
    public WorkSession WorkSession { get; set; } = null!;
    public Person Person { get; set; } = null!;
}

public class RecipientAuthorization
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseBundleId { get; set; }
    public Guid RecipientPersonId { get; set; }
    public Guid? ApprovedByExecutorPersonId { get; set; }
    public Guid? WorkSessionId { get; set; }
    public bool IsAuthorized { get; set; } = true;
    public DateTime AuthorizedAt { get; set; } = DateTime.UtcNow;
    public bool FaceMatched { get; set; } = true;
    public bool NationalIdMatched { get; set; } = true;
    public bool InteractiveChallengePassed { get; set; } = true;
    public string? Notes { get; set; }

    // Navigation
    public CaseBundle CaseBundle { get; set; } = null!;
    public Person RecipientPerson { get; set; } = null!;
    public Person? ApprovedByExecutorPerson { get; set; }
    public WorkSession? WorkSession { get; set; }
}

// =========================================================================
// 7. ĐỒNG THUẬN NHÓM, CẤP QUYỀN, TẢI VỀ & KHO CÁ NHÂN
// =========================================================================

public class BeneficiaryHandoverDecision
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseBundleId { get; set; }
    public Guid RecipientPersonId { get; set; }
    public Guid? CommitmentId { get; set; }
    public string DecisionStatus { get; set; } = "PENDING"; // PENDING, ACCEPTED, REJECTED, EXPIRED
    public DateTime? DecidedAt { get; set; }
    public DateTime? ReconsideredAt { get; set; }
    public bool LegalAcknowledgment { get; set; }
    public string? RejectionReason { get; set; }
    public string? Note { get; set; }

    // Navigation
    public CaseBundle CaseBundle { get; set; } = null!;
    public Person RecipientPerson { get; set; } = null!;
    public Commitment? Commitment { get; set; }
}

public class Commitment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseBundleId { get; set; }
    public Guid? CaseId { get; set; }
    public Guid? WorkSessionId { get; set; }
    public string PolicyMode { get; set; } = "ALL_OR_NOTHING"; // ALL_OR_NOTHING, INDIVIDUAL
    public DateTime CommittedAt { get; set; } = DateTime.UtcNow;
    public string LegalAcknowledgment { get; set; } = string.Empty;
    public string? ClientIpAddress { get; set; }
    public string? UserAgent { get; set; }

    // Navigation
    public CaseBundle CaseBundle { get; set; } = null!;
    public List<BeneficiaryHandoverDecision> Decisions { get; set; } = new();
    public List<AccessGrant> AccessGrants { get; set; } = new();
}

public class AccessGrant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseBundleId { get; set; }
    public Guid? CaseId { get; set; }
    public Guid RecipientPersonId { get; set; }
    public Guid CommitmentId { get; set; }
    public string Status { get; set; } = "ACTIVE"; // ACTIVE, REVOKED, EXPIRED, FINALIZED
    public string DownloadToken { get; set; } = Guid.NewGuid().ToString("N");
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(72);

    // Navigation
    public CaseBundle CaseBundle { get; set; } = null!;
    public Person RecipientPerson { get; set; } = null!;
    public Commitment Commitment { get; set; } = null!;
    public List<AccessGrantAsset> AccessGrantAssets { get; set; } = new();
    public List<DownloadEvent> DownloadEvents { get; set; } = new();
    public HandoverReceipt? HandoverReceipt { get; set; }
    public List<PersonalVaultItem> PersonalVaultItems { get; set; } = new();
}

public class AccessGrantAsset
{
    public Guid AccessGrantId { get; set; }
    public Guid AssetId { get; set; }
    public DateTime GrantedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public AccessGrant AccessGrant { get; set; } = null!;
    public Asset Asset { get; set; } = null!;
}

public class DownloadEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AccessGrantId { get; set; }
    public Guid? CaseBundleId { get; set; }
    public Guid AssetId { get; set; }
    public Guid? ContentVersionId { get; set; }
    public DateTime ServedAt { get; set; } = DateTime.UtcNow;
    public long BytesServed { get; set; }
    public string? ClientIpAddress { get; set; }
    public string? UserAgent { get; set; }

    // Navigation
    public AccessGrant AccessGrant { get; set; } = null!;
    public Asset Asset { get; set; } = null!;
}

public class HandoverReceipt
{
    public Guid ReceiptId { get; set; } = Guid.NewGuid();
    public Guid AccessGrantId { get; set; }
    public Guid CaseBundleId { get; set; }
    public Guid BeneficiaryPersonId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
    public string ConfirmedAssetIdsJson { get; set; } = "[]";
    public string SignatureType { get; set; } = "ELECTRONIC_RECEIPT_SIGNATURE";
    public string? RecipientSignatureData { get; set; }
    public string SignatureHash { get; set; } = string.Empty;
    public string ReceiptContentHash { get; set; } = string.Empty;
    public string ReceiptAuditDigest { get; set; } = string.Empty;

    // Navigation
    public AccessGrant AccessGrant { get; set; } = null!;
    public CaseBundle CaseBundle { get; set; } = null!;
    public Person BeneficiaryPerson { get; set; } = null!;
}

public class PersonalVault
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerPersonId { get; set; }
    public string Tier { get; set; } = "RECIPIENT_FREE";
    public int StorageQuotaMb { get; set; } = 20;
    public int MaxAssetsQuota { get; set; } = 2;
    public DateTime? PlanExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Person OwnerPerson { get; set; } = null!;
    public List<PersonalVaultItem> Items { get; set; } = new();
}

public class PersonalVaultItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PersonalVaultId { get; set; }
    public Guid SourceAccessGrantId { get; set; }
    public Guid AssetId { get; set; }
    public Guid? ContentVersionId { get; set; }
    public DateTime ImportedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public PersonalVault PersonalVault { get; set; } = null!;
    public AccessGrant SourceAccessGrant { get; set; } = null!;
    public Asset Asset { get; set; } = null!;
}

// =========================================================================
// 8. BẢNG GIÁ, THUÊ BAO & THANH TOÁN (SEPAY)
// =========================================================================

public class SubscriptionPlan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string PlanCode { get; set; } = string.Empty; // OWNER_FREE, LEGACY_XS, LEGACY_XS_5Y, LEGACY_XS_10Y, etc.
    public string Name { get; set; } = string.Empty;
    public string Category { get; set; } = "OWNER"; // OWNER, RECIPIENT
    public int PriceVnd { get; set; }
    public int DurationDays { get; set; }
    public int StorageQuotaMb { get; set; }
    public int MaxAssetsQuota { get; set; }
    public bool AllowEstatePlan { get; set; }
    public bool AllowPdfExport { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public List<VaultSubscription> VaultSubscriptions { get; set; } = new();
    public List<PaymentOrderDb> PaymentOrders { get; set; } = new();
}

public class VaultSubscription
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VaultId { get; set; }
    public Guid PlanId { get; set; }
    public DateTime StartsAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public string Status { get; set; } = "ACTIVE"; // ACTIVE, EXPIRED, CANCELLED

    // Navigation
    public OwnerVaultConfig Vault { get; set; } = null!;
    public SubscriptionPlan Plan { get; set; } = null!;
    public List<PaymentOrderDb> PaymentOrders { get; set; } = new();
}

public class PaymentOrderDb
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderCode { get; set; } = string.Empty;
    public Guid PersonId { get; set; }
    public Guid PlanId { get; set; }
    public Guid? VaultId { get; set; }
    public Guid? SubscriptionId { get; set; }
    public int Amount { get; set; }
    public string Status { get; set; } = "PENDING"; // PENDING, PAID, EXPIRED, CANCELLED, FAILED
    public string? SepayTransactionId { get; set; }
    public string? QrCodeUrl { get; set; }
    public string? SnapshotPlanTier { get; set; }
    public int SnapshotAmount { get; set; }
    public int SnapshotBillingCycleDays { get; set; }
    public int SnapshotStorageQuotaMb { get; set; }
    public int SnapshotAssetLimit { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? PaidAt { get; set; }

    // Navigation
    public Person Person { get; set; } = null!;
    public SubscriptionPlan Plan { get; set; } = null!;
    public OwnerVaultConfig? Vault { get; set; }
    public VaultSubscription? Subscription { get; set; }
    public List<PaymentTransaction> Transactions { get; set; } = new();
    public PaymentReceipt? Receipt { get; set; }
}

public class PaymentTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public string BankTransactionId { get; set; } = string.Empty;
    public int AmountIn { get; set; }
    public DateTime TransactionTime { get; set; } = DateTime.UtcNow;
    public string? RawWebhookPayload { get; set; }

    // Navigation
    public PaymentOrderDb Order { get; set; } = null!;
}

public class PaymentReceipt
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public string ReceiptCode { get; set; } = string.Empty;
    public int AmountPaid { get; set; }
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public PaymentOrderDb Order { get; set; } = null!;
}

public class IdempotencyRecordDb
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string ProviderEventId { get; set; } = string.Empty;
    public string? OrderId { get; set; }
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    public string? ResponsePayloadJson { get; set; }
}
