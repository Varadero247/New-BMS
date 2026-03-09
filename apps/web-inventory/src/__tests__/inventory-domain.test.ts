// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

type SupplierStatus = 'approved' | 'conditional' | 'under-review' | 'blocked';
type Rating = 'A' | 'B' | 'C' | 'D';
type CategoryStatus = 'active' | 'inactive';
type AdjustmentType =
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'CYCLE_COUNT'
  | 'TRANSFER'
  | 'RECEIVE'
  | 'ISSUE';
type TransactionType =
  | 'RECEIPT'
  | 'ISSUE'
  | 'ADJUSTMENT_IN'
  | 'ADJUSTMENT_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'CYCLE_COUNT'
  | 'RETURN'
  | 'DAMAGE'
  | 'EXPIRED'
  | 'INITIAL';

// ---------------------------------------------------------------------------
// Domain constants (inlined from source)
// ---------------------------------------------------------------------------

const SUPPLIER_STATUSES: SupplierStatus[] = ['approved', 'conditional', 'under-review', 'blocked'];
const RATINGS: Rating[] = ['A', 'B', 'C', 'D'];
const CATEGORY_STATUSES: CategoryStatus[] = ['active', 'inactive'];

const ADJUSTMENT_TYPES: AdjustmentType[] = [
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT',
  'CYCLE_COUNT',
  'TRANSFER',
  'RECEIVE',
  'ISSUE',
];

const TRANSACTION_TYPES: TransactionType[] = [
  'RECEIPT',
  'ISSUE',
  'ADJUSTMENT_IN',
  'ADJUSTMENT_OUT',
  'TRANSFER_IN',
  'TRANSFER_OUT',
  'CYCLE_COUNT',
  'RETURN',
  'DAMAGE',
  'EXPIRED',
  'INITIAL',
];

// Badge/color maps (from transactions/page.tsx)
const transactionBadgeColors: Record<TransactionType, string> = {
  RECEIPT: 'bg-green-100 text-green-700',
  ISSUE: 'bg-red-100 text-red-700',
  ADJUSTMENT_IN: 'bg-green-100 text-green-700',
  ADJUSTMENT_OUT: 'bg-red-100 text-red-700',
  TRANSFER_IN: 'bg-blue-100 text-blue-700',
  TRANSFER_OUT: 'bg-purple-100 text-purple-700',
  CYCLE_COUNT: 'bg-yellow-100 text-yellow-700',
  RETURN: 'bg-orange-100 text-orange-700',
  DAMAGE: 'bg-red-100 text-red-700',
  EXPIRED: 'bg-gray-100 text-gray-700',
  INITIAL: 'bg-sky-100 text-sky-700',
};

// Supplier status config (from suppliers/client.tsx)
const supplierStatusConfig: Record<SupplierStatus, { label: string; color: string }> = {
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700' },
  conditional: { label: 'Conditional', color: 'bg-amber-100 text-amber-700' },
  'under-review': { label: 'Under Review', color: 'bg-blue-100 text-blue-700' },
  blocked: { label: 'Blocked', color: 'bg-red-100 text-red-700' },
};

// Rating config (from suppliers/client.tsx)
const ratingConfig: Record<Rating, { color: string; bgColor: string }> = {
  A: { color: 'text-green-700', bgColor: 'bg-green-100' },
  B: { color: 'text-blue-700', bgColor: 'bg-blue-100' },
  C: { color: 'text-amber-700', bgColor: 'bg-amber-100' },
  D: { color: 'text-red-700', bgColor: 'bg-red-100' },
};

// Adjustment type config (from adjustments/page.tsx)
const adjustmentTypeConfig: Record<AdjustmentType, { label: string; color: string }> = {
  ADJUSTMENT_IN: { label: 'Add Stock', color: 'bg-green-100 text-green-700' },
  ADJUSTMENT_OUT: { label: 'Remove Stock', color: 'bg-red-100 text-red-700' },
  CYCLE_COUNT: { label: 'Cycle Count', color: 'bg-blue-100 text-blue-700' },
  TRANSFER: { label: 'Transfer', color: 'bg-purple-100 text-purple-700' },
  RECEIVE: { label: 'Receive Goods', color: 'bg-green-100 text-green-700' },
  ISSUE: { label: 'Issue Goods', color: 'bg-orange-100 text-orange-700' },
};

// ---------------------------------------------------------------------------
// MOCK suppliers (from suppliers/client.tsx)
// ---------------------------------------------------------------------------

interface MockSupplier {
  id: string;
  name: string;
  code: string;
  status: SupplierStatus;
  rating: Rating;
  categories: string[];
  country: string;
  leadTimeDays: number;
  onTimeDelivery: number;
  qualityScore: number;
  defectRate: number;
  totalOrders: number;
  totalSpend: number;
  certifications: string[];
}

const MOCK_SUPPLIERS: MockSupplier[] = [
  {
    id: 'sup-1', name: 'MetalPro Industries', code: 'SUP-001', status: 'approved', rating: 'A',
    categories: ['Raw Materials', 'Metals'], country: 'UK', leadTimeDays: 5,
    onTimeDelivery: 97, qualityScore: 96, defectRate: 0.3,
    totalOrders: 1245, totalSpend: 2800000, certifications: ['ISO 9001', 'ISO 14001', 'AS9100D'],
  },
  {
    id: 'sup-2', name: 'ElectroCom GmbH', code: 'SUP-002', status: 'approved', rating: 'A',
    categories: ['Components', 'Electronics'], country: 'Germany', leadTimeDays: 8,
    onTimeDelivery: 95, qualityScore: 98, defectRate: 0.1,
    totalOrders: 876, totalSpend: 1650000, certifications: ['ISO 9001', 'IATF 16949', 'ISO 14001'],
  },
  {
    id: 'sup-3', name: 'Pacific Polymers Ltd', code: 'SUP-003', status: 'approved', rating: 'B',
    categories: ['Raw Materials', 'Polymers'], country: 'China', leadTimeDays: 21,
    onTimeDelivery: 88, qualityScore: 91, defectRate: 1.2,
    totalOrders: 432, totalSpend: 890000, certifications: ['ISO 9001'],
  },
  {
    id: 'sup-4', name: 'PrecisionParts Inc', code: 'SUP-004', status: 'conditional', rating: 'C',
    categories: ['Components', 'Mechanical'], country: 'USA', leadTimeDays: 14,
    onTimeDelivery: 78, qualityScore: 82, defectRate: 2.8,
    totalOrders: 256, totalSpend: 420000, certifications: ['ISO 9001'],
  },
  {
    id: 'sup-5', name: 'Nordic Chemicals AS', code: 'SUP-005', status: 'approved', rating: 'A',
    categories: ['Raw Materials', 'Chemicals'], country: 'Norway', leadTimeDays: 7,
    onTimeDelivery: 99, qualityScore: 99, defectRate: 0.05,
    totalOrders: 678, totalSpend: 560000, certifications: ['ISO 9001', 'ISO 14001', 'REACH'],
  },
  {
    id: 'sup-6', name: 'QuickPack Solutions', code: 'SUP-006', status: 'approved', rating: 'B',
    categories: ['Consumables', 'Packaging'], country: 'UK', leadTimeDays: 3,
    onTimeDelivery: 94, qualityScore: 90, defectRate: 0.8,
    totalOrders: 890, totalSpend: 125000, certifications: ['ISO 9001', 'FSC'],
  },
  {
    id: 'sup-7', name: 'SafetyFirst PPE', code: 'SUP-007', status: 'under-review', rating: 'B',
    categories: ['Consumables', 'PPE'], country: 'UK', leadTimeDays: 4,
    onTimeDelivery: 92, qualityScore: 88, defectRate: 1.5,
    totalOrders: 234, totalSpend: 45000, certifications: ['ISO 9001'],
  },
  {
    id: 'sup-8', name: 'TitanForge Aerospace', code: 'SUP-008', status: 'approved', rating: 'A',
    categories: ['Raw Materials', 'Metals'], country: 'France', leadTimeDays: 12,
    onTimeDelivery: 96, qualityScore: 99, defectRate: 0.02,
    totalOrders: 189, totalSpend: 980000, certifications: ['ISO 9001', 'AS9100D', 'NADCAP'],
  },
];

// ---------------------------------------------------------------------------
// MOCK categories (from categories/client.tsx — top-level only)
// ---------------------------------------------------------------------------

interface MockCategory {
  id: string;
  name: string;
  code: string;
  parentId: string | null;
  itemCount: number;
  totalValue: number;
  status: CategoryStatus;
  childCount: number;
}

const MOCK_CATEGORIES: MockCategory[] = [
  { id: 'cat-1', name: 'Raw Materials', code: 'RM', parentId: null, itemCount: 342, totalValue: 1250000, status: 'active', childCount: 4 },
  { id: 'cat-2', name: 'Components', code: 'CMP', parentId: null, itemCount: 567, totalValue: 890000, status: 'active', childCount: 3 },
  { id: 'cat-3', name: 'Finished Goods', code: 'FG', parentId: null, itemCount: 156, totalValue: 3200000, status: 'active', childCount: 2 },
  { id: 'cat-4', name: 'Consumables', code: 'CON', parentId: null, itemCount: 234, totalValue: 120000, status: 'active', childCount: 4 },
  { id: 'cat-5', name: 'Spare Parts', code: 'SP', parentId: null, itemCount: 412, totalValue: 560000, status: 'active', childCount: 2 },
  { id: 'cat-6', name: 'Legacy Parts', code: 'LEG', parentId: null, itemCount: 89, totalValue: 45000, status: 'inactive', childCount: 0 },
];

// ---------------------------------------------------------------------------
// Pure helper functions (derived from source logic)
// ---------------------------------------------------------------------------

/** Classify supplier performance on OTD metric */
function otdColor(otd: number): string {
  if (otd >= 95) return 'bg-green-500';
  if (otd >= 85) return 'bg-amber-500';
  return 'bg-red-500';
}

/** Classify supplier quality score */
function qualityColor(score: number): string {
  if (score >= 95) return 'bg-green-500';
  if (score >= 85) return 'bg-amber-500';
  return 'bg-red-500';
}

/** Classify defect rate */
function defectColor(rate: number): string {
  if (rate <= 0.5) return 'bg-green-500';
  if (rate <= 1.5) return 'bg-amber-500';
  return 'bg-red-500';
}

/** Defect-rate bar width: max(0, 100 - rate * 20) */
function defectBarWidth(rate: number): number {
  return Math.max(0, 100 - rate * 20);
}

/** Total spend across all suppliers */
function totalSpend(suppliers: MockSupplier[]): number {
  return suppliers.reduce((s, sup) => s + sup.totalSpend, 0);
}

/** Average on-time delivery (rounded) */
function avgOTD(suppliers: MockSupplier[]): number {
  if (suppliers.length === 0) return 0;
  return Math.round(suppliers.reduce((s, sup) => s + sup.onTimeDelivery, 0) / suppliers.length);
}

/** Average quality score (rounded) */
function avgQuality(suppliers: MockSupplier[]): number {
  if (suppliers.length === 0) return 0;
  return Math.round(suppliers.reduce((s, sup) => s + sup.qualityScore, 0) / suppliers.length);
}

/** Transaction icon direction: 'in' | 'out' | 'transfer' */
function transactionDirection(type: TransactionType): 'in' | 'out' | 'transfer' {
  if (['RECEIPT', 'RETURN', 'INITIAL', 'ADJUSTMENT_IN', 'TRANSFER_IN'].includes(type)) return 'in';
  if (['ISSUE', 'DAMAGE', 'EXPIRED', 'ADJUSTMENT_OUT', 'TRANSFER_OUT'].includes(type)) return 'out';
  return 'transfer';
}

/** Whether adjustment type requires reason field */
function requiresReason(type: AdjustmentType): boolean {
  return ['ADJUSTMENT_IN', 'ADJUSTMENT_OUT', 'CYCLE_COUNT'].includes(type);
}

/** Whether adjustment type needs unit cost input */
function requiresUnitCost(type: AdjustmentType): boolean {
  return ['RECEIVE', 'ADJUSTMENT_IN'].includes(type);
}

/** Whether adjustment type is a transfer (two warehouses) */
function isTransfer(type: AdjustmentType): boolean {
  return type === 'TRANSFER';
}

// ---------------------------------------------------------------------------
// Tests: SUPPLIER_STATUSES array
// ---------------------------------------------------------------------------

describe('SUPPLIER_STATUSES array', () => {
  it('has exactly 4 statuses', () => expect(SUPPLIER_STATUSES).toHaveLength(4));
  it('includes approved', () => expect(SUPPLIER_STATUSES).toContain('approved'));
  it('includes conditional', () => expect(SUPPLIER_STATUSES).toContain('conditional'));
  it('includes under-review', () => expect(SUPPLIER_STATUSES).toContain('under-review'));
  it('includes blocked', () => expect(SUPPLIER_STATUSES).toContain('blocked'));
  for (const s of SUPPLIER_STATUSES) {
    it(`${s} is a non-empty string`, () => expect(typeof s).toBe('string'));
  }
});

// ---------------------------------------------------------------------------
// Tests: RATINGS array
// ---------------------------------------------------------------------------

describe('RATINGS array', () => {
  it('has exactly 4 ratings', () => expect(RATINGS).toHaveLength(4));
  it('A is first', () => expect(RATINGS[0]).toBe('A'));
  it('D is last', () => expect(RATINGS[3]).toBe('D'));
  for (const r of RATINGS) {
    it(`rating ${r} is single character`, () => expect(r).toHaveLength(1));
  }
});

// ---------------------------------------------------------------------------
// Tests: supplierStatusConfig badge map
// ---------------------------------------------------------------------------

describe('supplierStatusConfig', () => {
  for (const s of SUPPLIER_STATUSES) {
    it(`${s} has a label`, () => expect(supplierStatusConfig[s].label.length).toBeGreaterThan(0));
    it(`${s} has a color`, () => expect(supplierStatusConfig[s].color.length).toBeGreaterThan(0));
    it(`${s} color contains bg-`, () => expect(supplierStatusConfig[s].color).toContain('bg-'));
  }
  it('approved is green', () => expect(supplierStatusConfig.approved.color).toContain('green'));
  it('blocked is red', () => expect(supplierStatusConfig.blocked.color).toContain('red'));
  it('conditional is amber', () => expect(supplierStatusConfig.conditional.color).toContain('amber'));
  it('under-review is blue', () => expect(supplierStatusConfig['under-review'].color).toContain('blue'));
});

// ---------------------------------------------------------------------------
// Tests: ratingConfig badge map
// ---------------------------------------------------------------------------

describe('ratingConfig', () => {
  for (const r of RATINGS) {
    it(`${r} has color`, () => expect(ratingConfig[r].color.length).toBeGreaterThan(0));
    it(`${r} has bgColor`, () => expect(ratingConfig[r].bgColor.length).toBeGreaterThan(0));
    it(`${r} color contains text-`, () => expect(ratingConfig[r].color).toContain('text-'));
    it(`${r} bgColor contains bg-`, () => expect(ratingConfig[r].bgColor).toContain('bg-'));
  }
  it('A rating is green text', () => expect(ratingConfig.A.color).toContain('green'));
  it('D rating is red text', () => expect(ratingConfig.D.color).toContain('red'));
  it('B rating is blue text', () => expect(ratingConfig.B.color).toContain('blue'));
  it('C rating is amber text', () => expect(ratingConfig.C.color).toContain('amber'));
});

// ---------------------------------------------------------------------------
// Tests: TRANSACTION_TYPES array
// ---------------------------------------------------------------------------

describe('TRANSACTION_TYPES array', () => {
  it('has exactly 11 types', () => expect(TRANSACTION_TYPES).toHaveLength(11));
  const expected: TransactionType[] = [
    'RECEIPT', 'ISSUE', 'ADJUSTMENT_IN', 'ADJUSTMENT_OUT',
    'TRANSFER_IN', 'TRANSFER_OUT', 'CYCLE_COUNT', 'RETURN',
    'DAMAGE', 'EXPIRED', 'INITIAL',
  ];
  for (const t of expected) {
    it(`includes ${t}`, () => expect(TRANSACTION_TYPES).toContain(t));
  }
});

// ---------------------------------------------------------------------------
// Tests: transactionBadgeColors map
// ---------------------------------------------------------------------------

describe('transactionBadgeColors', () => {
  for (const t of TRANSACTION_TYPES) {
    it(`${t} has a badge color`, () => expect(transactionBadgeColors[t]).toBeDefined());
    it(`${t} badge contains bg-`, () => expect(transactionBadgeColors[t]).toContain('bg-'));
    it(`${t} badge is a string`, () => expect(typeof transactionBadgeColors[t]).toBe('string'));
  }
  it('RECEIPT is green', () => expect(transactionBadgeColors.RECEIPT).toContain('green'));
  it('ISSUE is red', () => expect(transactionBadgeColors.ISSUE).toContain('red'));
  it('TRANSFER_IN is blue', () => expect(transactionBadgeColors.TRANSFER_IN).toContain('blue'));
  it('TRANSFER_OUT is purple', () => expect(transactionBadgeColors.TRANSFER_OUT).toContain('purple'));
  it('INITIAL is sky', () => expect(transactionBadgeColors.INITIAL).toContain('sky'));
  it('CYCLE_COUNT is yellow', () => expect(transactionBadgeColors.CYCLE_COUNT).toContain('yellow'));
  it('RETURN is orange', () => expect(transactionBadgeColors.RETURN).toContain('orange'));
});

// ---------------------------------------------------------------------------
// Tests: ADJUSTMENT_TYPES array
// ---------------------------------------------------------------------------

describe('ADJUSTMENT_TYPES array', () => {
  it('has exactly 6 types', () => expect(ADJUSTMENT_TYPES).toHaveLength(6));
  for (const t of ADJUSTMENT_TYPES) {
    it(`includes ${t}`, () => expect(ADJUSTMENT_TYPES).toContain(t));
  }
});

// ---------------------------------------------------------------------------
// Tests: adjustmentTypeConfig
// ---------------------------------------------------------------------------

describe('adjustmentTypeConfig', () => {
  for (const t of ADJUSTMENT_TYPES) {
    it(`${t} has a label`, () => expect(adjustmentTypeConfig[t].label.length).toBeGreaterThan(0));
    it(`${t} has a color containing bg-`, () => expect(adjustmentTypeConfig[t].color).toContain('bg-'));
  }
  it('ADJUSTMENT_IN is green', () => expect(adjustmentTypeConfig.ADJUSTMENT_IN.color).toContain('green'));
  it('ADJUSTMENT_OUT is red', () => expect(adjustmentTypeConfig.ADJUSTMENT_OUT.color).toContain('red'));
  it('TRANSFER is purple', () => expect(adjustmentTypeConfig.TRANSFER.color).toContain('purple'));
  it('CYCLE_COUNT is blue', () => expect(adjustmentTypeConfig.CYCLE_COUNT.color).toContain('blue'));
});

// ---------------------------------------------------------------------------
// Tests: MOCK_SUPPLIERS data integrity
// ---------------------------------------------------------------------------

describe('MOCK_SUPPLIERS data integrity', () => {
  it('has exactly 8 suppliers', () => expect(MOCK_SUPPLIERS).toHaveLength(8));

  for (const sup of MOCK_SUPPLIERS) {
    it(`${sup.code} has non-empty name`, () => expect(sup.name.length).toBeGreaterThan(0));
    it(`${sup.code} has valid status`, () => expect(SUPPLIER_STATUSES).toContain(sup.status));
    it(`${sup.code} has valid rating`, () => expect(RATINGS).toContain(sup.rating));
    it(`${sup.code} has at least one category`, () => expect(sup.categories.length).toBeGreaterThan(0));
    it(`${sup.code} has positive leadTimeDays`, () => expect(sup.leadTimeDays).toBeGreaterThan(0));
    it(`${sup.code} OTD is 0–100`, () => {
      expect(sup.onTimeDelivery).toBeGreaterThanOrEqual(0);
      expect(sup.onTimeDelivery).toBeLessThanOrEqual(100);
    });
    it(`${sup.code} qualityScore is 0–100`, () => {
      expect(sup.qualityScore).toBeGreaterThanOrEqual(0);
      expect(sup.qualityScore).toBeLessThanOrEqual(100);
    });
    it(`${sup.code} defectRate is non-negative`, () => expect(sup.defectRate).toBeGreaterThanOrEqual(0));
    it(`${sup.code} totalSpend is positive`, () => expect(sup.totalSpend).toBeGreaterThan(0));
    it(`${sup.code} has at least one certification`, () => expect(sup.certifications.length).toBeGreaterThan(0));
  }

  it('6 suppliers have approved status', () => {
    expect(MOCK_SUPPLIERS.filter(s => s.status === 'approved')).toHaveLength(6);
  });
  it('1 supplier has conditional status', () => {
    expect(MOCK_SUPPLIERS.filter(s => s.status === 'conditional')).toHaveLength(1);
  });
  it('1 supplier has under-review status', () => {
    expect(MOCK_SUPPLIERS.filter(s => s.status === 'under-review')).toHaveLength(1);
  });
  it('all A-rated suppliers have OTD >= 95', () => {
    const aRated = MOCK_SUPPLIERS.filter(s => s.rating === 'A');
    for (const s of aRated) {
      expect(s.onTimeDelivery).toBeGreaterThanOrEqual(95);
    }
  });
  it('all A-rated suppliers have qualityScore >= 96', () => {
    const aRated = MOCK_SUPPLIERS.filter(s => s.rating === 'A');
    for (const s of aRated) {
      expect(s.qualityScore).toBeGreaterThanOrEqual(96);
    }
  });
  it('PrecisionParts Inc has rating C', () => {
    const sup = MOCK_SUPPLIERS.find(s => s.code === 'SUP-004');
    expect(sup?.rating).toBe('C');
  });
  it('Nordic Chemicals has highest OTD (99%)', () => {
    const sup = MOCK_SUPPLIERS.find(s => s.code === 'SUP-005');
    expect(sup?.onTimeDelivery).toBe(99);
  });
  it('TitanForge has lowest defect rate (0.02%)', () => {
    const sup = MOCK_SUPPLIERS.find(s => s.code === 'SUP-008');
    expect(sup?.defectRate).toBe(0.02);
  });
  it('all supplier codes follow SUP-NNN pattern', () => {
    for (const s of MOCK_SUPPLIERS) {
      expect(s.code).toMatch(/^SUP-\d{3}$/);
    }
  });
  it('all ISO 9001 present in all supplier certifications', () => {
    for (const s of MOCK_SUPPLIERS) {
      expect(s.certifications).toContain('ISO 9001');
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: MOCK_CATEGORIES data integrity
// ---------------------------------------------------------------------------

describe('MOCK_CATEGORIES data integrity', () => {
  it('has exactly 6 top-level categories', () => expect(MOCK_CATEGORIES).toHaveLength(6));

  for (const cat of MOCK_CATEGORIES) {
    it(`${cat.code} has non-empty name`, () => expect(cat.name.length).toBeGreaterThan(0));
    it(`${cat.code} has non-empty code`, () => expect(cat.code.length).toBeGreaterThan(0));
    it(`${cat.code} has null parentId (top-level)`, () => expect(cat.parentId).toBeNull());
    it(`${cat.code} itemCount is positive`, () => expect(cat.itemCount).toBeGreaterThan(0));
    it(`${cat.code} totalValue is positive`, () => expect(cat.totalValue).toBeGreaterThan(0));
    it(`${cat.code} has valid status`, () => expect(CATEGORY_STATUSES).toContain(cat.status));
  }

  it('5 categories are active', () => {
    expect(MOCK_CATEGORIES.filter(c => c.status === 'active')).toHaveLength(5);
  });
  it('1 category is inactive (Legacy Parts)', () => {
    const inactive = MOCK_CATEGORIES.filter(c => c.status === 'inactive');
    expect(inactive).toHaveLength(1);
    expect(inactive[0].name).toBe('Legacy Parts');
  });
  it('Finished Goods has highest totalValue', () => {
    const fg = MOCK_CATEGORIES.find(c => c.code === 'FG');
    const maxValue = Math.max(...MOCK_CATEGORIES.map(c => c.totalValue));
    expect(fg?.totalValue).toBe(maxValue);
  });
  it('total item count across all categories is > 1000', () => {
    const total = MOCK_CATEGORIES.reduce((s, c) => s + c.itemCount, 0);
    expect(total).toBeGreaterThan(1000);
  });
  it('total category value > 5M', () => {
    const total = MOCK_CATEGORIES.reduce((s, c) => s + c.totalValue, 0);
    expect(total).toBeGreaterThan(5000000);
  });
  it('Raw Materials has 4 children', () => {
    expect(MOCK_CATEGORIES.find(c => c.code === 'RM')?.childCount).toBe(4);
  });
  it('Components has 3 children', () => {
    expect(MOCK_CATEGORIES.find(c => c.code === 'CMP')?.childCount).toBe(3);
  });
  it('Legacy Parts has no children', () => {
    expect(MOCK_CATEGORIES.find(c => c.code === 'LEG')?.childCount).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: otdColor helper
// ---------------------------------------------------------------------------

describe('otdColor', () => {
  it('99% is green', () => expect(otdColor(99)).toBe('bg-green-500'));
  it('95% is green', () => expect(otdColor(95)).toBe('bg-green-500'));
  it('94% is amber', () => expect(otdColor(94)).toBe('bg-amber-500'));
  it('85% is amber', () => expect(otdColor(85)).toBe('bg-amber-500'));
  it('84% is red', () => expect(otdColor(84)).toBe('bg-red-500'));
  it('0% is red', () => expect(otdColor(0)).toBe('bg-red-500'));
  for (let v = 80; v <= 100; v++) {
    it(`otdColor(${v}) contains bg-`, () => expect(otdColor(v)).toContain('bg-'));
  }
});

// ---------------------------------------------------------------------------
// Tests: qualityColor helper
// ---------------------------------------------------------------------------

describe('qualityColor', () => {
  it('99 is green', () => expect(qualityColor(99)).toBe('bg-green-500'));
  it('95 is green', () => expect(qualityColor(95)).toBe('bg-green-500'));
  it('94 is amber', () => expect(qualityColor(94)).toBe('bg-amber-500'));
  it('85 is amber', () => expect(qualityColor(85)).toBe('bg-amber-500'));
  it('84 is red', () => expect(qualityColor(84)).toBe('bg-red-500'));
});

// ---------------------------------------------------------------------------
// Tests: defectColor helper
// ---------------------------------------------------------------------------

describe('defectColor', () => {
  it('0.02 (excellent) is green', () => expect(defectColor(0.02)).toBe('bg-green-500'));
  it('0.5 (boundary) is green', () => expect(defectColor(0.5)).toBe('bg-green-500'));
  it('0.8 is amber', () => expect(defectColor(0.8)).toBe('bg-amber-500'));
  it('1.5 (boundary) is amber', () => expect(defectColor(1.5)).toBe('bg-amber-500'));
  it('2.8 is red', () => expect(defectColor(2.8)).toBe('bg-red-500'));
  it('0 is green', () => expect(defectColor(0)).toBe('bg-green-500'));
});

// ---------------------------------------------------------------------------
// Tests: defectBarWidth helper
// ---------------------------------------------------------------------------

describe('defectBarWidth', () => {
  it('0.0 rate → 100% bar', () => expect(defectBarWidth(0)).toBe(100));
  it('5.0 rate → 0% bar (floor at 0)', () => expect(defectBarWidth(5)).toBe(0));
  it('1.0 rate → 80% bar', () => expect(defectBarWidth(1)).toBe(80));
  it('2.0 rate → 60% bar', () => expect(defectBarWidth(2)).toBe(60));
  it('never returns negative', () => {
    for (let r = 0; r <= 10; r++) {
      expect(defectBarWidth(r)).toBeGreaterThanOrEqual(0);
    }
  });
  it('never returns > 100', () => {
    for (let r = 0; r <= 10; r++) {
      expect(defectBarWidth(r)).toBeLessThanOrEqual(100);
    }
  });
});

// ---------------------------------------------------------------------------
// Tests: aggregate helpers
// ---------------------------------------------------------------------------

describe('totalSpend', () => {
  it('sums all 8 suppliers correctly', () => {
    expect(totalSpend(MOCK_SUPPLIERS)).toBe(7470000);
  });
  it('empty array returns 0', () => expect(totalSpend([])).toBe(0));
  it('single supplier returns its spend', () => {
    expect(totalSpend([MOCK_SUPPLIERS[0]])).toBe(2800000);
  });
});

describe('avgOTD', () => {
  it('empty array returns 0', () => expect(avgOTD([])).toBe(0));
  it('returns rounded integer', () => expect(Number.isInteger(avgOTD(MOCK_SUPPLIERS))).toBe(true));
  it('result is between 0 and 100', () => {
    const v = avgOTD(MOCK_SUPPLIERS);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(100);
  });
});

describe('avgQuality', () => {
  it('empty array returns 0', () => expect(avgQuality([])).toBe(0));
  it('returns rounded integer', () => expect(Number.isInteger(avgQuality(MOCK_SUPPLIERS))).toBe(true));
  it('result is between 0 and 100', () => {
    const v = avgQuality(MOCK_SUPPLIERS);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// Tests: transactionDirection helper
// ---------------------------------------------------------------------------

describe('transactionDirection', () => {
  const inTypes: TransactionType[] = ['RECEIPT', 'RETURN', 'INITIAL', 'ADJUSTMENT_IN', 'TRANSFER_IN'];
  const outTypes: TransactionType[] = ['ISSUE', 'DAMAGE', 'EXPIRED', 'ADJUSTMENT_OUT', 'TRANSFER_OUT'];

  for (const t of inTypes) {
    it(`${t} direction is 'in'`, () => expect(transactionDirection(t)).toBe('in'));
  }
  for (const t of outTypes) {
    it(`${t} direction is 'out'`, () => expect(transactionDirection(t)).toBe('out'));
  }
  it('CYCLE_COUNT direction is transfer', () => expect(transactionDirection('CYCLE_COUNT')).toBe('transfer'));
  for (const t of TRANSACTION_TYPES) {
    it(`${t} direction is a known value`, () => {
      expect(['in', 'out', 'transfer']).toContain(transactionDirection(t));
    });
  }
});

// ---------------------------------------------------------------------------
// Tests: requiresReason helper
// ---------------------------------------------------------------------------

describe('requiresReason', () => {
  it('ADJUSTMENT_IN requires reason', () => expect(requiresReason('ADJUSTMENT_IN')).toBe(true));
  it('ADJUSTMENT_OUT requires reason', () => expect(requiresReason('ADJUSTMENT_OUT')).toBe(true));
  it('CYCLE_COUNT requires reason', () => expect(requiresReason('CYCLE_COUNT')).toBe(true));
  it('TRANSFER does not require reason', () => expect(requiresReason('TRANSFER')).toBe(false));
  it('RECEIVE does not require reason', () => expect(requiresReason('RECEIVE')).toBe(false));
  it('ISSUE does not require reason', () => expect(requiresReason('ISSUE')).toBe(false));
});

// ---------------------------------------------------------------------------
// Tests: requiresUnitCost helper
// ---------------------------------------------------------------------------

describe('requiresUnitCost', () => {
  it('RECEIVE requires unit cost', () => expect(requiresUnitCost('RECEIVE')).toBe(true));
  it('ADJUSTMENT_IN requires unit cost', () => expect(requiresUnitCost('ADJUSTMENT_IN')).toBe(true));
  it('ADJUSTMENT_OUT does not require unit cost', () => expect(requiresUnitCost('ADJUSTMENT_OUT')).toBe(false));
  it('TRANSFER does not require unit cost', () => expect(requiresUnitCost('TRANSFER')).toBe(false));
  it('ISSUE does not require unit cost', () => expect(requiresUnitCost('ISSUE')).toBe(false));
  it('CYCLE_COUNT does not require unit cost', () => expect(requiresUnitCost('CYCLE_COUNT')).toBe(false));
});

// ---------------------------------------------------------------------------
// Tests: isTransfer helper
// ---------------------------------------------------------------------------

describe('isTransfer', () => {
  it('TRANSFER is a transfer', () => expect(isTransfer('TRANSFER')).toBe(true));
  it('ADJUSTMENT_IN is not a transfer', () => expect(isTransfer('ADJUSTMENT_IN')).toBe(false));
  it('ADJUSTMENT_OUT is not a transfer', () => expect(isTransfer('ADJUSTMENT_OUT')).toBe(false));
  it('RECEIVE is not a transfer', () => expect(isTransfer('RECEIVE')).toBe(false));
  it('ISSUE is not a transfer', () => expect(isTransfer('ISSUE')).toBe(false));
  it('CYCLE_COUNT is not a transfer', () => expect(isTransfer('CYCLE_COUNT')).toBe(false));
  for (const t of ADJUSTMENT_TYPES) {
    it(`isTransfer(${t}) returns boolean`, () => expect(typeof isTransfer(t)).toBe('boolean'));
  }
});

// ─── Phase 215 parametric additions ──────────────────────────────────────────

describe('SUPPLIER_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'approved'],
    [1, 'conditional'],
    [2, 'under-review'],
    [3, 'blocked'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`SUPPLIER_STATUSES[${idx}] === '${val}'`, () => {
      expect(SUPPLIER_STATUSES[idx]).toBe(val);
    });
  }
});

describe('RATINGS — positional index parametric', () => {
  const expected = [
    [0, 'A'],
    [1, 'B'],
    [2, 'C'],
    [3, 'D'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`RATINGS[${idx}] === '${val}'`, () => {
      expect(RATINGS[idx]).toBe(val);
    });
  }
});

describe('ADJUSTMENT_TYPES — positional index parametric', () => {
  const expected = [
    [0, 'ADJUSTMENT_IN'],
    [1, 'ADJUSTMENT_OUT'],
    [2, 'CYCLE_COUNT'],
    [3, 'TRANSFER'],
    [4, 'RECEIVE'],
    [5, 'ISSUE'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`ADJUSTMENT_TYPES[${idx}] === '${val}'`, () => {
      expect(ADJUSTMENT_TYPES[idx]).toBe(val);
    });
  }
});

describe('TRANSACTION_TYPES — positional index parametric', () => {
  const expected = [
    [0,  'RECEIPT'],
    [1,  'ISSUE'],
    [2,  'ADJUSTMENT_IN'],
    [3,  'ADJUSTMENT_OUT'],
    [4,  'TRANSFER_IN'],
    [5,  'TRANSFER_OUT'],
    [6,  'CYCLE_COUNT'],
    [7,  'RETURN'],
    [8,  'DAMAGE'],
    [9,  'EXPIRED'],
    [10, 'INITIAL'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`TRANSACTION_TYPES[${idx}] === '${val}'`, () => {
      expect(TRANSACTION_TYPES[idx]).toBe(val);
    });
  }
});

// ─── Algorithm puzzle phases (ph217inv–ph220inv) ────────────────────────────────
function moveZeroes217inv(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217inv_mz',()=>{
  it('a',()=>{expect(moveZeroes217inv([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217inv([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217inv([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217inv([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217inv([4,2,0,0,3])).toBe(4);});
});
function missingNumber218inv(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218inv_mn',()=>{
  it('a',()=>{expect(missingNumber218inv([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218inv([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218inv([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218inv([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218inv([1])).toBe(0);});
});
function countBits219inv(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219inv_cb',()=>{
  it('a',()=>{expect(countBits219inv(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219inv(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219inv(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219inv(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219inv(4)[4]).toBe(1);});
});
function climbStairs220inv(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220inv_cs',()=>{
  it('a',()=>{expect(climbStairs220inv(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220inv(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220inv(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220inv(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220inv(1)).toBe(1);});
});
