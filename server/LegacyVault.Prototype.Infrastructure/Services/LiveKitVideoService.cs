using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using LegacyVault.Prototype.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace LegacyVault.Prototype.Infrastructure.Services;

public class LiveKitVideoService : ILiveKitVideoService
{
    private readonly string _url;
    private readonly string _apiKey;
    private readonly string _apiSecret;
    private readonly HttpClient _httpClient;
    private readonly ILogger<LiveKitVideoService> _logger;

    public LiveKitVideoService(
        IConfiguration configuration,
        HttpClient httpClient,
        ILogger<LiveKitVideoService> logger)
    {
        _url = configuration["LIVEKIT_URL"] 
               ?? configuration["LIVEKIT__URL"] 
               ?? configuration["LiveKit:Url"] 
               ?? "wss://legacyvaultprototype-t2bk4rvi.livekit.cloud";

        _apiKey = configuration["LIVEKIT_API_KEY"] 
                  ?? configuration["LIVEKIT__APIKEY"] 
                  ?? configuration["LiveKit:ApiKey"] 
                  ?? string.Empty;

        _apiSecret = configuration["LIVEKIT_API_SECRET"] 
                     ?? configuration["LIVEKIT__APISECRET"] 
                     ?? configuration["LiveKit:ApiSecret"] 
                     ?? string.Empty;

        _httpClient = httpClient;
        _logger = logger;
    }

    public string GenerateJoinToken(
        string roomName, 
        string participantIdentity, 
        string participantName, 
        TimeSpan ttl)
    {
        if (string.IsNullOrEmpty(_apiKey) || string.IsNullOrEmpty(_apiSecret))
        {
            throw new InvalidOperationException("LiveKit API Key hoặc API Secret chưa được cấu hình.");
        }

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_apiSecret));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var videoGrants = new Dictionary<string, object>
        {
            { "room", roomName },
            { "roomJoin", true },
            { "canPublish", true },
            { "canSubscribe", true },
            { "canPublishData", true }
        };

        var now = DateTime.UtcNow;
        var expires = now.Add(ttl);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, participantIdentity),
            new(JwtRegisteredClaimNames.Iss, _apiKey),
            new(JwtRegisteredClaimNames.Nbf, ((DateTimeOffset)now.AddSeconds(-10)).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            new(JwtRegisteredClaimNames.Name, participantName),
            new("video", JsonSerializer.Serialize(videoGrants), JsonClaimValueTypes.Json)
        };

        var header = new JwtHeader(credentials);
        var payload = new JwtPayload(
            issuer: _apiKey,
            audience: null,
            claims: claims,
            notBefore: now.AddSeconds(-10),
            expires: expires);

        // Đảm bảo video grant được serialize dạng JSON object trong token payload
        payload["video"] = videoGrants;

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = new JwtSecurityToken(header, payload);
        return tokenHandler.WriteToken(token);
    }

    public async Task<bool> DeleteRoomAsync(string roomName, CancellationToken ct = default)
    {
        try
        {
            if (string.IsNullOrEmpty(_apiKey) || string.IsNullOrEmpty(_apiSecret))
            {
                _logger.LogWarning("Bỏ qua đóng phòng LiveKit vì thiếu ApiKey/ApiSecret.");
                return false;
            }

            // Sinh admin token để gọi Twirp RoomService API
            var adminToken = GenerateAdminToken(roomName);

            var httpUrl = _url.Replace("wss://", "https://").Replace("ws://", "http://");
            var requestUri = $"{httpUrl.TrimEnd('/')}/twirp/livekit.RoomService/DeleteRoom";

            using var request = new HttpRequestMessage(HttpMethod.Post, requestUri);
            request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", adminToken);
            request.Content = new StringContent(
                JsonSerializer.Serialize(new { room = roomName }), 
                Encoding.UTF8, 
                "application/json");

            var response = await _httpClient.SendAsync(request, ct);
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Đã xóa phòng {RoomName} trên LiveKit Cloud.", roomName);
                return true;
            }

            var errBody = await response.Content.ReadAsStringAsync(ct);
            _logger.LogWarning("Không thể xóa phòng {RoomName} trên LiveKit. Status: {StatusCode}, Body: {Body}", 
                roomName, response.StatusCode, errBody);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi kết nối khi gọi DeleteRoom trên LiveKit cho phòng {RoomName}.", roomName);
            return false;
        }
    }

    public bool VerifyWebhookSignature(string? authHeader, byte[] rawBody)
    {
        if (string.IsNullOrWhiteSpace(authHeader) || string.IsNullOrEmpty(_apiSecret))
            return false;

        var tokenString = authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
            ? authHeader.Substring(7).Trim()
            : authHeader.Trim();

        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_apiSecret)),
                ValidateIssuer = !string.IsNullOrEmpty(_apiKey),
                ValidIssuer = _apiKey,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(2)
            };

            var principal = tokenHandler.ValidateToken(tokenString, validationParameters, out var validatedToken);
            if (validatedToken is not JwtSecurityToken jwtToken || 
                !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }

            // Lấy claim sha256 và đối chiếu với hash của raw payload
            var shaClaim = principal.FindFirst("sha256")?.Value;
            if (string.IsNullOrEmpty(shaClaim))
                return false;

            using var sha256 = SHA256.Create();
            var computedHashBytes = sha256.ComputeHash(rawBody);

            var computedBase64 = Convert.ToBase64String(computedHashBytes);
            var computedHex = Convert.ToHexString(computedHashBytes).ToLowerInvariant();

            return string.Equals(shaClaim, computedBase64, StringComparison.Ordinal) ||
                   string.Equals(shaClaim, computedHex, StringComparison.OrdinalIgnoreCase);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Xác minh Webhook Token thất bại.");
            return false;
        }
    }

    private string GenerateAdminToken(string roomName)
    {
        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_apiSecret));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var videoGrants = new Dictionary<string, object>
        {
            { "roomAdmin", true },
            { "room", roomName }
        };

        var now = DateTime.UtcNow;
        var header = new JwtHeader(credentials);
        var payload = new JwtPayload(
            issuer: _apiKey,
            audience: null,
            claims: new List<Claim>
            {
                new(JwtRegisteredClaimNames.Iss, _apiKey),
                new(JwtRegisteredClaimNames.Nbf, ((DateTimeOffset)now.AddSeconds(-5)).ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64),
            },
            notBefore: now.AddSeconds(-5),
            expires: now.AddMinutes(2));

        payload["video"] = videoGrants;

        var tokenHandler = new JwtSecurityTokenHandler();
        return tokenHandler.WriteToken(new JwtSecurityToken(header, payload));
    }
}
