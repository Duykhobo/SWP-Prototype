# Rebuild FLOW_02_SYSTEM_MERGED.xml with exact ISO/ANSI flowchart standards from user's image:
# - Start/Stop: Oval (Green #D5E8D4, border #82B366)
# - Process: Rectangle (Yellow #FFF2CC, border #D6B656)
# - Input/Output: Parallelogram (Cyan/Blue #DAE8FC, border #6C8EBF)
# - Decision: Rhombus (Orange #FFE6CC, border #D79B00)
# - On-page Connector: Circle (Purple #E1D5E7, border #9673A6)
# - Off-page Connector: Pentagon (Purple #E1D5E7, border #9673A6)

import xml.etree.ElementTree as ET

xml_content = """<mxfile host="Electron" agent="LegacyVault Architecture Engine">
  <diagram id="flow02_iso_standard" name="Flow 02 - Estate Plan Setup and Activation">
    <mxGraphModel dx="2357" dy="1375" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2050" pageHeight="3950" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title & Header -->
        <mxCell id="title" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#173F38;strokeColor=#173F38;fontColor=#FFFFFF;fontSize=15;fontFamily=Arial;fontStyle=1;" value="FLOW 02 · ESTATE PLAN SETUP AND ACTIVATION (ISO/ANSI FLOWCHART STANDARD)" vertex="1">
          <mxGeometry height="60" width="1920" x="50" y="30" as="geometry" />
        </mxCell>
        <mxCell id="intro" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#E9F3EE;strokeColor=#C9DED2;fontColor=#225A4C;fontSize=13;fontFamily=Arial;" value="Swimlane flow for asset upload, beneficiary allocation, executor appointment, manual identity verification, and plan activation. Strictly adheres to ANSI/ISO flowchart symbols (Start/Stop Oval, Process Rectangle, I/O Parallelogram, Decision Rhombus, and On/Off-page Connectors)." vertex="1">
          <mxGeometry height="60" width="1920" x="50" y="100" as="geometry" />
        </mxCell>

        <!-- 8 Dedicated Lanes (Height: 3260, Y: 180 -> 3440) -->
        <mxCell id="lane0" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="OWNER · ASSET OWNER" vertex="1">
          <mxGeometry height="3260" width="240" x="50" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane1" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="CLIENT · WEB APP (REACT 19)" vertex="1">
          <mxGeometry height="3260" width="250" x="290" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane2" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="SERVER · APPLICATION &amp; CRYPTO CORE" vertex="1">
          <mxGeometry height="3260" width="290" x="540" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane3" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="SEPAY GATEWAY · VIETQR" vertex="1">
          <mxGeometry height="3260" width="210" x="830" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane4" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="CLOUDFLARE R2 · STORAGE" vertex="1">
          <mxGeometry height="3260" width="210" x="1040" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane5" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="GMAIL SMTP · EMAIL SERVICE" vertex="1">
          <mxGeometry height="3260" width="220" x="1250" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane6" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="VERIFIER · MANUAL VERIFIER" vertex="1">
          <mxGeometry height="3260" width="220" x="1470" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane7" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="EXECUTOR · HANDOVER EXECUTOR" vertex="1">
          <mxGeometry height="3260" width="230" x="1690" y="180" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: OWNER LANE (lane0) -->
        <!-- ========================================== -->
        <!-- OFF-PAGE CONNECTOR: Received from Flow 01 (Purple Pentagon) -->
        <mxCell id="offpage_from_flow01" parent="lane0" style="shape=offPageConnector;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=11;fontFamily=Arial;fontStyle=1;" value="From FLOW 01&lt;br/&gt;(Session Active)" vertex="1">
          <mxGeometry height="55" width="130" x="55" y="70" as="geometry" />
        </mxCell>

        <!-- START: Oval (Green) -->
        <mxCell id="s" parent="lane0" style="ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=12;fontFamily=Arial;fontStyle=1;" value="START&lt;br/&gt;Owner session active;&lt;br/&gt;Access Vault workspace" vertex="1">
          <mxGeometry height="70" width="190" x="25" y="145" as="geometry" />
        </mxCell>

        <!-- 03: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="a3" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="03 · Enter Asset Information&lt;br/&gt;Enter asset information or select a file&lt;br/&gt;(Classify into 3 legal categories)" vertex="1">
          <mxGeometry height="80" width="220" x="10" y="580" as="geometry" />
        </mxCell>

        <!-- 06: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="a6" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="06 · Assign Beneficiaries &amp;amp; Allocations&lt;br/&gt;Declare beneficiary profiles;&lt;br/&gt;assign percentage allocation metadata per asset&lt;br/&gt;(Allocation metadata; not physical file split)" vertex="1">
          <mxGeometry height="85" width="220" x="10" y="1350" as="geometry" />
        </mxCell>

        <!-- 08: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="a8" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="08 · Nominate Executors&lt;br/&gt;Nominate primary and backup executors&lt;br/&gt;(Full Name, Phone, Email - Rule ASSIGN-06)" vertex="1">
          <mxGeometry height="80" width="220" x="10" y="1740" as="geometry" />
        </mxCell>

        <!-- 10: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="a10" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="10 · Submit Identity Documents&lt;br/&gt;Owner submits identity document images&lt;br/&gt;and required supporting information" vertex="1">
          <mxGeometry height="80" width="220" x="10" y="2220" as="geometry" />
        </mxCell>

        <!-- 11: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="a11" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="11 · Confirm Plan Activation&lt;br/&gt;Confirm legal attestation and click&lt;br/&gt;&#39;Activate Estate Plan&#39; on dashboard" vertex="1">
          <mxGeometry height="80" width="220" x="10" y="2800" as="geometry" />
        </mxCell>

        <!-- END: Oval (Green) -->
        <mxCell id="end" parent="lane0" style="ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=12;fontFamily=Arial;fontStyle=1;" value="END: PLAN ACTIVATED&lt;br/&gt;Estate Plan ACTIVE;&lt;br/&gt;DMS Heartbeat countdown running" vertex="1">
          <mxGeometry height="80" width="200" x="20" y="3190" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: CLIENT LANE (lane1) -->
        <!-- ========================================== -->
        <!-- 01: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="a1" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="01 · Render Plan Selection UI&lt;br/&gt;Display Free, XS, and XSMax plans&lt;br/&gt;and their entitlements" vertex="1">
          <mxGeometry height="80" width="230" x="10" y="190" as="geometry" />
        </mxCell>

        <!-- 04: Process (Rectangle - Yellow) -->
        <mxCell id="a4" parent="lane1" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="04 · Client Validation &amp;amp; Passphrase&lt;br/&gt;Validate inputs and file size (&amp;lt;= 20 MiB).&lt;br/&gt;Derive passphrase key; unlock Owner Share." vertex="1">
          <mxGeometry height="80" width="230" x="10" y="690" as="geometry" />
        </mxCell>

        <!-- Decision: Client-side inputs valid? (Rhombus - Orange) -->
        <mxCell id="d4" parent="lane1" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Client-Side&lt;br/&gt;Inputs Valid?" vertex="1">
          <mxGeometry height="80" width="170" x="40" y="800" as="geometry" />
        </mxCell>

        <!-- E2 Process (Rectangle - Red) -->
        <mxCell id="e2" parent="lane1" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E2 · Validation Error (&amp;gt; 20 MiB / missing fields):&lt;br/&gt;Client stops submission." vertex="1">
          <mxGeometry height="50" width="230" x="10" y="900" as="geometry" />
        </mxCell>

        <!-- 05.2: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="a5_client" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="05.2 · Client Confirms Version Saved&lt;br/&gt;Receive VersionId and upload result;&lt;br/&gt;display saved version on dashboard" vertex="1">
          <mxGeometry height="80" width="230" x="10" y="1240" as="geometry" />
        </mxCell>

        <!-- 11.1: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="a11_client" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="11.1 · Submit Activation Request&lt;br/&gt;Send activation request payload to&lt;br/&gt;POST /api/v1/plans/{planId}/activate" vertex="1">
          <mxGeometry height="80" width="230" x="10" y="2800" as="geometry" />
        </mxCell>

        <!-- 13.1: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="a13_client" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="13.1 · Display Active Status&lt;br/&gt;Update UI badge to ACTIVE;&lt;br/&gt;render DMS countdown timer" vertex="1">
          <mxGeometry height="80" width="230" x="10" y="3190" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: SERVER LANE (lane2) -->
        <!-- ========================================== -->
        <!-- 02: Process (Rectangle - Yellow) -->
        <mxCell id="a2" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="02 · Check Plan Entitlements &amp;amp; Quota&lt;br/&gt;Verify subscription status in DB.&lt;br/&gt;If upgrading: Initiate payment session." vertex="1">
          <mxGeometry height="80" width="260" x="15" y="300" as="geometry" />
        </mxCell>

        <!-- Decision: Storage Access Allowed? (Rhombus - Orange) -->
        <mxCell id="d2" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Storage Access&lt;br/&gt;Allowed?" vertex="1">
          <mxGeometry height="80" width="180" x="55" y="420" as="geometry" />
        </mxCell>

        <!-- E1 Process (Rectangle - Red) -->
        <mxCell id="e1" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E1 · Quota Exceeded:&lt;br/&gt;Prompt user to upgrade plan." vertex="1">
          <mxGeometry height="50" width="220" x="35" y="520" as="geometry" />
        </mxCell>

        <!-- 05: Process (Rectangle - Yellow) -->
        <mxCell id="a5" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="05 · AES-256-GCM Envelope Encryption&lt;br/&gt;Reconstruct current KEK; generate a new DEK;&lt;br/&gt;encrypt content with AAD; wrap DEK with AAD.&lt;br/&gt;Persist version metadata and mark Ready." vertex="1">
          <mxGeometry height="90" width="260" x="15" y="960" as="geometry" />
        </mxCell>

        <!-- Decision: Upload Succeeded? (Rhombus - Orange) -->
        <mxCell id="d5" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Upload &amp;amp; Persistence&lt;br/&gt;Succeeded?" vertex="1">
          <mxGeometry height="80" width="180" x="55" y="1080" as="geometry" />
        </mxCell>

        <!-- E3 Process (Rectangle - Red) -->
        <mxCell id="e3" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E3 · Crypto or Storage Failure:&lt;br/&gt;Rollback DB; purge orphan R2 object." vertex="1">
          <mxGeometry height="50" width="220" x="35" y="1180" as="geometry" />
        </mxCell>

        <!-- 07: Process (Rectangle - Yellow) -->
        <mxCell id="a7" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="07 · Validate Allocations &amp;amp; Store Manifest&lt;br/&gt;Validate beneficiary references and allocations.&lt;br/&gt;Save immutable PlanManifest in DB.&lt;br/&gt;No beneficiary notifications during setup." vertex="1">
          <mxGeometry height="85" width="260" x="15" y="1460" as="geometry" />
        </mxCell>

        <!-- Decision: Allocations Valid? (Rhombus - Orange) -->
        <mxCell id="d7" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Allocations Valid&lt;br/&gt;(&amp;lt;= 100%)?" vertex="1">
          <mxGeometry height="80" width="180" x="55" y="1575" as="geometry" />
        </mxCell>

        <!-- E4 Process (Rectangle - Red) -->
        <mxCell id="e4" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E4 · Invalid Allocations or Role Conflict:&lt;br/&gt;Return HTTP 422 with allocation warnings." vertex="1">
          <mxGeometry height="50" width="220" x="35" y="1675" as="geometry" />
        </mxCell>

        <!-- 09: Process (Rectangle - Yellow) -->
        <mxCell id="a9" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="09 · Generate Invitation Token&lt;br/&gt;Create appointment invitation token (TTL 48h).&lt;br/&gt;Instruct Gmail SMTP to dispatch invite." vertex="1">
          <mxGeometry height="80" width="260" x="15" y="1840" as="geometry" />
        </mxCell>

        <!-- 09.2: Process (Rectangle - Yellow) -->
        <mxCell id="a9_server_record" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="09.2 · Record Executor Status&lt;br/&gt;Record ExecutorStatus = ACCEPTED in DB.&lt;br/&gt;Unlock identity verification stage." vertex="1">
          <mxGeometry height="80" width="260" x="15" y="2110" as="geometry" />
        </mxCell>

        <!-- 10.1: Process (Rectangle - Yellow) -->
        <mxCell id="a10_server" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="10.1 · Ingest Dossier &amp;amp; Queue Review&lt;br/&gt;Store ID images in private storage.&lt;br/&gt;Set status PENDING_VERIFICATION; assign to Verifier." vertex="1">
          <mxGeometry height="80" width="260" x="15" y="2330" as="geometry" />
        </mxCell>

        <!-- 10.3: Process (Rectangle - Yellow) -->
        <mxCell id="a10_record_verif" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="10.3 · Persist Verification Audit&lt;br/&gt;Save IdentityStatus = VERIFIED in DB.&lt;br/&gt;Record verifier_id, timestamp, and audit trail." vertex="1">
          <mxGeometry height="80" width="260" x="15" y="2710" as="geometry" />
        </mxCell>

        <!-- 12: Process (Rectangle - Yellow) -->
        <mxCell id="a12" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="12 · Validate Activation Prerequisites&lt;br/&gt;Audit: Paid tier &amp;gt;= XS, Owner ID VERIFIED,&lt;br/&gt;Executor ACCEPTED, valid assets, manifest intact." vertex="1">
          <mxGeometry height="85" width="260" x="15" y="2910" as="geometry" />
        </mxCell>

        <!-- Decision: All Prerequisites Met? (Rhombus - Orange) -->
        <mxCell id="d12" parent="lane2" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="All Prerequisites&lt;br/&gt;Satisfied?" vertex="1">
          <mxGeometry height="80" width="180" x="55" y="3020" as="geometry" />
        </mxCell>

        <!-- E7 Process (Rectangle - Red) -->
        <mxCell id="e7" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E7 · Prerequisites Incomplete:&lt;br/&gt;Return HTTP 422 with checklist details." vertex="1">
          <mxGeometry height="50" width="220" x="35" y="3120" as="geometry" />
        </mxCell>

        <!-- 13: Process (Rectangle - Yellow) -->
        <mxCell id="a13" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="13 · Commit ACTIVE &amp;amp; Start DMS&lt;br/&gt;Atomic Serializable DB Transaction.&lt;br/&gt;Set plan ACTIVE; initialize next check-in deadline;&lt;br/&gt;record immutable audit log." vertex="1">
          <mxGeometry height="85" width="260" x="15" y="3190" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: SEPAY LANE (lane3) -->
        <!-- ========================================== -->
        <!-- 02.1: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="sepay_node" parent="lane3" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="02.1 · SePay Dynamic VietQR&lt;br/&gt;Generate NAPAS247 VietQR;&lt;br/&gt;Receive bank transaction &amp;amp;&lt;br/&gt;dispatch instant Webhook" vertex="1">
          <mxGeometry height="80" width="190" x="10" y="300" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: R2 STORAGE LANE (lane4) -->
        <!-- ========================================== -->
        <!-- 05.1: Process (Rectangle - Yellow) -->
        <mxCell id="r2_node" parent="lane4" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="05.1 · Cloudflare R2 Storage&lt;br/&gt;Store encrypted content under a unique&lt;br/&gt;version object key; return operation result." vertex="1">
          <mxGeometry height="80" width="180" x="15" y="965" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: GMAIL SMTP LANE (lane5) -->
        <!-- ========================================== -->
        <!-- 09.1: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="mailkit_node" parent="lane5" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="09.1 · Gmail SMTP Service&lt;br/&gt;Send appointment email via TLS;&lt;br/&gt;return acceptance status" vertex="1">
          <mxGeometry height="80" width="200" x="10" y="1840" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: VERIFIER LANE (lane6) -->
        <!-- ========================================== -->
        <!-- 10.2: Process (Rectangle - Yellow) -->
        <mxCell id="fptai_node" parent="lane6" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="10.2 · Manual Review &amp;amp; Audit (Verifier)&lt;br/&gt;Examine ID documents and validity.&lt;br/&gt;Submit review decision with verifier_id,&lt;br/&gt;verified_at, and audit notes." vertex="1">
          <mxGeometry height="85" width="190" x="15" y="2440" as="geometry" />
        </mxCell>

        <!-- Decision: Verification Decision? (Rhombus - Orange) -->
        <mxCell id="d10" parent="lane6" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Verification&lt;br/&gt;Decision?" vertex="1">
          <mxGeometry height="80" width="180" x="20" y="2550" as="geometry" />
        </mxCell>

        <!-- E6 Process (Rectangle - Red) -->
        <mxCell id="e6" parent="lane6" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E6 · Supplement Required / Rejected:&lt;br/&gt;Verifier notes missing criteria." vertex="1">
          <mxGeometry height="50" width="200" x="10" y="2650" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: EXECUTOR LANE (lane7) -->
        <!-- ========================================== -->
        <!-- Decision: Executor Accepts? (Rhombus - Orange) -->
        <mxCell id="d9" parent="lane7" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Executor Accepts&lt;br/&gt;Appointment?" vertex="1">
          <mxGeometry height="80" width="180" x="25" y="1950" as="geometry" />
        </mxCell>

        <!-- E5 Process (Rectangle - Red) -->
        <mxCell id="e5" parent="lane7" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E5 · Declined or 48h Timeout:&lt;br/&gt;Auto-invite backup executor." vertex="1">
          <mxGeometry height="50" width="200" x="15" y="2050" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- CONNECTORS / EDGES (parent = 1) -->
        <!-- ========================================== -->
        <!-- Offpage -> Start -->
        <mxCell id="edge_offpage_start" edge="1" parent="1" source="offpage_from_flow01" target="s" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#7C3AED;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Start -> 01 -->
        <mxCell id="edge_s_a1" edge="1" parent="1" source="s" target="a1" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 01 -> 02 -->
        <mxCell id="edge_a1_a2" edge="1" parent="1" source="a1" target="a2" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Request entitlement check">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 02 -> SePay -->
        <mxCell id="edge_a2_sepay" edge="1" parent="1" source="a2" target="sepay_node" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Create payment session">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- SePay -> 02 -->
        <mxCell id="edge_sepay_a2" edge="1" parent="1" source="sepay_node" target="a2" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Transaction notification">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 02 -> d2 -->
        <mxCell id="edge_a2_d2" edge="1" parent="1" source="a2" target="d2" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d2 -> 03 (Yes) -->
        <mxCell id="edge_d2_a3" edge="1" parent="1" source="d2" target="a3" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Storage access allowed">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d2 -> e1 (No) -->
        <mxCell id="edge_d2_e1" edge="1" parent="1" source="d2" target="e1" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="No">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e1 -> a1 (Loop-back) -->
        <mxCell id="loop_e1_a1" edge="1" parent="1" source="e1" target="a1" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Upgrade plan quota">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="650" y="580" />
              <mxPoint x="400" y="580" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 03 -> 04 -->
        <mxCell id="edge_a3_a4" edge="1" parent="1" source="a3" target="a4" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 04 -> d4 -->
        <mxCell id="edge_a4_d4" edge="1" parent="1" source="a4" target="d4" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d4 -> 05 (Yes) -->
        <mxCell id="edge_d4_a5" edge="1" parent="1" source="d4" target="a5" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Submit file and Owner Share">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d4 -> e2 (No) -->
        <mxCell id="edge_d4_e2" edge="1" parent="1" source="d4" target="e2" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="No">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e2 -> a3 (Loop-back) -->
        <mxCell id="loop_e2_a3" edge="1" parent="1" source="e2" target="a3" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Correct inputs">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="400" y="930" />
              <mxPoint x="170" y="930" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 05 -> R2 -->
        <mxCell id="edge_a5_r2" edge="1" parent="1" source="a5" target="r2_node" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Upload encrypted version">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- R2 -> d5 -->
        <mxCell id="edge_r2_d5" edge="1" parent="1" source="r2_node" target="d5" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Upload succeeded">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d5 -> 05.2 Client (Yes) -->
        <mxCell id="edge_d5_a5client" edge="1" parent="1" source="d5" target="a5_client" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Version saved successfully">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d5 -> e3 (No) -->
        <mxCell id="edge_d5_e3" edge="1" parent="1" source="d5" target="e3" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="No">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e3 -> a4 (Loop-back) -->
        <mxCell id="loop_e3_a4" edge="1" parent="1" source="e3" target="a4" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Retry upload">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="650" y="1210" />
              <mxPoint x="500" y="1210" />
              <mxPoint x="500" y="730" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 05.2 -> 06 -->
        <mxCell id="edge_a5client_a6" edge="1" parent="1" source="a5_client" target="a6" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Upload completed">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 06 -> 07 -->
        <mxCell id="edge_a6_a7" edge="1" parent="1" source="a6" target="a7" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Submit beneficiary allocations">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 07 -> d7 -->
        <mxCell id="edge_a7_d7" edge="1" parent="1" source="a7" target="d7" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d7 -> 08 (Yes) -->
        <mxCell id="edge_d7_a8" edge="1" parent="1" source="d7" target="a8" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Yes (Valid)">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d7 -> e4 (No) -->
        <mxCell id="edge_d7_e4" edge="1" parent="1" source="d7" target="e4" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="No">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e4 -> a6 (Loop-back) -->
        <mxCell id="loop_e4_a6" edge="1" parent="1" source="e4" target="a6" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Revise allocations">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="650" y="1705" />
              <mxPoint x="170" y="1705" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 08 -> 09 -->
        <mxCell id="edge_a8_a9" edge="1" parent="1" source="a8" target="a9" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Submit executor nominations">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 09 -> Gmail -->
        <mxCell id="edge_a9_gmail" edge="1" parent="1" source="a9" target="mailkit_node" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Send invitation email">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Gmail -> d9 -->
        <mxCell id="edge_gmail_d9" edge="1" parent="1" source="mailkit_node" target="d9" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Invitation email">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d9 -> 09.2 Server Record (Yes - Accepted) -->
        <mxCell id="edge_d9_a9record" edge="1" parent="1" source="d9" target="a9_server_record" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Accepted">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d9 -> e5 (No - Declined / Expired) -->
        <mxCell id="edge_d9_e5" edge="1" parent="1" source="d9" target="e5" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Declined / Expired">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e5 -> a8 (Loop-back) -->
        <mxCell id="loop_e5_a8" edge="1" parent="1" source="e5" target="a8" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Nominate another executor">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1800" y="2080" />
              <mxPoint x="1800" y="1780" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 09.2 Server Record -> 10 Owner -->
        <mxCell id="edge_a9record_a10" edge="1" parent="1" source="a9_server_record" target="a10" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 10 Owner -> 10.1 Server Ingest -->
        <mxCell id="edge_a10_server" edge="1" parent="1" source="a10" target="a10_server" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Submit ID dossier">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 10.1 Server Ingest -> 10.2 Verifier Review -->
        <mxCell id="edge_a10server_fptai" edge="1" parent="1" source="a10_server" target="fptai_node" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Assign review task">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 10.2 Verifier Review -> d10 -->
        <mxCell id="edge_fptai_d10" edge="1" parent="1" source="fptai_node" target="d10" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d10 -> 10.3 Server Record Verif (Verified) -->
        <mxCell id="edge_d10_record" edge="1" parent="1" source="d10" target="a10_record_verif" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Identity verified">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d10 -> e6 (Supplement Required / Rejected) -->
        <mxCell id="edge_d10_e6" edge="1" parent="1" source="d10" target="e6" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Supplement required">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e6 -> a10 (Loop-back) -->
        <mxCell id="loop_e6_a10" edge="1" parent="1" source="e6" target="a10" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Submit supplementary documents">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1570" y="2680" />
              <mxPoint x="1570" y="2260" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 10.3 Server Record Verif -> 11 Owner Confirm (LOWER THAN d10!) -->
        <mxCell id="edge_record_a11" edge="1" parent="1" source="a10_record_verif" target="a11" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 11 Owner -> 11.1 Client Submits -->
        <mxCell id="edge_a11_a11client" edge="1" parent="1" source="a11" target="a11_client" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 11.1 Client -> 12 Server Validate -->
        <mxCell id="edge_a11client_a12" edge="1" parent="1" source="a11_client" target="a12" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Submit activation request">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 12 Server Validate -> d12 -->
        <mxCell id="edge_a12_d12" edge="1" parent="1" source="a12" target="d12" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d12 -> 13 Commit (Yes) -->
        <mxCell id="edge_d12_a13" edge="1" parent="1" source="d12" target="a13" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="All prerequisites satisfied">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- d12 -> e7 (No) -->
        <mxCell id="edge_d12_e7" edge="1" parent="1" source="d12" target="e7" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Incomplete">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e7 -> a11 (Loop-back) -->
        <mxCell id="loop_e7_a11" edge="1" parent="1" source="e7" target="a11" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Complete pending prerequisites">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="650" y="3150" />
              <mxPoint x="500" y="3150" />
              <mxPoint x="500" y="2840" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 13 Commit -> 13.1 Client -->
        <mxCell id="edge_a13_a13client" edge="1" parent="1" source="a13" target="a13_client" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Activation succeeded">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 13.1 Client -> END -->
        <mxCell id="edge_a13client_end" edge="1" parent="1" source="a13_client" target="end" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- CALLOUT CONTAINER & LEGEND (Below lanes, y=3480) -->
        <!-- ========================================== -->
        <mxCell id="annot_container" parent="1" style="swimlane;startSize=28;rounded=1;arcSize=6;whiteSpace=wrap;html=1;fillColor=#F8FAF9;swimlaneFillColor=#F8FAF9;strokeColor=#1F5C51;strokeWidth=1.5;fontColor=#1F5C51;fontSize=12;fontStyle=1;align=left;spacingLeft=15;" value="TECHNICAL SPECIFICATION CALLOUT · DATA GOVERNANCE &amp; CRYPTOGRAPHIC DEFINITIONS" vertex="1">
          <mxGeometry height="145" width="1920" x="50" y="3480" as="geometry" />
        </mxCell>
        <mxCell id="annot_card_hash" parent="annot_container" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#EBF3F0;strokeColor=#4E877B;strokeWidth=1.2;fontColor=#133D37;fontSize=11;align=left;spacingLeft=10;spacingRight=10;" value="&lt;b&gt;1. WHAT DOES HASHING (SHA-256) DO?&lt;/b&gt;&lt;br/&gt;• 1-way irreversible cryptographic digest producing a 64-hex digital checksum.&lt;br/&gt;• Purpose: Data integrity verification and detection of unauthorized tampering.&lt;br/&gt;• Note: Checksum supports data integrity checks; legal non-repudiation requires combined attestations and audit trail." vertex="1">
          <mxGeometry height="98" width="445" x="15" y="36" as="geometry" />
        </mxCell>
        <mxCell id="annot_card_encrypt" parent="annot_container" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#EBF3F0;strokeColor=#4E877B;strokeWidth=1.2;fontColor=#133D37;fontSize=11;align=left;spacingLeft=10;spacingRight=10;" value="&lt;b&gt;2. WHAT DOES ENCRYPTION &amp; KEY HIERARCHY DO?&lt;/b&gt;&lt;br/&gt;• Authenticated encryption (AES-256-GCM) protecting file confidentiality with AAD.&lt;br/&gt;• A fresh 256-bit DEK is generated per asset/version and wrapped by the Master KEK.&lt;br/&gt;• Master KEK is the secret partitioned into 3 Shamir Shares (2/3 threshold). DEK is never split directly." vertex="1">
          <mxGeometry height="98" width="455" x="480" y="36" as="geometry" />
        </mxCell>
        <mxCell id="annot_card_r2" parent="annot_container" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#F1F4FA;strokeColor=#7188B5;strokeWidth=1.2;fontColor=#1A2D4E;fontSize=11;align=left;spacingLeft=10;spacingRight=10;" value="&lt;b&gt;3. WHAT DOES CLOUDFLARE R2 STORE?&lt;/b&gt;&lt;br/&gt;• Stores encrypted binary ciphertext blobs (.enc) in a private bucket ($0 egress).&lt;br/&gt;• Holds no plaintext files and no decryption keys.&lt;br/&gt;• Note: Object keys and file sizes are visible to storage administrators; sensitive metadata is kept in SQL Server." vertex="1">
          <mxGeometry height="98" width="455" x="955" y="36" as="geometry" />
        </mxCell>
        <mxCell id="annot_card_db" parent="annot_container" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#FAF5EB;strokeColor=#B5955E;strokeWidth=1.2;fontColor=#4A3816;fontSize=11;align=left;spacingLeft=10;spacingRight=10;" value="&lt;b&gt;4. WHAT DOES SQL SERVER 2022 STORE?&lt;/b&gt;&lt;br/&gt;• Stores relational metadata, access policies, audit events, and encrypted key material.&lt;br/&gt;• Stores wrapped System Share (Share 1), Nonce 12B, Auth Tag 16B, and WrappedDataKey.&lt;br/&gt;• Note: Sensitive metadata (asset titles, allocation maps) is secured via database access control." vertex="1">
          <mxGeometry height="98" width="470" x="1430" y="36" as="geometry" />
        </mxCell>

        <!-- LEGEND & ISO SHAPE GUIDE (Below callouts, y=3650) -->
        <mxCell id="legend" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#FFF6E2;strokeColor=#D8BD83;fontColor=#5A492C;fontSize=12;fontFamily=Arial;" value="ISO/ANSI STANDARD FLOWCHART GUIDE: [Green Oval] = Start/Stop | [Yellow Rect] = Action/Process | [Cyan Parallelogram] = Input/Output | [Orange Rhombus] = Decision (Yes/No) | [Purple Pentagon] = Off-page Connector (From Flow 01)" vertex="1">
          <mxGeometry height="60" width="1920" x="50" y="3650" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
"""

ET.fromstring(xml_content)
print("FLOW 02 ISO Standard XML is valid!")

with open("docs/04_business_flows/FLOW_02_SYSTEM_MERGED.xml", "w", encoding="utf-8") as f:
    f.write(xml_content.strip())
print("Successfully wrote ISO/ANSI standard FLOW_02_SYSTEM_MERGED.xml!")
