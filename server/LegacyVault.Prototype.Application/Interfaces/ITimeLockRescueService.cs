using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Domain;

namespace LegacyVault.Prototype.Application.Interfaces;

public interface ITimeLockRescueService
{
    TimeLockStatusDto InitializeCaseTimeLock(Guid caseId, bool isDemoMode);
    TimeLockStatusDto GetStatus(Guid caseId);
    TimeLockStatusDto SubmitAliveClaim(SubmitAliveClaimRequest request);
    TimeLockStatusDto AdjudicateRescue(RescueDecisionRequest request);
    TimeLockStatusDto ApproveCaseForDelivery(Guid caseId);
    void ToggleDemoMode(Guid caseId, bool isDemoMode);
}
