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
    private readonly ConcurrentDictionary<Guid, AccessGrant> _grants = new(); // CaseId -> AccessGrant
    private readonly ConcurrentDictionary<Guid, EstateCommitment> _commitments = new(); // CommitmentId -> EstateCommitment
    private readonly ConcurrentDictionary<string, GuestHandoverSession> _guestSessions = new(); // GuestToken -> GuestHandoverSession
    private readonly ConcurrentDictionary<Guid, HandoverReceipt> _receipts = new(); // ReceiptId -> HandoverReceipt
    private readonly ConcurrentDictionary<Guid, HandoverReceipt> _caseReceipts = new(); // CaseId -> HandoverReceipt
    private readonly ConcurrentDictionary<Guid, bool> _executorAuthorizations = new(); // CaseId -> isAuthorized
    private readonly HashSet<string> _processedWebhookEvents = new();
    private readonly object _lockObj = new();

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

    public Task<JoinTokenResponse> GetJoinTokenAsync(Guid sessionId, Guid currentUserId)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
            throw new KeyNotFoundException($"Không tìm thấy phiên gọi {sessionId}.");

        // 1. Kiểm tra quyền truy cập nghiêm ngặt
        ParticipantRoleInCall role;
        string participantName;

        if (session.AssignedVerifierId == currentUserId)
        {
            role = ParticipantRoleInCall.HOST_VERIFIER;
            participantName = "Thẩm định viên (Verifier)";
        }
        else if (session.SubjectUserId == currentUserId)
        {
            role = ParticipantRoleInCall.SUBJECT_USER;
            participantName = session.Purpose == VideoSessionPurpose.OWNER_RESCUE ? "Chủ kho (Owner)" : "Người thi hành (Executor)";
        }
        else
        {
            throw new UnauthorizedAccessException("Người dùng không có quyền tham gia phiên gọi này.");
        }

        // Ghi nhận trước participant role nếu chưa tồn tại
        if (!session.Participants.Any(p => p.UserId == currentUserId))
        {
            session.Participants.Add(new VideoSessionParticipant
            {
                SessionId = session.Id,
                UserId = currentUserId,
                Role = role
            });
        }

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

        // 3. TTL ngắn: 5 phút để hoàn tất Handshake
        var ttl = TimeSpan.FromMinutes(5);
        var token = _liveKitService.GenerateJoinToken(
            roomName: session.ProviderRoomId,
            participantIdentity: currentUserId.ToString(),
            participantName: participantName,
            ttl: ttl);

        return Task.FromResult(new JoinTokenResponse
        {
            LiveKitUrl = _liveKitUrl,
            RoomName = session.ProviderRoomId,
            ParticipantIdentity = currentUserId.ToString(),
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

        if (request.Outcome == VerificationOutcome.PASS)
        {
            _timeLockRescueService.ApproveCaseForDelivery(session.CaseId);
        }

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
            if (_grants.TryGetValue(caseId, out var existingGrant) && existingGrant.Status == AccessGrantStatus.ACTIVE)
            {
                existingGrant.Status = AccessGrantStatus.SUSPENDED_RESCUE_HOLD;
                _logger.LogWarning("ACCESS GRANT SUSPENDED: Grant {GrantId} của Case {CaseId} đã bị đình chỉ do Rescue Hold kích hoạt.",
                    existingGrant.Id, caseId);
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
    // IN-CALL ESTATE HANDOVER CEREMONY
    // ==========================================

    public Task<HandoverEligibilityDto> GetHandoverEligibilityAsync(Guid caseOrSessionId, Guid currentUserId)
    {
        lock (_lockObj)
        {
            // Xác định Session & CaseId tương ứng
            var session = _sessions.Values.FirstOrDefault(s => s.Id == caseOrSessionId || s.CaseId == caseOrSessionId);
            var caseId = session?.CaseId ?? caseOrSessionId;

            // 1. Kiểm tra Active Rescue Hold
            CaseRescueHold? hold = null;
            var isRescueHeld = _caseActiveHoldMap.TryGetValue(caseId, out var holdId) &&
                               _holds.TryGetValue(holdId, out hold) &&
                               hold.IsActive;
            string? holdReason = isRescueHeld && hold != null ? hold.Reason : null;

            // 2. Kiểm tra Time-Lock từ Service
            var timeLock = _timeLockRescueService.GetStatus(caseId);
            bool isTimeLocked = timeLock.IsLocked && timeLock.RemainingSeconds > 0;

            // 3. Kiểm tra kết quả thẩm định Verifier / Người thực thi
            bool isExecutorAuthorized = _executorAuthorizations.TryGetValue(caseId, out var isAuth) && isAuth;
            bool isVerifierApproved = (session != null && session.VerificationOutcome == VerificationOutcome.PASS) || isExecutorAuthorized;

            // 4. Kiểm tra xem đã nhận trước đó chưa (Idempotency)
            AccessGrant? grant = null;
            bool isAlreadyAccepted = _grants.TryGetValue(caseId, out grant) &&
                                     grant.Status == AccessGrantStatus.ACTIVE;

            // Kiểm tra biên nhận hoàn tất nếu có
            _caseReceipts.TryGetValue(caseId, out var receipt);
            bool isFinalized = receipt != null;

            var blockReasons = new List<string>();

            if (isRescueHeld)
            {
                blockReasons.Add($"Hồ sơ đang tạm giữ bởi Chủ kho (Rescue Hold): {holdReason ?? "Yêu cầu cứu hộ khẩn cấp"}");
            }

            if (!isVerifierApproved && !isExecutorAuthorized)
            {
                blockReasons.Add(session == null 
                    ? "Chưa khởi tạo phiên làm việc trực tiếp." 
                    : "Người thực thi chưa xác nhận nhân thân & cho phép nhận di sản.");
            }

            if (isTimeLocked)
            {
                blockReasons.Add($"Khóa thời gian trễ (Time-Lock) chưa kết thúc. Thời gian còn lại: {timeLock.RemainingSeconds} giây.");
            }

            if (timeLock.Status == CaseStatus.CANCELLED_ALIVE)
            {
                blockReasons.Add("Hồ sơ đã bị hủy vĩnh viễn do Chủ kho được xác nhận còn sống.");
            }

            // Đủ điều kiện khi: Đã được Executor/Verifier cho phép, không có Rescue Hold, time-lock đã mở, Case hợp lệ
            bool canAccept = (isVerifierApproved || isExecutorAuthorized) && !isRescueHeld && !isTimeLocked && timeLock.Status != CaseStatus.CANCELLED_ALIVE;

            var assets = GetDefaultHandoverAssets(caseId);

            return Task.FromResult(new HandoverEligibilityDto
            {
                CaseId = caseId,
                SessionId = session?.Id ?? Guid.Empty,
                RecipientId = session?.SubjectUserId ?? currentUserId,
                CanAccept = canAccept,
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
                    SessionId = receipt.SessionId,
                    BeneficiaryId = receipt.BeneficiaryId,
                    BeneficiaryName = receipt.BeneficiaryName,
                    ReceivedAt = receipt.ReceivedAt,
                    DownloadedAssetsCount = receipt.DownloadedAssetIds.Count,
                    TotalAssetsCount = receipt.TotalAssetsCount,
                    LegalDeclaration = receipt.LegalDeclaration,
                    DigitalSignatureAudit = receipt.DigitalSignatureAudit
                } : null,
                Assets = assets,
                RegisteredDossier = new RegisteredBeneficiaryDossierDto
                {
                    BeneficiaryId = session?.SubjectUserId ?? currentUserId,
                    FullName = "Nguyễn Văn Người Nhận (Đã đăng ký trước)",
                    NationalIdMasked = "07909500**** (Khớp trên CSDL)",
                    RegisteredEmail = "nguoinhan.di-san@legacyvault.vn",
                    DesignatedRole = "Người thụ hưởng chính (Chỉ định bởi Owner)",
                    IsStrictlyBoundToPlan = true,
                    BindingNotice = "Ràng buộc chặt với Hồ sơ di sản ban đầu. Không cho phép thay đổi trong cuộc gọi."
                }
            });
        }
    }

    public Task<AcceptHandoverResponse> AcceptHandoverAsync(Guid caseOrSessionId, Guid currentUserId, AcceptHandoverRequest request)
    {
        lock (_lockObj)
        {
            var session = _sessions.Values.FirstOrDefault(s => s.Id == caseOrSessionId || s.CaseId == caseOrSessionId);
            var caseId = session?.CaseId ?? caseOrSessionId;

            // 1. Kiểm tra tuyệt đối: Rescue Hold có đang active? (Zero-Trust)
            CaseRescueHold? hold = null;
            if (_caseActiveHoldMap.TryGetValue(caseId, out var holdId) &&
                _holds.TryGetValue(holdId, out hold) &&
                hold.IsActive)
            {
                _logger.LogWarning("Từ chối nhận di sản: Case {CaseId} đang có Rescue Hold kích hoạt bởi Owner.", caseId);
                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = false,
                    Message = "Hồ sơ đang tạm giữ bởi Chủ kho (Rescue Hold). Toàn bộ thao tác bàn giao bị đình chỉ."
                });
            }

            // 2. Ràng buộc người nhận từ trước (Strict Beneficiary Binding - Chống chiếm tài khoản / đổi người)
            if (session != null && session.SubjectUserId != Guid.Empty && session.SubjectUserId != currentUserId)
            {
                _logger.LogWarning("Từ chối nhận di sản: Người gọi {CurrentUserId} không khớp với người thụ hưởng được chỉ định {ExpectedId}.",
                    currentUserId, session.SubjectUserId);
                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = false,
                    Message = "Tài khoản thực hiện không khớp với Người nhận được Chủ kho chỉ định trước trong hồ sơ di sản."
                });
            }

            // 3. Kiểm tra phê duyệt của Người thực thi (Executor) hoặc Verifier
            bool isExecutorAuthorized = _executorAuthorizations.TryGetValue(caseId, out var isAuth) && isAuth;
            bool isApproved = (session != null && session.VerificationOutcome == VerificationOutcome.PASS) || isExecutorAuthorized;

            if (!isApproved)
            {
                var outcomeStr = session?.VerificationOutcome.ToString() ?? "CHƯA_TỒN_TẠI";
                _logger.LogWarning("Từ chối nhận di sản: Case {CaseId} chưa được Người thực thi / Verifier xác nhận đạt. Outcome: {Outcome}",
                    caseId, outcomeStr);
                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = false,
                    Message = session?.VerificationOutcome == VerificationOutcome.INCONCLUSIVE
                        ? "Nghi ngờ bất thường hoặc chưa đủ căn cứ (INCONCLUSIVE). Chưa thể cấp khóa giải mã, yêu cầu chuyển hội đồng phúc tra."
                        : "Người thực thi chưa bấm 'Xác nhận người nhận & cho phép nhận di sản' trong phiên làm việc."
                });
            }

            // 4. Kiểm tra xác thực bổ sung yếu tố thứ 2 (Passkey / FIDO2 / Independent Credential)
            if (string.IsNullOrWhiteSpace(request.SecondFactorProof))
            {
                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = false,
                    Message = "Thiếu xác thực yếu tố thứ hai (Passkey/FIDO2). Cần xác thực độc lập để bảo vệ trước nguy cơ tài khoản bị chiếm đoạt."
                });
            }

            // 5. Kiểm tra Time-Lock
            var timeLock = _timeLockRescueService.GetStatus(caseId);
            if (timeLock.IsLocked && timeLock.RemainingSeconds > 0)
            {
                _logger.LogWarning("Từ chối nhận di sản: Time-Lock cho Case {CaseId} còn {Sec} giây.", caseId, timeLock.RemainingSeconds);
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

            // 4. Chống bấm lặp (Idempotency): Nếu đã có AccessGrant ACTIVE cho recipient này
            var assets = GetDefaultHandoverAssets(caseId);
            var keyMaterial = GenerateMockDecryptionKeyMaterial();

            if (_grants.TryGetValue(caseId, out var existingGrant) && existingGrant.Status == AccessGrantStatus.ACTIVE)
            {
                _logger.LogInformation("Người nhận gọi lại bàn giao cho Case {CaseId}. Trả về AccessGrant hiện có {GrantId}.",
                    caseId, existingGrant.Id);

                return Task.FromResult(new AcceptHandoverResponse
                {
                    Success = true,
                    Message = "Bạn đã hoàn tất tiếp nhận di sản trước đó. Quyền truy cập vẫn còn hiệu lực.",
                    CommitmentId = existingGrant.CommitmentId,
                    GrantId = existingGrant.Id,
                    GrantStatus = existingGrant.Status,
                    IssuedAt = existingGrant.IssuedAt,
                    ExpiresAt = existingGrant.ExpiresAt,
                    DownloadToken = existingGrant.DownloadToken,
                    Assets = assets,
                    DecryptionKeyMaterial = keyMaterial
                });
            }

            // 5. Ghi nhận Commitment pháp lý và tạo Grant mới trong cùng Lock/Transaction
            var commitment = new EstateCommitment
            {
                Id = Guid.NewGuid(),
                CaseId = caseId,
                SessionId = session.Id,
                RecipientId = currentUserId,
                CommittedAt = DateTime.UtcNow,
                LegalAcknowledgment = request.LegalAcknowledgment
                    ? "Đương sự cam kết đã đối chiếu nhân thân, xác nhận tiếp nhận gói di sản và chịu trách nhiệm pháp lý theo quy định."
                    : "Đương sự tiếp nhận di sản.",
                ClientIpAddress = request.ClientIpAddress,
                UserAgent = request.UserAgent
            };
            _commitments[commitment.Id] = commitment;

            var grant = new AccessGrant
            {
                Id = Guid.NewGuid(),
                CaseId = caseId,
                RecipientId = currentUserId,
                CommitmentId = commitment.Id,
                Status = AccessGrantStatus.ACTIVE,
                IssuedAt = DateTime.UtcNow,
                ExpiresAt = DateTime.UtcNow.AddHours(168), // Hiệu lực 7 ngày
                DownloadToken = Guid.NewGuid().ToString("N")
            };
            _grants[caseId] = grant;

            _logger.LogInformation("BÀN GIAO THÀNH CÔNG: Đã tạo Commitment {CommitmentId} và cấp AccessGrant {GrantId} cho Recipient {RecipientId} trên Case {CaseId}.",
                commitment.Id, grant.Id, currentUserId, caseId);

            return Task.FromResult(new AcceptHandoverResponse
            {
                Success = true,
                Message = "Xác nhận nhận di sản thành công! Vật liệu giải mã và danh sách tệp đã được cấp quyền.",
                CommitmentId = commitment.Id,
                GrantId = grant.Id,
                GrantStatus = grant.Status,
                IssuedAt = grant.IssuedAt,
                ExpiresAt = grant.ExpiresAt,
                DownloadToken = grant.DownloadToken,
                Assets = assets,
                DecryptionKeyMaterial = keyMaterial
            });
        }
    }

    public Task<DecryptionKeyMaterialDto> GetDecryptionKeyMaterialAsync(Guid caseOrSessionId, Guid currentUserId)
    {
        lock (_lockObj)
        {
            var session = _sessions.Values.FirstOrDefault(s => s.Id == caseOrSessionId || s.CaseId == caseOrSessionId);
            var caseId = session?.CaseId ?? caseOrSessionId;

            // Chặn tuyệt đối nếu có Rescue Hold
            if (_caseActiveHoldMap.TryGetValue(caseId, out var holdId) &&
                _holds.TryGetValue(holdId, out var hold) &&
                hold.IsActive)
            {
                throw new InvalidOperationException("Hồ sơ đang tạm giữ bởi Chủ kho. Không thể cấp phát vật liệu giải mã.");
            }

            if (!_grants.TryGetValue(caseId, out var grant))
            {
                throw new KeyNotFoundException("Chưa tìm thấy AccessGrant cho hồ sơ này. Vui lòng bấm 'Chấp nhận nhận di sản' trước.");
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

            // Chặn tuyệt đối nếu có Rescue Hold
            CaseRescueHold? hold = null;
            if (_caseActiveHoldMap.TryGetValue(caseId, out var holdId) &&
                _holds.TryGetValue(holdId, out hold) &&
                hold.IsActive)
            {
                throw new InvalidOperationException("Hồ sơ đang tạm giữ bởi Chủ kho (Rescue Hold). Không thể cấp quyền bàn giao.");
            }

            // Ghi nhận ủy quyền của Người thực thi (Executor)
            _executorAuthorizations[caseId] = true;

            // Nếu có session tương ứng, cập nhật Outcome = PASS để đồng bộ
            if (session != null)
            {
                session.VerificationOutcome = VerificationOutcome.PASS;
                session.EvaluatedAt = DateTime.UtcNow;
                session.VerifierNotes = request.ExecutorNotes ?? "Người thực thi đối chiếu hợp lệ và cho phép nhận di sản.";
                _timeLockRescueService.ApproveCaseForDelivery(caseId);
            }

            // Cập nhật các guest session liên quan
            foreach (var gs in _guestSessions.Values.Where(g => g.CaseId == caseId))
            {
                gs.IsExecutorAuthorized = true;
                gs.ExecutorAuthorizedAt = DateTime.UtcNow;
            }

            _logger.LogInformation("Người thực thi {ExecutorId} đã bấm 'Xác nhận người nhận & cho phép nhận di sản' cho Case {CaseId}.",
                executorId, caseId);

            return Task.FromResult(new AuthorizeRecipientResponse
            {
                Success = true,
                Message = "Đã xác nhận nhân thân người nhận. Người thụ hưởng hiện có thể bấm 'Chấp nhận & tải di sản'.",
                AuthorizedAt = DateTime.UtcNow,
                ExecutorId = executorId
            });
        }
    }

    public async Task<FinalizeHandoverResponse> FinalizeHandoverSessionAsync(
        Guid caseOrSessionId, 
        Guid beneficiaryId, 
        FinalizeHandoverRequest request)
    {
        VideoSession? sessionToClose = null;

        lock (_lockObj)
        {
            var session = _sessions.Values.FirstOrDefault(s => s.Id == caseOrSessionId || s.CaseId == caseOrSessionId);
            var caseId = session?.CaseId ?? caseOrSessionId;
            sessionToClose = session;

            // 1. Chống xử lý lặp (Idempotency)
            if (_caseReceipts.TryGetValue(caseId, out var existingReceipt))
            {
                return new FinalizeHandoverResponse
                {
                    Success = true,
                    Message = "Phiên bàn giao đã được xác nhận hoàn tất trước đó.",
                    Receipt = new HandoverReceiptDto
                    {
                        ReceiptId = existingReceipt.ReceiptId,
                        ReceiptNumber = existingReceipt.ReceiptNumber,
                        CaseId = existingReceipt.CaseId,
                        SessionId = existingReceipt.SessionId,
                        BeneficiaryId = existingReceipt.BeneficiaryId,
                        BeneficiaryName = existingReceipt.BeneficiaryName,
                        ReceivedAt = existingReceipt.ReceivedAt,
                        DownloadedAssetsCount = existingReceipt.DownloadedAssetIds.Count,
                        TotalAssetsCount = existingReceipt.TotalAssetsCount,
                        LegalDeclaration = existingReceipt.LegalDeclaration,
                        DigitalSignatureAudit = existingReceipt.DigitalSignatureAudit
                    },
                    IsRoomClosed = true,
                    IsGuestSessionRevoked = true
                };
            }

            // 2. Kiểm tra các file bắt buộc đã được tải/xử lý thành công chưa
            var mandatoryAssets = GetDefaultHandoverAssets(caseId).Where(a => a.IsMandatory).ToList();
            var missingAssets = mandatoryAssets.Where(m => !request.DownloadedAssetIds.Contains(m.AssetId)).ToList();
            if (missingAssets.Any())
            {
                throw new InvalidOperationException(
                    $"Chưa hoàn tất xử lý đủ các tệp di sản bắt buộc (Còn thiếu {missingAssets.Count} tệp). Vui lòng tải toàn bộ tệp trước khi kết thúc.");
            }

            // 3. Tạo Biên nhận điện tử (Handover Receipt)
            var receipt = new HandoverReceipt
            {
                ReceiptId = Guid.NewGuid(),
                ReceiptNumber = $"RCP-LV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}",
                CaseId = caseId,
                SessionId = session?.Id ?? Guid.Empty,
                BeneficiaryId = beneficiaryId,
                BeneficiaryName = "Nguyễn Văn Người Nhận (Chỉ định bởi Owner)",
                ExecutorId = session?.AssignedVerifierId ?? Guid.Empty,
                ReceivedAt = DateTime.UtcNow,
                DownloadedAssetIds = request.DownloadedAssetIds,
                TotalAssetsCount = mandatoryAssets.Count,
                LegalDeclaration = request.LegalDeclaration,
                DigitalSignatureAudit = $"SHA256:SIG-{Guid.NewGuid():N}"
            };

            _receipts[receipt.ReceiptId] = receipt;
            _caseReceipts[caseId] = receipt;

            // 4. Thu hồi phiên khách & đóng quyền cấp khóa mới
            if (!string.IsNullOrEmpty(request.GuestToken) && _guestSessions.TryGetValue(request.GuestToken, out var guestSession))
            {
                guestSession.Status = GuestSessionStatus.COMPLETED;
                guestSession.IsFinalized = true;
                guestSession.FinalizedAt = DateTime.UtcNow;
                guestSession.ReceiptId = receipt.ReceiptId;
            }

            _logger.LogInformation("BÀN GIAO HOÀN TẤT: Beneficiary {BeneficiaryId} đã ký xác nhận nhận đủ di sản trên Case {CaseId}. Receipt: {ReceiptNumber}",
                beneficiaryId, caseId, receipt.ReceiptNumber);

            return new FinalizeHandoverResponse
            {
                Success = true,
                Message = "Xác nhận hoàn tất thành công! Biên nhận điện tử đã được phát hành và lưu trữ vĩnh viễn.",
                Receipt = new HandoverReceiptDto
                {
                    ReceiptId = receipt.ReceiptId,
                    ReceiptNumber = receipt.ReceiptNumber,
                    CaseId = receipt.CaseId,
                    SessionId = receipt.SessionId,
                    BeneficiaryId = receipt.BeneficiaryId,
                    BeneficiaryName = receipt.BeneficiaryName,
                    ReceivedAt = receipt.ReceivedAt,
                    DownloadedAssetsCount = receipt.DownloadedAssetIds.Count,
                    TotalAssetsCount = receipt.TotalAssetsCount,
                    LegalDeclaration = receipt.LegalDeclaration,
                    DigitalSignatureAudit = receipt.DigitalSignatureAudit
                },
                IsRoomClosed = true,
                IsGuestSessionRevoked = true
            };
        }
    }

    public Task<GuestHandoverSession> GetOrCreateGuestSessionAsync(Guid caseId, Guid beneficiaryId, Guid executorId, Guid sessionId)
    {
        lock (_lockObj)
        {
            var existing = _guestSessions.Values.FirstOrDefault(g => g.CaseId == caseId && g.BeneficiaryId == beneficiaryId && g.Status == GuestSessionStatus.ACTIVE);
            if (existing != null)
                return Task.FromResult(existing);

            var guestSession = new GuestHandoverSession
            {
                GuestToken = $"gst_{Guid.NewGuid():N}",
                CaseId = caseId,
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

    public Task<GuestHandoverSession?> ValidateGuestSessionAsync(string guestToken)
    {
        if (string.IsNullOrWhiteSpace(guestToken))
            return Task.FromResult<GuestHandoverSession?>(null);

        if (_guestSessions.TryGetValue(guestToken, out var session))
        {
            if (session.Status == GuestSessionStatus.ACTIVE && DateTime.UtcNow < session.ExpiresAt)
            {
                return Task.FromResult<GuestHandoverSession?>(session);
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
        ChannelSecurity = "Zero-Knowledge Isolated HTTPS REST; Decrypted Strictly in Client Memory"
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
