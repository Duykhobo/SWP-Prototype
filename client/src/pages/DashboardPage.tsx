/**
 * @file DashboardPage.tsx
 * @description Trang Tổng quan Chủ Kho Di Sản (Owner Vault Dashboard) theo chuẩn SRS v3.11.0 & Heritage Design System
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
  ChevronRight
} from 'lucide-react';
import type { AssetItem } from '@/entities/asset';

interface DashboardPageProps {
  daysRemaining: number;
  onCheckIn: () => void;
  isCheckedInToday: boolean;
  onOpenNewAssetModal: () => void;
  onNavigateTab: (tab: 'dashboard' | 'vaults' | 'recipient' | 'pricing' | 'testbench') => void;
  assets: AssetItem[];
  currentPlan: string;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  daysRemaining,
  onCheckIn,
  isCheckedInToday,
  onOpenNewAssetModal,
  onNavigateTab,
  assets,
  currentPlan,
}) => {
  // Pre-calculated stats
  const totalAssetsCount = assets.length;
  const singleRecipientVaultsCount = assets.filter(a => a.vaultType === 'SINGLE_RECIPIENT').length;
  const coOwnedVaultsCount = assets.filter(a => a.vaultType === 'CO_OWNED').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. HERO SECTION: LIVE DEAD MAN'S SWITCH (DMS) & LEGAL NOTICE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* DMS Pulse Card (Spans 2 cols) */}
        <div className="lg:col-span-2 bg-[#FAF9F5] border-l-4 border-l-[#059669] border-y border-r border-[#DCD9D0] rounded-2xl p-6 shadow-tactile-raised relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Pulse Animated Circle */}
              <div className="relative w-14 h-14 rounded-2xl bg-[#E5EDE8] flex items-center justify-center border border-[#0B291E]/20 shrink-0">
                <div className={`w-4 h-4 rounded-full ${isCheckedInToday ? 'bg-[#059669]' : 'bg-[#D97706]'} animate-pulse-glow`} />
                <Activity className="w-7 h-7 text-[#0B291E] absolute" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base text-[#0B291E]">
                    Dead Man's Switch (DMS) · Nhịp Điểm Danh Sinh Tồn
                  </span>
                  <span className="bg-[#059669]/10 text-[#059669] border border-[#059669]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                    Đang Hoạt Động
                  </span>
                </div>
                <p className="text-xs text-[#66786E] mt-0.5">
                  Chu kỳ kiểm tra định kỳ: <strong>30 ngày</strong> · Thời gian ân hạn cứu hộ (Rescue TimeLock): <strong>7 ngày</strong>
                </p>
              </div>
            </div>

            {/* Countdown & Quick Action */}
            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <div className="text-right">
                <span className="text-[10px] text-[#66786E] uppercase font-bold tracking-wider block">
                  Thời Gian Còn Lại
                </span>
                <span className="text-xl font-bold font-serif text-[#0B291E]">
                  {daysRemaining} Ngày : 14 Giờ
                </span>
              </div>
              <button
                type="button"
                onClick={onCheckIn}
                disabled={isCheckedInToday}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-tactile-raised flex items-center gap-1.5 cursor-pointer ${
                  isCheckedInToday
                    ? 'bg-[#E5EDE8] text-[#059669] border border-[#059669]/30 cursor-default'
                    : 'bg-[#0B291E] text-[#FAF9F5] hover:bg-[#133E2F] active:scale-95'
                }`}
              >
                {isCheckedInToday ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                    <span>Đã Điểm Danh</span>
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4 text-[#B88E4C]" />
                    <span>Tôi Còn Sống (Check-in)</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sub-bar with Law reference */}
          <div className="mt-5 pt-4 border-t border-[#DCD9D0] flex flex-wrap items-center justify-between text-[11px] text-[#66786E] gap-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#059669]" />
              <span>Chống kích hoạt nhầm: Người thừa hành chỉ được cấp quyền sau khi đối soát Giấy chứng tử số và vượt qua thời gian ân hạn 7 ngày.</span>
            </span>
            <span className="text-[#0B291E] font-medium font-mono text-[10px]">
              BLDS 2015 (Điều 624)
            </span>
          </div>
        </div>

        {/* Legal & Compliance Banner (1 col) */}
        <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-tactile-raised flex flex-col justify-between">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B291E] flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#B88E4C]" />
                <span>Quy Chuẩn Pháp Lý Số</span>
              </span>
              <span className="text-[10px] text-[#A07839] bg-[#FBF7EE] border border-[#E8DCC6] px-2 py-0.5 rounded-full font-semibold">
                Luật 20/2023/QH15
              </span>
            </div>
            <p className="text-xs text-[#66786E] leading-relaxed">
              Thông điệp dữ liệu và chứng thư di sản số niêm phong tại LegacyVault có giá trị chứng cứ điện tử theo Điều 95 BLTTDS 2015.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCD9D0] flex items-center justify-between text-xs">
            <span className="text-[#66786E] text-[11px]">Gói cước hiện tại:</span>
            <span className="font-bold text-[#0B291E] bg-[#E5EDE8] px-2.5 py-0.5 rounded-md text-[11px] border border-[#0B291E]/20">
              {currentPlan}
            </span>
          </div>
        </div>
      </div>

      {/* 2. FOUR TACTILE METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Assets */}
        <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-tactile-raised hover:border-[#B88E4C]/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66786E]">Tổng Di Sản Niêm Phong</span>
            <div className="w-8 h-8 rounded-xl bg-[#E5EDE8] flex items-center justify-center text-[#0B291E]">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-[#0B291E]">{totalAssetsCount}</span>
            <span className="text-xs text-[#66786E]">tài sản số</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-[#059669]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mã hóa AES-256-GCM 100%</span>
          </div>
        </div>

        {/* Card 2: Vault Storage */}
        <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-tactile-raised hover:border-[#B88E4C]/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66786E]">Dung Lượng R2 Sử Dụng</span>
            <div className="w-8 h-8 rounded-xl bg-[#FBF7EE] flex items-center justify-center text-[#B88E4C] border border-[#E8DCC6]">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-[#0B291E]">42.5</span>
            <span className="text-xs text-[#66786E]">/ 200 MiB</span>
          </div>
          <div className="mt-2 w-full bg-[#DCD9D0] h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#B88E4C] h-full rounded-full" style={{ width: '21.25%' }} />
          </div>
        </div>

        {/* Card 3: Handover Vaults */}
        <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-tactile-raised hover:border-[#B88E4C]/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66786E]">Kho Bàn Giao Thiết Lập</span>
            <div className="w-8 h-8 rounded-xl bg-[#E5EDE8] flex items-center justify-center text-[#0B291E]">
              <FolderLock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-[#0B291E]">
              {singleRecipientVaultsCount + coOwnedVaultsCount}
            </span>
            <span className="text-xs text-[#66786E]">kho phân loại</span>
          </div>
          <div className="mt-2 text-[11px] text-[#66786E] flex items-center gap-1.5">
            <span className="font-semibold text-[#0B291E]">{singleRecipientVaultsCount} Một Người</span>
            <span>•</span>
            <span className="font-semibold text-[#0B291E]">{coOwnedVaultsCount} Đồng Sở Hữu</span>
          </div>
        </div>

        {/* Card 4: Recipients */}
        <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-tactile-raised hover:border-[#B88E4C]/60 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#66786E]">Người Thụ Hưởng Chỉ Định</span>
            <div className="w-8 h-8 rounded-xl bg-[#E5EDE8] flex items-center justify-center text-[#0B291E]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-serif text-[#0B291E]">4</span>
            <span className="text-xs text-[#66786E]">người nhận</span>
          </div>
          <div className="mt-2 text-[11px] text-[#059669] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Đã xác thực email & PIN</span>
          </div>
        </div>
      </div>

      {/* 3. QUICK ACTIONS BAR */}
      <div className="bg-[#EFECE6] p-4 rounded-2xl border border-[#DCD9D0] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-[#0B291E]">Thao Tác Nhanh:</span>
          <span className="text-xs text-[#66786E]">Lưu trữ mới hoặc quản lý quy chế thừa kế số</span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onOpenNewAssetModal}
            className="px-4 py-2 bg-[#0B291E] hover:bg-[#133E2F] text-[#FAF9F5] rounded-xl text-xs font-bold transition-all shadow-tactile-raised flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#B88E4C]" />
            <span>Niêm Phong Tài Sản Mới</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('vaults')}
            className="px-3.5 py-2 bg-[#FAF9F5] hover:bg-white text-[#0B291E] border border-[#DCD9D0] rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <FolderLock className="w-4 h-4 text-[#B88E4C]" />
            <span>Quản Lý Gom Kho</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('recipient')}
            className="px-3.5 py-2 bg-[#FBF7EE] hover:bg-[#F4ECE1] text-[#7D5D28] border border-[#E8DCC6] rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#B88E4C]" />
            <span>Cổng Tiếp Nhận Di Sản (Demo 7 Ngày)</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('pricing')}
            className="px-3.5 py-2 bg-[#FAF9F5] hover:bg-white text-[#0B291E] border border-[#DCD9D0] rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>Nâng Cấp Gói Cước</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#B88E4C]" />
          </button>
        </div>
      </div>

      {/* 4. RECENT HANDOVER VAULTS DISPLAY (SRS v3.11.0 GOM KHO) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-serif font-bold text-[#0B291E]">
              Danh Mục Kho Bàn Giao Di Sản (SRS v3.11.0)
            </h2>
            <p className="text-xs text-[#66786E]">
              Hệ thống tự động gom nhóm di sản theo người nhận hoặc điều kiện đồng thuận pháp lý
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('vaults')}
            className="text-xs font-bold text-[#B88E4C] hover:text-[#A07839] flex items-center gap-1 cursor-pointer"
          >
            <span>Xem tất cả kho ({singleRecipientVaultsCount + coOwnedVaultsCount})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Vault Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Vault 1: Crypto Vault (Single Recipient) */}
          <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-tactile-raised space-y-4 flex flex-col justify-between hover:border-[#B88E4C]/50 transition-colors">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E5EDE8] flex items-center justify-center text-[#0B291E]">
                    <FileKey className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#0B291E]">
                      Kho Ví Lạnh & Mật Mã Số
                    </h3>
                    <span className="text-[10px] text-[#66786E]">
                      Mã kho: VK-SINGLE-0892
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#E5EDE8] text-[#0B291E] border border-[#0B291E]/20 px-2 py-0.5 rounded-full">
                  Kho Một Người
                </span>
              </div>

              <p className="text-xs text-[#66786E]">
                Chỉ định toàn quyền 1 bản sao toàn vẹn cho 1 người thụ hưởng duy nhất sau khi hoàn tất xác minh chứng tử số.
              </p>

              <div className="bg-[#EFECE6]/60 p-2.5 rounded-xl border border-[#DCD9D0] text-xs space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#66786E]">Người nhận:</span>
                  <span className="font-semibold text-[#0B291E]">con-gai.lethi@gmail.com</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#66786E]">Tài sản đính kèm:</span>
                  <span className="font-bold text-[#0B291E]">4 mục (Seed phrase, Ledger, Ví Metamask)</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DCD9D0] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#059669] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Đã Niêm Phong AES-256-GCM</span>
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab('vaults')}
                className="text-[11px] font-bold text-[#0B291E] hover:text-[#B88E4C] cursor-pointer"
              >
                Chi tiết →
              </button>
            </div>
          </div>

          {/* Vault 2: Family Secrets & Real Estate (Co-Owned) */}
          <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-tactile-raised space-y-4 flex flex-col justify-between hover:border-[#B88E4C]/50 transition-colors">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#FBF7EE] border border-[#E8DCC6] flex items-center justify-center text-[#B88E4C]">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#0B291E]">
                      Kho Di Sản Gia Đình & Nhà Đất
                    </h3>
                    <span className="text-[10px] text-[#66786E]">
                      Mã kho: VK-COOWN-4412
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#FBF7EE] text-[#7D5D28] border border-[#E8DCC6] px-2 py-0.5 rounded-full">
                  Kho Đồng Sở Hữu
                </span>
              </div>

              <p className="text-xs text-[#66786E]">
                Yêu cầu 100% người thụ hưởng cùng xác nhận đồng thuận mới cấp quyền giải mã tài sản.
              </p>

              <div className="bg-[#EFECE6]/60 p-2.5 rounded-xl border border-[#DCD9D0] text-xs space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#66786E]">Người cùng sở hữu:</span>
                  <span className="font-semibold text-[#0B291E]">3 người nhận (Vợ & 2 con)</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#66786E]">Điều kiện mở:</span>
                  <span className="font-bold text-[#D97706]">Đồng thuận 3/3 chữ ký số</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DCD9D0] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#059669] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Khóa phân mảnh Shamir 2/3</span>
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab('vaults')}
                className="text-[11px] font-bold text-[#0B291E] hover:text-[#B88E4C] cursor-pointer"
              >
                Chi tiết →
              </button>
            </div>
          </div>

          {/* Vault 3: Business Documents */}
          <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-tactile-raised space-y-4 flex flex-col justify-between hover:border-[#B88E4C]/50 transition-colors">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E5EDE8] flex items-center justify-center text-[#0B291E]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#0B291E]">
                      Hợp Đồng Cổ Phần Doanh Nghiệp
                    </h3>
                    <span className="text-[10px] text-[#66786E]">
                      Mã kho: VK-SINGLE-1092
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-[#E5EDE8] text-[#0B291E] border border-[#0B291E]/20 px-2 py-0.5 rounded-full">
                  Kho Một Người
                </span>
              </div>

              <p className="text-xs text-[#66786E]">
                Chỉ định Người thừa hành đặc quyền tiếp quản vận hành và giải mã tài liệu bí mật thương mại.
              </p>

              <div className="bg-[#EFECE6]/60 p-2.5 rounded-xl border border-[#DCD9D0] text-xs space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#66786E]">Người nhận:</span>
                  <span className="font-semibold text-[#0B291E]">luatsu.hoangnam@lex.vn</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#66786E]">Hạn tiếp nhận:</span>
                  <span className="font-bold text-[#0B291E]">Cửa sổ 7 ngày + Đóng băng 2 năm</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#DCD9D0] flex items-center justify-between text-xs">
              <span className="text-[10px] text-[#059669] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>R2 Cloudflare Private</span>
              </span>
              <button
                type="button"
                onClick={() => onNavigateTab('vaults')}
                className="text-[11px] font-bold text-[#0B291E] hover:text-[#B88E4C] cursor-pointer"
              >
                Chi tiết →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. TAMPER-PROOF AUDIT TRAIL */}
      <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-6 shadow-tactile-raised space-y-4">
        <div className="flex items-center justify-between border-b border-[#DCD9D0] pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#B88E4C]" />
            <h3 className="font-serif font-bold text-sm text-[#0B291E]">
              Nhật Ký Bảo Chứng Mật Mã Toàn Vẹn (Tamper-Proof Audit Trail)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#66786E]">
            Mã định danh sổ cái: SHA256-LEAD-CHAIN-991A
          </span>
        </div>

        <div className="space-y-3">
          {[
            {
              event: 'Điểm danh Dead Man\'s Switch (DMS)',
              desc: 'Chủ sở hữu xác nhận nhịp sống thành công. Gia hạn chu kỳ 30 ngày.',
              time: '08:12:45 Hôm nay',
              badge: 'DMS Pulse',
              statusColor: 'text-[#059669]',
            },
            {
              event: 'Mã hóa phong bì tệp tin mới (AES-256-GCM)',
              desc: 'Tệp "Ledger_Nano_X_Seed.enc" sinh DEK độc lập và lưu trữ trên Cloudflare R2.',
              time: 'Hôm qua 15:30',
              badge: 'R2 Encrypted',
              statusColor: 'text-[#0B291E]',
            },
            {
              event: 'Phân mảnh khóa Shamir SSS 2/3 hoàn tất',
              desc: 'Tạo 3 mảnh khóa Shamir. Server chỉ lưu giữ 1 mảnh (0-bit thông tin khóa gốc).',
              time: '2 ngày trước',
              badge: 'Anti-Rogue Admin',
              statusColor: 'text-[#7D5D28]',
            },
          ].map((item, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-[#EFECE6]/50 border border-[#DCD9D0]/80 gap-2 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#B88E4C] mt-1.5 shrink-0" />
                <div>
                  <span className="font-bold text-[#0B291E] block">{item.event}</span>
                  <span className="text-[#66786E] text-[11px]">{item.desc}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                <span className="text-[10px] bg-white border border-[#DCD9D0] px-2 py-0.5 rounded font-mono text-[#66786E]">
                  {item.badge}
                </span>
                <span className="text-[11px] text-[#66786E] font-medium">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
