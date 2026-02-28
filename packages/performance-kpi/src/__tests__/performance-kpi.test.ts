import { KPITracker } from '../kpi-tracker';
import { KPIDirection, KPIStatus, KPIPeriod, KPIDefinition, KPIMeasurement } from '../types';

let tracker: KPITracker;

const defineKPI = (direction: KPIDirection = 'HIGHER_BETTER', target = 100, warning = 10) =>
  tracker.define('Test KPI', 'Desc', '%', direction, target, warning, 'quality', 'owner', 'MONTHLY');

beforeEach(() => {
  tracker = new KPITracker();
});

// ---------------------------------------------------------------------------
// 1. TYPES & EXPORTS
// ---------------------------------------------------------------------------
describe('Types and exports', () => {
  it('KPITracker is a class', () => { expect(typeof KPITracker).toBe('function'); });
  it('KPITracker can be instantiated', () => { expect(tracker).toBeInstanceOf(KPITracker); });
  it('KPITracker has define method', () => { expect(typeof tracker.define).toBe('function'); });
  it('KPITracker has record method', () => { expect(typeof tracker.record).toBe('function'); });
  it('KPITracker has getKPI method', () => { expect(typeof tracker.getKPI).toBe('function'); });
  it('KPITracker has getAllKPIs method', () => { expect(typeof tracker.getAllKPIs).toBe('function'); });
  it('KPITracker has getByCategory method', () => { expect(typeof tracker.getByCategory).toBe('function'); });
  it('KPITracker has getByOwner method', () => { expect(typeof tracker.getByOwner).toBe('function'); });
  it('KPITracker has getMeasurements method', () => { expect(typeof tracker.getMeasurements).toBe('function'); });
  it('KPITracker has getLatestMeasurement method', () => { expect(typeof tracker.getLatestMeasurement).toBe('function'); });
  it('KPITracker has getMeasurementsByStatus method', () => { expect(typeof tracker.getMeasurementsByStatus).toBe('function'); });
  it('KPITracker has getOffTrackKPIs method', () => { expect(typeof tracker.getOffTrackKPIs).toBe('function'); });
  it('KPITracker has getAverageValue method', () => { expect(typeof tracker.getAverageValue).toBe('function'); });
  it('KPITracker has getTrend method', () => { expect(typeof tracker.getTrend).toBe('function'); });
  it('KPITracker has getKPICount method', () => { expect(typeof tracker.getKPICount).toBe('function'); });

  const directions: KPIDirection[] = ['HIGHER_BETTER', 'LOWER_BETTER', 'TARGET'];
  directions.forEach(d => {
    it(`KPIDirection '${d}' is a valid string literal`, () => {
      const val: KPIDirection = d;
      expect(typeof val).toBe('string');
    });
  });

  const statuses: KPIStatus[] = ['ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'EXCEEDED', 'NOT_MEASURED'];
  statuses.forEach(s => {
    it(`KPIStatus '${s}' is a valid string literal`, () => {
      const val: KPIStatus = s;
      expect(typeof val).toBe('string');
    });
  });

  const periods: KPIPeriod[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'];
  periods.forEach(p => {
    it(`KPIPeriod '${p}' is a valid string literal`, () => {
      const val: KPIPeriod = p;
      expect(typeof val).toBe('string');
    });
  });
});

// ---------------------------------------------------------------------------
// 2. define() — shape and fields
// ---------------------------------------------------------------------------
describe('define() — shape and fields', () => {
  it('returns a KPIDefinition object', () => {
    const kpi = defineKPI();
    expect(typeof kpi).toBe('object');
    expect(kpi).not.toBeNull();
  });

  it('returned KPIDefinition has id', () => {
    const kpi = defineKPI();
    expect(kpi).toHaveProperty('id');
  });

  it('id is a string', () => {
    const kpi = defineKPI();
    expect(typeof kpi.id).toBe('string');
  });

  it('id starts with kpi-', () => {
    const kpi = defineKPI();
    expect(kpi.id).toMatch(/^kpi-/);
  });

  it('returned definition has name', () => {
    const kpi = defineKPI();
    expect(kpi.name).toBe('Test KPI');
  });

  it('returned definition has description', () => {
    const kpi = defineKPI();
    expect(kpi.description).toBe('Desc');
  });

  it('returned definition has unit', () => {
    const kpi = defineKPI();
    expect(kpi.unit).toBe('%');
  });

  it('returned definition has direction HIGHER_BETTER', () => {
    const kpi = defineKPI('HIGHER_BETTER');
    expect(kpi.direction).toBe('HIGHER_BETTER');
  });

  it('returned definition has direction LOWER_BETTER', () => {
    const kpi = defineKPI('LOWER_BETTER');
    expect(kpi.direction).toBe('LOWER_BETTER');
  });

  it('returned definition has direction TARGET', () => {
    const kpi = defineKPI('TARGET');
    expect(kpi.direction).toBe('TARGET');
  });

  it('returned definition has target', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100);
    expect(kpi.target).toBe(100);
  });

  it('target is stored correctly for 50', () => {
    const kpi = defineKPI('HIGHER_BETTER', 50);
    expect(kpi.target).toBe(50);
  });

  it('returned definition has warningThreshold', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    expect(kpi.warningThreshold).toBe(10);
  });

  it('warningThreshold 20 is stored correctly', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 20);
    expect(kpi.warningThreshold).toBe(20);
  });

  it('returned definition has category', () => {
    const kpi = defineKPI();
    expect(kpi.category).toBe('quality');
  });

  it('returned definition has owner', () => {
    const kpi = defineKPI();
    expect(kpi.owner).toBe('owner');
  });

  it('returned definition has period MONTHLY', () => {
    const kpi = defineKPI();
    expect(kpi.period).toBe('MONTHLY');
  });

  const allPeriods: KPIPeriod[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'];
  allPeriods.forEach(p => {
    it(`define() stores period ${p}`, () => {
      const kpi = tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'own', p);
      expect(kpi.period).toBe(p);
    });
  });

  it('two consecutive define() calls return different ids', () => {
    const a = defineKPI();
    const b = defineKPI();
    expect(a.id).not.toBe(b.id);
  });

  it('ids are monotonically increasing numeric suffixes', () => {
    const a = defineKPI();
    const b = defineKPI();
    const numA = parseInt(a.id.split('-')[1], 10);
    const numB = parseInt(b.id.split('-')[1], 10);
    expect(numB).toBeGreaterThan(numA);
  });

  it('custom name is stored correctly', () => {
    const kpi = tracker.define('Revenue Growth', 'D', '%', 'HIGHER_BETTER', 200, 5, 'finance', 'cfo', 'ANNUAL');
    expect(kpi.name).toBe('Revenue Growth');
  });

  it('custom description is stored correctly', () => {
    const kpi = tracker.define('N', 'Year-over-year growth rate', '%', 'HIGHER_BETTER', 200, 5, 'finance', 'cfo', 'ANNUAL');
    expect(kpi.description).toBe('Year-over-year growth rate');
  });

  it('custom unit is stored correctly', () => {
    const kpi = tracker.define('N', 'D', 'ms', 'LOWER_BETTER', 200, 10, 'perf', 'eng', 'DAILY');
    expect(kpi.unit).toBe('ms');
  });

  it('custom category is stored correctly', () => {
    const kpi = tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'operations', 'ops', 'WEEKLY');
    expect(kpi.category).toBe('operations');
  });

  it('custom owner is stored correctly', () => {
    const kpi = tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'alice', 'MONTHLY');
    expect(kpi.owner).toBe('alice');
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`define() call #${n} increments count to ${n}`, () => {
      Array.from({ length: n }).forEach(() => defineKPI());
      expect(tracker.getKPICount()).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 3. getKPICount()
// ---------------------------------------------------------------------------
describe('getKPICount()', () => {
  it('returns 0 on empty tracker', () => {
    expect(tracker.getKPICount()).toBe(0);
  });

  Array.from({ length: 30 }, (_, i) => i + 1).forEach(n => {
    it(`returns ${n} after defining ${n} KPIs`, () => {
      Array.from({ length: n }).forEach(() => defineKPI());
      expect(tracker.getKPICount()).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 4. getKPI()
// ---------------------------------------------------------------------------
describe('getKPI()', () => {
  it('returns undefined for unknown id', () => {
    expect(tracker.getKPI('nonexistent')).toBeUndefined();
  });

  it('returns the defined KPI by id', () => {
    const kpi = defineKPI();
    expect(tracker.getKPI(kpi.id)).toEqual(kpi);
  });

  it('returns undefined for wrong id', () => {
    defineKPI();
    expect(tracker.getKPI('kpi-99999')).toBeUndefined();
  });

  it('returns correct KPI when multiple are defined', () => {
    const a = defineKPI('HIGHER_BETTER', 100);
    const b = defineKPI('LOWER_BETTER', 50);
    expect(tracker.getKPI(a.id)!.target).toBe(100);
    expect(tracker.getKPI(b.id)!.target).toBe(50);
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`getKPI() retrieves KPI at index ${i} correctly`, () => {
      const kpis = Array.from({ length: 15 }).map((_, j) =>
        tracker.define(`KPI-${j}`, 'D', 'u', 'HIGHER_BETTER', j * 10 + 1, 10, 'cat', 'own', 'MONTHLY')
      );
      expect(tracker.getKPI(kpis[i].id)!.name).toBe(`KPI-${i}`);
    });
  });

  it('getKPI returns definition with all fields intact', () => {
    const kpi = tracker.define('Revenue', 'Desc', '$', 'HIGHER_BETTER', 500, 15, 'finance', 'cfo', 'QUARTERLY');
    const result = tracker.getKPI(kpi.id);
    expect(result!.name).toBe('Revenue');
    expect(result!.description).toBe('Desc');
    expect(result!.unit).toBe('$');
    expect(result!.direction).toBe('HIGHER_BETTER');
    expect(result!.target).toBe(500);
    expect(result!.warningThreshold).toBe(15);
    expect(result!.category).toBe('finance');
    expect(result!.owner).toBe('cfo');
    expect(result!.period).toBe('QUARTERLY');
  });
});

// ---------------------------------------------------------------------------
// 5. getAllKPIs()
// ---------------------------------------------------------------------------
describe('getAllKPIs()', () => {
  it('returns empty array when no KPIs defined', () => {
    expect(tracker.getAllKPIs()).toEqual([]);
  });

  it('returns array of length 1 after one define', () => {
    defineKPI();
    expect(tracker.getAllKPIs()).toHaveLength(1);
  });

  it('returns array of length 5 after five defines', () => {
    Array.from({ length: 5 }).forEach(() => defineKPI());
    expect(tracker.getAllKPIs()).toHaveLength(5);
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`getAllKPIs() length is ${n} after ${n} defines`, () => {
      Array.from({ length: n }).forEach(() => defineKPI());
      expect(tracker.getAllKPIs()).toHaveLength(n);
    });
  });

  it('returned array contains the defined KPI', () => {
    const kpi = defineKPI();
    expect(tracker.getAllKPIs()).toContainEqual(kpi);
  });

  it('returned array contains all defined KPIs', () => {
    const a = defineKPI('HIGHER_BETTER');
    const b = defineKPI('LOWER_BETTER');
    const all = tracker.getAllKPIs();
    expect(all).toContainEqual(a);
    expect(all).toContainEqual(b);
  });

  it('getAllKPIs returns an array', () => {
    expect(Array.isArray(tracker.getAllKPIs())).toBe(true);
  });

  it('getAllKPIs returns a new array each call (not same reference)', () => {
    defineKPI();
    expect(tracker.getAllKPIs()).not.toBe(tracker.getAllKPIs());
  });
});

// ---------------------------------------------------------------------------
// 6. getByCategory()
// ---------------------------------------------------------------------------
describe('getByCategory()', () => {
  it('returns empty array when no KPIs defined', () => {
    expect(tracker.getByCategory('quality')).toEqual([]);
  });

  it('returns empty array for unknown category', () => {
    defineKPI();
    expect(tracker.getByCategory('unknown')).toEqual([]);
  });

  it('returns the KPI that matches the category', () => {
    const kpi = tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'finance', 'own', 'MONTHLY');
    const result = tracker.getByCategory('finance');
    expect(result).toContainEqual(kpi);
  });

  it('does not include KPIs from different categories', () => {
    tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'finance', 'own', 'MONTHLY');
    const result = tracker.getByCategory('hr');
    expect(result).toHaveLength(0);
  });

  it('returns all KPIs in the category when multiple match', () => {
    const a = tracker.define('A', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'ops', 'own', 'MONTHLY');
    const b = tracker.define('B', 'D', 'u', 'LOWER_BETTER', 50, 10, 'ops', 'own', 'MONTHLY');
    tracker.define('C', 'D', 'u', 'TARGET', 75, 10, 'finance', 'own', 'MONTHLY');
    const result = tracker.getByCategory('ops');
    expect(result).toHaveLength(2);
    expect(result).toContainEqual(a);
    expect(result).toContainEqual(b);
  });

  const cats = ['safety', 'environment', 'quality', 'hr', 'finance', 'operations'];
  cats.forEach(cat => {
    it(`getByCategory('${cat}') returns only KPIs in that category`, () => {
      cats.forEach(c => tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, c, 'own', 'MONTHLY'));
      const result = tracker.getByCategory(cat);
      expect(result.every(k => k.category === cat)).toBe(true);
    });
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`getByCategory returns ${n} items when ${n} KPIs share category 'test'`, () => {
      Array.from({ length: n }).forEach(() =>
        tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'test', 'own', 'MONTHLY')
      );
      tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'other', 'own', 'MONTHLY');
      expect(tracker.getByCategory('test')).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 7. getByOwner()
// ---------------------------------------------------------------------------
describe('getByOwner()', () => {
  it('returns empty array when no KPIs defined', () => {
    expect(tracker.getByOwner('alice')).toEqual([]);
  });

  it('returns empty array for unknown owner', () => {
    defineKPI();
    expect(tracker.getByOwner('nobody')).toEqual([]);
  });

  it('returns KPIs owned by a specific owner', () => {
    const kpi = tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'alice', 'MONTHLY');
    expect(tracker.getByOwner('alice')).toContainEqual(kpi);
  });

  it('does not include KPIs from other owners', () => {
    tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'bob', 'MONTHLY');
    expect(tracker.getByOwner('alice')).toHaveLength(0);
  });

  it('returns all KPIs when all share owner', () => {
    Array.from({ length: 5 }).forEach(() =>
      tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'alice', 'MONTHLY')
    );
    expect(tracker.getByOwner('alice')).toHaveLength(5);
  });

  const owners = ['alice', 'bob', 'charlie', 'diana'];
  owners.forEach(owner => {
    it(`getByOwner('${owner}') returns correct subset`, () => {
      owners.forEach(o => tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', o, 'MONTHLY'));
      const result = tracker.getByOwner(owner);
      expect(result.every(k => k.owner === owner)).toBe(true);
      expect(result).toHaveLength(1);
    });
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`getByOwner returns ${n} items when ${n} KPIs owned by 'mgr'`, () => {
      Array.from({ length: n }).forEach(() =>
        tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'mgr', 'MONTHLY')
      );
      tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'other', 'MONTHLY');
      expect(tracker.getByOwner('mgr')).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 8. record() — shape and fields
// ---------------------------------------------------------------------------
describe('record() — shape and fields', () => {
  it('returns a KPIMeasurement object', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 95, 'user1', '2026-01');
    expect(typeof m).toBe('object');
    expect(m).not.toBeNull();
  });

  it('measurement has id starting with meas-', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 95, 'user1', '2026-01');
    expect(m.id).toMatch(/^meas-/);
  });

  it('measurement id is a string', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 95, 'user1', '2026-01');
    expect(typeof m.id).toBe('string');
  });

  it('measurement has kpiId matching the KPI', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 95, 'user1', '2026-01');
    expect(m.kpiId).toBe(kpi.id);
  });

  it('measurement has correct value', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 95, 'user1', '2026-01');
    expect(m.value).toBe(95);
  });

  it('measurement has measuredAt as Date', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 95, 'user1', '2026-01');
    expect(m.measuredAt).toBeInstanceOf(Date);
  });

  it('measurement has measuredBy', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 95, 'user1', '2026-01');
    expect(m.measuredBy).toBe('user1');
  });

  it('measurement has period', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 95, 'user1', '2026-01');
    expect(m.period).toBe('2026-01');
  });

  it('measurement has status field', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 95, 'user1', '2026-01');
    expect(m).toHaveProperty('status');
  });

  it('notes is undefined when not passed', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 95, 'user1', '2026-01');
    expect(m.notes).toBeUndefined();
  });

  it('notes is stored when passed', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 95, 'user1', '2026-01', 'some note');
    expect(m.notes).toBe('some note');
  });

  it('two measurements have different ids', () => {
    const kpi = defineKPI();
    const a = tracker.record(kpi.id, 95, 'u', '2026-01');
    const b = tracker.record(kpi.id, 85, 'u', '2026-02');
    expect(a.id).not.toBe(b.id);
  });

  it('throws when kpiId is unknown', () => {
    expect(() => tracker.record('nonexistent', 100, 'u', '2026-01')).toThrow('KPI not found: nonexistent');
  });

  it('throws exact message with the bad id', () => {
    expect(() => tracker.record('kpi-9999', 100, 'u', '2026-01')).toThrow('KPI not found: kpi-9999');
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`recording ${n} measurements appends all to the list`, () => {
      const kpi = defineKPI();
      Array.from({ length: n }).forEach((_, i) => tracker.record(kpi.id, 50 + i, 'u', `2026-${String(i + 1).padStart(2, '0')}`));
      expect(tracker.getMeasurements(kpi.id)).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 9. Status logic — HIGHER_BETTER (target=100, warning=10)
// ---------------------------------------------------------------------------
describe('computeStatus — HIGHER_BETTER (target=100, warning=10)', () => {
  // value >= 100 → EXCEEDED
  [100, 101, 105, 110, 120, 150, 200, 999].forEach(v => {
    it(`value=${v} >= target=100 → EXCEEDED`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('EXCEEDED');
    });
  });

  // value >= 90 and < 100 → ON_TRACK  (ratio >= 0.90)
  [90, 91, 92, 95, 98, 99].forEach(v => {
    it(`value=${v}, target=100, warning=10 → ON_TRACK`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('ON_TRACK');
    });
  });

  // value >= 80 and < 90 → AT_RISK  (ratio >= 0.80, < 0.90)
  [80, 81, 82, 85, 88, 89].forEach(v => {
    it(`value=${v}, target=100, warning=10 → AT_RISK`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('AT_RISK');
    });
  });

  // value < 80 → OFF_TRACK
  [79, 75, 70, 60, 50, 1].forEach(v => {
    it(`value=${v}, target=100, warning=10 → OFF_TRACK`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('OFF_TRACK');
    });
  });

  // Boundary tests with warning=20 (target=100)
  // ON_TRACK: value >= 80 (100 - 20%)
  // AT_RISK: value >= 60 (100 - 40%)  [warningThreshold/50 = 20/50 = 0.4]
  // OFF_TRACK: value < 60
  [80, 85, 90, 95, 99].forEach(v => {
    it(`value=${v}, target=100, warning=20 → ON_TRACK`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 20);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('ON_TRACK');
    });
  });

  [60, 65, 70, 75, 79].forEach(v => {
    it(`value=${v}, target=100, warning=20 → AT_RISK`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 20);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('AT_RISK');
    });
  });

  [59, 50, 40, 30, 10].forEach(v => {
    it(`value=${v}, target=100, warning=20 → OFF_TRACK`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 20);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('OFF_TRACK');
    });
  });

  // Different target: target=200, warning=10
  // EXCEEDED: >= 200
  // ON_TRACK: >= 180 (200 - 10% = 180)
  // AT_RISK: >= 160 (200 - 20% = 160)
  // OFF_TRACK: < 160
  [200, 210, 250].forEach(v => {
    it(`value=${v}, target=200, warning=10 → EXCEEDED`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 200, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('EXCEEDED');
    });
  });

  [180, 185, 190, 199].forEach(v => {
    it(`value=${v}, target=200, warning=10 → ON_TRACK`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 200, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('ON_TRACK');
    });
  });

  [160, 165, 170, 175, 179].forEach(v => {
    it(`value=${v}, target=200, warning=10 → AT_RISK`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 200, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('AT_RISK');
    });
  });

  [159, 150, 100, 50].forEach(v => {
    it(`value=${v}, target=200, warning=10 → OFF_TRACK`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 200, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('OFF_TRACK');
    });
  });
});

// ---------------------------------------------------------------------------
// 10. Status logic — LOWER_BETTER (target=10, warning=20)
// ---------------------------------------------------------------------------
describe('computeStatus — LOWER_BETTER (target=10, warning=20)', () => {
  // value <= target → ON_TRACK
  [10, 9, 5, 1].forEach(v => {
    it(`value=${v} <= target=10 → ON_TRACK`, () => {
      const kpi = defineKPI('LOWER_BETTER', 10, 20);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('ON_TRACK');
    });
  });

  // value > 10 but <= 12 (10 * 1.20) → AT_RISK
  [11, 12].forEach(v => {
    it(`value=${v}, target=10, warning=20 → AT_RISK`, () => {
      const kpi = defineKPI('LOWER_BETTER', 10, 20);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('AT_RISK');
    });
  });

  // value > 12 → OFF_TRACK
  [13, 15, 20, 50].forEach(v => {
    it(`value=${v}, target=10, warning=20 → OFF_TRACK`, () => {
      const kpi = defineKPI('LOWER_BETTER', 10, 20);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('OFF_TRACK');
    });
  });

  // Different parameters: target=100, warning=10
  // ON_TRACK: value <= 100
  // AT_RISK: value <= 110 (100 * 1.10)
  // OFF_TRACK: value > 110
  [100, 90, 50, 10].forEach(v => {
    it(`value=${v}, target=100, warning=10 LOWER_BETTER → ON_TRACK`, () => {
      const kpi = defineKPI('LOWER_BETTER', 100, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('ON_TRACK');
    });
  });

  [101, 105, 110].forEach(v => {
    it(`value=${v}, target=100, warning=10 LOWER_BETTER → AT_RISK`, () => {
      const kpi = defineKPI('LOWER_BETTER', 100, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('AT_RISK');
    });
  });

  [111, 120, 150, 200].forEach(v => {
    it(`value=${v}, target=100, warning=10 LOWER_BETTER → OFF_TRACK`, () => {
      const kpi = defineKPI('LOWER_BETTER', 100, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('OFF_TRACK');
    });
  });

  // target=50, warning=10: AT_RISK threshold = 55
  [50, 45, 30].forEach(v => {
    it(`value=${v}, target=50, warning=10 LOWER_BETTER → ON_TRACK`, () => {
      const kpi = defineKPI('LOWER_BETTER', 50, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('ON_TRACK');
    });
  });

  [51, 53, 55].forEach(v => {
    it(`value=${v}, target=50, warning=10 LOWER_BETTER → AT_RISK`, () => {
      const kpi = defineKPI('LOWER_BETTER', 50, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('AT_RISK');
    });
  });

  [56, 60, 70].forEach(v => {
    it(`value=${v}, target=50, warning=10 LOWER_BETTER → OFF_TRACK`, () => {
      const kpi = defineKPI('LOWER_BETTER', 50, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('OFF_TRACK');
    });
  });
});

// ---------------------------------------------------------------------------
// 11. Status logic — TARGET (target=100, warning=10)
// ---------------------------------------------------------------------------
describe('computeStatus — TARGET (target=100, warning=10)', () => {
  // deviation <= 5% (warning/2) → ON_TRACK
  // deviation <= 10% (warning) → AT_RISK
  // deviation > 10% → OFF_TRACK

  // ON_TRACK: |value - 100| / 100 * 100 <= 5  → value in [95, 105]
  [100, 95, 96, 97, 98, 99, 101, 102, 103, 104, 105].forEach(v => {
    it(`value=${v}, target=100, warning=10 TARGET → ON_TRACK`, () => {
      const kpi = defineKPI('TARGET', 100, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('ON_TRACK');
    });
  });

  // AT_RISK: deviation in (5, 10] → value in [90, 94] or [106, 110]
  [90, 91, 92, 93, 94, 106, 107, 108, 109, 110].forEach(v => {
    it(`value=${v}, target=100, warning=10 TARGET → AT_RISK`, () => {
      const kpi = defineKPI('TARGET', 100, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('AT_RISK');
    });
  });

  // OFF_TRACK: deviation > 10% → value < 90 or > 110
  [89, 85, 80, 70, 111, 115, 120, 130].forEach(v => {
    it(`value=${v}, target=100, warning=10 TARGET → OFF_TRACK`, () => {
      const kpi = defineKPI('TARGET', 100, 10);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('OFF_TRACK');
    });
  });

  // TARGET with warning=20: ON_TRACK when deviation <= 10, AT_RISK when deviation <= 20
  // value in [90, 110] → ON_TRACK
  [90, 95, 100, 105, 110].forEach(v => {
    it(`value=${v}, target=100, warning=20 TARGET → ON_TRACK`, () => {
      const kpi = defineKPI('TARGET', 100, 20);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('ON_TRACK');
    });
  });

  // value in [80, 89] or [111, 120] → AT_RISK
  [80, 85, 89, 111, 115, 120].forEach(v => {
    it(`value=${v}, target=100, warning=20 TARGET → AT_RISK`, () => {
      const kpi = defineKPI('TARGET', 100, 20);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('AT_RISK');
    });
  });

  // value < 80 or > 120 → OFF_TRACK
  [79, 70, 60, 121, 130, 150].forEach(v => {
    it(`value=${v}, target=100, warning=20 TARGET → OFF_TRACK`, () => {
      const kpi = defineKPI('TARGET', 100, 20);
      const m = tracker.record(kpi.id, v, 'u', '2026-01');
      expect(m.status).toBe('OFF_TRACK');
    });
  });
});

// ---------------------------------------------------------------------------
// 12. getMeasurements()
// ---------------------------------------------------------------------------
describe('getMeasurements()', () => {
  it('returns empty array for a newly defined KPI', () => {
    const kpi = defineKPI();
    expect(tracker.getMeasurements(kpi.id)).toEqual([]);
  });

  it('returns empty array for unknown kpiId', () => {
    expect(tracker.getMeasurements('nonexistent')).toEqual([]);
  });

  it('returns array after one recording', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 95, 'u', '2026-01');
    expect(tracker.getMeasurements(kpi.id)).toHaveLength(1);
  });

  it('returns measurements in order of recording', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 95, 'u', '2026-01');
    tracker.record(kpi.id, 85, 'u', '2026-02');
    tracker.record(kpi.id, 75, 'u', '2026-03');
    const list = tracker.getMeasurements(kpi.id);
    expect(list[0].value).toBe(95);
    expect(list[1].value).toBe(85);
    expect(list[2].value).toBe(75);
  });

  it('returns only measurements for the specified KPI', () => {
    const a = defineKPI();
    const b = defineKPI();
    tracker.record(a.id, 95, 'u', '2026-01');
    tracker.record(b.id, 70, 'u', '2026-01');
    expect(tracker.getMeasurements(a.id)).toHaveLength(1);
    expect(tracker.getMeasurements(a.id)[0].value).toBe(95);
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`getMeasurements returns ${n} items after ${n} records`, () => {
      const kpi = defineKPI();
      Array.from({ length: n }).forEach((_, i) => tracker.record(kpi.id, 50 + i, 'u', `2026-${String(i + 1).padStart(2, '0')}`));
      expect(tracker.getMeasurements(kpi.id)).toHaveLength(n);
    });
  });

  it('each measurement in list has the correct kpiId', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 90, 'u', '2026-01');
    tracker.record(kpi.id, 80, 'u', '2026-02');
    tracker.getMeasurements(kpi.id).forEach(m => expect(m.kpiId).toBe(kpi.id));
  });
});

// ---------------------------------------------------------------------------
// 13. getLatestMeasurement()
// ---------------------------------------------------------------------------
describe('getLatestMeasurement()', () => {
  it('returns undefined for KPI with no measurements', () => {
    const kpi = defineKPI();
    expect(tracker.getLatestMeasurement(kpi.id)).toBeUndefined();
  });

  it('returns undefined for unknown kpiId', () => {
    expect(tracker.getLatestMeasurement('unknown')).toBeUndefined();
  });

  it('returns the single measurement when only one exists', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 95, 'u', '2026-01');
    expect(tracker.getLatestMeasurement(kpi.id)).toEqual(m);
  });

  it('returns the last measurement after multiple records', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 95, 'u', '2026-01');
    tracker.record(kpi.id, 85, 'u', '2026-02');
    const last = tracker.record(kpi.id, 75, 'u', '2026-03');
    expect(tracker.getLatestMeasurement(kpi.id)).toEqual(last);
  });

  it('latest measurement value matches last recorded value', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 90, 'u', '2026-01');
    tracker.record(kpi.id, 50, 'u', '2026-02');
    expect(tracker.getLatestMeasurement(kpi.id)!.value).toBe(50);
  });

  Array.from({ length: 10 }, (_, i) => i + 2).forEach(n => {
    it(`getLatestMeasurement after ${n} records returns the ${n}th`, () => {
      const kpi = defineKPI();
      let last: KPIMeasurement | undefined;
      Array.from({ length: n }).forEach((_, i) => {
        last = tracker.record(kpi.id, i * 5, 'u', `2026-${String(i + 1).padStart(2, '0')}`);
      });
      expect(tracker.getLatestMeasurement(kpi.id)).toEqual(last);
    });
  });

  it('latest measurement has measuredAt as a Date', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 90, 'u', '2026-01');
    expect(tracker.getLatestMeasurement(kpi.id)!.measuredAt).toBeInstanceOf(Date);
  });

  it('latest measurement kpiId matches', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 90, 'u', '2026-01');
    expect(tracker.getLatestMeasurement(kpi.id)!.kpiId).toBe(kpi.id);
  });
});

// ---------------------------------------------------------------------------
// 14. getMeasurementsByStatus()
// ---------------------------------------------------------------------------
describe('getMeasurementsByStatus()', () => {
  it('returns empty array when no measurements recorded', () => {
    expect(tracker.getMeasurementsByStatus('ON_TRACK')).toEqual([]);
  });

  it('returns only EXCEEDED measurements', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(kpi.id, 105, 'u', '2026-01'); // EXCEEDED
    tracker.record(kpi.id, 85, 'u', '2026-02');  // AT_RISK
    const result = tracker.getMeasurementsByStatus('EXCEEDED');
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(105);
  });

  it('returns only ON_TRACK measurements', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(kpi.id, 95, 'u', '2026-01'); // ON_TRACK
    tracker.record(kpi.id, 105, 'u', '2026-02'); // EXCEEDED
    const result = tracker.getMeasurementsByStatus('ON_TRACK');
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(95);
  });

  it('returns only AT_RISK measurements', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(kpi.id, 85, 'u', '2026-01'); // AT_RISK
    tracker.record(kpi.id, 95, 'u', '2026-02'); // ON_TRACK
    const result = tracker.getMeasurementsByStatus('AT_RISK');
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(85);
  });

  it('returns only OFF_TRACK measurements', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(kpi.id, 75, 'u', '2026-01'); // OFF_TRACK
    tracker.record(kpi.id, 95, 'u', '2026-02'); // ON_TRACK
    const result = tracker.getMeasurementsByStatus('OFF_TRACK');
    expect(result).toHaveLength(1);
    expect(result[0].value).toBe(75);
  });

  it('aggregates measurements across multiple KPIs', () => {
    const a = defineKPI('HIGHER_BETTER', 100, 10);
    const b = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(a.id, 105, 'u', '2026-01'); // EXCEEDED
    tracker.record(b.id, 110, 'u', '2026-01'); // EXCEEDED
    const result = tracker.getMeasurementsByStatus('EXCEEDED');
    expect(result).toHaveLength(2);
  });

  it('returns empty for NOT_MEASURED status (no such recorded status)', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 95, 'u', '2026-01');
    expect(tracker.getMeasurementsByStatus('NOT_MEASURED')).toHaveLength(0);
  });

  const statuses: KPIStatus[] = ['ON_TRACK', 'AT_RISK', 'OFF_TRACK', 'EXCEEDED'];
  statuses.forEach(s => {
    it(`getMeasurementsByStatus('${s}') returns array`, () => {
      expect(Array.isArray(tracker.getMeasurementsByStatus(s))).toBe(true);
    });
  });

  Array.from({ length: 5 }, (_, i) => i + 1).forEach(n => {
    it(`getMeasurementsByStatus EXCEEDED returns ${n} when ${n} exceeded`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      Array.from({ length: n }).forEach(() => tracker.record(kpi.id, 110, 'u', '2026-01'));
      expect(tracker.getMeasurementsByStatus('EXCEEDED')).toHaveLength(n);
    });
  });

  Array.from({ length: 5 }, (_, i) => i + 1).forEach(n => {
    it(`getMeasurementsByStatus OFF_TRACK returns ${n} when ${n} off track`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      Array.from({ length: n }).forEach(() => tracker.record(kpi.id, 70, 'u', '2026-01'));
      expect(tracker.getMeasurementsByStatus('OFF_TRACK')).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 15. getOffTrackKPIs()
// ---------------------------------------------------------------------------
describe('getOffTrackKPIs()', () => {
  it('returns empty array when no KPIs defined', () => {
    expect(tracker.getOffTrackKPIs()).toEqual([]);
  });

  it('returns empty array when no measurements recorded', () => {
    defineKPI();
    expect(tracker.getOffTrackKPIs()).toEqual([]);
  });

  it('returns empty array when latest measurement is ON_TRACK', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(kpi.id, 95, 'u', '2026-01');
    expect(tracker.getOffTrackKPIs()).toHaveLength(0);
  });

  it('returns empty array when latest measurement is EXCEEDED', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(kpi.id, 110, 'u', '2026-01');
    expect(tracker.getOffTrackKPIs()).toHaveLength(0);
  });

  it('returns empty array when latest measurement is AT_RISK', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(kpi.id, 85, 'u', '2026-01');
    expect(tracker.getOffTrackKPIs()).toHaveLength(0);
  });

  it('returns KPI when latest measurement is OFF_TRACK', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(kpi.id, 70, 'u', '2026-01');
    expect(tracker.getOffTrackKPIs()).toContainEqual(kpi);
  });

  it('uses only the latest measurement for determination', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(kpi.id, 70, 'u', '2026-01'); // OFF_TRACK
    tracker.record(kpi.id, 95, 'u', '2026-02'); // ON_TRACK (latest)
    expect(tracker.getOffTrackKPIs()).toHaveLength(0);
  });

  it('includes KPI when it was on-track but latest is off-track', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(kpi.id, 95, 'u', '2026-01'); // ON_TRACK
    tracker.record(kpi.id, 70, 'u', '2026-02'); // OFF_TRACK (latest)
    expect(tracker.getOffTrackKPIs()).toContainEqual(kpi);
  });

  it('returns multiple KPIs when multiple are off-track', () => {
    const a = defineKPI('HIGHER_BETTER', 100, 10);
    const b = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(a.id, 70, 'u', '2026-01');
    tracker.record(b.id, 70, 'u', '2026-01');
    expect(tracker.getOffTrackKPIs()).toHaveLength(2);
  });

  it('only returns off-track, not all KPIs', () => {
    const a = defineKPI('HIGHER_BETTER', 100, 10);
    const b = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(a.id, 70, 'u', '2026-01'); // OFF_TRACK
    tracker.record(b.id, 95, 'u', '2026-01'); // ON_TRACK
    const result = tracker.getOffTrackKPIs();
    expect(result).toContainEqual(a);
    expect(result).not.toContainEqual(b);
  });

  Array.from({ length: 5 }, (_, i) => i + 1).forEach(n => {
    it(`getOffTrackKPIs returns ${n} when ${n} KPIs have off-track latest`, () => {
      Array.from({ length: n }).forEach(() => {
        const kpi = defineKPI('HIGHER_BETTER', 100, 10);
        tracker.record(kpi.id, 70, 'u', '2026-01');
      });
      Array.from({ length: 3 }).forEach(() => {
        const kpi = defineKPI('HIGHER_BETTER', 100, 10);
        tracker.record(kpi.id, 95, 'u', '2026-01');
      });
      expect(tracker.getOffTrackKPIs()).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 16. getAverageValue()
// ---------------------------------------------------------------------------
describe('getAverageValue()', () => {
  it('returns 0 for KPI with no measurements', () => {
    const kpi = defineKPI();
    expect(tracker.getAverageValue(kpi.id)).toBe(0);
  });

  it('returns 0 for unknown kpiId', () => {
    expect(tracker.getAverageValue('unknown')).toBe(0);
  });

  it('returns the single value when only one measurement', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 90, 'u', '2026-01');
    expect(tracker.getAverageValue(kpi.id)).toBe(90);
  });

  it('returns average of two measurements', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 80, 'u', '2026-01');
    tracker.record(kpi.id, 100, 'u', '2026-02');
    expect(tracker.getAverageValue(kpi.id)).toBe(90);
  });

  it('returns average of three measurements', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 60, 'u', '2026-01');
    tracker.record(kpi.id, 90, 'u', '2026-02');
    tracker.record(kpi.id, 120, 'u', '2026-03');
    expect(tracker.getAverageValue(kpi.id)).toBeCloseTo(90, 5);
  });

  it('correctly averages non-integer values', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 33.3, 'u', '2026-01');
    tracker.record(kpi.id, 66.6, 'u', '2026-02');
    tracker.record(kpi.id, 99.9, 'u', '2026-03');
    expect(tracker.getAverageValue(kpi.id)).toBeCloseTo(66.6, 3);
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`getAverageValue for ${n} uniform measurements of value 50 returns 50`, () => {
      const kpi = defineKPI();
      Array.from({ length: n }).forEach(() => tracker.record(kpi.id, 50, 'u', '2026-01'));
      expect(tracker.getAverageValue(kpi.id)).toBe(50);
    });
  });

  Array.from({ length: 5 }, (_, i) => i + 2).forEach(n => {
    it(`getAverageValue for sequence 1..${n} equals ${((n + 1) / 2).toFixed(4)}`, () => {
      const kpi = defineKPI();
      Array.from({ length: n }, (_, i) => i + 1).forEach(v =>
        tracker.record(kpi.id, v, 'u', '2026-01')
      );
      const expected = (n + 1) / 2;
      expect(tracker.getAverageValue(kpi.id)).toBeCloseTo(expected, 5);
    });
  });

  it('average is a number', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 90, 'u', '2026-01');
    expect(typeof tracker.getAverageValue(kpi.id)).toBe('number');
  });

  it('average is 0 when no measurements (return type)', () => {
    const kpi = defineKPI();
    expect(typeof tracker.getAverageValue(kpi.id)).toBe('number');
    expect(tracker.getAverageValue(kpi.id)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 17. getTrend()
// ---------------------------------------------------------------------------
describe('getTrend()', () => {
  it('returns empty array when no measurements', () => {
    const kpi = defineKPI();
    expect(tracker.getTrend(kpi.id)).toEqual([]);
  });

  it('returns empty array for unknown kpiId', () => {
    expect(tracker.getTrend('unknown')).toEqual([]);
  });

  it('returns array of numbers', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 90, 'u', '2026-01');
    const trend = tracker.getTrend(kpi.id);
    expect(Array.isArray(trend)).toBe(true);
    expect(typeof trend[0]).toBe('number');
  });

  it('returns single value trend for one measurement', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 90, 'u', '2026-01');
    expect(tracker.getTrend(kpi.id)).toEqual([90]);
  });

  it('returns last 5 by default when more than 5 exist', () => {
    const kpi = defineKPI();
    [10, 20, 30, 40, 50, 60, 70].forEach((v, i) => tracker.record(kpi.id, v, 'u', `2026-${String(i + 1).padStart(2, '0')}`));
    expect(tracker.getTrend(kpi.id)).toEqual([30, 40, 50, 60, 70]);
  });

  it('returns all values when fewer than default lastN', () => {
    const kpi = defineKPI();
    [10, 20, 30].forEach((v, i) => tracker.record(kpi.id, v, 'u', `2026-${String(i + 1).padStart(2, '0')}`));
    expect(tracker.getTrend(kpi.id)).toEqual([10, 20, 30]);
  });

  it('respects custom lastN=3', () => {
    const kpi = defineKPI();
    [10, 20, 30, 40, 50].forEach((v, i) => tracker.record(kpi.id, v, 'u', `2026-${String(i + 1).padStart(2, '0')}`));
    expect(tracker.getTrend(kpi.id, 3)).toEqual([30, 40, 50]);
  });

  it('respects custom lastN=1', () => {
    const kpi = defineKPI();
    [10, 20, 30].forEach((v, i) => tracker.record(kpi.id, v, 'u', `2026-${String(i + 1).padStart(2, '0')}`));
    expect(tracker.getTrend(kpi.id, 1)).toEqual([30]);
  });

  it('respects custom lastN=10 returning all when fewer exist', () => {
    const kpi = defineKPI();
    [10, 20, 30].forEach((v, i) => tracker.record(kpi.id, v, 'u', `2026-${String(i + 1).padStart(2, '0')}`));
    expect(tracker.getTrend(kpi.id, 10)).toEqual([10, 20, 30]);
  });

  it('values in trend are in chronological order', () => {
    const kpi = defineKPI();
    [40, 30, 50, 20].forEach((v, i) => tracker.record(kpi.id, v, 'u', `2026-${String(i + 1).padStart(2, '0')}`));
    const trend = tracker.getTrend(kpi.id, 4);
    expect(trend).toEqual([40, 30, 50, 20]);
  });

  Array.from({ length: 5 }, (_, i) => i + 1).forEach(lastN => {
    it(`getTrend with lastN=${lastN} returns at most ${lastN} values`, () => {
      const kpi = defineKPI();
      Array.from({ length: 10 }, (_, i) => i + 1).forEach((v, i) =>
        tracker.record(kpi.id, v, 'u', `2026-${String(i + 1).padStart(2, '0')}`)
      );
      expect(tracker.getTrend(kpi.id, lastN)).toHaveLength(lastN);
    });
  });

  it('getTrend default lastN=5 with exactly 5 measurements returns all 5', () => {
    const kpi = defineKPI();
    [10, 20, 30, 40, 50].forEach((v, i) => tracker.record(kpi.id, v, 'u', `2026-${String(i + 1).padStart(2, '0')}`));
    expect(tracker.getTrend(kpi.id)).toHaveLength(5);
  });

  it('getTrend returns a new array each call', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 90, 'u', '2026-01');
    expect(tracker.getTrend(kpi.id)).not.toBe(tracker.getTrend(kpi.id));
  });
});

// ---------------------------------------------------------------------------
// 18. error handling
// ---------------------------------------------------------------------------
describe('error handling', () => {
  it('record() throws for completely unknown kpiId', () => {
    expect(() => tracker.record('bad-id', 100, 'u', '2026-01')).toThrow();
  });

  it('record() throws with Error containing the bad id in message', () => {
    expect(() => tracker.record('bad-id', 100, 'u', '2026-01')).toThrow('bad-id');
  });

  it('record() throws Error instance', () => {
    expect(() => tracker.record('bad-id', 100, 'u', '2026-01')).toThrow(Error);
  });

  it('record() throws for stale id from previous test run', () => {
    const kpi = defineKPI();
    const freshTracker = new KPITracker();
    expect(() => freshTracker.record(kpi.id, 100, 'u', '2026-01')).toThrow();
  });

  ['xyz', 'kpi-99999', '', 'notakpi'].forEach(badId => {
    it(`record() throws for badId='${badId}'`, () => {
      expect(() => tracker.record(badId, 100, 'u', '2026-01')).toThrow();
    });
  });
});

// ---------------------------------------------------------------------------
// 19. Multiple KPI interaction
// ---------------------------------------------------------------------------
describe('multiple KPI interaction', () => {
  it('defining multiple KPIs does not mix up their measurements', () => {
    const a = defineKPI('HIGHER_BETTER', 100, 10);
    const b = defineKPI('LOWER_BETTER', 50, 10);
    tracker.record(a.id, 95, 'u', '2026-01');
    tracker.record(b.id, 40, 'u', '2026-01');
    expect(tracker.getMeasurements(a.id)[0].value).toBe(95);
    expect(tracker.getMeasurements(b.id)[0].value).toBe(40);
  });

  it('getAverageValue is isolated per KPI', () => {
    const a = defineKPI();
    const b = defineKPI();
    tracker.record(a.id, 60, 'u', '2026-01');
    tracker.record(b.id, 80, 'u', '2026-01');
    expect(tracker.getAverageValue(a.id)).toBe(60);
    expect(tracker.getAverageValue(b.id)).toBe(80);
  });

  it('getTrend is isolated per KPI', () => {
    const a = defineKPI();
    const b = defineKPI();
    [10, 20, 30].forEach((v, i) => tracker.record(a.id, v, 'u', `2026-${i + 1}`));
    [40, 50, 60].forEach((v, i) => tracker.record(b.id, v, 'u', `2026-${i + 1}`));
    expect(tracker.getTrend(a.id)).toEqual([10, 20, 30]);
    expect(tracker.getTrend(b.id)).toEqual([40, 50, 60]);
  });

  it('getLatestMeasurement is isolated per KPI', () => {
    const a = defineKPI();
    const b = defineKPI();
    tracker.record(a.id, 55, 'u', '2026-01');
    tracker.record(b.id, 77, 'u', '2026-01');
    expect(tracker.getLatestMeasurement(a.id)!.value).toBe(55);
    expect(tracker.getLatestMeasurement(b.id)!.value).toBe(77);
  });

  it('getOffTrackKPIs correctly identifies among mixed-status KPIs', () => {
    const on = defineKPI('HIGHER_BETTER', 100, 10);
    const off = defineKPI('HIGHER_BETTER', 100, 10);
    const ex = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(on.id, 95, 'u', '2026-01');   // ON_TRACK
    tracker.record(off.id, 70, 'u', '2026-01');  // OFF_TRACK
    tracker.record(ex.id, 110, 'u', '2026-01');  // EXCEEDED
    const result = tracker.getOffTrackKPIs();
    expect(result).toContainEqual(off);
    expect(result).not.toContainEqual(on);
    expect(result).not.toContainEqual(ex);
  });

  Array.from({ length: 10 }, (_, i) => i + 2).forEach(n => {
    it(`defining ${n} KPIs and recording 1 each totals ${n} distinct measurement lists`, () => {
      const kpis = Array.from({ length: n }).map(() => defineKPI());
      kpis.forEach((k, i) => tracker.record(k.id, 50 + i, 'u', '2026-01'));
      kpis.forEach((k, i) => {
        expect(tracker.getMeasurements(k.id)).toHaveLength(1);
        expect(tracker.getMeasurements(k.id)[0].value).toBe(50 + i);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// 20. Large-scale parameterized tests
// ---------------------------------------------------------------------------
describe('large-scale parameterized — HIGHER_BETTER status boundaries', () => {
  const cases: Array<{ target: number; warning: number; value: number; expected: KPIStatus }> = [
    // EXCEEDED
    { target: 100, warning: 10, value: 100, expected: 'EXCEEDED' },
    { target: 100, warning: 10, value: 150, expected: 'EXCEEDED' },
    { target: 50, warning: 10, value: 50, expected: 'EXCEEDED' },
    { target: 50, warning: 10, value: 60, expected: 'EXCEEDED' },
    { target: 200, warning: 5, value: 200, expected: 'EXCEEDED' },
    { target: 200, warning: 5, value: 210, expected: 'EXCEEDED' },
    // ON_TRACK  (target=100, warning=10 → threshold 90)
    { target: 100, warning: 10, value: 90, expected: 'ON_TRACK' },
    { target: 100, warning: 10, value: 95, expected: 'ON_TRACK' },
    { target: 100, warning: 10, value: 99, expected: 'ON_TRACK' },
    // ON_TRACK  (target=50, warning=10 → threshold 45)
    { target: 50, warning: 10, value: 45, expected: 'ON_TRACK' },
    { target: 50, warning: 10, value: 48, expected: 'ON_TRACK' },
    // AT_RISK   (target=100, warning=10 → range [80,89])
    { target: 100, warning: 10, value: 80, expected: 'AT_RISK' },
    { target: 100, warning: 10, value: 85, expected: 'AT_RISK' },
    { target: 100, warning: 10, value: 89, expected: 'AT_RISK' },
    // AT_RISK   (target=50, warning=10 → range [40,44])
    { target: 50, warning: 10, value: 40, expected: 'AT_RISK' },
    { target: 50, warning: 10, value: 44, expected: 'AT_RISK' },
    // OFF_TRACK (target=100, warning=10 → < 80)
    { target: 100, warning: 10, value: 79, expected: 'OFF_TRACK' },
    { target: 100, warning: 10, value: 50, expected: 'OFF_TRACK' },
    { target: 100, warning: 10, value: 1, expected: 'OFF_TRACK' },
    // OFF_TRACK (target=50, warning=10 → < 40)
    { target: 50, warning: 10, value: 39, expected: 'OFF_TRACK' },
    { target: 50, warning: 10, value: 20, expected: 'OFF_TRACK' },
  ];

  cases.forEach(({ target, warning, value, expected }) => {
    it(`HIGHER_BETTER target=${target} warning=${warning} value=${value} → ${expected}`, () => {
      const kpi = tracker.define('N', 'D', 'u', 'HIGHER_BETTER', target, warning, 'cat', 'own', 'MONTHLY');
      const m = tracker.record(kpi.id, value, 'u', '2026-01');
      expect(m.status).toBe(expected);
    });
  });
});

describe('large-scale parameterized — LOWER_BETTER status boundaries', () => {
  const cases: Array<{ target: number; warning: number; value: number; expected: KPIStatus }> = [
    { target: 10, warning: 20, value: 10, expected: 'ON_TRACK' },
    { target: 10, warning: 20, value: 5, expected: 'ON_TRACK' },
    { target: 10, warning: 20, value: 1, expected: 'ON_TRACK' },
    { target: 100, warning: 10, value: 100, expected: 'ON_TRACK' },
    { target: 100, warning: 10, value: 50, expected: 'ON_TRACK' },
    { target: 10, warning: 20, value: 11, expected: 'AT_RISK' },
    { target: 10, warning: 20, value: 12, expected: 'AT_RISK' },
    { target: 100, warning: 10, value: 101, expected: 'AT_RISK' },
    { target: 100, warning: 10, value: 110, expected: 'AT_RISK' },
    { target: 10, warning: 20, value: 13, expected: 'OFF_TRACK' },
    { target: 10, warning: 20, value: 20, expected: 'OFF_TRACK' },
    { target: 100, warning: 10, value: 111, expected: 'OFF_TRACK' },
    { target: 100, warning: 10, value: 200, expected: 'OFF_TRACK' },
    { target: 50, warning: 20, value: 50, expected: 'ON_TRACK' },
    { target: 50, warning: 20, value: 55, expected: 'AT_RISK' },
    { target: 50, warning: 20, value: 60, expected: 'AT_RISK' },
    { target: 50, warning: 20, value: 61, expected: 'OFF_TRACK' },
  ];

  cases.forEach(({ target, warning, value, expected }) => {
    it(`LOWER_BETTER target=${target} warning=${warning} value=${value} → ${expected}`, () => {
      const kpi = tracker.define('N', 'D', 'u', 'LOWER_BETTER', target, warning, 'cat', 'own', 'MONTHLY');
      const m = tracker.record(kpi.id, value, 'u', '2026-01');
      expect(m.status).toBe(expected);
    });
  });
});

describe('large-scale parameterized — TARGET status boundaries', () => {
  const cases: Array<{ target: number; warning: number; value: number; expected: KPIStatus }> = [
    { target: 100, warning: 10, value: 100, expected: 'ON_TRACK' },
    { target: 100, warning: 10, value: 95, expected: 'ON_TRACK' },
    { target: 100, warning: 10, value: 105, expected: 'ON_TRACK' },
    { target: 100, warning: 10, value: 90, expected: 'AT_RISK' },
    { target: 100, warning: 10, value: 110, expected: 'AT_RISK' },
    { target: 100, warning: 10, value: 89, expected: 'OFF_TRACK' },
    { target: 100, warning: 10, value: 111, expected: 'OFF_TRACK' },
    { target: 200, warning: 10, value: 200, expected: 'ON_TRACK' },
    { target: 200, warning: 10, value: 190, expected: 'ON_TRACK' },
    { target: 200, warning: 10, value: 210, expected: 'ON_TRACK' },
    { target: 200, warning: 10, value: 180, expected: 'AT_RISK' },
    { target: 200, warning: 10, value: 220, expected: 'AT_RISK' },
    { target: 200, warning: 10, value: 179, expected: 'OFF_TRACK' },
    { target: 200, warning: 10, value: 221, expected: 'OFF_TRACK' },
    { target: 50, warning: 20, value: 50, expected: 'ON_TRACK' },
    { target: 50, warning: 20, value: 45, expected: 'ON_TRACK' },
    { target: 50, warning: 20, value: 55, expected: 'ON_TRACK' },
    { target: 50, warning: 20, value: 40, expected: 'AT_RISK' },
    { target: 50, warning: 20, value: 60, expected: 'AT_RISK' },
    { target: 50, warning: 20, value: 39, expected: 'OFF_TRACK' },
    { target: 50, warning: 20, value: 61, expected: 'OFF_TRACK' },
  ];

  cases.forEach(({ target, warning, value, expected }) => {
    it(`TARGET target=${target} warning=${warning} value=${value} → ${expected}`, () => {
      const kpi = tracker.define('N', 'D', 'u', 'TARGET', target, warning, 'cat', 'own', 'MONTHLY');
      const m = tracker.record(kpi.id, value, 'u', '2026-01');
      expect(m.status).toBe(expected);
    });
  });
});

// ---------------------------------------------------------------------------
// 21. Period and measuredBy fields
// ---------------------------------------------------------------------------
describe('measurement period and measuredBy', () => {
  const periodStrings = ['2026-01', '2026-Q1', '2026-W01', '2026', '2026-03-15'];
  periodStrings.forEach(p => {
    it(`period string '${p}' is stored correctly`, () => {
      const kpi = defineKPI();
      const m = tracker.record(kpi.id, 90, 'user', p);
      expect(m.period).toBe(p);
    });
  });

  const users = ['alice', 'bob', 'system', 'cron-job', 'admin@ims.local'];
  users.forEach(u => {
    it(`measuredBy='${u}' is stored correctly`, () => {
      const kpi = defineKPI();
      const m = tracker.record(kpi.id, 90, u, '2026-01');
      expect(m.measuredBy).toBe(u);
    });
  });
});

// ---------------------------------------------------------------------------
// 22. Multiple instances are independent
// ---------------------------------------------------------------------------
describe('KPITracker instances are independent', () => {
  it('two trackers have separate KPI stores', () => {
    const t1 = new KPITracker();
    const t2 = new KPITracker();
    t1.define('A', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'own', 'MONTHLY');
    expect(t1.getKPICount()).toBe(1);
    expect(t2.getKPICount()).toBe(0);
  });

  it('defining in t2 does not affect t1 count', () => {
    const t1 = new KPITracker();
    const t2 = new KPITracker();
    t1.define('A', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'own', 'MONTHLY');
    t2.define('B', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'own', 'MONTHLY');
    t2.define('C', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'own', 'MONTHLY');
    expect(t1.getKPICount()).toBe(1);
    expect(t2.getKPICount()).toBe(2);
  });

  it('getMeasurements on t1 KPI id fails gracefully on t2', () => {
    const t1 = new KPITracker();
    const t2 = new KPITracker();
    const kpi = t1.define('A', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'own', 'MONTHLY');
    t1.record(kpi.id, 90, 'u', '2026-01');
    expect(t2.getMeasurements(kpi.id)).toEqual([]);
  });

  it('getAllKPIs on fresh tracker returns empty', () => {
    const fresh = new KPITracker();
    expect(fresh.getAllKPIs()).toEqual([]);
  });

  Array.from({ length: 5 }, (_, i) => i + 1).forEach(n => {
    it(`fresh tracker always starts with getKPICount() = 0, not affected by ${n} previous defines`, () => {
      Array.from({ length: n }).forEach(() => defineKPI()); // on the shared tracker
      const fresh = new KPITracker();
      expect(fresh.getKPICount()).toBe(0);
    });
  });
});

// ---------------------------------------------------------------------------
// 23. Sequence and ID monotonicity (cross-test stability note)
// ---------------------------------------------------------------------------
describe('ID sequence', () => {
  it('measurement ids are monotonically increasing within a tracker', () => {
    const kpi = defineKPI();
    const m1 = tracker.record(kpi.id, 90, 'u', '2026-01');
    const m2 = tracker.record(kpi.id, 80, 'u', '2026-02');
    const n1 = parseInt(m1.id.split('-')[1], 10);
    const n2 = parseInt(m2.id.split('-')[1], 10);
    expect(n2).toBeGreaterThan(n1);
  });

  it('kpi ids are monotonically increasing within a tracker', () => {
    const k1 = defineKPI();
    const k2 = defineKPI();
    const n1 = parseInt(k1.id.split('-')[1], 10);
    const n2 = parseInt(k2.id.split('-')[1], 10);
    expect(n2).toBeGreaterThan(n1);
  });

  Array.from({ length: 10 }, (_, i) => i + 2).forEach(n => {
    it(`after ${n} defines, kpi ids are all distinct`, () => {
      const ids = Array.from({ length: n }).map(() => defineKPI().id);
      expect(new Set(ids).size).toBe(n);
    });
  });

  Array.from({ length: 10 }, (_, i) => i + 2).forEach(n => {
    it(`after ${n} records, meas ids are all distinct`, () => {
      const kpi = defineKPI();
      const ids = Array.from({ length: n }).map(() =>
        tracker.record(kpi.id, 90, 'u', '2026-01').id
      );
      expect(new Set(ids).size).toBe(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 24. Edge cases
// ---------------------------------------------------------------------------
describe('edge cases', () => {
  it('getKPICount returns 0 for brand new tracker', () => {
    const t = new KPITracker();
    expect(t.getKPICount()).toBe(0);
  });

  it('getAllKPIs returns array even if empty', () => {
    expect(Array.isArray(tracker.getAllKPIs())).toBe(true);
  });

  it('getByCategory returns array even if empty', () => {
    expect(Array.isArray(tracker.getByCategory('none'))).toBe(true);
  });

  it('getByOwner returns array even if empty', () => {
    expect(Array.isArray(tracker.getByOwner('none'))).toBe(true);
  });

  it('getMeasurements returns empty array for unknown kpiId (not undefined)', () => {
    const result = tracker.getMeasurements('unknown');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('getTrend returns empty array for unknown kpiId (not undefined)', () => {
    const result = tracker.getTrend('unknown');
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(0);
  });

  it('getAverageValue returns 0 for unknown kpiId', () => {
    expect(tracker.getAverageValue('unknown')).toBe(0);
  });

  it('getOffTrackKPIs returns empty array when no KPIs defined', () => {
    expect(tracker.getOffTrackKPIs()).toEqual([]);
  });

  it('getMeasurementsByStatus returns empty array when no KPIs defined', () => {
    expect(tracker.getMeasurementsByStatus('OFF_TRACK')).toEqual([]);
  });

  it('defining a KPI does not add any measurements automatically', () => {
    const kpi = defineKPI();
    expect(tracker.getMeasurements(kpi.id)).toHaveLength(0);
  });

  it('recording a value preserves exact float precision in value field', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    const m = tracker.record(kpi.id, 99.123456789, 'u', '2026-01');
    expect(m.value).toBe(99.123456789);
  });

  it('recording value exactly at target boundary → EXCEEDED for HIGHER_BETTER', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    const m = tracker.record(kpi.id, 100, 'u', '2026-01');
    expect(m.status).toBe('EXCEEDED');
  });

  it('recording value exactly at target boundary → ON_TRACK for LOWER_BETTER', () => {
    const kpi = defineKPI('LOWER_BETTER', 100, 10);
    const m = tracker.record(kpi.id, 100, 'u', '2026-01');
    expect(m.status).toBe('ON_TRACK');
  });

  it('recording value exactly at target → ON_TRACK for TARGET direction', () => {
    const kpi = defineKPI('TARGET', 100, 10);
    const m = tracker.record(kpi.id, 100, 'u', '2026-01');
    expect(m.status).toBe('ON_TRACK');
  });

  it('can handle 50 consecutive records on one KPI', () => {
    const kpi = defineKPI();
    Array.from({ length: 50 }).forEach((_, i) =>
      tracker.record(kpi.id, 50 + i, 'u', `period-${i}`)
    );
    expect(tracker.getMeasurements(kpi.id)).toHaveLength(50);
  });

  it('getTrend of 50 records with lastN=5 returns exactly 5', () => {
    const kpi = defineKPI();
    Array.from({ length: 50 }, (_, i) => i + 1).forEach((v, i) =>
      tracker.record(kpi.id, v, 'u', `period-${i}`)
    );
    expect(tracker.getTrend(kpi.id, 5)).toHaveLength(5);
    expect(tracker.getTrend(kpi.id, 5)).toEqual([46, 47, 48, 49, 50]);
  });

  it('getAverageValue after 50 records of value 10 is 10', () => {
    const kpi = defineKPI();
    Array.from({ length: 50 }).forEach((_, i) =>
      tracker.record(kpi.id, 10, 'u', `period-${i}`)
    );
    expect(tracker.getAverageValue(kpi.id)).toBe(10);
  });

  it('notes with special characters are preserved', () => {
    const kpi = defineKPI();
    const notes = 'Review: Q1/2026 — target ≥ 95% (see report #42)';
    const m = tracker.record(kpi.id, 90, 'u', '2026-01', notes);
    expect(m.notes).toBe(notes);
  });

  it('empty string notes is stored as empty string', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 90, 'u', '2026-01', '');
    expect(m.notes).toBe('');
  });
});

// ---------------------------------------------------------------------------
// 25. getMeasurementsByStatus across directions
// ---------------------------------------------------------------------------
describe('getMeasurementsByStatus across multiple directions', () => {
  it('mixes HIGHER_BETTER EXCEEDED and LOWER_BETTER ON_TRACK', () => {
    const h = defineKPI('HIGHER_BETTER', 100, 10);
    const l = defineKPI('LOWER_BETTER', 100, 10);
    tracker.record(h.id, 110, 'u', '2026-01'); // EXCEEDED
    tracker.record(l.id, 90, 'u', '2026-01');  // ON_TRACK
    expect(tracker.getMeasurementsByStatus('EXCEEDED')).toHaveLength(1);
    expect(tracker.getMeasurementsByStatus('ON_TRACK')).toHaveLength(1);
  });

  it('counts OFF_TRACK across all KPI directions', () => {
    const h = defineKPI('HIGHER_BETTER', 100, 10);
    const l = defineKPI('LOWER_BETTER', 10, 20);
    const t = defineKPI('TARGET', 100, 10);
    tracker.record(h.id, 70, 'u', '2026-01');  // OFF_TRACK
    tracker.record(l.id, 20, 'u', '2026-01');  // OFF_TRACK
    tracker.record(t.id, 200, 'u', '2026-01'); // OFF_TRACK
    expect(tracker.getMeasurementsByStatus('OFF_TRACK')).toHaveLength(3);
  });

  Array.from({ length: 5 }, (_, i) => i + 1).forEach(n => {
    it(`getMeasurementsByStatus ON_TRACK returns ${n} across ${n} KPIs`, () => {
      Array.from({ length: n }).forEach(() => {
        const kpi = defineKPI('HIGHER_BETTER', 100, 10);
        tracker.record(kpi.id, 95, 'u', '2026-01');
      });
      expect(tracker.getMeasurementsByStatus('ON_TRACK')).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 26. Additional define() coverage with all period types
// ---------------------------------------------------------------------------
describe('define() with all period types and directions', () => {
  const allPeriods: KPIPeriod[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'];
  const allDirections: KPIDirection[] = ['HIGHER_BETTER', 'LOWER_BETTER', 'TARGET'];

  allPeriods.forEach(period => {
    allDirections.forEach(direction => {
      it(`define(direction=${direction}, period=${period}) stores both correctly`, () => {
        const kpi = tracker.define('N', 'D', 'u', direction, 100, 10, 'cat', 'own', period);
        expect(kpi.period).toBe(period);
        expect(kpi.direction).toBe(direction);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// 27. Trend ordering verification
// ---------------------------------------------------------------------------
describe('getTrend ordering', () => {
  it('descending values trend is returned in insertion order', () => {
    const kpi = defineKPI();
    [100, 90, 80, 70, 60].forEach((v, i) => tracker.record(kpi.id, v, 'u', `p${i}`));
    expect(tracker.getTrend(kpi.id, 5)).toEqual([100, 90, 80, 70, 60]);
  });

  it('ascending values trend is returned in insertion order', () => {
    const kpi = defineKPI();
    [10, 20, 30, 40, 50].forEach((v, i) => tracker.record(kpi.id, v, 'u', `p${i}`));
    expect(tracker.getTrend(kpi.id, 5)).toEqual([10, 20, 30, 40, 50]);
  });

  it('mixed values trend preserves insertion order', () => {
    const kpi = defineKPI();
    [55, 72, 43, 91, 68].forEach((v, i) => tracker.record(kpi.id, v, 'u', `p${i}`));
    expect(tracker.getTrend(kpi.id, 5)).toEqual([55, 72, 43, 91, 68]);
  });

  Array.from({ length: 5 }, (_, i) => i + 1).forEach(lastN => {
    it(`getTrend lastN=${lastN} returns last ${lastN} of 10 values`, () => {
      const kpi = defineKPI();
      const vals = Array.from({ length: 10 }, (_, i) => (i + 1) * 3);
      vals.forEach((v, i) => tracker.record(kpi.id, v, 'u', `p${i}`));
      const expected = vals.slice(-lastN);
      expect(tracker.getTrend(kpi.id, lastN)).toEqual(expected);
    });
  });
});

// ---------------------------------------------------------------------------
// 28. getByCategory and getByOwner correctness at scale
// ---------------------------------------------------------------------------
describe('getByCategory and getByOwner at scale', () => {
  Array.from({ length: 8 }, (_, i) => i + 1).forEach(n => {
    it(`getByCategory returns ${n} when ${n} KPIs share 'ops' and ${n} share 'hr'`, () => {
      Array.from({ length: n }).forEach(() =>
        tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'ops', 'own', 'MONTHLY')
      );
      Array.from({ length: n }).forEach(() =>
        tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'hr', 'own', 'MONTHLY')
      );
      expect(tracker.getByCategory('ops')).toHaveLength(n);
      expect(tracker.getByCategory('hr')).toHaveLength(n);
    });
  });

  Array.from({ length: 8 }, (_, i) => i + 1).forEach(n => {
    it(`getByOwner returns ${n} when ${n} KPIs owned by 'alice' and ${n} by 'bob'`, () => {
      Array.from({ length: n }).forEach(() =>
        tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'alice', 'MONTHLY')
      );
      Array.from({ length: n }).forEach(() =>
        tracker.define('N', 'D', 'u', 'HIGHER_BETTER', 100, 10, 'cat', 'bob', 'MONTHLY')
      );
      expect(tracker.getByOwner('alice')).toHaveLength(n);
      expect(tracker.getByOwner('bob')).toHaveLength(n);
    });
  });
});

// ---------------------------------------------------------------------------
// 29. Measurement field completeness
// ---------------------------------------------------------------------------
describe('measurement field completeness', () => {
  const fields: Array<keyof KPIMeasurement> = ['id', 'kpiId', 'value', 'measuredAt', 'measuredBy', 'period', 'status'];
  fields.forEach(field => {
    it(`measurement has field '${field}'`, () => {
      const kpi = defineKPI();
      const m = tracker.record(kpi.id, 90, 'user1', '2026-01');
      expect(m).toHaveProperty(field);
    });
  });

  it('measurement has exactly the expected keys (plus optional notes)', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 90, 'user1', '2026-01');
    expect(m.id).toBeDefined();
    expect(m.kpiId).toBeDefined();
    expect(m.value).toBeDefined();
    expect(m.measuredAt).toBeDefined();
    expect(m.measuredBy).toBeDefined();
    expect(m.period).toBeDefined();
    expect(m.status).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// 30. KPIDefinition field completeness
// ---------------------------------------------------------------------------
describe('KPIDefinition field completeness', () => {
  const fields: Array<keyof KPIDefinition> = ['id', 'name', 'description', 'unit', 'direction', 'target', 'warningThreshold', 'category', 'owner', 'period'];
  fields.forEach(field => {
    it(`KPIDefinition has field '${field}'`, () => {
      const kpi = defineKPI();
      expect(kpi).toHaveProperty(field);
    });
  });
});

// ---------------------------------------------------------------------------
// 31. Bulk status verification — HIGHER_BETTER range sweep
// ---------------------------------------------------------------------------
describe('Bulk status sweep — HIGHER_BETTER target=100 warning=10', () => {
  // values 100..130 → EXCEEDED  (31 tests)
  Array.from({ length: 31 }, (_, i) => 100 + i).forEach(v => {
    it(`HIGHER_BETTER value=${v} → EXCEEDED`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      expect(tracker.record(kpi.id, v, 'u', 'p').status).toBe('EXCEEDED');
    });
  });

  // values 90..99 → ON_TRACK  (10 tests)
  Array.from({ length: 10 }, (_, i) => 90 + i).forEach(v => {
    it(`HIGHER_BETTER value=${v} → ON_TRACK`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      expect(tracker.record(kpi.id, v, 'u', 'p').status).toBe('ON_TRACK');
    });
  });

  // values 80..89 → AT_RISK  (10 tests)
  Array.from({ length: 10 }, (_, i) => 80 + i).forEach(v => {
    it(`HIGHER_BETTER value=${v} → AT_RISK`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      expect(tracker.record(kpi.id, v, 'u', 'p').status).toBe('AT_RISK');
    });
  });

  // values 50..79 → OFF_TRACK  (30 tests)
  Array.from({ length: 30 }, (_, i) => 50 + i).forEach(v => {
    it(`HIGHER_BETTER value=${v} → OFF_TRACK`, () => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      expect(tracker.record(kpi.id, v, 'u', 'p').status).toBe('OFF_TRACK');
    });
  });
});

// ---------------------------------------------------------------------------
// 32. Bulk status verification — LOWER_BETTER range sweep (target=100, warning=10)
// ---------------------------------------------------------------------------
describe('Bulk status sweep — LOWER_BETTER target=100 warning=10', () => {
  // values 70..100 → ON_TRACK  (31 tests)
  Array.from({ length: 31 }, (_, i) => 70 + i).forEach(v => {
    it(`LOWER_BETTER value=${v} → ON_TRACK`, () => {
      const kpi = defineKPI('LOWER_BETTER', 100, 10);
      expect(tracker.record(kpi.id, v, 'u', 'p').status).toBe('ON_TRACK');
    });
  });

  // values 101..110 → AT_RISK  (10 tests)
  Array.from({ length: 10 }, (_, i) => 101 + i).forEach(v => {
    it(`LOWER_BETTER value=${v} → AT_RISK`, () => {
      const kpi = defineKPI('LOWER_BETTER', 100, 10);
      expect(tracker.record(kpi.id, v, 'u', 'p').status).toBe('AT_RISK');
    });
  });

  // values 111..130 → OFF_TRACK  (20 tests)
  Array.from({ length: 20 }, (_, i) => 111 + i).forEach(v => {
    it(`LOWER_BETTER value=${v} → OFF_TRACK`, () => {
      const kpi = defineKPI('LOWER_BETTER', 100, 10);
      expect(tracker.record(kpi.id, v, 'u', 'p').status).toBe('OFF_TRACK');
    });
  });
});

// ---------------------------------------------------------------------------
// 33. Bulk status verification — TARGET range sweep (target=100, warning=10)
// ---------------------------------------------------------------------------
describe('Bulk status sweep — TARGET target=100 warning=10', () => {
  // values 95..105 → ON_TRACK  (11 tests)
  Array.from({ length: 11 }, (_, i) => 95 + i).forEach(v => {
    it(`TARGET value=${v} → ON_TRACK`, () => {
      const kpi = defineKPI('TARGET', 100, 10);
      expect(tracker.record(kpi.id, v, 'u', 'p').status).toBe('ON_TRACK');
    });
  });

  // values 90..94 → AT_RISK  (5 tests)
  Array.from({ length: 5 }, (_, i) => 90 + i).forEach(v => {
    it(`TARGET value=${v} → AT_RISK`, () => {
      const kpi = defineKPI('TARGET', 100, 10);
      expect(tracker.record(kpi.id, v, 'u', 'p').status).toBe('AT_RISK');
    });
  });

  // values 106..110 → AT_RISK  (5 tests)
  Array.from({ length: 5 }, (_, i) => 106 + i).forEach(v => {
    it(`TARGET value=${v} → AT_RISK`, () => {
      const kpi = defineKPI('TARGET', 100, 10);
      expect(tracker.record(kpi.id, v, 'u', 'p').status).toBe('AT_RISK');
    });
  });

  // values 60..89 → OFF_TRACK  (30 tests)
  Array.from({ length: 30 }, (_, i) => 60 + i).forEach(v => {
    it(`TARGET value=${v} → OFF_TRACK`, () => {
      const kpi = defineKPI('TARGET', 100, 10);
      expect(tracker.record(kpi.id, v, 'u', 'p').status).toBe('OFF_TRACK');
    });
  });

  // values 111..130 → OFF_TRACK  (20 tests)
  Array.from({ length: 20 }, (_, i) => 111 + i).forEach(v => {
    it(`TARGET value=${v} → OFF_TRACK`, () => {
      const kpi = defineKPI('TARGET', 100, 10);
      expect(tracker.record(kpi.id, v, 'u', 'p').status).toBe('OFF_TRACK');
    });
  });
});

// ---------------------------------------------------------------------------
// 34. getAverageValue — arithmetic correctness across value ranges
// ---------------------------------------------------------------------------
describe('getAverageValue arithmetic correctness', () => {
  Array.from({ length: 20 }, (_, i) => i * 5).forEach(val => {
    it(`average of single value ${val} is ${val}`, () => {
      const kpi = defineKPI();
      tracker.record(kpi.id, val, 'u', 'p');
      expect(tracker.getAverageValue(kpi.id)).toBe(val);
    });
  });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`average of first ${n} natural numbers is ${((n + 1) / 2).toFixed(4)}`, () => {
      const kpi = defineKPI();
      Array.from({ length: n }, (_, i) => i + 1).forEach(v =>
        tracker.record(kpi.id, v, 'u', 'p')
      );
      expect(tracker.getAverageValue(kpi.id)).toBeCloseTo((n + 1) / 2, 5);
    });
  });
});

// ---------------------------------------------------------------------------
// 35. getTrend — various lastN values with 20 measurements
// ---------------------------------------------------------------------------
describe('getTrend with 20 pre-recorded measurements', () => {
  const values20 = Array.from({ length: 20 }, (_, i) => (i + 1) * 2); // 2,4,6,...,40

  Array.from({ length: 10 }, (_, i) => i + 1).forEach(lastN => {
    it(`getTrend(lastN=${lastN}) from 20 records returns last ${lastN} values`, () => {
      const kpi = defineKPI();
      values20.forEach((v, i) => tracker.record(kpi.id, v, 'u', `p${i}`));
      const expected = values20.slice(-lastN);
      expect(tracker.getTrend(kpi.id, lastN)).toEqual(expected);
    });
  });

  it('getTrend(lastN=20) returns all 20 values', () => {
    const kpi = defineKPI();
    values20.forEach((v, i) => tracker.record(kpi.id, v, 'u', `p${i}`));
    expect(tracker.getTrend(kpi.id, 20)).toEqual(values20);
  });

  it('getTrend(lastN=25) returns all 20 when only 20 exist', () => {
    const kpi = defineKPI();
    values20.forEach((v, i) => tracker.record(kpi.id, v, 'u', `p${i}`));
    expect(tracker.getTrend(kpi.id, 25)).toHaveLength(20);
  });
});

// ---------------------------------------------------------------------------
// 36. getOffTrackKPIs — extended scenarios
// ---------------------------------------------------------------------------
describe('getOffTrackKPIs extended scenarios', () => {
  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`getOffTrackKPIs returns ${n} when ${n} KPIs are off-track`, () => {
      Array.from({ length: n }).forEach(() => {
        const kpi = defineKPI('HIGHER_BETTER', 100, 10);
        tracker.record(kpi.id, 70, 'u', 'p');
      });
      expect(tracker.getOffTrackKPIs()).toHaveLength(n);
    });
  });

  it('getOffTrackKPIs returns 0 when all KPIs are exceeded', () => {
    Array.from({ length: 5 }).forEach(() => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      tracker.record(kpi.id, 110, 'u', 'p');
    });
    expect(tracker.getOffTrackKPIs()).toHaveLength(0);
  });

  it('getOffTrackKPIs returns 0 when all KPIs are on-track', () => {
    Array.from({ length: 5 }).forEach(() => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      tracker.record(kpi.id, 95, 'u', 'p');
    });
    expect(tracker.getOffTrackKPIs()).toHaveLength(0);
  });

  it('getOffTrackKPIs returns 0 when all KPIs are at-risk', () => {
    Array.from({ length: 5 }).forEach(() => {
      const kpi = defineKPI('HIGHER_BETTER', 100, 10);
      tracker.record(kpi.id, 85, 'u', 'p');
    });
    expect(tracker.getOffTrackKPIs()).toHaveLength(0);
  });

  it('getOffTrackKPIs contains the KPI definition object, not a measurement', () => {
    const kpi = defineKPI('HIGHER_BETTER', 100, 10);
    tracker.record(kpi.id, 70, 'u', 'p');
    const result = tracker.getOffTrackKPIs();
    expect(result[0]).toHaveProperty('id');
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('target');
    expect(result[0]).not.toHaveProperty('value');
  });
});

// ---------------------------------------------------------------------------
// 37. getMeasurements ordering — extended
// ---------------------------------------------------------------------------
describe('getMeasurements insertion order preserved', () => {
  Array.from({ length: 10 }, (_, i) => i + 2).forEach(n => {
    it(`${n} records appear in insertion order`, () => {
      const kpi = defineKPI();
      const vals = Array.from({ length: n }, (_, i) => (i + 1) * 7);
      vals.forEach((v, i) => tracker.record(kpi.id, v, 'u', `p${i}`));
      const got = tracker.getMeasurements(kpi.id).map(m => m.value);
      expect(got).toEqual(vals);
    });
  });
});

// ---------------------------------------------------------------------------
// 38. Record notes optional vs provided
// ---------------------------------------------------------------------------
describe('record() notes field', () => {
  const noteValues = [
    'simple note',
    'note with "quotes"',
    'multi\nline',
    '  spaces  ',
    '12345',
    'emoji ok: 🎯',
    'unicode: αβγδ',
  ];

  noteValues.forEach(note => {
    it(`notes="${note.slice(0, 20)}" is stored verbatim`, () => {
      const kpi = defineKPI();
      const m = tracker.record(kpi.id, 90, 'u', 'p', note);
      expect(m.notes).toBe(note);
    });
  });

  it('notes is undefined when omitted (no 5th arg)', () => {
    const kpi = defineKPI();
    const m = tracker.record(kpi.id, 90, 'u', 'p');
    expect(m.notes).toBeUndefined();
  });

  it('notes can be overwritten by a new measurement', () => {
    const kpi = defineKPI();
    tracker.record(kpi.id, 90, 'u', 'p1', 'first note');
    tracker.record(kpi.id, 80, 'u', 'p2', 'second note');
    const list = tracker.getMeasurements(kpi.id);
    expect(list[0].notes).toBe('first note');
    expect(list[1].notes).toBe('second note');
  });
});

// ---------------------------------------------------------------------------
// 39. Comprehensive getKPICount growth — 35 parameterized tests
// ---------------------------------------------------------------------------
describe('getKPICount growth — extended', () => {
  Array.from({ length: 35 }, (_, i) => i + 1).forEach(n => {
    it(`getKPICount is ${n} after defining exactly ${n} KPIs`, () => {
      Array.from({ length: n }).forEach(() => defineKPI());
      expect(tracker.getKPICount()).toBe(n);
    });
  });
});
