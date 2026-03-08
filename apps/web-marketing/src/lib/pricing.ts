// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
//
// Inline pricing data for web-marketing app.
// When @ims/config is resolvable from this workspace, replace with:
//   export { PRICING, calculateVolumePrice, calculateACV, recommendTier } from '@ims/config';

export const PRICING = {
  currency: 'GBP',
  symbol: '£',

  tiers: {
    STARTER: {
      id: 'starter',
      name: 'Starter',
      badge: null as string | null,
      listPriceMonthly: 49,
      annualMonthlyRate: 39,
      trialConvertRate: 42,
      annualDiscountPct: 20,
      trialDiscountPct: 15,
      minUsers: 5,
      maxUsers: 25,
      minCommitmentMonths: 6,
      targetACVMin: 2300,
      targetACVMax: 11700,
      previousListPrice: 39,
      slaUptime: '99.5%',
      support: 'Email 9–5',
      trialEnabled: false,
    },
    PROFESSIONAL: {
      id: 'professional',
      name: 'Professional',
      badge: '⭐ Most Popular' as string | null,
      listPriceMonthly: 39,
      annualMonthlyRate: 31,
      trialConvertRate: 33,
      annualDiscountPct: 20,
      trialDiscountPct: 15,
      minUsers: 10,
      maxUsers: 100,
      minCommitmentMonths: 1,
      targetACVMin: 3700,
      targetACVMax: 37200,
      previousListPrice: 29,
      upliftPct: 34,
      slaUptime: '99.9%',
      support: 'Email + Chat',
      trialEnabled: true,
      trialDays: 14,
      trialMaxUsers: 5,
      trialRequiresCard: true,
      trialAutoConverts: true,
      trialNotificationDays: 7,
    },
    ENTERPRISE: {
      id: 'enterprise',
      name: 'Enterprise',
      badge: null as string | null,
      listPriceMonthly: 28,
      annualMonthlyRate: 22,
      trialConvertRate: 24,
      annualDiscountPct: 20,
      trialDiscountPct: 15,
      minUsers: 25,
      maxUsers: null as number | null,
      minCommitmentMonths: 1,
      targetACVMin: 6600,
      targetACVMax: null as number | null,
      previousListPrice: 19,
      upliftPct: 47,
      platformFeeAnnual: 5000,
      slaUptime: '99.95%',
      support: 'Priority + CSM',
      trialEnabled: false,
      verticalAddOnsIncluded: true,
    },
    ENTERPRISE_PLUS: {
      id: 'enterprise_plus',
      name: 'Enterprise+',
      badge: null as string | null,
      listPriceMonthly: null as number | null,
      annualMonthlyRate: null as number | null,
      minUsers: 100,
      maxUsers: null as number | null,
      minCommitmentMonths: 12,
      targetACVMin: 75000,
      targetACVMax: null as number | null,
      platformFeeAnnual: 12000,
      verticalAddOnPerUserPerMonth: 10,
      verticalAddOnAnnualFlatRate: 6000,
      slaUptime: '99.99% dedicated',
      support: 'Dedicated CSM',
      trialEnabled: false,
      whiteLabel: true,
      hrPayrollApi: true,
    },
  },

  volumeDiscounts: {
    bands: [
      { minUsers: 25,  maxUsers: 49,          listMonthly: 28, annualMonthly: 22, twoYearMonthly: 20, illustrativeACVMin: 6600,  illustrativeACVMax: 12936 },
      { minUsers: 50,  maxUsers: 99,          listMonthly: 28, annualMonthly: 22, twoYearMonthly: 19, illustrativeACVMin: 13200, illustrativeACVMax: 26136 },
      { minUsers: 100, maxUsers: 199,         listMonthly: 28, annualMonthly: 20, twoYearMonthly: 18, illustrativeACVMin: 24000, illustrativeACVMax: 47760 },
      { minUsers: 200, maxUsers: 499,         listMonthly: 28, annualMonthly: 18, twoYearMonthly: 16, illustrativeACVMin: 43200, illustrativeACVMax: 107760 },
      { minUsers: 500, maxUsers: null as number | null, listMonthly: null as number | null, annualMonthly: null as number | null, twoYearMonthly: null as number | null, note: 'Custom / Enterprise+' },
    ],
    notes: 'Multi-year discounts reward commitment and improve cash flow predictability. Propose proactively at negotiation.',
  },

  trial: {
    durationDays: 14,
    featureTier: 'PROFESSIONAL',
    maxUsers: 5,
    requiresCard: true,
    autoConverts: true,
    notificationDays: 7,
    conversionDiscountPct: 15,
    expectedConversionRateLow: 0.15,
    expectedConversionRateHigh: 0.25,
  },

  partnerships: {
    tiers: {
      REFERRAL: {
        id: 'referral',
        name: 'Referral Partner',
        badge: null as string | null,
        commissionPct: 15,
        commissionDurationMonths: 12,
        recurringCommissionPct: 0,
        minDealsPerYear: 0,
        maxDealsPerYear: null as number | null,
        partnerDiscount: 0,
        requiresTraining: false,
        requiresContractedTarget: false,
        portalAccess: 'basic',
        marketingSupport: false,
        coSellSupport: false,
        nfrLicences: 0,
        listingOnNexaraWebsite: false,
      },
      RESELLER: {
        id: 'reseller',
        name: 'Reseller Partner',
        badge: null as string | null,
        resellerDiscountPct: 20,
        starterBuyPriceMonthly: 39.20,
        professionalBuyPriceMonthly: 31.20,
        enterpriseBuyPriceMonthly: 22.40,
        commissionPct: 0,
        recurringRevenue: true,
        minDealsPerYear: 2,
        requiresTraining: true,
        requiresContractedTarget: true,
        portalAccess: 'full',
        marketingSupport: true,
        coSellSupport: true,
        nfrLicences: 5,
        listingOnNexaraWebsite: true,
        platformFeePassThrough: true,
      },
      STRATEGIC: {
        id: 'strategic',
        name: 'Strategic Partner',
        badge: '⭐ Strategic' as string | null,
        resellerDiscountPct: 30,
        starterBuyPriceMonthly: 34.30,
        professionalBuyPriceMonthly: 27.30,
        enterpriseBuyPriceMonthly: 19.60,
        commissionPct: 0,
        recurringRevenue: true,
        minDealsPerYear: 10,
        minACVCommitmentPerYear: 150000,
        requiresTraining: true,
        requiresCertification: true,
        requiresContractedTarget: true,
        portalAccess: 'full',
        marketingSupport: true,
        coMarketingFundGBP: 5000,
        coSellSupport: true,
        dedicatedChannelManager: true,
        nfrLicences: 15,
        listingOnNexaraWebsite: true,
        featuredListing: true,
        platformFeePassThrough: true,
        whiteLabel: false,
      },
      WHITE_LABEL: {
        id: 'white_label',
        name: 'White Label Partner',
        badge: null as string | null,
        baseAnnualLicenceFee: 24000,
        resellerDiscountPct: 35,
        minEndCustomers: 3,
        requiresCertification: true,
        requiresContractedTarget: true,
        portalAccess: 'full',
        dedicatedChannelManager: true,
        coMarketingFundGBP: 10000,
        nfrLicences: 20,
        technicalIntegrationSupport: true,
        brandingCustomisation: true,
      },
    },

    dealRegistration: {
      protectionPeriodDays: 90,
      extensionDays: 30,
      minimumDealACVForRegistration: 5000,
    },

    commissionExamples: {
      referral_40userProfessional: {
        dealACV: 14880,
        commissionPct: 15,
        commissionAmount: 2232,
      },
      referral_100userEnterprise: {
        dealACV: 26400,
        commissionPct: 15,
        commissionAmount: 3960,
      },
      reseller_40userProfessional: {
        endCustomerPays: 14880,
        resellerBuyPrice: 11904,
        resellerMargin: 2976,
        resellerMarginPct: 20,
      },
      reseller_100userEnterprise: {
        endCustomerPays: 26400,
        resellerBuyPrice: 21120,
        resellerMargin: 5280,
        resellerMarginPct: 20,
      },
      strategic_100userEnterprise: {
        endCustomerPays: 26400,
        resellerBuyPrice: 18480,
        resellerMargin: 7920,
        resellerMarginPct: 30,
      },
    },

    apacPartnerNotes: {
      sgMasterReseller: true,
      auMasterReseller: true,
      nzMasterReseller: true,
      aseanChannelTargetACV: 500000,
      gstHandling: 'partner_responsible',
    },
  },

  competitorBenchmarks: {
    donesafePPUM: 10,
    intelexPPUM: 120,
    etqPPUM: 130,
    b2bSaasVerticalMedianUSD: 89,
    incumbentStackAnnualLow: 80000,
    incumbentStackAnnualHigh: 300000,
    nexaraSavingVsIncumbentLow: 100000,
    nexaraSavingVsIncumbentHigh: 400000,
  },
} as const;

export type PricingTier = keyof typeof PRICING.tiers;
export type PartnerTierKey = keyof typeof PRICING.partnerships.tiers;
export type VolumeBand = (typeof PRICING.volumeDiscounts.bands)[number];

export function calculateVolumePrice(userCount: number, commitmentYears: 1 | 2 = 1): number | null {
  const bands = PRICING.volumeDiscounts.bands;
  for (const band of bands) {
    if (band.maxUsers === null || userCount <= band.maxUsers) {
      if (userCount >= band.minUsers) {
        if (commitmentYears === 2) return (band as any).twoYearMonthly ?? null;
        return (band as any).annualMonthly ?? null;
      }
    }
  }
  return null;
}

export function calculateACV(
  tier: PricingTier,
  userCount: number,
  billing: 'monthly' | 'annual' | 'trial_convert' = 'annual'
): number {
  const t = PRICING.tiers[tier] as any;
  let ppum: number | null = null;

  if (tier === 'ENTERPRISE' || tier === 'ENTERPRISE_PLUS') {
    ppum = calculateVolumePrice(userCount);
    if (ppum === null && tier === 'ENTERPRISE_PLUS') return 0;
  } else {
    if (billing === 'monthly') ppum = t.listPriceMonthly ?? null;
    else if (billing === 'annual') ppum = t.annualMonthlyRate ?? null;
    else if (billing === 'trial_convert') ppum = t.trialConvertRate ?? null;
  }

  if (ppum === null) return 0;
  const perUserAnnual = ppum * 12;
  const platformFee = t.platformFeeAnnual ?? 0;
  return perUserAnnual * userCount + platformFee;
}

export function recommendTier(userCount: number): PricingTier {
  if (userCount >= 100) return 'ENTERPRISE_PLUS';
  if (userCount >= 25) return 'ENTERPRISE';
  if (userCount >= 10) return 'PROFESSIONAL';
  return 'STARTER';
}
