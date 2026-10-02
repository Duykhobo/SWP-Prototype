/**
 * @file AppHeader.tsx
 * @description Header chính của hệ thống LegacyVault Testbench theo chuẩn Design System Heritage
 */

import React from 'react';
import { Shield, KeyRound, Clock, CreditCard, Mail, Scan, LogIn, ExternalLink, Cpu, Sparkles, UserCheck, Video } from 'lucide-react';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';

interface AppHeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onTabChange,
  currentRole,
  onRoleChange,
}) => {
  const tabs = [
    { id: 'flow', label: '🌟 0. Quy Trình Hoạt Hình (Flow Visualizer)', icon: <Sparkles className="w-4 h-4 text-amber-300" /> },
    { id: 'envelope', label: '1. Envelope AES-GCM', icon: <Shield className="w-4 h-4" /> },
    { id: 'shamir', label: '2. Shamir SSS (2/3)', icon: <KeyRound className="w-4 h-4" /> },
    { id: 'r2', label: '3. Cloudflare R2', icon: <Shield className="w-4 h-4" /> },
    { id: 'sepay', label: '4. SePay VietQR', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'mailkit', label: '5. MailKit SMTP', icon: <Mail className="w-4 h-4" /> },
    { id: 'ekyc', label: '6. Xác minh danh tính thủ công', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'timelock', label: '7. Time-Lock & Rescue', icon: <Clock className="w-4 h-4" /> },
    { id: 'video-verification', label: '🎥 8. Gọi Video 1–1 (LiveKit)', icon: <Video className="w-4 h-4 text-emerald-400" /> },
    { id: 'oidc', label: '9. Google OIDC', icon: <LogIn className="w-4 h-4" /> },
    { id: 'fpt-marketplace', label: '10. AI Trích Xuất (Định hướng tương lai)', icon: <Cpu className="w-4 h-4" /> },
  ];

  const roles = ['OWNER', 'EXECUTOR', 'VERIFIER', 'BENEFICIARY', 'ADMIN'];

  return (
    <header className="bg-[#0B291E] text-[#FAF9F5] shadow-md border-b border-[#B88E4C]/30 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#B88E4C] flex items-center justify-center text-[#0B291E] font-bold text-lg shadow-xs">
              LV
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-[#FAF9F5] flex items-center gap-2">
                LEGACYVAULT <span className="text-[#B88E4C] text-xs font-normal">| Technical Testbench v3.6</span>
              </h1>
              <p className="text-[11px] text-[#FAF9F5]/70">Hệ Thống Lưu Giữ & Bàn Giao Di Sản Số An Toàn</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            {/* Context Role Switcher (UI Context only - Rule 1.2) */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="text-[11px] text-[#FAF9F5]/70">Ngữ cảnh vai trò (UI Context):</span>
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="bg-[#0B291E] text-[#B88E4C] font-semibold text-xs border-0 rounded px-1.5 py-0.5 focus:ring-1 focus:ring-[#B88E4C] cursor-pointer"
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <a
              href="http://localhost:5000/swagger"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#B88E4C] text-[#0B291E] font-semibold rounded-lg hover:bg-[#A07839] transition-all"
            >
              <span>Swagger API Docs</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex space-x-1 overflow-x-auto py-2.5 scrollbar-none">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#B88E4C] text-[#0B291E] font-bold shadow-xs'
                    : 'text-[#FAF9F5]/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
