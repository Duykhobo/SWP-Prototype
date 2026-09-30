# KIẾN TRÚC MẬT MÃ PHONG BÌ & LƯU TRỮ DI SẢN SỐ (LEGACYVAULT)
> **Phiên bản tài liệu:** v3.11.0 • **Mô hình bảo mật:** Zero-Knowledge Storage & Anti-Rogue Admin (Tam Quyền Phân Lập)

---

## 1. TỔNG QUAN NGUYÊN LÝ TAM QUYỀN PHÂN LẬP

Hệ thống bảo vệ di sản số LegacyVault áp dụng nguyên lý **Zero-Knowledge Architecture** kết hợp **Mã hóa phong bì lai (Hybrid Envelope Encryption)** và **Chia sẻ bí mật Shamir (Shamir's Secret Sharing trên trường hữu hạn GF(256))**. 

Mục tiêu cốt lõi: **Không một thực thể đơn lẻ nào (kể cả Quản trị viên máy chủ / Database Admin hay nhà cung cấp đám mây Cloudflare) có thể đơn phương xem được nội dung tệp tin của người dùng.**

```
                               ┌──────────────────────────────────────────────────┐
                               │           TỆP GỐC: DI CHÚC GIA ĐÌNH              │
                               │        "di_chuc_gia_dinh_2026.pdf" (14.8 MiB)     │
                               └────────────────────────┬─────────────────────────┘
                                                        │
                         ┌──────────────────────────────┴──────────────────────────────┐
                         ▼                                                             ▼
         ┌──────────────────────────────┐                              ┌──────────────────────────────┐
         │     MÃ HÓA NỘI DUNG TỆP      │                              │      BỌC KHÓA DỮ LIỆU        │
         │         (AES-256-GCM)        │                              │        (KEY WRAPPING)        │
         │  Dùng khóa dữ liệu DEK trần  │                              │    Dùng Master KEK (256-bit)  │
         │  mã hóa file thành tệp .enc  │                              │    bọc DEK thành gói 60 bytes │
         └──────────────┬───────────────┘                              └──────────────┬───────────────┘
                        │                                                             │
                        ▼                                                             ▼
         ┌──────────────────────────────┐                              ┌──────────────────────────────┐
         │        CLOUDFLARE R2         │                              │       SQL SERVER 2022        │
         │   (Kho chứa tệp bản mã .enc) │                              │  (Lưu gói WrappedDataKey 60B)│
         │ • vaults/.../ast_98afbd90.enc│                              │ • [dbo].[ContentVersions]    │
         │ • Hoàn toàn không giữ khóa!  │                              │ • Admin xem trộm chỉ thấy rác│
         └──────────────────────────────┘                              └──────────────────────────────┘
                                                        ▲
                                                        │ Ghép 2/3 mảnh Shamir trong RAM
                                                        │ (Mảnh 1 Server + Mảnh 2 Passphrase)
                                       ┌────────────────┴────────────────┐
                                       │     BỘ NHỚ RAM TẠM THỜI         │
                                       │ Nơi duy nhất KEK & DEK tái sinh │
                                       │ Xong việc là ZeroMemory() xóa sổ│
                                       └─────────────────────────────────┘
```

---

## 2. PHÂN BIỆT 3 VÙNG LƯU TRỮ VẬT LÝ

| Thành phần | Nơi Lưu Trữ Vật Lý | Bản Chất Dữ Liệu | Đặc Tính Bảo Mật |
| :--- | :--- | :--- | :--- |
| **Tệp bản mã (`.enc`)** | **Cloudflare R2**<br>*(Private Bucket)* | Luồng byte nhị phân đã mã hóa AES-256-GCM (`15,518,920 Bytes`). | Không chứa khóa. Dù có bị lộ bucket hay đường dẫn R2 thì kẻ tấn công cũng chỉ nhận được một khối byte ngẫu nhiên vô nghĩa. |
| **Gói `WrappedDataKey` (60B)** | **SQL Server 2022**<br>*(Bảng `[dbo].[ContentVersions]`)* | Chuỗi Base64 dài 60 bytes: `[12B Nonce] + [16B Tag] + [32B Ciphertext DEK]`. | Được bọc chặt bởi Master KEK. Kẻ xâm nhập Database không thể bóc mở nếu không có KEK. |
| **Mảnh 1 (System Share)** | **SQL Server 2022**<br>*(Bọc thêm Cloud KMS)* | Điểm tọa độ Shamir tại $x = 1$. | Theo định lý Shamir, 1 mảnh duy nhất cung cấp đúng **0-bit thông tin** về Master KEK. |
| **Mảnh 2 (User Share)** | **Trí nhớ người dùng**<br>*(Passphrase cá nhân)* | Phái sinh từ mật khẩu người dùng (`Duyzkskhobo@310`) tại tọa độ $x = 2$. | **Server không bao giờ lưu trữ**. Chỉ người dùng nắm giữ. |
| **Mảnh 3 (Emergency Share)** | **Ủy thác Thân nhân**<br>*(Mã QR / Bản in cứu hộ)* | Điểm tọa độ Shamir tại $x = 3$. | Giao cho người thừa kế / công chứng viên, chỉ kích hoạt khi có sự kiện di sản. |
| **Khóa DEK trần & Master KEK** | 🧠 **100% TRONG RAM**<br>*(Ephemeral Memory)* | Khóa nhị phân 256-bit đối xứng nguyên vẹn. | **TUYỆT ĐỐI KHÔNG LƯU DB/Ổ CỨNG**. Chỉ sống vài mili-giây lúc mã hóa/giải mã, sau đó bị tiêu hủy ngay bằng `CryptographicOperations.ZeroMemory()`. |

---

## 3. CHIỀU 1: QUY TRÌNH TẢI LÊN & MÃ HÓA TỆP TIN (INBOUND)

### Bước 1.1: Gửi tệp qua kênh truyền bảo mật TLS 1.3
* Người dùng chọn tệp `di_chuc_gia_dinh_2026.pdf` (14.8 MiB).
* Trình duyệt gửi luồng byte qua kết nối TLS 1.3 tới endpoint:
  ```http
  POST /api/v1/storage/upload-envelope
  Authorization: Bearer <JWT_TOKEN>
  X-Client-Checksum-Sha256: 8f4b23a9c7d1e5f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5
  Content-Type: multipart/form-data
  ```

### Bước 1.2: Xử lý trong RAM máy chủ
1. **Tính Checksum SHA-256**:
   ```csharp
   using var sha256 = SHA256.Create();
   byte[] hash = await sha256.ComputeHashAsync(stream);
   // Giá trị: 8f4b23a9c7d1e5f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5
   ```
2. **Sinh ngẫu nhiên khóa DEK trần (Data Encryption Key)**:
   ```csharp
   byte[] dek = RandomNumberGenerator.GetBytes(32); // 256-bit CSPRNG
   // 0x7a3f89b1c2d0e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9
   ```
3. **Sinh Nonce ngẫu nhiên 96-bit**:
   ```csharp
   byte[] nonce = RandomNumberGenerator.GetBytes(12); // 0x9xF12aB3cD4e5f60
   ```
4. **Mã hóa file qua AES-256-GCM**:
   ```csharp
   byte[] ciphertext = new byte[plaintext.Length];
   byte[] tag = new byte[16]; // 128-bit Authentication Tag
   using var aesGcm = new AesGcm(dek, 16);
   aesGcm.Encrypt(nonce, plaintext, ciphertext, tag);
   ```

### Bước 1.3: Khóa bọc DEK (Key Wrapping) bằng Master KEK
Máy chủ dùng **Master KEK** (`0xe4c89b3f...`) để bọc chìa DEK 32 bytes:
```csharp
byte[] wrapNonce = RandomNumberGenerator.GetBytes(12);
byte[] wrappedDek = new byte[32];
byte[] wrapTag = new byte[16];

using var aesGcm = new AesGcm(masterKek, 16);
aesGcm.Encrypt(wrapNonce, dek, wrappedDek, wrapTag);

// Đóng gói 60 bytes: [12B Nonce] + [16B Tag] + [32B WrappedDek]
byte[] combined = new byte[60];
Buffer.BlockCopy(wrapNonce, 0, combined, 0, 12);
Buffer.BlockCopy(wrapTag, 0, combined, 12, 16);
Buffer.BlockCopy(wrappedDek, 0, combined, 28, 32);

string wrappedKeyBase64 = Convert.ToBase64String(combined);
// "TL01k9Xz9xF12aB3vB83c7DeF9a0B1c23d4e8a91bc7f02e5a6b7c8d9e0f1a2b3"
```

### Bước 1.4: Tiêu hủy dữ liệu nhạy cảm khỏi RAM (Zeroization)
```csharp
CryptographicOperations.ZeroMemory(dek);       // Hủy DEK trần ngay lập tức
CryptographicOperations.ZeroMemory(plaintext); // Hủy nội dung file gốc
```

### Bước 1.5: Đẩy lên Cloudflare R2 & Ghi CSDL SQL Server 2022
1. **Lên Cloudflare R2**:
   * Đường dẫn định danh: `vaults/pv_11111111/assets/ast_98afbd90.enc`
   * Đẩy khối byte `ciphertext` (15,518,920 bytes) qua AWS S3 SDK.
2. **Ghi vào SQL Server 2022 (`[dbo].[ContentVersions]`)**:
   ```sql
   INSERT INTO [dbo].[ContentVersions] (
       VersionId, AssetId, StorageKey, StorageUri,
       WrappedKeyBase64, NonceBase64, TagBase64, ChecksumSha256, SizeBytes
   ) VALUES (
       'ver_01k9d7a2-1111-2222-3333-444455556666',
       '98afbd90-502a-4315-a459-bc39d73507d4',
       'vaults/pv_11111111/assets/ast_98afbd90.enc',
       'r2://legacyvault-private/vaults/pv_11111111/assets/ast_98afbd90.enc',
       'TL01k9Xz9xF12aB3vB83c7DeF9a0B1c23d4e8a91bc7f02e5a6b7c8d9e0f1a2b3',
       '9xF12aB3cD4e5f60',
       'vB83c7DeF9a0B1c2d3E4f5',
       '8f4b23a9c7d1e5f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5',
       15518920
   );
   ```

---

## 4. CHIỀU 2: QUY TRÌNH MỞ KÉT & GIẢI MÃ LẤY FILE (OUTBOUND)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CHU TRÌNH 4 BƯỚC MỞ KÉT                                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [BƯỚC 1: Ghép Khóa Shamir]                                                            │
│   Mảnh 1 (Server x=1) + Mảnh 2 (Passphrase x=2) ──► Nội suy Lagrange trong RAM         │
│   ➔ Tái sinh Master KEK: 0xe4c89b3f71a0d2e5b6c891f0...                                │
│                                      │                                                 │
│                                      ▼                                                 │
│  [BƯỚC 2: Mở Gói WrappedDataKey]                                                       │
│   Lấy gói 60B từ SQL Server ──► Dùng Master KEK giải bọc AES-256-GCM                   │
│   ➔ Thu lại chiếc chìa DEK trần: 0x7a3f89b1c2d0e4f5...                                │
│                                      │                                                 │
│                                      ▼                                                 │
│  [BƯỚC 3: Kéo Tệp Từ Cloudflare R2]                                                    │
│   Đọc StorageKey từ CSDL ──► Tải khối byte .enc (15.5 MB) từ R2 Private Bucket         │
│                                      │                                                 │
│                                      ▼                                                 │
│  [BƯỚC 4: Giải Mã & Xuất File Bản Rõ]                                                  │
│   [Ciphertext .enc] + [DEK trần] + [Nonce] ──► Giải mã AES-256-GCM                     │
│   ✓ Đối soát khớp Auth Tag 128-bit                                                     │
│   ✓ Đối soát khớp Checksum SHA-256                                                     │
│   ➔ XUẤT TỆP: "di_chuc_gia_dinh_2026.pdf" (14.8 MiB) nguyên bản!                       │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Bước 2.1: Phục hồi Master KEK từ mảnh Shamir
1. Người dùng nhập Passphrase: `"Duyzkskhobo@310"`.
2. Hàm KDF phái sinh ra Mảnh 2 tại $x = 2$.
3. Máy chủ lấy Mảnh 1 tại $x = 1$ từ CSDL.
4. Tính toán nội suy Lagrange tại $x = 0$ trên trường Galois $\text{GF}(2^8)$:
   $$\ell_1(0) = \frac{x_2}{x_1 \oplus x_2} = 2 \oslash (1 \oplus 2) = 2 \oslash 3$$
   $$\ell_2(0) = \frac{x_1}{x_1 \oplus x_2} = 1 \oslash (1 \oplus 2) = 1 \oslash 3$$
   $$\text{KEK}[b] = (y_1[b] \otimes \ell_1) \oplus (y_2[b] \otimes \ell_2)$$
5. **Kết quả**: Thu lại Master KEK 256-bit trong RAM:
   `0xe4c89b3f71a0d2e5b6c891f0a2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1`

### Bước 2.2: KEK mở bọc gói WrappedDataKey thu lại DEK trần
```csharp
byte[] combined = Convert.FromBase64String(metadata.WrappedKeyBase64); // 60 bytes

byte[] wrapNonce = new byte[12];
byte[] wrapTag = new byte[16];
byte[] wrappedDek = new byte[32];

Buffer.BlockCopy(combined, 0, wrapNonce, 0, 12);
Buffer.BlockCopy(combined, 12, wrapTag, 0, 16);
Buffer.BlockCopy(combined, 28, wrappedDek, 0, 32);

byte[] dek = new byte[32];
using var aesGcm = new AesGcm(masterKek, 16);
aesGcm.Decrypt(wrapNonce, wrappedDek, wrapTag, dek);
// dek thu lại: 0x7a3f89b1c2d0e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9
```

### Bước 2.3: Đọc StorageKey từ CSDL và kéo file từ Cloudflare R2
* Máy chủ đọc bản ghi trong `[dbo].[ContentVersions]`:
  `StorageKey = "vaults/pv_11111111/assets/ast_98afbd90.enc"`
* Máy chủ dùng S3 SDK gửi yêu cầu kéo stream từ Cloudflare R2 Private Bucket:
  ```csharp
  using var r2Stream = await _r2Service.DownloadStreamAsync(metadata.StorageKey, ct);
  ```

### Bước 2.4: Giải mã AES-256-GCM & Đối soát toàn vẹn
1. **Giải mã nội dung file bằng chìa DEK trần vừa mở**:
   ```csharp
   byte[] plaintext = new byte[ciphertext.Length];
   using var aesGcm = new AesGcm(dek, 16);
   aesGcm.Decrypt(fileNonce, ciphertext, fileAuthTag, plaintext);
   ```
2. **Kiểm tra 2 lớp xác thực (Dual Verification)**:
   * **Lớp 1**: Khớp con dấu `fileAuthTag` 128-bit (xác nhận bản mã trên R2 không bị chỉnh sửa).
   * **Lớp 2**: Tính lại SHA-256 của `plaintext` và đối chiếu với mã Checksum lưu trong CSDL:
     $$\text{SHA256}(\text{plaintext}) == \text{"8f4b23a9c7d1e5f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5"}$$
3. **Tiêu hủy RAM**:
   ```csharp
   CryptographicOperations.ZeroMemory(dek);
   CryptographicOperations.ZeroMemory(masterKek);
   ```
4. **Phục vụ tệp tin về Client**: Trình duyệt nhận được tệp gốc `di_chuc_gia_dinh_2026.pdf` (14.8 MiB) nguyên bản 100%.

---

## 5. BẢNG THÔNG SỐ KỸ THUẬT MẪU ĐỒNG NHẤT HỆ THỐNG

| Thông số | Giá Trị Thực Tế Cụ Thể |
| :--- | :--- |
| **Tên tệp di sản** | `di_chuc_gia_dinh_2026.pdf` |
| **Dung lượng tệp** | `15,518,920 Bytes` (~14.8 MiB) |
| **Mã băm SHA-256 gốc** | `8f4b23a9c7d1e5f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5` |
| **Khóa DEK trần (256-bit)** | `0x7a3f89b1c2d0e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9` |
| **Khóa Master KEK (256-bit)** | `0xe4c89b3f71a0d2e5b6c891f0a2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1` |
| **Passphrase Người dùng (Mảnh 2)**| `Duyzkskhobo@310` |
| **Gói WrappedDataKey (60 Bytes)**| `TL01k9Xz9xF12aB3vB83c7DeF9a0B1c23d4e8a91bc7f02e5a6b7c8d9e0f1a2b3` |
| **File Nonce (12 Bytes)** | `0x9xF12aB3cD4e5f60` |
| **File Auth Tag (16 Bytes)** | `0xvB83c7DeF9a0B1c2d3E4f5` |
| **StorageKey Cloudflare R2** | `vaults/pv_11111111/assets/ast_98afbd90.enc` |
| **StorageUri CSDL** | `r2://legacyvault-private/vaults/pv_11111111/assets/ast_98afbd90.enc` |
| **Bảng CSDL lưu trữ** | Microsoft SQL Server 2022: `[dbo].[ContentVersions]` |

---

## 6. GIẢI THÍCH CHI TIẾT THUỘC TÍNH NONCE VÀ AUTHENTICATION TAG

Trong chuẩn mã hóa hiện đại **AES-256-GCM** (Galois/Counter Mode), hai thuộc tính **Nonce** và **Authentication Tag** đóng vai trò sống còn để biến một thuật toán mã hóa thông thường thành chuẩn **AEAD (Authenticated Encryption with Associated Data - Mã hóa xác thực toàn vẹn)**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     VAI TRÒ CỦA NONCE VÀ AUTHENTICATION TAG                            │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│ 1. NONCE (Number used ONCE)              │ 2. AUTHENTICATION TAG (Auth Tag / MAC)      │
│ Kích thước: 96-bit (12 Bytes)            │ Kích thước: 128-bit (16 Bytes)              │
├──────────────────────────────────────────┼─────────────────────────────────────────────┤
│ • Vector khởi tạo ngẫu nhiên.            │ • Con dấu niêm phong toán học (GHASH).      │
│ • Chống trùng lặp bản mã: Cùng 1 file mã │ • Chống giả mạo: Bất kỳ ai sửa đổi dù chỉ   │
│   hóa 2 lần sẽ ra 2 bản mã khác nhau 100%│   1 bit của file .enc hoặc gói khóa thì     │
│ • Chống tấn công phát lại (Replay).      │   Tag sẽ bị lệch ➔ LẬP TỨC CHẶN ĐỨNG.       │
│ • Không cần giữ bí mật (Lưu công khai).  │ • Không cần giữ bí mật (Lưu công khai).     │
└──────────────────────────────────────────┴─────────────────────────────────────────────┘
```

---

### 6.1. Thuộc tính Nonce (Number used ONCE - Số dùng một lần)

#### A. Nonce là gì?
* **Định nghĩa**: Là một chuỗi số ngẫu nhiên dài đúng **12 Bytes (96 bits)** được sinh ra từ bộ sinh số ngẫu nhiên an toàn mật mã học cấp hệ điều hành (CSPRNG - `RandomNumberGenerator.GetBytes(12)`).
* **Đặc tính cốt lõi**: Mỗi lần thực hiện mã hóa (cho dù là mã hóa một tệp tin hay bọc một chiếc chìa khóa), hệ thống **bắt buộc phải sinh một Nonce hoàn toàn mới, không bao giờ được lặp lại**.

#### B. Nonce dùng để làm gì?
1. **Chống suy đoán dữ liệu qua bản mã (Semantic Security)**:
   * Nếu không có Nonce, khi bạn mã hóa cùng một tệp tin `di_chuc_gia_dinh_2026.pdf` hai lần bằng cùng một chìa DEK, kết quả sẽ cho ra hai khối byte bản mã giống hệt nhau từng bit. Kẻ nghe lén mạng sẽ biết: *"Người này vừa tải lên cùng một bản di chúc cũ!"*.
   * Khi có Nonce ngẫu nhiên: Mỗi lần mã hóa, Nonce sẽ làm lệch toàn bộ chuỗi counter nội bộ của thuật toán AES. Hai bản mã sinh ra sẽ **hoàn toàn khác biệt 100%**, khiến kẻ tấn công không thể suy đoán hay so khớp nội dung.
2. **Chống tấn công phát lại (Replay Attacks)**:
   * Kẻ gian không thể bắt gói tin mã hóa cũ rồi gửi lại máy chủ để đánh lừa hệ thống, vì mỗi phiên giao dịch yêu cầu một Nonce độc nhất.
3. **Thảm họa tái sử dụng Nonce (Nonce Reuse Catastrophe)**:
   * Trong chế độ Galois/Counter Mode (GCM), điều cấm kỵ tuyệt đối là **dùng lại cùng 1 Nonce với cùng 1 Khóa**. Nếu lặp Nonce, phép toán XOR giữa hai bản mã sẽ làm triệt tiêu dòng khóa, cho phép hacker khôi phục được bản rõ và giải được khóa xác thực GHASH. Vì vậy, hệ thống luôn sinh Nonce ngẫu nhiên 96-bit độc nhất.
4. **Có cần giữ bí mật Nonce không?**
   * **KHÔNG CẦN BÍ MẬT**. Nonce có thể lưu công khai trong bảng CSDL `[dbo].[ContentVersions]` hoặc đính kèm ở đầu file. Kẻ tấn công chỉ biết Nonce mà không có Khóa DEK thì hoàn toàn bất lực.

---

### 6.2. Thuộc tính Authentication Tag (Auth Tag - Con dấu xác thực toàn vẹn)

#### A. Authentication Tag là gì?
* **Định nghĩa**: Là một con dấu số học dài đúng **16 Bytes (128 bits)** được sinh ra tự động bởi bộ nhân đa thức Galois Field (hàm băm GHASH) chạy song song trong suốt quá trình mã hóa AES-GCM.
* **Bản chất**: Nó giống như một chiếc "khóa niêm phong chì" niêm phong tệp tin lại.

#### B. Authentication Tag dùng để làm gì?
1. **Phát hiện mọi sự can thiệp hoặc sửa đổi dù chỉ 1 bit (Tamper-Proofing)**:
   * Các thuật toán mã hóa cổ điển (như AES-CBC) chỉ làm rối dữ liệu nhưng không có khả năng tự kiểm tra xem dữ liệu có bị ai chỉnh sửa hay không.
   * Với AES-GCM, con dấu Tag 128-bit phụ thuộc vào **từng bit một** của toàn bộ khối byte tệp tin và khóa bí mật. Nếu hacker, virus, hoặc quản trị viên can thiệp vào Cloudflare R2 để sửa đổi dù chỉ **01 bit nhị phân** trong tệp 14.8 MiB, thì khi giải mã, hàm `aesGcm.Decrypt()` sẽ phát hiện con dấu không khớp và ném ngoại lệ:
     ```
     System.Security.Cryptography.CryptographicException: 
     The computed authentication tag did not match the input authentication tag.
     ```
   * Hệ thống sẽ **ngay lập tức hủy phiên, từ chối mở két** và không bao giờ xuất dữ liệu rác hay dữ liệu độc hại ra ngoài.
2. **Chống tấn công cắt ghép bit (Bit-Flipping Attacks)**:
   * Ngăn chặn hoàn toàn kẻ xấu đảo bit mã hóa để làm thay đổi số tài khoản, số tiền hoặc tên người thụ hưởng trong bản di chúc.
3. **Có cần giữ bí mật Tag không?**
   * **KHÔNG CẦN BÍ MẬT**. Con dấu Tag được lưu công khai trong CSDL (cột `TagBase64`) làm căn cứ đối soát toán học khi mở két.

---

### 6.3. Sự phối hợp 2 tầng (Two-Tier Nonce & Tag Architecture)

Trong hệ thống LegacyVault, cơ chế Nonce và Tag được áp dụng độc lập ở **cả 2 tầng mật mã**:

```
                       ┌─────────────────────────────────────────────────────────┐
                       │          TẦNG 1: BỌC KHÓA (KEY WRAPPING)                │
                       ├─────────────────────────────────────────────────────────┤
                       │ Gói WrappedDataKey (60 Bytes lưu tại SQL Server):       │
                       │ [12B Wrap Nonce] + [16B Wrap Tag] + [32B Ciphertext DEK]│
                       │  • Wrap Nonce: Đảm bảo gói bọc DEK không trùng lặp.     │
                       │  • Wrap Tag: Chứng minh chìa DEK trong CSDL chưa từng   │
                       │    bị ai sửa đổi hoặc tráo đổi bằng khóa giả.           │
                       └────────────────────────────┬────────────────────────────┘
                                                    │
                                                    ▼
                       ┌─────────────────────────────────────────────────────────┐
                       │          TẦNG 2: MÃ HÓA NỘI DUNG TỆP                    │
                       ├─────────────────────────────────────────────────────────┤
                       │ Tệp di sản lưu tại Cloudflare R2 (14.8 MiB):            │
                       │ [File Ciphertext .enc] đi kèm [12B Nonce] & [16B Tag]   │
                       │  • File Nonce: Đảm bảo bản mã .enc trên R2 là độc nhất. │
                       │  • File Tag: Bảo vệ toàn vẹn tệp 14.8 MiB trên R2 chống │
                       │    mọi hành vi can thiệp trái phép.                     │
                       └─────────────────────────────────────────────────────────┘
```

---

## 7. CƠ SỞ LÝ THUYẾT MẬT MÃ HỌC LIÊN QUAN

Toàn bộ hệ thống LegacyVault được xây dựng dựa trên 4 trụ cột lý thuyết toán học và mật mã học hiện đại đã được chứng minh bảo mật toán học:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        4 TRỤ CỘT LÝ THUYẾT MẬT MÃ HỌC                                  │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│ 1. LÝ THUYẾT AEAD & GCM    │ 2. LÝ THUYẾT PHONG BÌ (KEK)│ 3. SHAMIR SECRET SHARING     │
│ (NIST SP 800-38D)          │ (NIST SP 800-57)           │ (Adi Shamir, 1979 - GF(256)) │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ • Bảo mật + Toàn vẹn kép.  │ • Phân cấp khóa DEK / KEK. │ • Ngưỡng (k=2, n=3).         │
│ • Chống tấn công đảo bit.  │ • Xoay khóa không re-enc.  │ • Bảo mật tuyệt đối Shannon. │
│ • Nhân Galois GF(2¹²⁸).    │ • Giảm bán kính rò rỉ.     │ • Nội suy đa thức Lagrange.  │
├────────────────────────────┴────────────────────────────┴──────────────────────────────┤
│ 4. LÝ THUYẾT TIÊU HỦY BỘ NHỚ AN TOÀN (CWE-14 / Cryptographic Zeroization)              │
│ • Chống Dead Code Elimination • Xóa ô nhớ RAM vật lý • Ngăn chặn trích xuất Heap Dump │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 7.1. Lý thuyết Mã Hóa Xác Thực AEAD (Authenticated Encryption with Associated Data)

#### A. Hạn chế của các chuẩn mã hóa cổ điển (Chỉ bảo mật - Confidentiality Only)
Trước khi chuẩn AEAD ra đời, các hệ thống thường dùng AES ở chế độ CBC (Cipher Block Chaining) hoặc CTR đơn thuần. Các chế độ này chỉ làm xáo trộn dữ liệu nhưng **hoàn toàn không bảo vệ tính toàn vẹn**:
* **Tấn công Đảo Bit (Bit-Flipping Attack)**: Trong AES-CBC hoặc CTR, kẻ tấn công có thể thay đổi một bit cụ thể trong Ciphertext mà không cần biết khóa, và khi giải mã, bit tương ứng trong bản rõ sẽ bị đảo ngược một cách có dự tính.
* **Tấn công Padding Oracle**: Khai thác thông điệp lỗi của hàm giải mã để dò từng byte dữ liệu mà không cần khóa.

#### B. Giải pháp AEAD với AES-GCM (NIST SP 800-38D)
Chuẩn **AES-GCM** giải quyết triệt để vấn đề trên bằng cách kết hợp hai cơ chế toán học trong một thao tác nguyên tử:
1. **Bộ mã hóa Counter (CTR Mode)**: Biến thuật toán mã hóa khối (Block Cipher) thành mã hóa dòng (Stream Cipher) tốc độ cao, song song hóa trên phần cứng (tập lệnh Intel AES-NI).
2. **Bộ xác thực đa thức Galois (GHASH)**: Tính toán hàm băm xác thực trên trường hữu hạn nhị phân $\text{GF}(2^{128})$ với đa thức tối giản:
   $$f(x) = x^{128} + x^7 + x^2 + x + 1$$
   Mỗi khối dữ liệu truyền qua sẽ được nhân trên trường Galois với khóa băm nội bộ $H = \text{AES}_K(0^{128})$ để tạo ra con dấu **Authentication Tag 128-bit**.
* **Định lý an toàn**: Không ai có thể tạo ra một cặp bản mã và Authentication Tag hợp lệ nếu không có khóa bí mật (xác suất làm giả thành công là $2^{-128} \approx 2.9 \times 10^{-39}$, coi như bằng 0).

---

### 7.2. Lý thuyết Phân Cấp Khóa & Mã Hóa Phong Bì (Key Hierarchy & Envelope Encryption)
*(Theo tiêu chuẩn NIST SP 800-57 Part 1 Rev. 5 - Recommendation for Key Management)*

#### A. Định lý giới hạn vòng đời của khóa (Key Lifecycle Limits)
Trong mật mã học, mã hóa quá nhiều dữ liệu bằng cùng một khóa đối xứng sẽ làm giảm độ an toàn (tấn công sinh nhật - Birthday Bound). Với AES-GCM, NIST khuyến nghị **không bao giờ mã hóa quá $2^{32}$ gói dữ liệu với cùng một khóa**.

#### B. Mô hình phân cấp 2 tầng (Two-Tier Key Hierarchy)
1. **Khóa dữ liệu DEK (Data Encryption Key)**:
   * Vòng đời: Dùng duy nhất **1 lần cho 1 tệp tin** (Single-use ephemeral key).
   * Ưu điểm: Nếu một tệp bị lộ khóa DEK, kẻ tấn công **chỉ mở được duy nhất tệp đó**, toàn bộ các tệp khác trong két vẫn an toàn 100% (Thu hẹp tối đa bán kính rò rỉ - Blast Radius Reduction).
2. **Khóa bọc KEK (Key Encryption Key)**:
   * Đóng vai trò như "chìa khóa két mẹ". Chỉ dùng để mã hóa khóa DEK (32 bytes), không bao giờ trực tiếp chạm vào dữ liệu lớn.
3. **Lợi ích vận hành khi Đổi Mật Khẩu (Zero-Re-encryption Key Rotation)**:
   * Khi người dùng đổi Passphrase (hoặc xoay khóa KEK), hệ thống **chỉ cần giải bọc và bọc lại gói 60 bytes `WrappedDataKey` trong CSDL SQL Server** (mất dưới 1 mili-giây).
   * **Tuyệt đối không cần tải về và mã hóa lại tệp tin 14.8 MiB trên Cloudflare R2**, tiết kiệm 100% băng thông và thời gian xử lý.

---

### 7.3. Lý thuyết Chia Sẻ Bí Mật Shamir (Shamir's Secret Sharing Scheme)
*(Được phát minh bởi Giáo sư Adi Shamir năm 1979 - Đồng tác giả chuẩn RSA)*

#### A. Nguyên lý hình học nội suy đa thức Lagrange
Một đa thức bậc $k-1$ được xác định duy nhất bởi tối thiểu $k$ điểm tọa độ:
* Trong mô hình của LegacyVault: Ngưỡng $k = 2$, tổng số mảnh $n = 3$.
* Đa thức có bậc $k - 1 = 1$, tức là một **đường thẳng**:
  $$P(x) = S + a_1 \cdot x$$
  * Điểm gốc tại trục tung $x = 0$ chính là bí mật cần bảo vệ: $P(0) = S$ (chính là Master KEK).
  * Hệ số dốc $a_1$ là một số ngẫu nhiên được chọn độc lập cho từng byte.
* **Nguyên lý ngưỡng (Threshold Property)**:
  * Khi có đủ $k = 2$ điểm bất kỳ: $(x_1, y_1)$ và $(x_2, y_2)$, ta luôn dựng được duy nhất một đường thẳng đi qua 2 điểm đó, kéo dài cắt trục tung tại đúng $x = 0$ để tìm lại $S$.
  * Công thức nội suy Lagrange:
    $$S = P(0) = y_1 \cdot \frac{0 - x_2}{x_1 - x_2} + y_2 \cdot \frac{0 - x_1}{x_2 - x_1}$$

#### B. Tại sao phải tính trên Trường Hữu Hạn Galois $\text{GF}(2^8)$ thay vì Số Thực $\mathbb{R}$?
Nếu tính trên trường số thực $\mathbb{R}$ hoặc số nguyên $\mathbb{Z}$:
1. **Lộ thông tin (Information Leakage)**: Kẻ cầm 1 mảnh $(x_1, y_1)$ có thể giới hạn được khoảng giá trị của $S$, vi phạm tính bí mật.
2. **Tràn số và phình to dung lượng**: Các phép chia số nguyên sẽ sinh ra phân số vô hạn tuần hoàn hoặc làm dung lượng mảnh phình to hơn dữ liệu gốc.

Hệ thống khắc phục hoàn hảo bằng cách ánh xạ toàn bộ phép toán vào **Trường hữu hạn Galois $\text{GF}(2^8)$ (hay $\text{GF}(256)$)**:
* Không gian giá trị: Đúng $2^8 = 256$ trạng thái (tương ứng chính xác 1 Byte từ `0x00` đến `0xFF`).
* Đa thức tối giản (Irreducible Polynomial) chuẩn AES:
  $$p(x) = x^8 + x^4 + x^3 + x + 1 \quad (\text{Mã hex: } 0x11D)$$
* **Phép cộng và trừ**: Trở thành phép **XOR bit ($\oplus$)**:
  $$A + B = A - B = A \oplus B$$
* **Phép nhân và chia**: Thực hiện thông qua bảng tra cứu số mũ $\text{EXP}$ và logarit $\text{LOG}$ cơ số sinh $g = 2$:
  $$A \otimes B = \text{EXP}[(\text{LOG}[A] + \text{LOG}[B]) \pmod{255}]$$
  $$A \oslash B = \text{EXP}[(\text{LOG}[A] - \text{LOG}[B] + 255) \pmod{255}]$$

#### C. Định lý Bí Mật Hoàn Hảo (Information-Theoretic Security / Perfect Secrecy)
*(Theo định lý nền tảng của Claude Shannon - 1949)*
* Trong trường $\text{GF}(256)$, khi kẻ tấn công (ví dụ: Admin máy chủ) chỉ có trong tay **duy nhất 1 Mảnh** $(x_1, y_1)$:
  Với mỗi giá trị bí mật $S' \in [0, 255]$ mà kẻ tấn công giả định, luôn tồn tại **đúng một hệ số dốc $a'_1 = (y_1 \oplus S') \oslash x_1$** hợp lệ.
* Xác suất để $S$ nhận bất kỳ giá trị nào là đồng đều tuyệt đối:
  $$P(S = s \mid \text{Mảnh } 1) = P(S = s) = \frac{1}{256}$$
* **Kết luận**: Mảnh 1 cung cấp đúng **0-bit thông tin** về Master KEK. Dù có siêu máy tính lượng tử cũng không thể brute-force hay suy đoán được khóa gốc nếu không có Mảnh thứ 2.

---

### 7.4. Lý thuyết Tiêu Hủy Bộ Nhớ An Toàn (Secure Memory Zeroization)
*(Tiêu chuẩn CWE-14: Compiler Removal of Code to Clear Buffers & DoD 5220.22-M)*

#### A. Cạm bẫy của việc giải phóng bộ nhớ thông thường trong C# / .NET
Nhiều lập trình viên lầm tưởng việc gán mảng byte về `null` hoặc để bộ thu gom rác (Garbage Collector - GC) dọn dẹp là đã an toàn. Thực tế:
* **GC không xóa dữ liệu ngay**: GC chỉ đánh dấu vùng nhớ là "có thể tái sử dụng", các byte khóa DEK trần vẫn nằm nguyên vẹn trên Heap RAM hàng giờ đồng hồ.
* **Tối ưu hóa của trình biên dịch (Dead Code Elimination)**: Nếu bạn dùng vòng lặp `for (int i=0; i<32; i++) dek[i] = 0;` ở cuối hàm, trình biên dịch JIT của .NET sẽ coi đây là "thao tác thừa" (vì biến `dek` không được đọc lại sau đó) và **tự động cắt bỏ hoàn toàn đoạn code xóa đó khỏi mã máy**.
* **Nguy cơ**: Kẻ tấn công có thể dump bộ nhớ tiến trình (Process Memory Dump), đọc trộm cold-boot RAM hoặc trích xuất crash log để lấy cắp khóa trần.

#### B. Giải pháp với CryptographicOperations.ZeroMemory()
Hệ thống sử dụng hàm chuẩn an toàn cấp hệ thống:
```csharp
CryptographicOperations.ZeroMemory(dek);
CryptographicOperations.ZeroMemory(plaintext);
```
* **Cơ chế**: Hàm này chèn một rào cản bộ nhớ (Memory Barrier / Volatile Write) ở cấp độ assembly (tương đương `RtlSecureZeroMemory` trên Windows hoặc `explicit_bzero` trên Linux).
* **Kết quả**: Bắt buộc CPU phải ghi đè ngay lập tức toàn bộ các byte bằng `0x00` lên thanh ghi và ô nhớ RAM vật lý, không một trình biên dịch nào được phép tối ưu hóa bỏ qua. Dữ liệu nhạy cảm biến mất vĩnh viễn khỏi RAM.


