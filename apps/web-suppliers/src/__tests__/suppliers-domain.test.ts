// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Domain constants (inlined from source) ───────────────────────────────────

type SupplierStatus =
  | 'PROSPECTIVE'
  | 'APPROVED'
  | 'CONDITIONAL'
  | 'SUSPENDED'
  | 'BLACKLISTED'
  | 'INACTIVE';

type SupplierTier = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

type ScorecardStatus = 'DRAFT' | 'IN_REVIEW' | 'COMPLETED';

type ScorecardDimension = 'quality' | 'delivery' | 'cost' | 'responsiveness' | 'compliance';

const SUPPLIER_STATUSES: SupplierStatus[] = [
  'PROSPECTIVE',
  'APPROVED',
  'CONDITIONAL',
  'SUSPENDED',
  'BLACKLISTED',
  'INACTIVE',
];

const SUPPLIER_TIERS: SupplierTier[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];

const SCORECARD_STATUSES: ScorecardStatus[] = ['DRAFT', 'IN_REVIEW', 'COMPLETED'];

const SCORECARD_DIMENSIONS: ScorecardDimension[] = [
  'quality',
  'delivery',
  'cost',
  'responsiveness',
  'compliance',
];

// ─── Badge / color maps (inlined from client.tsx) ─────────────────────────────

function getStatusColor(status: string): string {
  switch (status) {
    case 'APPROVED':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    case 'CONDITIONAL':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    case 'SUSPENDED':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'BLACKLISTED':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'INACTIVE':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    default:
      // PROSPECTIVE and unknown → blue
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
  }
}

function getTierColor(tier: string): string {
  switch (tier) {
    case 'CRITICAL':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    case 'HIGH':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    default:
      // LOW and unknown → green
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  if (score >= 60) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
  if (score >= 40) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
  return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
}

// ─── Approval workflow helpers ─────────────────────────────────────────────────

function isPending(status: SupplierStatus): boolean {
  return status === 'PROSPECTIVE' || status === 'CONDITIONAL';
}

function isSuspendedOrBlocked(status: SupplierStatus): boolean {
  return status === 'SUSPENDED' || status === 'BLACKLISTED';
}

function canBeApproved(status: SupplierStatus): boolean {
  return status !== 'APPROVED';
}

function canBeSuspended(status: SupplierStatus): boolean {
  return status !== 'SUSPENDED' && status !== 'BLACKLISTED';
}

// ─── Scorecard overall calculation (inlined from calcOverall in client.tsx) ───

function calcOverall(scores: Partial<Record<ScorecardDimension, number>>): number {
  const vals = SCORECARD_DIMENSIONS
    .map((d) => scores[d] ?? 0)
    .filter((v) => v > 0);
  if (vals.length === 0) return 0;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

// ─── Spend / risk helpers ──────────────────────────────────────────────────────

function formatAnnualSpend(value: number): string {
  if (value >= 1_000_000) return `£${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `£${(value / 1_000).toFixed(0)}K`;
  return `£${value}`;
}

function spendRiskBand(annualSpend: number, tier: SupplierTier): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (tier === 'CRITICAL') return 'CRITICAL';
  if (tier === 'HIGH' || annualSpend >= 500_000) return 'HIGH';
  if (tier === 'MEDIUM' || annualSpend >= 100_000) return 'MEDIUM';
  return 'LOW';
}

function underscoreToLabel(value: string): string {
  return value.replace(/_/g, ' ');
}

// ─── Mock data ─────────────────────────────────────────────────────────────────

interface MockSupplier {
  id: string;
  referenceNumber: string;
  name: string;
  tradingName: string;
  registrationNo: string;
  vatNumber: string;
  status: SupplierStatus;
  tier: SupplierTier;
  category: string;
  primaryContact: string;
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  city: string;
  postcode: string;
  country: string;
  notes: string;
  approvedDate: string | null;
  reviewDate: string | null;
  annualSpend: number;
  paymentTerms: string;
  tags: string[];
  createdAt: string;
}

const MOCK_SUPPLIERS: MockSupplier[] = [
  {
    id: 'sup-001',
    referenceNumber: 'SUP-2026-001',
    name: 'Acme Components Ltd',
    tradingName: 'Acme',
    registrationNo: 'GB123456',
    vatNumber: 'GB987654321',
    status: 'APPROVED',
    tier: 'CRITICAL',
    category: 'Manufacturing',
    primaryContact: 'Jane Smith',
    email: 'jane@acme.com',
    phone: '+44 20 1234 5678',
    website: 'https://acme.com',
    addressLine1: '10 Industrial Way',
    city: 'Birmingham',
    postcode: 'B1 1AA',
    country: 'UK',
    notes: 'ISO 9001 certified',
    approvedDate: '2025-01-15T00:00:00.000Z',
    reviewDate: '2026-01-15T00:00:00.000Z',
    annualSpend: 750000,
    paymentTerms: 'Net 30',
    tags: ['preferred', 'iso-certified'],
    createdAt: '2024-12-01T00:00:00.000Z',
  },
  {
    id: 'sup-002',
    referenceNumber: 'SUP-2026-002',
    name: 'Beta Logistics PLC',
    tradingName: 'Beta Log',
    registrationNo: 'GB654321',
    vatNumber: 'GB111222333',
    status: 'PROSPECTIVE',
    tier: 'HIGH',
    category: 'Logistics',
    primaryContact: 'Tom Brown',
    email: 'tom@betalog.co.uk',
    phone: '+44 161 555 0000',
    website: 'https://betalog.co.uk',
    addressLine1: '5 Warehouse Rd',
    city: 'Manchester',
    postcode: 'M1 1BB',
    country: 'UK',
    notes: '',
    approvedDate: null,
    reviewDate: null,
    annualSpend: 120000,
    paymentTerms: 'Net 45',
    tags: [],
    createdAt: '2025-06-01T00:00:00.000Z',
  },
  {
    id: 'sup-003',
    referenceNumber: 'SUP-2026-003',
    name: 'Gamma IT Solutions',
    tradingName: 'Gamma IT',
    registrationNo: 'GB999888',
    vatNumber: 'GB444555666',
    status: 'CONDITIONAL',
    tier: 'MEDIUM',
    category: 'IT',
    primaryContact: 'Sara Lee',
    email: 'sara@gammait.com',
    phone: '+44 113 777 8888',
    website: 'https://gammait.com',
    addressLine1: '20 Tech Park',
    city: 'Leeds',
    postcode: 'LS1 1CC',
    country: 'UK',
    notes: 'Pending ISO 27001 certification',
    approvedDate: null,
    reviewDate: '2026-06-01T00:00:00.000Z',
    annualSpend: 55000,
    paymentTerms: 'Net 60',
    tags: ['it', 'conditional'],
    createdAt: '2025-09-15T00:00:00.000Z',
  },
  {
    id: 'sup-004',
    referenceNumber: 'SUP-2026-004',
    name: 'Delta Chemicals Ltd',
    tradingName: 'Delta Chem',
    registrationNo: 'GB777666',
    vatNumber: 'GB789012345',
    status: 'SUSPENDED',
    tier: 'HIGH',
    category: 'Chemicals',
    primaryContact: 'Mike Chen',
    email: 'mike@deltachem.com',
    phone: '+44 20 9876 5432',
    website: 'https://deltachem.com',
    addressLine1: '3 Chemical Way',
    city: 'London',
    postcode: 'E1 1DD',
    country: 'UK',
    notes: 'Under compliance review',
    approvedDate: '2024-03-01T00:00:00.000Z',
    reviewDate: '2026-03-01T00:00:00.000Z',
    annualSpend: 200000,
    paymentTerms: 'Net 30',
    tags: ['suspended'],
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'sup-005',
    referenceNumber: 'SUP-2026-005',
    name: 'Epsilon Consulting',
    tradingName: 'Epsilon',
    registrationNo: 'GB333444',
    vatNumber: 'GB234567890',
    status: 'INACTIVE',
    tier: 'LOW',
    category: 'Consulting',
    primaryContact: 'Alice Wong',
    email: 'alice@epsilon.com',
    phone: '+44 20 1111 2222',
    website: '',
    addressLine1: '',
    city: 'London',
    postcode: 'W1 1EE',
    country: 'UK',
    notes: 'No longer trading',
    approvedDate: '2023-01-01T00:00:00.000Z',
    reviewDate: null,
    annualSpend: 0,
    paymentTerms: '',
    tags: [],
    createdAt: '2023-01-01T00:00:00.000Z',
  },
];

interface MockScorecard {
  id: string;
  referenceNumber: string;
  supplierId: string;
  period: string;
  quality: number;
  delivery: number;
  cost: number;
  responsiveness: number;
  compliance: number;
  overallScore: number;
  status: ScorecardStatus;
  assessor: string;
  comments: string;
  createdAt: string;
}

const MOCK_SCORECARDS: MockScorecard[] = [
  {
    id: 'sc-001',
    referenceNumber: 'SC-2026-001',
    supplierId: 'sup-001',
    period: 'Q1 2026',
    quality: 90,
    delivery: 85,
    cost: 80,
    responsiveness: 88,
    compliance: 95,
    overallScore: 88,
    status: 'COMPLETED',
    assessor: 'Jane Doe',
    comments: 'Excellent performance',
    createdAt: '2026-01-31T00:00:00.000Z',
  },
  {
    id: 'sc-002',
    referenceNumber: 'SC-2026-002',
    supplierId: 'sup-002',
    period: 'Q4 2025',
    quality: 70,
    delivery: 65,
    cost: 72,
    responsiveness: 68,
    compliance: 74,
    overallScore: 70,
    status: 'IN_REVIEW',
    assessor: 'Bob Miller',
    comments: 'Satisfactory but needs improvement on delivery',
    createdAt: '2025-12-31T00:00:00.000Z',
  },
  {
    id: 'sc-003',
    referenceNumber: 'SC-2026-003',
    supplierId: 'sup-003',
    period: 'Q1 2026',
    quality: 0,
    delivery: 0,
    cost: 0,
    responsiveness: 0,
    compliance: 0,
    overallScore: 0,
    status: 'DRAFT',
    assessor: '',
    comments: '',
    createdAt: '2026-03-01T00:00:00.000Z',
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('Supplier status array', () => {
  it('has exactly 6 statuses', () => {
    expect(SUPPLIER_STATUSES).toHaveLength(6);
  });

  it('contains PROSPECTIVE', () => expect(SUPPLIER_STATUSES).toContain('PROSPECTIVE'));
  it('contains APPROVED', () => expect(SUPPLIER_STATUSES).toContain('APPROVED'));
  it('contains CONDITIONAL', () => expect(SUPPLIER_STATUSES).toContain('CONDITIONAL'));
  it('contains SUSPENDED', () => expect(SUPPLIER_STATUSES).toContain('SUSPENDED'));
  it('contains BLACKLISTED', () => expect(SUPPLIER_STATUSES).toContain('BLACKLISTED'));
  it('contains INACTIVE', () => expect(SUPPLIER_STATUSES).toContain('INACTIVE'));

  it('all entries are non-empty strings', () => {
    for (const s of SUPPLIER_STATUSES) {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    }
  });

  it('all entries are unique', () => {
    expect(new Set(SUPPLIER_STATUSES).size).toBe(SUPPLIER_STATUSES.length);
  });
});

describe('Supplier tier array', () => {
  it('has exactly 4 tiers', () => {
    expect(SUPPLIER_TIERS).toHaveLength(4);
  });

  it('contains CRITICAL', () => expect(SUPPLIER_TIERS).toContain('CRITICAL'));
  it('contains HIGH', () => expect(SUPPLIER_TIERS).toContain('HIGH'));
  it('contains MEDIUM', () => expect(SUPPLIER_TIERS).toContain('MEDIUM'));
  it('contains LOW', () => expect(SUPPLIER_TIERS).toContain('LOW'));

  it('all entries are unique', () => {
    expect(new Set(SUPPLIER_TIERS).size).toBe(SUPPLIER_TIERS.length);
  });
});

describe('Scorecard status array', () => {
  it('has exactly 3 statuses', () => {
    expect(SCORECARD_STATUSES).toHaveLength(3);
  });

  it('contains DRAFT', () => expect(SCORECARD_STATUSES).toContain('DRAFT'));
  it('contains IN_REVIEW', () => expect(SCORECARD_STATUSES).toContain('IN_REVIEW'));
  it('contains COMPLETED', () => expect(SCORECARD_STATUSES).toContain('COMPLETED'));
});

describe('Scorecard dimensions', () => {
  it('has exactly 5 dimensions', () => {
    expect(SCORECARD_DIMENSIONS).toHaveLength(5);
  });

  for (const dim of ['quality', 'delivery', 'cost', 'responsiveness', 'compliance'] as ScorecardDimension[]) {
    it(`includes ${dim}`, () => expect(SCORECARD_DIMENSIONS).toContain(dim));
  }
});

describe('getStatusColor', () => {
  it('APPROVED returns green', () => {
    expect(getStatusColor('APPROVED')).toContain('green');
  });

  it('CONDITIONAL returns yellow', () => {
    expect(getStatusColor('CONDITIONAL')).toContain('yellow');
  });

  it('SUSPENDED returns orange', () => {
    expect(getStatusColor('SUSPENDED')).toContain('orange');
  });

  it('BLACKLISTED returns red', () => {
    expect(getStatusColor('BLACKLISTED')).toContain('red');
  });

  it('INACTIVE returns gray', () => {
    expect(getStatusColor('INACTIVE')).toContain('gray');
  });

  it('PROSPECTIVE returns blue (default)', () => {
    expect(getStatusColor('PROSPECTIVE')).toContain('blue');
  });

  it('unknown status returns blue (default)', () => {
    expect(getStatusColor('UNKNOWN_STATUS')).toContain('blue');
  });

  for (const status of SUPPLIER_STATUSES) {
    it(`${status} color contains bg-`, () => {
      expect(getStatusColor(status)).toContain('bg-');
    });
    it(`${status} color is a non-empty string`, () => {
      expect(typeof getStatusColor(status)).toBe('string');
      expect(getStatusColor(status).length).toBeGreaterThan(0);
    });
  }
});

describe('getTierColor', () => {
  it('CRITICAL returns red', () => {
    expect(getTierColor('CRITICAL')).toContain('red');
  });

  it('HIGH returns orange', () => {
    expect(getTierColor('HIGH')).toContain('orange');
  });

  it('MEDIUM returns yellow', () => {
    expect(getTierColor('MEDIUM')).toContain('yellow');
  });

  it('LOW returns green', () => {
    expect(getTierColor('LOW')).toContain('green');
  });

  it('unknown tier returns green (default)', () => {
    expect(getTierColor('UNKNOWN')).toContain('green');
  });

  for (const tier of SUPPLIER_TIERS) {
    it(`${tier} color contains bg-`, () => {
      expect(getTierColor(tier)).toContain('bg-');
    });
  }
});

describe('getScoreColor', () => {
  it('score 80 → green', () => expect(getScoreColor(80)).toContain('green'));
  it('score 100 → green', () => expect(getScoreColor(100)).toContain('green'));
  it('score 60 → yellow', () => expect(getScoreColor(60)).toContain('yellow'));
  it('score 79 → yellow', () => expect(getScoreColor(79)).toContain('yellow'));
  it('score 40 → orange', () => expect(getScoreColor(40)).toContain('orange'));
  it('score 59 → orange', () => expect(getScoreColor(59)).toContain('orange'));
  it('score 0 → red', () => expect(getScoreColor(0)).toContain('red'));
  it('score 39 → red', () => expect(getScoreColor(39)).toContain('red'));

  for (let score = 0; score <= 100; score += 5) {
    it(`score ${score} returns a non-empty string`, () => {
      expect(getScoreColor(score).length).toBeGreaterThan(0);
    });
  }
});

describe('Approval workflow helpers', () => {
  it('isPending: PROSPECTIVE is pending', () => expect(isPending('PROSPECTIVE')).toBe(true));
  it('isPending: CONDITIONAL is pending', () => expect(isPending('CONDITIONAL')).toBe(true));
  it('isPending: APPROVED is not pending', () => expect(isPending('APPROVED')).toBe(false));
  it('isPending: SUSPENDED is not pending', () => expect(isPending('SUSPENDED')).toBe(false));
  it('isPending: BLACKLISTED is not pending', () => expect(isPending('BLACKLISTED')).toBe(false));
  it('isPending: INACTIVE is not pending', () => expect(isPending('INACTIVE')).toBe(false));

  it('isSuspendedOrBlocked: SUSPENDED is true', () => expect(isSuspendedOrBlocked('SUSPENDED')).toBe(true));
  it('isSuspendedOrBlocked: BLACKLISTED is true', () => expect(isSuspendedOrBlocked('BLACKLISTED')).toBe(true));
  it('isSuspendedOrBlocked: APPROVED is false', () => expect(isSuspendedOrBlocked('APPROVED')).toBe(false));
  it('isSuspendedOrBlocked: PROSPECTIVE is false', () => expect(isSuspendedOrBlocked('PROSPECTIVE')).toBe(false));

  it('canBeApproved: APPROVED cannot be re-approved', () => expect(canBeApproved('APPROVED')).toBe(false));
  it('canBeApproved: PROSPECTIVE can be approved', () => expect(canBeApproved('PROSPECTIVE')).toBe(true));
  it('canBeApproved: SUSPENDED can be approved', () => expect(canBeApproved('SUSPENDED')).toBe(true));
  it('canBeApproved: BLACKLISTED can be approved', () => expect(canBeApproved('BLACKLISTED')).toBe(true));

  it('canBeSuspended: SUSPENDED cannot be re-suspended', () => expect(canBeSuspended('SUSPENDED')).toBe(false));
  it('canBeSuspended: BLACKLISTED cannot be suspended', () => expect(canBeSuspended('BLACKLISTED')).toBe(false));
  it('canBeSuspended: APPROVED can be suspended', () => expect(canBeSuspended('APPROVED')).toBe(true));
  it('canBeSuspended: PROSPECTIVE can be suspended', () => expect(canBeSuspended('PROSPECTIVE')).toBe(true));

  for (const status of SUPPLIER_STATUSES) {
    it(`isPending(${status}) returns a boolean`, () => {
      expect(typeof isPending(status)).toBe('boolean');
    });
    it(`canBeSuspended(${status}) returns a boolean`, () => {
      expect(typeof canBeSuspended(status)).toBe('boolean');
    });
  }
});

describe('calcOverall (scorecard mean)', () => {
  it('all zeros → 0', () => {
    expect(calcOverall({ quality: 0, delivery: 0, cost: 0, responsiveness: 0, compliance: 0 })).toBe(0);
  });

  it('empty object → 0', () => {
    expect(calcOverall({})).toBe(0);
  });

  it('single dimension 80 → 80', () => {
    expect(calcOverall({ quality: 80 })).toBe(80);
  });

  it('five equal 100s → 100', () => {
    expect(
      calcOverall({ quality: 100, delivery: 100, cost: 100, responsiveness: 100, compliance: 100 })
    ).toBe(100);
  });

  it('five equal 60s → 60', () => {
    expect(
      calcOverall({ quality: 60, delivery: 60, cost: 60, responsiveness: 60, compliance: 60 })
    ).toBe(60);
  });

  it('mock scorecard sc-001 overall matches stored value', () => {
    const sc = MOCK_SCORECARDS[0];
    const calculated = calcOverall({
      quality: sc.quality,
      delivery: sc.delivery,
      cost: sc.cost,
      responsiveness: sc.responsiveness,
      compliance: sc.compliance,
    });
    // calcOverall uses Math.round so allow ±1
    expect(Math.abs(calculated - sc.overallScore)).toBeLessThanOrEqual(1);
  });

  it('mock scorecard sc-003 (all zero) → 0', () => {
    const sc = MOCK_SCORECARDS[2];
    expect(
      calcOverall({
        quality: sc.quality,
        delivery: sc.delivery,
        cost: sc.cost,
        responsiveness: sc.responsiveness,
        compliance: sc.compliance,
      })
    ).toBe(0);
  });

  for (let v = 10; v <= 100; v += 10) {
    it(`uniform score ${v} → ${v}`, () => {
      expect(
        calcOverall({ quality: v, delivery: v, cost: v, responsiveness: v, compliance: v })
      ).toBe(v);
    });
  }
});

describe('formatAnnualSpend', () => {
  it('0 → £0', () => expect(formatAnnualSpend(0)).toBe('£0'));
  it('500 → £500', () => expect(formatAnnualSpend(500)).toBe('£500'));
  it('1000 → £1K', () => expect(formatAnnualSpend(1000)).toBe('£1K'));
  it('50000 → £50K', () => expect(formatAnnualSpend(50000)).toBe('£50K'));
  it('1000000 → £1.0M', () => expect(formatAnnualSpend(1_000_000)).toBe('£1.0M'));
  it('750000 → £750K', () => expect(formatAnnualSpend(750_000)).toBe('£750K'));
  it('2500000 → £2.5M', () => expect(formatAnnualSpend(2_500_000)).toBe('£2.5M'));

  for (const [spend, expected] of [
    [999, '£999'],
    [1001, '£1K'],
    [999_999, '£1000K'],
    [1_500_000, '£1.5M'],
  ] as [number, string][]) {
    it(`formatAnnualSpend(${spend}) → "${expected}"`, () => {
      expect(formatAnnualSpend(spend)).toBe(expected);
    });
  }
});

describe('spendRiskBand', () => {
  it('CRITICAL tier always → CRITICAL regardless of spend', () => {
    expect(spendRiskBand(0, 'CRITICAL')).toBe('CRITICAL');
    expect(spendRiskBand(1_000_000, 'CRITICAL')).toBe('CRITICAL');
  });

  it('HIGH tier → HIGH', () => {
    expect(spendRiskBand(50_000, 'HIGH')).toBe('HIGH');
  });

  it('spend >= 500000 with MEDIUM tier → HIGH', () => {
    expect(spendRiskBand(500_000, 'MEDIUM')).toBe('HIGH');
  });

  it('MEDIUM tier with low spend → MEDIUM', () => {
    expect(spendRiskBand(50_000, 'MEDIUM')).toBe('MEDIUM');
  });

  it('spend >= 100000 with LOW tier → MEDIUM', () => {
    expect(spendRiskBand(100_000, 'LOW')).toBe('MEDIUM');
  });

  it('LOW tier with low spend → LOW', () => {
    expect(spendRiskBand(0, 'LOW')).toBe('LOW');
  });

  for (const tier of SUPPLIER_TIERS) {
    it(`spendRiskBand returns a valid band for tier ${tier}`, () => {
      const band = spendRiskBand(50_000, tier);
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(band);
    });
  }
});

describe('underscoreToLabel', () => {
  it('IN_REVIEW → "IN REVIEW"', () => expect(underscoreToLabel('IN_REVIEW')).toBe('IN REVIEW'));
  it('BLACKLISTED → "BLACKLISTED"', () => expect(underscoreToLabel('BLACKLISTED')).toBe('BLACKLISTED'));
  it('A_B_C → "A B C"', () => expect(underscoreToLabel('A_B_C')).toBe('A B C'));
  it('empty string → ""', () => expect(underscoreToLabel('')).toBe(''));

  for (const status of SUPPLIER_STATUSES) {
    it(`underscoreToLabel(${status}) is a string`, () => {
      expect(typeof underscoreToLabel(status)).toBe('string');
    });
  }
});

describe('Mock supplier data integrity', () => {
  it('has exactly 5 mock suppliers', () => {
    expect(MOCK_SUPPLIERS).toHaveLength(5);
  });

  it('all mock supplier ids are unique', () => {
    const ids = MOCK_SUPPLIERS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all reference numbers are unique', () => {
    const refs = MOCK_SUPPLIERS.map((s) => s.referenceNumber);
    expect(new Set(refs).size).toBe(refs.length);
  });

  for (const supplier of MOCK_SUPPLIERS) {
    it(`${supplier.id}: status is a valid SupplierStatus`, () => {
      expect(SUPPLIER_STATUSES).toContain(supplier.status);
    });

    it(`${supplier.id}: tier is a valid SupplierTier`, () => {
      expect(SUPPLIER_TIERS).toContain(supplier.tier);
    });

    it(`${supplier.id}: referenceNumber starts with SUP-`, () => {
      expect(supplier.referenceNumber.startsWith('SUP-')).toBe(true);
    });

    it(`${supplier.id}: name is non-empty`, () => {
      expect(supplier.name.length).toBeGreaterThan(0);
    });

    it(`${supplier.id}: email contains @`, () => {
      expect(supplier.email).toContain('@');
    });

    it(`${supplier.id}: annualSpend is non-negative`, () => {
      expect(supplier.annualSpend).toBeGreaterThanOrEqual(0);
    });
  }

  it('exactly 1 APPROVED supplier in mock data', () => {
    expect(MOCK_SUPPLIERS.filter((s) => s.status === 'APPROVED')).toHaveLength(1);
  });

  it('exactly 1 PROSPECTIVE supplier in mock data', () => {
    expect(MOCK_SUPPLIERS.filter((s) => s.status === 'PROSPECTIVE')).toHaveLength(1);
  });

  it('exactly 1 CRITICAL tier supplier in mock data', () => {
    expect(MOCK_SUPPLIERS.filter((s) => s.tier === 'CRITICAL')).toHaveLength(1);
  });

  it('pending count (PROSPECTIVE + CONDITIONAL) equals 2', () => {
    expect(MOCK_SUPPLIERS.filter((s) => isPending(s.status))).toHaveLength(2);
  });

  it('suspended/blocked count (SUSPENDED + BLACKLISTED) equals 1', () => {
    expect(MOCK_SUPPLIERS.filter((s) => isSuspendedOrBlocked(s.status))).toHaveLength(1);
  });
});

describe('Mock scorecard data integrity', () => {
  it('has exactly 3 mock scorecards', () => {
    expect(MOCK_SCORECARDS).toHaveLength(3);
  });

  it('all scorecard ids are unique', () => {
    const ids = MOCK_SCORECARDS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  for (const sc of MOCK_SCORECARDS) {
    it(`${sc.id}: status is a valid ScorecardStatus`, () => {
      expect(SCORECARD_STATUSES).toContain(sc.status);
    });

    it(`${sc.id}: referenceNumber starts with SC-`, () => {
      expect(sc.referenceNumber.startsWith('SC-')).toBe(true);
    });

    it(`${sc.id}: overallScore is in [0, 100]`, () => {
      expect(sc.overallScore).toBeGreaterThanOrEqual(0);
      expect(sc.overallScore).toBeLessThanOrEqual(100);
    });

    it(`${sc.id}: supplierId is non-empty`, () => {
      expect(sc.supplierId.length).toBeGreaterThan(0);
    });
  }

  it('completed scorecard has highest overall score', () => {
    const completed = MOCK_SCORECARDS.filter((s) => s.status === 'COMPLETED');
    const others = MOCK_SCORECARDS.filter((s) => s.status !== 'COMPLETED' && s.overallScore > 0);
    for (const c of completed) {
      for (const o of others) {
        expect(c.overallScore).toBeGreaterThan(o.overallScore);
      }
    }
  });

  it('DRAFT scorecard overall score is 0', () => {
    const draft = MOCK_SCORECARDS.find((s) => s.status === 'DRAFT');
    expect(draft?.overallScore).toBe(0);
  });
});

// ─── Parametric: SUPPLIER_STATUSES positional index ───────────────────────────

describe('SUPPLIER_STATUSES — positional index parametric', () => {
  const expected: [SupplierStatus, number][] = [
    ['PROSPECTIVE', 0],
    ['APPROVED',    1],
    ['CONDITIONAL', 2],
    ['SUSPENDED',   3],
    ['BLACKLISTED', 4],
    ['INACTIVE',    5],
  ];
  for (const [status, idx] of expected) {
    it(`${status} is at index ${idx}`, () => {
      expect(SUPPLIER_STATUSES[idx]).toBe(status);
    });
  }
});

// ─── Parametric: getStatusColor text- checks ─────────────────────────────────

describe('getStatusColor — text- check per-status parametric', () => {
  const cases: [string, string][] = [
    ['APPROVED',    'green'],
    ['CONDITIONAL', 'yellow'],
    ['SUSPENDED',   'orange'],
    ['BLACKLISTED', 'red'],
    ['INACTIVE',    'gray'],
    ['PROSPECTIVE', 'blue'],
  ];
  for (const [status, color] of cases) {
    it(`${status} color contains text-${color}`, () => {
      expect(getStatusColor(status)).toContain(`text-${color}`);
    });
  }
});

// ─── Parametric: getTierColor text- checks ────────────────────────────────────

describe('getTierColor — text- check per-tier parametric', () => {
  const cases: [SupplierTier, string][] = [
    ['CRITICAL', 'red'],
    ['HIGH',     'orange'],
    ['MEDIUM',   'yellow'],
    ['LOW',      'green'],
  ];
  for (const [tier, color] of cases) {
    it(`${tier} color contains text-${color}`, () => {
      expect(getTierColor(tier)).toContain(`text-${color}`);
    });
  }
});

// ─── Parametric: MOCK_SUPPLIERS per-supplier annualSpend ─────────────────────

describe('MOCK_SUPPLIERS — per-supplier annualSpend parametric', () => {
  const cases: [string, number][] = [
    ['sup-001', 750000],
    ['sup-002', 120000],
    ['sup-003', 55000],
    ['sup-004', 200000],
    ['sup-005', 0],
  ];
  for (const [id, expected] of cases) {
    it(`${id}: annualSpend = ${expected}`, () => {
      const supplier = MOCK_SUPPLIERS.find((s) => s.id === id);
      expect(supplier!.annualSpend).toBe(expected);
    });
  }
});

// ─── Parametric: formatAnnualSpend additional exact values ────────────────────

describe('formatAnnualSpend — additional exact values parametric', () => {
  const cases: [number, string][] = [
    [120000,    '£120K'],
    [200000,    '£200K'],
    [55000,     '£55K'],
    [1_200_000, '£1.2M'],
  ];
  for (const [spend, expected] of cases) {
    it(`formatAnnualSpend(${spend}) → "${expected}"`, () => {
      expect(formatAnnualSpend(spend)).toBe(expected);
    });
  }
});

// ─── Parametric: spendRiskBand using MOCK_SUPPLIERS data ─────────────────────

describe('spendRiskBand — MOCK_SUPPLIERS data parametric', () => {
  const cases: [string, number, SupplierTier, 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'][] = [
    ['sup-001', 750000,  'CRITICAL', 'CRITICAL'], // CRITICAL tier
    ['sup-002', 120000,  'HIGH',     'HIGH'],      // HIGH tier
    ['sup-003', 55000,   'MEDIUM',   'MEDIUM'],    // MEDIUM tier, spend < 100K
    ['sup-004', 200000,  'HIGH',     'HIGH'],      // HIGH tier
    ['sup-005', 0,       'LOW',      'LOW'],       // LOW tier, zero spend
  ];
  for (const [id, spend, tier, expected] of cases) {
    it(`${id} (${tier}, £${spend}) → "${expected}"`, () => {
      expect(spendRiskBand(spend, tier)).toBe(expected);
    });
  }
});

// ─── Parametric: calcOverall sc-002 exact verification ───────────────────────

describe('calcOverall — sc-002 exact verification', () => {
  it('sc-002 (70,65,72,68,74) calcOverall = 70', () => {
    // (70+65+72+68+74)/5 = 349/5 = 69.8 → Math.round = 70
    expect(calcOverall({ quality: 70, delivery: 65, cost: 72, responsiveness: 68, compliance: 74 })).toBe(70);
  });
  it('sc-001 calcOverall ≈ 88', () => {
    // (90+85+80+88+95)/5 = 438/5 = 87.6 → Math.round = 88
    expect(calcOverall({ quality: 90, delivery: 85, cost: 80, responsiveness: 88, compliance: 95 })).toBe(88);
  });
});
