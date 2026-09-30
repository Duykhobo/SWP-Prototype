# QUY CHUẨN VÒNG ĐỜI TRẠNG THÁI NGHIỆP VỤ (STATE MACHINES)

## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO TÀI SẢN SỐ
### Phiên bản: Baseline 3.11.0 (26/09/2026) — Đồng Bộ Với SRS v3.11.0 & SAD
### Công nghệ: SQL Server 2022 + Entity Framework Core 10 (.NET 10 LTS) + React 19

---

## 1. VÒNG ĐỜI ĐIỂM DANH SINH TỒN (DEAD MAN'S SWITCH - DMS)

Theo đặc tả SRS 3.11.0 (Luồng 2A & 2B):
* Quá hạn điểm danh không tự kết luận qua đời, chuyển sang chế độ tạm treo và đóng băng an toàn.
* **Quy tắc bảo vệ dữ liệu (OPLAN-05 & OPLAN-06):**
  * Gói **Owner Free**: Dữ liệu **không bao giờ tự động xóa vật lý** do bất hoạt.
  * Các gói **Trả phí (Legacy XS & XS Max)**: Chỉ khi gói hết hạn, gửi thông báo cảnh báo 3 lần thất bại, và xác nhận **không có hồ sơ chứng tử nào đang thẩm định**, kho mới đủ điều kiện xóa dữ liệu vật lý.

```mermaid
stateDiagram-v2
    [*] --> ACTIVE: Chủ sở hữu kích hoạt kho & cấu hình chu kỳ (30/60/90 ngày)
    
    ACTIVE --> CHECKIN_PENDING: Đến hạn điểm danh (NextCheckInDue)
    CHECKIN_PENDING --> ACTIVE: Owner thực hiện điểm danh thành công trong thời gian chờ (7/14/30 ngày)
    
    CHECKIN_PENDING --> CHECKIN_SUSPENDED: Hết thời gian chờ điểm danh (GracePeriod)
    note right of CHECKIN_SUSPENDED
        TẠM TREO 90 NGÀY:
        - Gửi cảnh báo định kỳ cho Executor
        - Owner vẫn có thể điểm danh lại để khôi phục ACTIVE
    end note
    
    CHECKIN_SUSPENDED --> ACTIVE: Owner điểm danh hợp lệ trước khi hồ sơ chứng tử được nộp
    CHECKIN_SUSPENDED --> FROZEN_INACTIVITY: Hết 90 ngày tạm treo mà Owner vẫn im lặng
    note right of FROZEN_INACTIVITY
        ĐÓNG BĂNG BẤT HOẠT:
        - Không bàn giao di sản (Không tự suy đoán qua đời)
        - Đóng băng kho bảo vệ tài sản
    end note
    
    FROZEN_INACTIVITY --> DELETION_ELIGIBLE: Đạt điều kiện OPLAN-05/06 (Chỉ áp dụng gói trả phí hết hạn + Không có hồ sơ đang xử lý)
    note right of DELETION_ELIGIBLE
        XÓA VẬT LÝ AN TOÀN (OPLAN-05, OPLAN-06):
        - Gói Owner Free: Tuyệt đối không bao giờ tự động xóa
        - Gói trả phí: deletion_eligible_at = max(freeze_at + 30d, paid_plan_expires_at + 30d)
        - Thỏa mãn đủ 8 điều kiện chặn (không có Case, không có bàn giao, không có khiếu nại...)
    end note
```

---

## 2. VÒNG ĐỜI HỒ SƠ THẨM ĐỊNH CHỨNG TỬ (DEATH VERIFICATION CLAIM)

Theo đặc tả SRS 3.11.0 (Luồng 3A & 3B): Áp dụng nguyên tắc duyệt toàn bộ hồ sơ (All-or-Nothing) và bắt buộc 2 xác nhận cam kết trách nhiệm pháp lý độc lập (`DEATH-02`).

```mermaid
stateDiagram-v2
    [*] --> DRAFT: Executor khởi tạo hồ sơ yêu cầu bàn giao di sản
    
    DRAFT --> UNDER_REVIEW: Executor tải Giấy chứng tử + Tick cam kết pháp lý + Khóa CaseAsset Snapshot
    note right of UNDER_REVIEW
        ĐÓNG BĂNG SNAPSHOT BẤT BIẾN:
        Chụp lại toàn bộ kho bàn giao và tập người nhận
        đã được tự gom từ trước trong Kế hoạch di sản.
    end note
    
    UNDER_REVIEW --> ADDITIONAL_DOCUMENTS_REQUIRED: Verifier yêu cầu bổ sung chứng cứ / làm rõ hình ảnh
    ADDITIONAL_DOCUMENTS_REQUIRED --> UNDER_REVIEW: Executor tải bổ sung chứng từ theo yêu cầu
    
    UNDER_REVIEW --> APPROVED_FOR_DELIVERY: Verifier đối soát hợp lệ + Tick cam kết pháp lý phê duyệt
    UNDER_REVIEW --> REJECTED: Verifier từ chối hồ sơ (Chứng tử giả mạo / Không hợp lệ)
    
    APPROVED_FOR_DELIVERY --> [*]: Mở tiến trình hẹn ngày và thông báo bàn giao (Luồng 4A)
    REJECTED --> [*]: Hồ sơ kết thúc, kho nguồn giữ nguyên trạng thái
```

---

## 3. VÒNG ĐỜI KHO BÀN GIAO TỰ GOM (HANDOVER VAULT)

> [!IMPORTANT]
> **Điểm khởi tạo Kho bàn giao:** Kho bàn giao được hệ thống **tự gom TRƯỚC snapshot** ngay tại Bước 2 Lập di sản (Luồng 1B). Khi nộp hồ sơ, CSDL chỉ chụp lại snapshot các kho đã gom đó. Phê duyệt hồ sơ (`APPROVED_FOR_DELIVERY`) chỉ mở bước hẹn ngày và thông báo, **tuyệt đối không tạo lại kho gốc**.

```mermaid
stateDiagram-v2
    [*] --> PRE_BUNDLED: Tự động gom nhóm tại Bước 2 Lập Kế hoạch di sản (Luồng 1B)
    
    PRE_BUNDLED --> SNAPSHOTTED: Executor nộp hồ sơ chứng tử (Khóa cố định trong CaseAssetSnapshot)
    
    SNAPSHOTTED --> WAITING_FOR_SCHEDULE: Verifier duyệt APPROVED_FOR_DELIVERY (Mở quy trình bàn giao)
    
    WAITING_FOR_SCHEDULE --> SCHEDULED: Executor nhập ngày bàn giao chung cho toàn bộ hồ sơ (HandoverSchedules gắn với CaseId)
    
    SCHEDULED --> HANDOVER_STARTED: Executor bấm "Bắt đầu bàn giao" (Vào hoặc sau ngày đã hẹn của hồ sơ: now >= ScheduledDeliveryDate)
    note right of HANDOVER_STARTED
        CHỐT NGUYÊN TỬ:
        - Khóa cứng mọi lựa chọn chuyển quyền 1:1 (FINALIZED)
        - Mở cửa sổ phản hồi 7 ngày
    end note
    
    HANDOVER_STARTED --> PENDING_RESPONSE: Chờ phản hồi từ Người thụ hưởng
    
    PENDING_RESPONSE --> HANDOVER_COMMITTED: 100% người nhận bấm Nhận bàn giao (Đồng thuận đủ)
    note right of HANDOVER_COMMITTED: Cấp AccessGrant hiệu lực 168 giờ tải giải mã miễn phí
    
    PENDING_RESPONSE --> FROZEN_RECONSIDERATION: Có người bấm Từ chối HOẶC hết 7 ngày không phản hồi (Ghi FreezeStartedAt)
    note right of FROZEN_RECONSIDERATION
        ĐÓNG BĂNG SUY NGHĨ LẠI (2 NĂM LỊCH TỪ FreezeStartedAt - TIME-01):
        - Áp dụng cho cả người ĐÃ TỪ CHỐI lẫn người CHƯA PHẢN HỒI (Im lặng)
        - Ký Nhận hợp lệ khi now < FreezeExpiresAt qua API accept-during-freeze
        - Tại đúng hạn now >= FreezeExpiresAt: Khóa vĩnh viễn
        - Với kho đồng sở hữu: Đồng thuận đủ 100% sẽ mở lại quyền bàn giao
    end note
    
    FROZEN_RECONSIDERATION --> HANDOVER_COMMITTED: Người thụ hưởng ký Nhận trong thời hạn 2 năm (now < FreezeExpiresAt và đủ đồng thuận)
    FROZEN_RECONSIDERATION --> CANCELLED_WITHOUT_DELIVERY: Hết 2 năm lịch (now >= FreezeExpiresAt) mà chưa có kết quả Nhận hợp lệ
```

---

## 4. VÒNG ĐỜI LỰA CHỌN CHUYỂN QUYỀN 1:1 (TRANSFER CHOICE)

Theo đặc tả SRS 3.11.0 (Luồng 4B - `REDIST-01` đến `REDIST-06`): Chỉ áp dụng cho kho một người (`SINGLE_RECIPIENT`), chuyển nguyên kho cho người nhận hợp lệ khác trong cùng snapshot.

```mermaid
stateDiagram-v2
    [*] --> ACTIVE: Beneficiary chọn người nhận đích khác trong snapshot di sản
    
    ACTIVE --> REPLACED: Beneficiary đổi ý chọn sang một người nhận đích khác
    REPLACED --> ACTIVE: Thiết lập người nhận đích mới thành công
    
    ACTIVE --> CANCELLED: Beneficiary bấm hủy chuyển quyền (Quay lại tự nhận kho)
    
    ACTIVE --> FINALIZED: Executor bấm "Bắt đầu bàn giao"
    note right of FINALIZED
        CHỐT CỐ ĐỊNH (BẤT BIẾN):
        Không thể đổi đích hay hủy sau thời điểm này.
        Kho sẽ được bàn giao cho người nhận đích mới.
    end note
```

---

## 5. VÒNG ĐỜI ĐƠN HÀNG THANH TOÁN SEPAY VIETQR (PAYMENT ORDER)

Theo đặc tả SRS 3.11.0 (Luồng 1A & 4G): Cổng thanh toán VietQR SePay tự động 24/7 với thời hạn mã QR 15 phút.

```mermaid
stateDiagram-v2
    [*] --> PENDING: Người dùng chọn mua gói dịch vụ (Lưu snapshot gói/giá/quota, sinh mã QR VietQR hiệu lực 15 phút)
    
    PENDING --> PAID: Webhook SePay (now < ExpiresAt và đủ tiền) hoặc Demo Simulate hợp lệ
    note right of PAID
        KÍCH HOẠT DỊCH VỤ TỨC THÌ (ACID TRANSACTION):
        - Cấp entitlement dựa trên snapshot cấu hình gói của đơn hàng
        - Nâng hạn mức kho (Storage & Assets Quota)
        - Mở tính năng Kế hoạch di sản / Xuất PDF
    end note
    
    PENDING --> EXPIRED: Quá thời hạn 15 phút chưa thanh toán (now >= ExpiresAt)
    note right of EXPIRED
        HẾT HẠN (PAY-02, PAY-03):
        - Nếu callback đến sau 15 phút: Bắt buộc chuyển EXPIRED
        - TUYỆT ĐỐI KHÔNG CẤP ENTITLEMENT
    end note

    PENDING --> CANCELLED: Người dùng chủ động hủy đơn hàng
    
    PAID --> [*]: Trạng thái thanh toán cuối cùng (Bất biến)
    EXPIRED --> [*]
    CANCELLED --> [*]
```
