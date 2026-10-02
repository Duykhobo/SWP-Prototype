using System.Collections.Concurrent;
using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Domain;
using Microsoft.Extensions.Logging;

namespace LegacyVault.Prototype.Infrastructure.Services;

/// <summary>
/// Quản lý Khóa thời gian trễ (Time-Lock Delay) & Quy trình cứu hộ 2 bước (AliveClaim)
/// </summary>
public class TimeLockRescueService : ITimeLockRescueService
{
    private class CaseState
    {
        public Guid CaseId { get; set; }
        public CaseStatus Status { get; set; } = CaseStatus.UNDER_REVIEW;
        public bool IsDemoMode { get; set; } = true; // Mặc định Demo Mode 2 phút
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime UnlockTargetTime { get; set; }
        public string? AliveClaimReason { get; set; }
        public DateTime? AliveClaimSubmittedAt { get; set; }
    }

    private readonly ConcurrentDictionary<Guid, CaseState> _cases = new();
    private readonly ILogger<TimeLockRescueService> _logger;

    public TimeLockRescueService(ILogger<TimeLockRescueService> logger)
    {
        _logger = logger;
    }

    public TimeLockStatusDto InitializeCaseTimeLock(Guid caseId, bool isDemoMode)
    {
        int durationSeconds = isDemoMode ? 120 : 48 * 3600; // 2 phút vs 48 giờ
        var now = DateTime.UtcNow;

        var state = new CaseState
        {
            CaseId = caseId,
            Status = CaseStatus.UNDER_REVIEW,
            IsDemoMode = isDemoMode,
            StartedAt = now,
            UnlockTargetTime = now.AddSeconds(durationSeconds)
        };

        _cases[caseId] = state;
        _logger.LogInformation("Time-Lock initialized for Case {CaseId}. Mode: {Mode}, Target: {Target}",
            caseId, isDemoMode ? "2-min Demo" : "48-hour Prod", state.UnlockTargetTime);

        return MapToDto(state);
    }

    public TimeLockStatusDto GetStatus(Guid caseId)
    {
        if (!_cases.TryGetValue(caseId, out var state))
        {
            // Tự khởi tạo mặc định nếu chưa có
            return InitializeCaseTimeLock(caseId, true);
        }

        return MapToDto(state);
    }

    public TimeLockStatusDto SubmitAliveClaim(SubmitAliveClaimRequest request)
    {
        var state = _cases.GetOrAdd(request.CaseId, id => new CaseState
        {
            CaseId = id,
            IsDemoMode = true,
            StartedAt = DateTime.UtcNow,
            UnlockTargetTime = DateTime.UtcNow.AddSeconds(120)
        });

        // Chuyển sang RESCUE_PENDING theo quy trình cứu hộ 2 bước của LegacyVault
        state.Status = CaseStatus.RESCUE_PENDING;
        state.AliveClaimReason = request.Reason;
        state.AliveClaimSubmittedAt = DateTime.UtcNow;

        _logger.LogWarning("Owner submitted AliveClaim for Case {CaseId}. Status moved to RESCUE_PENDING.", request.CaseId);
        return MapToDto(state);
    }

    public TimeLockStatusDto AdjudicateRescue(RescueDecisionRequest request)
    {
        if (!_cases.TryGetValue(request.CaseId, out var state))
        {
            throw new KeyNotFoundException($"Case {request.CaseId} not found.");
        }

        if (request.Decision == RescueDecisionType.APPROVED_ALIVE)
        {
            // Verifier chấp thuận xác nhận Chủ kho còn sống -> Hủy vĩnh viễn quy trình mở kho
            state.Status = CaseStatus.CANCELLED_ALIVE;
            _logger.LogInformation("Verifier approved AliveClaim for Case {CaseId}. Case CANCELLED_ALIVE.", request.CaseId);
        }
        else
        {
            // Verifier từ chối yêu cầu cứu hộ do nghi ngờ giả mạo
            state.Status = CaseStatus.UNDER_REVIEW;
            _logger.LogWarning("Verifier rejected AliveClaim for Case {CaseId}. Resumed UNDER_REVIEW.", request.CaseId);
        }

        return MapToDto(state);
    }

    public TimeLockStatusDto ApproveCaseForDelivery(Guid caseId)
    {
        var state = _cases.GetOrAdd(caseId, id => new CaseState
        {
            CaseId = id,
            IsDemoMode = true,
            StartedAt = DateTime.UtcNow,
            UnlockTargetTime = DateTime.UtcNow
        });

        state.Status = CaseStatus.APPROVED_FOR_DELIVERY;
        state.UnlockTargetTime = DateTime.UtcNow; // Mở khóa thời gian trễ
        _logger.LogInformation("Case {CaseId} đã được phê duyệt chuyển giao di sản (APPROVED_FOR_DELIVERY).", caseId);

        return MapToDto(state);
    }

    public void ToggleDemoMode(Guid caseId, bool isDemoMode)
    {
        if (_cases.TryGetValue(caseId, out var state))
        {
            state.IsDemoMode = isDemoMode;
            int durationSeconds = isDemoMode ? 120 : 48 * 3600;
            state.StartedAt = DateTime.UtcNow;
            state.UnlockTargetTime = DateTime.UtcNow.AddSeconds(durationSeconds);
            _logger.LogInformation("Switched Demo Mode for Case {CaseId} to {IsDemo}", caseId, isDemoMode);
        }
        else
        {
            InitializeCaseTimeLock(caseId, isDemoMode);
        }
    }

    private static TimeLockStatusDto MapToDto(CaseState state)
    {
        var now = DateTime.UtcNow;
        int remaining = (int)Math.Max(0, (state.UnlockTargetTime - now).TotalSeconds);
        bool isExpired = remaining <= 0;
        int totalSecs = state.IsDemoMode ? 120 : 48 * 3600;

        return new TimeLockStatusDto
        {
            CaseId = state.CaseId,
            Status = state.Status,
            IsDemoMode = state.IsDemoMode,
            TotalDurationSeconds = totalSecs,
            RemainingSeconds = remaining,
            IsLocked = remaining > 0 && state.Status == CaseStatus.UNDER_REVIEW,
            IsExpired = isExpired,
            UnlockTargetTime = state.UnlockTargetTime,
            AliveClaimReason = state.AliveClaimReason,
            AliveClaimSubmittedAt = state.AliveClaimSubmittedAt
        };
    }
}
