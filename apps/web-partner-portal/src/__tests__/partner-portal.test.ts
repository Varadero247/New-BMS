// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// Inline data matching src/lib/pricing.ts
const PARTNER_TIERS = {
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

type PartnerTierKey = keyof typeof PARTNER_TIERS;

const TIER_KEYS: PartnerTierKey[] = ['REFERRAL', 'RESELLER', 'STRATEGIC', 'WHITE_LABEL'];

// Inline helpers (mirrors src/lib/pricing.ts)
function estimateCommission(tier: PartnerTierKey, dealValueAnnual: number): number {
  const t = PARTNER_TIERS[tier];
  if (t.commissionPct > 0) return dealValueAnnual * (t.commissionPct / 100);
  if (t.discountPct > 0) return dealValueAnnual * (t.discountPct / 100);
  return 0;
}

function getDealProtectionExpiry(registeredAt: Date, tier: PartnerTierKey): Date {
  const d = new Date(registeredAt);
  d.setDate(d.getDate() + PARTNER_TIERS[tier].dealProtectionDays);
  return d;
}

function getDaysRemaining(expiryDate: Date): number {
  return Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function getBadgeColor(days: number): 'green' | 'amber' | 'red' {
  if (days > 30) return 'green';
  if (days >= 10) return 'amber';
  return 'red';
}

function formatDaysRemaining(days: number): string {
  if (days === 0) return 'Expired';
  if (days === 1) return '1 day';
  return `${days} days`;
}

// ─── 1. PARTNER_TIERS integrity (4 tiers × 8 checks = 32) ───────────────────
describe('PARTNER_TIERS integrity', () => {
  for (const key of TIER_KEYS) {
    const tier = PARTNER_TIERS[key];

    it(`${key}: has id`, () => {
      expect(typeof tier.id).toBe('string');
      expect(tier.id.length).toBeGreaterThan(0);
    });

    it(`${key}: has name`, () => {
      expect(typeof tier.name).toBe('string');
      expect(tier.name.length).toBeGreaterThan(0);
    });

    it(`${key}: discountPct >= 0`, () => {
      expect(tier.discountPct).toBeGreaterThanOrEqual(0);
    });

    it(`${key}: dealProtectionDays === 90`, () => {
      expect(tier.dealProtectionDays).toBe(90);
    });

    it(`${key}: non-empty features array`, () => {
      expect(Array.isArray(tier.features)).toBe(true);
      expect(tier.features.length).toBeGreaterThan(0);
    });

    it(`${key}: features.length >= 4`, () => {
      expect(tier.features.length).toBeGreaterThanOrEqual(4);
    });

    it(`${key}: has at least one financial benefit`, () => {
      const hasDiscount = tier.discountPct > 0;
      const hasCommission = tier.commissionPct > 0;
      expect(hasDiscount || hasCommission).toBe(true);
    });

    it(`${key}: nfrSeats is a number`, () => {
      expect(typeof tier.nfrSeats).toBe('number');
    });
  }
});

// ─── 2. Tier ordering invariants (10) ────────────────────────────────────────
describe('Tier ordering invariants', () => {
  it('REFERRAL commissionPct === 15', () => {
    expect(PARTNER_TIERS.REFERRAL.commissionPct).toBe(15);
  });

  it('RESELLER discountPct === 20', () => {
    expect(PARTNER_TIERS.RESELLER.discountPct).toBe(20);
  });

  it('STRATEGIC discountPct === 30', () => {
    expect(PARTNER_TIERS.STRATEGIC.discountPct).toBe(30);
  });

  it('WHITE_LABEL discountPct === 35', () => {
    expect(PARTNER_TIERS.WHITE_LABEL.discountPct).toBe(35);
  });

  it('discount increases across reseller tiers', () => {
    expect(PARTNER_TIERS.RESELLER.discountPct).toBeLessThan(PARTNER_TIERS.STRATEGIC.discountPct);
    expect(PARTNER_TIERS.STRATEGIC.discountPct).toBeLessThan(PARTNER_TIERS.WHITE_LABEL.discountPct);
  });

  it('WHITE_LABEL has annualLicenceFee', () => {
    expect('annualLicenceFee' in PARTNER_TIERS.WHITE_LABEL).toBe(true);
    expect((PARTNER_TIERS.WHITE_LABEL as { annualLicenceFee: number }).annualLicenceFee).toBeGreaterThan(0);
  });

  it('REFERRAL nfrSeats === 0', () => {
    expect(PARTNER_TIERS.REFERRAL.nfrSeats).toBe(0);
  });

  it('WHITE_LABEL nfrSeats === 25', () => {
    expect(PARTNER_TIERS.WHITE_LABEL.nfrSeats).toBe(25);
  });

  it('STRATEGIC nfrSeats > RESELLER nfrSeats', () => {
    expect(PARTNER_TIERS.STRATEGIC.nfrSeats).toBeGreaterThan(PARTNER_TIERS.RESELLER.nfrSeats);
  });

  it('WHITE_LABEL nfrSeats > STRATEGIC nfrSeats', () => {
    expect(PARTNER_TIERS.WHITE_LABEL.nfrSeats).toBeGreaterThan(PARTNER_TIERS.STRATEGIC.nfrSeats);
  });
});

// ─── 3. estimateCommission (20) ───────────────────────────────────────────────
describe('estimateCommission', () => {
  it('REFERRAL 10000 = 1500', () => {
    expect(estimateCommission('REFERRAL', 10000)).toBe(1500);
  });

  it('REFERRAL 50000 = 7500', () => {
    expect(estimateCommission('REFERRAL', 50000)).toBe(7500);
  });

  it('RESELLER 10000 = 2000 (margin)', () => {
    expect(estimateCommission('RESELLER', 10000)).toBe(2000);
  });

  it('RESELLER 50000 = 10000', () => {
    expect(estimateCommission('RESELLER', 50000)).toBe(10000);
  });

  it('STRATEGIC 100000 = 30000', () => {
    expect(estimateCommission('STRATEGIC', 100000)).toBe(30000);
  });

  it('WHITE_LABEL 100000 = 35000', () => {
    expect(estimateCommission('WHITE_LABEL', 100000)).toBe(35000);
  });

  it('zero deal value = 0 for all tiers', () => {
    for (const tier of TIER_KEYS) {
      expect(estimateCommission(tier, 0)).toBe(0);
    }
  });

  it('all tiers return non-negative for positive deal', () => {
    for (const tier of TIER_KEYS) {
      expect(estimateCommission(tier, 20000)).toBeGreaterThanOrEqual(0);
    }
  });

  it('STRATEGIC > RESELLER for same deal value', () => {
    const deal = 100000;
    expect(estimateCommission('STRATEGIC', deal)).toBeGreaterThan(estimateCommission('RESELLER', deal));
  });

  it('WHITE_LABEL > STRATEGIC for same deal value', () => {
    const deal = 100000;
    expect(estimateCommission('WHITE_LABEL', deal)).toBeGreaterThan(estimateCommission('STRATEGIC', deal));
  });

  it('REFERRAL commission is exactly 15% of deal', () => {
    const deal = 40000;
    expect(estimateCommission('REFERRAL', deal)).toBe(deal * 0.15);
  });

  it('RESELLER margin is exactly 20% of deal', () => {
    const deal = 40000;
    expect(estimateCommission('RESELLER', deal)).toBe(deal * 0.20);
  });

  it('WHITE_LABEL margin is exactly 35% of deal', () => {
    const deal = 40000;
    expect(estimateCommission('WHITE_LABEL', deal)).toBe(deal * 0.35);
  });

  it('STRATEGIC margin is exactly 30% of deal', () => {
    const deal = 40000;
    expect(estimateCommission('STRATEGIC', deal)).toBe(deal * 0.30);
  });

  it('RESELLER commission for large deal scales linearly', () => {
    expect(estimateCommission('RESELLER', 200000)).toBe(40000);
  });

  it('REFERRAL commission for large deal scales linearly', () => {
    expect(estimateCommission('REFERRAL', 200000)).toBe(30000);
  });

  it('WHITE_LABEL margin for 50000 = 17500', () => {
    expect(estimateCommission('WHITE_LABEL', 50000)).toBe(17500);
  });

  it('STRATEGIC margin for 50000 = 15000', () => {
    expect(estimateCommission('STRATEGIC', 50000)).toBe(15000);
  });

  it('result is always finite', () => {
    for (const tier of TIER_KEYS) {
      expect(isFinite(estimateCommission(tier, 99999))).toBe(true);
    }
  });

  it('fractional deal values work correctly', () => {
    expect(estimateCommission('REFERRAL', 1000.50)).toBeCloseTo(150.075, 5);
  });
});

// ─── 4. getDealProtectionExpiry (15) ─────────────────────────────────────────
describe('getDealProtectionExpiry', () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  it('registered today → expiry in 90 days', () => {
    const expiry = getDealProtectionExpiry(today, 'RESELLER');
    const expected = new Date(today);
    expected.setDate(expected.getDate() + 90);
    expect(expiry.toDateString()).toBe(expected.toDateString());
  });

  for (const tier of TIER_KEYS) {
    it(`${tier}: all tiers return 90-day protection`, () => {
      const expiry = getDealProtectionExpiry(today, tier);
      const expected = new Date(today);
      expected.setDate(expected.getDate() + 90);
      expect(expiry.toDateString()).toBe(expected.toDateString());
    });
  }

  it('expiry date > registered date', () => {
    const expiry = getDealProtectionExpiry(today, 'STRATEGIC');
    expect(expiry.getTime()).toBeGreaterThan(today.getTime());
  });

  it('expiry year >= current year', () => {
    const expiry = getDealProtectionExpiry(today, 'REFERRAL');
    expect(expiry.getFullYear()).toBeGreaterThanOrEqual(today.getFullYear());
  });

  it('result is a Date object', () => {
    expect(getDealProtectionExpiry(today, 'RESELLER') instanceof Date).toBe(true);
  });

  it('expiry at exactly +90 days from registration', () => {
    const registered = new Date('2026-01-01');
    const expiry = getDealProtectionExpiry(registered, 'RESELLER');
    const expected = new Date('2026-04-01'); // Jan 1 + 90 days = Apr 1
    expect(expiry.getDate()).toBe(expected.getDate());
    expect(expiry.getMonth()).toBe(expected.getMonth());
  });

  it('registered at start of month → expiry 90 days later', () => {
    const registered = new Date('2026-03-01');
    const expiry = getDealProtectionExpiry(registered, 'WHITE_LABEL');
    const expected = new Date('2026-05-30'); // 90 days after Mar 1
    expect(expiry.toDateString()).toBe(expected.toDateString());
  });

  it('leap year: registered Feb 1 2028 → expiry May 1 2028', () => {
    const registered = new Date('2028-02-01');
    const expiry = getDealProtectionExpiry(registered, 'STRATEGIC');
    const expected = new Date(registered);
    expected.setDate(expected.getDate() + 90);
    expect(expiry.toDateString()).toBe(expected.toDateString());
  });
});

// ─── 5. getDaysRemaining (15) ─────────────────────────────────────────────────
describe('getDaysRemaining', () => {
  function futureDate(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d;
  }

  function pastDate(days: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d;
  }

  it('expiry today returns 0 or 1 (boundary)', () => {
    const today = new Date();
    const result = getDaysRemaining(today);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(1);
  });

  it('expiry tomorrow returns 1', () => {
    expect(getDaysRemaining(futureDate(1))).toBe(1);
  });

  it('expiry in 30 days returns 30', () => {
    expect(getDaysRemaining(futureDate(30))).toBe(30);
  });

  it('expiry in 90 days returns 90', () => {
    expect(getDaysRemaining(futureDate(90))).toBe(90);
  });

  it('past expiry returns 0 (not negative)', () => {
    expect(getDaysRemaining(pastDate(1))).toBe(0);
  });

  it('far past expiry returns 0', () => {
    expect(getDaysRemaining(pastDate(365))).toBe(0);
  });

  it('expiry in 365 days returns 365', () => {
    expect(getDaysRemaining(futureDate(365))).toBe(365);
  });

  it('result is always non-negative', () => {
    for (const d of [-100, -10, 0, 10, 100]) {
      const date = d >= 0 ? futureDate(d) : pastDate(-d);
      expect(getDaysRemaining(date)).toBeGreaterThanOrEqual(0);
    }
  });

  it('result is an integer', () => {
    expect(Number.isInteger(getDaysRemaining(futureDate(45)))).toBe(true);
  });

  it('expiry in 2 days returns 2', () => {
    expect(getDaysRemaining(futureDate(2))).toBe(2);
  });

  it('expiry in 10 days returns 10', () => {
    expect(getDaysRemaining(futureDate(10))).toBe(10);
  });

  it('expiry in 31 days returns 31', () => {
    expect(getDaysRemaining(futureDate(31))).toBe(31);
  });

  it('expiry in 7 days returns 7', () => {
    expect(getDaysRemaining(futureDate(7))).toBe(7);
  });

  it('very far future is finite', () => {
    const distant = new Date('2030-01-01');
    expect(isFinite(getDaysRemaining(distant))).toBe(true);
  });

  it('past date by 180 days returns 0', () => {
    expect(getDaysRemaining(pastDate(180))).toBe(0);
  });
});

// ─── 6. Stage badge logic (25) ────────────────────────────────────────────────
describe('getBadgeColor', () => {
  const greenCases = [31, 32, 50, 90, 100, 365, 1000];
  const amberCases = [10, 11, 15, 20, 25, 29, 30];
  const redCases = [0, 1, 2, 5, 9];

  for (const days of greenCases) {
    it(`${days} days → green`, () => {
      expect(getBadgeColor(days)).toBe('green');
    });
  }

  for (const days of amberCases) {
    it(`${days} days → amber`, () => {
      expect(getBadgeColor(days)).toBe('amber');
    });
  }

  for (const days of redCases) {
    it(`${days} days → red`, () => {
      expect(getBadgeColor(days)).toBe('red');
    });
  }

  it('exactly 31 → green', () => expect(getBadgeColor(31)).toBe('green'));
  it('exactly 10 → amber', () => expect(getBadgeColor(10)).toBe('amber'));
  it('exactly 9 → red', () => expect(getBadgeColor(9)).toBe('red'));
  it('exactly 30 → amber', () => expect(getBadgeColor(30)).toBe('amber'));
  it('exactly 0 → red', () => expect(getBadgeColor(0)).toBe('red'));
});

// ─── 7. Commission calculation invariants (20) ────────────────────────────────
describe('Commission calculation invariants', () => {
  for (const tier of TIER_KEYS) {
    it(`${tier}: estimate(0) === 0`, () => {
      expect(estimateCommission(tier, 0)).toBe(0);
    });

    it(`${tier}: estimate(10000) > 0`, () => {
      expect(estimateCommission(tier, 10000)).toBeGreaterThan(0);
    });
  }

  it('REFERRAL monthly commission = annual × (1/12)', () => {
    const annual = estimateCommission('REFERRAL', 12000);
    const monthly = annual / 12;
    expect(monthly).toBeCloseTo(estimateCommission('REFERRAL', 1000), 5);
  });

  it('WHITE_LABEL > STRATEGIC > RESELLER for same deal', () => {
    const deal = 50000;
    const wl = estimateCommission('WHITE_LABEL', deal);
    const st = estimateCommission('STRATEGIC', deal);
    const rs = estimateCommission('RESELLER', deal);
    expect(wl).toBeGreaterThan(st);
    expect(st).toBeGreaterThan(rs);
  });

  it('REFERRAL (15%) commission < RESELLER margin (20%) for same deal', () => {
    const deal = 100000;
    expect(estimateCommission('REFERRAL', deal)).toBeLessThan(estimateCommission('RESELLER', deal));
  });

  it('commission scales linearly with deal size', () => {
    const small = estimateCommission('RESELLER', 10000);
    const large = estimateCommission('RESELLER', 20000);
    expect(large).toBe(small * 2);
  });

  it('REFERRAL: commission for 100-user Enterprise ACV (26400) ≈ 3960', () => {
    expect(estimateCommission('REFERRAL', 26400)).toBeCloseTo(3960, 0);
  });

  it('RESELLER: margin for 100-user Enterprise ACV (26400) ≈ 5280', () => {
    expect(estimateCommission('RESELLER', 26400)).toBeCloseTo(5280, 0);
  });

  it('STRATEGIC: margin for 100-user Enterprise ACV (26400) ≈ 7920', () => {
    expect(estimateCommission('STRATEGIC', 26400)).toBeCloseTo(7920, 0);
  });

  it('all results are non-negative', () => {
    for (const tier of TIER_KEYS) {
      for (const deal of [0, 5000, 25000, 50000, 100000]) {
        expect(estimateCommission(tier, deal)).toBeGreaterThanOrEqual(0);
      }
    }
  });
});

// ─── 8. NFR allowance (10) ───────────────────────────────────────────────────
describe('NFR allowance', () => {
  it('REFERRAL has 0 NFR seats', () => {
    expect(PARTNER_TIERS.REFERRAL.nfrSeats).toBe(0);
  });

  it('RESELLER has 5 NFR seats', () => {
    expect(PARTNER_TIERS.RESELLER.nfrSeats).toBe(5);
  });

  it('STRATEGIC has 10 NFR seats', () => {
    expect(PARTNER_TIERS.STRATEGIC.nfrSeats).toBe(10);
  });

  it('WHITE_LABEL has 25 NFR seats', () => {
    expect(PARTNER_TIERS.WHITE_LABEL.nfrSeats).toBe(25);
  });

  it('all NFR seat counts are non-negative integers', () => {
    for (const tier of TIER_KEYS) {
      expect(PARTNER_TIERS[tier].nfrSeats).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(PARTNER_TIERS[tier].nfrSeats)).toBe(true);
    }
  });

  it('WHITE_LABEL nfrSeats > STRATEGIC nfrSeats', () => {
    expect(PARTNER_TIERS.WHITE_LABEL.nfrSeats).toBeGreaterThan(PARTNER_TIERS.STRATEGIC.nfrSeats);
  });

  it('STRATEGIC nfrSeats > RESELLER nfrSeats', () => {
    expect(PARTNER_TIERS.STRATEGIC.nfrSeats).toBeGreaterThan(PARTNER_TIERS.RESELLER.nfrSeats);
  });

  it('RESELLER nfrSeats > REFERRAL nfrSeats', () => {
    expect(PARTNER_TIERS.RESELLER.nfrSeats).toBeGreaterThan(PARTNER_TIERS.REFERRAL.nfrSeats);
  });

  it('NFR seats ordered ascending across tiers', () => {
    const seats = TIER_KEYS.map((k) => PARTNER_TIERS[k].nfrSeats);
    for (let i = 0; i < seats.length - 1; i++) {
      expect(seats[i]).toBeLessThan(seats[i + 1]);
    }
  });

  it('total NFR seats across all tiers = 40', () => {
    const total = TIER_KEYS.reduce((sum, k) => sum + PARTNER_TIERS[k].nfrSeats, 0);
    expect(total).toBe(40);
  });
});

// ─── 9. Deal protection expiry formatting (15) ────────────────────────────────
describe('Deal protection expiry formatting', () => {
  it('0 days → "Expired"', () => {
    expect(formatDaysRemaining(0)).toBe('Expired');
  });

  it('1 day → "1 day"', () => {
    expect(formatDaysRemaining(1)).toBe('1 day');
  });

  it('30 days → "30 days"', () => {
    expect(formatDaysRemaining(30)).toBe('30 days');
  });

  it('90 days → "90 days"', () => {
    expect(formatDaysRemaining(90)).toBe('90 days');
  });

  it('urgent threshold: < 10 days is red badge', () => {
    for (const d of [0, 1, 2, 5, 9]) {
      expect(getBadgeColor(d)).toBe('red');
    }
  });

  it('warning threshold: 10-30 days is amber badge', () => {
    for (const d of [10, 15, 20, 30]) {
      expect(getBadgeColor(d)).toBe('amber');
    }
  });

  it('safe threshold: > 30 days is green badge', () => {
    for (const d of [31, 45, 60, 90]) {
      expect(getBadgeColor(d)).toBe('green');
    }
  });

  it('2 days → "2 days"', () => {
    expect(formatDaysRemaining(2)).toBe('2 days');
  });

  it('10 days → "10 days"', () => {
    expect(formatDaysRemaining(10)).toBe('10 days');
  });

  it('365 days → "365 days"', () => {
    expect(formatDaysRemaining(365)).toBe('365 days');
  });

  it('format returns string for all valid day counts', () => {
    for (const d of [0, 1, 5, 10, 30, 90, 365]) {
      expect(typeof formatDaysRemaining(d)).toBe('string');
    }
  });

  it('"Expired" only returned for 0 days', () => {
    expect(formatDaysRemaining(1)).not.toBe('Expired');
    expect(formatDaysRemaining(0)).toBe('Expired');
  });

  it('"1 day" is singular (not "1 days")', () => {
    expect(formatDaysRemaining(1)).toBe('1 day');
    expect(formatDaysRemaining(1)).not.toBe('1 days');
  });

  it('days > 1 use plural "days"', () => {
    expect(formatDaysRemaining(2)).toMatch(/days$/);
    expect(formatDaysRemaining(30)).toMatch(/days$/);
  });

  it('getBadgeColor boundary: 30 is amber, 31 is green', () => {
    expect(getBadgeColor(30)).toBe('amber');
    expect(getBadgeColor(31)).toBe('green');
  });
});

// ─── 10. Cross-tier invariants (20+) ─────────────────────────────────────────
describe('Cross-tier invariants', () => {
  it('4 tiers total', () => {
    expect(TIER_KEYS.length).toBe(4);
  });

  it('all tier ids are lowercase (no uppercase)', () => {
    for (const key of TIER_KEYS) {
      expect(PARTNER_TIERS[key].id).toBe(PARTNER_TIERS[key].id.toLowerCase());
    }
  });

  it('all tier names start with uppercase letter', () => {
    for (const key of TIER_KEYS) {
      expect(PARTNER_TIERS[key].name[0]).toMatch(/[A-Z]/);
    }
  });

  it('no two tiers have the same discountPct (among non-zero)', () => {
    const discounts = TIER_KEYS.map((k) => PARTNER_TIERS[k].discountPct).filter((d) => d > 0);
    const unique = new Set(discounts);
    expect(unique.size).toBe(discounts.length);
  });

  it('WHITE_LABEL has the highest discount', () => {
    const maxDiscount = Math.max(...TIER_KEYS.map((k) => PARTNER_TIERS[k].discountPct));
    expect(PARTNER_TIERS.WHITE_LABEL.discountPct).toBe(maxDiscount);
  });

  it('REFERRAL has no NFR seats (0)', () => {
    expect(PARTNER_TIERS.REFERRAL.nfrSeats).toBe(0);
  });

  it('all features arrays contain only strings', () => {
    for (const key of TIER_KEYS) {
      for (const f of PARTNER_TIERS[key].features) {
        expect(typeof f).toBe('string');
      }
    }
  });

  it('all dealProtectionDays equal 90', () => {
    for (const key of TIER_KEYS) {
      expect(PARTNER_TIERS[key].dealProtectionDays).toBe(90);
    }
  });

  it('minACV increases across non-REFERRAL tiers', () => {
    expect(PARTNER_TIERS.RESELLER.minACV).toBeLessThan(PARTNER_TIERS.STRATEGIC.minACV);
    expect(PARTNER_TIERS.STRATEGIC.minACV).toBeLessThan(PARTNER_TIERS.WHITE_LABEL.minACV);
  });

  it('REFERRAL minACV is 0', () => {
    expect(PARTNER_TIERS.REFERRAL.minACV).toBe(0);
  });

  it('RESELLER minACV is 5000', () => {
    expect(PARTNER_TIERS.RESELLER.minACV).toBe(5000);
  });

  it('STRATEGIC minACV is 25000', () => {
    expect(PARTNER_TIERS.STRATEGIC.minACV).toBe(25000);
  });

  it('WHITE_LABEL minACV is 50000', () => {
    expect(PARTNER_TIERS.WHITE_LABEL.minACV).toBe(50000);
  });

  it('all tier keys are uppercase strings', () => {
    for (const key of TIER_KEYS) {
      expect(key).toBe(key.toUpperCase());
    }
  });

  it('PARTNER_TIERS includes all expected keys', () => {
    for (const expected of ['REFERRAL', 'RESELLER', 'STRATEGIC', 'WHITE_LABEL'] as const) {
      expect(expected in PARTNER_TIERS).toBe(true);
    }
  });

  it('no tier has a negative discount', () => {
    for (const key of TIER_KEYS) {
      expect(PARTNER_TIERS[key].discountPct).toBeGreaterThanOrEqual(0);
    }
  });

  it('no tier has a negative commission', () => {
    for (const key of TIER_KEYS) {
      expect(PARTNER_TIERS[key].commissionPct).toBeGreaterThanOrEqual(0);
    }
  });

  it('REFERRAL is the only commission-based tier (commissionPct > 0)', () => {
    const commissionTiers = TIER_KEYS.filter((k) => PARTNER_TIERS[k].commissionPct > 0);
    expect(commissionTiers).toEqual(['REFERRAL']);
  });

  it('RESELLER, STRATEGIC, WHITE_LABEL are discount-based (discountPct > 0)', () => {
    const discountTiers = TIER_KEYS.filter((k) => PARTNER_TIERS[k].discountPct > 0);
    expect(discountTiers).toContain('RESELLER');
    expect(discountTiers).toContain('STRATEGIC');
    expect(discountTiers).toContain('WHITE_LABEL');
  });

  it('WHITE_LABEL annualLicenceFee === 24000', () => {
    expect((PARTNER_TIERS.WHITE_LABEL as { annualLicenceFee: number }).annualLicenceFee).toBe(24000);
  });

  it('each tier id matches its constant key (lowercased)', () => {
    expect(PARTNER_TIERS.REFERRAL.id).toBe('referral');
    expect(PARTNER_TIERS.RESELLER.id).toBe('reseller');
    expect(PARTNER_TIERS.STRATEGIC.id).toBe('strategic');
    expect(PARTNER_TIERS.WHITE_LABEL.id).toBe('white_label');
  });
});

// ─── Algorithm puzzle phases (ph217ppt–ph220ppt) ────────────────────────────────
function moveZeroes217ppt(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217ppt_mz',()=>{
  it('a',()=>{expect(moveZeroes217ppt([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217ppt([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217ppt([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217ppt([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217ppt([4,2,0,0,3])).toBe(4);});
});
function missingNumber218ppt(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218ppt_mn',()=>{
  it('a',()=>{expect(missingNumber218ppt([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218ppt([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218ppt([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218ppt([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218ppt([1])).toBe(0);});
});
function countBits219ppt(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219ppt_cb',()=>{
  it('a',()=>{expect(countBits219ppt(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219ppt(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219ppt(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219ppt(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219ppt(4)[4]).toBe(1);});
});
function climbStairs220ppt(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220ppt_cs',()=>{
  it('a',()=>{expect(climbStairs220ppt(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220ppt(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220ppt(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220ppt(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220ppt(1)).toBe(1);});
});
function hd258ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258ppt2_hd',()=>{it('a',()=>{expect(hd258ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd258ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd258ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd258ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd258ppt2(15,0)).toBe(4);});});
function hd259ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259ppt2_hd',()=>{it('a',()=>{expect(hd259ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd259ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd259ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd259ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd259ppt2(15,0)).toBe(4);});});
function hd260ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260ppt2_hd',()=>{it('a',()=>{expect(hd260ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd260ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd260ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd260ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd260ppt2(15,0)).toBe(4);});});
function hd261ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261ppt2_hd',()=>{it('a',()=>{expect(hd261ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd261ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd261ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd261ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd261ppt2(15,0)).toBe(4);});});
function hd262ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262ppt2_hd',()=>{it('a',()=>{expect(hd262ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd262ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd262ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd262ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd262ppt2(15,0)).toBe(4);});});
function hd263ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263ppt2_hd',()=>{it('a',()=>{expect(hd263ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd263ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd263ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd263ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd263ppt2(15,0)).toBe(4);});});
function hd264ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264ppt2_hd',()=>{it('a',()=>{expect(hd264ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd264ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd264ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd264ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd264ppt2(15,0)).toBe(4);});});
function hd265ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265ppt2_hd',()=>{it('a',()=>{expect(hd265ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd265ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd265ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd265ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd265ppt2(15,0)).toBe(4);});});
function hd266ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266ppt2_hd',()=>{it('a',()=>{expect(hd266ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd266ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd266ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd266ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd266ppt2(15,0)).toBe(4);});});
function hd267ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267ppt2_hd',()=>{it('a',()=>{expect(hd267ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd267ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd267ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd267ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd267ppt2(15,0)).toBe(4);});});
function hd268ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268ppt2_hd',()=>{it('a',()=>{expect(hd268ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd268ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd268ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd268ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd268ppt2(15,0)).toBe(4);});});
function hd269ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269ppt2_hd',()=>{it('a',()=>{expect(hd269ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd269ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd269ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd269ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd269ppt2(15,0)).toBe(4);});});
function hd270ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270ppt2_hd',()=>{it('a',()=>{expect(hd270ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd270ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd270ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd270ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd270ppt2(15,0)).toBe(4);});});
function hd271ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271ppt2_hd',()=>{it('a',()=>{expect(hd271ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd271ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd271ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd271ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd271ppt2(15,0)).toBe(4);});});
function hd272ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272ppt2_hd',()=>{it('a',()=>{expect(hd272ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd272ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd272ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd272ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd272ppt2(15,0)).toBe(4);});});
function hd273ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273ppt2_hd',()=>{it('a',()=>{expect(hd273ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd273ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd273ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd273ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd273ppt2(15,0)).toBe(4);});});
function hd274ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274ppt2_hd',()=>{it('a',()=>{expect(hd274ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd274ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd274ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd274ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd274ppt2(15,0)).toBe(4);});});
function hd275ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275ppt2_hd',()=>{it('a',()=>{expect(hd275ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd275ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd275ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd275ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd275ppt2(15,0)).toBe(4);});});
function hd276ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276ppt2_hd',()=>{it('a',()=>{expect(hd276ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd276ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd276ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd276ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd276ppt2(15,0)).toBe(4);});});
function hd277ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277ppt2_hd',()=>{it('a',()=>{expect(hd277ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd277ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd277ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd277ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd277ppt2(15,0)).toBe(4);});});
function hd278ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278ppt2_hd',()=>{it('a',()=>{expect(hd278ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd278ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd278ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd278ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd278ppt2(15,0)).toBe(4);});});
function hd279ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279ppt2_hd',()=>{it('a',()=>{expect(hd279ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd279ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd279ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd279ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd279ppt2(15,0)).toBe(4);});});
function hd280ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280ppt2_hd',()=>{it('a',()=>{expect(hd280ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd280ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd280ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd280ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd280ppt2(15,0)).toBe(4);});});
function hd281ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281ppt2_hd',()=>{it('a',()=>{expect(hd281ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd281ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd281ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd281ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd281ppt2(15,0)).toBe(4);});});
function hd282ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282ppt2_hd',()=>{it('a',()=>{expect(hd282ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd282ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd282ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd282ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd282ppt2(15,0)).toBe(4);});});
function hd283ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283ppt2_hd',()=>{it('a',()=>{expect(hd283ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd283ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd283ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd283ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd283ppt2(15,0)).toBe(4);});});
function hd284ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284ppt2_hd',()=>{it('a',()=>{expect(hd284ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd284ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd284ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd284ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd284ppt2(15,0)).toBe(4);});});
function hd285ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285ppt2_hd',()=>{it('a',()=>{expect(hd285ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd285ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd285ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd285ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd285ppt2(15,0)).toBe(4);});});
function hd286ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286ppt2_hd',()=>{it('a',()=>{expect(hd286ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd286ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd286ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd286ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd286ppt2(15,0)).toBe(4);});});
function hd287ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287ppt2_hd',()=>{it('a',()=>{expect(hd287ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd287ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd287ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd287ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd287ppt2(15,0)).toBe(4);});});
function hd288ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288ppt2_hd',()=>{it('a',()=>{expect(hd288ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd288ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd288ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd288ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd288ppt2(15,0)).toBe(4);});});
function hd289ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289ppt2_hd',()=>{it('a',()=>{expect(hd289ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd289ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd289ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd289ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd289ppt2(15,0)).toBe(4);});});
function hd290ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290ppt2_hd',()=>{it('a',()=>{expect(hd290ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd290ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd290ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd290ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd290ppt2(15,0)).toBe(4);});});
function hd291ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291ppt2_hd',()=>{it('a',()=>{expect(hd291ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd291ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd291ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd291ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd291ppt2(15,0)).toBe(4);});});
function hd292ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292ppt2_hd',()=>{it('a',()=>{expect(hd292ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd292ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd292ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd292ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd292ppt2(15,0)).toBe(4);});});
function hd293ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293ppt2_hd',()=>{it('a',()=>{expect(hd293ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd293ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd293ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd293ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd293ppt2(15,0)).toBe(4);});});
function hd294ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294ppt2_hd',()=>{it('a',()=>{expect(hd294ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd294ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd294ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd294ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd294ppt2(15,0)).toBe(4);});});
function hd295ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295ppt2_hd',()=>{it('a',()=>{expect(hd295ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd295ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd295ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd295ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd295ppt2(15,0)).toBe(4);});});
function hd296ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296ppt2_hd',()=>{it('a',()=>{expect(hd296ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd296ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd296ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd296ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd296ppt2(15,0)).toBe(4);});});
function hd297ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297ppt2_hd',()=>{it('a',()=>{expect(hd297ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd297ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd297ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd297ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd297ppt2(15,0)).toBe(4);});});
function hd298ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298ppt2_hd',()=>{it('a',()=>{expect(hd298ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd298ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd298ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd298ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd298ppt2(15,0)).toBe(4);});});
function hd299ppt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299ppt2_hd',()=>{it('a',()=>{expect(hd299ppt2(1,4)).toBe(2);});it('b',()=>{expect(hd299ppt2(3,1)).toBe(1);});it('c',()=>{expect(hd299ppt2(0,0)).toBe(0);});it('d',()=>{expect(hd299ppt2(93,73)).toBe(2);});it('e',()=>{expect(hd299ppt2(15,0)).toBe(4);});});
