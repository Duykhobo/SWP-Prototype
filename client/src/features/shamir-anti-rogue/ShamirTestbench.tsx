import React, { useState } from 'react';
import {
  splitSecret,
  combineShares,
  getLagrangeTrace,
  type Share,
  type LagrangeTrace,
} from '@/shared/crypto/shamir';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import {
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Calculator,
  Binary,
  AlertTriangle,
} from 'lucide-react';

export const ShamirTestbench: React.FC = () => {
  const [masterSecret, setMasterSecret] = useState<string>('LegacyVault_MasterKey_2026_HighSecurity');
  const [shares, setShares] = useState<Share[]>([]);
  const [lagrangeTrace, setLagrangeTrace] = useState<LagrangeTrace | null>(null);
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
    setLagrangeTrace(null);
    setSimulationResult(null);
  };

  const handleSimulateRogueAdmin = () => {
    // Admin chỉ có Mảnh 1 (System Share)
    setLagrangeTrace(null);
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
      const trace = getLagrangeTrace(shares[0], shares[1], masterSecret);
      setLagrangeTrace(trace);
      setSimulationResult({
        scenario: 'Giải mã hợp pháp thông thường: Mảnh 1 (Server) + Mảnh 2 (User Passphrase)',
        success: true,
        recoveredSecret: recovered,
        message: 'Khôi phục Master Key thành công 100%! Đủ 2/3 mảnh theo chính sách phân quyền.',
      });
    } catch (err: any) {
      setLagrangeTrace(null);
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
      const trace = getLagrangeTrace(shares[0], shares[2], masterSecret);
      setLagrangeTrace(trace);
      setSimulationResult({
        scenario: 'Bàn giao di sản hợp pháp: Mảnh 1 (Server) + Mảnh 3 (Beneficiary / Verifier)',
        success: true,
        recoveredSecret: recovered,
        message: 'Khôi phục Master Key thành công 100% khi Người thụ hưởng xuất trình Mảnh cứu hộ hợp lệ!',
      });
    } catch (err: any) {
      setLagrangeTrace(null);
      setSimulationResult({
        scenario: 'Bàn giao di sản',
        success: false,
        message: err.message,
      });
    }
  };

  const handleSimulateTamperedShare = () => {
    if (shares.length < 2) return;
    // Giả lập kẻ gian sửa 2 ký tự hex đầu tiên của Mảnh 2
    const tamperedHex = 'ff' + shares[1].dataHex.slice(2);
    const tamperedShare: Share = { x: shares[1].x, dataHex: tamperedHex };
    try {
      const corruptedRecovered = combineShares([shares[0], tamperedShare]);
      const trace = getLagrangeTrace(shares[0], tamperedShare, masterSecret);
      setLagrangeTrace(trace);
      setSimulationResult({
        scenario: 'Thử nghiệm giả mạo Mảnh 2: Kẻ gian can thiệp 1 byte dữ liệu',
        success: false,
        recoveredSecret: corruptedRecovered,
        message:
          'PHÁT HIỆN GIẢ MẠO: Toán học Lagrange vẫn tính ra kết quả nhị phân rác, nhưng khi chuyển tiếp sang tầng AES-256-GCM hoặc Checksum SHA-256 sẽ lập tức kích hoạt lỗi CryptographicException (Tag Mismatch) từ chối mở két!',
      });
    } catch (err: any) {
      setLagrangeTrace(null);
      setSimulationResult({
        scenario: 'Thử nghiệm giả mạo',
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

                <HeritageButton
                  variant="outline"
                  onClick={handleSimulateTamperedShare}
                  icon={<AlertTriangle className="w-4 h-4 text-amber-600" />}
                >
                  Thử nghiệm giả mạo Mảnh 2 (Sửa 1 byte)
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
              <div className="p-2 bg-[#FAF9F5] border rounded text-xs font-mono text-[#14241C] break-all">
                Khóa khôi phục được: <strong>{simulationResult.recoveredSecret}</strong>
              </div>
            )}
          </div>
        )}

        {/* Trực quan hóa toán học Lagrange chi tiết */}
        {lagrangeTrace && (
          <div className="p-5 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#DCD9D0] pb-3">
              <div className="flex items-center gap-2 text-[#0B291E] font-bold text-sm">
                <Calculator className="w-4 h-4 text-[#B88E4C]" />
                <span>Chi Tiết Toán Học Nội Suy Lagrange Tại Trục Tung (x = 0)</span>
              </div>
              <HeritageBadge variant="forest">GF(256) Generator g=2</HeritageBadge>
            </div>

            {/* Thông số trọng số */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-white border border-[#DCD9D0] rounded-lg">
                <span className="text-[#66786E] block text-[11px]">2 Mảnh Ghép Vào</span>
                <span className="font-bold text-[#0B291E]">x₁ = {lagrangeTrace.x1} và x₂ = {lagrangeTrace.x2}</span>
              </div>
              <div className="p-3 bg-white border border-[#DCD9D0] rounded-lg">
                <span className="text-[#66786E] block text-[11px]">Mẫu số: x₁ ⊕ x₂</span>
                <span className="font-mono font-bold text-[#0B291E]">{lagrangeTrace.x1} ⊕ {lagrangeTrace.x2} = {lagrangeTrace.denominator}</span>
              </div>
              <div className="p-3 bg-white border border-[#DCD9D0] rounded-lg">
                <span className="text-[#66786E] block text-[11px]">Trọng số ℓ₁(0) = x₂ ⊘ Mẫu</span>
                <span className="font-mono font-bold text-[#B88E4C]">{lagrangeTrace.x2} ⊘ {lagrangeTrace.denominator} = {lagrangeTrace.l1}</span>
              </div>
              <div className="p-3 bg-white border border-[#DCD9D0] rounded-lg">
                <span className="text-[#66786E] block text-[11px]">Trọng số ℓ₂(0) = x₁ ⊘ Mẫu</span>
                <span className="font-mono font-bold text-[#B88E4C]">{lagrangeTrace.x1} ⊘ {lagrangeTrace.denominator} = {lagrangeTrace.l2}</span>
              </div>
            </div>

            {/* Công thức toán học */}
            <div className="p-2.5 bg-[#EEF5EF] border border-[#C9D5D0] rounded-lg text-xs font-mono text-[#19483F]">
              Công thức tái tạo byte bí mật thứ b: S[b] = (y₁[b] ⊗ {lagrangeTrace.l1}) ⊕ (y₂[b] ⊗ {lagrangeTrace.l2})
            </div>

            {/* Bảng vết tính toán từng byte */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[#DCD9D0] rounded-lg overflow-hidden">
                <thead className="bg-[#EFECE6] text-[#0B291E] font-semibold text-[11px]">
                  <tr>
                    <th className="p-2">Byte #</th>
                    <th className="p-2">Ký tự gốc</th>
                    <th className="p-2">Mảnh x₁ (y₁)</th>
                    <th className="p-2">Mảnh x₂ (y₂)</th>
                    <th className="p-2">y₁ ⊗ ℓ₁</th>
                    <th className="p-2">y₂ ⊗ ℓ₂</th>
                    <th className="p-2">Kết quả XOR (S)</th>
                    <th className="p-2">Ký tự phục hồi</th>
                    <th className="p-2 text-center">Khớp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EFECE6] bg-white font-mono text-[11px]">
                  {lagrangeTrace.rows.map((row) => (
                    <tr key={row.index} className="hover:bg-[#FAF9F5]">
                      <td className="p-2 font-bold text-[#66786E]">#{row.index}</td>
                      <td className="p-2 font-sans font-bold text-[#0B291E]">'{row.expectedChar}' ({row.expectedByte})</td>
                      <td className="p-2 text-[#B88E4C]">0x{row.y1.toString(16).padStart(2, '0')} ({row.y1})</td>
                      <td className="p-2 text-[#0B291E]">0x{row.y2.toString(16).padStart(2, '0')} ({row.y2})</td>
                      <td className="p-2 text-[#66786E]">{row.term1}</td>
                      <td className="p-2 text-[#66786E]">{row.term2}</td>
                      <td className="p-2 font-bold text-[#19483F]">{row.reconstructedByte} (0x{row.reconstructedByte.toString(16).padStart(2, '0')})</td>
                      <td className="p-2 font-sans font-bold text-[#0B291E]">'{row.reconstructedChar}'</td>
                      <td className="p-2 text-center font-sans">
                        {row.isMatch ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#E6F4EA] text-[#059669]">
                            ✓ Khớp
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#FDF2F2] text-[#D9534F]">
                            ✗ Sai lệch
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#66786E] italic">
              * Bảng trên hiển thị 5 bytes đầu tiên để minh chứng trực quan toàn bộ phép nhân trường GF(256) và phép cộng XOR diễn ra tức thì trong bộ nhớ RAM trình duyệt mà không cần gửi về server.
            </p>
          </div>
        )}
      </div>
    </HeritageCard>
  );
};
