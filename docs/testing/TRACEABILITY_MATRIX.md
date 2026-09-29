# MA TRẬN TRUY VẾT YÊU CẦU 2 CHIỀU (BIDIRECTIONAL TRACEABILITY MATRIX)
## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO TÀI SẢN SỐ
### Chuẩn phương pháp: Foundations of Software Testing – ISTQB Certification (Dorothy Graham et al., Chương 4.1.3, trang 80-81)

---

## 1. MỤC ĐÍCH & Ý NGHĨA TRUY VẾT (TRACEABILITY RATIONALE)
Căn cứ giáo trình ISTQB Chương 4.1.3 (trang 80–81):
* **Horizontal Traceability (Truy vết ngang):** Kết nối xuyên suốt giữa các tài liệu kiểm thử: từ Điều kiện kiểm thử (Test Condition) $\leftrightarrow$ Trường hợp kiểm thử (Test Case) $\leftrightarrow$ Thủ tục thực thi (Test Procedure) $\leftrightarrow$ Kết quả chạy (Test Result).
* **Vertical Traceability (Truy vết dọc):** Kết nối từ tầng đặc tả yêu cầu kinh doanh (SRS v3.11.0 Requirement ID) $\leftrightarrow$ Kiến trúc hệ thống / API Endpoint $\leftrightarrow$ Cấu trúc mã nguồn triển khai (Source Code Method) $\leftrightarrow$ Kết quả xác minh.
* **Mục tiêu quản lý:**
  1. Khi một yêu cầu nghiệp vụ thay đổi (ví dụ: đổi thời gian phản hồi từ 7 ngày sang 14 ngày), dễ dàng xác định chính xác những test case nào bị ảnh hưởng để cập nhật.
  2. Khi một ca kiểm thử thất bại (Fail), lập tức định vị được chức năng và mã nguồn gây ra sự cố.
  3. Đảm bảo 100% các yêu cầu cốt lõi có rủi ro cao (High/Critical) đều được kiểm thử đầy đủ trước khi bàn giao.

---

## 2. MA TRẬN TRUY VẾT YÊU CẦU ĐẦY ĐỦ (REQUIREMENT TRACEABILITY MATRIX)

| Requirement ID | Nguồn trong SRS v3.11.0 | Test Condition ID | Rủi ro & Ưu tiên | Test Case ID | Test Procedure ID | Thành phần Code / API tương ứng | Kết quả thực thi |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- | :---: |
| **CODE-UTIL-EMAIL** | Tiện ích kiểm tra định dạng email mức mã nguồn | `TCND-01` | Medium / P2 | `TC_EP_01`, `TC_EP_02` | `TP_AUTO_SETUP_CONSOLIDATE` | `EmailUtils.IsValidEmail` | **PASS** |
| **SETUP-05**, **ASSET-04**, **AC-01** | Mục 2.1, dòng 84, 95; Mục 3, dòng 340 | `TCND-02` | High / P1 | `TC_EP_03` | `TP_AUTO_SETUP_CONSOLIDATE` | `EstatePlanRulesService.ConsolidateVaults` | **PASS** |
| **OPLAN-05**, **OPLAN-08** | Mục 2.1, dòng 143, 146 | `TCND-03` | High / P1 | `EP03_DeletionEligibility_TierPartitions` | `TP_AUTO_SETUP_CONSOLIDATE` | `EstatePlanRulesService.CalculateDeletionEligibility` | **PASS** |
| **OPLAN-05**, **AC-20** | Mục 2.1, dòng 143; Mục 3, dòng 359 | `TCND-04` | High / P1 | `TC_BVA_01`, `BVA01_DeletionEligibility_*` | `TP_AUTO_SETUP_CONSOLIDATE` | `EstatePlanRulesService.CalculateDeletionEligibility` | **PASS** |
| **TIME-01**, **AC-36** | Mục 2.4, dòng 268; Mục 3, dòng 375 | `TCND-05` | Critical / P1 | `TC_BVA_02`, `BVA02_ReconsiderationExpiry_*` | `TP_AUTO_SETUP_CONSOLIDATE` | `EstatePlanRulesService.CalculateReconsiderationExpiry` | **PASS** |
| **SETUP-01**, **BVA-03** | Mục 2.1, dòng 80 | `TCND-06` | High / P1 | `TC_BVA_03`, `BVA03_PlanActivation_*` | `TP_AUTO_SETUP_CONSOLIDATE` | `EstatePlanRulesService.ValidatePlanActivation` | **PASS** |
| **SETUP-01**, **AC-06** | Mục 2.1, dòng 80; Mục 3, dòng 345 | `TCND-07` | Critical / P1 | `TC_DT_01`, `TC_DT_02`, `DT01_PlanActivation_*` | `TP_AUTO_SETUP_CONSOLIDATE` | `EstatePlanRulesService.ValidatePlanActivation` | **PASS** |
| **DEATH-02**, **AC-12** | Mục 2.3, dòng 202; Mục 3, dòng 351 | `TCND-08` | Critical / P1 | `TC_DT_03`, `WB_MCDC_01->03` | `TP_AUTO_MCDC_ATTESTATION` | `EstatePlanRulesService.ValidateDeathAttestation` | **PASS** |
| **PAY-02**, **PAY-03** | Mục 2.4, dòng 299, 300 | `TCND-09` | High / P1 | `DT03_SePayWebhook_*`, `WB_SePay_*` | `TP_MANUAL_SEPAY_FLOW` | `SePayPaymentService.ProcessWebhookAsync` | **PASS** |
| **REDIST-01 -> REDIST-06** | Mục 2.4, dòng 248-253; Mục 3, AC-03..07 | `TCND-10` | Critical / P1 | `TC_ST_01`, `TC_ST_02`, `ST01_TransferChoice_*`| `TP_AUTO_SETUP_CONSOLIDATE` | `EstatePlanRulesService.ProcessTransferChoice` | **PASS** |
| **AC-09**, **AC-10**, **AC-35** | Mục 3, dòng 348, 349, 374 | `TCND-11` | High / P1 | `ST02_CoOwnedVault_ConsensusTransitions` | `TP_AUTO_SETUP_CONSOLIDATE` | `EstatePlanRulesService.EvaluateCoOwnedConsensus` | **PASS** |
| **ASSIGN-06** | Mục 2.3, dòng 221 | `TCND-12` | High / P1 | `WB_ThreePersonRule_*` | `TP_AUTO_SETUP_CONSOLIDATE` | `EstatePlanRulesService.ValidateThreePersonRule` | **PASS** |
| **SEC-01**, **SEC-02** | Mục 2.5, dòng 323, 324 | `TCND-13` | Critical / P1 | `WB_ENC_01->03`, `WB_RoundTrip_*` | `TP_AUTO_SETUP_CONSOLIDATE` | `EnvelopeEncryptionService.EncryptStreamAsync` | **PASS** |
| **STATE_MACHINES Sec 5** | SAD Mục 4.2; STATE_MACHINES.md Sec 5 | `TCND-14` | High / P1 | `TC_ST_03`, `WB_TimeLock_*` | `TP_AUTO_SETUP_CONSOLIDATE` | `TimeLockRescueService` | **PASS** |

---

## 3. KẾT QUẢ RÀ SOÁT TĨNH (STATIC TESTING / DOCUMENTATION REVIEW - CHƯƠNG 3)

Trong quá trình thực hiện Static Review đối chiếu giữa **SRS v3.11.0**, các tài liệu kiến trúc kỹ thuật (`STATE_MACHINES.md`, `ERROR_CODES.md`, `INTEGRATION_GUIDE_FOR_DEV.md`) và mã nguồn thực tế, đội ngũ QA phát hiện một số điểm sai lệch cần được nhóm phát triển và hội đồng dự án phê duyệt:

### Bảng các điểm sai lệch & Trạng thái quyết định (`CẦN CHỐT`):

| STT | Tài liệu 1 (Trích dẫn) | Tài liệu 2 / Code (Trích dẫn) | Nội dung mâu thuẫn / Thiếu sót | Trạng thái | Đề xuất giải pháp của QA Engineer |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **1** | `LegacyVault-SRS-v3.11.0.md` (Dòng 6): "nền tảng mục tiêu .NET 10 / React 19" | `INTEGRATION_GUIDE_FOR_DEV.md` (Dòng 2) & `server/` csproj: .NET 8 LTS | Khác biệt phiên bản .NET (SRS ghi .NET 10 LTS nhưng thực tế .NET 10 chưa phát hành chính thức, prototype đang chạy trên .NET 8). | **CẦN CHỐT** | Thống nhất ghi nhận trong báo cáo đồ án: "Baseline nghiệp vụ SRS hướng tới .NET 10, phiên bản prototype triển khai thực tế trên .NET 8 LTS để đảm bảo tính ổn định". |
| **2** | `docs/ERROR_CODES.md` (Dòng 43-46) định nghĩa: `ERR_TRANSFER_CO_OWNED_FORBIDDEN`, `ERR_HANDOVER_FINALIZED_LOCKED`, `ERR_TRANSFER_TARGET_INVALID` | `LegacyVault.Prototype.Domain/ErrorCodes.cs` ban đầu thiếu các hằng số này | Mã nguồn backend prototype thiếu các mã lỗi định danh chuẩn của luồng chuyển quyền 1:1. | **ĐÃ KHẮC PHỤC** | Đội ngũ QA đã bổ sung đầy đủ các hằng số lỗi vào `ErrorCodes.cs` để đồng bộ 100% với tài liệu đặc tả. |
| **3** | `LegacyVault-SRS-v3.11.0.md` (Dòng 248 - `REDIST-01`): Chuyển quyền 1:1 chỉ áp dụng trước khi Executor bấm Bắt đầu bàn giao | `USER_PROVIDED_FLOW_02.xml` (sơ đồ cũ): vẽ nút chuyển quyền nằm sau khi Executor bắt đầu | Sơ đồ cũ của nhóm vẽ sai vị trí nghiệp vụ của chức năng chuyển quyền. | **CẦN CHỐT** | Giữ vững quy tắc của SRS v3.11.0: Sau khi Executor bắt đầu bàn giao (`handover_started_at`), khóa cứng chuyển quyền (`FINALIZED`), Beneficiary chỉ có 2 lựa chọn: **Nhận** hoặc **Từ chối**. |
| **4** | `LegacyVault-SRS-v3.11.0.md` (Dòng 258 - Bước 2): Cửa sổ phản hồi ban đầu ghi là `7 × 24 giờ` (`TIME-01` dòng 268 ghi 168 giờ, `AC-35`) | UI một số bản nháp ghi là 30 ngày; hiểu lầm là hủy bỏ ngay sau 7 ngày | Không nhất quán thời hạn phản hồi ban đầu giữa 7 ngày và 30 ngày; xác định sai hậu quả sau 7 ngày. | **CẦN CHỐT** | Khẳng định theo SRS v3.11.0: Cửa sổ phản hồi ban đầu là **7 ngày (168 giờ)**. Quá 7 ngày không phản hồi thì kho chuyển sang đóng băng suy nghĩ lại **2 năm lịch** (`FROZEN_RECONSIDERATION`). Trong suốt 2 năm này, người nhận **vẫn có quyền đổi ý bấm Nhận hoặc Từ chối** (`AC-34`, `AC-35`, `AC-37`); chỉ khi hết 2 năm mà chưa đủ đồng thuận mới hủy bàn giao (`CANCELLED_WITHOUT_DELIVERY`, `AC-36`). |
| **5** | `SePayPaymentService.cs`: `ValidateWebhookAuth` ban đầu trả về `true` cho key sai và cho phép fallback key thử nghiệm | `FRONTEND_BACKEND_API_CONTRACT.md` & SRS Sec 2.5: Yêu cầu bảo mật Webhook | Lỗ hổng cho phép bypass xác thực Webhook với API Key sai; nguy cơ lọt key thử nghiệm `SEPAY_TEST_API_KEY_2026` lên Production. | **ĐÃ KHẮC PHỤC** | Đã sửa mã nguồn phân định môi trường: Ở Production, bắt buộc có secret key an toàn, cấm triệt để test key `SEPAY_TEST_API_KEY_2026` và header rỗng, dùng so sánh thời gian cố định `CryptographicOperations.FixedTimeEquals` (Incident DEF-001). |
