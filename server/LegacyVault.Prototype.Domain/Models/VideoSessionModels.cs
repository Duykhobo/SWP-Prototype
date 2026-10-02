namespace LegacyVault.Prototype.Domain.Models;

public class VideoSession
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseId { get; set; }
    public string ProviderRoomId { get; set; } = null!;
    public VideoSessionPurpose Purpose { get; set; }
    public VideoSessionStatus Status { get; set; } = VideoSessionStatus.REQUESTED;
    
    public DateTime RequestedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ScheduledAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    
    public Guid AssignedVerifierId { get; set; }
    public Guid SubjectUserId { get; set; }
    
    // Kết quả xác minh của Verifier
    public VerificationOutcome VerificationOutcome { get; set; } = VerificationOutcome.PENDING;
    public string? ChecklistJson { get; set; }
    public string? VerifierNotes { get; set; }
    public DateTime? EvaluatedAt { get; set; }
    public Guid? RecordedByVerifierId { get; set; }

    public List<VideoSessionParticipant> Participants { get; set; } = new();
}

public class VideoSessionParticipant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid SessionId { get; set; }
    public Guid UserId { get; set; }
    public ParticipantRoleInCall Role { get; set; }
    
    // Nullable: chỉ ghi nhận khi có sự kiện tham gia thực tế (webhook participant_joined)
    public DateTime? JoinedAt { get; set; }
    public DateTime? LeftAt { get; set; }
    
    public string? ClientIpAddress { get; set; }
    public string? UserAgent { get; set; }
}

public class CaseRescueHold
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseId { get; set; }
    public Guid OwnerId { get; set; }
    public DateTime HeldAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReleasedAt { get; set; }
    
    // Lưu trạng thái trước khi tạm giữ để phục hồi chính xác
    public CaseStatus PreviousCaseStatus { get; set; }
    
    // Danh sách snapshot các HandoverVault (JSON)
    public string HandoverSnapshotsJson { get; set; } = "[]";
    
    // Lý do Owner yêu cầu cứu hộ
    public string? Reason { get; set; }
    
    // Kết quả phân xử chính thức từ Verifier
    public RescueDecisionType? Decision { get; set; }
    public Guid? AdjudicatedByVerifierId { get; set; }
    public DateTime? AdjudicatedAt { get; set; }
    public string? AdjudicationNotes { get; set; }
    
    public bool IsActive => ReleasedAt == null && Decision == null;
}

public class HandoverVaultSnapshot
{
    public Guid HandoverVaultId { get; set; }
    public HandoverStatus PreviousStatus { get; set; }
    public int RemainingResponseWindowSeconds { get; set; }
    public int RemainingGrantWindowSeconds { get; set; }
    public DateTime? ScheduledDeliveryDate { get; set; }
}
