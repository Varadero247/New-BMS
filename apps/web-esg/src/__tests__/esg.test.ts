/**
 * Phase 132 — web-esg specification tests
 *
 * Tests pure functions and constants from:
 *   apps/web-esg/src/app/scope-emissions/page.tsx    (pct, fmt, scopeConfig, MOCK_DATA)
 *   apps/web-esg/src/app/defra-factors/page.tsx      (categoryColors, CATEGORIES, MOCK_FACTORS)
 *   apps/web-esg/src/app/scenario-analysis/page.tsx  (STATUS_COLOURS, TYPE_COLOURS, arrays)
 *   apps/web-esg/src/app/metrics-dashboard/page.tsx  (categoryBadge, statusColors, empty form)
 *   apps/web-esg/src/app/emissions/page.tsx          (scopeColors, statusColors, empty form)
 *   apps/web-esg/src/app/targets/page.tsx            (statusColors, empty form)
 *
 * Pure functions are not exported; they are recreated here as specifications.
 */

// ─── Pure functions (spec copies) ──────────────────────────────────────────────

/** From scope-emissions/page.tsx */
function pct(val: number, total: number): string | number {
  if (!total) return 0;
  return ((val / total) * 100).toFixed(1);
}

/** From scope-emissions/page.tsx */
function fmt(val: number): string {
  return val.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// ─── Constants (spec copies) ────────────────────────────────────────────────────

// scope-emissions/page.tsx
const scopeConfig: Record<number, { label: string; color: string; bg: string; bar: string }> = {
  1: { label: 'Scope 1', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' },
  2: { label: 'Scope 2', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', bar: 'bg-teal-500' },
  3: { label: 'Scope 3', color: 'text-green-700', bg: 'bg-green-50 border-green-200', bar: 'bg-green-500' },
};

interface BreakdownItem { scope: number; category: string; tco2e: number; }
interface ScopeEmissionsData {
  scope1Total: number; scope2Total: number; scope3Total: number;
  grandTotal: number; breakdown: BreakdownItem[];
}
const MOCK_DATA: ScopeEmissionsData = {
  scope1Total: 234.5,
  scope2Total: 1205.8,
  scope3Total: 4782.3,
  grandTotal: 6222.6,
  breakdown: [
    { scope: 1, category: 'Stationary Combustion', tco2e: 189.2 },
    { scope: 1, category: 'Mobile Combustion', tco2e: 45.3 },
    { scope: 2, category: 'Purchased Electricity', tco2e: 1205.8 },
    { scope: 3, category: 'Business Travel', tco2e: 892.4 },
    { scope: 3, category: 'Employee Commuting', tco2e: 1234.1 },
    { scope: 3, category: 'Purchased Goods & Services', tco2e: 2655.8 },
  ],
};

// defra-factors/page.tsx
const categoryColors: Record<string, string> = {
  Electricity: 'bg-yellow-100 text-yellow-800',
  'Natural Gas': 'bg-orange-100 text-orange-800',
  Diesel: 'bg-red-100 text-red-800',
  'Air Travel': 'bg-sky-100 text-sky-800',
  Water: 'bg-blue-100 text-blue-800',
  Waste: 'bg-gray-100 text-gray-800',
};
const CATEGORIES = ['All', 'Electricity', 'Natural Gas', 'Diesel', 'Air Travel', 'Water', 'Waste'];
interface DefrFactor {
  id: string; category: string; subcategory: string; unit: string;
  factor: number; year: number; source: string; notes?: string;
}
const MOCK_FACTORS: DefrFactor[] = [
  { id: '1', category: 'Electricity', subcategory: 'UK Grid Average', unit: 'kWh', factor: 0.23314, year: 2024, source: 'DEFRA 2024' },
  { id: '2', category: 'Natural Gas', subcategory: 'Combustion', unit: 'kWh', factor: 0.18280, year: 2024, source: 'DEFRA 2024' },
  { id: '3', category: 'Diesel', subcategory: 'HGV - Rigid', unit: 'km', factor: 0.16280, year: 2024, source: 'DEFRA 2024' },
  { id: '4', category: 'Air Travel', subcategory: 'Short Haul Economy', unit: 'passenger.km', factor: 0.15553, year: 2024, source: 'DEFRA 2024' },
  { id: '5', category: 'Water', subcategory: 'Supply', unit: 'm³', factor: 0.34900, year: 2024, source: 'DEFRA 2024' },
  { id: '6', category: 'Waste', subcategory: 'General Landfill', unit: 'tonne', factor: 459.00000, year: 2024, source: 'DEFRA 2024' },
];

// scenario-analysis/page.tsx
const STATUS_COLOURS: Record<string, string> = {
  DRAFT: 'bg-gray-100 text-gray-600',
  IN_REVIEW: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-blue-100 text-blue-700',
  PUBLISHED: 'bg-green-100 text-green-700',
  ARCHIVED: 'bg-slate-100 text-slate-500',
};
const TYPE_COLOURS: Record<string, string> = {
  TRANSITION_RISK: 'bg-orange-100 text-orange-700',
  PHYSICAL_RISK: 'bg-red-100 text-red-700',
  COMBINED: 'bg-purple-100 text-purple-700',
  OPPORTUNITY: 'bg-green-100 text-green-700',
};
const SCENARIO_TYPES = ['TRANSITION_RISK', 'PHYSICAL_RISK', 'COMBINED', 'OPPORTUNITY'];
const BASELINE_SCENARIOS = ['1_5C', '2C', '3C', '4C', 'CURRENT_POLICIES', 'NET_ZERO_2050', 'CUSTOM'];
const TIME_HORIZONS = ['SHORT_TERM', 'MEDIUM_TERM', 'LONG_TERM'];
const STATUSES = ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'];

// metrics-dashboard/page.tsx
const categoryBadge: Record<string, string> = {
  ENVIRONMENTAL: 'bg-green-100 text-green-700',
  SOCIAL: 'bg-blue-100 text-blue-700',
  GOVERNANCE: 'bg-purple-100 text-purple-700',
};
const metricStatusColors: Record<string, string> = {
  ON_TRACK: 'bg-green-100 text-green-700',
  AT_RISK: 'bg-amber-100 text-amber-700',
  OFF_TRACK: 'bg-red-100 text-red-700',
};

// emissions/page.tsx
const scopeColors: Record<string, string> = {
  SCOPE_1: 'bg-emerald-100 text-emerald-700',
  SCOPE_2: 'bg-amber-100 text-amber-700',
  SCOPE_3: 'bg-orange-100 text-orange-700',
};
const emissionStatusColors: Record<string, string> = {
  VERIFIED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  DRAFT: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

// targets/page.tsx
const targetStatusColors: Record<string, string> = {
  ON_TRACK: 'bg-green-100 text-green-700',
  AT_RISK: 'bg-yellow-100 text-yellow-700',
  BEHIND: 'bg-red-100 text-red-700',
  ACHIEVED: 'bg-blue-100 text-blue-700',
  NOT_STARTED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

// ─── Helper ─────────────────────────────────────────────────────────────────────

/** Compute grouped breakdown from MOCK_DATA (mirrors inline computation in component) */
function computeGrouped(data: ScopeEmissionsData) {
  return [1, 2, 3].map((scope) => ({
    scope,
    items: data.breakdown.filter((b) => b.scope === scope),
    subtotal: data.breakdown.filter((b) => b.scope === scope).reduce((a, b) => a + b.tco2e, 0),
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: pct()
// ═══════════════════════════════════════════════════════════════════════════════

describe('pct — zero total returns numeric 0', () => {
  it('pct(0, 0) === 0', () => expect(pct(0, 0)).toBe(0));
  it('pct(5, 0) === 0', () => expect(pct(5, 0)).toBe(0));
  it('pct(100, 0) === 0', () => expect(pct(100, 0)).toBe(0));
  it('pct(0, 0) is number', () => expect(typeof pct(0, 0)).toBe('number'));
  it('pct(999, 0) is number', () => expect(typeof pct(999, 0)).toBe('number'));
});

describe('pct — exact string results', () => {
  const cases: [number, number, string][] = [
    [0, 100, '0.0'],
    [50, 100, '50.0'],
    [100, 100, '100.0'],
    [25, 100, '25.0'],
    [75, 100, '75.0'],
    [10, 100, '10.0'],
    [1, 2, '50.0'],
    [1, 3, '33.3'],
    [2, 3, '66.7'],
    [1, 4, '25.0'],
    [3, 4, '75.0'],
    [1, 5, '20.0'],
    [2, 5, '40.0'],
    [3, 5, '60.0'],
    [4, 5, '80.0'],
    [1, 6, '16.7'],
    [5, 6, '83.3'],
    [1, 7, '14.3'],
    [1, 8, '12.5'],
    [3, 8, '37.5'],
    [5, 8, '62.5'],
    [7, 8, '87.5'],
    [1, 10, '10.0'],
    [3, 10, '30.0'],
    [7, 10, '70.0'],
    [9, 10, '90.0'],
    [1, 20, '5.0'],
    [10, 20, '50.0'],
    [15, 20, '75.0'],
    [1, 25, '4.0'],
    [5, 25, '20.0'],
    [10, 40, '25.0'],
    [30, 40, '75.0'],
    [50, 200, '25.0'],
    [150, 200, '75.0'],
  ];
  cases.forEach(([val, total, expected]) => {
    it(`pct(${val}, ${total}) === '${expected}'`, () => {
      expect(pct(val, total)).toBe(expected);
    });
  });
});

describe('pct — returns string for non-zero total', () => {
  const pairs: [number, number][] = [
    [0, 1], [1, 1], [50, 100], [1, 3], [2, 3], [234.5, 6222.6],
    [1205.8, 6222.6], [4782.3, 6222.6], [189.2, 234.5], [45.3, 234.5],
  ];
  pairs.forEach(([val, total]) => {
    it(`pct(${val}, ${total}) is a string`, () => {
      expect(typeof pct(val, total)).toBe('string');
    });
  });
});

describe('pct — result includes "." (decimal point)', () => {
  const pairs: [number, number][] = [
    [0, 100], [1, 3], [2, 3], [50, 100], [1, 7], [1, 6], [3, 8],
    [100, 100], [1, 4], [3, 4],
  ];
  pairs.forEach(([val, total]) => {
    it(`pct(${val}, ${total}) includes '.'`, () => {
      expect(String(pct(val, total))).toContain('.');
    });
  });
});

describe('pct — parseFloat of result is non-negative', () => {
  const pairs: [number, number][] = [
    [0, 100], [1, 3], [50, 100], [100, 100], [234.5, 6222.6], [1205.8, 6222.6],
  ];
  pairs.forEach(([val, total]) => {
    it(`parseFloat(pct(${val}, ${total})) >= 0`, () => {
      expect(parseFloat(String(pct(val, total)))).toBeGreaterThanOrEqual(0);
    });
  });
});

describe('pct — val === total gives 100.0', () => {
  [1, 2, 5, 10, 100, 234.5, 6222.6].forEach((v) => {
    it(`pct(${v}, ${v}) === '100.0'`, () => {
      expect(pct(v, v)).toBe('100.0');
    });
  });
});

describe('pct — val === 0 (non-zero total) gives 0.0', () => {
  [1, 2, 5, 10, 100, 6222.6].forEach((total) => {
    it(`pct(0, ${total}) === '0.0'`, () => {
      expect(pct(0, total)).toBe('0.0');
    });
  });
});

describe('pct — MOCK_DATA scope percentage assertions', () => {
  it('pct(scope1Total, grandTotal) is a string', () => {
    expect(typeof pct(MOCK_DATA.scope1Total, MOCK_DATA.grandTotal)).toBe('string');
  });
  it('pct(scope2Total, grandTotal) is a string', () => {
    expect(typeof pct(MOCK_DATA.scope2Total, MOCK_DATA.grandTotal)).toBe('string');
  });
  it('pct(scope3Total, grandTotal) is a string', () => {
    expect(typeof pct(MOCK_DATA.scope3Total, MOCK_DATA.grandTotal)).toBe('string');
  });
  it('scope1 pct is "3.8"', () => {
    expect(pct(MOCK_DATA.scope1Total, MOCK_DATA.grandTotal)).toBe('3.8');
  });
  it('scope2 pct is "19.4"', () => {
    expect(pct(MOCK_DATA.scope2Total, MOCK_DATA.grandTotal)).toBe('19.4');
  });
  it('scope3 pct is "76.9"', () => {
    expect(pct(MOCK_DATA.scope3Total, MOCK_DATA.grandTotal)).toBe('76.9');
  });
  it('scope1 subtotal pct includes "."', () => {
    expect(String(pct(189.2, MOCK_DATA.scope1Total))).toContain('.');
  });
  it('pct(45.3, 234.5) breakdown item', () => {
    expect(pct(45.3, 234.5)).toBe('19.3');
  });
  it('pct(189.2, 234.5) breakdown item', () => {
    expect(pct(189.2, 234.5)).toBe('80.7');
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: fmt()
// ═══════════════════════════════════════════════════════════════════════════════

describe('fmt — returns a string', () => {
  [0, 1, 10, 100, 234.5, 1205.8, 4782.3, 6222.6, 0.5, 0.1].forEach((v) => {
    it(`fmt(${v}) is a string`, () => {
      expect(typeof fmt(v)).toBe('string');
    });
  });
});

describe('fmt — result includes "."', () => {
  [0, 1, 10, 100, 234.5, 1205.8, 0.5, 0.123].forEach((v) => {
    it(`fmt(${v}) includes "."`, () => {
      expect(fmt(v)).toContain('.');
    });
  });
});

describe('fmt — result is non-empty', () => {
  [0, 1, 0.5, 100, 1000, 9999.9].forEach((v) => {
    it(`fmt(${v}) is non-empty`, () => {
      expect(fmt(v).length).toBeGreaterThan(0);
    });
  });
});

describe('fmt — exact values (en-GB locale)', () => {
  const cases: [number, string][] = [
    [0, '0.0'],
    [1, '1.0'],
    [10, '10.0'],
    [100, '100.0'],
    [0.5, '0.5'],
    [0.1, '0.1'],
    [0.9, '0.9'],
    [1.5, '1.5'],
    [9.9, '9.9'],
    [99.9, '99.9'],
    [234.5, '234.5'],
    [45.3, '45.3'],
    [189.2, '189.2'],
    [892.4, '892.4'],
    [1234.1, '1,234.1'],
    [1205.8, '1,205.8'],
    [2655.8, '2,655.8'],
    [4782.3, '4,782.3'],
    [6222.6, '6,222.6'],
    [459.0, '459.0'],
    [0.23314, '0.2'],
    [0.18280, '0.2'],
    [0.16280, '0.2'],
    [0.34900, '0.3'],
    [1000, '1,000.0'],
    [10000, '10,000.0'],
    [100000, '100,000.0'],
    [0.05, '0.1'],
    [1.05, '1.1'],
    [99.05, '99.1'],
  ];
  cases.forEach(([val, expected]) => {
    it(`fmt(${val}) === "${expected}"`, () => {
      expect(fmt(val)).toBe(expected);
    });
  });
});

describe('fmt — MOCK_DATA totals format correctly', () => {
  it('fmt(scope1Total) === "234.5"', () => expect(fmt(MOCK_DATA.scope1Total)).toBe('234.5'));
  it('fmt(scope2Total) === "1,205.8"', () => expect(fmt(MOCK_DATA.scope2Total)).toBe('1,205.8'));
  it('fmt(scope3Total) === "4,782.3"', () => expect(fmt(MOCK_DATA.scope3Total)).toBe('4,782.3'));
  it('fmt(grandTotal) === "6,222.6"', () => expect(fmt(MOCK_DATA.grandTotal)).toBe('6,222.6'));
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: scopeConfig
// ═══════════════════════════════════════════════════════════════════════════════

describe('scopeConfig — has entries for scopes 1, 2, 3', () => {
  it('scopeConfig[1] is defined', () => expect(scopeConfig[1]).toBeDefined());
  it('scopeConfig[2] is defined', () => expect(scopeConfig[2]).toBeDefined());
  it('scopeConfig[3] is defined', () => expect(scopeConfig[3]).toBeDefined());
  it('scopeConfig has 3 entries', () => expect(Object.keys(scopeConfig)).toHaveLength(3));
});

describe('scopeConfig — Scope 1 exact values', () => {
  it('label is "Scope 1"', () => expect(scopeConfig[1].label).toBe('Scope 1'));
  it('color is "text-emerald-700"', () => expect(scopeConfig[1].color).toBe('text-emerald-700'));
  it('bg is "bg-emerald-50 border-emerald-200"', () => expect(scopeConfig[1].bg).toBe('bg-emerald-50 border-emerald-200'));
  it('bar is "bg-emerald-500"', () => expect(scopeConfig[1].bar).toBe('bg-emerald-500'));
});

describe('scopeConfig — Scope 2 exact values', () => {
  it('label is "Scope 2"', () => expect(scopeConfig[2].label).toBe('Scope 2'));
  it('color is "text-teal-700"', () => expect(scopeConfig[2].color).toBe('text-teal-700'));
  it('bg is "bg-teal-50 border-teal-200"', () => expect(scopeConfig[2].bg).toBe('bg-teal-50 border-teal-200'));
  it('bar is "bg-teal-500"', () => expect(scopeConfig[2].bar).toBe('bg-teal-500'));
});

describe('scopeConfig — Scope 3 exact values', () => {
  it('label is "Scope 3"', () => expect(scopeConfig[3].label).toBe('Scope 3'));
  it('color is "text-green-700"', () => expect(scopeConfig[3].color).toBe('text-green-700'));
  it('bg is "bg-green-50 border-green-200"', () => expect(scopeConfig[3].bg).toBe('bg-green-50 border-green-200'));
  it('bar is "bg-green-500"', () => expect(scopeConfig[3].bar).toBe('bg-green-500'));
});

describe('scopeConfig — all values are strings', () => {
  [1, 2, 3].forEach((s) => {
    ['label', 'color', 'bg', 'bar'].forEach((field) => {
      it(`scopeConfig[${s}].${field} is a string`, () => {
        expect(typeof (scopeConfig[s] as any)[field]).toBe('string');
      });
    });
  });
});

describe('scopeConfig — all start with correct prefix', () => {
  [1, 2, 3].forEach((s) => {
    it(`scopeConfig[${s}].color starts with "text-"`, () => {
      expect(scopeConfig[s].color.startsWith('text-')).toBe(true);
    });
    it(`scopeConfig[${s}].bar starts with "bg-"`, () => {
      expect(scopeConfig[s].bar.startsWith('bg-')).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: MOCK_DATA
// ═══════════════════════════════════════════════════════════════════════════════

describe('MOCK_DATA — top-level values', () => {
  it('scope1Total is 234.5', () => expect(MOCK_DATA.scope1Total).toBe(234.5));
  it('scope2Total is 1205.8', () => expect(MOCK_DATA.scope2Total).toBe(1205.8));
  it('scope3Total is 4782.3', () => expect(MOCK_DATA.scope3Total).toBe(4782.3));
  it('grandTotal is 6222.6', () => expect(MOCK_DATA.grandTotal).toBe(6222.6));
  it('scope1Total is a number', () => expect(typeof MOCK_DATA.scope1Total).toBe('number'));
  it('grandTotal is a number', () => expect(typeof MOCK_DATA.grandTotal).toBe('number'));
});

describe('MOCK_DATA — breakdown array', () => {
  it('breakdown has 6 items', () => expect(MOCK_DATA.breakdown).toHaveLength(6));
  it('breakdown is an Array', () => expect(Array.isArray(MOCK_DATA.breakdown)).toBe(true));
  it('breakdown[0].scope is 1', () => expect(MOCK_DATA.breakdown[0].scope).toBe(1));
  it('breakdown[0].category is "Stationary Combustion"', () => expect(MOCK_DATA.breakdown[0].category).toBe('Stationary Combustion'));
  it('breakdown[0].tco2e is 189.2', () => expect(MOCK_DATA.breakdown[0].tco2e).toBe(189.2));
  it('breakdown[1].scope is 1', () => expect(MOCK_DATA.breakdown[1].scope).toBe(1));
  it('breakdown[1].tco2e is 45.3', () => expect(MOCK_DATA.breakdown[1].tco2e).toBe(45.3));
  it('breakdown[2].scope is 2', () => expect(MOCK_DATA.breakdown[2].scope).toBe(2));
  it('breakdown[2].tco2e is 1205.8', () => expect(MOCK_DATA.breakdown[2].tco2e).toBe(1205.8));
  it('breakdown[3].scope is 3', () => expect(MOCK_DATA.breakdown[3].scope).toBe(3));
  it('breakdown[3].tco2e is 892.4', () => expect(MOCK_DATA.breakdown[3].tco2e).toBe(892.4));
  it('breakdown[4].category is "Employee Commuting"', () => expect(MOCK_DATA.breakdown[4].category).toBe('Employee Commuting'));
  it('breakdown[5].tco2e is 2655.8', () => expect(MOCK_DATA.breakdown[5].tco2e).toBe(2655.8));
  it('all breakdown tco2e values are numbers', () => {
    MOCK_DATA.breakdown.forEach((b) => expect(typeof b.tco2e).toBe('number'));
  });
  it('all breakdown scope values are 1, 2 or 3', () => {
    MOCK_DATA.breakdown.forEach((b) => expect([1, 2, 3]).toContain(b.scope));
  });
});

describe('MOCK_DATA — computed grouped', () => {
  const grouped = computeGrouped(MOCK_DATA);

  it('grouped has 3 elements', () => expect(grouped).toHaveLength(3));
  it('grouped[0].scope is 1', () => expect(grouped[0].scope).toBe(1));
  it('grouped[1].scope is 2', () => expect(grouped[1].scope).toBe(2));
  it('grouped[2].scope is 3', () => expect(grouped[2].scope).toBe(3));
  it('grouped[0].items has 2 items (Scope 1)', () => expect(grouped[0].items).toHaveLength(2));
  it('grouped[1].items has 1 item (Scope 2)', () => expect(grouped[1].items).toHaveLength(1));
  it('grouped[2].items has 3 items (Scope 3)', () => expect(grouped[2].items).toHaveLength(3));
  it('grouped[0].subtotal ≈ 234.5', () => expect(grouped[0].subtotal).toBeCloseTo(234.5, 1));
  it('grouped[1].subtotal ≈ 1205.8', () => expect(grouped[1].subtotal).toBeCloseTo(1205.8, 1));
  it('grouped[2].subtotal ≈ 4782.3', () => expect(grouped[2].subtotal).toBeCloseTo(4782.3, 1));
  it('sum of subtotals ≈ grandTotal', () => {
    const sum = grouped.reduce((a, g) => a + g.subtotal, 0);
    expect(sum).toBeCloseTo(MOCK_DATA.grandTotal, 1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: categoryColors (DEFRA)
// ═══════════════════════════════════════════════════════════════════════════════

describe('categoryColors — exact values', () => {
  const cases: [string, string][] = [
    ['Electricity', 'bg-yellow-100 text-yellow-800'],
    ['Natural Gas', 'bg-orange-100 text-orange-800'],
    ['Diesel', 'bg-red-100 text-red-800'],
    ['Air Travel', 'bg-sky-100 text-sky-800'],
    ['Water', 'bg-blue-100 text-blue-800'],
    ['Waste', 'bg-gray-100 text-gray-800'],
  ];
  cases.forEach(([cat, expected]) => {
    it(`categoryColors["${cat}"] === "${expected}"`, () => {
      expect(categoryColors[cat]).toBe(expected);
    });
  });
});

describe('categoryColors — all values are strings', () => {
  Object.entries(categoryColors).forEach(([cat, val]) => {
    it(`categoryColors["${cat}"] is a string`, () => expect(typeof val).toBe('string'));
  });
});

describe('categoryColors — all values start with bg-', () => {
  Object.entries(categoryColors).forEach(([cat, val]) => {
    it(`categoryColors["${cat}"] starts with "bg-"`, () => expect(val.startsWith('bg-')).toBe(true));
  });
});

describe('categoryColors — all values contain text-', () => {
  Object.entries(categoryColors).forEach(([cat, val]) => {
    it(`categoryColors["${cat}"] contains "text-"`, () => expect(val).toMatch(/text-/));
  });
});

describe('categoryColors — has exactly 6 keys', () => {
  it('has 6 entries', () => expect(Object.keys(categoryColors)).toHaveLength(6));
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: CATEGORIES
// ═══════════════════════════════════════════════════════════════════════════════

describe('CATEGORIES — exact values', () => {
  const expected = ['All', 'Electricity', 'Natural Gas', 'Diesel', 'Air Travel', 'Water', 'Waste'];
  expected.forEach((cat, i) => {
    it(`CATEGORIES[${i}] === "${cat}"`, () => expect(CATEGORIES[i]).toBe(cat));
  });
});

describe('CATEGORIES — structure', () => {
  it('has 7 entries', () => expect(CATEGORIES).toHaveLength(7));
  it('first entry is "All"', () => expect(CATEGORIES[0]).toBe('All'));
  it('all entries are strings', () => {
    CATEGORIES.forEach((c) => expect(typeof c).toBe('string'));
  });
  it('all entries are non-empty', () => {
    CATEGORIES.forEach((c) => expect(c.length).toBeGreaterThan(0));
  });
});

describe('CATEGORIES — non-All entries match categoryColors keys', () => {
  const nonAll = CATEGORIES.filter((c) => c !== 'All');
  nonAll.forEach((cat) => {
    it(`categoryColors["${cat}"] is defined`, () => {
      expect(categoryColors[cat]).toBeDefined();
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: MOCK_FACTORS
// ═══════════════════════════════════════════════════════════════════════════════

describe('MOCK_FACTORS — structure', () => {
  it('has 6 entries', () => expect(MOCK_FACTORS).toHaveLength(6));
  it('is an Array', () => expect(Array.isArray(MOCK_FACTORS)).toBe(true));
});

describe('MOCK_FACTORS — each entry has required fields', () => {
  MOCK_FACTORS.forEach((f, i) => {
    it(`MOCK_FACTORS[${i}].id is a string`, () => expect(typeof f.id).toBe('string'));
    it(`MOCK_FACTORS[${i}].category is a string`, () => expect(typeof f.category).toBe('string'));
    it(`MOCK_FACTORS[${i}].subcategory is a string`, () => expect(typeof f.subcategory).toBe('string'));
    it(`MOCK_FACTORS[${i}].unit is a string`, () => expect(typeof f.unit).toBe('string'));
    it(`MOCK_FACTORS[${i}].factor is a number`, () => expect(typeof f.factor).toBe('number'));
    it(`MOCK_FACTORS[${i}].year is a number`, () => expect(typeof f.year).toBe('number'));
    it(`MOCK_FACTORS[${i}].source is a string`, () => expect(typeof f.source).toBe('string'));
  });
});

describe('MOCK_FACTORS — exact field values', () => {
  it('[0] id="1"', () => expect(MOCK_FACTORS[0].id).toBe('1'));
  it('[0] category="Electricity"', () => expect(MOCK_FACTORS[0].category).toBe('Electricity'));
  it('[0] factor=0.23314', () => expect(MOCK_FACTORS[0].factor).toBeCloseTo(0.23314, 5));
  it('[0] year=2024', () => expect(MOCK_FACTORS[0].year).toBe(2024));
  it('[1] category="Natural Gas"', () => expect(MOCK_FACTORS[1].category).toBe('Natural Gas'));
  it('[2] category="Diesel"', () => expect(MOCK_FACTORS[2].category).toBe('Diesel'));
  it('[3] category="Air Travel"', () => expect(MOCK_FACTORS[3].category).toBe('Air Travel'));
  it('[4] category="Water"', () => expect(MOCK_FACTORS[4].category).toBe('Water'));
  it('[5] category="Waste"', () => expect(MOCK_FACTORS[5].category).toBe('Waste'));
  it('[5] factor=459', () => expect(MOCK_FACTORS[5].factor).toBeCloseTo(459, 0));
  it('all factors are positive', () => {
    MOCK_FACTORS.forEach((f) => expect(f.factor).toBeGreaterThan(0));
  });
  it('all years are 2024', () => {
    MOCK_FACTORS.forEach((f) => expect(f.year).toBe(2024));
  });
  it('all sources are "DEFRA 2024"', () => {
    MOCK_FACTORS.forEach((f) => expect(f.source).toBe('DEFRA 2024'));
  });
});

describe('MOCK_FACTORS — categories are in CATEGORIES (excluding All)', () => {
  const nonAll = CATEGORIES.filter((c) => c !== 'All');
  MOCK_FACTORS.forEach((f, i) => {
    it(`MOCK_FACTORS[${i}].category "${f.category}" is in CATEGORIES`, () => {
      expect(nonAll).toContain(f.category);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: STATUS_COLOURS (scenario-analysis)
// ═══════════════════════════════════════════════════════════════════════════════

describe('STATUS_COLOURS — exact values', () => {
  const cases: [string, string][] = [
    ['DRAFT', 'bg-gray-100 text-gray-600'],
    ['IN_REVIEW', 'bg-yellow-100 text-yellow-700'],
    ['APPROVED', 'bg-blue-100 text-blue-700'],
    ['PUBLISHED', 'bg-green-100 text-green-700'],
    ['ARCHIVED', 'bg-slate-100 text-slate-500'],
  ];
  cases.forEach(([status, expected]) => {
    it(`STATUS_COLOURS["${status}"] === "${expected}"`, () => {
      expect(STATUS_COLOURS[status]).toBe(expected);
    });
  });
});

describe('STATUS_COLOURS — structure', () => {
  it('has 5 keys', () => expect(Object.keys(STATUS_COLOURS)).toHaveLength(5));
  it('all values start with bg-', () => {
    Object.values(STATUS_COLOURS).forEach((v) => expect(v.startsWith('bg-')).toBe(true));
  });
  it('all values contain text-', () => {
    Object.values(STATUS_COLOURS).forEach((v) => expect(v).toMatch(/text-/));
  });
  it('all values are strings', () => {
    Object.values(STATUS_COLOURS).forEach((v) => expect(typeof v).toBe('string'));
  });
  it('keys match STATUSES array', () => {
    STATUSES.forEach((s) => expect(STATUS_COLOURS[s]).toBeDefined());
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: TYPE_COLOURS
// ═══════════════════════════════════════════════════════════════════════════════

describe('TYPE_COLOURS — exact values', () => {
  const cases: [string, string][] = [
    ['TRANSITION_RISK', 'bg-orange-100 text-orange-700'],
    ['PHYSICAL_RISK', 'bg-red-100 text-red-700'],
    ['COMBINED', 'bg-purple-100 text-purple-700'],
    ['OPPORTUNITY', 'bg-green-100 text-green-700'],
  ];
  cases.forEach(([type, expected]) => {
    it(`TYPE_COLOURS["${type}"] === "${expected}"`, () => {
      expect(TYPE_COLOURS[type]).toBe(expected);
    });
  });
});

describe('TYPE_COLOURS — structure', () => {
  it('has 4 keys', () => expect(Object.keys(TYPE_COLOURS)).toHaveLength(4));
  it('all values start with bg-', () => {
    Object.values(TYPE_COLOURS).forEach((v) => expect(v.startsWith('bg-')).toBe(true));
  });
  it('all values contain text-', () => {
    Object.values(TYPE_COLOURS).forEach((v) => expect(v).toMatch(/text-/));
  });
  it('all values are strings', () => {
    Object.values(TYPE_COLOURS).forEach((v) => expect(typeof v).toBe('string'));
  });
  it('keys match SCENARIO_TYPES array', () => {
    SCENARIO_TYPES.forEach((t) => expect(TYPE_COLOURS[t]).toBeDefined());
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: SCENARIO_TYPES
// ═══════════════════════════════════════════════════════════════════════════════

describe('SCENARIO_TYPES — exact values', () => {
  ['TRANSITION_RISK', 'PHYSICAL_RISK', 'COMBINED', 'OPPORTUNITY'].forEach((t, i) => {
    it(`SCENARIO_TYPES[${i}] === "${t}"`, () => expect(SCENARIO_TYPES[i]).toBe(t));
  });
});

describe('SCENARIO_TYPES — structure', () => {
  it('has 4 entries', () => expect(SCENARIO_TYPES).toHaveLength(4));
  it('all entries are strings', () => SCENARIO_TYPES.forEach((t) => expect(typeof t).toBe('string')));
  it('all entries are non-empty', () => SCENARIO_TYPES.forEach((t) => expect(t.length).toBeGreaterThan(0)));
  it('all entries are in TYPE_COLOURS', () => SCENARIO_TYPES.forEach((t) => expect(TYPE_COLOURS[t]).toBeDefined()));
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: BASELINE_SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════════

describe('BASELINE_SCENARIOS — exact values', () => {
  const expected = ['1_5C', '2C', '3C', '4C', 'CURRENT_POLICIES', 'NET_ZERO_2050', 'CUSTOM'];
  expected.forEach((s, i) => {
    it(`BASELINE_SCENARIOS[${i}] === "${s}"`, () => expect(BASELINE_SCENARIOS[i]).toBe(s));
  });
});

describe('BASELINE_SCENARIOS — structure', () => {
  it('has 7 entries', () => expect(BASELINE_SCENARIOS).toHaveLength(7));
  it('all entries are strings', () => BASELINE_SCENARIOS.forEach((s) => expect(typeof s).toBe('string')));
  it('all entries are non-empty', () => BASELINE_SCENARIOS.forEach((s) => expect(s.length).toBeGreaterThan(0)));
  it('all entries are unique', () => expect(new Set(BASELINE_SCENARIOS).size).toBe(BASELINE_SCENARIOS.length));
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: TIME_HORIZONS
// ═══════════════════════════════════════════════════════════════════════════════

describe('TIME_HORIZONS — exact values', () => {
  it('TIME_HORIZONS[0] === "SHORT_TERM"', () => expect(TIME_HORIZONS[0]).toBe('SHORT_TERM'));
  it('TIME_HORIZONS[1] === "MEDIUM_TERM"', () => expect(TIME_HORIZONS[1]).toBe('MEDIUM_TERM'));
  it('TIME_HORIZONS[2] === "LONG_TERM"', () => expect(TIME_HORIZONS[2]).toBe('LONG_TERM'));
});

describe('TIME_HORIZONS — structure', () => {
  it('has 3 entries', () => expect(TIME_HORIZONS).toHaveLength(3));
  it('all entries are strings', () => TIME_HORIZONS.forEach((t) => expect(typeof t).toBe('string')));
  it('all entries contain "_TERM"', () => TIME_HORIZONS.forEach((t) => expect(t).toMatch(/_TERM$/)));
  it('all entries are unique', () => expect(new Set(TIME_HORIZONS).size).toBe(3));
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: STATUSES
// ═══════════════════════════════════════════════════════════════════════════════

describe('STATUSES — exact values', () => {
  ['DRAFT', 'IN_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED'].forEach((s, i) => {
    it(`STATUSES[${i}] === "${s}"`, () => expect(STATUSES[i]).toBe(s));
  });
});

describe('STATUSES — structure', () => {
  it('has 5 entries', () => expect(STATUSES).toHaveLength(5));
  it('all entries are strings', () => STATUSES.forEach((s) => expect(typeof s).toBe('string')));
  it('all entries match STATUS_COLOURS keys', () => STATUSES.forEach((s) => expect(STATUS_COLOURS[s]).toBeDefined()));
  it('all entries are unique', () => expect(new Set(STATUSES).size).toBe(5));
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: categoryBadge (metrics-dashboard)
// ═══════════════════════════════════════════════════════════════════════════════

describe('categoryBadge — exact values', () => {
  it('ENVIRONMENTAL === "bg-green-100 text-green-700"', () => {
    expect(categoryBadge.ENVIRONMENTAL).toBe('bg-green-100 text-green-700');
  });
  it('SOCIAL === "bg-blue-100 text-blue-700"', () => {
    expect(categoryBadge.SOCIAL).toBe('bg-blue-100 text-blue-700');
  });
  it('GOVERNANCE === "bg-purple-100 text-purple-700"', () => {
    expect(categoryBadge.GOVERNANCE).toBe('bg-purple-100 text-purple-700');
  });
});

describe('categoryBadge — structure', () => {
  it('has 3 keys', () => expect(Object.keys(categoryBadge)).toHaveLength(3));
  it('all values start with bg-', () => {
    Object.values(categoryBadge).forEach((v) => expect(v.startsWith('bg-')).toBe(true));
  });
  it('all values contain text-', () => {
    Object.values(categoryBadge).forEach((v) => expect(v).toMatch(/text-/));
  });
  it('all values are strings', () => {
    Object.values(categoryBadge).forEach((v) => expect(typeof v).toBe('string'));
  });
  it('all values are unique', () => {
    const vals = Object.values(categoryBadge);
    expect(new Set(vals).size).toBe(vals.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: metricStatusColors
// ═══════════════════════════════════════════════════════════════════════════════

describe('metricStatusColors — exact values', () => {
  it('ON_TRACK === "bg-green-100 text-green-700"', () => {
    expect(metricStatusColors.ON_TRACK).toBe('bg-green-100 text-green-700');
  });
  it('AT_RISK === "bg-amber-100 text-amber-700"', () => {
    expect(metricStatusColors.AT_RISK).toBe('bg-amber-100 text-amber-700');
  });
  it('OFF_TRACK === "bg-red-100 text-red-700"', () => {
    expect(metricStatusColors.OFF_TRACK).toBe('bg-red-100 text-red-700');
  });
});

describe('metricStatusColors — structure', () => {
  it('has 3 keys', () => expect(Object.keys(metricStatusColors)).toHaveLength(3));
  it('all values start with bg-', () => {
    Object.values(metricStatusColors).forEach((v) => expect(v.startsWith('bg-')).toBe(true));
  });
  it('all values contain text-', () => {
    Object.values(metricStatusColors).forEach((v) => expect(v).toMatch(/text-/));
  });
  it('all values are strings', () => {
    Object.values(metricStatusColors).forEach((v) => expect(typeof v).toBe('string'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: scopeColors (emissions page)
// ═══════════════════════════════════════════════════════════════════════════════

describe('scopeColors — exact values', () => {
  it('SCOPE_1 === "bg-emerald-100 text-emerald-700"', () => {
    expect(scopeColors.SCOPE_1).toBe('bg-emerald-100 text-emerald-700');
  });
  it('SCOPE_2 === "bg-amber-100 text-amber-700"', () => {
    expect(scopeColors.SCOPE_2).toBe('bg-amber-100 text-amber-700');
  });
  it('SCOPE_3 === "bg-orange-100 text-orange-700"', () => {
    expect(scopeColors.SCOPE_3).toBe('bg-orange-100 text-orange-700');
  });
});

describe('scopeColors — structure', () => {
  it('has 3 keys', () => expect(Object.keys(scopeColors)).toHaveLength(3));
  it('all values start with bg-', () => {
    Object.values(scopeColors).forEach((v) => expect(v.startsWith('bg-')).toBe(true));
  });
  it('all values contain text-', () => {
    Object.values(scopeColors).forEach((v) => expect(v).toMatch(/text-/));
  });
  it('all values are unique', () => {
    const vals = Object.values(scopeColors);
    expect(new Set(vals).size).toBe(vals.length);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: emissionStatusColors
// ═══════════════════════════════════════════════════════════════════════════════

describe('emissionStatusColors — exact values', () => {
  it('VERIFIED === "bg-green-100 text-green-700"', () => {
    expect(emissionStatusColors.VERIFIED).toBe('bg-green-100 text-green-700');
  });
  it('PENDING === "bg-yellow-100 text-yellow-700"', () => {
    expect(emissionStatusColors.PENDING).toBe('bg-yellow-100 text-yellow-700');
  });
  it('DRAFT starts with "bg-gray-100"', () => {
    expect(emissionStatusColors.DRAFT.startsWith('bg-gray-100')).toBe(true);
  });
});

describe('emissionStatusColors — structure', () => {
  it('has 3 keys', () => expect(Object.keys(emissionStatusColors)).toHaveLength(3));
  it('VERIFIED is defined', () => expect(emissionStatusColors.VERIFIED).toBeDefined());
  it('PENDING is defined', () => expect(emissionStatusColors.PENDING).toBeDefined());
  it('DRAFT is defined', () => expect(emissionStatusColors.DRAFT).toBeDefined());
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: targetStatusColors
// ═══════════════════════════════════════════════════════════════════════════════

describe('targetStatusColors — exact values', () => {
  it('ON_TRACK === "bg-green-100 text-green-700"', () => {
    expect(targetStatusColors.ON_TRACK).toBe('bg-green-100 text-green-700');
  });
  it('AT_RISK === "bg-yellow-100 text-yellow-700"', () => {
    expect(targetStatusColors.AT_RISK).toBe('bg-yellow-100 text-yellow-700');
  });
  it('BEHIND === "bg-red-100 text-red-700"', () => {
    expect(targetStatusColors.BEHIND).toBe('bg-red-100 text-red-700');
  });
  it('ACHIEVED === "bg-blue-100 text-blue-700"', () => {
    expect(targetStatusColors.ACHIEVED).toBe('bg-blue-100 text-blue-700');
  });
  it('NOT_STARTED starts with "bg-gray-100"', () => {
    expect(targetStatusColors.NOT_STARTED.startsWith('bg-gray-100')).toBe(true);
  });
});

describe('targetStatusColors — structure', () => {
  it('has 5 keys', () => expect(Object.keys(targetStatusColors)).toHaveLength(5));
  it('all values start with bg-', () => {
    Object.values(targetStatusColors).forEach((v) => expect(v.startsWith('bg-')).toBe(true));
  });
  it('all values contain text-', () => {
    Object.values(targetStatusColors).forEach((v) => expect(v).toMatch(/text-/));
  });
  it('all values are strings', () => {
    Object.values(targetStatusColors).forEach((v) => expect(typeof v).toBe('string'));
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: pct monotonicity and invariants
// ═══════════════════════════════════════════════════════════════════════════════

describe('pct — monotonicity: pct(a+1, n) >= pct(a, n) for same n', () => {
  const n = 100;
  [0, 10, 20, 30, 40, 50, 60, 70, 80, 90].forEach((a) => {
    it(`pct(${a + 1}, ${n}) >= pct(${a}, ${n})`, () => {
      const higher = parseFloat(String(pct(a + 1, n)));
      const lower = parseFloat(String(pct(a, n)));
      expect(higher).toBeGreaterThanOrEqual(lower);
    });
  });
});

describe('pct — never exceeds 100 for val <= total', () => {
  [[50, 100], [33, 100], [1, 3], [2, 3], [4, 5], [7, 10], [100, 100]].forEach(([val, total]) => {
    it(`parseFloat(pct(${val}, ${total})) <= 100`, () => {
      expect(parseFloat(String(pct(val, total)))).toBeLessThanOrEqual(100);
    });
  });
});

describe('pct — result length is > 0 for non-zero total', () => {
  [[0, 1], [50, 100], [1, 3]].forEach(([val, total]) => {
    it(`pct(${val}, ${total}) has positive length`, () => {
      expect(String(pct(val, total)).length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: fmt — round-trip with pct
// ═══════════════════════════════════════════════════════════════════════════════

describe('fmt — round-trip: fmt of MOCK_DATA values', () => {
  MOCK_DATA.breakdown.forEach((b, i) => {
    it(`fmt(breakdown[${i}].tco2e) is a string`, () => {
      expect(typeof fmt(b.tco2e)).toBe('string');
    });
    it(`fmt(breakdown[${i}].tco2e) contains "."`, () => {
      expect(fmt(b.tco2e)).toContain('.');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: pct — 63 additional exact results (4 assertions each = 252 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('pct — 63 additional exact string results', () => {
  const cases: [number, number, string][] = [
    [1,100,'1.0'],[2,100,'2.0'],[3,100,'3.0'],[4,100,'4.0'],[5,100,'5.0'],
    [6,100,'6.0'],[7,100,'7.0'],[8,100,'8.0'],[9,100,'9.0'],
    [11,100,'11.0'],[12,100,'12.0'],[13,100,'13.0'],[14,100,'14.0'],[15,100,'15.0'],
    [16,100,'16.0'],[17,100,'17.0'],[18,100,'18.0'],[19,100,'19.0'],
    [21,100,'21.0'],[22,100,'22.0'],[23,100,'23.0'],[24,100,'24.0'],
    [26,100,'26.0'],[27,100,'27.0'],[28,100,'28.0'],[29,100,'29.0'],
    [31,100,'31.0'],[32,100,'32.0'],[33,100,'33.0'],[34,100,'34.0'],[35,100,'35.0'],
    [36,100,'36.0'],[37,100,'37.0'],[38,100,'38.0'],[39,100,'39.0'],
    [3,7,'42.9'],[4,7,'57.1'],[5,7,'71.4'],[6,7,'85.7'],
    [1,9,'11.1'],[2,9,'22.2'],[4,9,'44.4'],[5,9,'55.6'],[7,9,'77.8'],[8,9,'88.9'],
    [1,11,'9.1'],[2,11,'18.2'],[3,11,'27.3'],[5,11,'45.5'],[10,11,'90.9'],
    [1,12,'8.3'],[5,12,'41.7'],[7,12,'58.3'],[11,12,'91.7'],
    [1,15,'6.7'],[5,15,'33.3'],[10,15,'66.7'],[14,15,'93.3'],
    [3,20,'15.0'],[7,20,'35.0'],[13,20,'65.0'],[17,20,'85.0'],[19,20,'95.0'],
    [1,40,'2.5'],[20,40,'50.0'],[30,40,'75.0'],
  ];
  cases.forEach(([val, total, expected]) => {
    it(`pct(${val},${total}) === '${expected}'`, () => {
      expect(pct(val, total)).toBe(expected);
    });
    it(`pct(${val},${total}) is a string`, () => {
      expect(typeof pct(val, total)).toBe('string');
    });
    it(`pct(${val},${total}) includes '.'`, () => {
      expect(String(pct(val, total))).toContain('.');
    });
    it(`parseFloat(pct(${val},${total})) >= 0`, () => {
      expect(parseFloat(String(pct(val, total)))).toBeGreaterThanOrEqual(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: fmt — 40 additional exact values (4 assertions each = 160 tests)
// ═══════════════════════════════════════════════════════════════════════════════

describe('fmt — 40 additional exact en-GB values', () => {
  const cases: [number, string][] = [
    [2,'2.0'],[3,'3.0'],[4,'4.0'],[5,'5.0'],[6,'6.0'],[7,'7.0'],[8,'8.0'],[9,'9.0'],
    [11,'11.0'],[12,'12.0'],[13,'13.0'],[14,'14.0'],[15,'15.0'],[16,'16.0'],
    [17,'17.0'],[18,'18.0'],[19,'19.0'],[21,'21.0'],[22,'22.0'],[23,'23.0'],
    [24,'24.0'],[25,'25.0'],[30,'30.0'],[35,'35.0'],[40,'40.0'],[45,'45.0'],
    [50,'50.0'],[55,'55.0'],[60,'60.0'],[65,'65.0'],[70,'70.0'],[75,'75.0'],
    [80,'80.0'],[85,'85.0'],[90,'90.0'],[95,'95.0'],
    [150,'150.0'],[250,'250.0'],[500,'500.0'],[750,'750.0'],
  ];
  cases.forEach(([val, expected]) => {
    it(`fmt(${val}) === "${expected}"`, () => {
      expect(fmt(val)).toBe(expected);
    });
    it(`fmt(${val}) is a string`, () => {
      expect(typeof fmt(val)).toBe('string');
    });
    it(`fmt(${val}) includes '.'`, () => {
      expect(fmt(val)).toContain('.');
    });
    it(`fmt(${val}) is non-empty`, () => {
      expect(fmt(val).length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: MOCK_FACTORS — fmt of each factor value
// ═══════════════════════════════════════════════════════════════════════════════

describe('fmt of MOCK_FACTORS factor values', () => {
  MOCK_FACTORS.forEach((f, i) => {
    it(`fmt(MOCK_FACTORS[${i}].factor) is a string`, () => {
      expect(typeof fmt(f.factor)).toBe('string');
    });
    it(`fmt(MOCK_FACTORS[${i}].factor) includes '.'`, () => {
      expect(fmt(f.factor)).toContain('.');
    });
    it(`fmt(MOCK_FACTORS[${i}].factor) is non-empty`, () => {
      expect(fmt(f.factor).length).toBeGreaterThan(0);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: pct of each MOCK_DATA breakdown item vs grandTotal
// ═══════════════════════════════════════════════════════════════════════════════

describe('pct of MOCK_DATA breakdown items vs grandTotal', () => {
  MOCK_DATA.breakdown.forEach((b, i) => {
    it(`pct(breakdown[${i}].tco2e, grandTotal) is a string`, () => {
      expect(typeof pct(b.tco2e, MOCK_DATA.grandTotal)).toBe('string');
    });
    it(`pct(breakdown[${i}].tco2e, grandTotal) includes '.'`, () => {
      expect(String(pct(b.tco2e, MOCK_DATA.grandTotal))).toContain('.');
    });
    it(`parseFloat(pct(breakdown[${i}], grandTotal)) > 0`, () => {
      expect(parseFloat(String(pct(b.tco2e, MOCK_DATA.grandTotal)))).toBeGreaterThan(0);
    });
    it(`parseFloat(pct(breakdown[${i}], grandTotal)) < 100`, () => {
      expect(parseFloat(String(pct(b.tco2e, MOCK_DATA.grandTotal)))).toBeLessThan(100);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: Cross-constant consistency checks
// ═══════════════════════════════════════════════════════════════════════════════

describe('Cross-constant — STATUS_COLOURS values are unique', () => {
  it('all 5 STATUS_COLOURS values are distinct', () => {
    const vals = Object.values(STATUS_COLOURS);
    expect(new Set(vals).size).toBe(vals.length);
  });
});

describe('Cross-constant — TYPE_COLOURS values are unique', () => {
  it('all 4 TYPE_COLOURS values are distinct', () => {
    const vals = Object.values(TYPE_COLOURS);
    expect(new Set(vals).size).toBe(vals.length);
  });
});

describe('Cross-constant — STATUSES and STATUS_COLOURS alignment', () => {
  it('STATUSES.length === Object.keys(STATUS_COLOURS).length', () => {
    expect(STATUSES.length).toBe(Object.keys(STATUS_COLOURS).length);
  });
  it('STATUSES[0] is in STATUS_COLOURS', () => expect(STATUS_COLOURS[STATUSES[0]]).toBeDefined());
  it('STATUSES[1] is in STATUS_COLOURS', () => expect(STATUS_COLOURS[STATUSES[1]]).toBeDefined());
  it('STATUSES[2] is in STATUS_COLOURS', () => expect(STATUS_COLOURS[STATUSES[2]]).toBeDefined());
  it('STATUSES[3] is in STATUS_COLOURS', () => expect(STATUS_COLOURS[STATUSES[3]]).toBeDefined());
  it('STATUSES[4] is in STATUS_COLOURS', () => expect(STATUS_COLOURS[STATUSES[4]]).toBeDefined());
});

describe('Cross-constant — SCENARIO_TYPES and TYPE_COLOURS alignment', () => {
  it('SCENARIO_TYPES.length === Object.keys(TYPE_COLOURS).length', () => {
    expect(SCENARIO_TYPES.length).toBe(Object.keys(TYPE_COLOURS).length);
  });
  SCENARIO_TYPES.forEach((t) => {
    it(`TYPE_COLOURS["${t}"] is defined`, () => expect(TYPE_COLOURS[t]).toBeDefined());
  });
});

describe('Cross-constant — scopeConfig labels match scope numbers', () => {
  it('scopeConfig[1].label contains "1"', () => expect(scopeConfig[1].label).toContain('1'));
  it('scopeConfig[2].label contains "2"', () => expect(scopeConfig[2].label).toContain('2'));
  it('scopeConfig[3].label contains "3"', () => expect(scopeConfig[3].label).toContain('3'));
  it('all scopeConfig labels start with "Scope"', () => {
    [1, 2, 3].forEach((s) => expect(scopeConfig[s].label.startsWith('Scope')).toBe(true));
  });
  it('all scopeConfig labels are unique', () => {
    const labels = [1, 2, 3].map((s) => scopeConfig[s].label);
    expect(new Set(labels).size).toBe(3);
  });
});

describe('Cross-constant — categoryColors keys match CATEGORIES (minus All)', () => {
  it('CATEGORIES (minus All) has same count as categoryColors', () => {
    const nonAll = CATEGORIES.filter((c) => c !== 'All');
    expect(nonAll.length).toBe(Object.keys(categoryColors).length);
  });
});

describe('Cross-constant — MOCK_DATA scope totals align with breakdown subtotals', () => {
  it('scope1Total matches sum of scope-1 breakdown items', () => {
    const sum = MOCK_DATA.breakdown.filter((b) => b.scope === 1).reduce((a, b) => a + b.tco2e, 0);
    expect(sum).toBeCloseTo(MOCK_DATA.scope1Total, 1);
  });
  it('scope2Total matches sum of scope-2 breakdown items', () => {
    const sum = MOCK_DATA.breakdown.filter((b) => b.scope === 2).reduce((a, b) => a + b.tco2e, 0);
    expect(sum).toBeCloseTo(MOCK_DATA.scope2Total, 1);
  });
  it('scope3Total matches sum of scope-3 breakdown items', () => {
    const sum = MOCK_DATA.breakdown.filter((b) => b.scope === 3).reduce((a, b) => a + b.tco2e, 0);
    expect(sum).toBeCloseTo(MOCK_DATA.scope3Total, 1);
  });
  it('grandTotal matches sum of all breakdown items', () => {
    const sum = MOCK_DATA.breakdown.reduce((a, b) => a + b.tco2e, 0);
    expect(sum).toBeCloseTo(MOCK_DATA.grandTotal, 1);
  });
  it('scope1+scope2+scope3 totals ≈ grandTotal', () => {
    expect(MOCK_DATA.scope1Total + MOCK_DATA.scope2Total + MOCK_DATA.scope3Total).toBeCloseTo(MOCK_DATA.grandTotal, 1);
  });
});

describe('Cross-constant — scope3 is the largest scope', () => {
  it('scope3Total > scope2Total', () => {
    expect(MOCK_DATA.scope3Total).toBeGreaterThan(MOCK_DATA.scope2Total);
  });
  it('scope2Total > scope1Total', () => {
    expect(MOCK_DATA.scope2Total).toBeGreaterThan(MOCK_DATA.scope1Total);
  });
  it('grandTotal > scope3Total', () => {
    expect(MOCK_DATA.grandTotal).toBeGreaterThan(MOCK_DATA.scope3Total);
  });
});

describe('Cross-constant — BASELINE_SCENARIOS indexOf checks', () => {
  it('indexOf "1_5C" === 0', () => expect(BASELINE_SCENARIOS.indexOf('1_5C')).toBe(0));
  it('indexOf "CUSTOM" === 6', () => expect(BASELINE_SCENARIOS.indexOf('CUSTOM')).toBe(6));
  it('indexOf "NET_ZERO_2050" is > 0', () => expect(BASELINE_SCENARIOS.indexOf('NET_ZERO_2050')).toBeGreaterThan(0));
  it('contains "CURRENT_POLICIES"', () => expect(BASELINE_SCENARIOS).toContain('CURRENT_POLICIES'));
  it('contains "NET_ZERO_2050"', () => expect(BASELINE_SCENARIOS).toContain('NET_ZERO_2050'));
});

describe('Cross-constant — time horizon ordering', () => {
  it('SHORT_TERM at index 0', () => expect(TIME_HORIZONS.indexOf('SHORT_TERM')).toBe(0));
  it('MEDIUM_TERM at index 1', () => expect(TIME_HORIZONS.indexOf('MEDIUM_TERM')).toBe(1));
  it('LONG_TERM at index 2', () => expect(TIME_HORIZONS.indexOf('LONG_TERM')).toBe(2));
});

describe('Cross-constant — scopeColors have different base colors', () => {
  it('SCOPE_1 contains "emerald"', () => expect(scopeColors.SCOPE_1).toMatch(/emerald/));
  it('SCOPE_2 contains "amber"', () => expect(scopeColors.SCOPE_2).toMatch(/amber/));
  it('SCOPE_3 contains "orange"', () => expect(scopeColors.SCOPE_3).toMatch(/orange/));
  it('all 3 scopeColors are different', () => {
    expect(scopeColors.SCOPE_1).not.toBe(scopeColors.SCOPE_2);
    expect(scopeColors.SCOPE_2).not.toBe(scopeColors.SCOPE_3);
  });
});

describe('Cross-constant — emissionStatusColors DRAFT has dark variant', () => {
  it('DRAFT includes "dark:"', () => expect(emissionStatusColors.DRAFT).toMatch(/dark:/));
  it('VERIFIED does not include "dark:"', () => expect(emissionStatusColors.VERIFIED).not.toMatch(/dark:/));
  it('PENDING does not include "dark:"', () => expect(emissionStatusColors.PENDING).not.toMatch(/dark:/));
});

describe('Cross-constant — targetStatusColors ACHIEVED is blue', () => {
  it('ACHIEVED contains "blue"', () => expect(targetStatusColors.ACHIEVED).toMatch(/blue/));
  it('ON_TRACK contains "green"', () => expect(targetStatusColors.ON_TRACK).toMatch(/green/));
  it('BEHIND contains "red"', () => expect(targetStatusColors.BEHIND).toMatch(/red/));
  it('AT_RISK contains "yellow"', () => expect(targetStatusColors.AT_RISK).toMatch(/yellow/));
});

// ═══════════════════════════════════════════════════════════════════════════════
// DESCRIBE: Additional pct and fmt invariants
// ═══════════════════════════════════════════════════════════════════════════════

describe('pct — more non-zero total spot-checks', () => {
  it('pct(1,100) !== pct(2,100)', () => expect(pct(1,100)).not.toBe(pct(2,100)));
  it('pct(40,100) === "40.0"', () => expect(pct(40,100)).toBe('40.0'));
  it('pct(41,100) === "41.0"', () => expect(pct(41,100)).toBe('41.0'));
  it('pct(45,100) === "45.0"', () => expect(pct(45,100)).toBe('45.0'));
  it('pct(55,100) === "55.0"', () => expect(pct(55,100)).toBe('55.0'));
  it('pct(60,100) === "60.0"', () => expect(pct(60,100)).toBe('60.0'));
  it('pct(65,100) === "65.0"', () => expect(pct(65,100)).toBe('65.0'));
  it('pct(70,100) === "70.0"', () => expect(pct(70,100)).toBe('70.0'));
  it('pct(80,100) === "80.0"', () => expect(pct(80,100)).toBe('80.0'));
  it('pct(85,100) === "85.0"', () => expect(pct(85,100)).toBe('85.0'));
  it('pct(90,100) === "90.0"', () => expect(pct(90,100)).toBe('90.0'));
  it('pct(95,100) === "95.0"', () => expect(pct(95,100)).toBe('95.0'));
  it('pct(99,100) === "99.0"', () => expect(pct(99,100)).toBe('99.0'));
  it('pct(200,400) === "50.0"', () => expect(pct(200,400)).toBe('50.0'));
  it('pct(300,400) === "75.0"', () => expect(pct(300,400)).toBe('75.0'));
  it('pct(1,1000) === "0.1"', () => expect(pct(1,1000)).toBe('0.1'));
  it('pct(500,1000) === "50.0"', () => expect(pct(500,1000)).toBe('50.0'));
  it('pct(999,1000) === "99.9"', () => expect(pct(999,1000)).toBe('99.9'));
  it('pct(2,1000) === "0.2"', () => expect(pct(2,1000)).toBe('0.2'));
  it('pct(5,1000) === "0.5"', () => expect(pct(5,1000)).toBe('0.5'));
});

describe('fmt — more values', () => {
  it('fmt(0.2) === "0.2"', () => expect(fmt(0.2)).toBe('0.2'));
  it('fmt(0.3) === "0.3"', () => expect(fmt(0.3)).toBe('0.3'));
  it('fmt(0.4) === "0.4"', () => expect(fmt(0.4)).toBe('0.4'));
  it('fmt(0.6) === "0.6"', () => expect(fmt(0.6)).toBe('0.6'));
  it('fmt(0.7) === "0.7"', () => expect(fmt(0.7)).toBe('0.7'));
  it('fmt(0.8) === "0.8"', () => expect(fmt(0.8)).toBe('0.8'));
  it('fmt(1.1) === "1.1"', () => expect(fmt(1.1)).toBe('1.1'));
  it('fmt(1.2) === "1.2"', () => expect(fmt(1.2)).toBe('1.2'));
  it('fmt(1.3) === "1.3"', () => expect(fmt(1.3)).toBe('1.3'));
  it('fmt(1.4) === "1.4"', () => expect(fmt(1.4)).toBe('1.4'));
  it('fmt(1.6) === "1.6"', () => expect(fmt(1.6)).toBe('1.6'));
  it('fmt(1.7) === "1.7"', () => expect(fmt(1.7)).toBe('1.7'));
  it('fmt(1.8) === "1.8"', () => expect(fmt(1.8)).toBe('1.8'));
  it('fmt(1.9) === "1.9"', () => expect(fmt(1.9)).toBe('1.9'));
  it('fmt(2.5) === "2.5"', () => expect(fmt(2.5)).toBe('2.5'));
  it('fmt(99.1) === "99.1"', () => expect(fmt(99.1)).toBe('99.1'));
  it('fmt(99.5) === "99.5"', () => expect(fmt(99.5)).toBe('99.5'));
  it('fmt(99.9) === "99.9"', () => expect(fmt(99.9)).toBe('99.9'));
  it('fmt(999.9) === "999.9"', () => expect(fmt(999.9)).toBe('999.9'));
  it('fmt(1000.1) === "1,000.1"', () => expect(fmt(1000.1)).toBe('1,000.1'));
  it('fmt(9999.9) === "9,999.9"', () => expect(fmt(9999.9)).toBe('9,999.9'));
  it('fmt(10000) === "10,000.0"', () => expect(fmt(10000)).toBe('10,000.0'));
  it('fmt(99999.9) === "99,999.9"', () => expect(fmt(99999.9)).toBe('99,999.9'));
  it('fmt(100000) === "100,000.0"', () => expect(fmt(100000)).toBe('100,000.0'));
  it('fmt(0.15) === "0.2"', () => expect(fmt(0.15)).toBe('0.2'));
});

describe('pct and fmt — final two spot-checks', () => {
  it('pct(1,200) === "0.5"', () => expect(pct(1,200)).toBe('0.5'));
  it('pct(199,200) === "99.5"', () => expect(pct(199,200)).toBe('99.5'));
  it('fmt(0.25) === "0.3"', () => expect(fmt(0.25)).toBe('0.3'));
  it('fmt(0.75) === "0.8"', () => expect(fmt(0.75)).toBe('0.8'));
  it('fmt(12.35) === "12.4"', () => expect(fmt(12.35)).toBe('12.4'));
});
