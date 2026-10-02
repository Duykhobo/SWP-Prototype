namespace LegacyVault.Prototype.Domain.Models;

/// <summary>
/// Biên bản cam kết pháp lý khi người nhận chấp nhận di sản
/// </summary>
public class EstateCommitment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CaseId { get; set; }
    public Guid SessionId { get; set; }
    public Guid RecipientId { get; set; }
    public DateTime CommittedAt { get; set; } = DateTime.UtcNow;
    public string LegalAcknowledgment { get; set; } = string.Empty;
    public string? ClientIpAddress { get; set; }
    public string? UserAgent { get; set; }
}

/// <summary>
/// Quyền giải mã và tải dữ liệu di sản (TTL 168 giờ)
/// </summary>
public class AccessGrant
{
    public Guid Id { get; set; } = Guid.NewGuid();
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
/// </summary>
public class HandoverReceipt
{
    public Guid ReceiptId { get; set; } = Guid.NewGuid();
    public string ReceiptNumber { get; set; } = $"RCP-LV-{DateTime.UtcNow:yyyyMMdd}-{Guid.NewGuid().ToString()[..6].ToUpper()}";
    public Guid CaseId { get; set; }
    public Guid SessionId { get; set; }
    public Guid BeneficiaryId { get; set; }
    public string BeneficiaryName { get; set; } = string.Empty;
    public Guid ExecutorId { get; set; }
    public DateTime ReceivedAt { get; set; } = DateTime.UtcNow;
    public List<Guid> DownloadedAssetIds { get; set; } = new();
    public int TotalAssetsCount { get; set; }
    public string LegalDeclaration { get; set; } = "Tôi xác nhận đã nhận đầy đủ và muốn kết thúc phiên.";
    public string DigitalSignatureAudit { get; set; } = string.Empty;
}
