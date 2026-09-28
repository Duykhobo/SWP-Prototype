namespace LegacyVault.Prototype.Application.Interfaces;

public interface IR2StorageService
{
    bool IsConfigured { get; }
    string BucketName { get; }
    Task<string> UploadAsync(string key, Stream dataStream, string contentType, CancellationToken ct = default);
    Task<Stream?> DownloadStreamAsync(string key, CancellationToken ct = default);
    string GeneratePresignedUploadUrl(string key, TimeSpan expiresIn);
    string GeneratePresignedDownloadUrl(string key, TimeSpan expiresIn);
    Task<bool> DeleteAsync(string key, CancellationToken ct = default);
}
