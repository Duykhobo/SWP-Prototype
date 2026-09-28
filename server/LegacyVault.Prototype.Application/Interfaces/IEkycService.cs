using LegacyVault.Prototype.Domain.Models;

namespace LegacyVault.Prototype.Application.Interfaces;

public interface IEkycService
{
    Task<EkycOcrResult> ExtractIdCardOcrAsync(Stream frontCardStream, Stream? backCardStream, bool useSandbox, string? apiKey = null, string? preset = null, CancellationToken ct = default);
    Task<EkycLivenessResult> VerifyFaceMatchAsync(Stream cardImageStream, Stream selfieImageStream, bool useSandbox, string? apiKey = null, string? preset = null, CancellationToken ct = default);
}
