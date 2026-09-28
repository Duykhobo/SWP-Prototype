import React, { useState } from 'react';
import { axiosClient } from '@/shared/api/axiosClient';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { Cloud, UploadCloud, Download, Link2, FileCheck, AlertCircle } from 'lucide-react';

export const R2StorageTestbench: React.FC = () => {
  const [fileName, setFileName] = useState('di_chuc_mat_2026.pdf');
  const [presignedUploadUrl, setPresignedUploadUrl] = useState<string>('');
  const [presignedDownloadUrl, setPresignedDownloadUrl] = useState<string>('');
  const [storageKey, setStorageKey] = useState<string>('');
  const [isGeneratingUpload, setIsGeneratingUpload] = useState(false);
  const [isGeneratingDownload, setIsGeneratingDownload] = useState(false);

  // Upload envelope file
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploadingEnvelope, setIsUploadingEnvelope] = useState(false);
  const [uploadedAsset, setUploadedAsset] = useState<any | null>(null);
  const [isDownloadingRam, setIsDownloadingRam] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storageStatus, setStorageStatus] = useState<{ isConfigured: boolean; bucketName: string; provider: string; mode: string } | null>(null);

  React.useEffect(() => {
    axiosClient.get('/api/v1/storage/status')
      .then((res) => setStorageStatus(res.data))
      .catch(() => setStorageStatus(null));
  }, []);

  const handleGenerateUploadUrl = async () => {
    setIsGeneratingUpload(true);
    setErrorMessage(null);
    try {
      const res = await axiosClient.post('/api/v1/storage/presigned-upload-url', {
        fileName,
        contentType: 'application/pdf',
      });
      setPresignedUploadUrl(res.data.presignedUrl);
      setStorageKey(res.data.key);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi sinh Presigned Upload URL');
    } finally {
      setIsGeneratingUpload(false);
    }
  };

  const handleGenerateDownloadUrl = async () => {
    if (!storageKey) return;
    setIsGeneratingDownload(true);
    setErrorMessage(null);
    try {
      const res = await axiosClient.post('/api/v1/storage/presigned-download-url', {
        key: storageKey,
      });
      setPresignedDownloadUrl(res.data.presignedUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi sinh Presigned Download URL');
    } finally {
      setIsGeneratingDownload(false);
    }
  };

  const handleUploadEnvelope = async () => {
    if (!uploadFile) return;
    setIsUploadingEnvelope(true);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      const res = await axiosClient.post('/api/v1/storage/upload-envelope', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUploadedAsset(res.data.asset);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || err.message);
    } finally {
      setIsUploadingEnvelope(false);
    }
  };

  const handleRamStreamDownload = async () => {
    if (!uploadedAsset) return;
    setIsDownloadingRam(true);
    setErrorMessage(null);

    try {
      // Gọi endpoint stream giải mã qua TLS (Hard Rule 1.3: RAM-only, revokeObjectURL)
      const res = await axiosClient.get(`/api/v1/storage/download-envelope/${uploadedAsset.assetId}`, {
        responseType: 'blob',
      });

      const blobUrl = URL.createObjectURL(res.data);
      const tempLink = document.createElement('a');
      tempLink.href = blobUrl;
      tempLink.setAttribute('download', uploadedAsset.fileName);
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);

      // Thu hồi ngay lập tức sau khi tải về hoàn tất
      URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.detail || 'Lỗi tải tệp streaming từ RAM');
    } finally {
      setIsDownloadingRam(false);
    }
  };

  return (
    <HeritageCard
      title="3. Lưu trữ Đám mây Riêng tư Cloudflare R2 (S3-Compatible)"
      subtitle="Ciphertext được lưu trữ trong Bucket riêng tư, hỗ trợ Presigned URL có thời hạn và tải về giải mã RAM-Only streaming qua TLS (0đ chi phí băng thông tải về - Egress 0$)."
      icon={<Cloud className="w-5 h-5" />}
      badge={
        <div className="flex items-center gap-1.5">
          {storageStatus?.isConfigured ? (
            <HeritageBadge variant="success">Cloudflare R2 Live ({storageStatus.bucketName})</HeritageBadge>
          ) : (
            <HeritageBadge variant="neutral">In-Memory Mock Fallback</HeritageBadge>
          )}
          <HeritageBadge variant="gold">Zero-Egress $0</HeritageBadge>
        </div>
      }
    >
      <div className="space-y-6">
        {errorMessage && (
          <div className="p-3 bg-[#FDF2F2] border border-[#FECACA] rounded-lg text-xs text-[#D9534F] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab 1: Presigned URL Generation */}
        <div className="p-5 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl space-y-4">
          <h4 className="text-xs font-semibold text-[#0B291E] uppercase tracking-wider flex items-center gap-2">
            <Link2 className="w-4 h-4 text-[#B88E4C]" /> Thử Nghiệm Sinh Presigned URLs (Upload & Download có thời hạn):
          </h4>

          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Tên tệp tin"
              className="flex-1 px-4 py-2 text-xs bg-[#FAF9F5] border border-[#DCD9D0] rounded-lg"
            />
            <HeritageButton
              onClick={handleGenerateUploadUrl}
              isLoading={isGeneratingUpload}
              icon={<UploadCloud className="w-4 h-4" />}
            >
              Sinh Presigned Upload URL (PUT)
            </HeritageButton>
          </div>

          {presignedUploadUrl && (
            <div className="p-3 bg-[#FBF7EE] border border-[#E8DCC6] rounded-lg space-y-2 text-xs">
              <span className="font-semibold text-[#B88E4C] block">Presigned PUT URL (Hiệu lực 15 phút):</span>
              <code className="text-[10px] font-mono break-all block p-2 bg-[#FAF9F5] rounded border border-[#E8DCC6]">
                {presignedUploadUrl}
              </code>
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[#66786E]">Key lưu trữ: {storageKey}</span>
                <HeritageButton
                  variant="gold"
                  onClick={handleGenerateDownloadUrl}
                  isLoading={isGeneratingDownload}
                  icon={<Download className="w-3.5 h-3.5" />}
                >
                  Sinh Presigned Download URL (GET)
                </HeritageButton>
              </div>
            </div>
          )}

          {presignedDownloadUrl && (
            <div className="p-3 bg-[#E5EDE8] border border-[#0B291E]/20 rounded-lg space-y-1 text-xs">
              <span className="font-semibold text-[#0B291E] block">Presigned GET URL (Tải trực tiếp từ R2):</span>
              <code className="text-[10px] font-mono break-all block p-2 bg-[#FAF9F5] rounded border border-[#0B291E]/20">
                {presignedDownloadUrl}
              </code>
            </div>
          )}
        </div>

        {/* Tab 2: Upload Envelope to R2 & Stream Decrypt */}
        <div className="p-5 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl space-y-4">
          <h4 className="text-xs font-semibold text-[#0B291E] uppercase tracking-wider flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-[#0B291E]" /> Tải Lên Mã Hóa Envelope Thẳng Vào R2 & Tải Về Streaming RAM:
          </h4>

          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 border border-[#DCD9D0] rounded-lg bg-[#FAF9F5]">
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files ? e.target.files[0] : null)}
              className="text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#0B291E] file:text-[#FAF9F5] hover:file:bg-[#133E2F] cursor-pointer"
            />
            <HeritageButton
              onClick={handleUploadEnvelope}
              disabled={!uploadFile}
              isLoading={isUploadingEnvelope}
              icon={<UploadCloud className="w-4 h-4" />}
            >
              Upload Ciphertext lên R2
            </HeritageButton>
          </div>

          {uploadedAsset && (
            <div className="p-4 bg-[#E6F4EA] border border-[#A7F3D0] rounded-xl text-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#059669] flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" /> Đã lưu trữ an toàn trong Cloudflare R2:
                </span>
                <HeritageBadge variant="success">CIPHERTEXT STORED</HeritageBadge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-[#14241C]">
                <div>• Tên tệp: <strong>{uploadedAsset.fileName}</strong></div>
                <div>• Dung lượng: {(uploadedAsset.sizeBytes / 1024).toFixed(1)} KB</div>
                <div className="md:col-span-2">• R2 Key: <code>{uploadedAsset.storageKey}</code></div>
                <div className="md:col-span-2">• SHA-256 Checksum: <code>{uploadedAsset.checksumSha256}</code></div>
              </div>

              <div className="pt-2 border-t border-[#A7F3D0] flex items-center justify-between">
                <span className="text-[#059669]">Tải về giải mã RAM-Only qua TLS (DEL-02):</span>
                <HeritageButton
                  variant="primary"
                  onClick={handleRamStreamDownload}
                  isLoading={isDownloadingRam}
                  icon={<Download className="w-4 h-4" />}
                >
                  Tải về giải mã ngay
                </HeritageButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </HeritageCard>
  );
};
