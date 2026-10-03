using System.Net;
using System.Text.Json;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;

namespace LegacyVault.Prototype.WebApi.Middlewares;

public class Rfc7807ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<Rfc7807ExceptionMiddleware> _logger;

    public Rfc7807ExceptionMiddleware(RequestDelegate next, ILogger<Rfc7807ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception occurred while processing request.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";
        var correlationId = context.Items["X-Correlation-ID"]?.ToString() ?? Guid.NewGuid().ToString();

        int statusCode = exception switch
        {
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            UnauthorizedAccessException => (int)HttpStatusCode.Forbidden,
            InvalidOperationException => (int)HttpStatusCode.Conflict,
            ArgumentException => (int)HttpStatusCode.BadRequest,
            _ => (int)HttpStatusCode.InternalServerError
        };

        string errorCode = exception switch
        {
            KeyNotFoundException => ErrorCodes.ERR_PAYMENT_ORDER_NOT_FOUND,
            RecipientNotInSnapshotException => ErrorCodes.FORBIDDEN_RECIPIENT_NOT_IN_SNAPSHOT,
            UnauthorizedAccessException => ErrorCodes.ERR_AUTH_FORBIDDEN,
            ArgumentException => ErrorCodes.ERR_VALIDATION_FAILED,
            _ => ErrorCodes.ERR_INTERNAL_SERVER_ERROR
        };

        var problem = new ProblemDetailsResponse
        {
            Type = $"https://legacyvault.vn/errors/{errorCode.ToLowerInvariant()}",
            Title = exception.GetType().Name,
            Status = statusCode,
            Detail = statusCode == 500 ? "An internal error occurred. Use the correlation ID when reporting this error." : exception.Message,
            ErrorCode = errorCode,
            CorrelationId = correlationId,
            Instance = context.Request.Path,
            Timestamp = DateTime.UtcNow
        };

        context.Response.StatusCode = statusCode;
        var json = JsonSerializer.Serialize(problem, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase });
        await context.Response.WriteAsync(json);
    }
}

