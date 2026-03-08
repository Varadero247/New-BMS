// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  PRICING,
  calculateVolumePrice,
  calculateACV,
  recommendTier,
  type PricingTier,
} from '../src/pricing.config';

// ─── Tier Integrity Tests ─────────────────────────────────────────────────────

const tierEntries: [PricingTier, (typeof PRICING.tiers)[PricingTier]][] = [
  ['STARTER',       PRICING.tiers.STARTER],
  ['PROFESSIONAL',  PRICING.tiers.PROFESSIONAL],
  ['ENTERPRISE',    PRICING.tiers.ENTERPRISE],
  ['ENTERPRISE_PLUS', PRICING.tiers.ENTERPRISE_PLUS],
];

describe('PRICING.tiers — integrity', () => {
  for (const [key, tier] of tierEntries) {
    describe(`${key}`, () => {
      it('has a non-empty id string', () => {
        expect(typeof tier.id).toBe('string');
        expect(tier.id.length).toBeGreaterThan(0);
      });

      it('has a non-empty name string', () => {
        expect(typeof tier.name).toBe('string');
        expect(tier.name.length).toBeGreaterThan(0);
      });

      it('has non-negative minUsers', () => {
        expect(tier.minUsers).toBeGreaterThan(0);
      });

      it('has a non-empty slaUptime string', () => {
        expect(typeof tier.slaUptime).toBe('string');
        expect(tier.slaUptime.length).toBeGreaterThan(0);
      });

      it('has a non-empty support string', () => {
        expect(typeof tier.support).toBe('string');
        expect(tier.support.length).toBeGreaterThan(0);
      });
    });
  }
});

// ─── Tier ID Correctness ──────────────────────────────────────────────────────

describe('PRICING.tiers — id values', () => {
  it('STARTER id is "starter"', () => expect(PRICING.tiers.STARTER.id).toBe('starter'));
  it('PROFESSIONAL id is "professional"', () => expect(PRICING.tiers.PROFESSIONAL.id).toBe('professional'));
  it('ENTERPRISE id is "enterprise"', () => expect(PRICING.tiers.ENTERPRISE.id).toBe('enterprise'));
  it('ENTERPRISE_PLUS id is "enterprise_plus"', () => expect(PRICING.tiers.ENTERPRISE_PLUS.id).toBe('enterprise_plus'));
});

// ─── Tier Name Correctness ────────────────────────────────────────────────────

describe('PRICING.tiers — name values', () => {
  it('STARTER name is "Starter"', () => expect(PRICING.tiers.STARTER.name).toBe('Starter'));
  it('PROFESSIONAL name is "Professional"', () => expect(PRICING.tiers.PROFESSIONAL.name).toBe('Professional'));
  it('ENTERPRISE name is "Enterprise"', () => expect(PRICING.tiers.ENTERPRISE.name).toBe('Enterprise'));
  it('ENTERPRISE_PLUS name is "Enterprise+"', () => expect(PRICING.tiers.ENTERPRISE_PLUS.name).toBe('Enterprise+'));
});

// ─── Price Ordering ───────────────────────────────────────────────────────────

describe('PRICING.tiers — list price ordering', () => {
  it('STARTER list price (£49) > PROFESSIONAL list price (£39)', () => {
    expect(PRICING.tiers.STARTER.listPriceMonthly).toBeGreaterThan(
      PRICING.tiers.PROFESSIONAL.listPriceMonthly as number
    );
  });

  it('PROFESSIONAL list price (£39) > ENTERPRISE list price (£28)', () => {
    expect(PRICING.tiers.PROFESSIONAL.listPriceMonthly as number).toBeGreaterThan(
      PRICING.tiers.ENTERPRISE.listPriceMonthly as number
    );
  });

  it('STARTER list price is £49', () => expect(PRICING.tiers.STARTER.listPriceMonthly).toBe(49));
  it('PROFESSIONAL list price is £39', () => expect(PRICING.tiers.PROFESSIONAL.listPriceMonthly).toBe(39));
  it('ENTERPRISE list price is £28', () => expect(PRICING.tiers.ENTERPRISE.listPriceMonthly).toBe(28));
  it('ENTERPRISE_PLUS list price is null (custom)', () => expect(PRICING.tiers.ENTERPRISE_PLUS.listPriceMonthly).toBeNull());
});

// ─── Annual Rate < List Price ─────────────────────────────────────────────────

describe('PRICING.tiers — annual rate discount', () => {
  it('STARTER annual rate (£39) < list price (£49)', () => {
    expect(PRICING.tiers.STARTER.annualMonthlyRate).toBeLessThan(PRICING.tiers.STARTER.listPriceMonthly!);
  });

  it('PROFESSIONAL annual rate (£31) < list price (£39)', () => {
    expect(PRICING.tiers.PROFESSIONAL.annualMonthlyRate).toBeLessThan(PRICING.tiers.PROFESSIONAL.listPriceMonthly!);
  });

  it('ENTERPRISE annual rate (£22) < list price (£28)', () => {
    expect(PRICING.tiers.ENTERPRISE.annualMonthlyRate).toBeLessThan(PRICING.tiers.ENTERPRISE.listPriceMonthly!);
  });

  it('STARTER annual rate is £39', () => expect(PRICING.tiers.STARTER.annualMonthlyRate).toBe(39));
  it('PROFESSIONAL annual rate is £31', () => expect(PRICING.tiers.PROFESSIONAL.annualMonthlyRate).toBe(31));
  it('ENTERPRISE annual rate is £22', () => expect(PRICING.tiers.ENTERPRISE.annualMonthlyRate).toBe(22));
  it('ENTERPRISE_PLUS annual rate is null', () => expect(PRICING.tiers.ENTERPRISE_PLUS.annualMonthlyRate).toBeNull());

  it('STARTER discount is 20%', () => expect(PRICING.tiers.STARTER.annualDiscountPct).toBe(20));
  it('PROFESSIONAL discount is 20%', () => expect(PRICING.tiers.PROFESSIONAL.annualDiscountPct).toBe(20));
  it('ENTERPRISE discount is 20%', () => expect(PRICING.tiers.ENTERPRISE.annualDiscountPct).toBe(20));
});

// ─── Trial Configuration ──────────────────────────────────────────────────────

describe('PRICING.tiers — trial configuration', () => {
  it('PROFESSIONAL trial is enabled', () => expect(PRICING.tiers.PROFESSIONAL.trialEnabled).toBe(true));
  it('STARTER trial is NOT enabled', () => expect(PRICING.tiers.STARTER.trialEnabled).toBe(false));
  it('ENTERPRISE trial is NOT enabled', () => expect(PRICING.tiers.ENTERPRISE.trialEnabled).toBe(false));
  it('ENTERPRISE_PLUS trial is NOT enabled', () => expect(PRICING.tiers.ENTERPRISE_PLUS.trialEnabled).toBe(false));

  it('PROFESSIONAL trial is 14 days', () => expect(PRICING.tiers.PROFESSIONAL.trialDays).toBe(14));
  it('PROFESSIONAL trial max users is 5', () => expect(PRICING.tiers.PROFESSIONAL.trialMaxUsers).toBe(5));
  it('PROFESSIONAL trial requires card', () => expect(PRICING.tiers.PROFESSIONAL.trialRequiresCard).toBe(true));
  it('PROFESSIONAL trial auto-converts', () => expect(PRICING.tiers.PROFESSIONAL.trialAutoConverts).toBe(true));
  it('PROFESSIONAL trial notification is 7 days', () => expect(PRICING.tiers.PROFESSIONAL.trialNotificationDays).toBe(7));
  it('PROFESSIONAL trial convert rate is £33', () => expect(PRICING.tiers.PROFESSIONAL.trialConvertRate).toBe(33));
  it('STARTER trial convert rate is £42', () => expect(PRICING.tiers.STARTER.trialConvertRate).toBe(42));
  it('ENTERPRISE trial convert rate is £24', () => expect(PRICING.tiers.ENTERPRISE.trialConvertRate).toBe(24));
});

// ─── Platform Fees ────────────────────────────────────────────────────────────

describe('PRICING.tiers — platform fees', () => {
  it('ENTERPRISE platform fee is £5,000/year', () => {
    expect(PRICING.tiers.ENTERPRISE.platformFeeAnnual).toBe(5000);
  });

  it('ENTERPRISE_PLUS platform fee is £12,000/year', () => {
    expect(PRICING.tiers.ENTERPRISE_PLUS.platformFeeAnnual).toBe(12000);
  });

  it('STARTER has no platformFeeAnnual property', () => {
    expect((PRICING.tiers.STARTER as any).platformFeeAnnual).toBeUndefined();
  });

  it('PROFESSIONAL has no platformFeeAnnual property', () => {
    expect((PRICING.tiers.PROFESSIONAL as any).platformFeeAnnual).toBeUndefined();
  });

  it('ENTERPRISE_PLUS vertical add-on PPUM is £10', () => {
    expect(PRICING.tiers.ENTERPRISE_PLUS.verticalAddOnPerUserPerMonth).toBe(10);
  });

  it('ENTERPRISE_PLUS vertical add-on annual flat rate is £6,000', () => {
    expect(PRICING.tiers.ENTERPRISE_PLUS.verticalAddOnAnnualFlatRate).toBe(6000);
  });
});

// ─── User Count Limits ────────────────────────────────────────────────────────

describe('PRICING.tiers — user count limits', () => {
  it('STARTER minUsers is 5', () => expect(PRICING.tiers.STARTER.minUsers).toBe(5));
  it('STARTER maxUsers is 25', () => expect(PRICING.tiers.STARTER.maxUsers).toBe(25));
  it('PROFESSIONAL minUsers is 10', () => expect(PRICING.tiers.PROFESSIONAL.minUsers).toBe(10));
  it('PROFESSIONAL maxUsers is 100', () => expect(PRICING.tiers.PROFESSIONAL.maxUsers).toBe(100));
  it('ENTERPRISE minUsers is 25', () => expect(PRICING.tiers.ENTERPRISE.minUsers).toBe(25));
  it('ENTERPRISE maxUsers is null (unlimited)', () => expect(PRICING.tiers.ENTERPRISE.maxUsers).toBeNull());
  it('ENTERPRISE_PLUS minUsers is 100', () => expect(PRICING.tiers.ENTERPRISE_PLUS.minUsers).toBe(100));
  it('ENTERPRISE_PLUS maxUsers is null (unlimited)', () => expect(PRICING.tiers.ENTERPRISE_PLUS.maxUsers).toBeNull());
});

// ─── Volume Discount Bands ────────────────────────────────────────────────────

describe('PRICING.volumeDiscounts.bands — integrity', () => {
  const bands = PRICING.volumeDiscounts.bands;

  it('has exactly 5 bands', () => expect(bands).toHaveLength(5));

  it('band 0: minUsers is 25', () => expect(bands[0].minUsers).toBe(25));
  it('band 0: maxUsers is 49', () => expect(bands[0].maxUsers).toBe(49));
  it('band 0: annualMonthly is 22', () => expect(bands[0].annualMonthly).toBe(22));
  it('band 0: twoYearMonthly is 20', () => expect(bands[0].twoYearMonthly).toBe(20));
  it('band 0: illustrativeACVMin is 6600', () => expect(bands[0].illustrativeACVMin).toBe(6600));
  it('band 0: illustrativeACVMax is 12936', () => expect(bands[0].illustrativeACVMax).toBe(12936));

  it('band 1: minUsers is 50', () => expect(bands[1].minUsers).toBe(50));
  it('band 1: maxUsers is 99', () => expect(bands[1].maxUsers).toBe(99));
  it('band 1: annualMonthly is 22', () => expect(bands[1].annualMonthly).toBe(22));
  it('band 1: twoYearMonthly is 19', () => expect(bands[1].twoYearMonthly).toBe(19));

  it('band 2: minUsers is 100', () => expect(bands[2].minUsers).toBe(100));
  it('band 2: maxUsers is 199', () => expect(bands[2].maxUsers).toBe(199));
  it('band 2: annualMonthly is 20', () => expect(bands[2].annualMonthly).toBe(20));
  it('band 2: twoYearMonthly is 18', () => expect(bands[2].twoYearMonthly).toBe(18));

  it('band 3: minUsers is 200', () => expect(bands[3].minUsers).toBe(200));
  it('band 3: maxUsers is 499', () => expect(bands[3].maxUsers).toBe(499));
  it('band 3: annualMonthly is 18', () => expect(bands[3].annualMonthly).toBe(18));
  it('band 3: twoYearMonthly is 16', () => expect(bands[3].twoYearMonthly).toBe(16));

  it('band 4: minUsers is 500', () => expect(bands[4].minUsers).toBe(500));
  it('band 4: maxUsers is null (custom)', () => expect(bands[4].maxUsers).toBeNull());
  it('band 4: annualMonthly is null', () => expect(bands[4].annualMonthly).toBeNull());
  it('band 4: twoYearMonthly is null', () => expect(bands[4].twoYearMonthly).toBeNull());

  it('bands are ordered by ascending minUsers', () => {
    for (let i = 1; i < bands.length; i++) {
      expect(bands[i].minUsers).toBeGreaterThan(bands[i - 1].minUsers);
    }
  });

  it('has a notes string', () => {
    expect(typeof PRICING.volumeDiscounts.notes).toBe('string');
    expect(PRICING.volumeDiscounts.notes.length).toBeGreaterThan(0);
  });
});

// ─── calculateVolumePrice ─────────────────────────────────────────────────────

describe('calculateVolumePrice', () => {
  // 1-year commitment
  it('25 users → £22/month (band 0, 1yr)', () => expect(calculateVolumePrice(25, 1)).toBe(22));
  it('49 users → £22/month (band 0, 1yr)', () => expect(calculateVolumePrice(49, 1)).toBe(22));
  it('50 users → £22/month (band 1, 1yr)', () => expect(calculateVolumePrice(50, 1)).toBe(22));
  it('99 users → £22/month (band 1, 1yr)', () => expect(calculateVolumePrice(99, 1)).toBe(22));
  it('100 users → £20/month (band 2, 1yr)', () => expect(calculateVolumePrice(100, 1)).toBe(20));
  it('150 users → £20/month (band 2, 1yr)', () => expect(calculateVolumePrice(150, 1)).toBe(20));
  it('199 users → £20/month (band 2, 1yr)', () => expect(calculateVolumePrice(199, 1)).toBe(20));
  it('200 users → £18/month (band 3, 1yr)', () => expect(calculateVolumePrice(200, 1)).toBe(18));
  it('499 users → £18/month (band 3, 1yr)', () => expect(calculateVolumePrice(499, 1)).toBe(18));
  it('500 users → null (custom, band 4)', () => expect(calculateVolumePrice(500, 1)).toBeNull());
  it('1000 users → null (custom)', () => expect(calculateVolumePrice(1000, 1)).toBeNull());

  // 2-year commitment
  it('25 users → £20/month (band 0, 2yr)', () => expect(calculateVolumePrice(25, 2)).toBe(20));
  it('49 users → £20/month (band 0, 2yr)', () => expect(calculateVolumePrice(49, 2)).toBe(20));
  it('50 users → £19/month (band 1, 2yr)', () => expect(calculateVolumePrice(50, 2)).toBe(19));
  it('99 users → £19/month (band 1, 2yr)', () => expect(calculateVolumePrice(99, 2)).toBe(19));
  it('100 users → £18/month (band 2, 2yr)', () => expect(calculateVolumePrice(100, 2)).toBe(18));
  it('200 users → £16/month (band 3, 2yr)', () => expect(calculateVolumePrice(200, 2)).toBe(16));
  it('499 users → £16/month (band 3, 2yr)', () => expect(calculateVolumePrice(499, 2)).toBe(16));
  it('500 users → null (custom, 2yr)', () => expect(calculateVolumePrice(500, 2)).toBeNull());

  // 2yr should always be <= 1yr for same band
  it('2yr rate <= 1yr rate for 25 users', () => {
    expect(calculateVolumePrice(25, 2)!).toBeLessThanOrEqual(calculateVolumePrice(25, 1)!);
  });
  it('2yr rate <= 1yr rate for 100 users', () => {
    expect(calculateVolumePrice(100, 2)!).toBeLessThanOrEqual(calculateVolumePrice(100, 1)!);
  });

  // Defaults to 1yr
  it('defaults to 1yr when commitmentYears not specified', () => {
    expect(calculateVolumePrice(50)).toBe(calculateVolumePrice(50, 1));
  });
});

// ─── calculateACV ─────────────────────────────────────────────────────────────

describe('calculateACV', () => {
  it('STARTER 5 users annual: 5 × £39 × 12 = £2,340', () => {
    expect(calculateACV('STARTER', 5, 'annual')).toBe(5 * 39 * 12);
  });

  it('STARTER 10 users annual: 10 × £39 × 12 = £4,680', () => {
    expect(calculateACV('STARTER', 10, 'annual')).toBe(10 * 39 * 12);
  });

  it('STARTER 5 users monthly: 5 × £49 × 12 = £2,940', () => {
    expect(calculateACV('STARTER', 5, 'monthly')).toBe(5 * 49 * 12);
  });

  it('STARTER 5 users trial_convert: 5 × £42 × 12 = £2,520', () => {
    expect(calculateACV('STARTER', 5, 'trial_convert')).toBe(5 * 42 * 12);
  });

  it('PROFESSIONAL 10 users annual: 10 × £31 × 12 = £3,720', () => {
    expect(calculateACV('PROFESSIONAL', 10, 'annual')).toBe(10 * 31 * 12);
  });

  it('PROFESSIONAL 40 users annual: 40 × £31 × 12 = £14,880', () => {
    expect(calculateACV('PROFESSIONAL', 40, 'annual')).toBe(40 * 31 * 12);
  });

  it('PROFESSIONAL 40 users annual matches commission example dealACV', () => {
    expect(calculateACV('PROFESSIONAL', 40, 'annual')).toBe(
      PRICING.partnerships.commissionExamples.referral_40userProfessional.dealACV
    );
  });

  it('ENTERPRISE 25 users annual: band0 £22 × 25 × 12 + £5,000 = £11,600', () => {
    expect(calculateACV('ENTERPRISE', 25, 'annual')).toBe(22 * 25 * 12 + 5000);
  });

  it('ENTERPRISE 100 users annual: band2 £20 × 100 × 12 + £5,000 = £29,000', () => {
    expect(calculateACV('ENTERPRISE', 100, 'annual')).toBe(20 * 100 * 12 + 5000);
  });

  it('ENTERPRISE_PLUS custom pricing returns 0', () => {
    expect(calculateACV('ENTERPRISE_PLUS', 500, 'annual')).toBe(0);
  });

  it('annual ACV < monthly ACV for STARTER (annual rate is lower)', () => {
    expect(calculateACV('STARTER', 10, 'annual')).toBeLessThan(calculateACV('STARTER', 10, 'monthly'));
  });

  it('annual ACV < monthly ACV for PROFESSIONAL', () => {
    expect(calculateACV('PROFESSIONAL', 10, 'annual')).toBeLessThan(calculateACV('PROFESSIONAL', 10, 'monthly'));
  });
});

// ─── recommendTier ────────────────────────────────────────────────────────────

describe('recommendTier', () => {
  it('1 user → STARTER', () => expect(recommendTier(1)).toBe('STARTER'));
  it('5 users → STARTER', () => expect(recommendTier(5)).toBe('STARTER'));
  it('9 users → STARTER', () => expect(recommendTier(9)).toBe('STARTER'));
  it('10 users → PROFESSIONAL', () => expect(recommendTier(10)).toBe('PROFESSIONAL'));
  it('20 users → PROFESSIONAL', () => expect(recommendTier(20)).toBe('PROFESSIONAL'));
  it('24 users → PROFESSIONAL', () => expect(recommendTier(24)).toBe('PROFESSIONAL'));
  it('25 users → ENTERPRISE', () => expect(recommendTier(25)).toBe('ENTERPRISE'));
  it('50 users → ENTERPRISE', () => expect(recommendTier(50)).toBe('ENTERPRISE'));
  it('99 users → ENTERPRISE', () => expect(recommendTier(99)).toBe('ENTERPRISE'));
  it('100 users → ENTERPRISE_PLUS', () => expect(recommendTier(100)).toBe('ENTERPRISE_PLUS'));
  it('250 users → ENTERPRISE_PLUS', () => expect(recommendTier(250)).toBe('ENTERPRISE_PLUS'));
  it('1000 users → ENTERPRISE_PLUS', () => expect(recommendTier(1000)).toBe('ENTERPRISE_PLUS'));
});

// ─── Partnership Tiers — Integrity ───────────────────────────────────────────

const partnerEntries = [
  ['REFERRAL',    PRICING.partnerships.tiers.REFERRAL],
  ['RESELLER',    PRICING.partnerships.tiers.RESELLER],
  ['STRATEGIC',   PRICING.partnerships.tiers.STRATEGIC],
  ['WHITE_LABEL', PRICING.partnerships.tiers.WHITE_LABEL],
] as const;

describe('PRICING.partnerships.tiers — integrity', () => {
  for (const [key, tier] of partnerEntries) {
    describe(`${key}`, () => {
      it('has a non-empty id string', () => {
        expect(typeof tier.id).toBe('string');
        expect(tier.id.length).toBeGreaterThan(0);
      });

      it('has a non-empty name string', () => {
        expect(typeof tier.name).toBe('string');
        expect(tier.name.length).toBeGreaterThan(0);
      });
    });
  }

  it('REFERRAL id is "referral"', () => expect(PRICING.partnerships.tiers.REFERRAL.id).toBe('referral'));
  it('RESELLER id is "reseller"', () => expect(PRICING.partnerships.tiers.RESELLER.id).toBe('reseller'));
  it('STRATEGIC id is "strategic"', () => expect(PRICING.partnerships.tiers.STRATEGIC.id).toBe('strategic'));
  it('WHITE_LABEL id is "white_label"', () => expect(PRICING.partnerships.tiers.WHITE_LABEL.id).toBe('white_label'));

  it('REFERRAL commissionPct is 15', () => expect(PRICING.partnerships.tiers.REFERRAL.commissionPct).toBe(15));
  it('RESELLER resellerDiscountPct is 20', () => expect(PRICING.partnerships.tiers.RESELLER.resellerDiscountPct).toBe(20));
  it('STRATEGIC resellerDiscountPct is 30', () => expect(PRICING.partnerships.tiers.STRATEGIC.resellerDiscountPct).toBe(30));
  it('WHITE_LABEL resellerDiscountPct is 35', () => expect(PRICING.partnerships.tiers.WHITE_LABEL.resellerDiscountPct).toBe(35));

  it('STRATEGIC discount > RESELLER discount', () => {
    expect(PRICING.partnerships.tiers.STRATEGIC.resellerDiscountPct).toBeGreaterThan(
      PRICING.partnerships.tiers.RESELLER.resellerDiscountPct
    );
  });

  it('WHITE_LABEL discount > STRATEGIC discount', () => {
    expect(PRICING.partnerships.tiers.WHITE_LABEL.resellerDiscountPct).toBeGreaterThan(
      PRICING.partnerships.tiers.STRATEGIC.resellerDiscountPct
    );
  });

  it('REFERRAL has no reseller discount (partnerDiscount is 0)', () => {
    expect(PRICING.partnerships.tiers.REFERRAL.partnerDiscount).toBe(0);
  });

  it('RESELLER nfrLicences is 5', () => expect(PRICING.partnerships.tiers.RESELLER.nfrLicences).toBe(5));
  it('STRATEGIC nfrLicences is 15', () => expect(PRICING.partnerships.tiers.STRATEGIC.nfrLicences).toBe(15));
  it('WHITE_LABEL nfrLicences is 20', () => expect(PRICING.partnerships.tiers.WHITE_LABEL.nfrLicences).toBe(20));

  it('STRATEGIC has dedicated channel manager', () => {
    expect(PRICING.partnerships.tiers.STRATEGIC.dedicatedChannelManager).toBe(true);
  });

  it('WHITE_LABEL base annual licence fee is £24,000', () => {
    expect(PRICING.partnerships.tiers.WHITE_LABEL.baseAnnualLicenceFee).toBe(24000);
  });

  it('WHITE_LABEL minEndCustomers is 3', () => {
    expect(PRICING.partnerships.tiers.WHITE_LABEL.minEndCustomers).toBe(3);
  });
});

// ─── Commission Examples — Math Verification ──────────────────────────────────

describe('PRICING.partnerships.commissionExamples — math', () => {
  const ex = PRICING.partnerships.commissionExamples;

  it('referral_40userProfessional: 15% × £14,880 = £2,232', () => {
    const { dealACV, commissionPct, commissionAmount } = ex.referral_40userProfessional;
    expect(commissionAmount).toBe(dealACV * commissionPct / 100);
  });

  it('referral_100userEnterprise: 15% × £26,400 = £3,960', () => {
    const { dealACV, commissionPct, commissionAmount } = ex.referral_100userEnterprise;
    expect(commissionAmount).toBe(dealACV * commissionPct / 100);
  });

  it('reseller_40userProfessional: margin = endCustomerPays - buyPrice', () => {
    const { endCustomerPays, resellerBuyPrice, resellerMargin } = ex.reseller_40userProfessional;
    expect(resellerMargin).toBe(endCustomerPays - resellerBuyPrice);
  });

  it('reseller_40userProfessional: margin pct is 20%', () => {
    const { endCustomerPays, resellerMargin, resellerMarginPct } = ex.reseller_40userProfessional;
    expect(resellerMarginPct).toBe(20);
    expect(resellerMargin / endCustomerPays * 100).toBeCloseTo(20, 0);
  });

  it('reseller_100userEnterprise: margin = endCustomerPays - buyPrice', () => {
    const { endCustomerPays, resellerBuyPrice, resellerMargin } = ex.reseller_100userEnterprise;
    expect(resellerMargin).toBe(endCustomerPays - resellerBuyPrice);
  });

  it('reseller_100userEnterprise: margin pct is 20%', () => {
    const { endCustomerPays, resellerMargin, resellerMarginPct } = ex.reseller_100userEnterprise;
    expect(resellerMarginPct).toBe(20);
    expect(resellerMargin / endCustomerPays * 100).toBeCloseTo(20, 0);
  });

  it('strategic_100userEnterprise: margin = endCustomerPays - buyPrice', () => {
    const { endCustomerPays, resellerBuyPrice, resellerMargin } = ex.strategic_100userEnterprise;
    expect(resellerMargin).toBe(endCustomerPays - resellerBuyPrice);
  });

  it('strategic_100userEnterprise: margin pct is 30%', () => {
    const { endCustomerPays, resellerMargin, resellerMarginPct } = ex.strategic_100userEnterprise;
    expect(resellerMarginPct).toBe(30);
    expect(resellerMargin / endCustomerPays * 100).toBeCloseTo(30, 0);
  });

  it('strategic margin > reseller margin for same deal (100-user Enterprise)', () => {
    expect(ex.strategic_100userEnterprise.resellerMargin).toBeGreaterThan(
      ex.reseller_100userEnterprise.resellerMargin
    );
  });

  it('referral_40userProfessional dealACV matches calculateACV', () => {
    expect(ex.referral_40userProfessional.dealACV).toBe(calculateACV('PROFESSIONAL', 40, 'annual'));
  });
});

// ─── Deal Registration ────────────────────────────────────────────────────────

describe('PRICING.partnerships.dealRegistration', () => {
  it('protection period is 90 days', () => {
    expect(PRICING.partnerships.dealRegistration.protectionPeriodDays).toBe(90);
  });
  it('extension is 30 days', () => {
    expect(PRICING.partnerships.dealRegistration.extensionDays).toBe(30);
  });
  it('minimum deal ACV for registration is £5,000', () => {
    expect(PRICING.partnerships.dealRegistration.minimumDealACVForRegistration).toBe(5000);
  });
});

// ─── Competitor Benchmarks ────────────────────────────────────────────────────

describe('PRICING.competitorBenchmarks', () => {
  const b = PRICING.competitorBenchmarks;

  it('all values are positive numbers', () => {
    for (const [key, val] of Object.entries(b)) {
      expect(typeof val).toBe('number');
      expect(val).toBeGreaterThan(0);
    }
  });

  it('Intelex PPUM (£120) > Donesafe PPUM (£10)', () => {
    expect(b.intelexPPUM).toBeGreaterThan(b.donesafePPUM);
  });

  it('ETQ PPUM (£130) > Intelex PPUM (£120)', () => {
    expect(b.etqPPUM).toBeGreaterThan(b.intelexPPUM);
  });

  it('donesafePPUM is £10', () => expect(b.donesafePPUM).toBe(10));
  it('intelexPPUM is £120', () => expect(b.intelexPPUM).toBe(120));
  it('etqPPUM is £130', () => expect(b.etqPPUM).toBe(130));

  it('incumbentStackAnnualHigh > incumbentStackAnnualLow', () => {
    expect(b.incumbentStackAnnualHigh).toBeGreaterThan(b.incumbentStackAnnualLow);
  });

  it('nexaraSavingVsIncumbentHigh > nexaraSavingVsIncumbentLow', () => {
    expect(b.nexaraSavingVsIncumbentHigh).toBeGreaterThan(b.nexaraSavingVsIncumbentLow);
  });

  it('Nexara saving low (£100k) > incumbent stack low (£80k)', () => {
    expect(b.nexaraSavingVsIncumbentLow).toBeGreaterThan(b.incumbentStackAnnualLow);
  });
});

// ─── Revenue Projections ──────────────────────────────────────────────────────

describe('PRICING.revenueProjections', () => {
  const r = PRICING.revenueProjections;

  it('month24 customers > month12 customers', () => {
    expect(r.month24.customers).toBeGreaterThan(r.month12.customers);
  });

  it('month12 customers > month4 customers', () => {
    expect(r.month12.customers).toBeGreaterThan(r.month4.customers);
  });

  it('month24 currentARR > month12 currentARR', () => {
    expect(r.month24.currentARR).toBeGreaterThan(r.month12.currentARR);
  });

  it('month12 currentARR > month4 currentARR', () => {
    expect(r.month12.currentARR).toBeGreaterThan(r.month4.currentARR);
  });

  it('month24 recommendedARR > month12 recommendedARR', () => {
    expect(r.month24.recommendedARR).toBeGreaterThan(r.month12.recommendedARR);
  });

  it('month12 recommendedARR > month4 recommendedARR', () => {
    expect(r.month12.recommendedARR).toBeGreaterThan(r.month4.recommendedARR);
  });

  it('month4 uplift is £150,000', () => expect(r.month4.uplift).toBe(150000));
  it('month12 uplift is £500,000', () => expect(r.month12.uplift).toBe(500000));
  it('month24 uplift is £1,600,000', () => expect(r.month24.uplift).toBe(1600000));

  it('month4 upliftPct is 45%', () => expect(r.month4.upliftPct).toBe(45));
  it('month12 upliftPct is 45%', () => expect(r.month12.upliftPct).toBe(45));
  it('month24 upliftPct is 43%', () => expect(r.month24.upliftPct).toBe(43));

  it('month4 recommendedARR = currentARR + uplift', () => {
    expect(r.month4.recommendedARR).toBe(r.month4.currentARR + r.month4.uplift);
  });

  it('month12 recommendedARR = currentARR + uplift', () => {
    expect(r.month12.recommendedARR).toBe(r.month12.currentARR + r.month12.uplift);
  });

  it('month24 recommendedARR = currentARR + uplift', () => {
    expect(r.month24.recommendedARR).toBe(r.month24.currentARR + r.month24.uplift);
  });

  it('month4 customers is 30', () => expect(r.month4.customers).toBe(30));
  it('month12 customers is 90', () => expect(r.month12.customers).toBe(90));
  it('month24 customers is 260', () => expect(r.month24.customers).toBe(260));
});

// ─── Global Pricing Object ────────────────────────────────────────────────────

describe('PRICING — global config', () => {
  it('currency is GBP', () => expect(PRICING.currency).toBe('GBP'));
  it('symbol is £', () => expect(PRICING.symbol).toBe('£'));

  it('trial featureTier is PROFESSIONAL', () => expect(PRICING.trial.featureTier).toBe('PROFESSIONAL'));
  it('trial duration is 14 days', () => expect(PRICING.trial.durationDays).toBe(14));
  it('trial maxUsers is 5', () => expect(PRICING.trial.maxUsers).toBe(5));
  it('trial requires card', () => expect(PRICING.trial.requiresCard).toBe(true));
  it('trial autoConverts', () => expect(PRICING.trial.autoConverts).toBe(true));
  it('trial conversionDiscountPct is 15', () => expect(PRICING.trial.conversionDiscountPct).toBe(15));
  it('trial expectedConversionRateLow is 0.15', () => expect(PRICING.trial.expectedConversionRateLow).toBe(0.15));
  it('trial expectedConversionRateHigh is 0.25', () => expect(PRICING.trial.expectedConversionRateHigh).toBe(0.25));

  it('designPartner maxCustomers is 10', () => expect(PRICING.designPartner.maxCustomers).toBe(10));
  it('designPartner lockInMonths is 12', () => expect(PRICING.designPartner.lockInMonths).toBe(12));
  it('designPartner noticePeriodDays is 90', () => expect(PRICING.designPartner.noticePeriodDays).toBe(90));
  it('designPartner noticeAtMonth is 9', () => expect(PRICING.designPartner.noticeAtMonth).toBe(9));
});

// ─── APAC Partner Notes ───────────────────────────────────────────────────────

describe('PRICING.partnerships.apacPartnerNotes', () => {
  const apac = PRICING.partnerships.apacPartnerNotes;
  it('Singapore master reseller flag is true', () => expect(apac.sgMasterReseller).toBe(true));
  it('Australia master reseller flag is true', () => expect(apac.auMasterReseller).toBe(true));
  it('New Zealand master reseller flag is true', () => expect(apac.nzMasterReseller).toBe(true));
  it('ASEAN channel target ACV is 500,000', () => expect(apac.aseanChannelTargetACV).toBe(500000));
  it('GST handling is partner_responsible', () => expect(apac.gstHandling).toBe('partner_responsible'));
});

// ─── Tier Badge Tests ─────────────────────────────────────────────────────────

describe('PRICING.tiers — badges', () => {
  it('STARTER badge is null', () => expect(PRICING.tiers.STARTER.badge).toBeNull());
  it('PROFESSIONAL badge is "⭐ Most Popular"', () => expect(PRICING.tiers.PROFESSIONAL.badge).toBe('⭐ Most Popular'));
  it('ENTERPRISE badge is null', () => expect(PRICING.tiers.ENTERPRISE.badge).toBeNull());
  it('ENTERPRISE_PLUS badge is null', () => expect(PRICING.tiers.ENTERPRISE_PLUS.badge).toBeNull());
});

// ─── Commitment Months ────────────────────────────────────────────────────────

describe('PRICING.tiers — min commitment months', () => {
  it('STARTER min commitment is 6 months', () => expect(PRICING.tiers.STARTER.minCommitmentMonths).toBe(6));
  it('PROFESSIONAL min commitment is 1 month', () => expect(PRICING.tiers.PROFESSIONAL.minCommitmentMonths).toBe(1));
  it('ENTERPRISE min commitment is 1 month', () => expect(PRICING.tiers.ENTERPRISE.minCommitmentMonths).toBe(1));
  it('ENTERPRISE_PLUS min commitment is 12 months', () => expect(PRICING.tiers.ENTERPRISE_PLUS.minCommitmentMonths).toBe(12));
});

// ─── Target ACV Ranges ────────────────────────────────────────────────────────

describe('PRICING.tiers — target ACV ranges', () => {
  it('STARTER targetACVMin is 2300', () => expect(PRICING.tiers.STARTER.targetACVMin).toBe(2300));
  it('STARTER targetACVMax is 11700', () => expect(PRICING.tiers.STARTER.targetACVMax).toBe(11700));
  it('PROFESSIONAL targetACVMin is 3700', () => expect(PRICING.tiers.PROFESSIONAL.targetACVMin).toBe(3700));
  it('PROFESSIONAL targetACVMax is 37200', () => expect(PRICING.tiers.PROFESSIONAL.targetACVMax).toBe(37200));
  it('ENTERPRISE targetACVMin is 6600', () => expect(PRICING.tiers.ENTERPRISE.targetACVMin).toBe(6600));
  it('ENTERPRISE targetACVMax is null', () => expect(PRICING.tiers.ENTERPRISE.targetACVMax).toBeNull());
  it('ENTERPRISE_PLUS targetACVMin is 75000', () => expect(PRICING.tiers.ENTERPRISE_PLUS.targetACVMin).toBe(75000));
});
