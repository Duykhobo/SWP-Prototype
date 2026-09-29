# ĐẶC TẢ TRƯỜNG HỢP KIỂM THỬ (TEST CASE SPECIFICATION)
## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO TÀI SẢN SỐ
### Chuẩn phương pháp: Foundations of Software Testing – ISTQB Certification (Dorothy Graham et al.) & Mẫu chuẩn IEEE 829 (Chương 4.1.4, trang 83)

---

## 1. TEST CASE SPECIFICATION IDENTIFIER
- **Mã tài liệu:** `LV-TCS-2026-V3.11.0`
- **Phiên bản:** 1.0
- **Ngày ban hành:** 28/09/2026
- **Test Basis tham chiếu:** `LegacyVault-SRS-v3.11.0.md` & `TEST_DESIGN_SPECIFICATION.md`

---

## 2. DANH MỤC TRƯỜNG HỢP KIỂM THỬ CHI TIẾT (TEST CASES)

### Nhóm 1: Kiểm thử Phân vùng tương đương (Equivalence Partitioning - EP)

#### Test Case `TC_EP_01`: Xác thực địa chỉ Email hợp lệ
- **Test Condition ID:** `TCND-01`
- **Requirement ID:** `CODE-UTIL-EMAIL` (Tiện ích kiểm tra định dạng email mức mã nguồn)
- **Test Level / Test Type:** Component Testing / Functional
- **Kỹ thuật thiết kế:** Equivalence Partitioning (Lớp hợp lệ EP-EM-01)
- **Tiền điều kiện:** Không có.
- **Đầu vào cụ thể (Input Specifications):** `email = "valid.owner@legacyvault.vn"`
- **Kết quả mong đợi (Output Specifications):** Phương thức `EmailUtils.IsValidEmail` trả về `true`.
- **Môi trường & Phụ thuộc:** .NET 8 Runtime; độc lập.

#### Test Case `TC_EP_02`: Từ chối địa chỉ Email thiếu ký tự `@`
- **Test Condition ID:** `TCND-01`
- **Requirement ID:** `CODE-UTIL-EMAIL` (Tiện ích kiểm tra định dạng email mức mã nguồn)
- **Test Level / Test Type:** Component Testing / Functional
- **Kỹ thuật thiết kế:** Equivalence Partitioning (Lớp không hợp lệ EP-EM-03)
- **Tiền điều kiện:** Không có.
- **Đầu vào cụ thể (Input Specifications):** `email = "invalidemail.without.at"`
- **Kết quả mong đợi (Output Specifications):** Phương thức `EmailUtils.IsValidEmail` trả về `false`.
- **Môi trường & Phụ thuộc:** .NET 8 Runtime; độc lập.

#### Test Case `TC_EP_03`: Tự gom kho bàn giao theo tập Người thụ hưởng duy nhất
- **Test Condition ID:** `TCND-02`
- **Requirement ID:** `SETUP-05`, `ASSET-04`, `AC-01`
- **Test Level / Test Type:** Component Testing / Functional
- **Kỹ thuật thiết kế:** Equivalence Partitioning (Lớp EP-REC-01, EP-REC-02, EP-REC-03)
- **Tiền điều kiện:** Kế hoạch di sản có 4 tài sản A, B, C, D; danh sách người nhận gồm `person1`, `person2`, `person3`.
- **Đầu vào cụ thể (Input Specifications):**
  - Tài sản A: `{ person1 }`
  - Tài sản C: `{ person1 }`
  - Tài sản B: `{ person1, person2 }`
  - Tài sản D: `{ person3 }`
  - Tài sản rác: `{}` (Không gán)
- **Kết quả mong đợi (Output Specifications):**
  - Tạo đúng 3 đối tượng `HandoverVault`.
  - Kho 1: chế độ `SINGLE_RECIPIENT`, chứa cả 2 tài sản A và C, người nhận `person1`.
  - Kho 2: chế độ `CO_OWNED`, chứa tài sản B, người nhận `{ person1, person2 }`.
  - Kho 3: chế độ `SINGLE_RECIPIENT`, chứa tài sản D, người nhận `person3`.
  - Tài sản rác bị loại bỏ hoàn toàn khỏi manifest kho bàn giao.
- **Môi trường & Phụ thuộc:** `EstatePlanRulesService.ConsolidateVaults`.

---

### Nhóm 2: Kiểm thử Phân tích giá trị biên (Boundary Value Analysis - BVA)

#### Test Case `TC_BVA_01`: Tính mốc xóa kho nguồn khi hạn đóng băng dài hơn hạn gói
- **Test Condition ID:** `TCND-04`
- **Requirement ID:** `OPLAN-05`, `AC-20`
- **Test Level / Test Type:** Component Testing / Functional
- **Kỹ thuật thiết kế:** Boundary Value Analysis (Biên 1: `freeze_at > paid_plan_expires_at`)
- **Tiền điều kiện:** Kho nguồn ở trạng thái `FROZEN_INACTIVITY`, gói `LEGACY_XS`.
- **Đầu vào cụ thể (Input Specifications):**
  - `freeze_at = 2026-07-01T00:00:00Z`
  - `paid_plan_expires_at = 2026-05-01T00:00:00Z`
- **Kết quả mong đợi (Output Specifications):**
  - `deletion_eligible_at = 2026-07-31T00:00:00Z` (Lấy `freeze_at + 30 ngày`).
- **Môi trường & Phụ thuộc:** `EstatePlanRulesService.CalculateDeletionEligibility`.

#### Test Case `TC_BVA_02`: Tính thời hạn suy nghĩ lại 2 năm lịch từ ngày nhuận 29/02
- **Test Condition ID:** `TCND-05`
- **Requirement ID:** `TIME-01`, `AC-36`
- **Test Level / Test Type:** Component Testing / Functional
- **Kỹ thuật thiết kế:** Boundary Value Analysis (Biên ngày nhuận 29/02)
- **Tiền điều kiện:** Mốc đóng băng bắt đầu ngày 29/02 năm nhuận 2024.
- **Đầu vào cụ thể (Input Specifications):** `freeze_started_at = 2024-02-29T14:30:00Z`
- **Kết quả mong đợi (Output Specifications):**
  - `freeze_expires_at = 2026-02-28T14:30:00Z` (Năm 2026 không nhuận, lấy ngày 28/02). Không ném ngoại lệ hệ thống.
- **Môi trường & Phụ thuộc:** `EstatePlanRulesService.CalculateReconsiderationExpiry`.

#### Test Case `TC_BVA_03`: Biên số lượng tài sản gán người nhận khi kích hoạt kế hoạch
- **Test Condition ID:** `TCND-06`
- **Requirement ID:** `SETUP-01`, `BVA-03`
- **Test Level / Test Type:** Component Testing / Functional
- **Kỹ thuật thiết kế:** Boundary Value Analysis (Giá trị dưới biên 0 và tại biên 1)
- **Tiền điều kiện:** Gói `LEGACY_XS`, hạn còn 300 ngày, MFA đạt, Executor đã nhận việc.
- **Đầu vào cụ thể (Input Specifications):**
  - Lần 1: `DesignatedAssetCount = 0`
  - Lần 2: `DesignatedAssetCount = 1`
- **Kết quả mong đợi (Output Specifications):**
  - Lần 1: `IsSuccess = false`, `ErrorCode = "ERR_SETUP_NO_RECIPIENT_DESIGNATED"`.
  - Lần 2: `IsSuccess = true`, `ErrorCode = null`.
- **Môi trường & Phụ thuộc:** `EstatePlanRulesService.ValidatePlanActivation`.

---

### Nhóm 3: Kiểm thử Bảng quyết định (Decision Table Testing)

#### Test Case `TC_DT_01`: Kích hoạt kế hoạch khi thỏa mãn toàn bộ 6 điều kiện tiên quyết
- **Test Condition ID:** `TCND-07`
- **Requirement ID:** `SETUP-01`
- **Test Level / Test Type:** Component Integration Testing / Functional
- **Kỹ thuật thiết kế:** Decision Table (Quy tắc R1 trong Bảng DT-01)
- **Tiền điều kiện:** Chủ kho sở hữu gói `LEGACY_XS`.
- **Đầu vào cụ thể (Input Specifications):**
  - `Tier = LEGACY_XS`, `PlanExpiresAt = now + 10d`
  - `IsOwnerMfaVerified = true`
  - `IsPrimaryExecutorAccepted = true`
  - `DesignatedAssetCount = 1`
  - `HasOtherActivePlan = false`
- **Kết quả mong đợi (Output Specifications):** `IsSuccess = true`, kích hoạt kế hoạch thành công.

#### Test Case `TC_DT_02`: Chặn kích hoạt kế hoạch đối với gói Owner Free
- **Test Condition ID:** `TCND-07`
- **Requirement ID:** `SETUP-01`, `OPLAN-01`
- **Test Level / Test Type:** Component Testing / Functional
- **Kỹ thuật thiết kế:** Decision Table (Quy tắc R2 trong Bảng DT-01)
- **Đầu vào cụ thể (Input Specifications):** `Tier = OWNER_FREE`, các điều kiện khác đều thỏa mãn.
- **Kết quả mong đợi (Output Specifications):** `IsSuccess = false`, `ErrorCode = "ERR_PLAN_TIER_NOT_ELIGIBLE"`.

#### Test Case `TC_DT_03`: Kiểm tra 2 cam kết trách nhiệm pháp lý độc lập (`DEATH-02`)
- **Test Condition ID:** `TCND-08`
- **Requirement ID:** `DEATH-02`, `AC-12`
- **Test Level / Test Type:** Component Testing / Functional
- **Kỹ thuật thiết kế:** Decision Table (Bảng DT-02: R1, R2, R3, R4)
- **Đầu vào cụ thể (Input Specifications):**
  - R1: `(true, true)` -> `true`
  - R2: `(true, false)` -> `false`
  - R3: `(false, true)` -> `false`
  - R4: `(false, false)` -> `false`
- **Kết quả mong đợi (Output Specifications):** Chỉ cho phép phê duyệt khi cả Executor và Verifier đều tự tick cam kết trách nhiệm pháp lý.

---

### Nhóm 4: Kiểm thử Chuyển đổi trạng thái (State Transition Testing)

#### Test Case `TC_ST_01`: Khóa cứng lựa chọn chuyển quyền 1:1 khi Executor bắt đầu bàn giao
- **Test Condition ID:** `TCND-10`
- **Requirement ID:** `REDIST-01`, `REDIST-04`, `REDIST-06`, `AC-07`
- **Test Level / Test Type:** Integration Testing / Business Workflow
- **Kỹ thuật thiết kế:** State Transition Testing (Valid transition S1->S2, và Invalid Transition từ S4)
- **Tiền điều kiện:** Kho một người gán cho `person1`, snapshot gồm `{ person1, person2, person3 }`.
- **Các bước & Đầu vào:**
  1. `person1` chọn chuyển dự kiến sang `person2` (`ACTIVE`).
  2. `person1` đổi ý chọn sang `person3` (`REPLACED`).
  3. Executor kích hoạt `handover_started_at` (`FINALIZED`).
  4. `person1` cố tình gửi lệnh đổi đích sang `person2`.
- **Kết quả mong đợi (Output Specifications):**
  - Bước 1 & 2 thành công, `CurrentTargetRecipientId = person3`.
  - Bước 4 ném ngoại lệ `InvalidOperationException` kèm mã lỗi `ERR_HANDOVER_FINALIZED_LOCKED`.

#### Test Case `TC_ST_02`: Chặn thao tác chuyển quyền trên Kho đồng sở hữu
- **Test Condition ID:** `TCND-10`
- **Requirement ID:** `REDIST-01`, `AC-05`
- **Test Level / Test Type:** Component Testing / Security
- **Kỹ thuật thiết kế:** State Transition Testing (Invalid transition)
- **Đầu vào cụ thể:** Kho có `RecipientMode = CO_OWNED`, gán cho `{ person1, person2 }`. Gọi `ProcessTransferChoice`.
- **Kết quả mong đợi:** Ném ngoại lệ `InvalidOperationException` kèm mã lỗi `ERR_TRANSFER_CO_OWNED_FORBIDDEN`.

#### Test Case `TC_ST_03`: Vòng đời đồng thuận và đóng băng suy nghĩ lại 2 năm (`AC-10`, `AC-35`, `AC-37`)
- **Test Condition ID:** `TCND-11`
- **Requirement ID:** `AC-09`, `AC-10`, `AC-35`, `AC-37`, `TIME-01`
- **Test Level / Test Type:** Component Integration Testing / Business Workflow
- **Kỹ thuật thiết kế:** State Transition Testing (Valid & Reconsideration transitions)
- **Đầu vào cụ thể (Input Specifications):**
  1. Kho đồng sở hữu 2 người: `person1` bấm Nhận (`ACCEPTED`), `person2` bấm Từ chối (`REJECTED`).
  2. Kiểm tra mốc đóng băng: Kho chuyển `FROZEN_RECONSIDERATION` trong 2 năm lịch, `IsCommitted = false`.
  3. `person2` đổi ý bấm Nhận trong thời hạn 2 năm (`now < freeze_expires_at`).
  4. Quá 7 ngày (168 giờ) người nhận im lặng: chuyển `FROZEN_RECONSIDERATION`, vẫn giữ quyền đổi ý, không hủy ngay.
- **Kết quả mong đợi (Output Specifications):**
  - Tại bước 1: Không cấp grant cho bất kỳ ai; kho bị đóng băng `FROZEN_RECONSIDERATION`.
  - Tại bước 3: Sau khi cả hai cùng đồng ý, cam kết bàn giao thành công (`IsCommitted = true`).
  - Hết 7 ngày im lặng: Kho không bị hủy bỏ ngay mà được bảo vệ để suy nghĩ lại trong 2 năm lịch per `AC-35`.
- **Môi trường & Phụ thuộc:** `EstatePlanRulesService.EvaluateCoOwnedConsensus`.
