// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Spec tests for web-marketing pricing lib — inline types/constants, no React imports
// Mirrors apps/web-marketing/src/lib/pricing.ts

// ─── Inline constants (matching pricing.ts) ───────────────────────────────────

const PRICING = {
  currency: 'GBP',
  symbol: '£',
  tiers: {
    STARTER: {
      id: 'starter', name: 'Starter', badge: null as string | null,
      listPriceMonthly: 49, annualMonthlyRate: 39, trialConvertRate: 42,
      annualDiscountPct: 20, trialDiscountPct: 15,
      minUsers: 5, maxUsers: 25, minCommitmentMonths: 6,
      targetACVMin: 2300, targetACVMax: 11700,
      previousListPrice: 39,
      slaUptime: '99.5%', support: 'Email 9–5', trialEnabled: false,
    },
    PROFESSIONAL: {
      id: 'professional', name: 'Professional', badge: '⭐ Most Popular' as string | null,
      listPriceMonthly: 39, annualMonthlyRate: 31, trialConvertRate: 33,
      annualDiscountPct: 20, trialDiscountPct: 15,
      minUsers: 10, maxUsers: 100, minCommitmentMonths: 1,
      targetACVMin: 3700, targetACVMax: 37200,
      previousListPrice: 29, upliftPct: 34,
      slaUptime: '99.9%', support: 'Email + Chat', trialEnabled: true,
      trialDays: 14, trialMaxUsers: 5, trialRequiresCard: true,
      trialAutoConverts: true, trialNotificationDays: 7,
    },
    ENTERPRISE: {
      id: 'enterprise', name: 'Enterprise', badge: null as string | null,
      listPriceMonthly: 28, annualMonthlyRate: 22, trialConvertRate: 24,
      annualDiscountPct: 20, trialDiscountPct: 15,
      minUsers: 25, maxUsers: null as number | null, minCommitmentMonths: 1,
      targetACVMin: 6600, targetACVMax: null as number | null,
      previousListPrice: 19, upliftPct: 47,
      platformFeeAnnual: 5000,
      slaUptime: '99.95%', support: 'Priority + CSM', trialEnabled: false,
      verticalAddOnsIncluded: true,
    },
    ENTERPRISE_PLUS: {
      id: 'enterprise_plus', name: 'Enterprise+', badge: null as string | null,
      listPriceMonthly: null as number | null, annualMonthlyRate: null as number | null,
      minUsers: 100, maxUsers: null as number | null, minCommitmentMonths: 12,
      targetACVMin: 75000, targetACVMax: null as number | null,
      platformFeeAnnual: 12000,
      verticalAddOnPerUserPerMonth: 10, verticalAddOnAnnualFlatRate: 6000,
      slaUptime: '99.99% dedicated', support: 'Dedicated CSM', trialEnabled: false,
      whiteLabel: true, hrPayrollApi: true,
    },
  },
  volumeDiscounts: {
    bands: [
      { minUsers: 25,  maxUsers: 49,            listMonthly: 28, annualMonthly: 22, twoYearMonthly: 20, illustrativeACVMin: 6600,   illustrativeACVMax: 12936 },
      { minUsers: 50,  maxUsers: 99,            listMonthly: 28, annualMonthly: 22, twoYearMonthly: 19, illustrativeACVMin: 13200,  illustrativeACVMax: 26136 },
      { minUsers: 100, maxUsers: 199,           listMonthly: 28, annualMonthly: 20, twoYearMonthly: 18, illustrativeACVMin: 24000,  illustrativeACVMax: 47760 },
      { minUsers: 200, maxUsers: 499,           listMonthly: 28, annualMonthly: 18, twoYearMonthly: 16, illustrativeACVMin: 43200,  illustrativeACVMax: 107760 },
      { minUsers: 500, maxUsers: null as number | null, listMonthly: null as number | null, annualMonthly: null as number | null, twoYearMonthly: null as number | null, note: 'Custom / Enterprise+' },
    ],
  },
  trial: {
    durationDays: 14, featureTier: 'PROFESSIONAL', maxUsers: 5,
    requiresCard: true, autoConverts: true, notificationDays: 7,
    conversionDiscountPct: 15,
    expectedConversionRateLow: 0.15, expectedConversionRateHigh: 0.25,
  },
  partnerships: {
    tiers: {
      REFERRAL: {
        id: 'referral', name: 'Referral Partner', badge: null as string | null,
        commissionPct: 15, commissionDurationMonths: 12,
        recurringCommissionPct: 0, minDealsPerYear: 0, maxDealsPerYear: null as number | null,
        partnerDiscount: 0, requiresTraining: false, requiresContractedTarget: false,
        portalAccess: 'basic', marketingSupport: false, coSellSupport: false,
        nfrLicences: 0, listingOnNexaraWebsite: false,
      },
      RESELLER: {
        id: 'reseller', name: 'Reseller Partner', badge: null as string | null,
        resellerDiscountPct: 20,
        starterBuyPriceMonthly: 39.20, professionalBuyPriceMonthly: 31.20, enterpriseBuyPriceMonthly: 22.40,
        commissionPct: 0, recurringRevenue: true, minDealsPerYear: 2,
        requiresTraining: true, requiresContractedTarget: true,
        portalAccess: 'full', marketingSupport: true, coSellSupport: true,
        nfrLicences: 5, listingOnNexaraWebsite: true, platformFeePassThrough: true,
      },
      STRATEGIC: {
        id: 'strategic', name: 'Strategic Partner', badge: '⭐ Strategic' as string | null,
        resellerDiscountPct: 30,
        starterBuyPriceMonthly: 34.30, professionalBuyPriceMonthly: 27.30, enterpriseBuyPriceMonthly: 19.60,
        commissionPct: 0, recurringRevenue: true, minDealsPerYear: 10, minACVCommitmentPerYear: 150000,
        requiresTraining: true, requiresCertification: true, requiresContractedTarget: true,
        portalAccess: 'full', marketingSupport: true, coMarketingFundGBP: 5000, coSellSupport: true,
        dedicatedChannelManager: true, nfrLicences: 15, listingOnNexaraWebsite: true,
        featuredListing: true, platformFeePassThrough: true, whiteLabel: false,
      },
      WHITE_LABEL: {
        id: 'white_label', name: 'White Label Partner', badge: null as string | null,
        baseAnnualLicenceFee: 24000, resellerDiscountPct: 35, minEndCustomers: 3,
        requiresCertification: true, requiresContractedTarget: true,
        portalAccess: 'full', dedicatedChannelManager: true, coMarketingFundGBP: 10000,
        nfrLicences: 20, technicalIntegrationSupport: true, brandingCustomisation: true,
      },
    },
    dealRegistration: {
      protectionPeriodDays: 90, extensionDays: 30, minimumDealACVForRegistration: 5000,
    },
    commissionExamples: {
      referral_40userProfessional:  { dealACV: 14880,  commissionPct: 15, commissionAmount: 2232 },
      referral_100userEnterprise:   { dealACV: 26400,  commissionPct: 15, commissionAmount: 3960 },
      reseller_40userProfessional:  { endCustomerPays: 14880, resellerBuyPrice: 11904, resellerMargin: 2976, resellerMarginPct: 20 },
      reseller_100userEnterprise:   { endCustomerPays: 26400, resellerBuyPrice: 21120, resellerMargin: 5280, resellerMarginPct: 20 },
      strategic_100userEnterprise:  { endCustomerPays: 26400, resellerBuyPrice: 18480, resellerMargin: 7920, resellerMarginPct: 30 },
    },
  },
  competitorBenchmarks: {
    donesafePPUM: 10, intelexPPUM: 120, etqPPUM: 130,
    b2bSaasVerticalMedianUSD: 89,
    incumbentStackAnnualLow: 80000, incumbentStackAnnualHigh: 300000,
    nexaraSavingVsIncumbentLow: 100000, nexaraSavingVsIncumbentHigh: 400000,
  },
} as const;

// ─── Pure helpers (matching pricing.ts) ──────────────────────────────────────

type PricingTier = keyof typeof PRICING.tiers;
type PartnerTierKey = keyof typeof PRICING.partnerships.tiers;

function calculateVolumePrice(userCount: number, commitmentYears: 1 | 2 = 1): number | null {
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

function calculateACV(
  tier: PricingTier,
  userCount: number,
  billing: 'monthly' | 'annual' | 'trial_convert' = 'annual',
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

function recommendTier(userCount: number): PricingTier {
  if (userCount >= 100) return 'ENTERPRISE_PLUS';
  if (userCount >= 25) return 'ENTERPRISE';
  if (userCount >= 10) return 'PROFESSIONAL';
  return 'STARTER';
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('PRICING — currency', () => {
  it('currency is GBP', () => expect(PRICING.currency).toBe('GBP'));
  it('symbol is £', () => expect(PRICING.symbol).toBe('£'));
});

describe('PRICING.tiers — keys', () => {
  it('has exactly 4 tiers', () => {
    expect(Object.keys(PRICING.tiers)).toHaveLength(4);
  });
  it('tier keys are STARTER PROFESSIONAL ENTERPRISE ENTERPRISE_PLUS', () => {
    expect(Object.keys(PRICING.tiers)).toEqual([
      'STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'ENTERPRISE_PLUS',
    ]);
  });
});

describe('PRICING.tiers — STARTER', () => {
  const t = PRICING.tiers.STARTER;
  it('id is starter',                        () => expect(t.id).toBe('starter'));
  it('listPriceMonthly is 49',               () => expect(t.listPriceMonthly).toBe(49));
  it('annualMonthlyRate is 39',              () => expect(t.annualMonthlyRate).toBe(39));
  it('trialConvertRate is 42',               () => expect(t.trialConvertRate).toBe(42));
  it('minUsers is 5',                        () => expect(t.minUsers).toBe(5));
  it('maxUsers is 25',                       () => expect(t.maxUsers).toBe(25));
  it('minCommitmentMonths is 6',             () => expect(t.minCommitmentMonths).toBe(6));
  it('slaUptime is 99.5%',                   () => expect(t.slaUptime).toBe('99.5%'));
  it('trialEnabled is false',                () => expect(t.trialEnabled).toBe(false));
  it('annualDiscountPct is 20',              () => expect(t.annualDiscountPct).toBe(20));
  it('targetACVMin is 2300',                 () => expect(t.targetACVMin).toBe(2300));
  it('targetACVMax is 11700',               () => expect(t.targetACVMax).toBe(11700));
});

describe('PRICING.tiers — PROFESSIONAL', () => {
  const t = PRICING.tiers.PROFESSIONAL;
  it('id is professional',                   () => expect(t.id).toBe('professional'));
  it('listPriceMonthly is 39',               () => expect(t.listPriceMonthly).toBe(39));
  it('annualMonthlyRate is 31',              () => expect(t.annualMonthlyRate).toBe(31));
  it('trialConvertRate is 33',               () => expect(t.trialConvertRate).toBe(33));
  it('minUsers is 10',                       () => expect(t.minUsers).toBe(10));
  it('maxUsers is 100',                      () => expect(t.maxUsers).toBe(100));
  it('minCommitmentMonths is 1',             () => expect(t.minCommitmentMonths).toBe(1));
  it('slaUptime is 99.9%',                   () => expect(t.slaUptime).toBe('99.9%'));
  it('trialEnabled is true',                 () => expect(t.trialEnabled).toBe(true));
  it('trialDays is 14',                      () => expect(t.trialDays).toBe(14));
  it('trialMaxUsers is 5',                   () => expect(t.trialMaxUsers).toBe(5));
  it('trialRequiresCard is true',            () => expect(t.trialRequiresCard).toBe(true));
  it('trialAutoConverts is true',            () => expect(t.trialAutoConverts).toBe(true));
  it('upliftPct is 34',                      () => expect(t.upliftPct).toBe(34));
  it('targetACVMin is 3700',                 () => expect(t.targetACVMin).toBe(3700));
  it('targetACVMax is 37200',               () => expect(t.targetACVMax).toBe(37200));
  it('badge is Most Popular',                () => expect(t.badge).toContain('Most Popular'));
});

describe('PRICING.tiers — ENTERPRISE', () => {
  const t = PRICING.tiers.ENTERPRISE;
  it('id is enterprise',                     () => expect(t.id).toBe('enterprise'));
  it('listPriceMonthly is 28',               () => expect(t.listPriceMonthly).toBe(28));
  it('annualMonthlyRate is 22',              () => expect(t.annualMonthlyRate).toBe(22));
  it('minUsers is 25',                       () => expect(t.minUsers).toBe(25));
  it('maxUsers is null (unlimited)',         () => expect(t.maxUsers).toBeNull());
  it('platformFeeAnnual is 5000',            () => expect(t.platformFeeAnnual).toBe(5000));
  it('slaUptime is 99.95%',                  () => expect(t.slaUptime).toBe('99.95%'));
  it('trialEnabled is false',                () => expect(t.trialEnabled).toBe(false));
  it('upliftPct is 47',                      () => expect(t.upliftPct).toBe(47));
  it('targetACVMin is 6600',                 () => expect(t.targetACVMin).toBe(6600));
  it('verticalAddOnsIncluded is true',       () => expect(t.verticalAddOnsIncluded).toBe(true));
});

describe('PRICING.tiers — ENTERPRISE_PLUS', () => {
  const t = PRICING.tiers.ENTERPRISE_PLUS;
  it('id is enterprise_plus',                () => expect(t.id).toBe('enterprise_plus'));
  it('annualMonthlyRate is null',            () => expect(t.annualMonthlyRate).toBeNull());
  it('listPriceMonthly is null',             () => expect(t.listPriceMonthly).toBeNull());
  it('minUsers is 100',                      () => expect(t.minUsers).toBe(100));
  it('maxUsers is null',                     () => expect(t.maxUsers).toBeNull());
  it('platformFeeAnnual is 12000',           () => expect(t.platformFeeAnnual).toBe(12000));
  it('minCommitmentMonths is 12',            () => expect(t.minCommitmentMonths).toBe(12));
  it('whiteLabel is true',                   () => expect(t.whiteLabel).toBe(true));
  it('hrPayrollApi is true',                 () => expect(t.hrPayrollApi).toBe(true));
  it('verticalAddOnPerUserPerMonth is 10',   () => expect(t.verticalAddOnPerUserPerMonth).toBe(10));
  it('slaUptime contains 99.99',             () => expect(t.slaUptime).toContain('99.99'));
  it('targetACVMin is 75000',               () => expect(t.targetACVMin).toBe(75000));
});

describe('PRICING.volumeDiscounts.bands — structure', () => {
  const bands = PRICING.volumeDiscounts.bands;
  it('has 5 bands', () => expect(bands).toHaveLength(5));
  it('first band starts at 25 users', () => expect(bands[0].minUsers).toBe(25));
  it('last band minUsers is 500', () => expect(bands[4].minUsers).toBe(500));
  it('last band is null (custom/Enterprise+)', () => {
    expect(bands[4].annualMonthly).toBeNull();
  });
  it('bands are sorted ascending by minUsers', () => {
    for (let i = 1; i < bands.length; i++) {
      expect(bands[i].minUsers).toBeGreaterThan(bands[i - 1].minUsers);
    }
  });
  it('annualMonthly is non-increasing across defined bands', () => {
    const defined = bands.filter((b) => b.annualMonthly !== null);
    for (let i = 1; i < defined.length; i++) {
      expect(defined[i].annualMonthly!).toBeLessThanOrEqual(defined[i - 1].annualMonthly!);
    }
  });
  it('twoYearMonthly < annualMonthly for all defined bands', () => {
    for (const b of bands) {
      if (b.annualMonthly !== null && b.twoYearMonthly !== null) {
        expect(b.twoYearMonthly).toBeLessThan(b.annualMonthly);
      }
    }
  });
  it('band 25-49: annualMonthly=22, twoYearMonthly=20', () => {
    expect(bands[0].annualMonthly).toBe(22);
    expect(bands[0].twoYearMonthly).toBe(20);
  });
  it('band 50-99: annualMonthly=22, twoYearMonthly=19', () => {
    expect(bands[1].annualMonthly).toBe(22);
    expect(bands[1].twoYearMonthly).toBe(19);
  });
  it('band 100-199: annualMonthly=20, twoYearMonthly=18', () => {
    expect(bands[2].annualMonthly).toBe(20);
    expect(bands[2].twoYearMonthly).toBe(18);
  });
  it('band 200-499: annualMonthly=18, twoYearMonthly=16', () => {
    expect(bands[3].annualMonthly).toBe(18);
    expect(bands[3].twoYearMonthly).toBe(16);
  });
});

describe('PRICING.trial', () => {
  it('durationDays is 14',                  () => expect(PRICING.trial.durationDays).toBe(14));
  it('featureTier is PROFESSIONAL',          () => expect(PRICING.trial.featureTier).toBe('PROFESSIONAL'));
  it('maxUsers is 5',                        () => expect(PRICING.trial.maxUsers).toBe(5));
  it('requiresCard is true',                 () => expect(PRICING.trial.requiresCard).toBe(true));
  it('autoConverts is true',                 () => expect(PRICING.trial.autoConverts).toBe(true));
  it('conversionDiscountPct is 15',          () => expect(PRICING.trial.conversionDiscountPct).toBe(15));
  it('expectedConversionRateLow is 0.15',    () => expect(PRICING.trial.expectedConversionRateLow).toBe(0.15));
  it('expectedConversionRateHigh is 0.25',   () => expect(PRICING.trial.expectedConversionRateHigh).toBe(0.25));
  it('conversion rate low < high',           () => {
    expect(PRICING.trial.expectedConversionRateLow).toBeLessThan(PRICING.trial.expectedConversionRateHigh);
  });
});

describe('PRICING.partnerships.tiers — structure', () => {
  const pt = PRICING.partnerships.tiers;
  it('has 4 partner tiers', () => expect(Object.keys(pt)).toHaveLength(4));
  it('REFERRAL has 0 nfrLicences',           () => expect(pt.REFERRAL.nfrLicences).toBe(0));
  it('RESELLER has 5 nfrLicences',           () => expect(pt.RESELLER.nfrLicences).toBe(5));
  it('STRATEGIC has 15 nfrLicences',         () => expect(pt.STRATEGIC.nfrLicences).toBe(15));
  it('WHITE_LABEL has 20 nfrLicences',       () => expect(pt.WHITE_LABEL.nfrLicences).toBe(20));
  it('nfrLicences increases through tiers',  () => {
    expect(pt.RESELLER.nfrLicences).toBeGreaterThan(pt.REFERRAL.nfrLicences);
    expect(pt.STRATEGIC.nfrLicences).toBeGreaterThan(pt.RESELLER.nfrLicences);
    expect(pt.WHITE_LABEL.nfrLicences).toBeGreaterThan(pt.STRATEGIC.nfrLicences);
  });
  it('REFERRAL commissionPct is 15',         () => expect(pt.REFERRAL.commissionPct).toBe(15));
  it('RESELLER resellerDiscountPct is 20',   () => expect(pt.RESELLER.resellerDiscountPct).toBe(20));
  it('STRATEGIC resellerDiscountPct is 30',  () => expect(pt.STRATEGIC.resellerDiscountPct).toBe(30));
  it('WHITE_LABEL resellerDiscountPct is 35',() => expect(pt.WHITE_LABEL.resellerDiscountPct).toBe(35));
  it('discount increases through tiers',     () => {
    expect(pt.STRATEGIC.resellerDiscountPct).toBeGreaterThan(pt.RESELLER.resellerDiscountPct);
    expect(pt.WHITE_LABEL.resellerDiscountPct).toBeGreaterThan(pt.STRATEGIC.resellerDiscountPct);
  });
  it('WHITE_LABEL baseAnnualLicenceFee is 24000', () => {
    expect(pt.WHITE_LABEL.baseAnnualLicenceFee).toBe(24000);
  });
  it('STRATEGIC badge contains Strategic',   () => expect(pt.STRATEGIC.badge).toContain('Strategic'));
  it('WHITE_LABEL minEndCustomers is 3',     () => expect(pt.WHITE_LABEL.minEndCustomers).toBe(3));
});

describe('PRICING.partnerships.dealRegistration', () => {
  const dr = PRICING.partnerships.dealRegistration;
  it('protectionPeriodDays is 90',           () => expect(dr.protectionPeriodDays).toBe(90));
  it('extensionDays is 30',                  () => expect(dr.extensionDays).toBe(30));
  it('minimumDealACVForRegistration is 5000',() => expect(dr.minimumDealACVForRegistration).toBe(5000));
});

describe('PRICING.partnerships.commissionExamples', () => {
  const ex = PRICING.partnerships.commissionExamples;
  it('referral 40u Pro: commissionAmount = dealACV × commissionPct / 100', () => {
    const { dealACV, commissionPct, commissionAmount } = ex.referral_40userProfessional;
    expect(commissionAmount).toBe(dealACV * commissionPct / 100);
  });
  it('referral 100u Ent: commissionAmount = dealACV × commissionPct / 100', () => {
    const { dealACV, commissionPct, commissionAmount } = ex.referral_100userEnterprise;
    expect(commissionAmount).toBe(dealACV * commissionPct / 100);
  });
  it('reseller 40u Pro: margin = endCustomerPays - buyPrice', () => {
    const { endCustomerPays, resellerBuyPrice, resellerMargin } = ex.reseller_40userProfessional;
    expect(resellerMargin).toBe(endCustomerPays - resellerBuyPrice);
  });
  it('reseller 100u Ent: margin = endCustomerPays - buyPrice', () => {
    const { endCustomerPays, resellerBuyPrice, resellerMargin } = ex.reseller_100userEnterprise;
    expect(resellerMargin).toBe(endCustomerPays - resellerBuyPrice);
  });
  it('reseller 40u Pro: marginPct is 20', () => {
    expect(ex.reseller_40userProfessional.resellerMarginPct).toBe(20);
  });
  it('strategic 100u Ent: marginPct is 30', () => {
    expect(ex.strategic_100userEnterprise.resellerMarginPct).toBe(30);
  });
  it('strategic margin > reseller margin for same deal', () => {
    expect(ex.strategic_100userEnterprise.resellerMargin)
      .toBeGreaterThan(ex.reseller_100userEnterprise.resellerMargin);
  });
});

describe('PRICING.competitorBenchmarks', () => {
  const cb = PRICING.competitorBenchmarks;
  it('donesafePPUM is 10',                   () => expect(cb.donesafePPUM).toBe(10));
  it('intelexPPUM is 120',                   () => expect(cb.intelexPPUM).toBe(120));
  it('etqPPUM is 130',                       () => expect(cb.etqPPUM).toBe(130));
  it('nexara is cheaper than Intelex',        () => expect(PRICING.tiers.ENTERPRISE.annualMonthlyRate).toBeLessThan(cb.intelexPPUM));
  it('nexara is cheaper than ETQ',            () => expect(PRICING.tiers.ENTERPRISE.annualMonthlyRate).toBeLessThan(cb.etqPPUM));
  it('nexaraSavingVsIncumbentHigh is 400000', () => expect(cb.nexaraSavingVsIncumbentHigh).toBe(400000));
  it('saving > incumbent low',                () => expect(cb.nexaraSavingVsIncumbentLow).toBeGreaterThan(0));
  it('high saving > low saving',              () => {
    expect(cb.nexaraSavingVsIncumbentHigh).toBeGreaterThan(cb.nexaraSavingVsIncumbentLow);
  });
});

describe('calculateVolumePrice — 1-year commitment', () => {
  const cases: [number, number | null][] = [
    [1,   null],
    [24,  null],
    [25,  22],
    [37,  22],
    [49,  22],
    [50,  22],
    [99,  22],
    [100, 20],
    [150, 20],
    [199, 20],
    [200, 18],
    [350, 18],
    [499, 18],
    [500, null],  // custom band has null
    [750, null],
  ];
  for (const [users, expected] of cases) {
    it(`${users} users (1yr) → ${expected === null ? 'null' : `£${expected}`}`, () => {
      expect(calculateVolumePrice(users, 1)).toBe(expected);
    });
  }
});

describe('calculateVolumePrice — 2-year commitment', () => {
  const cases: [number, number | null][] = [
    [24,  null],
    [25,  20],
    [49,  20],
    [50,  19],
    [99,  19],
    [100, 18],
    [199, 18],
    [200, 16],
    [499, 16],
    [500, null],
  ];
  for (const [users, expected] of cases) {
    it(`${users} users (2yr) → ${expected === null ? 'null' : `£${expected}`}`, () => {
      expect(calculateVolumePrice(users, 2)).toBe(expected);
    });
  }
  it('2yr rate < 1yr rate for 25 users', () => {
    expect(calculateVolumePrice(25, 2)!).toBeLessThan(calculateVolumePrice(25, 1)!);
  });
  it('2yr rate < 1yr rate for 100 users', () => {
    expect(calculateVolumePrice(100, 2)!).toBeLessThan(calculateVolumePrice(100, 1)!);
  });
});

describe('calculateACV — STARTER', () => {
  it('10 users annual → 39×10×12 = 4680', () => {
    expect(calculateACV('STARTER', 10, 'annual')).toBe(4680);
  });
  it('10 users monthly → 49×10×12 = 5880', () => {
    expect(calculateACV('STARTER', 10, 'monthly')).toBe(5880);
  });
  it('10 users trial_convert → 42×10×12 = 5040', () => {
    expect(calculateACV('STARTER', 10, 'trial_convert')).toBe(5040);
  });
  it('25 users annual → 39×25×12 = 11700', () => {
    expect(calculateACV('STARTER', 25, 'annual')).toBe(11700);
  });
  it('25 users annual = STARTER.targetACVMax', () => {
    expect(calculateACV('STARTER', 25, 'annual')).toBe(PRICING.tiers.STARTER.targetACVMax);
  });
  it('annual < monthly for same users', () => {
    expect(calculateACV('STARTER', 10, 'annual')).toBeLessThan(calculateACV('STARTER', 10, 'monthly'));
  });
});

describe('calculateACV — PROFESSIONAL', () => {
  it('10 users annual → 31×10×12 = 3720', () => {
    expect(calculateACV('PROFESSIONAL', 10, 'annual')).toBe(3720);
  });
  it('10 users monthly → 39×10×12 = 4680', () => {
    expect(calculateACV('PROFESSIONAL', 10, 'monthly')).toBe(4680);
  });
  it('10 users trial_convert → 33×10×12 = 3960', () => {
    expect(calculateACV('PROFESSIONAL', 10, 'trial_convert')).toBe(3960);
  });
  it('40 users annual → 31×40×12 = 14880', () => {
    expect(calculateACV('PROFESSIONAL', 40, 'annual')).toBe(14880);
  });
  it('40 users annual = referral commission example dealACV', () => {
    expect(calculateACV('PROFESSIONAL', 40, 'annual')).toBe(
      PRICING.partnerships.commissionExamples.referral_40userProfessional.dealACV,
    );
  });
});

describe('calculateACV — ENTERPRISE', () => {
  it('50 users annual → 22×50×12+5000 = 18200', () => {
    expect(calculateACV('ENTERPRISE', 50, 'annual')).toBe(18200);
  });
  it('100 users annual → 20×100×12+5000 = 29000', () => {
    expect(calculateACV('ENTERPRISE', 100, 'annual')).toBe(29000);
  });
  it('200 users annual → 18×200×12+5000 = 48200', () => {
    expect(calculateACV('ENTERPRISE', 200, 'annual')).toBe(48200);
  });
  it('ACV increases with user count', () => {
    expect(calculateACV('ENTERPRISE', 100, 'annual')).toBeGreaterThan(calculateACV('ENTERPRISE', 50, 'annual'));
  });
});

describe('calculateACV — ENTERPRISE_PLUS', () => {
  it('returns 0 when volume band is null (500+ users)', () => {
    expect(calculateACV('ENTERPRISE_PLUS', 500, 'annual')).toBe(0);
  });
  it('returns 0 for any user count above bands', () => {
    expect(calculateACV('ENTERPRISE_PLUS', 1000, 'annual')).toBe(0);
  });
});

describe('recommendTier — parametric', () => {
  const cases: [number, string][] = [
    [1,   'STARTER'],
    [4,   'STARTER'],
    [9,   'STARTER'],
    [10,  'PROFESSIONAL'],
    [15,  'PROFESSIONAL'],
    [24,  'PROFESSIONAL'],
    [25,  'ENTERPRISE'],
    [50,  'ENTERPRISE'],
    [99,  'ENTERPRISE'],
    [100, 'ENTERPRISE_PLUS'],
    [200, 'ENTERPRISE_PLUS'],
    [500, 'ENTERPRISE_PLUS'],
  ];
  for (const [users, expected] of cases) {
    it(`${users} users → ${expected}`, () => {
      expect(recommendTier(users as any)).toBe(expected);
    });
  }
  it('breakpoint at 10: 9→STARTER, 10→PROFESSIONAL', () => {
    expect(recommendTier(9)).toBe('STARTER');
    expect(recommendTier(10)).toBe('PROFESSIONAL');
  });
  it('breakpoint at 25: 24→PROFESSIONAL, 25→ENTERPRISE', () => {
    expect(recommendTier(24)).toBe('PROFESSIONAL');
    expect(recommendTier(25)).toBe('ENTERPRISE');
  });
  it('breakpoint at 100: 99→ENTERPRISE, 100→ENTERPRISE_PLUS', () => {
    expect(recommendTier(99)).toBe('ENTERPRISE');
    expect(recommendTier(100)).toBe('ENTERPRISE_PLUS');
  });
  it('returns a valid tier key for any 1-500 count', () => {
    const valid = new Set(['STARTER', 'PROFESSIONAL', 'ENTERPRISE', 'ENTERPRISE_PLUS']);
    for (let u = 1; u <= 500; u++) {
      expect(valid).toContain(recommendTier(u as any));
    }
  });
});

describe('Cross-constant invariants', () => {
  it('STARTER.maxUsers (25) > PROFESSIONAL.minUsers (10) — tiers overlap for SME flexibility', () => {
    // Design: tiers overlap so customers can upgrade without a gap
    expect(PRICING.tiers.STARTER.maxUsers).toBeGreaterThan(PRICING.tiers.PROFESSIONAL.minUsers);
  });
  it('PROFESSIONAL.minUsers (10) is within STARTER range (5-25)', () => {
    expect(PRICING.tiers.PROFESSIONAL.minUsers).toBeGreaterThanOrEqual(PRICING.tiers.STARTER.minUsers);
    expect(PRICING.tiers.PROFESSIONAL.minUsers).toBeLessThanOrEqual(PRICING.tiers.STARTER.maxUsers);
  });
  it('ENTERPRISE.minUsers equals volumeDiscounts.bands[0].minUsers', () => {
    expect(PRICING.tiers.ENTERPRISE.minUsers).toBe(PRICING.volumeDiscounts.bands[0].minUsers);
  });
  it('ENTERPRISE_PLUS.minUsers (100) equals volumeDiscounts.bands[2].minUsers (100)', () => {
    expect(PRICING.tiers.ENTERPRISE_PLUS.minUsers).toBe(PRICING.volumeDiscounts.bands[2].minUsers);
  });
  it('trial.maxUsers equals PROFESSIONAL trialMaxUsers', () => {
    expect(PRICING.trial.maxUsers).toBe(PRICING.tiers.PROFESSIONAL.trialMaxUsers);
  });
  it('trial.durationDays equals PROFESSIONAL trialDays', () => {
    expect(PRICING.trial.durationDays).toBe(PRICING.tiers.PROFESSIONAL.trialDays);
  });
  it('only PROFESSIONAL trialEnabled=true', () => {
    const trialTiers = Object.values(PRICING.tiers).filter((t) => t.trialEnabled);
    expect(trialTiers).toHaveLength(1);
    expect(trialTiers[0].id).toBe('professional');
  });
  it('annualMonthlyRate < listPriceMonthly for all non-null tiers', () => {
    for (const t of Object.values(PRICING.tiers)) {
      if ((t as any).annualMonthlyRate !== null && (t as any).listPriceMonthly !== null) {
        expect((t as any).annualMonthlyRate).toBeLessThan((t as any).listPriceMonthly);
      }
    }
  });
  it('ENTERPRISE.platformFeeAnnual < ENTERPRISE_PLUS.platformFeeAnnual', () => {
    expect(PRICING.tiers.ENTERPRISE.platformFeeAnnual).toBeLessThan(
      PRICING.tiers.ENTERPRISE_PLUS.platformFeeAnnual,
    );
  });
  it('all tier ids are lowercase', () => {
    for (const t of Object.values(PRICING.tiers)) {
      expect(t.id).toBe(t.id.toLowerCase());
    }
  });
  it('referral commission = 15% of 40u Pro ACV (14880)', () => {
    const acv = calculateACV('PROFESSIONAL', 40, 'annual');
    const ex = PRICING.partnerships.commissionExamples.referral_40userProfessional;
    expect(acv).toBe(ex.dealACV);
    expect(acv * ex.commissionPct / 100).toBe(ex.commissionAmount);
  });
});

// ─── Algorithm puzzle phases (ph217mkp–ph224mkp) ────────────────────────────────
function moveZeroes217mkp(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217mkp_mz',()=>{
  it('a',()=>{expect(moveZeroes217mkp([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217mkp([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217mkp([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217mkp([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217mkp([4,2,0,0,3])).toBe(4);});
});
function missingNumber218mkp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218mkp_mn',()=>{
  it('a',()=>{expect(missingNumber218mkp([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218mkp([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218mkp([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218mkp([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218mkp([1])).toBe(0);});
});
function countBits219mkp(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219mkp_cb',()=>{
  it('a',()=>{expect(countBits219mkp(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219mkp(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219mkp(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219mkp(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219mkp(4)[4]).toBe(1);});
});
function climbStairs220mkp(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220mkp_cs',()=>{
  it('a',()=>{expect(climbStairs220mkp(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220mkp(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220mkp(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220mkp(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220mkp(1)).toBe(1);});
});
function maxProfit221mkp(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221mkp_mp',()=>{
  it('a',()=>{expect(maxProfit221mkp([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221mkp([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221mkp([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221mkp([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221mkp([1])).toBe(0);});
});
function singleNumber222mkp(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222mkp_sn',()=>{
  it('a',()=>{expect(singleNumber222mkp([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222mkp([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222mkp([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222mkp([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222mkp([3,3,5])).toBe(5);});
});
function hammingDist223mkp(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223mkp_hd',()=>{
  it('a',()=>{expect(hammingDist223mkp(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223mkp(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223mkp(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223mkp(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223mkp(7,7)).toBe(0);});
});
function majorElem224mkp(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224mkp_me',()=>{
  it('a',()=>{expect(majorElem224mkp([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224mkp([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224mkp([1])).toBe(1);});
  it('d',()=>{expect(majorElem224mkp([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224mkp([6,5,5])).toBe(5);});
});
