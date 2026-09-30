import React, { useState } from 'react';
import {
  splitSecret,
  combineShares,
  getLagrangeTrace,
  splitSecretWithUserPassphrase,
  deriveBytesFromPassphrase,
  gfAdd,
  gfMul,
  gfDiv,
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
  AlertTriangle,
  Lock,
  Unlock,
  Key,
  FileText,
  Play,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Database,
  Cloud,
  ShieldCheck,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ShamirTestbench: React.FC = () => {
  const [masterSecret, setMasterSecret] = useState<string>('e4c89b3f71a0d2e5b6c891f0a2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1');
  const [userPassphrase, setUserPassphrase] = useState<string>('Duyzkskhobo@310');
  const [testPassphrase, setTestPassphrase] = useState<string>('Duyzkskhobo@310');
  const [shares, setShares] = useState<Share[]>([]);
  const [saltUsed, setSaltUsed] = useState<string>('LegacyVault_UserSalt_2026');
  const [isCustomMode, setIsCustomMode] = useState<boolean>(true);
  const [showMathProof, setShowMathProof] = useState<boolean>(false);
  const [lagrangeTrace, setLagrangeTrace] = useState<LagrangeTrace | null>(null);
  const [simulationResult, setSimulationResult] = useState<{
    scenario: string;
    success: boolean;
    recoveredSecret?: string;
    message: string;
  } | null>(null);

  // Dữ liệu mô phỏng gói WrappedDataKey lưu trong SQL Server [dbo].[ContentVersions]
  const mockAsset = React.useMemo(() => ({
    fileName: 'di_chuc_gia_dinh_2026.pdf',
    sizeBytes: 15518920,
    dekRawHex: '7a3f89b1c2d0e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9',
    nonceHex: '9xF12aB3cD4e5f60',
    authTagHex: 'vB83c7DeF9a0B1c2d3E4f5',
    wrappedKeyBase64: 'TL01k9Xz9xF12aB3vB83c7DeF9a0B1c23d4e8a91bc7f02e5a6b7c8d9e0f1a2b3',
    storageUri: 'r2://legacyvault-private/vaults/pv_11111111/assets/ast_98afbd90/v1.enc',
    plaintextExcerpt: 'TÔI LÀ NGUYỄN VĂN NAM, NAY LẬP BẢN DI CHÚC SỐ NÀY ĐỂ BÀN GIAO TOÀN BỘ DANH MỤC TÀI SẢN SỐ VÀ KHO LƯU TRỮ CHO CON GÁI PHẠM THỊ DUYÊN. DI SẢN ĐƯỢC BẢO VỆ TUÂN THỦ QUY TẮC TAM QUYỀN PHÂN LẬP VÀ MẬT MÃ KHÔNG KIẾN THỨC (ZERO-KNOWLEDGE).',
  }), []);

  // Demo chuyển đổi trực quan toán học thực tế cho Byte 0
  const byte0Conversion = React.useMemo(() => {
    if (!masterSecret || shares.length < 3 || !isCustomMode) return null;
    const encoder = new TextEncoder();
    const s0 = encoder.encode(masterSecret)[0];
    const y2_0 = parseInt(shares[1].dataHex.slice(0, 2), 16);
    const a1_0 = gfDiv(gfAdd(y2_0, s0), 2);
    const y1_0 = gfAdd(s0, gfMul(a1_0, 1));
    const y3_0 = gfAdd(s0, gfMul(a1_0, 3));

    return {
      s0,
      y2_0,
      a1_0,
      y1_0,
      y3_0,
      charS: String.fromCharCode(s0),
    };
  }, [masterSecret, shares, isCustomMode]);

  // Luồng End-to-End Stepper: Mặc định bật bước 1 để người dùng thấy ngay
  const [e2eStep, setE2eStep] = useState<number>(1); // 1 = shamir, 2 = unwrap, 3 = decrypt, 4 = complete
  const [isE2ePlaying, setIsE2ePlaying] = useState<boolean>(false);

  // Auto-play timer for E2E Flow
  React.useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isE2ePlaying) {
      timer = setInterval(() => {
        setE2eStep((prev) => {
          if (prev >= 4) {
            setIsE2ePlaying(false);
            return 4;
          }
          return prev + 1;
        });
      }, 3500);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isE2ePlaying]);

  // Tự động phân tách và cập nhật LIVE theo thời gian thực khi người dùng gõ Passphrase
  React.useEffect(() => {
    if (!masterSecret || !userPassphrase) return;
    let isMounted = true;
    splitSecretWithUserPassphrase(masterSecret, userPassphrase, saltUsed).then((result) => {
      if (isMounted) {
        setShares(result.shares);
        setIsCustomMode(true);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [masterSecret, userPassphrase, saltUsed]);

  // Tự động đối soát và tính toán nội suy Lagrange LIVE khi người dùng gõ vào ô thử nghiệm
  React.useEffect(() => {
    if (!isCustomMode || shares.length < 2 || !testPassphrase) return;
    let isMounted = true;
    const secretBytesLen = shares[0].dataHex.length / 2;
    deriveBytesFromPassphrase(testPassphrase, saltUsed, secretBytesLen).then((derivedBytes) => {
      if (!isMounted) return;
      const derivedHex = Array.from(derivedBytes)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const userTestShare: Share = { x: 2, dataHex: derivedHex };

      try {
        const recovered = combineShares([shares[0], userTestShare]);
        const trace = getLagrangeTrace(shares[0], userTestShare, masterSecret);
        setLagrangeTrace(trace);
        const isExactMatch = recovered === masterSecret;
        setSimulationResult({
          scenario: `Đối Soát Trực Tiếp: "${testPassphrase}"`,
          success: isExactMatch,
          recoveredSecret: recovered,
          message: isExactMatch
            ? 'XÁC THỰC THÀNH CÔNG 100%! Passphrase khớp chính xác, Mảnh 2 phái sinh trùng khớp với đồ thị Galois và mở được Master KEK!'
            : 'MẬT KHẨU SAI: Mảnh 2 phái sinh bị lệch so với đồ thị, tính ra Master KEK rác. Tầng AES-256-GCM Auth Tag sẽ lập tức chặn đứng!',
        });
      } catch {
        // ignore
      }
    });
    return () => {
      isMounted = false;
    };
  }, [testPassphrase, shares, saltUsed, masterSecret, isCustomMode]);

  const handleSplitKey = () => {
    if (!masterSecret) return;
    const generatedShares = splitSecret(masterSecret, 3, 2);
    setShares(generatedShares);
    setIsCustomMode(false);
    setLagrangeTrace(null);
    setSimulationResult(null);
  };

  const handleSimulateRogueAdmin = () => {
    setLagrangeTrace(null);
    setSimulationResult({
      scenario: 'Admin biến chất cố tình giải mã bằng Mảnh 1 (System Share)',
      success: false,
      message:
        'CẢNH BÁO BẢO VỆ TOÁN HỌC: Theo Định lý Shamir Secret Sharing trong GF(256), 1 mảnh duy nhất cung cấp đúng 0-bit thông tin về Master KEK. Admin không thể suy đoán hay brute-force KEK trần!',
    });
  };

  const handleSimulateLegitimateUser = () => {
    if (shares.length < 2) return;
    try {
      const recovered = combineShares([shares[0], shares[1]]);
      const trace = getLagrangeTrace(shares[0], shares[1], masterSecret);
      setLagrangeTrace(trace);
      setSimulationResult({
        scenario: 'Giải mã hợp pháp thông thường: Mảnh 1 (Server) + Mảnh 2 (User Passphrase)',
        success: true,
        recoveredSecret: recovered,
        message: 'Khôi phục Master KEK thành công 100%! Đủ 2/3 mảnh theo chính sách phân quyền.',
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
      const recovered = combineShares([shares[0], shares[2]]);
      const trace = getLagrangeTrace(shares[0], shares[2], masterSecret);
      setLagrangeTrace(trace);
      setSimulationResult({
        scenario: 'Bàn giao di sản hợp pháp: Mảnh 1 (Server) + Mảnh 3 (Beneficiary / Verifier)',
        success: true,
        recoveredSecret: recovered,
        message: 'Khôi phục Master KEK thành công 100% khi Người thụ hưởng xuất trình Mảnh cứu hộ hợp lệ!',
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
          'PHÁT HIỆN GIẢ MẠO: Toán học Lagrange tính ra kết quả rác, chuyển tiếp sang tầng AES-256-GCM Auth Tag 128-bit sẽ lập tức kích hoạt lỗi CryptographicException từ chối mở két!',
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
      title="2. An Toàn Mật Mã Shamir Secret Sharing & Phục Hồi Két Di Sản"
      subtitle="Master Key (KEK) bọc DEK thành WrappedDataKey cố định. Người dùng tự do đổi Passphrase cho Mảnh 2 mà không làm thay đổi file trên R2 hay dữ liệu trong CSDL."
      icon={<KeyRound className="w-5 h-5 text-[#B88E4C]" />}
      badge={<HeritageBadge variant="forest">Threshold (2-of-3) GF(256)</HeritageBadge>}
    >
      <div className="space-y-6">

        {/* SECTION 1: ĐỐI CHIẾU TRỰC DIỆN: BẤT BIẾN (GIỮ NGUYÊN) VS BIẾN THIÊN (BÙ TRỪ REAL-TIME) */}
        <div className="p-4 bg-white border border-[#DCD9D0] rounded-xl space-y-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#DCD9D0] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[#0B291E] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#B88E4C]" />
                <span>Bản Chất Toán Học &amp; Lưu Trữ: Bất Biến vs. Biến Thiên</span>
              </h3>
              <p className="text-[11px] text-[#66786E]">
                Khi bạn thay đổi Passphrase Mảnh 2, những gì trên máy chủ được GIỮ NGUYÊN và những gì sẽ TỰ ĐỘNG BÙ TRỪ?
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                ✓ 100% Zero-Re-encryption
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                ⚡ Real-time Galois Rotation
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* CỘT TRÁI: 100% BẤT BIẾN (GIỮ NGUYÊN) */}
            <div className="p-3.5 bg-gradient-to-b from-emerald-50/60 to-white border border-emerald-300/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 uppercase tracking-wide">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>1. Tài Sản &amp; Gói Khóa (Giữ Nguyên 100%)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-emerald-200/80 text-emerald-900 border border-emerald-400">
                  BẤT BIẾN
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {/* File R2 */}
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-600 font-medium flex items-center gap-1">
                      <Cloud className="w-3.5 h-3.5 text-cyan-600" /> Tệp mã hóa trên Cloudflare R2:
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">KHÔNG ĐỔI</span>
                  </div>
                  <div className="font-bold text-[#0B291E] text-xs truncate">
                    {mockAsset.fileName}
                  </div>
                  <div className="text-[10px] text-stone-500 font-mono">
                    14.8 MiB • Blob .enc R2 • SHA-256 đối soát cố định
                  </div>
                </div>

                {/* DEK Raw */}
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-600 font-medium flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-emerald-600" /> Khóa DEK (Mã hóa file đối xứng):
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">KHÔNG ĐỔI</span>
                  </div>
                  <code className="text-[10px] font-mono text-emerald-900 break-all block font-bold">
                    {mockAsset.dekRawHex.slice(0, 28)}...
                  </code>
                  <div className="text-[10px] text-emerald-700">
                    Sinh 1 lần duy nhất từ CSPRNG khi tải file lên
                  </div>
                </div>

                {/* WrappedDataKey SQL Server */}
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-600 font-medium flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-indigo-600" /> Gói WrappedDataKey (SQL Server):
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">KHÔNG ĐỔI</span>
                  </div>
                  <code className="text-[10px] font-mono text-indigo-900 break-all block font-bold bg-indigo-50/50 p-1 rounded">
                    {mockAsset.wrappedKeyBase64.slice(0, 30)}...
                  </code>
                  <div className="text-[10px] text-stone-600">
                    [12B Nonce] + [16B Tag] + [32B DEK] (60B) lưu tại [dbo].[ContentVersions]
                  </div>
                </div>

                {/* Master KEK x = 0 */}
                <div className="p-2.5 bg-white rounded-lg border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-600 font-medium flex items-center gap-1">
                      <Key className="w-3.5 h-3.5 text-emerald-600" /> Khóa Master KEK (256-bit Hex):
                    </span>
                    <span className="font-mono text-emerald-700 font-bold">CỐ ĐỊNH P(0)</span>
                  </div>
                  <code className="text-[10px] font-mono text-emerald-900 break-all block font-bold bg-emerald-50/50 p-1.5 rounded border border-emerald-200">
                    0x{masterSecret}
                  </code>
                  <div className="text-[10px] text-stone-500">
                    Chuỗi khóa mã hóa đối xứng 256-bit (32 bytes hex) neo tại trục tung x = 0
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT PHẢI: MẢNH SHAMIR BIẾN THIÊN BÙ TRỪ KHI BẠN GÕ */}
            <div className="p-3.5 bg-gradient-to-b from-amber-50/60 to-white border border-amber-300/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5 uppercase tracking-wide">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>2. Mảnh Shamir (Xoay Bù Trừ Khi Bạn Gõ)</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-amber-200/80 text-amber-900 border border-amber-400">
                  REAL-TIME ROTATION
                </span>
              </div>

              {/* Ô nhập Passphrase của người dùng */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#0B291E] flex items-center justify-between">
                  <span>Passphrase Người Dùng (Mảnh 2 tại x = 2):</span>
                  <span className="text-[10px] text-amber-800 font-mono font-normal">
                    {userPassphrase.length} ký tự
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={userPassphrase}
                    onChange={(e) => {
                      setUserPassphrase(e.target.value);
                      setTestPassphrase(e.target.value);
                    }}
                    placeholder="Nhập Passphrase cá nhân..."
                    className="flex-1 px-3 py-1.5 text-xs bg-white border border-amber-400 rounded-lg focus:outline-hidden focus:border-amber-600 font-medium text-[#0B291E] shadow-2xs"
                  />
                  <HeritageButton
                    variant="outline"
                    onClick={handleSplitKey}
                    icon={<RefreshCw className="w-3.5 h-3.5" />}
                    className="text-xs py-1 px-2.5"
                    title="Sinh ngẫu nhiên cả 3 mảnh"
                  >
                    Ngẫu Nhiên
                  </HeritageButton>
                </div>
              </div>

              {/* Phản ứng bù trừ tức thời */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 bg-white rounded-lg border border-amber-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-700 font-medium">Hệ số dốc Galois a₁ = (y₂ ⊕ KEK) ⊘ 2:</span>
                    <span className="font-mono text-blue-900 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                      a₁ = {byte0Conversion ? byte0Conversion.a1_0 : '...'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-700 font-medium">Mảnh 2 (x=2 Byte 0):</span>
                    <span className="font-mono text-amber-900 font-bold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                      y₂ = 0x{byte0Conversion ? byte0Conversion.y2_0.toString(16).padStart(2, '0') : '..'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-700 font-medium">Mảnh 1 Server (x=1 Byte 0):</span>
                    <span className="font-mono text-stone-900 font-bold bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
                      y₁ = 0x{byte0Conversion ? byte0Conversion.y1_0.toString(16).padStart(2, '0') : '..'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-stone-700 font-medium">Mảnh 3 Thừa Kế (x=3 Byte 0):</span>
                    <span className="font-mono text-stone-900 font-bold bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
                      y₃ = 0x{byte0Conversion ? byte0Conversion.y3_0.toString(16).padStart(2, '0') : '..'}
                    </span>
                  </div>
                </div>

                <div className="p-2 bg-amber-100/70 rounded-lg border border-amber-300 text-[11px] text-amber-950 leading-relaxed">
                  💡 <strong>Nguyên lý compa:</strong> Đầu kim cắm chặt vào $x=0$ (Master KEK cố định). Khi bạn đổi Passphrase (di chuyển đầu bút tại $x=2$), đường thẳng chỉ quay quanh tâm $x=0$, nên gói bọc <strong>WrappedDataKey</strong> và tệp <strong>R2</strong> không hề bị xáo trộn!
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: LUỒNG 4 BƯỚC MỞ KÉT & GIẢI MÃ DI SẢN (END-TO-END STEPPER) */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 via-stone-850 to-emerald-950 text-white border border-[#B88E4C] rounded-2xl space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-700/80 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-lg bg-[#E0C068] text-stone-900 font-bold">
                <Play className="w-4 h-4 fill-current" />
              </span>
              <div>
                <h3 className="font-bold text-sm text-[#E0C068] flex items-center gap-2">
                  <span>Quy Trình 4 Bước Phục Hồi &amp; Giải Mã Di Sản Khi Mở Két</span>
                </h3>
                <p className="text-[11px] text-stone-300">
                  Mô phỏng khép kín: Ghép Khóa Shamir ➔ Mở Gói WrappedKey ➔ Tải Tệp R2 ➔ Đối Soát &amp; Đọc Bản Rõ
                </p>
              </div>
            </div>

            {/* Stepper Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsE2ePlaying(!isE2ePlaying)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isE2ePlaying
                    ? 'bg-amber-500 text-stone-950 shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-stone-200 border border-white/20'
                }`}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{isE2ePlaying ? 'Đang Tự Chạy' : 'Tự Động Chạy'}</span>
              </button>

              <button
                onClick={() => setE2eStep((prev) => Math.min(prev + 1, 4))}
                disabled={e2eStep === 4}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-[#E0C068] text-stone-950 hover:bg-amber-300 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
              >
                <span>Bước Kế</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  setIsE2ePlaying(false);
                  setE2eStep(1);
                }}
                className="p-1 rounded-lg text-xs bg-white/10 hover:bg-white/20 text-stone-300 border border-white/20 transition-all cursor-pointer"
                title="Làm lại từ Bước 1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            {[
              { s: 1, label: '1. Ghép Khóa Shamir' },
              { s: 2, label: '2. Mở Gói DEK' },
              { s: 3, label: '3. Tải Tệp R2' },
              { s: 4, label: '4. Giải Mã & Đọc File' },
            ].map(({ s, label }) => {
              const isActive = e2eStep === s;
              const isDone = e2eStep > s;
              return (
                <button
                  key={s}
                  onClick={() => {
                    setIsE2ePlaying(false);
                    setE2eStep(s);
                  }}
                  className={`p-2 rounded-lg text-center transition-all cursor-pointer font-bold border ${
                    isActive
                      ? 'bg-[#E0C068] text-stone-950 border-[#E0C068] shadow-md ring-2 ring-[#E0C068]/40'
                      : isDone
                      ? 'bg-emerald-900/60 text-emerald-300 border-emerald-500/40'
                      : 'bg-stone-800/60 text-stone-400 border-stone-700'
                  }`}
                >
                  <span>{label}</span>
                </button>
              );
            })}
          </div>

          {/* Step Detail Content */}
          <div className="p-4 bg-stone-900/90 rounded-xl border border-stone-700/80 space-y-3">
            {e2eStep === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#E0C068] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-4 h-4" /> BƯỚC 1: Ghép Khóa Shamir (Lagrange Interpolation Tại RAM)
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                    RAM Cô Lập • Ephemeral Memory
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Máy chủ nạp <strong>Mảnh 1 (Server CSDL)</strong> kết hợp cùng <strong>Mảnh 2 (từ Passphrase "{userPassphrase}")</strong> để nội suy Lagrange trên trường Galois GF(256) tìm lại điểm gốc P(0).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-stone-950 rounded border border-stone-700 space-y-1">
                    <span className="text-[10px] text-amber-400 block font-sans">Mảnh 1 (Server x=1):</span>
                    <code className="text-stone-300 break-all text-[10px]">
                      {shares[0]?.dataHex.slice(0, 32) || '0x5f2b8a...'}...
                    </code>
                  </div>
                  <div className="p-2.5 bg-stone-950 rounded border border-stone-700 space-y-1">
                    <span className="text-[10px] text-emerald-400 block font-sans">Mảnh 2 (Passphrase x=2):</span>
                    <code className="text-stone-300 break-all text-[10px]">
                      {shares[1]?.dataHex.slice(0, 32) || '0x8ae412...'}...
                    </code>
                  </div>
                </div>
                <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-lg text-xs font-mono text-emerald-200">
                  ➔ Nội suy Lagrange thành công! Khôi phục Master Key KEK = <strong>0x{masterSecret.slice(0, 32)}...</strong> (256-bit Hex) an toàn trong bộ nhớ RAM tạm thời!
                </div>
              </div>
            )}

            {e2eStep === 2 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#E0C068] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4" /> BƯỚC 2: Mở Gói DEK (Giải Bọc WrappedDataKey Từ SQL Server)
                  </span>
                  <span className="font-mono text-[10px] text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-500/30">
                    T-SQL: [ContentVersions]
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Máy chủ nạp chuỗi <strong>WrappedKeyBase64</strong> (60 bytes) từ bảng <code className="text-amber-300">[dbo].[ContentVersions]</code>, sau đó dùng <strong>Master Key KEK</strong> (<code>0x{masterSecret.slice(0, 16)}...</code>) vừa phục hồi ở Bước 1 để giải bọc qua AES-256-GCM.
                </p>
                <div className="p-2.5 bg-stone-950 rounded border border-stone-700 text-xs font-mono space-y-1.5">
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Gói WrappedDataKey nạp từ CSDL:</span>
                    <span className="text-indigo-400 font-bold">60 Bytes (Base64)</span>
                  </div>
                  <div className="p-2 bg-stone-900 rounded text-stone-300 break-all text-[10px]">
                    {mockAsset.wrappedKeyBase64}
                  </div>
                  <p className="text-[10px] text-stone-400">
                    Bóc tách: [12B Nonce: <span className="text-amber-300">{mockAsset.nonceHex}</span>] + [16B Auth Tag: <span className="text-emerald-300">{mockAsset.authTagHex}</span>] + [32B Ciphertext DEK]
                  </p>
                </div>
                <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-lg text-xs font-mono text-emerald-200">
                  ➔ Giải bọc AES-GCM Unwrap thành công! Thu lại chìa DEK 256-bit trần: <strong>{mockAsset.dekRawHex.slice(0, 32)}...</strong> (Tag 128-bit khớp 100%)
                </div>
              </div>
            )}

            {e2eStep === 3 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-[#E0C068] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Cloud className="w-4 h-4" /> BƯỚC 3: Tải Tệp R2 &amp; Giải Mã Đối Soát (AES-GCM + Checksum)
                  </span>
                  <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                    Cloudflare R2 • TLS 1.3
                  </span>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Trình duyệt kéo khối byte Ciphertext <code className="text-cyan-300">v1.enc</code> (14.8 MiB) từ Cloudflare R2 Private Bucket về máy người dùng qua TLS 1.3, rồi dùng <strong>DEK</strong> trần giải mã AES-256-GCM.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-stone-950 rounded border border-stone-700 space-y-1">
                    <span className="text-[10px] text-cyan-400 block font-sans">Đường dẫn Cloudflare R2:</span>
                    <code className="text-stone-300 break-all text-[10px]">{mockAsset.storageUri}</code>
                  </div>
                  <div className="p-2.5 bg-stone-950 rounded border border-stone-700 space-y-1">
                    <span className="text-[10px] text-emerald-400 block font-sans">Đối soát toàn vẹn SHA-256:</span>
                    <code className="text-emerald-300 text-[10px]">8f4b23a9c7d1e5f8... [MATCHED 100%]</code>
                  </div>
                </div>
                <div className="p-2.5 bg-emerald-950/70 border border-emerald-500/40 rounded-lg text-xs font-mono text-emerald-200">
                  ➔ Giải mã AES-256-GCM hoàn tất! Authentication Tag 128-bit khớp và Checksum SHA-256 trùng khớp hoàn hảo.
                </div>
              </div>
            )}

            {e2eStep === 4 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> BƯỚC 4: Hoàn Tất Bàn Giao · Xem Trước File Di Chúc Bản Rõ
                  </span>
                  <span className="font-mono text-[10px] text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-400">
                    Di Sản Đã Được Bàn Giao Hợp Pháp
                  </span>
                </div>

                {/* Document Preview Card */}
                <div className="p-4 bg-white text-stone-900 rounded-xl border border-emerald-300 shadow-md space-y-2">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-emerald-700" />
                      <div>
                        <strong className="text-xs text-stone-900">{mockAsset.fileName}</strong>
                        <span className="text-[10px] text-stone-500 block">Dung lượng: 14.8 MiB • Định dạng: application/pdf</span>
                      </div>
                    </div>
                    <HeritageBadge variant="forest">Bản Rõ Đã Giải Mã</HeritageBadge>
                  </div>

                  <div className="p-3 bg-[#FAF9F5] border rounded-lg text-xs font-serif leading-relaxed text-stone-800">
                    <p className="font-bold text-center text-sm text-[#0B291E] mb-2 uppercase tracking-wide">
                      CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM<br />
                      <span className="text-xs font-normal">Độc lập - Tự do - Hạnh phúc</span>
                    </p>
                    <p className="text-center font-bold text-xs text-[#0B291E] mb-3">
                      BẢN DI CHÚC TÀI SẢN SỐ &amp; BÀN GIAO KHO KỶ NIỆM
                    </p>
                    <p className="italic text-[11px] text-stone-700">
                      "{mockAsset.plaintextExcerpt}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                    <span>✓ Đã kiểm tra chữ ký số công chứng viên</span>
                    <span>Xác thực mật mã: Zero-Knowledge Enforced</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: 3 MẢNH SHAMIR & THỬ NGHIỆM PHÒNG THỦ THỰC CHIẾN */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#0B291E] uppercase tracking-wider">
              3 Mảnh Bí Mật Được Phân Bổ (Ngưỡng 2/3):
            </h4>
            <span className="text-[11px] text-[#66786E]">Đủ bất kỳ 2/3 mảnh là mở được két</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* Mảnh 1 */}
            <div className="p-3.5 bg-[#FBF7EE] border border-[#E8DCC6] rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#B88E4C]">MẢNH 1: SYSTEM SHARE</span>
                <HeritageBadge variant="gold">Server / KMS (x=1)</HeritageBadge>
              </div>
              <p className="text-[11px] text-[#66786E]">Lưu niêm phong trong Cloud KMS / CSDL Backend</p>
              <code className="text-[10px] font-mono break-all block p-1.5 bg-[#FAF9F5] rounded border border-[#E8DCC6]">
                {shares[0]?.dataHex.slice(0, 32) || '0x...'}...
              </code>
            </div>

            {/* Mảnh 2 */}
            <div className="p-3.5 bg-[#E5EDE8] border border-[#0B291E]/20 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#0B291E]">MẢNH 2: USER PASSPHRASE</span>
                <HeritageBadge variant="forest">Chủ Kho Giữ (x=2)</HeritageBadge>
              </div>
              <p className="text-[11px] text-[#66786E]">Phái sinh tức thì từ "{userPassphrase}"</p>
              <code className="text-[10px] font-mono break-all block p-1.5 bg-[#FAF9F5] rounded border border-[#0B291E]/20">
                {shares[1]?.dataHex.slice(0, 32) || '0x...'}...
              </code>
            </div>

            {/* Mảnh 3 */}
            <div className="p-3.5 bg-[#EFECE6] border border-[#DCD9D0] rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#14241C]">MẢNH 3: EMERGENCY SHARE</span>
                <HeritageBadge variant="neutral">Thân Nhân / Verifier (x=3)</HeritageBadge>
              </div>
              <p className="text-[11px] text-[#66786E]">Ủy thác cho Người thừa kế / Công chứng viên</p>
              <code className="text-[10px] font-mono break-all block p-1.5 bg-[#FAF9F5] rounded border border-[#DCD9D0]">
                {shares[2]?.dataHex.slice(0, 32) || '0x...'}...
              </code>
            </div>
          </div>

          {/* Ô kiểm thử gõ sai Passphrase để xem tầng phòng thủ */}
          <div className="p-3.5 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-bold text-xs text-[#0B291E] flex items-center gap-1.5">
                <Unlock className="w-4 h-4 text-[#B88E4C]" />
                <span>Thử Nghiệm Mở Két: Gõ Passphrase (Thử gõ sai 1 ký tự để kiểm tra phòng thủ)</span>
              </span>

              {testPassphrase === userPassphrase ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1 shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>✓ Khớp 100% (Mở Khóa Thành Công)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs">
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                  <span>✗ Sai lệch (Tầng AES-GCM Tag Chặn Đứng)</span>
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={testPassphrase}
                onChange={(e) => setTestPassphrase(e.target.value)}
                placeholder="Gõ thử Passphrase..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-[#DCD9D0] rounded-lg focus:outline-hidden focus:border-[#B88E4C] font-mono font-medium"
              />
              <button
                onClick={() => setTestPassphrase(userPassphrase)}
                className="px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-[#DCD9D0] rounded-lg cursor-pointer"
                title="Đặt lại cho khớp"
              >
                Đặt lại khớp
              </button>
            </div>

            {/* 4 Nút Mô Phỏng Kịch Bản Thực Chiến */}
            <div className="pt-2 border-t border-[#DCD9D0]/70 flex flex-wrap gap-2">
              <HeritageButton
                variant="danger"
                onClick={handleSimulateRogueAdmin}
                icon={<ShieldAlert className="w-3.5 h-3.5" />}
                className="text-xs py-1 px-2.5"
              >
                Admin cố mở bằng Mảnh 1
              </HeritageButton>

              <HeritageButton
                variant="primary"
                onClick={handleSimulateLegitimateUser}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="text-xs py-1 px-2.5"
              >
                Hợp pháp: Mảnh 1 + Mảnh 2
              </HeritageButton>

              <HeritageButton
                variant="gold"
                onClick={handleSimulateBeneficiaryClaim}
                icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                className="text-xs py-1 px-2.5"
              >
                Bàn giao: Mảnh 1 + Mảnh 3
              </HeritageButton>

              <HeritageButton
                variant="outline"
                onClick={handleSimulateTamperedShare}
                icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                className="text-xs py-1 px-2.5"
              >
                Kẻ gian sửa 1 byte
              </HeritageButton>
            </div>
          </div>

          {/* Kết quả mô phỏng */}
          {simulationResult && (
            <div
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                simulationResult.success
                  ? 'bg-[#E6F4EA] border-[#A7F3D0] text-[#059669]'
                  : 'bg-[#FDF2F2] border-[#FECACA] text-[#D9534F]'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs">
                {simulationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{simulationResult.scenario}</span>
              </div>
              <p className="leading-relaxed text-[11px]">{simulationResult.message}</p>
              {simulationResult.recoveredSecret && (
                <div className="p-2.5 bg-[#FAF9F5] border border-emerald-300 rounded-lg text-xs space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] text-stone-600">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Khóa KEK (Key Encryption Key) Thu Được Từ Shamir:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold border border-emerald-300">
                      Chìa KEK Mở Gói WrappedDataKey
                    </span>
                  </div>
                  <div className="p-1.5 bg-white rounded border border-emerald-200 font-mono text-emerald-950 font-bold break-all text-xs">
                    0x{simulationResult.recoveredSecret}
                  </div>
                  <p className="text-[10px] text-stone-500 italic">
                    * Lưu ý phân biệt: Đây là <strong>Master KEK</strong> (khôi phục từ 2/3 mảnh Shamir) dùng để bóc mở gói WrappedDataKey trên SQL Server, sau đó mới lấy ra chìa <strong>DEK trần</strong> để giải mã tệp tin.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Nút Thu Gọn / Bung Ra Chi Tiết Toán Học Lagrange GF(256) */}
          <div className="pt-1">
            <button
              onClick={() => setShowMathProof(!showMathProof)}
              className="text-xs font-bold text-[#B88E4C] hover:text-amber-800 flex items-center gap-1.5 cursor-pointer py-1"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>
                {showMathProof
                  ? 'Thu gọn bảng chứng minh toán học Lagrange GF(256)'
                  : '🔬 Xem chi tiết bảng chứng minh toán học Lagrange từng byte GF(256)'}
              </span>
              {showMathProof ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showMathProof && lagrangeTrace && (
              <div className="mt-3 p-4 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-[#DCD9D0] pb-2">
                  <div className="flex items-center gap-2 text-[#0B291E] font-bold text-xs">
                    <Calculator className="w-4 h-4 text-[#B88E4C]" />
                    <span>Chi Tiết Toán Học Nội Suy Lagrange Tại Trục Tung (x = 0)</span>
                  </div>
                  <HeritageBadge variant="forest">GF(256) Generator g=2</HeritageBadge>
                </div>

                {/* Thông số trọng số */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-white border border-[#DCD9D0] rounded-lg">
                    <span className="text-[#66786E] block text-[10px]">2 Mảnh Ghép Vào</span>
                    <span className="font-bold text-[#0B291E]">x₁ = {lagrangeTrace.x1}, x₂ = {lagrangeTrace.x2}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#DCD9D0] rounded-lg">
                    <span className="text-[#66786E] block text-[10px]">Mẫu số: x₁ ⊕ x₂</span>
                    <span className="font-mono font-bold text-[#0B291E]">{lagrangeTrace.x1} ⊕ {lagrangeTrace.x2} = {lagrangeTrace.denominator}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#DCD9D0] rounded-lg">
                    <span className="text-[#66786E] block text-[10px]">Trọng số ℓ₁(0) = x₂ ⊘ Mẫu</span>
                    <span className="font-mono font-bold text-[#B88E4C]">{lagrangeTrace.x2} ⊘ {lagrangeTrace.denominator} = {lagrangeTrace.l1}</span>
                  </div>
                  <div className="p-2.5 bg-white border border-[#DCD9D0] rounded-lg">
                    <span className="text-[#66786E] block text-[10px]">Trọng số ℓ₂(0) = x₁ ⊘ Mẫu</span>
                    <span className="font-mono font-bold text-[#B88E4C]">{lagrangeTrace.x1} ⊘ {lagrangeTrace.denominator} = {lagrangeTrace.l2}</span>
                  </div>
                </div>

                {/* Công thức toán học */}
                <div className="p-2 bg-[#EEF5EF] border border-[#C9D5D0] rounded-lg text-xs font-mono text-[#19483F]">
                  S[b] = (y₁[b] ⊗ {lagrangeTrace.l1}) ⊕ (y₂[b] ⊗ {lagrangeTrace.l2})
                </div>

                {/* Bảng vết tính toán từng byte */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border border-[#DCD9D0] rounded-lg overflow-hidden">
                    <thead className="bg-[#EFECE6] text-[#0B291E] font-semibold text-[10px]">
                      <tr>
                        <th className="p-1.5">Byte #</th>
                        <th className="p-1.5">Ký tự gốc</th>
                        <th className="p-1.5">y₁</th>
                        <th className="p-1.5">y₂</th>
                        <th className="p-1.5">y₁ ⊗ ℓ₁</th>
                        <th className="p-1.5">y₂ ⊗ ℓ₂</th>
                        <th className="p-1.5">XOR (S)</th>
                        <th className="p-1.5">Phục hồi</th>
                        <th className="p-1.5 text-center">Khớp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFECE6] bg-white font-mono text-[10px]">
                      {lagrangeTrace.rows.map((row) => (
                        <tr key={row.index} className="hover:bg-[#FAF9F5]">
                          <td className="p-1.5 font-bold text-[#66786E]">#{row.index}</td>
                          <td className="p-1.5 font-sans font-bold text-[#0B291E]">'{row.expectedChar}' ({row.expectedByte})</td>
                          <td className="p-1.5 text-[#B88E4C]">0x{row.y1.toString(16).padStart(2, '0')}</td>
                          <td className="p-1.5 text-[#0B291E]">0x{row.y2.toString(16).padStart(2, '0')}</td>
                          <td className="p-1.5 text-[#66786E]">{row.term1}</td>
                          <td className="p-1.5 text-[#66786E]">{row.term2}</td>
                          <td className="p-1.5 font-bold text-[#19483F]">{row.reconstructedByte}</td>
                          <td className="p-1.5 font-sans font-bold text-[#0B291E]">'{row.reconstructedChar}'</td>
                          <td className="p-1.5 text-center font-sans">
                            {row.isMatch ? (
                              <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-bold bg-[#E6F4EA] text-[#059669]">
                                ✓ Khớp
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-bold bg-[#FDF2F2] text-[#D9534F]">
                                ✗ Lệch
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </HeritageCard>
  );
};
