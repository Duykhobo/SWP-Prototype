namespace LegacyVault.Prototype.Domain.Models;

public class PaymentOrder
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string OrderCode { get; set; } = string.Empty;
    public Guid PersonId { get; set; }
    public SubscriptionTier SnapshotPlanTier { get; set; }
    public long SnapshotAmount { get; set; }
    public int SnapshotBillingCycleDays { get; set; }
    public int SnapshotStorageQuotaMb { get; set; }
    public int SnapshotAssetLimit { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.PENDING;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? PaidAt { get; set; }
    public string? SepayTransactionId { get; set; }
    public string? QrUrl { get; set; }
}

public class IdempotencyRecord
{
    public string ProviderEventId { get; set; } = string.Empty;
    public string OrderId { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; } = DateTime.UtcNow;
    public string ResponsePayloadJson { get; set; } = string.Empty;
}
