using Microsoft.AspNetCore.Authorization;
using LegacyVault.Prototype.WebApi.Security;
using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;
using Microsoft.AspNetCore.Mvc;

namespace LegacyVault.Prototype.WebApi.Controllers;

[ApiController]
[Route("api/v1/payment")]
public class PaymentController : ControllerBase
{
    private readonly IPaymentService _paymentService;

    public PaymentController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    /// <summary>
    /// Khởi tạo đơn hàng thanh toán gói cước theo chuẩn SRS v3.11.0 (5 gói)
    /// </summary>
    [HttpPost("orders")]
    public async Task<IActionResult> CreateOrder([FromBody] CreatePaymentOrderRequest request)
    {
        var personId = CurrentPerson.Id(User);
        var order = await _paymentService.CreateOrderAsync(request.PlanTier, personId);

        return Ok(new
        {
            success = true,
            order
        });
    }

    [HttpGet("orders")]
    public IActionResult GetAllOrders()
    {
        return Ok(_paymentService.GetAllOrders().Where(x => x.PersonId == CurrentPerson.Id(User)));
    }

    [HttpGet("orders/{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var order = await _paymentService.GetOrderByIdAsync(id);
        if (order == null)
        {
            return NotFound(new ProblemDetailsResponse
            {
                Status = 404,
                ErrorCode = ErrorCodes.ERR_PAYMENT_ORDER_NOT_FOUND,
                Title = "Order Not Found",
                Detail = $"Không tìm thấy đơn hàng có ID {id}",
                Instance = HttpContext.Request.Path
            });
        }

        if (order.PersonId != CurrentPerson.Id(User)) return Forbid();
        return Ok(order);
    }

    /// <summary>
    /// Webhook nhận thông báo giao dịch trực tiếp từ SePay Server-to-Server
    /// </summary>
    [AllowAnonymous]
    [HttpPost("webhook")]
    public async Task<IActionResult> ProcessSePayWebhook(
        [FromBody] SePayWebhookPayload payload,
        [FromHeader(Name = "Authorization")] string? authHeader,
        [FromHeader(Name = "X-Signature")] string? signature)
    {
        var result = await _paymentService.ProcessWebhookAsync(payload, authHeader, signature);

        if (!result.Success)
        {
            return StatusCode(result.StatusCode, new ProblemDetailsResponse
            {
                Status = result.StatusCode,
                ErrorCode = result.ErrorCode ?? ErrorCodes.ERR_VALIDATION_FAILED,
                Title = "Webhook Processing Failed",
                Detail = result.Message,
                Instance = HttpContext.Request.Path
            });
        }

        return Ok(new { success = true, message = result.Message });
    }

    /// <summary>
    /// Endpoint mô phỏng thanh toán SePay thành công trong môi trường Demo (Hard Rule 1.7)
    /// </summary>
    [HttpPost("/api/v1/demo/payment-orders/{orderId:guid}/simulate-success")]
    public async Task<IActionResult> SimulatePaymentSuccess(Guid orderId)
    {
        try
        {
            var existing = await _paymentService.GetOrderByIdAsync(orderId);
            if (existing == null) return NotFound();
            if (existing.PersonId != CurrentPerson.Id(User)) return Forbid();
            var order = await _paymentService.SimulatePaymentSuccessAsync(orderId);
            return Ok(new
            {
                success = true,
                message = "Đã mô phỏng thanh toán thành công trong Demo Mode.",
                order
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetailsResponse
            {
                Status = 404,
                ErrorCode = ErrorCodes.ERR_PAYMENT_ORDER_NOT_FOUND,
                Title = "Order Not Found",
                Detail = ex.Message,
                Instance = HttpContext.Request.Path
            });
        }
    }
}

