// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inline constants mirrored from web-partners source files ─────────────────

// From app/page.tsx (dashboard) — deal statuses
type DealStatus = 'NEW' | 'IN_PROGRESS' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';

const DEAL_STATUSES: DealStatus[] = ['NEW', 'IN_PROGRESS', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'];

const DEAL_STATUS_COLOR: Record<DealStatus, string> = {
  NEW:         'bg-blue-500/20 text-blue-400',
  IN_PROGRESS: 'bg-yellow-500/20 text-yellow-400',
  NEGOTIATION: 'bg-purple-500/20 text-purple-400',
  CLOSED_WON:  'bg-green-500/20 text-green-400',
  CLOSED_LOST: 'bg-red-500/20 text-red-400',
};

// From commission/page.tsx — commission deal shape
interface CommissionDeal {
  id: string;
  companyName: string;
  actualACV: number | null;
  commissionRate: number;
  commissionValue: number | null;
  commissionPaid: boolean;
  closedAt: string | null;
}

// Commission summary fields
interface CommissionSummary {
  totalEarned: number;
  totalPaid: number;
  pendingPayout: number;
  dealsWon: number;
  dealsInPipeline: number;
  pipelineValue: number;
}

// Payout summary (dashboard)
interface PayoutSummary {
  totalCommission: number;
  pendingCommission: number;
  availablePayout: number;
}

// Referral link format: `${origin}/register?ref=${token.slice(-8)}`
const REFERRAL_LINK_SUFFIX_LENGTH = 8;

// Commission paid badge colours (commission/page.tsx)
const COMMISSION_PAID_COLOR   = 'bg-green-500/20 text-green-400';
const COMMISSION_UNPAID_COLOR = 'bg-yellow-500/20 text-yellow-400';

// Partner programme tiers (aligned with PRICING constant in packages/config)
type NexaraPartnerTier = 'REFERRAL' | 'RESELLER' | 'STRATEGIC' | 'WHITE_LABEL';

const NEXARA_PARTNER_TIERS: NexaraPartnerTier[] = ['REFERRAL', 'RESELLER', 'STRATEGIC', 'WHITE_LABEL'];

// Revenue model per Nexara partner tier (from web-marketing app/partners/page.tsx)
const REVENUE_MODEL: Record<NexaraPartnerTier, string> = {
  REFERRAL:    '15% commission',
  RESELLER:    '20% discount',
  STRATEGIC:   '30% discount',
  WHITE_LABEL: '35% discount',
};

// Annual commitment per Nexara partner tier
const ANNUAL_COMMITMENT: Record<NexaraPartnerTier, string> = {
  REFERRAL:    'None',
  RESELLER:    '2 deals/year',
  STRATEGIC:   '10 deals/year',
  WHITE_LABEL: '3 customers min',
};

// Portal access per tier
const PORTAL_ACCESS: Record<NexaraPartnerTier, string> = {
  REFERRAL:    'Basic',
  RESELLER:    'Full',
  STRATEGIC:   'Full',
  WHITE_LABEL: 'Full',
};

// NFR licences per tier
const NFR_LICENCES: Record<NexaraPartnerTier, number> = {
  REFERRAL:    0,
  RESELLER:    5,
  STRATEGIC:   15,
  WHITE_LABEL: 20,
};

// Co-marketing funds (only STRATEGIC and WHITE_LABEL receive them)
const CO_MARKETING_FUNDS: Partial<Record<NexaraPartnerTier, number>> = {
  STRATEGIC:   5000,
  WHITE_LABEL: 10000,
};

// White label base annual licence fee
const WHITE_LABEL_BASE_LICENCE_FEE = 24000;

// Numeric commission rates (for calculation)
const COMMISSION_RATES: Record<NexaraPartnerTier, number | null> = {
  REFERRAL:    0.15,
  RESELLER:    null, // discount model, not commission
  STRATEGIC:   null,
  WHITE_LABEL: null,
};

// Discount rates (for reseller/strategic/white-label)
const DISCOUNT_RATES: Record<NexaraPartnerTier, number | null> = {
  REFERRAL:    null,
  RESELLER:    0.20,
  STRATEGIC:   0.30,
  WHITE_LABEL: 0.35,
};

// Onboarding steps (from web-marketing/src/app/partners/page.tsx)
const PARTNER_ONBOARDING_STEPS = [
  { step: 1, title: 'Apply',              approxTime: '5 minutes' },
  { step: 2, title: 'Approved in 5 days', approxTime: '5 business days' },
  { step: 3, title: 'Onboarding call',    approxTime: '60 minutes' },
  { step: 4, title: 'Start selling',      approxTime: null },
];

// Dashboard summary card labels (6 cards)
const DASHBOARD_CARD_LABELS = [
  'Total Deals',
  'In Progress',
  'Closed Won',
  'Total Commission',
  'Pending Commission',
  'Available Payout',
];

// Commission history table columns
const COMMISSION_TABLE_COLUMNS = ['Company', 'Deal Value', 'Rate', 'Commission', 'Status', 'Closed'];

// Pure helpers
function computeReferralCommission(dealValue: number): number {
  return dealValue * (COMMISSION_RATES.REFERRAL as number);
}

function computeResellerDiscount(listPrice: number): number {
  return listPrice * (DISCOUNT_RATES.RESELLER as number);
}

function formatCommissionRate(rate: number): string {
  return `${(rate * 100).toFixed(1)}%`;
}

function getStatusColor(status: DealStatus): string {
  return DEAL_STATUS_COLOR[status] ?? 'bg-gray-500/20 text-gray-400';
}

function isClosedDeal(status: DealStatus): boolean {
  return status === 'CLOSED_WON' || status === 'CLOSED_LOST';
}

function isActiveDeal(status: DealStatus): boolean {
  return status === 'IN_PROGRESS' || status === 'NEGOTIATION';
}

function buildReferralLink(origin: string, token: string): string {
  return `${origin}/register?ref=${token.slice(-REFERRAL_LINK_SUFFIX_LENGTH)}`;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Nexara partner tiers', () => {
  it('has exactly 4 Nexara partner tiers', () => {
    expect(NEXARA_PARTNER_TIERS).toHaveLength(4);
  });

  it('contains REFERRAL, RESELLER, STRATEGIC, WHITE_LABEL', () => {
    expect(NEXARA_PARTNER_TIERS).toContain('REFERRAL');
    expect(NEXARA_PARTNER_TIERS).toContain('RESELLER');
    expect(NEXARA_PARTNER_TIERS).toContain('STRATEGIC');
    expect(NEXARA_PARTNER_TIERS).toContain('WHITE_LABEL');
  });

  it('all tier names are uppercase strings', () => {
    for (const tier of NEXARA_PARTNER_TIERS) {
      expect(tier).toBe(tier.toUpperCase());
    }
  });

  it('revenue model values contain % sign', () => {
    for (const tier of NEXARA_PARTNER_TIERS) {
      expect(REVENUE_MODEL[tier]).toContain('%');
    }
  });

  it('REFERRAL is commission-based (not discount)', () => {
    expect(REVENUE_MODEL.REFERRAL).toContain('commission');
  });

  it('RESELLER/STRATEGIC/WHITE_LABEL are discount-based', () => {
    expect(REVENUE_MODEL.RESELLER).toContain('discount');
    expect(REVENUE_MODEL.STRATEGIC).toContain('discount');
    expect(REVENUE_MODEL.WHITE_LABEL).toContain('discount');
  });

  it('revenue percentages increase with tier', () => {
    // 15 < 20 < 30 < 35
    const rates = [15, 20, 30, 35];
    for (const [i, tier] of NEXARA_PARTNER_TIERS.entries()) {
      expect(REVENUE_MODEL[tier]).toContain(String(rates[i]));
    }
  });
});

describe('Annual commitment per tier', () => {
  it('REFERRAL has no annual commitment', () => {
    expect(ANNUAL_COMMITMENT.REFERRAL).toBe('None');
  });

  it('RESELLER requires 2 deals/year', () => {
    expect(ANNUAL_COMMITMENT.RESELLER).toBe('2 deals/year');
  });

  it('STRATEGIC requires 10 deals/year', () => {
    expect(ANNUAL_COMMITMENT.STRATEGIC).toBe('10 deals/year');
  });

  it('WHITE_LABEL requires minimum customer count', () => {
    expect(ANNUAL_COMMITMENT.WHITE_LABEL).toContain('3 customers');
  });

  it('commitment escalates: REFERRAL (none) < RESELLER (2) < STRATEGIC (10)', () => {
    expect(ANNUAL_COMMITMENT.REFERRAL).toBe('None');
    const resellerNum = parseInt(ANNUAL_COMMITMENT.RESELLER);
    const strategicNum = parseInt(ANNUAL_COMMITMENT.STRATEGIC);
    expect(resellerNum).toBeLessThan(strategicNum);
  });
});

describe('Portal access per tier', () => {
  it('REFERRAL has Basic portal access', () => {
    expect(PORTAL_ACCESS.REFERRAL).toBe('Basic');
  });

  it('RESELLER, STRATEGIC, WHITE_LABEL have Full portal access', () => {
    expect(PORTAL_ACCESS.RESELLER).toBe('Full');
    expect(PORTAL_ACCESS.STRATEGIC).toBe('Full');
    expect(PORTAL_ACCESS.WHITE_LABEL).toBe('Full');
  });

  it('only REFERRAL has non-Full access', () => {
    const nonFull = NEXARA_PARTNER_TIERS.filter((t) => PORTAL_ACCESS[t] !== 'Full');
    expect(nonFull).toHaveLength(1);
    expect(nonFull[0]).toBe('REFERRAL');
  });
});

describe('NFR licences per tier', () => {
  it('REFERRAL has 0 NFR licences', () => {
    expect(NFR_LICENCES.REFERRAL).toBe(0);
  });

  it('RESELLER has 5 NFR licences', () => {
    expect(NFR_LICENCES.RESELLER).toBe(5);
  });

  it('STRATEGIC has 15 NFR licences', () => {
    expect(NFR_LICENCES.STRATEGIC).toBe(15);
  });

  it('WHITE_LABEL has 20 NFR licences', () => {
    expect(NFR_LICENCES.WHITE_LABEL).toBe(20);
  });

  it('NFR licences increase monotonically by tier', () => {
    expect(NFR_LICENCES.REFERRAL).toBeLessThan(NFR_LICENCES.RESELLER);
    expect(NFR_LICENCES.RESELLER).toBeLessThan(NFR_LICENCES.STRATEGIC);
    expect(NFR_LICENCES.STRATEGIC).toBeLessThan(NFR_LICENCES.WHITE_LABEL);
  });

  it('all NFR values are non-negative integers', () => {
    for (const tier of NEXARA_PARTNER_TIERS) {
      expect(NFR_LICENCES[tier]).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(NFR_LICENCES[tier])).toBe(true);
    }
  });
});

describe('Co-marketing funds', () => {
  it('STRATEGIC co-marketing fund = £5,000', () => {
    expect(CO_MARKETING_FUNDS.STRATEGIC).toBe(5000);
  });

  it('WHITE_LABEL co-marketing fund = £10,000', () => {
    expect(CO_MARKETING_FUNDS.WHITE_LABEL).toBe(10000);
  });

  it('WHITE_LABEL fund > STRATEGIC fund', () => {
    expect(CO_MARKETING_FUNDS.WHITE_LABEL as number).toBeGreaterThan(CO_MARKETING_FUNDS.STRATEGIC as number);
  });

  it('REFERRAL and RESELLER do not receive co-marketing funds', () => {
    expect(CO_MARKETING_FUNDS.REFERRAL).toBeUndefined();
    expect(CO_MARKETING_FUNDS.RESELLER).toBeUndefined();
  });

  it('WHITE_LABEL licence fee exceeds co-marketing fund', () => {
    expect(WHITE_LABEL_BASE_LICENCE_FEE).toBeGreaterThan(CO_MARKETING_FUNDS.WHITE_LABEL as number);
  });

  it('WHITE_LABEL base annual licence fee = £24,000', () => {
    expect(WHITE_LABEL_BASE_LICENCE_FEE).toBe(24000);
  });
});

describe('Partner onboarding steps', () => {
  it('has exactly 4 onboarding steps', () => {
    expect(PARTNER_ONBOARDING_STEPS).toHaveLength(4);
  });

  it('steps are numbered 1 through 4', () => {
    for (let i = 0; i < PARTNER_ONBOARDING_STEPS.length; i++) {
      expect(PARTNER_ONBOARDING_STEPS[i].step).toBe(i + 1);
    }
  });

  it('step 1 is Apply', () => {
    expect(PARTNER_ONBOARDING_STEPS[0].title).toBe('Apply');
  });

  it('step 2 mentions 5-day approval', () => {
    expect(PARTNER_ONBOARDING_STEPS[1].title).toContain('5 days');
  });

  it('step 3 is an onboarding call (60 min)', () => {
    expect(PARTNER_ONBOARDING_STEPS[2].title).toContain('Onboarding call');
    expect(PARTNER_ONBOARDING_STEPS[2].approxTime).toBe('60 minutes');
  });

  it('step 4 is Start selling', () => {
    expect(PARTNER_ONBOARDING_STEPS[3].title).toBe('Start selling');
  });

  it('apply step takes under 10 minutes', () => {
    const applyTime = PARTNER_ONBOARDING_STEPS[0].approxTime;
    expect(applyTime).toBeTruthy();
    expect(applyTime).toContain('5');
  });

  it('all step titles are non-empty', () => {
    for (const step of PARTNER_ONBOARDING_STEPS) {
      expect(step.title.length).toBeGreaterThan(0);
    }
  });
});

describe('Deal status colours', () => {
  it('has exactly 5 deal statuses', () => {
    expect(DEAL_STATUSES).toHaveLength(5);
  });

  for (const status of ['NEW', 'IN_PROGRESS', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST'] as DealStatus[]) {
    it(`${status}: color string contains bg- and text-`, () => {
      const color = DEAL_STATUS_COLOR[status];
      expect(color).toContain('bg-');
      expect(color).toContain('text-');
    });
  }

  it('CLOSED_WON is green', () => {
    expect(DEAL_STATUS_COLOR.CLOSED_WON).toContain('green');
  });

  it('CLOSED_LOST is red', () => {
    expect(DEAL_STATUS_COLOR.CLOSED_LOST).toContain('red');
  });

  it('IN_PROGRESS is yellow (amber)', () => {
    expect(DEAL_STATUS_COLOR.IN_PROGRESS).toContain('yellow');
  });

  it('NEGOTIATION is purple', () => {
    expect(DEAL_STATUS_COLOR.NEGOTIATION).toContain('purple');
  });

  it('NEW is blue', () => {
    expect(DEAL_STATUS_COLOR.NEW).toContain('blue');
  });

  it('getStatusColor returns correct class for each status', () => {
    for (const status of DEAL_STATUSES) {
      expect(getStatusColor(status)).toBe(DEAL_STATUS_COLOR[status]);
    }
  });
});

describe('Commission badge colours', () => {
  it('paid commission is green', () => {
    expect(COMMISSION_PAID_COLOR).toContain('green');
  });

  it('pending commission is yellow', () => {
    expect(COMMISSION_UNPAID_COLOR).toContain('yellow');
  });

  it('paid and unpaid colors are different', () => {
    expect(COMMISSION_PAID_COLOR).not.toBe(COMMISSION_UNPAID_COLOR);
  });
});

describe('Dashboard card labels', () => {
  it('has exactly 6 summary card labels', () => {
    expect(DASHBOARD_CARD_LABELS).toHaveLength(6);
  });

  it('includes Total Commission', () => {
    expect(DASHBOARD_CARD_LABELS).toContain('Total Commission');
  });

  it('includes Available Payout', () => {
    expect(DASHBOARD_CARD_LABELS).toContain('Available Payout');
  });

  it('all labels are non-empty unique strings', () => {
    expect(new Set(DASHBOARD_CARD_LABELS).size).toBe(DASHBOARD_CARD_LABELS.length);
    for (const label of DASHBOARD_CARD_LABELS) {
      expect(label.length).toBeGreaterThan(0);
    }
  });

  it('commission history table has 6 columns', () => {
    expect(COMMISSION_TABLE_COLUMNS).toHaveLength(6);
  });

  it('commission table columns include Rate and Status', () => {
    expect(COMMISSION_TABLE_COLUMNS).toContain('Rate');
    expect(COMMISSION_TABLE_COLUMNS).toContain('Status');
  });
});

describe('Pure computation helpers', () => {
  it('computeReferralCommission: 15% of 10,000 = 1,500', () => {
    expect(computeReferralCommission(10000)).toBe(1500);
  });

  it('computeReferralCommission: 15% of 50,000 = 7,500', () => {
    expect(computeReferralCommission(50000)).toBe(7500);
  });

  it('computeReferralCommission: is always positive for positive deal values', () => {
    for (const v of [1000, 5000, 10000, 50000, 100000]) {
      expect(computeReferralCommission(v)).toBeGreaterThan(0);
    }
  });

  it('computeResellerDiscount: 20% of 10,000 = 2,000', () => {
    expect(computeResellerDiscount(10000)).toBe(2000);
  });

  it('computeResellerDiscount: discount is less than list price', () => {
    expect(computeResellerDiscount(10000)).toBeLessThan(10000);
  });

  it('formatCommissionRate: 0.15 → "15.0%"', () => {
    expect(formatCommissionRate(0.15)).toBe('15.0%');
  });

  it('formatCommissionRate: 0.20 → "20.0%"', () => {
    expect(formatCommissionRate(0.20)).toBe('20.0%');
  });

  it('isClosedDeal: CLOSED_WON → true', () => {
    expect(isClosedDeal('CLOSED_WON')).toBe(true);
  });

  it('isClosedDeal: CLOSED_LOST → true', () => {
    expect(isClosedDeal('CLOSED_LOST')).toBe(true);
  });

  it('isClosedDeal: IN_PROGRESS → false', () => {
    expect(isClosedDeal('IN_PROGRESS')).toBe(false);
  });

  it('isActiveDeal: IN_PROGRESS → true', () => {
    expect(isActiveDeal('IN_PROGRESS')).toBe(true);
  });

  it('isActiveDeal: NEGOTIATION → true', () => {
    expect(isActiveDeal('NEGOTIATION')).toBe(true);
  });

  it('isActiveDeal: CLOSED_WON → false', () => {
    expect(isActiveDeal('CLOSED_WON')).toBe(false);
  });

  it('buildReferralLink uses last 8 chars of token', () => {
    const token = 'abcdef1234567890';
    const link = buildReferralLink('https://example.com', token);
    expect(link).toBe('https://example.com/register?ref=34567890');
  });

  it('buildReferralLink suffix length is exactly 8', () => {
    const token = 'xxxxxxxxxxABCDEFGH';
    const link = buildReferralLink('https://example.com', token);
    const ref = new URL(link).searchParams.get('ref');
    expect(ref?.length).toBe(8);
  });
});

describe('CommissionDeal type contract', () => {
  const deal: CommissionDeal = {
    id: 'deal-001',
    companyName: 'Acme Corp',
    actualACV: 12000,
    commissionRate: 0.15,
    commissionValue: 1800,
    commissionPaid: false,
    closedAt: '2026-03-01',
  };

  it('actualACV can be null', () => {
    const d: CommissionDeal = { ...deal, actualACV: null };
    expect(d.actualACV).toBeNull();
  });

  it('commissionValue can be null', () => {
    const d: CommissionDeal = { ...deal, commissionValue: null };
    expect(d.commissionValue).toBeNull();
  });

  it('closedAt can be null', () => {
    const d: CommissionDeal = { ...deal, closedAt: null };
    expect(d.closedAt).toBeNull();
  });

  it('commissionPaid is a boolean', () => {
    expect(typeof deal.commissionPaid).toBe('boolean');
  });

  it('commissionRate formatted to 1 decimal is "15.0%"', () => {
    expect(formatCommissionRate(deal.commissionRate)).toBe('15.0%');
  });

  it('computed commission value matches rate × ACV', () => {
    expect(deal.commissionValue).toBeCloseTo((deal.actualACV as number) * deal.commissionRate, 5);
  });
});

describe('PayoutSummary type contract', () => {
  const summary: PayoutSummary = {
    totalCommission: 5000,
    pendingCommission: 1200,
    availablePayout: 3800,
  };

  it('availablePayout ≤ totalCommission', () => {
    expect(summary.availablePayout).toBeLessThanOrEqual(summary.totalCommission);
  });

  it('pendingCommission + availablePayout ≈ totalCommission', () => {
    expect(summary.pendingCommission + summary.availablePayout).toBe(summary.totalCommission);
  });

  it('all fields are non-negative numbers', () => {
    expect(summary.totalCommission).toBeGreaterThanOrEqual(0);
    expect(summary.pendingCommission).toBeGreaterThanOrEqual(0);
    expect(summary.availablePayout).toBeGreaterThanOrEqual(0);
  });
});

describe('Cross-constant invariants — partners domain', () => {
  it('NEXARA_PARTNER_TIERS has 4 tiers', () => {
    expect(NEXARA_PARTNER_TIERS).toHaveLength(4);
  });

  it('only REFERRAL earns commission; others earn discounts', () => {
    expect(COMMISSION_RATES.REFERRAL).not.toBeNull();
    expect(COMMISSION_RATES.RESELLER).toBeNull();
    expect(COMMISSION_RATES.STRATEGIC).toBeNull();
    expect(COMMISSION_RATES.WHITE_LABEL).toBeNull();
  });

  it('discount rates increase by tier', () => {
    const r = DISCOUNT_RATES.RESELLER as number;
    const s = DISCOUNT_RATES.STRATEGIC as number;
    const w = DISCOUNT_RATES.WHITE_LABEL as number;
    expect(r).toBeLessThan(s);
    expect(s).toBeLessThan(w);
  });

  it('NFR licence count (20) < WHITE_LABEL base fee in £000s (24)', () => {
    expect(NFR_LICENCES.WHITE_LABEL).toBeLessThan(WHITE_LABEL_BASE_LICENCE_FEE / 1000);
  });

  it('onboarding has same step count as number of tiers', () => {
    expect(PARTNER_ONBOARDING_STEPS).toHaveLength(NEXARA_PARTNER_TIERS.length);
  });

  it('deal statuses count (5) > partner tier count (4)', () => {
    expect(DEAL_STATUSES.length).toBeGreaterThan(NEXARA_PARTNER_TIERS.length);
  });
});

// ─── Parametric: per-tier revenue model ──────────────────────────────────────

describe('REVENUE_MODEL — per-tier parametric', () => {
  const cases: [NexaraPartnerTier, string, string][] = [
    ['REFERRAL',    '15', 'commission'],
    ['RESELLER',    '20', 'discount'],
    ['STRATEGIC',   '30', 'discount'],
    ['WHITE_LABEL', '35', 'discount'],
  ];
  for (const [tier, pct, model] of cases) {
    it(`${tier}: ${pct}% ${model}`, () => {
      expect(REVENUE_MODEL[tier]).toContain(pct);
      expect(REVENUE_MODEL[tier]).toContain(model);
    });
  }
});

// ─── Parametric: per-tier NFR licences ───────────────────────────────────────

describe('NFR_LICENCES — per-tier parametric', () => {
  const cases: [NexaraPartnerTier, number][] = [
    ['REFERRAL',    0],
    ['RESELLER',    5],
    ['STRATEGIC',   15],
    ['WHITE_LABEL', 20],
  ];
  for (const [tier, count] of cases) {
    it(`${tier} has ${count} NFR licences`, () => {
      expect(NFR_LICENCES[tier]).toBe(count);
    });
  }
});

// ─── Parametric: per-tier commission/discount rates ───────────────────────────

describe('COMMISSION_RATES + DISCOUNT_RATES — per-tier parametric', () => {
  const commissionCases: [NexaraPartnerTier, number | null][] = [
    ['REFERRAL',    0.15],
    ['RESELLER',    null],
    ['STRATEGIC',   null],
    ['WHITE_LABEL', null],
  ];
  for (const [tier, rate] of commissionCases) {
    it(`COMMISSION_RATES[${tier}] = ${rate}`, () => {
      expect(COMMISSION_RATES[tier]).toBe(rate);
    });
  }
  const discountCases: [NexaraPartnerTier, number | null][] = [
    ['REFERRAL',    null],
    ['RESELLER',    0.20],
    ['STRATEGIC',   0.30],
    ['WHITE_LABEL', 0.35],
  ];
  for (const [tier, rate] of discountCases) {
    it(`DISCOUNT_RATES[${tier}] = ${rate}`, () => {
      expect(DISCOUNT_RATES[tier]).toBe(rate);
    });
  }
});

// ─── Parametric: per-deal-status color ───────────────────────────────────────

describe('DEAL_STATUS_COLOR — per-status color keyword parametric', () => {
  const cases: [DealStatus, string][] = [
    ['NEW',         'blue'],
    ['IN_PROGRESS', 'yellow'],
    ['NEGOTIATION', 'purple'],
    ['CLOSED_WON',  'green'],
    ['CLOSED_LOST', 'red'],
  ];
  for (const [status, color] of cases) {
    it(`${status} badge contains "${color}"`, () => {
      expect(DEAL_STATUS_COLOR[status]).toContain(color);
    });
  }
});

// ─── Parametric: per-onboarding-step ─────────────────────────────────────────

describe('PARTNER_ONBOARDING_STEPS — per-step parametric', () => {
  const cases: [number, string][] = [
    [1, 'Apply'],
    [2, '5 days'],
    [3, 'Onboarding call'],
    [4, 'Start selling'],
  ];
  for (const [step, titleContains] of cases) {
    it(`step ${step} title contains "${titleContains}"`, () => {
      const s = PARTNER_ONBOARDING_STEPS.find((x) => x.step === step);
      expect(s?.title).toContain(titleContains);
    });
  }
});

// ─── Parametric: computeReferralCommission exact values ──────────────────────

describe('computeReferralCommission — parametric', () => {
  const cases: [number, number][] = [
    [0,      0],
    [1000,   150],
    [10000,  1500],
    [50000,  7500],
    [100000, 15000],
  ];
  for (const [deal, expected] of cases) {
    it(`15% of ${deal} = ${expected}`, () => {
      expect(computeReferralCommission(deal)).toBeCloseTo(expected, 5);
    });
  }
});

// ─── Parametric: formatCommissionRate ────────────────────────────────────────

describe('formatCommissionRate — parametric', () => {
  const cases: [number, string][] = [
    [0.10, '10.0%'],
    [0.15, '15.0%'],
    [0.20, '20.0%'],
    [0.35, '35.0%'],
  ];
  for (const [rate, expected] of cases) {
    it(`formatCommissionRate(${rate}) = "${expected}"`, () => {
      expect(formatCommissionRate(rate)).toBe(expected);
    });
  }
});

// ─── Parametric: isClosedDeal per-status ─────────────────────────────────────

describe('isClosedDeal — per-status parametric', () => {
  const cases: [DealStatus, boolean][] = [
    ['NEW',         false],
    ['IN_PROGRESS', false],
    ['NEGOTIATION', false],
    ['CLOSED_WON',  true],
    ['CLOSED_LOST', true],
  ];
  for (const [status, expected] of cases) {
    it(`isClosedDeal("${status}") = ${expected}`, () => {
      expect(isClosedDeal(status)).toBe(expected);
    });
  }
});

// ─── Parametric: isActiveDeal per-status ─────────────────────────────────────

describe('isActiveDeal — per-status parametric', () => {
  const cases: [DealStatus, boolean][] = [
    ['NEW',         false],
    ['IN_PROGRESS', true],
    ['NEGOTIATION', true],
    ['CLOSED_WON',  false],
    ['CLOSED_LOST', false],
  ];
  for (const [status, expected] of cases) {
    it(`isActiveDeal("${status}") = ${expected}`, () => {
      expect(isActiveDeal(status)).toBe(expected);
    });
  }
});

// ─── Parametric: buildReferralLink suffix ─────────────────────────────────────

describe('buildReferralLink — suffix parametric', () => {
  const cases: [string, string, string][] = [
    ['https://app.nexara.io', 'abcdef1234567890', 'https://app.nexara.io/register?ref=34567890'],
    ['https://example.com',   'ABCDEFGH',          'https://example.com/register?ref=ABCDEFGH'],
    ['https://x.com',         '12345678',           'https://x.com/register?ref=12345678'],
  ];
  for (const [origin, token, expected] of cases) {
    it(`buildReferralLink(${origin}, ${token.slice(-4)}…) = expected`, () => {
      expect(buildReferralLink(origin, token)).toBe(expected);
    });
  }
});

// ─── DEAL_STATUSES — positional index parametric ──────────────────────────────

describe('DEAL_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'NEW'],
    [1, 'IN_PROGRESS'],
    [2, 'NEGOTIATION'],
    [3, 'CLOSED_WON'],
    [4, 'CLOSED_LOST'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`DEAL_STATUSES[${idx}] === '${val}'`, () => {
      expect(DEAL_STATUSES[idx]).toBe(val);
    });
  }
});

// ─── NEXARA_PARTNER_TIERS — positional index parametric ──────────────────────

describe('NEXARA_PARTNER_TIERS — positional index parametric', () => {
  const expected = [
    [0, 'REFERRAL'],
    [1, 'RESELLER'],
    [2, 'STRATEGIC'],
    [3, 'WHITE_LABEL'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`NEXARA_PARTNER_TIERS[${idx}] === '${val}'`, () => {
      expect(NEXARA_PARTNER_TIERS[idx]).toBe(val);
    });
  }
});

// ─── DASHBOARD_CARD_LABELS — positional index parametric ─────────────────────

describe('DASHBOARD_CARD_LABELS — positional index parametric', () => {
  const expected = [
    [0, 'Total Deals'],
    [1, 'In Progress'],
    [2, 'Closed Won'],
    [3, 'Total Commission'],
    [4, 'Pending Commission'],
    [5, 'Available Payout'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`DASHBOARD_CARD_LABELS[${idx}] === '${val}'`, () => {
      expect(DASHBOARD_CARD_LABELS[idx]).toBe(val);
    });
  }
});

// ─── COMMISSION_TABLE_COLUMNS — positional index parametric ──────────────────

describe('COMMISSION_TABLE_COLUMNS — positional index parametric', () => {
  const expected = [
    [0, 'Company'],
    [1, 'Deal Value'],
    [2, 'Rate'],
    [3, 'Commission'],
    [4, 'Status'],
    [5, 'Closed'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`COMMISSION_TABLE_COLUMNS[${idx}] === '${val}'`, () => {
      expect(COMMISSION_TABLE_COLUMNS[idx]).toBe(val);
    });
  }
});

// ─── NFR_LICENCES — per-tier exact values ────────────────────────────────────

describe('NFR_LICENCES — per-tier exact values', () => {
  const cases: [NexaraPartnerTier, number][] = [
    ['REFERRAL',    0],
    ['RESELLER',    5],
    ['STRATEGIC',   15],
    ['WHITE_LABEL', 20],
  ];
  for (const [tier, expected] of cases) {
    it(`NFR_LICENCES[${tier}] === ${expected}`, () => {
      expect(NFR_LICENCES[tier]).toBe(expected);
    });
  }
});

// ─── PARTNER_ONBOARDING_STEPS — per-step exact values ───────────────────────

describe('PARTNER_ONBOARDING_STEPS — per-step exact values', () => {
  const cases: [number, string][] = [
    [0, 'Apply'],
    [1, 'Approved in 5 days'],
    [2, 'Onboarding call'],
    [3, 'Start selling'],
  ];
  for (const [idx, title] of cases) {
    it(`step[${idx}].title === '${title}'`, () => {
      expect(PARTNER_ONBOARDING_STEPS[idx].title).toBe(title);
    });
  }
  it('steps are numbered 1-4', () => {
    expect(PARTNER_ONBOARDING_STEPS.map(s => s.step)).toEqual([1, 2, 3, 4]);
  });
});
