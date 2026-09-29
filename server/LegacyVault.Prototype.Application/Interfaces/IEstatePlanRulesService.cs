using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;

namespace LegacyVault.Prototype.Application.Interfaces;

public interface IEstatePlanRulesService
{
    PlanActivationResult ValidatePlanActivation(EstatePlanActivationRequest request, DateTime currentUtc);

    List<HandoverVaultModel> ConsolidateVaults(Guid planId, List<AssetDesignationItem> assets);

    bool ValidateThreePersonRule(Guid ownerId, Guid executorId, Guid verifierId, IEnumerable<Guid> beneficiaryIds, out string? errorCode);

    DateTime? CalculateDeletionEligibility(VaultStatus status, DateTime freezeAt, DateTime? paidPlanExpiresAt, SubscriptionTier tier);

    DateTime CalculateReconsiderationExpiry(DateTime freezeStartedAt);

    bool ValidateDeathAttestation(bool executorAttested, bool verifierAttested);

    HandoverStatus EvaluateCoOwnedConsensus(HandoverVaultModel vault, Dictionary<Guid, bool> recipientDecisions, bool isInitialWindowExpired);

    HandoverVaultModel ProcessTransferChoice(HandoverVaultModel vault, Guid actorId, Guid newTargetId, List<Guid> snapshotBeneficiaryIds, bool isHandoverStarted);
}
