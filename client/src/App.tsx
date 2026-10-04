/**
 * @file App.tsx
 * @description Ứng Dụng Web Trung Tâm LegacyVault - Nền Tảng Lưu Giữ & Bàn Giao Di Sản Số
 */

import React, { useState } from 'react';
import { MainNavbar, type MainNavTab } from '@/widgets/MainNavbar';
import { DashboardPage } from '@/pages/DashboardPage';
import { ProMaxDashboardPage } from '@/pages/promax/ProMaxDashboardPage';
import { VaultsPage } from '@/pages/VaultsPage';
import { RecipientPage } from '@/pages/RecipientPage';
import { PricingPage } from '@/pages/PricingPage';
import { ComparisonView } from '@/pages/ComparisonView';
import { TestbenchPage } from '@/pages/TestbenchPage';
import { NewAssetModal } from '@/widgets/NewAssetModal';
import type { AssetItem } from '@/entities/asset';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';
import { ShieldCheck, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<MainNavTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('session')) {
        return 'testbench';
      }
    }
    return 'dashboard';
  });
  const [uiTheme, setUiTheme] = useState<'evon' | 'promax'>('evon');
  const [currentRole, setCurrentRole] = useState<string>('OWNER');
  const [daysRemaining, setDaysRemaining] = useState<number>(29);
  const [isCheckedInToday, setIsCheckedInToday] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>('Legacy XS (200 MiB)');
  const [isNewAssetModalOpen, setIsNewAssetModalOpen] = useState<boolean>(false);

  // Initial realistic assets in accordance with SRS v3.11.0
  const [assets, setAssets] = useState<AssetItem[]>([
    {
      id: 'ast_001',
      name: 'Cụm 24 Từ Khôi Phục Ví Lạnh Ledger Nano X',
      category: 'CRYPTO',
      sizeFormatted: '1.2 MiB',
      vaultType: 'SINGLE_RECIPIENT',
      vaultName: 'Kho Ví Lạnh & Mật Mã Số',
      recipients: ['con-gai.lethi@gmail.com'],
      encryptionAlg: 'AES-256-GCM (Envelope)',
      sha256Hash: '8f4c2e1b5c90b6a9e144a49c6d3763f0d3810a9a0d3f2a89345e61234abcd890',
      createdAt: '3 ngày trước',
      isSealed: true,
    },
    {
      id: 'ast_002',
      name: 'Bản Scan Giấy Chứng Nhận Quyền Sử Dụng Đất & Di Chúc',
      category: 'LEGAL_DOC',
      sizeFormatted: '14.8 MiB',
      vaultType: 'CO_OWNED',
      vaultName: 'Kho Di Sản Gia Đình & Nhà Đất',
      recipients: ['vo.nguyenthi@gmail.com', 'con-trai.nguyen@gmail.com', 'con-gai.lethi@gmail.com'],
      encryptionAlg: 'AES-256-GCM (Envelope)',
      sha256Hash: '3c7d9a1f224b899a773210bbf451239aa8891047e4b2d1c567890123efab5678',
      createdAt: '5 ngày trước',
      isSealed: true,
    },
    {
      id: 'ast_003',
      name: 'Mật Khẩu Master Két Sắt Số & 2FA Authy',
      category: 'PASSWORD',
      sizeFormatted: '0.4 MiB',
      vaultType: 'SINGLE_RECIPIENT',
      vaultName: 'Kho Ví Lạnh & Mật Mã Số',
      recipients: ['con-gai.lethi@gmail.com'],
      encryptionAlg: 'AES-256-GCM (Envelope)',
      sha256Hash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
      createdAt: '1 tuần trước',
      isSealed: true,
    },
    {
      id: 'ast_004',
      name: 'Hợp Đồng Chuyển Nhượng Cổ Phần Công Ty Công Nghệ',
      category: 'LEGAL_DOC',
      sizeFormatted: '8.5 MiB',
      vaultType: 'SINGLE_RECIPIENT',
      vaultName: 'Hợp Đồng Cổ Phần Doanh Nghiệp',
      recipients: ['luatsu.hoangnam@lex.vn'],
      encryptionAlg: 'AES-256-GCM (Envelope)',
      sha256Hash: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      createdAt: '2 tuần trước',
      isSealed: true,
    },
    {
      id: 'ast_005',
      name: 'Thư Dặn Dò Riêng Tư Cho Các Con',
      category: 'LETTER',
      sizeFormatted: '0.8 MiB',
      vaultType: 'CO_OWNED',
      vaultName: 'Kho Di Sản Gia Đình & Nhà Đất',
      recipients: ['con-trai.nguyen@gmail.com', 'con-gai.lethi@gmail.com'],
      encryptionAlg: 'AES-256-GCM (Envelope)',
      sha256Hash: 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321',
      createdAt: '2 tuần trước',
      isSealed: true,
    },
  ]);

  const handleCheckIn = () => {
    setIsCheckedInToday(true);
    setDaysRemaining(30);
    alert('⚡ Điểm danh Dead Man\'s Switch (DMS) thành công!\nChu kỳ sinh tồn được gia hạn đủ 30 ngày theo quy chế SRS v3.11.0.');
  };

  const handleAssetCreated = (newAsset: AssetItem) => {
    setAssets((prev) => [newAsset, ...prev]);
  };

  return (
    <ErrorBoundary fallbackTitle="Đã xảy ra lỗi tại Hệ Thống LegacyVault">
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        uiTheme === 'promax' 
          ? 'bg-[#0B1120] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300' 
          : 'bg-[#EFECE6] text-[#14241C] selection:bg-[#B88E4C]/30 selection:text-[#0B291E]'
      }`}>
        {/* Main Navigation Bar with UI Switcher */}
        <MainNavbar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          daysRemaining={daysRemaining}
          onCheckIn={handleCheckIn}
          isCheckedInToday={isCheckedInToday}
          uiTheme={uiTheme}
          onUiThemeChange={setUiTheme}
        />

        {/* Floating Quick UI Mode Switcher (Always accessible anywhere) */}
        <aside 
          aria-label="Chuyển đổi giao diện" 
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-1.5 rounded-full bg-[#0A101D]/90 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <button
            type="button"
            onClick={() => setUiTheme('evon')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              uiTheme === 'evon'
                ? 'bg-[#B88E4C] text-[#0B291E] shadow-md shadow-[#B88E4C]/30 scale-105'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <span>🌿 evon:ui-ux</span>
          </button>
          
          <button
            type="button"
            onClick={() => setUiTheme('promax')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
              uiTheme === 'promax'
                ? 'bg-linear-to-r from-emerald-400 to-teal-400 text-black shadow-md shadow-emerald-500/30 scale-105'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>⚡ ui-ux-pro-max</span>
          </button>
        </aside>

        {/* Main Body Container */}
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          {currentTab === 'dashboard' && (
            uiTheme === 'promax' ? (
              <ProMaxDashboardPage
                daysRemaining={daysRemaining}
                onCheckIn={handleCheckIn}
                isCheckedInToday={isCheckedInToday}
                onOpenNewAssetModal={() => setIsNewAssetModalOpen(true)}
                assets={assets}
                currentPlan={currentPlan}
              />
            ) : (
              <DashboardPage
                daysRemaining={daysRemaining}
                onCheckIn={handleCheckIn}
                isCheckedInToday={isCheckedInToday}
                onOpenNewAssetModal={() => setIsNewAssetModalOpen(true)}
                onNavigateTab={setCurrentTab}
                assets={assets}
                currentPlan={currentPlan}
              />
            )
          )}

          {currentTab === 'vaults' && (
            <VaultsPage
              assets={assets}
              onOpenNewAssetModal={() => setIsNewAssetModalOpen(true)}
            />
          )}

          {currentTab === 'recipient' && (
            <RecipientPage />
          )}

          {currentTab === 'pricing' && (
            <PricingPage
              currentPlan={currentPlan}
              onUpgradePlan={(planName) => setCurrentPlan(planName)}
            />
          )}

          {currentTab === 'comparison' && (
            <ComparisonView
              daysRemaining={daysRemaining}
              onCheckIn={handleCheckIn}
              isCheckedInToday={isCheckedInToday}
              onOpenNewAssetModal={() => setIsNewAssetModalOpen(true)}
              assets={assets}
              currentPlan={currentPlan}
            />
          )}

          {currentTab === 'testbench' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-[#66786E] px-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[#0B291E]">Engineering Testbench Sandbox</span>
                  <span className="text-[10px] bg-[#B88E4C]/20 text-[#8C6B32] font-bold px-2 py-0.5 rounded-full">
                    11 Trụ Cột Công Nghệ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentTab('dashboard')}
                  className={`font-semibold underline cursor-pointer text-xs ${
                    uiTheme === 'promax' ? 'text-emerald-400 hover:text-emerald-300' : 'text-[#0B291E] hover:text-[#B88E4C]'
                  }`}
                >
                  ← Quay lại Giao Diện Tổng Quan
                </button>
              </div>
              <TestbenchPage />
            </div>
          )}
        </div>

        {/* New Asset Modal */}
        <NewAssetModal
          isOpen={isNewAssetModalOpen}
          onClose={() => setIsNewAssetModalOpen(false)}
          onAssetCreated={handleAssetCreated}
        />

        {/* Footer */}
        <footer className={`border-t py-6 text-xs mt-12 transition-colors duration-300 ${
          uiTheme === 'promax'
            ? 'bg-[#0A101D] border-slate-800 text-slate-400'
            : 'bg-[#FAF9F5] border-[#DCD9D0] text-[#66786E]'
        }`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <p className={`font-semibold flex items-center justify-center sm:justify-start gap-1.5 ${
                uiTheme === 'promax' ? 'text-white' : 'text-[#0B291E]'
              }`}>
                <ShieldCheck className={`w-4 h-4 ${uiTheme === 'promax' ? 'text-emerald-400' : 'text-[#B88E4C]'}`} />
                <span>LegacyVault · Nền tảng Lưu giữ & Bàn giao Di sản Số (SWP391 - Fall 2026)</span>
              </p>
              <p className={`text-[11px] ${uiTheme === 'promax' ? 'text-slate-500' : 'text-[#66786E]'}`}>
                Tuân thủ Luật Giao dịch điện tử 2023 (Luật số 20/2023/QH15) & Bộ luật Dân sự 2015 (Điều 624-630)
              </p>
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <button 
                type="button"
                onClick={() => setCurrentTab('pricing')} 
                className={`transition-colors cursor-pointer ${
                  uiTheme === 'promax' ? 'hover:text-emerald-400' : 'hover:text-[#0B291E]'
                }`}
              >
                Gói Dịch Vụ
              </button>
              <span>•</span>
              <button 
                type="button"
                onClick={() => setCurrentTab('testbench')} 
                className={`transition-colors cursor-pointer ${
                  uiTheme === 'promax' ? 'hover:text-emerald-400' : 'hover:text-[#0B291E]'
                }`}
              >
                Kỹ Thuật Sandbox
              </button>
              <span>•</span>
              <a 
                href="http://localhost:5000/swagger" 
                target="_blank" 
                rel="noreferrer" 
                className={`transition-colors ${
                  uiTheme === 'promax' ? 'hover:text-emerald-400' : 'hover:text-[#0B291E]'
                }`}
              >
                API Swagger
              </a>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
};

export default App;
