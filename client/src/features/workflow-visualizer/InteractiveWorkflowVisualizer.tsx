/**
 * @file InteractiveWorkflowVisualizer.tsx
 * @description Trình mô phỏng trực quan hoạt hình quy trình End-to-End của LegacyVault bằng Framer Motion
 * Hỗ trợ Đa Luồng (Multi-Flow):
 *  - Luồng 01: Xác thực, Phân quyền Persona 1-Click & Tự tạo tài khoản (Google OIDC JIT / Form SQL)
 *  - Luồng 02: Thiết lập, Mã hóa phong bì AES-256-GCM & Kích hoạt kho di sản (Hiến chương 31 quy tắc)
 * Cơ sở dữ liệu: Chuẩn Microsoft SQL Server 2022 / T-SQL (Bảng Persons & Users)
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Shield,
  Key,
  Cloud,
  Mail,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Database,
  ExternalLink,
  Sparkles,
  UserCheck,
  LogIn,
  Users,
  Layers,
  Check
} from 'lucide-react';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { axiosClient } from '@/shared/api/axiosClient';

interface WorkflowStep {
  id: number;
  stepNum: string;
  title: string;
  subtitle: string;
  lane: 'owner' | 'client' | 'server' | 'external';
  laneLabel: string;
  icon: React.ReactNode;
  inboundData: {
    protocol: string;
    payload: string;
  };
  cryptoAction: {
    title: string;
    details: string[];
  };
  outboundData: {
    status: string;
    payload: string;
  };
  storage: {
    r2: string;
    db: string;
    client: string;
  };
  exception: {
    code: string;
    trigger: string;
    rollbackTo: string;
    action: string;
  };
  relatedTab?: string;
}

// 5 Vai diễn chuẩn mẫu phục vụ demo bảo vệ đồ án (ASSIGN-06)
export const DEMO_PERSONAS = [
  {
    role: 'OWNER',
    name: 'Nguyễn Văn Nam',
    title: 'Chủ Kho Di Sản (Owner)',
    email: 'nam.owner@legacyvault.vn',
    personId: '11111111-1111-1111-1111-111111111111',
    badgeVariant: 'gold' as const,
    icon: '🏛️',
    description: 'Chủ sở hữu kho nguồn, nạp tài sản số, chọn gói cước và gán người nhận.',
  },
  {
    role: 'EXECUTOR',
    name: 'Trần Thị Bình',
    title: 'Người Thực Thi (Executor)',
    email: 'binh.executor@legacyvault.vn',
    personId: '22222222-2222-2222-2222-222222222222',
    badgeVariant: 'forest' as const,
    icon: '⚖️',
    description: 'Luật sư thực thi độc lập (ASSIGN-06); nộp chứng tử và kích hoạt bàn giao.',
  },
  {
    role: 'VERIFIER',
    name: 'Lê Văn Cường',
    title: 'Công Chứng Viên (Verifier)',
    email: 'cuong.verifier@legacyvault.vn',
    personId: '33333333-3333-3333-3333-333333333333',
    badgeVariant: 'danger' as const,
    icon: '📜',
    description: 'Người thẩm định độc lập; phê duyệt chứng tử, không có quyền đọc tài sản rõ.',
  },
  {
    role: 'BENEFICIARY',
    name: 'Phạm Thị Duyên',
    title: 'Người Thụ Hưởng (Beneficiary)',
    email: 'duyen.beneficiary@legacyvault.vn',
    personId: '44444444-4444-4444-4444-444444444444',
    badgeVariant: 'gold' as const,
    icon: '🎁',
    description: 'Người nhận di sản; ký nhận kho 1:1 hoặc biểu quyết kho đồng sở hữu.',
  },
  {
    role: 'ADMIN',
    name: 'Admin Kỹ Thuật',
    title: 'Quản Trị Viên (Admin)',
    email: 'admin@legacyvault.vn',
    personId: '99999999-9999-9999-9999-999999999999',
    badgeVariant: 'neutral' as const,
    icon: '🛡️',
    description: 'Quản trị viên vận hành; xem audit log, tuyệt đối không có khóa giải mã.',
  },
];

// ==========================================
// LUỒNG 01: XÁC THỰC, PHÂN QUYỀN & ONBOARDING
// ==========================================
const FLOW_01_STEPS: WorkflowStep[] = [
  {
    id: 1,
    stepNum: '01',
    title: 'Khởi Tạo Đăng Nhập & Chọn Phương Thức',
    subtitle: 'Hỗ trợ Google OIDC, Form Email/Mật khẩu hoặc 1-Click Role Switcher',
    lane: 'owner',
    laneLabel: 'Người Dùng / Khách Thăm (User)',
    icon: <LogIn className="w-5 h-5 text-amber-600" />,
    inboundData: {
      protocol: 'Client UI Selection (Auth Strategy)',
      payload: `{\n  "selectedProvider": "GOOGLE_OIDC | FORM_PASSWORD | DEMO_ROLE_SWITCHER",\n  "clientNonce": "nonce_7f2b98a1c4",\n  "redirectUri": "http://localhost:5173/auth/callback"\n}`,
    },
    cryptoAction: {
      title: 'Khởi tạo luồng xác thực OpenID Connect & Form an toàn',
      details: [
        'Google OIDC: Khởi tạo Google Identity Services (GIS) với Client ID',
        'Sinh ngẫu nhiên chuỗi Cryptographic Nonce chống tấn công Replay (RFC 6749)',
        'Form thường: Chuẩn bị gửi thông tin đăng ký/đăng nhập qua kênh bảo mật TLS 1.3',
        'Demo Persona Switcher: Cho phép hội đồng thẩm định đổi vai trò 1-click tức thì',
      ],
    },
    outboundData: {
      status: 'Client Auth Initiated',
      payload: `{\n  "state": "READY_FOR_CREDENTIAL",\n  "nonceVerified": true,\n  "availableProviders": ["Google", "Credentials", "DemoRoles"]\n}`,
    },
    storage: {
      r2: 'Chưa có hoạt động lưu trữ',
      db: 'SQL Server 2022: Chưa ghi nhận (Đang ở tầng Client handshake)',
      client: 'Lưu oauth_nonce và auth_state tạm thời trong RAM',
    },
    exception: {
      code: 'E0.1 · Popup Blocked / Network Timeout',
      trigger: 'Trình duyệt chặn popup Google Identity hoặc mất kết nối mạng',
      rollbackTo: 'Bước 01 (Chọn lại phương thức đăng nhập)',
      action: 'Chuyển sang đăng nhập Form thường (Email/Mật khẩu) hoặc dùng Demo Switcher',
    },
    relatedTab: 'oidc',
  },
  {
    id: 2,
    stepNum: '02',
    title: 'Xác Thực Danh Tính & Ký Số Token',
    subtitle: 'Google Identity phát hành JWT RS256 hoặc Client băm mật khẩu với Salt',
    lane: 'external',
    laneLabel: 'Nhà Cung Cấp Danh Tính (Google GIS / Client Crypto)',
    icon: <Key className="w-5 h-5 text-emerald-600" />,
    inboundData: {
      protocol: 'Google GIS Callback / TLS Form Post',
      payload: `Header: {"alg": "RS256", "kid": "9f82...", "typ": "JWT"}\nPayload: {\n  "iss": "https://accounts.google.com",\n  "sub": "108273619283746192837",\n  "email": "duyen.beneficiary@gmail.com",\n  "email_verified": true,\n  "name": "Phạm Thị Duyên"\n}`,
    },
    cryptoAction: {
      title: 'Ký số JWT bằng khóa riêng RSA của Google & Băm mật khẩu SEC-02',
      details: [
        'Google cấp JWT ID Token được ký bằng thuật toán RS256 bất đối xứng',
        'Mật khẩu Form thường được băm với Salt ngẫu nhiên theo chuẩn SEC-02 (Tách biệt hoàn toàn với Master Key di sản)',
        'Payload chứa các thông tin danh tính gốc: Google Sub ID, Email đã xác minh, Họ tên',
      ],
    },
    outboundData: {
      status: 'Credential Signed & Emitted',
      payload: `{\n  "credentialType": "ID_TOKEN_JWT",\n  "tokenLength": 842,\n  "signatureAlgorithm": "RS256"\n}`,
    },
    storage: {
      r2: 'Không áp dụng cho phiên xác thực',
      db: 'SQL Server 2022: Chưa ghi nhận',
      client: 'Nhận credential string trong callback event',
    },
    exception: {
      code: 'E0.2 · Invalid Google ID Token',
      trigger: 'Token bị chỉnh sửa hoặc hết hạn (exp timestamp trong quá khứ)',
      rollbackTo: 'Bước 01 (Yêu cầu đăng nhập lại)',
      action: 'Bắt lỗi tại middleware xác thực, xóa session hỏng và cấp mã lỗi 401',
    },
    relatedTab: 'oidc',
  },
  {
    id: 3,
    stepNum: '03',
    title: 'Đối Soát Bảng SQL Server [Users] & [Persons]',
    subtitle: 'Máy chủ .NET 8 xác minh chữ ký Google JWKS và tra cứu CSDL quan hệ',
    lane: 'server',
    laneLabel: 'Máy Chủ (.NET 8 WebApi)',
    icon: <Database className="w-5 h-5 text-blue-700" />,
    inboundData: {
      protocol: 'POST /api/v1/auth/google-oidc',
      payload: `{\n  "idToken": "eyJhbGciOiJSUzI1NiIs...",\n  "clientId": "717961939025-32a9snln6rvn7pu3va9are8dhcabvmr7.apps.googleusercontent.com"\n}`,
    },
    cryptoAction: {
      title: 'Thẩm định tính toàn vẹn chữ ký số qua Google JWKS',
      details: [
        'Máy chủ tải bộ khóa công khai Google Public Keys (JWKS endpoint)',
        'Xác minh chữ ký số RS256 và thời hạn sống của token (Clock skew <= 5 phút)',
        'Thực thi truy vấn SQL Server 2022 để kiểm tra người dùng đã tồn tại hay chưa',
      ],
    },
    outboundData: {
      status: 'SQL Lookup Completed',
      payload: `T-SQL Query:\nSELECT u.UserId, u.PersonId, u.Email, u.Role, p.FullName\nFROM [dbo].[Users] u\nINNER JOIN [dbo].[Persons] p ON u.PersonId = p.PersonId\nWHERE u.Email = @Email AND u.IsDeleted = 0;\nResult: 0 rows found (User chưa từng tạo tài khoản)`,
    },
    storage: {
      r2: 'Không ghi nhận',
      db: 'SQL Server 2022: Đọc dữ liệu từ bảng [dbo].[Users] và [dbo].[Persons]',
      client: 'Chờ máy chủ phản hồi kết quả phiên',
    },
    exception: {
      code: 'E0.3 · Google Signature Mismatch',
      trigger: 'Chữ ký số không khớp với bộ khóa công khai của Google JWKS',
      rollbackTo: 'Bước 01 (Từ chối đăng nhập)',
      action: 'Báo lỗi ERR_INVALID_OIDC_SIGNATURE và ghi log kiểm toán bảo mật',
    },
    relatedTab: 'oidc',
  },
  {
    id: 4,
    stepNum: '04',
    title: 'Tự Động Tạo Tài Khoản (JIT Provisioning) Trong SQL Server',
    subtitle: 'Khởi tạo bản ghi liên kết [Persons] và [Users] theo giao dịch ACID',
    lane: 'server',
    laneLabel: 'Máy Chủ (.NET 8 Entity Framework Core 10)',
    icon: <Sparkles className="w-5 h-5 text-amber-500" />,
    inboundData: {
      protocol: 'Internal DB Transaction (SqlTransaction)',
      payload: `BEGIN TRANSACTION;\n-- 1. Thêm công dân vào bảng danh tính [Persons]\nINSERT INTO [dbo].[Persons] (PersonId, FullName, Email, CreatedAt)\nVALUES (NEWID(), N'Phạm Thị Duyên', 'duyen.beneficiary@gmail.com', GETUTCDATE());\n\n-- 2. Thêm tài khoản đăng nhập vào bảng [Users]\nINSERT INTO [dbo].[Users] (UserId, PersonId, Email, Role, AuthProvider, ProviderSubjectId, IsActive, CreatedAt)\nVALUES (NEWID(), @NewPersonId, 'duyen.beneficiary@gmail.com', 'BENEFICIARY', 'GOOGLE', '108273619283746192837', 1, GETUTCDATE());\nCOMMIT TRANSACTION;`,
    },
    cryptoAction: {
      title: 'Tự động cấp phát tài khoản Just-In-Time (JIT) bảo đảm toàn vẹn tham chiếu',
      details: [
        'Mô hình chuẩn hóa tách rời: PersonId đại diện cho con người thực tế, UserId đại diện cho phiên đăng nhập',
        'Tự động phân vai trò mặc định (BENEFICIARY / OWNER) dựa trên ngữ cảnh lời mời di sản',
        'Đảm bảo tuyệt đối không trùng lặp PersonId giữa các vai trò đối nghịch (ASSIGN-06)',
      ],
    },
    outboundData: {
      status: 'User & Person Provisioned',
      payload: `{\n  "personId": "44444444-4444-4444-4444-444444444444",\n  "userId": "user_89afbc12",\n  "isNewUser": true,\n  "role": "BENEFICIARY",\n  "databaseEngine": "Microsoft SQL Server 2022"\n}`,
    },
    storage: {
      r2: 'Không đổi',
      db: 'SQL Server 2022: Ghi nhận 2 bản ghi mới trong [dbo].[Persons] và [dbo].[Users]',
      client: 'Nhận tín hiệu hoàn tất onboarding',
    },
    exception: {
      code: 'E0.4 · Duplicate Email / Concurrent Registration',
      trigger: 'Hai yêu cầu tạo tài khoản cùng email xảy ra đồng thời',
      rollbackTo: 'Thực thi ROLLBACK TRANSACTION',
      action: 'Chỉ giữ bản ghi đầu tiên, yêu cầu thứ 2 chuyển sang trạng thái User hiện hữu',
    },
    relatedTab: 'oidc',
  },
  {
    id: 5,
    stepNum: '05',
    title: 'Phát Hành JWT Access Token & Nhúng Claims Phân Quyền',
    subtitle: 'Ký số JWT bằng HMAC-SHA256 bí mật tại Server với đầy đủ vai trò',
    lane: 'server',
    laneLabel: 'Máy Chủ (.NET 8 WebApi)',
    icon: <Shield className="w-5 h-5 text-emerald-700" />,
    inboundData: {
      protocol: 'Internal JWT Token Factory (.NET 8)',
      payload: `Claims nhúng vào JWT:\n{\n  "sub": "user_89afbc12",\n  "person_id": "44444444-4444-4444-4444-444444444444",\n  "email": "duyen.beneficiary@gmail.com",\n  "roles": ["BENEFICIARY"],\n  "threePersonRuleCompliant": true,\n  "iat": 1790615800,\n  "exp": 1790702200\n}`,
    },
    cryptoAction: {
      title: 'Ký phát hành phiên làm việc mật mã theo chuẩn Zero-Trust',
      details: [
        'Ký mã hóa Access Token bằng khóa bí mật máy chủ với thuật toán HS256',
        'Nhúng PersonId để phục vụ toàn bộ các kiểm tra phân quyền tài sản sau này',
        'Ghi nhật ký đăng nhập vào bảng [dbo].[AuditEvents] để phục vụ truy vết pháp lý AUDIT-01',
      ],
    },
    outboundData: {
      status: 'HTTP 200 Login OK',
      payload: `{\n  "success": true,\n  "authMethod": "GOOGLE_OIDC_JIT",\n  "accessToken": "jwt_oidc_44444444_a1b2c3...",\n  "persona": {\n    "role": "BENEFICIARY",\n    "name": "Phạm Thị Duyên",\n    "email": "duyen.beneficiary@gmail.com"\n  }\n}`,
    },
    storage: {
      r2: 'Không ghi nhận',
      db: "SQL Server 2022: INSERT INTO [dbo].[AuditEvents] (Action='AUTH_LOGIN_SUCCESS')",
      client: 'Lưu Access Token trong RAM (Memory Context), sẵn sàng gọi API',
    },
    exception: {
      code: 'E0.5 · Token Signing Key Error',
      trigger: 'Mất khóa bí mật JWT_SECRET trong cấu hình máy chủ',
      rollbackTo: 'Bước 03 (Máy chủ báo lỗi cấu hình nội bộ)',
      action: 'Trả về HTTP 500, cảnh báo quản trị viên hệ thống',
    },
    relatedTab: 'oidc',
  },
  {
    id: 6,
    stepNum: '06',
    title: 'Phân Vai & Tải Giao Diện Theo Đúng Quyền Hạn',
    subtitle: 'React 19 Context cập nhật Dashboard theo vai trò (Owner / Beneficiary / Executor / Verifier)',
    lane: 'client',
    laneLabel: 'Trình Duyệt Client (React 19 Frontend)',
    icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
    inboundData: {
      protocol: 'GET /api/v1/auth/me (Authorization: Bearer jwt...)',
      payload: `{\n  "activeRole": "BENEFICIARY",\n  "accessibleVaults": ["vault_b48f9021"],\n  "permissions": ["VIEW_RELEASED_ASSETS", "CONFIRM_RECEIPT", "VOTE_CO_OWNED_VAULT"]\n}`,
    },
    cryptoAction: {
      title: 'Thiết lập tường lửa phân quyền Client-Side RBAC',
      details: [
        'Khởi tạo AuthContext an toàn, tự động ẩn các tính năng không thuộc vai trò',
        'Người thụ hưởng (Beneficiary): Chỉ thấy tài sản được bàn giao, không thể sửa kế hoạch',
        'Người thực thi (Executor): Được giao diện nộp đơn chứng tử & giải mã',
        'Chủ tài sản (Owner): Toàn quyền thiết lập kế hoạch và gán người nhận',
      ],
    },
    outboundData: {
      status: 'App Loaded & Synchronized',
      payload: `{\n  "clientState": "AUTHENTICATED",\n  "dashboardLayout": "BENEFICIARY_VIEW",\n  "roleSwitcherReady": true\n}`,
    },
    storage: {
      r2: 'Không đổi',
      db: 'SQL Server 2022: Đồng bộ phiên làm việc',
      client: 'Cập nhật React State & kích hoạt quyền truy cập tương ứng',
    },
    exception: {
      code: 'E0.6 · Role Tampering Detected',
      trigger: 'Client cố tình sửa role trong bộ nhớ RAM trình duyệt',
      rollbackTo: 'Máy chủ tự động chặn với HTTP 403 Forbidden',
      action: 'Backend luôn thẩm định chữ ký JWT trên mỗi API, không tin cậy Client',
    },
    relatedTab: 'oidc',
  },
];

// ==========================================
// LUỒNG 02: THIẾT LẬP, MÃ HÓA & KÍCH HOẠT KHO
// ==========================================
const FLOW_02_STEPS: WorkflowStep[] = [
  {
    id: 1,
    stepNum: '01',
    title: 'Khởi Tạo Kế Hoạch & Niêm Phong Gói Cước',
    subtitle: 'Chủ tài sản chọn gói cước và hoàn tất thanh toán SePay QR',
    lane: 'owner',
    laneLabel: 'Chủ Tài Sản (Owner)',
    icon: <Shield className="w-5 h-5 text-amber-600" />,
    inboundData: {
      protocol: 'POST /api/v1/plans (Bearer JWT)',
      payload: `{\n  "ownerId": "11111111-1111-1111-1111-111111111111",\n  "tier": "STANDARD_ESTATE",\n  "priceVnd": 499000,\n  "maxAssets": 20\n}`,
    },
    cryptoAction: {
      title: 'Niêm phong đơn hàng thanh toán & sinh mã QR SePay',
      details: [
        'Tạo mã thanh toán duy nhất SePay với nội dung LV_ORDER_98AF',
        'Khai báo Master Config cho kho tài sản trong CSDL SQL Server 2022',
        'Kích hoạt trạng thái chờ xác nhận chuyển khoản ngân hàng',
      ],
    },
    outboundData: {
      status: 'HTTP 201 Created (Pending Payment)',
      payload: `{\n  "orderId": "ord_98afbd90",\n  "qrUrl": "https://qr.sepay.vn/img?acc=1028...&amount=499000&des=LV_ORDER_98AF",\n  "status": "WAITING_FOR_PAYMENT"\n}`,
    },
    storage: {
      r2: 'Chưa có hoạt động lưu trữ',
      db: 'SQL Server 2022: INSERT INTO [dbo].[PaymentOrders] (Status=\'PENDING\')',
      client: 'Hiển thị mã QR động để chủ tài sản quét mã thanh toán',
    },
    exception: {
      code: 'E1 · Payment Timeout (PAY-02)',
      trigger: 'Hết 15 phút chưa nhận được webhook giao dịch từ SePay',
      rollbackTo: 'Bước 01 (Hủy đơn hàng quá hạn)',
      action: 'Cập nhật đơn hàng thành EXPIRED, giải phóng tài nguyên kế hoạch',
    },
    relatedTab: 'sepay',
  },
  {
    id: 2,
    stepNum: '02',
    title: 'Tiền Xử Lý & Tính Checksum Tệp Tin Tại Client',
    subtitle: 'Kiểm tra tệp tin di chúc/khóa private <= 20MB tại trình duyệt',
    lane: 'client',
    laneLabel: 'Client (React 19 Sandbox)',
    icon: <FileCode className="w-5 h-5 text-emerald-600" />,
    inboundData: {
      protocol: 'In-Memory File Buffer (Web Crypto API)',
      payload: `File: "Will_and_Estate_Passphrases.pdf"\nMIME: application/pdf | Size: 1.48 MB (1,552,896 bytes)`,
    },
    cryptoAction: {
      title: 'Băm toàn vẹn SHA-256 trong bộ nhớ tạm',
      details: [
        'Đọc file qua FileReader API vào Uint8Array trong RAM tạm thời',
        'Tính toán dấu vân tay băm SHA-256 (32 bytes = 64 ký tự Hex)',
        'Kiểm tra kích thước tệp tin qua Zod Validator: <= 20 MB',
        'Tuyệt đối không lưu bản rõ vào LocalStorage hoặc IndexedDB',
      ],
    },
    outboundData: {
      status: 'Client SHA-256 Calculated',
      payload: `{\n  "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",\n  "validation": "PASS"\n}`,
    },
    storage: {
      r2: 'Chưa đẩy lên đám mây',
      db: 'SQL Server 2022: Chưa ghi CSDL (Dữ liệu đang được tiền xử lý tại Client)',
      client: 'Giữ Checksum trong React State, sẵn sàng gửi cùng payload',
    },
    exception: {
      code: 'E2 · Payload Too Large (> 20MB)',
      trigger: 'File tải lên vượt quá giới hạn 20MB cho phép',
      rollbackTo: 'Bước 02 (Hoàn trả giao diện thả tệp)',
      action: 'Zod Validator từ chối ngay lập tức, thông báo giảm dung lượng hoặc nén file',
    },
    relatedTab: 'envelope',
  },
  {
    id: 3,
    stepNum: '03',
    title: 'Mã Hóa Phong Bì AES-256-GCM',
    subtitle: 'Sinh khóa DEK ngẫu nhiên và mã hóa xác thực toàn vẹn',
    lane: 'server',
    laneLabel: 'Máy Chủ (.NET 8 Engine)',
    icon: <Shield className="w-5 h-5 text-emerald-700" />,
    inboundData: {
      protocol: 'POST /api/v1/storage/upload-envelope',
      payload: 'Multipart: [File Stream] + Header: [X-Client-Checksum-Sha256]',
    },
    cryptoAction: {
      title: 'Mã hóa đối xứng AES-256-GCM + Khóa bọc KEK',
      details: [
        'Sinh ngẫu nhiên khóa dữ liệu DEK 256-bit qua RandomNumberGenerator',
        'Mã hóa toàn bộ nội dung file bằng AES-GCM với Nonce 96-bit và Tag 128-bit',
        'DEK được bao bọc an toàn bằng Master KEK (hoặc phân mảnh Shamir)',
        'Bản rõ tệp tin bị hủy ngay lập tức khỏi RAM máy chủ sau khi mã hóa xong',
      ],
    },
    outboundData: {
      status: 'HTTP 200 Encrypted OK',
      payload: `{\n  "assetId": "ast_98afbd90",\n  "storageKey": "vaults/ast_98afbd90.enc",\n  "nonceBase64": "9xF1/2a...",\n  "tagBase64": "vB83c..."\n}`,
    },
    storage: {
      r2: 'Tạo luồng chuẩn bị đẩy file bản mã .enc',
      db: 'SQL Server 2022: Lưu Nonce, Auth Tag, Checksum SHA-256 vào bảng [dbo].[ContentVersions]',
      client: 'Nhận xác nhận mã hóa an toàn',
    },
    exception: {
      code: 'E3 · Cryptographic Failure',
      trigger: 'Khởi tạo bộ sinh số ngẫu nhiên thất bại hoặc lỗi bộ nhớ mã hóa',
      rollbackTo: 'Bước 02 (Yêu cầu tải lại file)',
      action: 'Rollback giao dịch, xóa bộ nhớ đệm, trả về mã lỗi 500 kèm alert',
    },
    relatedTab: 'envelope',
  },
  {
    id: 4,
    stepNum: '04',
    title: 'Lưu Trữ Bản Mã Vào Cloudflare R2',
    subtitle: 'Lưu blob .enc với chi phí Egress $0 và Zero-Knowledge',
    lane: 'external',
    laneLabel: 'Dịch Vụ Ngoại Vi (Cloudflare R2)',
    icon: <Cloud className="w-5 h-5 text-cyan-600" />,
    inboundData: {
      protocol: 'AWS S3 SDK: PutObjectCommand',
      payload: `Bucket: "legacyvault-prototype-private"\nKey: "vaults/ast_98afbd90.enc"\nContent: [AES-256-GCM Ciphertext Binary]`,
    },
    cryptoAction: {
      title: 'Lưu trữ đám mây chuẩn Zero-Knowledge',
      details: [
        'Đẩy duy nhất tệp bản mã .enc lên Cloudflare R2 Private Bucket',
        'Cloudflare R2 HOÀN TOÀN KHÔNG biết nội dung bản rõ và KHÔNG giữ bất kỳ khóa nào',
        'Chính sách zero egress fee đảm bảo không phát sinh chi phí khi bàn giao di sản sau này',
      ],
    },
    outboundData: {
      status: 'PutObject S3 200 OK',
      payload: `{\n  "eTag": "\\"9b105d4f7c4db35e0b0f60defb9fb3ab\\"",\n  "uploadedBytes": 1552912,\n  "status": "STORED"\n}`,
    },
    storage: {
      r2: 'LƯU TRỮ VĨNH VIỄN tệp mã hóa .enc',
      db: 'SQL Server 2022: Cập nhật StorageUri = "r2://legacyvault-prototype-private/vaults/..." trong [dbo].[ContentVersions]',
      client: 'Nhận xác nhận mã hóa và lưu trữ thành công',
    },
    exception: {
      code: 'E3.1 · Cloudflare R2 Put Error',
      trigger: 'Mất kết nối mạng S3 hoặc Access Key R2 hết hạn',
      rollbackTo: 'Bước 03 (Thử lại lệnh PutObject 3 lần)',
      action: 'Nếu thất bại sau 3 lần retry, đánh dấu tài sản FAILED_UPLOAD',
    },
    relatedTab: 'r2',
  },
  {
    id: 5,
    stepNum: '05',
    title: 'Gom Kho Tự Động Theo Người Thụ Hưởng (SETUP-05, AC-01)',
    subtitle: 'Áp dụng thuật toán gom nhóm tài sản theo tập người nhận duy nhất',
    lane: 'server',
    laneLabel: 'Máy Chủ (.NET 8 Rules Engine)',
    icon: <Layers className="w-5 h-5 text-emerald-600" />,
    inboundData: {
      protocol: 'POST /api/v1/plans/{id}/consolidate-vaults',
      payload: `{\n  "designations": [\n    {"assetId": "A", "recipients": ["P1"]},\n    {"assetId": "C", "recipients": ["P1"]},\n    {"assetId": "B", "recipients": ["P1", "P2"]}\n  ]\n}`,
    },
    cryptoAction: {
      title: 'Thuật toán tự gom kho theo tập người nhận duy nhất (SETUP-05, AC-01)',
      details: [
        'Hệ thống chuẩn hóa tập person_id (sắp xếp không xét thứ tự)',
        'Tài sản A và C cùng gán cho {P1} -> Tự động gom chung vào ĐÚNG MỘT kho bàn giao',
        'Tập {P1, P2} tạo một kho riêng với chế độ CO_OWNED (đồng sở hữu)',
        'Không cho phép hai kho hiệu lực có cùng tập người nhận',
      ],
    },
    outboundData: {
      status: 'Vaults Consolidated (AC-01 Validated)',
      payload: `{\n  "vaultCount": 2,\n  "vault1": {"mode": "SINGLE_RECIPIENT", "assets": ["A", "C"], "recipients": ["P1"]},\n  "vault2": {"mode": "CO_OWNED", "assets": ["B"], "recipients": ["P1", "P2"]}\n}`,
    },
    storage: {
      r2: 'Không đổi',
      db: 'SQL Server 2022: INSERT INTO [dbo].[HandoverVaults] và [dbo].[HandoverBundleItems]',
      client: 'Giao diện hiển thị các kho bàn giao đã được phân loại chuẩn xác',
    },
    exception: {
      code: 'E4 · Duplicate Recipient Group',
      trigger: 'Phát hiện hai kho bàn giao cùng trỏ về một tập người nhận',
      rollbackTo: 'Tự động sáp nhập danh sách tài sản vào kho duy nhất',
      action: 'Engine tự động gộp manifest, không tạo kho rác',
    },
    relatedTab: 'envelope',
  },
  {
    id: 6,
    stepNum: '06',
    title: 'Gán Người Thực Thi & Kiểm Tra 3 Người Độc Lập',
    subtitle: 'Đảm bảo Owner != Executor != Verifier theo chuẩn ASSIGN-06',
    lane: 'server',
    laneLabel: 'Máy Chủ (.NET 8 Engine)',
    icon: <Users className="w-5 h-5 text-indigo-600" />,
    inboundData: {
      protocol: 'POST /api/v1/plans/{id}/executors/invite',
      payload: `{\n  "executorEmail": "binh.executor@legacyvault.vn",\n  "verifierEmail": "cuong.verifier@legacyvault.vn"\n}`,
    },
    cryptoAction: {
      title: 'Kiểm soát xung đột lợi ích theo PersonId (ASSIGN-06)',
      details: [
        'Thẩm định Owner, Executor và Verifier là 3 PersonId hoàn toàn khác nhau',
        'Kiểm tra nghiêm ngặt: Executor và Verifier CẤM là Beneficiary trong cùng hồ sơ',
        'Khởi tạo mã mời bảo mật gửi qua MailKit SMTP',
      ],
    },
    outboundData: {
      status: 'HTTP 200 Assignment Recorded',
      payload: `{\n  "isThreePersonSeparated": true,\n  "executorAssigned": true,\n  "auditStatus": "COMPLIANT"\n}`,
    },
    storage: {
      r2: 'Không đổi',
      db: "SQL Server 2022: INSERT INTO [dbo].[ExecutorAssignments] (Status='INVITED')",
      client: 'Hiển thị huy hiệu "Đã phân công nhân sự hợp lệ"',
    },
    exception: {
      code: 'E4.1 · Conflict of Interest (ASSIGN-06)',
      trigger: 'Trùng PersonId giữa Người thực thi và Người thụ hưởng',
      rollbackTo: 'Bước 06 (Chọn người thực thi khác)',
      action: 'Chặn thao tác với mã lỗi ERR_EXECUTOR_IS_BENEFICIARY',
    },
    relatedTab: 'mailkit',
  },
  {
    id: 7,
    stepNum: '07',
    title: 'Gửi Lời Mời Xác Nhận Qua MailKit SMTP',
    subtitle: 'Phát email thông báo mã xác thực tới Người thực thi',
    lane: 'external',
    laneLabel: 'Dịch Vụ Ngoại Vi (MailKit SMTP)',
    icon: <Mail className="w-5 h-5 text-rose-500" />,
    inboundData: {
      protocol: 'SMTP TLS Port 587 (RFC 3207)',
      payload: `To: binh.executor@legacyvault.vn\nSubject: [LegacyVault] Lời mời làm Người thực thi di sản số`,
    },
    cryptoAction: {
      title: 'Bảo vệ đường truyền email xác thực',
      details: [
        'Sinh token kích hoạt ngẫu nhiên 256-bit an toàn mật mã',
        'Mã hóa đường truyền TLS 1.3 chống nghe lén thông tin',
        'Email KHÔNG chứa bất kỳ mật khẩu hay khóa giải mã tài sản nào',
      ],
    },
    outboundData: {
      status: 'SMTP 250 OK: Message Dispatched',
      payload: `{\n  "messageId": "msg_9f2bc481@legacyvault.vn",\n  "status": "DELIVERED"\n}`,
    },
    storage: {
      r2: 'Không đổi',
      db: 'SQL Server 2022: UPDATE [dbo].[ExecutorAssignments] SET InvitedAt = GETUTCDATE()',
      client: 'Hiển thị trạng thái "Đã gửi email mời"',
    },
    exception: {
      code: 'E5 · SMTP Relay Error',
      trigger: 'Mất kết nối máy chủ MailKit hoặc sai thông tin xác thực',
      rollbackTo: 'Bước 07 (Thử lại gửi email)',
      action: 'Lưu log cảnh báo, cho phép kích hoạt gửi lại mã mời',
    },
    relatedTab: 'mailkit',
  },
  {
    id: 8,
    stepNum: '08',
    title: 'Kích Hoạt Kế Hoạch & Nhịp Tim DMS (SETUP-01)',
    subtitle: 'Khởi chạy bộ đếm kiểm tra sinh tồn định kỳ và khóa kế hoạch',
    lane: 'server',
    laneLabel: 'Máy Chủ (.NET 8 Engine)',
    icon: <Clock className="w-5 h-5 text-rose-600" />,
    inboundData: {
      protocol: 'POST /api/v1/plans/{id}/activate',
      payload: `{\n  "planId": "plan_98afbd90",\n  "heartbeatIntervalDays": 30,\n  "rescueTimelockDays": 7\n}`,
    },
    cryptoAction: {
      title: 'Thẩm định đa điều kiện kích hoạt Kế hoạch di sản (SETUP-01)',
      details: [
        'Kiểm tra 6 điều kiện: Gói trả phí + Hạn dùng + MFA Owner + Executor chấp thuận + Có tài sản + Không trùng kế hoạch',
        'Khởi tạo nhịp tim sinh tồn DMS định kỳ 30 ngày',
        'Thiết lập đồng hồ giải cứu khẩn cấp Time-Lock 7 ngày',
      ],
    },
    outboundData: {
      status: 'Plan Activated - DMS LIVE',
      payload: `{\n  "planStatus": "ACTIVE",\n  "nextHeartbeatDue": "2026-10-28T22:30:00Z",\n  "dmsState": "HEALTHY"\n}`,
    },
    storage: {
      r2: 'Bảo lưu file .enc trong trạng thái sẵn sàng bàn giao',
      db: "SQL Server 2022: UPDATE [dbo].[EstatePlans] SET Status = 'ACTIVE', ActivatedAt = GETUTCDATE()",
      client: 'Chuyển giao diện sang Bảng điều khiển Giám sát Kế hoạch Hoạt động',
    },
    exception: {
      code: 'E6 · SETUP-01 Incomplete Checklist',
      trigger: 'Một trong các điều kiện tiên quyết (thanh toán, executor, tài sản) chưa hoàn tất',
      rollbackTo: 'Hiển thị danh sách các mục còn thiếu',
      action: 'Chặn kích hoạt với mã lỗi tương ứng, hướng dẫn hoàn tất checklist',
    },
    relatedTab: 'timelock',
  },
];

interface InteractiveWorkflowVisualizerProps {
  onNavigateTab?: (tabId: string) => void;
}

export const InteractiveWorkflowVisualizer: React.FC<InteractiveWorkflowVisualizerProps> = ({
  onNavigateTab,
}) => {
  const [activeFlowId, setActiveFlowId] = useState<'flow1' | 'flow2'>('flow1');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showExceptions, setShowExceptions] = useState<boolean>(false);

  // Persona State cho 1-Click Switcher
  const [selectedPersona, setSelectedPersona] = useState(DEMO_PERSONAS[0]);
  const [isSwitchingPersona, setIsSwitchingPersona] = useState<boolean>(false);
  const [personaMessage, setPersonaMessage] = useState<string | null>(null);

  const currentSteps = activeFlowId === 'flow1' ? FLOW_01_STEPS : FLOW_02_STEPS;
  const currentStep = currentSteps[activeStepIndex] || currentSteps[0];

  // Đổi luồng: reset step về 0
  const handleSwitchFlow = (flowId: 'flow1' | 'flow2') => {
    setIsPlaying(false);
    setActiveFlowId(flowId);
    setActiveStepIndex(0);
  };

  // 1-Click Persona Switcher
  const handleSelectPersona = async (persona: (typeof DEMO_PERSONAS)[0]) => {
    setIsSwitchingPersona(true);
    setPersonaMessage(null);
    setSelectedPersona(persona);

    try {
      const res = await axiosClient.post('/api/v1/auth/demo-login', { role: persona.role });
      if (res.data?.message) {
        setPersonaMessage(res.data.message);
      }
    } catch {
      // Fallback hiển thị mượt mà ngay cả khi offline
      setPersonaMessage(`Đã chuyển ngữ cảnh sang: ${persona.name} (${persona.title})`);
    } finally {
      setIsSwitchingPersona(false);
    }
  };

  // Auto-play timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => (prev + 1) % currentSteps.length);
      }, 3500 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed, currentSteps.length]);

  const handleNext = () => {
    setIsPlaying(false);
    setActiveStepIndex((prev) => Math.min(prev + 1, currentSteps.length - 1));
  };

  const handlePrev = () => {
    setIsPlaying(false);
    setActiveStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setActiveStepIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <HeritageCard
        title="Trình Mô Phỏng Đa Luồng Mật Mã & Bàn Giao Di Sản Số"
        subtitle="Mô phỏng trực quan từng gói tin dữ liệu luân chuyển giữa 5 Swimlanes theo thời gian thực (Cơ sở dữ liệu SQL Server 2022)"
        badge={
          <div className="flex items-center gap-2">
            <HeritageBadge variant="gold">Framer Motion Animated</HeritageBadge>
            <HeritageBadge variant="forest">SQL Server 2022 / T-SQL</HeritageBadge>
          </div>
        }
      >
        {/* Flow Selector Tabs (Luồng 1 vs Luồng 2) */}
        <div className="mb-4 p-2 bg-[#EFECE6]/80 rounded-xl border border-[#DCD9D0] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#0B291E] uppercase tracking-wider px-2">
              Chọn Luồng Mô Phỏng:
            </span>
            <button
              onClick={() => handleSwitchFlow('flow1')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFlowId === 'flow1'
                  ? 'bg-[#0B291E] text-[#E0C068] shadow-md border border-[#B88E4C]'
                  : 'bg-white text-[#44554C] hover:bg-stone-50 border border-[#DCD9D0]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Luồng 01: Xác Thực, Phân Quyền & Tự Tạo Tài Khoản JIT</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-900 font-mono">
                6 Bước
              </span>
            </button>

            <button
              onClick={() => handleSwitchFlow('flow2')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeFlowId === 'flow2'
                  ? 'bg-[#0B291E] text-[#E0C068] shadow-md border border-[#B88E4C]'
                  : 'bg-white text-[#44554C] hover:bg-stone-50 border border-[#DCD9D0]'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Luồng 02: Thiết Lập, Mã Hóa Phong Bì & Kích Hoạt Kho</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-900 font-mono">
                8 Bước
              </span>
            </button>
          </div>

          <div className="text-[11px] text-[#66786E] font-medium italic">
            {activeFlowId === 'flow1'
              ? 'Xác thực Google OIDC JIT, Form mật khẩu & 1-Click Role Switcher'
              : 'Quy trình mật mã AES-256-GCM, Gom kho bàn giao AC-01 & Kích hoạt DMS'}
          </div>
        </div>

        {/* 1-Click Persona Switcher Deck (Cực kỳ giá trị cho buổi bảo vệ) */}
        <div className="mb-4 p-3 bg-gradient-to-r from-amber-50/90 via-stone-50 to-emerald-50/90 rounded-xl border border-[#B88E4C]/40 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0B291E] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#B88E4C]" />
                <span>1-Click Persona Switcher (Mô Phỏng Đóng Vai Bảo Vệ Đồ Án):</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-300">
                Tuân thủ Quy tắc 3 người độc lập (ASSIGN-06)
              </span>
            </div>

            {selectedPersona && (
              <span className="text-[11px] font-mono text-[#0B291E] bg-white px-2 py-0.5 rounded border border-[#DCD9D0]">
                Active PersonId: <strong className="text-amber-800">{selectedPersona.personId.substring(0, 8)}...</strong>
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {DEMO_PERSONAS.map((p) => {
              const isSelected = selectedPersona.role === p.role;
              return (
                <button
                  key={p.role}
                  onClick={() => handleSelectPersona(p)}
                  disabled={isSwitchingPersona}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#0B291E] text-white border-[#B88E4C] shadow-md ring-2 ring-[#B88E4C]/50'
                      : 'bg-white hover:bg-stone-50 text-[#0B291E] border-[#DCD9D0]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base">{p.icon}</span>
                    <HeritageBadge variant={p.badgeVariant}>{p.role}</HeritageBadge>
                  </div>
                  <div>
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#E0C068]' : 'text-[#0B291E]'}`}>
                      {p.name}
                    </p>
                    <p className={`text-[10px] truncate ${isSelected ? 'text-stone-300' : 'text-[#66786E]'}`}>
                      {p.title.split('(')[0]}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {personaMessage && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-emerald-800 font-medium mt-2 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>{personaMessage}</span>
            </motion.p>
          )}
        </div>

        {/* Playback Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-[#EFECE6]/60 rounded-xl border border-[#DCD9D0]">
          <div className="flex items-center gap-2">
            <HeritageButton
              variant={isPlaying ? 'outline' : 'primary'}
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
              <span>{isPlaying ? 'Tạm Dừng' : 'Tự Động Chạy'}</span>
            </HeritageButton>

            <HeritageButton
              variant="outline"
              onClick={handlePrev}
              disabled={activeStepIndex === 0}
              className="px-3 py-1.5 text-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Bước Trước</span>
            </HeritageButton>

            <HeritageButton
              variant="outline"
              onClick={handleNext}
              disabled={activeStepIndex === currentSteps.length - 1}
              className="px-3 py-1.5 text-xs"
            >
              <span>Bước Kế</span>
              <ChevronRight className="w-4 h-4" />
            </HeritageButton>

            <HeritageButton variant="outline" onClick={handleReset} className="px-3 py-1.5 text-xs">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Làm Lại</span>
            </HeritageButton>
          </div>

          {/* Speed & Mode Toggles */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-[#DCD9D0]">
              <span className="text-[#66786E] font-medium">Tốc độ:</span>
              {[0.75, 1, 1.5, 2].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setPlaybackSpeed(spd)}
                  className={`px-2 py-0.5 rounded font-mono font-semibold transition-all ${
                    playbackSpeed === spd ? 'bg-[#0B291E] text-white' : 'text-[#66786E] hover:text-[#0B291E]'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowExceptions(!showExceptions)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                showExceptions
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                  : 'bg-white text-[#66786E] border border-[#DCD9D0] hover:text-[#0B291E]'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${showExceptions ? 'text-amber-600' : 'text-slate-400'}`} />
              <span>Xem Nhánh Ngoại Lệ & Rollback</span>
            </button>
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="mt-4 pt-3 border-t border-[#DCD9D0]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#0B291E] flex items-center gap-1.5">
              <span>Bước {currentStep.stepNum} / 0{currentSteps.length}:</span>
              <span className="text-[#B88E4C]">{currentStep.title}</span>
            </span>
            <span className="text-[11px] font-mono text-[#66786E]">
              {Math.round(((activeStepIndex + 1) / currentSteps.length) * 100)}% Tiến Trình
            </span>
          </div>

          <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-10 gap-1.5">
            {currentSteps.map((step, idx) => {
              const isActive = idx === activeStepIndex;
              const isPassed = idx < activeStepIndex;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    setIsPlaying(false);
                    setActiveStepIndex(idx);
                  }}
                  className={`py-1.5 px-2 rounded text-[11px] font-mono font-semibold transition-all text-center cursor-pointer ${
                    isActive
                      ? 'bg-[#0B291E] text-[#E0C068] shadow-sm ring-2 ring-[#B88E4C]'
                      : isPassed
                      ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      : 'bg-[#EFECE6] text-[#66786E] hover:bg-[#E5E2DC]'
                  }`}
                >
                  {step.stepNum}
                </button>
              );
            })}
          </div>
        </div>
      </HeritageCard>

      {/* Main 5-Swimlanes Simulation Board */}
      <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#0B291E] text-[#E0C068]">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-[#0B291E]">
                Mô Phỏng 5 Làn Tiến Trình (5 Swimlanes Real-Time Flow)
              </h3>
              <p className="text-[11px] text-[#66786E]">
                {activeFlowId === 'flow1'
                  ? 'Luồng 01: Onboarding, Xác thực Google OIDC JIT, Form thường và Phân quyền SQL Server 2022'
                  : 'Luồng 02: Mã hóa phong bì, Tự gom kho AC-01, Lưu trữ Cloudflare R2 và Kích hoạt DMS'}
              </p>
            </div>
          </div>
          <HeritageBadge variant="gold">
            {currentStep.laneLabel}
          </HeritageBadge>
        </div>

        {/* 5 Swimlanes Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Lane 1: Owner / User */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              currentStep.lane === 'owner'
                ? 'bg-amber-50/90 border-[#B88E4C] shadow-md ring-2 ring-[#B88E4C]/30'
                : 'bg-white border-[#DCD9D0] opacity-65'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0B291E]">1. Người Dùng / Chủ Kho</span>
              <span className="text-xs">👤</span>
            </div>
            <p className="text-[10px] text-[#66786E] mb-3">Chủ sở hữu, Người thụ hưởng, Thao tác UI</p>
            {currentStep.lane === 'owner' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-2.5 bg-amber-100/80 rounded-lg border border-amber-300 text-xs font-medium text-amber-950 space-y-1"
              >
                <div className="font-bold flex items-center gap-1.5 text-amber-900">
                  {currentStep.icon}
                  <span>Đang Thực Thi Thao Tác</span>
                </div>
                <p className="text-[11px] text-amber-800">{currentStep.subtitle}</p>
              </motion.div>
            )}
          </div>

          {/* Lane 2: Client Browser */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              currentStep.lane === 'client'
                ? 'bg-emerald-50/90 border-emerald-600 shadow-md ring-2 ring-emerald-600/30'
                : 'bg-white border-[#DCD9D0] opacity-65'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0B291E]">2. Trình Duyệt Client</span>
              <span className="text-xs">💻</span>
            </div>
            <p className="text-[10px] text-[#66786E] mb-3">React 19 Context, Web Crypto, Auth Nonce</p>
            {currentStep.lane === 'client' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-2.5 bg-emerald-100/80 rounded-lg border border-emerald-300 text-xs font-medium text-emerald-950 space-y-1"
              >
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  {currentStep.icon}
                  <span>Thực Thi Trong RAM Trình Duyệt</span>
                </div>
                <p className="text-[11px] text-emerald-800">{currentStep.subtitle}</p>
              </motion.div>
            )}
          </div>

          {/* Lane 3: Server .NET 8 Engine */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              currentStep.lane === 'server'
                ? 'bg-blue-50/90 border-blue-600 shadow-md ring-2 ring-blue-600/30'
                : 'bg-white border-[#DCD9D0] opacity-65'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0B291E]">3. Máy Chủ .NET 8 API</span>
              <span className="text-xs">⚙️</span>
            </div>
            <p className="text-[10px] text-[#66786E] mb-3">Rules Engine, JWT Factory, AES-GCM</p>
            {currentStep.lane === 'server' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-2.5 bg-blue-100/80 rounded-lg border border-blue-300 text-xs font-medium text-blue-950 space-y-1"
              >
                <div className="font-bold flex items-center gap-1.5 text-blue-900">
                  {currentStep.icon}
                  <span>Xử Lý Nghiệp Vụ Tại Server</span>
                </div>
                <p className="text-[11px] text-blue-800">{currentStep.subtitle}</p>
              </motion.div>
            )}
          </div>

          {/* Lane 4: SQL Server 2022 Database */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              currentStep.storage.db.includes('INSERT') || currentStep.storage.db.includes('UPDATE') || currentStep.storage.db.includes('Đọc')
                ? 'bg-indigo-50/90 border-indigo-600 shadow-md ring-2 ring-indigo-600/30'
                : 'bg-white border-[#DCD9D0] opacity-65'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0B291E]">4. CSDL SQL Server 2022</span>
              <span className="text-xs">🗄️</span>
            </div>
            <p className="text-[10px] text-[#66786E] mb-3">Bảng [Persons], [Users], ACID Transaction</p>
            <div className="p-2 rounded bg-indigo-100/70 border border-indigo-200 text-[11px] text-indigo-950 font-medium">
              <p className="font-bold text-[10px] text-indigo-900 mb-0.5">T-SQL Trạng Thái:</p>
              <p className="text-[10px] line-clamp-3">{currentStep.storage.db}</p>
            </div>
          </div>

          {/* Lane 5: External Services */}
          <div
            className={`p-3.5 rounded-xl border transition-all ${
              currentStep.lane === 'external'
                ? 'bg-cyan-50/90 border-cyan-600 shadow-md ring-2 ring-cyan-600/30'
                : 'bg-white border-[#DCD9D0] opacity-65'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#0B291E]">5. Dịch Vụ Ngoại Vi</span>
              <span className="text-xs">☁️</span>
            </div>
            <p className="text-[10px] text-[#66786E] mb-3">Google OIDC, Cloudflare R2, SePay, MailKit</p>
            {currentStep.lane === 'external' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-2.5 bg-cyan-100/80 rounded-lg border border-cyan-300 text-xs font-medium text-cyan-950 space-y-1"
              >
                <div className="font-bold flex items-center gap-1.5 text-cyan-900">
                  {currentStep.icon}
                  <span>Giao Tiếp Ngoại Vi</span>
                </div>
                <p className="text-[11px] text-cyan-800">{currentStep.subtitle}</p>
              </motion.div>
            )}
          </div>
        </div>

        {/* Live Packet Flow Visual Indicator */}
        <div className="p-4 rounded-xl bg-white border border-[#DCD9D0] shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0B291E] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Gói Tin Đang Luân Chuyển: {currentStep.inboundData.protocol}</span>
            </span>
            <span className="text-[11px] font-mono text-[#B88E4C] font-bold">
              {currentStep.outboundData.status}
            </span>
          </div>

          {/* Exceptions Alert Panel (Conditional) */}
          <AnimatePresence>
            {showExceptions && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/80 shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-950 flex items-center gap-2">
                    <span>🛡️</span>
                    <span>Tuyến Hồi Quy & Xử Lý Ngoại Lệ: {currentStep.exception.code}</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    ROLLBACK & REMEDIATION
                  </span>
                </div>

                <div className="p-3 bg-white/90 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p><strong>Nguyên nhân kích hoạt:</strong> {currentStep.exception.trigger}</p>
                  <p><strong>Hướng xử lý & Hồi quy:</strong> Quay lại <span className="font-bold text-[#0B291E]">{currentStep.exception.rollbackTo}</span> — {currentStep.exception.action}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Deep-Dive Active Step Inspector (4 Technical Panels) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Inbound Payload */}
        <div className="bg-[#FAF9F5] border border-[#B88E4C]/30 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#0B291E] font-bold text-xs mb-2">
              <span className="p-1 rounded bg-[#B88E4C]/20 text-[#0B291E]">📤</span>
              <span>1. DỮ LIỆU GỬI ĐI (INBOUND)</span>
            </div>
            <p className="text-[11px] font-mono text-[#66786E] mb-2 truncate">
              {currentStep.inboundData.protocol}
            </p>
            <pre className="p-2.5 rounded bg-[#14241C] text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-36 leading-relaxed">
              {currentStep.inboundData.payload}
            </pre>
          </div>
          <p className="text-[10px] text-[#66786E] mt-2 italic">
            Giao thức chuẩn được mã hóa bằng TLS 1.3
          </p>
        </div>

        {/* Card 2: Cryptographic Execution */}
        <div className="bg-[#FAF9F5] border border-[#B88E4C]/30 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#0B291E] font-bold text-xs mb-2">
              <span className="p-1 rounded bg-emerald-500/20 text-emerald-900">⚡</span>
              <span>2. THỰC THI MẬT MÃ & LOGIC</span>
            </div>
            <p className="text-xs font-bold text-[#0B291E] mb-1.5">{currentStep.cryptoAction.title}</p>
            <ul className="space-y-1 text-[11px] text-[#44554C]">
              {currentStep.cryptoAction.details.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-[#B88E4C] font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 mt-2 block w-fit">
            An toàn theo chuẩn SRS v3.11.0
          </span>
        </div>

        {/* Card 3: Storage & Key Custody */}
        <div className="bg-[#FAF9F5] border border-[#B88E4C]/30 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#0B291E] font-bold text-xs mb-2">
              <span className="p-1 rounded bg-blue-500/20 text-blue-900">🗄️</span>
              <span>3. LƯU TRỮ CSDL SQL SERVER</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded bg-cyan-50 border border-cyan-200">
                <p className="font-bold text-cyan-950 flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Cloudflare R2 Blob:</span>
                </p>
                <p className="text-cyan-900 text-[10px]">{currentStep.storage.r2}</p>
              </div>

              <div className="p-2 rounded bg-indigo-50 border border-indigo-200">
                <p className="font-bold text-indigo-950 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-indigo-700" />
                  <span>CSDL SQL Server 2022:</span>
                </p>
                <p className="text-indigo-900 text-[10px]">{currentStep.storage.db}</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[#66786E] mt-2">
            Client Context: {currentStep.storage.client}
          </p>
        </div>

        {/* Card 4: Action & Live Jump */}
        <div className="bg-[#FAF9F5] border border-[#B88E4C]/30 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#0B291E] font-bold text-xs mb-2">
              <span className="p-1 rounded bg-purple-500/20 text-purple-900">📥</span>
              <span>4. PHẢN HỒI & TRẢI NGHIỆM</span>
            </div>
            <p className="text-xs font-bold text-purple-900 mb-1">{currentStep.outboundData.status}</p>
            <pre className="p-2.5 rounded bg-[#14241C] text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-24 leading-relaxed mb-3">
              {currentStep.outboundData.payload}
            </pre>
          </div>

          {currentStep.relatedTab && onNavigateTab && (
            <HeritageButton
              variant="primary"
              onClick={() => onNavigateTab(currentStep.relatedTab!)}
              className="w-full flex items-center justify-center gap-1.5 text-xs py-2 shadow-sm"
            >
              <span>Thử Nghiệm Thực Tế Bước Này</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </HeritageButton>
          )}
        </div>
      </div>
    </div>
  );
};
