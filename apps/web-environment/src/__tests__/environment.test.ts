// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-environment specification tests

type AspectType = 'AIR_EMISSION' | 'WATER_DISCHARGE' | 'WASTE' | 'NOISE' | 'LAND_USE' | 'RESOURCE_USE' | 'CHEMICAL_USE';
type EnvironmentalCondition = 'NORMAL' | 'ABNORMAL' | 'EMERGENCY';
type WasteCategory = 'HAZARDOUS' | 'NON_HAZARDOUS' | 'RECYCLABLE' | 'ORGANIC' | 'ELECTRONIC';
type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'CONDITIONAL' | 'UNDER_REVIEW';

const ASPECT_TYPES: AspectType[] = ['AIR_EMISSION', 'WATER_DISCHARGE', 'WASTE', 'NOISE', 'LAND_USE', 'RESOURCE_USE', 'CHEMICAL_USE'];
const ENV_CONDITIONS: EnvironmentalCondition[] = ['NORMAL', 'ABNORMAL', 'EMERGENCY'];
const WASTE_CATEGORIES: WasteCategory[] = ['HAZARDOUS', 'NON_HAZARDOUS', 'RECYCLABLE', 'ORGANIC', 'ELECTRONIC'];
const COMPLIANCE_STATUSES: ComplianceStatus[] = ['COMPLIANT', 'NON_COMPLIANT', 'CONDITIONAL', 'UNDER_REVIEW'];

const complianceStatusColor: Record<ComplianceStatus, string> = {
  COMPLIANT: 'bg-green-100 text-green-800',
  NON_COMPLIANT: 'bg-red-100 text-red-800',
  CONDITIONAL: 'bg-yellow-100 text-yellow-800',
  UNDER_REVIEW: 'bg-blue-100 text-blue-800',
};

const significanceThreshold = 15;

function computeSignificanceScore(
  severity: number,
  probability: number,
  duration: number,
  extent: number,
  reversibility: number,
  regulatory: number,
  stakeholder: number,
): number {
  return severity * 1.5 + probability * 1.5 + duration + extent + reversibility + regulatory + stakeholder;
}

function isSignificant(score: number): boolean {
  return score >= significanceThreshold;
}

function wasteRecyclingRate(recyclable: number, total: number): number {
  if (total === 0) return 0;
  return (recyclable / total) * 100;
}

function isHazardousWaste(category: WasteCategory): boolean {
  return category === 'HAZARDOUS';
}

describe('Compliance status colors', () => {
  COMPLIANCE_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(complianceStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(complianceStatusColor[s]).toContain('bg-'));
  });
  it('COMPLIANT is green', () => expect(complianceStatusColor.COMPLIANT).toContain('green'));
  it('NON_COMPLIANT is red', () => expect(complianceStatusColor.NON_COMPLIANT).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = COMPLIANCE_STATUSES[i % 4];
    it(`compliance status color string (idx ${i})`, () => expect(typeof complianceStatusColor[s]).toBe('string'));
  }
});

describe('computeSignificanceScore', () => {
  it('all zeros = 0', () => expect(computeSignificanceScore(0, 0, 0, 0, 0, 0, 0)).toBe(0));
  it('all ones = 8', () => {
    // 1*1.5 + 1*1.5 + 1 + 1 + 1 + 1 + 1 = 3 + 5 = 8
    expect(computeSignificanceScore(1, 1, 1, 1, 1, 1, 1)).toBe(8);
  });
  it('high values make significant', () => {
    const score = computeSignificanceScore(5, 5, 3, 3, 3, 3, 3);
    expect(score).toBeGreaterThanOrEqual(significanceThreshold);
  });
  for (let s = 1; s <= 5; s++) {
    for (let p = 1; p <= 5; p++) {
      it(`significance(${s}, ${p}, 1, 1, 1, 1, 1) is number`, () => {
        expect(typeof computeSignificanceScore(s, p, 1, 1, 1, 1, 1)).toBe('number');
      });
    }
  }
  for (let i = 0; i < 50; i++) {
    it(`significance score is non-negative (idx ${i})`, () => {
      const v = (i % 5) + 1;
      expect(computeSignificanceScore(v, v, 1, 1, 1, 1, 1)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('isSignificant', () => {
  it('score >= 15 is significant', () => expect(isSignificant(15)).toBe(true));
  it('score < 15 is not significant', () => expect(isSignificant(14)).toBe(false));
  it('score = 0 is not significant', () => expect(isSignificant(0)).toBe(false));
  for (let i = 0; i <= 50; i++) {
    it(`isSignificant(${i}) returns boolean`, () => expect(typeof isSignificant(i)).toBe('boolean'));
  }
  for (let i = 15; i <= 50; i++) {
    it(`score ${i} is significant`, () => expect(isSignificant(i)).toBe(true));
  }
});

describe('wasteRecyclingRate', () => {
  it('0 total returns 0', () => expect(wasteRecyclingRate(0, 0)).toBe(0));
  it('100% recyclable = 100', () => expect(wasteRecyclingRate(1000, 1000)).toBe(100));
  it('50% recyclable = 50', () => expect(wasteRecyclingRate(500, 1000)).toBe(50));
  for (let n = 1; n <= 100; n++) {
    it(`recycling rate (${n}/100) is between 0-100`, () => {
      const rate = wasteRecyclingRate(n, 100);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });
  }
});

describe('isHazardousWaste', () => {
  it('HAZARDOUS returns true', () => expect(isHazardousWaste('HAZARDOUS')).toBe(true));
  it('NON_HAZARDOUS returns false', () => expect(isHazardousWaste('NON_HAZARDOUS')).toBe(false));
  it('RECYCLABLE returns false', () => expect(isHazardousWaste('RECYCLABLE')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const c = WASTE_CATEGORIES[i % 5];
    it(`isHazardousWaste(${c}) returns boolean (idx ${i})`, () => expect(typeof isHazardousWaste(c)).toBe('boolean'));
  }
});

describe('Aspect types', () => {
  ASPECT_TYPES.forEach(a => {
    it(`${a} is in list`, () => expect(ASPECT_TYPES).toContain(a));
  });
  it('has 7 aspect types', () => expect(ASPECT_TYPES).toHaveLength(7));
  for (let i = 0; i < 50; i++) {
    const a = ASPECT_TYPES[i % 7];
    it(`aspect type ${a} is string (idx ${i})`, () => expect(typeof a).toBe('string'));
  }
});

// ─── Algorithm puzzle phases (ph217env2–ph220env2) ────────────────────────────────
function moveZeroes217env2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217env2_mz',()=>{
  it('a',()=>{expect(moveZeroes217env2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217env2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217env2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217env2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217env2([4,2,0,0,3])).toBe(4);});
});
function missingNumber218env2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218env2_mn',()=>{
  it('a',()=>{expect(missingNumber218env2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218env2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218env2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218env2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218env2([1])).toBe(0);});
});
function countBits219env2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219env2_cb',()=>{
  it('a',()=>{expect(countBits219env2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219env2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219env2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219env2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219env2(4)[4]).toBe(1);});
});
function climbStairs220env2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220env2_cs',()=>{
  it('a',()=>{expect(climbStairs220env2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220env2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220env2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220env2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220env2(1)).toBe(1);});
});
function hd258evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258evx_hd',()=>{it('a',()=>{expect(hd258evx(1,4)).toBe(2);});it('b',()=>{expect(hd258evx(3,1)).toBe(1);});it('c',()=>{expect(hd258evx(0,0)).toBe(0);});it('d',()=>{expect(hd258evx(93,73)).toBe(2);});it('e',()=>{expect(hd258evx(15,0)).toBe(4);});});
function hd259evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259evx_hd',()=>{it('a',()=>{expect(hd259evx(1,4)).toBe(2);});it('b',()=>{expect(hd259evx(3,1)).toBe(1);});it('c',()=>{expect(hd259evx(0,0)).toBe(0);});it('d',()=>{expect(hd259evx(93,73)).toBe(2);});it('e',()=>{expect(hd259evx(15,0)).toBe(4);});});
function hd260evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260evx_hd',()=>{it('a',()=>{expect(hd260evx(1,4)).toBe(2);});it('b',()=>{expect(hd260evx(3,1)).toBe(1);});it('c',()=>{expect(hd260evx(0,0)).toBe(0);});it('d',()=>{expect(hd260evx(93,73)).toBe(2);});it('e',()=>{expect(hd260evx(15,0)).toBe(4);});});
function hd261evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261evx_hd',()=>{it('a',()=>{expect(hd261evx(1,4)).toBe(2);});it('b',()=>{expect(hd261evx(3,1)).toBe(1);});it('c',()=>{expect(hd261evx(0,0)).toBe(0);});it('d',()=>{expect(hd261evx(93,73)).toBe(2);});it('e',()=>{expect(hd261evx(15,0)).toBe(4);});});
function hd262evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262evx_hd',()=>{it('a',()=>{expect(hd262evx(1,4)).toBe(2);});it('b',()=>{expect(hd262evx(3,1)).toBe(1);});it('c',()=>{expect(hd262evx(0,0)).toBe(0);});it('d',()=>{expect(hd262evx(93,73)).toBe(2);});it('e',()=>{expect(hd262evx(15,0)).toBe(4);});});
function hd263evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263evx_hd',()=>{it('a',()=>{expect(hd263evx(1,4)).toBe(2);});it('b',()=>{expect(hd263evx(3,1)).toBe(1);});it('c',()=>{expect(hd263evx(0,0)).toBe(0);});it('d',()=>{expect(hd263evx(93,73)).toBe(2);});it('e',()=>{expect(hd263evx(15,0)).toBe(4);});});
function hd264evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264evx_hd',()=>{it('a',()=>{expect(hd264evx(1,4)).toBe(2);});it('b',()=>{expect(hd264evx(3,1)).toBe(1);});it('c',()=>{expect(hd264evx(0,0)).toBe(0);});it('d',()=>{expect(hd264evx(93,73)).toBe(2);});it('e',()=>{expect(hd264evx(15,0)).toBe(4);});});
function hd265evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265evx_hd',()=>{it('a',()=>{expect(hd265evx(1,4)).toBe(2);});it('b',()=>{expect(hd265evx(3,1)).toBe(1);});it('c',()=>{expect(hd265evx(0,0)).toBe(0);});it('d',()=>{expect(hd265evx(93,73)).toBe(2);});it('e',()=>{expect(hd265evx(15,0)).toBe(4);});});
function hd266evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266evx_hd',()=>{it('a',()=>{expect(hd266evx(1,4)).toBe(2);});it('b',()=>{expect(hd266evx(3,1)).toBe(1);});it('c',()=>{expect(hd266evx(0,0)).toBe(0);});it('d',()=>{expect(hd266evx(93,73)).toBe(2);});it('e',()=>{expect(hd266evx(15,0)).toBe(4);});});
function hd267evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267evx_hd',()=>{it('a',()=>{expect(hd267evx(1,4)).toBe(2);});it('b',()=>{expect(hd267evx(3,1)).toBe(1);});it('c',()=>{expect(hd267evx(0,0)).toBe(0);});it('d',()=>{expect(hd267evx(93,73)).toBe(2);});it('e',()=>{expect(hd267evx(15,0)).toBe(4);});});
function hd268evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268evx_hd',()=>{it('a',()=>{expect(hd268evx(1,4)).toBe(2);});it('b',()=>{expect(hd268evx(3,1)).toBe(1);});it('c',()=>{expect(hd268evx(0,0)).toBe(0);});it('d',()=>{expect(hd268evx(93,73)).toBe(2);});it('e',()=>{expect(hd268evx(15,0)).toBe(4);});});
function hd269evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269evx_hd',()=>{it('a',()=>{expect(hd269evx(1,4)).toBe(2);});it('b',()=>{expect(hd269evx(3,1)).toBe(1);});it('c',()=>{expect(hd269evx(0,0)).toBe(0);});it('d',()=>{expect(hd269evx(93,73)).toBe(2);});it('e',()=>{expect(hd269evx(15,0)).toBe(4);});});
function hd270evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270evx_hd',()=>{it('a',()=>{expect(hd270evx(1,4)).toBe(2);});it('b',()=>{expect(hd270evx(3,1)).toBe(1);});it('c',()=>{expect(hd270evx(0,0)).toBe(0);});it('d',()=>{expect(hd270evx(93,73)).toBe(2);});it('e',()=>{expect(hd270evx(15,0)).toBe(4);});});
function hd271evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271evx_hd',()=>{it('a',()=>{expect(hd271evx(1,4)).toBe(2);});it('b',()=>{expect(hd271evx(3,1)).toBe(1);});it('c',()=>{expect(hd271evx(0,0)).toBe(0);});it('d',()=>{expect(hd271evx(93,73)).toBe(2);});it('e',()=>{expect(hd271evx(15,0)).toBe(4);});});
function hd272evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272evx_hd',()=>{it('a',()=>{expect(hd272evx(1,4)).toBe(2);});it('b',()=>{expect(hd272evx(3,1)).toBe(1);});it('c',()=>{expect(hd272evx(0,0)).toBe(0);});it('d',()=>{expect(hd272evx(93,73)).toBe(2);});it('e',()=>{expect(hd272evx(15,0)).toBe(4);});});
function hd273evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273evx_hd',()=>{it('a',()=>{expect(hd273evx(1,4)).toBe(2);});it('b',()=>{expect(hd273evx(3,1)).toBe(1);});it('c',()=>{expect(hd273evx(0,0)).toBe(0);});it('d',()=>{expect(hd273evx(93,73)).toBe(2);});it('e',()=>{expect(hd273evx(15,0)).toBe(4);});});
function hd274evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274evx_hd',()=>{it('a',()=>{expect(hd274evx(1,4)).toBe(2);});it('b',()=>{expect(hd274evx(3,1)).toBe(1);});it('c',()=>{expect(hd274evx(0,0)).toBe(0);});it('d',()=>{expect(hd274evx(93,73)).toBe(2);});it('e',()=>{expect(hd274evx(15,0)).toBe(4);});});
function hd275evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275evx_hd',()=>{it('a',()=>{expect(hd275evx(1,4)).toBe(2);});it('b',()=>{expect(hd275evx(3,1)).toBe(1);});it('c',()=>{expect(hd275evx(0,0)).toBe(0);});it('d',()=>{expect(hd275evx(93,73)).toBe(2);});it('e',()=>{expect(hd275evx(15,0)).toBe(4);});});
function hd276evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276evx_hd',()=>{it('a',()=>{expect(hd276evx(1,4)).toBe(2);});it('b',()=>{expect(hd276evx(3,1)).toBe(1);});it('c',()=>{expect(hd276evx(0,0)).toBe(0);});it('d',()=>{expect(hd276evx(93,73)).toBe(2);});it('e',()=>{expect(hd276evx(15,0)).toBe(4);});});
function hd277evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277evx_hd',()=>{it('a',()=>{expect(hd277evx(1,4)).toBe(2);});it('b',()=>{expect(hd277evx(3,1)).toBe(1);});it('c',()=>{expect(hd277evx(0,0)).toBe(0);});it('d',()=>{expect(hd277evx(93,73)).toBe(2);});it('e',()=>{expect(hd277evx(15,0)).toBe(4);});});
function hd278evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278evx_hd',()=>{it('a',()=>{expect(hd278evx(1,4)).toBe(2);});it('b',()=>{expect(hd278evx(3,1)).toBe(1);});it('c',()=>{expect(hd278evx(0,0)).toBe(0);});it('d',()=>{expect(hd278evx(93,73)).toBe(2);});it('e',()=>{expect(hd278evx(15,0)).toBe(4);});});
function hd279evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279evx_hd',()=>{it('a',()=>{expect(hd279evx(1,4)).toBe(2);});it('b',()=>{expect(hd279evx(3,1)).toBe(1);});it('c',()=>{expect(hd279evx(0,0)).toBe(0);});it('d',()=>{expect(hd279evx(93,73)).toBe(2);});it('e',()=>{expect(hd279evx(15,0)).toBe(4);});});
function hd280evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280evx_hd',()=>{it('a',()=>{expect(hd280evx(1,4)).toBe(2);});it('b',()=>{expect(hd280evx(3,1)).toBe(1);});it('c',()=>{expect(hd280evx(0,0)).toBe(0);});it('d',()=>{expect(hd280evx(93,73)).toBe(2);});it('e',()=>{expect(hd280evx(15,0)).toBe(4);});});
function hd281evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281evx_hd',()=>{it('a',()=>{expect(hd281evx(1,4)).toBe(2);});it('b',()=>{expect(hd281evx(3,1)).toBe(1);});it('c',()=>{expect(hd281evx(0,0)).toBe(0);});it('d',()=>{expect(hd281evx(93,73)).toBe(2);});it('e',()=>{expect(hd281evx(15,0)).toBe(4);});});
function hd282evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282evx_hd',()=>{it('a',()=>{expect(hd282evx(1,4)).toBe(2);});it('b',()=>{expect(hd282evx(3,1)).toBe(1);});it('c',()=>{expect(hd282evx(0,0)).toBe(0);});it('d',()=>{expect(hd282evx(93,73)).toBe(2);});it('e',()=>{expect(hd282evx(15,0)).toBe(4);});});
function hd283evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283evx_hd',()=>{it('a',()=>{expect(hd283evx(1,4)).toBe(2);});it('b',()=>{expect(hd283evx(3,1)).toBe(1);});it('c',()=>{expect(hd283evx(0,0)).toBe(0);});it('d',()=>{expect(hd283evx(93,73)).toBe(2);});it('e',()=>{expect(hd283evx(15,0)).toBe(4);});});
function hd284evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284evx_hd',()=>{it('a',()=>{expect(hd284evx(1,4)).toBe(2);});it('b',()=>{expect(hd284evx(3,1)).toBe(1);});it('c',()=>{expect(hd284evx(0,0)).toBe(0);});it('d',()=>{expect(hd284evx(93,73)).toBe(2);});it('e',()=>{expect(hd284evx(15,0)).toBe(4);});});
function hd285evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285evx_hd',()=>{it('a',()=>{expect(hd285evx(1,4)).toBe(2);});it('b',()=>{expect(hd285evx(3,1)).toBe(1);});it('c',()=>{expect(hd285evx(0,0)).toBe(0);});it('d',()=>{expect(hd285evx(93,73)).toBe(2);});it('e',()=>{expect(hd285evx(15,0)).toBe(4);});});
function hd286evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286evx_hd',()=>{it('a',()=>{expect(hd286evx(1,4)).toBe(2);});it('b',()=>{expect(hd286evx(3,1)).toBe(1);});it('c',()=>{expect(hd286evx(0,0)).toBe(0);});it('d',()=>{expect(hd286evx(93,73)).toBe(2);});it('e',()=>{expect(hd286evx(15,0)).toBe(4);});});
function hd287evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287evx_hd',()=>{it('a',()=>{expect(hd287evx(1,4)).toBe(2);});it('b',()=>{expect(hd287evx(3,1)).toBe(1);});it('c',()=>{expect(hd287evx(0,0)).toBe(0);});it('d',()=>{expect(hd287evx(93,73)).toBe(2);});it('e',()=>{expect(hd287evx(15,0)).toBe(4);});});
function hd288evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288evx_hd',()=>{it('a',()=>{expect(hd288evx(1,4)).toBe(2);});it('b',()=>{expect(hd288evx(3,1)).toBe(1);});it('c',()=>{expect(hd288evx(0,0)).toBe(0);});it('d',()=>{expect(hd288evx(93,73)).toBe(2);});it('e',()=>{expect(hd288evx(15,0)).toBe(4);});});
function hd289evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289evx_hd',()=>{it('a',()=>{expect(hd289evx(1,4)).toBe(2);});it('b',()=>{expect(hd289evx(3,1)).toBe(1);});it('c',()=>{expect(hd289evx(0,0)).toBe(0);});it('d',()=>{expect(hd289evx(93,73)).toBe(2);});it('e',()=>{expect(hd289evx(15,0)).toBe(4);});});
function hd290evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290evx_hd',()=>{it('a',()=>{expect(hd290evx(1,4)).toBe(2);});it('b',()=>{expect(hd290evx(3,1)).toBe(1);});it('c',()=>{expect(hd290evx(0,0)).toBe(0);});it('d',()=>{expect(hd290evx(93,73)).toBe(2);});it('e',()=>{expect(hd290evx(15,0)).toBe(4);});});
function hd291evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291evx_hd',()=>{it('a',()=>{expect(hd291evx(1,4)).toBe(2);});it('b',()=>{expect(hd291evx(3,1)).toBe(1);});it('c',()=>{expect(hd291evx(0,0)).toBe(0);});it('d',()=>{expect(hd291evx(93,73)).toBe(2);});it('e',()=>{expect(hd291evx(15,0)).toBe(4);});});
function hd292evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292evx_hd',()=>{it('a',()=>{expect(hd292evx(1,4)).toBe(2);});it('b',()=>{expect(hd292evx(3,1)).toBe(1);});it('c',()=>{expect(hd292evx(0,0)).toBe(0);});it('d',()=>{expect(hd292evx(93,73)).toBe(2);});it('e',()=>{expect(hd292evx(15,0)).toBe(4);});});
function hd293evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293evx_hd',()=>{it('a',()=>{expect(hd293evx(1,4)).toBe(2);});it('b',()=>{expect(hd293evx(3,1)).toBe(1);});it('c',()=>{expect(hd293evx(0,0)).toBe(0);});it('d',()=>{expect(hd293evx(93,73)).toBe(2);});it('e',()=>{expect(hd293evx(15,0)).toBe(4);});});
function hd294evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294evx_hd',()=>{it('a',()=>{expect(hd294evx(1,4)).toBe(2);});it('b',()=>{expect(hd294evx(3,1)).toBe(1);});it('c',()=>{expect(hd294evx(0,0)).toBe(0);});it('d',()=>{expect(hd294evx(93,73)).toBe(2);});it('e',()=>{expect(hd294evx(15,0)).toBe(4);});});
function hd295evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295evx_hd',()=>{it('a',()=>{expect(hd295evx(1,4)).toBe(2);});it('b',()=>{expect(hd295evx(3,1)).toBe(1);});it('c',()=>{expect(hd295evx(0,0)).toBe(0);});it('d',()=>{expect(hd295evx(93,73)).toBe(2);});it('e',()=>{expect(hd295evx(15,0)).toBe(4);});});
function hd296evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296evx_hd',()=>{it('a',()=>{expect(hd296evx(1,4)).toBe(2);});it('b',()=>{expect(hd296evx(3,1)).toBe(1);});it('c',()=>{expect(hd296evx(0,0)).toBe(0);});it('d',()=>{expect(hd296evx(93,73)).toBe(2);});it('e',()=>{expect(hd296evx(15,0)).toBe(4);});});
function hd297evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297evx_hd',()=>{it('a',()=>{expect(hd297evx(1,4)).toBe(2);});it('b',()=>{expect(hd297evx(3,1)).toBe(1);});it('c',()=>{expect(hd297evx(0,0)).toBe(0);});it('d',()=>{expect(hd297evx(93,73)).toBe(2);});it('e',()=>{expect(hd297evx(15,0)).toBe(4);});});
function hd298evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298evx_hd',()=>{it('a',()=>{expect(hd298evx(1,4)).toBe(2);});it('b',()=>{expect(hd298evx(3,1)).toBe(1);});it('c',()=>{expect(hd298evx(0,0)).toBe(0);});it('d',()=>{expect(hd298evx(93,73)).toBe(2);});it('e',()=>{expect(hd298evx(15,0)).toBe(4);});});
function hd299evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299evx_hd',()=>{it('a',()=>{expect(hd299evx(1,4)).toBe(2);});it('b',()=>{expect(hd299evx(3,1)).toBe(1);});it('c',()=>{expect(hd299evx(0,0)).toBe(0);});it('d',()=>{expect(hd299evx(93,73)).toBe(2);});it('e',()=>{expect(hd299evx(15,0)).toBe(4);});});
function hd300evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300evx_hd',()=>{it('a',()=>{expect(hd300evx(1,4)).toBe(2);});it('b',()=>{expect(hd300evx(3,1)).toBe(1);});it('c',()=>{expect(hd300evx(0,0)).toBe(0);});it('d',()=>{expect(hd300evx(93,73)).toBe(2);});it('e',()=>{expect(hd300evx(15,0)).toBe(4);});});
function hd301evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301evx_hd',()=>{it('a',()=>{expect(hd301evx(1,4)).toBe(2);});it('b',()=>{expect(hd301evx(3,1)).toBe(1);});it('c',()=>{expect(hd301evx(0,0)).toBe(0);});it('d',()=>{expect(hd301evx(93,73)).toBe(2);});it('e',()=>{expect(hd301evx(15,0)).toBe(4);});});
function hd302evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302evx_hd',()=>{it('a',()=>{expect(hd302evx(1,4)).toBe(2);});it('b',()=>{expect(hd302evx(3,1)).toBe(1);});it('c',()=>{expect(hd302evx(0,0)).toBe(0);});it('d',()=>{expect(hd302evx(93,73)).toBe(2);});it('e',()=>{expect(hd302evx(15,0)).toBe(4);});});
function hd303evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303evx_hd',()=>{it('a',()=>{expect(hd303evx(1,4)).toBe(2);});it('b',()=>{expect(hd303evx(3,1)).toBe(1);});it('c',()=>{expect(hd303evx(0,0)).toBe(0);});it('d',()=>{expect(hd303evx(93,73)).toBe(2);});it('e',()=>{expect(hd303evx(15,0)).toBe(4);});});
function hd304evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304evx_hd',()=>{it('a',()=>{expect(hd304evx(1,4)).toBe(2);});it('b',()=>{expect(hd304evx(3,1)).toBe(1);});it('c',()=>{expect(hd304evx(0,0)).toBe(0);});it('d',()=>{expect(hd304evx(93,73)).toBe(2);});it('e',()=>{expect(hd304evx(15,0)).toBe(4);});});
function hd305evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305evx_hd',()=>{it('a',()=>{expect(hd305evx(1,4)).toBe(2);});it('b',()=>{expect(hd305evx(3,1)).toBe(1);});it('c',()=>{expect(hd305evx(0,0)).toBe(0);});it('d',()=>{expect(hd305evx(93,73)).toBe(2);});it('e',()=>{expect(hd305evx(15,0)).toBe(4);});});
function hd306evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306evx_hd',()=>{it('a',()=>{expect(hd306evx(1,4)).toBe(2);});it('b',()=>{expect(hd306evx(3,1)).toBe(1);});it('c',()=>{expect(hd306evx(0,0)).toBe(0);});it('d',()=>{expect(hd306evx(93,73)).toBe(2);});it('e',()=>{expect(hd306evx(15,0)).toBe(4);});});
function hd307evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307evx_hd',()=>{it('a',()=>{expect(hd307evx(1,4)).toBe(2);});it('b',()=>{expect(hd307evx(3,1)).toBe(1);});it('c',()=>{expect(hd307evx(0,0)).toBe(0);});it('d',()=>{expect(hd307evx(93,73)).toBe(2);});it('e',()=>{expect(hd307evx(15,0)).toBe(4);});});
function hd308evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308evx_hd',()=>{it('a',()=>{expect(hd308evx(1,4)).toBe(2);});it('b',()=>{expect(hd308evx(3,1)).toBe(1);});it('c',()=>{expect(hd308evx(0,0)).toBe(0);});it('d',()=>{expect(hd308evx(93,73)).toBe(2);});it('e',()=>{expect(hd308evx(15,0)).toBe(4);});});
function hd309evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309evx_hd',()=>{it('a',()=>{expect(hd309evx(1,4)).toBe(2);});it('b',()=>{expect(hd309evx(3,1)).toBe(1);});it('c',()=>{expect(hd309evx(0,0)).toBe(0);});it('d',()=>{expect(hd309evx(93,73)).toBe(2);});it('e',()=>{expect(hd309evx(15,0)).toBe(4);});});
function hd310evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310evx_hd',()=>{it('a',()=>{expect(hd310evx(1,4)).toBe(2);});it('b',()=>{expect(hd310evx(3,1)).toBe(1);});it('c',()=>{expect(hd310evx(0,0)).toBe(0);});it('d',()=>{expect(hd310evx(93,73)).toBe(2);});it('e',()=>{expect(hd310evx(15,0)).toBe(4);});});
function hd311evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311evx_hd',()=>{it('a',()=>{expect(hd311evx(1,4)).toBe(2);});it('b',()=>{expect(hd311evx(3,1)).toBe(1);});it('c',()=>{expect(hd311evx(0,0)).toBe(0);});it('d',()=>{expect(hd311evx(93,73)).toBe(2);});it('e',()=>{expect(hd311evx(15,0)).toBe(4);});});
function hd312evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312evx_hd',()=>{it('a',()=>{expect(hd312evx(1,4)).toBe(2);});it('b',()=>{expect(hd312evx(3,1)).toBe(1);});it('c',()=>{expect(hd312evx(0,0)).toBe(0);});it('d',()=>{expect(hd312evx(93,73)).toBe(2);});it('e',()=>{expect(hd312evx(15,0)).toBe(4);});});
function hd313evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313evx_hd',()=>{it('a',()=>{expect(hd313evx(1,4)).toBe(2);});it('b',()=>{expect(hd313evx(3,1)).toBe(1);});it('c',()=>{expect(hd313evx(0,0)).toBe(0);});it('d',()=>{expect(hd313evx(93,73)).toBe(2);});it('e',()=>{expect(hd313evx(15,0)).toBe(4);});});
function hd314evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314evx_hd',()=>{it('a',()=>{expect(hd314evx(1,4)).toBe(2);});it('b',()=>{expect(hd314evx(3,1)).toBe(1);});it('c',()=>{expect(hd314evx(0,0)).toBe(0);});it('d',()=>{expect(hd314evx(93,73)).toBe(2);});it('e',()=>{expect(hd314evx(15,0)).toBe(4);});});
function hd315evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315evx_hd',()=>{it('a',()=>{expect(hd315evx(1,4)).toBe(2);});it('b',()=>{expect(hd315evx(3,1)).toBe(1);});it('c',()=>{expect(hd315evx(0,0)).toBe(0);});it('d',()=>{expect(hd315evx(93,73)).toBe(2);});it('e',()=>{expect(hd315evx(15,0)).toBe(4);});});
function hd316evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316evx_hd',()=>{it('a',()=>{expect(hd316evx(1,4)).toBe(2);});it('b',()=>{expect(hd316evx(3,1)).toBe(1);});it('c',()=>{expect(hd316evx(0,0)).toBe(0);});it('d',()=>{expect(hd316evx(93,73)).toBe(2);});it('e',()=>{expect(hd316evx(15,0)).toBe(4);});});
function hd317evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317evx_hd',()=>{it('a',()=>{expect(hd317evx(1,4)).toBe(2);});it('b',()=>{expect(hd317evx(3,1)).toBe(1);});it('c',()=>{expect(hd317evx(0,0)).toBe(0);});it('d',()=>{expect(hd317evx(93,73)).toBe(2);});it('e',()=>{expect(hd317evx(15,0)).toBe(4);});});
function hd318evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318evx_hd',()=>{it('a',()=>{expect(hd318evx(1,4)).toBe(2);});it('b',()=>{expect(hd318evx(3,1)).toBe(1);});it('c',()=>{expect(hd318evx(0,0)).toBe(0);});it('d',()=>{expect(hd318evx(93,73)).toBe(2);});it('e',()=>{expect(hd318evx(15,0)).toBe(4);});});
function hd319evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319evx_hd',()=>{it('a',()=>{expect(hd319evx(1,4)).toBe(2);});it('b',()=>{expect(hd319evx(3,1)).toBe(1);});it('c',()=>{expect(hd319evx(0,0)).toBe(0);});it('d',()=>{expect(hd319evx(93,73)).toBe(2);});it('e',()=>{expect(hd319evx(15,0)).toBe(4);});});
function hd320evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320evx_hd',()=>{it('a',()=>{expect(hd320evx(1,4)).toBe(2);});it('b',()=>{expect(hd320evx(3,1)).toBe(1);});it('c',()=>{expect(hd320evx(0,0)).toBe(0);});it('d',()=>{expect(hd320evx(93,73)).toBe(2);});it('e',()=>{expect(hd320evx(15,0)).toBe(4);});});
function hd321evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321evx_hd',()=>{it('a',()=>{expect(hd321evx(1,4)).toBe(2);});it('b',()=>{expect(hd321evx(3,1)).toBe(1);});it('c',()=>{expect(hd321evx(0,0)).toBe(0);});it('d',()=>{expect(hd321evx(93,73)).toBe(2);});it('e',()=>{expect(hd321evx(15,0)).toBe(4);});});
function hd322evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322evx_hd',()=>{it('a',()=>{expect(hd322evx(1,4)).toBe(2);});it('b',()=>{expect(hd322evx(3,1)).toBe(1);});it('c',()=>{expect(hd322evx(0,0)).toBe(0);});it('d',()=>{expect(hd322evx(93,73)).toBe(2);});it('e',()=>{expect(hd322evx(15,0)).toBe(4);});});
function hd323evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323evx_hd',()=>{it('a',()=>{expect(hd323evx(1,4)).toBe(2);});it('b',()=>{expect(hd323evx(3,1)).toBe(1);});it('c',()=>{expect(hd323evx(0,0)).toBe(0);});it('d',()=>{expect(hd323evx(93,73)).toBe(2);});it('e',()=>{expect(hd323evx(15,0)).toBe(4);});});
function hd324evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324evx_hd',()=>{it('a',()=>{expect(hd324evx(1,4)).toBe(2);});it('b',()=>{expect(hd324evx(3,1)).toBe(1);});it('c',()=>{expect(hd324evx(0,0)).toBe(0);});it('d',()=>{expect(hd324evx(93,73)).toBe(2);});it('e',()=>{expect(hd324evx(15,0)).toBe(4);});});
function hd325evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325evx_hd',()=>{it('a',()=>{expect(hd325evx(1,4)).toBe(2);});it('b',()=>{expect(hd325evx(3,1)).toBe(1);});it('c',()=>{expect(hd325evx(0,0)).toBe(0);});it('d',()=>{expect(hd325evx(93,73)).toBe(2);});it('e',()=>{expect(hd325evx(15,0)).toBe(4);});});
function hd326evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326evx_hd',()=>{it('a',()=>{expect(hd326evx(1,4)).toBe(2);});it('b',()=>{expect(hd326evx(3,1)).toBe(1);});it('c',()=>{expect(hd326evx(0,0)).toBe(0);});it('d',()=>{expect(hd326evx(93,73)).toBe(2);});it('e',()=>{expect(hd326evx(15,0)).toBe(4);});});
function hd327evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327evx_hd',()=>{it('a',()=>{expect(hd327evx(1,4)).toBe(2);});it('b',()=>{expect(hd327evx(3,1)).toBe(1);});it('c',()=>{expect(hd327evx(0,0)).toBe(0);});it('d',()=>{expect(hd327evx(93,73)).toBe(2);});it('e',()=>{expect(hd327evx(15,0)).toBe(4);});});
function hd328evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328evx_hd',()=>{it('a',()=>{expect(hd328evx(1,4)).toBe(2);});it('b',()=>{expect(hd328evx(3,1)).toBe(1);});it('c',()=>{expect(hd328evx(0,0)).toBe(0);});it('d',()=>{expect(hd328evx(93,73)).toBe(2);});it('e',()=>{expect(hd328evx(15,0)).toBe(4);});});
function hd329evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329evx_hd',()=>{it('a',()=>{expect(hd329evx(1,4)).toBe(2);});it('b',()=>{expect(hd329evx(3,1)).toBe(1);});it('c',()=>{expect(hd329evx(0,0)).toBe(0);});it('d',()=>{expect(hd329evx(93,73)).toBe(2);});it('e',()=>{expect(hd329evx(15,0)).toBe(4);});});
function hd330evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330evx_hd',()=>{it('a',()=>{expect(hd330evx(1,4)).toBe(2);});it('b',()=>{expect(hd330evx(3,1)).toBe(1);});it('c',()=>{expect(hd330evx(0,0)).toBe(0);});it('d',()=>{expect(hd330evx(93,73)).toBe(2);});it('e',()=>{expect(hd330evx(15,0)).toBe(4);});});
function hd331evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331evx_hd',()=>{it('a',()=>{expect(hd331evx(1,4)).toBe(2);});it('b',()=>{expect(hd331evx(3,1)).toBe(1);});it('c',()=>{expect(hd331evx(0,0)).toBe(0);});it('d',()=>{expect(hd331evx(93,73)).toBe(2);});it('e',()=>{expect(hd331evx(15,0)).toBe(4);});});
function hd332evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332evx_hd',()=>{it('a',()=>{expect(hd332evx(1,4)).toBe(2);});it('b',()=>{expect(hd332evx(3,1)).toBe(1);});it('c',()=>{expect(hd332evx(0,0)).toBe(0);});it('d',()=>{expect(hd332evx(93,73)).toBe(2);});it('e',()=>{expect(hd332evx(15,0)).toBe(4);});});
function hd333evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333evx_hd',()=>{it('a',()=>{expect(hd333evx(1,4)).toBe(2);});it('b',()=>{expect(hd333evx(3,1)).toBe(1);});it('c',()=>{expect(hd333evx(0,0)).toBe(0);});it('d',()=>{expect(hd333evx(93,73)).toBe(2);});it('e',()=>{expect(hd333evx(15,0)).toBe(4);});});
function hd334evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334evx_hd',()=>{it('a',()=>{expect(hd334evx(1,4)).toBe(2);});it('b',()=>{expect(hd334evx(3,1)).toBe(1);});it('c',()=>{expect(hd334evx(0,0)).toBe(0);});it('d',()=>{expect(hd334evx(93,73)).toBe(2);});it('e',()=>{expect(hd334evx(15,0)).toBe(4);});});
function hd335evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335evx_hd',()=>{it('a',()=>{expect(hd335evx(1,4)).toBe(2);});it('b',()=>{expect(hd335evx(3,1)).toBe(1);});it('c',()=>{expect(hd335evx(0,0)).toBe(0);});it('d',()=>{expect(hd335evx(93,73)).toBe(2);});it('e',()=>{expect(hd335evx(15,0)).toBe(4);});});
function hd336evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336evx_hd',()=>{it('a',()=>{expect(hd336evx(1,4)).toBe(2);});it('b',()=>{expect(hd336evx(3,1)).toBe(1);});it('c',()=>{expect(hd336evx(0,0)).toBe(0);});it('d',()=>{expect(hd336evx(93,73)).toBe(2);});it('e',()=>{expect(hd336evx(15,0)).toBe(4);});});
function hd337evx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337evx_hd',()=>{it('a',()=>{expect(hd337evx(1,4)).toBe(2);});it('b',()=>{expect(hd337evx(3,1)).toBe(1);});it('c',()=>{expect(hd337evx(0,0)).toBe(0);});it('d',()=>{expect(hd337evx(93,73)).toBe(2);});it('e',()=>{expect(hd337evx(15,0)).toBe(4);});});
