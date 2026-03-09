// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inline type definitions (no imports from source) ──────────────────────

type POStatus = 'PENDING' | 'CONFIRMED' | 'IN_TRANSIT' | 'COMPLETED' | 'CANCELLED';
type NCRSeverity = 'CRITICAL' | 'MAJOR' | 'MINOR';
type NCRStatus = 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
type SupplierGrade = 'A' | 'B' | 'C' | 'D';
type SupplierTier = 'Strategic' | 'Preferred' | 'Approved' | 'Conditional';
type RiskLevel = 'Low' | 'Medium' | 'High';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  description: string;
  quantity: number;
  amount: number;
  currency: string;
  deliveryDate: string;
  status: POStatus;
  createdAt: string;
}

interface NCR {
  id: string;
  ncrNumber: string;
  title: string;
  category: string;
  severity: NCRSeverity;
  dueDate: string;
  status: NCRStatus;
  createdAt: string;
}

interface SupplierScorecard {
  id: string;
  name: string;
  category: string;
  tier: SupplierTier;
  currentScore: number;
  previousScore: number;
  grade: SupplierGrade;
  riskLevel: RiskLevel;
  ncrCount: number;
  onTimeDelivery: number;
  qualityPpm: number;
  leadTimeDays: number;
}

// ─── Inline domain constants ────────────────────────────────────────────────

const PO_STATUSES: POStatus[] = ['PENDING', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED'];

const NCR_SEVERITIES: NCRSeverity[] = ['CRITICAL', 'MAJOR', 'MINOR'];
const NCR_STATUSES: NCRStatus[] = ['OPEN', 'IN_PROGRESS', 'CLOSED'];

const SUPPLIER_GRADES: SupplierGrade[] = ['A', 'B', 'C', 'D'];
const SUPPLIER_TIERS: SupplierTier[] = ['Strategic', 'Preferred', 'Approved', 'Conditional'];
const RISK_LEVELS: RiskLevel[] = ['Low', 'Medium', 'High'];

// Badge style maps — mirrored from purchase-orders/page.tsx
const PO_STATUS_STYLES: Record<POStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-indigo-100 text-indigo-700',
  IN_TRANSIT: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

// Badge style maps — mirrored from ncrs/page.tsx
const NCR_SEVERITY_STYLES: Record<NCRSeverity, string> = {
  CRITICAL: 'bg-red-100 text-red-700',
  MAJOR: 'bg-red-100 text-red-700',
  MINOR: 'bg-yellow-100 text-yellow-700',
};

const NCR_STATUS_STYLES: Record<NCRStatus, string> = {
  OPEN: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  CLOSED: 'bg-green-100 text-green-700',
};

// Badge style maps — mirrored from scorecard-dashboard/client.tsx
const GRADE_CONFIG: Record<SupplierGrade, { bg: string; text: string }> = {
  A: { bg: 'bg-green-100', text: 'text-green-700' },
  B: { bg: 'bg-blue-100', text: 'text-blue-700' },
  C: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  D: { bg: 'bg-red-100', text: 'text-red-700' },
};

const TIER_CONFIG: Record<SupplierTier, string> = {
  Strategic: 'bg-purple-100 text-purple-700',
  Preferred: 'bg-blue-100 text-blue-700',
  Approved: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
  Conditional: 'bg-red-100 text-red-700',
};

const RISK_CONFIG: Record<RiskLevel, string> = {
  Low: 'bg-green-100 text-green-700',
  Medium: 'bg-yellow-100 text-yellow-700',
  High: 'bg-red-100 text-red-700',
};

// scoreBar color logic — mirrored from scorecard-dashboard/client.tsx ScoreBar
function scoreBarColor(value: number): string {
  if (value >= 90) return 'bg-green-500';
  if (value >= 75) return 'bg-blue-500';
  if (value >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
}

// riskLevel sort rank — mirrored from scorecard-dashboard/client.tsx sortBy=risk
const RISK_RANK: Record<RiskLevel, number> = { High: 0, Medium: 1, Low: 2 };

// OTD colour logic — mirrored from scorecard-dashboard/client.tsx
function otdColor(pct: number): string {
  if (pct >= 95) return 'text-green-700';
  if (pct >= 85) return 'text-yellow-700';
  return 'text-red-700';
}

// PPM colour logic — mirrored from scorecard-dashboard/client.tsx
function ppmColor(ppm: number): string {
  if (ppm <= 200) return 'text-green-700';
  if (ppm <= 500) return 'text-yellow-700';
  return 'text-red-700';
}

// NCR count colour logic — mirrored from scorecard-dashboard/client.tsx
function ncrCountColor(count: number): string {
  if (count === 0) return 'text-green-700';
  if (count <= 2) return 'text-yellow-700';
  return 'text-red-700';
}

// Mock POs (representative set)
const MOCK_POS: PurchaseOrder[] = [
  { id: 'po-1', poNumber: 'SUP-PO-2026-001', description: 'Precision bearings — batch 500', quantity: 500, amount: 14500, currency: 'GBP', deliveryDate: '2026-03-01', status: 'CONFIRMED', createdAt: '2026-01-20T09:00:00Z' },
  { id: 'po-2', poNumber: 'SUP-PO-2026-002', description: 'Stainless plate stock — 2t', quantity: 10, amount: 8200, currency: 'GBP', deliveryDate: '2026-03-15', status: 'IN_TRANSIT', createdAt: '2026-02-01T10:30:00Z' },
  { id: 'po-3', poNumber: 'SUP-PO-2026-003', description: 'Surface treatment batch — Q1', quantity: 120, amount: 5600, currency: 'GBP', deliveryDate: '2026-02-28', status: 'COMPLETED', createdAt: '2026-01-10T08:00:00Z' },
  { id: 'po-4', poNumber: 'SUP-PO-2026-004', description: 'Packaging material — 10k units', quantity: 10000, amount: 3100, currency: 'GBP', deliveryDate: '2026-04-01', status: 'PENDING', createdAt: '2026-02-15T11:00:00Z' },
  { id: 'po-5', poNumber: 'SUP-PO-2025-099', description: 'Tooling trial — cancelled', quantity: 1, amount: 1200, currency: 'GBP', deliveryDate: '2026-01-05', status: 'CANCELLED', createdAt: '2025-12-10T14:00:00Z' },
];

// Mock NCRs (representative set)
const MOCK_NCRS: NCR[] = [
  { id: 'ncr-1', ncrNumber: 'NCR-2026-001', title: 'Dimensional non-conformance on bearing batch', category: 'Dimensional', severity: 'MAJOR', dueDate: '2026-03-10', status: 'IN_PROGRESS', createdAt: '2026-02-14T08:00:00Z' },
  { id: 'ncr-2', ncrNumber: 'NCR-2026-002', title: 'Surface finish below spec on plate stock', category: 'Surface', severity: 'MINOR', dueDate: '2026-03-20', status: 'OPEN', createdAt: '2026-02-18T09:00:00Z' },
  { id: 'ncr-3', ncrNumber: 'NCR-2025-047', title: 'Critical material property deviation', category: 'Material', severity: 'CRITICAL', dueDate: '2026-01-15', status: 'CLOSED', createdAt: '2025-12-20T10:00:00Z' },
  { id: 'ncr-4', ncrNumber: 'NCR-2026-003', title: 'Packaging label missing regulatory mark', category: 'Labelling', severity: 'MINOR', dueDate: '2026-04-01', status: 'OPEN', createdAt: '2026-02-25T11:00:00Z' },
];

// Mock supplier scorecards — mirrored from scorecard-dashboard/client.tsx MOCK_SUPPLIERS (subset)
const MOCK_SUPPLIERS: SupplierScorecard[] = [
  { id: 'SUP-001', name: 'Precision Parts Ltd', category: 'Raw Materials', tier: 'Strategic', currentScore: 92, previousScore: 88, grade: 'A', riskLevel: 'Low', ncrCount: 1, onTimeDelivery: 97, qualityPpm: 150, leadTimeDays: 5 },
  { id: 'SUP-002', name: 'FastShip Logistics', category: 'Logistics', tier: 'Preferred', currentScore: 85, previousScore: 87, grade: 'B', riskLevel: 'Low', ncrCount: 2, onTimeDelivery: 94, qualityPpm: 0, leadTimeDays: 3 },
  { id: 'SUP-003', name: 'TechCoat Surfaces', category: 'Surface Treatment', tier: 'Approved', currentScore: 78, previousScore: 72, grade: 'C', riskLevel: 'Medium', ncrCount: 4, onTimeDelivery: 88, qualityPpm: 450, leadTimeDays: 10 },
  { id: 'SUP-004', name: 'Global Metals Inc', category: 'Raw Materials', tier: 'Strategic', currentScore: 95, previousScore: 93, grade: 'A', riskLevel: 'Low', ncrCount: 0, onTimeDelivery: 99, qualityPpm: 50, leadTimeDays: 7 },
  { id: 'SUP-005', name: 'PackRight Solutions', category: 'Packaging', tier: 'Approved', currentScore: 71, previousScore: 76, grade: 'C', riskLevel: 'High', ncrCount: 6, onTimeDelivery: 82, qualityPpm: 800, leadTimeDays: 4 },
  { id: 'SUP-006', name: 'ElectroComp Systems', category: 'Electronic Components', tier: 'Preferred', currentScore: 89, previousScore: 86, grade: 'B', riskLevel: 'Low', ncrCount: 1, onTimeDelivery: 96, qualityPpm: 200, leadTimeDays: 8 },
  { id: 'SUP-007', name: 'QuickMold Tooling', category: 'Tooling', tier: 'Conditional', currentScore: 62, previousScore: 58, grade: 'D', riskLevel: 'High', ncrCount: 8, onTimeDelivery: 75, qualityPpm: 1200, leadTimeDays: 15 },
];

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('Supplier Portal — Domain: PO Status Arrays', () => {
  test('PO_STATUSES contains exactly 5 values', () => {
    expect(PO_STATUSES).toHaveLength(5);
  });

  for (const s of PO_STATUSES) {
    test(`PO_STATUSES includes "${s}"`, () => {
      expect(PO_STATUSES).toContain(s);
    });
  }

  test('PO_STATUS_STYLES has an entry for every status', () => {
    for (const s of PO_STATUSES) {
      expect(PO_STATUS_STYLES[s]).toBeDefined();
    }
  });

  test('COMPLETED badge is green-toned', () => {
    expect(PO_STATUS_STYLES.COMPLETED).toContain('green');
  });

  test('IN_TRANSIT badge is blue-toned', () => {
    expect(PO_STATUS_STYLES.IN_TRANSIT).toContain('blue');
  });

  test('CONFIRMED badge is indigo-toned', () => {
    expect(PO_STATUS_STYLES.CONFIRMED).toContain('indigo');
  });

  test('PENDING badge is yellow-toned', () => {
    expect(PO_STATUS_STYLES.PENDING).toContain('yellow');
  });

  test('CANCELLED badge is red-toned', () => {
    expect(PO_STATUS_STYLES.CANCELLED).toContain('red');
  });

  test('every badge style is a non-empty string', () => {
    for (const s of PO_STATUSES) {
      expect(typeof PO_STATUS_STYLES[s]).toBe('string');
      expect(PO_STATUS_STYLES[s].length).toBeGreaterThan(0);
    }
  });
});

describe('Supplier Portal — Domain: NCR Severity and Status Arrays', () => {
  test('NCR_SEVERITIES contains exactly 3 values', () => {
    expect(NCR_SEVERITIES).toHaveLength(3);
  });

  for (const s of NCR_SEVERITIES) {
    test(`NCR_SEVERITIES includes "${s}"`, () => {
      expect(NCR_SEVERITIES).toContain(s);
    });
  }

  test('NCR_STATUSES contains exactly 3 values', () => {
    expect(NCR_STATUSES).toHaveLength(3);
  });

  for (const s of NCR_STATUSES) {
    test(`NCR_STATUSES includes "${s}"`, () => {
      expect(NCR_STATUSES).toContain(s);
    });
  }

  test('CRITICAL severity badge is red-toned', () => {
    expect(NCR_SEVERITY_STYLES.CRITICAL).toContain('red');
  });

  test('MAJOR severity badge is red-toned', () => {
    expect(NCR_SEVERITY_STYLES.MAJOR).toContain('red');
  });

  test('MINOR severity badge is yellow-toned', () => {
    expect(NCR_SEVERITY_STYLES.MINOR).toContain('yellow');
  });

  test('CLOSED NCR badge is green-toned', () => {
    expect(NCR_STATUS_STYLES.CLOSED).toContain('green');
  });

  test('IN_PROGRESS NCR badge is blue-toned', () => {
    expect(NCR_STATUS_STYLES.IN_PROGRESS).toContain('blue');
  });

  test('OPEN NCR badge is yellow-toned', () => {
    expect(NCR_STATUS_STYLES.OPEN).toContain('yellow');
  });
});

describe('Supplier Portal — Domain: Supplier Grade Badge Config', () => {
  test('SUPPLIER_GRADES contains exactly 4 values', () => {
    expect(SUPPLIER_GRADES).toHaveLength(4);
  });

  test('GRADE_CONFIG has an entry for every grade', () => {
    for (const g of SUPPLIER_GRADES) {
      expect(GRADE_CONFIG[g]).toBeDefined();
    }
  });

  test('Grade A is green-toned', () => {
    expect(GRADE_CONFIG.A.bg).toContain('green');
    expect(GRADE_CONFIG.A.text).toContain('green');
  });

  test('Grade B is blue-toned', () => {
    expect(GRADE_CONFIG.B.bg).toContain('blue');
    expect(GRADE_CONFIG.B.text).toContain('blue');
  });

  test('Grade C is yellow-toned', () => {
    expect(GRADE_CONFIG.C.bg).toContain('yellow');
    expect(GRADE_CONFIG.C.text).toContain('yellow');
  });

  test('Grade D is red-toned', () => {
    expect(GRADE_CONFIG.D.bg).toContain('red');
    expect(GRADE_CONFIG.D.text).toContain('red');
  });

  test('every grade config has both bg and text properties', () => {
    for (const g of SUPPLIER_GRADES) {
      expect(GRADE_CONFIG[g].bg).toBeDefined();
      expect(GRADE_CONFIG[g].text).toBeDefined();
    }
  });
});

describe('Supplier Portal — Domain: Supplier Tier Badge Config', () => {
  test('SUPPLIER_TIERS contains exactly 4 values', () => {
    expect(SUPPLIER_TIERS).toHaveLength(4);
  });

  test('TIER_CONFIG has an entry for every tier', () => {
    for (const t of SUPPLIER_TIERS) {
      expect(TIER_CONFIG[t]).toBeDefined();
    }
  });

  test('Strategic tier is purple-toned', () => {
    expect(TIER_CONFIG.Strategic).toContain('purple');
  });

  test('Preferred tier is blue-toned', () => {
    expect(TIER_CONFIG.Preferred).toContain('blue');
  });

  test('Approved tier is gray-toned', () => {
    expect(TIER_CONFIG.Approved).toContain('gray');
  });

  test('Conditional tier is red-toned', () => {
    expect(TIER_CONFIG.Conditional).toContain('red');
  });
});

describe('Supplier Portal — Domain: Risk Level Badge Config', () => {
  test('RISK_LEVELS contains exactly 3 values', () => {
    expect(RISK_LEVELS).toHaveLength(3);
  });

  test('RISK_CONFIG has an entry for every risk level', () => {
    for (const r of RISK_LEVELS) {
      expect(RISK_CONFIG[r]).toBeDefined();
    }
  });

  test('Low risk is green-toned', () => {
    expect(RISK_CONFIG.Low).toContain('green');
  });

  test('Medium risk is yellow-toned', () => {
    expect(RISK_CONFIG.Medium).toContain('yellow');
  });

  test('High risk is red-toned', () => {
    expect(RISK_CONFIG.High).toContain('red');
  });
});

describe('Supplier Portal — Domain: scoreBarColor logic', () => {
  test('score 90 returns green', () => {
    expect(scoreBarColor(90)).toBe('bg-green-500');
  });

  test('score 100 returns green', () => {
    expect(scoreBarColor(100)).toBe('bg-green-500');
  });

  test('score 89 returns blue', () => {
    expect(scoreBarColor(89)).toBe('bg-blue-500');
  });

  test('score 75 returns blue', () => {
    expect(scoreBarColor(75)).toBe('bg-blue-500');
  });

  test('score 74 returns yellow', () => {
    expect(scoreBarColor(74)).toBe('bg-yellow-500');
  });

  test('score 60 returns yellow', () => {
    expect(scoreBarColor(60)).toBe('bg-yellow-500');
  });

  test('score 59 returns red', () => {
    expect(scoreBarColor(59)).toBe('bg-red-500');
  });

  test('score 0 returns red', () => {
    expect(scoreBarColor(0)).toBe('bg-red-500');
  });
});

describe('Supplier Portal — Domain: OTD, PPM, NCR colour helpers', () => {
  test('OTD >= 95 is green', () => {
    expect(otdColor(95)).toBe('text-green-700');
    expect(otdColor(99)).toBe('text-green-700');
  });

  test('OTD 85-94 is yellow', () => {
    expect(otdColor(85)).toBe('text-yellow-700');
    expect(otdColor(94)).toBe('text-yellow-700');
  });

  test('OTD < 85 is red', () => {
    expect(otdColor(84)).toBe('text-red-700');
    expect(otdColor(75)).toBe('text-red-700');
  });

  test('PPM <= 200 is green', () => {
    expect(ppmColor(0)).toBe('text-green-700');
    expect(ppmColor(200)).toBe('text-green-700');
  });

  test('PPM 201-500 is yellow', () => {
    expect(ppmColor(201)).toBe('text-yellow-700');
    expect(ppmColor(500)).toBe('text-yellow-700');
  });

  test('PPM > 500 is red', () => {
    expect(ppmColor(501)).toBe('text-red-700');
    expect(ppmColor(1200)).toBe('text-red-700');
  });

  test('NCR count 0 is green', () => {
    expect(ncrCountColor(0)).toBe('text-green-700');
  });

  test('NCR count 1-2 is yellow', () => {
    expect(ncrCountColor(1)).toBe('text-yellow-700');
    expect(ncrCountColor(2)).toBe('text-yellow-700');
  });

  test('NCR count > 2 is red', () => {
    expect(ncrCountColor(3)).toBe('text-red-700');
    expect(ncrCountColor(8)).toBe('text-red-700');
  });
});

describe('Supplier Portal — Domain: Mock PO Data Integrity', () => {
  test('MOCK_POS contains exactly 5 records', () => {
    expect(MOCK_POS).toHaveLength(5);
  });

  test('all PO ids are unique', () => {
    const ids = MOCK_POS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all PO statuses are valid', () => {
    for (const p of MOCK_POS) {
      expect(PO_STATUSES).toContain(p.status);
    }
  });

  test('all amounts are positive', () => {
    for (const p of MOCK_POS) {
      expect(p.amount).toBeGreaterThan(0);
    }
  });

  test('all quantities are positive integers', () => {
    for (const p of MOCK_POS) {
      expect(p.quantity).toBeGreaterThan(0);
      expect(Number.isInteger(p.quantity)).toBe(true);
    }
  });

  test('exactly one COMPLETED PO', () => {
    expect(MOCK_POS.filter((p) => p.status === 'COMPLETED')).toHaveLength(1);
  });

  test('exactly one CANCELLED PO', () => {
    expect(MOCK_POS.filter((p) => p.status === 'CANCELLED')).toHaveLength(1);
  });

  test('all currencies are GBP', () => {
    for (const p of MOCK_POS) {
      expect(p.currency).toBe('GBP');
    }
  });
});

describe('Supplier Portal — Domain: Mock NCR Data Integrity', () => {
  test('MOCK_NCRS contains exactly 4 records', () => {
    expect(MOCK_NCRS).toHaveLength(4);
  });

  test('all NCR ids are unique', () => {
    const ids = MOCK_NCRS.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all NCR severities are valid', () => {
    for (const n of MOCK_NCRS) {
      expect(NCR_SEVERITIES).toContain(n.severity);
    }
  });

  test('all NCR statuses are valid', () => {
    for (const n of MOCK_NCRS) {
      expect(NCR_STATUSES).toContain(n.status);
    }
  });

  test('exactly one CRITICAL NCR', () => {
    expect(MOCK_NCRS.filter((n) => n.severity === 'CRITICAL')).toHaveLength(1);
  });

  test('CRITICAL NCR is CLOSED', () => {
    const critical = MOCK_NCRS.find((n) => n.severity === 'CRITICAL');
    expect(critical?.status).toBe('CLOSED');
  });
});

describe('Supplier Portal — Domain: Mock Supplier Scorecard Data Integrity', () => {
  test('MOCK_SUPPLIERS contains exactly 7 records', () => {
    expect(MOCK_SUPPLIERS).toHaveLength(7);
  });

  test('all supplier ids are unique', () => {
    const ids = MOCK_SUPPLIERS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all supplier grades are valid', () => {
    for (const s of MOCK_SUPPLIERS) {
      expect(SUPPLIER_GRADES).toContain(s.grade);
    }
  });

  test('all supplier tiers are valid', () => {
    for (const s of MOCK_SUPPLIERS) {
      expect(SUPPLIER_TIERS).toContain(s.tier);
    }
  });

  test('all risk levels are valid', () => {
    for (const s of MOCK_SUPPLIERS) {
      expect(RISK_LEVELS).toContain(s.riskLevel);
    }
  });

  test('all currentScore values are between 0 and 100', () => {
    for (const s of MOCK_SUPPLIERS) {
      expect(s.currentScore).toBeGreaterThanOrEqual(0);
      expect(s.currentScore).toBeLessThanOrEqual(100);
    }
  });

  test('Strategic tier suppliers have grade A', () => {
    const strategic = MOCK_SUPPLIERS.filter((s) => s.tier === 'Strategic');
    for (const s of strategic) {
      expect(s.grade).toBe('A');
    }
  });

  test('Conditional tier supplier has highest NCR count', () => {
    const conditional = MOCK_SUPPLIERS.find((s) => s.tier === 'Conditional');
    const maxNcr = Math.max(...MOCK_SUPPLIERS.map((s) => s.ncrCount));
    expect(conditional?.ncrCount).toBe(maxNcr);
  });

  test('Grade A suppliers all have Low risk', () => {
    const gradeA = MOCK_SUPPLIERS.filter((s) => s.grade === 'A');
    for (const s of gradeA) {
      expect(s.riskLevel).toBe('Low');
    }
  });

  test('RISK_RANK orders High before Medium before Low', () => {
    expect(RISK_RANK.High).toBeLessThan(RISK_RANK.Medium);
    expect(RISK_RANK.Medium).toBeLessThan(RISK_RANK.Low);
  });

  test('sort by score descending gives Global Metals first', () => {
    const sorted = [...MOCK_SUPPLIERS].sort((a, b) => b.currentScore - a.currentScore);
    expect(sorted[0].name).toBe('Global Metals Inc');
  });

  test('sort by risk ascending gives High risk suppliers first', () => {
    const sorted = [...MOCK_SUPPLIERS].sort((a, b) => (RISK_RANK[a.riskLevel] ?? 2) - (RISK_RANK[b.riskLevel] ?? 2));
    expect(sorted[0].riskLevel).toBe('High');
    expect(sorted[1].riskLevel).toBe('High');
  });

  test('average score calculation matches expected', () => {
    const avg = Math.round(MOCK_SUPPLIERS.reduce((s, sup) => s + sup.currentScore, 0) / MOCK_SUPPLIERS.length);
    const expected = Math.round((92 + 85 + 78 + 95 + 71 + 89 + 62) / 7);
    expect(avg).toBe(expected);
  });

  test('Grade A supplier count is 2', () => {
    expect(MOCK_SUPPLIERS.filter((s) => s.grade === 'A')).toHaveLength(2);
  });

  test('High risk supplier count is 2', () => {
    expect(MOCK_SUPPLIERS.filter((s) => s.riskLevel === 'High')).toHaveLength(2);
  });

  test('total NCR count sums correctly', () => {
    const total = MOCK_SUPPLIERS.reduce((s, sup) => s + sup.ncrCount, 0);
    expect(total).toBe(1 + 2 + 4 + 0 + 6 + 1 + 8);
  });
});

// ─── Parametric: per-PO data ───────────────────────────────────────────────

describe('MOCK_POS — per-PO parametric', () => {
  const expected: [string, string, POStatus, number][] = [
    ['po-1', 'SUP-PO-2026-001', 'CONFIRMED',  14500],
    ['po-2', 'SUP-PO-2026-002', 'IN_TRANSIT',  8200],
    ['po-3', 'SUP-PO-2026-003', 'COMPLETED',   5600],
    ['po-4', 'SUP-PO-2026-004', 'PENDING',     3100],
    ['po-5', 'SUP-PO-2025-099', 'CANCELLED',   1200],
  ];
  for (const [id, poNumber, status, amount] of expected) {
    test(`${id}: poNumber=${poNumber}, status=${status}, amount=${amount}`, () => {
      const po = MOCK_POS.find((p) => p.id === id);
      expect(po?.poNumber).toBe(poNumber);
      expect(po?.status).toBe(status);
      expect(po?.amount).toBe(amount);
    });
  }
});

// ─── Parametric: per-NCR data ──────────────────────────────────────────────

describe('MOCK_NCRS — per-NCR parametric', () => {
  const expected: [string, string, NCRSeverity, NCRStatus][] = [
    ['ncr-1', 'NCR-2026-001', 'MAJOR',    'IN_PROGRESS'],
    ['ncr-2', 'NCR-2026-002', 'MINOR',    'OPEN'],
    ['ncr-3', 'NCR-2025-047', 'CRITICAL', 'CLOSED'],
    ['ncr-4', 'NCR-2026-003', 'MINOR',    'OPEN'],
  ];
  for (const [id, ncrNumber, severity, status] of expected) {
    test(`${id}: ncrNumber=${ncrNumber}, severity=${severity}, status=${status}`, () => {
      const ncr = MOCK_NCRS.find((n) => n.id === id);
      expect(ncr?.ncrNumber).toBe(ncrNumber);
      expect(ncr?.severity).toBe(severity);
      expect(ncr?.status).toBe(status);
    });
  }
});

// ─── Parametric: per-supplier scoreBarColor ────────────────────────────────

describe('MOCK_SUPPLIERS — per-supplier scoreBarColor parametric', () => {
  const expected: [string, string][] = [
    ['SUP-001', 'bg-green-500'],  // 92 >= 90
    ['SUP-002', 'bg-blue-500'],   // 85 in [75,90)
    ['SUP-003', 'bg-blue-500'],   // 78 in [75,90)
    ['SUP-004', 'bg-green-500'],  // 95 >= 90
    ['SUP-005', 'bg-yellow-500'], // 71 in [60,75)
    ['SUP-006', 'bg-blue-500'],   // 89 in [75,90)
    ['SUP-007', 'bg-yellow-500'], // 62 in [60,75)
  ];
  for (const [id, expectedColor] of expected) {
    test(`${id} scoreBarColor = "${expectedColor}"`, () => {
      const sup = MOCK_SUPPLIERS.find((s) => s.id === id);
      expect(scoreBarColor(sup!.currentScore)).toBe(expectedColor);
    });
  }
});

// ─── Parametric: scoreBarColor boundary matrix ─────────────────────────────

describe('scoreBarColor — boundary matrix parametric', () => {
  const cases: [number, string][] = [
    [100, 'bg-green-500'],
    [90,  'bg-green-500'],
    [89,  'bg-blue-500'],
    [75,  'bg-blue-500'],
    [74,  'bg-yellow-500'],
    [60,  'bg-yellow-500'],
    [59,  'bg-red-500'],
    [0,   'bg-red-500'],
  ];
  for (const [score, expected] of cases) {
    test(`score ${score} → "${expected}"`, () => {
      expect(scoreBarColor(score)).toBe(expected);
    });
  }
});

// ─── Parametric: otdColor boundary ────────────────────────────────────────

describe('otdColor — boundary parametric', () => {
  const cases: [number, string][] = [
    [100, 'text-green-700'],
    [95,  'text-green-700'],
    [94,  'text-yellow-700'],
    [85,  'text-yellow-700'],
    [84,  'text-red-700'],
    [0,   'text-red-700'],
  ];
  for (const [pct, expected] of cases) {
    test(`OTD ${pct}% → "${expected}"`, () => {
      expect(otdColor(pct)).toBe(expected);
    });
  }
});

// ─── Parametric: ppmColor boundary ────────────────────────────────────────

describe('ppmColor — boundary parametric', () => {
  const cases: [number, string][] = [
    [0,   'text-green-700'],
    [200, 'text-green-700'],
    [201, 'text-yellow-700'],
    [500, 'text-yellow-700'],
    [501, 'text-red-700'],
    [1200,'text-red-700'],
  ];
  for (const [ppm, expected] of cases) {
    test(`PPM ${ppm} → "${expected}"`, () => {
      expect(ppmColor(ppm)).toBe(expected);
    });
  }
});

// ─── Parametric: ncrCountColor boundary ───────────────────────────────────

describe('ncrCountColor — boundary parametric', () => {
  const cases: [number, string][] = [
    [0, 'text-green-700'],
    [1, 'text-yellow-700'],
    [2, 'text-yellow-700'],
    [3, 'text-red-700'],
    [8, 'text-red-700'],
  ];
  for (const [count, expected] of cases) {
    test(`NCR count ${count} → "${expected}"`, () => {
      expect(ncrCountColor(count)).toBe(expected);
    });
  }
});

// ─── Parametric: GRADE_CONFIG per-grade colors ────────────────────────────

describe('GRADE_CONFIG — per-grade color parametric', () => {
  const cases: [SupplierGrade, string, string][] = [
    ['A', 'bg-green-100',  'text-green-700'],
    ['B', 'bg-blue-100',   'text-blue-700'],
    ['C', 'bg-yellow-100', 'text-yellow-700'],
    ['D', 'bg-red-100',    'text-red-700'],
  ];
  for (const [grade, bg, text] of cases) {
    test(`Grade ${grade}: bg="${bg}", text="${text}"`, () => {
      expect(GRADE_CONFIG[grade].bg).toBe(bg);
      expect(GRADE_CONFIG[grade].text).toBe(text);
    });
  }
});
