using LegacyVault.Prototype.Application.DTOs;

namespace LegacyVault.Prototype.Application.Interfaces;

public interface IFptMarketplaceService
{
    Task<FptAiModelListResponse> GetAvailableModelsAsync(CancellationToken cancellationToken = default);
    Task<FptClauseReviewResponse> ReviewWillClauseAsync(FptClauseReviewRequest request, CancellationToken cancellationToken = default);
    Task<FptVisionExtractResponse> ExtractSyntheticDocumentAsync(FptVisionExtractRequest request, CancellationToken cancellationToken = default);
}
