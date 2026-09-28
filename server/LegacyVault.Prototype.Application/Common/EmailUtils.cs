using System.Text.RegularExpressions;

namespace LegacyVault.Prototype.Application.Common;

/// <summary>
/// Tiện ích hỗ trợ xử lý Email và Kiểm tra cấu hình biến môi trường SMTP (EmailUtils)
/// </summary>
public static class EmailUtils
{
    private static readonly Regex EmailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        RegexOptions.Compiled | RegexOptions.IgnoreCase);

    /// <summary>
    /// Kiểm tra định dạng email hợp lệ theo chuẩn RFC 5322
    /// </summary>
    public static bool IsValidEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email)) return false;
        return EmailRegex.IsMatch(email.Trim());
    }

    /// <summary>
    /// Che mờ email (Masking) để bảo vệ quyền riêng tư cá nhân theo Nghị định 13/2023/NĐ-CP
    /// Ví dụ: "thanhduy@gmail.com" -> "th***uy@gmail.com"
    /// </summary>
    public static string MaskEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email) || !email.Contains('@'))
        {
            return "***";
        }

        var parts = email.Split('@');
        var local = parts[0];
        var domain = parts[1];

        if (local.Length <= 2)
        {
            return $"{local[0]}***@{domain}";
        }

        string maskedLocal = $"{local[0]}{local[1]}***{local[^1]}";
        return $"{maskedLocal}@{domain}";
    }

    /// <summary>
    /// Báo cáo và kiểm tra toàn diện các biến môi trường cấu hình SMTP của hệ thống
    /// </summary>
    public static SmtpEnvironmentStatus CheckEnvironmentVariables()
    {
        string? host = Environment.GetEnvironmentVariable("SMTP__HOST") 
            ?? Environment.GetEnvironmentVariable("SMTP_HOST");

        string? portStr = Environment.GetEnvironmentVariable("SMTP__PORT") 
            ?? Environment.GetEnvironmentVariable("SMTP_PORT");

        string? username = Environment.GetEnvironmentVariable("SMTP__USERNAME") 
            ?? Environment.GetEnvironmentVariable("SMTP_USERNAME");

        string? password = Environment.GetEnvironmentVariable("SMTP__PASSWORD") 
            ?? Environment.GetEnvironmentVariable("SMTP_PASSWORD");

        string? senderEmail = Environment.GetEnvironmentVariable("SMTP__SENDEREMAIL") 
            ?? Environment.GetEnvironmentVariable("SMTP_SENDER_EMAIL");

        string? senderName = Environment.GetEnvironmentVariable("SMTP__SENDERNAME") 
            ?? Environment.GetEnvironmentVariable("SMTP_SENDER_NAME");

        bool hasHost = !string.IsNullOrWhiteSpace(host);
        bool hasPort = int.TryParse(portStr, out _);
        bool hasUsername = !string.IsNullOrWhiteSpace(username) && !username.Contains("YOUR_");
        bool hasPassword = !string.IsNullOrWhiteSpace(password) && !password.Contains("YOUR_");

        bool isReadyForLiveSmtp = hasUsername && hasPassword;

        return new SmtpEnvironmentStatus
        {
            IsReadyForLiveSmtp = isReadyForLiveSmtp,
            Host = hasHost ? host! : "smtp.gmail.com (Mặc định)",
            Port = hasPort ? int.Parse(portStr!) : 587,
            UsernameMasked = hasUsername ? MaskEmail(username) : "Chưa cấu hình biến môi trường",
            HasPasswordConfigured = hasPassword,
            SenderEmail = !string.IsNullOrWhiteSpace(senderEmail) ? senderEmail : (hasUsername ? username! : "security@legacyvault.vn"),
            SenderName = !string.IsNullOrWhiteSpace(senderName) ? senderName : "LegacyVault Security Alert",
            GuidanceMessage = isReadyForLiveSmtp 
                ? "Các biến môi trường SMTP đã được thiết lập đầy đủ. Sẵn sàng gửi email thật." 
                : "Chưa thiết lập biến môi trường SMTP__USERNAME hoặc SMTP__PASSWORD. Bạn có thể nạp biến môi trường ở backend hoặc nhập trực tiếp cấu hình SMTP trên giao diện Testbench."
        };
    }
}

public class SmtpEnvironmentStatus
{
    public bool IsReadyForLiveSmtp { get; set; }
    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public string UsernameMasked { get; set; } = string.Empty;
    public bool HasPasswordConfigured { get; set; }
    public string SenderEmail { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;
    public string GuidanceMessage { get; set; } = string.Empty;
}
