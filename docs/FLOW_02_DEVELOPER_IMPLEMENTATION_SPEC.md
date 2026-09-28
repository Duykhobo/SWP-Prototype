# ĐẶC TẢ CHI TIẾT TRIỂN KHAI CODE CHO LẬP TRÌNH VIÊN (DEVELOPER CODE SPEC)
## FLOW 02 · CHỦ KHO THIẾT LẬP VÀ KÍCH HOẠT KẾ HOẠCH DI SẢN
**Ánh xạ trực tiếp từ Sơ đồ Swimlane draw.io**: `FLOW 02` (Gồm 6 Làn bơi & 6 Nhánh lỗi E1 - E6)  
**Tiêu chuẩn kiến trúc**: Clean Architecture .NET 8, React 19, Cloudflare R2, MailKit, SePay

---

## 1. MỤC TIÊU & QUY ƯỚC NGHIỆP VỤ BẮT BUỘC
* **Điều kiện đầu vào**: Owner đã đăng nhập thành công theo Flow 01 (có Access Token trong RAM).
* **Kết thúc luồng**: Kế hoạch chuyển trạng thái `ACTIVE` nguyên tử (Atomic); **tuyệt đối không gửi lời mời nhận tài sản cho Beneficiary lúc thiết lập** (chỉ lưu chỉ định trong manifest).
* **Quy ước đường rẽ nhánh**:
  * **Đường xanh liền (Có)**: Luồng nghiệp vụ thuận lợi (Happy Path).
  * **Đường đỏ nét đứt (Không)**: Rơi vào nhánh xử lý lỗi (E1 $\rightarrow$ E6). Giữ nguyên trạng thái `DRAFT`, trả về thông báo cụ thể để sửa tại bước được chỉ định.

---

## 2. BẢNG ĐẶC TẢ CHI TIẾT TỪNG BƯỚC CHO LẬP TRÌNH VIÊN (DEV IMPLEMENTATION MATRIX)

### BƯỚC 01 $\rightarrow$ 02: CHỌN GÓI VÀ KIỂM TRA THANH TOÁN (DECISION 13 & LỖI E1)

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `OWNER · CHỦ KHO` (Node 11) $\rightarrow$ `BACKEND LEGACYVAULT` (Node 12 & 13) |
| **Frontend Code** | `client/src/features/payment-sepay/SePayTestbench.tsx`<br/>• Component chọn gói: `Free` (0đ), `XS` (199.000đ), `XS Max` (499.000đ).<br/>• Gọi API: `POST /api/v1/plans/select-tier` |
| **Backend API** | `server/LegacyVault.Prototype.WebApi/Controllers/PlanController.cs`<br/>• `[HttpPost("select-tier")]`<br/>• `[HttpGet("current-subscription")]` |
| **Logic nghiệp vụ (Code Check)** | ```csharp
var subscription = await _planService.GetActiveSubscriptionAsync(ownerId);
if (subscription == null || subscription.IsExpired || subscription.Tier == PlanTier.Free)
{
    // RƠI VÀO NHÁNH E1 (Node 32)
    return BadRequest(new ErrorResponse {
        ErrorCode = "E1_SUBSCRIPTION_INVALID",
        Message = "Gói Free chỉ được lưu tài sản cá nhân, không thể thiết lập di sản. Vui lòng mua hoặc gia hạn gói XS / XS Max.",
        ActionRequired = "REDIRECT_TO_PAYMENT"
    });
}
``` |
| **Xử lý nhánh lỗi E1** | • Giữ kế hoạch ở trạng thái chưa kích hoạt (`PlanState = INACTIVE`).<br/>• Gói Free không lưu nháp Người thụ hưởng và Executor.<br/>• Điều hướng sang màn hình thanh toán SePay QR Code (`/api/v1/payment/sepay-qr`). |

---

### BƯỚC 03 $\rightarrow$ 05: TẢI TÀI SẢN, VALIDATE VÀ MÃ HÓA R2 (DECISION 16, 19 & LỖI E2, E3)

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `OWNER` (Node 14) $\rightarrow$ `ỨNG DỤNG WEB` (Node 15) $\rightarrow$ `BACKEND` (Node 16, 17, 19) $\rightarrow$ `R2 KHO BẢN MÃ` (Node 18) |
| **Frontend Code** | `client/src/features/crypto-envelope/CryptoEnvelopeTestbench.tsx`<br/>• Chặn file $> 20$ MiB trực tiếp tại client: `if (file.size > 20 * 1024 * 1024) throw Error;`<br/>• Phân loại tài sản vào 3 nhóm pháp lý (Kinh tế, Kỷ vật, Bí mật đời tư). |
| **Backend API** | `server/LegacyVault.Prototype.WebApi/Controllers/CryptoEnvelopeController.cs`<br/>• `[HttpPost("upload-and-encrypt")]` nhận `IFormFile file`, `string category`, `string metadata` |
| **Decision 16 (Validate)** | Kiểm tra định dạng tệp cho phép, tổng dung lượng kho $\le$ Quota của gói (XS: 1GB, XS Max: 10GB).<br/>$\rightarrow$ **Nếu vi phạm**: Trả lỗi **E2** (`E2_QUOTA_EXCEEDED` / `E2_INVALID_FILE_TYPE`), báo đúng trường bị sai, không tạo phiên bản tài sản dở dang, yêu cầu quay lại Bước 03. |
| **Bước 05 (Mã hóa)** | ```csharp
// 1. Sinh ngẫu nhiên khóa DEK 256-bit
byte[] dek = RandomNumberGenerator.GetBytes(32);
// 2. Mã hóa AES-256-GCM
using var aesGcm = new AesGcm(dek, tagSizeInBytes: 16);
byte[] nonce = RandomNumberGenerator.GetBytes(12);
byte[] ciphertext = new byte[plaintext.Length];
byte[] tag = new byte[16];
aesGcm.Encrypt(nonce, plaintext, ciphertext, tag);
// 3. Niêm phong DEK bằng Master KEK
byte[] encryptedDek = KekService.Encrypt(dek);
``` |
| **R2 Storage (Node 18)** | `server/.../Services/CloudflareR2StorageService.cs`<br/>• Đẩy luồng Ciphertext lên Cloudflare R2 qua AWS S3 Client (`PutObjectAsync`).<br/>• Key định danh: `vaults/{vaultId}/assets/{assetId}/v{version}.enc`. |
| **Decision 19 & Lỗi E3** | Kiểm tra `PutObjectResponse.HttpStatusCode == 200` và Transaction DB thành công.<br/>$\rightarrow$ **Nếu lỗi mạng/R2/DB (E3)**: Giữ trạng thái `Asset.State = DRAFT`, không đánh dấu `ACTIVE`. Backend thực hiện Idempotency Retry 3 lần. Nếu vẫn thất bại, gọi hàm dọn dẹp đối soát object mồ côi (`CleanOrphanR2ObjectAsync`). |

---

### BƯỚC 06 $\rightarrow$ 07: CHỈ ĐỊNH NGƯỜI THỤ HƯỞNG (BENEFICIARY) & MANIFEST (DECISION 22 & LỖI E4)

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `OWNER · CHỦ KHO` (Node 20) $\rightarrow$ `BACKEND LEGACYVAULT` (Node 21 & 22) |
| **Frontend Code** | Giao diện mapping danh sách Beneficiary: mỗi tài sản gán với 1 hoặc nhiều `person_id` kèm tỷ lệ phân bổ. |
| **Backend API** | `server/LegacyVault.Prototype.WebApi/Controllers/BeneficiaryController.cs`<br/>• `[HttpPost("assign-recipients")]`<br/>• DTO: `AssignBeneficiariesRequest { List<AssetAllocationDto> Allocations }` |
| **Quy tắc cốt lõi** | **TUYỆT ĐỐI KHÔNG GỬI THÔNG BÁO CHO BENEFICIARY Ở BƯỚC NÀY** để bảo vệ tính bảo mật di nguyện khi Chủ kho còn sống. Chỉ lưu thông tin vào bản kê số (`VaultManifest`). |
| **Decision 22 & Lỗi E4** | Backend kiểm tra `Allocations.Count > 0` và mỗi tài sản hợp lệ có ít nhất 1 người nhận hợp pháp.<br/>$\rightarrow$ **Nếu rỗng hoặc xung đột role (E4)**: Giữ lại chỉ định cũ nếu có; các tài sản chưa được gán được đánh dấu cờ `NOT_IN_ESTATE_PLAN`. Báo lỗi giao diện yêu cầu quay lại Bước 06. |

---

### BƯỚC 08 $\rightarrow$ 09: CHỌN EXECUTOR VÀ GỬI LỜI MỜI ỦY QUYỀN (DECISION 25 & LỖI E5)

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `OWNER` (Node 23) $\rightarrow$ `BACKEND` (Node 24) $\rightarrow$ `EXECUTOR` (Node 25) $\rightarrow$ `NHÁNH LỖI` (Node 36) |
| **Frontend Code** | Form nhập: Họ tên, Email, Số CCCD của Executor chính và tối thiểu 1 Executor dự phòng. |
| **Backend API** | `server/LegacyVault.Prototype.WebApi/Controllers/ExecutorController.cs`<br/>• `[HttpPost("invite-executor")]`<br/>• Sinh Token ủy quyền an toàn (hiệu lực 48 giờ).<br/>• Gọi `MailKitEmailService.SendExecutorInviteEmailAsync()`. |
| **Executor Action (Node 25)** | Executor mở email, nhấp link và bấm: **"Chấp nhận (Accept)"** hoặc **"Từ chối (Decline)"**. |
| **Decision 25 & Lỗi E5** | • **Nếu Đồng ý**: Cập nhật `ExecutorStatus = ACCEPTED`. Tiếp tục sang Bước 10.<br/>• **Nếu Từ chối / Quá 48h / Mất điều kiện (E5)**:<br/>  - Ghi vết `AuditLog` phản hồi từ chối.<br/>  - Hệ thống tự động kích hoạt **mời Executor dự phòng kế tiếp** trong danh sách.<br/>  - Không gửi email mời lặp lại cho cùng 1 người nếu họ đã chủ động từ chối. |

---

### BƯỚC 10 $\rightarrow$ 13: XÁC NHẬN CHÍNH SÁCH, CHECKLIST VÀ KÍCH HOẠT KẾ HOẠCH (DECISION 29, LỖI E6 & KẾT THÚC)

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `OWNER` (Node 26, 27) $\rightarrow$ `BACKEND` (Node 28, 29, 30) $\rightarrow$ `KẾT THÚC` (Node 31) |
| **Frontend Code** | Màn hình Review tổng quan (Bảng đối soát: Tên gói, số tài sản, danh sách phân bổ, Executor đã đồng ý).<br/>• Người dùng tích chọn: *"Tôi đã đọc, hiểu và đồng ý với cam kết pháp lý"* $\rightarrow$ Bấm nút **"Kích hoạt kế hoạch (Activate Plan)"**. |
| **Backend API** | `server/LegacyVault.Prototype.WebApi/Controllers/PlanController.cs`<br/>• `[HttpPost("activate")]`<br/>• Thực hiện kiểm tra toàn diện **SETUP-01 Checklist**: |
| **SETUP-01 Checklist (Decision 29)** | ```csharp
var checklist = new SetupChecklist {
    HasActiveSubscription = (plan.Tier == PlanTier.XS || plan.Tier == PlanTier.XSMax) && plan.ExpiryDate > DateTime.UtcNow,
    IsOwnerMfaVerified = session.IsMfaVerified,
    IsExecutorAccepted = plan.Executors.Any(e => e.Status == ExecutorStatus.Accepted),
    HasValidAssets = plan.Assets.Count(a => a.State == AssetState.EncryptedR2) >= 1,
    IsManifestValid = plan.Manifest != null && plan.Manifest.Allocations.Count > 0
};

if (!checklist.AllPassed)
{
    // RƠI VÀO NHÁNH LỖI E6 (Node 37)
    return UnprocessableEntity(new {
        ErrorCode = "E6_SETUP_CHECKLIST_FAILED",
        Checklist = checklist,
        Message = "Kế hoạch chưa đủ điều kiện kích hoạt. Vui lòng hoàn thành các mục chưa đạt trong Checklist."
    });
}
``` |
| **Xử lý nhánh lỗi E6** | Giữ kế hoạch ở trạng thái `DRAFT`. Trả danh sách checklist chi tiết về Web UI để đánh dấu đỏ các bước chưa hoàn tất (ví dụ: Chờ Executor nhận lời hoặc nạp thêm tài sản). |
| **Ghi nhận nguyên tử (Node 30 - Bước 13)** | ```csharp
using var tx = await _context.Database.BeginTransactionAsync(IsolationLevel.Serializable);
try {
    plan.State = PlanState.ACTIVE;
    plan.ActivatedAt = DateTime.UtcNow;
    plan.NextDmsHeartbeat = DateTime.UtcNow.AddDays(30);

    _context.AuditLogs.Add(new AuditLogEntry {
        Action = "PLAN_ACTIVATED_ATOMIC",
        UserId = ownerId,
        Timestamp = DateTime.UtcNow,
        Metadata = JsonSerializer.Serialize(new { plan.Id, ManifestHash = plan.Manifest.Sha256Hash })
    });

    await _context.SaveChangesAsync();
    await tx.CommitAsync();
} catch {
    await tx.RollbackAsync();
    throw;
}
``` |
| **KẾT THÚC (Node 31)** | Kế hoạch chính thức chuyển sang trạng thái **`ACTIVE`**. Bắt đầu khởi chạy bộ đếm thời gian **Dead Man's Switch (DMS Heartbeat)**. |

---

## 3. TÓM TẮT MÃ LỖI ĐỂ LẬP TRÌNH VIÊN CẤU HÌNH API (ERROR CODE CATALOG)

| Mã Lỗi | Tên Lỗi Chuẩn HTTP | HTTP Status Code | Phản hồi Frontend & Hướng Xử Lý |
| :--- | :--- | :--- | :--- |
| **E1** | `SUBSCRIPTION_INELIGIBLE` | `400 Bad Request` | Giữ chưa kích hoạt; chuyển hướng tới trang thanh toán gói XS / XS Max. |
| **E2** | `INVALID_INPUT_OR_QUOTA` | `422 Unprocessable` | Báo lỗi trường nhập hoặc dung lượng file $>20$ MiB; quay lại bước 03–04. |
| **E3** | `CRYPTO_STORAGE_FAILURE` | `502 Bad Gateway` | Giữ Draft; retry có Idempotency key; dọn dẹp file rác trên Cloudflare R2. |
| **E4** | `INVALID_RECIPIENT_MAPPING` | `400 Bad Request` | Giữ chỉ định cũ; đánh dấu tài sản chưa gán là `NOT_IN_ESTATE_PLAN`. |
| **E5** | `EXECUTOR_DECLINED_OR_TIMEOUT` | `200 OK (Business Warning)` | Ghi log audit; tự động gửi email mời Executor dự phòng kế tiếp. |
| **E6** | `SETUP_CHECKLIST_INCOMPLETE` | `422 Unprocessable` | Trả chi tiết checklist 5 điều kiện; giữ trạng thái Draft cho đến khi đủ. |
