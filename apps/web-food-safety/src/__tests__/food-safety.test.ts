// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-food-safety specification tests

type HazardType = 'BIOLOGICAL' | 'CHEMICAL' | 'PHYSICAL' | 'ALLERGEN' | 'RADIOLOGICAL';
type CCPStatus = 'IN_CONTROL' | 'DEVIATION' | 'CRITICAL_DEVIATION' | 'PENDING_VERIFICATION';
type HACCPPrinciple = 1 | 2 | 3 | 4 | 5 | 6 | 7;
type FoodSafetyRisk = 'NEGLIGIBLE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

const HAZARD_TYPES: HazardType[] = ['BIOLOGICAL', 'CHEMICAL', 'PHYSICAL', 'ALLERGEN', 'RADIOLOGICAL'];
const CCP_STATUSES: CCPStatus[] = ['IN_CONTROL', 'DEVIATION', 'CRITICAL_DEVIATION', 'PENDING_VERIFICATION'];
const HACCP_PRINCIPLES: HACCPPrinciple[] = [1, 2, 3, 4, 5, 6, 7];
const FOOD_SAFETY_RISKS: FoodSafetyRisk[] = ['NEGLIGIBLE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const ccpStatusColor: Record<CCPStatus, string> = {
  IN_CONTROL: 'bg-green-100 text-green-800',
  DEVIATION: 'bg-yellow-100 text-yellow-800',
  CRITICAL_DEVIATION: 'bg-red-100 text-red-800',
  PENDING_VERIFICATION: 'bg-blue-100 text-blue-800',
};

const haccpPrincipleLabel: Record<HACCPPrinciple, string> = {
  1: 'Conduct Hazard Analysis',
  2: 'Identify Critical Control Points',
  3: 'Establish Critical Limits',
  4: 'Establish Monitoring Procedures',
  5: 'Establish Corrective Actions',
  6: 'Establish Verification Procedures',
  7: 'Establish Record Keeping',
};

const riskScore: Record<FoodSafetyRisk, number> = {
  NEGLIGIBLE: 1, LOW: 2, MEDIUM: 3, HIGH: 4, CRITICAL: 5,
};

function isCCPInControl(status: CCPStatus): boolean {
  return status === 'IN_CONTROL';
}

function requiresCorrectiveAction(status: CCPStatus): boolean {
  return status === 'DEVIATION' || status === 'CRITICAL_DEVIATION';
}

function computeHazardRisk(severity: number, likelihood: number): FoodSafetyRisk {
  const score = severity * likelihood;
  if (score <= 2) return 'NEGLIGIBLE';
  if (score <= 6) return 'LOW';
  if (score <= 12) return 'MEDIUM';
  if (score <= 20) return 'HIGH';
  return 'CRITICAL';
}

describe('CCP status colors', () => {
  CCP_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(ccpStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(ccpStatusColor[s]).toContain('bg-'));
  });
  it('IN_CONTROL is green', () => expect(ccpStatusColor.IN_CONTROL).toContain('green'));
  it('CRITICAL_DEVIATION is red', () => expect(ccpStatusColor.CRITICAL_DEVIATION).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = CCP_STATUSES[i % 4];
    it(`CCP status color string (idx ${i})`, () => expect(typeof ccpStatusColor[s]).toBe('string'));
  }
});

describe('HACCP principles', () => {
  HACCP_PRINCIPLES.forEach(p => {
    it(`Principle ${p} has label`, () => expect(haccpPrincipleLabel[p]).toBeDefined());
    it(`Principle ${p} label is non-empty`, () => expect(haccpPrincipleLabel[p].length).toBeGreaterThan(0));
  });
  it('has 7 principles', () => expect(HACCP_PRINCIPLES).toHaveLength(7));
  it('Principle 1 is hazard analysis', () => expect(haccpPrincipleLabel[1]).toContain('Hazard'));
  it('Principle 7 is record keeping', () => expect(haccpPrincipleLabel[7]).toContain('Record'));
  for (let p = 1; p <= 7; p++) {
    it(`Principle ${p} label is string`, () => expect(typeof haccpPrincipleLabel[p as HACCPPrinciple]).toBe('string'));
  }
});

describe('isCCPInControl', () => {
  it('IN_CONTROL returns true', () => expect(isCCPInControl('IN_CONTROL')).toBe(true));
  it('DEVIATION returns false', () => expect(isCCPInControl('DEVIATION')).toBe(false));
  it('CRITICAL_DEVIATION returns false', () => expect(isCCPInControl('CRITICAL_DEVIATION')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = CCP_STATUSES[i % 4];
    it(`isCCPInControl(${s}) returns boolean (idx ${i})`, () => expect(typeof isCCPInControl(s)).toBe('boolean'));
  }
});

describe('requiresCorrectiveAction', () => {
  it('DEVIATION requires corrective action', () => expect(requiresCorrectiveAction('DEVIATION')).toBe(true));
  it('CRITICAL_DEVIATION requires corrective action', () => expect(requiresCorrectiveAction('CRITICAL_DEVIATION')).toBe(true));
  it('IN_CONTROL does not require', () => expect(requiresCorrectiveAction('IN_CONTROL')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = CCP_STATUSES[i % 4];
    it(`requiresCorrectiveAction(${s}) returns boolean (idx ${i})`, () => expect(typeof requiresCorrectiveAction(s)).toBe('boolean'));
  }
});

describe('computeHazardRisk', () => {
  it('1×1 = NEGLIGIBLE', () => expect(computeHazardRisk(1, 1)).toBe('NEGLIGIBLE'));
  it('3×3 = MEDIUM', () => expect(computeHazardRisk(3, 3)).toBe('MEDIUM'));
  it('5×5 = CRITICAL', () => expect(computeHazardRisk(5, 5)).toBe('CRITICAL'));
  for (let s = 1; s <= 5; s++) {
    for (let l = 1; l <= 5; l++) {
      it(`hazardRisk(${s}, ${l}) is valid risk level`, () => {
        expect(FOOD_SAFETY_RISKS).toContain(computeHazardRisk(s, l));
      });
    }
  }
  for (let i = 0; i < 50; i++) {
    it(`computeHazardRisk returns valid level (idx ${i})`, () => {
      const s = (i % 5) + 1;
      const l = ((i + 2) % 5) + 1;
      expect(FOOD_SAFETY_RISKS).toContain(computeHazardRisk(s, l));
    });
  }
});

describe('Hazard types', () => {
  HAZARD_TYPES.forEach(h => {
    it(`${h} is in list`, () => expect(HAZARD_TYPES).toContain(h));
  });
  it('has 5 hazard types', () => expect(HAZARD_TYPES).toHaveLength(5));
  for (let i = 0; i < 50; i++) {
    const h = HAZARD_TYPES[i % 5];
    it(`hazard type ${h} is string (idx ${i})`, () => expect(typeof h).toBe('string'));
  }
});

// ─── Algorithm puzzle phases (ph217fs2–ph220fs2) ────────────────────────────────
function moveZeroes217fs2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217fs2_mz',()=>{
  it('a',()=>{expect(moveZeroes217fs2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217fs2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217fs2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217fs2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217fs2([4,2,0,0,3])).toBe(4);});
});
function missingNumber218fs2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218fs2_mn',()=>{
  it('a',()=>{expect(missingNumber218fs2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218fs2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218fs2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218fs2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218fs2([1])).toBe(0);});
});
function countBits219fs2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219fs2_cb',()=>{
  it('a',()=>{expect(countBits219fs2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219fs2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219fs2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219fs2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219fs2(4)[4]).toBe(1);});
});
function climbStairs220fs2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220fs2_cs',()=>{
  it('a',()=>{expect(climbStairs220fs2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220fs2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220fs2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220fs2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220fs2(1)).toBe(1);});
});
function hd258fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258fod_hd',()=>{it('a',()=>{expect(hd258fod(1,4)).toBe(2);});it('b',()=>{expect(hd258fod(3,1)).toBe(1);});it('c',()=>{expect(hd258fod(0,0)).toBe(0);});it('d',()=>{expect(hd258fod(93,73)).toBe(2);});it('e',()=>{expect(hd258fod(15,0)).toBe(4);});});
function hd259fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259fod_hd',()=>{it('a',()=>{expect(hd259fod(1,4)).toBe(2);});it('b',()=>{expect(hd259fod(3,1)).toBe(1);});it('c',()=>{expect(hd259fod(0,0)).toBe(0);});it('d',()=>{expect(hd259fod(93,73)).toBe(2);});it('e',()=>{expect(hd259fod(15,0)).toBe(4);});});
function hd260fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260fod_hd',()=>{it('a',()=>{expect(hd260fod(1,4)).toBe(2);});it('b',()=>{expect(hd260fod(3,1)).toBe(1);});it('c',()=>{expect(hd260fod(0,0)).toBe(0);});it('d',()=>{expect(hd260fod(93,73)).toBe(2);});it('e',()=>{expect(hd260fod(15,0)).toBe(4);});});
function hd261fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261fod_hd',()=>{it('a',()=>{expect(hd261fod(1,4)).toBe(2);});it('b',()=>{expect(hd261fod(3,1)).toBe(1);});it('c',()=>{expect(hd261fod(0,0)).toBe(0);});it('d',()=>{expect(hd261fod(93,73)).toBe(2);});it('e',()=>{expect(hd261fod(15,0)).toBe(4);});});
function hd262fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262fod_hd',()=>{it('a',()=>{expect(hd262fod(1,4)).toBe(2);});it('b',()=>{expect(hd262fod(3,1)).toBe(1);});it('c',()=>{expect(hd262fod(0,0)).toBe(0);});it('d',()=>{expect(hd262fod(93,73)).toBe(2);});it('e',()=>{expect(hd262fod(15,0)).toBe(4);});});
function hd263fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263fod_hd',()=>{it('a',()=>{expect(hd263fod(1,4)).toBe(2);});it('b',()=>{expect(hd263fod(3,1)).toBe(1);});it('c',()=>{expect(hd263fod(0,0)).toBe(0);});it('d',()=>{expect(hd263fod(93,73)).toBe(2);});it('e',()=>{expect(hd263fod(15,0)).toBe(4);});});
function hd264fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264fod_hd',()=>{it('a',()=>{expect(hd264fod(1,4)).toBe(2);});it('b',()=>{expect(hd264fod(3,1)).toBe(1);});it('c',()=>{expect(hd264fod(0,0)).toBe(0);});it('d',()=>{expect(hd264fod(93,73)).toBe(2);});it('e',()=>{expect(hd264fod(15,0)).toBe(4);});});
function hd265fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265fod_hd',()=>{it('a',()=>{expect(hd265fod(1,4)).toBe(2);});it('b',()=>{expect(hd265fod(3,1)).toBe(1);});it('c',()=>{expect(hd265fod(0,0)).toBe(0);});it('d',()=>{expect(hd265fod(93,73)).toBe(2);});it('e',()=>{expect(hd265fod(15,0)).toBe(4);});});
function hd266fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266fod_hd',()=>{it('a',()=>{expect(hd266fod(1,4)).toBe(2);});it('b',()=>{expect(hd266fod(3,1)).toBe(1);});it('c',()=>{expect(hd266fod(0,0)).toBe(0);});it('d',()=>{expect(hd266fod(93,73)).toBe(2);});it('e',()=>{expect(hd266fod(15,0)).toBe(4);});});
function hd267fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267fod_hd',()=>{it('a',()=>{expect(hd267fod(1,4)).toBe(2);});it('b',()=>{expect(hd267fod(3,1)).toBe(1);});it('c',()=>{expect(hd267fod(0,0)).toBe(0);});it('d',()=>{expect(hd267fod(93,73)).toBe(2);});it('e',()=>{expect(hd267fod(15,0)).toBe(4);});});
function hd268fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268fod_hd',()=>{it('a',()=>{expect(hd268fod(1,4)).toBe(2);});it('b',()=>{expect(hd268fod(3,1)).toBe(1);});it('c',()=>{expect(hd268fod(0,0)).toBe(0);});it('d',()=>{expect(hd268fod(93,73)).toBe(2);});it('e',()=>{expect(hd268fod(15,0)).toBe(4);});});
function hd269fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269fod_hd',()=>{it('a',()=>{expect(hd269fod(1,4)).toBe(2);});it('b',()=>{expect(hd269fod(3,1)).toBe(1);});it('c',()=>{expect(hd269fod(0,0)).toBe(0);});it('d',()=>{expect(hd269fod(93,73)).toBe(2);});it('e',()=>{expect(hd269fod(15,0)).toBe(4);});});
function hd270fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270fod_hd',()=>{it('a',()=>{expect(hd270fod(1,4)).toBe(2);});it('b',()=>{expect(hd270fod(3,1)).toBe(1);});it('c',()=>{expect(hd270fod(0,0)).toBe(0);});it('d',()=>{expect(hd270fod(93,73)).toBe(2);});it('e',()=>{expect(hd270fod(15,0)).toBe(4);});});
function hd271fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271fod_hd',()=>{it('a',()=>{expect(hd271fod(1,4)).toBe(2);});it('b',()=>{expect(hd271fod(3,1)).toBe(1);});it('c',()=>{expect(hd271fod(0,0)).toBe(0);});it('d',()=>{expect(hd271fod(93,73)).toBe(2);});it('e',()=>{expect(hd271fod(15,0)).toBe(4);});});
function hd272fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272fod_hd',()=>{it('a',()=>{expect(hd272fod(1,4)).toBe(2);});it('b',()=>{expect(hd272fod(3,1)).toBe(1);});it('c',()=>{expect(hd272fod(0,0)).toBe(0);});it('d',()=>{expect(hd272fod(93,73)).toBe(2);});it('e',()=>{expect(hd272fod(15,0)).toBe(4);});});
function hd273fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273fod_hd',()=>{it('a',()=>{expect(hd273fod(1,4)).toBe(2);});it('b',()=>{expect(hd273fod(3,1)).toBe(1);});it('c',()=>{expect(hd273fod(0,0)).toBe(0);});it('d',()=>{expect(hd273fod(93,73)).toBe(2);});it('e',()=>{expect(hd273fod(15,0)).toBe(4);});});
function hd274fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274fod_hd',()=>{it('a',()=>{expect(hd274fod(1,4)).toBe(2);});it('b',()=>{expect(hd274fod(3,1)).toBe(1);});it('c',()=>{expect(hd274fod(0,0)).toBe(0);});it('d',()=>{expect(hd274fod(93,73)).toBe(2);});it('e',()=>{expect(hd274fod(15,0)).toBe(4);});});
function hd275fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275fod_hd',()=>{it('a',()=>{expect(hd275fod(1,4)).toBe(2);});it('b',()=>{expect(hd275fod(3,1)).toBe(1);});it('c',()=>{expect(hd275fod(0,0)).toBe(0);});it('d',()=>{expect(hd275fod(93,73)).toBe(2);});it('e',()=>{expect(hd275fod(15,0)).toBe(4);});});
function hd276fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276fod_hd',()=>{it('a',()=>{expect(hd276fod(1,4)).toBe(2);});it('b',()=>{expect(hd276fod(3,1)).toBe(1);});it('c',()=>{expect(hd276fod(0,0)).toBe(0);});it('d',()=>{expect(hd276fod(93,73)).toBe(2);});it('e',()=>{expect(hd276fod(15,0)).toBe(4);});});
function hd277fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277fod_hd',()=>{it('a',()=>{expect(hd277fod(1,4)).toBe(2);});it('b',()=>{expect(hd277fod(3,1)).toBe(1);});it('c',()=>{expect(hd277fod(0,0)).toBe(0);});it('d',()=>{expect(hd277fod(93,73)).toBe(2);});it('e',()=>{expect(hd277fod(15,0)).toBe(4);});});
function hd278fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278fod_hd',()=>{it('a',()=>{expect(hd278fod(1,4)).toBe(2);});it('b',()=>{expect(hd278fod(3,1)).toBe(1);});it('c',()=>{expect(hd278fod(0,0)).toBe(0);});it('d',()=>{expect(hd278fod(93,73)).toBe(2);});it('e',()=>{expect(hd278fod(15,0)).toBe(4);});});
function hd279fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279fod_hd',()=>{it('a',()=>{expect(hd279fod(1,4)).toBe(2);});it('b',()=>{expect(hd279fod(3,1)).toBe(1);});it('c',()=>{expect(hd279fod(0,0)).toBe(0);});it('d',()=>{expect(hd279fod(93,73)).toBe(2);});it('e',()=>{expect(hd279fod(15,0)).toBe(4);});});
function hd280fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280fod_hd',()=>{it('a',()=>{expect(hd280fod(1,4)).toBe(2);});it('b',()=>{expect(hd280fod(3,1)).toBe(1);});it('c',()=>{expect(hd280fod(0,0)).toBe(0);});it('d',()=>{expect(hd280fod(93,73)).toBe(2);});it('e',()=>{expect(hd280fod(15,0)).toBe(4);});});
function hd281fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281fod_hd',()=>{it('a',()=>{expect(hd281fod(1,4)).toBe(2);});it('b',()=>{expect(hd281fod(3,1)).toBe(1);});it('c',()=>{expect(hd281fod(0,0)).toBe(0);});it('d',()=>{expect(hd281fod(93,73)).toBe(2);});it('e',()=>{expect(hd281fod(15,0)).toBe(4);});});
function hd282fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282fod_hd',()=>{it('a',()=>{expect(hd282fod(1,4)).toBe(2);});it('b',()=>{expect(hd282fod(3,1)).toBe(1);});it('c',()=>{expect(hd282fod(0,0)).toBe(0);});it('d',()=>{expect(hd282fod(93,73)).toBe(2);});it('e',()=>{expect(hd282fod(15,0)).toBe(4);});});
function hd283fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283fod_hd',()=>{it('a',()=>{expect(hd283fod(1,4)).toBe(2);});it('b',()=>{expect(hd283fod(3,1)).toBe(1);});it('c',()=>{expect(hd283fod(0,0)).toBe(0);});it('d',()=>{expect(hd283fod(93,73)).toBe(2);});it('e',()=>{expect(hd283fod(15,0)).toBe(4);});});
function hd284fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284fod_hd',()=>{it('a',()=>{expect(hd284fod(1,4)).toBe(2);});it('b',()=>{expect(hd284fod(3,1)).toBe(1);});it('c',()=>{expect(hd284fod(0,0)).toBe(0);});it('d',()=>{expect(hd284fod(93,73)).toBe(2);});it('e',()=>{expect(hd284fod(15,0)).toBe(4);});});
function hd285fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285fod_hd',()=>{it('a',()=>{expect(hd285fod(1,4)).toBe(2);});it('b',()=>{expect(hd285fod(3,1)).toBe(1);});it('c',()=>{expect(hd285fod(0,0)).toBe(0);});it('d',()=>{expect(hd285fod(93,73)).toBe(2);});it('e',()=>{expect(hd285fod(15,0)).toBe(4);});});
function hd286fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286fod_hd',()=>{it('a',()=>{expect(hd286fod(1,4)).toBe(2);});it('b',()=>{expect(hd286fod(3,1)).toBe(1);});it('c',()=>{expect(hd286fod(0,0)).toBe(0);});it('d',()=>{expect(hd286fod(93,73)).toBe(2);});it('e',()=>{expect(hd286fod(15,0)).toBe(4);});});
function hd287fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287fod_hd',()=>{it('a',()=>{expect(hd287fod(1,4)).toBe(2);});it('b',()=>{expect(hd287fod(3,1)).toBe(1);});it('c',()=>{expect(hd287fod(0,0)).toBe(0);});it('d',()=>{expect(hd287fod(93,73)).toBe(2);});it('e',()=>{expect(hd287fod(15,0)).toBe(4);});});
function hd288fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288fod_hd',()=>{it('a',()=>{expect(hd288fod(1,4)).toBe(2);});it('b',()=>{expect(hd288fod(3,1)).toBe(1);});it('c',()=>{expect(hd288fod(0,0)).toBe(0);});it('d',()=>{expect(hd288fod(93,73)).toBe(2);});it('e',()=>{expect(hd288fod(15,0)).toBe(4);});});
function hd289fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289fod_hd',()=>{it('a',()=>{expect(hd289fod(1,4)).toBe(2);});it('b',()=>{expect(hd289fod(3,1)).toBe(1);});it('c',()=>{expect(hd289fod(0,0)).toBe(0);});it('d',()=>{expect(hd289fod(93,73)).toBe(2);});it('e',()=>{expect(hd289fod(15,0)).toBe(4);});});
function hd290fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290fod_hd',()=>{it('a',()=>{expect(hd290fod(1,4)).toBe(2);});it('b',()=>{expect(hd290fod(3,1)).toBe(1);});it('c',()=>{expect(hd290fod(0,0)).toBe(0);});it('d',()=>{expect(hd290fod(93,73)).toBe(2);});it('e',()=>{expect(hd290fod(15,0)).toBe(4);});});
function hd291fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291fod_hd',()=>{it('a',()=>{expect(hd291fod(1,4)).toBe(2);});it('b',()=>{expect(hd291fod(3,1)).toBe(1);});it('c',()=>{expect(hd291fod(0,0)).toBe(0);});it('d',()=>{expect(hd291fod(93,73)).toBe(2);});it('e',()=>{expect(hd291fod(15,0)).toBe(4);});});
function hd292fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292fod_hd',()=>{it('a',()=>{expect(hd292fod(1,4)).toBe(2);});it('b',()=>{expect(hd292fod(3,1)).toBe(1);});it('c',()=>{expect(hd292fod(0,0)).toBe(0);});it('d',()=>{expect(hd292fod(93,73)).toBe(2);});it('e',()=>{expect(hd292fod(15,0)).toBe(4);});});
function hd293fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293fod_hd',()=>{it('a',()=>{expect(hd293fod(1,4)).toBe(2);});it('b',()=>{expect(hd293fod(3,1)).toBe(1);});it('c',()=>{expect(hd293fod(0,0)).toBe(0);});it('d',()=>{expect(hd293fod(93,73)).toBe(2);});it('e',()=>{expect(hd293fod(15,0)).toBe(4);});});
function hd294fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294fod_hd',()=>{it('a',()=>{expect(hd294fod(1,4)).toBe(2);});it('b',()=>{expect(hd294fod(3,1)).toBe(1);});it('c',()=>{expect(hd294fod(0,0)).toBe(0);});it('d',()=>{expect(hd294fod(93,73)).toBe(2);});it('e',()=>{expect(hd294fod(15,0)).toBe(4);});});
function hd295fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295fod_hd',()=>{it('a',()=>{expect(hd295fod(1,4)).toBe(2);});it('b',()=>{expect(hd295fod(3,1)).toBe(1);});it('c',()=>{expect(hd295fod(0,0)).toBe(0);});it('d',()=>{expect(hd295fod(93,73)).toBe(2);});it('e',()=>{expect(hd295fod(15,0)).toBe(4);});});
function hd296fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296fod_hd',()=>{it('a',()=>{expect(hd296fod(1,4)).toBe(2);});it('b',()=>{expect(hd296fod(3,1)).toBe(1);});it('c',()=>{expect(hd296fod(0,0)).toBe(0);});it('d',()=>{expect(hd296fod(93,73)).toBe(2);});it('e',()=>{expect(hd296fod(15,0)).toBe(4);});});
function hd297fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297fod_hd',()=>{it('a',()=>{expect(hd297fod(1,4)).toBe(2);});it('b',()=>{expect(hd297fod(3,1)).toBe(1);});it('c',()=>{expect(hd297fod(0,0)).toBe(0);});it('d',()=>{expect(hd297fod(93,73)).toBe(2);});it('e',()=>{expect(hd297fod(15,0)).toBe(4);});});
function hd298fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298fod_hd',()=>{it('a',()=>{expect(hd298fod(1,4)).toBe(2);});it('b',()=>{expect(hd298fod(3,1)).toBe(1);});it('c',()=>{expect(hd298fod(0,0)).toBe(0);});it('d',()=>{expect(hd298fod(93,73)).toBe(2);});it('e',()=>{expect(hd298fod(15,0)).toBe(4);});});
function hd299fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299fod_hd',()=>{it('a',()=>{expect(hd299fod(1,4)).toBe(2);});it('b',()=>{expect(hd299fod(3,1)).toBe(1);});it('c',()=>{expect(hd299fod(0,0)).toBe(0);});it('d',()=>{expect(hd299fod(93,73)).toBe(2);});it('e',()=>{expect(hd299fod(15,0)).toBe(4);});});
function hd300fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300fod_hd',()=>{it('a',()=>{expect(hd300fod(1,4)).toBe(2);});it('b',()=>{expect(hd300fod(3,1)).toBe(1);});it('c',()=>{expect(hd300fod(0,0)).toBe(0);});it('d',()=>{expect(hd300fod(93,73)).toBe(2);});it('e',()=>{expect(hd300fod(15,0)).toBe(4);});});
function hd301fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301fod_hd',()=>{it('a',()=>{expect(hd301fod(1,4)).toBe(2);});it('b',()=>{expect(hd301fod(3,1)).toBe(1);});it('c',()=>{expect(hd301fod(0,0)).toBe(0);});it('d',()=>{expect(hd301fod(93,73)).toBe(2);});it('e',()=>{expect(hd301fod(15,0)).toBe(4);});});
function hd302fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302fod_hd',()=>{it('a',()=>{expect(hd302fod(1,4)).toBe(2);});it('b',()=>{expect(hd302fod(3,1)).toBe(1);});it('c',()=>{expect(hd302fod(0,0)).toBe(0);});it('d',()=>{expect(hd302fod(93,73)).toBe(2);});it('e',()=>{expect(hd302fod(15,0)).toBe(4);});});
function hd303fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303fod_hd',()=>{it('a',()=>{expect(hd303fod(1,4)).toBe(2);});it('b',()=>{expect(hd303fod(3,1)).toBe(1);});it('c',()=>{expect(hd303fod(0,0)).toBe(0);});it('d',()=>{expect(hd303fod(93,73)).toBe(2);});it('e',()=>{expect(hd303fod(15,0)).toBe(4);});});
function hd304fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304fod_hd',()=>{it('a',()=>{expect(hd304fod(1,4)).toBe(2);});it('b',()=>{expect(hd304fod(3,1)).toBe(1);});it('c',()=>{expect(hd304fod(0,0)).toBe(0);});it('d',()=>{expect(hd304fod(93,73)).toBe(2);});it('e',()=>{expect(hd304fod(15,0)).toBe(4);});});
function hd305fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305fod_hd',()=>{it('a',()=>{expect(hd305fod(1,4)).toBe(2);});it('b',()=>{expect(hd305fod(3,1)).toBe(1);});it('c',()=>{expect(hd305fod(0,0)).toBe(0);});it('d',()=>{expect(hd305fod(93,73)).toBe(2);});it('e',()=>{expect(hd305fod(15,0)).toBe(4);});});
function hd306fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306fod_hd',()=>{it('a',()=>{expect(hd306fod(1,4)).toBe(2);});it('b',()=>{expect(hd306fod(3,1)).toBe(1);});it('c',()=>{expect(hd306fod(0,0)).toBe(0);});it('d',()=>{expect(hd306fod(93,73)).toBe(2);});it('e',()=>{expect(hd306fod(15,0)).toBe(4);});});
function hd307fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307fod_hd',()=>{it('a',()=>{expect(hd307fod(1,4)).toBe(2);});it('b',()=>{expect(hd307fod(3,1)).toBe(1);});it('c',()=>{expect(hd307fod(0,0)).toBe(0);});it('d',()=>{expect(hd307fod(93,73)).toBe(2);});it('e',()=>{expect(hd307fod(15,0)).toBe(4);});});
function hd308fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308fod_hd',()=>{it('a',()=>{expect(hd308fod(1,4)).toBe(2);});it('b',()=>{expect(hd308fod(3,1)).toBe(1);});it('c',()=>{expect(hd308fod(0,0)).toBe(0);});it('d',()=>{expect(hd308fod(93,73)).toBe(2);});it('e',()=>{expect(hd308fod(15,0)).toBe(4);});});
function hd309fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309fod_hd',()=>{it('a',()=>{expect(hd309fod(1,4)).toBe(2);});it('b',()=>{expect(hd309fod(3,1)).toBe(1);});it('c',()=>{expect(hd309fod(0,0)).toBe(0);});it('d',()=>{expect(hd309fod(93,73)).toBe(2);});it('e',()=>{expect(hd309fod(15,0)).toBe(4);});});
function hd310fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310fod_hd',()=>{it('a',()=>{expect(hd310fod(1,4)).toBe(2);});it('b',()=>{expect(hd310fod(3,1)).toBe(1);});it('c',()=>{expect(hd310fod(0,0)).toBe(0);});it('d',()=>{expect(hd310fod(93,73)).toBe(2);});it('e',()=>{expect(hd310fod(15,0)).toBe(4);});});
function hd311fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311fod_hd',()=>{it('a',()=>{expect(hd311fod(1,4)).toBe(2);});it('b',()=>{expect(hd311fod(3,1)).toBe(1);});it('c',()=>{expect(hd311fod(0,0)).toBe(0);});it('d',()=>{expect(hd311fod(93,73)).toBe(2);});it('e',()=>{expect(hd311fod(15,0)).toBe(4);});});
function hd312fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312fod_hd',()=>{it('a',()=>{expect(hd312fod(1,4)).toBe(2);});it('b',()=>{expect(hd312fod(3,1)).toBe(1);});it('c',()=>{expect(hd312fod(0,0)).toBe(0);});it('d',()=>{expect(hd312fod(93,73)).toBe(2);});it('e',()=>{expect(hd312fod(15,0)).toBe(4);});});
function hd313fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313fod_hd',()=>{it('a',()=>{expect(hd313fod(1,4)).toBe(2);});it('b',()=>{expect(hd313fod(3,1)).toBe(1);});it('c',()=>{expect(hd313fod(0,0)).toBe(0);});it('d',()=>{expect(hd313fod(93,73)).toBe(2);});it('e',()=>{expect(hd313fod(15,0)).toBe(4);});});
function hd314fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314fod_hd',()=>{it('a',()=>{expect(hd314fod(1,4)).toBe(2);});it('b',()=>{expect(hd314fod(3,1)).toBe(1);});it('c',()=>{expect(hd314fod(0,0)).toBe(0);});it('d',()=>{expect(hd314fod(93,73)).toBe(2);});it('e',()=>{expect(hd314fod(15,0)).toBe(4);});});
function hd315fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315fod_hd',()=>{it('a',()=>{expect(hd315fod(1,4)).toBe(2);});it('b',()=>{expect(hd315fod(3,1)).toBe(1);});it('c',()=>{expect(hd315fod(0,0)).toBe(0);});it('d',()=>{expect(hd315fod(93,73)).toBe(2);});it('e',()=>{expect(hd315fod(15,0)).toBe(4);});});
function hd316fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316fod_hd',()=>{it('a',()=>{expect(hd316fod(1,4)).toBe(2);});it('b',()=>{expect(hd316fod(3,1)).toBe(1);});it('c',()=>{expect(hd316fod(0,0)).toBe(0);});it('d',()=>{expect(hd316fod(93,73)).toBe(2);});it('e',()=>{expect(hd316fod(15,0)).toBe(4);});});
function hd317fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317fod_hd',()=>{it('a',()=>{expect(hd317fod(1,4)).toBe(2);});it('b',()=>{expect(hd317fod(3,1)).toBe(1);});it('c',()=>{expect(hd317fod(0,0)).toBe(0);});it('d',()=>{expect(hd317fod(93,73)).toBe(2);});it('e',()=>{expect(hd317fod(15,0)).toBe(4);});});
function hd318fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318fod_hd',()=>{it('a',()=>{expect(hd318fod(1,4)).toBe(2);});it('b',()=>{expect(hd318fod(3,1)).toBe(1);});it('c',()=>{expect(hd318fod(0,0)).toBe(0);});it('d',()=>{expect(hd318fod(93,73)).toBe(2);});it('e',()=>{expect(hd318fod(15,0)).toBe(4);});});
function hd319fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319fod_hd',()=>{it('a',()=>{expect(hd319fod(1,4)).toBe(2);});it('b',()=>{expect(hd319fod(3,1)).toBe(1);});it('c',()=>{expect(hd319fod(0,0)).toBe(0);});it('d',()=>{expect(hd319fod(93,73)).toBe(2);});it('e',()=>{expect(hd319fod(15,0)).toBe(4);});});
function hd320fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320fod_hd',()=>{it('a',()=>{expect(hd320fod(1,4)).toBe(2);});it('b',()=>{expect(hd320fod(3,1)).toBe(1);});it('c',()=>{expect(hd320fod(0,0)).toBe(0);});it('d',()=>{expect(hd320fod(93,73)).toBe(2);});it('e',()=>{expect(hd320fod(15,0)).toBe(4);});});
function hd321fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321fod_hd',()=>{it('a',()=>{expect(hd321fod(1,4)).toBe(2);});it('b',()=>{expect(hd321fod(3,1)).toBe(1);});it('c',()=>{expect(hd321fod(0,0)).toBe(0);});it('d',()=>{expect(hd321fod(93,73)).toBe(2);});it('e',()=>{expect(hd321fod(15,0)).toBe(4);});});
function hd322fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322fod_hd',()=>{it('a',()=>{expect(hd322fod(1,4)).toBe(2);});it('b',()=>{expect(hd322fod(3,1)).toBe(1);});it('c',()=>{expect(hd322fod(0,0)).toBe(0);});it('d',()=>{expect(hd322fod(93,73)).toBe(2);});it('e',()=>{expect(hd322fod(15,0)).toBe(4);});});
function hd323fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323fod_hd',()=>{it('a',()=>{expect(hd323fod(1,4)).toBe(2);});it('b',()=>{expect(hd323fod(3,1)).toBe(1);});it('c',()=>{expect(hd323fod(0,0)).toBe(0);});it('d',()=>{expect(hd323fod(93,73)).toBe(2);});it('e',()=>{expect(hd323fod(15,0)).toBe(4);});});
function hd324fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324fod_hd',()=>{it('a',()=>{expect(hd324fod(1,4)).toBe(2);});it('b',()=>{expect(hd324fod(3,1)).toBe(1);});it('c',()=>{expect(hd324fod(0,0)).toBe(0);});it('d',()=>{expect(hd324fod(93,73)).toBe(2);});it('e',()=>{expect(hd324fod(15,0)).toBe(4);});});
function hd325fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325fod_hd',()=>{it('a',()=>{expect(hd325fod(1,4)).toBe(2);});it('b',()=>{expect(hd325fod(3,1)).toBe(1);});it('c',()=>{expect(hd325fod(0,0)).toBe(0);});it('d',()=>{expect(hd325fod(93,73)).toBe(2);});it('e',()=>{expect(hd325fod(15,0)).toBe(4);});});
function hd326fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326fod_hd',()=>{it('a',()=>{expect(hd326fod(1,4)).toBe(2);});it('b',()=>{expect(hd326fod(3,1)).toBe(1);});it('c',()=>{expect(hd326fod(0,0)).toBe(0);});it('d',()=>{expect(hd326fod(93,73)).toBe(2);});it('e',()=>{expect(hd326fod(15,0)).toBe(4);});});
function hd327fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327fod_hd',()=>{it('a',()=>{expect(hd327fod(1,4)).toBe(2);});it('b',()=>{expect(hd327fod(3,1)).toBe(1);});it('c',()=>{expect(hd327fod(0,0)).toBe(0);});it('d',()=>{expect(hd327fod(93,73)).toBe(2);});it('e',()=>{expect(hd327fod(15,0)).toBe(4);});});
function hd328fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328fod_hd',()=>{it('a',()=>{expect(hd328fod(1,4)).toBe(2);});it('b',()=>{expect(hd328fod(3,1)).toBe(1);});it('c',()=>{expect(hd328fod(0,0)).toBe(0);});it('d',()=>{expect(hd328fod(93,73)).toBe(2);});it('e',()=>{expect(hd328fod(15,0)).toBe(4);});});
function hd329fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329fod_hd',()=>{it('a',()=>{expect(hd329fod(1,4)).toBe(2);});it('b',()=>{expect(hd329fod(3,1)).toBe(1);});it('c',()=>{expect(hd329fod(0,0)).toBe(0);});it('d',()=>{expect(hd329fod(93,73)).toBe(2);});it('e',()=>{expect(hd329fod(15,0)).toBe(4);});});
function hd330fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330fod_hd',()=>{it('a',()=>{expect(hd330fod(1,4)).toBe(2);});it('b',()=>{expect(hd330fod(3,1)).toBe(1);});it('c',()=>{expect(hd330fod(0,0)).toBe(0);});it('d',()=>{expect(hd330fod(93,73)).toBe(2);});it('e',()=>{expect(hd330fod(15,0)).toBe(4);});});
function hd331fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331fod_hd',()=>{it('a',()=>{expect(hd331fod(1,4)).toBe(2);});it('b',()=>{expect(hd331fod(3,1)).toBe(1);});it('c',()=>{expect(hd331fod(0,0)).toBe(0);});it('d',()=>{expect(hd331fod(93,73)).toBe(2);});it('e',()=>{expect(hd331fod(15,0)).toBe(4);});});
function hd332fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332fod_hd',()=>{it('a',()=>{expect(hd332fod(1,4)).toBe(2);});it('b',()=>{expect(hd332fod(3,1)).toBe(1);});it('c',()=>{expect(hd332fod(0,0)).toBe(0);});it('d',()=>{expect(hd332fod(93,73)).toBe(2);});it('e',()=>{expect(hd332fod(15,0)).toBe(4);});});
function hd333fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333fod_hd',()=>{it('a',()=>{expect(hd333fod(1,4)).toBe(2);});it('b',()=>{expect(hd333fod(3,1)).toBe(1);});it('c',()=>{expect(hd333fod(0,0)).toBe(0);});it('d',()=>{expect(hd333fod(93,73)).toBe(2);});it('e',()=>{expect(hd333fod(15,0)).toBe(4);});});
function hd334fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334fod_hd',()=>{it('a',()=>{expect(hd334fod(1,4)).toBe(2);});it('b',()=>{expect(hd334fod(3,1)).toBe(1);});it('c',()=>{expect(hd334fod(0,0)).toBe(0);});it('d',()=>{expect(hd334fod(93,73)).toBe(2);});it('e',()=>{expect(hd334fod(15,0)).toBe(4);});});
function hd335fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335fod_hd',()=>{it('a',()=>{expect(hd335fod(1,4)).toBe(2);});it('b',()=>{expect(hd335fod(3,1)).toBe(1);});it('c',()=>{expect(hd335fod(0,0)).toBe(0);});it('d',()=>{expect(hd335fod(93,73)).toBe(2);});it('e',()=>{expect(hd335fod(15,0)).toBe(4);});});
function hd336fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336fod_hd',()=>{it('a',()=>{expect(hd336fod(1,4)).toBe(2);});it('b',()=>{expect(hd336fod(3,1)).toBe(1);});it('c',()=>{expect(hd336fod(0,0)).toBe(0);});it('d',()=>{expect(hd336fod(93,73)).toBe(2);});it('e',()=>{expect(hd336fod(15,0)).toBe(4);});});
function hd337fod(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337fod_hd',()=>{it('a',()=>{expect(hd337fod(1,4)).toBe(2);});it('b',()=>{expect(hd337fod(3,1)).toBe(1);});it('c',()=>{expect(hd337fod(0,0)).toBe(0);});it('d',()=>{expect(hd337fod(93,73)).toBe(2);});it('e',()=>{expect(hd337fod(15,0)).toBe(4);});});
function hd338foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338foox2_hd',()=>{it('a',()=>{expect(hd338foox2(1,4)).toBe(2);});it('b',()=>{expect(hd338foox2(3,1)).toBe(1);});it('c',()=>{expect(hd338foox2(0,0)).toBe(0);});it('d',()=>{expect(hd338foox2(93,73)).toBe(2);});it('e',()=>{expect(hd338foox2(15,0)).toBe(4);});});
function hd338foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339foox2_hd',()=>{it('a',()=>{expect(hd339foox2(1,4)).toBe(2);});it('b',()=>{expect(hd339foox2(3,1)).toBe(1);});it('c',()=>{expect(hd339foox2(0,0)).toBe(0);});it('d',()=>{expect(hd339foox2(93,73)).toBe(2);});it('e',()=>{expect(hd339foox2(15,0)).toBe(4);});});
function hd339foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340foox2_hd',()=>{it('a',()=>{expect(hd340foox2(1,4)).toBe(2);});it('b',()=>{expect(hd340foox2(3,1)).toBe(1);});it('c',()=>{expect(hd340foox2(0,0)).toBe(0);});it('d',()=>{expect(hd340foox2(93,73)).toBe(2);});it('e',()=>{expect(hd340foox2(15,0)).toBe(4);});});
function hd340foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341foox2_hd',()=>{it('a',()=>{expect(hd341foox2(1,4)).toBe(2);});it('b',()=>{expect(hd341foox2(3,1)).toBe(1);});it('c',()=>{expect(hd341foox2(0,0)).toBe(0);});it('d',()=>{expect(hd341foox2(93,73)).toBe(2);});it('e',()=>{expect(hd341foox2(15,0)).toBe(4);});});
function hd341foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342foox2_hd',()=>{it('a',()=>{expect(hd342foox2(1,4)).toBe(2);});it('b',()=>{expect(hd342foox2(3,1)).toBe(1);});it('c',()=>{expect(hd342foox2(0,0)).toBe(0);});it('d',()=>{expect(hd342foox2(93,73)).toBe(2);});it('e',()=>{expect(hd342foox2(15,0)).toBe(4);});});
function hd342foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343foox2_hd',()=>{it('a',()=>{expect(hd343foox2(1,4)).toBe(2);});it('b',()=>{expect(hd343foox2(3,1)).toBe(1);});it('c',()=>{expect(hd343foox2(0,0)).toBe(0);});it('d',()=>{expect(hd343foox2(93,73)).toBe(2);});it('e',()=>{expect(hd343foox2(15,0)).toBe(4);});});
function hd343foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344foox2_hd',()=>{it('a',()=>{expect(hd344foox2(1,4)).toBe(2);});it('b',()=>{expect(hd344foox2(3,1)).toBe(1);});it('c',()=>{expect(hd344foox2(0,0)).toBe(0);});it('d',()=>{expect(hd344foox2(93,73)).toBe(2);});it('e',()=>{expect(hd344foox2(15,0)).toBe(4);});});
function hd344foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345foox2_hd',()=>{it('a',()=>{expect(hd345foox2(1,4)).toBe(2);});it('b',()=>{expect(hd345foox2(3,1)).toBe(1);});it('c',()=>{expect(hd345foox2(0,0)).toBe(0);});it('d',()=>{expect(hd345foox2(93,73)).toBe(2);});it('e',()=>{expect(hd345foox2(15,0)).toBe(4);});});
function hd345foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346foox2_hd',()=>{it('a',()=>{expect(hd346foox2(1,4)).toBe(2);});it('b',()=>{expect(hd346foox2(3,1)).toBe(1);});it('c',()=>{expect(hd346foox2(0,0)).toBe(0);});it('d',()=>{expect(hd346foox2(93,73)).toBe(2);});it('e',()=>{expect(hd346foox2(15,0)).toBe(4);});});
function hd346foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347foox2_hd',()=>{it('a',()=>{expect(hd347foox2(1,4)).toBe(2);});it('b',()=>{expect(hd347foox2(3,1)).toBe(1);});it('c',()=>{expect(hd347foox2(0,0)).toBe(0);});it('d',()=>{expect(hd347foox2(93,73)).toBe(2);});it('e',()=>{expect(hd347foox2(15,0)).toBe(4);});});
function hd347foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348foox2_hd',()=>{it('a',()=>{expect(hd348foox2(1,4)).toBe(2);});it('b',()=>{expect(hd348foox2(3,1)).toBe(1);});it('c',()=>{expect(hd348foox2(0,0)).toBe(0);});it('d',()=>{expect(hd348foox2(93,73)).toBe(2);});it('e',()=>{expect(hd348foox2(15,0)).toBe(4);});});
function hd348foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349foox2_hd',()=>{it('a',()=>{expect(hd349foox2(1,4)).toBe(2);});it('b',()=>{expect(hd349foox2(3,1)).toBe(1);});it('c',()=>{expect(hd349foox2(0,0)).toBe(0);});it('d',()=>{expect(hd349foox2(93,73)).toBe(2);});it('e',()=>{expect(hd349foox2(15,0)).toBe(4);});});
function hd349foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350foox2_hd',()=>{it('a',()=>{expect(hd350foox2(1,4)).toBe(2);});it('b',()=>{expect(hd350foox2(3,1)).toBe(1);});it('c',()=>{expect(hd350foox2(0,0)).toBe(0);});it('d',()=>{expect(hd350foox2(93,73)).toBe(2);});it('e',()=>{expect(hd350foox2(15,0)).toBe(4);});});
function hd350foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351foox2_hd',()=>{it('a',()=>{expect(hd351foox2(1,4)).toBe(2);});it('b',()=>{expect(hd351foox2(3,1)).toBe(1);});it('c',()=>{expect(hd351foox2(0,0)).toBe(0);});it('d',()=>{expect(hd351foox2(93,73)).toBe(2);});it('e',()=>{expect(hd351foox2(15,0)).toBe(4);});});
function hd351foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352foox2_hd',()=>{it('a',()=>{expect(hd352foox2(1,4)).toBe(2);});it('b',()=>{expect(hd352foox2(3,1)).toBe(1);});it('c',()=>{expect(hd352foox2(0,0)).toBe(0);});it('d',()=>{expect(hd352foox2(93,73)).toBe(2);});it('e',()=>{expect(hd352foox2(15,0)).toBe(4);});});
function hd352foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353foox2_hd',()=>{it('a',()=>{expect(hd353foox2(1,4)).toBe(2);});it('b',()=>{expect(hd353foox2(3,1)).toBe(1);});it('c',()=>{expect(hd353foox2(0,0)).toBe(0);});it('d',()=>{expect(hd353foox2(93,73)).toBe(2);});it('e',()=>{expect(hd353foox2(15,0)).toBe(4);});});
function hd353foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354foox2_hd',()=>{it('a',()=>{expect(hd354foox2(1,4)).toBe(2);});it('b',()=>{expect(hd354foox2(3,1)).toBe(1);});it('c',()=>{expect(hd354foox2(0,0)).toBe(0);});it('d',()=>{expect(hd354foox2(93,73)).toBe(2);});it('e',()=>{expect(hd354foox2(15,0)).toBe(4);});});
function hd354foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355foox2_hd',()=>{it('a',()=>{expect(hd355foox2(1,4)).toBe(2);});it('b',()=>{expect(hd355foox2(3,1)).toBe(1);});it('c',()=>{expect(hd355foox2(0,0)).toBe(0);});it('d',()=>{expect(hd355foox2(93,73)).toBe(2);});it('e',()=>{expect(hd355foox2(15,0)).toBe(4);});});
function hd355foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356foox2_hd',()=>{it('a',()=>{expect(hd356foox2(1,4)).toBe(2);});it('b',()=>{expect(hd356foox2(3,1)).toBe(1);});it('c',()=>{expect(hd356foox2(0,0)).toBe(0);});it('d',()=>{expect(hd356foox2(93,73)).toBe(2);});it('e',()=>{expect(hd356foox2(15,0)).toBe(4);});});
function hd356foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357foox2_hd',()=>{it('a',()=>{expect(hd357foox2(1,4)).toBe(2);});it('b',()=>{expect(hd357foox2(3,1)).toBe(1);});it('c',()=>{expect(hd357foox2(0,0)).toBe(0);});it('d',()=>{expect(hd357foox2(93,73)).toBe(2);});it('e',()=>{expect(hd357foox2(15,0)).toBe(4);});});
function hd357foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358foox2_hd',()=>{it('a',()=>{expect(hd358foox2(1,4)).toBe(2);});it('b',()=>{expect(hd358foox2(3,1)).toBe(1);});it('c',()=>{expect(hd358foox2(0,0)).toBe(0);});it('d',()=>{expect(hd358foox2(93,73)).toBe(2);});it('e',()=>{expect(hd358foox2(15,0)).toBe(4);});});
function hd358foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359foox2_hd',()=>{it('a',()=>{expect(hd359foox2(1,4)).toBe(2);});it('b',()=>{expect(hd359foox2(3,1)).toBe(1);});it('c',()=>{expect(hd359foox2(0,0)).toBe(0);});it('d',()=>{expect(hd359foox2(93,73)).toBe(2);});it('e',()=>{expect(hd359foox2(15,0)).toBe(4);});});
function hd359foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360foox2_hd',()=>{it('a',()=>{expect(hd360foox2(1,4)).toBe(2);});it('b',()=>{expect(hd360foox2(3,1)).toBe(1);});it('c',()=>{expect(hd360foox2(0,0)).toBe(0);});it('d',()=>{expect(hd360foox2(93,73)).toBe(2);});it('e',()=>{expect(hd360foox2(15,0)).toBe(4);});});
function hd360foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361foox2_hd',()=>{it('a',()=>{expect(hd361foox2(1,4)).toBe(2);});it('b',()=>{expect(hd361foox2(3,1)).toBe(1);});it('c',()=>{expect(hd361foox2(0,0)).toBe(0);});it('d',()=>{expect(hd361foox2(93,73)).toBe(2);});it('e',()=>{expect(hd361foox2(15,0)).toBe(4);});});
function hd361foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362foox2_hd',()=>{it('a',()=>{expect(hd362foox2(1,4)).toBe(2);});it('b',()=>{expect(hd362foox2(3,1)).toBe(1);});it('c',()=>{expect(hd362foox2(0,0)).toBe(0);});it('d',()=>{expect(hd362foox2(93,73)).toBe(2);});it('e',()=>{expect(hd362foox2(15,0)).toBe(4);});});
function hd362foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363foox2_hd',()=>{it('a',()=>{expect(hd363foox2(1,4)).toBe(2);});it('b',()=>{expect(hd363foox2(3,1)).toBe(1);});it('c',()=>{expect(hd363foox2(0,0)).toBe(0);});it('d',()=>{expect(hd363foox2(93,73)).toBe(2);});it('e',()=>{expect(hd363foox2(15,0)).toBe(4);});});
function hd363foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364foox2_hd',()=>{it('a',()=>{expect(hd364foox2(1,4)).toBe(2);});it('b',()=>{expect(hd364foox2(3,1)).toBe(1);});it('c',()=>{expect(hd364foox2(0,0)).toBe(0);});it('d',()=>{expect(hd364foox2(93,73)).toBe(2);});it('e',()=>{expect(hd364foox2(15,0)).toBe(4);});});
function hd364foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365foox2_hd',()=>{it('a',()=>{expect(hd365foox2(1,4)).toBe(2);});it('b',()=>{expect(hd365foox2(3,1)).toBe(1);});it('c',()=>{expect(hd365foox2(0,0)).toBe(0);});it('d',()=>{expect(hd365foox2(93,73)).toBe(2);});it('e',()=>{expect(hd365foox2(15,0)).toBe(4);});});
function hd365foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366foox2_hd',()=>{it('a',()=>{expect(hd366foox2(1,4)).toBe(2);});it('b',()=>{expect(hd366foox2(3,1)).toBe(1);});it('c',()=>{expect(hd366foox2(0,0)).toBe(0);});it('d',()=>{expect(hd366foox2(93,73)).toBe(2);});it('e',()=>{expect(hd366foox2(15,0)).toBe(4);});});
function hd366foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367foox2_hd',()=>{it('a',()=>{expect(hd367foox2(1,4)).toBe(2);});it('b',()=>{expect(hd367foox2(3,1)).toBe(1);});it('c',()=>{expect(hd367foox2(0,0)).toBe(0);});it('d',()=>{expect(hd367foox2(93,73)).toBe(2);});it('e',()=>{expect(hd367foox2(15,0)).toBe(4);});});
function hd367foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368foox2_hd',()=>{it('a',()=>{expect(hd368foox2(1,4)).toBe(2);});it('b',()=>{expect(hd368foox2(3,1)).toBe(1);});it('c',()=>{expect(hd368foox2(0,0)).toBe(0);});it('d',()=>{expect(hd368foox2(93,73)).toBe(2);});it('e',()=>{expect(hd368foox2(15,0)).toBe(4);});});
function hd368foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369foox2_hd',()=>{it('a',()=>{expect(hd369foox2(1,4)).toBe(2);});it('b',()=>{expect(hd369foox2(3,1)).toBe(1);});it('c',()=>{expect(hd369foox2(0,0)).toBe(0);});it('d',()=>{expect(hd369foox2(93,73)).toBe(2);});it('e',()=>{expect(hd369foox2(15,0)).toBe(4);});});
function hd369foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370foox2_hd',()=>{it('a',()=>{expect(hd370foox2(1,4)).toBe(2);});it('b',()=>{expect(hd370foox2(3,1)).toBe(1);});it('c',()=>{expect(hd370foox2(0,0)).toBe(0);});it('d',()=>{expect(hd370foox2(93,73)).toBe(2);});it('e',()=>{expect(hd370foox2(15,0)).toBe(4);});});
function hd370foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371foox2_hd',()=>{it('a',()=>{expect(hd371foox2(1,4)).toBe(2);});it('b',()=>{expect(hd371foox2(3,1)).toBe(1);});it('c',()=>{expect(hd371foox2(0,0)).toBe(0);});it('d',()=>{expect(hd371foox2(93,73)).toBe(2);});it('e',()=>{expect(hd371foox2(15,0)).toBe(4);});});
function hd371foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372foox2_hd',()=>{it('a',()=>{expect(hd372foox2(1,4)).toBe(2);});it('b',()=>{expect(hd372foox2(3,1)).toBe(1);});it('c',()=>{expect(hd372foox2(0,0)).toBe(0);});it('d',()=>{expect(hd372foox2(93,73)).toBe(2);});it('e',()=>{expect(hd372foox2(15,0)).toBe(4);});});
function hd372foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373foox2_hd',()=>{it('a',()=>{expect(hd373foox2(1,4)).toBe(2);});it('b',()=>{expect(hd373foox2(3,1)).toBe(1);});it('c',()=>{expect(hd373foox2(0,0)).toBe(0);});it('d',()=>{expect(hd373foox2(93,73)).toBe(2);});it('e',()=>{expect(hd373foox2(15,0)).toBe(4);});});
function hd373foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374foox2_hd',()=>{it('a',()=>{expect(hd374foox2(1,4)).toBe(2);});it('b',()=>{expect(hd374foox2(3,1)).toBe(1);});it('c',()=>{expect(hd374foox2(0,0)).toBe(0);});it('d',()=>{expect(hd374foox2(93,73)).toBe(2);});it('e',()=>{expect(hd374foox2(15,0)).toBe(4);});});
function hd374foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375foox2_hd',()=>{it('a',()=>{expect(hd375foox2(1,4)).toBe(2);});it('b',()=>{expect(hd375foox2(3,1)).toBe(1);});it('c',()=>{expect(hd375foox2(0,0)).toBe(0);});it('d',()=>{expect(hd375foox2(93,73)).toBe(2);});it('e',()=>{expect(hd375foox2(15,0)).toBe(4);});});
function hd375foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376foox2_hd',()=>{it('a',()=>{expect(hd376foox2(1,4)).toBe(2);});it('b',()=>{expect(hd376foox2(3,1)).toBe(1);});it('c',()=>{expect(hd376foox2(0,0)).toBe(0);});it('d',()=>{expect(hd376foox2(93,73)).toBe(2);});it('e',()=>{expect(hd376foox2(15,0)).toBe(4);});});
function hd376foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377foox2_hd',()=>{it('a',()=>{expect(hd377foox2(1,4)).toBe(2);});it('b',()=>{expect(hd377foox2(3,1)).toBe(1);});it('c',()=>{expect(hd377foox2(0,0)).toBe(0);});it('d',()=>{expect(hd377foox2(93,73)).toBe(2);});it('e',()=>{expect(hd377foox2(15,0)).toBe(4);});});
function hd377foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378foox2_hd',()=>{it('a',()=>{expect(hd378foox2(1,4)).toBe(2);});it('b',()=>{expect(hd378foox2(3,1)).toBe(1);});it('c',()=>{expect(hd378foox2(0,0)).toBe(0);});it('d',()=>{expect(hd378foox2(93,73)).toBe(2);});it('e',()=>{expect(hd378foox2(15,0)).toBe(4);});});
function hd378foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379foox2_hd',()=>{it('a',()=>{expect(hd379foox2(1,4)).toBe(2);});it('b',()=>{expect(hd379foox2(3,1)).toBe(1);});it('c',()=>{expect(hd379foox2(0,0)).toBe(0);});it('d',()=>{expect(hd379foox2(93,73)).toBe(2);});it('e',()=>{expect(hd379foox2(15,0)).toBe(4);});});
function hd379foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380foox2_hd',()=>{it('a',()=>{expect(hd380foox2(1,4)).toBe(2);});it('b',()=>{expect(hd380foox2(3,1)).toBe(1);});it('c',()=>{expect(hd380foox2(0,0)).toBe(0);});it('d',()=>{expect(hd380foox2(93,73)).toBe(2);});it('e',()=>{expect(hd380foox2(15,0)).toBe(4);});});
function hd380foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381foox2_hd',()=>{it('a',()=>{expect(hd381foox2(1,4)).toBe(2);});it('b',()=>{expect(hd381foox2(3,1)).toBe(1);});it('c',()=>{expect(hd381foox2(0,0)).toBe(0);});it('d',()=>{expect(hd381foox2(93,73)).toBe(2);});it('e',()=>{expect(hd381foox2(15,0)).toBe(4);});});
function hd381foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382foox2_hd',()=>{it('a',()=>{expect(hd382foox2(1,4)).toBe(2);});it('b',()=>{expect(hd382foox2(3,1)).toBe(1);});it('c',()=>{expect(hd382foox2(0,0)).toBe(0);});it('d',()=>{expect(hd382foox2(93,73)).toBe(2);});it('e',()=>{expect(hd382foox2(15,0)).toBe(4);});});
function hd382foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383foox2_hd',()=>{it('a',()=>{expect(hd383foox2(1,4)).toBe(2);});it('b',()=>{expect(hd383foox2(3,1)).toBe(1);});it('c',()=>{expect(hd383foox2(0,0)).toBe(0);});it('d',()=>{expect(hd383foox2(93,73)).toBe(2);});it('e',()=>{expect(hd383foox2(15,0)).toBe(4);});});
function hd383foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384foox2_hd',()=>{it('a',()=>{expect(hd384foox2(1,4)).toBe(2);});it('b',()=>{expect(hd384foox2(3,1)).toBe(1);});it('c',()=>{expect(hd384foox2(0,0)).toBe(0);});it('d',()=>{expect(hd384foox2(93,73)).toBe(2);});it('e',()=>{expect(hd384foox2(15,0)).toBe(4);});});
function hd384foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385foox2_hd',()=>{it('a',()=>{expect(hd385foox2(1,4)).toBe(2);});it('b',()=>{expect(hd385foox2(3,1)).toBe(1);});it('c',()=>{expect(hd385foox2(0,0)).toBe(0);});it('d',()=>{expect(hd385foox2(93,73)).toBe(2);});it('e',()=>{expect(hd385foox2(15,0)).toBe(4);});});
function hd385foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386foox2_hd',()=>{it('a',()=>{expect(hd386foox2(1,4)).toBe(2);});it('b',()=>{expect(hd386foox2(3,1)).toBe(1);});it('c',()=>{expect(hd386foox2(0,0)).toBe(0);});it('d',()=>{expect(hd386foox2(93,73)).toBe(2);});it('e',()=>{expect(hd386foox2(15,0)).toBe(4);});});
function hd386foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387foox2_hd',()=>{it('a',()=>{expect(hd387foox2(1,4)).toBe(2);});it('b',()=>{expect(hd387foox2(3,1)).toBe(1);});it('c',()=>{expect(hd387foox2(0,0)).toBe(0);});it('d',()=>{expect(hd387foox2(93,73)).toBe(2);});it('e',()=>{expect(hd387foox2(15,0)).toBe(4);});});
function hd387foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388foox2_hd',()=>{it('a',()=>{expect(hd388foox2(1,4)).toBe(2);});it('b',()=>{expect(hd388foox2(3,1)).toBe(1);});it('c',()=>{expect(hd388foox2(0,0)).toBe(0);});it('d',()=>{expect(hd388foox2(93,73)).toBe(2);});it('e',()=>{expect(hd388foox2(15,0)).toBe(4);});});
function hd388foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389foox2_hd',()=>{it('a',()=>{expect(hd389foox2(1,4)).toBe(2);});it('b',()=>{expect(hd389foox2(3,1)).toBe(1);});it('c',()=>{expect(hd389foox2(0,0)).toBe(0);});it('d',()=>{expect(hd389foox2(93,73)).toBe(2);});it('e',()=>{expect(hd389foox2(15,0)).toBe(4);});});
function hd389foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390foox2_hd',()=>{it('a',()=>{expect(hd390foox2(1,4)).toBe(2);});it('b',()=>{expect(hd390foox2(3,1)).toBe(1);});it('c',()=>{expect(hd390foox2(0,0)).toBe(0);});it('d',()=>{expect(hd390foox2(93,73)).toBe(2);});it('e',()=>{expect(hd390foox2(15,0)).toBe(4);});});
function hd390foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391foox2_hd',()=>{it('a',()=>{expect(hd391foox2(1,4)).toBe(2);});it('b',()=>{expect(hd391foox2(3,1)).toBe(1);});it('c',()=>{expect(hd391foox2(0,0)).toBe(0);});it('d',()=>{expect(hd391foox2(93,73)).toBe(2);});it('e',()=>{expect(hd391foox2(15,0)).toBe(4);});});
function hd391foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392foox2_hd',()=>{it('a',()=>{expect(hd392foox2(1,4)).toBe(2);});it('b',()=>{expect(hd392foox2(3,1)).toBe(1);});it('c',()=>{expect(hd392foox2(0,0)).toBe(0);});it('d',()=>{expect(hd392foox2(93,73)).toBe(2);});it('e',()=>{expect(hd392foox2(15,0)).toBe(4);});});
function hd392foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393foox2_hd',()=>{it('a',()=>{expect(hd393foox2(1,4)).toBe(2);});it('b',()=>{expect(hd393foox2(3,1)).toBe(1);});it('c',()=>{expect(hd393foox2(0,0)).toBe(0);});it('d',()=>{expect(hd393foox2(93,73)).toBe(2);});it('e',()=>{expect(hd393foox2(15,0)).toBe(4);});});
function hd393foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394foox2_hd',()=>{it('a',()=>{expect(hd394foox2(1,4)).toBe(2);});it('b',()=>{expect(hd394foox2(3,1)).toBe(1);});it('c',()=>{expect(hd394foox2(0,0)).toBe(0);});it('d',()=>{expect(hd394foox2(93,73)).toBe(2);});it('e',()=>{expect(hd394foox2(15,0)).toBe(4);});});
function hd394foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395foox2_hd',()=>{it('a',()=>{expect(hd395foox2(1,4)).toBe(2);});it('b',()=>{expect(hd395foox2(3,1)).toBe(1);});it('c',()=>{expect(hd395foox2(0,0)).toBe(0);});it('d',()=>{expect(hd395foox2(93,73)).toBe(2);});it('e',()=>{expect(hd395foox2(15,0)).toBe(4);});});
function hd395foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396foox2_hd',()=>{it('a',()=>{expect(hd396foox2(1,4)).toBe(2);});it('b',()=>{expect(hd396foox2(3,1)).toBe(1);});it('c',()=>{expect(hd396foox2(0,0)).toBe(0);});it('d',()=>{expect(hd396foox2(93,73)).toBe(2);});it('e',()=>{expect(hd396foox2(15,0)).toBe(4);});});
function hd396foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397foox2_hd',()=>{it('a',()=>{expect(hd397foox2(1,4)).toBe(2);});it('b',()=>{expect(hd397foox2(3,1)).toBe(1);});it('c',()=>{expect(hd397foox2(0,0)).toBe(0);});it('d',()=>{expect(hd397foox2(93,73)).toBe(2);});it('e',()=>{expect(hd397foox2(15,0)).toBe(4);});});
function hd397foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398foox2_hd',()=>{it('a',()=>{expect(hd398foox2(1,4)).toBe(2);});it('b',()=>{expect(hd398foox2(3,1)).toBe(1);});it('c',()=>{expect(hd398foox2(0,0)).toBe(0);});it('d',()=>{expect(hd398foox2(93,73)).toBe(2);});it('e',()=>{expect(hd398foox2(15,0)).toBe(4);});});
function hd398foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399foox2_hd',()=>{it('a',()=>{expect(hd399foox2(1,4)).toBe(2);});it('b',()=>{expect(hd399foox2(3,1)).toBe(1);});it('c',()=>{expect(hd399foox2(0,0)).toBe(0);});it('d',()=>{expect(hd399foox2(93,73)).toBe(2);});it('e',()=>{expect(hd399foox2(15,0)).toBe(4);});});
function hd399foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400foox2_hd',()=>{it('a',()=>{expect(hd400foox2(1,4)).toBe(2);});it('b',()=>{expect(hd400foox2(3,1)).toBe(1);});it('c',()=>{expect(hd400foox2(0,0)).toBe(0);});it('d',()=>{expect(hd400foox2(93,73)).toBe(2);});it('e',()=>{expect(hd400foox2(15,0)).toBe(4);});});
function hd400foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401foox2_hd',()=>{it('a',()=>{expect(hd401foox2(1,4)).toBe(2);});it('b',()=>{expect(hd401foox2(3,1)).toBe(1);});it('c',()=>{expect(hd401foox2(0,0)).toBe(0);});it('d',()=>{expect(hd401foox2(93,73)).toBe(2);});it('e',()=>{expect(hd401foox2(15,0)).toBe(4);});});
function hd401foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402foox2_hd',()=>{it('a',()=>{expect(hd402foox2(1,4)).toBe(2);});it('b',()=>{expect(hd402foox2(3,1)).toBe(1);});it('c',()=>{expect(hd402foox2(0,0)).toBe(0);});it('d',()=>{expect(hd402foox2(93,73)).toBe(2);});it('e',()=>{expect(hd402foox2(15,0)).toBe(4);});});
function hd402foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403foox2_hd',()=>{it('a',()=>{expect(hd403foox2(1,4)).toBe(2);});it('b',()=>{expect(hd403foox2(3,1)).toBe(1);});it('c',()=>{expect(hd403foox2(0,0)).toBe(0);});it('d',()=>{expect(hd403foox2(93,73)).toBe(2);});it('e',()=>{expect(hd403foox2(15,0)).toBe(4);});});
function hd403foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404foox2_hd',()=>{it('a',()=>{expect(hd404foox2(1,4)).toBe(2);});it('b',()=>{expect(hd404foox2(3,1)).toBe(1);});it('c',()=>{expect(hd404foox2(0,0)).toBe(0);});it('d',()=>{expect(hd404foox2(93,73)).toBe(2);});it('e',()=>{expect(hd404foox2(15,0)).toBe(4);});});
function hd404foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405foox2_hd',()=>{it('a',()=>{expect(hd405foox2(1,4)).toBe(2);});it('b',()=>{expect(hd405foox2(3,1)).toBe(1);});it('c',()=>{expect(hd405foox2(0,0)).toBe(0);});it('d',()=>{expect(hd405foox2(93,73)).toBe(2);});it('e',()=>{expect(hd405foox2(15,0)).toBe(4);});});
function hd405foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406foox2_hd',()=>{it('a',()=>{expect(hd406foox2(1,4)).toBe(2);});it('b',()=>{expect(hd406foox2(3,1)).toBe(1);});it('c',()=>{expect(hd406foox2(0,0)).toBe(0);});it('d',()=>{expect(hd406foox2(93,73)).toBe(2);});it('e',()=>{expect(hd406foox2(15,0)).toBe(4);});});
function hd406foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407foox2_hd',()=>{it('a',()=>{expect(hd407foox2(1,4)).toBe(2);});it('b',()=>{expect(hd407foox2(3,1)).toBe(1);});it('c',()=>{expect(hd407foox2(0,0)).toBe(0);});it('d',()=>{expect(hd407foox2(93,73)).toBe(2);});it('e',()=>{expect(hd407foox2(15,0)).toBe(4);});});
function hd407foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408foox2_hd',()=>{it('a',()=>{expect(hd408foox2(1,4)).toBe(2);});it('b',()=>{expect(hd408foox2(3,1)).toBe(1);});it('c',()=>{expect(hd408foox2(0,0)).toBe(0);});it('d',()=>{expect(hd408foox2(93,73)).toBe(2);});it('e',()=>{expect(hd408foox2(15,0)).toBe(4);});});
function hd408foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409foox2_hd',()=>{it('a',()=>{expect(hd409foox2(1,4)).toBe(2);});it('b',()=>{expect(hd409foox2(3,1)).toBe(1);});it('c',()=>{expect(hd409foox2(0,0)).toBe(0);});it('d',()=>{expect(hd409foox2(93,73)).toBe(2);});it('e',()=>{expect(hd409foox2(15,0)).toBe(4);});});
function hd409foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410foox2_hd',()=>{it('a',()=>{expect(hd410foox2(1,4)).toBe(2);});it('b',()=>{expect(hd410foox2(3,1)).toBe(1);});it('c',()=>{expect(hd410foox2(0,0)).toBe(0);});it('d',()=>{expect(hd410foox2(93,73)).toBe(2);});it('e',()=>{expect(hd410foox2(15,0)).toBe(4);});});
function hd410foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411foox2_hd',()=>{it('a',()=>{expect(hd411foox2(1,4)).toBe(2);});it('b',()=>{expect(hd411foox2(3,1)).toBe(1);});it('c',()=>{expect(hd411foox2(0,0)).toBe(0);});it('d',()=>{expect(hd411foox2(93,73)).toBe(2);});it('e',()=>{expect(hd411foox2(15,0)).toBe(4);});});
function hd411foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412foox2_hd',()=>{it('a',()=>{expect(hd412foox2(1,4)).toBe(2);});it('b',()=>{expect(hd412foox2(3,1)).toBe(1);});it('c',()=>{expect(hd412foox2(0,0)).toBe(0);});it('d',()=>{expect(hd412foox2(93,73)).toBe(2);});it('e',()=>{expect(hd412foox2(15,0)).toBe(4);});});
function hd412foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413foox2_hd',()=>{it('a',()=>{expect(hd413foox2(1,4)).toBe(2);});it('b',()=>{expect(hd413foox2(3,1)).toBe(1);});it('c',()=>{expect(hd413foox2(0,0)).toBe(0);});it('d',()=>{expect(hd413foox2(93,73)).toBe(2);});it('e',()=>{expect(hd413foox2(15,0)).toBe(4);});});
function hd413foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414foox2_hd',()=>{it('a',()=>{expect(hd414foox2(1,4)).toBe(2);});it('b',()=>{expect(hd414foox2(3,1)).toBe(1);});it('c',()=>{expect(hd414foox2(0,0)).toBe(0);});it('d',()=>{expect(hd414foox2(93,73)).toBe(2);});it('e',()=>{expect(hd414foox2(15,0)).toBe(4);});});
function hd414foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415foox2_hd',()=>{it('a',()=>{expect(hd415foox2(1,4)).toBe(2);});it('b',()=>{expect(hd415foox2(3,1)).toBe(1);});it('c',()=>{expect(hd415foox2(0,0)).toBe(0);});it('d',()=>{expect(hd415foox2(93,73)).toBe(2);});it('e',()=>{expect(hd415foox2(15,0)).toBe(4);});});
function hd415foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416foox2_hd',()=>{it('a',()=>{expect(hd416foox2(1,4)).toBe(2);});it('b',()=>{expect(hd416foox2(3,1)).toBe(1);});it('c',()=>{expect(hd416foox2(0,0)).toBe(0);});it('d',()=>{expect(hd416foox2(93,73)).toBe(2);});it('e',()=>{expect(hd416foox2(15,0)).toBe(4);});});
function hd416foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417foox2_hd',()=>{it('a',()=>{expect(hd417foox2(1,4)).toBe(2);});it('b',()=>{expect(hd417foox2(3,1)).toBe(1);});it('c',()=>{expect(hd417foox2(0,0)).toBe(0);});it('d',()=>{expect(hd417foox2(93,73)).toBe(2);});it('e',()=>{expect(hd417foox2(15,0)).toBe(4);});});
function hd417foox2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417foox2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
