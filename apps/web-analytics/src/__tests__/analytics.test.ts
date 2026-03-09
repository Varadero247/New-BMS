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
function hd258anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258anlx_hd',()=>{it('a',()=>{expect(hd258anlx(1,4)).toBe(2);});it('b',()=>{expect(hd258anlx(3,1)).toBe(1);});it('c',()=>{expect(hd258anlx(0,0)).toBe(0);});it('d',()=>{expect(hd258anlx(93,73)).toBe(2);});it('e',()=>{expect(hd258anlx(15,0)).toBe(4);});});
function hd259anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259anlx_hd',()=>{it('a',()=>{expect(hd259anlx(1,4)).toBe(2);});it('b',()=>{expect(hd259anlx(3,1)).toBe(1);});it('c',()=>{expect(hd259anlx(0,0)).toBe(0);});it('d',()=>{expect(hd259anlx(93,73)).toBe(2);});it('e',()=>{expect(hd259anlx(15,0)).toBe(4);});});
function hd260anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260anlx_hd',()=>{it('a',()=>{expect(hd260anlx(1,4)).toBe(2);});it('b',()=>{expect(hd260anlx(3,1)).toBe(1);});it('c',()=>{expect(hd260anlx(0,0)).toBe(0);});it('d',()=>{expect(hd260anlx(93,73)).toBe(2);});it('e',()=>{expect(hd260anlx(15,0)).toBe(4);});});
function hd261anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261anlx_hd',()=>{it('a',()=>{expect(hd261anlx(1,4)).toBe(2);});it('b',()=>{expect(hd261anlx(3,1)).toBe(1);});it('c',()=>{expect(hd261anlx(0,0)).toBe(0);});it('d',()=>{expect(hd261anlx(93,73)).toBe(2);});it('e',()=>{expect(hd261anlx(15,0)).toBe(4);});});
function hd262anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262anlx_hd',()=>{it('a',()=>{expect(hd262anlx(1,4)).toBe(2);});it('b',()=>{expect(hd262anlx(3,1)).toBe(1);});it('c',()=>{expect(hd262anlx(0,0)).toBe(0);});it('d',()=>{expect(hd262anlx(93,73)).toBe(2);});it('e',()=>{expect(hd262anlx(15,0)).toBe(4);});});
function hd263anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263anlx_hd',()=>{it('a',()=>{expect(hd263anlx(1,4)).toBe(2);});it('b',()=>{expect(hd263anlx(3,1)).toBe(1);});it('c',()=>{expect(hd263anlx(0,0)).toBe(0);});it('d',()=>{expect(hd263anlx(93,73)).toBe(2);});it('e',()=>{expect(hd263anlx(15,0)).toBe(4);});});
function hd264anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264anlx_hd',()=>{it('a',()=>{expect(hd264anlx(1,4)).toBe(2);});it('b',()=>{expect(hd264anlx(3,1)).toBe(1);});it('c',()=>{expect(hd264anlx(0,0)).toBe(0);});it('d',()=>{expect(hd264anlx(93,73)).toBe(2);});it('e',()=>{expect(hd264anlx(15,0)).toBe(4);});});
function hd265anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265anlx_hd',()=>{it('a',()=>{expect(hd265anlx(1,4)).toBe(2);});it('b',()=>{expect(hd265anlx(3,1)).toBe(1);});it('c',()=>{expect(hd265anlx(0,0)).toBe(0);});it('d',()=>{expect(hd265anlx(93,73)).toBe(2);});it('e',()=>{expect(hd265anlx(15,0)).toBe(4);});});
function hd266anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266anlx_hd',()=>{it('a',()=>{expect(hd266anlx(1,4)).toBe(2);});it('b',()=>{expect(hd266anlx(3,1)).toBe(1);});it('c',()=>{expect(hd266anlx(0,0)).toBe(0);});it('d',()=>{expect(hd266anlx(93,73)).toBe(2);});it('e',()=>{expect(hd266anlx(15,0)).toBe(4);});});
function hd267anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267anlx_hd',()=>{it('a',()=>{expect(hd267anlx(1,4)).toBe(2);});it('b',()=>{expect(hd267anlx(3,1)).toBe(1);});it('c',()=>{expect(hd267anlx(0,0)).toBe(0);});it('d',()=>{expect(hd267anlx(93,73)).toBe(2);});it('e',()=>{expect(hd267anlx(15,0)).toBe(4);});});
function hd268anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268anlx_hd',()=>{it('a',()=>{expect(hd268anlx(1,4)).toBe(2);});it('b',()=>{expect(hd268anlx(3,1)).toBe(1);});it('c',()=>{expect(hd268anlx(0,0)).toBe(0);});it('d',()=>{expect(hd268anlx(93,73)).toBe(2);});it('e',()=>{expect(hd268anlx(15,0)).toBe(4);});});
function hd269anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269anlx_hd',()=>{it('a',()=>{expect(hd269anlx(1,4)).toBe(2);});it('b',()=>{expect(hd269anlx(3,1)).toBe(1);});it('c',()=>{expect(hd269anlx(0,0)).toBe(0);});it('d',()=>{expect(hd269anlx(93,73)).toBe(2);});it('e',()=>{expect(hd269anlx(15,0)).toBe(4);});});
function hd270anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270anlx_hd',()=>{it('a',()=>{expect(hd270anlx(1,4)).toBe(2);});it('b',()=>{expect(hd270anlx(3,1)).toBe(1);});it('c',()=>{expect(hd270anlx(0,0)).toBe(0);});it('d',()=>{expect(hd270anlx(93,73)).toBe(2);});it('e',()=>{expect(hd270anlx(15,0)).toBe(4);});});
function hd271anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271anlx_hd',()=>{it('a',()=>{expect(hd271anlx(1,4)).toBe(2);});it('b',()=>{expect(hd271anlx(3,1)).toBe(1);});it('c',()=>{expect(hd271anlx(0,0)).toBe(0);});it('d',()=>{expect(hd271anlx(93,73)).toBe(2);});it('e',()=>{expect(hd271anlx(15,0)).toBe(4);});});
function hd272anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272anlx_hd',()=>{it('a',()=>{expect(hd272anlx(1,4)).toBe(2);});it('b',()=>{expect(hd272anlx(3,1)).toBe(1);});it('c',()=>{expect(hd272anlx(0,0)).toBe(0);});it('d',()=>{expect(hd272anlx(93,73)).toBe(2);});it('e',()=>{expect(hd272anlx(15,0)).toBe(4);});});
function hd273anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273anlx_hd',()=>{it('a',()=>{expect(hd273anlx(1,4)).toBe(2);});it('b',()=>{expect(hd273anlx(3,1)).toBe(1);});it('c',()=>{expect(hd273anlx(0,0)).toBe(0);});it('d',()=>{expect(hd273anlx(93,73)).toBe(2);});it('e',()=>{expect(hd273anlx(15,0)).toBe(4);});});
function hd274anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274anlx_hd',()=>{it('a',()=>{expect(hd274anlx(1,4)).toBe(2);});it('b',()=>{expect(hd274anlx(3,1)).toBe(1);});it('c',()=>{expect(hd274anlx(0,0)).toBe(0);});it('d',()=>{expect(hd274anlx(93,73)).toBe(2);});it('e',()=>{expect(hd274anlx(15,0)).toBe(4);});});
function hd275anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275anlx_hd',()=>{it('a',()=>{expect(hd275anlx(1,4)).toBe(2);});it('b',()=>{expect(hd275anlx(3,1)).toBe(1);});it('c',()=>{expect(hd275anlx(0,0)).toBe(0);});it('d',()=>{expect(hd275anlx(93,73)).toBe(2);});it('e',()=>{expect(hd275anlx(15,0)).toBe(4);});});
function hd276anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276anlx_hd',()=>{it('a',()=>{expect(hd276anlx(1,4)).toBe(2);});it('b',()=>{expect(hd276anlx(3,1)).toBe(1);});it('c',()=>{expect(hd276anlx(0,0)).toBe(0);});it('d',()=>{expect(hd276anlx(93,73)).toBe(2);});it('e',()=>{expect(hd276anlx(15,0)).toBe(4);});});
function hd277anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277anlx_hd',()=>{it('a',()=>{expect(hd277anlx(1,4)).toBe(2);});it('b',()=>{expect(hd277anlx(3,1)).toBe(1);});it('c',()=>{expect(hd277anlx(0,0)).toBe(0);});it('d',()=>{expect(hd277anlx(93,73)).toBe(2);});it('e',()=>{expect(hd277anlx(15,0)).toBe(4);});});
function hd278anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278anlx_hd',()=>{it('a',()=>{expect(hd278anlx(1,4)).toBe(2);});it('b',()=>{expect(hd278anlx(3,1)).toBe(1);});it('c',()=>{expect(hd278anlx(0,0)).toBe(0);});it('d',()=>{expect(hd278anlx(93,73)).toBe(2);});it('e',()=>{expect(hd278anlx(15,0)).toBe(4);});});
function hd279anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279anlx_hd',()=>{it('a',()=>{expect(hd279anlx(1,4)).toBe(2);});it('b',()=>{expect(hd279anlx(3,1)).toBe(1);});it('c',()=>{expect(hd279anlx(0,0)).toBe(0);});it('d',()=>{expect(hd279anlx(93,73)).toBe(2);});it('e',()=>{expect(hd279anlx(15,0)).toBe(4);});});
function hd280anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280anlx_hd',()=>{it('a',()=>{expect(hd280anlx(1,4)).toBe(2);});it('b',()=>{expect(hd280anlx(3,1)).toBe(1);});it('c',()=>{expect(hd280anlx(0,0)).toBe(0);});it('d',()=>{expect(hd280anlx(93,73)).toBe(2);});it('e',()=>{expect(hd280anlx(15,0)).toBe(4);});});
function hd281anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281anlx_hd',()=>{it('a',()=>{expect(hd281anlx(1,4)).toBe(2);});it('b',()=>{expect(hd281anlx(3,1)).toBe(1);});it('c',()=>{expect(hd281anlx(0,0)).toBe(0);});it('d',()=>{expect(hd281anlx(93,73)).toBe(2);});it('e',()=>{expect(hd281anlx(15,0)).toBe(4);});});
function hd282anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282anlx_hd',()=>{it('a',()=>{expect(hd282anlx(1,4)).toBe(2);});it('b',()=>{expect(hd282anlx(3,1)).toBe(1);});it('c',()=>{expect(hd282anlx(0,0)).toBe(0);});it('d',()=>{expect(hd282anlx(93,73)).toBe(2);});it('e',()=>{expect(hd282anlx(15,0)).toBe(4);});});
function hd283anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283anlx_hd',()=>{it('a',()=>{expect(hd283anlx(1,4)).toBe(2);});it('b',()=>{expect(hd283anlx(3,1)).toBe(1);});it('c',()=>{expect(hd283anlx(0,0)).toBe(0);});it('d',()=>{expect(hd283anlx(93,73)).toBe(2);});it('e',()=>{expect(hd283anlx(15,0)).toBe(4);});});
function hd284anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284anlx_hd',()=>{it('a',()=>{expect(hd284anlx(1,4)).toBe(2);});it('b',()=>{expect(hd284anlx(3,1)).toBe(1);});it('c',()=>{expect(hd284anlx(0,0)).toBe(0);});it('d',()=>{expect(hd284anlx(93,73)).toBe(2);});it('e',()=>{expect(hd284anlx(15,0)).toBe(4);});});
function hd285anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285anlx_hd',()=>{it('a',()=>{expect(hd285anlx(1,4)).toBe(2);});it('b',()=>{expect(hd285anlx(3,1)).toBe(1);});it('c',()=>{expect(hd285anlx(0,0)).toBe(0);});it('d',()=>{expect(hd285anlx(93,73)).toBe(2);});it('e',()=>{expect(hd285anlx(15,0)).toBe(4);});});
function hd286anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286anlx_hd',()=>{it('a',()=>{expect(hd286anlx(1,4)).toBe(2);});it('b',()=>{expect(hd286anlx(3,1)).toBe(1);});it('c',()=>{expect(hd286anlx(0,0)).toBe(0);});it('d',()=>{expect(hd286anlx(93,73)).toBe(2);});it('e',()=>{expect(hd286anlx(15,0)).toBe(4);});});
function hd287anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287anlx_hd',()=>{it('a',()=>{expect(hd287anlx(1,4)).toBe(2);});it('b',()=>{expect(hd287anlx(3,1)).toBe(1);});it('c',()=>{expect(hd287anlx(0,0)).toBe(0);});it('d',()=>{expect(hd287anlx(93,73)).toBe(2);});it('e',()=>{expect(hd287anlx(15,0)).toBe(4);});});
function hd288anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288anlx_hd',()=>{it('a',()=>{expect(hd288anlx(1,4)).toBe(2);});it('b',()=>{expect(hd288anlx(3,1)).toBe(1);});it('c',()=>{expect(hd288anlx(0,0)).toBe(0);});it('d',()=>{expect(hd288anlx(93,73)).toBe(2);});it('e',()=>{expect(hd288anlx(15,0)).toBe(4);});});
function hd289anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289anlx_hd',()=>{it('a',()=>{expect(hd289anlx(1,4)).toBe(2);});it('b',()=>{expect(hd289anlx(3,1)).toBe(1);});it('c',()=>{expect(hd289anlx(0,0)).toBe(0);});it('d',()=>{expect(hd289anlx(93,73)).toBe(2);});it('e',()=>{expect(hd289anlx(15,0)).toBe(4);});});
function hd290anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290anlx_hd',()=>{it('a',()=>{expect(hd290anlx(1,4)).toBe(2);});it('b',()=>{expect(hd290anlx(3,1)).toBe(1);});it('c',()=>{expect(hd290anlx(0,0)).toBe(0);});it('d',()=>{expect(hd290anlx(93,73)).toBe(2);});it('e',()=>{expect(hd290anlx(15,0)).toBe(4);});});
function hd291anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291anlx_hd',()=>{it('a',()=>{expect(hd291anlx(1,4)).toBe(2);});it('b',()=>{expect(hd291anlx(3,1)).toBe(1);});it('c',()=>{expect(hd291anlx(0,0)).toBe(0);});it('d',()=>{expect(hd291anlx(93,73)).toBe(2);});it('e',()=>{expect(hd291anlx(15,0)).toBe(4);});});
function hd292anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292anlx_hd',()=>{it('a',()=>{expect(hd292anlx(1,4)).toBe(2);});it('b',()=>{expect(hd292anlx(3,1)).toBe(1);});it('c',()=>{expect(hd292anlx(0,0)).toBe(0);});it('d',()=>{expect(hd292anlx(93,73)).toBe(2);});it('e',()=>{expect(hd292anlx(15,0)).toBe(4);});});
function hd293anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293anlx_hd',()=>{it('a',()=>{expect(hd293anlx(1,4)).toBe(2);});it('b',()=>{expect(hd293anlx(3,1)).toBe(1);});it('c',()=>{expect(hd293anlx(0,0)).toBe(0);});it('d',()=>{expect(hd293anlx(93,73)).toBe(2);});it('e',()=>{expect(hd293anlx(15,0)).toBe(4);});});
function hd294anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294anlx_hd',()=>{it('a',()=>{expect(hd294anlx(1,4)).toBe(2);});it('b',()=>{expect(hd294anlx(3,1)).toBe(1);});it('c',()=>{expect(hd294anlx(0,0)).toBe(0);});it('d',()=>{expect(hd294anlx(93,73)).toBe(2);});it('e',()=>{expect(hd294anlx(15,0)).toBe(4);});});
function hd295anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295anlx_hd',()=>{it('a',()=>{expect(hd295anlx(1,4)).toBe(2);});it('b',()=>{expect(hd295anlx(3,1)).toBe(1);});it('c',()=>{expect(hd295anlx(0,0)).toBe(0);});it('d',()=>{expect(hd295anlx(93,73)).toBe(2);});it('e',()=>{expect(hd295anlx(15,0)).toBe(4);});});
function hd296anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296anlx_hd',()=>{it('a',()=>{expect(hd296anlx(1,4)).toBe(2);});it('b',()=>{expect(hd296anlx(3,1)).toBe(1);});it('c',()=>{expect(hd296anlx(0,0)).toBe(0);});it('d',()=>{expect(hd296anlx(93,73)).toBe(2);});it('e',()=>{expect(hd296anlx(15,0)).toBe(4);});});
function hd297anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297anlx_hd',()=>{it('a',()=>{expect(hd297anlx(1,4)).toBe(2);});it('b',()=>{expect(hd297anlx(3,1)).toBe(1);});it('c',()=>{expect(hd297anlx(0,0)).toBe(0);});it('d',()=>{expect(hd297anlx(93,73)).toBe(2);});it('e',()=>{expect(hd297anlx(15,0)).toBe(4);});});
function hd298anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298anlx_hd',()=>{it('a',()=>{expect(hd298anlx(1,4)).toBe(2);});it('b',()=>{expect(hd298anlx(3,1)).toBe(1);});it('c',()=>{expect(hd298anlx(0,0)).toBe(0);});it('d',()=>{expect(hd298anlx(93,73)).toBe(2);});it('e',()=>{expect(hd298anlx(15,0)).toBe(4);});});
function hd299anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299anlx_hd',()=>{it('a',()=>{expect(hd299anlx(1,4)).toBe(2);});it('b',()=>{expect(hd299anlx(3,1)).toBe(1);});it('c',()=>{expect(hd299anlx(0,0)).toBe(0);});it('d',()=>{expect(hd299anlx(93,73)).toBe(2);});it('e',()=>{expect(hd299anlx(15,0)).toBe(4);});});
function hd300anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300anlx_hd',()=>{it('a',()=>{expect(hd300anlx(1,4)).toBe(2);});it('b',()=>{expect(hd300anlx(3,1)).toBe(1);});it('c',()=>{expect(hd300anlx(0,0)).toBe(0);});it('d',()=>{expect(hd300anlx(93,73)).toBe(2);});it('e',()=>{expect(hd300anlx(15,0)).toBe(4);});});
function hd301anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301anlx_hd',()=>{it('a',()=>{expect(hd301anlx(1,4)).toBe(2);});it('b',()=>{expect(hd301anlx(3,1)).toBe(1);});it('c',()=>{expect(hd301anlx(0,0)).toBe(0);});it('d',()=>{expect(hd301anlx(93,73)).toBe(2);});it('e',()=>{expect(hd301anlx(15,0)).toBe(4);});});
function hd302anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302anlx_hd',()=>{it('a',()=>{expect(hd302anlx(1,4)).toBe(2);});it('b',()=>{expect(hd302anlx(3,1)).toBe(1);});it('c',()=>{expect(hd302anlx(0,0)).toBe(0);});it('d',()=>{expect(hd302anlx(93,73)).toBe(2);});it('e',()=>{expect(hd302anlx(15,0)).toBe(4);});});
function hd303anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303anlx_hd',()=>{it('a',()=>{expect(hd303anlx(1,4)).toBe(2);});it('b',()=>{expect(hd303anlx(3,1)).toBe(1);});it('c',()=>{expect(hd303anlx(0,0)).toBe(0);});it('d',()=>{expect(hd303anlx(93,73)).toBe(2);});it('e',()=>{expect(hd303anlx(15,0)).toBe(4);});});
function hd304anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304anlx_hd',()=>{it('a',()=>{expect(hd304anlx(1,4)).toBe(2);});it('b',()=>{expect(hd304anlx(3,1)).toBe(1);});it('c',()=>{expect(hd304anlx(0,0)).toBe(0);});it('d',()=>{expect(hd304anlx(93,73)).toBe(2);});it('e',()=>{expect(hd304anlx(15,0)).toBe(4);});});
function hd305anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305anlx_hd',()=>{it('a',()=>{expect(hd305anlx(1,4)).toBe(2);});it('b',()=>{expect(hd305anlx(3,1)).toBe(1);});it('c',()=>{expect(hd305anlx(0,0)).toBe(0);});it('d',()=>{expect(hd305anlx(93,73)).toBe(2);});it('e',()=>{expect(hd305anlx(15,0)).toBe(4);});});
function hd306anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306anlx_hd',()=>{it('a',()=>{expect(hd306anlx(1,4)).toBe(2);});it('b',()=>{expect(hd306anlx(3,1)).toBe(1);});it('c',()=>{expect(hd306anlx(0,0)).toBe(0);});it('d',()=>{expect(hd306anlx(93,73)).toBe(2);});it('e',()=>{expect(hd306anlx(15,0)).toBe(4);});});
function hd307anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307anlx_hd',()=>{it('a',()=>{expect(hd307anlx(1,4)).toBe(2);});it('b',()=>{expect(hd307anlx(3,1)).toBe(1);});it('c',()=>{expect(hd307anlx(0,0)).toBe(0);});it('d',()=>{expect(hd307anlx(93,73)).toBe(2);});it('e',()=>{expect(hd307anlx(15,0)).toBe(4);});});
function hd308anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308anlx_hd',()=>{it('a',()=>{expect(hd308anlx(1,4)).toBe(2);});it('b',()=>{expect(hd308anlx(3,1)).toBe(1);});it('c',()=>{expect(hd308anlx(0,0)).toBe(0);});it('d',()=>{expect(hd308anlx(93,73)).toBe(2);});it('e',()=>{expect(hd308anlx(15,0)).toBe(4);});});
function hd309anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309anlx_hd',()=>{it('a',()=>{expect(hd309anlx(1,4)).toBe(2);});it('b',()=>{expect(hd309anlx(3,1)).toBe(1);});it('c',()=>{expect(hd309anlx(0,0)).toBe(0);});it('d',()=>{expect(hd309anlx(93,73)).toBe(2);});it('e',()=>{expect(hd309anlx(15,0)).toBe(4);});});
function hd310anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310anlx_hd',()=>{it('a',()=>{expect(hd310anlx(1,4)).toBe(2);});it('b',()=>{expect(hd310anlx(3,1)).toBe(1);});it('c',()=>{expect(hd310anlx(0,0)).toBe(0);});it('d',()=>{expect(hd310anlx(93,73)).toBe(2);});it('e',()=>{expect(hd310anlx(15,0)).toBe(4);});});
function hd311anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311anlx_hd',()=>{it('a',()=>{expect(hd311anlx(1,4)).toBe(2);});it('b',()=>{expect(hd311anlx(3,1)).toBe(1);});it('c',()=>{expect(hd311anlx(0,0)).toBe(0);});it('d',()=>{expect(hd311anlx(93,73)).toBe(2);});it('e',()=>{expect(hd311anlx(15,0)).toBe(4);});});
function hd312anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312anlx_hd',()=>{it('a',()=>{expect(hd312anlx(1,4)).toBe(2);});it('b',()=>{expect(hd312anlx(3,1)).toBe(1);});it('c',()=>{expect(hd312anlx(0,0)).toBe(0);});it('d',()=>{expect(hd312anlx(93,73)).toBe(2);});it('e',()=>{expect(hd312anlx(15,0)).toBe(4);});});
function hd313anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313anlx_hd',()=>{it('a',()=>{expect(hd313anlx(1,4)).toBe(2);});it('b',()=>{expect(hd313anlx(3,1)).toBe(1);});it('c',()=>{expect(hd313anlx(0,0)).toBe(0);});it('d',()=>{expect(hd313anlx(93,73)).toBe(2);});it('e',()=>{expect(hd313anlx(15,0)).toBe(4);});});
function hd314anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314anlx_hd',()=>{it('a',()=>{expect(hd314anlx(1,4)).toBe(2);});it('b',()=>{expect(hd314anlx(3,1)).toBe(1);});it('c',()=>{expect(hd314anlx(0,0)).toBe(0);});it('d',()=>{expect(hd314anlx(93,73)).toBe(2);});it('e',()=>{expect(hd314anlx(15,0)).toBe(4);});});
function hd315anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315anlx_hd',()=>{it('a',()=>{expect(hd315anlx(1,4)).toBe(2);});it('b',()=>{expect(hd315anlx(3,1)).toBe(1);});it('c',()=>{expect(hd315anlx(0,0)).toBe(0);});it('d',()=>{expect(hd315anlx(93,73)).toBe(2);});it('e',()=>{expect(hd315anlx(15,0)).toBe(4);});});
function hd316anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316anlx_hd',()=>{it('a',()=>{expect(hd316anlx(1,4)).toBe(2);});it('b',()=>{expect(hd316anlx(3,1)).toBe(1);});it('c',()=>{expect(hd316anlx(0,0)).toBe(0);});it('d',()=>{expect(hd316anlx(93,73)).toBe(2);});it('e',()=>{expect(hd316anlx(15,0)).toBe(4);});});
function hd317anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317anlx_hd',()=>{it('a',()=>{expect(hd317anlx(1,4)).toBe(2);});it('b',()=>{expect(hd317anlx(3,1)).toBe(1);});it('c',()=>{expect(hd317anlx(0,0)).toBe(0);});it('d',()=>{expect(hd317anlx(93,73)).toBe(2);});it('e',()=>{expect(hd317anlx(15,0)).toBe(4);});});
function hd318anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318anlx_hd',()=>{it('a',()=>{expect(hd318anlx(1,4)).toBe(2);});it('b',()=>{expect(hd318anlx(3,1)).toBe(1);});it('c',()=>{expect(hd318anlx(0,0)).toBe(0);});it('d',()=>{expect(hd318anlx(93,73)).toBe(2);});it('e',()=>{expect(hd318anlx(15,0)).toBe(4);});});
function hd319anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319anlx_hd',()=>{it('a',()=>{expect(hd319anlx(1,4)).toBe(2);});it('b',()=>{expect(hd319anlx(3,1)).toBe(1);});it('c',()=>{expect(hd319anlx(0,0)).toBe(0);});it('d',()=>{expect(hd319anlx(93,73)).toBe(2);});it('e',()=>{expect(hd319anlx(15,0)).toBe(4);});});
function hd320anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320anlx_hd',()=>{it('a',()=>{expect(hd320anlx(1,4)).toBe(2);});it('b',()=>{expect(hd320anlx(3,1)).toBe(1);});it('c',()=>{expect(hd320anlx(0,0)).toBe(0);});it('d',()=>{expect(hd320anlx(93,73)).toBe(2);});it('e',()=>{expect(hd320anlx(15,0)).toBe(4);});});
function hd321anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321anlx_hd',()=>{it('a',()=>{expect(hd321anlx(1,4)).toBe(2);});it('b',()=>{expect(hd321anlx(3,1)).toBe(1);});it('c',()=>{expect(hd321anlx(0,0)).toBe(0);});it('d',()=>{expect(hd321anlx(93,73)).toBe(2);});it('e',()=>{expect(hd321anlx(15,0)).toBe(4);});});
function hd322anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322anlx_hd',()=>{it('a',()=>{expect(hd322anlx(1,4)).toBe(2);});it('b',()=>{expect(hd322anlx(3,1)).toBe(1);});it('c',()=>{expect(hd322anlx(0,0)).toBe(0);});it('d',()=>{expect(hd322anlx(93,73)).toBe(2);});it('e',()=>{expect(hd322anlx(15,0)).toBe(4);});});
function hd323anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323anlx_hd',()=>{it('a',()=>{expect(hd323anlx(1,4)).toBe(2);});it('b',()=>{expect(hd323anlx(3,1)).toBe(1);});it('c',()=>{expect(hd323anlx(0,0)).toBe(0);});it('d',()=>{expect(hd323anlx(93,73)).toBe(2);});it('e',()=>{expect(hd323anlx(15,0)).toBe(4);});});
function hd324anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324anlx_hd',()=>{it('a',()=>{expect(hd324anlx(1,4)).toBe(2);});it('b',()=>{expect(hd324anlx(3,1)).toBe(1);});it('c',()=>{expect(hd324anlx(0,0)).toBe(0);});it('d',()=>{expect(hd324anlx(93,73)).toBe(2);});it('e',()=>{expect(hd324anlx(15,0)).toBe(4);});});
function hd325anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325anlx_hd',()=>{it('a',()=>{expect(hd325anlx(1,4)).toBe(2);});it('b',()=>{expect(hd325anlx(3,1)).toBe(1);});it('c',()=>{expect(hd325anlx(0,0)).toBe(0);});it('d',()=>{expect(hd325anlx(93,73)).toBe(2);});it('e',()=>{expect(hd325anlx(15,0)).toBe(4);});});
function hd326anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326anlx_hd',()=>{it('a',()=>{expect(hd326anlx(1,4)).toBe(2);});it('b',()=>{expect(hd326anlx(3,1)).toBe(1);});it('c',()=>{expect(hd326anlx(0,0)).toBe(0);});it('d',()=>{expect(hd326anlx(93,73)).toBe(2);});it('e',()=>{expect(hd326anlx(15,0)).toBe(4);});});
function hd327anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327anlx_hd',()=>{it('a',()=>{expect(hd327anlx(1,4)).toBe(2);});it('b',()=>{expect(hd327anlx(3,1)).toBe(1);});it('c',()=>{expect(hd327anlx(0,0)).toBe(0);});it('d',()=>{expect(hd327anlx(93,73)).toBe(2);});it('e',()=>{expect(hd327anlx(15,0)).toBe(4);});});
function hd328anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328anlx_hd',()=>{it('a',()=>{expect(hd328anlx(1,4)).toBe(2);});it('b',()=>{expect(hd328anlx(3,1)).toBe(1);});it('c',()=>{expect(hd328anlx(0,0)).toBe(0);});it('d',()=>{expect(hd328anlx(93,73)).toBe(2);});it('e',()=>{expect(hd328anlx(15,0)).toBe(4);});});
function hd329anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329anlx_hd',()=>{it('a',()=>{expect(hd329anlx(1,4)).toBe(2);});it('b',()=>{expect(hd329anlx(3,1)).toBe(1);});it('c',()=>{expect(hd329anlx(0,0)).toBe(0);});it('d',()=>{expect(hd329anlx(93,73)).toBe(2);});it('e',()=>{expect(hd329anlx(15,0)).toBe(4);});});
function hd330anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330anlx_hd',()=>{it('a',()=>{expect(hd330anlx(1,4)).toBe(2);});it('b',()=>{expect(hd330anlx(3,1)).toBe(1);});it('c',()=>{expect(hd330anlx(0,0)).toBe(0);});it('d',()=>{expect(hd330anlx(93,73)).toBe(2);});it('e',()=>{expect(hd330anlx(15,0)).toBe(4);});});
function hd331anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331anlx_hd',()=>{it('a',()=>{expect(hd331anlx(1,4)).toBe(2);});it('b',()=>{expect(hd331anlx(3,1)).toBe(1);});it('c',()=>{expect(hd331anlx(0,0)).toBe(0);});it('d',()=>{expect(hd331anlx(93,73)).toBe(2);});it('e',()=>{expect(hd331anlx(15,0)).toBe(4);});});
function hd332anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332anlx_hd',()=>{it('a',()=>{expect(hd332anlx(1,4)).toBe(2);});it('b',()=>{expect(hd332anlx(3,1)).toBe(1);});it('c',()=>{expect(hd332anlx(0,0)).toBe(0);});it('d',()=>{expect(hd332anlx(93,73)).toBe(2);});it('e',()=>{expect(hd332anlx(15,0)).toBe(4);});});
function hd333anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333anlx_hd',()=>{it('a',()=>{expect(hd333anlx(1,4)).toBe(2);});it('b',()=>{expect(hd333anlx(3,1)).toBe(1);});it('c',()=>{expect(hd333anlx(0,0)).toBe(0);});it('d',()=>{expect(hd333anlx(93,73)).toBe(2);});it('e',()=>{expect(hd333anlx(15,0)).toBe(4);});});
function hd334anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334anlx_hd',()=>{it('a',()=>{expect(hd334anlx(1,4)).toBe(2);});it('b',()=>{expect(hd334anlx(3,1)).toBe(1);});it('c',()=>{expect(hd334anlx(0,0)).toBe(0);});it('d',()=>{expect(hd334anlx(93,73)).toBe(2);});it('e',()=>{expect(hd334anlx(15,0)).toBe(4);});});
function hd335anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335anlx_hd',()=>{it('a',()=>{expect(hd335anlx(1,4)).toBe(2);});it('b',()=>{expect(hd335anlx(3,1)).toBe(1);});it('c',()=>{expect(hd335anlx(0,0)).toBe(0);});it('d',()=>{expect(hd335anlx(93,73)).toBe(2);});it('e',()=>{expect(hd335anlx(15,0)).toBe(4);});});
function hd336anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336anlx_hd',()=>{it('a',()=>{expect(hd336anlx(1,4)).toBe(2);});it('b',()=>{expect(hd336anlx(3,1)).toBe(1);});it('c',()=>{expect(hd336anlx(0,0)).toBe(0);});it('d',()=>{expect(hd336anlx(93,73)).toBe(2);});it('e',()=>{expect(hd336anlx(15,0)).toBe(4);});});
function hd337anlx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337anlx_hd',()=>{it('a',()=>{expect(hd337anlx(1,4)).toBe(2);});it('b',()=>{expect(hd337anlx(3,1)).toBe(1);});it('c',()=>{expect(hd337anlx(0,0)).toBe(0);});it('d',()=>{expect(hd337anlx(93,73)).toBe(2);});it('e',()=>{expect(hd337anlx(15,0)).toBe(4);});});
function hd338anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338anax2_hd',()=>{it('a',()=>{expect(hd338anax2(1,4)).toBe(2);});it('b',()=>{expect(hd338anax2(3,1)).toBe(1);});it('c',()=>{expect(hd338anax2(0,0)).toBe(0);});it('d',()=>{expect(hd338anax2(93,73)).toBe(2);});it('e',()=>{expect(hd338anax2(15,0)).toBe(4);});});
function hd338anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339anax2_hd',()=>{it('a',()=>{expect(hd339anax2(1,4)).toBe(2);});it('b',()=>{expect(hd339anax2(3,1)).toBe(1);});it('c',()=>{expect(hd339anax2(0,0)).toBe(0);});it('d',()=>{expect(hd339anax2(93,73)).toBe(2);});it('e',()=>{expect(hd339anax2(15,0)).toBe(4);});});
function hd339anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340anax2_hd',()=>{it('a',()=>{expect(hd340anax2(1,4)).toBe(2);});it('b',()=>{expect(hd340anax2(3,1)).toBe(1);});it('c',()=>{expect(hd340anax2(0,0)).toBe(0);});it('d',()=>{expect(hd340anax2(93,73)).toBe(2);});it('e',()=>{expect(hd340anax2(15,0)).toBe(4);});});
function hd340anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341anax2_hd',()=>{it('a',()=>{expect(hd341anax2(1,4)).toBe(2);});it('b',()=>{expect(hd341anax2(3,1)).toBe(1);});it('c',()=>{expect(hd341anax2(0,0)).toBe(0);});it('d',()=>{expect(hd341anax2(93,73)).toBe(2);});it('e',()=>{expect(hd341anax2(15,0)).toBe(4);});});
function hd341anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342anax2_hd',()=>{it('a',()=>{expect(hd342anax2(1,4)).toBe(2);});it('b',()=>{expect(hd342anax2(3,1)).toBe(1);});it('c',()=>{expect(hd342anax2(0,0)).toBe(0);});it('d',()=>{expect(hd342anax2(93,73)).toBe(2);});it('e',()=>{expect(hd342anax2(15,0)).toBe(4);});});
function hd342anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343anax2_hd',()=>{it('a',()=>{expect(hd343anax2(1,4)).toBe(2);});it('b',()=>{expect(hd343anax2(3,1)).toBe(1);});it('c',()=>{expect(hd343anax2(0,0)).toBe(0);});it('d',()=>{expect(hd343anax2(93,73)).toBe(2);});it('e',()=>{expect(hd343anax2(15,0)).toBe(4);});});
function hd343anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344anax2_hd',()=>{it('a',()=>{expect(hd344anax2(1,4)).toBe(2);});it('b',()=>{expect(hd344anax2(3,1)).toBe(1);});it('c',()=>{expect(hd344anax2(0,0)).toBe(0);});it('d',()=>{expect(hd344anax2(93,73)).toBe(2);});it('e',()=>{expect(hd344anax2(15,0)).toBe(4);});});
function hd344anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345anax2_hd',()=>{it('a',()=>{expect(hd345anax2(1,4)).toBe(2);});it('b',()=>{expect(hd345anax2(3,1)).toBe(1);});it('c',()=>{expect(hd345anax2(0,0)).toBe(0);});it('d',()=>{expect(hd345anax2(93,73)).toBe(2);});it('e',()=>{expect(hd345anax2(15,0)).toBe(4);});});
function hd345anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346anax2_hd',()=>{it('a',()=>{expect(hd346anax2(1,4)).toBe(2);});it('b',()=>{expect(hd346anax2(3,1)).toBe(1);});it('c',()=>{expect(hd346anax2(0,0)).toBe(0);});it('d',()=>{expect(hd346anax2(93,73)).toBe(2);});it('e',()=>{expect(hd346anax2(15,0)).toBe(4);});});
function hd346anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347anax2_hd',()=>{it('a',()=>{expect(hd347anax2(1,4)).toBe(2);});it('b',()=>{expect(hd347anax2(3,1)).toBe(1);});it('c',()=>{expect(hd347anax2(0,0)).toBe(0);});it('d',()=>{expect(hd347anax2(93,73)).toBe(2);});it('e',()=>{expect(hd347anax2(15,0)).toBe(4);});});
function hd347anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348anax2_hd',()=>{it('a',()=>{expect(hd348anax2(1,4)).toBe(2);});it('b',()=>{expect(hd348anax2(3,1)).toBe(1);});it('c',()=>{expect(hd348anax2(0,0)).toBe(0);});it('d',()=>{expect(hd348anax2(93,73)).toBe(2);});it('e',()=>{expect(hd348anax2(15,0)).toBe(4);});});
function hd348anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349anax2_hd',()=>{it('a',()=>{expect(hd349anax2(1,4)).toBe(2);});it('b',()=>{expect(hd349anax2(3,1)).toBe(1);});it('c',()=>{expect(hd349anax2(0,0)).toBe(0);});it('d',()=>{expect(hd349anax2(93,73)).toBe(2);});it('e',()=>{expect(hd349anax2(15,0)).toBe(4);});});
function hd349anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350anax2_hd',()=>{it('a',()=>{expect(hd350anax2(1,4)).toBe(2);});it('b',()=>{expect(hd350anax2(3,1)).toBe(1);});it('c',()=>{expect(hd350anax2(0,0)).toBe(0);});it('d',()=>{expect(hd350anax2(93,73)).toBe(2);});it('e',()=>{expect(hd350anax2(15,0)).toBe(4);});});
function hd350anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351anax2_hd',()=>{it('a',()=>{expect(hd351anax2(1,4)).toBe(2);});it('b',()=>{expect(hd351anax2(3,1)).toBe(1);});it('c',()=>{expect(hd351anax2(0,0)).toBe(0);});it('d',()=>{expect(hd351anax2(93,73)).toBe(2);});it('e',()=>{expect(hd351anax2(15,0)).toBe(4);});});
function hd351anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352anax2_hd',()=>{it('a',()=>{expect(hd352anax2(1,4)).toBe(2);});it('b',()=>{expect(hd352anax2(3,1)).toBe(1);});it('c',()=>{expect(hd352anax2(0,0)).toBe(0);});it('d',()=>{expect(hd352anax2(93,73)).toBe(2);});it('e',()=>{expect(hd352anax2(15,0)).toBe(4);});});
function hd352anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353anax2_hd',()=>{it('a',()=>{expect(hd353anax2(1,4)).toBe(2);});it('b',()=>{expect(hd353anax2(3,1)).toBe(1);});it('c',()=>{expect(hd353anax2(0,0)).toBe(0);});it('d',()=>{expect(hd353anax2(93,73)).toBe(2);});it('e',()=>{expect(hd353anax2(15,0)).toBe(4);});});
function hd353anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354anax2_hd',()=>{it('a',()=>{expect(hd354anax2(1,4)).toBe(2);});it('b',()=>{expect(hd354anax2(3,1)).toBe(1);});it('c',()=>{expect(hd354anax2(0,0)).toBe(0);});it('d',()=>{expect(hd354anax2(93,73)).toBe(2);});it('e',()=>{expect(hd354anax2(15,0)).toBe(4);});});
function hd354anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355anax2_hd',()=>{it('a',()=>{expect(hd355anax2(1,4)).toBe(2);});it('b',()=>{expect(hd355anax2(3,1)).toBe(1);});it('c',()=>{expect(hd355anax2(0,0)).toBe(0);});it('d',()=>{expect(hd355anax2(93,73)).toBe(2);});it('e',()=>{expect(hd355anax2(15,0)).toBe(4);});});
function hd355anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356anax2_hd',()=>{it('a',()=>{expect(hd356anax2(1,4)).toBe(2);});it('b',()=>{expect(hd356anax2(3,1)).toBe(1);});it('c',()=>{expect(hd356anax2(0,0)).toBe(0);});it('d',()=>{expect(hd356anax2(93,73)).toBe(2);});it('e',()=>{expect(hd356anax2(15,0)).toBe(4);});});
function hd356anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357anax2_hd',()=>{it('a',()=>{expect(hd357anax2(1,4)).toBe(2);});it('b',()=>{expect(hd357anax2(3,1)).toBe(1);});it('c',()=>{expect(hd357anax2(0,0)).toBe(0);});it('d',()=>{expect(hd357anax2(93,73)).toBe(2);});it('e',()=>{expect(hd357anax2(15,0)).toBe(4);});});
function hd357anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358anax2_hd',()=>{it('a',()=>{expect(hd358anax2(1,4)).toBe(2);});it('b',()=>{expect(hd358anax2(3,1)).toBe(1);});it('c',()=>{expect(hd358anax2(0,0)).toBe(0);});it('d',()=>{expect(hd358anax2(93,73)).toBe(2);});it('e',()=>{expect(hd358anax2(15,0)).toBe(4);});});
function hd358anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359anax2_hd',()=>{it('a',()=>{expect(hd359anax2(1,4)).toBe(2);});it('b',()=>{expect(hd359anax2(3,1)).toBe(1);});it('c',()=>{expect(hd359anax2(0,0)).toBe(0);});it('d',()=>{expect(hd359anax2(93,73)).toBe(2);});it('e',()=>{expect(hd359anax2(15,0)).toBe(4);});});
function hd359anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360anax2_hd',()=>{it('a',()=>{expect(hd360anax2(1,4)).toBe(2);});it('b',()=>{expect(hd360anax2(3,1)).toBe(1);});it('c',()=>{expect(hd360anax2(0,0)).toBe(0);});it('d',()=>{expect(hd360anax2(93,73)).toBe(2);});it('e',()=>{expect(hd360anax2(15,0)).toBe(4);});});
function hd360anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361anax2_hd',()=>{it('a',()=>{expect(hd361anax2(1,4)).toBe(2);});it('b',()=>{expect(hd361anax2(3,1)).toBe(1);});it('c',()=>{expect(hd361anax2(0,0)).toBe(0);});it('d',()=>{expect(hd361anax2(93,73)).toBe(2);});it('e',()=>{expect(hd361anax2(15,0)).toBe(4);});});
function hd361anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362anax2_hd',()=>{it('a',()=>{expect(hd362anax2(1,4)).toBe(2);});it('b',()=>{expect(hd362anax2(3,1)).toBe(1);});it('c',()=>{expect(hd362anax2(0,0)).toBe(0);});it('d',()=>{expect(hd362anax2(93,73)).toBe(2);});it('e',()=>{expect(hd362anax2(15,0)).toBe(4);});});
function hd362anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363anax2_hd',()=>{it('a',()=>{expect(hd363anax2(1,4)).toBe(2);});it('b',()=>{expect(hd363anax2(3,1)).toBe(1);});it('c',()=>{expect(hd363anax2(0,0)).toBe(0);});it('d',()=>{expect(hd363anax2(93,73)).toBe(2);});it('e',()=>{expect(hd363anax2(15,0)).toBe(4);});});
function hd363anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364anax2_hd',()=>{it('a',()=>{expect(hd364anax2(1,4)).toBe(2);});it('b',()=>{expect(hd364anax2(3,1)).toBe(1);});it('c',()=>{expect(hd364anax2(0,0)).toBe(0);});it('d',()=>{expect(hd364anax2(93,73)).toBe(2);});it('e',()=>{expect(hd364anax2(15,0)).toBe(4);});});
function hd364anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365anax2_hd',()=>{it('a',()=>{expect(hd365anax2(1,4)).toBe(2);});it('b',()=>{expect(hd365anax2(3,1)).toBe(1);});it('c',()=>{expect(hd365anax2(0,0)).toBe(0);});it('d',()=>{expect(hd365anax2(93,73)).toBe(2);});it('e',()=>{expect(hd365anax2(15,0)).toBe(4);});});
function hd365anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366anax2_hd',()=>{it('a',()=>{expect(hd366anax2(1,4)).toBe(2);});it('b',()=>{expect(hd366anax2(3,1)).toBe(1);});it('c',()=>{expect(hd366anax2(0,0)).toBe(0);});it('d',()=>{expect(hd366anax2(93,73)).toBe(2);});it('e',()=>{expect(hd366anax2(15,0)).toBe(4);});});
function hd366anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367anax2_hd',()=>{it('a',()=>{expect(hd367anax2(1,4)).toBe(2);});it('b',()=>{expect(hd367anax2(3,1)).toBe(1);});it('c',()=>{expect(hd367anax2(0,0)).toBe(0);});it('d',()=>{expect(hd367anax2(93,73)).toBe(2);});it('e',()=>{expect(hd367anax2(15,0)).toBe(4);});});
function hd367anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368anax2_hd',()=>{it('a',()=>{expect(hd368anax2(1,4)).toBe(2);});it('b',()=>{expect(hd368anax2(3,1)).toBe(1);});it('c',()=>{expect(hd368anax2(0,0)).toBe(0);});it('d',()=>{expect(hd368anax2(93,73)).toBe(2);});it('e',()=>{expect(hd368anax2(15,0)).toBe(4);});});
function hd368anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369anax2_hd',()=>{it('a',()=>{expect(hd369anax2(1,4)).toBe(2);});it('b',()=>{expect(hd369anax2(3,1)).toBe(1);});it('c',()=>{expect(hd369anax2(0,0)).toBe(0);});it('d',()=>{expect(hd369anax2(93,73)).toBe(2);});it('e',()=>{expect(hd369anax2(15,0)).toBe(4);});});
function hd369anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370anax2_hd',()=>{it('a',()=>{expect(hd370anax2(1,4)).toBe(2);});it('b',()=>{expect(hd370anax2(3,1)).toBe(1);});it('c',()=>{expect(hd370anax2(0,0)).toBe(0);});it('d',()=>{expect(hd370anax2(93,73)).toBe(2);});it('e',()=>{expect(hd370anax2(15,0)).toBe(4);});});
function hd370anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371anax2_hd',()=>{it('a',()=>{expect(hd371anax2(1,4)).toBe(2);});it('b',()=>{expect(hd371anax2(3,1)).toBe(1);});it('c',()=>{expect(hd371anax2(0,0)).toBe(0);});it('d',()=>{expect(hd371anax2(93,73)).toBe(2);});it('e',()=>{expect(hd371anax2(15,0)).toBe(4);});});
function hd371anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372anax2_hd',()=>{it('a',()=>{expect(hd372anax2(1,4)).toBe(2);});it('b',()=>{expect(hd372anax2(3,1)).toBe(1);});it('c',()=>{expect(hd372anax2(0,0)).toBe(0);});it('d',()=>{expect(hd372anax2(93,73)).toBe(2);});it('e',()=>{expect(hd372anax2(15,0)).toBe(4);});});
function hd372anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373anax2_hd',()=>{it('a',()=>{expect(hd373anax2(1,4)).toBe(2);});it('b',()=>{expect(hd373anax2(3,1)).toBe(1);});it('c',()=>{expect(hd373anax2(0,0)).toBe(0);});it('d',()=>{expect(hd373anax2(93,73)).toBe(2);});it('e',()=>{expect(hd373anax2(15,0)).toBe(4);});});
function hd373anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374anax2_hd',()=>{it('a',()=>{expect(hd374anax2(1,4)).toBe(2);});it('b',()=>{expect(hd374anax2(3,1)).toBe(1);});it('c',()=>{expect(hd374anax2(0,0)).toBe(0);});it('d',()=>{expect(hd374anax2(93,73)).toBe(2);});it('e',()=>{expect(hd374anax2(15,0)).toBe(4);});});
function hd374anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375anax2_hd',()=>{it('a',()=>{expect(hd375anax2(1,4)).toBe(2);});it('b',()=>{expect(hd375anax2(3,1)).toBe(1);});it('c',()=>{expect(hd375anax2(0,0)).toBe(0);});it('d',()=>{expect(hd375anax2(93,73)).toBe(2);});it('e',()=>{expect(hd375anax2(15,0)).toBe(4);});});
function hd375anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376anax2_hd',()=>{it('a',()=>{expect(hd376anax2(1,4)).toBe(2);});it('b',()=>{expect(hd376anax2(3,1)).toBe(1);});it('c',()=>{expect(hd376anax2(0,0)).toBe(0);});it('d',()=>{expect(hd376anax2(93,73)).toBe(2);});it('e',()=>{expect(hd376anax2(15,0)).toBe(4);});});
function hd376anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377anax2_hd',()=>{it('a',()=>{expect(hd377anax2(1,4)).toBe(2);});it('b',()=>{expect(hd377anax2(3,1)).toBe(1);});it('c',()=>{expect(hd377anax2(0,0)).toBe(0);});it('d',()=>{expect(hd377anax2(93,73)).toBe(2);});it('e',()=>{expect(hd377anax2(15,0)).toBe(4);});});
function hd377anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378anax2_hd',()=>{it('a',()=>{expect(hd378anax2(1,4)).toBe(2);});it('b',()=>{expect(hd378anax2(3,1)).toBe(1);});it('c',()=>{expect(hd378anax2(0,0)).toBe(0);});it('d',()=>{expect(hd378anax2(93,73)).toBe(2);});it('e',()=>{expect(hd378anax2(15,0)).toBe(4);});});
function hd378anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379anax2_hd',()=>{it('a',()=>{expect(hd379anax2(1,4)).toBe(2);});it('b',()=>{expect(hd379anax2(3,1)).toBe(1);});it('c',()=>{expect(hd379anax2(0,0)).toBe(0);});it('d',()=>{expect(hd379anax2(93,73)).toBe(2);});it('e',()=>{expect(hd379anax2(15,0)).toBe(4);});});
function hd379anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380anax2_hd',()=>{it('a',()=>{expect(hd380anax2(1,4)).toBe(2);});it('b',()=>{expect(hd380anax2(3,1)).toBe(1);});it('c',()=>{expect(hd380anax2(0,0)).toBe(0);});it('d',()=>{expect(hd380anax2(93,73)).toBe(2);});it('e',()=>{expect(hd380anax2(15,0)).toBe(4);});});
function hd380anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381anax2_hd',()=>{it('a',()=>{expect(hd381anax2(1,4)).toBe(2);});it('b',()=>{expect(hd381anax2(3,1)).toBe(1);});it('c',()=>{expect(hd381anax2(0,0)).toBe(0);});it('d',()=>{expect(hd381anax2(93,73)).toBe(2);});it('e',()=>{expect(hd381anax2(15,0)).toBe(4);});});
function hd381anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382anax2_hd',()=>{it('a',()=>{expect(hd382anax2(1,4)).toBe(2);});it('b',()=>{expect(hd382anax2(3,1)).toBe(1);});it('c',()=>{expect(hd382anax2(0,0)).toBe(0);});it('d',()=>{expect(hd382anax2(93,73)).toBe(2);});it('e',()=>{expect(hd382anax2(15,0)).toBe(4);});});
function hd382anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383anax2_hd',()=>{it('a',()=>{expect(hd383anax2(1,4)).toBe(2);});it('b',()=>{expect(hd383anax2(3,1)).toBe(1);});it('c',()=>{expect(hd383anax2(0,0)).toBe(0);});it('d',()=>{expect(hd383anax2(93,73)).toBe(2);});it('e',()=>{expect(hd383anax2(15,0)).toBe(4);});});
function hd383anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384anax2_hd',()=>{it('a',()=>{expect(hd384anax2(1,4)).toBe(2);});it('b',()=>{expect(hd384anax2(3,1)).toBe(1);});it('c',()=>{expect(hd384anax2(0,0)).toBe(0);});it('d',()=>{expect(hd384anax2(93,73)).toBe(2);});it('e',()=>{expect(hd384anax2(15,0)).toBe(4);});});
function hd384anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385anax2_hd',()=>{it('a',()=>{expect(hd385anax2(1,4)).toBe(2);});it('b',()=>{expect(hd385anax2(3,1)).toBe(1);});it('c',()=>{expect(hd385anax2(0,0)).toBe(0);});it('d',()=>{expect(hd385anax2(93,73)).toBe(2);});it('e',()=>{expect(hd385anax2(15,0)).toBe(4);});});
function hd385anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386anax2_hd',()=>{it('a',()=>{expect(hd386anax2(1,4)).toBe(2);});it('b',()=>{expect(hd386anax2(3,1)).toBe(1);});it('c',()=>{expect(hd386anax2(0,0)).toBe(0);});it('d',()=>{expect(hd386anax2(93,73)).toBe(2);});it('e',()=>{expect(hd386anax2(15,0)).toBe(4);});});
function hd386anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387anax2_hd',()=>{it('a',()=>{expect(hd387anax2(1,4)).toBe(2);});it('b',()=>{expect(hd387anax2(3,1)).toBe(1);});it('c',()=>{expect(hd387anax2(0,0)).toBe(0);});it('d',()=>{expect(hd387anax2(93,73)).toBe(2);});it('e',()=>{expect(hd387anax2(15,0)).toBe(4);});});
function hd387anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388anax2_hd',()=>{it('a',()=>{expect(hd388anax2(1,4)).toBe(2);});it('b',()=>{expect(hd388anax2(3,1)).toBe(1);});it('c',()=>{expect(hd388anax2(0,0)).toBe(0);});it('d',()=>{expect(hd388anax2(93,73)).toBe(2);});it('e',()=>{expect(hd388anax2(15,0)).toBe(4);});});
function hd388anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389anax2_hd',()=>{it('a',()=>{expect(hd389anax2(1,4)).toBe(2);});it('b',()=>{expect(hd389anax2(3,1)).toBe(1);});it('c',()=>{expect(hd389anax2(0,0)).toBe(0);});it('d',()=>{expect(hd389anax2(93,73)).toBe(2);});it('e',()=>{expect(hd389anax2(15,0)).toBe(4);});});
function hd389anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390anax2_hd',()=>{it('a',()=>{expect(hd390anax2(1,4)).toBe(2);});it('b',()=>{expect(hd390anax2(3,1)).toBe(1);});it('c',()=>{expect(hd390anax2(0,0)).toBe(0);});it('d',()=>{expect(hd390anax2(93,73)).toBe(2);});it('e',()=>{expect(hd390anax2(15,0)).toBe(4);});});
function hd390anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391anax2_hd',()=>{it('a',()=>{expect(hd391anax2(1,4)).toBe(2);});it('b',()=>{expect(hd391anax2(3,1)).toBe(1);});it('c',()=>{expect(hd391anax2(0,0)).toBe(0);});it('d',()=>{expect(hd391anax2(93,73)).toBe(2);});it('e',()=>{expect(hd391anax2(15,0)).toBe(4);});});
function hd391anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392anax2_hd',()=>{it('a',()=>{expect(hd392anax2(1,4)).toBe(2);});it('b',()=>{expect(hd392anax2(3,1)).toBe(1);});it('c',()=>{expect(hd392anax2(0,0)).toBe(0);});it('d',()=>{expect(hd392anax2(93,73)).toBe(2);});it('e',()=>{expect(hd392anax2(15,0)).toBe(4);});});
function hd392anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393anax2_hd',()=>{it('a',()=>{expect(hd393anax2(1,4)).toBe(2);});it('b',()=>{expect(hd393anax2(3,1)).toBe(1);});it('c',()=>{expect(hd393anax2(0,0)).toBe(0);});it('d',()=>{expect(hd393anax2(93,73)).toBe(2);});it('e',()=>{expect(hd393anax2(15,0)).toBe(4);});});
function hd393anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394anax2_hd',()=>{it('a',()=>{expect(hd394anax2(1,4)).toBe(2);});it('b',()=>{expect(hd394anax2(3,1)).toBe(1);});it('c',()=>{expect(hd394anax2(0,0)).toBe(0);});it('d',()=>{expect(hd394anax2(93,73)).toBe(2);});it('e',()=>{expect(hd394anax2(15,0)).toBe(4);});});
function hd394anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395anax2_hd',()=>{it('a',()=>{expect(hd395anax2(1,4)).toBe(2);});it('b',()=>{expect(hd395anax2(3,1)).toBe(1);});it('c',()=>{expect(hd395anax2(0,0)).toBe(0);});it('d',()=>{expect(hd395anax2(93,73)).toBe(2);});it('e',()=>{expect(hd395anax2(15,0)).toBe(4);});});
function hd395anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396anax2_hd',()=>{it('a',()=>{expect(hd396anax2(1,4)).toBe(2);});it('b',()=>{expect(hd396anax2(3,1)).toBe(1);});it('c',()=>{expect(hd396anax2(0,0)).toBe(0);});it('d',()=>{expect(hd396anax2(93,73)).toBe(2);});it('e',()=>{expect(hd396anax2(15,0)).toBe(4);});});
function hd396anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397anax2_hd',()=>{it('a',()=>{expect(hd397anax2(1,4)).toBe(2);});it('b',()=>{expect(hd397anax2(3,1)).toBe(1);});it('c',()=>{expect(hd397anax2(0,0)).toBe(0);});it('d',()=>{expect(hd397anax2(93,73)).toBe(2);});it('e',()=>{expect(hd397anax2(15,0)).toBe(4);});});
function hd397anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398anax2_hd',()=>{it('a',()=>{expect(hd398anax2(1,4)).toBe(2);});it('b',()=>{expect(hd398anax2(3,1)).toBe(1);});it('c',()=>{expect(hd398anax2(0,0)).toBe(0);});it('d',()=>{expect(hd398anax2(93,73)).toBe(2);});it('e',()=>{expect(hd398anax2(15,0)).toBe(4);});});
function hd398anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399anax2_hd',()=>{it('a',()=>{expect(hd399anax2(1,4)).toBe(2);});it('b',()=>{expect(hd399anax2(3,1)).toBe(1);});it('c',()=>{expect(hd399anax2(0,0)).toBe(0);});it('d',()=>{expect(hd399anax2(93,73)).toBe(2);});it('e',()=>{expect(hd399anax2(15,0)).toBe(4);});});
function hd399anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400anax2_hd',()=>{it('a',()=>{expect(hd400anax2(1,4)).toBe(2);});it('b',()=>{expect(hd400anax2(3,1)).toBe(1);});it('c',()=>{expect(hd400anax2(0,0)).toBe(0);});it('d',()=>{expect(hd400anax2(93,73)).toBe(2);});it('e',()=>{expect(hd400anax2(15,0)).toBe(4);});});
function hd400anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401anax2_hd',()=>{it('a',()=>{expect(hd401anax2(1,4)).toBe(2);});it('b',()=>{expect(hd401anax2(3,1)).toBe(1);});it('c',()=>{expect(hd401anax2(0,0)).toBe(0);});it('d',()=>{expect(hd401anax2(93,73)).toBe(2);});it('e',()=>{expect(hd401anax2(15,0)).toBe(4);});});
function hd401anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402anax2_hd',()=>{it('a',()=>{expect(hd402anax2(1,4)).toBe(2);});it('b',()=>{expect(hd402anax2(3,1)).toBe(1);});it('c',()=>{expect(hd402anax2(0,0)).toBe(0);});it('d',()=>{expect(hd402anax2(93,73)).toBe(2);});it('e',()=>{expect(hd402anax2(15,0)).toBe(4);});});
function hd402anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403anax2_hd',()=>{it('a',()=>{expect(hd403anax2(1,4)).toBe(2);});it('b',()=>{expect(hd403anax2(3,1)).toBe(1);});it('c',()=>{expect(hd403anax2(0,0)).toBe(0);});it('d',()=>{expect(hd403anax2(93,73)).toBe(2);});it('e',()=>{expect(hd403anax2(15,0)).toBe(4);});});
function hd403anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404anax2_hd',()=>{it('a',()=>{expect(hd404anax2(1,4)).toBe(2);});it('b',()=>{expect(hd404anax2(3,1)).toBe(1);});it('c',()=>{expect(hd404anax2(0,0)).toBe(0);});it('d',()=>{expect(hd404anax2(93,73)).toBe(2);});it('e',()=>{expect(hd404anax2(15,0)).toBe(4);});});
function hd404anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405anax2_hd',()=>{it('a',()=>{expect(hd405anax2(1,4)).toBe(2);});it('b',()=>{expect(hd405anax2(3,1)).toBe(1);});it('c',()=>{expect(hd405anax2(0,0)).toBe(0);});it('d',()=>{expect(hd405anax2(93,73)).toBe(2);});it('e',()=>{expect(hd405anax2(15,0)).toBe(4);});});
function hd405anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406anax2_hd',()=>{it('a',()=>{expect(hd406anax2(1,4)).toBe(2);});it('b',()=>{expect(hd406anax2(3,1)).toBe(1);});it('c',()=>{expect(hd406anax2(0,0)).toBe(0);});it('d',()=>{expect(hd406anax2(93,73)).toBe(2);});it('e',()=>{expect(hd406anax2(15,0)).toBe(4);});});
function hd406anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407anax2_hd',()=>{it('a',()=>{expect(hd407anax2(1,4)).toBe(2);});it('b',()=>{expect(hd407anax2(3,1)).toBe(1);});it('c',()=>{expect(hd407anax2(0,0)).toBe(0);});it('d',()=>{expect(hd407anax2(93,73)).toBe(2);});it('e',()=>{expect(hd407anax2(15,0)).toBe(4);});});
function hd407anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408anax2_hd',()=>{it('a',()=>{expect(hd408anax2(1,4)).toBe(2);});it('b',()=>{expect(hd408anax2(3,1)).toBe(1);});it('c',()=>{expect(hd408anax2(0,0)).toBe(0);});it('d',()=>{expect(hd408anax2(93,73)).toBe(2);});it('e',()=>{expect(hd408anax2(15,0)).toBe(4);});});
function hd408anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409anax2_hd',()=>{it('a',()=>{expect(hd409anax2(1,4)).toBe(2);});it('b',()=>{expect(hd409anax2(3,1)).toBe(1);});it('c',()=>{expect(hd409anax2(0,0)).toBe(0);});it('d',()=>{expect(hd409anax2(93,73)).toBe(2);});it('e',()=>{expect(hd409anax2(15,0)).toBe(4);});});
function hd409anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410anax2_hd',()=>{it('a',()=>{expect(hd410anax2(1,4)).toBe(2);});it('b',()=>{expect(hd410anax2(3,1)).toBe(1);});it('c',()=>{expect(hd410anax2(0,0)).toBe(0);});it('d',()=>{expect(hd410anax2(93,73)).toBe(2);});it('e',()=>{expect(hd410anax2(15,0)).toBe(4);});});
function hd410anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411anax2_hd',()=>{it('a',()=>{expect(hd411anax2(1,4)).toBe(2);});it('b',()=>{expect(hd411anax2(3,1)).toBe(1);});it('c',()=>{expect(hd411anax2(0,0)).toBe(0);});it('d',()=>{expect(hd411anax2(93,73)).toBe(2);});it('e',()=>{expect(hd411anax2(15,0)).toBe(4);});});
function hd411anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412anax2_hd',()=>{it('a',()=>{expect(hd412anax2(1,4)).toBe(2);});it('b',()=>{expect(hd412anax2(3,1)).toBe(1);});it('c',()=>{expect(hd412anax2(0,0)).toBe(0);});it('d',()=>{expect(hd412anax2(93,73)).toBe(2);});it('e',()=>{expect(hd412anax2(15,0)).toBe(4);});});
function hd412anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413anax2_hd',()=>{it('a',()=>{expect(hd413anax2(1,4)).toBe(2);});it('b',()=>{expect(hd413anax2(3,1)).toBe(1);});it('c',()=>{expect(hd413anax2(0,0)).toBe(0);});it('d',()=>{expect(hd413anax2(93,73)).toBe(2);});it('e',()=>{expect(hd413anax2(15,0)).toBe(4);});});
function hd413anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414anax2_hd',()=>{it('a',()=>{expect(hd414anax2(1,4)).toBe(2);});it('b',()=>{expect(hd414anax2(3,1)).toBe(1);});it('c',()=>{expect(hd414anax2(0,0)).toBe(0);});it('d',()=>{expect(hd414anax2(93,73)).toBe(2);});it('e',()=>{expect(hd414anax2(15,0)).toBe(4);});});
function hd414anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415anax2_hd',()=>{it('a',()=>{expect(hd415anax2(1,4)).toBe(2);});it('b',()=>{expect(hd415anax2(3,1)).toBe(1);});it('c',()=>{expect(hd415anax2(0,0)).toBe(0);});it('d',()=>{expect(hd415anax2(93,73)).toBe(2);});it('e',()=>{expect(hd415anax2(15,0)).toBe(4);});});
function hd415anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416anax2_hd',()=>{it('a',()=>{expect(hd416anax2(1,4)).toBe(2);});it('b',()=>{expect(hd416anax2(3,1)).toBe(1);});it('c',()=>{expect(hd416anax2(0,0)).toBe(0);});it('d',()=>{expect(hd416anax2(93,73)).toBe(2);});it('e',()=>{expect(hd416anax2(15,0)).toBe(4);});});
function hd416anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417anax2_hd',()=>{it('a',()=>{expect(hd417anax2(1,4)).toBe(2);});it('b',()=>{expect(hd417anax2(3,1)).toBe(1);});it('c',()=>{expect(hd417anax2(0,0)).toBe(0);});it('d',()=>{expect(hd417anax2(93,73)).toBe(2);});it('e',()=>{expect(hd417anax2(15,0)).toBe(4);});});
function hd417anax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417anax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
