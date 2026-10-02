# TÀI LIỆU PHÂN TÍCH LUỒNG NGHIỆP VỤ, LOGIC MẬT MÃ & HƯỚNG DẪN TÍCH HỢP HỆ THỐNG
## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO DI SẢN SỐ (SWP391)
### Chuẩn Hóa Theo SRS v3.11.0 & Hiến Chương 31 Quy Tắc Phát Triển Chuẩn Mực

---

## MỤC LỤC
1. [TỔNG QUAN KIẾN TRÚC & MÔ HÌNH PHÒNG THỦ KHÔNG TIN CẬY (ZERO-TRUST)](#1-tổng-quan-kiến-trúc--mô-hình-phòng-thủ-không-tin-cậy-zero-trust)
2. [CHI TIẾT 5 LUỒNG NGHIỆP VỤ CỐT LÕI (CORE BUSINESS FLOWS)](#2-chi-tiết-5-luồng-nghiệp-vụ-cốt-lõi-core-business-flows)
   - [Luồng 1: Lập Di Sản & Mã Hóa Phong Bì Envelope Encryption (AES-256-GCM)](#luồng-1-lập-di-sản--mã-hóa-phong-bì-envelope-encryption-aes-256-gcm)
   - [Luồng 2: Điểm Danh Sinh Tồn (Dead Man's Switch - DMS) & Quy Tắc Bảo Vệ Dữ Liệu](#luồng-2-điểm-danh-sinh-tồn-dead-mans-switch---dms--quy-tắc-bảo-vệ-dữ-liệu)
   - [Luồng 3: Thẩm Định Chứng Tử (Death Verification Claim) & Khóa Bất Biến Snapshot](#luồng-3-thẩm-định-chứng-tử-death-verification-claim--khóa-bất-biến-snapshot)
   - [Luồng 4: Bàn Giao Di Sản, Cửa Sổ 7 Ngày & 2 Năm Đóng Băng Suy Nghĩ Lại](#luồng-4-bàn-giao-di-sản-cửa-sổ-7-ngày--2-năm-đóng-băng-suy-nghĩ-lại)
   - [Luồng 5: Quy Trình Cứu Hộ 2 Bước (AliveClaim - "Tôi Còn Sống")](#luồng-5-quy-trình-cứu-hộ-2-bước-aliveclaim---tôi-còn-sống)
3. [LOGIC TOÁN HỌC & KIẾN TRÚC MẬT MÃ BẢO VỆ DỮ LIỆU](#3-logic-toán-học--kiến-trúc-mật-mã-bảo-vệ-dữ-liệu)
   - [Mã hóa có kiểm soát phía máy chủ (Envelope Encryption)](#mã-hóa-có-kiểm-soát-phía-máy-chủ-envelope-encryption)
   - [Mô hình Toán học Shamir Secret Sharing (SSS) chống Admin biến chất](#mô-hình-toán-học-shamir-secret-sharing-sss-chống-admin-biến-chất)
   - [Cơ chế Khóa thời gian trễ (Time-Lock Delay) & Demo Mode 2 phút](#cơ-chế-khóa-thời-gian-trễ-time-lock-delay--demo-mode-2-phút)
4. [HƯỚNG DẪN TÍCH HỢP TỪNG DỊCH VỤ BÊN THỨ BA (THIRD-PARTY INTEGRATION)](#4-hướng-dẫn-tích-hợp-từng-dịch-vụ-bên-thứ-ba-third-party-integration)
   - [4.1. Google OpenID Connect (OIDC / OAuth 2.0)](#41-google-openid-connect-oidc--oauth-20)
   - [4.2. Cổng thanh toán SePay VietQR (Webhook ACID & 5 Gói cước)](#42-cổng-thanh-toán-sepay-vietqr-webhook-acid--5-gói-cước)
   - [4.3. Cloudflare R2 Private Storage (S3-Compatible)](#43-cloudflare-r2-private-storage-s3-compatible)
   - [4.4. Thư viện MailKit & MimeKit SMTP](#44-thư-viện-mailkit--mimekit-smtp)
   - [4.5. Xác minh danh tính thủ công & Khảo sát eKYC FPT.AI (Tương lai)](#45-xác-minh-danh-tính-thủ-công--khảo-sát-ekyc-fptai-tương-lai)
5. [MA TRẬN ĐỐI SOÁT TRẠNG THÁI & MÃ LỖI RFC 7807](#5-ma-trận-đối-soát-trạng-thái--mã-lỗi-rfc-7807)
6. [HƯỚNG DẪN THỰC THI & KIỂM THỬ TRÊN PROTOTYPE](#6-hướng-dẫn-thực-thi--kiểm-thử-trên-prototype)

---

## 1. TỔNG QUAN KIẾN TRÚC & MÔ HÌNH PHÒNG THỦ KHÔNG TIN CẬY (ZERO-TRUST)

Hệ thống **LegacyVault** được thiết kế nhằm giải quyết bài toán cốt lõi: **Làm sao để người dùng ủy thác toàn bộ tài sản số, bí mật di chúc và chứng từ nhạy cảm cho hệ thống máy chủ mà không bị nhân viên quản trị (Admin) hoặc kẻ tấn công chiếm quyền máy chủ đọc lén dữ liệu?**

```
+---------------------------------------------------------------------------------------------------+
|                                      FRONTEND (Client-side)                                       |
|  - Trình duyệt chỉ lưu Access Token & Session trong bộ nhớ RAM tạm thời (Redux Ephemeral State).  |
|  - Tệp tải về chỉ giải mã qua luồng TLS và tạo Blob URL ngắn hạn; tự hủy bằng revokeObjectURL(). |
|  - Tính mã băm SHA-256 trực tiếp tại máy khách qua Web Crypto API (0đ chi phí tính toán máy chủ).|
+---------------------------------------------------------------------------------------------------+
                                            | (HTTPS / TLS 1.3)
                                            v
+---------------------------------------------------------------------------------------------------+
|                                  BACKEND ASP.NET CORE 8 WEB API                                   |
|  - Zero-Trust Authorization: Xác thực dựa trên JWT Claims & Quan hệ DB (PersonId), không dùng     |
|    header giao diện X-Active-Role để phân quyền.                                                  |
|  - Envelope Encryption Service: Sinh DEK 256-bit độc lập, mã hóa AES-256-GCM, bọc DEK bằng KEK. |
|  - Time-Lock & Rescue Engine: Quản lý cửa sổ trễ an toàn, tiếp nhận AliveClaim, còi báo động.     |
+---------------------------------------------------------------------------------------------------+
             |                                              |                             |
             v                                              v                             v
+--------------------------+                 +--------------------------+    +--------------------------+
|  Cloudflare R2 Storage   |                 |      SePay VietQR        |    | Xác minh danh tính       |
|  - Lưu Ciphertext .enc   |                 |  - Khớp giao dịch 24/7   |    |  - Thẩm định thủ công    |
|  - Presigned URL (15m)   |                 |  - Webhook ACID chống lặp|    |  - Verifier đối chiếu    |
|  - Băng thông Egress 0$  |                 |  - Hủy đơn sau 15 phút   |    |  - (eKYC AI tương lai)   |
+--------------------------+                 +--------------------------+    +--------------------------+
```

---

## 2. CHI TIẾT 5 LUỒNG NGHIỆP VỤ CỐT LÕI (CORE BUSINESS FLOWS)

### Luồng 1: Lập Di Sản & Mã Hóa Phong Bì Envelope Encryption (AES-256-GCM)
1. **Khởi tạo tài sản**:
   - Chủ sở hữu (Owner) tải tệp dữ liệu lên (`POST /api/v1/crypto/envelope-encrypt` hoặc `/api/v1/storage/upload-envelope`).
   - Kích thước tệp được Backend kiểm tra nghiêm ngặt: Tối đa **20 MiB** theo quy định MVP.
2. **Kiểm tra tính toàn vẹn & Phân tích MIME**:
   - Đọc Stream dữ liệu, kiểm tra Magic Bytes định dạng thực tế (chống giả mạo đuôi tệp).
   - Tính toán mã băm SHA-256 toàn vẹn của tệp gốc.
3. **Mã hóa phong bì có kiểm soát**:
   - Backend sinh một khóa đối xứng ngẫu nhiên 256-bit độc lập (`DataEncryptionKey` - DEK) bằng bộ sinh số ngẫu nhiên an toàn mật mã (`RandomNumberGenerator`).
   - Mã hóa tệp tin bằng thuật toán **AES-256-GCM** kèm Nonce 96-bit và Authentication Tag 128-bit.
   - Bản mã (Ciphertext) được đẩy lên Cloudflare R2 Bucket riêng tư với đường dẫn duy nhất: `vaults/{vaultId}/assets/{assetId}.enc`.
4. **Bọc khóa an toàn (Key Wrapping)**:
   - Khóa DEK được bọc (wrap) bằng Master Key hệ thống (`KeyEncryptionKey` - KEK) sinh ra chuỗi `WrappedDataKey`.
   - Cơ sở dữ liệu chỉ lưu trữ: `ChecksumSha256`, `MimeType`, `SizeBytes`, `StorageKey`, `WrappedDataKey`, `Nonce`, `Tag`.
   - **Tuyệt đối không lưu khóa DEK trần hoặc tệp gốc plaintext trong CSDL**.

---

### Luồng 2: Điểm Danh Sinh Tồn (Dead Man's Switch - DMS) & Quy Tắc Bảo Vệ Dữ Liệu
1. **Cấu hình chu kỳ**:
   - Chủ sở hữu thiết lập chu kỳ kiểm tra định kỳ (30 ngày, 60 ngày hoặc 90 ngày).
2. **Tiến trình quét nền (Background Worker)**:
   - Hệ thống quét các kho đến hạn điểm danh (`CHECKIN_PENDING`).
   - Nếu quá hạn ân hạn (Grace Period), kho chuyển sang trạng thái tạm treo 90 ngày (`CHECKIN_SUSPENDED`).
   - Hết 90 ngày tạm treo mà Chủ kho vẫn không tương tác, kho chuyển sang **Đóng băng bất hoạt (`FROZEN_INACTIVITY`)**.
3. **Quy tắc bảo vệ dữ liệu tuyệt đối (OPLAN-05 & OPLAN-06)**:
   - **Kho Gói Free (`OWNER_FREE`)**: **TUYỆT ĐỐI KHÔNG TỰ ĐỘNG XÓA DỮ LIỆU VẬT LÝ** do bất hoạt (`OPLAN-05`). Dữ liệu giữ nguyên trạng thái đóng băng để bảo vệ di sản của người dùng.
   - **Kho Gói Trả Phí (`LEGACY_XS`, `LEGACY_XS_MAX`)**: Chỉ được phép xóa vật lý khi thỏa mãn đủ **8 điều kiện chặn nghiêm ngặt** (`OPLAN-06`):
     1. Kho đang ở trạng thái đóng băng bất hoạt (`FROZEN_INACTIVITY`).
     2. Gói cước trả phí đã hết hạn (`now >= plan_expires_at`).
     3. Đã chạm mốc: $\mathbf{deletion\_eligible\_at = \max(freeze\_at + 30d, paid\_plan\_expires\_at + 30d)}$.
     4. Đã gửi đủ 3 lần cảnh báo (lúc bắt đầu đóng băng, còn 7 ngày, còn 24 giờ).
     5. **KHÔNG CÓ hồ sơ chứng tử (`Cases`) nào đang xử lý hoặc bổ sung**.
     6. **KHÔNG CÓ quy trình bàn giao nào đang chạy**.
     7. **KHÔNG CÓ quyền Beneficiary còn hạn truy cập**.
     8. **KHÔNG CÓ khiếu nại hoặc tham chiếu lưu giữ pháp lý**.

---

### Luồng 3: Thẩm Định Chứng Tử (Death Verification Claim) & Khóa Bất Biến Snapshot
1. **Khởi tạo hồ sơ**:
   - Người thực thi (Executor) nộp hồ sơ yêu cầu mở kho di sản số kèm Giấy chứng tử (`POST /api/v1/cases/submit`).
   - Executor bắt buộc phải xác nhận cam kết pháp lý thứ nhất: *"Tôi cam đoan thông tin khai báo là hoàn toàn đúng sự thật và chịu trách nhiệm trước pháp luật Việt Nam"* (`DEATH-02`).
2. **Khóa cố định Snapshot bất biến (All-or-Nothing)**:
   - Hệ thống thực hiện Snapshot nguyên tử bộ bốn: `AssetId`, `ContentVersionId`, `AssetDesignationVersionId`, `EstatePlanVersionId`.
   - Toàn bộ danh mục tài sản và tập người nhận được chốt cố định, ngăn chặn hoàn toàn việc can thiệp chỉnh sửa tài sản trong khi chờ duyệt.
3. **Thẩm định bởi Công chứng viên / Người thẩm định (Verifier)**:
   - Verifier đối soát Giấy chứng tử qua cơ quan hộ tịch hoặc nguồn tin cậy.
   - Verifier đưa ra quyết định toàn bộ hồ sơ (`APPROVED` / `REJECTED` / `ADDITIONAL_DOCUMENTS_REQUIRED`).
   - Nếu duyệt phê duyệt, Verifier bắt buộc xác nhận cam kết pháp lý thứ hai (`CaseLegalAttestations`).

---

### Luồng 4: Bàn Giao Di Sản, Cửa Sổ 7 Ngày & 2 Năm Đóng Băng Suy Nghĩ Lại
1. **Thiết lập lịch bàn giao chung (`HandoverSchedules`)**:
   - Sau khi hồ sơ được duyệt, Executor nhập ngày hẹn bàn giao thống nhất cho toàn bộ hồ sơ di sản.
2. **Kích hoạt bàn giao nguyên tử**:
   - Vào hoặc sau ngày hẹn (`now >= ScheduledDeliveryDate`), Executor bấm *"Bắt đầu bàn giao"*.
   - Mọi lựa chọn chuyển quyền 1:1 bị chốt bất biến (`FINALIZED`).
   - Mở cửa sổ phản hồi ban đầu **7 ngày (168 giờ)** cho Người thụ hưởng (Beneficiary).
3. **Cửa sổ 2 năm đóng băng suy nghĩ lại (`FROZEN_RECONSIDERATION`)**:
   - Nếu có người bấm **Từ chối (`REJECTED`)** hoặc **quá hạn 7 ngày không phản hồi (`EXPIRED`)**:
     - Kho chuyển sang trạng thái đóng băng suy nghĩ lại.
     - Ghi nhận `FreezeStartedAt = now` và `FreezeExpiresAt = now + 2 năm`.
   - **Quyền bình đẳng nhận lại**: Trong 2 năm lịch này, cả người đã từ chối lẫn người chưa phản hồi đều có quyền bấm **"Ký Nhận di sản trong hạn 2 năm"** (`POST /api/v1/handover-vaults/{id}/accept-during-freeze`).
   - Hết 2 năm mà không có kết quả hợp lệ, quyền tiếp cận bị hủy vĩnh viễn (`TIME-01`).

---

### Luồng 5: Quy Trình Cứu Hộ 2 Bước (AliveClaim - "Tôi Còn Sống")
Để triệt tiêu hoàn toàn rủi ro **Người thực thi thông đồng với Người thẩm định làm giả Giấy chứng tử để mở trộm kho khi Chủ kho còn sống**, LegacyVault thiết lập quy trình cứu hộ 2 bước nghiêm ngặt:

```
[Mở Hồ Sơ Bàn Giao] 
        │
        ├──────────────────────────────────────────────────────┐
        │                                                      │
        ▼                                                      ▼
[Khóa Thời Gian Trễ]                                  [Còi Báo Động Đa Kênh]
Đếm ngược 48h (Prod) / 2 phút (Demo)                  Gửi SMS & Email khẩn cấp đến Chủ kho
        │                                                      │
        ├───────────────────────┬──────────────────────────────┘
        │ (Nếu phát hiện bất thường)
        ▼
[BƯỚC 1: Chủ kho bấm "TÔI CÒN SỐNG" (AliveClaim)]
        │
        ▼
[Hồ sơ lập tức chuyển: RESCUE_PENDING]
Toàn bộ tiến trình mở kho bị chặn cứng ngay lập tức.
Chủ kho không được tự ý xóa hồ sơ (chống tẩu tán chứng cứ).
        │
        ▼
[BƯỚC 2: Thẩm định cứu hộ (RescueDecision)]
Verifier thẩm tra trực tiếp nhân thân Chủ kho:
        ├── Chấp thuận (APPROVED_ALIVE) ──> Case chuyển CANCELLED_ALIVE (Hủy vĩnh viễn hồ sơ giả)
        └── Bác bỏ (REJECTED_FRAUD)     ──> Tiếp tục thẩm định thông thường
```

---

## 3. LOGIC TOÁN HỌC & KIẾN TRÚC MẬT MÃ BẢO VỆ DỮ LIỆU

### Mã hóa có kiểm soát phía máy chủ (Envelope Encryption)
- **Mã hóa Stream nhị phân**:
  $$\text{Ciphertext}, \text{Tag} \leftarrow \text{AES-GCM-256}(\text{Key} = \text{DEK}, \text{IV} = \text{Nonce}_{96\text{bit}}, \text{Data} = \text{Plaintext})$$
- **Bọc khóa bằng Master KEK**:
  $$\text{WrappedDataKey} \leftarrow \text{AES-GCM-256}(\text{Key} = \text{KEK}, \text{Data} = \text{DEK})$$
- **Luồng tải tệp an toàn (DEL-02)**:
  - Client gửi yêu cầu tải file $\rightarrow$ Backend kiểm tra quyền qua DB và JWT $\rightarrow$ Lấy ciphertext từ Cloudflare R2 $\rightarrow$ Giải bọc DEK bằng KEK $\rightarrow$ Giải mã AES-256-GCM trong bộ nhớ RAM $\rightarrow$ Stream nhị phân qua TLS 1.3 về Client $\rightarrow$ Client tạo Blob URL tạm và gọi ngay `URL.revokeObjectURL()` khi hoàn tất.

### Mô hình Toán học Shamir Secret Sharing (SSS) chống Admin biến chất
Hệ thống áp dụng thuật toán chia sẻ bí mật của Adi Shamir trên trường hữu hạn $GF(2^8)$ với đa thức tối giản $P(x) = x^8 + x^4 + x^3 + x^2 + 1$ ($0x11d$):
- **Đa thức phân rã bậc 1 (Ngưỡng $k=2$, tổng số mảnh $n=3$)**:
  $$f(x) = S + a_1 x \pmod{P(x)}$$
  Trong đó $S$ là Master Secret, $a_1$ là hệ số ngẫu nhiên khác 0.
- **Phân phối 3 mảnh**:
  - $M_1 = (1, f(1))$: **Mảnh 1 (System Share)** — Lưu niêm phong trong Cloud KMS / HSM Backend.
  - $M_2 = (2, f(2))$: **Mảnh 2 (User Passphrase Share)** — Do Chủ kho nắm giữ qua mật khẩu cá nhân.
  - $M_3 = (3, f(3))$: **Mảnh 3 (Emergency / Beneficiary Share)** — Ủy thác cho Thân nhân / Công chứng viên.
- **Chứng minh an toàn toán học (Anti-Rogue Admin)**:
  - Để tìm $S = f(0)$, cần tối thiểu 2 điểm tọa độ.
  - Nếu Admin biến chất cố tình kết xuất CSDL máy chủ, Admin **chỉ có duy nhất điểm $M_1$**.
  - Theo lý thuyết Shannon về An toàn Thông tin Tuyệt đối (Information-Theoretic Security), với 1 điểm duy nhất trên đa thức bậc 1, mọi giá trị $S \in GF(256)$ đều có xác suất xảy ra ngang nhau ($P(S) = \frac{1}{256}$). Kẻ tấn công không thu được bất kỳ 1 bit thông tin nào về Master Key.
- **Tái cấu trúc bằng Nội suy Lagrange tại $x=0$**:
  $$S = f(0) = \sum_{i=1}^{k} y_i \prod_{j \neq i} \frac{x_j}{x_i \oplus x_j}$$

---

## 4. HƯỚNG DẪN TÍCH HỢP TỪNG DỊCH VỤ BÊN THỨ BA (THIRD-PARTY INTEGRATION)

### 4.1. Google OpenID Connect (OIDC / OAuth 2.0)
- **Tài liệu tham khảo**: [Google Identity OIDC Reference](https://developers.google.com/identity/openid-connect/reference?hl=vi)
- **Cơ chế hoạt động**:
  1. Frontend khởi tạo luồng Google Sign-In qua Google Identity Services SDK.
  2. Người dùng đăng nhập thành công, Google cấp `id_token` (JWT có chữ ký số của Google).
  3. Frontend gửi `id_token` về Backend tại endpoint: `POST /api/v1/auth/google-oidc`.
  4. Backend sử dụng thư viện `Google.Apis.Auth` (`GoogleJsonWebSignature.ValidateAsync`) để kiểm tra chữ ký RSA, hạn dùng và Audience Client ID.
  5. Backend tự động trích xuất `sub`, `email`, `name`, `picture` để sinh hoặc cập nhật bản ghi `Persons` và `Users`.
- **Cấu hình trong `appsettings.json`**:
  ```json
  "GoogleOidc": {
    "ClientId": "YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com"
  }
  ```

---

### 4.2. Cổng thanh toán SePay VietQR (Webhook ACID & 5 Gói cước)
- **Tài liệu tham khảo**: [SePay API Docs](https://developer.sepay.vn/vi#api-docs)
- **Cơ chế hoạt động**:
  1. Khi người dùng chọn mua gói, Backend sinh `PaymentOrders` với mã đơn hàng duy nhất `LVxxxxxx` (ví dụ: `LV482910`) và thời hạn hiệu lực đúng **15 phút**.
  2. Trả về mã VietQR động:
     `https://qr.sepay.vn/img?acc={BANK_ACC}&bank={BANK_CODE}&amount={AMOUNT}&des={ORDER_CODE}&template=compact`
  3. Khách hàng chuyển khoản, SePay nhận biến động số dư ngân hàng và gọi Webhook Server-to-Server về Backend: `POST /api/v1/payment/webhook`.
  4. **Kiểm soát ACID & Chống lặp (Idempotency)**:
     - Mở Transaction mức `Serializable`.
     - Kiểm tra `provider_event_id` trong bảng `IdempotencyRecords`. Nếu đã xử lý, trả về HTTP 200 OK ngay lập tức.
     - **Kiểm tra thời hạn 15 phút**: Nếu `now >= order.ExpiresAt`, đơn hàng chuyển `EXPIRED` và **tuyệt đối không cấp quyền/entitlement**.
     - Khớp số tiền chuyển khoản với Snapshot giá gói. Nếu hợp lệ, chuyển đơn sang `PAID`, cấp quyền nâng hạn mức và commit transaction.
  5. **Endpoint mô phỏng Demo**: Cung cấp `POST /api/v1/demo/payment-orders/{orderId}/simulate-success` chỉ bật trên môi trường Development/Demo để biểu diễn trước Hội đồng (Hard Rule 1.7).
- **Cấu hình trong `appsettings.json`**:
  ```json
  "SePay": {
    "BankAccount": "0385966666",
    "BankCode": "MBBank",
    "ApiKey": "SEPAY_TEST_API_KEY_2026"
  }
  ```

---

### 4.3. Cloudflare R2 Private Storage (S3-Compatible)
- **Tài liệu tham khảo**: [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- **Cơ chế hoạt động**:
  1. Backend sử dụng SDK chuẩn `AWSSDK.S3` kết nối tới endpoint S3-Compatible của Cloudflare:
     `https://{AccountId}.r2.cloudflarestorage.com`
  2. **Presigned Upload URL**: Sinh URL có chữ ký PUT có thời hạn 15 phút để client tải tệp trực tiếp lên Bucket riêng tư mà không tốn tài nguyên server.
  3. **Presigned Download URL**: Sinh URL GET có thời hạn phục vụ tải tài liệu chứng cứ thẩm định eKYC/chứng tử.
  4. **Ưu điểm vượt trội**: **0đ chi phí băng thông tải về (Zero Egress Fees)**, giúp dự án tối ưu hóa 100% chi phí vận hành.
- **Cấu hình trong `appsettings.json`**:
  ```json
  "CloudflareR2": {
    "AccountId": "YOUR_CLOUDFLARE_R2_ACCOUNT_ID",
    "AccessKeyId": "YOUR_R2_ACCESS_KEY_ID",
    "SecretAccessKey": "YOUR_R2_SECRET_ACCESS_KEY",
    "BucketName": "legacyvault-private"
  }
  ```

---

### 4.4. Thư viện MailKit & MimeKit SMTP
- **Tài liệu tham khảo**: [MimeKit / MailKit Documentation](https://mimekit.net/docs/html/Introduction.htm)
- **Cơ chế hoạt động**:
  1. Backend dùng `MailKit.Net.Smtp.SmtpClient` để kết nối giao thức SMTP an toàn qua cổng 587 (StartTls).
  2. Phát hành email bảo mật định dạng HTML:
     - **Email cảnh báo mở kho khẩn cấp**: Kèm theo nút bấm và URL cứu hộ 1 chạm có gắn mã `caseId`.
     - **Email OTP đăng nhập & xác thực quyền**.
  3. Hỗ trợ cơ chế Fallback thông minh: Nếu chưa cấu hình mật khẩu ứng dụng SMTP thực tế, hệ thống tự động ghi nhận bản ghi giao dịch mô phỏng (Simulated Delivery Record) để phục vụ kiểm thử tại giao diện Testbench.
- **Cấu hình trong `appsettings.json`**:
  ```json
  "Smtp": {
    "Host": "smtp.gmail.com",
    "Port": 587,
    "Username": "your_email@gmail.com",
    "Password": "your_app_password",
    "SenderEmail": "security@legacyvault.vn",
    "SenderName": "LegacyVault Security Alert"
  }
  ```

---

### 4.5. Xác minh danh tính thủ công & Khảo sát eKYC FPT.AI (Tương lai)
- **Quy định kiến trúc Prototype**:
  - Phiên bản Prototype hiện tại **thực hiện nhập liệu và xác minh danh tính hoàn toàn thủ công**, bỏ tích hợp API eKYC tự động ra khỏi phạm vi bắt buộc của đồ án để bảo đảm trách nhiệm pháp lý theo Điều 616, 624 Bộ luật Dân sự 2015.
  - **Quy trình thẩm định 4 bước**:
    1. Người dùng gửi thông tin cá nhân và tệp ảnh giấy tờ (CCCD gắn chip / Hộ chiếu).
    2. Chuyên viên Thẩm định (Verifier) được phân quyền đối chiếu hồ sơ, yêu cầu bổ sung khi cần.
    3. Ghi nhận kết quả: `Chờ duyệt (PENDING_VERIFICATION)` ➔ `Đã xác minh (VERIFIED)` hoặc `Bị từ chối (REJECTED)`, bắt buộc lưu kèm `verifier_id`, `verified_at` và `reason` vào Sổ kiểm toán (Audit Trail).
    4. Hồ sơ chuyển giao di sản tiếp tục qua các bước: Thẩm định Giấy chứng tử, Chờ hết thời hạn Time-Lock (15–30 ngày), và Cấp quyết định chuyển giao (Grant).
  - **Nguyên tắc bảo vệ dữ liệu & Pháp lý**:
    - **Không tự động đánh dấu "Đã xác minh"** chỉ vì người dùng đã tải giấy tờ lên.
    - **Xác minh danh tính đạt cũng CHƯA ĐỦ để nhận di sản** (phải thỏa mãn đủ 4 điều kiện).
    - Giấy tờ danh tính chứa PII nhạy cảm chỉ cho người có quyền thẩm định xem, áp dụng thời hạn lưu trữ (tối đa 30 ngày) và tiêu hủy an toàn theo Nghị định 13/2023/NĐ-CP.
- **Khảo sát eKYC FPT.AI / Tesseract / MediaPipe (Định hướng tương lai)**:
  - Giữ lại các module kiểm thử eKYC (FPT.AI SDK v3.2 Sandbox, Tesseract.js WASM, MediaPipe Face Mesh) dưới dạng **Phòng thí nghiệm khảo sát PoC** nhằm định hướng tích hợp công nghệ AI/OCR hỗ trợ trích xuất thông tin tự động trong tương lai (không thay thế quyết định của con người).
- **Cấu hình tham chiếu PoC trong `appsettings.json`**:
  ```json
  "Ekyc": {
    "FptAiApiKey": "YOUR_FPT_AI_API_KEY"
  }
  ```

---

## 5. MA TRẬN ĐỐI SOÁT TRẠNG THÁI & MÃ LỖI RFC 7807

| Mã lỗi định danh (`errorCode`) | HTTP Status | Diễn giải nguyên nhân nghiệp vụ | Hướng xử lý phía Client / Frontend |
| :--- | :---: | :--- | :--- |
| `ERR_AUTH_UNAUTHORIZED` | 401 | Phiên đăng nhập hết hạn hoặc Token không hợp lệ | Tự động refresh token; nếu thất bại điều hướng về `/login` |
| `ERR_AUTH_FORBIDDEN` | 403 | Không có quyền truy cập tài nguyên hoặc tài sản | Hiển thị màn hình 403 Forbidden |
| `ERR_FILE_SIZE_EXCEEDS_LIMIT` | 400 | Tệp tải lên vượt quá giới hạn 20 MiB của MVP | Thông báo lỗi trên LegalDropzone, ngăn chặn upload |
| `ERR_PAYMENT_ORDER_EXPIRED` | 400 / 409 | Đơn hàng VietQR đã quá 15 phút chưa thanh toán | Đóng modal QR cũ; tự động sinh đơn hàng mới |
| `ERR_PAYMENT_AMOUNT_INSUFFICIENT` | 400 | Số tiền chuyển khoản nhỏ hơn giá niêm yết gói | Cảnh báo đơn hàng thiếu tiền; giữ trạng thái FAILED |
| `ERR_PAYMENT_ORDER_NOT_FOUND` | 404 | Mã đơn hàng không tồn tại trong hệ thống | Báo lỗi không tìm thấy đơn hàng |
| `ERR_ALIVE_CLAIM_NOT_ALLOWED` | 422 | Hồ sơ không ở trạng thái cho phép gửi AliveClaim | Vô hiệu hóa nút bấm "Tôi còn sống" |

---

## 6. HƯỚNG DẪN THỰC THI & KIỂM THỬ TRÊN PROTOTYPE

1. **Khởi động hệ thống**:
   - Nhấp đúp vào file [`run_prototype.bat`](file:///c:/Users/ThanhDuy/Documents/01_Code_Projects/SWP-Prototype/run_prototype.bat) tại thư mục gốc.
   - Hoặc mở 2 cửa sổ terminal:
     - Terminal 1 (Backend): `cd server\LegacyVault.Prototype.WebApi && dotnet run`
     - Terminal 2 (Frontend): `cd client && npm run dev`
2. **Kịch bản kiểm thử trên giao diện Testbench**:
   - **Tab 1 (Envelope Encryption)**: Chọn 1 tệp tin $\rightarrow$ Bấm *"Mã hóa Envelope"* $\rightarrow$ Xem `WrappedDataKey`, Nonce, Tag, SHA-256 $\rightarrow$ Bấm *"Giải mã đối soát ngay"* để kiểm tra toàn vẹn RAM.
   - **Tab 2 (Shamir Secret Sharing)**: Bấm *"Tách thành 3 Mảnh"* $\rightarrow$ Bấm *"Mô phỏng Admin biến chất cố mở bằng Mảnh 1"* (Hệ thống chặn đứng) $\rightarrow$ Bấm *"Khôi phục hợp pháp: Mảnh 1 + Mảnh 2"* (Thành công).
   - **Tab 3 (Cloudflare R2)**: Thử nghiệm sinh Presigned PUT & GET URLs, upload ciphertext và tải về giải mã streaming RAM.
   - **Tab 4 (SePay VietQR)**: Chọn gói Di sản XS (199.000đ) $\rightarrow$ Xem mã VietQR 15 phút $\rightarrow$ Bấm *"Giả lập SePay gọi Webhook"* để xem đơn chuyển trạng thái `PAID` và kích hoạt dịch vụ.
   - **Tab 5 (MailKit SMTP)**: Bấm gửi email cảnh báo xâm phạm kho $\rightarrow$ Xem nội dung email HTML hiển thị trực tiếp trong nhật ký.
   - **Tab 6 (Xác minh danh tính thủ công)**: Thử nghiệm luồng nộp hồ sơ CCCD, Chuyên viên đối chiếu thẩm định `Chờ duyệt` ➔ `Đã xác minh` / `Bị từ chối`, ghi sổ kiểm toán (Audit Trail) và khảo sát module OCR eKYC tương lai.
   - **Tab 7 (Time-Lock & Rescue)**: Xem đồng hồ đếm ngược Live $\rightarrow$ Bấm *"Bước 1: Chủ kho bấm TÔI CÒN SỐNG"* $\rightarrow$ Hồ sơ chuyển `RESCUE_PENDING` $\rightarrow$ Bấm *"Bước 2: Verifier chấp thuận cứu hộ"* $\rightarrow$ Hồ sơ chuyển `CANCELLED_ALIVE`.
   - **Tab 8 (Google OIDC)**: Xác thực ID Token và kiểm tra session RAM-Only.
