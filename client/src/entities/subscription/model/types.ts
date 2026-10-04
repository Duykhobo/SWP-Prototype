/**
 * @file entities/subscription/model/types.ts
 * @description Domain contracts for subscription plans and multi-year pricing tiers (1Y, 5Y, 10Y).
 * Conforms to FSD architectural rules and Zero-Any constitution.
 */

export type BillingCycle = 'ANNUAL' | '5_YEARS' | '10_YEARS';

export type SubscriptionTier = 
  | 'LEGACY_FREE'
  | 'LEGACY_STANDARD'
  | 'LEGACY_STANDARD_5Y'
  | 'LEGACY_STANDARD_10Y'
  | 'LEGACY_PRO'
  | 'LEGACY_PRO_5Y'
  | 'LEGACY_PRO_10Y'
  | 'LEGACY_FAMILY'
  | 'LEGACY_FAMILY_5Y'
  | 'LEGACY_FAMILY_10Y'
  | 'LEGACY_ENTERPRISE'
  | 'LEGACY_ENTERPRISE_5Y'
  | 'LEGACY_ENTERPRISE_10Y'
  | 'LEGACY_XS_5Y'
  | 'LEGACY_XS_10Y'
  | 'LEGACY_XS_MAX_5Y'
  | 'LEGACY_XS_MAX_10Y';

export interface PlanFeature {
  text: string;
  included: boolean;
}

export interface SubscriptionPlan {
  id: string;
  tierKey: string;
  name: string;
  tagline: string;
  priceVnd: number;
  originalPriceVnd?: number;
  periodLabel: string;
  storageGb: number;
  recipientsCount: number;
  features: PlanFeature[];
  badge?: string;
  isPopular?: boolean;
}
