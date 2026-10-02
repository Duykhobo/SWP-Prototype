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
