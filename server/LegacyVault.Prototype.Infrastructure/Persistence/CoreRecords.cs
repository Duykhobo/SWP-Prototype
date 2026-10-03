namespace LegacyVault.Prototype.Infrastructure.Persistence;

// Persistence records are separate from the in-memory testbench DTOs.
public class PersonRecord
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = "";
    public string? Phone { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class UserRecord
{
    public Guid Id { get; set; }
    public Guid PersonId { get; set; }
    public PersonRecord Person { get; set; } = null!;
    public string Email { get; set; } = "";
    public string NormalizedEmail { get; set; } = "";
    public string? PasswordHash { get; set; }
    public string? GoogleSubject { get; set; }
    public string Roles { get; set; } = "OWNER,BENEFICIARY";
    public bool IsDisabled { get; set; }
    public bool IsDemo { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}

public class CaseRecord
{
    public Guid Id { get; set; }
    public Guid OwnerPersonId { get; set; }
    public Guid ExecutorPersonId { get; set; }
    public string Status { get; set; } = "DRAFT";
    public DateTimeOffset? SubmittedAt { get; set; }
    public bool RescueHold { get; set; }
    public bool SecurityHold { get; set; }
    public bool LegalHold { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public class CaseBundleRecord
{
    public Guid Id { get; set; }
    public Guid CaseId { get; set; }
    public CaseRecord Case { get; set; } = null!;
    public string Name { get; set; } = "";
    public string GroupPolicy { get; set; } = "ALL_OR_NOTHING";
    public DateTimeOffset? SnapshottedAt { get; set; }
    public DateTimeOffset? HandoverNotBefore { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public class CaseBundleItemRecord
{
    public Guid Id { get; set; }
    public Guid CaseBundleId { get; set; }
    public CaseBundleRecord CaseBundle { get; set; } = null!;
    public Guid AssetId { get; set; }
    public Guid ContentVersionId { get; set; }
    public Guid DesignationVersionId { get; set; }
}

public class CaseBundleItemRecipientRecord
{
    public Guid CaseBundleId { get; set; }
    public Guid CaseBundleItemId { get; set; }
    public CaseBundleItemRecord CaseBundleItem { get; set; } = null!;
    public Guid RecipientPersonId { get; set; }
}

public class CommitmentRecord
{
    public Guid Id { get; set; }
    public Guid CaseBundleId { get; set; }
    public DateTimeOffset CommittedAt { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public class BeneficiaryHandoverDecisionRecord
{
    public Guid Id { get; set; }
    public Guid CaseBundleId { get; set; }
    public Guid RecipientPersonId { get; set; }
    public string DecisionStatus { get; set; } = "ACCEPTED";
    public DateTimeOffset DecidedAt { get; set; }
    public Guid? CommitmentId { get; set; }
}

public class RecipientAuthorizationRecord
{
    public Guid Id { get; set; }
    public Guid CaseBundleId { get; set; }
    public Guid RecipientPersonId { get; set; }
    public Guid ExecutorPersonId { get; set; }
    public Guid EvidenceId { get; set; }
    public DateTimeOffset AuthorizedAt { get; set; }
}

public class AccessGrantRecord
{
    public Guid Id { get; set; }
    public Guid CaseBundleId { get; set; }
    public Guid RecipientPersonId { get; set; }
    public Guid CommitmentId { get; set; }
    public string Status { get; set; } = "ACTIVE";
    public DateTimeOffset IssuedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    // Store the digest, never a bearer download credential in plaintext.
    public string DownloadTokenHash { get; set; } = "";
    public byte[] RowVersion { get; set; } = [];
}

public class AccessGrantItemRecord
{
    public Guid AccessGrantId { get; set; }
    public Guid CaseBundleItemId { get; set; }
    public Guid CaseBundleId { get; set; }
    public Guid RecipientPersonId { get; set; }
}
