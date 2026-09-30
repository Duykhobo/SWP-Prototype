# HƯỚNG DẪN LẬP TRÌNH THEO SƠ ĐỒ SWIMLANE KỸ THUẬT (DEVELOPER CODE SPEC)
## HỆ THỐNG LEGACYVAULT - CLEAN ARCHITECTURE .NET 8 & REACT 19
**Tệp đồ họa tương ứng**: [`docs/FLOW_02_SYSTEM_MERGED.xml`](file:///c:/Users/ThanhDuy/Documents/01_Code_Projects/SWP-Prototype/docs/FLOW_02_SYSTEM_MERGED.xml)  
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

### BƯỚC 2: ĐỊNH DANH ĐIỆN TỬ CÔNG DÂN eKYC FPT.AI (MỤC SỐ 6)

| Thông số kỹ thuật | Mã nguồn Frontend (React 19) | Mã nguồn Backend (.NET 8) | Dịch vụ ngoài (External) |
| :--- | :--- | :--- | :--- |
| **Tệp tin (File)** | `client/src/features/ekyc-verification/EkycTestbench.tsx` | `server/.../Controllers/EkycController.cs` | FPT.AI Vision & DMP Engine |
| **API Endpoints** | 1. `POST /api/v1/ekyc/ocr`<br/>2. `POST /api/v1/ekyc/match-face` | `[HttpPost("ocr")]`<br/>`[HttpPost("match-face")]` | `https://api.fpt.ai/vision/idr/vnm`<br/>`https://api.fpt.ai/dmp/checkface/v1` |
| **Dữ liệu gửi lên** | `FormData: image (frontCardFile)`, `selfie (selfieFile)` | Multipart/form-data $\rightarrow$ Forward sang FPT | Header: `api-key: sk-...` |
| **Điều kiện Code duyệt** | `confidence >= 0.75 && isTampered == false` | `matchScore >= 80 && isLive == true` | Tiêu chuẩn Quyết định 2345/QĐ-NHNN |
| **Cơ chế Fallback B2B** | Chuyển toggle `useSandbox: true` | `EkycService` trả về Preset Hợp lệ hoặc Giả mạo | Phòng chống lỗi 401 khi dùng Marketplace Key |

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
| **Kích hoạt Claim** | Executor nộp đơn + eKYC CCCD | `POST /api/v1/timelock/initiate-claim` | Đổi trạng thái: `PENDING_VERIFICATION` |
| **Khóa đệm Time-Lock** | Đếm ngược 30 ngày hoãn hủy | Khóa cứng dữ liệu, cấm giải mã | Bắn email Red Alert tới Chủ kho qua MailKit |
| **Cơ chế 1-Click Cancel** | Bấm nút: "Hủy bỏ yêu cầu mở kho" | `POST /api/v1/timelock/cancel-claim` | **Hủy Claim ngay lập tức**, tước quyền Executor |
| **Giải mã bàn giao (Hết hạn Time-Lock)** | Beneficiary nhấp link nhận di sản | `Shamir.Reconstruct(share1, share2/3)` $\rightarrow$ Khôi phục DEK | Xóa vĩnh viễn Nhóm 3 (Bí mật đời tư) theo Đ.38 BLDS, trao quyền tải cho Người thụ hưởng |

---

## 3. HƯỚNG DẪN IMPORT VÀO DRAW.IO (DIAGRAMS.NET)

1. Mở trình duyệt web và truy cập: **[app.diagrams.net](https://app.diagrams.net)**.
2. Trên thanh menu, chọn: **Tệp (File)** $\rightarrow$ **Mở từ (Open from)** $\rightarrow$ **Thiết bị (Device)**.
3. Chọn tệp: **`c:\Users\ThanhDuy\Documents\01_Code_Projects\SWP-Prototype\docs\FLOW_02_SYSTEM_MERGED.xml`**.
4. Toàn bộ sơ đồ 4 làn bơi chi tiết sẽ xuất hiện với đầy đủ màu sắc Heritage Design System, các hàm API, DTO, mã nguồn frontend/backend và các đường mũi tên liên kết chuẩn xác!
