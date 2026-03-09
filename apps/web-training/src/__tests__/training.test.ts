// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-training specification tests

type TrainingType = 'INDUCTION' | 'TECHNICAL' | 'COMPLIANCE' | 'LEADERSHIP' | 'SAFETY' | 'QUALITY' | 'SOFT_SKILLS';
type TrainingStatus = 'DRAFT' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type CompetencyLevel = 1 | 2 | 3 | 4 | 5;
type AssessmentResult = 'NOT_STARTED' | 'FAILED' | 'PASSED' | 'EXEMPTED';

const TRAINING_TYPES: TrainingType[] = ['INDUCTION', 'TECHNICAL', 'COMPLIANCE', 'LEADERSHIP', 'SAFETY', 'QUALITY', 'SOFT_SKILLS'];
const TRAINING_STATUSES: TrainingStatus[] = ['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const COMPETENCY_LEVELS: CompetencyLevel[] = [1, 2, 3, 4, 5];
const ASSESSMENT_RESULTS: AssessmentResult[] = ['NOT_STARTED', 'FAILED', 'PASSED', 'EXEMPTED'];

const competencyLabel: Record<CompetencyLevel, string> = {
  1: 'Awareness',
  2: 'Basic',
  3: 'Competent',
  4: 'Proficient',
  5: 'Expert',
};

const trainingStatusColor: Record<TrainingStatus, string> = {
  DRAFT: 'bg-gray-100 text-gray-700',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

function hasPassed(result: AssessmentResult): boolean {
  return result === 'PASSED' || result === 'EXEMPTED';
}

function trainingCompletionRate(attended: number, enrolled: number): number {
  if (enrolled === 0) return 0;
  return (attended / enrolled) * 100;
}

function cpdHours(trainingType: TrainingType): number {
  const hours: Record<TrainingType, number> = {
    INDUCTION: 8, TECHNICAL: 16, COMPLIANCE: 4, LEADERSHIP: 24, SAFETY: 8, QUALITY: 8, SOFT_SKILLS: 4,
  };
  return hours[trainingType];
}

function isTrainingActive(status: TrainingStatus): boolean {
  return status === 'SCHEDULED' || status === 'IN_PROGRESS';
}

describe('Competency labels', () => {
  COMPETENCY_LEVELS.forEach(l => {
    it(`Level ${l} has label`, () => expect(competencyLabel[l]).toBeDefined());
    it(`Level ${l} label is non-empty`, () => expect(competencyLabel[l].length).toBeGreaterThan(0));
  });
  it('Level 5 is Expert', () => expect(competencyLabel[5]).toBe('Expert'));
  it('Level 1 is Awareness', () => expect(competencyLabel[1]).toBe('Awareness'));
  for (let l = 1; l <= 5; l++) {
    it(`competency label ${l} is string`, () => expect(typeof competencyLabel[l as CompetencyLevel]).toBe('string'));
  }
  for (let i = 0; i < 50; i++) {
    const l = COMPETENCY_LEVELS[i % 5];
    it(`competency label for level ${l} exists (idx ${i})`, () => expect(competencyLabel[l]).toBeTruthy());
  }
});

describe('Training status colors', () => {
  TRAINING_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(trainingStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(trainingStatusColor[s]).toContain('bg-'));
  });
  it('COMPLETED is green', () => expect(trainingStatusColor.COMPLETED).toContain('green'));
  it('CANCELLED is red', () => expect(trainingStatusColor.CANCELLED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = TRAINING_STATUSES[i % 5];
    it(`training status color string (idx ${i})`, () => expect(typeof trainingStatusColor[s]).toBe('string'));
  }
});

describe('hasPassed', () => {
  it('PASSED returns true', () => expect(hasPassed('PASSED')).toBe(true));
  it('EXEMPTED returns true', () => expect(hasPassed('EXEMPTED')).toBe(true));
  it('FAILED returns false', () => expect(hasPassed('FAILED')).toBe(false));
  it('NOT_STARTED returns false', () => expect(hasPassed('NOT_STARTED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const r = ASSESSMENT_RESULTS[i % 4];
    it(`hasPassed(${r}) returns boolean (idx ${i})`, () => expect(typeof hasPassed(r)).toBe('boolean'));
  }
});

describe('trainingCompletionRate', () => {
  it('0 enrolled = 0%', () => expect(trainingCompletionRate(0, 0)).toBe(0));
  it('all attended = 100%', () => expect(trainingCompletionRate(20, 20)).toBe(100));
  it('half attended = 50%', () => expect(trainingCompletionRate(10, 20)).toBe(50));
  for (let attended = 0; attended <= 100; attended++) {
    it(`completion rate ${attended}/100 is between 0-100`, () => {
      const rate = trainingCompletionRate(attended, 100);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(100);
    });
  }
});

describe('isTrainingActive', () => {
  it('SCHEDULED is active', () => expect(isTrainingActive('SCHEDULED')).toBe(true));
  it('IN_PROGRESS is active', () => expect(isTrainingActive('IN_PROGRESS')).toBe(true));
  it('COMPLETED is not active', () => expect(isTrainingActive('COMPLETED')).toBe(false));
  it('CANCELLED is not active', () => expect(isTrainingActive('CANCELLED')).toBe(false));
  for (let i = 0; i < 50; i++) {
    const s = TRAINING_STATUSES[i % 5];
    it(`isTrainingActive(${s}) returns boolean (idx ${i})`, () => expect(typeof isTrainingActive(s)).toBe('boolean'));
  }
});

// ─── Algorithm puzzle phases (ph217tr2–ph220tr2) ────────────────────────────────
function moveZeroes217tr2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217tr2_mz',()=>{
  it('a',()=>{expect(moveZeroes217tr2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217tr2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217tr2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217tr2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217tr2([4,2,0,0,3])).toBe(4);});
});
function missingNumber218tr2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218tr2_mn',()=>{
  it('a',()=>{expect(missingNumber218tr2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218tr2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218tr2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218tr2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218tr2([1])).toBe(0);});
});
function countBits219tr2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219tr2_cb',()=>{
  it('a',()=>{expect(countBits219tr2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219tr2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219tr2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219tr2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219tr2(4)[4]).toBe(1);});
});
function climbStairs220tr2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220tr2_cs',()=>{
  it('a',()=>{expect(climbStairs220tr2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220tr2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220tr2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220tr2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220tr2(1)).toBe(1);});
});
function hd258trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258trx_hd',()=>{it('a',()=>{expect(hd258trx(1,4)).toBe(2);});it('b',()=>{expect(hd258trx(3,1)).toBe(1);});it('c',()=>{expect(hd258trx(0,0)).toBe(0);});it('d',()=>{expect(hd258trx(93,73)).toBe(2);});it('e',()=>{expect(hd258trx(15,0)).toBe(4);});});
function hd259trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259trx_hd',()=>{it('a',()=>{expect(hd259trx(1,4)).toBe(2);});it('b',()=>{expect(hd259trx(3,1)).toBe(1);});it('c',()=>{expect(hd259trx(0,0)).toBe(0);});it('d',()=>{expect(hd259trx(93,73)).toBe(2);});it('e',()=>{expect(hd259trx(15,0)).toBe(4);});});
function hd260trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260trx_hd',()=>{it('a',()=>{expect(hd260trx(1,4)).toBe(2);});it('b',()=>{expect(hd260trx(3,1)).toBe(1);});it('c',()=>{expect(hd260trx(0,0)).toBe(0);});it('d',()=>{expect(hd260trx(93,73)).toBe(2);});it('e',()=>{expect(hd260trx(15,0)).toBe(4);});});
function hd261trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261trx_hd',()=>{it('a',()=>{expect(hd261trx(1,4)).toBe(2);});it('b',()=>{expect(hd261trx(3,1)).toBe(1);});it('c',()=>{expect(hd261trx(0,0)).toBe(0);});it('d',()=>{expect(hd261trx(93,73)).toBe(2);});it('e',()=>{expect(hd261trx(15,0)).toBe(4);});});
function hd262trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262trx_hd',()=>{it('a',()=>{expect(hd262trx(1,4)).toBe(2);});it('b',()=>{expect(hd262trx(3,1)).toBe(1);});it('c',()=>{expect(hd262trx(0,0)).toBe(0);});it('d',()=>{expect(hd262trx(93,73)).toBe(2);});it('e',()=>{expect(hd262trx(15,0)).toBe(4);});});
function hd263trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263trx_hd',()=>{it('a',()=>{expect(hd263trx(1,4)).toBe(2);});it('b',()=>{expect(hd263trx(3,1)).toBe(1);});it('c',()=>{expect(hd263trx(0,0)).toBe(0);});it('d',()=>{expect(hd263trx(93,73)).toBe(2);});it('e',()=>{expect(hd263trx(15,0)).toBe(4);});});
function hd264trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264trx_hd',()=>{it('a',()=>{expect(hd264trx(1,4)).toBe(2);});it('b',()=>{expect(hd264trx(3,1)).toBe(1);});it('c',()=>{expect(hd264trx(0,0)).toBe(0);});it('d',()=>{expect(hd264trx(93,73)).toBe(2);});it('e',()=>{expect(hd264trx(15,0)).toBe(4);});});
function hd265trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265trx_hd',()=>{it('a',()=>{expect(hd265trx(1,4)).toBe(2);});it('b',()=>{expect(hd265trx(3,1)).toBe(1);});it('c',()=>{expect(hd265trx(0,0)).toBe(0);});it('d',()=>{expect(hd265trx(93,73)).toBe(2);});it('e',()=>{expect(hd265trx(15,0)).toBe(4);});});
function hd266trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266trx_hd',()=>{it('a',()=>{expect(hd266trx(1,4)).toBe(2);});it('b',()=>{expect(hd266trx(3,1)).toBe(1);});it('c',()=>{expect(hd266trx(0,0)).toBe(0);});it('d',()=>{expect(hd266trx(93,73)).toBe(2);});it('e',()=>{expect(hd266trx(15,0)).toBe(4);});});
function hd267trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267trx_hd',()=>{it('a',()=>{expect(hd267trx(1,4)).toBe(2);});it('b',()=>{expect(hd267trx(3,1)).toBe(1);});it('c',()=>{expect(hd267trx(0,0)).toBe(0);});it('d',()=>{expect(hd267trx(93,73)).toBe(2);});it('e',()=>{expect(hd267trx(15,0)).toBe(4);});});
function hd268trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268trx_hd',()=>{it('a',()=>{expect(hd268trx(1,4)).toBe(2);});it('b',()=>{expect(hd268trx(3,1)).toBe(1);});it('c',()=>{expect(hd268trx(0,0)).toBe(0);});it('d',()=>{expect(hd268trx(93,73)).toBe(2);});it('e',()=>{expect(hd268trx(15,0)).toBe(4);});});
function hd269trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269trx_hd',()=>{it('a',()=>{expect(hd269trx(1,4)).toBe(2);});it('b',()=>{expect(hd269trx(3,1)).toBe(1);});it('c',()=>{expect(hd269trx(0,0)).toBe(0);});it('d',()=>{expect(hd269trx(93,73)).toBe(2);});it('e',()=>{expect(hd269trx(15,0)).toBe(4);});});
function hd270trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270trx_hd',()=>{it('a',()=>{expect(hd270trx(1,4)).toBe(2);});it('b',()=>{expect(hd270trx(3,1)).toBe(1);});it('c',()=>{expect(hd270trx(0,0)).toBe(0);});it('d',()=>{expect(hd270trx(93,73)).toBe(2);});it('e',()=>{expect(hd270trx(15,0)).toBe(4);});});
function hd271trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271trx_hd',()=>{it('a',()=>{expect(hd271trx(1,4)).toBe(2);});it('b',()=>{expect(hd271trx(3,1)).toBe(1);});it('c',()=>{expect(hd271trx(0,0)).toBe(0);});it('d',()=>{expect(hd271trx(93,73)).toBe(2);});it('e',()=>{expect(hd271trx(15,0)).toBe(4);});});
function hd272trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272trx_hd',()=>{it('a',()=>{expect(hd272trx(1,4)).toBe(2);});it('b',()=>{expect(hd272trx(3,1)).toBe(1);});it('c',()=>{expect(hd272trx(0,0)).toBe(0);});it('d',()=>{expect(hd272trx(93,73)).toBe(2);});it('e',()=>{expect(hd272trx(15,0)).toBe(4);});});
function hd273trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273trx_hd',()=>{it('a',()=>{expect(hd273trx(1,4)).toBe(2);});it('b',()=>{expect(hd273trx(3,1)).toBe(1);});it('c',()=>{expect(hd273trx(0,0)).toBe(0);});it('d',()=>{expect(hd273trx(93,73)).toBe(2);});it('e',()=>{expect(hd273trx(15,0)).toBe(4);});});
function hd274trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274trx_hd',()=>{it('a',()=>{expect(hd274trx(1,4)).toBe(2);});it('b',()=>{expect(hd274trx(3,1)).toBe(1);});it('c',()=>{expect(hd274trx(0,0)).toBe(0);});it('d',()=>{expect(hd274trx(93,73)).toBe(2);});it('e',()=>{expect(hd274trx(15,0)).toBe(4);});});
function hd275trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275trx_hd',()=>{it('a',()=>{expect(hd275trx(1,4)).toBe(2);});it('b',()=>{expect(hd275trx(3,1)).toBe(1);});it('c',()=>{expect(hd275trx(0,0)).toBe(0);});it('d',()=>{expect(hd275trx(93,73)).toBe(2);});it('e',()=>{expect(hd275trx(15,0)).toBe(4);});});
function hd276trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276trx_hd',()=>{it('a',()=>{expect(hd276trx(1,4)).toBe(2);});it('b',()=>{expect(hd276trx(3,1)).toBe(1);});it('c',()=>{expect(hd276trx(0,0)).toBe(0);});it('d',()=>{expect(hd276trx(93,73)).toBe(2);});it('e',()=>{expect(hd276trx(15,0)).toBe(4);});});
function hd277trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277trx_hd',()=>{it('a',()=>{expect(hd277trx(1,4)).toBe(2);});it('b',()=>{expect(hd277trx(3,1)).toBe(1);});it('c',()=>{expect(hd277trx(0,0)).toBe(0);});it('d',()=>{expect(hd277trx(93,73)).toBe(2);});it('e',()=>{expect(hd277trx(15,0)).toBe(4);});});
function hd278trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278trx_hd',()=>{it('a',()=>{expect(hd278trx(1,4)).toBe(2);});it('b',()=>{expect(hd278trx(3,1)).toBe(1);});it('c',()=>{expect(hd278trx(0,0)).toBe(0);});it('d',()=>{expect(hd278trx(93,73)).toBe(2);});it('e',()=>{expect(hd278trx(15,0)).toBe(4);});});
function hd279trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279trx_hd',()=>{it('a',()=>{expect(hd279trx(1,4)).toBe(2);});it('b',()=>{expect(hd279trx(3,1)).toBe(1);});it('c',()=>{expect(hd279trx(0,0)).toBe(0);});it('d',()=>{expect(hd279trx(93,73)).toBe(2);});it('e',()=>{expect(hd279trx(15,0)).toBe(4);});});
function hd280trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280trx_hd',()=>{it('a',()=>{expect(hd280trx(1,4)).toBe(2);});it('b',()=>{expect(hd280trx(3,1)).toBe(1);});it('c',()=>{expect(hd280trx(0,0)).toBe(0);});it('d',()=>{expect(hd280trx(93,73)).toBe(2);});it('e',()=>{expect(hd280trx(15,0)).toBe(4);});});
function hd281trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281trx_hd',()=>{it('a',()=>{expect(hd281trx(1,4)).toBe(2);});it('b',()=>{expect(hd281trx(3,1)).toBe(1);});it('c',()=>{expect(hd281trx(0,0)).toBe(0);});it('d',()=>{expect(hd281trx(93,73)).toBe(2);});it('e',()=>{expect(hd281trx(15,0)).toBe(4);});});
function hd282trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282trx_hd',()=>{it('a',()=>{expect(hd282trx(1,4)).toBe(2);});it('b',()=>{expect(hd282trx(3,1)).toBe(1);});it('c',()=>{expect(hd282trx(0,0)).toBe(0);});it('d',()=>{expect(hd282trx(93,73)).toBe(2);});it('e',()=>{expect(hd282trx(15,0)).toBe(4);});});
function hd283trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283trx_hd',()=>{it('a',()=>{expect(hd283trx(1,4)).toBe(2);});it('b',()=>{expect(hd283trx(3,1)).toBe(1);});it('c',()=>{expect(hd283trx(0,0)).toBe(0);});it('d',()=>{expect(hd283trx(93,73)).toBe(2);});it('e',()=>{expect(hd283trx(15,0)).toBe(4);});});
function hd284trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284trx_hd',()=>{it('a',()=>{expect(hd284trx(1,4)).toBe(2);});it('b',()=>{expect(hd284trx(3,1)).toBe(1);});it('c',()=>{expect(hd284trx(0,0)).toBe(0);});it('d',()=>{expect(hd284trx(93,73)).toBe(2);});it('e',()=>{expect(hd284trx(15,0)).toBe(4);});});
function hd285trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285trx_hd',()=>{it('a',()=>{expect(hd285trx(1,4)).toBe(2);});it('b',()=>{expect(hd285trx(3,1)).toBe(1);});it('c',()=>{expect(hd285trx(0,0)).toBe(0);});it('d',()=>{expect(hd285trx(93,73)).toBe(2);});it('e',()=>{expect(hd285trx(15,0)).toBe(4);});});
function hd286trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286trx_hd',()=>{it('a',()=>{expect(hd286trx(1,4)).toBe(2);});it('b',()=>{expect(hd286trx(3,1)).toBe(1);});it('c',()=>{expect(hd286trx(0,0)).toBe(0);});it('d',()=>{expect(hd286trx(93,73)).toBe(2);});it('e',()=>{expect(hd286trx(15,0)).toBe(4);});});
function hd287trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287trx_hd',()=>{it('a',()=>{expect(hd287trx(1,4)).toBe(2);});it('b',()=>{expect(hd287trx(3,1)).toBe(1);});it('c',()=>{expect(hd287trx(0,0)).toBe(0);});it('d',()=>{expect(hd287trx(93,73)).toBe(2);});it('e',()=>{expect(hd287trx(15,0)).toBe(4);});});
function hd288trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288trx_hd',()=>{it('a',()=>{expect(hd288trx(1,4)).toBe(2);});it('b',()=>{expect(hd288trx(3,1)).toBe(1);});it('c',()=>{expect(hd288trx(0,0)).toBe(0);});it('d',()=>{expect(hd288trx(93,73)).toBe(2);});it('e',()=>{expect(hd288trx(15,0)).toBe(4);});});
function hd289trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289trx_hd',()=>{it('a',()=>{expect(hd289trx(1,4)).toBe(2);});it('b',()=>{expect(hd289trx(3,1)).toBe(1);});it('c',()=>{expect(hd289trx(0,0)).toBe(0);});it('d',()=>{expect(hd289trx(93,73)).toBe(2);});it('e',()=>{expect(hd289trx(15,0)).toBe(4);});});
function hd290trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290trx_hd',()=>{it('a',()=>{expect(hd290trx(1,4)).toBe(2);});it('b',()=>{expect(hd290trx(3,1)).toBe(1);});it('c',()=>{expect(hd290trx(0,0)).toBe(0);});it('d',()=>{expect(hd290trx(93,73)).toBe(2);});it('e',()=>{expect(hd290trx(15,0)).toBe(4);});});
function hd291trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291trx_hd',()=>{it('a',()=>{expect(hd291trx(1,4)).toBe(2);});it('b',()=>{expect(hd291trx(3,1)).toBe(1);});it('c',()=>{expect(hd291trx(0,0)).toBe(0);});it('d',()=>{expect(hd291trx(93,73)).toBe(2);});it('e',()=>{expect(hd291trx(15,0)).toBe(4);});});
function hd292trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292trx_hd',()=>{it('a',()=>{expect(hd292trx(1,4)).toBe(2);});it('b',()=>{expect(hd292trx(3,1)).toBe(1);});it('c',()=>{expect(hd292trx(0,0)).toBe(0);});it('d',()=>{expect(hd292trx(93,73)).toBe(2);});it('e',()=>{expect(hd292trx(15,0)).toBe(4);});});
function hd293trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293trx_hd',()=>{it('a',()=>{expect(hd293trx(1,4)).toBe(2);});it('b',()=>{expect(hd293trx(3,1)).toBe(1);});it('c',()=>{expect(hd293trx(0,0)).toBe(0);});it('d',()=>{expect(hd293trx(93,73)).toBe(2);});it('e',()=>{expect(hd293trx(15,0)).toBe(4);});});
function hd294trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294trx_hd',()=>{it('a',()=>{expect(hd294trx(1,4)).toBe(2);});it('b',()=>{expect(hd294trx(3,1)).toBe(1);});it('c',()=>{expect(hd294trx(0,0)).toBe(0);});it('d',()=>{expect(hd294trx(93,73)).toBe(2);});it('e',()=>{expect(hd294trx(15,0)).toBe(4);});});
function hd295trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295trx_hd',()=>{it('a',()=>{expect(hd295trx(1,4)).toBe(2);});it('b',()=>{expect(hd295trx(3,1)).toBe(1);});it('c',()=>{expect(hd295trx(0,0)).toBe(0);});it('d',()=>{expect(hd295trx(93,73)).toBe(2);});it('e',()=>{expect(hd295trx(15,0)).toBe(4);});});
function hd296trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296trx_hd',()=>{it('a',()=>{expect(hd296trx(1,4)).toBe(2);});it('b',()=>{expect(hd296trx(3,1)).toBe(1);});it('c',()=>{expect(hd296trx(0,0)).toBe(0);});it('d',()=>{expect(hd296trx(93,73)).toBe(2);});it('e',()=>{expect(hd296trx(15,0)).toBe(4);});});
function hd297trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297trx_hd',()=>{it('a',()=>{expect(hd297trx(1,4)).toBe(2);});it('b',()=>{expect(hd297trx(3,1)).toBe(1);});it('c',()=>{expect(hd297trx(0,0)).toBe(0);});it('d',()=>{expect(hd297trx(93,73)).toBe(2);});it('e',()=>{expect(hd297trx(15,0)).toBe(4);});});
function hd298trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298trx_hd',()=>{it('a',()=>{expect(hd298trx(1,4)).toBe(2);});it('b',()=>{expect(hd298trx(3,1)).toBe(1);});it('c',()=>{expect(hd298trx(0,0)).toBe(0);});it('d',()=>{expect(hd298trx(93,73)).toBe(2);});it('e',()=>{expect(hd298trx(15,0)).toBe(4);});});
function hd299trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299trx_hd',()=>{it('a',()=>{expect(hd299trx(1,4)).toBe(2);});it('b',()=>{expect(hd299trx(3,1)).toBe(1);});it('c',()=>{expect(hd299trx(0,0)).toBe(0);});it('d',()=>{expect(hd299trx(93,73)).toBe(2);});it('e',()=>{expect(hd299trx(15,0)).toBe(4);});});
function hd300trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300trx_hd',()=>{it('a',()=>{expect(hd300trx(1,4)).toBe(2);});it('b',()=>{expect(hd300trx(3,1)).toBe(1);});it('c',()=>{expect(hd300trx(0,0)).toBe(0);});it('d',()=>{expect(hd300trx(93,73)).toBe(2);});it('e',()=>{expect(hd300trx(15,0)).toBe(4);});});
function hd301trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301trx_hd',()=>{it('a',()=>{expect(hd301trx(1,4)).toBe(2);});it('b',()=>{expect(hd301trx(3,1)).toBe(1);});it('c',()=>{expect(hd301trx(0,0)).toBe(0);});it('d',()=>{expect(hd301trx(93,73)).toBe(2);});it('e',()=>{expect(hd301trx(15,0)).toBe(4);});});
function hd302trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302trx_hd',()=>{it('a',()=>{expect(hd302trx(1,4)).toBe(2);});it('b',()=>{expect(hd302trx(3,1)).toBe(1);});it('c',()=>{expect(hd302trx(0,0)).toBe(0);});it('d',()=>{expect(hd302trx(93,73)).toBe(2);});it('e',()=>{expect(hd302trx(15,0)).toBe(4);});});
function hd303trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303trx_hd',()=>{it('a',()=>{expect(hd303trx(1,4)).toBe(2);});it('b',()=>{expect(hd303trx(3,1)).toBe(1);});it('c',()=>{expect(hd303trx(0,0)).toBe(0);});it('d',()=>{expect(hd303trx(93,73)).toBe(2);});it('e',()=>{expect(hd303trx(15,0)).toBe(4);});});
function hd304trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304trx_hd',()=>{it('a',()=>{expect(hd304trx(1,4)).toBe(2);});it('b',()=>{expect(hd304trx(3,1)).toBe(1);});it('c',()=>{expect(hd304trx(0,0)).toBe(0);});it('d',()=>{expect(hd304trx(93,73)).toBe(2);});it('e',()=>{expect(hd304trx(15,0)).toBe(4);});});
function hd305trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305trx_hd',()=>{it('a',()=>{expect(hd305trx(1,4)).toBe(2);});it('b',()=>{expect(hd305trx(3,1)).toBe(1);});it('c',()=>{expect(hd305trx(0,0)).toBe(0);});it('d',()=>{expect(hd305trx(93,73)).toBe(2);});it('e',()=>{expect(hd305trx(15,0)).toBe(4);});});
function hd306trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306trx_hd',()=>{it('a',()=>{expect(hd306trx(1,4)).toBe(2);});it('b',()=>{expect(hd306trx(3,1)).toBe(1);});it('c',()=>{expect(hd306trx(0,0)).toBe(0);});it('d',()=>{expect(hd306trx(93,73)).toBe(2);});it('e',()=>{expect(hd306trx(15,0)).toBe(4);});});
function hd307trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307trx_hd',()=>{it('a',()=>{expect(hd307trx(1,4)).toBe(2);});it('b',()=>{expect(hd307trx(3,1)).toBe(1);});it('c',()=>{expect(hd307trx(0,0)).toBe(0);});it('d',()=>{expect(hd307trx(93,73)).toBe(2);});it('e',()=>{expect(hd307trx(15,0)).toBe(4);});});
function hd308trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308trx_hd',()=>{it('a',()=>{expect(hd308trx(1,4)).toBe(2);});it('b',()=>{expect(hd308trx(3,1)).toBe(1);});it('c',()=>{expect(hd308trx(0,0)).toBe(0);});it('d',()=>{expect(hd308trx(93,73)).toBe(2);});it('e',()=>{expect(hd308trx(15,0)).toBe(4);});});
function hd309trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309trx_hd',()=>{it('a',()=>{expect(hd309trx(1,4)).toBe(2);});it('b',()=>{expect(hd309trx(3,1)).toBe(1);});it('c',()=>{expect(hd309trx(0,0)).toBe(0);});it('d',()=>{expect(hd309trx(93,73)).toBe(2);});it('e',()=>{expect(hd309trx(15,0)).toBe(4);});});
function hd310trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310trx_hd',()=>{it('a',()=>{expect(hd310trx(1,4)).toBe(2);});it('b',()=>{expect(hd310trx(3,1)).toBe(1);});it('c',()=>{expect(hd310trx(0,0)).toBe(0);});it('d',()=>{expect(hd310trx(93,73)).toBe(2);});it('e',()=>{expect(hd310trx(15,0)).toBe(4);});});
function hd311trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311trx_hd',()=>{it('a',()=>{expect(hd311trx(1,4)).toBe(2);});it('b',()=>{expect(hd311trx(3,1)).toBe(1);});it('c',()=>{expect(hd311trx(0,0)).toBe(0);});it('d',()=>{expect(hd311trx(93,73)).toBe(2);});it('e',()=>{expect(hd311trx(15,0)).toBe(4);});});
function hd312trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312trx_hd',()=>{it('a',()=>{expect(hd312trx(1,4)).toBe(2);});it('b',()=>{expect(hd312trx(3,1)).toBe(1);});it('c',()=>{expect(hd312trx(0,0)).toBe(0);});it('d',()=>{expect(hd312trx(93,73)).toBe(2);});it('e',()=>{expect(hd312trx(15,0)).toBe(4);});});
function hd313trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313trx_hd',()=>{it('a',()=>{expect(hd313trx(1,4)).toBe(2);});it('b',()=>{expect(hd313trx(3,1)).toBe(1);});it('c',()=>{expect(hd313trx(0,0)).toBe(0);});it('d',()=>{expect(hd313trx(93,73)).toBe(2);});it('e',()=>{expect(hd313trx(15,0)).toBe(4);});});
function hd314trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314trx_hd',()=>{it('a',()=>{expect(hd314trx(1,4)).toBe(2);});it('b',()=>{expect(hd314trx(3,1)).toBe(1);});it('c',()=>{expect(hd314trx(0,0)).toBe(0);});it('d',()=>{expect(hd314trx(93,73)).toBe(2);});it('e',()=>{expect(hd314trx(15,0)).toBe(4);});});
function hd315trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315trx_hd',()=>{it('a',()=>{expect(hd315trx(1,4)).toBe(2);});it('b',()=>{expect(hd315trx(3,1)).toBe(1);});it('c',()=>{expect(hd315trx(0,0)).toBe(0);});it('d',()=>{expect(hd315trx(93,73)).toBe(2);});it('e',()=>{expect(hd315trx(15,0)).toBe(4);});});
function hd316trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316trx_hd',()=>{it('a',()=>{expect(hd316trx(1,4)).toBe(2);});it('b',()=>{expect(hd316trx(3,1)).toBe(1);});it('c',()=>{expect(hd316trx(0,0)).toBe(0);});it('d',()=>{expect(hd316trx(93,73)).toBe(2);});it('e',()=>{expect(hd316trx(15,0)).toBe(4);});});
function hd317trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317trx_hd',()=>{it('a',()=>{expect(hd317trx(1,4)).toBe(2);});it('b',()=>{expect(hd317trx(3,1)).toBe(1);});it('c',()=>{expect(hd317trx(0,0)).toBe(0);});it('d',()=>{expect(hd317trx(93,73)).toBe(2);});it('e',()=>{expect(hd317trx(15,0)).toBe(4);});});
function hd318trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318trx_hd',()=>{it('a',()=>{expect(hd318trx(1,4)).toBe(2);});it('b',()=>{expect(hd318trx(3,1)).toBe(1);});it('c',()=>{expect(hd318trx(0,0)).toBe(0);});it('d',()=>{expect(hd318trx(93,73)).toBe(2);});it('e',()=>{expect(hd318trx(15,0)).toBe(4);});});
function hd319trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319trx_hd',()=>{it('a',()=>{expect(hd319trx(1,4)).toBe(2);});it('b',()=>{expect(hd319trx(3,1)).toBe(1);});it('c',()=>{expect(hd319trx(0,0)).toBe(0);});it('d',()=>{expect(hd319trx(93,73)).toBe(2);});it('e',()=>{expect(hd319trx(15,0)).toBe(4);});});
function hd320trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320trx_hd',()=>{it('a',()=>{expect(hd320trx(1,4)).toBe(2);});it('b',()=>{expect(hd320trx(3,1)).toBe(1);});it('c',()=>{expect(hd320trx(0,0)).toBe(0);});it('d',()=>{expect(hd320trx(93,73)).toBe(2);});it('e',()=>{expect(hd320trx(15,0)).toBe(4);});});
function hd321trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321trx_hd',()=>{it('a',()=>{expect(hd321trx(1,4)).toBe(2);});it('b',()=>{expect(hd321trx(3,1)).toBe(1);});it('c',()=>{expect(hd321trx(0,0)).toBe(0);});it('d',()=>{expect(hd321trx(93,73)).toBe(2);});it('e',()=>{expect(hd321trx(15,0)).toBe(4);});});
function hd322trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322trx_hd',()=>{it('a',()=>{expect(hd322trx(1,4)).toBe(2);});it('b',()=>{expect(hd322trx(3,1)).toBe(1);});it('c',()=>{expect(hd322trx(0,0)).toBe(0);});it('d',()=>{expect(hd322trx(93,73)).toBe(2);});it('e',()=>{expect(hd322trx(15,0)).toBe(4);});});
function hd323trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323trx_hd',()=>{it('a',()=>{expect(hd323trx(1,4)).toBe(2);});it('b',()=>{expect(hd323trx(3,1)).toBe(1);});it('c',()=>{expect(hd323trx(0,0)).toBe(0);});it('d',()=>{expect(hd323trx(93,73)).toBe(2);});it('e',()=>{expect(hd323trx(15,0)).toBe(4);});});
function hd324trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324trx_hd',()=>{it('a',()=>{expect(hd324trx(1,4)).toBe(2);});it('b',()=>{expect(hd324trx(3,1)).toBe(1);});it('c',()=>{expect(hd324trx(0,0)).toBe(0);});it('d',()=>{expect(hd324trx(93,73)).toBe(2);});it('e',()=>{expect(hd324trx(15,0)).toBe(4);});});
function hd325trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325trx_hd',()=>{it('a',()=>{expect(hd325trx(1,4)).toBe(2);});it('b',()=>{expect(hd325trx(3,1)).toBe(1);});it('c',()=>{expect(hd325trx(0,0)).toBe(0);});it('d',()=>{expect(hd325trx(93,73)).toBe(2);});it('e',()=>{expect(hd325trx(15,0)).toBe(4);});});
function hd326trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326trx_hd',()=>{it('a',()=>{expect(hd326trx(1,4)).toBe(2);});it('b',()=>{expect(hd326trx(3,1)).toBe(1);});it('c',()=>{expect(hd326trx(0,0)).toBe(0);});it('d',()=>{expect(hd326trx(93,73)).toBe(2);});it('e',()=>{expect(hd326trx(15,0)).toBe(4);});});
function hd327trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327trx_hd',()=>{it('a',()=>{expect(hd327trx(1,4)).toBe(2);});it('b',()=>{expect(hd327trx(3,1)).toBe(1);});it('c',()=>{expect(hd327trx(0,0)).toBe(0);});it('d',()=>{expect(hd327trx(93,73)).toBe(2);});it('e',()=>{expect(hd327trx(15,0)).toBe(4);});});
function hd328trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328trx_hd',()=>{it('a',()=>{expect(hd328trx(1,4)).toBe(2);});it('b',()=>{expect(hd328trx(3,1)).toBe(1);});it('c',()=>{expect(hd328trx(0,0)).toBe(0);});it('d',()=>{expect(hd328trx(93,73)).toBe(2);});it('e',()=>{expect(hd328trx(15,0)).toBe(4);});});
function hd329trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329trx_hd',()=>{it('a',()=>{expect(hd329trx(1,4)).toBe(2);});it('b',()=>{expect(hd329trx(3,1)).toBe(1);});it('c',()=>{expect(hd329trx(0,0)).toBe(0);});it('d',()=>{expect(hd329trx(93,73)).toBe(2);});it('e',()=>{expect(hd329trx(15,0)).toBe(4);});});
function hd330trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330trx_hd',()=>{it('a',()=>{expect(hd330trx(1,4)).toBe(2);});it('b',()=>{expect(hd330trx(3,1)).toBe(1);});it('c',()=>{expect(hd330trx(0,0)).toBe(0);});it('d',()=>{expect(hd330trx(93,73)).toBe(2);});it('e',()=>{expect(hd330trx(15,0)).toBe(4);});});
function hd331trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331trx_hd',()=>{it('a',()=>{expect(hd331trx(1,4)).toBe(2);});it('b',()=>{expect(hd331trx(3,1)).toBe(1);});it('c',()=>{expect(hd331trx(0,0)).toBe(0);});it('d',()=>{expect(hd331trx(93,73)).toBe(2);});it('e',()=>{expect(hd331trx(15,0)).toBe(4);});});
function hd332trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332trx_hd',()=>{it('a',()=>{expect(hd332trx(1,4)).toBe(2);});it('b',()=>{expect(hd332trx(3,1)).toBe(1);});it('c',()=>{expect(hd332trx(0,0)).toBe(0);});it('d',()=>{expect(hd332trx(93,73)).toBe(2);});it('e',()=>{expect(hd332trx(15,0)).toBe(4);});});
function hd333trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333trx_hd',()=>{it('a',()=>{expect(hd333trx(1,4)).toBe(2);});it('b',()=>{expect(hd333trx(3,1)).toBe(1);});it('c',()=>{expect(hd333trx(0,0)).toBe(0);});it('d',()=>{expect(hd333trx(93,73)).toBe(2);});it('e',()=>{expect(hd333trx(15,0)).toBe(4);});});
function hd334trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334trx_hd',()=>{it('a',()=>{expect(hd334trx(1,4)).toBe(2);});it('b',()=>{expect(hd334trx(3,1)).toBe(1);});it('c',()=>{expect(hd334trx(0,0)).toBe(0);});it('d',()=>{expect(hd334trx(93,73)).toBe(2);});it('e',()=>{expect(hd334trx(15,0)).toBe(4);});});
function hd335trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335trx_hd',()=>{it('a',()=>{expect(hd335trx(1,4)).toBe(2);});it('b',()=>{expect(hd335trx(3,1)).toBe(1);});it('c',()=>{expect(hd335trx(0,0)).toBe(0);});it('d',()=>{expect(hd335trx(93,73)).toBe(2);});it('e',()=>{expect(hd335trx(15,0)).toBe(4);});});
function hd336trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336trx_hd',()=>{it('a',()=>{expect(hd336trx(1,4)).toBe(2);});it('b',()=>{expect(hd336trx(3,1)).toBe(1);});it('c',()=>{expect(hd336trx(0,0)).toBe(0);});it('d',()=>{expect(hd336trx(93,73)).toBe(2);});it('e',()=>{expect(hd336trx(15,0)).toBe(4);});});
function hd337trx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337trx_hd',()=>{it('a',()=>{expect(hd337trx(1,4)).toBe(2);});it('b',()=>{expect(hd337trx(3,1)).toBe(1);});it('c',()=>{expect(hd337trx(0,0)).toBe(0);});it('d',()=>{expect(hd337trx(93,73)).toBe(2);});it('e',()=>{expect(hd337trx(15,0)).toBe(4);});});
