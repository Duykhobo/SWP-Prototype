namespace LegacyVault.Prototype.Domain.Models;

public enum RecipientMode
{
    SINGLE_RECIPIENT,
    CO_OWNED
}

public enum TransferChoiceStatus
{
    ACTIVE,
    REPLACED,
    CANCELLED,
    FINALIZED
}

public class AssetDesignationItem
{
    public Guid AssetId { get; set; }
    public string AssetName { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public HashSet<Guid> RecipientPersonIds { get; set; } = new();
}

public class HandoverVaultModel
{
    public Guid HandoverVaultId { get; set; } = Guid.NewGuid();
    public Guid PlanId { get; set; }
    public RecipientMode RecipientMode { get; set; }
    public HashSet<Guid> RecipientPersonIds { get; set; } = new();
    public List<Guid> AssetIds { get; set; } = new();
    public HandoverStatus Status { get; set; } = HandoverStatus.PRE_BUNDLED;
    public Guid? OriginalRecipientId { get; set; }
    public Guid? CurrentTargetRecipientId { get; set; }
    public TransferChoiceStatus TransferStatus { get; set; } = TransferChoiceStatus.ACTIVE;
    public DateTime? FreezeStartedAt { get; set; }
    public DateTime? FreezeExpiresAt { get; set; }
    public Dictionary<Guid, bool> RecipientDecisions { get; set; } = new();
}

public class EstatePlanActivationRequest
{
    public Guid PlanId { get; set; }
    public SubscriptionTier Tier { get; set; }
    public DateTime PlanExpiresAt { get; set; }
    public bool IsOwnerMfaVerified { get; set; }
    public bool IsPrimaryExecutorAccepted { get; set; }
    public int DesignatedAssetCount { get; set; }
    public bool HasOtherActivePlan { get; set; }
}

public class PlanActivationResult
{
    public bool IsSuccess { get; set; }
    public string? ErrorCode { get; set; }
    public string Message { get; set; } = string.Empty;
}
