# TÀI LIỆU YÊU CẦU KỸ THUẬT & HỢP ĐỒNG API (FRONTEND - BACKEND CONTRACT)

## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO TÀI SẢN SỐ

### Phiên bản: Baseline 3.11.0 (26/09/2026) — Chuẩn Hóa 100% Theo SRS v3.11.0

### Công nghệ: ASP.NET Core 10 Web API (.NET 10 LTS) + React 19 SPA (FSD Architecture)

---

## 1. NGUYÊN TẮC THIẾT KẾ NỀN TẢNG (CORE PROTOCOLS)

### 1.1. Chuẩn Hóa Phản Hồi Thành Công (`ApiResponse<T>`)

Mọi endpoint trả về HTTP 200/201 đều được bọc trong Envelope chuẩn:

```csharp
public class ApiResponse<T>
{
    public bool Success { get; set; } = true;
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
    public string CorrelationId { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}
```

### 1.2. Chuẩn Hóa Phản Hồi Lỗi (RFC 7807 ProblemDetails)

Tất cả các lỗi HTTP (400, 401, 403, 404, 409, 422, 500) trả về định dạng RFC 7807:

```json
{
  "type": "https://legacyvault.vn/errors/handover",
  "title": "Lỗi Thao Tác Bàn Giao",
  "status": 409,
  "detail": "Lựa chọn chuyển quyền đã bị chốt cố định do Người thực thi đã bắt đầu bàn giao.",
  "errorCode": "ERR_HANDOVER_FINALIZED_LOCKED",
  "correlationId": "4a7c8e9b-3e12-4f81-a901-7c2a12345678",
  "timestamp": "2026-09-26T20:30:00Z"
}
```

### 1.3. Phân Quyền Zero-Trust & Header Bắt Buộc

* **Header Client gửi:**
  * `Authorization: Bearer <access_token>` (Access token lưu thuần RAM trong Redux store).
  * `X-Correlation-ID: <uuid>` (Tự động sinh trên mỗi request).
  * `X-Requested-With: XMLHttpRequest` (Phòng chống tấn công CSRF).
* **Refresh Token:** Lưu tại HttpOnly, Secure, SameSite=Strict Cookie trên path `/api/v1/auth/refresh`.

---

## 2. MODULE 0: XÁC THỰC & TÀI KHOẢN (AUTHENTICATION & RBAC)

Hệ thống phân định rõ ràng giữa **Danh tính người (`Persons`)** và **Tài khoản đăng nhập (`Users`)**.
5 Vai trò hệ thống: `OWNER`, `BENEFICIARY`, `EXECUTOR`, `VERIFIER`, `ADMIN`.

### 🔹 `POST /api/v1/auth/register`

* **Request Body:**
  ```json
  {
    "fullName": "Nguyễn Văn A",
    "email": "owner@example.com",
    "password": "SecurePassword@123",
    "phoneNumber": "0912345678"
  }
  ```
* **Response Data (`AuthSessionDto`):** Trả về `accessToken` trong RAM, cookie `refreshToken` HttpOnly.

### 🔹 `POST /api/v1/auth/login`

* **Request Body:** `{ "email": "...", "password": "..." }`
* **Response Data:** `{ "accessToken": "...", "expiresIn": 900, "user": { "id": "...", "personId": "...", "fullName": "...", "roles": ["OWNER"] } }`

### 🔹 `POST /api/v1/auth/refresh`

* **Request:** Tự động gửi kèm HttpOnly Cookie `refreshToken`.
* **Response:** Cấp `accessToken` mới trong RAM.

---

## 3. MODULE 1: QUẢN LÝ KHO NGUỒN & TÀI SẢN SỐ (LUỒNG 1A)

### 🔹 `POST /api/v1/assets/upload` (Envelope Encryption Ingestion)

* **Phương thức:** `multipart/form-data`.
* **Tham số form:**
  * `file`: Binary file (kích thước $\le$ 20 MiB).
  * `title`: string (Tên tài sản).
  * `assetType`: `"CRYPTO" | "CREDENTIAL" | "DOCUMENT"`.
  * `clientSha256`: string (Mã băm SHA-256 tính từ Web Crypto của Browser).
* **Xử lý Backend:**
  1. Kiểm tra dung lượng và MIME type thực tế.
  2. Đối soát SHA-256 khớp với Client.
  3. Sinh DEK ngẫu nhiên (AES-256-GCM), mã hóa streaming trực tiếp lên Cloudflare R2 / S3.
  4. Bọc DEK bằng KEK máy chủ $\rightarrow$ lưu `WrappedDataKey` vào SQL Server.
* **Response Data (`AssetItemDto`):**
  ```json
  {
    "id": "ast_01H...",
    "vaultId": "vlt_01H...",
    "title": "Hợp đồng quyền sử dụng đất",
    "assetType": "DOCUMENT",
    "status": "ACTIVE",
    "fileSizeBytes": 1548290,
    "createdAt": "2026-09-26T20:00:00Z"
  }
  ```

### 🔹 `GET /api/v1/assets`

* **Query Params:** `pageIndex=1`, `pageSize=10`, `searchTerm=...`
* **Response Data:** `PaginatedList<AssetItemDto>`.

---

## 4. MODULE 2: THIẾT LẬP KẾ HOẠCH DI SẢN & TỰ GOM KHO (LUỒNG 1B)

Theo đặc tả SRS 3.11.0: Chủ sở hữu chỉ định trực tiếp (Direct Designation), hệ thống **tự gom kho bàn giao trước khi nộp hồ sơ**.

### 🔹 `POST /api/v1/estate-plans`

* **Request Body (`CreateEstatePlanRequest`):**
  ```json
  {
    "title": "Kế hoạch di sản gia đình 2026",
    "declarationNotes": "Ý chí bàn giao tài sản cho các con",
    "executor": {
      "fullName": "Trần Văn B",
      "email": "executor@example.com",
      "phoneNumber": "0987654321"
    },
    "beneficiaries": [
      { "id": "temp_ben_1", "fullName": "Nguyễn Văn C", "email": "c.nguyen@example.com", "phoneNumber": "090111222" },
      { "id": "temp_ben_2", "fullName": "Nguyễn Thị D", "email": "d.nguyen@example.com", "phoneNumber": "090333444" }
    ],
    "designations": {
      "ast_01H...": ["temp_ben_1"],
      "ast_02H...": ["temp_ben_1", "temp_ben_2"]
    }
  }
  ```
* **Xử lý Backend:**
  1. Kiểm tra quy tắc `SETUP-01`: Executor không được trùng với Owner (`Three-Person Separation`).
  2. Tạo/cập nhật `Persons` cho từng người thụ hưởng.
  3. Quản lý phiên bản phân cấp:
     * Sinh `EstatePlanVersions` (tăng `VersionNumber`).
     * Với mỗi tài sản trong kế hoạch, sinh `AssetDesignationVersions` với ràng buộc `UNIQUE(EstatePlanVersionId, AssetId)` (mỗi tài sản chỉ có duy nhất 1 tập người nhận hiệu lực trong 1 phiên bản kế hoạch).
     * Lưu danh sách người nhận vào `DesignationVersionRecipients` liên kết qua `AssetDesignationVersionId`.
  4. Gom kho tự động (`HandoverVaults`):
     * Gom nhóm theo `NormalizedRecipientSet` (chuẩn hóa danh sách `BeneficiaryPersonId` sắp xếp theo thứ tự bảng chữ cái).
     * `ast_01H...` có 1 người nhận $\rightarrow$ Gắn vào `HandoverVault` chế độ `SINGLE_RECIPIENT`.
     * `ast_02H...` có 2 người nhận $\rightarrow$ Gắn vào `HandoverVault` chế độ `CO_OWNED`.
     * Đảm bảo ràng buộc `UNIQUE(EstatePlanVersionId, NormalizedRecipientSet)`.
* **Response Data (`EstatePlanDetailDto`):** Trả về kế hoạch kèm phiên bản hiệu lực (`activeVersionNumber`), chi tiết chỉ định từng tài sản và danh sách các kho bàn giao đã được tự gom.

### 🔹 `GET /api/v1/estate-plans`

* **Quyền:** `OWNER`.
* **Response Data:** Danh sách kế hoạch di sản của chủ sở hữu.

### 🔹 `GET /api/v1/estate-plans/{id}`

* **Quyền:** `OWNER`, `EXECUTOR` (sau khi kích hoạt hồ sơ).
* **Response Data (`EstatePlanDetailDto`):** Chi tiết kế hoạch, phiên bản chỉ định hiệu lực, danh sách tài sản và các kho bàn giao tự gom.

---

## 5. MODULE 3: ĐIỂM DANH SINH TỒN DEAD MAN'S SWITCH (LUỒNG 2A & 2B)

### 🔹 `POST /api/v1/dms/checkin`

* **Quyền:** `OWNER`.
* **Xử lý:** Cập nhật `LastCheckInAt = UtcNow`, gia hạn `NextCheckInDue`. Nếu kho đang ở trạng thái `CHECKIN_SUSPENDED`, khôi phục ngay lập tức về `ACTIVE`.
* **Response Data:** `{ "vaultStatus": "ACTIVE", "nextCheckInDue": "2026-12-25T00:00:00Z" }`.

### 🔹 `GET /api/v1/dms/status`

* **Response Data:**
  ```json
  {
    "status": "ACTIVE", // "ACTIVE" | "CHECKIN_PENDING" | "CHECKIN_SUSPENDED" | "FROZEN_INACTIVITY"
    "heartbeatIntervalDays": 90,
    "lastCheckInAt": "2026-09-26T20:00:00Z",
    "nextCheckInDue": "2026-12-25T20:00:00Z",
    "suspensionDeadline": null
  }
  ```

---

## 6. MODULE 4: HỒ SƠ THẨM ĐỊNH CHỨNG TỬ PHÁP LÝ (LUỒNG 3A & 3B)

### 🔹 `POST /api/v1/cases` (Khởi tạo hồ sơ)

* **Quyền:** `EXECUTOR`.
* **Request Body:** `{ "sourceVaultId": "vlt_01H..." }`.

### 🔹 `POST /api/v1/cases/{id}/submit` (Nộp chứng tử & Khóa snapshot)

* **Phương thức:** `multipart/form-data`.
* **Tham số:**
  * `deathCertificate`: Tệp Giấy chứng tử gốc (PDF/Ảnh $\le$ 20 MiB).
  * `legalAttestationConfirmed`: boolean (**Bắt buộc true** - Cam kết pháp lý `DEATH-02`).
  * `statementText`: string (Văn bản cam kết chịu trách nhiệm trước pháp luật).
* **Xử lý Backend:**
  1. Nếu `legalAttestationConfirmed == false` $\rightarrow$ Trả lỗi `ERR_DEATH_ATTESTATION_REQUIRED` (422).
  2. Bọc trong giao dịch `SERIALIZABLE`: Tạo `DeathCertificates`, lưu bản ghi Executor trong `CaseLegalAttestations`.
  3. Khóa nguyên tử bộ ba $(\text{AssetId}, \text{ContentVersionId}, \text{DesignationVersionId})$ vào `CaseAssetSnapshots`.
  4. Chuyển hồ sơ sang `UNDER_REVIEW`.
* **Response Data:** `{ "caseId": "...", "status": "UNDER_REVIEW", "submittedAt": "..." }`.

### 🔹 `POST /api/v1/cases/{id}/adjudicate` (Verifier thẩm định)

* **Quyền:** `VERIFIER`.
* **Request Body:**
  ```json
  {
    "decision": "APPROVED_FOR_DELIVERY", // "APPROVED_FOR_DELIVERY" | "REJECTED" | "ADDITIONAL_DOCUMENTS_REQUIRED"
    "rejectionReason": null,
    "legalAttestationConfirmed": true, // Bắt buộc true nếu duyệt
    "statementText": "Tôi xác nhận đã thẩm tra Giấy chứng tử và chịu trách nhiệm trước pháp luật."
  }
  ```
* **Xử lý Backend:** Lưu bản ghi Verifier vào `CaseLegalAttestations`. Khi có đủ 2 bản ghi cam kết hợp lệ, chuyển trạng thái hồ sơ sang `APPROVED_FOR_DELIVERY` và kích hoạt luồng bàn giao.

---

## 7. MODULE 5: BÀN GIAO DI SẢN & CHUYỂN QUYỀN 1:1 (LUỒNG 4A $\rightarrow$ 4H)

### 🔹 `POST /api/v1/cases/{caseId}/handover-schedule` (Hẹn lịch bàn giao chung cho toàn bộ hồ sơ)

* **Quyền:** `EXECUTOR`.
* **Nghiệp vụ:** SRS quy định **một ngày bàn giao duy nhất cho toàn bộ hồ sơ** (áp dụng đồng nhất cho mọi kho bàn giao trong hồ sơ). Executor không đặt lịch riêng lẻ theo từng kho.
* **Request Body:**
  ```json
  {
    "scheduledDeliveryDate": "2026-10-05T09:00:00+07:00",
    "rescheduledReason": "Lên lịch bàn giao thống nhất sau khi hồ sơ chứng tử được phê duyệt."
  }
  ```
* **Xử lý Backend:**
  1. Kiểm tra hồ sơ ở trạng thái `APPROVED_FOR_DELIVERY`.
  2. Tạo bản ghi `HandoverSchedules` gắn với `CaseId`, tăng `ScheduleVersion` tự động. Đánh dấu `IsActive = true` và hủy hiệu lực phiên bản cũ nếu dời lịch.
  3. Mọi kho bàn giao `HandoverVaults` trong hồ sơ đều kế thừa ngày bàn giao hiệu lực này.
* **Response Data:** `{ "caseId": "...", "scheduleVersion": 1, "scheduledDeliveryDate": "2026-10-05T09:00:00+07:00" }`.

### 🔹 `GET /api/v1/cases/{caseId}/handover-schedule`

* **Quyền:** `EXECUTOR`, `BENEFICIARY`, `VERIFIER`.
* **Response Data:** Lịch bàn giao hiệu lực và lịch sử các lần dời lịch (nếu có).

### 🔹 `POST /api/v1/handover-vaults/{id}/transfers` (Chuyển quyền 1:1 - Luồng 4B)

* **Quyền:** `BENEFICIARY`.
* **Request Body:** `{ "targetRecipientPersonId": "psn_02H..." }`.
* **Xử lý Backend:** Kiểm tra kho là `SINGLE_RECIPIENT`, người nhận đích nằm trong cùng snapshot, và Executor **chưa bấm Bắt đầu bàn giao**. Tạo `TransferChoices` trạng thái `ACTIVE`.

### 🔹 `DELETE /api/v1/handover-vaults/{id}/transfers`

* **Quyền:** `BENEFICIARY`. Hủy chuyển quyền để tự mình nhận kho.

### 🔹 `POST /api/v1/handover-vaults/{id}/start` (Executor Bắt đầu bàn giao - Luồng 4C)

* **Quyền:** `EXECUTOR`.
* **Điều kiện:** Thời điểm gọi `now >= Case.ActiveHandoverSchedule.ScheduledDeliveryDate`.
* **Xử lý Backend:** Giao dịch khóa `SERIALIZABLE` chốt vĩnh viễn các lựa chọn chuyển sang `FINALIZED`, mở thời hạn 7 ngày phản hồi, chuyển kho sang `HANDOVER_STARTED`.

### 🔹 `POST /api/v1/handover-vaults/{id}/decision` (Phản hồi Nhận / Từ chối trong 7 ngày - Luồng 4D & 4E)

* **Quyền:** `BENEFICIARY`.
* **Request Body:** `{ "decision": "ACCEPTED" | "REJECTED", "note": "..." }`.
* **Xử lý Backend:**
  * Nếu 100% người nhận `ACCEPTED` $\rightarrow$ Chuyển `HANDOVER_COMMITTED`, cấp `AccessGrant` hiệu lực 168 giờ tải miễn phí.
  * Nếu có người `REJECTED` hoặc hết 7 ngày $\rightarrow$ Ghi nhận `FreezeStartedAt = DateTime.UtcNow`, tính `FreezeExpiresAt = FreezeStartedAt + 2 năm`, chuyển kho sang `FROZEN_RECONSIDERATION`.

### 🔹 `POST /api/v1/handover-vaults/{id}/accept-during-freeze` (Ký Nhận trong 2 năm đóng băng - Luồng 4E)

* **Quyền:** `BENEFICIARY`.
* **Đối tượng:** Áp dụng bình đẳng cho cả người **đã từ chối (`REJECTED`)** LẪN người **chưa phản hồi (`EXPIRED`)**.
* **Điều kiện ranh giới thời gian (`TIME-01`):**
  * Kho đang ở trạng thái `FROZEN_RECONSIDERATION`.
  * Thời điểm hiện tại bắt buộc thỏa mãn: $\text{now} < \text{FreezeExpiresAt}$.
  * **Tại đúng hoặc sau thời điểm hết hạn ($\text{now} \ge \text{FreezeExpiresAt}$):** Server từ chối ngay lập tức và trả mã lỗi `ERR_RECONSIDERATION_WINDOW_EXPIRED` (409).
* **Xử lý Backend:**
  * Cập nhật `BeneficiaryHandoverDecisions.DecisionStatus = ACCEPTED` và ghi nhận `ReconsideredAt`.
  * Với kho `SINGLE_RECIPIENT`: Ngay lập tức chuyển `HANDOVER_COMMITTED` và cấp `AccessGrant`.
  * Với kho `CO_OWNED`: Kiểm tra xem đã đủ 100% người nhận đồng thuận hay chưa. Khi đủ 100%, chuyển `HANDOVER_COMMITTED` và cấp `AccessGrant` cho toàn bộ nhóm cùng lúc.

### 🔹 `GET /api/v1/handover-vaults/{id}/assets/{assetId}/download` (Tải giải mã bảo mật)

* **Quyền:** `BENEFICIARY`.
* **Xử lý Backend (Zero-Trust):**
  1. Kiểm tra JWT Token của Beneficiary.
  2. Kiểm tra `AccessGrant` còn hiệu lực ($\le 168$ giờ kể từ lúc cam kết).
  3. Lấy Ciphertext từ R2 $\rightarrow$ Giải mã DEK bằng KEK nội bộ $\rightarrow$ Stream dữ liệu giải mã trực tiếp qua TLS 1.3 về trình duyệt (`DEL-02`). Tải về hoàn toàn miễn phí.

### 🔹 `POST /api/v1/personal-vaults/items` (Lưu vào Kho cá nhân - Luồng 4F & 4G)

* **Quyền:** `BENEFICIARY`.
* **Request Body:** `{ "sourceAccessGrantId": "grt_01H...", "assetId": "ast_01H...", "contentVersionId": "ver_01H..." }`.
* **Xử lý Backend:** Kiểm tra hạn ngạch dung lượng của `PersonalVault`. Ràng buộc `UNIQUE(PersonalVaultId, AssetId)` cho phép lưu nhiều tài sản từ cùng 1 Grant nhưng chống nhập lặp một tài sản đã có. Nếu quá hạn ngạch trả mã lỗi `ERR_PERSONAL_VAULT_QUOTA_EXCEEDED` (409).

---

## 8. MODULE 6: GÓI DỊCH VỤ & THANH TOÁN SEPAY VIETQR (LUỒNG 1A & 4G)

### 🔹 `GET /api/v1/billing/plans`

* **Response Data:** Danh sách 5 gói chuẩn SRS 3.11.0:
  1. `OWNER_FREE`: 0đ / vĩnh viễn (3 tài sản, 20 MB).
  2. `LEGACY_XS`: 199.000đ / 365 ngày (20 tài sản, 200 MB, Kế hoạch di sản).
  3. `LEGACY_XS_MAX`: 399.000đ / 365 ngày (50 tài sản, 500 MB, Xuất PDF kèm SHA-256).
  4. `RECIPIENT_FREE`: 0đ / vĩnh viễn (2 tài sản, 20 MB).
  5. `RECIPIENT_PLUS`: 49.000đ / 30 ngày (10 tài sản, 200 MB).

### 🔹 `POST /api/v1/payment/orders`

* **Request Body:** `{ "planId": "plan_legacy_xs" }`.
* **Response Data (`PaymentOrderDto`):** Trả về `orderCode`, `amount`, `qrCodeUrl` (VietQR Napas 247), hạn hiệu lực 15 phút (`expiresAt = createdAt + 15 phút`), và lưu snapshot cấu hình gói/giá/quota vào đơn hàng.

### 🔹 `GET /api/v1/payment/orders/{orderId}`

* **Quyền:** Chủ sở hữu đơn hàng (`PersonId == currentPersonId`) hoặc `ADMIN`.
* **Polling Policy:** Frontend chỉ poll endpoint này khi modal thanh toán đang mở và đơn còn `PENDING`. Dừng poll ngay khi `PAID`, `EXPIRED`, hoặc đóng modal.

### 🔹 `POST /api/v1/payment/webhook` (Server-to-Server)

* **Xác thực:** Hỗ trợ `Authorization: Apikey <SecretKey>` hoặc chữ ký HMAC-SHA256 trên header `X-Signature`.
* **Xử lý trong Giao dịch ACID Serializable:**
  1. Kiểm tra `UNIQUE(provider_event_id)` trong bảng `IdempotencyRecords`.
  2. Kiểm tra `now < order.ExpiresAt`. Nếu đến trễ (`now >= order.ExpiresAt`): Đánh dấu `EXPIRED`, ghi idempotency, và **tuyệt đối không cấp entitlement**.
  3. Đối soát `payload.TransferAmount >= order.SnapshotAmount`.
  4. Cập nhật `order.Status = SUCCESS`, ghi idempotency và cấp entitlement dựa trên snapshot gói cước trong cùng giao dịch.

### 🔹 `POST /api/v1/demo/payment-orders/{orderId}/simulate-success` (Mô phỏng thanh toán Demo)

* **Điều kiện kích hoạt Server:** Chỉ hoạt động khi cờ server `EnablePaymentSimulation == true` trong môi trường `Development` hoặc `Demo`. Vô hiệu hóa hoàn toàn trên Production.
* **Quy tắc phân quyền (Authorization Guardrails):**
  * Bắt buộc có Access Token hợp lệ.
  * **Chính sách sở hữu nghiêm ngặt:** Chỉ chủ sở hữu đơn hàng (`currentPersonId == order.PersonId`) mới được bấm mô phỏng đơn của mình, hoặc tài khoản có vai trò `ADMIN`. Cấm người dùng khác mô phỏng đơn không phải của mình.
* **Xử lý:** Kích hoạt cùng luồng giao dịch kiểm tra và cấp quyền như webhook thực tế, ghi Audit Log với `IsSimulated = true`.

---

## 9. MODULE 7: QUẢN TRỊ & NHẬT KÝ KIỂM TOÁN (LUỒNG 5A & 5B)

### 🔹 `GET /api/v1/audit-events`

* **Quyền:** `ADMIN`, `OWNER`.
* **Query Params:** `correlationId=...`, `actorPersonId=...`, `pageIndex=1`, `pageSize=20`.
* **Response Data:** `PaginatedList<AuditEventDto>`. Admin xem log kỹ thuật; Owner chỉ xem log trên kho của mình.
