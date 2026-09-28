using LegacyVault.Prototype.Domain;

namespace LegacyVault.Prototype.Application.DTOs;

public class TimeLockStatusDto
{
    public Guid CaseId { get; set; }
    public CaseStatus Status { get; set; }
    public bool IsDemoMode { get; set; } // true = 2 phút, false = 48 giờ
    public int TotalDurationSeconds { get; set; }
    public int RemainingSeconds { get; set; }
    public bool IsLocked { get; set; }
    public bool IsExpired { get; set; }
    public DateTime UnlockTargetTime { get; set; }
    public string? AliveClaimReason { get; set; }
    public DateTime? AliveClaimSubmittedAt { get; set; }
}

public class SubmitAliveClaimRequest
{
    public Guid CaseId { get; set; }
    public string Reason { get; set; } = "Tôi vẫn còn sống và phát hiện yêu cầu mở kho bất thường!";
    public string OwnerIdentityCard { get; set; } = string.Empty;
}

public class RescueDecisionRequest
{
    public Guid CaseId { get; set; }
    public RescueDecisionType Decision { get; set; }
    public string VerifierNotes { get; set; } = string.Empty;
    public string VerifierFullName { get; set; } = string.Empty;
}
