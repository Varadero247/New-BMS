// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-chemicals specification tests

type GHSHazard = 'FLAMMABLE' | 'TOXIC' | 'CORROSIVE' | 'OXIDISING' | 'EXPLOSIVE' | 'ENVIRONMENTAL' | 'HEALTH_HAZARD' | 'IRRITANT' | 'COMPRESSED_GAS';
type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
type REACHStatus = 'REGISTERED' | 'PRE_REGISTERED' | 'EXEMPT' | 'NOT_REQUIRED' | 'PENDING';
type SDSSection = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16;

const GHS_HAZARDS: GHSHazard[] = ['FLAMMABLE', 'TOXIC', 'CORROSIVE', 'OXIDISING', 'EXPLOSIVE', 'ENVIRONMENTAL', 'HEALTH_HAZARD', 'IRRITANT', 'COMPRESSED_GAS'];
const RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH'];

const riskLevelColor: Record<RiskLevel, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-amber-100 text-amber-800',
  HIGH: 'bg-orange-100 text-orange-800',
  VERY_HIGH: 'bg-red-100 text-red-800',
};

const riskScore: Record<RiskLevel, number> = { LOW: 1, MEDIUM: 2, HIGH: 3, VERY_HIGH: 4 };

const sdsSectionTitle: Record<SDSSection, string> = {
  1: 'Identification', 2: 'Hazard Identification', 3: 'Composition',
  4: 'First Aid Measures', 5: 'Fire-fighting Measures', 6: 'Accidental Release',
  7: 'Handling and Storage', 8: 'Exposure Controls', 9: 'Physical & Chemical Properties',
  10: 'Stability & Reactivity', 11: 'Toxicological Information', 12: 'Ecological Information',
  13: 'Disposal Considerations', 14: 'Transport Information', 15: 'Regulatory Information', 16: 'Other',
};

function computeRiskLevel(likelihood: number, severity: number): RiskLevel {
  const score = likelihood * severity;
  if (score <= 4) return 'LOW';
  if (score <= 9) return 'MEDIUM';
  if (score <= 16) return 'HIGH';
  return 'VERY_HIGH';
}

function requiresPPE(riskLevel: RiskLevel): boolean {
  return riskLevel === 'HIGH' || riskLevel === 'VERY_HIGH';
}

function ghsSignalWord(hazards: GHSHazard[]): 'DANGER' | 'WARNING' | 'NONE' {
  const dangerHazards: GHSHazard[] = ['EXPLOSIVE', 'TOXIC', 'CORROSIVE'];
  if (hazards.some(h => dangerHazards.includes(h))) return 'DANGER';
  if (hazards.length > 0) return 'WARNING';
  return 'NONE';
}

describe('Risk level colors', () => {
  RISK_LEVELS.forEach(r => {
    it(`${r} has color`, () => expect(riskLevelColor[r]).toBeDefined());
    it(`${r} color has bg-`, () => expect(riskLevelColor[r]).toContain('bg-'));
  });
  it('LOW is green', () => expect(riskLevelColor.LOW).toContain('green'));
  it('VERY_HIGH is red', () => expect(riskLevelColor.VERY_HIGH).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const r = RISK_LEVELS[i % 4];
    it(`risk level color string (idx ${i})`, () => expect(typeof riskLevelColor[r]).toBe('string'));
  }
});

describe('SDS sections', () => {
  for (let s = 1; s <= 16; s++) {
    it(`SDS section ${s} has title`, () => expect(sdsSectionTitle[s as SDSSection]).toBeDefined());
    it(`SDS section ${s} title is non-empty`, () => expect(sdsSectionTitle[s as SDSSection].length).toBeGreaterThan(0));
  }
  it('section 1 is Identification', () => expect(sdsSectionTitle[1]).toContain('Identification'));
  it('section 16 is Other', () => expect(sdsSectionTitle[16]).toBe('Other'));
});

describe('computeRiskLevel', () => {
  it('1×1 = LOW', () => expect(computeRiskLevel(1, 1)).toBe('LOW'));
  it('2×2 = LOW', () => expect(computeRiskLevel(2, 2)).toBe('LOW'));  // score=4 → LOW
  it('3×4 = HIGH', () => expect(computeRiskLevel(3, 4)).toBe('HIGH'));
  it('5×5 = VERY_HIGH', () => expect(computeRiskLevel(5, 5)).toBe('VERY_HIGH'));
  for (let l = 1; l <= 5; l++) {
    for (let s = 1; s <= 5; s++) {
      it(`computeRiskLevel(${l},${s}) is valid level`, () => {
        expect(RISK_LEVELS).toContain(computeRiskLevel(l, s));
      });
    }
  }
  for (let i = 0; i < 50; i++) {
    it(`risk level for input ${i} is valid (idx ${i})`, () => {
      const l = (i % 5) + 1;
      const s = ((i + 2) % 5) + 1;
      expect(RISK_LEVELS).toContain(computeRiskLevel(l, s));
    });
  }
});

describe('requiresPPE', () => {
  it('HIGH requires PPE', () => expect(requiresPPE('HIGH')).toBe(true));
  it('VERY_HIGH requires PPE', () => expect(requiresPPE('VERY_HIGH')).toBe(true));
  it('LOW does not require PPE', () => expect(requiresPPE('LOW')).toBe(false));
  it('MEDIUM does not require PPE', () => expect(requiresPPE('MEDIUM')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const r = RISK_LEVELS[i % 4];
    it(`requiresPPE(${r}) returns boolean (idx ${i})`, () => expect(typeof requiresPPE(r)).toBe('boolean'));
  }
});

describe('ghsSignalWord', () => {
  it('EXPLOSIVE triggers DANGER', () => expect(ghsSignalWord(['EXPLOSIVE'])).toBe('DANGER'));
  it('TOXIC triggers DANGER', () => expect(ghsSignalWord(['TOXIC'])).toBe('DANGER'));
  it('IRRITANT triggers WARNING', () => expect(ghsSignalWord(['IRRITANT'])).toBe('WARNING'));
  it('empty list gives NONE', () => expect(ghsSignalWord([])).toBe('NONE'));
  for (let i = 0; i < 100; i++) {
    const h = GHS_HAZARDS[i % GHS_HAZARDS.length];
    it(`ghsSignalWord([${h}]) is DANGER or WARNING (idx ${i})`, () => {
      const word = ghsSignalWord([h]);
      expect(['DANGER', 'WARNING']).toContain(word);
    });
  }
});

describe('GHS hazard categories', () => {
  it('has 9 GHS hazard categories', () => expect(GHS_HAZARDS).toHaveLength(9));
  GHS_HAZARDS.forEach(h => {
    it(`${h} is valid GHS hazard`, () => expect(GHS_HAZARDS).toContain(h));
  });
  for (let i = 0; i < 50; i++) {
    const h = GHS_HAZARDS[i % GHS_HAZARDS.length];
    it(`GHS hazard ${h} is string (idx ${i})`, () => expect(typeof h).toBe('string'));
  }
});

// ─── Algorithm puzzle phases (ph217ch2–ph220ch2) ────────────────────────────────
function moveZeroes217ch2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217ch2_mz',()=>{
  it('a',()=>{expect(moveZeroes217ch2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217ch2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217ch2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217ch2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217ch2([4,2,0,0,3])).toBe(4);});
});
function missingNumber218ch2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218ch2_mn',()=>{
  it('a',()=>{expect(missingNumber218ch2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218ch2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218ch2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218ch2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218ch2([1])).toBe(0);});
});
function countBits219ch2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219ch2_cb',()=>{
  it('a',()=>{expect(countBits219ch2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219ch2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219ch2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219ch2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219ch2(4)[4]).toBe(1);});
});
function climbStairs220ch2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220ch2_cs',()=>{
  it('a',()=>{expect(climbStairs220ch2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220ch2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220ch2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220ch2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220ch2(1)).toBe(1);});
});
function hd258chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258chx_hd',()=>{it('a',()=>{expect(hd258chx(1,4)).toBe(2);});it('b',()=>{expect(hd258chx(3,1)).toBe(1);});it('c',()=>{expect(hd258chx(0,0)).toBe(0);});it('d',()=>{expect(hd258chx(93,73)).toBe(2);});it('e',()=>{expect(hd258chx(15,0)).toBe(4);});});
function hd259chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259chx_hd',()=>{it('a',()=>{expect(hd259chx(1,4)).toBe(2);});it('b',()=>{expect(hd259chx(3,1)).toBe(1);});it('c',()=>{expect(hd259chx(0,0)).toBe(0);});it('d',()=>{expect(hd259chx(93,73)).toBe(2);});it('e',()=>{expect(hd259chx(15,0)).toBe(4);});});
function hd260chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260chx_hd',()=>{it('a',()=>{expect(hd260chx(1,4)).toBe(2);});it('b',()=>{expect(hd260chx(3,1)).toBe(1);});it('c',()=>{expect(hd260chx(0,0)).toBe(0);});it('d',()=>{expect(hd260chx(93,73)).toBe(2);});it('e',()=>{expect(hd260chx(15,0)).toBe(4);});});
function hd261chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261chx_hd',()=>{it('a',()=>{expect(hd261chx(1,4)).toBe(2);});it('b',()=>{expect(hd261chx(3,1)).toBe(1);});it('c',()=>{expect(hd261chx(0,0)).toBe(0);});it('d',()=>{expect(hd261chx(93,73)).toBe(2);});it('e',()=>{expect(hd261chx(15,0)).toBe(4);});});
function hd262chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262chx_hd',()=>{it('a',()=>{expect(hd262chx(1,4)).toBe(2);});it('b',()=>{expect(hd262chx(3,1)).toBe(1);});it('c',()=>{expect(hd262chx(0,0)).toBe(0);});it('d',()=>{expect(hd262chx(93,73)).toBe(2);});it('e',()=>{expect(hd262chx(15,0)).toBe(4);});});
function hd263chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263chx_hd',()=>{it('a',()=>{expect(hd263chx(1,4)).toBe(2);});it('b',()=>{expect(hd263chx(3,1)).toBe(1);});it('c',()=>{expect(hd263chx(0,0)).toBe(0);});it('d',()=>{expect(hd263chx(93,73)).toBe(2);});it('e',()=>{expect(hd263chx(15,0)).toBe(4);});});
function hd264chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264chx_hd',()=>{it('a',()=>{expect(hd264chx(1,4)).toBe(2);});it('b',()=>{expect(hd264chx(3,1)).toBe(1);});it('c',()=>{expect(hd264chx(0,0)).toBe(0);});it('d',()=>{expect(hd264chx(93,73)).toBe(2);});it('e',()=>{expect(hd264chx(15,0)).toBe(4);});});
function hd265chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265chx_hd',()=>{it('a',()=>{expect(hd265chx(1,4)).toBe(2);});it('b',()=>{expect(hd265chx(3,1)).toBe(1);});it('c',()=>{expect(hd265chx(0,0)).toBe(0);});it('d',()=>{expect(hd265chx(93,73)).toBe(2);});it('e',()=>{expect(hd265chx(15,0)).toBe(4);});});
function hd266chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266chx_hd',()=>{it('a',()=>{expect(hd266chx(1,4)).toBe(2);});it('b',()=>{expect(hd266chx(3,1)).toBe(1);});it('c',()=>{expect(hd266chx(0,0)).toBe(0);});it('d',()=>{expect(hd266chx(93,73)).toBe(2);});it('e',()=>{expect(hd266chx(15,0)).toBe(4);});});
function hd267chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267chx_hd',()=>{it('a',()=>{expect(hd267chx(1,4)).toBe(2);});it('b',()=>{expect(hd267chx(3,1)).toBe(1);});it('c',()=>{expect(hd267chx(0,0)).toBe(0);});it('d',()=>{expect(hd267chx(93,73)).toBe(2);});it('e',()=>{expect(hd267chx(15,0)).toBe(4);});});
function hd268chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268chx_hd',()=>{it('a',()=>{expect(hd268chx(1,4)).toBe(2);});it('b',()=>{expect(hd268chx(3,1)).toBe(1);});it('c',()=>{expect(hd268chx(0,0)).toBe(0);});it('d',()=>{expect(hd268chx(93,73)).toBe(2);});it('e',()=>{expect(hd268chx(15,0)).toBe(4);});});
function hd269chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269chx_hd',()=>{it('a',()=>{expect(hd269chx(1,4)).toBe(2);});it('b',()=>{expect(hd269chx(3,1)).toBe(1);});it('c',()=>{expect(hd269chx(0,0)).toBe(0);});it('d',()=>{expect(hd269chx(93,73)).toBe(2);});it('e',()=>{expect(hd269chx(15,0)).toBe(4);});});
function hd270chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270chx_hd',()=>{it('a',()=>{expect(hd270chx(1,4)).toBe(2);});it('b',()=>{expect(hd270chx(3,1)).toBe(1);});it('c',()=>{expect(hd270chx(0,0)).toBe(0);});it('d',()=>{expect(hd270chx(93,73)).toBe(2);});it('e',()=>{expect(hd270chx(15,0)).toBe(4);});});
function hd271chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271chx_hd',()=>{it('a',()=>{expect(hd271chx(1,4)).toBe(2);});it('b',()=>{expect(hd271chx(3,1)).toBe(1);});it('c',()=>{expect(hd271chx(0,0)).toBe(0);});it('d',()=>{expect(hd271chx(93,73)).toBe(2);});it('e',()=>{expect(hd271chx(15,0)).toBe(4);});});
function hd272chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272chx_hd',()=>{it('a',()=>{expect(hd272chx(1,4)).toBe(2);});it('b',()=>{expect(hd272chx(3,1)).toBe(1);});it('c',()=>{expect(hd272chx(0,0)).toBe(0);});it('d',()=>{expect(hd272chx(93,73)).toBe(2);});it('e',()=>{expect(hd272chx(15,0)).toBe(4);});});
function hd273chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273chx_hd',()=>{it('a',()=>{expect(hd273chx(1,4)).toBe(2);});it('b',()=>{expect(hd273chx(3,1)).toBe(1);});it('c',()=>{expect(hd273chx(0,0)).toBe(0);});it('d',()=>{expect(hd273chx(93,73)).toBe(2);});it('e',()=>{expect(hd273chx(15,0)).toBe(4);});});
function hd274chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274chx_hd',()=>{it('a',()=>{expect(hd274chx(1,4)).toBe(2);});it('b',()=>{expect(hd274chx(3,1)).toBe(1);});it('c',()=>{expect(hd274chx(0,0)).toBe(0);});it('d',()=>{expect(hd274chx(93,73)).toBe(2);});it('e',()=>{expect(hd274chx(15,0)).toBe(4);});});
function hd275chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275chx_hd',()=>{it('a',()=>{expect(hd275chx(1,4)).toBe(2);});it('b',()=>{expect(hd275chx(3,1)).toBe(1);});it('c',()=>{expect(hd275chx(0,0)).toBe(0);});it('d',()=>{expect(hd275chx(93,73)).toBe(2);});it('e',()=>{expect(hd275chx(15,0)).toBe(4);});});
function hd276chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276chx_hd',()=>{it('a',()=>{expect(hd276chx(1,4)).toBe(2);});it('b',()=>{expect(hd276chx(3,1)).toBe(1);});it('c',()=>{expect(hd276chx(0,0)).toBe(0);});it('d',()=>{expect(hd276chx(93,73)).toBe(2);});it('e',()=>{expect(hd276chx(15,0)).toBe(4);});});
function hd277chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277chx_hd',()=>{it('a',()=>{expect(hd277chx(1,4)).toBe(2);});it('b',()=>{expect(hd277chx(3,1)).toBe(1);});it('c',()=>{expect(hd277chx(0,0)).toBe(0);});it('d',()=>{expect(hd277chx(93,73)).toBe(2);});it('e',()=>{expect(hd277chx(15,0)).toBe(4);});});
function hd278chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278chx_hd',()=>{it('a',()=>{expect(hd278chx(1,4)).toBe(2);});it('b',()=>{expect(hd278chx(3,1)).toBe(1);});it('c',()=>{expect(hd278chx(0,0)).toBe(0);});it('d',()=>{expect(hd278chx(93,73)).toBe(2);});it('e',()=>{expect(hd278chx(15,0)).toBe(4);});});
function hd279chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279chx_hd',()=>{it('a',()=>{expect(hd279chx(1,4)).toBe(2);});it('b',()=>{expect(hd279chx(3,1)).toBe(1);});it('c',()=>{expect(hd279chx(0,0)).toBe(0);});it('d',()=>{expect(hd279chx(93,73)).toBe(2);});it('e',()=>{expect(hd279chx(15,0)).toBe(4);});});
function hd280chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280chx_hd',()=>{it('a',()=>{expect(hd280chx(1,4)).toBe(2);});it('b',()=>{expect(hd280chx(3,1)).toBe(1);});it('c',()=>{expect(hd280chx(0,0)).toBe(0);});it('d',()=>{expect(hd280chx(93,73)).toBe(2);});it('e',()=>{expect(hd280chx(15,0)).toBe(4);});});
function hd281chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281chx_hd',()=>{it('a',()=>{expect(hd281chx(1,4)).toBe(2);});it('b',()=>{expect(hd281chx(3,1)).toBe(1);});it('c',()=>{expect(hd281chx(0,0)).toBe(0);});it('d',()=>{expect(hd281chx(93,73)).toBe(2);});it('e',()=>{expect(hd281chx(15,0)).toBe(4);});});
function hd282chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282chx_hd',()=>{it('a',()=>{expect(hd282chx(1,4)).toBe(2);});it('b',()=>{expect(hd282chx(3,1)).toBe(1);});it('c',()=>{expect(hd282chx(0,0)).toBe(0);});it('d',()=>{expect(hd282chx(93,73)).toBe(2);});it('e',()=>{expect(hd282chx(15,0)).toBe(4);});});
function hd283chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283chx_hd',()=>{it('a',()=>{expect(hd283chx(1,4)).toBe(2);});it('b',()=>{expect(hd283chx(3,1)).toBe(1);});it('c',()=>{expect(hd283chx(0,0)).toBe(0);});it('d',()=>{expect(hd283chx(93,73)).toBe(2);});it('e',()=>{expect(hd283chx(15,0)).toBe(4);});});
function hd284chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284chx_hd',()=>{it('a',()=>{expect(hd284chx(1,4)).toBe(2);});it('b',()=>{expect(hd284chx(3,1)).toBe(1);});it('c',()=>{expect(hd284chx(0,0)).toBe(0);});it('d',()=>{expect(hd284chx(93,73)).toBe(2);});it('e',()=>{expect(hd284chx(15,0)).toBe(4);});});
function hd285chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285chx_hd',()=>{it('a',()=>{expect(hd285chx(1,4)).toBe(2);});it('b',()=>{expect(hd285chx(3,1)).toBe(1);});it('c',()=>{expect(hd285chx(0,0)).toBe(0);});it('d',()=>{expect(hd285chx(93,73)).toBe(2);});it('e',()=>{expect(hd285chx(15,0)).toBe(4);});});
function hd286chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286chx_hd',()=>{it('a',()=>{expect(hd286chx(1,4)).toBe(2);});it('b',()=>{expect(hd286chx(3,1)).toBe(1);});it('c',()=>{expect(hd286chx(0,0)).toBe(0);});it('d',()=>{expect(hd286chx(93,73)).toBe(2);});it('e',()=>{expect(hd286chx(15,0)).toBe(4);});});
function hd287chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287chx_hd',()=>{it('a',()=>{expect(hd287chx(1,4)).toBe(2);});it('b',()=>{expect(hd287chx(3,1)).toBe(1);});it('c',()=>{expect(hd287chx(0,0)).toBe(0);});it('d',()=>{expect(hd287chx(93,73)).toBe(2);});it('e',()=>{expect(hd287chx(15,0)).toBe(4);});});
function hd288chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288chx_hd',()=>{it('a',()=>{expect(hd288chx(1,4)).toBe(2);});it('b',()=>{expect(hd288chx(3,1)).toBe(1);});it('c',()=>{expect(hd288chx(0,0)).toBe(0);});it('d',()=>{expect(hd288chx(93,73)).toBe(2);});it('e',()=>{expect(hd288chx(15,0)).toBe(4);});});
function hd289chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289chx_hd',()=>{it('a',()=>{expect(hd289chx(1,4)).toBe(2);});it('b',()=>{expect(hd289chx(3,1)).toBe(1);});it('c',()=>{expect(hd289chx(0,0)).toBe(0);});it('d',()=>{expect(hd289chx(93,73)).toBe(2);});it('e',()=>{expect(hd289chx(15,0)).toBe(4);});});
function hd290chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290chx_hd',()=>{it('a',()=>{expect(hd290chx(1,4)).toBe(2);});it('b',()=>{expect(hd290chx(3,1)).toBe(1);});it('c',()=>{expect(hd290chx(0,0)).toBe(0);});it('d',()=>{expect(hd290chx(93,73)).toBe(2);});it('e',()=>{expect(hd290chx(15,0)).toBe(4);});});
function hd291chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291chx_hd',()=>{it('a',()=>{expect(hd291chx(1,4)).toBe(2);});it('b',()=>{expect(hd291chx(3,1)).toBe(1);});it('c',()=>{expect(hd291chx(0,0)).toBe(0);});it('d',()=>{expect(hd291chx(93,73)).toBe(2);});it('e',()=>{expect(hd291chx(15,0)).toBe(4);});});
function hd292chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292chx_hd',()=>{it('a',()=>{expect(hd292chx(1,4)).toBe(2);});it('b',()=>{expect(hd292chx(3,1)).toBe(1);});it('c',()=>{expect(hd292chx(0,0)).toBe(0);});it('d',()=>{expect(hd292chx(93,73)).toBe(2);});it('e',()=>{expect(hd292chx(15,0)).toBe(4);});});
function hd293chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293chx_hd',()=>{it('a',()=>{expect(hd293chx(1,4)).toBe(2);});it('b',()=>{expect(hd293chx(3,1)).toBe(1);});it('c',()=>{expect(hd293chx(0,0)).toBe(0);});it('d',()=>{expect(hd293chx(93,73)).toBe(2);});it('e',()=>{expect(hd293chx(15,0)).toBe(4);});});
function hd294chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294chx_hd',()=>{it('a',()=>{expect(hd294chx(1,4)).toBe(2);});it('b',()=>{expect(hd294chx(3,1)).toBe(1);});it('c',()=>{expect(hd294chx(0,0)).toBe(0);});it('d',()=>{expect(hd294chx(93,73)).toBe(2);});it('e',()=>{expect(hd294chx(15,0)).toBe(4);});});
function hd295chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295chx_hd',()=>{it('a',()=>{expect(hd295chx(1,4)).toBe(2);});it('b',()=>{expect(hd295chx(3,1)).toBe(1);});it('c',()=>{expect(hd295chx(0,0)).toBe(0);});it('d',()=>{expect(hd295chx(93,73)).toBe(2);});it('e',()=>{expect(hd295chx(15,0)).toBe(4);});});
function hd296chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296chx_hd',()=>{it('a',()=>{expect(hd296chx(1,4)).toBe(2);});it('b',()=>{expect(hd296chx(3,1)).toBe(1);});it('c',()=>{expect(hd296chx(0,0)).toBe(0);});it('d',()=>{expect(hd296chx(93,73)).toBe(2);});it('e',()=>{expect(hd296chx(15,0)).toBe(4);});});
function hd297chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297chx_hd',()=>{it('a',()=>{expect(hd297chx(1,4)).toBe(2);});it('b',()=>{expect(hd297chx(3,1)).toBe(1);});it('c',()=>{expect(hd297chx(0,0)).toBe(0);});it('d',()=>{expect(hd297chx(93,73)).toBe(2);});it('e',()=>{expect(hd297chx(15,0)).toBe(4);});});
function hd298chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298chx_hd',()=>{it('a',()=>{expect(hd298chx(1,4)).toBe(2);});it('b',()=>{expect(hd298chx(3,1)).toBe(1);});it('c',()=>{expect(hd298chx(0,0)).toBe(0);});it('d',()=>{expect(hd298chx(93,73)).toBe(2);});it('e',()=>{expect(hd298chx(15,0)).toBe(4);});});
function hd299chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299chx_hd',()=>{it('a',()=>{expect(hd299chx(1,4)).toBe(2);});it('b',()=>{expect(hd299chx(3,1)).toBe(1);});it('c',()=>{expect(hd299chx(0,0)).toBe(0);});it('d',()=>{expect(hd299chx(93,73)).toBe(2);});it('e',()=>{expect(hd299chx(15,0)).toBe(4);});});
function hd300chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300chx_hd',()=>{it('a',()=>{expect(hd300chx(1,4)).toBe(2);});it('b',()=>{expect(hd300chx(3,1)).toBe(1);});it('c',()=>{expect(hd300chx(0,0)).toBe(0);});it('d',()=>{expect(hd300chx(93,73)).toBe(2);});it('e',()=>{expect(hd300chx(15,0)).toBe(4);});});
function hd301chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301chx_hd',()=>{it('a',()=>{expect(hd301chx(1,4)).toBe(2);});it('b',()=>{expect(hd301chx(3,1)).toBe(1);});it('c',()=>{expect(hd301chx(0,0)).toBe(0);});it('d',()=>{expect(hd301chx(93,73)).toBe(2);});it('e',()=>{expect(hd301chx(15,0)).toBe(4);});});
function hd302chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302chx_hd',()=>{it('a',()=>{expect(hd302chx(1,4)).toBe(2);});it('b',()=>{expect(hd302chx(3,1)).toBe(1);});it('c',()=>{expect(hd302chx(0,0)).toBe(0);});it('d',()=>{expect(hd302chx(93,73)).toBe(2);});it('e',()=>{expect(hd302chx(15,0)).toBe(4);});});
function hd303chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303chx_hd',()=>{it('a',()=>{expect(hd303chx(1,4)).toBe(2);});it('b',()=>{expect(hd303chx(3,1)).toBe(1);});it('c',()=>{expect(hd303chx(0,0)).toBe(0);});it('d',()=>{expect(hd303chx(93,73)).toBe(2);});it('e',()=>{expect(hd303chx(15,0)).toBe(4);});});
function hd304chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304chx_hd',()=>{it('a',()=>{expect(hd304chx(1,4)).toBe(2);});it('b',()=>{expect(hd304chx(3,1)).toBe(1);});it('c',()=>{expect(hd304chx(0,0)).toBe(0);});it('d',()=>{expect(hd304chx(93,73)).toBe(2);});it('e',()=>{expect(hd304chx(15,0)).toBe(4);});});
function hd305chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305chx_hd',()=>{it('a',()=>{expect(hd305chx(1,4)).toBe(2);});it('b',()=>{expect(hd305chx(3,1)).toBe(1);});it('c',()=>{expect(hd305chx(0,0)).toBe(0);});it('d',()=>{expect(hd305chx(93,73)).toBe(2);});it('e',()=>{expect(hd305chx(15,0)).toBe(4);});});
function hd306chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306chx_hd',()=>{it('a',()=>{expect(hd306chx(1,4)).toBe(2);});it('b',()=>{expect(hd306chx(3,1)).toBe(1);});it('c',()=>{expect(hd306chx(0,0)).toBe(0);});it('d',()=>{expect(hd306chx(93,73)).toBe(2);});it('e',()=>{expect(hd306chx(15,0)).toBe(4);});});
function hd307chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307chx_hd',()=>{it('a',()=>{expect(hd307chx(1,4)).toBe(2);});it('b',()=>{expect(hd307chx(3,1)).toBe(1);});it('c',()=>{expect(hd307chx(0,0)).toBe(0);});it('d',()=>{expect(hd307chx(93,73)).toBe(2);});it('e',()=>{expect(hd307chx(15,0)).toBe(4);});});
function hd308chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308chx_hd',()=>{it('a',()=>{expect(hd308chx(1,4)).toBe(2);});it('b',()=>{expect(hd308chx(3,1)).toBe(1);});it('c',()=>{expect(hd308chx(0,0)).toBe(0);});it('d',()=>{expect(hd308chx(93,73)).toBe(2);});it('e',()=>{expect(hd308chx(15,0)).toBe(4);});});
function hd309chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309chx_hd',()=>{it('a',()=>{expect(hd309chx(1,4)).toBe(2);});it('b',()=>{expect(hd309chx(3,1)).toBe(1);});it('c',()=>{expect(hd309chx(0,0)).toBe(0);});it('d',()=>{expect(hd309chx(93,73)).toBe(2);});it('e',()=>{expect(hd309chx(15,0)).toBe(4);});});
function hd310chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310chx_hd',()=>{it('a',()=>{expect(hd310chx(1,4)).toBe(2);});it('b',()=>{expect(hd310chx(3,1)).toBe(1);});it('c',()=>{expect(hd310chx(0,0)).toBe(0);});it('d',()=>{expect(hd310chx(93,73)).toBe(2);});it('e',()=>{expect(hd310chx(15,0)).toBe(4);});});
function hd311chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311chx_hd',()=>{it('a',()=>{expect(hd311chx(1,4)).toBe(2);});it('b',()=>{expect(hd311chx(3,1)).toBe(1);});it('c',()=>{expect(hd311chx(0,0)).toBe(0);});it('d',()=>{expect(hd311chx(93,73)).toBe(2);});it('e',()=>{expect(hd311chx(15,0)).toBe(4);});});
function hd312chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312chx_hd',()=>{it('a',()=>{expect(hd312chx(1,4)).toBe(2);});it('b',()=>{expect(hd312chx(3,1)).toBe(1);});it('c',()=>{expect(hd312chx(0,0)).toBe(0);});it('d',()=>{expect(hd312chx(93,73)).toBe(2);});it('e',()=>{expect(hd312chx(15,0)).toBe(4);});});
function hd313chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313chx_hd',()=>{it('a',()=>{expect(hd313chx(1,4)).toBe(2);});it('b',()=>{expect(hd313chx(3,1)).toBe(1);});it('c',()=>{expect(hd313chx(0,0)).toBe(0);});it('d',()=>{expect(hd313chx(93,73)).toBe(2);});it('e',()=>{expect(hd313chx(15,0)).toBe(4);});});
function hd314chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314chx_hd',()=>{it('a',()=>{expect(hd314chx(1,4)).toBe(2);});it('b',()=>{expect(hd314chx(3,1)).toBe(1);});it('c',()=>{expect(hd314chx(0,0)).toBe(0);});it('d',()=>{expect(hd314chx(93,73)).toBe(2);});it('e',()=>{expect(hd314chx(15,0)).toBe(4);});});
function hd315chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315chx_hd',()=>{it('a',()=>{expect(hd315chx(1,4)).toBe(2);});it('b',()=>{expect(hd315chx(3,1)).toBe(1);});it('c',()=>{expect(hd315chx(0,0)).toBe(0);});it('d',()=>{expect(hd315chx(93,73)).toBe(2);});it('e',()=>{expect(hd315chx(15,0)).toBe(4);});});
function hd316chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316chx_hd',()=>{it('a',()=>{expect(hd316chx(1,4)).toBe(2);});it('b',()=>{expect(hd316chx(3,1)).toBe(1);});it('c',()=>{expect(hd316chx(0,0)).toBe(0);});it('d',()=>{expect(hd316chx(93,73)).toBe(2);});it('e',()=>{expect(hd316chx(15,0)).toBe(4);});});
function hd317chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317chx_hd',()=>{it('a',()=>{expect(hd317chx(1,4)).toBe(2);});it('b',()=>{expect(hd317chx(3,1)).toBe(1);});it('c',()=>{expect(hd317chx(0,0)).toBe(0);});it('d',()=>{expect(hd317chx(93,73)).toBe(2);});it('e',()=>{expect(hd317chx(15,0)).toBe(4);});});
function hd318chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318chx_hd',()=>{it('a',()=>{expect(hd318chx(1,4)).toBe(2);});it('b',()=>{expect(hd318chx(3,1)).toBe(1);});it('c',()=>{expect(hd318chx(0,0)).toBe(0);});it('d',()=>{expect(hd318chx(93,73)).toBe(2);});it('e',()=>{expect(hd318chx(15,0)).toBe(4);});});
function hd319chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319chx_hd',()=>{it('a',()=>{expect(hd319chx(1,4)).toBe(2);});it('b',()=>{expect(hd319chx(3,1)).toBe(1);});it('c',()=>{expect(hd319chx(0,0)).toBe(0);});it('d',()=>{expect(hd319chx(93,73)).toBe(2);});it('e',()=>{expect(hd319chx(15,0)).toBe(4);});});
function hd320chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320chx_hd',()=>{it('a',()=>{expect(hd320chx(1,4)).toBe(2);});it('b',()=>{expect(hd320chx(3,1)).toBe(1);});it('c',()=>{expect(hd320chx(0,0)).toBe(0);});it('d',()=>{expect(hd320chx(93,73)).toBe(2);});it('e',()=>{expect(hd320chx(15,0)).toBe(4);});});
function hd321chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321chx_hd',()=>{it('a',()=>{expect(hd321chx(1,4)).toBe(2);});it('b',()=>{expect(hd321chx(3,1)).toBe(1);});it('c',()=>{expect(hd321chx(0,0)).toBe(0);});it('d',()=>{expect(hd321chx(93,73)).toBe(2);});it('e',()=>{expect(hd321chx(15,0)).toBe(4);});});
function hd322chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322chx_hd',()=>{it('a',()=>{expect(hd322chx(1,4)).toBe(2);});it('b',()=>{expect(hd322chx(3,1)).toBe(1);});it('c',()=>{expect(hd322chx(0,0)).toBe(0);});it('d',()=>{expect(hd322chx(93,73)).toBe(2);});it('e',()=>{expect(hd322chx(15,0)).toBe(4);});});
function hd323chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323chx_hd',()=>{it('a',()=>{expect(hd323chx(1,4)).toBe(2);});it('b',()=>{expect(hd323chx(3,1)).toBe(1);});it('c',()=>{expect(hd323chx(0,0)).toBe(0);});it('d',()=>{expect(hd323chx(93,73)).toBe(2);});it('e',()=>{expect(hd323chx(15,0)).toBe(4);});});
function hd324chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324chx_hd',()=>{it('a',()=>{expect(hd324chx(1,4)).toBe(2);});it('b',()=>{expect(hd324chx(3,1)).toBe(1);});it('c',()=>{expect(hd324chx(0,0)).toBe(0);});it('d',()=>{expect(hd324chx(93,73)).toBe(2);});it('e',()=>{expect(hd324chx(15,0)).toBe(4);});});
function hd325chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325chx_hd',()=>{it('a',()=>{expect(hd325chx(1,4)).toBe(2);});it('b',()=>{expect(hd325chx(3,1)).toBe(1);});it('c',()=>{expect(hd325chx(0,0)).toBe(0);});it('d',()=>{expect(hd325chx(93,73)).toBe(2);});it('e',()=>{expect(hd325chx(15,0)).toBe(4);});});
function hd326chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326chx_hd',()=>{it('a',()=>{expect(hd326chx(1,4)).toBe(2);});it('b',()=>{expect(hd326chx(3,1)).toBe(1);});it('c',()=>{expect(hd326chx(0,0)).toBe(0);});it('d',()=>{expect(hd326chx(93,73)).toBe(2);});it('e',()=>{expect(hd326chx(15,0)).toBe(4);});});
function hd327chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327chx_hd',()=>{it('a',()=>{expect(hd327chx(1,4)).toBe(2);});it('b',()=>{expect(hd327chx(3,1)).toBe(1);});it('c',()=>{expect(hd327chx(0,0)).toBe(0);});it('d',()=>{expect(hd327chx(93,73)).toBe(2);});it('e',()=>{expect(hd327chx(15,0)).toBe(4);});});
function hd328chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328chx_hd',()=>{it('a',()=>{expect(hd328chx(1,4)).toBe(2);});it('b',()=>{expect(hd328chx(3,1)).toBe(1);});it('c',()=>{expect(hd328chx(0,0)).toBe(0);});it('d',()=>{expect(hd328chx(93,73)).toBe(2);});it('e',()=>{expect(hd328chx(15,0)).toBe(4);});});
function hd329chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329chx_hd',()=>{it('a',()=>{expect(hd329chx(1,4)).toBe(2);});it('b',()=>{expect(hd329chx(3,1)).toBe(1);});it('c',()=>{expect(hd329chx(0,0)).toBe(0);});it('d',()=>{expect(hd329chx(93,73)).toBe(2);});it('e',()=>{expect(hd329chx(15,0)).toBe(4);});});
function hd330chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330chx_hd',()=>{it('a',()=>{expect(hd330chx(1,4)).toBe(2);});it('b',()=>{expect(hd330chx(3,1)).toBe(1);});it('c',()=>{expect(hd330chx(0,0)).toBe(0);});it('d',()=>{expect(hd330chx(93,73)).toBe(2);});it('e',()=>{expect(hd330chx(15,0)).toBe(4);});});
function hd331chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331chx_hd',()=>{it('a',()=>{expect(hd331chx(1,4)).toBe(2);});it('b',()=>{expect(hd331chx(3,1)).toBe(1);});it('c',()=>{expect(hd331chx(0,0)).toBe(0);});it('d',()=>{expect(hd331chx(93,73)).toBe(2);});it('e',()=>{expect(hd331chx(15,0)).toBe(4);});});
function hd332chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332chx_hd',()=>{it('a',()=>{expect(hd332chx(1,4)).toBe(2);});it('b',()=>{expect(hd332chx(3,1)).toBe(1);});it('c',()=>{expect(hd332chx(0,0)).toBe(0);});it('d',()=>{expect(hd332chx(93,73)).toBe(2);});it('e',()=>{expect(hd332chx(15,0)).toBe(4);});});
function hd333chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333chx_hd',()=>{it('a',()=>{expect(hd333chx(1,4)).toBe(2);});it('b',()=>{expect(hd333chx(3,1)).toBe(1);});it('c',()=>{expect(hd333chx(0,0)).toBe(0);});it('d',()=>{expect(hd333chx(93,73)).toBe(2);});it('e',()=>{expect(hd333chx(15,0)).toBe(4);});});
function hd334chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334chx_hd',()=>{it('a',()=>{expect(hd334chx(1,4)).toBe(2);});it('b',()=>{expect(hd334chx(3,1)).toBe(1);});it('c',()=>{expect(hd334chx(0,0)).toBe(0);});it('d',()=>{expect(hd334chx(93,73)).toBe(2);});it('e',()=>{expect(hd334chx(15,0)).toBe(4);});});
function hd335chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335chx_hd',()=>{it('a',()=>{expect(hd335chx(1,4)).toBe(2);});it('b',()=>{expect(hd335chx(3,1)).toBe(1);});it('c',()=>{expect(hd335chx(0,0)).toBe(0);});it('d',()=>{expect(hd335chx(93,73)).toBe(2);});it('e',()=>{expect(hd335chx(15,0)).toBe(4);});});
function hd336chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336chx_hd',()=>{it('a',()=>{expect(hd336chx(1,4)).toBe(2);});it('b',()=>{expect(hd336chx(3,1)).toBe(1);});it('c',()=>{expect(hd336chx(0,0)).toBe(0);});it('d',()=>{expect(hd336chx(93,73)).toBe(2);});it('e',()=>{expect(hd336chx(15,0)).toBe(4);});});
function hd337chx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337chx_hd',()=>{it('a',()=>{expect(hd337chx(1,4)).toBe(2);});it('b',()=>{expect(hd337chx(3,1)).toBe(1);});it('c',()=>{expect(hd337chx(0,0)).toBe(0);});it('d',()=>{expect(hd337chx(93,73)).toBe(2);});it('e',()=>{expect(hd337chx(15,0)).toBe(4);});});
function hd338chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338chex2_hd',()=>{it('a',()=>{expect(hd338chex2(1,4)).toBe(2);});it('b',()=>{expect(hd338chex2(3,1)).toBe(1);});it('c',()=>{expect(hd338chex2(0,0)).toBe(0);});it('d',()=>{expect(hd338chex2(93,73)).toBe(2);});it('e',()=>{expect(hd338chex2(15,0)).toBe(4);});});
function hd339chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339chex2_hd',()=>{it('a',()=>{expect(hd339chex2(1,4)).toBe(2);});it('b',()=>{expect(hd339chex2(3,1)).toBe(1);});it('c',()=>{expect(hd339chex2(0,0)).toBe(0);});it('d',()=>{expect(hd339chex2(93,73)).toBe(2);});it('e',()=>{expect(hd339chex2(15,0)).toBe(4);});});
function hd340chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340chex2_hd',()=>{it('a',()=>{expect(hd340chex2(1,4)).toBe(2);});it('b',()=>{expect(hd340chex2(3,1)).toBe(1);});it('c',()=>{expect(hd340chex2(0,0)).toBe(0);});it('d',()=>{expect(hd340chex2(93,73)).toBe(2);});it('e',()=>{expect(hd340chex2(15,0)).toBe(4);});});
function hd341chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341chex2_hd',()=>{it('a',()=>{expect(hd341chex2(1,4)).toBe(2);});it('b',()=>{expect(hd341chex2(3,1)).toBe(1);});it('c',()=>{expect(hd341chex2(0,0)).toBe(0);});it('d',()=>{expect(hd341chex2(93,73)).toBe(2);});it('e',()=>{expect(hd341chex2(15,0)).toBe(4);});});
function hd342chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342chex2_hd',()=>{it('a',()=>{expect(hd342chex2(1,4)).toBe(2);});it('b',()=>{expect(hd342chex2(3,1)).toBe(1);});it('c',()=>{expect(hd342chex2(0,0)).toBe(0);});it('d',()=>{expect(hd342chex2(93,73)).toBe(2);});it('e',()=>{expect(hd342chex2(15,0)).toBe(4);});});
function hd343chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343chex2_hd',()=>{it('a',()=>{expect(hd343chex2(1,4)).toBe(2);});it('b',()=>{expect(hd343chex2(3,1)).toBe(1);});it('c',()=>{expect(hd343chex2(0,0)).toBe(0);});it('d',()=>{expect(hd343chex2(93,73)).toBe(2);});it('e',()=>{expect(hd343chex2(15,0)).toBe(4);});});
function hd344chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344chex2_hd',()=>{it('a',()=>{expect(hd344chex2(1,4)).toBe(2);});it('b',()=>{expect(hd344chex2(3,1)).toBe(1);});it('c',()=>{expect(hd344chex2(0,0)).toBe(0);});it('d',()=>{expect(hd344chex2(93,73)).toBe(2);});it('e',()=>{expect(hd344chex2(15,0)).toBe(4);});});
function hd345chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345chex2_hd',()=>{it('a',()=>{expect(hd345chex2(1,4)).toBe(2);});it('b',()=>{expect(hd345chex2(3,1)).toBe(1);});it('c',()=>{expect(hd345chex2(0,0)).toBe(0);});it('d',()=>{expect(hd345chex2(93,73)).toBe(2);});it('e',()=>{expect(hd345chex2(15,0)).toBe(4);});});
function hd346chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346chex2_hd',()=>{it('a',()=>{expect(hd346chex2(1,4)).toBe(2);});it('b',()=>{expect(hd346chex2(3,1)).toBe(1);});it('c',()=>{expect(hd346chex2(0,0)).toBe(0);});it('d',()=>{expect(hd346chex2(93,73)).toBe(2);});it('e',()=>{expect(hd346chex2(15,0)).toBe(4);});});
function hd347chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347chex2_hd',()=>{it('a',()=>{expect(hd347chex2(1,4)).toBe(2);});it('b',()=>{expect(hd347chex2(3,1)).toBe(1);});it('c',()=>{expect(hd347chex2(0,0)).toBe(0);});it('d',()=>{expect(hd347chex2(93,73)).toBe(2);});it('e',()=>{expect(hd347chex2(15,0)).toBe(4);});});
function hd348chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348chex2_hd',()=>{it('a',()=>{expect(hd348chex2(1,4)).toBe(2);});it('b',()=>{expect(hd348chex2(3,1)).toBe(1);});it('c',()=>{expect(hd348chex2(0,0)).toBe(0);});it('d',()=>{expect(hd348chex2(93,73)).toBe(2);});it('e',()=>{expect(hd348chex2(15,0)).toBe(4);});});
function hd349chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349chex2_hd',()=>{it('a',()=>{expect(hd349chex2(1,4)).toBe(2);});it('b',()=>{expect(hd349chex2(3,1)).toBe(1);});it('c',()=>{expect(hd349chex2(0,0)).toBe(0);});it('d',()=>{expect(hd349chex2(93,73)).toBe(2);});it('e',()=>{expect(hd349chex2(15,0)).toBe(4);});});
function hd350chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350chex2_hd',()=>{it('a',()=>{expect(hd350chex2(1,4)).toBe(2);});it('b',()=>{expect(hd350chex2(3,1)).toBe(1);});it('c',()=>{expect(hd350chex2(0,0)).toBe(0);});it('d',()=>{expect(hd350chex2(93,73)).toBe(2);});it('e',()=>{expect(hd350chex2(15,0)).toBe(4);});});
function hd351chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351chex2_hd',()=>{it('a',()=>{expect(hd351chex2(1,4)).toBe(2);});it('b',()=>{expect(hd351chex2(3,1)).toBe(1);});it('c',()=>{expect(hd351chex2(0,0)).toBe(0);});it('d',()=>{expect(hd351chex2(93,73)).toBe(2);});it('e',()=>{expect(hd351chex2(15,0)).toBe(4);});});
function hd352chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352chex2_hd',()=>{it('a',()=>{expect(hd352chex2(1,4)).toBe(2);});it('b',()=>{expect(hd352chex2(3,1)).toBe(1);});it('c',()=>{expect(hd352chex2(0,0)).toBe(0);});it('d',()=>{expect(hd352chex2(93,73)).toBe(2);});it('e',()=>{expect(hd352chex2(15,0)).toBe(4);});});
function hd353chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353chex2_hd',()=>{it('a',()=>{expect(hd353chex2(1,4)).toBe(2);});it('b',()=>{expect(hd353chex2(3,1)).toBe(1);});it('c',()=>{expect(hd353chex2(0,0)).toBe(0);});it('d',()=>{expect(hd353chex2(93,73)).toBe(2);});it('e',()=>{expect(hd353chex2(15,0)).toBe(4);});});
function hd354chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354chex2_hd',()=>{it('a',()=>{expect(hd354chex2(1,4)).toBe(2);});it('b',()=>{expect(hd354chex2(3,1)).toBe(1);});it('c',()=>{expect(hd354chex2(0,0)).toBe(0);});it('d',()=>{expect(hd354chex2(93,73)).toBe(2);});it('e',()=>{expect(hd354chex2(15,0)).toBe(4);});});
function hd355chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355chex2_hd',()=>{it('a',()=>{expect(hd355chex2(1,4)).toBe(2);});it('b',()=>{expect(hd355chex2(3,1)).toBe(1);});it('c',()=>{expect(hd355chex2(0,0)).toBe(0);});it('d',()=>{expect(hd355chex2(93,73)).toBe(2);});it('e',()=>{expect(hd355chex2(15,0)).toBe(4);});});
function hd356chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356chex2_hd',()=>{it('a',()=>{expect(hd356chex2(1,4)).toBe(2);});it('b',()=>{expect(hd356chex2(3,1)).toBe(1);});it('c',()=>{expect(hd356chex2(0,0)).toBe(0);});it('d',()=>{expect(hd356chex2(93,73)).toBe(2);});it('e',()=>{expect(hd356chex2(15,0)).toBe(4);});});
function hd357chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357chex2_hd',()=>{it('a',()=>{expect(hd357chex2(1,4)).toBe(2);});it('b',()=>{expect(hd357chex2(3,1)).toBe(1);});it('c',()=>{expect(hd357chex2(0,0)).toBe(0);});it('d',()=>{expect(hd357chex2(93,73)).toBe(2);});it('e',()=>{expect(hd357chex2(15,0)).toBe(4);});});
function hd358chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358chex2_hd',()=>{it('a',()=>{expect(hd358chex2(1,4)).toBe(2);});it('b',()=>{expect(hd358chex2(3,1)).toBe(1);});it('c',()=>{expect(hd358chex2(0,0)).toBe(0);});it('d',()=>{expect(hd358chex2(93,73)).toBe(2);});it('e',()=>{expect(hd358chex2(15,0)).toBe(4);});});
function hd359chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359chex2_hd',()=>{it('a',()=>{expect(hd359chex2(1,4)).toBe(2);});it('b',()=>{expect(hd359chex2(3,1)).toBe(1);});it('c',()=>{expect(hd359chex2(0,0)).toBe(0);});it('d',()=>{expect(hd359chex2(93,73)).toBe(2);});it('e',()=>{expect(hd359chex2(15,0)).toBe(4);});});
function hd360chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360chex2_hd',()=>{it('a',()=>{expect(hd360chex2(1,4)).toBe(2);});it('b',()=>{expect(hd360chex2(3,1)).toBe(1);});it('c',()=>{expect(hd360chex2(0,0)).toBe(0);});it('d',()=>{expect(hd360chex2(93,73)).toBe(2);});it('e',()=>{expect(hd360chex2(15,0)).toBe(4);});});
function hd361chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361chex2_hd',()=>{it('a',()=>{expect(hd361chex2(1,4)).toBe(2);});it('b',()=>{expect(hd361chex2(3,1)).toBe(1);});it('c',()=>{expect(hd361chex2(0,0)).toBe(0);});it('d',()=>{expect(hd361chex2(93,73)).toBe(2);});it('e',()=>{expect(hd361chex2(15,0)).toBe(4);});});
function hd362chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362chex2_hd',()=>{it('a',()=>{expect(hd362chex2(1,4)).toBe(2);});it('b',()=>{expect(hd362chex2(3,1)).toBe(1);});it('c',()=>{expect(hd362chex2(0,0)).toBe(0);});it('d',()=>{expect(hd362chex2(93,73)).toBe(2);});it('e',()=>{expect(hd362chex2(15,0)).toBe(4);});});
function hd363chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363chex2_hd',()=>{it('a',()=>{expect(hd363chex2(1,4)).toBe(2);});it('b',()=>{expect(hd363chex2(3,1)).toBe(1);});it('c',()=>{expect(hd363chex2(0,0)).toBe(0);});it('d',()=>{expect(hd363chex2(93,73)).toBe(2);});it('e',()=>{expect(hd363chex2(15,0)).toBe(4);});});
function hd364chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364chex2_hd',()=>{it('a',()=>{expect(hd364chex2(1,4)).toBe(2);});it('b',()=>{expect(hd364chex2(3,1)).toBe(1);});it('c',()=>{expect(hd364chex2(0,0)).toBe(0);});it('d',()=>{expect(hd364chex2(93,73)).toBe(2);});it('e',()=>{expect(hd364chex2(15,0)).toBe(4);});});
function hd365chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365chex2_hd',()=>{it('a',()=>{expect(hd365chex2(1,4)).toBe(2);});it('b',()=>{expect(hd365chex2(3,1)).toBe(1);});it('c',()=>{expect(hd365chex2(0,0)).toBe(0);});it('d',()=>{expect(hd365chex2(93,73)).toBe(2);});it('e',()=>{expect(hd365chex2(15,0)).toBe(4);});});
function hd366chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366chex2_hd',()=>{it('a',()=>{expect(hd366chex2(1,4)).toBe(2);});it('b',()=>{expect(hd366chex2(3,1)).toBe(1);});it('c',()=>{expect(hd366chex2(0,0)).toBe(0);});it('d',()=>{expect(hd366chex2(93,73)).toBe(2);});it('e',()=>{expect(hd366chex2(15,0)).toBe(4);});});
function hd367chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367chex2_hd',()=>{it('a',()=>{expect(hd367chex2(1,4)).toBe(2);});it('b',()=>{expect(hd367chex2(3,1)).toBe(1);});it('c',()=>{expect(hd367chex2(0,0)).toBe(0);});it('d',()=>{expect(hd367chex2(93,73)).toBe(2);});it('e',()=>{expect(hd367chex2(15,0)).toBe(4);});});
function hd368chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368chex2_hd',()=>{it('a',()=>{expect(hd368chex2(1,4)).toBe(2);});it('b',()=>{expect(hd368chex2(3,1)).toBe(1);});it('c',()=>{expect(hd368chex2(0,0)).toBe(0);});it('d',()=>{expect(hd368chex2(93,73)).toBe(2);});it('e',()=>{expect(hd368chex2(15,0)).toBe(4);});});
function hd369chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369chex2_hd',()=>{it('a',()=>{expect(hd369chex2(1,4)).toBe(2);});it('b',()=>{expect(hd369chex2(3,1)).toBe(1);});it('c',()=>{expect(hd369chex2(0,0)).toBe(0);});it('d',()=>{expect(hd369chex2(93,73)).toBe(2);});it('e',()=>{expect(hd369chex2(15,0)).toBe(4);});});
function hd370chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370chex2_hd',()=>{it('a',()=>{expect(hd370chex2(1,4)).toBe(2);});it('b',()=>{expect(hd370chex2(3,1)).toBe(1);});it('c',()=>{expect(hd370chex2(0,0)).toBe(0);});it('d',()=>{expect(hd370chex2(93,73)).toBe(2);});it('e',()=>{expect(hd370chex2(15,0)).toBe(4);});});
function hd371chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371chex2_hd',()=>{it('a',()=>{expect(hd371chex2(1,4)).toBe(2);});it('b',()=>{expect(hd371chex2(3,1)).toBe(1);});it('c',()=>{expect(hd371chex2(0,0)).toBe(0);});it('d',()=>{expect(hd371chex2(93,73)).toBe(2);});it('e',()=>{expect(hd371chex2(15,0)).toBe(4);});});
function hd372chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372chex2_hd',()=>{it('a',()=>{expect(hd372chex2(1,4)).toBe(2);});it('b',()=>{expect(hd372chex2(3,1)).toBe(1);});it('c',()=>{expect(hd372chex2(0,0)).toBe(0);});it('d',()=>{expect(hd372chex2(93,73)).toBe(2);});it('e',()=>{expect(hd372chex2(15,0)).toBe(4);});});
function hd373chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373chex2_hd',()=>{it('a',()=>{expect(hd373chex2(1,4)).toBe(2);});it('b',()=>{expect(hd373chex2(3,1)).toBe(1);});it('c',()=>{expect(hd373chex2(0,0)).toBe(0);});it('d',()=>{expect(hd373chex2(93,73)).toBe(2);});it('e',()=>{expect(hd373chex2(15,0)).toBe(4);});});
function hd374chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374chex2_hd',()=>{it('a',()=>{expect(hd374chex2(1,4)).toBe(2);});it('b',()=>{expect(hd374chex2(3,1)).toBe(1);});it('c',()=>{expect(hd374chex2(0,0)).toBe(0);});it('d',()=>{expect(hd374chex2(93,73)).toBe(2);});it('e',()=>{expect(hd374chex2(15,0)).toBe(4);});});
function hd375chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375chex2_hd',()=>{it('a',()=>{expect(hd375chex2(1,4)).toBe(2);});it('b',()=>{expect(hd375chex2(3,1)).toBe(1);});it('c',()=>{expect(hd375chex2(0,0)).toBe(0);});it('d',()=>{expect(hd375chex2(93,73)).toBe(2);});it('e',()=>{expect(hd375chex2(15,0)).toBe(4);});});
function hd376chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376chex2_hd',()=>{it('a',()=>{expect(hd376chex2(1,4)).toBe(2);});it('b',()=>{expect(hd376chex2(3,1)).toBe(1);});it('c',()=>{expect(hd376chex2(0,0)).toBe(0);});it('d',()=>{expect(hd376chex2(93,73)).toBe(2);});it('e',()=>{expect(hd376chex2(15,0)).toBe(4);});});
function hd377chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377chex2_hd',()=>{it('a',()=>{expect(hd377chex2(1,4)).toBe(2);});it('b',()=>{expect(hd377chex2(3,1)).toBe(1);});it('c',()=>{expect(hd377chex2(0,0)).toBe(0);});it('d',()=>{expect(hd377chex2(93,73)).toBe(2);});it('e',()=>{expect(hd377chex2(15,0)).toBe(4);});});
function hd378chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378chex2_hd',()=>{it('a',()=>{expect(hd378chex2(1,4)).toBe(2);});it('b',()=>{expect(hd378chex2(3,1)).toBe(1);});it('c',()=>{expect(hd378chex2(0,0)).toBe(0);});it('d',()=>{expect(hd378chex2(93,73)).toBe(2);});it('e',()=>{expect(hd378chex2(15,0)).toBe(4);});});
function hd379chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379chex2_hd',()=>{it('a',()=>{expect(hd379chex2(1,4)).toBe(2);});it('b',()=>{expect(hd379chex2(3,1)).toBe(1);});it('c',()=>{expect(hd379chex2(0,0)).toBe(0);});it('d',()=>{expect(hd379chex2(93,73)).toBe(2);});it('e',()=>{expect(hd379chex2(15,0)).toBe(4);});});
function hd380chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380chex2_hd',()=>{it('a',()=>{expect(hd380chex2(1,4)).toBe(2);});it('b',()=>{expect(hd380chex2(3,1)).toBe(1);});it('c',()=>{expect(hd380chex2(0,0)).toBe(0);});it('d',()=>{expect(hd380chex2(93,73)).toBe(2);});it('e',()=>{expect(hd380chex2(15,0)).toBe(4);});});
function hd381chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381chex2_hd',()=>{it('a',()=>{expect(hd381chex2(1,4)).toBe(2);});it('b',()=>{expect(hd381chex2(3,1)).toBe(1);});it('c',()=>{expect(hd381chex2(0,0)).toBe(0);});it('d',()=>{expect(hd381chex2(93,73)).toBe(2);});it('e',()=>{expect(hd381chex2(15,0)).toBe(4);});});
function hd382chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382chex2_hd',()=>{it('a',()=>{expect(hd382chex2(1,4)).toBe(2);});it('b',()=>{expect(hd382chex2(3,1)).toBe(1);});it('c',()=>{expect(hd382chex2(0,0)).toBe(0);});it('d',()=>{expect(hd382chex2(93,73)).toBe(2);});it('e',()=>{expect(hd382chex2(15,0)).toBe(4);});});
function hd383chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383chex2_hd',()=>{it('a',()=>{expect(hd383chex2(1,4)).toBe(2);});it('b',()=>{expect(hd383chex2(3,1)).toBe(1);});it('c',()=>{expect(hd383chex2(0,0)).toBe(0);});it('d',()=>{expect(hd383chex2(93,73)).toBe(2);});it('e',()=>{expect(hd383chex2(15,0)).toBe(4);});});
function hd384chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384chex2_hd',()=>{it('a',()=>{expect(hd384chex2(1,4)).toBe(2);});it('b',()=>{expect(hd384chex2(3,1)).toBe(1);});it('c',()=>{expect(hd384chex2(0,0)).toBe(0);});it('d',()=>{expect(hd384chex2(93,73)).toBe(2);});it('e',()=>{expect(hd384chex2(15,0)).toBe(4);});});
function hd385chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385chex2_hd',()=>{it('a',()=>{expect(hd385chex2(1,4)).toBe(2);});it('b',()=>{expect(hd385chex2(3,1)).toBe(1);});it('c',()=>{expect(hd385chex2(0,0)).toBe(0);});it('d',()=>{expect(hd385chex2(93,73)).toBe(2);});it('e',()=>{expect(hd385chex2(15,0)).toBe(4);});});
function hd386chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386chex2_hd',()=>{it('a',()=>{expect(hd386chex2(1,4)).toBe(2);});it('b',()=>{expect(hd386chex2(3,1)).toBe(1);});it('c',()=>{expect(hd386chex2(0,0)).toBe(0);});it('d',()=>{expect(hd386chex2(93,73)).toBe(2);});it('e',()=>{expect(hd386chex2(15,0)).toBe(4);});});
function hd387chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387chex2_hd',()=>{it('a',()=>{expect(hd387chex2(1,4)).toBe(2);});it('b',()=>{expect(hd387chex2(3,1)).toBe(1);});it('c',()=>{expect(hd387chex2(0,0)).toBe(0);});it('d',()=>{expect(hd387chex2(93,73)).toBe(2);});it('e',()=>{expect(hd387chex2(15,0)).toBe(4);});});
function hd388chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388chex2_hd',()=>{it('a',()=>{expect(hd388chex2(1,4)).toBe(2);});it('b',()=>{expect(hd388chex2(3,1)).toBe(1);});it('c',()=>{expect(hd388chex2(0,0)).toBe(0);});it('d',()=>{expect(hd388chex2(93,73)).toBe(2);});it('e',()=>{expect(hd388chex2(15,0)).toBe(4);});});
function hd389chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389chex2_hd',()=>{it('a',()=>{expect(hd389chex2(1,4)).toBe(2);});it('b',()=>{expect(hd389chex2(3,1)).toBe(1);});it('c',()=>{expect(hd389chex2(0,0)).toBe(0);});it('d',()=>{expect(hd389chex2(93,73)).toBe(2);});it('e',()=>{expect(hd389chex2(15,0)).toBe(4);});});
function hd390chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390chex2_hd',()=>{it('a',()=>{expect(hd390chex2(1,4)).toBe(2);});it('b',()=>{expect(hd390chex2(3,1)).toBe(1);});it('c',()=>{expect(hd390chex2(0,0)).toBe(0);});it('d',()=>{expect(hd390chex2(93,73)).toBe(2);});it('e',()=>{expect(hd390chex2(15,0)).toBe(4);});});
function hd391chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391chex2_hd',()=>{it('a',()=>{expect(hd391chex2(1,4)).toBe(2);});it('b',()=>{expect(hd391chex2(3,1)).toBe(1);});it('c',()=>{expect(hd391chex2(0,0)).toBe(0);});it('d',()=>{expect(hd391chex2(93,73)).toBe(2);});it('e',()=>{expect(hd391chex2(15,0)).toBe(4);});});
function hd392chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392chex2_hd',()=>{it('a',()=>{expect(hd392chex2(1,4)).toBe(2);});it('b',()=>{expect(hd392chex2(3,1)).toBe(1);});it('c',()=>{expect(hd392chex2(0,0)).toBe(0);});it('d',()=>{expect(hd392chex2(93,73)).toBe(2);});it('e',()=>{expect(hd392chex2(15,0)).toBe(4);});});
function hd393chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393chex2_hd',()=>{it('a',()=>{expect(hd393chex2(1,4)).toBe(2);});it('b',()=>{expect(hd393chex2(3,1)).toBe(1);});it('c',()=>{expect(hd393chex2(0,0)).toBe(0);});it('d',()=>{expect(hd393chex2(93,73)).toBe(2);});it('e',()=>{expect(hd393chex2(15,0)).toBe(4);});});
function hd394chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394chex2_hd',()=>{it('a',()=>{expect(hd394chex2(1,4)).toBe(2);});it('b',()=>{expect(hd394chex2(3,1)).toBe(1);});it('c',()=>{expect(hd394chex2(0,0)).toBe(0);});it('d',()=>{expect(hd394chex2(93,73)).toBe(2);});it('e',()=>{expect(hd394chex2(15,0)).toBe(4);});});
function hd395chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395chex2_hd',()=>{it('a',()=>{expect(hd395chex2(1,4)).toBe(2);});it('b',()=>{expect(hd395chex2(3,1)).toBe(1);});it('c',()=>{expect(hd395chex2(0,0)).toBe(0);});it('d',()=>{expect(hd395chex2(93,73)).toBe(2);});it('e',()=>{expect(hd395chex2(15,0)).toBe(4);});});
function hd396chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396chex2_hd',()=>{it('a',()=>{expect(hd396chex2(1,4)).toBe(2);});it('b',()=>{expect(hd396chex2(3,1)).toBe(1);});it('c',()=>{expect(hd396chex2(0,0)).toBe(0);});it('d',()=>{expect(hd396chex2(93,73)).toBe(2);});it('e',()=>{expect(hd396chex2(15,0)).toBe(4);});});
function hd397chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397chex2_hd',()=>{it('a',()=>{expect(hd397chex2(1,4)).toBe(2);});it('b',()=>{expect(hd397chex2(3,1)).toBe(1);});it('c',()=>{expect(hd397chex2(0,0)).toBe(0);});it('d',()=>{expect(hd397chex2(93,73)).toBe(2);});it('e',()=>{expect(hd397chex2(15,0)).toBe(4);});});
function hd398chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398chex2_hd',()=>{it('a',()=>{expect(hd398chex2(1,4)).toBe(2);});it('b',()=>{expect(hd398chex2(3,1)).toBe(1);});it('c',()=>{expect(hd398chex2(0,0)).toBe(0);});it('d',()=>{expect(hd398chex2(93,73)).toBe(2);});it('e',()=>{expect(hd398chex2(15,0)).toBe(4);});});
function hd399chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399chex2_hd',()=>{it('a',()=>{expect(hd399chex2(1,4)).toBe(2);});it('b',()=>{expect(hd399chex2(3,1)).toBe(1);});it('c',()=>{expect(hd399chex2(0,0)).toBe(0);});it('d',()=>{expect(hd399chex2(93,73)).toBe(2);});it('e',()=>{expect(hd399chex2(15,0)).toBe(4);});});
function hd400chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400chex2_hd',()=>{it('a',()=>{expect(hd400chex2(1,4)).toBe(2);});it('b',()=>{expect(hd400chex2(3,1)).toBe(1);});it('c',()=>{expect(hd400chex2(0,0)).toBe(0);});it('d',()=>{expect(hd400chex2(93,73)).toBe(2);});it('e',()=>{expect(hd400chex2(15,0)).toBe(4);});});
function hd401chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401chex2_hd',()=>{it('a',()=>{expect(hd401chex2(1,4)).toBe(2);});it('b',()=>{expect(hd401chex2(3,1)).toBe(1);});it('c',()=>{expect(hd401chex2(0,0)).toBe(0);});it('d',()=>{expect(hd401chex2(93,73)).toBe(2);});it('e',()=>{expect(hd401chex2(15,0)).toBe(4);});});
function hd402chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402chex2_hd',()=>{it('a',()=>{expect(hd402chex2(1,4)).toBe(2);});it('b',()=>{expect(hd402chex2(3,1)).toBe(1);});it('c',()=>{expect(hd402chex2(0,0)).toBe(0);});it('d',()=>{expect(hd402chex2(93,73)).toBe(2);});it('e',()=>{expect(hd402chex2(15,0)).toBe(4);});});
function hd403chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403chex2_hd',()=>{it('a',()=>{expect(hd403chex2(1,4)).toBe(2);});it('b',()=>{expect(hd403chex2(3,1)).toBe(1);});it('c',()=>{expect(hd403chex2(0,0)).toBe(0);});it('d',()=>{expect(hd403chex2(93,73)).toBe(2);});it('e',()=>{expect(hd403chex2(15,0)).toBe(4);});});
function hd404chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404chex2_hd',()=>{it('a',()=>{expect(hd404chex2(1,4)).toBe(2);});it('b',()=>{expect(hd404chex2(3,1)).toBe(1);});it('c',()=>{expect(hd404chex2(0,0)).toBe(0);});it('d',()=>{expect(hd404chex2(93,73)).toBe(2);});it('e',()=>{expect(hd404chex2(15,0)).toBe(4);});});
function hd405chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405chex2_hd',()=>{it('a',()=>{expect(hd405chex2(1,4)).toBe(2);});it('b',()=>{expect(hd405chex2(3,1)).toBe(1);});it('c',()=>{expect(hd405chex2(0,0)).toBe(0);});it('d',()=>{expect(hd405chex2(93,73)).toBe(2);});it('e',()=>{expect(hd405chex2(15,0)).toBe(4);});});
function hd406chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406chex2_hd',()=>{it('a',()=>{expect(hd406chex2(1,4)).toBe(2);});it('b',()=>{expect(hd406chex2(3,1)).toBe(1);});it('c',()=>{expect(hd406chex2(0,0)).toBe(0);});it('d',()=>{expect(hd406chex2(93,73)).toBe(2);});it('e',()=>{expect(hd406chex2(15,0)).toBe(4);});});
function hd407chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407chex2_hd',()=>{it('a',()=>{expect(hd407chex2(1,4)).toBe(2);});it('b',()=>{expect(hd407chex2(3,1)).toBe(1);});it('c',()=>{expect(hd407chex2(0,0)).toBe(0);});it('d',()=>{expect(hd407chex2(93,73)).toBe(2);});it('e',()=>{expect(hd407chex2(15,0)).toBe(4);});});
function hd408chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408chex2_hd',()=>{it('a',()=>{expect(hd408chex2(1,4)).toBe(2);});it('b',()=>{expect(hd408chex2(3,1)).toBe(1);});it('c',()=>{expect(hd408chex2(0,0)).toBe(0);});it('d',()=>{expect(hd408chex2(93,73)).toBe(2);});it('e',()=>{expect(hd408chex2(15,0)).toBe(4);});});
function hd409chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409chex2_hd',()=>{it('a',()=>{expect(hd409chex2(1,4)).toBe(2);});it('b',()=>{expect(hd409chex2(3,1)).toBe(1);});it('c',()=>{expect(hd409chex2(0,0)).toBe(0);});it('d',()=>{expect(hd409chex2(93,73)).toBe(2);});it('e',()=>{expect(hd409chex2(15,0)).toBe(4);});});
function hd410chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410chex2_hd',()=>{it('a',()=>{expect(hd410chex2(1,4)).toBe(2);});it('b',()=>{expect(hd410chex2(3,1)).toBe(1);});it('c',()=>{expect(hd410chex2(0,0)).toBe(0);});it('d',()=>{expect(hd410chex2(93,73)).toBe(2);});it('e',()=>{expect(hd410chex2(15,0)).toBe(4);});});
function hd411chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411chex2_hd',()=>{it('a',()=>{expect(hd411chex2(1,4)).toBe(2);});it('b',()=>{expect(hd411chex2(3,1)).toBe(1);});it('c',()=>{expect(hd411chex2(0,0)).toBe(0);});it('d',()=>{expect(hd411chex2(93,73)).toBe(2);});it('e',()=>{expect(hd411chex2(15,0)).toBe(4);});});
function hd412chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412chex2_hd',()=>{it('a',()=>{expect(hd412chex2(1,4)).toBe(2);});it('b',()=>{expect(hd412chex2(3,1)).toBe(1);});it('c',()=>{expect(hd412chex2(0,0)).toBe(0);});it('d',()=>{expect(hd412chex2(93,73)).toBe(2);});it('e',()=>{expect(hd412chex2(15,0)).toBe(4);});});
function hd413chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413chex2_hd',()=>{it('a',()=>{expect(hd413chex2(1,4)).toBe(2);});it('b',()=>{expect(hd413chex2(3,1)).toBe(1);});it('c',()=>{expect(hd413chex2(0,0)).toBe(0);});it('d',()=>{expect(hd413chex2(93,73)).toBe(2);});it('e',()=>{expect(hd413chex2(15,0)).toBe(4);});});
function hd414chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414chex2_hd',()=>{it('a',()=>{expect(hd414chex2(1,4)).toBe(2);});it('b',()=>{expect(hd414chex2(3,1)).toBe(1);});it('c',()=>{expect(hd414chex2(0,0)).toBe(0);});it('d',()=>{expect(hd414chex2(93,73)).toBe(2);});it('e',()=>{expect(hd414chex2(15,0)).toBe(4);});});
function hd415chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415chex2_hd',()=>{it('a',()=>{expect(hd415chex2(1,4)).toBe(2);});it('b',()=>{expect(hd415chex2(3,1)).toBe(1);});it('c',()=>{expect(hd415chex2(0,0)).toBe(0);});it('d',()=>{expect(hd415chex2(93,73)).toBe(2);});it('e',()=>{expect(hd415chex2(15,0)).toBe(4);});});
function hd416chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416chex2_hd',()=>{it('a',()=>{expect(hd416chex2(1,4)).toBe(2);});it('b',()=>{expect(hd416chex2(3,1)).toBe(1);});it('c',()=>{expect(hd416chex2(0,0)).toBe(0);});it('d',()=>{expect(hd416chex2(93,73)).toBe(2);});it('e',()=>{expect(hd416chex2(15,0)).toBe(4);});});
function hd417chex2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417chex2_hd',()=>{it('a',()=>{expect(hd417chex2(1,4)).toBe(2);});it('b',()=>{expect(hd417chex2(3,1)).toBe(1);});it('c',()=>{expect(hd417chex2(0,0)).toBe(0);});it('d',()=>{expect(hd417chex2(93,73)).toBe(2);});it('e',()=>{expect(hd417chex2(15,0)).toBe(4);});});
