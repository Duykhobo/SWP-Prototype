import os

file_path = r"c:\Users\ThanhDuy\Documents\01_Code_Projects\SWP-Prototype\client\src\features\workflow-visualizer\InteractiveWorkflowVisualizer.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# 1. Update FLOW_01_STEPS
flow_01_updates = {
    "stepNum: '01'": """stepNum: '01',
    plainMechanism: 'Người dùng truy cập và chọn phương thức đăng nhập (Google OIDC không cần mật khẩu hoặc Form Email/Mật khẩu truyền thống). Trình duyệt sinh chuỗi ngẫu nhiên Nonce 256-bit trong RAM để bảo đảm chống tấn công phát lại (Replay Attack).',
    dataFlowPath: 'Người Dùng ➔ Trình Duyệt Client (React 19) ➔ Chuẩn bị bắt tay OpenID Connect',""",
    "stepNum: '02'": """stepNum: '02',
    plainMechanism: 'Google Identity Service (GIS) xác thực người dùng trên máy chủ Google và trả về ID Token (JWT) có chữ ký số RS256. Với Form thường, Client băm mật khẩu kèm Salt ngẫu nhiên theo chuẩn SEC-02 trước khi truyền đi.',
    dataFlowPath: 'Trình Duyệt Client ➔ Google Identity Service (GIS) ➔ Nhận Callback Token',""",
    "stepNum: '03'": """stepNum: '03',
    plainMechanism: 'Máy chủ .NET WebApi tải bộ khóa công khai Google Public Keys (JWKS) để xác minh chữ ký số RS256, sau đó tra cứu trong CSDL SQL Server 2022 qua bảng [Users] và [Persons] xem tài khoản đã tồn tại chưa.',
    dataFlowPath: 'Trình Duyệt Client ➔ Backend API (.NET 8) ➔ Thẩm định Google JWKS ➔ Tra cứu SQL Server 2022',""",
    "stepNum: '04'": """stepNum: '04',
    plainMechanism: 'Cơ chế JIT (Just-In-Time Auto-Provisioning): Nếu là tài khoản mới, hệ thống mở một giao dịch SqlTransaction ACID để tự động tạo cùng lúc 2 bản ghi: [Persons] (con người thực) và [Users] (phiên đăng nhập), bảo đảm toàn vẹn tham chiếu 100%.',
    dataFlowPath: 'Backend API (.NET 8) ➔ SqlTransaction ACID ➔ Bảng [dbo].[Persons] + [dbo].[Users]',""",
    "stepNum: '05'": """stepNum: '05',
    plainMechanism: 'Máy chủ ký phát hành Access Token (JWT HS256) chứa vai trò và PersonId, đồng thời tự động ghi lại nhật ký đăng nhập bất biến vào bảng [dbo].[AuditEvents] phục vụ truy vết pháp lý AUDIT-01.',
    dataFlowPath: 'Backend Token Factory ➔ Ghi Audit Log SQL Server ➔ Phản hồi Access Token HTTP 200 về Client',""",
    "stepNum: '06'": """stepNum: '06',
    plainMechanism: 'Trình duyệt nhận Access Token và lưu trong bộ nhớ RAM tạm thời (không lưu ra LocalStorage chống mã độc XSS). Giao diện tự động kích hoạt phân quyền RBAC và chuyển hướng đúng màn hình nghiệp vụ theo vai trò.',
    dataFlowPath: 'Trình Duyệt Client (RAM Context) ➔ Khởi tạo AuthContext ➔ Tải Dashboard phân quyền vai trò',""",
}

# 2. Update FLOW_02_STEPS
flow_02_updates = {
    "stepNum: '01'": """stepNum: '01',
    plainMechanism: 'Chủ sở hữu chọn gói cước di sản và quét mã VietQR động của SePay. Webhook SePay gọi đến máy chủ .NET xác thực giao dịch tức thì và nâng cấp trạng thái sang PAID.',
    dataFlowPath: 'Chủ Sở Hữu ➔ Ứng dụng Ngân Hàng ➔ Cổng SePay VietQR ➔ Webhook Backend .NET 8',""",
    "stepNum: '02'": """stepNum: '02',
    plainMechanism: 'Chủ sở hữu chọn tệp tài sản di sản. Trình duyệt dùng Web Crypto API tính toán trước mã băm SHA-256 Checksum của tệp để làm bằng chứng số đối soát toàn vẹn hai đầu chống giả mạo.',
    dataFlowPath: 'Chủ Sở Hữu ➔ Trình Duyệt Web Crypto (Tính SHA-256 Checksum) ➔ Chuẩn bị gửi lên máy chủ',""",
    "stepNum: '03'": """stepNum: '03',
    plainMechanism: 'Mã hóa phong bì (Envelope Encryption): Máy chủ sinh ngẫu nhiên khóa DEK 256-bit để mã hóa file bằng AES-256-GCM. Sau đó, DEK được niêm phong bằng Master Key (KEK) và bản rõ bị xóa khỏi RAM ngay.',
    dataFlowPath: 'Trình Duyệt ➔ Backend Engine (AES-256-GCM) ➔ Tạo Ciphertext + Gói Wrapped DEK',""",
    "stepNum: '04'": """stepNum: '04',
    plainMechanism: 'Máy chủ đẩy trực tiếp tệp mã hóa (.enc) lên Cloudflare R2 Private Bucket (hưởng chính sách 0đ phí tải về Egress). Các thông số Nonce, Auth Tag, Checksum được lưu vào bảng [ContentVersions].',
    dataFlowPath: 'Backend Engine ➔ Cloudflare R2 (Lưu Ciphertext) + SQL Server [ContentVersions]',""",
    "stepNum: '05'": """stepNum: '05',
    plainMechanism: 'Chủ sở hữu gán người nhận. Thuật toán tự động gom các tài sản có cùng tập người nhận vào chung một két số HandoverVault (quy tắc AC-01) để tối ưu hóa lưu trữ và quản lý quyền thừa kế.',
    dataFlowPath: 'Chủ Sở Hữu ➔ Backend API ➔ Tự động gom nhóm két [dbo].[HandoverVaults] trên SQL Server',""",
    "stepNum: '06'": """stepNum: '06',
    plainMechanism: 'Chỉ định Người thực thi (Executor) độc lập tuân thủ quy tắc tam quyền phân lập (Owner ≠ Executor ≠ Verifier). Hệ thống sinh token bảo mật và gửi email mời qua MailKit SMTP (hạn 48h).',
    dataFlowPath: 'Chủ Sở Hữu ➔ Backend API ➔ Dịch vụ MailKit SMTP ➔ Hộp thư của Executor',""",
    "stepNum: '07'": """stepNum: '07',
    plainMechanism: 'Executor mở email, bấm chấp thuận ủy thác. Hệ thống đối soát CCCD/eKYC qua FPT.AI và cập nhật trạng thái chấp nhận vào bảng [ExecutorAssignments] trên CSDL.',
    dataFlowPath: 'Executor (Email) ➔ Cổng phản hồi Backend ➔ FPT.AI eKYC ➔ SQL Server [ExecutorAssignments]',""",
    "stepNum: '08'": """stepNum: '08',
    plainMechanism: 'Chủ sở hữu kiểm tra bảng đối soát SETUP-01 và bấm kích hoạt. Hệ thống khởi động Đồng hồ sinh tồn (Dead Man\\'s Switch - DMS) định kỳ đếm ngược 30 ngày và thiết lập thời gian giải cứu 7 ngày.',
    dataFlowPath: 'Chủ Sở Hữu ➔ Backend Engine ➔ Kích hoạt DMS Background Worker & Khởi tạo lịch nhịp tim',""",
}

# Apply step updates
# Split text at FLOW_02_STEPS definition
parts = text.split("const FLOW_02_STEPS: WorkflowStep[] = [")
f1_part = parts[0]
f2_part = parts[1]

for k, v in flow_01_updates.items():
    f1_part = f1_part.replace(k, v, 1)

for k, v in flow_02_updates.items():
    f2_part = f2_part.replace(k, v, 1)

new_text = f1_part + "const FLOW_02_STEPS: WorkflowStep[] = [" + f2_part

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_text)

print("Updated steps with plainMechanism and dataFlowPath successfully!")
