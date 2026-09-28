using System.Diagnostics;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LegacyVault.Prototype.Infrastructure.Services;

public class FptMarketplaceService : IFptMarketplaceService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FptMarketplaceService> _logger;

    private const string BaseUrl = "https://mkp-api.fptcloud.com";
    private const string DefaultLlmModel = "Saola-Small-32B";
    private const string DefaultVisionModel = "gemma-3-27b-it";

    public FptMarketplaceService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<FptMarketplaceService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    private string? GetApiKey()
    {
        // P0 Security: Read API key strictly from environment variable or secret manager.
        var envKey = Environment.GetEnvironmentVariable("LEGACYVAULT_FPT_API_KEY");
        if (!string.IsNullOrWhiteSpace(envKey))
        {
            return envKey.Trim();
        }

        var demoEnvKey = Environment.GetEnvironmentVariable("LEGACYVAULT_FPT_API_KEY_DEMO");
        if (!string.IsNullOrWhiteSpace(demoEnvKey))
        {
            return demoEnvKey.Trim();
        }

        var configKey = _configuration["FptMarketplace:ApiKey"];
        if (!string.IsNullOrWhiteSpace(configKey))
        {
            return configKey.Trim();
        }

        return null;
    }

    private void ApplyAuthHeaders(HttpRequestMessage request, string apiKey)
    {
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);
        request.Headers.TryAddWithoutValidation("api-key", apiKey);
    }

    public async Task<FptAiModelListResponse> GetAvailableModelsAsync(CancellationToken cancellationToken = default)
    {
        var sw = Stopwatch.StartNew();
        var apiKey = GetApiKey();

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return new FptAiModelListResponse
            {
                Success = false,
                LatencyMs = sw.ElapsedMilliseconds,
                ErrorMessage = "Chưa cấu hình API Key FPT Cloud AI Marketplace. Vui lòng thiết lập biến môi trường 'LEGACYVAULT_FPT_API_KEY' trên backend."
            };
        }

        try
        {
            using var req = new HttpRequestMessage(HttpMethod.Get, $"{BaseUrl}/models");
            ApplyAuthHeaders(req, apiKey);

            using var res = await _httpClient.SendAsync(req, cancellationToken);
            sw.Stop();

            if (!res.IsSuccessStatusCode)
            {
                var errorBody = await res.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("FPT AI Marketplace /models returned HTTP {StatusCode}: {ErrorBody}", res.StatusCode, errorBody);
                return new FptAiModelListResponse
                {
                    Success = false,
                    LatencyMs = sw.ElapsedMilliseconds,
                    ErrorMessage = $"Máy chủ FPT Cloud trả mã lỗi HTTP {(int)res.StatusCode}: {res.ReasonPhrase}"
                };
            }

            var json = await res.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(json);

            var modelsList = new List<FptAiModelDto>();

            // /models returns an array of model objects
            if (doc.RootElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var el in doc.RootElement.EnumerateArray())
                {
                    modelsList.Add(ParseModelElement(el));
                }
            }
            else if (doc.RootElement.TryGetProperty("data", out var dataProp) && dataProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var el in dataProp.EnumerateArray())
                {
                    modelsList.Add(ParseModelElement(el));
                }
            }

            return new FptAiModelListResponse
            {
                Success = true,
                Models = modelsList,
                LatencyMs = sw.ElapsedMilliseconds
            };
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Lỗi khi gọi FPT AI Marketplace /models");
            return new FptAiModelListResponse
            {
                Success = false,
                LatencyMs = sw.ElapsedMilliseconds,
                ErrorMessage = $"Lỗi kết nối tới FPT Cloud AI Marketplace: {ex.Message}"
            };
        }
    }

    private static FptAiModelDto ParseModelElement(JsonElement el)
    {
        var dto = new FptAiModelDto();
        if (el.TryGetProperty("id", out var idProp)) dto.Id = idProp.GetString() ?? "";
        if (el.TryGetProperty("name", out var nameProp)) dto.Name = nameProp.GetString() ?? dto.Id;
        if (el.TryGetProperty("context_length", out var ctxProp) && ctxProp.TryGetInt32(out var ctxVal)) dto.ContextLength = ctxVal;
        if (el.TryGetProperty("description", out var descProp)) dto.Description = descProp.GetString() ?? "";

        if (el.TryGetProperty("architecture", out var archProp))
        {
            if (archProp.TryGetProperty("input_modalities", out var inMods) && inMods.ValueKind == JsonValueKind.Array)
            {
                foreach (var m in inMods.EnumerateArray())
                {
                    var val = m.GetString();
                    if (!string.IsNullOrEmpty(val)) dto.InputModalities.Add(val);
                }
            }

            if (archProp.TryGetProperty("output_modalities", out var outMods) && outMods.ValueKind == JsonValueKind.Array)
            {
                foreach (var m in outMods.EnumerateArray())
                {
                    var val = m.GetString();
                    if (!string.IsNullOrEmpty(val)) dto.OutputModalities.Add(val);
                }
            }
        }

        return dto;
    }

    public async Task<FptClauseReviewResponse> ReviewWillClauseAsync(FptClauseReviewRequest request, CancellationToken cancellationToken = default)
    {
        var sw = Stopwatch.StartNew();
        var apiKey = GetApiKey();

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return new FptClauseReviewResponse
            {
                Success = false,
                PresetTitle = request.Title,
                LatencyMs = sw.ElapsedMilliseconds,
                ErrorMessage = "Chưa cấu hình API Key FPT Cloud AI Marketplace. Vui lòng thiết lập biến môi trường 'LEGACYVAULT_FPT_API_KEY' trên backend."
            };
        }

        // P0 Zero-Knowledge check: Only synthetic preset data is permitted in live demo
        if (!request.IsSyntheticPreset)
        {
            return new FptClauseReviewResponse
            {
                Success = false,
                PresetTitle = request.Title,
                LatencyMs = sw.ElapsedMilliseconds,
                ErrorMessage = "Để bảo vệ quyền riêng tư Zero-Knowledge, bản demo chỉ tiếp nhận dữ liệu kịch bản giả lập đã kiểm duyệt (Synthetic Presets). Nhập tự do bị từ chối khi chưa có thỏa thuận Opt-in Consent."
            };
        }

        try
        {
            var payload = new
            {
                model = DefaultLlmModel,
                messages = new object[]
                {
                    new
                    {
                        role = "system",
                        content = "Bạn là Trợ lý AI hỗ trợ rà soát văn bản di chúc cho hệ thống LegacyVault. Nhiệm vụ của bạn là đưa ra GỢI Ý THAM KHẢO (Advisory Only) về các khía cạnh pháp lý cần người thẩm định (Công chứng viên / Luật sư) chú ý theo Bộ luật Dân sự 2015. Hãy phân tích ngắn gọn, khách quan, không tự ý đưa ra phán quyết pháp lý thay cho con người."
                    },
                    new
                    {
                        role = "user",
                        content = $"Hãy rà soát và đưa ra nhận xét tham khảo cho nội dung điều khoản di chúc sau:\n\"\"\"{request.WillContent}\"\"\""
                    }
                },
                max_tokens = 500,
                temperature = 0.2
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            using var req = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/chat/completions")
            {
                Content = jsonContent
            };
            ApplyAuthHeaders(req, apiKey);

            using var res = await _httpClient.SendAsync(req, cancellationToken);
            sw.Stop();

            if (!res.IsSuccessStatusCode)
            {
                var errorBody = await res.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("FPT AI Marketplace /chat/completions returned HTTP {StatusCode}: {ErrorBody}", res.StatusCode, errorBody);
                return new FptClauseReviewResponse
                {
                    Success = false,
                    ModelId = DefaultLlmModel,
                    PresetTitle = request.Title,
                    LatencyMs = sw.ElapsedMilliseconds,
                    ErrorMessage = $"Máy chủ FPT Cloud trả mã lỗi HTTP {(int)res.StatusCode}: {res.ReasonPhrase}"
                };
            }

            var resBody = await res.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(resBody);

            string content = "";
            int promptTokens = 0, completionTokens = 0, totalTokens = 0;

            if (doc.RootElement.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
            {
                var firstChoice = choices[0];
                if (firstChoice.TryGetProperty("message", out var msg) && msg.TryGetProperty("content", out var cProp))
                {
                    content = cProp.GetString() ?? "";
                }
            }

            if (doc.RootElement.TryGetProperty("usage", out var usage))
            {
                if (usage.TryGetProperty("prompt_tokens", out var pt) && pt.TryGetInt32(out var ptVal)) promptTokens = ptVal;
                if (usage.TryGetProperty("completion_tokens", out var ct) && ct.TryGetInt32(out var ctVal)) completionTokens = ctVal;
                if (usage.TryGetProperty("total_tokens", out var tt) && tt.TryGetInt32(out var ttVal)) totalTokens = ttVal;
            }

            return new FptClauseReviewResponse
            {
                Success = true,
                ModelId = DefaultLlmModel,
                PresetTitle = request.Title,
                GeneratedContent = content,
                PromptTokens = promptTokens,
                CompletionTokens = completionTokens,
                TotalTokens = totalTokens,
                LatencyMs = sw.ElapsedMilliseconds
            };
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Lỗi khi gọi FPT AI Marketplace LLM Clause Review");
            return new FptClauseReviewResponse
            {
                Success = false,
                ModelId = DefaultLlmModel,
                PresetTitle = request.Title,
                LatencyMs = sw.ElapsedMilliseconds,
                ErrorMessage = $"Lỗi kết nối FPT Cloud: {ex.Message}"
            };
        }
    }

    public async Task<FptVisionExtractResponse> ExtractSyntheticDocumentAsync(FptVisionExtractRequest request, CancellationToken cancellationToken = default)
    {
        var sw = Stopwatch.StartNew();
        var apiKey = GetApiKey();

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return new FptVisionExtractResponse
            {
                Success = false,
                PresetTitle = request.Title,
                LatencyMs = sw.ElapsedMilliseconds,
                ErrorMessage = "Chưa cấu hình API Key FPT Cloud AI Marketplace. Vui lòng thiết lập biến môi trường 'LEGACYVAULT_FPT_API_KEY' trên backend."
            };
        }

        // P0 Zero-Knowledge check: Only synthetic presets are permitted in live demo
        if (!request.IsSyntheticPreset)
        {
            return new FptVisionExtractResponse
            {
                Success = false,
                PresetTitle = request.Title,
                LatencyMs = sw.ElapsedMilliseconds,
                ErrorMessage = "Để bảo vệ quyền riêng tư Zero-Knowledge, bản demo chỉ tiếp nhận ảnh tài liệu mẫu giả lập đã kiểm duyệt (Synthetic Presets). Tải tệp cá nhân bị từ chối khi chưa có thỏa thuận Opt-in Consent."
            };
        }

        // Fallback default clean synthetic dummy image (1x1 PNG) if base64 not provided
        var base64Data = request.ImageBase64;
        if (string.IsNullOrWhiteSpace(base64Data))
        {
            base64Data = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        }

        var dataUri = base64Data.StartsWith("data:") ? base64Data : $"data:image/png;base64,{base64Data}";

        try
        {
            var payload = new
            {
                model = DefaultVisionModel,
                messages = new object[]
                {
                    new
                    {
                        role = "user",
                        content = new object[]
                        {
                            new
                            {
                                type = "text",
                                text = request.Prompt
                            },
                            new
                            {
                                type = "image_url",
                                image_url = new
                                {
                                    url = dataUri
                                }
                            }
                        }
                    }
                },
                max_tokens = 350
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");

            using var req = new HttpRequestMessage(HttpMethod.Post, $"{BaseUrl}/chat/completions")
            {
                Content = jsonContent
            };
            ApplyAuthHeaders(req, apiKey);

            using var res = await _httpClient.SendAsync(req, cancellationToken);
            sw.Stop();

            if (!res.IsSuccessStatusCode)
            {
                var errorBody = await res.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("FPT AI Marketplace VLM /chat/completions returned HTTP {StatusCode}: {ErrorBody}", res.StatusCode, errorBody);
                return new FptVisionExtractResponse
                {
                    Success = false,
                    ModelId = DefaultVisionModel,
                    PresetTitle = request.Title,
                    LatencyMs = sw.ElapsedMilliseconds,
                    ErrorMessage = $"Máy chủ FPT Cloud trả mã lỗi HTTP {(int)res.StatusCode}: {res.ReasonPhrase}"
                };
            }

            var resBody = await res.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(resBody);

            string content = "";
            int promptTokens = 0, completionTokens = 0, totalTokens = 0;

            if (doc.RootElement.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
            {
                var firstChoice = choices[0];
                if (firstChoice.TryGetProperty("message", out var msg) && msg.TryGetProperty("content", out var cProp))
                {
                    content = cProp.GetString() ?? "";
                }
            }

            if (doc.RootElement.TryGetProperty("usage", out var usage))
            {
                if (usage.TryGetProperty("prompt_tokens", out var pt) && pt.TryGetInt32(out var ptVal)) promptTokens = ptVal;
                if (usage.TryGetProperty("completion_tokens", out var ct) && ct.TryGetInt32(out var ctVal)) completionTokens = ctVal;
                if (usage.TryGetProperty("total_tokens", out var tt) && tt.TryGetInt32(out var ttVal)) totalTokens = ttVal;
            }

            return new FptVisionExtractResponse
            {
                Success = true,
                ModelId = DefaultVisionModel,
                PresetTitle = request.Title,
                GeneratedContent = content,
                PromptTokens = promptTokens,
                CompletionTokens = completionTokens,
                TotalTokens = totalTokens,
                LatencyMs = sw.ElapsedMilliseconds
            };
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Lỗi khi gọi FPT AI Marketplace VLM Vision Extract");
            return new FptVisionExtractResponse
            {
                Success = false,
                ModelId = DefaultVisionModel,
                PresetTitle = request.Title,
                LatencyMs = sw.ElapsedMilliseconds,
                ErrorMessage = $"Lỗi kết nối FPT Cloud VLM: {ex.Message}"
            };
        }
    }
}
