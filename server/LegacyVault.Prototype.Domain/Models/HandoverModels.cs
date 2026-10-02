namespace LegacyVault.Prototype.Domain.Models;

/// <summary>
/// Cấu hình và trạng thái của Kho di sản bàn giao (Bundle/Vault)
/// Hỗ trợ cả 1 người nhận (SINGLE_RECIPIENT) và nhóm đồng sở hữu (CO_OWNED) theo SRS v3.11.0.
/// </summary>
public class HandoverVaultConfig
{
    public Guid BundleId { get; set; } = Guid.NewGuid();
    public Guid CaseId { get; set; }
    public string BundleName { get; set; } = "Kho di sản chung";
    public RecipientMode RecipientMode { get; set; } = RecipientMode.CO_OWNED;
    public HashSet<Guid> DesignatedRecipientIds { get; set; } = new();
    public HandoverStatus Status { get; set; } = HandoverStatus.PENDING_RESPONSE;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResponseDeadlineUtc { get; set; } // Hạn 7 ngày ban đầu
    public DateTime? FreezeStartedAt { get; set; }
    public DateTime? ReconsiderationExpiresAt { get; set; } // Hạn suy nghĩ lại 2 năm
    public Guid AssignedExecutorId { get; set; } = Guid.Empty;
    public List<HandoverAssetItem> Assets { get; set; } = new();
}

/// <summary>
/// Quyết định tiếp nhận của từng người nhận đối với một kho bàn giao cụ thể
/// </summary>
public class RecipientHandoverDecision
{
    public Guid BundleId { get; set; }
    public Guid RecipientId { get; set; }
    public string RecipientName { get; set; } = string.Empty;
    public BeneficiaryDecisionType Decision { get; set; } = BeneficiaryDecisionType.PENDING;
    public DateTime? DecidedAt { get; set; }
    public bool LegalAcknowledgment { get; set; }
    public string? SecondFactorProof { get; set; }
    public string? RejectionReason { get; set; }
    public string? ClientIpAddress { get; set; }
    public string? UserAgent { get; set; }
}

/// <summary>
/// Xác nhận của Executor cho đúng người nhận và đúng kho (không phê duyệt toàn Case)
/// </summary>
public class ExecutorRecipientAuthorization
{
    public Guid BundleId { get; set; }
    public Guid RecipientId { get; set; }
    public Guid ExecutorId { get; set; }
    public bool IsAuthorized { get; set; } = true;
    public DateTime AuthorizedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
    public bool FaceMatched { get; set; } = true;
    public bool NationalIdMatched { get; set; } = true;
    public bool InteractiveChallengePassed { get; set; } = true;
}

/// <summary>
/// Biên bản cam kết pháp lý khi người nhận chấp nhận di sản
/// </summary>
public class EstateCommitment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseId { get; set; }
    public Guid BundleId { get; set; }
    public Guid SessionId { get; set; }
    public Guid RecipientId { get; set; }
    public DateTime CommittedAt { get; set; } = DateTime.UtcNow;
    public string LegalAcknowledgment { get; set; } = string.Empty;
    public string? ClientIpAddress { get; set; }
    public string? UserAgent { get; set; }
}

/// <summary>
/// Quyền giải mã và tải dữ liệu di sản (TTL 168 giờ)
/// Cấp riêng cho từng người nhận đối với từng kho bàn giao
/// </summary>
public class AccessGrant
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BundleId { get; set; }
    public Guid CaseId { get; set; }
    public Guid RecipientId { get; set; }
    public Guid CommitmentId { get; set; }
    public AccessGrantStatus Status { get; set; } = AccessGrantStatus.ACTIVE;
    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(168); // 7 ngày
    public string DownloadToken { get; set; } = Guid.NewGuid().ToString("N");
}

/// <summary>
/// Mục tài sản trong gói di sản bàn giao
/// </summary>
public class HandoverAssetItem
{
    public Guid AssetId { get; set; } = Guid.NewGuid();
    public string Title { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty; // "Mật khẩu & Khóa", "Bất động sản", "Tài chính"
    public long FileSizeBytes { get; set; }
    public string CiphertextHash { get; set; } = string.Empty;
    public string MimeType { get; set; } = "application/octet-stream";
    public string DownloadEndpoint { get; set; } = string.Empty;
    public bool IsMandatory { get; set; } = true;
}

public enum GuestSessionStatus
{
    ACTIVE,
    IN_CALL,
    COMPLETED,
    REVOKED,
    EXPIRED
}

/// <summary>
/// Phiên khách giới hạn dành cho người thụ hưởng (không cần đăng nhập Google)
/// Ràng buộc chính xác người nhận và phần di sản được chỉ định.
/// </summary>
public class GuestHandoverSession
{
    public string GuestToken { get; set; } = Guid.NewGuid().ToString("N");
    public Guid CaseId { get; set; }
    public Guid BundleId { get; set; }
    public Guid SessionId { get; set; }
    public Guid BeneficiaryId { get; set; }
    public string BeneficiaryName { get; set; } = "Người Thụ Hưởng Được Chỉ Định";
    public string NationalIdMasked { get; set; } = "07909500****";
    public Guid ExecutorId { get; set; }
    public GuestSessionStatus Status { get; set; } = GuestSessionStatus.ACTIVE;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } = DateTime.UtcNow.AddHours(24);
    public bool IsExecutorAuthorized { get; set; }
    public DateTime? ExecutorAuthorizedAt { get; set; }
    public bool IsFinalized { get; set; }
    public DateTime? FinalizedAt { get; set; }
    public Guid? ReceiptId { get; set; }
}

/// <summary>
/// Biên nhận điện tử bàn giao di sản số sau khi người nhận bấm xác nhận hoàn tất
/// Ràng buộc theo (GrantId + RecipientId)
/// </summary>
public class HandoverReceipt
{
    public Guid ReceiptId { get; set; } = Guid.NewGuid();
    public string ReceiptNumber { get; set; } = $"RCP-LV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
    public string ReceiptVersion { get; set; } = "1.1";
    public Guid CaseId { get; set; }
    public Guid BundleId { get; set; }
    public Guid GrantId { get; set; }
    public Guid SessionId { get; set; }
    public Guid BeneficiaryId { get; set; }
    public string BeneficiaryName { get; set; } = string.Empty;
    public Guid ExecutorId { get; set; }
    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
    
    // Tách bạch: Log máy chủ đã phục vụ file & Xác nhận người nhận đã tải/mở được file
    public List<Guid> ServerServedAssetIds { get; set; } = new();
    public List<Guid> ClientConfirmedAssetIds { get; set; } = new();
    public List<Guid> DownloadedAssetIds { get; set; } = new(); // Giữ cho tương thích ngược
    public int TotalAssetsCount { get; set; }
    public string LegalDeclaration { get; set; } = "Tôi xác nhận đã nhận đầy đủ và muốn kết thúc phiên.";

    // Ký xác nhận biên nhận điện tử (Electronic Receipt Confirmation)
    public string SignatureType { get; set; } = "ELECTRONIC_RECEIPT_SIGNATURE";
    public string? RecipientSignatureData { get; set; } // Data URI (canvas chữ ký)
    public string SignatureHash { get; set; } = string.Empty; // SHA-256 thực của ảnh chữ ký
    public string ReceiptContentHash { get; set; } = string.Empty; // SHA-256 thực của nội dung biên nhận
    public string ReceiptAuditDigest { get; set; } = string.Empty; // SHA256:{hash}
    public string DigitalSignatureAudit { get; set; } = string.Empty; // Tương thích ngược
}
