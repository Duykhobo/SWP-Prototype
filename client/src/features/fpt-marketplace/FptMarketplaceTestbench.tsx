import React, { useState, useEffect } from 'react';
import { axiosClient } from '@/shared/api/axiosClient';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { 
  Bot, 
  Eye, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Lock, 
  FileText, 
  Sparkles,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

interface FptModelDto {
  id: string;
  name: string;
  contextLength: number;
  inputModalities: string[];
  outputModalities: string[];
  description: string;
}

interface FptModelListResponse {
  success: boolean;
  models: FptModelDto[];
  provider: string;
  latencyMs: number;
  errorMessage?: string;
}

interface ClauseReviewResponse {
  success: boolean;
  modelId: string;
  presetTitle: string;
  generatedContent: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  disclaimer: string;
  errorMessage?: string;
}

interface VisionExtractResponse {
  success: boolean;
  modelId: string;
  presetTitle: string;
  generatedContent: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  latencyMs: number;
  disclaimer: string;
  errorMessage?: string;
}

interface SyntheticClausePreset {
  id: string;
  title: string;
  description: string;
  content: string;
}

const CLAUSE_PRESETS: SyntheticClausePreset[] = [
  {
    id: 'preset_clause_review_644',
    title: 'Tình huống cần rà soát: Phân chia di sản liên quan đến Điều 644 BLDS 2015',
    description: 'Điều khoản phân chia toàn bộ di sản cho bên thứ ba, không phân bổ cho cha mẹ già hoặc con chưa thành niên.',
    content: 'Tôi là chủ sở hữu hợp pháp ngôi nhà tại số 123 đường Lê Lợi, TP.HCM. Trong di chúc này, tôi quyết định để lại toàn bộ căn nhà cho bạn thân của tôi là ông Nguyễn Văn A. Cha mẹ đẻ và con trai 15 tuổi của tôi sẽ không được hưởng bất kỳ phần tài sản nào.'
  },
  {
    id: 'preset_clause_review_ratio',
    title: 'Tình huống cần rà soát: Tổng tỷ lệ phân chia tài sản vượt quá 100%',
    description: 'Điều khoản phân chia tỷ lệ cổ phần công ty với tổng tỷ lệ cộng dồn là 130%.',
    content: 'Tôi lập di chúc phân chia 1.000 cổ phần của tôi tại Công ty Cổ phần Di Sản X như sau: Để lại 60% cổ phần cho con trai cả, 50% cổ phần cho con gái thứ hai, và 20% cổ phần cho người thừa kế thứ ba.'
  },
  {
    id: 'preset_clause_review_standard',
    title: 'Tình huống điều khoản cơ bản: Chỉ định người giám hộ và phân chia tài sản theo mốc tuổi',
    description: 'Điều khoản chỉ định người giám hộ quản lý di sản cho đến khi con đủ tuổi trưởng thành.',
    content: 'Tôi để lại toàn bộ sổ tiết kiệm 500 triệu đồng tại ngân hàng cho con gái tôi. Do con gái tôi hiện mới 12 tuổi, tôi chỉ định anh trai tôi là ông Lê Văn C làm người giám hộ quản lý số tiền này. Khi con gái tôi đủ 20 tuổi, ông C có trách nhiệm bàn giao toàn bộ gốc và lãi.'
  }
];

export const FptMarketplaceTestbench: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clause' | 'vision' | 'models' | 'custom'>('clause');
  
  // Model directory state
  const [modelsData, setModelsData] = useState<FptModelListResponse | null>(null);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Clause review state
  const [selectedPreset, setSelectedPreset] = useState<SyntheticClausePreset>(CLAUSE_PRESETS[0]);
  const [isReviewingClause, setIsReviewingClause] = useState(false);
  const [clauseResult, setClauseResult] = useState<ClauseReviewResponse | null>(null);
  const [clauseError, setClauseError] = useState<string | null>(null);

  // Vision extract state
  const [isExtractingVision, setIsExtractingVision] = useState(false);
  const [visionResult, setVisionResult] = useState<VisionExtractResponse | null>(null);
  const [visionError, setVisionError] = useState<string | null>(null);

  // Load models once
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    setIsLoadingModels(true);
    setModelsError(null);
    try {
      const res = await axiosClient.get<FptModelListResponse>('/api/v1/fpt-marketplace/models');
      setModelsData(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setModelsError(e.response?.data?.detail || e.message || 'Không thể lấy danh sách mô hình từ FPT Cloud.');
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleRunClauseReview = async () => {
    setIsReviewingClause(true);
    setClauseResult(null);
    setClauseError(null);

    try {
      const res = await axiosClient.post<ClauseReviewResponse>('/api/v1/fpt-marketplace/clause-review', {
        presetId: selectedPreset.id,
        title: selectedPreset.title,
        willContent: selectedPreset.content,
        isSyntheticPreset: true
      });
      setClauseResult(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setClauseError(e.response?.data?.detail || e.message || 'Lỗi khi gọi mô hình Saola-Small-32B.');
    } finally {
      setIsReviewingClause(false);
    }
  };

  const handleRunVisionExtract = async () => {
    setIsExtractingVision(true);
    setVisionResult(null);
    setVisionError(null);

    try {
      const res = await axiosClient.post<VisionExtractResponse>('/api/v1/fpt-marketplace/vision-extract', {
        presetId: 'preset_synthetic_cert',
        title: 'Tài liệu mẫu giả định: Giấy chứng nhận quyền sở hữu mẫu thử nghiệm',
        prompt: 'Hãy mô tả nội dung chính và các chi tiết có thể nhận biết được từ bức ảnh tài liệu mẫu này bằng tiếng Việt.',
        isSyntheticPreset: true
      });
      setVisionResult(res.data);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string };
      setVisionError(e.response?.data?.detail || e.message || 'Lỗi khi gọi mô hình gemma-3-27b-it.');
    } finally {
      setIsExtractingVision(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-stone-900 to-stone-800 p-6 rounded-xl border border-amber-900/40 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono tracking-widest text-amber-500 uppercase font-semibold">MODULE 9 • FPT CLOUD</span>
            <HeritageBadge variant="success">100% Live FPT AI Marketplace</HeritageBadge>
            <HeritageBadge variant="neutral">Server-Side Secret Key</HeritageBadge>
          </div>
          <h2 className="text-xl font-serif font-bold text-amber-100 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-amber-400" />
            FPT AI Marketplace — Trợ Lý Rà Soát & Thị Giác Đa Phương Thức
          </h2>
          <p className="text-xs text-stone-400 mt-1 max-w-3xl leading-relaxed">
            Kết nối trực tiếp máy chủ FPT Cloud (<code className="text-amber-300 font-mono">mkp-api.fptcloud.com</code>) với các mô hình thế hệ mới: 
            <strong> Saola-Small-32B</strong> (LLM pháp lý tiếng Việt) và <strong>gemma-3-27b-it</strong> (Vision Multimodal).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <HeritageButton 
            variant="outline" 
            onClick={fetchModels} 
            isLoading={isLoadingModels}
          >
            Làm mới mô hình FPT
          </HeritageButton>
        </div>
      </div>

      {/* P0 Security & Zero-Knowledge Alert Banner */}
      <div className="p-4 bg-amber-950/30 border border-amber-500/40 rounded-lg flex items-start gap-3 text-amber-200 text-xs leading-relaxed">
        <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 font-semibold block mb-0.5">
            Nguyên Tắc Bảo Mật Zero-Knowledge & An Toàn Dữ Liệu
          </strong>
          Tài sản và nội dung di chúc trong kho lưu trữ LegacyVault luôn được mã hóa phong bì (Envelope Encryption) và 
          <strong> không bao giờ tự động giải mã gửi ra dịch vụ AI bên ngoài</strong>. Bản demo này 
          <strong> chỉ chấp nhận kịch bản mẫu giả lập (Synthetic Presets)</strong>. Mọi tác vụ AI chỉ mang tính chất 
          <strong> Gợi ý tham khảo (Advisory Only)</strong>, không thay thế kiểm tra eKYC hay thẩm định viên con người; 
          tính toàn vẹn tệp tin bắt buộc phải xác thực bằng mã băm SHA-256 / Chữ ký số.
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex gap-2 border-b border-stone-800 pb-2">
        <button
          onClick={() => setActiveTab('clause')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'clause'
              ? 'bg-amber-900/40 text-amber-200 border border-amber-700/50 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Bot className="w-4 h-4 text-amber-400" />
          1. Gợi Ý Rà Soát Điều Khoản (Saola-Small-32B)
        </button>

        <button
          onClick={() => setActiveTab('vision')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'vision'
              ? 'bg-amber-900/40 text-amber-200 border border-amber-700/50 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Eye className="w-4 h-4 text-amber-400" />
          2. Trích Xuất Tài Liệu Mẫu (gemma-3-27b-it VLM)
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'models'
              ? 'bg-amber-900/40 text-amber-200 border border-amber-700/50 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Cpu className="w-4 h-4 text-amber-400" />
          3. Danh Mục Mô Hình FPT Cloud ({modelsData?.models?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'custom'
              ? 'bg-amber-900/40 text-amber-200 border border-amber-700/50 shadow'
              : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
          }`}
        >
          <Lock className="w-4 h-4 text-stone-500" />
          Nhập Tự Do / Tải Tệp Riêng (Opt-in)
        </button>
      </div>

      {/* TAB 1: CLAUSE REVIEW */}
      {activeTab === 'clause' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Preset Selector & Input Preview */}
          <div className="lg:col-span-5 space-y-4">
            <HeritageCard title="Chọn Kịch Bản Điều Khoản Mẫu (Synthetic Preset)">
              <div className="space-y-3">
                <p className="text-xs text-stone-400 leading-relaxed">
                  Chọn một trong các tình huống mẫu giả lập dưới đây để gửi sang mô hình <strong>Saola-Small-32B</strong> của FPT phân tích:
                </p>

                <div className="space-y-2">
                  {CLAUSE_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      onClick={() => {
                        setSelectedPreset(preset);
                        setClauseResult(null);
                        setClauseError(null);
                      }}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedPreset.id === preset.id
                          ? 'bg-amber-950/40 border-amber-500/70 text-amber-100 shadow-sm'
                          : 'bg-stone-900/60 border-stone-800 text-stone-300 hover:border-stone-700 hover:bg-stone-800/40'
                      }`}
                    >
                      <div className="text-xs font-semibold text-amber-300 mb-1 flex items-center justify-between">
                        <span>{preset.title}</span>
                        {selectedPreset.id === preset.id && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400">{preset.description}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-stone-800">
                  <label className="text-[11px] font-mono text-stone-400 uppercase tracking-wider block mb-1">
                    Nội dung điều khoản gửi đi (Synthetic Data):
                  </label>
                  <div className="p-3 bg-stone-950 rounded border border-stone-800 text-xs text-stone-300 font-serif leading-relaxed italic">
                    "{selectedPreset.content}"
                  </div>
                </div>

                <HeritageButton
                  variant="primary"
                  className="w-full mt-2"
                  onClick={handleRunClauseReview}
                  isLoading={isReviewingClause}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gửi Phân Tích Sang Saola-Small-32B (Live)
                </HeritageButton>
              </div>
            </HeritageCard>
          </div>

          {/* Result Inspection */}
          <div className="lg:col-span-7 space-y-4">
            <HeritageCard title="Kết Quả Rà Soát Từ FPT Cloud AI Marketplace">
              {clauseError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Lỗi suy luận:</strong> {clauseError}
                  </div>
                </div>
              )}

              {clauseResult ? (
                <div className="space-y-4">
                  {/* Block 1: Technical API Metadata */}
                  <div className="p-3 bg-stone-900/80 rounded-lg border border-stone-800">
                    <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>1. Thông Số Vận Hành API (Thực Tế)</span>
                      <HeritageBadge variant="success">HTTP 200 OK</HeritageBadge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 bg-stone-950 rounded border border-stone-800/60">
                        <span className="text-[10px] text-stone-500 block">Mô hình</span>
                        <strong className="text-amber-300 font-mono">{clauseResult.modelId}</strong>
                      </div>
                      <div className="p-2 bg-stone-950 rounded border border-stone-800/60">
                        <span className="text-[10px] text-stone-500 block">Độ trễ phản hồi</span>
                        <strong className="text-emerald-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {clauseResult.latencyMs} ms
                        </strong>
                      </div>
                      <div className="p-2 bg-stone-950 rounded border border-stone-800/60">
                        <span className="text-[10px] text-stone-500 block">Prompt Tokens</span>
                        <strong className="text-stone-300 font-mono">{clauseResult.promptTokens}</strong>
                      </div>
                      <div className="p-2 bg-stone-950 rounded border border-stone-800/60">
                        <span className="text-[10px] text-stone-500 block">Completion Tokens</span>
                        <strong className="text-stone-300 font-mono">{clauseResult.completionTokens}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Block 2: AI Generated Output */}
                  <div className="p-4 bg-stone-950 rounded-lg border border-amber-900/30">
                    <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Bot className="w-3.5 h-3.5" />
                      2. Gợi Ý Nhận Xét Từ AI:
                    </div>
                    <div className="text-xs text-stone-200 leading-relaxed whitespace-pre-wrap font-sans bg-stone-900/60 p-3 rounded border border-stone-800">
                      {clauseResult.generatedContent || '(Mô hình không trả về nội dung)'}
                    </div>
                  </div>

                  {/* Block 3: Human Verification & Disclaimer */}
                  <div className="p-3 bg-stone-900/40 rounded border border-amber-800/40 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>3. Cảnh Báo Thẩm Định (Human-in-the-loop):</strong> {clauseResult.disclaimer}
                      <div className="text-stone-400 mt-1">
                        - Đầu ra cần được Công chứng viên / Người thẩm định kiểm tra lại.<br />
                        - Chưa xác minh độ chính xác pháp lý tuyệt đối của câu trả lời AI.<br />
                        - Tính toàn vẹn của văn bản di chúc phải được bảo vệ bằng chữ ký số và mã băm SHA-256.
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-stone-500 text-xs">
                  <Bot className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                  Chưa có kết quả. Hãy chọn một kịch bản và nhấn "Gửi Phân Tích Sang Saola-Small-32B".
                </div>
              )}
            </HeritageCard>
          </div>
        </div>
      )}

      {/* TAB 2: VISION EXTRACT */}
      {activeTab === 'vision' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-4">
            <HeritageCard title="Tài Liệu Mẫu Giả Định (Synthetic VLM Preset)">
              <div className="space-y-3">
                <p className="text-xs text-stone-400 leading-relaxed">
                  Mô hình <strong>gemma-3-27b-it</strong> tiếp nhận ảnh tài liệu mẫu giả định (Synthetic Dummy Graphic) để thực hiện tác vụ hỏi đáp và mô tả hình ảnh:
                </p>

                {/* Dummy Image Preview */}
                <div className="p-4 bg-stone-950 rounded-lg border border-stone-800 flex flex-col items-center justify-center text-center">
                  <div className="w-32 h-32 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-inner mb-2 border border-emerald-400/40">
                    <FileText className="w-12 h-12 text-white/90" />
                  </div>
                  <span className="text-xs font-semibold text-stone-300">Tài Liệu Mẫu Giả Định #01</span>
                  <span className="text-[10px] text-stone-500">Kích thước: 512x512 PNG • Synthetic Graphic</span>
                </div>

                <div className="p-2.5 bg-stone-900/60 rounded border border-stone-800 text-[11px] text-stone-400">
                  <span className="text-amber-400 font-mono">Prompt gửi đi:</span> "Hãy mô tả nội dung chính và các chi tiết có thể nhận biết được từ bức ảnh tài liệu mẫu này bằng tiếng Việt."
                </div>

                <HeritageButton
                  variant="primary"
                  className="w-full"
                  onClick={handleRunVisionExtract}
                  isLoading={isExtractingVision}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Gửi Phân Tích Sang gemma-3-27b-it (Live VLM)
                </HeritageButton>
              </div>
            </HeritageCard>
          </div>

          <div className="lg:col-span-7 space-y-4">
            <HeritageCard title="Kết Quả Trích Xuất Thị Giác (Vision Language Model)">
              {visionError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <strong>Lỗi VLM:</strong> {visionError}
                  </div>
                </div>
              )}

              {visionResult ? (
                <div className="space-y-4">
                  {/* Metadata */}
                  <div className="p-3 bg-stone-900/80 rounded-lg border border-stone-800">
                    <div className="text-[11px] font-mono text-stone-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                      <span>1. Thông Số Vận Hành VLM (Thực Tế)</span>
                      <HeritageBadge variant="success">HTTP 200 OK</HeritageBadge>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div className="p-2 bg-stone-950 rounded border border-stone-800/60">
                        <span className="text-[10px] text-stone-500 block">Mô hình VLM</span>
                        <strong className="text-amber-300 font-mono">{visionResult.modelId}</strong>
                      </div>
                      <div className="p-2 bg-stone-950 rounded border border-stone-800/60">
                        <span className="text-[10px] text-stone-500 block">Độ trễ VLM</span>
                        <strong className="text-emerald-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {visionResult.latencyMs} ms
                        </strong>
                      </div>
                      <div className="p-2 bg-stone-950 rounded border border-stone-800/60">
                        <span className="text-[10px] text-stone-500 block">Prompt Tokens</span>
                        <strong className="text-stone-300 font-mono">{visionResult.promptTokens}</strong>
                      </div>
                      <div className="p-2 bg-stone-950 rounded border border-stone-800/60">
                        <span className="text-[10px] text-stone-500 block">Completion Tokens</span>
                        <strong className="text-stone-300 font-mono">{visionResult.completionTokens}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Generated text */}
                  <div className="p-4 bg-stone-950 rounded-lg border border-amber-900/30">
                    <div className="text-[11px] font-mono text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      2. Mô Tả Nội Dung Thị Giác Từ VLM:
                    </div>
                    <div className="text-xs text-stone-200 leading-relaxed whitespace-pre-wrap font-sans bg-stone-900/60 p-3 rounded border border-stone-800">
                      {visionResult.generatedContent}
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="p-3 bg-stone-900/40 rounded border border-amber-800/40 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <strong>3. Giới Hạn Pháp Lý Của VLM:</strong> {visionResult.disclaimer}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-stone-500 text-xs">
                  <Eye className="w-8 h-8 mx-auto mb-2 text-stone-600" />
                  Chưa có kết quả. Nhấn "Gửi Phân Tích Sang gemma-3-27b-it" để kiểm tra phản hồi thị giác thực tế.
                </div>
              )}
            </HeritageCard>
          </div>
        </div>
      )}

      {/* TAB 3: MODELS DIRECTORY */}
      {activeTab === 'models' && (
        <HeritageCard title="Danh Mục Mô Hình Trực Tiếp Từ FPT Cloud AI Marketplace (/models)">
          {modelsError && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded text-rose-300 text-xs mb-4">
              {modelsError}
            </div>
          )}

          {modelsData && modelsData.models ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-stone-400 border-b border-stone-800 pb-2">
                <span>Nhà cung cấp: <strong className="text-amber-300">{modelsData.provider}</strong></span>
                <span>Độ trễ API: <strong className="text-emerald-400 font-mono">{modelsData.latencyMs} ms</strong></span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modelsData.models.map((m) => (
                  <div key={m.id} className="p-3 bg-stone-950 rounded-lg border border-stone-800 hover:border-stone-700 transition">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-semibold text-amber-300">{m.name || m.id}</span>
                      <HeritageBadge variant={m.inputModalities.includes('image') ? 'gold' : 'neutral'}>
                        {m.inputModalities.join(' + ')} → {m.outputModalities.join(', ')}
                      </HeritageBadge>
                    </div>
                    <div className="text-[10px] text-stone-500 mb-1.5 font-mono">
                      Context: {m.contextLength ? m.contextLength.toLocaleString() : 'N/A'} tokens
                    </div>
                    <p className="text-[11px] text-stone-400 line-clamp-2 leading-relaxed">
                      {m.description || 'Không có mô tả chi tiết.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-stone-500 text-xs">
              Đang tải danh sách mô hình từ FPT Cloud...
            </div>
          )}
        </HeritageCard>
      )}

      {/* TAB 4: CUSTOM INPUT / PRIVATE FILES (OPT-IN CONSENT GUARD) */}
      {activeTab === 'custom' && (
        <HeritageCard title="Nhập Tự Do & Tải Tệp Riêng (Chế Độ Kiểm Soát Zero-Knowledge)">
          <div className="max-w-2xl mx-auto py-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-950/60 border border-amber-600/50 flex items-center justify-center mx-auto text-amber-400">
              <Lock className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-serif font-bold text-amber-200">
                Yêu Cầu Cam Kết Thỏa Thuận Chia Sẻ Dữ Liệu (Opt-in Consent)
              </h3>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed max-w-lg mx-auto">
                Để bảo vệ quyền riêng tư theo tiêu chuẩn <strong>Zero-Knowledge của LegacyVault</strong>, hệ thống ngăn chặn việc 
                vô tình tải văn bản di chúc thực hoặc giấy tờ tùy thân của cá nhân lên máy chủ AI bên thứ ba.
              </p>
            </div>

            <div className="p-4 bg-stone-950 rounded-lg border border-stone-800 text-left text-xs text-stone-300 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
                <ShieldAlert className="w-4 h-4" /> Quy Tắc Kiến Trúc Bảo Vệ Dữ Liệu:
              </div>
              <p className="text-stone-400 text-[11px] leading-relaxed">
                1. Mọi dữ liệu kiểm thử trực tiếp hiện tại chỉ sử dụng <strong>Preset Giả Lập Đã Kiểm Duyệt (Synthetic Presets)</strong>.<br />
                2. Tính năng tải tệp cá nhân tự do lên AI sẽ chỉ được kích hoạt trong môi trường Production sau khi người dùng thực hiện ký số xác nhận Opt-in rõ ràng theo Nghị định 13/2023/NĐ-CP.<br />
                3. Quý khách vui lòng chuyển sang thẻ <strong>1. Gợi Ý Rà Soát Điều Khoản</strong> hoặc <strong>2. Trích Xuất Tài Liệu Mẫu</strong> để thử nghiệm API FPT Cloud thật với dữ liệu mẫu an toàn.
              </p>
            </div>

            <div className="pt-2">
              <HeritageButton 
                variant="outline" 
                onClick={() => setActiveTab('clause')}
              >
                Quay Lại Thử Nghiệm Kịch Bản Mẫu (Synthetic Presets)
              </HeritageButton>
            </div>
          </div>
        </HeritageCard>
      )}
    </div>
  );
};
