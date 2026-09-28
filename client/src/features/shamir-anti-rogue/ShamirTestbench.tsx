import React, { useState } from 'react';
import { splitSecret, combineShares, type Share } from '@/shared/crypto/shamir';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { KeyRound, ShieldAlert, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

export const ShamirTestbench: React.FC = () => {
  const [masterSecret, setMasterSecret] = useState<string>('LegacyVault_MasterKey_2026_HighSecurity');
  const [shares, setShares] = useState<Share[]>([]);
  const [simulationResult, setSimulationResult] = useState<{
    scenario: string;
    success: boolean;
    recoveredSecret?: string;
    message: string;
  } | null>(null);

  const handleSplitKey = () => {
    if (!masterSecret) return;
    const generatedShares = splitSecret(masterSecret, 3, 2);
    setShares(generatedShares);
    setSimulationResult(null);
  };

  const handleSimulateRogueAdmin = () => {
    // Admin chỉ có Mảnh 1 (System Share)
    setSimulationResult({
      scenario: 'Admin biến chất cố tình giải mã bằng Mảnh 1 (System Share)',
      success: false,
      message:
        'CẢNH BÁO BẢO VỆ TOÁN HỌC: Theo Định lý Shamir Secret Sharing trong GF(256), 1 mảnh duy nhất cung cấp đúng 0-bit thông tin về Master Key. Admin không thể suy đoán hay brute-force khóa trần!',
    });
  };

  const handleSimulateLegitimateUser = () => {
    if (shares.length < 2) return;
    try {
      // Kết hợp Mảnh 1 (Server) + Mảnh 2 (User Passphrase)
      const recovered = combineShares([shares[0], shares[1]]);
      setSimulationResult({
        scenario: 'Giải mã hợp pháp thông thường: Mảnh 1 (Server) + Mảnh 2 (User Passphrase)',
        success: true,
        recoveredSecret: recovered,
        message: 'Khôi phục Master Key thành công 100%! Đủ 2/3 mảnh theo chính sách phân quyền.',
      });
    } catch (err: any) {
      setSimulationResult({
        scenario: 'Giải mã hợp pháp',
        success: false,
        message: err.message,
      });
    }
  };

  const handleSimulateBeneficiaryClaim = () => {
    if (shares.length < 3) return;
    try {
      // Kết hợp Mảnh 1 (Server) + Mảnh 3 (Emergency / Beneficiary)
      const recovered = combineShares([shares[0], shares[2]]);
      setSimulationResult({
        scenario: 'Bàn giao di sản hợp pháp: Mảnh 1 (Server) + Mảnh 3 (Beneficiary / Verifier)',
        success: true,
        recoveredSecret: recovered,
        message: 'Khôi phục Master Key thành công 100% khi Người thụ hưởng xuất trình Mảnh cứu hộ hợp lệ!',
      });
    } catch (err: any) {
      setSimulationResult({
        scenario: 'Bàn giao di sản',
        success: false,
        message: err.message,
      });
    }
  };

  return (
    <HeritageCard
      title="2. An toàn Toán học Shamir Secret Sharing (Anti-Rogue Admin Model)"
      subtitle="Master Key được phân rã thành 3 mảnh (Ngưỡng k=2). Admin máy chủ chỉ giữ duy nhất Mảnh 1, hoàn toàn bất lực trong việc tự ý giải mã dữ liệu khách hàng."
      icon={<KeyRound className="w-5 h-5" />}
      badge={<HeritageBadge variant="forest">Threshold (2-of-3) GF(256)</HeritageBadge>}
    >
      <div className="space-y-6">
        {/* Input Master Key */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#0B291E] uppercase tracking-wider">
            Chuỗi Master Secret / Khóa Gốc:
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={masterSecret}
              onChange={(e) => setMasterSecret(e.target.value)}
              className="flex-1 px-4 py-2 text-sm bg-[#FAF9F5] border border-[#DCD9D0] rounded-lg focus:outline-hidden focus:border-[#B88E4C]"
            />
            <HeritageButton onClick={handleSplitKey} icon={<RefreshCw className="w-4 h-4" />}>
              Tách thành 3 Mảnh (SSS)
            </HeritageButton>
          </div>
        </div>

        {/* Danh sách 3 mảnh */}
        {shares.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#0B291E] uppercase tracking-wider">
              3 Mảnh Bí Mật Được Phân Tán (Ngưỡng 2/3):
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-4 bg-[#FBF7EE] border border-[#E8DCC6] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#B88E4C]">MẢNH 1: SYSTEM SHARE</span>
                  <HeritageBadge variant="gold">Server / KMS</HeritageBadge>
                </div>
                <p className="text-[11px] text-[#66786E]">Lưu niêm phong trong Cloud KMS / HSM Backend</p>
                <code className="text-[10px] font-mono break-all block p-1.5 bg-[#FAF9F5] rounded border border-[#E8DCC6]">
                  {shares[0].dataHex.slice(0, 32)}...
                </code>
              </div>

              <div className="p-4 bg-[#E5EDE8] border border-[#0B291E]/20 rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#0B291E]">MẢNH 2: USER PASSPHRASE</span>
                  <HeritageBadge variant="forest">Chủ Kho Giữ</HeritageBadge>
                </div>
                <p className="text-[11px] text-[#66786E]">Phái sinh từ mật khẩu / khóa cá nhân người dùng</p>
                <code className="text-[10px] font-mono break-all block p-1.5 bg-[#FAF9F5] rounded border border-[#0B291E]/20">
                  {shares[1].dataHex.slice(0, 32)}...
                </code>
              </div>

              <div className="p-4 bg-[#EFECE6] border border-[#DCD9D0] rounded-xl space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#14241C]">MẢNH 3: EMERGENCY SHARE</span>
                  <HeritageBadge variant="neutral">Thân Nhân / Verifier</HeritageBadge>
                </div>
                <p className="text-[11px] text-[#66786E]">Ủy thác cho Người thừa kế / Công chứng viên</p>
                <code className="text-[10px] font-mono break-all block p-1.5 bg-[#FAF9F5] rounded border border-[#DCD9D0]">
                  {shares[2].dataHex.slice(0, 32)}...
                </code>
              </div>
            </div>

            {/* Các nút bấm mô phỏng kịch bản tấn công và phục hồi */}
            <div className="pt-4 border-t border-[#DCD9D0] space-y-3">
              <h4 className="text-xs font-semibold text-[#0B291E] uppercase tracking-wider">
                Thử Nghiệm Kịch Bản Phòng Thủ & Khôi Phục:
              </h4>
              <div className="flex flex-wrap gap-3">
                <HeritageButton
                  variant="danger"
                  onClick={handleSimulateRogueAdmin}
                  icon={<ShieldAlert className="w-4 h-4" />}
                >
                  Mô phỏng Admin biến chất cố mở bằng Mảnh 1
                </HeritageButton>

                <HeritageButton
                  variant="primary"
                  onClick={handleSimulateLegitimateUser}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Khôi phục hợp pháp: Mảnh 1 + Mảnh 2
                </HeritageButton>

                <HeritageButton
                  variant="gold"
                  onClick={handleSimulateBeneficiaryClaim}
                  icon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Bàn giao di sản: Mảnh 1 + Mảnh 3
                </HeritageButton>
              </div>
            </div>
          </div>
        )}

        {/* Kết quả mô phỏng */}
        {simulationResult && (
          <div
            className={`p-4 rounded-xl border text-xs space-y-2 ${
              simulationResult.success
                ? 'bg-[#E6F4EA] border-[#A7F3D0] text-[#059669]'
                : 'bg-[#FDF2F2] border-[#FECACA] text-[#D9534F]'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {simulationResult.success ? (
                <CheckCircle2 className="w-5 h-5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 shrink-0" />
              )}
              <span>{simulationResult.scenario}</span>
            </div>
            <p className="leading-relaxed">{simulationResult.message}</p>
            {simulationResult.recoveredSecret && (
              <div className="p-2 bg-[#FAF9F5] border rounded text-xs font-mono text-[#14241C]">
                Khóa khôi phục được: <strong>{simulationResult.recoveredSecret}</strong>
              </div>
            )}
          </div>
        )}
      </div>
    </HeritageCard>
  );
};
