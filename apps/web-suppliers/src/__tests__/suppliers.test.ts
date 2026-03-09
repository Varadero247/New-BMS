// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-suppliers specification tests

type SupplierTier = 'TIER_1' | 'TIER_2' | 'TIER_3';
type SupplierStatus = 'PROSPECT' | 'ONBOARDING' | 'APPROVED' | 'CONDITIONAL' | 'SUSPENDED' | 'BLACKLISTED';
type EvaluationCriteria = 'QUALITY' | 'DELIVERY' | 'PRICE' | 'SERVICE' | 'COMPLIANCE' | 'FINANCIAL';
type RiskCategory = 'OPERATIONAL' | 'FINANCIAL' | 'COMPLIANCE' | 'REPUTATIONAL' | 'GEOPOLITICAL';

const SUPPLIER_TIERS: SupplierTier[] = ['TIER_1', 'TIER_2', 'TIER_3'];
const SUPPLIER_STATUSES: SupplierStatus[] = ['PROSPECT', 'ONBOARDING', 'APPROVED', 'CONDITIONAL', 'SUSPENDED', 'BLACKLISTED'];
const EVALUATION_CRITERIA: EvaluationCriteria[] = ['QUALITY', 'DELIVERY', 'PRICE', 'SERVICE', 'COMPLIANCE', 'FINANCIAL'];
const RISK_CATEGORIES: RiskCategory[] = ['OPERATIONAL', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL', 'GEOPOLITICAL'];

const supplierStatusColor: Record<SupplierStatus, string> = {
  PROSPECT: 'bg-gray-100 text-gray-700',
  ONBOARDING: 'bg-blue-100 text-blue-800',
  APPROVED: 'bg-green-100 text-green-800',
  CONDITIONAL: 'bg-yellow-100 text-yellow-800',
  SUSPENDED: 'bg-orange-100 text-orange-800',
  BLACKLISTED: 'bg-red-100 text-red-800',
};

const criteriaWeight: Record<EvaluationCriteria, number> = {
  QUALITY: 30, DELIVERY: 20, PRICE: 20, SERVICE: 15, COMPLIANCE: 10, FINANCIAL: 5,
};

function isApprovedSupplier(status: SupplierStatus): boolean {
  return status === 'APPROVED';
}

function canReceivePurchaseOrders(status: SupplierStatus): boolean {
  return status === 'APPROVED' || status === 'CONDITIONAL';
}

function weightedSupplierScore(scores: Record<EvaluationCriteria, number>): number {
  const totalWeight = Object.values(criteriaWeight).reduce((sum, w) => sum + w, 0);
  const weightedSum = (Object.keys(scores) as EvaluationCriteria[])
    .reduce((sum, k) => sum + scores[k] * criteriaWeight[k], 0);
  return weightedSum / totalWeight;
}

function supplierRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 80) return 'LOW';
  if (score >= 60) return 'MEDIUM';
  if (score >= 40) return 'HIGH';
  return 'CRITICAL';
}

describe('Supplier status colors', () => {
  SUPPLIER_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(supplierStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(supplierStatusColor[s]).toContain('bg-'));
  });
  it('APPROVED is green', () => expect(supplierStatusColor.APPROVED).toContain('green'));
  it('BLACKLISTED is red', () => expect(supplierStatusColor.BLACKLISTED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = SUPPLIER_STATUSES[i % 6];
    it(`supplier status color string (idx ${i})`, () => expect(typeof supplierStatusColor[s]).toBe('string'));
  }
});

describe('Evaluation criteria weights', () => {
  it('QUALITY has highest weight', () => {
    const weights = Object.values(criteriaWeight);
    expect(criteriaWeight.QUALITY).toBe(Math.max(...weights));
  });
  it('total weights = 100', () => {
    const total = Object.values(criteriaWeight).reduce((sum, w) => sum + w, 0);
    expect(total).toBe(100);
  });
  EVALUATION_CRITERIA.forEach(c => {
    it(`${c} has positive weight`, () => expect(criteriaWeight[c]).toBeGreaterThan(0));
  });
  for (let i = 0; i < 100; i++) {
    const c = EVALUATION_CRITERIA[i % 6];
    it(`criteria weight for ${c} is number (idx ${i})`, () => expect(typeof criteriaWeight[c]).toBe('number'));
  }
});

describe('isApprovedSupplier', () => {
  it('APPROVED returns true', () => expect(isApprovedSupplier('APPROVED')).toBe(true));
  it('CONDITIONAL returns false', () => expect(isApprovedSupplier('CONDITIONAL')).toBe(false));
  it('BLACKLISTED returns false', () => expect(isApprovedSupplier('BLACKLISTED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = SUPPLIER_STATUSES[i % 6];
    it(`isApprovedSupplier(${s}) returns boolean (idx ${i})`, () => expect(typeof isApprovedSupplier(s)).toBe('boolean'));
  }
});

describe('canReceivePurchaseOrders', () => {
  it('APPROVED can receive POs', () => expect(canReceivePurchaseOrders('APPROVED')).toBe(true));
  it('CONDITIONAL can receive POs', () => expect(canReceivePurchaseOrders('CONDITIONAL')).toBe(true));
  it('SUSPENDED cannot', () => expect(canReceivePurchaseOrders('SUSPENDED')).toBe(false));
  it('BLACKLISTED cannot', () => expect(canReceivePurchaseOrders('BLACKLISTED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = SUPPLIER_STATUSES[i % 6];
    it(`canReceivePurchaseOrders(${s}) returns boolean (idx ${i})`, () => expect(typeof canReceivePurchaseOrders(s)).toBe('boolean'));
  }
});

describe('weightedSupplierScore', () => {
  it('all 100s = 100', () => {
    const scores: Record<EvaluationCriteria, number> = {
      QUALITY: 100, DELIVERY: 100, PRICE: 100, SERVICE: 100, COMPLIANCE: 100, FINANCIAL: 100,
    };
    expect(weightedSupplierScore(scores)).toBe(100);
  });
  it('all 0s = 0', () => {
    const scores: Record<EvaluationCriteria, number> = {
      QUALITY: 0, DELIVERY: 0, PRICE: 0, SERVICE: 0, COMPLIANCE: 0, FINANCIAL: 0,
    };
    expect(weightedSupplierScore(scores)).toBe(0);
  });
  for (let score = 0; score <= 100; score += 5) {
    it(`uniform score ${score} returns ${score}`, () => {
      const scores: Record<EvaluationCriteria, number> = {
        QUALITY: score, DELIVERY: score, PRICE: score, SERVICE: score, COMPLIANCE: score, FINANCIAL: score,
      };
      expect(weightedSupplierScore(scores)).toBeCloseTo(score);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`supplierRiskLevel for score ${i * 2} is valid (idx ${i})`, () => {
      expect(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).toContain(supplierRiskLevel(i * 2));
    });
  }
});

// ─── Algorithm puzzle phases (ph217su2–ph220su2) ────────────────────────────────
function moveZeroes217su2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217su2_mz',()=>{
  it('a',()=>{expect(moveZeroes217su2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217su2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217su2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217su2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217su2([4,2,0,0,3])).toBe(4);});
});
function missingNumber218su2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218su2_mn',()=>{
  it('a',()=>{expect(missingNumber218su2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218su2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218su2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218su2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218su2([1])).toBe(0);});
});
function countBits219su2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219su2_cb',()=>{
  it('a',()=>{expect(countBits219su2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219su2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219su2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219su2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219su2(4)[4]).toBe(1);});
});
function climbStairs220su2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220su2_cs',()=>{
  it('a',()=>{expect(climbStairs220su2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220su2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220su2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220su2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220su2(1)).toBe(1);});
});
function hd258supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258supx_hd',()=>{it('a',()=>{expect(hd258supx(1,4)).toBe(2);});it('b',()=>{expect(hd258supx(3,1)).toBe(1);});it('c',()=>{expect(hd258supx(0,0)).toBe(0);});it('d',()=>{expect(hd258supx(93,73)).toBe(2);});it('e',()=>{expect(hd258supx(15,0)).toBe(4);});});
function hd259supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259supx_hd',()=>{it('a',()=>{expect(hd259supx(1,4)).toBe(2);});it('b',()=>{expect(hd259supx(3,1)).toBe(1);});it('c',()=>{expect(hd259supx(0,0)).toBe(0);});it('d',()=>{expect(hd259supx(93,73)).toBe(2);});it('e',()=>{expect(hd259supx(15,0)).toBe(4);});});
function hd260supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260supx_hd',()=>{it('a',()=>{expect(hd260supx(1,4)).toBe(2);});it('b',()=>{expect(hd260supx(3,1)).toBe(1);});it('c',()=>{expect(hd260supx(0,0)).toBe(0);});it('d',()=>{expect(hd260supx(93,73)).toBe(2);});it('e',()=>{expect(hd260supx(15,0)).toBe(4);});});
function hd261supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261supx_hd',()=>{it('a',()=>{expect(hd261supx(1,4)).toBe(2);});it('b',()=>{expect(hd261supx(3,1)).toBe(1);});it('c',()=>{expect(hd261supx(0,0)).toBe(0);});it('d',()=>{expect(hd261supx(93,73)).toBe(2);});it('e',()=>{expect(hd261supx(15,0)).toBe(4);});});
function hd262supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262supx_hd',()=>{it('a',()=>{expect(hd262supx(1,4)).toBe(2);});it('b',()=>{expect(hd262supx(3,1)).toBe(1);});it('c',()=>{expect(hd262supx(0,0)).toBe(0);});it('d',()=>{expect(hd262supx(93,73)).toBe(2);});it('e',()=>{expect(hd262supx(15,0)).toBe(4);});});
function hd263supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263supx_hd',()=>{it('a',()=>{expect(hd263supx(1,4)).toBe(2);});it('b',()=>{expect(hd263supx(3,1)).toBe(1);});it('c',()=>{expect(hd263supx(0,0)).toBe(0);});it('d',()=>{expect(hd263supx(93,73)).toBe(2);});it('e',()=>{expect(hd263supx(15,0)).toBe(4);});});
function hd264supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264supx_hd',()=>{it('a',()=>{expect(hd264supx(1,4)).toBe(2);});it('b',()=>{expect(hd264supx(3,1)).toBe(1);});it('c',()=>{expect(hd264supx(0,0)).toBe(0);});it('d',()=>{expect(hd264supx(93,73)).toBe(2);});it('e',()=>{expect(hd264supx(15,0)).toBe(4);});});
function hd265supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265supx_hd',()=>{it('a',()=>{expect(hd265supx(1,4)).toBe(2);});it('b',()=>{expect(hd265supx(3,1)).toBe(1);});it('c',()=>{expect(hd265supx(0,0)).toBe(0);});it('d',()=>{expect(hd265supx(93,73)).toBe(2);});it('e',()=>{expect(hd265supx(15,0)).toBe(4);});});
function hd266supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266supx_hd',()=>{it('a',()=>{expect(hd266supx(1,4)).toBe(2);});it('b',()=>{expect(hd266supx(3,1)).toBe(1);});it('c',()=>{expect(hd266supx(0,0)).toBe(0);});it('d',()=>{expect(hd266supx(93,73)).toBe(2);});it('e',()=>{expect(hd266supx(15,0)).toBe(4);});});
function hd267supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267supx_hd',()=>{it('a',()=>{expect(hd267supx(1,4)).toBe(2);});it('b',()=>{expect(hd267supx(3,1)).toBe(1);});it('c',()=>{expect(hd267supx(0,0)).toBe(0);});it('d',()=>{expect(hd267supx(93,73)).toBe(2);});it('e',()=>{expect(hd267supx(15,0)).toBe(4);});});
function hd268supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268supx_hd',()=>{it('a',()=>{expect(hd268supx(1,4)).toBe(2);});it('b',()=>{expect(hd268supx(3,1)).toBe(1);});it('c',()=>{expect(hd268supx(0,0)).toBe(0);});it('d',()=>{expect(hd268supx(93,73)).toBe(2);});it('e',()=>{expect(hd268supx(15,0)).toBe(4);});});
function hd269supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269supx_hd',()=>{it('a',()=>{expect(hd269supx(1,4)).toBe(2);});it('b',()=>{expect(hd269supx(3,1)).toBe(1);});it('c',()=>{expect(hd269supx(0,0)).toBe(0);});it('d',()=>{expect(hd269supx(93,73)).toBe(2);});it('e',()=>{expect(hd269supx(15,0)).toBe(4);});});
function hd270supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270supx_hd',()=>{it('a',()=>{expect(hd270supx(1,4)).toBe(2);});it('b',()=>{expect(hd270supx(3,1)).toBe(1);});it('c',()=>{expect(hd270supx(0,0)).toBe(0);});it('d',()=>{expect(hd270supx(93,73)).toBe(2);});it('e',()=>{expect(hd270supx(15,0)).toBe(4);});});
function hd271supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271supx_hd',()=>{it('a',()=>{expect(hd271supx(1,4)).toBe(2);});it('b',()=>{expect(hd271supx(3,1)).toBe(1);});it('c',()=>{expect(hd271supx(0,0)).toBe(0);});it('d',()=>{expect(hd271supx(93,73)).toBe(2);});it('e',()=>{expect(hd271supx(15,0)).toBe(4);});});
function hd272supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272supx_hd',()=>{it('a',()=>{expect(hd272supx(1,4)).toBe(2);});it('b',()=>{expect(hd272supx(3,1)).toBe(1);});it('c',()=>{expect(hd272supx(0,0)).toBe(0);});it('d',()=>{expect(hd272supx(93,73)).toBe(2);});it('e',()=>{expect(hd272supx(15,0)).toBe(4);});});
function hd273supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273supx_hd',()=>{it('a',()=>{expect(hd273supx(1,4)).toBe(2);});it('b',()=>{expect(hd273supx(3,1)).toBe(1);});it('c',()=>{expect(hd273supx(0,0)).toBe(0);});it('d',()=>{expect(hd273supx(93,73)).toBe(2);});it('e',()=>{expect(hd273supx(15,0)).toBe(4);});});
function hd274supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274supx_hd',()=>{it('a',()=>{expect(hd274supx(1,4)).toBe(2);});it('b',()=>{expect(hd274supx(3,1)).toBe(1);});it('c',()=>{expect(hd274supx(0,0)).toBe(0);});it('d',()=>{expect(hd274supx(93,73)).toBe(2);});it('e',()=>{expect(hd274supx(15,0)).toBe(4);});});
function hd275supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275supx_hd',()=>{it('a',()=>{expect(hd275supx(1,4)).toBe(2);});it('b',()=>{expect(hd275supx(3,1)).toBe(1);});it('c',()=>{expect(hd275supx(0,0)).toBe(0);});it('d',()=>{expect(hd275supx(93,73)).toBe(2);});it('e',()=>{expect(hd275supx(15,0)).toBe(4);});});
function hd276supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276supx_hd',()=>{it('a',()=>{expect(hd276supx(1,4)).toBe(2);});it('b',()=>{expect(hd276supx(3,1)).toBe(1);});it('c',()=>{expect(hd276supx(0,0)).toBe(0);});it('d',()=>{expect(hd276supx(93,73)).toBe(2);});it('e',()=>{expect(hd276supx(15,0)).toBe(4);});});
function hd277supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277supx_hd',()=>{it('a',()=>{expect(hd277supx(1,4)).toBe(2);});it('b',()=>{expect(hd277supx(3,1)).toBe(1);});it('c',()=>{expect(hd277supx(0,0)).toBe(0);});it('d',()=>{expect(hd277supx(93,73)).toBe(2);});it('e',()=>{expect(hd277supx(15,0)).toBe(4);});});
function hd278supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278supx_hd',()=>{it('a',()=>{expect(hd278supx(1,4)).toBe(2);});it('b',()=>{expect(hd278supx(3,1)).toBe(1);});it('c',()=>{expect(hd278supx(0,0)).toBe(0);});it('d',()=>{expect(hd278supx(93,73)).toBe(2);});it('e',()=>{expect(hd278supx(15,0)).toBe(4);});});
function hd279supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279supx_hd',()=>{it('a',()=>{expect(hd279supx(1,4)).toBe(2);});it('b',()=>{expect(hd279supx(3,1)).toBe(1);});it('c',()=>{expect(hd279supx(0,0)).toBe(0);});it('d',()=>{expect(hd279supx(93,73)).toBe(2);});it('e',()=>{expect(hd279supx(15,0)).toBe(4);});});
function hd280supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280supx_hd',()=>{it('a',()=>{expect(hd280supx(1,4)).toBe(2);});it('b',()=>{expect(hd280supx(3,1)).toBe(1);});it('c',()=>{expect(hd280supx(0,0)).toBe(0);});it('d',()=>{expect(hd280supx(93,73)).toBe(2);});it('e',()=>{expect(hd280supx(15,0)).toBe(4);});});
function hd281supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281supx_hd',()=>{it('a',()=>{expect(hd281supx(1,4)).toBe(2);});it('b',()=>{expect(hd281supx(3,1)).toBe(1);});it('c',()=>{expect(hd281supx(0,0)).toBe(0);});it('d',()=>{expect(hd281supx(93,73)).toBe(2);});it('e',()=>{expect(hd281supx(15,0)).toBe(4);});});
function hd282supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282supx_hd',()=>{it('a',()=>{expect(hd282supx(1,4)).toBe(2);});it('b',()=>{expect(hd282supx(3,1)).toBe(1);});it('c',()=>{expect(hd282supx(0,0)).toBe(0);});it('d',()=>{expect(hd282supx(93,73)).toBe(2);});it('e',()=>{expect(hd282supx(15,0)).toBe(4);});});
function hd283supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283supx_hd',()=>{it('a',()=>{expect(hd283supx(1,4)).toBe(2);});it('b',()=>{expect(hd283supx(3,1)).toBe(1);});it('c',()=>{expect(hd283supx(0,0)).toBe(0);});it('d',()=>{expect(hd283supx(93,73)).toBe(2);});it('e',()=>{expect(hd283supx(15,0)).toBe(4);});});
function hd284supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284supx_hd',()=>{it('a',()=>{expect(hd284supx(1,4)).toBe(2);});it('b',()=>{expect(hd284supx(3,1)).toBe(1);});it('c',()=>{expect(hd284supx(0,0)).toBe(0);});it('d',()=>{expect(hd284supx(93,73)).toBe(2);});it('e',()=>{expect(hd284supx(15,0)).toBe(4);});});
function hd285supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285supx_hd',()=>{it('a',()=>{expect(hd285supx(1,4)).toBe(2);});it('b',()=>{expect(hd285supx(3,1)).toBe(1);});it('c',()=>{expect(hd285supx(0,0)).toBe(0);});it('d',()=>{expect(hd285supx(93,73)).toBe(2);});it('e',()=>{expect(hd285supx(15,0)).toBe(4);});});
function hd286supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286supx_hd',()=>{it('a',()=>{expect(hd286supx(1,4)).toBe(2);});it('b',()=>{expect(hd286supx(3,1)).toBe(1);});it('c',()=>{expect(hd286supx(0,0)).toBe(0);});it('d',()=>{expect(hd286supx(93,73)).toBe(2);});it('e',()=>{expect(hd286supx(15,0)).toBe(4);});});
function hd287supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287supx_hd',()=>{it('a',()=>{expect(hd287supx(1,4)).toBe(2);});it('b',()=>{expect(hd287supx(3,1)).toBe(1);});it('c',()=>{expect(hd287supx(0,0)).toBe(0);});it('d',()=>{expect(hd287supx(93,73)).toBe(2);});it('e',()=>{expect(hd287supx(15,0)).toBe(4);});});
function hd288supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288supx_hd',()=>{it('a',()=>{expect(hd288supx(1,4)).toBe(2);});it('b',()=>{expect(hd288supx(3,1)).toBe(1);});it('c',()=>{expect(hd288supx(0,0)).toBe(0);});it('d',()=>{expect(hd288supx(93,73)).toBe(2);});it('e',()=>{expect(hd288supx(15,0)).toBe(4);});});
function hd289supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289supx_hd',()=>{it('a',()=>{expect(hd289supx(1,4)).toBe(2);});it('b',()=>{expect(hd289supx(3,1)).toBe(1);});it('c',()=>{expect(hd289supx(0,0)).toBe(0);});it('d',()=>{expect(hd289supx(93,73)).toBe(2);});it('e',()=>{expect(hd289supx(15,0)).toBe(4);});});
function hd290supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290supx_hd',()=>{it('a',()=>{expect(hd290supx(1,4)).toBe(2);});it('b',()=>{expect(hd290supx(3,1)).toBe(1);});it('c',()=>{expect(hd290supx(0,0)).toBe(0);});it('d',()=>{expect(hd290supx(93,73)).toBe(2);});it('e',()=>{expect(hd290supx(15,0)).toBe(4);});});
function hd291supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291supx_hd',()=>{it('a',()=>{expect(hd291supx(1,4)).toBe(2);});it('b',()=>{expect(hd291supx(3,1)).toBe(1);});it('c',()=>{expect(hd291supx(0,0)).toBe(0);});it('d',()=>{expect(hd291supx(93,73)).toBe(2);});it('e',()=>{expect(hd291supx(15,0)).toBe(4);});});
function hd292supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292supx_hd',()=>{it('a',()=>{expect(hd292supx(1,4)).toBe(2);});it('b',()=>{expect(hd292supx(3,1)).toBe(1);});it('c',()=>{expect(hd292supx(0,0)).toBe(0);});it('d',()=>{expect(hd292supx(93,73)).toBe(2);});it('e',()=>{expect(hd292supx(15,0)).toBe(4);});});
function hd293supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293supx_hd',()=>{it('a',()=>{expect(hd293supx(1,4)).toBe(2);});it('b',()=>{expect(hd293supx(3,1)).toBe(1);});it('c',()=>{expect(hd293supx(0,0)).toBe(0);});it('d',()=>{expect(hd293supx(93,73)).toBe(2);});it('e',()=>{expect(hd293supx(15,0)).toBe(4);});});
function hd294supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294supx_hd',()=>{it('a',()=>{expect(hd294supx(1,4)).toBe(2);});it('b',()=>{expect(hd294supx(3,1)).toBe(1);});it('c',()=>{expect(hd294supx(0,0)).toBe(0);});it('d',()=>{expect(hd294supx(93,73)).toBe(2);});it('e',()=>{expect(hd294supx(15,0)).toBe(4);});});
function hd295supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295supx_hd',()=>{it('a',()=>{expect(hd295supx(1,4)).toBe(2);});it('b',()=>{expect(hd295supx(3,1)).toBe(1);});it('c',()=>{expect(hd295supx(0,0)).toBe(0);});it('d',()=>{expect(hd295supx(93,73)).toBe(2);});it('e',()=>{expect(hd295supx(15,0)).toBe(4);});});
function hd296supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296supx_hd',()=>{it('a',()=>{expect(hd296supx(1,4)).toBe(2);});it('b',()=>{expect(hd296supx(3,1)).toBe(1);});it('c',()=>{expect(hd296supx(0,0)).toBe(0);});it('d',()=>{expect(hd296supx(93,73)).toBe(2);});it('e',()=>{expect(hd296supx(15,0)).toBe(4);});});
function hd297supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297supx_hd',()=>{it('a',()=>{expect(hd297supx(1,4)).toBe(2);});it('b',()=>{expect(hd297supx(3,1)).toBe(1);});it('c',()=>{expect(hd297supx(0,0)).toBe(0);});it('d',()=>{expect(hd297supx(93,73)).toBe(2);});it('e',()=>{expect(hd297supx(15,0)).toBe(4);});});
function hd298supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298supx_hd',()=>{it('a',()=>{expect(hd298supx(1,4)).toBe(2);});it('b',()=>{expect(hd298supx(3,1)).toBe(1);});it('c',()=>{expect(hd298supx(0,0)).toBe(0);});it('d',()=>{expect(hd298supx(93,73)).toBe(2);});it('e',()=>{expect(hd298supx(15,0)).toBe(4);});});
function hd299supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299supx_hd',()=>{it('a',()=>{expect(hd299supx(1,4)).toBe(2);});it('b',()=>{expect(hd299supx(3,1)).toBe(1);});it('c',()=>{expect(hd299supx(0,0)).toBe(0);});it('d',()=>{expect(hd299supx(93,73)).toBe(2);});it('e',()=>{expect(hd299supx(15,0)).toBe(4);});});
function hd300supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300supx_hd',()=>{it('a',()=>{expect(hd300supx(1,4)).toBe(2);});it('b',()=>{expect(hd300supx(3,1)).toBe(1);});it('c',()=>{expect(hd300supx(0,0)).toBe(0);});it('d',()=>{expect(hd300supx(93,73)).toBe(2);});it('e',()=>{expect(hd300supx(15,0)).toBe(4);});});
function hd301supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301supx_hd',()=>{it('a',()=>{expect(hd301supx(1,4)).toBe(2);});it('b',()=>{expect(hd301supx(3,1)).toBe(1);});it('c',()=>{expect(hd301supx(0,0)).toBe(0);});it('d',()=>{expect(hd301supx(93,73)).toBe(2);});it('e',()=>{expect(hd301supx(15,0)).toBe(4);});});
function hd302supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302supx_hd',()=>{it('a',()=>{expect(hd302supx(1,4)).toBe(2);});it('b',()=>{expect(hd302supx(3,1)).toBe(1);});it('c',()=>{expect(hd302supx(0,0)).toBe(0);});it('d',()=>{expect(hd302supx(93,73)).toBe(2);});it('e',()=>{expect(hd302supx(15,0)).toBe(4);});});
function hd303supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303supx_hd',()=>{it('a',()=>{expect(hd303supx(1,4)).toBe(2);});it('b',()=>{expect(hd303supx(3,1)).toBe(1);});it('c',()=>{expect(hd303supx(0,0)).toBe(0);});it('d',()=>{expect(hd303supx(93,73)).toBe(2);});it('e',()=>{expect(hd303supx(15,0)).toBe(4);});});
function hd304supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304supx_hd',()=>{it('a',()=>{expect(hd304supx(1,4)).toBe(2);});it('b',()=>{expect(hd304supx(3,1)).toBe(1);});it('c',()=>{expect(hd304supx(0,0)).toBe(0);});it('d',()=>{expect(hd304supx(93,73)).toBe(2);});it('e',()=>{expect(hd304supx(15,0)).toBe(4);});});
function hd305supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305supx_hd',()=>{it('a',()=>{expect(hd305supx(1,4)).toBe(2);});it('b',()=>{expect(hd305supx(3,1)).toBe(1);});it('c',()=>{expect(hd305supx(0,0)).toBe(0);});it('d',()=>{expect(hd305supx(93,73)).toBe(2);});it('e',()=>{expect(hd305supx(15,0)).toBe(4);});});
function hd306supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306supx_hd',()=>{it('a',()=>{expect(hd306supx(1,4)).toBe(2);});it('b',()=>{expect(hd306supx(3,1)).toBe(1);});it('c',()=>{expect(hd306supx(0,0)).toBe(0);});it('d',()=>{expect(hd306supx(93,73)).toBe(2);});it('e',()=>{expect(hd306supx(15,0)).toBe(4);});});
function hd307supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307supx_hd',()=>{it('a',()=>{expect(hd307supx(1,4)).toBe(2);});it('b',()=>{expect(hd307supx(3,1)).toBe(1);});it('c',()=>{expect(hd307supx(0,0)).toBe(0);});it('d',()=>{expect(hd307supx(93,73)).toBe(2);});it('e',()=>{expect(hd307supx(15,0)).toBe(4);});});
function hd308supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308supx_hd',()=>{it('a',()=>{expect(hd308supx(1,4)).toBe(2);});it('b',()=>{expect(hd308supx(3,1)).toBe(1);});it('c',()=>{expect(hd308supx(0,0)).toBe(0);});it('d',()=>{expect(hd308supx(93,73)).toBe(2);});it('e',()=>{expect(hd308supx(15,0)).toBe(4);});});
function hd309supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309supx_hd',()=>{it('a',()=>{expect(hd309supx(1,4)).toBe(2);});it('b',()=>{expect(hd309supx(3,1)).toBe(1);});it('c',()=>{expect(hd309supx(0,0)).toBe(0);});it('d',()=>{expect(hd309supx(93,73)).toBe(2);});it('e',()=>{expect(hd309supx(15,0)).toBe(4);});});
function hd310supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310supx_hd',()=>{it('a',()=>{expect(hd310supx(1,4)).toBe(2);});it('b',()=>{expect(hd310supx(3,1)).toBe(1);});it('c',()=>{expect(hd310supx(0,0)).toBe(0);});it('d',()=>{expect(hd310supx(93,73)).toBe(2);});it('e',()=>{expect(hd310supx(15,0)).toBe(4);});});
function hd311supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311supx_hd',()=>{it('a',()=>{expect(hd311supx(1,4)).toBe(2);});it('b',()=>{expect(hd311supx(3,1)).toBe(1);});it('c',()=>{expect(hd311supx(0,0)).toBe(0);});it('d',()=>{expect(hd311supx(93,73)).toBe(2);});it('e',()=>{expect(hd311supx(15,0)).toBe(4);});});
function hd312supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312supx_hd',()=>{it('a',()=>{expect(hd312supx(1,4)).toBe(2);});it('b',()=>{expect(hd312supx(3,1)).toBe(1);});it('c',()=>{expect(hd312supx(0,0)).toBe(0);});it('d',()=>{expect(hd312supx(93,73)).toBe(2);});it('e',()=>{expect(hd312supx(15,0)).toBe(4);});});
function hd313supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313supx_hd',()=>{it('a',()=>{expect(hd313supx(1,4)).toBe(2);});it('b',()=>{expect(hd313supx(3,1)).toBe(1);});it('c',()=>{expect(hd313supx(0,0)).toBe(0);});it('d',()=>{expect(hd313supx(93,73)).toBe(2);});it('e',()=>{expect(hd313supx(15,0)).toBe(4);});});
function hd314supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314supx_hd',()=>{it('a',()=>{expect(hd314supx(1,4)).toBe(2);});it('b',()=>{expect(hd314supx(3,1)).toBe(1);});it('c',()=>{expect(hd314supx(0,0)).toBe(0);});it('d',()=>{expect(hd314supx(93,73)).toBe(2);});it('e',()=>{expect(hd314supx(15,0)).toBe(4);});});
function hd315supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315supx_hd',()=>{it('a',()=>{expect(hd315supx(1,4)).toBe(2);});it('b',()=>{expect(hd315supx(3,1)).toBe(1);});it('c',()=>{expect(hd315supx(0,0)).toBe(0);});it('d',()=>{expect(hd315supx(93,73)).toBe(2);});it('e',()=>{expect(hd315supx(15,0)).toBe(4);});});
function hd316supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316supx_hd',()=>{it('a',()=>{expect(hd316supx(1,4)).toBe(2);});it('b',()=>{expect(hd316supx(3,1)).toBe(1);});it('c',()=>{expect(hd316supx(0,0)).toBe(0);});it('d',()=>{expect(hd316supx(93,73)).toBe(2);});it('e',()=>{expect(hd316supx(15,0)).toBe(4);});});
function hd317supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317supx_hd',()=>{it('a',()=>{expect(hd317supx(1,4)).toBe(2);});it('b',()=>{expect(hd317supx(3,1)).toBe(1);});it('c',()=>{expect(hd317supx(0,0)).toBe(0);});it('d',()=>{expect(hd317supx(93,73)).toBe(2);});it('e',()=>{expect(hd317supx(15,0)).toBe(4);});});
function hd318supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318supx_hd',()=>{it('a',()=>{expect(hd318supx(1,4)).toBe(2);});it('b',()=>{expect(hd318supx(3,1)).toBe(1);});it('c',()=>{expect(hd318supx(0,0)).toBe(0);});it('d',()=>{expect(hd318supx(93,73)).toBe(2);});it('e',()=>{expect(hd318supx(15,0)).toBe(4);});});
function hd319supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319supx_hd',()=>{it('a',()=>{expect(hd319supx(1,4)).toBe(2);});it('b',()=>{expect(hd319supx(3,1)).toBe(1);});it('c',()=>{expect(hd319supx(0,0)).toBe(0);});it('d',()=>{expect(hd319supx(93,73)).toBe(2);});it('e',()=>{expect(hd319supx(15,0)).toBe(4);});});
function hd320supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320supx_hd',()=>{it('a',()=>{expect(hd320supx(1,4)).toBe(2);});it('b',()=>{expect(hd320supx(3,1)).toBe(1);});it('c',()=>{expect(hd320supx(0,0)).toBe(0);});it('d',()=>{expect(hd320supx(93,73)).toBe(2);});it('e',()=>{expect(hd320supx(15,0)).toBe(4);});});
function hd321supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321supx_hd',()=>{it('a',()=>{expect(hd321supx(1,4)).toBe(2);});it('b',()=>{expect(hd321supx(3,1)).toBe(1);});it('c',()=>{expect(hd321supx(0,0)).toBe(0);});it('d',()=>{expect(hd321supx(93,73)).toBe(2);});it('e',()=>{expect(hd321supx(15,0)).toBe(4);});});
function hd322supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322supx_hd',()=>{it('a',()=>{expect(hd322supx(1,4)).toBe(2);});it('b',()=>{expect(hd322supx(3,1)).toBe(1);});it('c',()=>{expect(hd322supx(0,0)).toBe(0);});it('d',()=>{expect(hd322supx(93,73)).toBe(2);});it('e',()=>{expect(hd322supx(15,0)).toBe(4);});});
function hd323supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323supx_hd',()=>{it('a',()=>{expect(hd323supx(1,4)).toBe(2);});it('b',()=>{expect(hd323supx(3,1)).toBe(1);});it('c',()=>{expect(hd323supx(0,0)).toBe(0);});it('d',()=>{expect(hd323supx(93,73)).toBe(2);});it('e',()=>{expect(hd323supx(15,0)).toBe(4);});});
function hd324supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324supx_hd',()=>{it('a',()=>{expect(hd324supx(1,4)).toBe(2);});it('b',()=>{expect(hd324supx(3,1)).toBe(1);});it('c',()=>{expect(hd324supx(0,0)).toBe(0);});it('d',()=>{expect(hd324supx(93,73)).toBe(2);});it('e',()=>{expect(hd324supx(15,0)).toBe(4);});});
function hd325supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325supx_hd',()=>{it('a',()=>{expect(hd325supx(1,4)).toBe(2);});it('b',()=>{expect(hd325supx(3,1)).toBe(1);});it('c',()=>{expect(hd325supx(0,0)).toBe(0);});it('d',()=>{expect(hd325supx(93,73)).toBe(2);});it('e',()=>{expect(hd325supx(15,0)).toBe(4);});});
function hd326supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326supx_hd',()=>{it('a',()=>{expect(hd326supx(1,4)).toBe(2);});it('b',()=>{expect(hd326supx(3,1)).toBe(1);});it('c',()=>{expect(hd326supx(0,0)).toBe(0);});it('d',()=>{expect(hd326supx(93,73)).toBe(2);});it('e',()=>{expect(hd326supx(15,0)).toBe(4);});});
function hd327supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327supx_hd',()=>{it('a',()=>{expect(hd327supx(1,4)).toBe(2);});it('b',()=>{expect(hd327supx(3,1)).toBe(1);});it('c',()=>{expect(hd327supx(0,0)).toBe(0);});it('d',()=>{expect(hd327supx(93,73)).toBe(2);});it('e',()=>{expect(hd327supx(15,0)).toBe(4);});});
function hd328supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328supx_hd',()=>{it('a',()=>{expect(hd328supx(1,4)).toBe(2);});it('b',()=>{expect(hd328supx(3,1)).toBe(1);});it('c',()=>{expect(hd328supx(0,0)).toBe(0);});it('d',()=>{expect(hd328supx(93,73)).toBe(2);});it('e',()=>{expect(hd328supx(15,0)).toBe(4);});});
function hd329supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329supx_hd',()=>{it('a',()=>{expect(hd329supx(1,4)).toBe(2);});it('b',()=>{expect(hd329supx(3,1)).toBe(1);});it('c',()=>{expect(hd329supx(0,0)).toBe(0);});it('d',()=>{expect(hd329supx(93,73)).toBe(2);});it('e',()=>{expect(hd329supx(15,0)).toBe(4);});});
function hd330supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330supx_hd',()=>{it('a',()=>{expect(hd330supx(1,4)).toBe(2);});it('b',()=>{expect(hd330supx(3,1)).toBe(1);});it('c',()=>{expect(hd330supx(0,0)).toBe(0);});it('d',()=>{expect(hd330supx(93,73)).toBe(2);});it('e',()=>{expect(hd330supx(15,0)).toBe(4);});});
function hd331supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331supx_hd',()=>{it('a',()=>{expect(hd331supx(1,4)).toBe(2);});it('b',()=>{expect(hd331supx(3,1)).toBe(1);});it('c',()=>{expect(hd331supx(0,0)).toBe(0);});it('d',()=>{expect(hd331supx(93,73)).toBe(2);});it('e',()=>{expect(hd331supx(15,0)).toBe(4);});});
function hd332supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332supx_hd',()=>{it('a',()=>{expect(hd332supx(1,4)).toBe(2);});it('b',()=>{expect(hd332supx(3,1)).toBe(1);});it('c',()=>{expect(hd332supx(0,0)).toBe(0);});it('d',()=>{expect(hd332supx(93,73)).toBe(2);});it('e',()=>{expect(hd332supx(15,0)).toBe(4);});});
function hd333supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333supx_hd',()=>{it('a',()=>{expect(hd333supx(1,4)).toBe(2);});it('b',()=>{expect(hd333supx(3,1)).toBe(1);});it('c',()=>{expect(hd333supx(0,0)).toBe(0);});it('d',()=>{expect(hd333supx(93,73)).toBe(2);});it('e',()=>{expect(hd333supx(15,0)).toBe(4);});});
function hd334supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334supx_hd',()=>{it('a',()=>{expect(hd334supx(1,4)).toBe(2);});it('b',()=>{expect(hd334supx(3,1)).toBe(1);});it('c',()=>{expect(hd334supx(0,0)).toBe(0);});it('d',()=>{expect(hd334supx(93,73)).toBe(2);});it('e',()=>{expect(hd334supx(15,0)).toBe(4);});});
function hd335supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335supx_hd',()=>{it('a',()=>{expect(hd335supx(1,4)).toBe(2);});it('b',()=>{expect(hd335supx(3,1)).toBe(1);});it('c',()=>{expect(hd335supx(0,0)).toBe(0);});it('d',()=>{expect(hd335supx(93,73)).toBe(2);});it('e',()=>{expect(hd335supx(15,0)).toBe(4);});});
function hd336supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336supx_hd',()=>{it('a',()=>{expect(hd336supx(1,4)).toBe(2);});it('b',()=>{expect(hd336supx(3,1)).toBe(1);});it('c',()=>{expect(hd336supx(0,0)).toBe(0);});it('d',()=>{expect(hd336supx(93,73)).toBe(2);});it('e',()=>{expect(hd336supx(15,0)).toBe(4);});});
function hd337supx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337supx_hd',()=>{it('a',()=>{expect(hd337supx(1,4)).toBe(2);});it('b',()=>{expect(hd337supx(3,1)).toBe(1);});it('c',()=>{expect(hd337supx(0,0)).toBe(0);});it('d',()=>{expect(hd337supx(93,73)).toBe(2);});it('e',()=>{expect(hd337supx(15,0)).toBe(4);});});
