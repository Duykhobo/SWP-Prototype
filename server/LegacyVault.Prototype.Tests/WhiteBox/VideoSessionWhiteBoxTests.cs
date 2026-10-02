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

    [Fact]
    public async Task Handover_BeforeVerifierApproval_ShouldBlockAcceptance()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var verifierId = Guid.NewGuid();

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = subjectId,
            AssignedVerifierId = verifierId
        }, subjectId);

        // Act 1: Kiểm tra eligibility khi Người thực thi / Verifier chưa đánh giá
        var eligibility = await videoSessionService.GetHandoverEligibilityAsync(sessionResp.SessionId, subjectId);
        Assert.False(eligibility.CanAccept);
        Assert.Contains(eligibility.BlockReasons, r => r.Contains("chưa xác nhận"));

        // Act 2: Cố tình bấm Accept Handover -> Phải bị từ chối
        var acceptResp = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, subjectId, new AcceptHandoverRequest
        {
            LegalAcknowledgment = true,
            SecondFactorProof = "valid-passkey-proof"
        });

        Assert.False(acceptResp.Success);
        Assert.Contains("chưa", acceptResp.Message);
    }

    [Fact]
    public async Task Handover_WhenVerifierMarksInconclusive_ShouldBlockKeyIssuance()
    {
        // Arrange: Mô phỏng kịch bản Verifier nghi ngờ deepfake / bất thường khuôn mặt
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var verifierId = Guid.NewGuid();

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = subjectId,
            AssignedVerifierId = verifierId
        }, subjectId);

        // Verifier phát hiện dấu hiệu bất thường -> Đánh dấu INCONCLUSIVE
        await videoSessionService.SubmitVerdictAsync(sessionResp.SessionId, new SubmitVerdictRequest
        {
            Outcome = VerificationOutcome.INCONCLUSIVE,
            VerifierNotes = "Nghi ngờ hình ảnh có dấu hiệu deepfake/jittering, yêu cầu đối chiếu trực tiếp tại quầy."
        }, verifierId);

        // Act: Người nhận cố bấm nhận di sản
        var acceptResp = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, subjectId, new AcceptHandoverRequest
        {
            LegalAcknowledgment = true,
            SecondFactorProof = "passkey-proof"
        });

        Assert.False(acceptResp.Success);
        Assert.Contains("INCONCLUSIVE", acceptResp.Message);
    }

    [Fact]
    public async Task Handover_WhenAllConditionsMet_ShouldIssueCommitmentAndGrant()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var verifierId = Guid.NewGuid();

        // Khởi tạo TimeLock và giải phóng thời gian trễ
        timeLockService.InitializeCaseTimeLock(caseId, isDemoMode: true);
        // Chuyển sang đã duyệt
        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = subjectId,
            AssignedVerifierId = verifierId
        }, subjectId);

        // Verifier xác nhận PASS
        await videoSessionService.SubmitVerdictAsync(sessionResp.SessionId, new SubmitVerdictRequest
        {
            Outcome = VerificationOutcome.PASS,
            VerifierNotes = "Xác minh nhân thân đạt tiêu chuẩn."
        }, verifierId);

        // Act: Bấm chấp nhận nhận di sản kèm xác thực yếu tố thứ 2
        var acceptResp = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, subjectId, new AcceptHandoverRequest
        {
            LegalAcknowledgment = true,
            SecondFactorType = "PASSKEY_FIDO2",
            SecondFactorProof = "webauthn-signature-verified"
        });

        // Assert
        Assert.True(acceptResp.Success);
        Assert.NotNull(acceptResp.CommitmentId);
        Assert.NotNull(acceptResp.GrantId);
        Assert.Equal(AccessGrantStatus.ACTIVE, acceptResp.GrantStatus);
        Assert.NotEmpty(acceptResp.Assets);
        Assert.NotNull(acceptResp.DecryptionKeyMaterial);

        // Act 2: Bấm lại (Idempotency) -> Trả về kết quả hiện tại mà không lỗi
        var reAcceptResp = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, subjectId, new AcceptHandoverRequest
        {
            LegalAcknowledgment = true,
            SecondFactorProof = "webauthn-signature-verified"
        });
        Assert.True(reAcceptResp.Success);
        Assert.Equal(acceptResp.GrantId, reAcceptResp.GrantId);
    }

    [Fact]
    public async Task Handover_RaceCondition_RescueHoldCommitsFirst_ShouldRejectGrant()
    {
        // Kịch bản A: Owner kích hoạt Rescue Hold trước khi Beneficiary bấm nhận
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var verifierId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = subjectId,
            AssignedVerifierId = verifierId
        }, subjectId);

        await videoSessionService.SubmitVerdictAsync(sessionResp.SessionId, new SubmitVerdictRequest
        {
            Outcome = VerificationOutcome.PASS
        }, verifierId);

        // Owner kích hoạt Rescue Hold commit trước
        await videoSessionService.TriggerRescueHoldAsync(caseId, ownerId, "Tôi còn sống!");

        // Beneficiary bấm nhận sau
        var acceptResp = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, subjectId, new AcceptHandoverRequest
        {
            LegalAcknowledgment = true,
            SecondFactorProof = "fido2-proof"
        });

        // Phải bị từ chối
        Assert.False(acceptResp.Success);
        Assert.Contains("Rescue Hold", acceptResp.Message);
    }

    [Fact]
    public async Task Handover_RaceCondition_GrantIssuedThenRescueHold_ShouldSuspendGrantAndBlockKey()
    {
        // Kịch bản B: Grant đã được cấp, sau đó Owner kích hoạt Rescue Hold -> Grant bị đình chỉ, chặn lấy chìa khóa
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var verifierId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = subjectId,
            AssignedVerifierId = verifierId
        }, subjectId);

        await videoSessionService.SubmitVerdictAsync(sessionResp.SessionId, new SubmitVerdictRequest
        {
            Outcome = VerificationOutcome.PASS
        }, verifierId);

        // Grant cấp thành công
        var acceptResp = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, subjectId, new AcceptHandoverRequest
        {
            LegalAcknowledgment = true,
            SecondFactorProof = "fido2-proof"
        });
        Assert.True(acceptResp.Success);

        // Ngay sau đó Owner kích hoạt Rescue Hold
        await videoSessionService.TriggerRescueHoldAsync(caseId, ownerId, "Khẩn cấp: Tôi còn sống");

        // Khi người nhận gọi API lấy vật liệu giải mã qua kênh riêng -> Phải bị chặn 403 Forbidden!
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            videoSessionService.GetDecryptionKeyMaterialAsync(sessionResp.SessionId, subjectId));
    }

    [Fact]
    public async Task Executor_AuthorizeRecipient_ShouldEnableHandoverAndAllowAcceptance()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var executorId = Guid.NewGuid();

        timeLockService.InitializeCaseTimeLock(caseId, isDemoMode: true);

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = subjectId,
            AssignedVerifierId = executorId
        }, subjectId);

        // Executor bấm "Xác nhận người nhận & cho phép nhận di sản" (Bước 4)
        var authResp = await videoSessionService.AuthorizeRecipientByExecutorAsync(sessionResp.SessionId, executorId, new AuthorizeRecipientRequest
        {
            FaceMatched = true,
            NationalIdMatched = true,
            InteractiveChallengePassed = true,
            ExecutorNotes = "Đã đối chiếu khuôn mặt, CCCD gốc và mã cử chỉ khớp hoàn toàn."
        });

        Assert.True(authResp.Success);

        // Eligibility chuyển sang CanAccept = true
        var eligibility = await videoSessionService.GetHandoverEligibilityAsync(sessionResp.SessionId, subjectId);
        Assert.True(eligibility.CanAccept);
        Assert.True(eligibility.IsExecutorAuthorized);

        // Beneficiary bấm chấp nhận di sản (Bước 5)
        var acceptResp = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, subjectId, new AcceptHandoverRequest
        {
            LegalAcknowledgment = true,
            SecondFactorProof = "passkey-proof-verified"
        });

        Assert.True(acceptResp.Success);
        Assert.NotNull(acceptResp.GrantId);
    }

    [Fact]
    public async Task FinalizeHandover_WithoutMandatoryAssets_ShouldThrow_AndWithAllAssets_ShouldIssueReceipt()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var executorId = Guid.NewGuid();

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = subjectId,
            AssignedVerifierId = executorId
        }, subjectId);

        // Tạo Guest Session
        var guestSession = await videoSessionService.GetOrCreateGuestSessionAsync(caseId, subjectId, executorId, sessionResp.SessionId);
        Assert.NotNull(guestSession.GuestToken);

        // Executor cho phép nhận
        await videoSessionService.AuthorizeRecipientByExecutorAsync(sessionResp.SessionId, executorId, new AuthorizeRecipientRequest());

        // Kịch bản A: Người nhận chưa tải đủ 3 file bắt buộc mà cố bấm kết thúc -> Phải ném lỗi!
        var partialAssetIds = new List<Guid> { Guid.Parse("11111111-1111-1111-1111-111111111111") }; // Chỉ mới tải 1 file
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, subjectId, new FinalizeHandoverRequest
            {
                DownloadedAssetIds = partialAssetIds,
                GuestToken = guestSession.GuestToken
            }));

        // Kịch bản B: Người nhận đã tải đủ cả 3 file bắt buộc -> Phát hành Receipt và thu hồi Guest Token
        var allAssetIds = new List<Guid>
        {
            Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Guid.Parse("33333333-3333-3333-3333-333333333333")
        };

        var finalizeResp = await videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, subjectId, new FinalizeHandoverRequest
        {
            DownloadedAssetIds = allAssetIds,
            GuestToken = guestSession.GuestToken,
            LegalDeclaration = "Tôi xác nhận đã nhận đầy đủ và muốn kết thúc phiên."
        });

        Assert.True(finalizeResp.Success);
        Assert.NotNull(finalizeResp.Receipt);
        Assert.StartsWith("RCP-LV-", finalizeResp.Receipt.ReceiptNumber);
        Assert.Equal(3, finalizeResp.Receipt.DownloadedAssetsCount);

        // Xác thực Guest Session đã bị thu hồi
        var validatedGuest = await videoSessionService.ValidateGuestSessionAsync(guestSession.GuestToken);
        Assert.Null(validatedGuest); // Đã COMPLETED -> null
    }

    [Fact]
    public async Task GetJoinToken_MultiParty_AllowsExecutor_CoBeneficiary_Notary_AndAssignsUniqueIdentities()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var executorId = Guid.NewGuid();
        var primaryBeneficiaryId = Guid.NewGuid();
        var coBeneficiaryId = Guid.NewGuid();
        var notaryId = Guid.NewGuid();

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = primaryBeneficiaryId,
            AssignedVerifierId = executorId
        }, executorId);

        // Act 1: Executor tham gia
        var execToken = await videoSessionService.GetJoinTokenAsync(
            sessionResp.SessionId, executorId, "Người thực thi Trần Văn A", null, "EXECUTOR");

        // Act 2: Người thụ hưởng chính tham gia
        var benToken = await videoSessionService.GetJoinTokenAsync(
            sessionResp.SessionId, primaryBeneficiaryId, "Người thụ hưởng Nguyễn Văn B", null, "BENEFICIARY_GUEST");

        // Act 3: Đồng thừa kế thứ 2 tham gia
        var coBenToken = await videoSessionService.GetJoinTokenAsync(
            sessionResp.SessionId, coBeneficiaryId, "Đồng thừa kế Lê Thị C", null, "CO_BENEFICIARY");

        // Act 4: Luật sư / Công chứng viên giám sát tham gia
        var notaryToken = await videoSessionService.GetJoinTokenAsync(
            sessionResp.SessionId, notaryId, "Công chứng viên Hoàng Văn D", null, "NOTARY_OBSERVER");

        // Assert: Cả 4 bên đều được cấp token thành công và có ParticipantIdentity duy nhất
        Assert.NotNull(execToken.Token);
        Assert.NotNull(benToken.Token);
        Assert.NotNull(coBenToken.Token);
        Assert.NotNull(notaryToken.Token);

        Assert.Equal("Người thực thi Trần Văn A", execToken.ParticipantName);
        Assert.Equal("Người thụ hưởng Nguyễn Văn B", benToken.ParticipantName);
        Assert.Equal("Đồng thừa kế Lê Thị C", coBenToken.ParticipantName);
        Assert.Equal("Công chứng viên Hoàng Văn D", notaryToken.ParticipantName);

        // Đảm bảo không ai bị trùng identity (tránh bị LiveKit disconnect khi vào chung phòng)
        var identities = new HashSet<string>
        {
            execToken.ParticipantIdentity,
            benToken.ParticipantIdentity,
            coBenToken.ParticipantIdentity,
            notaryToken.ParticipantIdentity
        };
        Assert.Equal(4, identities.Count);
    }
}
