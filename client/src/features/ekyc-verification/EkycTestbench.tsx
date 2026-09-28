import React, { useState } from 'react';
import { axiosClient } from '@/shared/api/axiosClient';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { Scan, UserCheck, ShieldCheck, Camera, FileText } from 'lucide-react';

interface OcrData {
  success: boolean;
  idCardNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  homeAddress: string;
  expiryDate: string;
  confidence: number;
  provider: string;
}

interface LivenessData {
  success: boolean;
  isLive: boolean;
  matchScore: number;
  isFaceMatched: boolean;
  provider: string;
  message: string;
}

export const EkycTestbench: React.FC = () => {
  const [useSandbox, setUseSandbox] = useState(false); // Default to Live API per user's preference!
  const [fptApiKey, setFptApiKey] = useState('');
  const [frontCardFile, setFrontCardFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [isMatchingFace, setIsMatchingFace] = useState(false);
  const [ocrResult, setOcrResult] = useState<OcrData | null>(null);
  const [livenessResult, setLivenessResult] = useState<LivenessData | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [faceError, setFaceError] = useState<string | null>(null);

  const handleScanOcr = async () => {
    setIsScanningOcr(true);
    setOcrResult(null);
    setOcrError(null);

    const formData = new FormData();
    if (frontCardFile) {
      formData.append('frontCard', frontCardFile);
    } else {
      const dummy = new Blob(['dummy'], { type: 'image/jpeg' });
      formData.append('frontCard', dummy, 'cccd_front.jpg');
    }
    formData.append('useSandbox', String(useSandbox));
    if (fptApiKey.trim()) {
      formData.append('apiKey', fptApiKey.trim());
    }

    try {
      const res = await axiosClient.post('/api/v1/ekyc/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setOcrResult(res.data);
      if (!res.data.success && res.data.rawJson) {
        setOcrError(res.data.rawJson);
      }
    } catch (err: any) {
      setOcrError(err.response?.data?.detail || err.message || 'Lỗi gửi yêu cầu tới máy chủ FPT.AI.');
    } finally {
      setIsScanningOcr(false);
    }
  };

  const handleMatchFace = async () => {
    setIsMatchingFace(true);
    setLivenessResult(null);
    setFaceError(null);

    const formData = new FormData();
    const dummy = new Blob(['dummy'], { type: 'image/jpeg' });
    formData.append('cardImage', frontCardFile || dummy, 'card.jpg');
    formData.append('selfieImage', selfieFile || dummy, 'selfie.jpg');
    formData.append('useSandbox', String(useSandbox));
    if (fptApiKey.trim()) {
      formData.append('apiKey', fptApiKey.trim());
    }

    try {
      const res = await axiosClient.post('/api/v1/ekyc/liveness-face-match', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLivenessResult(res.data);
      if (!res.data.success && res.data.message) {
        setFaceError(res.data.message);
      }
    } catch (err: any) {
      setFaceError(err.response?.data?.detail || err.message || 'Lỗi gửi yêu cầu tới máy chủ FPT.AI.');
    } finally {
      setIsMatchingFace(false);
    }
  };

  return (
    <HeritageCard
      title="6. Thẩm Định Danh Tính eKYC (FPT.AI Vision SDK)"
      subtitle="Trích xuất OCR thông tin CCCD gắn chip Việt Nam và đối sánh khuôn mặt sinh trắc học (Liveness / Face Matching) với chế độ Sandbox / Live API. (Đã loại bỏ VNPT eKYC do yêu cầu hợp đồng pháp nhân doanh nghiệp)."
      icon={<Scan className="w-5 h-5" />}
      badge={<HeritageBadge variant="forest">FPT.AI eKYC</HeritageBadge>}
    >
      <div className="space-y-6">
        {/* Chuyển đổi Sandbox vs Live */}
        <div className="p-4 bg-[#FBF7EE] border border-[#E8DCC6] rounded-xl text-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-bold text-[#0B291E]">Chế độ Engine eKYC:</span>
              <span className="text-[#66786E] ml-2">
                {useSandbox ? 'Sandbox Mock (Dữ liệu mô phỏng chuẩn)' : 'Live API (Gọi trực tiếp máy chủ api.fpt.ai)'}
              </span>
            </div>
            <button
              onClick={() => setUseSandbox(!useSandbox)}
              className="px-3 py-1 bg-[#0B291E] text-[#FAF9F5] text-xs font-semibold rounded-md hover:bg-[#133E2F] cursor-pointer"
            >
              Chuyển sang {useSandbox ? 'Live API (Chạy thật)' : 'Sandbox Mock'}
            </button>
          </div>

          {!useSandbox && (
            <div className="pt-2 border-t border-[#E8DCC6] space-y-1">
              <label className="font-semibold text-[#0B291E] block">
                FPT.AI API Key (Đăng ký miễn phí tại{' '}
                <a href="https://console.fpt.ai" target="_blank" rel="noreferrer" className="text-[#B88E4C] underline font-bold">
                  https://console.fpt.ai
                </a>
                ):
              </label>
              <input
                type="password"
                placeholder="Nhập API Key FPT.AI của bạn để gọi API thực tế..."
                value={fptApiKey}
                onChange={(e) => setFptApiKey(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#DCD9D0] rounded-md font-mono"
              />
              <span className="text-[10px] text-[#66786E] block">
                Nếu để trống, backend sẽ sử dụng cấu hình trong <code>appsettings.json</code>. Nếu không có key, máy chủ sẽ báo lỗi xác thực 401 thật từ FPT.AI.
              </span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: OCR CCCD */}
          <div className="p-4 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl space-y-3">
            <h4 className="font-bold text-xs text-[#0B291E] flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-[#B88E4C]" /> 1. OCR Trích Xuất CCCD Gắn Chip
            </h4>
            <input
              type="file"
              onChange={(e) => setFrontCardFile(e.target.files ? e.target.files[0] : null)}
              className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#E5EDE8] file:text-[#0B291E] cursor-pointer"
            />
            <HeritageButton
              onClick={handleScanOcr}
              isLoading={isScanningOcr}
              icon={<Scan className="w-4 h-4" />}
            >
              Quét & Trích xuất OCR
            </HeritageButton>

            {ocrError && (
              <div className="p-3 bg-[#FDF2F2] border border-[#FECACA] rounded-lg text-xs text-[#D9534F] space-y-1 mt-2">
                <span className="font-bold block">Phản hồi từ máy chủ FPT.AI (Live):</span>
                <code className="text-[10px] font-mono break-all block whitespace-pre-wrap">{ocrError}</code>
              </div>
            )}

            {ocrResult && ocrResult.success && (
              <div className="p-3 bg-[#FAF9F5] border border-[#DCD9D0] rounded-lg text-xs space-y-1.5 mt-2">
                <div className="flex items-center justify-between font-bold text-[#0B291E] border-b pb-1">
                  <span>{ocrResult.fullName}</span>
                  <HeritageBadge variant="success">Số: {ocrResult.idCardNumber}</HeritageBadge>
                </div>
                <div>• Ngày sinh: <strong>{ocrResult.dateOfBirth}</strong> ({ocrResult.gender})</div>
                <div>• Địa chỉ thường trú: {ocrResult.homeAddress}</div>
                <div>• Hạn sử dụng: {ocrResult.expiryDate}</div>
                <div className="text-[10px] text-[#66786E] pt-1">
                  Provider: {ocrResult.provider} (Độ tin cậy: {(ocrResult.confidence * 100).toFixed(1)}%)
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Face Matching / Liveness */}
          <div className="p-4 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl space-y-3">
            <h4 className="font-bold text-xs text-[#0B291E] flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#0B291E]" /> 2. Đối Sánh Khuôn Mặt (Face Match / Liveness)
            </h4>
            <input
              type="file"
              onChange={(e) => setSelfieFile(e.target.files ? e.target.files[0] : null)}
              className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:bg-[#E5EDE8] file:text-[#0B291E] cursor-pointer"
            />
            <HeritageButton
              variant="gold"
              onClick={handleMatchFace}
              isLoading={isMatchingFace}
              icon={<UserCheck className="w-4 h-4" />}
            >
              Kiểm Tra Liveness & Đối Sánh
            </HeritageButton>

            {faceError && (
              <div className="p-3 bg-[#FDF2F2] border border-[#FECACA] rounded-lg text-xs text-[#D9534F] space-y-1 mt-2">
                <span className="font-bold block">Phản hồi từ máy chủ FPT.AI (Live):</span>
                <code className="text-[10px] font-mono break-all block whitespace-pre-wrap">{faceError}</code>
              </div>
            )}

            {livenessResult && livenessResult.success && (
              <div className="p-3 bg-[#E6F4EA] border border-[#A7F3D0] rounded-lg text-xs space-y-1.5 mt-2 text-[#059669]">
                <div className="flex items-center justify-between font-bold">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Xác Thực Khuôn Mặt
                  </span>
                  <HeritageBadge variant="success">
                    Tỉ lệ khớp: {(livenessResult.matchScore * 100).toFixed(1)}%
                  </HeritageBadge>
                </div>
                <p>{livenessResult.message}</p>
                <div className="text-[10px] text-[#66786E] pt-1">
                  Engine: {livenessResult.provider}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </HeritageCard>
  );
};
