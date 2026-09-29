# 🏛️ LegacyVault Master UI Kit & Complete Design System Specification

## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO TÀI SẢN SỐ
### Phiên bản: Chuẩn Hóa Theo SRS v3.11.0 (26/09/2026) — Giao Diện Trang Trọng & Tương Tác Pháp Lý Số

Tài liệu này tổng hợp toàn bộ quy chuẩn thiết kế, bảng mã màu, hiệu ứng thị giác và danh mục các thành phần giao diện (UI Components) trích xuất trực tiếp từ **Master UI Kit** của dự án **LegacyVault (SWP391)**, tuân thủ nghiêm ngặt theo SRS v3.11.0.

---

## 1. 🎨 BẢNG MÃ MÀU & THIẾT KẾ NỀN TẢNG (DESIGN TOKENS)

### 🌿 A. Nhóm Màu Chủ Đạo (Primary - Heritage Forest)
| Tên Biến Token | Mã Màu Hex | Vai Trò & Vị Trí Ứng Dụng |
| :--- | :--- | :--- |
| `--primary` | `#0B291E` | Màu thương hiệu chính: Header, Nút chính, Tiêu đề chính, Icon active |
| `--primary-hover` | `#133E2F` | Trạng thái Hover của Button/Link |
| `--primary-light` | `#E5EDE8` | Nền nhạt cho Icon container, badge trạng thái |
| `--primary-surface`| `#10382B` | Bề mặt tối sâu, trạng thái nút Pressed / Active |
| `--bg-canvas` | `#EFECE6` | Nền canvas gốc của ứng dụng (ấm áp, xúc giác tự nhiên) |
| `--surface` | `#FAF9F5` | Bề mặt Card, Form, Modal, Dropdown (sáng ngà quý phái) |

### ⚜️ B. Nhóm Màu Điểm Xuyết (Accent - Champagne Gold)
| Tên Biến Token | Mã Màu Hex | Vai Trò & Vị Trí Ứng Dụng |
| :--- | :--- | :--- |
| `--gold` | `#B88E4C` | Màu nhấn sang trọng: Logo, Viền Focus Input, Link quan trọng |
| `--gold-hover` | `#A07839` | Hover các thành phần mạ vàng |
| `--gold-light` | `#FBF7EE` | Nền thẻ chứng thực số, tem niêm phong di sản |
| `--gold-border` | `#E8DCC6` | Viền các khối chứng thực và huy hiệu cao cấp |

### 🔘 C. Nhóm Màu Trung Tính & Trạng Thái (Neutrals & Feedback)
| Tên Biến Token | Mã Màu Hex | Vai Trò & Vị Trí Ứng Dụng |
| :--- | :--- | :--- |
| `--text-main` | `#14241C` | Văn bản chính, độ tương phản cao, dễ đọc |
| `--text-muted` | `#66786E` | Văn bản phụ, chú thích, helper text |
| `--text-subtle` | `#8E9F96` | Placeholder, viền phụ, nhãn phụ |
| `--border-ui` | `#DCD9D0` | Đường kẻ phân cách, viền card |
| `DMS Active (Green)`| `#059669` | Nhịp sinh tồn DMS Pulse đang hoạt động tốt |
| `Pending / Warning (Amber)`| `#D97706` / `#FFFBEB` | Cảnh báo hạn điểm danh DMS, đếm ngược 7 ngày nhận |
| `Destructive / Error`| `#D9534F` / `#991B1B` | Nút Hủy bỏ, Từ chối di sản, Cảnh báo gian lận |

### 🌫️ D. Hệ Thống 4 Lớp Đổ Bóng Xúc Giác (Tactile Shadows & Depth Layers)
1. **Flat Base Layer**: `#EFECE6` viền `#DED9CD` (Bề mặt phẳng gốc).
2. **Raised Layer**: `#FAF9F5` kèm `box-shadow: 0 4px 12px rgba(11, 41, 30, 0.05), 0 1px 3px rgba(11, 41, 30, 0.03)` (Card nổi, Modal).
3. **Inset Layer**: `box-shadow: inset 2px 2px 5px rgba(0,0,0,0.06), inset -2px -2px 5px rgba(255,255,255,0.8)` (Vùng lõm, Khung Dropzone).
4. **Pressed Layer**: `box-shadow: inset 3px 3px 6px rgba(11, 41, 30, 0.12), inset -2px -2px 4px rgba(255,255,255,0.7)` (Nút đang nhấn).

### 📐 E. Thang Bo Góc (Radius Scale) & Độ Dày Viền (Border Scale)
* **Radius Tokens**: `4px` (Checkboxes) · `8px` (Inputs/Breadcrumbs) · `12px` (Cards/Modals) · `16px` (Banners) · `20px` (Buttons) · `24px` (Pills/Hero).
* **Border Thickness**: `1px` (Thin - Viền chuẩn) · `2px` (Regular - Viền Focus/Active) · `4px` (Thick - Thanh báo hiệu Status).

---

## 2. 🎛️ QUY CHUẨN CÁC THÀNH PHẦN ĐIỀU KHIỂN (CONTROLS & FORMS)

### 1. Nút Bấm (Button System):
* **`btn-primary`**: Nền `#0B291E`, chữ trắng, bo góc `20px`, padding `8.5px 18px`, font-size `12.5px`, font-weight `550`, bóng `0 3px 10px rgba(11,41,30,0.2)`.
* **`btn-pressed`**: Nền `#10382B`, chữ `#E2ECE6`, bóng chìm `inset 0 2px 6px rgba(0,0,0,0.3)`.
* **`btn-disabled`**: Nền `#D8D4CA`, chữ `#9C968A`, con trỏ `not-allowed`.

### 2. Custom Checkbox & Custom Radio (Chuẩn Tùy Biến):
* **Checkbox**: Kích thước `17x17px`, bo góc `4px`, viền `1.5px solid #A8A295`, nền trắng. Khi checked chuyển sang nền `#0B291E` với icon check trắng `clip-path`.
* **Radio**: Kích thước `17x17px`, bo tròn `50%`, viền `1.5px solid #A8A295`. Khi checked viền `#0B291E` và điểm tâm tròn `7px` màu `#0B291E`.

### 3. Trường Nhập Liệu (Input Fields):
* Nền `#FAF9F5`, viền `#D5D0C3`, bo góc `8px`, font chữ kế thừa, padding `8.5px 13px`.
* **Focus**: Viền vàng `#B88E4C`, bóng mở rộng `box-shadow: 0 0 0 3px rgba(184, 142, 76, 0.15)`.
* **Error**: Viền đỏ `#D9534F`, nền `#FFF9F9`, thông báo lỗi chữ đỏ font-size `10px`.

### 4. Switch & Slider:
* **Switch**: Khung `44x24px`, bo tròn `12px`, nền `#CCC7BA`. Khi active chuyển sang `#0B291E`, nút tròn trắng dịch chuyển `20px`.
* **Simulated Clock Slider**: Thanh trượt dày `5px` màu `#D2CDC1`, nút kéo tròn `16x16px` màu `#0B291E` viền trắng `2px`.

---

## 3. 🧭 ĐIỀU HƯỚNG & TIẾN TRÌNH (NAVIGATION & STEPPERS)

1. **Breadcrumbs Pill**: Thẻ điều hướng bo tròn `8px`, nền `#FAF9F5`, viền `#DDD8CB`, phân cách bằng dấu `/` (`Kế hoạch / Kho Nguồn / Bàn Giao Di Sản`).
2. **Pagination**: Nút kích thước `28x28px`, bo góc `6px`. Nút active nền `#0B291E` chữ trắng.
3. **4-Step Legal Protocol Stepper (SRS v3.11.0)**:
   - **Bước 1 — Kho Tài Sản (Asset Vault)**: Lưu giữ tệp số mã hóa AES-256-GCM.
   - **Bước 2 — Chỉ Định & Gom Kho (Direct Designation & Bundling)**: Chỉ định người nhận trực tiếp; hệ thống tự động gom thành Kho Một Người hoặc Kho Đồng Sở Hữu.
   - **Bước 3 — Lịch Bàn Giao (Handover Scheduling)**: Đặt lịch hẹn ngày bàn giao sau khi hồ sơ được duyệt.
   - **Bước 4 — Chấp Nhận & Trao Quyền (Handover Delivery)**: Cửa sổ 7 ngày quyết định Chấp nhận/Từ chối và cấp quyền tải giải mã.

---

## 4. 📊 HIỂN THỊ DỮ LIỆU & GOM KHO BÀN GIAO (SRS v3.11.0)

* **Display Card**: Kích thước chuẩn, nền `#FAF9F5`, viền `#DDD8CB`, bo góc `12px`, icon container `32x32px` màu `#E5EDE8` (`#0B291E`).
* **Kho Bàn Giao (Handover Vaults Display)**:
  - **Kho Một Người (`SINGLE_RECIPIENT`)**: Gắn nhãn *"Kho Một Người · Toàn quyền 1 bản sao toàn vẹn"*.
  - **Kho Đồng Sở Hữu (`CO_OWNED`)**: Gắn nhãn *"Kho Đồng Sở Hữu · Yêu cầu 100% người nhận đồng thuận"*.
* **Badges / Tags**:
  - `tag-sealed`: Nền `#E5EDE8`, chữ `#0B291E` (Tài sản đã niêm phong).
  - `tag-verified`: Nền `#FBF7EE`, chữ `#7D5D28` (Đã đối soát chứng tử số).
  - `tag-count`: Nền `#0B291E`, chữ trắng (Số lượng tệp trong kho).
* **Feedback Modals & Toasts**:
  - Modal xác nhận thu hồi chỉ định di sản.
  - Toast thông báo trạng thái: "Di sản đã niêm phong", "Hồ sơ duyệt: APPROVED".
  - Banner hiển thị Lịch hẹn bàn giao (`HandoverSchedules`).
  - Thanh tiến trình mã hóa Envelope phía máy chủ (Server AES-256-GCM).

---

## 5. 🏛️ BỘ 5 THÀNH PHẦN NGHIỆP VỤ ĐẶC THÙ (DOMAIN-SPECIFIC PROTOCOLS)

### 1. 🔐 Khung Hiển Thị Mật Mã & 12 Từ Khôi Phục (Seed Phrase Grid)
- Khung che giấu mật mã: Nền trắng, font `monospace`, kích thước chữ `11px`, dấu chấm ẩn mật khẩu `••••••••••••••••`, nút `👁️ Toggle` và nút `📋 Copy`.
- Lưới 12 từ khôi phục: Bố cục 3 cột (Grid 3 cols), từng hộp từ có số thứ tự màu xám và từ khóa in nghiêng.

### 2. 💓 Live Dead Man's Switch (DMS) Heartbeat Card & Niêm Phong Di Sản
- Thẻ DMS: Viền trái `4px solid #059669`, vòng tròn nhịp tim `38x38px` chứa điểm sáng `pulse-dot` hiệu ứng sóng xung nhịp CSS Keyframe `pulseAnimation` 1.6s.
- Hiển thị thời gian đếm ngược: `45 Ngày : 14 Giờ còn lại` kèm nút `⚡ Điểm danh / Tôi Còn Sống` (không dùng Optimistic UI).
- Thẻ niêm phong mật mã: Nền vàng nhạt `#FBF7EE`, viền vàng `#E8DCC6`, mã băm chuỗi bảo chứng toàn vẹn (`TAMPER-PROOF`).

### 3. 📄 Death Certificate & Legal Document Dropzone
- Vùng kéo thả viền đứt đoạn `2px dashed #C5BEAF`, nền `#FAF9F5`, bo góc `12px`.
- Kéo thả bản scan Giấy chứng tử số (PDF, JPG, PNG $\le$ 20 MiB).
- Tự động đóng dấu mã băm SHA-256 và gắn `DeathCertificateVersionId`.

### 4. ⚖️ Hai Ô Cam Kết Pháp Lý Độc Lập (`DEATH-02`)
- **Cam kết Người thực thi (`Executor Submit`)**: Checkbox bắt buộc: *"Tôi cam kết chịu trách nhiệm trước pháp luật về tính xác thực của bản scan Giấy chứng tử đính kèm."* Tự động lưu `SignerFullName`, `SignerIdentityCard` và IP Address.
- **Cam kết Người xác minh (`Verifier Adjudicate`)**: Checkbox bắt buộc: *"Tôi cam kết đã đối soát kỹ lưỡng Giấy chứng tử số và phê duyệt hồ sơ theo đúng thẩm quyền."*

### 5. 🎁 Cửa Sổ Quyết Định Người Nhận (7 Ngày & 2 Năm Suy Nghĩ Lại - `DEL-04`, `DEL-05`)
- Khung thông báo di sản sẵn sàng bàn giao viền trái vàng Gold `#B88E4C`.
- Huy hiệu đếm ngược: `⏳ Còn 06 ngày 23 giờ để đưa ra quyết định`.
- 2 nút hành động:
  - **`✓ Chấp Nhận Di Sản`** (Nền Forest Green): Cấp quyền tải file stream trực tiếp và lưu vào kho cá nhân.
  - **`✕ Từ Chối Di Sản`** (Nền Trắng viền Đỏ): Xác nhận từ chối nhận tài sản.
- Dòng chú thích pháp lý: *"Dù từ chối hoặc hết 7 ngày chưa phản hồi, bạn vẫn có quyền ký Nhận trong thời hạn đóng băng 2 năm (`FreezeExpiresAt`) theo quy chế di sản số SRS v3.11.0."*

### 6. 💳 Bảng Giá 5 Gói Dịch Vụ Chuẩn SRS v3.11.0
- **Nhóm Chủ sở hữu (Owner Vault):**
  - **`OWNER_FREE`**: 0 đ / Vĩnh viễn (3 tài sản / 20 MiB - Lưu trữ và điểm danh, không lập di sản).
  - **`LEGACY_XS`**: 199.000 đ / 365 ngày (20 tài sản / 200 MiB - Lập kế hoạch di sản, bàn giao).
  - **`LEGACY_XS_MAX`**: 399.000 đ / 365 ngày (50 tài sản / 500 MiB - Toàn bộ quyền XS + Xuất PDF kế hoạch an toàn).
- **Nhóm Người nhận (Kho cá nhân):**
  - **`RECIPIENT_FREE`**: 0 đ / Vĩnh viễn (2 tài sản / 20 MiB - Lưu tài sản đã nhận).
  - **`RECIPIENT_PLUS`**: 49.000 đ / 30 ngày (10 tài sản / 200 MiB - Lưu tài sản đã nhận).
