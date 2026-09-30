# MA TRẬN PHÂN QUYỀN VÀ BẢO MẬT API (PERMISSION MATRIX)

## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO TÀI SẢN SỐ
### Phiên bản: Chuẩn Hóa Theo SRS v3.11.0 (26/09/2026) — Nguyên Tắc Zero-Trust Authorization & Conflict-Free
### Công nghệ: ASP.NET Core 10 (.NET 10 LTS) Policy-Based Authorization & Resource-Based Handlers

---

## 1. NGUYÊN TẮC BẢO MẬT CỐT LÕI (ZERO-TRUST AUTHORIZATION)

1. **Tuyệt đối không dùng header từ client để quyết định phân quyền:**
   * `X-Active-Role`: Chỉ là ngữ cảnh hiển thị giao diện UI (Context Switcher). Backend kiểm tra phân quyền dựa 100% vào Claims trong JWT Token (`sub`, `roles`, `person_id`) và quan hệ dữ liệu thực tế trong SQL Server 2022.
   * `X-Demo-Mode`: Không được mở tính năng can thiệp dữ liệu. Các API giả lập Simulated Clock chỉ được bật trên môi trường `ASPNETCORE_ENVIRONMENT = Development` hoặc `Demo` với cờ cấu hình `EnableSimulatedClock = true` từ máy chủ.

2. **Quy tắc chống xung đột vai trò nghiêm ngặt theo Person ID (SRS 3.11.0):**
   * **Nguyên tắc tam quyền phân lập (Three-Person Separation):** Trong cùng một Kế hoạch di sản và Hồ sơ chứng tử, **Chủ sở hữu (Owner), Người thực thi (Executor) và Người xác minh (Verifier) bắt buộc là 3 `person_id` hoàn toàn khác nhau**.
   * **Quy tắc cấm lợi ích xung đột (No Beneficiary as Executor/Verifier):** **Executor hoặc Verifier TUYỆT ĐỐI CẤM đồng thời là Beneficiary (Người nhận) trong cùng hồ sơ di sản đó**. Hệ thống tự động truy vấn bảng `DesignationVersionRecipients` để từ chối ngay lập tức nếu phát hiện trùng `person_id`.
   * **Đặc quyền Quản trị viên (Admin):** Quản trị viên (`Admin`) chỉ có quyền vận hành hệ thống, cấu hình và đọc nhật ký kiểm toán Audit; **tuyệt đối không có API nào giải mã tài sản hoặc cấp khóa DEK cho Admin**.

3. **Tách biệt hoàn toàn Quyền tải tệp và Quota kho cá nhân (`DEL-02`, `PERSONAL-01` $\rightarrow$ `06`):**
   * **Tải tệp tin di sản:** Mọi Người nhận hợp lệ trong kho bàn giao (`HandoverVaults`) đã được kích hoạt đều có quyền tải bản sao toàn vẹn tệp tin **hoàn toàn miễn phí, không bị giới hạn và không tiêu tốn dung lượng quota**.
   * **Lưu vào Kho cá nhân (`PersonalVaults`):** Chỉ khi Người nhận chủ động bấm thao tác "Lưu vào Kho cá nhân" thì hệ thống mới kiểm tra hạn mức dung lượng gói lưu trữ (`StorageLimitMb`, `MaxAssets`) với ràng buộc `UNIQUE(PersonalVaultId, AssetId)`.

---

## 2. MA TRẬN PHÂN QUYỀN API CHI TIẾT THEO SRS 3.11.0

| Nhóm nghiệp vụ | Endpoint API | Phương thức | Vai trò cho phép (Role Claims) | Điều kiện kiểm tra thực thể tại Server (Ownership & Relationship Checks) |
| :--- | :--- | :---: | :--- | :--- |
| **Kho Nguồn** | `/api/v1/vaults` | GET, POST | `Owner` | Mỗi Person chỉ sở hữu tối đa 1 kho nguồn đang hoạt động. |
| **Tải Lên Tài Sản** | `/api/v1/assets/upload` | POST | `Owner` | Multipart upload $\le$ 20 MiB; Backend tính SHA-256, sinh DEK, mã hóa AES-256-GCM và đẩy Ciphertext lên Cloudflare R2 / S3. |
| **Quản Lý Tài Sản** | `/api/v1/assets/{id}` | GET, PUT, DELETE | `Owner` | `Asset.Vault.OwnerId == CurrentUser.PersonId` VÀ tài sản chưa bị khóa trong bất kỳ `CaseAssetSnapshots` nào đang xử lý. |
| **Kế Hoạch Di Sản** | `/api/v1/estate-plans` | GET, POST, PUT | `Owner` | Gán người nhận trực tiếp theo tài sản (Direct Designation); Hệ thống tạo phiên bản phân cấp `EstatePlanVersions` $\rightarrow$ `AssetDesignationVersions` và tự động gom nhóm trước (`PRE_BUNDLED`) thành các `HandoverVaults`. |
| **Điểm Danh DMS** | `/api/v1/dms/checkin` | POST | `Owner` | Cập nhật `LastCheckInAt`, gia hạn `NextCheckInDue`; khôi phục trạng thái từ `WARNING_PENDING` / `GRACE_PERIOD` về `ACTIVE`. Không dùng Optimistic UI. |
| **Hồ Sơ Chứng Tử** | `/api/v1/cases` | POST | `Executor` | `Case.SourceVault.ExecutorPersonId == CurrentUser.PersonId`. Kiểm tra `ExecutorPersonId != OwnerPersonId` và `ExecutorPersonId` không nằm trong danh sách Beneficiary của kế hoạch. |
| **Nộp Hồ Sơ** | `/api/v1/cases/{id}/submit` | POST | `Executor` | **Cam kết pháp lý 1 (`DEATH-02`):** Executor bắt buộc tick cam kết chịu trách nhiệm pháp lý, đính kèm `DeathCertificateVersionId`; hệ thống chụp snapshot bất biến `CaseAssetSnapshots`. |
| **Thẩm Định Hồ Sơ** | `/api/v1/cases/{id}/adjudicate` | POST | `Verifier` | **Cam kết pháp lý 2 (`DEATH-02`):** Verifier đối soát Giấy chứng tử, kiểm tra `VerifierPersonId != OwnerPersonId && VerifierPersonId != ExecutorPersonId` và Verifier cấm là Beneficiary; bắt buộc tick cam kết pháp lý trước khi ra quyết định `APPROVED_FOR_DELIVERY`, `REJECTED`, `ADDITIONAL_DOCUMENTS_REQUIRED`. |
| **Hẹn Ngày Bàn Giao**| `/api/v1/cases/{caseId}/handover-schedule` | GET, POST | `Executor` | Đặt lịch hẹn ngày bàn giao **chung cho toàn bộ hồ sơ** (múi giờ `Asia/Ho_Chi_Minh`) trong `HandoverSchedules` sau khi hồ sơ đã được duyệt `APPROVED_FOR_DELIVERY`. Mọi kho trong hồ sơ kế thừa ngày này. |
| **Chuyển Quyền 1:1**| `/api/v1/handover-vaults/{id}/transfers` | POST, DELETE | `Beneficiary` | Chỉ áp dụng cho kho `SINGLE_RECIPIENT`; Đích chuyển phải là Beneficiary hợp lệ trong cùng snapshot; Chỉ được thực hiện **trước khi Executor bấm Bắt đầu bàn giao**. |
| **Bắt Đầu Bàn Giao**| `/api/v1/handover-vaults/{id}/start` | POST | `Executor` | Bấm vào hoặc sau ngày hẹn chung của hồ sơ (`now >= Case.ActiveHandoverSchedule.ScheduledDeliveryDate`); Giao dịch khóa `SERIALIZABLE`, chốt vĩnh viễn các lựa chọn chuyển 1:1 và mở thời hạn 7 ngày phản hồi (`InitialResponseDueAt = handover_started_at + 168 giờ`). |
| **Phản Hồi Bàn Giao**| `/api/v1/handover-vaults/{id}/decision` | POST | `Beneficiary` | Người nhận bấm **Chấp nhận (`ACCEPTED`)** hoặc **Từ chối (`REJECTED`)**: Nếu từ chối hoặc hết 7 ngày $\rightarrow$ kho kích hoạt `FreezeStartedAt` và chuyển `FROZEN_RECONSIDERATION` (2 năm). Không dùng Optimistic UI. |
| **Nhận Khi Đóng Băng**| `/api/v1/handover-vaults/{id}/accept-during-freeze` | POST | `Beneficiary` | Áp dụng cho cả người **đã từ chối (`REJECTED`)** LẪN người **chưa phản hồi (`EXPIRED`)**: Được ký Nhận khi $\text{now} < \text{FreezeExpiresAt}$ tính từ `FreezeStartedAt` của kho bàn giao (`TIME-01`). Tại $\text{now} \ge \text{FreezeExpiresAt}$ từ chối. |
| **Tải Tệp Di Sản**| `/api/v1/handover-vaults/{id}/assets/{assetId}/download` | GET | `Beneficiary` | Kiểm quyền tức thì: Người nhận đã `ACCEPTED`, kho đang mở; **Tải trực tiếp qua giải mã stream TLS 1.3 hoàn toàn miễn phí, không kiểm tra quota kho cá nhân**. |
| **Lưu Kho Cá Nhân** | `/api/v1/personal-vaults/items` | POST | `Beneficiary` | Nhập tài sản vào kho cá nhân với ràng buộc `UNIQUE(PersonalVaultId, AssetId)`: **Kiểm tra nghiêm ngặt hạn mức quota dung lượng và số lượng tài sản của gói lưu trữ**. |
| **Thanh Toán SePay** | `/api/v1/payment/orders` | POST | `Owner`, `Beneficiary` | Khởi tạo đơn mua 5 gói cước chuẩn SRS (`OWNER_FREE`, `LEGACY_XS`: 199k, `LEGACY_XS_MAX`: 399k, `RECIPIENT_FREE`, `RECIPIENT_PLUS`: 49k); lưu snapshot cấu hình gói/giá/quota; sinh mã QR VietQR. |
| **Kiểm Tra Đơn Hàng** | `/api/v1/payment/orders/{orderId}` | GET | Chủ sở hữu đơn | Chỉ chủ đơn (`PersonId == CurrentUser.PersonId`) hoặc `Admin` mới được xem trạng thái đơn. Frontend chỉ poll khi modal mở và order `PENDING`. |
| **Webhook SePay** | `/api/v1/payment/webhook` | POST | `PaymentProvider` | Server-to-Server; giao dịch ACID Serializable: xác thực signature, chống lặp qua `provider_event_id`, từ chối cấp quyền nếu $\text{now} \ge \text{ExpiresAt}$, đối soát số tiền và cấp gói trong cùng transaction. |
| **Demo Thanh Toán** | `/api/v1/demo/payment-orders/{orderId}/simulate-success` | POST | Chủ sở hữu đơn, `Admin` | Chỉ bật khi `EnablePaymentSimulation = true` trong môi trường Dev/Demo; **Bắt buộc kiểm tra `CurrentUser.PersonId == order.PersonId`** hoặc vai trò `Admin`; cấm người dùng khác mô phỏng chéo; ghi Audit Log với `IsSimulated = true`. |
| **Cứu Hộ Owner** | `/api/v1/cases/{caseId}/alive-claim` | POST | `Owner` | Nộp yêu cầu cứu hộ "Tôi còn sống" khi phát hiện hồ sơ kích hoạt nhầm hoặc có dấu hiệu gian lận; chuyển trạng thái `RESCUE_PENDING`. |
| **Nhật Ký Kiểm Toán** | `/api/v1/audit-events` | GET | `Admin`, `Owner` | Admin xem nhật ký kỹ thuật hệ thống; Owner xem lịch sử thao tác trên kho của mình. |

---

## 3. CHECKLIST KIỂM SOÁT PHÂN QUYỀN TRÊN CODE (BACKEND HANDLERS)

### 1. `ThreePersonSeparationRequirement` (Nguyên tắc Tam quyền Phân lập)
```csharp
// 1. Kiểm tra 3 người phải là 3 cá nhân khác nhau
if (caseRecord.OwnerPersonId == caseRecord.ExecutorPersonId || 
    caseRecord.OwnerPersonId == caseRecord.VerifierPersonId || 
    caseRecord.ExecutorPersonId == caseRecord.VerifierPersonId)
{
    throw new BusinessRuleException(ErrorCodes.CONFLICT_ROLE_RESTRICTION, 
        "Owner, Executor and Verifier must be three distinct individuals.");
}

// 2. Kiểm tra người đang thực thi có đúng vai trò được giao trong hồ sơ hay không
if (requiredRole == Role.Executor && currentPersonId != caseRecord.ExecutorPersonId)
{
    throw new ForbiddenException("Only the assigned Executor can submit or manage this case.");
}

if (requiredRole == Role.Verifier && currentPersonId != caseRecord.VerifierPersonId)
{
    throw new ForbiddenException("Only the assigned Verifier can adjudicate this case.");
}
```

### 2. `BeneficiaryConflictRequirement` (Ngăn ngừa Lợi ích Xung đột Theo Phiên Bản Chuẩn)
```csharp
// Kiểm tra Executor hoặc Verifier không được là Beneficiary trong cùng hồ sơ di sản:
// Trường hợp 1: Hồ sơ đã được nộp (Đã có CaseAssetSnapshots)
// -> Truy vấn danh sách BeneficiaryPersonId từ chính các AssetDesignationVersions được snapshot:
if (caseRecord.Status != CaseStatus.DRAFT)
{
    var snapshotBeneficiaryIds = await _db.CaseAssetSnapshots
        .Where(s => s.CaseId == caseRecord.Id)
        .SelectMany(s => s.AssetDesignationVersion.Recipients.Select(r => r.BeneficiaryPersonId))
        .Distinct()
        .ToListAsync();

    if (snapshotBeneficiaryIds.Contains(currentPersonId))
    {
        throw new BusinessRuleException(ErrorCodes.BENEFICIARY_ROLE_CONFLICT, 
            "Executor or Verifier cannot be designated as a Beneficiary in the snapshotted estate case.");
    }
}
else
{
    // Trường hợp 2: Trước khi nộp hồ sơ (hoặc khi thiết lập kế hoạch)
    // -> CHỈ kiểm tra trên EstatePlanVersion đang có hiệu lực (IsActive == true):
    var activeBeneficiaryIds = await _db.EstatePlanVersions
        .Where(v => v.EstatePlanId == caseRecord.EstatePlanId && v.Status == "ACTIVE")
        .SelectMany(v => v.AssetDesignations)
        .SelectMany(d => d.Recipients.Select(r => r.BeneficiaryPersonId))
        .Distinct()
        .ToListAsync();

    if (activeBeneficiaryIds.Contains(currentPersonId))
    {
        throw new BusinessRuleException(ErrorCodes.BENEFICIARY_ROLE_CONFLICT, 
            "Executor or Verifier cannot be designated as an active Beneficiary in the estate plan.");
    }
}
```

### 3. `FreezeWindowAcceptanceRequirement` (Nhận Di Sản Trong Cửa Sổ 2 Năm Đóng Băng & Ranh Giới Chuẩn Xác)
```csharp
var handoverVault = await _db.HandoverVaults.FindAsync(vaultId);
if (handoverVault.Status != HandoverVaultStatus.FROZEN_RECONSIDERATION)
{
    throw new BusinessRuleException(ErrorCodes.INVALID_VAULT_STATE, "Vault is not in reconsideration freeze state.");
}

// Ranh giới hết hạn TIME-01: Tại đúng hoặc sau mốc hết hạn (now >= FreezeExpiresAt) phải từ chối ngay lập tức
if (DateTime.UtcNow >= handoverVault.FreezeExpiresAt)
{
    throw new BusinessRuleException(ErrorCodes.RECONSIDERATION_WINDOW_EXPIRED, 
        "The 2-year reconsideration freeze period has expired. Access is permanently locked.");
}

// Cho phép cả người đã REJECTED hoặc EXPIRED chuyển sang ACCEPTED
var decision = await _db.BeneficiaryHandoverDecisions
    .FirstOrDefaultAsync(d => d.HandoverVaultId == vaultId && d.RecipientPersonId == currentPersonId);

if (decision == null || (decision.DecisionStatus != DecisionStatus.REJECTED && decision.DecisionStatus != DecisionStatus.EXPIRED))
{
    throw new BusinessRuleException(ErrorCodes.INVALID_DECISION_STATE, "Only rejected or expired beneficiaries can accept during freeze.");
}

decision.DecisionStatus = DecisionStatus.ACCEPTED;
decision.ReconsideredAt = DateTime.UtcNow;
await _db.SaveChangesAsync();
```
