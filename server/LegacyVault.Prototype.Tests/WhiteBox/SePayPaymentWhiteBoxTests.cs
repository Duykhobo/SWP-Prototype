using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace LegacyVault.Prototype.Tests.WhiteBox;

/// <summary>
/// Kiểm thử White-box bao phủ quyết định và nhánh (Decision & Statement Coverage) cho SePayPaymentService.cs.
/// </summary>
public class SePayPaymentWhiteBoxTests
{
    private readonly SePayPaymentService _service;
    private readonly IConfiguration _config;

    public SePayPaymentWhiteBoxTests()
    {
        var settings = new Dictionary<string, string?>
        {
            { "SePay:ApiKey", "SECRET_KEY_123456" },
            { "SePay:BankAccount", "0385966666" },
            { "SePay:BankCode", "MBBank" }
        };
        _config = new ConfigurationBuilder().AddInMemoryCollection(settings).Build();
        _service = new SePayPaymentService(_config, NullLogger<SePayPaymentService>.Instance);
    }

    [Fact]
    public async Task WB_SePay_Branch_InvalidAuth_Returns401()
    {
        // Branch: !isAuthorized
        var payload = new SePayWebhookPayload { Id = 1001, Code = "LV123456", TransferAmount = 199000 };
        var result = await _service.ProcessWebhookAsync(payload, "Apikey WRONG_KEY", null);

        Assert.False(result.Success);
        Assert.Equal(401, result.StatusCode);
    }

    [Fact]
    public async Task WB_SePay_Branch_OrderNotFound_Returns404()
    {
        // Branch: order == null
        var payload = new SePayWebhookPayload { Id = 1002, Code = "LV_NON_EXISTING", Description = "no match", TransferAmount = 199000 };
        var result = await _service.ProcessWebhookAsync(payload, "Apikey SECRET_KEY_123456", null);

        Assert.False(result.Success);
        Assert.Equal(404, result.StatusCode);
        Assert.Equal(ErrorCodes.ERR_PAYMENT_ORDER_NOT_FOUND, result.ErrorCode);
    }

    [Fact]
    public async Task WB_SePay_Branch_InsufficientAmount_Returns400()
    {
        // Branch: payload.TransferAmount < order.SnapshotAmount
        var order = await _service.CreateOrderAsync(SubscriptionTier.LEGACY_XS, Guid.NewGuid());
        var payload = new SePayWebhookPayload
        {
            Id = 1003,
            Code = order.OrderCode,
            Description = order.OrderCode,
            TransferAmount = order.SnapshotAmount - 1000 // Thiếu tiền
        };

        var result = await _service.ProcessWebhookAsync(payload, "Apikey SECRET_KEY_123456", null);

        Assert.False(result.Success);
        Assert.Equal(400, result.StatusCode);
        Assert.Equal(ErrorCodes.ERR_PAYMENT_AMOUNT_INSUFFICIENT, result.ErrorCode);
    }

    [Fact]
    public async Task WB_SePay_Branch_SuccessfulPaid_Returns200()
    {
        // Branch: All validations pass -> order.Status = PAID
        var order = await _service.CreateOrderAsync(SubscriptionTier.LEGACY_XS_MAX, Guid.NewGuid());
        var payload = new SePayWebhookPayload
        {
            Id = 1004,
            Code = order.OrderCode,
            Description = order.OrderCode,
            TransferAmount = order.SnapshotAmount
        };

        var result = await _service.ProcessWebhookAsync(payload, "Apikey SECRET_KEY_123456", null);

        Assert.True(result.Success);
        Assert.Equal(200, result.StatusCode);

        var updatedOrder = await _service.GetOrderByIdAsync(order.Id);
        Assert.NotNull(updatedOrder);
        Assert.Equal(PaymentStatus.PAID, updatedOrder.Status);
    }

    [Fact]
    public async Task WB_SePay_Production_RejectsTestKey_Returns401()
    {
        // Chứng minh: Trong môi trường Production, key thử nghiệm "SEPAY_TEST_API_KEY_2026"
        // tuyệt đối bị từ chối dù hệ thống cấu hình hay không.
        var prodSettings = new Dictionary<string, string?>
        {
            { "ASPNETCORE_ENVIRONMENT", "Production" },
            { "SePay:ApiKey", "PROD_SECURE_VAULT_KEY_8888" },
            { "SePay:BankAccount", "0385966666" },
            { "SePay:BankCode", "MBBank" }
        };
        var prodConfig = new ConfigurationBuilder().AddInMemoryCollection(prodSettings).Build();
        var prodService = new SePayPaymentService(prodConfig, NullLogger<SePayPaymentService>.Instance);

        var payload = new SePayWebhookPayload { Id = 1005, Code = "LV999999", TransferAmount = 199000 };
        
        // Cố gắng dùng test key ở production
        var result = await prodService.ProcessWebhookAsync(payload, "Apikey SEPAY_TEST_API_KEY_2026", null);

        Assert.False(result.Success);
        Assert.Equal(401, result.StatusCode);
    }

    [Fact]
    public async Task WB_SePay_Production_RejectsEmptyAuth_Returns401()
    {
        // Chứng minh: Trong môi trường Production, webhook không có header xác thực bị từ chối ngay lập tức
        var prodSettings = new Dictionary<string, string?>
        {
            { "ASPNETCORE_ENVIRONMENT", "Production" },
            { "SePay:ApiKey", "PROD_SECURE_VAULT_KEY_8888" }
        };
        var prodConfig = new ConfigurationBuilder().AddInMemoryCollection(prodSettings).Build();
        var prodService = new SePayPaymentService(prodConfig, NullLogger<SePayPaymentService>.Instance);

        var payload = new SePayWebhookPayload { Id = 1006, Code = "LV999999", TransferAmount = 199000 };
        var result = await prodService.ProcessWebhookAsync(payload, null, null);

        Assert.False(result.Success);
        Assert.Equal(401, result.StatusCode);
    }

    [Fact]
    public async Task WB_SePay_Production_AcceptsValidProdKey()
    {
        // Chứng minh: Trong môi trường Production, chỉ có đúng PROD secret key mới được chấp nhận
        var prodSettings = new Dictionary<string, string?>
        {
            { "ASPNETCORE_ENVIRONMENT", "Production" },
            { "SePay:ApiKey", "PROD_SECURE_VAULT_KEY_8888" },
            { "SePay:BankAccount", "0385966666" },
            { "SePay:BankCode", "MBBank" }
        };
        var prodConfig = new ConfigurationBuilder().AddInMemoryCollection(prodSettings).Build();
        var prodService = new SePayPaymentService(prodConfig, NullLogger<SePayPaymentService>.Instance);

        var order = await prodService.CreateOrderAsync(SubscriptionTier.LEGACY_XS, Guid.NewGuid());
        var payload = new SePayWebhookPayload
        {
            Id = 1007,
            Code = order.OrderCode,
            Description = order.OrderCode,
            TransferAmount = order.SnapshotAmount
        };

        var result = await prodService.ProcessWebhookAsync(payload, "Apikey PROD_SECURE_VAULT_KEY_8888", null);

        Assert.True(result.Success);
        Assert.Equal(200, result.StatusCode);
    }
}
