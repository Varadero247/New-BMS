// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import {
  PRICING,
  calculateVolumePrice,
  calculateACV,
  type PricingTier,
  type PartnerTierKey,
} from '@ims/config';
import { prisma } from '../prisma';

export class PartnerPricingService {
  /**
   * Calculate the reseller buy price for a given IMS tier and partner tier.
   * Applies the partner's discount from PRICING.partnerships.tiers.
   */
  calculateResellerBuyPrice(
    tier: PricingTier,
    listPriceMonthly: number,
    partnerTierKey: PartnerTierKey
  ): number {
    const partnerTier = PRICING.partnerships.tiers[partnerTierKey] as any;
    const discountPct: number = partnerTier.resellerDiscountPct ?? 0;
    return parseFloat((listPriceMonthly * (1 - discountPct / 100)).toFixed(2));
  }

  /**
   * Calculate referral commission for a deal.
   * Only REFERRAL tier earns commission; others earn margin via reseller pricing.
   */
  calculateReferralCommission(
    dealACV: number,
    partnerTierKey: PartnerTierKey
  ): { commissionPct: number; commissionAmount: number } {
    const partnerTier = PRICING.partnerships.tiers[partnerTierKey] as any;
    const commissionPct: number = partnerTier.commissionPct ?? 0;
    const commissionAmount = parseFloat((dealACV * commissionPct / 100).toFixed(2));
    return { commissionPct, commissionAmount };
  }

  /**
   * Validate that a deal registration is not a duplicate for the same prospect.
   * Returns true if valid (no active protected deal for the same prospect email).
   */
  async validateDealRegistration(
    partnerId: string,
    prospectEmail: string
  ): Promise<{ valid: boolean; conflictingDealId?: string; message?: string }> {
    const existing = await (prisma as any).dealRegistration.findFirst({
      where: {
        prospectEmail,
        status: { in: ['REGISTERED', 'IN_PROGRESS'] },
        protectedUntil: { gt: new Date() },
      },
    });

    if (existing && existing.partnerId !== partnerId) {
      return {
        valid: false,
        conflictingDealId: existing.id,
        message: 'This prospect is already registered by another partner',
      };
    }

    return { valid: true };
  }

  /**
   * Generate a partner quote showing end-customer price, buy price, and margin.
   */
  generatePartnerQuote(
    partnerTierKey: PartnerTierKey,
    userCount: number,
    tier: PricingTier,
    commitmentYears: 1 | 2 = 1
  ): {
    partnerTier: PartnerTierKey;
    tier: PricingTier;
    userCount: number;
    commitmentYears: number;
    endCustomerACVGBP: number;
    buyPriceACVGBP: number;
    marginGBP: number;
    marginPct: number;
    perUserMonthlyListPrice: number | null;
    perUserMonthlyBuyPrice: number | null;
    referralCommissionGBP: number;
    currency: string;
  } {
    // Determine list PPUM
    let listPPUM: number | null = null;
    if (tier === 'ENTERPRISE' || tier === 'ENTERPRISE_PLUS') {
      listPPUM = calculateVolumePrice(userCount, commitmentYears);
    } else {
      listPPUM = (PRICING.tiers[tier] as any).listPriceMonthly ?? null;
    }

    const endCustomerACVGBP = calculateACV(tier, userCount, commitmentYears === 2 ? 'annual' : 'annual');

    const partnerTier = PRICING.partnerships.tiers[partnerTierKey] as any;
    const discountPct: number = partnerTier.resellerDiscountPct ?? 0;
    const buyPriceACVGBP = parseFloat((endCustomerACVGBP * (1 - discountPct / 100)).toFixed(2));
    const marginGBP = parseFloat((endCustomerACVGBP - buyPriceACVGBP).toFixed(2));
    const marginPct = parseFloat(((marginGBP / endCustomerACVGBP) * 100).toFixed(2));

    const buyPPUM = listPPUM !== null
      ? parseFloat((listPPUM * (1 - discountPct / 100)).toFixed(2))
      : null;

    const { commissionAmount } = this.calculateReferralCommission(endCustomerACVGBP, 'REFERRAL');

    return {
      partnerTier: partnerTierKey,
      tier,
      userCount,
      commitmentYears,
      endCustomerACVGBP,
      buyPriceACVGBP,
      marginGBP,
      marginPct,
      perUserMonthlyListPrice: listPPUM,
      perUserMonthlyBuyPrice: buyPPUM,
      referralCommissionGBP: commissionAmount,
      currency: PRICING.currency,
    };
  }
}

export const partnerPricingService = new PartnerPricingService();
