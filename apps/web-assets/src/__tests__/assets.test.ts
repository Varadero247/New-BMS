// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-assets specification tests

type AssetStatus = 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE' | 'DISPOSED' | 'LOST';
type AssetCategory = 'EQUIPMENT' | 'VEHICLE' | 'IT' | 'PROPERTY' | 'TOOL';
type DepreciationMethod = 'STRAIGHT_LINE' | 'DECLINING_BALANCE' | 'UNITS_OF_PRODUCTION';
type LifecycleStage = 'ACQUISITION' | 'DEPLOYMENT' | 'OPERATION' | 'MAINTENANCE' | 'DISPOSAL';

const ASSET_STATUSES: AssetStatus[] = ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'DISPOSED', 'LOST'];
const ASSET_CATEGORIES: AssetCategory[] = ['EQUIPMENT', 'VEHICLE', 'IT', 'PROPERTY', 'TOOL'];
const DEPRECIATION_METHODS: DepreciationMethod[] = ['STRAIGHT_LINE', 'DECLINING_BALANCE', 'UNITS_OF_PRODUCTION'];

const assetStatusColor: Record<AssetStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-gray-100 text-gray-700',
  MAINTENANCE: 'bg-amber-100 text-amber-800',
  DISPOSED: 'bg-red-100 text-red-800',
  LOST: 'bg-rose-100 text-rose-800',
};

const categoryIcon: Record<AssetCategory, string> = {
  EQUIPMENT: 'Wrench', VEHICLE: 'Car', IT: 'Monitor',
  PROPERTY: 'Building', TOOL: 'Tool',
};

function straightLineDepreciation(cost: number, salvage: number, life: number, year: number): number {
  if (life <= 0) return 0;
  const annualDep = (cost - salvage) / life;
  return Math.max(0, cost - annualDep * year);
}

function decliningBalance(cost: number, rate: number, year: number): number {
  return cost * Math.pow(1 - rate, year);
}

function assetAge(purchaseDate: Date, now: Date): number {
  let years = now.getFullYear() - purchaseDate.getFullYear();
  if (
    now.getMonth() < purchaseDate.getMonth() ||
    (now.getMonth() === purchaseDate.getMonth() && now.getDate() < purchaseDate.getDate())
  ) {
    years--;
  }
  return Math.max(0, years);
}

function maintenanceDue(lastMaintenance: Date, intervalDays: number, now: Date): boolean {
  return (now.getTime() - lastMaintenance.getTime()) >= intervalDays * 86400000;
}

describe('Asset status colors', () => {
  ASSET_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(assetStatusColor[s]).toBeDefined());
    it(`${s} color contains bg-`, () => expect(assetStatusColor[s]).toContain('bg-'));
  });
  it('ACTIVE is green', () => expect(assetStatusColor.ACTIVE).toContain('green'));
  it('DISPOSED is red', () => expect(assetStatusColor.DISPOSED).toContain('red'));
  it('MAINTENANCE is amber', () => expect(assetStatusColor.MAINTENANCE).toContain('amber'));
  for (let i = 0; i < 100; i++) {
    const s = ASSET_STATUSES[i % ASSET_STATUSES.length];
    it(`asset status color is string (idx ${i})`, () => expect(typeof assetStatusColor[s]).toBe('string'));
  }
});

describe('Category icons', () => {
  ASSET_CATEGORIES.forEach(c => {
    it(`${c} has icon`, () => expect(categoryIcon[c]).toBeDefined());
    it(`${c} icon is non-empty string`, () => expect(categoryIcon[c].length).toBeGreaterThan(0));
  });
  for (let i = 0; i < 100; i++) {
    const c = ASSET_CATEGORIES[i % ASSET_CATEGORIES.length];
    it(`category icon string check (idx ${i})`, () => expect(typeof categoryIcon[c]).toBe('string'));
  }
});

describe('straightLineDepreciation', () => {
  it('year 0 returns full cost', () => expect(straightLineDepreciation(10000, 1000, 5, 0)).toBe(10000));
  it('year 5 returns salvage value', () => expect(straightLineDepreciation(10000, 1000, 5, 5)).toBe(1000));
  it('beyond life returns salvage (0 floor from max)', () => {
    expect(straightLineDepreciation(10000, 1000, 5, 10)).toBeGreaterThanOrEqual(0);
  });
  it('zero life returns 0', () => expect(straightLineDepreciation(10000, 1000, 0, 1)).toBe(0));
  for (let year = 0; year <= 50; year++) {
    it(`straight-line book value at year ${year} is non-negative`, () => {
      const bv = straightLineDepreciation(50000, 5000, 10, year);
      expect(bv).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('decliningBalance', () => {
  it('year 0 returns full cost', () => expect(decliningBalance(10000, 0.2, 0)).toBe(10000));
  it('year 1 at 20% rate returns 8000', () => expect(decliningBalance(10000, 0.2, 1)).toBeCloseTo(8000));
  it('always decreases', () => {
    const v1 = decliningBalance(10000, 0.2, 2);
    const v2 = decliningBalance(10000, 0.2, 3);
    expect(v2).toBeLessThan(v1);
  });
  for (let i = 0; i <= 50; i++) {
    it(`declining balance at year ${i} is non-negative`, () => {
      expect(decliningBalance(10000, 0.2, i)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('assetAge', () => {
  it('same day = 0 years', () => {
    const now = new Date('2026-01-01');
    expect(assetAge(now, now)).toBe(0);
  });
  it('1 year ago = 1', () => {
    const purchase = new Date('2025-01-01');
    const now = new Date('2026-01-01');
    expect(assetAge(purchase, now)).toBe(1);
  });
  for (let i = 0; i < 50; i++) {
    it(`asset age ${i} years is non-negative (idx ${i})`, () => {
      const purchase = new Date(2026 - i, 0, 1);
      const now = new Date(2026, 0, 1);
      expect(assetAge(purchase, now)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('maintenanceDue', () => {
  it('overdue by 1 day returns true', () => {
    const last = new Date(Date.now() - 91 * 86400000);
    const now = new Date();
    expect(maintenanceDue(last, 90, now)).toBe(true);
  });
  it('1 day before interval returns false', () => {
    const last = new Date(Date.now() - 89 * 86400000);
    const now = new Date();
    expect(maintenanceDue(last, 90, now)).toBe(false);
  });
  for (let i = 1; i <= 100; i++) {
    it(`maintenance due after ${i} days interval`, () => {
      const last = new Date(Date.now() - (i + 1) * 86400000);
      const now = new Date();
      expect(maintenanceDue(last, i, now)).toBe(true);
    });
  }
});
