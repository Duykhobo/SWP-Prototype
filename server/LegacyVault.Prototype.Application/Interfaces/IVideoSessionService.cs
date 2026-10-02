using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;

namespace LegacyVault.Prototype.Application.Interfaces;

public interface IVideoSessionService
{
    Task<ScheduleVideoSessionResponse> RequestSessionAsync(CreateVideoSessionRequest request, Guid currentUserId);
    
    Task<ScheduleVideoSessionResponse> ConfirmScheduleAsync(Guid sessionId, DateTime scheduledAt, Guid currentUserId);
    
    Task<JoinTokenResponse> GetJoinTokenAsync(
        Guid sessionId, 
        Guid currentUserId, 
        string? participantName = null, 
        string? guestToken = null, 
        string? role = null);
    
    Task<VideoSessionDetailDto> SubmitVerdictAsync(Guid sessionId, SubmitVerdictRequest request, Guid currentVerifierId);
    
    Task<VideoSessionDetailDto> EndSessionAsync(Guid sessionId, Guid currentUserId);
    
    Task<VideoSessionDetailDto> GetSessionDetailAsync(Guid sessionId, Guid currentUserId);
    
    Task<bool> HandleWebhookEventAsync(string eventId, string eventType, string roomName, string? participantIdentity, string? rawPayload);

    // P0 Rescue & Hold methods
    Task<RescueHoldResultDto> TriggerRescueHoldAsync(Guid caseId, Guid currentUserId, string? reason);
    
    Task<RescueHoldResultDto> AdjudicateRescueHoldAsync(Guid caseId, Guid verifierId, RescueDecisionType decision, string notes);

    // In-Call Estate Handover Ceremony methods
    Task<HandoverEligibilityDto> GetHandoverEligibilityAsync(Guid caseOrSessionId, Guid currentUserId);

    Task<AcceptHandoverResponse> AcceptHandoverAsync(Guid caseOrSessionId, Guid currentUserId, AcceptHandoverRequest request);

    Task<DecryptionKeyMaterialDto> GetDecryptionKeyMaterialAsync(Guid caseOrSessionId, Guid currentUserId);

    // 7-Step Handover Protocol (Executor & Guest Session)
    Task<AuthorizeRecipientResponse> AuthorizeRecipientByExecutorAsync(Guid caseOrSessionId, Guid executorId, AuthorizeRecipientRequest request);

    Task<FinalizeHandoverResponse> FinalizeHandoverSessionAsync(Guid caseOrSessionId, Guid beneficiaryId, FinalizeHandoverRequest request);

    Task<GuestHandoverSession> GetOrCreateGuestSessionAsync(Guid caseId, Guid beneficiaryId, Guid executorId, Guid sessionId);

    Task<GuestHandoverSession?> ValidateGuestSessionAsync(string guestToken);
}
