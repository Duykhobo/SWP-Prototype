# HƯỚNG DẪN TÍCH HỢP & PHÁT TRIỂN DÀNH CHO BACKEND (BE INTEGRATION GUIDE)

## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO TÀI SẢN SỐ

### Phiên bản: Chuẩn Hóa Theo SRS v3.11.0 (26/09/2026) — Nền Tảng C# ASP.NET Core 10 (.NET 10 LTS) / EF Core 10 / SQL Server 2022

---

## 1. TỔNG QUAN KIẾN TRÚC & NGUYÊN TẮC BACKEND BẮT BUỘC

Toàn bộ dịch vụ Backend được xây dựng trên nền tảng **ASP.NET Core 10 Web API (.NET 10 LTS)** theo mô hình **Clean Architecture**:

```
LegacyVault.Backend/
├── src/
│   ├── LegacyVault.Domain/         # Entities (25 bảng), Enums, Value Objects, Domain Exceptions, Domain Events
│   ├── LegacyVault.Application/    # DTOs, CQRS (MediatR), Services, Validators (FluentValidation), Mappers
│   ├── LegacyVault.Infrastructure/ # EF Core 10 DbContext, SQL Server 2022, Cloudflare R2 / S3, Cryptography (AES-GCM), SePay Client, MailKit
│   └── LegacyVault.WebApi/         # Controllers, Middlewares, Filters, Background Workers (DmsWorker), Program.cs
└── tests/
    ├── LegacyVault.UnitTests/      # xUnit, Moq, FluentAssertions
    └── LegacyVault.IntegrationTests/# WebApplicationFactory, Respawn, Testcontainers SQL Server
```

### 1.1. Nguyên Tắc An Toàn Dữ Liệu & Mã Hóa Envelope (`SEC-01` $\rightarrow$ `SEC-09`)

1. **Mã hóa có kiểm soát phía máy chủ (Server-Side Envelope Encryption):**
   - File nhị phân được upload qua `multipart/form-data` lên Backend API.
   - Backend sinh khóa ngẫu nhiên đối xứng 256-bit (`DataEncryptionKey` - DEK) độc lập cho từng tệp/phiên bản.
   - Mã hóa tệp theo thuật toán **AES-256-GCM** (xác thực tính toàn vẹn ciphertext + tag xác thực 128-bit).
   - Tải tệp bản mã (ciphertext) lên Cloudflare R2 / S3.
   - Khóa DEK được bọc bằng Key Encryption Key (KEK / Master Key cấu hình trong Azure Key Vault hoặc Environment an toàn) sinh ra `WrappedDataKey`.
   - Bảng `ContentVersions` lưu trữ: `CiphertextUrl`, `ChecksumSha256`, `SizeBytes`, `MimeType`, `WrappedDataKey`.
   - **Tuyệt đối không lưu plaintext preview hoặc khóa DEK giải mã trong CSDL**.
2. **Luồng tải tệp tin an toàn (`DEL-02`):**
   - Người nhận bấm tải tệp: Request gửi về `GET /api/v1/handover-vaults/{id}/assets/{assetId}/download`.
   - Backend thẩm định quyền tức thì (Zero-Trust Authorization), lấy ciphertext từ R2, giải bọc DEK bằng KEK, giải mã AES-256-GCM trong bộ nhớ RAM và stream trực tiếp qua TLS 1.3 về trình duyệt client.
   - **Tải tệp hoàn toàn miễn phí, không tiêu tốn quota kho cá nhân**.
3. **Cấm ghi Log dữ liệu nhạy cảm (Serilog Sanitation):**
   - Tuyệt đối không log body request chứa khóa dữ liệu, mã OTP, token liên kết, CCCD thô hoặc tệp tin.

### 1.2. Chuẩn Hóa Cấu Hình Web API (`Program.cs`)

```csharp
// 1. JSON Serialization: Bắt buộc camelCase đồng bộ với Frontend React
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// 2. CORS cho Frontend React Vite
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClientApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://app.legacyvault.vn")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Bắt buộc cho HttpOnly Cookie
    });
});

// 3. OpenAPI Documentation (Scalar / Swagger) - Chỉ bật trong môi trường Development
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Giữ một UI duy nhất (Scalar hoặc Swagger UI) phục vụ đối soát API trong môi trường phát triển
    // Lưu ý: ASP.NET Core sinh OpenAPI từ code metadata; cần đối chiếu OpenAPI sinh ra với FRONTEND_BACKEND_API_CONTRACT.md
    app.MapOpenApi();
    // app.MapScalarApiReference(); // Hoặc app.UseSwaggerUI()
}
```

---

## 2. QUẢN LÝ ĐỊNH DANH, PHÂN QUYỀN & XUNG ĐỘT VAI TRÒ

### 2.1. Cấu Trúc Người Dùng (`Persons` vs `Users`)

- **`Persons` (`ID-01`, `ID-02`):** Đại diện cho một con người thực tế, chứa họ tên, số định danh (`IdentityCard`), số điện thoại, ngày sinh. Người nhận (`Beneficiary`) ban đầu có thể chỉ tồn tại dưới dạng bản ghi `Persons` (chưa có tài khoản `Users`).
- **`Users`:** Tài khoản đăng nhập hệ thống, liên kết 1:1 với `Persons` qua `PersonId`. Chứa `Email`, `PasswordHash`, `Status` (`ACTIVE`, `SUSPENDED`).
- **Quy tắc kiểm tra xung đột vai trò nghiêm ngặt (SRS 3.11.0):**
  1. Trong cùng một hồ sơ (`Cases`), **Owner, Executor và Verifier bắt buộc phải là 3 `PersonId` hoàn toàn khác nhau**.
  2. **Cấm Executor hoặc Verifier đồng thời là Beneficiary (Người nhận) trong cùng hồ sơ di sản đó**.
  3. Mọi kiểm tra xung đột phải query theo `PersonId` trong CSDL, không được dựa trên chuỗi email hay `UserId`.

### 2.2. JWT Token & Zero-Trust Headers

1. **Access Token (15 phút, RAM-Only):** Ký bằng `HMAC-SHA256`. Claims gồm:
   - `sub`: User ID (GUID).
   - `person_id`: Person ID (GUID).
   - `email`: Email người dùng.
   - `roles`: Mảng các vai trò được phân định (`OWNER`, `EXECUTOR`, `VERIFIER`, `BENEFICIARY`, `ADMIN`).
2. **Refresh Token (7 ngày):** Lưu mã băm SHA-256 trong bảng `UserRefreshTokens`. Cấp qua **HttpOnly Cookie** (`SameSite=Strict`, `Secure=true`) tại route `/api/v1/auth/refresh`.
3. **Quy tắc xử lý Headers:**
   - `X-Correlation-ID`: Bắt buộc ghi nhận cho mọi log nghiệp vụ và RFC 7807 response.
   - `X-Active-Role`: **Chỉ là UI Context**, Backend **tuyệt đối không dùng header này để phân quyền**. Mọi quyền hạn phải được kiểm tra qua DB Context và JWT claims.

---

## 3. THIẾT KẾ CƠ SỞ DỮ LIỆU EF CORE 10 (26 THỰC THỂ CORE & BẢNG LIÊN KẾT)

Mô hình dữ liệu chi tiết xem tại [Lược đồ CSDL ERD](../02_architecture/DATABASE_SCHEMA_ERD.md). Dưới đây là các cấu hình Fluent API trọng yếu:

### 3.1. Gom Nhóm Kho Bàn Giao Bất Biến (`HandoverVaults`)

Kho bàn giao được tự động gom nhóm (`PRE_BUNDLED`) theo phiên bản kế hoạch di sản:

```csharp
modelBuilder.Entity<HandoverVault>(entity =>
{
    entity.ToTable("HandoverVaults");
    entity.HasKey(e => e.Id);
  
    // Ràng buộc duy nhất: Một phiên bản kế hoạch chỉ có 1 kho cho 1 tập người nhận chuẩn hóa
    entity.HasIndex(e => new { e.EstatePlanVersionId, e.NormalizedRecipientSet })
          .IsUnique()
          .HasDatabaseName("UQ_HandoverVaults_Version_Recipients");
        
    entity.Property(e => e.NormalizedRecipientSet).HasMaxLength(450).IsRequired();
    entity.Property(e => e.RecipientMode).HasConversion<string>().HasMaxLength(30).IsRequired();
    entity.Property(e => e.Status).HasConversion<string>().HasMaxLength(30).IsRequired();
});

// Lịch bàn giao chung gắn trực tiếp theo CaseId
modelBuilder.Entity<HandoverSchedule>(entity =>
{
    entity.ToTable("HandoverSchedules");
    entity.HasKey(e => e.Id);
    entity.HasIndex(e => new { e.CaseId, e.ScheduleVersion }).IsUnique();
});
```

### 3.2. Khóa Snapshot Khi Nộp Hồ Sơ (`CaseAssetSnapshots`)

Khóa trạng thái bất biến bộ bốn: `AssetId`, `ContentVersionId`, `AssetDesignationVersionId`, `EstatePlanVersionId`:

```csharp
modelBuilder.Entity<CaseAssetSnapshot>(entity =>
{
    entity.ToTable("CaseAssetSnapshots");
    entity.HasKey(e => e.Id);

    entity.HasIndex(e => new { e.CaseId, e.AssetId }).IsUnique();

    entity.HasOne(e => e.Asset)
          .WithMany()
          .HasForeignKey(e => e.AssetId)
          .OnDelete(DeleteBehavior.Restrict);

    entity.HasOne(e => e.ContentVersion)
          .WithMany()
          .HasForeignKey(e => e.ContentVersionId)
          .OnDelete(DeleteBehavior.Restrict);

    entity.HasOne(e => e.AssetDesignationVersion)
          .WithMany()
          .HasForeignKey(e => e.AssetDesignationVersionId)
          .OnDelete(DeleteBehavior.Restrict);

    entity.HasOne(e => e.EstatePlanVersion)
          .WithMany()
          .HasForeignKey(e => e.EstatePlanVersionId)
          .OnDelete(DeleteBehavior.Restrict);
});
```

### 3.3. Hai Bản Ghi Cam Kết Pháp Lý Độc Lập (`CaseLegalAttestations`)

Bắt buộc gắn đúng `DeathCertificateVersionId`:

```csharp
modelBuilder.Entity<CaseLegalAttestation>(entity =>
{
    entity.ToTable("CaseLegalAttestations");
    entity.HasKey(e => e.Id);

    // Một hồ sơ chỉ có tối đa 1 cam kết cho Executor và 1 cam kết cho Verifier
    entity.HasIndex(e => new { e.CaseId, e.AttestationRole }).IsUnique();

    entity.Property(e => e.AttestationRole).HasConversion<string>().HasMaxLength(30).IsRequired();
    entity.Property(e => e.SignerFullName).HasMaxLength(200).IsRequired();
    entity.Property(e => e.SignerIdentityCard).HasMaxLength(50).IsRequired();
    entity.Property(e => e.CommitmentStatement).IsRequired();
    entity.Property(e => e.IpAddress).HasMaxLength(50).IsRequired();
});
```

---

## 4. CÁC LUỒNG NGHIỆP VỤ BACKEND TRỌNG TÂM

### 4.1. Luồng 1: Upload File & Mã Hóa Envelope (`SEC-01` $\rightarrow$ `SEC-04`)

```csharp
public async Task<AssetUploadResultDto> UploadAssetAsync(Guid vaultId, IFormFile file, CancellationToken ct)
{
    // 1. Kiểm tra kích thước (Max 20MB theo MVP)
    if (file.Length > 20 * 1024 * 1024)
        throw new BusinessRuleException(ErrorCodes.FILE_SIZE_EXCEEDS_LIMIT, "File size exceeds 20MB limit.");

    // 2. Đọc Stream, kiểm tra magic bytes MIME thực tế
    using var stream = file.OpenReadStream();
    var mimeType = MimeInspector.DetectMimeType(stream, file.FileName);

    // 3. Tính Checksum SHA-256
    stream.Position = 0;
    var checksum = await HashUtility.ComputeSha256Async(stream, ct);

    // 4. Sinh khóa DEK đối xứng 256-bit ngẫu nhiên
    byte[] dek = RandomNumberGenerator.GetBytes(32);

    // 5. Mã hóa AES-256-GCM
    stream.Position = 0;
    var (ciphertextStream, nonce, tag) = await AesGcmService.EncryptStreamAsync(stream, dek, ct);

    // 6. Tải ciphertext lên Cloudflare R2 / S3
    string storagePath = $"vaults/{vaultId}/assets/{Guid.NewGuid()}.enc";
    await _storageService.UploadAsync(storagePath, ciphertextStream, "application/octet-stream", ct);

    // 7. Bọc DEK bằng KEK hệ thống
    string wrappedKey = _keyManagementService.WrapKey(dek, nonce, tag);

    // 8. Lưu ContentVersions vào DB (EF Core)
    // ...
}
```

### 4.2. Luồng 2: Dead Man's Switch (DMS) Background Worker & Quy Tắc Xóa (`OPLAN-05`, `OPLAN-06`)

Worker chạy nền chu kỳ (ví dụ mỗi giờ 1 lần) để quét các kho sắp hết hạn hoặc chuyển trạng thái:

- **`WARNING_PENDING`:** Gửi thông báo nhắc nhở điểm danh khi chạm mốc cảnh báo.
- **`GRACE_PERIOD`:** Quá hạn mà chưa điểm danh, bắt đầu thời gian gia hạn.
- **`CHECKIN_SUSPENDED`:** Tạm treo điểm danh trong 90 ngày (áp dụng cho mọi hạng kho).
- **`FROZEN_INACTIVITY`:** Đóng băng kho do mất liên lạc sau 90 ngày tạm treo.
- **Quy tắc xóa dữ liệu nghiêm ngặt (`OPLAN-05`, `OPLAN-06`):**
  - **Kho Gói Free (`OWNER_FREE`):** Không có ngày hết hạn gói. Kho bị đóng băng nhưng **tuyệt đối không tự động xóa** theo quy tắc này (`OPLAN-05`).
  - **Kho Gói Trả Phí (`LEGACY_XS`, `LEGACY_XS_MAX`):**
    - Mốc thời gian đủ điều kiện xóa tính theo công thức:
      $$
      \mathbf{deletion\_eligible\_at = \max(freeze\_at + 30\text{ ngày}, paid\_plan\_expires\_at + 30\text{ ngày})}
      $$
    - **Kiểm tra 8 điều kiện chặn trước khi xóa (`OPLAN-06`):**
      1. Kho vẫn đang đóng băng (`FROZEN_INACTIVITY`).
      2. Gói cước đã hết hạn (`now >= paid_plan_expires_at`).
      3. Owner chưa điểm danh hợp lệ.
      4. Đã gửi đủ 3 lần cảnh báo (lúc bắt đầu đóng băng, còn 7 ngày, còn 24 giờ).
      5. **KHÔNG CÓ** hồ sơ chứng tử `Cases` đang xử lý hoặc bổ sung.
      6. **KHÔNG CÓ** quy trình bàn giao đang chạy.
      7. **KHÔNG CÓ** quyền Beneficiary hoặc bản bàn giao còn hạn truy cập.
      8. **KHÔNG CÓ** khiếu nại, sự cố kỹ thuật hoặc tham chiếu lưu giữ cần bảo vệ.

```csharp
public class DmsCheckInWorker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DmsCheckInWorker> _logger;

    public DmsCheckInWorker(IServiceProvider serviceProvider, ILogger<DmsCheckInWorker> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<LegacyVaultDbContext>();
            var cleanupService = scope.ServiceProvider.GetRequiredService<IVaultCleanupService>();
            var now = scope.ServiceProvider.GetRequiredService<IDateTimeProvider>().UtcNow;

            // 1. Quét kho trả phí đủ điều kiện xóa (OPLAN-05, OPLAN-06)
            // Gói OWNER_FREE tuyệt đối không tự động xóa (OPLAN-05)
            var eligibleVaults = await db.OwnerVaultConfigs
                .Where(v => v.Tier != SubscriptionTier.OWNER_FREE &&
                            v.Status == VaultStatus.FROZEN_INACTIVITY &&
                            now >= v.DeletionEligibleAt &&
                            now >= v.PlanExpiresAt)
                .ToListAsync(stoppingToken);

            foreach (var vault in eligibleVaults)
            {
                // Mở Transaction mức Serializable bảo đảm an toàn dữ liệu tuyệt đối trước khi xóa
                using var tx = await db.Database.BeginTransactionAsync(IsolationLevel.Serializable, stoppingToken);

                // Kiểm tra toàn diện 8 điều kiện chặn xóa theo OPLAN-06
                var safetyResult = await EvaluatePurgeSafetyAsync(db, vault, now, stoppingToken);

                if (safetyResult.IsSafe)
                {
                    // Thực hiện cleanup vật lý ciphertext trên Cloudflare R2 / S3 và xóa DB
                    await cleanupService.PurgeVaultDataAsync(vault.Id, stoppingToken);
                    vault.Status = VaultStatus.PURGED;
                    vault.PurgedAt = now;

                    _logger.LogInformation("Vault {VaultId} successfully purged after passing all 8 safety conditions.", vault.Id);
                }
                else
                {
                    // Lưu lý do hoãn xóa vào DB và ghi nhật ký kiểm toán
                    vault.PurgeDeferredReason = safetyResult.BlockReason;
                    vault.PurgeDeferredAt = now;

                    _logger.LogWarning("Purge deferred for Vault {VaultId}: {Reason}", vault.Id, safetyResult.BlockReason);
                }

                await db.SaveChangesAsync(stoppingToken);
                await tx.CommitAsync(stoppingToken);
            }

            await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
        }
    }

    /// <summary>
    /// Kiểm tra toàn diện 8 điều kiện bảo vệ trước khi xóa kho nguồn theo chuẩn OPLAN-06
    /// </summary>
    public static async Task<PurgeSafetyEvaluationResult> EvaluatePurgeSafetyAsync(
        LegacyVaultDbContext db,
        OwnerVaultConfig vault,
        DateTime now,
        CancellationToken ct)
    {
        // 1. Kho vẫn ở trạng thái đóng băng do bất hoạt
        if (vault.Status != VaultStatus.FROZEN_INACTIVITY)
            return PurgeSafetyEvaluationResult.Blocked("Vault is not in FROZEN_INACTIVITY status.");

        // 2. Gói cước trả phí đã hết hạn
        if (now < vault.PlanExpiresAt)
            return PurgeSafetyEvaluationResult.Blocked("Paid subscription plan has not yet expired.");

        // 3. Chủ sở hữu chưa điểm danh hợp lệ
        if (vault.LastCheckInAt.HasValue && vault.LastCheckInAt.Value > vault.FreezeDeadline)
            return PurgeSafetyEvaluationResult.Blocked("Owner checked in after freeze deadline.");

        // 4. Đã gửi đủ 3 lần cảnh báo (lúc bắt đầu đóng băng, còn 7 ngày, còn 24 giờ)
        int warningCount = await db.AuditEvents.CountAsync(a =>
            a.ActorPersonId == vault.OwnerPersonId &&
            a.Action == "PURGE_WARNING_DISPATCHED", ct);
        if (warningCount < 3)
            return PurgeSafetyEvaluationResult.Blocked($"Insufficient pre-purge warnings dispatched (sent {warningCount}/3).");

        // 5. KHÔNG CÓ hồ sơ chứng tử đang xử lý hoặc bổ sung tài liệu
        bool hasActiveCases = await db.Cases.AnyAsync(c =>
            c.VaultId == vault.Id &&
            c.Status != CaseStatus.REJECTED &&
            c.Status != CaseStatus.CANCELLED, ct);
        if (hasActiveCases)
            return PurgeSafetyEvaluationResult.Blocked("Active or pending death claim cases exist for this vault.");

        // 6. KHÔNG CÓ quy trình bàn giao đang chạy
        bool hasActiveHandover = await db.HandoverVaults.AnyAsync(h =>
            h.EstatePlanVersion.EstatePlan.VaultId == vault.Id &&
            (h.Status == HandoverStatus.SCHEDULED ||
             h.Status == HandoverStatus.HANDOVER_STARTED ||
             h.Status == HandoverStatus.PENDING_RESPONSE ||
             h.Status == HandoverStatus.FROZEN_RECONSIDERATION), ct);
        if (hasActiveHandover)
            return PurgeSafetyEvaluationResult.Blocked("Handover process is currently scheduled, active, or in reconsideration freeze.");

        // 7. KHÔNG CÓ quyền Beneficiary hoặc bản bàn giao còn hạn truy cập
        bool hasActiveGrants = await db.AccessGrants.AnyAsync(g =>
            g.HandoverVault.EstatePlanVersion.EstatePlan.VaultId == vault.Id &&
            g.Status == GrantStatus.ACTIVE &&
            g.ExpiresAt > now, ct);
        if (hasActiveGrants)
            return PurgeSafetyEvaluationResult.Blocked("Active Beneficiary access grants still exist with unexpired download windows.");

        // 8. KHÔNG CÓ khiếu nại, sự cố kỹ thuật hoặc tham chiếu lưu giữ pháp lý cần bảo vệ
        if (vault.HasActiveDispute || vault.HasLegalHoldFlag)
            return PurgeSafetyEvaluationResult.Blocked("Vault has active dispute, open support ticket, or legal preservation hold.");

        return PurgeSafetyEvaluationResult.SafeToPurge();
    }
}

public class PurgeSafetyEvaluationResult
{
    public bool IsSafe { get; private set; }
    public string? BlockReason { get; private set; }

    public static PurgeSafetyEvaluationResult SafeToPurge() => new() { IsSafe = true };
    public static PurgeSafetyEvaluationResult Blocked(string reason) => new() { IsSafe = false, BlockReason = reason };
}
```

### 4.3. Luồng 3: Quyết Định Bàn Giao & Cửa Sổ 2 Năm Đóng Băng (`DEL-04`, `DEL-05`, `TIME-01`)

- **Cửa sổ phản hồi 7 ngày ban đầu:**
  - Kể từ `handover_started_at`, người nhận có 168 giờ để bấm **Chấp nhận (`ACCEPTED`)** hoặc **Từ chối (`REJECTED`)**.
- **Kích hoạt đóng băng 2 năm (`FreezeStartedAt`):**
  - Nếu có người bấm `REJECTED` đầu tiên HOẶC hết 7 ngày mà còn người chưa trả lời (`EXPIRED`):
    - `HandoverVaults.Status = FROZEN_RECONSIDERATION`.
    - `FreezeStartedAt = now`.
    - `FreezeExpiresAt = now + 2` năm lịch.
- **Quyền ký Nhận trong 2 năm đóng băng:**
  - Áp dụng bình đẳng cho cả người **đã từ chối** LẪN người **chưa phản hồi**:
  - Gọi endpoint `POST /api/v1/handover-vaults/{vaultId}/accept-during-freeze`.
  - Với kho `CO_OWNED`: Đợi đủ 100% người đồng thuận mới cấp `AccessGrant` đồng thời cho cả nhóm.

### 4.4. Luồng 4: Tích Hợp Cổng Thanh Toán SePay VietQR (5 Gói SRS v3.11.0)

1. **Khởi tạo đơn hàng thanh toán:**
   - Bảng giá chuẩn SRS 3.11.0:
     - `OWNER_FREE`: 0 đ / Vĩnh viễn (3 tài sản / 20 MiB - Không lập di sản).
     - `LEGACY_XS`: 199.000 đ / 365 ngày (20 tài sản / 200 MiB - Lập di sản, bàn giao).
     - `LEGACY_XS_MAX`: 399.000 đ / 365 ngày (50 tài sản / 500 MiB - Xuất PDF kế hoạch an toàn).
     - `RECIPIENT_FREE`: 0 đ / Vĩnh viễn (2 tài sản / 20 MiB - Lưu tài sản đã nhận).
     - `RECIPIENT_PLUS`: 49.000 đ / 30 ngày (10 tài sản / 200 MiB - Lưu tài sản đã nhận).
   - Sinh `PaymentOrders` với `OrderCode = "LV" + RandomDigits(6)`.
   - Trả về mã QR thanh toán VietQR: `https://qr.sepay.vn/img?acc={BANK_ACC}&bank={BANK_CODE}&amount={AMOUNT}&des={ORDER_CODE}`.
2. **Webhook Giao Dịch ACID Serializable từ SePay (`POST /api/v1/payment/webhook`):**
   ```csharp
   [HttpPost("webhook")]
   [AllowAnonymous]
   public async Task<IActionResult> ProcessSePayWebhook(
       [FromBody] SePayWebhookDto payload, 
       [FromHeader(Name = "Authorization")] string? authHeader,
       [FromHeader(Name = "X-Signature")] string? signature)
   {
       // 1. Xác thực bảo mật: Hỗ trợ Header Authorization: Apikey HOẶC X-Signature HMAC-SHA256
       bool isAuthorized = ValidateWebhookSignature(payload, authHeader, signature);
       if (!isAuthorized) return Unauthorized();

       // 2. Mở Transaction mức Serializable bảo đảm ACID tuyệt đối
       using var tx = await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable);

       // 3. Chống lặp (Idempotency) dựa trên provider_event_id
       var existingRecord = await _db.IdempotencyRecords
           .FirstOrDefaultAsync(r => r.ProviderEventId == payload.Id.ToString());
       if (existingRecord != null)
       {
           await tx.RollbackAsync();
           return Ok(new { success = true, message = "Already processed" });
       }

       // 4. Tìm PaymentOrder theo mã đơn hàng
       var order = await _db.PaymentOrders
           .FirstOrDefaultAsync(o => o.OrderCode == payload.Code);

       if (order == null)
       {
           await tx.RollbackAsync();
           return NotFound(new { message = "Order not found" });
       }

       // Nếu đơn đã ở trạng thái khác PENDING
       if (order.Status != PaymentStatus.PENDING)
       {
           await tx.RollbackAsync();
           return Ok(new { success = true, message = $"Order already in status {order.Status}" });
       }

       var now = DateTime.UtcNow;

       // 5. Kiểm tra thời hạn hiệu lực của đơn hàng (SRS PAY-02, PAY-03):
       // Đơn hàng thanh toán chỉ có hiệu lực 15 phút. Nếu callback đến sau ExpiresAt (now >= order.ExpiresAt)
       // -> Bắt buộc hủy đơn, ghi nhận EXPIRED và TUYỆT ĐỐI KHÔNG CẤP QUYỀN / ENTITLEMENT!
       if (now >= order.ExpiresAt)
       {
           order.Status = PaymentStatus.EXPIRED;
           _db.IdempotencyRecords.Add(new IdempotencyRecord
           {
               ProviderEventId = payload.Id.ToString(),
               OrderId = order.Id.ToString(),
               ProcessedAt = now,
               ResponsePayloadJson = "{\"status\":\"EXPIRED\",\"reason\":\"Callback received after deadline\"}"
           });
           await _db.SaveChangesAsync();
           await tx.CommitAsync();
           return BadRequest(new { message = "Order has expired. Entitlement not granted." });
       }

       // 6. Đối soát số tiền chuyển khoản với Snapshot giá gói tại thời điểm tạo đơn
       if (payload.TransferAmount < order.SnapshotAmount)
       {
           order.Status = PaymentStatus.FAILED;
           _db.IdempotencyRecords.Add(new IdempotencyRecord
           {
               ProviderEventId = payload.Id.ToString(),
               OrderId = order.Id.ToString(),
               ProcessedAt = now,
               ResponsePayloadJson = "{\"status\":\"FAILED\",\"reason\":\"Insufficient transfer amount\"}"
           });
           await _db.SaveChangesAsync();
           await tx.CommitAsync();
           return BadRequest(new { message = "Insufficient transfer amount." });
       }

       // 7. Cấp gói cước và hoàn tất đơn hàng trong CÙNG TRANSACTION
       order.Status = PaymentStatus.SUCCESS;
       order.PaidAt = now;
       order.SepayTransactionId = payload.Id.ToString();

       _db.IdempotencyRecords.Add(new IdempotencyRecord
       {
           ProviderEventId = payload.Id.ToString(),
           OrderId = order.Id.ToString(),
           ProcessedAt = now,
           ResponsePayloadJson = "{\"status\":\"SUCCESS\"}"
       });

       // Kích hoạt hạn ngạch dựa trên Snapshot gói cước được lưu trong đơn hàng
       await _subscriptionService.UpgradePlanWithSnapshotAsync(
           order.PersonId, 
           order.SnapshotPlanTier, 
           order.SnapshotBillingCycleDays, 
           order.SnapshotStorageQuotaMb, 
           order.SnapshotAssetLimit);

       await _db.SaveChangesAsync();
       await tx.CommitAsync();

       return Ok(new { success = true });
   }
   ```
3. **Endpoint Demo Mô Phỏng Thanh Toán (`POST /api/v1/demo/payment-orders/{orderId}/simulate-success`):**
   - **Ràng buộc Môi trường:** Chỉ hoạt động khi cờ cấu hình server `EnablePaymentSimulation == true` trong môi trường `Development` hoặc `Demo`. Vô hiệu hóa hoàn toàn trên Production.
   - **Ràng buộc Phân quyền (Authorization Guardrails):**
     - Yêu cầu xác thực JWT Token hợp lệ.
     - **Chính sách sở hữu nghiêm ngặt:** Chỉ chủ sở hữu đơn hàng (`currentPersonId == order.PersonId`) mới được bấm mô phỏng đơn của mình, hoặc tài khoản có vai trò `ADMIN`. Cấm người dùng khác mô phỏng thanh toán chéo.
   - **Xử lý:** Kích hoạt cùng luồng giao dịch kiểm tra và cấp quyền như webhook thực tế, ghi Audit Log với `IsSimulated = true`.

---

## 5. CHUẨN HÓA MÃ LỖI & PHẢN HỒI LỖI (RFC 7807)

Mọi phản hồi lỗi từ API bắt buộc tuân theo chuẩn RFC 7807 `ProblemDetails`:

```json
{
  "type": "https://errors.legacyvault.vn/EX-CONF-01",
  "title": "Conflict Role Restriction",
  "status": 409,
  "detail": "Executor cannot be designated as a Beneficiary in the same estate case.",
  "instance": "/api/v1/cases/submit",
  "code": "EX_CONF_01",
  "correlationId": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

Danh mục mã lỗi chính thức được định nghĩa tại [Danh mục mã lỗi hệ thống](ERROR_CODES.md).

---

## 6. KIỂM THỬ VÀ BẢO ĐẢM CHẤT LƯỢNG (QA & TEST AUTOMATION)

- **Unit Testing (xUnit + Moq + FluentAssertions):** Đạt tối thiểu 80% coverage cho `LegacyVault.Domain` và `LegacyVault.Application`.
  - Kiểm tra toàn bộ logic chuyển trạng thái State Machine.
  - Kiểm tra logic bọc/mở khóa AES-256-GCM và hash SHA-256.
- **Integration Testing (Testcontainers + SQL Server 2022):**
  - Chạy `Testcontainers` trên SQL Server 2022 thật để kiểm tra Transaction Rollback khi nộp hồ sơ, ràng buộc `UNIQUE(PersonalVaultId, AssetId)` và `UNIQUE(EstatePlanId, NormalizedRecipientSet)`.
  - Kiểm thử mô phỏng thời gian bằng `ISimulatedClockService` thay vì `DateTime.UtcNow` trực tiếp để test luồng DMS và 7 ngày bàn giao / 2 năm đóng băng.
  - Kiểm thử kịch bản White-Box: Tranh chấp giao dịch đồng thời (concurrency), bảo vệ snapshot khóa bộ ba, và Webhook SePay trùng lặp (`IdempotencyRecords`).
- **Bộ ca thử bảo mật (Dựa trên OWASP Cheat Sheet & PayloadsAllTheThings):**
  - Kiểm thử IDOR khi tráo đổi `vaultId`/`assetId` trong URL request.
  - Kiểm thử cố tình truy cập khi `PersonId` không thuộc `DesignationVersionRecipients`.
  - Kiểm thử grant hết hạn và tải chunk khi chưa hoàn tất cam kết pháp lý.
