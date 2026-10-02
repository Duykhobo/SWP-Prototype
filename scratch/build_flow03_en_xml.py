import xml.etree.ElementTree as ET

xml_content_en = """<mxfile host="Electron" agent="LegacyVault Architecture Engine">
  <diagram id="flow03_iso_standard" name="Flow 03 - Dead Mans Switch">
    <mxGraphModel dx="2357" dy="1375" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1780" pageHeight="3500" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title & Header -->
        <mxCell id="title" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#173F38;strokeColor=#173F38;fontColor=#FFFFFF;fontSize=15;fontFamily=Arial;fontStyle=1;" value="FLOW 03 · DEAD MAN'S SWITCH (DMS) · HEARTBEAT, SUSPENSION &amp; SAFE FREEZE (ISO 5807 / ANSI STANDARD)" vertex="1">
          <mxGeometry height="60" width="1580" x="50" y="30" as="geometry" />
        </mxCell>
        <mxCell id="intro" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#E9F3EE;strokeColor=#C9DED2;fontColor=#225A4C;fontSize=13;fontFamily=Arial;" value="Swimlane workflow for survival check-ins, grace periods, 90-day suspension countdowns, executor wellbeing alerts, and safe data freezing. Architecture: Server Process -&gt; DB Commit -&gt; Client Response. Legal reference: Art. 120 Civil Code 2015 &amp; LegacyVault SRS v3.11.0 product policies." vertex="1">
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
        <mxCell id="offpage_from_flow02" parent="lane0" style="shape=offPageConnector;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=11;fontFamily=Arial;fontStyle=1;" value="From FLOW 02&lt;br/&gt;(Plan ACTIVE)" vertex="1">
          <mxGeometry height="50" width="130" x="60" y="60" as="geometry" />
        </mxCell>
        <mxCell id="s_start" parent="lane0" style="ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=12;fontFamily=Arial;fontStyle=1;" value="START: DMS INITIALIZED&lt;br/&gt;Estate plan is active;&lt;br/&gt;Heartbeat countdown starts" vertex="1">
          <mxGeometry height="70" width="200" x="25" y="140" as="geometry" />
        </mxCell>
        <mxCell id="io_owner_config" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="01 · Configure DMS Cycle&lt;br/&gt;Select cycle (30/60/90 days)&lt;br/&gt;&amp; grace period (7/14/30 days)" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="240" as="geometry" />
        </mxCell>
        <mxCell id="io_owner_ping" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="05 · Check-in: Click 'I am Alive'&lt;br/&gt;Confirm safety via Web Dashboard&lt;br/&gt;or via secure Email web page" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="780" as="geometry" />
        </mxCell>
        <mxCell id="io_owner_recover" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="11 · Late Check-in Recovery&lt;br/&gt;Owner signs in &amp; pings alive&lt;br/&gt;during suspension or freeze" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="2030" as="geometry" />
        </mxCell>
        <mxCell id="end_frozen" parent="lane0" style="ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=12;fontFamily=Arial;fontStyle=1;" value="SAFE DATA FREEZE&lt;br/&gt;Read-only; No auto-wipe from DMS;&lt;br/&gt;Ready for recovery or death claim" vertex="1">
          <mxGeometry height="75" width="200" x="25" y="2720" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: CLIENT LANE (lane1) -->
        <!-- ========================================== -->
        <mxCell id="io_client_display" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="02 · Render Heartbeat Card&lt;br/&gt;Display live countdown timer&lt;br/&gt;&amp; active pulse indicator" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="240" as="geometry" />
        </mxCell>
        <mxCell id="io_client_send_ping" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="06 · POST /api/v1/dms/check-in&lt;br/&gt;Attach RAM-held Bearer JWT&lt;br/&gt;or Email CheckInToken" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="780" as="geometry" />
        </mxCell>
        <mxCell id="proc_client_pulse_active" parent="lane1" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="08 · Update UI: Pulse ACTIVE&lt;br/&gt;Display green pulse animation;&lt;br/&gt;Extend countdown by +CycleDays" vertex="1">
          <mxGeometry height="70" width="220" x="20" y="1050" as="geometry" />
        </mxCell>
        <mxCell id="conn_active_loop" parent="lane1" style="ellipse;aspect=fixed;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=12;fontFamily=Arial;fontStyle=1;align=center;verticalAlign=middle;" value="A" vertex="1">
          <mxGeometry height="40" width="40" x="110" y="1160" as="geometry" />
        </mxCell>
        <mxCell id="io_client_suspended_ui" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="10 · Display Suspension Banner&lt;br/&gt;Show 90-day freeze countdown;&lt;br/&gt;Provide 1-click recovery button" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="1500" as="geometry" />
        </mxCell>
        <mxCell id="io_client_frozen_ui" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="16 · Display Frozen State UI&lt;br/&gt;Lock asset mutations &amp; recipients;&lt;br/&gt;Preserve all data per OPLAN-05" vertex="1">
          <mxGeometry height="75" width="220" x="20" y="2570" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: SERVER & DMS WORKER LANE (lane2) -->
        <!-- ========================================== -->
        <mxCell id="proc_server_init_timer" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="03 · Initialize DMS Schedule&lt;br/&gt;NextCheckInDue = now + CycleDays;&lt;br/&gt;Settings changes apply next cycle" vertex="1">
          <mxGeometry height="75" width="260" x="35" y="240" as="geometry" />
        </mxCell>
        <mxCell id="proc_worker_cron" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="DmsHeartbeatWorker (HostedService)&lt;br/&gt;Hourly autonomous background scan&lt;br/&gt;for all active vaults" vertex="1">
          <mxGeometry height="65" width="260" x="35" y="360" as="geometry" />
        </mxCell>
        <mxCell id="dec_due_reached" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Check-in due date&lt;br/&gt;reached (now &gt;= NextDue)?" vertex="1">
          <mxGeometry height="85" width="190" x="70" y="460" as="geometry" />
        </mxCell>
        <mxCell id="proc_trigger_grace" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="04 · Transition to CHECKIN_PENDING&lt;br/&gt;GraceExpiresAt = NextDue + GraceDays;&lt;br/&gt;Queue check-in reminder email" vertex="1">
          <mxGeometry height="75" width="260" x="35" y="590" as="geometry" />
        </mxCell>
        <mxCell id="dec_validate_checkin" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Validate Check-in:&lt;br/&gt;Valid token &amp; no active&lt;br/&gt;death claim under review?" vertex="1">
          <mxGeometry height="85" width="190" x="70" y="780" as="geometry" />
        </mxCell>
        <mxCell id="proc_reset_timer" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="07 · ACID Check-in Transaction&lt;br/&gt;Insert CheckInLogs (with Method);&lt;br/&gt;VaultStatus = ACTIVE; NextDue = now+Cycle" vertex="1">
          <mxGeometry height="85" width="260" x="35" y="920" as="geometry" />
        </mxCell>
        <mxCell id="dec_grace_expired" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Worker check:&lt;br/&gt;now &gt;= GraceExpires&lt;br/&gt;&amp; no valid check-in?" vertex="1">
          <mxGeometry height="85" width="190" x="70" y="1210" as="geometry" />
        </mxCell>
        <mxCell id="proc_suspend_vault" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="09 · Transition to CHECKIN_SUSPENDED&lt;br/&gt;Record suspended_at = now;&lt;br/&gt;FreezeAt = GraceExpires + 90 days" vertex="1">
          <mxGeometry height="85" width="260" x="35" y="1350" as="geometry" />
        </mxCell>
        <mxCell id="dec_has_executor" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Eligible Executor&lt;br/&gt;appointed (XS/XSMax)?" vertex="1">
          <mxGeometry height="85" width="190" x="70" y="1490" as="geometry" />
        </mxCell>
        <mxCell id="proc_dispatch_exec_task" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="Dispatch ExecutorAlertTasks&lt;br/&gt;Queue wellbeing alert email;&lt;br/&gt;Track 48h reminder / 72h SLA" vertex="1">
          <mxGeometry height="75" width="260" x="35" y="1630" as="geometry" />
        </mxCell>
        <mxCell id="proc_staged_reminders" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="12 · Worker Staged Reminders&lt;br/&gt;Send warnings at: Start, 30 days,&lt;br/&gt;7 days, 24 hours (Deduplicated)" vertex="1">
          <mxGeometry height="75" width="260" x="35" y="1860" as="geometry" />
        </mxCell>
        <mxCell id="dec_late_recovery" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Owner pings alive&lt;br/&gt;before death claim?" vertex="1">
          <mxGeometry height="85" width="190" x="70" y="2030" as="geometry" />
        </mxCell>
        <mxCell id="proc_execute_recovery" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="13 · Restore Vault ACTIVE (ACID)&lt;br/&gt;Restore VaultStatus = ACTIVE;&lt;br/&gt;Close alert task: OWNER_CHECKED_IN" vertex="1">
          <mxGeometry height="85" width="260" x="35" y="2180" as="geometry" />
        </mxCell>
        <mxCell id="conn_recovery_loop" parent="lane2" style="ellipse;aspect=fixed;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=12;fontFamily=Arial;fontStyle=1;align=center;verticalAlign=middle;" value="A" vertex="1">
          <mxGeometry height="40" width="40" x="145" y="2310" as="geometry" />
        </mxCell>
        <mxCell id="dec_freeze_reached" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Worker check:&lt;br/&gt;now &gt;= FreezeAt&lt;br/&gt;(90 days elapsed)?" vertex="1">
          <mxGeometry height="85" width="190" x="70" y="2420" as="geometry" />
        </mxCell>
        <mxCell id="proc_freeze_vault" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="15 · Safe Freeze Transaction&lt;br/&gt;VaultStatus = FROZEN_INACTIVITY;&lt;br/&gt;Write AuditEvents per vault" vertex="1">
          <mxGeometry height="85" width="260" x="35" y="2560" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: DATABASE LANE (lane3) -->
        <!-- ========================================== -->
        <mxCell id="proc_db_save_schedule" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE [Vaults] SET NextDue&lt;br/&gt;&amp; DmsSettings; Write [AuditEvents]" vertex="1">
          <mxGeometry height="75" width="210" x="20" y="240" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_pending" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE Status='PENDING',&lt;br/&gt;GraceExpiresAt; Queue Email Reminder" vertex="1">
          <mxGeometry height="75" width="210" x="20" y="590" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_ping" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;INSERT [CheckInLogs]; UPDATE Status='ACTIVE',&lt;br/&gt;LastCheckIn=now, NextDue=now+Cycle" vertex="1">
          <mxGeometry height="85" width="210" x="20" y="920" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_suspension" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE Status='SUSPENDED',&lt;br/&gt;SuspendedAt=now, FreezeAt=due+90d" vertex="1">
          <mxGeometry height="85" width="210" x="20" y="1350" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_exec_task" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="INSERT [ExecutorAlertTasks]&lt;br/&gt;(TaskId, VaultId, ExecutorId, PENDING);&lt;br/&gt;Queue Outbox Warning Email" vertex="1">
          <mxGeometry height="75" width="210" x="20" y="1630" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_recovery" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE Status='ACTIVE';&lt;br/&gt;UPDATE Tasks SET Status='OWNER_CHECKED_IN'" vertex="1">
          <mxGeometry height="85" width="210" x="20" y="2180" as="geometry" />
        </mxCell>
        <mxCell id="proc_db_save_freeze" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="COMMIT TRANSACTION:&lt;br/&gt;UPDATE Status='FROZEN_INACTIVITY';&lt;br/&gt;Write [AuditEvents] (Per Vault)" vertex="1">
          <mxGeometry height="85" width="210" x="20" y="2560" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: GMAIL SMTP LANE (lane4) -->
        <!-- ========================================== -->
        <mxCell id="io_smtp_reminder" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Send Check-in Reminder&lt;br/&gt;Link opens web confirmation page&lt;br/&gt;(Prevents automated scanner clicks)" vertex="1">
          <mxGeometry height="75" width="210" x="15" y="590" as="geometry" />
        </mxCell>
        <mxCell id="io_smtp_suspension" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Send Suspension Notice&lt;br/&gt;Notify 90-day freeze countdown&lt;br/&gt;and late recovery instructions" vertex="1">
          <mxGeometry height="85" width="210" x="15" y="1350" as="geometry" />
        </mxCell>
        <mxCell id="io_smtp_exec_alert" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Send Executor Alert&lt;br/&gt;Request status verification&lt;br/&gt;(Does not presume death)" vertex="1">
          <mxGeometry height="75" width="210" x="15" y="1630" as="geometry" />
        </mxCell>
        <mxCell id="io_smtp_freeze_notice" parent="lane4" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Send Freeze Notification&lt;br/&gt;Vault is safely frozen;&lt;br/&gt;Data is fully preserved (No wipe)" vertex="1">
          <mxGeometry height="85" width="210" x="15" y="2560" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: EXECUTOR LANE (lane5) -->
        <!-- ========================================== -->
        <mxCell id="io_exec_receive_alert" parent="lane5" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Receive Status Inquiry Alert&lt;br/&gt;Check real-world status of Owner;&lt;br/&gt;No asset handover triggered yet" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="1630" as="geometry" />
        </mxCell>
        <mxCell id="dec_exec_action" parent="lane5" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Actual verification&lt;br/&gt;findings?" vertex="1">
          <mxGeometry height="85" width="190" x="30" y="1750" as="geometry" />
        </mxCell>
        <mxCell id="io_exec_submit_resp" parent="lane5" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="14a · Submit Status Response&lt;br/&gt;Record NO_CERTIFICATE_AVAILABLE;&lt;br/&gt;90-day timer continues running" vertex="1">
          <mxGeometry height="75" width="220" x="15" y="1880" as="geometry" />
        </mxCell>
        <mxCell id="offpage_exec_death_claim" parent="lane5" style="shape=offPageConnector;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=11;fontFamily=Arial;fontStyle=1;" value="14b · Submit Death Claim&lt;br/&gt;To FLOW 04&lt;br/&gt;(Legal Verification)" vertex="1">
          <mxGeometry height="60" width="130" x="60" y="2020" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- EDGES - 49 STRICT CAUSAL ARROWS -->
        <!-- ========================================== -->
        <mxCell id="e01" parent="1" source="offpage_from_flow02" target="s_start" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Plan activated" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e02" parent="1" source="s_start" target="io_owner_config" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e03" parent="1" source="io_owner_config" target="io_client_display" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Submit settings" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e04" parent="1" source="io_client_display" target="proc_server_init_timer" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="API save settings" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e05" parent="1" source="proc_server_init_timer" target="proc_db_save_schedule" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Commit DB" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e06" parent="1" source="proc_db_save_schedule" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Start recurring monitoring" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e07" parent="1" source="proc_worker_cron" target="dec_due_reached" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Hourly scan tick" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e07_no" parent="1" source="dec_due_reached" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Not due yet -&gt; Wait for next scan" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e08" parent="1" source="dec_due_reached" target="proc_trigger_grace" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Due date reached (now &gt;= NextDue)" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e09" parent="1" source="proc_trigger_grace" target="proc_db_save_pending" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Commit CHECKIN_PENDING" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e10" parent="1" source="proc_trigger_grace" target="io_smtp_reminder" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Queue reminder email" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e11" parent="1" source="io_smtp_reminder" target="io_owner_ping" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Deliver email with secure web link" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e12" parent="1" source="io_owner_ping" target="io_client_send_ping" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Click confirm check-in" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e13" parent="1" source="io_client_send_ping" target="dec_validate_checkin" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="POST check-in" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e14" parent="1" source="dec_validate_checkin" target="proc_reset_timer" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Valid &amp; no active claim under review" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e15" parent="1" source="proc_reset_timer" target="proc_db_save_ping" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Execute ACID transaction" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e16" parent="1" source="proc_db_save_ping" target="proc_client_pulse_active" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="HTTP 200 OK (DB Committed)" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e17" parent="1" source="proc_client_pulse_active" target="conn_active_loop" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e18" parent="1" source="conn_active_loop" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Connector A: Continue ACTIVE cycle" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e19" parent="1" source="proc_worker_cron" target="dec_grace_expired" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Worker checks grace period expiration" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e20" parent="1" source="dec_grace_expired" target="proc_suspend_vault" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;fontSize=11;fontColor=#B45309;" value="Grace expired without valid check-in" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e20_no" parent="1" source="dec_grace_expired" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Within grace period -&gt; Continue monitoring" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e21" parent="1" source="proc_suspend_vault" target="proc_db_save_suspension" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Commit DB freeze mốc (+90 days)" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e22" parent="1" source="proc_db_save_suspension" target="io_smtp_suspension" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Queue suspension notice email" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e23" parent="1" source="proc_db_save_suspension" target="io_client_suspended_ui" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Broadcast state to client UI" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e24" parent="1" source="proc_suspend_vault" target="dec_has_executor" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Check executor entitlement" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e25" parent="1" source="dec_has_executor" target="proc_dispatch_exec_task" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Eligible Executor appointed" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e26" parent="1" source="proc_dispatch_exec_task" target="proc_db_save_exec_task" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Save ExecutorAlertTasks in DB" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e27" parent="1" source="proc_db_save_exec_task" target="io_smtp_exec_alert" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Dispatch warning email" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e28" parent="1" source="io_smtp_exec_alert" target="io_exec_receive_alert" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Deliver alert to Executor" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e29" parent="1" source="io_exec_receive_alert" target="dec_exec_action" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Executor reviews findings" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e30" parent="1" source="dec_exec_action" target="io_exec_submit_resp" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="No certificate / Owner still alive" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e31" parent="1" source="dec_exec_action" target="offpage_exec_death_claim" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Death confirmed -&gt; Submit claim" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e32" parent="1" source="dec_has_executor" target="proc_staged_reminders" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="No eligible Executor appointed" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e33" parent="1" source="io_exec_submit_resp" target="proc_staged_reminders" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Close task; 90-day timer continues" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e34" parent="1" source="proc_staged_reminders" target="dec_late_recovery" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Countdown: 30d, 7d, 24h reminders" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e35" parent="1" source="io_owner_recover" target="dec_late_recovery" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Owner initiates late check-in" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e36" parent="1" source="dec_late_recovery" target="proc_execute_recovery" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Valid ping &amp; no active claim" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e37" parent="1" source="proc_execute_recovery" target="proc_db_save_recovery" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="ACID recovery transaction" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e38" parent="1" source="proc_db_save_recovery" target="conn_recovery_loop" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="DB commit completed" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e39" parent="1" source="conn_recovery_loop" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Connector A: Restored to ACTIVE" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e40" parent="1" source="dec_late_recovery" target="dec_freeze_reached" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Still silent" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e41" parent="1" source="dec_freeze_reached" target="proc_freeze_vault" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=1.5;fontSize=11;fontColor=#B45309;" value="now &gt;= FreezeAt (90 days elapsed)" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e41_no" parent="1" source="dec_freeze_reached" target="proc_worker_cron" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Not due yet -&gt; Continue monitoring" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e42" parent="1" source="proc_freeze_vault" target="proc_db_save_freeze" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Commit FROZEN_INACTIVITY" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e43" parent="1" source="proc_freeze_vault" target="io_smtp_freeze_notice" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Queue freeze notification email" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e44" parent="1" source="proc_freeze_vault" target="io_client_frozen_ui" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Update client UI to read-only" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e45" parent="1" source="io_client_frozen_ui" target="end_frozen" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#475569;strokeWidth=1.5;fontSize=11;" value="Data safely preserved" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        <mxCell id="e46" parent="1" source="end_frozen" target="io_owner_recover" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#2563EB;strokeWidth=1.5;dashed=1;fontSize=11;fontColor=#1E40AF;" value="Recovery still allowed after freeze" edge="1">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
  </diagram>
</mxfile>"""

# Parse with ET to verify it is 100% well-formed XML
tree = ET.fromstring(xml_content_en)
print("Root tag:", tree.tag, "Total elements:", len(list(tree.iter())))

# Write directly to docs/04_business_flows/FLOW_03_SYSTEM_MERGED.xml
out_file = "docs/04_business_flows/FLOW_03_SYSTEM_MERGED.xml"
with open(out_file, "w", encoding="utf-8") as f:
    f.write(xml_content_en.strip() + "\n")

print(f"Successfully wrote clean English XML directly to {out_file}!")
