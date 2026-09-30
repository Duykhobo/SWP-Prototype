import os

file_path = r"c:\Users\ThanhDuy\Documents\01_Code_Projects\SWP-Prototype\client\src\features\workflow-visualizer\InteractiveWorkflowVisualizer.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    text = f.read()

# View mode switcher component JSX
view_mode_switcher = """
      {/* 3-Way Mode Switcher: Simulation vs Blueprint vs Crypto Model */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100 rounded-xl border border-[#DCD9D0]">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#0B291E] uppercase tracking-wider px-2">
            Góc Nhìn Khảo Sát:
          </span>
          <button
            onClick={() => setViewMode('simulation')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'simulation'
                ? 'bg-[#0B291E] text-[#E0C068] shadow-sm ring-1 ring-[#B88E4C]'
                : 'bg-white text-[#44554C] hover:bg-stone-50 border border-[#DCD9D0]'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>1. Mô Phỏng 5 Làn (Swimlanes Steps)</span>
          </button>

          <button
            onClick={() => setViewMode('blueprint')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'blueprint'
                ? 'bg-[#0B291E] text-[#E0C068] shadow-sm ring-1 ring-[#B88E4C]'
                : 'bg-white text-[#44554C] hover:bg-stone-50 border border-[#DCD9D0]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>2. Bản Đồ Cơ Chế Toàn Cảnh (Flow Blueprint)</span>
          </button>

          <button
            onClick={() => setViewMode('crypto_model')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === 'crypto_model'
                ? 'bg-[#0B291E] text-[#E0C068] shadow-sm ring-1 ring-[#B88E4C]'
                : 'bg-white text-[#44554C] hover:bg-stone-50 border border-[#DCD9D0]'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>3. Bức Tranh Mật Mã & Bàn Giao (4-Tier Model)</span>
          </button>
        </div>

        <div className="text-[11px] text-[#66786E] italic">
          {viewMode === 'simulation' && 'Xem dữ liệu luân chuyển thực tế giữa 5 làn bơi theo từng bước'}
          {viewMode === 'blueprint' && 'Xem toàn bộ sơ đồ nút quyết định, nhánh rẽ và tuyến hồi quy ngoại lệ'}
          {viewMode === 'crypto_model' && 'Mô hình phân tầng quan hệ giữa File, DEK, KEK, 3 Mảnh Shamir và R2'}
        </div>
      </div>
"""

# Core Mechanism Banner inside simulation board
core_mechanism_banner = """
        {/* Core Mechanism Banner */}
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border-l-4 border-[#B88E4C] rounded-r-xl space-y-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-bold text-[#0B291E] flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-[#B88E4C]" />
              <span>Cơ Chế Nghiệp Vụ Cốt Lõi (Core Mechanism):</span>
            </span>
            {currentStep.dataFlowPath && (
              <span className="text-[11px] font-mono text-[#19483F] bg-white/90 px-2 py-0.5 rounded border border-[#C9D5D0]">
                🧭 Tuyến dữ liệu: <strong>{currentStep.dataFlowPath}</strong>
              </span>
            )}
          </div>
          <p className="text-xs text-[#2A483D] leading-relaxed font-medium">
            {currentStep.plainMechanism}
          </p>
        </div>
"""

# Full Workflow Blueprint View
blueprint_view = """
      {/* 2. BẢN ĐỒ CƠ CHẾ QUY TRÌNH TOÀN CẢNH (FLOW BLUEPRINT) */}
      {viewMode === 'blueprint' && (
        <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCD9D0] pb-4">
            <div>
              <h3 className="font-bold text-base text-[#0B291E] flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#B88E4C]" />
                <span>
                  Bản Đồ Kiến Trúc Quy Trình Toàn Cảnh: {activeFlowId === 'flow1' ? 'Luồng 01 (Xác Thực & JIT)' : 'Luồng 02 (Thiết Lập, Mã Hóa & Kích Hoạt)'}
                </span>
              </h3>
              <p className="text-xs text-[#66786E]">
                Nhấp vào bất kỳ bước nào dưới đây để kiểm tra chi tiết gói tin, cơ chế mật mã và CSDL tương ứng
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span> Đã hoàn tất
              </span>
              <span className="flex items-center gap-1 text-amber-800 font-semibold bg-amber-50 px-2 py-1 rounded border border-amber-200">
                <span className="w-2 h-2 rounded-full bg-[#B88E4C] animate-pulse"></span> Đang chọn
              </span>
              <span className="flex items-center gap-1 text-rose-800 font-semibold bg-rose-50 px-2 py-1 rounded border border-rose-200">
                <AlertTriangle className="w-3 h-3" /> Ngoại lệ Rollback
              </span>
            </div>
          </div>

          {/* Sequential Step Cards with Connections */}
          <div className="space-y-4">
            {currentSteps.map((step, idx) => {
              const isSelected = idx === activeStepIndex;
              const isPassed = idx < activeStepIndex;

              return (
                <div key={step.id} className="relative">
                  <div
                    onClick={() => setActiveStepIndex(idx)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                      isSelected
                        ? 'bg-[#FBF7EE] border-[#B88E4C] shadow-md ring-2 ring-[#B88E4C]/40'
                        : isPassed
                        ? 'bg-white hover:bg-emerald-50/50 border-emerald-200 shadow-2xs'
                        : 'bg-white hover:bg-stone-50 border-[#DCD9D0]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                          isSelected
                            ? 'bg-[#0B291E] text-[#E0C068]'
                            : isPassed
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-[#EFECE6] text-[#66786E]'
                        }`}
                      >
                        {step.stepNum}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-xs text-[#0B291E]">{step.title}</h4>
                          <HeritageBadge variant={step.lane === 'owner' ? 'gold' : step.lane === 'server' ? 'forest' : 'neutral'}>
                            {step.laneLabel.split('(')[0]}
                          </HeritageBadge>
                        </div>
                        <p className="text-[11px] text-[#66786E]">{step.plainMechanism}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                      <span className="text-[11px] font-mono text-[#19483F] bg-stone-100 px-2.5 py-1 rounded border border-[#DCD9D0]">
                        {step.inboundData.protocol.split(' ')[0]}
                      </span>

                      {step.exception && (
                        <span className="text-[10px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {step.exception.code.split('·')[0].trim()}
                        </span>
                      )}

                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-[#B88E4C] translate-x-1' : 'text-stone-400'}`} />
                    </div>
                  </div>

                  {/* Connective Line to Next Step */}
                  {idx < currentSteps.length - 1 && (
                    <div className="w-0.5 h-3 bg-[#DCD9D0] mx-auto my-0.5"></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
"""

# 4-Tier Cryptographic Model View
crypto_model_view = """
      {/* 3. BỨC TRANH MẬT MÃ & BÀN GIAO DI SẢN SỐ (4-TIER ARCHITECTURE) */}
      {viewMode === 'crypto_model' && (
        <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-6 shadow-sm space-y-6">
          <div className="border-b border-[#DCD9D0] pb-4">
            <h3 className="font-bold text-base text-[#0B291E] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#B88E4C]" />
              <span>Bức Tranh Mật Mã & Bàn Giao Di Sản Số 4 Tầng (4-Tier Cryptographic Architecture)</span>
            </h3>
            <p className="text-xs text-[#66786E]">
              Phân định minh bạch trách nhiệm giữa Tệp bản mã (R2), Khóa mã hóa dữ liệu (DEK), Khóa chủ (Master Key KEK) và 3 Mảnh phân tán (Shamir SSS)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Tier 1 */}
            <div className="p-4 bg-white border border-[#DCD9D0] rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-900 font-bold text-xs flex items-center justify-center">1</span>
                <HeritageBadge variant="neutral">Cloudflare R2</HeritageBadge>
              </div>
              <h4 className="font-bold text-xs text-[#0B291E]">TẦNG 1: TỆP BẢN MÃ (CIPHERTEXT)</h4>
              <p className="text-[11px] text-[#44554C] leading-relaxed">
                Tệp gốc (Video 20MB, PDF di chúc, ảnh kỷ niệm) được mã hóa bằng <strong>AES-256-GCM</strong> rồi cất thẳng lên <strong>Cloudflare R2 Bucket</strong>.
              </p>
              <div className="p-2.5 bg-cyan-50/70 border border-cyan-200 rounded-lg text-[10px] space-y-1 text-cyan-950">
                <p>• <strong>Chi phí tải về (Egress):</strong> 0 USD (Miễn phí 100%).</p>
                <p>• <strong>Chứa khóa giải mã không?:</strong> ❌ TUYỆT ĐỐI KHÔNG.</p>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="p-4 bg-white border border-[#DCD9D0] rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-900 font-bold text-xs flex items-center justify-center">2</span>
                <HeritageBadge variant="forest">SQL Server 2022</HeritageBadge>
              </div>
              <h4 className="font-bold text-xs text-[#0B291E]">TẦNG 2: CHÌA DEK & GÓI WRAPPED DEK</h4>
              <p className="text-[11px] text-[#44554C] leading-relaxed">
                Mỗi file có 1 chìa khóa <strong>DEK 256-bit</strong> ngẫu nhiên. DEK được bọc bằng Master Key KEK thành gói <strong>Wrapped DEK</strong> lưu vào bảng <code>[ContentVersions]</code>.
              </p>
              <div className="p-2.5 bg-indigo-50/70 border border-indigo-200 rounded-lg text-[10px] space-y-1 text-indigo-950">
                <p>• <strong>Ai sinh DEK?:</strong> Máy chủ .NET sinh qua CSPRNG.</p>
                <p>• <strong>Bản rõ DEK:</strong> Xóa sạch khỏi RAM ngay sau khi bọc.</p>
              </div>
            </div>

            {/* Tier 3 */}
            <div className="p-4 bg-white border border-[#DCD9D0] rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-bold text-xs flex items-center justify-center">3</span>
                <HeritageBadge variant="gold">Shamir GF(256)</HeritageBadge>
              </div>
              <h4 className="font-bold text-xs text-[#0B291E]">TẦNG 3: MASTER KEY & 3 MẢNH SHAMIR</h4>
              <p className="text-[11px] text-[#44554C] leading-relaxed">
                Master Key KEK là đối tượng duy nhất được thuật toán <strong>Shamir Secret Sharing (2/3)</strong> bẻ làm 3 mảnh:
              </p>
              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-lg text-[10px] space-y-1 text-amber-950 font-mono">
                <p>• <strong>Mảnh 1 (x=1):</strong> CSDL SQL Server.</p>
                <p>• <strong>Mảnh 2 (x=2):</strong> Passphrase cá nhân của Bạn.</p>
                <p>• <strong>Mảnh 3 (x=3):</strong> Người thừa kế / Tòa án.</p>
              </div>
              <p className="text-[10px] text-amber-900 font-semibold italic">
                * Master Key gốc KHÔNG lưu ở đâu cả. Admin chỉ có 1 mảnh thì nhận 0-bit thông tin!
              </p>
            </div>

            {/* Tier 4 */}
            <div className="p-4 bg-white border border-[#DCD9D0] rounded-xl space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-bold text-xs flex items-center justify-center">4</span>
                <HeritageBadge variant="forest">DMS & Handover</HeritageBadge>
              </div>
              <h4 className="font-bold text-xs text-[#0B291E]">TẦNG 4: BÀN GIAO DI SẢN & DMS</h4>
              <p className="text-[11px] text-[#44554C] leading-relaxed">
                Đồng hồ sinh tồn <strong>Dead Man's Switch</strong> đếm ngược 30 ngày. Quá hạn 7 ngày Time-Lock thì mở cổng cho Executor nộp chứng tử.
              </p>
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200 rounded-lg text-[10px] space-y-1 text-emerald-950">
                <p>• <strong>Thẩm tra:</strong> Verifier duyệt chứng tử pháp lý.</p>
                <p>• <strong>Mở két:</strong> Ghép Mảnh 1 (Server) + Mảnh 3 (Người nhận) để giải mã tệp từ R2.</p>
              </div>
            </div>
          </div>

          {/* Quy Trình Giải Mã Thực Tế */}
          <div className="p-4 bg-[#FAF9F5] border border-[#B88E4C]/40 rounded-xl space-y-2">
            <h4 className="font-bold text-xs text-[#0B291E] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B88E4C]" />
              <span>Quy Trình 4 Bước Phục Hồi & Giải Mã Tệp Di Sản Khi Mở Két:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 bg-white border rounded-lg">
                <span className="font-bold text-amber-800 block text-[11px]">BƯỚC 1: Ghép Khóa</span>
                <p className="text-[10px] text-[#66786E]">Mảnh 1 (Server) + Mảnh 2 (hoặc 3) ➔ Nội suy Lagrange ra Master Key trong RAM.</p>
              </div>
              <div className="p-2.5 bg-white border rounded-lg">
                <span className="font-bold text-indigo-800 block text-[11px]">BƯỚC 2: Mở Gói DEK</span>
                <p className="text-[10px] text-[#66786E]">Master Key mở bọc Wrapped DEK (từ SQL Server) lấy ra chìa DEK trần.</p>
              </div>
              <div className="p-2.5 bg-white border rounded-lg">
                <span className="font-bold text-cyan-800 block text-[11px]">BƯỚC 3: Tải Tệp R2</span>
                <p className="text-[10px] text-[#66786E]">Trình duyệt kéo khối byte Ciphertext từ Cloudflare R2 về qua TLS 1.3.</p>
              </div>
              <div className="p-2.5 bg-white border rounded-lg">
                <span className="font-bold text-emerald-800 block text-[11px]">BƯỚC 4: Giải Mã & Đối Soát</span>
                <p className="text-[10px] text-[#66786E]">Dùng DEK + Nonce giải mã file và kiểm tra khớp Auth Tag 128-bit + SHA-256 Checksum.</p>
              </div>
            </div>
          </div>
        </div>
      )}
"""

# Now find where to insert:
# Insert view_mode_switcher right after closing HeritageCard of Top Banner (line containing "</HeritageCard>")
# And wrap the 5 Swimlanes in "{viewMode === 'simulation' && (" and close it with ")}"
# And insert core_mechanism_banner right above the 5 Swimlanes Columns

card_close_target = "        </div>\n      </HeritageCard>"
card_close_replacement = "        </div>\n      </HeritageCard>\n" + view_mode_switcher

if card_close_target in text:
    text = text.replace(card_close_target, card_close_replacement, 1)

# Now wrap the 5-swimlane simulation board in viewMode === 'simulation'
old_board_start = "{/* Main 5-Swimlanes Simulation Board */}\n      <div className=\"bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-sm space-y-4\">"
new_board_start = """{/* 1. MÔ PHỎNG HOẠT HÌNH 5 LÀN (SWIMLANES) */}
      {viewMode === 'simulation' && (
        <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-sm space-y-4">
""" + core_mechanism_banner

if old_board_start in text:
    text = text.replace(old_board_start, new_board_start, 1)

# And close the simulation board before Inspector
old_inspector_start = "{/* Deep-Dive Active Step Inspector (4 Technical Panels) */}"
new_inspector_start = """        </div>
      )}

""" + blueprint_view + "\n" + crypto_model_view + "\n\n      {/* Deep-Dive Active Step Inspector (4 Technical Panels) */}"

if old_inspector_start in text:
    text = text.replace(old_inspector_start, new_inspector_start, 1)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(text)

print("Injected all views successfully!")
