using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Infrastructure.Services;
using Microsoft.AspNetCore.Mvc;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[Route("api/v1/mail")]
public class MailController : ControllerBase
{
    private readonly IMailKitService _mailService;

    public MailController(IMailKitService mailService)
    {
        _mailService = mailService;
    }

    [HttpPost("death-claim-alert")]
    public async Task<IActionResult> SendDeathClaimAlert([FromBody] DeathClaimAlertRequest request, CancellationToken ct)
    {
        var caseId = request.CaseId ?? Guid.NewGuid();
        string cancelUrl = request.CancelUrl ?? $"http://localhost:5173/?tab=rescue&caseId={caseId}&action=cancel";

        var result = await _mailService.SendDeathClaimAlertAsync(request.ToEmail, request.OwnerName, caseId, cancelUrl, request.SmtpOverride, ct);

        return Ok(new
        {
            success = result.Success,
            message = result.Message,
            messageId = result.MessageId,
            isRealSmtp = result.IsRealSmtp,
            latencyMs = result.LatencyMs,
            smtpServerResponse = result.SmtpServerResponse,
            errorDetails = result.ErrorDetails,
            dispatchedTo = request.ToEmail
        });
    }

    [HttpPost("alive-claim-alert")]
    public async Task<IActionResult> SendAliveClaimAlert([FromBody] AliveClaimAlertRequest request, CancellationToken ct)
    {
        var caseId = request.CaseId ?? Guid.NewGuid();
        var result = await _mailService.SendAliveClaimNotificationAsync(request.ToEmail, request.OwnerName, caseId, request.SmtpOverride, ct);

        return Ok(new
        {
            success = result.Success,
            message = result.Message,
            messageId = result.MessageId,
            isRealSmtp = result.IsRealSmtp,
            latencyMs = result.LatencyMs,
            smtpServerResponse = result.SmtpServerResponse,
            errorDetails = result.ErrorDetails
        });
    }

    [HttpPost("otp")]
    public async Task<IActionResult> SendOtp([FromBody] OtpEmailRequest request, CancellationToken ct)
    {
        string otp = request.OtpCode ?? new Random().Next(100000, 999999).ToString();
        var result = await _mailService.SendOtpVerificationAsync(request.ToEmail, otp, request.SmtpOverride, ct);

        return Ok(new
        {
            success = result.Success,
            message = result.Message,
            messageId = result.MessageId,
            isRealSmtp = result.IsRealSmtp,
            latencyMs = result.LatencyMs,
            otpGenerated = otp,
            errorDetails = result.ErrorDetails
        });
    }

    [HttpPost("custom")]
    public async Task<IActionResult> SendCustomEmail([FromBody] CustomEmailRequest request, CancellationToken ct)
    {
        var result = await _mailService.SendCustomEmailAsync(request.ToEmail, request.Subject, request.HtmlContent, request.SmtpOverride, ct);
        return Ok(result);
    }

    [HttpGet("recent")]
    public IActionResult GetRecentDispatches()
    {
        if (_mailService is MailKitEmailService concreteService)
        {
            return Ok(concreteService.GetRecentEmails());
        }
        return Ok(Array.Empty<object>());
    }

    /// <summary>
    /// Kiểm tra trạng thái các biến môi trường cấu hình SMTP (EmailUtils)
    /// </summary>
    [HttpGet("env-check")]
    public IActionResult CheckEnvironmentVariables()
    {
        var status = LegacyVault.Prototype.Application.Common.EmailUtils.CheckEnvironmentVariables();
        return Ok(status);
    }
}

public class DeathClaimAlertRequest
{
    public string ToEmail { get; set; } = string.Empty;
    public string OwnerName { get; set; } = "Nguyễn Văn Chủ Kho";
    public Guid? CaseId { get; set; }
    public string? CancelUrl { get; set; }
    public SmtpConfigOverride? SmtpOverride { get; set; }
}

public class AliveClaimAlertRequest
{
    public string ToEmail { get; set; } = string.Empty;
    public string OwnerName { get; set; } = "Nguyễn Văn Chủ Kho";
    public Guid? CaseId { get; set; }
    public SmtpConfigOverride? SmtpOverride { get; set; }
}

public class OtpEmailRequest
{
    public string ToEmail { get; set; } = string.Empty;
    public string? OtpCode { get; set; }
    public SmtpConfigOverride? SmtpOverride { get; set; }
}

public class CustomEmailRequest
{
    public string ToEmail { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string HtmlContent { get; set; } = string.Empty;
    public SmtpConfigOverride? SmtpOverride { get; set; }
}
