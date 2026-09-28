import React, { useState } from 'react';
import { axiosClient } from '@/shared/api/axiosClient';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { 
  Scan, 
  UserCheck, 
  ShieldCheck, 
  Camera, 
  FileText, 
  AlertTriangle, 
  Info, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Cpu, 
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

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
  isTampered?: boolean;
  reviewRequired?: boolean;
  rawJson?: string;
}

interface LivenessData {
  success: boolean;
  isLive: boolean;
  matchScore: number;
  isFaceMatched: boolean;
  provider: string;
  message: string;
  reviewRequired?: boolean;
}

interface EkycTestbenchProps {
  onNavigateToMarketplace?: () => void;
}

export const EkycTestbench: React.FC<EkycTestbenchProps> = ({ onNavigateToMarketplace }) => {
  // Mặc định Sandbox Mode = true để trải nghiệm kiểm thử hoạt động ngay 100%
  const [useSandbox, setUseSandbox] = useState<boolean>(true);
  const [selectedPreset, setSelectedPreset] = useState<'valid' | 'tampered' | 'custom'>('valid');
  const [fptApiKey, setFptApiKey] = useState<string>('');
  const [frontCardFile, setFrontCardFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  
  const [isScanningOcr, setIsScanningOcr] = useState<boolean>(false);
  const [isMatchingFace, setIsMatchingFace] = useState<boolean>(false);
  const [isRunningAll, setIsRunningAll] = useState<boolean>(false);

  const [ocrResult, setOcrResult] = useState<OcrData | null>(null);
  const [livenessResult, setLivenessResult] = useState<LivenessData | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [faceError, setFaceError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  const handleScanOcr = async () => {
    setIsScanningOcr(true);
    setOcrResult(null);
    setOcrError(null);

    const formData = new FormData();
    if (selectedPreset === 'custom' && frontCardFile) {
      formData.append('frontCard', frontCardFile);
    } else {
      const dummy = new Blob(['dummy'], { type: 'image/jpeg' });
      formData.append('frontCard', dummy, 'cccd_front.jpg');
    }
    
    formData.append('useSandbox', String(useSandbox));
    formData.append('preset', selectedPreset);
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
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string; rawJson?: string; errorMessage?: string } }; message?: string };
      setOcrError(
        axiosErr.response?.data?.errorMessage ||
        axiosErr.response?.data?.rawJson ||
        axiosErr.response?.data?.detail || 
        axiosErr.message || 
        'Lỗi gửi yêu cầu tới máy chủ eKYC.'
      );
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
    formData.append('cardImage', (selectedPreset === 'custom' ? frontCardFile : null) || dummy, 'card.jpg');
    formData.append('selfieImage', (selectedPreset === 'custom' ? selfieFile : null) || dummy, 'selfie.jpg');
    formData.append('useSandbox', String(useSandbox));
    formData.append('preset', selectedPreset);
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
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { detail?: string; message?: string } }; message?: string };
      setFaceError(axiosErr.response?.data?.detail || axiosErr.response?.data?.message || axiosErr.message || 'Lỗi gửi yêu cầu tới máy chủ eKYC.');
    } finally {
      setIsMatchingFace(false);
    }
  };

  const handleRunAll = async () => {
    setIsRunningAll(true);
    try {
      await handleScanOcr();
      await handleMatchFace();
    } finally {
      setIsRunningAll(false);
    }
  };

  return (
    <HeritageCard
      title="6. Thẩm Định Danh Tính eKYC (Chuẩn FPT.AI Vision SDK)"
      subtitle="Trích xuất OCR Căn cước công dân gắn chip và đối sánh khuôn mặt sinh trắc học (Liveness / Face Matching) với chế độ Sandbox / Enterprise Live."
      icon={<Scan className="w-5 h-5" />}
      badge={<HeritageBadge variant="forest">FPT.AI Vision Spec</HeritageBadge>}
    >
      <div className="space-y-6">
        {/* Banner Chính sách FPT.AI Console & Cầu nối Module 9 */}
        <div className="p-4 bg-gradient-to-r from-[#FAF6EE] to-[#F3EDE0] border border-[#D5C29E] rounded-xl text-xs space-y-2.5">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-[#B88E4C] shrink-0 mt-0.5" />
            <div className="space-y-1 text-[#4A453A] leading-relaxed">
              <span className="font-bold text-[#0B291E]">
                Thông cáo dịch vụ FPT Smart Cloud (Chính sách cập nhật 30/06/2026):
              </span>
              <p>
                Cổng FPT.AI Console (<code>console.fpt.ai</code>) đã <strong>ngừng vĩnh viễn việc cấp mới tài khoản cá nhân từ ngày 29/08/2026</strong>. 
                API Vision eKYC (<code>api.fpt.ai</code>) hiện chỉ dành riêng cho khách hàng Doanh nghiệp có hợp đồng B2B.
              </p>
              <p>
                Để phục vụ việc nghiệm thu và bảo vệ đồ án trơn tru, hệ thống hỗ trợ <strong>Chế độ Sandbox Chuẩn Hóa</strong> với đầy đủ cấu trúc dữ liệu trả về từ FPT SDK v3.2.
              </p>
            </div>
          </div>

          {onNavigateToMarketplace && (
            <div className="pt-2 border-t border-[#E4D5BE] flex items-center justify-between">
              <span className="text-[#6B5E43] font-medium flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#B88E4C]" />
                Bạn đang sở hữu API Key FPT Cloud Marketplace (<code>sk-...</code>)?
              </span>
              <button
                type="button"
                onClick={onNavigateToMarketplace}
                className="inline-flex items-center gap-1 px-3 py-1 bg-[#0B291E] text-[#F3E5C8] font-semibold rounded-lg hover:bg-[#133E2F] transition-colors cursor-pointer text-[11px]"
              >
                Chuyển sang Module 9 (Live VLM Gemma Vision)
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Thanh chuyển đổi Chế độ Engine & Bộ dữ liệu Preset */}
        <div className="p-4 bg-[#FBF7EE] border border-[#E8DCC6] rounded-xl text-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-[#0B291E] text-sm">Chế độ Kiểm thử eKYC:</span>
              <p className="text-[#66786E] text-[11px] mt-0.5">
                {useSandbox 
                  ? 'Chế độ Sandbox (Mô phỏng chuẩn hóa theo đúng cấu trúc FPT.AI SDK v3.2)' 
                  : 'Chế độ Live API (Kết nối trực tiếp tới cổng Doanh nghiệp api.fpt.ai)'}
              </p>
            </div>
            <div className="inline-flex rounded-lg border border-[#DCD9D0] bg-white p-0.5">
              <button
                type="button"
                onClick={() => setUseSandbox(true)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors text-xs cursor-pointer ${
                  useSandbox ? 'bg-[#0B291E] text-[#FAF9F5] shadow-xs' : 'text-[#66786E] hover:text-[#0B291E]'
                }`}
              >
                Sandbox Chuẩn (Khuyến nghị)
              </button>
              <button
                type="button"
                onClick={() => setUseSandbox(false)}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors text-xs cursor-pointer ${
                  !useSandbox ? 'bg-[#0B291E] text-[#FAF9F5] shadow-xs' : 'text-[#66786E] hover:text-[#0B291E]'
                }`}
              >
                Live B2B API
              </button>
            </div>
          </div>

          {/* Preset Selector */}
          {useSandbox && (
            <div className="pt-3 border-t border-[#E8DCC6] space-y-2">
              <label className="font-bold text-[#0B291E] block">Kịch bản dữ liệu mô phỏng chuẩn:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPreset('valid')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedPreset === 'valid'
                      ? 'bg-[#E5EDE8] border-[#0B291E] text-[#0B291E] ring-1 ring-[#0B291E]'
                      : 'bg-white border-[#DCD9D0] text-[#4A453A] hover:bg-[#F5F2EB]'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    Mẫu 1: CCCD Hợp Lệ
                  </div>
                  <div className="text-[10px] text-[#66786E] mt-0.5">
                    Nguyễn Văn An • Chip CCCD còn hạn • Liveness 94.2%
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPreset('tampered')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedPreset === 'tampered'
                      ? 'bg-[#FDF2F2] border-[#D9534F] text-[#B91C1C] ring-1 ring-[#D9534F]'
                      : 'bg-white border-[#DCD9D0] text-[#4A453A] hover:bg-[#F5F2EB]'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#D9534F]" />
                    Mẫu 2: Cảnh Báo An Ninh
                  </div>
                  <div className="text-[10px] text-[#66786E] mt-0.5">
                    Trần Thị Mai • Thẻ hết hạn 2023 • Nghi vấn chỉnh sửa
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPreset('custom')}
                  className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                    selectedPreset === 'custom'
                      ? 'bg-[#FBF7EE] border-[#B88E4C] text-[#0B291E] ring-1 ring-[#B88E4C]'
                      : 'bg-white border-[#DCD9D0] text-[#4A453A] hover:bg-[#F5F2EB]'
                  }`}
                >
                  <div className="font-bold flex items-center gap-1.5 text-xs">
                    <FileText className="w-3.5 h-3.5 text-[#B88E4C]" />
                    Mẫu 3: Tải Ảnh Riêng
                  </div>
                  <div className="text-[10px] text-[#66786E] mt-0.5">
                    Tải tệp ảnh thực tế từ thiết bị của bạn
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Ô nhập API Key nếu bật Live API */}
          {!useSandbox && (
            <div className="pt-3 border-t border-[#E8DCC6] space-y-1.5">
              <label className="font-semibold text-[#0B291E] block">
                FPT.AI Enterprise API Key (Cổng B2B <code>api.fpt.ai</code>):
              </label>
              <input
                type="password"
                placeholder="Nhập Enterprise API Key B2B FPT.AI..."
                value={fptApiKey}
                onChange={(e) => setFptApiKey(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-[#DCD9D0] rounded-md font-mono"
              />
              <span className="text-[11px] text-[#66786E] block">
                Lưu ý: Không dùng khóa <code>sk-...</code> của FPT Cloud AI Marketplace tại đây. Khóa <code>sk-...</code> được thiết kế cho Module 9 (Mô hình thị giác Gemma-3-27B-IT).
              </span>
            </div>
          )}
        </div>

        {/* Nút thực hiện 1-Click Toàn Quy Trình */}
        <div className="flex items-center justify-between p-3 bg-[#E5EDE8] border border-[#CBD5CB] rounded-xl">
          <div className="text-xs">
            <span className="font-bold text-[#0B291E]">Khuyến nghị Thử nghiệm:</span>
            <span className="text-[#3A5345] ml-1.5">
              Kiểm tra nhanh toàn bộ chu trình eKYC (Trích xuất CCCD + Đối sánh sinh trắc học) chỉ với 1 thao tác.
            </span>
          </div>
          <HeritageButton
            variant="primary"
            onClick={handleRunAll}
            isLoading={isRunningAll || isScanningOcr || isMatchingFace}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Chạy Toàn Bộ Chu Trình eKYC
          </HeritageButton>
        </div>

        {/* 2 Cột Thao Tác: OCR CCCD & Face Match */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* CỘT 1: OCR CCCD */}
          <div className="p-5 bg-white border border-[#DCD9D0] rounded-xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
              <h4 className="font-bold text-sm text-[#0B291E] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B88E4C]" />
                1. Trích Xuất OCR Căn Cước Công Dân
              </h4>
              <HeritageBadge variant={ocrResult?.isTampered ? 'danger' : 'neutral'}>
                {selectedPreset === 'valid' ? 'Mẫu Hợp Lệ' : selectedPreset === 'tampered' ? 'Mẫu Nghi Vấn' : 'Tùy chỉnh'}
              </HeritageBadge>
            </div>

            {selectedPreset === 'custom' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A453A] block">Chọn ảnh mặt trước CCCD:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFrontCardFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#E5EDE8] file:text-[#0B291E] file:font-medium cursor-pointer border border-[#DCD9D0] rounded-lg p-1"
                />
              </div>
            )}

            <HeritageButton
              onClick={handleScanOcr}
              isLoading={isScanningOcr}
              icon={<Scan className="w-4 h-4" />}
              className="w-full"
            >
              Quét & Trích Xuất Dữ Liệu OCR
            </HeritageButton>

            {ocrError && (
              <div className="p-3 bg-[#FDF2F2] border border-[#FECACA] rounded-lg text-xs text-[#D9534F] space-y-1">
                <span className="font-bold block flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-[#D9534F]" /> Phản hồi từ máy chủ eKYC:
                </span>
                <code className="text-[11px] font-mono break-all block whitespace-pre-wrap">{ocrError}</code>
              </div>
            )}

            {/* Hiển thị Giao diện Thẻ CCCD Trực Quan */}
            {ocrResult && ocrResult.success && (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border relative overflow-hidden transition-all ${
                  ocrResult.isTampered 
                    ? 'bg-[#FFF8F8] border-[#FECACA]' 
                    : 'bg-gradient-to-br from-[#FAF8F2] to-[#F1ECE1] border-[#D4C3A3]'
                }`}>
                  {/* Header thẻ CCCD */}
                  <div className="flex items-center justify-between border-b border-[#E2D5BC] pb-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <Cpu className="w-4 h-4 text-[#B88E4C]" />
                      <span className="font-bold tracking-wide text-[#0B291E]">CĂN CƯỚC CÔNG DÂN GẮN CHIP</span>
                    </div>
                    {ocrResult.isTampered ? (
                      <span className="px-2 py-0.5 bg-[#FEE2E2] text-[#B91C1C] rounded text-[10px] font-bold">
                        HẾT HẠN / GIAN LẬN
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-[#D1FAE5] text-[#065F46] rounded text-[10px] font-bold">
                        ĐÃ XÁC THỰC
                      </span>
                    )}
                  </div>

                  {/* Body thẻ CCCD */}
                  <div className="pt-3 grid grid-cols-3 gap-3">
                    <div className="col-span-1 flex flex-col items-center justify-center p-2 bg-white/70 border border-[#E2D5BC] rounded-lg">
                      <div className="w-14 h-18 bg-[#DCD9D0] rounded flex items-center justify-center text-[#66786E] text-[10px] font-bold">
                        ẢNH CHÂN DUNG
                      </div>
                      <span className="text-[9px] text-[#66786E] mt-1 font-mono">CHIP IC VERIFIED</span>
                    </div>

                    <div className="col-span-2 space-y-1 text-xs text-[#2A3F33]">
                      <div className="font-mono font-bold text-sm text-[#0B291E]">
                        Số: <span className="text-[#B88E4C]">{ocrResult.idCardNumber}</span>
                      </div>
                      <div className="font-bold uppercase text-[#0B291E]">{ocrResult.fullName}</div>
                      <div>• Ngày sinh: <strong>{ocrResult.dateOfBirth}</strong> ({ocrResult.gender})</div>
                      <div>• Quốc tịch: <strong>{ocrResult.nationality}</strong></div>
                      <div className="text-[11px] leading-tight">• Thường trú: {ocrResult.homeAddress}</div>
                      <div className="text-[11px] pt-1">
                        • Có giá trị đến: <strong className={ocrResult.isTampered ? 'text-[#B91C1C]' : 'text-[#0B291E]'}>{ocrResult.expiryDate}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Footer thẻ */}
                  <div className="mt-3 pt-2 border-t border-[#E2D5BC] flex items-center justify-between text-[10px] text-[#66786E]">
                    <span>Engine: {ocrResult.provider}</span>
                    <span className="font-medium text-[#0B291E]">Độ tin cậy: {(ocrResult.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CỘT 2: FACE MATCHING & LIVENESS */}
          <div className="p-5 bg-white border border-[#DCD9D0] rounded-xl space-y-4 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#EFECE6] pb-3">
              <h4 className="font-bold text-sm text-[#0B291E] flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#0B291E]" />
                2. Đối Sánh Khuôn Mặt & Liveness
              </h4>
              <HeritageBadge variant={livenessResult?.isFaceMatched ? 'success' : 'neutral'}>
                {livenessResult ? (livenessResult.isFaceMatched ? 'Khớp Sinh Trắc Học' : 'Không Khớp') : 'Chờ kiểm tra'}
              </HeritageBadge>
            </div>

            {selectedPreset === 'custom' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A453A] block">Chọn ảnh selfie trực diện:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelfieFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-[#E5EDE8] file:text-[#0B291E] file:font-medium cursor-pointer border border-[#DCD9D0] rounded-lg p-1"
                />
              </div>
            )}

            <HeritageButton
              variant="gold"
              onClick={handleMatchFace}
              isLoading={isMatchingFace}
              icon={<UserCheck className="w-4 h-4" />}
              className="w-full"
            >
              Kiểm Tra Liveness & Đối Sánh Khuôn Mặt
            </HeritageButton>

            {faceError && (
              <div className="p-3 bg-[#FDF2F2] border border-[#FECACA] rounded-lg text-xs text-[#D9534F] space-y-1">
                <span className="font-bold block flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-[#D9534F]" /> Phản hồi từ máy chủ eKYC:
                </span>
                <code className="text-[11px] font-mono break-all block whitespace-pre-wrap">{faceError}</code>
              </div>
            )}

            {/* Hiển thị Kết quả Đối Sánh Sinh Trắc Học */}
            {livenessResult && (
              <div className="space-y-3">
                <div className={`p-4 rounded-xl border space-y-3 transition-all ${
                  livenessResult.isFaceMatched
                    ? 'bg-[#EBF7F0] border-[#A7F3D0]'
                    : 'bg-[#FFF5F5] border-[#FED7D7]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={`w-5 h-5 ${livenessResult.isFaceMatched ? 'text-[#059669]' : 'text-[#D9534F]'}`} />
                      <span className="font-bold text-sm text-[#0B291E]">
                        {livenessResult.isFaceMatched ? 'Xác Thực Sinh Trắc Học Thành Công' : 'Cảnh Báo Không Trùng Khớp'}
                      </span>
                    </div>
                    <span className={`text-base font-extrabold font-mono ${
                      livenessResult.isFaceMatched ? 'text-[#059669]' : 'text-[#D9534F]'
                    }`}>
                      {(livenessResult.matchScore * 100).toFixed(1)}%
                    </span>
                  </div>

                  {/* Thanh tiến trình tỉ lệ khớp */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#66786E]">
                      <span>Ngưỡng chuẩn tối thiểu: 80.0%</span>
                      <span>Kết quả: {(livenessResult.matchScore * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-black/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          livenessResult.isFaceMatched ? 'bg-[#059669]' : 'bg-[#D9534F]'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, livenessResult.matchScore * 100))}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-[#2A3F33] leading-relaxed">
                    {livenessResult.message}
                  </p>

                  <div className="pt-2 border-t border-black/10 flex items-center justify-between text-[10px] text-[#66786E]">
                    <span>Thuật toán: {livenessResult.provider}</span>
                    <span className="font-medium">
                      Anti-Spoofing: {livenessResult.isLive ? '✓ Đạt chuẩn Liveness' : '✗ Nghi vấn gian lận'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collapsible Accordion: Raw JSON Payload Viewer */}
        {ocrResult?.rawJson && (
          <div className="border border-[#DCD9D0] rounded-xl bg-white overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setShowRawJson(!showRawJson)}
              className="w-full px-4 py-2.5 bg-[#FAF9F5] flex items-center justify-between font-medium text-[#0B291E] cursor-pointer hover:bg-[#F5F2EB]"
            >
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-[#B88E4C]" />
                Xem Cấu Trúc Payload JSON Chuẩn FPT.AI
              </span>
              {showRawJson ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showRawJson && (
              <div className="p-3 bg-[#1E293B] text-[#E2E8F0] font-mono text-[11px] overflow-x-auto max-h-60">
                <pre>{JSON.stringify(JSON.parse(ocrResult.rawJson), null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </HeritageCard>
  );
};
