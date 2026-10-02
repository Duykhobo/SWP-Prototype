/**
 * @file ProMaxDashboardPage.tsx
 * @description Màn hình Dashboard theo trường phái ui-ux-pro-max (Bento Box Grid, Cyber Dark Navy, Emerald Neon, Glassmorphism)
 */

import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  HardDrive, 
  FolderLock, 
  Users, 
  Plus, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  FileKey, 
  Sparkles,
  ExternalLink,
  ChevronRight,
  Terminal,
  Cpu,
  Zap,
  Layers,
  Key
} from 'lucide-react';
import type { AssetItem } from '@/components/modals/NewAssetModal';

interface ProMaxDashboardPageProps {
  daysRemaining: number;
  onCheckIn: () => void;
  isCheckedInToday: boolean;
  onOpenNewAssetModal: () => void;
  assets: AssetItem[];
  currentPlan: string;
}

export const ProMaxDashboardPage: React.FC<ProMaxDashboardPageProps> = ({
  daysRemaining,
  onCheckIn,
  isCheckedInToday,
  onOpenNewAssetModal,
  assets,
  currentPlan,
}) => {
  return (
    <div className="space-y-6 text-slate-100 font-sans animate-fadeIn">
      {/* 1. TOP BENTO ROW: HERO CYBER HUD + REALTIME PULSE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Bento 1: Cryptographic Live HUD (8 cols) */}
        <div className="lg:col-span-8 bg-[#131C2E]/90 backdrop-blur-md border border-slate-700/60 rounded-3xl p-6 shadow-2xl relative overflow-hidden group hover:border-emerald-500/50 transition-all duration-300">
          {/* Neon Glow backdrop */}
          <div className="absolute -top-24 -left-24 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  DMS PULSE ACTIVE • PROTOCOL v3.11
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
                Zero-Knowledge Vault Guard
              </h1>
              
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
                Hệ thống giám sát sinh tồn phân tán với cơ chế phục hồi Shamir SSS 2/3. Chu kỳ điểm danh 30 ngày & cửa sổ ân hạn 7 ngày.
              </p>
            </div>

            {/* Countdown Badge & Check-in Button */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#0A101D]/80 p-4 rounded-2xl border border-slate-700/80 shadow-inner">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono text-slate-400 font-semibold tracking-wider">
                  Thời Gian Sinh Tồn
                </span>
                <div className="text-2xl font-mono font-bold text-emerald-400 flex items-baseline gap-1">
                  <span>{daysRemaining}D</span>
                  <span className="text-slate-500 text-sm">:</span>
                  <span className="text-white">14H</span>
                  <span className="text-slate-500 text-sm">:</span>
                  <span className="text-slate-400 text-xs">32M</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onCheckIn}
                disabled={isCheckedInToday}
                className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                  isCheckedInToday
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black shadow-emerald-500/20'
                }`}
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>{isCheckedInToday ? 'ĐÃ ĐIỂM DANH' : 'TÔI CÒN SỐNG'}</span>
              </button>
            </div>
          </div>

          {/* Real-time Crypto Specs Bar */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">ENVELOPE CIPHER</span>
              <span className="text-slate-300 font-semibold">AES-256-GCM + IV</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">SHAMIR THRESHOLD</span>
              <span className="text-emerald-400 font-semibold">2 of 3 Shares</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">STORAGE BACKEND</span>
              <span className="text-cyan-400 font-semibold">Cloudflare R2 Priv</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">RESCUE TIMELOCK</span>
              <span className="text-amber-400 font-semibold">7 Days Freeze</span>
            </div>
          </div>
        </div>

        {/* Bento 2: Quick Status & Tier (4 cols) */}
        <div className="lg:col-span-4 bg-[#131C2E]/90 backdrop-blur-md border border-slate-700/60 rounded-3xl p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden hover:border-cyan-500/50 transition-all duration-300">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>SECURITY LEVEL</span>
              </span>
              <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-bold">
                MIL-SPEC
              </span>
            </div>

            <div className="bg-[#0A101D]/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">Gói dịch vụ:</span>
                <span className="text-white font-bold">{currentPlan}</span>
              </div>
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-400">R2 Private Quota:</span>
                <span className="text-emerald-400 font-bold">42.5 / 200 MiB</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-linear-to-r from-emerald-500 to-cyan-500 h-full rounded-full" style={{ width: '21.25%' }} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={onOpenNewAssetModal}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white rounded-xl font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-md"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>MÃ HÓA TÀI SẢN MỚI</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. BENTO METRICS GRID (4 CARDS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'ENCRYPTED ASSETS',
            value: assets.length,
            unit: 'items',
            trend: '+2 tệp tuần này',
            icon: <Lock className="w-5 h-5 text-emerald-400" />,
            borderHover: 'hover:border-emerald-500/50',
          },
          {
            title: 'HANDOVER VAULTS',
            value: 3,
            unit: 'vaults',
            trend: '2 Single • 1 Co-Owned',
            icon: <FolderLock className="w-5 h-5 text-cyan-400" />,
            borderHover: 'hover:border-cyan-500/50',
          },
          {
            title: 'VERIFIED RECIPIENTS',
            value: 4,
            unit: 'beneficiaries',
            trend: '100% eKYC Verified',
            icon: <Users className="w-5 h-5 text-purple-400" />,
            borderHover: 'hover:border-purple-500/50',
          },
          {
            title: 'SHAMIR INTEGRITY',
            value: '2/3',
            unit: 'Threshold',
            trend: 'Zero Leakage Guarantee',
            icon: <Key className="w-5 h-5 text-amber-400" />,
            borderHover: 'hover:border-amber-500/50',
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className={`bg-[#131C2E]/80 backdrop-blur-xs border border-slate-700/60 rounded-2xl p-5 shadow-xl transition-all duration-300 ${card.borderHover}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                {card.title}
              </span>
              <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center">
                {card.icon}
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-mono font-bold text-white tracking-tight">
                {card.value}
              </span>
              <span className="text-xs text-slate-400 font-mono">{card.unit}</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{card.trend}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 3. BENTO ASSETS & AUDIT SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Handover Vaults Bento (7 cols) */}
        <div className="lg:col-span-7 bg-[#131C2E]/80 border border-slate-700/60 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FolderLock className="w-4 h-4 text-emerald-400" />
                <span>Gom Kho Di Sản Số (SRS v3.11.0 Bundling)</span>
              </h2>
              <p className="text-xs text-slate-400">
                Tự động gom nhóm quyền hạn theo cơ chế giải mã đồng thuận
              </p>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">
              3 KHO HOẠT ĐỘNG
            </span>
          </div>

          <div className="space-y-3">
            {[
              {
                name: 'Kho Ví Lạnh & Private Keys',
                type: 'SINGLE_RECIPIENT',
                typeBadge: 'KHO MỘT NGƯỜI',
                recipients: 'con-gai.lethi@gmail.com',
                items: '4 tài sản (Ledger, Metamask, Mật khẩu két)',
                status: 'SEALED • R2 PRIVATE',
              },
              {
                name: 'Kho Di Sản Gia Đình & Bất Động Sản',
                type: 'CO_OWNED',
                typeBadge: 'KHO ĐỒNG SỞ HỮU (100% ĐỒNG THUẬN)',
                recipients: '3 người (Vợ & 2 con)',
                items: 'Bản scan Giấy chứng nhận quyền sử dụng đất',
                status: 'SHAMIR SSS 2/3',
              },
            ].map((vault, i) => (
              <div
                key={i}
                className="bg-[#0A101D]/70 p-4 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{vault.name}</span>
                    <span className="text-[9px] font-mono px-2 py-0.2 rounded-md bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {vault.typeBadge}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] font-mono">
                    Người thụ hưởng: <span className="text-slate-200">{vault.recipients}</span>
                  </p>
                  <p className="text-slate-500 text-[10px]">{vault.items}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-emerald-400 font-bold block">
                    {vault.status}
                  </span>
                  <span className="text-[10px] text-slate-400">Ready for Handover</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Crypto Terminal Audit Trail (5 cols) */}
        <div className="lg:col-span-5 bg-[#0A101D] border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between font-mono text-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-slate-300">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-xs uppercase">Cryptographic Audit Feed</span>
              </div>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                LIVE
              </span>
            </div>

            <div className="space-y-2.5 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>[08:12:45] DMS_HEARTBEAT_ACK</span>
                  <span className="text-emerald-400">SUCCESS</span>
                </div>
                <p className="text-slate-300">Owner signature verified. TimeLock reset to 30 days.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>[YESTERDAY] AES_ENVELOPE_SEAL</span>
                  <span className="text-cyan-400">DEK_GENERATED</span>
                </div>
                <p className="text-slate-300">File "Ledger_Seed.enc" uploaded to Cloudflare R2 bucket.</p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400 text-[10px]">
                  <span>[2 DAYS AGO] SHAMIR_SPLIT_2_OF_3</span>
                  <span className="text-amber-400">ANTI_ROGUE</span>
                </div>
                <p className="text-slate-300">3 shares generated. Server holds 1 share (0-bit leakage).</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-[10px] text-slate-500 flex justify-between">
            <span>CHAIN_HASH: 0x8f4c2e...3f2a</span>
            <span>VERIFIED ZERO-KNOWLEDGE</span>
          </div>
        </div>
      </div>
    </div>
  );
};
