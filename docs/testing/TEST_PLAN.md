# KẾ HOẠCH KIỂM THỬ PHẦN MỀM (TEST PLAN)
## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO TÀI SẢN SỐ
### Chuẩn phương pháp: Foundations of Software Testing – ISTQB Certification (Dorothy Graham, Erik van Veenendaal, Isabel Evans, Rex Black) & Mẫu chuẩn IEEE 829 (Chương 5.2, trang 135)

---

## 1. TEST PLAN IDENTIFIER (Định danh Kế hoạch Kiểm thử)
- **Mã tài liệu:** `LV-TP-2026-V3.11.0`
- **Phiên bản:** 1.0
- **Ngày ban hành:** 28/09/2026
- **Test Basis tham chiếu:**
  - `LegacyVault-SRS-v3.11.0.md` (Đặc tả yêu cầu phần mềm - Nguồn nghiệp vụ ưu tiên cao nhất)
  - `STATE_MACHINES.md` (Quy chuẩn vòng đời trạng thái nghiệp vụ Baseline 3.11.0)
  - `ERROR_CODES.md` (Danh mục mã lỗi chuẩn RFC 7807)
  - `PERMISSION_MATRIX.md` (Ma trận phân quyền 5 vai trò)
  - `FRONTEND_BACKEND_API_CONTRACT.md` (Hợp đồng API giữa Client và Server)
  - Giáo trình: *“Foundations of Software Testing – ISTQB Certification”* (Dorothy Graham et al.)

---

## 2. INTRODUCTION (Giới thiệu)
LegacyVault là giải pháp Legal-Tech lưu giữ và bàn giao tài sản số có điều kiện. Hệ thống cho phép Chủ sở hữu (Owner) tải tài sản số (dạng tệp tin hoặc thông tin tài khoản/ví crypto mã hóa), gán người thụ hưởng cho từng tài sản độc lập, hệ thống tự động gom nhóm thành các Kho bàn giao (`HandoverVault`) dựa trên tập `person_id`. Quy trình chuyển giao chỉ phát sinh sau khi Chủ sở hữu qua đời và hồ sơ chứng tử được Người xác minh (Verifier) kiểm tra, phê duyệt với hai cam kết trách nhiệm pháp lý độc lập (`DEATH-02`).

Mục tiêu của kế hoạch kiểm thử này là thiết lập quy trình kiểm thử có cấu trúc, phối hợp giữa **Static Testing** (Đánh giá tài liệu/đặc tả mà không chạy mã nguồn, Chương 3) và **Dynamic Testing** (Thực thi kiểm thử chức năng và phi chức năng, Chương 2 & 4), kết hợp kỹ thuật **Black-box** (Chương 4.3) và **White-box** (Chương 4.4) nhằm tối thiểu hóa rủi ro chất lượng sản phẩm (Product Risks, Chương 5.5).

> [!IMPORTANT]
> **Nguyên tắc phân định ranh giới (Product vs Prototype):**
> Kế hoạch kiểm thử phân biệt rõ ràng giữa **Sản phẩm LegacyVault mục tiêu** (môi trường PostgreSQL bền vững, bảo mật Zero-Knowledge, HSM/KMS) và **SWP-Prototype** (môi trường chạy thử nghiệm với bộ nhớ RAM, mock adapter, và simulated endpoint). Các hành vi giả lập (như mock webhook thanh toán, sandbox eKYC) chỉ phục vụ kiểm thử cô lập, tuyệt đối không được coi là yêu cầu của sản phẩm chính thức.

---

## 3. TEST ITEMS (Các thành phần kiểm thử)
Các hạng mục kiểm thử bao gồm các thành phần mã nguồn và tài liệu thuộc phiên bản Baseline 3.11.0:
1. **Core Domain & Business Rules Engine:**
   - `LegacyVault.Prototype.Domain.Models.EstatePlanModels`: Cấu trúc thực thể kế hoạch, kho tự gom, trạng thái chuyển đổi.
   - `LegacyVault.Prototype.Application.Services.EstatePlanRulesService`: Logic kích hoạt kế hoạch (`SETUP-01`), tự gom kho (`AC-01`), quy tắc 3 người độc lập (`ASSIGN-06`), hạn đóng băng 2 năm (`TIME-01`), điều kiện xóa kho (`OPLAN-05`), cam kết pháp lý (`DEATH-02`), và đồng thuận đồng sở hữu (`AC-09`, `AC-10`).
2. **Infrastructure Security & Integration Services:**
   - `SePayPaymentService`: Tích hợp webhook VietQR, cơ chế chống lặp (Idempotency) theo `provider_event_id`, kiểm tra thời hạn đơn 15 phút (`PAY-02`, `PAY-03`).
   - `EnvelopeEncryptionService`: Mã hóa phong bì AES-256-GCM, sinh DEK ngẫu nhiên, niêm phong khóa KEK, tính toán SHA-256 Checksum (`SEC-01`, `SEC-02`).
   - `TimeLockRescueService`: Quản lý đếm ngược Time-Lock Delay và cơ chế cứu hộ 2 bước (`AliveClaim`).
   - `EkycService`: Xử lý OCR CCCD và FaceMatch chống giả mạo sinh trắc học.
   - `EmailUtils`: Tiện ích xác thực định dạng email RFC 5322 và che mờ thông tin cá nhân (Masking).
3. **API Controllers & Endpoints:**
   - `AuthController`, `CryptoController`, `PaymentController`, `TimeLockController`, `EkycController`.

---

## 4. FEATURES TO BE TESTED (Phạm vi kiểm thử)
Các tính năng nằm trong phạm vi kiểm thử (In-Scope), được ưu tiên theo ma trận rủi ro:
1. **Xác thực, phân quyền & Quy tắc 3 người độc lập (`ASSIGN-06`):** Đảm bảo Owner, Executor, Verifier là 3 cá nhân khác nhau theo `person_id`; Executor và Verifier không được là Beneficiary.
2. **Gói cước, Quota & Điều kiện kích hoạt (`SETUP-01`, `OPLAN-01`):** Kiểm tra chặn kích hoạt trên gói Free, kiểm tra hạn gói, xác thực MFA, Executor chấp thuận và có ít nhất 1 tài sản chỉ định.
3. **Tự gom kho bàn giao theo tập người nhận (`SETUP-05`, `ASSET-04`, `AC-01`):** Tự động phân loại `SINGLE_RECIPIENT` (1 người) và `CO_OWNED` ($\ge 2$ người); loại bỏ tài sản chưa gán (`NOT_IN_ESTATE_PLAN`).
4. **Quy trình chuyển quyền 1:1 (`REDIST-01` đến `REDIST-06`):** Chỉ cho phép chuyển nguyên kho một người; cấm chia/chuyển kho đồng sở hữu; khóa bất biến khi Executor bấm "Bắt đầu bàn giao".
5. **Đồng thuận kho đồng sở hữu (`AC-09`, `AC-10`):** Bắt buộc 100% đồng sở hữu đồng ý mới cấp quyền truy cập; từ chối hoặc im lặng chuyển sang đóng băng suy nghĩ lại.
6. **Điểm danh sinh tồn (DMS), Đóng băng & Điều kiện xóa (`DMS-04`, `OPLAN-05`):** Công thức xóa an toàn `deletion_eligible_at = max(freeze_at + 30d, paid_plan_expires_at + 30d)`; gói Free tuyệt đối không xóa.
7. **Thời hạn suy nghĩ lại 2 năm lịch & Xử lý ngày nhuận 29/02 (`TIME-01`):** Đảm bảo không phát sinh lỗi tràn lịch khi mốc đóng băng rơi vào năm nhuận.
8. **Thẩm định hồ sơ chứng tử & Cam kết pháp lý (`DEATH-02`, `AC-12`):** Bắt buộc cả 2 ô tích cam kết trách nhiệm pháp lý độc lập của Executor và Verifier.
9. **Thanh toán SePay & Idempotency (`PAY-02`, `PAY-03`):** Xử lý webhook an toàn, thời hạn 15 phút, trả về HTTP 200 khi gửi lặp.
10. **Bảo mật mã hóa phong bì AES-256-GCM (`SEC-01`, `SEC-02`):** Tính toàn vẹn SHA-256, giải bọc DEK chính xác.

---

## 5. FEATURES NOT TO BE TESTED (Ngoài phạm vi kiểm thử)
Căn cứ mục 1.2 của SRS v3.11.0, các tính năng sau nằm ngoài phạm vi MVP:
1. Giao dịch trực tiếp với Smart Contract / Blockchain thật (chuyển coin/token thực tế).
2. Tích hợp cổng cơ sở dữ liệu hộ tịch quốc gia thực tế của Bộ Công an.
3. Thanh toán thẻ tín dụng quốc tế trực tiếp với cổng thanh toán thương mại có trừ tiền thật.
4. Tự động kết luận qua đời chỉ từ việc không điểm danh.
5. Kiểm thử chữ ký số công cộng đạt chuẩn theo Luật Giao dịch điện tử ngoài thực tế (trong đồ án chỉ kiểm thử mô phỏng chữ ký điện tử).
6. Hạ tầng phân tán phức tạp (PostgreSQL + pgvector, Redis Cluster, AWS S3/KMS phần cứng chuyên dụng) và cam kết Zero-Knowledge chống người có toàn quyền máy chủ: Căn cứ SRS v3.11.0 `SEC-03`, hệ thống không cam kết mã hóa đầu cuối chống superuser có toàn quyền kiểm soát máy chủ; các dịch vụ ngoài và lưu trữ trong prototype được mô phỏng phù hợp mục tiêu đồ án học thuật SWP391.

---

## 6. APPROACH (Chiến lược & Phương pháp kiểm thử)
Chiến lược kiểm thử áp dụng kết hợp theo các hướng tiếp cận quy định tại ISTQB Chương 5.2.6 (trang 141-143):
- **Analytical (Phân tích dựa trên yêu cầu & rủi ro):** Rà soát đặc tả SRS v3.11.0, xác định các điều kiện kiểm thử có rủi ro cao (Risk-based testing, Mục 5.5).
- **Specification-based / Black-box (Chương 4.3):**
  - *Equivalence Partitioning (EP):* Phân hoạch các lớp giá trị hợp lệ và không hợp lệ (trang 89-94).
  - *Boundary Value Analysis (BVA):* Áp dụng phương pháp 2 giá trị trên các ranh giới thời gian và hạn mức (trang 94-96).
  - *Decision Table Testing:* Bảng quyết định các quy tắc nghiệp vụ đa điều kiện (trang 96-101).
  - *State Transition Testing:* Kiểm tra các chuyển trạng thái hợp lệ và kiểm tra chặn chuyển trạng thái bị cấm qua bảng trạng thái (trang 101-105).
- **Structure-based / White-box (Chương 4.4):**
  - *Statement Coverage & Decision Coverage:* Đo đạc tỷ lệ câu lệnh và tỷ lệ kết quả quyết định (True/False) được thực thi bằng công cụ Coverlet (trang 109-112).
  - *Modified Condition / Decision Coverage (MC/DC):* Phân tích các quyết định Boolean phức tạp có từ 2 điều kiện nguyên tử trở lên, chứng minh từng điều kiện độc lập tác động đến kết quả quyết định (Mục 4.4.4, trang 113).
- **Regression-averse (Phòng chống thoái lui):** Tự động hóa toàn bộ test suite bằng xUnit và Coverlet để chạy lại liên tục sau mỗi lần cập nhật mã nguồn (Chương 2.3.4, trang 52).

### Cấp độ kiểm thử (Test Levels - Chương 2.2):
- **Component Testing (Unit Testing - Mục 2.2.1):** Kiểm tra độc lập các service nghiệp vụ (`EstatePlanRulesService`, `EnvelopeEncryptionService`, `EmailUtils`).
- **Component Integration Testing (Mục 2.2.2):** Kiểm tra tích hợp giữa Controller, Service nghiệp vụ và Repository/In-memory Store (như `SePayPaymentService` với `IdempotencyRecords`).
- **System Testing (Mục 2.2.3):** Kiểm thử luồng nghiệp vụ hoàn chỉnh xuyên suốt từ Lập kế hoạch $\rightarrow$ Báo tử $\rightarrow$ Xác minh $\rightarrow$ Bàn giao.

---

## 7. ITEM PASS/FAIL CRITERIA (Tiêu chí Đạt/Không đạt)
Căn cứ ISTQB Chương 1.4.5 (trang 28):
- **Pass (Đạt):**
  - Kết quả thực tế (Actual Result) khớp hoàn toàn với kết quả mong đợi xác định trước (Expected Result).
  - Mã lỗi RFC 7807 (`errorCode`), HTTP Status và trạng thái dữ liệu trong cơ sở dữ liệu/bộ nhớ đạt đúng theo thiết kế.
  - Không phát sinh ngoại lệ không được xử lý (Unhandled Exception / HTTP 500).
- **Fail (Không đạt):**
  - Kết quả thực tế sai lệch so với kết quả mong đợi (ví dụ: HTTP Status sai, cấp quyền khi chưa đủ điều kiện, cho phép chuyển quyền trên kho đồng sở hữu).
  - Xảy ra lỗi crash hoặc vi phạm tính toàn vẹn dữ liệu.

---

## 8. SUSPENSION AND RESUMPTION CRITERIA (Tiêu chí Tạm dừng và Tiếp tục)
- **Tạm dừng kiểm thử (Suspension):**
  - Môi trường build gặp lỗi biên dịch nghiêm trọng (Compiler errors).
  - Các service cốt lõi (như Module mã hóa hoặc Controller) bị chặn không thể gọi được.
  - Tỷ lệ lỗi kiểm thử vượt quá 30% trên tổng số test case của một chu kỳ thực thi.
- **Tiếp tục kiểm thử (Resumption):**
  - Các lỗi chặn (Blockers) đã được sửa chữa và vượt qua kiểm thử xác nhận (Confirmation Testing / Re-testing, Chương 2.3.4, trang 52).
  - Mã nguồn được build thành công với 0 cảnh báo nghiêm trọng.

---

## 9. TEST DELIVERABLES (Sản phẩm bàn giao kiểm thử)
Theo chuẩn IEEE 829 và ISTQB Chương 4.1 & 5.2, bộ tài liệu kiểm thử bàn giao bao gồm:
1. `docs/testing/TEST_PLAN.md` (Kế hoạch kiểm thử tổng thể)
2. `docs/testing/TEST_DESIGN_SPECIFICATION.md` (Đặc tả thiết kế kiểm thử)
3. `docs/testing/TEST_CASE_SPECIFICATION.md` (Đặc tả trường hợp kiểm thử)
4. `docs/testing/TEST_PROCEDURE_SPECIFICATION.md` (Đặc tả thủ tục kiểm thử)
5. `docs/testing/WHITE_BOX_COVERAGE.md` (Báo cáo phân tích độ bao phủ mã nguồn & MC/DC)
6. `docs/testing/TRACEABILITY_MATRIX.md` (Ma trận truy vết yêu cầu 2 chiều)
7. `docs/testing/TEST_EXECUTION_REPORT.md` (Báo cáo thực thi kiểm thử & Nhật ký sự cố)
8. Mã nguồn kiểm thử tự động trong project `server/LegacyVault.Prototype.Tests/`.

---

## 10. ENVIRONMENTAL NEEDS (Môi trường kiểm thử)
- **Hệ điều hành:** Windows 11 x64.
- **Runtime & SDK:** .NET SDK 8.0.423.
- **Framework kiểm thử:** xUnit 2.5.3, `Microsoft.NET.Test.Sdk` 17.8.0.
- **Công cụ đo độ bao phủ:** `coverlet.collector` 6.0.0 (XPlat Code Coverage).
- **Công cụ giả lập:** Mock adapters, InMemory Configuration Provider, Fake Clock (sử dụng thời gian tĩnh Utc).
- **Ràng buộc an toàn:** Tuyệt đối không dùng thông tin CCCD thật, không gửi email ra máy chủ bên ngoài, không thực hiện giao dịch ngân hàng thật.

---

## 11. RISKS AND CONTINGENCIES (Quản lý rủi ro - Chương 5.5)

### 11.1. Rủi ro chất lượng sản phẩm (Product Risks - Mục 5.5.2)
| ID | Mô tả rủi ro chất lượng | Khả năng (Likelihood 1-5) | Tác động (Impact 1-5) | RPN (LxI) | Biện pháp giảm thiểu (Mitigation) |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **PR-01** | Bàn giao sai tài sản hoặc cấp quyền cho người không được chỉ định | 2 | 5 | **10** | Kiểm thử phân vùng tương đương, chặn chuyển quyền kho đồng sở hữu, xác thực snapshot bất biến. |
| **PR-02** | Rò rỉ thông tin đăng nhập/ví trong metadata hoặc log hệ thống | 2 | 5 | **10** | Kiểm thử mã hóa phong bì AES-256-GCM, kiểm tra chuỗi JSON trước khi lưu/trả về client. |
| **PR-03** | Khóa thời gian trễ (Time-Lock) bị bỏ qua do thao tác đồng thời | 3 | 4 | **12** | Kiểm thử chuyển đổi trạng thái và kiểm thử điều kiện cạnh tranh (Race Condition). |
| **PR-04** | Webhook thanh toán SePay bị gửi lặp dẫn đến cộng trùng quota/gói | 4 | 3 | **12** | Kiểm thử Bảng quyết định cho tính năng Idempotency theo `provider_event_id`. |
| **PR-05** | Kho bị xóa sớm khi hồ sơ chứng tử vẫn đang trong quá trình xét duyệt | 2 | 5 | **10** | Kiểm thử phân tích giá trị biên (BVA) trên công thức `deletion_eligible_at`. |

### 11.2. Rủi ro dự án (Project Risks - Mục 5.5.3)
| ID | Mô tả rủi ro dự án | Biện pháp xử lý / Dự phòng (Contingency) |
| :---: | :--- | :--- |
| **PJR-01** | File thư viện DLL bị khóa do tiến trình WebApi đang chạy ngầm | Sử dụng lệnh PowerShell dừng tiến trình trước khi thực hiện build/test. |
| **PJR-02** | Thiếu công cụ đo MC/DC tự động chuyên dụng trong môi trường .NET | Tiến hành phân tích cấu trúc, lập bảng chân trị và cặp kiểm thử độc lập thủ công có đối chiếu. |
| **PJR-03** | Mâu thuẫn giữa tài liệu đặc tả SRS và mã nguồn prototype | Lập bảng đối chiếu chi tiết trong Traceability Matrix và đánh dấu `CẦN CHỐT`. |

---

## 12. APPROVALS (Phê duyệt)
- **Senior QA Engineer:** Nguyễn Thành Duy (Đã lập và ký xác nhận)
- **Technical Lead / Project Manager:** Phê duyệt phát hành phiên bản kiểm thử Baseline 3.11.0.
