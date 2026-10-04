/**
 * @file entities/asset/model/types.ts
 * @description Domain entity contracts for vault digital assets (AES-256-GCM envelope).
 * Conforms to FSD architectural rules and Zero-Any constitution.
 */

export type AssetCategory = 'CRYPTO' | 'PASSWORD' | 'LEGAL_DOC' | 'LETTER';
export type VaultType = 'SINGLE_RECIPIENT' | 'CO_OWNED';

export interface AssetItem {
  id: string;
  name: string;
  category: AssetCategory;
  sizeFormatted: string;
  vaultType: VaultType;
  vaultName: string;
  recipients: string[];
  encryptionAlg: string;
  sha256Hash: string;
  createdAt: string;
  isSealed: boolean;
}
