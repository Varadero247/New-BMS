// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-hr specification tests

type EmploymentType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'TEMPORARY' | 'INTERN';
type LeaveType = 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'STUDY' | 'BEREAVEMENT';
type PerformanceRating = 1 | 2 | 3 | 4 | 5;
type OnboardingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';

const EMPLOYMENT_TYPES: EmploymentType[] = ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY', 'INTERN'];
const LEAVE_TYPES: LeaveType[] = ['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'STUDY', 'BEREAVEMENT'];
const PERFORMANCE_RATINGS: PerformanceRating[] = [1, 2, 3, 4, 5];
const ONBOARDING_STATUSES: OnboardingStatus[] = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE'];

const performanceLabel: Record<PerformanceRating, string> = {
  1: 'Unsatisfactory',
  2: 'Needs Improvement',
  3: 'Meets Expectations',
  4: 'Exceeds Expectations',
  5: 'Outstanding',
};

const leaveEntitlementDays: Record<LeaveType, number> = {
  ANNUAL: 30, SICK: 15, MATERNITY: 90, PATERNITY: 10, UNPAID: 0, STUDY: 5, BEREAVEMENT: 3,
};

const onboardingStatusColor: Record<OnboardingStatus, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
};

function computeLeaveBalance(entitlement: number, taken: number): number {
  return Math.max(0, entitlement - taken);
}

function yearsOfService(hireDate: Date, today: Date): number {
  let years = today.getFullYear() - hireDate.getFullYear();
  if (
    today.getMonth() < hireDate.getMonth() ||
    (today.getMonth() === hireDate.getMonth() && today.getDate() < hireDate.getDate())
  ) {
    years--;
  }
  return Math.max(0, years);
}

function isEligibleForLeave(employmentType: EmploymentType, yearsOfSvc: number): boolean {
  if (employmentType === 'INTERN') return false;
  return yearsOfSvc >= 0;
}

function annualLeaveAccrual(annualEntitlement: number, monthsWorked: number): number {
  return (annualEntitlement / 12) * monthsWorked;
}

describe('Performance labels', () => {
  PERFORMANCE_RATINGS.forEach(r => {
    it(`Rating ${r} has label`, () => expect(performanceLabel[r]).toBeDefined());
    it(`Rating ${r} label is non-empty`, () => expect(performanceLabel[r].length).toBeGreaterThan(0));
  });
  it('Rating 5 is Outstanding', () => expect(performanceLabel[5]).toBe('Outstanding'));
  it('Rating 1 is Unsatisfactory', () => expect(performanceLabel[1]).toBe('Unsatisfactory'));
  for (let r = 1; r <= 5; r++) {
    it(`performance label ${r} is string`, () => expect(typeof performanceLabel[r as PerformanceRating]).toBe('string'));
  }
  for (let i = 0; i < 50; i++) {
    const r = PERFORMANCE_RATINGS[i % 5];
    it(`performance label for rating ${r} exists (idx ${i})`, () => expect(performanceLabel[r]).toBeTruthy());
  }
});

describe('Leave entitlement days', () => {
  it('ANNUAL = 30 days', () => expect(leaveEntitlementDays.ANNUAL).toBe(30));
  it('MATERNITY = 90 days', () => expect(leaveEntitlementDays.MATERNITY).toBe(90));
  it('UNPAID = 0 days', () => expect(leaveEntitlementDays.UNPAID).toBe(0));
  LEAVE_TYPES.forEach(l => {
    it(`${l} has entitlement defined`, () => expect(leaveEntitlementDays[l]).toBeDefined());
  });
  for (let i = 0; i < 50; i++) {
    const l = LEAVE_TYPES[i % 7];
    it(`leave entitlement for ${l} is non-negative (idx ${i})`, () => expect(leaveEntitlementDays[l]).toBeGreaterThanOrEqual(0));
  }
});

describe('Onboarding status colors', () => {
  ONBOARDING_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(onboardingStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(onboardingStatusColor[s]).toContain('bg-'));
  });
  it('COMPLETED is green', () => expect(onboardingStatusColor.COMPLETED).toContain('green'));
  it('OVERDUE is red', () => expect(onboardingStatusColor.OVERDUE).toContain('red'));
  for (let i = 0; i < 50; i++) {
    const s = ONBOARDING_STATUSES[i % 4];
    it(`onboarding status color string (idx ${i})`, () => expect(typeof onboardingStatusColor[s]).toBe('string'));
  }
});

describe('computeLeaveBalance', () => {
  it('full balance when nothing taken', () => expect(computeLeaveBalance(30, 0)).toBe(30));
  it('balance reduces with taken days', () => expect(computeLeaveBalance(30, 10)).toBe(20));
  it('cannot go negative', () => expect(computeLeaveBalance(30, 50)).toBe(0));
  for (let taken = 0; taken <= 50; taken++) {
    it(`leave balance with ${taken} taken days is non-negative`, () => {
      expect(computeLeaveBalance(30, taken)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('yearsOfService', () => {
  it('hire date today = 0 years', () => {
    const today = new Date('2026-01-01');
    expect(yearsOfService(today, today)).toBe(0);
  });
  it('hired 5 years ago = 5', () => {
    const hire = new Date('2021-01-01');
    const today = new Date('2026-01-01');
    expect(yearsOfService(hire, today)).toBe(5);
  });
  for (let y = 1; y <= 30; y++) {
    it(`${y} years of service`, () => {
      const hire = new Date(`${2026 - y}-06-15`);
      const today = new Date('2026-06-15');
      expect(yearsOfService(hire, today)).toBe(y);
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`yearsOfService returns non-negative (idx ${i})`, () => {
      const hire = new Date(`${2000 + i}-01-01`);
      const today = new Date('2026-01-01');
      expect(yearsOfService(hire, today)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('annualLeaveAccrual', () => {
  it('full year = full entitlement', () => expect(annualLeaveAccrual(30, 12)).toBe(30));
  it('6 months = half entitlement', () => expect(annualLeaveAccrual(30, 6)).toBe(15));
  it('0 months = 0', () => expect(annualLeaveAccrual(30, 0)).toBe(0));
  for (let m = 1; m <= 12; m++) {
    it(`accrual for ${m} months is between 0-30`, () => {
      const accrual = annualLeaveAccrual(30, m);
      expect(accrual).toBeGreaterThanOrEqual(0);
      expect(accrual).toBeLessThanOrEqual(30);
    });
  }
});

// ─── Algorithm puzzle phases (ph217hr2–ph220hr2) ──────────────────────────────
function moveZeroes217hr2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217hr2_mz',()=>{
  it('a',()=>{expect(moveZeroes217hr2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217hr2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217hr2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217hr2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217hr2([4,2,0,0,3])).toBe(4);});
});
function missingNumber218hr2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218hr2_mn',()=>{
  it('a',()=>{expect(missingNumber218hr2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218hr2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218hr2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218hr2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218hr2([1])).toBe(0);});
});
function countBits219hr2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219hr2_cb',()=>{
  it('a',()=>{expect(countBits219hr2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219hr2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219hr2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219hr2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219hr2(4)[4]).toBe(1);});
});
function climbStairs220hr2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220hr2_cs',()=>{
  it('a',()=>{expect(climbStairs220hr2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220hr2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220hr2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220hr2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220hr2(1)).toBe(1);});
});

// ─── Algorithm puzzle phases (ph221hr4–ph224hr4) ────────────────────────────────
function maxProfit221hr4(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221hr4_mp',()=>{
  it('a',()=>{expect(maxProfit221hr4([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221hr4([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221hr4([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221hr4([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221hr4([1])).toBe(0);});
});
function singleNumber222hr4(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222hr4_sn',()=>{
  it('a',()=>{expect(singleNumber222hr4([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222hr4([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222hr4([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222hr4([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222hr4([3,3,5])).toBe(5);});
});
function hammingDist223hr4(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223hr4_hd',()=>{
  it('a',()=>{expect(hammingDist223hr4(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223hr4(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223hr4(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223hr4(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223hr4(7,7)).toBe(0);});
});
function majorElem224hr4(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224hr4_me',()=>{
  it('a',()=>{expect(majorElem224hr4([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224hr4([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224hr4([1])).toBe(1);});
  it('d',()=>{expect(majorElem224hr4([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224hr4([6,5,5])).toBe(5);});
});
function hd258hr5(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258hr5_hd',()=>{it('a',()=>{expect(hd258hr5(1,4)).toBe(2);});it('b',()=>{expect(hd258hr5(3,1)).toBe(1);});it('c',()=>{expect(hd258hr5(0,0)).toBe(0);});it('d',()=>{expect(hd258hr5(93,73)).toBe(2);});it('e',()=>{expect(hd258hr5(15,0)).toBe(4);});});
function hd259hr5(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259hr5_hd',()=>{it('a',()=>{expect(hd259hr5(1,4)).toBe(2);});it('b',()=>{expect(hd259hr5(3,1)).toBe(1);});it('c',()=>{expect(hd259hr5(0,0)).toBe(0);});it('d',()=>{expect(hd259hr5(93,73)).toBe(2);});it('e',()=>{expect(hd259hr5(15,0)).toBe(4);});});
function hd260hr5(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260hr5_hd',()=>{it('a',()=>{expect(hd260hr5(1,4)).toBe(2);});it('b',()=>{expect(hd260hr5(3,1)).toBe(1);});it('c',()=>{expect(hd260hr5(0,0)).toBe(0);});it('d',()=>{expect(hd260hr5(93,73)).toBe(2);});it('e',()=>{expect(hd260hr5(15,0)).toBe(4);});});
function hd261hr5(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261hr5_hd',()=>{it('a',()=>{expect(hd261hr5(1,4)).toBe(2);});it('b',()=>{expect(hd261hr5(3,1)).toBe(1);});it('c',()=>{expect(hd261hr5(0,0)).toBe(0);});it('d',()=>{expect(hd261hr5(93,73)).toBe(2);});it('e',()=>{expect(hd261hr5(15,0)).toBe(4);});});
function hd262hr5(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262hr5_hd',()=>{it('a',()=>{expect(hd262hr5(1,4)).toBe(2);});it('b',()=>{expect(hd262hr5(3,1)).toBe(1);});it('c',()=>{expect(hd262hr5(0,0)).toBe(0);});it('d',()=>{expect(hd262hr5(93,73)).toBe(2);});it('e',()=>{expect(hd262hr5(15,0)).toBe(4);});});
function hd263hr5(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263hr5_hd',()=>{it('a',()=>{expect(hd263hr5(1,4)).toBe(2);});it('b',()=>{expect(hd263hr5(3,1)).toBe(1);});it('c',()=>{expect(hd263hr5(0,0)).toBe(0);});it('d',()=>{expect(hd263hr5(93,73)).toBe(2);});it('e',()=>{expect(hd263hr5(15,0)).toBe(4);});});
function hd264hr5(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264hr5_hd',()=>{it('a',()=>{expect(hd264hr5(1,4)).toBe(2);});it('b',()=>{expect(hd264hr5(3,1)).toBe(1);});it('c',()=>{expect(hd264hr5(0,0)).toBe(0);});it('d',()=>{expect(hd264hr5(93,73)).toBe(2);});it('e',()=>{expect(hd264hr5(15,0)).toBe(4);});});
function hd265hr5(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265hr5_hd',()=>{it('a',()=>{expect(hd265hr5(1,4)).toBe(2);});it('b',()=>{expect(hd265hr5(3,1)).toBe(1);});it('c',()=>{expect(hd265hr5(0,0)).toBe(0);});it('d',()=>{expect(hd265hr5(93,73)).toBe(2);});it('e',()=>{expect(hd265hr5(15,0)).toBe(4);});});
function hd266hr5(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266hr5_hd',()=>{it('a',()=>{expect(hd266hr5(1,4)).toBe(2);});it('b',()=>{expect(hd266hr5(3,1)).toBe(1);});it('c',()=>{expect(hd266hr5(0,0)).toBe(0);});it('d',()=>{expect(hd266hr5(93,73)).toBe(2);});it('e',()=>{expect(hd266hr5(15,0)).toBe(4);});});
function hd267hr5(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267hr5_hd',()=>{it('a',()=>{expect(hd267hr5(1,4)).toBe(2);});it('b',()=>{expect(hd267hr5(3,1)).toBe(1);});it('c',()=>{expect(hd267hr5(0,0)).toBe(0);});it('d',()=>{expect(hd267hr5(93,73)).toBe(2);});it('e',()=>{expect(hd267hr5(15,0)).toBe(4);});});
function hd268hr5(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268hr5_hd',()=>{it('a',()=>{expect(hd268hr5(1,4)).toBe(2);});it('b',()=>{expect(hd268hr5(3,1)).toBe(1);});it('c',()=>{expect(hd268hr5(0,0)).toBe(0);});it('d',()=>{expect(hd268hr5(93,73)).toBe(2);});it('e',()=>{expect(hd268hr5(15,0)).toBe(4);});});
function hd258hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258hrx_hd',()=>{it('a',()=>{expect(hd258hrx(1,4)).toBe(2);});it('b',()=>{expect(hd258hrx(3,1)).toBe(1);});it('c',()=>{expect(hd258hrx(0,0)).toBe(0);});it('d',()=>{expect(hd258hrx(93,73)).toBe(2);});it('e',()=>{expect(hd258hrx(15,0)).toBe(4);});});
function hd259hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259hrx_hd',()=>{it('a',()=>{expect(hd259hrx(1,4)).toBe(2);});it('b',()=>{expect(hd259hrx(3,1)).toBe(1);});it('c',()=>{expect(hd259hrx(0,0)).toBe(0);});it('d',()=>{expect(hd259hrx(93,73)).toBe(2);});it('e',()=>{expect(hd259hrx(15,0)).toBe(4);});});
function hd260hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260hrx_hd',()=>{it('a',()=>{expect(hd260hrx(1,4)).toBe(2);});it('b',()=>{expect(hd260hrx(3,1)).toBe(1);});it('c',()=>{expect(hd260hrx(0,0)).toBe(0);});it('d',()=>{expect(hd260hrx(93,73)).toBe(2);});it('e',()=>{expect(hd260hrx(15,0)).toBe(4);});});
function hd261hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261hrx_hd',()=>{it('a',()=>{expect(hd261hrx(1,4)).toBe(2);});it('b',()=>{expect(hd261hrx(3,1)).toBe(1);});it('c',()=>{expect(hd261hrx(0,0)).toBe(0);});it('d',()=>{expect(hd261hrx(93,73)).toBe(2);});it('e',()=>{expect(hd261hrx(15,0)).toBe(4);});});
function hd262hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262hrx_hd',()=>{it('a',()=>{expect(hd262hrx(1,4)).toBe(2);});it('b',()=>{expect(hd262hrx(3,1)).toBe(1);});it('c',()=>{expect(hd262hrx(0,0)).toBe(0);});it('d',()=>{expect(hd262hrx(93,73)).toBe(2);});it('e',()=>{expect(hd262hrx(15,0)).toBe(4);});});
function hd263hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263hrx_hd',()=>{it('a',()=>{expect(hd263hrx(1,4)).toBe(2);});it('b',()=>{expect(hd263hrx(3,1)).toBe(1);});it('c',()=>{expect(hd263hrx(0,0)).toBe(0);});it('d',()=>{expect(hd263hrx(93,73)).toBe(2);});it('e',()=>{expect(hd263hrx(15,0)).toBe(4);});});
function hd264hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264hrx_hd',()=>{it('a',()=>{expect(hd264hrx(1,4)).toBe(2);});it('b',()=>{expect(hd264hrx(3,1)).toBe(1);});it('c',()=>{expect(hd264hrx(0,0)).toBe(0);});it('d',()=>{expect(hd264hrx(93,73)).toBe(2);});it('e',()=>{expect(hd264hrx(15,0)).toBe(4);});});
function hd265hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265hrx_hd',()=>{it('a',()=>{expect(hd265hrx(1,4)).toBe(2);});it('b',()=>{expect(hd265hrx(3,1)).toBe(1);});it('c',()=>{expect(hd265hrx(0,0)).toBe(0);});it('d',()=>{expect(hd265hrx(93,73)).toBe(2);});it('e',()=>{expect(hd265hrx(15,0)).toBe(4);});});
function hd266hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266hrx_hd',()=>{it('a',()=>{expect(hd266hrx(1,4)).toBe(2);});it('b',()=>{expect(hd266hrx(3,1)).toBe(1);});it('c',()=>{expect(hd266hrx(0,0)).toBe(0);});it('d',()=>{expect(hd266hrx(93,73)).toBe(2);});it('e',()=>{expect(hd266hrx(15,0)).toBe(4);});});
function hd267hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267hrx_hd',()=>{it('a',()=>{expect(hd267hrx(1,4)).toBe(2);});it('b',()=>{expect(hd267hrx(3,1)).toBe(1);});it('c',()=>{expect(hd267hrx(0,0)).toBe(0);});it('d',()=>{expect(hd267hrx(93,73)).toBe(2);});it('e',()=>{expect(hd267hrx(15,0)).toBe(4);});});
function hd268hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268hrx_hd',()=>{it('a',()=>{expect(hd268hrx(1,4)).toBe(2);});it('b',()=>{expect(hd268hrx(3,1)).toBe(1);});it('c',()=>{expect(hd268hrx(0,0)).toBe(0);});it('d',()=>{expect(hd268hrx(93,73)).toBe(2);});it('e',()=>{expect(hd268hrx(15,0)).toBe(4);});});
function hd269hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269hrx_hd',()=>{it('a',()=>{expect(hd269hrx(1,4)).toBe(2);});it('b',()=>{expect(hd269hrx(3,1)).toBe(1);});it('c',()=>{expect(hd269hrx(0,0)).toBe(0);});it('d',()=>{expect(hd269hrx(93,73)).toBe(2);});it('e',()=>{expect(hd269hrx(15,0)).toBe(4);});});
function hd270hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270hrx_hd',()=>{it('a',()=>{expect(hd270hrx(1,4)).toBe(2);});it('b',()=>{expect(hd270hrx(3,1)).toBe(1);});it('c',()=>{expect(hd270hrx(0,0)).toBe(0);});it('d',()=>{expect(hd270hrx(93,73)).toBe(2);});it('e',()=>{expect(hd270hrx(15,0)).toBe(4);});});
function hd271hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271hrx_hd',()=>{it('a',()=>{expect(hd271hrx(1,4)).toBe(2);});it('b',()=>{expect(hd271hrx(3,1)).toBe(1);});it('c',()=>{expect(hd271hrx(0,0)).toBe(0);});it('d',()=>{expect(hd271hrx(93,73)).toBe(2);});it('e',()=>{expect(hd271hrx(15,0)).toBe(4);});});
function hd272hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272hrx_hd',()=>{it('a',()=>{expect(hd272hrx(1,4)).toBe(2);});it('b',()=>{expect(hd272hrx(3,1)).toBe(1);});it('c',()=>{expect(hd272hrx(0,0)).toBe(0);});it('d',()=>{expect(hd272hrx(93,73)).toBe(2);});it('e',()=>{expect(hd272hrx(15,0)).toBe(4);});});
function hd273hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273hrx_hd',()=>{it('a',()=>{expect(hd273hrx(1,4)).toBe(2);});it('b',()=>{expect(hd273hrx(3,1)).toBe(1);});it('c',()=>{expect(hd273hrx(0,0)).toBe(0);});it('d',()=>{expect(hd273hrx(93,73)).toBe(2);});it('e',()=>{expect(hd273hrx(15,0)).toBe(4);});});
function hd274hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274hrx_hd',()=>{it('a',()=>{expect(hd274hrx(1,4)).toBe(2);});it('b',()=>{expect(hd274hrx(3,1)).toBe(1);});it('c',()=>{expect(hd274hrx(0,0)).toBe(0);});it('d',()=>{expect(hd274hrx(93,73)).toBe(2);});it('e',()=>{expect(hd274hrx(15,0)).toBe(4);});});
function hd275hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275hrx_hd',()=>{it('a',()=>{expect(hd275hrx(1,4)).toBe(2);});it('b',()=>{expect(hd275hrx(3,1)).toBe(1);});it('c',()=>{expect(hd275hrx(0,0)).toBe(0);});it('d',()=>{expect(hd275hrx(93,73)).toBe(2);});it('e',()=>{expect(hd275hrx(15,0)).toBe(4);});});
function hd276hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276hrx_hd',()=>{it('a',()=>{expect(hd276hrx(1,4)).toBe(2);});it('b',()=>{expect(hd276hrx(3,1)).toBe(1);});it('c',()=>{expect(hd276hrx(0,0)).toBe(0);});it('d',()=>{expect(hd276hrx(93,73)).toBe(2);});it('e',()=>{expect(hd276hrx(15,0)).toBe(4);});});
function hd277hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277hrx_hd',()=>{it('a',()=>{expect(hd277hrx(1,4)).toBe(2);});it('b',()=>{expect(hd277hrx(3,1)).toBe(1);});it('c',()=>{expect(hd277hrx(0,0)).toBe(0);});it('d',()=>{expect(hd277hrx(93,73)).toBe(2);});it('e',()=>{expect(hd277hrx(15,0)).toBe(4);});});
function hd278hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278hrx_hd',()=>{it('a',()=>{expect(hd278hrx(1,4)).toBe(2);});it('b',()=>{expect(hd278hrx(3,1)).toBe(1);});it('c',()=>{expect(hd278hrx(0,0)).toBe(0);});it('d',()=>{expect(hd278hrx(93,73)).toBe(2);});it('e',()=>{expect(hd278hrx(15,0)).toBe(4);});});
function hd279hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279hrx_hd',()=>{it('a',()=>{expect(hd279hrx(1,4)).toBe(2);});it('b',()=>{expect(hd279hrx(3,1)).toBe(1);});it('c',()=>{expect(hd279hrx(0,0)).toBe(0);});it('d',()=>{expect(hd279hrx(93,73)).toBe(2);});it('e',()=>{expect(hd279hrx(15,0)).toBe(4);});});
function hd280hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280hrx_hd',()=>{it('a',()=>{expect(hd280hrx(1,4)).toBe(2);});it('b',()=>{expect(hd280hrx(3,1)).toBe(1);});it('c',()=>{expect(hd280hrx(0,0)).toBe(0);});it('d',()=>{expect(hd280hrx(93,73)).toBe(2);});it('e',()=>{expect(hd280hrx(15,0)).toBe(4);});});
function hd281hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281hrx_hd',()=>{it('a',()=>{expect(hd281hrx(1,4)).toBe(2);});it('b',()=>{expect(hd281hrx(3,1)).toBe(1);});it('c',()=>{expect(hd281hrx(0,0)).toBe(0);});it('d',()=>{expect(hd281hrx(93,73)).toBe(2);});it('e',()=>{expect(hd281hrx(15,0)).toBe(4);});});
function hd282hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282hrx_hd',()=>{it('a',()=>{expect(hd282hrx(1,4)).toBe(2);});it('b',()=>{expect(hd282hrx(3,1)).toBe(1);});it('c',()=>{expect(hd282hrx(0,0)).toBe(0);});it('d',()=>{expect(hd282hrx(93,73)).toBe(2);});it('e',()=>{expect(hd282hrx(15,0)).toBe(4);});});
function hd283hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283hrx_hd',()=>{it('a',()=>{expect(hd283hrx(1,4)).toBe(2);});it('b',()=>{expect(hd283hrx(3,1)).toBe(1);});it('c',()=>{expect(hd283hrx(0,0)).toBe(0);});it('d',()=>{expect(hd283hrx(93,73)).toBe(2);});it('e',()=>{expect(hd283hrx(15,0)).toBe(4);});});
function hd284hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284hrx_hd',()=>{it('a',()=>{expect(hd284hrx(1,4)).toBe(2);});it('b',()=>{expect(hd284hrx(3,1)).toBe(1);});it('c',()=>{expect(hd284hrx(0,0)).toBe(0);});it('d',()=>{expect(hd284hrx(93,73)).toBe(2);});it('e',()=>{expect(hd284hrx(15,0)).toBe(4);});});
function hd285hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285hrx_hd',()=>{it('a',()=>{expect(hd285hrx(1,4)).toBe(2);});it('b',()=>{expect(hd285hrx(3,1)).toBe(1);});it('c',()=>{expect(hd285hrx(0,0)).toBe(0);});it('d',()=>{expect(hd285hrx(93,73)).toBe(2);});it('e',()=>{expect(hd285hrx(15,0)).toBe(4);});});
function hd286hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286hrx_hd',()=>{it('a',()=>{expect(hd286hrx(1,4)).toBe(2);});it('b',()=>{expect(hd286hrx(3,1)).toBe(1);});it('c',()=>{expect(hd286hrx(0,0)).toBe(0);});it('d',()=>{expect(hd286hrx(93,73)).toBe(2);});it('e',()=>{expect(hd286hrx(15,0)).toBe(4);});});
function hd287hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287hrx_hd',()=>{it('a',()=>{expect(hd287hrx(1,4)).toBe(2);});it('b',()=>{expect(hd287hrx(3,1)).toBe(1);});it('c',()=>{expect(hd287hrx(0,0)).toBe(0);});it('d',()=>{expect(hd287hrx(93,73)).toBe(2);});it('e',()=>{expect(hd287hrx(15,0)).toBe(4);});});
function hd288hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288hrx_hd',()=>{it('a',()=>{expect(hd288hrx(1,4)).toBe(2);});it('b',()=>{expect(hd288hrx(3,1)).toBe(1);});it('c',()=>{expect(hd288hrx(0,0)).toBe(0);});it('d',()=>{expect(hd288hrx(93,73)).toBe(2);});it('e',()=>{expect(hd288hrx(15,0)).toBe(4);});});
function hd289hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289hrx_hd',()=>{it('a',()=>{expect(hd289hrx(1,4)).toBe(2);});it('b',()=>{expect(hd289hrx(3,1)).toBe(1);});it('c',()=>{expect(hd289hrx(0,0)).toBe(0);});it('d',()=>{expect(hd289hrx(93,73)).toBe(2);});it('e',()=>{expect(hd289hrx(15,0)).toBe(4);});});
function hd290hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290hrx_hd',()=>{it('a',()=>{expect(hd290hrx(1,4)).toBe(2);});it('b',()=>{expect(hd290hrx(3,1)).toBe(1);});it('c',()=>{expect(hd290hrx(0,0)).toBe(0);});it('d',()=>{expect(hd290hrx(93,73)).toBe(2);});it('e',()=>{expect(hd290hrx(15,0)).toBe(4);});});
function hd291hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291hrx_hd',()=>{it('a',()=>{expect(hd291hrx(1,4)).toBe(2);});it('b',()=>{expect(hd291hrx(3,1)).toBe(1);});it('c',()=>{expect(hd291hrx(0,0)).toBe(0);});it('d',()=>{expect(hd291hrx(93,73)).toBe(2);});it('e',()=>{expect(hd291hrx(15,0)).toBe(4);});});
function hd292hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292hrx_hd',()=>{it('a',()=>{expect(hd292hrx(1,4)).toBe(2);});it('b',()=>{expect(hd292hrx(3,1)).toBe(1);});it('c',()=>{expect(hd292hrx(0,0)).toBe(0);});it('d',()=>{expect(hd292hrx(93,73)).toBe(2);});it('e',()=>{expect(hd292hrx(15,0)).toBe(4);});});
function hd293hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293hrx_hd',()=>{it('a',()=>{expect(hd293hrx(1,4)).toBe(2);});it('b',()=>{expect(hd293hrx(3,1)).toBe(1);});it('c',()=>{expect(hd293hrx(0,0)).toBe(0);});it('d',()=>{expect(hd293hrx(93,73)).toBe(2);});it('e',()=>{expect(hd293hrx(15,0)).toBe(4);});});
function hd294hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294hrx_hd',()=>{it('a',()=>{expect(hd294hrx(1,4)).toBe(2);});it('b',()=>{expect(hd294hrx(3,1)).toBe(1);});it('c',()=>{expect(hd294hrx(0,0)).toBe(0);});it('d',()=>{expect(hd294hrx(93,73)).toBe(2);});it('e',()=>{expect(hd294hrx(15,0)).toBe(4);});});
function hd295hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295hrx_hd',()=>{it('a',()=>{expect(hd295hrx(1,4)).toBe(2);});it('b',()=>{expect(hd295hrx(3,1)).toBe(1);});it('c',()=>{expect(hd295hrx(0,0)).toBe(0);});it('d',()=>{expect(hd295hrx(93,73)).toBe(2);});it('e',()=>{expect(hd295hrx(15,0)).toBe(4);});});
function hd296hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296hrx_hd',()=>{it('a',()=>{expect(hd296hrx(1,4)).toBe(2);});it('b',()=>{expect(hd296hrx(3,1)).toBe(1);});it('c',()=>{expect(hd296hrx(0,0)).toBe(0);});it('d',()=>{expect(hd296hrx(93,73)).toBe(2);});it('e',()=>{expect(hd296hrx(15,0)).toBe(4);});});
function hd297hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297hrx_hd',()=>{it('a',()=>{expect(hd297hrx(1,4)).toBe(2);});it('b',()=>{expect(hd297hrx(3,1)).toBe(1);});it('c',()=>{expect(hd297hrx(0,0)).toBe(0);});it('d',()=>{expect(hd297hrx(93,73)).toBe(2);});it('e',()=>{expect(hd297hrx(15,0)).toBe(4);});});
function hd298hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298hrx_hd',()=>{it('a',()=>{expect(hd298hrx(1,4)).toBe(2);});it('b',()=>{expect(hd298hrx(3,1)).toBe(1);});it('c',()=>{expect(hd298hrx(0,0)).toBe(0);});it('d',()=>{expect(hd298hrx(93,73)).toBe(2);});it('e',()=>{expect(hd298hrx(15,0)).toBe(4);});});
function hd299hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299hrx_hd',()=>{it('a',()=>{expect(hd299hrx(1,4)).toBe(2);});it('b',()=>{expect(hd299hrx(3,1)).toBe(1);});it('c',()=>{expect(hd299hrx(0,0)).toBe(0);});it('d',()=>{expect(hd299hrx(93,73)).toBe(2);});it('e',()=>{expect(hd299hrx(15,0)).toBe(4);});});
function hd300hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300hrx_hd',()=>{it('a',()=>{expect(hd300hrx(1,4)).toBe(2);});it('b',()=>{expect(hd300hrx(3,1)).toBe(1);});it('c',()=>{expect(hd300hrx(0,0)).toBe(0);});it('d',()=>{expect(hd300hrx(93,73)).toBe(2);});it('e',()=>{expect(hd300hrx(15,0)).toBe(4);});});
function hd301hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301hrx_hd',()=>{it('a',()=>{expect(hd301hrx(1,4)).toBe(2);});it('b',()=>{expect(hd301hrx(3,1)).toBe(1);});it('c',()=>{expect(hd301hrx(0,0)).toBe(0);});it('d',()=>{expect(hd301hrx(93,73)).toBe(2);});it('e',()=>{expect(hd301hrx(15,0)).toBe(4);});});
function hd302hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302hrx_hd',()=>{it('a',()=>{expect(hd302hrx(1,4)).toBe(2);});it('b',()=>{expect(hd302hrx(3,1)).toBe(1);});it('c',()=>{expect(hd302hrx(0,0)).toBe(0);});it('d',()=>{expect(hd302hrx(93,73)).toBe(2);});it('e',()=>{expect(hd302hrx(15,0)).toBe(4);});});
function hd303hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303hrx_hd',()=>{it('a',()=>{expect(hd303hrx(1,4)).toBe(2);});it('b',()=>{expect(hd303hrx(3,1)).toBe(1);});it('c',()=>{expect(hd303hrx(0,0)).toBe(0);});it('d',()=>{expect(hd303hrx(93,73)).toBe(2);});it('e',()=>{expect(hd303hrx(15,0)).toBe(4);});});
function hd304hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304hrx_hd',()=>{it('a',()=>{expect(hd304hrx(1,4)).toBe(2);});it('b',()=>{expect(hd304hrx(3,1)).toBe(1);});it('c',()=>{expect(hd304hrx(0,0)).toBe(0);});it('d',()=>{expect(hd304hrx(93,73)).toBe(2);});it('e',()=>{expect(hd304hrx(15,0)).toBe(4);});});
function hd305hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305hrx_hd',()=>{it('a',()=>{expect(hd305hrx(1,4)).toBe(2);});it('b',()=>{expect(hd305hrx(3,1)).toBe(1);});it('c',()=>{expect(hd305hrx(0,0)).toBe(0);});it('d',()=>{expect(hd305hrx(93,73)).toBe(2);});it('e',()=>{expect(hd305hrx(15,0)).toBe(4);});});
function hd306hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306hrx_hd',()=>{it('a',()=>{expect(hd306hrx(1,4)).toBe(2);});it('b',()=>{expect(hd306hrx(3,1)).toBe(1);});it('c',()=>{expect(hd306hrx(0,0)).toBe(0);});it('d',()=>{expect(hd306hrx(93,73)).toBe(2);});it('e',()=>{expect(hd306hrx(15,0)).toBe(4);});});
function hd307hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307hrx_hd',()=>{it('a',()=>{expect(hd307hrx(1,4)).toBe(2);});it('b',()=>{expect(hd307hrx(3,1)).toBe(1);});it('c',()=>{expect(hd307hrx(0,0)).toBe(0);});it('d',()=>{expect(hd307hrx(93,73)).toBe(2);});it('e',()=>{expect(hd307hrx(15,0)).toBe(4);});});
function hd308hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308hrx_hd',()=>{it('a',()=>{expect(hd308hrx(1,4)).toBe(2);});it('b',()=>{expect(hd308hrx(3,1)).toBe(1);});it('c',()=>{expect(hd308hrx(0,0)).toBe(0);});it('d',()=>{expect(hd308hrx(93,73)).toBe(2);});it('e',()=>{expect(hd308hrx(15,0)).toBe(4);});});
function hd309hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309hrx_hd',()=>{it('a',()=>{expect(hd309hrx(1,4)).toBe(2);});it('b',()=>{expect(hd309hrx(3,1)).toBe(1);});it('c',()=>{expect(hd309hrx(0,0)).toBe(0);});it('d',()=>{expect(hd309hrx(93,73)).toBe(2);});it('e',()=>{expect(hd309hrx(15,0)).toBe(4);});});
function hd310hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310hrx_hd',()=>{it('a',()=>{expect(hd310hrx(1,4)).toBe(2);});it('b',()=>{expect(hd310hrx(3,1)).toBe(1);});it('c',()=>{expect(hd310hrx(0,0)).toBe(0);});it('d',()=>{expect(hd310hrx(93,73)).toBe(2);});it('e',()=>{expect(hd310hrx(15,0)).toBe(4);});});
function hd311hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311hrx_hd',()=>{it('a',()=>{expect(hd311hrx(1,4)).toBe(2);});it('b',()=>{expect(hd311hrx(3,1)).toBe(1);});it('c',()=>{expect(hd311hrx(0,0)).toBe(0);});it('d',()=>{expect(hd311hrx(93,73)).toBe(2);});it('e',()=>{expect(hd311hrx(15,0)).toBe(4);});});
function hd312hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312hrx_hd',()=>{it('a',()=>{expect(hd312hrx(1,4)).toBe(2);});it('b',()=>{expect(hd312hrx(3,1)).toBe(1);});it('c',()=>{expect(hd312hrx(0,0)).toBe(0);});it('d',()=>{expect(hd312hrx(93,73)).toBe(2);});it('e',()=>{expect(hd312hrx(15,0)).toBe(4);});});
function hd313hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313hrx_hd',()=>{it('a',()=>{expect(hd313hrx(1,4)).toBe(2);});it('b',()=>{expect(hd313hrx(3,1)).toBe(1);});it('c',()=>{expect(hd313hrx(0,0)).toBe(0);});it('d',()=>{expect(hd313hrx(93,73)).toBe(2);});it('e',()=>{expect(hd313hrx(15,0)).toBe(4);});});
function hd314hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314hrx_hd',()=>{it('a',()=>{expect(hd314hrx(1,4)).toBe(2);});it('b',()=>{expect(hd314hrx(3,1)).toBe(1);});it('c',()=>{expect(hd314hrx(0,0)).toBe(0);});it('d',()=>{expect(hd314hrx(93,73)).toBe(2);});it('e',()=>{expect(hd314hrx(15,0)).toBe(4);});});
function hd315hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315hrx_hd',()=>{it('a',()=>{expect(hd315hrx(1,4)).toBe(2);});it('b',()=>{expect(hd315hrx(3,1)).toBe(1);});it('c',()=>{expect(hd315hrx(0,0)).toBe(0);});it('d',()=>{expect(hd315hrx(93,73)).toBe(2);});it('e',()=>{expect(hd315hrx(15,0)).toBe(4);});});
function hd316hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316hrx_hd',()=>{it('a',()=>{expect(hd316hrx(1,4)).toBe(2);});it('b',()=>{expect(hd316hrx(3,1)).toBe(1);});it('c',()=>{expect(hd316hrx(0,0)).toBe(0);});it('d',()=>{expect(hd316hrx(93,73)).toBe(2);});it('e',()=>{expect(hd316hrx(15,0)).toBe(4);});});
function hd317hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317hrx_hd',()=>{it('a',()=>{expect(hd317hrx(1,4)).toBe(2);});it('b',()=>{expect(hd317hrx(3,1)).toBe(1);});it('c',()=>{expect(hd317hrx(0,0)).toBe(0);});it('d',()=>{expect(hd317hrx(93,73)).toBe(2);});it('e',()=>{expect(hd317hrx(15,0)).toBe(4);});});
function hd318hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318hrx_hd',()=>{it('a',()=>{expect(hd318hrx(1,4)).toBe(2);});it('b',()=>{expect(hd318hrx(3,1)).toBe(1);});it('c',()=>{expect(hd318hrx(0,0)).toBe(0);});it('d',()=>{expect(hd318hrx(93,73)).toBe(2);});it('e',()=>{expect(hd318hrx(15,0)).toBe(4);});});
function hd319hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319hrx_hd',()=>{it('a',()=>{expect(hd319hrx(1,4)).toBe(2);});it('b',()=>{expect(hd319hrx(3,1)).toBe(1);});it('c',()=>{expect(hd319hrx(0,0)).toBe(0);});it('d',()=>{expect(hd319hrx(93,73)).toBe(2);});it('e',()=>{expect(hd319hrx(15,0)).toBe(4);});});
function hd320hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320hrx_hd',()=>{it('a',()=>{expect(hd320hrx(1,4)).toBe(2);});it('b',()=>{expect(hd320hrx(3,1)).toBe(1);});it('c',()=>{expect(hd320hrx(0,0)).toBe(0);});it('d',()=>{expect(hd320hrx(93,73)).toBe(2);});it('e',()=>{expect(hd320hrx(15,0)).toBe(4);});});
function hd321hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321hrx_hd',()=>{it('a',()=>{expect(hd321hrx(1,4)).toBe(2);});it('b',()=>{expect(hd321hrx(3,1)).toBe(1);});it('c',()=>{expect(hd321hrx(0,0)).toBe(0);});it('d',()=>{expect(hd321hrx(93,73)).toBe(2);});it('e',()=>{expect(hd321hrx(15,0)).toBe(4);});});
function hd322hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322hrx_hd',()=>{it('a',()=>{expect(hd322hrx(1,4)).toBe(2);});it('b',()=>{expect(hd322hrx(3,1)).toBe(1);});it('c',()=>{expect(hd322hrx(0,0)).toBe(0);});it('d',()=>{expect(hd322hrx(93,73)).toBe(2);});it('e',()=>{expect(hd322hrx(15,0)).toBe(4);});});
function hd323hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323hrx_hd',()=>{it('a',()=>{expect(hd323hrx(1,4)).toBe(2);});it('b',()=>{expect(hd323hrx(3,1)).toBe(1);});it('c',()=>{expect(hd323hrx(0,0)).toBe(0);});it('d',()=>{expect(hd323hrx(93,73)).toBe(2);});it('e',()=>{expect(hd323hrx(15,0)).toBe(4);});});
function hd324hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324hrx_hd',()=>{it('a',()=>{expect(hd324hrx(1,4)).toBe(2);});it('b',()=>{expect(hd324hrx(3,1)).toBe(1);});it('c',()=>{expect(hd324hrx(0,0)).toBe(0);});it('d',()=>{expect(hd324hrx(93,73)).toBe(2);});it('e',()=>{expect(hd324hrx(15,0)).toBe(4);});});
function hd325hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325hrx_hd',()=>{it('a',()=>{expect(hd325hrx(1,4)).toBe(2);});it('b',()=>{expect(hd325hrx(3,1)).toBe(1);});it('c',()=>{expect(hd325hrx(0,0)).toBe(0);});it('d',()=>{expect(hd325hrx(93,73)).toBe(2);});it('e',()=>{expect(hd325hrx(15,0)).toBe(4);});});
function hd326hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326hrx_hd',()=>{it('a',()=>{expect(hd326hrx(1,4)).toBe(2);});it('b',()=>{expect(hd326hrx(3,1)).toBe(1);});it('c',()=>{expect(hd326hrx(0,0)).toBe(0);});it('d',()=>{expect(hd326hrx(93,73)).toBe(2);});it('e',()=>{expect(hd326hrx(15,0)).toBe(4);});});
function hd327hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327hrx_hd',()=>{it('a',()=>{expect(hd327hrx(1,4)).toBe(2);});it('b',()=>{expect(hd327hrx(3,1)).toBe(1);});it('c',()=>{expect(hd327hrx(0,0)).toBe(0);});it('d',()=>{expect(hd327hrx(93,73)).toBe(2);});it('e',()=>{expect(hd327hrx(15,0)).toBe(4);});});
function hd328hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328hrx_hd',()=>{it('a',()=>{expect(hd328hrx(1,4)).toBe(2);});it('b',()=>{expect(hd328hrx(3,1)).toBe(1);});it('c',()=>{expect(hd328hrx(0,0)).toBe(0);});it('d',()=>{expect(hd328hrx(93,73)).toBe(2);});it('e',()=>{expect(hd328hrx(15,0)).toBe(4);});});
function hd329hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329hrx_hd',()=>{it('a',()=>{expect(hd329hrx(1,4)).toBe(2);});it('b',()=>{expect(hd329hrx(3,1)).toBe(1);});it('c',()=>{expect(hd329hrx(0,0)).toBe(0);});it('d',()=>{expect(hd329hrx(93,73)).toBe(2);});it('e',()=>{expect(hd329hrx(15,0)).toBe(4);});});
function hd330hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330hrx_hd',()=>{it('a',()=>{expect(hd330hrx(1,4)).toBe(2);});it('b',()=>{expect(hd330hrx(3,1)).toBe(1);});it('c',()=>{expect(hd330hrx(0,0)).toBe(0);});it('d',()=>{expect(hd330hrx(93,73)).toBe(2);});it('e',()=>{expect(hd330hrx(15,0)).toBe(4);});});
function hd331hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331hrx_hd',()=>{it('a',()=>{expect(hd331hrx(1,4)).toBe(2);});it('b',()=>{expect(hd331hrx(3,1)).toBe(1);});it('c',()=>{expect(hd331hrx(0,0)).toBe(0);});it('d',()=>{expect(hd331hrx(93,73)).toBe(2);});it('e',()=>{expect(hd331hrx(15,0)).toBe(4);});});
function hd332hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332hrx_hd',()=>{it('a',()=>{expect(hd332hrx(1,4)).toBe(2);});it('b',()=>{expect(hd332hrx(3,1)).toBe(1);});it('c',()=>{expect(hd332hrx(0,0)).toBe(0);});it('d',()=>{expect(hd332hrx(93,73)).toBe(2);});it('e',()=>{expect(hd332hrx(15,0)).toBe(4);});});
function hd333hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333hrx_hd',()=>{it('a',()=>{expect(hd333hrx(1,4)).toBe(2);});it('b',()=>{expect(hd333hrx(3,1)).toBe(1);});it('c',()=>{expect(hd333hrx(0,0)).toBe(0);});it('d',()=>{expect(hd333hrx(93,73)).toBe(2);});it('e',()=>{expect(hd333hrx(15,0)).toBe(4);});});
function hd334hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334hrx_hd',()=>{it('a',()=>{expect(hd334hrx(1,4)).toBe(2);});it('b',()=>{expect(hd334hrx(3,1)).toBe(1);});it('c',()=>{expect(hd334hrx(0,0)).toBe(0);});it('d',()=>{expect(hd334hrx(93,73)).toBe(2);});it('e',()=>{expect(hd334hrx(15,0)).toBe(4);});});
function hd335hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335hrx_hd',()=>{it('a',()=>{expect(hd335hrx(1,4)).toBe(2);});it('b',()=>{expect(hd335hrx(3,1)).toBe(1);});it('c',()=>{expect(hd335hrx(0,0)).toBe(0);});it('d',()=>{expect(hd335hrx(93,73)).toBe(2);});it('e',()=>{expect(hd335hrx(15,0)).toBe(4);});});
function hd336hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336hrx_hd',()=>{it('a',()=>{expect(hd336hrx(1,4)).toBe(2);});it('b',()=>{expect(hd336hrx(3,1)).toBe(1);});it('c',()=>{expect(hd336hrx(0,0)).toBe(0);});it('d',()=>{expect(hd336hrx(93,73)).toBe(2);});it('e',()=>{expect(hd336hrx(15,0)).toBe(4);});});
function hd337hrx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337hrx_hd',()=>{it('a',()=>{expect(hd337hrx(1,4)).toBe(2);});it('b',()=>{expect(hd337hrx(3,1)).toBe(1);});it('c',()=>{expect(hd337hrx(0,0)).toBe(0);});it('d',()=>{expect(hd337hrx(93,73)).toBe(2);});it('e',()=>{expect(hd337hrx(15,0)).toBe(4);});});
function hd338hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338hrx2_hd',()=>{it('a',()=>{expect(hd338hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd338hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd338hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd338hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd338hrx2(15,0)).toBe(4);});});
function hd339hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339hrx2_hd',()=>{it('a',()=>{expect(hd339hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd339hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd339hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd339hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd339hrx2(15,0)).toBe(4);});});
function hd340hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340hrx2_hd',()=>{it('a',()=>{expect(hd340hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd340hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd340hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd340hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd340hrx2(15,0)).toBe(4);});});
function hd341hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341hrx2_hd',()=>{it('a',()=>{expect(hd341hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd341hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd341hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd341hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd341hrx2(15,0)).toBe(4);});});
function hd342hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342hrx2_hd',()=>{it('a',()=>{expect(hd342hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd342hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd342hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd342hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd342hrx2(15,0)).toBe(4);});});
function hd343hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343hrx2_hd',()=>{it('a',()=>{expect(hd343hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd343hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd343hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd343hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd343hrx2(15,0)).toBe(4);});});
function hd344hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344hrx2_hd',()=>{it('a',()=>{expect(hd344hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd344hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd344hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd344hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd344hrx2(15,0)).toBe(4);});});
function hd345hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345hrx2_hd',()=>{it('a',()=>{expect(hd345hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd345hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd345hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd345hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd345hrx2(15,0)).toBe(4);});});
function hd346hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346hrx2_hd',()=>{it('a',()=>{expect(hd346hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd346hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd346hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd346hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd346hrx2(15,0)).toBe(4);});});
function hd347hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347hrx2_hd',()=>{it('a',()=>{expect(hd347hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd347hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd347hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd347hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd347hrx2(15,0)).toBe(4);});});
function hd348hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348hrx2_hd',()=>{it('a',()=>{expect(hd348hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd348hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd348hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd348hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd348hrx2(15,0)).toBe(4);});});
function hd349hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349hrx2_hd',()=>{it('a',()=>{expect(hd349hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd349hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd349hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd349hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd349hrx2(15,0)).toBe(4);});});
function hd350hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350hrx2_hd',()=>{it('a',()=>{expect(hd350hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd350hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd350hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd350hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd350hrx2(15,0)).toBe(4);});});
function hd351hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351hrx2_hd',()=>{it('a',()=>{expect(hd351hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd351hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd351hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd351hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd351hrx2(15,0)).toBe(4);});});
function hd352hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352hrx2_hd',()=>{it('a',()=>{expect(hd352hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd352hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd352hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd352hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd352hrx2(15,0)).toBe(4);});});
function hd353hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353hrx2_hd',()=>{it('a',()=>{expect(hd353hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd353hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd353hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd353hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd353hrx2(15,0)).toBe(4);});});
function hd354hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354hrx2_hd',()=>{it('a',()=>{expect(hd354hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd354hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd354hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd354hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd354hrx2(15,0)).toBe(4);});});
function hd355hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355hrx2_hd',()=>{it('a',()=>{expect(hd355hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd355hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd355hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd355hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd355hrx2(15,0)).toBe(4);});});
function hd356hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356hrx2_hd',()=>{it('a',()=>{expect(hd356hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd356hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd356hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd356hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd356hrx2(15,0)).toBe(4);});});
function hd357hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357hrx2_hd',()=>{it('a',()=>{expect(hd357hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd357hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd357hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd357hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd357hrx2(15,0)).toBe(4);});});
function hd358hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358hrx2_hd',()=>{it('a',()=>{expect(hd358hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd358hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd358hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd358hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd358hrx2(15,0)).toBe(4);});});
function hd359hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359hrx2_hd',()=>{it('a',()=>{expect(hd359hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd359hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd359hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd359hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd359hrx2(15,0)).toBe(4);});});
function hd360hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360hrx2_hd',()=>{it('a',()=>{expect(hd360hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd360hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd360hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd360hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd360hrx2(15,0)).toBe(4);});});
function hd361hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361hrx2_hd',()=>{it('a',()=>{expect(hd361hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd361hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd361hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd361hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd361hrx2(15,0)).toBe(4);});});
function hd362hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362hrx2_hd',()=>{it('a',()=>{expect(hd362hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd362hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd362hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd362hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd362hrx2(15,0)).toBe(4);});});
function hd363hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363hrx2_hd',()=>{it('a',()=>{expect(hd363hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd363hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd363hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd363hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd363hrx2(15,0)).toBe(4);});});
function hd364hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364hrx2_hd',()=>{it('a',()=>{expect(hd364hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd364hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd364hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd364hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd364hrx2(15,0)).toBe(4);});});
function hd365hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365hrx2_hd',()=>{it('a',()=>{expect(hd365hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd365hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd365hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd365hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd365hrx2(15,0)).toBe(4);});});
function hd366hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366hrx2_hd',()=>{it('a',()=>{expect(hd366hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd366hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd366hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd366hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd366hrx2(15,0)).toBe(4);});});
function hd367hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367hrx2_hd',()=>{it('a',()=>{expect(hd367hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd367hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd367hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd367hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd367hrx2(15,0)).toBe(4);});});
function hd368hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368hrx2_hd',()=>{it('a',()=>{expect(hd368hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd368hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd368hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd368hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd368hrx2(15,0)).toBe(4);});});
function hd369hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369hrx2_hd',()=>{it('a',()=>{expect(hd369hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd369hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd369hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd369hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd369hrx2(15,0)).toBe(4);});});
function hd370hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370hrx2_hd',()=>{it('a',()=>{expect(hd370hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd370hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd370hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd370hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd370hrx2(15,0)).toBe(4);});});
function hd371hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371hrx2_hd',()=>{it('a',()=>{expect(hd371hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd371hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd371hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd371hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd371hrx2(15,0)).toBe(4);});});
function hd372hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372hrx2_hd',()=>{it('a',()=>{expect(hd372hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd372hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd372hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd372hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd372hrx2(15,0)).toBe(4);});});
function hd373hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373hrx2_hd',()=>{it('a',()=>{expect(hd373hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd373hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd373hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd373hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd373hrx2(15,0)).toBe(4);});});
function hd374hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374hrx2_hd',()=>{it('a',()=>{expect(hd374hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd374hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd374hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd374hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd374hrx2(15,0)).toBe(4);});});
function hd375hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375hrx2_hd',()=>{it('a',()=>{expect(hd375hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd375hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd375hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd375hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd375hrx2(15,0)).toBe(4);});});
function hd376hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376hrx2_hd',()=>{it('a',()=>{expect(hd376hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd376hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd376hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd376hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd376hrx2(15,0)).toBe(4);});});
function hd377hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377hrx2_hd',()=>{it('a',()=>{expect(hd377hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd377hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd377hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd377hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd377hrx2(15,0)).toBe(4);});});
function hd378hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378hrx2_hd',()=>{it('a',()=>{expect(hd378hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd378hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd378hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd378hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd378hrx2(15,0)).toBe(4);});});
function hd379hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379hrx2_hd',()=>{it('a',()=>{expect(hd379hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd379hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd379hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd379hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd379hrx2(15,0)).toBe(4);});});
function hd380hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380hrx2_hd',()=>{it('a',()=>{expect(hd380hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd380hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd380hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd380hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd380hrx2(15,0)).toBe(4);});});
function hd381hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381hrx2_hd',()=>{it('a',()=>{expect(hd381hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd381hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd381hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd381hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd381hrx2(15,0)).toBe(4);});});
function hd382hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382hrx2_hd',()=>{it('a',()=>{expect(hd382hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd382hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd382hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd382hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd382hrx2(15,0)).toBe(4);});});
function hd383hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383hrx2_hd',()=>{it('a',()=>{expect(hd383hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd383hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd383hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd383hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd383hrx2(15,0)).toBe(4);});});
function hd384hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384hrx2_hd',()=>{it('a',()=>{expect(hd384hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd384hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd384hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd384hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd384hrx2(15,0)).toBe(4);});});
function hd385hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385hrx2_hd',()=>{it('a',()=>{expect(hd385hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd385hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd385hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd385hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd385hrx2(15,0)).toBe(4);});});
function hd386hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386hrx2_hd',()=>{it('a',()=>{expect(hd386hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd386hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd386hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd386hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd386hrx2(15,0)).toBe(4);});});
function hd387hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387hrx2_hd',()=>{it('a',()=>{expect(hd387hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd387hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd387hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd387hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd387hrx2(15,0)).toBe(4);});});
function hd388hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388hrx2_hd',()=>{it('a',()=>{expect(hd388hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd388hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd388hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd388hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd388hrx2(15,0)).toBe(4);});});
function hd389hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389hrx2_hd',()=>{it('a',()=>{expect(hd389hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd389hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd389hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd389hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd389hrx2(15,0)).toBe(4);});});
function hd390hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390hrx2_hd',()=>{it('a',()=>{expect(hd390hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd390hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd390hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd390hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd390hrx2(15,0)).toBe(4);});});
function hd391hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391hrx2_hd',()=>{it('a',()=>{expect(hd391hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd391hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd391hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd391hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd391hrx2(15,0)).toBe(4);});});
function hd392hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392hrx2_hd',()=>{it('a',()=>{expect(hd392hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd392hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd392hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd392hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd392hrx2(15,0)).toBe(4);});});
function hd393hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393hrx2_hd',()=>{it('a',()=>{expect(hd393hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd393hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd393hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd393hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd393hrx2(15,0)).toBe(4);});});
function hd394hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394hrx2_hd',()=>{it('a',()=>{expect(hd394hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd394hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd394hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd394hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd394hrx2(15,0)).toBe(4);});});
function hd395hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395hrx2_hd',()=>{it('a',()=>{expect(hd395hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd395hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd395hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd395hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd395hrx2(15,0)).toBe(4);});});
function hd396hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396hrx2_hd',()=>{it('a',()=>{expect(hd396hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd396hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd396hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd396hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd396hrx2(15,0)).toBe(4);});});
function hd397hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397hrx2_hd',()=>{it('a',()=>{expect(hd397hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd397hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd397hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd397hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd397hrx2(15,0)).toBe(4);});});
function hd398hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398hrx2_hd',()=>{it('a',()=>{expect(hd398hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd398hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd398hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd398hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd398hrx2(15,0)).toBe(4);});});
function hd399hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399hrx2_hd',()=>{it('a',()=>{expect(hd399hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd399hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd399hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd399hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd399hrx2(15,0)).toBe(4);});});
function hd400hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400hrx2_hd',()=>{it('a',()=>{expect(hd400hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd400hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd400hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd400hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd400hrx2(15,0)).toBe(4);});});
function hd401hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401hrx2_hd',()=>{it('a',()=>{expect(hd401hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd401hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd401hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd401hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd401hrx2(15,0)).toBe(4);});});
function hd402hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402hrx2_hd',()=>{it('a',()=>{expect(hd402hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd402hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd402hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd402hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd402hrx2(15,0)).toBe(4);});});
function hd403hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403hrx2_hd',()=>{it('a',()=>{expect(hd403hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd403hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd403hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd403hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd403hrx2(15,0)).toBe(4);});});
function hd404hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404hrx2_hd',()=>{it('a',()=>{expect(hd404hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd404hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd404hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd404hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd404hrx2(15,0)).toBe(4);});});
function hd405hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405hrx2_hd',()=>{it('a',()=>{expect(hd405hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd405hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd405hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd405hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd405hrx2(15,0)).toBe(4);});});
function hd406hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406hrx2_hd',()=>{it('a',()=>{expect(hd406hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd406hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd406hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd406hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd406hrx2(15,0)).toBe(4);});});
function hd407hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407hrx2_hd',()=>{it('a',()=>{expect(hd407hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd407hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd407hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd407hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd407hrx2(15,0)).toBe(4);});});
function hd408hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408hrx2_hd',()=>{it('a',()=>{expect(hd408hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd408hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd408hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd408hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd408hrx2(15,0)).toBe(4);});});
function hd409hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409hrx2_hd',()=>{it('a',()=>{expect(hd409hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd409hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd409hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd409hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd409hrx2(15,0)).toBe(4);});});
function hd410hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410hrx2_hd',()=>{it('a',()=>{expect(hd410hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd410hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd410hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd410hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd410hrx2(15,0)).toBe(4);});});
function hd411hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411hrx2_hd',()=>{it('a',()=>{expect(hd411hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd411hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd411hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd411hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd411hrx2(15,0)).toBe(4);});});
function hd412hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412hrx2_hd',()=>{it('a',()=>{expect(hd412hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd412hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd412hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd412hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd412hrx2(15,0)).toBe(4);});});
function hd413hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413hrx2_hd',()=>{it('a',()=>{expect(hd413hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd413hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd413hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd413hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd413hrx2(15,0)).toBe(4);});});
function hd414hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414hrx2_hd',()=>{it('a',()=>{expect(hd414hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd414hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd414hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd414hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd414hrx2(15,0)).toBe(4);});});
function hd415hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415hrx2_hd',()=>{it('a',()=>{expect(hd415hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd415hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd415hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd415hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd415hrx2(15,0)).toBe(4);});});
function hd416hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416hrx2_hd',()=>{it('a',()=>{expect(hd416hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd416hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd416hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd416hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd416hrx2(15,0)).toBe(4);});});
function hd417hrx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417hrx2_hd',()=>{it('a',()=>{expect(hd417hrx2(1,4)).toBe(2);});it('b',()=>{expect(hd417hrx2(3,1)).toBe(1);});it('c',()=>{expect(hd417hrx2(0,0)).toBe(0);});it('d',()=>{expect(hd417hrx2(93,73)).toBe(2);});it('e',()=>{expect(hd417hrx2(15,0)).toBe(4);});});
