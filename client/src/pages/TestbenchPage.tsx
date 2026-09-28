/**
 * @file TestbenchPage.tsx
 * @description Trang điều khiển trung tâm thử nghiệm và đánh giá toàn diện công nghệ cho Đồ án LegacyVault
 */

import React, { useState } from 'react';
import { AppHeader } from '@/widgets/AppHeader';
import { TechOverviewBar } from '@/widgets/TechOverviewBar';
import { LiveDmsHeartbeatCard } from '@/widgets/LiveDmsHeartbeatCard';
import { ComplianceWarningBox } from '@/widgets/ComplianceWarningBox';
import { LegalDropzone } from '@/widgets/LegalDropzone';

import { CryptoEnvelopeTestbench } from '@/features/crypto-envelope/CryptoEnvelopeTestbench';
import { ShamirTestbench } from '@/features/shamir-anti-rogue/ShamirTestbench';
import { R2StorageTestbench } from '@/features/storage-r2/R2StorageTestbench';
import { SePayTestbench } from '@/features/payment-sepay/SePayTestbench';
import { MailKitTestbench } from '@/features/notification-mailkit/MailKitTestbench';
import { EkycTestbench } from '@/features/ekyc-verification/EkycTestbench';
import { RescueTimeLockTestbench } from '@/features/rescue-timelock/RescueTimeLockTestbench';
import { GoogleOidcTestbench } from '@/features/auth-oidc/GoogleOidcTestbench';

export const TestbenchPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('envelope');
  const [currentRole, setCurrentRole] = useState<string>('OWNER');

  return (
    <div className="min-h-screen bg-[#EFECE6] text-[#14241C] flex flex-col font-sans">
      {/* Header */}
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
      />

      {/* Tech Overview Bar */}
      <TechOverviewBar />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Top 2 Domain Protocol Components */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LiveDmsHeartbeatCard ownerName="Nguyễn Văn Chủ Kho" cycleDays={30} />
          <ComplianceWarningBox totalAssetsValue={500000000} />
        </div>

        {/* Tab Content Display */}
        <div className="transition-all duration-300">
          {activeTab === 'envelope' && <CryptoEnvelopeTestbench />}
          {activeTab === 'shamir' && <ShamirTestbench />}
          {activeTab === 'r2' && <R2StorageTestbench />}
          {activeTab === 'sepay' && <SePayTestbench />}
          {activeTab === 'mailkit' && <MailKitTestbench />}
          {activeTab === 'ekyc' && <EkycTestbench />}
          {activeTab === 'timelock' && <RescueTimeLockTestbench />}
          {activeTab === 'oidc' && <GoogleOidcTestbench />}
        </div>

        {/* Legal Dropzone at bottom for testing standalone hashing */}
        <div className="pt-4 border-t border-[#DCD9D0]">
          <LegalDropzone />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#FAF9F5] border-t border-[#DCD9D0] py-6 text-center text-xs text-[#66786E]">
        <div className="max-w-7xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-[#0B291E]">
            Dự án Tốt nghiệp Kỹ thuật phần mềm: LegacyVault (SWP391 - Fall 2026)
          </p>
          <p>
            Mã hóa Phong bì AES-256-GCM • Shamir SSS (2/3) • Cloudflare R2 • SePay VietQR • MailKit SMTP • FPT.AI eKYC • Google OIDC
          </p>
        </div>
      </footer>
    </div>
  );
};
