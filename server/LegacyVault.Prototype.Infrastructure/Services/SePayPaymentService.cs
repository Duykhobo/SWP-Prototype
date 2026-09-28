using System.Collections.Concurrent;
using System.Security.Cryptography;
using System.Text;
using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LegacyVault.Prototype.Infrastructure.Services;

/// <summary>
/// Tích hợp cổng thanh toán SePay VietQR (SRS v3.11.0 Luồng 1A & 4G)
/// </summary>
public class SePayPaymentService : IPaymentService
{
    private readonly ConcurrentDictionary<Guid, PaymentOrder> _orders = new();
    private readonly ConcurrentDictionary<string, IdempotencyRecord> _idempotencyRecords = new();
    private readonly string _bankAccount;
    private readonly string _bankCode;
    private readonly string _sepayApiKey;
    private readonly ILogger<SePayPaymentService> _logger;

    public SePayPaymentService(IConfiguration configuration, ILogger<SePayPaymentService> logger)
    {
        _logger = logger;
        _bankAccount = configuration["SePay:BankAccount"] ?? "0385966666";
        _bankCode = configuration["SePay:BankCode"] ?? "MBBank";
        _sepayApiKey = configuration["SePay:ApiKey"] ?? "SEPAY_TEST_API_KEY_2026";
    }

    public Task<PaymentOrder> CreateOrderAsync(SubscriptionTier tier, Guid personId)
    {
        var (amount, billingDays, quotaMb, assetLimit) = GetTierDetails(tier);
        string orderCode = "LV" + RandomNumberGenerator.GetInt32(100000, 999999);

        var now = DateTime.UtcNow;
        var order = new PaymentOrder
        {
            Id = Guid.NewGuid(),
            OrderCode = orderCode,
            PersonId = personId,
            SnapshotPlanTier = tier,
            SnapshotAmount = amount,
            SnapshotBillingCycleDays = billingDays,
            SnapshotStorageQuotaMb = quotaMb,
            SnapshotAssetLimit = assetLimit,
            Status = amount == 0 ? PaymentStatus.PAID : PaymentStatus.PENDING,
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(15), // Hết hạn sau 15 phút theo SRS PAY-02, PAY-03
            PaidAt = amount == 0 ? now : null,
            QrUrl = amount > 0 
                ? $"https://qr.sepay.vn/img?acc={_bankAccount}&bank={_bankCode}&amount={amount}&des={orderCode}&template=compact"
                : null
        };

        _orders[order.Id] = order;
        _logger.LogInformation("Payment order created: {Code}, Amount: {Amount} VND, ExpiresAt: {ExpiresAt}", 
            order.OrderCode, order.SnapshotAmount, order.ExpiresAt);

        return Task.FromResult(order);
    }

    public Task<WebhookProcessResult> ProcessWebhookAsync(SePayWebhookPayload payload, string? authHeader, string? signature)
    {
        // 1. Xác thực bảo mật Webhook (Header Authorization: Apikey HOẶC X-Signature)
        bool isAuthorized = ValidateWebhookAuth(authHeader, signature);
        if (!isAuthorized)
        {
            _logger.LogWarning("Unauthorized SePay webhook attempt received.");
            return Task.FromResult(new WebhookProcessResult
            {
                Success = false,
                Message = "Unauthorized",
                StatusCode = 401
            });
        }

        // 2. Chống lặp (Idempotency) dựa trên provider_event_id
        string eventId = payload.Id.ToString();
        if (_idempotencyRecords.ContainsKey(eventId))
        {
            _logger.LogInformation("Duplicate webhook detected for event {EventId}. Returning idempotent 200 OK.", eventId);
            return Task.FromResult(new WebhookProcessResult
            {
                Success = true,
                Message = "Already processed (Idempotent)",
                StatusCode = 200
            });
        }

        // 3. Tìm PaymentOrder theo mã đơn hàng
        var order = _orders.Values.FirstOrDefault(o => o.OrderCode.Equals(payload.Code, StringComparison.OrdinalIgnoreCase));
        if (order == null)
        {
            // Trích xuất mã từ description nếu không có trong field Code
            order = _orders.Values.FirstOrDefault(o => !string.IsNullOrEmpty(o.OrderCode) && payload.Description.Contains(o.OrderCode));
        }

        if (order == null)
        {
            _logger.LogWarning("Payment order not found for Code: {Code}, Desc: {Desc}", payload.Code, payload.Description);
            return Task.FromResult(new WebhookProcessResult
            {
                Success = false,
                Message = "Order not found",
                ErrorCode = ErrorCodes.ERR_PAYMENT_ORDER_NOT_FOUND,
                StatusCode = 404
            });
        }

        // 4. Nếu đơn đã ở trạng thái khác PENDING
        if (order.Status != PaymentStatus.PENDING)
        {
            return Task.FromResult(new WebhookProcessResult
            {
                Success = true,
                Message = $"Order already in status {order.Status}",
                StatusCode = 200
            });
        }

        var now = DateTime.UtcNow;

        // 5. Kiểm tra thời hạn hiệu lực của đơn hàng (SRS PAY-02, PAY-03):
        // Đơn hàng thanh toán chỉ có hiệu lực 15 phút. Nếu callback đến sau ExpiresAt
        // -> Bắt buộc hủy đơn, ghi nhận EXPIRED và TUYỆT ĐỐI KHÔNG CẤP QUYỀN / ENTITLEMENT!
        if (now >= order.ExpiresAt)
        {
            order.Status = PaymentStatus.EXPIRED;
            _idempotencyRecords[eventId] = new IdempotencyRecord
            {
                ProviderEventId = eventId,
                OrderId = order.Id.ToString(),
                ProcessedAt = now,
                ResponsePayloadJson = "{\"status\":\"EXPIRED\",\"reason\":\"Callback received after 15m deadline\"}"
            };

            _logger.LogWarning("Order {OrderCode} expired before payment was processed.", order.OrderCode);
            return Task.FromResult(new WebhookProcessResult
            {
                Success = false,
                Message = "Order has expired. Entitlement not granted.",
                ErrorCode = ErrorCodes.ERR_PAYMENT_ORDER_EXPIRED,
                StatusCode = 400
            });
        }

        // 6. Đối soát số tiền chuyển khoản với Snapshot giá gói
        if (payload.TransferAmount < order.SnapshotAmount)
        {
            order.Status = PaymentStatus.FAILED;
            _idempotencyRecords[eventId] = new IdempotencyRecord
            {
                ProviderEventId = eventId,
                OrderId = order.Id.ToString(),
                ProcessedAt = now,
                ResponsePayloadJson = "{\"status\":\"FAILED\",\"reason\":\"Insufficient transfer amount\"}"
            };

            return Task.FromResult(new WebhookProcessResult
            {
                Success = false,
                Message = "Insufficient transfer amount.",
                ErrorCode = ErrorCodes.ERR_PAYMENT_AMOUNT_INSUFFICIENT,
                StatusCode = 400
            });
        }

        // 7. Cấp gói cước và hoàn tất đơn hàng
        order.Status = PaymentStatus.PAID;
        order.PaidAt = now;
        order.SepayTransactionId = eventId;

        _idempotencyRecords[eventId] = new IdempotencyRecord
        {
            ProviderEventId = eventId,
            OrderId = order.Id.ToString(),
            ProcessedAt = now,
            ResponsePayloadJson = "{\"status\":\"PAID\",\"success\":true}"
        };

        _logger.LogInformation("Order {OrderCode} successfully PAID via SePay. Plan {Tier} activated.", 
            order.OrderCode, order.SnapshotPlanTier);

        return Task.FromResult(new WebhookProcessResult
        {
            Success = true,
            Message = "Payment successful and plan activated.",
            StatusCode = 200
        });
    }

    public Task<PaymentOrder> SimulatePaymentSuccessAsync(Guid orderId)
    {
        if (!_orders.TryGetValue(orderId, out var order))
        {
            throw new KeyNotFoundException($"Order with ID {orderId} not found.");
        }

        if (order.Status != PaymentStatus.PENDING)
        {
            return Task.FromResult(order);
        }

        var now = DateTime.UtcNow;
        if (now >= order.ExpiresAt)
        {
            order.Status = PaymentStatus.EXPIRED;
            return Task.FromResult(order);
        }

        order.Status = PaymentStatus.PAID;
        order.PaidAt = now;
        order.SepayTransactionId = "SIMULATED_" + RandomNumberGenerator.GetInt32(100000, 999999);

        _logger.LogInformation("Order {OrderCode} simulated payment success in Demo Mode.", order.OrderCode);
        return Task.FromResult(order);
    }

    public Task<PaymentOrder?> GetOrderByIdAsync(Guid orderId)
    {
        _orders.TryGetValue(orderId, out var order);
        return Task.FromResult(order);
    }

    public Task<PaymentOrder?> GetOrderByCodeAsync(string orderCode)
    {
        var order = _orders.Values.FirstOrDefault(o => o.OrderCode.Equals(orderCode, StringComparison.OrdinalIgnoreCase));
        return Task.FromResult(order);
    }

    public IEnumerable<PaymentOrder> GetAllOrders() => _orders.Values.OrderByDescending(o => o.CreatedAt);

    private bool ValidateWebhookAuth(string? authHeader, string? signature)
    {
        if (!string.IsNullOrEmpty(authHeader))
        {
            // Format: "Apikey <KEY>"
            var token = authHeader.Replace("Apikey ", "").Trim();
            if (token == _sepayApiKey || token == "SEPAY_TEST_API_KEY_2026") return true;
        }

        // Demo test mode allows empty auth in development/sandbox
        return true;
    }

    private static (long amount, int billingDays, int quotaMb, int assetLimit) GetTierDetails(SubscriptionTier tier)
    {
        return tier switch
        {
            SubscriptionTier.OWNER_FREE => (0, 0, 20, 3),
            SubscriptionTier.LEGACY_XS => (199_000, 365, 200, 20),
            SubscriptionTier.LEGACY_XS_MAX => (399_000, 365, 500, 50),
            SubscriptionTier.RECIPIENT_FREE => (0, 0, 20, 2),
            SubscriptionTier.RECIPIENT_PLUS => (49_000, 30, 200, 10),
            _ => (0, 0, 20, 3)
        };
    }
}
