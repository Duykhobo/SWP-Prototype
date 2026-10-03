# Bước 2 — JWT và SQL Server

## Phạm vi đã triển khai

- Giữ `net8.0` của repository; JWT Bearer và EF Core dùng phiên bản 8.0.29 tương ứng. Đích .NET 10 trong ERD là một đợt nâng runtime riêng.
- Đăng ký, đăng nhập mật khẩu và Google OIDC lưu `Persons`/`Users` trong SQL Server. Mật khẩu dùng ASP.NET Identity PasswordHasher (PBKDF2); bỏ SHA-256 một vòng và tài khoản mật khẩu mẫu.
- JWT ký HS256, kiểm tra issuer/audience/chữ ký/expiry/algorithm. `sub` là UserId, `person_id` là PersonId. API kiểm tra lại tài khoản và role trong DB; token của tài khoản bị khóa hoặc có claims cũ bị từ chối.
- Google được định danh bằng subject đã xác thực; audience lấy từ cấu hình server. Không tự liên kết tài khoản đã có chỉ vì trùng email.
- Axios nhận access token từ các response đăng nhập và gửi Bearer token cho API; token chỉ giữ trong RAM của tab, reload cần đăng nhập lại. Không dùng localStorage/sessionStorage.
- Danh tính caller không lấy từ query/body/header mô phỏng. Role trong giao diện không tạo ra quyền backend. ID tài nguyên đích, như người được mời, vẫn được truyền để backend kiểm tra.
- Migration khởi tạo `Persons`, `Users`, `Cases`, `CaseBundles`, `CaseBundleItems`, `CaseBundleItemRecipients`, `BeneficiaryHandoverDecisions`, `RecipientAuthorizations`, `Commitments`, `AccessGrants`. Có FK, unique index, rowversion và FK ghép giữ Decision/Grant cùng Bundle với Commitment.
- Lời mời khách trong service prototype không tạo vault hoặc thêm người nhận. Kiểm tra snapshot có sẵn, Executor, phiên họp và hạn phiên. Khi đã phát lời mời, service chặn chỉnh danh sách qua `ConfigureVaultAsync`.
- API mock bàn giao/video/timelock/crypto chỉ mở khi Development **và** `DemoMode:EnableLegacyTestbench=true`. Đăng nhập persona cũng cần Development **và** cờ riêng `EnablePersonaLogin=true`. Mặc định cả hai tắt; query/header không thể bật chúng.

## Cấu hình và chạy

Không có signing key mặc định hoặc fallback DB trong RAM. Dùng secret riêng cho môi trường thật; không dùng key/password công khai trong CI.

PowerShell, tại root repository:

```powershell
$env:ConnectionStrings__LegacyVault = 'Server=localhost;Database=LegacyVault;Trusted_Connection=True;TrustServerCertificate=True'
$env:Jwt__SigningKeyBase64 = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
# Giữ key ổn định trong secret store; đổi key sẽ làm token cũ không còn hợp lệ.
dotnet tool install --global dotnet-ef --version 8.0.29
dotnet ef database update --project server/LegacyVault.Prototype.Infrastructure
dotnet run --project server/LegacyVault.Prototype.WebApi
```

Migration được áp dụng bằng CLI có chủ đích; application không tự sửa schema khi startup. `LegacyVaultDbContextFactory` đọc biến môi trường connection string nên lệnh EF không cần signing key.

Gọi `POST /api/v1/auth/register` với email/mật khẩu 12–128 ký tự, hoặc `POST /api/v1/auth/password-login`. Dùng `accessToken` trả về trong `Authorization: Bearer <token>` cho API tiếp theo. Token hết hạn sau 15 phút mặc định; chưa triển khai refresh token. Đăng nhập form và OIDC giữ tên trường response tương thích với prototype.

## Phần còn lại ở Bước 3/4

Đây là nền tảng persistence, **chưa phải chuyển toàn bộ nghiệp vụ sang DB**. VideoSessionService, TimeLock, Payment và các grant/guest của testbench vẫn ở RAM. Các bảng Case/Bundle/Decision/Commitment/Grant đã có schema, chưa được service cũ sử dụng. Không chạy các service mock này như luồng bàn giao thật.

`AssetId`, `ContentVersionId`, `DesignationVersionId` và `EvidenceId` hiện là cột tham chiếu dành cho Bước 3; chưa có FK tới toàn bộ bảng phiên bản/chứng cứ. Quy tắc đóng băng tại SubmittedAt, bản sao designation recipients đầy đủ, lịch sử quyết định, audit và chống sửa snapshot ở DB sẽ triển khai trong Bước 3. Biện pháp khóa danh sách sau invitation ở prototype không thay cho quy tắc snapshot khi nộp hồ sơ.

Rowversion/unique index không thay cho transaction khóa Cases khi cấp Grant hoặc đặt Hold. Transaction đó, RecipientAuthorization dựa trên bằng chứng thật, WebAuthn thật, recovery Shamir và giải mã tệp thật là các phần tiếp theo. Payload khóa/tệp của testbench vẫn là mock; không chứng minh bảo mật end-to-end.

## Kiểm thử

Workflow `.github/workflows/backend.yml` chạy restore/build và toàn bộ test trên .NET 8 với SQL Server 2022 dùng một database CI tạm thời. Integration tests áp migration, kiểm tra model drift, tài khoản tồn tại sau tạo host mới, token giả, tài khoản bị khóa, persona mặc định tắt và FK chặn Commitment khác Bundle.

Chạy riêng unit tests khi không có SQL Server:

```powershell
dotnet test server/LegacyVault.Prototype.sln --filter 'FullyQualifiedName!~Integration'
```

Chạy đầy đủ test cần `ConnectionStrings__LegacyVault` trỏ tới database **dành riêng cho kiểm thử** và `Jwt__SigningKeyBase64` đã cấu hình. Không dùng database sản xuất để chạy integration tests.
