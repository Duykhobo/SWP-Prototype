using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;

namespace LegacyVault.Prototype.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentOrder> CreateOrderAsync(SubscriptionTier tier, Guid personId);
    Task<WebhookProcessResult> ProcessWebhookAsync(SePayWebhookPayload payload, string? authHeader, string? signature);
    Task<PaymentOrder> SimulatePaymentSuccessAsync(Guid orderId);
    Task<PaymentOrder?> GetOrderByIdAsync(Guid orderId);
    Task<PaymentOrder?> GetOrderByCodeAsync(string orderCode);
    IEnumerable<PaymentOrder> GetAllOrders();
}
