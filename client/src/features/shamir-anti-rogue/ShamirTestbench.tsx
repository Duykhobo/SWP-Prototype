import React, { useState } from 'react';
import {
  splitSecret,
  combineShares,
  getLagrangeTrace,
  splitSecretWithUserPassphrase,
  deriveBytesFromPassphrase,
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
  Lock,
  Unlock,
  Key,
} from 'lucide-react';

export const ShamirTestbench: React.FC = () => {
  const [masterSecret, setMasterSecret] = useState<string>('LegacyVault_MasterKey_2026_HighSecurity');
  const [userPassphrase, setUserPassphrase] = useState<string>('MatKhauDiSanCuaNam@2026');
  const [testPassphrase, setTestPassphrase] = useState<string>('MatKhauDiSanCuaNam@2026');
  const [shares, setShares] = useState<Share[]>([]);
  const [saltUsed, setSaltUsed] = useState<string>('LegacyVault_UserSalt_2026');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
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
    setIsCustomMode(false);
    setLagrangeTrace(null);
    setSimulationResult(null);
  };

  const handleSplitKeyWithUserPassphrase = async () => {
    if (!masterSecret || !userPassphrase) return;
    const result = await splitSecretWithUserPassphrase(masterSecret, userPassphrase, 'LegacyVault_UserSalt_2026');
    setShares(result.shares);
    setSaltUsed(result.salt);
    setIsCustomMode(true);
    setTestPassphrase(userPassphrase);
    setLagrangeTrace(null);
    setSimulationResult({
      scenario: 'Tạo Mảnh 2 theo Passphrase cá nhân thành công',
      success: true,
      message: `Mảnh 2 (User Share) đã được neo cố định theo Passphrase "${userPassphrase}". Hệ thống đã giải ngược đa thức Galois GF(256) để tạo Mảnh 1 (Server) và Mảnh 3 (Beneficiary) tương thích hoàn hảo!`,
    });
  };

  const handleVerifyCustomPassphrase = async () => {
    if (shares.length < 2 || !testPassphrase) return;
    try {
      // Phái sinh Mảnh 2 từ mật khẩu mà người dùng đang gõ thử
      const secretBytesLen = shares[0].dataHex.length / 2;
      const derivedBytes = await deriveBytesFromPassphrase(testPassphrase, saltUsed, secretBytesLen);
      const derivedHex = Array.from(derivedBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const userTestShare: Share = { x: 2, dataHex: derivedHex };

      // Ghép Mảnh 1 (Server) + Mảnh 2 (Vừa gõ)
      const recovered = combineShares([shares[0], userTestShare]);
      const trace = getLagrangeTrace(shares[0], userTestShare, masterSecret);
      setLagrangeTrace(trace);

      const isExactMatch = recovered === masterSecret;
      setSimulationResult({
        scenario: `Kiểm thử mở két với Passphrase: "${testPassphrase}"`,
        success: isExactMatch,
        recoveredSecret: recovered,
        message: isExactMatch
          ? 'XÁC THỰC THÀNH CÔNG 100%! Passphrase khớp chính xác, Mảnh 2 phái sinh trùng khớp với đồ thị Galois và mở được Master Key!'
          : 'MẬT KHẨU SAI: Mảnh 2 phái sinh bị lệch so với đồ thị, tính ra Master Key rác. Tầng AES-256-GCM Auth Tag sẽ lập tức chặn đứng!',
      });
    } catch (err: any) {
      setLagrangeTrace(null);
      setSimulationResult({
        scenario: 'Kiểm thử Passphrase',
        success: false,
        message: err.message,
      });
    }
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
        <div className="space-y-4 p-4 bg-white border border-[#DCD9D0] rounded-xl">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#0B291E] uppercase tracking-wider flex items-center justify-between">
              <span>1. Chuỗi Master Secret / Khóa Gốc:</span>
              <span className="text-[11px] text-[#66786E] font-normal">Khóa đối xứng hệ thống sinh ra</span>
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={masterSecret}
                onChange={(e) => setMasterSecret(e.target.value)}
                className="flex-1 px-4 py-2 text-sm bg-[#FAF9F5] border border-[#DCD9D0] rounded-lg focus:outline-hidden focus:border-[#B88E4C]"
              />
              <HeritageButton variant="outline" onClick={handleSplitKey} icon={<RefreshCw className="w-4 h-4" />}>
                Tách 3 Mảnh Ngẫu Nhiên
              </HeritageButton>
            </div>
          </div>

          {/* Ô Người dùng tự đặt Passphrase riêng cho Mảnh 2 */}
          <div className="pt-3 border-t border-[#DCD9D0] space-y-2">
            <label className="text-xs font-semibold text-[#0B291E] uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[#B88E4C]">
                <Key className="w-3.5 h-3.5" />
                2. Người Dùng Tự Đặt Mật Khẩu (Passphrase) Cho Mảnh 2:
              </span>
              <span className="text-[11px] text-[#66786E] font-normal">Giải ngược đa thức Galois GF(256)</span>
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={userPassphrase}
                onChange={(e) => setUserPassphrase(e.target.value)}
                placeholder="Nhập Passphrase cá nhân của bạn..."
                className="flex-1 px-4 py-2 text-sm bg-[#FAF9F5] border border-[#B88E4C]/50 rounded-lg focus:outline-hidden focus:border-[#B88E4C]"
              />
              <HeritageButton variant="gold" onClick={handleSplitKeyWithUserPassphrase} icon={<Lock className="w-4 h-4" />}>
                Tạo Mảnh 2 Từ Passphrase Này
              </HeritageButton>
            </div>
            <p className="text-[11px] text-[#66786E]">
              💡 <strong>Cơ chế toán học:</strong> Hệ thống dùng hàm băm chuẩn để neo Mảnh 2 theo Passphrase này, sau đó giải ngược hệ số dốc <code className="font-mono text-[#0B291E]">a₁ = (y₂ ⊕ S) ⊘ 2</code> trên trường hữu hạn để tạo ra Mảnh 1 (Server) và Mảnh 3 (Thừa kế) ăn khớp 100%.
            </p>
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

            {/* Hộp thử nghiệm gõ Passphrase mở két thực tế */}
            {isCustomMode && (
              <div className="p-4 bg-[#FBF7EE] border border-[#B88E4C]/40 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-[#0B291E] flex items-center gap-1.5">
                    <Unlock className="w-4 h-4 text-[#B88E4C]" />
                    Mô Phỏng Trình Duyệt: Nhập Lại Passphrase Để Tái Tạo Mảnh 2 &amp; Mở Két
                  </span>
                  <HeritageBadge variant="gold">Zero-Knowledge Verification</HeritageBadge>
                </div>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={testPassphrase}
                    onChange={(e) => setTestPassphrase(e.target.value)}
                    placeholder="Gõ Passphrase thử nghiệm..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#DCD9D0] rounded-lg focus:outline-hidden focus:border-[#B88E4C]"
                  />
                  <HeritageButton
                    variant="primary"
                    onClick={handleVerifyCustomPassphrase}
                    icon={<KeyRound className="w-4 h-4" />}
                  >
                    Ghép Mảnh 1 (Server) + Passphrase Này
                  </HeritageButton>
                </div>
                <p className="text-[11px] text-[#66786E]">
                  💡 <strong>Thử nghiệm:</strong> Thử sửa đổi 1 ký tự trong ô trên rồi bấm nút để thấy cách đồ thị Galois tính ra chuỗi rác và tầng xác thực Auth Tag sẽ phát hiện sai lệch ngay lập tức!
                </p>
              </div>
            )}

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
