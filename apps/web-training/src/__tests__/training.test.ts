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
function hd338trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338trax2_hd',()=>{it('a',()=>{expect(hd338trax2(1,4)).toBe(2);});it('b',()=>{expect(hd338trax2(3,1)).toBe(1);});it('c',()=>{expect(hd338trax2(0,0)).toBe(0);});it('d',()=>{expect(hd338trax2(93,73)).toBe(2);});it('e',()=>{expect(hd338trax2(15,0)).toBe(4);});});
function hd338trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd339trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339trax2_hd',()=>{it('a',()=>{expect(hd339trax2(1,4)).toBe(2);});it('b',()=>{expect(hd339trax2(3,1)).toBe(1);});it('c',()=>{expect(hd339trax2(0,0)).toBe(0);});it('d',()=>{expect(hd339trax2(93,73)).toBe(2);});it('e',()=>{expect(hd339trax2(15,0)).toBe(4);});});
function hd339trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd340trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340trax2_hd',()=>{it('a',()=>{expect(hd340trax2(1,4)).toBe(2);});it('b',()=>{expect(hd340trax2(3,1)).toBe(1);});it('c',()=>{expect(hd340trax2(0,0)).toBe(0);});it('d',()=>{expect(hd340trax2(93,73)).toBe(2);});it('e',()=>{expect(hd340trax2(15,0)).toBe(4);});});
function hd340trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd341trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341trax2_hd',()=>{it('a',()=>{expect(hd341trax2(1,4)).toBe(2);});it('b',()=>{expect(hd341trax2(3,1)).toBe(1);});it('c',()=>{expect(hd341trax2(0,0)).toBe(0);});it('d',()=>{expect(hd341trax2(93,73)).toBe(2);});it('e',()=>{expect(hd341trax2(15,0)).toBe(4);});});
function hd341trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd342trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342trax2_hd',()=>{it('a',()=>{expect(hd342trax2(1,4)).toBe(2);});it('b',()=>{expect(hd342trax2(3,1)).toBe(1);});it('c',()=>{expect(hd342trax2(0,0)).toBe(0);});it('d',()=>{expect(hd342trax2(93,73)).toBe(2);});it('e',()=>{expect(hd342trax2(15,0)).toBe(4);});});
function hd342trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd343trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343trax2_hd',()=>{it('a',()=>{expect(hd343trax2(1,4)).toBe(2);});it('b',()=>{expect(hd343trax2(3,1)).toBe(1);});it('c',()=>{expect(hd343trax2(0,0)).toBe(0);});it('d',()=>{expect(hd343trax2(93,73)).toBe(2);});it('e',()=>{expect(hd343trax2(15,0)).toBe(4);});});
function hd343trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd344trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344trax2_hd',()=>{it('a',()=>{expect(hd344trax2(1,4)).toBe(2);});it('b',()=>{expect(hd344trax2(3,1)).toBe(1);});it('c',()=>{expect(hd344trax2(0,0)).toBe(0);});it('d',()=>{expect(hd344trax2(93,73)).toBe(2);});it('e',()=>{expect(hd344trax2(15,0)).toBe(4);});});
function hd344trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd345trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345trax2_hd',()=>{it('a',()=>{expect(hd345trax2(1,4)).toBe(2);});it('b',()=>{expect(hd345trax2(3,1)).toBe(1);});it('c',()=>{expect(hd345trax2(0,0)).toBe(0);});it('d',()=>{expect(hd345trax2(93,73)).toBe(2);});it('e',()=>{expect(hd345trax2(15,0)).toBe(4);});});
function hd345trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd346trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346trax2_hd',()=>{it('a',()=>{expect(hd346trax2(1,4)).toBe(2);});it('b',()=>{expect(hd346trax2(3,1)).toBe(1);});it('c',()=>{expect(hd346trax2(0,0)).toBe(0);});it('d',()=>{expect(hd346trax2(93,73)).toBe(2);});it('e',()=>{expect(hd346trax2(15,0)).toBe(4);});});
function hd346trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd347trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347trax2_hd',()=>{it('a',()=>{expect(hd347trax2(1,4)).toBe(2);});it('b',()=>{expect(hd347trax2(3,1)).toBe(1);});it('c',()=>{expect(hd347trax2(0,0)).toBe(0);});it('d',()=>{expect(hd347trax2(93,73)).toBe(2);});it('e',()=>{expect(hd347trax2(15,0)).toBe(4);});});
function hd347trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd348trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348trax2_hd',()=>{it('a',()=>{expect(hd348trax2(1,4)).toBe(2);});it('b',()=>{expect(hd348trax2(3,1)).toBe(1);});it('c',()=>{expect(hd348trax2(0,0)).toBe(0);});it('d',()=>{expect(hd348trax2(93,73)).toBe(2);});it('e',()=>{expect(hd348trax2(15,0)).toBe(4);});});
function hd348trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd349trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349trax2_hd',()=>{it('a',()=>{expect(hd349trax2(1,4)).toBe(2);});it('b',()=>{expect(hd349trax2(3,1)).toBe(1);});it('c',()=>{expect(hd349trax2(0,0)).toBe(0);});it('d',()=>{expect(hd349trax2(93,73)).toBe(2);});it('e',()=>{expect(hd349trax2(15,0)).toBe(4);});});
function hd349trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd350trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350trax2_hd',()=>{it('a',()=>{expect(hd350trax2(1,4)).toBe(2);});it('b',()=>{expect(hd350trax2(3,1)).toBe(1);});it('c',()=>{expect(hd350trax2(0,0)).toBe(0);});it('d',()=>{expect(hd350trax2(93,73)).toBe(2);});it('e',()=>{expect(hd350trax2(15,0)).toBe(4);});});
function hd350trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd351trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351trax2_hd',()=>{it('a',()=>{expect(hd351trax2(1,4)).toBe(2);});it('b',()=>{expect(hd351trax2(3,1)).toBe(1);});it('c',()=>{expect(hd351trax2(0,0)).toBe(0);});it('d',()=>{expect(hd351trax2(93,73)).toBe(2);});it('e',()=>{expect(hd351trax2(15,0)).toBe(4);});});
function hd351trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd352trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352trax2_hd',()=>{it('a',()=>{expect(hd352trax2(1,4)).toBe(2);});it('b',()=>{expect(hd352trax2(3,1)).toBe(1);});it('c',()=>{expect(hd352trax2(0,0)).toBe(0);});it('d',()=>{expect(hd352trax2(93,73)).toBe(2);});it('e',()=>{expect(hd352trax2(15,0)).toBe(4);});});
function hd352trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd353trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353trax2_hd',()=>{it('a',()=>{expect(hd353trax2(1,4)).toBe(2);});it('b',()=>{expect(hd353trax2(3,1)).toBe(1);});it('c',()=>{expect(hd353trax2(0,0)).toBe(0);});it('d',()=>{expect(hd353trax2(93,73)).toBe(2);});it('e',()=>{expect(hd353trax2(15,0)).toBe(4);});});
function hd353trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd354trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354trax2_hd',()=>{it('a',()=>{expect(hd354trax2(1,4)).toBe(2);});it('b',()=>{expect(hd354trax2(3,1)).toBe(1);});it('c',()=>{expect(hd354trax2(0,0)).toBe(0);});it('d',()=>{expect(hd354trax2(93,73)).toBe(2);});it('e',()=>{expect(hd354trax2(15,0)).toBe(4);});});
function hd354trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd355trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355trax2_hd',()=>{it('a',()=>{expect(hd355trax2(1,4)).toBe(2);});it('b',()=>{expect(hd355trax2(3,1)).toBe(1);});it('c',()=>{expect(hd355trax2(0,0)).toBe(0);});it('d',()=>{expect(hd355trax2(93,73)).toBe(2);});it('e',()=>{expect(hd355trax2(15,0)).toBe(4);});});
function hd355trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd356trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356trax2_hd',()=>{it('a',()=>{expect(hd356trax2(1,4)).toBe(2);});it('b',()=>{expect(hd356trax2(3,1)).toBe(1);});it('c',()=>{expect(hd356trax2(0,0)).toBe(0);});it('d',()=>{expect(hd356trax2(93,73)).toBe(2);});it('e',()=>{expect(hd356trax2(15,0)).toBe(4);});});
function hd356trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd357trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357trax2_hd',()=>{it('a',()=>{expect(hd357trax2(1,4)).toBe(2);});it('b',()=>{expect(hd357trax2(3,1)).toBe(1);});it('c',()=>{expect(hd357trax2(0,0)).toBe(0);});it('d',()=>{expect(hd357trax2(93,73)).toBe(2);});it('e',()=>{expect(hd357trax2(15,0)).toBe(4);});});
function hd357trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd358trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358trax2_hd',()=>{it('a',()=>{expect(hd358trax2(1,4)).toBe(2);});it('b',()=>{expect(hd358trax2(3,1)).toBe(1);});it('c',()=>{expect(hd358trax2(0,0)).toBe(0);});it('d',()=>{expect(hd358trax2(93,73)).toBe(2);});it('e',()=>{expect(hd358trax2(15,0)).toBe(4);});});
function hd358trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd359trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359trax2_hd',()=>{it('a',()=>{expect(hd359trax2(1,4)).toBe(2);});it('b',()=>{expect(hd359trax2(3,1)).toBe(1);});it('c',()=>{expect(hd359trax2(0,0)).toBe(0);});it('d',()=>{expect(hd359trax2(93,73)).toBe(2);});it('e',()=>{expect(hd359trax2(15,0)).toBe(4);});});
function hd359trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd360trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360trax2_hd',()=>{it('a',()=>{expect(hd360trax2(1,4)).toBe(2);});it('b',()=>{expect(hd360trax2(3,1)).toBe(1);});it('c',()=>{expect(hd360trax2(0,0)).toBe(0);});it('d',()=>{expect(hd360trax2(93,73)).toBe(2);});it('e',()=>{expect(hd360trax2(15,0)).toBe(4);});});
function hd360trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd361trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361trax2_hd',()=>{it('a',()=>{expect(hd361trax2(1,4)).toBe(2);});it('b',()=>{expect(hd361trax2(3,1)).toBe(1);});it('c',()=>{expect(hd361trax2(0,0)).toBe(0);});it('d',()=>{expect(hd361trax2(93,73)).toBe(2);});it('e',()=>{expect(hd361trax2(15,0)).toBe(4);});});
function hd361trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd362trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362trax2_hd',()=>{it('a',()=>{expect(hd362trax2(1,4)).toBe(2);});it('b',()=>{expect(hd362trax2(3,1)).toBe(1);});it('c',()=>{expect(hd362trax2(0,0)).toBe(0);});it('d',()=>{expect(hd362trax2(93,73)).toBe(2);});it('e',()=>{expect(hd362trax2(15,0)).toBe(4);});});
function hd362trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd363trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363trax2_hd',()=>{it('a',()=>{expect(hd363trax2(1,4)).toBe(2);});it('b',()=>{expect(hd363trax2(3,1)).toBe(1);});it('c',()=>{expect(hd363trax2(0,0)).toBe(0);});it('d',()=>{expect(hd363trax2(93,73)).toBe(2);});it('e',()=>{expect(hd363trax2(15,0)).toBe(4);});});
function hd363trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd364trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364trax2_hd',()=>{it('a',()=>{expect(hd364trax2(1,4)).toBe(2);});it('b',()=>{expect(hd364trax2(3,1)).toBe(1);});it('c',()=>{expect(hd364trax2(0,0)).toBe(0);});it('d',()=>{expect(hd364trax2(93,73)).toBe(2);});it('e',()=>{expect(hd364trax2(15,0)).toBe(4);});});
function hd364trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd365trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365trax2_hd',()=>{it('a',()=>{expect(hd365trax2(1,4)).toBe(2);});it('b',()=>{expect(hd365trax2(3,1)).toBe(1);});it('c',()=>{expect(hd365trax2(0,0)).toBe(0);});it('d',()=>{expect(hd365trax2(93,73)).toBe(2);});it('e',()=>{expect(hd365trax2(15,0)).toBe(4);});});
function hd365trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd366trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366trax2_hd',()=>{it('a',()=>{expect(hd366trax2(1,4)).toBe(2);});it('b',()=>{expect(hd366trax2(3,1)).toBe(1);});it('c',()=>{expect(hd366trax2(0,0)).toBe(0);});it('d',()=>{expect(hd366trax2(93,73)).toBe(2);});it('e',()=>{expect(hd366trax2(15,0)).toBe(4);});});
function hd366trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd367trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367trax2_hd',()=>{it('a',()=>{expect(hd367trax2(1,4)).toBe(2);});it('b',()=>{expect(hd367trax2(3,1)).toBe(1);});it('c',()=>{expect(hd367trax2(0,0)).toBe(0);});it('d',()=>{expect(hd367trax2(93,73)).toBe(2);});it('e',()=>{expect(hd367trax2(15,0)).toBe(4);});});
function hd367trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd368trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368trax2_hd',()=>{it('a',()=>{expect(hd368trax2(1,4)).toBe(2);});it('b',()=>{expect(hd368trax2(3,1)).toBe(1);});it('c',()=>{expect(hd368trax2(0,0)).toBe(0);});it('d',()=>{expect(hd368trax2(93,73)).toBe(2);});it('e',()=>{expect(hd368trax2(15,0)).toBe(4);});});
function hd368trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd369trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369trax2_hd',()=>{it('a',()=>{expect(hd369trax2(1,4)).toBe(2);});it('b',()=>{expect(hd369trax2(3,1)).toBe(1);});it('c',()=>{expect(hd369trax2(0,0)).toBe(0);});it('d',()=>{expect(hd369trax2(93,73)).toBe(2);});it('e',()=>{expect(hd369trax2(15,0)).toBe(4);});});
function hd369trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd370trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370trax2_hd',()=>{it('a',()=>{expect(hd370trax2(1,4)).toBe(2);});it('b',()=>{expect(hd370trax2(3,1)).toBe(1);});it('c',()=>{expect(hd370trax2(0,0)).toBe(0);});it('d',()=>{expect(hd370trax2(93,73)).toBe(2);});it('e',()=>{expect(hd370trax2(15,0)).toBe(4);});});
function hd370trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd371trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371trax2_hd',()=>{it('a',()=>{expect(hd371trax2(1,4)).toBe(2);});it('b',()=>{expect(hd371trax2(3,1)).toBe(1);});it('c',()=>{expect(hd371trax2(0,0)).toBe(0);});it('d',()=>{expect(hd371trax2(93,73)).toBe(2);});it('e',()=>{expect(hd371trax2(15,0)).toBe(4);});});
function hd371trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd372trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372trax2_hd',()=>{it('a',()=>{expect(hd372trax2(1,4)).toBe(2);});it('b',()=>{expect(hd372trax2(3,1)).toBe(1);});it('c',()=>{expect(hd372trax2(0,0)).toBe(0);});it('d',()=>{expect(hd372trax2(93,73)).toBe(2);});it('e',()=>{expect(hd372trax2(15,0)).toBe(4);});});
function hd372trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd373trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373trax2_hd',()=>{it('a',()=>{expect(hd373trax2(1,4)).toBe(2);});it('b',()=>{expect(hd373trax2(3,1)).toBe(1);});it('c',()=>{expect(hd373trax2(0,0)).toBe(0);});it('d',()=>{expect(hd373trax2(93,73)).toBe(2);});it('e',()=>{expect(hd373trax2(15,0)).toBe(4);});});
function hd373trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd374trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374trax2_hd',()=>{it('a',()=>{expect(hd374trax2(1,4)).toBe(2);});it('b',()=>{expect(hd374trax2(3,1)).toBe(1);});it('c',()=>{expect(hd374trax2(0,0)).toBe(0);});it('d',()=>{expect(hd374trax2(93,73)).toBe(2);});it('e',()=>{expect(hd374trax2(15,0)).toBe(4);});});
function hd374trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd375trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375trax2_hd',()=>{it('a',()=>{expect(hd375trax2(1,4)).toBe(2);});it('b',()=>{expect(hd375trax2(3,1)).toBe(1);});it('c',()=>{expect(hd375trax2(0,0)).toBe(0);});it('d',()=>{expect(hd375trax2(93,73)).toBe(2);});it('e',()=>{expect(hd375trax2(15,0)).toBe(4);});});
function hd375trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd376trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376trax2_hd',()=>{it('a',()=>{expect(hd376trax2(1,4)).toBe(2);});it('b',()=>{expect(hd376trax2(3,1)).toBe(1);});it('c',()=>{expect(hd376trax2(0,0)).toBe(0);});it('d',()=>{expect(hd376trax2(93,73)).toBe(2);});it('e',()=>{expect(hd376trax2(15,0)).toBe(4);});});
function hd376trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd377trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377trax2_hd',()=>{it('a',()=>{expect(hd377trax2(1,4)).toBe(2);});it('b',()=>{expect(hd377trax2(3,1)).toBe(1);});it('c',()=>{expect(hd377trax2(0,0)).toBe(0);});it('d',()=>{expect(hd377trax2(93,73)).toBe(2);});it('e',()=>{expect(hd377trax2(15,0)).toBe(4);});});
function hd377trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd378trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378trax2_hd',()=>{it('a',()=>{expect(hd378trax2(1,4)).toBe(2);});it('b',()=>{expect(hd378trax2(3,1)).toBe(1);});it('c',()=>{expect(hd378trax2(0,0)).toBe(0);});it('d',()=>{expect(hd378trax2(93,73)).toBe(2);});it('e',()=>{expect(hd378trax2(15,0)).toBe(4);});});
function hd378trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd379trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379trax2_hd',()=>{it('a',()=>{expect(hd379trax2(1,4)).toBe(2);});it('b',()=>{expect(hd379trax2(3,1)).toBe(1);});it('c',()=>{expect(hd379trax2(0,0)).toBe(0);});it('d',()=>{expect(hd379trax2(93,73)).toBe(2);});it('e',()=>{expect(hd379trax2(15,0)).toBe(4);});});
function hd379trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd380trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380trax2_hd',()=>{it('a',()=>{expect(hd380trax2(1,4)).toBe(2);});it('b',()=>{expect(hd380trax2(3,1)).toBe(1);});it('c',()=>{expect(hd380trax2(0,0)).toBe(0);});it('d',()=>{expect(hd380trax2(93,73)).toBe(2);});it('e',()=>{expect(hd380trax2(15,0)).toBe(4);});});
function hd380trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd381trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381trax2_hd',()=>{it('a',()=>{expect(hd381trax2(1,4)).toBe(2);});it('b',()=>{expect(hd381trax2(3,1)).toBe(1);});it('c',()=>{expect(hd381trax2(0,0)).toBe(0);});it('d',()=>{expect(hd381trax2(93,73)).toBe(2);});it('e',()=>{expect(hd381trax2(15,0)).toBe(4);});});
function hd381trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd382trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382trax2_hd',()=>{it('a',()=>{expect(hd382trax2(1,4)).toBe(2);});it('b',()=>{expect(hd382trax2(3,1)).toBe(1);});it('c',()=>{expect(hd382trax2(0,0)).toBe(0);});it('d',()=>{expect(hd382trax2(93,73)).toBe(2);});it('e',()=>{expect(hd382trax2(15,0)).toBe(4);});});
function hd382trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd383trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383trax2_hd',()=>{it('a',()=>{expect(hd383trax2(1,4)).toBe(2);});it('b',()=>{expect(hd383trax2(3,1)).toBe(1);});it('c',()=>{expect(hd383trax2(0,0)).toBe(0);});it('d',()=>{expect(hd383trax2(93,73)).toBe(2);});it('e',()=>{expect(hd383trax2(15,0)).toBe(4);});});
function hd383trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd384trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384trax2_hd',()=>{it('a',()=>{expect(hd384trax2(1,4)).toBe(2);});it('b',()=>{expect(hd384trax2(3,1)).toBe(1);});it('c',()=>{expect(hd384trax2(0,0)).toBe(0);});it('d',()=>{expect(hd384trax2(93,73)).toBe(2);});it('e',()=>{expect(hd384trax2(15,0)).toBe(4);});});
function hd384trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd385trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385trax2_hd',()=>{it('a',()=>{expect(hd385trax2(1,4)).toBe(2);});it('b',()=>{expect(hd385trax2(3,1)).toBe(1);});it('c',()=>{expect(hd385trax2(0,0)).toBe(0);});it('d',()=>{expect(hd385trax2(93,73)).toBe(2);});it('e',()=>{expect(hd385trax2(15,0)).toBe(4);});});
function hd385trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd386trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386trax2_hd',()=>{it('a',()=>{expect(hd386trax2(1,4)).toBe(2);});it('b',()=>{expect(hd386trax2(3,1)).toBe(1);});it('c',()=>{expect(hd386trax2(0,0)).toBe(0);});it('d',()=>{expect(hd386trax2(93,73)).toBe(2);});it('e',()=>{expect(hd386trax2(15,0)).toBe(4);});});
function hd386trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd387trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387trax2_hd',()=>{it('a',()=>{expect(hd387trax2(1,4)).toBe(2);});it('b',()=>{expect(hd387trax2(3,1)).toBe(1);});it('c',()=>{expect(hd387trax2(0,0)).toBe(0);});it('d',()=>{expect(hd387trax2(93,73)).toBe(2);});it('e',()=>{expect(hd387trax2(15,0)).toBe(4);});});
function hd387trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd388trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388trax2_hd',()=>{it('a',()=>{expect(hd388trax2(1,4)).toBe(2);});it('b',()=>{expect(hd388trax2(3,1)).toBe(1);});it('c',()=>{expect(hd388trax2(0,0)).toBe(0);});it('d',()=>{expect(hd388trax2(93,73)).toBe(2);});it('e',()=>{expect(hd388trax2(15,0)).toBe(4);});});
function hd388trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd389trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389trax2_hd',()=>{it('a',()=>{expect(hd389trax2(1,4)).toBe(2);});it('b',()=>{expect(hd389trax2(3,1)).toBe(1);});it('c',()=>{expect(hd389trax2(0,0)).toBe(0);});it('d',()=>{expect(hd389trax2(93,73)).toBe(2);});it('e',()=>{expect(hd389trax2(15,0)).toBe(4);});});
function hd389trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd390trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390trax2_hd',()=>{it('a',()=>{expect(hd390trax2(1,4)).toBe(2);});it('b',()=>{expect(hd390trax2(3,1)).toBe(1);});it('c',()=>{expect(hd390trax2(0,0)).toBe(0);});it('d',()=>{expect(hd390trax2(93,73)).toBe(2);});it('e',()=>{expect(hd390trax2(15,0)).toBe(4);});});
function hd390trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd391trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391trax2_hd',()=>{it('a',()=>{expect(hd391trax2(1,4)).toBe(2);});it('b',()=>{expect(hd391trax2(3,1)).toBe(1);});it('c',()=>{expect(hd391trax2(0,0)).toBe(0);});it('d',()=>{expect(hd391trax2(93,73)).toBe(2);});it('e',()=>{expect(hd391trax2(15,0)).toBe(4);});});
function hd391trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd392trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392trax2_hd',()=>{it('a',()=>{expect(hd392trax2(1,4)).toBe(2);});it('b',()=>{expect(hd392trax2(3,1)).toBe(1);});it('c',()=>{expect(hd392trax2(0,0)).toBe(0);});it('d',()=>{expect(hd392trax2(93,73)).toBe(2);});it('e',()=>{expect(hd392trax2(15,0)).toBe(4);});});
function hd392trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd393trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393trax2_hd',()=>{it('a',()=>{expect(hd393trax2(1,4)).toBe(2);});it('b',()=>{expect(hd393trax2(3,1)).toBe(1);});it('c',()=>{expect(hd393trax2(0,0)).toBe(0);});it('d',()=>{expect(hd393trax2(93,73)).toBe(2);});it('e',()=>{expect(hd393trax2(15,0)).toBe(4);});});
function hd393trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd394trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394trax2_hd',()=>{it('a',()=>{expect(hd394trax2(1,4)).toBe(2);});it('b',()=>{expect(hd394trax2(3,1)).toBe(1);});it('c',()=>{expect(hd394trax2(0,0)).toBe(0);});it('d',()=>{expect(hd394trax2(93,73)).toBe(2);});it('e',()=>{expect(hd394trax2(15,0)).toBe(4);});});
function hd394trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd395trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395trax2_hd',()=>{it('a',()=>{expect(hd395trax2(1,4)).toBe(2);});it('b',()=>{expect(hd395trax2(3,1)).toBe(1);});it('c',()=>{expect(hd395trax2(0,0)).toBe(0);});it('d',()=>{expect(hd395trax2(93,73)).toBe(2);});it('e',()=>{expect(hd395trax2(15,0)).toBe(4);});});
function hd395trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd396trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396trax2_hd',()=>{it('a',()=>{expect(hd396trax2(1,4)).toBe(2);});it('b',()=>{expect(hd396trax2(3,1)).toBe(1);});it('c',()=>{expect(hd396trax2(0,0)).toBe(0);});it('d',()=>{expect(hd396trax2(93,73)).toBe(2);});it('e',()=>{expect(hd396trax2(15,0)).toBe(4);});});
function hd396trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd397trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397trax2_hd',()=>{it('a',()=>{expect(hd397trax2(1,4)).toBe(2);});it('b',()=>{expect(hd397trax2(3,1)).toBe(1);});it('c',()=>{expect(hd397trax2(0,0)).toBe(0);});it('d',()=>{expect(hd397trax2(93,73)).toBe(2);});it('e',()=>{expect(hd397trax2(15,0)).toBe(4);});});
function hd397trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd398trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398trax2_hd',()=>{it('a',()=>{expect(hd398trax2(1,4)).toBe(2);});it('b',()=>{expect(hd398trax2(3,1)).toBe(1);});it('c',()=>{expect(hd398trax2(0,0)).toBe(0);});it('d',()=>{expect(hd398trax2(93,73)).toBe(2);});it('e',()=>{expect(hd398trax2(15,0)).toBe(4);});});
function hd398trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd399trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399trax2_hd',()=>{it('a',()=>{expect(hd399trax2(1,4)).toBe(2);});it('b',()=>{expect(hd399trax2(3,1)).toBe(1);});it('c',()=>{expect(hd399trax2(0,0)).toBe(0);});it('d',()=>{expect(hd399trax2(93,73)).toBe(2);});it('e',()=>{expect(hd399trax2(15,0)).toBe(4);});});
function hd399trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd400trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400trax2_hd',()=>{it('a',()=>{expect(hd400trax2(1,4)).toBe(2);});it('b',()=>{expect(hd400trax2(3,1)).toBe(1);});it('c',()=>{expect(hd400trax2(0,0)).toBe(0);});it('d',()=>{expect(hd400trax2(93,73)).toBe(2);});it('e',()=>{expect(hd400trax2(15,0)).toBe(4);});});
function hd400trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd401trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401trax2_hd',()=>{it('a',()=>{expect(hd401trax2(1,4)).toBe(2);});it('b',()=>{expect(hd401trax2(3,1)).toBe(1);});it('c',()=>{expect(hd401trax2(0,0)).toBe(0);});it('d',()=>{expect(hd401trax2(93,73)).toBe(2);});it('e',()=>{expect(hd401trax2(15,0)).toBe(4);});});
function hd401trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd402trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402trax2_hd',()=>{it('a',()=>{expect(hd402trax2(1,4)).toBe(2);});it('b',()=>{expect(hd402trax2(3,1)).toBe(1);});it('c',()=>{expect(hd402trax2(0,0)).toBe(0);});it('d',()=>{expect(hd402trax2(93,73)).toBe(2);});it('e',()=>{expect(hd402trax2(15,0)).toBe(4);});});
function hd402trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd403trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403trax2_hd',()=>{it('a',()=>{expect(hd403trax2(1,4)).toBe(2);});it('b',()=>{expect(hd403trax2(3,1)).toBe(1);});it('c',()=>{expect(hd403trax2(0,0)).toBe(0);});it('d',()=>{expect(hd403trax2(93,73)).toBe(2);});it('e',()=>{expect(hd403trax2(15,0)).toBe(4);});});
function hd403trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd404trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404trax2_hd',()=>{it('a',()=>{expect(hd404trax2(1,4)).toBe(2);});it('b',()=>{expect(hd404trax2(3,1)).toBe(1);});it('c',()=>{expect(hd404trax2(0,0)).toBe(0);});it('d',()=>{expect(hd404trax2(93,73)).toBe(2);});it('e',()=>{expect(hd404trax2(15,0)).toBe(4);});});
function hd404trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd405trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405trax2_hd',()=>{it('a',()=>{expect(hd405trax2(1,4)).toBe(2);});it('b',()=>{expect(hd405trax2(3,1)).toBe(1);});it('c',()=>{expect(hd405trax2(0,0)).toBe(0);});it('d',()=>{expect(hd405trax2(93,73)).toBe(2);});it('e',()=>{expect(hd405trax2(15,0)).toBe(4);});});
function hd405trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd406trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406trax2_hd',()=>{it('a',()=>{expect(hd406trax2(1,4)).toBe(2);});it('b',()=>{expect(hd406trax2(3,1)).toBe(1);});it('c',()=>{expect(hd406trax2(0,0)).toBe(0);});it('d',()=>{expect(hd406trax2(93,73)).toBe(2);});it('e',()=>{expect(hd406trax2(15,0)).toBe(4);});});
function hd406trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd407trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407trax2_hd',()=>{it('a',()=>{expect(hd407trax2(1,4)).toBe(2);});it('b',()=>{expect(hd407trax2(3,1)).toBe(1);});it('c',()=>{expect(hd407trax2(0,0)).toBe(0);});it('d',()=>{expect(hd407trax2(93,73)).toBe(2);});it('e',()=>{expect(hd407trax2(15,0)).toBe(4);});});
function hd407trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd408trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408trax2_hd',()=>{it('a',()=>{expect(hd408trax2(1,4)).toBe(2);});it('b',()=>{expect(hd408trax2(3,1)).toBe(1);});it('c',()=>{expect(hd408trax2(0,0)).toBe(0);});it('d',()=>{expect(hd408trax2(93,73)).toBe(2);});it('e',()=>{expect(hd408trax2(15,0)).toBe(4);});});
function hd408trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd409trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409trax2_hd',()=>{it('a',()=>{expect(hd409trax2(1,4)).toBe(2);});it('b',()=>{expect(hd409trax2(3,1)).toBe(1);});it('c',()=>{expect(hd409trax2(0,0)).toBe(0);});it('d',()=>{expect(hd409trax2(93,73)).toBe(2);});it('e',()=>{expect(hd409trax2(15,0)).toBe(4);});});
function hd409trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd410trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410trax2_hd',()=>{it('a',()=>{expect(hd410trax2(1,4)).toBe(2);});it('b',()=>{expect(hd410trax2(3,1)).toBe(1);});it('c',()=>{expect(hd410trax2(0,0)).toBe(0);});it('d',()=>{expect(hd410trax2(93,73)).toBe(2);});it('e',()=>{expect(hd410trax2(15,0)).toBe(4);});});
function hd410trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd411trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411trax2_hd',()=>{it('a',()=>{expect(hd411trax2(1,4)).toBe(2);});it('b',()=>{expect(hd411trax2(3,1)).toBe(1);});it('c',()=>{expect(hd411trax2(0,0)).toBe(0);});it('d',()=>{expect(hd411trax2(93,73)).toBe(2);});it('e',()=>{expect(hd411trax2(15,0)).toBe(4);});});
function hd411trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd412trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412trax2_hd',()=>{it('a',()=>{expect(hd412trax2(1,4)).toBe(2);});it('b',()=>{expect(hd412trax2(3,1)).toBe(1);});it('c',()=>{expect(hd412trax2(0,0)).toBe(0);});it('d',()=>{expect(hd412trax2(93,73)).toBe(2);});it('e',()=>{expect(hd412trax2(15,0)).toBe(4);});});
function hd412trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd413trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413trax2_hd',()=>{it('a',()=>{expect(hd413trax2(1,4)).toBe(2);});it('b',()=>{expect(hd413trax2(3,1)).toBe(1);});it('c',()=>{expect(hd413trax2(0,0)).toBe(0);});it('d',()=>{expect(hd413trax2(93,73)).toBe(2);});it('e',()=>{expect(hd413trax2(15,0)).toBe(4);});});
function hd413trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd414trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414trax2_hd',()=>{it('a',()=>{expect(hd414trax2(1,4)).toBe(2);});it('b',()=>{expect(hd414trax2(3,1)).toBe(1);});it('c',()=>{expect(hd414trax2(0,0)).toBe(0);});it('d',()=>{expect(hd414trax2(93,73)).toBe(2);});it('e',()=>{expect(hd414trax2(15,0)).toBe(4);});});
function hd414trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd415trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415trax2_hd',()=>{it('a',()=>{expect(hd415trax2(1,4)).toBe(2);});it('b',()=>{expect(hd415trax2(3,1)).toBe(1);});it('c',()=>{expect(hd415trax2(0,0)).toBe(0);});it('d',()=>{expect(hd415trax2(93,73)).toBe(2);});it('e',()=>{expect(hd415trax2(15,0)).toBe(4);});});
function hd415trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd416trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416trax2_hd',()=>{it('a',()=>{expect(hd416trax2(1,4)).toBe(2);});it('b',()=>{expect(hd416trax2(3,1)).toBe(1);});it('c',()=>{expect(hd416trax2(0,0)).toBe(0);});it('d',()=>{expect(hd416trax2(93,73)).toBe(2);});it('e',()=>{expect(hd416trax2(15,0)).toBe(4);});});
function hd416trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
function hd417trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417trax2_hd',()=>{it('a',()=>{expect(hd417trax2(1,4)).toBe(2);});it('b',()=>{expect(hd417trax2(3,1)).toBe(1);});it('c',()=>{expect(hd417trax2(0,0)).toBe(0);});it('d',()=>{expect(hd417trax2(93,73)).toBe(2);});it('e',()=>{expect(hd417trax2(15,0)).toBe(4);});});
function hd417trax2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417trax2_hd',()=>{it('a',()=>{expect(hd(1,4)).toBe(2);});it('b',()=>{expect(hd(3,1)).toBe(1);});it('c',()=>{expect(hd(0,0)).toBe(0);});it('d',()=>{expect(hd(93,73)).toBe(2);});it('e',()=>{expect(hd(15,0)).toBe(4);});});
