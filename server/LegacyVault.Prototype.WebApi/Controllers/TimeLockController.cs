using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[Route("api/v1/timelock")]
public class TimeLockController : ControllerBase
{
    private readonly ITimeLockRescueService _timeLockService;

    public TimeLockController(ITimeLockRescueService timeLockService)
    {
        _timeLockService = timeLockService;
    }

    [HttpGet("{caseId:guid}")]
    public IActionResult GetStatus(Guid caseId)
    {
        var status = _timeLockService.GetStatus(caseId);
        return Ok(status);
    }

    [HttpPost("init")]
    public IActionResult InitializeCase([FromBody] InitTimeLockRequest request)
    {
        var caseId = request.CaseId ?? Guid.NewGuid();
        var status = _timeLockService.InitializeCaseTimeLock(caseId, request.IsDemoMode);
        return Ok(status);
    }

    /// <summary>
    /// Bước 1 quy trình Cứu hộ: Chủ sở hữu bấm lệnh "Tôi còn sống" (AliveClaim) -> Chuyển RESCUE_PENDING
    /// </summary>
    [HttpPost("alive-claim")]
    public IActionResult SubmitAliveClaim([FromBody] SubmitAliveClaimRequest request)
    {
        var status = _timeLockService.SubmitAliveClaim(request);
        return Ok(new
        {
            success = true,
            message = "Lệnh cứu hộ 'Tôi còn sống' đã được ghi nhận. Hồ sơ chuyển sang RESCUE_PENDING.",
            status
        });
    }

    /// <summary>
    /// Bước 2 quy trình Cứu hộ: Verifier thẩm tra và đưa ra quyết định (APPROVED_ALIVE -> CANCELLED_ALIVE)
    /// </summary>
    [HttpPost("rescue-decision")]
    public IActionResult AdjudicateRescue([FromBody] RescueDecisionRequest request)
    {
        var status = _timeLockService.AdjudicateRescue(request);
        return Ok(new
        {
            success = true,
            message = $"Quyết định cứu hộ đã được thi hành. Trạng thái hiện tại: {status.Status}",
            status
        });
    }

    /// <summary>
    /// Chuyển đổi giữa Chế độ Demo Hội đồng (2 phút) và Chế độ Sản xuất (48 giờ)
    /// </summary>
    [HttpPost("toggle-demo")]
    public IActionResult ToggleDemo([FromBody] ToggleDemoRequest request)
    {
        _timeLockService.ToggleDemoMode(request.CaseId, request.IsDemoMode);
        var status = _timeLockService.GetStatus(request.CaseId);
        return Ok(new
        {
            success = true,
            message = request.IsDemoMode 
                ? "Đã chuyển sang Demo Mode (Chu kỳ đếm ngược 2 phút phục vụ biểu diễn Hội đồng)."
                : "Đã chuyển sang Production Mode (Chu kỳ đếm ngược 48 giờ chuẩn).",
            status
        });
    }
}

public class InitTimeLockRequest
{
    public Guid? CaseId { get; set; }
    public bool IsDemoMode { get; set; } = true;
}

public class ToggleDemoRequest
{
    public Guid CaseId { get; set; }
    public bool IsDemoMode { get; set; }
}
