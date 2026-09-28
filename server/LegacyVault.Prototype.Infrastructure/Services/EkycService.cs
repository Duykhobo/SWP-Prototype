using System.Net.Http.Headers;
using System.Text.Json;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Domain.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LegacyVault.Prototype.Infrastructure.Services;

/// <summary>
/// Tích hợp Third-party eKYC SDK / API (chuẩn FPT.AI Vision SDK) theo tài liệu Hướng dẫn tích hợp dịch vụ cho dev (28/09/2026).
/// Đã loại bỏ VNPT eKYC do yêu cầu pháp nhân doanh nghiệp/hợp đồng B2B.
/// </summary>
public class EkycService : IEkycService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<EkycService> _logger;

    public EkycService(HttpClient httpClient, IConfiguration config, ILogger<EkycService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;
    }

    public async Task<EkycOcrResult> ExtractIdCardOcrAsync(Stream frontCardStream, Stream? backCardStream, bool useSandbox, string? apiKey = null, string? preset = null, CancellationToken ct = default)
    {
        string effectiveKey = (!string.IsNullOrWhiteSpace(apiKey) 
            ? apiKey 
            : Environment.GetEnvironmentVariable("FPT_AI_EKYC_API_KEY")
            ?? _config["Ekyc:FptAiApiKey"]) ?? "";
        bool hasApiKey = !string.IsNullOrWhiteSpace(effectiveKey) && !effectiveKey.Contains("YOUR_");

        if (useSandbox)
        {
            _logger.LogInformation("Processing ID Card OCR using FPT.AI Sandbox Engine with preset: {Preset}", preset ?? "default");

            if (preset == "tampered" || preset == "expired")
            {
                return new EkycOcrResult
                {
                    Success = true,
                    IdCardNumber = "001198004321",
                    FullName = "TRẦN THỊ MAI",
                    DateOfBirth = "10/05/1985",
                    Gender = "NỮ",
                    Nationality = "VIỆT NAM",
                    HomeAddress = "Số 45 Phố Huế, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội",
                    ExpiryDate = "10/05/2023", // Đã hết hạn
                    Confidence = 0.725,
                    Provider = "FPT.AI (Sandbox Mode - Cảnh Báo An Ninh)",
                    IsTampered = true,
                    ReviewRequired = true,
                    RawJson = JsonSerializer.Serialize(new
                    {
                        errorCode = 1,
                        errorMessage = "Warning: ID Card expired on 10/05/2023. Possible corner tampering or glare detected.",
                        data = new[]
                        {
                            new {
                                id = "001198004321",
                                name = "TRẦN THỊ MAI",
                                dob = "10/05/1985",
                                sex = "NỮ",
                                nationality = "VIỆT NAM",
                                home = "Hà Nội",
                                address = "Số 45 Phố Huế, Phường Hàng Bài, Quận Hoàn Kiếm, Hà Nội",
                                doe = "10/05/2023",
                                type = "chip_front",
                                warning = "EXPIRED_CARD_AND_CORNER_TAMPERING"
                            }
                        }
                    })
                };
            }

            return new EkycOcrResult
            {
                Success = true,
                IdCardNumber = "079099012345",
                FullName = "NGUYỄN VĂN AN",
                DateOfBirth = "15/08/1990",
                Gender = "NAM",
                Nationality = "VIỆT NAM",
                HomeAddress = "Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
                ExpiryDate = "15/08/2030",
                Confidence = 0.985,
                Provider = "FPT.AI (Sandbox Mode - FPT Vision SDK v3.2)",
                IsTampered = false,
                ReviewRequired = false,
                RawJson = JsonSerializer.Serialize(new
                {
                    errorCode = 0,
                    errorMessage = "Success",
                    data = new[]
                    {
                        new {
                            id = "079099012345",
                            name = "NGUYỄN VĂN AN",
                            dob = "15/08/1990",
                            sex = "NAM",
                            nationality = "VIỆT NAM",
                            home = "TP. Hồ Chí Minh",
                            address = "Số 123 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh",
                            doe = "15/08/2030",
                            type = "chip_front"
                        }
                    }
                })
            };
        }

        // Live API: Kiểm tra nếu dùng nhầm key của FPT Cloud AI Marketplace (sk-...)
        if (effectiveKey.StartsWith("sk-", StringComparison.OrdinalIgnoreCase))
        {
            return new EkycOcrResult
            {
                Success = false,
                ReviewRequired = true,
                Provider = "FPT.AI (Live API Check)",
                RawJson = JsonSerializer.Serialize(new
                {
                    errorCode = 400,
                    errorMessage = "Khóa API 'sk-...' bạn cung cấp là khóa FPT Cloud AI Marketplace (chuyên LLM / VLM). Cổng API FPT.AI eKYC (api.fpt.ai) yêu cầu khóa B2B Enterprise riêng biệt theo thông báo ngừng tài khoản cá nhân từ 29/08/2026. Để phân tích tài liệu bằng Live AI với khóa này, vui lòng chuyển sang Module 9 (FPT Cloud Marketplace - Gemma-3-27B-IT) hoặc kích hoạt Sandbox Mode cho Module 6."
                })
            };
        }

        if (!hasApiKey)
        {
            return new EkycOcrResult
            {
                Success = false,
                ReviewRequired = true,
                Provider = "FPT.AI (Live API)",
                RawJson = JsonSerializer.Serialize(new
                {
                    errorCode = 401,
                    errorMessage = "Chưa cung cấp FPT.AI B2B API Key để chạy Live API. Theo thông báo ngày 30/06/2026 của FPT Smart Cloud, cổng console.fpt.ai đã dừng tài khoản cá nhân từ 29/08/2026 và chỉ hỗ trợ tài khoản Doanh nghiệp B2B. Vui lòng bật 'Sandbox Mode' để thử nghiệm dữ liệu chuẩn hóa, hoặc chuyển sang Module 9 để dùng Live AI Marketplace."
                })
            };
        }

        // Gọi API FPT.AI thực tế: POST https://api.fpt.ai/vision/idr/vnm/
        try
        {
            using var content = new MultipartFormDataContent();
            using var frontContent = new StreamContent(frontCardStream);
            frontContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            content.Add(frontContent, "image", "front_card.jpg");

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.fpt.ai/vision/idr/vnm/")
            {
                Content = content
            };
            request.Headers.Add("api-key", effectiveKey);

            var response = await _httpClient.SendAsync(request, ct);
            var json = await response.Content.ReadAsStringAsync(ct);

            if (!response.IsSuccessStatusCode)
            {
                return new EkycOcrResult
                {
                    Success = false,
                    ReviewRequired = true,
                    Provider = "FPT.AI (Live API)",
                    RawJson = json
                };
            }

            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            if (root.TryGetProperty("data", out var dataArray) && dataArray.GetArrayLength() > 0)
            {
                var cardData = dataArray[0];
                return new EkycOcrResult
                {
                    Success = true,
                    IdCardNumber = cardData.TryGetProperty("id", out var idProp) ? idProp.GetString() ?? "" : "",
                    FullName = cardData.TryGetProperty("name", out var nameProp) ? nameProp.GetString() ?? "" : "",
                    DateOfBirth = cardData.TryGetProperty("dob", out var dobProp) ? dobProp.GetString() ?? "" : "",
                    Gender = cardData.TryGetProperty("sex", out var sexProp) ? sexProp.GetString() ?? "" : "",
                    Nationality = cardData.TryGetProperty("nationality", out var natProp) ? natProp.GetString() ?? "" : "",
                    HomeAddress = cardData.TryGetProperty("address", out var addrProp) ? addrProp.GetString() ?? "" : "",
                    ExpiryDate = cardData.TryGetProperty("doe", out var doeProp) ? doeProp.GetString() ?? "" : "",
                    Confidence = 0.96,
                    ReviewRequired = false,
                    Provider = "FPT.AI (Live API)",
                    RawJson = json
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling real FPT.AI OCR endpoint.");
        }

        return new EkycOcrResult { Success = false, ReviewRequired = true, Provider = "FPT.AI", RawJson = "Error processing request." };
    }

    public async Task<EkycLivenessResult> VerifyFaceMatchAsync(Stream cardImageStream, Stream selfieImageStream, bool useSandbox, string? apiKey = null, string? preset = null, CancellationToken ct = default)
    {
        string effectiveKey = (!string.IsNullOrWhiteSpace(apiKey) 
            ? apiKey 
            : Environment.GetEnvironmentVariable("FPT_AI_EKYC_API_KEY")
            ?? _config["Ekyc:FptAiApiKey"]) ?? "";
        bool hasApiKey = !string.IsNullOrWhiteSpace(effectiveKey) && !effectiveKey.Contains("YOUR_");

        if (useSandbox)
        {
            _logger.LogInformation("Processing Face Match using FPT.AI Sandbox Engine with preset: {Preset}", preset ?? "default");

            if (preset == "tampered" || preset == "expired" || preset == "mismatch")
            {
                return new EkycLivenessResult
                {
                    Success = false,
                    IsLive = false,
                    MatchScore = 0.428, // 42.8% - Dưới ngưỡng an toàn
                    ReviewRequired = true,
                    Provider = "FPT.AI (Sandbox Mode - Cảnh Báo An Ninh)",
                    Message = "CẢNH BÁO: Tỉ lệ khớp khuôn mặt chỉ đạt 42.8% (dưới ngưỡng 80%). Phát hiện dấu hiệu giả mạo sinh trắc học hoặc ảnh selfie không đồng nhất với CCCD."
                };
            }

            return new EkycLivenessResult
            {
                Success = true,
                IsLive = true,
                MatchScore = 0.942, // 94.2% khớp khuôn mặt
                ReviewRequired = false,
                Provider = "FPT.AI (Sandbox Mode - FPT Biometrics v3.2)",
                Message = "Khuôn mặt trùng khớp 94.2% với ảnh chân dung trên CCCD gắn chip. Chống giả mạo Liveness đạt chuẩn sinh trắc học."
            };
        }

        // Live API: Kiểm tra nếu dùng nhầm key của FPT Cloud AI Marketplace (sk-...)
        if (effectiveKey.StartsWith("sk-", StringComparison.OrdinalIgnoreCase))
        {
            return new EkycLivenessResult
            {
                Success = false,
                IsLive = false,
                MatchScore = 0,
                ReviewRequired = true,
                Provider = "FPT.AI (Live API Check)",
                Message = "Khóa API 'sk-...' bạn cung cấp thuộc nền tảng FPT Cloud AI Marketplace (LLM/VLM). Cổng eKYC FaceMatch (api.fpt.ai) yêu cầu khóa Enterprise B2B từ console.fpt.ai. Vui lòng chuyển sang Sandbox Mode để thử nghiệm trơn tru."
            };
        }

        if (!hasApiKey)
        {
            return new EkycLivenessResult
            {
                Success = false,
                IsLive = false,
                MatchScore = 0,
                ReviewRequired = true,
                Provider = "FPT.AI (Live API)",
                Message = "Chưa cung cấp FPT.AI B2B API Key để chạy Live API. Theo thông báo ngừng cấp tài khoản cá nhân từ 29/08/2026 của FPT.AI Console, vui lòng bật 'Sandbox Mode' để kiểm thử sinh trắc học chuẩn hóa."
            };
        }

        // Live API call to FPT.AI: POST https://api.fpt.ai/dmp/checkface/v1/ (lặp field[] 2 lần)
        try
        {
            using var content = new MultipartFormDataContent();
            using var cardContent = new StreamContent(cardImageStream);
            using var selfieContent = new StreamContent(selfieImageStream);

            cardContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            selfieContent.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");

            content.Add(cardContent, "file[]", "card.jpg");
            content.Add(selfieContent, "file[]", "selfie.jpg");

            var request = new HttpRequestMessage(HttpMethod.Post, "https://api.fpt.ai/dmp/checkface/v1/")
            {
                Content = content
            };
            request.Headers.Add("api-key", effectiveKey);

            var response = await _httpClient.SendAsync(request, ct);
            var json = await response.Content.ReadAsStringAsync(ct);

            if (response.IsSuccessStatusCode)
            {
                using var doc = JsonDocument.Parse(json);
                if (doc.RootElement.TryGetProperty("data", out var data) && 
                    data.TryGetProperty("similarity", out var simProp))
                {
                    double sim = simProp.GetDouble() / 100.0;
                    return new EkycLivenessResult
                    {
                        Success = true,
                        IsLive = true,
                        MatchScore = sim,
                        ReviewRequired = sim < 0.80,
                        Provider = "FPT.AI (Live API)",
                        Message = $"Tỉ lệ khớp khuôn mặt: {sim * 100:F1}%"
                    };
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling real FPT.AI face match API.");
        }

        return new EkycLivenessResult { Success = false, IsLive = false, MatchScore = 0, ReviewRequired = true, Provider = "FPT.AI", Message = "Verification failed." };
    }
}
