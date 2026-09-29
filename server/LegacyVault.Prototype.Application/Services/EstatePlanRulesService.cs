using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;

namespace LegacyVault.Prototype.Application.Services;

/// <summary>
/// Dịch vụ thẩm định và xử lý quy tắc nghiệp vụ Kế hoạch di sản & Kho bàn giao (SRS v3.11.0)
/// </summary>
public class EstatePlanRulesService : IEstatePlanRulesService
{
    public PlanActivationResult ValidatePlanActivation(EstatePlanActivationRequest request, DateTime currentUtc)
    {
        // 1. Gói dịch vụ phải là gói trả phí còn hạn (SETUP-01)
        if (request.Tier == SubscriptionTier.OWNER_FREE)
        {
            return new PlanActivationResult
            {
                IsSuccess = false,
                ErrorCode = "ERR_PLAN_TIER_NOT_ELIGIBLE",
                Message = "Gói Owner Free không có quyền kích hoạt Kế hoạch di sản. Vui lòng nâng cấp lên Legacy XS hoặc XS Max."
            };
        }

        if (currentUtc >= request.PlanExpiresAt)
        {
            return new PlanActivationResult
            {
                IsSuccess = false,
                ErrorCode = "ERR_PLAN_EXPIRED",
                Message = "Gói dịch vụ đã hết hạn. Vui lòng gia hạn trước khi kích hoạt kế hoạch."
            };
        }

        // 2. Chủ sở hữu phải xác thực MFA (SETUP-01)
        if (!request.IsOwnerMfaVerified)
        {
            return new PlanActivationResult
            {
                IsSuccess = false,
                ErrorCode = "ERR_MFA_REQUIRED",
                Message = "Chủ sở hữu bắt buộc phải xác thực MFA trước khi kích hoạt kế hoạch."
            };
        }

        // 3. Người thực thi (Executor) chính phải chấp nhận nhiệm vụ (SETUP-01, ASSIGN-01)
        if (!request.IsPrimaryExecutorAccepted)
        {
            return new PlanActivationResult
            {
                IsSuccess = false,
                ErrorCode = "ERR_EXECUTOR_NOT_ACCEPTED",
                Message = "Người thực thi chính chưa chấp nhận vai trò ủy quyền."
            };
        }

        // 4. Phải có ít nhất một tài sản được chỉ định hợp lệ (SETUP-01, ASSET-04)
        if (request.DesignatedAssetCount <= 0)
        {
            return new PlanActivationResult
            {
                IsSuccess = false,
                ErrorCode = ErrorCodes.ERR_SETUP_NO_RECIPIENT_DESIGNATED,
                Message = "Kế hoạch phải có ít nhất một tài sản đã gán người thụ hưởng hợp lệ."
            };
        }

        // 5. Không có kế hoạch khác đang hoạt động (SETUP-01)
        if (request.HasOtherActivePlan)
        {
            return new PlanActivationResult
            {
                IsSuccess = false,
                ErrorCode = "ERR_ANOTHER_PLAN_ACTIVE",
                Message = "Tài khoản đã có một Kế hoạch di sản khác đang hoạt động."
            };
        }

        return new PlanActivationResult
        {
            IsSuccess = true,
            Message = "Kế hoạch di sản đã đủ điều kiện và được kích hoạt thành công."
        };
    }

    public List<HandoverVaultModel> ConsolidateVaults(Guid planId, List<AssetDesignationItem> assets)
    {
        // Nhóm các tài sản theo tập người nhận chuẩn hóa (SETUP-05, ASSET-04, AC-01)
        var groupedAssets = new Dictionary<string, (HashSet<Guid> Recipients, List<Guid> AssetIds)>();

        foreach (var asset in assets)
        {
            if (asset.RecipientPersonIds.Count == 0)
            {
                // Tài sản chưa có người nhận mang trạng thái NOT_IN_ESTATE_PLAN, bỏ qua khỏi kho gom
                continue;
            }

            // Chuẩn hóa tập person_id (sắp xếp tăng dần để không phụ thuộc thứ tự chọn)
            var sortedIds = asset.RecipientPersonIds.OrderBy(id => id).ToList();
            string canonicalKey = string.Join(",", sortedIds);

            if (!groupedAssets.TryGetValue(canonicalKey, out var group))
            {
                group = (new HashSet<Guid>(sortedIds), new List<Guid>());
                groupedAssets[canonicalKey] = group;
            }

            group.AssetIds.Add(asset.AssetId);
        }

        var result = new List<HandoverVaultModel>();
        foreach (var entry in groupedAssets.Values)
        {
            var mode = entry.Recipients.Count == 1 ? RecipientMode.SINGLE_RECIPIENT : RecipientMode.CO_OWNED;
            var vault = new HandoverVaultModel
            {
                HandoverVaultId = Guid.NewGuid(),
                PlanId = planId,
                RecipientMode = mode,
                RecipientPersonIds = entry.Recipients,
                AssetIds = entry.AssetIds,
                Status = HandoverStatus.PRE_BUNDLED,
                OriginalRecipientId = mode == RecipientMode.SINGLE_RECIPIENT ? entry.Recipients.First() : null,
                CurrentTargetRecipientId = mode == RecipientMode.SINGLE_RECIPIENT ? entry.Recipients.First() : null,
                TransferStatus = TransferChoiceStatus.ACTIVE
            };

            result.Add(vault);
        }

        return result;
    }

    public bool ValidateThreePersonRule(Guid ownerId, Guid executorId, Guid verifierId, IEnumerable<Guid> beneficiaryIds, out string? errorCode)
    {
        errorCode = null;

        // Quy tắc 3 người độc lập: Owner, Executor, Verifier phải là 3 cá nhân khác nhau (ASSIGN-06)
        bool isDistinctThree = (ownerId != executorId) && (ownerId != verifierId) && (executorId != verifierId);
        if (!isDistinctThree)
        {
            errorCode = ErrorCodes.ERR_ROLE_THREE_PERSON_CONFLICT;
            return false;
        }

        // Executor và Verifier không được đồng thời là Beneficiary trong cùng hồ sơ di sản (ASSIGN-06)
        var benSet = new HashSet<Guid>(beneficiaryIds);
        bool hasConflictWithBeneficiary = benSet.Contains(executorId) || benSet.Contains(verifierId);
        if (hasConflictWithBeneficiary)
        {
            errorCode = ErrorCodes.ERR_BENEFICIARY_ROLE_CONFLICT;
            return false;
        }

        return true;
    }

    public DateTime? CalculateDeletionEligibility(VaultStatus status, DateTime freezeAt, DateTime? paidPlanExpiresAt, SubscriptionTier tier)
    {
        // Gói Owner Free không bao giờ bị xóa tự động (OPLAN-05, OPLAN-08)
        if (tier == SubscriptionTier.OWNER_FREE)
        {
            return null;
        }

        // Kho phải đang ở trạng thái FROZEN_INACTIVITY mới đủ điều kiện tính mốc xóa (OPLAN-05, OPLAN-06)
        if (status != VaultStatus.FROZEN_INACTIVITY)
        {
            return null;
        }

        // deletion_eligible_at = max(freeze_at + 30d, paid_plan_expires_at + 30d) (OPLAN-05)
        DateTime planExpiry = paidPlanExpiresAt ?? freezeAt;
        DateTime maxBase = planExpiry > freezeAt ? planExpiry : freezeAt;

        return maxBase.AddDays(30);
    }

    public DateTime CalculateReconsiderationExpiry(DateTime freezeStartedAt)
    {
        // Thời hạn suy nghĩ lại: 2 năm lịch (TIME-01)
        // Xử lý năm nhuận: Nếu đóng băng vào ngày 29/02 thì ngày hết hạn là ngày 28/02 của năm đích
        int targetYear = freezeStartedAt.Year + 2;
        if (freezeStartedAt.Month == 2 && freezeStartedAt.Day == 29 && !DateTime.IsLeapYear(targetYear))
        {
            return new DateTime(targetYear, 2, 28, freezeStartedAt.Hour, freezeStartedAt.Minute, freezeStartedAt.Second, DateTimeKind.Utc);
        }

        return freezeStartedAt.AddYears(2);
    }

    public bool ValidateDeathAttestation(bool executorAttested, bool verifierAttested)
    {
        // Cả hai vai trò bắt buộc phải tick cam kết chịu trách nhiệm pháp lý độc lập (DEATH-02, AC-12)
        return executorAttested && verifierAttested;
    }

    public HandoverStatus EvaluateCoOwnedConsensus(HandoverVaultModel vault, Dictionary<Guid, bool> recipientDecisions, bool isInitialWindowExpired)
    {
        if (vault.RecipientMode != RecipientMode.CO_OWNED)
        {
            return vault.Status;
        }

        // Nếu có bất kỳ ai từ chối (false) -> Chuyển sang FROZEN_RECONSIDERATION ngay lập tức (AC-10)
        if (recipientDecisions.Values.Any(accepted => !accepted))
        {
            return HandoverStatus.FROZEN_RECONSIDERATION;
        }

        // Kiểm tra xem 100% người đồng sở hữu đã bấm Nhận (true) hay chưa (AC-09)
        bool allAccepted = vault.RecipientPersonIds.Count > 0 &&
                           vault.RecipientPersonIds.All(id => recipientDecisions.TryGetValue(id, out bool accepted) && accepted);

        if (allAccepted)
        {
            return HandoverStatus.HANDOVER_COMMITTED;
        }

        // Nếu hết cửa sổ phản hồi 7 ngày ban đầu mà chưa đủ người trả lời -> đóng băng suy nghĩ lại (AC-35)
        if (isInitialWindowExpired)
        {
            return HandoverStatus.FROZEN_RECONSIDERATION;
        }

        return HandoverStatus.PENDING_RESPONSE;
    }

    public HandoverVaultModel ProcessTransferChoice(HandoverVaultModel vault, Guid actorId, Guid newTargetId, List<Guid> snapshotBeneficiaryIds, bool isHandoverStarted)
    {
        // 1. Kho đồng sở hữu tuyệt đối cấm chuyển quyền 1:1 (REDIST-01, AC-05)
        if (vault.RecipientMode != RecipientMode.SINGLE_RECIPIENT)
        {
            throw new InvalidOperationException(ErrorCodes.ERR_TRANSFER_CO_OWNED_FORBIDDEN);
        }

        // 2. Nếu Executor đã bấm Bắt đầu bàn giao -> Khóa cứng, cấm đổi đích/hủy (REDIST-06, AC-07)
        if (isHandoverStarted)
        {
            throw new InvalidOperationException(ErrorCodes.ERR_HANDOVER_FINALIZED_LOCKED);
        }

        // 3. Chỉ người nhận gốc được quyền chọn/đổi/hủy (REDIST-04)
        if (actorId != vault.OriginalRecipientId)
        {
            throw new UnauthorizedAccessException(ErrorCodes.ERR_AUTH_FORBIDDEN);
        }

        // 4. Đích đến không được là chính mình, và phải thuộc danh sách snapshot (REDIST-02, AC-04)
        if (newTargetId == actorId || !snapshotBeneficiaryIds.Contains(newTargetId))
        {
            throw new ArgumentException(ErrorCodes.ERR_TRANSFER_TARGET_INVALID);
        }

        // Cập nhật người nhận đích và chuyển trạng thái
        vault.TransferStatus = vault.CurrentTargetRecipientId.HasValue && vault.CurrentTargetRecipientId.Value != vault.OriginalRecipientId
            ? TransferChoiceStatus.REPLACED
            : TransferChoiceStatus.ACTIVE;
        vault.CurrentTargetRecipientId = newTargetId;

        return vault;
    }
}
