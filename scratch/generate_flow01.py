import xml.etree.ElementTree as ET

xml_content = """<mxfile host="Electron" agent="LegacyVault Architecture Engine">
  <diagram id="flow01_iso_standard" name="Flow 01 - Sign-in and Account Registration">
    <mxGraphModel dx="2357" dy="1375" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="2600" pageHeight="2380" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- ========================================== -->
        <!-- HEADER: TITLE & INTRO BANNERS -->
        <!-- ========================================== -->
        <mxCell id="title" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#173F38;strokeColor=#173F38;fontColor=#FFFFFF;fontSize=15;fontFamily=Arial;fontStyle=1;" value="FLOW 01 · SIGN-IN AND ACCOUNT REGISTRATION (CONVENTIONAL FLOWCHART SYSTEM)" vertex="1">
          <mxGeometry height="55" width="2500" x="50" y="30" as="geometry" />
        </mxCell>
        <mxCell id="intro" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#E9F3EE;strokeColor=#C9DED2;fontColor=#225A4C;fontSize=13;fontFamily=Arial;" value="Master swimlane architecture featuring two independent authentication modules (01A: Google OIDC with JIT Provisioning, 01B: Email/Password with SEC-02 Salted Hash) converging into a common session verification and token issuance engine. Uses conventional flowchart symbols." vertex="1">
          <mxGeometry height="55" width="2500" x="50" y="95" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- TOP SECTION: PHẦN ĐẦU — CHỌN PHƯƠNG THỨC -->
        <!-- ========================================== -->
        <mxCell id="top_section" parent="1" style="swimlane;horizontal=1;startSize=28;rounded=1;arcSize=6;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#64748B;strokeWidth=1.5;fontColor=#1E293B;fontSize=12;fontStyle=1;align=left;spacingLeft=15;" value="PHẦN ĐẦU — KHỞI TẠO VÀ LỰA CHỌN PHƯƠNG THỨC XÁC THỰC (AUTHENTICATION SELECTION)" vertex="1">
          <mxGeometry height="165" width="2500" x="50" y="165" as="geometry" />
        </mxCell>

        <!-- START: Oval (Green) -->
        <mxCell id="start_node" parent="top_section" style="ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=12;fontFamily=Arial;fontStyle=1;" value="START&lt;br/&gt;User accesses LegacyVault&lt;br/&gt;via Web Browser (HTTPS)" vertex="1">
          <mxGeometry height="65" width="220" x="380" y="55" as="geometry" />
        </mxCell>

        <!-- 01: User Action (Parallelogram - Cyan/Blue) -->
        <mxCell id="step01_user_select" parent="top_section" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="01 · Select Authentication Method&lt;br/&gt;User chooses [Sign in with Google]&lt;br/&gt;or [Email / Password Form]" vertex="1">
          <mxGeometry height="65" width="280" x="880" y="55" as="geometry" />
        </mxCell>

        <!-- Decision: Method Selection (Rhombus - Orange) -->
        <mxCell id="dec_auth_method" parent="top_section" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Authentication&lt;br/&gt;Method?" vertex="1">
          <mxGeometry height="75" width="200" x="1450" y="50" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- KHỐI BÊN TRÁI: 01A · GOOGLE IDENTITY SERVICES -->
        <!-- ========================================== -->
        <mxCell id="container_01a" parent="1" style="swimlane;horizontal=1;startSize=34;rounded=1;arcSize=4;whiteSpace=wrap;html=1;fillColor=#F0F9FF;swimlaneFillColor=#FFFFFF;strokeColor=#0284C7;strokeWidth=2;fontColor=#0369A1;fontSize=13;fontStyle=1;align=center;collapsible=0;" value="KHỐI CON 01A · GOOGLE IDENTITY SERVICES (OIDC &amp;amp; JIT PROVISIONING)" vertex="1">
          <mxGeometry height="1250" width="1380" x="50" y="350" as="geometry" />
        </mxCell>

        <!-- 01A Lanes (5 Lanes, Height: 1216, start at y=34) -->
        <mxCell id="lane_01a_user" parent="container_01a" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="USER / VISITOR" vertex="1">
          <mxGeometry height="1216" width="190" x="0" y="34" as="geometry" />
        </mxCell>
        <mxCell id="lane_01a_client" parent="container_01a" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="CLIENT · REACT WEB APP" vertex="1">
          <mxGeometry height="1216" width="280" x="190" y="34" as="geometry" />
        </mxCell>
        <mxCell id="lane_01a_google" parent="container_01a" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="GOOGLE IDENTITY SERVICES" vertex="1">
          <mxGeometry height="1216" width="240" x="470" y="34" as="geometry" />
        </mxCell>
        <mxCell id="lane_01a_server" parent="container_01a" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="BACKEND · ASP.NET CORE 8" vertex="1">
          <mxGeometry height="1216" width="350" x="710" y="34" as="geometry" />
        </mxCell>
        <mxCell id="lane_01a_db" parent="container_01a" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="DATABASE · SQL SERVER 2022" vertex="1">
          <mxGeometry height="1216" width="320" x="1060" y="34" as="geometry" />
        </mxCell>

        <!-- Nodes in 01A: Client (Step 01.A.1) -->
        <mxCell id="step01_client_google" parent="lane_01a_client" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="01.A.1 · Initialize Google GIS&lt;br/&gt;Generate 256-bit Nonce / Challenge.&lt;br/&gt;Render standard Google Sign-in button." vertex="1">
          <mxGeometry height="70" width="240" x="20" y="50" as="geometry" />
        </mxCell>

        <!-- Nodes in 01A: User (Step 01.A.0) - Receives from Client Init! -->
        <mxCell id="step01a_user" parent="lane_01a_user" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=11;fontFamily=Arial;fontStyle=1;" value="01.A.0 · Click Google Sign-in&lt;br/&gt;User clicks standard&lt;br/&gt;Google Sign-in button" vertex="1">
          <mxGeometry height="70" width="165" x="12" y="50" as="geometry" />
        </mxCell>

        <!-- Nodes in 01A: Client (Dec Popup & Errors) -->
        <mxCell id="dec_popup" parent="lane_01a_client" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Popup &amp;amp; Network&lt;br/&gt;Available?" vertex="1">
          <mxGeometry height="65" width="170" x="55" y="155" as="geometry" />
        </mxCell>
        <mxCell id="e01_popup" parent="lane_01a_client" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E0.1A · Popup Blocked:&lt;br/&gt;Alert user; prompt unblock or select Form." vertex="1">
          <mxGeometry height="50" width="240" x="20" y="250" as="geometry" />
        </mxCell>
        <mxCell id="e01_offline" parent="lane_01a_client" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E0.1A · Network Offline:&lt;br/&gt;No internet connection; prompt retry." vertex="1">
          <mxGeometry height="50" width="240" x="20" y="315" as="geometry" />
        </mxCell>
        <mxCell id="step02_client_cb" parent="lane_01a_client" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=11;fontFamily=Arial;fontStyle=1;" value="02.A.1 · Capture GIS Callback&lt;br/&gt;Receive Google ID Token (RS256 JWT).&lt;br/&gt;Forward token &amp;amp; nonce to backend." vertex="1">
          <mxGeometry height="70" width="250" x="15" y="400" as="geometry" />
        </mxCell>

        <!-- Nodes in 01A: Google Identity Services -->
        <mxCell id="step02_google" parent="lane_01a_google" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="02.A · Authenticate Google Account&lt;br/&gt;User authenticates via Google modal.&lt;br/&gt;Google signs ID Token (RS256 JWT):&lt;br/&gt;sub, email, name, picture, nonce." vertex="1">
          <mxGeometry height="80" width="210" x="15" y="240" as="geometry" />
        </mxCell>

        <!-- Nodes in 01A: Backend ASP.NET Core -->
        <mxCell id="step03_server" parent="lane_01a_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="03.A · Validate Google ID Token&lt;br/&gt;Validate RS256 via Google JWKS keys.&lt;br/&gt;Verify: iss, aud, exp, and match nonce&lt;br/&gt;against registered session challenge." vertex="1">
          <mxGeometry height="75" width="280" x="35" y="398" as="geometry" />
        </mxCell>
        <mxCell id="dec_jwks" parent="lane_01a_server" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Token &amp;amp; Nonce&lt;br/&gt;Valid?" vertex="1">
          <mxGeometry height="65" width="180" x="85" y="505" as="geometry" />
        </mxCell>
        <mxCell id="e03" parent="lane_01a_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E0.3 · Invalid Token / Expired (HTTP 401):&lt;br/&gt;Signature mismatch or expired nonce." vertex="1">
          <mxGeometry height="45" width="280" x="35" y="595" as="geometry" />
        </mxCell>
        <mxCell id="step03_query" parent="lane_01a_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="03.A.1 · Find Account Linked to Sub&lt;br/&gt;Query account with AuthProvider='GOOGLE'&lt;br/&gt;and ProviderKey = Google subject ID." vertex="1">
          <mxGeometry height="65" width="280" x="35" y="660" as="geometry" />
        </mxCell>
        <mxCell id="dec_user_exists" parent="lane_01a_server" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Linked Account&lt;br/&gt;Found?" vertex="1">
          <mxGeometry height="65" width="180" x="85" y="750" as="geometry" />
        </mxCell>
        <mxCell id="step04_jit" parent="lane_01a_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="04.A · JIT Auto-Provisioning&lt;br/&gt;Atomic SQL transaction:&lt;br/&gt;Create Person &amp;amp; User with default OWNER role.&lt;br/&gt;(Beneficiary role assigned later by Plan)." vertex="1">
          <mxGeometry height="75" width="280" x="35" y="845" as="geometry" />
        </mxCell>
        <mxCell id="dec_transaction" parent="lane_01a_server" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Account Record&lt;br/&gt;Committed?" vertex="1">
          <mxGeometry height="65" width="180" x="85" y="945" as="geometry" />
        </mxCell>
        <!-- Two failure branches for 01A commit: sub race vs DB error -->
        <mxCell id="e04_race" parent="lane_01a_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=10;fontFamily=Arial;" value="E0.4A · Sub Race Condition:&lt;br/&gt;Duplicate Google sub detected;&lt;br/&gt;Reload existing account." vertex="1">
          <mxGeometry height="50" width="160" x="15" y="1025" as="geometry" />
        </mxCell>
        <mxCell id="e04_db_err" parent="lane_01a_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=10;fontFamily=Arial;" value="E0.4A · Database Error:&lt;br/&gt;SQL transaction error (HTTP 500);&lt;br/&gt;Rollback &amp;amp; alert retry." vertex="1">
          <mxGeometry height="50" width="160" x="180" y="1025" as="geometry" />
        </mxCell>

        <!-- Nodes in 01A: Database -->
        <mxCell id="step03_db" parent="lane_01a_db" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="03.A.2 · Query Database by Sub&lt;br/&gt;SELECT u.*, p.FullName FROM [Users] u&lt;br/&gt;JOIN [Persons] p ON u.PersonId = p.PersonId&lt;br/&gt;WHERE u.ProviderKey = @sub" vertex="1">
          <mxGeometry height="65" width="280" x="20" y="660" as="geometry" />
        </mxCell>
        <mxCell id="step04_sql" parent="lane_01a_db" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="04.A.1 · Commit ACID Transaction&lt;br/&gt;BEGIN TRANSACTION;&lt;br/&gt;INSERT INTO [Persons] (FullName, Email);&lt;br/&gt;INSERT INTO [Users] (ProviderKey=sub, Role='OWNER');&lt;br/&gt;COMMIT TRANSACTION;" vertex="1">
          <mxGeometry height="75" width="280" x="20" y="845" as="geometry" />
        </mxCell>

        <!-- 01A Success Exit Connector (64px bottom padding inside lane) -->
        <mxCell id="conn_01a_success" parent="lane_01a_server" style="ellipse;aspect=fixed;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=11;fontFamily=Arial;fontStyle=1;align=center;verticalAlign=middle;" value="01A&lt;br/&gt;OK" vertex="1">
          <mxGeometry height="42" width="42" x="154" y="1115" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- KHỐI BÊN PHẢI: 01B · EMAIL / PASSWORD -->
        <!-- ========================================== -->
        <mxCell id="container_01b" parent="1" style="swimlane;horizontal=1;startSize=34;rounded=1;arcSize=4;whiteSpace=wrap;html=1;fillColor=#F0FDFA;swimlaneFillColor=#FFFFFF;strokeColor=#0D9488;strokeWidth=2;fontColor=#0F766E;fontSize=13;fontStyle=1;align=center;collapsible=0;" value="KHỐI CON 01B · EMAIL / PASSWORD AUTHENTICATION (SEC-02 HASHING &amp;amp; REGISTRATION)" vertex="1">
          <mxGeometry height="1250" width="1090" x="1460" y="350" as="geometry" />
        </mxCell>

        <!-- 01B Lanes (4 Lanes, Height: 1216, start at y=34) -->
        <mxCell id="lane_01b_user" parent="container_01b" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="USER / VISITOR" vertex="1">
          <mxGeometry height="1216" width="190" x="0" y="34" as="geometry" />
        </mxCell>
        <mxCell id="lane_01b_client" parent="container_01b" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="CLIENT · REACT WEB APP" vertex="1">
          <mxGeometry height="1216" width="280" x="190" y="34" as="geometry" />
        </mxCell>
        <mxCell id="lane_01b_server" parent="container_01b" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="BACKEND · ASP.NET CORE 8" vertex="1">
          <mxGeometry height="1216" width="330" x="470" y="34" as="geometry" />
        </mxCell>
        <mxCell id="lane_01b_db" parent="container_01b" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="DATABASE · SQL SERVER 2022" vertex="1">
          <mxGeometry height="1216" width="290" x="800" y="34" as="geometry" />
        </mxCell>

        <!-- Nodes in 01B: Client (Step 01.B.1: Render Form UI) -->
        <mxCell id="step01b_client_render" parent="lane_01b_client" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="01.B.1 · Render Form UI&lt;br/&gt;Mount Email &amp;amp; Password inputs.&lt;br/&gt;Display [Sign In] and [Register] tabs." vertex="1">
          <mxGeometry height="70" width="240" x="20" y="50" as="geometry" />
        </mxCell>

        <!-- Nodes in 01B: User (Step 01.B.0) - Receives from Client Render! -->
        <mxCell id="step01b_user" parent="lane_01b_user" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=11;fontFamily=Arial;fontStyle=1;" value="01.B.0 · Enter Credentials&lt;br/&gt;Input Email &amp;amp; Password.&lt;br/&gt;Select Sign In or Register." vertex="1">
          <mxGeometry height="70" width="165" x="12" y="50" as="geometry" />
        </mxCell>

        <!-- Nodes in 01B: Client (Step 01.B.1b: Client Validation & Mode Dec) -->
        <mxCell id="step01b_client_validate" parent="lane_01b_client" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="01.B.1b · Client Validation&lt;br/&gt;Verify RFC 5322 Email regex,&lt;br/&gt;Password length &amp;gt;= 6 characters." vertex="1">
          <mxGeometry height="65" width="240" x="20" y="150" as="geometry" />
        </mxCell>
        <mxCell id="dec_form_mode" parent="lane_01b_client" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Action&lt;br/&gt;Mode?" vertex="1">
          <mxGeometry height="65" width="160" x="60" y="240" as="geometry" />
        </mxCell>
        <mxCell id="step01b_client_login" parent="lane_01b_client" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=11;fontFamily=Arial;fontStyle=1;" value="01.B.2 · Submit Login Form&lt;br/&gt;POST /api/v1/auth/password-login&lt;br/&gt;Transmit credentials over TLS 1.3" vertex="1">
          <mxGeometry height="60" width="240" x="20" y="330" as="geometry" />
        </mxCell>
        <mxCell id="step01b_client_reg" parent="lane_01b_client" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=11;fontFamily=Arial;fontStyle=1;" value="01.B.3 · Submit Registration&lt;br/&gt;POST /api/v1/auth/register&lt;br/&gt;Transmit new account payload" vertex="1">
          <mxGeometry height="60" width="240" x="20" y="600" as="geometry" />
        </mxCell>

        <!-- Nodes in 01B: Backend ASP.NET Core (Login Branch) -->
        <mxCell id="step02b_login" parent="lane_01b_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="02.B.1 · Backend Validation &amp;amp; Hash Check&lt;br/&gt;Sanitize input; fetch record by Email.&lt;br/&gt;Verify hash via PasswordHasher (PBKDF2/Argon2)&lt;br/&gt;using stored 128-bit PasswordSalt." vertex="1">
          <mxGeometry height="75" width="280" x="25" y="325" as="geometry" />
        </mxCell>
        <mxCell id="dec_pwd_valid" parent="lane_01b_server" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Credentials&lt;br/&gt;Valid?" vertex="1">
          <mxGeometry height="65" width="170" x="80" y="435" as="geometry" />
        </mxCell>
        <mxCell id="e01b" parent="lane_01b_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E0.1B · Invalid Credentials (HTTP 401):&lt;br/&gt;Wrong email or password.&lt;br/&gt;Increment failed count (Lockout guard)." vertex="1">
          <mxGeometry height="50" width="280" x="25" y="525" as="geometry" />
        </mxCell>

        <!-- Nodes in 01B: Backend ASP.NET Core (Register Branch) -->
        <mxCell id="step02b_reg" parent="lane_01b_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="02.B.2 · Backend Sanitize &amp;amp; Email Check&lt;br/&gt;Validate inputs; check Email uniqueness&lt;br/&gt;in [Users] table before creation." vertex="1">
          <mxGeometry height="65" width="280" x="25" y="600" as="geometry" />
        </mxCell>
        <mxCell id="dec_email_exists" parent="lane_01b_server" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Email Already&lt;br/&gt;Exists?" vertex="1">
          <mxGeometry height="65" width="170" x="80" y="695" as="geometry" />
        </mxCell>
        <mxCell id="e02b" parent="lane_01b_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E0.2B · Duplicate Email (HTTP 409):&lt;br/&gt;Email already registered.&lt;br/&gt;Prompt user to Sign In instead." vertex="1">
          <mxGeometry height="45" width="280" x="25" y="785" as="geometry" />
        </mxCell>
        <mxCell id="step04b_reg" parent="lane_01b_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="04.B · Provision New Account&lt;br/&gt;Generate 128-bit Salt; hash password.&lt;br/&gt;Create Person &amp;amp; User records (ACID).&lt;br/&gt;Assign default OWNER role (SEC-02)." vertex="1">
          <mxGeometry height="75" width="280" x="25" y="855" as="geometry" />
        </mxCell>
        <mxCell id="dec_reg_commit" parent="lane_01b_server" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Account Record&lt;br/&gt;Committed?" vertex="1">
          <mxGeometry height="65" width="170" x="80" y="950" as="geometry" />
        </mxCell>
        <!-- Two failure branches for 01B commit: race vs DB error -->
        <mxCell id="e03b_race" parent="lane_01b_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=10;fontFamily=Arial;" value="E0.3B · Email Race Condition:&lt;br/&gt;Concurrent registration detected;&lt;br/&gt;Prompt user to Sign In." vertex="1">
          <mxGeometry height="50" width="150" x="15" y="1025" as="geometry" />
        </mxCell>
        <mxCell id="e03b_dberr" parent="lane_01b_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=10;fontFamily=Arial;" value="E0.4B · Database Error:&lt;br/&gt;Transaction rollback (HTTP 500);&lt;br/&gt;Display system error." vertex="1">
          <mxGeometry height="50" width="150" x="170" y="1025" as="geometry" />
        </mxCell>

        <!-- Nodes in 01B: Database -->
        <mxCell id="step02b_db_query" parent="lane_01b_db" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="02.B.3 · Query User by Email&lt;br/&gt;SELECT UserId, PasswordHash, Salt,&lt;br/&gt;IsActive, IsLocked FROM [Users]&lt;br/&gt;WHERE Email = @Email" vertex="1">
          <mxGeometry height="75" width="250" x="20" y="325" as="geometry" />
        </mxCell>
        <mxCell id="step02b_db_exists" parent="lane_01b_db" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="02.B.4 · Check Existing Email&lt;br/&gt;SELECT COUNT(1) FROM [Users]&lt;br/&gt;WHERE Email = @Email" vertex="1">
          <mxGeometry height="65" width="250" x="20" y="600" as="geometry" />
        </mxCell>
        <mxCell id="step04b_db_insert" parent="lane_01b_db" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="04.B.1 · Commit New Entities&lt;br/&gt;INSERT INTO [Persons] (FullName, Email)&lt;br/&gt;INSERT INTO [Users] (Hash, Salt, Role='OWNER')&lt;br/&gt;Commit ACID transaction." vertex="1">
          <mxGeometry height="75" width="250" x="20" y="855" as="geometry" />
        </mxCell>

        <!-- 01B Success Exit Connector (64px bottom padding inside lane) -->
        <mxCell id="conn_01b_success" parent="lane_01b_server" style="ellipse;aspect=fixed;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=11;fontFamily=Arial;fontStyle=1;align=center;verticalAlign=middle;" value="01B&lt;br/&gt;OK" vertex="1">
          <mxGeometry height="42" width="42" x="144" y="1115" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- PHẦN DƯỚI: XỬ LÝ CHUNG — KIỂM TRA TRẠNG THÁI & CẤP TOKEN -->
        <!-- ========================================== -->
        <mxCell id="container_common" parent="1" style="swimlane;horizontal=1;startSize=34;rounded=1;arcSize=4;whiteSpace=wrap;html=1;fillColor=#EEF2FF;swimlaneFillColor=#FFFFFF;strokeColor=#4F46E5;strokeWidth=2;fontColor=#4338CA;fontSize=13;fontStyle=1;align=center;collapsible=0;" value="PHẦN DƯỚI · XỬ LÝ CHUNG — KIỂM TRA TRẠNG THÁI TÀI KHOẢN, CẤP TOKEN VÀ THIẾT LẬP PHIÊN (COMMON SESSION ESTABLISHMENT)" vertex="1">
          <mxGeometry height="460" width="2500" x="50" y="1620" as="geometry" />
        </mxCell>

        <!-- Common Lanes (4 Lanes, Height: 426, start at y=34) -->
        <mxCell id="lane_c_user" parent="container_common" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="USER / VISITOR" vertex="1">
          <mxGeometry height="426" width="380" x="0" y="34" as="geometry" />
        </mxCell>
        <mxCell id="lane_c_client" parent="container_common" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="CLIENT · REACT WEB APP" vertex="1">
          <mxGeometry height="426" width="540" x="380" y="34" as="geometry" />
        </mxCell>
        <mxCell id="lane_c_server" parent="container_common" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="BACKEND · ASP.NET CORE 8" vertex="1">
          <mxGeometry height="426" width="880" x="920" y="34" as="geometry" />
        </mxCell>
        <mxCell id="lane_c_db" parent="container_common" style="swimlane;horizontal=1;startSize=32;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=11;fontStyle=1;align=center;verticalAlign=middle;" value="DATABASE · SQL SERVER 2022" vertex="1">
          <mxGeometry height="426" width="700" x="1800" y="34" as="geometry" />
        </mxCell>

        <!-- Nodes in Common: Backend (Merge Point, Status Check, Token Gen) -->
        <mxCell id="conn_merge" parent="lane_c_server" style="ellipse;aspect=fixed;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=13;fontFamily=Arial;fontStyle=1;align=center;verticalAlign=middle;" value="A" vertex="1">
          <mxGeometry height="40" width="40" x="420" y="45" as="geometry" />
        </mxCell>

        <mxCell id="dec_status" parent="lane_c_server" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Account Active &amp;amp;&lt;br/&gt;Not Locked?" vertex="1">
          <mxGeometry height="70" width="190" x="345" y="110" as="geometry" />
        </mxCell>

        <mxCell id="e05" parent="lane_c_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E0.5 · Account Inactive / Locked:&lt;br/&gt;HTTP 403 Forbidden.&lt;br/&gt;Account disabled or locked by Admin." vertex="1">
          <mxGeometry height="55" width="240" x="590" y="118" as="geometry" />
        </mxCell>

        <!-- Terminator for Denied Session -->
        <mxCell id="end_auth_denied" parent="lane_c_server" style="ellipse;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;fontStyle=1;" value="END · Authentication Denied&lt;br/&gt;Session aborted; contact support." vertex="1">
          <mxGeometry height="55" width="210" x="605" y="205" as="geometry" />
        </mxCell>

        <!-- Strict Sequential Token & Audit Flow: Step 05.1 -> Audit DB -> Step 05.3 Return -->
        <mxCell id="step05_jwt_create" parent="lane_c_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="05.1 · Generate Session Token&lt;br/&gt;Create HMAC-SHA256 JWT Access Token.&lt;br/&gt;Claims: sub, person_id, email, role." vertex="1">
          <mxGeometry height="70" width="250" x="260" y="205" as="geometry" />
        </mxCell>

        <mxCell id="step05_audit_db" parent="lane_c_db" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="05.2 · Append-Only Audit Trail&lt;br/&gt;INSERT INTO [dbo].[AuditEvents]&lt;br/&gt;(EventId, UserId, Action='AUTH_LOGIN_SUCCESS',&lt;br/&gt;IpAddress, Timestamp, Details)" vertex="1">
          <mxGeometry height="70" width="290" x="40" y="205" as="geometry" />
        </mxCell>

        <mxCell id="dec_audit_ok" parent="lane_c_server" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Audit Record&lt;br/&gt;Written?" vertex="1">
          <mxGeometry height="65" width="170" x="300" y="300" as="geometry" />
        </mxCell>

        <mxCell id="e05_audit_err" parent="lane_c_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=10;fontFamily=Arial;" value="E0.6 · Audit Trail Failure:&lt;br/&gt;Security policy violation;&lt;br/&gt;Abort token issuance." vertex="1">
          <mxGeometry height="55" width="180" x="510" y="305" as="geometry" />
        </mxCell>

        <mxCell id="step05_jwt_return" parent="lane_c_server" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;" value="05.3 · Transmit Session Response&lt;br/&gt;HTTP 200 OK: Return JWT Access Token&lt;br/&gt;and user persona to Client." vertex="1">
          <mxGeometry height="65" width="210" x="50" y="300" as="geometry" />
        </mxCell>

        <!-- Nodes in Common: Client (Step 06 RAM Storage) -->
        <mxCell id="step06_client" parent="lane_c_client" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=11;fontFamily=Arial;fontStyle=1;" value="06 · Store Token in RAM Context&lt;br/&gt;Hold JWT in React Context RAM memory.&lt;br/&gt;Avoid Web Storage to reduce exposure.&lt;br/&gt;Mount role-specific workspace." vertex="1">
          <mxGeometry height="75" width="280" x="130" y="295" as="geometry" />
        </mxCell>

        <!-- Nodes in Common: User (Dashboard Process -> Decision -> Flow 02 OR End) -->
        <mxCell id="step07_dashboard" parent="lane_c_user" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=11;fontFamily=Arial;fontStyle=1;" value="07 · Display Authorized Dashboard&lt;br/&gt;Mount workspace for authenticated role&lt;br/&gt;(Owner, Admin, Verifier, Executor, Beneficiary)" vertex="1">
          <mxGeometry height="70" width="260" x="60" y="200" as="geometry" />
        </mxCell>

        <mxCell id="dec_next_action" parent="lane_c_user" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Owner Initiates&lt;br/&gt;Estate Plan?" vertex="1">
          <mxGeometry height="65" width="170" x="105" y="295" as="geometry" />
        </mxCell>

        <!-- OFF-PAGE CONNECTOR: Pentagon (Purple) -> Proceeds to Flow 02 only if Owner chooses -->
        <mxCell id="offpage_flow02" parent="lane_c_user" style="shape=offPageConnector;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Proceed to&lt;br/&gt;FLOW 02 · Estate Plan" vertex="1">
          <mxGeometry height="55" width="150" x="30" y="380" as="geometry" />
        </mxCell>

        <!-- TERMINATOR: Oval (Green) -> For all active sessions -->
        <mxCell id="end_session" parent="lane_c_user" style="ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=11;fontFamily=Arial;fontStyle=1;" value="END · Active Session&lt;br/&gt;in Current Workspace" vertex="1">
          <mxGeometry height="55" width="160" x="200" y="380" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- CONNECTORS / EDGES -->
        <!-- ========================================== -->
        <!-- Top Section Edges -->
        <mxCell id="edge_start" edge="1" parent="1" source="start_node" target="step01_user_select" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <mxCell id="edge_user_method" edge="1" parent="1" source="step01_user_select" target="dec_auth_method" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Method -> 01A Client GIS Init (NOT user directly!) -->
        <mxCell id="edge_method_google" edge="1" parent="1" source="dec_auth_method" target="step01_client_google" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#0284C7;endArrow=block;endFill=1;" value="Google OIDC (01A)">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1550" y="315" />
              <mxPoint x="360" y="315" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Method -> 01B Client Render Form (NOT user directly!) -->
        <mxCell id="edge_method_form" edge="1" parent="1" source="dec_auth_method" target="step01b_client_render" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#0D9488;endArrow=block;endFill=1;" value="Email / Password (01B)">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1550" y="315" />
              <mxPoint x="1770" y="315" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- ========================================== -->
        <!-- EDGES INSIDE 01A (GOOGLE) -->
        <!-- ========================================== -->
        <!-- Client Init GIS -> User Click Button (Fixes issue 1.1) -->
        <mxCell id="edge_client_user_google" edge="1" parent="1" source="step01_client_google" target="step01a_user" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Render Button">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- User Click Button -> Client Check Popup / Network -->
        <mxCell id="edge_user_click_check" edge="1" parent="1" source="step01a_user" target="dec_popup" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_popup -> step02_google (Available) -->
        <mxCell id="edge_popup_ok" edge="1" parent="1" source="dec_popup" target="step02_google" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Online &amp; Unblocked">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_popup -> e01_popup (Popup Blocked) -->
        <mxCell id="edge_popup_blocked" edge="1" parent="1" source="dec_popup" target="e01_popup" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Popup Blocked">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_popup -> e01_offline (Offline) -->
        <mxCell id="edge_network_offline" edge="1" parent="1" source="dec_popup" target="e01_offline" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Network Offline">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="325" y="188" />
              <mxPoint x="325" y="340" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- e01_popup -> Prompt Form Login (Cross-link to 01B form) -->
        <mxCell id="loop_e01_form" edge="1" parent="1" source="e01_popup" target="step01b_client_render" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Choose Form">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="360" y="650" />
              <mxPoint x="1440" y="650" />
              <mxPoint x="1440" y="470" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- e01_offline -> Retry Network (Stays in 01A) -->
        <mxCell id="loop_e01_retry" edge="1" parent="1" source="e01_offline" target="step01_client_google" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Retry Connection">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="175" y="340" />
              <mxPoint x="175" y="118" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Google Identity -> Client callback (Google ID token) -->
        <mxCell id="edge_google_cb" edge="1" parent="1" source="step02_google" target="step02_client_cb" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="ID Token (RS256 JWT)">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Client callback -> Server (Sign-in request) -->
        <mxCell id="edge_cb_server" edge="1" parent="1" source="step02_client_cb" target="step03_server" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Sign-in request">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Server -> dec_jwks -->
        <mxCell id="edge_server_decjwks" edge="1" parent="1" source="step03_server" target="dec_jwks" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_jwks -> Server Query (Token & Nonce valid) -->
        <mxCell id="edge_jwks_ok" edge="1" parent="1" source="dec_jwks" target="step03_query" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Token &amp; Nonce valid">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_jwks -> e03 (Token validation failed) -->
        <mxCell id="edge_jwks_err" edge="1" parent="1" source="dec_jwks" target="e03" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Validation failed">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e03 -> Retry in 01A (outer edge) -->
        <mxCell id="loop_e03_retry" edge="1" parent="1" source="e03" target="step01_client_google" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Retry sign-in">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="740" y="618" />
              <mxPoint x="740" y="490" />
              <mxPoint x="460" y="490" />
              <mxPoint x="460" y="415" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Server Query -> DB Query -->
        <mxCell id="edge_query_db" edge="1" parent="1" source="step03_query" target="step03_db" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- DB Query -> dec_user_exists -->
        <mxCell id="edge_db_decexists" edge="1" parent="1" source="step03_db" target="dec_user_exists" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1250" y="782" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_user_exists -> conn_01a_success (Linked account found, routes cleanly via right channel) -->
        <mxCell id="edge_exists_yes" edge="1" parent="1" source="dec_user_exists" target="conn_01a_success" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#16A34A;endArrow=block;endFill=1;" value="Linked account found">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1085" y="782" />
              <mxPoint x="1085" y="1440" />
              <mxPoint x="914" y="1440" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_user_exists -> JIT (No linked account) -->
        <mxCell id="edge_exists_no" edge="1" parent="1" source="dec_user_exists" target="step04_jit" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="No account (JIT)">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- JIT -> SQL commit -->
        <mxCell id="edge_jit_sql" edge="1" parent="1" source="step04_jit" target="step04_sql" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- SQL commit -> dec_transaction -->
        <mxCell id="edge_sql_dectx" edge="1" parent="1" source="step04_sql" target="dec_transaction" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1250" y="978" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_transaction -> conn_01a_success (Account created, straight down) -->
        <mxCell id="edge_tx_ok" edge="1" parent="1" source="dec_transaction" target="conn_01a_success" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#16A34A;endArrow=block;endFill=1;" value="Account created">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="850" y="1040" />
              <mxPoint x="850" y="1450" />
              <mxPoint x="914" y="1450" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_transaction -> e04_race (Duplicate Sub Conflict) -->
        <mxCell id="edge_tx_race" edge="1" parent="1" source="dec_transaction" target="e04_race" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Sub Conflict">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="810" y="978" />
              <mxPoint x="810" y="1414" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_transaction -> e04_db_err (Other Database Error) -->
        <mxCell id="edge_tx_dberr" edge="1" parent="1" source="dec_transaction" target="e04_db_err" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Database Error">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="965" y="978" />
              <mxPoint x="965" y="1414" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- e04_race -> Reload account query (Fixes issue 1.3) -->
        <mxCell id="loop_e04_query" edge="1" parent="1" source="e04_race" target="step03_query" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Reload account">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="750" y="1414" />
              <mxPoint x="750" y="1044" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- ========================================== -->
        <!-- EDGES INSIDE 01B (EMAIL / PASSWORD) -->
        <!-- ========================================== -->
        <!-- Client Render Form -> User Enter Credentials (Fixes issue 1.1) -->
        <mxCell id="edge_client_user_form" edge="1" parent="1" source="step01b_client_render" target="step01b_user" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Display Inputs">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- User Enter Credentials -> Client Validation -->
        <mxCell id="edge_user_client_val" edge="1" parent="1" source="step01b_user" target="step01b_client_validate" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Client Validation -> dec_form_mode -->
        <mxCell id="edge_val_dec_mode" edge="1" parent="1" source="step01b_client_validate" target="dec_form_mode" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_form_mode -> Login mode -->
        <mxCell id="edge_mode_login" edge="1" parent="1" source="dec_form_mode" target="step01b_client_login" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Sign In">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_form_mode -> Register mode -->
        <mxCell id="edge_mode_reg" edge="1" parent="1" source="dec_form_mode" target="step01b_client_reg" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Register">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1670" y="620" />
              <mxPoint x="1770" y="620" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Client Login Submit -> Backend Login Validate -->
        <mxCell id="edge_client_login_server" edge="1" parent="1" source="step01b_client_login" target="step02b_login" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Submit credentials">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Backend Login -> DB Query -->
        <mxCell id="edge_server_db_query" edge="1" parent="1" source="step02b_login" target="step02b_db_query" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- DB Query -> dec_pwd_valid -->
        <mxCell id="edge_db_pwd_valid" edge="1" parent="1" source="step02b_db_query" target="dec_pwd_valid" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="2385" y="818" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_pwd_valid -> conn_01b_success (Password Valid, clean route through inner right channel) -->
        <mxCell id="edge_pwd_ok" edge="1" parent="1" source="dec_pwd_valid" target="conn_01b_success" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#16A34A;endArrow=block;endFill=1;" value="Password valid">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="2248" y="818" />
              <mxPoint x="2248" y="1440" />
              <mxPoint x="2074" y="1440" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_pwd_valid -> e01b (Invalid Credentials) -->
        <mxCell id="edge_pwd_err" edge="1" parent="1" source="dec_pwd_valid" target="e01b" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Invalid credentials">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e01b -> Retry Form Input -->
        <mxCell id="loop_e01b_retry" edge="1" parent="1" source="e01b" target="step01b_client_render" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Retry login">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="2070" y="930" />
              <mxPoint x="1680" y="930" />
              <mxPoint x="1680" y="435" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Client Reg Submit -> Backend Reg Check -->
        <mxCell id="edge_client_reg_server" edge="1" parent="1" source="step01b_client_reg" target="step02b_reg" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Submit new account">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Backend Reg -> DB Check Exists -->
        <mxCell id="edge_server_db_exists" edge="1" parent="1" source="step02b_reg" target="step02b_db_exists" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- DB Check -> dec_email_exists -->
        <mxCell id="edge_db_email_exists" edge="1" parent="1" source="step02b_db_exists" target="dec_email_exists" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="2385" y="1078" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_email_exists -> e02b (Email exists) -->
        <mxCell id="edge_email_exists_yes" edge="1" parent="1" source="dec_email_exists" target="e02b" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Email exists">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e02b -> Redirect to Sign In -->
        <mxCell id="loop_e02b_login" edge="1" parent="1" source="e02b" target="step01b_client_login" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Prompt to Sign In">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1870" y="1190" />
              <mxPoint x="1870" y="745" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_email_exists -> step04b_reg (New email) -->
        <mxCell id="edge_email_exists_no" edge="1" parent="1" source="dec_email_exists" target="step04b_reg" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="New email">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- step04b_reg -> DB Insert -->
        <mxCell id="edge_reg_db_insert" edge="1" parent="1" source="step04b_reg" target="step04b_db_insert" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- DB Insert -> dec_reg_commit -->
        <mxCell id="edge_db_reg_commit" edge="1" parent="1" source="step04b_db_insert" target="dec_reg_commit" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="2385" y="1368" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_reg_commit -> conn_01b_success (Account Created) -->
        <mxCell id="edge_reg_commit_ok" edge="1" parent="1" source="dec_reg_commit" target="conn_01b_success" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#16A34A;endArrow=block;endFill=1;" value="Account created">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_reg_commit -> e03b_race (Email race condition, fixes issue 1.2) -->
        <mxCell id="edge_reg_commit_race" edge="1" parent="1" source="dec_reg_commit" target="e03b_race" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Race Conflict">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1950" y="1368" />
              <mxPoint x="1950" y="1414" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_reg_commit -> e03b_dberr (DB error, fixes issue 1.2) -->
        <mxCell id="edge_reg_commit_dberr" edge="1" parent="1" source="dec_reg_commit" target="e03b_dberr" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Database Error">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="2090" y="1368" />
              <mxPoint x="2090" y="1414" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- e03b_race -> Prompt to Sign In -->
        <mxCell id="loop_e03b_login" edge="1" parent="1" source="e03b_race" target="step01b_client_login" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Prompt Sign In">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1880" y="1414" />
              <mxPoint x="1880" y="745" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- ========================================== -->
        <!-- EDGES TO COMMON CONVERGENCE (PHẦN DƯỚI) -->
        <!-- ========================================== -->
        <!-- 01A Success -> Common Merge A (Clean gap routing through Y=1590) -->
        <mxCell id="edge_01a_to_merge" edge="1" parent="1" source="conn_01a_success" target="conn_merge" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#0284C7;endArrow=block;endFill=1;" value="01A Google Success">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="914" y="1590" />
              <mxPoint x="1390" y="1590" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- 01B Success -> Common Merge A (Clean gap routing through Y=1590) -->
        <mxCell id="edge_01b_to_merge" edge="1" parent="1" source="conn_01b_success" target="conn_merge" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=2;strokeColor=#0D9488;endArrow=block;endFill=1;" value="01B Email/Pwd Success">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="2074" y="1590" />
              <mxPoint x="1430" y="1590" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- ========================================== -->
        <!-- EDGES INSIDE COMMON SECTION -->
        <!-- ========================================== -->
        <!-- conn_merge -> dec_status -->
        <mxCell id="edge_merge_dec_status" edge="1" parent="1" source="conn_merge" target="dec_status" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_status -> e05 (Account Locked / Inactive) -->
        <mxCell id="edge_status_locked" edge="1" parent="1" source="dec_status" target="e05" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Locked / Inactive">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e05 -> Terminator end_auth_denied (Fixes issue 1.4) -->
        <mxCell id="edge_e05_denied" edge="1" parent="1" source="e05" target="end_auth_denied" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_status -> step05_jwt_create (Active & Allowed) -->
        <mxCell id="edge_status_active" edge="1" parent="1" source="dec_status" target="step05_jwt_create" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#16A34A;endArrow=block;endFill=1;" value="Active &amp; Allowed">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Strict Sequential Flow (Fixes issue 1.5): Token Generated -> Write Audit DB -->
        <mxCell id="edge_jwt_audit_db" edge="1" parent="1" source="step05_jwt_create" target="step05_audit_db" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Write Audit Trail">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Audit DB -> Audit Decision -->
        <mxCell id="edge_audit_dec" edge="1" parent="1" source="step05_audit_db" target="dec_audit_ok" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1985" y="347" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_audit_ok -> e05_audit_err (Audit Failed) -->
        <mxCell id="edge_audit_failed" edge="1" parent="1" source="dec_audit_ok" target="e05_audit_err" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Audit Failed">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e05_audit_err -> end_auth_denied -->
        <mxCell id="edge_audit_err_denied" edge="1" parent="1" source="e05_audit_err" target="end_auth_denied" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_audit_ok -> step05_jwt_return (Audit Success: release token to client) -->
        <mxCell id="edge_audit_success" edge="1" parent="1" source="dec_audit_ok" target="step05_jwt_return" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#16A34A;endArrow=block;endFill=1;" value="Audit Success">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- step05_jwt_return -> step06_client (Return Session Token) -->
        <mxCell id="edge_jwt_client" edge="1" parent="1" source="step05_jwt_return" target="step06_client" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="JWT Access Token">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- step06_client -> step07_dashboard (Fixes issue 1.6: Mount Dashboard process) -->
        <mxCell id="edge_client_dashboard" edge="1" parent="1" source="step06_client" target="step07_dashboard" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Mount UI">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="360" y="347" />
              <mxPoint x="360" y="248" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- step07_dashboard -> dec_next_action -->
        <mxCell id="edge_dashboard_dec" edge="1" parent="1" source="step07_dashboard" target="dec_next_action" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_next_action -> offpage_flow02 (Owner initiates Estate Plan, fixes issue 1.6) -->
        <mxCell id="edge_dec_flow02" edge="1" parent="1" source="dec_next_action" target="offpage_flow02" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#7C3AED;endArrow=block;endFill=1;" value="Owner Initiates Plan">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="140" y="392" />
              <mxPoint x="140" y="420" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_next_action -> end_session (Other roles / Default, fixes issue 1.6) -->
        <mxCell id="edge_dec_stay" edge="1" parent="1" source="dec_next_action" target="end_session" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#16A34A;endArrow=block;endFill=1;" value="Other Roles">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="240" y="392" />
              <mxPoint x="240" y="420" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- ========================================== -->
        <!-- CALLOUT CONTAINER & SPECIFICATIONS -->
        <!-- ========================================== -->
        <mxCell id="annot_container" parent="1" style="swimlane;startSize=28;rounded=1;arcSize=6;whiteSpace=wrap;html=1;fillColor=#F8FAF9;swimlaneFillColor=#F8FAF9;strokeColor=#1F5C51;strokeWidth=1.5;fontColor=#1F5C51;fontSize=12;fontStyle=1;align=left;spacingLeft=15;" value="TECHNICAL SPECIFICATION CALLOUT · AUTHENTICATION &amp; JIT PROVISIONING ARCHITECTURE" vertex="1">
          <mxGeometry height="150" width="2500" x="50" y="2110" as="geometry" />
        </mxCell>
        <mxCell id="callout_google" parent="annot_container" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#EBF3F0;strokeColor=#4E877B;strokeWidth=1.2;fontColor=#133D37;fontSize=11;align=left;spacingLeft=10;spacingRight=10;" value="&lt;b&gt;1. GOOGLE IDENTITY &amp;amp; CLAIMS (01A)&lt;/b&gt;&lt;br/&gt;• Standard Google Sign-in button renders via GIS SDK.&lt;br/&gt;• Client binds 256-bit challenge nonce; backend validates against session TTL.&lt;br/&gt;• Google issues RS256-signed JWT with immutable subject ID (sub).&lt;br/&gt;• First-time login JIT auto-provisions citizen record with base OWNER role.&lt;br/&gt;• Beneficiary privileges assigned dynamically via estate plan relations." vertex="1">
          <mxGeometry height="102" width="595" x="15" y="36" as="geometry" />
        </mxCell>
        <mxCell id="callout_form" parent="annot_container" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#F0FDFA;strokeColor=#0D9488;strokeWidth=1.2;fontColor=#0F766E;fontSize=11;align=left;spacingLeft=10;spacingRight=10;" value="&lt;b&gt;2. EMAIL / PASSWORD &amp;amp; SEC-02 HASHING (01B)&lt;/b&gt;&lt;br/&gt;• Form inputs sanitized &amp;amp; validated on both Client (RFC 5322) and Backend.&lt;br/&gt;• Passwords hashed with 128-bit cryptographic Salt using ASP.NET PasswordHasher.&lt;br/&gt;• Strictly separates login credentials from Master KEK and Shamir shares.&lt;br/&gt;• Registration enforces unique email constraint &amp;amp; atomic Person/User creation.&lt;br/&gt;• Rate limiting &amp;amp; lockout protection defend against brute-force attacks." vertex="1">
          <mxGeometry height="102" width="595" x="635" y="36" as="geometry" />
        </mxCell>
        <mxCell id="callout_validation" parent="annot_container" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#F1F4FA;strokeColor=#7188B5;strokeWidth=1.2;fontColor=#1A2D4E;fontSize=11;align=left;spacingLeft=10;spacingRight=10;" value="&lt;b&gt;3. SERVER-SIDE TOKEN VALIDATION &amp;amp; AUDIT&lt;/b&gt;&lt;br/&gt;• Backend validates RS256 signatures dynamically via Google JWKS endpoints.&lt;br/&gt;• Enforces active account verification (IsActive &amp;amp;&amp;amp; !IsLocked) prior to token grant.&lt;br/&gt;• Signs HMAC-SHA256 JWT Access Token with sub, person_id, email, and role.&lt;br/&gt;• Mandatory append-only audit trail: writes AUTH_LOGIN_SUCCESS before token release." vertex="1">
          <mxGeometry height="102" width="595" x="1255" y="36" as="geometry" />
        </mxCell>
        <mxCell id="callout_ram" parent="annot_container" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#FAF5EB;strokeColor=#B5955E;strokeWidth=1.2;fontColor=#4A3816;fontSize=11;align=left;spacingLeft=10;spacingRight=10;" value="&lt;b&gt;4. EPHEMERAL RAM TOKEN STORAGE &amp;amp; SESSIONS&lt;/b&gt;&lt;br/&gt;• Access Token held exclusively in React Context ephemeral RAM memory.&lt;br/&gt;• Not persisted in Web Storage (localStorage/sessionStorage) to limit exposure.&lt;br/&gt;• Note: Complete XSS mitigation requires strict CSP and input sanitization.&lt;br/&gt;• Authenticated session mounts role-specific dashboard with optional Flow 02 jump." vertex="1">
          <mxGeometry height="102" width="605" x="1875" y="36" as="geometry" />
        </mxCell>

        <!-- LEGEND -->
        <mxCell id="legend" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#FFF6E2;strokeColor=#D8BD83;fontColor=#5A492C;fontSize=12;fontFamily=Arial;" value="USES CONVENTIONAL FLOWCHART SYMBOLS: [Green Oval] = Start/Stop | [Yellow Rect] = Action/Process | [Cyan Parallelogram] = Input/Output | [Orange Rhombus] = Decision (Yes/No) | [Purple Circle] = On-page Connector (Merge) | [Purple Pentagon] = Off-page Connector (To Flow 02) | [Red Box/Oval] = Exception &amp; Denied" vertex="1">
          <mxGeometry height="55" width="2500" x="50" y="2280" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>"""

# Parse to verify well-formed
ET.fromstring(xml_content)
print("XML is strictly well-formed!")

with open("docs/04_business_flows/FLOW_01_SYSTEM_MERGED.xml", "w", encoding="utf-8") as f:
    f.write(xml_content)
print("Successfully updated FLOW_01_SYSTEM_MERGED.xml")
