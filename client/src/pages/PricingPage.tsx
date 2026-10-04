/**
 * @file PricingPage.tsx
 * @description Bảng Giá & Nâng Cấp Gói Dịch Vụ Chuẩn SRS v3.11.0 Tích Hợp VietQR SePay
 */

import React, { useState } from 'react';
import { 
  CreditCard, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  FileText, 
  HardDrive, 
  Users, 
  QrCode,
  ArrowRight
} from 'lucide-react';
import { SePayPaymentModal } from '@/components/modals/SePayPaymentModal';

interface PricingPageProps {
  currentPlan: string;
  onUpgradePlan: (planId: string) => void;
}

export const PricingPage: React.FC<PricingPageProps> = ({
  currentPlan,
  onUpgradePlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<'1Y' | '5Y' | '10Y'>('1Y');
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<{
    id: 'OWNER_FREE' | 'LEGACY_XS' | 'LEGACY_XS_5Y' | 'LEGACY_XS_10Y' | 'LEGACY_XS_MAX' | 'LEGACY_XS_MAX_5Y' | 'LEGACY_XS_MAX_10Y' | 'RECIPIENT_PLUS' | string;
    name: string;
    priceFormatted: string;
    amount: number;
  } | null>(null);

  const getOwnerPlans = () => {
    const xsPlan = billingCycle === '1Y' 
      ? {
          id: 'LEGACY_XS' as const,
          name: 'Legacy XS',
          badge: 'Khuyên Dùng · Phổ Biến',
          price: '199.000 đ',
          period: '365 ngày (1 năm)',
          amount: 199000,
          description: 'Đầy đủ quyền năng lập kế hoạch di sản và gom kho bàn giao.',
          features: [
            'Tối đa 20 tài sản số mã hóa',
            '200 MiB dung lượng lưu trữ R2 Private',
            'Lập kế hoạch bàn giao di sản tự động',
            'Tự động gom Kho Một Người & Đồng Sở Hữu',
            'Phân mảnh Shamir SSS 2/3 chống Rogue Admin',
            'Cửa sổ 7 ngày quyết định cho người nhận',
            'Bảo quản đóng băng 2 năm (FreezeExpiresAt)',
          ],
          notIncluded: ['Xuất file PDF kế hoạch kèm mật mã'],
          isPopular: true,
        }
      : billingCycle === '5Y'
      ? {
          id: 'LEGACY_XS_5Y' as const,
          name: 'Legacy XS (5 Năm)',
          badge: 'Tiết Kiệm 20% · 159k/Năm',
          price: '799.000 đ',
          period: '5 năm (1.825 ngày)',
          amount: 799000,
          description: 'Bảo quản di sản bền vững 5 năm, tiết kiệm 196.000 đ so với mua lẻ từng năm.',
          features: [
            'Tối đa 25 tài sản số mã hóa (+5 tài sản)',
            '250 MiB dung lượng lưu trữ R2 (+50 MiB)',
            'Toàn bộ tính năng cao cấp của Legacy XS',
            'Ưu tiên cảnh báo SMS & Email khi đến hạn check-in',
            'Cam kết không trượt giá suốt 5 năm',
          ],
          notIncluded: ['Xuất file PDF kế hoạch kèm mật mã'],
          isPopular: true,
        }
      : {
          id: 'LEGACY_XS_10Y' as const,
          name: 'Legacy XS (10 Năm)',
          badge: 'Khóa Giá 10 Năm · Tiết Kiệm 35%',
          price: '1.290.000 đ',
          period: '10 năm (3.650 ngày)',
          amount: 1290000,
          description: 'Giải pháp di sản dài hạn 10 năm, tiết kiệm 700.000 đ và an tâm tuyệt đối.',
          features: [
            'Tối đa 30 tài sản số mã hóa (+10 tài sản)',
            '300 MiB dung lượng lưu trữ R2 Private',
            'Khóa giá cố định 10 năm chống lạm phát',
            'Toàn bộ tính năng cao cấp của Legacy XS',
            'Hỗ trợ bảo vệ dữ liệu vĩnh cửu theo hợp đồng',
          ],
          notIncluded: ['Xuất file PDF kế hoạch kèm mật mã'],
          isPopular: true,
        };

    const xsMaxPlan = billingCycle === '1Y'
      ? {
          id: 'LEGACY_XS_MAX' as const,
          name: 'Legacy XS Max',
          badge: 'Đặc Quyền Toàn Diện',
          price: '399.000 đ',
          period: '365 ngày (1 năm)',
          amount: 399000,
          description: 'Dành cho gia đình hoặc doanh nhân có nhiều tài sản giá trị.',
          features: [
            'Tối đa 50 tài sản số mã hóa',
            '500 MiB dung lượng lưu trữ R2 Private',
            'Toàn bộ đặc quyền của gói Legacy XS',
            'Xuất tệp PDF Kế hoạch Di sản có mã hóa',
            'Hỗ trợ thẩm định hồ sơ ưu tiên 24/7',
            'Cấu hình Rescue TimeLock linh hoạt',
          ],
          notIncluded: [],
          isPopular: false,
        }
      : billingCycle === '5Y'
      ? {
          id: 'LEGACY_XS_MAX_5Y' as const,
          name: 'Legacy XS Max (5 Năm)',
          badge: 'Tặng 01 Phiên Thẩm Định Video',
          price: '1.590.000 đ',
          period: '5 năm (1.825 ngày)',
          amount: 1590000,
          description: 'Gói trọn diện 5 năm gia đình, tiết kiệm 405.000 đ và có thẩm định chuyên viên.',
          features: [
            'Tối đa 60 tài sản số mã hóa (+10 tài sản)',
            '600 MiB dung lượng lưu trữ R2 Private',
            'Tặng 01 phiên Verifier Video Call có chuyên viên',
            'Xuất PDF di sản mã hóa không giới hạn',
            'Hỗ trợ kiểm tra Dead Man\'s Switch đa kênh (SMS, Gọi)',
          ],
          notIncluded: [],
          isPopular: false,
        }
      : {
          id: 'LEGACY_XS_MAX_10Y' as const,
          name: 'Legacy XS Max (10 Năm)',
          badge: 'Hoàng Gia · Tiết Kiệm 38%',
          price: '2.490.000 đ',
          period: '10 năm (3.650 ngày)',
          amount: 2490000,
          description: 'Đặc quyền cao nhất: Lưu trữ trọn vẹn 1 thập kỷ, tiết kiệm tới 1.500.000 đ.',
          features: [
            'Tối đa 100 tài sản số mã hóa',
            '1.000 MiB (1 GiB) lưu trữ R2 bảo mật cao',
            'Toàn bộ phiên Verifier Video Call thẩm định miễn phí',
            'Hỗ trợ bảo hộ phòng họp LiveKit chuyên biệt',
            'Ký hợp đồng dịch vụ bảo tồn di sản độc quyền',
          ],
          notIncluded: [],
          isPopular: false,
        };

    return [
      {
        id: 'OWNER_FREE' as const,
        name: 'Owner Free',
        badge: 'Cơ Bản',
        price: '0 đ',
        period: 'Vĩnh viễn',
        amount: 0,
        description: 'Lưu trữ cá nhân và điểm danh sinh tồn cơ bản.',
        features: [
          'Tối đa 3 tài sản số mã hóa',
          '20 MiB dung lượng lưu trữ R2',
          'Điểm danh Dead Man\'s Switch (DMS)',
          'Mã hóa AES-256-GCM máy khách',
        ],
        notIncluded: [
          'Lập kế hoạch bàn giao di sản',
          'Gom kho Một Người & Đồng Sở Hữu',
          'Xuất PDF di sản có mật mã',
        ],
        isPopular: false,
      },
      xsPlan,
      xsMaxPlan
    ];
  };

  const ownerPlans = getOwnerPlans();

  const recipientPlans = [
    {
      id: 'RECIPIENT_FREE' as const,
      name: 'Recipient Free',
      price: '0 đ',
      period: 'Vĩnh viễn',
      amount: 0,
      description: 'Lưu trữ tài sản di sản sau khi đã ký nhận.',
      features: [
        'Lưu tối đa 2 tài sản đã nhận',
        '20 MiB dung lượng lưu trữ cá nhân',
        'Tải giải mã không giới hạn băng thông',
      ],
    },
    {
      id: 'RECIPIENT_PLUS' as const,
      name: 'Recipient Plus',
      price: '49.000 đ',
      period: '30 ngày',
      amount: 49000,
      description: 'Mở rộng không gian lưu giữ di sản được trao quyền.',
      features: [
        'Lưu tối đa 10 tài sản đã nhận',
        '200 MiB dung lượng lưu trữ cá nhân',
        'Tải giải mã trực tiếp trong RAM',
      ],
    },
  ];

  const handleSelectPlan = (plan: typeof ownerPlans[0]) => {
    if (plan.amount === 0) {
      onUpgradePlan(plan.name);
      alert(`Đã chuyển sang gói ${plan.name}`);
      return;
    }

    setSelectedPlanForPayment({
      id: plan.id,
      name: plan.name,
      priceFormatted: plan.price,
      amount: plan.amount,
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-2">
        <span className="text-[11px] font-bold text-[#B88E4C] uppercase tracking-wider bg-[#FBF7EE] border border-[#E8DCC6] px-3 py-1 rounded-full">
          Biểu Phí Chuẩn Hóa Theo SRS v3.11.0
        </span>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#0B291E]">
          Chọn Gói Bảo Quản & Chuyển Giao Di Sản
        </h1>
        <p className="text-xs sm:text-sm text-[#66786E]">
          Thanh toán tự động 24/7 qua cổng VietQR SePay, kích hoạt gói cước ngay tức thì không cần chờ duyệt thủ công.
        </p>
      </div>

      {/* Duration Toggle (1Y / 5Y / 10Y) */}
      <div className="flex justify-center items-center">
        <div className="inline-flex p-1 bg-[#EBE8DF] rounded-xl border border-[#DCD9D0] shadow-inner text-xs font-medium">
          <button
            type="button"
            onClick={() => setBillingCycle('1Y')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
              billingCycle === '1Y'
                ? 'bg-[#0B291E] text-[#FAF9F5] shadow-xs font-bold'
                : 'text-[#66786E] hover:text-[#0B291E]'
            }`}
          >
            1 Năm (Chuẩn)
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('5Y')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              billingCycle === '5Y'
                ? 'bg-[#0B291E] text-[#FAF9F5] shadow-xs font-bold'
                : 'text-[#66786E] hover:text-[#0B291E]'
            }`}
          >
            <span>5 Năm</span>
            <span className="text-[10px] bg-[#B88E4C] text-[#FAF9F5] px-1.5 py-0.5 rounded-full font-bold">
              -20%
            </span>
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle('10Y')}
            className={`px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              billingCycle === '10Y'
                ? 'bg-[#0B291E] text-[#FAF9F5] shadow-xs font-bold'
                : 'text-[#66786E] hover:text-[#0B291E]'
            }`}
          >
            <span>10 Năm</span>
            <span className="text-[10px] bg-[#059669] text-[#FAF9F5] px-1.5 py-0.5 rounded-full font-bold">
              -35% · Khóa giá
            </span>
          </button>
        </div>
      </div>

      {/* 1. OWNER PLANS (3 CARDS) */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#DCD9D0] pb-2">
          <ShieldCheck className="w-5 h-5 text-[#B88E4C]" />
          <h2 className="font-serif font-bold text-base text-[#0B291E]">
            Gói Dành Cho Chủ Sở Hữu (Owner Vault)
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {ownerPlans.map((plan) => {
            const isCurrent = currentPlan.toLowerCase().includes(plan.name.toLowerCase());

            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 flex flex-col justify-between transition-all relative ${
                  plan.isPopular
                    ? 'bg-[#FAF9F5] border-2 border-[#B88E4C] shadow-tactile-gold'
                    : 'bg-[#FAF9F5] border border-[#DCD9D0] shadow-tactile-raised'
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#B88E4C] text-[#FAF9F5] text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full shadow-xs">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Title & Price */}
                  <div>
                    <span className="text-xs font-bold text-[#66786E] uppercase tracking-wider block">
                      {plan.name}
                    </span>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-3xl font-serif font-bold text-[#0B291E]">
                        {plan.price}
                      </span>
                      <span className="text-xs text-[#66786E]">/ {plan.period}</span>
                    </div>
                    <p className="text-xs text-[#66786E] mt-2">
                      {plan.description}
                    </p>
                  </div>

                  {/* Features List */}
                  <div className="pt-4 border-t border-[#DCD9D0] space-y-2.5 text-xs">
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[#14241C]">
                        <Check className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                    {plan.notIncluded.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[#66786E]/60 line-through">
                        <span className="w-4 text-center shrink-0">✕</span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-4 border-t border-[#DCD9D0]">
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      isCurrent
                        ? 'bg-[#E5EDE8] text-[#059669] border border-[#059669]/30 cursor-default'
                        : plan.isPopular
                        ? 'bg-[#0B291E] hover:bg-[#133E2F] active:scale-95 text-[#FAF9F5]'
                        : 'bg-[#FAF9F5] hover:bg-white text-[#0B291E] border border-[#DCD9D0]'
                    }`}
                  >
                    {isCurrent ? (
                      <span>Đang Sử Dụng Gói Này</span>
                    ) : (
                      <>
                        <span>{plan.amount === 0 ? 'Dùng Miễn Phí' : 'Nâng Cấp Qua VietQR'}</span>
                        {plan.amount > 0 && <QrCode className="w-3.5 h-3.5 text-[#B88E4C]" />}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. RECIPIENT PLANS (2 CARDS) */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2 border-b border-[#DCD9D0] pb-2">
          <Users className="w-5 h-5 text-[#B88E4C]" />
          <h2 className="font-serif font-bold text-base text-[#0B291E]">
            Gói Dành Cho Người Thụ Hưởng (Recipient Vault)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          {recipientPlans.map((plan) => (
            <div
              key={plan.id}
              className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-tactile-raised flex flex-col justify-between space-y-4"
            >
              <div>
                <span className="text-xs font-bold text-[#66786E] uppercase tracking-wider block">
                  {plan.name}
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-serif font-bold text-[#0B291E]">
                    {plan.price}
                  </span>
                  <span className="text-xs text-[#66786E]">/ {plan.period}</span>
                </div>
                <p className="text-xs text-[#66786E] mt-1.5">
                  {plan.description}
                </p>

                <div className="mt-4 pt-3 border-t border-[#DCD9D0] space-y-2 text-xs">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[#14241C]">
                      <Check className="w-3.5 h-3.5 text-[#059669]" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (plan.amount === 0) {
                    alert('Gói Recipient Free được áp dụng mặc định cho mọi người nhận.');
                  } else {
                    setSelectedPlanForPayment({
                      id: plan.id as any,
                      name: plan.name,
                      priceFormatted: plan.price,
                      amount: plan.amount,
                    });
                  }
                }}
                className="w-full py-2 bg-white hover:bg-[#FAF9F5] text-[#0B291E] border border-[#DCD9D0] rounded-xl text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                {plan.amount === 0 ? 'Mặc Định Miễn Phí' : 'Nâng Cấp Gói'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SePay Payment Modal */}
      {selectedPlanForPayment && (
        <SePayPaymentModal
          isOpen={true}
          onClose={() => setSelectedPlanForPayment(null)}
          planId={selectedPlanForPayment.id}
          planName={selectedPlanForPayment.name}
          priceFormatted={selectedPlanForPayment.priceFormatted}
          amount={selectedPlanForPayment.amount}
          onSuccess={(planId) => {
            onUpgradePlan(selectedPlanForPayment.name);
            alert(`Nâng cấp thành công lên gói ${selectedPlanForPayment.name}!`);
          }}
        />
      )}
    </div>
  );
};
