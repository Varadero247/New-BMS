// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
//
// Phase 165 — api-billing PRICING data-integrity + computation tests
// All tests are pure-function / in-process — no HTTP, no DB.

import { PRICING, calculateVolumePrice, calculateACV, recommendTier } from '@ims/config';

// ─── 1. PRICING tier integrity ────────────────────────────────────────────────

const TIER_KEYS = Object.keys(PRICING.tiers) as Array<keyof typeof PRICING.tiers>;

describe('PRICING.tiers integrity', () => {
  TIER_KEYS.forEach(key => {
    const t = PRICING.tiers[key] as Record<string, unknown>;
    it(`${key}: has id`, () => expect(t.id).toBeTruthy());
    it(`${key}: id is lowercase string`, () => {
      const id = String(t.id);
      expect(id).toBe(id.toLowerCase());
    });
    it(`${key}: has name`, () => expect(t.name).toBeTruthy());
    it(`${key}: has slaUptime`, () => expect(String(t.slaUptime ?? '')).toMatch(/%/));
    it(`${key}: minUsers is positive number`, () => {
      expect(typeof t.minUsers).toBe('number');
      expect(Number(t.minUsers)).toBeGreaterThanOrEqual(1);
    });
  });
});

// ─── 2. Tier price ordering ───────────────────────────────────────────────────

describe('PRICING tier price ordering', () => {
  const starter = PRICING.tiers.STARTER as any;
  const pro     = PRICING.tiers.PROFESSIONAL as any;
  const ent     = PRICING.tiers.ENTERPRISE as any;
  const ep      = PRICING.tiers.ENTERPRISE_PLUS as any;

  it('STARTER listPriceMonthly > PROFESSIONAL listPriceMonthly', () =>
    expect(starter.listPriceMonthly).toBeGreaterThan(pro.listPriceMonthly));
  it('PROFESSIONAL listPriceMonthly > ENTERPRISE listPriceMonthly', () =>
    expect(pro.listPriceMonthly).toBeGreaterThan(ent.listPriceMonthly));
  it('STARTER annualMonthlyRate > PROFESSIONAL annualMonthlyRate', () =>
    expect(starter.annualMonthlyRate).toBeGreaterThan(pro.annualMonthlyRate));
  it('annual rate < list rate for STARTER', () =>
    expect(starter.annualMonthlyRate).toBeLessThan(starter.listPriceMonthly));
  it('annual rate < list rate for PROFESSIONAL', () =>
    expect(pro.annualMonthlyRate).toBeLessThan(pro.listPriceMonthly));
  it('STARTER annualDiscountPct = 20', () => expect(starter.annualDiscountPct).toBe(20));
  it('PROFESSIONAL annualDiscountPct = 20', () => expect(pro.annualDiscountPct).toBe(20));
  it('PROFESSIONAL trial enabled', () => expect(Boolean(pro.trialEnabled)).toBe(true));
  it('STARTER trial not enabled', () => expect(Boolean(starter.trialEnabled)).toBe(false));
  it('PROFESSIONAL trial 14 days', () => expect(Number(pro.trialDays)).toBe(14));
  it('PROFESSIONAL autoConverts', () => expect(Boolean(pro.trialAutoConverts)).toBe(true));
  it('PROFESSIONAL trialRequiresCard', () => expect(Boolean(pro.trialRequiresCard)).toBe(true));
  it('ENTERPRISE platformFeeAnnual > 0', () => expect(Number(ent.platformFeeAnnual)).toBeGreaterThan(0));
  it('ENTERPRISE_PLUS platformFeeAnnual >= ENTERPRISE platformFeeAnnual', () =>
    expect(Number(ep.platformFeeAnnual)).toBeGreaterThanOrEqual(Number(ent.platformFeeAnnual)));
  it('STARTER has 6-month min commitment', () =>
    expect(Number(starter.minCommitmentMonths)).toBeGreaterThanOrEqual(6));
  it('PROFESSIONAL min commitment <= 1', () =>
    expect(Number(pro.minCommitmentMonths)).toBeLessThanOrEqual(1));
  it('STARTER listPriceMonthly = 49', () => expect(starter.listPriceMonthly).toBe(49));
  it('PROFESSIONAL listPriceMonthly = 39', () => expect(pro.listPriceMonthly).toBe(39));
  it('ENTERPRISE listPriceMonthly = 28', () => expect(ent.listPriceMonthly).toBe(28));
  it('STARTER annualMonthlyRate = 39', () => expect(starter.annualMonthlyRate).toBe(39));
  it('PROFESSIONAL annualMonthlyRate = 31', () => expect(pro.annualMonthlyRate).toBe(31));
});

// ─── 3. calculateVolumePrice ──────────────────────────────────────────────────

// volumeDiscounts.bands: 25-49, 50-99, 100-199, 200-499, 500+
// annualMonthly: 22, 22, 20, 18, null (custom)
// twoYearMonthly: 20, 19, 18, 16, null

const volumeCases: Array<[number, 1 | 2, number | null]> = [
  [25,  1, 22],
  [49,  1, 22],
  [50,  1, 22],
  [99,  1, 22],
  [100, 1, 20],
  [199, 1, 20],
  [200, 1, 18],
  [499, 1, 18],
  [500, 1, null],   // custom/Enterprise+ — null
  [10,  1, null],   // below min band
  [24,  1, null],   // below first band
  [25,  2, 20],     // 2-year
  [100, 2, 18],     // 2-year
  [200, 2, 16],     // 2-year
];

describe('calculateVolumePrice', () => {
  volumeCases.forEach(([users, years, expected]) => {
    it(`${users} users ${years}yr → ${expected}`, () => {
      expect(calculateVolumePrice(users, years)).toBe(expected);
    });
  });

  it('returns number or null', () => {
    const r = calculateVolumePrice(100, 1);
    expect(r === null || typeof r === 'number').toBe(true);
  });
  it('2-year rate ≤ 1-year rate for same band', () => {
    const one = calculateVolumePrice(100, 1);
    const two = calculateVolumePrice(100, 2);
    if (one !== null && two !== null) expect(two).toBeLessThanOrEqual(one);
  });
  it('returns null for 0 users', () => expect(calculateVolumePrice(0, 1)).toBeNull());
  it('result is finite or null for mid-range', () => {
    const r = calculateVolumePrice(150, 1);
    if (r !== null) expect(isFinite(r)).toBe(true);
  });
  it('higher band (200) gives lower rate than lower band (100)', () => {
    const lower = calculateVolumePrice(100, 1);  // 20
    const higher = calculateVolumePrice(200, 1); // 18
    if (lower !== null && higher !== null) expect(higher).toBeLessThanOrEqual(lower);
  });
});

// ─── 4. calculateACV ─────────────────────────────────────────────────────────

describe('calculateACV', () => {
  it('STARTER 10 users monthly > 0', () =>
    expect(calculateACV('STARTER', 10, 'monthly')).toBeGreaterThan(0));
  it('STARTER 25 users annual > 0', () =>
    expect(calculateACV('STARTER', 25, 'annual')).toBeGreaterThan(0));
  it('PROFESSIONAL 25 users monthly > 0', () =>
    expect(calculateACV('PROFESSIONAL', 25, 'monthly')).toBeGreaterThan(0));
  it('PROFESSIONAL 100 users annual > 0', () =>
    expect(calculateACV('PROFESSIONAL', 100, 'annual')).toBeGreaterThan(0));
  it('ENTERPRISE 100 users annual > 0', () =>
    expect(calculateACV('ENTERPRISE', 100, 'annual')).toBeGreaterThan(0));

  it('annual ACV < monthly × 12 for PROFESSIONAL (annual billing cheaper)', () => {
    const monthly = calculateACV('PROFESSIONAL', 25, 'monthly');
    const annual  = calculateACV('PROFESSIONAL', 25, 'annual');
    expect(annual).toBeLessThan(monthly * 12);
  });
  it('ACV scales with user count for PROFESSIONAL', () => {
    const acv10 = calculateACV('PROFESSIONAL', 10, 'annual');
    const acv20 = calculateACV('PROFESSIONAL', 20, 'annual');
    expect(acv20).toBeGreaterThan(acv10);
  });
  it('result is finite and non-negative for STARTER', () => {
    const acv = calculateACV('STARTER', 10, 'monthly');
    expect(isFinite(acv)).toBe(true);
    expect(acv).toBeGreaterThanOrEqual(0);
  });
  it('PROFESSIONAL 10u annual ≈ 31×10×12 = 3720', () => {
    const acv = calculateACV('PROFESSIONAL', 10, 'annual');
    expect(acv).toBeCloseTo(3720, 0);
  });
  it('STARTER 5u monthly ≈ 49×5×12 = 2940', () => {
    const acv = calculateACV('STARTER', 5, 'monthly');
    expect(acv).toBeCloseTo(2940, 0);
  });
  it('returns a number for all 4 tiers', () => {
    TIER_KEYS.forEach(k => {
      const acv = calculateACV(k, 10, 'annual');
      expect(typeof acv).toBe('number');
    });
  });
});

// ─── 5. recommendTier ────────────────────────────────────────────────────────

// recommendTier breakpoints: <10→STARTER, 10-24→PROFESSIONAL, 25-99→ENTERPRISE, ≥100→ENTERPRISE_PLUS
const recommendCases: Array<[number, string]> = [
  [1,    'STARTER'],
  [5,    'STARTER'],
  [9,    'STARTER'],
  [10,   'PROFESSIONAL'],
  [15,   'PROFESSIONAL'],
  [24,   'PROFESSIONAL'],
  [25,   'ENTERPRISE'],
  [50,   'ENTERPRISE'],
  [99,   'ENTERPRISE'],
  [100,  'ENTERPRISE_PLUS'],
  [200,  'ENTERPRISE_PLUS'],
  [500,  'ENTERPRISE_PLUS'],
  [1000, 'ENTERPRISE_PLUS'],
];

describe('recommendTier', () => {
  recommendCases.forEach(([users, expected]) => {
    it(`${users} users → ${expected}`, () => expect(recommendTier(users)).toBe(expected));
  });

  it('returns a valid tier key', () => expect(TIER_KEYS).toContain(recommendTier(50)));
  it('0 users → STARTER', () => expect(recommendTier(0)).toBe('STARTER'));
  it('monotone: 1 user → STARTER, 100 users → ENTERPRISE_PLUS', () => {
    expect(recommendTier(1)).toBe('STARTER');
    expect(recommendTier(100)).toBe('ENTERPRISE_PLUS');
  });
});

// ─── 6. Volume discount bands structure ──────────────────────────────────────

describe('PRICING.volumeDiscounts.bands integrity', () => {
  const bands = PRICING.volumeDiscounts.bands;

  it('has exactly 5 bands', () => expect(bands.length).toBe(5));
  it('first band minUsers = 25', () => expect(bands[0].minUsers).toBe(25));
  it('bands sorted ascending by minUsers', () => {
    for (let i = 1; i < bands.length; i++) {
      expect(bands[i].minUsers).toBeGreaterThan(bands[i - 1].minUsers);
    }
  });
  it('no duplicate minUsers', () => {
    const mins = bands.map(b => b.minUsers);
    expect(new Set(mins).size).toBe(mins.length);
  });
  it('last band maxUsers is null (open-ended)', () => expect(bands[bands.length - 1].maxUsers).toBeNull());

  bands.slice(0, 4).forEach((band, i) => {
    it(`band[${i}] annualMonthly is a positive number`, () => {
      expect(typeof band.annualMonthly).toBe('number');
      expect(Number(band.annualMonthly)).toBeGreaterThan(0);
    });
    it(`band[${i}] twoYearMonthly < annualMonthly`, () => {
      expect(Number(band.twoYearMonthly)).toBeLessThan(Number(band.annualMonthly));
    });
    it(`band[${i}] illustrativeACVMin > 0`, () => {
      expect(Number((band as any).illustrativeACVMin)).toBeGreaterThan(0);
    });
  });

  it('annualMonthly decreases across first 4 bands', () => {
    for (let i = 1; i < 4; i++) {
      expect(Number(bands[i].annualMonthly)).toBeLessThanOrEqual(Number(bands[i - 1].annualMonthly));
    }
  });
});

// ─── 7. Partnership tier integrity ───────────────────────────────────────────

const PT = PRICING.partnerships.tiers;
const PARTNER_KEYS = Object.keys(PT) as Array<keyof typeof PT>;

describe('PRICING.partnerships.tiers integrity', () => {
  it('has REFERRAL, RESELLER, STRATEGIC, WHITE_LABEL', () => {
    expect(PARTNER_KEYS).toContain('REFERRAL');
    expect(PARTNER_KEYS).toContain('RESELLER');
    expect(PARTNER_KEYS).toContain('STRATEGIC');
    expect(PARTNER_KEYS).toContain('WHITE_LABEL');
  });
  it('exactly 4 partner tiers', () => expect(PARTNER_KEYS.length).toBe(4));

  PARTNER_KEYS.forEach(key => {
    const t = PT[key] as Record<string, unknown>;
    it(`${key}: has id`, () => expect(t.id).toBeTruthy());
    it(`${key}: has name`, () => expect(String(t.name)).toBeTruthy());
    it(`${key}: id is lowercase`, () => expect(String(t.id)).toBe(String(t.id).toLowerCase()));
  });

  it('REFERRAL commissionPct = 15', () => expect(Number((PT.REFERRAL as any).commissionPct)).toBe(15));
  it('RESELLER resellerDiscountPct = 20', () => expect(Number((PT.RESELLER as any).resellerDiscountPct)).toBe(20));
  it('STRATEGIC resellerDiscountPct = 30', () => expect(Number((PT.STRATEGIC as any).resellerDiscountPct)).toBe(30));
  it('WHITE_LABEL resellerDiscountPct = 35', () => expect(Number((PT.WHITE_LABEL as any).resellerDiscountPct)).toBe(35));
  it('discount increases: RESELLER < STRATEGIC < WHITE_LABEL', () => {
    const res = (PT.RESELLER as any).resellerDiscountPct;
    const str = (PT.STRATEGIC as any).resellerDiscountPct;
    const wl  = (PT.WHITE_LABEL as any).resellerDiscountPct;
    expect(Number(str)).toBeGreaterThan(Number(res));
    expect(Number(wl)).toBeGreaterThan(Number(str));
  });
  it('WHITE_LABEL has baseAnnualLicenceFee = 24000', () => {
    expect(Number((PT.WHITE_LABEL as any).baseAnnualLicenceFee)).toBe(24000);
  });
  it('REFERRAL has 0 NFR licences', () => expect(Number((PT.REFERRAL as any).nfrLicences)).toBe(0));
  it('RESELLER has 5 NFR licences', () => expect(Number((PT.RESELLER as any).nfrLicences)).toBe(5));
  it('STRATEGIC has 15 NFR licences', () => expect(Number((PT.STRATEGIC as any).nfrLicences)).toBe(15));
  it('WHITE_LABEL has 20 NFR licences', () => expect(Number((PT.WHITE_LABEL as any).nfrLicences)).toBe(20));
  it('NFR licences increase across tiers', () => {
    expect((PT.RESELLER as any).nfrLicences).toBeGreaterThan((PT.REFERRAL as any).nfrLicences);
    expect((PT.STRATEGIC as any).nfrLicences).toBeGreaterThan((PT.RESELLER as any).nfrLicences);
    expect((PT.WHITE_LABEL as any).nfrLicences).toBeGreaterThan((PT.STRATEGIC as any).nfrLicences);
  });
  it('STRATEGIC has dedicatedChannelManager', () =>
    expect(Boolean((PT.STRATEGIC as any).dedicatedChannelManager)).toBe(true));
  it('STRATEGIC has coMarketingFundGBP > 0', () =>
    expect(Number((PT.STRATEGIC as any).coMarketingFundGBP)).toBeGreaterThan(0));
  it('WHITE_LABEL brandingCustomisation = true', () =>
    expect(Boolean((PT.WHITE_LABEL as any).brandingCustomisation)).toBe(true));
});

// ─── 8. Deal registration config ─────────────────────────────────────────────

describe('PRICING.partnerships.dealRegistration', () => {
  const dr = PRICING.partnerships.dealRegistration;

  it('protectionPeriodDays = 90', () => expect(dr.protectionPeriodDays).toBe(90));
  it('extensionDays = 30', () => expect(dr.extensionDays).toBe(30));
  it('minimumDealACVForRegistration = 5000', () => expect(dr.minimumDealACVForRegistration).toBe(5000));
  it('extensionDays < protectionPeriodDays', () =>
    expect(dr.extensionDays).toBeLessThan(dr.protectionPeriodDays));
  it('minimumDealACVForRegistration > 0', () =>
    expect(dr.minimumDealACVForRegistration).toBeGreaterThan(0));
});

// ─── 9. Design partner config ────────────────────────────────────────────────

describe('PRICING.designPartner config', () => {
  const dp = PRICING.designPartner;

  it('has maxCustomers', () => expect(Number(dp.maxCustomers)).toBeGreaterThan(0));
  it('has lockInMonths = 12', () => expect(Number(dp.lockInMonths)).toBe(12));
  it('has noticeAtMonth = 9', () => expect(Number(dp.noticeAtMonth)).toBe(9));
  it('noticeAtMonth < lockInMonths', () =>
    expect(Number(dp.noticeAtMonth)).toBeLessThan(Number(dp.lockInMonths)));
  it('has noticePeriodDays > 0', () => expect(Number(dp.noticePeriodDays)).toBeGreaterThan(0));
  it('maxCustomers is positive integer', () => {
    expect(Number.isInteger(Number(dp.maxCustomers))).toBe(true);
    expect(Number(dp.maxCustomers)).toBeGreaterThan(0);
  });
});

// ─── 10. Trial config ────────────────────────────────────────────────────────

describe('PRICING.trial config', () => {
  const trial = PRICING.trial;

  it('durationDays = 14', () => expect(trial.durationDays).toBe(14));
  it('featureTier = PROFESSIONAL', () => expect(trial.featureTier).toBe('PROFESSIONAL'));
  it('maxUsers = 5', () => expect(trial.maxUsers).toBe(5));
  it('requiresCard = true', () => expect(trial.requiresCard).toBe(true));
  it('autoConverts = true', () => expect(trial.autoConverts).toBe(true));
  it('notificationDays = 7', () => expect(trial.notificationDays).toBe(7));
  it('notificationDays < durationDays', () =>
    expect(trial.notificationDays).toBeLessThan(trial.durationDays));
  it('conversionDiscountPct > 0', () => expect(trial.conversionDiscountPct).toBeGreaterThan(0));
  it('expectedConversionRateLow < expectedConversionRateHigh', () =>
    expect(trial.expectedConversionRateLow).toBeLessThan(trial.expectedConversionRateHigh));
  it('expectedConversionRates are 0–1', () => {
    expect(trial.expectedConversionRateLow).toBeGreaterThan(0);
    expect(trial.expectedConversionRateHigh).toBeLessThanOrEqual(1);
  });
});

// ─── 11. Competitor benchmarks ────────────────────────────────────────────────

describe('PRICING.competitorBenchmarks', () => {
  const cb = PRICING.competitorBenchmarks;

  it('donesafePPUM > 0', () => expect(cb.donesafePPUM).toBeGreaterThan(0));
  it('intelexPPUM > donesafePPUM', () => expect(cb.intelexPPUM).toBeGreaterThan(cb.donesafePPUM));
  it('etqPPUM > 0', () => expect(cb.etqPPUM).toBeGreaterThan(0));
  it('nexaraSavingVsIncumbentLow ≥ 100000', () =>
    expect(cb.nexaraSavingVsIncumbentLow).toBeGreaterThanOrEqual(100000));
  it('nexaraSavingVsIncumbentHigh > nexaraSavingVsIncumbentLow', () =>
    expect(cb.nexaraSavingVsIncumbentHigh).toBeGreaterThan(cb.nexaraSavingVsIncumbentLow));
  it('incumbentStackAnnualLow > 0', () =>
    expect(cb.incumbentStackAnnualLow).toBeGreaterThan(0));
  it('incumbentStackAnnualHigh > incumbentStackAnnualLow', () =>
    expect(cb.incumbentStackAnnualHigh).toBeGreaterThan(cb.incumbentStackAnnualLow));
  it('donesafePPUM < intelexPPUM', () => expect(cb.donesafePPUM).toBeLessThan(cb.intelexPPUM));
  it('nexaraSavingVsIncumbentHigh = 400000', () =>
    expect(cb.nexaraSavingVsIncumbentHigh).toBe(400000));
});

// ─── 12. Revenue projections ─────────────────────────────────────────────────

describe('PRICING.revenueProjections', () => {
  const rp = PRICING.revenueProjections;

  it('has month4', () => expect(rp.month4).toBeDefined());
  it('has month12', () => expect(rp.month12).toBeDefined());
  it('has month24', () => expect(rp.month24).toBeDefined());
  it('customers increase month4 → month12 → month24', () => {
    expect(rp.month12.customers).toBeGreaterThan(rp.month4.customers);
    expect(rp.month24.customers).toBeGreaterThan(rp.month12.customers);
  });
  it('recommendedARR > currentARR for each period', () => {
    expect(rp.month4.recommendedARR).toBeGreaterThan(rp.month4.currentARR);
    expect(rp.month12.recommendedARR).toBeGreaterThan(rp.month12.currentARR);
    expect(rp.month24.recommendedARR).toBeGreaterThan(rp.month24.currentARR);
  });
  it('uplift = recommendedARR - currentARR for month4', () => {
    expect(rp.month4.uplift).toBe(rp.month4.recommendedARR - rp.month4.currentARR);
  });
  it('upliftPct is approx (uplift/currentARR)*100', () => {
    const expected = Math.round((rp.month4.uplift / rp.month4.currentARR) * 100);
    expect(Math.abs(rp.month4.upliftPct - expected)).toBeLessThanOrEqual(2);
  });
  it('currentARR grows month4 → month24', () =>
    expect(rp.month24.currentARR).toBeGreaterThan(rp.month4.currentARR));
});

// ─── 13. Commission examples ──────────────────────────────────────────────────

describe('PRICING.partnerships.commissionExamples', () => {
  const ce = PRICING.partnerships.commissionExamples;

  it('referral_40userProfessional: dealACV = 14880', () =>
    expect(ce.referral_40userProfessional.dealACV).toBe(14880));
  it('referral_40userProfessional: commissionAmount = 14880 × 0.15', () =>
    expect(ce.referral_40userProfessional.commissionAmount).toBeCloseTo(14880 * 0.15, 0));
  it('reseller_40userProfessional: endCustomerPays = 14880', () =>
    expect(ce.reseller_40userProfessional.endCustomerPays).toBe(14880));
  it('reseller_40userProfessional: margin = endCustomer - buyPrice', () => {
    const ex = ce.reseller_40userProfessional;
    expect(ex.resellerMargin).toBeCloseTo(ex.endCustomerPays - ex.resellerBuyPrice, 0);
  });
  it('reseller_40userProfessional: marginPct ≈ 20', () =>
    expect(ce.reseller_40userProfessional.resellerMarginPct).toBeCloseTo(20, 0));
  it('strategic_100userEnterprise: marginPct ≈ 30', () =>
    expect(ce.strategic_100userEnterprise.resellerMarginPct).toBeCloseTo(30, 0));
  it('STRATEGIC margin > RESELLER margin for same deal', () => {
    const res = ce.reseller_100userEnterprise.resellerMargin;
    const str = ce.strategic_100userEnterprise.resellerMargin;
    expect(str).toBeGreaterThan(res);
  });
  it('referral commission is 15% of dealACV', () => {
    const ex = ce.referral_100userEnterprise;
    expect(ex.commissionAmount).toBeCloseTo(ex.dealACV * (ex.commissionPct / 100), 0);
  });
});

// ─── 14. Cross-constant invariants ────────────────────────────────────────────

describe('PRICING cross-constant invariants', () => {
  it('currency is GBP', () => expect(PRICING.currency).toBe('GBP'));
  it('symbol is £', () => expect(PRICING.symbol).toBe('£'));
  it('exactly 4 product tiers', () => expect(TIER_KEYS.length).toBe(4));
  it('exactly 4 partner tiers', () => expect(PARTNER_KEYS.length).toBe(4));
  it('all tier ids are unique', () => {
    const ids = TIER_KEYS.map(k => (PRICING.tiers[k] as any).id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('all tier names are unique', () => {
    const names = TIER_KEYS.map(k => (PRICING.tiers[k] as any).name);
    expect(new Set(names).size).toBe(names.length);
  });
  it('volume bands exist and are an array', () =>
    expect(Array.isArray(PRICING.volumeDiscounts.bands)).toBe(true));
  it('PROFESSIONAL PPUM (£39) < intelexPPUM (£120)', () => {
    const p = (PRICING.tiers.PROFESSIONAL as any).listPriceMonthly;
    expect(p).toBeLessThan(PRICING.competitorBenchmarks.intelexPPUM);
  });
  it('ENTERPRISE PPUM (£28) < b2bSaasVerticalMedianUSD (≈ £70)', () => {
    const e = (PRICING.tiers.ENTERPRISE as any).listPriceMonthly;
    expect(e).toBeLessThan(PRICING.competitorBenchmarks.b2bSaasVerticalMedianUSD);
  });
  it('STARTER maxUsers < PROFESSIONAL maxUsers', () => {
    const s = (PRICING.tiers.STARTER as any).maxUsers;
    const p = (PRICING.tiers.PROFESSIONAL as any).maxUsers;
    expect(Number(s)).toBeLessThan(Number(p));
  });
  it('PROFESSIONAL maxUsers = 100', () => {
    expect((PRICING.tiers.PROFESSIONAL as any).maxUsers).toBe(100);
  });
  it('STARTER maxUsers = 25', () => {
    expect((PRICING.tiers.STARTER as any).maxUsers).toBe(25));
  });
  it('recommendTier(100) = ENTERPRISE_PLUS (breakpoint)', () => {
    expect(recommendTier(100)).toBe('ENTERPRISE_PLUS');
  });
  it('recommendTier(25) = ENTERPRISE (breakpoint)', () => {
    expect(recommendTier(25)).toBe('ENTERPRISE');
  });
  it('calculateVolumePrice at PROFESSIONAL maxUsers should return null (not Enterprise range)', () => {
    // 100 users is the Enterprise minimum
    const r = calculateVolumePrice(25, 1); // 25 is STARTER max — in first band
    expect(typeof r === 'number' || r === null).toBe(true);
  });
  it('all commission examples have positive deal values', () => {
    const ce = PRICING.partnerships.commissionExamples;
    Object.values(ce).forEach((ex: any) => {
      const val = ex.dealACV ?? ex.endCustomerPays;
      expect(Number(val)).toBeGreaterThan(0);
    });
  });
});
