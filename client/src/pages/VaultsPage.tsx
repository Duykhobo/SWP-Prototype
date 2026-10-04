/**
 * @file VaultsPage.tsx
 * @description Trang Quản lý Kho Di Sản & Gom Kho Bàn Giao (SRS v3.11.0)
 */

import React, { useState } from 'react';
import { 
  Shield, 
  FolderLock, 
  Plus, 
  FileKey, 
  KeyRound, 
  Lock, 
  FileText, 
  Sparkles, 
  Users, 
  Download, 
  Eye, 
  CheckCircle2, 
  Filter, 
  Search,
  ExternalLink,
  ShieldAlert,
  HardDrive
} from 'lucide-react';
import type { AssetItem } from '@/entities/asset';

interface VaultsPageProps {
  assets: AssetItem[];
  onOpenNewAssetModal: () => void;
}

export const VaultsPage: React.FC<VaultsPageProps> = ({
  assets,
  onOpenNewAssetModal,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterVaultType, setFilterVaultType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [decryptedAssetId, setDecryptedAssetId] = useState<string | null>(null);

  const filteredAssets = assets.filter((asset) => {
    const matchesCat = filterCategory === 'ALL' || asset.category === filterCategory;
    const matchesVault = filterVaultType === 'ALL' || asset.vaultType === filterVaultType;
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.vaultName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesVault && matchesSearch;
  });

  const handleSimulateDecrypt = (id: string) => {
    setDecryptedAssetId(id);
    setTimeout(() => {
      alert('Tệp đã được giải mã trực tiếp trong RAM bằng DEK phục hồi! Không ghi file nháp xuống ổ cứng theo chuẩn Zero-Knowledge.');
      setDecryptedAssetId(null);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF9F5] p-6 rounded-2xl border border-[#DCD9D0] shadow-tactile-raised">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif font-bold text-xl text-[#0B291E]">
              Kho Di Sản & Cơ Chế Gom Kho Bàn Giao
            </h1>
            <span className="text-[10px] bg-[#E5EDE8] text-[#0B291E] border border-[#0B291E]/20 px-2 py-0.5 rounded-full font-bold uppercase">
              AES-256-GCM
            </span>
          </div>
          <p className="text-xs text-[#66786E] mt-1 max-w-2xl">
            Tài sản số được mã hóa phong bì độc lập (Envelope Encryption) và gom nhóm tự động thành Kho Một Người hoặc Kho Đồng Sở Hữu theo quy chế SRS v3.11.0.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewAssetModal}
          className="px-4 py-2.5 bg-[#0B291E] hover:bg-[#133E2F] text-[#FAF9F5] rounded-xl text-xs font-bold transition-all shadow-tactile-raised flex items-center gap-2 cursor-pointer active:scale-95 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#B88E4C]" />
          <span>Niêm Phong Tài Sản Mới</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#EFECE6] p-3 rounded-2xl border border-[#DCD9D0]">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#66786E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên di sản, kho gom..."
            className="w-full bg-[#FAF9F5] border border-[#DCD9D0] focus:border-[#B88E4C] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#14241C] outline-hidden shadow-tactile-inset"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end text-xs">
          {/* Vault Type Selector */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-[#DCD9D0]">
            {[
              { id: 'ALL', label: 'Tất cả Kho' },
              { id: 'SINGLE_RECIPIENT', label: 'Kho Một Người' },
              { id: 'CO_OWNED', label: 'Kho Đồng Sở Hữu' },
            ].map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => setFilterVaultType(v.id)}
                className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  filterVaultType === v.id
                    ? 'bg-[#0B291E] text-[#FAF9F5]'
                    : 'text-[#66786E] hover:text-[#0B291E]'
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-xl border border-[#DCD9D0]">
            <Filter className="w-3.5 h-3.5 text-[#B88E4C]" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent text-xs text-[#0B291E] font-medium border-0 outline-hidden cursor-pointer"
            >
              <option value="ALL">Mọi loại di sản</option>
              <option value="CRYPTO">Ví Tiền Số & Khóa</option>
              <option value="PASSWORD">Mật Khẩu & 2FA</option>
              <option value="LEGAL_DOC">Hồ Sơ Di Chúc</option>
              <option value="LETTER">Thư Riêng Tư</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assets Grid Display */}
      {filteredAssets.length === 0 ? (
        <div className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-12 text-center space-y-3 shadow-tactile-raised">
          <FolderLock className="w-12 h-12 text-[#B88E4C] mx-auto opacity-70" />
          <h3 className="font-serif font-bold text-base text-[#0B291E]">
            Không tìm thấy tài sản số phù hợp
          </h3>
          <p className="text-xs text-[#66786E] max-w-sm mx-auto">
            Chưa có tài sản nào khớp với điều kiện lọc. Bạn có thể thêm tài sản số mới để tiến hành niêm phong mã hóa.
          </p>
          <button
            type="button"
            onClick={onOpenNewAssetModal}
            className="px-4 py-2 bg-[#0B291E] text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#B88E4C]" />
            <span>Thêm Tài Sản Mới Ngay</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAssets.map((asset) => {
            const isSingle = asset.vaultType === 'SINGLE_RECIPIENT';

            return (
              <div
                key={asset.id}
                className="bg-[#FAF9F5] border border-[#DCD9D0] rounded-2xl p-5 shadow-tactile-raised flex flex-col justify-between hover:border-[#B88E4C]/60 transition-colors space-y-4"
              >
                <div className="space-y-3">
                  {/* Top Bar: Vault Tag & Category */}
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSingle
                        ? 'bg-[#E5EDE8] text-[#0B291E] border-[#0B291E]/20'
                        : 'bg-[#FBF7EE] text-[#7D5D28] border-[#E8DCC6]'
                    }`}>
                      {isSingle ? 'Kho Một Người' : 'Kho Đồng Sở Hữu'}
                    </span>

                    <span className="text-[10px] text-[#66786E] bg-white border border-[#DCD9D0] px-2 py-0.5 rounded font-mono">
                      {asset.sizeFormatted}
                    </span>
                  </div>

                  {/* Asset Name */}
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#E5EDE8] flex items-center justify-center text-[#0B291E] shrink-0 mt-0.5">
                      {asset.category === 'CRYPTO' && <KeyRound className="w-5 h-5 text-[#B88E4C]" />}
                      {asset.category === 'PASSWORD' && <Lock className="w-5 h-5 text-[#0B291E]" />}
                      {asset.category === 'LEGAL_DOC' && <FileText className="w-5 h-5 text-[#0B291E]" />}
                      {asset.category === 'LETTER' && <Sparkles className="w-5 h-5 text-[#B88E4C]" />}
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-sm text-[#0B291E] leading-snug">
                        {asset.name}
                      </h3>
                      <p className="text-[11px] text-[#66786E] mt-0.5 font-medium">
                        Kho: {asset.vaultName}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Specs Box */}
                  <div className="bg-[#EFECE6]/60 p-2.5 rounded-xl border border-[#DCD9D0] text-xs space-y-1.5 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-[#66786E]">Thuật toán:</span>
                      <span className="font-bold text-[#0B291E]">{asset.encryptionAlg}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#66786E]">Mã băm SHA-256:</span>
                      <span className="text-[#0B291E] truncate max-w-[150px]" title={asset.sha256Hash}>
                        {asset.sha256Hash.substring(0, 16)}...
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#66786E]">Người nhận:</span>
                      <span className="font-sans font-semibold text-[#0B291E] truncate max-w-[150px]">
                        {asset.recipients.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-[#DCD9D0] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#059669] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã Niêm Phong R2</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleSimulateDecrypt(asset.id)}
                    disabled={decryptedAssetId === asset.id}
                    className="px-2.5 py-1 bg-[#FAF9F5] hover:bg-white text-[#0B291E] border border-[#DCD9D0] rounded-lg font-bold text-[11px] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-[#B88E4C]" />
                    <span>{decryptedAssetId === asset.id ? 'Đang giải mã...' : 'Giải Mã RAM'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
