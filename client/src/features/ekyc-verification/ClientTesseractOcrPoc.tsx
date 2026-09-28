/**
 * @file ClientTesseractOcrPoc.tsx
 * @description Thành phần PoC trích xuất ký tự OCR CCCD ngay trong trình duyệt bằng Tesseract.js (WASM)
 */

import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { 
  FileText, 
  Upload, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Sparkles,
  FileCheck,
  RefreshCw,
  Eye,
  BarChart3
} from 'lucide-react';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { TesseractBenchmarkSuite } from './TesseractBenchmarkSuite';

interface ExtractedFields {
  idCardNumber?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  origin?: string;
  residence?: string;
  expiryDate?: string;
}

export const ClientTesseractOcrPoc: React.FC = () => {
  const [viewMode, setViewMode] = useState<'playground' | 'benchmark'>('playground');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [usePreprocessing, setUsePreprocessing] = useState<boolean>(true);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [rawText, setRawText] = useState<string>('');
  const [extracted, setExtracted] = useState<ExtractedFields | null>(null);
  const [executionTimeMs, setExecutionTimeMs] = useState<number | null>(null);

  // HTML5 Canvas Preprocessing: Grayscale & Contrast stretching to clear background noise
  const preprocessImage = (imageSrc: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(imageSrc);

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // Grayscale luminance
          let gray = 0.299 * r + 0.587 * g + 0.114 * b;
          // Contrast boost to make dark text stand out against faint background guilloche patterns
          gray = (gray - 128) * 1.45 + 128;
          gray = Math.max(0, Math.min(255, gray));

          data[i] = gray;
          data[i + 1] = gray;
          data[i + 2] = gray;
        }

        ctx.putImageData(imgData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(imageSrc);
      img.src = imageSrc;
    });
  };

  // Layout-aware parser for Vietnamese CCCD
  const parseIdCardFields = (text: string): ExtractedFields => {
    const fields: ExtractedFields = {};

    // 12-digit citizen ID pattern
    const idMatch = text.match(/\b(\d{12})\b/);
    if (idMatch) fields.idCardNumber = idMatch[1];

    // Dates (Date of birth and Date of expiry)
    const dates = [...text.matchAll(/\b(\d{2}[\/\.-]\d{2}[\/\.-]\d{4})\b/g)].map((m) => m[1]);
    if (dates.length > 0) fields.dateOfBirth = dates[0];
    if (dates.length > 1) fields.expiryDate = dates[1];

    // Name: Look strictly between the 12-digit ID line and the birth date line
    const betweenIdAndDob = text.match(/\b\d{12}\b[\s\S]*?(?:sinh|birth|ngày|\d{2}\/\d{2}\/\d{4})/i);
    if (betweenIdAndDob) {
      const segment = betweenIdAndDob[0];
      const lines = segment.split('\n');
      for (const l of lines) {
        const m = l.match(/([A-ZÀ-Ỹ]{2,}(?:\s+[A-ZÀ-Ỹ]{2,}){1,4})/);
        if (m && !m[1].includes('CAN CUOC') && !m[1].includes('CONG DAN')) {
          fields.fullName = m[1].trim();
          break;
        }
      }
    }

    // Fallback name search
    if (!fields.fullName) {
      const lines = text.split('\n');
      for (const l of lines) {
        const cleaned = l.replace(/^[^a-zA-ZÀ-Ỹ]+/, '').replace(/[^a-zA-ZÀ-Ỹ\s]+$/, '').trim();
        const m = cleaned.match(/([A-ZÀ-Ỹ]{2,}(?:\s+[A-ZÀ-Ỹ]{2,}){1,4})/);
        if (m) {
          const candidate = m[1].trim();
          const forbidden = ['CONG HOA', 'SOCIALIST', 'REPUBLIC', 'CAN CUOC', 'CONG DAN', 'VIET NAM', 'CHỦ NGHĨA', 'ĐỘC LẬP'];
          if (!forbidden.some((f) => candidate.includes(f))) {
            fields.fullName = candidate;
            break;
          }
        }
      }
    }

    // Gender
    if (/Nam/i.test(text)) fields.gender = 'Nam';
    else if (/Nữ/i.test(text)) fields.gender = 'Nữ';

    // Nationality
    if (/Việt\s*Nam|Việt\s*Mam/i.test(text)) fields.nationality = 'Việt Nam';

    // Origin (Quê quán)
    const originMatch = text.match(/(?:origin|Quê quán)[\s\S]*?\n([\s\S]*?)(?:residence|thường trú|$)/i);
    if (originMatch) {
      const raw = originMatch[1].replace(/^[^\wÀ-ỹ]+/gm, '').trim();
      const parts = raw.split('\n').map((s) => s.trim()).filter((s) => s.length > 3 && !s.includes('Place') && !s.includes('residence'));
      if (parts.length > 0) fields.origin = parts.join(', ');
    }

    // Residence (Nơi thường trú)
    const resMatch = text.match(/(?:residence|thường trú)[\s\S]*?\n?([\s\S]*?)(?:có giá trị|expiry|$)/i);
    if (resMatch) {
      const raw = resMatch[1].replace(/^[^\wÀ-ỹ]+/gm, '').trim();
      const parts = raw.split('\n').map((s) => s.trim()).filter((s) => s.length > 3 && !s.includes('expiry') && !s.includes('giá trị'));
      if (parts.length > 0) fields.residence = parts.join(', ');
    }

    return fields;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setRawText('');
        setExtracted(null);
        setExecutionTimeMs(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunOcr = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setProgressStatus('Đang tiền xử lý ảnh (Lọc nhiễu & tăng tương phản)...');
    setProgressPercent(5);
    setRawText('');
    setExtracted(null);

    const startTime = performance.now();

    try {
      const imageToProcess = usePreprocessing ? await preprocessImage(selectedImage) : selectedImage;

      setProgressStatus('Đang khởi tạo Tesseract.js WASM Engine...');
      setProgressPercent(15);

      const result = await Tesseract.recognize(imageToProcess, 'vie+eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgressStatus('Đang nhận diện ký tự quang học (OCR)...');
            setProgressPercent(15 + Math.round(m.progress * 85));
          } else if (m.status.includes('loading')) {
            setProgressStatus(`Đang nạp mô hình ngôn ngữ: ${m.status}...`);
          }
        },
      });

      const text = result.data.text;
      setRawText(text);
      const parsed = parseIdCardFields(text);
      setExtracted(parsed);
      setExecutionTimeMs(Math.round(performance.now() - startTime));
      setProgressStatus('Hoàn thành trích xuất');
      setProgressPercent(100);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Lỗi trong quá trình nhận diện Tesseract.js';
      setProgressStatus(`Thất bại: ${msg}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Academic Disclaimer Alert Box */}
      <div className="p-4 bg-amber-50/90 border border-amber-300 rounded-xl text-xs space-y-2">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 text-amber-950">
            <p className="font-bold uppercase tracking-wide flex items-center gap-1.5 text-amber-900">
              <span>Phạm vi thử nghiệm: Client-side OCR PoC (Tesseract.js WASM)</span>
              <HeritageBadge variant="gold">Thử nghiệm độc lập</HeritageBadge>
            </p>
            <p className="leading-relaxed">
              <strong>Tuyên bố giới hạn kỹ thuật:</strong> Module này chạy 100% trong bộ nhớ trình duyệt Client, không gửi ảnh ra bất kỳ máy chủ bên ngoài nào.
              Việc nhận diện được ký tự chữ <em>không đồng nghĩa Căn cước công dân là thật</em>. Đồ án cần đo lường độ chính xác (Precision / Recall) trên bộ dữ liệu kiểm thử.
              Trong môi trường sản xuất (Production), việc xác minh tính pháp lý bắt buộc phải đối soát với CSDL Quốc gia về dân cư hoặc đọc chip NFC ICAO.
            </p>
          </div>
        </div>
      </div>

      {/* Mode Switcher: Playground vs Benchmark Suite */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#EFECE6] border border-[#DCD9D0] rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setViewMode('playground')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            viewMode === 'playground'
              ? 'bg-[#0B291E] text-white shadow-xs'
              : 'text-[#44554C] hover:text-[#0B291E] hover:bg-white/60'
          }`}
        >
          <Upload className="w-3.5 h-3.5 text-[#B88E4C]" />
          <span>1. Tải ảnh & Trích xuất tự do (Playground)</span>
        </button>

        <button
          type="button"
          onClick={() => setViewMode('benchmark')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            viewMode === 'benchmark'
              ? 'bg-[#0B291E] text-white shadow-xs'
              : 'text-[#44554C] hover:text-[#0B291E] hover:bg-white/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-amber-500" />
          <span>2. Bộ Bài Kiểm Thử Benchmark Đa Kịch Bản (5 Test Cases)</span>
        </button>
      </div>

      {viewMode === 'benchmark' && <TesseractBenchmarkSuite />}

      {/* Upload and Control Area (Playground Mode) */}
      {viewMode === 'playground' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Left: Input Card */}
          <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCD9D0]">
            <h4 className="text-xs font-bold text-[#0B291E] flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#B88E4C]" />
              <span>1. Tải ảnh mặt trước CCCD gắn chip</span>
            </h4>
            <span className="text-[11px] text-[#66786E]">Định dạng JPG/PNG</span>
          </div>

          <div className="border-2 border-dashed border-[#DCD9D0] hover:border-[#B88E4C] rounded-lg p-4 text-center transition-colors">
            {selectedImage ? (
              <div className="space-y-3">
                <img
                  src={selectedImage}
                  alt="Ảnh CCCD tải lên"
                  className="max-h-48 mx-auto rounded-md object-contain shadow-xs border border-[#DCD9D0]"
                />
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EFECE6] text-[#0B291E] text-xs font-semibold rounded-md hover:bg-[#DCD9D0] cursor-pointer">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Chọn ảnh khác</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-6 cursor-pointer space-y-2">
                <FileText className="w-8 h-8 text-[#B88E4C]" />
                <span className="text-xs font-semibold text-[#0B291E]">Nhấn vào đây để tải ảnh CCCD mẫu</span>
                <span className="text-[11px] text-[#66786E]">Hoặc chụp ảnh rõ nét mặt trước</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>
            )}
          </div>

          {/* Preprocessing toggle */}
          <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-[#DCD9D0] text-xs">
            <span className="text-[#44554C]">Bộ lọc tương phản & làm sạch nền:</span>
            <label className="flex items-center gap-1.5 cursor-pointer font-semibold text-[#0B291E]">
              <input
                type="checkbox"
                checked={usePreprocessing}
                onChange={(e) => setUsePreprocessing(e.target.checked)}
                className="rounded text-[#0B291E] focus:ring-[#B88E4C]"
              />
              <span>Bật bộ lọc Grayscale + Contrast</span>
            </label>
          </div>

          <HeritageButton
            variant="primary"
            onClick={handleRunOcr}
            disabled={!selectedImage || isProcessing}
            isLoading={isProcessing}
            className="w-full text-xs py-2.5"
          >
            <Sparkles className="w-4 h-4 mr-1 text-[#B88E4C]" />
            <span>Thực thi OCR Tesseract.js (Trình duyệt)</span>
          </HeritageButton>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] font-mono text-[#44554C]">
                <span>{progressStatus}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B88E4C] transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Extracted Result Card */}
        <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD9D0]">
              <h4 className="text-xs font-bold text-[#0B291E] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>2. Dữ liệu trích xuất từ Tesseract.js</span>
              </h4>
              {executionTimeMs !== null && (
                <span className="text-[10px] font-mono text-[#66786E] bg-black/5 px-2 py-0.5 rounded">
                  Thời gian: {executionTimeMs} ms
                </span>
              )}
            </div>

            {extracted ? (
              <div className="space-y-3 pt-3">
                <div className="p-3 bg-white rounded-lg border border-[#DCD9D0] space-y-2 text-xs">
                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="text-[#66786E]">Số CCCD (12 chữ số):</span>
                    <span className="font-mono font-bold text-[#0B291E]">
                      {extracted.idCardNumber || <span className="text-slate-400 italic">Chưa nhận diện được</span>}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="text-[#66786E]">Họ và tên:</span>
                    <span className="font-bold text-[#0B291E]">
                      {extracted.fullName || <span className="text-slate-400 italic">Chưa nhận diện được</span>}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="text-[#66786E]">Ngày sinh:</span>
                    <span className="font-mono text-[#0B291E]">
                      {extracted.dateOfBirth || <span className="text-slate-400 italic">Chưa nhận diện được</span>}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="text-[#66786E]">Giới tính & Quốc tịch:</span>
                    <span className="text-[#0B291E]">
                      {extracted.gender || '---'} • {extracted.nationality || 'Việt Nam'}
                    </span>
                  </div>

                  <div className="flex justify-between border-b border-black/5 pb-1">
                    <span className="text-[#66786E]">Có giá trị đến (Hạn dùng):</span>
                    <span className="font-mono text-[#0B291E]">
                      {extracted.expiryDate || <span className="text-slate-400 italic">---</span>}
                    </span>
                  </div>

                  {extracted.origin && (
                    <div className="flex justify-between border-b border-black/5 pb-1">
                      <span className="text-[#66786E]">Quê quán:</span>
                      <span className="text-[#0B291E] text-right max-w-[60%]">{extracted.origin}</span>
                    </div>
                  )}

                  {extracted.residence && (
                    <div className="flex justify-between">
                      <span className="text-[#66786E]">Nơi thường trú:</span>
                      <span className="text-[#0B291E] text-right max-w-[60%]">{extracted.residence}</span>
                    </div>
                  )}
                </div>

                {/* Raw Text Output */}
                <div>
                  <span className="text-[11px] font-bold text-[#66786E] block mb-1">
                    Ký tự thô nhận dạng được (Raw OCR Text):
                  </span>
                  <pre className="p-2.5 bg-[#14241C] text-emerald-400 font-mono text-[10px] rounded-lg max-h-32 overflow-y-auto leading-relaxed">
                    {rawText || 'Không có ký tự nhận diện'}
                  </pre>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-[#66786E] space-y-1">
                <Eye className="w-8 h-8 text-slate-300 mx-auto" />
                <p>Chưa có kết quả nhận diện.</p>
                <p className="text-[11px] text-slate-400">Tải ảnh CCCD ở khung bên trái và bấm thực thi OCR.</p>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-[#DCD9D0] text-[10px] text-[#66786E] flex items-center justify-between">
            <span>Mô hình: Tesseract.js (vie + eng)</span>
            <span className="text-emerald-700 font-semibold">100% In-Browser WebAssembly</span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};
