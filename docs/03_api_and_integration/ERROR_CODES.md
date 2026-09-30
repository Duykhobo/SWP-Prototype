# DANH MỤC MÃ LỖI ĐỒNG BỘ RFC 7807 (ERROR CODES SPECIFICATION)

## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO TÀI SẢN SỐ
### Phiên bản: Baseline 3.11.0 (26/09/2026) — Chuẩn Hóa Theo SRS v3.11.0
### Công nghệ: ASP.NET Core 10 (.NET 10 LTS) RFC 7807 ProblemDetails + React 19

---

## 1. ĐỊNH DẠNG PHẢN HỒI LỖI CHUẨN RFC 7807

Tất cả các phản hồi lỗi từ Backend ASP.NET Core 10 đều tuân theo chuẩn **RFC 7807 ProblemDetails** kèm mã lỗi định danh `errorCode` và `correlationId` để phục vụ truy vết phân tán:

```json
{
  "type": "https://legacyvault.vn/errors/handover",
  "title": "Chuyển Quyền Không Hợp Lệ",
  "status": 409,
  "detail": "Không thể thay đổi người nhận đích vì Người thực thi đã bấm Bắt đầu bàn giao.",
  "errorCode": "ERR_HANDOVER_FINALIZED_LOCKED",
  "correlationId": "8f3b7b4a-4e20-4e89-a2e6-7b8c4d123456",
  "timestamp": "2026-09-26T20:30:00Z"
}
```

---

## 2. BẢNG TRA CỨU MÃ LỖI NGHIỆP VỤ CHUẨN SRS 3.11.0

| Nhóm nghiệp vụ | Mã lỗi (`errorCode`) | HTTP Status | Thông điệp người dùng (`detail`) | Hướng xử lý phía Frontend |
| :--- | :--- | :---: | :--- | :--- |
| **Xác thực & Vai trò** | `ERR_AUTH_UNAUTHORIZED` | 401 | Phiên đăng nhập đã hết hạn hoặc không hợp lệ. | Tự động gọi `/api/v1/auth/refresh`; nếu thất bại điều hướng về `/login`. |
| **Xác thực & Vai trò** | `ERR_AUTH_FORBIDDEN` | 403 | Bạn không có quyền truy cập vào tài nguyên hoặc tài sản này. | Hiển thị màn hình 403 Không có quyền truy cập. |
| **Xác thực & Vai trò** | `ERR_ROLE_THREE_PERSON_CONFLICT` | 422 | Xung đột vai trò: Chủ sở hữu, Người thực thi và Người xác minh bắt buộc phải là 3 người khác nhau. | Hiển thị Inline Alert cảnh báo trên form; yêu cầu chọn người khác. |
| **Xác thực & Vai trò** | `ERR_BENEFICIARY_ROLE_CONFLICT` | 422 | Người thực thi hoặc Người xác minh không được đồng thời là Người nhận trong cùng hồ sơ di sản. | Báo lỗi và ngăn chặn gán vai trò có xung đột lợi ích. |
| **Kho & Tài Sản** | `ERR_ASSET_VERSION_LOCKED` | 409 | Tài sản này đã được đóng băng trong hồ sơ chứng tử đang xử lý; không thể chỉnh sửa hay xóa. | Khóa nút chỉnh sửa/xóa; hiển thị badge "Đang thẩm định". |
| **Lập Di Sản** | `ERR_SETUP_NO_RECIPIENT_DESIGNATED` | 422 | Mỗi tài sản đưa vào kế hoạch di sản bắt buộc phải gán ít nhất một người thụ hưởng. | Đánh dấu viền đỏ tài sản chưa gán người nhận tại Bước 2. |
| **Thẩm Định Chứng Tử**| `ERR_DEATH_ATTESTATION_REQUIRED` | 422 | Bạn bắt buộc phải tích chọn cam kết chịu trách nhiệm trước pháp luật để tiếp tục (`DEATH-02`). | Focus vào ô checkbox cam kết pháp lý; hiển thị cảnh báo bắt buộc. |
| **Thẩm Định Chứng Tử**| `ERR_DEATH_CERTIFICATE_INVALID` | 400 | Tệp tải lên không phải Giấy chứng tử hợp lệ hoặc vượt quá kích thước 20 MiB. | Hiển thị thông báo trên LegalDropzone; yêu cầu kiểm tra lại tệp. |
| **Bàn Giao Di Sản** | `ERR_HANDOVER_SCHEDULE_REQUIRED` | 422 | Người thực thi chưa nhập ngày hẹn bàn giao thống nhất cho toàn bộ hồ sơ. | Hiển thị modal nhắc Executor thiết lập ngày hẹn bàn giao chung qua `/api/v1/cases/{caseId}/handover-schedule`. |
| **Bàn Giao Di Sản** | `ERR_HANDOVER_NOT_STARTED` | 403 | Quá trình bàn giao chưa được bắt đầu bởi Người thực thi; chưa thể tiếp nhận. | Hiển thị trạng thái chờ Executor bấm "Bắt đầu bàn giao" (now >= ScheduledDeliveryDate). |
| **Bàn Giao Di Sản** | `ERR_DECISION_WINDOW_EXPIRED` | 409 | Cửa sổ 7 ngày phản hồi ban đầu đã kết thúc; kho đã chuyển sang đóng băng 2 năm (`FROZEN_RECONSIDERATION`). | Hiển thị thông báo kho đã đóng băng và mở nút "Ký Nhận di sản trong hạn 2 năm". |
| **Bàn Giao Di Sản** | `ERR_RECONSIDERATION_WINDOW_EXPIRED` | 409 | Thời hạn 2 năm suy nghĩ lại kể từ khi đóng băng kho bàn giao đã kết thúc (now >= FreezeExpiresAt). | Khóa hoàn toàn thao tác nhận; thông báo quyền bàn giao đã bị hủy vĩnh viễn (`TIME-01`). |
| **Chuyển Quyền 1:1** | `ERR_HANDOVER_FINALIZED_LOCKED` | 409 | Lựa chọn chuyển quyền đã bị chốt cố định do Người thực thi đã bắt đầu bàn giao. | Vô hiệu hóa nút chuyển quyền; hiển thị nhãn "Đã chốt lựa chọn". |
| **Chuyển Quyền 1:1** | `ERR_TRANSFER_CO_OWNED_FORBIDDEN` | 422 | Kho từ 2 người nhận trở lên (Đồng sở hữu) không được phép chuyển quyền 1:1. | Ẩn nút "Chuyển quyền" trên các kho có chế độ `CO_OWNED`. |
| **Chuyển Quyền 1:1** | `ERR_TRANSFER_TARGET_INVALID` | 422 | Người nhận đích được chọn không nằm trong danh sách người thụ hưởng hợp lệ của snapshot. | Cập nhật lại dropdown danh sách người nhận ứng viên. |
| **Đồng Sở Hữu** | `ERR_CO_OWNED_CONSENSUS_PENDING` | 422 | Kho đồng sở hữu yêu cầu 100% người nhận đồng thuận; hiện vẫn còn người chưa bấm Nhận. | Hiển thị danh sách tiến độ đồng thuận của các đồng sở hữu. |
| **Kho Cá Nhân** | `ERR_PERSONAL_VAULT_QUOTA_EXCEEDED` | 409 | Kho cá nhân của bạn đã vượt quá hạn mức lưu trữ (Quota). Vui lòng nâng lên gói Kho người nhận Plus (49.000đ/30 ngày). | Mở modal mời nâng cấp gói `RECIPIENT_PLUS` (49.000đ/30 ngày). |
| **Thanh Toán SePay** | `ERR_PAYMENT_ORDER_EXPIRED` | 409 | Đơn thanh toán VietQR đã hết hạn (quá 15 phút). Vui lòng tạo đơn mới. | Đóng modal QR cũ; tự động sinh mã QR đơn hàng mới. |
| **Hệ Thống** | `ERR_VALIDATION_FAILED` | 400 | Dữ liệu đầu vào không thỏa mãn schema validation. | Hiển thị thông báo lỗi chi tiết theo từng trường (React Hook Form). |
| **Hệ Thống** | `ERR_INTERNAL_SERVER_ERROR` | 500 | Hệ thống đang gặp sự cố không mong muốn. Vui lòng thử lại sau. | Bắt bằng GlobalErrorBoundary; hiển thị `correlationId` để hỗ trợ kỹ thuật. |

> [!NOTE]
> **Quy chuẩn Idempotency (Lũy thừa):**
> Khi Client gửi lại yêu cầu tạo `AccessGrant` hoặc Webhook thanh toán SePay gửi lặp với cùng `provider_event_id`, Backend **trả về HTTP 200 OK kèm dữ liệu đã tạo trước đó**, **tuyệt đối không trả HTTP 409 Conflict**.
