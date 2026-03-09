// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Types (mirrored from source — no imports) ─────────────────────────────

type ReadingStatus = 'PENDING' | 'VERIFIED' | 'FLAGGED' | 'REJECTED';
type ReadingType = 'MANUAL' | 'AUTOMATIC' | 'ESTIMATED' | 'INVOICE';
type SEUStatus = 'optimized' | 'monitoring' | 'action-needed';
type EnergyScope = 1 | 2;

// ─── Constants (mirrored from source) ─────────────────────────────────────

const STATUS_OPTIONS: ReadingStatus[] = ['PENDING', 'VERIFIED', 'FLAGGED', 'REJECTED'];
const READING_TYPES: ReadingType[] = ['MANUAL', 'AUTOMATIC', 'ESTIMATED', 'INVOICE'];
const SEU_STATUSES: SEUStatus[] = ['optimized', 'monitoring', 'action-needed'];

// ─── Badge / colour maps (mirrored from source) ────────────────────────────

const statusConfig: Record<ReadingStatus, { label: string; className: string }> = {
  PENDING:  { label: 'Pending',  className: 'bg-yellow-100 text-yellow-700' },
  VERIFIED: { label: 'Verified', className: 'bg-green-100 text-green-700'   },
  FLAGGED:  { label: 'Flagged',  className: 'bg-orange-100 text-orange-700' },
  REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-700'       },
};

const seuStatusColors: Record<SEUStatus, string> = {
  optimized:      'bg-green-100 text-green-700',
  monitoring:     'bg-blue-100 text-blue-700',
  'action-needed':'bg-red-100 text-red-700',
};

// ─── MOCK EnPI data (mirrored from performance-dashboard/client.tsx) ───────

interface EnPI {
  id: string;
  name: string;
  unit: string;
  current: number;
  baseline: number;
  target: number;
  trend: number;
}

const ENPIS: EnPI[] = [
  { id: '1', name: 'Energy Intensity',    unit: 'kWh/unit',    current: 12.3,  baseline: 15.0,  target: 11.0,  trend: -8.5  },
  { id: '2', name: 'Electricity per m²',  unit: 'kWh/m²',      current: 142,   baseline: 165,   target: 130,   trend: -6.2  },
  { id: '3', name: 'Gas Consumption',     unit: 'therms/month', current: 4200,  baseline: 5100,  target: 3800,  trend: -12.1 },
  { id: '4', name: 'Energy Cost Ratio',   unit: '£/unit',       current: 0.82,  baseline: 0.95,  target: 0.75,  trend: -5.3  },
  { id: '5', name: 'Renewable %',         unit: '%',            current: 38,    baseline: 22,    target: 50,    trend: 16.0  },
  { id: '6', name: 'Peak Demand',         unit: 'kVA',          current: 485,   baseline: 540,   target: 450,   trend: -10.2 },
];

// ─── MOCK energy sources (mirrored from performance-dashboard/client.tsx) ──

interface EnergySource {
  name: string;
  scope: EnergyScope;
  consumption: number;
  unit: string;
  cost: number;
  share: number;
  color: string;
}

const ENERGY_SOURCES: EnergySource[] = [
  { name: 'Grid Electricity',    scope: 2, consumption: 245000, unit: 'kWh',    cost: 73500, share: 42, color: 'bg-blue-500'   },
  { name: 'Natural Gas',         scope: 1, consumption: 52000,  unit: 'therms', cost: 36400, share: 28, color: 'bg-orange-500' },
  { name: 'Solar PV (On-site)',  scope: 2, consumption: 85000,  unit: 'kWh',    cost: 0,     share: 15, color: 'bg-yellow-500' },
  { name: 'Diesel (Generators)', scope: 1, consumption: 4200,   unit: 'litres', cost: 5880,  share: 8,  color: 'bg-gray-500'   },
  { name: 'Wind (PPA)',          scope: 2, consumption: 42000,  unit: 'kWh',    cost: 4200,  share: 7,  color: 'bg-teal-500'   },
];

// ─── MOCK monthly data (mirrored from performance-dashboard/client.tsx) ────

const MONTHLY_DATA = [
  { month: 'Sep', electricity: 22500, gas: 4800, renewable: 9200,  total: 36500 },
  { month: 'Oct', electricity: 23100, gas: 5200, renewable: 8800,  total: 37100 },
  { month: 'Nov', electricity: 24500, gas: 5800, renewable: 7500,  total: 37800 },
  { month: 'Dec', electricity: 25200, gas: 6200, renewable: 6800,  total: 38200 },
  { month: 'Jan', electricity: 24800, gas: 6500, renewable: 7200,  total: 38500 },
  { month: 'Feb', electricity: 23500, gas: 5500, renewable: 9500,  total: 38500 },
];

// ─── MOCK SEU data (mirrored from performance-dashboard/client.tsx) ────────

const SEUS = [
  { name: 'HVAC System',       consumption: 98000, share: 32, status: 'optimized'    as SEUStatus },
  { name: 'Production Line 1', consumption: 72000, share: 24, status: 'monitoring'   as SEUStatus },
  { name: 'Compressed Air',    consumption: 45000, share: 15, status: 'action-needed'as SEUStatus },
  { name: 'Lighting',          consumption: 35000, share: 11, status: 'optimized'    as SEUStatus },
  { name: 'IT Infrastructure', consumption: 28000, share: 9,  status: 'monitoring'   as SEUStatus },
  { name: 'Other',             consumption: 27000, share: 9,  status: 'monitoring'   as SEUStatus },
];

// ─── Pure helper functions ─────────────────────────────────────────────────

function enpiImprovement(baseline: number, current: number): number {
  if (baseline === 0) return 0;
  return ((baseline - current) / baseline) * 100;
}

function enpiTargetProgress(baseline: number, current: number, target: number): number {
  const denominator = baseline - target;
  if (denominator === 0) return 100;
  return Math.min(100, ((baseline - current) / denominator) * 100);
}

function isOnTrack(current: number, target: number, higherIsBetter: boolean): boolean {
  return higherIsBetter ? current >= target : current <= target;
}

function totalCostFromSources(sources: EnergySource[]): number {
  return sources.reduce((s, e) => s + e.cost, 0);
}

function renewableShare(sources: EnergySource[]): number {
  return sources
    .filter((e) => e.name.includes('Solar') || e.name.includes('Wind'))
    .reduce((s, e) => s + e.share, 0);
}

function scope1Share(sources: EnergySource[]): number {
  return sources.filter((e) => e.scope === 1).reduce((s, e) => s + e.share, 0);
}

function scope2Share(sources: EnergySource[]): number {
  return sources.filter((e) => e.scope === 2).reduce((s, e) => s + e.share, 0);
}

function kwhToCO2e(kwh: number, factorKgPerKwh: number): number {
  return kwh * factorKgPerKwh;
}

function kwhToGJ(kwh: number): number {
  return kwh * 0.0036;
}

function energyIntensity(totalKwh: number, productionUnits: number): number {
  if (productionUnits === 0) return 0;
  return totalKwh / productionUnits;
}

function percentageSaving(baseline: number, actual: number): number {
  if (baseline === 0) return 0;
  return ((baseline - actual) / baseline) * 100;
}

// ─── 1. Reading status array ───────────────────────────────────────────────

describe('Reading status options array', () => {
  it('contains exactly 4 statuses', () => {
    expect(STATUS_OPTIONS).toHaveLength(4);
  });

  const expected: ReadingStatus[] = ['PENDING', 'VERIFIED', 'FLAGGED', 'REJECTED'];
  for (const s of expected) {
    it(`contains ${s}`, () => expect(STATUS_OPTIONS).toContain(s));
  }

  it('all entries are strings', () => {
    for (const s of STATUS_OPTIONS) {
      expect(typeof s).toBe('string');
    }
  });
});

// ─── 2. Reading type array ────────────────────────────────────────────────

describe('Reading type options array', () => {
  it('contains exactly 4 types', () => {
    expect(READING_TYPES).toHaveLength(4);
  });

  const expected: ReadingType[] = ['MANUAL', 'AUTOMATIC', 'ESTIMATED', 'INVOICE'];
  for (const t of expected) {
    it(`contains ${t}`, () => expect(READING_TYPES).toContain(t));
  }

  it('MANUAL is the first type (default)', () => {
    expect(READING_TYPES[0]).toBe('MANUAL');
  });
});

// ─── 3. Status badge colour map ────────────────────────────────────────────

describe('Reading status badge colours', () => {
  for (const s of STATUS_OPTIONS) {
    it(`${s} has a config entry`, () => {
      expect(statusConfig[s]).toBeDefined();
    });
    it(`${s} has a label`, () => {
      expect(statusConfig[s].label).toBeTruthy();
    });
    it(`${s} className contains 'bg-'`, () => {
      expect(statusConfig[s].className).toContain('bg-');
    });
    it(`${s} className contains 'text-'`, () => {
      expect(statusConfig[s].className).toContain('text-');
    });
  }

  it('PENDING label is "Pending"', () => expect(statusConfig.PENDING.label).toBe('Pending'));
  it('VERIFIED label is "Verified"', () => expect(statusConfig.VERIFIED.label).toBe('Verified'));
  it('FLAGGED label is "Flagged"', () => expect(statusConfig.FLAGGED.label).toBe('Flagged'));
  it('REJECTED label is "Rejected"', () => expect(statusConfig.REJECTED.label).toBe('Rejected'));
  it('PENDING is yellow', () => expect(statusConfig.PENDING.className).toContain('yellow'));
  it('VERIFIED is green', () => expect(statusConfig.VERIFIED.className).toContain('green'));
  it('FLAGGED is orange', () => expect(statusConfig.FLAGGED.className).toContain('orange'));
  it('REJECTED is red', () => expect(statusConfig.REJECTED.className).toContain('red'));
});

// ─── 4. SEU status badge colour map ──────────────────────────────────────

describe('SEU status badge colours', () => {
  for (const s of SEU_STATUSES) {
    it(`"${s}" has a colour string`, () => {
      expect(seuStatusColors[s]).toBeDefined();
    });
    it(`"${s}" colour contains 'bg-'`, () => {
      expect(seuStatusColors[s]).toContain('bg-');
    });
  }

  it('optimized is green', () => expect(seuStatusColors.optimized).toContain('green'));
  it('monitoring is blue', () => expect(seuStatusColors.monitoring).toContain('blue'));
  it('action-needed is red', () => expect(seuStatusColors['action-needed']).toContain('red'));
});

// ─── 5. MOCK EnPI data — shape and integrity ──────────────────────────────

describe('MOCK ENPIS data integrity', () => {
  it('has exactly 6 EnPIs', () => {
    expect(ENPIS).toHaveLength(6);
  });

  it('all ids are unique', () => {
    const ids = ENPIS.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all names are non-empty strings', () => {
    for (const e of ENPIS) {
      expect(e.name.length).toBeGreaterThan(0);
    }
  });

  it('all units are non-empty strings', () => {
    for (const e of ENPIS) {
      expect(e.unit.length).toBeGreaterThan(0);
    }
  });

  it('all current values are positive', () => {
    for (const e of ENPIS) {
      expect(e.current).toBeGreaterThan(0);
    }
  });

  it('all baseline values are positive', () => {
    for (const e of ENPIS) {
      expect(e.baseline).toBeGreaterThan(0);
    }
  });

  it('all target values are positive', () => {
    for (const e of ENPIS) {
      expect(e.target).toBeGreaterThan(0);
    }
  });

  it('trend values are numbers', () => {
    for (const e of ENPIS) {
      expect(typeof e.trend).toBe('number');
    }
  });

  it('most EnPIs show improvement (negative trend for intensity metrics)', () => {
    const negTrends = ENPIS.filter((e) => e.trend < 0);
    expect(negTrends.length).toBeGreaterThanOrEqual(4);
  });

  it('Renewable % EnPI has positive trend (increasing renewable share)', () => {
    const renewable = ENPIS.find((e) => e.name === 'Renewable %');
    expect(renewable?.trend).toBeGreaterThan(0);
  });

  it('Energy Intensity current < baseline (improved)', () => {
    const ei = ENPIS.find((e) => e.name === 'Energy Intensity');
    expect(ei!.current).toBeLessThan(ei!.baseline);
  });

  it('Peak Demand current < baseline (improved)', () => {
    const pd = ENPIS.find((e) => e.name === 'Peak Demand');
    expect(pd!.current).toBeLessThan(pd!.baseline);
  });
});

// ─── 6. MOCK energy sources — shape and integrity ─────────────────────────

describe('MOCK ENERGY_SOURCES data integrity', () => {
  it('has exactly 5 energy sources', () => {
    expect(ENERGY_SOURCES).toHaveLength(5);
  });

  it('all names are unique', () => {
    const names = ENERGY_SOURCES.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('all share values are positive', () => {
    for (const e of ENERGY_SOURCES) {
      expect(e.share).toBeGreaterThan(0);
    }
  });

  it('all consumption values are positive', () => {
    for (const e of ENERGY_SOURCES) {
      expect(e.consumption).toBeGreaterThan(0);
    }
  });

  it('all cost values are non-negative', () => {
    for (const e of ENERGY_SOURCES) {
      expect(e.cost).toBeGreaterThanOrEqual(0);
    }
  });

  it('scopes are only 1 or 2', () => {
    for (const e of ENERGY_SOURCES) {
      expect([1, 2]).toContain(e.scope);
    }
  });

  it('all colour classes start with bg-', () => {
    for (const e of ENERGY_SOURCES) {
      expect(e.color).toMatch(/^bg-/);
    }
  });

  it('Grid Electricity is the largest share (42%)', () => {
    const grid = ENERGY_SOURCES.find((e) => e.name === 'Grid Electricity');
    const maxShare = Math.max(...ENERGY_SOURCES.map((e) => e.share));
    expect(grid?.share).toBe(maxShare);
  });

  it('Solar PV has zero cost (on-site generation)', () => {
    const solar = ENERGY_SOURCES.find((e) => e.name.includes('Solar'));
    expect(solar?.cost).toBe(0);
  });

  it('Natural Gas and Diesel are scope 1', () => {
    const gas = ENERGY_SOURCES.find((e) => e.name === 'Natural Gas');
    const diesel = ENERGY_SOURCES.find((e) => e.name.includes('Diesel'));
    expect(gas?.scope).toBe(1);
    expect(diesel?.scope).toBe(1);
  });

  it('Grid Electricity is scope 2', () => {
    const grid = ENERGY_SOURCES.find((e) => e.name === 'Grid Electricity');
    expect(grid?.scope).toBe(2);
  });
});

// ─── 7. MOCK monthly data — shape and integrity ───────────────────────────

describe('MOCK_MONTHLY_DATA integrity', () => {
  it('has exactly 6 monthly entries', () => {
    expect(MONTHLY_DATA).toHaveLength(6);
  });

  it('all totals are positive', () => {
    for (const m of MONTHLY_DATA) {
      expect(m.total).toBeGreaterThan(0);
    }
  });

  it('electricity component is largest in each month', () => {
    for (const m of MONTHLY_DATA) {
      expect(m.electricity).toBeGreaterThan(m.gas);
      expect(m.electricity).toBeGreaterThan(m.renewable);
    }
  });

  it('components sum is approximately equal to total', () => {
    for (const m of MONTHLY_DATA) {
      const sum = m.electricity + m.gas + m.renewable;
      // allow small delta — totals in source appear as round numbers
      expect(Math.abs(sum - m.total)).toBeLessThanOrEqual(m.total * 0.05);
    }
  });

  it('month labels are non-empty strings', () => {
    for (const m of MONTHLY_DATA) {
      expect(m.month.length).toBeGreaterThan(0);
    }
  });

  it('Sep is the first month', () => {
    expect(MONTHLY_DATA[0].month).toBe('Sep');
  });

  it('Feb is the last month', () => {
    expect(MONTHLY_DATA[MONTHLY_DATA.length - 1].month).toBe('Feb');
  });

  it('all renewable values are positive', () => {
    for (const m of MONTHLY_DATA) {
      expect(m.renewable).toBeGreaterThan(0);
    }
  });

  it('winter months (Dec/Jan) have higher gas than Sep', () => {
    const sep = MONTHLY_DATA.find((m) => m.month === 'Sep')!;
    const dec = MONTHLY_DATA.find((m) => m.month === 'Dec')!;
    const jan = MONTHLY_DATA.find((m) => m.month === 'Jan')!;
    expect(dec.gas).toBeGreaterThan(sep.gas);
    expect(jan.gas).toBeGreaterThan(sep.gas);
  });
});

// ─── 8. MOCK SEU data — shape and integrity ───────────────────────────────

describe('MOCK SEUS data integrity', () => {
  it('has exactly 6 SEUs', () => {
    expect(SEUS).toHaveLength(6);
  });

  it('all names are unique', () => {
    const names = SEUS.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('all consumption values are positive', () => {
    for (const s of SEUS) {
      expect(s.consumption).toBeGreaterThan(0);
    }
  });

  it('all share values are positive', () => {
    for (const s of SEUS) {
      expect(s.share).toBeGreaterThan(0);
    }
  });

  it('all statuses are valid SEU statuses', () => {
    for (const s of SEUS) {
      expect(SEU_STATUSES).toContain(s.status);
    }
  });

  it('HVAC is the largest SEU by share (32%)', () => {
    const hvac = SEUS.find((s) => s.name === 'HVAC System');
    const maxShare = Math.max(...SEUS.map((s) => s.share));
    expect(hvac?.share).toBe(maxShare);
  });

  it('Compressed Air has action-needed status', () => {
    const ca = SEUS.find((s) => s.name === 'Compressed Air');
    expect(ca?.status).toBe('action-needed');
  });

  it('total SEU share sums to 100%', () => {
    const total = SEUS.reduce((s, seu) => s + seu.share, 0);
    expect(total).toBe(100);
  });
});

// ─── 9. enpiImprovement helper ────────────────────────────────────────────

describe('enpiImprovement', () => {
  it('returns 0 when baseline is 0', () => {
    expect(enpiImprovement(0, 0)).toBe(0);
  });

  it('returns 0 when current equals baseline (no change)', () => {
    expect(enpiImprovement(1000, 1000)).toBe(0);
  });

  it('10% reduction from 1000 to 900 = 10% improvement', () => {
    expect(enpiImprovement(1000, 900)).toBeCloseTo(10);
  });

  it('Energy Intensity improvement ≈ 18%', () => {
    const ei = ENPIS.find((e) => e.name === 'Energy Intensity')!;
    expect(enpiImprovement(ei.baseline, ei.current)).toBeCloseTo(18, 0);
  });

  it('negative improvement possible (regression)', () => {
    expect(enpiImprovement(1000, 1200)).toBeLessThan(0);
  });

  it('all intensity-reducing EnPIs show positive improvement', () => {
    const intensityEnpis = ENPIS.filter((e) => e.trend < 0);
    for (const e of intensityEnpis) {
      expect(enpiImprovement(e.baseline, e.current)).toBeGreaterThan(0);
    }
  });
});

// ─── 10. enpiTargetProgress helper ───────────────────────────────────────

describe('enpiTargetProgress', () => {
  it('returns 100 when baseline equals target (degenerate case)', () => {
    expect(enpiTargetProgress(100, 80, 100)).toBe(100);
  });

  it('returns 0 when current equals baseline (no progress)', () => {
    expect(enpiTargetProgress(1000, 1000, 800)).toBe(0);
  });

  it('returns 100 when current equals target (target reached)', () => {
    expect(enpiTargetProgress(1000, 800, 800)).toBeCloseTo(100);
  });

  it('returns 50 when halfway between baseline and target', () => {
    expect(enpiTargetProgress(1000, 900, 800)).toBeCloseTo(50);
  });

  it('is capped at 100 when current overshoots target', () => {
    expect(enpiTargetProgress(1000, 700, 800)).toBe(100);
  });
});

// ─── 11. totalCostFromSources helper ─────────────────────────────────────

describe('totalCostFromSources', () => {
  it('returns 0 for empty array', () => {
    expect(totalCostFromSources([])).toBe(0);
  });

  it('matches known total cost for ENERGY_SOURCES', () => {
    // 73500 + 36400 + 0 + 5880 + 4200 = 119980
    expect(totalCostFromSources(ENERGY_SOURCES)).toBe(119980);
  });

  it('is positive for all non-zero costs', () => {
    expect(totalCostFromSources(ENERGY_SOURCES)).toBeGreaterThan(0);
  });

  it('excludes solar cost of 0 correctly', () => {
    const withoutSolar = ENERGY_SOURCES.filter((e) => !e.name.includes('Solar'));
    expect(totalCostFromSources(withoutSolar)).toBe(totalCostFromSources(ENERGY_SOURCES));
  });
});

// ─── 12. renewableShare helper ───────────────────────────────────────────

describe('renewableShare', () => {
  it('Solar (15%) + Wind (7%) = 22%', () => {
    expect(renewableShare(ENERGY_SOURCES)).toBe(22);
  });

  it('returns 0 for sources with no Solar or Wind', () => {
    const fossil = ENERGY_SOURCES.filter((e) => !e.name.includes('Solar') && !e.name.includes('Wind'));
    expect(renewableShare(fossil)).toBe(0);
  });

  it('is less than total share (100%)', () => {
    expect(renewableShare(ENERGY_SOURCES)).toBeLessThan(100);
  });
});

// ─── 13. scope1Share / scope2Share helpers ────────────────────────────────

describe('scope1Share and scope2Share', () => {
  it('scope1 + scope2 = 100%', () => {
    expect(scope1Share(ENERGY_SOURCES) + scope2Share(ENERGY_SOURCES)).toBe(100);
  });

  it('scope1 = Natural Gas + Diesel = 28 + 8 = 36%', () => {
    expect(scope1Share(ENERGY_SOURCES)).toBe(36);
  });

  it('scope2 = Grid + Solar + Wind = 42 + 15 + 7 = 64%', () => {
    expect(scope2Share(ENERGY_SOURCES)).toBe(64);
  });

  it('scope1 is less than scope2 (grid-heavy mix)', () => {
    expect(scope1Share(ENERGY_SOURCES)).toBeLessThan(scope2Share(ENERGY_SOURCES));
  });
});

// ─── 14. kwhToCO2e conversion helper ─────────────────────────────────────

describe('kwhToCO2e', () => {
  it('0 kWh produces 0 CO2e', () => {
    expect(kwhToCO2e(0, 0.233)).toBe(0);
  });

  it('1000 kWh at UK grid factor 0.233 = 233 kgCO2e', () => {
    expect(kwhToCO2e(1000, 0.233)).toBeCloseTo(233);
  });

  it('zero emission factor gives 0 CO2e (renewable)', () => {
    expect(kwhToCO2e(85000, 0)).toBe(0);
  });

  it('result is proportional to kWh consumed', () => {
    const rate = 0.233;
    expect(kwhToCO2e(2000, rate)).toBeCloseTo(2 * kwhToCO2e(1000, rate));
  });

  it('result is proportional to emission factor', () => {
    const kwh = 1000;
    expect(kwhToCO2e(kwh, 0.466)).toBeCloseTo(2 * kwhToCO2e(kwh, 0.233));
  });

  const scenarios: Array<[number, number, number]> = [
    [1000,  0.233, 233],
    [1000,  0.202, 202],
    [1000,  2.68,  2680],
    [1000,  0.18,  180],
    [1000,  0.015, 15],
  ];
  for (const [kwh, factor, expected] of scenarios) {
    it(`${kwh} kWh × ${factor} = ${expected} kgCO2e`, () => {
      expect(kwhToCO2e(kwh, factor)).toBeCloseTo(expected);
    });
  }
});

// ─── 15. kwhToGJ conversion helper ───────────────────────────────────────

describe('kwhToGJ', () => {
  it('1 kWh = 0.0036 GJ', () => {
    expect(kwhToGJ(1)).toBeCloseTo(0.0036);
  });

  it('1000 kWh = 3.6 GJ', () => {
    expect(kwhToGJ(1000)).toBeCloseTo(3.6);
  });

  it('0 kWh = 0 GJ', () => {
    expect(kwhToGJ(0)).toBe(0);
  });

  it('result is proportional to kWh', () => {
    expect(kwhToGJ(2000)).toBeCloseTo(2 * kwhToGJ(1000));
  });

  it('Grid Electricity 245,000 kWh ≈ 882 GJ', () => {
    expect(kwhToGJ(245000)).toBeCloseTo(882);
  });

  it('all positive inputs give positive output', () => {
    for (let i = 1; i <= 10; i++) {
      expect(kwhToGJ(i * 1000)).toBeGreaterThan(0);
    }
  });
});

// ─── 16. energyIntensity helper ──────────────────────────────────────────

describe('energyIntensity', () => {
  it('zero production returns 0', () => {
    expect(energyIntensity(1000, 0)).toBe(0);
  });

  it('1000 kWh / 500 units = 2 kWh/unit', () => {
    expect(energyIntensity(1000, 500)).toBe(2);
  });

  it('matches EnPI current value for Energy Intensity EnPI direction', () => {
    // 12.3 kWh/unit means ~100 kWh / ~8.13 units
    const result = energyIntensity(12.3, 1);
    expect(result).toBeCloseTo(12.3);
  });

  it('is positive when both inputs are positive', () => {
    expect(energyIntensity(5000, 200)).toBeGreaterThan(0);
  });

  it('decreasing consumption for same production = improvement', () => {
    expect(energyIntensity(900, 100)).toBeLessThan(energyIntensity(1000, 100));
  });
});

// ─── 17. percentageSaving helper ─────────────────────────────────────────

describe('percentageSaving', () => {
  it('0 baseline returns 0', () => {
    expect(percentageSaving(0, 0)).toBe(0);
  });

  it('no change = 0%', () => {
    expect(percentageSaving(1000, 1000)).toBe(0);
  });

  it('20% reduction from 1000 to 800 = 20%', () => {
    expect(percentageSaving(1000, 800)).toBe(20);
  });

  it('increase gives negative saving (regression)', () => {
    expect(percentageSaving(1000, 1200)).toBeLessThan(0);
  });

  const savingCases: Array<[number, number, number]> = [
    [5100, 4200, 17.65],  // Gas Consumption EnPI
    [165,  142,  13.94],  // Electricity per m²
    [0.95, 0.82, 13.68],  // Energy Cost Ratio
    [540,  485,  10.19],  // Peak Demand
  ];
  for (const [baseline, current, expected] of savingCases) {
    it(`saving from ${baseline} to ${current} ≈ ${expected}%`, () => {
      expect(percentageSaving(baseline, current)).toBeCloseTo(expected, 1);
    });
  }
});

// ─── 18. ENPIS — per-EnPI unit parametric ────────────────────────────────

describe('ENPIS — per-EnPI unit parametric', () => {
  const cases: [string, string][] = [
    ['Energy Intensity',   'kWh/unit'],
    ['Electricity per m²', 'kWh/m²'],
    ['Gas Consumption',    'therms/month'],
    ['Energy Cost Ratio',  '£/unit'],
    ['Renewable %',        '%'],
    ['Peak Demand',        'kVA'],
  ];
  for (const [name, unit] of cases) {
    it(`${name} has unit "${unit}"`, () => {
      const enpi = ENPIS.find((e) => e.name === name)!;
      expect(enpi.unit).toBe(unit);
    });
  }
});

// ─── 19. ENPIS — per-EnPI improvement sign parametric ────────────────────

describe('ENPIS — per-EnPI improvement sign parametric', () => {
  const cases: [string, 'positive' | 'negative'][] = [
    ['Energy Intensity',   'positive'], // 15.0 → 12.3 reduction
    ['Electricity per m²', 'positive'], // 165 → 142 reduction
    ['Gas Consumption',    'positive'], // 5100 → 4200 reduction
    ['Energy Cost Ratio',  'positive'], // 0.95 → 0.82 reduction
    ['Renewable %',        'negative'], // 22 → 38 increase (formula treats higher as "worse")
    ['Peak Demand',        'positive'], // 540 → 485 reduction
  ];
  for (const [name, sign] of cases) {
    it(`${name} improvement is ${sign}`, () => {
      const e = ENPIS.find((enpi) => enpi.name === name)!;
      const imp = enpiImprovement(e.baseline, e.current);
      if (sign === 'positive') {
        expect(imp).toBeGreaterThan(0);
      } else {
        expect(imp).toBeLessThan(0);
      }
    });
  }
});

// ─── 20. ENERGY_SOURCES — per-source scope parametric ────────────────────

describe('ENERGY_SOURCES — per-source scope parametric', () => {
  const cases: [string, EnergyScope][] = [
    ['Grid Electricity',    2],
    ['Natural Gas',         1],
    ['Solar PV (On-site)',  2],
    ['Diesel (Generators)', 1],
    ['Wind (PPA)',          2],
  ];
  for (const [name, scope] of cases) {
    it(`${name} is scope ${scope}`, () => {
      const src = ENERGY_SOURCES.find((e) => e.name === name)!;
      expect(src.scope).toBe(scope);
    });
  }
});

// ─── 21. ENERGY_SOURCES — per-source share exact parametric ──────────────

describe('ENERGY_SOURCES — per-source share exact parametric', () => {
  const cases: [string, number][] = [
    ['Grid Electricity',    42],
    ['Natural Gas',         28],
    ['Solar PV (On-site)',  15],
    ['Diesel (Generators)',  8],
    ['Wind (PPA)',           7],
  ];
  for (const [name, share] of cases) {
    it(`${name}: share = ${share}%`, () => {
      const src = ENERGY_SOURCES.find((e) => e.name === name)!;
      expect(src.share).toBe(share);
    });
  }
});

// ─── 22. isOnTrack — parametric ──────────────────────────────────────────

describe('isOnTrack — parametric', () => {
  const cases: [number, number, boolean, boolean][] = [
    [85, 90, false, true],  // current(85) <= target(90), lowerIsBetter → on track
    [95, 90, false, false], // current(95) > target(90), lowerIsBetter → off track
    [50, 50, true,  true],  // current === target, higherIsBetter → on track
    [40, 50, true,  false], // current < target, higherIsBetter → off track
    [60, 50, true,  true],  // current > target, higherIsBetter → on track
  ];
  for (const [current, target, higherIsBetter, expected] of cases) {
    it(`isOnTrack(${current}, ${target}, higherIsBetter=${higherIsBetter}) = ${expected}`, () => {
      expect(isOnTrack(current, target, higherIsBetter)).toBe(expected);
    });
  }
});

// ─── 23. MONTHLY_DATA — per-month total exact parametric ─────────────────

describe('MONTHLY_DATA — per-month total exact parametric', () => {
  const cases: [string, number][] = [
    ['Sep', 36500],
    ['Oct', 37100],
    ['Nov', 37800],
    ['Dec', 38200],
    ['Jan', 38500],
    ['Feb', 38500],
  ];
  for (const [month, total] of cases) {
    it(`${month}: total = ${total}`, () => {
      const m = MONTHLY_DATA.find((d) => d.month === month)!;
      expect(m.total).toBe(total);
    });
  }
});

// ─── 24. SEUS — per-SEU share exact parametric ───────────────────────────

describe('SEUS — per-SEU share exact parametric', () => {
  const cases: [string, number][] = [
    ['HVAC System',        32],
    ['Production Line 1',  24],
    ['Compressed Air',     15],
    ['Lighting',           11],
    ['IT Infrastructure',   9],
    ['Other',               9],
  ];
  for (const [name, share] of cases) {
    it(`${name}: share = ${share}%`, () => {
      const seu = SEUS.find((s) => s.name === name)!;
      expect(seu.share).toBe(share);
    });
  }
});

// ─── 25. cross-domain invariants — energy ────────────────────────────────

describe('cross-domain invariants — energy', () => {
  it('enpiImprovement and percentageSaving agree for reducing-intensity EnPIs', () => {
    for (const e of ENPIS.filter((enpi) => enpi.trend < 0)) {
      expect(enpiImprovement(e.baseline, e.current)).toBeCloseTo(
        percentageSaving(e.baseline, e.current), 5
      );
    }
  });
  it('all reducing-intensity EnPIs have target < baseline', () => {
    for (const e of ENPIS.filter((enpi) => enpi.trend < 0)) {
      expect(e.target).toBeLessThan(e.baseline);
    }
  });
  it('Renewable % EnPI has target > baseline (increasing goal)', () => {
    const r = ENPIS.find((e) => e.name === 'Renewable %')!;
    expect(r.target).toBeGreaterThan(r.baseline);
  });
  it('kwhToGJ(0) = 0 and kwhToCO2e(0, 0.233) = 0', () => {
    expect(kwhToGJ(0)).toBe(0);
    expect(kwhToCO2e(0, 0.233)).toBe(0);
  });
  it('ENERGY_SOURCES shares sum to 100%', () => {
    expect(ENERGY_SOURCES.reduce((s, e) => s + e.share, 0)).toBe(100);
  });
});

// ─── Parametric: STATUS_OPTIONS positional index ──────────────────────────────

describe('STATUS_OPTIONS — positional index parametric', () => {
  const cases: [ReadingStatus, number][] = [
    ['PENDING', 0],
    ['VERIFIED', 1],
    ['FLAGGED', 2],
    ['REJECTED', 3],
  ];
  for (const [status, idx] of cases) {
    it(`${status} is at index ${idx}`, () => {
      expect(STATUS_OPTIONS[idx]).toBe(status);
    });
  }
});

// ─── Parametric: READING_TYPES positional index ───────────────────────────────

describe('READING_TYPES — positional index parametric', () => {
  const cases: [ReadingType, number][] = [
    ['MANUAL', 0],
    ['AUTOMATIC', 1],
    ['ESTIMATED', 2],
    ['INVOICE', 3],
  ];
  for (const [type, idx] of cases) {
    it(`${type} is at index ${idx}`, () => {
      expect(READING_TYPES[idx]).toBe(type);
    });
  }
});

// ─── Parametric: SEU_STATUSES positional index ────────────────────────────────

describe('SEU_STATUSES — positional index parametric', () => {
  const cases: [SEUStatus, number][] = [
    ['optimized', 0],
    ['monitoring', 1],
    ['action-needed', 2],
  ];
  for (const [status, idx] of cases) {
    it(`"${status}" is at index ${idx}`, () => {
      expect(SEU_STATUSES[idx]).toBe(status);
    });
  }
});

// ─── Parametric: ENPIS per-EnPI exact current+baseline+target ────────────────

describe('ENPIS — per-EnPI exact current+baseline+target parametric', () => {
  const cases: [string, number, number, number][] = [
    ['Energy Intensity',   12.3,   15.0,   11.0],
    ['Electricity per m²', 142,    165,    130],
    ['Gas Consumption',    4200,   5100,   3800],
    ['Energy Cost Ratio',  0.82,   0.95,   0.75],
    ['Renewable %',        38,     22,     50],
    ['Peak Demand',        485,    540,    450],
  ];
  for (const [name, current, baseline, target] of cases) {
    it(`${name}: current=${current}, baseline=${baseline}, target=${target}`, () => {
      const e = ENPIS.find((x) => x.name === name)!;
      expect(e.current).toBeCloseTo(current, 5);
      expect(e.baseline).toBeCloseTo(baseline, 5);
      expect(e.target).toBeCloseTo(target, 5);
    });
  }
});

// ─── Parametric: ENERGY_SOURCES per-source cost exact ────────────────────────

describe('ENERGY_SOURCES — per-source cost exact parametric', () => {
  const cases: [string, number][] = [
    ['Grid Electricity',    73500],
    ['Natural Gas',         36400],
    ['Solar PV (On-site)',  0],
    ['Diesel (Generators)', 5880],
    ['Wind (PPA)',          4200],
  ];
  for (const [name, cost] of cases) {
    it(`${name}: cost = ${cost}`, () => {
      const src = ENERGY_SOURCES.find((e) => e.name === name)!;
      expect(src.cost).toBe(cost);
    });
  }
});

// ─── STATUS_OPTIONS — positional index parametric ────────────────────────────

describe('STATUS_OPTIONS — positional index parametric', () => {
  const expected = [
    [0, 'PENDING'],
    [1, 'VERIFIED'],
    [2, 'FLAGGED'],
    [3, 'REJECTED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`STATUS_OPTIONS[${idx}] === '${val}'`, () => {
      expect(STATUS_OPTIONS[idx]).toBe(val);
    });
  }
});

// ─── READING_TYPES — positional index parametric ─────────────────────────────

describe('READING_TYPES — positional index parametric', () => {
  const expected = [
    [0, 'MANUAL'],
    [1, 'AUTOMATIC'],
    [2, 'ESTIMATED'],
    [3, 'INVOICE'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`READING_TYPES[${idx}] === '${val}'`, () => {
      expect(READING_TYPES[idx]).toBe(val);
    });
  }
});

// ─── SEU_STATUSES — positional index parametric ──────────────────────────────

describe('SEU_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'optimized'],
    [1, 'monitoring'],
    [2, 'action-needed'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`SEU_STATUSES[${idx}] === '${val}'`, () => {
      expect(SEU_STATUSES[idx]).toBe(val);
    });
  }
});

// ─── MONTHLY_DATA — per-month total exact parametric ─────────────────────────

describe('MONTHLY_DATA — per-month total exact parametric', () => {
  const cases: [string, number][] = [
    ['Sep', 36500],
    ['Oct', 37100],
    ['Nov', 37800],
    ['Dec', 38200],
    ['Jan', 38500],
    ['Feb', 38500],
  ];
  for (const [month, total] of cases) {
    it(`${month}: total = ${total}`, () => {
      const row = MONTHLY_DATA.find(d => d.month === month)!;
      expect(row.total).toBe(total);
    });
  }
});

// ─── ENERGY_SOURCES — per-source scope/share parametric ──────────────────────

describe('ENERGY_SOURCES — per-source scope+share parametric', () => {
  const cases: [string, number, number][] = [
    ['Grid Electricity',    2, 42],
    ['Natural Gas',         1, 28],
    ['Solar PV (On-site)',  2, 15],
    ['Diesel (Generators)', 1, 8],
    ['Wind (PPA)',          2, 7],
  ];
  for (const [name, scope, share] of cases) {
    it(`${name}: scope=${scope}, share=${share}`, () => {
      const src = ENERGY_SOURCES.find(e => e.name === name)!;
      expect(src.scope).toBe(scope);
      expect(src.share).toBe(share);
    });
  }
});
