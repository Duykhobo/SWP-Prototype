/**
 * @file entities/claim/model/types.ts
 * @description Domain contracts for inheritance claims, notary verification, and co-beneficiary handover.
 * Conforms to FSD architectural rules and Zero-Any constitution.
 */

export interface HandoverAssetDto {
  assetId: string;
  assetName?: string;
  title?: string;
  fileName?: string;
  category?: string;
  fileSizeBytes?: number;
  sizeFormatted?: string;
  isMandatory?: boolean;
  sha256Checksum?: string;
  downloadUrl?: string;
  downloadEndpoint?: string;
  mimeType?: string;
  decryptionKeyHex?: string;
  initializationVectorHex?: string;
}

export interface CoBeneficiaryDecisionDto {
  recipientId?: string;
  beneficiaryId?: string;
  fullName?: string;
  role?: string;
  decision?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;
  status?: 'PENDING' | 'ACCEPTED' | 'REJECTED' | string;
  decidedAt?: string;
  note?: string;
}

export interface RegisteredDossierDto {
  fullName: string;
  nationalIdMasked: string;
}

export interface CoOwnershipStatusDto {
  mode?: string;
  vaultStatus?: string;
  acceptedCount?: number;
  totalBeneficiariesCount?: number;
  rejectionReason?: string;
  isCoOwned?: boolean;
  requiredApprovals?: number;
  currentApprovals?: number;
  decisions?: CoBeneficiaryDecisionDto[];
}

export interface HandoverEligibilityDto {
  claimId?: string;
  isEligible?: boolean;
  reason?: string;
  registeredDossier?: RegisteredDossierDto;
  coOwnershipStatus?: CoOwnershipStatusDto;
  isRescueHeld?: boolean;
  isExecutorAuthorized?: boolean;
  isVerifierApproved?: boolean;
  isTimeLocked?: boolean;
  timeLockRemainingSeconds?: number;
  isFinalized?: boolean;
  canAccept?: boolean;
  assets?: HandoverAssetDto[];
}

export interface AcceptResponseDto {
  success?: boolean;
  isAlreadyAccepted?: boolean;
  isConsensusComplete?: boolean;
  message?: string;
  grantId?: string;
  grantStatus?: string;
  assets?: HandoverAssetDto[];
}

export interface VerdictResultData {
  verificationOutcome?: string;
  sessionId?: string;
  verdictId?: string;
  outcome?: string;
  verifierNotes?: string;
  submittedAt?: string;
}

export interface HoldResultData {
  holdId?: string;
  videoSessionId?: string;
  isHeld?: boolean;
  message?: string;
}

export interface FinalReceiptData {
  receiptNumber?: string;
  receivedAt?: string;
  beneficiaryName?: string;
  downloadedAssetsCount?: number;
  totalAssetsCount?: number;
  receiptVersion?: string;
  recipientSignatureData?: string;
  signatureHash?: string;
  receiptAuditDigest?: string;
  digitalSignatureAudit?: string;
}
