import React, { useState } from 'react';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { 
  UserCheck, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Lock, 
  User, 
  KeyRound, 
  RotateCcw, 
  FileCheck, 
  Eye, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export type VerificationStatus = 'UNVERIFIED' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';

interface AuditRecord {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  fromStatus: VerificationStatus;
  toStatus: VerificationStatus;
  reason: string;
}

export const ManualIdentityVerificationFlow: React.FC = () => {
  // Step 1: User Submission State
  const [applicantName, setApplicantName] = useState<string>('Lê Thị Thừa Kế');
  const [idCardNumber, setIdCardNumber] = useState<string>('079198002345');
  const [dateOfBirth, setDateOfBirth] = useState<string>('15/08/1985');
  const [documentType, setDocumentType] = useState<string>('CCCD gắn chip (12 số)');
  const [frontCardName, setFrontCardName] = useState<string>('cccd_mat_truoc_scan.jpg');
  const [backCardName, setBackCardName] = useState<string>('cccd_mat_sau_scan.jpg');
  const [selfieCardName, setSelfieCardName] = useState<string>('anh_chan_dung_xac_minh.jpg');

  // Step 2 & 3: Verifier Desk State
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>('UNVERIFIED');
  const [verifierId, setVerifierId] = useState<string>('VERIFIER-HCM-8821');
  const [verifierName, setVerifierName] = useState<string>('Trần Văn Thẩm Định (Phòng Pháp Chế)');
  const [reviewReason, setReviewReason] = useState<string>('Đối chiếu giấy tờ hợp lệ, ảnh chụp rõ nét, thông tin số CCCD trùng khớp với CSDL hộ tịch.');
  const [rejectionPreset, setRejectionPreset] = useState<string>('Ảnh chụp mờ / chói lóa sáng, không đọc được số định danh');
  const [supplementRequested, setSupplementRequested] = useState<boolean>(false);
  const [submissionTime, setSubmissionTime] = useState<string | null>(null);
  const [verificationTime, setVerificationTime] = useState<string | null>(null);

  // Audit Log State
  const [auditLogs, setAuditLogs] = useState<AuditRecord[]>([
    {
      id: 'AUD-001',
      timestamp: '2026-09-30 08:30:00',
      actor: 'Hệ thống',
      actorRole: 'SYSTEM',
      action: 'Khởi tạo hồ sơ',
      fromStatus: 'UNVERIFIED',
      toStatus: 'UNVERIFIED',
      reason: 'Người dùng bắt đầu phiên làm việc'
    }
  ]);

  // Hành động Bước 1: Người dùng nộp hồ sơ
  const handleSubmitDossier = () => {
    const now = new Date().toLocaleString('vi-VN');
    setSubmissionTime(now);
    setVerificationStatus('PENDING_VERIFICATION');
    setSupplementRequested(false);

    setAuditLogs(prev => [
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: now,
        actor: applicantName,
        actorRole: 'APPLICANT / BENEFICIARY',
        action: 'Nộp hồ sơ thẩm định',
        fromStatus: verificationStatus,
        toStatus: 'PENDING_VERIFICATION',
        reason: `Tải lên 3 tệp giấy tờ (${documentType}, Số: ${idCardNumber}). Chờ chuyên viên đối chiếu.`
      },
      ...prev
    ]);
  };

  // Hành động Bước 2: Yêu cầu bổ sung tài liệu
  const handleRequestSupplement = () => {
    const now = new Date().toLocaleString('vi-VN');
    setSupplementRequested(true);
    setAuditLogs(prev => [
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: now,
        actor: verifierName,
        actorRole: 'VERIFIER',
        action: 'Yêu cầu bổ sung tài liệu',
        fromStatus: verificationStatus,
        toStatus: 'PENDING_VERIFICATION',
        reason: 'Hình ảnh mặt sau mờ góc số chip. Đã gửi thông báo yêu cầu tải lại ảnh chất lượng cao.'
      },
      ...prev
    ]);
  };

  // Hành động Bước 3: Phê duyệt (Đã xác minh)
  const handleApproveVerification = () => {
    const now = new Date().toLocaleString('vi-VN');
    setVerificationTime(now);
    setVerificationStatus('VERIFIED');
    setSupplementRequested(false);

    setAuditLogs(prev => [
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: now,
        actor: `${verifierName} [${verifierId}]`,
        actorRole: 'VERIFIER (COMPLIANCE OFFICER)',
        action: 'Phê duyệt xác minh danh tính',
        fromStatus: verificationStatus,
        toStatus: 'VERIFIED',
        reason: reviewReason || 'Đã đối chiếu trực tiếp hồ sơ giấy tờ, xác nhận tính chính xác và toàn vẹn pháp lý.'
      },
      ...prev
    ]);
  };

  // Hành động Bước 3: Từ chối thẩm định
  const handleRejectVerification = () => {
    const now = new Date().toLocaleString('vi-VN');
    setVerificationTime(now);
    setVerificationStatus('REJECTED');
    setSupplementRequested(false);

    setAuditLogs(prev => [
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: now,
        actor: `${verifierName} [${verifierId}]`,
        actorRole: 'VERIFIER (COMPLIANCE OFFICER)',
        action: 'Từ chối hồ sơ xác minh',
        fromStatus: verificationStatus,
        toStatus: 'REJECTED',
        reason: rejectionPreset || 'Hồ sơ không đáp ứng điều kiện đối chiếu pháp lý.'
      },
      ...prev
    ]);
  };

  // Reset kiểm thử
  const handleResetFlow = () => {
    setVerificationStatus('UNVERIFIED');
    setSubmissionTime(null);
    setVerificationTime(null);
    setSupplementRequested(false);
    setAuditLogs([
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toLocaleString('vi-VN'),
        actor: 'Tester',
        actorRole: 'ADMIN',
        action: 'Đặt lại trạng thái kiểm thử',
        fromStatus: verificationStatus,
        toStatus: 'UNVERIFIED',
        reason: 'Reset quy trình để kiểm tra lại các kịch bản.'
      }
    ]);
  };

  return (
    <div className="space-y-6">
      {/* 1. KHUNG NGUYÊN TẮC CỐT LÕI & CẢNH BÁO BẢO MẬT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nguyên tắc 1: Không tự động duyệt */}
        <div className="p-4 bg-[#FAF6EE] border-l-4 border-[#B88E4C] rounded-r-xl text-xs space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-[#0B291E] font-bold text-sm">
            <ShieldCheck className="w-4 h-4 text-[#B88E4C]" />
            <span>Quy Tắc 1: Không Tự Động Đánh Dấu "Đã Xác Minh"</span>
          </div>
          <p className="text-[#4A453A] leading-relaxed">
            Hệ thống <strong>tuyệt đối không tự động chuyển trạng thái "Đã xác minh"</strong> chỉ vì người dùng đã tải ảnh giấy tờ lên. 
            Mọi hồ sơ bắt buộc phải chuyển sang <code>Chờ duyệt (PENDING_VERIFICATION)</code> và trải qua bước đối chiếu cẩn trọng bởi 
            <strong> Chuyên viên Thẩm định có thẩm quyền</strong> với đầy đủ trách nhiệm pháp lý theo Bộ luật Dân sự 2015.
          </p>
        </div>

        {/* Nguyên tắc 2: Điều kiện cần nhưng chưa đủ & Bảo mật PII */}
        <div className="p-4 bg-[#FAF6EE] border-l-4 border-[#0B291E] rounded-r-xl text-xs space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-[#0B291E] font-bold text-sm">
            <Lock className="w-4 h-4 text-[#0B291E]" />
            <span>Quy Tắc 2: "Điều Kiện Cần Nhưng Chưa Đủ" & Bảo Mật PII</span>
          </div>
          <p className="text-[#4A453A] leading-relaxed">
            <strong>Xác minh danh tính đạt cũng CHƯA ĐỦ để nhận di sản.</strong> Hồ sơ chuyển giao phải vượt qua tiếp: Thẩm định Giấy chứng tử, Hết thời gian chờ phản kháng (Time-Lock) và Cấp Grant.
            Đồng thời, <strong>giấy tờ danh tính chỉ dành riêng cho Verifier được phân quyền xem</strong>, áp dụng thời hạn lưu trữ (Retention Policy) và tiêu hủy an toàn (Crypto-shredding).
          </p>
        </div>
      </div>

      {/* 2. THANH TIẾN TRÌNH 4 BƯỚC CỦA LUỒNG XÁC MINH */}
      <div className="p-4 bg-[#FBF7EE] border border-[#E8DCC6] rounded-xl text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[#0B291E] text-sm">Tiến Trình 4 Bước Thẩm Định & Chuyển Giao:</span>
          <HeritageButton variant="outline" onClick={handleResetFlow} className="text-xs h-7">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Đặt Lại Kiểm Thử
          </HeritageButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-center text-xs">
          {/* Bước 1 */}
          <div className={`p-3 rounded-lg border transition-all ${
            verificationStatus === 'UNVERIFIED'
              ? 'bg-[#0B291E] text-[#FAF9F5] border-[#0B291E] shadow-xs'
              : 'bg-white border-[#DCD9D0] text-[#0B291E]'
          }`}>
            <div className="font-bold mb-1">1. Gửi Hồ Sơ</div>
            <div className="text-[11px] opacity-80">Người dùng nộp thông tin & ảnh CCCD</div>
            <div className="mt-2 text-[10px] font-mono">
              {submissionTime ? '✓ Đã nộp' : 'Đang thực hiện'}
            </div>
          </div>

          {/* Bước 2 */}
          <div className={`p-3 rounded-lg border transition-all ${
            verificationStatus === 'PENDING_VERIFICATION' && !supplementRequested
              ? 'bg-[#B88E4C] text-[#0B291E] font-semibold border-[#B88E4C] shadow-xs'
              : supplementRequested
              ? 'bg-amber-100 text-amber-900 border-amber-300'
              : verificationStatus === 'VERIFIED' || verificationStatus === 'REJECTED'
              ? 'bg-white border-[#DCD9D0] text-[#0B291E]'
              : 'bg-[#FAF9F5] border-[#E8DCC6] text-gray-400'
          }`}>
            <div className="font-bold mb-1">2. Đối Chiếu Hồ Sơ</div>
            <div className="text-[11px] opacity-80">Verifier kiểm tra tính hợp lệ & PII</div>
            <div className="mt-2 text-[10px] font-mono">
              {supplementRequested ? '⚠️ Yêu cầu bổ sung' : verificationStatus === 'PENDING_VERIFICATION' ? 'Đang thẩm định' : verificationStatus === 'VERIFIED' ? '✓ Đã đối chiếu' : 'Chưa đến lượt'}
            </div>
          </div>

          {/* Bước 3 */}
          <div className={`p-3 rounded-lg border transition-all ${
            verificationStatus === 'VERIFIED'
              ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
              : verificationStatus === 'REJECTED'
              ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
              : 'bg-[#FAF9F5] border-[#E8DCC6] text-gray-400'
          }`}>
            <div className="font-bold mb-1">3. Ghi Nhận Kết Quả</div>
            <div className="text-[11px] opacity-80">Chờ duyệt ➔ Đã duyệt / Bị từ chối</div>
            <div className="mt-2 text-[10px] font-mono">
              {verificationStatus === 'VERIFIED' ? '✓ ĐÃ XÁC MINH' : verificationStatus === 'REJECTED' ? '✗ BỊ TỪ CHỐI' : 'Chờ quyết định'}
            </div>
          </div>

          {/* Bước 4 */}
          <div className={`p-3 rounded-lg border transition-all ${
            verificationStatus === 'VERIFIED'
              ? 'bg-[#E5EDE8] border-[#0B291E] text-[#0B291E]'
              : 'bg-[#FAF9F5] border-[#E8DCC6] text-gray-400'
          }`}>
            <div className="font-bold mb-1">4. Hồ Sơ Chuyển Giao</div>
            <div className="text-[11px] opacity-80">Chứng tử + Time-Lock + Cấp Grant</div>
            <div className="mt-2 text-[10px] font-mono">
              {verificationStatus === 'VERIFIED' ? '⏳ Sẵn sàng xét duyệt' : 'Chưa đủ điều kiện'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. CHI TIẾT BƯỚC 1 & BƯỚC 2/3 TRÊN CÙNG GIAO DIỆN KIỂM THỬ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CỘT TRÁI (5 cột): BƯỚC 1 - GIAO DIỆN NGƯỜI DÙNG NỘP HỒ SƠ */}
        <div className="lg:col-span-5 bg-white border border-[#DCD9D0] rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[#B88E4C]" />
              <h3 className="font-bold text-sm text-[#0B291E]">Bước 1: Người Dùng Nộp Hồ Sơ</h3>
            </div>
            <span className="text-[11px] text-[#66786E]">Người yêu cầu</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-[#0B291E] block mb-1">Họ và tên người yêu cầu:</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD9D0] rounded-lg bg-[#FAF9F5] text-xs font-medium focus:outline-hidden focus:border-[#B88E4C]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-[#0B291E] block mb-1">Số CCCD / Hộ chiếu:</label>
                <input
                  type="text"
                  value={idCardNumber}
                  onChange={(e) => setIdCardNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCD9D0] rounded-lg bg-[#FAF9F5] text-xs font-mono focus:outline-hidden focus:border-[#B88E4C]"
                />
              </div>
              <div>
                <label className="font-semibold text-[#0B291E] block mb-1">Ngày sinh:</label>
                <input
                  type="text"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className="w-full px-3 py-2 border border-[#DCD9D0] rounded-lg bg-[#FAF9F5] text-xs font-mono focus:outline-hidden focus:border-[#B88E4C]"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-[#0B291E] block mb-1">Loại giấy tờ xác minh:</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD9D0] rounded-lg bg-[#FAF9F5] text-xs font-medium focus:outline-hidden focus:border-[#B88E4C]"
              >
                <option value="CCCD gắn chip (12 số)">Thẻ CCCD gắn chip (12 số - Chuẩn Bộ Công An)</option>
                <option value="Hộ chiếu Việt Nam">Hộ chiếu phổ thông Việt Nam (Còn hạn &gt; 6 tháng)</option>
                <option value="Thẻ Căn cước (Luật Căn cước 2024)">Thẻ Căn cước mới (Luật Căn cước 2024)</option>
              </select>
            </div>

            {/* Tài liệu đính kèm */}
            <div className="space-y-2 pt-2 border-t border-[#EFECE6]">
              <span className="font-semibold text-[#0B291E] block text-xs">Giấy tờ đính kèm (Mô phỏng tệp lưu trữ):</span>
              
              <div className="p-2.5 bg-[#FAF9F5] border border-[#E8DCC6] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#B88E4C]" />
                  <div>
                    <div className="font-medium text-[#0B291E] text-xs">{frontCardName}</div>
                    <div className="text-[10px] text-[#66786E]">Mặt trước thẻ CCCD (Ảnh màu rõ nét)</div>
                  </div>
                </div>
                <HeritageBadge variant="neutral">1.8 MB</HeritageBadge>
              </div>

              <div className="p-2.5 bg-[#FAF9F5] border border-[#E8DCC6] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#B88E4C]" />
                  <div>
                    <div className="font-medium text-[#0B291E] text-xs">{backCardName}</div>
                    <div className="text-[10px] text-[#66786E]">Mặt sau thẻ CCCD (Vùng MRZ & chip)</div>
                  </div>
                </div>
                <HeritageBadge variant="neutral">2.1 MB</HeritageBadge>
              </div>

              <div className="p-2.5 bg-[#FAF9F5] border border-[#E8DCC6] rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#0B291E]" />
                  <div>
                    <div className="font-medium text-[#0B291E] text-xs">{selfieCardName}</div>
                    <div className="text-[10px] text-[#66786E]">Ảnh chân dung chính diện đối chiếu</div>
                  </div>
                </div>
                <HeritageBadge variant="neutral">2.4 MB</HeritageBadge>
              </div>
            </div>

            <div className="pt-2">
              <HeritageButton 
                variant="primary" 
                className="w-full text-xs font-bold py-2.5"
                onClick={handleSubmitDossier}
                disabled={verificationStatus === 'PENDING_VERIFICATION' && !supplementRequested}
              >
                <FileCheck className="w-4 h-4 mr-1.5" />
                {verificationStatus === 'UNVERIFIED' 
                  ? 'Gửi Hồ Sơ Xác Minh Danh Tính (Chuyển Chờ Duyệt)' 
                  : supplementRequested
                  ? 'Nộp Lại Hồ Sơ Sau Khi Đã Bổ Sung'
                  : 'Cập Nhật Lại Hồ Sơ'}
              </HeritageButton>
              <p className="text-[10px] text-center text-[#66786E] mt-1.5 italic">
                * Hành động này sẽ chuyển hồ sơ sang trạng thái <strong>Chờ duyệt</strong>. Hệ thống không tự động cấp quyền.
              </p>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI (7 cột): BƯỚC 2 & 3 - TRẠM THẨM ĐỊNH CỦA CHUYÊN VIÊN PHÁP CHẾ (VERIFIER) */}
        <div className="lg:col-span-7 bg-white border border-[#DCD9D0] rounded-xl p-5 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#EFECE6]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0B291E]" />
              <h3 className="font-bold text-sm text-[#0B291E]">Bước 2 & 3: Bàn Thẩm Định Của Nhân Sự Verifier</h3>
            </div>
            <HeritageBadge variant={
              verificationStatus === 'VERIFIED' ? 'success' :
              verificationStatus === 'REJECTED' ? 'danger' :
              verificationStatus === 'PENDING_VERIFICATION' ? 'gold' : 'neutral'
            }>
              {verificationStatus === 'VERIFIED' ? 'Đã xác minh (VERIFIED)' :
               verificationStatus === 'REJECTED' ? 'Bị từ chối (REJECTED)' :
               verificationStatus === 'PENDING_VERIFICATION' ? 'Chờ duyệt (PENDING)' : 'Chưa nộp (UNVERIFIED)'}
            </HeritageBadge>
          </div>

          {/* Hộp Thông cáo Phân quyền & Bảo mật PII */}
          <div className="p-3 bg-[#FAF6EE] border border-[#E8DCC6] rounded-lg text-xs space-y-1.5">
            <div className="flex items-center gap-2 text-[#0B291E] font-semibold text-[11px]">
              <Lock className="w-3.5 h-3.5 text-[#B88E4C]" />
              <span>Chính Sách Bảo Mật Giấy Tờ & Thời Hạn Lưu Trữ (Retention Policy):</span>
            </div>
            <p className="text-[#4A453A] text-[11px] leading-relaxed">
              Theo quy định bảo vệ dữ liệu cá nhân (Nghị định 13/2023/NĐ-CP), <strong>chỉ nhân sự được phân quyền thẩm định (Verifier / Compliance Officer) mới có quyền mở xem các tệp giấy tờ</strong>. 
              Tệp danh tính được lưu trữ tạm thời với mã hóa riêng, thời hạn tối đa 30 ngày sau khi hoàn tất quy trình và sẽ được <strong>tiêu hủy an toàn (Secure Wipe)</strong>, không lưu trữ vĩnh viễn trên public storage.
            </p>
          </div>

          {/* Thông tin thẩm định viên */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="font-semibold text-[#0B291E] block mb-1">Mã định danh Verifier (Bắt buộc):</label>
              <input
                type="text"
                value={verifierId}
                onChange={(e) => setVerifierId(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DCD9D0] rounded-lg bg-[#FAF9F5] font-mono text-xs focus:outline-hidden focus:border-[#B88E4C]"
              />
            </div>
            <div>
              <label className="font-semibold text-[#0B291E] block mb-1">Chuyên viên phụ trách:</label>
              <input
                type="text"
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DCD9D0] rounded-lg bg-[#FAF9F5] text-xs focus:outline-hidden focus:border-[#B88E4C]"
              />
            </div>
          </div>

          {/* Đối chiếu hồ sơ */}
          <div className="p-3 bg-[#FBF7EE] border border-[#E8DCC6] rounded-lg space-y-2 text-xs">
            <div className="font-semibold text-[#0B291E] flex items-center justify-between">
              <span>Hồ sơ đang chờ thẩm định:</span>
              <span className="font-mono text-[10px] text-[#66786E]">Mã đơn: DOS-2026-LV998</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#4A453A]">
              <div><strong>Họ tên:</strong> {applicantName}</div>
              <div><strong>Số định danh:</strong> <span className="font-mono">{idCardNumber}</span></div>
              <div><strong>Ngày sinh:</strong> {dateOfBirth}</div>
              <div><strong>Loại giấy tờ:</strong> {documentType}</div>
            </div>
            <div className="pt-2 border-t border-[#E8DCC6] flex items-center gap-2">
              <span className="text-[11px] text-[#66786E]">Tài liệu đối chiếu:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[#DCD9D0] rounded text-[10px]">
                <Eye className="w-3 h-3 text-[#B88E4C]" /> Xem trước CCCD
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-[#DCD9D0] rounded text-[10px]">
                <Eye className="w-3 h-3 text-[#B88E4C]" /> Xem chân dung
              </span>
            </div>
          </div>

          {/* Ghi nhận lý do / Kết quả */}
          <div className="space-y-2 text-xs">
            <div>
              <label className="font-semibold text-[#0B291E] block mb-1">
                Lý do phê duyệt / Căn cứ pháp lý ghi nhận biên bản:
              </label>
              <textarea
                rows={2}
                value={reviewReason}
                onChange={(e) => setReviewReason(e.target.value)}
                className="w-full px-3 py-2 border border-[#DCD9D0] rounded-lg bg-[#FAF9F5] text-xs focus:outline-hidden focus:border-[#B88E4C]"
                placeholder="Nhập ghi chú chi tiết về kết quả đối chiếu..."
              />
            </div>

            <div>
              <label className="font-semibold text-[#0B291E] block mb-1">
                Lý do từ chối mẫu (Nếu không đạt điều kiện):
              </label>
              <select
                value={rejectionPreset}
                onChange={(e) => setRejectionPreset(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#DCD9D0] rounded-lg bg-[#FAF9F5] text-xs focus:outline-hidden focus:border-[#B88E4C]"
              >
                <option value="Ảnh chụp mờ / chói lóa sáng, không đọc được số định danh">Ảnh chụp mờ / chói lóa sáng, không đọc được số định danh</option>
                <option value="Thông tin họ tên và số CCCD không trùng khớp với hồ sơ thừa kế">Thông tin họ tên và số CCCD không trùng khớp với hồ sơ thừa kế</option>
                <option value="Giấy tờ có dấu hiệu bị cắt ghép, chỉnh sửa hoặc hết hạn sử dụng">Giấy tờ có dấu hiệu bị cắt ghép, chỉnh sửa hoặc hết hạn sử dụng</option>
                <option value="Ảnh chân dung đối chiếu không khớp với ảnh trên thẻ CCCD">Ảnh chân dung đối chiếu không khớp với ảnh trên thẻ CCCD</option>
              </select>
            </div>

            {/* Các nút hành động của Verifier */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <HeritageButton
                variant="primary"
                className="text-xs font-bold bg-[#059669] hover:bg-[#047857]"
                onClick={handleApproveVerification}
                disabled={verificationStatus === 'UNVERIFIED'}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Phê Duyệt (Đã Xác Minh)
              </HeritageButton>

              <HeritageButton
                variant="danger"
                className="text-xs font-bold"
                onClick={handleRejectVerification}
                disabled={verificationStatus === 'UNVERIFIED'}
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Từ Chối Thẩm Định
              </HeritageButton>

              <HeritageButton
                variant="outline"
                className="text-xs font-semibold"
                onClick={handleRequestSupplement}
                disabled={verificationStatus === 'UNVERIFIED'}
              >
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                Yêu Cầu Bổ Sung
              </HeritageButton>
            </div>
          </div>
        </div>
      </div>

      {/* 4. BƯỚC 4: HỒ SƠ CHUYỂN GIAO DI SẢN & GIẢI THÍCH NGUYÊN TẮC "ĐIỀU KIỆN CẦN NHƯNG CHƯA ĐỦ" */}
      <div className="p-5 bg-gradient-to-r from-[#FAF6EE] to-[#F3EDE0] border border-[#D5C29E] rounded-xl text-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-2 border-b border-[#E4D5BE]">
          <KeyRound className="w-5 h-5 text-[#B88E4C]" />
          <div>
            <h3 className="font-bold text-sm text-[#0B291E]">
              Bước 4: Hồ Sơ Chuyển Giao Di Sản — Vì Sao "Xác Minh Danh Tính Đạt" Vẫn Chưa Đủ?
            </h3>
            <p className="text-[#6B5E43] text-[11px]">
              Quy định tại Điều 616 và 624 Bộ luật Dân sự 2015 về mở thừa kế và chuyển giao tài sản số có điều kiện.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Cột 1 */}
          <div className="p-3 bg-white border border-[#DCD9D0] rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B291E]">1. Danh Tính Thừa Kế</span>
              {verificationStatus === 'VERIFIED' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-500" />
              )}
            </div>
            <div className="text-[11px] text-[#4A453A]">
              Xác minh danh tính thủ công của người thụ hưởng/thừa kế.
            </div>
            <div className="pt-1 text-[10px] font-bold">
              {verificationStatus === 'VERIFIED' ? (
                <span className="text-emerald-700">✓ Đã Hoàn Tất (VERIFIED)</span>
              ) : (
                <span className="text-amber-700">⏳ Chưa Đạt</span>
              )}
            </div>
          </div>

          {/* Cột 2 */}
          <div className="p-3 bg-white border border-[#DCD9D0] rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B291E]">2. Giấy Chứng Tử</span>
              <Clock className="w-4 h-4 text-[#66786E]" />
            </div>
            <div className="text-[11px] text-[#4A453A]">
              Verifier thẩm định bản gốc Giấy chứng tử trích lục tư pháp.
            </div>
            <div className="pt-1 text-[10px] font-bold text-[#66786E]">
              {verificationStatus === 'VERIFIED' ? '⏳ Sẵn sàng nộp hồ sơ' : 'Chờ bước 1'}
            </div>
          </div>

          {/* Cột 3 */}
          <div className="p-3 bg-white border border-[#DCD9D0] rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B291E]">3. Time-Lock Delay</span>
              <Clock className="w-4 h-4 text-[#66786E]" />
            </div>
            <div className="text-[11px] text-[#4A453A]">
              Thời hạn chờ 15 - 30 ngày cho chủ tài sản gửi AliveClaim phản kháng.
            </div>
            <div className="pt-1 text-[10px] font-bold text-[#66786E]">
              Bắt đầu sau khi duyệt chứng tử
            </div>
          </div>

          {/* Cột 4 */}
          <div className="p-3 bg-white border border-[#DCD9D0] rounded-lg space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#0B291E]">4. Cấp Grant & Shamir</span>
              <Lock className="w-4 h-4 text-[#66786E]" />
            </div>
            <div className="text-[11px] text-[#4A453A]">
              Hệ thống giải phóng System Share kết hợp Emergency Share để mở DEK.
            </div>
            <div className="pt-1 text-[10px] font-bold text-[#66786E]">
              Chỉ mở khi đủ 4 điều kiện
            </div>
          </div>
        </div>

        {/* Kết luận rõ ràng */}
        <div className="p-3 bg-white/80 border border-[#DCD9D0] rounded-lg text-xs leading-relaxed text-[#2A3F33]">
          <strong>Kết luận bảo mật:</strong> Kẻ tấn công hoặc người thừa kế dù có xác minh danh tính thành công cũng <strong>không thể lập tức mở khóa di sản số</strong>. 
          Kiến trúc đa tầng ngăn chặn rủi ro gian lận danh tính, tranh chấp tài sản khi chủ sở hữu còn sống và đảm bảo tính hợp pháp tối cao cho tài sản số.
        </div>
      </div>

      {/* 5. SỔ KIỂM TOÁN LỊCH SỬ THẨM ĐỊNH (AUDIT TRAIL LOG) */}
      <div className="bg-white border border-[#DCD9D0] rounded-xl p-5 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#B88E4C]" />
            <h3 className="font-bold text-sm text-[#0B291E]">Sổ Kiểm Toán Thẩm Định Hồ Sơ (Audit Trail)</h3>
          </div>
          <span className="text-[11px] text-[#66786E]">{auditLogs.length} bản ghi</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF9F5] border-b border-[#EFECE6] text-[#0B291E] font-semibold">
                <th className="py-2.5 px-3">Thời Điểm</th>
                <th className="py-2.5 px-3">Người Thực Hiện</th>
                <th className="py-2.5 px-3">Vai Trò</th>
                <th className="py-2.5 px-3">Hành Động</th>
                <th className="py-2.5 px-3">Trạng Thái Sau Xử Lý</th>
                <th className="py-2.5 px-3">Lý Do / Căn Cứ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF9F5]/80 transition-colors">
                  <td className="py-2 px-3 font-mono text-[11px] text-[#66786E] whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="py-2 px-3 font-medium text-[#0B291E]">
                    {log.actor}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-2 py-0.5 bg-[#FAF6EE] text-[#0B291E] border border-[#E8DCC6] rounded text-[10px] font-mono">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-medium text-[#0B291E]">
                    {log.action}
                  </td>
                  <td className="py-2 px-3">
                    <HeritageBadge variant={
                      log.toStatus === 'VERIFIED' ? 'success' :
                      log.toStatus === 'REJECTED' ? 'danger' :
                      log.toStatus === 'PENDING_VERIFICATION' ? 'gold' : 'neutral'
                    }>
                      {log.toStatus}
                    </HeritageBadge>
                  </td>
                  <td className="py-2 px-3 text-[#4A453A] text-[11px] max-w-md truncate" title={log.reason}>
                    {log.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
