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
        timeLockService.ApproveCaseForDelivery(caseId); // TimeLock kiểm tra và phê duyệt độc lập với thẩm định video

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

        timeLockService.ApproveCaseForDelivery(caseId); // TimeLock phê duyệt độc lập

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
        timeLockService.ApproveCaseForDelivery(caseId); // Time-Lock hoàn tất hợp lệ

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

        await videoSessionService.ConfigureVaultAsync(caseId, RecipientMode.SINGLE_RECIPIENT, new[] { subjectId }, executorId);

        // Tạo Guest Session
        var guestSession = await videoSessionService.GetOrCreateGuestSessionAsync(caseId, subjectId, executorId, sessionResp.SessionId);
        Assert.NotNull(guestSession.GuestToken);

        // Executor cho phép nhận
        await videoSessionService.AuthorizeRecipientByExecutorAsync(sessionResp.SessionId, executorId, new AuthorizeRecipientRequest());

        timeLockService.ApproveCaseForDelivery(caseId);

        // Người nhận chấp nhận di sản để được cấp Grant ACTIVE
        var acceptResp = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, subjectId, new AcceptHandoverRequest
        {
            LegalAcknowledgment = true,
            SecondFactorProof = "passkey-valid-signature"
        });
        Assert.True(acceptResp.Success);
        Assert.NotNull(acceptResp.DownloadToken);

        // Kịch bản A: Người nhận chưa tải file qua server (hoặc chưa đủ file) mà cố bấm kết thúc -> Phải ném lỗi!
        var partialAssetIds = new List<Guid> { Guid.Parse("11111111-1111-1111-1111-111111111111") }; // Chỉ mới tải 1 file
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, subjectId, new FinalizeHandoverRequest
            {
                DownloadedAssetIds = partialAssetIds,
                GuestToken = guestSession.GuestToken
            }));

        // Kịch bản B: Người nhận đã thực sự tải đủ cả 3 file qua máy chủ
        var allAssetIds = new List<Guid>
        {
            Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Guid.Parse("33333333-3333-3333-3333-333333333333")
        };

        foreach (var assetId in allAssetIds)
        {
            var downloaded = await videoSessionService.RecordAssetDownloadAsync(acceptResp.DownloadToken, assetId);
            Assert.True(downloaded);
        }

        var finalizeResp = await videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, subjectId, new FinalizeHandoverRequest
        {
            DownloadedAssetIds = allAssetIds,
            GuestToken = guestSession.GuestToken,
            LegalDeclaration = "Tôi xác nhận đã nhận đầy đủ và muốn kết thúc phiên.",
            RecipientSignatureData = "data:image/svg+xml;utf8,<svg>test-signature</svg>"
        });

        Assert.True(finalizeResp.Success);
        Assert.NotNull(finalizeResp.Receipt);
        Assert.StartsWith("RCP-LV-", finalizeResp.Receipt.ReceiptNumber);
        Assert.Equal(3, finalizeResp.Receipt.DownloadedAssetsCount);
        Assert.NotEmpty(finalizeResp.Receipt.ReceiptContentHash);
        Assert.StartsWith("SHA256:", finalizeResp.Receipt.ReceiptAuditDigest);

        // Xác thực Guest Session đã bị thu hồi
        var validatedGuest = await videoSessionService.ValidateGuestSessionAsync(guestSession.GuestToken);
        Assert.Null(validatedGuest); // Đã COMPLETED -> null
    }

    [Fact]
    public async Task GetJoinToken_UsesAssignmentAndDesignation_AndRejectsUnassignedObserver()
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

        await videoSessionService.ConfigureVaultAsync(caseId, RecipientMode.CO_OWNED,
            new[] { primaryBeneficiaryId, coBeneficiaryId }, executorId);
        var host = await videoSessionService.GetJoinTokenAsync(sessionResp.SessionId, executorId, "Host", null, "EXECUTOR");
        var primary = await videoSessionService.GetJoinTokenAsync(sessionResp.SessionId, primaryBeneficiaryId, "Primary", null, "BENEFICIARY_GUEST");
        var co = await videoSessionService.GetJoinTokenAsync(sessionResp.SessionId, coBeneficiaryId, "Co", null, "CO_BENEFICIARY");
        Assert.Equal(3, new[] { host.ParticipantIdentity, primary.ParticipantIdentity, co.ParticipantIdentity }.Distinct().Count());
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => videoSessionService.GetJoinTokenAsync(sessionResp.SessionId, notaryId, "Observer", null, "NOTARY_OBSERVER"));
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => videoSessionService.GetJoinTokenAsync(sessionResp.SessionId, notaryId, "Forged host", null, "EXECUTOR"));

    }

    #region SRS v3.11.0: KIỂM THỬ ĐỒNG SỞ HỮU (CO-OWNERSHIP CONSENSUS CEREMONY)

    [Fact]
    public async Task CoOwnership_Situation1_B_Accepts_C_Pending_ShouldRecordB_AndNotIssueGrantsYet()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var executorId = Guid.NewGuid();
        var benB = Guid.NewGuid();
        var benC = Guid.NewGuid();

        // Khởi tạo và mở khóa Time-Lock hợp lệ
        timeLockService.InitializeCaseTimeLock(caseId, isDemoMode: true);
        timeLockService.ApproveCaseForDelivery(caseId);

        // Thiết lập Kho K đồng sở hữu cho B và C
        await videoSessionService.ConfigureVaultAsync(caseId, RecipientMode.CO_OWNED, new[] { benB, benC });

        // Executor xác nhận B
        await videoSessionService.AuthorizeRecipientByExecutorAsync(caseId, executorId, new AuthorizeRecipientRequest
        {
            RecipientId = benB,
            FaceMatched = true,
            NationalIdMatched = true
        });

        // Act: B xác minh xong và bấm Nhận (C chưa trả lời)
        var respB = await videoSessionService.AcceptHandoverAsync(caseId, benB, new AcceptHandoverRequest
        {
            RecipientId = benB,
            LegalAcknowledgment = true,
            SecondFactorProof = "fido2-hardware-proof-user-b-ok"
        });

        // Assert: Theo SRS, hệ thống lưu quyết định của B, CHƯA CẤP GRANT CHO AI
        Assert.True(respB.Success);
        Assert.False(respB.IsConsensusComplete);
        Assert.Null(respB.GrantId); // Chưa ai có Grant!
        Assert.Equal(HandoverStatus.PENDING_RESPONSE, respB.VaultHandoverStatus);

        // Kiểm tra Eligibility của B: Đã ghi nhận quyết định nhưng CHƯA ĐƯỢC TẢI
        var eligB = await videoSessionService.GetHandoverEligibilityAsync(caseId, benB);
        Assert.True(eligB.IsAlreadyAccepted);
        Assert.False(eligB.CanDownload); // Chưa tải được!
        Assert.NotNull(eligB.CoOwnershipStatus);
        Assert.Equal(1, eligB.CoOwnershipStatus.AcceptedBeneficiariesCount);
        Assert.Equal(2, eligB.CoOwnershipStatus.TotalRequiredBeneficiaries);
        Assert.False(eligB.CoOwnershipStatus.IsAllConsented);

        // C cố lấy khóa giải mã khi chưa đủ đồng thuận -> Phải bị từ chối
        await Assert.ThrowsAsync<KeyNotFoundException>(() =>
            videoSessionService.GetDecryptionKeyMaterialAsync(caseId, benC));
    }

    [Fact]
    public async Task CoOwnership_Situation2_B_And_C_BothAccept_ShouldCommitOnce_AndIssueDistinctGrants()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var executorId = Guid.NewGuid();
        var benB = Guid.NewGuid();
        var benC = Guid.NewGuid();

        timeLockService.InitializeCaseTimeLock(caseId, isDemoMode: true);
        timeLockService.ApproveCaseForDelivery(caseId);

        await videoSessionService.ConfigureVaultAsync(caseId, RecipientMode.CO_OWNED, new[] { benB, benC });

        // Executor xác nhận B và C
        await videoSessionService.AuthorizeRecipientByExecutorAsync(caseId, executorId, new AuthorizeRecipientRequest { RecipientId = benB });
        await videoSessionService.AuthorizeRecipientByExecutorAsync(caseId, executorId, new AuthorizeRecipientRequest { RecipientId = benC });

        // B đồng ý nhận
        await videoSessionService.AcceptHandoverAsync(caseId, benB, new AcceptHandoverRequest
        {
            RecipientId = benB,
            SecondFactorProof = "fido2-hardware-proof-user-b-ok"
        });

        // Act: C đồng ý nhận -> Đạt 100% đồng thuận
        var respC = await videoSessionService.AcceptHandoverAsync(caseId, benC, new AcceptHandoverRequest
        {
            RecipientId = benC,
            SecondFactorProof = "fido2-hardware-proof-user-c-ok"
        });

        // Assert: Cam kết bàn giao 1 lần; cấp Grant riêng cho B và C cùng manifest
        Assert.True(respC.Success);
        Assert.True(respC.IsConsensusComplete);
        Assert.NotNull(respC.GrantId);
        Assert.NotNull(respC.DownloadToken);
        Assert.Equal(HandoverStatus.HANDOVER_COMMITTED, respC.VaultHandoverStatus);

        // B kiểm tra lại eligibility: Quyền tải đã bật
        var eligB = await videoSessionService.GetHandoverEligibilityAsync(caseId, benB);
        Assert.True(eligB.CanDownload);
        Assert.NotNull(eligB.ExistingGrantId);

        var eligC = await videoSessionService.GetHandoverEligibilityAsync(caseId, benC);
        Assert.True(eligC.CanDownload);
        Assert.NotNull(eligC.ExistingGrantId);

        // Hai Grant của B và C phải có ID và DownloadToken riêng biệt
        Assert.NotEqual(eligB.ExistingGrantId, eligC.ExistingGrantId);

        // Cả B và C đều có thể lấy vật liệu giải mã an toàn
        var keyB = await videoSessionService.GetDecryptionKeyMaterialAsync(caseId, benB);
        var keyC = await videoSessionService.GetDecryptionKeyMaterialAsync(caseId, benC);
        Assert.NotNull(keyB.WrappedKeyEnvelope);
        Assert.NotNull(keyC.WrappedKeyEnvelope);
    }

    [Fact]
    public async Task CoOwnership_Situation3_OneRejects_ShouldFreezeVault_ForTwoYearsReconsideration()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var executorId = Guid.NewGuid();
        var benB = Guid.NewGuid();
        var benC = Guid.NewGuid();

        timeLockService.InitializeCaseTimeLock(caseId, isDemoMode: true);
        timeLockService.ApproveCaseForDelivery(caseId);

        await videoSessionService.ConfigureVaultAsync(caseId, RecipientMode.CO_OWNED, new[] { benB, benC });

        await videoSessionService.AuthorizeRecipientByExecutorAsync(caseId, executorId, new AuthorizeRecipientRequest { RecipientId = benB });
        await videoSessionService.AuthorizeRecipientByExecutorAsync(caseId, executorId, new AuthorizeRecipientRequest { RecipientId = benC });

        // B đồng ý nhận
        await videoSessionService.AcceptHandoverAsync(caseId, benB, new AcceptHandoverRequest { RecipientId = benB, SecondFactorProof = "passkey-b-ok" });

        // Act: C từ chối nhận (Reject)
        var respRejectC = await videoSessionService.AcceptHandoverAsync(caseId, benC, new AcceptHandoverRequest
        {
            RecipientId = benC,
            IsReject = true,
            RejectionReason = "Tranh chấp tài sản chung, chưa thống nhất chia",
            SecondFactorProof = "passkey-c-ok"
        });

        // Assert: Kho chuyển sang FROZEN_RECONSIDERATION ngay lập tức (AC-10)
        Assert.True(respRejectC.Success);
        Assert.False(respRejectC.IsConsensusComplete);
        Assert.Equal(HandoverStatus.FROZEN_RECONSIDERATION, respRejectC.VaultHandoverStatus);

        var eligB = await videoSessionService.GetHandoverEligibilityAsync(caseId, benB);
        Assert.False(eligB.CanDownload);
        Assert.NotNull(eligB.CoOwnershipStatus);
        Assert.True(eligB.CoOwnershipStatus.IsFrozen);
        Assert.NotNull(eligB.CoOwnershipStatus.ReconsiderationExpiresAt);
    }

    [Fact]
    public async Task CoOwnership_Situation4_Reconsideration_ConsensusReached_ShouldUnfreezeAndDeliver()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var executorId = Guid.NewGuid();
        var benB = Guid.NewGuid();
        var benC = Guid.NewGuid();

        timeLockService.InitializeCaseTimeLock(caseId, isDemoMode: true);
        timeLockService.ApproveCaseForDelivery(caseId);

        await videoSessionService.ConfigureVaultAsync(caseId, RecipientMode.CO_OWNED, new[] { benB, benC });

        await videoSessionService.AuthorizeRecipientByExecutorAsync(caseId, executorId, new AuthorizeRecipientRequest { RecipientId = benB });
        await videoSessionService.AuthorizeRecipientByExecutorAsync(caseId, executorId, new AuthorizeRecipientRequest { RecipientId = benC });

        // B đồng ý, C từ chối -> Đóng băng
        await videoSessionService.AcceptHandoverAsync(caseId, benB, new AcceptHandoverRequest { RecipientId = benB, SecondFactorProof = "passkey-b" });
        await videoSessionService.AcceptHandoverAsync(caseId, benC, new AcceptHandoverRequest { RecipientId = benC, IsReject = true, SecondFactorProof = "passkey-c" });

        // Act: Trong thời hạn suy nghĩ lại 2 năm, C đổi ý và bấm Chấp nhận nhận kho chung!
        var respReconsider = await videoSessionService.AcceptHandoverAsync(caseId, benC, new AcceptHandoverRequest
        {
            RecipientId = benC,
            IsReject = false,
            LegalAcknowledgment = true,
            SecondFactorProof = "passkey-c-reconsidered-ok"
        });

        // Assert: Toàn bộ nhóm được bàn giao, kho giải tỏa đóng băng
        Assert.True(respReconsider.Success);
        Assert.True(respReconsider.IsConsensusComplete);
        Assert.Equal(HandoverStatus.HANDOVER_COMMITTED, respReconsider.VaultHandoverStatus);
        Assert.NotNull(respReconsider.GrantId);

        var eligC = await videoSessionService.GetHandoverEligibilityAsync(caseId, benC);
        Assert.True(eligC.CanDownload);
        Assert.False(eligC.CoOwnershipStatus?.IsFrozen ?? true);
    }

    [Fact]
    public async Task CoOwnership_FinalizeB_DoesNotClose_SessionOrRightsOfC()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var executorId = Guid.NewGuid();
        var benB = Guid.NewGuid();
        var benC = Guid.NewGuid();

        timeLockService.InitializeCaseTimeLock(caseId, isDemoMode: true);
        timeLockService.ApproveCaseForDelivery(caseId);

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = benB,
            AssignedVerifierId = executorId
        }, benB);

        await videoSessionService.ConfigureVaultAsync(caseId, RecipientMode.CO_OWNED, new[] { benB, benC });

        await videoSessionService.AuthorizeRecipientByExecutorAsync(sessionResp.SessionId, executorId, new AuthorizeRecipientRequest { RecipientId = benB });
        await videoSessionService.AuthorizeRecipientByExecutorAsync(sessionResp.SessionId, executorId, new AuthorizeRecipientRequest { RecipientId = benC });

        var guestB = await videoSessionService.GetOrCreateGuestSessionAsync(caseId, benB, executorId, sessionResp.SessionId);
        var guestC = await videoSessionService.GetOrCreateGuestSessionAsync(caseId, benC, executorId, sessionResp.SessionId);

        // B và C cùng đồng ý nhận
        var acceptB_initial = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, benB, new AcceptHandoverRequest { RecipientId = benB, SecondFactorProof = "pk-b" });
        Assert.False(acceptB_initial.IsConsensusComplete); // B đồng ý nhưng chưa đủ đồng thuận

        var acceptC = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, benC, new AcceptHandoverRequest { RecipientId = benC, SecondFactorProof = "pk-c" });
        Assert.True(acceptC.IsConsensusComplete); // C đồng ý -> Đủ 100% đồng thuận, cấp Grant cho cả nhóm

        // B lấy Grant cá nhân sau khi đạt đồng thuận
        var acceptB = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, benB, new AcceptHandoverRequest { RecipientId = benB, SecondFactorProof = "pk-b" });
        Assert.NotNull(acceptB.DownloadToken);

        var allAssetIds = new List<Guid>
        {
            Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Guid.Parse("33333333-3333-3333-3333-333333333333")
        };

        // B tải xong các file qua server
        foreach (var assetId in allAssetIds)
        {
            var ok = await videoSessionService.RecordAssetDownloadAsync(acceptB.DownloadToken!, assetId);
            Assert.True(ok);
        }

        // Act 1: B tải xong và hoàn tất phiên của B
        var finalizeB = await videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, benB, new FinalizeHandoverRequest
        {
            RecipientId = benB,
            GuestToken = guestB.GuestToken,
            DownloadedAssetIds = allAssetIds,
            RecipientSignatureData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        });

        // Assert 1: B hoàn tất, nhưng phòng CHƯA ĐÓNG vì C vẫn còn đang active
        Assert.True(finalizeB.Success);
        Assert.False(finalizeB.IsRoomClosed); // Phòng vẫn mở cho C!
        Assert.True(finalizeB.AreOtherBeneficiariesStillActive);

        // Quyền của C vẫn còn hiệu lực đầy đủ
        var eligC = await videoSessionService.GetHandoverEligibilityAsync(sessionResp.SessionId, benC);
        Assert.True(eligC.CanDownload);
        Assert.False(eligC.IsFinalized);

        // C tải xong các file qua server
        foreach (var assetId in allAssetIds)
        {
            await videoSessionService.RecordAssetDownloadAsync(acceptC.DownloadToken!, assetId);
        }

        // Act 2: C tải xong và hoàn tất phiên của C
        var finalizeC = await videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, benC, new FinalizeHandoverRequest
        {
            RecipientId = benC,
            GuestToken = guestC.GuestToken,
            DownloadedAssetIds = allAssetIds,
            RecipientSignatureData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        });

        // Assert 2: C hoàn tất -> Không còn ai active -> Yêu cầu đóng phòng được gửi tới LiveKit
        Assert.True(finalizeC.Success);
        Assert.False(finalizeC.AreOtherBeneficiariesStillActive);
        Assert.Contains(finalizeC.RoomStatus, new[] { "CLOSED", "CLOSING", "FAILED_TO_CLOSE" });
    }
    #endregion

    #region SRS Security & Electronic Signature Tests
    [Fact]
    public async Task DownloadAsset_WithoutToken_OrInvalidToken_ShouldReturn401()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var bundleId = Guid.NewGuid();
        var assetId = Guid.Parse("11111111-1111-1111-1111-111111111111");

        // Act 1: Không có token
        var resNoToken = await videoSessionService.VerifyAndServeEncryptedAssetAsync(bundleId, assetId, null);
        Assert.False(resNoToken.Success);
        Assert.Equal(401, resNoToken.StatusCode);

        // Act 2: Token giả mạo không tồn tại
        var resFakeToken = await videoSessionService.VerifyAndServeEncryptedAssetAsync(bundleId, assetId, "fake-download-token-1234");
        Assert.False(resFakeToken.Success);
        Assert.Equal(401, resFakeToken.StatusCode);
    }

    [Fact]
    public async Task DownloadAsset_WhenRescueHoldActive_ShouldReturn423Locked()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var executorId = Guid.NewGuid();

        timeLockService.InitializeCaseTimeLock(caseId, isDemoMode: true);
        timeLockService.ApproveCaseForDelivery(caseId);

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = subjectId,
            AssignedVerifierId = executorId
        }, subjectId);

        await videoSessionService.AuthorizeRecipientByExecutorAsync(sessionResp.SessionId, executorId, new AuthorizeRecipientRequest());

        var acceptResp = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, subjectId, new AcceptHandoverRequest
        {
            LegalAcknowledgment = true,
            SecondFactorProof = "passkey-ok"
        });
        Assert.True(acceptResp.Success);
        Assert.NotNull(acceptResp.DownloadToken);

        // Chủ kho kích hoạt Rescue Hold
        await videoSessionService.TriggerRescueHoldAsync(caseId, ownerId, "Khẩn cấp: Tạm giữ");

        // Act: Người nhận cố tải file bằng downloadToken hợp lệ -> Phải bị chặn 423 Locked!
        var assetId = Guid.Parse("11111111-1111-1111-1111-111111111111");
        var downloadResult = await videoSessionService.VerifyAndServeEncryptedAssetAsync(caseId, assetId, acceptResp.DownloadToken);

        Assert.False(downloadResult.Success);
        Assert.Equal(423, downloadResult.StatusCode);
        Assert.Contains("Rescue Hold", downloadResult.ErrorMessage);
    }

    [Fact]
    public async Task SubmitVerdict_Pass_DoesNotAlterCaseTimeLockCountdown()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var subjectId = Guid.NewGuid();
        var verifierId = Guid.NewGuid();

        // Khởi tạo TimeLock 48 giờ (không phải demo)
        var initialTimeLock = timeLockService.InitializeCaseTimeLock(caseId, isDemoMode: false);
        Assert.True(initialTimeLock.IsLocked);
        Assert.True(initialTimeLock.RemainingSeconds > 3600);

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = subjectId,
            AssignedVerifierId = verifierId
        }, subjectId);

        // Act: Verifier xác minh video đạt tiêu chuẩn (PASS)
        await videoSessionService.SubmitVerdictAsync(sessionResp.SessionId, new SubmitVerdictRequest
        {
            Outcome = VerificationOutcome.PASS,
            VerifierNotes = "Khuôn mặt và CCCD khớp 100%."
        }, verifierId);

        // Assert: TimeLock KHÔNG bị đặt về 0 hoặc mở khóa ngay lập tức!
        var postVerdictTimeLock = timeLockService.GetStatus(caseId);
        Assert.True(postVerdictTimeLock.IsLocked);
        Assert.True(postVerdictTimeLock.RemainingSeconds > 3600);
    }

    [Fact]
    public async Task FinalizeHandover_RequiresValidServerDownloads_AndGeneratesTrueSha256ReceiptDigest()
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
        timeLockService.ApproveCaseForDelivery(caseId);

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            Purpose = VideoSessionPurpose.HANDOVER_VERIFICATION,
            SubjectUserId = subjectId,
            AssignedVerifierId = executorId
        }, subjectId);

        await videoSessionService.AuthorizeRecipientByExecutorAsync(sessionResp.SessionId, executorId, new AuthorizeRecipientRequest());

        var acceptResp = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, subjectId, new AcceptHandoverRequest
        {
            LegalAcknowledgment = true,
            SecondFactorProof = "passkey-ok"
        });

        var allAssetIds = new List<Guid>
        {
            Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Guid.Parse("33333333-3333-3333-3333-333333333333")
        };

        // Khi người nhận chưa tải qua server mà bấm finalize -> Ném lỗi
        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, subjectId, new FinalizeHandoverRequest
            {
                DownloadedAssetIds = allAssetIds
            }));

        // Tải đủ file qua server
        foreach (var assetId in allAssetIds)
        {
            var res = await videoSessionService.VerifyAndServeEncryptedAssetAsync(caseId, assetId, acceptResp.DownloadToken);
            Assert.True(res.Success);
            Assert.NotNull(res.EncryptedData);
        }

        // Ký xác nhận biên nhận điện tử
        var signatureData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        var finalizeResp = await videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, subjectId, new FinalizeHandoverRequest
        {
            DownloadedAssetIds = allAssetIds,
            RecipientSignatureData = signatureData,
            LegalDeclaration = "Tôi cam đoan đã nhận và giải mã toàn bộ tệp di sản."
        });

        Assert.True(finalizeResp.Success);
        var receipt = finalizeResp.Receipt;
        Assert.NotNull(receipt);
        Assert.Equal(signatureData, receipt.RecipientSignatureData);
        Assert.Equal("ELECTRONIC_RECEIPT_SIGNATURE", receipt.SignatureType);
        Assert.NotEmpty(receipt.ReceiptContentHash);
        Assert.Equal(64, receipt.ReceiptContentHash.Length); // 64 hex chars = 256 bits
        Assert.Equal($"SHA256:{receipt.ReceiptContentHash}", receipt.ReceiptAuditDigest);
        Assert.NotEmpty(receipt.SignatureHash);
        Assert.Equal("1.1", receipt.ReceiptVersion);
    }

    [Fact]
    public async Task ExecutorAuthorization_WhenCallerNotAssignedExecutor_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var legitimateExecutorId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var impostorExecutorId = Guid.NewGuid(); // Kẻ giả danh

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            ScheduledAt = DateTime.UtcNow.AddHours(1),
            AssignedVerifierId = legitimateExecutorId
        }, Guid.NewGuid());

        // Act & Assert: Kẻ giả danh cố duyệt người nhận -> Phải bị chặn 403 / UnauthorizedAccessException
        var ex = await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            videoSessionService.AuthorizeRecipientByExecutorAsync(sessionResp.SessionId, impostorExecutorId, new AuthorizeRecipientRequest
            {
                FaceMatched = true,
                NationalIdMatched = true
            }));

        Assert.Contains(impostorExecutorId.ToString(), ex.Message);
    }

    [Fact]
    public async Task FinalizeHandover_SignatureValidation_RejectsMissingInvalidOrOversizedSignatures()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var executorId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var subjectId = Guid.NewGuid();

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            ScheduledAt = DateTime.UtcNow.AddHours(1),
            SubjectUserId = subjectId,
            AssignedVerifierId = executorId
        }, subjectId);

        timeLockService.InitializeCaseTimeLock(caseId, isDemoMode: true);
        timeLockService.ApproveCaseForDelivery(caseId);

        await videoSessionService.AuthorizeRecipientByExecutorAsync(sessionResp.SessionId, executorId, new AuthorizeRecipientRequest());
        var acceptResp = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, subjectId, new AcceptHandoverRequest
        {
            LegalAcknowledgment = true,
            SecondFactorProof = "fido2-signature-verified-123"
        });

        var allAssetIds = new List<Guid>
        {
            Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Guid.Parse("33333333-3333-3333-3333-333333333333")
        };
        foreach (var assetId in allAssetIds)
        {
            await videoSessionService.RecordAssetDownloadAsync(acceptResp.DownloadToken!, assetId);
        }

        // Test 1: Thiếu chữ ký (null hoặc whitespace) -> Phải ném lỗi
        var ex1 = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, subjectId, new FinalizeHandoverRequest
            {
                DownloadedAssetIds = allAssetIds,
                RecipientSignatureData = null
            }));
        Assert.Contains("bắt buộc phải có chữ ký", ex1.Message);

        // Test 2: Định dạng chữ ký không phải data:image/ -> Phải ném lỗi
        var ex2 = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, subjectId, new FinalizeHandoverRequest
            {
                DownloadedAssetIds = allAssetIds,
                RecipientSignatureData = "invalid-raw-text-signature"
            }));
        Assert.Contains("Định dạng ảnh chữ ký không hợp lệ", ex2.Message);

        // Test 3: Kích thước ảnh chữ ký vượt quá 512KB -> Phải ném lỗi
        var oversizedSig = "data:image/png;base64," + new string('A', 513 * 1024);
        var ex3 = await Assert.ThrowsAsync<InvalidOperationException>(() =>
            videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, subjectId, new FinalizeHandoverRequest
            {
                DownloadedAssetIds = allAssetIds,
                RecipientSignatureData = oversizedSig
            }));
        Assert.Contains("vượt quá giới hạn cho phép", ex3.Message);
    }

    [Fact]
    public async Task FinalizeHandover_IdempotencyRetry_WhenGrantIsAlreadyFinalized_ShouldReturnExistingReceipt()
    {
        // Arrange
        var config = CreateTestConfiguration();
        var liveKitService = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var timeLockService = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var videoSessionService = new VideoSessionService(liveKitService, timeLockService, config, NullLogger<VideoSessionService>.Instance);

        var caseId = Guid.NewGuid();
        var executorId = Guid.Parse("22222222-2222-2222-2222-222222222222");
        var subjectId = Guid.NewGuid();

        var sessionResp = await videoSessionService.RequestSessionAsync(new CreateVideoSessionRequest
        {
            CaseId = caseId,
            ScheduledAt = DateTime.UtcNow.AddHours(1),
            SubjectUserId = subjectId,
            AssignedVerifierId = executorId
        }, subjectId);

        timeLockService.InitializeCaseTimeLock(caseId, isDemoMode: true);
        timeLockService.ApproveCaseForDelivery(caseId);

        await videoSessionService.AuthorizeRecipientByExecutorAsync(sessionResp.SessionId, executorId, new AuthorizeRecipientRequest());
        var acceptResp = await videoSessionService.AcceptHandoverAsync(sessionResp.SessionId, subjectId, new AcceptHandoverRequest
        {
            LegalAcknowledgment = true,
            SecondFactorProof = "fido2-signature-verified-123"
        });

        var allAssetIds = new List<Guid>
        {
            Guid.Parse("11111111-1111-1111-1111-111111111111"),
            Guid.Parse("22222222-2222-2222-2222-222222222222"),
            Guid.Parse("33333333-3333-3333-3333-333333333333")
        };
        foreach (var assetId in allAssetIds)
        {
            await videoSessionService.RecordAssetDownloadAsync(acceptResp.DownloadToken!, assetId);
        }

        var signatureData = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
        var request = new FinalizeHandoverRequest
        {
            DownloadedAssetIds = allAssetIds,
            RecipientSignatureData = signatureData,
            LegalDeclaration = "Tôi cam đoan đã nhận và giải mã toàn bộ tệp di sản."
        };

        // Lần 1: Hoàn tất bàn giao lần đầu -> Grant chuyển sang FINALIZED
        var firstResp = await videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, subjectId, request);
        Assert.True(firstResp.Success);
        Assert.NotNull(firstResp.Receipt);
        var initialReceiptNumber = firstResp.Receipt.ReceiptNumber;

        // Lần 2 (RETRY): Gọi lại khi Grant đã FINALIZED -> Không bị từ chối mà trả về đúng biên nhận cũ!
        var retryResp = await videoSessionService.FinalizeHandoverSessionAsync(sessionResp.SessionId, subjectId, request);
        Assert.True(retryResp.Success);
        Assert.NotNull(retryResp.Receipt);
        Assert.Equal(initialReceiptNumber, retryResp.Receipt.ReceiptNumber);
        Assert.Contains("trước đó", retryResp.Message);
    }
    #endregion
    [Fact]
    public async Task GuestInvitation_RejectsOutsiderWithoutChangingDesignation_AndLocksAfterInvitation()
    {
        var config = CreateTestConfiguration();
        var live = new LiveKitVideoService(config, new HttpClient(), NullLogger<LiveKitVideoService>.Instance);
        var clock = new TimeLockRescueService(NullLogger<TimeLockRescueService>.Instance);
        var service = new VideoSessionService(live, clock, config, NullLogger<VideoSessionService>.Instance);
        var caseId = Guid.NewGuid(); var recipient = Guid.NewGuid(); var executor = Guid.NewGuid(); var outsider = Guid.NewGuid();
        var session = await service.RequestSessionAsync(new CreateVideoSessionRequest { CaseId = caseId, SubjectUserId = recipient, AssignedVerifierId = executor }, executor);
        await Assert.ThrowsAsync<KeyNotFoundException>(() => service.GetOrCreateGuestSessionAsync(caseId, recipient, executor, session.SessionId));
        var vault = await service.ConfigureVaultAsync(caseId, RecipientMode.SINGLE_RECIPIENT, new[] { recipient }, executor);
        await Assert.ThrowsAsync<RecipientNotInSnapshotException>(() => service.GetOrCreateGuestSessionAsync(caseId, outsider, executor, session.SessionId));
        Assert.Equal(new[] { recipient }, vault.DesignatedRecipientIds);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.GetOrCreateGuestSessionAsync(caseId, recipient, outsider, session.SessionId));
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.GetOrCreateGuestSessionAsync(caseId, recipient, executor, Guid.NewGuid()));
        var guest = await service.GetOrCreateGuestSessionAsync(caseId, recipient, executor, session.SessionId);
        Assert.Same(guest, await service.GetOrCreateGuestSessionAsync(caseId, recipient, executor, session.SessionId));
        await Assert.ThrowsAsync<InvalidOperationException>(() => service.ConfigureVaultAsync(caseId, RecipientMode.CO_OWNED, new[] { recipient, outsider }));
        guest.ExpiresAt = DateTime.UtcNow.AddMinutes(-1);
        await Assert.ThrowsAsync<UnauthorizedAccessException>(() => service.GetJoinTokenAsync(session.SessionId, recipient, null, guest.GuestToken));
        Assert.NotEqual(guest.GuestToken, (await service.GetOrCreateGuestSessionAsync(caseId, recipient, executor, session.SessionId)).GuestToken);
    }

}


