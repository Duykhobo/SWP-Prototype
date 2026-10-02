/**
 * @file ComparisonView.tsx
 * @description Màn hình So Sánh Chuyên Sâu 2 Bộ Skill UI/UX: evon:ui-ux vs ui-ux-pro-max
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Layers, 
  Check, 
  Cpu, 
  ShieldCheck, 
  Split, 
  Eye, 
  Scale, 
  Award,
  ChevronRight,
  Zap,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProMaxDashboardPage } from '@/pages/promax/ProMaxDashboardPage';
import type { AssetItem } from '@/components/modals/NewAssetModal';

interface ComparisonViewProps {
  daysRemaining: number;
  onCheckIn: () => void;
  isCheckedInToday: boolean;
  onOpenNewAssetModal: () => void;
  assets: AssetItem[];
  currentPlan: string;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  daysRemaining,
  onCheckIn,
  isCheckedInToday,
  onOpenNewAssetModal,
  assets,
  currentPlan,
}) => {
  const [splitMode, setSplitMode] = useState<'SIDE_BY_SIDE' | 'EVON_ONLY' | 'PROMAX_ONLY'>('SIDE_BY_SIDE');

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. TOP HEADER & SWITCHER */}
      <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-6 shadow-tactile-raised space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#B88E4C]/20 text-[#A07839] border border-[#B88E4C]/40 px-2.5 py-0.5 rounded-full">
                UI/UX BENCHMARK
              </span>
              <h1 className="font-serif font-bold text-xl text-[#0B291E]">
                So Sánh 2 Trường Phái Giao Diện: evon:ui-ux vs ui-ux-pro-max
              </h1>
            </div>
            <p className="text-xs text-[#66786E] max-w-3xl">
              Đối chiếu trực quan giữa phong cách <strong>Heritage Classic (Giấy Ấm & Xúc Giác Pháp Lý)</strong> từ <code>evon:ui-ux</code> và phong cách <strong>Cyber-Vault Bento (Dark Mode Mật Mã)</strong> từ <code>ui-ux-pro-max</code>.
            </p>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center bg-[#EFECE6] p-1 rounded-xl border border-[#DCD9D0] shrink-0 self-start md:self-auto text-xs">
            <button
              type="button"
              onClick={() => setSplitMode('SIDE_BY_SIDE')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                splitMode === 'SIDE_BY_SIDE'
                  ? 'bg-[#0B291E] text-white shadow-xs'
                  : 'text-[#66786E] hover:text-[#0B291E]'
              }`}
            >
              <Split className="w-3.5 h-3.5 text-[#B88E4C]" />
              <span>Xem Song Song (Split)</span>
            </button>

            <button
              type="button"
              onClick={() => setSplitMode('EVON_ONLY')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                splitMode === 'EVON_ONLY'
                  ? 'bg-[#0B291E] text-white shadow-xs'
                  : 'text-[#66786E] hover:text-[#0B291E]'
              }`}
            >
              <span>evon:ui-ux</span>
            </button>

            <button
              type="button"
              onClick={() => setSplitMode('PROMAX_ONLY')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                splitMode === 'PROMAX_ONLY'
                  ? 'bg-[#1E3A5F] text-white shadow-xs'
                  : 'text-[#66786E] hover:text-[#0B291E]'
              }`}
            >
              <span>ui-ux-pro-max</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. LIVE INTERACTIVE SPLIT / PREVIEW */}
      <div className="space-y-4">
        {splitMode === 'SIDE_BY_SIDE' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            {/* Left: evon:ui-ux preview */}
            <div className="border-2 border-[#B88E4C] rounded-3xl p-4 bg-[#EFECE6] shadow-tactile-raised space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCD9D0]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#0B291E] text-[#B88E4C] flex items-center justify-center font-serif text-xs font-bold">
                    E
                  </div>
                  <div>
                    <span className="font-serif font-bold text-xs text-[#0B291E] block">
                      1. evon:ui-ux (Heritage Paper & Pháp Lý)
                    </span>
                    <span className="text-[10px] text-[#66786E]">
                      Canvas ngà ấm • Forest Green • Đổ bóng xúc giác • Tôn vinh tính pháp lý
                    </span>
                  </div>
                </div>
                <span className="text-[9px] bg-[#E5EDE8] text-[#0B291E] font-bold px-2 py-0.5 rounded-full border border-[#0B291E]/20">
                  BLDS 2015
                </span>
              </div>

              {/* Render Evon Dashboard inside scrollable preview */}
              <div className="max-h-[700px] overflow-y-auto pr-1 rounded-2xl scrollbar-thin">
                <DashboardPage
                  daysRemaining={daysRemaining}
                  onCheckIn={onCheckIn}
                  isCheckedInToday={isCheckedInToday}
                  onOpenNewAssetModal={onOpenNewAssetModal}
                  onNavigateTab={() => {}}
                  assets={assets}
                  currentPlan={currentPlan}
                />
              </div>
            </div>

            {/* Right: ui-ux-pro-max preview */}
            <div className="border-2 border-emerald-500/80 rounded-3xl p-4 bg-[#0F172A] shadow-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500 text-black flex items-center justify-center font-mono text-xs font-bold">
                    P
                  </div>
                  <div>
                    <span className="font-bold text-xs text-white block flex items-center gap-1.5">
                      <span>2. ui-ux-pro-max (Cyber Bento & Dark Fintech)</span>
                      <Zap className="w-3 h-3 text-emerald-400" />
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Bento Grid • Cyber Navy #0F172A • Emerald Neon • Cảm giác Crypto Vault
                    </span>
                  </div>
                </div>
                <span className="text-[9px] bg-emerald-950 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ZERO-KNOWLEDGE
                </span>
              </div>

              {/* Render ProMax Dashboard inside scrollable preview */}
              <div className="max-h-[700px] overflow-y-auto pr-1 rounded-2xl scrollbar-thin">
                <ProMaxDashboardPage
                  daysRemaining={daysRemaining}
                  onCheckIn={onCheckIn}
                  isCheckedInToday={isCheckedInToday}
                  onOpenNewAssetModal={onOpenNewAssetModal}
                  assets={assets}
                  currentPlan={currentPlan}
                />
              </div>
            </div>
          </div>
        )}

        {splitMode === 'EVON_ONLY' && (
          <div className="border-2 border-[#B88E4C] rounded-3xl p-6 bg-[#EFECE6] shadow-tactile-raised space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-[#DCD9D0]">
              <span className="font-serif font-bold text-sm text-[#0B291E]">
                Bản Dựng Đầy Đủ: evon:ui-ux (Heritage Classic & Legal Warm Paper)
              </span>
              <span className="text-xs text-[#66786E]">Phong cách trang trọng, chuẩn mực Bộ luật Dân sự 2015</span>
            </div>
            <DashboardPage
              daysRemaining={daysRemaining}
              onCheckIn={onCheckIn}
              isCheckedInToday={isCheckedInToday}
              onOpenNewAssetModal={onOpenNewAssetModal}
              onNavigateTab={() => {}}
              assets={assets}
              currentPlan={currentPlan}
            />
          </div>
        )}

        {splitMode === 'PROMAX_ONLY' && (
          <div className="border-2 border-emerald-500 rounded-3xl p-6 bg-[#0F172A] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <span className="font-mono font-bold text-sm text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Bản Dựng Đầy Đủ: ui-ux-pro-max (Cyber Bento Grid & Modern Dark Fintech)</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">Bảo mật mật mã tối tân cấp độ quân sự</span>
            </div>
            <ProMaxDashboardPage
              daysRemaining={daysRemaining}
              onCheckIn={onCheckIn}
              isCheckedInToday={isCheckedInToday}
              onOpenNewAssetModal={onOpenNewAssetModal}
              assets={assets}
              currentPlan={currentPlan}
            />
          </div>
        )}
      </div>

      {/* 3. DETAILED COMPARISON MATRIX TABLE */}
      <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-6 shadow-tactile-raised space-y-5">
        <div className="flex items-center gap-2 border-b border-[#DCD9D0] pb-3">
          <Scale className="w-5 h-5 text-[#B88E4C]" />
          <h2 className="font-serif font-bold text-base text-[#0B291E]">
            Bảng Đối Chiếu Chi Tiết 6 Tiêu Chí Thiết Kế
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-[#DCD9D0] bg-[#EFECE6]/60">
                <th className="py-3 px-4 font-bold text-[#0B291E] w-1/5">Tiêu Chí</th>
                <th className="py-3 px-4 font-bold text-[#0B291E] w-2/5 border-x border-[#DCD9D0]">
                  🌿 Bộ 1: evon:ui-ux (evondevKit)
                </th>
                <th className="py-3 px-4 font-bold text-[#1E3A5F] w-2/5">
                  ⚡ Bộ 2: ui-ux-pro-max (NextLevelBuilder)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD9D0]">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#14241C] bg-[#FAF9F5]">
                  1. Triết Lý & Gu Thẩm Mỹ
                </td>
                <td className="py-3.5 px-4 text-[#14241C] border-x border-[#DCD9D0] bg-[#FAF9F5]">
                  <strong>"Làm như một designer":</strong> Hạn chế tối đa "mùi AI", chú trọng tính xúc giác, đường nét mỏng tinh tế, tạo cảm giác một văn bản ủy thác di sản trang nghiêm.
                </td>
                <td className="py-3.5 px-4 text-[#14241C] bg-[#FAF9F5]">
                  <strong>"Swiss Minimalism & Cyber Intelligence":</strong> Tối ưu hóa cấu trúc dữ liệu mật mã, cảm giác công nghệ tương lai chuẩn Thung lũng Silicon, hiện đại và bảo mật cao.
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#14241C] bg-[#FAF9F5]">
                  2. Bảng Màu & Ánh Sáng
                </td>
                <td className="py-3.5 px-4 text-[#14241C] border-x border-[#DCD9D0] bg-[#FAF9F5]">
                  • Nền: Giấy Canvas ngà ấm (<code>#EFECE6</code>)<br />
                  • Bề mặt: Ngà thanh lịch (<code>#FAF9F5</code>)<br />
                  • Nhấn: Xanh Heritage Forest (<code>#0B291E</code>) + Vàng Champagne (<code>#B88E4C</code>)
                </td>
                <td className="py-3.5 px-4 text-[#14241C] bg-[#FAF9F5]">
                  • Nền: Cyber Navy Dark (<code>#0F172A</code>)<br />
                  • Thẻ: Kính mờ Slate (<code>#131C2E</code>)<br />
                  • Nhấn: Neon Emerald (<code>#10B981</code>) + Cyan Glow (<code>#06B6D4</code>)
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#14241C] bg-[#FAF9F5]">
                  3. Bố Cục Không Gian (Layout)
                </td>
                <td className="py-3.5 px-4 text-[#14241C] border-x border-[#DCD9D0] bg-[#FAF9F5]">
                  Đường tóc phẳng (Hairline 1px), nhịp thở rộng rãi, phân đoạn rõ ràng bằng độ tương phản nền và bóng xúc giác (Raised & Inset layers).
                </td>
                <td className="py-3.5 px-4 text-[#14241C] bg-[#FAF9F5]">
                  <strong>Bento Box Grid</strong> bất đối xứng (Apple-style), đa tỷ lệ modul (1x1, 2x1, 2x2), mật độ thông tin cao, Terminal HUD giám sát thời gian thực.
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#14241C] bg-[#FAF9F5]">
                  4. Tâm Lý Học Người Dùng
                </td>
                <td className="py-3.5 px-4 text-[#14241C] border-x border-[#DCD9D0] bg-[#FAF9F5]">
                  Mang lại cảm giác <strong>an tâm, trang trọng, gần gũi</strong> cho việc lập di chúc và bàn giao tài sản gia đình, tuân thủ Bộ luật Dân sự 2015.
                </td>
                <td className="py-3.5 px-4 text-[#14241C] bg-[#FAF9F5]">
                  Tạo sự <strong>ấn tượng mạnh mẽ về năng lực bảo mật</strong>, khiến người dùng tin tưởng vào độ bất khả xâm phạm của mật mã phân mảnh Shamir SSS.
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#14241C] bg-[#FAF9F5]">
                  5. Đối Tượng Người Dùng Hợp Nhất
                </td>
                <td className="py-3.5 px-4 text-[#14241C] border-x border-[#DCD9D0] bg-[#FAF9F5]">
                  Người trung niên, người có gia đình, luật sư, chuyên viên thẩm định pháp lý công chứng.
                </td>
                <td className="py-3.5 px-4 text-[#14241C] bg-[#FAF9F5]">
                  Nhà đầu tư Web3/Crypto, lập trình viên, kỹ sư công nghệ, nhà sáng lập startup.
                </td>
              </tr>

              <tr>
                <td className="py-3.5 px-4 font-semibold text-[#14241C] bg-[#FAF9F5]">
                  6. Đánh Giá Khuyên Dùng Cho Dự Án
                </td>
                <td className="py-3.5 px-4 text-[#14241C] border-x border-[#DCD9D0] bg-[#FAF9F5]">
                  <span className="font-bold text-[#059669]">🌟 Khuyên dùng cho Cổng Portal Người Dùng & Người Thụ Hưởng</span> vì tính trang nhã và pháp lý cao.
                </td>
                <td className="py-3.5 px-4 text-[#14241C] bg-[#FAF9F5]">
                  <span className="font-bold text-[#1E3A5F]">🚀 Khuyên dùng cho Màn Hình Quản Trị Kỹ Thuật (Admin / Security Monitoring)</span> vì khả năng hiển thị mật độ dữ liệu vượt trội.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
