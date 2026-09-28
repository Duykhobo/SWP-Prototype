# LegacyVault — Hướng dẫn tích hợp dịch vụ cho dev
**Cập nhật: 28/09/2026** · **Đối tượng**: FE React/Vite và BE ASP.NET Core; ví dụ tham chiếu prototype ASP.NET Core 8 / React 19. Baseline SRS v3.11.0 hiện ghi .NET 10 / React 19, nên cần build/test lại khi đưa code vào dự án chính.

Mục đích của file này là hướng dẫn tích hợp Google OIDC, SePay Test Mode, MailKit/MimeKit, Cloudflare R2, và FPT.AI eKYC dựa trên tài liệu nhà cung cấp chính thức.

---

## 0. Quy ước chung trước khi nối dịch vụ

1. **Luồng dữ liệu**: Browser $\rightarrow$ API LegacyVault $\rightarrow$ Provider. Chỉ Cloudflare R2 cho phép browser PUT/GET bản mã bằng Presigned URL ngắn hạn. API key, SMTP password, R2 secret, SePay webhook secret giữ ở backend / secret manager; không đóng gói vào Vite `VITE_*` (ngoại lệ: Google OAuth Client ID là định danh công khai).
2. **Môi trường & Dữ liệu thử nghiệm**: Dùng Test Mode/sandbox, bucket riêng, inbox thử và ảnh định danh mẫu được phép dùng. Log provider, correlationId, eventId, status, latency; **tuyệt đối không log JWT, URL ký R2, ảnh CCCD, nội dung email hoặc key**.
3. **Adapter Pattern**: Adapter ở backend trả DTO của LegacyVault, không chuyển nguyên JSON provider lên UI. Lỗi provider được ánh xạ thành ProblemDetails (RFC 7807) có mã lỗi nội bộ. Timeout, retry có giới hạn; mọi thao tác tạo quyền hoặc gửi sự kiện phải idempotent.
4. **Cờ Demo Mode**: Do server điều khiển và chỉ bật trên môi trường Dev/Demo. Không lấy header do client tự đặt làm bằng chứng quyền.
5. **Cơ sở dữ liệu bền vững**: Tách bảng lưu `ProviderEventId` (UNIQUE), `PaymentOrders`, `ExternalIdentity(provider, subject)`, `EkycAttempt`, `NotificationDelivery`, `StoredObject` khi chuyển khỏi in-memory prototype. Nội dung pháp lý và quyền truy cập vẫn theo SRS / permission matrix của dự án.

### Ma trận Tích Hợp

| Dịch vụ | FE gửi đến BE | BE gửi đến Provider | Cần chuẩn bị trước khi test thật |
| :--- | :--- | :--- | :--- |
| **Google OIDC** | Google ID token qua HTTPS | Xác minh chữ ký / JWKS bằng thư viện | OAuth Web Client ID + origin localhost |
| **SePay VietQR** | Tạo đơn, xem trạng thái; demo endpoint chỉ Dev | SePay gọi webhook vào BE | Tài khoản Test Mode, mã thanh toán, API key/HMAC, callback reachable |
| **MailKit** | Gọi yêu cầu gửi cảnh báo đã phân quyền | SMTP STARTTLS / SSL | SMTP account / inbox thử (Gmail App Password / Brevo) |
| **Cloudflare R2** | Xin URL ký, PUT ciphertext trực tiếp | BE ký URL bằng R2 credentials | Bucket private, R2 API token, CORS config |
| **FPT.AI eKYC** | Gửi ảnh CCCD/khuôn mặt tới BE | OCR / face match / liveness REST | API key (`console.fpt.ai`), ảnh/video thử, ngưỡng do nhóm thống nhất |

---

## 1. Google OIDC — Đăng nhập và định danh

- **Tài liệu**: [Google OIDC Reference](https://developers.google.com/identity/openid-connect/reference?hl=vi), [Verify Google ID token on backend](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token).
- **Nguyên lý**: Google cung cấp discovery ở `https://accounts.google.com/.well-known/openid-configuration`; lấy khóa xác minh từ `jwks_uri`. `email` có thể đổi; khóa liên kết người dùng bất biến là `sub`. Backend phải kiểm tra chữ ký, `iss`, `aud`, `exp` và `nonce` nếu luồng đang dùng nonce; không tin payload JWT chỉ vì FE giải mã được.
- **Cấu hình**: Tạo Google OAuth Client loại Web, thêm origin FE (`http://localhost:5173` khi dev), cấu hình redirect URI đúng nếu dùng authorization code flow. Chọn một luồng cho spike: Google Identity Services trả ID token cho FE; FE gửi token qua HTTPS tới API LegacyVault. Dùng code flow + PKCE nếu cần ủy quyền truy cập Google APIs, đừng nhầm ID token với access token của LegacyVault.

### Mã nguồn tham chiếu:
```typescript
// FE: callback từ Google Identity Services
async function onGoogleCredential(credential: string) {
  const response = await fetch('/api/v1/auth/google', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Correlation-ID': crypto.randomUUID()
    },
    body: JSON.stringify({ idToken: credential }),
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Google sign-in failed');
  return response.json(); // Session do LegacyVault cấp; không dùng Google token làm RBAC token.
}
```

```csharp
// BE: package Google.Apis.Auth; cấu hình Google:ClientId từ env/secret manager.
var payload = await Google.Apis.Auth.GoogleJsonWebSignature.ValidateAsync(
    request.IdToken,
    new Google.Apis.Auth.GoogleJsonWebSignature.ValidationSettings
    {
        Audience = new[] { googleClientId }
    });
// Upsert ExternalIdentity(provider="GOOGLE", subject=payload.Subject) atomically.
// Chỉ tự tạo tài khoản khi chính sách ứng dụng cho phép, không tự cấp OWNER/VERIFIER theo email.
```

- **Test tối thiểu (INT-01)**: Đúng client ID $\rightarrow$ tạo/khôi phục đúng Person/User; sai `aud`, `iss`, token sửa chữ ký/hết hạn $\rightarrow$ 401; đổi email cùng `sub` vẫn là một tài khoản; hai `sub` khác nhau không bị gộp bởi email. Bảo vệ state/nonce khi dùng luồng có redirect. `Google.Apis.Auth` giúp xác minh chữ ký; tài khoản và phiên LegacyVault vẫn do ứng dụng quản lý.

---

## 2. SePay VietQR — Đơn hàng và webhook Test Mode

- **Tài liệu**: [SePay Developer](https://developer.sepay.vn/vi#api-docs), [Test Mode](https://developer.sepay.vn/vi/tien-ich-khac/test-mode), [Webhook payload và retry](https://developer.sepay.vn/vi/sepay-webhooks/tich-hop-webhook), [Cấu hình mã thanh toán](https://developer.sepay.vn/vi/sepay-webhooks/cau-hinh-ma-thanh-toan), [Tạo webhook Test Mode](https://developer.sepay.vn/vi/tien-ich-khac/test-mode/tao-webhook).
- **Nguyên tắc**: Test Mode tách biệt Live; token API Test Mode chỉ dùng trên sandbox. Webhook là server-to-server, không xác nhận thanh toán dựa vào browser redirect.
- **Thiết lập sandbox**:
  1. Bật Test Mode ở SePay; tạo tài khoản ngân hàng thử, mã thanh toán và webhook tới URL backend reachable. Chọn API Key (`Authorization: Apikey <key>`) hoặc HMAC theo mục Security. Nếu chọn HMAC, triển khai đúng công thức từ trang xác thực webhook của cấu hình đang dùng; không tự đoán chuỗi ký.
  2. Cấu hình tiền tố mã thanh toán, ví dụ `LV` + 10 ký tự chữ/số, đúng độ dài và loại ký tự trong SePay. Lưu `orderCode` UNIQUE, `snapshotAmount`, `expiresAt`, `personId`. Kiểm tra payload thực tế có code khớp; nếu không, kiểm cấu hình nhận diện mã trước khi sửa code.
  3. Webhook nhận các trường `id` (mã giao dịch không đổi qua retry), `code` (có thể null), `content`, `transferType`, `transferAmount`...

### Fixture mẫu SePay Webhook (Đơn 199.000đ):
```json
{
  "id": 92704,
  "code": "LVABC1234567",
  "content": "LVABC1234567 thanh toan",
  "transferType": "in",
  "transferAmount": 199000
}
```

- **Xử lý trong transaction DB**:
  - Xác thực webhook trước khi ghi; tạo hàng idempotency `UNIQUE(provider, providerEventId=id)`. Nếu trùng $\rightarrow$ trả HTTP 200 `{"success":true}` mà không cấp lại.
  - Tìm đơn bằng `code` đã xác minh; kiểm `transferType == "in"`, tài khoản nhận nếu có cấu hình, `transferAmount >= snapshotAmount`, trạng thái `PENDING`, và `now < expiresAt`.
  - Chốt `SUCCESS` + entitlement snapshot + audit trong cùng transaction.
  - Nếu đến đúng hạn hoặc trễ $\rightarrow$ `EXPIRED`, không cấp quyền.
  - Nếu không khớp $\rightarrow$ lưu trạng thái đối soát/điều tra, không đoán đơn từ số tiền đơn thuần.
  - Chống hai webhook chạy song song bằng unique index và khóa/giao dịch; in-memory HashSet chỉ là mock.
  - SePay chỉ coi đã nhận khi trả HTTP 200/201 và JSON đúng `{"success":true}` trong 30 giây; webhook lỗi có thể bị gửi lại.
  - Nút “mô phỏng thanh toán” trong dashboard gọi endpoint Dev/Demo riêng (`/api/v1/demo/payment-orders/{orderId}/simulate-success`), không giả làm webhook Live.

---

## 3. MailKit/MimeKit — SMTP Cảnh Báo

- **Tài liệu**: [Introduction](https://mimekit.net/docs/html/Introduction.htm), [MailKit SMTP ConnectAsync](https://mimekit.net/docs/html/M_MailKit_Net_Smtp_SmtpClient_ConnectAsync_2.htm).
- **Nguyên tắc**: MimeKit tạo MIME message, MailKit kết nối SMTP. Chọn StartTls với máy chủ hỗ trợ STARTTLS (thường cổng 587); cấu hình loại TLS theo nhà cung cấp, không dùng `StartTlsWhenAvailable` nếu yêu cầu bắt buộc mã hóa. MailKit ném lỗi nếu server không hỗ trợ STARTTLS khi dùng StartTls.

```csharp
using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

var message = new MimeMessage();
message.From.Add(MailboxAddress.Parse(smtpFrom));
message.To.Add(MailboxAddress.Parse(recipientFromDb));
message.Subject = "LegacyVault - Canh bao yeu cau mo kho";
message.Body = new BodyBuilder
{
    HtmlBody = "<p>Co yeu cau mo kho. Vui long truy cap ung dung de kiem tra.</p>"
}.ToMessageBody();

using var smtp = new SmtpClient();
await smtp.ConnectAsync(host, 587, SecureSocketOptions.StartTls, cancellationToken);
await smtp.AuthenticateAsync(username, password, cancellationToken);
await smtp.SendAsync(message, cancellationToken);
await smtp.DisconnectAsync(true, cancellationToken);
```

- **Thiết kế nghiệp vụ**:
  - Lấy người nhận từ DB đã kiểm chứng, không nhận địa chỉ email tùy ý từ request UI.
  - **Không đưa tên tài sản, mật khẩu hay khóa vào email**.
  - Nếu gửi link hủy, link chỉ mở màn hình xác thực Owner hoặc dùng token dùng một lần có hạn và ràng buộc phiên yêu cầu; click link không tự động hủy khi chưa kiểm danh tính.
  - Lưu `NotificationDelivery(messageId, channel, recipientHash, attempt, status, sentAt)` và queue/outbox để thử lại; trả “đã gửi” sau khi SMTP chấp nhận, không đồng nghĩa người nhận đã đọc.

---

## 4. Cloudflare R2 — Bucket Private, Presigned URL và Browser Upload

- **Tài liệu**: [R2 Overview](https://developers.cloudflare.com/r2/), [Presigned URLs](https://developers.cloudflare.com/r2/api/s3/presigned-urls/), [CORS](https://developers.cloudflare.com/r2/buckets/cors/).
- **Nguyên tắc**: Dùng S3-compatible endpoint `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` và `AWSSDK.S3` ở backend. R2 hỗ trợ signed GET, HEAD, PUT, DELETE cho một object; presigned POST HTML form không được hỗ trợ. URL ký là bearer credential: bất kỳ ai giữ URL đều dùng được đến khi hết hạn.
- **Luồng PUT bản mã**:
  1. Browser tạo DEK/IV riêng cho asset, mã hóa bằng Web Crypto AES-GCM; không gửi plaintext.
  2. FE gọi `POST /api/v1/storage/uploads` kèm metadata không nhạy cảm + hash ciphertext + size.
  3. BE kiểm quyền/quota, tạo object key ngẫu nhiên trong namespace của chủ kho, lưu bản ghi `PENDING`, ký PUT thời hạn ngắn (15 phút). Không nhận key do client tự chọn để tránh ghi đè object khác.
  4. FE `fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/octet-stream' }, body: ciphertext })`. Header dùng lúc PUT phải khớp header được ký.
  5. Bucket CORS cho phép đúng origin FE, method PUT/GET/HEAD và Content-Type cần thiết; thử thật trong browser vì curl không kiểm CORS.
  6. BE xác nhận object bằng HEAD/metadata + hash riêng của ứng dụng trước khi chuyển `ACTIVE`. Không dựa duy nhất vào ETag như SHA-256 nội dung.
- **Luồng GET**: Chỉ ký sau khi BE kiểm `PersonId`, trạng thái `Case`, hạn và `AccessGrant`. Với dữ liệu có yêu cầu thu hồi tức thì, proxy có kiểm quyền mỗi lần tải; signed GET 60 giây vẫn tạo khoảng thời gian URL có thể dùng lại. Chỉ tải ciphertext trực tiếp; DEK không để trong URL hoặc log.

---

## 5. FPT.AI eKYC — OCR, Face Match, Liveness

- **Tài liệu**: Trang [SDK eKYC](https://docs.fpt.ai/docs/vi/vision/documentation/sdk-ekyc/) là iOS/Android native. Với web prototype, dùng tài liệu REST riêng: [OCR CCCD](https://docs.fpt.ai/docs/vi/vision/api/id-recognition/), [Face Match](https://docs.fpt.ai/docs/vi/vision/api/face-match/), [Liveness](https://docs.fpt.ai/docs/vi/vision/api/liveness/).

| Bước | REST endpoint theo tài liệu FPT.AI | Input và điều kiện quan trọng | Output cần chuẩn hóa |
| :--- | :--- | :--- | :--- |
| **OCR mặt trước/sau** | `POST https://api.fpt.ai/vision/idr/vnm/` | Header API key; multipart/form-data trường `image`, mỗi ảnh $\le$ 5 MB, khoảng $\ge$ 640×480 | `errorCode`, `data[].id/name/dob/type`, các xác suất từng trường |
| **So khớp ảnh** | `POST https://api.fpt.ai/dmp/checkface/v1/` | Hai ảnh JPG/JPEG, lặp trường `file[]` hai lần | `data.isMatch`, `data.similarity`; kiểm lỗi riêng |
| **Liveness** | `POST https://api.fpt.ai/dmp/liveness/v3` | Video bắt buộc, 5–10 giây, $\le$ 10 MB; cmnd ảnh tùy chọn | `is_live`, `need_to_review`, `is_deepfake`, `face_match` |

- **Adapter BE**: Dùng `IHttpClientFactory` với base URL allowlist, timeout, API key từ secret manager, `MultipartFormDataContent`; kiểm Content-Type, dung lượng và chất lượng trước khi gửi; mapping sang `EkycResult { provider, providerRequestId?, ocr, faceMatch, liveness, reviewRequired }`.
- **Lưu ý**: Kết quả OCR/face match không thay thế kiểm tra giấy chứng tử và cam kết Executor/Verifier theo SRS. Mặt trước và mặt sau phải gửi/đối chiếu đúng loại tài liệu, không tự suy ra chủ sở hữu chỉ nhờ OCR.

---

## 6. Quyết định Kiến trúc: Loại bỏ VNPT eKYC & Chuẩn hóa FPT.AI Vision SDK

- **Lý do loại bỏ VNPT eKYC**:
  1. **Yêu cầu pháp nhân**: VNPT AI eKYC yêu cầu ký kết hợp đồng doanh nghiệp (B2B Enterprise Agreement), có giấy phép đăng ký kinh doanh và thẩm định pháp nhân mới được cấp quyền truy cập tài liệu tích hợp/tenant API chính thức.
  2. **Không khả thi cho đồ án Capstone sinh viên**: Nhóm phát triển là đồ án tốt nghiệp sinh viên (SWP391), không có pháp nhân công ty để ký hợp đồng B2B với VNPT.
  3. **Ưu thế của FPT.AI**: Cung cấp Cổng thông tin nhà phát triển mở (`console.fpt.ai`), cho phép đăng ký tài khoản lập trình viên cá nhân, cấp API Key ngay lập tức với hạn mức miễn phí (Free Tier) phù hợp hoàn hảo cho môi trường Prototype, Thử nghiệm tích hợp và Bảo vệ đồ án.
- **Kết luận**: Toàn bộ hệ thống LegacyVault chuẩn hóa 100% trên **FPT.AI Vision SDK** (hỗ trợ OCR CCCD gắn chip, Face Matching & Liveness Detection). Loại bỏ hoàn toàn mock và dependency của VNPT khỏi mã nguồn.

---

## 7. Kế hoạch kiểm thử và điều kiện đưa vào dự án

| ID | Bài test | Điều kiện PASS | Bằng chứng cần lưu |
| :---: | :--- | :--- | :--- |
| **INT-01** | Google đúng/sai `aud`, token quá hạn, đổi email | Chỉ đúng chữ ký/issuer/audience/expiry mới tạo session; map theo `sub` | Request ID, kết quả 200/401, account mapping đã ẩn PII |
| **INT-02** | SePay Test Mode gửi 1 webhook + replay cùng `id` | Một entitlement duy nhất, `{"success":true}` đúng contract | `orderCode`, event id, trạng thái trước/sau (không log key) |
| **INT-03** | SePay thiếu tiền, tiền ra, hết hạn đúng biên | Không cấp entitlement | Test fixture, timestamp UTC, DB transaction log đã lọc |
| **INT-04** | SMTP TLS + inbox thử + lỗi xác thực | Nhận cảnh báo không chứa bí mật, retry có giới hạn | Message ID/SMTP status, ảnh hộp thư test đã che địa chỉ |
| **INT-05** | R2 browser PUT/GET ciphertext + CORS | Hash roundtrip khớp, bucket private, GET bị chặn nếu sai quyền | Object key giả, status, hash, CORS response |
| **INT-06** | FPT OCR/face/liveness với dữ liệu sandbox | Mapping đầy đủ, trường `reviewRequired` được xử lý | Provider request ID, mã lỗi/trạng thái đã xóa PII |
| **INT-07** | FPT Live API (`api.fpt.ai`) với API key | Phản hồi đúng hợp đồng JSON, đối sánh sinh trắc học | Response status, confidence score, raw JSON hợp lệ |

> [!IMPORTANT]
> **Ngưỡng chốt**: Chỉ chuyển adapter từ MOCK sang LIVE sau khi có credentials sandbox, bản build FE/BE chạy, test PASS, chi phí và retention được ghi lại. Không dùng tài sản, CCCD hay số tài khoản thật của thành viên để demo.
