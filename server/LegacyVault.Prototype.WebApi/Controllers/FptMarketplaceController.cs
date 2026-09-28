using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[Route("api/v1/fpt-marketplace")]
public class FptMarketplaceController : ControllerBase
{
    private readonly IFptMarketplaceService _marketplaceService;

    public FptMarketplaceController(IFptMarketplaceService marketplaceService)
    {
        _marketplaceService = marketplaceService;
    }

    /// <summary>
    /// Lấy danh sách các mô hình AI trực tiếp từ máy chủ FPT Cloud AI Marketplace
    /// </summary>
    [HttpGet("models")]
    public async Task<IActionResult> GetModels(CancellationToken ct = default)
    {
        var result = await _marketplaceService.GetAvailableModelsAsync(ct);
        if (!result.Success && result.ErrorMessage != null && result.ErrorMessage.Contains("Chưa cấu hình API Key"))
        {
            return Problem(
                statusCode: StatusCodes.Status503ServiceUnavailable,
                title: "FPT AI Marketplace Not Configured",
                detail: result.ErrorMessage
            );
        }

        return Ok(result);
    }

    /// <summary>
    /// Gợi ý rà soát điều khoản di chúc tham khảo (Saola-Small-32B) - Cần con người kiểm tra
    /// </summary>
    [HttpPost("clause-review")]
    public async Task<IActionResult> ReviewClause([FromBody] FptClauseReviewRequest request, CancellationToken ct = default)
    {
        if (!request.IsSyntheticPreset)
        {
            return Problem(
                statusCode: StatusCodes.Status403Forbidden,
                title: "Zero-Knowledge Policy Violation",
                detail: "Để bảo vệ quyền riêng tư Zero-Knowledge, bản demo chỉ tiếp nhận dữ liệu kịch bản giả lập đã kiểm duyệt (Synthetic Presets). Nhập tự do bị từ chối khi chưa có thỏa thuận Opt-in Consent."
            );
        }

        var result = await _marketplaceService.ReviewWillClauseAsync(request, ct);
        if (!result.Success)
        {
            return Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "FPT AI Marketplace Error",
                detail: result.ErrorMessage ?? "Không thể hoàn thành yêu cầu suy luận từ FPT Cloud."
            );
        }

        return Ok(result);
    }

    /// <summary>
    /// Trích xuất và tóm tắt ảnh tài liệu mẫu giả định (gemma-3-27b-it Multimodal) - Không thay thế eKYC
    /// </summary>
    [HttpPost("vision-extract")]
    public async Task<IActionResult> ExtractVisionDocument([FromBody] FptVisionExtractRequest request, CancellationToken ct = default)
    {
        if (!request.IsSyntheticPreset)
        {
            return Problem(
                statusCode: StatusCodes.Status403Forbidden,
                title: "Zero-Knowledge Policy Violation",
                detail: "Để bảo vệ quyền riêng tư Zero-Knowledge, bản demo chỉ tiếp nhận ảnh tài liệu mẫu giả lập đã kiểm duyệt (Synthetic Presets). Tải tệp cá nhân bị từ chối khi chưa có thỏa thuận Opt-in Consent."
            );
        }

        var result = await _marketplaceService.ExtractSyntheticDocumentAsync(request, ct);
        if (!result.Success)
        {
            return Problem(
                statusCode: StatusCodes.Status502BadGateway,
                title: "FPT AI Marketplace VLM Error",
                detail: result.ErrorMessage ?? "Không thể hoàn thành yêu cầu suy luận thị giác từ FPT Cloud."
            );
        }

        return Ok(result);
    }
}
