using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Domain;

namespace LegacyVault.Prototype.Application.Interfaces;

public interface IVideoSessionService
{
    Task<ScheduleVideoSessionResponse> RequestSessionAsync(CreateVideoSessionRequest request, Guid currentUserId);
    
    Task<ScheduleVideoSessionResponse> ConfirmScheduleAsync(Guid sessionId, DateTime scheduledAt, Guid currentUserId);
    
    Task<JoinTokenResponse> GetJoinTokenAsync(Guid sessionId, Guid currentUserId);
    
    Task<VideoSessionDetailDto> SubmitVerdictAsync(Guid sessionId, SubmitVerdictRequest request, Guid currentVerifierId);
    
    Task<VideoSessionDetailDto> EndSessionAsync(Guid sessionId, Guid currentUserId);
    
    Task<VideoSessionDetailDto> GetSessionDetailAsync(Guid sessionId, Guid currentUserId);
    
    Task<bool> HandleWebhookEventAsync(string eventId, string eventType, string roomName, string? participantIdentity, string? rawPayload);

    // P0 Rescue & Hold methods
    Task<RescueHoldResultDto> TriggerRescueHoldAsync(Guid caseId, Guid currentUserId, string? reason);
    
    Task<RescueHoldResultDto> AdjudicateRescueHoldAsync(Guid caseId, Guid verifierId, RescueDecisionType decision, string notes);
}
