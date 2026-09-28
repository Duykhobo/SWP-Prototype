/**
 * @file LegalDropzone.tsx
 * @description Domain Protocol Component #3: Legal Dropzone tính băm SHA-256 trực tiếp tại Client (Quy tắc 10)
 */

import React, { useState } from 'react';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { UploadCloud, FileCheck, AlertTriangle } from 'lucide-react';

interface LegalDropzoneProps {
  onFileHashed?: (file: File, sha256: string) => void;
  maxSizeBytes?: number;
}

export const LegalDropzone: React.FC<LegalDropzoneProps> = ({
  onFileHashed,
  maxSizeBytes = 20 * 1024 * 1024, // 20 MiB theo SRS v3.11.0
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [sha256Hash, setSha256Hash] = useState<string>('');
  const [isHashing, setIsHashing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const calculateSha256Native = async (inputFile: File): Promise<string> => {
    // Quy tắc 18: Native Web Crypto API thuần, không cài thư viện ngoài
    const arrayBuffer = await inputFile.arrayBuffer();
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', arrayBuffer);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const selected = e.target.files[0];

    // Kiểm tra giới hạn 20 MiB
    if (selected.size > maxSizeBytes) {
      setErrorMessage(`Tệp tin vượt quá dung lượng tối đa ${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MiB.`);
      setFile(null);
      setSha256Hash('');
      return;
    }

    setErrorMessage(null);
    setFile(selected);
    setIsHashing(true);

    try {
      const hash = await calculateSha256Native(selected);
      setSha256Hash(hash);
      if (onFileHashed) {
        onFileHashed(selected, hash);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi băm SHA-256 tệp tin.');
    } finally {
      setIsHashing(false);
    }
  };

  return (
    <div className="p-5 border-2 border-dashed border-[#DCD9D0] rounded-xl bg-[#FAF9F5] space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="font-semibold text-sm text-[#0B291E] flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-[#B88E4C]" /> Vùng Tải Tệp Tin Pháp Lý (Legal Dropzone)
          </div>
          <p className="text-xs text-[#66786E] mt-0.5">
            Băm SHA-256 trực tiếp trong trình duyệt trước khi tải lên (Giới hạn tối đa 20 MiB).
          </p>
        </div>
        <HeritageBadge variant="gold">SHA-256 Client-Side</HeritageBadge>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="file"
          onChange={handleFileSelect}
          className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#0B291E] file:text-[#FAF9F5] hover:file:bg-[#133E2F] cursor-pointer"
        />
      </div>

      {isHashing && (
        <div className="text-xs text-[#B88E4C] flex items-center gap-2">
          <span className="animate-spin">⏳</span> Đang băm SHA-256 qua Web Crypto API...
        </div>
      )}

      {errorMessage && (
        <div className="p-3 bg-[#FDF2F2] border border-[#FECACA] rounded-lg text-xs text-[#D9534F] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {sha256Hash && file && (
        <div className="p-3 bg-[#E5EDE8] border border-[#0B291E]/20 rounded-lg text-xs space-y-1">
          <div className="flex items-center justify-between font-bold text-[#0B291E]">
            <span className="flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-[#059669]" /> {file.name} ({(file.size / 1024).toFixed(1)} KB)
            </span>
            <HeritageBadge variant="success">HASH CALCULATED</HeritageBadge>
          </div>
          <div className="pt-1">
            <span className="text-[#66786E] text-[10px] block font-semibold uppercase">Mã băm toàn vẹn SHA-256:</span>
            <code className="text-[11px] font-mono break-all text-[#14241C] block p-1.5 bg-[#FAF9F5] rounded border border-[#0B291E]/20 mt-0.5">
              {sha256Hash}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};
