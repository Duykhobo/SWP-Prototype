import xml.etree.ElementTree as ET

xml_content = '''<mxfile host="Electron" agent="LegacyVault Architecture Engine">
  <diagram id="flow03_iso_standard" name="Flow 03 - Dead Mans Switch">
    <mxGraphModel dx="2357" dy="1375" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1780" pageHeight="3500" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title & Intro Header -->
        <mxCell id="title" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#173F38;strokeColor=#173F38;fontColor=#FFFFFF;fontSize=15;fontFamily=Arial;fontStyle=1;" value="FLOW 03 · DEAD MAN'S SWITCH (DMS) · HEARTBEAT, SUSPENSION &amp; SAFE FREEZE (ISO 5807 / ANSI STANDARD)" vertex="1">
          <mxGeometry height="60" width="1590" x="50" y="30" as="geometry" />
        </mxCell>
        <mxCell id="intro" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#E9F3EE;strokeColor=#C9DED2;fontColor=#225A4C;fontSize=13;fontFamily=Arial;" value="Swimlane workflow for survival check-ins, grace periods, independent 90-day suspension countdowns, executor wellbeing alerts, and safe data freezing. Architecture: Server Process -&gt; DB Commit -&gt; Client Response. Legal reference: Art. 120 Civil Code 2015 &amp; LegacyVault SRS v3.11.0 product policies." vertex="1">
          <mxGeometry height="60" width="1590" x="50" y="100" as="geometry" />
        </mxCell>

        <!-- 6 Dedicated Swimlanes (Height: 3280, Y: 180) -->
        <mxCell id="lane0" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="OWNER · ASSET OWNER" vertex="1">
          <mxGeometry height="3280" width="250" x="50" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane1" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="CLIENT · REACT WEB APP" vertex="1">
          <mxGeometry height="3280" width="260" x="300" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane2" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="SERVER · ASP.NET CORE 8 &amp; DMS WORKER" vertex="1">
          <mxGeometry height="3280" width="340" x="560" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane3" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="DATABASE · SQL SERVER 2022" vertex="1">
          <mxGeometry height="3280" width="250" x="900" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane4" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="GMAIL SMTP · EMAIL SERVICE" vertex="1">
          <mxGeometry height="3280" width="240" x="1150" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane5" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="EXECUTOR · HANDOVER EXECUTOR" vertex="1">
          <mxGeometry height="3280" width="250" x="1390" y="180" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: OWNER LANE (lane0) -->
        <!-- ========================================== -->
        <mxCell id="offpage_from_flow02" parent="lane0" style="shape=offPageConnector;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=11;fontFamily=Arial;fontStyle=1;" value="From FLOW 02&lt;br/&gt;(Plan ACTIVE)" vertex="1">
          <mxGeometry height="50" width="130" x="60" y="60" as="geometry" />
        </mxCell>
        <mxCell id="s_start" parent="lane0" style="ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=12;fontFamily=Arial;fontStyle=1;" value="START · DMS ACTIVATION&lt;br/&gt;Estate plan is active;&lt;br/&gt;Heartbeat monitoring begins" vertex="1">
          <mxGeometry height="65" width="200" x="25" y="130" as="geometry" />
        </mxCell>
        <mxCell id="io_owner_config" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="01 · Configure DMS Settings&lt;br/&gt;Select check-in cycle (30/60/90d)&lt;br/&gt;&amp; grace period (7/14/30d)" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="220" as="geometry" />
        </mxCell>
        <mxCell id="io_owner_ping" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="06 · Check-in: Click 'I Am Alive'&lt;br/&gt;Confirm safety via Web Dashboard&lt;br/&gt;or via secure Email web page" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="780" as="geometry" />
        </mxCell>
        <mxCell id="io_owner_recover" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="11 · Late Check-in Request&lt;br/&gt;Owner signs in &amp; pings alive&lt;br/&gt;while SUSPENDED or FROZEN" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="2600" as="geometry" />
        </mxCell>
        <mxCell id="end_frozen" parent="lane0" style="ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=12;fontFamily=Arial;fontStyle=1;" value="SAFE DATA FREEZE&lt;br/&gt;Read-only; No auto-wipe from DMS;&lt;br/&gt;Ready for recovery or claim" vertex="1">
          <mxGeometry height="75" width="200" x="25" y="2480" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: CLIENT LANE (lane1) -->
        <!-- ========================================== -->
        <mxCell id="io_client_submit_config" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="02 · Submit Settings Form&lt;br/&gt;POST /api/v1/dms/settings&lt;br/&gt;Payload: {cycleDays, graceDays}" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="220" as="geometry" />
        </mxCell>
        <mxCell id="io_client_render_card" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="04 · Render Heartbeat Card&lt;br/&gt;Display confirmed NextDue&lt;br/&gt;&amp; active pulse indicator" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="320" as="geometry" />
        </mxCell>
        <mxCell id="io_client_send_checkin" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="07 · POST /api/v1/dms/check-in&lt;br/&gt;Attach Bearer JWT in RAM&lt;br/&gt;or Email CheckInToken" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="780" as="geometry" />
        </mxCell>
        <mxCell id="proc_client_show_error" parent="lane1" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="Display Check-in Error (400/401)&lt;br/&gt;Token invalid / expired / already used;&lt;br/&gt;Prompt user to re-authenticate" vertex="1">
          <mxGeometry height="65" width="220" x="20" y="900" as="geometry" />
        </mxCell>
        <mxCell id="proc_client_pulse_active" parent="lane1" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="09 · Update UI: Active Pulse&lt;br/&gt;Display green pulse animation;&lt;br/&gt;Display new NextDue from Server" vertex="1">
          <mxGeometry height="70" width="220" x="20" y="1130" as="geometry" />
        </mxCell>
        <mxCell id="conn_active_loop" parent="lane1" style="ellipse;aspect=fixed;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=12;fontFamily=Arial;fontStyle=1;align=center;verticalAlign=middle;" value="A" vertex="1">
          <mxGeometry height="40" width="40" x="110" y="1225" as="geometry" />
        </mxCell>
        <mxCell id="io_client_suspended_ui" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="10 · Display Suspension Banner&lt;br/&gt;Show days remaining to FreezeAt;&lt;br/&gt;1-click recovery check-in button" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="1450" as="geometry" />
        </mxCell>
        <mxCell id="io_client_frozen_ui" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="16 · Display Frozen State UI&lt;br/&gt;Lock asset mutation features;&lt;br/&gt;Preserve all data per OPLAN-05" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="2480" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: SERVER LANE (lane2) -->
        <!-- ========================================== -->
        <mxCell id="proc_server_save_settings" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="03 · Process Initial Schedule&lt;br/&gt;NextCheckInDue = now + CycleDays;&lt;br/&gt;Settings changes apply next cycle" vertex="1">
          <mxGeometry height="75" width="260" x="40" y="220" as="geometry" />
        </mxCell>
        <mxCell id="proc_server_ack_config" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="Return HTTP 200 OK&lt;br/&gt;Include confirmed NextDue &amp; Schedule" vertex="1">
          <mxGeometry height="65" width="260" x="40" y="325" as="geometry" />
        </mxCell>
        <mxCell id="proc_worker_cron" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="DmsHeartbeatWorker (HostedService)&lt;br/&gt;Hourly autonomous background audit&lt;br/&gt;for all system vaults" vertex="1">
          <mxGeometry height="65" width="260" x="40" y="420" as="geometry" />
        </mxCell>
        <mxCell id="dec_worker_active_scan" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Status == 'ACTIVE'&lt;br/&gt;AND now &gt;= NextDue?" vertex="1">
          <mxGeometry height="85" width="210" x="65" y="515" as="geometry" />
        </mxCell>
        <mxCell id="proc_trigger_grace" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="05 · Transition to CHECKIN_PENDING&lt;br/&gt;GraceExpiresAt = NextDue + GraceDays;&lt;br/&gt;Queue check-in reminder email (DMS-03)" vertex="1">
          <mxGeometry height="75" width="260" x="40" y="650" as="geometry" />
        </mxCell>
        <mxCell id="dec_validate_checkin" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Check-in Validation:&lt;br/&gt;Token valid &amp; no death claim&lt;br/&gt;approved or under review?" vertex="1">
          <mxGeometry height="95" width="220" x="60" y="770" as="geometry" />
        </mxCell>
        <mxCell id="proc_server_flag_conflict" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="Flag Status = RESCUE_PENDING&lt;br/&gt;Alive check-in conflicts with claim;&lt;br/&gt;Notify Verifier for urgent review" vertex="1">
          <mxGeometry height="75" width="260" x="40" y="900" as="geometry" />
        </mxCell>
        <mxCell id="proc_reset_timer" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="08 · ACID Check-in Process&lt;br/&gt;Insert CheckInLogs (with Method);&lt;br/&gt;Status = 'ACTIVE'; NextDue = now+Cycle;&lt;br/&gt;Close alert task: OWNER_CHECKED_IN" vertex="1">
          <mxGeometry height="85" width="260" x="40" y="1010" as="geometry" />
        </mxCell>
        <mxCell id="proc_server_ack_checkin" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="Return HTTP 200 OK&lt;br/&gt;New NextDue returned by Server" vertex="1">
          <mxGeometry height="55" width="260" x="40" y="1135" as="geometry" />
        </mxCell>
        <mxCell id="dec_worker_grace_scan" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Status == 'CHECKIN_PENDING'&lt;br/&gt;AND now &gt;= GraceExpiresAt?" vertex="1">
          <mxGeometry height="85" width="220" x="60" y="1320" as="geometry" />
        </mxCell>
        <mxCell id="proc_suspend_vault" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="10 · Transition to CHECKIN_SUSPENDED&lt;br/&gt;Record suspended_at = now;&lt;br/&gt;FreezeAt = GraceExpiresAt + 90 days;&lt;br/&gt;Pause regular check-in countdown" vertex="1">
          <mxGeometry height="85" width="260" x="40" y="1445" as="geometry" />
        </mxCell>
        <mxCell id="dec_has_executor" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Check qualified Executor&lt;br/&gt;assigned (XS/XSMax)?" vertex="1">
          <mxGeometry height="85" width="210" x="65" y="1575" as="geometry" />
        </mxCell>
        <mxCell id="proc_dispatch_exec_task" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="Dispatch ExecutorAlertTasks in DB&lt;br/&gt;Remind after 48h; 72h SLA response window;&lt;br/&gt;Does not control 90-day freeze timer" vertex="1">
          <mxGeometry height="75" width="260" x="40" y="1695" as="geometry" />
        </mxCell>
        <mxCell id="proc_server_verify_exec" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="Validate Executor Response&lt;br/&gt;Verify TaskId &amp; authorization token" vertex="1">
          <mxGeometry height="65" width="260" x="40" y="1935" as="geometry" />
        </mxCell>
        <mxCell id="dec_worker_suspended_scan" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Status == 'CHECKIN_SUSPENDED'&lt;br/&gt;Worker autonomous audit scan" vertex="1">
          <mxGeometry height="85" width="220" x="60" y="2100" as="geometry" />
        </mxCell>
        <mxCell id="proc_staged_reminders" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="12 · Send Staged Reminders&lt;br/&gt;Countdown: Start, 30d, 7d, 24h&lt;br/&gt;(Deduplicated email dispatch)" vertex="1">
          <mxGeometry height="75" width="260" x="40" y="2220" as="geometry" />
        </mxCell>
        <mxCell id="dec_freeze_reached" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Status == 'CHECKIN_SUSPENDED'&lt;br/&gt;AND now &gt;= FreezeAt&lt;br/&gt;(90 days elapsed)?" vertex="1">
          <mxGeometry height="85" width="220" x="60" y="2340" as="geometry" />
        </mxCell>
        <mxCell id="proc_freeze_vault" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="15 · Safe Freeze Transaction&lt;br/&gt;Status = FROZEN_INACTIVITY;&lt;br/&gt;Write AuditEvents per vault;&lt;br/&gt;Lock mutations, preserve all data" vertex="1">
          <mxGeometry height="85" width="260" x="40" y="2475" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: DATABASE LANE (lane3) -->
        <!-- ========================================== -->
        <mxCell id="proc_db_save_schedule" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE [Vaults] SET NextCheckInDue&lt;br/&gt;&amp; DmsSettings; Write [AuditEvents]" vertex="1">
          <mxGeometry height="75" width="210" x="20" y="220" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_pending" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE Status='CHECKIN_PENDING',&lt;br/&gt;GraceExpiresAt; Queue Reminder Email" vertex="1">
          <mxGeometry height="75" width="210" x="20" y="650" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_checkin" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;INSERT INTO [CheckInLogs];&lt;br/&gt;UPDATE Status='ACTIVE', LastCheckIn=now;&lt;br/&gt;UPDATE Tasks='OWNER_CHECKED_IN'" vertex="1">
          <mxGeometry height="85" width="210" x="20" y="1010" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_suspension" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE Status='CHECKIN_SUSPENDED',&lt;br/&gt;SuspendedAt=now, FreezeAt=due+90d" vertex="1">
          <mxGeometry height="85" width="210" x="20" y="1445" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_exec_task" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="INSERT INTO [ExecutorAlertTasks]&lt;br/&gt;(TaskId, VaultId, ExecutorId, PENDING);&lt;br/&gt;Queue Outbox Warning Email" vertex="1">
          <mxGeometry height="75" width="210" x="20" y="1695" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_exec_resp" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE [ExecutorAlertTasks]&lt;br/&gt;SET Status='NO_CERTIFICATE_AVAILABLE',&lt;br/&gt;CompletedAt=now" vertex="1">
          <mxGeometry height="75" width="210" x="20" y="1930" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_freeze" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE Status='FROZEN_INACTIVITY';&lt;br/&gt;Write [AuditEvents] (Per Vault);&lt;br/&gt;Queue Freeze Notification Email" vertex="1">
          <mxGeometry height="85" width="210" x="20" y="2475" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: GMAIL SMTP LANE (lane4) -->
        <!-- ========================================== -->
        <mxCell id="io_smtp_reminder" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Send Check-in Reminder Email&lt;br/&gt;Link opens web check-in page&lt;br/&gt;(Prevents bot scanner clicks)" vertex="1">
          <mxGeometry height="75" width="210" x="15" y="650" as="geometry" />
        </mxCell>
        <mxCell id="io_smtp_suspension" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Send Suspension Notice&lt;br/&gt;Alert 90-day countdown to freeze&lt;br/&gt;and recovery instructions" vertex="1">
          <mxGeometry height="85" width="210" x="15" y="1445" as="geometry" />
        </mxCell>
        <mxCell id="io_smtp_exec_alert" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Send Executor Alert&lt;br/&gt;Action required: Check on Owner;&lt;br/&gt;Death NOT presumed" vertex="1">
          <mxGeometry height="75" width="210" x="15" y="1695" as="geometry" />
        </mxCell>
        <mxCell id="io_smtp_staged_reminder" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Deliver Staged Warning Email&lt;br/&gt;Notice of remaining days to FreezeAt&lt;br/&gt;(Impending data freeze)" vertex="1">
          <mxGeometry height="75" width="210" x="15" y="2220" as="geometry" />
        </mxCell>
        <mxCell id="io_smtp_freeze_notice" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Send Freeze Notification&lt;br/&gt;Vault is safely frozen;&lt;br/&gt;Data preserved, never deleted" vertex="1">
          <mxGeometry height="85" width="210" x="15" y="2475" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: EXECUTOR LANE (lane5) -->
        <!-- ========================================== -->
        <mxCell id="io_exec_receive_alert" parent="lane5" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Receive Wellbeing Alert&lt;br/&gt;Check real-world status of Owner;&lt;br/&gt;Handover NOT triggered" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="1695" as="geometry" />
        </mxCell>
        <mxCell id="dec_exec_action" parent="lane5" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Actual verification&lt;br/&gt;findings?" vertex="1">
          <mxGeometry height="85" width="190" x="30" y="1810" as="geometry" />
        </mxCell>
        <mxCell id="io_exec_submit_resp" parent="lane5" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="14a · Submit Status to Server&lt;br/&gt;Record NO_CERTIFICATE_AVAILABLE;&lt;br/&gt;90-day timer continues running" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="1930" as="geometry" />
        </mxCell>
        <mxCell id="offpage_exec_death_claim" parent="lane5" style="shape=offPageConnector;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=11;fontFamily=Arial;fontStyle=1;" value="14b · Submit Death Claim&lt;br/&gt;To FLOW 04&lt;br/&gt;(Legal Verification)" vertex="1">
          <mxGeometry height="60" width="130" x="60" y="2040" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- EDGES - STRICT CAUSAL ARROWS -->
        <!-- ========================================== -->
        <mxCell id="e01" parent="1" source="offpage_from_flow02" target="s_start" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Plan activated" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e02" parent="1" source="s_start" target="io_owner_config" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e03" parent="1" source="io_owner_config" target="io_client_submit_config" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Enter settings" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e04" parent="1" source="io_client_submit_config" target="proc_server_save_settings" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="POST settings" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e05" parent="1" source="proc_server_save_settings" target="proc_db_save_schedule" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Commit DB" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e05_ack" parent="1" source="proc_db_save_schedule" target="proc_server_ack_config" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Schedule saved" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1005" y="357" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e05_render" parent="1" source="proc_server_ack_config" target="io_client_render_card" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="HTTP 200 OK (Schedule)" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e06" parent="1" source="proc_server_ack_config" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Start recurring background audit" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Worker Scan 1: ACTIVE due date check -->
        <mxCell id="e07" parent="1" source="proc_worker_cron" target="dec_worker_active_scan" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Hourly audit scan" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e07_no" parent="1" source="dec_worker_active_scan" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="now &lt; NextDue -&gt; Wait for next scan" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="840" y="557" />
              <mxPoint x="840" y="452" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e08" parent="1" source="dec_worker_active_scan" target="proc_trigger_grace" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="ACTIVE AND now &gt;= NextDue" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e09" parent="1" source="proc_trigger_grace" target="proc_db_save_pending" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Commit CHECKIN_PENDING" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e10" parent="1" source="proc_db_save_pending" target="io_smtp_reminder" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Queue reminder email" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e11" parent="1" source="io_smtp_reminder" target="io_owner_ping" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Deliver email with secure web link" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1255" y="740" />
              <mxPoint x="125" y="740" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Check-in validation (Both regular and late check-in) -->
        <mxCell id="e12" parent="1" source="io_owner_ping" target="io_client_send_checkin" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Click confirm check-in" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e13" parent="1" source="io_client_send_checkin" target="dec_validate_checkin" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="POST check-in" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e14_err" parent="1" source="dec_validate_checkin" target="proc_client_show_error" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#DC2626;strokeWidth=1.5;fontSize=11;fontColor=#991B1B;" value="Token invalid / expired / used" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="430" y="817" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e14_conflict" parent="1" source="dec_validate_checkin" target="proc_server_flag_conflict" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;fontSize=11;fontColor=#B45309;" value="Claim under review exists" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e14" parent="1" source="dec_validate_checkin" target="proc_reset_timer" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Token valid &amp; no active claim" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="730" y="990" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e15" parent="1" source="proc_reset_timer" target="proc_db_save_checkin" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="ACID transaction" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e16_ack" parent="1" source="proc_db_save_checkin" target="proc_server_ack_checkin" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="DB committed" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1005" y="1162" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e16" parent="1" source="proc_server_ack_checkin" target="proc_client_pulse_active" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="HTTP 200 OK (New NextDue)" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e17" parent="1" source="proc_client_pulse_active" target="conn_active_loop" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e18" parent="1" source="conn_active_loop" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Connector A: Continue ACTIVE cycle" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="540" y="1245" />
              <mxPoint x="540" y="452" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Worker Scan 2: Grace period expiration check -->
        <mxCell id="e19" parent="1" source="proc_worker_cron" target="dec_worker_grace_scan" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Worker checks grace expiration" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="575" y="452" />
              <mxPoint x="575" y="1362" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e20_no" parent="1" source="dec_worker_grace_scan" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="now &lt; GraceExpiresAt -&gt; Continue monitoring" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="870" y="1362" />
              <mxPoint x="870" y="452" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e20" parent="1" source="dec_worker_grace_scan" target="proc_suspend_vault" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;fontSize=11;fontColor=#B45309;" value="CHECKIN_PENDING AND now &gt;= GraceExpiresAt" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e21" parent="1" source="proc_suspend_vault" target="proc_db_save_suspension" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Commit CHECKIN_SUSPENDED (+90d)" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e22" parent="1" source="proc_db_save_suspension" target="io_smtp_suspension" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Queue suspension notice email" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e23" parent="1" source="proc_db_save_suspension" target="io_client_suspended_ui" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Update Client UI to SUSPENDED" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1005" y="1560" />
              <mxPoint x="430" y="1560" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Executor Sub-workflow (Dispatched after suspension commit) -->
        <mxCell id="e24" parent="1" source="proc_db_save_suspension" target="dec_has_executor" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Evaluate executor assignment" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1005" y="1617" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e25" parent="1" source="dec_has_executor" target="proc_dispatch_exec_task" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Qualified Executor assigned" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e26" parent="1" source="proc_dispatch_exec_task" target="proc_db_save_exec_task" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Save ExecutorAlertTasks" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e27" parent="1" source="proc_db_save_exec_task" target="io_smtp_exec_alert" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Dispatch alert email" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e28" parent="1" source="io_smtp_exec_alert" target="io_exec_receive_alert" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Deliver alert to Executor" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e29" parent="1" source="io_exec_receive_alert" target="dec_exec_action" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Inquire into Owner status" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e30" parent="1" source="dec_exec_action" target="io_exec_submit_resp" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="No certificate / Owner still alive" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e30_server" parent="1" source="io_exec_submit_resp" target="proc_server_verify_exec" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="POST /api/v1/executor/respond" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1500" y="2020" />
              <mxPoint x="730" y="2020" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e30_db" parent="1" source="proc_server_verify_exec" target="proc_db_save_exec_resp" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Record response in DB" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e31" parent="1" source="dec_exec_action" target="offpage_exec_death_claim" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Death confirmed with cert" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Worker Scan 3: Independent monitoring of CHECKIN_SUSPENDED vaults -->
        <mxCell id="e32_worker" parent="1" source="proc_worker_cron" target="dec_worker_suspended_scan" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Worker audits suspended vaults" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="555" y="452" />
              <mxPoint x="555" y="2142" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e33_remind" parent="1" source="dec_worker_suspended_scan" target="proc_staged_reminders" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Staged reminder milestone reached" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e33_smtp" parent="1" source="proc_staged_reminders" target="io_smtp_staged_reminder" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Queue warning email" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e34_freeze_scan" parent="1" source="dec_worker_suspended_scan" target="dec_freeze_reached" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Evaluate freeze milestone" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e34_no" parent="1" source="dec_freeze_reached" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="now &lt; FreezeAt -&gt; Continue countdown" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="890" y="2382" />
              <mxPoint x="890" y="452" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e35_freeze" parent="1" source="dec_freeze_reached" target="proc_freeze_vault" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;fontSize=11;fontColor=#B45309;" value="now &gt;= FreezeAt (90 days elapsed)" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e36" parent="1" source="proc_freeze_vault" target="proc_db_save_freeze" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Commit FROZEN_INACTIVITY" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e37" parent="1" source="proc_db_save_freeze" target="io_smtp_freeze_notice" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Queue freeze notification email" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e38" parent="1" source="proc_db_save_freeze" target="io_client_frozen_ui" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Update Client UI to Read-only" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1005" y="2590" />
              <mxPoint x="430" y="2590" />
            </Array>
          </mxGeometry>
        </mxCell>
        <mxCell id="e39" parent="1" source="io_client_frozen_ui" target="end_frozen" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Data safely preserved" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e40_loop_recover" parent="1" source="end_frozen" target="io_owner_recover" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Recovery permitted anytime post-freeze" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e41_late_to_client" parent="1" source="io_owner_recover" target="io_client_send_checkin" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Owner submits check-in" edge="1">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="125" y="2710" />
              <mxPoint x="290" y="2710" />
              <mxPoint x="290" y="817" />
            </Array>
          </mxGeometry>
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>'''

# Validate with ElementTree
root = ET.fromstring(xml_content)
print(f"Validated! Tag: {root.tag}, elements: {len(list(root.iter()))}")

# Write to file
target_path = "docs/04_business_flows/FLOW_03_SYSTEM_MERGED.xml"
with open(target_path, "w", encoding="utf-8") as f:
    f.write(xml_content)

print(f"Successfully updated {target_path}!")
