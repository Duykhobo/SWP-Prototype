using System.Text.Json;
using System.Text.Json.Serialization;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Infrastructure.Persistence;
using LegacyVault.Prototype.Infrastructure.Services;
using LegacyVault.Prototype.WebApi.Middlewares;
using Microsoft.EntityFrameworkCore;

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

// 3. Đăng ký Database & EF Core
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=(localdb)\\mssqllocaldb;Database=LegacyVaultDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

builder.Services.AddDbContext<LegacyVaultDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

// 4. Đăng ký Services & DI
builder.Services.AddHttpClient();
builder.Services.AddSingleton<IJwtTokenService, JwtTokenService>();
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

// 4. Cấu hình JWT Bearer Authentication chuẩn RFC 7519
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "LegacyVault_Super_Secret_Key_For_Jwt_Token_Signing_2026_Minimum_256_Bits!";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "LegacyVault.Identity";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "LegacyVault.ClientApp";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateLifetime = true,
        ClockSkew = TimeSpan.FromMinutes(1)
    };
});

// 5. Swagger / OpenAPI Documentation kèm Bearer Authorization
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo 
    { 
        Title = "LegacyVault Prototype API", 
        Version = "v1",
        Description = "API nguyên mẫu hệ thống lưu giữ và bàn giao di sản số LegacyVault"
    });
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "Nhập Token theo định dạng: Bearer {accessToken}",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference 
                { 
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, 
                    Id = "Bearer" 
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// 6. Pipeline Middlewares
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
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger/index.html"));
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

