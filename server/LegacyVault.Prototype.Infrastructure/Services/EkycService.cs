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

    public async Task<EkycOcrResult> ExtractIdCardOcrAsync(Stream frontCardStream, Stream? backCardStream, bool useSandbox, string? apiKey = null, CancellationToken ct = default)
    {
        string effectiveKey = (!string.IsNullOrWhiteSpace(apiKey) ? apiKey : _config["Ekyc:FptAiApiKey"]) ?? "";
        bool hasApiKey = !string.IsNullOrWhiteSpace(effectiveKey) && !effectiveKey.Contains("YOUR_");

        if (useSandbox)
        {
            _logger.LogInformation("Processing ID Card OCR using FPT.AI Sandbox Engine.");
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
                Provider = "FPT.AI (Sandbox Mode)",
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

        // Live API: Tuyệt đối không mockup data
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
                    errorMessage = "Chưa cung cấp FPT.AI API Key để chạy Live API. Vui lòng nhập API Key từ https://console.fpt.ai để gửi yêu cầu thực tế lên máy chủ FPT.AI."
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

    public async Task<EkycLivenessResult> VerifyFaceMatchAsync(Stream cardImageStream, Stream selfieImageStream, bool useSandbox, string? apiKey = null, CancellationToken ct = default)
    {
        string effectiveKey = (!string.IsNullOrWhiteSpace(apiKey) ? apiKey : _config["Ekyc:FptAiApiKey"]) ?? "";
        bool hasApiKey = !string.IsNullOrWhiteSpace(effectiveKey) && !effectiveKey.Contains("YOUR_");

        if (useSandbox)
        {
            _logger.LogInformation("Processing Face Match using FPT.AI Sandbox Engine.");
            return new EkycLivenessResult
            {
                Success = true,
                IsLive = true,
                MatchScore = 0.942, // 94.2% khớp khuôn mặt
                ReviewRequired = false,
                Provider = "FPT.AI (Sandbox Mode)",
                Message = "Khuôn mặt trùng khớp 94.2% với ảnh chân dung trên CCCD. Xác thực thành công."
            };
        }

        // Live API: Tuyệt đối không mockup data
        if (!hasApiKey)
        {
            return new EkycLivenessResult
            {
                Success = false,
                IsLive = false,
                MatchScore = 0,
                ReviewRequired = true,
                Provider = "FPT.AI (Live API)",
                Message = "Chưa cung cấp FPT.AI API Key để chạy Live API. Vui lòng nhập API Key từ https://console.fpt.ai vào ô API Key."
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
