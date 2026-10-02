import xml.etree.ElementTree as ET

def build_flow03_iso_v2():
    # 6 Dedicated Lanes
    # lane0: OWNER · ASSET OWNER (x=50, width=250)
    # lane1: CLIENT · WEB APP (REACT 19) (x=300, width=260)
    # lane2: SERVER · APPLICATION & DMS WORKER (x=560, width=330)
    # lane3: DATABASE · SQL SERVER 2022 (x=890, width=250)
    # lane4: GMAIL SMTP · EMAIL SERVICE (x=1140, width=240)
    # lane5: EXECUTOR · HANDOVER EXECUTOR (x=1380, width=250)
    # Total width = 1580, Page width = 1680, Height = 3500

    lane_defs = [
        {"id": "lane0", "name": "OWNER · ASSET OWNER", "x": 50, "w": 250},
        {"id": "lane1", "name": "CLIENT · WEB APP (REACT 19)", "x": 300, "w": 260},
        {"id": "lane2", "name": "SERVER · APPLICATION &amp; DMS WORKER", "x": 560, "w": 330},
        {"id": "lane3", "name": "DATABASE · SQL SERVER 2022", "x": 890, "w": 250},
        {"id": "lane4", "name": "GMAIL SMTP · EMAIL SERVICE", "x": 1140, "w": 240},
        {"id": "lane5", "name": "EXECUTOR · HANDOVER EXECUTOR", "x": 1380, "w": 250},
    ]

    lane_h = 3280
    lane_y = 180

    # STYLES (ISO 5807 / ANSI standard colors)
    style_start_stop = "ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=12;fontFamily=Arial;fontStyle=1;"
    style_process = "rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;"
    style_io = "shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;"
    style_decision = "rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;"
    style_onpage = "ellipse;aspect=fixed;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=12;fontFamily=Arial;fontStyle=1;align=center;verticalAlign=middle;"
    style_offpage = "shape=offPageConnector;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=11;fontFamily=Arial;fontStyle=1;"

    # Edge styles
    edge_normal = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;"
    edge_loop = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;"
    edge_warn = "edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;fontSize=11;fontColor=#B45309;"

    # NODES DEFINITION
    nodes = [
        # --- LANE 0: OWNER ---
        {
            "id": "offpage_from_flow02",
            "lane": "lane0",
            "style": style_offpage,
            "val": "Từ FLOW 02&lt;br/&gt;(Kế hoạch ACTIVE)",
            "x": 60, "y": 60, "w": 130, "h": 50
        },
        {
            "id": "s_start",
            "lane": "lane0",
            "style": style_start_stop,
            "val": "BẮT ĐẦU · KÍCH HOẠT DMS&lt;br/&gt;Kế hoạch di sản có hiệu lực;&lt;br/&gt;Đồng hồ giám sát khởi chạy",
            "x": 25, "y": 140, "w": 200, "h": 70
        },
        {
            "id": "io_owner_config",
            "lane": "lane0",
            "style": style_io,
            "val": "01 · Cấu hình chu kỳ DMS&lt;br/&gt;Chọn chu kỳ (30/60/90 ngày)&lt;br/&gt;&amp; chờ gia hạn (7/14/30 ngày)",
            "x": 15, "y": 240, "w": 220, "h": 75
        },
        {
            "id": "io_owner_ping",
            "lane": "lane0",
            "style": style_io,
            "val": "05 · Bấm 'Tôi Còn Sống'&lt;br/&gt;Xác nhận điểm danh qua Web&lt;br/&gt;hoặc qua trang xác thực Email",
            "x": 15, "y": 780, "w": 220, "h": 75
        },
        {
            "id": "io_owner_recover",
            "lane": "lane0",
            "style": style_io,
            "val": "11 · Điểm danh phục hồi muộn&lt;br/&gt;Owner đăng nhập &amp; bấm Check-in&lt;br/&gt;khi kho đang treo/đóng băng",
            "x": 15, "y": 2030, "w": 220, "h": 75
        },
        {
            "id": "end_frozen",
            "lane": "lane0",
            "style": style_start_stop,
            "val": "ĐÓNG BĂNG AN TOÀN&lt;br/&gt;Chỉ đọc; không tự xóa do DMS;&lt;br/&gt;Sẵn sàng phục hồi hoặc nhận Claim",
            "x": 25, "y": 2720, "w": 200, "h": 75
        },

        # --- LANE 1: CLIENT (REACT 19) ---
        {
            "id": "io_client_display",
            "lane": "lane1",
            "style": style_io,
            "val": "02 · Render Heartbeat Card&lt;br/&gt;Hiển thị đồng hồ đếm ngược&lt;br/&gt;&amp; trạng thái nhịp tim (Pulse)",
            "x": 20, "y": 240, "w": 220, "h": 75
        },
        {
            "id": "io_client_send_ping",
            "lane": "lane1",
            "style": style_io,
            "val": "06 · Gửi POST /api/v1/dms/check-in&lt;br/&gt;Kèm Bearer JWT trong RAM&lt;br/&gt;hoặc Email CheckInToken",
            "x": 20, "y": 780, "w": 220, "h": 75
        },
        {
            "id": "proc_client_pulse_active",
            "lane": "lane1",
            "style": style_process,
            "val": "08 · Cập nhật UI thành công&lt;br/&gt;Hiển thị nhịp tim xanh ACTIVE;&lt;br/&gt;Gia hạn đếm ngược thêm +Cycle",
            "x": 20, "y": 1050, "w": 220, "h": 70
        },
        {
            "id": "conn_active_loop",
            "lane": "lane1",
            "style": style_onpage,
            "val": "A",
            "x": 110, "y": 1160, "w": 40, "h": 40
        },
        {
            "id": "io_client_suspended_ui",
            "lane": "lane1",
            "style": style_io,
            "val": "10 · Banner cảnh báo Tạm treo&lt;br/&gt;Hiển thị đếm ngược 90 ngày;&lt;br/&gt;Nút 1 chạm điểm danh phục hồi",
            "x": 20, "y": 1500, "w": 220, "h": 75
        },
        {
            "id": "io_client_frozen_ui",
            "lane": "lane1",
            "style": style_io,
            "val": "16 · Giao diện Kho Đóng băng&lt;br/&gt;Khóa chức năng sửa đổi tài sản;&lt;br/&gt;Bảo toàn dữ liệu theo OPLAN-05",
            "x": 20, "y": 2570, "w": 220, "h": 75
        },

        # --- LANE 2: SERVER & DMS WORKER ---
        {
            "id": "proc_server_init_timer",
            "lane": "lane2",
            "style": style_process,
            "val": "03 · Khởi tạo lịch trình ban đầu&lt;br/&gt;NextCheckInDue = now + CycleDays;&lt;br/&gt;Chỉ đổi config từ kỳ sau (DMS-01)",
            "x": 35, "y": 240, "w": 260, "h": 75
        },
        {
            "id": "proc_worker_cron",
            "lane": "lane2",
            "style": style_process,
            "val": "DmsHeartbeatWorker (HostedService)&lt;br/&gt;Quét định kỳ mỗi 1 giờ độc lập&lt;br/&gt;các kho đang trong hệ thống",
            "x": 35, "y": 360, "w": 260, "h": 65
        },
        {
            "id": "dec_due_reached",
            "lane": "lane2",
            "style": style_decision,
            "val": "Đã đến hạn&lt;br/&gt;NextCheckInDue?",
            "x": 70, "y": 460, "w": 190, "h": 85
        },
        {
            "id": "proc_trigger_grace",
            "lane": "lane2",
            "style": style_process,
            "val": "04 · Chuyển CHECKIN_PENDING&lt;br/&gt;GraceExpiresAt = NextDue + GraceDays;&lt;br/&gt;Xếp hàng gửi email nhắc nhở (DMS-03)",
            "x": 35, "y": 590, "w": 260, "h": 75
        },
        {
            "id": "dec_validate_checkin",
            "lane": "lane2",
            "style": style_decision,
            "val": "Thẩm định điểm danh:&lt;br/&gt;Token đúng &amp; không có&lt;br/&gt;hồ sơ chứng tử duyệt?",
            "x": 70, "y": 780, "w": 190, "h": 85
        },
        {
            "id": "proc_reset_timer",
            "lane": "lane2",
            "style": style_process,
            "val": "07 · Giao dịch điểm danh ACID&lt;br/&gt;Ghi CheckInLogs (kèm Method);&lt;br/&gt;VaultStatus = ACTIVE;&lt;br/&gt;NextDue = now + CycleDays",
            "x": 35, "y": 920, "w": 260, "h": 85
        },
        {
            "id": "dec_grace_expired",
            "lane": "lane2",
            "style": style_decision,
            "val": "Worker quét:&lt;br/&gt;now &amp;gt;= GraceExpires&lt;br/&gt;&amp;amp; chưa điểm danh?",
            "x": 70, "y": 1210, "w": 190, "h": 85
        },
        {
            "id": "proc_suspend_vault",
            "lane": "lane2",
            "style": style_process,
            "val": "09 · Chuyển CHECKIN_SUSPENDED&lt;br/&gt;Ghi suspended_at = now;&lt;br/&gt;FreezeAt = GraceExpires + 90 ngày;&lt;br/&gt;Tạm dừng tạo kỳ điểm danh mới",
            "x": 35, "y": 1350, "w": 260, "h": 85
        },
        {
            "id": "dec_has_executor",
            "lane": "lane2",
            "style": style_decision,
            "val": "Có Executor đủ&lt;br/&gt;điều kiện (XS/XSMax)?",
            "x": 70, "y": 1490, "w": 190, "h": 85
        },
        {
            "id": "proc_dispatch_exec_task",
            "lane": "lane2",
            "style": style_process,
            "val": "Tạo ExecutorAlertTasks trong DB&lt;br/&gt;Xếp hàng gửi email cảnh báo;&lt;br/&gt;Theo dõi hạn xử lý 48h / 72h SLA",
            "x": 35, "y": 1630, "w": 260, "h": 75
        },
        {
            "id": "proc_staged_reminders",
            "lane": "lane2",
            "style": style_process,
            "val": "12 · Worker gửi nhắc đa mốc&lt;br/&gt;Gửi thông báo: Bắt đầu, 30 ngày,&lt;br/&gt;7 ngày, 24 giờ (Chống gửi trùng)",
            "x": 35, "y": 1860, "w": 260, "h": 75
        },
        {
            "id": "dec_late_recovery",
            "lane": "lane2",
            "style": style_decision,
            "val": "Owner bấm phục hồi&lt;br/&gt;&amp;amp; chưa nộp chứng tử?",
            "x": 70, "y": 2030, "w": 190, "h": 85
        },
        {
            "id": "proc_execute_recovery",
            "lane": "lane2",
            "style": style_process,
            "val": "13 · Phục hồi kho ACTIVE (ACID)&lt;br/&gt;Restore VaultStatus = ACTIVE;&lt;br/&gt;Đóng task: OWNER_CHECKED_IN;&lt;br/&gt;NextDue tính lại từ lần ping này",
            "x": 35, "y": 2180, "w": 260, "h": 85
        },
        {
            "id": "conn_recovery_loop",
            "lane": "lane2",
            "style": style_onpage,
            "val": "A",
            "x": 145, "y": 2310, "w": 40, "h": 40
        },
        {
            "id": "dec_freeze_reached",
            "lane": "lane2",
            "style": style_decision,
            "val": "Worker quét:&lt;br/&gt;now &amp;gt;= FreezeAt&lt;br/&gt;(90 ngày kết thúc)?",
            "x": 70, "y": 2420, "w": 190, "h": 85
        },
        {
            "id": "proc_freeze_vault",
            "lane": "lane2",
            "style": style_process,
            "val": "15 · Giao dịch Đóng băng an toàn&lt;br/&gt;VaultStatus = FROZEN_INACTIVITY;&lt;br/&gt;Ghi AuditEvents từng kho chuyển;&lt;br/&gt;Khóa sửa tài sản, bảo toàn dữ liệu",
            "x": 35, "y": 2560, "w": 260, "h": 85
        },

        # --- LANE 3: DATABASE (SQL SERVER 2022) ---
        {
            "id": "proc_db_save_schedule",
            "lane": "lane3",
            "style": style_process,
            "val": "COMMIT TRANSACTION:&lt;br/&gt;UPDATE [Vaults] SET NextCheckInDue&lt;br/&gt;&amp;amp; DmsSettings; Ghi [AuditEvents]",
            "x": 20, "y": 240, "w": 210, "h": 75
        },
        {
            "id": "proc_db_save_pending",
            "lane": "lane3",
            "style": style_process,
            "val": "COMMIT TRANSACTION:&lt;br/&gt;UPDATE [Vaults] SET Status='PENDING',&lt;br/&gt;GraceExpiresAt; Queue Email Reminder",
            "x": 20, "y": 590, "w": 210, "h": 75
        },
        {
            "id": "proc_db_save_ping",
            "lane": "lane3",
            "style": style_process,
            "val": "COMMIT TRANSACTION:&lt;br/&gt;INSERT INTO [CheckInLogs];&lt;br/&gt;UPDATE [Vaults] SET Status='ACTIVE',&lt;br/&gt;LastCheckIn=now, NextDue=now+Cycle",
            "x": 20, "y": 920, "w": 210, "h": 85
        },
        {
            "id": "proc_db_save_suspension",
            "lane": "lane3",
            "style": style_process,
            "val": "COMMIT TRANSACTION:&lt;br/&gt;UPDATE [Vaults] SET Status='SUSPENDED',&lt;br/&gt;SuspendedAt=now, FreezeAt=due+90d",
            "x": 20, "y": 1350, "w": 210, "h": 85
        },
        {
            "id": "proc_db_save_exec_task",
            "lane": "lane3",
            "style": style_process,
            "val": "INSERT INTO [ExecutorAlertTasks]&lt;br/&gt;(TaskId, VaultId, ExecutorId, PENDING);&lt;br/&gt;Queue Warning Email to Outbox",
            "x": 20, "y": 1630, "w": 210, "h": 75
        },
        {
            "id": "proc_db_save_recovery",
            "lane": "lane3",
            "style": style_process,
            "val": "COMMIT TRANSACTION:&lt;br/&gt;UPDATE [Vaults] SET Status='ACTIVE';&lt;br/&gt;UPDATE [ExecutorAlertTasks]&lt;br/&gt;SET Status='OWNER_CHECKED_IN'",
            "x": 20, "y": 2180, "w": 210, "h": 85
        },
        {
            "id": "proc_db_save_freeze",
            "lane": "lane3",
            "style": style_process,
            "val": "COMMIT TRANSACTION:&lt;br/&gt;UPDATE [Vaults] SET Status='FROZEN';&lt;br/&gt;INSERT INTO [AuditEvents] (Per Vault);&lt;br/&gt;Queue Freeze Notification Email",
            "x": 20, "y": 2560, "w": 210, "h": 85
        },

        # --- LANE 4: GMAIL SMTP (EMAIL SERVICE) ---
        {
            "id": "io_smtp_reminder",
            "lane": "lane4",
            "style": style_io,
            "val": "Gửi email nhắc điểm danh&lt;br/&gt;Link mở trang xác thực Web&lt;br/&gt;(Chống scanner bấm nhầm)",
            "x": 15, "y": 590, "w": 210, "h": 75
        },
        {
            "id": "io_smtp_suspension",
            "lane": "lane4",
            "style": style_io,
            "val": "Gửi thông báo Tạm treo&lt;br/&gt;Báo mốc đếm ngược 90 ngày&lt;br/&gt;kèm hướng dẫn điểm danh lại",
            "x": 15, "y": 1350, "w": 210, "h": 85
        },
        {
            "id": "io_smtp_exec_alert",
            "lane": "lane4",
            "style": style_io,
            "val": "Gửi cảnh báo Executor&lt;br/&gt;Yêu cầu kiểm tra tình hình&lt;br/&gt;(Không suy đoán qua đời)",
            "x": 15, "y": 1630, "w": 210, "h": 75
        },
        {
            "id": "io_smtp_freeze_notice",
            "lane": "lane4",
            "style": style_io,
            "val": "Gửi thông báo Đóng băng&lt;br/&gt;Thông báo kho đã đóng băng an toàn;&lt;br/&gt;Dữ liệu nguyên vẹn không bị xóa",
            "x": 15, "y": 2560, "w": 210, "h": 85
        },

        # --- LANE 5: EXECUTOR (HANDOVER EXECUTOR) ---
        {
            "id": "io_exec_receive_alert",
            "lane": "lane5",
            "style": style_io,
            "val": "Nhận cảnh báo kiểm tra&lt;br/&gt;Tìm hiểu tình trạng Owner;&lt;br/&gt;Chưa kích hoạt bàn giao di sản",
            "x": 15, "y": 1630, "w": 220, "h": 75
        },
        {
            "id": "dec_exec_action",
            "lane": "lane5",
            "style": style_decision,
            "val": "Kết quả xác minh&lt;br/&gt;thực tế?",
            "x": 30, "y": 1750, "w": 190, "h": 85
        },
        {
            "id": "io_exec_submit_resp",
            "lane": "lane5",
            "style": style_io,
            "val": "14a · Gửi phản hồi lên Server&lt;br/&gt;Ghi nhận NO_CERTIFICATE;&lt;br/&gt;Mốc 90 ngày tiếp tục chạy",
            "x": 15, "y": 1880, "w": 220, "h": 75
        },
        {
            "id": "offpage_exec_death_claim",
            "lane": "lane5",
            "style": style_offpage,
            "val": "14b · Nộp hồ sơ chứng tử&lt;br/&gt;Chuyển sang FLOW 04&lt;br/&gt;(Thẩm định pháp lý)",
            "x": 60, "y": 2020, "w": 130, "h": 60
        }
    ]

    # EDGES DEFINITION - STRICT 1-TO-1 FLOW & LOGICAL CAUSALITY
    edges = [
        # Setup Flow
        {"id": "e01", "src": "offpage_from_flow02", "tgt": "s_start", "val": "Kế hoạch đã kích hoạt", "style": edge_normal},
        {"id": "e02", "src": "s_start", "tgt": "io_owner_config", "val": "", "style": edge_normal},
        {"id": "e03", "src": "io_owner_config", "tgt": "io_client_display", "val": "Nhập cấu hình", "style": edge_normal},
        {"id": "e04", "src": "io_client_display", "tgt": "proc_server_init_timer", "val": "Gửi API lưu cấu hình", "style": edge_normal},
        {"id": "e05", "src": "proc_server_init_timer", "tgt": "proc_db_save_schedule", "val": "Commit DB", "style": edge_normal},
        {"id": "e06", "src": "proc_db_save_schedule", "tgt": "proc_worker_cron", "val": "Kích hoạt giám sát định kỳ", "style": edge_normal},

        # Worker Periodic Check-in Scan
        {"id": "e07", "src": "proc_worker_cron", "tgt": "dec_due_reached", "val": "Quét định kỳ mỗi 1h", "style": edge_normal},
        {"id": "e07_no", "src": "dec_due_reached", "tgt": "proc_worker_cron", "val": "Chưa đến hạn -> Chờ lần quét sau", "style": edge_loop},
        {"id": "e08", "src": "dec_due_reached", "tgt": "proc_trigger_grace", "val": "Đã đến hạn (now >= NextDue)", "style": edge_normal},
        {"id": "e09", "src": "proc_trigger_grace", "tgt": "proc_db_save_pending", "val": "Commit CHECKIN_PENDING", "style": edge_normal},
        {"id": "e10", "src": "proc_db_save_pending", "tgt": "io_smtp_reminder", "val": "Xếp hàng gửi email nhắc", "style": edge_normal},
        {"id": "e11", "src": "io_smtp_reminder", "tgt": "io_owner_ping", "val": "Gửi email kèm liên kết an toàn", "style": edge_normal},

        # Owner Normal Check-in within Grace Period
        {"id": "e12", "src": "io_owner_ping", "tgt": "io_client_send_ping", "val": "Bấm nút xác nhận", "style": edge_normal},
        {"id": "e13", "src": "io_client_send_ping", "tgt": "dec_validate_checkin", "val": "POST check-in", "style": edge_normal},
        {"id": "e14", "src": "dec_validate_checkin", "tgt": "proc_reset_timer", "val": "Hợp lệ & không có hồ sơ chứng tử", "style": edge_normal},
        {"id": "e15", "src": "proc_reset_timer", "tgt": "proc_db_save_ping", "val": "Thực thi ACID Transaction", "style": edge_normal},
        {"id": "e16", "src": "proc_db_save_ping", "tgt": "proc_client_pulse_active", "val": "HTTP 200 OK (DB Commit)", "style": edge_normal},
        {"id": "e17", "src": "proc_client_pulse_active", "tgt": "conn_active_loop", "val": "", "style": edge_normal},
        {"id": "e18", "src": "conn_active_loop", "tgt": "proc_worker_cron", "val": "Nối A: Tiếp tục chu kỳ ACTIVE", "style": edge_loop},

        # Worker Detects Grace Expiration (Independent of Owner Ping)
        {"id": "e19", "src": "proc_worker_cron", "tgt": "dec_grace_expired", "val": "Quét kiểm tra hết hạn chờ", "style": edge_normal},
        {"id": "e20", "src": "dec_grace_expired", "tgt": "proc_suspend_vault", "val": "Hết hạn chờ, chưa có điểm danh", "style": edge_warn},
        {"id": "e20_no", "src": "dec_grace_expired", "tgt": "proc_worker_cron", "val": "Còn hạn chờ -> Tiếp tục theo dõi", "style": edge_loop},
        {"id": "e21", "src": "proc_suspend_vault", "tgt": "proc_db_save_suspension", "val": "Commit DB mốc +90 ngày", "style": edge_normal},
        {"id": "e22", "src": "proc_db_save_suspension", "tgt": "io_smtp_suspension", "val": "Xếp hàng gửi email tạm treo", "style": edge_normal},
        {"id": "e23", "src": "proc_db_save_suspension", "tgt": "io_client_suspended_ui", "val": "Cập nhật trạng thái Client", "style": edge_normal},
        {"id": "e24", "src": "proc_suspend_vault", "tgt": "dec_has_executor", "val": "Kiểm tra quyền phân bổ", "style": edge_normal},

        # Executor Warning Sub-task (Parallel & Non-blocking)
        {"id": "e25", "src": "dec_has_executor", "tgt": "proc_dispatch_exec_task", "val": "Có Executor đủ điều kiện", "style": edge_normal},
        {"id": "e26", "src": "proc_dispatch_exec_task", "tgt": "proc_db_save_exec_task", "val": "Lưu ExecutorAlertTasks", "style": edge_normal},
        {"id": "e27", "src": "proc_db_save_exec_task", "tgt": "io_smtp_exec_alert", "val": "Gửi email cảnh báo", "style": edge_normal},
        {"id": "e28", "src": "io_smtp_exec_alert", "tgt": "io_exec_receive_alert", "val": "Chuyển tiếp tới Executor", "style": edge_normal},
        {"id": "e29", "src": "io_exec_receive_alert", "tgt": "dec_exec_action", "val": "Executor rà soát", "style": edge_normal},
        {"id": "e30", "src": "dec_exec_action", "tgt": "io_exec_submit_resp", "val": "Chưa có chứng tử / Vẫn sống", "style": edge_normal},
        {"id": "e31", "src": "dec_exec_action", "tgt": "offpage_exec_death_claim", "val": "Có chứng tử -> Nộp thẩm định", "style": edge_normal},

        # Worker Staged Reminders (Runs Independently of Executor)
        {"id": "e32", "src": "dec_has_executor", "tgt": "proc_staged_reminders", "val": "Không có Executor đủ điều kiện", "style": edge_normal},
        {"id": "e33", "src": "io_exec_submit_resp", "tgt": "proc_staged_reminders", "val": "Đóng task, mốc 90d vẫn chạy", "style": edge_normal},
        {"id": "e34", "src": "proc_staged_reminders", "tgt": "dec_late_recovery", "val": "Đếm ngược 30d, 7d, 24h", "style": edge_normal},

        # Late Recovery during Suspension / Freeze
        {"id": "e35", "src": "io_owner_recover", "tgt": "dec_late_recovery", "val": "Owner chủ động gửi check-in", "style": edge_normal},
        {"id": "e36", "src": "dec_late_recovery", "tgt": "proc_execute_recovery", "val": "Điểm danh hợp lệ & chưa có claim", "style": edge_normal},
        {"id": "e37", "src": "proc_execute_recovery", "tgt": "proc_db_save_recovery", "val": "Giao dịch phục hồi ACID", "style": edge_normal},
        {"id": "e38", "src": "proc_db_save_recovery", "tgt": "conn_recovery_loop", "val": "DB Commit hoàn tất", "style": edge_normal},
        {"id": "e39", "src": "conn_recovery_loop", "tgt": "proc_worker_cron", "val": "Nối A: Khôi phục ACTIVE", "style": edge_loop},

        # Freeze Transition (At exactly freeze_at = due + 90 days)
        {"id": "e40", "src": "dec_late_recovery", "tgt": "dec_freeze_reached", "val": "Vẫn im lặng", "style": edge_normal},
        {"id": "e41", "src": "dec_freeze_reached", "tgt": "proc_freeze_vault", "val": "now >= FreezeAt (Hết 90 ngày)", "style": edge_warn},
        {"id": "e41_no", "src": "dec_freeze_reached", "tgt": "proc_worker_cron", "val": "Chưa đến hạn -> Tiếp tục theo dõi", "style": edge_loop},
        {"id": "e42", "src": "proc_freeze_vault", "tgt": "proc_db_save_freeze", "val": "Commit FROZEN_INACTIVITY", "style": edge_normal},
        {"id": "e43", "src": "proc_db_save_freeze", "tgt": "io_smtp_freeze_notice", "val": "Gửi thông báo đóng băng an toàn", "style": edge_normal},
        {"id": "e44", "src": "proc_db_save_freeze", "tgt": "io_client_frozen_ui", "val": "Cập nhật Client sang Read-only", "style": edge_normal},
        {"id": "e45", "src": "io_client_frozen_ui", "tgt": "end_frozen", "val": "Dữ liệu được bảo toàn", "style": edge_normal},
        {"id": "e46", "src": "end_frozen", "tgt": "io_owner_recover", "val": "Vẫn cho phép phục hồi sau đóng băng", "style": edge_loop}
    ]

    # BUILD XML
    root = ET.Element("mxfile", host="Electron", agent="LegacyVault Architecture Engine")
    diagram = ET.SubElement(root, "diagram", id="flow03_iso_v2", name="Flow 03 - Dead Mans Switch")
    model = ET.SubElement(diagram, "mxGraphModel", dx="2357", dy="1375", grid="1", gridSize="10",
                          guides="1", tooltips="1", connect="1", arrows="1", fold="1", page="1",
                          pageScale="1", pageWidth="1780", pageHeight="3500", math="0", shadow="0")
    root_cell = ET.SubElement(model, "root")
    ET.SubElement(root_cell, "mxCell", id="0")
    ET.SubElement(root_cell, "mxCell", id="1", parent="0")

    # TITLE & INTRO
    title_cell = ET.SubElement(root_cell, "mxCell", id="title", parent="1",
                               style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#173F38;strokeColor=#173F38;fontColor=#FFFFFF;fontSize=15;fontFamily=Arial;fontStyle=1;",
                               value="FLOW 03 · DEAD MAN'S SWITCH (DMS) · HEARTBEAT, SUSPENSION &amp; SAFE FREEZE (ISO 5807 / ANSI STANDARD)", vertex="1")
    title_geom = ET.SubElement(title_cell, "mxGeometry", x="50", y="30", width="1580", height="60", as_="geometry")

    intro_cell = ET.SubElement(root_cell, "mxCell", id="intro", parent="1",
                               style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#E9F3EE;strokeColor=#C9DED2;fontColor=#225A4C;fontSize=13;fontFamily=Arial;",
                               value="Swimlane workflow for survival check-ins, grace periods, 90-day suspension countdowns, executor wellbeing alerts, and safe data freezing. Architecture: Server Process -> DB Commit -> Client Response. Tham chiếu pháp lý: Điều 120 BLDS 2015 &amp; Chính sách sản phẩm SRS v3.11.0.", vertex="1")
    intro_geom = ET.SubElement(intro_cell, "mxGeometry", x="50", y="100", width="1580", height="60", as_="geometry")

    # LANES
    for l in lane_defs:
        lc = ET.SubElement(root_cell, "mxCell", id=l["id"], parent="1",
                           style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;",
                           value=l["name"], vertex="1")
        ET.SubElement(lc, "mxGeometry", x=str(l["x"]), y=str(lane_y), width=str(l["w"]), height=str(lane_h), as_="geometry")

    # NODES
    for n in nodes:
        nc = ET.SubElement(root_cell, "mxCell", id=n["id"], parent=n["lane"],
                           style=n["style"], value=n["val"], vertex="1")
        ET.SubElement(nc, "mxGeometry", x=str(n["x"]), y=str(n["y"]), width=str(n["w"]), height=str(n["h"]), as_="geometry")

    # EDGES
    for e in edges:
        ec = ET.SubElement(root_cell, "mxCell", id=e["id"], parent="1", source=e["src"], target=e["tgt"],
                           style=e["style"], value=e["val"], edge="1")
        ET.SubElement(ec, "mxGeometry", relative="1", as_="geometry")

    tree = ET.ElementTree(root)
    out_path = "docs/04_business_flows/FLOW_03_SYSTEM_MERGED.xml"
    ET.indent(tree, space="  ")
    tree.write(out_path, encoding="utf-8", xml_declaration=True)
    print(f"Successfully generated {out_path} v2 with full ISO standards and independent worker flow!")

if __name__ == "__main__":
    build_flow03_iso_v2()
