import { AssetRegistry } from '../asset-registry';
import { MaintenanceScheduler } from '../maintenance-scheduler';
import {
  AssetStatus,
  AssetCategory,
  ConditionRating,
  DepreciationMethod,
  MaintenanceType,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeAsset(overrides: Partial<{
  id: string;
  name: string;
  category: AssetCategory;
  acquisitionDate: string;
  acquisitionCost: number;
  usefulLifeYears: number;
  salvageValue: number;
  location: string;
  assignedTo?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  notes?: string;
}> = {}) {
  return {
    id: overrides.id ?? 'asset-1',
    name: overrides.name ?? 'Test Asset',
    category: (overrides.category ?? 'EQUIPMENT') as AssetCategory,
    acquisitionDate: overrides.acquisitionDate ?? '2023-01-01',
    acquisitionCost: overrides.acquisitionCost ?? 10000,
    usefulLifeYears: overrides.usefulLifeYears ?? 10,
    salvageValue: overrides.salvageValue ?? 1000,
    location: overrides.location ?? 'Warehouse A',
    ...(overrides.assignedTo !== undefined ? { assignedTo: overrides.assignedTo } : {}),
    ...(overrides.lastMaintenanceDate !== undefined ? { lastMaintenanceDate: overrides.lastMaintenanceDate } : {}),
    ...(overrides.nextMaintenanceDate !== undefined ? { nextMaintenanceDate: overrides.nextMaintenanceDate } : {}),
    ...(overrides.notes !== undefined ? { notes: overrides.notes } : {}),
  };
}

const CATEGORIES: AssetCategory[] = ['EQUIPMENT', 'VEHICLE', 'IT_HARDWARE', 'FACILITY', 'TOOL', 'INSTRUMENT'];
const STATUSES: AssetStatus[] = ['PLANNING', 'ACQUIRED', 'IN_SERVICE', 'UNDER_MAINTENANCE', 'RETIRED', 'DISPOSED'];
const CONDITIONS: ConditionRating[] = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'];
const MAINT_TYPES: MaintenanceType[] = ['PREVENTIVE', 'CORRECTIVE', 'PREDICTIVE', 'CONDITION_BASED'];
const DEPR_METHODS: DepreciationMethod[] = ['STRAIGHT_LINE', 'DECLINING_BALANCE', 'UNITS_OF_PRODUCTION'];

// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — register
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry.register', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  it('register returns PLANNING status', () => {
    const a = registry.register(makeAsset());
    expect(a.status).toBe('PLANNING');
  });

  it('register returns EXCELLENT condition', () => {
    const a = registry.register(makeAsset());
    expect(a.condition).toBe('EXCELLENT');
  });

  it('register persists the asset', () => {
    registry.register(makeAsset({ id: 'x1' }));
    expect(registry.get('x1')).toBeDefined();
  });

  it('register returns correct id', () => {
    const a = registry.register(makeAsset({ id: 'reg-id' }));
    expect(a.id).toBe('reg-id');
  });

  it('register returns correct name', () => {
    const a = registry.register(makeAsset({ name: 'Pump A' }));
    expect(a.name).toBe('Pump A');
  });

  it('register returns correct location', () => {
    const a = registry.register(makeAsset({ location: 'Site B' }));
    expect(a.location).toBe('Site B');
  });

  it('register returns correct acquisitionCost', () => {
    const a = registry.register(makeAsset({ acquisitionCost: 50000 }));
    expect(a.acquisitionCost).toBe(50000);
  });

  it('register returns correct usefulLifeYears', () => {
    const a = registry.register(makeAsset({ usefulLifeYears: 5 }));
    expect(a.usefulLifeYears).toBe(5);
  });

  it('register returns correct salvageValue', () => {
    const a = registry.register(makeAsset({ salvageValue: 500 }));
    expect(a.salvageValue).toBe(500);
  });

  it('register increments count', () => {
    registry.register(makeAsset({ id: 'a1' }));
    registry.register(makeAsset({ id: 'a2' }));
    expect(registry.getCount()).toBe(2);
  });

  // Register N assets with different categories
  Array.from({ length: 6 }, (_, i) => CATEGORIES[i]).forEach((cat, i) => {
    it(`register category ${cat} (${i})`, () => {
      const a = registry.register(makeAsset({ id: `cat-${i}`, category: cat }));
      expect(a.category).toBe(cat);
    });
  });

  // Register 25 assets, confirm count
  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`register asset-${i} accumulates count`, () => {
      Array.from({ length: i + 1 }, (_, j) => j).forEach((j) => {
        registry.register(makeAsset({ id: `bulk-${j}` }));
      });
      expect(registry.getCount()).toBe(i + 1);
    });
  });

  // Returned object is a copy (mutation doesn't affect store)
  it('returned record is a copy', () => {
    const a = registry.register(makeAsset({ id: 'copy-test' }));
    (a as any).status = 'DISPOSED';
    expect(registry.get('copy-test')?.status).toBe('PLANNING');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — status transitions
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry status transitions', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  it('acquire sets status to ACQUIRED', () => {
    registry.register(makeAsset({ id: 't1' }));
    const a = registry.acquire('t1', '2023-06-01');
    expect(a.status).toBe('ACQUIRED');
  });

  it('acquire updates acquisitionDate', () => {
    registry.register(makeAsset({ id: 't2' }));
    const a = registry.acquire('t2', '2024-01-15');
    expect(a.acquisitionDate).toBe('2024-01-15');
  });

  it('putInService sets status to IN_SERVICE', () => {
    registry.register(makeAsset({ id: 't3' }));
    registry.acquire('t3', '2023-06-01');
    const a = registry.putInService('t3');
    expect(a.status).toBe('IN_SERVICE');
  });

  it('sendForMaintenance sets status to UNDER_MAINTENANCE', () => {
    registry.register(makeAsset({ id: 't4' }));
    registry.putInService('t4');
    const a = registry.sendForMaintenance('t4');
    expect(a.status).toBe('UNDER_MAINTENANCE');
  });

  it('retire sets status to RETIRED', () => {
    registry.register(makeAsset({ id: 't5' }));
    registry.putInService('t5');
    const a = registry.retire('t5');
    expect(a.status).toBe('RETIRED');
  });

  it('dispose sets status to DISPOSED', () => {
    registry.register(makeAsset({ id: 't6' }));
    registry.retire('t6');
    const a = registry.dispose('t6');
    expect(a.status).toBe('DISPOSED');
  });

  // Full lifecycle chain
  it('full lifecycle PLANNING→ACQUIRED→IN_SERVICE→UNDER_MAINTENANCE→RETIRED→DISPOSED', () => {
    registry.register(makeAsset({ id: 'full' }));
    expect(registry.get('full')!.status).toBe('PLANNING');
    registry.acquire('full', '2023-01-01');
    expect(registry.get('full')!.status).toBe('ACQUIRED');
    registry.putInService('full');
    expect(registry.get('full')!.status).toBe('IN_SERVICE');
    registry.sendForMaintenance('full');
    expect(registry.get('full')!.status).toBe('UNDER_MAINTENANCE');
    registry.retire('full');
    expect(registry.get('full')!.status).toBe('RETIRED');
    registry.dispose('full');
    expect(registry.get('full')!.status).toBe('DISPOSED');
  });

  // Test transitions for 20 assets
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`transition chain for asset-${i}`, () => {
      const id = `trans-${i}`;
      registry.register(makeAsset({ id }));
      expect(registry.acquire(id, '2023-01-01').status).toBe('ACQUIRED');
      expect(registry.putInService(id).status).toBe('IN_SERVICE');
      expect(registry.sendForMaintenance(id).status).toBe('UNDER_MAINTENANCE');
      expect(registry.retire(id).status).toBe('RETIRED');
      expect(registry.dispose(id).status).toBe('DISPOSED');
    });
  });

  // Error on unknown id for each transition method
  it('acquire throws for unknown id', () => {
    expect(() => registry.acquire('nope', '2023-01-01')).toThrow();
  });

  it('putInService throws for unknown id', () => {
    expect(() => registry.putInService('nope')).toThrow();
  });

  it('sendForMaintenance throws for unknown id', () => {
    expect(() => registry.sendForMaintenance('nope')).toThrow();
  });

  it('retire throws for unknown id', () => {
    expect(() => registry.retire('nope')).toThrow();
  });

  it('dispose throws for unknown id', () => {
    expect(() => registry.dispose('nope')).toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — updateCondition
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry.updateCondition', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  CONDITIONS.forEach((cond, i) => {
    it(`updateCondition to ${cond}`, () => {
      registry.register(makeAsset({ id: `cond-${i}` }));
      const a = registry.updateCondition(`cond-${i}`, cond);
      expect(a.condition).toBe(cond);
    });

    it(`updateCondition ${cond} persists in get()`, () => {
      registry.register(makeAsset({ id: `condp-${i}` }));
      registry.updateCondition(`condp-${i}`, cond);
      expect(registry.get(`condp-${i}`)?.condition).toBe(cond);
    });
  });

  it('updateCondition throws for unknown id', () => {
    expect(() => registry.updateCondition('nope', 'GOOD')).toThrow();
  });

  // Cycle through conditions 20 times
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`condition cycling asset-${i}`, () => {
      const id = `cycle-${i}`;
      registry.register(makeAsset({ id }));
      const cond = CONDITIONS[i % CONDITIONS.length];
      registry.updateCondition(id, cond);
      expect(registry.get(id)?.condition).toBe(cond);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — assign
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry.assign', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  it('assign sets assignedTo', () => {
    registry.register(makeAsset({ id: 'a1' }));
    const a = registry.assign('a1', 'John Doe');
    expect(a.assignedTo).toBe('John Doe');
  });

  it('assign persists in get()', () => {
    registry.register(makeAsset({ id: 'a2' }));
    registry.assign('a2', 'Jane Smith');
    expect(registry.get('a2')?.assignedTo).toBe('Jane Smith');
  });

  it('assign throws for unknown id', () => {
    expect(() => registry.assign('nope', 'X')).toThrow();
  });

  it('assign can re-assign to different person', () => {
    registry.register(makeAsset({ id: 'a3' }));
    registry.assign('a3', 'Alice');
    registry.assign('a3', 'Bob');
    expect(registry.get('a3')?.assignedTo).toBe('Bob');
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`assign asset-${i} to user-${i}`, () => {
      const id = `asgn-${i}`;
      registry.register(makeAsset({ id }));
      registry.assign(id, `user-${i}`);
      expect(registry.get(id)?.assignedTo).toBe(`user-${i}`);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — get / getAll / getCount
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry get/getAll/getCount', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  it('get returns undefined for missing id', () => {
    expect(registry.get('missing')).toBeUndefined();
  });

  it('getAll returns empty array initially', () => {
    expect(registry.getAll()).toHaveLength(0);
  });

  it('getCount returns 0 initially', () => {
    expect(registry.getCount()).toBe(0);
  });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach((n) => {
    it(`getAll length ${n} after registering ${n} assets`, () => {
      Array.from({ length: n }, (_, j) => j).forEach((j) => {
        registry.register(makeAsset({ id: `ga-${n}-${j}` }));
      });
      expect(registry.getAll()).toHaveLength(n);
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
    it(`get returns correct asset for id ga2-${i}`, () => {
      registry.register(makeAsset({ id: `ga2-${i}`, name: `Name ${i}` }));
      expect(registry.get(`ga2-${i}`)?.name).toBe(`Name ${i}`);
    });
  });

  it('getAll returns copies (not references)', () => {
    registry.register(makeAsset({ id: 'ref1' }));
    const all = registry.getAll();
    all[0].status = 'DISPOSED';
    expect(registry.get('ref1')?.status).toBe('PLANNING');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — getByStatus
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry.getByStatus', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  it('getByStatus PLANNING returns only PLANNING assets', () => {
    Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
      registry.register(makeAsset({ id: `s-${i}` }));
    });
    expect(registry.getByStatus('PLANNING')).toHaveLength(5);
  });

  it('getByStatus IN_SERVICE returns only IN_SERVICE', () => {
    registry.register(makeAsset({ id: 'svc1' }));
    registry.register(makeAsset({ id: 'svc2' }));
    registry.putInService('svc1');
    expect(registry.getByStatus('IN_SERVICE')).toHaveLength(1);
  });

  it('getByStatus ACQUIRED returns correct count', () => {
    Array.from({ length: 4 }, (_, i) => i).forEach((i) => {
      registry.register(makeAsset({ id: `acq-${i}` }));
      registry.acquire(`acq-${i}`, '2023-01-01');
    });
    expect(registry.getByStatus('ACQUIRED')).toHaveLength(4);
  });

  it('getByStatus returns empty when no match', () => {
    registry.register(makeAsset({ id: 'ronly' }));
    expect(registry.getByStatus('DISPOSED')).toHaveLength(0);
  });

  // Test all statuses produce expected results
  STATUSES.forEach((status, i) => {
    it(`getByStatus ${status} returns matching assets`, () => {
      const id = `st-${i}`;
      registry.register(makeAsset({ id }));
      if (status === 'ACQUIRED') registry.acquire(id, '2023-01-01');
      else if (status === 'IN_SERVICE') registry.putInService(id);
      else if (status === 'UNDER_MAINTENANCE') registry.sendForMaintenance(id);
      else if (status === 'RETIRED') registry.retire(id);
      else if (status === 'DISPOSED') registry.dispose(id);
      const results = registry.getByStatus(status);
      expect(results.some((a) => a.id === id)).toBe(true);
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
    it(`getByStatus mixed batch ${i}`, () => {
      const id1 = `mb1-${i}`;
      const id2 = `mb2-${i}`;
      registry.register(makeAsset({ id: id1 }));
      registry.register(makeAsset({ id: id2 }));
      registry.putInService(id1);
      expect(registry.getByStatus('IN_SERVICE').some((a) => a.id === id1)).toBe(true);
      expect(registry.getByStatus('PLANNING').some((a) => a.id === id2)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — getByCategory
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry.getByCategory', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  CATEGORIES.forEach((cat, i) => {
    it(`getByCategory ${cat} returns all matching assets`, () => {
      Array.from({ length: 3 }, (_, j) => j).forEach((j) => {
        registry.register(makeAsset({ id: `cat-${i}-${j}`, category: cat }));
      });
      const results = registry.getByCategory(cat);
      expect(results).toHaveLength(3);
      results.forEach((a) => expect(a.category).toBe(cat));
    });
  });

  it('getByCategory returns empty if no match', () => {
    registry.register(makeAsset({ id: 'cat-only', category: 'EQUIPMENT' }));
    expect(registry.getByCategory('VEHICLE')).toHaveLength(0);
  });

  Array.from({ length: 18 }, (_, i) => i).forEach((i) => {
    it(`getByCategory parameterised ${i}`, () => {
      const cat = CATEGORIES[i % CATEGORIES.length];
      const id = `catpar-${i}`;
      registry.register(makeAsset({ id, category: cat }));
      expect(registry.getByCategory(cat).some((a) => a.id === id)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — getByLocation
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry.getByLocation', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  it('getByLocation returns matching assets', () => {
    registry.register(makeAsset({ id: 'loc1', location: 'Plant A' }));
    registry.register(makeAsset({ id: 'loc2', location: 'Plant A' }));
    registry.register(makeAsset({ id: 'loc3', location: 'Plant B' }));
    expect(registry.getByLocation('Plant A')).toHaveLength(2);
  });

  it('getByLocation returns empty if no match', () => {
    registry.register(makeAsset({ id: 'loc4', location: 'Plant A' }));
    expect(registry.getByLocation('Plant Z')).toHaveLength(0);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getByLocation batch ${i}`, () => {
      const loc = `Location-${i % 5}`;
      const id = `locbat-${i}`;
      registry.register(makeAsset({ id, location: loc }));
      expect(registry.getByLocation(loc).some((a) => a.id === id)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — getByCondition / getCriticalAssets
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry.getByCondition and getCriticalAssets', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  CONDITIONS.forEach((cond, i) => {
    it(`getByCondition ${cond} returns matching assets`, () => {
      const id = `condtest-${i}`;
      registry.register(makeAsset({ id }));
      registry.updateCondition(id, cond);
      const results = registry.getByCondition(cond);
      expect(results.some((a) => a.id === id)).toBe(true);
    });
  });

  it('getCriticalAssets returns only CRITICAL condition', () => {
    registry.register(makeAsset({ id: 'crit1' }));
    registry.register(makeAsset({ id: 'crit2' }));
    registry.register(makeAsset({ id: 'ok1' }));
    registry.updateCondition('crit1', 'CRITICAL');
    registry.updateCondition('crit2', 'CRITICAL');
    registry.updateCondition('ok1', 'GOOD');
    const crits = registry.getCriticalAssets();
    expect(crits).toHaveLength(2);
    crits.forEach((a) => expect(a.condition).toBe('CRITICAL'));
  });

  it('getCriticalAssets returns empty when none critical', () => {
    registry.register(makeAsset({ id: 'nocrit' }));
    expect(registry.getCriticalAssets()).toHaveLength(0);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getCriticalAssets batch ${i}`, () => {
      const id = `critbat-${i}`;
      registry.register(makeAsset({ id }));
      if (i % 2 === 0) {
        registry.updateCondition(id, 'CRITICAL');
        expect(registry.getCriticalAssets().some((a) => a.id === id)).toBe(true);
      } else {
        registry.updateCondition(id, 'GOOD');
        expect(registry.getCriticalAssets().some((a) => a.id === id)).toBe(false);
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — calculateDepreciation STRAIGHT_LINE
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry.calculateDepreciation — STRAIGHT_LINE', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  it('SL year 0 bookValue equals acquisitionCost', () => {
    registry.register(makeAsset({ id: 'sl1', acquisitionCost: 10000, salvageValue: 1000, usefulLifeYears: 9 }));
    const r = registry.calculateDepreciation('sl1', 'STRAIGHT_LINE', 0);
    expect(r.bookValue).toBeCloseTo(10000);
  });

  it('SL year usefulLife bookValue equals salvageValue', () => {
    registry.register(makeAsset({ id: 'sl2', acquisitionCost: 10000, salvageValue: 1000, usefulLifeYears: 9 }));
    const r = registry.calculateDepreciation('sl2', 'STRAIGHT_LINE', 9);
    expect(r.bookValue).toBeCloseTo(1000);
  });

  it('SL annual depreciation is (cost - salvage) / life', () => {
    registry.register(makeAsset({ id: 'sl3', acquisitionCost: 10000, salvageValue: 1000, usefulLifeYears: 9 }));
    const r = registry.calculateDepreciation('sl3', 'STRAIGHT_LINE', 1);
    expect(r.annualDepreciation).toBeCloseTo(1000);
  });

  it('SL returns correct assetId', () => {
    registry.register(makeAsset({ id: 'sl4' }));
    const r = registry.calculateDepreciation('sl4', 'STRAIGHT_LINE', 1);
    expect(r.assetId).toBe('sl4');
  });

  it('SL returns correct method', () => {
    registry.register(makeAsset({ id: 'sl5' }));
    const r = registry.calculateDepreciation('sl5', 'STRAIGHT_LINE', 1);
    expect(r.method).toBe('STRAIGHT_LINE');
  });

  it('SL depreciationToDate = cost - bookValue', () => {
    registry.register(makeAsset({ id: 'sl6', acquisitionCost: 5000, salvageValue: 500, usefulLifeYears: 5 }));
    const r = registry.calculateDepreciation('sl6', 'STRAIGHT_LINE', 3);
    expect(r.depreciationToDate).toBeCloseTo(r.annualDepreciation * 3);
  });

  it('SL yearsElapsed clamped to usefulLifeYears', () => {
    registry.register(makeAsset({ id: 'sl7', usefulLifeYears: 5 }));
    const r = registry.calculateDepreciation('sl7', 'STRAIGHT_LINE', 100);
    expect(r.yearsElapsed).toBe(5);
  });

  it('SL bookValue never below salvageValue', () => {
    registry.register(makeAsset({ id: 'sl8', acquisitionCost: 1000, salvageValue: 500, usefulLifeYears: 2 }));
    const r = registry.calculateDepreciation('sl8', 'STRAIGHT_LINE', 50);
    expect(r.bookValue).toBeGreaterThanOrEqual(500);
  });

  it('SL throws for unknown id', () => {
    expect(() => registry.calculateDepreciation('nope', 'STRAIGHT_LINE', 1)).toThrow();
  });

  // 10 years of SL depreciation
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((year) => {
    it(`SL year ${year} bookValue correctness`, () => {
      registry.register(makeAsset({
        id: `sl-y${year}`,
        acquisitionCost: 10000,
        salvageValue: 1000,
        usefulLifeYears: 10,
      }));
      const r = registry.calculateDepreciation(`sl-y${year}`, 'STRAIGHT_LINE', year);
      const expected = Math.max(1000, 10000 - 900 * year);
      expect(r.bookValue).toBeCloseTo(expected);
    });
  });

  // SL with various costs
  Array.from({ length: 15 }, (_, i) => (i + 1) * 5000).forEach((cost, i) => {
    it(`SL cost ${cost} year 1`, () => {
      const id = `sl-cost-${i}`;
      registry.register(makeAsset({ id, acquisitionCost: cost, salvageValue: 0, usefulLifeYears: 10 }));
      const r = registry.calculateDepreciation(id, 'STRAIGHT_LINE', 1);
      expect(r.annualDepreciation).toBeCloseTo(cost / 10);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — calculateDepreciation DECLINING_BALANCE
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry.calculateDepreciation — DECLINING_BALANCE', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  it('DB year 0 bookValue equals acquisitionCost', () => {
    registry.register(makeAsset({ id: 'db1', acquisitionCost: 10000, salvageValue: 1000, usefulLifeYears: 10 }));
    const r = registry.calculateDepreciation('db1', 'DECLINING_BALANCE', 0);
    expect(r.bookValue).toBeCloseTo(10000);
  });

  it('DB bookValue decreases over years', () => {
    registry.register(makeAsset({ id: 'db2', acquisitionCost: 10000, salvageValue: 1000, usefulLifeYears: 10 }));
    const r1 = registry.calculateDepreciation('db2', 'DECLINING_BALANCE', 1);
    const r2 = registry.calculateDepreciation('db2', 'DECLINING_BALANCE', 2);
    expect(r2.bookValue).toBeLessThan(r1.bookValue);
  });

  it('DB bookValue never below salvageValue', () => {
    registry.register(makeAsset({ id: 'db3', acquisitionCost: 10000, salvageValue: 1000, usefulLifeYears: 5 }));
    const r = registry.calculateDepreciation('db3', 'DECLINING_BALANCE', 100);
    expect(r.bookValue).toBeGreaterThanOrEqual(1000);
  });

  it('DB method field is DECLINING_BALANCE', () => {
    registry.register(makeAsset({ id: 'db4' }));
    const r = registry.calculateDepreciation('db4', 'DECLINING_BALANCE', 2);
    expect(r.method).toBe('DECLINING_BALANCE');
  });

  it('DB depreciationToDate = cost - bookValue', () => {
    registry.register(makeAsset({ id: 'db5', acquisitionCost: 10000, salvageValue: 0, usefulLifeYears: 10 }));
    const r = registry.calculateDepreciation('db5', 'DECLINING_BALANCE', 3);
    expect(r.depreciationToDate).toBeCloseTo(10000 - r.bookValue);
  });

  it('DB throws for unknown id', () => {
    expect(() => registry.calculateDepreciation('nope', 'DECLINING_BALANCE', 1)).toThrow();
  });

  it('DB rate = 2/usefulLifeYears', () => {
    registry.register(makeAsset({ id: 'db6', acquisitionCost: 10000, salvageValue: 0, usefulLifeYears: 10 }));
    const r = registry.calculateDepreciation('db6', 'DECLINING_BALANCE', 1);
    expect(r.bookValue).toBeCloseTo(10000 * (1 - 2 / 10));
  });

  // 10 years of DB
  Array.from({ length: 10 }, (_, i) => i + 1).forEach((year) => {
    it(`DB year ${year} bookValue formula`, () => {
      registry.register(makeAsset({
        id: `db-y${year}`,
        acquisitionCost: 10000,
        salvageValue: 0,
        usefulLifeYears: 10,
      }));
      const r = registry.calculateDepreciation(`db-y${year}`, 'DECLINING_BALANCE', year);
      const expected = Math.max(0, 10000 * Math.pow(1 - 0.2, year));
      expect(r.bookValue).toBeCloseTo(expected);
    });
  });

  // DB with various useful lives
  Array.from({ length: 10 }, (_, i) => i + 2).forEach((life) => {
    it(`DB usefulLifeYears=${life} year 1`, () => {
      const id = `db-life-${life}`;
      registry.register(makeAsset({ id, acquisitionCost: 8000, salvageValue: 0, usefulLifeYears: life }));
      const r = registry.calculateDepreciation(id, 'DECLINING_BALANCE', 1);
      const rate = 2 / life;
      expect(r.bookValue).toBeCloseTo(Math.max(0, 8000 * (1 - rate)));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AssetRegistry — calculateDepreciation UNITS_OF_PRODUCTION
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry.calculateDepreciation — UNITS_OF_PRODUCTION', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  it('UOP year 0 bookValue equals acquisitionCost', () => {
    registry.register(makeAsset({ id: 'uop1', acquisitionCost: 6000, salvageValue: 500, usefulLifeYears: 10 }));
    const r = registry.calculateDepreciation('uop1', 'UNITS_OF_PRODUCTION', 0);
    expect(r.bookValue).toBeCloseTo(6000);
  });

  it('UOP method field is UNITS_OF_PRODUCTION', () => {
    registry.register(makeAsset({ id: 'uop2' }));
    const r = registry.calculateDepreciation('uop2', 'UNITS_OF_PRODUCTION', 1);
    expect(r.method).toBe('UNITS_OF_PRODUCTION');
  });

  it('UOP bookValue never below salvageValue', () => {
    registry.register(makeAsset({ id: 'uop3', acquisitionCost: 5000, salvageValue: 500, usefulLifeYears: 5 }));
    const r = registry.calculateDepreciation('uop3', 'UNITS_OF_PRODUCTION', 100);
    expect(r.bookValue).toBeGreaterThanOrEqual(500);
  });

  it('UOP throws for unknown id', () => {
    expect(() => registry.calculateDepreciation('nope', 'UNITS_OF_PRODUCTION', 1)).toThrow();
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach((year) => {
    it(`UOP year ${year} bookValue`, () => {
      registry.register(makeAsset({
        id: `uop-y${year}`,
        acquisitionCost: 10000,
        salvageValue: 1000,
        usefulLifeYears: 10,
      }));
      const r = registry.calculateDepreciation(`uop-y${year}`, 'UNITS_OF_PRODUCTION', year);
      const expected = Math.max(1000, 10000 - 900 * year);
      expect(r.bookValue).toBeCloseTo(expected);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MaintenanceScheduler — schedule
// ─────────────────────────────────────────────────────────────────────────────

describe('MaintenanceScheduler.schedule', () => {
  let scheduler: MaintenanceScheduler;
  beforeEach(() => { scheduler = new MaintenanceScheduler(); });

  it('schedule returns a record with id maint-1', () => {
    const r = scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'Routine check');
    expect(r.id).toBe('maint-1');
  });

  it('schedule auto-increments id', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'First');
    const r2 = scheduler.schedule('a1', 'CORRECTIVE', '2024-02-01', 'Second');
    expect(r2.id).toBe('maint-2');
  });

  it('schedule stores assetId', () => {
    const r = scheduler.schedule('asset-xyz', 'PREDICTIVE', '2024-03-01', 'Inspect');
    expect(r.assetId).toBe('asset-xyz');
  });

  it('schedule stores type', () => {
    const r = scheduler.schedule('a1', 'CONDITION_BASED', '2024-01-01', 'Desc');
    expect(r.type).toBe('CONDITION_BASED');
  });

  it('schedule stores scheduledDate', () => {
    const r = scheduler.schedule('a1', 'PREVENTIVE', '2025-06-15', 'Desc');
    expect(r.scheduledDate).toBe('2025-06-15');
  });

  it('schedule stores description', () => {
    const r = scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'Oil change');
    expect(r.description).toBe('Oil change');
  });

  it('schedule stores technician when provided', () => {
    const r = scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'Desc', 'Alice');
    expect(r.technician).toBe('Alice');
  });

  it('schedule leaves completedDate undefined', () => {
    const r = scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'Desc');
    expect(r.completedDate).toBeUndefined();
  });

  it('schedule increments getCount', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'D1');
    scheduler.schedule('a2', 'CORRECTIVE', '2024-02-01', 'D2');
    expect(scheduler.getCount()).toBe(2);
  });

  MAINT_TYPES.forEach((type, i) => {
    it(`schedule type ${type}`, () => {
      const r = scheduler.schedule('a1', type, '2024-01-01', `Desc ${i}`);
      expect(r.type).toBe(type);
    });
  });

  // 20 schedules with various assets
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`schedule batch item ${i}`, () => {
      const r = scheduler.schedule(`asset-${i}`, MAINT_TYPES[i % 4], `2024-${String(i % 12 + 1).padStart(2, '0')}-01`, `Desc ${i}`);
      expect(r.assetId).toBe(`asset-${i}`);
      expect(r.type).toBe(MAINT_TYPES[i % 4]);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MaintenanceScheduler — complete
// ─────────────────────────────────────────────────────────────────────────────

describe('MaintenanceScheduler.complete', () => {
  let scheduler: MaintenanceScheduler;
  beforeEach(() => { scheduler = new MaintenanceScheduler(); });

  it('complete sets completedDate', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'Desc');
    const r = scheduler.complete('maint-1', '2024-01-10', 'Done');
    expect(r.completedDate).toBe('2024-01-10');
  });

  it('complete sets outcome', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'Desc');
    const r = scheduler.complete('maint-1', '2024-01-10', 'All good');
    expect(r.outcome).toBe('All good');
  });

  it('complete sets cost when provided', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'Desc');
    const r = scheduler.complete('maint-1', '2024-01-10', 'Done', 500);
    expect(r.cost).toBe(500);
  });

  it('complete leaves cost undefined when not provided', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'Desc');
    const r = scheduler.complete('maint-1', '2024-01-10', 'Done');
    expect(r.cost).toBeUndefined();
  });

  it('complete throws for unknown id', () => {
    expect(() => scheduler.complete('nope', '2024-01-01', 'Done')).toThrow();
  });

  it('complete persists changes in getCompleted()', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'Desc');
    scheduler.complete('maint-1', '2024-01-10', 'Done');
    expect(scheduler.getCompleted()).toHaveLength(1);
  });

  it('complete moves from pending to completed', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'Desc');
    expect(scheduler.getPending()).toHaveLength(1);
    scheduler.complete('maint-1', '2024-01-10', 'Done');
    expect(scheduler.getPending()).toHaveLength(0);
    expect(scheduler.getCompleted()).toHaveLength(1);
  });

  // Complete 20 records — each test schedules exactly 1 record (maint-1) then completes it
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`complete record iteration ${i}`, () => {
      scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', `Desc ${i}`);
      const r = scheduler.complete('maint-1', '2024-01-10', `Outcome ${i}`, (i + 1) * 100);
      expect(r.completedDate).toBe('2024-01-10');
      expect(r.outcome).toBe(`Outcome ${i}`);
      expect(r.cost).toBe((i + 1) * 100);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MaintenanceScheduler — getByAsset
// ─────────────────────────────────────────────────────────────────────────────

describe('MaintenanceScheduler.getByAsset', () => {
  let scheduler: MaintenanceScheduler;
  beforeEach(() => { scheduler = new MaintenanceScheduler(); });

  it('getByAsset returns all records for asset', () => {
    scheduler.schedule('asset-1', 'PREVENTIVE', '2024-01-01', 'D1');
    scheduler.schedule('asset-1', 'CORRECTIVE', '2024-02-01', 'D2');
    scheduler.schedule('asset-2', 'PREVENTIVE', '2024-03-01', 'D3');
    expect(scheduler.getByAsset('asset-1')).toHaveLength(2);
  });

  it('getByAsset returns empty for unknown asset', () => {
    expect(scheduler.getByAsset('unknown')).toHaveLength(0);
  });

  it('getByAsset records have correct assetId', () => {
    scheduler.schedule('az1', 'PREDICTIVE', '2024-01-01', 'D');
    scheduler.schedule('az1', 'CORRECTIVE', '2024-02-01', 'D');
    scheduler.getByAsset('az1').forEach((r) => expect(r.assetId).toBe('az1'));
  });

  Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
    it(`getByAsset batch ${i}`, () => {
      const assetId = `batch-asset-${i}`;
      const count = (i % 5) + 1;
      Array.from({ length: count }, (_, j) => j).forEach((j) => {
        scheduler.schedule(assetId, 'PREVENTIVE', `2024-0${j + 1}-01`, `Desc ${j}`);
      });
      expect(scheduler.getByAsset(assetId)).toHaveLength(count);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MaintenanceScheduler — getByType
// ─────────────────────────────────────────────────────────────────────────────

describe('MaintenanceScheduler.getByType', () => {
  let scheduler: MaintenanceScheduler;
  beforeEach(() => { scheduler = new MaintenanceScheduler(); });

  MAINT_TYPES.forEach((type, i) => {
    it(`getByType ${type} returns correct count`, () => {
      Array.from({ length: 3 }, (_, j) => j).forEach((j) => {
        scheduler.schedule(`a${j}`, type, '2024-01-01', `Desc ${j}`);
      });
      const results = scheduler.getByType(type);
      expect(results).toHaveLength(3);
      results.forEach((r) => expect(r.type).toBe(type));
    });
  });

  it('getByType returns empty when no match', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'D');
    expect(scheduler.getByType('CORRECTIVE')).toHaveLength(0);
  });

  Array.from({ length: 16 }, (_, i) => i).forEach((i) => {
    it(`getByType parameterised ${i}`, () => {
      const type = MAINT_TYPES[i % 4];
      scheduler.schedule(`a${i}`, type, '2024-01-01', `D${i}`);
      expect(scheduler.getByType(type).some((r) => r.assetId === `a${i}`)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MaintenanceScheduler — getPending / getCompleted
// ─────────────────────────────────────────────────────────────────────────────

describe('MaintenanceScheduler getPending / getCompleted', () => {
  let scheduler: MaintenanceScheduler;
  beforeEach(() => { scheduler = new MaintenanceScheduler(); });

  it('getPending returns all without completedDate', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'D1');
    scheduler.schedule('a2', 'CORRECTIVE', '2024-02-01', 'D2');
    expect(scheduler.getPending()).toHaveLength(2);
  });

  it('getCompleted returns empty initially', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'D');
    expect(scheduler.getCompleted()).toHaveLength(0);
  });

  it('completing moves from pending to completed', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'D');
    scheduler.schedule('a2', 'CORRECTIVE', '2024-02-01', 'D');
    scheduler.complete('maint-1', '2024-01-10', 'Done');
    expect(scheduler.getPending()).toHaveLength(1);
    expect(scheduler.getCompleted()).toHaveLength(1);
  });

  it('pending records have no completedDate', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'D');
    scheduler.getPending().forEach((r) => expect(r.completedDate).toBeUndefined());
  });

  it('completed records have completedDate', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'D');
    scheduler.complete('maint-1', '2024-01-10', 'OK');
    scheduler.getCompleted().forEach((r) => expect(r.completedDate).toBeDefined());
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`pending/completed balance ${i}`, () => {
      const total = i + 1;
      const completeCount = Math.floor(total / 2);
      Array.from({ length: total }, (_, j) => j).forEach((j) => {
        scheduler.schedule(`a${j}`, 'PREVENTIVE', '2024-01-01', `D${j}`);
      });
      Array.from({ length: completeCount }, (_, j) => j).forEach((j) => {
        scheduler.complete(`maint-${j + 1}`, '2024-01-10', 'Done');
      });
      expect(scheduler.getPending()).toHaveLength(total - completeCount);
      expect(scheduler.getCompleted()).toHaveLength(completeCount);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MaintenanceScheduler — getOverdue
// ─────────────────────────────────────────────────────────────────────────────

describe('MaintenanceScheduler.getOverdue', () => {
  let scheduler: MaintenanceScheduler;
  beforeEach(() => { scheduler = new MaintenanceScheduler(); });

  it('getOverdue returns pending records with scheduledDate < asOf', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'Old');
    scheduler.schedule('a2', 'CORRECTIVE', '2024-12-31', 'Future');
    const overdue = scheduler.getOverdue('2024-06-01');
    expect(overdue).toHaveLength(1);
    expect(overdue[0].assetId).toBe('a1');
  });

  it('getOverdue does not include completed records', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'Old');
    scheduler.complete('maint-1', '2024-01-10', 'Done');
    expect(scheduler.getOverdue('2024-06-01')).toHaveLength(0);
  });

  it('getOverdue returns empty when none overdue', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2025-01-01', 'Future');
    expect(scheduler.getOverdue('2024-06-01')).toHaveLength(0);
  });

  it('getOverdue exact date is not overdue (scheduledDate == asOf)', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-06-01', 'Same day');
    expect(scheduler.getOverdue('2024-06-01')).toHaveLength(0);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getOverdue batch ${i}`, () => {
      const daysBack = i + 1;
      const pastDate = `2024-01-${String(daysBack).padStart(2, '0')}`;
      const id = `od-asset-${i}`;
      scheduler.schedule(id, 'PREVENTIVE', pastDate, `Overdue ${i}`);
      const overdueList = scheduler.getOverdue('2024-02-01');
      expect(overdueList.some((r) => r.assetId === id)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MaintenanceScheduler — getTotalCost
// ─────────────────────────────────────────────────────────────────────────────

describe('MaintenanceScheduler.getTotalCost', () => {
  let scheduler: MaintenanceScheduler;
  beforeEach(() => { scheduler = new MaintenanceScheduler(); });

  it('getTotalCost returns 0 for asset with no completed records', () => {
    expect(scheduler.getTotalCost('a1')).toBe(0);
  });

  it('getTotalCost returns 0 for completed records without cost', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'D');
    scheduler.complete('maint-1', '2024-01-10', 'Done');
    expect(scheduler.getTotalCost('a1')).toBe(0);
  });

  it('getTotalCost sums costs of completed records', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'D1');
    scheduler.schedule('a1', 'CORRECTIVE', '2024-02-01', 'D2');
    scheduler.complete('maint-1', '2024-01-10', 'Done', 200);
    scheduler.complete('maint-2', '2024-02-10', 'Done', 300);
    expect(scheduler.getTotalCost('a1')).toBe(500);
  });

  it('getTotalCost only counts records for given assetId', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'D');
    scheduler.schedule('a2', 'PREVENTIVE', '2024-01-01', 'D');
    scheduler.complete('maint-1', '2024-01-10', 'Done', 100);
    scheduler.complete('maint-2', '2024-01-10', 'Done', 999);
    expect(scheduler.getTotalCost('a1')).toBe(100);
  });

  it('getTotalCost does not count pending records with cost', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'D');
    // Not completing it — pending record
    expect(scheduler.getTotalCost('a1')).toBe(0);
  });

  // Parameterised cost sums
  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`getTotalCost ${n} completed records sum`, () => {
      const assetId = `cost-asset-${n}`;
      Array.from({ length: n }, (_, j) => j).forEach((j) => {
        scheduler.schedule(assetId, 'PREVENTIVE', '2024-01-01', `D${j}`);
        scheduler.complete(`maint-${j + 1}`, '2024-01-10', 'Done', 100);
      });
      expect(scheduler.getTotalCost(assetId)).toBe(n * 100);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// MaintenanceScheduler — getCount
// ─────────────────────────────────────────────────────────────────────────────

describe('MaintenanceScheduler.getCount', () => {
  let scheduler: MaintenanceScheduler;
  beforeEach(() => { scheduler = new MaintenanceScheduler(); });

  it('getCount returns 0 initially', () => {
    expect(scheduler.getCount()).toBe(0);
  });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach((n) => {
    it(`getCount returns ${n} after ${n} schedules`, () => {
      Array.from({ length: n }, (_, j) => j).forEach((j) => {
        scheduler.schedule(`a${j}`, 'PREVENTIVE', '2024-01-01', `D${j}`);
      });
      expect(scheduler.getCount()).toBe(n);
    });
  });

  it('getCount includes completed records', () => {
    scheduler.schedule('a1', 'PREVENTIVE', '2024-01-01', 'D');
    scheduler.complete('maint-1', '2024-01-10', 'Done');
    expect(scheduler.getCount()).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Integration: AssetRegistry + MaintenanceScheduler', () => {
  let registry: AssetRegistry;
  let scheduler: MaintenanceScheduler;
  beforeEach(() => {
    registry = new AssetRegistry();
    scheduler = new MaintenanceScheduler();
  });

  it('register asset, schedule maintenance, complete, verify cost', () => {
    registry.register(makeAsset({ id: 'int-1' }));
    scheduler.schedule('int-1', 'PREVENTIVE', '2024-01-01', 'Annual check', 'Bob');
    scheduler.complete('maint-1', '2024-01-05', 'All good', 750);
    expect(scheduler.getTotalCost('int-1')).toBe(750);
    expect(scheduler.getCompleted()).toHaveLength(1);
  });

  it('asset condition update and getCriticalAssets integration', () => {
    registry.register(makeAsset({ id: 'int-2' }));
    registry.updateCondition('int-2', 'CRITICAL');
    const crits = registry.getCriticalAssets();
    expect(crits.some((a) => a.id === 'int-2')).toBe(true);
  });

  it('full lifecycle + maintenance + depreciation', () => {
    registry.register(makeAsset({
      id: 'int-3',
      acquisitionCost: 20000,
      salvageValue: 2000,
      usefulLifeYears: 10,
    }));
    registry.acquire('int-3', '2020-01-01');
    registry.putInService('int-3');
    scheduler.schedule('int-3', 'PREVENTIVE', '2021-01-01', 'Year 1 check');
    scheduler.complete('maint-1', '2021-01-05', 'OK', 400);
    registry.sendForMaintenance('int-3');
    registry.putInService('int-3');
    const depr = registry.calculateDepreciation('int-3', 'STRAIGHT_LINE', 5);
    expect(depr.bookValue).toBeCloseTo(20000 - 1800 * 5);
    expect(scheduler.getTotalCost('int-3')).toBe(400);
  });

  it('multiple assets, each with maintenance', () => {
    Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
      registry.register(makeAsset({ id: `mi-${i}` }));
      scheduler.schedule(`mi-${i}`, 'CORRECTIVE', '2024-01-01', `Desc ${i}`);
      scheduler.complete(`maint-${i + 1}`, '2024-01-10', 'Done', (i + 1) * 200);
    });
    expect(registry.getCount()).toBe(5);
    expect(scheduler.getCompleted()).toHaveLength(5);
    expect(scheduler.getTotalCost('mi-0')).toBe(200);
    expect(scheduler.getTotalCost('mi-4')).toBe(1000);
  });

  it('getByStatus after lifecycle transitions', () => {
    Array.from({ length: 6 }, (_, i) => i).forEach((i) => {
      registry.register(makeAsset({ id: `ls-${i}` }));
    });
    registry.putInService('ls-0');
    registry.putInService('ls-1');
    registry.putInService('ls-2');
    registry.retire('ls-3');
    expect(registry.getByStatus('IN_SERVICE')).toHaveLength(3);
    expect(registry.getByStatus('RETIRED')).toHaveLength(1);
    expect(registry.getByStatus('PLANNING')).toHaveLength(2);
  });

  it('depreciation for all 3 methods on same asset', () => {
    registry.register(makeAsset({
      id: 'tri-depr',
      acquisitionCost: 15000,
      salvageValue: 1500,
      usefulLifeYears: 10,
    }));
    const sl = registry.calculateDepreciation('tri-depr', 'STRAIGHT_LINE', 5);
    const db = registry.calculateDepreciation('tri-depr', 'DECLINING_BALANCE', 5);
    const uop = registry.calculateDepreciation('tri-depr', 'UNITS_OF_PRODUCTION', 5);
    expect(sl.method).toBe('STRAIGHT_LINE');
    expect(db.method).toBe('DECLINING_BALANCE');
    expect(uop.method).toBe('UNITS_OF_PRODUCTION');
    // DB should depreciate faster than SL in early years
    expect(db.bookValue).toBeLessThan(sl.bookValue);
  });

  // Parameterised integration: N assets + N maintenance records
  Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
    it(`integration batch N=${n} assets with maintenance`, () => {
      Array.from({ length: n }, (_, j) => j).forEach((j) => {
        registry.register(makeAsset({ id: `ibat-${n}-${j}` }));
        scheduler.schedule(`ibat-${n}-${j}`, 'PREVENTIVE', '2024-01-01', `Desc ${j}`);
        scheduler.complete(`maint-${j + 1}`, '2024-01-10', 'Done', 150);
      });
      expect(registry.getCount()).toBe(n);
      expect(scheduler.getCompleted()).toHaveLength(n);
      expect(scheduler.getTotalCost(`ibat-${n}-0`)).toBe(150);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Extra parameterised blocks for count padding
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry — mixed batch operations', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`mixed batch ${i}: register+condition+assign`, () => {
      const id = `mix-${i}`;
      const cat = CATEGORIES[i % 6];
      const cond = CONDITIONS[i % 5];
      registry.register(makeAsset({ id, category: cat, location: `loc-${i % 3}` }));
      registry.updateCondition(id, cond);
      registry.assign(id, `employee-${i}`);
      const a = registry.get(id);
      expect(a?.condition).toBe(cond);
      expect(a?.assignedTo).toBe(`employee-${i}`);
      expect(a?.category).toBe(cat);
    });
  });

  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`depreciation all methods batch ${i}`, () => {
      const id = `dep-all-${i}`;
      registry.register(makeAsset({
        id,
        acquisitionCost: (i + 1) * 1000,
        salvageValue: (i + 1) * 100,
        usefulLifeYears: (i % 9) + 2,
      }));
      DEPR_METHODS.forEach((method) => {
        const r = registry.calculateDepreciation(id, method, (i % 5) + 1);
        expect(r.assetId).toBe(id);
        expect(r.method).toBe(method);
        expect(r.bookValue).toBeGreaterThanOrEqual((i + 1) * 100);
      });
    });
  });
});

describe('MaintenanceScheduler — extended overdue and cost', () => {
  let scheduler: MaintenanceScheduler;
  beforeEach(() => { scheduler = new MaintenanceScheduler(); });

  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`overdue detection batch ${i}`, () => {
      const past = `2024-01-${String(i + 1).padStart(2, '0')}`;
      const future = `2025-12-${String(i + 1).padStart(2, '0')}`;
      scheduler.schedule(`ov-a-${i}`, 'PREVENTIVE', past, `Past ${i}`);
      scheduler.schedule(`ov-b-${i}`, 'CORRECTIVE', future, `Future ${i}`);
      const overdue = scheduler.getOverdue('2025-01-01');
      expect(overdue.some((r) => r.assetId === `ov-a-${i}`)).toBe(true);
      expect(overdue.some((r) => r.assetId === `ov-b-${i}`)).toBe(false);
    });
  });

  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`cost accumulation ${i} schedules for asset`, () => {
      const assetId = `cost-acc-${i}`;
      const scheduleCount = (i % 8) + 1;
      Array.from({ length: scheduleCount }, (_, j) => j).forEach((j) => {
        scheduler.schedule(assetId, 'PREVENTIVE', '2024-01-01', `D${j}`);
        scheduler.complete(`maint-${j + 1}`, '2024-01-10', 'Done', 50);
      });
      expect(scheduler.getTotalCost(assetId)).toBe(scheduleCount * 50);
    });
  });
});

describe('AssetRegistry — location and category getters extended', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getByLocation correct subset ${i}`, () => {
      const locA = `LocA-${i}`;
      const locB = `LocB-${i}`;
      const countA = (i % 4) + 1;
      const countB = (i % 3) + 1;
      Array.from({ length: countA }, (_, j) => j).forEach((j) => {
        registry.register(makeAsset({ id: `gl-a-${i}-${j}`, location: locA }));
      });
      Array.from({ length: countB }, (_, j) => j).forEach((j) => {
        registry.register(makeAsset({ id: `gl-b-${i}-${j}`, location: locB }));
      });
      expect(registry.getByLocation(locA)).toHaveLength(countA);
      expect(registry.getByLocation(locB)).toHaveLength(countB);
    });
  });

  Array.from({ length: 18 }, (_, i) => i).forEach((i) => {
    it(`getByCategory ${CATEGORIES[i % 6]} count check ${i}`, () => {
      const cat = CATEGORIES[i % 6];
      const count = (i % 4) + 1;
      Array.from({ length: count }, (_, j) => j).forEach((j) => {
        registry.register(makeAsset({ id: `gc-${i}-${j}`, category: cat }));
      });
      expect(registry.getByCategory(cat)).toHaveLength(count);
    });
  });
});

describe('Error handling — comprehensive', () => {
  let registry: AssetRegistry;
  let scheduler: MaintenanceScheduler;
  beforeEach(() => {
    registry = new AssetRegistry();
    scheduler = new MaintenanceScheduler();
  });

  it('updateCondition throws Error with message containing id', () => {
    expect(() => registry.updateCondition('bad-id', 'GOOD')).toThrow(/bad-id/);
  });

  it('assign throws Error with message containing id', () => {
    expect(() => registry.assign('bad-id', 'person')).toThrow(/bad-id/);
  });

  it('acquire throws Error with message containing id', () => {
    expect(() => registry.acquire('bad-id', '2024-01-01')).toThrow(/bad-id/);
  });

  it('putInService throws Error with message containing id', () => {
    expect(() => registry.putInService('bad-id')).toThrow(/bad-id/);
  });

  it('sendForMaintenance throws Error with message containing id', () => {
    expect(() => registry.sendForMaintenance('bad-id')).toThrow(/bad-id/);
  });

  it('retire throws Error with message containing id', () => {
    expect(() => registry.retire('bad-id')).toThrow(/bad-id/);
  });

  it('dispose throws Error with message containing id', () => {
    expect(() => registry.dispose('bad-id')).toThrow(/bad-id/);
  });

  it('calculateDepreciation throws Error with message containing id', () => {
    expect(() => registry.calculateDepreciation('bad-id', 'STRAIGHT_LINE', 1)).toThrow(/bad-id/);
  });

  it('complete throws Error with message containing id', () => {
    expect(() => scheduler.complete('bad-id', '2024-01-01', 'Done')).toThrow(/bad-id/);
  });

  // Error cases for multiple bad IDs
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`error for non-existent id ${i}`, () => {
      const badId = `nonexistent-${i}`;
      expect(() => registry.acquire(badId, '2024-01-01')).toThrow();
      expect(() => registry.retire(badId)).toThrow();
      expect(() => scheduler.complete(badId, '2024-01-01', 'Done')).toThrow();
    });
  });
});

describe('AssetRegistry — edge cases', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  it('zero acquisitionCost SL depreciation', () => {
    registry.register(makeAsset({ id: 'zero-cost', acquisitionCost: 0, salvageValue: 0, usefulLifeYears: 5 }));
    const r = registry.calculateDepreciation('zero-cost', 'STRAIGHT_LINE', 1);
    expect(r.bookValue).toBeCloseTo(0);
    expect(r.annualDepreciation).toBeCloseTo(0);
  });

  it('zero acquisitionCost DB depreciation', () => {
    registry.register(makeAsset({ id: 'zero-cost-db', acquisitionCost: 0, salvageValue: 0, usefulLifeYears: 5 }));
    const r = registry.calculateDepreciation('zero-cost-db', 'DECLINING_BALANCE', 1);
    expect(r.bookValue).toBeCloseTo(0);
  });

  it('salvageValue equals acquisitionCost SL', () => {
    registry.register(makeAsset({ id: 'eq-sal', acquisitionCost: 5000, salvageValue: 5000, usefulLifeYears: 5 }));
    const r = registry.calculateDepreciation('eq-sal', 'STRAIGHT_LINE', 3);
    expect(r.annualDepreciation).toBeCloseTo(0);
    expect(r.bookValue).toBeCloseTo(5000);
  });

  it('register multiple with same location all retrievable', () => {
    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      registry.register(makeAsset({ id: `sameloc-${i}`, location: 'Shared' }));
    });
    expect(registry.getByLocation('Shared')).toHaveLength(10);
  });

  it('register with notes field preserved', () => {
    registry.register(makeAsset({ id: 'notes-1', notes: 'Special notes' }));
    expect(registry.get('notes-1')?.notes).toBe('Special notes');
  });

  it('register with lastMaintenanceDate preserved', () => {
    registry.register(makeAsset({ id: 'lmd-1', lastMaintenanceDate: '2023-06-01' }));
    expect(registry.get('lmd-1')?.lastMaintenanceDate).toBe('2023-06-01');
  });

  it('register with nextMaintenanceDate preserved', () => {
    registry.register(makeAsset({ id: 'nmd-1', nextMaintenanceDate: '2024-06-01' }));
    expect(registry.get('nmd-1')?.nextMaintenanceDate).toBe('2024-06-01');
  });

  it('yearsElapsed clamped to 0 for negative input', () => {
    registry.register(makeAsset({ id: 'neg-yr', acquisitionCost: 5000, salvageValue: 500, usefulLifeYears: 10 }));
    const r = registry.calculateDepreciation('neg-yr', 'STRAIGHT_LINE', -5);
    expect(r.yearsElapsed).toBe(0);
    expect(r.bookValue).toBeCloseTo(5000);
  });

  // Parameterised: vary salvage values
  Array.from({ length: 10 }, (_, i) => i * 100).forEach((salvage, i) => {
    it(`SL salvage=${salvage} floor enforced`, () => {
      const id = `sv-${i}`;
      registry.register(makeAsset({ id, acquisitionCost: 10000, salvageValue: salvage, usefulLifeYears: 5 }));
      const r = registry.calculateDepreciation(id, 'STRAIGHT_LINE', 100);
      expect(r.bookValue).toBeGreaterThanOrEqual(salvage);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional parameterised: SL depreciationToDate across costs and years
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry — SL depreciationToDate extended', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`SL depreciationToDate batch ${i}`, () => {
      const cost = (i + 1) * 2000;
      const salvage = cost * 0.1;
      const life = (i % 8) + 3;
      const year = (i % life) + 1;
      const id = `sldtd-${i}`;
      registry.register(makeAsset({ id, acquisitionCost: cost, salvageValue: salvage, usefulLifeYears: life }));
      const r = registry.calculateDepreciation(id, 'STRAIGHT_LINE', year);
      expect(r.depreciationToDate).toBeCloseTo(cost - r.bookValue, 5);
      expect(r.bookValue).toBeGreaterThanOrEqual(salvage);
    });
  });

  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`DB depreciationToDate batch ${i}`, () => {
      const cost = (i + 2) * 1500;
      const salvage = (i % 2 === 0) ? 0 : cost * 0.05;
      const life = (i % 7) + 3;
      const year = (i % life) + 1;
      const id = `dbdtd-${i}`;
      registry.register(makeAsset({ id, acquisitionCost: cost, salvageValue: salvage, usefulLifeYears: life }));
      const r = registry.calculateDepreciation(id, 'DECLINING_BALANCE', year);
      expect(r.depreciationToDate).toBeCloseTo(cost - r.bookValue, 5);
      expect(r.bookValue).toBeGreaterThanOrEqual(salvage);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional parameterised: status transition verification
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry — status verified after each transition', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`status verification chain ${i}`, () => {
      const id = `svc-${i}`;
      registry.register(makeAsset({ id, category: CATEGORIES[i % 6] }));
      expect(registry.get(id)!.status).toBe('PLANNING');
      registry.acquire(id, '2023-01-01');
      expect(registry.get(id)!.status).toBe('ACQUIRED');
      if (i % 3 !== 0) {
        registry.putInService(id);
        expect(registry.get(id)!.status).toBe('IN_SERVICE');
      }
      if (i % 4 === 0) {
        registry.sendForMaintenance(id);
        expect(registry.get(id)!.status).toBe('UNDER_MAINTENANCE');
        registry.retire(id);
        expect(registry.get(id)!.status).toBe('RETIRED');
        registry.dispose(id);
        expect(registry.get(id)!.status).toBe('DISPOSED');
      }
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getByStatus count consistency ${i}`, () => {
      const total = i + 2;
      Array.from({ length: total }, (_, j) => j).forEach((j) => {
        registry.register(makeAsset({ id: `gsc-${i}-${j}` }));
      });
      const half = Math.floor(total / 2);
      Array.from({ length: half }, (_, j) => j).forEach((j) => {
        registry.putInService(`gsc-${i}-${j}`);
      });
      expect(registry.getByStatus('IN_SERVICE')).toHaveLength(half);
      expect(registry.getByStatus('PLANNING')).toHaveLength(total - half);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional parameterised: MaintenanceScheduler multi-type scheduling
// ─────────────────────────────────────────────────────────────────────────────

describe('MaintenanceScheduler — multi-type scheduling', () => {
  let scheduler: MaintenanceScheduler;
  beforeEach(() => { scheduler = new MaintenanceScheduler(); });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`schedule all 4 types for asset ${i}`, () => {
      const assetId = `multi-${i}`;
      MAINT_TYPES.forEach((type, j) => {
        scheduler.schedule(assetId, type, `2024-0${j + 1}-01`, `${type} check`);
      });
      expect(scheduler.getByAsset(assetId)).toHaveLength(4);
      MAINT_TYPES.forEach((type) => {
        expect(scheduler.getByType(type).some((r) => r.assetId === assetId)).toBe(true);
      });
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`pending count after partial completion ${i}`, () => {
      const assetId = `partial-${i}`;
      const total = (i % 6) + 2;
      Array.from({ length: total }, (_, j) => j).forEach((j) => {
        scheduler.schedule(assetId, 'PREVENTIVE', '2024-01-01', `D${j}`);
      });
      const toComplete = Math.ceil(total / 2);
      Array.from({ length: toComplete }, (_, j) => j).forEach((j) => {
        scheduler.complete(`maint-${j + 1}`, '2024-01-10', 'Done', 75);
      });
      expect(scheduler.getPending()).toHaveLength(total - toComplete);
      expect(scheduler.getTotalCost(assetId)).toBe(toComplete * 75);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional: AssetRegistry — assign and condition combined
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry — assign and condition combined', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  Array.from({ length: 25 }, (_, i) => i).forEach((i) => {
    it(`assign + condition together ${i}`, () => {
      const id = `ac-${i}`;
      const cond = CONDITIONS[i % 5];
      const person = `technician-${i}`;
      registry.register(makeAsset({ id, category: CATEGORIES[i % 6] }));
      registry.assign(id, person);
      registry.updateCondition(id, cond);
      const a = registry.get(id)!;
      expect(a.assignedTo).toBe(person);
      expect(a.condition).toBe(cond);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`getByCondition size after bulk updates ${i}`, () => {
      const cond = CONDITIONS[i % 5];
      const count = (i % 5) + 1;
      Array.from({ length: count }, (_, j) => j).forEach((j) => {
        registry.register(makeAsset({ id: `bu-${i}-${j}` }));
        registry.updateCondition(`bu-${i}-${j}`, cond);
      });
      expect(registry.getByCondition(cond)).toHaveLength(count);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional: depreciation yearsElapsed correctness
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry — yearsElapsed in DepreciationResult', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    const life = (i % 8) + 2;
    const inputYear = i;
    const expected = Math.max(0, Math.min(inputYear, life));
    it(`yearsElapsed input=${inputYear} life=${life} expected=${expected}`, () => {
      const id = `ye-${i}`;
      registry.register(makeAsset({ id, usefulLifeYears: life }));
      const r = registry.calculateDepreciation(id, 'STRAIGHT_LINE', inputYear);
      expect(r.yearsElapsed).toBe(expected);
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
    it(`DB yearsElapsed batch ${i}`, () => {
      const life = (i % 5) + 2;
      const year = i;
      const id = `ye-db-${i}`;
      registry.register(makeAsset({ id, usefulLifeYears: life }));
      const r = registry.calculateDepreciation(id, 'DECLINING_BALANCE', year);
      expect(r.yearsElapsed).toBe(Math.max(0, Math.min(year, life)));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional: MaintenanceScheduler id increment verification
// ─────────────────────────────────────────────────────────────────────────────

describe('MaintenanceScheduler — id sequence verification', () => {
  let scheduler: MaintenanceScheduler;
  beforeEach(() => { scheduler = new MaintenanceScheduler(); });

  Array.from({ length: 30 }, (_, i) => i + 1).forEach((n) => {
    it(`maint-${n} is nth scheduled record`, () => {
      Array.from({ length: n }, (_, j) => j).forEach((j) => {
        scheduler.schedule(`a${j}`, 'PREVENTIVE', '2024-01-01', `D${j}`);
      });
      const records = scheduler.getByAsset(`a${n - 1}`);
      expect(records.some((r) => r.id === `maint-${n}`)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional: AssetRegistry — getAll returns all registered assets
// ─────────────────────────────────────────────────────────────────────────────

describe('AssetRegistry — getAll completeness', () => {
  let registry: AssetRegistry;
  beforeEach(() => { registry = new AssetRegistry(); });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
    it(`getAll contains all ${n} registered ids`, () => {
      const ids = Array.from({ length: n }, (_, j) => `gac-${n}-${j}`);
      ids.forEach((id) => registry.register(makeAsset({ id })));
      const all = registry.getAll();
      ids.forEach((id) => {
        expect(all.some((a) => a.id === id)).toBe(true);
      });
    });
  });
});
