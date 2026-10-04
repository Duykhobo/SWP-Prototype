import React, { useState, useEffect } from 'react';
import { axiosClient } from '@/shared/api/axiosClient';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { Clock, ShieldAlert, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { getErrorMessage } from '@/shared/lib/errorUtils';

interface TimeLockStatus {
  caseId: string;
  status: string;
  isDemoMode: boolean;
  totalDurationSeconds: number;
  remainingSeconds: number;
  isLocked: boolean;
  isExpired: boolean;
  unlockTargetTime: string;
  aliveClaimReason?: string;
  aliveClaimSubmittedAt?: string;
}

export const RescueTimeLockTestbench: React.FC = () => {
  const [caseId] = useState<string>('c0a80101-0000-0000-0000-000000000001');
  const [status, setStatus] = useState<TimeLockStatus | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [isAdjudicating, setIsAdjudicating] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await axiosClient.get(`/api/v1/timelock/${caseId}`);
      setStatus(res.data);
      setIsDemoMode(res.data.isDemoMode);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 1000);
    return () => clearInterval(interval);
  }, [caseId]);

  const handleToggleDemoMode = async () => {
    const nextMode = !isDemoMode;
    try {
      const res = await axiosClient.post('/api/v1/timelock/toggle-demo', {
        caseId,
        isDemoMode: nextMode,
      });
      setStatus(res.data.status);
      setIsDemoMode(nextMode);
      setActionFeedback(res.data.message);
    } catch (err: unknown) {
      setActionFeedback(getErrorMessage(err));
    }
  };

  const handleRestartTimer = async () => {
    try {
      const res = await axiosClient.post('/api/v1/timelock/init', {
        caseId,
        isDemoMode,
      });
      setStatus(res.data);
      setActionFeedback('Đã đặt lại đồng hồ đếm ngược Time-Lock.');
    } catch (err: unknown) {
      setActionFeedback(getErrorMessage(err));
    }
  };

  const handleSubmitAliveClaim = async () => {
    setIsSubmittingClaim(true);
    setActionFeedback(null);
    try {
      const res = await axiosClient.post('/api/v1/timelock/alive-claim', {
        caseId,
        reason: 'Tôi vẫn còn sống và phát hiện hành vi mở kho bất thường từ IP lạ!',
      });
      setStatus(res.data.status);
      setActionFeedback(res.data.message);
    } catch (err: unknown) {
      setActionFeedback(getErrorMessage(err));
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleRescueDecision = async (approved: boolean) => {
    setIsAdjudicating(true);
    setActionFeedback(null);
    try {
      const res = await axiosClient.post('/api/v1/timelock/rescue-decision', {
        caseId,
        decision: approved ? 'APPROVED_ALIVE' : 'REJECTED_FRAUD',
        verifierNotes: approved
          ? 'Đã đối soát trực tiếp video call và xác thực CCCD. Chủ sở hữu thực sự còn sống.'
          : 'Yêu cầu cứu hộ không hợp lệ do phát hiện bằng chứng giả mạo.',
      });
      setStatus(res.data.status);
      setActionFeedback(res.data.message);
    } catch (err: unknown) {
      setActionFeedback(getErrorMessage(err));
    } finally {
      setIsAdjudicating(false);
    }
  };

  const formatRemainingTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <HeritageCard
      title="7. Khóa Thời Gian Trễ (Time-Lock 48h / Demo 2 Phút) & Cứu Hộ 2 Bước (AliveClaim)"
      subtitle="Phòng thủ chống thông đồng (Anti-Collusion): Đếm ngược thời gian trễ khi mở kho, cho phép Chủ kho phát lệnh cứu hộ 'Tôi còn sống' (RESCUE_PENDING -> CANCELLED_ALIVE)."
      icon={<Clock className="w-5 h-5" />}
      badge={<HeritageBadge variant={isDemoMode ? 'gold' : 'forest'}>{isDemoMode ? 'Demo Mode: 2 Phút' : 'Production: 48 Giờ'}</HeritageBadge>}
    >
      <div className="space-y-6">
        {/* Hướng dẫn quy trình cứu hộ 2 bước */}
        <div className="p-4 bg-[#FBF7EE] border-l-4 border-[#B88E4C] rounded-r-lg text-xs space-y-1 text-[#14241C]">
          <p className="font-bold text-[#0B291E]">Quy tắc cứu hộ 2 bước (Hard Rule 1.6 & SRS v3.11.0):</p>
          <p>
            1. <strong>Bước 1:</strong> Chủ kho bấm lệnh <em>Tôi còn sống (AliveClaim)</em> → Hồ sơ chuyển ngay sang <code>RESCUE_PENDING</code>. Hệ thống chặn toàn bộ quy trình bàn giao.
          </p>
          <p>
            2. <strong>Bước 2:</strong> Người thẩm định (Verifier) kiểm tra và ra quyết định <code>APPROVED_ALIVE</code> → Chuyển <code>CANCELLED_ALIVE</code> để hủy vĩnh viễn hồ sơ giả mạo.
          </p>
        </div>

        {/* Đồng hồ đếm ngược Live */}
        {status && (
          <div className="p-6 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl text-center space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#66786E]">Trạng thái hồ sơ:</span>
              <HeritageBadge
                variant={
                  status.status === 'CANCELLED_ALIVE'
                    ? 'success'
                    : status.status === 'RESCUE_PENDING'
                    ? 'danger'
                    : 'gold'
                }
              >
                {status.status}
              </HeritageBadge>
            </div>

            <div className="py-2">
              <span className="text-4xl md:text-5xl font-mono font-bold text-[#0B291E] tracking-wider">
                {formatRemainingTime(status.remainingSeconds)}
              </span>
              <span className="block text-xs text-[#66786E] mt-1">
                {status.remainingSeconds > 0
                  ? 'Thời gian an toàn còn lại trước khi cho phép mở kho'
                  : 'Hết thời gian Time-Lock! Hồ sơ đủ điều kiện mở khóa'}
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <HeritageButton variant="outline" onClick={handleToggleDemoMode} icon={<RefreshCw className="w-4 h-4" />}>
                Chuyển sang {isDemoMode ? 'Chế độ 48 giờ' : 'Demo Mode 2 phút (Hội đồng)'}
              </HeritageButton>
              <HeritageButton variant="outline" onClick={handleRestartTimer} icon={<Clock className="w-4 h-4" />}>
                Đặt lại đồng hồ đếm ngược
              </HeritageButton>
            </div>
          </div>
        )}

        {actionFeedback && (
          <div className="p-3 bg-[#E5EDE8] border border-[#0B291E]/20 rounded-lg text-xs text-[#0B291E] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Các thao tác cứu hộ */}
        <div className="p-5 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl space-y-4">
          <h4 className="text-xs font-semibold text-[#0B291E] uppercase tracking-wider">
            Thao Tác Cứu Hộ Dành Cho Chủ Sở Hữu & Người Thẩm Định:
          </h4>

          <div className="flex flex-wrap gap-3">
            {/* Nút Bước 1 */}
            <HeritageButton
              variant="danger"
              onClick={handleSubmitAliveClaim}
              isLoading={isSubmittingClaim}
              disabled={status?.status === 'CANCELLED_ALIVE'}
              icon={<ShieldAlert className="w-4 h-4" />}
            >
              Bước 1: Chủ kho bấm "TÔI CÒN SỐNG" (AliveClaim)
            </HeritageButton>

            {/* Nút Bước 2: Verifier Duyệt */}
            <HeritageButton
              variant="primary"
              onClick={() => handleRescueDecision(true)}
              isLoading={isAdjudicating}
              disabled={status?.status !== 'RESCUE_PENDING'}
              icon={<CheckCircle className="w-4 h-4" />}
            >
              Bước 2: Verifier chấp thuận cứu hộ (CANCELLED_ALIVE)
            </HeritageButton>

            {/* Nút Bước 2: Verifier Từ chối */}
            <HeritageButton
              variant="outline"
              onClick={() => handleRescueDecision(false)}
              isLoading={isAdjudicating}
              disabled={status?.status !== 'RESCUE_PENDING'}
              icon={<XCircle className="w-4 h-4 text-[#D9534F]" />}
            >
              Verifier bác bỏ yêu cầu cứu hộ
            </HeritageButton>
          </div>
        </div>
      </div>
    </HeritageCard>
  );
};
