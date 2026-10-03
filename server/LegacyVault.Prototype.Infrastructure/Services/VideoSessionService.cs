using System.Collections.Concurrent;
using System.Text.Json;
using LegacyVault.Prototype.Application.DTOs;
using LegacyVault.Prototype.Application.Interfaces;
using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace LegacyVault.Prototype.Infrastructure.Services;

public class VideoSessionService : IVideoSessionService
{
    // Kho lưu trữ in-memory an toàn luồng cho Prototype Testbench
    private readonly ConcurrentDictionary<Guid, VideoSession> _sessions = new();
    private readonly ConcurrentDictionary<Guid, CaseRescueHold> _holds = new();
    private readonly ConcurrentDictionary<Guid, Guid> _caseActiveHoldMap = new(); // CaseId -> HoldId

    // Cấu trúc dữ liệu theo đúng SRS v3.11.0:
    // Quyết định: (BundleId, RecipientId) -> RecipientHandoverDecision
    private readonly ConcurrentDictionary<(Guid BundleId, Guid RecipientId), RecipientHandoverDecision> _decisions = new();
    // Xác nhận của Executor: (BundleId, RecipientId) -> ExecutorRecipientAuthorization
    private readonly ConcurrentDictionary<(Guid BundleId, Guid RecipientId), ExecutorRecipientAuthorization> _executorAuthorizations = new();
    // Quyền truy cập Grant: (BundleId, RecipientId) -> AccessGrant
    private readonly ConcurrentDictionary<(Guid BundleId, Guid RecipientId), AccessGrant> _grants = new();
    private readonly ConcurrentDictionary<Guid, AccessGrant> _grantsById = new();
    private readonly ConcurrentDictionary<string, AccessGrant> _grantsByDownloadToken = new();
    private readonly ConcurrentDictionary<Guid, EstateCommitment> _commitments = new(); // CommitmentId -> EstateCommitment
    private readonly ConcurrentDictionary<string, GuestHandoverSession> _guestSessions = new(); // GuestToken -> GuestHandoverSession
    private readonly ConcurrentDictionary<Guid, HandoverReceipt> _receipts = new(); // ReceiptId -> HandoverReceipt
    // Biên nhận: (GrantId, RecipientId) -> HandoverReceipt
    private readonly ConcurrentDictionary<(Guid GrantId, Guid RecipientId), HandoverReceipt> _receiptsByGrantAndRecipient = new();
    // Cấu hình kho di sản: BundleId -> HandoverVaultConfig
    private readonly ConcurrentDictionary<Guid, HandoverVaultConfig> _vaultConfigs = new();
    // Bằng chứng tải file thực tế từ server: (GrantId, AssetId) -> DownloadedAt
    private readonly ConcurrentDictionary<(Guid GrantId, Guid AssetId), DateTime> _verifiedAssetDownloads = new();

    private readonly HashSet<string> _processedWebhookEvents = new();
    private readonly object _lockObj = new();
    private readonly HashSet<Guid> _invitedBundles = new();

    private readonly ILiveKitVideoService _liveKitService;
    private readonly ITimeLockRescueService _timeLockRescueService;
    private readonly ILogger<VideoSessionService> _logger;
    private readonly string _liveKitUrl;

    public VideoSessionService(
        ILiveKitVideoService liveKitService,
        ITimeLockRescueService timeLockRescueService,
        IConfiguration configuration,
        ILogger<VideoSessionService> logger)
    {
        _liveKitService = liveKitService;
        _timeLockRescueService = timeLockRescueService;
        _logger = logger;
        _liveKitUrl = configuration["LIVEKIT_URL"] 
                      ?? configuration["LIVEKIT__URL"] 
                      ?? configuration["LiveKit:Url"] 
                      ?? "wss://legacyvaultprototype-t2bk4rvi.livekit.cloud";
    }

    public Task<ScheduleVideoSessionResponse> RequestSessionAsync(CreateVideoSessionRequest request, Guid currentUserId)
    {
        var sessionId = Guid.NewGuid();
        var providerRoomId = $"session_{sessionId:N}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}";

        var session = new VideoSession
        {
            Id = sessionId,
            CaseId = request.CaseId,
            ProviderRoomId = providerRoomId,
            Purpose = request.Purpose,
            Status = request.ScheduledAt.HasValue ? VideoSessionStatus.SCHEDULED : VideoSessionStatus.REQUESTED,
            RequestedAt = DateTime.UtcNow,
            ScheduledAt = request.ScheduledAt,
            SubjectUserId = request.SubjectUserId,
            AssignedVerifierId = request.AssignedVerifierId
        };

        _sessions[sessionId] = session;
        _logger.LogInformation("Đã khởi tạo yêu cầu phiên gọi {SessionId} cho Case {CaseId}. Purpose: {Purpose}, Status: {Status}",
            sessionId, request.CaseId, request.Purpose, session.Status);

        return Task.FromResult(MapToScheduleResponse(session));
    }

    public Task<ScheduleVideoSessionResponse> ConfirmScheduleAsync(Guid sessionId, DateTime scheduledAt, Guid currentUserId)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
            throw new KeyNotFoundException($"Không tìm thấy phiên gọi {sessionId}.");

        // Chỉ Verifier được phân công mới có quyền chốt lịch
        if (session.AssignedVerifierId != currentUserId)
            throw new UnauthorizedAccessException("Chỉ Verifier phụ trách mới có quyền xác nhận lịch hẹn.");

        session.ScheduledAt = scheduledAt;
        session.Status = VideoSessionStatus.SCHEDULED;

        _logger.LogInformation("Verifier {VerifierId} đã chốt lịch hẹn phiên {SessionId} vào lúc {ScheduledAt}",
            currentUserId, sessionId, scheduledAt);

        return Task.FromResult(MapToScheduleResponse(session));
    }

    public Task<JoinTokenResponse> GetJoinTokenAsync(
        Guid sessionId, 
        Guid currentUserId, 
        string? customParticipantName = null, 
        string? guestToken = null, 
        string? requestedRole = null)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
            throw new KeyNotFoundException($"Không tìm thấy phiên gọi {sessionId}.");

        // 1. Phân quyền và xác định tên hiển thị
        ParticipantRoleInCall role;
        string participantName;

        if (!string.IsNullOrWhiteSpace(guestToken))
        {
            if (!_guestSessions.TryGetValue(guestToken, out var guest) || guest.Status != GuestSessionStatus.ACTIVE ||
                guest.ExpiresAt <= DateTime.UtcNow || guest.SessionId != sessionId || guest.CaseId != session.CaseId ||
                guest.BeneficiaryId != currentUserId)
                throw new UnauthorizedAccessException("Phiên khách không hợp lệ hoặc không thuộc phòng này.");
            role = ParticipantRoleInCall.SUBJECT_USER;
            participantName = customParticipantName ?? guest.BeneficiaryName;
        }
        else if (session.AssignedVerifierId == currentUserId)
        {
            role = ParticipantRoleInCall.HOST_VERIFIER;
            participantName = customParticipantName ?? "Thẩm định viên";
        }
        else if (session.SubjectUserId == currentUserId)
        {
            role = ParticipantRoleInCall.SUBJECT_USER;
            participantName = customParticipantName ?? "Người tham gia được chỉ định";
        }
        else if (_vaultConfigs.TryGetValue(session.CaseId, out var vault) && vault.DesignatedRecipientIds.Contains(currentUserId))
        {
            role = ParticipantRoleInCall.CO_BENEFICIARY;
            participantName = customParticipantName ?? "Đồng thừa hưởng";
        }
        else
        {
            throw new UnauthorizedAccessException("Danh tính chưa được chỉ định tham gia phiên này.");
        }
        if (!session.Participants.Any(p => p.UserId == currentUserId))
            session.Participants.Add(new VideoSessionParticipant { SessionId = session.Id, UserId = currentUserId, Role = role });

        // 2. Kiểm tra trạng thái phiên: nếu đã kết thúc hoặc hủy -> Chặn tuyệt đối
        if (session.Status is VideoSessionStatus.COMPLETED or VideoSessionStatus.CANCELLED or VideoSessionStatus.TERMINATED or VideoSessionStatus.EXPIRED)
        {
            throw new InvalidOperationException($"Phiên gọi đã ở trạng thái {session.Status}. Không thể cấp token vào phòng.");
        }

        // Tự động chuyển WAITING / IN_PROGRESS khi người có quyền xin token
        if (session.Status == VideoSessionStatus.SCHEDULED || session.Status == VideoSessionStatus.REQUESTED)
        {
            session.Status = VideoSessionStatus.WAITING;
        }

        // 3. Đảm bảo identity duy nhất cho mỗi kết nối/thiết bị vào phòng LiveKit
        var uniqueIdentity = $"{currentUserId:N}_{Guid.NewGuid().ToString()[..6]}";

        var ttl = TimeSpan.FromMinutes(5);
        var token = _liveKitService.GenerateJoinToken(
            roomName: session.ProviderRoomId,
            participantIdentity: uniqueIdentity,
            participantName: participantName,
            ttl: ttl);

        return Task.FromResult(new JoinTokenResponse
        {
            LiveKitUrl = _liveKitUrl,
            RoomName = session.ProviderRoomId,
            ParticipantIdentity = uniqueIdentity,
            ParticipantName = participantName,
            Token = token,
            ExpiresInSeconds = (int)ttl.TotalSeconds
        });
    }

    public Task<VideoSessionDetailDto> SubmitVerdictAsync(Guid sessionId, SubmitVerdictRequest request, Guid currentVerifierId)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
            throw new KeyNotFoundException($"Không tìm thấy phiên gọi {sessionId}.");

        if (session.AssignedVerifierId != currentVerifierId)
            throw new UnauthorizedAccessException("Chỉ Verifier phụ trách mới có quyền ghi nhận kết quả xác minh.");

        session.VerificationOutcome = request.Outcome;
        session.VerifierNotes = request.VerifierNotes;
        session.ChecklistJson = request.ChecklistJson;
        session.EvaluatedAt = DateTime.UtcNow;
        session.RecordedByVerifierId = currentVerifierId;

        // BẢO MẬT & ĐÚNG ĐẶC TẢ SRS: Thẩm định video PASS chỉ cập nhật kết quả danh tính nhân thân.
        // Tuyệt đối KHÔNG gọi _timeLockRescueService.ApproveCaseForDelivery!
        // Phê duyệt giải phóng Case và đếm ngược Time-Lock phải được kiểm tra và xử lý độc lập.

        _logger.LogInformation("Verifier {VerifierId} đã ghi nhận kết quả {Outcome} cho phiên {SessionId}.",
            currentVerifierId, request.Outcome, sessionId);

        return Task.FromResult(MapToDetailDto(session));
    }

    public async Task<VideoSessionDetailDto> EndSessionAsync(Guid sessionId, Guid currentUserId)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
            throw new KeyNotFoundException($"Không tìm thấy phiên gọi {sessionId}.");

        if (session.AssignedVerifierId != currentUserId && session.SubjectUserId != currentUserId)
            throw new UnauthorizedAccessException("Không có quyền kết thúc phiên.");

        session.Status = VideoSessionStatus.COMPLETED;
        session.EndedAt = DateTime.UtcNow;

        // Gọi LiveKit Cloud DeleteRoom để ngắt tất cả kết nối trong phòng
        try
        {
            await _liveKitService.DeleteRoomAsync(session.ProviderRoomId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Lỗi khi đóng phòng LiveKit {RoomName}", session.ProviderRoomId);
        }

        return MapToDetailDto(session);
    }

    public Task<VideoSessionDetailDto> GetSessionDetailAsync(Guid sessionId, Guid currentUserId)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
            throw new KeyNotFoundException($"Không tìm thấy phiên gọi {sessionId}.");

        if (session.AssignedVerifierId != currentUserId && session.SubjectUserId != currentUserId)
            throw new UnauthorizedAccessException("Không có quyền xem thông tin phiên gọi.");

        return Task.FromResult(MapToDetailDto(session));
    }

    public Task<bool> HandleWebhookEventAsync(
        string eventId, 
        string eventType, 
        string roomName, 
        string? participantIdentity, 
        string? rawPayload)
    {
        lock (_lockObj)
        {
            // Idempotency: Kiểm tra event trùng
            if (!_processedWebhookEvents.Add(eventId))
            {
                _logger.LogInformation("Webhook event {EventId} đã được xử lý trước đó. Bỏ qua.", eventId);
                return Task.FromResult(true);
            }

            var session = _sessions.Values.FirstOrDefault(s => s.ProviderRoomId == roomName);
            if (session == null)
            {
                _logger.LogWarning("Không tìm thấy session tương ứng với roomName {RoomName}", roomName);
                return Task.FromResult(true);
            }

            var now = DateTime.UtcNow;

            // Xử lý sự kiện tham gia / rời phòng
            if (eventType == "participant_joined" && !string.IsNullOrEmpty(participantIdentity))
            {
                if (Guid.TryParse(participantIdentity, out var userId))
                {
                    var participant = session.Participants.FirstOrDefault(p => p.UserId == userId);
                    if (participant == null)
                    {
                        participant = new VideoSessionParticipant
                        {
                            SessionId = session.Id,
                            UserId = userId,
                            Role = userId == session.AssignedVerifierId ? ParticipantRoleInCall.HOST_VERIFIER : ParticipantRoleInCall.SUBJECT_USER,
                            JoinedAt = now
                        };
                        session.Participants.Add(participant);
                    }
                    else
                    {
                        participant.JoinedAt ??= now;
                    }
                }

                // Bảo toàn tính đơn điệu (Monotonicity): KHÔNG kéo trạng thái ngược lại nếu đã COMPLETED hoặc TERMINATED
                if (session.Status is not (VideoSessionStatus.COMPLETED or VideoSessionStatus.TERMINATED))
                {
                    session.Status = VideoSessionStatus.IN_PROGRESS;
                    session.StartedAt ??= now;
                }
            }
            else if (eventType == "participant_left" && !string.IsNullOrEmpty(participantIdentity))
            {
                if (Guid.TryParse(participantIdentity, out var userId))
                {
                    var participant = session.Participants.FirstOrDefault(p => p.UserId == userId);
                    if (participant != null)
                    {
                        participant.LeftAt = now;
                    }
                }
            }
            else if (eventType == "room_finished")
            {
                if (session.Status is not VideoSessionStatus.TERMINATED)
                {
                    session.Status = VideoSessionStatus.COMPLETED;
                    session.EndedAt ??= now;
                }
            }

            return Task.FromResult(true);
        }
    }

    // ==========================================
    // P0: EMERGENCY RESCUE HOLD & ADJUDICATION
    // ==========================================

    public Task<RescueHoldResultDto> TriggerRescueHoldAsync(Guid caseId, Guid currentUserId, string? reason)
    {
        lock (_lockObj)
        {
            // 1. Kiểm tra Idempotency: Nếu Case đã có Hold đang Active -> Trả về thông tin Hold đang chạy
            if (_caseActiveHoldMap.TryGetValue(caseId, out var existingHoldId) && 
                _holds.TryGetValue(existingHoldId, out var existingHold) && 
                existingHold.IsActive)
            {
                return Task.FromResult(new RescueHoldResultDto
                {
                    HoldId = existingHold.Id,
                    CaseId = caseId,
                    Status = "ALREADY_HELD",
                    Message = "Hồ sơ đang trong trạng thái tạm giữ khẩn cấp. Không tạo yêu cầu trùng lặp.",
                    VideoSessionId = _sessions.Values
                        .FirstOrDefault(s => s.CaseId == caseId && s.Purpose == VideoSessionPurpose.OWNER_RESCUE)?.Id
                });
            }

            // 2. Kiểm tra trạng thái Case qua Allow-list
            var caseStatusDto = _timeLockRescueService.GetStatus(caseId);
            var allowableStatuses = new[] { CaseStatus.UNDER_REVIEW, CaseStatus.APPROVED_FOR_DELIVERY, CaseStatus.RESCUE_PENDING };
            if (!allowableStatuses.Contains(caseStatusDto.Status))
            {
                throw new InvalidOperationException($"Không thể kích hoạt cứu hộ cho hồ sơ ở trạng thái {caseStatusDto.Status}.");
            }

            // 3. Đặt trạng thái RESCUE_PENDING trên TimeLock service
            _timeLockRescueService.SubmitAliveClaim(new SubmitAliveClaimRequest
            {
                CaseId = caseId,
                Reason = reason ?? "Owner submitted emergency AliveClaim."
            });

            // 4. Lưu Snapshot chi tiết
            var now = DateTime.UtcNow;
            var snapshots = new List<HandoverVaultSnapshot>
            {
                new()
                {
                    HandoverVaultId = Guid.NewGuid(),
                    PreviousStatus = HandoverStatus.PENDING_RESPONSE,
                    RemainingResponseWindowSeconds = caseStatusDto.RemainingSeconds,
                    RemainingGrantWindowSeconds = 168 * 3600,
                    ScheduledDeliveryDate = caseStatusDto.UnlockTargetTime
                }
            };

            var hold = new CaseRescueHold
            {
                Id = Guid.NewGuid(),
                CaseId = caseId,
                OwnerId = currentUserId,
                HeldAt = now,
                PreviousCaseStatus = caseStatusDto.Status,
                HandoverSnapshotsJson = JsonSerializer.Serialize(snapshots),
                Reason = reason
            };

            _holds[hold.Id] = hold;
            _caseActiveHoldMap[caseId] = hold.Id;

            // Nếu Case này đã được cấp Access Grant trước đó, đình chỉ ngay lập tức để chặn tải dữ liệu tiếp theo
            foreach (var grant in _grants.Values.Where(g => g.CaseId == caseId && g.Status == AccessGrantStatus.ACTIVE))
            {
                grant.Status = AccessGrantStatus.SUSPENDED_RESCUE_HOLD;
                _logger.LogWarning("ACCESS GRANT SUSPENDED: Grant {GrantId} (Recipient {RecipientId}) của Case {CaseId} đã bị đình chỉ do Rescue Hold kích hoạt.",
                    grant.Id, grant.RecipientId, caseId);
            }

            // 5. Tự động tạo phiên gọi Video OWNER_RESCUE khẩn cấp
            var sessionId = Guid.NewGuid();
            var videoSession = new VideoSession
            {
                Id = sessionId,
                CaseId = caseId,
                ProviderRoomId = $"rescue_room_{sessionId:N}_{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}",
                Purpose = VideoSessionPurpose.OWNER_RESCUE,
                Status = VideoSessionStatus.REQUESTED,
                RequestedAt = now,
                SubjectUserId = currentUserId,
                AssignedVerifierId = Guid.Empty // Sẽ được hệ thống hoặc Verifier gán nhận
            };
            _sessions[sessionId] = videoSession;

            _logger.LogWarning("EMERGENCY HOLD ACTIVATED: Case {CaseId} đã được đưa vào trạng thái tạm giữ bởi Owner {OwnerId}. HoldId: {HoldId}",
                caseId, currentUserId, hold.Id);

            return Task.FromResult(new RescueHoldResultDto
            {
                HoldId = hold.Id,
                CaseId = caseId,
                Status = "HELD_SUCCESSFULLY",
                Message = "Đã tạm dừng quy trình bàn giao. Phiên xác minh cứu hộ khẩn cấp đã được khởi tạo.",
                VideoSessionId = sessionId
            });
        }
    }

    public Task<RescueHoldResultDto> AdjudicateRescueHoldAsync(
        Guid caseId, 
        Guid verifierId, 
        RescueDecisionType decision, 
        string notes)
    {
        lock (_lockObj)
        {
            if (!_caseActiveHoldMap.TryGetValue(caseId, out var holdId) || 
                !_holds.TryGetValue(holdId, out var hold) || 
                !hold.IsActive)
            {
                throw new InvalidOperationException("Không tìm thấy phiên tạm giữ đang hoạt động cho Case này.");
            }

            var now = DateTime.UtcNow;
            hold.Decision = decision;
            hold.ReleasedAt = now;
            hold.AdjudicatedByVerifierId = verifierId;
            hold.AdjudicatedAt = now;
            hold.AdjudicationNotes = notes;

            // Chuyển kết quả sang TimeLockRescueService
            _timeLockRescueService.AdjudicateRescue(new RescueDecisionRequest
            {
                CaseId = caseId,
                Decision = decision,
                VerifierNotes = notes,
                VerifierFullName = $"Verifier-{verifierId.ToString()[..8]}"
            });

            _caseActiveHoldMap.TryRemove(caseId, out _);

            if (decision == RescueDecisionType.REJECTED_FRAUD)
            {
                foreach (var g in _grants.Values.Where(g => g.CaseId == caseId && g.Status == AccessGrantStatus.SUSPENDED_RESCUE_HOLD))
                {
                    g.Status = AccessGrantStatus.ACTIVE;
                }
            }

            _logger.LogInformation("Phán quyết cứu hộ cho Case {CaseId}: {Decision}. HoldId: {HoldId}, Verifier: {VerifierId}",
                caseId, decision, hold.Id, verifierId);

            return Task.FromResult(new RescueHoldResultDto
            {
                HoldId = hold.Id,
                CaseId = caseId,
                Status = decision == RescueDecisionType.APPROVED_ALIVE ? "CANCELLED_ALIVE" : "RESUMED_HANDOVER",
                Message = decision == RescueDecisionType.APPROVED_ALIVE 
                    ? "Đã xác minh Owner còn sống. Hồ sơ bàn giao bị hủy vĩnh viễn."
                    : "Yêu cầu cứu hộ bị bác bỏ. Quy trình bàn giao được tiếp tục với thời gian còn lại."
            });
        }
    }

    // ==========================================
    // IN-CALL ESTATE HANDOVER CEREMONY (SRS v3.11.0 CO-OWNERSHIP)
    // ==========================================

    private HandoverVaultConfig GetOrCreateVaultConfig(Guid bundleOrCaseOrSessionId, Guid? sessionCaseId = null, Guid? subjectUserId = null)
    {
        Guid caseId;
        Guid bundleId;

        var session = _sessions.Values.FirstOrDefault(s => s.Id == bundleOrCaseOrSessionId || s.CaseId == bundleOrCaseOrSessionId);
        if (session != null)
        {
            caseId = session.CaseId;
            bundleId = session.CaseId;
        }
        else
        {
            caseId = sessionCaseId ?? bundleOrCaseOrSessionId;
            bundleId = bundleOrCaseOrSessionId;
        }

        var vault = _vaultConfigs.GetOrAdd(bundleId, id =>
        {
            var designated = new HashSet<Guid>();
            if (subjectUserId.HasValue && subjectUserId.Value != Guid.Empty)
            {
                designated.Add(subjectUserId.Value);
            }
            else
            {
                designated.Add(Guid.Parse("11111111-1111-1111-1111-111111111111"));
            }

            return new HandoverVaultConfig
            {
                BundleId = id,
                CaseId = caseId,
                BundleName = "Kho di sản chung K",
                RecipientMode = RecipientMode.SINGLE_RECIPIENT,
                DesignatedRecipientIds = designated,
                AssignedExecutorId = session?.AssignedVerifierId != null && session.AssignedVerifierId != Guid.Empty
                    ? session.AssignedVerifierId
                    : Guid.Empty,
                Status = HandoverStatus.PENDING_RESPONSE,
                CreatedAt = DateTime.UtcNow,
                ResponseDeadlineUtc = DateTime.UtcNow.AddDays(7),
                Assets = GetDefaultHandoverAssets(caseId)
            };
        });

        if (session != null && session.AssignedVerifierId != Guid.Empty && vault.AssignedExecutorId == Guid.Empty)
        {
            vault.AssignedExecutorId = session.AssignedVerifierId;
        }

        return vault;
    }

    public Task<HandoverVaultConfig> ConfigureVaultAsync(Guid bundleOrCaseId, RecipientMode mode, IEnumerable<Guid> designatedRecipientIds, Guid? assignedExecutorId = null)
    {
        lock (_lockObj)
        {
            var vault = GetOrCreateVaultConfig(bundleOrCaseId);
            if (_invitedBundles.Contains(vault.BundleId))
                throw new InvalidOperationException("Không thể đổi danh sách người nhận sau khi phát hành lời mời.");
            vault.RecipientMode = mode;
            vault.DesignatedRecipientIds = new HashSet<Guid>(designatedRecipientIds);
            if (assignedExecutorId.HasValue && assignedExecutorId.Value != Guid.Empty)
            {
                vault.AssignedExecutorId = assignedExecutorId.Value;
            }
            vault.Status = HandoverStatus.PENDING_RESPONSE;
            vault.ResponseDeadlineUtc = DateTime.UtcNow.AddDays(7);
            vault.FreezeStartedAt = null;
            vault.ReconsiderationExpiresAt = null;
            return Task.FromResult(vault);
        }
    }

    public Task<HandoverEligibilityDto> GetHandoverEligibilityAsync(Guid caseOrSessionId, Guid currentUserId)
    {
        lock (_lockObj)
        {
            var session = _sessions.Values.FirstOrDefault(s => s.Id == caseOrSessionId || s.CaseId == caseOrSessionId);
            var caseId = session?.CaseId ?? caseOrSessionId;
            var vault = GetOrCreateVaultConfig(caseId, caseId, session?.SubjectUserId ?? currentUserId);

            var recipientId = currentUserId != Guid.Empty
                ? currentUserId
                : (session?.SubjectUserId != null && session.SubjectUserId != Guid.Empty ? session.SubjectUserId : vault.DesignatedRecipientIds.FirstOrDefault());

            // 1. Kiểm tra Active Rescue Hold
            CaseRescueHold? hold = null;
            var isRescueHeld = _caseActiveHoldMap.TryGetValue(caseId, out var holdId) &&
                               _holds.TryGetValue(holdId, out hold) &&
                               hold.IsActive;
            string? holdReason = isRescueHeld && hold != null ? hold.Reason : null;

            // 2. Kiểm tra Time-Lock từ Service
            var timeLock = _timeLockRescueService.GetStatus(caseId);
            bool isTimeLocked = timeLock.IsLocked && timeLock.RemainingSeconds > 0;

            // 3. Kiểm tra Executor Authorization cho đúng (BundleId, RecipientId)
            bool isExecutorAuthorized = _executorAuthorizations.TryGetValue((vault.BundleId, recipientId), out var execAuth) && execAuth.IsAuthorized;
            bool isVerifierApproved = (session != null && session.VerificationOutcome == VerificationOutcome.PASS) || isExecutorAuthorized;

            // 4. Kiểm tra Decision của Recipient
            _decisions.TryGetValue((vault.BundleId, recipientId), out var recipientDecision);
            bool isAlreadyAccepted = recipientDecision?.Decision == BeneficiaryDecisionType.ACCEPTED;

            // 5. Kiểm tra Grant của Recipient
            _grants.TryGetValue((vault.BundleId, recipientId), out var grant);
            bool hasActiveGrant = grant != null && grant.Status == AccessGrantStatus.ACTIVE;

            // 6. Kiểm tra Biên nhận của Recipient
            HandoverReceipt? receipt = null;
            if (grant != null)
            {
                _receiptsByGrantAndRecipient.TryGetValue((grant.Id, recipientId), out receipt);
            }
            if (receipt == null)
            {
                receipt = _receipts.Values.FirstOrDefault(r => r.BundleId == vault.BundleId && r.BeneficiaryId == recipientId);
            }
            bool isFinalized = receipt != null || (grant != null && grant.Status == AccessGrantStatus.FINALIZED);

            // 7. Đồng thuận nhóm đồng sở hữu theo SRS v3.11.0
            if (vault.ResponseDeadlineUtc.HasValue && DateTime.UtcNow > vault.ResponseDeadlineUtc.Value && vault.Status == HandoverStatus.PENDING_RESPONSE)
            {
                vault.Status = HandoverStatus.FROZEN_RECONSIDERATION;
                vault.FreezeStartedAt ??= DateTime.UtcNow;
                vault.ReconsiderationExpiresAt ??= DateTime.UtcNow.AddYears(2);
            }

            if (vault.Status == HandoverStatus.FROZEN_RECONSIDERATION && vault.ReconsiderationExpiresAt.HasValue && DateTime.UtcNow > vault.ReconsiderationExpiresAt.Value)
            {
                vault.Status = HandoverStatus.CANCELLED_WITHOUT_DELIVERY;
            }

            var coBeneficiariesList = new List<CoBeneficiaryDecisionDto>();
            int acceptedCount = 0;
            bool anyRejected = false;

            foreach (var benId in vault.DesignatedRecipientIds)
            {
                _decisions.TryGetValue((vault.BundleId, benId), out var dec);
                _executorAuthorizations.TryGetValue((vault.BundleId, benId), out var auth);

                var isFin = (grant != null && _receiptsByGrantAndRecipient.ContainsKey((grant.Id, benId))) ||
                            _receipts.Values.Any(rc => rc.BundleId == vault.BundleId && rc.BeneficiaryId == benId);

                var decType = dec?.Decision ?? BeneficiaryDecisionType.PENDING;
                if (decType == BeneficiaryDecisionType.ACCEPTED) acceptedCount++;
                if (decType == BeneficiaryDecisionType.REJECTED) anyRejected = true;

                coBeneficiariesList.Add(new CoBeneficiaryDecisionDto
                {
                    RecipientId = benId,
                    RecipientName = benId == recipientId ? "Bạn (Người thụ hưởng)" : $"Đồng thừa kế ({benId.ToString()[..6]})",
                    Role = benId == (session?.SubjectUserId ?? Guid.Empty) ? "PRIMARY_BENEFICIARY" : "CO_BENEFICIARY",
                    Decision = decType,
                    DecidedAt = dec?.DecidedAt,
                    IsExecutorAuthorized = auth != null && auth.IsAuthorized,
                    ExecutorAuthorizedAt = auth?.AuthorizedAt,
                    HasFinalized = isFin
                });
            }

            bool isAllConsented = vault.RecipientMode == RecipientMode.SINGLE_RECIPIENT
                ? isAlreadyAccepted
                : (vault.DesignatedRecipientIds.Count > 0 && acceptedCount == vault.DesignatedRecipientIds.Count && !anyRejected);

            bool isFrozen = vault.Status == HandoverStatus.FROZEN_RECONSIDERATION;
            bool isCancelledWithoutDelivery = vault.Status == HandoverStatus.CANCELLED_WITHOUT_DELIVERY;

            var coOwnershipStatusDto = new CoOwnershipVaultStatusDto
            {
                BundleId = vault.BundleId,
                RecipientMode = vault.RecipientMode,
                HandoverStatus = vault.Status,
                TotalRequiredBeneficiaries = vault.DesignatedRecipientIds.Count,
                AcceptedBeneficiariesCount = acceptedCount,
                IsAllConsented = isAllConsented,
                IsFrozen = isFrozen,
                FreezeStartedAt = vault.FreezeStartedAt,
                ReconsiderationExpiresAt = vault.ReconsiderationExpiresAt,
                CoBeneficiaries = coBeneficiariesList
            };

            var blockReasons = new List<string>();

            if (isRescueHeld)
            {
                blockReasons.Add($"Hồ sơ đang tạm giữ bởi Chủ kho (Rescue Hold): {holdReason ?? "Yêu cầu cứu hộ khẩn cấp"}");
            }

            if (!isVerifierApproved && !isExecutorAuthorized)
            {
                blockReasons.Add(session == null
                    ? "Chưa khởi tạo phiên làm việc trực tiếp."
                    : "Người thực thi chưa xác nhận nhân thân cho bạn đối với kho di sản này.");
            }

            if (isTimeLocked)
            {
                blockReasons.Add($"Khóa thời gian trễ (Time-Lock) chưa kết thúc. Thời gian còn lại: {timeLock.RemainingSeconds} giây.");
            }

            if (timeLock.Status == CaseStatus.CANCELLED_ALIVE)
            {
                blockReasons.Add("Hồ sơ đã bị hủy vĩnh viễn do Chủ kho được xác nhận còn sống.");
            }

            if (isFrozen)
            {
                blockReasons.Add($"Kho di sản đang bị đóng băng do chưa đạt đồng thuận của nhóm đồng sở hữu (Thời hạn suy nghĩ lại đến {vault.ReconsiderationExpiresAt:dd/MM/yyyy}).");
            }

            if (isCancelledWithoutDelivery)
            {
                blockReasons.Add("Quyền nhận kho di sản này đã bị hủy bỏ vĩnh viễn do hết thời hạn 2 năm mà không đạt đủ đồng thuận.");
            }

            bool canAccept = (isVerifierApproved || isExecutorAuthorized)
                && !isRescueHeld
                && !isTimeLocked
                && timeLock.Status != CaseStatus.CANCELLED_ALIVE
                && !isCancelledWithoutDelivery
                && (!isAlreadyAccepted || isFrozen);

            bool canDownload = hasActiveGrant && !isRescueHeld && !isTimeLocked;

            return Task.FromResult(new HandoverEligibilityDto
            {
                CaseId = caseId,
                BundleId = vault.BundleId,
                SessionId = session?.Id ?? Guid.Empty,
                RecipientId = recipientId,
                CanAccept = canAccept,
                CanDownload = canDownload,
                BlockReasons = blockReasons,
                IsVerifierApproved = isVerifierApproved,
                IsExecutorAuthorized = isExecutorAuthorized,
                VerificationOutcome = session?.VerificationOutcome ?? VerificationOutcome.PENDING,
                VerifierNotes = session?.VerifierNotes,
                IsTimeLocked = isTimeLocked,
                TimeLockRemainingSeconds = timeLock.RemainingSeconds,
                UnlockTargetTime = timeLock.UnlockTargetTime,
                IsRescueHeld = isRescueHeld,
                HoldReason = holdReason,
                IsAlreadyAccepted = isAlreadyAccepted,
                ExistingGrantId = grant?.Id,
                IsFinalized = isFinalized,
                FinalReceipt = receipt != null ? new HandoverReceiptDto
                {
                    ReceiptId = receipt.ReceiptId,
                    ReceiptNumber = receipt.ReceiptNumber,
                    CaseId = receipt.CaseId,
                    BundleId = receipt.BundleId,
                    GrantId = receipt.GrantId,
                    SessionId = receipt.SessionId,
                    BeneficiaryId = receipt.BeneficiaryId,
                    BeneficiaryName = receipt.BeneficiaryName,
                    ReceivedAt = receipt.ReceivedAt,
                    DownloadedAssetsCount = receipt.DownloadedAssetIds.Count,
                    TotalAssetsCount = receipt.TotalAssetsCount,
                    LegalDeclaration = receipt.LegalDeclaration,
                    DigitalSignatureAudit = receipt.DigitalSignatureAudit
                } : null,
                Assets = vault.Assets,
                RegisteredDossier = new RegisteredBeneficiaryDossierDto
                {
                    BeneficiaryId = recipientId,
                    FullName = $"Người nhận ({recipientId.ToString()[..6]})",
                    NationalIdMasked = "07909500**** (Khớp trên CSDL)",
                    RegisteredEmail = "nguoinhan.di-san@legacyvault.vn",
                    DesignatedRole = vault.RecipientMode == RecipientMode.CO_OWNED ? "Đồng sở hữu (Co-Beneficiary)" : "Người thụ hưởng chính",
                    IsStrictlyBoundToPlan = true,
                    BindingNotice = "Ràng buộc chặt với Hồ sơ di sản ban đầu theo SRS v3.11.0. Không thể thay đổi trong cuộc gọi."
                },
                CoOwnershipStatus = coOwnershipStatusDto
            });
        }
    }

    public Task<AcceptHandoverResponse> AcceptHandoverAsync(Guid caseOrSessionId, Guid currentUserId, AcceptHandoverRequest request)
    {
        lock (_lockObj)
        {
            var session = _sessions.Values.FirstOrDefault(s => s.Id == caseOrSessionId || s.CaseId == caseOrSessionId);
            var caseId = session?.CaseId ?? caseOrSessionId;
            var vault = GetOrCreateVaultConfig(caseId, caseId, session?.SubjectUserId ?? currentUserId);

            var recipientId = request.RecipientId
                ?? (currentUserId != Guid.Empty ? currentUserId : (session?.SubjectUserId ?? vault.DesignatedRecipientIds.FirstOrDefault()));

            if (!string.IsNullOrEmpty(request.GuestToken) && _guestSessions.TryGetValue(request.GuestToken, out var guestSession))
            {
                recipientId = guestSession.BeneficiaryId;
            }

            // 1. Kiểm tra tuyệt đối Rescue Hold
            if (_caseActiveHoldMap.TryGetValue(caseId, out var holdId) &&
                _holds.TryGetValue(holdId, out var hold) &&
                hold.IsActive)
            {
                _logger.LogWarning("Từ chối nhận di sản: Case {CaseId} đang có Rescue Hold kích hoạt bởi Owner.", caseId);
                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = false,
                    Message = "Hồ sơ đang tạm giữ bởi Chủ kho (Rescue Hold). Toàn bộ thao tác bàn giao bị đình chỉ."
                });
            }

            // 2. Strict Beneficiary Binding
            if (vault.DesignatedRecipientIds.Count > 0 && !vault.DesignatedRecipientIds.Contains(recipientId))
            {
                _logger.LogWarning("Từ chối nhận di sản: Người gọi {RecipientId} không thuộc danh sách người thụ hưởng được chỉ định.", recipientId);
                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = false,
                    Message = "Tài khoản thực hiện không thuộc danh sách Người nhận được Chủ kho chỉ định trước trong hồ sơ di sản."
                });
            }

            // 3. Executor Authorization check cho đúng recipientId và đúng Kho
            bool isExecutorAuthorized = _executorAuthorizations.TryGetValue((vault.BundleId, recipientId), out var execAuth) && execAuth.IsAuthorized;
            bool isApproved = (session != null && session.VerificationOutcome == VerificationOutcome.PASS) || isExecutorAuthorized;

            if (!isApproved)
            {
                var outcomeStr = session?.VerificationOutcome.ToString() ?? "CHƯA_TỒN_TẠI";
                _logger.LogWarning("Từ chối nhận di sản: Recipient {RecipientId} trên Kho {BundleId} chưa được Người thực thi xác nhận đạt. Outcome: {Outcome}",
                    recipientId, vault.BundleId, outcomeStr);
                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = false,
                    Message = session?.VerificationOutcome == VerificationOutcome.INCONCLUSIVE
                        ? "Nghi ngờ bất thường hoặc chưa đủ căn cứ (INCONCLUSIVE). Chưa thể cấp khóa giải mã, yêu cầu chuyển hội đồng phúc tra."
                        : "Người thực thi chưa bấm 'Xác nhận người nhận & cho phép nhận di sản' cho bạn trên kho này."
                });
            }

            // 4. Passkey / Second Factor check
            if (string.IsNullOrWhiteSpace(request.SecondFactorProof))
            {
                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = false,
                    Message = "Thiếu xác thực yếu tố thứ hai (Passkey/FIDO2). Cần xác thực độc lập để bảo vệ trước nguy cơ tài khoản bị chiếm đoạt."
                });
            }

            // 5. Time-Lock check
            var timeLock = _timeLockRescueService.GetStatus(caseId);
            if (timeLock.IsLocked && timeLock.RemainingSeconds > 0)
            {
                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = false,
                    Message = $"Khóa thời gian trễ (Time-Lock) chưa kết thúc. Còn {timeLock.RemainingSeconds} giây."
                });
            }

            if (timeLock.Status == CaseStatus.CANCELLED_ALIVE)
            {
                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = false,
                    Message = "Hồ sơ di sản đã bị hủy bỏ do Chủ kho kháng nghị thành công."
                });
            }

            // 6. Kiểm tra hạn 2 năm suy nghĩ lại
            if (vault.Status == HandoverStatus.CANCELLED_WITHOUT_DELIVERY ||
                (vault.Status == HandoverStatus.FROZEN_RECONSIDERATION && vault.ReconsiderationExpiresAt.HasValue && DateTime.UtcNow > vault.ReconsiderationExpiresAt.Value))
            {
                vault.Status = HandoverStatus.CANCELLED_WITHOUT_DELIVERY;
                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = false,
                    Message = "Thời hạn suy nghĩ lại (2 năm) đã kết thúc mà không đạt đủ đồng thuận. Quyền nhận kho di sản này đã bị hủy bỏ vĩnh viễn."
                });
            }

            // XỬ LÝ TỪ CHỐI NHẬN (REJECT) -> Chuyển sang FROZEN_RECONSIDERATION ngay lập tức theo SRS AC-10
            if (request.IsReject)
            {
                _decisions[(vault.BundleId, recipientId)] = new RecipientHandoverDecision
                {
                    BundleId = vault.BundleId,
                    RecipientId = recipientId,
                    Decision = BeneficiaryDecisionType.REJECTED,
                    DecidedAt = DateTime.UtcNow,
                    RejectionReason = request.RejectionReason,
                    LegalAcknowledgment = false,
                    SecondFactorProof = request.SecondFactorProof,
                    ClientIpAddress = request.ClientIpAddress,
                    UserAgent = request.UserAgent
                };

                vault.Status = HandoverStatus.FROZEN_RECONSIDERATION;
                vault.FreezeStartedAt ??= DateTime.UtcNow;
                vault.ReconsiderationExpiresAt ??= DateTime.UtcNow.AddYears(2);

                _logger.LogWarning("ĐỒNG SỞ HỮU TỪ CHỐI: Người nhận {RecipientId} từ chối kho {BundleId}. Kho bị đóng băng suy nghĩ lại 2 năm.",
                    recipientId, vault.BundleId);

                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = true,
                    Message = "Bạn đã từ chối nhận kho di sản này. Theo đặc tả SRS, toàn bộ kho di sản được chuyển sang trạng thái ĐÓNG BĂNG SUY NGHĨ LẠI (2 năm). Chưa ai được phép truy cập.",
                    IsConsensusComplete = false,
                    VaultHandoverStatus = vault.Status
                });
            }

            // XỬ LÝ ĐỒNG Ý NHẬN (ACCEPT)
            _decisions[(vault.BundleId, recipientId)] = new RecipientHandoverDecision
            {
                BundleId = vault.BundleId,
                RecipientId = recipientId,
                Decision = BeneficiaryDecisionType.ACCEPTED,
                DecidedAt = DateTime.UtcNow,
                LegalAcknowledgment = request.LegalAcknowledgment,
                SecondFactorProof = request.SecondFactorProof,
                ClientIpAddress = request.ClientIpAddress,
                UserAgent = request.UserAgent
            };

            // Kiểm tra đồng thuận nhóm đồng sở hữu theo SRS
            bool isAllConsented = true;
            if (vault.RecipientMode == RecipientMode.CO_OWNED)
            {
                foreach (var benId in vault.DesignatedRecipientIds)
                {
                    bool benAccepted = _decisions.TryGetValue((vault.BundleId, benId), out var d) && d.Decision == BeneficiaryDecisionType.ACCEPTED;
                    bool benAuthorized = _executorAuthorizations.TryGetValue((vault.BundleId, benId), out var a) && a.IsAuthorized;

                    if (!benAccepted || !benAuthorized)
                    {
                        isAllConsented = false;
                        break;
                    }
                }
            }

            // TÌNH HUỐNG 1: Chưa đủ tất cả đồng sở hữu đồng ý -> Lưu quyết định của B, CHƯA CẤP GRANT CHO AI
            if (!isAllConsented)
            {
                _logger.LogInformation("GHI NHẬN ĐỒNG Ý: Người nhận {RecipientId} đã đồng ý nhận kho {BundleId}. Chờ các đồng sở hữu còn lại.",
                    recipientId, vault.BundleId);

                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = true,
                    Message = "Đã lưu quyết định đồng ý của bạn. Theo đặc tả SRS, kho chung chỉ được mở khóa khi TẤT CẢ người đồng sở hữu hoàn tất xác minh và đồng thuận nhận.",
                    IsConsensusComplete = false,
                    VaultHandoverStatus = vault.Status,
                    Assets = vault.Assets
                });
            }

            // TÌNH HUỐNG 2 / 4: Đã đủ 100% người đồng sở hữu xác minh & đồng ý nhận!
            // -> Cam kết bàn giao một lần; cấp Grant riêng cho từng người cùng manifest
            vault.Status = HandoverStatus.HANDOVER_COMMITTED;
            vault.FreezeStartedAt = null;
            vault.ReconsiderationExpiresAt = null;

            var commitment = new EstateCommitment
            {
                Id = Guid.NewGuid(),
                CaseId = caseId,
                BundleId = vault.BundleId,
                SessionId = session?.Id ?? Guid.Empty,
                RecipientId = recipientId,
                CommittedAt = DateTime.UtcNow,
                LegalAcknowledgment = "Cam kết bàn giao di sản cho nhóm đồng sở hữu đạt đồng thuận 100%."
            };
            _commitments[commitment.Id] = commitment;

            // Cấp Grant riêng cho tất cả người thụ hưởng trong nhóm (Atomic Group Delivery)
            foreach (var benId in vault.DesignatedRecipientIds)
            {
                _grants.GetOrAdd((vault.BundleId, benId), key =>
                {
                    var g = new AccessGrant
                    {
                        Id = Guid.NewGuid(),
                        BundleId = vault.BundleId,
                        CaseId = caseId,
                        RecipientId = key.RecipientId,
                        CommitmentId = commitment.Id,
                        Status = AccessGrantStatus.ACTIVE,
                        IssuedAt = DateTime.UtcNow,
                        ExpiresAt = DateTime.UtcNow.AddHours(168), // 7 ngày
                        DownloadToken = Guid.NewGuid().ToString("N")
                    };
                    _grantsById[g.Id] = g;
                    _grantsByDownloadToken[g.DownloadToken] = g;
                    return g;
                });
            }

            var myGrant = _grants[(vault.BundleId, recipientId)];
            var keyMaterial = GenerateMockDecryptionKeyMaterial();

            _logger.LogInformation("BÀN GIAO THÀNH CÔNG: Kho {BundleId} đã đủ đồng thuận 100%. Đã cấp AccessGrant {GrantId} cho Recipient {RecipientId}.",
                vault.BundleId, myGrant.Id, recipientId);

            return Task.FromResult(new AcceptHandoverResponse
            {
                Success = true,
                Message = "Tất cả người đồng sở hữu đã xác minh và đồng ý nhận! Kho di sản đã được mở khóa và cấp quyền giải mã tải xuống.",
                CommitmentId = commitment.Id,
                GrantId = myGrant.Id,
                GrantStatus = myGrant.Status,
                IssuedAt = myGrant.IssuedAt,
                ExpiresAt = myGrant.ExpiresAt,
                DownloadToken = myGrant.DownloadToken,
                Assets = vault.Assets,
                DecryptionKeyMaterial = keyMaterial,
                IsConsensusComplete = true,
                VaultHandoverStatus = vault.Status
            });
        }
    }

    public Task<DecryptionKeyMaterialDto> GetDecryptionKeyMaterialAsync(Guid caseOrSessionId, Guid currentUserId)
    {
        lock (_lockObj)
        {
            var session = _sessions.Values.FirstOrDefault(s => s.Id == caseOrSessionId || s.CaseId == caseOrSessionId);
            var caseId = session?.CaseId ?? caseOrSessionId;
            var vault = GetOrCreateVaultConfig(caseId, caseId, session?.SubjectUserId ?? currentUserId);

            var recipientId = currentUserId != Guid.Empty
                ? currentUserId
                : (session?.SubjectUserId ?? vault.DesignatedRecipientIds.FirstOrDefault());

            // Chặn tuyệt đối nếu có Rescue Hold
            if (_caseActiveHoldMap.TryGetValue(caseId, out var holdId) &&
                _holds.TryGetValue(holdId, out var hold) &&
                hold.IsActive)
            {
                throw new InvalidOperationException("Hồ sơ đang tạm giữ bởi Chủ kho. Không thể cấp phát vật liệu giải mã.");
            }

            if (!_grants.TryGetValue((vault.BundleId, recipientId), out var grant))
            {
                throw new KeyNotFoundException("Chưa tìm thấy AccessGrant cho bạn trên kho di sản này. Cần đủ đồng thuận của tất cả đồng sở hữu trước khi mở khóa.");
            }

            if (grant.Status == AccessGrantStatus.SUSPENDED_RESCUE_HOLD)
            {
                throw new InvalidOperationException("Quyền giải mã đã bị đình chỉ do Chủ kho kích hoạt lệnh cứu hộ khẩn cấp.");
            }

            if (grant.Status != AccessGrantStatus.ACTIVE)
            {
                throw new InvalidOperationException($"Quyền giải mã không còn hiệu lực (Trạng thái: {grant.Status}).");
            }

            if (DateTime.UtcNow > grant.ExpiresAt)
            {
                grant.Status = AccessGrantStatus.EXPIRED;
                throw new InvalidOperationException("Thời hạn truy cập dữ liệu di sản (168 giờ) đã hết hạn.");
            }

            return Task.FromResult(GenerateMockDecryptionKeyMaterial());
        }
    }

    private static List<HandoverAssetItem> GetDefaultHandoverAssets(Guid caseId)
    {
        return new List<HandoverAssetItem>
        {
            new()
            {
                AssetId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                Title = "master_credentials_vault.kdbx.enc",
                Category = "Mật khẩu & Tài khoản số",
                FileSizeBytes = 1024 * 48, // 48 KB
                CiphertextHash = "sha256:7e8a49c2d1e0b5f7...f3a9",
                MimeType = "application/x-kdbx",
                DownloadEndpoint = $"/api/case-bundles/{caseId}/assets/11111111-1111-1111-1111-111111111111/download"
            },
            new()
            {
                AssetId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                Title = "so_do_tai_san_thua_ke.pdf.enc",
                Category = "Giấy tờ Nhà đất & Bất động sản",
                FileSizeBytes = 1024 * 1024 * 4 + 512 * 1024, // 4.5 MB
                CiphertextHash = "sha256:a1b2c3d4e5f6...9876",
                MimeType = "application/pdf",
                DownloadEndpoint = $"/api/case-bundles/{caseId}/assets/22222222-2222-2222-2222-222222222222/download"
            },
            new()
            {
                AssetId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                Title = "crypto_cold_wallet_seed.enc",
                Category = "Khóa ví lạnh & Tài sản số",
                FileSizeBytes = 1024 * 4, // 4 KB
                CiphertextHash = "sha256:fe98dc76ba54...1234",
                MimeType = "text/plain",
                DownloadEndpoint = $"/api/case-bundles/{caseId}/assets/33333333-3333-3333-3333-333333333333/download"
            }
        };
    }

    // ==========================================
    // 7-STEP PROTOCOL: EXECUTOR & GUEST SESSION
    // ==========================================

    public Task<AuthorizeRecipientResponse> AuthorizeRecipientByExecutorAsync(
        Guid caseOrSessionId, 
        Guid executorId, 
        AuthorizeRecipientRequest request)
    {
        lock (_lockObj)
        {
            var session = _sessions.Values.FirstOrDefault(s => s.Id == caseOrSessionId || s.CaseId == caseOrSessionId);
            var caseId = session?.CaseId ?? caseOrSessionId;
            var vault = GetOrCreateVaultConfig(caseId, caseId, session?.SubjectUserId);

            // ĐỐI CHIẾU VÀ KIỂM SOÁT THẨM QUYỀN CỦA EXECUTOR:
            // 1. Nếu có phiên gọi và đã phân công Verifier/Executor, người gọi phải đúng là người được phân công
            if (session != null && session.AssignedVerifierId != Guid.Empty && session.AssignedVerifierId != executorId)
            {
                throw new UnauthorizedAccessException($"Người gọi ({executorId}) không phải là Executor/Verifier được chỉ định ({session.AssignedVerifierId}) cho phiên họp này.");
            }

            // 2. Nếu kho di sản đã gắn với Executor cụ thể, đối chiếu người gọi với Executor được chỉ định
            if (vault.AssignedExecutorId != Guid.Empty && vault.AssignedExecutorId != executorId)
            {
                throw new UnauthorizedAccessException($"Người gọi ({executorId}) không phải là Executor được chỉ định ({vault.AssignedExecutorId}) cho kho di sản {vault.BundleId}.");
            }

            // Ghi nhận Executor được phân công cho kho nếu chưa thiết lập
            if (vault.AssignedExecutorId == Guid.Empty)
            {
                vault.AssignedExecutorId = executorId;
            }

            // Xác định recipientId được Executor duyệt
            var recipientId = request.RecipientId 
                ?? session?.SubjectUserId 
                ?? vault.DesignatedRecipientIds.FirstOrDefault();

            // Chặn tuyệt đối nếu có Rescue Hold
            CaseRescueHold? hold = null;
            if (_caseActiveHoldMap.TryGetValue(caseId, out var holdId) &&
                _holds.TryGetValue(holdId, out hold) &&
                hold.IsActive)
            {
                throw new InvalidOperationException("Hồ sơ đang tạm giữ bởi Chủ kho (Rescue Hold). Không thể cấp quyền bàn giao.");
            }

            // Ghi nhận ủy quyền của Người thực thi cho đúng (BundleId, RecipientId)
            _executorAuthorizations[(vault.BundleId, recipientId)] = new ExecutorRecipientAuthorization
            {
                BundleId = vault.BundleId,
                RecipientId = recipientId,
                ExecutorId = executorId,
                AuthorizedAt = DateTime.UtcNow,
                Notes = request.ExecutorNotes ?? "Người thực thi đối chiếu nhân thân hợp lệ.",
                FaceMatched = request.FaceMatched,
                NationalIdMatched = request.NationalIdMatched,
                InteractiveChallengePassed = request.InteractiveChallengePassed
            };

            // Nếu có session tương ứng với recipient này, cập nhật Outcome = PASS
            if (session != null && (session.SubjectUserId == recipientId || session.SubjectUserId == Guid.Empty))
            {
                session.VerificationOutcome = VerificationOutcome.PASS;
                session.EvaluatedAt = DateTime.UtcNow;
                session.VerifierNotes = request.ExecutorNotes ?? "Người thực thi đối chiếu hợp lệ và cho phép nhận di sản.";
                // CHÚ Ý BẢO MẬT: KHÔNG gọi _timeLockRescueService.ApproveCaseForDelivery(caseId)!
                // Việc Executor xác minh nhân thân không được phép xóa bỏ hoặc rút ngắn thời gian Time-Lock!
            }

            // Cập nhật các guest session liên quan
            foreach (var gs in _guestSessions.Values.Where(g => g.CaseId == caseId && g.BeneficiaryId == recipientId))
            {
                gs.IsExecutorAuthorized = true;
                gs.ExecutorAuthorizedAt = DateTime.UtcNow;
            }

            _logger.LogInformation("Người thực thi {ExecutorId} đã xác nhận nhân thân cho Recipient {RecipientId} trên Kho {BundleId}.",
                executorId, recipientId, vault.BundleId);

            return Task.FromResult(new AuthorizeRecipientResponse
            {
                Success = true,
                Message = $"Đã xác nhận nhân thân người nhận {recipientId}. Quyết định của người nhận hiện có thể được ghi nhận.",
                AuthorizedAt = DateTime.UtcNow,
                ExecutorId = executorId,
                RecipientId = recipientId,
                BundleId = vault.BundleId
            });
        }
    }

    public async Task<FinalizeHandoverResponse> FinalizeHandoverSessionAsync(
        Guid caseOrSessionId, 
        Guid beneficiaryId, 
        FinalizeHandoverRequest request)
    {
        bool shouldCloseRoom = false;
        string? roomToClose = null;
        FinalizeHandoverResponse response;

        lock (_lockObj)
        {
            var session = _sessions.Values.FirstOrDefault(s => s.Id == caseOrSessionId || s.CaseId == caseOrSessionId);
            var caseId = session?.CaseId ?? caseOrSessionId;
            var vault = GetOrCreateVaultConfig(caseId, caseId, session?.SubjectUserId ?? beneficiaryId);

            var recipientId = request.RecipientId 
                ?? (beneficiaryId != Guid.Empty ? beneficiaryId : (session?.SubjectUserId ?? vault.DesignatedRecipientIds.FirstOrDefault()));

            if (!string.IsNullOrEmpty(request.GuestToken) && _guestSessions.TryGetValue(request.GuestToken, out var guestSession))
            {
                recipientId = guestSession.BeneficiaryId;
            }

            // =========================================================================
            // 0. CHỐNG XỬ LÝ LẶP (IDEMPOTENCY RETRY): Kiểm tra biên nhận đã phát hành trước đó
            // Phải chạy trước khi kiểm tra trạng thái Grant ACTIVE để hỗ trợ retry an toàn!
            // =========================================================================
            _grants.TryGetValue((vault.BundleId, recipientId), out var existingGrant);
            HandoverReceipt? existingReceipt = null;

            if (existingGrant != null && _receiptsByGrantAndRecipient.TryGetValue((existingGrant.Id, recipientId), out var r1))
            {
                existingReceipt = r1;
            }
            else if (_receipts.Values.FirstOrDefault(r => r.BundleId == vault.BundleId && r.BeneficiaryId == recipientId) is { } r2)
            {
                existingReceipt = r2;
            }

            if (existingReceipt != null)
            {
                _logger.LogInformation("IDEMPOTENT RETRY: Trả về biên nhận đã tồn tại {ReceiptNumber} cho Beneficiary {RecipientId}",
                    existingReceipt.ReceiptNumber, recipientId);

                var otherRecipients = vault.DesignatedRecipientIds.Where(id => id != recipientId).ToList();
                bool othersActive = otherRecipients.Any(otherId =>
                    !_receiptsByGrantAndRecipient.ContainsKey((existingReceipt.GrantId, otherId)) &&
                    _grants.TryGetValue((vault.BundleId, otherId), out var otherG) &&
                    otherG.Status == AccessGrantStatus.ACTIVE);

                return new FinalizeHandoverResponse
                {
                    Success = true,
                    Message = "Phiên bàn giao của bạn đã được xác nhận hoàn tất trước đó (Biên nhận điện tử hợp lệ).",
                    Receipt = MapToReceiptDto(existingReceipt),
                    IsRoomClosed = session?.Status == VideoSessionStatus.COMPLETED,
                    RoomStatus = session?.Status == VideoSessionStatus.COMPLETED ? "CLOSED" : "OPEN",
                    IsGuestSessionRevoked = true,
                    IsRecipientGrantFinalized = true,
                    AreOtherBeneficiariesStillActive = othersActive
                };
            }

            // =========================================================================
            // 1. CHẶN BỎ QUA QUY TRÌNH: Chỉ hoàn tất grant đã được cấp đúng quy trình (ACTIVE)
            // =========================================================================
            if (existingGrant == null || existingGrant.Status != AccessGrantStatus.ACTIVE)
            {
                throw new InvalidOperationException(
                    "Không tìm thấy quyền truy cập (AccessGrant) hợp lệ đang kích hoạt cho bạn. Vui lòng hoàn tất quy trình thẩm định nhân thân và chấp nhận nhận di sản trước khi kết thúc.");
            }
            var grant = existingGrant;

            var mandatoryAssets = vault.Assets.Where(a => a.IsMandatory).ToList();

            // =========================================================================
            // 2. KIỂM SOÁT LOG MÁY CHỦ: Phải có bằng chứng máy chủ đã thực sự phục vụ các file bắt buộc cho Grant này
            // =========================================================================
            var missingServerDownloads = mandatoryAssets
                .Where(m => !_verifiedAssetDownloads.ContainsKey((grant.Id, m.AssetId)))
                .ToList();

            if (missingServerDownloads.Any())
            {
                var names = string.Join(", ", missingServerDownloads.Select(m => m.Title));
                throw new InvalidOperationException(
                    $"Máy chủ chưa ghi nhận bạn đã tải đủ các tệp di sản bắt buộc qua liên kết bảo mật (Còn thiếu: {names}). Vui lòng tải toàn bộ tệp hợp lệ trước khi ký nhận.");
            }

            // =========================================================================
            // 3. KIỂM TRA LỜI XÁC NHẬN CỦA CLIENT: Người nhận xác nhận đã tải và mở thành công
            // =========================================================================
            var clientConfirmedList = request.ClientConfirmedAssetIds ?? request.DownloadedAssetIds;
            var missingClientConfirmations = mandatoryAssets
                .Where(m => !clientConfirmedList.Contains(m.AssetId))
                .ToList();

            if (missingClientConfirmations.Any())
            {
                var names = string.Join(", ", missingClientConfirmations.Select(m => m.Title));
                throw new InvalidOperationException(
                    $"Bạn chưa xác nhận đã mở/giải mã thành công các tệp bắt buộc: {names}.");
            }

            // =========================================================================
            // 4. KIỂM TRA VÀ BĂM CHỮ KÝ ĐIỆN TỬ (SIGNATURE VALIDATION & HASH BINDING)
            // =========================================================================
            if (string.IsNullOrWhiteSpace(request.RecipientSignatureData))
            {
                throw new InvalidOperationException("Biên nhận điện tử bắt buộc phải có chữ ký xác nhận của người nhận.");
            }

            var sigData = request.RecipientSignatureData.Trim();
            if (!sigData.StartsWith("data:image/", StringComparison.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException("Định dạng ảnh chữ ký không hợp lệ (yêu cầu Data URL hình ảnh: data:image/...).");
            }

            if (sigData.Length > 512 * 1024)
            {
                throw new InvalidOperationException("Kích thước ảnh chữ ký vượt quá giới hạn cho phép (tối đa 512 KB).");
            }

            using var sha256 = System.Security.Cryptography.SHA256.Create();
            var sigHashBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(sigData));
            var signatureHash = Convert.ToHexString(sigHashBytes).ToLowerInvariant();

            // =========================================================================
            // 5. TÍNH TOÁN MÃ BĂM SHA-256 THỰC TỪ NỘI DUNG BIÊN NHẬN (CANONICAL RECEIPT PAYLOAD)
            // Bắt buộc chứa: ReceiptVersion, ReceiptNumber, CaseId, BundleId, GrantId, SessionId, RecipientId, ExecutorId, SignatureHash
            // =========================================================================
            const string receiptVersion = "1.1";
            var receiptNumber = $"RCP-LV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
            var receivedAt = DateTime.UtcNow;
            var serverServedAssetIds = mandatoryAssets.Select(m => m.AssetId).ToList();
            var clientConfirmedAssetIds = clientConfirmedList.ToList();
            var sessionId = session?.Id ?? Guid.Empty;
            var executorId = session?.AssignedVerifierId != null && session.AssignedVerifierId != Guid.Empty
                ? session.AssignedVerifierId
                : vault.AssignedExecutorId;

            var canonicalString = $"{receiptVersion}|{receiptNumber}|{caseId}|{vault.BundleId}|{grant.Id}|{sessionId}|{recipientId}|{executorId}|{receivedAt:O}|{string.Join(",", clientConfirmedAssetIds.OrderBy(x => x))}|{signatureHash}|{request.LegalDeclaration}";
            var hashBytes = sha256.ComputeHash(System.Text.Encoding.UTF8.GetBytes(canonicalString));
            var receiptContentHash = Convert.ToHexString(hashBytes).ToLowerInvariant();
            var auditDigest = $"SHA256:{receiptContentHash}";

            // =========================================================================
            // 6. TẠO BIÊN NHẬN ĐIỆN TỬ (HANDOVER RECEIPT)
            // =========================================================================
            var receipt = new HandoverReceipt
            {
                ReceiptId = Guid.NewGuid(),
                ReceiptNumber = receiptNumber,
                ReceiptVersion = receiptVersion,
                CaseId = caseId,
                BundleId = vault.BundleId,
                GrantId = grant.Id,
                SessionId = sessionId,
                BeneficiaryId = recipientId,
                BeneficiaryName = $"Người Nhận ({recipientId.ToString()[..6]})",
                ExecutorId = executorId,
                ReceivedAt = receivedAt,
                ServerServedAssetIds = serverServedAssetIds,
                ClientConfirmedAssetIds = clientConfirmedAssetIds,
                DownloadedAssetIds = clientConfirmedAssetIds,
                TotalAssetsCount = mandatoryAssets.Count,
                LegalDeclaration = request.LegalDeclaration,
                SignatureType = "ELECTRONIC_RECEIPT_SIGNATURE",
                RecipientSignatureData = sigData,
                SignatureHash = signatureHash,
                ReceiptContentHash = receiptContentHash,
                ReceiptAuditDigest = auditDigest,
                DigitalSignatureAudit = auditDigest
            };

            _receipts[receipt.ReceiptId] = receipt;
            _receiptsByGrantAndRecipient[(grant.Id, recipientId)] = receipt;

            // 7. Đóng quyền của riêng recipient này (Grant -> FINALIZED)
            grant.Status = AccessGrantStatus.FINALIZED;

            // 8. Thu hồi phiên khách của riêng recipient này
            if (!string.IsNullOrEmpty(request.GuestToken) && _guestSessions.TryGetValue(request.GuestToken, out var gs))
            {
                gs.Status = GuestSessionStatus.COMPLETED;
                gs.IsFinalized = true;
                gs.FinalizedAt = DateTime.UtcNow;
                gs.ReceiptId = receipt.ReceiptId;
            }

            // 9. Kiểm tra các đồng sở hữu khác có còn đang hoạt động không
            var otherCoRecipients = vault.DesignatedRecipientIds.Where(id => id != recipientId).ToList();
            bool areOtherBeneficiariesStillActive = otherCoRecipients.Any(otherId =>
                !_receiptsByGrantAndRecipient.ContainsKey((grant.Id, otherId)) &&
                _grants.TryGetValue((vault.BundleId, otherId), out var otherG) &&
                otherG.Status == AccessGrantStatus.ACTIVE);

            // B tải xong và hoàn tất chỉ đóng phiên của B, không đóng quyền hoặc phiên của C!
            if (!areOtherBeneficiariesStillActive && session != null)
            {
                session.Status = VideoSessionStatus.COMPLETED;
                session.EndedAt = DateTime.UtcNow;
                shouldCloseRoom = true;
                roomToClose = session.ProviderRoomId;
            }

            _logger.LogInformation("BÀN GIAO HOÀN TẤT CHO B: Beneficiary {BeneficiaryId} đã ký nhận kho {BundleId}. Hash: {Hash}. SigHash: {SigHash}. Grant: FINALIZED. Đồng thừa kế khác còn hoạt động: {OthersActive}",
                recipientId, vault.BundleId, receiptContentHash, signatureHash, areOtherBeneficiariesStillActive);

            response = new FinalizeHandoverResponse
            {
                Success = true,
                Message = "Đã ghi nhận xác nhận và tạo biên nhận điện tử trong phiên làm việc.",
                Receipt = MapToReceiptDto(receipt),
                IsRoomClosed = false, // Cập nhật sau khi LiveKit phản hồi
                RoomStatus = shouldCloseRoom ? "CLOSING" : "OPEN",
                IsGuestSessionRevoked = true,
                IsRecipientGrantFinalized = true,
                AreOtherBeneficiariesStillActive = areOtherBeneficiariesStillActive
            };
        } // lock

        // =========================================================================
        // 10. GỌI LIVEKIT XÓA PHÒNG NẾU TẤT CẢ CÁC BÊN ĐÃ HOÀN TẤT
        // Đợi LiveKit xác nhận trước khi báo CLOSED
        // =========================================================================
        if (shouldCloseRoom && !string.IsNullOrEmpty(roomToClose))
        {
            try
            {
                var closed = await _liveKitService.DeleteRoomAsync(roomToClose);
                response.IsRoomClosed = closed;
                response.RoomStatus = closed ? "CLOSED" : "CLOSING";
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Không thể xóa phòng LiveKit {RoomName}", roomToClose);
                response.IsRoomClosed = false;
                response.RoomStatus = "FAILED_TO_CLOSE";
            }
        }

        return response;
    }

    private static HandoverReceiptDto MapToReceiptDto(HandoverReceipt receipt) => new()
    {
        ReceiptId = receipt.ReceiptId,
        ReceiptNumber = receipt.ReceiptNumber,
        ReceiptVersion = receipt.ReceiptVersion,
        CaseId = receipt.CaseId,
        BundleId = receipt.BundleId,
        GrantId = receipt.GrantId,
        SessionId = receipt.SessionId,
        BeneficiaryId = receipt.BeneficiaryId,
        BeneficiaryName = receipt.BeneficiaryName,
        ExecutorId = receipt.ExecutorId,
        ReceivedAt = receipt.ReceivedAt,
        DownloadedAssetsCount = receipt.ClientConfirmedAssetIds.Count > 0 ? receipt.ClientConfirmedAssetIds.Count : receipt.DownloadedAssetIds.Count,
        TotalAssetsCount = receipt.TotalAssetsCount,
        ServerServedAssetIds = receipt.ServerServedAssetIds,
        ClientConfirmedAssetIds = receipt.ClientConfirmedAssetIds,
        LegalDeclaration = receipt.LegalDeclaration,
        SignatureType = receipt.SignatureType,
        RecipientSignatureData = receipt.RecipientSignatureData,
        SignatureHash = receipt.SignatureHash,
        ReceiptContentHash = receipt.ReceiptContentHash,
        ReceiptAuditDigest = receipt.ReceiptAuditDigest,
        DigitalSignatureAudit = receipt.DigitalSignatureAudit
    };

    public Task<bool> RecordAssetDownloadAsync(string downloadToken, Guid assetId)
    {
        lock (_lockObj)
        {
            if (string.IsNullOrWhiteSpace(downloadToken))
                return Task.FromResult(false);

            if (_grantsByDownloadToken.TryGetValue(downloadToken, out var grant))
            {
                if (grant.Status == AccessGrantStatus.ACTIVE && DateTime.UtcNow <= grant.ExpiresAt)
                {
                    _verifiedAssetDownloads[(grant.Id, assetId)] = DateTime.UtcNow;
                    _logger.LogInformation("ĐÃ XÁC THỰC TẢI TÀI SẢN: Asset {AssetId} cho Grant {GrantId} (Recipient {RecipientId}).",
                        assetId, grant.Id, grant.RecipientId);
                    return Task.FromResult(true);
                }
            }

            return Task.FromResult(false);
        }
    }

    public Task<AssetDownloadResultDto> VerifyAndServeEncryptedAssetAsync(Guid bundleId, Guid assetId, string? downloadToken)
    {
        lock (_lockObj)
        {
            if (string.IsNullOrWhiteSpace(downloadToken))
            {
                return Task.FromResult(new AssetDownloadResultDto
                {
                    Success = false,
                    StatusCode = 401,
                    ErrorMessage = "Yêu cầu Download Token hợp lệ để tải dữ liệu di sản bản mã."
                });
            }

            if (!_grantsByDownloadToken.TryGetValue(downloadToken, out var grant))
            {
                return Task.FromResult(new AssetDownloadResultDto
                {
                    Success = false,
                    StatusCode = 401,
                    ErrorMessage = "Download Token không hợp lệ hoặc không tồn tại."
                });
            }

            // 1. Kiểm tra Rescue Hold khẩn cấp trước tiên
            var timeLockStatus = _timeLockRescueService.GetStatus(grant.CaseId);
            bool isRescueHeld = (_caseActiveHoldMap.TryGetValue(grant.CaseId, out var holdId) &&
                                 _holds.TryGetValue(holdId, out var hold) && hold.IsActive) ||
                                grant.Status == AccessGrantStatus.SUSPENDED_RESCUE_HOLD ||
                                timeLockStatus.Status == CaseStatus.RESCUE_PENDING;

            if (isRescueHeld)
            {
                return Task.FromResult(new AssetDownloadResultDto
                {
                    Success = false,
                    StatusCode = 423, // Locked
                    ErrorMessage = "Kho di sản đang bị tạm giữ khẩn cấp (Rescue Hold) bởi chủ sở hữu. Quyền tải bị đóng băng."
                });
            }

            // 2. Kiểm tra trạng thái Active và thời hạn
            if (grant.Status != AccessGrantStatus.ACTIVE)
            {
                return Task.FromResult(new AssetDownloadResultDto
                {
                    Success = false,
                    StatusCode = 403,
                    ErrorMessage = $"Quyền truy cập (AccessGrant) không ở trạng thái ACTIVE (Trạng thái hiện tại: {grant.Status})."
                });
            }

            if (DateTime.UtcNow > grant.ExpiresAt)
            {
                return Task.FromResult(new AssetDownloadResultDto
                {
                    Success = false,
                    StatusCode = 403,
                    ErrorMessage = "Quyền truy cập tải dữ liệu đã hết hạn (sau 7 ngày)."
                });
            }

            if (grant.BundleId != bundleId && grant.CaseId != bundleId)
            {
                return Task.FromResult(new AssetDownloadResultDto
                {
                    Success = false,
                    StatusCode = 403,
                    ErrorMessage = "Download Token không thuộc kho di sản này."
                });
            }

            var vault = GetOrCreateVaultConfig(grant.BundleId, grant.CaseId, grant.RecipientId);
            var asset = vault.Assets.FirstOrDefault(a => a.AssetId == assetId);
            if (asset == null)
            {
                return Task.FromResult(new AssetDownloadResultDto
                {
                    Success = false,
                    StatusCode = 404,
                    ErrorMessage = $"Tệp di sản {assetId} không thuộc danh mục của kho này."
                });
            }

            // Ghi nhận lịch sử phục vụ tải tệp từ máy chủ
            _verifiedAssetDownloads[(grant.Id, assetId)] = DateTime.UtcNow;
            _logger.LogInformation("SERVER SERVED ASSET: Đã phục vụ và xác thực tải tệp '{Title}' ({AssetId}) cho Grant {GrantId} (Recipient {RecipientId}).",
                asset.Title, asset.AssetId, grant.Id, grant.RecipientId);

            // Sinh dữ liệu bản mã có cấu trúc envelope bảo mật
            var header = System.Text.Encoding.UTF8.GetBytes($"[LV-ENCRYPTED-AES256GCM:BUNDLE-{grant.BundleId:N}:ASSET-{asset.AssetId:N}]");
            var payload = new byte[header.Length + 64];
            Buffer.BlockCopy(header, 0, payload, 0, header.Length);
            for (int i = header.Length; i < payload.Length; i++)
            {
                payload[i] = (byte)((i * 41) % 256);
            }

            return Task.FromResult(new AssetDownloadResultDto
            {
                Success = true,
                StatusCode = 200,
                FileName = asset.Title.EndsWith(".enc") ? asset.Title : $"{asset.Title}.enc",
                ContentType = "application/octet-stream",
                EncryptedData = payload
            });
        }
    }

    public Task<GuestHandoverSession> GetOrCreateGuestSessionAsync(Guid caseId, Guid beneficiaryId, Guid executorId, Guid sessionId)
    {
        lock (_lockObj)
        {
            // Invitation never creates a vault or changes recipient designation.
            if (!_vaultConfigs.TryGetValue(caseId, out var vault))
                throw new KeyNotFoundException("Chưa có snapshot người nhận cho gói bàn giao.");
            if (!vault.DesignatedRecipientIds.Contains(beneficiaryId))
                throw new RecipientNotInSnapshotException();
            if (vault.AssignedExecutorId == Guid.Empty || vault.AssignedExecutorId != executorId)
                throw new UnauthorizedAccessException("Executor không được phân công cho gói này.");
            if (!_sessions.TryGetValue(sessionId, out var workSession) || workSession.CaseId != vault.CaseId)
                throw new UnauthorizedAccessException("Phiên họp không thuộc hồ sơ của gói này.");
            var existing = _guestSessions.Values.FirstOrDefault(g => g.BundleId == vault.BundleId &&
                g.SessionId == sessionId && g.BeneficiaryId == beneficiaryId && g.ExecutorId == executorId &&
                g.Status == GuestSessionStatus.ACTIVE && g.ExpiresAt > DateTime.UtcNow);
            if (existing != null) return Task.FromResult(existing);
            _invitedBundles.Add(vault.BundleId);

            var guestSession = new GuestHandoverSession
            {
                GuestToken = $"gst_{Guid.NewGuid():N}",
                CaseId = vault.CaseId,
                BundleId = vault.BundleId,
                SessionId = sessionId,
                BeneficiaryId = beneficiaryId,
                ExecutorId = executorId,
                Status = GuestSessionStatus.ACTIVE,
                CreatedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };

            _guestSessions[guestSession.GuestToken] = guestSession;
            return Task.FromResult(guestSession);
        }
    }

    public Task<GuestHandoverSession?> ValidateGuestSessionAsync(string guestToken, bool allowCompleted = false)
    {
        if (string.IsNullOrWhiteSpace(guestToken))
            return Task.FromResult<GuestHandoverSession?>(null);

        if (_guestSessions.TryGetValue(guestToken, out var session))
        {
            if (DateTime.UtcNow < session.ExpiresAt)
            {
                if (session.Status == GuestSessionStatus.ACTIVE)
                {
                    return Task.FromResult<GuestHandoverSession?>(session);
                }

                // Cho phép retry idempotency an toàn nếu phiên đã hoàn tất
                if (allowCompleted && session.Status == GuestSessionStatus.COMPLETED)
                {
                    return Task.FromResult<GuestHandoverSession?>(session);
                }
            }
        }

        return Task.FromResult<GuestHandoverSession?>(null);
    }

    private static DecryptionKeyMaterialDto GenerateMockDecryptionKeyMaterial() => new()
    {
        KeyAlgorithm = "AES-GCM-256",
        KeyDerivationSalt = "c2FsdF9leGFtcGxlX3B3ZGI=",
        InitializationVector = "dXVuZ19pdl9zYW1wbGU=",
        WrappedKeyEnvelope = "ZK-ENVELOPE-KEY-9f8a3c2e1b4d5e6f7a8b9c0d1e2f3a4b",
        KeyLengthBits = 256,
        ChannelSecurity = "[MÔ PHỎNG PROTOTYPE] Zero-Knowledge Isolated HTTPS REST; Decrypted Strictly in Client Memory (Mock Payload)"
    };

    private static ScheduleVideoSessionResponse MapToScheduleResponse(VideoSession s) => new()
    {
        SessionId = s.Id,
        CaseId = s.CaseId,
        ProviderRoomId = s.ProviderRoomId,
        Status = s.Status,
        Purpose = s.Purpose,
        RequestedAt = s.RequestedAt,
        ScheduledAt = s.ScheduledAt,
        SubjectUserId = s.SubjectUserId,
        AssignedVerifierId = s.AssignedVerifierId
    };

    private static VideoSessionDetailDto MapToDetailDto(VideoSession s) => new()
    {
        SessionId = s.Id,
        CaseId = s.CaseId,
        ProviderRoomId = s.ProviderRoomId,
        Purpose = s.Purpose,
        Status = s.Status,
        RequestedAt = s.RequestedAt,
        ScheduledAt = s.ScheduledAt,
        StartedAt = s.StartedAt,
        EndedAt = s.EndedAt,
        AssignedVerifierId = s.AssignedVerifierId,
        SubjectUserId = s.SubjectUserId,
        VerificationOutcome = s.VerificationOutcome,
        ChecklistJson = s.ChecklistJson,
        VerifierNotes = s.VerifierNotes,
        EvaluatedAt = s.EvaluatedAt,
        Participants = s.Participants.ToList()
    };
}

