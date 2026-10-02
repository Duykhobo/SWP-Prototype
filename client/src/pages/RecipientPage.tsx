/**
 * @file RecipientPage.tsx
 * @description Cổng Tiếp Nhận Di Sản Dành Cho Người Thụ Hưởng (SRS v3.11.0 - DEL-04, DEL-05)
 */

import React, { useState } from 'react';
import { 
  Gift, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  FileCheck, 
  Download, 
  AlertCircle, 
  UserCheck, 
  Lock,
  KeyRound,
  FileText,
  Info,
  ExternalLink
} from 'lucide-react';

export const RecipientPage: React.FC = () => {
  const [decisionState, setDecisionState] = useState<'PENDING' | 'ACCEPTED' | 'REJECTED'>('PENDING');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleAccept = () => {
    setDecisionState('ACCEPTED');
  };

  const handleReject = () => {
    if (confirm('Bạn có chắc chắn muốn TỪ CHỐI nhận di sản số này không? Theo quy chế SRS v3.11.0, bạn vẫn có quyền nhận lại trong thời hạn đóng băng 2 năm.')) {
      setDecisionState('REJECTED');
    }
  };

  const handleDownloadDecrypted = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      alert('Đã giải mã thành công trong bộ nhớ RAM và xuất tệp tài sản an toàn!');
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. TOP NOTICE BANNER: 7-DAY DECISION WINDOW (DEL-04, DEL-05) */}
      <div className="bg-[#FAF9F5] border-l-4 border-l-[#B88E4C] border-y border-r border-[#DCD9D0] rounded-2xl p-6 shadow-tactile-raised relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FBF7EE] border border-[#E8DCC6] flex items-center justify-center text-[#B88E4C] shrink-0">
              <Clock className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-base text-[#0B291E]">
                  Cửa Sổ Quyết Định Tiếp Nhận Di Sản Số (SRS v3.11.0)
                </span>
                <span className="bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Cửa Sổ 7 Ngày
                </span>
              </div>
              <p className="text-xs text-[#66786E] mt-0.5">
                Hồ sơ chứng tử số đã được chuyên viên thẩm định phê duyệt (<span className="text-[#059669] font-semibold">APPROVED</span>).
              </p>
            </div>
          </div>

          <div className="bg-[#FFFBEB] border border-[#FDE68A] px-4 py-2 rounded-xl text-right">
            <span className="text-[10px] text-[#D97706] uppercase font-bold tracking-wider block">
              Thời Hạn Quyết Định
            </span>
            <span className="text-lg font-bold font-serif text-[#92400E]">
              Còn 06 ngày 21 giờ 45 phút
            </span>
          </div>
        </div>

        {/* 2-Year Freeze Legal Clause */}
        <div className="mt-4 pt-3 border-t border-[#DCD9D0] flex items-center gap-2 text-[11px] text-[#7D5D28]">
          <Info className="w-4 h-4 shrink-0 text-[#B88E4C]" />
          <span>
            <strong>Điều khoản suy nghĩ lại (DEL-05):</strong> Ngay cả khi bạn chọn Từ chối hoặc quá hạn 7 ngày, di sản vẫn được bảo quản an toàn trong thời hạn đóng băng 2 năm (FreezeExpiresAt: 26/09/2028).
          </span>
        </div>
      </div>

      {/* 2. ESTATE DETAILS CARD */}
      <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-6 shadow-tactile-raised space-y-6">
        {/* Deceased Owner & Verification Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-[#DCD9D0] gap-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-[#66786E] font-bold block">
              Người Lập Di Sản Ủy Thác
            </span>
            <h2 className="text-lg font-serif font-bold text-[#0B291E]">
              Ông Nguyễn Văn Chủ Kho
            </h2>
            <p className="text-xs text-[#66786E]">
              Căn cước công dân: <span className="font-mono font-medium text-[#14241C]">079099001234</span> · Chứng thư số: <span className="font-mono text-[#0B291E] font-medium">CERT-LV-2026-998</span>
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#E5EDE8] border border-[#0B291E]/20 px-3 py-1.5 rounded-xl self-start sm:self-auto text-xs">
            <FileCheck className="w-4 h-4 text-[#059669]" />
            <div className="flex flex-col">
              <span className="text-[10px] text-[#0B291E] font-bold">Giấy Chứng Tử Đã Xác Minh</span>
              <span className="text-[9px] text-[#66786E]">Thẩm định viên: Lê Hoàng Nam (LS. Đoàn Luật sư TP.HCM)</span>
            </div>
          </div>
        </div>

        {/* List of Designated Assets in this Handover Bundle */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-[#0B291E] uppercase tracking-wider">
            Danh Mục Tài Sản Trong Kho Bàn Giao (Kho Một Người)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Cụm 24 Từ Khôi Phục Ví Lạnh Ledger Nano X',
                desc: 'Chứa tài sản Bitcoin và Ethereum tích lũy gia đình.',
                size: '1.2 MiB (Bản mã)',
                icon: <KeyRound className="w-5 h-5 text-[#B88E4C]" />,
                sha: '8f4c2e1b...9a0d3f2a',
              },
              {
                title: 'Hồ Sơ Di Chúc & Quyền Sử Dụng Đất',
                desc: 'Bản scan công chứng và phân chia di sản theo Điều 626 BLDS 2015.',
                size: '14.8 MiB (PDF Encrypted)',
                icon: <FileText className="w-5 h-5 text-[#0B291E]" />,
                sha: '3c7d9a1f...7e4b2d1c',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-[#DCD9D0] shadow-tactile-inset flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#E5EDE8] flex items-center justify-center text-[#0B291E] shrink-0 mt-0.5">
                  {item.icon}
                </div>
                <div className="space-y-1 text-xs flex-1">
                  <h4 className="font-bold text-[#0B291E]">{item.title}</h4>
                  <p className="text-[11px] text-[#66786E]">{item.desc}</p>
                  <div className="flex items-center justify-between text-[10px] text-[#66786E] pt-1">
                    <span>Dung lượng: {item.size}</span>
                    <span className="font-mono">Mã băm: {item.sha}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. LEGAL COMMITMENT & ACTION BUTTONS */}
        <div className="pt-4 border-t border-[#DCD9D0] space-y-4">
          {decisionState === 'PENDING' && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#EFECE6] p-4 rounded-xl border border-[#DCD9D0]">
              <div className="text-xs text-[#14241C] space-y-0.5">
                <span className="font-bold block text-[#0B291E]">
                  Quyết Định Tiếp Nhận Di Sản (Điều 616 & 630 BLDS 2015)
                </span>
                <span className="text-[11px] text-[#66786E]">
                  Chọn Chấp nhận để hệ thống cấp quyền giải mã tải tệp, hoặc Từ chối nếu không nhận di sản.
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleReject}
                  className="px-4 py-2.5 bg-white hover:bg-red-50 text-[#D9534F] border border-[#D9534F]/30 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Từ Chối Di Sản</span>
                </button>

                <button
                  type="button"
                  onClick={handleAccept}
                  className="px-5 py-2.5 bg-[#0B291E] hover:bg-[#133E2F] active:scale-95 text-[#FAF9F5] rounded-xl text-xs font-bold transition-all shadow-tactile-raised cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#B88E4C]" />
                  <span>Chấp Nhận Di Sản</span>
                </button>
              </div>
            </div>
          )}

          {decisionState === 'ACCEPTED' && (
            <div className="bg-[#E5EDE8] border border-[#059669]/30 p-5 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#059669]">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-serif font-bold text-sm text-[#0B291E]">
                    Bạn Đã Ký Nhận Di Sản Thành Công!
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#059669] bg-white px-2 py-0.5 rounded border border-[#059669]/30">
                  TOKEN: DECRYPTION-GRANTED-991
                </span>
              </div>

              <p className="text-xs text-[#14241C]">
                Quyền giải mã trực tiếp trong RAM đã được cấp thông qua sự đồng thuận của hệ phân mảnh Shamir SSS. Bạn có thể tải gói tài sản giải mã ngay bây giờ.
              </p>

              <button
                type="button"
                onClick={handleDownloadDecrypted}
                disabled={isDownloading}
                className="px-4 py-2 bg-[#0B291E] hover:bg-[#133E2F] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#B88E4C]" />
                <span>{isDownloading ? 'Đang giải mã và tạo tệp...' : 'Tải Về Toàn Bộ Di Sản (Giải Mã Trong RAM)'}</span>
              </button>
            </div>
          )}

          {decisionState === 'REJECTED' && (
            <div className="bg-red-50 border border-red-200 p-5 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-[#D9534F]">
                <XCircle className="w-5 h-5" />
                <span className="font-serif font-bold text-sm">
                  Đã Ghi Nhận Quyết Định Từ Chối
                </span>
              </div>
              <p className="text-xs text-[#66786E]">
                Tài sản đã được chuyển vào trạng thái Đóng Băng An Toàn 2 năm (FreezeExpiresAt). Bất cứ lúc nào trong 2 năm tới, bạn vẫn có thể đăng nhập để xác nhận lại nếu thay đổi ý định.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
