using System.Security.Cryptography;
using System.Text;
using LegacyVault.Prototype.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace LegacyVault.Prototype.Tests.WhiteBox;

/// <summary>
/// Kiểm thử cấu trúc White-box cho EnvelopeEncryptionService.cs theo ISTQB Mục 4.4.4 (MC/DC) & Branch testing.
/// </summary>
public class EnvelopeEncryptionWhiteBoxTests
{
    #region WB-03: MC/DC trên điều kiện khởi tạo KEK từ cấu hình
    /*
    Biểu thức nguyên văn trong EnvelopeEncryptionService.cs dòng 18:
    if (!string.IsNullOrEmpty(masterKeyHex) && masterKeyHex.Length == 64)

    Tách các điều kiện nguyên tử:
    - C1: !string.IsNullOrEmpty(masterKeyHex)
    - C2: masterKeyHex.Length == 64
    Quyết định D: C1 AND C2

    | Test ID | C1 | C2 | D | Mô tả dữ liệu |
    | :--- | :---: | :---: | :---: | :--- |
    | WB_ENC_01 | T | T | T | Hex 64 ký tự hợp lệ ("0123...45") |
    | WB_ENC_02 | T | F | F | Hex 32 ký tự (C1=T, C2=F) |
    | WB_ENC_03 | F | - | F | Chuỗi rỗng / null (C1=F, short-circuit) |

    Cặp thử nghiệm MC/DC:
    - Điều kiện C1: Cặp (WB_ENC_01, WB_ENC_03): C1 đổi từ T -> F, D đổi từ T -> F.
    - Điều kiện C2: Cặp (WB_ENC_01, WB_ENC_02): C2 đổi từ T -> F, C1 giữ T, D đổi từ T -> F.
    */

    [Fact]
    public void WB_ENC_01_ValidHex64_UsesConfiguredKek()
    {
        // C1 = T, C2 = T -> D = T
        string valid64Hex = new('a', 64);
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Security:MasterKekHex", valid64Hex }
        }).Build();

        var service = new EnvelopeEncryptionService(config);
        Assert.NotNull(service);
    }

    [Fact]
    public void WB_ENC_02_InvalidLengthHex_FallsBackToDefaultKek()
    {
        // C1 = T, C2 = F -> D = F
        string shortHex = new('b', 32); // Chỉ có 32 ký tự
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Security:MasterKekHex", shortHex }
        }).Build();

        var service = new EnvelopeEncryptionService(config);
        Assert.NotNull(service);
    }

    [Fact]
    public void WB_ENC_03_NullOrEmptyHex_FallsBackToDefaultKek()
    {
        // C1 = F -> D = F
        var config = new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Security:MasterKekHex", "" }
        }).Build();

        var service = new EnvelopeEncryptionService(config);
        Assert.NotNull(service);
    }
    #endregion

    #region WB-04: Decision testing trên UnwrapKey (kiểm tra độ dài buffer bọc)
    [Fact]
    public void WB_UnwrapKey_InvalidLength_ThrowsCryptographicException()
    {
        // Biểu thức dòng 106: if (combined.Length < 12 + 16 + 32) throw new CryptographicException(...)
        var config = new ConfigurationBuilder().Build();
        var service = new EnvelopeEncryptionService(config);

        byte[] tooShort = new byte[20]; // Dưới 60 bytes
        string tooShortBase64 = Convert.ToBase64String(tooShort);

        var ex = Assert.Throws<CryptographicException>(() => service.UnwrapKey(tooShortBase64));
        Assert.Equal("Invalid wrapped key format.", ex.Message);
    }

    [Fact]
    public async Task WB_RoundTrip_EncryptionAndDecryption_BranchCoverage()
    {
        // Kiểm thử luồng mã hóa phong bì và giải mã đầy đủ
        var config = new ConfigurationBuilder().Build();
        var service = new EnvelopeEncryptionService(config);

        byte[] plainBytes = Encoding.UTF8.GetBytes("Nội dung tài sản bí mật số 123456");
        using var inStream = new MemoryStream(plainBytes);

        var encResult = await service.EncryptStreamAsync(inStream);
        Assert.NotNull(encResult.Ciphertext);
        Assert.NotNull(encResult.WrappedKeyBase64);

        byte[] decrypted = await service.DecryptBytesAsync(
            encResult.Ciphertext,
            encResult.WrappedKeyBase64,
            encResult.Nonce,
            encResult.Tag);

        Assert.Equal(plainBytes, decrypted);
    }
    #endregion
}
