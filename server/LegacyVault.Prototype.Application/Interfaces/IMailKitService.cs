namespace LegacyVault.Prototype.Application.Interfaces;

public class SmtpConfigOverride
{
    public string? Host { get; set; }
    public int? Port { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? SenderEmail { get; set; }
    public string? SenderName { get; set; }
}

public class MailSendResult
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string MessageId { get; set; } = string.Empty;
    public bool IsRealSmtp { get; set; }
    public long LatencyMs { get; set; }
    public string? SmtpServerResponse { get; set; }
    public string? ErrorDetails { get; set; }
}

public interface IMailKitService
{
    Task<MailSendResult> SendDeathClaimAlertAsync(string toEmail, string ownerName, Guid caseId, string cancelUrl, SmtpConfigOverride? smtpOverride = null, CancellationToken ct = default);
    Task<MailSendResult> SendAliveClaimNotificationAsync(string toEmail, string ownerName, Guid caseId, SmtpConfigOverride? smtpOverride = null, CancellationToken ct = default);
    Task<MailSendResult> SendOtpVerificationAsync(string toEmail, string otpCode, SmtpConfigOverride? smtpOverride = null, CancellationToken ct = default);
    Task<MailSendResult> SendCustomEmailAsync(string toEmail, string subject, string htmlBody, SmtpConfigOverride? smtpOverride = null, CancellationToken ct = default);
}
