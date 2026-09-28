using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LegacyVault.Prototype.Infrastructure.Services;

/// <summary>
/// Dịch vụ lưu trữ Cloudflare R2 (S3-Compatible Private Storage)
/// </summary>
public class CloudflareR2StorageService : IR2StorageService
{
    private readonly IAmazonS3? _s3Client;
    private readonly string _bucketName;
    private readonly bool _isConfigured;
    private readonly ILogger<CloudflareR2StorageService> _logger;
    private readonly Dictionary<string, byte[]> _localFallbackStore = new();

    public CloudflareR2StorageService(IConfiguration configuration, ILogger<CloudflareR2StorageService> logger)
    {
        _logger = logger;
        string? accountId = configuration["CloudflareR2:AccountId"];
        string? accessKeyId = configuration["CloudflareR2:AccessKeyId"];
        string? secretAccessKey = configuration["CloudflareR2:SecretAccessKey"];
        _bucketName = configuration["CloudflareR2:BucketName"] ?? "legacyvault-private";

        if (!string.IsNullOrWhiteSpace(accountId) && 
            !string.IsNullOrWhiteSpace(accessKeyId) && 
            !string.IsNullOrWhiteSpace(secretAccessKey) &&
            !accessKeyId.Contains("YOUR_"))
        {
            var credentials = new BasicAWSCredentials(accessKeyId, secretAccessKey);
            var s3Config = new AmazonS3Config
            {
                ServiceURL = $"https://{accountId}.r2.cloudflarestorage.com",
                AuthenticationRegion = "auto",
                ForcePathStyle = true
            };
            _s3Client = new AmazonS3Client(credentials, s3Config);
            _isConfigured = true;
            _logger.LogInformation("Cloudflare R2 Client initialized successfully for bucket: {Bucket}", _bucketName);
        }
        else
        {
            _isConfigured = false;
            _logger.LogWarning("Cloudflare R2 credentials not configured. Using local in-memory fallback store for prototype testing.");
        }
    }

    public async Task<string> UploadAsync(string key, Stream dataStream, string contentType, CancellationToken ct = default)
    {
        if (_isConfigured && _s3Client != null)
        {
            var putRequest = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = dataStream,
                ContentType = contentType,
                DisablePayloadSigning = true // R2 requires payload signing to be disabled in some regions
            };

            await _s3Client.PutObjectAsync(putRequest, ct);
            return $"https://r2.legacyvault.vn/{key}";
        }

        // Local fallback
        using var ms = new MemoryStream();
        await dataStream.CopyToAsync(ms, ct);
        _localFallbackStore[key] = ms.ToArray();
        return $"local://storage/{key}";
    }

    public async Task<Stream?> DownloadStreamAsync(string key, CancellationToken ct = default)
    {
        if (_isConfigured && _s3Client != null)
        {
            var getRequest = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = key
            };
            var response = await _s3Client.GetObjectAsync(getRequest, ct);
            return response.ResponseStream;
        }

        if (_localFallbackStore.TryGetValue(key, out var bytes))
        {
            return new MemoryStream(bytes);
        }

        return null;
    }

    public string GeneratePresignedUploadUrl(string key, TimeSpan expiresIn)
    {
        if (_isConfigured && _s3Client != null)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = key,
                Verb = HttpVerb.PUT,
                Expires = DateTime.UtcNow.Add(expiresIn)
            };
            return _s3Client.GetPreSignedURL(request);
        }

        return $"http://localhost:5000/api/v1/storage/mock-upload/{key}?expires={DateTimeOffset.UtcNow.Add(expiresIn).ToUnixTimeSeconds()}";
    }

    public string GeneratePresignedDownloadUrl(string key, TimeSpan expiresIn)
    {
        if (_isConfigured && _s3Client != null)
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = key,
                Verb = HttpVerb.GET,
                Expires = DateTime.UtcNow.Add(expiresIn)
            };
            return _s3Client.GetPreSignedURL(request);
        }

        return $"http://localhost:5000/api/v1/storage/mock-download/{key}?expires={DateTimeOffset.UtcNow.Add(expiresIn).ToUnixTimeSeconds()}";
    }

    public async Task<bool> DeleteAsync(string key, CancellationToken ct = default)
    {
        if (_isConfigured && _s3Client != null)
        {
            await _s3Client.DeleteObjectAsync(_bucketName, key, ct);
            return true;
        }

        return _localFallbackStore.Remove(key);
    }
}
