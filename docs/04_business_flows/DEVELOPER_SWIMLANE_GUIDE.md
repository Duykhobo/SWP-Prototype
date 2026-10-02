# HƯỚNG DẪN LẬP TRÌNH THEO SƠ ĐỒ SWIMLANE KỸ THUẬT (DEVELOPER CODE SPEC)
## HỆ THỐNG LEGACYVAULT - CLEAN ARCHITECTURE .NET 8 & REACT 19
**Tệp đồ họa tương ứng**: [`FLOW_02_SYSTEM_MERGED.xml`](./FLOW_02_SYSTEM_MERGED.xml)  
*(Cách xem: Mở [app.diagrams.net](https://app.diagrams.net) $\rightarrow$ Chọn **File** $\rightarrow$ **Open From** $\rightarrow$ **Device** $\rightarrow$ Chọn tệp `.xml` này).*

---

## 1. CẤU TRÚC 4 LÀN BƠI (SWIMLANES) DÀNH CHO LẬP TRÌNH VIÊN

Sơ đồ phân định trách nhiệm thành **4 tầng kiến trúc phần mềm thực tế**:

1. **LÀN 1: FRONTEND LAYER (React 19 + TypeScript + TailwindCSS)**:
   * Thư mục mã nguồn: `client/src/features/*`, `client/src/shared/*`.
   * Trách nhiệm: Thu thập thao tác người dùng, gửi request qua `axiosClient`, bảo mật **RAM-Only State** (không lưu token ra localStorage).
2. **LÀN 2: BACKEND APPLICATION LAYER (.NET 8 WebApi & Clean Architecture)**:
   * Thư mục mã nguồn: `server/LegacyVault.Prototype.WebApi/Controllers/*`, `server/LegacyVault.Prototype.Application/Services/*`.
   * Trách nhiệm: Định tuyến API, kiểm tra ràng buộc nghiệp vụ (DTO Validation), điều phối xác thực.
3. **LÀN 3: CRYPTO ENGINE & INFRASTRUCTURE LAYER**:
   * Thư mục mã nguồn: `server/LegacyVault.Prototype.Infrastructure/Services/*`.
   * Trách nhiệm: Thuật toán mật mã (AES-256-GCM, Shamir SSS 2/3), kết nối đám mây (AWS S3 Client tới Cloudflare R2), dịch vụ gửi email (MailKit SMTP).
4. **LÀN 4: EXTERNAL SERVICES & DATA PERSISTENCE**:
   * Nhà cung cấp: Google Identity Services (OIDC), FPT.AI Marketplace & Vision, Cloudflare R2 Private S3, Database / MemoryCache.

---

## 2. BẢNG TRA CỨU CODE CHI TIẾT TỪNG BƯỚC (STEP-BY-STEP DEV CHEATSHEET)

### BƯỚC 1: ĐĂNG NHẬP GOOGLE OIDC & XÁC THỰC MFA OTP

| Thông số kỹ thuật | Mã nguồn Frontend (React 19) | Mã nguồn Backend (.NET 8) | Dịch vụ ngoài (External) |
| :--- | :--- | :--- | :--- |
| **Tệp tin (File)** | `client/src/features/auth-oidc/GoogleOidcTestbench.tsx` | `server/.../Controllers/AuthController.cs` | Google Identity Services (`gsi/client`) |
| **API Endpoint** | `POST /api/v1/auth/google` | `[HttpPost("google")]` | `https://accounts.google.com/o/oauth2/auth` |
| **Request Payload** | `{"idToken": "eyJhbGciOiJSUzI1NiIs..."}` | DTO: `GoogleAuthRequest { IdToken }` | Header Authorization |
| **Hàm xử lý cốt lõi** | `window.google.accounts.id.renderButton` | `await GoogleJsonWebSignature.ValidateAsync(idToken)` | Ký phát Token RS256 |
| **MFA OTP Engine** | Nhập OTP 6 chữ số vào ô xác thực | `MailKitEmailService.SendOtpEmailAsync(email, otp)` | `smtp.gmail.com:587` (TLS 1.3) |
| **Quản lý Token (Rule 1.3)** | Lưu trong React Context / Memory State | Trả về: `{"accessToken": "...", "requiresMfa": false}` | **CẤM** lưu vào `localStorage` |

---

### BƯỚC 2: XÁC MINH DANH TÍNH THỦ CÔNG & KHẢO SÁT eKYC TƯƠNG LAI (MỤC SỐ 6)

| Thông số kỹ thuật | Mã nguồn Frontend (React 19) | Mã nguồn Backend (.NET 8) | Cơ chế thẩm định & Định hướng AI |
| :--- | :--- | :--- | :--- |
| **Tệp tin (File)** | `client/src/features/ekyc-verification/ManualIdentityVerificationFlow.tsx`<br/>*(Tham chiếu: `EkycTestbench.tsx`)* | `server/.../Controllers/EkycController.cs`<br/>`server/.../Services/EkycService.cs` | Thẩm định thủ công bởi Chuyên viên Verifier (Đối chiếu CCCD gắn chip / Hộ chiếu) |
| **Quy trình 4 bước** | 1. Nộp hồ sơ danh tính<br/>2. Verifier đối chiếu hồ sơ<br/>3. Ghi nhận Chờ duyệt ➔ Đã duyệt/Từ chối<br/>4. Hồ sơ chuyển giao (Cần nhưng chưa đủ) | Bắt buộc lưu `verifier_id`, `verified_at` và `reason` trong Sổ kiểm toán (Audit Trail) | Tuân thủ Đ.616, 624 BLDS 2015 & Nghị định 13/2023/NĐ-CP (Retention & Wipe) |
| **Dữ liệu giấy tờ** | Form nộp ảnh CCCD mặt trước, mặt sau, chân dung | Tệp giấy tờ được phân quyền chỉ cho Verifier xem; áp dụng thời hạn lưu trữ | Không lưu vĩnh viễn trên public storage |
| **Khảo sát eKYC AI** | Tab 2-4: FPT.AI Spec Sandbox, Tesseract OCR WASM, MediaPipe Face | Các endpoint PoC: `/api/v1/ekyc/ocr`, `/api/v1/ekyc/liveness-face-match` | Định hướng công cụ trợ lý trích xuất tương lai; không thay thế con người |

---

### BƯỚC 3: MÃ HÓA PHONG BÌ (ENVELOPE), PHÂN MẢNH SHAMIR & ĐẨY LÊN R2

| Thông số kỹ thuật | Mã nguồn Frontend (React 19) | Mã nguồn Backend & Infra (.NET 8) | Cơ sở dữ liệu & Cloud Storage |
| :--- | :--- | :--- | :--- |
| **Tệp tin (File)** | `client/src/features/crypto-envelope/CryptoEnvelopeTestbench.tsx` | `server/.../Services/CryptoEnvelopeService.cs`<br/>`server/.../Services/ShamirSecretSharingService.cs` | `server/.../Services/CloudflareR2StorageService.cs` |
| **API Endpoint** | `POST /api/v1/crypto/encrypt-envelope` | `[HttpPost("encrypt-envelope")]` | Giao thức AWS S3 REST API (v4 Sign) |
| **Thuật toán cốt lõi** | Thu thập 3 nhóm dữ liệu & Video 15s | 1. `RandomNumberGenerator.GetBytes(32)` (DEK 256-bit)<br/>2. `AesGcm.Encrypt(nonce, plaintext, cipher, tag)`<br/>3. `Shamir.Split(dek, threshold: 2, totalShares: 3)` | Upload tệp `.enc` lên Bucket `legacyvault-prototype-private` |
| **Phân phối 3 mảnh khóa** | Nhận kết quả trạng thái niêm phong | **Mảnh 1**: Lưu Database bảng `VaultShares` (Encrypted)<br/>**Mảnh 2**: Gửi phân vùng Verifier / Legal Custody<br/>**Mảnh 3**: Giao cho Executor bảo quản | Khóa gốc DEK bị xóa sạch khỏi RAM ngay sau khi phân mảnh |
| **Dấu vết pháp lý** | Nhận chuỗi SHA-256 Checksum | Gắn nhãn dấu thời gian `RFC 3161 TSA` | Lưu vào bảng Audit Log (Đ.12, 15 Luật GDĐT 2023) |

---

### BƯỚC 4: VẬN HÀNH GIÁM SÁT SỰ SỐNG (DEAD MAN'S SWITCH)

| Thông số kỹ thuật | Mã nguồn Frontend (React 19) | Mã nguồn Backend (.NET 8 Worker) | Cơ chế vận hành |
| :--- | :--- | :--- | :--- |
| **Tệp tin (File)** | `client/src/widgets/LiveDmsHeartbeatCard.tsx` | `server/.../BackgroundJobs/DmsHeartbeatWorker.cs` | Quartz.NET hoặc HostedService cronjob |
| **API Endpoint** | `POST /api/v1/dms/check-in` | `[HttpPost("check-in")]` | Cập nhật `Vault.LastCheckIn = DateTime.UtcNow` |
| **Trạng thái (State)** | `DRAFT` $\rightarrow$ `ACTIVE_MONITORING` | Kiểm tra chu kỳ (ví dụ: mỗi 30 ngày) | Nếu quá hạn: Kích hoạt `GracePeriodDays = 14` |
| **Thông báo cảnh báo** | Hiển thị đồng hồ đếm ngược Heartbeat | Gửi email nhắc nhở qua `MailKitEmailService` | Điều 120 BLDS 2015 (Giao dịch có điều kiện) |

---

### BƯỚC 5: XỬ LÝ CLAIM TỬ TUẤT, TIME-LOCK 30 NGÀY & BÀN GIAO DI SẢN

| Thông số kỹ thuật | Mã nguồn Frontend (React 19) | Mã nguồn Backend (.NET 8) | Cơ chế chống gian lận & Bàn giao |
| :--- | :--- | :--- | :--- |
| **Tệp tin (File)** | `client/src/features/rescue-timelock/RescueTimeLockTestbench.tsx` | `server/.../Controllers/RescueTimeLockController.cs` | `server/.../Services/ShamirSecretSharingService.cs` |
| **Kích hoạt Claim** | Executor nộp đơn + Xác minh danh tính CCCD | `POST /api/v1/timelock/initiate-claim` | Đổi trạng thái: `PENDING_VERIFICATION` |
| **Khóa đệm Time-Lock** | Đếm ngược 30 ngày hoãn hủy | Khóa cứng dữ liệu, cấm giải mã | Bắn email Red Alert tới Chủ kho qua MailKit |
| **Cơ chế 1-Click Cancel** | Bấm nút: "Hủy bỏ yêu cầu mở kho" | `POST /api/v1/timelock/cancel-claim` | **Hủy Claim ngay lập tức**, tước quyền Executor |
| **Giải mã bàn giao (Hết hạn Time-Lock)** | Beneficiary nhấp link nhận di sản | `Shamir.Reconstruct(share1, share2/3)` $\rightarrow$ Khôi phục DEK | Xóa vĩnh viễn Nhóm 3 (Bí mật đời tư) theo Đ.38 BLDS, trao quyền tải cho Người thụ hưởng |

---

## 3. HƯỚNG DẪN IMPORT VÀO DRAW.IO (DIAGRAMS.NET)

1. Mở trình duyệt web và truy cập: **[app.diagrams.net](https://app.diagrams.net)**.
2. Trên thanh menu, chọn: **Tệp (File)** $\rightarrow$ **Mở từ (Open from)** $\rightarrow$ **Thiết bị (Device)**.
3. Chọn tệp: **`c:\Users\ThanhDuy\Documents\01_Code_Projects\SWP-Prototype\docs\FLOW_02_SYSTEM_MERGED.xml`**.
4. Toàn bộ sơ đồ 4 làn bơi chi tiết sẽ xuất hiện với đầy đủ màu sắc Heritage Design System, các hàm API, DTO, mã nguồn frontend/backend và các đường mũi tên liên kết chuẩn xác!
