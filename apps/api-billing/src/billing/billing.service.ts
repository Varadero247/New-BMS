// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { PRICING, calculateVolumePrice, calculateACV, recommendTier, type PricingTier } from '@ims/config';
import { prisma } from '../prisma';

export class BillingService {
  /**
   * Calculate volume price for Enterprise based on user count and commitment years.
   * Delegates to the canonical helper in @ims/config.
   */
  calculateVolumePrice(userCount: number, commitmentYears: 1 | 2 = 1): number | null {
    return calculateVolumePrice(userCount, commitmentYears);
  }

  /**
   * Generate an ROI report for an organisation showing savings vs. incumbent tools.
   * Returns structured data; does not persist to DB.
   */
  async generateROIReport(organisationId: string): Promise<{
    organisationId: string;
    benchmarks: typeof PRICING.competitorBenchmarks;
    projections: typeof PRICING.revenueProjections;
    incumbentSavingLow: number;
    incumbentSavingHigh: number;
    generatedAt: string;
  }> {
    return {
      organisationId,
      benchmarks: PRICING.competitorBenchmarks,
      projections: PRICING.revenueProjections,
      incumbentSavingLow: PRICING.competitorBenchmarks.nexaraSavingVsIncumbentLow,
      incumbentSavingHigh: PRICING.competitorBenchmarks.nexaraSavingVsIncumbentHigh,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Apply a platform fee record to a subscription for a given tier.
   * Enterprise = £5,000/yr; Enterprise+ = £12,000/yr.
   */
  async applyPlatformFee(
    subscriptionId: string,
    tier: PricingTier
  ): Promise<{ subscriptionId: string; tier: PricingTier; platformFeeAnnual: number }> {
    const t = PRICING.tiers[tier] as any;
    const platformFeeAnnual: number = t.platformFeeAnnual ?? 0;

    if (platformFeeAnnual > 0) {
      await (prisma as any).subscription.update({
        where: { id: subscriptionId },
        data: { platformFeeAnnual },
      });
    }

    return { subscriptionId, tier, platformFeeAnnual };
  }

  /**
   * Apply a vertical add-on to a subscription.
   */
  async applyVerticalAddon(
    subscriptionId: string,
    verticalId: string,
    billingMode: 'PER_USER' | 'FLAT',
    options: { perUserMonthly?: number; annualFlatRate?: number; verticalName?: string } = {}
  ): Promise<Record<string, unknown>> {
    const addOn = await (prisma as any).verticalAddOn.create({
      data: {
        subscriptionId,
        verticalId,
        verticalName: options.verticalName || verticalId,
        billingMode,
        perUserMonthly: options.perUserMonthly || null,
        annualFlatRate: options.annualFlatRate || null,
        isActive: true,
      },
    });
    return addOn;
  }

  /**
   * Lock design partner pricing for an organisation.
   * Sets locked price, lock expiry (12 months), and notice date (month 9).
   */
  async lockDesignPartnerPricing(
    organisationId: string,
    currentRateMonthly: number
  ): Promise<Record<string, unknown>> {
    const lockInMonths = PRICING.designPartner.lockInMonths;
    const noticeAtMonth = PRICING.designPartner.noticeAtMonth;

    const now = new Date();
    const lockedUntil = new Date(now);
    lockedUntil.setMonth(lockedUntil.getMonth() + lockInMonths);

    const notifyAtDate = new Date(now);
    notifyAtDate.setMonth(notifyAtDate.getMonth() + noticeAtMonth);

    const record = await (prisma as any).designPartnerStatus.upsert({
      where: { organisationId },
      update: {
        isDesignPartner: true,
        lockedPriceMonthly: currentRateMonthly,
        lockedUntil,
        notifyAtDate,
      },
      create: {
        organisationId,
        isDesignPartner: true,
        lockedPriceMonthly: currentRateMonthly,
        lockedUntil,
        notifyAtDate,
      },
    });

    return record;
  }
}

export const billingService = new BillingService();
