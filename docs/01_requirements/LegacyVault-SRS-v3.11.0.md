# TÀI LIỆU ĐẶC TẢ YÊU CẦU PHẦN MỀM LEGACYVAULT

**Phiên bản 3.11.0 — Gán người nhận theo tài sản, tự gom kho bàn giao và chốt bàn giao bằng thao tác của Executor.**

Ngày cập nhật: 26/09/2026. Tài liệu nguồn: `LegacyVault-SRS-v3.10.0.md`; giữ thứ tự năm luồng của `LegacyVault-SRS-v3.5.4.md`.

## Cách sắp xếp

Hết thời gian chờ điểm danh mà Owner vẫn không phản hồi thì điểm danh được tạm treo 90 ngày cho mọi hạng kho nguồn Owner; sau đó kho bị đóng băng. Quy tắc xóa kho nguồn do hết gói trả phí của 3.10.0 tiếp tục áp dụng và không thay thế thời gian suy nghĩ lại của Beneficiary. Luồng 3 chỉ xử lý giấy chứng tử. Luồng 4 thông báo cho người thụ hưởng, ghi ngày bàn giao đã thống nhất, cho đổi/hủy lựa chọn chuyển trước khi Executor bấm bắt đầu, rồi xử lý nhận hoặc từ chối theo từng kho bàn giao.

**Thuật ngữ:** Kho nguồn là không gian Owner quản lý kế hoạch. Owner chọn tập người nhận cho **từng tài sản**; hệ thống tự gom các tài sản có cùng tập `person_id` thành đúng một kho bàn giao hiệu lực trong kế hoạch. Kho bàn giao có `handover_vault_id` và manifest tài sản; “gói” hoặc `bundle` là manifest kỹ thuật của kho đó. Kho một người có đúng một người nhận; kho đồng sở hữu có từ hai người nhận trở lên và chỉ bàn giao khi tất cả đồng ý. Chuyển 1:1 là lựa chọn **dự kiến** của người được Owner chỉ định một mình: chuyển nguyên kho bàn giao cho đúng một người hợp lệ khác; chính người chuyển có thể đổi đích hoặc hủy trước khi Executor bấm **Bắt đầu bàn giao**. Chuyển không chia phần trăm, file hay tài sản con; kho đồng sở hữu không được chuyển. Danh sách người nhận là snapshot của cùng kế hoạch/hồ sơ, không phải danh bạ toàn hệ thống.

Các chính sách kho, dịch vụ, thời hạn, phân quyền và bảo mật khác được giữ về nguyên tắc. Ô cam kết là thao tác và bằng chứng trên hệ thống; giá trị pháp lý thực tế của nó nằm ngoài phạm vi đồ án.

# 1. THÔNG TIN CHUNG

## Mục đích và phạm vi

LegacyVault lưu giữ tài sản số, cho Owner chỉ định người thụ hưởng và bàn giao sau khi hồ sơ chứng tử được Verifier chấp thuận. Đây là phạm vi đồ án SWP 10 tuần, không thay thế di chúc, công chứng, đăng ký hộ tịch hoặc xác thực tư cách pháp lý ngoài thực tế.

### Trong phạm vi

- Năm vai trò: Owner, Executor, Beneficiary, Verifier, Admin.
- Kho mã hóa; tài sản dạng file và bản ghi tài khoản/ví; Owner gán người nhận cho từng tài sản và hệ thống tự gom thành kho bàn giao theo tập người nhận.
- Danh sách người thụ hưởng một cấp; chuyển 1:1 chỉ trên kho một người trước khi Executor bắt đầu; kho đồng sở hữu cần mọi người đồng ý nhận.
- Điểm danh và nhắc nhở độc lập; tạm treo 90 ngày và đóng băng kho khi Owner tiếp tục không phản hồi; các tín hiệu này không khởi động bàn giao.
- Executor nộp giấy chứng tử với ô cam kết trách nhiệm; Verifier kiểm tra, tự tick ô cam kết và phê duyệt hoặc từ chối.
- Hai xác nhận trách nhiệm, thông báo trước, ngày bàn giao chung, Executor bấm bắt đầu, quyết định nhận/từ chối và thời hạn suy nghĩ lại 2 năm, tải miễn phí và kho cá nhân.
- Gói dịch vụ, thanh toán mô phỏng, PDF XS Max, audit và quản trị.

### Ngoài phạm vi MVP

- Quy trình sự kiện khác ngoài giấy chứng tử và quy trình Owner yêu cầu đảo ngược hồ sơ đã phê duyệt.
- Phân tầng người thừa kế, danh sách ưu tiên người nhận, tự chuyển người nhận khi im lặng, chuyển tiếp nhiều vòng.
- Chia phần trăm, chia tiền, tách file, tách kho bàn giao hoặc chia các trường tài khoản trong lúc quyết định nhận/chuyển. Owner đổi tập người nhận của từng tài sản trước snapshot nếu muốn hệ thống gom theo cách khác.
- Chuyển trên hệ thống sau khi Executor bắt đầu hoặc sau khi nhận; chuyển cho người ngoài danh sách; chuyển tiếp quyền được người khác chuyển đến.
- Tự động xác định Owner đã qua đời từ việc không điểm danh.
- Kết nối ví, ký giao dịch blockchain, chuyển coin/token, kiểm tra số dư hoặc xác nhận đăng nhập vào tài khoản được lưu.
- Thanh toán thương mại, chữ ký số pháp lý và tích hợp cơ quan nhà nước thật.

## Vai trò và phân quyền

| Vai trò | Quyền chính | Giới hạn |
|---|---|---|
| Owner | Tạo kho nguồn, thêm tài sản, chọn tập người nhận cho từng tài sản, chọn Executor, điểm danh | Không sửa snapshot khi hồ sơ đang xử lý; không tự chia kho bàn giao thay hệ thống |
| Executor | Chấp nhận nhiệm vụ, nộp/bổ sung giấy chứng tử và tick ô trách nhiệm khi nộp, ghi ngày đã thống nhất và bấm Bắt đầu bàn giao | Không đọc tài sản, không chọn người nhận thay Beneficiary, không tự phê duyệt giấy hoặc sửa chỉ định của Owner |
| Beneficiary | Xác minh danh tính, chọn/đổi/hủy chuyển nguyên kho một người trước khi bắt đầu, nhận hoặc từ chối sau khi bắt đầu, đổi từ từ chối sang nhận trong thời hạn suy nghĩ lại, tải/lưu tài sản đã nhận | Chỉ thao tác trên quyền của mình; kho đồng sở hữu không cho chia/chuyển; không chuyển tiếp quyền được chuyển đến |
| Verifier | Kiểm tra chứng tử, yêu cầu bổ sung, tick ô trách nhiệm khi phê duyệt, kết thúc quyền không bàn giao | Không đọc tài sản hoặc tự chọn đích chuyển |
| Admin | Quản trị tài khoản, nhân sự đủ điều kiện, thông báo, lỗi, audit và sự cố kỹ thuật | Không đọc tài sản, đổi người nhận, ký thay hoặc chấp thuận chứng tử |

Executor và Verifier là hai cá nhân khác nhau theo `person_id`, không đồng thời là Owner hoặc bất kỳ Beneficiary nào trong cùng hồ sơ. Đổi email hoặc tài khoản không được bỏ qua điều kiện này. Verifier là vai trò mô phỏng trong đồ án.

# 2. CÁC LUỒNG NGHIỆP VỤ CHÍNH

## 2.1. Luồng chính 1 – Tạo tài khoản, tạo kho và thiết lập người nhận

### Mục tiêu

Owner tạo kho nguồn, chọn người nhận cho từng tài sản; hệ thống tự gom tài sản thành kho bàn giao theo đúng tập người nhận và thiết lập kế hoạch, dịch vụ.

### Người tham gia

Owner; Executor nhận phân công; hệ thống kiểm tra gói và cấu hình.

### Điều kiện bắt đầu

Owner có tài khoản và quyền quản lý kho. Kế hoạch chỉ kích hoạt khi đáp ứng SETUP-01.

### Các bước tạo kho và thiết lập

1. Đăng ký, xác nhận liên hệ và thiết lập xác thực bổ sung.
2. Chọn Owner Free hoặc mua Legacy XS/XS Max trên cùng kho; trả tiền chưa tự kích hoạt kế hoạch.
3. Thêm file hoặc bản ghi tài khoản/ví; kiểm tra quota và mã hóa từng phiên bản.
4. Với gói trả phí còn hạn, tạo một danh sách Beneficiary cho kế hoạch. Không có trường cấp, người nhận chính, đồng cấp hoặc thứ tự ưu tiên.
5. Với **từng tài sản**, Owner chọn đúng một người hoặc một nhóm từ hai người trở lên trong danh sách. Nhóm nhiều người là đồng sở hữu; giao diện nêu rõ phải có đủ sự đồng ý mới bàn giao cùng nội dung cho mỗi người. Tài sản chưa có chỉ định hợp lệ mang trạng thái `NOT_IN_ESTATE_PLAN`.
6. Hệ thống chuẩn hóa tập `person_id` không xét thứ tự và tự gom toàn bộ tài sản có cùng tập người nhận vào **đúng một kho bàn giao** của kế hoạch. Các tập `{1}`, `{1,2}` và `{2}` tạo ba kho khác nhau; không cho hai kho hiệu lực có cùng tập người nhận. Owner xem lại kho tự tạo, không tự tách A khỏi B khi chúng có cùng tập người nhận.
7. Chọn Executor và nhân sự thay thế theo phần Nhân sự trong luồng chính 3; có thể bật điểm danh/nhắc nhở như chức năng độc lập.
8. Xem lại từng tài sản và kho hệ thống đã gom, loại một người/đồng sở hữu, người nhận, gói dịch vụ, quy tắc chuyển và điều kiện đồng thuận; xác nhận kích hoạt.

- **SETUP-01:** Kích hoạt cần XS/XS Max còn hạn, Owner xác minh/MFA, Executor chính đã chấp nhận, ít nhất một tài sản có chỉ định hợp lệ và không có kế hoạch khác đang hoạt động/được bảo vệ. Hệ thống phải gom và tạo manifest kho bàn giao trước khi kích hoạt. Điểm danh là tùy chọn và không là điều kiện để Executor nộp giấy chứng tử.
- **SETUP-02:** Mỗi người trong danh sách có `expected_person_id` mô phỏng và liên hệ. Có thể chưa có tài khoản; khi nhận phải đối chiếu đúng `person_id`. Trùng tên hoặc sở hữu email không tự tạo quyền.
- **SETUP-03:** Chỉ định theo từng `asset_id`, tập `person_id` chuẩn hóa, kho tự gom, manifest và người nhận của kho được lưu trong `designation_version_id`. Owner xác nhận trước rằng chỉ người được chỉ định một mình trên kho mới có thể chọn một đích nhận nguyên kho; có thể đổi/hủy lựa chọn cho tới lúc Executor bấm bắt đầu. Bản xác nhận kế hoạch bao phủ chính sách này và điều kiện đồng thuận của kho đồng sở hữu.
- **SETUP-04:** Không gửi lời mời nhận tài sản khi Owner mới thiết lập. Chỉ mời sau khi hồ sơ chứng tử được duyệt.
- **SETUP-05:** Trước snapshot, Owner có quyền quản lý được sửa chỉ định từng tài sản; hệ thống tính lại kho tự gom và tạo phiên bản mới cho các kho/manifest bị ảnh hưởng. Sau snapshot không đổi danh sách, chỉ định hoặc nội dung để xử lý hồ sơ hiện hành. Chuyển quyền dự kiến của Beneficiary theo luồng 4 không sửa chỉ định gốc của Owner.
- **SETUP-06:** Kế hoạch lưu phương thức thông báo đã thống nhất (ví dụ email/SMS mô phỏng), địa chỉ liên hệ đã xác minh và phiên bản thỏa thuận. Sau khi Verifier duyệt, các bên thống nhất ngày bàn giao; Executor là người duy nhất nhập ngày đó, ghi xác nhận đã nhận kết quả thống nhất và dùng phương thức đã lưu để báo lịch hoặc thay đổi lịch. Thiếu phương thức hợp lệ thì chưa cho bấm Bắt đầu bàn giao.
- **SETUP-07:** Khi bật điểm danh ở bất kỳ hạng kho nguồn Owner nào, giao diện công bố trước mốc thời gian chờ, 90 ngày tạm treo, quyền đóng băng và điều kiện xóa riêng của kho trả phí; Owner xác nhận đã xem chính sách và phương thức nhận thông báo. Đổi gói không đặt lại đồng hồ điểm danh/tạm treo đang chạy.

### Tài sản số và cấu trúc kho bàn giao

#### Hai loại tài sản

- **ASSET-01 — File:** Mỗi file tải lên là một tài sản có `asset_id` và phiên bản nội dung riêng. Owner tự tách file trước khi tải nếu muốn giao các phần riêng biệt.
- **ASSET-02 — Tài khoản/ví:** Mỗi biểu mẫu tài khoản hoặc ví được lưu là một tài sản có `asset_id`. Người dùng nhập trực tiếp, không phải tự tạo file chứa mật khẩu.
- **ASSET-03 — Một nội dung được bảo vệ:** Bản ghi tài khoản/ví được đóng gói thành một payload có cấu trúc, mã hóa và quản lý phiên bản như file. Mỗi bản ghi tính một đơn vị tài sản trong quota; dung lượng tính theo byte payload UTF-8 trước mã hóa. Mỗi file đính kèm là một tài sản riêng.
- **ASSET-04 — Kho bàn giao:** Hệ thống tự tạo đúng một kho cho mỗi tập người nhận duy nhất trong cùng kế hoạch. Mỗi kho có `handover_vault_id`, đúng một gói/manifest gồm một hoặc nhiều tài sản, `bundle_id`, `bundle_version_id` và từng `asset_id`, `asset_version_id` cùng hash. Với file, `asset_version_id` ánh xạ tới `file_version_id` của bản cũ. Chỉ định gốc của Owner theo từng tài sản; quyết định nhận/chuyển áp dụng nguyên kho sau khi gom.
- **ASSET-05 — Nguyên kho:** Nhận và chuyển áp dụng toàn bộ kho bàn giao, không chọn tỷ lệ, từng file hoặc từng trường bí mật. Sau khi nhận có thể tải/lưu từng tài sản theo nhu cầu.
- **ASSET-06 — Phiên bản:** Sửa file, tài khoản, mật khẩu, ghi chú hoặc thành phần gói tạo phiên bản mới. Snapshot và chữ ký đã ghim phiên bản không bị ghi đè.
- **ASSET-07 — Không trùng:** Một tài sản chỉ nằm trong một kho bàn giao hiệu lực của cùng kế hoạch; một tập người nhận chỉ có một kho hiệu lực. Với nhóm đồng sở hữu, mọi người chỉ được cấp quyền truy cập cùng manifest sau khi tất cả đồng ý; hệ thống không tự xác lập tỷ lệ sở hữu pháp lý hoặc chia số dư ví.
- **ASSET-08 — Loại kho:** Hệ thống suy ra `SINGLE_RECIPIENT` khi tập người nhận của tài sản có một người và `CO_OWNED` khi có ít nhất hai người. Không có nút Owner tự tick loại cho kho đã gom. Đổi người nhận/nội dung trước snapshot tạo phiên bản mới và tính lại nhóm; sau snapshot không đổi loại cho hồ sơ hiện hành.

#### Biểu mẫu tài khoản và ví crypto

| Trường | Yêu cầu | Cách xử lý |
|---|---|---|
| Tên tài sản | Bắt buộc | Tên an toàn do Owner đặt, không dùng bí mật làm tiêu đề |
| Loại tài sản | Bắt buộc | Tài khoản số hoặc ví crypto |
| Nền tảng/tên ứng dụng | Tùy chọn | Ví dụ tên dịch vụ hoặc ứng dụng ví |
| Đường dẫn đăng nhập | Tùy chọn | Lưu để tham khảo, không tự đăng nhập |
| Tài khoản/email/tên đăng nhập | Có trường nhập | Có thể để trống nếu ví không dùng tài khoản |
| Mật khẩu | Có trường nhập | Có thể để trống nếu không áp dụng; mặc định che nội dung |
| Địa chỉ ví và mạng blockchain | Tùy chọn | Giúp người nhận biết đúng ví/mạng; không kích hoạt giao dịch |
| Ghi chú bảo mật | Tùy chọn, nhiều dòng | Hướng dẫn 2FA, mã dự phòng, passphrase, thông tin khôi phục, vị trí thiết bị hoặc các yếu tố bảo mật khác Owner muốn bàn giao |

- **CRED-01:** Khi lưu, ngoài tên và loại phải có ít nhất một nội dung trong tài khoản, mật khẩu, địa chỉ ví hoặc ghi chú. Không bắt mọi ví phải có tài khoản/mật khẩu.
- **CRED-02:** Toàn bộ trường ngoài tên/loại được mã hóa cùng payload, kể cả ghi chú; không lưu bản rõ trong metadata, log, email, PDF kế hoạch hoặc chỉ mục tìm kiếm.
- **CRED-03:** Ghi chú là nội dung bí mật, không phải ghi chú quản trị. Admin, Executor và Verifier không được xem các trường này. Việc kiểm tra chứng tử không yêu cầu đọc thông tin ví.
- **CRED-04:** Owner có quyền hợp lệ và Beneficiary đã nhận mới được mở nội dung. Các nút hiện/ẩn, sao chép, xuất nội dung phải kiểm tra quyền hiện hành; hành động được audit nhưng không ghi giá trị bí mật.
- **CRED-05:** Hệ thống chỉ lưu và bàn giao thông tin. Không tự kiểm tra mật khẩu, OTP hoặc seed phrase bằng dịch vụ ngoài; không dùng chúng để thao tác ví.
- **CRED-06:** Bản ghi đã nhận có thể xem khi quyền tải còn hiệu lực, xuất thành tệp JSON UTF-8 theo yêu cầu hoặc nhập kho cá nhân dưới dạng bản ghi. Sau hạn miễn phí, việc đọc yêu cầu bản đã nhập và quyền kho cá nhân hợp lệ. Bản xuất chứa bí mật, chỉ trả cho người có quyền, không tạo URL công khai hay lưu bản rõ trên máy chủ.

### Gói dịch vụ và kho Owner

#### Hạn mức và giá

Trong bản này, đơn vị quota “tài sản” bao gồm một file hoặc một bản ghi tài khoản/ví. Quy tắc dung lượng tại ASSET-03; manifest gói không tính thêm một tài sản.

| Dịch vụ | Giá mô phỏng | Quota | Quyền di sản/PDF |
|---|---|---|---|
| Owner Free | 0đ, không có ngày hết hạn gói | 3 tài sản / 20 MiB | Lưu trữ và điểm danh; không thiết lập di sản |
| Legacy XS | 199.000đ / 365 ngày | 20 tài sản / 200 MiB | Thiết lập, điểm danh, xác minh, bàn giao |
| Legacy XS Max | 399.000đ / 365 ngày | 50 tài sản / 500 MiB | Như XS và xuất PDF kế hoạch |
| Kho người nhận Free | 0đ, không hết hạn gói | 2 tài sản / 20 MiB | Chỉ lưu nội dung đã được bàn giao |
| Kho người nhận Plus | 49.000đ / 30 ngày | 10 tài sản / 200 MiB | Như Free, quota cao hơn |

Mua gói Owner không cấp Plus và ngược lại. Mỗi tài khoản có tối đa một kho cá nhân; đổi gói không tạo kho mới. Nhận/tải miễn phí không bắt buộc mua kho. Free trong quota không xóa vì lâu không đăng nhập; không phải cam kết vận hành vĩnh viễn.

#### Gói Owner

- **OPLAN-01:** Dùng Free rồi nâng cấp hoặc mua ngay đều giữ cùng kho. Free được dùng điểm danh và quy tắc tạm treo/đóng băng chung, nhưng không thiết lập người nhận hoặc Executor, kể cả nháp. Trả tiền không tự kích hoạt kế hoạch hoặc gỡ chặn do không điểm danh.
- **OPLAN-02:** XS/XS Max có 365 × 24 giờ. Gia hạn sớm cộng từ hạn cũ, muộn tính từ callback mới. Nhắc 30/7/1 ngày. Không tự trừ tiền, hoàn tiền, bù giá/ngày hoặc đổi XS↔XS Max giữa kỳ. Chỉ đổi khi kỳ cũ hết; xuống XS phải vừa quota, không tự xóa để vừa gói.
- **OPLAN-03:** Nếu Owner đã bật điểm danh, hết gói trả phí vẫn giữ đúng mốc điểm danh, thời gian chờ và 90 ngày tạm treo đang chạy. Im lặng không mở hồ sơ chứng tử hoặc chứng minh qua đời. Không tự chuyển kho trả phí về Free để né điều kiện đóng băng/xóa.
- **OPLAN-04:** Gói hết hạn vẫn cho quyền an toàn còn hợp lệ: Owner xác thực, điểm danh theo DMS-06 nếu chưa có hồ sơ chứng tử, tải dữ liệu, gia hạn và quản lý tài khoản trong thời gian xử lý gói. Không thêm/sửa nội dung kế hoạch, thêm người nhận hoặc xuất PDF cho đến khi gói được gia hạn. Thanh toán hoặc gia hạn đơn thuần không xóa trạng thái đóng băng do không điểm danh; hồ sơ bàn giao đã phê duyệt tiếp tục theo snapshot và quyền đã cấp.
- **OPLAN-05:** Kho Owner trả phí đang đóng băng chỉ **đủ điều kiện xóa** tại `deletion_eligible_at = max(freeze_at + 30 × 24 giờ, paid_plan_expires_at + 30 × 24 giờ)`. Như vậy đã qua cả 90 ngày tạm treo, hạn gói XS/XS Max và ít nhất 30 ngày để xử lý sau mốc đóng băng/hết gói. Trong thời gian đó Owner có thể gia hạn, xác thực/điểm danh, tải dữ liệu hoặc yêu cầu xóa. Báo trước khi xóa qua phương thức đã đăng ký lúc đóng băng, còn 7 ngày và 24 giờ; nếu thông báo trước xóa gửi lỗi thì hoãn xóa và tạo việc hỗ trợ. Kiểm tra lại OPLAN-06 tại thời điểm xóa. Kho Owner Free không có ngày hết hạn gói nên đóng băng nhưng không tự xóa theo quy tắc này.
- **OPLAN-06:** Job xóa **kho nguồn trả phí** chỉ chạy khi kho vẫn đóng băng, gói không còn hạn, Owner chưa điểm danh hợp lệ và không có hồ sơ chứng tử đang xét, quy trình bàn giao đang chạy, quyền Beneficiary hoặc bản bàn giao còn hạn, khiếu nại, sự cố hoặc tham chiếu lưu giữ cần bảo vệ. Nếu có điều kiện chặn, hoãn xóa và ghi lý do; khi điều kiện hết thì kiểm tra lại trước khi xóa. Gia hạn hợp lệ trước xóa hủy mốc xóa theo gói cũ nhưng không tự gỡ đóng băng. Dữ liệu đã thực sự xóa không phục hồi; audit/tombstone giữ theo STORE-04.
- **OPLAN-07:** Giấy chứng tử thiếu hoặc không đạt thì Verifier yêu cầu bổ sung hoặc từ chối hồ sơ; không đặt lịch và không bàn giao. Kho nguồn tiếp tục theo trạng thái gói Owner hiện hành. Giấy mới được xét trong hồ sơ mới hoặc phiên bổ sung của hồ sơ đang mở; giữ liên kết lịch sử, không tự xóa kho chỉ vì hồ sơ bị từ chối.
- **OPLAN-08:** Kho Owner Free và kho cá nhân của Beneficiary không bị xóa theo hạn gói Owner trả phí. Quy tắc quota và lưu giữ riêng của kho cá nhân vẫn áp dụng. Không xóa tài khoản người dùng chỉ vì kho nguồn đủ điều kiện xóa.
- **PDF-01:** Chỉ Owner có XS Max còn hạn được xuất PDF. Ghi tên an toàn, loại tài sản, người được chỉ định trên từng tài sản, kho hệ thống tự gom/gói/phiên bản, quy tắc chuyển có thể đổi/hủy trước lúc bắt đầu, đồng sở hữu cần đồng thuận, ngày bàn giao và thời hạn suy nghĩ lại, Executor/nhân sự thay thế, điểm danh, trạng thái, giờ xuất; bản nháp ghi rõ nháp. Không chứa tài khoản, mật khẩu, ghi chú bảo mật, khóa, nội dung hay chứng cứ định danh. Không tạo URL công khai hoặc lịch sử PDF trong MVP.

## 2.2. Luồng chính 2 – Điểm danh định kỳ và xử lý khi chủ sở hữu không phản hồi

### Mục tiêu

Nhắc Owner theo lịch nếu chức năng điểm danh được bật. Khi hết cả thời gian chờ mà Owner chưa điểm danh, hệ thống tạm treo điểm danh 90 ngày và báo Executor kiểm tra nếu kho có người được chỉ định; sau 90 ngày chưa có phản hồi thì đóng băng kho. Không suy ra qua đời hoặc mở bàn giao từ việc không phản hồi.

### Người tham gia

Owner; hệ thống gửi nhắc, quản lý mốc tạm treo/đóng băng; Executor nhận cảnh báo nếu kho đã có người được chỉ định.

### Điều kiện bắt đầu

Owner đã bật điểm danh trên kho nguồn Free, XS hoặc XS Max. Thời hạn tạm treo mặc định 90 ngày áp dụng như nhau cho ba hạng. Executor vẫn có thể nộp giấy chứng tử độc lập với luồng này.

### Điểm danh và nhắc nhở độc lập

- **DMS-01:** Chu kỳ chọn 30/60/90 ngày, mặc định 30; thời gian chờ 7/14/30 ngày, mặc định 7. Sau thời gian chờ, thời hạn tạm treo là **90 × 24 giờ** mặc định và cố định cho mọi hạng kho nguồn Owner Free, XS, XS Max. Cấu hình chu kỳ/thời gian chờ mới chỉ áp dụng từ kỳ kế tiếp khi quyền dịch vụ cho phép.
- **DMS-02:** Kỳ đầu tính từ kích hoạt, kỳ tiếp theo từ xác nhận điểm danh hợp lệ. Đăng nhập hoặc thanh toán đơn thuần không được coi là điểm danh.
- **DMS-03:** Đến hạn điểm danh, gửi nhắc Owner và bắt đầu thời gian chờ đã cấu hình. Owner điểm danh hợp lệ trong thời gian chờ thì kết thúc kỳ chờ và tính kỳ tiếp theo theo DMS-02.
- **DMS-04:** Hết cả thời gian chờ mà Owner vẫn chưa điểm danh, ghi `CHECKIN_SUSPENDED` cho kỳ đó, lưu `suspended_at` và `freeze_at = suspended_at + 90 × 24 giờ`, tạm dừng tạo kỳ điểm danh mới và báo Owner qua phương thức đã lưu. Kho XS/XS Max đã chỉ định Executor thì gửi thêm cảnh báo cho Executor; kho Owner Free không có Executor nên không tạo việc Executor. Trong 90 ngày tạm treo, kho chưa bị đóng băng bởi điểm danh; Owner có thể tự điểm danh hợp lệ để kết thúc tạm treo. Cảnh báo Executor chỉ yêu cầu kiểm tra tình hình, không phải kết luận Owner đã qua đời.
- **DMS-05:** Với kho có Executor, người này xác nhận đã xem cảnh báo và ghi `NO_CERTIFICATE_AVAILABLE` nếu chưa có giấy, hoặc nộp giấy theo luồng chính 3. `NO_CERTIFICATE_AVAILABLE` đóng **việc cảnh báo**, nhưng **không dừng hoặc đặt lại** mốc 90 ngày; không tạo hồ sơ, mời Beneficiary, tiết lộ tài sản, chuyển quyền hoặc đặt hạn bàn giao. Nộp giấy thành công khi việc còn mở thì đóng việc với `CERTIFICATE_SUBMITTED`. Nếu đã đóng vì chưa có giấy, Executor vẫn được nộp giấy về sau mà không sửa kết quả cũ. Chỉ phê duyệt của Verifier mới cho phép chuyển sang luồng chính 4.
- **DMS-06:** Nếu Owner điểm danh hợp lệ sau cảnh báo và **trước khi hồ sơ chứng tử được nộp**, kết thúc `CHECKIN_SUSPENDED` hoặc `FROZEN_INACTIVITY`, hủy mốc xóa do không điểm danh, ghi thời điểm phản hồi và tính kỳ tiếp theo từ lần điểm danh đó. Nếu gói trả phí đã hết hạn, kho vẫn chịu giới hạn dịch vụ đến khi gia hạn. Việc cảnh báo còn mở được đóng với `OWNER_CHECKED_IN`; kết quả `NO_CERTIFICATE_AVAILABLE` đã ghi được giữ nguyên. Đây là xử lý điểm danh của chính Owner, không phải quy trình đảo ngược hồ sơ bàn giao đã duyệt.
- **DMS-07:** Thông báo khi bắt đầu tạm treo, còn 30 ngày/7 ngày/24 giờ trước đóng băng và lúc đóng băng; thông báo trước xóa theo OPLAN-05. Không chứa tên tài sản, tài khoản, mật khẩu hoặc ghi chú. Tác vụ lặp không gửi trùng, không tạo nhiều cảnh báo cho một kỳ hoặc đặt lại mốc 90 ngày.
- **DMS-08:** Với kho đã có Executor, việc cảnh báo chưa được xử lý được nhắc sau 48 giờ và đánh dấu quá hạn cho Admin sau 72 giờ theo quy tắc việc thủ công. Nếu Executor không còn đủ điều kiện, áp dụng thay thế nhân sự ở luồng chính 3. Quá hạn chỉ là việc cần xử lý, không tự phê duyệt giấy hoặc bàn giao.
- **DMS-09:** Tại `freeze_at`, nếu Owner chưa điểm danh hợp lệ và hồ sơ chứng tử chưa được phê duyệt, chuyển kho sang `FROZEN_INACTIVITY`: chặn thêm/sửa tài sản, thay chỉ định và mở kỳ điểm danh mới; vẫn cho Owner xác thực, xem/tải dữ liệu còn hợp lệ, điểm danh theo DMS-06 khi chưa có hồ sơ chứng tử, gia hạn, và cho Executor/Verifier xử lý giấy chứng tử theo vai trò. Đóng băng không cấp quyền Beneficiary hoặc tự xóa dữ liệu.
- **DMS-10:** Nộp hồ sơ chứng tử trước/sau `freeze_at` không tự bàn giao và chặn job xóa kho nguồn trong khi hồ sơ đang xét. Nếu Verifier phê duyệt, kết thúc đồng hồ điểm danh/tạm treo và bảo vệ kho cho luồng chính 4 cùng các hạn lưu của người nhận; hết gói trả phí không hủy quyền bàn giao. Nếu hồ sơ bị từ chối, trạng thái tạm treo/đóng băng tiếp tục theo mốc gốc, không cấp lại 90 ngày.

## 2.3. Luồng chính 3 – Nộp và xác minh giấy chứng tử

### Mục tiêu

Executor nộp giấy chứng tử và tick cam kết trách nhiệm; Verifier kiểm tra đúng phiên bản giấy, tick cam kết và phê duyệt. Phê duyệt là mốc mở luồng 4.

### Người tham gia

Executor; Verifier; hệ thống kiểm tra hồ sơ và phân công nhân sự.

### Điều kiện bắt đầu

Executor đã nhận phân công và có giấy chứng tử. Không cần chờ điểm danh quá hạn.

### Nộp và xác minh giấy chứng tử

#### Hai xác nhận trách nhiệm trước bàn giao

1. Executor đã nhận phân công có thể chủ động mở hồ sơ và nộp giấy chứng tử mà không cần chờ một mốc điểm danh. Nhập thông tin người qua đời, ngày mất, số/ngày cấp, cơ quan cấp, thông tin xác minh của giấy nếu có, rồi tải bản giấy chứng tử.
2. Trước nút **Nộp giấy chứng tử**, Executor phải tự tick ô mặc định chưa chọn với nhãn **“Tôi chịu trách nhiệm trước pháp luật”**. Phần mô tả ngay cạnh ô xác định đây là cam kết về tính đúng đắn của giấy và thông tin Executor nộp. Không tick thì API từ chối nộp.
3. Hệ thống kiểm tra tài khoản/người nộp, đủ trường, định dạng, checksum, tài liệu trùng và lưu phiên bản giấy cùng bản ghi tick của Executor. Chụp snapshot danh sách người nhận, kho/manifest và phiên bản tài sản. Nộp thành công chuyển hồ sơ sang `UNDER_REVIEW`; chưa gửi thông báo bàn giao.
4. Verifier được phân công xem giấy và thông tin xác minh, đối chiếu đúng Owner, kiểm tra giấy đầy đủ và ghi kết quả. Nếu thiếu hoặc không khớp, yêu cầu bổ sung hoặc từ chối kèm lý do; hồ sơ chưa sang bàn giao. Mỗi lần Executor bổ sung/thay giấy tạo phiên bản mới và phải tick lại ô trách nhiệm khi nộp.
5. Khi xác nhận giấy chứng tử đạt yêu cầu, Verifier phải tự tick ô mặc định chưa chọn với nhãn **“Tôi chịu trách nhiệm trước pháp luật”** trước khi bấm **Phê duyệt**. Phần mô tả ngay cạnh ô xác định đây là cam kết về kết quả kiểm tra giấy. Không tick thì API từ chối phê duyệt. Verifier không được tick hộ Executor và ngược lại.
6. Hệ thống ghi `APPROVED_FOR_DELIVERY` chỉ khi giấy cùng phiên bản đã có bản ghi tick của Executor, kết quả kiểm tra đạt và bản ghi tick/phê duyệt của Verifier hợp lệ. **Đây là mốc duy nhất khởi động quy trình tiếp theo:** hệ thống thông báo dự kiến bàn giao cho mọi Beneficiary trong snapshot; các bên thống nhất ngày và Executor ghi ngày đó theo luồng chính 4. Không tự phát hành tài sản tại thời điểm duyệt.

- **DEATH-01:** Giấy chứng tử do Executor nộp và được Verifier kiểm tra/phê duyệt là căn cứ mở bàn giao. Điểm danh hoặc thông tin do một bên tự khai mà không có giấy và xác nhận của cả hai vai trò không đủ điều kiện.
- **DEATH-02:** Hai ô cam kết phải được tick chủ động, riêng từng người và gắn với đúng `death_certificate_version_id`, `person_id`, vai trò, nội dung cam kết, thời điểm máy chủ, kết quả xác thực và hash của giấy. Ô không được chọn sẵn; tài khoản khác, Admin hoặc thao tác lặp không được tạo bản ghi thay.
- **DEATH-03:** Mỗi kho nguồn tối đa một hồ sơ chứng tử đang hiệu lực. Bổ sung giấy trong hồ sơ mở giữ lịch sử phiên bản; hồ sơ bị từ chối có thể nộp hồ sơ mới liên kết lịch sử, không mở song song.
- **DEATH-04:** Mỗi quyết định phê duyệt ghi Verifier, phiên bản giấy đã kiểm tra, kết quả, thời điểm và snapshot tài sản/chỉ định gốc/kho tự gom được phép bàn giao. Bản giấy thiếu, sai Owner hoặc chưa có đủ hai bản ghi tick không thể thông báo và ghi ngày ở luồng chính 4.

#### Trạng thái hồ sơ

`DRAFT` → `UNDER_REVIEW` → `ADDITIONAL_DOCUMENTS_REQUIRED` / `APPROVED_FOR_DELIVERY` / `REJECTED`.

Hồ sơ được duyệt mới cho phép đặt lịch và thông báo; trạng thái này chưa đồng nghĩa người thụ hưởng đã nhận. Hồ sơ thiếu nhân sự hoặc giấy chưa đạt giữ ở trạng thái chờ tương ứng, không tự chuyển sang bàn giao.

### Nhân sự xử lý hồ sơ

Các danh sách dự phòng trong mục này dành cho **nhân sự xử lý hồ sơ**, không phải tầng người thừa kế.

- **ASSIGN-01:** Khi thiết lập kho, chủ sở hữu chỉ định một Executor chính, danh sách Executor dự phòng theo thứ tự và có thể chọn danh sách Verifier thay thế ưu tiên từ nhóm Verifier đã được phê duyệt. Để được ghi nhận sẵn sàng, từng người phải xác minh tài khoản, còn đủ điều kiện và chấp nhận vai trò. Owner phải xác nhận trước việc cho phép hệ thống chọn người từ nhóm đã phê duyệt khi danh sách ưu tiên không còn người hợp lệ. Không gửi thông báo cho Beneficiary chỉ vì việc chỉ định này.
- **ASSIGN-02:** Khi nộp hồ sơ lần đầu, hệ thống phân công Verifier ban đầu từ nhóm Verifier đã được phê duyệt; danh sách thay thế ưu tiên do Owner chọn chỉ được dùng khi người đang phân công mất điều kiện. Người được chọn phải chấp nhận nhiệm vụ trước khi xử lý. Danh sách được phê duyệt, tiêu chí chọn và quy trình cấp vai trò phải có lịch sử; bản demo dùng các tài khoản chuẩn bị sẵn.
- **ASSIGN-03:** Khi Executor hoặc Verifier bị thu hồi quyền, tài khoản bị khóa, thông tin đủ điều kiện hết hiệu lực, từ chối tiếp tục hoặc được ghi nhận không thể tiếp tục, hệ thống chặn thao tác mới, thu hồi quyền xử lý chưa dùng và tạm dừng phần chưa bàn giao. Lịch sử ô tick, quyết định và dữ liệu đã phát hành được giữ nguyên.
- **ASSIGN-04:** Hệ thống ưu tiên mời lần lượt ứng viên dự phòng do Owner chọn trước cho đúng vai trò. Người từ chối, hết hạn hoặc không còn đủ điều kiện bị bỏ qua và không được mời lặp lại cho cùng sự cố. Nếu chỉ một vai trò mất điều kiện thì giữ nguyên người ở vai trò còn lại nếu họ vẫn hợp lệ.
- **ASSIGN-05:** Khi danh sách của Owner hết người hợp lệ, hệ thống chuyển sang `SYSTEM_POOL_SELECTION` và chọn đúng vai trò từ nhóm nhân sự đã được phê duyệt. Hệ thống không được chọn một tài khoản người dùng thông thường ngoài nhóm này. Quyền dùng nhóm hệ thống chỉ có hiệu lực khi Owner đã xác nhận trước theo ASSIGN-01.
- **ASSIGN-06:** Executor và Verifier phải là hai cá nhân khác nhau theo `person_id`, không chỉ hai tài khoản. Không cá nhân nào đồng thời là Owner hoặc Beneficiary của cùng hồ sơ, bao gồm toàn bộ danh sách người thụ hưởng trong snapshot. Không suy luận quyền hoặc xung đột chỉ từ quan hệ gia đình. Kiểm tra khi phân công, thay thế, sửa chỉ định và trước cam kết; đổi email/tài khoản không bỏ qua điều kiện này.
- **ASSIGN-07:** Mọi lời mời nhiệm vụ hết hạn sau 48 giờ kể từ khi gửi thành công. Mỗi lần chỉ mời một ứng viên cho một vai trò; từ chối hoặc hết hạn thì mời người kế tiếp. Chạy lại tác vụ không tạo lời mời hoặc phân công trùng.
- **ASSIGN-08:** Ứng viên từ nhóm hệ thống phải có `eligibility_status = ACTIVE`, thông tin đủ điều kiện chưa hết hạn, tài khoản hoạt động, đang sẵn sàng nhận việc và thỏa ASSIGN-06. Hệ thống ưu tiên người có ít hồ sơ đang xử lý nhất; nếu bằng nhau, ưu tiên thời điểm sẵn sàng sớm hơn rồi mã tài khoản để kết quả ổn định. Lưu danh sách ứng viên được xét, tiêu chí và kết quả chọn.
- **ASSIGN-09:** Người thay thế chỉ xem dữ liệu cần cho vai trò, không đổi người nhận hoặc đọc tài sản. Nếu cần nộp bản giấy mới, Executor mới phải tự tick cam kết khi nộp; nếu cần ra quyết định mới, Verifier mới phải tự kiểm tra và tick cam kết khi phê duyệt. Nhận nhiệm vụ không kế thừa ô tick của người cũ cho hành động mới. Quyền đã commit hợp lệ không đòi xác nhận lại chỉ vì thay nhân sự.
- **ASSIGN-10:** Chỉ tiếp tục khi đủ cả hai vai trò, mỗi người đã nhận nhiệm vụ, không còn sự cố chặn và các xác nhận của phiên bản giấy hiện hành đã đáp ứng. Nếu nhóm hệ thống không còn ứng viên hợp lệ, hồ sơ giữ `ASSIGNMENT_BLOCKED`; Admin chỉ được bổ sung nhân sự đủ điều kiện, không được duyệt hồ sơ hoặc cấp quyền tài sản. Ghi người cũ, người mới, lý do, thời điểm mời, chấp nhận và kết quả bàn giao hồ sơ.

Mỗi việc thủ công có người phụ trách, ngày tạo, nhắc sau 48 giờ, cờ quá hạn sau 72 giờ và kết quả. Quá hạn chỉ tạo cảnh báo cho Admin, không tự duyệt hoặc đóng hồ sơ. Khiếu nại trùng gộp vào cùng sự cố; bằng chứng mới giữ lịch sử.

## 2.4. Luồng chính 4 – Thông báo, chốt ngày và bàn giao theo kho tự gom

### Mục tiêu

Sau khi hồ sơ chứng tử được duyệt, thông báo cho mọi người thụ hưởng, ghi một ngày bàn giao chung đã thống nhất và chỉ bắt đầu khi Executor bấm **Bắt đầu bàn giao**. Trước thao tác đó, người nhận gốc của kho một người được đổi hoặc hủy lựa chọn chuyển nguyên kho. Sau thao tác đó, người nhận chỉ được nhận hoặc từ chối; kho đồng sở hữu cần đủ sự đồng ý trước khi cấp quyền cho bất kỳ ai.

### Người tham gia và điều kiện bắt đầu

Executor; Beneficiary; Verifier xử lý ngoại lệ; hệ thống thông báo và cấp quyền. Hồ sơ ở `APPROVED_FOR_DELIVERY`, hai bản tick trách nhiệm hợp lệ, snapshot chỉ định theo tài sản và manifest kho tự gom đã chốt, không có sự cố chặn.

### Thông báo và ghi ngày bàn giao

1. Ngay sau phê duyệt, hệ thống gửi cho **tất cả** người thụ hưởng gốc trong snapshot thông báo “Bạn được chỉ định nhận bàn giao tài sản”. Thông báo chỉ nêu metadata an toàn, các kho một người hoặc đồng sở hữu liên quan và cách thống nhất ngày; chưa cấp quyền đọc nội dung hoặc khóa.
2. Các bên thống nhất **một ngày bàn giao chung** cho toàn bộ hồ sơ. Sau khi nhận kết quả thống nhất, chỉ Executor đang được phân công được chọn ngày trong menu và xác nhận đó là ngày các bên đã thống nhất. Hệ thống lưu người chọn, ngày theo `Asia/Ho_Chi_Minh`, thời điểm ghi nhận, phiên bản lịch và thông báo ngày đó cho mọi người liên quan. Đổi ngày cần Executor ghi lý do và thông báo lại; không âm thầm giữ lịch cũ.
3. Người thụ hưởng đã xác minh thấy các **kho dự kiến nhận** như những mục riêng: kho do Owner chỉ định, kho đồng sở hữu và kho người khác dự kiến chuyển đến. Mỗi mục cho xem tên an toàn, số/loại tài sản, dung lượng, người cùng nhận nếu có và trạng thái. Kho chuyển đến được đánh dấu “Dự kiến”; chưa mở nội dung và chưa nhập chung vào manifest kho gốc khác của cùng người.
4. Thông báo lịch phải gửi thành công qua phương thức đã lưu cho mọi người nhận gốc và đích chuyển đang có hiệu lực. Gửi lỗi thì thử lại và tạo việc hỗ trợ; thiếu thông báo hợp lệ thì Executor chưa được bấm bắt đầu.

### Chọn, đổi và hủy chuyển trước khi bắt đầu

- **REDIST-01 — Nguồn:** Chỉ người được Owner chỉ định **một mình** cho kho `SINGLE_RECIPIENT` được chọn chuyển nguyên kho đó. Kho `CO_OWNED` không có nút hoặc API chuyển, kể cả khi một người không muốn nhận. Trước khi bắt đầu không có quyết định Nhận/Từ chối cuối cùng.
- **REDIST-02 — Đích:** Chọn đúng **một** người khác trong danh sách Beneficiary của cùng snapshot, danh tính hợp lệ và chưa có quyền trên chính kho đó. Người đích vẫn có thể đã được Owner chỉ định nhận kho khác; không chọn người ngoài danh sách, chính mình, Executor hoặc Verifier của hồ sơ.
- **REDIST-03 — Nguyên kho:** Lựa chọn áp dụng toàn bộ tài sản trong một kho hệ thống đã gom theo tập người nhận gốc. Không chọn file/tài sản con, tỷ lệ hoặc nhiều đích. Nếu A và C cùng được chỉ định riêng cho người 1, cả hai ở cùng kho và luôn được chuyển cùng nhau. Kho đồng sở hữu của người 1 và 2 là kho khác, không đi theo.
- **REDIST-04 — Có thể sửa:** Trước lúc Executor bấm bắt đầu, người tạo lựa chọn có thể thay đích hoặc hủy. Mỗi kho chỉ có **một lựa chọn chuyển đang hiệu lực**; thay đích vô hiệu lựa chọn trước, hủy đưa quyền dự kiến về người gốc. Chỉ người gốc được sửa/hủy lựa chọn của mình; đích chuyển không được chuyển tiếp quyền này. Mỗi thao tác có xác thực, phiên bản chống ghi đè, lịch sử và thông báo cho đích cũ/mới.
- **REDIST-05 — Chưa bàn giao:** Chọn/đổi/hủy chỉ sửa người nhận **dự kiến**, không tạo `HANDOVER_COMMITTED`, grant hoặc quyết định từ chối cuối. Đích chuyển không được đọc nội dung và không thể bấm Nhận trước khi bắt đầu. Chỉ định tài sản gốc của Owner và manifest đã duyệt không bị sửa.
- **REDIST-06 — Chốt nguyên tử:** Khi Executor bấm bắt đầu, hệ thống khóa các thao tác chuyển và chụp lựa chọn cuối cùng. Nếu đang có lựa chọn chuyển hợp lệ thì quyền nhận cuối của kho chuyển sang đích; nếu đã hủy hoặc chưa chọn thì giữ người gốc. Lệnh chuyển/đổi/hủy đến cùng lúc với thao tác bắt đầu chỉ có một thứ tự kết quả. Sau khi chốt, người gốc không thể lấy lại kho; đích từ chối về sau cũng không tự trả kho cho người gốc hay người thứ ba.

### Executor bắt đầu và người thụ hưởng quyết định

1. Vào **ngày bàn giao đã ghi nhận hoặc sau ngày đó**, Executor bấm **Bắt đầu bàn giao**. Hệ thống kiểm tra người thực thi, hồ sơ, lịch/thông báo và các chặn hiện hành; ghi `handover_started_at`, cố định người nhận cuối và gửi thông báo mở nhận. Đến ngày không tự chạy bàn giao. Nếu Executor chậm bấm, quyền đổi/hủy chuyển vẫn tồn tại đến đúng thời điểm bấm; hệ thống nhắc việc quá hạn.
2. Kể từ `handover_started_at`, mọi người nhận cuối chỉ thấy **Nhận** hoặc **Từ chối** trên từng kho được giao; không có nút chuyển, đổi đích hoặc hủy chuyển. Người nhận xác minh và ký đúng kho/manifest khi bấm Nhận. Mỗi kho có cửa sổ phản hồi ban đầu chung 7 × 24 giờ từ lúc bắt đầu; hết cửa sổ mà chưa trả lời thì **đóng băng để suy nghĩ lại**, không tự bàn giao hoặc tự chuyển người khác.
3. **Kho một người:** Nhận hợp lệ thì ghi `HANDOVER_COMMITTED` và cấp một grant nguyên kho. Từ chối thì đóng băng kho cho đúng người nhận cuối trong **2 năm**; trong hạn người đó có thể đổi từ Từ chối sang Nhận, xác minh/ký rồi được bàn giao. Từ chối không trả kho đã chuyển về người gốc.
4. **Kho đồng sở hữu:** Từng người được Owner chỉ định ký quyết định riêng, nhưng một lời đồng ý chỉ được ghi nhận, **chưa cấp grant**. Chỉ khi tất cả người đồng sở hữu đồng ý thì hệ thống cam kết bàn giao cùng manifest và cấp grant cho từng người trong một kết quả nguyên tử. Nếu ít nhất một người từ chối, hoặc có người không phản hồi khi hết 7 ngày, **toàn bộ kho** đóng băng; không ai được truy cập. Người từ chối/chưa trả lời có thể đổi sang Nhận trong hạn 2 năm. Khi đủ mọi đồng ý trong hạn, bàn giao cho tất cả; không thay hoặc chia nhóm đồng sở hữu.
5. Đóng băng bắt đầu tại lần Từ chối đầu tiên sau khi bắt đầu, hoặc khi hết 7 ngày phản hồi ban đầu mà kho còn người chưa trả lời, tùy mốc nào đến trước. Đồng hồ 2 năm không đặt lại do từ chối/nhắc lại; sự cố được xác minh chỉ tạm dừng đúng phạm vi và tiếp tục phần thời gian còn lại sau thông báo. Đến hạn mà chưa có kết quả Nhận hợp lệ hoặc chưa đủ đồng thuận đồng sở hữu, hệ thống hủy **quyền bàn giao kho đó**, lưu lịch sử và không chỉ định người khác. Xóa dữ liệu thật chỉ theo CLOSE-05 và khi không còn quyền/tham chiếu phải giữ.
6. Sau `HANDOVER_COMMITTED`, mỗi người có 168 giờ xem/tải miễn phí tính từ cam kết của mình và được gia hạn một lần 48 giờ theo quy tắc hiện hành. Có thể nhập từng tài sản vào kho cá nhân trong hạn. Việc tự đưa tài sản cho người khác sau khi nhận nằm ngoài LegacyVault, không sửa lịch sử hoặc cấp thêm grant.

### Trạng thái, thời gian và kiểm soát truy cập

- **SIGN-01:** Trước phát hành cần bản tick Executor khi nộp chứng tử, bản tick và quyết định phê duyệt Verifier trên cùng phiên bản giấy, bản xác nhận kế hoạch của Owner và chữ ký Nhận của đúng Beneficiary trên kho/manifest. Lựa chọn chuyển hợp lệ thuộc chính sách Owner đã xác nhận, ghi nguồn/đích/phiên bản; đổi đích/hủy không sửa manifest hoặc chữ ký nguồn.
- **SIGN-02:** Thứ tự: Executor nộp và tick trách nhiệm → Verifier kiểm tra, tick và duyệt → hệ thống thông báo → các bên thống nhất ngày → Executor ghi ngày → người nhận gốc chọn/đổi/hủy chuyển → Executor bấm bắt đầu → người nhận cuối ký Nhận hoặc Từ chối → cam kết khi đủ điều kiện.
- **TIME-01:** Lưu mốc thời gian UTC, hiển thị `Asia/Ho_Chi_Minh`. Ngày bàn giao là ngày lịch tại múi giờ này; Executor không được bấm bắt đầu trước ngày đã lưu. Đợt phản hồi ban đầu dài 168 giờ từ `handover_started_at`. Hạn suy nghĩ lại là **2 năm lịch** từ `freeze_started_at`; nếu mốc là 29/02 thì ngày hết hạn là 28/02 của năm đích. Tại đúng hạn, thao tác nhận bị từ chối trừ khi đồng hồ đang tạm dừng hợp lệ.
- **TIME-02:** Thao tác chuyển/đổi/hủy chỉ hợp lệ khi chưa có `handover_started_at`. Thời điểm bấm bắt đầu do máy chủ ghi, không dùng đồng hồ thiết bị người dùng. Retry không tạo lịch, lựa chọn chuyển, cam kết hoặc grant trùng.
- **TIME-03:** Gửi lỗi thử lại sau 15 phút, 1 giờ, 6 giờ, 24 giờ, 48 giờ; sau 72 giờ tạo việc hỗ trợ. Nhắc ngày bàn giao, còn 72/24 giờ của cửa sổ phản hồi và còn 30/7/1 ngày của hạn suy nghĩ lại; không chứa nội dung bí mật.
- **TIME-04:** Thiếu nhân sự, gian lận, tranh chấp, Owner báo còn sống hoặc lỗi dịch vụ được xác minh chặn đúng phạm vi. Gỡ chặn tiếp tục phần thời gian còn lại sau thông báo; không tự cấp thêm hai năm. Verifier có thể ghi đợt khắc phục 24 giờ cho lỗi dịch vụ trên quyền chưa kết thúc.
- **TIME-05:** Tải/xem miễn phí 168 giờ từ commit; gia hạn đúng một lần 48 giờ khi `0 < remaining <= 24 giờ`, chưa dùng và không bị chặn. Phiên tải 15 phút không kéo dài hạn truy cập.

Các trạng thái của kho bàn giao gồm `WAITING_FOR_SCHEDULE`, `SCHEDULED`, `HANDOVER_STARTED`, `PENDING_RESPONSE`, `FROZEN_RECONSIDERATION`, `HANDOVER_COMMITTED`, `CANCELLED_WITHOUT_DELIVERY`. Lựa chọn chuyển có lịch sử `ACTIVE`, `REPLACED`, `CANCELLED`, `FINALIZED`. Trạng thái truy cập của từng người tách riêng: `ACTIVE`, `BLOCKED`, `EXPIRED`, `DELETED`. Đồng sở hữu chưa đủ đồng ý chỉ ở `PENDING_RESPONSE` hoặc `FROZEN_RECONSIDERATION`, không tạo grant một phần.

### Kết thúc, lưu trữ và xóa

- **CLOSE-01:** Hồ sơ xác minh được duyệt, lịch đã ghi, kho đang chờ và kho đóng băng đều **chưa** là kết quả bàn giao thành công. Quá trình chỉ kết thúc khi mọi kho đã cam kết hoặc hủy bàn giao và không còn sự cố mở.
- **CLOSE-02:** Kho một người kết thúc khi người nhận cuối đã Nhận hoặc hết hai năm suy nghĩ lại. Kho đồng sở hữu kết thúc thành công chỉ khi tất cả Nhận; nếu thiếu một người đến hết hạn thì hủy bàn giao **toàn bộ kho**, kể cả người đã bấm Nhận trước đó nhưng chưa được cấp quyền.
- **CLOSE-03:** Quyết định hủy ghi kho/manifest, người nhận, lý do từ chối hoặc không phản hồi, `freeze_started_at`, `freeze_expires_at`, thời điểm và bằng chứng. Verifier xử lý riêng tranh chấp hoặc không xác minh được danh tính; không tự gán kho cho người khác.
- **CLOSE-04:** `HANDOVER_COMMITTED` và lịch sử chuyển/đổi/hủy không bị ghi đè. Nếu kho đã cam kết, hết hạn tải hoặc chặn truy cập không đảo người nhận. Kho đồng sở hữu chỉ cam kết một lần khi đủ đồng thuận, nhưng mỗi người có grant và hạn tải riêng.
- **CLOSE-05:** Giữ bản liên quan tối thiểu 720 giờ **sau quyết định hủy bàn giao vì hết hạn suy nghĩ lại**, rồi chỉ xóa bản không còn phục vụ quyền Owner, người đã nhận, bản nhập kho cá nhân, hồ sơ/sự cố hoặc khiếu nại. Không xóa toàn kho nguồn chỉ vì một người từ chối; backup/audit/tombstone theo STORE-04.
- **STORE-01:** Bản đã bàn giao chưa nhập kho cá nhân giữ 30 ngày từ hạn tải miễn phí, gồm gia hạn nếu có. Trong hạn giữ có thể yêu cầu nhập kho nhưng không tự mở lại tải miễn phí.
- **STORE-02:** Job import hợp lệ trước hạn được thử lại sau hạn nếu lỗi vật lý, không trả tiền thêm. Giữ chỗ quota và kiểm tra bản mã/khóa/checksum trước khi báo thành công.
- **STORE-03:** Cleanup kiểm tra lại hạn, dịch vụ, chặn, khiếu nại, import và mọi tham chiếu. Không xóa dữ liệu đang được việc hợp lệ sử dụng.
- **STORE-04:** Bản thực sự xóa được loại khỏi backup trong tối đa 7 ngày. Audit giữ tối thiểu 365 ngày và suốt thời gian hồ sơ mở; không chứa bí mật. Khôi phục phải áp dụng tombstone, không hồi sinh quyền/tài sản đã xóa.

### Tải và bàn giao sau khi nhận

- **DEL-01:** Không giới hạn lượt tải trong hạn; hỗ trợ tải tiếp file. Liên kết một lần đổi lấy phiên 15 phút; phiên không kéo dài hạn.
- **DEL-02:** Mỗi lần đọc/xuất payload hoặc tải chunk kiểm tra person, grant, kho/manifest/phiên bản, tài sản thuộc manifest, hạn hoặc quyền kho cá nhân và chặn. Không chỉ dựa vào phiên đã cấp.
- **DEL-03:** Cam kết và grant nguyên tử; lỗi sau commit thử lại cùng giao dịch. Một người chỉ có một grant cho cùng kho/phiên bản trong hồ sơ.
- **DEL-04:** Hoàn tất tải chỉ ghi khi client báo đủ byte/checksum; không kết luận người dùng đã đọc hoặc tự bàn giao bên ngoài.
- **DEL-05:** Người nhận chung kho có quyền xem/tải riêng **sau khi cả nhóm cùng được cam kết**; không tiết lộ nội dung khi mới có một phần lời đồng ý.

### Thanh toán mô phỏng và kho người nhận

- **PAY-01:** Import chỉ lấy tài sản thuộc gói người đó đã nhận, đúng phiên bản, trong hạn lưu, không bị chặn và vừa quota kể cả giữ chỗ. Cho chọn từng tài sản; lựa chọn không đổi quyền nhận nguyên gói. Một job/tài sản nguồn không nhập trùng. Kho cá nhân không có DMS hoặc chức năng bàn giao tiếp.
- **PAY-02:** Đơn ghi người trả, loại kho/kho đích, phiên bản gói dịch vụ, giá/quota, mục đích, thời hạn và nội dung chọn nhập nếu có. Free không có đơn 0đ. Chỉ callback demo đã xác thực và khớp snapshot mới cấp dịch vụ; không dùng trang redirect làm bằng chứng.
- **PAY-03:** Mỗi kho/dịch vụ chỉ có một đơn `PENDING`; bấm lại trả cùng đơn, đổi lựa chọn phải hủy. Đơn hết hạn sau 15 phút; đơn kèm import dùng mốc sớm hơn giữa 15 phút và hạn lưu nguồn. Đúng hạn hoặc trễ không cấp quyền; ghi callback trễ. `SUCCESS` là kết quả cuối; callback lặp không cấp dịch vụ/nhập/gia hạn thêm.
- **PAY-04:** `FAILED`, `CANCELLED`, `EXPIRED` không cấp gói. Thành công kèm import phải cấp gói và ghi job hợp lệ cùng giao dịch; lỗi nhập vật lý được thử lại sau hạn, không trả thêm. Đơn gia hạn độc lập không phụ thuộc hạn nguồn nhưng không tự gỡ chặn dữ liệu.
- **PAY-05:** Plus có 30 × 24 giờ; gia hạn sớm cộng từ hạn cũ, muộn tính từ callback. Hết Plus: nếu vừa Free thì giữ; nếu vượt, có 30 ngày tải dữ liệu hợp lệ, chọn giữ tối đa 2 tài sản/20 MiB, xóa hoặc gia hạn; không import thêm.
- **PAY-06:** Trong thời gian vượt Free chưa xóa phần không chọn trước hạn, trừ yêu cầu xóa riêng. Nếu chưa chọn, xét `imported_at` tăng dần rồi mã mục, giữ mục nếu vừa cả quota số lượng/dung lượng; bỏ mục không vừa rồi xét tiếp. Hiển thị danh sách giữ/xóa; lựa chọn rỗng đã xác nhận là không giữ gì. Tới hạn tính lại trên dữ liệu còn tồn tại và chỉ xóa mục đủ điều kiện.
- **PAY-07:** Gia hạn và cleanup đồng thời phải phân xử để không xóa dữ liệu được bảo vệ bởi gói mới. Sự cố/khiếu nại/import giữ bản cần thiết; không khôi phục bản đã xóa. Nhắc vượt hạn lúc bắt đầu và còn 7 ngày/24 giờ.
- **PAY-08:** Không lưu dữ liệu thẻ thật. Lỗi dịch vụ được xác minh được bù đúng thời gian bị chặn trên quyền dịch vụ; không bù tự động cho mạng cục bộ hoặc gian lận. Bù không đổi lịch DMS đã chốt hoặc người nhận.

## 2.5. Luồng chính 5 – Quản trị, lịch sử hoạt động và xử lý sự cố

### Mục tiêu

Bảo vệ dữ liệu, kiểm soát quyền, lưu audit và xử lý sự cố kỹ thuật trong toàn bộ vòng đời kế hoạch.

### Người tham gia

Admin; hệ thống; các vai trò nghiệp vụ trong phạm vi quyền của mình.

### Điều kiện bắt đầu

Hệ thống có dữ liệu, tài khoản hoặc hồ sơ cần kiểm soát; sự cố được ghi nhận qua quyền quản trị phù hợp.

### Bảo mật, quản trị và audit

- **SEC-01:** Mỗi phiên bản nội dung có khóa dữ liệu ngẫu nhiên riêng; AES-256-GCM với thư viện chuẩn, nonce an toàn và dữ liệu xác thực gắn kho/tài sản/phiên bản. Áp dụng như nhau cho file và payload tài khoản/ví.
- **SEC-02:** Lưu bản mã, kiểm tra toàn vẹn và khóa đã bao bọc. Khóa bao bọc tách khỏi database, source code và log. Mật khẩu đăng nhập LegacyVault không làm khóa duy nhất của tài sản; mật khẩu tài sản phải mã hóa để bàn giao, không nhầm với mật khẩu đăng nhập cần băm.
- **SEC-03:** Thành phần tin cậy xử lý nội dung rõ trong bộ nhớ khi cần, truyền HTTPS, không lưu rõ lâu dài hoặc ghi log. Demo được mô phỏng KMS bằng mô-đun riêng nhưng mã hóa và kiểm soát quyền phải chạy thật. Đây không phải cam kết mã hóa đầu cuối chống người có toàn quyền máy chủ.
- **SEC-04:** Mỗi đọc/xuất/tải kiểm tra quyền hiện hành; API Owner không làm đường vòng cấp quyền Beneficiary. Admin/Executor/Verifier không có API đọc tài sản hoặc lấy khóa qua vai trò đó.
- **SEC-05:** Chứng tử lưu/phân quyền riêng với tài sản. Verifier đọc giấy tờ theo nhiệm vụ, không đọc mật khẩu/ghi chú. PDF kế hoạch, thông báo, báo cáo và audit chỉ dùng metadata an toàn.
- **SEC-06:** Khôi phục tài khoản không trao khóa cho nhân viên hỗ trợ. Backup khóa có bảo vệ riêng và được thử khôi phục. Mất cả khóa và bản phục hồi có thể mất khả năng giải mã.
- **SEC-07:** Lộ khóa thì chặn phát hành, phiên bản thay thế dùng khóa mới. Không tuyên bố thu hồi bản/khóa đã ra ngoài. Backup khôi phục phải đối soát grant, chuyển, chữ ký, chặn và tombstone.
- **AUDIT-01:** Ghi người, thời gian, hành động, đối tượng/phiên bản, kết quả: chọn người nhận từng tài sản, tự gom/tính lại kho, điểm danh, hồ sơ/chứng tử, hai ô cam kết trách nhiệm, phê duyệt, phân công, ngày bàn giao, Executor bắt đầu, chọn/đổi/hủy/chốt chuyển, nhận/từ chối/đổi ý, đóng băng/hết hạn/hủy bàn giao, truy cập/xuất, thanh toán/import, xóa và sự cố.
- **AUDIT-02:** Mỗi lựa chọn chuyển phải truy được kho và tập người nhận gốc trong snapshot, quyền gốc, nguồn/đích cũ và mới, người sửa/hủy, phiên bản lựa chọn, thời điểm Executor bắt đầu và kết quả chốt. Ghi ngày Executor xác nhận đã thống nhất, phương thức thông báo, callback gửi, lịch sử đổi ngày, ý kiến từng đồng sở hữu, thời hạn suy nghĩ lại và kết quả cuối. Không ghi mật khẩu, OTP, seed phrase, khóa, nội dung hoặc ghi chú bảo mật.
- **ADMIN-01:** Admin quản lý nhân sự đủ điều kiện, tài khoản, gửi lỗi, cấu hình kỳ điểm danh, hệ thống và audit. Không tự ghi/đổi ngày hoặc bấm Bắt đầu bàn giao thay Executor, sửa hạn đang chạy, đánh dấu thanh toán thành công hoặc duyệt chứng tử thay Verifier.

Các tích hợp email/SMS, căn cước, chữ ký số, thanh toán và dịch vụ ngoài được mô phỏng. Lỗi dịch vụ phải dừng an toàn, không bỏ xác minh để hoàn thành demo.

# 3. TIÊU CHÍ NGHIỆM THU

| Mã | Tình huống | Kết quả cần đạt |
|---|---|---|
| AC-01 | Owner gán A, C cho người 1; B cho người 1 và 2; D cho người 3 | Hệ thống tạo đúng ba kho theo các tập `{1}`, `{1,2}`, `{3}`; A và C chung một kho, không tạo hai kho cùng tập người nhận |
| AC-02 | Verifier duyệt đúng phiên bản giấy, các bên thống nhất ngày | Mọi người nhận gốc được báo dự kiến bàn giao; chỉ Executor nhập ngày đã thống nhất và hệ thống thông báo ngày cho tất cả; chưa cấp quyền đọc |
| AC-03 | Người 1 chuyển kho gồm A, C cho người 3 trước lúc bắt đầu; người 3 đã được giao D | Một lựa chọn đang hiệu lực cho **toàn bộ A và C**, người 3 thấy kho chuyển đến tách khỏi D; chưa tạo grant, không chuyển riêng A hoặc C |
| AC-04 | Người 1 chọn hai đích hoặc người ngoài danh sách snapshot | API từ chối, giữ nguyên lựa chọn hiện hành và chỉ định gốc của Owner |
| AC-05 | Người 1, 2 đồng sở hữu B và bấm chia/chuyển | Không hiện nút, API từ chối trước và sau khi bắt đầu; không đổi nhóm đồng sở hữu |
| AC-06 | Người 1 đổi đích chuyển A, C từ người 3 sang người 2 rồi hủy trước lúc bắt đầu | Chỉ lựa chọn mới nhất có hiệu lực; sau hủy A và C trở lại người 1 dự kiến nhận; người 3 và 2 được cập nhật, lịch sử vẫn giữ |
| AC-07 | Lệnh đổi/hủy chuyển cạnh tranh với nút Bắt đầu bàn giao của Executor | Máy chủ chốt một thứ tự; sau `handover_started_at` mọi API chọn/đổi/hủy chuyển bị từ chối, không tạo hai người nhận cuối |
| AC-08 | Đến ngày đã thống nhất nhưng Executor chưa bấm Bắt đầu | Chưa mở nội dung hoặc cửa sổ phản hồi; chuyển còn sửa/hủy được. Chỉ thao tác hợp lệ của Executor mới bắt đầu bàn giao |
| AC-09 | Người 1 và 2 cùng bấm Nhận kho B | Chỉ khi đủ hai chữ ký mới tạo cam kết và grant cho cả hai trên cùng manifest; không có grant sớm cho người bấm trước |
| AC-10 | Người 1 bấm Nhận B, người 2 bấm Từ chối | B đóng băng cho cả hai, không ai đọc được. Nếu người 2 đổi sang Nhận trong 2 năm thì cả hai được cấp quyền; nếu không, hủy bàn giao toàn bộ B |
| AC-11 | Hết thời gian chờ, Owner vẫn không điểm danh trên kho XS | Ghi `CHECKIN_SUSPENDED`, đặt mốc đóng băng sau 90 × 24 giờ, báo Owner/Executor; Executor chọn `NO_CERTIFICATE_AVAILABLE` thì việc cảnh báo kết thúc nhưng mốc đóng băng không đổi |
| AC-12 | Executor nộp giấy hoặc Verifier bấm Phê duyệt khi chưa tick “Tôi chịu trách nhiệm trước pháp luật” | API chặn hành động tương ứng; không đặt lịch hoặc phát hành tài sản |
| AC-13 | Giấy chứng tử thiếu, không khớp Owner hoặc Verifier chưa xác nhận đạt | Yêu cầu bổ sung/từ chối; không chuyển `APPROVED_FOR_DELIVERY`, không đọc tài sản để kiểm tra giấy |
| AC-14 | Tạo tài khoản với mật khẩu và ghi chú 2FA | Lưu một payload mã hóa; sửa ghi chú tạo phiên bản mới; không lộ qua metadata/log/PDF |
| AC-15 | Tạo ví không có tài khoản/mật khẩu, có địa chỉ và ghi chú | Cho lưu, tính một tài sản và đúng dung lượng; không yêu cầu đăng nhập ví |
| AC-16 | Người chưa nhận/Admin/Executor/Verifier gọi API xem ghi chú | Từ chối truy cập; người đã nhận hợp lệ xem/xuất được trong hạn |
| AC-17 | Quyền tải hết hạn hoặc bị khóa do sự cố bảo mật kỹ thuật | Chặn cả đọc/xuất payload và tải file; giữ lịch sử commit, không hứa thu hồi bản ngoài |
| AC-18 | Callback thanh toán hoặc import lặp | Một quyền dịch vụ, một mốc gia hạn, một mục nhập; không thu phí nhận |
| AC-19 | Hết Plus vượt Free, gia hạn cùng cleanup | Giữ đúng lựa chọn/quota và không xóa dữ liệu vừa được bảo vệ |
| AC-20 | Gói XS hết hạn khi kho đang tạm treo/đóng băng | Không xóa trước `deletion_eligible_at`; tới mốc thì chỉ xóa nếu vẫn đóng băng, đã báo trước và không có hồ sơ/quyền cần bảo vệ |
| AC-21 | Khôi phục backup | Không phục hồi quyền đã chuyển/từ chối, grant bị chặn hoặc tài sản đã xóa |
| AC-22 | Thêm đồng thời file và bản ghi vượt quota | Kiểm tra cả số tài sản và byte; không vượt hạn do thao tác đồng thời |
| AC-23 | Một người liên quan chưa nhận được thông báo lịch hoặc chuyển đến qua phương thức đã thống nhất | Executor chưa được bấm Bắt đầu; xử lý gửi lại/hỗ trợ hoặc thông báo lịch mới cho tất cả |
| AC-24 | Owner sửa người nhận của một tài sản trước snapshot | Hệ thống tính lại tập người nhận, gom lại kho/manifest và tạo phiên bản mới; sau snapshot không đổi chỉ định gốc |
| AC-25 | Executor bổ sung phiên bản giấy mới sau khi đã tick bản cũ | Bản tick cũ không áp dụng cho bản mới; Executor tick lại khi nộp và Verifier tick lại khi phê duyệt |
| AC-26 | Executor nộp giấy hợp lệ dù Owner vẫn điểm danh đúng hạn | Hồ sơ được tiếp nhận và Verifier xét theo giấy; điểm danh không chặn hoặc tự phê duyệt hồ sơ |
| AC-27 | Owner điểm danh sau cảnh báo nhưng trước khi có hồ sơ chứng tử | Đóng cảnh báo, lưu lịch sử trễ và tính kỳ mới từ lần điểm danh hợp lệ; không mở luồng bàn giao |
| AC-28 | Executor không xử lý cảnh báo điểm danh | Nhắc sau 48 giờ, đánh dấu quá hạn cho Admin sau 72 giờ; không khóa hệ thống, không tự tạo hồ sơ hay bàn giao |
| AC-29 | Owner Free không điểm danh hết thời gian chờ và thêm 90 ngày | Kho vào `FROZEN_INACTIVITY`; không có Executor và không tự xóa vì Free không có hạn gói |
| AC-30 | Owner XS/XS Max không điểm danh trong 90 ngày tạm treo | Kho chuyển sang `FROZEN_INACTIVITY`; không tự phát hành tài sản hoặc kết luận qua đời |
| AC-31 | Gói trả phí hết hạn trước mốc đóng băng | Không xóa ngay lúc hết gói; mốc xóa sớm nhất là 30 ngày sau mốc muộn hơn giữa đóng băng và hết gói |
| AC-32 | Đến mốc xóa nhưng hồ sơ chứng tử đang xét hoặc quyền người nhận còn hiệu lực | Hoãn xóa, ghi lý do và kiểm tra lại khi quyền/hồ sơ kết thúc; không xóa nhầm tài sản cần bàn giao |
| AC-33 | Owner gia hạn gói nhưng chưa điểm danh, hoặc điểm danh trước khi nộp hồ sơ | Gia hạn chỉ dời điều kiện xóa theo gói và không tự gỡ đóng băng; điểm danh hợp lệ kết thúc tạm treo/đóng băng và hủy mốc xóa do im lặng |
| AC-34 | Người 3 là đích nhận A, C sau khi Executor bắt đầu rồi bấm Từ chối | A, C đóng băng cho người 3; không trả về người 1 và không mời người thứ ba. Người 3 có thể đổi sang Nhận trong hạn 2 năm |
| AC-35 | Người nhận không phản hồi trong 7 ngày từ lúc Executor bắt đầu | Kho chuyển sang `FROZEN_RECONSIDERATION` trong 2 năm, không tự bàn giao hoặc hủy ngay; người đó vẫn có thể ký Nhận trong hạn |
| AC-36 | Hết 2 năm đóng băng mà kho một người chưa Nhận hoặc kho đồng sở hữu chưa đủ đồng ý | Hủy quyền bàn giao đúng kho, không chỉ định đích mới; chỉ cleanup bản không còn tham chiếu sau ít nhất 720 giờ và kiểm tra các chặn |
| AC-37 | Người đồng sở hữu bấm Nhận trước, người kia Từ chối rồi đổi sang Nhận trong hạn | Ban đầu không cấp grant cho ai; sau khi đủ hai lời đồng ý hợp lệ, cam kết một lần và cấp grant cho cả hai |
| AC-38 | Kho nguồn Owner bị đóng băng do 90 ngày không điểm danh | Không dùng đồng hồ này thay cho 2 năm suy nghĩ lại của Beneficiary; không tự cấp hoặc hủy quyền bàn giao |

# 4. GHI CHÚ CHO ERD, API VÀ DEMO

- Dùng một danh sách `plan_beneficiary`; `asset_designation` ghi tập `person_id` Owner chọn cho từng tài sản. Chuẩn hóa tập không xét thứ tự, rồi hệ thống tạo đúng một `handover_vault_id` hiệu lực cho mỗi `(plan_id, recipient_set)`; mọi tài sản có cùng tập được gom vào một manifest. `designation_version` chụp chỉ định tài sản, kho/manifest tự gom và `recipient_mode = SINGLE_RECIPIENT | CO_OWNED`. Một tài sản chỉ thuộc một kho hiệu lực. Bỏ mô hình cấp thừa kế và rank ưu tiên.
- `checkin_period` lưu hạn điểm danh, hạn chờ, `suspended_at`, `freeze_at` và trạng thái `CHECKIN_SUSPENDED | FROZEN_INACTIVITY`; `executor_alert` chỉ tạo cho kho có Executor, lưu kỳ nguồn, người nhận, phương thức, kết quả gửi, `OPEN | NO_CERTIFICATE_AVAILABLE | OWNER_CHECKED_IN | CERTIFICATE_SUBMITTED`, thời điểm xác nhận và đóng việc. `vault_deletion` lưu `paid_plan_expires_at`, `deletion_eligible_at`, các lần thông báo, điều kiện chặn, kết quả đối soát và tombstone. Mỗi kỳ chỉ có một cảnh báo; các trạng thái điểm danh không là hồ sơ chứng tử và không cấp quyền bàn giao.
- `handover_transfer_choice` lưu kho một người, người nhận gốc, đích đang chọn, phiên bản lựa chọn, trạng thái `ACTIVE | REPLACED | CANCELLED | FINALIZED`, người và thời điểm thao tác. Chọn/đổi/hủy trước `handover_started_at` chỉ sửa người nhận dự kiến; một kho có tối đa một lựa chọn `ACTIVE`. Đích không được chuyển tiếp. Khi Executor bắt đầu, tạo `beneficiary_allocation` cuối cùng từ lựa chọn đang hiệu lực hoặc giữ người gốc; không tạo allocation chuyển cho kho đồng sở hữu.
- `handover_schedule` lưu ngày chung các bên đã thống nhất, Executor ghi/xác nhận ngày, phiên bản lịch, phương thức thông báo và callback gửi. `handover_started_at` chỉ được tạo bởi thao tác Bắt đầu hợp lệ của Executor vào hoặc sau ngày đó; `initial_response_due_at = handover_started_at + 168 giờ`. `reconsideration` lưu `freeze_started_at`, `freeze_expires_at` và quyết định từng người; một kho đồng sở hữu chỉ có một kết quả cam kết cho cả nhóm. Job nhắc/hết hạn phải idempotent và phân xử cùng giao dịch với chọn/đổi/hủy chuyển, bắt đầu và nhận.
- Thêm `asset_type = FILE | ACCOUNT | CRYPTO_WALLET`; metadata an toàn tách payload mã hóa. Manifest tham chiếu `asset_version_id`; `file_version_id` chỉ dành cho file.
- `death_certificate_submission` lưu phiên bản giấy, metadata xác minh và hash. `legal_attestation` lưu riêng bản tick của Executor và Verifier theo đúng phiên bản giấy, `person_id`, vai trò, nội dung ô, thời điểm và hành động. Chỉ Verifier có bản kiểm tra đạt và bản tick của chính mình mới chuyển hồ sơ sang `APPROVED_FOR_DELIVERY`; khi đó mới mở API đặt lịch của Executor.
- API dùng thao tác **Bắt đầu bàn giao** của Executor làm mốc khóa chuyển; không chốt chuyển tự động theo một ngày cắt riêng. Cửa sổ 7 ngày chỉ là hạn phản hồi ban đầu; sau đó kho chưa đủ quyết định được đóng băng 2 năm để người nhận suy nghĩ lại. Từ chối sau khi bắt đầu không chọn đích mới; kho đồng sở hữu chỉ được bàn giao khi đủ mọi lời đồng ý.
- Demo chính: tạo A, B, C, D → Owner gán A/C cho người 1, B cho người 1+2, D cho người 3 → hệ thống tạo ba kho → Executor tick trách nhiệm và nộp chứng tử → Verifier kiểm tra/tick/phê duyệt → thông báo mọi người, thống nhất ngày, Executor ghi ngày → người 1 thử chuyển A/C cho người 3, đổi đích rồi hủy/chọn lại → Executor bấm Bắt đầu → từng người Nhận/Từ chối → kho đồng sở hữu chỉ mở khi cả nhóm Nhận → tải/xuất/lưu. Demo ngoại lệ: thiếu ô tick; bổ sung giấy mới; cố chuyển kho đồng sở hữu; từ chối sau khi bắt đầu; hết 7 ngày chưa phản hồi; hết hai năm suy nghĩ lại.

Tài liệu này là kết quả chỉnh sửa đặc tả; chưa phải thay đổi phần mềm hoặc xác nhận các tiêu chí đã được kiểm thử trên hệ thống.
