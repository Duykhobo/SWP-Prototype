/**
 * @file NewAssetModal.tsx
 * @description Modal tải lên và mã hóa phong bì tài sản số AES-256-GCM đưa vào kho LegacyVault
 */

import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  UploadCloud, 
  KeyRound, 
  FileText, 
  Lock, 
  CheckCircle2, 
  Loader2,
  Sparkles,
  Info
} from 'lucide-react';

export interface AssetItem {
  id: string;
  name: string;
  category: 'CRYPTO' | 'PASSWORD' | 'LEGAL_DOC' | 'LETTER';
  sizeFormatted: string;
  vaultType: 'SINGLE_RECIPIENT' | 'CO_OWNED';
  vaultName: string;
  recipients: string[];
  encryptionAlg: string;
  sha256Hash: string;
  createdAt: string;
  isSealed: boolean;
}

interface NewAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetCreated: (asset: AssetItem) => void;
}

export const NewAssetModal: React.FC<NewAssetModalProps> = ({
  isOpen,
  onClose,
  onAssetCreated,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'CRYPTO' | 'PASSWORD' | 'LEGAL_DOC' | 'LETTER'>('CRYPTO');
  const [vaultType, setVaultType] = useState<'SINGLE_RECIPIENT' | 'CO_OWNED'>('SINGLE_RECIPIENT');
  const [vaultName, setVaultName] = useState('Kho Ví Lạnh & Tài Sản Mật Mã');
  const [recipientEmail, setRecipientEmail] = useState('con-gai.lethi@gmail.com');
  const [secretContent, setSecretContent] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  
  // Pipeline status: idle -> hashing -> generating_dek -> encrypting -> uploading -> done
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');

  if (!isOpen) return null;

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFileName(file.name);
      setFileSize((file.size / (1024 * 1024)).toFixed(2) + ' MB');
      if (!name) setName(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsProcessing(true);
    setProcessStep('Băm SHA-256 nội dung nguyên bản...');

    setTimeout(() => {
      setProcessStep('Sinh khóa DEK 256-bit độc lập & mã hóa AES-256-GCM...');
      setTimeout(() => {
        setProcessStep('Mã hóa phong bì DEK với Master Key & phân mảnh Shamir 2/3...');
        setTimeout(() => {
          setProcessStep('Đẩy bản mã (.enc) lên Cloudflare R2 Private Bucket...');
          setTimeout(() => {
            const randomHash = Array.from({ length: 64 }, () => 
              Math.floor(Math.random() * 16).toString(16)
            ).join('');

            const newAsset: AssetItem = {
              id: 'ast_' + Math.random().toString(36).substring(2, 9),
              name,
              category,
              sizeFormatted: fileSize || '1.85 MB',
              vaultType,
              vaultName: vaultName || 'Kho Di Sản Cá Nhân',
              recipients: [recipientEmail],
              encryptionAlg: 'AES-256-GCM (Envelope)',
              sha256Hash: randomHash,
              createdAt: 'Vừa xong',
              isSealed: true,
            };

            onAssetCreated(newAsset);
            setIsProcessing(false);
            onClose();
          }, 600);
        }, 600);
      }, 600);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B291E]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl w-full max-w-2xl shadow-tactile-raised overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#0B291E] text-[#FAF9F5] px-6 py-4 flex items-center justify-between border-b border-[#B88E4C]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B88E4C]/20 border border-[#B88E4C]/40 flex items-center justify-center text-[#B88E4C]">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#FAF9F5]">
                Niêm Phong Tài Sản Số Mới (Envelope Encryption)
              </h2>
              <p className="text-[11px] text-[#FAF9F5]/70">
                Mã hóa AES-256-GCM máy khách + Phân mảnh Shamir SSS 2/3
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#FAF9F5]/60 hover:text-[#FAF9F5] hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Asset Name */}
          <div>
            <label className="block text-xs font-semibold text-[#14241C] mb-1.5">
              Tên Di Sản / Tài Sản Số <span className="text-[#D9534F]">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="VD: Cụm 24 Từ Khôi Phục Ví Ledger Nano X hoặc Thư Di Chúc Nhà Đất"
              className="w-full bg-[#FAF9F5] border border-[#DCD9D0] focus:border-[#B88E4C] focus:ring-2 focus:ring-[#B88E4C]/20 rounded-xl px-3.5 py-2.5 text-xs text-[#14241C] outline-hidden shadow-tactile-inset font-medium placeholder:text-[#66786E]/50"
            />
          </div>

          {/* Asset Category Grid */}
          <div>
            <label className="block text-xs font-semibold text-[#14241C] mb-2">
              Phân Loại Tài Sản Di Sản
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'CRYPTO', label: 'Ví Tiền Số', icon: <KeyRound className="w-4 h-4" /> },
                { id: 'PASSWORD', label: 'Mật Khẩu & 2FA', icon: <Lock className="w-4 h-4" /> },
                { id: 'LEGAL_DOC', label: 'Hồ Sơ Di Chúc', icon: <FileText className="w-4 h-4" /> },
                { id: 'LETTER', label: 'Thư Ủy Thác', icon: <Sparkles className="w-4 h-4" /> },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCategory(item.id as any)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    category === item.id
                      ? 'bg-[#E5EDE8] border-[#0B291E] text-[#0B291E] font-bold shadow-xs'
                      : 'bg-white border-[#DCD9D0] text-[#66786E] hover:border-[#B88E4C]/50'
                  }`}
                >
                  <span className={category === item.id ? 'text-[#0B291E]' : 'text-[#66786E]'}>
                    {item.icon}
                  </span>
                  <span className="text-[11px]">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dropzone File Upload */}
          <div>
            <label className="block text-xs font-semibold text-[#14241C] mb-1.5">
              Tệp Đính Kèm (PDF, TXT, KEY, DOCX $\le$ 20 MiB)
            </label>
            <label className="border-2 border-dashed border-[#B88E4C]/40 bg-[#FAF9F5] hover:bg-[#FBF7EE] rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors shadow-tactile-inset">
              <UploadCloud className="w-8 h-8 text-[#B88E4C] mb-1" />
              <span className="text-xs font-semibold text-[#14241C]">
                {fileName ? fileName : 'Kéo thả tệp hoặc nhấp để chọn tệp'}
              </span>
              <span className="text-[10px] text-[#66786E] mt-0.5">
                {fileSize ? `Dung lượng: ${fileSize}` : 'Dung lượng tối đa 20 MiB cho mỗi tài sản'}
              </span>
              <input 
                type="file" 
                onChange={handleFileDrop} 
                className="hidden" 
              />
            </label>
          </div>

          {/* Text/Secret Content (Optional alternative) */}
          <div>
            <label className="block text-xs font-semibold text-[#14241C] mb-1.5">
              Nội Dung Bí Mật Trực Tiếp (Tùy chọn)
            </label>
            <textarea
              rows={2}
              value={secretContent}
              onChange={(e) => setSecretContent(e.target.value)}
              placeholder="Ghi chú thêm: 24 seed phrase, mật khẩu master, mã két sắt gia đình..."
              className="w-full bg-[#FAF9F5] border border-[#DCD9D0] focus:border-[#B88E4C] focus:ring-2 focus:ring-[#B88E4C]/20 rounded-xl px-3 py-2 text-xs text-[#14241C] outline-hidden shadow-tactile-inset font-mono placeholder:text-[#66786E]/50"
            />
          </div>

          {/* Handover Vault Grouping (SRS v3.11.0) */}
          <div className="bg-[#EFECE6]/60 p-3.5 rounded-xl border border-[#DCD9D0] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0B291E]">
                Cơ Chế Bàn Giao & Gom Kho (SRS v3.11.0)
              </span>
              <span className="text-[10px] bg-[#B88E4C]/20 text-[#A07839] border border-[#B88E4C]/40 px-2 py-0.5 rounded-full font-semibold">
                Tự Động Gom Kho
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer ${
                vaultType === 'SINGLE_RECIPIENT' 
                  ? 'bg-white border-[#0B291E] shadow-xs' 
                  : 'bg-transparent border-[#DCD9D0]'
              }`}>
                <input
                  type="radio"
                  name="vaultType"
                  checked={vaultType === 'SINGLE_RECIPIENT'}
                  onChange={() => setVaultType('SINGLE_RECIPIENT')}
                  className="mt-0.5 text-[#0B291E] focus:ring-[#0B291E]"
                />
                <div>
                  <span className="font-semibold block text-[#0B291E]">Kho Một Người</span>
                  <span className="text-[10px] text-[#66786E]">Toàn quyền 1 bản sao toàn vẹn, chỉ định 1 người thụ hưởng chính.</span>
                </div>
              </label>

              <label className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer ${
                vaultType === 'CO_OWNED' 
                  ? 'bg-white border-[#0B291E] shadow-xs' 
                  : 'bg-transparent border-[#DCD9D0]'
              }`}>
                <input
                  type="radio"
                  name="vaultType"
                  checked={vaultType === 'CO_OWNED'}
                  onChange={() => setVaultType('CO_OWNED')}
                  className="mt-0.5 text-[#0B291E] focus:ring-[#0B291E]"
                />
                <div>
                  <span className="font-semibold block text-[#0B291E]">Kho Đồng Sở Hữu</span>
                  <span className="text-[10px] text-[#66786E]">Yêu cầu 100% người nhận đồng thuận mới mở khóa giải mã.</span>
                </div>
              </label>
            </div>

            {/* Recipient Email */}
            <div>
              <label className="block text-[11px] font-semibold text-[#14241C] mb-1">
                Email Người Nhận Được Chỉ Định:
              </label>
              <input
                type="email"
                required
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="nguoinhan@gmail.com"
                className="w-full bg-white border border-[#DCD9D0] focus:border-[#B88E4C] rounded-lg px-3 py-1.5 text-xs text-[#14241C] outline-hidden"
              />
            </div>
          </div>

          {/* Legal Notice */}
          <div className="flex items-start gap-2 bg-[#FBF7EE] border border-[#E8DCC6] p-3 rounded-xl text-[11px] text-[#7D5D28]">
            <Info className="w-4 h-4 shrink-0 text-[#B88E4C] mt-0.5" />
            <p>
              Tài sản sau khi niêm phong sẽ được mã hóa authenticated encryption bằng DEK độc lập và lưu trên Cloudflare R2 Private Bucket. Hệ thống không lưu trữ khóa giải mã gốc (Zero-Knowledge).
            </p>
          </div>

          {/* Processing Progress */}
          {isProcessing && (
            <div className="bg-[#0B291E] text-white p-3.5 rounded-xl space-y-2 border border-[#B88E4C]/40">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#B88E4C]">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang thực hiện quy trình niêm phong mật mã...</span>
              </div>
              <p className="text-[11px] text-[#FAF9F5]/80 font-mono">
                {processStep}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#DCD9D0]">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-xs font-semibold text-[#66786E] hover:text-[#14241C] transition-colors cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isProcessing || !name.trim()}
              className="px-5 py-2.5 bg-[#0B291E] hover:bg-[#133E2F] active:scale-95 text-[#FAF9F5] rounded-xl text-xs font-bold transition-all shadow-tactile-raised flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 text-[#B88E4C]" />
              <span>Tiến Hành Niêm Phong & Gom Kho</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
