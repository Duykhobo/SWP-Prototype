namespace LegacyVault.Prototype.Domain;

/// <summary>
/// Các gói dịch vụ chuẩn theo SRS v3.11.0 và mở rộng gói đa niên hạn (5 năm, 10 năm) của LegacyVault
/// </summary>
public enum SubscriptionTier
{
    OWNER_FREE,         // 0 đ / Vĩnh viễn (3 tài sản / 20 MiB - Không lập di sản)
    LEGACY_XS,          // 199.000 đ / 365 ngày (20 tài sản / 200 MiB - Lập di sản, bàn giao)
    LEGACY_XS_5Y,       // 799.000 đ / 1.825 ngày (25 tài sản / 250 MiB - Tiết kiệm 20%)
    LEGACY_XS_10Y,      // 1.290.000 đ / 3.650 ngày (30 tài sản / 300 MiB - Tiết kiệm 35%, khóa giá 10 năm)
    LEGACY_XS_MAX,      // 399.000 đ / 365 ngày (50 tài sản / 500 MiB - Xuất PDF kế hoạch an toàn)
    LEGACY_XS_MAX_5Y,   // 1.590.000 đ / 1.825 ngày (60 tài sản / 600 MiB - Tiết kiệm 20%)
    LEGACY_XS_MAX_10Y,  // 2.490.000 đ / 3.650 ngày (100 tài sản / 1.000 MiB - Tiết kiệm 38%)
    RECIPIENT_FREE,     // 0 đ / Vĩnh viễn (2 tài sản / 20 MiB - Lưu tài sản đã nhận)
    RECIPIENT_PLUS      // 49.000 đ / 30 ngày (10 tài sản / 200 MiB - Lưu tài sản đã nhận)
}

public enum PaymentStatus
{
    PENDING,
    PAID,
    EXPIRED,
    CANCELLED,
    FAILED
}

public enum CaseStatus
{
    DRAFT,
    UNDER_REVIEW,
    ADDITIONAL_DOCUMENTS_REQUIRED,
    APPROVED_FOR_DELIVERY,
    REJECTED,
    RESCUE_PENDING,
    CANCELLED_ALIVE
}

public enum RescueDecisionType
{
    APPROVED_ALIVE,
    REJECTED_FRAUD
}

public enum VaultStatus
{
    ACTIVE,
    CHECKIN_PENDING,
    CHECKIN_SUSPENDED,
    FROZEN_INACTIVITY,
    PURGED
}

public enum HandoverStatus
{
    PRE_BUNDLED,
    SNAPSHOTTED,
    WAITING_FOR_SCHEDULE,
    SCHEDULED,
    HANDOVER_STARTED,
    PENDING_RESPONSE,
    HANDOVER_COMMITTED,
    FROZEN_RECONSIDERATION,
    CANCELLED_WITHOUT_DELIVERY
}

public enum UserRole
{
    OWNER,
    EXECUTOR,
    VERIFIER,
    BENEFICIARY,
    ADMIN
}

public enum VideoSessionStatus
{
    REQUESTED,      // Đã tạo yêu cầu, chờ Verifier xác nhận lịch
    SCHEDULED,      // Đã chốt lịch hẹn
    WAITING,        // Mở phòng chờ (trước 10-15 phút để test mic/cam local)
    IN_PROGRESS,    // Đang diễn ra cuộc gọi
    COMPLETED,      // Kết thúc bình thường
    CANCELLED,      // Bị hủy trước giờ hẹn
    EXPIRED,        // Quá hạn không ai vào
    TERMINATED      // Bị ngắt cưỡng bức do vi phạm
}

public enum VideoSessionPurpose
{
    HANDOVER_VERIFICATION, // Thẩm định nhân thân Executor / nộp chứng tử
    OWNER_RESCUE           // Kháng nghị khẩn cấp "Tôi còn sống" của Owner
}

public enum VerificationOutcome
{
    PENDING,            // Chưa có kết luận
    PASS,               // Đối chiếu thành công
    FAIL,               // Nghi ngờ gian lận / giả mạo
    REQUIRE_MORE_DOCS,  // Yêu cầu bổ sung tài liệu
    INCONCLUSIVE        // Mạng yếu / cam hỏng / không thể kết luận (lên lịch lại)
}

public enum ParticipantRoleInCall
{
    HOST_VERIFIER,
    SUBJECT_USER,
    CO_BENEFICIARY,
    NOTARY_OBSERVER,
    OBSERVER
}

public enum BeneficiaryDecisionType
{
    PENDING,
    ACCEPTED,
    REJECTED
}

public enum AccessGrantStatus
{
    ACTIVE,
    SUSPENDED_RESCUE_HOLD,
    REVOKED,
    EXPIRED,
    FINALIZED
}

