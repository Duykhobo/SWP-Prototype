using System.Collections.Concurrent;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[Route("api/v1/crypto")]
public class CryptoController : ControllerBase
{
    private readonly IEnvelopeEncryptionService _cryptoService;
    private static readonly ConcurrentDictionary<Guid, byte[]> _ciphertextCache = new();

    public CryptoController(IEnvelopeEncryptionService cryptoService)
    {
        _cryptoService = cryptoService;
    }

    /// <summary>
    /// Thử nghiệm mã hóa Server-Side Envelope Encryption AES-256-GCM (SEC-01 -> SEC-04)
    /// </summary>
    [HttpPost("envelope-encrypt")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> TestEnvelopeEncrypt(IFormFile file, CancellationToken ct)
    {
        // 1. Kiểm tra kích thước (Max 20 MiB theo SRS)
        if (file.Length > 20 * 1024 * 1024)
        {
            return BadRequest(new ProblemDetailsResponse
            {
                Status = 400,
                ErrorCode = ErrorCodes.ERR_FILE_SIZE_EXCEEDS_LIMIT,
                Title = "File Size Exceeds Limit",
                Detail = "Tệp tin vượt quá dung lượng tối đa 20 MiB theo quy định MVP.",
                Instance = HttpContext.Request.Path
            });
        }

        // 2. Thực hiện mã hóa Envelope
        using var stream = file.OpenReadStream();
        var encResult = await _cryptoService.EncryptStreamAsync(stream, ct);

        var metadata = new AssetEnvelopeMetadata
        {
            AssetId = Guid.NewGuid(),
            FileName = file.FileName,
            MimeType = file.ContentType,
            SizeBytes = file.Length,
            ChecksumSha256 = encResult.ChecksumSha256,
            StorageKey = $"vaults/demo/assets/{Guid.NewGuid()}.enc",
            WrappedDataKeyBase64 = encResult.WrappedKeyBase64,
            NonceBase64 = Convert.ToBase64String(encResult.Nonce),
            TagBase64 = Convert.ToBase64String(encResult.Tag),
            CreatedAt = DateTime.UtcNow
        };

        // Lưu ciphertext vào cache bộ nhớ cho phiên testbench
        _ciphertextCache[metadata.AssetId] = encResult.Ciphertext;

        return Ok(new
        {
            success = true,
            metadata,
            fullCiphertextBase64 = Convert.ToBase64String(encResult.Ciphertext),
            rawCiphertextBase64 = Convert.ToBase64String(encResult.Ciphertext.Take(64).ToArray()) + " ... (truncated preview)",
            ciphertextLengthBytes = encResult.Ciphertext.Length,
            rawDekSampleBase64 = Convert.ToBase64String(encResult.Dek) // Chỉ hiển thị trong môi trường Testbench
        });
    }

    /// <summary>
    /// Thử nghiệm giải mã tệp tin bằng WrappedDataKey, Nonce và Tag (DEL-02)
    /// </summary>
    [HttpPost("envelope-decrypt")]
    public async Task<IActionResult> TestEnvelopeDecrypt([FromBody] DecryptTestRequest request, CancellationToken ct)
    {
        try
        {
            byte[]? ciphertext = null;
            if (!string.IsNullOrWhiteSpace(request.CiphertextBase64))
            {
                ciphertext = Convert.FromBase64String(request.CiphertextBase64);
            }
            else if (request.AssetId.HasValue && _ciphertextCache.TryGetValue(request.AssetId.Value, out var cachedBytes))
            {
                ciphertext = cachedBytes;
            }

            if (ciphertext == null || ciphertext.Length == 0)
            {
                return BadRequest(new ProblemDetailsResponse
                {
                    Status = 400,
                    ErrorCode = ErrorCodes.ERR_VALIDATION_FAILED,
                    Title = "Ciphertext Missing",
                    Detail = "Không tìm thấy dữ liệu bản mã để giải mã.",
                    Instance = HttpContext.Request.Path
                });
            }

            byte[] nonce = Convert.FromBase64String(request.NonceBase64);
            byte[] tag = Convert.FromBase64String(request.TagBase64);

            byte[] plaintext = await _cryptoService.DecryptBytesAsync(ciphertext, request.WrappedKeyBase64, nonce, tag, ct);

            return File(plaintext, request.MimeType ?? "application/octet-stream", request.FileName ?? "decrypted_file");
        }
        catch (Exception ex)
        {
            return BadRequest(new ProblemDetailsResponse
            {
                Status = 400,
                ErrorCode = ErrorCodes.ERR_INTERNAL_SERVER_ERROR,
                Title = "Decryption Failed",
                Detail = $"Giải mã thất bại do Tag GCM không khớp: {ex.Message}",
                Instance = HttpContext.Request.Path
            });
        }
    }
}

public class DecryptTestRequest
{
    public Guid? AssetId { get; set; }
    public string? CiphertextBase64 { get; set; }
    public string WrappedKeyBase64 { get; set; } = string.Empty;
    public string NonceBase64 { get; set; } = string.Empty;
    public string TagBase64 { get; set; } = string.Empty;
    public string? FileName { get; set; }
    public string? MimeType { get; set; }
}
