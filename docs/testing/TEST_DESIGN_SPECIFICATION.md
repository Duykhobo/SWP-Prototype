# ĐẶC TẢ THIẾT KẾ KIỂM THỬ (TEST DESIGN SPECIFICATION)
## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO TÀI SẢN SỐ
### Chuẩn phương pháp: Foundations of Software Testing – ISTQB Certification (Dorothy Graham et al.) & Mẫu chuẩn IEEE 829 (Chương 4.1.3, trang 81)

---

## 1. TEST DESIGN SPECIFICATION IDENTIFIER
- **Mã tài liệu:** `LV-TDS-2026-V3.11.0`
- **Phiên bản:** 1.0
- **Ngày ban hành:** 28/09/2026
- **Test Basis tham chiếu:** `LegacyVault-SRS-v3.11.0.md` (SETUP-01 đến SETUP-07, ASSET-01 đến ASSET-08, OPLAN-01 đến OPLAN-08, DMS-01 đến DMS-10, DEATH-01 đến DEATH-04, ASSIGN-01 đến ASSIGN-10, REDIST-01 đến REDIST-06, PAY-01 đến PAY-08, SEC-01 đến SEC-07).

---

## 2. FEATURES TO BE TESTED (Các tính năng cần thiết kế kiểm thử)
1. **Xác thực định dạng Email & Che mờ PII:** Bảo vệ dữ liệu nhạy cảm theo RFC 5322 và Nghị định 13/2023/NĐ-CP.
2. **Quy tắc 3 người độc lập & Không xung đột lợi ích (`ASSIGN-06`):** Owner, Executor, Verifier phải là 3 cá nhân khác biệt; Executor/Verifier không thuộc danh sách Beneficiaries.
3. **Điều kiện kích hoạt Kế hoạch di sản (`SETUP-01`):** Kiểm tra hạn gói, MFA, Executor chấp thuận, có tài sản chỉ định, không có kế hoạch khác đang chạy.
4. **Tự gom kho bàn giao theo tập Người thụ hưởng (`SETUP-05`, `ASSET-04`, `AC-01`):** Phân loại kho một người (`SINGLE_RECIPIENT`) và kho đồng sở hữu (`CO_OWNED`).
5. **Thời hạn suy nghĩ lại 2 năm lịch (`TIME-01`):** Đóng băng 2 năm khi có từ chối hoặc hết 7 ngày; xử lý ngày nhuận 29/02.
6. **Mốc thời gian đủ điều kiện xóa kho nguồn (`OPLAN-05`):** Công thức `deletion_eligible_at = max(freeze_at + 30d, paid_plan_expires_at + 30d)`.
7. **Hai cam kết pháp lý bắt buộc trước bàn giao (`DEATH-02`, `AC-12`):** Cả Executor và Verifier phải tick ô cam kết trách nhiệm độc lập.
8. **Vòng đời chuyển quyền 1:1 (`REDIST-01` đến `REDIST-06`):** Chuyển nguyên kho, đổi đích, hủy chuyển và khóa cứng (`FINALIZED`) khi Executor bắt đầu bàn giao.
9. **Đồng thuận kho đồng sở hữu (`AC-09`, `AC-10`):** 100% đồng thuận mới cấp quyền; một người từ chối chuyển sang đóng băng toàn kho.
10. **Xử lý Webhook thanh toán SePay VietQR (`PAY-02`, `PAY-03`):** Xác thực API key, hết hạn sau 15 phút, chống lặp Idempotency.

---

## 3. APPROACH REFINEMENTS (Lọc và chi tiết hóa phương pháp)
Áp dụng đầy đủ 4 kỹ thuật thiết kế kiểm thử Hướng đặc tả (Specification-based / Black-box techniques) quy định tại ISTQB Chương 4.3 (trang 87-105):
- **Equivalence Partitioning (EP - Mục 4.3.1):** Chia miền dữ liệu thành các lớp tương đương; chọn giá trị đại diện cho mỗi lớp để giảm thiểu số lượng test case mà vẫn đảm bảo độ bao phủ.
- **Boundary Value Analysis (BVA - Mục 4.3.1):** Áp dụng phương pháp 2 giá trị (two-value approach) tại biên hợp lệ và biên không hợp lệ liền kề.
- **Decision Table Testing (Mục 4.3.2):** Lập bảng kết hợp các điều kiện logic phức tạp thành các cột quy tắc nghiệp vụ (Rules).
- **State Transition Testing (Mục 4.3.3):** Xây dựng sơ đồ trạng thái, lập bảng chuyển đổi trạng thái (State Table) để phát hiện các chuyển đổi không hợp lệ (Invalid transitions).

---

## 4. TEST IDENTIFICATION (Danh mục Điều kiện Kiểm thử - Test Conditions)

| Test Condition ID | Mô tả điều kiện kiểm thử | Nguồn SRS v3.11.0 / Code Basis | Kỹ thuật áp dụng | Mức rủi ro | Độ ưu tiên |
| :---: | :--- | :---: | :---: | :---: | :---: |
| **TCND-01** | Kiểm tra định dạng địa chỉ Email hợp lệ/không hợp lệ | CODE-UTIL-EMAIL (Tiện ích mức mã nguồn) | EP | Medium | P2 |
| **TCND-02** | Tự gom kho bàn giao theo tập `person_id` chuẩn hóa | SETUP-05, ASSET-04, AC-01 | EP | High | P1 |
| **TCND-03** | Xác định quyền xóa kho nguồn theo gói dịch vụ | OPLAN-05, OPLAN-08, AC-20, AC-29, AC-30 | EP | High | P1 |
| **TCND-04** | Tính mốc xóa kho nguồn `deletion_eligible_at` | OPLAN-05, AC-20, AC-31 | BVA | High | P1 |
| **TCND-05** | Tính thời hạn suy nghĩ lại 2 năm có ngày nhuận 29/02 | TIME-01, AC-35, AC-36 | BVA | Critical | P1 |
| **TCND-06** | Biên số lượng tài sản tối thiểu để kích hoạt kế hoạch | SETUP-01 | BVA | High | P1 |
| **TCND-07** | Thẩm định đa điều kiện kích hoạt Kế hoạch di sản | SETUP-01, AC-06 | Decision Table | Critical | P1 |
| **TCND-08** | Bắt buộc 2 xác nhận cam kết trách nhiệm trước bàn giao | DEATH-02, DEATH-04, AC-12 | Decision Table | Critical | P1 |
| **TCND-09** | Xử lý Webhook SePay: Idempotency và thời hạn 15 phút | PAY-02, PAY-03, AC-18 | Decision Table | High | P1 |
| **TCND-10** | Vòng đời chuyển quyền 1:1 và khóa cứng khi bắt đầu | REDIST-01 -> REDIST-06, AC-03..07 | State Transition | Critical | P1 |
| **TCND-11** | Vòng đời đồng thuận và đóng băng 2 năm kho đồng sở hữu | AC-09, AC-10, AC-35, AC-37 | State Transition | High | P1 |
| **TCND-12** | Quy tắc 3 người độc lập: Owner, Executor, Verifier | ASSIGN-06, AC-05 | Decision Table / White-box | High | P1 |
| **TCND-13** | Cơ chế mã hóa phong bì AES-256-GCM | SEC-01, SEC-02, SEC-03 | White-box / MC-DC | Critical | P1 |
| **TCND-14** | Vòng đời cứu hộ Time-Lock Delay 2 bước | STATE_MACHINES.md Sec 5 | State Transition | High | P1 |

---

## 5. CHI TIẾT PHÂN TÍCH KỸ THUẬT BLACK-BOX (CHƯƠNG 4.3)

### 5.1. Phân tích Phân vùng tương đương (Equivalence Partitioning - EP)

#### Bảng EP-01: Định dạng địa chỉ Email (RFC 5322)
| Mã phân vùng | Loại phân vùng | Miền giá trị / Quy tắc | Giá trị đại diện | Kết quả mong đợi |
| :---: | :---: | :--- | :--- | :---: |
| **EP-EM-01** | Hợp lệ | Chuỗi có user, ký tự `@`, domain và TLD | `valid.owner@legacyvault.vn` | `true` |
| **EP-EM-02** | Hợp lệ | Chuỗi email có tag dấu `+` | `test.user+tag@domain.co` | `true` |
| **EP-EM-03** | Không hợp lệ | Thiếu ký tự `@` | `invalidemail.without.at` | `false` |
| **EP-EM-04** | Không hợp lệ | Thiếu domain hợp lệ sau `@` | `user@domain_no_dot` | `false` |
| **EP-EM-05** | Không hợp lệ | Chuỗi rỗng | `""` | `false` |
| **EP-EM-06** | Không hợp lệ | Chuỗi chỉ chứa khoảng trắng | `"   "` | `false` |
| **EP-EM-07** | Không hợp lệ | Giá trị null | `null` | `false` |

#### Bảng EP-02: Phân vùng tập người nhận khi tự gom kho bàn giao (`ASSET-04`, `AC-01`)
| Mã phân vùng | Loại phân vùng | Miền giá trị | Giá trị đại diện | Hành vi mong đợi của hệ thống |
| :---: | :---: | :--- | :--- | :--- |
| **EP-REC-01** | Không hợp lệ / Chưa gán | Số người nhận = 0 | `RecipientPersonIds = {}` | Ghi nhận `NOT_IN_ESTATE_PLAN`; không tạo kho bàn giao. |
| **EP-REC-02** | Hợp lệ (Đơn) | Số người nhận = 1 | `RecipientPersonIds = { P1 }` | Tạo kho chế độ `SINGLE_RECIPIENT`; cho phép chuyển quyền 1:1. |
| **EP-REC-03** | Hợp lệ (Đồng sở hữu)| Số người nhận $\ge 2$ | `RecipientPersonIds = { P1, P2 }` | Tạo kho chế độ `CO_OWNED`; cấm chuyển quyền; cần 100% đồng thuận. |

---

### 5.2. Phân tích Giá trị biên (Boundary Value Analysis - BVA)

#### Bảng BVA-01: Mốc xóa kho nguồn `deletion_eligible_at = max(freeze_at + 30d, paid_plan_expires_at + 30d)`
- **Đơn vị đo lường:** Ngày (24 giờ), múi giờ UTC.
- **Ranh giới:** So sánh giữa `freeze_at` và `paid_plan_expires_at`.

| Test ID | Giá trị `freeze_at` | Giá trị `paid_plan_expires_at` | Quan hệ biên | Mốc xóa tính toán mong đợi | Giải thích |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **BVA-DEL-01** | `2026-07-01` | `2026-05-01` | `freeze_at > paid_plan_expires_at` | `2026-07-31` | Lấy `freeze_at + 30 ngày`. |
| **BVA-DEL-02** | `2026-04-01` | `2026-08-01` | `freeze_at < paid_plan_expires_at` | `2026-08-31` | Lấy `paid_plan_expires_at + 30 ngày`. |
| **BVA-DEL-03** | `2026-06-01` | `2026-06-01` | `freeze_at == paid_plan_expires_at`| `2026-07-01` | Hai mốc trùng nhau; cộng 30 ngày. |

#### Bảng BVA-02: Thời hạn suy nghĩ lại 2 năm lịch có ngày nhuận 29/02 (`TIME-01`)
- **Quy tắc:** Đúng 2 năm lịch từ ngày đóng băng `freeze_started_at`.
- **Ranh giới đặc thù:** Ngày 29/02 năm nhuận (2024). Năm đích 2026 không có ngày 29/02.

| Test ID | Thời điểm đóng băng (`freeze_started_at`) | Ranh giới kiểm thử | Kết quả mong đợi (`freeze_expires_at`) |
| :---: | :---: | :---: | :---: |
| **BVA-LEAP-01**| `2024-02-29 14:30:00 UTC` | Ngày nhuận 29/02 sang năm không nhuận (+2 năm) | `2026-02-28 14:30:00 UTC` (Không phát sinh crash) |
| **BVA-LEAP-02**| `2026-09-28 10:00:00 UTC` | Ngày thông thường | `2028-09-28 10:00:00 UTC` (+2 năm lịch) |

---

### 5.3. Phân tích Bảng quyết định (Decision Table Testing)

#### Bảng DT-01: Kích hoạt Kế hoạch di sản (`SETUP-01`)
Căn cứ SRS v3.11.0 dòng 80:

| Điều kiện (Conditions) | R1 | R2 | R3 | R4 | R5 | R6 | R7 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **C1:** Gói trả phí hợp lệ (Legacy XS / XS Max) | **T** | **F** | **T** | **T** | **T** | **T** | **T** |
| **C2:** Gói dịch vụ chưa hết hạn (`now < PlanExpiresAt`) | **T** | — | **F** | **T** | **T** | **T** | **T** |
| **C3:** Chủ sở hữu đã xác thực MFA | **T** | — | — | **F** | **T** | **T** | **T** |
| **C4:** Người thực thi (Executor) chính đã chấp nhận | **T** | — | — | — | **F** | **T** | **T** |
| **C5:** Có $\ge 1$ tài sản được chỉ định hợp lệ | **T** | — | — | — | — | **F** | **T** |
| **C6:** Có kế hoạch khác đang hoạt động (`hasOtherActivePlan`)| **F** | — | — | — | — | — | **T** |
| **Hành động (Actions)** | | | | | | | |
| **A1:** Kích hoạt thành công (`IsSuccess = true`) | **X** | | | | | | |
| **A2:** Lỗi `ERR_PLAN_TIER_NOT_ELIGIBLE` | | **X** | | | | | |
| **A3:** Lỗi `ERR_PLAN_EXPIRED` | | | **X** | | | |
| **A4:** Lỗi `ERR_MFA_REQUIRED` | | | | **X** | | |
| **A5:** Lỗi `ERR_EXECUTOR_NOT_ACCEPTED` | | | | | **X** | |
| **A6:** Lỗi `ERR_SETUP_NO_RECIPIENT_DESIGNATED` | | | | | | **X** |
| **A7:** Lỗi `ERR_ANOTHER_PLAN_ACTIVE` | | | | | | | **X** |
| **Test Case ID tương ứng** | `TC_DT01_R1` | `TC_DT01_R2` | `TC_DT01_R3` | `TC_DT01_R4` | `TC_DT01_R5` | `TC_DT01_R6` | `TC_DT01_R7` |

#### Bảng DT-02: Hai cam kết trách nhiệm trước bàn giao (`DEATH-02`, `AC-12`)
| Điều kiện (Conditions) | R1 | R2 | R3 | R4 |
| :--- | :---: | :---: | :---: | :---: |
| **C1:** Executor đã tick ô cam kết trách nhiệm pháp lý | **T** | **T** | **F** | **F** |
| **C2:** Verifier đã tick ô cam kết trách nhiệm pháp lý | **T** | **F** | **T** | **F** |
| **Hành động (Actions)** | | | | |
| **A1:** Cho phép phê duyệt (`APPROVED_FOR_DELIVERY`) | **X** | | | |
| **A2:** Chặn phê duyệt (`ERR_DEATH_ATTESTATION_REQUIRED`) | | **X** | **X** | **X** |
| **Test Case ID tương ứng** | `TC_DT02_R1` | `TC_DT02_R2` | `TC_DT02_R3` | `TC_DT02_R4` |

---

### 5.4. Phân tích Chuyển đổi trạng thái (State Transition Testing)

#### Sơ đồ & Bảng trạng thái ST-01: Vòng đời Lựa chọn chuyển quyền 1:1 (`REDIST-01 -> REDIST-06`)
- Các trạng thái:
  - `S1 (ACTIVE)`: Đang có một lựa chọn chuyển hợp lệ.
  - `S2 (REPLACED)`: Đã đổi sang người nhận đích khác.
  - `S3 (CANCELLED)`: Đã hủy chuyển quyền, quay về người nhận gốc.
  - `S4 (FINALIZED)`: Khóa cứng bất biến khi Executor bấm "Bắt đầu bàn giao".

#### Bảng trạng thái (State Table) - Bao gồm kiểm thử chuyển trạng thái bị cấm:
| Trạng thái hiện tại | Sự kiện: Chọn đích mới (Người trong snapshot) | Sự kiện: Hủy chuyển quyền | Sự kiện: Executor bấm Bắt đầu | Sự kiện: Cố đổi đích khi đã bắt đầu |
| :--- | :---: | :---: | :---: | :---: |
| **S1 (ACTIVE)** | `S2 (REPLACED)` | `S3 (CANCELLED)` | `S4 (FINALIZED)` | — (Không thể xảy ra) |
| **S2 (REPLACED)**| `S2 (REPLACED)` | `S3 (CANCELLED)` | `S4 (FINALIZED)` | — (Không thể xảy ra) |
| **S3 (CANCELLED)**| `S1 (ACTIVE)` | `—` | `S4 (FINALIZED)` | — (Không thể xảy ra) |
| **S4 (FINALIZED)**| `— (BỊ CẤM)` | `— (BỊ CẤM)` | `— (Đã chạy)` | **LỖI: ERR_HANDOVER_FINALIZED_LOCKED** |

> [!NOTE]
> Bảng trạng thái trên chỉ rõ các ô bị gạch ngang `—` là **Invalid Transitions (Chuyển trạng thái bị cấm)**. Khi hệ thống ở `S4 (FINALIZED)`, mọi thao tác cố tình gọi API chuyển quyền đều phải bị từ chối với mã lỗi `ERR_HANDOVER_FINALIZED_LOCKED`.

#### Sơ đồ & Bảng trạng thái ST-02: Vòng đời Đồng thuận & Đóng băng 2 năm kho đồng sở hữu (`TCND-11`, `AC-09`, `AC-10`, `AC-35`, `AC-37`)
- **Các trạng thái:**
  - `S_PENDING (PENDING_RESPONSE)`: Chờ người nhận phản hồi. Cửa sổ phản hồi ban đầu là 7 ngày (168 giờ) kể từ `handover_started_at`.
  - `S_FROZEN (FROZEN_RECONSIDERATION)`: Nếu có ít nhất một người bấm **Từ chối (`REJECTED`)** HOẶC **hết 7 ngày không phản hồi**, kho chuyển sang đóng băng suy nghĩ lại trong đúng **2 năm lịch (Calendar Years)** per `AC-10`, `AC-35`.
  - `S_COMMITTED (HANDOVER_COMMITTED)`: Chỉ khi **100% người đồng sở hữu đều bấm Nhận (`ACCEPTED`)** (dù đồng thuận ngay trong 7 ngày hay đổi ý trong 2 năm đóng băng).
  - `S_CANCELLED (CANCELLED_WITHOUT_DELIVERY)`: Khi **hết trọn vẹn 2 năm lịch** (`now >= freeze_expires_at`) mà chưa đạt đủ 100% đồng thuận nhận bàn giao (`AC-36`).
- **Quy tắc đổi ý (Reconsideration Rule):** Trong suốt 2 năm đóng băng, người nhận hoặc người từ chối **VẪN CÓ QUYỀN** đổi ý bấm Nhận tài sản (`AC-34`, `AC-35`, `AC-37`). Hệ thống tuyệt đối KHÔNG hủy kho ngay khi hết 7 ngày!

| Trạng thái hiện tại | Sự kiện: Đủ 100% người bấm Nhận | Sự kiện: Có 1 người bấm Từ chối | Sự kiện: Hết 7 ngày chưa phản hồi | Sự kiện: Đổi ý sang Nhận (trong 2 năm) | Sự kiện: Hết 2 năm lịch |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **S_PENDING** | `S_COMMITTED` | `S_FROZEN` (Ghi `FreezeStartedAt`) | `S_FROZEN` (Ghi `FreezeStartedAt`) | — (Đang ở giai đoạn 7 ngày) | — |
| **S_FROZEN** | — (Đã đóng băng) | Giữ `S_FROZEN` | Giữ `S_FROZEN` | Đạt 100% $\to$ `S_COMMITTED` | `S_CANCELLED` |
| **S_COMMITTED** | Đã phát hành grant | — (Bị chặn) | — (Đã cam kết) | — | — |
| **S_CANCELLED** | — (Đã kết thúc) | — | — | — (Hết hạn 2 năm) | — (Đã hủy) |
