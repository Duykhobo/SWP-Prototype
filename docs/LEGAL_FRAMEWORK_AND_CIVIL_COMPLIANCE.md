# BẢN GIẢI TRÌNH GIẢI PHÁP PHÁP LÝ & CƠ CHẾ TUÂN THỦ PHÁP LUẬT DÂN SỰ
## DỰ ÁN TỐT NGHIỆP: LEGACYVAULT (SWP391 - FALL 2026)

---

## 1. BỐI CẢNH THỰC HIỆN ĐỀ TÀI & CĂN CỨ PHÁP LÝ

### 1.1. Bối cảnh thực tiễn
Khi một cá nhân qua đời, các di sản số giá trị (tài khoản ngân hàng, ví crypto, tài khoản kinh doanh, sở hữu trí tuệ, tên miền, dữ liệu mạng xã hội) thường rơi vào tình trạng **"vô chủ"** hoặc bị đóng băng vĩnh viễn do người thừa kế hợp pháp không có mật khẩu hoặc thông tin truy cập. Phương án Legal-Tech của **LegacyVault** số hóa quy trình lập chỉ dẫn bàn giao và chuyển quyền tiếp cận di sản theo đúng quy định pháp luật Việt Nam hiện hành.

### 1.2. Căn cứ pháp lý cốt lõi
1. **Luật Giao dịch điện tử 2023** (có hiệu lực từ 01/07/2024):
   - *Điều 1, 10, 12, 15*: Công nhận thông điệp dữ liệu có giá trị như văn bản, giá trị như bản gốc nếu đáp ứng điều kiện toàn vẹn và có thể truy cập được để tham chiếu.
   - *Điều 23, 31*: Công nhận giá trị pháp lý của chữ ký điện tử an toàn, chữ ký số trong việc xác lập nghĩa vụ giữa các bên.
2. **Bộ luật Dân sự 2015**:
   - *Điều 105, 115*: Định nghĩa về tài sản, quyền tài sản và tài sản hình thành trong tương lai.
   - *Điều 117, 120*: Điều kiện có hiệu lực của giao dịch dân sự và giao dịch dân sự có điều kiện phát sinh.
   - *Điều 415*: Hợp đồng vì lợi ích của người thứ ba.
   - *Điều 562*: Hợp đồng ủy quyền thực hiện công việc.
   - *Điều 609 - 662 (Chương XXIII đến Chương XXVI)*: Các quy định về thừa kế theo di chúc và thừa kế theo pháp luật.
   - *Điều 25, 38*: Quyền nhân thân, quyền đối với đời sống riêng tư, bí mật cá nhân và quyền bất khả xâm phạm về thư tín, điện tín.
3. **Bộ luật Tố tụng Dân sự 2015**:
   - *Điều 95*: Giá trị chứng cứ của thông điệp dữ liệu được thể hiện dưới dạng dữ liệu điện tử.
   - *Điều 106*: Quyền yêu cầu Tòa án thu thập chứng cứ, trưng cầu giám định và yêu cầu cơ quan, tổ chức cung cấp tài liệu.
   - *Điều 114*: Áp dụng biện pháp khẩn cấp tạm thời để phong tỏa tài sản hoặc cấm thực hiện hành vi.

### 1.3. Phân định khái niệm: Tài sản số (Digital Assets) vs. Di sản số (Digital Estate)
- **Tài sản số (Digital Assets - Điều 105 BLDS 2015)**: Tồn tại và thuộc quyền quản lý, định đoạt của chủ sở hữu khi còn sống (*inter vivos*).
- **Di sản số (Digital Estate - Điều 612 BLDS 2015)**: Chỉ phát sinh tại thời điểm mở thừa kế (*Điều 611 BLDS*), là phần tài sản số hợp pháp còn lại sau khi thanh toán các nghĩa vụ tài chính và **loại trừ các quyền nhân thân không thể chuyển giao (*Điều 25 BLDS*)**.

#### Cơ chế phân loại 3 nhóm dữ liệu trong kho di sản LegacyVault:
| Nhóm dữ liệu | Bản chất pháp lý | Cơ chế xử lý kỹ thuật | Căn cứ luật định |
| :--- | :--- | :--- | :--- |
| **Nhóm 1: Di sản số có giá trị kinh tế (Economic Digital Estate)** | Quyền tài sản có thể chuyển giao (ví crypto, tên miền, tài khoản thương mại) | Mã hóa AES-256-GCM, bàn giao quyền kiểm soát và thông tin truy cập cho Bên thụ hưởng | Điều 105, 115 BLDS 2015 |
| **Nhóm 2: Kỷ vật số / Ký ức số (Digital Mementos)** | Kỷ vật tinh thần của gia đình (ảnh kỷ niệm, thư từ gia đình, video) | Bàn giao lưu niệm cho người thân được chỉ định | Ý chí chủ kho & tập quán gia đình |
| **Nhóm 3: Dữ liệu bảo mật nhân thân (Confidential Personal Data)** | Bí mật đời tư cá nhân không thể chuyển giao | **Tự động tiêu hủy mật mã (Cryptographic Burn)** — Xóa vĩnh viễn khóa giải mã khi mở thừa kế | Điều 25, 38 BLDS 2015 |

---

## 2. BẢN GIẢI TRÌNH GIẢI PHÁP PHÁP LÝ & CƠ CHẾ TUÂN THỦ PHÁP LUẬT DÂN SỰ

### 2.1. Xác lập bản chất pháp lý của giao dịch
Để giải quyết bài toán di chúc điện tử chưa được công nhận trong thực tiễn công chứng và tránh xung đột với Khoản 2 Điều 1 Luật Giao dịch điện tử 2023 cùng các điều kiện hình thức cứng của Bộ luật Dân sự 2015, LegacyVault xác lập bản chất pháp lý theo **3 chế định hợp đồng dân sự hợp pháp**:

1. **Giao dịch dân sự có điều kiện phát sinh (Điều 120 Bộ luật Dân sự 2015)**:
   - Sự kiện chủ tài khoản mất liên lạc trong một khoảng thời gian xác định (Dead Man's Switch), kết hợp với văn bản xác nhận sự kiện tử tuất hợp pháp, được thỏa thuận là điều kiện phát sinh hiệu lực của việc chuyển giao quyền tiếp cận thông tin cho bên thụ hưởng.
2. **Hợp đồng vì lợi ích của người thứ ba (Điều 415 Bộ luật Dân sự 2015)**:
   - Chủ tài khoản xác lập thỏa thuận với bên quản trị dịch vụ nhằm mục đích: Khi điều kiện xảy ra, người thứ ba (Người thụ hưởng) có quyền trực tiếp yêu cầu tiếp nhận các thông tin, tài liệu và quyền kiểm soát tài sản số mà không cần sự can thiệp của chủ tài khoản.
3. **Hợp đồng ủy quyền thực hiện công việc (Điều 562 Bộ luật Dân sự 2015)**:
   - Người thi hành (Executor) đóng vai trò là bên được ủy quyền đại diện nộp văn bản chứng minh sự kiện tử tuất và giám sát quá trình bàn giao thông tin cho các bên thụ hưởng theo đúng ý chí ban đầu.

### 2.2. Cơ chế bảo đảm ý chí tự nguyện và năng lực hành vi dân sự
- **Chứng cứ ghi nhận trạng thái minh mẫn (Điều 117 và Điều 630 Bộ luật Dân sự 2015)**:
  - Giao dịch chỉ có hiệu lực khi chủ thể có đầy đủ năng lực nhận thức và làm chủ hành vi, tham gia hoàn toàn tự nguyện, không bị lừa dối, đe dọa hay cưỡng ép.
  - Tại thời điểm xác lập, chủ tài khoản thực hiện **bản ghi hình tuyên thệ (15 giây)** nêu rõ họ tên, ngày sinh và cam đoan tự nguyện làm chứng cứ chứng minh ý chí đích thực.
- **Quyền sửa đổi và thu hồi ý chí (Điều 638 Bộ luật Dân sự 2015)**:
  - Trong suốt thời gian chủ tài khoản còn hoạt động, quyền định đoạt thuộc về chính chủ thể.
  - Chủ tài khoản có quyền sửa đổi, bổ sung, thay thế hoặc hủy bỏ toàn bộ nội dung ủy quyền bất kỳ lúc nào. Giao dịch xác lập sau cùng sẽ phủ quyết các giao dịch xác lập trước đó.

### 2.3. Phân định ranh giới quyền nhân thân và quyền tài sản
- **Bảo vệ quyền nhân thân và bí mật đời tư (Điều 25 và Điều 38 Bộ luật Dân sự 2015)**:
  - Đời sống riêng tư, bí mật cá nhân là bất khả xâm phạm và được pháp luật bảo vệ. Quyền nhân thân không thể thừa kế.
  - Đối với các dữ liệu thuần túy mang tính nhân thân (thư từ riêng, nhật ký cá nhân), chủ thể có quyền định đoạt: Cho phép người thân tiếp cận với tư cách kỷ vật lưu niệm, hoặc yêu cầu cơ chế **tiêu hủy vĩnh viễn quyền tiếp cận (Cryptographic Burn)** khi qua đời nhằm bảo vệ danh dự, bí mật đời tư sau khi chết.
- **Đối với quyền tài sản (Điều 105 và Điều 115 Bộ luật Dân sự 2015)**:
  - Đối với các dữ liệu gắn liền với giá trị kinh tế (quyền khai thác thương mại, tên miền, thông tin truy cập ví tài sản số): Hệ thống thực hiện chuyển giao quyền tiếp cận thông tin quản trị theo thỏa thuận dân sự.
- **Đối với tài sản bắt buộc đăng ký quyền sở hữu**:
  - Đối với bất động sản, tiền gửi tại tổ chức tín dụng, phương tiện giao thông: Hệ thống **chỉ cung cấp Văn bản chỉ dẫn và tài liệu đối soát nguồn gốc**.
  - Việc chuyển quyền sở hữu thực tế bắt buộc phải tiến hành thủ tục khai nhận hoặc phân chia di sản thừa kế theo đúng trình tự pháp luật công chứng và cơ quan nhà nước có thẩm quyền.

### 2.4. Giới hạn phạm vi bàn giao tài sản số
- LegacyVault hỗ trợ lưu trữ, mã hóa và bàn giao thông tin tài sản số theo cấu hình do Chủ kho thiết lập.
- **Hệ thống không xác định quyền sở hữu tài sản, quan hệ gia đình, quyền nhận tài sản, nghĩa vụ tài chính hoặc giải quyết tranh chấp giữa các bên**.
- Chủ kho có trách nhiệm kiểm tra danh sách Người nhận, tỷ lệ bàn giao và Người nhận dự phòng trước khi niêm phong kho. Hệ thống chỉ kiểm tra tính đầy đủ và hợp lệ của cấu hình kỹ thuật.
- Khi phát hiện dấu hiệu bất thường hoặc có phản ánh tranh chấp, hệ thống có thể tạm dừng bàn giao để bảo vệ dữ liệu. Việc xử lý quyền sở hữu hoặc tranh chấp được thực hiện ngoài hệ thống.
- **Đóng băng tranh chấp và xuất hồ sơ kỹ thuật (`DISPUTED_FROZEN`)**:
  - Khi nhận được báo cáo tranh chấp, System Administrator có thể chuyển kho sang trạng thái `DISPUTED_FROZEN`.
  - Trong trạng thái này, hệ thống tạm dừng mọi yêu cầu giải mã và bàn giao tài sản.
  - Hệ thống cho phép xuất hồ sơ kỹ thuật gồm lịch sử thao tác, cấu hình bàn giao, dấu thời gian và mã băm để phục vụ việc xử lý bên ngoài.
  - Việc bàn giao hồ sơ được thực hiện thủ công bởi System Administrator theo yêu cầu hợp lệ; hệ thống không tự động chuyển tài sản, khóa giải mã hoặc dữ liệu nhạy cảm cho bất kỳ bên nào.

### 2.5. Giá trị chứng cứ và cơ chế phục vụ thanh tra, xét xử (Zero-Knowledge Compliance)
- **Giá trị chứng cứ của thông điệp dữ liệu**:
  - Căn cứ Điều 95 Bộ luật Tố tụng Dân sự 2015 và Điều 12 Luật Giao dịch điện tử 2023, toàn bộ gói tài liệu được lưu trữ toàn vẹn, có đóng dấu thời gian xác thực RFC 3161 TSA và xác định rõ người khởi tạo được thừa nhận là chứng cứ hợp pháp trước cơ quan xét xử khi phát sinh tranh chấp.
- **Cơ chế phục vụ thanh tra, xét xử của Cơ quan chức năng khi không có khóa giải mã (Zero-Knowledge Compliance)**:
  1. *Giám sát tính toàn vẹn và sự thật khách quan (Điều 95 BLTTDS 2015 & Điều 12, 15 Luật GDĐT 2023)*:
     - Cơ quan chức năng thẩm định tính pháp lý thông qua mã băm SHA-256 (`manifest_hash`), tem thời gian số RFC 3161 TSA bất biến trên Sổ cái WORM, video tuyên thệ minh mẫn 15s (*Điều 630 BLDS*) và chữ ký số ECDSA P-256 mà **không cần giải mã dữ liệu nhạy cảm bên trong**.
  2. *Phục hồi khóa theo Lệnh Tòa án (Điều 106 BLTTDS 2015)*:
     - Khi có Quyết định trưng thu chứng cứ hợp pháp của Tòa án, hệ thống và Công chứng viên phối hợp cung cấp **2/3 Mảnh khóa Shamir** (*Mảnh 1 System + Mảnh 2 Verifier*) để phục hồi Master Key giải mã tài sản dưới sự giám sát của Hội đồng giám định tư pháp.
  3. *Áp dụng biện pháp khẩn cấp tạm thời (Điều 114 BLTTDS 2015)*:
     - Tiếp nhận lệnh phong tỏa từ Tòa án và lập tức kích hoạt trạng thái **`JUDICIAL_FREEZE`** để ngăn chặn tẩu tán tài sản.

### 2.6. Cơ chế xác nhận cấu hình và xử lý yêu cầu bất thường
- Hệ thống tập trung bảo vệ kho tài sản số khỏi việc bàn giao nhầm, truy cập trái phép hoặc kích hoạt không đúng điều kiện. LegacyVault không xác định quan hệ thừa kế, quyền sở hữu tài sản hoặc giải quyết tranh chấp pháp lý.
- **Xác nhận khi thiết lập kho**:
  - Chủ kho xác nhận thông tin tài sản, danh sách Người nhận, tỷ lệ bàn giao và Người kích hoạt bàn giao. Hệ thống lưu thời điểm xác nhận, mã băm của cấu hình và nhật ký thao tác để hỗ trợ truy vết khi cần.
- **Kiểm tra trước khi bàn giao**:
  - Khi Dead Man's Switch được kích hoạt, Người kích hoạt bàn giao gửi yêu cầu mở quy trình. Hệ thống kiểm tra trạng thái kho, thời gian không hoạt động của Chủ kho, thông tin tài khoản của Người kích hoạt và danh sách Người nhận đã được Chủ kho cấu hình.
- **Từ chối hoặc đóng băng yêu cầu**:
  - System Administrator có thể từ chối hoặc đóng băng yêu cầu bàn giao khi phát hiện dấu hiệu bất thường, chẳng hạn như đăng nhập trái phép, thay đổi cấu hình sát thời điểm kích hoạt, thông tin Người kích hoạt không khớp hoặc Chủ kho quay lại xác nhận vẫn đang hoạt động.
- **Khôi phục quyền kiểm soát của Chủ kho**:
  - Nếu Chủ kho đăng nhập và hoàn tất xác thực trong thời gian chờ, hệ thống hủy yêu cầu bàn giao, đưa kho về trạng thái `ACTIVE` và ghi nhận sự kiện trong nhật ký kiểm toán.
- **Xử lý tranh chấp ngoài hệ thống**:
  - Khi có phản ánh về quyền sở hữu hoặc quyền nhận tài sản, hệ thống chỉ duy trì trạng thái đóng băng để bảo vệ dữ liệu. Việc xác minh, thương lượng hoặc giải quyết tranh chấp được thực hiện bên ngoài LegacyVault.
- **Giới hạn chức năng**:
  - Hệ thống không thu thập hoặc xác minh thông tin vợ/chồng, con cái, cha mẹ, quan hệ gia đình, tài sản chung vợ chồng hoặc quyền thừa kế theo pháp luật. Biên bản bàn giao và nhật ký hệ thống chỉ phục vụ mục đích kỹ thuật, không thay thế văn bản công chứng, quyết định của Tòa án hoặc thủ tục pháp lý khác.
