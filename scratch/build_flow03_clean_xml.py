import xml.etree.ElementTree as ET

xml_content = """<mxfile host="Electron" agent="LegacyVault Architecture Engine">
  <diagram id="flow03_iso_standard" name="Flow 03 - Dead Mans Switch">
    <mxGraphModel dx="2357" dy="1375" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1780" pageHeight="3500" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title & Header -->
        <mxCell id="title" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#173F38;strokeColor=#173F38;fontColor=#FFFFFF;fontSize=15;fontFamily=Arial;fontStyle=1;" value="FLOW 03 · DEAD MAN'S SWITCH (DMS) · HEARTBEAT, SUSPENSION &amp; SAFE FREEZE (ISO 5807 / ANSI STANDARD)" vertex="1">
          <mxGeometry height="60" width="1580" x="50" y="30" as="geometry" />
        </mxCell>
        <mxCell id="intro" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#E9F3EE;strokeColor=#C9DED2;fontColor=#225A4C;fontSize=13;fontFamily=Arial;" value="Swimlane workflow for survival check-ins, grace periods, 90-day suspension countdowns, executor wellbeing alerts, and safe data freezing. Architecture: Server Process -&gt; DB Commit -&gt; Client Response. Tham chiếu pháp lý: Điều 120 BLDS 2015 &amp; Chính sách sản phẩm SRS v3.11.0." vertex="1">
          <mxGeometry height="60" width="1580" x="50" y="100" as="geometry" />
        </mxCell>

        <!-- 6 Dedicated Lanes (Height: 3280, Y: 180) -->
        <mxCell id="lane0" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="OWNER · ASSET OWNER" vertex="1">
          <mxGeometry height="3280" width="250" x="50" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane1" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="CLIENT · WEB APP (REACT 19)" vertex="1">
          <mxGeometry height="3280" width="260" x="300" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane2" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="SERVER · APPLICATION &amp; DMS WORKER" vertex="1">
          <mxGeometry height="3280" width="330" x="560" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane3" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="DATABASE · SQL SERVER 2022" vertex="1">
          <mxGeometry height="3280" width="250" x="890" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane4" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="GMAIL SMTP · EMAIL SERVICE" vertex="1">
          <mxGeometry height="3280" width="240" x="1140" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane5" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="EXECUTOR · HANDOVER EXECUTOR" vertex="1">
          <mxGeometry height="3280" width="250" x="1380" y="180" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: OWNER LANE (lane0) -->
        <!-- ========================================== -->
        <mxCell id="offpage_from_flow02" parent="lane0" style="shape=offPageConnector;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Từ FLOW 02&lt;br/&gt;(Kế hoạch ACTIVE)" vertex="1">
          <mxGeometry height="50" width="130" x="60" y="60" as="geometry" />
        </mxCell>
        <mxCell id="s_start" parent="lane0" style="ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=12;fontFamily=Arial;fontStyle=1;" value="BẮT ĐẦU · KÍCH HOẠT DMS&lt;br/&gt;Kế hoạch di sản có hiệu lực;&lt;br/&gt;Đồng hồ giám sát khởi chạy" vertex="1">
          <mxGeometry height="70" width="200" x="25" y="140" as="geometry" />
        </mxCell>
        <mxCell id="io_owner_config" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="01 · Cấu hình chu kỳ DMS&lt;br/&gt;Chọn chu kỳ (30/60/90 ngày)&lt;br/&gt;&amp; chờ gia hạn (7/14/30 ngày)" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="240" as="geometry" />
        </mxCell>
        <mxCell id="io_owner_ping" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="05 · Bấm 'Tôi Còn Sống'&lt;br/&gt;Xác nhận điểm danh qua Web&lt;br/&gt;hoặc qua trang xác thực Email" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="780" as="geometry" />
        </mxCell>
        <mxCell id="io_owner_recover" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="11 · Điểm danh phục hồi muộn&lt;br/&gt;Owner đăng nhập &amp; bấm Check-in&lt;br/&gt;khi kho đang treo/đóng băng" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="2030" as="geometry" />
        </mxCell>
        <mxCell id="end_frozen" parent="lane0" style="ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=12;fontFamily=Arial;fontStyle=1;" value="ĐÓNG BĂNG AN TOÀN&lt;br/&gt;Chỉ đọc; không tự xóa do DMS;&lt;br/&gt;Sẵn sàng phục hồi hoặc nhận Claim" vertex="1">
          <mxGeometry height="75" width="200" x="25" y="2720" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: CLIENT LANE (lane1) -->
        <!-- ========================================== -->
        <mxCell id="io_client_display" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="02 · Render Heartbeat Card&lt;br/&gt;Hiển thị đồng hồ đếm ngược&lt;br/&gt;&amp; trạng thái nhịp tim (Pulse)" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="240" as="geometry" />
        </mxCell>
        <mxCell id="io_client_send_ping" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="06 · Gửi POST /api/v1/dms/check-in&lt;br/&gt;Kèm Bearer JWT trong RAM&lt;br/&gt;hoặc Email CheckInToken" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="780" as="geometry" />
        </mxCell>
        <mxCell id="proc_client_pulse_active" parent="lane1" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="08 · Cập nhật UI thành công&lt;br/&gt;Hiển thị nhịp tim xanh ACTIVE;&lt;br/&gt;Gia hạn đếm ngược thêm +Cycle" vertex="1">
          <mxGeometry height="70" width="220" x="20" y="1050" as="geometry" />
        </mxCell>
        <mxCell id="conn_active_loop" parent="lane1" style="ellipse;aspect=fixed;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=12;fontFamily=Arial;fontStyle=1;align=center;verticalAlign=middle;" value="A" vertex="1">
          <mxGeometry height="40" width="40" x="110" y="1160" as="geometry" />
        </mxCell>
        <mxCell id="io_client_suspended_ui" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="10 · Banner cảnh báo Tạm treo&lt;br/&gt;Hiển thị đếm ngược 90 ngày;&lt;br/&gt;Nút 1 chạm điểm danh phục hồi" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="1500" as="geometry" />
        </mxCell>
        <mxCell id="io_client_frozen_ui" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="16 · Giao diện Kho Đóng băng&lt;br/&gt;Khóa chức năng sửa đổi tài sản;&lt;br/&gt;Bảo toàn dữ liệu theo OPLAN-05" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="2570" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: SERVER & DMS WORKER LANE (lane2) -->
        <!-- ========================================== -->
        <mxCell id="proc_server_init_timer" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="03 · Khởi tạo lịch trình ban đầu&lt;br/&gt;NextCheckInDue = now + CycleDays;&lt;br/&gt;Chỉ đổi config từ kỳ sau (DMS-01)" vertex="1">
          <mxGeometry height="75" width="260" x="35" y="240" as="geometry" />
        </mxCell>
        <mxCell id="proc_worker_cron" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="DmsHeartbeatWorker (HostedService)&lt;br/&gt;Quét định kỳ mỗi 1 giờ độc lập&lt;br/&gt;các kho đang trong hệ thống" vertex="1">
          <mxGeometry height="65" width="260" x="35" y="360" as="geometry" />
        </mxCell>
        <mxCell id="dec_due_reached" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Đã đến hạn&lt;br/&gt;NextCheckInDue?" vertex="1">
          <mxGeometry height="85" width="190" x="70" y="460" as="geometry" />
        </mxCell>
        <mxCell id="proc_trigger_grace" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="04 · Chuyển CHECKIN_PENDING&lt;br/&gt;GraceExpiresAt = NextDue + GraceDays;&lt;br/&gt;Xếp hàng gửi email nhắc nhở (DMS-03)" vertex="1">
          <mxGeometry height="75" width="260" x="35" y="590" as="geometry" />
        </mxCell>
        <mxCell id="dec_validate_checkin" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Thẩm định điểm danh:&lt;br/&gt;Token đúng &amp; không có&lt;br/&gt;hồ sơ chứng tử duyệt?" vertex="1">
          <mxGeometry height="85" width="190" x="70" y="780" as="geometry" />
        </mxCell>
        <mxCell id="proc_reset_timer" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="07 · Giao dịch điểm danh ACID&lt;br/&gt;Ghi CheckInLogs (kèm Method);&lt;br/&gt;VaultStatus = ACTIVE;&lt;br/&gt;NextDue = now + CycleDays" vertex="1">
          <mxGeometry height="85" width="260" x="35" y="920" as="geometry" />
        </mxCell>
        <mxCell id="dec_grace_expired" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Worker quét:&lt;br/&gt;now &gt;= GraceExpires&lt;br/&gt;&amp; chưa điểm danh?" vertex="1">
          <mxGeometry height="85" width="190" x="70" y="1210" as="geometry" />
        </mxCell>
        <mxCell id="proc_suspend_vault" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="09 · Chuyển CHECKIN_SUSPENDED&lt;br/&gt;Ghi suspended_at = now;&lt;br/&gt;FreezeAt = GraceExpires + 90 ngày;&lt;br/&gt;Tạm dừng tạo kỳ điểm danh mới" vertex="1">
          <mxGeometry height="85" width="260" x="35" y="1350" as="geometry" />
        </mxCell>
        <mxCell id="dec_has_executor" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Có Executor đủ&lt;br/&gt;điều kiện (XS/XSMax)?" vertex="1">
          <mxGeometry height="85" width="190" x="70" y="1490" as="geometry" />
        </mxCell>
        <mxCell id="proc_dispatch_exec_task" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="Tạo ExecutorAlertTasks trong DB&lt;br/&gt;Xếp hàng gửi email cảnh báo;&lt;br/&gt;Theo dõi hạn xử lý 48h / 72h SLA" vertex="1">
          <mxGeometry height="75" width="260" x="35" y="1630" as="geometry" />
        </mxCell>
        <mxCell id="proc_staged_reminders" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="12 · Worker gửi nhắc đa mốc&lt;br/&gt;Gửi thông báo: Bắt đầu, 30 ngày,&lt;br/&gt;7 ngày, 24 giờ (Chống gửi trùng)" vertex="1">
          <mxGeometry height="75" width="260" x="35" y="1860" as="geometry" />
        </mxCell>
        <mxCell id="dec_late_recovery" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Owner bấm phục hồi&lt;br/&gt;&amp; chưa nộp chứng tử?" vertex="1">
          <mxGeometry height="85" width="190" x="70" y="2030" as="geometry" />
        </mxCell>
        <mxCell id="proc_execute_recovery" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="13 · Phục hồi kho ACTIVE (ACID)&lt;br/&gt;Restore VaultStatus = ACTIVE;&lt;br/&gt;Đóng task: OWNER_CHECKED_IN;&lt;br/&gt;NextDue tính lại từ lần ping này" vertex="1">
          <mxGeometry height="85" width="260" x="35" y="2180" as="geometry" />
        </mxCell>
        <mxCell id="conn_recovery_loop" parent="lane2" style="ellipse;aspect=fixed;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=12;fontFamily=Arial;fontStyle=1;align=center;verticalAlign=middle;" value="A" vertex="1">
          <mxGeometry height="40" width="40" x="145" y="2310" as="geometry" />
        </mxCell>
        <mxCell id="dec_freeze_reached" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Worker quét:&lt;br/&gt;now &gt;= FreezeAt&lt;br/&gt;(90 ngày kết thúc)?" vertex="1">
          <mxGeometry height="85" width="190" x="70" y="2420" as="geometry" />
        </mxCell>
        <mxCell id="proc_freeze_vault" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="15 · Giao dịch Đóng băng an toàn&lt;br/&gt;VaultStatus = FROZEN_INACTIVITY;&lt;br/&gt;Ghi AuditEvents từng kho chuyển;&lt;br/&gt;Khóa sửa tài sản, bảo toàn dữ liệu" vertex="1">
          <mxGeometry height="85" width="260" x="35" y="2560" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: DATABASE LANE (lane3) -->
        <!-- ========================================== -->
        <mxCell id="proc_db_save_schedule" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE [Vaults] SET NextCheckInDue&lt;br/&gt;&amp; DmsSettings; Ghi [AuditEvents]" vertex="1">
          <mxGeometry height="75" width="210" x="20" y="240" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_pending" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE [Vaults] SET Status='PENDING',&lt;br/&gt;GraceExpiresAt; Queue Email Reminder" vertex="1">
          <mxGeometry height="75" width="210" x="20" y="590" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_ping" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;INSERT INTO [CheckInLogs];&lt;br/&gt;UPDATE [Vaults] SET Status='ACTIVE',&lt;br/&gt;LastCheckIn=now, NextDue=now+Cycle" vertex="1">
          <mxGeometry height="85" width="210" x="20" y="920" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_suspension" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE [Vaults] SET Status='SUSPENDED',&lt;br/&gt;SuspendedAt=now, FreezeAt=due+90d" vertex="1">
          <mxGeometry height="85" width="210" x="20" y="1350" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_exec_task" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="INSERT INTO [ExecutorAlertTasks]&lt;br/&gt;(TaskId, VaultId, ExecutorId, PENDING);&lt;br/&gt;Queue Warning Email to Outbox" vertex="1">
          <mxGeometry height="75" width="210" x="20" y="1630" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_recovery" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE [Vaults] SET Status='ACTIVE';&lt;br/&gt;UPDATE [ExecutorAlertTasks]&lt;br/&gt;SET Status='OWNER_CHECKED_IN'" vertex="1">
          <mxGeometry height="85" width="210" x="20" y="2180" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_freeze" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE [Vaults] SET Status='FROZEN';&lt;br/&gt;INSERT INTO [AuditEvents] (Per Vault);&lt;br/&gt;Queue Freeze Notification Email" vertex="1">
          <mxGeometry height="85" width="210" x="20" y="2560" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: GMAIL SMTP LANE (lane4) -->
        <!-- ========================================== -->
        <mxCell id="io_smtp_reminder" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Gửi email nhắc điểm danh&lt;br/&gt;Link mở trang xác thực Web&lt;br/&gt;(Chống scanner bấm nhầm)" vertex="1">
          <mxGeometry height="75" width="210" x="15" y="590" as="geometry" />
        </mxCell>
        <mxCell id="io_smtp_suspension" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Gửi thông báo Tạm treo&lt;br/&gt;Báo mốc đếm ngược 90 ngày&lt;br/&gt;kèm hướng dẫn điểm danh lại" vertex="1">
          <mxGeometry height="85" width="210" x="15" y="1350" as="geometry" />
        </mxCell>
        <mxCell id="io_smtp_exec_alert" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Gửi cảnh báo Executor&lt;br/&gt;Yêu cầu kiểm tra tình hình&lt;br/&gt;(Không suy đoán qua đời)" vertex="1">
          <mxGeometry height="75" width="210" x="15" y="1630" as="geometry" />
        </mxCell>
        <mxCell id="io_smtp_freeze_notice" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Gửi thông báo Đóng băng&lt;br/&gt;Thông báo kho đã đóng băng an toàn;&lt;br/&gt;Dữ liệu nguyên vẹn không bị xóa" vertex="1">
          <mxGeometry height="85" width="210" x="15" y="2560" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: EXECUTOR LANE (lane5) -->
        <!-- ========================================== -->
        <mxCell id="io_exec_receive_alert" parent="lane5" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Nhận cảnh báo kiểm tra&lt;br/&gt;Tìm hiểu tình trạng Owner;&lt;br/&gt;Chưa kích hoạt bàn giao di sản" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="1630" as="geometry" />
        </mxCell>
        <mxCell id="dec_exec_action" parent="lane5" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Kết quả xác minh&lt;br/&gt;thực tế?" vertex="1">
          <mxGeometry height="85" width="190" x="30" y="1750" as="geometry" />
        </mxCell>
        <mxCell id="io_exec_submit_resp" parent="lane5" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="14a · Gửi phản hồi lên Server&lt;br/&gt;Ghi nhận NO_CERTIFICATE;&lt;br/&gt;Mốc 90 ngày tiếp tục chạy" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="1880" as="geometry" />
        </mxCell>
        <mxCell id="offpage_exec_death_claim" parent="lane5" style="shape=offPageConnector;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=11;fontFamily=Arial;fontStyle=1;" value="14b · Nộp hồ sơ chứng tử&lt;br/&gt;Chuyển sang FLOW 04&lt;br/&gt;(Thẩm định pháp lý)" vertex="1">
          <mxGeometry height="60" width="130" x="60" y="2020" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- EDGES - 49 STRICT CAUSAL ARROWS -->
        <!-- ========================================== -->
        <mxCell id="e01" parent="1" source="offpage_from_flow02" target="s_start" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Kế hoạch đã kích hoạt" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e02" parent="1" source="s_start" target="io_owner_config" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e03" parent="1" source="io_owner_config" target="io_client_display" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Nhập cấu hình" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e04" parent="1" source="io_client_display" target="proc_server_init_timer" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Gửi API lưu cấu hình" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e05" parent="1" source="proc_server_init_timer" target="proc_db_save_schedule" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Commit DB" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e06" parent="1" source="proc_db_save_schedule" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Kích hoạt giám sát định kỳ" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e07" parent="1" source="proc_worker_cron" target="dec_due_reached" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Quét định kỳ mỗi 1h" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e07_no" parent="1" source="dec_due_reached" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Chưa đến hạn -&gt; Chờ lần quét sau" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e08" parent="1" source="dec_due_reached" target="proc_trigger_grace" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Đã đến hạn (now &gt;= NextDue)" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e09" parent="1" source="proc_trigger_grace" target="proc_db_save_pending" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Commit CHECKIN_PENDING" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e10" parent="1" source="proc_db_save_pending" target="io_smtp_reminder" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Xếp hàng gửi email nhắc" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e11" parent="1" source="io_smtp_reminder" target="io_owner_ping" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Gửi email kèm liên kết an toàn" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e12" parent="1" source="io_owner_ping" target="io_client_send_ping" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Bấm nút xác nhận" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e13" parent="1" source="io_client_send_ping" target="dec_validate_checkin" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="POST check-in" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e14" parent="1" source="dec_validate_checkin" target="proc_reset_timer" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Hợp lệ &amp; không có hồ sơ chứng tử" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e15" parent="1" source="proc_reset_timer" target="proc_db_save_ping" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Thực thi ACID Transaction" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e16" parent="1" source="proc_db_save_ping" target="proc_client_pulse_active" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="HTTP 200 OK (DB Commit)" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e17" parent="1" source="proc_client_pulse_active" target="conn_active_loop" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e18" parent="1" source="conn_active_loop" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Nối A: Tiếp tục chu kỳ ACTIVE" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e19" parent="1" source="proc_worker_cron" target="dec_grace_expired" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Quét kiểm tra hết hạn chờ" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e20" parent="1" source="dec_grace_expired" target="proc_suspend_vault" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;fontSize=11;fontColor=#B45309;" value="Hết hạn chờ, chưa có điểm danh" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e20_no" parent="1" source="dec_grace_expired" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Còn hạn chờ -&gt; Tiếp tục theo dõi" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e21" parent="1" source="proc_suspend_vault" target="proc_db_save_suspension" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Commit DB mốc +90 ngày" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e22" parent="1" source="proc_db_save_suspension" target="io_smtp_suspension" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Xếp hàng gửi email tạm treo" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e23" parent="1" source="proc_db_save_suspension" target="io_client_suspended_ui" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Cập nhật trạng thái Client" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e24" parent="1" source="proc_suspend_vault" target="dec_has_executor" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Kiểm tra quyền phân bổ" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e25" parent="1" source="dec_has_executor" target="proc_dispatch_exec_task" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Có Executor đủ điều kiện" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e26" parent="1" source="proc_dispatch_exec_task" target="proc_db_save_exec_task" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Lưu ExecutorAlertTasks" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e27" parent="1" source="proc_db_save_exec_task" target="io_smtp_exec_alert" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Gửi email cảnh báo" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e28" parent="1" source="io_smtp_exec_alert" target="io_exec_receive_alert" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Chuyển tiếp tới Executor" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e29" parent="1" source="io_exec_receive_alert" target="dec_exec_action" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Executor rà soát" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e30" parent="1" source="dec_exec_action" target="io_exec_submit_resp" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Chưa có chứng tử / Vẫn sống" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e31" parent="1" source="dec_exec_action" target="offpage_exec_death_claim" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Có chứng tử -&gt; Nộp thẩm định" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e32" parent="1" source="dec_has_executor" target="proc_staged_reminders" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Không có Executor đủ điều kiện" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e33" parent="1" source="io_exec_submit_resp" target="proc_staged_reminders" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Đóng task, mốc 90d vẫn chạy" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e34" parent="1" source="proc_staged_reminders" target="dec_late_recovery" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Đếm ngược 30d, 7d, 24h" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e35" parent="1" source="io_owner_recover" target="dec_late_recovery" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Owner chủ động gửi check-in" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e36" parent="1" source="dec_late_recovery" target="proc_execute_recovery" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Điểm danh hợp lệ &amp; chưa có claim" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e37" parent="1" source="proc_execute_recovery" target="proc_db_save_recovery" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Giao dịch phục hồi ACID" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e38" parent="1" source="proc_db_save_recovery" target="conn_recovery_loop" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="DB Commit hoàn tất" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e39" parent="1" source="conn_recovery_loop" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Nối A: Khôi phục ACTIVE" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e40" parent="1" source="dec_late_recovery" target="dec_freeze_reached" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Vẫn im lặng" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e41" parent="1" source="dec_freeze_reached" target="proc_freeze_vault" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;fontSize=11;fontColor=#B45309;" value="now &gt;= FreezeAt (Hết 90 ngày)" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e41_no" parent="1" source="dec_freeze_reached" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Chưa đến hạn -&gt; Tiếp tục theo dõi" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e42" parent="1" source="proc_freeze_vault" target="proc_db_save_freeze" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Commit FROZEN_INACTIVITY" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e43" parent="1" source="proc_db_save_freeze" target="io_smtp_freeze_notice" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Gửi thông báo đóng băng an toàn" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e44" parent="1" source="proc_db_save_freeze" target="io_client_frozen_ui" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Cập nhật Client sang Read-only" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e45" parent="1" source="io_client_frozen_ui" target="end_frozen" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Dữ liệu được bảo toàn" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e46" parent="1" source="end_frozen" target="io_owner_recover" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Vẫn cho phép phục hồi sau đóng băng" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>"""

# Parse with ET to verify it is 100% well-formed XML
tree = ET.fromstring(xml_content)
print("Root tag:", tree.tag, "Total elements:", len(list(tree.iter())))

# Write directly to docs/04_business_flows/FLOW_03_SYSTEM_MERGED.xml
out_file = "docs/04_business_flows/FLOW_03_SYSTEM_MERGED.xml"
with open(out_file, "w", encoding="utf-8") as f:
    f.write(xml_content.strip() + "\n")

print(f"Successfully wrote clean XML directly to {out_file}!")
