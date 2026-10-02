# THƯ VIỆN TÀI LIỆU DỰ ÁN LEGACYVAULT (SWP391 - SRS v3.11.0)

> **Cập nhật:** 30/09/2026 • **Tiêu chuẩn:** SRS v3.11.0 • **Cấu trúc:** Phân loại theo 6 thư mục chức năng chuyên biệt.

Tài liệu này là mục lục chính thức điều hướng toàn bộ hồ sơ kỹ thuật, kiến trúc, cơ sở dữ liệu, quy chuẩn tích hợp và tài liệu mật mã cho hệ thống **LegacyVault**.

> [!IMPORTANT]
> **Nguyên Tắc Kiến Trúc Cốt Lõi Của Phiên Bản Prototype:**  
> Phiên bản prototype thực hiện nhập liệu và thẩm định hồ sơ thủ công bởi con người (Executor và Verifier). AI/OCR được định hướng bổ sung trong tương lai để hỗ trợ trích xuất thông tin; không thay thế quyết định của người thẩm định.

---

## 📂 CẤU TRÚC THƯ VIỆN TÀI LIỆU (`docs/`)

```
docs/
├── 01_requirements/          # Đặc tả yêu cầu phần mềm (SRS) & Căn cứ pháp lý
├── 02_architecture/          # Kiến trúc hệ thống, Mật mã phong bì & CSDL ERD
├── 03_api_and_integration/   # Hợp đồng API Contract, Mã lỗi & Hướng dẫn FE/BE
├── 04_business_flows/        # Đặc tả chi tiết 5 luồng nghiệp vụ & Sơ đồ Swimlane
├── 05_design_ui/             # Design System, Bảng màu Heritage Forest & UI Kit HTML
├── 06_diagrams_interactive/  # Sơ đồ tương tác độc lập (Archify HTML & JSON)
├── ai_knowledge_base/        # 1.259 Điều luật trích xuất cho AI RAG Legal Advisor
├── testing/                  # Kế hoạch kiểm thử, Test cases & Test reports
└── README.md                 # Bản đồ điều hướng trung tâm (Tệp này)
```

---

## 1. 📋 [01_requirements/](01_requirements/) — Yêu cầu Nghiệp vụ & Pháp lý

* **[LegacyVault-SRS-v3.11.0.md](01_requirements/LegacyVault-SRS-v3.11.0.md)**: Bản đặc tả yêu cầu phần mềm chính thức (SRS v3.11.0 - 26/09/2026).
  * 5 Luồng nghiệp vụ cốt lõi: 1A-1B (Két số & Thiết lập di sản), 2A-2B (Điểm danh sinh tồn DMS), 3A-3B (Thẩm định chứng tử pháp lý), 4A-4H (Bàn giao di sản tự gom & Chuyển quyền 1:1), 5A-5B (Quản trị & Giám sát).
* **[LEGAL_FRAMEWORK_AND_CIVIL_COMPLIANCE.md](01_requirements/LEGAL_FRAMEWORK_AND_CIVIL_COMPLIANCE.md)**: Căn cứ pháp lý và tính tuân thủ pháp luật Việt Nam:
  * Luật Giao dịch điện tử 2023 (Luật số 20/2023/QH15).
  * Bộ luật Dân sự 2015 (Luật số 91/2015/QH13): Điều 624–630 (Di chúc), Điều 616 (Quản trị di sản).
  * Bộ luật Tố tụng Dân sự 2015: Điều 95 (Giá trị chứng cứ điện tử).

---

## 2. 🏛️ [02_architecture/](02_architecture/) — Kiến trúc Hệ thống, Mật mã & Dữ liệu

* **[KIEN_TRUC_MAT_MA_VA_LUU_TRU_DI_SAN.md](02_architecture/KIEN_TRUC_MAT_MA_VA_LUU_TRU_DI_SAN.md)**: **[TÀI LIỆU MẬT MÃ CỐT LÕI]** Đặc tả kiến trúc mã hóa phong bì (Envelope Encryption), phục hồi KEK bằng Shamir SSS trong RAM, kiểm soát bộ nhớ không ghi đĩa ngầm, quản lý phiên bản WORM, chính sách retention giữ 3 bản gần nhất và tiêu hủy Crypto-shredding.
* **[SYSTEM_ARCHITECTURE_DOCUMENT.md](02_architecture/SYSTEM_ARCHITECTURE_DOCUMENT.md)**: Tài liệu Kiến trúc Hệ thống chuẩn hóa theo phương pháp luận *System Design Primer*:
  * Đánh giá CAP Theorem (CP System), Phân tầng C4 Container (.NET 8 LTS + React 19), Chiến lược giao dịch ACID CSDL, Pipeline CI/CD tự động.
* **[DATABASE_SCHEMA_ERD.md](02_architecture/DATABASE_SCHEMA_ERD.md)**: Thiết kế đầy đủ các thực thể cơ sở dữ liệu trên SQL Server 2022 + EF Core 8 (.NET 8 LTS):
  * Phân biệt rõ `Persons` và `Users`, gom kho `HandoverVaults`, thực thể phiên bản chỉ định phân cấp `EstatePlanVersions` $\rightarrow$ `AssetDesignationVersions` $\rightarrow$ `DesignationVersionRecipients`, 3 gói cước chính cho Chủ kho (`OWNER_FREE`, `LEGACY_XS`, `LEGACY_XS_MAX`) cùng 2 gói lưu trữ cho Người nhận (`RECIPIENT_FREE`, `RECIPIENT_PLUS`).
* **[STATE_MACHINES.md](02_architecture/STATE_MACHINES.md)**: Quy chuẩn chuyển trạng thái của 5 máy trạng thái: Điểm danh DMS, Hồ sơ chứng tử Case, Kho bàn giao tự gom, Lựa chọn chuyển quyền 1:1, Đơn hàng SePay VietQR.
* **[PERMISSION_MATRIX.md](02_architecture/PERMISSION_MATRIX.md)**: Ma trận phân quyền Zero-Trust cho 5 vai trò ($Owner \ne Executor \ne Verifier$).
* **[TECHNOLOGY_PROS_CONS_COMPARISON.md](02_architecture/TECHNOLOGY_PROS_CONS_COMPARISON.md)**: Bảng phân tích ưu/nhược điểm các công nghệ lựa chọn (.NET vs Node.js, SQL Server vs PostgreSQL, Cloudflare R2 vs AWS S3).

---

## 3. 🔌 [03_api_and_integration/](03_api_and_integration/) — Hợp đồng API & Tích hợp

* **[FRONTEND_BACKEND_API_CONTRACT.md](03_api_and_integration/FRONTEND_BACKEND_API_CONTRACT.md)**: Hợp đồng giao tiếp API RESTful giữa Client SPA và Backend ASP.NET Core 8 Web API.
* **[BE_INTEGRATION_GUIDE.md](03_api_and_integration/BE_INTEGRATION_GUIDE.md)**: Hướng dẫn phát triển Backend ASP.NET Core 8, Clean Architecture, Webhook SePay VietQR, DMS Background Worker.
* **[FE_INTEGRATION_GUIDE.md](03_api_and_integration/FE_INTEGRATION_GUIDE.md)**: Hướng dẫn phát triển React 19 Frontend theo chuẩn Feature-Sliced Design (FSD), tải file stream giải mã qua TLS 1.3.
* **[ERROR_CODES.md](03_api_and_integration/ERROR_CODES.md)**: Danh mục mã lỗi chuẩn RFC 7807 ProblemDetails phục vụ xử lý UI thân thiện và truy vết `correlationId`.

---

## 4. 🔄 [04_business_flows/](04_business_flows/) — Luồng Nghiệp vụ & Sơ đồ Swimlane

* **[MAIN_FLOWS_DETAILED_SPECIFICATION.md](04_business_flows/MAIN_FLOWS_DETAILED_SPECIFICATION.md)**: Đặc tả chi tiết các luồng nghiệp vụ chính từ tạo két, điểm danh DMS, xác nhận chứng tử đến bàn giao di sản.
* **[BUSINESS_FLOW_AND_INTEGRATION_ANALYSIS.md](04_business_flows/BUSINESS_FLOW_AND_INTEGRATION_ANALYSIS.md)**: Phân tích luồng tích hợp nghiệp vụ và các điểm chạm dịch vụ (Xác minh danh tính thủ công bởi Verifier, SePay VietQR, Cloudflare R2, Google OIDC).
* **[DEVELOPER_SWIMLANE_GUIDE.md](04_business_flows/DEVELOPER_SWIMLANE_GUIDE.md)** & **[WORKFLOW_SWIMLANE_ARCHITECTURE.md](04_business_flows/WORKFLOW_SWIMLANE_ARCHITECTURE.md)**: Hướng dẫn lập trình viên tra cứu sơ đồ làn bơi theo 4 tầng kiến trúc.
* **Luồng 01 (Xác thực, Phân quyền & JIT):**
  * **[FLOW_01_SYSTEM_MERGED.xml](04_business_flows/FLOW_01_SYSTEM_MERGED.xml)**: Sơ đồ Swimlane XML mở trên [app.diagrams.net](https://app.diagrams.net).
  * **[FLOW_01_DEVELOPER_IMPLEMENTATION_SPEC.md](04_business_flows/FLOW_01_DEVELOPER_IMPLEMENTATION_SPEC.md)**: Đặc tả chi tiết triển khai code Luồng 01.
* **Luồng 02 (Thiết lập Kế hoạch, Mã hóa Phong bì & Kích hoạt DMS):**
  * **[FLOW_02_SYSTEM_MERGED.xml](04_business_flows/FLOW_02_SYSTEM_MERGED.xml)**: Sơ đồ Swimlane XML mở trên [app.diagrams.net](https://app.diagrams.net).
  * **[FLOW_02_DEVELOPER_IMPLEMENTATION_SPEC.md](04_business_flows/FLOW_02_DEVELOPER_IMPLEMENTATION_SPEC.md)**: Đặc tả chi tiết triển khai code Luồng 02.
* **Luồng 03 (Điểm danh Sinh tồn DMS, Tạm treo 90 ngày & Đóng băng an toàn):**
  * **[FLOW_03_SYSTEM_MERGED.xml](04_business_flows/FLOW_03_SYSTEM_MERGED.xml)**: Sơ đồ Swimlane XML mở trên [app.diagrams.net](https://app.diagrams.net).
  * **[FLOW_03_DEVELOPER_IMPLEMENTATION_SPEC.md](04_business_flows/FLOW_03_DEVELOPER_IMPLEMENTATION_SPEC.md)**: Đặc tả chi tiết triển khai code Luồng 03.

---

## 5. 🎨 [05_design_ui/](05_design_ui/) — Design System & Giao diện

* **[DESIGN_SYSTEM_UI_KIT.md](05_design_ui/DESIGN_SYSTEM_UI_KIT.md)**: Hướng dẫn Design System hoàn chỉnh với triết lý thiết kế Heritage Forest (#0A2F1D) & Champagne Gold (#D4AF37).
* **[UI_KIT.html](05_design_ui/UI_KIT.html)**: Bản hiển thị UI Kit trực quan (mở trực tiếp bằng trình duyệt).

---

## 6. 📊 [06_diagrams_interactive/](06_diagrams_interactive/) — Sơ đồ Tương tác Độc lập

Bộ sơ đồ kiến trúc động chuẩn Archify (mở trực tiếp trong trình duyệt bằng file `.html` độc lập, hỗ trợ dark/light mode và zoom/pan):
* **[legacyvault-architecture.html](06_diagrams_interactive/legacyvault-architecture.html)** & **[.json](06_diagrams_interactive/legacyvault-architecture.json)**: Sơ đồ toàn cảnh kiến trúc đa tầng LegacyVault.
* **[legacyvault-full-workflow.html](06_diagrams_interactive/legacyvault-full-workflow.html)** & **[.json](06_diagrams_interactive/legacyvault-full-workflow.json)**: Sơ đồ quy trình nghiệp vụ tổng thể xuyên suốt vòng đời di sản.
* **[legacyvault-payload-sequence.html](06_diagrams_interactive/legacyvault-payload-sequence.html)** & **[.json](06_diagrams_interactive/legacyvault-payload-sequence.json)**: Sơ đồ tuần tự truyền tải dữ liệu và gói mã hóa giữa Client, Backend, SQL Server và Cloudflare R2.
