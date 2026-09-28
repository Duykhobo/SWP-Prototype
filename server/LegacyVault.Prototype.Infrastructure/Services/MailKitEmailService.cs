using LegacyVault.Prototype.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;
using MimeKit.Text;

namespace LegacyVault.Prototype.Infrastructure.Services;

/// <summary>
/// Dịch vụ gửi email thông báo khẩn cấp qua MailKit SMTP (RFC 5322 & RFC 2045)
/// </summary>
public class MailKitEmailService : IMailKitService
{
    private readonly IConfiguration _config;
    private readonly ILogger<MailKitEmailService> _logger;
    private readonly List<DispatchedEmailRecord> _recentEmails = new();

    public class DispatchedEmailRecord
    {
        public string ToEmail { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string HtmlBody { get; set; } = string.Empty;
        public DateTime SentAt { get; set; } = DateTime.UtcNow;
        public bool IsRealSmtp { get; set; }
    }

    public MailKitEmailService(IConfiguration config, ILogger<MailKitEmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public IEnumerable<DispatchedEmailRecord> GetRecentEmails() => _recentEmails.OrderByDescending(e => e.SentAt);

    public Task<MailSendResult> SendDeathClaimAlertAsync(string toEmail, string ownerName, Guid caseId, string cancelUrl, SmtpConfigOverride? smtpOverride = null, CancellationToken ct = default)
    {
        string subject = "[CẢNH BÁO KHẨN CẤP] Yêu cầu mở kho di sản số đã được kích hoạt - LegacyVault";
        string htmlBody = $@"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #DCD9D0; border-radius: 8px; overflow: hidden;'>
            <div style='background-color: #0B291E; color: #FAF9F5; padding: 24px; text-align: center;'>
                <h1 style='color: #B88E4C; margin: 0; font-size: 22px;'>LEGACYVAULT SECURITY ALERT</h1>
                <p style='margin: 8px 0 0 0; font-size: 14px;'>Hệ thống Cảnh báo Bảo vệ Di sản Số</p>
            </div>
            <div style='padding: 24px; background-color: #FAF9F5;'>
                <p>Kính gửi <strong>{ownerName}</strong>,</p>
                <p>Hệ thống vừa tiếp nhận <strong>Hồ sơ yêu cầu mở kho di sản số</strong> từ Người thực thi (Mã hồ sơ: <code>{caseId}</code>).</p>
                <div style='background-color: #FBF7EE; border-left: 4px solid #B88E4C; padding: 12px; margin: 16px 0;'>
                    <p style='margin: 0; color: #14241C; font-weight: bold;'>CƠ CHẾ KHÓA THỜI GIAN TRỄ (TIME-LOCK DELAY) ĐANG ĐẾM NGƯỢC:</p>
                    <p style='margin: 4px 0 0 0; color: #66786E; font-size: 13px;'>Kho của bạn đang trong thời gian đếm ngược an toàn. Tuyệt đối không ai có thể giải mã dữ liệu của bạn trước khi thời hạn trôi qua.</p>
                </div>
                <p style='color: #D9534F; font-weight: bold;'>NẾU BẠN VẪN CÒN SỐNG HOẶC ĐÂY LÀ HÀNH VI XÂM PHẠM TRÁI PHÉP:</p>
                <p>Vui lòng bấm ngay vào nút bên dưới để gửi lệnh cứu hộ <strong>Tôi còn sống (AliveClaim)</strong> và kích hoạt cơ chế khóa bảo vệ khẩn cấp:</p>
                <div style='text-align: center; margin: 24px 0;'>
                    <a href='{cancelUrl}' style='background-color: #D9534F; color: #FFFFFF; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>HỦY KHẨN CẤP / TÔI CÒN SỐNG</a>
                </div>
                <p style='font-size: 12px; color: #66786E; text-align: center;'>Hoặc truy cập: <a href='{cancelUrl}'>{cancelUrl}</a></p>
            </div>
            <div style='background-color: #EFECE6; padding: 12px; text-align: center; font-size: 11px; color: #66786E;'>
                Email tự động bảo mật từ LegacyVault Anti-Collusion System (FIPS 140-2 Level 3 Standard).
            </div>
        </div>";

        return SendEmailInternalAsync(toEmail, subject, htmlBody, smtpOverride, ct);
    }

    public Task<MailSendResult> SendAliveClaimNotificationAsync(string toEmail, string ownerName, Guid caseId, SmtpConfigOverride? smtpOverride = null, CancellationToken ct = default)
    {
        string subject = "[THÔNG BÁO] Chủ kho đã kích hoạt lệnh cứu hộ Tôi Còn Sống - LegacyVault";
        string htmlBody = $@"
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #DCD9D0; border-radius: 8px; overflow: hidden;'>
            <div style='background-color: #0B291E; color: #FAF9F5; padding: 24px; text-align: center;'>
                <h1 style='color: #B88E4C; margin: 0; font-size: 22px;'>LEGACYVAULT RESCUE NOTIFICATION</h1>
            </div>
            <div style='padding: 24px; background-color: #FAF9F5;'>
                <p>Kính gửi Người thẩm định / Các bên liên quan,</p>
                <p>Chủ sở hữu <strong>{ownerName}</strong> vừa chính thức nộp lệnh cứu hộ <strong>AliveClaim (Tôi còn sống)</strong> cho hồ sơ <code>{caseId}</code>.</p>
                <p>Tiến trình mở kho đã chuyển sang trạng thái <strong>RESCUE_PENDING</strong> để ngăn chặn mọi nguy cơ bàn giao nhầm lẫn hoặc gian lận.</p>
            </div>
        </div>";

        return SendEmailInternalAsync(toEmail, subject, htmlBody, smtpOverride, ct);
    }

    public Task<MailSendResult> SendOtpVerificationAsync(string toEmail, string otpCode, SmtpConfigOverride? smtpOverride = null, CancellationToken ct = default)
    {
        string subject = $"[{otpCode}] Mã xác thực OTP đăng nhập LegacyVault";
        string htmlBody = $@"
        <div style='font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #DCD9D0; border-radius: 8px; padding: 20px; background-color: #FAF9F5;'>
            <h2 style='color: #0B291E; text-align: center;'>XÁC THỰC DANH TÍNH</h2>
            <p>Mã OTP dùng một lần của bạn là:</p>
            <div style='text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #B88E4C; padding: 16px; background-color: #FBF7EE; border-radius: 6px; margin: 16px 0;'>
                {otpCode}
            </div>
            <p style='color: #66786E; font-size: 13px;'>Mã có hiệu lực trong 5 phút. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
        </div>";

        return SendEmailInternalAsync(toEmail, subject, htmlBody, smtpOverride, ct);
    }

    public Task<MailSendResult> SendCustomEmailAsync(string toEmail, string subject, string htmlBody, SmtpConfigOverride? smtpOverride = null, CancellationToken ct = default)
    {
        return SendEmailInternalAsync(toEmail, subject, htmlBody, smtpOverride, ct);
    }

    private async Task<MailSendResult> SendEmailInternalAsync(string toEmail, string subject, string htmlBody, SmtpConfigOverride? smtpOverride, CancellationToken ct)
    {
        var sw = System.Diagnostics.Stopwatch.StartNew();

        string host = smtpOverride?.Host 
            ?? Environment.GetEnvironmentVariable("SMTP__HOST")
            ?? Environment.GetEnvironmentVariable("SMTP_HOST")
            ?? _config["Smtp:Host"] 
            ?? "smtp.gmail.com";

        int port = smtpOverride?.Port 
            ?? (int.TryParse(Environment.GetEnvironmentVariable("SMTP__PORT") ?? Environment.GetEnvironmentVariable("SMTP_PORT") ?? _config["Smtp:Port"], out int p) ? p : 587);

        string? username = smtpOverride?.Username 
            ?? Environment.GetEnvironmentVariable("SMTP__USERNAME")
            ?? Environment.GetEnvironmentVariable("SMTP_USERNAME")
            ?? _config["Smtp:Username"];

        string? password = smtpOverride?.Password 
            ?? Environment.GetEnvironmentVariable("SMTP__PASSWORD")
            ?? Environment.GetEnvironmentVariable("SMTP_PASSWORD")
            ?? _config["Smtp:Password"];

        string senderEmail = smtpOverride?.SenderEmail 
            ?? Environment.GetEnvironmentVariable("SMTP__SENDEREMAIL")
            ?? _config["Smtp:SenderEmail"] 
            ?? username 
            ?? "security@legacyvault.vn";

        string senderName = smtpOverride?.SenderName 
            ?? Environment.GetEnvironmentVariable("SMTP__SENDERNAME")
            ?? _config["Smtp:SenderName"] 
            ?? "LegacyVault Security Alert";

        bool hasCredentials = !string.IsNullOrWhiteSpace(username) && 
                              !string.IsNullOrWhiteSpace(password) &&
                              !username.Contains("YOUR_") &&
                              !password.Contains("YOUR_");

        if (!hasCredentials)
        {
            return new MailSendResult
            {
                Success = false,
                IsRealSmtp = false,
                LatencyMs = sw.ElapsedMilliseconds,
                Message = "Chưa cung cấp thông tin SMTP (Username và Mật khẩu ứng dụng Gmail/Brevo). Vui lòng nhập Username và Mật khẩu ứng dụng 16 ký tự của Gmail trên giao diện tab '5. MailKit SMTP' hoặc cấu hình biến môi trường 'SMTP__USERNAME' và 'SMTP__PASSWORD' trên backend để gửi email thật.",
                ErrorDetails = "SMTP Credentials Missing"
            };
        }

        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(senderName, senderEmail));
        message.To.Add(new MailboxAddress(toEmail, toEmail));
        message.Subject = subject;
        message.Body = new TextPart(TextFormat.Html) { Text = htmlBody };

        try
        {
            using var client = new SmtpClient();
            await client.ConnectAsync(host, port, SecureSocketOptions.StartTls, ct);
            await client.AuthenticateAsync(username!, password!, ct);
            string sendResponse = await client.SendAsync(message, ct);
            await client.DisconnectAsync(true, ct);

            sw.Stop();

            _recentEmails.Add(new DispatchedEmailRecord
            {
                ToEmail = toEmail,
                Subject = subject,
                HtmlBody = htmlBody,
                IsRealSmtp = true
            });

            _logger.LogInformation("Real email dispatched via SMTP to {ToEmail}: {Subject} in {Elapsed}ms", toEmail, subject, sw.ElapsedMilliseconds);
            return new MailSendResult 
            { 
                Success = true, 
                IsRealSmtp = true,
                LatencyMs = sw.ElapsedMilliseconds,
                Message = $"Gửi email thành công qua SMTP thực tế ({host}:{port})!", 
                MessageId = message.MessageId ?? Guid.NewGuid().ToString(),
                SmtpServerResponse = sendResponse
            };
        }
        catch (Exception ex)
        {
            sw.Stop();
            _logger.LogError(ex, "Failed to send email via real SMTP to {ToEmail}.", toEmail);
            return new MailSendResult
            {
                Success = false,
                IsRealSmtp = true,
                LatencyMs = sw.ElapsedMilliseconds,
                Message = $"Gửi email SMTP thất bại: {ex.Message}",
                ErrorDetails = ex.ToString()
            };
        }
    }
}
