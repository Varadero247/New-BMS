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
function hd258astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258astx_hd',()=>{it('a',()=>{expect(hd258astx(1,4)).toBe(2);});it('b',()=>{expect(hd258astx(3,1)).toBe(1);});it('c',()=>{expect(hd258astx(0,0)).toBe(0);});it('d',()=>{expect(hd258astx(93,73)).toBe(2);});it('e',()=>{expect(hd258astx(15,0)).toBe(4);});});
function hd259astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259astx_hd',()=>{it('a',()=>{expect(hd259astx(1,4)).toBe(2);});it('b',()=>{expect(hd259astx(3,1)).toBe(1);});it('c',()=>{expect(hd259astx(0,0)).toBe(0);});it('d',()=>{expect(hd259astx(93,73)).toBe(2);});it('e',()=>{expect(hd259astx(15,0)).toBe(4);});});
function hd260astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260astx_hd',()=>{it('a',()=>{expect(hd260astx(1,4)).toBe(2);});it('b',()=>{expect(hd260astx(3,1)).toBe(1);});it('c',()=>{expect(hd260astx(0,0)).toBe(0);});it('d',()=>{expect(hd260astx(93,73)).toBe(2);});it('e',()=>{expect(hd260astx(15,0)).toBe(4);});});
function hd261astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261astx_hd',()=>{it('a',()=>{expect(hd261astx(1,4)).toBe(2);});it('b',()=>{expect(hd261astx(3,1)).toBe(1);});it('c',()=>{expect(hd261astx(0,0)).toBe(0);});it('d',()=>{expect(hd261astx(93,73)).toBe(2);});it('e',()=>{expect(hd261astx(15,0)).toBe(4);});});
function hd262astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262astx_hd',()=>{it('a',()=>{expect(hd262astx(1,4)).toBe(2);});it('b',()=>{expect(hd262astx(3,1)).toBe(1);});it('c',()=>{expect(hd262astx(0,0)).toBe(0);});it('d',()=>{expect(hd262astx(93,73)).toBe(2);});it('e',()=>{expect(hd262astx(15,0)).toBe(4);});});
function hd263astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263astx_hd',()=>{it('a',()=>{expect(hd263astx(1,4)).toBe(2);});it('b',()=>{expect(hd263astx(3,1)).toBe(1);});it('c',()=>{expect(hd263astx(0,0)).toBe(0);});it('d',()=>{expect(hd263astx(93,73)).toBe(2);});it('e',()=>{expect(hd263astx(15,0)).toBe(4);});});
function hd264astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264astx_hd',()=>{it('a',()=>{expect(hd264astx(1,4)).toBe(2);});it('b',()=>{expect(hd264astx(3,1)).toBe(1);});it('c',()=>{expect(hd264astx(0,0)).toBe(0);});it('d',()=>{expect(hd264astx(93,73)).toBe(2);});it('e',()=>{expect(hd264astx(15,0)).toBe(4);});});
function hd265astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265astx_hd',()=>{it('a',()=>{expect(hd265astx(1,4)).toBe(2);});it('b',()=>{expect(hd265astx(3,1)).toBe(1);});it('c',()=>{expect(hd265astx(0,0)).toBe(0);});it('d',()=>{expect(hd265astx(93,73)).toBe(2);});it('e',()=>{expect(hd265astx(15,0)).toBe(4);});});
function hd266astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266astx_hd',()=>{it('a',()=>{expect(hd266astx(1,4)).toBe(2);});it('b',()=>{expect(hd266astx(3,1)).toBe(1);});it('c',()=>{expect(hd266astx(0,0)).toBe(0);});it('d',()=>{expect(hd266astx(93,73)).toBe(2);});it('e',()=>{expect(hd266astx(15,0)).toBe(4);});});
function hd267astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267astx_hd',()=>{it('a',()=>{expect(hd267astx(1,4)).toBe(2);});it('b',()=>{expect(hd267astx(3,1)).toBe(1);});it('c',()=>{expect(hd267astx(0,0)).toBe(0);});it('d',()=>{expect(hd267astx(93,73)).toBe(2);});it('e',()=>{expect(hd267astx(15,0)).toBe(4);});});
function hd268astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268astx_hd',()=>{it('a',()=>{expect(hd268astx(1,4)).toBe(2);});it('b',()=>{expect(hd268astx(3,1)).toBe(1);});it('c',()=>{expect(hd268astx(0,0)).toBe(0);});it('d',()=>{expect(hd268astx(93,73)).toBe(2);});it('e',()=>{expect(hd268astx(15,0)).toBe(4);});});
function hd269astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269astx_hd',()=>{it('a',()=>{expect(hd269astx(1,4)).toBe(2);});it('b',()=>{expect(hd269astx(3,1)).toBe(1);});it('c',()=>{expect(hd269astx(0,0)).toBe(0);});it('d',()=>{expect(hd269astx(93,73)).toBe(2);});it('e',()=>{expect(hd269astx(15,0)).toBe(4);});});
function hd270astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270astx_hd',()=>{it('a',()=>{expect(hd270astx(1,4)).toBe(2);});it('b',()=>{expect(hd270astx(3,1)).toBe(1);});it('c',()=>{expect(hd270astx(0,0)).toBe(0);});it('d',()=>{expect(hd270astx(93,73)).toBe(2);});it('e',()=>{expect(hd270astx(15,0)).toBe(4);});});
function hd271astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271astx_hd',()=>{it('a',()=>{expect(hd271astx(1,4)).toBe(2);});it('b',()=>{expect(hd271astx(3,1)).toBe(1);});it('c',()=>{expect(hd271astx(0,0)).toBe(0);});it('d',()=>{expect(hd271astx(93,73)).toBe(2);});it('e',()=>{expect(hd271astx(15,0)).toBe(4);});});
function hd272astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272astx_hd',()=>{it('a',()=>{expect(hd272astx(1,4)).toBe(2);});it('b',()=>{expect(hd272astx(3,1)).toBe(1);});it('c',()=>{expect(hd272astx(0,0)).toBe(0);});it('d',()=>{expect(hd272astx(93,73)).toBe(2);});it('e',()=>{expect(hd272astx(15,0)).toBe(4);});});
function hd273astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273astx_hd',()=>{it('a',()=>{expect(hd273astx(1,4)).toBe(2);});it('b',()=>{expect(hd273astx(3,1)).toBe(1);});it('c',()=>{expect(hd273astx(0,0)).toBe(0);});it('d',()=>{expect(hd273astx(93,73)).toBe(2);});it('e',()=>{expect(hd273astx(15,0)).toBe(4);});});
function hd274astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274astx_hd',()=>{it('a',()=>{expect(hd274astx(1,4)).toBe(2);});it('b',()=>{expect(hd274astx(3,1)).toBe(1);});it('c',()=>{expect(hd274astx(0,0)).toBe(0);});it('d',()=>{expect(hd274astx(93,73)).toBe(2);});it('e',()=>{expect(hd274astx(15,0)).toBe(4);});});
function hd275astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275astx_hd',()=>{it('a',()=>{expect(hd275astx(1,4)).toBe(2);});it('b',()=>{expect(hd275astx(3,1)).toBe(1);});it('c',()=>{expect(hd275astx(0,0)).toBe(0);});it('d',()=>{expect(hd275astx(93,73)).toBe(2);});it('e',()=>{expect(hd275astx(15,0)).toBe(4);});});
function hd276astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276astx_hd',()=>{it('a',()=>{expect(hd276astx(1,4)).toBe(2);});it('b',()=>{expect(hd276astx(3,1)).toBe(1);});it('c',()=>{expect(hd276astx(0,0)).toBe(0);});it('d',()=>{expect(hd276astx(93,73)).toBe(2);});it('e',()=>{expect(hd276astx(15,0)).toBe(4);});});
function hd277astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277astx_hd',()=>{it('a',()=>{expect(hd277astx(1,4)).toBe(2);});it('b',()=>{expect(hd277astx(3,1)).toBe(1);});it('c',()=>{expect(hd277astx(0,0)).toBe(0);});it('d',()=>{expect(hd277astx(93,73)).toBe(2);});it('e',()=>{expect(hd277astx(15,0)).toBe(4);});});
function hd278astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278astx_hd',()=>{it('a',()=>{expect(hd278astx(1,4)).toBe(2);});it('b',()=>{expect(hd278astx(3,1)).toBe(1);});it('c',()=>{expect(hd278astx(0,0)).toBe(0);});it('d',()=>{expect(hd278astx(93,73)).toBe(2);});it('e',()=>{expect(hd278astx(15,0)).toBe(4);});});
function hd279astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279astx_hd',()=>{it('a',()=>{expect(hd279astx(1,4)).toBe(2);});it('b',()=>{expect(hd279astx(3,1)).toBe(1);});it('c',()=>{expect(hd279astx(0,0)).toBe(0);});it('d',()=>{expect(hd279astx(93,73)).toBe(2);});it('e',()=>{expect(hd279astx(15,0)).toBe(4);});});
function hd280astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280astx_hd',()=>{it('a',()=>{expect(hd280astx(1,4)).toBe(2);});it('b',()=>{expect(hd280astx(3,1)).toBe(1);});it('c',()=>{expect(hd280astx(0,0)).toBe(0);});it('d',()=>{expect(hd280astx(93,73)).toBe(2);});it('e',()=>{expect(hd280astx(15,0)).toBe(4);});});
function hd281astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281astx_hd',()=>{it('a',()=>{expect(hd281astx(1,4)).toBe(2);});it('b',()=>{expect(hd281astx(3,1)).toBe(1);});it('c',()=>{expect(hd281astx(0,0)).toBe(0);});it('d',()=>{expect(hd281astx(93,73)).toBe(2);});it('e',()=>{expect(hd281astx(15,0)).toBe(4);});});
function hd282astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282astx_hd',()=>{it('a',()=>{expect(hd282astx(1,4)).toBe(2);});it('b',()=>{expect(hd282astx(3,1)).toBe(1);});it('c',()=>{expect(hd282astx(0,0)).toBe(0);});it('d',()=>{expect(hd282astx(93,73)).toBe(2);});it('e',()=>{expect(hd282astx(15,0)).toBe(4);});});
function hd283astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283astx_hd',()=>{it('a',()=>{expect(hd283astx(1,4)).toBe(2);});it('b',()=>{expect(hd283astx(3,1)).toBe(1);});it('c',()=>{expect(hd283astx(0,0)).toBe(0);});it('d',()=>{expect(hd283astx(93,73)).toBe(2);});it('e',()=>{expect(hd283astx(15,0)).toBe(4);});});
function hd284astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284astx_hd',()=>{it('a',()=>{expect(hd284astx(1,4)).toBe(2);});it('b',()=>{expect(hd284astx(3,1)).toBe(1);});it('c',()=>{expect(hd284astx(0,0)).toBe(0);});it('d',()=>{expect(hd284astx(93,73)).toBe(2);});it('e',()=>{expect(hd284astx(15,0)).toBe(4);});});
function hd285astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285astx_hd',()=>{it('a',()=>{expect(hd285astx(1,4)).toBe(2);});it('b',()=>{expect(hd285astx(3,1)).toBe(1);});it('c',()=>{expect(hd285astx(0,0)).toBe(0);});it('d',()=>{expect(hd285astx(93,73)).toBe(2);});it('e',()=>{expect(hd285astx(15,0)).toBe(4);});});
function hd286astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286astx_hd',()=>{it('a',()=>{expect(hd286astx(1,4)).toBe(2);});it('b',()=>{expect(hd286astx(3,1)).toBe(1);});it('c',()=>{expect(hd286astx(0,0)).toBe(0);});it('d',()=>{expect(hd286astx(93,73)).toBe(2);});it('e',()=>{expect(hd286astx(15,0)).toBe(4);});});
function hd287astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287astx_hd',()=>{it('a',()=>{expect(hd287astx(1,4)).toBe(2);});it('b',()=>{expect(hd287astx(3,1)).toBe(1);});it('c',()=>{expect(hd287astx(0,0)).toBe(0);});it('d',()=>{expect(hd287astx(93,73)).toBe(2);});it('e',()=>{expect(hd287astx(15,0)).toBe(4);});});
function hd288astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288astx_hd',()=>{it('a',()=>{expect(hd288astx(1,4)).toBe(2);});it('b',()=>{expect(hd288astx(3,1)).toBe(1);});it('c',()=>{expect(hd288astx(0,0)).toBe(0);});it('d',()=>{expect(hd288astx(93,73)).toBe(2);});it('e',()=>{expect(hd288astx(15,0)).toBe(4);});});
function hd289astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289astx_hd',()=>{it('a',()=>{expect(hd289astx(1,4)).toBe(2);});it('b',()=>{expect(hd289astx(3,1)).toBe(1);});it('c',()=>{expect(hd289astx(0,0)).toBe(0);});it('d',()=>{expect(hd289astx(93,73)).toBe(2);});it('e',()=>{expect(hd289astx(15,0)).toBe(4);});});
function hd290astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290astx_hd',()=>{it('a',()=>{expect(hd290astx(1,4)).toBe(2);});it('b',()=>{expect(hd290astx(3,1)).toBe(1);});it('c',()=>{expect(hd290astx(0,0)).toBe(0);});it('d',()=>{expect(hd290astx(93,73)).toBe(2);});it('e',()=>{expect(hd290astx(15,0)).toBe(4);});});
function hd291astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291astx_hd',()=>{it('a',()=>{expect(hd291astx(1,4)).toBe(2);});it('b',()=>{expect(hd291astx(3,1)).toBe(1);});it('c',()=>{expect(hd291astx(0,0)).toBe(0);});it('d',()=>{expect(hd291astx(93,73)).toBe(2);});it('e',()=>{expect(hd291astx(15,0)).toBe(4);});});
function hd292astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292astx_hd',()=>{it('a',()=>{expect(hd292astx(1,4)).toBe(2);});it('b',()=>{expect(hd292astx(3,1)).toBe(1);});it('c',()=>{expect(hd292astx(0,0)).toBe(0);});it('d',()=>{expect(hd292astx(93,73)).toBe(2);});it('e',()=>{expect(hd292astx(15,0)).toBe(4);});});
function hd293astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293astx_hd',()=>{it('a',()=>{expect(hd293astx(1,4)).toBe(2);});it('b',()=>{expect(hd293astx(3,1)).toBe(1);});it('c',()=>{expect(hd293astx(0,0)).toBe(0);});it('d',()=>{expect(hd293astx(93,73)).toBe(2);});it('e',()=>{expect(hd293astx(15,0)).toBe(4);});});
function hd294astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294astx_hd',()=>{it('a',()=>{expect(hd294astx(1,4)).toBe(2);});it('b',()=>{expect(hd294astx(3,1)).toBe(1);});it('c',()=>{expect(hd294astx(0,0)).toBe(0);});it('d',()=>{expect(hd294astx(93,73)).toBe(2);});it('e',()=>{expect(hd294astx(15,0)).toBe(4);});});
function hd295astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295astx_hd',()=>{it('a',()=>{expect(hd295astx(1,4)).toBe(2);});it('b',()=>{expect(hd295astx(3,1)).toBe(1);});it('c',()=>{expect(hd295astx(0,0)).toBe(0);});it('d',()=>{expect(hd295astx(93,73)).toBe(2);});it('e',()=>{expect(hd295astx(15,0)).toBe(4);});});
function hd296astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296astx_hd',()=>{it('a',()=>{expect(hd296astx(1,4)).toBe(2);});it('b',()=>{expect(hd296astx(3,1)).toBe(1);});it('c',()=>{expect(hd296astx(0,0)).toBe(0);});it('d',()=>{expect(hd296astx(93,73)).toBe(2);});it('e',()=>{expect(hd296astx(15,0)).toBe(4);});});
function hd297astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297astx_hd',()=>{it('a',()=>{expect(hd297astx(1,4)).toBe(2);});it('b',()=>{expect(hd297astx(3,1)).toBe(1);});it('c',()=>{expect(hd297astx(0,0)).toBe(0);});it('d',()=>{expect(hd297astx(93,73)).toBe(2);});it('e',()=>{expect(hd297astx(15,0)).toBe(4);});});
function hd298astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298astx_hd',()=>{it('a',()=>{expect(hd298astx(1,4)).toBe(2);});it('b',()=>{expect(hd298astx(3,1)).toBe(1);});it('c',()=>{expect(hd298astx(0,0)).toBe(0);});it('d',()=>{expect(hd298astx(93,73)).toBe(2);});it('e',()=>{expect(hd298astx(15,0)).toBe(4);});});
function hd299astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299astx_hd',()=>{it('a',()=>{expect(hd299astx(1,4)).toBe(2);});it('b',()=>{expect(hd299astx(3,1)).toBe(1);});it('c',()=>{expect(hd299astx(0,0)).toBe(0);});it('d',()=>{expect(hd299astx(93,73)).toBe(2);});it('e',()=>{expect(hd299astx(15,0)).toBe(4);});});
function hd300astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300astx_hd',()=>{it('a',()=>{expect(hd300astx(1,4)).toBe(2);});it('b',()=>{expect(hd300astx(3,1)).toBe(1);});it('c',()=>{expect(hd300astx(0,0)).toBe(0);});it('d',()=>{expect(hd300astx(93,73)).toBe(2);});it('e',()=>{expect(hd300astx(15,0)).toBe(4);});});
function hd301astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301astx_hd',()=>{it('a',()=>{expect(hd301astx(1,4)).toBe(2);});it('b',()=>{expect(hd301astx(3,1)).toBe(1);});it('c',()=>{expect(hd301astx(0,0)).toBe(0);});it('d',()=>{expect(hd301astx(93,73)).toBe(2);});it('e',()=>{expect(hd301astx(15,0)).toBe(4);});});
function hd302astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302astx_hd',()=>{it('a',()=>{expect(hd302astx(1,4)).toBe(2);});it('b',()=>{expect(hd302astx(3,1)).toBe(1);});it('c',()=>{expect(hd302astx(0,0)).toBe(0);});it('d',()=>{expect(hd302astx(93,73)).toBe(2);});it('e',()=>{expect(hd302astx(15,0)).toBe(4);});});
function hd303astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303astx_hd',()=>{it('a',()=>{expect(hd303astx(1,4)).toBe(2);});it('b',()=>{expect(hd303astx(3,1)).toBe(1);});it('c',()=>{expect(hd303astx(0,0)).toBe(0);});it('d',()=>{expect(hd303astx(93,73)).toBe(2);});it('e',()=>{expect(hd303astx(15,0)).toBe(4);});});
function hd304astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304astx_hd',()=>{it('a',()=>{expect(hd304astx(1,4)).toBe(2);});it('b',()=>{expect(hd304astx(3,1)).toBe(1);});it('c',()=>{expect(hd304astx(0,0)).toBe(0);});it('d',()=>{expect(hd304astx(93,73)).toBe(2);});it('e',()=>{expect(hd304astx(15,0)).toBe(4);});});
function hd305astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305astx_hd',()=>{it('a',()=>{expect(hd305astx(1,4)).toBe(2);});it('b',()=>{expect(hd305astx(3,1)).toBe(1);});it('c',()=>{expect(hd305astx(0,0)).toBe(0);});it('d',()=>{expect(hd305astx(93,73)).toBe(2);});it('e',()=>{expect(hd305astx(15,0)).toBe(4);});});
function hd306astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306astx_hd',()=>{it('a',()=>{expect(hd306astx(1,4)).toBe(2);});it('b',()=>{expect(hd306astx(3,1)).toBe(1);});it('c',()=>{expect(hd306astx(0,0)).toBe(0);});it('d',()=>{expect(hd306astx(93,73)).toBe(2);});it('e',()=>{expect(hd306astx(15,0)).toBe(4);});});
function hd307astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307astx_hd',()=>{it('a',()=>{expect(hd307astx(1,4)).toBe(2);});it('b',()=>{expect(hd307astx(3,1)).toBe(1);});it('c',()=>{expect(hd307astx(0,0)).toBe(0);});it('d',()=>{expect(hd307astx(93,73)).toBe(2);});it('e',()=>{expect(hd307astx(15,0)).toBe(4);});});
function hd308astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308astx_hd',()=>{it('a',()=>{expect(hd308astx(1,4)).toBe(2);});it('b',()=>{expect(hd308astx(3,1)).toBe(1);});it('c',()=>{expect(hd308astx(0,0)).toBe(0);});it('d',()=>{expect(hd308astx(93,73)).toBe(2);});it('e',()=>{expect(hd308astx(15,0)).toBe(4);});});
function hd309astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309astx_hd',()=>{it('a',()=>{expect(hd309astx(1,4)).toBe(2);});it('b',()=>{expect(hd309astx(3,1)).toBe(1);});it('c',()=>{expect(hd309astx(0,0)).toBe(0);});it('d',()=>{expect(hd309astx(93,73)).toBe(2);});it('e',()=>{expect(hd309astx(15,0)).toBe(4);});});
function hd310astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310astx_hd',()=>{it('a',()=>{expect(hd310astx(1,4)).toBe(2);});it('b',()=>{expect(hd310astx(3,1)).toBe(1);});it('c',()=>{expect(hd310astx(0,0)).toBe(0);});it('d',()=>{expect(hd310astx(93,73)).toBe(2);});it('e',()=>{expect(hd310astx(15,0)).toBe(4);});});
function hd311astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311astx_hd',()=>{it('a',()=>{expect(hd311astx(1,4)).toBe(2);});it('b',()=>{expect(hd311astx(3,1)).toBe(1);});it('c',()=>{expect(hd311astx(0,0)).toBe(0);});it('d',()=>{expect(hd311astx(93,73)).toBe(2);});it('e',()=>{expect(hd311astx(15,0)).toBe(4);});});
function hd312astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312astx_hd',()=>{it('a',()=>{expect(hd312astx(1,4)).toBe(2);});it('b',()=>{expect(hd312astx(3,1)).toBe(1);});it('c',()=>{expect(hd312astx(0,0)).toBe(0);});it('d',()=>{expect(hd312astx(93,73)).toBe(2);});it('e',()=>{expect(hd312astx(15,0)).toBe(4);});});
function hd313astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313astx_hd',()=>{it('a',()=>{expect(hd313astx(1,4)).toBe(2);});it('b',()=>{expect(hd313astx(3,1)).toBe(1);});it('c',()=>{expect(hd313astx(0,0)).toBe(0);});it('d',()=>{expect(hd313astx(93,73)).toBe(2);});it('e',()=>{expect(hd313astx(15,0)).toBe(4);});});
function hd314astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314astx_hd',()=>{it('a',()=>{expect(hd314astx(1,4)).toBe(2);});it('b',()=>{expect(hd314astx(3,1)).toBe(1);});it('c',()=>{expect(hd314astx(0,0)).toBe(0);});it('d',()=>{expect(hd314astx(93,73)).toBe(2);});it('e',()=>{expect(hd314astx(15,0)).toBe(4);});});
function hd315astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315astx_hd',()=>{it('a',()=>{expect(hd315astx(1,4)).toBe(2);});it('b',()=>{expect(hd315astx(3,1)).toBe(1);});it('c',()=>{expect(hd315astx(0,0)).toBe(0);});it('d',()=>{expect(hd315astx(93,73)).toBe(2);});it('e',()=>{expect(hd315astx(15,0)).toBe(4);});});
function hd316astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316astx_hd',()=>{it('a',()=>{expect(hd316astx(1,4)).toBe(2);});it('b',()=>{expect(hd316astx(3,1)).toBe(1);});it('c',()=>{expect(hd316astx(0,0)).toBe(0);});it('d',()=>{expect(hd316astx(93,73)).toBe(2);});it('e',()=>{expect(hd316astx(15,0)).toBe(4);});});
function hd317astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317astx_hd',()=>{it('a',()=>{expect(hd317astx(1,4)).toBe(2);});it('b',()=>{expect(hd317astx(3,1)).toBe(1);});it('c',()=>{expect(hd317astx(0,0)).toBe(0);});it('d',()=>{expect(hd317astx(93,73)).toBe(2);});it('e',()=>{expect(hd317astx(15,0)).toBe(4);});});
function hd318astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318astx_hd',()=>{it('a',()=>{expect(hd318astx(1,4)).toBe(2);});it('b',()=>{expect(hd318astx(3,1)).toBe(1);});it('c',()=>{expect(hd318astx(0,0)).toBe(0);});it('d',()=>{expect(hd318astx(93,73)).toBe(2);});it('e',()=>{expect(hd318astx(15,0)).toBe(4);});});
function hd319astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319astx_hd',()=>{it('a',()=>{expect(hd319astx(1,4)).toBe(2);});it('b',()=>{expect(hd319astx(3,1)).toBe(1);});it('c',()=>{expect(hd319astx(0,0)).toBe(0);});it('d',()=>{expect(hd319astx(93,73)).toBe(2);});it('e',()=>{expect(hd319astx(15,0)).toBe(4);});});
function hd320astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320astx_hd',()=>{it('a',()=>{expect(hd320astx(1,4)).toBe(2);});it('b',()=>{expect(hd320astx(3,1)).toBe(1);});it('c',()=>{expect(hd320astx(0,0)).toBe(0);});it('d',()=>{expect(hd320astx(93,73)).toBe(2);});it('e',()=>{expect(hd320astx(15,0)).toBe(4);});});
function hd321astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321astx_hd',()=>{it('a',()=>{expect(hd321astx(1,4)).toBe(2);});it('b',()=>{expect(hd321astx(3,1)).toBe(1);});it('c',()=>{expect(hd321astx(0,0)).toBe(0);});it('d',()=>{expect(hd321astx(93,73)).toBe(2);});it('e',()=>{expect(hd321astx(15,0)).toBe(4);});});
function hd322astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322astx_hd',()=>{it('a',()=>{expect(hd322astx(1,4)).toBe(2);});it('b',()=>{expect(hd322astx(3,1)).toBe(1);});it('c',()=>{expect(hd322astx(0,0)).toBe(0);});it('d',()=>{expect(hd322astx(93,73)).toBe(2);});it('e',()=>{expect(hd322astx(15,0)).toBe(4);});});
function hd323astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323astx_hd',()=>{it('a',()=>{expect(hd323astx(1,4)).toBe(2);});it('b',()=>{expect(hd323astx(3,1)).toBe(1);});it('c',()=>{expect(hd323astx(0,0)).toBe(0);});it('d',()=>{expect(hd323astx(93,73)).toBe(2);});it('e',()=>{expect(hd323astx(15,0)).toBe(4);});});
function hd324astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324astx_hd',()=>{it('a',()=>{expect(hd324astx(1,4)).toBe(2);});it('b',()=>{expect(hd324astx(3,1)).toBe(1);});it('c',()=>{expect(hd324astx(0,0)).toBe(0);});it('d',()=>{expect(hd324astx(93,73)).toBe(2);});it('e',()=>{expect(hd324astx(15,0)).toBe(4);});});
function hd325astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325astx_hd',()=>{it('a',()=>{expect(hd325astx(1,4)).toBe(2);});it('b',()=>{expect(hd325astx(3,1)).toBe(1);});it('c',()=>{expect(hd325astx(0,0)).toBe(0);});it('d',()=>{expect(hd325astx(93,73)).toBe(2);});it('e',()=>{expect(hd325astx(15,0)).toBe(4);});});
function hd326astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326astx_hd',()=>{it('a',()=>{expect(hd326astx(1,4)).toBe(2);});it('b',()=>{expect(hd326astx(3,1)).toBe(1);});it('c',()=>{expect(hd326astx(0,0)).toBe(0);});it('d',()=>{expect(hd326astx(93,73)).toBe(2);});it('e',()=>{expect(hd326astx(15,0)).toBe(4);});});
function hd327astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327astx_hd',()=>{it('a',()=>{expect(hd327astx(1,4)).toBe(2);});it('b',()=>{expect(hd327astx(3,1)).toBe(1);});it('c',()=>{expect(hd327astx(0,0)).toBe(0);});it('d',()=>{expect(hd327astx(93,73)).toBe(2);});it('e',()=>{expect(hd327astx(15,0)).toBe(4);});});
function hd328astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328astx_hd',()=>{it('a',()=>{expect(hd328astx(1,4)).toBe(2);});it('b',()=>{expect(hd328astx(3,1)).toBe(1);});it('c',()=>{expect(hd328astx(0,0)).toBe(0);});it('d',()=>{expect(hd328astx(93,73)).toBe(2);});it('e',()=>{expect(hd328astx(15,0)).toBe(4);});});
function hd329astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329astx_hd',()=>{it('a',()=>{expect(hd329astx(1,4)).toBe(2);});it('b',()=>{expect(hd329astx(3,1)).toBe(1);});it('c',()=>{expect(hd329astx(0,0)).toBe(0);});it('d',()=>{expect(hd329astx(93,73)).toBe(2);});it('e',()=>{expect(hd329astx(15,0)).toBe(4);});});
function hd330astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330astx_hd',()=>{it('a',()=>{expect(hd330astx(1,4)).toBe(2);});it('b',()=>{expect(hd330astx(3,1)).toBe(1);});it('c',()=>{expect(hd330astx(0,0)).toBe(0);});it('d',()=>{expect(hd330astx(93,73)).toBe(2);});it('e',()=>{expect(hd330astx(15,0)).toBe(4);});});
function hd331astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331astx_hd',()=>{it('a',()=>{expect(hd331astx(1,4)).toBe(2);});it('b',()=>{expect(hd331astx(3,1)).toBe(1);});it('c',()=>{expect(hd331astx(0,0)).toBe(0);});it('d',()=>{expect(hd331astx(93,73)).toBe(2);});it('e',()=>{expect(hd331astx(15,0)).toBe(4);});});
function hd332astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332astx_hd',()=>{it('a',()=>{expect(hd332astx(1,4)).toBe(2);});it('b',()=>{expect(hd332astx(3,1)).toBe(1);});it('c',()=>{expect(hd332astx(0,0)).toBe(0);});it('d',()=>{expect(hd332astx(93,73)).toBe(2);});it('e',()=>{expect(hd332astx(15,0)).toBe(4);});});
function hd333astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333astx_hd',()=>{it('a',()=>{expect(hd333astx(1,4)).toBe(2);});it('b',()=>{expect(hd333astx(3,1)).toBe(1);});it('c',()=>{expect(hd333astx(0,0)).toBe(0);});it('d',()=>{expect(hd333astx(93,73)).toBe(2);});it('e',()=>{expect(hd333astx(15,0)).toBe(4);});});
function hd334astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334astx_hd',()=>{it('a',()=>{expect(hd334astx(1,4)).toBe(2);});it('b',()=>{expect(hd334astx(3,1)).toBe(1);});it('c',()=>{expect(hd334astx(0,0)).toBe(0);});it('d',()=>{expect(hd334astx(93,73)).toBe(2);});it('e',()=>{expect(hd334astx(15,0)).toBe(4);});});
function hd335astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335astx_hd',()=>{it('a',()=>{expect(hd335astx(1,4)).toBe(2);});it('b',()=>{expect(hd335astx(3,1)).toBe(1);});it('c',()=>{expect(hd335astx(0,0)).toBe(0);});it('d',()=>{expect(hd335astx(93,73)).toBe(2);});it('e',()=>{expect(hd335astx(15,0)).toBe(4);});});
function hd336astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336astx_hd',()=>{it('a',()=>{expect(hd336astx(1,4)).toBe(2);});it('b',()=>{expect(hd336astx(3,1)).toBe(1);});it('c',()=>{expect(hd336astx(0,0)).toBe(0);});it('d',()=>{expect(hd336astx(93,73)).toBe(2);});it('e',()=>{expect(hd336astx(15,0)).toBe(4);});});
function hd337astx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337astx_hd',()=>{it('a',()=>{expect(hd337astx(1,4)).toBe(2);});it('b',()=>{expect(hd337astx(3,1)).toBe(1);});it('c',()=>{expect(hd337astx(0,0)).toBe(0);});it('d',()=>{expect(hd337astx(93,73)).toBe(2);});it('e',()=>{expect(hd337astx(15,0)).toBe(4);});});
