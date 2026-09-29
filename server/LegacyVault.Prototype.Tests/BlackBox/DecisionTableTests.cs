using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Services;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;
using LegacyVault.Prototype.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace LegacyVault.Prototype.Tests.BlackBox;

/// <summary>
/// Kiểm thử Bảng quyết định (Decision Table Testing) theo ISTQB Chương 4.3.2 (trang 96-101, Bảng 4.6 & 4.8).
/// </summary>
public class DecisionTableTests
{
    private readonly EstatePlanRulesService _planService = new();

    #region Bảng quyết định DT-01: Thẩm định điều kiện kích hoạt Kế hoạch di sản (SETUP-01)
    /*
    +-----------------------------------------------+----+----+----+----+----+----+----+
    | Điều kiện (Conditions)                        | R1 | R2 | R3 | R4 | R5 | R6 | R7 |
    +-----------------------------------------------+----+----+----+----+----+----+----+
    | C1: Gói trả phí hợp lệ (XS/XS Max)           | T  | F  | T  | T  | T  | T  | T  |
    | C2: Gói chưa hết hạn (now < PlanExpiresAt)    | T  | -  | F  | T  | T  | T  | T  |
    | C3: Chủ sở hữu đã xác thực MFA                | T  | -  | -  | F  | T  | T  | T  |
    | C4: Executor chính đã chấp thuận nhiệm vụ     | T  | -  | -  | -  | F  | T  | T  |
    | C5: Có >= 1 tài sản được gán người nhận hợp lệ| T  | -  | -  | -  | -  | F  | T  |
    | C6: Không có kế hoạch khác đang hoạt động    | F  | -  | -  | -  | -  | -  | T  |
    +-----------------------------------------------+----+----+----+----+----+----+----+
    | Hành động (Actions / Expected Outcomes)       |    |    |    |    |    |    |    |
    +-----------------------------------------------+----+----+----+----+----+----+----+
    | A1: Kích hoạt thành công (IsSuccess = true)   | X  |    |    |    |    |    |    |
    | A2: Báo lỗi ERR_PLAN_TIER_NOT_ELIGIBLE        |    | X  |    |    |    |    |    |
    | A3: Báo lỗi ERR_PLAN_EXPIRED                  |    |    | X  |    |    |    |    |
    | A4: Báo lỗi ERR_MFA_REQUIRED                  |    |    |    | X  |    |    |    |
    | A5: Báo lỗi ERR_EXECUTOR_NOT_ACCEPTED         |    |    |    |    | X  |    |    |
    | A6: Báo lỗi ERR_SETUP_NO_RECIPIENT_DESIGNATED |    |    |    |    |    | X  |    |
    | A7: Báo lỗi ERR_ANOTHER_PLAN_ACTIVE           |    |    |    |    |    |    | X  |
    +-----------------------------------------------+----+----+----+----+----+----+----+
    */

    [Theory]
    [InlineData(SubscriptionTier.LEGACY_XS, 10, true, true, 1, false, true, null)]                                       // Rule 1: Thỏa mãn tất cả -> Kích hoạt thành công
    [InlineData(SubscriptionTier.OWNER_FREE, 10, true, true, 1, false, false, "ERR_PLAN_TIER_NOT_ELIGIBLE")]            // Rule 2: Gói Free không hợp lệ
    [InlineData(SubscriptionTier.LEGACY_XS, -1, true, true, 1, false, false, "ERR_PLAN_EXPIRED")]                       // Rule 3: Gói trả phí đã hết hạn
    [InlineData(SubscriptionTier.LEGACY_XS, 10, false, true, 1, false, false, "ERR_MFA_REQUIRED")]                      // Rule 4: Chưa xác thực MFA
    [InlineData(SubscriptionTier.LEGACY_XS_MAX, 10, true, false, 1, false, false, "ERR_EXECUTOR_NOT_ACCEPTED")]         // Rule 5: Executor chưa chấp thuận
    [InlineData(SubscriptionTier.LEGACY_XS, 10, true, true, 0, false, false, ErrorCodes.ERR_SETUP_NO_RECIPIENT_DESIGNATED)] // Rule 6: Chưa gán tài sản
    [InlineData(SubscriptionTier.LEGACY_XS, 10, true, true, 1, true, false, "ERR_ANOTHER_PLAN_ACTIVE")]                 // Rule 7: Đã có kế hoạch khác đang chạy
    public void DT01_PlanActivation_DecisionRules(
        SubscriptionTier tier,
        int daysUntilExpiry,
        bool mfaVerified,
        bool executorAccepted,
        int designatedCount,
        bool hasOtherActivePlan,
        bool expectedSuccess,
        string? expectedErrorCode)
    {
        // Arrange
        var now = DateTime.UtcNow;
        var req = new EstatePlanActivationRequest
        {
            PlanId = Guid.NewGuid(),
            Tier = tier,
            PlanExpiresAt = now.AddDays(daysUntilExpiry),
            IsOwnerMfaVerified = mfaVerified,
            IsPrimaryExecutorAccepted = executorAccepted,
            DesignatedAssetCount = designatedCount,
            HasOtherActivePlan = hasOtherActivePlan
        };

        // Act
        var result = _planService.ValidatePlanActivation(req, now);

        // Assert
        Assert.Equal(expectedSuccess, result.IsSuccess);
        Assert.Equal(expectedErrorCode, result.ErrorCode);
    }
    #endregion

    #region Bảng quyết định DT-02: Hai xác nhận cam kết trách nhiệm trước bàn giao (DEATH-02, AC-12)
    /*
    +-----------------------------------------------+----+----+----+----+
    | Điều kiện (Conditions)                        | R1 | R2 | R3 | R4 |
    +-----------------------------------------------+----+----+----+----+
    | C1: Executor đã tick ô cam kết trách nhiệm   | T  | T  | F  | F  |
    | C2: Verifier đã tick ô cam kết trách nhiệm   | T  | F  | T  | F  |
    +-----------------------------------------------+----+----+----+----+
    | Hành động (Actions / Expected Outcomes)       |    |    |    |    |
    +-----------------------------------------------+----+----+----+----+
    | A1: Thẩm định đạt (Cho phép phê duyệt hồ sơ)  | X  |    |    |    |
    | A2: Chặn phê duyệt (Bắt buộc đủ 2 cam kết)   |    | X  | X  | X  |
    +-----------------------------------------------+----+----+----+----+
    */

    [Theory]
    [InlineData(true, true, true)]    // Rule 1: Cả 2 đều tick -> Phê duyệt thành công
    [InlineData(true, false, false)]  // Rule 2: Verifier chưa tick -> Chặn
    [InlineData(false, true, false)]  // Rule 3: Executor chưa tick -> Chặn
    [InlineData(false, false, false)] // Rule 4: Cả 2 chưa tick -> Chặn
    public void DT02_LegalAttestation_DecisionRules(bool executorAttested, bool verifierAttested, bool expectedResult)
    {
        // Act
        bool canProceed = _planService.ValidateDeathAttestation(executorAttested, verifierAttested);

        // Assert
        Assert.Equal(expectedResult, canProceed);
    }
    #endregion

    #region Bảng quyết định DT-03: Xử lý Webhook SePay VietQR (Idempotency & Thời hạn)
    [Fact]
    public async Task DT03_SePayWebhook_IdempotencyAndExpiryRules()
    {
        // Arrange
        var inMemoryConfig = new Dictionary<string, string?>
        {
            {"SePay:ApiKey", "SEPAY_TEST_API_KEY_2026"},
            {"SePay:BankAccount", "0385966666"},
            {"SePay:BankCode", "MBBank"}
        };
        var config = new ConfigurationBuilder().AddInMemoryCollection(inMemoryConfig).Build();
        var paymentService = new SePayPaymentService(config, NullLogger<SePayPaymentService>.Instance);

        var personId = Guid.NewGuid();
        var order = await paymentService.CreateOrderAsync(SubscriptionTier.LEGACY_XS, personId);

        var payload = new SePayWebhookPayload
        {
            Id = 99887711,
            Code = order.OrderCode,
            Description = $"Thanh toan don hang {order.OrderCode}",
            TransferAmount = order.SnapshotAmount
        };

        // Act 1: Lần đầu tiên webhook gửi tới -> Trả về HTTP 200 và chuyển trạng thái PAID
        var result1 = await paymentService.ProcessWebhookAsync(payload, "Apikey SEPAY_TEST_API_KEY_2026", null);
        Assert.True(result1.Success);
        Assert.Equal(200, result1.StatusCode);

        // Act 2: Webhook gửi lặp lại (Duplicate eventId) -> Idempotent HTTP 200, không bị nhân đôi quyền
        var resultDuplicate = await paymentService.ProcessWebhookAsync(payload, "Apikey SEPAY_TEST_API_KEY_2026", null);
        Assert.True(resultDuplicate.Success);
        Assert.Equal(200, resultDuplicate.StatusCode);
        Assert.Contains("Idempotent", resultDuplicate.Message);
    }
    #endregion
}
