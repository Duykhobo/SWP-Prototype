using LegacyVault.Prototype.Application.Common;
using LegacyVault.Prototype.Application.Services;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;
using Xunit;

namespace LegacyVault.Prototype.Tests.BlackBox;

/// <summary>
/// Kiểm thử Phân vùng tương đương (Equivalence Partitioning - EP) theo ISTQB Chương 4.3.1 (trang 89-94).
/// </summary>
public class EquivalencePartitioningTests
{
    private readonly EstatePlanRulesService _rulesService = new();

    #region EP-01: Phân vùng định dạng địa chỉ Email (RFC 5322)
    // Lớp hợp lệ: E1: Email có user, ký tự @, domain và TLD hợp lệ (vd: user@example.com) -> True
    // Lớp không hợp lệ: E2: Thiếu ký tự @ (vd: userexample.com) -> False
    // Lớp không hợp lệ: E3: Thiếu domain/TLD (vd: user@) -> False
    // Lớp không hợp lệ: E4: Chuỗi rỗng hoặc khoảng trắng (vd: "") -> False
    // Lớp không hợp lệ: E5: Null -> False

    [Theory]
    [InlineData("valid.owner@legacyvault.vn", true)]    // E1: Đại diện hợp lệ
    [InlineData("test.user+tag@domain.co", true)]       // E1: Đại diện hợp lệ có dấu cộng
    [InlineData("invalidemail.without.at", false)]       // E2: Đại diện không có @
    [InlineData("user@domain_no_dot", false)]           // E3: Đại diện không có TLD hợp lệ
    [InlineData("", false)]                             // E4: Chuỗi rỗng
    [InlineData("   ", false)]                          // E4: Khoảng trắng
    [InlineData(null, false)]                           // E5: Giá trị null
    public void EP01_EmailFormatValidation_Partitions(string? email, bool expectedValid)
    {
        // Act
        bool actual = EmailUtils.IsValidEmail(email);

        // Assert
        Assert.Equal(expectedValid, actual);
    }
    #endregion

    #region EP-02: Phân vùng nhóm Người thụ hưởng khi tự gom kho bàn giao (SETUP-05, ASSET-04, AC-01)
    // Lớp không hợp lệ / Chưa kích hoạt: R1: Tập người nhận rỗng (0 người) -> Bị loại khỏi kho bàn giao (NOT_IN_ESTATE_PLAN)
    // Lớp hợp lệ 1: R2: Tập người nhận có đúng 1 người -> Kho một người (SINGLE_RECIPIENT)
    // Lớp hợp lệ 2: R3: Tập người nhận có >= 2 người -> Kho đồng sở hữu (CO_OWNED)

    [Fact]
    public void EP02_VaultConsolidation_RecipientPartitions()
    {
        // Arrange
        var planId = Guid.NewGuid();
        var person1 = Guid.NewGuid();
        var person2 = Guid.NewGuid();
        var person3 = Guid.NewGuid();

        var assets = new List<AssetDesignationItem>
        {
            // R1: 0 người nhận
            new() { AssetId = Guid.NewGuid(), AssetName = "Tài sản chưa gán", RecipientPersonIds = new HashSet<Guid>() },

            // R2: Đúng 1 người nhận (person1)
            new() { AssetId = Guid.NewGuid(), AssetName = "Tài sản A", RecipientPersonIds = new HashSet<Guid> { person1 } },
            new() { AssetId = Guid.NewGuid(), AssetName = "Tài sản C", RecipientPersonIds = new HashSet<Guid> { person1 } },

            // R3: 2 người nhận (person1 + person2)
            new() { AssetId = Guid.NewGuid(), AssetName = "Tài sản B", RecipientPersonIds = new HashSet<Guid> { person1, person2 } },

            // R2: Đúng 1 người nhận khác (person3)
            new() { AssetId = Guid.NewGuid(), AssetName = "Tài sản D", RecipientPersonIds = new HashSet<Guid> { person3 } }
        };

        // Act
        var vaults = _rulesService.ConsolidateVaults(planId, assets);

        // Assert
        // Phải gom thành đúng 3 kho (R2 cho person1, R3 cho person1+person2, R2 cho person3); tài sản rỗng R1 bị loại
        Assert.Equal(3, vaults.Count);

        var vaultP1 = vaults.Single(v => v.RecipientPersonIds.SetEquals(new[] { person1 }));
        Assert.Equal(RecipientMode.SINGLE_RECIPIENT, vaultP1.RecipientMode);
        Assert.Equal(2, vaultP1.AssetIds.Count); // Gom cả Tài sản A và C vào cùng một kho

        var vaultCoOwned = vaults.Single(v => v.RecipientPersonIds.SetEquals(new[] { person1, person2 }));
        Assert.Equal(RecipientMode.CO_OWNED, vaultCoOwned.RecipientMode);
        Assert.Single(vaultCoOwned.AssetIds);

        var vaultP3 = vaults.Single(v => v.RecipientPersonIds.SetEquals(new[] { person3 }));
        Assert.Equal(RecipientMode.SINGLE_RECIPIENT, vaultP3.RecipientMode);
        Assert.Single(vaultP3.AssetIds);
    }
    #endregion

    #region EP-03: Phân vùng gói dịch vụ đối với quyền xóa kho do bất hoạt (OPLAN-05, OPLAN-08)
    // Lớp hợp lệ 1: Gói Owner Free -> Không bao giờ xóa tự động (DeletionEligibleAt == null)
    // Lớp hợp lệ 2: Gói trả phí (LEGACY_XS, LEGACY_XS_MAX) đang đóng băng -> Có mốc xóa hợp lệ

    [Theory]
    [InlineData(SubscriptionTier.OWNER_FREE, false)]
    [InlineData(SubscriptionTier.LEGACY_XS, true)]
    [InlineData(SubscriptionTier.LEGACY_XS_MAX, true)]
    public void EP03_DeletionEligibility_TierPartitions(SubscriptionTier tier, bool shouldHaveDeletionDate)
    {
        // Arrange
        var freezeAt = new DateTime(2026, 6, 1, 0, 0, 0, DateTimeKind.Utc);
        var planExpiresAt = new DateTime(2026, 5, 1, 0, 0, 0, DateTimeKind.Utc);

        // Act
        var result = _rulesService.CalculateDeletionEligibility(VaultStatus.FROZEN_INACTIVITY, freezeAt, planExpiresAt, tier);

        // Assert
        if (shouldHaveDeletionDate)
        {
            Assert.NotNull(result);
            Assert.True(result.Value > freezeAt);
        }
        else
        {
            Assert.Null(result);
        }
    }
    #endregion
}
