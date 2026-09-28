/**
 * @file ComplianceWarningBox.tsx
 * @description Domain Protocol Component #5: Hộp cảnh báo tuân thủ pháp luật (Điều 612 & Điều 644 BLDS 2015)
 */

import React from 'react';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { Scale, AlertCircle } from 'lucide-react';

interface ComplianceWarningBoxProps {
  totalAssetsValue?: number;
}

export const ComplianceWarningBox: React.FC<ComplianceWarningBoxProps> = ({
  totalAssetsValue,
}) => {
  return (
    <div className="p-4 bg-[#FBF7EE] border border-[#E8DCC6] rounded-xl text-xs space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-[#0B291E]">
          <Scale className="w-4 h-4 text-[#B88E4C]" />
          <span>Cảnh Báo Tuân Thủ Pháp Luật Thừa Kế (BLDS 2015)</span>
        </div>
        <HeritageBadge variant="gold">Pháp Lý Việt Nam</HeritageBadge>
      </div>

      <div className="space-y-1.5 text-[#14241C] text-[11px] leading-relaxed">
        <p>
          • <strong>Điều 612 BLDS 2015:</strong> Di sản bao gồm tài sản riêng của người chết và phần tài sản của người chết trong tài sản chung với người khác.
        </p>
        <p>
          • <strong>Điều 644 BLDS 2015 (Người thừa kế không phụ thuộc nội dung di chúc):</strong> Con chưa thành niên, cha, mẹ, vợ, chồng; con thành niên mà không có khả năng lao động vẫn được hưởng phần di sản bằng <strong>2/3 suất của một người thừa kế theo pháp luật</strong> nếu di sản được chia theo pháp luật.
        </p>
      </div>

      <div className="pt-2 border-t border-[#E8DCC6] flex items-center gap-2 text-[10px] text-[#66786E]">
        <AlertCircle className="w-3.5 h-3.5 text-[#B88E4C] shrink-0" />
        <span>Hệ thống LegacyVault hỗ trợ thiết lập tỷ lệ di sản tự động cảnh báo khi vi phạm hạn mức diện bắt buộc.</span>
      </div>
    </div>
  );
};
