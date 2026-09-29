using LegacyVault.Prototype.Application.Services;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;
using Xunit;

namespace LegacyVault.Prototype.Tests.BlackBox;

/// <summary>
/// Kiểm thử Phân tích giá trị biên (Boundary Value Analysis - BVA) theo ISTQB Chương 4.3.1 (trang 90, 94-96).
/// Áp dụng phương pháp 2 giá trị (Two-value approach, trang 95): Kiểm tra giá trị tại biên và ngay sát biên liền kề.
/// </summary>
public class BoundaryValueAnalysisTests
{
    private readonly EstatePlanRulesService _rulesService = new();

    #region BVA-01: Biên thời gian xử lý xóa kho nguồn (OPLAN-05: max(freeze_at + 30d, paid_plan_expires_at + 30d))
    // Biên 1: freeze_at lớn hơn paid_plan_expires_at -> mốc xóa căn cứ theo freeze_at + 30 ngày
    // Biên 2: paid_plan_expires_at lớn hơn freeze_at -> mốc xóa căn cứ theo paid_plan_expires_at + 30 ngày
    // Biên 3: freeze_at bằng đúng paid_plan_expires_at -> mốc xóa trùng nhau + 30 ngày

    [Fact]
    public void BVA01_DeletionEligibility_WhenFreezeLaterThanPlanExpiry()
    {
        // Arrange
        var planExpiresAt = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc);
        var freezeAt = new DateTime(2026, 7, 1, 0, 0, 0, DateTimeKind.Utc); // Lớn hơn 2 tháng

        // Act
        var eligibleDate = _rulesService.CalculateDeletionEligibility(
            VaultStatus.FROZEN_INACTIVITY, freezeAt, planExpiresAt, SubscriptionTier.LEGACY_XS);

        // Assert: Phải lấy max là freezeAt + 30 ngày = 2026-07-31
        Assert.NotNull(eligibleDate);
        Assert.Equal(freezeAt.AddDays(30), eligibleDate.Value);
    }

    [Fact]
    public void BVA01_DeletionEligibility_WhenPlanExpiryLaterThanFreeze()
    {
        // Arrange
        var freezeAt = new DateTime(2026, 4, 1, 0, 0, 0, DateTimeKind.Utc);
        var planExpiresAt = new DateTime(2026, 8, 1, 0, 0, 0, DateTimeKind.Utc); // Hạn gói dài hơn

        // Act
        var eligibleDate = _rulesService.CalculateDeletionEligibility(
            VaultStatus.FROZEN_INACTIVITY, freezeAt, planExpiresAt, SubscriptionTier.LEGACY_XS_MAX);

        // Assert: Phải lấy max là planExpiresAt + 30 ngày = 2026-08-31
        Assert.NotNull(eligibleDate);
        Assert.Equal(planExpiresAt.AddDays(30), eligibleDate.Value);
    }
    #endregion

    #region BVA-02: Biên thời hạn suy nghĩ lại 2 năm lịch có ngày nhuận 29/02 (TIME-01)
    // Quy tắc: Nếu đóng băng vào ngày 29/02 thì ngày hết hạn sau 2 năm (năm không nhuận) là ngày 28/02

    [Fact]
    public void BVA02_ReconsiderationExpiry_LeapYearBoundary_Feb29()
    {
        // Arrange: 2024 là năm nhuận (có ngày 29/02). Năm 2026 (sau 2 năm) KHÔNG phải năm nhuận.
        var leapFreezeDate = new DateTime(2024, 2, 29, 14, 30, 0, DateTimeKind.Utc);

        // Act
        var expiry = _rulesService.CalculateReconsiderationExpiry(leapFreezeDate);

        // Assert: Phải rơi vào đúng ngày 28/02/2026, không phát sinh ngoại lệ ArgumentOutOfRangeException
        Assert.Equal(2026, expiry.Year);
        Assert.Equal(2, expiry.Month);
        Assert.Equal(28, expiry.Day);
        Assert.Equal(14, expiry.Hour);
        Assert.Equal(30, expiry.Minute);
    }

    [Fact]
    public void BVA02_ReconsiderationExpiry_StandardCalendarBoundary()
    {
        // Arrange: Ngày thông thường
        var standardFreezeDate = new DateTime(2026, 9, 28, 10, 0, 0, DateTimeKind.Utc);

        // Act
        var expiry = _rulesService.CalculateReconsiderationExpiry(standardFreezeDate);

        // Assert: Đúng 2 năm sau = 2028-09-28
        Assert.Equal(new DateTime(2028, 9, 28, 10, 0, 0, DateTimeKind.Utc), expiry);
    }
    #endregion

    #region BVA-03: Biên số lượng tài sản chỉ định tối thiểu để kích hoạt kế hoạch (SETUP-01)
    // Ranh giới: Số tài sản = 1
    // Giá trị biên không hợp lệ (ngay dưới): 0 tài sản -> Bị từ chối (ERR_SETUP_NO_RECIPIENT_DESIGNATED)
    // Giá trị biên hợp lệ (tại biên): 1 tài sản -> Chấp thuận

    [Theory]
    [InlineData(0, false, ErrorCodes.ERR_SETUP_NO_RECIPIENT_DESIGNATED)] // Dưới biên
    [InlineData(1, true, null)]                                         // Tại biên
    [InlineData(2, true, null)]                                         // Trên biên
    public void BVA03_PlanActivation_DesignatedAssetCountBoundary(int assetCount, bool expectedSuccess, string? expectedErr)
    {
        // Arrange
        var req = new EstatePlanActivationRequest
        {
            PlanId = Guid.NewGuid(),
            Tier = SubscriptionTier.LEGACY_XS,
            PlanExpiresAt = DateTime.UtcNow.AddDays(300),
            IsOwnerMfaVerified = true,
            IsPrimaryExecutorAccepted = true,
            DesignatedAssetCount = assetCount,
            HasOtherActivePlan = false
        };

        // Act
        var result = _rulesService.ValidatePlanActivation(req, DateTime.UtcNow);

        // Assert
        Assert.Equal(expectedSuccess, result.IsSuccess);
        Assert.Equal(expectedErr, result.ErrorCode);
    }
    #endregion
}
