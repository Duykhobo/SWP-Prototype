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
    /// OCR trích xuất thông tin Căn cước công dân gắn chip (FPT.AI Vision SDK)
    /// </summary>
    [HttpPost("ocr")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> ExtractOcr(
        IFormFile frontCard, 
        IFormFile? backCard, 
        [FromForm] bool useSandbox = true,
        [FromForm] string? apiKey = null,
        CancellationToken ct = default)
    {
        string? effectiveApiKey = !string.IsNullOrWhiteSpace(apiKey) 
            ? apiKey 
            : Request.Headers["X-Fpt-Api-Key"].FirstOrDefault();

        using var frontStream = frontCard.OpenReadStream();
        Stream? backStream = backCard?.OpenReadStream();

        var result = await _ekycService.ExtractIdCardOcrAsync(frontStream, backStream, useSandbox, effectiveApiKey, ct);

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
        CancellationToken ct = default)
    {
        string? effectiveApiKey = !string.IsNullOrWhiteSpace(apiKey) 
            ? apiKey 
            : Request.Headers["X-Fpt-Api-Key"].FirstOrDefault();

        using var cardStream = cardImage.OpenReadStream();
        using var selfieStream = selfieImage.OpenReadStream();

        var result = await _ekycService.VerifyFaceMatchAsync(cardStream, selfieStream, useSandbox, effectiveApiKey, ct);

        return Ok(result);
    }
}
