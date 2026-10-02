# Rebuild FLOW_01_SYSTEM_MERGED.xml with exact ISO/ANSI flowchart standards from user's image:
# - Start/Stop: Oval (Green #D5E8D4, border #82B366)
# - Process: Rectangle (Yellow #FFF2CC, border #D6B656)
# - Input/Output: Parallelogram (Cyan/Blue #DAE8FC, border #6C8EBF)
# - Decision: Rhombus (Orange #FFE6CC, border #D79B00)
# - On-page Connector: Circle (Purple #E1D5E7, border #9673A6)
# - Off-page Connector: Pentagon (Purple #E1D5E7, border #9673A6)

import xml.etree.ElementTree as ET

xml_content = """<mxfile host="Electron" agent="LegacyVault Architecture Engine">
  <diagram id="flow01_iso_standard" name="Flow 01 - Sign-in and Account Registration">
    <mxGraphModel dx="2357" dy="1375" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1850" pageHeight="2650" math="0" shadow="0">
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />

        <!-- Title & Intro Banners -->
        <mxCell id="title" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#173F38;strokeColor=#173F38;fontColor=#FFFFFF;fontSize=15;fontFamily=Arial;fontStyle=1;" value="FLOW 01 · SIGN-IN AND ACCOUNT REGISTRATION (ISO/ANSI FLOWCHART STANDARD)" vertex="1">
          <mxGeometry height="60" width="1750" x="50" y="30" as="geometry" />
        </mxCell>
        <mxCell id="intro" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#E9F3EE;strokeColor=#C9DED2;fontColor=#225A4C;fontSize=13;fontFamily=Arial;" value="Swimlane flow for user authentication via Google Identity or Email/Password, account resolution, JIT provisioning, and session establishment. Strictly adheres to ANSI/ISO flowchart symbols (Start/Stop Oval, Process Rectangle, I/O Parallelogram, Decision Rhombus, and On/Off-page Connectors)." vertex="1">
          <mxGeometry height="60" width="1750" x="50" y="100" as="geometry" />
        </mxCell>

        <!-- 5 Dedicated Lanes (Height: 2000, Y: 180 -> 2180) -->
        <mxCell id="lane0" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="USER / VISITOR" vertex="1">
          <mxGeometry height="2000" width="220" x="50" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane1" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="CLIENT · REACT WEB APP" vertex="1">
          <mxGeometry height="2000" width="280" x="270" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane2" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="GOOGLE IDENTITY SERVICES" vertex="1">
          <mxGeometry height="2000" width="240" x="550" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane3" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="BACKEND · ASP.NET CORE 8" vertex="1">
          <mxGeometry height="2000" width="330" x="790" y="180" as="geometry" />
        </mxCell>
        <mxCell id="lane4" parent="1" style="swimlane;horizontal=1;startSize=54;rounded=0;collapsible=0;whiteSpace=wrap;html=1;fillColor=#F8FAFC;swimlaneFillColor=#FFFFFF;strokeColor=#CBD5E1;fontColor=#1E293B;fontSize=13;fontStyle=1;align=center;verticalAlign=middle;" value="DATABASE · SQL SERVER 2022" vertex="1">
          <mxGeometry height="2000" width="300" x="1120" y="180" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: USER / VISITOR (lane0) -->
        <!-- ========================================== -->
        <!-- START: Oval (Green) -->
        <mxCell id="start_node" parent="lane0" style="ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=12;fontFamily=Arial;fontStyle=1;" value="START&lt;br/&gt;User accesses LegacyVault&lt;br/&gt;via web browser" vertex="1">
          <mxGeometry height="75" width="190" x="15" y="70" as="geometry" />
        </mxCell>

        <!-- 01: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="step01_user" parent="lane0" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="01 · Select Authentication&lt;br/&gt;Choose Sign in with Google&lt;br/&gt;or Email / Password" vertex="1">
          <mxGeometry height="75" width="200" x="10" y="180" as="geometry" />
        </mxCell>

        <!-- END: Oval (Green) -->
        <mxCell id="end_node" parent="lane0" style="ellipse;whiteSpace=wrap;html=1;fillColor=#D5E8D4;strokeColor=#82B366;fontColor=#274E13;fontSize=12;fontFamily=Arial;fontStyle=1;" value="END: SESSION ESTABLISHED&lt;br/&gt;Session active in RAM.&lt;br/&gt;Display authorized dashboard&lt;br/&gt;(Owner, Admin, Verifier, Executor)" vertex="1">
          <mxGeometry height="85" width="195" x="12" y="1840" as="geometry" />
        </mxCell>

        <!-- OFF-PAGE CONNECTOR: Pentagon (Purple) -> Proceeds to Flow 02 -->
        <mxCell id="offpage_flow02" parent="lane0" style="shape=offPageConnector;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=11;fontFamily=Arial;fontStyle=1;" value="Proceed to&lt;br/&gt;FLOW 02&lt;br/&gt;(Estate Plan)" vertex="1">
          <mxGeometry height="65" width="120" x="50" y="1935" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: CLIENT (lane1) -->
        <!-- ========================================== -->
        <!-- Decision: Method? (Rhombus - Orange) -->
        <mxCell id="dec_method" parent="lane1" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Authentication&lt;br/&gt;Method?" vertex="1">
          <mxGeometry height="75" width="170" x="55" y="180" as="geometry" />
        </mxCell>

        <!-- 01.A: Process (Rectangle - Yellow) -->
        <mxCell id="step01_client_google" parent="lane1" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="01.A · Initialize Google GIS&lt;br/&gt;Generate 256-bit Nonce in RAM.&lt;br/&gt;Render Google Sign-in button." vertex="1">
          <mxGeometry height="75" width="240" x="20" y="290" as="geometry" />
        </mxCell>

        <!-- Decision: Popup Available? (Rhombus - Orange) -->
        <mxCell id="dec_popup" parent="lane1" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Popup &amp;amp; Network&lt;br/&gt;Available?" vertex="1">
          <mxGeometry height="75" width="170" x="55" y="400" as="geometry" />
        </mxCell>

        <!-- E0.1 Process (Rectangle - Red) -->
        <mxCell id="e01" parent="lane1" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E0.1 · Popup Blocked / Offline:&lt;br/&gt;Display error; suggest Form Login." vertex="1">
          <mxGeometry height="50" width="240" x="20" y="505" as="geometry" />
        </mxCell>

        <!-- 02.A.1: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="step02_client_cb" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="02.A.1 · Capture GIS Callback&lt;br/&gt;Receive Google ID Token (RS256).&lt;br/&gt;Submit sign-in request to backend." vertex="1">
          <mxGeometry height="75" width="250" x="15" y="670" as="geometry" />
        </mxCell>

        <!-- 01.B: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="step01_client_form" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="01.B · Email / Password Form&lt;br/&gt;Enter credentials for sign-in&lt;br/&gt;or new account registration." vertex="1">
          <mxGeometry height="75" width="250" x="15" y="800" as="geometry" />
        </mxCell>

        <!-- 06: Input / Output (Parallelogram - Cyan/Blue) -->
        <mxCell id="step06_client" parent="lane1" style="shape=parallelogram;perimeter=parallelogramPerimeter;fixedSize=1;whiteSpace=wrap;html=1;fillColor=#DAE8FC;strokeColor=#6C8EBF;fontColor=#1E40AF;fontSize=12;fontFamily=Arial;fontStyle=1;" value="06 · Store Token in RAM &amp;amp; Render UI&lt;br/&gt;Hold JWT in ephemeral RAM memory.&lt;br/&gt;Mount role-specific view &amp;amp; dashboard." vertex="1">
          <mxGeometry height="80" width="250" x="15" y="1720" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: GOOGLE IDENTITY SERVICES (lane2) -->
        <!-- ========================================== -->
        <!-- 02.A: Process (Rectangle - Yellow) -->
        <mxCell id="step02_google" parent="lane2" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="02.A · Authenticate Google Account&lt;br/&gt;User authenticates with Google.&lt;br/&gt;Google signs ID Token (RS256 JWT).&lt;br/&gt;Payload: sub, email, name, picture." vertex="1">
          <mxGeometry height="85" width="210" x="15" y="550" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: BACKEND ASP.NET CORE 8 (lane3) -->
        <!-- ========================================== -->
        <!-- 02.B: Process (Rectangle - Yellow) -->
        <mxCell id="step02_server_form" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="02.B · Validate Form Credentials&lt;br/&gt;Lookup user; verify password hash&lt;br/&gt;via ASP.NET Core PasswordHasher." vertex="1">
          <mxGeometry height="75" width="280" x="25" y="800" as="geometry" />
        </mxCell>

        <!-- Decision: Credentials Valid? (Rhombus - Orange) -->
        <mxCell id="dec_form_auth" parent="lane3" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Credentials&lt;br/&gt;Valid?" vertex="1">
          <mxGeometry height="75" width="180" x="75" y="905" as="geometry" />
        </mxCell>

        <!-- 03.A: Process (Rectangle - Yellow) -->
        <mxCell id="step03_server" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="03.A · Validate Google ID Token&lt;br/&gt;Validate RS256 signature via Google JWKS.&lt;br/&gt;Verify: iss, aud, exp, and nonce." vertex="1">
          <mxGeometry height="75" width="280" x="25" y="670" as="geometry" />
        </mxCell>

        <!-- Decision: Token Valid? (Rhombus - Orange) -->
        <mxCell id="dec_jwks" parent="lane3" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Token Validation&lt;br/&gt;Passed?" vertex="1">
          <mxGeometry height="75" width="180" x="75" y="1010" as="geometry" />
        </mxCell>

        <!-- E0.3 Process (Rectangle - Red) -->
        <mxCell id="e03" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E0.3 · Invalid Token / Signature Mismatch:&lt;br/&gt;Reject request with HTTP 401." vertex="1">
          <mxGeometry height="50" width="280" x="25" y="1105" as="geometry" />
        </mxCell>

        <!-- 03.A.1: Process (Rectangle - Yellow) -->
        <mxCell id="step03_query" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="03.A.1 · Find Account Linked to Sub&lt;br/&gt;Find account linked to Google subject&lt;br/&gt;and load person profile." vertex="1">
          <mxGeometry height="75" width="280" x="25" y="1175" as="geometry" />
        </mxCell>

        <!-- Decision: Linked Account Found? (Rhombus - Orange) -->
        <mxCell id="dec_user_exists" parent="lane3" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Linked Account&lt;br/&gt;Found?" vertex="1">
          <mxGeometry height="75" width="180" x="75" y="1275" as="geometry" />
        </mxCell>

        <!-- 04.A: Process (Rectangle - Yellow) -->
        <mxCell id="step04_jit" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="04.A · JIT Auto-Provisioning&lt;br/&gt;Atomic SQL transaction:&lt;br/&gt;Create Person profile &amp;amp; User account.&lt;br/&gt;Assign default Owner role." vertex="1">
          <mxGeometry height="80" width="280" x="25" y="1375" as="geometry" />
        </mxCell>

        <!-- Decision: Account Committed? (Rhombus - Orange) -->
        <mxCell id="dec_transaction" parent="lane3" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Account Record&lt;br/&gt;Committed?" vertex="1">
          <mxGeometry height="75" width="180" x="75" y="1480" as="geometry" />
        </mxCell>

        <!-- E0.4 Process (Rectangle - Red) -->
        <mxCell id="e04" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FEE2E2;strokeColor=#DC2626;fontColor=#991B1B;fontSize=11;fontFamily=Arial;" value="E0.4 · Conflict / Race Condition:&lt;br/&gt;Reload account for same Google subject." vertex="1">
          <mxGeometry height="50" width="280" x="25" y="1575" as="geometry" />
        </mxCell>

        <!-- ON-PAGE CONNECTOR: Circle (Purple) - Merges all authenticated paths before status check -->
        <mxCell id="conn_merge" parent="lane3" style="ellipse;aspect=fixed;whiteSpace=wrap;html=1;fillColor=#E1D5E7;strokeColor=#9673A6;fontColor=#581C87;fontSize=12;fontFamily=Arial;fontStyle=1;align=center;verticalAlign=middle;" value="A" vertex="1">
          <mxGeometry height="36" width="36" x="147" y="1635" as="geometry" />
        </mxCell>

        <!-- Decision: Account Active & Allowed? (Rhombus - Orange) -->
        <mxCell id="dec_status" parent="lane3" style="rhombus;whiteSpace=wrap;html=1;fillColor=#FFE6CC;strokeColor=#D79B00;fontColor=#9A3412;fontSize=12;fontFamily=Arial;fontStyle=1;" value="Account Active &amp;amp;&lt;br/&gt;Allowed?" vertex="1">
          <mxGeometry height="75" width="190" x="70" y="1695" as="geometry" />
        </mxCell>

        <!-- 05: Process (Rectangle - Yellow) -->
        <mxCell id="step05_jwt" parent="lane3" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="05 · Issue Access Token &amp;amp; Record Audit&lt;br/&gt;Sign HMAC-SHA256 Access Token.&lt;br/&gt;Record audit: AUTH_LOGIN_SUCCESS.&lt;br/&gt;(PersonId, UserId, ClientIp)." vertex="1">
          <mxGeometry height="80" width="280" x="25" y="1795" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- NODES: DATABASE SQL SERVER 2022 (lane4) -->
        <!-- ========================================== -->
        <!-- 03.A.2: Process (Rectangle - Yellow) -->
        <mxCell id="step03_db" parent="lane4" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="03.A.2 · Query Database by Sub&lt;br/&gt;SELECT u.*, p.FullName FROM [Users] u&lt;br/&gt;JOIN [Persons] p ON u.PersonId = p.PersonId&lt;br/&gt;WHERE u.ProviderKey = @sub" vertex="1">
          <mxGeometry height="75" width="260" x="20" y="1175" as="geometry" />
        </mxCell>

        <!-- 04.A.1: Process (Rectangle - Yellow) -->
        <mxCell id="step04_sql" parent="lane4" style="rounded=0;whiteSpace=wrap;html=1;fillColor=#FFF2CC;strokeColor=#D6B656;fontColor=#78350F;fontSize=12;fontFamily=Arial;" value="04.A.1 · Commit ACID Transaction&lt;br/&gt;INSERT INTO [Persons] (FullName, Email)&lt;br/&gt;INSERT INTO [Users] (ProviderKey=sub)&lt;br/&gt;Commit ACID transaction." vertex="1">
          <mxGeometry height="80" width="260" x="20" y="1375" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- CONNECTORS / EDGES (parent = 1) -->
        <!-- ========================================== -->
        <!-- Start -> 01 -->
        <mxCell id="edge_start" edge="1" parent="1" source="start_node" target="step01_user" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- 01 User -> Method Decision -->
        <mxCell id="edge_user_method" edge="1" parent="1" source="step01_user" target="dec_method" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Method -> Google -->
        <mxCell id="edge_method_google" edge="1" parent="1" source="dec_method" target="step01_client_google" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Google OIDC">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Method -> Form -->
        <mxCell id="edge_method_form" edge="1" parent="1" source="dec_method" target="step01_client_form" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Email/Password">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="340" y="270" />
              <mxPoint x="340" y="800" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Google -> dec_popup -->
        <mxCell id="edge_google_popup" edge="1" parent="1" source="step01_client_google" target="dec_popup" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_popup -> Google Identity (Sign-in started) -->
        <mxCell id="edge_popup_ok" edge="1" parent="1" source="dec_popup" target="step02_google" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Sign-in started">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_popup -> e01 (Popup blocked / Network unavailable) -->
        <mxCell id="edge_popup_err" edge="1" parent="1" source="dec_popup" target="e01" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Popup blocked / Offline">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e01 -> Retry / Fallback -->
        <mxCell id="loop_e01_step01" edge="1" parent="1" source="e01" target="step01_client_form" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Fallback to Form">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Google Identity -> Client callback (Google ID token) -->
        <mxCell id="edge_google_cb" edge="1" parent="1" source="step02_google" target="step02_client_cb" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Google ID token">
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

        <!-- dec_jwks -> Server Query (Token validation passed) -->
        <mxCell id="edge_jwks_ok" edge="1" parent="1" source="dec_jwks" target="step03_query" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Token validation passed">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_jwks -> e03 (Token validation failed) -->
        <mxCell id="edge_jwks_err" edge="1" parent="1" source="dec_jwks" target="e03" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Token validation failed">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e03 -> Retry Sign-in -->
        <mxCell id="loop_e03_start" edge="1" parent="1" source="e03" target="step01_user" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Retry sign-in">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="800" y="1130" />
              <mxPoint x="800" y="240" />
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
              <mxPoint x="1250" y="1312" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_user_exists -> conn_merge (Linked account found) -->
        <mxCell id="edge_exists_yes" edge="1" parent="1" source="dec_user_exists" target="conn_merge" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Linked account found">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="840" y="1312" />
              <mxPoint x="840" y="1653" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_user_exists -> JIT (No linked account) -->
        <mxCell id="edge_exists_no" edge="1" parent="1" source="dec_user_exists" target="step04_jit" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="No linked account">
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
              <mxPoint x="1250" y="1517" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- dec_transaction -> conn_merge (Account created) -->
        <mxCell id="edge_tx_ok" edge="1" parent="1" source="dec_transaction" target="conn_merge" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Account created">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_transaction -> e04 (Conflict / Race) -->
        <mxCell id="edge_tx_err" edge="1" parent="1" source="dec_transaction" target="e04" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#DC2626;endArrow=block;endFill=1;dashed=1;dashPattern=5 3;" value="Conflict / Race">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- e04 -> Reload account for same Google subject -->
        <mxCell id="loop_e04_query" edge="1" parent="1" source="e04" target="step03_query" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#D97706;endArrow=block;endFill=1;dashed=1;dashPattern=6 3;" value="Reload account for the same Google subject">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="750" y="1600" />
              <mxPoint x="750" y="1212" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- Branch B: Form Client -> Server Form Validate -->
        <mxCell id="edge_clientform_serverform" edge="1" parent="1" source="step01_client_form" target="step02_server_form" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Submit credentials">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- Server Form Validate -> dec_form_auth -->
        <mxCell id="edge_serverform_dec" edge="1" parent="1" source="step02_server_form" target="dec_form_auth" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_form_auth -> conn_merge (Credentials valid) -->
        <mxCell id="edge_formauth_status" edge="1" parent="1" source="dec_form_auth" target="conn_merge" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Credentials valid">
          <mxGeometry relative="1" as="geometry">
            <Array as="points">
              <mxPoint x="1050" y="942" />
              <mxPoint x="1050" y="1653" />
            </Array>
          </mxGeometry>
        </mxCell>

        <!-- conn_merge -> dec_status -->
        <mxCell id="edge_merge_status" edge="1" parent="1" source="conn_merge" target="dec_status" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- dec_status -> step05_jwt (Account active & allowed) -->
        <mxCell id="edge_status_ok" edge="1" parent="1" source="dec_status" target="step05_jwt" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Active &amp; Allowed">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- step05_jwt -> step06_client (Session established) -->
        <mxCell id="edge_jwt_client" edge="1" parent="1" source="step05_jwt" target="step06_client" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;" value="Session established">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- step06_client -> end_node -->
        <mxCell id="edge_client_end" edge="1" parent="1" source="step06_client" target="end_node" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#4B5563;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- end_node -> offpage_flow02 -->
        <mxCell id="edge_end_offpage" edge="1" parent="1" source="end_node" target="offpage_flow02" style="edgeStyle=orthogonalEdgeStyle;rounded=1;strokeWidth=1.8;strokeColor=#7C3AED;endArrow=block;endFill=1;">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>

        <!-- ========================================== -->
        <!-- CALLOUT CONTAINER & LEGEND (Below lanes, y=2220) -->
        <!-- ========================================== -->
        <mxCell id="annot_container" parent="1" style="swimlane;startSize=28;rounded=1;arcSize=6;whiteSpace=wrap;html=1;fillColor=#F8FAF9;swimlaneFillColor=#F8FAF9;strokeColor=#1F5C51;strokeWidth=1.5;fontColor=#1F5C51;fontSize=12;fontStyle=1;align=left;spacingLeft=15;" value="TECHNICAL SPECIFICATION CALLOUT · AUTHENTICATION &amp; JIT PROVISIONING ARCHITECTURE" vertex="1">
          <mxGeometry height="145" width="1750" x="50" y="2220" as="geometry" />
        </mxCell>
        <mxCell id="callout_google" parent="annot_container" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#EBF3F0;strokeColor=#4E877B;strokeWidth=1.2;fontColor=#133D37;fontSize=11;align=left;spacingLeft=10;spacingRight=10;" value="&lt;b&gt;1. GOOGLE IDENTITY &amp;amp; CLAIMS&lt;/b&gt;&lt;br/&gt;• Google issues RS256-signed JWT ID token with immutable subject ID (sub).&lt;br/&gt;• sub is used as stable external provider key rather than email.&lt;br/&gt;• Claims include: sub, email, email_verified, name, picture." vertex="1">
          <mxGeometry height="98" width="410" x="15" y="36" as="geometry" />
        </mxCell>
        <mxCell id="callout_validation" parent="annot_container" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#EBF3F0;strokeColor=#4E877B;strokeWidth=1.2;fontColor=#133D37;fontSize=11;align=left;spacingLeft=10;spacingRight=10;" value="&lt;b&gt;2. SERVER-SIDE TOKEN VALIDATION&lt;/b&gt;&lt;br/&gt;• ASP.NET Core backend fetches Google JWKS public keys dynamically.&lt;br/&gt;• Validates RS256 signature, issuer (accounts.google.com), audience (ClientID).&lt;br/&gt;• Validates active expiration and matches cryptographic nonce from client." vertex="1">
          <mxGeometry height="98" width="420" x="440" y="36" as="geometry" />
        </mxCell>
        <mxCell id="callout_aspnet" parent="annot_container" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#F1F4FA;strokeColor=#7188B5;strokeWidth=1.2;fontColor=#1A2D4E;fontSize=11;align=left;spacingLeft=10;spacingRight=10;" value="&lt;b&gt;3. ASP.NET IDENTITY &amp;amp; PASSWORD SECURITY&lt;/b&gt;&lt;br/&gt;• Form passwords hashed via ASP.NET Core PasswordHasher (PBKDF2/Argon2).&lt;br/&gt;• Enforces account status verification (active/locked/disabled) before session.&lt;br/&gt;• Rate limiting and lockout protection applied to credential endpoints." vertex="1">
          <mxGeometry height="98" width="420" x="875" y="36" as="geometry" />
        </mxCell>
        <mxCell id="callout_ram" parent="annot_container" style="rounded=1;arcSize=10;whiteSpace=wrap;html=1;fillColor=#FAF5EB;strokeColor=#B5955E;strokeWidth=1.2;fontColor=#4A3816;fontSize=11;align=left;spacingLeft=10;spacingRight=10;" value="&lt;b&gt;4. EPHEMERAL RAM TOKEN STORAGE&lt;/b&gt;&lt;br/&gt;• Access Token held exclusively in browser React Context RAM (Hard Rule 1.3).&lt;br/&gt;• Never persisted in localStorage or sessionStorage (XSS immune).&lt;br/&gt;• Page reload initiates silent session restoration or prompts re-authentication." vertex="1">
          <mxGeometry height="98" width="420" x="1310" y="36" as="geometry" />
        </mxCell>

        <!-- LEGEND & ISO SHAPE GUIDE (Below callouts, y=2390) -->
        <mxCell id="legend" parent="1" style="rounded=1;arcSize=13;whiteSpace=wrap;html=1;align=center;verticalAlign=middle;strokeWidth=1.6;fillColor=#FFF6E2;strokeColor=#D8BD83;fontColor=#5A492C;fontSize=12;fontFamily=Arial;" value="ISO/ANSI STANDARD FLOWCHART GUIDE: [Green Oval] = Start/Stop | [Yellow Rect] = Action/Process | [Cyan Parallelogram] = Input/Output | [Orange Rhombus] = Decision (Yes/No) | [Purple Circle] = On-page Connector (Merge) | [Purple Pentagon] = Off-page Connector (To Flow 02)" vertex="1">
          <mxGeometry height="60" width="1750" x="50" y="2390" as="geometry" />
        </mxCell>

      </root>
    </mxGraphModel>
  </diagram>
</mxfile>
"""

ET.fromstring(xml_content)
print("FLOW 01 ISO Standard XML is valid!")

with open("docs/04_business_flows/FLOW_01_SYSTEM_MERGED.xml", "w", encoding="utf-8") as f:
    f.write(xml_content.strip())
print("Successfully wrote ISO/ANSI standard FLOW_01_SYSTEM_MERGED.xml!")
