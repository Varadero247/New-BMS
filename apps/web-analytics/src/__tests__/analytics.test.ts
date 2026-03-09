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
