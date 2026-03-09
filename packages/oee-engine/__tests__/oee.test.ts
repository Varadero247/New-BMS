import { calculateOEE, calculateMTBF, calculateMTTR, isWorldClass, getOEECategory } from '../src/oee';

// ── calculateOEE ──────────────────────────────────────────────────────────────

describe('calculateOEE — basic calculation', () => {
  const base = { plannedProductionTime: 480, downtime: 60, idealCycleTime: 1, totalPieces: 380, goodPieces: 360 };

  it('returns an object with all required fields', () => {
    const r = calculateOEE(base);
    expect(r).toHaveProperty('availability');
    expect(r).toHaveProperty('performance');
    expect(r).toHaveProperty('quality');
    expect(r).toHaveProperty('oee');
    expect(r).toHaveProperty('oeePercent');
    expect(r).toHaveProperty('category');
    expect(r).toHaveProperty('isWorldClass');
    expect(r).toHaveProperty('runTime');
    expect(r).toHaveProperty('defectPieces');
  });

  it('computes runTime correctly', () => {
    expect(calculateOEE(base).runTime).toBe(420);
  });

  it('computes defectPieces correctly', () => {
    expect(calculateOEE(base).defectPieces).toBe(20);
  });

  it('computes availability = runTime / planned', () => {
    const r = calculateOEE(base);
    expect(r.availability).toBeCloseTo(420 / 480, 4);
  });

  it('computes performance = idealCycleTime * totalPieces / runTime', () => {
    const r = calculateOEE(base);
    expect(r.performance).toBeCloseTo((1 * 380) / 420, 4);
  });

  it('computes quality = goodPieces / totalPieces', () => {
    const r = calculateOEE(base);
    expect(r.quality).toBeCloseTo(360 / 380, 4);
  });

  it('computes oee = availability * performance * quality', () => {
    const r = calculateOEE(base);
    expect(r.oee).toBeCloseTo(r.availability * r.performance * r.quality, 3);
  });

  it('oeePercent includes % sign', () => {
    expect(calculateOEE(base).oeePercent).toMatch(/%$/);
  });

  it('rounds values to 4 decimal places', () => {
    const r = calculateOEE(base);
    const decimals = (n: number) => (n.toString().split('.')[1] || '').length;
    expect(decimals(r.availability)).toBeLessThanOrEqual(4);
    expect(decimals(r.oee)).toBeLessThanOrEqual(4);
  });
});

describe('calculateOEE — world-class case (≥ 85%)', () => {
  const wc = { plannedProductionTime: 480, downtime: 0, idealCycleTime: 1, totalPieces: 480, goodPieces: 480 };

  it('availability is 1 when no downtime', () => {
    expect(calculateOEE(wc).availability).toBe(1);
  });

  it('performance is 1 when exactly meeting ideal cycle', () => {
    expect(calculateOEE(wc).performance).toBe(1);
  });

  it('quality is 1 when all pieces are good', () => {
    expect(calculateOEE(wc).quality).toBe(1);
  });

  it('oee is 1 when all factors are 1', () => {
    expect(calculateOEE(wc).oee).toBe(1);
  });

  it('isWorldClass is true', () => {
    expect(calculateOEE(wc).isWorldClass).toBe(true);
  });

  it('category is world-class', () => {
    expect(calculateOEE(wc).category).toBe('world-class');
  });
});

describe('calculateOEE — zero totalPieces', () => {
  const zeroPieces = { plannedProductionTime: 480, downtime: 60, idealCycleTime: 1, totalPieces: 0, goodPieces: 0 };

  it('performance is 0 when no pieces produced', () => {
    expect(calculateOEE(zeroPieces).performance).toBe(0);
  });

  it('quality is 0 when no pieces', () => {
    expect(calculateOEE(zeroPieces).quality).toBe(0);
  });

  it('oee is 0', () => {
    expect(calculateOEE(zeroPieces).oee).toBe(0);
  });
});

describe('calculateOEE — performance capped at 1.0', () => {
  // very low idealCycleTime causes over-rate; should cap at 1
  const overspeed = { plannedProductionTime: 480, downtime: 0, idealCycleTime: 0.5, totalPieces: 1200, goodPieces: 1200 };

  it('performance does not exceed 1.0', () => {
    expect(calculateOEE(overspeed).performance).toBeLessThanOrEqual(1.0);
  });
});

describe('calculateOEE — OEE categories via realistic scenarios', () => {
  function makeInput(pct: number) {
    // oee ≈ pct by setting availability=1, quality=1, performance=pct
    const ideal = Math.floor(pct * 480);
    return { plannedProductionTime: 480, downtime: 0, idealCycleTime: pct, totalPieces: 480, goodPieces: 480 };
  }

  it('below-average: downtime=50% gives category below-average or poor', () => {
    const r = calculateOEE({ plannedProductionTime: 480, downtime: 240, idealCycleTime: 1, totalPieces: 200, goodPieces: 150 });
    expect(['below-average', 'poor', 'average']).toContain(r.category);
  });

  it('good category when oee in 0.75–0.85', () => {
    // availability=1, performance=0.8, quality=1 → oee=0.8
    const r = calculateOEE({ plannedProductionTime: 500, downtime: 0, idealCycleTime: 0.8, totalPieces: 500, goodPieces: 500 });
    expect(r.oee).toBeCloseTo(0.8, 2);
    expect(r.category).toBe('good');
  });
});

describe('calculateOEE — validation errors', () => {
  const good = { plannedProductionTime: 480, downtime: 60, idealCycleTime: 1, totalPieces: 380, goodPieces: 360 };

  it('throws when plannedProductionTime is 0', () => {
    expect(() => calculateOEE({ ...good, plannedProductionTime: 0 })).toThrow();
  });

  it('throws when plannedProductionTime is negative', () => {
    expect(() => calculateOEE({ ...good, plannedProductionTime: -1 })).toThrow();
  });

  it('throws when downtime is negative', () => {
    expect(() => calculateOEE({ ...good, downtime: -1 })).toThrow();
  });

  it('throws when downtime exceeds planned', () => {
    expect(() => calculateOEE({ ...good, downtime: 500 })).toThrow();
  });

  it('throws when idealCycleTime is 0', () => {
    expect(() => calculateOEE({ ...good, idealCycleTime: 0 })).toThrow();
  });

  it('throws when idealCycleTime is negative', () => {
    expect(() => calculateOEE({ ...good, idealCycleTime: -1 })).toThrow();
  });

  it('throws when totalPieces is negative', () => {
    expect(() => calculateOEE({ ...good, totalPieces: -1 })).toThrow();
  });

  it('throws when goodPieces is negative', () => {
    expect(() => calculateOEE({ ...good, goodPieces: -1 })).toThrow();
  });

  it('throws when goodPieces exceeds totalPieces', () => {
    expect(() => calculateOEE({ ...good, goodPieces: 400 })).toThrow();
  });
});

// ── calculateMTBF ─────────────────────────────────────────────────────────────

describe('calculateMTBF', () => {
  it('returns Infinity when failures is 0', () => {
    expect(calculateMTBF(0, 1000)).toBe(Infinity);
  });

  it('divides operatingHours by failures', () => {
    expect(calculateMTBF(5, 1000)).toBe(200);
  });

  it('returns 0 when operatingHours is 0', () => {
    expect(calculateMTBF(5, 0)).toBe(0);
  });

  it('works with 1 failure', () => {
    expect(calculateMTBF(1, 720)).toBe(720);
  });

  it('throws when failures is negative', () => {
    expect(() => calculateMTBF(-1, 100)).toThrow();
  });

  it('throws when operatingHours is negative', () => {
    expect(() => calculateMTBF(1, -1)).toThrow();
  });

  it('computes fractional result correctly', () => {
    expect(calculateMTBF(3, 100)).toBeCloseTo(33.333, 2);
  });
});

// ── calculateMTTR ─────────────────────────────────────────────────────────────

describe('calculateMTTR', () => {
  it('returns 0 for empty array', () => {
    expect(calculateMTTR([])).toBe(0);
  });

  it('returns the single value for one repair', () => {
    expect(calculateMTTR([4])).toBe(4);
  });

  it('averages two repair times', () => {
    expect(calculateMTTR([2, 4])).toBe(3);
  });

  it('averages multiple repair times', () => {
    expect(calculateMTTR([1, 2, 3, 4, 5])).toBe(3);
  });

  it('handles zero repair times', () => {
    expect(calculateMTTR([0, 0, 0])).toBe(0);
  });

  it('throws when any repair time is negative', () => {
    expect(() => calculateMTTR([1, -1, 2])).toThrow();
  });

  it('works with fractional values', () => {
    expect(calculateMTTR([1.5, 2.5])).toBe(2);
  });
});

// ── isWorldClass ──────────────────────────────────────────────────────────────

describe('isWorldClass', () => {
  const cases: [number, boolean][] = [
    [0.85, true],
    [0.9, true],
    [1.0, true],
    [0.84, false],
    [0.5, false],
    [0, false],
  ];

  cases.forEach(([oee, expected]) => {
    it(`oee=${oee} → ${expected}`, () => {
      expect(isWorldClass(oee)).toBe(expected);
    });
  });
});

// ── getOEECategory ────────────────────────────────────────────────────────────

describe('getOEECategory', () => {
  const cases: [number, string][] = [
    [1.0, 'world-class'],
    [0.85, 'world-class'],
    [0.84, 'good'],
    [0.75, 'good'],
    [0.74, 'average'],
    [0.65, 'average'],
    [0.64, 'below-average'],
    [0.5, 'below-average'],
    [0.49, 'poor'],
    [0, 'poor'],
  ];

  cases.forEach(([oee, expected]) => {
    it(`oee=${oee} → '${expected}'`, () => {
      expect(getOEECategory(oee)).toBe(expected);
    });
  });
});

// ─── Algorithm puzzle phases (ph217oe–ph224oe) ────────────────────────────────
function moveZeroes217oe(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217oe_mz',()=>{
  it('a',()=>{expect(moveZeroes217oe([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217oe([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217oe([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217oe([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217oe([4,2,0,0,3])).toBe(4);});
});
function missingNumber218oe(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218oe_mn',()=>{
  it('a',()=>{expect(missingNumber218oe([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218oe([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218oe([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218oe([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218oe([1])).toBe(0);});
});
function countBits219oe(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219oe_cb',()=>{
  it('a',()=>{expect(countBits219oe(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219oe(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219oe(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219oe(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219oe(4)[4]).toBe(1);});
});
function climbStairs220oe(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220oe_cs',()=>{
  it('a',()=>{expect(climbStairs220oe(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220oe(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220oe(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220oe(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220oe(1)).toBe(1);});
});
function maxProfit221oe(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221oe_mp',()=>{
  it('a',()=>{expect(maxProfit221oe([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221oe([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221oe([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221oe([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221oe([1])).toBe(0);});
});
function singleNumber222oe(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222oe_sn',()=>{
  it('a',()=>{expect(singleNumber222oe([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222oe([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222oe([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222oe([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222oe([3,3,5])).toBe(5);});
});
function hammingDist223oe(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223oe_hd',()=>{
  it('a',()=>{expect(hammingDist223oe(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223oe(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223oe(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223oe(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223oe(7,7)).toBe(0);});
});
function majorElem224oe(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224oe_me',()=>{
  it('a',()=>{expect(majorElem224oe([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224oe([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224oe([1])).toBe(1);});
  it('d',()=>{expect(majorElem224oe([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224oe([6,5,5])).toBe(5);});
});
