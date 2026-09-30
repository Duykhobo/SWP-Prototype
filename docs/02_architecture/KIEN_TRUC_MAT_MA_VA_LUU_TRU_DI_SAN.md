# ĐẶC TẢ KIẾN TRÚC MẬT MÃ PHONG BÌ & LƯU TRỮ DI SẢN SỐ (LEGACYVAULT)
> **Mô hình triển khai:** Giải mã tại máy chủ, Passphrase xử lý tại Client (Server-side Decryption with Client-side Passphrase Processing).  
> **Trạng thái tài liệu:** Tài liệu thiết kế kỹ thuật nguyên mẫu (Prototype Specification) — phục vụ cài đặt và kiểm chứng thực tế.  
> **Vị trí lưu trữ:** Duy nhất tại `docs/KIEN_TRUC_MAT_MA_VA_LUU_TRU_DI_SAN.md`.

---

## MỤC LỤC TỔNG QUAN

* [**PHẦN I: TỔNG QUAN KIẾN TRÚC & MÔ HÌNH LƯU TRỮ**](#phần-i-tổng-quan-kiến-trúc--mô-hình-lưu-trữ)
  * [1.1. Nguyên lý Thiết kế & Ranh giới Bảo mật](#11-nguyên-lý-thiết-kế--ranh-giới-bảo-mật)
  * [1.2. Phân định Ba Vùng Lưu trữ Vật lý & Ba Mảnh Shamir](#12-phân-định-ba-vùng-lưu-trữ-vật-lý--ba-mảnh-shamir)
  * [1.3. Mô hình Dữ liệu Hai Tầng: Assets vs ContentVersions](#13-mô-hình-dữ-liệu-hai-tầng-assets-vs-contentversions)
* [**PHẦN II: QUY TRÌNH KỸ THUẬT & MÃ NGUỒN TRIỂN KHAI (.NET C#)**](#phần-ii-quy-trình-kỹ-thuật--mã-nguồn-triển-khai-net-c)
  * [2.1. Chiều Inbound: Tải lên, Mã hóa AES-GCM & Chống Ghi đĩa ngầm](#21-chiều-inbound-tải-lên-mã-hóa-aes-gcm--chống-ghi-đĩa-ngầm)
  * [2.2. Chiều Outbound: Mở két, Tái tạo KEK & Giải mã Tệp](#22-chiều-outbound-mở-két-tái-tạo-kek--giải-mã-tệp)
  * [2.3. Bảng Thông số Kỹ thuật Mẫu & Kiểm tra Định dạng](#23-bảng-thông-số-kỹ-thuật-mẫu--kiểm-tra-định-dạng)
* [**PHẦN III: QUẢN LÝ VÒNG ĐỜI KHÓA, PHIÊN BẢN & DUNG LƯỢNG**](#phần-iii-quản-lý-vòng-đời-khóa-phiên-bản--dung-lượng)
  * [3.1. Quản trị Bộ nhớ RAM & Vòng đời KEK (Request / Batch)](#31-quản-trị-bộ-nhớ-ram--vòng-đời-kek-request--batch)
  * [3.2. Quy chuẩn Quản lý Phiên bản Tệp (WORM & Độc lập Mật mã)](#32-quy-chuẩn-quản-lý-phiên-bản-tệp-worm--độc-lập-mật-mã)
  * [3.3. Chính sách Lưu giữ Phiên bản (Retention) & Kiểm soát Quota](#33-chính-sách-lưu-giữ-phiên-bản-retention--kiểm-soát-quota)
  * [3.4. Quy trình Phối hợp Xóa giữa CSDL và Cloudflare R2](#34-quy-trình-phối-hợp-xóa-giữa-csdl-và-cloudflare-r2)
  * [3.5. Ba Cấp độ Thay đổi Khóa & Xoay KEK Chịu lỗi (Resumable Rotation)](#35-ba-cấp-độ-thay-đổi-khóa--xoay-kek-chịu-lỗi-resumable-rotation)
* [**PHẦN IV: KỊCH BẢN THỰC TẾ & NỀN TẢNG LÝ THUYẾT TOÁN HỌC**](#phần-iv-kịch-bản-thực-tế--nền-tảng-lý-thuyết-toán-học)
  * [4.1. Bốn Kịch bản Vận hành Điển hình (End-to-End Walkthroughs)](#41-bốn-kịch-bản-vận-hành-điển-hình-end-to-end-walkthroughs)
  * [4.2. Cơ sở Lý thuyết Mật mã học Liên quan](#42-cơ-sở-lý-thuyết-mật-mã-học-liên-quan)

---

# PHẦN I: TỔNG QUAN KIẾN TRÚC & MÔ HÌNH LƯU TRỮ

### 1.1. Nguyên lý Thiết kế & Ranh giới Bảo mật

Hệ thống lưu trữ áp dụng mô hình **Mã hóa phong bì (Envelope Encryption)** kết hợp **Chia sẻ bí mật Shamir (Shamir's Secret Sharing trên trường hữu hạn $\text{GF}(256)$)** nhằm đạt mục tiêu: **Phân tách quyền kiểm soát dữ liệu khi nghỉ (Data-at-Rest), ngăn ngừa việc lộ lọt dữ liệu khi một thành phần lưu trữ đơn lẻ (CSDL hoặc Object Storage) bị xâm nhập.**

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
         │ • vaults/.../versions/{id}.enc│                             │ • [dbo].[ContentVersions]    │
         │ • Hoàn toàn không giữ khóa!  │                              │ • Không có KEK thì không mở  │
         └──────────────────────────────┘                              └──────────────────────────────┘
                                                        ▲
                                                        │ Ghép 2/3 mảnh Shamir trong RAM
                                                        │ (Mảnh 1 Server + Mảnh 2 Owner Share)
                                       ┌────────────────┴────────────────┐
                                       │     BỘ NHỚ RAM TẠM THỜI         │
                                       │ KEK và DEK thuộc Request/Batch  │
                                       │ finally { ZeroMemory() }        │
                                       └─────────────────────────────────┘
```

#### Ranh giới bảo mật (Trust Boundary):
1. **Ranh giới giải mã (Decryption Boundary):** Đây là mô hình *giải mã tại máy chủ, passphrase được xử lý tại client*, không phải mô hình Client-side End-to-End Encryption thuần túy. Tại thời điểm mở két để đọc hoặc tải file, máy chủ nhận đủ 2 mảnh để tái tạo KEK và giải mã DEK trong bộ nhớ RAM phục vụ phiên xử lý.
2. **Giới hạn kiểm soát đối với Quản trị viên hệ thống (Host Administrator):** Vì tiến trình backend phải giải mã dữ liệu và xử lý khóa trong RAM, kiến trúc này **không thể bảo vệ dữ liệu trước quản trị viên kiểm soát hoàn toàn hệ điều hành máy chủ** (người có quyền dump bộ nhớ tiến trình hoặc can thiệp runtime). Mục tiêu cốt lõi của kiến trúc là bảo vệ dữ liệu khi nghỉ (at-rest), chống lại việc lộ lọt dữ liệu từ Database Administrator (DBA), rò rỉ bản sao lưu CSDL hoặc lộ bucket lưu trữ Cloudflare R2 đơn phương.
3. **Passphrase được xử lý tại Client:** Trình duyệt phía người dùng chạy thuật toán dẫn xuất khóa (KDF) từ Passphrase để mở khóa `Owner Share`. Máy chủ **không bao giờ tiếp nhận hoặc lưu trữ chuỗi ký tự Passphrase thô**.
4. **Lưu trữ bản mã Owner Share:** Bản mã Owner share được lưu cùng salt, tham số KDF, nonce, tag và `KekVersionId`. Nếu chỉ lưu cục bộ trên thiết bị, người dùng cần cơ chế sao lưu (như xuất mã phục hồi / Emergency Kit) để mở két trên thiết bị khác.
5. **Phân tách dữ liệu và khóa:** Bản mã tệp (`.enc`) nằm trên Object Storage (Cloudflare R2); các gói khóa đã bọc (`WrappedDataKey`), Nonce, Auth Tag và siêu dữ liệu phiên bản nằm trên CSDL (SQL Server).

---

### 1.2. Phân định Ba Vùng Lưu trữ Vật lý & Ba Mảnh Shamir

| Thành phần | Nơi lưu trữ vật lý | Bản chất dữ liệu | Đặc tính bảo mật |
| :--- | :--- | :--- | :--- |
| **Tệp bản mã (`.enc`)** | **Cloudflare R2** *(Private Bucket)* | Luồng byte nhị phân đã mã hóa AES-256-GCM (`15,518,920 Bytes`). | Không chứa khóa. Kẻ xâm nhập chỉ thấy khối byte ngẫu nhiên vô nghĩa. |
| **Gói `WrappedDataKey`** | **SQL Server 2022** *(Bảng `[dbo].[ContentVersions]`)* | Chuỗi Base64 dài đúng **80 ký tự** từ gói nhị phân 60 bytes: `[12B Nonce] + [16B Tag] + [32B Encrypted DEK]`. | Được bọc bằng Master KEK qua AES-256-GCM. Không thể mở nếu thiếu KEK. |
| **Mảnh 1 (System Share)** | **SQL Server 2022** *(Bọc bằng Cloud KMS / App Key)* | Điểm tọa độ Shamir tại $x = 1$. | Đứng đơn lẻ cung cấp đúng **0-bit thông tin** về Master KEK theo định lý bảo mật của Claude Shannon. |
| **Mảnh 2 (Owner Share)** | **Lưu tại Client / Thiết bị người dùng** *(Bọc bằng PassphraseKey)* | Điểm tọa độ Shamir tại $x = 2$, được mã hóa bằng khóa dẫn xuất từ Passphrase qua Argon2id. | Chỉ được giải mã tại client khi người dùng mở két và gửi lên server theo phạm vi request/batch. |
| **Mảnh 3 (Emergency Share)** | **Bản in cứu hộ / Người thừa kế** | Điểm tọa độ Shamir tại $x = 3$. | Dùng để khôi phục khi mất Passphrase theo quy trình di sản hợp pháp. |
| **KEK & DEK trần** | **RAM tiến trình Backend** *(Bộ nhớ tạm thời)* | Khóa đối xứng 256-bit nguyên vẹn. | **Không lưu đĩa/DB**. Tồn tại trong phạm vi request/batch và được ghi đè trong `finally`. |

---

### 1.3. Mô hình Dữ liệu Hai Tầng: Assets vs ContentVersions

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               MÔ HÌNH PHÂN TẦNG: ASSETS (LOGIC) vs CONTENT_VERSIONS (VẬT LÝ)           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   [Bảng dbo.Assets] (Thực thể tài sản logic)                                           │
│   • AssetId:          98afbd90-502a-4315-a459-bc39d73507d4                             │
│   • VaultId:          pv_11111111                                                      │
│   • Title:            "Hồ sơ nhà đất & Di chúc 2026"                                   │
│   • CurrentVersionId: ver_00000002-aaaa-bbbb-cccc-222222222222 ──┐ (Trỏ bản mới nhất)  │
│   • TotalVersions:    2                                          │                     │
│                                                                  │                     │
│   ┌──────────────────────────────────────────────────────────────┘                     │
│   ▼                                                                                    │
│   [Bảng dbo.ContentVersions] (Các phiên bản vật lý bất biến)                           │
│   ├─────────────────────────────────────────────────────────────────────────────────┤  │
│   │ Phiên bản 1 (VersionNumber = 1, Status = 'Archived')                            │  │
│   │ • VersionId:        ver_00000001-aaaa-bbbb-cccc-111111111111                    │  │
│   │ • StorageKey:       vaults/pv_11111111/assets/.../versions/ver_00000001.enc      │  │
│   │ • WrappedDataKey:   [DEK_1 bọc bởi KEK_v1] (80 ký tự Base64)                    │  │
│   │ • Nonce/Tag:        [Nonce_1] & [Tag_1]                                         │  │
│   │ • ChecksumSha256:   3a7b9c1d... (2.45 MB)                                       │  │
│   ├─────────────────────────────────────────────────────────────────────────────────┤  │
│   │ Phiên bản 2 (VersionNumber = 2, Status = 'Active/Ready') ◄──────────────────────┘  │
│   │ • VersionId:        ver_00000002-aaaa-bbbb-cccc-222222222222                      │
│   │ • StorageKey:       vaults/pv_11111111/assets/.../versions/ver_00000002.enc        │
│   │ • WrappedDataKey:   [DEK_2 bọc bởi KEK_v1 hoặc KEK_v2] (80 ký tự Base64)           │
│   │ • Nonce/Tag:        [Nonce_2] & [Tag_2] (Hoàn toàn mới)                            │
│   │ • ChecksumSha256:   8f4b23a9... (3.10 MB)                                       │
│   └─────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Tầng Tài sản Logic (`dbo.Assets`):** Đại diện cho đối tượng di sản trên giao diện. Con trỏ `CurrentVersionId` giúp người dùng luôn mở phiên bản mới nhất một cách trong suốt.
2. **Tầng Phiên bản Vật lý Bất biến (`dbo.ContentVersions`):** Lưu trữ từng lần sửa đổi/cập nhật theo nguyên tắc **Append-Only** (không bao giờ sửa đè bản ghi cũ).

---

# PHẦN II: QUY TRÌNH KỸ THUẬT & MÃ NGUỒN TRIỂN KHAI (.NET C#)

### 2.1. Chiều Inbound: Tải lên, Mã hóa AES-GCM & Chống Ghi đĩa ngầm

Để ngăn chặn framework ASP.NET Core tự ý xả file xuống thư mục tạm (`%TEMP%` hoặc `/tmp`) khi vượt ngưỡng 64 KB của `IFormFile`, hệ thống dùng `MultipartReader` đọc trực tiếp request stream vào một mảng byte cố định được bảo vệ bởi Semaphore.

```csharp
// Semaphore dùng chung trong toàn tiến trình, cấu hình tối đa 5 tác vụ song song
private static readonly SemaphoreSlim CryptoConcurrencySemaphore = new(5, 5);
private static int _waitingQueueCount = 0;
private const int MaxWaitingQueueLimit = 20; // Giới hạn hàng đợi chờ tối đa 20 yêu cầu

public async Task HandleUploadEnvelopeAsync(Guid vaultId, Guid assetId, HttpContext context, CancellationToken ct)
{
    const int MaxAllowedBytes = 20 * 1024 * 1024; // Giới hạn cứng 20 MiB cho prototype
    
    // 1. Kiểm soát độ dài hàng đợi chờ
    if (Interlocked.Increment(ref _waitingQueueCount) > MaxWaitingQueueLimit)
    {
        Interlocked.Decrement(ref _waitingQueueCount);
        context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
        await context.Response.WriteAsync("Hàng đợi xử lý mật mã đã đầy. Vui lòng thử lại sau.", ct);
        return;
    }

    bool semaphoreAcquired = false;
    byte[]? plaintextBuffer = null;
    int actualLength = 0;

    try
    {
        // 2. Chờ nhận slot xử lý (tối đa 10 giây)
        if (!await CryptoConcurrencySemaphore.WaitAsync(TimeSpan.FromSeconds(10), ct))
        {
            context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
            await context.Response.WriteAsync("Máy chủ đang bận xử lý tác vụ mật mã. Hết thời gian chờ.", ct);
            return;
        }
        semaphoreAcquired = true;

        // 3. Cấp phát buffer cố định BÊN TRONG try (đảm bảo giải phóng Semaphore nếu OOM)
        plaintextBuffer = new byte[MaxAllowedBytes];

        var mediaType = MediaTypeHeaderValue.Parse(context.Request.ContentType);
        var boundary = HeaderUtilities.RemoveQuotes(mediaType.Boundary).Value;
        var reader = new MultipartReader(boundary, context.Request.Body);

        MultipartSection? section;
        while ((section = await reader.ReadNextSectionAsync(ct)) != null)
        {
            if (!ContentDispositionHeaderValue.TryParse(section.ContentDisposition, out var disposition) 
                || !disposition.IsFileDisposition())
            {
                continue;
            }

            int bytesRead;
            while ((bytesRead = await section.Body.ReadAsync(
                plaintextBuffer.AsMemory(actualLength, MaxAllowedBytes - actualLength), ct)) > 0)
            {
                actualLength += bytesRead;
                if (actualLength >= MaxAllowedBytes)
                {
                    byte[] probe = new byte[1];
                    try
                    {
                        if (await section.Body.ReadAsync(probe, ct) > 0)
                        {
                            throw new InvalidOperationException($"Tệp vượt quá giới hạn dung lượng ({MaxAllowedBytes} bytes).");
                        }
                    }
                    finally
                    {
                        CryptographicOperations.ZeroMemory(probe);
                    }
                }
            }
            break;
        }

        if (actualLength == 0)
        {
            throw new InvalidOperationException("Không tìm thấy nội dung tệp tin hợp lệ.");
        }

        // Tạo VersionId định danh duy nhất trước khi mã hóa (ngăn ghi đè object key)
        Guid versionId = Guid.NewGuid();
        await ProcessEncryptionAndUploadAsync(vaultId, assetId, versionId, plaintextBuffer.AsMemory(0, actualLength), ct);
    }
    finally
    {
        Interlocked.Decrement(ref _waitingQueueCount);
        if (plaintextBuffer != null)
        {
            CryptographicOperations.ZeroMemory(plaintextBuffer);
        }
        if (semaphoreAcquired)
        {
            CryptoConcurrencySemaphore.Release();
        }
    }
}

private async Task ProcessEncryptionAndUploadAsync(
    Guid vaultId, 
    Guid assetId, 
    Guid versionId, 
    ReadOnlyMemory<byte> plaintextMemory, 
    CancellationToken ct)
{
    byte[] checksumSha256 = SHA256.HashData(plaintextMemory.Span);

    byte[] dek = RandomNumberGenerator.GetBytes(32);
    byte[] fileNonce = RandomNumberGenerator.GetBytes(12);
    byte[] ciphertext = new byte[plaintextMemory.Length];
    byte[] fileTag = new byte[16];

    try
    {
        using (var aesGcm = new AesGcm(dek, 16))
        {
            aesGcm.Encrypt(fileNonce, plaintextMemory.Span, ciphertext, fileTag);
        }

        // Bọc DEK bằng Master KEK (Key Wrapping)
        byte[] wrapNonce = RandomNumberGenerator.GetBytes(12);
        byte[] encryptedDek = new byte[32];
        byte[] wrapTag = new byte[16];

        using (var aesWrap = new AesGcm(currentMasterKek, 16))
        {
            aesWrap.Encrypt(wrapNonce, dek, encryptedDek, wrapTag);
        }

        // Đóng gói 60 bytes: [12B WrapNonce] + [16B WrapTag] + [32B EncryptedDEK]
        byte[] combinedWrappedKey = new byte[60];
        Buffer.BlockCopy(wrapNonce, 0, combinedWrappedKey, 0, 12);
        Buffer.BlockCopy(wrapTag, 0, combinedWrappedKey, 12, 16);
        Buffer.BlockCopy(encryptedDek, 0, combinedWrappedKey, 28, 32);

        string wrappedKeyBase64 = Convert.ToBase64String(combinedWrappedKey);

        // BẮT BUỘC: Đặt StorageKey chứa versionId để phân lập từng phiên bản tệp
        string storageKey = $"vaults/{vaultId}/assets/{assetId}/versions/{versionId}.enc";

        // Tải lên R2
        await StorageService.UploadToR2Async(storageKey, ciphertext, ct);

        try
        {
            // Lưu siêu dữ liệu vào SQL Server
            await DatabaseService.SaveContentVersionAsync(new ContentVersionRecord
            {
                VersionId = versionId,
                AssetId = assetId,
                StorageKey = storageKey,
                WrappedKeyBase64 = wrappedKeyBase64,
                KekVersionId = currentKekVersionId,
                NonceBase64 = Convert.ToBase64String(fileNonce),
                TagBase64 = Convert.ToBase64String(fileTag),
                ChecksumSha256 = Convert.ToHexString(checksumSha256).ToLowerInvariant(),
                SizeBytes = ciphertext.Length,
                Status = "Ready"
            }, ct);
        }
        catch (Exception ex)
        {
            // Xử lý bù trừ an toàn: Không xóa vội trên R2 nếu nghi ngờ mạng rớt sau commit
            await HandleUploadDbFailureAsync(storageKey, versionId, ex);
            throw;
        }
    }
    finally
    {
        CryptographicOperations.ZeroMemory(dek);
    }
}
```

---

### 2.2. Chiều Outbound: Mở két, Tái tạo KEK & Giải mã Tệp

```
[1. Kiểm tra Quyền & Đọc Bản Ghi Phiên Bản]
 Nhận yêu cầu tải: (assetId, versionId)
 ──► Truy vấn CSDL đọc ContentVersionRecord tương ứng
 ──► LẤY ĐƯỢC record.KekVersionId
         │
         ▼
[2. Chọn Mảnh & Khôi Phục KEK Theo Phiên Bản Khóa]
 Lấy Mảnh 1 (System Share) của KekVersionId từ CSDL
 Lấy Mảnh 2 (Owner Share) của KekVersionId từ Client gửi lên
 ──► Nội suy Lagrange GF(256) trong RAM ──► Tái tạo Master KEK
         │
         ▼ [TRY/FINALLY BẢO VỆ MASTER KEK Ở LỚP NGOÀI CÙNG]
[3. Mở Bọc DEK, Tải R2 & Giải Mã File]
 Mở bọc WrappedDataKey bằng Master KEK ──► Có DEK trần
 ──► Tải ciphertext từ R2 bằng StorageKey
 ──► Giải mã AES-256-GCM ──► Đối soát Auth Tag & Checksum SHA-256
         │
         ▼
 Ghi vào Response Stream ──► finally { ZeroMemory(plaintext); }
```

```csharp
public async Task HandleDownloadAssetVersionAsync(
    Guid assetId, 
    Guid? requestedVersionId, 
    Func<int, Task<byte[]>> resolveOwnerShareForKekVersionAsync, 
    HttpContext context, 
    CancellationToken ct)
{
    // Áp dụng Semaphore đồng thời cho cả chiều tải xuống
    if (!await CryptoConcurrencySemaphore.WaitAsync(TimeSpan.FromSeconds(10), ct))
    {
        context.Response.StatusCode = StatusCodes.Status503ServiceUnavailable;
        await context.Response.WriteAsync("Máy chủ đang bận xử lý giải mã tệp. Vui lòng thử lại sau.", ct);
        return;
    }

    try
    {
        // 1. Đọc bản ghi phiên bản file trước để xác định KekVersionId
        var record = await DatabaseService.GetContentVersionAsync(assetId, requestedVersionId, ct);
        if (record == null)
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }

        // 2. Chọn System share và Owner share đúng với KekVersionId của file này
        byte[] systemShareBytes = await DatabaseService.GetSystemShareAsync(record.KekVersionId, ct);
        byte[] ownerShareBytes = await resolveOwnerShareForKekVersionAsync(record.KekVersionId);

        // 3. Tái tạo Master KEK tương ứng với phiên bản
        byte[] masterKek = ShamirSecretSharing.Combine(systemShareBytes, ownerShareBytes);

        // BẮT BUỘC: try/finally quản lý masterKek ở lớp ngoài cùng
        try
        {
            byte[] combined = Convert.FromBase64String(record.WrappedKeyBase64);
            if (combined.Length != 60)
            {
                throw new CryptographicException("Độ dài gói WrappedKey không hợp lệ.");
            }

            byte[] wrapNonce = combined[0..12];
            byte[] wrapTag = combined[12..28];
            byte[] encryptedDek = combined[28..60];

            byte[] dek = new byte[32];
            try
            {
                using (var aesWrap = new AesGcm(masterKek, 16))
                {
                    aesWrap.Decrypt(wrapNonce, encryptedDek, wrapTag, dek);
                }

                // Tải ciphertext từ R2 bằng StorageKey phiên bản
                byte[] ciphertext = await StorageService.DownloadFromR2Async(record.StorageKey, ct);

                byte[] fileNonce = Convert.FromBase64String(record.NonceBase64);
                byte[] fileTag = Convert.FromBase64String(record.TagBase64);
                byte[] plaintext = new byte[ciphertext.Length];

                try
                {
                    using (var aesGcm = new AesGcm(dek, 16))
                    {
                        aesGcm.Decrypt(fileNonce, ciphertext, fileTag, plaintext);
                    }

                    // Đối soát Checksum SHA-256
                    byte[] computedHash = SHA256.HashData(plaintext);
                    if (!Convert.ToHexString(computedHash).Equals(record.ChecksumSha256, StringComparison.OrdinalIgnoreCase))
                    {
                        throw new CryptographicException("Đối soát Checksum SHA-256 thất bại: tệp đã bị sai lệch.");
                    }

                    // Ghi ra Response Stream an toàn
                    await SendFileStreamResponseAsync(context.Response, plaintext, record.FileName, record.ContentType, ct);
                }
                finally
                {
                    CryptographicOperations.ZeroMemory(plaintext);
                }
            }
            finally
            {
                CryptographicOperations.ZeroMemory(dek);
            }
        }
        finally
        {
            CryptographicOperations.ZeroMemory(masterKek);
        }
    }
    finally
    {
        CryptoConcurrencySemaphore.Release();
    }
}

private static async Task SendFileStreamResponseAsync(
    HttpResponse response, 
    byte[] plaintext, 
    string fileName, 
    string? contentType, 
    CancellationToken ct)
{
    response.ContentType = string.IsNullOrWhiteSpace(contentType) 
        ? "application/octet-stream" 
        : contentType;
        
    response.ContentLength = plaintext.Length;

    var contentDisposition = new ContentDispositionHeaderValue("attachment");
    contentDisposition.SetHttpFileName(fileName);
    response.Headers.ContentDisposition = contentDisposition.ToString();

    response.Headers.CacheControl = "no-store, no-cache, must-revalidate";
    response.Headers.Pragma = "no-cache";

    // Ghi vào response stream; tầng HTTP/TLS có thể tiếp tục buffering trong kernel
    await response.Body.WriteAsync(plaintext.AsMemory(), ct);
    await response.Body.FlushAsync(ct);
}
```

---

### 2.3. Bảng Thông số Kỹ thuật Mẫu & Kiểm tra Định dạng

*(Các giá trị chuỗi và byte dưới đây dùng để minh họa định dạng và kiểm tra độ dài dữ liệu, không dùng làm khóa/nonce thực tế).*

| Thuộc tính | Định dạng & Kiểu dữ liệu | Giá trị minh họa hợp lệ |
| :--- | :--- | :--- |
| **Tên tệp di sản** | Chuỗi ký tự UTF-8 | `di_chuc_gia_dinh_2026.pdf` |
| **Kích thước tệp** | Số nguyên byte | `15,518,920 Bytes` (~14.8 MiB) |
| **Mã băm SHA-256** | Hex (64 ký tự thường) | `8f4b23a9c7d1e5f8a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5` |
| **Khóa DEK trần** | 32 bytes (256 bits) | `0x7a3f89b1c2d0e4f5...` *(chỉ tồn tại trong RAM)* |
| **Master KEK** | 32 bytes (256 bits) | `0xe4c89b3f71a0d2e5...` *(chỉ tồn tại trong RAM)* |
| **Gói WrappedDataKey** | Nhị phân: 60 bytes<br>**Base64: đúng 80 ký tự** | `TL01k9Xz9xF12aB3vB83c7DeF9a0B1c23d4e8a91bc7f02e5a6b7c8d9e0f1a2b3kL90aB1cD2eF3g4h` |
| **File Nonce (Hex)** | 12 bytes (96 bits Hex) | `0x9a0f12ab3cd4e5f60718293a` |
| **File Auth Tag (Hex)** | 16 bytes (128 bits Hex) | `0xb83c7def9a0b1c2d3e4f5a6b7c8d9e0f` |
| **Đường dẫn R2** | Chuỗi Object Storage key | `vaults/pv_11111111/assets/ast_98afbd90/versions/ver_01k9d7a2.enc` |
| **Bảng lưu trữ DB** | SQL Server 2022 | `[dbo].[ContentVersions]` |

```csharp
// Kiểm tra định dạng minh họa (Illustrative Format Assertion)
byte[] testPackage = new byte[60];
RandomNumberGenerator.Fill(testPackage); // Dữ liệu giả lập kiểm tra định dạng Base64

string base64String = Convert.ToBase64String(testPackage);

Debug.Assert(testPackage.Length == 60);
Debug.Assert(base64String.Length == 80);
Debug.Assert(!base64String.EndsWith("="), "60 bytes chia hết cho 3 nên không có ký tự padding '='.");
Debug.Assert(Convert.FromBase64String(base64String).AsSpan().SequenceEqual(testPackage));
```

---

# PHẦN III: QUẢN LÝ VÒNG ĐỜI KHÓA, PHIÊN BẢN & DUNG LƯỢNG

### 3.1. Quản trị Bộ nhớ RAM & Vòng đời KEK (Request / Batch)

* **Ước lượng tiêu thụ RAM:** Khi giải mã tệp $15\text{ MiB}$, hệ thống cần đồng thời:
  * Buffer bản mã từ R2: $\approx 15\text{ MiB}$.
  * Buffer bản rõ sau giải mã: $\approx 15\text{ MiB}$.
  * Tổng tối thiểu hai buffer chính: $\approx 30\text{ MiB}$.
  * Cả hai buffer đều vượt $85.000\text{ bytes}$ nên được đưa vào **Large Object Heap (LOH)** (chỉ thu gom trong GC Gen 2).
  * Với 5 tác vụ song song, hai buffer chính chiếm $\approx 150\text{ MiB}$ (chưa tính buffer upload, S3 SDK và runtime). Cần đo tải thực tế để chốt hạn mức tiến trình.
* **Vòng đời KEK (Request/Batch-scoped):**
  * Hệ thống **chọn mô hình Request hoặc Batch**, không duy trì session mở két kéo dài.
  * KEK chỉ sống trong phạm vi xử lý của request/batch và được xóa sổ bằng `CryptographicOperations.ZeroMemory()` trong `finally` ngoài cùng.
  * Nếu một batch gồm 5 file: KEK được giữ trong suốt quá trình xử lý 5 file và chỉ bị xóa khi toàn bộ batch hoàn tất.
* **Giới hạn của `ZeroMemory()`:** Hàm chỉ ghi đè mảng byte được chỉ định trong RAM do ứng dụng quản lý; không thể đảm bảo xóa các bản sao ở tầng socket/TLS buffer của OS hoặc khi tiến trình bị tắt đột ngột (killed).

---

### 3.2. Quy chuẩn Quản lý Phiên bản Tệp (WORM & Độc lập Mật mã)

1. **Nguyên tắc WORM (Write-Once-Read-Many):** Mọi phiên bản sau khi đạt `Ready` là bất biến. Không bao giờ cập nhật ghi đè nội dung file hoặc DEK của phiên bản cũ. Mọi thay đổi đều là Append-Only.
2. **Độc lập Mật mã tuyệt đối:**
   * Mỗi phiên bản sở hữu riêng một bộ: $\text{DEK}$, $\text{FileNonce}$, $\text{FileTag}$, $\text{StorageKey}$ và $\text{KekVersionId}$.
   * **Cô lập rủi ro (Blast Radius):** Nếu lộ DEK của Version 1, kẻ tấn công hoàn toàn không thể giải mã Version 2.
3. **Máy trạng thái Phiên bản:**
   * `Pending`: Đang stream lên R2 và chờ commit DB.
   * `Ready / Active`: Đã lưu thành công cả R2 và DB, đối soát SHA-256 khớp.
   * `Archived`: Phiên bản lịch sử, vẫn giải mã độc lập khi cần.
   * `SoftDeleted`: Đánh dấu xóa mềm trong thời gian ân hạn.
   * `CryptoShredded`: Tiêu hủy vĩnh viễn bằng cách xóa `WrappedDataKey`.
4. **Cơ chế Rollback tức thời:** Người dùng muốn hoàn tác về Version 1 chỉ cần cập nhật con trỏ `CurrentVersionId` trong bảng `Assets` ($< 1\text{ ms}$, tốn 0 byte băng thông R2).

---

### 3.3. Chính sách Lưu giữ Phiên bản (Retention) & Kiểm soát Quota

Mỗi phiên bản làm tăng dung lượng lưu trữ — chủ yếu trên **Cloudflare R2** (10 bản của file 15 MB $\approx 150\text{ MB}$ bản mã), trong khi CSDL SQL Server chỉ tăng thêm 10 dòng metadata.

* **Chính sách lưu giữ đề xuất cho Prototype:**
  1. **Bản mới nhất (`Active`):** Luôn được bảo vệ và lưu trữ vô điều kiện.
  2. **Chính sách 3 phiên bản gần nhất (Rolling 3 Versions):** Hệ thống duy trì tối đa 3 phiên bản gần nhất (ví dụ khi tải lên $V_4$, hệ thống duy trì $V_2, V_3, V_4$ và lên lịch dọn dẹp $V_1$).
  3. **Khóa bảo vệ tham chiếu di sản (Legal Hold / Grant Reference Lock):** Nếu một phiên bản cũ ($V_1$) đang được gắn vào một **Hồ sơ chuyển giao di sản (Inheritance Grant)** hoặc di chúc đã niêm phong, phiên bản đó **tuyệt đối không bị xóa tự động** cho đến khi tham chiếu hết hiệu lực.
  4. **Nguyên tắc an toàn khi dọn dẹp:** Hệ thống **chỉ dọn dẹp $V_1$ sau khi $V_4$ đã lưu thành công (`Ready`)**. Nếu $V_4$ lỗi mạng, $V_1$ vẫn được giữ nguyên.
  5. **Tính Quota tài khoản:** Tính theo **tổng dung lượng thực tế của tất cả các phiên bản đang lưu trên Cloudflare R2**.

---

### 3.4. Quy trình Phối hợp Xóa giữa CSDL và Cloudflare R2

#### Tình huống 1: Xóa chính quy qua LegacyVault
1. **Kiểm tra tham chiếu:** Xác nhận phiên bản không bị khóa bởi hồ sơ chuyển giao (Grant).
2. **Đánh dấu `PendingDeletion`:** Cập nhật DB, lập tức chặn mọi lượt tải mới.
3. **Yêu cầu xóa R2:** Gửi lệnh xóa đúng `StorageKey` trên Cloudflare R2.
4. **Xác nhận & Tiêu hủy mật mã (Crypto-shredding):** Khi R2 xác nhận xóa thành công, mới cập nhật DB sang `Deleted` và loại bỏ `WrappedDataKey`, Nonce, Tag.
5. **Xử lý lỗi mạng:** Nếu R2 timeout/lỗi, giữ trạng thái `PendingDeletion` để tiến trình nền thử lại (Retry). **Không báo xóa thành công khi chưa nhận được xác nhận từ R2.**

#### Tình huống 2: Tệp bị xóa ngoài luồng trên Dashboard Cloudflare R2
* Khi người dùng tải file hoặc khi **Job đối soát định kỳ (Reconciliation Job)** quét qua:
  * Nhận mã lỗi `404 Not Found` từ R2 $\rightarrow$ Backend cập nhật DB sang trạng thái **`Missing`** (phân biệt rõ với lỗi kết nối mạng tạm thời hoặc 403 Forbidden).
  * Giao diện hiển thị: *"Tệp dữ liệu không còn tồn tại trong kho lưu trữ vật lý"*, đồng thời đề xuất người dùng tải các phiên bản còn lại.
* **Nguyên tắc cốt lõi:** Các thông tin khóa bọc (`WrappedDataKey`), Nonce và Tag trong DB **hoàn toàn không thể tự phục hồi lại file đã mất** nếu thiếu khối byte bản mã trên R2 hoặc trong bản sao lưu.

---

### 3.5. Ba Cấp độ Thay đổi Khóa & Xoay KEK Chịu lỗi (Resumable Rotation)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           PHÂN ĐỊNH 3 QUY TRÌNH THAY ĐỔI KHÓA                           │
├───────────────────────┬───────────────────────────────┬─────────────────────────────────┤
│ THAO TÁC              │ DỮ LIỆU CẦN CẬP NHẬT          │ ĐẶC TÍNH VẬN HÀNH               │
├───────────────────────┼───────────────────────────────┼─────────────────────────────────┤
│ 1. Đổi Passphrase     │ • Bản mã Owner share          │ • KEK giữ nguyên.               │
│    (KEK giữ nguyên)   │ • Salt và tham số KDF         │ • Không chạm vào Wrapped DEK hay│
│                       │                               │   tệp trên R2. Phải chạy KDF.   │
├───────────────────────┼───────────────────────────────┼─────────────────────────────────┤
│ 2. Xoay Master KEK    │ • Cặp mảnh Shamir mới         │ • Giải bọc DEK bằng KEK cũ rồi  │
│    (Đổi KEK định kỳ)  │ • Bọc lại các Wrapped DEK     │   bọc bằng KEK mới trong CSDL.  │
│                       │ • Cập nhật KekVersionId       │ • Tệp trên R2 KHÔNG CẦN TẢI VỀ. │
├───────────────────────┼───────────────────────────────┼─────────────────────────────────┤
│ 3. Xoay DEK           │ • Sinh DEK mới                │ • Phải tải tệp về, giải mã rồi  │
│    (Khóa tệp bị lộ)   │ • Mã hóa lại toàn bộ tệp      │   mã hóa lại và đẩy lên R2.     │
└───────────────────────┴───────────────────────────────┴─────────────────────────────────┘
```

#### Quy trình Xoay KEK theo lô có khả năng tiếp tục sau sự cố (Resumable Rotation):
Vì KEK không lưu trên đĩa, nếu tiến trình xoay khóa bị dừng giữa chừng (mất điện, tiến trình bị tắt), truy vấn `WHERE KekVersionId = 1` chỉ xác định các bản ghi còn lại, **không thể tự khôi phục được `KEK_v1` và `KEK_v2` đã mất trong RAM**.

1. **Lưu trữ cấu hình:** Tạo bộ mảnh Shamir mới (được bảo vệ) cho `KEK_v2`, ghi nhận `JobStatus = 'InProgress'` trong DB.
2. **Định tuyến upload mới:** Toàn bộ file mới tải lên ngay lập tức dùng `KEK_v2`.
3. **Thực thi chuyển đổi theo lô:**
   * Đọc `KekVersionId` để chọn đúng khóa giải bọc DEK.
   * Mở bọc DEK bằng `KEK_v1`, bọc lại bằng `KEK_v2`.
   * Cập nhật `WrappedDataKey` và gán `KekVersionId = 2` trong cùng một transaction với kiểm tra phiên bản/`rowversion`.
4. **Xử lý khi gián đoạn (Crash/Restart):**
   * Khi khởi động lại, hệ thống nhận diện `JobStatus = 'InProgress'`.
   * **Tạm dừng tiến trình và chờ mở khóa lại (Re-unlock):** Yêu cầu cung cấp **đủ các mảnh tương ứng của từng phiên bản khóa** (cả `KEK_v1` và `KEK_v2`). Việc đăng nhập của Quản trị viên máy chủ đơn thuần không thể khôi phục được các KEK này.
   * Sau khi nạp đủ 2 khóa vào RAM, job mới tiếp tục xử lý các bản ghi còn mang `KekVersionId = 1`.
5. **Ngừng sử dụng khóa cũ:** Chỉ thu hồi các mảnh của `KEK_v1` khi không còn bản ghi nào tham chiếu tới `KekVersionId = 1` và đã xét đến nhu cầu phục hồi backup.

---

# PHẦN IV: KỊCH BẢN THỰC TẾ & NỀN TẢNG LÝ THUYẾT TOÁN HỌC

### 4.1. Bốn Kịch bản Vận hành Điển hình (End-to-End Walkthroughs)

#### Kịch bản 1: Tải lên tệp tin lần đầu (Tạo Asset & Version 1)
* **Người dùng:** `NguyenVanA` với tệp `so_do_nha_dat.pdf` ($2,450,000\text{ Bytes}$) và Passphrase `BiMat@GiaDinh#2026!`.
* **Luồng chạy:**
  1. Trình duyệt chạy Argon2id sinh `PassphraseKey` $\rightarrow$ mở bọc Mảnh 2 (`OwnerShare_v1`) $\rightarrow$ gửi qua TLS 1.3 lên Backend.
  2. Backend kiểm tra Semaphore (còn slot) $\rightarrow$ đọc vào buffer cố định $\rightarrow$ lấy Mảnh 1 (`SystemShare_v1`) từ SQL Server $\rightarrow$ nội suy Lagrange $\text{GF}(256)$ tái tạo `KEK_v1` trong RAM.
  3. Sinh ngẫu nhiên `DEK_1` (32B) và `fileNonce` (12B) $\rightarrow$ mã hóa AES-256-GCM ra `ciphertext` ($2.45\text{ MB}$) và `fileTag` (16B).
  4. Dùng `KEK_v1` bọc `DEK_1` thành gói 60 bytes nhị phân $\rightarrow$ chuyển thành chuỗi Base64 80 ký tự không có `=`.
  5. Đẩy `ciphertext` lên Cloudflare R2 tại đường dẫn: `vaults/.../versions/ver_00000001.enc`.
  6. Lưu metadata vào bảng `dbo.ContentVersions` với `Status = 'Ready'`, trỏ `Assets.CurrentVersionId = ver_00000001`.
  7. Khối `finally` lập tức gọi `ZeroMemory()` cho `dek_1`, `plaintextBuffer` và `kek_v1`.

#### Kịch bản 2: Cập nhật phiên bản mới (Version 2 độc lập)
* Người dùng cập nhật tệp thành `so_do_nha_dat_bo_sung.pdf` ($3,100,000\text{ Bytes}$).
* Hệ thống sinh `versionId = ver_00000002` mới toanh và `DEK_2` mới.
* Tệp mã hóa mới được lưu độc lập tại: `vaults/.../versions/ver_00000002.enc`.
* Tệp `ver_00000001.enc` trên R2 được **giữ nguyên vẹn 100%**. Người dùng có thể quay lại tải bản Version 1 bất kỳ lúc nào mà không bị hỏng dữ liệu hay ghi đè.

#### Kịch bản 3: Xoay Master KEK theo lô (`v1` $\rightarrow$ `v2`)
* Khi xoay KEK cho 1.000 file trong két:
  1. Bộ điều phối nạp `KEK_v1` và `KEK_v2` vào RAM.
  2. Quét từng dòng DB: Dùng `KEK_v1` mở bọc lấy lại 32 bytes DEK của file $\rightarrow$ dùng `KEK_v2` bọc lại DEK $\rightarrow$ cập nhật DB: `KekVersionId = 2`.
  3. **Tiết kiệm 100% băng thông:** Các tệp trên Cloudflare R2 **nằm nguyên vẹn, tiêu tốn 0 byte mạng**.
  4. Nếu máy chủ restart ở file 400/1000: Job dừng lại, yêu cầu Re-unlock (nạp lại cả 2 KEK) và tiếp tục xử lý nốt 600 file còn lại.

#### Kịch bản 4: Chặn đứng giả mạo dữ liệu (Tamper Detection)
* Giả sử kẻ tấn công can thiệp vào Cloudflare R2 và sửa đổi **đúng 01 bit** trong tệp `ver_00000001.enc`.
* Khi tải file: Backend phục hồi `DEK_1` và gọi `aesGcm.Decrypt(...)`.
* Bộ nhân Galois GHASH phát hiện mã xác thực 128-bit không khớp với `fileTag` ban đầu $\rightarrow$ lập tức ném ngoại lệ `CryptographicException`.
* Toàn bộ dữ liệu trong RAM bị ghi đè bằng `ZeroMemory()`, hệ thống từ chối xuất file và ghi log cảnh báo an ninh nghiêm trọng.

---

### 4.2. Cơ sở Lý thuyết Mật mã học Liên quan

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        4 TRỤ CỘT LÝ THUYẾT MẬT MÃ HỌC                                  │
├────────────────────────────┬────────────────────────────┬──────────────────────────────┤
│ 1. LÝ THUYẾT AEAD & GCM    │ 2. LÝ THUYẾT PHONG BÌ (KEK)│ 3. SHAMIR SECRET SHARING     │
│ (NIST SP 800-38D)          │ (NIST SP 800-57)           │ (Adi Shamir, 1979 - GF(256)) │
├────────────────────────────┼────────────────────────────┼──────────────────────────────┤
│ • Bảo mật + Toàn vẹn kép.  │ • Phân cấp khóa DEK / KEK. │ • Ngưỡng (k=2, n=3).         │
│ • Chống tấn công đảo bit.  │ • Xoay khóa không re-enc.  │ • Bảo mật tuyệt đối Shannon. │
│ • Nhân Galois GF(2¹²⁸).    │ • Giảm bán kính rò rỉ.     │ • Đa thức AES 0x11B.         │
├────────────────────────────┴────────────────────────────┴──────────────────────────────┤
│ 4. LÝ THUYẾT TIÊU HỦY BỘ NHỚ AN TOÀN (CWE-14 / Cryptographic Zeroization)              │
│ • Chống Dead Code Elimination • Ghi đè byte 0x00 • Loại bỏ khóa trần khỏi RAM          │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### A. Chuẩn AEAD với AES-GCM (NIST SP 800-38D)
* Kết hợp Counter mode (CTR) và hàm băm đa thức Galois Field $\text{GF}(2^{128})$ với đa thức tối giản $f(x) = x^{128} + x^7 + x^2 + x + 1$.
* Nonce bắt buộc không được lặp lại với cùng một khóa. Tag 128-bit bảo vệ tính toàn vẹn tuyệt đối (xác suất làm giả $2^{-128} \approx 2.9 \times 10^{-39}$).
* Lưu ý: GCM không tự ngăn chặn tấn công phát lại (Replay Attacks); chống phát lại do tầng ứng dụng quản lý phiên và versioning kiểm soát.

#### B. Phân cấp khóa & Mã hóa phong bì (NIST SP 800-57 Part 1 Rev. 5)
* DEK dùng một lần cho một phiên bản tệp tin (ephemeral single-use key).
* KEK chỉ bọc khóa DEK (32 bytes), không chạm vào luồng dữ liệu tệp lớn, cho phép xoay khóa siêu tốc mà không cần mã hóa lại file.

#### C. Chia sẻ bí mật Shamir trên trường Galois $\text{GF}(2^8)$
* Mô hình ngưỡng $k = 2, n = 3$. Đa thức bậc 1: $P(x) = S + a_1 \cdot x$, trong đó $P(0) = S$ là Master KEK.
* Công thức nội suy Lagrange:
  $$S = P(0) = y_1 \cdot \frac{0 - x_2}{x_1 - x_2} + y_2 \cdot \frac{0 - x_1}{x_2 - x_1}$$
* Tính toán trên trường hữu hạn $\text{GF}(2^8)$ với đa thức tối giản chuẩn AES:
  $$p(x) = x^8 + x^4 + x^3 + x + 1 \quad (\text{Mã hex: } \mathbf{0x11B})$$
* **Bảo mật tuyệt đối của Shannon (Perfect Secrecy):** Đứng trước duy nhất 1 Mảnh, xác suất của mọi giá trị khóa $S'$ là đồng đều $1/256$ (0-bit thông tin rò rỉ).

#### D. Tiêu hủy bộ nhớ an toàn (CWE-14)
* Hàm `CryptographicOperations.ZeroMemory()` của .NET ghi đè toàn bộ các phần tử buffer bằng giá trị `0x00`, ngăn chặn trình biên dịch JIT tối ưu hóa loại bỏ thao tác ghi đè (Dead Code Elimination).
