namespace LegacyVault.Prototype.Application.DTOs;

public class FptAiModelDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public int ContextLength { get; set; }
    public List<string> InputModalities { get; set; } = new();
    public List<string> OutputModalities { get; set; } = new();
    public string Description { get; set; } = string.Empty;
}

public class FptAiModelListResponse
{
    public bool Success { get; set; }
    public List<FptAiModelDto> Models { get; set; } = new();
    public string Provider { get; set; } = "FPT Cloud AI Marketplace (mkp-api.fptcloud.com)";
    public long LatencyMs { get; set; }
    public string? ErrorMessage { get; set; }
}

public class FptClauseReviewRequest
{
    public string PresetId { get; set; } = "preset_clause_review_644";
    public string Title { get; set; } = string.Empty;
    public string WillContent { get; set; } = string.Empty;
    public bool IsSyntheticPreset { get; set; } = true;
}

public class FptClauseReviewResponse
{
    public bool Success { get; set; }
    public string ModelId { get; set; } = "Saola-Small-32B";
    public string PresetTitle { get; set; } = string.Empty;
    public string GeneratedContent { get; set; } = string.Empty;
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
    public int TotalTokens { get; set; }
    public long LatencyMs { get; set; }
    public string Disclaimer { get; set; } = "Gợi ý tham khảo (Advisory Only) — Đầu ra cần công chứng viên kiểm tra. Không có giá trị pháp lý thay thế con người.";
    public string? ErrorMessage { get; set; }
}

public class FptVisionExtractRequest
{
    public string PresetId { get; set; } = "preset_synthetic_cert";
    public string Title { get; set; } = string.Empty;
    public string Prompt { get; set; } = "Hãy mô tả và trích xuất các thông tin có thể đọc được từ ảnh tài liệu mẫu này.";
    public string? ImageBase64 { get; set; }
    public bool IsSyntheticPreset { get; set; } = true;
}

public class FptVisionExtractResponse
{
    public bool Success { get; set; }
    public string ModelId { get; set; } = "gemma-3-27b-it";
    public string PresetTitle { get; set; } = string.Empty;
    public string GeneratedContent { get; set; } = string.Empty;
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
    public int TotalTokens { get; set; }
    public long LatencyMs { get; set; }
    public string Disclaimer { get; set; } = "Trích xuất/tóm tắt tài liệu mẫu (Synthetic Q&A) — VLM không xác thực giấy tờ, không thay thế eKYC và không chứng minh tệp chưa bị sửa. Tính toàn vẹn tệp bảo đảm bằng mã băm SHA-256.";
    public string? ErrorMessage { get; set; }
}
