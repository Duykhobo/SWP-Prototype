using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[Route("api/v1/ekyc")]
public class EkycController : ControllerBase
{
    private readonly IEkycService _ekycService;

    public EkycController(IEkycService ekycService)
    {
        _ekycService = ekycService;
    }

    /// <summary>
    /// [Định hướng tương lai] Khảo sát OCR trích xuất thông tin CCCD hỗ trợ điền biểu mẫu.
    /// Lưu ý: Phiên bản prototype thực hiện nhập liệu và thẩm định hồ sơ thủ công; AI/OCR chỉ hỗ trợ trích xuất thông tin, không thay thế quyết định của người thẩm định.
    /// </summary>
    [HttpPost("ocr")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ExtractOcr(
        IFormFile frontCard, 
        IFormFile? backCard, 
        [FromForm] bool useSandbox = true,
        [FromForm] string? apiKey = null,
        [FromForm] string? preset = null,
        CancellationToken ct = default)
    {
        string? effectiveApiKey = !string.IsNullOrWhiteSpace(apiKey) 
            ? apiKey 
            : Request.Headers["X-Fpt-Api-Key"].FirstOrDefault();

        using var frontStream = frontCard.OpenReadStream();
        Stream? backStream = backCard?.OpenReadStream();

        var result = await _ekycService.ExtractIdCardOcrAsync(frontStream, backStream, useSandbox, effectiveApiKey, preset, ct);

        return Ok(result);
    }

    /// <summary>
    /// Đối sánh khuôn mặt chân dung với ảnh trên CCCD (Liveness / Face Matching)
    /// </summary>
    [HttpPost("liveness-face-match")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> VerifyFaceMatch(
        IFormFile cardImage, 
        IFormFile selfieImage, 
        [FromForm] bool useSandbox = true,
        [FromForm] string? apiKey = null,
        [FromForm] string? preset = null,
        CancellationToken ct = default)
    {
        string? effectiveApiKey = !string.IsNullOrWhiteSpace(apiKey) 
            ? apiKey 
            : Request.Headers["X-Fpt-Api-Key"].FirstOrDefault();

        using var cardStream = cardImage.OpenReadStream();
        using var selfieStream = selfieImage.OpenReadStream();

        var result = await _ekycService.VerifyFaceMatchAsync(cardStream, selfieStream, useSandbox, effectiveApiKey, preset, ct);

        return Ok(result);
    }
}
