using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Services;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;
using LegacyVault.Prototype.Infrastructure.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace LegacyVault.Prototype.Tests.BlackBox;

/// <summary>
/// Kiểm thử Chuyển đổi trạng thái (State Transition Testing) theo ISTQB Chương 4.3.3 (trang 101-105, Hình 4.2 & Bảng 4.9).
/// Bao gồm: Kiểm thử chuyển trạng thái hợp lệ (Valid Transitions) và chuyển trạng thái bị cấm (Invalid Transitions qua State Table).
/// </summary>
public class StateTransitionTests
{
    private readonly EstatePlanRulesService _rulesService = new();

    #region ST-01: Vòng đời Lựa chọn chuyển quyền 1:1 (REDIST-01 -> REDIST-06)
    // S1: ACTIVE -> S2: REPLACED -> S1: ACTIVE
    // S1: ACTIVE -> S3: FINALIZED (Khóa cứng khi Executor bắt đầu)
    // Invalid transition: S3 (FINALIZED) -> Cố tình đổi đích chuyển quyền -> Chặn với ERR_HANDOVER_FINALIZED_LOCKED
    // Invalid transition: Kho CO_OWNED -> Cố tình chuyển quyền -> Chặn với ERR_TRANSFER_CO_OWNED_FORBIDDEN

    [Fact]
    public void ST01_TransferChoice_ValidTransitions_And_FinalizedLock()
    {
        // Arrange
        var p1 = Guid.NewGuid();
        var p2 = Guid.NewGuid();
        var p3 = Guid.NewGuid();
        var snapshotBeneficiaries = new List<Guid> { p1, p2, p3 };

        var vault = new HandoverVaultModel
        {
            HandoverVaultId = Guid.NewGuid(),
            PlanId = Guid.NewGuid(),
            RecipientMode = RecipientMode.SINGLE_RECIPIENT,
            OriginalRecipientId = p1,
            CurrentTargetRecipientId = p1,
            TransferStatus = TransferChoiceStatus.ACTIVE
        };

        // Transition 1: p1 chọn chuyển quyền dự kiến sang p2 (ACTIVE -> ACTIVE/REPLACED)
        var updated1 = _rulesService.ProcessTransferChoice(vault, p1, p2, snapshotBeneficiaries, isHandoverStarted: false);
        Assert.Equal(p2, updated1.CurrentTargetRecipientId);

        // Transition 2: p1 đổi ý chuyển sang p3 (ACTIVE/REPLACED -> REPLACED)
        var updated2 = _rulesService.ProcessTransferChoice(updated1, p1, p3, snapshotBeneficiaries, isHandoverStarted: false);
        Assert.Equal(p3, updated2.CurrentTargetRecipientId);
        Assert.Equal(TransferChoiceStatus.REPLACED, updated2.TransferStatus);

        // Transition 3 (INVALID): Executor bấm "Bắt đầu bàn giao" (isHandoverStarted = true)
        // Khi này người dùng cố tình gọi API đổi đích tiếp -> Bị cấm chuyển trạng thái!
        var ex = Assert.Throws<InvalidOperationException>(() =>
            _rulesService.ProcessTransferChoice(updated2, p1, p2, snapshotBeneficiaries, isHandoverStarted: true));
        Assert.Equal(ErrorCodes.ERR_HANDOVER_FINALIZED_LOCKED, ex.Message);
    }

    [Fact]
    public void ST01_TransferChoice_InvalidTransition_OnCoOwnedVault()
    {
        // Arrange: Kho đồng sở hữu
        var p1 = Guid.NewGuid();
        var p2 = Guid.NewGuid();
        var vault = new HandoverVaultModel
        {
            RecipientMode = RecipientMode.CO_OWNED,
            RecipientPersonIds = new HashSet<Guid> { p1, p2 }
        };

        // Act & Assert: Kho đồng sở hữu tuyệt đối không có nhánh chuyển trạng thái sang TransferChoice
        var ex = Assert.Throws<InvalidOperationException>(() =>
            _rulesService.ProcessTransferChoice(vault, p1, Guid.NewGuid(), new List<Guid> { p1, p2 }, false));
        Assert.Equal(ErrorCodes.ERR_TRANSFER_CO_OWNED_FORBIDDEN, ex.Message);
    }
    #endregion

    #region ST-02: Vòng đời Đồng thuận Kho đồng sở hữu (AC-09, AC-10, AC-35)
    // S1: PENDING_RESPONSE -> S2: HANDOVER_COMMITTED (100% đồng ý)
    // S1: PENDING_RESPONSE -> S3: FROZEN_RECONSIDERATION (Có người từ chối HOẶC hết 7 ngày)

    [Fact]
    public void ST02_CoOwnedVault_ConsensusTransitions()
    {
        // Arrange: 2 người đồng sở hữu
        var p1 = Guid.NewGuid();
        var p2 = Guid.NewGuid();
        var vault = new HandoverVaultModel
        {
            RecipientMode = RecipientMode.CO_OWNED,
            RecipientPersonIds = new HashSet<Guid> { p1, p2 },
            Status = HandoverStatus.PENDING_RESPONSE
        };

        // Kịch bản 1: Mới có p1 bấm Nhận (true), p2 chưa bấm -> Giữ PENDING_RESPONSE, chưa cấp grant
        var decisionsPartial = new Dictionary<Guid, bool> { { p1, true } };
        var status1 = _rulesService.EvaluateCoOwnedConsensus(vault, decisionsPartial, isInitialWindowExpired: false);
        Assert.Equal(HandoverStatus.PENDING_RESPONSE, status1);

        // Kịch bản 2: p2 bấm Từ chối (false) -> Chuyển ngay sang FROZEN_RECONSIDERATION
        var decisionsWithReject = new Dictionary<Guid, bool> { { p1, true }, { p2, false } };
        var status2 = _rulesService.EvaluateCoOwnedConsensus(vault, decisionsWithReject, isInitialWindowExpired: false);
        Assert.Equal(HandoverStatus.FROZEN_RECONSIDERATION, status2);

        // Kịch bản 3: Cả 2 cùng bấm Nhận (true) -> Chuyển sang HANDOVER_COMMITTED
        var decisionsAllAccept = new Dictionary<Guid, bool> { { p1, true }, { p2, true } };
        var status3 = _rulesService.EvaluateCoOwnedConsensus(vault, decisionsAllAccept, isInitialWindowExpired: false);
        Assert.Equal(HandoverStatus.HANDOVER_COMMITTED, status3);
    }
    #endregion

    #region ST-03: Vòng đời Cứu hộ Time-Lock (TimeLockRescueService)
    // S1: UNDER_REVIEW -> S2: RESCUE_PENDING (SubmitAliveClaim)
    // S2: RESCUE_PENDING -> S3: CANCELLED_ALIVE (APPROVED_ALIVE)
    // S2: RESCUE_PENDING -> S1: UNDER_REVIEW (REJECTED_FRAUD)

    [Fact]
    public void ST03_TimeLockRescue_StateTransitions()
    {
        // Arrange
        var service = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var caseId = Guid.NewGuid();

        // 1. Khởi tạo mốc Time-Lock
        var initial = service.InitializeCaseTimeLock(caseId, isDemoMode: true);
        Assert.Equal(CaseStatus.UNDER_REVIEW, initial.Status);

        // 2. Transition S1 -> S2: Chủ sở hữu bấm cứu hộ khẩn cấp
        var rescueState = service.SubmitAliveClaim(new SubmitAliveClaimRequest
        {
            CaseId = caseId,
            Reason = "Tôi còn sống, đây là hành vi báo tử nhầm."
        });
        Assert.Equal(CaseStatus.RESCUE_PENDING, rescueState.Status);

        // 3. Transition S2 -> S3: Verifier thẩm định chấp thuận Chủ kho còn sống -> Hủy vĩnh viễn quy trình bàn giao
        var finalCancelled = service.AdjudicateRescue(new RescueDecisionRequest
        {
            CaseId = caseId,
            Decision = RescueDecisionType.APPROVED_ALIVE
        });
        Assert.Equal(CaseStatus.CANCELLED_ALIVE, finalCancelled.Status);
    }
    #endregion
}
