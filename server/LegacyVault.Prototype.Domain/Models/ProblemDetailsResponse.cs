namespace LegacyVault.Prototype.Domain.Models;

/// <summary>
/// Chuẩn phản hồi lỗi RFC 7807 ProblemDetails
/// </summary>
public class ProblemDetailsResponse
{
    public string Type { get; set; } = "https://legacyvault.vn/errors";
    public string Title { get; set; } = string.Empty;
    public int Status { get; set; }
    public string Detail { get; set; } = string.Empty;
    public string ErrorCode { get; set; } = string.Empty;
    public string CorrelationId { get; set; } = string.Empty;
    public string Instance { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
