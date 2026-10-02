using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;
using LegacyVault.Prototype.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace LegacyVault.Prototype.Tests.WhiteBox;

public class VideoSessionWhiteBoxTests
{
    private const string TestApiKey = "APIPMUrBMhb6sGH";
    private const string TestApiSecret = "1dYGslKOXVg3rgGM4sUyCygzM2CsGH7bfOnoQzfgCPQ";
    private const string TestUrl = "wss://legacyvaultprototype-t2bk4rvi.livekit.cloud";

    private IConfiguration CreateTestConfiguration()
    {
        var configValues = new Dictionary<string, string?>
        {
            { "LIVEKIT_URL", TestUrl },
            { "LIVEKIT_API_KEY", TestApiKey },
            { "LIVEKIT_API_SECRET", TestApiSecret }
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(configValues)
            .Build();
    }

    [Fact]
    public void GenerateJoinToken_ShouldProduceValidLiveKitJwtWithVideoGrants()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var roomName = "session_test_room_123";
        var participantId = Guid.NewGuid().ToString();
        var participantName = "Nguyen Van A";
        var ttl = TimeSpan.FromMinutes(5);

        // Act
        var token = liveKitService.GenerateJoinToken(roomName, participantId, participantName, ttl);

        // Assert
        Assert.NotNull(token);
        Assert.NotEmpty(token);

        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.Equal(TestApiKey, jwt.Issuer);
        Assert.Equal(participantId, jwt.Subject);
        Assert.Equal(SecurityAlgorithms.HmacSha256, jwt.Header.Alg);

        // Verify video grant
        Assert.True(jwt.Payload.ContainsKey("video"));
        var videoObj = jwt.Payload["video"];
        Assert.NotNull(videoObj);
    }

    [Fact]
    public void VerifyWebhookSignature_WithValidSignature_ShouldReturnTrue()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var rawPayload = "{\"event\":\"participant_joined\",\"room\":{\"name\":\"test_room\"}}";
        var rawBytes = Encoding.UTF8.GetBytes(rawPayload);

        // Compute sha256 hash of payload
        using var sha256 = SHA256.Create();
        var hashBytes = sha256.ComputeHash(rawBytes);
        var hashHex = Convert.ToHexString(hashBytes).ToLowerInvariant();

        // Sign token with LiveKit secret
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestApiSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var header = new JwtHeader(creds);
        var payload = new JwtPayload
        {
            { "iss", TestApiKey },
            { "sha256", hashHex },
            { "exp", DateTimeOffset.UtcNow.AddMinutes(5).ToUnixTimeSeconds() }
        };
        var tokenHandler = new JwtSecurityTokenHandler();
        var authHeader = "Bearer " + tokenHandler.WriteToken(new JwtSecurityToken(header, payload));

        // Act
        var isValid = liveKitService.VerifyWebhookSignature(authHeader, rawBytes);

        // Assert
        Assert.True(isValid);
    }

    [Fact]
    public async Task GetJoinToken_ShouldRejectUnauthorizedUser()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var verifierId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var hackerId = Guid.NewGuid();

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = Guid.NewGuid(),
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = subjectId,
            AssignedVerifierId = verifierId
        }, subjectId);

        // Act & Assert: hacker không phải verifier cũng không phải subject -> UnauthorizedAccessException
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            videoSessionService.GetJoinTokenAsync(sessionResp.SessionId, hackerId));
    }

    [Fact]
    public async Task TriggerRescueHold_ShouldBeIdempotentAndReturnExistingHold()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();

        // Act 1: Kích hoạt lần đầu
        var holdResult1 = await videoSessionService.TriggerRescueHoldAsync(caseId, ownerId, "Lần đầu tôi còn sống");
        Assert.Equal("HELD_SUCCESSFULLY", holdResult1.Status);
        Assert.NotEqual(Guid.Empty, holdResult1.HoldId);

        // Act 2: Kích hoạt lần thứ 2 với cùng CaseId -> Idempotent
        var holdResult2 = await videoSessionService.TriggerRescueHoldAsync(caseId, ownerId, "Lần thứ hai");
        Assert.Equal("ALREADY_HELD", holdResult2.Status);
        Assert.Equal(holdResult1.HoldId, holdResult2.HoldId); // Cùng HoldId, không tạo trùng
    }
}
