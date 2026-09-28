using System.Text.Json;
using System.Text.Json.Serialization;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Infrastructure.Services;
using LegacyVault.Prototype.WebApi.Middlewares;

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

// 3. Đăng ký Services & DI
builder.Services.AddHttpClient();
builder.Services.AddSingleton<IEnvelopeEncryptionService, EnvelopeEncryptionService>();
builder.Services.AddSingleton<IR2StorageService, CloudflareR2StorageService>();
builder.Services.AddSingleton<IPaymentService, SePayPaymentService>();
builder.Services.AddSingleton<IMailKitService, MailKitEmailService>();
builder.Services.AddHttpClient<IEkycService, EkycService>();
builder.Services.AddSingleton<ITimeLockRescueService, TimeLockRescueService>();
builder.Services.AddTransient<IOidcValidationService, GoogleOidcValidationService>();

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
app.UseAuthorization();
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger/index.html"));

app.Run();
