/**
 * @file TestbenchPage.tsx
 * @description Trang điều khiển trung tâm thử nghiệm và đánh giá toàn diện công nghệ cho Đồ án LegacyVault
 * Đã tinh chỉnh: Loại bỏ hoàn toàn Header, Navbar và Footer lồng nhau khi nhúng trong Prototype Portal.
 */

import React, { useState } from 'react';
import { 
  Shield, 
  KeyRound, 
  Clock, 
  CreditCard, 
  Mail, 
  LogIn, 
  Cpu, 
  Sparkles, 
  UserCheck, 
  Video 
} from 'lucide-react';

import { CryptoEnvelopeTestbench } from '@/features/crypto-envelope/CryptoEnvelopeTestbench';
import { ShamirTestbench } from '@/features/shamir-anti-rogue/ShamirTestbench';
import { R2StorageTestbench } from '@/features/storage-r2/R2StorageTestbench';
import { SePayTestbench } from '@/features/payment-sepay/SePayTestbench';
import { MailKitTestbench } from '@/features/notification-mailkit/MailKitTestbench';
import { EkycTestbench } from '@/features/ekyc-verification/EkycTestbench';
import { RescueTimeLockTestbench } from '@/features/rescue-timelock/RescueTimeLockTestbench';
import { VideoVerificationTestbench } from '@/features/video-verification/VideoVerificationTestbench';
import { GoogleOidcTestbench } from '@/features/auth-oidc/GoogleOidcTestbench';
import { FptMarketplaceTestbench } from '@/features/fpt-marketplace/FptMarketplaceTestbench';
import { InteractiveWorkflowVisualizer } from '@/features/workflow-visualizer/InteractiveWorkflowVisualizer';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

interface TestbenchPageProps {
  defaultTab?: string;
}

export const TestbenchPage: React.FC<TestbenchPageProps> = ({ defaultTab = 'flow' }) => {
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('session')) {
        return 'video-verification';
      }
    }
    return defaultTab;
  });

  const testbenchTabs = [
    { id: 'flow', label: '🌟 0. Quy Trình Hoạt Hình', icon: <Sparkles className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'envelope', label: '1. Envelope AES-GCM', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'shamir', label: '2. Shamir SSS (2/3)', icon: <KeyRound className="w-3.5 h-3.5" /> },
    { id: 'r2', label: '3. Cloudflare R2', icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'sepay', label: '4. SePay VietQR', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'mailkit', label: '5. MailKit SMTP', icon: <Mail className="w-3.5 h-3.5" /> },
    { id: 'ekyc', label: '6. Xác Minh Danh Tính Thủ Công', icon: <UserCheck className="w-3.5 h-3.5" /> },
    { id: 'timelock', label: '7. Time-Lock & Rescue', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'video-verification', label: '🎥 8. Gọi Video 1–1 (LiveKit)', icon: <Video className="w-3.5 h-3.5 text-emerald-600" /> },
    { id: 'oidc', label: '9. Google OIDC', icon: <LogIn className="w-3.5 h-3.5" /> },
    { id: 'fpt-marketplace', label: '10. AI Trích Xuất (Định hướng)', icon: <Cpu className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-6">
      {/* 1. CLEAN SUB-TAB NAVIGATION BAR (No duplicate Header / No duplicate logo / No duplicate role) */}
      <div className="bg-white border border-[#DCD9D0] rounded-2xl p-2 shadow-xs">
        <nav className="flex space-x-1.5 overflow-x-auto scrollbar-none py-0.5">
          {testbenchTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B291E] text-white shadow-xs scale-[1.01]'
                    : 'text-[#66786E] hover:text-[#0B291E] hover:bg-[#FAF9F5]'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* 2. DIRECT TAB CONTENT (No duplicate top cards / Immediate focus on selected tool) */}
      <div className="transition-all duration-300">
        <ErrorBoundary fallbackTitle="Lỗi hiển thị thành phần thử nghiệm">
          {activeTab === 'flow' && <InteractiveWorkflowVisualizer onNavigateTab={setActiveTab} />}
          {activeTab === 'envelope' && <CryptoEnvelopeTestbench />}
          {activeTab === 'shamir' && <ShamirTestbench />}
          {activeTab === 'r2' && <R2StorageTestbench />}
          {activeTab === 'sepay' && <SePayTestbench />}
          {activeTab === 'mailkit' && <MailKitTestbench />}
          {activeTab === 'ekyc' && <EkycTestbench onNavigateToMarketplace={() => setActiveTab('fpt-marketplace')} />}
          {activeTab === 'timelock' && <RescueTimeLockTestbench />}
          {activeTab === 'video-verification' && <VideoVerificationTestbench />}
          {activeTab === 'oidc' && <GoogleOidcTestbench />}
          {activeTab === 'fpt-marketplace' && <FptMarketplaceTestbench />}
        </ErrorBoundary>
      </div>
    </div>
  );
};
