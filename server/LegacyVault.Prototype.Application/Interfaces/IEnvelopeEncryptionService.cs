namespace LegacyVault.Prototype.Application.Interfaces;

public class EncryptionResult
{
    public byte[] Ciphertext { get; set; } = Array.Empty<byte>();
    public byte[] Nonce { get; set; } = Array.Empty<byte>();
    public byte[] Tag { get; set; } = Array.Empty<byte>();
    public byte[] Dek { get; set; } = Array.Empty<byte>();
    public string WrappedKeyBase64 { get; set; } = string.Empty;
    public string ChecksumSha256 { get; set; } = string.Empty;
}

public interface IEnvelopeEncryptionService
{
    Task<EncryptionResult> EncryptStreamAsync(Stream inputStream, CancellationToken ct = default);
    Task<byte[]> DecryptBytesAsync(byte[] ciphertext, string wrappedKeyBase64, byte[] nonce, byte[] tag, CancellationToken ct = default);
    string WrapKey(byte[] dek);
    byte[] UnwrapKey(string wrappedKeyBase64);
    Task<string> ComputeSha256Async(Stream stream, CancellationToken ct = default);
}
