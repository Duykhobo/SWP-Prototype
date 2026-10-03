using System.ComponentModel.DataAnnotations;

namespace LegacyVault.Prototype.Domain.Entities;

public class Person
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string? IdentityCard { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User? User { get; set; }
}

public class User
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PersonId { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PasswordSalt { get; set; } = string.Empty;
    public string Roles { get; set; } = "OWNER";
    public string Status { get; set; } = "ACTIVE";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Person Person { get; set; } = null!;
}

public class OwnerVaultConfig
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OwnerPersonId { get; set; }
    public string Title { get; set; } = "Két Di Sản Mặc Định";
    public string Status { get; set; } = "ACTIVE";
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
}

public class Case
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid VaultId { get; set; }
    public Guid EstatePlanId { get; set; }
    public Guid ExecutorPersonId { get; set; }
    public Guid? VerifierPersonId { get; set; }
    public string Status { get; set; } = "DRAFT"; // DRAFT, SUBMITTED, APPROVED, REJECTED, CLOSED
    public string? RejectionReason { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? DecidedAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<CaseBundle> CaseBundles { get; set; } = new();
}

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

    public Case Case { get; set; } = null!;
    public List<CaseBundleItem> Items { get; set; } = new();
    public List<BeneficiaryHandoverDecision> Decisions { get; set; } = new();
    public List<Commitment> Commitments { get; set; } = new();
    public List<AccessGrant> AccessGrants { get; set; } = new();
}

public class CaseBundleItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseBundleId { get; set; }
    public Guid AssetId { get; set; }
    public Guid ContentVersionId { get; set; }
    public Guid AssetDesignationVersionId { get; set; }
    public string Title { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string MimeType { get; set; } = "application/octet-stream";
    public string CiphertextHash { get; set; } = string.Empty;
    public string CiphertextStorageKey { get; set; } = string.Empty;
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    public CaseBundle CaseBundle { get; set; } = null!;
}

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

    public CaseBundle CaseBundle { get; set; } = null!;
    public Commitment? Commitment { get; set; }
}

public class Commitment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseBundleId { get; set; }
    public Guid CaseId { get; set; }
    public Guid? WorkSessionId { get; set; }
    public string PolicyMode { get; set; } = "ALL_OR_NOTHING"; // ALL_OR_NOTHING, INDIVIDUAL
    public DateTime CommittedAt { get; set; } = DateTime.UtcNow;
    public string LegalAcknowledgment { get; set; } = string.Empty;
    public string? ClientIpAddress { get; set; }
    public string? UserAgent { get; set; }

    public CaseBundle CaseBundle { get; set; } = null!;
    public List<BeneficiaryHandoverDecision> Decisions { get; set; } = new();
    public List<AccessGrant> AccessGrants { get; set; } = new();
}

public class RecipientAuthorization
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseBundleId { get; set; }
    public Guid BeneficiaryPersonId { get; set; }
    public Guid ExecutorPersonId { get; set; }
    public Guid? WorkSessionId { get; set; }
    public bool IsAuthorized { get; set; } = true;
    public DateTime AuthorizedAt { get; set; } = DateTime.UtcNow;
    public bool FaceMatched { get; set; } = true;
    public bool NationalIdMatched { get; set; } = true;
    public bool InteractiveChallengePassed { get; set; } = true;
    public string? Notes { get; set; }
}

public class AccessGrant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseBundleId { get; set; }
    public Guid CaseId { get; set; }
    public Guid RecipientPersonId { get; set; }
    public Guid CommitmentId { get; set; }
    public string Status { get; set; } = "ACTIVE"; // ACTIVE, REVOKED, EXPIRED, FINALIZED
    public string DownloadToken { get; set; } = Guid.NewGuid().ToString("N");
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(72); // 72 giờ chuẩn hóa

    public CaseBundle CaseBundle { get; set; } = null!;
    public Commitment Commitment { get; set; } = null!;
    public List<DownloadEvent> DownloadEvents { get; set; } = new();
    public HandoverReceipt? HandoverReceipt { get; set; }
}

public class DownloadEvent
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AccessGrantId { get; set; }
    public Guid CaseBundleId { get; set; }
    public Guid AssetId { get; set; }
    public Guid ContentVersionId { get; set; }
    public DateTime ServedAt { get; set; } = DateTime.UtcNow;
    public long BytesServed { get; set; }
    public string? ClientIpAddress { get; set; }
    public string? UserAgent { get; set; }

    public AccessGrant AccessGrant { get; set; } = null!;
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

    public AccessGrant AccessGrant { get; set; } = null!;
}
