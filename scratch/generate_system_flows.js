const fs = require('fs');

const f1Xml = fs.readFileSync('docs/04_business_flows/FLOW_01_SYSTEM_MERGED.xml', 'utf8');
const f2Xml = fs.readFileSync('docs/04_business_flows/FLOW_02_SYSTEM_MERGED.xml', 'utf8');
const f3Xml = fs.readFileSync('docs/04_business_flows/FLOW_03_SYSTEM_MERGED.xml', 'utf8');

const flowsData = JSON.parse(fs.readFileSync('graphify-out/flows_data.json', 'utf8'));

// Code-grounded roadmaps linking each step directly to actual XML node IDs, source files, APIs, and code snippets
const flowRoadmaps = {
  flow1: [
    { 
      id: "start_node", num: "00", title: "Khởi Đầu Phiên Làm Việc", 
      desc: "Người dùng truy cập cổng LegacyVault qua trình duyệt bảo mật HTTPS (TLS 1.3).",
      file: "client/src/App.tsx",
      lang: "typescript",
      endpoint: "GET https://legacyvault.vn",
      rule: "SEC-01: Bắt buộc TLS 1.3",
      code: `// client/src/App.tsx
export const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState('OWNER');
  const [currentTab, setCurrentTab] = useState('dashboard');
  // Khởi tạo phiên làm việc bảo mật
  return <MainNavbar currentRole={currentRole} ... />;
};`
    },
    { 
      id: "step01_user_select", num: "01", title: "Chọn Phương Thức", 
      desc: "Lựa chọn giữa [Sign in with Google] và [Form Email / Mật Khẩu].",
      file: "client/src/features/auth-oidc/GoogleOidcTestbench.tsx",
      lang: "typescript",
      endpoint: "Client State Selector",
      rule: "Đa dạng hóa phương thức xác thực",
      code: `// client/src/features/auth-oidc/GoogleOidcTestbench.tsx
const [authMode, setAuthMode] = useState<'GOOGLE_OIDC' | 'FORM_PASSWORD'>('GOOGLE_OIDC');
// 1. Google OIDC GIS (Không mật khẩu / Passwordless)
// 2. Form mật khẩu (Salted Hash SEC-02)`
    },
    { 
      id: "dec_auth_method", num: "02", title: "Rẽ Nhánh Xác Thực", 
      desc: "Hệ thống kiểm tra phương thức: Đi nhánh Google OIDC (01A) hay Form thường (01B)?",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/AuthController.cs",
      lang: "csharp",
      endpoint: "POST /api/v1/auth/...",
      rule: "Nhánh 01A vs 01B",
      code: `// Điều phối định tuyến xác thực
if (authMode == "GOOGLE_OIDC") {
    // Nhánh 01A: Google Identity Services
    return await ValidateGoogleOidc(request, ct);
} else {
    // Nhánh 01B: Salted Hash Form
    return await LoginWithPassword(request);
}`
    },
    { 
      id: "step01a_user", num: "03", title: "Nhấp Chọn Google Sign-in", 
      desc: "Người dùng nhấp vào nút Google Sign-In chuẩn do SDK render.",
      file: "client/src/features/auth-oidc/GoogleOidcTestbench.tsx",
      lang: "typescript",
      endpoint: "OAuth 2.0 User Consent",
      rule: "Passwordless Authentication",
      code: `// Người dùng chọn đăng nhập 1 chạm qua tài khoản Google
<div id="google-btn" className="w-full flex justify-center py-2" />`
    },
    { 
      id: "step01_client_google", num: "04", title: "Khởi Tạo Google GIS", 
      desc: "Client sinh Cryptographic Nonce 256-bit trong RAM chống Replay Attack và gọi thư viện Google GIS.",
      file: "client/src/features/auth-oidc/GoogleOidcTestbench.tsx",
      lang: "typescript",
      endpoint: "window.google.accounts.id.initialize",
      rule: "Anti-Replay Attack",
      code: `// Sinh Cryptographic Nonce 256-bit ngẫu nhiên trong RAM
const nonceBytes = window.crypto.getRandomValues(new Uint8Array(32));
const clientNonce = Array.from(nonceBytes).map(b => b.toString(16).padStart(2, '0')).join('');
window.google.accounts.id.initialize({
  client_id: GOOGLE_CLIENT_ID,
  callback: handleGoogleCredentialResponse,
  nonce: clientNonce
});`
    },
    { 
      id: "dec_popup", num: "05", title: "Kiểm Tra Popup & Mạng", 
      desc: "Xác nhận kết nối Internet và cửa sổ Popup Google không bị trình duyệt chặn.",
      file: "client/src/features/auth-oidc/GoogleOidcTestbench.tsx",
      lang: "typescript",
      endpoint: "Client Browser Environment Check",
      rule: "Exception Guard E0.1A",
      code: `if (!navigator.onLine) {
  throw new NetworkException("E0.1A: Mất kết nối Internet!");
}`
    },
    { 
      id: "step02_google", num: "06", title: "Google Ký Token RS256", 
      desc: "Máy chủ Google phát hành ID Token JWT có chữ ký số bất đối xứng RS256 chứa GoogleSub.",
      file: "JWT Payload: accounts.google.com",
      lang: "json",
      endpoint: "JWT ID Token (RS256)",
      rule: "RFC 7519 / OIDC Core 1.0",
      code: `// Google ID Token Header & Payload
{ "alg": "RS256", "kid": "9f82ab3c...", "typ": "JWT" }
{
  "iss": "https://accounts.google.com",
  "sub": "108273619283746192837",
  "email": "nam.owner@legacyvault.vn",
  "email_verified": true,
  "name": "Nguyễn Văn Nam",
  "nonce": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}`
    },
    { 
      id: "step02_client_cb", num: "07", title: "Client Gửi Token", 
      desc: "Client thu nhận GIS callback và gửi ID Token + Nonce lên Backend API endpoint /api/v1/auth/google-oidc.",
      file: "client/src/features/auth-oidc/GoogleOidcTestbench.tsx",
      lang: "typescript",
      endpoint: "POST /api/v1/auth/google-oidc",
      rule: "TLS 1.3 Transport Security",
      code: `const response = await fetch('/api/v1/auth/google-oidc', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken, clientNonce })
});
const data = await response.json();`
    },
    { 
      id: "step03_server", num: "08", title: "Backend Thẩm Tra JWKS", 
      desc: "Backend thẩm tra chữ ký số RS256 với Google JWKS, kiểm tra Audience, Issuer và Nonce.",
      file: "server/LegacyVault.Prototype.Infrastructure/Services/GoogleOidcValidationService.cs",
      lang: "csharp",
      endpoint: "GoogleJsonWebSignature.ValidateAsync",
      rule: "SEC-03: Zero-Trust Token Verification",
      code: `// server/.../GoogleOidcValidationService.cs
var settings = new GoogleJsonWebSignature.ValidationSettings
{
    Audience = new[] { _config["GoogleOidc:ClientId"] }
};
var payload = await GoogleJsonWebSignature.ValidateAsync(idToken, settings);
if (!payload.EmailVerified || string.IsNullOrWhiteSpace(payload.Subject))
    return new OidcUserInfo { IsValid = false };`
    },
    { 
      id: "dec_jwks", num: "09", title: "Token & Nonce Hợp Lệ?", 
      desc: "Thẩm định chữ ký số Google JWKS thành công và Nonce trùng khớp với thử thách phiên?",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/AuthController.cs",
      lang: "csharp",
      endpoint: "Token Nonce Guard",
      rule: "E0.3: Mismatch Nonce / Expired Token",
      code: `if (!validationResult.IsValid || validationResult.Nonce != sessionChallenge) {
    return Unauthorized(new { code = "E0.3", message = "Invalid Token or Nonce mismatch" });
}`
    },
    { 
      id: "step03_query", num: "10", title: "Tìm Tài Khoản Theo Sub", 
      desc: "Tìm kiếm bản ghi người dùng trong [dbo].[Users] theo AuthProvider='GOOGLE' và ProviderKey = GoogleSub.",
      file: "docs/01_database_design/01_TABLE_DEFINITIONS.sql",
      lang: "sql",
      endpoint: "T-SQL Query",
      rule: "Database Indexing on ProviderSubjectId",
      code: `SELECT u.UserId, u.PersonId, u.Email, u.Role, p.FullName, u.IsActive
FROM [dbo].[Users] u
INNER JOIN [dbo].[Persons] p ON u.PersonId = p.PersonId
WHERE u.AuthProvider = 'GOOGLE' 
  AND u.ProviderSubjectId = @GoogleSub 
  AND u.IsDeleted = 0;`
    },
    { 
      id: "dec_user_exists", num: "11", title: "Kiểm Tra Tồn Tại", 
      desc: "Người dùng đã có tài khoản trong hệ thống hay là người dùng mới cần JIT Auto-Provisioning?",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/AuthController.cs",
      lang: "csharp",
      endpoint: "Branching Logic",
      rule: "JIT Detection",
      code: `if (user == null) {
    // Chưa tồn tại -> Chuyển sang JIT Auto-Provisioning (step04_jit)
    return await ProvisionNewUserAsync(payload);
} else {
    // Đã tồn tại -> Chuyển sang Cấp token phiên (step05_jwt_create)
    return IssueSessionTokens(user);
}`
    },
    { 
      id: "step04_jit", num: "12", title: "JIT Auto-Provisioning", 
      desc: "Tự động tạo đồng thời [dbo].[Persons] và [dbo].[Users] với quyền mặc định OWNER role.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/AuthController.cs",
      lang: "csharp",
      endpoint: "JIT Provisioning Engine",
      rule: "Default OWNER role (Beneficiary assigned later)",
      code: `// Khởi tạo công dân mới theo cơ chế JIT
var user = _users.GetOrAdd(userInfo.Email, email => new UserModel
{
    PersonId = Guid.NewGuid(),
    Email = email,
    FullName = userInfo.Name,
    Avatar = userInfo.Picture,
    Roles = new[] { "OWNER" },
    IsOidcAccount = true,
    CreatedAt = DateTime.UtcNow
});`
    },
    { 
      id: "step04_sql", num: "13", title: "Commit Giao Dịch ACID", 
      desc: "Thực thi SqlTransaction ACID tạo đồng thời Person và User để đảm bảo tính toàn vẹn tuyệt đối.",
      file: "docs/01_database_design/01_TABLE_DEFINITIONS.sql",
      lang: "sql",
      endpoint: "BEGIN TRANSACTION ... COMMIT",
      rule: "ACID Guarantee on Dual-Table Insert",
      code: `BEGIN TRANSACTION;
INSERT INTO [dbo].[Persons] (PersonId, FullName, Email)
VALUES (@PersonId, @FullName, @Email);
INSERT INTO [dbo].[Users] (UserId, PersonId, ProviderKey, Role, IsActive)
VALUES (NEWID(), @PersonId, @GoogleSub, 'OWNER', 1);
COMMIT TRANSACTION;`
    },
    { 
      id: "step05_jwt_create", num: "14", title: "Sinh Session Token", 
      desc: "Tạo HMAC-SHA256 JWT Access Token chứa Claims: sub, person_id, email, role.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/AuthController.cs",
      lang: "csharp",
      endpoint: "GenerateSessionToken",
      rule: "HMAC-SHA256 JWT (exp = 15m)",
      code: `var tokenHandler = new JwtSecurityTokenHandler();
var tokenDescriptor = new SecurityTokenDescriptor {
    Subject = new ClaimsIdentity(new[] {
        new Claim("sub", user.UserId.ToString()),
        new Claim("person_id", user.PersonId.ToString()),
        new Claim("email", user.Email),
        new Claim("role", "OWNER")
    }),
    Expires = DateTime.UtcNow.AddMinutes(15),
    SigningCredentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256Signature)
};`
    },
    { 
      id: "step05_audit_db", num: "15", title: "Ghi Nhật Ký AUDIT-01", 
      desc: "Lưu vết sự kiện đăng nhập, IP và timestamp vào bảng append-only [dbo].[AuditEvents].",
      file: "docs/01_database_design/01_TABLE_DEFINITIONS.sql",
      lang: "sql",
      endpoint: "INSERT [dbo].[AuditEvents]",
      rule: "AUDIT-01: Legal Audit Trail",
      code: `INSERT INTO [dbo].[AuditEvents] (EventId, UserId, Action, IpAddress, TimestampUtc, Details)
VALUES (NEWID(), @UserId, 'AUTH_LOGIN_SUCCESS', @ClientIp, SYSUTCDATETIME(), 'Google OIDC Login');`
    },
    { 
      id: "step05_jwt_return", num: "16", title: "Trả Về HTTP 200 OK", 
      desc: "Gửi phản hồi HTTP 200 kèm Access Token JWT và thông tin người dùng về Client.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/AuthController.cs",
      lang: "csharp",
      endpoint: "HTTP 200 OK",
      rule: "Return JWT Access Token to Client",
      code: `return Ok(new {
    success = true,
    accessToken = tokenString,
    user = new { id = user.PersonId, email = user.Email, role = "OWNER" },
    message = "Đăng nhập Google OIDC thành công!"
});`
    },
    { 
      id: "step06_client", num: "17", title: "Lưu Trữ Token Trong RAM", 
      desc: "Lưu Access Token trong React Context ephemeral RAM memory. Tránh Web Storage để giảm thiểu rủi ro XSS.",
      file: "client/src/shared/context/AuthContext.tsx",
      lang: "typescript",
      endpoint: "React Context State (RAM Only)",
      rule: "Ephemeral RAM Token Storage",
      code: `// Lưu JWT Access Token trong RAM của AuthContext
setAuthState({
  token: data.accessToken,
  user: data.user,
  isAuthenticated: true
});
// Không lưu vào localStorage/sessionStorage để hạn chế tấn công XSS`
    },
    { 
      id: "step07_dashboard", num: "18", title: "Hiển Thị Dashboard", 
      desc: "Gắn kết workspace theo vai trò được xác thực (Owner, Admin, Verifier, Executor, Beneficiary).",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "Role-Based Dashboard Mount",
      rule: "Phân quyền Owner / Admin / Verifier",
      code: `// Mount workspace cho Owner
return (
  <div className="dashboard-container">
    <OwnerHeader user={user} />
    <VaultOverview vaultId={vault.id} />
    <EstatePlanWizard />
  </div>
);`
    },
    { 
      id: "end_session", num: "19", title: "Phiên Đang Hoạt Động", 
      desc: "Phiên làm việc được thiết lập thành công, sẵn sàng chuyển tiếp sang FLOW 02 (Thiết lập Kế hoạch Di sản).",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "Proceed to FLOW 02",
      rule: "Session Active & Ready for Estate Setup",
      code: `// Sẵn sàng kích hoạt thiết lập Kế hoạch di sản (FLOW 02)
const handleStartEstatePlan = () => {
  navigate('/flow02-setup');
};`
    }
  ],
  flow2: [
    { 
      id: "offpage_from_flow01", num: "00", title: "Nhận Từ Flow 01", 
      desc: "Chủ kho đã đăng nhập thành công, nắm giữ Access Token hợp lệ.",
      file: "client/src/shared/context/AuthContext.tsx",
      lang: "typescript",
      endpoint: "Bearer Token Header",
      rule: "Authorized Bearer Token",
      code: `const authHeader = { Authorization: \`Bearer \${accessToken}\` };`
    },
    { 
      id: "s", num: "01", title: "Khởi Đầu Kho Di Sản", 
      desc: "Chủ sở hữu truy cập không gian làm việc thiết lập kho di sản số.",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "GET /api/v1/vault/active",
      rule: "Vault Initialization",
      code: `// Tải thông tin kho di sản của chủ sở hữu
const vault = await fetchVaultDetails(userId);`
    },
    { 
      id: "a1", num: "02", title: "Chọn Gói Cước Lưu Trữ", 
      desc: "Hiển thị các gói Free (100MB), XS (1GB - 199k), XSMax (10GB - 399k) và quyền lợi kích hoạt.",
      file: "client/src/features/payment-sepay/SePayTestbench.tsx",
      lang: "typescript",
      endpoint: "POST /api/v1/plans/select-tier",
      rule: "SRS v3.11.0: 3 Storage Tiers",
      code: `const TIERS = [
  { id: 'FREE', name: 'Free (100MB)', price: 0, canActivateEstate: false },
  { id: 'XS', name: 'XS (1GB)', price: 199000, canActivateEstate: true },
  { id: 'XSMAX', name: 'XS Max (10GB)', price: 399000, canActivateEstate: true }
];`
    },
    { 
      id: "a2", num: "03", title: "Kiểm Tra Hạn Ngạch & Quota", 
      desc: "Kiểm tra trạng thái đăng ký trong DB. Nếu nâng cấp gói trả phí -> Khởi tạo phiên thanh toán VietQR.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/PlanController.cs",
      lang: "csharp",
      endpoint: "POST /api/v1/plans/quota-check",
      rule: "Quota & Subscription Enforcement",
      code: `var plan = await _planService.GetPlanByUserIdAsync(userId);
if (plan.Tier == "FREE" && isRequestingActivation) {
    return StatusCode(402, "E1: Gói Free không được kích hoạt Kế hoạch Di sản!");
}`
    },
    { 
      id: "sepay_node", num: "04", title: "Thanh Toán SePay VietQR", 
      desc: "Tạo Dynamic VietQR NAPAS247 tự động; tiếp nhận giao dịch ngân hàng qua Webhook tức thì.",
      file: "client/src/components/modals/SePayPaymentModal.tsx",
      lang: "typescript",
      endpoint: "https://qr.sepay.vn/img?acc=...&amount=...",
      rule: "VietQR NAPAS 24/7 Standard",
      code: `// Sinh mã QR VietQR động kèm nội dung chuyển khoản bảo mật
const qrUrl = \`https://qr.sepay.vn/img?acc=\${SEPAY_ACC}&bank=MB&amount=\${plan.price}&des=LV_\${userId.slice(0,8)}\`;`
    },
    { 
      id: "d2", num: "05", title: "Quyền Lưu Trữ Hợp Lệ?", 
      desc: "Xác nhận hạn ngạch lưu trữ hợp lệ để cho phép tải tài sản lên hệ thống.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/PlanController.cs",
      lang: "csharp",
      endpoint: "Quota Decision",
      rule: "Storage Access Verification",
      code: `if (totalStorageUsed + newFileSize > plan.QuotaLimitBytes) {
    throw new QuotaExceededException("E1: Vượt quá dung lượng gói!");
}`
    },
    { 
      id: "a3", num: "06", title: "Nhập Thông Tin Tài Sản", 
      desc: "Chủ kho nhập thông tin tài sản hoặc chọn tệp (phân loại vào 3 nhóm pháp lý).",
      file: "client/src/components/modals/NewAssetModal.tsx",
      lang: "typescript",
      endpoint: "Asset Form Input",
      rule: "3 Legal Categories Classification",
      code: `const [assetCategory, setAssetCategory] = useState<'FINANCIAL' | 'LEGAL' | 'DIGITAL_SENTIMENTAL'>('FINANCIAL');`
    },
    { 
      id: "a4", num: "07", title: "Client Thẩm Định & Mật Khẩu", 
      desc: "Validate dữ liệu và dung lượng tệp (<= 20 MiB). Dẫn xuất Passphrase key và mở khóa Owner Share.",
      file: "client/src/features/crypto-envelope/CryptoEnvelopeTestbench.tsx",
      lang: "typescript",
      endpoint: "WebCrypto PBKDF2 / Argon2",
      rule: "Limit: <= 20 MiB / file",
      code: `if (file.size > 20 * 1024 * 1024) {
  throw new Error("Lỗi E2: Dung lượng tệp vượt quá 20MB giới hạn của hệ thống!");
}`
    },
    { 
      id: "d4", num: "08", title: "Dữ Liệu Đầu Vào Hợp Lệ?", 
      desc: "Kiểm tra Client-side: định dạng hợp lệ và dung lượng không vượt quá 20 MiB.",
      file: "client/src/features/crypto-envelope/CryptoEnvelopeTestbench.tsx",
      lang: "typescript",
      endpoint: "Validation Decision",
      rule: "E2: File Validation Gate",
      code: `const isValid = file && file.size <= 20 * 1024 * 1024 && passphrase.length >= 8;`
    },
    { 
      id: "a5", num: "09", title: "Mã Hóa AES-256-GCM Envelope", 
      desc: "Tái tạo KEK hiện tại; sinh DEK 256-bit mới; mã hóa nội dung với AAD; bọc DEK bằng KEK.",
      file: "server/LegacyVault.Prototype.Infrastructure/Services/EnvelopeEncryptionService.cs",
      lang: "csharp",
      endpoint: "EnvelopeEncryptionService.EncryptStreamAsync",
      rule: "NIST SP 800-38D / AES-256-GCM Envelope",
      code: `// Mã hóa Envelope Encryption chuẩn NIST
byte[] dek = RandomNumberGenerator.GetBytes(32);
byte[] nonce = RandomNumberGenerator.GetBytes(12);
byte[] tag = new byte[16];
using var aesGcm = new AesGcm(dek, 16);
aesGcm.Encrypt(nonce, plaintext, ciphertext, tag, aad);
string wrappedKey = WrapKey(dek, kek);`
    },
    { 
      id: "r2_node", num: "10", title: "Lưu Ciphertext R2", 
      desc: "Đẩy Ciphertext .enc lên Cloudflare R2 Bucket an toàn ($0 egress fee).",
      file: "server/LegacyVault.Prototype.Infrastructure/Services/CloudflareR2StorageService.cs",
      lang: "csharp",
      endpoint: "AmazonS3Client.PutObjectAsync",
      rule: "SEC-01: Zero-Knowledge Object Store",
      code: `string key = $"vaults/{vaultId}/assets/{assetId}/v1.enc";
var putRequest = new PutObjectRequest {
    BucketName = _r2Bucket,
    Key = key,
    InputStream = new MemoryStream(ciphertext)
};
await _s3Client.PutObjectAsync(putRequest);`
    },
    { 
      id: "a5_client", num: "11", title: "Client Xác Nhận Bản Lưu", 
      desc: "Nhận VersionId và kết quả tải lên; hiển thị phiên bản tài sản an toàn trên dashboard.",
      file: "client/src/components/modals/NewAssetModal.tsx",
      lang: "typescript",
      endpoint: "Upload Confirmation",
      rule: "Asset Versioning UI Update",
      code: `// Cập nhật danh sách tài sản đã mã hóa lên giao diện
setAssetList(prev => [...prev, savedAsset]);`
    },
    { 
      id: "a6", num: "12", title: "Chỉ Định Người Thụ Hưởng", 
      desc: "Khai báo hồ sơ Người thụ hưởng; phân bổ tỷ lệ phần trăm kế thừa (metadata, không phân tách tệp vật lý).",
      file: "client/src/features/allocation-map/AllocationMatrix.tsx",
      lang: "typescript",
      endpoint: "POST /api/v1/plans/beneficiaries",
      rule: "Allocation Metadata Management",
      code: `// Phân chia tỷ lệ thụ hưởng (tổng cộng phải đúng 100%)
const allocations = [
  { beneficiaryId: 'b1', percentage: 60, relation: 'CON_RUOT' },
  { beneficiaryId: 'b2', percentage: 40, relation: 'VO_CHONG' }
];`
    },
    { 
      id: "a7", num: "13", title: "Xác Thực & Lưu Manifest", 
      desc: "Validate danh sách thụ hưởng và tỷ lệ (<= 100%). Lưu PlanManifest bất biến vào DB.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/PlanController.cs",
      lang: "csharp",
      endpoint: "POST /api/v1/plans/manifest",
      rule: "Immutable PlanManifest Persistence",
      code: `if (allocations.Sum(a => a.Percentage) != 100) {
    return UnprocessableEntity("E4: Tổng tỷ lệ phân bổ phải đúng bằng 100%!");
}
await _planRepo.SaveManifestAsync(planId, manifest);`
    },
    { 
      id: "d7", num: "14", title: "Tỷ Lệ Phân Bổ Hợp Lệ?", 
      desc: "Kiểm tra tổng tỷ lệ phân bổ <= 100% và không có xung đột vai trò theo ASSIGN-06.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/PlanController.cs",
      lang: "csharp",
      endpoint: "Allocation Decision",
      rule: "Total <= 100% & No Role Conflict",
      code: `bool validAllocations = manifest.TotalPercentage == 100;`
    },
    { 
      id: "a8", num: "15", title: "Chỉ Định Người Thừa Hành", 
      desc: "Chỉ định Executor chính và dự phòng (Họ tên, SĐT, Email - tuân thủ quy tắc ASSIGN-06).",
      file: "client/src/features/executor-invitation/ExecutorInvitationFlow.tsx",
      lang: "typescript",
      endpoint: "POST /api/v1/plans/executors",
      rule: "ASSIGN-06: Tam quyền phân lập",
      code: `// Kiểm tra Tam quyền phân lập: Chủ kho != Người thừa hành != Thẩm định viên
if (executor.email === ownerEmail) {
  throw new Error("Vi phạm ASSIGN-06: Chủ kho không được tự làm Executor!");
}`
    },
    { 
      id: "a9", num: "16", title: "Tạo Token Mời Executor", 
      desc: "Tạo token mời nhận nhiệm vụ (TTL 48h). Yêu cầu Gmail SMTP gửi thư mời xác nhận.",
      file: "server/LegacyVault.Prototype.Infrastructure/Services/EmailService.cs",
      lang: "csharp",
      endpoint: "Generate Invitation Token (TTL 48h)",
      rule: "48-Hour Invitation Window",
      code: `var token = GenerateSecureInvitationToken(executorId, TimeSpan.FromHours(48));
await _emailService.SendExecutorInviteAsync(executor.Email, token);`
    },
    { 
      id: "mailkit_node", num: "17", title: "Dịch Vụ Gmail SMTP", 
      desc: "Gửi email bổ nhiệm có mã định danh và đường dẫn bảo mật qua giao thức TLS.",
      file: "server/LegacyVault.Prototype.Infrastructure/Services/EmailService.cs",
      lang: "csharp",
      endpoint: "Gmail SMTP Relay",
      rule: "Email Delivery Assurance",
      code: `// Gửi thư mời qua MailKit / Gmail SMTP
using var client = new SmtpClient();
await client.ConnectAsync("smtp.gmail.com", 587, SecureSocketOptions.StartTls);
await client.SendAsync(message);`
    },
    { 
      id: "d9", num: "18", title: "Executor Chấp Nhận?", 
      desc: "Người thừa hành đồng ý nhận nhiệm vụ trong vòng 48h hay từ chối/hết hạn?",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/ExecutorController.cs",
      lang: "csharp",
      endpoint: "POST /api/v1/executors/accept",
      rule: "48h SLA Window (Fallback backup executor)",
      code: `if (!isAccepted || isExpired) {
    // Kích hoạt tự động mời Executor dự phòng (E5)
    return await InviteBackupExecutorAsync(planId);
}`
    },
    { 
      id: "a9_server_record", num: "19", title: "Ghi Nhận Trạng Thái Executor", 
      desc: "Lưu ExecutorStatus = ACCEPTED trong DB. Mở khóa giai đoạn xác minh danh tính.",
      file: "docs/01_database_design/01_TABLE_DEFINITIONS.sql",
      lang: "sql",
      endpoint: "UPDATE [dbo].[PlanExecutors]",
      rule: "Executor Acceptance Committed",
      code: `UPDATE [dbo].[PlanExecutors]
SET Status = 'ACCEPTED', AcceptedAt = SYSUTCDATETIME()
WHERE PlanId = @PlanId AND ExecutorId = @ExecutorId;`
    },
    { 
      id: "a10", num: "20", title: "Chủ Kho Nộp Hồ Sơ eKYC", 
      desc: "Chủ sở hữu tải lên hình ảnh CCCD gắn chip và tài liệu nhân thân hỗ trợ.",
      file: "client/src/features/ekyc-verification/ManualIdentityVerificationFlow.tsx",
      lang: "typescript",
      endpoint: "POST /api/v1/verification/submit-dossier",
      rule: "KYC Compliance & ID Dossier",
      code: `// Tải hồ sơ định danh CCCD 2 mặt
const formData = new FormData();
formData.append('front', frontImage);
formData.append('back', backImage);
await submitDossier(formData);`
    },
    { 
      id: "a10_server", num: "21", title: "Lưu Hồ Sơ & Đưa Vào Hàng Đợi", 
      desc: "Lưu ảnh ID trong bộ nhớ riêng; đặt trạng thái PENDING_VERIFICATION và phân công Thẩm định viên.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/VerificationController.cs",
      lang: "csharp",
      endpoint: "Queue Dossier Review",
      rule: "Secure Evidence Storage",
      code: `await _storage.StorePrivateEvidenceAsync(dossierId, files);
await _verificationQueue.EnqueueAsync(new VerificationTask { DossierId = dossierId });`
    },
    { 
      id: "fptai_node", num: "22", title: "Thẩm Định Viên Duyệt Hồ Sơ", 
      desc: "Chuyên viên Verifier thẩm tra tính hợp pháp của giấy tờ CCCD, đối soát tính toàn vẹn.",
      file: "client/src/features/ekyc-verification/ManualIdentityVerificationFlow.tsx",
      lang: "typescript",
      endpoint: "Verifier Audit Portal",
      rule: "Manual Legal Attestation",
      code: `// Verifier xác nhận hồ sơ hợp lệ sau đối soát
const reviewPayload = { verifierId, status: 'APPROVED', notes: 'CCCD hợp lệ' };`
    },
    { 
      id: "d10", num: "23", title: "Quyết Định Thẩm Định?", 
      desc: "Hồ sơ danh tính được duyệt (VERIFIED) hay yêu cầu bổ sung/từ chối?",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/VerificationController.cs",
      lang: "csharp",
      endpoint: "Verification Decision",
      rule: "VERIFIED vs SUPPLEMENT_REQUIRED",
      code: `if (decision == "REJECTED") {
    return Ok(new { code = "E6", status = "SUPPLEMENT_REQUIRED" });
}`
    },
    { 
      id: "a10_record_verif", num: "24", title: "Lưu Nhật Ký Thẩm Định", 
      desc: "Lưu IdentityStatus = VERIFIED vào DB kèm ID thẩm định viên, timestamp và nhật ký kiểm toán.",
      file: "docs/01_database_design/01_TABLE_DEFINITIONS.sql",
      lang: "sql",
      endpoint: "UPDATE [dbo].[Users] SET IdentityStatus",
      rule: "Immutable Audit Log of Verifier",
      code: `UPDATE [dbo].[Users]
SET IdentityStatus = 'VERIFIED', VerifiedBy = @VerifierId, VerifiedAt = SYSUTCDATETIME()
WHERE UserId = @OwnerUserId;`
    },
    { 
      id: "a11", num: "25", title: "Chủ Kho Bấm Kích Hoạt", 
      desc: "Xác nhận cam đoan pháp lý và nhấp 'Activate Estate Plan' trên trang điều khiển.",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "User Legal Confirmation",
      rule: "Legal Consent & Final Attestation",
      code: `// Xác nhận kích hoạt Kế hoạch Di sản chính thức
const handleActivatePlan = async () => {
  await fetch(\`/api/v1/plans/\${planId}/activate\`, { method: 'POST' });
};`
    },
    { 
      id: "a11_client", num: "26", title: "Gửi Yêu Cầu Kích Hoạt", 
      desc: "Client gửi yêu cầu kích hoạt đến endpoint POST /api/v1/plans/{planId}/activate.",
      file: "client/src/features/plan-activation/PlanActivationButton.tsx",
      lang: "typescript",
      endpoint: "POST /api/v1/plans/{planId}/activate",
      rule: "API Activation Payload",
      code: `await apiClient.post(\`/plans/\${planId}/activate\`, { timestamp: Date.now() });`
    },
    { 
      id: "a12", num: "27", title: "Kiểm Thẩm Tiền Điều Kiện", 
      desc: "Kiểm tra 5 điều kiện tiên quyết: Gói >= XS, CCCD VERIFIED, Executor ACCEPTED, tài sản hợp lệ, manifest nguyên vẹn.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/PlanController.cs",
      lang: "csharp",
      endpoint: "Prerequisites Audit",
      rule: "5 Essential Activation Prerequisites",
      code: `bool isEligible = plan.Tier != "FREE" 
    && owner.IdentityStatus == "VERIFIED" 
    && executor.Status == "ACCEPTED" 
    && plan.HasValidAssets;
if (!isEligible) return UnprocessableEntity("E7: Thiếu điều kiện tiên quyết kích hoạt!");`
    },
    { 
      id: "d12", num: "28", title: "Đủ 5 Tiền Điều Kiện?", 
      desc: "Tất cả điều kiện pháp lý và kỹ thuật đều đã được thỏa mãn đầy đủ?",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/PlanController.cs",
      lang: "csharp",
      endpoint: "Final Eligibility Gate",
      rule: "All 5 Prerequisites Validated",
      code: `if (!allPrerequisitesSatisfied) {
    return StatusCode(422, new { code = "E7", checklist = pendingItems });
}`
    },
    { 
      id: "a13", num: "29", title: "Commit ACTIVE & Khởi Động DMS", 
      desc: "Giao dịch Serializable DB Transaction: Chuyển gói sang ACTIVE, khởi tạo chu kỳ điểm danh sinh tồn DMS.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/PlanController.cs",
      lang: "csharp",
      endpoint: "Atomic Serializable Transaction",
      rule: "Plan State: ACTIVE & DMS Clock Started",
      code: `using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);
plan.Status = "ACTIVE";
plan.ActivatedAt = DateTime.UtcNow;
vault.NextCheckInDue = DateTime.UtcNow.AddDays(plan.DmsCycleDays);
await _db.SaveChangesAsync();
await tx.CommitAsync();`
    },
    { 
      id: "a13_client", num: "30", title: "Client Hiển Thị Trạng Thái ACTIVE", 
      desc: "Giao diện cập nhật huy hiệu sang ACTIVE và bắt đầu hiển thị đồng hồ đếm ngược sinh tồn DMS.",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "UI State Update",
      rule: "Active Estate Plan Dashboard",
      code: `setPlanStatus('ACTIVE');
setDmsCountdownDays(30);`
    },
    { 
      id: "end", num: "31", title: "Kế Hoạch Đã Được Kích Hoạt", 
      desc: "Kế hoạch di sản chuyển sang trạng thái ACTIVE; Cơ chế DMS Heartbeat bắt đầu giám sát liên tục.",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "FLOW 02 COMPLETE -> Handover to FLOW 03",
      rule: "DMS Active Monitoring Loop",
      code: `// Kế hoạch đã vận hành; DMS Heartbeat Worker bắt đầu giám sát định kỳ`
    }
  ],
  flow3: [
    { 
      id: "offpage_from_flow02", num: "00", title: "Nhận Từ Flow 02", 
      desc: "Kế hoạch di sản đã ở trạng thái ACTIVE; chuyển giao sang quy trình giám sát sinh tồn DMS.",
      file: "server/LegacyVault.Prototype.Domain/VaultState.cs",
      lang: "csharp",
      endpoint: "State Transition: ACTIVE",
      rule: "Plan State Active",
      code: `// Vault chuyển trạng thái sẵn sàng giám sát sinh tồn
vault.Status = VaultState.ACTIVE;`
    },
    { 
      id: "s_start", num: "01", title: "Khởi Động Giám Sát DMS", 
      desc: "Cơ chế Heartbeat Monitoring chính thức bắt đầu vận hành.",
      file: "server/LegacyVault.Prototype.Infrastructure/Workers/DmsHeartbeatWorker.cs",
      lang: "csharp",
      endpoint: "DMS Engine Start",
      rule: "Autonomous Heartbeat Surveillance",
      code: `// Khởi động vòng lặp kiểm tra định kỳ hàng giờ
_logger.LogInformation("Khởi động DMS Heartbeat Worker cho kho di sản...");`
    },
    { 
      id: "io_owner_config", num: "02", title: "Cấu Hình Thiết Lập DMS", 
      desc: "Chủ kho chọn chu kỳ điểm danh (30/60/90 ngày) và thời gian ân hạn (7/14/30 ngày).",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "Client DMS Config Form",
      rule: "DMS User Parameters",
      code: `const [cycleDays, setCycleDays] = useState(30);
const [graceDays, setGraceDays] = useState(7);`
    },
    { 
      id: "io_client_submit_config", num: "03", title: "Gửi Cấu Hình Lên Server", 
      desc: "Gửi POST /api/v1/dms/settings với payload: {cycleDays, graceDays}.",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "POST /api/v1/dms/settings",
      rule: "DMS Configuration API",
      code: `await fetch('/api/v1/dms/settings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ cycleDays, graceDays })
});`
    },
    { 
      id: "proc_server_save_settings", num: "04", title: "Xử Lý Lịch Điểm Danh", 
      desc: "Server tính toán NextCheckInDue = now + CycleDays; thiết lập lịch kiểm tra kế tiếp.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/DmsController.cs",
      lang: "csharp",
      endpoint: "Calculate NextCheckInDue",
      rule: "NextDue = Now + CycleDays",
      code: `vault.CycleDays = request.CycleDays;
vault.GraceDays = request.GraceDays;
vault.NextCheckInDue = DateTime.UtcNow.AddDays(vault.CycleDays);`
    },
    { 
      id: "proc_db_save_schedule", num: "05", title: "Commit Cấu Hình DB", 
      desc: "Cập nhật [Vaults] SET NextCheckInDue & DmsSettings và ghi sổ [AuditEvents].",
      file: "docs/01_database_design/01_TABLE_DEFINITIONS.sql",
      lang: "sql",
      endpoint: "UPDATE [dbo].[Vaults]",
      rule: "COMMIT DmsSettings & AuditEvents",
      code: `UPDATE [dbo].[Vaults]
SET CycleDays = @CycleDays, GraceDays = @GraceDays, NextCheckInDue = @NextDue
WHERE VaultId = @VaultId;`
    },
    { 
      id: "io_client_render_card", num: "06", title: "Hiển Thị Thẻ Nhịp Tim", 
      desc: "Hiển thị ngày đến hạn NextDue và hiệu ứng xung nhịp màu xanh (Active Pulse) trên giao diện.",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "UI Heartbeat Card",
      rule: "Active Pulse Indicator",
      code: `<div className="heartbeat-card pulse-green">
  <span>Hạn điểm danh tiếp theo: {formatDate(nextCheckInDue)}</span>
</div>`
    },
    { 
      id: "proc_worker_cron", num: "07", title: "Worker Chạy Tự Động Hàng Giờ", 
      desc: "DmsHeartbeatWorker (HostedService) tự động rà soát trạng thái tất cả các kho di sản trong hệ thống.",
      file: "server/LegacyVault.Prototype.Infrastructure/Workers/DmsHeartbeatWorker.cs",
      lang: "csharp",
      endpoint: "PeriodicTimer Hourly Audit",
      rule: "Continuous Autonomous Scanning",
      code: `protected override async Task ExecuteAsync(CancellationToken ct) {
    using var timer = new PeriodicTimer(TimeSpan.FromHours(1));
    while (await timer.WaitForNextTickAsync(ct)) {
        await ScanHeartbeatsAsync(ct);
    }
}`
    },
    { 
      id: "dec_worker_active_scan", num: "08", title: "Kiểm Tra Hạn ACTIVE?", 
      desc: "Trạng thái có đang là 'ACTIVE' và thời gian hiện tại đã vượt quá NextDue (now >= NextDue)?",
      file: "server/LegacyVault.Prototype.Infrastructure/Workers/DmsHeartbeatWorker.cs",
      lang: "csharp",
      endpoint: "Worker Evaluation",
      rule: "Status == 'ACTIVE' && now >= NextDue",
      code: `var overdueVaults = await _context.Vaults
    .Where(v => v.Status == "ACTIVE" && DateTime.UtcNow >= v.NextCheckInDue)
    .ToListAsync(ct);`
    },
    { 
      id: "proc_trigger_grace", num: "09", title: "Chuyển Sang CHECKIN_PENDING", 
      desc: "Hết chu kỳ -> Chuyển trạng thái sang CHECKIN_PENDING; GraceExpiresAt = NextDue + GraceDays.",
      file: "server/LegacyVault.Prototype.Infrastructure/Workers/DmsHeartbeatWorker.cs",
      lang: "csharp",
      endpoint: "Trigger Grace Period",
      rule: "DMS-03: Grace Period Activation",
      code: `vault.Status = "CHECKIN_PENDING";
vault.GraceExpiresAt = vault.NextCheckInDue.AddDays(vault.GraceDays);
await EnqueueReminderEmailAsync(vault);`
    },
    { 
      id: "proc_db_save_pending", num: "10", title: "Commit CHECKIN_PENDING DB", 
      desc: "Cập nhật Status='CHECKIN_PENDING', GraceExpiresAt và đưa email nhắc nhở vào Outbox.",
      file: "docs/01_database_design/01_TABLE_DEFINITIONS.sql",
      lang: "sql",
      endpoint: "UPDATE Status='CHECKIN_PENDING'",
      rule: "Database Commit Pending State",
      code: `UPDATE [dbo].[Vaults]
SET Status = 'CHECKIN_PENDING', GraceExpiresAt = @GraceExpiresAt
WHERE VaultId = @VaultId;`
    },
    { 
      id: "io_smtp_reminder", num: "11", title: "Gửi Email Nhắc Nhở", 
      desc: "Gửi email chứa liên kết web xác nhận điểm danh an toàn (chống bot scanner tự động kích hoạt).",
      file: "server/LegacyVault.Prototype.Infrastructure/Services/EmailService.cs",
      lang: "csharp",
      endpoint: "Dispatch Reminder Email",
      rule: "Bot-Proof Check-in Link",
      code: `await _emailService.SendEmailAsync(ownerEmail, 
    "Nhắc nhở: Xác nhận an toàn tài khoản LegacyVault", 
    $"Vui lòng truy cập {checkInWebUrl} để bấm xác nhận sinh tồn.");`
    },
    { 
      id: "io_owner_ping", num: "12", title: "Chủ Kho Bấm 'I Am Alive'", 
      desc: "Chủ sở hữu xác nhận an toàn qua nút bấm 1 chạm trên Web Dashboard hoặc trang Email an toàn.",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "User Check-in Interaction",
      rule: "1-Click Survival Ping",
      code: `const handleIAmAlive = async () => {
  await fetch('/api/v1/dms/check-in', { method: 'POST', headers: authHeader });
};`
    },
    { 
      id: "io_client_send_checkin", num: "13", title: "Gửi Yêu Cầu Điểm Danh", 
      desc: "Gửi POST /api/v1/dms/check-in kèm Bearer JWT trong RAM hoặc CheckInToken từ email.",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "POST /api/v1/dms/check-in",
      rule: "Bearer Token / Ephemeral Ping",
      code: `await apiClient.post('/dms/check-in', { source: 'WEB_DASHBOARD' });`
    },
    { 
      id: "dec_validate_checkin", num: "14", title: "Kiểm Tra Điểm Danh Hợp Lệ?", 
      desc: "Token điểm danh hợp lệ và không có tranh chấp yêu cầu mở két đang thẩm định?",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/DmsController.cs",
      lang: "csharp",
      endpoint: "Check-in Validation Gate",
      rule: "Token Valid & No Active Death Claim Conflict",
      code: `if (hasActiveDeathClaimUnderReview) {
    vault.Status = "RESCUE_PENDING"; // Xung đột: Chủ kho ping sống trong khi có claim
    return StatusCode(409, "Xung đột: Hồ sơ yêu cầu mở két đang được Verifier xem xét!");
}`
    },
    { 
      id: "proc_reset_timer", num: "15", title: "ACID Check-in & Reset Hạn", 
      desc: "Ghi nhận CheckInLogs; khôi phục Status = 'ACTIVE'; thiết lập NextDue = now + Cycle; đóng các task cảnh báo.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/DmsController.cs",
      lang: "csharp",
      endpoint: "ACID Check-in Process",
      rule: "Timer Reset to Next Cycle",
      code: `using var tx = await _db.Database.BeginTransactionAsync();
_db.CheckInLogs.Add(new CheckInLog { VaultId = vaultId, Timestamp = DateTime.UtcNow });
vault.Status = "ACTIVE";
vault.LastCheckIn = DateTime.UtcNow;
vault.NextCheckInDue = DateTime.UtcNow.AddDays(vault.CycleDays);
await _db.SaveChangesAsync();
await tx.CommitAsync();`
    },
    { 
      id: "proc_db_save_checkin", num: "16", title: "Commit Check-in DB", 
      desc: "INSERT INTO [CheckInLogs]; UPDATE Status='ACTIVE', LastCheckIn=now; đóng các cảnh báo Executor.",
      file: "docs/01_database_design/01_TABLE_DEFINITIONS.sql",
      lang: "sql",
      endpoint: "COMMIT Check-in Transaction",
      rule: "Database State Committed",
      code: `INSERT INTO [dbo].[CheckInLogs] (LogId, VaultId, CheckInTime, IpAddress)
VALUES (NEWID(), @VaultId, SYSUTCDATETIME(), @Ip);
UPDATE [dbo].[Vaults] SET Status = 'ACTIVE', LastCheckIn = SYSUTCDATETIME() WHERE VaultId = @VaultId;`
    },
    { 
      id: "proc_client_pulse_active", num: "17", title: "Giao Diện Cập Nhật Active Pulse", 
      desc: "Giao diện cập nhật hiệu ứng xung nhịp màu xanh và hiển thị hạn NextDue mới vừa được máy chủ xác nhận.",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "UI State Reset",
      rule: "Dashboard Alive Pulse Restored",
      code: `setDaysRemaining(cycleDays);
setIsCheckInPending(false);`
    },
    { 
      id: "dec_worker_grace_scan", num: "18", title: "Hết Hạn Ân Hạn (Grace Period)?", 
      desc: "Worker kiểm tra: Trạng thái đang là CHECKIN_PENDING và đã vượt quá thời gian ân hạn (now >= GraceExpiresAt)?",
      file: "server/LegacyVault.Prototype.Infrastructure/Workers/DmsHeartbeatWorker.cs",
      lang: "csharp",
      endpoint: "Worker Grace Period Audit",
      rule: "Grace Period Expiration Check",
      code: `if (vault.Status == "CHECKIN_PENDING" && DateTime.UtcNow >= vault.GraceExpiresAt) {
    // Không phản hồi trong suốt ân hạn -> Chuyển sang SUSPENDED
}`
    },
    { 
      id: "proc_suspend_vault", num: "19", title: "Chuyển Sang CHECKIN_SUSPENDED", 
      desc: "Ghi nhận SuspendedAt = now; FreezeAt = GraceExpiresAt + 90 ngày. Bắt đầu đếm ngược 90 ngày đóng băng an toàn.",
      file: "server/LegacyVault.Prototype.Infrastructure/Workers/DmsHeartbeatWorker.cs",
      lang: "csharp",
      endpoint: "Suspend Vault",
      rule: "90-Day Freeze Countdown Initiated",
      code: `vault.Status = "CHECKIN_SUSPENDED";
vault.SuspendedAt = DateTime.UtcNow;
vault.FreezeAt = vault.GraceExpiresAt.Value.AddDays(90);`
    },
    { 
      id: "proc_db_save_suspension", num: "20", title: "Commit CHECKIN_SUSPENDED DB", 
      desc: "Cập nhật Status='CHECKIN_SUSPENDED', SuspendedAt=now, FreezeAt=due+90d vào cơ sở dữ liệu.",
      file: "docs/01_database_design/01_TABLE_DEFINITIONS.sql",
      lang: "sql",
      endpoint: "UPDATE Status='CHECKIN_SUSPENDED'",
      rule: "Database Suspension Committed",
      code: `UPDATE [dbo].[Vaults]
SET Status = 'CHECKIN_SUSPENDED', SuspendedAt = SYSUTCDATETIME(), FreezeAt = DATEADD(day, 90, @GraceExpiresAt)
WHERE VaultId = @VaultId;`
    },
    { 
      id: "io_client_suspended_ui", num: "21", title: "Hiển Thị Banner Tạm Đình Chỉ", 
      desc: "Hiển thị số ngày còn lại đến thời điểm đóng băng FreezeAt và nút khôi phục 1 chạm.",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "Suspension Alert Banner",
      rule: "1-Click Recovery Check-in Button",
      code: `<div className="banner-suspended">
  <p>Kho đang tạm dừng! Còn {daysToFreeze} ngày trước khi đóng băng an toàn.</p>
  <button onClick={handleLateCheckIn}>Khôi Phục Ngay</button>
</div>`
    },
    { 
      id: "dec_has_executor", num: "22", title: "Có Executor Hợp Lệ?", 
      desc: "Kiểm tra gói dịch vụ (XS/XSMax) có phân công Người thừa hành (Executor) hợp lệ hay không?",
      file: "server/LegacyVault.Prototype.Infrastructure/Workers/DmsHeartbeatWorker.cs",
      lang: "csharp",
      endpoint: "Executor Qualification Check",
      rule: "Executor Alert Eligibility",
      code: `var executor = await _context.PlanExecutors.FirstOrDefaultAsync(e => e.PlanId == planId && e.Status == "ACCEPTED");`
    },
    { 
      id: "proc_dispatch_exec_task", num: "23", title: "Tạo Task Cảnh Báo Cho Executor", 
      desc: "Tạo bản ghi ExecutorAlertTasks trong DB; hạn phản hồi SLA 72h. Không làm gián đoạn bộ đếm 90 ngày.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/ExecutorController.cs",
      lang: "csharp",
      endpoint: "Dispatch Executor Alert Task",
      rule: "72h SLA Verification Window",
      code: `var alertTask = new ExecutorAlertTask {
    TaskId = Guid.NewGuid(),
    VaultId = vaultId,
    ExecutorId = executor.Id,
    Deadline = DateTime.UtcNow.AddHours(72)
};
_context.ExecutorAlertTasks.Add(alertTask);`
    },
    { 
      id: "proc_db_save_exec_task", num: "24", title: "Commit Task Executor Vào DB", 
      desc: "INSERT INTO [ExecutorAlertTasks] và đưa email cảnh báo vào hàng đợi Outbox.",
      file: "docs/01_database_design/01_TABLE_DEFINITIONS.sql",
      lang: "sql",
      endpoint: "INSERT [dbo].[ExecutorAlertTasks]",
      rule: "Task Queued in Database",
      code: `INSERT INTO [dbo].[ExecutorAlertTasks] (TaskId, VaultId, ExecutorId, Status, Deadline)
VALUES (@TaskId, @VaultId, @ExecutorId, 'PENDING', DATEADD(hour, 72, SYSUTCDATETIME()));`
    },
    { 
      id: "io_smtp_exec_alert", num: "25", title: "Gửi Email Cảnh Báo Executor", 
      desc: "Gửi cảnh báo yêu cầu Người thừa hành kiểm tra tình trạng thực tế của Chủ kho (chưa suy đoán tử vong).",
      file: "server/LegacyVault.Prototype.Infrastructure/Services/EmailService.cs",
      lang: "csharp",
      endpoint: "Executor Alert Notification",
      rule: "Non-Presumption of Death",
      code: `await _emailService.SendExecutorAlertAsync(executor.Email,
    "Yêu cầu xác minh tình trạng Chủ sở hữu di sản",
    "Chủ kho không phản hồi điểm danh. Vui lòng xác minh tình trạng thực tế.");`
    },
    { 
      id: "io_exec_receive_alert", num: "26", title: "Executor Nhận Cảnh Báo", 
      desc: "Người thừa hành kiểm tra thực tế tình trạng sức khỏe/tính mạng của Chủ kho ngoài đời thực.",
      file: "client/src/pages/RecipientPage.tsx",
      lang: "typescript",
      endpoint: "Executor Investigation Portal",
      rule: "Real-world Status Verification",
      code: `// Executor nhận email và truy cập giao diện xác minh tình trạng Chủ kho`
    },
    { 
      id: "dec_exec_action", num: "27", title: "Kết Quả Xác Minh Thực Tế?", 
      desc: "Chủ kho còn sống / không có giấy tờ (14a) hay Chủ kho đã qua đời có Giấy chứng tử (14b)?",
      file: "client/src/features/ekyc-verification/ManualIdentityVerificationFlow.tsx",
      lang: "typescript",
      endpoint: "Executor Finding Decision",
      rule: "NO_CERTIFICATE vs DEATH_CLAIM",
      code: `if (finding === 'ALIVE_OR_NO_CERTIFICATE') {
  // Nhánh 14a: Chủ kho còn sống hoặc chưa có giấy chứng tử
  await submitStatusNoCertificate();
} else {
  // Nhánh 14b: Nộp hồ sơ yêu cầu mở két kèm Giấy chứng tử
  await submitDeathClaimDossier();
}`
    },
    { 
      id: "io_exec_submit_resp", num: "28", title: "Ghi Nhận Chưa Có Giấy Chứng Tử", 
      desc: "Ghi nhận trạng thái NO_CERTIFICATE_AVAILABLE; bộ đếm 90 ngày tiếp tục chạy bình thường.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/ExecutorController.cs",
      lang: "csharp",
      endpoint: "POST /api/v1/executor/respond",
      rule: "Status: NO_CERTIFICATE_AVAILABLE",
      code: `alertTask.Status = "NO_CERTIFICATE_AVAILABLE";
alertTask.CompletedAt = DateTime.UtcNow;
await _context.SaveChangesAsync();`
    },
    { 
      id: "offpage_exec_death_claim", num: "29", title: "Nộp Yêu Cầu Mở Két (Flow 04)", 
      desc: "Executor nộp Giấy chứng tử số hóa, chuyển tiếp sang FLOW 04 để Verifier thẩm định pháp lý.",
      file: "client/src/features/ekyc-verification/ManualIdentityVerificationFlow.tsx",
      lang: "typescript",
      endpoint: "To FLOW 04 (Legal Verification)",
      rule: "Handover to Legal Adjudication Flow",
      code: `// Chuyển tiếp hồ sơ mở két sang Flow 04 thẩm tra pháp lý`
    },
    { 
      id: "proc_staged_reminders", num: "30", title: "Gửi Email Nhắc Nhở Phân Tầng", 
      desc: "Tự động gửi email cảnh báo theo các mốc đếm ngược: Khởi đầu, 30 ngày, 7 ngày, 24 giờ trước khi đóng băng.",
      file: "server/LegacyVault.Prototype.Infrastructure/Services/EmailService.cs",
      lang: "csharp",
      endpoint: "Staged Reminder Engine",
      rule: "Milestones: 30d, 7d, 24h Warning",
      code: `await _emailService.SendStagedCountdownReminderAsync(vault.OwnerEmail, daysRemaining);`
    },
    { 
      id: "dec_freeze_reached", num: "31", title: "Đã Đến Hạn 90 Ngày?", 
      desc: "Worker kiểm tra: Trạng thái CHECKIN_SUSPENDED và đã hết 90 ngày (now >= FreezeAt)?",
      file: "server/LegacyVault.Prototype.Infrastructure/Workers/DmsHeartbeatWorker.cs",
      lang: "csharp",
      endpoint: "Freeze Milestone Evaluation",
      rule: "Status == 'CHECKIN_SUSPENDED' && now >= FreezeAt",
      code: `bool shouldFreeze = vault.Status == "CHECKIN_SUSPENDED" && DateTime.UtcNow >= vault.FreezeAt;`
    },
    { 
      id: "proc_freeze_vault", num: "32", title: "Thực Hiện Đóng Băng An Toàn", 
      desc: "Thực hiện giao dịch chuyển trạng thái sang FROZEN_INACTIVITY; khóa chỉnh sửa tài sản, bảo toàn dữ liệu vĩnh viễn.",
      file: "server/LegacyVault.Prototype.WebApi/Controllers/DmsController.cs",
      lang: "csharp",
      endpoint: "Safe Freeze Transaction",
      rule: "OPLAN-05: Absolute Data Preservation (Never Auto-Wipe)",
      code: `vault.Status = "FROZEN_INACTIVITY";
vault.FrozenAt = DateTime.UtcNow;
await _auditLogger.LogAuditEventAsync(vaultId, "VAULT_SAFELY_FROZEN_DUE_TO_INACTIVITY");`
    },
    { 
      id: "proc_db_save_freeze", num: "33", title: "Commit Trạng Thái FROZEN DB", 
      desc: "UPDATE Status='FROZEN_INACTIVITY', ghi [AuditEvents] và đưa thông báo đóng băng vào Outbox.",
      file: "docs/01_database_design/01_TABLE_DEFINITIONS.sql",
      lang: "sql",
      endpoint: "COMMIT FROZEN_INACTIVITY",
      rule: "Permanent Vault State Freeze",
      code: `UPDATE [dbo].[Vaults]
SET Status = 'FROZEN_INACTIVITY', FrozenAt = SYSUTCDATETIME()
WHERE VaultId = @VaultId;`
    },
    { 
      id: "io_client_frozen_ui", num: "34", title: "Hiển Thị Trạng Thái Đóng Băng", 
      desc: "Khóa toàn bộ tính năng chỉnh sửa/thêm tài sản; giữ chế độ chỉ đọc và hỗ trợ khôi phục bất cứ lúc nào.",
      file: "client/src/pages/DashboardPage.tsx",
      lang: "typescript",
      endpoint: "UI Read-Only Frozen View",
      rule: "Safe Preservation UI Display",
      code: `<div className="vault-frozen-banner">
  <h2>Kho Di Sản Đã Được Đóng Băng An Toàn</h2>
  <p>Toàn bộ tài sản được bảo toàn tuyệt đối, không bị xóa theo OPLAN-05.</p>
</div>`
    },
    { 
      id: "end_frozen", num: "35", title: "Đóng Băng Dữ Liệu An Toàn", 
      desc: "Chế độ Chỉ đọc (Read-only); không bao giờ tự động xóa dữ liệu từ DMS; sẵn sàng cho thủ tục khôi phục hoặc thừa kế.",
      file: "server/LegacyVault.Prototype.Domain/VaultState.cs",
      lang: "csharp",
      endpoint: "SAFE DATA FREEZE COMPLETE",
      rule: "Safe Data Preservation Guarantee",
      code: `// Kho bảo toàn an toàn tuyệt đối, sẵn sàng mở khóa khi có yêu cầu hợp lệ`
    }
  ]
};

const template = fs.readFileSync('scratch/system-flows-template.html', 'utf8');
const htmlContent = template
  .replace('/* FLOWS_DATA_PLACEHOLDER */', JSON.stringify(flowsData))
  .replace('/* ROADMAPS_PLACEHOLDER */', JSON.stringify(flowRoadmaps));

fs.writeFileSync('graphify-out/system-flows-viewer.html', htmlContent);
console.log('Successfully updated system-flows-viewer.html with SVG Swimlane Architectural Blueprint and code grounding!');
