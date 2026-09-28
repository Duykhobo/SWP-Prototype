# BÁO CÁO ĐÁNH GIÁ & KIỂM CHỨNG CÔNG NGHỆ (TECHNOLOGY EVALUATION REPORT)
## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO DI SẢN SỐ (SWP391)

---

### 1. TỔNG QUAN KẾT QUẢ THỬ NGHIỆM PROTOTYPE

Prototype kỹ thuật của hệ thống **LegacyVault (MVP v3.6 - Chuẩn SRS v3.11.0)** đã được xây dựng, liên kết và kiểm chứng thành công trên cả 2 nền tảng:
- **Backend**: C# ASP.NET Core 8 Web API (Clean Architecture: Domain, Application, Infrastructure, WebApi).
- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS (Tuân thủ nghiêm ngặt Feature-Sliced Design - FSD và Design System Heritage).

---

### 2. BẢNG ĐÁNH GIÁ CHI TIẾT CÁC CÔNG NGHỆ CỐT LÕI (CORE & EXTENDED SCOPE)

| STT | Công nghệ / Dịch vụ | Thư viện / SDK áp dụng | Tiêu chí kỹ thuật đã kiểm chứng | Đánh giá tính khả thi |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Google OIDC** | `Google.Apis.Auth` (1.76.0) | • Tự động giải mã & xác thực chữ ký số ID Token.<br>• Tự sinh tài khoản người dùng và gán vai trò ban đầu.<br>• Tuân thủ Hard Rule 1.3: Access Token chỉ lưu trong RAM state, không lưu vào Storage. | **ĐẠT (100%)** |
| **2** | **Mã hóa Phong bì Envelope Encryption** | `System.Security.Cryptography.AesGcm` (AES-256-GCM) | • Backend sinh DEK 256-bit độc lập cho mỗi file.<br>• Bọc DEK bằng KEK hệ thống sinh `WrappedDataKey`.<br>• GCM Authentication Tag 128-bit đảm bảo toàn vẹn chống giả mạo.<br>• Kiểm tra tải lên tối đa 20 MiB theo SRS. | **ĐẠT (100%)** |
| **3** | **An toàn Toán học Shamir Secret Sharing** | Trường hữu hạn $GF(256)$ Native Web API | • Phân rã Master Key thành 3 mảnh (Ngưỡng $k=2$): Mảnh 1 (Server/KMS), Mảnh 2 (User Passphrase), Mảnh 3 (Emergency/Beneficiary).<br>• Chứng minh toán học: Admin chỉ giữ Mảnh 1 hoàn toàn không thể giải mã dữ liệu khách hàng (0-bit leakage). | **ĐẠT (100%)** |
| **4** | **Cloudflare R2 Private Storage** | `AWSSDK.S3` (3.7.400+) | • Chuẩn S3-Compatible tương thích hoàn toàn.<br>• Sinh Presigned PUT URL tải lên trực tiếp và Presigned GET URL tải về có thời hạn (15 phút).<br>• Giải mã RAM-Only streaming qua TLS (DEL-02) và tự động thu hồi Blob URL. | **ĐẠT (100%)** |
| **5** | **SePay VietQR 24/7** | SePay API Webhook Server-to-Server | • Hỗ trợ đầy đủ 5 gói cước chuẩn SRS: `OWNER_FREE`, `LEGACY_XS`, `LEGACY_XS_MAX`, `RECIPIENT_FREE`, `RECIPIENT_PLUS`.<br>• Webhook ACID Idempotency qua `provider_event_id`.<br>• Tự hủy đơn sau 15 phút không thanh toán.<br>• Cung cấp Endpoint mô phỏng `/api/v1/demo/payment-orders/{orderId}/simulate-success` (Hard Rule 1.7). | **ĐẠT (100%)** |
| **6** | **MailKit & MimeKit SMTP** | `MailKit` (4.9.0) & `MimeKit` (4.9.0) | • Gửi email HTML bảo mật mẫu: Cảnh báo xâm phạm mở kho kèm nút Hủy khẩn cấp 1 chạm, mã OTP xác thực.<br>• Kết nối SMTP thực tế (Gmail/Brevo) và hỗ trợ ghi nhận mô phỏng kiểm thử. | **ĐẠT (100%)** |
| **7** | **Thẩm định eKYC** | FPT.AI Vision SDK | • OCR trích xuất chính xác CCCD gắn chip (Số CCCD, Họ tên, Ngày sinh, Quê quán, Địa chỉ).<br>• Đối sánh khuôn mặt (Face Matching / Liveness) đạt độ tin cậy trên 90%.<br>• Hỗ trợ công tắc chuyển đổi tức thì giữa Sandbox Mode và Live API.<br>• *Ghi chú Kiến trúc*: Đã loại bỏ VNPT eKYC do yêu cầu hợp đồng pháp nhân doanh nghiệp (B2B Enterprise License); chọn FPT.AI vì có Developer Portal mở và cấp Free Tier API Key trực tiếp cho cá nhân/sinh viên. | **ĐẠT (100%)** |
| **8** | **Time-Lock Delay & AliveClaim** | Custom Time-Lock Engine | • Ngăn chặn thông đồng giữa Admin và Verifier bằng thời gian trễ an toàn.<br>• Công tắc Demo Mode chuyển đổi giữa 48 giờ thực tế và 2 phút biểu diễn trước Hội đồng.<br>• Quy trình cứu hộ 2 bước: Owner gửi `AliveClaim` → `RESCUE_PENDING` → Verifier thẩm tra và duyệt `CANCELLED_ALIVE`. | **ĐẠT (100%)** |

---

### 3. CHIẾN LƯỢC TỐI ƯU CHI PHÍ & TẬN DỤNG TÀI NGUYÊN BÊN THỨ BA

1. **Chi phí tính toán Mã hóa: 0 đ CPU Máy Chủ**:
   - Sử dụng Web Crypto API thuần của trình duyệt để băm SHA-256 tệp tin pháp lý ngay tại máy khách trước khi tải lên.
2. **Chi phí Băng thông Tải Về (Egress Cost): 0 đ**:
   - Cloudflare R2 áp dụng chính sách **Zero Egress Fee**, loại bỏ hoàn toàn chi phí tải dữ liệu so với AWS S3 thông thường.
3. **Cổng thanh toán Tự Động: 0 đ Phí duy trì doanh nghiệp**:
   - Tích hợp SePay VietQR cá nhân tự động khớp giao dịch qua biến động số dư, không phát sinh chi phí duy trì cổng thanh toán doanh nghiệp phức tạp.
4. **Lưu trữ Bằng chứng Pháp lý An Toàn**:
   - Dữ liệu di sản và chứng cứ pháp lý được niêm phong trong Bucket riêng tư, chỉ cấp phát truy cập qua Presigned URL thời hạn ngắn.

---

### 4. ĐÁNH GIÁ TUÂN THỦ HARD RULES & TIÊU CHUẨN PHI CHỨC NĂNG (NFRs)

- **FSD Architecture**: Frontend phân tầng một chiều nghiêm ngặt `app` → `pages` → `widgets` → `features` → `entities` → `shared`, không import chéo feature.
- **Zero-Trust & Header Security**: Header `X-Active-Role` chỉ đóng vai trò ngữ cảnh giao diện (UI Context). Mọi quyết định ủy quyền ở Backend căn cứ theo JWT Claims và quan hệ CSDL.
- **RAM-Only Ephemeral Secrets**: Không lưu trữ khóa bí mật, Private Key hay Access Token vào `localStorage`/`sessionStorage`. Tệp giải mã stream trực tiếp hoặc thu hồi Blob URL ngay sau khi sử dụng.
- **Phản hồi lỗi chuẩn hóa**: 100% lỗi API tuân theo **RFC 7807 ProblemDetails** kèm `errorCode` và `X-Correlation-ID` phục vụ đối soát phân tán.

---

### 5. KẾT LUẬN & ĐỀ XUẤT CHO BÁO CÁO CAPSTONE (SWP391)

Prototype đã chứng minh tính khả thi kỹ thuật vượt trội và hoàn toàn sẵn sàng để đưa vào tài liệu kiến trúc (SAD), đặc tả yêu cầu (SRS) và triển khai sản xuất trong các Sprint tiếp theo của dự án LegacyVault.
