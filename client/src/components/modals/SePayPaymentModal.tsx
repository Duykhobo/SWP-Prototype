/**
 * @file SePayPaymentModal.tsx
 * @description Modal thanh toán tự động VietQR SePay nâng cấp gói cước LegacyVault theo SRS v3.11.0
 */

import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  QrCode, 
  Copy, 
  Check, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';

interface SePayPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: 'OWNER_FREE' | 'LEGACY_XS' | 'LEGACY_XS_MAX' | 'RECIPIENT_PLUS';
  planName: string;
  priceFormatted: string;
  amount: number;
  onSuccess: (planId: string) => void;
}

export const SePayPaymentModal: React.FC<SePayPaymentModalProps> = ({
  isOpen,
  onClose,
  planId,
  planName,
  priceFormatted,
  amount,
  onSuccess,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(600); // 10 minutes

  const orderCode = `LV-UPGRADE-${Math.floor(100000 + Math.random() * 900000)}`;
  const accountNumber = '0388123456';
  const bankName = 'MB Bank (Ngân hàng Quân Đội)';
  const accountHolder = 'CONG TY CP CONG NGHE DI SAN SO LEGACYVAULT';

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isSuccess) return;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isSuccess]);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleSimulateWebhook = () => {
    setIsSimulatingWebhook(true);
    setTimeout(() => {
      setIsSimulatingWebhook(false);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess(planId);
        onClose();
        setIsSuccess(false);
      }, 1500);
    }, 1200);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const qrUrl = `https://qr.sepay.vn/img?acc=${accountNumber}&bank=MB&amount=${amount}&des=${orderCode}`;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B291E]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl w-full max-w-lg shadow-tactile-raised overflow-hidden my-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#0B291E] text-[#FAF9F5] px-6 py-4 flex items-center justify-between border-b border-[#B88E4C]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#B88E4C]/20 border border-[#B88E4C]/40 flex items-center justify-center text-[#B88E4C]">
              <CreditCard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-[#FAF9F5]">
                Thanh Toán VietQR SePay Tự Động
              </h2>
              <p className="text-[11px] text-[#FAF9F5]/70">
                Nâng cấp gói cước: <span className="text-[#B88E4C] font-semibold">{planName}</span>
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#FAF9F5]/60 hover:text-[#FAF9F5] hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-14 h-14 bg-[#059669]/10 text-[#059669] border border-[#059669]/30 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#0B291E] font-serif">
                Thanh Toán & Kích Hoạt Thành Công!
              </h3>
              <p className="text-xs text-[#66786E] max-w-sm mx-auto">
                Hệ thống SePay Webhook đã xác nhận giao dịch. Tài khoản của bạn đã được nâng cấp lên gói <strong className="text-[#0B291E]">{planName}</strong>.
              </p>
            </div>
          ) : (
            <>
              {/* Price Banner & Timer */}
              <div className="bg-[#FBF7EE] border border-[#E8DCC6] rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#7D5D28] uppercase font-bold tracking-wider block">
                    Số Tiền Cần Chuyển
                  </span>
                  <span className="text-xl font-bold text-[#0B291E] font-serif">
                    {priceFormatted}
                  </span>
                </div>
                <div className="text-right flex items-center gap-1.5 text-xs font-semibold text-[#D97706] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
                </div>
              </div>

              {/* VietQR Code Card */}
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-[#DCD9D0] shadow-tactile-inset">
                <div className="w-36 h-36 bg-[#EFECE6] p-1.5 rounded-xl border border-[#DCD9D0] flex items-center justify-center shrink-0">
                  <img 
                    src={qrUrl} 
                    alt="Mã VietQR Thanh Toán" 
                    className="w-full h-full object-contain rounded-lg"
                    onError={(e) => {
                      // Fallback visual QR
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <QrCode className="w-24 h-24 text-[#0B291E] hidden" />
                </div>

                {/* Transfer Info */}
                <div className="space-y-2 text-xs flex-1 w-full">
                  <div>
                    <span className="text-[10px] text-[#66786E] block">Ngân hàng thụ hưởng:</span>
                    <span className="font-bold text-[#14241C]">{bankName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#66786E] block">Số tài khoản:</span>
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#0B291E] text-sm">{accountNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(accountNumber, 'acc')}
                        className="text-[#B88E4C] hover:text-[#A07839] flex items-center gap-1 font-semibold text-[10px]"
                      >
                        {copiedField === 'acc' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'acc' ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-[#66786E] block">Nội dung chuyển khoản (bắt buộc đúng):</span>
                    <div className="flex items-center justify-between bg-[#EFECE6] px-2 py-1 rounded-md border border-[#DCD9D0]">
                      <span className="font-mono font-bold text-[#D9534F]">{orderCode}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(orderCode, 'code')}
                        className="text-[#0B291E] hover:text-[#133E2F] flex items-center gap-1 font-semibold text-[10px]"
                      >
                        {copiedField === 'code' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'code' ? 'Đã chép' : 'Sao chép'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dev Simulation Button */}
              <div className="bg-[#E5EDE8] border border-[#0B291E]/20 p-3 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#0B291E]" />
                  <span className="text-[11px] text-[#0B291E] font-medium">
                    Môi trường Thử nghiệm: Kiểm tra tự động
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSimulateWebhook}
                  disabled={isSimulatingWebhook}
                  className="px-3 py-1.5 bg-[#0B291E] text-[#FAF9F5] rounded-lg font-bold text-[11px] hover:bg-[#133E2F] active:scale-95 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>{isSimulatingWebhook ? 'Đang gửi Webhook...' : 'Mô Phỏng Đã Thanh Toán'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
