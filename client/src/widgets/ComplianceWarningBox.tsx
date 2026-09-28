/**
 * @file ComplianceWarningBox.tsx
 * @description Domain Protocol Component #5: Hộp cảnh báo và tra cứu tuân thủ pháp lý
 * Căn cứ: Luật Giao dịch điện tử 2023, Bộ luật Dân sự 2015, Bộ luật Tố tụng Dân sự 2015
 */

import React, { useState } from 'react';
import { HeritageBadge } from '@/shared/ui/HeritageBadge';
import { HeritageButton } from '@/shared/ui/HeritageButton';
import { 
  Scale, 
  AlertCircle, 
  BookOpen, 
  X, 
  ShieldCheck, 
  FileText, 
  Flame, 
  Lock, 
  Gavel, 
  Users, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface ComplianceWarningBoxProps {
  totalAssetsValue?: number;
}

export const ComplianceWarningBox: React.FC<ComplianceWarningBoxProps> = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'classification' | 'contracts' | 'judicial' | 'boundary'>('classification');

  return (
    <>
      <div className="p-4 bg-[#FBF7EE] border border-[#E8DCC6] rounded-xl text-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-[#0B291E]">
            <Scale className="w-4 h-4 text-[#B88E4C]" />
            <span>Cảnh Báo Tuân Thủ Pháp Luật Dân Sự & Thừa Kế</span>
          </div>
          <div className="flex items-center gap-1.5">
            <HeritageBadge variant="gold">BLDS 2015</HeritageBadge>
            <HeritageBadge variant="forest">Luật GDĐT 2023</HeritageBadge>
          </div>
        </div>

        <div className="space-y-1.5 text-[#14241C] text-[11px] leading-relaxed">
          <p>
            • <strong>Điều 612 BLDS 2015:</strong> Di sản bao gồm tài sản riêng của người chết và phần tài sản của người chết trong tài sản chung với người khác.
          </p>
          <p>
            • <strong>Điều 644 BLDS 2015:</strong> Người thừa kế không phụ thuộc nội dung di chúc (cha mẹ, vợ/chồng, con chưa thành niên/mất khả năng lao động) được hưởng tối thiểu <strong>2/3 suất thừa kế theo pháp luật</strong>.
          </p>
        </div>

        <div className="pt-2 border-t border-[#E8DCC6] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[10px] text-[#66786E]">
            <AlertCircle className="w-3.5 h-3.5 text-[#B88E4C] shrink-0" />
            <span>3 Chế định Hợp đồng dân sự: Điều 120 • Điều 415 • Điều 562 BLDS.</span>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#0B291E] text-[#F3E5C8] font-semibold rounded-md hover:bg-[#133E2F] transition-colors cursor-pointer text-[10px] shrink-0"
          >
            <BookOpen className="w-3 h-3 text-[#B88E4C]" />
            Xem Bản Giải Trình Pháp Lý & Cơ Chế Tuân Thủ
          </button>
        </div>
      </div>

      {/* Modal Bản Giải Trình Pháp Lý Hoàn Chỉnh */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#0B291E] text-[#FAF9F5] flex items-center justify-between border-b border-[#B88E4C]/30">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#B88E4C]/20 border border-[#B88E4C]/40 rounded-lg text-[#B88E4C]">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-[#FAF9F5]">
                    Bản Giải Trình Giải Pháp Pháp Lý & Cơ Chế Tuân Thủ Luật Dân Sự
                  </h3>
                  <p className="text-xs text-[#FAF9F5]/70">
                    Căn cứ Luật Giao dịch điện tử 2023, BLDS 2015, BLTTDS 2015 trong Hệ thống LegacyVault
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-[#FAF9F5]/70 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tab Navigation */}
            <div className="px-6 py-2.5 bg-[#FBF7EE] border-b border-[#E8DCC6] flex flex-wrap gap-2 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('classification')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'classification'
                    ? 'bg-[#0B291E] text-[#FAF9F5] shadow-xs'
                    : 'text-[#66786E] hover:text-[#0B291E] hover:bg-[#EFECE6]'
                }`}
              >
                1. Phân Định 3 Nhóm Dữ Liệu
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('contracts')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'contracts'
                    ? 'bg-[#0B291E] text-[#FAF9F5] shadow-xs'
                    : 'text-[#66786E] hover:text-[#0B291E] hover:bg-[#EFECE6]'
                }`}
              >
                2. 3 Chế Định Hợp Đồng Dân Sự
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('judicial')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'judicial'
                    ? 'bg-[#0B291E] text-[#FAF9F5] shadow-xs'
                    : 'text-[#66786E] hover:text-[#0B291E] hover:bg-[#EFECE6]'
                }`}
              >
                3. Zero-Knowledge & Phục Vụ Tòa Án
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('boundary')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === 'boundary'
                    ? 'bg-[#0B291E] text-[#FAF9F5] shadow-xs'
                    : 'text-[#66786E] hover:text-[#0B291E] hover:bg-[#EFECE6]'
                }`}
              >
                4. Giới Hạn & Tranh Chấp Ngoại Tuyến
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-[#2A3F33] flex-1">
              {/* TAB 1: PHÂN ĐỊNH 3 NHÓM DỮ LIỆU */}
              {activeTab === 'classification' && (
                <div className="space-y-4">
                  <div className="p-3.5 bg-[#E5EDE8] border border-[#CBD5CB] rounded-xl space-y-1">
                    <span className="font-bold text-[#0B291E] text-sm block">
                      Phân Định Khái Niệm: Tài Sản Số (Digital Assets) vs. Di Sản Số (Digital Estate)
                    </span>
                    <p className="text-[11px] text-[#3A5345]">
                      • <strong>Tài sản số (Điều 105 BLDS 2015):</strong> Tồn tại và thuộc quyền quản lý, sử dụng, định đoạt của chủ sở hữu khi còn sống (<em>inter vivos</em>).<br />
                      • <strong>Di sản số (Điều 612 BLDS 2015):</strong> Chỉ phát sinh tại thời điểm mở thừa kế (Điều 611 BLDS), là phần tài sản số hợp pháp còn lại sau khi thanh toán nghĩa vụ và loại trừ các quyền nhân thân không thể chuyển giao (Điều 25 BLDS).
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Nhóm 1 */}
                    <div className="p-4 bg-white border border-[#DCD9D0] rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-[#0B291E]">
                        <ShieldCheck className="w-4 h-4 text-[#059669]" />
                        <span>Nhóm 1: Di Sản Kinh Tế</span>
                      </div>
                      <p className="text-[11px] text-[#66786E]">
                        <strong>Economic Digital Estate:</strong> Ví tài sản số crypto, tên miền, tài khoản thương mại, bản quyền kinh doanh.
                      </p>
                      <div className="p-2 bg-[#E6F4EA] border border-[#A7F3D0] rounded-md text-[10px] text-[#065F46] font-medium">
                        ✓ Chuyển giao quyền tiếp cận & kiểm soát theo Điều 105, 115 BLDS 2015.
                      </div>
                    </div>

                    {/* Nhóm 2 */}
                    <div className="p-4 bg-white border border-[#DCD9D0] rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 font-bold text-[#0B291E]">
                        <FileText className="w-4 h-4 text-[#B88E4C]" />
                        <span>Nhóm 2: Kỷ Vật / Ký Ức Số</span>
                      </div>
                      <p className="text-[11px] text-[#66786E]">
                        <strong>Digital Mementos:</strong> Hình ảnh gia đình, video kỷ niệm, thư từ lưu niệm trao gửi thân nhân.
                      </p>
                      <div className="p-2 bg-[#FAF6EE] border border-[#D5C29E] rounded-md text-[10px] text-[#8C682D] font-medium">
                        ✓ Bàn giao lưu niệm cho người thân được chỉ định theo ý chí chủ kho.
                      </div>
                    </div>

                    {/* Nhóm 3 */}
                    <div className="p-4 bg-white border border-[#FECACA] rounded-xl space-y-2 bg-[#FFF8F8]">
                      <div className="flex items-center gap-1.5 font-bold text-[#B91C1C]">
                        <Flame className="w-4 h-4 text-[#D9534F]" />
                        <span>Nhóm 3: Bí Mật Nhân Thân</span>
                      </div>
                      <p className="text-[11px] text-[#66786E]">
                        <strong>Confidential Personal Data:</strong> Nhật ký riêng tư, thư từ bí mật không thể chuyển giao (Điều 25, 38 BLDS 2015).
                      </p>
                      <div className="p-2 bg-[#FEE2E2] border border-[#FECACA] rounded-md text-[10px] text-[#991B1B] font-bold">
                        🔥 Tự động tiêu hủy mật mã (Cryptographic Burn) — Xóa vĩnh viễn khóa giải mã khi mở thừa kế.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: 3 CHẾ ĐỊNH HỢP ĐỒNG DÂN SỰ */}
              {activeTab === 'contracts' && (
                <div className="space-y-3.5">
                  <p className="text-[#4A453A]">
                    Để giải quyết bài toán di chúc điện tử chưa được công nhận trong thực tiễn công chứng và tránh xung đột với Khoản 2 Điều 1 Luật Giao dịch điện tử 2023, LegacyVault xác lập bản chất pháp lý theo <strong>3 chế định hợp đồng dân sự hợp pháp</strong>:
                  </p>

                  <div className="space-y-2.5">
                    <div className="p-3.5 bg-white border border-[#DCD9D0] rounded-xl space-y-1">
                      <div className="font-bold text-[#0B291E] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#0B291E] text-white flex items-center justify-center text-[10px]">1</span>
                        <span>Giao dịch dân sự có điều kiện phát sinh (Điều 120 BLDS 2015)</span>
                      </div>
                      <p className="text-[11px] text-[#66786E] pl-7">
                        Sự kiện chủ tài khoản mất liên lạc trong một khoảng thời gian xác định (Dead Man's Switch), kết hợp với văn bản xác nhận sự kiện tử tuất hợp pháp, được thỏa thuận là điều kiện phát sinh hiệu lực của việc chuyển giao quyền tiếp cận thông tin cho bên thụ hưởng.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white border border-[#DCD9D0] rounded-xl space-y-1">
                      <div className="font-bold text-[#0B291E] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#0B291E] text-white flex items-center justify-center text-[10px]">2</span>
                        <span>Hợp đồng vì lợi ích của người thứ ba (Điều 415 BLDS 2015)</span>
                      </div>
                      <p className="text-[11px] text-[#66786E] pl-7">
                        Chủ tài khoản xác lập thỏa thuận với bên quản trị dịch vụ nhằm mục đích: Khi điều kiện xảy ra, người thứ ba (Người thụ hưởng) có quyền trực tiếp yêu cầu tiếp nhận các thông tin, tài liệu và quyền kiểm soát tài sản số mà không cần sự can thiệp của chủ tài khoản.
                      </p>
                    </div>

                    <div className="p-3.5 bg-white border border-[#DCD9D0] rounded-xl space-y-1">
                      <div className="font-bold text-[#0B291E] flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-[#0B291E] text-white flex items-center justify-center text-[10px]">3</span>
                        <span>Hợp đồng ủy quyền thực hiện công việc (Điều 562 BLDS 2015)</span>
                      </div>
                      <p className="text-[11px] text-[#66786E] pl-7">
                        Người thi hành (Executor) đóng vai trò là bên được ủy quyền đại diện nộp văn bản chứng minh sự kiện tử tuất và giám sát quá trình bàn giao thông tin cho các bên thụ hưởng theo đúng ý chí ban đầu.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF6EE] border border-[#D5C29E] rounded-xl space-y-1">
                    <span className="font-bold text-[#0B291E] block">Ý chí minh mẫn & Quyền thu hồi ý chí:</span>
                    <p className="text-[11px] text-[#66786E]">
                      • <strong>Điều 117 & 630 BLDS:</strong> Video tuyên thệ minh mẫn 15s ghi nhận họ tên, ngày sinh và ý chí tự nguyện không bị cưỡng ép.<br />
                      • <strong>Điều 638 BLDS:</strong> Quyền sửa đổi và thu hồi ý chí bất kỳ lúc nào khi chủ kho còn hoạt động; giao dịch xác lập sau cùng phủ quyết giao dịch trước.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: ZERO-KNOWLEDGE & TÒA ÁN */}
              {activeTab === 'judicial' && (
                <div className="space-y-3.5">
                  <div className="p-3.5 bg-[#E5EDE8] border border-[#CBD5CB] rounded-xl space-y-1.5">
                    <div className="font-bold text-[#0B291E] flex items-center gap-2">
                      <Gavel className="w-4 h-4 text-[#0B291E]" />
                      <span>Cơ Chế Phục Vụ Thanh Tra, Xét Xử Khi Không Có Khóa Giải Mã (Zero-Knowledge Compliance)</span>
                    </div>
                    <p className="text-[11px] text-[#3A5345]">
                      Toàn bộ gói dữ liệu được bảo vệ bằng mã hóa phong bì AES-256-GCM. Nhà cung cấp dịch vụ không nắm giữ khóa giải mã (Zero-Knowledge). Khi cơ quan chức năng tiến hành thanh tra, xét xử:
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <div className="p-3 bg-white border border-[#DCD9D0] rounded-xl space-y-1">
                      <span className="font-bold text-[#0B291E] block">1. Giám sát tính toàn vẹn (Điều 95 BLTTDS 2015 & Điều 12, 15 Luật GDĐT 2023):</span>
                      <p className="text-[11px] text-[#66786E]">
                        Cơ quan chức năng thẩm định tính pháp lý thông qua mã băm SHA-256 (<code>manifest_hash</code>), tem thời gian số RFC 3161 TSA bất biến trên Sổ cái WORM, video tuyên thệ minh mẫn 15s và chữ ký số ECDSA P-256 mà không cần giải mã dữ liệu bên trong.
                      </p>
                    </div>

                    <div className="p-3 bg-white border border-[#DCD9D0] rounded-xl space-y-1">
                      <span className="font-bold text-[#0B291E] block">2. Phục hồi khóa theo Lệnh Tòa án (Điều 106 BLTTDS 2015):</span>
                      <p className="text-[11px] text-[#66786E]">
                        Khi có Quyết định trưng thu chứng cứ hợp pháp của Tòa án, hệ thống và Công chứng viên phối hợp cung cấp <strong>2/3 Mảnh khóa Shamir</strong> (Mảnh 1 System + Mảnh 2 Verifier) để phục hồi Master Key giải mã tài sản dưới sự giám sát của Hội đồng giám định tư pháp.
                      </p>
                    </div>

                    <div className="p-3 bg-white border border-[#DCD9D0] rounded-xl space-y-1">
                      <span className="font-bold text-[#0B291E] block">3. Biện pháp khẩn cấp tạm thời (Điều 114 BLTTDS 2015):</span>
                      <p className="text-[11px] text-[#66786E]">
                        Lập tức tiếp nhận lệnh phong tỏa từ Tòa án và kích hoạt trạng thái <code>JUDICIAL_FREEZE</code> để ngăn chặn tẩu tán tài sản.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GIỚI HẠN & TRANH CHẤP NGOẠI TUYẾN */}
              {activeTab === 'boundary' && (
                <div className="space-y-3.5">
                  <div className="p-3.5 bg-[#FFF8F8] border border-[#FECACA] rounded-xl space-y-1">
                    <span className="font-bold text-[#B91C1C] flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-[#D9534F]" />
                      Giới Hạn Phạm Vi Trách Nhiệm Của Hệ Thống Kỹ Thuật
                    </span>
                    <p className="text-[11px] text-[#7F1D1D] leading-relaxed">
                      LegacyVault chỉ hỗ trợ lưu trữ, mã hóa và bàn giao thông tin tài sản số theo cấu hình do Chủ kho thiết lập. 
                      <strong> Hệ thống không xác định quyền sở hữu tài sản, quan hệ gia đình, quyền nhận tài sản, nghĩa vụ tài chính hoặc giải quyết tranh chấp pháp lý giữa các bên.</strong>
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="p-3 bg-white border border-[#DCD9D0] rounded-xl space-y-1">
                      <span className="font-bold text-[#0B291E] block">• Đóng băng tranh chấp (<code>DISPUTED_FROZEN</code>):</span>
                      <p className="text-[11px] text-[#66786E]">
                        Khi nhận báo cáo tranh chấp, System Administrator có thể chuyển kho sang trạng thái đóng băng. Trong trạng thái này, hệ thống tạm dừng mọi yêu cầu giải mã và chỉ xuất hồ sơ kỹ thuật (lịch sử thao tác, mã băm, dấu thời gian) phục vụ việc giải quyết bên ngoài.
                      </p>
                    </div>

                    <div className="p-3 bg-white border border-[#DCD9D0] rounded-xl space-y-1">
                      <span className="font-bold text-[#0B291E] block">• Tài sản bắt buộc đăng ký quyền sở hữu (Bất động sản, Xe cộ, Sổ tiết kiệm):</span>
                      <p className="text-[11px] text-[#66786E]">
                        Hệ thống chỉ cung cấp <strong>Văn bản chỉ dẫn và tài liệu đối soát nguồn gốc</strong>. Việc chuyển quyền sở hữu thực tế bắt buộc phải tiến hành thủ tục khai nhận hoặc phân chia di sản thừa kế theo đúng trình tự pháp luật công chứng và cơ quan nhà nước có thẩm quyền.
                      </p>
                    </div>

                    <div className="p-3 bg-white border border-[#DCD9D0] rounded-xl space-y-1">
                      <span className="font-bold text-[#0B291E] block">• Khôi phục quyền kiểm soát của Chủ kho:</span>
                      <p className="text-[11px] text-[#66786E]">
                        Nếu Chủ kho đăng nhập và xác thực thành công trong thời gian chờ (Grace Period), hệ thống hủy yêu cầu bàn giao, đưa kho về trạng thái <code>ACTIVE</code> và ghi nhận vào nhật ký kiểm toán bất biến.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-[#FAF6EE] border-t border-[#E8DCC6] flex items-center justify-between text-xs">
              <span className="text-[11px] text-[#66786E]">
                Dự án Tốt nghiệp SWP391 • Khung pháp lý tuân thủ Luật GDĐT 2023 & BLDS 2015
              </span>
              <HeritageButton
                variant="primary"
                onClick={() => setIsModalOpen(false)}
              >
                Đóng Cửa Sổ
              </HeritageButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
