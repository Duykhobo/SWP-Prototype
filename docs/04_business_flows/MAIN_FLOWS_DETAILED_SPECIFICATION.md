# ĐẶC TẢ CHI TIẾT CÁC LUỒNG NGHIỆP VỤ CHÍNH (MAIN FLOWS SPECIFICATION)
## HỆ THỐNG QUẢN LÝ & BÀN GIAO DI SẢN SỐ LEGACYVAULT
**Dự án**: SWP391 Capstone Project (Fall 2026)  
**Tiêu chuẩn kiến trúc**: Clean Architecture .NET 8, React 19, Cloudflare R2, Google OIDC, MailKit SMTP Engine  
**Căn cứ pháp lý**: Luật Giao dịch điện tử 2023, Bộ luật Dân sự 2015, Bộ luật Tố tụng Dân sự 2015  

---

## MỤC LỤC
1. [Tổng Quan Kiến Trúc & Các Tác Nhân (Actors)](#1-tổng-quan-kiến-trúc--các-tác-nhân-actors)
2. [Main Flow 1: Xác Thực Định Danh Google OIDC & Đa Yếu Tố (MFA OTP)](#2-main-flow-1-xác-thực-định-danh-google-oidc--đa-yếu-tố-mfa-otp)
3. [Main Flow 2: Định Danh Điện Tử Công Dân eKYC FPT.AI (OCR CCCD Gắn Chip & Sinh Trắc Học)](#3-main-flow-2-định-danh-điện-tử-công-dân-ekyc-fptai-ocr-cccd-gắn-chip--sinh-trắc-học)
4. [Main Flow 3: Khởi Tạo Kho Di Sản, Phân Loại Dữ Liệu & Video Tuyên Thệ Minh Mẫn](#4-main-flow-3-khởi-tạo-kho-di-sản-phân-loại-dữ-liệu--video-tuyên-thệ-minh-mẫn)
5. [Main Flow 4: Thiết Lập Người Thụ Hưởng & Chỉ Định Người Thi Hành (Executor)](#4-main-flow-4-thiết-lập-người-thụ-hưởng--chỉ-định-người-thi-hành-executor)
6. [Main Flow 5: Mã Hóa Phong Bì (Envelope Encryption), Phân Mảnh Shamir & Lưu Trữ R2](#5-main-flow-5-mã-hóa-phong-bì-envelope-encryption-phân-mảnh-shamir--lưu-trữ-r2)
7. [Main Flow 6: Kích Hoạt Kế Hoạch & Vận Hành Giám Sát Sự Sống (Dead Man's Switch)](#6-main-flow-6-kích-hoạt-kế-hoạch--vận-hành-giám-sát-sự-sống-dead-mans-switch)
8. [Main Flow 7: Xử Lý Yêu Cầu Mở Kho Khẩn Cấp (Post-Mortem Claim) & Time-Lock Delay](#7-main-flow-7-xử-lý-yêu-cầu-mở-kho-khẩn-cấp-post-mortem-claim--time-lock-delay)
9. [Main Flow 8: Giải Mã Hợp Nhất 2/3 Shamir, Xác Minh eKYC Người Nhận & Bàn Giao Di Sản](#8-main-flow-8-giải-mã-hợp-nhất-23-shamir-xác-minh-ekyc-người-nhận--bàn-giao-di-sản)
10. [Bảng Ma Trận Ngoại Lệ & Kế Hoạch Xử Lý Lỗi Toàn Hệ Thống](#10-bảng-ma-trận-ngoại-lệ--kế-hoạch-xử-lý-lỗi-toàn-hệ-thống)

---

## 1. TỔNG QUAN KIẾN TRÚC & CÁC TÁC NHÂN (ACTORS)

Hệ thống LegacyVault điều phối tương tác giữa 4 tác nhân chính:

1. **Asset Owner (Chủ sở hữu di sản)**: 
   * Cá nhân tạo kho lưu trữ, nạp tài sản số, chỉ định tỷ lệ/quyền thụ hưởng và thiết lập điều kiện kích hoạt.
2. **Google Identity Provider (Google Auth Server)**:
   * Nhà cung cấp danh tính mở (OpenID Connect) chịu trách nhiệm chứng thực danh tính ban đầu của người dùng qua giao thức OAuth 2.0 / GIS v2.
3. **LegacyVault System Core (.NET 8 WebApi, Cloudflare R2, MailKit Engine)**:
   * Hệ thống đóng vai trò bên thứ ba trung gian thực hiện dịch vụ lưu trữ mã hóa, bảo quản dữ liệu chứng cứ điện tử, giám sát nhịp tim sự sống (Heartbeat) và thực thi hợp đồng.
4. **Executor (Người thi hành) & Beneficiary (Người thụ hưởng)**:
   * **Executor**: Người được chủ sở hữu ủy quyền hợp pháp theo Hợp đồng ủy quyền để khai báo và nộp bằng chứng khi biến cố xảy ra.
   * **Beneficiary**: Người được hưởng tài sản/kỷ vật số theo Hợp đồng vì lợi ích của người thứ ba.

---

## 2. MAIN FLOW 1: XÁC THỰC ĐỊNH DANH GOOGLE OIDC & ĐA YẾU TỐ (MFA OTP)

### 2.1. Mục tiêu & Ý nghĩa nghiệp vụ
Đảm bảo xác thực đúng người dùng thực tế mà không cần lưu trữ mật khẩu tĩnh (Zero-Password), loại bỏ rủi ro lộ mật khẩu trên máy chủ, đồng thời gia cố lớp bảo vệ kép thông qua mã OTP gửi qua hệ thống SMTP riêng.

### 2.2. Điều kiện tiên quyết (Pre-conditions)
* Người dùng có tài khoản Google đang hoạt động.
* Trình duyệt hỗ trợ JavaScript và không chặn script từ `https://accounts.google.com/gsi/client`.
* Hệ thống backend đã kết nối thành công tới dịch vụ Google OIDC Discovery và máy chủ SMTP Google (`smtp.gmail.com:587`).

### 2.3. Các bước thực hiện chi tiết (Step-by-Step)
1. **Khởi tạo giao diện đăng nhập**:
   * Người dùng truy cập trang chủ LegacyVault, chọn **"Sign in with Google"**.
   * Frontend kích hoạt thư viện Google Identity Services (GIS v2) hiển thị popup đăng nhập an toàn từ Google.
2. **Xác thực tại Google Auth Server**:
   * Người dùng đăng nhập tài khoản Google. Google kiểm tra mật khẩu / khóa bảo mật Passkey / 2FA của chính Google.
   * Khi thành công, Google Auth Server ký phát một JWT ID Token (thuật toán mã hóa bất đối xứng RSA-2048 / RS256) chứa các Claims: `sub`, `email`, `name`, `picture`, `iss`, `aud`, `exp`.
3. **Gửi Token về Backend kiểm tra**:
   * Frontend bắt sự kiện `callback(credentialResponse)` và gửi `idToken` này về API: `POST /api/v1/auth/google`.
   * Backend .NET 8 sử dụng thư viện `GoogleJsonWebSignature.ValidateAsync()` để kiểm tra:
     * Chữ ký số từ Google public keys (chống giả mạo chữ ký).
     * Thời gian hết hạn (`exp > DateTime.UtcNow`).
     * `aud` trùng khớp với `717961939025-32a9snln6rvn7pu3va9are8dhcabvmr7.apps.googleusercontent.com`.
4. **Kiểm tra trạng thái MFA**:
   * Nếu tài khoản chưa bật MFA: Backend cấp JWT Access Token và Refresh Token cho phiên làm việc.
   * Nếu tài khoản đã bật MFA: Backend đưa phiên vào trạng thái chờ `Pending_MFA`, sinh mã OTP 6 chữ số ngẫu nhiên (`RandomNumberGenerator`, hiệu lực 5 phút) lưu vào RAM Cache.
5. **Gửi mã OTP qua MailKit SMTP**:
   * Dịch vụ `MailKitEmailService` đóng gói email HTML chứa mã OTP bảo mật, kết nối STARTTLS qua cổng 587 và gửi tới hòm thư người dùng.
6. **Xác nhận OTP & Hoàn tất**:
   * Người dùng nhập 6 chữ số OTP trên màn hình.
   * Backend đối soát mã OTP. Nếu chính xác, cấp Access Token hợp lệ.
   * **Bảo mật RAM-Only (Rule 1.3)**: Token chỉ được lưu trữ trên bộ nhớ RAM của React App (State/Context), tuyệt đối không lưu ra `localStorage`/`sessionStorage` để triệt tiêu nguy cơ bị mã độc đánh cắp qua tấn công XSS.

### 2.4. Điều kiện kết thúc (Post-conditions)
* Người dùng đăng nhập thành công vào Dashboard.
* Thông tin định danh đã được đối chiếu và đồng bộ vào hệ thống.

### 2.5. Xử lý lỗi & Ngoại lệ (Exception Handling)
* **Lỗi 1.1: Token Google giả mạo hoặc đã hết hạn**: Backend trả về `401 Unauthorized` kèm mã lỗi `AUTH_TOKEN_EXPIRED`. Frontend thông báo người dùng đăng nhập lại.
* **Lỗi 1.2: Nhập sai mã OTP**: Backend đếm số lần nhập sai. Nếu sai quá 3 lần liên tiếp, hệ thống hủy mã OTP, khóa thử lại trong 15 phút để chống tấn công Brute-force.
* **Lỗi 1.3: Trắng trang do xung đột DOM với React 19**: Container chứa nút Google được giữ là thẻ `div` rỗng, đồng thời toàn bộ luồng được bọc trong `ErrorBoundary` bắt lỗi phục hồi giao diện.

---

## 3. MAIN FLOW 2: ĐỊNH DANH ĐIỆN TỬ CÔNG DÂN eKYC FPT.AI (OCR CCCD GẮN CHIP & SINH TRẮC HỌC)

### 3.1. Mục tiêu & Ý nghĩa nghiệp vụ
Xác lập danh tính pháp lý có chủ quyền của công dân Việt Nam trước khi cho phép khởi tạo kho di sản, chuyển hóa từ một tài khoản email thông thường sang một chủ thể pháp lý có đầy đủ năng lực hành vi dân sự. Đồng thời thiết lập chốt chặn sinh trắc học bắt buộc đối với Người thi hành (Executor) và Người thụ hưởng (Beneficiary) khi yêu cầu tiếp cận di sản.

* **Căn cứ pháp lý**:
  * **Khoản 3 Điều 23 Luật Giao dịch điện tử 2023**: Quy định về phương thức định danh và xác thực điện tử cho cá nhân trong các giao dịch có giá trị tài sản.
  * **Điều 117 Bộ luật Dân sự 2015**: Điều kiện có hiệu lực của giao dịch dân sự: *"Chủ thể có năng lực pháp luật dân sự, năng lực hành vi dân sự phù hợp với giao dịch dân sự được xác lập"*.
  * **Quyết định 2345/QĐ-NHNN của Ngân hàng Nhà nước**: Chuẩn đối soát sinh trắc học khuôn mặt với dữ liệu CCCD gắn chip (độ tin cậy tối thiểu $\ge 80\%$) và kiểm tra thực thể sống (Liveness Detection).

### 3.2. Điều kiện tiên quyết (Pre-conditions)
* Người dùng đã hoàn thành đăng nhập tài khoản (Main Flow 1).
* Có sẵn thẻ Căn cước công dân (CCCD) gắn chip hợp pháp còn hạn sử dụng.
* Thiết bị có camera để chụp ảnh selfie đối soát sinh trắc học trực tiếp.
* Hệ thống backend kết nối với dịch vụ FPT.AI Vision eKYC (`LEGACYVAULT_FPT_API_KEY`) hoặc chế độ Sandbox Sandbox Preset bảo đảm kiểm thử liên tục.

### 3.3. Các bước thực hiện chi tiết (Step-by-Step)
1. **Bước 2.1 - Chụp & Tải ảnh CCCD gắn chip (Mặt trước)**:
   * Người dùng tải ảnh chụp thẻ CCCD lên hệ thống.
   * Frontend gửi ảnh dạng `multipart/form-data` về API: `POST /api/v1/ekyc/ocr`.
2. **Bước 2.2 - Trích xuất OCR & Phát hiện can thiệp giả mạo (FPT.AI Vision IDR)**:
   * Backend .NET 8 gửi ảnh tới máy chủ FPT.AI qua endpoint nhận dạng thẻ CCCD Việt Nam (`https://api.fpt.ai/vision/idr/vnm`).
   * Động cơ AI phân tích hình ảnh và trả về:
     * **Thông tin cá nhân**: Họ và tên, Số CCCD (12 chữ số), Ngày sinh, Giới tính, Quốc tịch, Quê quán, Nơi thường trú, Ngày hết hạn.
     * **Chỉ số tin cậy (Confidence Score)**: Điểm tin cậy tổng thể từ 0.0 đến 1.0 (chuẩn đạt $\ge 0.85$).
     * **Phát hiện gian lận (Tamper / Fraud Detection)**: Tự động rà quét các dấu hiệu thẻ bị cắt góc (thẻ đã bị thu hồi/hết giá trị), thẻ bị dán đè số, tẩy xóa cơ học, hoặc ảnh chụp màn hình máy tính (`isTampered: true/false`).
3. **Bước 2.3 - Chụp ảnh chân dung sinh trắc học (Selfie Liveness)**:
   * Người dùng kích hoạt camera chụp ảnh chân dung chính diện khuôn mặt thực tế.
   * Frontend gửi ảnh selfie về API: `POST /api/v1/ekyc/match-face`.
4. **Bước 2.4 - Đối soát khuôn mặt & Thực thể sống (FPT.AI Face Matching)**:
   * Backend gửi đồng thời ảnh chân dung cắt từ thẻ CCCD và ảnh selfie tới FPT.AI Face Matching Engine (`https://api.fpt.ai/dmp/checkface/v1`).
   * Thuật toán trích xuất đặc trưng hình học khuôn mặt (Deep Facial Feature Vectors) và tính toán điểm tương đồng (`matchScore` từ 0% đến 100%).
   * **Điều kiện vượt qua**:
     * `isLive == true`: Xác nhận người thật đang ngồi trước máy, loại trừ tấn công giả mạo bằng ảnh in, video phát lại hoặc Deepfake.
     * `matchScore >= 80%`: Xác nhận khuôn mặt selfie trùng khớp với người trên thẻ CCCD theo chuẩn tài chính ngân hàng.
5. **Bước 2.5 - Cấp chứng thư định danh phiên làm việc**:
   * Khi OCR và Face Matching đều đạt chuẩn, hệ thống gắn nhãn `eKYC_Verified: true` vào hồ sơ phiên, lưu trữ mã băm SHA-256 của số CCCD và cấp quyền khởi tạo kho di sản.

### 3.4. Xử lý lỗi & Ngoại lệ (Exception Handling)
* **Lỗi 2.1: Ảnh CCCD bị lóa sáng, mất góc hoặc quá mờ**: FPT.AI trả về điểm tin cậy `confidence < 0.75` $\rightarrow$ Hệ thống cảnh báo cụ thể: *"Ảnh thẻ bị chói sáng hoặc không đủ 4 góc, vui lòng chụp lại dưới ánh sáng tự nhiên"*.
* **Lỗi 2.2: Phát hiện thẻ CCCD cắt góc hoặc có dấu hiệu chỉnh sửa giả mạo (`isTampered: true`)**: Hệ thống lập tức từ chối, khóa tiến trình định danh, hiển thị cảnh báo đỏ và ghi nhận vết kiểm toán an ninh (Audit Trail).
* **Lỗi 2.3: Khuôn mặt đối soát không khớp (`matchScore < 80%`)**: Hệ thống yêu cầu chụp lại selfie chính diện, tháo kính râm, khẩu trang hoặc đổi môi trường đủ sáng. Cho phép thử lại tối đa 3 lần.
* **Lỗi 2.4: Chính sách FPT Smart Cloud chuyển đổi B2B (Mã lỗi 401 trên API Key Marketplace)**: Theo thông cáo FPT Smart Cloud, các API Key loại `sk-...` chỉ kích hoạt cho dịch vụ hạ tầng FPT Cloud Marketplace. Backend LegacyVault đã tích hợp sẵn cơ chế **Sandbox Demo Preset** (Thẻ hợp lệ vs Thẻ giả mạo) giúp buổi nghiệm thu và bảo vệ đồ án luôn chạy ổn định mượt mà 100% không phụ thuộc hợp đồng doanh nghiệp viễn thông.

---

## 4. MAIN FLOW 3: KHỞI TẠO KHO DI SẢN, PHÂN LOẠI DỮ LIỆU & VIDEO TUYÊN THỆ MINH MẪN

### 3.1. Mục tiêu & Ý nghĩa nghiệp vụ
Xác lập ý chí định đoạt tài sản của chủ sở hữu, phân chia ranh giới pháp lý theo đúng quy định của Bộ luật Dân sự Việt Nam và tạo chứng cứ điện tử có giá trị chứng minh cao nhất trước Tòa án.

### 3.2. Điều kiện tiên quyết (Pre-conditions)
* Chủ sở hữu đã đăng nhập thành công (Main Flow 1).
* Thiết bị có kết nối Camera và Microphone hoạt động tốt.

### 3.3. Các bước thực hiện chi tiết (Step-by-Step)
1. **Thiết lập thông tin kho di sản**:
   * Người dùng bấm **"Tạo kho mới (Create Vault)"**, nhập Tên kho, Mô tả và Kế hoạch tổng quan.
2. **Nạp tài sản & Phân loại ranh giới 3 nhóm dữ liệu**:
   * Người dùng tải lên các tệp dữ liệu hoặc nhập văn bản bí mật, và bắt buộc phải phân loại vào đúng 1 trong 3 nhóm pháp lý:
     * **Nhóm 1 - Tài sản kinh tế**: Khóa riêng ví tiền mã hóa (Private Key/Seed Phrase), thông tin tài khoản ngân hàng, mã bảo mật kinh doanh $\rightarrow$ Áp dụng chế định tài sản theo **Điều 105, 115 BLDS 2015**.
     * **Nhóm 2 - Kỷ vật số tinh thần**: Ảnh gia đình, video kỷ niệm, thư tín gia đình $\rightarrow$ Áp dụng quyền lưu niệm và bảo vệ kỷ vật của thân nhân theo **Điều 612 BLDS 2015**.
     * **Nhóm 3 - Bí mật đời tư tiêu hủy**: Nhật ký cá nhân riêng tư, dữ liệu không muốn ai đọc được sau khi qua đời $\rightarrow$ Chọn chế độ **"Tự động tiêu hủy vĩnh viễn (Secure Erase)"** khi mở kho theo **Điều 25, 38 BLDS 2015**.
3. **Quay Video tuyên thệ minh mẫn (Capacity Oath Video)**:
   * Trình duyệt kích hoạt WebRTC MediaStream yêu cầu quyền truy cập Camera/Mic.
   * Người dùng thực hiện quay đoạn video ngắn tối thiểu 15 giây theo văn bản mẫu hiển thị trên màn hình:
     > *"Tôi tên là [Họ tên], sinh ngày [Ngày sinh]. Hôm nay ngày [Ngày/Tháng/Năm], tôi xác nhận đang hoàn toàn tỉnh táo, minh mẫn, không bị bất kỳ ai ép buộc hay lừa dối khi lập kho di sản số này..."*
   * Trình duyệt ghi hình chuẩn WebM/MP4, kiểm tra thời lượng $\ge 15$ giây.
4. **Băm dữ liệu & Đóng dấu niêm phong ban đầu**:
   * Hệ thống tính toán mã băm SHA-256 của từng tệp tài sản và video tuyên thệ để chuẩn bị cho giai đoạn mã hóa phong bì.

### 3.4. Điều kiện kết thúc (Post-conditions)
* Tài sản được phân nhóm chính xác trong cơ sở dữ liệu.
* Video tuyên thệ minh mẫn được ghi nhận, bảo đảm tuân thủ điều kiện có hiệu lực của di chúc/giao dịch theo **Điều 630 Bộ luật Dân sự 2015**.

### 3.5. Xử lý lỗi & Ngoại lệ (Exception Handling)
* **Lỗi 2.1: Dung lượng tệp vượt quá 50MB**: Frontend chặn ngay khi chọn tệp, hiển thị cảnh báo dung lượng và đề xuất nén tệp.
* **Lỗi 2.2: Thiết bị chặn quyền Camera/Microphone**: Hiển thị popup hướng dẫn người dùng bấm vào biểu tượng ổ khóa trên thanh địa chỉ duyệt web để cấp quyền `Allow Camera & Mic`.
* **Lỗi 2.3: Video tuyên thệ $< 10$ giây**: Nút "Xác nhận & Tiếp tục" bị vô hiệu hóa, thông báo người dùng phải quay đủ thời lượng để đảm bảo tính pháp lý trước Tòa án.

---

## 5. MAIN FLOW 4: THIẾT LẬP NGƯỜI THỤ HƯỞNG & CHỈ ĐỊNH NGƯỜI THI HÀNH (EXECUTOR)

### 5.1. Mục tiêu & Ý nghĩa nghiệp vụ
Xác định chính xác đối tượng nhận di sản và người có trách nhiệm pháp lý giám sát, thực thi việc mở kho.

### 5.2. Điều kiện tiên quyết (Pre-conditions)
* Đã hoàn thành nạp tài sản ở Main Flow 3.
* Có thông tin email và số giấy tờ định danh của Người thụ hưởng và Người thi hành.

### 5.3. Các bước thực hiện chi tiết (Step-by-Step)
1. **Chỉ định Người thụ hưởng (Beneficiary Mapping)**:
   * Chủ kho gán từng tài sản cho một hoặc nhiều người thụ hưởng cụ thể kèm tỷ lệ phân chia.
   * *Bản chất pháp lý*: Đây là **"Hợp đồng vì lợi ích của người thứ ba" theo Điều 415 BLDS 2015**. Người thụ hưởng có quyền yêu cầu nhận tài sản khi điều kiện xảy ra mà không cần trực tiếp ký hợp đồng ban đầu.
2. **Chỉ định Người thi hành di sản (Executor Assignment)**:
   * Chủ kho chọn 1 người có đủ năng lực hành vi dân sự làm Executor (có thể là Luật sư, Người thân trong gia đình hoặc Tổ chức di sản).
   * **Ràng buộc an toàn**: Chủ kho không được tự chọn chính mình làm Executor.
   * *Bản chất pháp lý*: Đây là **"Hợp đồng ủy quyền" theo Điều 562 BLDS 2015**. Executor nhận ủy quyền thực hiện các thủ tục khai báo biến cố và phối hợp mở kho.
3. **Phát thư mời ủy quyền qua MailKit**:
   * Hệ thống tự động tạo mã Token lời mời bảo mật (hiệu lực 7 ngày).
   * MailKit gửi email trang trọng tới Executor với tiêu đề: *"LegacyVault - Lời mời xác nhận nhận ủy quyền giám sát di sản số"*.
4. **Phản hồi từ Executor**:
   * Executor nhấp vào liên kết định danh trong email để xem xét nội dung ủy quyền.
   * **Nếu Executor chọn "Đồng ý (Accept)"**: Hệ thống ghi nhận trạng thái ủy quyền có hiệu lực, thông báo cho Chủ kho.
   * **Nếu Executor chọn "Từ chối (Decline)"**: Hệ thống đánh dấu từ chối, gửi cảnh báo cho Chủ kho để chọn người khác thay thế.

### 5.4. Điều kiện kết thúc (Post-conditions)
* Mối quan hệ ủy quyền và quyền thụ hưởng được xác lập chặt chẽ bằng văn bản điện tử có lưu vết thời gian.

---

## 6. MAIN FLOW 5: MÃ HÓA PHONG BÌ (ENVELOPE ENCRYPTION), PHÂN MẢNH SHAMIR & LƯU TRỮ R2

### 6.1. Mục tiêu & Ý nghĩa nghiệp vụ
Bảo đảm tính bảo mật tối thượng theo kiến trúc Không tín nhiệm (Zero-Knowledge Architecture). Dữ liệu được mã hóa trước khi đưa lên đám mây sao cho ngay cả quản trị viên hệ thống hoặc nhà cung cấp máy chủ cũng không thể đọc trộm.

### 6.2. Các bước thực hiện chi tiết (Step-by-Step)
1. **Khởi tạo khóa giải mã ngẫu nhiên (DEK)**:
   * Backend .NET 8 sử dụng `System.Security.Cryptography.RandomNumberGenerator` sinh ra một khóa dữ liệu đối xứng ngẫu nhiên **DEK (Data Encryption Key) 256-bit**.
2. **Mã hóa dữ liệu bằng chuẩn quân đội AES-256-GCM**:
   * Tệp tài sản và video tuyên thệ được đưa vào thuật toán **AES-256-GCM** (Galois/Counter Mode).
   * Quá trình mã hóa tạo ra:
     * **Ciphertext**: Dữ liệu tài sản đã bị biến đổi thành chuỗi nhị phân mã hóa hoàn toàn.
     * **Nonce / IV**: Vector khởi tạo 96-bit ngẫu nhiên bảo đảm tính độc nhất.
     * **Authentication Tag**: Thẻ kiểm tra toàn vẹn 128-bit chống mọi hành vi sửa đổi tệp dù chỉ 1 bit.
3. **Niêm phong khóa DEK bằng Khóa chủ KEK**:
   * Khóa DEK sau khi mã hóa dữ liệu xong sẽ được mã hóa tiếp bằng khóa chủ KEK (Master Key Encryption Key) của hệ thống.
4. **Phân mảnh bí mật Shamir (Shamir's Secret Sharing Scheme - Ngưỡng 2/3)**:
   * Khóa bí mật phục hồi được chia làm **3 mảnh độc lập ($n=3$)**, với thuật toán đa thức bậc 1 đòi hỏi tối thiểu **2 mảnh ($k=2$)** để tái lập:
     * **Mảnh 1 (System Share)**: Lưu trữ tại Cơ sở dữ liệu bảo mật của LegacyVault.
     * **Mảnh 2 (Verifier / Legal Custody Share)**: Lưu trữ tại phân vùng giám sát độc lập của bên thứ ba / tổ chức pháp lý.
     * **Mảnh 3 (Executor Share)**: Mã hóa giao cho Người thi hành bảo quản.
   * **Nguyên tắc an toàn tuyệt đối**: Bất kỳ 1 mảnh đơn lẻ nào cũng không mang bất kỳ thông tin gì về khóa gốc. Dù hacker chiếm đoạt được cơ sở dữ liệu hệ thống (chỉ có Mảnh 1) thì vẫn không bao giờ mở được kho.
5. **Đẩy trực tiếp lên Cloudflare R2 Private S3**:
   * Backend truyền luồng tệp Ciphertext lên Bucket riêng tư của **Cloudflare R2** (`legacyvault-prototype-private`).
   * Không bật quyền truy cập công khai (Public access block 100%), chỉ có thể tương tác qua thông tin xác thực AWS S3 V4 Signature đã mã hóa.
6. **Đóng dấu thời gian RFC 3161 TSA & Băm chứng cứ**:
   * Toàn bộ siêu dữ liệu bao gồm: SHA-256 hash của Ciphertext, dấu thời gian RFC 3161 TSA, ID phiên giao dịch được ký số và lưu vào Sổ cái chứng cứ điện tử (Audit Log) theo **Điều 12, 15 Luật GDĐT 2023** và **Điều 95 Bộ luật Tố tụng Dân sự 2015**.

### 6.3. Điều kiện kết thúc (Post-conditions)
* Dữ liệu được niêm phong an toàn trên Cloudflare R2.
* Khóa DEK được chia mảnh phân tán, không tồn tại ở dạng hoàn chỉnh ở bất kỳ đâu trên hệ thống.

---

## 7. MAIN FLOW 6: KÍCH HOẠT KẾ HOẠCH & VẬN HÀNH GIÁM SÁT SỰ SỐNG (DEAD MAN'S SWITCH)

### 7.1. Mục tiêu & Ý nghĩa nghiệp vụ
Duy trì trạng thái khóa bảo vệ liên tục khi chủ sở hữu vẫn còn sống và bình an, thiết lập cơ chế tự động theo dõi tình trạng dựa trên quy định về Giao dịch dân sự có điều kiện.

### 7.2. Các bước thực hiện chi tiết (Step-by-Step)
1. **Lựa chọn kích hoạt kế hoạch (Active the Plan)**:
   * Sau khi hoàn tất mã hóa, Chủ kho bấm nút **"Kích hoạt kế hoạch (Active the Plan)"**.
   * Hệ thống chuyển trạng thái kho từ `Draft` sang `Active_Monitoring`.
   * *Căn cứ pháp lý*: **Điều 120 Bộ luật Dân sự 2015** ("Giao dịch dân sự có điều kiện"). Việc chuyển giao di sản chưa phát sinh hiệu lực mà bị treo cho đến khi điều kiện biến cố (chết/mất tích) xảy ra.
2. **Vận hành chu kỳ kiểm tra định kỳ (DMS Heartbeat)**:
   * Hệ thống đếm lùi thời gian theo tần suất Chủ kho đã cài đặt (ví dụ: mỗi 30 ngày, 60 ngày hoặc 90 ngày).
   * Khi đến hạn, hệ thống tự động gửi thông báo kiểm tra sức khỏe/an toàn (Check-in Reminder) qua Email:
     > *"Xin chào [Tên Chủ kho], đây là thông báo định kỳ từ LegacyVault. Vui lòng bấm vào liên kết dưới đây để xác nhận bạn vẫn an toàn..."*
3. **Phản hồi từ Chủ kho**:
   * Chủ kho nhấp vào liên kết xác nhận an toàn hoặc đăng nhập vào hệ thống.
   * Đồng hồ đếm lùi được tự động đặt lại (Reset Timer) về giá trị ban đầu. Kho di sản tiếp tục được bảo vệ tuyệt đối.
4. **Kích hoạt thời gian gia hạn an toàn (Grace Period)**:
   * Nếu sau ngày đến hạn mà Chủ kho không phản hồi:
     * Hệ thống **chưa mở kho ngay lập tức**.
     * Hệ thống kích hoạt thời gian gia hạn an toàn 14 ngày (Grace Period), đồng thời gửi cảnh báo tăng cường liên tục qua các kênh liên lạc phụ.

---

## 8. MAIN FLOW 7: XỬ LÝ YÊU CẦU MỞ KHO KHẨN CẤP (POST-MORTEM CLAIM) & TIME-LOCK DELAY

### 8.1. Mục tiêu & Ý nghĩa nghiệp vụ
Xử lý khi biến cố tử tuất xảy ra, bảo đảm tính xác thực của biến cố và ngăn chặn 100% rủi ro bị kẻ xấu/Executor gian lận chiếm đoạt tài sản khi Chủ kho vẫn còn sống.

### 8.2. Các bước thực hiện chi tiết (Step-by-Step)
1. **Khởi tạo Claim từ Executor**:
   * Khi Chủ sở hữu qua đời, Executor truy cập cổng tiếp nhận của LegacyVault, nộp **Yêu cầu mở kho (Emergency Death Claim)**.
   * Executor phải tải lên hồ sơ pháp lý chứng minh biến cố (Bản trích lục Giấy chứng tử, giấy báo tử hoặc phán quyết của Tòa án tuyên bố đã chết).
   * **Bắt buộc eKYC Executor**: Executor phải thực hiện quét CCCD gắn chip và quét khuôn mặt để chứng minh đúng danh tính người được ủy quyền ban đầu.
2. **Kích hoạt Cơ Chế Khóa Thời Gian (Time-Lock Delay 14 - 30 ngày)**:
   * Hệ thống đưa kho vào trạng thái báo động khẩn cấp: `Pending_Claim_Verification`.
   * Bộ đếm thời gian hoãn hủy kích hoạt: Bắt buộc đếm ngược từ 14 đến 30 ngày (tùy cài đặt bảo vệ ban đầu của Chủ kho).
   * **Bảo vệ tuyệt đối**: Trong suốt khoảng thời gian Time-Lock này, dữ liệu kho tiếp tục bị khóa chặt, không ai (kể cả Executor hay Quản trị viên) có thể xem hay tải nội dung.
3. **Phát tín hiệu cảnh báo đỏ đa kênh (Red Alert)**:
   * Ngay lập tức, `MailKitEmailService` kích hoạt mẫu thư cảnh báo tối khẩn cấp gửi tới hòm thư chính và số điện thoại của Chủ kho:
     > *"CẢNH BÁO TỐI KHẨN CẤP: Hệ thống vừa nhận được yêu cầu mở kho di sản số của bạn từ Executor [Tên Executor]. Nếu bạn vẫn bình an hoặc đây là sự nhầm lẫn, vui lòng bấm nút BÊN DƯỚI NGAY LẬP TỨC ĐỂ HỦY BỎ!"*
4. **Cơ chế Hủy bỏ 1 chạm (1-Click Cancel Emergency Claim)**:
   * **Nếu Chủ kho còn sống (Báo động giả / Gian lận)**:
     * Chủ kho chỉ cần bấm nút **"HỦY BỎ YÊU CẦU MỞ KHO (CANCEL CLAIM)"** trực tiếp từ email.
     * Backend lập tức hủy bỏ toàn bộ hồ sơ Claim của Executor, chuyển trạng thái kho về an toàn, đồng thời khóa quyền Executor đó và gửi thông báo cảnh cáo.
   * **Nếu Chủ kho đã thực sự qua đời**:
     * Hết thời hạn 14 - 30 ngày Time-Lock mà hệ thống không nhận được lệnh hủy bỏ từ Chủ kho, điều kiện của giao dịch dân sự chính thức thỏa mãn (**Điều 120 BLDS 2015**). Hệ thống chuyển tiếp sang Main Flow 8.

---

## 9. MAIN FLOW 8: GIẢI MÃ HỢP NHẤT 2/3 SHAMIR, XÁC MINH eKYC NGƯỜI NHẬN & BÀN GIAO DI SẢN

### 9.1. Mục tiêu & Ý nghĩa nghiệp vụ
Khôi phục khóa mã hóa hợp pháp và bàn giao tài sản, kỷ vật số đúng người, đúng phần, đúng ý chí định đoạt của người đã khuất, có chốt chặn xác thực danh tính sinh trắc học người thụ hưởng.

### 9.2. Các bước thực hiện chi tiết (Step-by-Step)
1. **Thu thập 2/3 mảnh khóa Shamir**:
   * Hệ thống tự động kích hoạt tiến trình giải mã:
     * Lấy **Mảnh 1 (System Share)** từ cơ sở dữ liệu.
     * Xác thực thông tin phê duyệt của Executor hoặc Hội đồng giám sát để giải phóng **Mảnh 3 (Executor Share)** (hoặc lấy **Mảnh 2 từ Verifier** nếu có lệnh Tòa án).
2. **Khôi phục khóa DEK (Shamir's Secret Reconstruction)**:
   * Sử dụng thuật toán nội suy đa thức Lagrange trên trường hữu hạn Galois ($GF(2^8)$), kết hợp 2 mảnh khóa để tái tạo lại chính xác khóa **DEK 256-bit** ban đầu.
3. **Tải Ciphertext từ Cloudflare R2 & Giải mã AES-256-GCM**:
   * Hệ thống tải tệp mã hóa từ Bucket R2 về bộ nhớ đệm giải mã.
   * Kiểm tra thẻ xác thực `Authentication Tag`. Nếu khớp hoàn toàn, giải mã tệp dữ liệu về trạng thái nguyên bản gốc.
4. **Thực hiện lệnh Tiêu hủy bí mật đời tư (Secure Erase)**:
   * Đối với các tệp thuộc **Nhóm 3 (Bí mật đời tư)**: Hệ thống thực hiện lệnh ghi đè và xóa vĩnh viễn khỏi Cloudflare R2 và cơ sở dữ liệu, không giao cho bất kỳ ai, bảo đảm sự riêng tư theo đúng nguyện vọng của người quá cố (**Điều 25, 38 BLDS 2015**).
5. **Xác minh eKYC Người thụ hưởng trước khi trao quyền truy cập**:
   * MailKit gửi liên kết bảo mật (Single-Use Time-Expiring Secure Link) tới từng Người thụ hưởng tương ứng.
   * Khi Người thụ hưởng truy cập liên kết, hệ thống bắt buộc Người thụ hưởng phải thực hiện **eKYC FPT.AI (Quét CCCD gắn chip & Khuôn mặt)**.
   * Hệ thống đối soát số CCCD vừa quét với số CCCD mà Chủ kho đã cấu hình khi chỉ định quyền thụ hưởng:
     * **Nếu trùng khớp & Match Score $\ge 80\%$**: Hệ thống cấp quyền tải tài sản/kỷ vật tương ứng.
     * **Nếu sai lệch danh tính**: Khóa liên kết truy cập ngay lập tức để phòng ngừa nguy cơ lộ link email hoặc bị người lạ chiếm đoạt.

---

## 10. BẢNG MA TRẬN NGOẠI LỆ & KẾ HOẠCH XỬ LÝ LỖI TOÀN HỆ THỐNG

| Mã Lỗi | Ngữ Cảnh Xảy Ra | Nguyên Nhân | Cơ Chế Xử Lý Kỹ Thuật (.NET 8 & React) | Hậu Quả Pháp Lý & Biện Pháp Khắc Phục |
| :--- | :--- | :--- | :--- | :--- |
| **ERR_AUTH_01** | Đăng nhập Google | ID Token hết hạn hoặc bị sửa đổi payload | `GoogleJsonWebSignature` ném `InvalidJwtException`, trả về HTTP 401 | Từ chối truy cập, bảo vệ tài khoản theo Điều 23 Luật GDĐT |
| **ERR_AUTH_02** | Nhập OTP xác thực | Người dùng nhập sai quá 3 lần | Xóa Cache OTP trong RAM, khóa tài khoản 15 phút chống brute-force | Ngăn chặn hành vi giả mạo chiếm đoạt quyền truy cập |
| **ERR_EKYC_01** | Quét OCR CCCD | Ảnh chụp bị chói lóa, mất góc hoặc quá mờ | FPT.AI trả về `confidence < 0.75`, thông báo người dùng chụp lại | Bảo đảm tính chính xác thông tin định danh công dân |
| **ERR_EKYC_02** | Quét OCR CCCD | Thẻ bị cắt góc hoặc phát hiện tẩy xóa, dán đè số | FPT.AI gắn cờ `isTampered: true`, Backend từ chối phê duyệt hồ sơ | Chặn thẻ giả mạo theo Điều 117 BLDS 2015 |
| **ERR_EKYC_03** | Đối soát khuôn mặt | Điểm so khớp sinh trắc học $< 80\%$ | `matchScore < 80` hoặc `isLive: false`, yêu cầu chụp lại selfie | Loại bỏ tấn công Deepfake theo Quyết định 2345/QĐ-NHNN |
| **ERR_EKYC_04** | Kết nối FPT.AI API | API Key Marketplace bị 401 do chính sách B2B | Tự động kích hoạt **Sandbox Demo Preset** (Hợp lệ vs Giả mạo) | Bảo đảm buổi nghiệm thu đồ án luôn chạy mượt mà 100% |
| **ERR_MEDIA_01** | Quay video tuyên thệ | Camera bị ngắt kết nối hoặc video $<10$s | WebRTC MediaRecorder kiểm tra `duration < 10000ms`, chặn nút Submit | Không công nhận video, yêu cầu quay lại theo chuẩn Điều 630 BLDS |
| **ERR_SMTP_01** | Gửi email mời/OTP | Sai địa chỉ hòm thư hoặc máy chủ đích chặn | MailKit bắt `SmtpCommandException` (550), thực hiện Retry 3 lần | Thông báo trên giao diện yêu cầu cập nhật lại địa chỉ email hợp lệ |
| **ERR_CRYPTO_01**| Lưu trữ Cloudflare R2 | Timeout kết nối S3 hoặc đứt cáp truyền dẫn | Thực hiện Exponential Backoff Retry x3, tự động rollback transaction | Bảo đảm tính trọn vẹn dữ liệu (Atomicity), không tạo tệp rác |
| **ERR_CRYPTO_02**| Giải mã di sản | Dữ liệu trên R2 bị sửa đổi hoặc thiếu mảnh khóa | AES-GCM kiểm tra `Tag mismatch`, ném `CryptographicException` | Từ chối giải mã, giữ nguyên niêm phong bảo đảm tính toàn vẹn chứng cứ |
| **ERR_FRAUD_01** | Executor báo tử gian lận | Chủ kho còn sống nhưng bị Executor tạo Claim | Chủ kho bấm nút **1-Click Cancel** trong email Time-Lock | Lập tức hủy Claim, tước quyền Executor, chuyển hồ sơ cơ quan pháp luật |
| **ERR_LEGAL_01** | Tranh chấp thừa kế | Tòa án có quyết định thụ lý vụ án tranh chấp | Quản trị viên kích hoạt cờ `Legal_Frozen` trên hệ thống | Đóng băng vô thời hạn quy trình mở kho theo Điều 106 BLTTDS 2015 |

---

## TỔNG KẾT
Tài liệu này xác lập tiêu chuẩn vận hành toàn diện cho hệ thống LegacyVault. Mọi mã nguồn phát triển trên Frontend (React 19), Backend (.NET 8 WebApi), hệ thống lưu trữ (Cloudflare R2), dịch vụ truyền thông (MailKit) và định danh sinh trắc học (FPT.AI) phải tuân thủ nghiêm ngặt các bước nghiệp vụ, cơ chế an ninh và căn cứ pháp lý được quy định tại đây.
