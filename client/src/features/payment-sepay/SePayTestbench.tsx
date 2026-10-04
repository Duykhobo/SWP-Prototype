import React, { useState, useEffect } from 'react';
import { axiosClient } from '@/shared/api/axiosClient';
import { SUBSCRIPTION_TIERS } from '@/shared/constants';
import { HeritageCard } from '@/shared/ui/HeritageCard';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { QrCode, CreditCard, CheckCircle2, Clock, PlayCircle, AlertCircle } from 'lucide-react';
import { getErrorMessage } from '@/shared/lib/errorUtils';

interface PaymentOrder {
  id: string;
  orderCode: string;
  snapshotPlanTier: string;
  snapshotAmount: number;
  snapshotStorageQuotaMb: number;
  snapshotAssetLimit: number;
  status: 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED';
  createdAt: string;
  expiresAt: string;
  paidAt?: string;
  qrUrl?: string;
}

export const SePayTestbench: React.FC = () => {
  const [selectedTier, setSelectedTier] = useState<keyof typeof SUBSCRIPTION_TIERS>('LEGACY_XS');
  const [activeOrder, setActiveOrder] = useState<PaymentOrder | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [isSimulatingDemo, setIsSimulatingDemo] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [webhookResponse, setWebhookResponse] = useState<string | null>(null);

  // Polling theo quy định FE: Chỉ poll khi đơn ở trạng thái PENDING
  useEffect(() => {
    if (!activeOrder || activeOrder.status !== 'PENDING') return;

    const interval = setInterval(async () => {
      try {
        const res = await axiosClient.get(`/api/v1/payment/orders/${activeOrder.id}`);
        setActiveOrder(res.data);
      } catch (err) {
        console.error('Error polling order:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [activeOrder]);

  const handleCreateOrder = async () => {
    setIsCreatingOrder(true);
    setErrorMessage(null);
    setWebhookResponse(null);

    try {
      const res = await axiosClient.post('/api/v1/payment/orders', {
        planTier: selectedTier,
      });
      setActiveOrder(res.data.order);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleSimulateWebhook = async () => {
    if (!activeOrder) return;
    setIsSimulatingWebhook(true);
    setErrorMessage(null);

    try {
      // Giả lập SePay gọi Webhook Server-to-Server
      const payload = {
        id: Math.floor(Math.random() * 900000) + 100000,
        gateway: 'MBBank',
        transactionDate: new Date().toISOString(),
        accountNumber: '0385966666',
        code: activeOrder.orderCode,
        content: `SEPAY ${activeOrder.orderCode}`,
        transferType: 'in',
        description: `Chuyen tien dich vu ${activeOrder.orderCode}`,
        transferAmount: activeOrder.snapshotAmount,
      };

      const res = await axiosClient.post('/api/v1/payment/webhook', payload, {
        headers: {
          Authorization: 'Apikey SEPAY_TEST_API_KEY_2026',
        },
      });

      setWebhookResponse(JSON.stringify(res.data, null, 2));

      // Lấy lại trạng thái đơn hàng
      const updated = await axiosClient.get(`/api/v1/payment/orders/${activeOrder.id}`);
      setActiveOrder(updated.data);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsSimulatingWebhook(false);
    }
  };

  const handleSimulateDemoSuccess = async () => {
    if (!activeOrder) return;
    setIsSimulatingDemo(true);
    setErrorMessage(null);

    try {
      // Gọi endpoint demo riêng theo Hard Rule 1.7
      const res = await axiosClient.post(
        `/api/v1/demo/payment-orders/${activeOrder.id}/simulate-success`
      );
      setActiveOrder(res.data.order);
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err));
    } finally {
      setIsSimulatingDemo(false);
    }
  };

  return (
    <HeritageCard
      title="4. Cổng Thanh Toán SePay VietQR (Chuẩn 5 Gói Cước SRS v3.11.0)"
      subtitle="Tự động khớp giao dịch VietQR 24/7 qua Webhook Server-to-Server kèm chống lặp (Idempotency) và Endpoint mô phỏng thanh toán Demo Mode."
      icon={<CreditCard className="w-5 h-5" />}
      badge={<HeritageBadge variant="forest">SePay VietQR 0đ Fee</HeritageBadge>}
    >
      <div className="space-y-6">
        {/* Chọn gói cước */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-[#0B291E] uppercase tracking-wider block">
            Chọn 1 trong 5 Gói Dịch Vụ Chuẩn:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => {
              const isSelected = selectedTier === key;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedTier(key as keyof typeof SUBSCRIPTION_TIERS)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#FBF7EE] border-[#B88E4C] shadow-xs ring-1 ring-[#B88E4C]'
                      : 'bg-[#FAF9F5] border-[#DCD9D0] hover:border-[#B88E4C]/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#0B291E]">{tier.name}</span>
                    {tier.price === 0 ? (
                      <HeritageBadge variant="neutral">Miễn Phí</HeritageBadge>
                    ) : (
                      <HeritageBadge variant="gold">{tier.priceLabel}</HeritageBadge>
                    )}
                  </div>
                  <div className="text-[11px] text-[#66786E] space-y-0.5 mt-2">
                    <div>• Hạn mức: {tier.assets} tài sản</div>
                    <div>• Lưu trữ: {tier.storageMb} MiB</div>
                    <div>• Lập di sản: {tier.canPlanEstate ? 'Có hỗ trợ' : 'Không hỗ trợ'}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <HeritageButton
              onClick={handleCreateOrder}
              isLoading={isCreatingOrder}
              icon={<QrCode className="w-4 h-4" />}
            >
              Tạo Đơn Hàng & Sinh Mã VietQR (Hiệu lực 15 phút)
            </HeritageButton>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-[#FDF2F2] border border-[#FECACA] rounded-lg text-xs text-[#D9534F] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Modal / Bảng đơn hàng thanh toán */}
        {activeOrder && (
          <div className="p-5 bg-[#FAF9F5] border border-[#DCD9D0] rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD9D0]">
              <div>
                <span className="font-bold text-sm text-[#0B291E]">ĐƠN HÀNG: {activeOrder.orderCode}</span>
                <span className="text-xs text-[#66786E] ml-3">
                  Gói: {activeOrder.snapshotPlanTier} ({activeOrder.snapshotAmount.toLocaleString('vi-VN')} đ)
                </span>
              </div>
              <HeritageBadge
                variant={
                  activeOrder.status === 'PAID'
                    ? 'success'
                    : activeOrder.status === 'EXPIRED'
                    ? 'danger'
                    : 'gold'
                }
              >
                {activeOrder.status}
              </HeritageBadge>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6">
              {activeOrder.qrUrl && activeOrder.status === 'PENDING' && (
                <div className="p-3 bg-white border border-[#DCD9D0] rounded-xl shadow-xs text-center shrink-0">
                  <img
                    src={activeOrder.qrUrl}
                    alt="VietQR SePay"
                    className="w-44 h-44 object-contain mx-auto"
                  />
                  <span className="text-[10px] text-[#66786E] block mt-1">
                    Quét bằng App Ngân Hàng bất kỳ
                  </span>
                </div>
              )}

              <div className="flex-1 space-y-2 text-xs text-[#14241C]">
                <div>• Mã chuyển khoản (Nội dung): <strong>{activeOrder.orderCode}</strong></div>
                <div>• Số tiền thanh toán: <strong>{activeOrder.snapshotAmount.toLocaleString('vi-VN')} VND</strong></div>
                <div>• Hạn mức cấp: {activeOrder.snapshotAssetLimit} tài sản / {activeOrder.snapshotStorageQuotaMb} MiB</div>
                <div className="flex items-center gap-1.5 text-[#66786E]">
                  <Clock className="w-3.5 h-3.5 text-[#B88E4C]" />
                  <span>Hết hạn lúc: {new Date(activeOrder.expiresAt).toLocaleTimeString('vi-VN')} (15 phút)</span>
                </div>

                {activeOrder.status === 'PAID' && (
                  <div className="p-3 bg-[#E6F4EA] border border-[#A7F3D0] rounded-lg text-[#059669] flex items-center gap-2 mt-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>
                      Đơn hàng đã THANH TOÁN THÀNH CÔNG! Gói cước đã được kích hoạt trong CSDL.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Các nút bấm mô phỏng Webhook & Demo */}
            {activeOrder.status === 'PENDING' && (
              <div className="pt-3 border-t border-[#DCD9D0] flex flex-wrap items-center gap-3">
                <HeritageButton
                  variant="primary"
                  onClick={handleSimulateWebhook}
                  isLoading={isSimulatingWebhook}
                  icon={<PlayCircle className="w-4 h-4" />}
                >
                  Giả lập SePay gọi Webhook (ACID Idempotent)
                </HeritageButton>

                <HeritageButton
                  variant="gold"
                  onClick={handleSimulateDemoSuccess}
                  isLoading={isSimulatingDemo}
                  icon={<PlayCircle className="w-4 h-4" />}
                >
                  Thanh toán Demo (/api/v1/demo/... - Hard Rule 1.7)
                </HeritageButton>
              </div>
            )}

            {webhookResponse && (
              <div className="p-3 bg-[#EFECE6] rounded-lg text-[11px] font-mono text-[#14241C]">
                <span className="font-semibold block mb-1">Phản hồi Webhook SePay:</span>
                <pre>{webhookResponse}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </HeritageCard>
  );
};
