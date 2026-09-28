using System.Collections.Concurrent;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[Route("api/v1/storage")]
public class StorageController : ControllerBase
{
    private readonly IR2StorageService _r2Service;
    private readonly IEnvelopeEncryptionService _cryptoService;
    private static readonly ConcurrentDictionary<Guid, AssetEnvelopeMetadata> _vaultAssets = new();

    public StorageController(IR2StorageService r2Service, IEnvelopeEncryptionService cryptoService)
    {
        _r2Service = r2Service;
        _cryptoService = cryptoService;
    }

    /// <summary>
    /// Sinh Presigned URL để upload file thẳng lên Cloudflare R2
    /// </summary>
    [HttpPost("presigned-upload-url")]
    public IActionResult GeneratePresignedUploadUrl([FromBody] PresignedUrlRequest request)
    {
        string key = $"uploads/{Guid.NewGuid()}_{request.FileName}";
        string url = _r2Service.GeneratePresignedUploadUrl(key, TimeSpan.FromMinutes(15));

        return Ok(new
        {
            key,
            presignedUrl = url,
            expiresInSeconds = 900
        });
    }

    /// <summary>
    /// Sinh Presigned URL để download file từ Cloudflare R2 có thời hạn
    /// </summary>
    [HttpPost("presigned-download-url")]
    public IActionResult GeneratePresignedDownloadUrl([FromBody] DownloadPresignedUrlRequest request)
    {
        string url = _r2Service.GeneratePresignedDownloadUrl(request.Key, TimeSpan.FromMinutes(15));

        return Ok(new
        {
            key = request.Key,
            presignedUrl = url,
            expiresInSeconds = 900
        });
    }

    /// <summary>
    /// Tải file lên -> Backend mã hóa Envelope AES-256-GCM -> Lưu Ciphertext lên Cloudflare R2 (Luồng chuẩn SRS)
    /// </summary>
    [HttpPost("upload-envelope")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadEnvelope(IFormFile file, CancellationToken ct)
    {
        if (file.Length > 20 * 1024 * 1024)
        {
            return BadRequest(new ProblemDetailsResponse
            {
                Status = 400,
                ErrorCode = ErrorCodes.ERR_FILE_SIZE_EXCEEDS_LIMIT,
                Title = "File Size Exceeds Limit",
                Detail = "File size exceeds 20MB limit.",
                Instance = HttpContext.Request.Path
            });
        }

        // 1. Mã hóa Envelope AES-256-GCM
        using var stream = file.OpenReadStream();
        var enc = await _cryptoService.EncryptStreamAsync(stream, ct);

        // 2. Tải bản mã lên Cloudflare R2
        string storageKey = $"vaults/demo/assets/{Guid.NewGuid()}.enc";
        using var ciphertextStream = new MemoryStream(enc.Ciphertext);
        string storageUrl = await _r2Service.UploadAsync(storageKey, ciphertextStream, "application/octet-stream", ct);

        // 3. Lưu trữ Metadata
        var metadata = new AssetEnvelopeMetadata
        {
            AssetId = Guid.NewGuid(),
            FileName = file.FileName,
            MimeType = file.ContentType,
            SizeBytes = file.Length,
            ChecksumSha256 = enc.ChecksumSha256,
            StorageKey = storageKey,
            StorageUrl = storageUrl,
            WrappedDataKeyBase64 = enc.WrappedKeyBase64,
            NonceBase64 = Convert.ToBase64String(enc.Nonce),
            TagBase64 = Convert.ToBase64String(enc.Tag),
            CreatedAt = DateTime.UtcNow
        };

        _vaultAssets[metadata.AssetId] = metadata;

        return Ok(new
        {
            success = true,
            asset = metadata
        });
    }

    /// <summary>
    /// Tải tệp tin an toàn qua TLS: Lấy ciphertext từ R2, giải mã trong RAM, stream về client (DEL-02)
    /// </summary>
    [HttpGet("download-envelope/{assetId:guid}")]
    public async Task<IActionResult> DownloadEnvelope(Guid assetId, CancellationToken ct)
    {
        if (!_vaultAssets.TryGetValue(assetId, out var metadata))
        {
            return NotFound(new ProblemDetailsResponse
            {
                Status = 404,
                ErrorCode = ErrorCodes.ERR_INTERNAL_SERVER_ERROR,
                Title = "Asset Not Found",
                Detail = "Tài sản không tồn tại hoặc đã bị xóa.",
                Instance = HttpContext.Request.Path
            });
        }

        // 1. Lấy Ciphertext Stream từ Cloudflare R2
        using var r2Stream = await _r2Service.DownloadStreamAsync(metadata.StorageKey, ct);
        if (r2Stream == null)
        {
            return NotFound(new ProblemDetailsResponse
            {
                Status = 404,
                ErrorCode = ErrorCodes.ERR_INTERNAL_SERVER_ERROR,
                Title = "Ciphertext Missing in R2",
                Detail = "Không tìm thấy bản mã trong kho lưu trữ R2.",
                Instance = HttpContext.Request.Path
            });
        }

        using var ms = new MemoryStream();
        await r2Stream.CopyToAsync(ms, ct);
        byte[] ciphertext = ms.ToArray();

        // 2. Giải mã AES-256-GCM trong RAM (Zero-Knowledge / Ephemeral)
        byte[] nonce = Convert.FromBase64String(metadata.NonceBase64);
        byte[] tag = Convert.FromBase64String(metadata.TagBase64);

        byte[] plaintext = await _cryptoService.DecryptBytesAsync(ciphertext, metadata.WrappedDataKeyBase64, nonce, tag, ct);

        // 3. Stream trực tiếp qua TLS về Trình duyệt
        return File(plaintext, metadata.MimeType, metadata.FileName);
    }

    [HttpGet("assets")]
    public IActionResult ListVaultAssets()
    {
        return Ok(_vaultAssets.Values.OrderByDescending(a => a.CreatedAt));
    }
}

public class PresignedUrlRequest
{
    public string FileName { get; set; } = "document.pdf";
    public string ContentType { get; set; } = "application/pdf";
}

public class DownloadPresignedUrlRequest
{
    public string Key { get; set; } = string.Empty;
}
