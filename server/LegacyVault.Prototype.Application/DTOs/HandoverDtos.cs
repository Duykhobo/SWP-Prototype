using LegacyVault.Prototype.Domain;
using LegacyVault.Prototype.Domain.Models;

namespace LegacyVault.Prototype.Application.DTOs;

public class HandoverEligibilityDto
{
    public Guid CaseId { get; set; }
    public Guid SessionId { get; set; }
    public Guid RecipientId { get; set; }
    public bool CanAccept { get; set; }
    public List<string> BlockReasons { get; set; } = new();

    // Điều kiện 1: Kết quả xác minh của Verifier
    public bool IsVerifierApproved { get; set; }
    public VerificationOutcome VerificationOutcome { get; set; }
    public string? VerifierNotes { get; set; }

    // Điều kiện 2: Trạng thái Time-Lock
    public bool IsTimeLocked { get; set; }
    public int TimeLockRemainingSeconds { get; set; }
    public DateTime? UnlockTargetTime { get; set; }

    // Điều kiện 3: Rescue Hold
    public bool IsRescueHeld { get; set; }
    public string? HoldReason { get; set; }

    // Điều kiện 4: Đã nhận chưa (Idempotency)
    public bool IsAlreadyAccepted { get; set; }
    public Guid? ExistingGrantId { get; set; }

    // Điều kiện 5: Người thực thi (Executor) cho phép nhận
    public bool IsExecutorAuthorized { get; set; }
    public DateTime? ExecutorAuthorizedAt { get; set; }

    // Trạng thái hoàn tất phiên và Biên nhận
    public bool IsFinalized { get; set; }
    public HandoverReceiptDto? FinalReceipt { get; set; }

    // Danh sách tài sản trong gói
    public List<HandoverAssetItem> Assets { get; set; } = new();

    // Hồ sơ người nhận đã đăng ký từ trước bởi Owner (Chống giả mạo nhân thân)
    public RegisteredBeneficiaryDossierDto RegisteredDossier { get; set; } = new();

    // Tuyên bố tiêu chuẩn bảo mật theo NIST SP 800-63A
    public string SecurityDisclaimer { get; set; } = 
        "Lưu ý bảo mật (NIST SP 800-63A): Cuộc gọi video là nguồn bằng chứng hỗ trợ đối chiếu; chưa bảo đảm chống deepfake chuyên sâu. Quyền nhận di sản yêu cầu đồng thời: Verifier phê duyệt, ràng buộc hồ sơ gốc từ trước, xác thực yếu tố thứ 2 và giải tỏa Time-Lock.";
}

public class RegisteredBeneficiaryDossierDto
{
    public Guid BeneficiaryId { get; set; }
    public string FullName { get; set; } = "Nguyễn Văn Người Nhận";
    public string NationalIdMasked { get; set; } = "07909500****";
    public string RegisteredEmail { get; set; } = "nguoinhan.di-san@legacyvault.vn";
    public string DesignatedRole { get; set; } = "Người thụ hưởng chính (Primary Beneficiary)";
    public bool IsStrictlyBoundToPlan { get; set; } = true;
    public string BindingNotice { get; set; } = "Được Chủ kho chỉ định trước trong Di chúc điện tử. Không thể sửa đổi trong phiên gọi.";
}

public class AcceptHandoverRequest
{
    public bool LegalAcknowledgment { get; set; } = true;
    
    // Xác thực bổ sung (Yếu tố thứ 2 / Passkey / Biometrics độc lập với email)
    public string SecondFactorType { get; set; } = "PASSKEY_FIDO2"; // PASSKEY_FIDO2 | SECURITY_KEY | PIN_SIGNATURE
    public string? SecondFactorProof { get; set; } = "fido2-signature-proof-verified";
    
    public string? ClientIpAddress { get; set; }
    public string? UserAgent { get; set; }
}

public class AcceptHandoverResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public Guid? CommitmentId { get; set; }
    public Guid? GrantId { get; set; }
    public AccessGrantStatus? GrantStatus { get; set; }
    public DateTime? IssuedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public string? DownloadToken { get; set; }
    public List<HandoverAssetItem> Assets { get; set; } = new();
    public DecryptionKeyMaterialDto? DecryptionKeyMaterial { get; set; }
    public string DefenseInDepthAuditTrail { get; set; } = 
        "Đã kiểm tra đa lớp: Ràng buộc người nhận hợp lệ, Xác thực yếu tố thứ 2 đạt, Thẩm định video đạt, Time-Lock hoàn tất, Không có Rescue Hold.";
}

public class DecryptionKeyMaterialDto
{
    public string KeyAlgorithm { get; set; } = "AES-GCM-256";
    public string KeyDerivationSalt { get; set; } = string.Empty;
    public string InitializationVector { get; set; } = string.Empty;
    public string WrappedKeyEnvelope { get; set; } = string.Empty;
    public int KeyLengthBits { get; set; } = 256;
    public string ChannelSecurity { get; set; } = "Zero-Knowledge Isolated HTTPS REST; Decrypted Strictly in Client Memory";
}

public class AuthorizeRecipientRequest
{
    public string? ExecutorNotes { get; set; }
    public bool FaceMatched { get; set; } = true;
    public bool NationalIdMatched { get; set; } = true;
    public bool InteractiveChallengePassed { get; set; } = true;
}

public class AuthorizeRecipientResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public DateTime AuthorizedAt { get; set; }
    public Guid ExecutorId { get; set; }
}

public class FinalizeHandoverRequest
{
    public List<Guid> DownloadedAssetIds { get; set; } = new();
    public string LegalDeclaration { get; set; } = "Tôi xác nhận đã nhận đầy đủ và muốn kết thúc phiên.";
    public string? GuestToken { get; set; }
}

public class FinalizeHandoverResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public HandoverReceiptDto Receipt { get; set; } = new();
    public bool IsRoomClosed { get; set; } = true;
    public bool IsGuestSessionRevoked { get; set; } = true;
}

public class HandoverReceiptDto
{
    public Guid ReceiptId { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public Guid CaseId { get; set; }
    public Guid SessionId { get; set; }
    public Guid BeneficiaryId { get; set; }
    public string BeneficiaryName { get; set; } = string.Empty;
    public DateTime ReceivedAt { get; set; }
    public int DownloadedAssetsCount { get; set; }
    public int TotalAssetsCount { get; set; }
    public string LegalDeclaration { get; set; } = string.Empty;
    public string DigitalSignatureAudit { get; set; } = string.Empty;
}
