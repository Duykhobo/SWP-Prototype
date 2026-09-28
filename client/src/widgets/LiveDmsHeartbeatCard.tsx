/**
 * @file LiveDmsHeartbeatCard.tsx
 * @description Domain Protocol Component #2: Thẻ điểm danh sinh tồn Dead Man's Switch (Quy tắc 10)
 */

import React, { useState } from 'react';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { Activity, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';

interface LiveDmsHeartbeatCardProps {
  ownerName?: string;
  cycleDays?: number;
}

export const LiveDmsHeartbeatCard: React.FC<LiveDmsHeartbeatCardProps> = ({
  ownerName = 'Nguyễn Văn Chủ Kho',
  cycleDays = 30,
}) => {
  const [isAlive, setIsAlive] = useState(true);
  const [lastCheckIn, setLastCheckIn] = useState<Date>(new Date());
  const [isPinging, setIsPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  const handlePingAlive = async () => {
    setIsPinging(true);
    setPingSuccess(false);

    // Mô phỏng điểm danh sinh tồn DMS
    setTimeout(() => {
      setLastCheckIn(new Date());
      setIsAlive(true);
      setIsPinging(false);
      setPingSuccess(true);
    }, 600);
  };

  return (
    <HeritageCard
      title="Thẻ Điểm Danh Sinh Tồn (Live DMS Heartbeat Card)"
      subtitle="Domain Protocol Component #2: Kiểm soát trạng thái sinh tồn và ngăn chặn kích hoạt bàn giao trái phép"
      icon={<Activity className="w-5 h-5" />}
      badge={
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#059669] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#059669]"></span>
          </span>
          <HeritageBadge variant="success">ACTIVE PULSE</HeritageBadge>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-[#FBF7EE] border border-[#E8DCC6] rounded-xl text-xs">
          <div className="space-y-1">
            <div className="font-semibold text-sm text-[#0B291E]">Chủ sở hữu: {ownerName}</div>
            <div className="text-[#66786E]">
              Chu kỳ cấu hình: <strong>{cycleDays} ngày</strong> • Điểm danh gần nhất:{' '}
              <strong>{lastCheckIn.toLocaleTimeString('vi-VN')} - {lastCheckIn.toLocaleDateString('vi-VN')}</strong>
            </div>
            <div className="text-[#059669] font-medium flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> Kho được bảo vệ an toàn, không có hồ sơ chứng tử
            </div>
          </div>

          <HeritageButton
            variant="gold"
            onClick={handlePingAlive}
            isLoading={isPinging}
            icon={<Zap className="w-4 h-4" />}
          >
            ⚡ Tôi Còn Sống (I am Alive)
          </HeritageButton>
        </div>

        {pingSuccess && (
          <div className="p-3 bg-[#E6F4EA] border border-[#A7F3D0] rounded-lg text-xs text-[#059669] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Đã gia hạn nhịp tim sinh tồn thành công! Chu kỳ điểm danh tiếp theo được kéo dài thêm {cycleDays} ngày.
            </span>
          </div>
        )}
      </div>
    </HeritageCard>
  );
};
