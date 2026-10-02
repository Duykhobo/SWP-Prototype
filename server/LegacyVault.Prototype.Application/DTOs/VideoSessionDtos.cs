using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;

namespace LegacyVault.Prototype.Application.DTOs;

public class CreateVideoSessionRequest
{
    public Guid CaseId { get; set; }
    public VideoSessionPurpose Purpose { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public Guid SubjectUserId { get; set; }
    public Guid AssignedVerifierId { get; set; }
}

public class ScheduleVideoSessionResponse
{
    public Guid SessionId { get; set; }
    public Guid CaseId { get; set; }
    public string ProviderRoomId { get; set; } = string.Empty;
    public VideoSessionStatus Status { get; set; }
    public VideoSessionPurpose Purpose { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public Guid SubjectUserId { get; set; }
    public Guid AssignedVerifierId { get; set; }
}

public class JoinTokenResponse
{
    public string LiveKitUrl { get; set; } = string.Empty;
    public string RoomName { get; set; } = string.Empty;
    public string ParticipantIdentity { get; set; } = string.Empty;
    public string ParticipantName { get; set; } = string.Empty;
    public string Token { get; set; } = string.Empty;
    public int ExpiresInSeconds { get; set; }
}

public class SubmitVerdictRequest
{
    public VerificationOutcome Outcome { get; set; }
    public string? VerifierNotes { get; set; }
    public string? ChecklistJson { get; set; }
}

public class VideoSessionDetailDto
{
    public Guid SessionId { get; set; }
    public Guid CaseId { get; set; }
    public string ProviderRoomId { get; set; } = string.Empty;
    public VideoSessionPurpose Purpose { get; set; }
    public VideoSessionStatus Status { get; set; }
    public DateTime RequestedAt { get; set; }
    public DateTime? ScheduledAt { get; set; }
    public DateTime? StartedAt { get; set; }
    public DateTime? EndedAt { get; set; }
    public Guid AssignedVerifierId { get; set; }
    public Guid SubjectUserId { get; set; }
    public VerificationOutcome VerificationOutcome { get; set; }
    public string? ChecklistJson { get; set; }
    public string? VerifierNotes { get; set; }
    public DateTime? EvaluatedAt { get; set; }
    public List<VideoSessionParticipant> Participants { get; set; } = new();
}

public class RescueHoldResultDto
{
    public Guid HoldId { get; set; }
    public Guid CaseId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public Guid? VideoSessionId { get; set; }
}

public class ResumeHoldRequest
{
    public Guid CaseId { get; set; }
    public RescueDecisionType Decision { get; set; }
    public string AdjudicationNotes { get; set; } = string.Empty;
}
