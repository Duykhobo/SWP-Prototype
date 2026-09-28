namespace LegacyVault.Prototype.Domain.Models;

/// <summary>
/// Metadata lưu trữ bản mã và thông tin mã hóa Envelope (SEC-01 -> SEC-04)
/// </summary>
public class AssetEnvelopeMetadata
{
    public Guid AssetId { get; set; } = Guid.NewGuid();
    public string FileName { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public string ChecksumSha256 { get; set; } = string.Empty;
    public string StorageKey { get; set; } = string.Empty;
    public string StorageUrl { get; set; } = string.Empty;
    public string WrappedDataKeyBase64 { get; set; } = string.Empty;
    public string NonceBase64 { get; set; } = string.Empty;
    public string TagBase64 { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
