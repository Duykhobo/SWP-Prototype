/**
 * @file TechOverviewBar.tsx
 * @description Thanh tổng quan trạng thái các công nghệ bên thứ 3 và thư viện cốt lõi
 */

import React from 'react';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { ShieldCheck, Cloud, CreditCard, Mail, Scan, KeyRound, Clock, LogIn, Cpu } from 'lucide-react';

export const TechOverviewBar: React.FC = () => {
  const techs = [
    { name: 'Envelope AES-256-GCM', status: 'Sẵn sàng', icon: <ShieldCheck className="w-3.5 h-3.5" />, variant: 'success' as const },
    { name: 'Shamir Secret Sharing (2/3)', status: 'GF(256) Verified', icon: <KeyRound className="w-3.5 h-3.5" />, variant: 'forest' as const },
    { name: 'Cloudflare R2 Storage', status: 'S3-Compatible', icon: <Cloud className="w-3.5 h-3.5" />, variant: 'gold' as const },
    { name: 'SePay VietQR 24/7', status: 'Webhook ACID', icon: <CreditCard className="w-3.5 h-3.5" />, variant: 'success' as const },
    { name: 'MailKit & MimeKit SMTP', status: 'HTML Alerts', icon: <Mail className="w-3.5 h-3.5" />, variant: 'forest' as const },
    { name: 'Thẩm định hồ sơ', status: 'Thủ công (Human Verifier)', icon: <ShieldCheck className="w-3.5 h-3.5" />, variant: 'success' as const },
    { name: 'AI/OCR eKYC (Định hướng tương lai)', status: 'Hỗ trợ trích xuất', icon: <Scan className="w-3.5 h-3.5" />, variant: 'gold' as const },
    { name: 'Time-Lock 48h / Demo 2m', status: 'AliveClaim Engine', icon: <Clock className="w-3.5 h-3.5" />, variant: 'success' as const },
    { name: 'Google OIDC Identity', status: 'OAuth 2.0 Validated', icon: <LogIn className="w-3.5 h-3.5" />, variant: 'forest' as const },
    { name: 'FPT AI Marketplace', status: 'LLM & VLM Live', icon: <Cpu className="w-3.5 h-3.5" />, variant: 'gold' as const },
  ];

  return (
    <div className="bg-[#FAF9F5] border-y border-[#DCD9D0] py-2.5 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs">
        <span className="font-bold text-[#0B291E] flex items-center gap-1.5 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#059669] animate-pulse"></span>
          Ma Trận Thử Nghiệm Kỹ Thuật (SWP391 Prototype):
        </span>

        <div className="flex items-center flex-wrap gap-2">
          {techs.map((t, idx) => (
            <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-[#DCD9D0] rounded-lg shadow-2xs">
              <span className="text-[#0B291E]">{t.icon}</span>
              <span className="text-[11px] font-medium text-[#14241C]">{t.name}:</span>
              <HeritageBadge variant={t.variant}>{t.status}</HeritageBadge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
