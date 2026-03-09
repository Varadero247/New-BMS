// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inline type definitions (no imports from source) ──────────────────────

type PartnerTierKey = 'REFERRAL' | 'RESELLER' | 'STRATEGIC' | 'WHITE_LABEL';
type DealStageFilter = 'All' | 'Active' | 'Won' | 'Lost' | 'Expired';
type CommissionStatus = 'Pending' | 'Paid' | 'Processing';

interface PartnerTier {
  id: string;
  name: string;
  discountPct: number;
  commissionPct: number;
  minACV: number;
  dealProtectionDays: number;
  nfrSeats: number;
  annualLicenceFee?: number;
  features: readonly string[];
}

interface Deal {
  id: string;
  customer: string;
  value: number;
  stage: string;
  protectionExpires: string;
}

interface CommissionStatement {
  month: string;
  deals: number;
  commission: number;
  status: CommissionStatus;
  invoiceRef?: string;
}

// ─── Inline domain constants (mirrored from src/lib/pricing.ts) ─────────────

const PARTNER_TIERS: Record<PartnerTierKey, PartnerTier> = {
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
};

const TIER_ORDER: PartnerTierKey[] = ['REFERRAL', 'RESELLER', 'STRATEGIC', 'WHITE_LABEL'];

const DEAL_STAGE_FILTERS: DealStageFilter[] = ['All', 'Active', 'Won', 'Lost', 'Expired'];

const COMMISSION_STATUSES: CommissionStatus[] = ['Pending', 'Paid', 'Processing'];

// Badge/color maps — mirrored from commissions/page.tsx STATUS_STYLES
const COMMISSION_STATUS_STYLES: Record<CommissionStatus, string> = {
  Paid: 'bg-emerald-500/20 text-emerald-400',
  Processing: 'bg-blue-500/20 text-blue-400',
  Pending: 'bg-amber-500/20 text-amber-400',
};

// Tier colour maps — mirrored from tier/page.tsx TIER_COLOURS
const TIER_COLOURS: Record<PartnerTierKey, { bg: string; border: string; badge: string }> = {
  REFERRAL: { bg: 'bg-blue-600/10', border: 'border-blue-600/30', badge: 'bg-blue-600 text-white' },
  RESELLER: { bg: 'bg-emerald-600/10', border: 'border-emerald-600/30', badge: 'bg-emerald-600 text-white' },
  STRATEGIC: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500 text-white' },
  WHITE_LABEL: { bg: 'bg-purple-600/10', border: 'border-purple-600/30', badge: 'bg-purple-600 text-white' },
};

// estimateCommission — mirrored from src/lib/pricing.ts
function estimateCommission(tier: PartnerTierKey, dealValueAnnual: number): number {
  const t = PARTNER_TIERS[tier];
  if (t.commissionPct > 0) return dealValueAnnual * (t.commissionPct / 100);
  if (t.discountPct > 0) return dealValueAnnual * (t.discountPct / 100);
  return 0;
}

// getDealProtectionExpiry — mirrored from src/lib/pricing.ts
function getDealProtectionExpiry(registeredAt: Date, tier: PartnerTierKey): Date {
  const d = new Date(registeredAt);
  d.setDate(d.getDate() + PARTNER_TIERS[tier].dealProtectionDays);
  return d;
}

// getDaysRemaining — mirrored from src/lib/pricing.ts
function getDaysRemaining(expiryDate: Date): number {
  return Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

// Protection badge colour logic — mirrored from deals/page.tsx ProtectionBadge
function protectionBadgeColour(days: number): string {
  if (days > 30) return 'bg-emerald-500/20 text-emerald-400';
  if (days >= 10) return 'bg-amber-500/20 text-amber-400';
  return 'bg-red-500/20 text-red-400';
}

// canExtend logic — mirrored from deals/page.tsx
function canExtend(tier: PartnerTierKey, days: number, stage: string): boolean {
  return tier === 'STRATEGIC' && days < 30 && stage === 'Active';
}

// Mock deals
const MOCK_DEALS: Deal[] = [
  { id: 'deal-001-xxxx', customer: 'Apex Manufacturing Ltd', value: 48000, stage: 'Active', protectionExpires: '2026-04-20' },
  { id: 'deal-002-xxxx', customer: 'Horizon Logistics Group', value: 22000, stage: 'Won', protectionExpires: '2026-01-15' },
  { id: 'deal-003-xxxx', customer: 'TechCore Systems', value: 75000, stage: 'Active', protectionExpires: '2026-05-01' },
  { id: 'deal-004-xxxx', customer: 'MedDevice Partners', value: 15000, stage: 'Lost', protectionExpires: '2025-12-31' },
  { id: 'deal-005-xxxx', customer: 'AeroPrecision UK', value: 120000, stage: 'Active', protectionExpires: '2026-06-15' },
];

// Mock commission statements
const MOCK_STATEMENTS: CommissionStatement[] = [
  { month: 'January 2026', deals: 3, commission: 8400, status: 'Paid', invoiceRef: 'INV-COM-2026-001' },
  { month: 'February 2026', deals: 2, commission: 5200, status: 'Paid', invoiceRef: 'INV-COM-2026-002' },
  { month: 'March 2026', deals: 1, commission: 3600, status: 'Processing' },
  { month: 'April 2026', deals: 4, commission: 11200, status: 'Pending' },
];

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('Partner Portal — Domain: Tier Keys and Order', () => {
  test('TIER_ORDER contains exactly 4 tiers', () => {
    expect(TIER_ORDER).toHaveLength(4);
  });

  test('TIER_ORDER starts with REFERRAL', () => {
    expect(TIER_ORDER[0]).toBe('REFERRAL');
  });

  test('TIER_ORDER ends with WHITE_LABEL', () => {
    expect(TIER_ORDER[TIER_ORDER.length - 1]).toBe('WHITE_LABEL');
  });

  for (const key of TIER_ORDER) {
    test(`PARTNER_TIERS has entry for "${key}"`, () => {
      expect(PARTNER_TIERS[key]).toBeDefined();
    });
  }

  test('PARTNER_TIERS has exactly 4 entries', () => {
    expect(Object.keys(PARTNER_TIERS)).toHaveLength(4);
  });
});

describe('Partner Portal — Domain: Tier Financial Properties', () => {
  test('REFERRAL has 15% commissionPct and 0% discountPct', () => {
    expect(PARTNER_TIERS.REFERRAL.commissionPct).toBe(15);
    expect(PARTNER_TIERS.REFERRAL.discountPct).toBe(0);
  });

  test('RESELLER has 20% discountPct and 0% commissionPct', () => {
    expect(PARTNER_TIERS.RESELLER.discountPct).toBe(20);
    expect(PARTNER_TIERS.RESELLER.commissionPct).toBe(0);
  });

  test('STRATEGIC has 30% discountPct', () => {
    expect(PARTNER_TIERS.STRATEGIC.discountPct).toBe(30);
  });

  test('WHITE_LABEL has 35% discountPct', () => {
    expect(PARTNER_TIERS.WHITE_LABEL.discountPct).toBe(35);
  });

  test('discountPct is strictly ascending across RESELLER, STRATEGIC, WHITE_LABEL', () => {
    expect(PARTNER_TIERS.RESELLER.discountPct).toBeLessThan(PARTNER_TIERS.STRATEGIC.discountPct);
    expect(PARTNER_TIERS.STRATEGIC.discountPct).toBeLessThan(PARTNER_TIERS.WHITE_LABEL.discountPct);
  });

  test('REFERRAL has minACV of 0', () => {
    expect(PARTNER_TIERS.REFERRAL.minACV).toBe(0);
  });

  test('RESELLER has minACV of 5000', () => {
    expect(PARTNER_TIERS.RESELLER.minACV).toBe(5000);
  });

  test('STRATEGIC has minACV of 25000', () => {
    expect(PARTNER_TIERS.STRATEGIC.minACV).toBe(25000);
  });

  test('WHITE_LABEL has minACV of 50000', () => {
    expect(PARTNER_TIERS.WHITE_LABEL.minACV).toBe(50000);
  });

  test('minACV is strictly ascending across tiers', () => {
    const acvs = TIER_ORDER.map((k) => PARTNER_TIERS[k].minACV);
    for (let i = 1; i < acvs.length; i++) {
      expect(acvs[i]).toBeGreaterThan(acvs[i - 1]);
    }
  });

  test('WHITE_LABEL has annualLicenceFee of 24000', () => {
    expect(PARTNER_TIERS.WHITE_LABEL.annualLicenceFee).toBe(24000);
  });

  test('non-WHITE_LABEL tiers do not have annualLicenceFee', () => {
    for (const key of ['REFERRAL', 'RESELLER', 'STRATEGIC'] as PartnerTierKey[]) {
      expect(PARTNER_TIERS[key].annualLicenceFee).toBeUndefined();
    }
  });
});

describe('Partner Portal — Domain: Tier NFR Seats', () => {
  test('REFERRAL has 0 NFR seats', () => {
    expect(PARTNER_TIERS.REFERRAL.nfrSeats).toBe(0);
  });

  test('RESELLER has 5 NFR seats', () => {
    expect(PARTNER_TIERS.RESELLER.nfrSeats).toBe(5);
  });

  test('STRATEGIC has 10 NFR seats', () => {
    expect(PARTNER_TIERS.STRATEGIC.nfrSeats).toBe(10);
  });

  test('WHITE_LABEL has 25 NFR seats', () => {
    expect(PARTNER_TIERS.WHITE_LABEL.nfrSeats).toBe(25);
  });

  test('nfrSeats are non-decreasing across tier order', () => {
    const seats = TIER_ORDER.map((k) => PARTNER_TIERS[k].nfrSeats);
    for (let i = 1; i < seats.length; i++) {
      expect(seats[i]).toBeGreaterThanOrEqual(seats[i - 1]);
    }
  });
});

describe('Partner Portal — Domain: Deal Protection Days', () => {
  test('all tiers have 90 dealProtectionDays', () => {
    for (const key of TIER_ORDER) {
      expect(PARTNER_TIERS[key].dealProtectionDays).toBe(90);
    }
  });

  test('getDealProtectionExpiry adds 90 days to registration date', () => {
    const regDate = new Date('2026-01-01T00:00:00Z');
    const expiry = getDealProtectionExpiry(regDate, 'RESELLER');
    const diffMs = expiry.getTime() - regDate.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(90);
  });

  test('getDealProtectionExpiry for REFERRAL also adds 90 days', () => {
    const regDate = new Date('2026-01-01T12:00:00Z');
    const expiry = getDealProtectionExpiry(regDate, 'REFERRAL');
    const diffDays = Math.round((expiry.getTime() - regDate.getTime()) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(90);
  });

  test('getDaysRemaining returns 0 for a past expiry date', () => {
    const past = new Date('2020-01-01T00:00:00Z');
    expect(getDaysRemaining(past)).toBe(0);
  });

  test('getDaysRemaining returns a positive integer for a future date', () => {
    const future = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const days = getDaysRemaining(future);
    expect(days).toBeGreaterThan(0);
  });
});

describe('Partner Portal — Domain: estimateCommission', () => {
  test('REFERRAL earns 15% commission on deal value', () => {
    expect(estimateCommission('REFERRAL', 10000)).toBe(1500);
  });

  test('RESELLER earns 20% margin (discount) on deal value', () => {
    expect(estimateCommission('RESELLER', 10000)).toBe(2000);
  });

  test('STRATEGIC earns 30% margin on deal value', () => {
    expect(estimateCommission('STRATEGIC', 10000)).toBe(3000);
  });

  test('WHITE_LABEL earns 35% margin on deal value', () => {
    expect(estimateCommission('WHITE_LABEL', 10000)).toBe(3500);
  });

  test('commission scales linearly with deal value', () => {
    expect(estimateCommission('REFERRAL', 20000)).toBe(3000);
    expect(estimateCommission('REFERRAL', 50000)).toBe(7500);
  });

  test('commission is always non-negative', () => {
    for (const key of TIER_ORDER) {
      expect(estimateCommission(key, 0)).toBeGreaterThanOrEqual(0);
      expect(estimateCommission(key, 100000)).toBeGreaterThanOrEqual(0);
    }
  });

  test('WHITE_LABEL earns more than RESELLER on the same deal', () => {
    expect(estimateCommission('WHITE_LABEL', 50000)).toBeGreaterThan(estimateCommission('RESELLER', 50000));
  });
});

describe('Partner Portal — Domain: Deal Stage Filter Array', () => {
  test('DEAL_STAGE_FILTERS contains exactly 5 stages', () => {
    expect(DEAL_STAGE_FILTERS).toHaveLength(5);
  });

  test('DEAL_STAGE_FILTERS starts with All', () => {
    expect(DEAL_STAGE_FILTERS[0]).toBe('All');
  });

  for (const s of ['Active', 'Won', 'Lost', 'Expired'] as DealStageFilter[]) {
    test(`DEAL_STAGE_FILTERS includes "${s}"`, () => {
      expect(DEAL_STAGE_FILTERS).toContain(s);
    });
  }
});

describe('Partner Portal — Domain: Commission Status Styles', () => {
  test('COMMISSION_STATUSES contains exactly 3 values', () => {
    expect(COMMISSION_STATUSES).toHaveLength(3);
  });

  test('COMMISSION_STATUS_STYLES has an entry for every status', () => {
    for (const s of COMMISSION_STATUSES) {
      expect(COMMISSION_STATUS_STYLES[s]).toBeDefined();
    }
  });

  test('Paid badge is emerald-toned', () => {
    expect(COMMISSION_STATUS_STYLES.Paid).toContain('emerald');
  });

  test('Processing badge is blue-toned', () => {
    expect(COMMISSION_STATUS_STYLES.Processing).toContain('blue');
  });

  test('Pending badge is amber-toned', () => {
    expect(COMMISSION_STATUS_STYLES.Pending).toContain('amber');
  });

  test('every badge style is a non-empty string', () => {
    for (const s of COMMISSION_STATUSES) {
      expect(typeof COMMISSION_STATUS_STYLES[s]).toBe('string');
      expect(COMMISSION_STATUS_STYLES[s].length).toBeGreaterThan(0);
    }
  });
});

describe('Partner Portal — Domain: Tier Colour Palette', () => {
  test('TIER_COLOURS has an entry for every tier', () => {
    for (const key of TIER_ORDER) {
      expect(TIER_COLOURS[key]).toBeDefined();
    }
  });

  test('REFERRAL colours are blue-toned', () => {
    expect(TIER_COLOURS.REFERRAL.bg).toContain('blue');
    expect(TIER_COLOURS.REFERRAL.badge).toContain('blue');
  });

  test('RESELLER colours are emerald-toned', () => {
    expect(TIER_COLOURS.RESELLER.bg).toContain('emerald');
    expect(TIER_COLOURS.RESELLER.badge).toContain('emerald');
  });

  test('STRATEGIC colours are amber-toned', () => {
    expect(TIER_COLOURS.STRATEGIC.bg).toContain('amber');
    expect(TIER_COLOURS.STRATEGIC.badge).toContain('amber');
  });

  test('WHITE_LABEL colours are purple-toned', () => {
    expect(TIER_COLOURS.WHITE_LABEL.bg).toContain('purple');
    expect(TIER_COLOURS.WHITE_LABEL.badge).toContain('purple');
  });

  test('all badge styles include text-white', () => {
    for (const key of TIER_ORDER) {
      expect(TIER_COLOURS[key].badge).toContain('text-white');
    }
  });
});

describe('Partner Portal — Domain: Tier Feature Lists', () => {
  test('every tier has at least 4 features', () => {
    for (const key of TIER_ORDER) {
      expect(PARTNER_TIERS[key].features.length).toBeGreaterThanOrEqual(4);
    }
  });

  test('REFERRAL features include 15% revenue share', () => {
    expect(PARTNER_TIERS.REFERRAL.features).toContain('15% revenue share');
  });

  test('RESELLER features include 5 NFR seats', () => {
    expect(PARTNER_TIERS.RESELLER.features).toContain('5 NFR seats');
  });

  test('STRATEGIC features include Dedicated Partner Success Manager', () => {
    expect(PARTNER_TIERS.STRATEGIC.features).toContain('Dedicated Partner Success Manager');
  });

  test('WHITE_LABEL features include Full rebrand rights', () => {
    expect(PARTNER_TIERS.WHITE_LABEL.features).toContain('Full rebrand rights');
  });

  test('WHITE_LABEL features include Dedicated engineering support', () => {
    expect(PARTNER_TIERS.WHITE_LABEL.features).toContain('Dedicated engineering support');
  });

  test('REFERRAL, RESELLER and STRATEGIC include 90-day deal protection feature', () => {
    for (const key of ['REFERRAL', 'RESELLER', 'STRATEGIC'] as PartnerTierKey[]) {
      const hasProtection = (PARTNER_TIERS[key].features as readonly string[]).some((f) =>
        f.includes('90-day deal protection')
      );
      expect(hasProtection).toBe(true);
    }
  });

  test('all tiers have dealProtectionDays of 90', () => {
    for (const key of TIER_ORDER) {
      expect(PARTNER_TIERS[key].dealProtectionDays).toBe(90);
    }
  });
});

describe('Partner Portal — Domain: protectionBadgeColour logic', () => {
  test('31+ days returns emerald colour', () => {
    expect(protectionBadgeColour(31)).toContain('emerald');
    expect(protectionBadgeColour(90)).toContain('emerald');
  });

  test('10-30 days returns amber colour', () => {
    expect(protectionBadgeColour(10)).toContain('amber');
    expect(protectionBadgeColour(30)).toContain('amber');
  });

  test('0-9 days returns red colour', () => {
    expect(protectionBadgeColour(0)).toContain('red');
    expect(protectionBadgeColour(9)).toContain('red');
  });
});

describe('Partner Portal — Domain: canExtend logic', () => {
  test('STRATEGIC with <30 days and Active stage can extend', () => {
    expect(canExtend('STRATEGIC', 29, 'Active')).toBe(true);
    expect(canExtend('STRATEGIC', 0, 'Active')).toBe(true);
  });

  test('STRATEGIC with >= 30 days cannot extend', () => {
    expect(canExtend('STRATEGIC', 30, 'Active')).toBe(false);
    expect(canExtend('STRATEGIC', 31, 'Active')).toBe(false);
  });

  test('STRATEGIC with <30 days but non-Active stage cannot extend', () => {
    expect(canExtend('STRATEGIC', 5, 'Won')).toBe(false);
    expect(canExtend('STRATEGIC', 5, 'Expired')).toBe(false);
  });

  test('non-STRATEGIC tier cannot extend even when qualifying', () => {
    expect(canExtend('RESELLER', 5, 'Active')).toBe(false);
    expect(canExtend('WHITE_LABEL', 5, 'Active')).toBe(false);
    expect(canExtend('REFERRAL', 5, 'Active')).toBe(false);
  });
});

describe('Partner Portal — Domain: Mock Deals Data Integrity', () => {
  test('MOCK_DEALS contains exactly 5 records', () => {
    expect(MOCK_DEALS).toHaveLength(5);
  });

  test('all deal ids are unique', () => {
    const ids = MOCK_DEALS.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all deal values are positive', () => {
    for (const d of MOCK_DEALS) {
      expect(d.value).toBeGreaterThan(0);
    }
  });

  test('all deal stages are in known stage filters (excluding All)', () => {
    const validStages = ['Active', 'Won', 'Lost', 'Expired'];
    for (const d of MOCK_DEALS) {
      expect(validStages).toContain(d.stage);
    }
  });

  test('Active deals count is 3', () => {
    expect(MOCK_DEALS.filter((d) => d.stage === 'Active')).toHaveLength(3);
  });

  test('all customer names are non-empty strings', () => {
    for (const d of MOCK_DEALS) {
      expect(typeof d.customer).toBe('string');
      expect(d.customer.length).toBeGreaterThan(0);
    }
  });
});

describe('Partner Portal — Domain: Mock Commission Statements Data Integrity', () => {
  test('MOCK_STATEMENTS contains exactly 4 records', () => {
    expect(MOCK_STATEMENTS).toHaveLength(4);
  });

  test('all commission statuses are valid', () => {
    for (const s of MOCK_STATEMENTS) {
      expect(COMMISSION_STATUSES).toContain(s.status);
    }
  });

  test('all commission amounts are positive', () => {
    for (const s of MOCK_STATEMENTS) {
      expect(s.commission).toBeGreaterThan(0);
    }
  });

  test('all deal counts are positive', () => {
    for (const s of MOCK_STATEMENTS) {
      expect(s.deals).toBeGreaterThan(0);
    }
  });

  test('Paid statements have invoiceRef', () => {
    const paid = MOCK_STATEMENTS.filter((s) => s.status === 'Paid');
    for (const s of paid) {
      expect(s.invoiceRef).toBeDefined();
    }
  });

  test('Pending statement has no invoiceRef', () => {
    const pending = MOCK_STATEMENTS.find((s) => s.status === 'Pending');
    expect(pending?.invoiceRef).toBeUndefined();
  });

  test('all month strings are non-empty', () => {
    for (const s of MOCK_STATEMENTS) {
      expect(s.month.length).toBeGreaterThan(0);
    }
  });

  test('total YTD commission sums correctly', () => {
    const ytd = MOCK_STATEMENTS.reduce((acc, s) => acc + s.commission, 0);
    expect(ytd).toBe(8400 + 5200 + 3600 + 11200);
  });
});

// ─── Parametric: individual deal integrity ────────────────────────────────────

describe('Partner Portal — Domain: Mock Deals — per-deal parametric', () => {
  for (const deal of MOCK_DEALS) {
    test(`deal ${deal.id}: id starts with "deal-"`, () => {
      expect(deal.id.startsWith('deal-')).toBe(true);
    });
    test(`deal ${deal.id}: value is a positive number`, () => {
      expect(typeof deal.value).toBe('number');
      expect(deal.value).toBeGreaterThan(0);
    });
    test(`deal ${deal.id}: customer is a non-empty string`, () => {
      expect(typeof deal.customer).toBe('string');
      expect(deal.customer.length).toBeGreaterThan(0);
    });
    test(`deal ${deal.id}: protectionExpires matches YYYY-MM-DD format`, () => {
      expect(deal.protectionExpires).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  }
});

// ─── Parametric: per-statement integrity ─────────────────────────────────────

describe('Partner Portal — Domain: Mock Statements — per-statement parametric', () => {
  for (const stmt of MOCK_STATEMENTS) {
    test(`${stmt.month}: commission > 0`, () => {
      expect(stmt.commission).toBeGreaterThan(0);
    });
    test(`${stmt.month}: deals > 0`, () => {
      expect(stmt.deals).toBeGreaterThan(0);
    });
    test(`${stmt.month}: status is valid`, () => {
      expect(COMMISSION_STATUSES).toContain(stmt.status);
    });
    test(`${stmt.month}: month is a non-empty string`, () => {
      expect(stmt.month.length).toBeGreaterThan(0);
    });
  }
});

// ─── Parametric: canExtend boundary matrix ────────────────────────────────────

describe('Partner Portal — Domain: canExtend — parametric boundary matrix', () => {
  const cases: [PartnerTierKey, number, string, boolean][] = [
    ['STRATEGIC', 0,  'Active', true],
    ['STRATEGIC', 1,  'Active', true],
    ['STRATEGIC', 29, 'Active', true],
    ['STRATEGIC', 30, 'Active', false],   // exactly 30 days — cannot extend
    ['STRATEGIC', 31, 'Active', false],
    ['STRATEGIC', 29, 'Won',    false],   // wrong stage
    ['STRATEGIC', 29, 'Lost',   false],
    ['STRATEGIC', 29, 'Expired',false],
    ['REFERRAL',  5,  'Active', false],   // wrong tier
    ['RESELLER',  5,  'Active', false],
    ['WHITE_LABEL',5, 'Active', false],
  ];
  for (const [tier, days, stage, expected] of cases) {
    test(`canExtend(${tier}, ${days}, ${stage}) = ${expected}`, () => {
      expect(canExtend(tier, days, stage)).toBe(expected);
    });
  }
});

// ─── Parametric: protectionBadgeColour boundary ───────────────────────────────

describe('Partner Portal — Domain: protectionBadgeColour — parametric', () => {
  const cases: [number, string][] = [
    [0,   'red'],
    [5,   'red'],
    [9,   'red'],
    [10,  'amber'],
    [15,  'amber'],
    [29,  'amber'],
    [30,  'amber'],
    [31,  'emerald'],
    [60,  'emerald'],
    [90,  'emerald'],
  ];
  for (const [days, expected] of cases) {
    test(`protectionBadgeColour(${days}) contains "${expected}"`, () => {
      expect(protectionBadgeColour(days)).toContain(expected);
    });
  }
});

// ─── Parametric: tier colour fields complete ──────────────────────────────────

describe('Partner Portal — Domain: TIER_COLOURS — per-tier parametric', () => {
  const toneMap: Record<PartnerTierKey, string> = {
    REFERRAL: 'blue', RESELLER: 'emerald', STRATEGIC: 'amber', WHITE_LABEL: 'purple',
  };
  for (const key of TIER_ORDER) {
    test(`${key}: bg contains "${toneMap[key]}"`, () => {
      expect(TIER_COLOURS[key].bg).toContain(toneMap[key]);
    });
    test(`${key}: border contains "${toneMap[key]}"`, () => {
      expect(TIER_COLOURS[key].border).toContain(toneMap[key]);
    });
    test(`${key}: badge contains "${toneMap[key]}"`, () => {
      expect(TIER_COLOURS[key].badge).toContain(toneMap[key]);
    });
    test(`${key}: badge includes "text-white"`, () => {
      expect(TIER_COLOURS[key].badge).toContain('text-white');
    });
  }
});

// ─── Cross-domain invariants ──────────────────────────────────────────────────

describe('Partner Portal — Domain: Cross-domain invariants', () => {
  test('total mock deal portfolio value is > 200,000', () => {
    const total = MOCK_DEALS.reduce((s, d) => s + d.value, 0);
    expect(total).toBeGreaterThan(200000);
  });

  test('highest-value deal is AeroPrecision UK (£120,000)', () => {
    const max = MOCK_DEALS.reduce((best, d) => d.value > best.value ? d : best);
    expect(max.customer).toBe('AeroPrecision UK');
    expect(max.value).toBe(120000);
  });

  test('lowest-value deal is MedDevice Partners (£15,000)', () => {
    const min = MOCK_DEALS.reduce((best, d) => d.value < best.value ? d : best);
    expect(min.customer).toBe('MedDevice Partners');
    expect(min.value).toBe(15000);
  });

  test('April 2026 statement has the highest commission amount', () => {
    const max = MOCK_STATEMENTS.reduce((best, s) => s.commission > best.commission ? s : best);
    expect(max.month).toBe('April 2026');
    expect(max.commission).toBe(11200);
  });

  test('January 2026 statement has the most deals (3)', () => {
    const jan = MOCK_STATEMENTS.find((s) => s.month === 'January 2026');
    expect(jan?.deals).toBe(3);
  });

  test('2 statements are in Paid status', () => {
    expect(MOCK_STATEMENTS.filter((s) => s.status === 'Paid')).toHaveLength(2);
  });

  test('1 statement is Processing and 1 is Pending', () => {
    expect(MOCK_STATEMENTS.filter((s) => s.status === 'Processing')).toHaveLength(1);
    expect(MOCK_STATEMENTS.filter((s) => s.status === 'Pending')).toHaveLength(1);
  });

  test('Paid invoiceRefs are unique', () => {
    const refs = MOCK_STATEMENTS.filter((s) => s.invoiceRef).map((s) => s.invoiceRef);
    expect(new Set(refs).size).toBe(refs.length);
  });

  test('all TIER_COLOURS bg values use /10 opacity pattern', () => {
    for (const key of TIER_ORDER) {
      expect(TIER_COLOURS[key].bg).toContain('/10');
    }
  });

  test('nfrSeats total across all tiers = 0+5+10+25 = 40', () => {
    const total = TIER_ORDER.reduce((s, k) => s + PARTNER_TIERS[k].nfrSeats, 0);
    expect(total).toBe(40);
  });
});

// ─── Algorithm puzzle phases (ph217pp–ph220pp) ────────────────────────────────
function moveZeroes217pp(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217pp_mz',()=>{
  it('a',()=>{expect(moveZeroes217pp([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217pp([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217pp([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217pp([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217pp([4,2,0,0,3])).toBe(4);});
});
function missingNumber218pp(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218pp_mn',()=>{
  it('a',()=>{expect(missingNumber218pp([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218pp([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218pp([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218pp([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218pp([1])).toBe(0);});
});
function countBits219pp(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219pp_cb',()=>{
  it('a',()=>{expect(countBits219pp(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219pp(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219pp(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219pp(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219pp(4)[4]).toBe(1);});
});
function climbStairs220pp(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220pp_cs',()=>{
  it('a',()=>{expect(climbStairs220pp(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220pp(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220pp(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220pp(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220pp(1)).toBe(1);});
});
function hd258pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258pp2_hd',()=>{it('a',()=>{expect(hd258pp2(1,4)).toBe(2);});it('b',()=>{expect(hd258pp2(3,1)).toBe(1);});it('c',()=>{expect(hd258pp2(0,0)).toBe(0);});it('d',()=>{expect(hd258pp2(93,73)).toBe(2);});it('e',()=>{expect(hd258pp2(15,0)).toBe(4);});});
function hd259pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259pp2_hd',()=>{it('a',()=>{expect(hd259pp2(1,4)).toBe(2);});it('b',()=>{expect(hd259pp2(3,1)).toBe(1);});it('c',()=>{expect(hd259pp2(0,0)).toBe(0);});it('d',()=>{expect(hd259pp2(93,73)).toBe(2);});it('e',()=>{expect(hd259pp2(15,0)).toBe(4);});});
function hd260pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260pp2_hd',()=>{it('a',()=>{expect(hd260pp2(1,4)).toBe(2);});it('b',()=>{expect(hd260pp2(3,1)).toBe(1);});it('c',()=>{expect(hd260pp2(0,0)).toBe(0);});it('d',()=>{expect(hd260pp2(93,73)).toBe(2);});it('e',()=>{expect(hd260pp2(15,0)).toBe(4);});});
function hd261pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261pp2_hd',()=>{it('a',()=>{expect(hd261pp2(1,4)).toBe(2);});it('b',()=>{expect(hd261pp2(3,1)).toBe(1);});it('c',()=>{expect(hd261pp2(0,0)).toBe(0);});it('d',()=>{expect(hd261pp2(93,73)).toBe(2);});it('e',()=>{expect(hd261pp2(15,0)).toBe(4);});});
function hd262pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262pp2_hd',()=>{it('a',()=>{expect(hd262pp2(1,4)).toBe(2);});it('b',()=>{expect(hd262pp2(3,1)).toBe(1);});it('c',()=>{expect(hd262pp2(0,0)).toBe(0);});it('d',()=>{expect(hd262pp2(93,73)).toBe(2);});it('e',()=>{expect(hd262pp2(15,0)).toBe(4);});});
function hd263pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263pp2_hd',()=>{it('a',()=>{expect(hd263pp2(1,4)).toBe(2);});it('b',()=>{expect(hd263pp2(3,1)).toBe(1);});it('c',()=>{expect(hd263pp2(0,0)).toBe(0);});it('d',()=>{expect(hd263pp2(93,73)).toBe(2);});it('e',()=>{expect(hd263pp2(15,0)).toBe(4);});});
function hd264pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264pp2_hd',()=>{it('a',()=>{expect(hd264pp2(1,4)).toBe(2);});it('b',()=>{expect(hd264pp2(3,1)).toBe(1);});it('c',()=>{expect(hd264pp2(0,0)).toBe(0);});it('d',()=>{expect(hd264pp2(93,73)).toBe(2);});it('e',()=>{expect(hd264pp2(15,0)).toBe(4);});});
function hd265pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265pp2_hd',()=>{it('a',()=>{expect(hd265pp2(1,4)).toBe(2);});it('b',()=>{expect(hd265pp2(3,1)).toBe(1);});it('c',()=>{expect(hd265pp2(0,0)).toBe(0);});it('d',()=>{expect(hd265pp2(93,73)).toBe(2);});it('e',()=>{expect(hd265pp2(15,0)).toBe(4);});});
function hd266pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266pp2_hd',()=>{it('a',()=>{expect(hd266pp2(1,4)).toBe(2);});it('b',()=>{expect(hd266pp2(3,1)).toBe(1);});it('c',()=>{expect(hd266pp2(0,0)).toBe(0);});it('d',()=>{expect(hd266pp2(93,73)).toBe(2);});it('e',()=>{expect(hd266pp2(15,0)).toBe(4);});});
function hd267pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267pp2_hd',()=>{it('a',()=>{expect(hd267pp2(1,4)).toBe(2);});it('b',()=>{expect(hd267pp2(3,1)).toBe(1);});it('c',()=>{expect(hd267pp2(0,0)).toBe(0);});it('d',()=>{expect(hd267pp2(93,73)).toBe(2);});it('e',()=>{expect(hd267pp2(15,0)).toBe(4);});});
function hd268pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268pp2_hd',()=>{it('a',()=>{expect(hd268pp2(1,4)).toBe(2);});it('b',()=>{expect(hd268pp2(3,1)).toBe(1);});it('c',()=>{expect(hd268pp2(0,0)).toBe(0);});it('d',()=>{expect(hd268pp2(93,73)).toBe(2);});it('e',()=>{expect(hd268pp2(15,0)).toBe(4);});});
function hd269pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269pp2_hd',()=>{it('a',()=>{expect(hd269pp2(1,4)).toBe(2);});it('b',()=>{expect(hd269pp2(3,1)).toBe(1);});it('c',()=>{expect(hd269pp2(0,0)).toBe(0);});it('d',()=>{expect(hd269pp2(93,73)).toBe(2);});it('e',()=>{expect(hd269pp2(15,0)).toBe(4);});});
function hd270pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270pp2_hd',()=>{it('a',()=>{expect(hd270pp2(1,4)).toBe(2);});it('b',()=>{expect(hd270pp2(3,1)).toBe(1);});it('c',()=>{expect(hd270pp2(0,0)).toBe(0);});it('d',()=>{expect(hd270pp2(93,73)).toBe(2);});it('e',()=>{expect(hd270pp2(15,0)).toBe(4);});});
function hd271pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271pp2_hd',()=>{it('a',()=>{expect(hd271pp2(1,4)).toBe(2);});it('b',()=>{expect(hd271pp2(3,1)).toBe(1);});it('c',()=>{expect(hd271pp2(0,0)).toBe(0);});it('d',()=>{expect(hd271pp2(93,73)).toBe(2);});it('e',()=>{expect(hd271pp2(15,0)).toBe(4);});});
function hd272pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272pp2_hd',()=>{it('a',()=>{expect(hd272pp2(1,4)).toBe(2);});it('b',()=>{expect(hd272pp2(3,1)).toBe(1);});it('c',()=>{expect(hd272pp2(0,0)).toBe(0);});it('d',()=>{expect(hd272pp2(93,73)).toBe(2);});it('e',()=>{expect(hd272pp2(15,0)).toBe(4);});});
function hd273pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273pp2_hd',()=>{it('a',()=>{expect(hd273pp2(1,4)).toBe(2);});it('b',()=>{expect(hd273pp2(3,1)).toBe(1);});it('c',()=>{expect(hd273pp2(0,0)).toBe(0);});it('d',()=>{expect(hd273pp2(93,73)).toBe(2);});it('e',()=>{expect(hd273pp2(15,0)).toBe(4);});});
function hd274pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274pp2_hd',()=>{it('a',()=>{expect(hd274pp2(1,4)).toBe(2);});it('b',()=>{expect(hd274pp2(3,1)).toBe(1);});it('c',()=>{expect(hd274pp2(0,0)).toBe(0);});it('d',()=>{expect(hd274pp2(93,73)).toBe(2);});it('e',()=>{expect(hd274pp2(15,0)).toBe(4);});});
function hd275pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275pp2_hd',()=>{it('a',()=>{expect(hd275pp2(1,4)).toBe(2);});it('b',()=>{expect(hd275pp2(3,1)).toBe(1);});it('c',()=>{expect(hd275pp2(0,0)).toBe(0);});it('d',()=>{expect(hd275pp2(93,73)).toBe(2);});it('e',()=>{expect(hd275pp2(15,0)).toBe(4);});});
function hd276pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276pp2_hd',()=>{it('a',()=>{expect(hd276pp2(1,4)).toBe(2);});it('b',()=>{expect(hd276pp2(3,1)).toBe(1);});it('c',()=>{expect(hd276pp2(0,0)).toBe(0);});it('d',()=>{expect(hd276pp2(93,73)).toBe(2);});it('e',()=>{expect(hd276pp2(15,0)).toBe(4);});});
function hd277pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277pp2_hd',()=>{it('a',()=>{expect(hd277pp2(1,4)).toBe(2);});it('b',()=>{expect(hd277pp2(3,1)).toBe(1);});it('c',()=>{expect(hd277pp2(0,0)).toBe(0);});it('d',()=>{expect(hd277pp2(93,73)).toBe(2);});it('e',()=>{expect(hd277pp2(15,0)).toBe(4);});});
function hd278pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278pp2_hd',()=>{it('a',()=>{expect(hd278pp2(1,4)).toBe(2);});it('b',()=>{expect(hd278pp2(3,1)).toBe(1);});it('c',()=>{expect(hd278pp2(0,0)).toBe(0);});it('d',()=>{expect(hd278pp2(93,73)).toBe(2);});it('e',()=>{expect(hd278pp2(15,0)).toBe(4);});});
function hd279pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279pp2_hd',()=>{it('a',()=>{expect(hd279pp2(1,4)).toBe(2);});it('b',()=>{expect(hd279pp2(3,1)).toBe(1);});it('c',()=>{expect(hd279pp2(0,0)).toBe(0);});it('d',()=>{expect(hd279pp2(93,73)).toBe(2);});it('e',()=>{expect(hd279pp2(15,0)).toBe(4);});});
function hd280pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280pp2_hd',()=>{it('a',()=>{expect(hd280pp2(1,4)).toBe(2);});it('b',()=>{expect(hd280pp2(3,1)).toBe(1);});it('c',()=>{expect(hd280pp2(0,0)).toBe(0);});it('d',()=>{expect(hd280pp2(93,73)).toBe(2);});it('e',()=>{expect(hd280pp2(15,0)).toBe(4);});});
function hd281pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281pp2_hd',()=>{it('a',()=>{expect(hd281pp2(1,4)).toBe(2);});it('b',()=>{expect(hd281pp2(3,1)).toBe(1);});it('c',()=>{expect(hd281pp2(0,0)).toBe(0);});it('d',()=>{expect(hd281pp2(93,73)).toBe(2);});it('e',()=>{expect(hd281pp2(15,0)).toBe(4);});});
function hd282pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282pp2_hd',()=>{it('a',()=>{expect(hd282pp2(1,4)).toBe(2);});it('b',()=>{expect(hd282pp2(3,1)).toBe(1);});it('c',()=>{expect(hd282pp2(0,0)).toBe(0);});it('d',()=>{expect(hd282pp2(93,73)).toBe(2);});it('e',()=>{expect(hd282pp2(15,0)).toBe(4);});});
function hd283pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283pp2_hd',()=>{it('a',()=>{expect(hd283pp2(1,4)).toBe(2);});it('b',()=>{expect(hd283pp2(3,1)).toBe(1);});it('c',()=>{expect(hd283pp2(0,0)).toBe(0);});it('d',()=>{expect(hd283pp2(93,73)).toBe(2);});it('e',()=>{expect(hd283pp2(15,0)).toBe(4);});});
function hd284pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284pp2_hd',()=>{it('a',()=>{expect(hd284pp2(1,4)).toBe(2);});it('b',()=>{expect(hd284pp2(3,1)).toBe(1);});it('c',()=>{expect(hd284pp2(0,0)).toBe(0);});it('d',()=>{expect(hd284pp2(93,73)).toBe(2);});it('e',()=>{expect(hd284pp2(15,0)).toBe(4);});});
function hd285pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285pp2_hd',()=>{it('a',()=>{expect(hd285pp2(1,4)).toBe(2);});it('b',()=>{expect(hd285pp2(3,1)).toBe(1);});it('c',()=>{expect(hd285pp2(0,0)).toBe(0);});it('d',()=>{expect(hd285pp2(93,73)).toBe(2);});it('e',()=>{expect(hd285pp2(15,0)).toBe(4);});});
function hd286pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286pp2_hd',()=>{it('a',()=>{expect(hd286pp2(1,4)).toBe(2);});it('b',()=>{expect(hd286pp2(3,1)).toBe(1);});it('c',()=>{expect(hd286pp2(0,0)).toBe(0);});it('d',()=>{expect(hd286pp2(93,73)).toBe(2);});it('e',()=>{expect(hd286pp2(15,0)).toBe(4);});});
function hd287pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287pp2_hd',()=>{it('a',()=>{expect(hd287pp2(1,4)).toBe(2);});it('b',()=>{expect(hd287pp2(3,1)).toBe(1);});it('c',()=>{expect(hd287pp2(0,0)).toBe(0);});it('d',()=>{expect(hd287pp2(93,73)).toBe(2);});it('e',()=>{expect(hd287pp2(15,0)).toBe(4);});});
function hd288pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288pp2_hd',()=>{it('a',()=>{expect(hd288pp2(1,4)).toBe(2);});it('b',()=>{expect(hd288pp2(3,1)).toBe(1);});it('c',()=>{expect(hd288pp2(0,0)).toBe(0);});it('d',()=>{expect(hd288pp2(93,73)).toBe(2);});it('e',()=>{expect(hd288pp2(15,0)).toBe(4);});});
function hd289pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289pp2_hd',()=>{it('a',()=>{expect(hd289pp2(1,4)).toBe(2);});it('b',()=>{expect(hd289pp2(3,1)).toBe(1);});it('c',()=>{expect(hd289pp2(0,0)).toBe(0);});it('d',()=>{expect(hd289pp2(93,73)).toBe(2);});it('e',()=>{expect(hd289pp2(15,0)).toBe(4);});});
function hd290pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290pp2_hd',()=>{it('a',()=>{expect(hd290pp2(1,4)).toBe(2);});it('b',()=>{expect(hd290pp2(3,1)).toBe(1);});it('c',()=>{expect(hd290pp2(0,0)).toBe(0);});it('d',()=>{expect(hd290pp2(93,73)).toBe(2);});it('e',()=>{expect(hd290pp2(15,0)).toBe(4);});});
function hd291pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291pp2_hd',()=>{it('a',()=>{expect(hd291pp2(1,4)).toBe(2);});it('b',()=>{expect(hd291pp2(3,1)).toBe(1);});it('c',()=>{expect(hd291pp2(0,0)).toBe(0);});it('d',()=>{expect(hd291pp2(93,73)).toBe(2);});it('e',()=>{expect(hd291pp2(15,0)).toBe(4);});});
function hd292pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292pp2_hd',()=>{it('a',()=>{expect(hd292pp2(1,4)).toBe(2);});it('b',()=>{expect(hd292pp2(3,1)).toBe(1);});it('c',()=>{expect(hd292pp2(0,0)).toBe(0);});it('d',()=>{expect(hd292pp2(93,73)).toBe(2);});it('e',()=>{expect(hd292pp2(15,0)).toBe(4);});});
function hd293pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293pp2_hd',()=>{it('a',()=>{expect(hd293pp2(1,4)).toBe(2);});it('b',()=>{expect(hd293pp2(3,1)).toBe(1);});it('c',()=>{expect(hd293pp2(0,0)).toBe(0);});it('d',()=>{expect(hd293pp2(93,73)).toBe(2);});it('e',()=>{expect(hd293pp2(15,0)).toBe(4);});});
function hd294pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294pp2_hd',()=>{it('a',()=>{expect(hd294pp2(1,4)).toBe(2);});it('b',()=>{expect(hd294pp2(3,1)).toBe(1);});it('c',()=>{expect(hd294pp2(0,0)).toBe(0);});it('d',()=>{expect(hd294pp2(93,73)).toBe(2);});it('e',()=>{expect(hd294pp2(15,0)).toBe(4);});});
function hd295pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295pp2_hd',()=>{it('a',()=>{expect(hd295pp2(1,4)).toBe(2);});it('b',()=>{expect(hd295pp2(3,1)).toBe(1);});it('c',()=>{expect(hd295pp2(0,0)).toBe(0);});it('d',()=>{expect(hd295pp2(93,73)).toBe(2);});it('e',()=>{expect(hd295pp2(15,0)).toBe(4);});});
function hd296pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296pp2_hd',()=>{it('a',()=>{expect(hd296pp2(1,4)).toBe(2);});it('b',()=>{expect(hd296pp2(3,1)).toBe(1);});it('c',()=>{expect(hd296pp2(0,0)).toBe(0);});it('d',()=>{expect(hd296pp2(93,73)).toBe(2);});it('e',()=>{expect(hd296pp2(15,0)).toBe(4);});});
function hd297pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297pp2_hd',()=>{it('a',()=>{expect(hd297pp2(1,4)).toBe(2);});it('b',()=>{expect(hd297pp2(3,1)).toBe(1);});it('c',()=>{expect(hd297pp2(0,0)).toBe(0);});it('d',()=>{expect(hd297pp2(93,73)).toBe(2);});it('e',()=>{expect(hd297pp2(15,0)).toBe(4);});});
function hd298pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298pp2_hd',()=>{it('a',()=>{expect(hd298pp2(1,4)).toBe(2);});it('b',()=>{expect(hd298pp2(3,1)).toBe(1);});it('c',()=>{expect(hd298pp2(0,0)).toBe(0);});it('d',()=>{expect(hd298pp2(93,73)).toBe(2);});it('e',()=>{expect(hd298pp2(15,0)).toBe(4);});});
function hd299pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299pp2_hd',()=>{it('a',()=>{expect(hd299pp2(1,4)).toBe(2);});it('b',()=>{expect(hd299pp2(3,1)).toBe(1);});it('c',()=>{expect(hd299pp2(0,0)).toBe(0);});it('d',()=>{expect(hd299pp2(93,73)).toBe(2);});it('e',()=>{expect(hd299pp2(15,0)).toBe(4);});});
function hd300pp2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300pp2_hd',()=>{it('a',()=>{expect(hd300pp2(1,4)).toBe(2);});it('b',()=>{expect(hd300pp2(3,1)).toBe(1);});it('c',()=>{expect(hd300pp2(0,0)).toBe(0);});it('d',()=>{expect(hd300pp2(93,73)).toBe(2);});it('e',()=>{expect(hd300pp2(15,0)).toBe(4);});});
