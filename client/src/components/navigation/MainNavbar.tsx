/**
 * @file MainNavbar.tsx
 * @description Thanh điều hướng chính của hệ thống LegacyVault theo chuẩn Heritage Design System
 */

import React from 'react';
import { 
  Shield, 
  Layers, 
  Gift, 
  CreditCard, 
  Cpu, 
  Activity, 
  ExternalLink, 
  ChevronRight,
  UserCheck,
  CheckCircle2,
  Scale,
  Zap
} from 'lucide-react';

export type MainNavTab = 'dashboard' | 'vaults' | 'recipient' | 'pricing' | 'comparison' | 'testbench';

interface MainNavbarProps {
  currentTab: MainNavTab;
  onTabChange: (tab: MainNavTab) => void;
  currentRole: string;
  onRoleChange: (role: string) => void;
  daysRemaining: number;
  onCheckIn: () => void;
  isCheckedInToday: boolean;
  uiTheme: 'evon' | 'promax';
  onUiThemeChange: (theme: 'evon' | 'promax') => void;
}

export const MainNavbar: React.FC<MainNavbarProps> = ({
  currentTab,
  onTabChange,
  currentRole,
  onRoleChange,
  daysRemaining,
  onCheckIn,
  isCheckedInToday,
  uiTheme,
  onUiThemeChange,
}) => {
  const navItems = [
    { id: 'dashboard' as MainNavTab, label: 'Tổng Quan', icon: <Layers className="w-4 h-4" /> },
    { id: 'vaults' as MainNavTab, label: 'Kho Di Sản & Gom Kho', icon: <Shield className="w-4 h-4" /> },
    { id: 'recipient' as MainNavTab, label: 'Cổng Tiếp Nhận Di Sản', icon: <Gift className="w-4 h-4" />, badge: '7 Ngày' },
    { id: 'pricing' as MainNavTab, label: 'Gói Cước & VietQR', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'comparison' as MainNavTab, label: '⚖️ So Sánh 2 Bộ UI/UX', icon: <Scale className="w-4 h-4 text-[#B88E4C]" />, badge: 'HOT' },
    { id: 'testbench' as MainNavTab, label: 'Kỹ Thuật Sandbox', icon: <Cpu className="w-4 h-4 text-[#B88E4C]" /> },
  ];

  const roles = [
    { value: 'OWNER', label: 'Chủ Di Sản (Owner)' },
    { value: 'EXECUTOR', label: 'Người Thừa Hành (Executor)' },
    { value: 'RECIPIENT', label: 'Người Thụ Hưởng (Recipient)' },
    { value: 'VERIFIER', label: 'Chuyên Viên Thẩm Định (Verifier)' },
  ];

  return (
    <header className={`${uiTheme === 'promax' ? 'bg-[#0A101D] border-slate-800 text-slate-100 shadow-2xl' : 'bg-[#0B291E] border-[#B88E4C]/30 text-[#FAF9F5] shadow-md'} border-b sticky top-0 z-50 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Tier: Branding, UI Switcher, DMS Pulse, Context Switcher */}
        <div className="flex flex-col lg:flex-row items-center justify-between py-3 border-b border-white/10 gap-3">
          {/* Logo & Platform Name */}
          <div 
            onClick={() => onTabChange('dashboard')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className={`w-10 h-10 rounded-xl p-0.5 shadow-tactile-gold flex items-center justify-center ${
              uiTheme === 'promax' 
                ? 'bg-linear-to-br from-emerald-400 to-teal-600 shadow-emerald-500/20' 
                : 'bg-linear-to-br from-[#B88E4C] to-[#8C6B32]'
            }`}>
              <div className={`w-full h-full rounded-[10px] flex items-center justify-center font-serif font-black text-xl tracking-tighter group-hover:scale-105 transition-transform ${
                uiTheme === 'promax' ? 'bg-[#0A101D] text-emerald-400 font-mono' : 'bg-[#0B291E] text-[#B88E4C]'
              }`}>
                LV
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-lg tracking-wide ${uiTheme === 'promax' ? 'font-mono text-white' : 'font-serif text-[#FAF9F5]'}`}>
                  LEGACYVAULT
                </span>
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                  uiTheme === 'promax' 
                    ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30 font-mono' 
                    : 'bg-[#B88E4C]/20 text-[#B88E4C] border-[#B88E4C]/40'
                }`}>
                  SRS v3.11.0
                </span>
              </div>
              <p className="text-[11px] text-white/70 flex items-center gap-1 font-light">
                <span>Nền tảng Quản trị & Bàn giao Di sản Số Zero-Knowledge</span>
              </p>
            </div>
          </div>

          {/* Center: THEME SWITCHER PILL */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/15 text-xs shadow-inner">
            <button
              type="button"
              onClick={() => onUiThemeChange('evon')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                uiTheme === 'evon'
                  ? 'bg-[#B88E4C] text-[#0B291E] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Phong cách Heritage Classic: Nền ngà ấm, đổ bóng xúc giác, trang trọng theo BLDS 2015"
            >
              <span>🌿 evon:ui-ux</span>
            </button>
            <button
              type="button"
              onClick={() => onUiThemeChange('promax')}
              className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                uiTheme === 'promax'
                  ? 'bg-linear-to-r from-emerald-400 to-teal-400 text-black shadow-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Phong cách Cyber Bento: Nền đen sâu #0F172A, Neon Emerald, Bento Grid hiện đại"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>⚡ ui-ux-pro-max</span>
            </button>
          </div>

          {/* Right Status: DMS Heartbeat & Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end text-xs">
            {/* Live DMS Quick Widget */}
            <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl border shadow-inner ${
              uiTheme === 'promax' ? 'bg-slate-900 border-slate-700' : 'bg-[#10382B] border-[#B88E4C]/20'
            }`}>
              <div className="relative flex items-center justify-center">
                <div className={`w-2.5 h-2.5 rounded-full ${isCheckedInToday ? 'bg-[#059669]' : 'bg-[#D97706]'} animate-pulse-glow`} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/60 font-medium">Nhịp tim DMS:</span>
                <span className="text-[11px] font-bold text-white font-mono">
                  Còn {daysRemaining} ngày
                </span>
              </div>
              <button
                type="button"
                onClick={onCheckIn}
                disabled={isCheckedInToday}
                className={`ml-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  isCheckedInToday
                    ? 'bg-[#059669]/20 text-[#059669] border border-[#059669]/40 cursor-default'
                    : uiTheme === 'promax'
                    ? 'bg-emerald-500 text-black font-bold hover:bg-emerald-400 shadow-xs'
                    : 'bg-[#B88E4C] text-[#0B291E] hover:bg-[#A07839] active:scale-95 shadow-xs'
                }`}
                title={isCheckedInToday ? 'Bạn đã điểm danh hôm nay' : 'Bấm để điểm danh xác nhận sinh tồn'}
              >
                {isCheckedInToday ? (
                  <>
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Đã Điểm Danh</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-3 h-3" />
                    <span>Tôi Còn Sống</span>
                  </>
                )}
              </button>
            </div>

            {/* Role Simulator Dropdown */}
            <div className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 transition-colors">
              <UserCheck className="w-3.5 h-3.5 text-[#B88E4C]" />
              <select
                value={currentRole}
                onChange={(e) => onRoleChange(e.target.value)}
                className="bg-transparent text-white font-medium text-xs border-0 outline-hidden cursor-pointer pr-1"
                aria-label="Chọn vai trò giả lập"
              >
                {roles.map((r) => (
                  <option key={r.value} value={r.value} className="bg-[#0B291E] text-white">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Swagger Link */}
            <a
              href="http://localhost:5000/swagger"
              target="_blank"
              rel="noreferrer"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-colors text-xs"
              title="Mở tài liệu API Backend Swagger"
            >
              <span>API Swagger</span>
              <ExternalLink className="w-3 h-3 text-[#B88E4C]" />
            </a>
          </div>
        </div>

        {/* Bottom Tier: Main Nav Tabs */}
        <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#FAF9F5] text-[#0B291E] shadow-tactile-raised'
                    : 'text-[#FAF9F5]/80 hover:text-[#FAF9F5] hover:bg-white/10'
                }`}
              >
                <span className={isActive ? 'text-[#0B291E]' : 'text-[#FAF9F5]/70'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold uppercase ${
                    isActive ? 'bg-[#D97706] text-white' : 'bg-[#D97706]/30 text-[#FAF9F5] border border-[#D97706]/50'
                  }`}>
                    {item.badge}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-[#B88E4C] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
