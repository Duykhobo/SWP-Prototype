using LegacyVault.Prototype.Infrastructure.Persistence;
using LegacyVault.Prototype.WebApi.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using System.Threading.RateLimiting;
using System.Text.Json;
using System.Text.Json.Serialization;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Infrastructure.Services;
using LegacyVault.Prototype.WebApi.Middlewares;

LoadDotEnv();

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.UseUrls("http://0.0.0.0:5000");

// 1. JSON Serialization: camelCase đồng bộ với Frontend React theo BE_INTEGRATION_GUIDE
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// 2. CORS cho Frontend React Vite
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClientApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .WithExposedHeaders("X-Correlation-ID");
    });
});

// Fail closed: no development signing key or in-memory account fallback.
var connection = builder.Configuration.GetConnectionString("LegacyVault");
if (string.IsNullOrWhiteSpace(connection)) throw new InvalidOperationException("ConnectionStrings:LegacyVault is required.");
builder.Services.AddDbContext<LegacyVaultDbContext>(options => options.UseSqlServer(connection));
var tokens = new JwtTokenIssuer(builder.Configuration);
builder.Services.AddSingleton(tokens);
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.MapInboundClaims = false;
    options.TokenValidationParameters = tokens.ValidationParameters;
    options.Events = new JwtBearerEvents
    {
        OnTokenValidated = async context =>
        {
            var principal = context.Principal!;
            if (!Guid.TryParse(principal.FindFirst("sub")?.Value, out var userId) ||
                !Guid.TryParse(principal.FindFirst("person_id")?.Value, out var personId))
            { context.Fail("Missing account/person identity."); return; }
            var db = context.HttpContext.RequestServices.GetRequiredService<LegacyVaultDbContext>();
            var account = await db.Users.AsNoTracking().SingleOrDefaultAsync(x => x.Id == userId, context.HttpContext.RequestAborted);
            var demoAllowed = builder.Environment.IsDevelopment() && builder.Configuration.GetValue<bool>("DemoMode:EnablePersonaLogin");
            if (account == null || account.IsDisabled || account.PersonId != personId || (account.IsDemo && !demoAllowed) ||
                !account.Roles.Split(',').OrderBy(x => x).SequenceEqual(principal.FindAll("role").Select(x => x.Value).OrderBy(x => x)))
                context.Fail("Account is disabled or token claims are stale.");
        }
    };
});
builder.Services.AddAuthorization(options => options.FallbackPolicy = new AuthorizationPolicyBuilder()
    .RequireAuthenticatedUser().RequireClaim("sub").RequireClaim("person_id").Build());
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy("auth", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown", _ => new FixedWindowRateLimiterOptions
        { PermitLimit = 12, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});

// 3. Đăng ký Services & DI
builder.Services.AddHttpClient();
builder.Services.AddSingleton<IEnvelopeEncryptionService, EnvelopeEncryptionService>();
builder.Services.AddSingleton<IR2StorageService, CloudflareR2StorageService>();
builder.Services.AddSingleton<IPaymentService, SePayPaymentService>();
builder.Services.AddSingleton<IMailKitService, MailKitEmailService>();
builder.Services.AddHttpClient<IEkycService, EkycService>();
builder.Services.AddHttpClient<IFptMarketplaceService, FptMarketplaceService>();
builder.Services.AddSingleton<ITimeLockRescueService, TimeLockRescueService>();
builder.Services.AddTransient<IOidcValidationService, GoogleOidcValidationService>();
builder.Services.AddSingleton<ILiveKitVideoService, LiveKitVideoService>();
builder.Services.AddSingleton<IVideoSessionService, VideoSessionService>();

// 4. Swagger / OpenAPI Documentation
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 5. Pipeline Middlewares
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseMiddleware<Rfc7807ExceptionMiddleware>();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LegacyVault Prototype API v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowClientApp");
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
// These controllers still use mock keys and process-local handover state (Step 3/4).
// They require an explicit development opt-in even after authentication.
app.Use(async (context, next) =>
{
    var controller = context.GetEndpoint()?.Metadata.GetMetadata<Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor>()?.ControllerName;
    if (controller is "VideoSessions" or "CaseBundles" or "TimeLock" or "Crypto")
    {
        if (!app.Environment.IsDevelopment() || !app.Configuration.GetValue<bool>("DemoMode:EnableLegacyTestbench"))
        { context.Response.StatusCode = StatusCodes.Status404NotFound; return; }
    }
    await next(context);
});
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger/index.html")).AllowAnonymous();
app.Run();

static void LoadDotEnv()
{
    var current = Directory.GetCurrentDirectory();
    string? foundPath = null;
    var dir = new DirectoryInfo(current);
    while (dir != null)
    {
        var testPath = Path.Combine(dir.FullName, ".env");
        if (File.Exists(testPath))
        {
            foundPath = testPath;
            break;
        }
        dir = dir.Parent;
    }

    if (foundPath != null && File.Exists(foundPath))
    {
        foreach (var line in File.ReadAllLines(foundPath))
        {
            var trimmed = line.Trim();
            if (string.IsNullOrWhiteSpace(trimmed) || trimmed.StartsWith('#'))
                continue;

            var idx = trimmed.IndexOf('=');
            if (idx > 0)
            {
                var key = trimmed.Substring(0, idx).Trim();
                var val = trimmed.Substring(idx + 1).Trim().Trim('"', '\'');
                if (!string.IsNullOrEmpty(key) && string.IsNullOrEmpty(Environment.GetEnvironmentVariable(key)))
                {
                    Environment.SetEnvironmentVariable(key, val);
                }
            }
        }
    }
}



public partial class Program { }
