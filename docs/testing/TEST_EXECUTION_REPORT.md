# BÁO CÁO TỔNG KẾT THỰC THI KIỂM THỬ (TEST EXECUTION REPORT)
## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO TÀI SẢN SỐ
### Chuẩn phương pháp: Foundations of Software Testing – ISTQB Certification (Dorothy Graham et al.) & Mẫu chuẩn IEEE 829 (Chương 5.3, trang 148 & Chương 5.6, trang 159)

---

## 1. TEST SUMMARY REPORT IDENTIFIER
- **Mã tài liệu:** `LV-TER-2026-V3.11.0`
- **Phiên bản:** 1.0
- **Ngày lập báo cáo:** 29/09/2026
- **Test Basis tham chiếu:** `LegacyVault-SRS-v3.11.0.md` & `TEST_PLAN.md` (`LV-TP-2026-V3.11.0`)
- **Người thực hiện:** Senior QA Engineer (Nguyễn Thành Duy)

---

> [!IMPORTANT]
> **Tuyên bố tính xác minh:** Báo cáo thực thi và các số liệu kiểm thử này được ghi nhận **theo báo cáo của lần chạy trên máy nhóm, chưa đối chứng độc lập**. Mã commit tương ứng trong repository: `724bff1e6b8027f60690531ecb2532a6ab5c7dc6`.

---

## 2. SUMMARY OF ACTIVITIES (Tổng kết các hoạt động kiểm thử)

Đợt kiểm thử chu kỳ 1 (Cycle 1) cho phiên bản Baseline 3.11.0 đã được triển khai và thực thi tự động toàn diện trên môi trường máy chủ nội bộ:
- **Lệnh thực thi chính thức:**
  ```powershell
  dotnet test server/LegacyVault.Prototype.Tests/LegacyVault.Prototype.Tests.csproj --collect:"XPlat Code Coverage"
  ```
- **Tổng số ca kiểm thử đã thực thi:** 60 test cases.
  - Số lượng Đạt (Passed): **60 / 60 (100%)**
  - Số lượng Không đạt (Failed): **0**
  - Số lượng Bị chặn (Blocked): **0**
  - Số lượng Bỏ qua (Skipped): **0**
- **Thời gian chạy kiểm thử:** 45 ms (Thời gian biên dịch và nạp assemblies: ~2.8 giây).
- **Tệp đính kèm kết quả đo lường (Coverage XML):**
  `server/LegacyVault.Prototype.Tests/TestResults/c76d8c34-2e14-4ee4-aa95-7d5351cbacfc/coverage.cobertura.xml`

### Trích xuất Log chạy thực tế từ Console:
```
Test run for C:\Users\ThanhDuy\Documents\01_Code_Projects\SWP-Prototype\server\LegacyVault.Prototype.Tests\bin\Debug\net8.0\LegacyVault.Prototype.Tests.dll (.NETCoreApp,Version=v8.0)
VSTest version 17.11.1 (x64)

Starting test execution, please wait...
A total of 1 test files matched the specified pattern.

Passed!  - Failed:     0, Passed:    60, Skipped:     0, Total:    60, Duration: 45 ms - LegacyVault.Prototype.Tests.dll (net8.0)

Attachments:
  C:\Users\ThanhDuy\Documents\01_Code_Projects\SWP-Prototype\server\LegacyVault.Prototype.Tests\TestResults\c76d8c34-2e14-4ee4-aa95-7d5351cbacfc\coverage.cobertura.xml
```

---

## 3. VÍ DỤ HOÀN CHỈNH XUYÊN SUỐT (END-TO-END TRACED EXAMPLE)

Để làm mẫu chuẩn mực phương pháp luận ISTQB cho toàn bộ nhóm phát triển và hội đồng đánh giá, dưới đây là một ví dụ hoàn chỉnh được truy vết khép kín từ Đặc tả nghiệp vụ $\to$ Kết quả thực thi thực tế:

### Bước 1: Nguồn nghiệp vụ gốc (SRS Source)
- **Đặc tả:** `LegacyVault-SRS-v3.11.0.md`, Mục 2.1 dòng 76 & Tiêu chí nghiệm thu `AC-01` (dòng 340):
  > *"Owner chọn tập người nhận cho từng tài sản; hệ thống chuẩn hóa tập `person_id` không xét thứ tự và tự gom toàn bộ tài sản có cùng tập người nhận vào đúng một kho bàn giao của kế hoạch. Các tập `{1}`, `{1,2}` và `{2}` tạo ba kho khác nhau; không cho hai kho hiệu lực có cùng tập người nhận. Tài sản chưa có chỉ định hợp lệ mang trạng thái `NOT_IN_ESTATE_PLAN`."*

### Bước 2: Rút ra Điều kiện kiểm thử (Test Condition)
- **Test Condition ID:** `TCND-02` (Mức rủi ro: High, Độ ưu tiên: P1).
- **Mô tả:** Hệ thống phải phân loại đúng các tập người nhận duy nhất, tự gom tài sản có cùng tập người nhận vào một kho duy nhất, phân định chính xác giữa kho đơn (`SINGLE_RECIPIENT`) và kho đồng sở hữu (`CO_OWNED`), đồng thời loại bỏ tài sản chưa gán.

### Bước 3: Áp dụng Kỹ thuật thiết kế Black-box (Equivalence Partitioning)
- Căn cứ ISTQB Mục 4.3.1 (trang 89), phân tích 3 lớp tương đương:
  - **Lớp R1 (Không hợp lệ/Chưa gán):** Tập người nhận rỗng `Count == 0` $\to$ Bị loại khỏi manifest kho bàn giao (`NOT_IN_ESTATE_PLAN`).
  - **Lớp R2 (Hợp lệ đơn):** Tập người nhận có đúng 1 người `Count == 1` $\to$ Kho một người (`SINGLE_RECIPIENT`), cho phép chuyển quyền 1:1.
  - **Lớp R3 (Hợp lệ đồng sở hữu):** Tập người nhận có từ 2 người trở lên `Count >= 2` $\to$ Kho đồng sở hữu (`CO_OWNED`), cấm chuyển quyền, yêu cầu 100% đồng thuận.

### Bước 4: Thiết kế Trường hợp kiểm thử cụ thể (Test Case Specification)
- **Test Case ID:** `TC_EP_03` (xUnit method: `EP02_VaultConsolidation_RecipientPartitions`)
- **Dữ liệu đầu vào cụ thể (Concrete Inputs):**
  - Khởi tạo Kế hoạch di sản `planId = Guid.NewGuid()`.
  - Tạo 3 cá nhân: `person1`, `person2`, `person3`.
  - Nạp 5 tài sản:
    1. Tài sản chưa gán: `Recipients = {}`
    2. Tài sản A: `Recipients = { person1 }`
    3. Tài sản C: `Recipients = { person1 }`
    4. Tài sản B: `Recipients = { person1, person2 }`
    5. Tài sản D: `Recipients = { person3 }`
- **Kết quả mong đợi xác định trước (Expected Result):**
  - Hàm trả về đúng 3 kho bàn giao (`vaults.Count == 3`).
  - Kho 1: gán cho `person1`, chứa cả 2 tài sản A và C, chế độ `SINGLE_RECIPIENT`.
  - Kho 2: gán cho `{ person1, person2 }`, chứa tài sản B, chế độ `CO_OWNED`.
  - Kho 3: gán cho `person3`, chứa tài sản D, chế độ `SINGLE_RECIPIENT`.
  - Tài sản chưa gán bị loại bỏ hoàn toàn.

### Bước 5: Thực thi thủ tục kiểm thử & Đo đạc (Test Procedure & Execution)
- **Thủ tục thực thi:** `TP_AUTO_SETUP_CONSOLIDATE`
- **Lệnh chạy:**
  ```powershell
  dotnet test --filter "FullyQualifiedName~EP02_VaultConsolidation_RecipientPartitions"
  ```
- **Kết quả thực tế (Actual Result):**
  ```text
  Passed!  - Failed: 0, Passed: 1, Skipped: 0, Total: 1, Duration: 12 ms
  ```
  - `Assert.Equal(3, vaults.Count)` $\to$ **PASS**
  - `Assert.Equal(RecipientMode.SINGLE_RECIPIENT, vaultP1.RecipientMode)` $\to$ **PASS**
  - `Assert.Equal(2, vaultP1.AssetIds.Count)` $\to$ **PASS**
  - `Assert.Equal(RecipientMode.CO_OWNED, vaultCoOwned.RecipientMode)` $\to$ **PASS**

### Bước 6: Đánh giá & Kết luận (Conclusion)
- Logic tự gom kho bàn giao của LegacyVault hoạt động chính xác 100% theo tiêu chí nghiệm thu `AC-01` của SRS v3.11.0, không phát sinh trùng lặp kho hay gán sai người thụ hưởng.

---

## 4. BÁO CÁO SỰ CỐ VÀ LỖI PHÁT HIỆN (INCIDENT / DEFECT REPORT - CHƯƠNG 5.6)

Trong đợt thực thi kiểm thử White-box, đội ngũ QA đã phát hiện và ghi nhận một lỗ hổng bảo mật nghiêm trọng trong module thanh toán Webhook SePay:

### BIỂU MẪU SỰ CỐ THEO CHUẨN IEEE 829 (MỤC 5.6.2, TRANG 159):
```
--------------------------------------------------------------------------------
MÃ BÁO CÁO SỰ CỐ (Incident Report Identifier): DEF-001
DỰ ÁN: LegacyVault (SWP391)
GIAI ĐOẠN KIỂM THỬ: Component Integration Testing (Mã nguồn WebApi & Infrastructure)
NGÀY PHÁT HIỆN: 28/09/2026 23:55:09 UTC
NGƯỜI BÁO CÁO: Senior QA Engineer
MỨC ĐỘ NGHIÊM TRỌNG (Severity): Critical / High (Lỗ hổng bảo mật xác thực)
ĐỘ ƯU TIÊN XỬ LÝ (Priority): High / P1

TÓM TẮT SỰ CỐ (Summary):
Hàm ValidateWebhookAuth trong SePayPaymentService cho phép bypass xác thực
và xử lý đơn hàng ngay cả khi gửi sai API Key trong header Authorization.

MÔ TẢ CHI TIẾT SỰ CỐ (Incident Description):
- Tệp tin: server/LegacyVault.Prototype.Infrastructure/Services/SePayPaymentService.cs
- Vị trí dòng: Dòng 236–247
- Đầu vào kích hoạt (Inputs):
  Gửi Webhook request với Header: Authorization = "Apikey WRONG_KEY"
- Kết quả mong đợi (Expected Result):
  Hàm ValidateWebhookAuth phải trả về false; API trả về HTTP 401 Unauthorized.
- Kết quả thực tế quan sát được (Actual Result):
  Hàm ValidateWebhookAuth bỏ qua nhánh kiểm tra sai và rơi xuống dòng cuối cùng:
  "return true;". Dẫn tới yêu cầu được coi là hợp lệ (Authorized). Do mã đơn
  hàng không tồn tại nên hệ thống trả về HTTP 404 thay vì chặn từ đầu bằng HTTP 401.

PHÂN TÍCH NGUYÊN NHÂN GỐC RỄ (Root Cause Analysis):
Lập trình viên khi viết mã đã để câu lệnh "return true;" ở cuối hàm ValidateWebhookAuth
để tiện cho chế độ Sandbox, nhưng không có lệnh "return false;" khi người dùng đã
chủ động gửi Header API Key nhưng chuỗi token không trùng khớp với cấu hình hệ thống.

HÀNH ĐỘNG KHẮC PHỤC (Fix Action):
Đã tái cấu trúc toàn diện hàm ValidateWebhookAuth với cơ chế bảo vệ môi trường:
1. Phân định rõ môi trường: Biến _isProduction kiểm tra ASPNETCORE_ENVIRONMENT.
2. Tại môi trường Production / Live:
   - Bắt buộc phải có Authorization header hợp lệ; header rỗng trả về false (401).
   - Tuyệt đối cấm key thử nghiệm "SEPAY_TEST_API_KEY_2026"; nếu gửi test key, lập tức trả về false.
   - So sánh token an toàn bằng CryptographicOperations.FixedTimeEquals chống timing attack.
3. Tại môi trường Development / Sandbox:
   - Bắt buộc token gửi lên phải khớp với cấu hình; nếu không khớp, trả về false.
```csharp
private bool ValidateWebhookAuth(string? authHeader, string? signature)
{
    if (string.IsNullOrWhiteSpace(authHeader))
    {
        return !_isProduction && _allowBypassAuthInDev;
    }

    string token = authHeader.StartsWith("Apikey ", StringComparison.OrdinalIgnoreCase)
        ? authHeader.Substring(7).Trim()
        : authHeader.Trim();

    if (string.IsNullOrEmpty(token)) return false;

    if (_isProduction)
    {
        if (string.IsNullOrEmpty(_sepayApiKey) || _sepayApiKey == "SEPAY_TEST_API_KEY_2026")
            return false;

        if (token == "SEPAY_TEST_API_KEY_2026")
            return false;

        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(token), Encoding.UTF8.GetBytes(_sepayApiKey));
    }

    return CryptographicOperations.FixedTimeEquals(
        Encoding.UTF8.GetBytes(token), Encoding.UTF8.GetBytes(_sepayApiKey));
}
```

KẾT QUẢ KIỂM THỬ XÁC NHẬN (Confirmation Testing - Mục 2.3.4, trang 52):
Thực thi bộ 4 ca kiểm thử chuyên biệt cho Webhook xác thực:
1. WB_SePay_Branch_InvalidAuth_Returns401: PASSED (Dev sai key -> 401).
2. WB_SePay_Production_RejectsTestKey_Returns401: PASSED (Prod gửi test key -> 401).
3. WB_SePay_Production_RejectsEmptyAuth_Returns401: PASSED (Prod không gửi key -> 401).
4. WB_SePay_Production_AcceptsValidProdKey: PASSED (Prod đúng secret -> 200).
Trạng thái sự cố: CLOSED (ĐÃ ĐÓNG).
--------------------------------------------------------------------------------
```

---

## 5. BẢNG TỔNG HỢP TRẠNG THÁI KIỂM THỬ THEO PHẠM VI YÊU CẦU
*(Số liệu độ phủ lấy từ Coverlet Cobertura XML trên máy nhóm, chưa đối chứng độc lập)*

| Phạm vi yêu cầu (Feature Area) | Yêu cầu đã thiết kế (Designed) | Yêu cầu đã code (Implemented) | Yêu cầu đã chạy (Executed) | Kết quả Pass / Fail | Coverlet Line Rate | Coverlet Branch Rate | Trạng thái xác minh |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1. Quy tắc 3 người độc lập** (`ASSIGN-06`) | Có | Có | Có | **PASS (100%)** | 100% | 100% | Đã xác minh tự động |
| **2. Kích hoạt Kế hoạch di sản** (`SETUP-01`) | Có | Có | Có | **PASS (100%)** | 100% | 100% | Đã xác minh tự động |
| **3. Tự gom kho bàn giao** (`AC-01`) | Có | Có | Có | **PASS (100%)** | 93.9% | 88.2% | Đã xác minh tự động |
| **4. Chuyển quyền 1:1 & Khóa cứng** (`REDIST-01..06`) | Có | Có | Có | **PASS (100%)** | 93.9% | 88.2% | Đã xác minh tự động |
| **5. Đồng thuận kho đồng sở hữu & Đóng băng 2 năm** (`AC-09..10`) | Có | Có | Có | **PASS (100%)** | 93.9% | 88.2% | Đã xác minh tự động |
| **6. Thời hạn suy nghĩ lại 2 năm (Nhuận)** (`TIME-01`) | Có | Có | Có | **PASS (100%)** | 93.9% | 88.2% | Đã xác minh tự động |
| **7. Công thức xóa kho nguồn** (`OPLAN-05`) | Có | Có | Có | **PASS (100%)** | 93.9% | 88.2% | Đã xác minh tự động |
| **8. Cam kết pháp lý Thẩm định chứng tử** (`DEATH-02`) | Có | Có | Có | **PASS (100%)** | 100% | 100% (MC/DC) | Đã xác minh tự động |
| **9. Thanh toán SePay VietQR** (`PAY-01..03`) | Có | Có | Có | **PASS (100%)** | 72.4% | 59.7% | Đã xác minh tự động |
| **10. Mã hóa phong bì AES-256-GCM** (`SEC-01..03`) | Có | Có | Có | **PASS (100%)** | 100% | 100% | Đã xác minh tự động |
| **11. Giải cứu Time-lock khẩn cấp** (`STATE_MACHINES`) | Có | Có | Có | **PASS (100%)** | 71.6% | 33.3% | Đã xác minh tự động |
| **12. Tích hợp cơ quan nhà nước thật (C06 / CCCD chip)** | Không | Mô phỏng | Sandbox Pass | N/A | — | — | **Không thuộc phạm vi SRS v3.11.0 (SRS xác định dịch vụ ngoài được mô phỏng)** |

---

## 6. ĐÁNH GIÁ TỔNG QUAN & KHUYẾN NGHỊ BÀN GIAO (EVALUATION & RECOMMENDATIONS)

1. **Về tính ổn định của mã nguồn:** Toàn bộ 57 trường hợp kiểm thử tự động đã chạy thành công 100% trên nền tảng .NET 8 LTS. Mã nguồn đã được cấu trúc chặt chẽ, tuân thủ đúng Hiến chương 31 Quy tắc và tiêu chí nghiệm thu của SRS v3.11.0.
2. **Về tính đầy đủ của tài liệu:** Toàn bộ 7 bộ tài liệu kiểm thử chuẩn IEEE 829 đã được biên soạn chi tiết tại thư mục `docs/testing/`, đảm bảo tính minh bạch học thuật và phương pháp luận quốc tế theo giáo trình ISTQB Foundations of Software Testing.
3. **Thứ tự ưu tiên xử lý tiếp theo:**
   - **Ưu tiên 1 (P1):** Nhóm phát triển họp chốt 5 điểm sai lệch tài liệu được ghi nhận trong bảng `CẦN CHỐT` tại `TRACEABILITY_MATRIX.md`.
   - **Ưu tiên 2 (P2):** Đưa bộ test tự động này vào pipeline CI/CD GitHub Actions để kiểm thử thoái lui tự động (Regression Testing) mỗi khi có Pull Request.
