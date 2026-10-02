# ĐẶC TẢ CHI TIẾT TRIỂN KHAI CODE CHO LẬP TRÌNH VIÊN (DEVELOPER CODE SPEC)
## FLOW 01 · ĐĂNG NHẬP, XÁC THỰC, PHÂN QUYỀN PERSONA & TỰ ĐỘNG TẠO TÀI KHOẢN (JIT PROVISIONING)
**Ánh xạ trực tiếp từ Sơ đồ Swimlane draw.io**: `FLOW_01_SYSTEM_MERGED.xml` (Gồm 2 khối độc lập: 01A Google OIDC với 5 làn bơi & 01B Email/Password với 4 làn bơi, hội tụ tại Phần xử lý chung)  
**Tiêu chuẩn kiến trúc**: Clean Architecture .NET 8, React 19, Microsoft SQL Server 2022 / T-SQL, Google Identity Services (OIDC)

---

## 1. MỤC TIÊU & QUY ƯỚC NGHIỆP VỤ BẮT BUỘC

1. **Đa dạng hóa phương thức xác thực**:
   - **Google OIDC JIT**: Xác thực không mật khẩu bằng Google Identity Services (GIS). Tự động sinh tài khoản công dân trong SQL Server 2022 nếu là người dùng mới (Just-In-Time Provisioning).
   - **Form thường (Email/Mật khẩu)**: Băm mật khẩu kèm muối ngẫu nhiên (Salt) theo chuẩn `SEC-02`, tách biệt hoàn toàn mật khẩu đăng nhập khỏi Master KEK và mảnh khóa di sản.
   - **1-Click Persona Switcher**: Cho phép Hội đồng thẩm định và Giảng viên chuyển đổi tức thì giữa 5 vai diễn mẫu phục vụ kiểm thử tính năng và bảo vệ đồ án.

2. **Tuân thủ Tam quyền phân lập (`ASSIGN-06`)**:
   - Chủ tài sản (Owner), Người thực thi (Executor) và Người thẩm định độc lập (Verifier) bắt buộc là **3 `PersonId` độc lập khác nhau**.
   - Cấm Executor và Verifier đứng tên Người thụ hưởng (Beneficiary) trong cùng một hồ sơ di sản.
   - `PersonId` đại diện cho căn cước thực tế của con người, `UserId` đại diện cho thông tin tài khoản đăng nhập.

3. **Cơ sở dữ liệu bền vững (Microsoft SQL Server 2022)**:
   - Toàn bộ giao dịch tạo tài khoản JIT phải bọc trong `SqlTransaction` ACID để đảm bảo tính toàn vẹn giữa hai bảng `[dbo].[Persons]` và `[dbo].[Users]`.
   - Nhật ký đăng nhập bắt buộc ghi vào `[dbo].[AuditEvents]` phục vụ kiểm toán và truy vết pháp lý theo `AUDIT-01`.

---

## 2. BẢNG ĐẶC TẢ CHI TIẾT 6 BƯỚC TRIỂN KHAI (DEV IMPLEMENTATION MATRIX)

### BƯỚC 01: KHỞI TẠO ĐĂNG NHẬP & CHỌN PHƯƠNG THỨC XÁC THỰC

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `USER · NGƯỜI DÙNG` $\rightarrow$ `CLIENT (REACT 19 SANDBOX)` |
| **2 Phương thức xác thực** | Người dùng lựa chọn **1 trong 2 phương thức duy nhất**:<br/>1. **Google OIDC GIS (Không mật khẩu / Passwordless)**: Đăng nhập 1 chạm an toàn qua tài khoản Google.<br/>2. **Form mật khẩu (Email / Password)**: Đăng nhập truyền thống với cơ chế băm Salted Hash (SEC-02). |
| **Frontend Code** | `client/src/features/auth-oidc/GoogleOidcTestbench.tsx`<br/>• Render Google GIS Sign-in Button: `window.google.accounts.id.renderButton(...)`<br/>• Form Email/Password chuẩn kèm mã hóa bảo mật truyền qua TLS 1.3.<br/>• Sinh ngẫu nhiên mã Cryptographic Nonce 256-bit trong RAM chống tấn công phát lại (Replay Attack). |
| **Dữ liệu chuyển giao** | Gói tin Client State: `{ selectedProvider: "GOOGLE_OIDC" | "FORM_PASSWORD", nonce: "nonce_7f2b98a1c4" }` |
| **Xử lý nhánh lỗi E0.1** | **Popup Blocked / Network Timeout**:<br/>Trình duyệt chặn cửa sổ Google Sign-in $\rightarrow$ Hiển thị thông báo lỗi, tự động gợi ý chuyển sang phương thức Form Email/Mật khẩu. |

---

### BƯỚC 02: XÁC THỰC DANH TÍNH & KÝ SỐ TOKEN NGOẠI VI

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `GOOGLE OIDC GIS PROVIDER` / `CLIENT CRYPTO` |
| **Giao thức xác thực** | • **Google GIS**: Người dùng xác thực tài khoản Google $\rightarrow$ Máy chủ Google ký phát ID Token định dạng JWT (thuật toán RS256).<br/>• **Form thường**: Client thu thập mật khẩu, gửi an toàn qua kênh mã hóa TLS 1.3. |
| **Payload ID Token** | Header: `{"alg": "RS256", "kid": "9f82...", "typ": "JWT"}`<br/>Payload: `{"iss": "https://accounts.google.com", "sub": "108273619283746192837", "email": "duyen.beneficiary@gmail.com", "email_verified": true, "name": "Phạm Thị Duyên"}` |
| **Xử lý nhánh lỗi E0.2** | **Invalid Google Token**:<br/>ID Token bị can thiệp trên đường truyền hoặc hết hạn (`exp` trong quá khứ) $\rightarrow$ Callback hủy phiên, yêu cầu người dùng đăng nhập lại từ Bước 01. |

---

### BƯỚC 03: ĐỐI SOÁT TRUY VẤN CSDL SQL SERVER 2022

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `SERVER (.NET 8 WEBAPI)` $\rightarrow$ `CSDL SQL SERVER 2022` |
| **Backend Code** | `server/LegacyVault.Prototype.WebApi/Controllers/AuthController.cs`<br/>• `[HttpPost("google-oidc")]`<br/>• Xác minh chữ ký số Google JWKS qua thư viện `GoogleJsonWebSignature.ValidateAsync(idToken)`.<br/>• Thẩm định toàn diện: chữ ký `RS256`, `issuer == accounts.google.com`, `audience == GoogleClientId`, `exp > now`, và đối chiếu `nonce`. |
| **Truy vấn CSDL theo Google sub** | ```sql
SELECT u.UserId, u.PersonId, u.Email, u.Role, p.FullName, u.IsActive, u.IsLocked
FROM [dbo].[Users] u
INNER JOIN [dbo].[Persons] p ON u.PersonId = p.PersonId
WHERE u.AuthProvider = 'GOOGLE' AND u.ProviderSubjectId = @GoogleSub AND u.IsDeleted = 0;
``` |
| **Xử lý nhánh lỗi E0.3** | **Google Token Validation Failed**:<br/>Chữ ký không khớp hoặc token hết hạn/sai audience $\rightarrow$ Trả về `HTTP 401 Unauthorized`, mã lỗi `ERR_INVALID_OIDC_TOKEN`, ghi log bảo mật. |

---

### BƯỚC 04: TỰ ĐỘNG TẠO TÀI KHOẢN (JIT PROVISIONING) TRONG SQL SERVER 2022

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `SERVER (.NET 8 EF CORE 10)` $\rightarrow$ `CSDL SQL SERVER 2022` |
| **Nguyên tắc nghiệp vụ** | Nếu kết quả Bước 03 trả về 0 dòng (Người dùng chưa từng có tài khoản), hệ thống tự động khởi tạo giao dịch Just-In-Time (JIT) bảo đảm tính toàn vẹn thực thể. |
| **Giao dịch T-SQL ACID** | ```sql
BEGIN TRANSACTION;
DECLARE @NewPersonId UNIQUEIDENTIFIER = NEWID();

-- 1. Thêm công dân vào danh tính thực tế
INSERT INTO [dbo].[Persons] (PersonId, FullName, Email, CreatedAt)
VALUES (@NewPersonId, @FullName, @Email, GETUTCDATE());

-- 2. Thêm tài khoản truy cập hệ thống
INSERT INTO [dbo].[Users] (UserId, PersonId, Email, Role, AuthProvider, ProviderSubjectId, IsActive, CreatedAt)
VALUES (NEWID(), @NewPersonId, @Email, 'BENEFICIARY', 'GOOGLE', @GoogleSub, 1, GETUTCDATE());

COMMIT TRANSACTION;
``` |
| **Xử lý nhánh lỗi E0.4** | **Duplicate / Race Condition Email**:<br/>Hai phiên đăng nhập đồng thời cùng email $\rightarrow$ Vi phạm `UNIQUE(Email)` $\rightarrow$ Kích hoạt `ROLLBACK TRANSACTION`, phiên sau tự động chuyển sang đọc tài khoản đã tạo của phiên trước. |

---

### BƯỚC 05: KIỂM TRA TRẠNG THÁI TÀI KHOẢN, PHÁT HÀNH JWT & GHI NHẬT KÝ
 
| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `SERVER (.NET 8 WEBAPI)` |
| **Kiểm tra trạng thái tài khoản** | Bắt buộc kiểm tra `user.IsActive && !user.IsLocked` trước khi phát hành phiên.<br/>$\rightarrow$ Nếu tài khoản bị khóa/vô hiệu hóa: Trả về `HTTP 403 Forbidden`, mã lỗi `E0.5_ACCOUNT_LOCKED`. |
| **Backend Code** | `server/LegacyVault.Prototype.WebApi/Controllers/AuthController.cs`<br/>• Sinh JWT Access Token ký bảo mật bằng thuật toán HS256 (`HMAC-SHA256`).<br/>• Nhúng đầy đủ các Claims: `sub`, `person_id`, `email`, `role`.<br/>• *Lưu ý*: Quy tắc tam quyền phân lập `ASSIGN-06` được thực thi ở tầng nghiệp vụ Kế hoạch di sản (dựa trên `PersonId`), không thể chỉ dựa vào claim đăng nhập ban đầu. |
| **Ghi nhật ký kiểm toán** | Ghi nhận **chỉ khi phát hành phiên thành công**:<br/>```sql
INSERT INTO [dbo].[AuditEvents] (EventId, UserId, PersonId, Action, Details, IpAddress, Timestamp)
VALUES (NEWID(), @UserId, @PersonId, 'AUTH_LOGIN_SUCCESS', N'Đăng nhập thành công', @ClientIp, GETUTCDATE());
``` |
| **Phản hồi HTTP 200** | ```json
{
  "success": true,
  "authMethod": "GOOGLE_OIDC_JIT",
  "accessToken": "jwt_oidc_44444444_a1b2c3...",
  "persona": {
    "personId": "44444444-4444-4444-4444-444444444444",
    "role": "BENEFICIARY",
    "name": "Phạm Thị Duyên",
    "email": "duyen.beneficiary@gmail.com"
  },
  "message": "Đăng nhập thành công!"
}
``` |

---

### BƯỚC 06: LƯU TRỮ TOKEN TRONG RAM & RENDER GIAO DIỆN THEO PHÂN QUYỀN

| Thành phần | Chi tiết kỹ thuật triển khai |
| :--- | :--- |
| **Làn bơi (Lanes)** | `CLIENT (REACT 19 APPLICATION)` |
| **Frontend Code** | `client/src/features/auth-oidc/GoogleOidcTestbench.tsx`<br/>• Nhận Access Token, lưu trong RAM Context (`Hard Rule 1.3`: tuyệt đối không lưu ra LocalStorage chống XSS).<br/>• Nếu reload trang: Kích hoạt phiên xác thực nền hoặc yêu cầu xác thực lại.<br/>• Điều hướng về dashboard theo vai trò thực tế (`Owner`, `Executor`, `Verifier`, `Admin`). |

---

## 3. DANH MỤC CÁC NHÁNH NGOẠI LỆ & QUY TRÌNH HỒI QUY (ROLLBACK MATRIX)

| Mã lỗi | Tên ngoại lệ | Nguyên nhân kích hoạt | Tuyến hồi quy (Rollback) | Hành động khắc phục |
| :---: | :--- | :--- | :--- | :--- |
| **E0.1** | `POPUP_BLOCKED` | Trình duyệt chặn popup hoặc mất kết nối mạng | Bước 01 | Gợi ý chuyển sang Form Email/Password hoặc thử lại. |
| **E0.2** | `INVALID_ID_TOKEN` | Token Google bị can thiệp hoặc hết hạn | Bước 01 | Xóa phiên tạm, thông báo lỗi xác thực, cho đăng nhập lại. |
| **E0.3** | `TOKEN_VALIDATION_FAILED` | Chữ ký số RS256 hoặc iss/aud/nonce không hợp lệ | Bước 01 | Từ chối cấp phiên với HTTP 401, ghi nhật ký bảo mật. |
| **E0.4** | `CONCURRENT_REGISTRATION` | Trùng định danh Google khi 2 request gửi đồng thời | Bước 03.1 | Tải lại tài khoản đã tồn tại cho cùng Google subject. |
| **E0.5** | `ACCOUNT_LOCKED_OR_INACTIVE` | Tài khoản bị vô hiệu hóa hoặc khóa tạm thời | Kết thúc | Trả về HTTP 403 Forbidden, hướng dẫn liên hệ Admin. |

---

## 4. MA TRẬN 5 VAI DIỄN MẪU BẢO VỆ ĐỒ ÁN (DEMO PERSONAS)

| Vai trò | Họ tên mẫu | PersonId mẫu (UUID v4) | Quyền hạn nghiệp vụ chính |
| :--- | :--- | :--- | :--- |
| 🏛️ **OWNER** | Nguyễn Văn Nam | `11111111-1111-1111-1111-111111111111` | Chủ sở hữu kho nguồn, mua gói cước, nạp tài sản số, chỉ định người nhận. |
| ⚖️ **EXECUTOR** | Trần Thị Bình | `22222222-2222-2222-2222-222222222222` | Luật sư thực thi độc lập (`ASSIGN-06`); nộp chứng từ và kích hoạt bàn giao. |
| 📜 **VERIFIER** | Lê Văn Cường | `33333333-3333-3333-3333-333333333333` | Chuyên viên thẩm định độc lập (`ASSIGN-06`); xác minh danh tính thủ công & thẩm định chứng tử. |
| 🎁 **BENEFICIARY** | Phạm Thị Duyên | `44444444-4444-4444-4444-444444444444` | Người thụ hưởng; tiếp nhận tài sản bàn giao, ký nhận 1:1 hoặc bỏ phiếu kho chung. |
| 🛡️ **ADMIN** | Admin Kỹ Thuật | `99999999-9999-9999-9999-999999999999` | Quản trị viên vận hành; theo dõi Audit Log, tuyệt đối không có khóa giải mã. |
