using System.Security.Cryptography;
using System.Text;
using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace LegacyVault.Prototype.Infrastructure.Services;

/// <summary>
/// Triển khai mã hóa phong bì có kiểm soát (Server-Side Envelope Encryption AES-256-GCM - SEC-01 -> SEC-04)
/// </summary>
public class EnvelopeEncryptionService : IEnvelopeEncryptionService
{
    private readonly byte[] _kek; // Key Encryption Key (Master Key bảo vệ DEK)

    public EnvelopeEncryptionService(IConfiguration configuration)
    {
        string? masterKeyHex = configuration["Security:MasterKekHex"];
        if (!string.IsNullOrEmpty(masterKeyHex) && masterKeyHex.Length == 64)
        {
            _kek = Convert.FromHexString(masterKeyHex);
        }
        else
        {
            // Default 256-bit KEK for prototype environment
            _kek = SHA256.HashData(Encoding.UTF8.GetBytes("LegacyVault_Master_KEK_2026_Prototype_Secret_Key!"));
        }
    }

    public async Task<EncryptionResult> EncryptStreamAsync(Stream inputStream, CancellationToken ct = default)
    {
        // 1. Tính SHA-256 Checksum của dữ liệu gốc
        inputStream.Position = 0;
        string checksum = await ComputeSha256Async(inputStream, ct);

        // 2. Đọc toàn bộ bytes (giới hạn 20 MiB theo SRS)
        using var memoryStream = new MemoryStream();
        inputStream.Position = 0;
        await inputStream.CopyToAsync(memoryStream, ct);
        byte[] plaintext = memoryStream.ToArray();

        // 3. Sinh khóa DEK đối xứng 256-bit ngẫu nhiên
        byte[] dek = RandomNumberGenerator.GetBytes(32);

        // 4. Sinh Nonce 96-bit (12 bytes) ngẫu nhiên
        byte[] nonce = RandomNumberGenerator.GetBytes(12);

        // 5. Chuẩn bị buffer cho Ciphertext và Tag 128-bit (16 bytes)
        byte[] ciphertext = new byte[plaintext.Length];
        byte[] tag = new byte[16];

        // 6. Mã hóa AES-256-GCM
        using var aesGcm = new AesGcm(dek, 16);
        aesGcm.Encrypt(nonce, plaintext, ciphertext, tag);

        // 7. Bọc DEK bằng KEK hệ thống
        string wrappedKey = WrapKey(dek);

        return new EncryptionResult
        {
            Ciphertext = ciphertext,
            Nonce = nonce,
            Tag = tag,
            Dek = dek,
            WrappedKeyBase64 = wrappedKey,
            ChecksumSha256 = checksum
        };
    }

    public Task<byte[]> DecryptBytesAsync(byte[] ciphertext, string wrappedKeyBase64, byte[] nonce, byte[] tag, CancellationToken ct = default)
    {
        // 1. Giải bọc DEK bằng KEK hệ thống
        byte[] dek = UnwrapKey(wrappedKeyBase64);

        // 2. Chuẩn bị buffer giải mã
        byte[] plaintext = new byte[ciphertext.Length];

        // 3. Giải mã AES-256-GCM
        using var aesGcm = new AesGcm(dek, 16);
        aesGcm.Decrypt(nonce, ciphertext, tag, plaintext);

        return Task.FromResult(plaintext);
    }

    public string WrapKey(byte[] dek)
    {
        // Mã hóa DEK bằng KEK với AES-GCM
        byte[] nonce = RandomNumberGenerator.GetBytes(12);
        byte[] wrappedDek = new byte[dek.Length];
        byte[] tag = new byte[16];

        using var aesGcm = new AesGcm(_kek, 16);
        aesGcm.Encrypt(nonce, dek, wrappedDek, tag);

        // Định dạng bọc: [12 bytes Nonce] + [16 bytes Tag] + [32 bytes Ciphertext DEK]
        byte[] combined = new byte[nonce.Length + tag.Length + wrappedDek.Length];
        Buffer.BlockCopy(nonce, 0, combined, 0, nonce.Length);
        Buffer.BlockCopy(tag, 0, combined, nonce.Length, tag.Length);
        Buffer.BlockCopy(wrappedDek, 0, combined, nonce.Length + tag.Length, wrappedDek.Length);

        return Convert.ToBase64String(combined);
    }

    public byte[] UnwrapKey(string wrappedKeyBase64)
    {
        byte[] combined = Convert.FromBase64String(wrappedKeyBase64);
        if (combined.Length < 12 + 16 + 32)
            throw new CryptographicException("Invalid wrapped key format.");

        byte[] nonce = new byte[12];
        byte[] tag = new byte[16];
        byte[] wrappedDek = new byte[32];

        Buffer.BlockCopy(combined, 0, nonce, 0, 12);
        Buffer.BlockCopy(combined, 12, tag, 0, 16);
        Buffer.BlockCopy(combined, 28, wrappedDek, 0, 32);

        byte[] dek = new byte[32];
        using var aesGcm = new AesGcm(_kek, 16);
        aesGcm.Decrypt(nonce, wrappedDek, tag, dek);

        return dek;
    }

    public async Task<string> ComputeSha256Async(Stream stream, CancellationToken ct = default)
    {
        long originalPos = stream.Position;
        using var sha256 = SHA256.Create();
        byte[] hash = await sha256.ComputeHashAsync(stream, ct);
        stream.Position = originalPos;
        return Convert.ToHexString(hash).ToLowerInvariant();
    }
}
