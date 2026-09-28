using LegacyVault.Prototype.Domain;

namespace LegacyVault.Prototype.Application.DTOs;

public class CreatePaymentOrderRequest
{
    public SubscriptionTier PlanTier { get; set; }
    public Guid? PersonId { get; set; }
}

public class SePayWebhookPayload
{
    public long Id { get; set; }
    public string Gateway { get; set; } = string.Empty;
    public string TransactionDate { get; set; } = string.Empty;
    public string AccountNumber { get; set; } = string.Empty;
    public string? SubAccount { get; set; }
    public string Code { get; set; } = string.Empty; // Mã đơn hàng (VD: LV123456)
    public string Content { get; set; } = string.Empty;
    public string TransferType { get; set; } = string.Empty; // in
    public string Description { get; set; } = string.Empty;
    public long TransferAmount { get; set; }
    public string? ReferenceCode { get; set; }
    public string? Accumulated { get; set; }
}

public class WebhookProcessResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? ErrorCode { get; set; }
    public int StatusCode { get; set; } = 200;
}
