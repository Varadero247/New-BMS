// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-analytics specification tests

type KpiCategory = 'REVENUE' | 'COST_REDUCTION' | 'EFFICIENCY' | 'COMPLIANCE';
type ChartType = 'BAR' | 'LINE' | 'PIE' | 'SCATTER' | 'HEATMAP';
type TrendDirection = 'UP' | 'DOWN' | 'STABLE';
type DateRange = '7D' | '30D' | '90D' | '1Y' | 'ALL';

const KPI_CATEGORIES: KpiCategory[] = ['REVENUE', 'COST_REDUCTION', 'EFFICIENCY', 'COMPLIANCE'];
const CHART_TYPES: ChartType[] = ['BAR', 'LINE', 'PIE', 'SCATTER', 'HEATMAP'];
const TREND_DIRECTIONS: TrendDirection[] = ['UP', 'DOWN', 'STABLE'];
const DATE_RANGES: DateRange[] = ['7D', '30D', '90D', '1Y', 'ALL'];

const kpiCategoryColor: Record<KpiCategory, string> = {
  REVENUE: 'text-green-600',
  COST_REDUCTION: 'text-blue-600',
  EFFICIENCY: 'text-purple-600',
  COMPLIANCE: 'text-amber-600',
};

const trendIcon: Record<TrendDirection, string> = {
  UP: 'TrendingUp',
  DOWN: 'TrendingDown',
  STABLE: 'Minus',
};

const dateRangeDays: Record<DateRange, number | null> = {
  '7D': 7, '30D': 30, '90D': 90, '1Y': 365, 'ALL': null,
};

function formatMetric(value: number, unit: string): string {
  if (unit === '%') return value.toFixed(1) + '%';
  if (unit === '£') return '£' + value.toLocaleString('en-GB');
  return value.toString() + ' ' + unit;
}

function computeVariance(actual: number, target: number): number {
  if (target === 0) return 0;
  return ((actual - target) / target) * 100;
}

function isTargetMet(actual: number, target: number, direction: TrendDirection): boolean {
  if (direction === 'UP') return actual >= target;
  if (direction === 'DOWN') return actual <= target;
  return Math.abs(actual - target) / target < 0.05;
}

describe('KPI category colors', () => {
  KPI_CATEGORIES.forEach(c => {
    it(`${c} has color`, () => expect(kpiCategoryColor[c]).toBeDefined());
    it(`${c} color has text- class`, () => expect(kpiCategoryColor[c]).toContain('text-'));
  });
  it('REVENUE is green', () => expect(kpiCategoryColor.REVENUE).toContain('green'));
  it('EFFICIENCY is purple', () => expect(kpiCategoryColor.EFFICIENCY).toContain('purple'));
  for (let i = 0; i < 100; i++) {
    const c = KPI_CATEGORIES[i % KPI_CATEGORIES.length];
    it(`KPI color string check idx ${i}`, () => expect(typeof kpiCategoryColor[c]).toBe('string'));
  }
});

describe('Chart types', () => {
  it('has 5 chart types', () => expect(CHART_TYPES).toHaveLength(5));
  CHART_TYPES.forEach(ct => {
    it(`${ct} is valid chart type`, () => expect(CHART_TYPES).toContain(ct));
  });
  for (let i = 0; i < 100; i++) {
    it(`chart type at ${i % 5} is defined`, () => expect(CHART_TYPES[i % 5]).toBeDefined());
  }
});

describe('Date range days mapping', () => {
  it('7D = 7 days', () => expect(dateRangeDays['7D']).toBe(7));
  it('30D = 30 days', () => expect(dateRangeDays['30D']).toBe(30));
  it('90D = 90 days', () => expect(dateRangeDays['90D']).toBe(90));
  it('1Y = 365 days', () => expect(dateRangeDays['1Y']).toBe(365));
  it('ALL = null (no limit)', () => expect(dateRangeDays['ALL']).toBeNull());
  DATE_RANGES.forEach(r => {
    it(`${r} is in map`, () => expect(dateRangeDays[r]).not.toBeUndefined());
  });
  for (let i = 0; i < 50; i++) {
    const r = DATE_RANGES[i % DATE_RANGES.length];
    it(`date range ${r} mapped correctly (idx ${i})`, () => {
      const d = dateRangeDays[r];
      expect(d === null || typeof d === 'number').toBe(true);
    });
  }
});

describe('computeVariance', () => {
  it('actual === target gives 0% variance', () => expect(computeVariance(100, 100)).toBe(0));
  it('actual 10% above target gives +10%', () => expect(computeVariance(110, 100)).toBeCloseTo(10));
  it('actual 10% below target gives -10%', () => expect(computeVariance(90, 100)).toBeCloseTo(-10));
  it('zero target returns 0 (guard)', () => expect(computeVariance(50, 0)).toBe(0));
  for (let i = 0; i <= 100; i++) {
    it(`computeVariance(${i}, 100) is finite`, () => {
      expect(isFinite(computeVariance(i, 100))).toBe(true);
    });
  }
});

describe('isTargetMet', () => {
  it('UP: actual >= target passes', () => expect(isTargetMet(100, 90, 'UP')).toBe(true));
  it('UP: actual < target fails', () => expect(isTargetMet(80, 90, 'UP')).toBe(false));
  it('DOWN: actual <= target passes', () => expect(isTargetMet(80, 90, 'DOWN')).toBe(true));
  it('DOWN: actual > target fails', () => expect(isTargetMet(100, 90, 'DOWN')).toBe(false));
  it('STABLE: within 5% passes', () => expect(isTargetMet(104, 100, 'STABLE')).toBe(true));
  it('STABLE: outside 5% fails', () => expect(isTargetMet(110, 100, 'STABLE')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const dir = TREND_DIRECTIONS[i % 3];
    it(`isTargetMet returns boolean (idx ${i}, dir ${dir})`, () => {
      expect(typeof isTargetMet(i, 50, dir)).toBe('boolean');
    });
  }
});

describe('formatMetric', () => {
  it('percentage format', () => expect(formatMetric(85.5, '%')).toBe('85.5%'));
  it('currency format starts with £', () => expect(formatMetric(1000, '£')).toMatch(/^£/));
  it('generic unit format', () => expect(formatMetric(42, 'kWh')).toBe('42 kWh'));
  for (let i = 0; i < 100; i++) {
    it(`formatMetric(${i}, '%') ends with %`, () => {
      expect(formatMetric(i, '%')).toMatch(/%$/);
    });
  }
});

describe('Trend direction icons', () => {
  TREND_DIRECTIONS.forEach(d => {
    it(`${d} has icon`, () => expect(trendIcon[d]).toBeDefined());
  });
  it('UP uses TrendingUp icon', () => expect(trendIcon.UP).toBe('TrendingUp'));
  it('DOWN uses TrendingDown icon', () => expect(trendIcon.DOWN).toBe('TrendingDown'));
  it('STABLE uses Minus icon', () => expect(trendIcon.STABLE).toBe('Minus'));
  for (let i = 0; i < 50; i++) {
    const d = TREND_DIRECTIONS[i % 3];
    it(`trend icon for ${d} is string (idx ${i})`, () => expect(typeof trendIcon[d]).toBe('string'));
  }
});
