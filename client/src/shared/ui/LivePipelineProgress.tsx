/**
 * @file LivePipelineProgress.tsx
 * @description Component biểu diễn hoạt hình tiến trình xử lý mật mã và lưu trữ thời gian thực (Framer Motion)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export interface PipelineStage {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  status: 'pending' | 'processing' | 'completed' | 'error';
  latencyMs?: number;
  detail?: string;
}

interface LivePipelineProgressProps {
  stages: PipelineStage[];
  activeStageId?: string;
  isProcessing: boolean;
  title?: string;
  subtitle?: string;
}

export const LivePipelineProgress: React.FC<LivePipelineProgressProps> = ({
  stages,
  activeStageId,
  isProcessing,
  title = 'Tiến Trình Xử Lý Mật Mã Phong Bì & Bàn Giao',
  subtitle = 'Dữ liệu được băm RAM, mã hóa AES-256-GCM và đẩy lên Cloudflare R2',
}) => {
  return (
    <div className="bg-[#FAF9F5] border border-[#B88E4C]/30 rounded-xl p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-[#0B291E] flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#B88E4C] animate-pulse" />
            {title}
          </h4>
          <p className="text-xs text-[#66786E]">{subtitle}</p>
        </div>
        {isProcessing && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#B88E4C]/10 text-[#0B291E] text-xs font-semibold rounded-full border border-[#B88E4C]/30">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#B88E4C]" />
            <span>Đang xử lý trực tiếp...</span>
          </div>
        )}
      </div>

      {/* Pipeline Horizontal Flow */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {stages.map((stage, idx) => {
          const isCurrent = stage.id === activeStageId;
          const isDone = stage.status === 'completed';
          const isPending = stage.status === 'pending';
          const isError = stage.status === 'error';

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1, duration: 0.3 }}
              className={`relative p-3.5 rounded-lg border transition-all duration-300 ${
                isCurrent
                  ? 'bg-amber-50/80 border-[#B88E4C] shadow-sm ring-2 ring-[#B88E4C]/20'
                  : isDone
                  ? 'bg-emerald-50/60 border-emerald-300'
                  : isError
                  ? 'bg-rose-50 border-rose-300'
                  : 'bg-white/80 border-[#DCD9D0] opacity-70'
              }`}
            >
              {/* Connector Arrow on md+ screens */}
              {idx < stages.length - 1 && (
                <div className="hidden md:flex absolute -right-2.5 top-1/2 -translate-y-1/2 z-10 text-[#B88E4C]">
                  <ArrowRight className="w-4 h-4 opacity-70" />
                </div>
              )}

              <div className="flex items-start justify-between">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#B88E4C] text-[#0B291E]'
                      : isError
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    stage.icon
                  )}
                </div>

                <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/5 text-[#66786E]">
                  0{idx + 1}
                </span>
              </div>

              <div className="mt-2.5">
                <p className="text-xs font-bold text-[#0B291E] truncate">{stage.label}</p>
                <p className="text-[11px] text-[#66786E] truncate">{stage.sublabel}</p>
              </div>

              {stage.detail && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 pt-2 border-t border-black/5 text-[10px] font-mono text-[#0B291E]/80 truncate"
                >
                  {stage.detail}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
