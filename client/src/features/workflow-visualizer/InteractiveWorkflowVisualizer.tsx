/**
 * @file InteractiveWorkflowVisualizer.tsx
 * @description Trình mô phỏng trực quan hoạt hình quy trình End-to-End của LegacyVault bằng Framer Motion
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
  CreditCard,
  Mail,
  Scan,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCode,
  HardDrive,
  Database,
  ExternalLink,
  Info,
  Sparkles,
} from 'lucide-react';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';

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

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 1,
    stepNum: '01',
    title: 'Chọn Gói & Thanh Toán VietQR',
    subtitle: 'Khởi tạo đơn hàng qua cổng SePay NAPAS247',
    lane: 'owner',
    laneLabel: 'Chủ Tài Sản (Owner)',
    icon: <CreditCard className="w-5 h-5 text-amber-600" />,
    inboundData: {
      protocol: 'POST /api/v1/payment/checkout-order',
      payload: '{\n  "planTier": "PRO_ESTATE",\n  "amount": 299000,\n  "currency": "VND",\n  "orderRef": "ORD-2026-98AF"\n}',
    },
    cryptoAction: {
      title: 'Xác thực thanh toán ngân hàng tự động',
      details: [
        'Client render mã VietQR chuẩn NAPAS247 kèm mã đơn hàng duy nhất',
        'Cổng thanh toán SePay lắng nghe biến động số dư tài khoản ngân hàng',
        'Webhook gửi HTTP POST có chữ ký HMAC-SHA256 về máy chủ .NET 8',
      ],
    },
    outboundData: {
      status: 'HTTP 200 Webhook Confirmed',
      payload: '{\n  "paymentStatus": "PAID",\n  "transactionId": "FT26271982736",\n  "planActive": true\n}',
    },
    storage: {
      r2: 'Không lưu dữ liệu tài chính trên Object Storage',
      db: 'Lưu transaction_id, order_ref, trạng thái PAID vào PostgreSQL',
      client: 'Cập nhật Context sang trạng thái gói trả phí',
    },
    exception: {
      code: 'E1 · Unpaid Order',
      trigger: 'Người dùng đóng modal hoặc đơn hàng quá hạn 15 phút chưa nhận được tiền',
      rollbackTo: 'Bước 01 (Giữ nguyên trang chọn gói)',
      action: 'Tự động mở lại modal VietQR hoặc gia hạn thanh toán an toàn',
    },
    relatedTab: 'sepay',
  },
  {
    id: 2,
    stepNum: '02',
    title: 'Băm Checksum SHA-256 Trong RAM',
    subtitle: 'Kiểm tra tệp tin di chúc/khóa private <= 20MB tại trình duyệt',
    lane: 'client',
    laneLabel: 'Client (React 19 Sandbox)',
    icon: <FileCode className="w-5 h-5 text-emerald-600" />,
    inboundData: {
      protocol: 'In-Memory File Buffer (Web Crypto API)',
      payload: 'File: "Will_and_Estate_Passphrases.pdf"\nMIME: application/pdf | Size: 1.48 MB (1,552,896 bytes)',
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
      payload: '{\n  "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",\n  "validation": "PASS"\n}',
    },
    storage: {
      r2: 'Chưa đẩy lên đám mây',
      db: 'Chưa ghi cơ sở dữ liệu',
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
    subtitle: 'Sinh khóa DEK ngẫu nhiên và phân mảnh Shamir 2/3',
    lane: 'server',
    laneLabel: 'Máy Chủ (.NET 8 Engine)',
    icon: <Shield className="w-5 h-5 text-emerald-700" />,
    inboundData: {
      protocol: 'POST /api/v1/crypto/envelope-encrypt',
      payload: 'Multipart: [File Content] + Header: [X-Client-Checksum-Sha256]',
    },
    cryptoAction: {
      title: 'Mã hóa đối xứng AES-256-GCM + Khóa bọc KEK',
      details: [
        'Sinh ngẫu nhiên khóa dữ liệu DEK 256-bit qua RandomNumberGenerator',
        'Mã hóa toàn bộ nội dung file bằng AES-GCM với Nonce 96-bit và Tag 128-bit',
        'DEK được phân rã thành 3 mảnh Shamir (SSS 2/3 trên trường Galois GF(256))',
        'Khóa gốc DEK bị hủy ngay lập tức khỏi RAM sau khi phân rã',
      ],
    },
    outboundData: {
      status: 'HTTP 200 Encrypted OK',
      payload: '{\n  "assetId": "ast_98afbd90",\n  "storageKey": "vaults/ast_98afbd90.enc",\n  "nonceBase64": "9xF1/2a...",\n  "tagBase64": "vB83c..."\n}',
    },
    storage: {
      r2: 'Tạo luồng chuẩn bị đẩy file bản mã .enc',
      db: 'Lưu Metadata (Nonce, Auth Tag, Checksum SHA-256, Shamir Share 1)',
      client: 'Nhận về Shamir Share 2 (Anti-Rogue)',
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
      payload: 'Bucket: "legacyvault-prototype-private"\nKey: "vaults/ast_98afbd90.enc"\nContent: [AES-256-GCM Ciphertext Binary]',
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
      payload: '{\n  "eTag": "\\"9b105d4f7c4db35e0b0f60defb9fb3ab\\"",\n  "uploadedBytes": 1552912,\n  "status": "STORED"\n}',
    },
    storage: {
      r2: 'LƯU TRỮ VĨNH VIỄN tệp mã hóa .enc',
      db: 'Cập nhật StorageUri = "r2://legacyvault-prototype-private/vaults/..."',
      client: 'Nhận xác nhận mã hóa và lưu trữ thành công',
    },
    exception: {
      code: 'E3.1 · Cloudflare R2 Put Error',
      trigger: 'Mất kết nối mạng S3 hoặc Access Key R2 hết hạn',
      rollbackTo: 'Bước 03 (Thử lại lệnh PutObject 3 lần)',
      action: 'Retry tự động với exponential backoff, nếu thất bại hủy giao dịch',
    },
    relatedTab: 'r2',
  },
  {
    id: 5,
    stepNum: '05',
    title: 'Bàn Giao Khóa Mảnh Share 2 Về Client',
    subtitle: 'Cơ chế Anti-Rogue: Server không thể tự ý giải mã nếu thiếu Client',
    lane: 'client',
    laneLabel: 'Client (React 19 Sandbox)',
    icon: <Key className="w-5 h-5 text-amber-500" />,
    inboundData: {
      protocol: 'Secure TLS 1.3 Response',
      payload: '{\n  "shamirShare2Base64": "AgDY9A7qF3/...",\n  "shareIndex": 2,\n  "threshold": "2-of-3"\n}',
    },
    cryptoAction: {
      title: 'Lưu trữ khóa phân tán Anti-Rogue',
      details: [
        'Để giải mã cần tối thiểu 2/3 mảnh Shamir (k=2, n=3)',
        'Server CHỈ giữ Mảnh 1 (Database) — Không đủ 2 mảnh để giải mã lén',
        'Client giữ Mảnh 2 — Chủ tài sản có toàn quyền kiểm soát',
        'Mảnh 3 được mã hóa dự phòng chỉ trao cho Người Giám Hộ khi có biên bản thừa kế hợp lệ',
      ],
    },
    outboundData: {
      status: 'Share 2 Secured',
      payload: '{\n  "ownerCustody": "ACTIVE",\n  "antiRogueEnforced": true\n}',
    },
    storage: {
      r2: 'Không đổi',
      db: 'Lưu Mảnh 1 vào trường encrypted_share1',
      client: 'Lưu Mảnh 2 trong bộ nhớ phiên làm việc của Chủ tài sản',
    },
    exception: {
      code: 'E3.2 · Share Distribution Loss',
      trigger: 'Mất kết nối trước khi nhận được Mảnh 2',
      rollbackTo: 'Bước 03 (Tái tạo phiên mã hóa)',
      action: 'Yêu cầu client gửi lại yêu cầu để hoàn tất việc nhận mảnh khóa an toàn',
    },
    relatedTab: 'shamir',
  },
  {
    id: 6,
    stepNum: '06',
    title: 'Phân Bổ Hạn Mức Cho Người Thụ Hưởng',
    subtitle: 'Khai báo danh sách người nhận và đảm bảo tổng tỷ lệ đúng 100%',
    lane: 'owner',
    laneLabel: 'Chủ Tài Sản (Owner)',
    icon: <Info className="w-5 h-5 text-blue-600" />,
    inboundData: {
      protocol: 'POST /api/v1/plans/manifest',
      payload: '{\n  "beneficiaries": [\n    { "email": "heir1@family.vn", "ratio": 0.60 },\n    { "email": "heir2@family.vn", "ratio": 0.40 }\n  ]\n}',
    },
    cryptoAction: {
      title: 'Kiểm tra ràng buộc pháp lý & phân bổ di sản',
      details: [
        'Hệ thống tính tổng tỷ lệ phân bổ của tất cả người thụ hưởng',
        'Ràng buộc toán học bắt buộc: SUM(ratio) == 1.00 (100%)',
        'Mã hóa danh tính người thụ hưởng bằng khóa công khai của hợp đồng ủy thác',
      ],
    },
    outboundData: {
      status: 'HTTP 200 Manifest Validated',
      payload: '{\n  "totalRatio": 1.00,\n  "heirCount": 2,\n  "manifestSealed": true\n}',
    },
    storage: {
      r2: 'Không đổi',
      db: 'Lưu bảng plan_beneficiaries liên kết với plan_id',
      client: 'Hiển thị xác nhận tỷ lệ phân chia di sản 100% hợp lệ',
    },
    exception: {
      code: 'E4 · Invalid Allocation Percentage',
      trigger: 'Tổng tỷ lệ các người thụ hưởng khác 100% (ví dụ 95% hoặc 110%)',
      rollbackTo: 'Bước 06 (Giữ nguyên form phân bổ)',
      action: 'Hiển thị cảnh báo màu đỏ và khóa nút tiếp tục cho đến khi tổng bằng 100%',
    },
    relatedTab: 'envelope',
  },
  {
    id: 7,
    stepNum: '07',
    title: 'Chỉ Định & Gửi Thư Mời Người Giám Hộ',
    subtitle: 'Phát thư mời bảo mật qua dịch vụ MailKit SMTP TLS 587',
    lane: 'server',
    laneLabel: 'Máy Chủ (.NET 8 Engine)',
    icon: <Mail className="w-5 h-5 text-indigo-600" />,
    inboundData: {
      protocol: 'POST /api/v1/executors/nominate',
      payload: '{\n  "executorEmail": "luatsu.nguyen@lawfirm.vn",\n  "role": "LEGAL_TRUSTEE",\n  "fullName": "LS. Nguyễn Văn Luật"\n}',
    },
    cryptoAction: {
      title: 'Sinh Token ủy quyền & gửi Email bảo mật',
      details: [
        'Tạo Token ký số HMAC SHA-256 có thời hạn 72 giờ',
        'Kết nối máy chủ MailKit SMTP (Gmail / Custom SMTP) qua cổng bảo mật TLS 587',
        'Gửi email HTML chuyên nghiệp chứa liên kết chấp thuận độc quyền',
      ],
    },
    outboundData: {
      status: 'SMTP 250 OK - Queued',
      payload: '{\n  "messageId": "<68acb.mailkit@legacyvault.vn>",\n  "status": "DELIVERED"\n}',
    },
    storage: {
      r2: 'Không đổi',
      db: 'Lưu hồ sơ Executor và invitation_token vào PostgreSQL',
      client: 'Hiển thị thông báo "Đã gửi thư mời giám hộ thành công"',
    },
    exception: {
      code: 'E5 · Executor Declined / Expired',
      trigger: 'Người giám hộ từ chối lời mời hoặc Token 72 giờ hết hạn',
      rollbackTo: 'Bước 07 (Quay lại màn hình đề cử)',
      action: 'Gửi email cảnh báo cho Chủ tài sản, mở form đề cử Người giám hộ dự phòng',
    },
    relatedTab: 'mailkit',
  },
  {
    id: 8,
    stepNum: '08',
    title: 'Người Giám Hộ Chấp Thuận Vai Trò',
    subtitle: 'Truy cập cổng pháp lý và ký cam kết bảo mật di chúc',
    lane: 'owner',
    laneLabel: 'Người Giám Hộ (Executor)',
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
    inboundData: {
      protocol: 'GET /portal/executor/accept?token=eyJhbGciOi...',
      payload: 'Action: ACCEPT_ROLE\nTimestamp: 2026-09-28T22:30:00Z',
    },
    cryptoAction: {
      title: 'Xác thực chữ ký Token & Ký cam kết pháp lý',
      details: [
        'Máy chủ xác minh chữ ký Token mời hợp lệ và chưa từng sử dụng',
        'Người giám hộ đọc cam kết trách nhiệm và điều khoản pháp luật Việt Nam',
        'Ghi nhận bằng chứng số (Digital Audit Trail) kèm địa chỉ IP và User-Agent',
      ],
    },
    outboundData: {
      status: 'Role Accepted - Audit Logged',
      payload: '{\n  "executorId": "exec_471b01",\n  "status": "ACCEPTED",\n  "auditId": "AUD-EXEC-0912"\n}',
    },
    storage: {
      r2: 'Không đổi',
      db: 'Cập nhật status = "ACCEPTED" cho executor trong database',
      client: 'Cập nhật trạng thái người giám hộ đã sẵn sàng',
    },
    exception: {
      code: 'E5.1 · Invalid Invitation Token',
      trigger: 'Token bị giả mạo hoặc đã bị thu hồi trước đó',
      rollbackTo: 'Cổng từ chối truy cập 403',
      action: 'Yêu cầu liên hệ Chủ tài sản để phát lại thư mời mới',
    },
    relatedTab: 'mailkit',
  },
  {
    id: 9,
    stepNum: '09',
    title: 'Định Danh Sinh Trắc Học FPT.AI eKYC',
    subtitle: 'Quét thẻ CCCD gắn chip và kiểm tra độ sống khuôn mặt >= 80%',
    lane: 'external',
    laneLabel: 'Dịch Vụ Ngoại Vi (FPT.AI Vision)',
    icon: <Scan className="w-5 h-5 text-purple-600" />,
    inboundData: {
      protocol: 'POST https://api.fpt.ai/vision/v2/id-recognition',
      payload: 'Headers: [api-key: sk-wGxN...]\nBody: FormData [Front_ID_Image, Back_ID_Image, Live_Selfie]',
    },
    cryptoAction: {
      title: 'Trí tuệ nhân tạo OCR & Xác thực thực thể sống',
      details: [
        'Trích xuất số CCCD, Họ tên, Ngày sinh, Địa chỉ từ thẻ chip',
        'Kiểm tra tính thật giả (Anti-spoofing) và góc chụp không bị lóa/cắt',
        'So khớp khuôn mặt giữa ảnh CCCD và video selfie liveness (đòi hỏi Match Score >= 80%)',
      ],
    },
    outboundData: {
      status: 'FPT.AI 200 OK - Verified',
      payload: '{\n  "idNumber": "079094001234",\n  "fullName": "NGUYEN VAN CHU KHO",\n  "livenessScore": 0.942,\n  "matchScore": 0.887\n}',
    },
    storage: {
      r2: 'Không lưu ảnh sinh trắc học lên R2 công khai',
      db: 'Lưu ekyc_verified = true, hash CCCD và điểm số vào bảng ekyc_logs',
      client: 'Hiển thị huy hiệu "Đã xác thực danh tính FPT.AI"',
    },
    exception: {
      code: 'E6 · eKYC Liveness Failed (< 80%)',
      trigger: 'Ảnh mờ, thẻ CCCD giả mạo hoặc khuôn mặt không khớp',
      rollbackTo: 'Bước 09 (Yêu cầu chụp lại CCCD)',
      action: 'Hiển thị lý do lỗi chi tiết và hướng dẫn chụp lại nơi đủ ánh sáng',
    },
    relatedTab: 'ekyc',
  },
  {
    id: 10,
    stepNum: '10',
    title: 'Kích Hoạt Dead Man\'s Switch (DMS)',
    subtitle: 'Khởi chạy bộ đếm nhịp tim 30 ngày và kiểm toán SETUP-01',
    lane: 'server',
    laneLabel: 'Máy Chủ (.NET 8 Engine)',
    icon: <Clock className="w-5 h-5 text-rose-600" />,
    inboundData: {
      protocol: 'POST /api/v1/plans/activate',
      payload: '{\n  "planId": "plan_98afbd90",\n  "heartbeatIntervalDays": 30,\n  "rescueTimelockDays": 7\n}',
    },
    cryptoAction: {
      title: 'Kích hoạt hệ thống bàn giao di sản tự động',
      details: [
        'Kiểm tra toàn diện quy tắc SETUP-01: Thanh toán OK + File OK + 100% Heirs + Executor OK + eKYC OK',
        'Khởi tạo bộ đếm nhịp tim định kỳ 30 ngày gửi ping email kiểm tra sức khỏe',
        'Thiết lập thời gian cứu nguy (Rescue Timelock) 7 ngày trước khi mở quyền cho Người giám hộ',
      ],
    },
    outboundData: {
      status: 'Plan Activated - DMS LIVE',
      payload: '{\n  "planStatus": "ACTIVE",\n  "nextHeartbeat": "2026-10-28T22:30:00Z",\n  "dmsState": "HEALTHY"\n}',
    },
    storage: {
      r2: 'Bảo lưu file .enc trong trạng thái sẵn sàng bàn giao',
      db: 'Cập nhật plan_status = "ACTIVE", khởi chạy background worker Quartz/Cron',
      client: 'Chuyển giao diện sang Bảng điều khiển Giám sát Kế hoạch Hoạt động',
    },
    exception: {
      code: 'E6.1 · SETUP-01 Incomplete Checklist',
      trigger: 'Một trong các điều kiện tiên quyết (eKYC, thanh toán, executor) chưa hoàn tất',
      rollbackTo: 'Hiển thị checklist các mục còn thiếu',
      action: 'Cung cấp liên kết trực tiếp để hoàn thành mục còn thiếu trước khi cho phép kích hoạt',
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
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [showExceptions, setShowExceptions] = useState<boolean>(false);

  const currentStep = WORKFLOW_STEPS[activeStepIndex];

  // Auto-play timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => (prev + 1) % WORKFLOW_STEPS.length);
      }, 3000 / playbackSpeed);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, playbackSpeed]);

  const handleNext = () => {
    setIsPlaying(false);
    setActiveStepIndex((prev) => Math.min(prev + 1, WORKFLOW_STEPS.length - 1));
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
        title="Trình Mô Phỏng Quy Trình Mật Mã & Bàn Giao Di Sản Số"
        subtitle="Mô phỏng trực quan từng gói tin dữ liệu luân chuyển giữa 5 Swimlanes theo thời gian thực"
        badge={
          <div className="flex items-center gap-2">
            <HeritageBadge variant="gold">Framer Motion Animated</HeritageBadge>
            <HeritageBadge variant="forest">10 Main Steps · 6 Exceptions</HeritageBadge>
          </div>
        }
      >
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

            <HeritageButton variant="outline" onClick={handlePrev} disabled={activeStepIndex === 0} className="px-3 py-1.5 text-xs">
              <ChevronLeft className="w-4 h-4" />
              <span>Bước Trước</span>
            </HeritageButton>

            <HeritageButton
              variant="outline"
              onClick={handleNext}
              disabled={activeStepIndex === WORKFLOW_STEPS.length - 1}
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
              <span>Xem Nhánh Ngoại Lệ (E1-E6)</span>
            </button>
          </div>
        </div>

        {/* Step Indicator Pills */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {WORKFLOW_STEPS.map((s, idx) => {
            const isCurrent = idx === activeStepIndex;
            const isDone = idx < activeStepIndex;

            return (
              <button
                key={s.id}
                onClick={() => {
                  setIsPlaying(false);
                  setActiveStepIndex(idx);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[#0B291E] text-white shadow-xs ring-2 ring-[#B88E4C]/50'
                    : isDone
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    : 'bg-white text-[#66786E] border border-[#DCD9D0] hover:border-[#B88E4C]'
                }`}
              >
                <span>{s.stepNum}</span>
                <span className="hidden md:inline">{s.title.split(' ')[0]}</span>
                {isDone && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
              </button>
            );
          })}
        </div>
      </HeritageCard>

      {/* Swimlanes Interactive Board */}
      <div className="bg-[#FAF9F5] border border-[#B88E4C]/30 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCD9D0] pb-3">
          <h3 className="text-sm font-bold text-[#0B291E] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#B88E4C]" />
            Bảng Điều Hướng Swimlanes (5 Làn Hoạt Động)
          </h3>
          <span className="text-xs text-[#66786E] font-medium">
            Đang hiển thị bước: <span className="font-bold text-[#0B291E]">{currentStep.stepNum} · {currentStep.title}</span>
          </span>
        </div>

        {/* The 5 Swimlanes Rows */}
        <div className="space-y-3 relative">
          {[
            { id: 'owner', label: '1. Chủ Tài Sản / Người Lập Kế Hoạch', icon: '👤', color: 'border-amber-400 bg-amber-50/40' },
            { id: 'client', label: '2. Client Sandbox (React 19 Ephemeral RAM)', icon: '💻', color: 'border-emerald-400 bg-emerald-50/40' },
            { id: 'server', label: '3. Máy Chủ .NET 8 (Core Crypto & Business Engine)', icon: '⚙️', color: 'border-blue-400 bg-blue-50/40' },
            { id: 'external', label: '4. Dịch Vụ Ngoại Vi (Cloudflare R2, SePay, MailKit, FPT.AI)', icon: '☁️', color: 'border-cyan-400 bg-cyan-50/40' },
          ].map((lane) => {
            const stepsInLane = WORKFLOW_STEPS.filter((s) => s.lane === lane.id);
            const isLaneActive = currentStep.lane === lane.id;

            return (
              <div
                key={lane.id}
                className={`p-3.5 rounded-xl border transition-all duration-300 relative ${
                  isLaneActive ? `${lane.color} shadow-xs ring-1 ring-[#B88E4C]/40` : 'bg-white/60 border-[#DCD9D0]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-[#0B291E] flex items-center gap-2">
                    <span>{lane.icon}</span>
                    <span>{lane.label}</span>
                  </span>
                  {isLaneActive && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B88E4C] text-[#0B291E] animate-pulse">
                      ĐANG XỬ LÝ (ACTIVE)
                    </span>
                  )}
                </div>

                {/* Nodes inside this lane */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2">
                  {WORKFLOW_STEPS.map((s, idx) => {
                    const isStepInLane = s.lane === lane.id;
                    const isSelected = idx === activeStepIndex;
                    const isPassed = idx < activeStepIndex;

                    if (!isStepInLane) {
                      return (
                        <div
                          key={s.id}
                          className="h-14 rounded-lg border border-dashed border-[#DCD9D0]/50 bg-black/[0.01] hidden lg:block"
                        />
                      );
                    }

                    return (
                      <motion.button
                        key={s.id}
                        onClick={() => {
                          setIsPlaying(false);
                          setActiveStepIndex(idx);
                        }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`h-14 p-2 rounded-lg border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                          isSelected
                            ? 'bg-[#0B291E] text-white border-[#B88E4C] ring-2 ring-[#B88E4C] shadow-md z-10'
                            : isPassed
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                            : 'bg-white border-[#DCD9D0] text-[#14241C] opacity-75 hover:opacity-100'
                        }`}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="active-pill"
                            className="absolute inset-0 bg-[#B88E4C]/10 border-2 border-[#B88E4C] rounded-lg pointer-events-none"
                            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                          />
                        )}

                        <div className="flex items-center justify-between w-full">
                          <span
                            className={`text-[10px] font-mono font-bold px-1 rounded ${
                              isSelected ? 'bg-[#B88E4C] text-[#0B291E]' : 'bg-black/10 text-slate-700'
                            }`}
                          >
                            {s.stepNum}
                          </span>
                          {isPassed && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>

                        <p className="text-[11px] font-bold truncate leading-tight">{s.title}</p>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Exception Handling Lane */}
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
                    <span>5. Xử Lý Ngoại Lệ & Tuyến Hồi Quy Khắc Phục (E1 - E6 Corrective Loops)</span>
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    ROLLBACK & REMEDIATION
                  </span>
                </div>

                <div className="p-3 bg-white/90 rounded-lg border border-amber-200 text-xs text-amber-900 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Ngoại lệ tiềm ẩn tại bước {currentStep.stepNum}: {currentStep.exception.code}</span>
                  </p>
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
            Bảo mật Zero-Knowledge
          </span>
        </div>

        {/* Card 3: Storage & Key Custody */}
        <div className="bg-[#FAF9F5] border border-[#B88E4C]/30 rounded-xl p-4 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#0B291E] font-bold text-xs mb-2">
              <span className="p-1 rounded bg-blue-500/20 text-blue-900">🗄️</span>
              <span>3. LƯU TRỮ & PHÂN BỔ KHÓA</span>
            </div>
            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded bg-cyan-50 border border-cyan-200">
                <p className="font-bold text-cyan-950 flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-cyan-700" />
                  <span>Cloudflare R2:</span>
                </p>
                <p className="text-cyan-900 text-[10px]">{currentStep.storage.r2}</p>
              </div>

              <div className="p-2 rounded bg-blue-50 border border-blue-200">
                <p className="font-bold text-blue-950 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-blue-700" />
                  <span>PostgreSQL DB:</span>
                </p>
                <p className="text-blue-900 text-[10px]">{currentStep.storage.db}</p>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-[#66786E] mt-2">
            Client: {currentStep.storage.client}
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
