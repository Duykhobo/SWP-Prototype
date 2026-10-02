# ĐẶC TẢ CHI TIẾT TRIỂN KHAI CODE CHO LẬP TRÌNH VIÊN (DEVELOPER CODE SPEC)
## FLOW 03 · DEAD MAN'S SWITCH (DMS) · ĐIỂM DANH SINH TỒN, TẠM TREO VÀ ĐÓNG BĂNG AN TOÀN
**Ánh xạ trực tiếp từ Sơ đồ Swimlane draw.io**: [`FLOW_03_SYSTEM_MERGED.xml`](./FLOW_03_SYSTEM_MERGED.xml) (Gồm 6 Làn bơi & Tuân thủ Quy chuẩn ký hiệu lưu đồ ISO 5807 / ANSI)  
**Tiêu chuẩn kiến trúc**: Clean Architecture .NET 8 (HostedService Background Worker), React 19, Microsoft SQL Server 2022, MailKit SMTP  
**Căn cứ nghiệp vụ & Tham chiếu pháp lý**:
- Tham chiếu pháp lý: **Điều 120 Bộ luật Dân sự 2015** ("Giao dịch dân sự có điều kiện").
- Chính sách sản phẩm: **SRS Baseline 3.11.0** (Luồng chính 2A & 2B, các quy tắc `DMS-01` đến `DMS-10`, `OPLAN-05`, `OPLAN-06`).

---

## 1. NGUYÊN TẮC NGHIỆP VỤ & RÀNG BUỘC PHÁP LÝ BẮT BUỘC (HARD RULES)

1. **Tuyệt đối không suy đoán qua đời từ việc im lặng (`DMS-04`, `DMS-09`)**:
   - Quá hạn điểm danh đơn thuần **KHÔNG PHẢI** là bằng chứng chứng tử. Hệ thống **tuyệt đối không tự động mở niêm phong, không mời Beneficiary, không tiết lộ tài sản và không bàn giao di sản**.
   - Việc chuyển giao di sản chỉ được phép diễn ra khi có Giấy chứng tử hợp pháp được thẩm định viên độc lập (Verifier) phê duyệt tại Flow 04 & Flow 05.

2. **Hành động điểm danh độc lập (`DMS-02`)**:
   - Đăng nhập hệ thống hoặc thực hiện thanh toán đơn thuần **không được coi là điểm danh sinh tồn**.
   - Chủ kho (Owner) bắt buộc phải chủ động nhấp nút **"Tôi Còn Sống (Check-in)"** trên Web Dashboard hoặc mở trang xác nhận từ liên kết email an toàn.

3. **Cập nhật cấu hình không được tính là điểm danh (`DMS-01`, `DMS-02`)**:
   - Việc Owner thay đổi chu kỳ (30/60/90 ngày) hoặc thời gian chờ (7/14/30 ngày) chỉ lưu cấu hình mới và **chỉ áp dụng từ kỳ điểm danh kế tiếp**.
   - Tuyệt đối không cho phép đổi cấu hình để kéo dài mốc `NextCheckInDue` của kỳ đang chạy.

4. **Thời hạn tạm treo 90 ngày cố định (`DMS-01`, `DMS-04`)**:
   - Chu kỳ điểm danh: Chỉ cho phép `{30, 60, 90}` ngày (Mặc định: 30 ngày).
   - Thời gian chờ gia hạn (Grace Period): Chỉ cho phép `{7, 14, 30}` ngày (Mặc định: 7 ngày).
   - Khi hết Grace Period mà chưa có điểm danh hợp lệ, hệ thống chuyển sang `CHECKIN_SUSPENDED` với thời hạn tạm treo cố định **90 × 24 giờ** cho mọi hạng kho:
     $$\text{FreezeAt} = \text{GraceExpiresAt} + 90\text{ ngày}$$
   - Mốc thời gian được cố định theo hạn đã định (Fixed Policy Timestamps), không phụ thuộc vào độ trễ của lượt quét Worker.

5. **Chính sách bảo toàn dữ liệu vĩnh viễn (`OPLAN-05`, `OPLAN-06`)**:
   - Gói **Owner Free**: Dữ liệu **tuyệt đối không bao giờ bị xóa tự động** do bất hoạt hoặc quá hạn DMS.
   - Gói **Trả phí (XS, XS Max)**: Khi hết 90 ngày tạm treo, kho chuyển sang `FROZEN_INACTIVITY` (Đóng băng an toàn, chuyển trạng thái chỉ đọc). Dữ liệu chỉ đủ điều kiện xem xét xóa khi thỏa mãn đồng thời 8 điều kiện chặn: Gói trả phí đã hết hạn, gửi thông báo cảnh báo 3 lần thất bại, và **xác nhận không có hồ sơ chứng tử nào đang thẩm định**.

6. **Trình tự xử lý dữ liệu chuẩn kiến trúc**:
   $$\text{Xử lý nghiệp vụ tại Server} \longrightarrow \text{Commit CSDL SQL Server} \longrightarrow \text{Trả HTTP 200 cho Client} \longrightarrow \text{Gửi Email (Outbox Queue)}$$
   - Lỗi gửi email SMTP ngoại vi không được phép làm rollback giao dịch CSDL hay dừng đồng hồ đếm lùi DMS.

---

## 2. BẢNG MA TRẬN QUYẾT ĐỊNH: TƯƠNG TÁC GIỮA DMS STATUS VÀ CASE STATUS (CHỨNG TỬ)

Để bảo đảm tính toàn vẹn và tránh việc hai quy trình độc lập ghi đè trạng thái lên nhau, hệ thống phân định rạch ròi giữa `Vault.VaultStatus` và `DeathClaimCases.CaseStatus`:

| Tình trạng Hồ sơ chứng tử (`CaseStatus`) | Trạng thái DMS của Kho (`VaultStatus`) | Quyền điểm danh / Phục hồi của Owner | Hành vi hệ thống khi Owner điểm danh |
| :--- | :--- | :--- | :--- |
| **Không có hồ sơ nào** | `ACTIVE` / `CHECKIN_PENDING` | Được phép điểm danh bình thường | Reset timer: `VaultStatus = ACTIVE`, `NextDue = now + CycleDays`. |
| **Không có hồ sơ nào** | `CHECKIN_SUSPENDED` / `FROZEN_INACTIVITY` | Được phép phục hồi điểm danh muộn (`DMS-06`) | Khôi phục `ACTIVE`, hủy mốc đóng băng, đóng các task cảnh báo Executor với lý do `OWNER_CHECKED_IN`. |
| **Đang thẩm định (`UNDER_REVIEW`)** | Bất kỳ | **Bị chặn điểm danh tự động**; mở quy trình Kháng nghị cứu hộ (`RESCUE_PENDING`) | Chuyển `Case.Status = RESCUE_PENDING`. Hệ thống gửi cảnh báo đỏ cho Verifier: *"Chủ kho đã đăng nhập và tuyên bố còn sống"*. Tạm dừng thẩm định chứng tử để Verifier đối soát trực tiếp. |
| **Hồ sơ bị từ chối (`REJECTED`)** | `CHECKIN_SUSPENDED` / `FROZEN_INACTIVITY` | Được phép phục hồi điểm danh bình thường | Khôi phục `ACTIVE`. Mốc tạm treo/đóng băng cũ tiếp tục áp dụng theo mốc gốc cho đến khi có điểm danh hợp lệ (`DMS-10`). |
| **Đã duyệt (`APPROVED_FOR_DELIVERY`)** | Bất kỳ | **Bị khóa vĩnh viễn** | DMS bị chấm dứt vĩnh viễn. Kho thuộc quyền bàn giao theo Flow 05. |

---

## 3. MA TRẬN 6 BƯỚC TRIỂN KHAI KỸ THUẬT (STEP-BY-STEP IMPLEMENTATION MATRIX)

### BƯỚC 01: KHỞI TẠO LỊCH TRÌNH BAN ĐẦU & CẬP NHẬT CẤU HÌNH (DMS-01, DMS-02)

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `OWNER` $\rightarrow$ `CLIENT (REACT 19)` $\rightarrow$ `SERVER (.NET 8)` $\rightarrow$ `DATABASE SQL SERVER` |
| **Khởi tạo lần đầu (Flow 02)** | Khi kế hoạch di sản được kích hoạt thành công tại Flow 02:<br/>• Server gọi `InitializeDmsSchedule(vaultId)`: Tính `NextCheckInDue = ActivatedAt.AddDays(CycleDays)`. |
| **Cập nhật cấu hình (Flow 03)** | Khi Owner đổi cài đặt chu kỳ: `PUT /api/v1/dms/settings`<br/>• Validation nghiêm ngặt: `CycleDays IN (30, 60, 90)` và `GracePeriodDays IN (7, 14, 30)`.<br/>• **Quy tắc bất biến:** Chỉ cập nhật cấu hình `CycleDays`, `GracePeriodDays` cho kỳ sau. **TUYỆT ĐỐI KHÔNG sửa `NextCheckInDue` của kỳ hiện tại**. |
| **Truy vấn SQL Server** | ```sql
-- Cập nhật cấu hình: Chỉ lưu cài đặt, KHÔNG reset mốc điểm danh hiện tại
UPDATE [dbo].[Vaults]
SET CycleDays = @CycleDays,
    GracePeriodDays = @GracePeriodDays,
    UpdatedAt = GETUTCDATE()
WHERE VaultId = @VaultId AND OwnerId = @OwnerId;
``` |

---

### BƯỚC 02: WORKER QUÉT LỊCH TRÌNH & KÍCH HOẠT GRACE PERIOD (DMS-03)

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `SERVER DMS WORKER` $\rightarrow$ `DATABASE` $\rightarrow$ `GMAIL SMTP` |
| **Background Service** | `DmsHeartbeatWorker` kế thừa `BackgroundService` chạy quét định kỳ mỗi 1 giờ:<br/>• Lấy danh sách các kho có `VaultStatus = 'ACTIVE'` VÀ `NextCheckInDue <= GETUTCDATE()`.<br/>• **Nếu chưa đến hạn**: Tiếp tục chờ lần quét tiếp theo (không làm gì). |
| **Xử lý đến hạn** | Thực thi giao dịch cho từng kho:<br/>1. Chuyển `VaultStatus = 'CHECKIN_PENDING'`.<br/>2. Cố định: `GraceExpiresAt = NextCheckInDue.AddDays(GracePeriodDays)`.<br/>3. Sinh `CheckInToken` an toàn 1 lần, băm SHA-256 lưu vào bảng `[dbo].[DmsCheckInTokens]`.<br/>4. Ghi bản ghi vào hàng đợi `[dbo].[OutboxEmails]` để gửi sau commit. |
| **Truy vấn SQL Server** | ```sql
BEGIN TRANSACTION;
UPDATE [dbo].[Vaults] WITH (UPDLOCK, ROWLOCK)
SET VaultStatus = 'CHECKIN_PENDING',
    GracePeriodExpiresAt = DATEADD(DAY, GracePeriodDays, NextCheckInDue),
    UpdatedAt = GETUTCDATE()
WHERE VaultId = @VaultId AND VaultStatus = 'ACTIVE';

-- Tạo token điểm danh 1 lần qua email (chỉ lưu hash)
INSERT INTO [dbo].[DmsCheckInTokens] 
    (TokenId, VaultId, TokenHash, Purpose, ExpiresAt, CreatedAt)
VALUES 
    (NEWID(), @VaultId, @TokenHash, 'DMS_CHECKIN', DATEADD(DAY, GracePeriodDays, NextCheckInDue), GETUTCDATE());

-- Xếp hàng email thông báo
INSERT INTO [dbo].[OutboxEmails] (EmailId, RecipientEmail, TemplateCode, PayloadJson, Status)
VALUES (NEWID(), @OwnerEmail, 'DMS_REMINDER', @PayloadJson, 'PENDING');
COMMIT TRANSACTION;
``` |

---

### BƯỚC 03: XỬ LÝ ĐIỂM DANH HỢP LỆ VỚI STATE GUARD & CONCURRENCY CONTROL (DMS-02)

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `OWNER` $\rightarrow$ `CLIENT` $\rightarrow$ `SERVER` $\rightarrow$ `DATABASE` $\rightarrow$ `CLIENT` |
| **2 Phương thức điểm danh** | 1. **Web Dashboard**: Owner đăng nhập hợp lệ, bấm nút *"⚡ Tôi Còn Sống"*. Phương thức: `Method = 'WEB_DASHBOARD'`.<br/>2. **Email an toàn**: Nhấp link `GET /dms/verify?token=...` $\rightarrow$ Mở trang web xác thực $\rightarrow$ Người dùng bấm nút `[Xác nhận]` gửi `POST /api/v1/dms/confirm-email-checkin`. Phương thức: `Method = 'EMAIL_CONFIRMATION'`. *(Chống scanner tự động click reset nhầm)*. |
| **State Guard nghiêm ngặt** | Giao dịch điểm danh bắt buộc kiểm tra đồng thời:<br/>1. Đúng `OwnerId` hoặc `TokenHash` hợp lệ chưa sử dụng (`UsedAt IS NULL`) và còn hạn (`ExpiresAt > now`).<br/>2. `VaultStatus IN ('ACTIVE', 'CHECKIN_PENDING', 'CHECKIN_SUSPENDED', 'FROZEN_INACTIVITY')`.<br/>3. **Không có hồ sơ chứng tử đang xét duyệt**: `NOT EXISTS (SELECT 1 FROM [DeathClaimCases] WHERE VaultId = @VaultId AND CaseStatus IN ('UNDER_REVIEW', 'APPROVED_FOR_DELIVERY'))`. |
| **Giao dịch ACID SQL Server** | ```sql
BEGIN TRANSACTION;
-- 1. Kiểm tra chặn nếu có hồ sơ chứng tử đang thẩm định
IF EXISTS (
    SELECT 1 FROM [dbo].[DeathClaimCases] WITH (UPDLOCK)
    WHERE VaultId = @VaultId AND CaseStatus = 'UNDER_REVIEW'
)
BEGIN
    -- Kích hoạt cờ kháng nghị cứu hộ còn sống (RESCUE_PENDING)
    UPDATE [dbo].[DeathClaimCases]
    SET CaseStatus = 'RESCUE_PENDING', UpdatedAt = GETUTCDATE()
    WHERE VaultId = @VaultId AND CaseStatus = 'UNDER_REVIEW';

    INSERT INTO [dbo].[AuditEvents] (EventId, EventType, UserId, Timestamp, Details)
    VALUES (NEWID(), 'DMS_OWNER_ALIVE_DURING_CLAIM', @OwnerId, GETUTCDATE(), 'Owner checked in while Death Claim is under review. Triggered RESCUE_PENDING.');
    
    COMMIT TRANSACTION;
    -- Trả mã lỗi nghiệp vụ yêu cầu xem xét
    THROW 51000, 'ERR_CLAIM_UNDER_REVIEW: Hồ sơ chứng tử đang được thẩm định. Hệ thống đã kích hoạt quy trình xác minh khẩn cấp.', 1;
END;

-- 2. Cập nhật điểm danh hợp lệ
UPDATE [dbo].[Vaults] WITH (UPDLOCK, ROWLOCK)
SET VaultStatus = 'ACTIVE',
    LastCheckInAt = GETUTCDATE(),
    NextCheckInDue = DATEADD(DAY, CycleDays, GETUTCDATE()),
    GracePeriodExpiresAt = NULL,
    SuspendedAt = NULL,
    FreezeAt = NULL,
    UpdatedAt = GETUTCDATE()
WHERE VaultId = @VaultId 
  AND OwnerId = @OwnerId
  AND VaultStatus IN ('ACTIVE', 'CHECKIN_PENDING', 'CHECKIN_SUSPENDED', 'FROZEN_INACTIVITY');

-- 3. Ghi vết lịch sử điểm danh với đúng Method
INSERT INTO [dbo].[CheckInLogs] (LogId, VaultId, CheckInTime, IpAddress, UserAgent, Method)
VALUES (NEWID(), @VaultId, GETUTCDATE(), @IpAddress, @UserAgent, @Method);

-- 4. Đánh dấu tiêu thụ token nếu điểm danh qua email
IF @TokenId IS NOT NULL
    UPDATE [dbo].[DmsCheckInTokens] SET UsedAt = GETUTCDATE() WHERE TokenId = @TokenId;

-- 5. Ghi sổ kiểm toán Audit
INSERT INTO [dbo].[AuditEvents] (EventId, EventType, UserId, Timestamp, Details)
VALUES (NEWID(), 'DMS_CHECKIN_SUCCESS', @OwnerId, GETUTCDATE(), CONCAT('Check-in success via ', @Method));

COMMIT TRANSACTION;
``` |

---

### BƯỚC 04: WORKER PHÁT HIỆN HẾT HẠN CHỜ $\rightarrow$ TẠM TREO 90 NGÀY & CẢNH BÁO EXECUTOR (DMS-04, DMS-05)

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `SERVER DMS WORKER` $\rightarrow$ `DATABASE` $\rightarrow$ `GMAIL SMTP` $\rightarrow$ `EXECUTOR` |
| **Kích hoạt độc lập** | Worker chạy quét độc lập: `VaultStatus = 'CHECKIN_PENDING'` VÀ `GraceExpiresAt <= GETUTCDATE()`.<br/>*(Hoàn toàn độc lập với việc Owner có gửi request hay không).* |
| **Chuyển `CHECKIN_SUSPENDED`** | • Ghi nhận `SuspendedAt = GETUTCDATE()`.<br/>• Thiết lập cố định: `FreezeAt = DATEADD(DAY, 90, GraceExpiresAt)`.<br/>• Tạm dừng tạo kỳ điểm danh mới. |
| **Xử lý Executor (Bất đồng bộ)** | • **Nếu có Executor đủ điều kiện (Kho XS/XS Max đã gán Executor)**:<br/>  - Tạo công việc cảnh báo trong bảng `[dbo].[ExecutorAlertTasks]`.<br/>  - Gửi email cảnh báo: *"Yêu cầu tìm hiểu tình hình Chủ tài sản (Không kết luận qua đời)"*.<br/>  - Executor gửi phản hồi: Nếu ghi nhận `NO_CERTIFICATE_AVAILABLE` $\rightarrow$ Đóng task, **mốc 90 ngày của Worker vẫn tiếp tục chạy độc lập**.<br/>  - Nếu Executor có chứng tử hợp pháp $\rightarrow$ Nộp hồ sơ và chuyển sang Flow 04.<br/>• **Nếu không có Executor đủ điều kiện (Kho Free hoặc chưa gán Executor)**:<br/>  - Bỏ qua nhánh Executor, Worker tiếp tục theo dõi mốc 90 ngày. |
| **Truy vấn SQL Server** | ```sql
BEGIN TRANSACTION;
UPDATE [dbo].[Vaults] WITH (UPDLOCK, ROWLOCK)
SET VaultStatus = 'CHECKIN_SUSPENDED',
    SuspendedAt = GETUTCDATE(),
    FreezeAt = DATEADD(DAY, 90, GracePeriodExpiresAt),
    UpdatedAt = GETUTCDATE()
WHERE VaultId = @VaultId AND VaultStatus = 'CHECKIN_PENDING';

-- Nếu kho có Executor đủ điều kiện: Tạo công việc cảnh báo
IF @HasEligibleExecutor = 1
BEGIN
    INSERT INTO [dbo].[ExecutorAlertTasks] (TaskId, VaultId, ExecutorId, Status, TriggeredAt)
    VALUES (NEWID(), @VaultId, @ExecutorId, 'PENDING', GETUTCDATE());
    
    INSERT INTO [dbo].[OutboxEmails] (EmailId, RecipientEmail, TemplateCode, PayloadJson, Status)
    VALUES (NEWID(), @ExecutorEmail, 'DMS_EXECUTOR_ALERT', @PayloadJson, 'PENDING');
END;

-- Xếp hàng email thông báo tạm treo cho Owner
INSERT INTO [dbo].[OutboxEmails] (EmailId, RecipientEmail, TemplateCode, PayloadJson, Status)
VALUES (NEWID(), @OwnerEmail, 'DMS_SUSPENDED_NOTICE', @SuspendedPayload, 'PENDING');
COMMIT TRANSACTION;
``` |

---

### BƯỚC 05: WORKER GỬI NHẮC ĐA MỐC & CHỐNG GỬI TRÙNG (DMS-06, DMS-07)

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `SERVER DMS WORKER` $\rightarrow$ `DATABASE` $\rightarrow$ `GMAIL SMTP` $\rightarrow$ `OWNER` |
| **4 Mốc nhắc nhở định kỳ** | Worker tự động kiểm tra thời gian còn lại đến `FreezeAt` và gửi email cảnh báo:<br/>1. `STAGE_SUSPENDED`: Ngay khi bắt đầu tạm treo.<br/>2. `STAGE_30_DAYS`: Khi còn 30 ngày trước khi đóng băng.<br/>3. `STAGE_7_DAYS`: Khi còn 7 ngày trước khi đóng băng.<br/>4. `STAGE_24_HOURS`: Khi còn 24 giờ trước khi đóng băng. |
| **Cơ chế chống gửi trùng** | Sử dụng bảng `[dbo].[DmsNotificationLogs]` với ràng buộc duy nhất `UNIQUE(VaultId, Stage, FreezeAt)` $\rightarrow$ Đảm bảo mỗi mốc chỉ gửi duy nhất 1 lần cho mỗi đợt tạm treo, không gửi lặp khi worker chạy lại mỗi giờ. |
| **Phục hồi muộn (`DMS-06`)** | Trong suốt thời gian tạm treo, nếu Owner đăng nhập và bấm Check-in $\rightarrow$ Đi vào giao dịch tại Bước 03, khôi phục `ACTIVE`, đồng thời đóng task của Executor với trạng thái `OWNER_CHECKED_IN`. |

---

### BƯỚC 06: WORKER ĐÓNG BĂNG AN TOÀN `FROZEN_INACTIVITY` TỪNG KHO (DMS-09)

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `SERVER DMS WORKER` $\rightarrow$ `DATABASE` $\rightarrow$ `CLIENT` $\rightarrow$ `GMAIL SMTP` |
| **Điều kiện kích hoạt** | Worker phát hiện: `VaultStatus == 'CHECKIN_SUSPENDED'` VÀ `FreezeAt <= GETUTCDATE()` VÀ không có hồ sơ chứng tử nào đang `UNDER_REVIEW` hoặc `APPROVED_FOR_DELIVERY`. |
| **Giao dịch từng kho (Per-Vault)** | Xử lý từng kho riêng biệt trong vòng lặp Worker để ghi nhận chính xác bản ghi kiểm toán `AuditEvents` cho từng kho thực tế chuyển trạng thái: |
| **Truy vấn SQL Server** | ```sql
BEGIN TRANSACTION;
UPDATE [dbo].[Vaults] WITH (UPDLOCK, ROWLOCK)
SET VaultStatus = 'FROZEN_INACTIVITY',
    UpdatedAt = GETUTCDATE()
WHERE VaultId = @VaultId 
  AND VaultStatus = 'CHECKIN_SUSPENDED'
  AND FreezeAt <= GETUTCDATE();

-- Ghi sổ kiểm toán chính xác cho kho này
INSERT INTO [dbo].[AuditEvents] (EventId, EventType, UserId, Timestamp, Details)
VALUES (NEWID(), 'DMS_VAULT_FROZEN_INACTIVITY', @OwnerId, GETUTCDATE(), 
        'Vault transitioned to FROZEN_INACTIVITY after 90 days silence. Data preserved safely without auto-wipe.');

-- Xếp hàng gửi email thông báo đóng băng
INSERT INTO [dbo].[OutboxEmails] (EmailId, RecipientEmail, TemplateCode, PayloadJson, Status)
VALUES (NEWID(), @OwnerEmail, 'DMS_FROZEN_NOTICE', @FrozenPayload, 'PENDING');
COMMIT TRANSACTION;
``` |
| **Trạng thái đóng băng** | • Kho chuyển sang chế độ **Chỉ đọc (Read-only)** đối với Owner.<br/>• Cấm thêm, sửa, xóa tài sản và thay đổi người thụ hưởng.<br/>• **Không tự xóa dữ liệu và không bàn giao di sản**.<br/>• Owner vẫn có quyền đăng nhập và phục hồi kho bất kỳ lúc nào nếu chưa có hồ sơ chứng tử được nộp. |

---

## 4. CƠ SỞ DỮ LIỆU & BẢNG THỰC THỂ HOÀN CHỈNH (SQL SERVER 2022)

```sql
-- 1. Cấu hình và mốc trạng thái DMS trong bảng [Vaults]
ALTER TABLE [dbo].[Vaults]
ADD [CycleDays] INT NOT NULL DEFAULT 30,
    [GracePeriodDays] INT NOT NULL DEFAULT 7,
    [NextCheckInDue] DATETIME2(7) NULL,
    [GracePeriodExpiresAt] DATETIME2(7) NULL,
    [SuspendedAt] DATETIME2(7) NULL,
    [FreezeAt] DATETIME2(7) NULL,
    [LastCheckInAt] DATETIME2(7) NULL;

-- 2. Bảng nhật ký điểm danh sinh tồn [CheckInLogs]
CREATE TABLE [dbo].[CheckInLogs] (
    [LogId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    [VaultId] UNIQUEIDENTIFIER NOT NULL,
    [CheckInTime] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    [IpAddress] NVARCHAR(45) NULL,
    [UserAgent] NVARCHAR(500) NULL,
    [Method] NVARCHAR(50) NOT NULL, -- 'WEB_DASHBOARD' | 'EMAIL_CONFIRMATION'
    CONSTRAINT [FK_CheckInLogs_Vaults] FOREIGN KEY ([VaultId]) REFERENCES [dbo].[Vaults]([VaultId])
);

-- 3. Bảng Token điểm danh Email 1 lần [DmsCheckInTokens]
CREATE TABLE [dbo].[DmsCheckInTokens] (
    [TokenId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    [VaultId] UNIQUEIDENTIFIER NOT NULL,
    [TokenHash] NVARCHAR(128) NOT NULL, -- SHA-256 Hash của token ngẫu nhiên
    [Purpose] NVARCHAR(50) NOT NULL DEFAULT 'DMS_CHECKIN',
    [ExpiresAt] DATETIME2(7) NOT NULL,
    [UsedAt] DATETIME2(7) NULL,
    [CreatedAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [FK_DmsTokens_Vaults] FOREIGN KEY ([VaultId]) REFERENCES [dbo].[Vaults]([VaultId])
);

-- 4. Bảng công việc cảnh báo Executor [ExecutorAlertTasks]
CREATE TABLE [dbo].[ExecutorAlertTasks] (
    [TaskId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    [VaultId] UNIQUEIDENTIFIER NOT NULL,
    [ExecutorId] UNIQUEIDENTIFIER NOT NULL,
    [Status] NVARCHAR(50) NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'NO_CERTIFICATE_AVAILABLE' | 'OWNER_CHECKED_IN' | 'CLOSED'
    [TriggeredAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    [ResolvedAt] DATETIME2(7) NULL,
    [ResolutionNotes] NVARCHAR(1000) NULL,
    CONSTRAINT [FK_ExecutorAlertTasks_Vaults] FOREIGN KEY ([VaultId]) REFERENCES [dbo].[Vaults]([VaultId])
);

-- 5. Bảng ghi vết thông báo đa mốc chống gửi trùng [DmsNotificationLogs]
CREATE TABLE [dbo].[DmsNotificationLogs] (
    [NotificationId] UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
    [VaultId] UNIQUEIDENTIFIER NOT NULL,
    [Stage] NVARCHAR(50) NOT NULL, -- 'SUSPENDED' | 'STAGE_30_DAYS' | 'STAGE_7_DAYS' | 'STAGE_24_HOURS' | 'FROZEN'
    [FreezeAt] DATETIME2(7) NOT NULL,
    [SentAt] DATETIME2(7) NOT NULL DEFAULT GETUTCDATE(),
    CONSTRAINT [UQ_DmsNotifications_Vault_Stage] UNIQUE ([VaultId], [Stage], [FreezeAt]),
    CONSTRAINT [FK_DmsNotifications_Vaults] FOREIGN KEY ([VaultId]) REFERENCES [dbo].[Vaults]([VaultId])
);
```

---

## 5. MÃ NGUỒN CONTROLLER & WORKER (.NET 8 WEBAPI)

```csharp
// 1. DTO Cấu hình với Custom Validation Set
public record UpdateDmsSettingsRequest
{
    private static readonly int[] ValidCycles = { 30, 60, 90 };
    private static readonly int[] ValidGraces = { 7, 14, 30 };

    [Required]
    public int CycleDays { get; init; }

    [Required]
    public int GracePeriodDays { get; init; }

    public bool IsValid(out string error)
    {
        if (!ValidCycles.Contains(CycleDays))
        {
            error = "CycleDays chỉ được chọn 30, 60 hoặc 90 ngày.";
            return false;
        }
        if (!ValidGraces.Contains(GracePeriodDays))
        {
            error = "GracePeriodDays chỉ được chọn 7, 14 hoặc 30 ngày.";
            return false;
        }
        error = string.Empty;
        return true;
    }
}

// 2. DmsController xử lý API
[ApiController]
[Route("api/v1/dms")]
public class DmsController : ControllerBase
{
    private readonly IDmsService _dmsService;
    public DmsController(IDmsService dmsService) => _dmsService = dmsService;

    [Authorize(Roles = "OWNER")]
    [HttpPut("settings")]
    public async Task<IActionResult> UpdateSettings([FromBody] UpdateDmsSettingsRequest request)
    {
        if (!request.IsValid(out var error))
            return BadRequest(new ProblemDetails { Detail = error, Status = 400 });

        await _dmsService.UpdateSettingsAsync(User.GetUserId(), request);
        return Ok(new { message = "Cập nhật cấu hình thành công. Sẽ áp dụng từ kỳ điểm danh tiếp theo." });
    }

    [Authorize(Roles = "OWNER")]
    [HttpPost("check-in")]
    public async Task<IActionResult> CheckInFromDashboard()
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var ua = Request.Headers["User-Agent"].ToString();
        await _dmsService.ProcessCheckInAsync(User.GetUserId(), "WEB_DASHBOARD", null, ip, ua);
        return Ok(new { message = "Điểm danh sinh tồn thành công! Chu kỳ điểm danh đã được đặt lại." });
    }

    [HttpPost("confirm-email-checkin")]
    public async Task<IActionResult> ConfirmEmailCheckIn([FromBody] ConfirmEmailCheckInRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
        var ua = Request.Headers["User-Agent"].ToString();
        await _dmsService.ProcessCheckInAsync(null, "EMAIL_CONFIRMATION", request.RawToken, ip, ua);
        return Ok(new { message = "Xác nhận an toàn qua email thành công!" });
    }

    [Authorize(Roles = "EXECUTOR")]
    [HttpPost("executor-alert/{taskId}/respond")]
    public async Task<IActionResult> RespondToAlert(Guid taskId, [FromBody] ExecutorAlertResponseRequest request)
    {
        await _dmsService.ResolveExecutorAlertAsync(User.GetUserId(), taskId, request);
        return Ok(new { message = "Đã ghi nhận phản hồi xác minh của Executor." });
    }
}
```

---

## 6. HƯỚNG DẪN IMPORT VÀO DRAW.IO (DIAGRAMS.NET)

1. Mở trình duyệt: **[app.diagrams.net](https://app.diagrams.net)**.
2. Chọn menu **Tệp (File)** $\rightarrow$ **Mở từ (Open from)** $\rightarrow$ **Thiết bị (Device)**.
3. Chọn tệp: [`docs/04_business_flows/FLOW_03_SYSTEM_MERGED.xml`](./FLOW_03_SYSTEM_MERGED.xml).
4. Kiểm tra sơ đồ: Toàn bộ 6 làn bơi được hiển thị với các luồng Worker quét độc lập, điểm danh an toàn và cơ chế đóng băng bảo toàn dữ liệu.
