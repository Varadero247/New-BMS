// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Inline copy — source of truth is packages/config/src/pricing.config.ts
export const PARTNER_TIERS = {
  REFERRAL: {
    id: 'referral',
    name: 'Referral',
    discountPct: 0,
    commissionPct: 15,
    minACV: 0,
    dealProtectionDays: 90,
    nfrSeats: 0,
    features: [
      '15% revenue share',
      '90-day deal protection',
      'Co-branded materials',
      'Partner dashboard',
    ],
  },
  RESELLER: {
    id: 'reseller',
    name: 'Reseller',
    discountPct: 20,
    commissionPct: 0,
    minACV: 5000,
    dealProtectionDays: 90,
    nfrSeats: 5,
    features: [
      '20% discount on all deals',
      '90-day deal protection',
      '5 NFR seats',
      'Deal desk support',
      'Co-marketing funds',
    ],
  },
  STRATEGIC: {
    id: 'strategic',
    name: 'Strategic',
    discountPct: 30,
    commissionPct: 0,
    minACV: 25000,
    dealProtectionDays: 90,
    nfrSeats: 10,
    features: [
      '30% discount on all deals',
      '90-day deal protection + 30-day extension',
      '10 NFR seats',
      'Dedicated Partner Success Manager',
      'Joint go-to-market',
    ],
  },
  WHITE_LABEL: {
    id: 'white_label',
    name: 'White Label',
    discountPct: 35,
    commissionPct: 0,
    minACV: 50000,
    dealProtectionDays: 90,
    nfrSeats: 25,
    annualLicenceFee: 24000,
    features: [
      '35% discount',
      '25 NFR seats',
      'Full rebrand rights',
      '£24K annual platform licence',
      'Dedicated engineering support',
    ],
  },
} as const;

export type PartnerTierKey = keyof typeof PARTNER_TIERS;

export function estimateCommission(tier: PartnerTierKey, dealValueAnnual: number): number {
  const t = PARTNER_TIERS[tier];
  if ('commissionPct' in t && t.commissionPct > 0) {
    return dealValueAnnual * (t.commissionPct / 100);
  }
  if ('discountPct' in t && t.discountPct > 0) {
    return dealValueAnnual * (t.discountPct / 100); // margin = discount
  }
  return 0;
}

export function getDealProtectionExpiry(registeredAt: Date, tier: PartnerTierKey): Date {
  const d = new Date(registeredAt);
  d.setDate(d.getDate() + PARTNER_TIERS[tier].dealProtectionDays);
  return d;
}

export function getDaysRemaining(expiryDate: Date): number {
  return Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}
