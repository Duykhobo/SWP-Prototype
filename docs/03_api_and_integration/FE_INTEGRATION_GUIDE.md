# HƯỚNG DẪN TÍCH HỢP & PHÁT TRIỂN DÀNH CHO FRONTEND (FE INTEGRATION GUIDE)
## DỰ ÁN: LEGACYVAULT — HỆ THỐNG LƯU GIỮ VÀ BÀN GIAO TÀI SẢN SỐ
### Phiên bản: Chuẩn Hóa Theo SRS v3.11.0 (26/09/2026) — Chuẩn FSD (Feature-Sliced Design) & React 19 / Vite / TypeScript

---

## 1. TỔNG QUAN KIẾN TRÚC & NGUYÊN TẮC FRONTEND BẮT BUỘC

Toàn bộ mã nguồn Frontend tại thư mục `client/src/` tuân thủ nghiêm ngặt các nguyên tắc sau:

### 1.1. Cấu Trúc Phân Tầng Feature-Sliced Design (FSD)
Quy tắc phụ thuộc 1 chiều: **Tầng dưới TUYỆT ĐỐI KHÔNG ĐƯỢC PHÉP import từ các tầng trên nó (`app` $\rightarrow$ `pages` $\rightarrow$ `widgets` $\rightarrow$ `features` $\rightarrow$ `entities` $\rightarrow$ `shared`). Cấm import chéo giữa các `features`.**

```
client/src/
├── app/        # Global Providers (QueryClientProvider, RouterProvider, Redux Provider), ErrorBoundary, styles/index.css
├── pages/      # Ghép nối Widgets & Features thành các trang màn hình hoàn chỉnh. Không chứa logic nghiệp vụ thô.
├── widgets/    # Khối giao diện lớn độc lập: AppHeader, AppSidebar, VaultAssetTable, DmsStatusWidget, CaseReviewPanel.
├── features/   # Nghiệp vụ theo từng tính năng riêng biệt:
│   ├── auth/                    # Đăng nhập, đăng ký, OTP demo, chuyển đổi ngữ cảnh vai trò (X-Active-Role UI).
│   ├── asset-vault/             # Quản lý tài sản số, upload file qua Backend mã hóa (LegalDropzone).
│   ├── direct-designation/      # Chỉ định người nhận trực tiếp cho từng file, tự động gom HandoverVaults.
│   ├── executor-assignment/     # Phân công Người thực thi (Executor), quản lý trạng thái bổ nhiệm.
│   ├── dms-heartbeat/           # Điểm danh Dead Man's Switch, đồng hồ kiểm thử Simulated Clock (Dev/Demo).
│   ├── case-review/             # Executor nộp hồ sơ (Cam kết pháp lý 1), Verifier thẩm định (Cam kết pháp lý 2).
│   ├── handover-execution/      # Lịch bàn giao chung toàn hồ sơ (HandoverSchedules), Executor kích hoạt bàn giao.
│   ├── beneficiary-decision/    # Cửa sổ 7 ngày Nhận/Từ chối, 2 năm suy nghĩ lại, tải file stream giải mã.
│   ├── personal-vault/          # Lưu tài sản vào kho cá nhân (kiểm tra hạn mức quota).
│   ├── owner-rescue/            # Cứu hộ Owner "Tôi còn sống" (AliveClaim) khi nghi gian lận / nhầm lẫn.
│   └── payment-vietqr/          # Đăng ký gói (OWNER_FREE, LEGACY_XS, LEGACY_XS_MAX, RECIPIENT_FREE, RECIPIENT_PLUS), SePay VietQR modal.
├── entities/   # Mô hình thực thể & hooks dùng chung (User, Person, Asset, Case, HandoverVault, SubscriptionPlan).
└── shared/     # Thành phần dùng chung (api/axiosClient, ui-kit Heritage components, types, constants, config).
```

### 1.2. Nguyên Tắc An Toàn Mật Mã & Quản Lý Tệp Tin (Client-side)

1. **Upload File Qua Backend API (Server-Side Envelope Encryption):**
   - File nhị phân (tối đa 20 MiB) được gửi trực tiếp lên Backend qua `multipart/form-data` tại `POST /api/v1/assets/upload`.
   - Backend chịu trách nhiệm kiểm tra MIME thực tế, tính hash SHA-256, sinh khóa DEK, mã hóa AES-256-GCM rồi đẩy ciphertext lên Cloudflare R2 / S3.
   - Frontend không tải file trực tiếp lên R2 và không nắm giữ khóa mã hóa Master Key.
2. **Tải Tệp Tin An Toàn & Bộ Nhớ RAM-Only (`DEL-02`):**
   - Khi Người nhận bấm tải file: Frontend gọi `GET /api/v1/handover-vaults/{id}/assets/{assetId}/download`.
   - Nhận nhị phân (`responseType: 'blob'`) đã được Backend giải mã sẵn trong RAM qua đường truyền TLS 1.3 an toàn.
   - Tạo Blob URL ngắn hạn: `const url = URL.createObjectURL(blob);`.
   - Kích hoạt tải về tự động và bắt buộc gọi `URL.revokeObjectURL(url)` ngay sau khi hoàn tất hoặc khi unmount component.
   - **Tải tệp hoàn toàn miễn phí, không bị giới hạn bởi quota kho cá nhân.**
3. **Tuyệt Đối Không Lưu Dữ Liệu Nhạy Cảm Vào Storage:**
   - Không lưu Token, mật khẩu thô, CCCD hoặc nội dung giải mã vào `localStorage` hay `sessionStorage`.
   - Access Token lưu trong Redux RAM Store. Refresh Token do trình duyệt quản lý qua HttpOnly Cookie.

### 1.3. Nguyên Tắc Zero Hardcoding

- **HTTP Status:** Luôn dùng `HTTP_STATUS` (`HTTP_STATUS.OK`, `HTTP_STATUS.UNAUTHORIZED`, `HTTP_STATUS.FORBIDDEN`...).
- **Trạng thái Entity:** Dùng hằng số từ `@/shared/constants` (`VAULT_STATUS`, `DMS_STATUS`, `CASE_STATUS`, `DECISION_STATUS`...).
- **Thông điệp:** Dùng `APP_MESSAGES` (`APP_MESSAGES.SUCCESS.CREATE`, `APP_MESSAGES.ERROR.NETWORK`...).
- **Biến môi trường:** Truy xuất duy nhất qua `@/shared/config/env.ts` (`ENV.API_BASE_URL`).

### 1.4. Phân Định & Cô Lập Trạng Thái & Quản Lý Luồng Dữ Liệu

1. **Server State (TanStack Query v5):**
   - Quản lý toàn bộ dữ liệu từ API (`useVaults`, `useAssets`, `useCaseDetails`, `useHandoverVaults`, `useSubscriptionPlans`).
   - **Chiến lược Polling Đơn Hàng Thanh Toán:** CHỈ bật `refetchInterval: 3000` khi Modal thanh toán đang mở và đơn hàng còn ở trạng thái `PENDING`. Dừng poll ngay lập tức khi thanh toán thành công (`PAID`), hết hạn/hủy (`EXPIRED`/`CANCELLED`), hoặc khi người dùng đóng modal.
   - **Chiến lược DMS Heartbeat:** Không cần poll liên tục vì hạn điểm danh thay đổi theo chu kỳ dài (30/90/180 ngày). Chỉ cần invalidate query sau khi người dùng thực hiện điểm danh thành công trên server.
2. **Form State (React Hook Form + Zod):**
   - Quản lý toàn bộ form nhập liệu (Tài sản, chỉ định, nộp hồ sơ, cam kết pháp lý).
   - **Nguyên tắc phân định:** Validation Zod ở Client chỉ là lớp phòng thủ bề mặt (defense-in-depth) tối ưu UX, **tuyệt đối không thay thế kiểm tra nghiệp vụ và phân quyền Zero-Trust tại Backend**.
   - **Hai ô cam kết pháp lý độc lập:** Cam kết pháp lý ("Tôi chịu trách nhiệm trước pháp luật") thuộc **hai thời điểm khác nhau và hai chủ thể hoàn toàn khác nhau**: Executor khi nộp hồ sơ (`DeathClaim` tại `POST /api/v1/cases/{id}/submit`), Verifier khi phê duyệt thẩm định (`VerifyClaim` tại `POST /api/v1/cases/{id}/adjudicate`).
3. **URL State (`useSearchParams`):** Quản lý Tabs, Bộ lọc, Phân trang và Modal query (`?tab=assets&caseId=cs_01`).
4. **Global Client State (Redux Toolkit):** Quản lý phiên đăng nhập, vai trò ngữ cảnh (`currentRole`), chế độ demo (`demoMode`), theme.
5. **Local Ephemeral UI State (useState):** Đóng/mở dropdown, toggle hiển thị mật khẩu, preview ảnh tạm thời.

### 1.5. CẤM OPTIMISTIC UI CHO CÁC THAO TÁC PHÁP LÝ & NHẠY CẢM

Tuân thủ Hard Rules: **Cấm dùng Optimistic UI** cho các thao tác pháp lý:
- Điểm danh Dead Man's Switch (DMS).
- Nộp hồ sơ và ký cam kết pháp lý của Executor.
- Duyệt/Từ chối hồ sơ và ký cam kết pháp lý của Verifier.
- Nộp cứu hộ "Tôi còn sống" (AliveClaim).
- Quyết định Chấp nhận/Từ chối nhận di sản (7 ngày/2 năm).
- Đăng ký gói cước và thanh toán.

Mọi thao tác bắt buộc hiển thị theo chu trình rõ ràng: `Idle` $\rightarrow$ `Submitting (Disabled Button + Spinner)` $\rightarrow$ `Server Confirmed` $\rightarrow$ `Success Feedback`.

### 1.6. Tuân Thủ An Ninh Theo Chuẩn OWASP Cheat Sheet Series

- **Zero-Trust Authorization trên từng Request:** Ẩn nút trên Frontend không bảo vệ được API tải file hay thao tác nghiệp vụ. Backend bắt buộc kiểm tra phân quyền trên **mọi request** độc lập với giao diện.
- **CSRF & XSS Prevention:** Không chèn HTML thô (`dangerouslySetInnerHTML`), mã hóa đầu ra, sử dụng HttpOnly Secure SameSite Cookie cho Refresh Token.
- **Vòng đời RAM-Only & Thu Hồi URL Tạm:** Khi tải file giải mã, bắt buộc gọi `URL.revokeObjectURL` ngay sau khi tải hoàn tất hoặc khi unmount component. Trì hoãn tích hợp các thư viện nén client-side (như `browser-image-compression`, `pdf-lib`) đến khi hoàn thiện đặc tả dọn dẹp bộ nhớ RAM và sandbox trình duyệt.

---

## 2. QUẢN LÝ PHIÊN XÁC THỰC & AXIOS INTERCEPTOR

```
[User Action] ──> [Đăng nhập / OTP Demo] ──> [POST /api/v1/auth/login]
                                                     │
┌───────────────────────────────────────────────────┴────────────────────────┐
│ Trả về:                                                                    │
│ 1. Access Token (15 phút) ──> Lưu trữ trong RAM (Redux authSlice)          │
│ 2. Refresh Token (7 ngày) ──> Backend tự ghi vào HttpOnly Cookie           │
└────────────────────────────────────────────────────────────────────────────┘
```

#### Quy tắc Interceptor của Axios (`@/shared/api/axiosClient.ts`):

1. **Request Interceptor:** Tự động đính kèm:
   - `Authorization: Bearer <AccessToken>` (lấy từ RAM Redux).
   - `X-Correlation-ID: crypto.randomUUID()`.
   - `X-Active-Role: <currentRole>` (Ngữ cảnh giao diện hiện tại).
   - `X-Demo-Mode: true` (khi bật cờ kiểm thử).
2. **Response Interceptor:** Khi nhận phản hồi `HTTP 401 (UNAUTHORIZED)`:
   - Tự động gọi `POST /api/v1/auth/refresh` (trình duyệt tự gửi HttpOnly Cookie kèm theo).
   - Nếu cấp lại thành công: Cập nhật Access Token mới vào Redux RAM và thực thi lại request bị tạm dừng.
   - Nếu thất bại: Xóa session và chuyển hướng người dùng về trang `/login`.

---

## 3. THIẾT KẾ DESIGN SYSTEM & GIAO DIỆN CHUẨN UI KIT (HERITAGE THEME)

Mọi màn hình và component bắt buộc tuân thủ bảng màu **Heritage Forest & Champagne Gold**:

### 3.1. Bảng Mã Màu CSS Chuẩn

```css
:root {
  --bg-canvas: #EFECE6;        /* Nền canvas trung tính ấm */
  --surface: #FAF9F5;          /* Nền thẻ Card, Form, Container */
  --primary: #0B291E;          /* Heritage Forest Green chủ đạo */
  --primary-hover: #133E2F;
  --primary-light: #E5EDE8;
  --gold: #B88E4C;             /* Champagne Gold điểm nhấn trang trọng */
  --gold-hover: #A07839;
  --gold-light: #FBF7EE;
  --gold-border: #E8DCC6;
  --text-main: #14241C;        /* Chữ văn bản chính */
  --text-muted: #66786E;       /* Chữ chú thích, thứ cấp */
  --border-ui: #DCD9D0;        /* Viền phân cách mỏng 1px */
  --danger: #D9534F;           /* Đỏ cảnh báo gian lận / lỗi */
  --success: #059669;          /* Xanh nhịp tim DMS / thành công */
}
```

### 3.2. Chuẩn Mực Giao Diện 4 Trạng Thái (State-Driven UI)

Mọi component nạp dữ liệu bất đồng bộ bắt buộc xử lý đủ 4 trạng thái:
1. `isLoading`: Render `<Skeleton />` có kích thước tương đương component thật.
2. `isError`: Hiển thị `<ErrorAlert message={...} onRetry={refetch} />`.
3. `isEmpty`: Hiển thị `<EmptyState icon={...} title="Chưa có dữ liệu" action={<Button .../>} />`.
4. `isSuccess`: Hiển thị giao diện hoàn chỉnh với hiệu ứng `transition-all duration-300`.

---

## 4. CHI TIẾT 6 LINH KIỆN NGHIỆP VỤ CỐT LÕI (SRS v3.11.0)

---

### LINH KIỆN 1: LEGAL DROPZONE (TẢI TỆP LÊN BACKEND MÃ HÓA)

- **Vị trí:** `features/asset-vault/ui/LegalDropzone.tsx`.
- **Chức năng:** Kéo thả tệp tin ảnh hoặc tài liệu $\le$ 20 MiB.
- **Xử lý:**
  - Kiểm tra dung lượng và định dạng cho phép (PDF, PNG, JPG, DOCX).
  - Gửi request `multipart/form-data` lên `POST /api/v1/assets/upload`.
  - Hiển thị thanh tiến trình tải lên, trạng thái mã hóa server và nhận lại metadata an toàn.

---

### LINH KIỆN 2: DIRECT DESIGNATION & PRE-BUNDLED HANDOVER VAULTS

- **Vị trí:** `features/direct-designation/ui/DirectDesignationForm.tsx`.
- **Chức năng:**
  - Chọn một hoặc nhiều Người nhận (`Beneficiary`) từ danh bạ cho từng tài sản.
  - **Quy tắc vàng:** **Tuyệt đối không có ô nhập tỷ lệ phần trăm (%) hay chia sẻ mảnh khóa Shamir**.
  - Hiển thị trực quan việc hệ thống tự động gom nhóm thành:
    - **Kho Một Người (`SINGLE_RECIPIENT`)**: Nếu tài sản chỉ trao cho 1 người duy nhất.
    - **Kho Đồng Sở Hữu (`CO_OWNED`)**: Nếu tài sản được trao cho từ 2 người trở lên cùng nhận bản sao toàn vẹn.

---

### LINH KIỆN 3: DMS HEARTBEAT & SIMULATED CLOCK CARD

- **Vị trí:** `features/dms-heartbeat/ui/DmsHeartbeatCard.tsx`.
- **Chức năng:**
  - Hiển thị chấm trạng thái nhịp tim (pulse-dot) xanh nhấp nháy báo hiệu trạng thái hoạt động của Owner.
  - Hiển thị hạn điểm danh kế tiếp và chu kỳ (30 ngày, 90 ngày, 180 ngày).
  - Nút bấm **"⚡ Điểm danh / Tôi Còn Sống"** (chờ xác nhận từ Server, không dùng Optimistic UI) gọi `POST /api/v1/dms/checkin`.
  - **Simulated Clock Slider** (chỉ hiển thị ở môi trường Dev/Demo khi `EnableSimulatedClock = true`): Cho phép tua nhanh thời gian kiểm thử để kho chuyển sang `WARNING_PENDING`, `GRACE_PERIOD` và `FROZEN_INACTIVITY`.

---

### LINH KIỆN 4: HAI Ô CAM KẾT PHÁP LÝ ĐỘC LẬP (`DEATH-02`)

- **Vị trí:**
  - `features/case-review/ui/ExecutorSubmitModal.tsx` (Cam kết pháp lý 1).
  - `features/case-review/ui/VerifierAdjudicateModal.tsx` (Cam kết pháp lý 2).
- **Chức năng:**
  - Bắt buộc tích chọn checkbox cam kết pháp lý: *"Tôi cam kết bằng danh dự và chịu trách nhiệm trước pháp luật về tính xác thực của tài liệu chứng tử..."*.
  - Tự động điền họ tên, số định danh CCCD và ghi nhận IP Address khi submit qua `POST /api/v1/cases/{id}/submit` hoặc `POST /api/v1/cases/{id}/adjudicate`.
  - Bắt buộc gắn đúng `DeathCertificateVersionId`.

---

### LINH KIỆN 5: BÀN GIAO & CỬA SỔ QUYẾT ĐỊNH CỦA NGƯỜI NHẬN (`DEL-04`, `DEL-05`)

- **Vị trí:** `features/beneficiary-decision/ui/BeneficiaryDecisionModal.tsx`.
- **Chức năng:**
  - Hiển thị đếm ngược 7 ngày quyết định ban đầu (`InitialResponseDueAt = handover_started_at + 168 giờ`).
  - Nút **"Chấp nhận di sản"**: Mở quyền tải tệp tin và lưu vào kho cá nhân.
  - Nút **"Từ chối di sản"**: Xác nhận từ chối, kích hoạt đóng băng `FreezeStartedAt`.
  - **Cửa sổ 2 năm đóng băng (`FreezeExpiresAt = FreezeStartedAt + 2` năm):**
    - Áp dụng cho cả người **đã từ chối (`REJECTED`)** LẪN người **chưa phản hồi (`EXPIRED`)**.
    - Ranh giới thời gian (`TIME-01`): Cho phép gửi `POST /api/v1/handover-vaults/{id}/accept-during-freeze` khi $\text{now} < \text{FreezeExpiresAt}$. Tại đúng hạn hoặc sau đó ($\text{now} \ge \text{FreezeExpiresAt}$), hệ thống từ chối.
    - Hiển thị nút bấm **"Ký Nhận di sản (Trong hạn 2 năm)"** để khôi phục và tiếp nhận di sản hợp lệ.

---

### LINH KIỆN 6: BẢNG GIÁ 5 GÓI CƯỚC CHUẨN SRS 3.11.0 & SEPAY VIETQR MODAL

- **Vị trí:** `features/payment-vietqr/ui/VietQrPaymentModal.tsx`.
- **Chức năng:**
  - Hiển thị đúng 5 gói cước chuẩn mực theo SRS 3.11.0:
    - **Nhóm Chủ sở hữu (`OWNER`):**
      - `OWNER_FREE`: 0 đ / Vĩnh viễn (3 tài sản / 20 MiB - Lưu trữ & điểm danh, không lập di sản).
      - `LEGACY_XS`: 199.000 đ / 365 ngày (20 tài sản / 200 MiB - Lập kế hoạch di sản, bàn giao).
      - `LEGACY_XS_MAX`: 399.000 đ / 365 ngày (50 tài sản / 500 MiB - Toàn bộ quyền XS + Xuất PDF kế hoạch).
    - **Nhóm Người nhận (`RECIPIENT`):**
      - `RECIPIENT_FREE`: 0 đ / Vĩnh viễn (2 tài sản / 20 MiB - Lưu tài sản đã nhận).
      - `RECIPIENT_PLUS`: 49.000 đ / 30 ngày (10 tài sản / 200 MiB - Lưu tài sản đã nhận).
  - Hiển thị mã QR thanh toán động VietQR tự động khớp nội dung `LVxxxxxx` và số tiền.
  - Polling trạng thái đơn hàng `GET /api/v1/payment/orders/{orderId}` mỗi 3 giây (chỉ khi modal mở và đơn hàng ở trạng thái `PENDING`).

---

## 5. CHIẾN LƯỢC KIỂM THỬ ĐA TẦNG (TESTING ARCHITECTURE)

Hệ thống áp dụng 3 lớp kiểm thử độc lập:
1. **Playwright (E2E / Black-Box Testing):** Kiểm thử hành vi UI, luồng tương tác thực tế của người dùng: Chấp nhận / Từ chối / Chuyển quyền nhận kho, nộp cam kết pháp lý, mở modal thanh toán và quét mã QR.
2. **Vitest + Testing Library (Unit / Component Testing):** Kiểm thử logic xử lý tại Frontend, validation schema (Zod), hooks (`useVaults`, `useSubscriptionPlans`), Redux slices, và xử lý định dạng tiền tệ / ngày tháng.
3. **Testcontainers + SQL Server (Backend White-Box Testing):** Kiểm thử các kịch bản tranh chấp giao dịch ACID thực tế (concurrency), tính toàn vẹn snapshot khóa bộ ba, ràng buộc `UNIQUE(PersonalVaultId, AssetId)`, và xử lý webhook trùng lặp (`IdempotencyRecords`).
4. **Bộ ca thử bảo mật (Dựa trên OWASP / PayloadsAllTheThings):** Kiểm thử phòng chống đổi `vaultId`/`assetId` (IDOR), truy cập kho không thuộc snapshot, grant hết hạn, và cố tình tải chunk dữ liệu khi chưa đủ quyền.

---

## 6. BẢNG CHECKLIST KIỂM THỬ FRONTEND E2E (ACCEPTANCE CRITERIA)

- [ ] **TC-FE-01:** Kéo thả tệp tin vào LegalDropzone; upload multipart lên `POST /api/v1/assets/upload` thành công, không upload trực tiếp lên R2.
- [ ] **TC-FE-02:** Form chỉ định Người nhận tuyệt đối không có ô tỷ lệ phần trăm (%); hiển thị đúng phân loại kho `SINGLE_RECIPIENT` hoặc `CO_OWNED`.
- [ ] **TC-FE-03:** Nút "⚡ Điểm danh" hiển thị spinner và chỉ cập nhật trạng thái khi Server xác nhận (Không dùng Optimistic UI) qua `POST /api/v1/dms/checkin`.
- [ ] **TC-FE-04:** Executor nộp hồ sơ bắt buộc tích cam kết pháp lý 1 (`POST /api/v1/cases/{id}/submit`); Verifier duyệt bắt buộc tích cam kết pháp lý 2 (`POST /api/v1/cases/{id}/adjudicate`).
- [ ] **TC-FE-05:** Verifier duyệt hồ sơ mở bước hẹn lịch bàn giao chung cho toàn bộ hồ sơ; Executor đặt ngày qua `POST /api/v1/cases/{caseId}/handover-schedule`; không đặt lịch lẻ theo từng kho.
- [ ] **TC-FE-06:** Người nhận trong cửa sổ 7 ngày có thể bấm Chấp nhận hoặc Từ chối; cả người đã từ chối lẫn người chưa phản hồi đều có thể ký nhận trong 2 năm đóng băng khi $\text{now} < \text{FreezeExpiresAt}$.
- [ ] **TC-FE-07:** Tải tệp tin gọi `GET /api/v1/handover-vaults/{id}/assets/{assetId}/download` thực hiện giải mã streaming qua TLS 1.3 trực tiếp từ Backend; hoàn toàn miễn phí không trừ quota; thu hồi Blob URL ngay khi tải xong.
- [ ] **TC-FE-08:** Thao tác "Lưu vào Kho cá nhân" gọi `POST /api/v1/personal-vaults/items` kiểm tra quota theo từng tài sản với ràng buộc `UNIQUE(PersonalVaultId, AssetId)`; nếu vượt quota hiển thị modal nâng cấp gói.
- [ ] **TC-FE-09:** Modal thanh toán VietQR hiển thị đúng 5 gói cước chuẩn SRS (Owner Free, XS 199k, XS Max 399k, Recipient Free, Plus 49k) và mã QR SePay; chỉ poll `GET /api/v1/payment/orders/{orderId}` khi modal mở và order `PENDING`.
- [ ] **TC-FE-10:** Kiểm tra DevTools: Không lưu bất kỳ mật khẩu thô, Private Key hay decrypted blob vào `localStorage`/`sessionStorage`.
