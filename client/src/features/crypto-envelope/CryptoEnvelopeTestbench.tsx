import React, { useState } from 'react';
import { axiosClient } from '@/shared/api/axiosClient';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { Shield, Key, FileCheck, Lock, Unlock, AlertCircle, Cloud, Database } from 'lucide-react';
import { LivePipelineProgress, type PipelineStage } from '@/shared/ui/LivePipelineProgress';

interface EncryptMetadata {
  assetId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256: string;
  storageKey: string;
  wrappedDataKeyBase64: string;
  nonceBase64: string;
  tagBase64: string;
  createdAt: string;
}

export const CryptoEnvelopeTestbench: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [metadata, setMetadata] = useState<EncryptMetadata | null>(null);
  const [ciphertextPreview, setCiphertextPreview] = useState<string>('');
  const [fullCiphertextBase64, setFullCiphertextBase64] = useState<string>('');
  const [ciphertextBytes, setCiphertextBytes] = useState<number>(0);
  const [rawDekSample, setRawDekSample] = useState<string>('');
  const [decryptedSuccess, setDecryptedSuccess] = useState<boolean>(false);
  const [decryptedBlobUrl, setDecryptedBlobUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setMetadata(null);
      setDecryptedSuccess(false);
      setErrorMessage(null);
      if (decryptedBlobUrl) {
        URL.revokeObjectURL(decryptedBlobUrl);
        setDecryptedBlobUrl(null);
      }
    }
  };

  const handleEncrypt = async () => {
    if (!selectedFile) return;

    setIsEncrypting(true);
    setErrorMessage(null);
    setDecryptedSuccess(false);
    if (decryptedBlobUrl) {
      URL.revokeObjectURL(decryptedBlobUrl);
      setDecryptedBlobUrl(null);
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await axiosClient.post('/api/v1/crypto/envelope-encrypt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setMetadata(response.data.metadata);
      setCiphertextPreview(response.data.rawCiphertextBase64);
      setFullCiphertextBase64(response.data.fullCiphertextBase64 || '');
      setCiphertextBytes(response.data.ciphertextLengthBytes);
      setRawDekSample(response.data.rawDekSampleBase64);
    } catch (err: any) {
      const detail = err.response?.data?.detail || err.message || 'Lỗi mã hóa tệp tin.';
      setErrorMessage(detail);
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleTestDecrypt = async () => {
    if (!metadata) return;

    setIsDecrypting(true);
    setErrorMessage(null);

    try {
      const response = await axiosClient.post(
        '/api/v1/crypto/envelope-decrypt',
        {
          assetId: metadata.assetId,
          ciphertextBase64: fullCiphertextBase64,
          wrappedKeyBase64: metadata.wrappedDataKeyBase64,
          nonceBase64: metadata.nonceBase64,
          tagBase64: metadata.tagBase64,
          fileName: metadata.fileName,
          mimeType: metadata.mimeType,
        },
        { responseType: 'blob' }
      );

      // RAM-Only Ephemeral Blob URL (FE Hard Rule 1.3)
      const blobUrl = URL.createObjectURL(response.data);
      setDecryptedBlobUrl(blobUrl);
      setDecryptedSuccess(true);
    } catch (err: any) {
      let detail = 'Giải mã thất bại do Tag GCM không khớp.';
      if (err.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          if (json.detail) detail = json.detail;
        } catch {
          // ignore
        }
      } else if (err.response?.data?.detail) {
        detail = err.response.data.detail;
      }
      setErrorMessage(detail);
    } finally {
      setIsDecrypting(false);
    }
  };

  return (
    <HeritageCard
      title="1. Mã hóa Phong bì Server-Side Envelope Encryption (AES-256-GCM)"
      subtitle="Tuân thủ nghiêm ngặt quy định SEC-01 -> SEC-04: Mỗi tệp sinh 1 DEK 256-bit độc lập, bọc bằng KEK hệ thống, hash SHA-256 toàn vẹn"
      icon={<Shield className="w-5 h-5" />}
      badge={<HeritageBadge variant="gold">FIPS 140-2 Level 3 Ready</HeritageBadge>}
    >
      <div className="space-y-6">
        {/* Hướng dẫn nguyên lý */}
        <div className="p-4 bg-[#FBF7EE] border-l-4 border-[#B88E4C] rounded-r-lg text-xs text-[#14241C] space-y-1">
          <p className="font-semibold text-sm text-[#0B291E]">Nguyên tắc bảo vệ dữ liệu LegacyVault:</p>
          <p>
            • <strong>DEK (Data Encryption Key):</strong> Khóa ngẫu nhiên 256-bit độc lập cho từng file, tuyệt đối không lưu khóa trần vào CSDL.
          </p>
          <p>
            • <strong>KEK (Key Encryption Key):</strong> Khóa tổng hệ thống dùng để bọc DEK sinh ra <code>WrappedDataKey</code>.
          </p>
          <p>
            • <strong>AES-256-GCM:</strong> Xác thực tính toàn vẹn kèm Authentication Tag 128-bit chống giả mạo hoặc sửa đổi nội dung.
          </p>
        </div>

        {/* Input file */}
        <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border-2 border-dashed border-[#DCD9D0] rounded-xl bg-[#FAF9F5]">
          <input
            type="file"
            onChange={handleFileChange}
            className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#0B291E] file:text-[#FAF9F5] hover:file:bg-[#133E2F] cursor-pointer"
          />
          <HeritageButton
            onClick={handleEncrypt}
            disabled={!selectedFile}
            isLoading={isEncrypting}
            icon={<Lock className="w-4 h-4" />}
          >
            Mã hóa Envelope (AES-GCM)
          </HeritageButton>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#FDF2F2] border border-[#FECACA] rounded-lg text-xs text-[#D9534F] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Live Animated Pipeline Progress */}
        {(isEncrypting || metadata) && (
          <LivePipelineProgress
            stages={[
              {
                id: 'hash',
                label: 'Băm SHA-256',
                sublabel: 'RAM Checksum <= 20MB',
                icon: <FileCheck className="w-4 h-4" />,
                status: isEncrypting ? 'processing' : metadata ? 'completed' : 'pending',
                detail: metadata ? `${metadata.checksumSha256.substring(0, 18)}...` : undefined,
              },
              {
                id: 'aes',
                label: 'AES-256-GCM',
                sublabel: 'Sinh DEK + KEK Wrap',
                icon: <Shield className="w-4 h-4" />,
                status: isEncrypting ? 'processing' : metadata ? 'completed' : 'pending',
                detail: metadata ? `Nonce: ${metadata.nonceBase64.substring(0, 10)}...` : undefined,
              },
              {
                id: 'r2',
                label: 'Cloudflare R2',
                sublabel: 'Lưu .enc Ciphertext',
                icon: <Cloud className="w-4 h-4" />,
                status: isEncrypting ? 'processing' : metadata ? 'completed' : 'pending',
                detail: metadata ? metadata.storageKey : undefined,
              },
              {
                id: 'db',
                label: 'PostgreSQL Seal',
                sublabel: 'Ghi Metadata Bằng Chứng',
                icon: <Database className="w-4 h-4" />,
                status: isEncrypting ? 'processing' : metadata ? 'completed' : 'pending',
                detail: metadata ? `ID: ${metadata.assetId}` : undefined,
              },
            ]}
            isProcessing={isEncrypting}
          />
        )}

        {/* Kết quả mã hóa Envelope */}
        {metadata && (
          <div className="space-y-4 p-5 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD9D0]">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-[#059669]" />
                <span className="font-semibold text-sm text-[#0B291E]">
                  {metadata.fileName} ({(metadata.sizeBytes / 1024).toFixed(1)} KB)
                </span>
              </div>
              <HeritageBadge variant="success">MÃ HÓA THÀNH CÔNG</HeritageBadge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-[#EFECE6]/60 rounded-lg">
                <span className="font-semibold text-[#0B291E] block mb-1">Mã băm toàn vẹn SHA-256:</span>
                <code className="text-[11px] font-mono break-all text-[#14241C]">{metadata.checksumSha256}</code>
              </div>
              <div className="p-3 bg-[#EFECE6]/60 rounded-lg">
                <span className="font-semibold text-[#0B291E] block mb-1">Đường dẫn Ciphertext R2:</span>
                <code className="text-[11px] font-mono break-all text-[#66786E]">{metadata.storageKey}</code>
              </div>
              <div className="p-3 bg-[#FBF7EE] border border-[#E8DCC6] rounded-lg md:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-[#B88E4C] flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> WrappedDataKey (DEK được bọc an toàn bởi KEK):
                  </span>
                  <span className="text-[10px] text-[#66786E]">Nonce 96-bit + Tag 128-bit + Encrypted DEK</span>
                </div>
                <code className="text-[11px] font-mono break-all text-[#14241C]">{metadata.wrappedDataKeyBase64}</code>
              </div>
            </div>

            {/* Test giải mã */}
            <div className="pt-3 border-t border-[#DCD9D0] flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-[#66786E]">
                Thử nghiệm giải mã đối soát tính toàn vẹn dữ liệu trong bộ nhớ RAM qua TLS:
              </div>
              <HeritageButton
                variant="gold"
                onClick={handleTestDecrypt}
                isLoading={isDecrypting}
                icon={<Unlock className="w-4 h-4" />}
              >
                Giải mã đối soát ngay
              </HeritageButton>
            </div>

            {decryptedSuccess && (
              <div className="p-3 bg-[#E6F4EA] border border-[#A7F3D0] rounded-lg text-xs text-[#059669] flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 shrink-0" />
                  <span>Giải mã thành công! Toàn vẹn dữ liệu được đảm bảo tuyệt đối bởi AES-256-GCM Tag.</span>
                </div>
                {decryptedBlobUrl && (
                  <a
                    href={decryptedBlobUrl}
                    download={metadata.fileName}
                    className="px-3 py-1 bg-[#059669] text-white font-semibold rounded-md hover:bg-[#047857] transition-colors cursor-pointer"
                  >
                    Tải tệp đã giải mã
                  </a>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </HeritageCard>
  );
};
