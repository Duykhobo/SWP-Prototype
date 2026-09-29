# THƯ VIỆN TÀI LIỆU DỰ ÁN LEGACYVAULT (SWP391 - SRS v3.11.0)

Tài liệu này là mục lục chính thức điều hướng toàn bộ hồ sơ kỹ thuật, kiến trúc, cơ sở dữ liệu và quy chuẩn tích hợp cho hệ thống **LegacyVault**. Toàn bộ tài liệu kỹ thuật đã được chuẩn hóa và đồng bộ 100% theo **SRS v3.11.0**.

---

## 1. HỒ SƠ NGHIỆP VỤ & KIẾN TRÚC HỆ THỐNG CỐT LÕI

* **[LegacyVault-SRS-v3.11.0.md](LegacyVault-SRS-v3.11.0.md)**: Bản đặc tả yêu cầu phần mềm chính thức (SRS v3.11.0 - 26/09/2026).
  * 5 Luồng nghiệp vụ cốt lõi: 1A-1B (Két số & Thiết lập di sản), 2A-2B (Điểm danh sinh tồn DMS), 3A-3B (Thẩm định chứng tử pháp lý), 4A-4H (Bàn giao di sản tự gom & Chuyển quyền 1:1), 5A-5B (Quản trị & Giám sát).
* **[SYSTEM_ARCHITECTURE_DOCUMENT.md](SYSTEM_ARCHITECTURE_DOCUMENT.md)**: Tài liệu Kiến trúc Hệ thống chuẩn hóa theo phương pháp luận *System Design Primer*.
  * Đánh giá CAP Theorem (CP System), Phân tầng C4 Container (.NET 10 LTS + React 19), Mã hóa Envelope AES-256-GCM qua Backend API, Stream giải mã TLS 1.3 trực tiếp (`DEL-02`), Chiến lược giao dịch ACID CSDL, Ma trận 8 ca kiểm thử bảo mật, Pipeline CI/CD tự động.
* **[LegacyVault-5-Luong-SRS-3.11.0-Tieng-Viet-A4.drawio](LegacyVault-5-Luong-SRS-3.11.0-Tieng-Viet-A4.drawio)**: Sơ đồ thiết kế đồ họa chi tiết 17 trang A4 chuẩn SRS 3.11.0.
* **[LegacyVault-Context-EN.drawio](LegacyVault-Context-EN.drawio)**: Sơ đồ ngữ cảnh hệ thống C4 System Context bằng tiếng Anh.

---

## 2. HỒ SƠ DỮ LIỆU & QUY CHUẨN KỸ THUẬT

* **[DATABASE_SCHEMA_ERD.md](DATABASE_SCHEMA_ERD.md)**: Thiết kế đầy đủ 25 thực thể cơ sở dữ liệu trên SQL Server 2022 + EF Core 10 (.NET 10 LTS).
  * Phân biệt rõ `Persons` và `Users`, gom kho `HandoverVaults` với `UNIQUE(EstatePlanVersionId, NormalizedRecipientSet)`, thực thể phiên bản chỉ định phân cấp `EstatePlanVersions` $\rightarrow$ `AssetDesignationVersions` $\rightarrow$ `DesignationVersionRecipients`, snapshot khóa bộ bốn `CaseAssetSnapshots`, 2 bản ghi cam kết pháp lý `CaseLegalAttestations` (gắn `DeathCertificateVersionId`), lịch bàn giao chung toàn hồ sơ `HandoverSchedules` (gắn `CaseId`), bảng quyết định từng người `BeneficiaryHandoverDecisions` (7 ngày phản hồi & 2 năm đóng băng tính từ `FreezeStartedAt` với ranh giới `now < FreezeExpiresAt`), danh mục 5 gói cước chuẩn SRS (`OWNER_FREE`, `LEGACY_XS`: 199k, `LEGACY_XS_MAX`: 399k, `RECIPIENT_FREE`, `RECIPIENT_PLUS`: 49k), ràng buộc chống nhập lặp `UNIQUE(PersonalVaultId, AssetId)`.
* **[STATE_MACHINES.md](STATE_MACHINES.md)**: Quy chuẩn chuyển trạng thái (State Transitions) của 5 máy trạng thái cốt lõi:
  * Điểm danh DMS (Gói Free không tự xóa `OPLAN-05`, gói trả phí tuân thủ `OPLAN-06` với công thức `deletion_eligible_at = max(freeze_at + 30d, paid_plan_expires_at + 30d)` và 8 điều kiện chặn), Hồ sơ chứng tử Case, Kho bàn giao tự gom `HandoverVaults` (tạo từ Bước 2 trước snapshot; mở ký nhận 2 năm cho cả người từ chối lẫn người chưa phản hồi), Lựa chọn chuyển quyền 1:1, Đơn hàng SePay VietQR.
* **[PERMISSION_MATRIX.md](PERMISSION_MATRIX.md)**: Ma trận phân quyền Zero-Trust cho 5 vai trò.
  * Kiểm tra xung đột theo `person_id`: Tam quyền phân lập $Owner \ne Executor \ne Verifier$; Executor và Verifier cấm là Beneficiary trong cùng hồ sơ; Ký nhận trong 2 năm đóng băng cho người từ chối và chưa phản hồi; Tách hoàn toàn quyền tải file stream miễn phí khỏi quota kho cá nhân.
* **[ERROR_CODES.md](ERROR_CODES.md)**: Danh mục mã lỗi chuẩn RFC 7807 ProblemDetails phục vụ xử lý UI thân thiện và truy vết `correlationId`.

---

## 3. HƯỚNG DẪN TÍCH HỢP & GIAO DIỆN

* **[FRONTEND_BACKEND_API_CONTRACT.md](FRONTEND_BACKEND_API_CONTRACT.md)**: Hợp đồng giao tiếp API giữa Client SPA và Backend ASP.NET Core 10 Web API theo 5 luồng nghiệp vụ hiện hành (Đã loại bỏ 100% Notary, Shamir, chia %, video tuyên thệ).
* **[BE_INTEGRATION_GUIDE.md](BE_INTEGRATION_GUIDE.md)**: Hướng dẫn phát triển Backend ASP.NET Core 10 (.NET 10 LTS), Clean Architecture, mã hóa Server-Side AES-256-GCM, Webhook SePay VietQR, 2 ô cam kết pháp lý, và DMS Background Worker.
* **[FE_INTEGRATION_GUIDE.md](FE_INTEGRATION_GUIDE.md)**: Hướng dẫn phát triển React 19 Frontend theo chuẩn Feature-Sliced Design (FSD), không dùng Optimistic UI cho các bước pháp lý, tải file stream giải mã qua TLS 1.3.
* **[DESIGN_SYSTEM_UI_KIT.md](DESIGN_SYSTEM_UI_KIT.md)** & **[UI_KIT.html](UI_KIT.html)**: Master UI Kit với bảng màu Heritage Forest & Champagne Gold (Kho một người, Kho đồng sở hữu, 2 ô cam kết pháp lý, Lịch bàn giao, Cửa sổ 7 ngày quyết định & 2 năm suy nghĩ lại).
