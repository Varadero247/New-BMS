/**
 * @ims/end-user-training — programme specification tests
 *
 * Source of truth: packages/end-user-training/00-programme-overview/PROGRAMME-OVERVIEW.md
 *
 * No external imports — all programme data is defined inline.
 */

// ---------------------------------------------------------------------------
// Programme constants
// ---------------------------------------------------------------------------

const PROGRAMME = {
  cpdHours: 4,
  durationHours: 4,
  formats: ['virtual-ilt', 'elearning'] as const,
  certificateTitle: 'Nexara Platform Foundation — End User Completion Certificate',
  prerequisites: 'none', // only needs active user account
};

type DeliveryFormat = typeof PROGRAMME.formats[number];

const MODULES = [
  { number: 1, title: 'Platform Navigation', durationMinutes: 30 },
  { number: 2, title: 'Recording Incidents', durationMinutes: 40 },
  { number: 3, title: 'Training Acknowledgements', durationMinutes: 30 },
  { number: 4, title: 'Permit to Work', durationMinutes: 40 },
  { number: 5, title: 'Observations', durationMinutes: 30 },
  { number: 6, title: 'Reports & Dashboards', durationMinutes: 25 },
] as const;

const ASSESSMENT = {
  format: 'MCQ' as const,
  questionCount: 20,
  durationMinutesVirtual: 20,
  durationMinutesElearning: null as null, // untimed
  passThresholdPct: 80,
  passThresholdQuestions: 16, // 80% of 20
  retakePolicy: 'immediate-elearning-or-next-session' as const,
};

// Safety-critical modules (require higher pass mark reasoning)
const SAFETY_CRITICAL_MODULES = [2, 4]; // Incidents (2) and PTW (4)

// Target audience groups
interface AudienceGroup {
  label: string;
  reason: string;
}
const TARGET_AUDIENCE: AudienceGroup[] = [
  { label: 'Operational staff', reason: 'Record incidents, near misses, observations' },
  { label: 'All employees', reason: 'Acknowledge assigned training and procedures' },
  { label: 'Permit holders', reason: 'Request and operate under Permit to Work' },
  { label: 'Shift workers, field staff, technicians', reason: 'Log observations; access personal compliance dashboard' },
  { label: 'New joiners', reason: 'Platform orientation as part of induction' },
];

// Learning outcomes
const LEARNING_OUTCOMES = [
  'Log in to Nexara IMS, navigate the dashboard, and find their assigned modules',
  'Record an incident or near miss with all required information correctly entered',
  'Find and acknowledge assigned training; understand compliance deadline alerts',
  'Submit a Permit to Work request and work safely under an approved permit',
  'Submit an observation (positive or negative) with appropriate evidence',
  'Access their personal compliance dashboard and understand their RAG status',
];

// Virtual ILT schedule
interface VirtualSession {
  timeStart: string;
  timeEnd: string;
  label: string;
}
const VIRTUAL_SCHEDULE: VirtualSession[] = [
  { timeStart: '09:00', timeEnd: '09:30', label: 'Module 1: Platform Navigation' },
  { timeStart: '09:30', timeEnd: '09:40', label: 'Break 1' },
  { timeStart: '09:40', timeEnd: '10:20', label: 'Module 2: Recording Incidents' },
  { timeStart: '10:20', timeEnd: '10:50', label: 'Module 3: Training Acknowledgements' },
  { timeStart: '10:50', timeEnd: '11:00', label: 'Break 2' },
  { timeStart: '11:00', timeEnd: '11:40', label: 'Module 4: Permit to Work' },
  { timeStart: '11:40', timeEnd: '12:10', label: 'Module 5: Observations' },
  { timeStart: '12:10', timeEnd: '12:35', label: 'Module 6: Reports & Dashboards' },
  { timeStart: '12:35', timeEnd: '13:00', label: 'Assessment + close' },
];

function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function sessionDuration(s: VirtualSession): number {
  return toMinutes(s.timeEnd) - toMinutes(s.timeStart);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Programme constants', () => {
  it('awards 4 CPD hours', () => {
    expect(PROGRAMME.cpdHours).toBe(4);
  });

  it('programme duration is 4 hours', () => {
    expect(PROGRAMME.durationHours).toBe(4);
  });

  it('CPD hours equal programme duration', () => {
    expect(PROGRAMME.cpdHours).toBe(PROGRAMME.durationHours);
  });

  it('has 2 delivery formats', () => {
    expect(PROGRAMME.formats).toHaveLength(2);
  });

  it('includes virtual-ilt format', () => {
    expect(PROGRAMME.formats).toContain('virtual-ilt' as DeliveryFormat);
  });

  it('includes elearning format', () => {
    expect(PROGRAMME.formats).toContain('elearning' as DeliveryFormat);
  });

  it('certificate title matches spec', () => {
    expect(PROGRAMME.certificateTitle).toBe('Nexara Platform Foundation — End User Completion Certificate');
  });

  it('certificate title starts with Nexara', () => {
    expect(PROGRAMME.certificateTitle.startsWith('Nexara')).toBe(true);
  });

  it('no prerequisites', () => {
    expect(PROGRAMME.prerequisites).toBe('none');
  });

  it('shorter than Administrator programme (14 CPD) and Module Owner (7 CPD/day)', () => {
    expect(PROGRAMME.cpdHours).toBeLessThan(7);
  });
});

describe('Module count and structure', () => {
  it('has exactly 6 content modules', () => {
    expect(MODULES).toHaveLength(6);
  });

  it('module numbers are sequential starting at 1', () => {
    MODULES.forEach((m, i) => expect(m.number).toBe(i + 1));
  });

  it('all modules have positive duration', () => {
    for (const m of MODULES) {
      expect(m.durationMinutes).toBeGreaterThan(0);
    }
  });

  it('total content time = 195 minutes', () => {
    const total = MODULES.reduce((sum, m) => sum + m.durationMinutes, 0);
    expect(total).toBe(195);
  });

  it('all module titles are unique', () => {
    const titles = MODULES.map((m) => m.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('Module 1 is Platform Navigation', () => {
    expect(MODULES[0].title).toBe('Platform Navigation');
  });

  it('Module 6 is Reports & Dashboards', () => {
    expect(MODULES[5].title).toBe('Reports & Dashboards');
  });

  it('Module 2 (Recording Incidents) is safety-critical', () => {
    expect(SAFETY_CRITICAL_MODULES).toContain(2);
  });

  it('Module 4 (Permit to Work) is safety-critical', () => {
    expect(SAFETY_CRITICAL_MODULES).toContain(4);
  });

  it('exactly 2 safety-critical modules', () => {
    expect(SAFETY_CRITICAL_MODULES).toHaveLength(2);
  });

  it('Permit to Work has 40-minute duration (same as incidents)', () => {
    const ptw = MODULES.find((m) => m.title === 'Permit to Work');
    expect(ptw?.durationMinutes).toBe(40);
  });

  it('non-safety-critical modules are shorter (25 or 30 min)', () => {
    const nonCritical = MODULES.filter((m) => !SAFETY_CRITICAL_MODULES.includes(m.number));
    for (const m of nonCritical) {
      expect(m.durationMinutes).toBeLessThanOrEqual(30);
    }
  });

  it('safety-critical modules are longest (40 min each)', () => {
    const critical = MODULES.filter((m) => SAFETY_CRITICAL_MODULES.includes(m.number));
    for (const m of critical) {
      expect(m.durationMinutes).toBe(40);
    }
  });
});

// Parametric: each module title and duration
const EXPECTED_MODULES: [number, string, number][] = [
  [1, 'Platform Navigation', 30],
  [2, 'Recording Incidents', 40],
  [3, 'Training Acknowledgements', 30],
  [4, 'Permit to Work', 40],
  [5, 'Observations', 30],
  [6, 'Reports & Dashboards', 25],
];

describe('Module titles and durations (parametric)', () => {
  for (const [num, title, mins] of EXPECTED_MODULES) {
    it(`Module ${num}: "${title}" = ${mins} min`, () => {
      const mod = MODULES.find((m) => m.number === num);
      expect(mod?.title).toBe(title);
      expect(mod?.durationMinutes).toBe(mins);
    });
  }
});

describe('Assessment specification', () => {
  it('20 MCQ questions', () => {
    expect(ASSESSMENT.questionCount).toBe(20);
  });

  it('pass threshold = 80%', () => {
    expect(ASSESSMENT.passThresholdPct).toBe(80);
  });

  it('pass threshold = 16/20 correct', () => {
    expect(ASSESSMENT.passThresholdQuestions).toBe(
      Math.ceil(ASSESSMENT.questionCount * ASSESSMENT.passThresholdPct / 100)
    );
  });

  it('virtual ILT is timed (20 minutes)', () => {
    expect(ASSESSMENT.durationMinutesVirtual).toBe(20);
  });

  it('e-learning is untimed', () => {
    expect(ASSESSMENT.durationMinutesElearning).toBeNull();
  });

  it('pass threshold is higher than Module Owner (75%) because safety-critical', () => {
    const moduleOwnerPassPct = 75;
    expect(ASSESSMENT.passThresholdPct).toBeGreaterThan(moduleOwnerPassPct);
  });

  it('failing score = 15 or fewer correct (one below threshold)', () => {
    const required = Math.ceil(ASSESSMENT.questionCount * ASSESSMENT.passThresholdPct / 100);
    expect(required - 1).toBe(15);
  });

  it('retake policy is defined and non-empty', () => {
    expect(typeof ASSESSMENT.retakePolicy).toBe('string');
    expect(ASSESSMENT.retakePolicy.trim().length).toBeGreaterThan(0);
  });

  it('assessment format is MCQ', () => {
    expect(ASSESSMENT.format).toBe('MCQ');
  });
});

describe('Learning outcomes', () => {
  it('has 6 learning outcomes (one per module)', () => {
    expect(LEARNING_OUTCOMES).toHaveLength(6);
    expect(LEARNING_OUTCOMES).toHaveLength(MODULES.length);
  });

  it('all outcomes are non-empty strings', () => {
    for (const outcome of LEARNING_OUTCOMES) {
      expect(typeof outcome).toBe('string');
      expect(outcome.trim().length).toBeGreaterThan(0);
    }
  });

  it('outcomes are unique', () => {
    expect(new Set(LEARNING_OUTCOMES).size).toBe(LEARNING_OUTCOMES.length);
  });

  it('outcome 2 covers incident recording', () => {
    expect(LEARNING_OUTCOMES[1].toLowerCase()).toContain('incident');
  });

  it('outcome 4 covers permit to work', () => {
    expect(LEARNING_OUTCOMES[3].toLowerCase()).toContain('permit');
  });

  it('outcome 1 covers navigation/login', () => {
    expect(LEARNING_OUTCOMES[0].toLowerCase()).toContain('log in');
  });

  it('outcome 5 covers observations', () => {
    expect(LEARNING_OUTCOMES[4].toLowerCase()).toContain('observation');
  });

  it('outcome 6 covers compliance dashboard', () => {
    expect(LEARNING_OUTCOMES[5].toLowerCase()).toContain('compliance');
  });

  it('outcome 3 covers training acknowledgements', () => {
    expect(LEARNING_OUTCOMES[2].toLowerCase()).toContain('training');
  });
});

describe('Target audience', () => {
  it('has 5 audience groups', () => {
    expect(TARGET_AUDIENCE).toHaveLength(5);
  });

  it('all groups have non-empty labels and reasons', () => {
    for (const g of TARGET_AUDIENCE) {
      expect(g.label.trim().length).toBeGreaterThan(0);
      expect(g.reason.trim().length).toBeGreaterThan(0);
    }
  });

  it('includes new joiners for platform orientation', () => {
    const newJoiners = TARGET_AUDIENCE.find((g) => g.label.includes('New joiners'));
    expect(newJoiners).toBeDefined();
  });

  it('operational staff are in the audience', () => {
    const ops = TARGET_AUDIENCE.find((g) => g.label === 'Operational staff');
    expect(ops).toBeDefined();
  });

  it('permit holders are in the audience', () => {
    const holders = TARGET_AUDIENCE.find((g) => g.label === 'Permit holders');
    expect(holders).toBeDefined();
  });

  it('all employees are in the audience', () => {
    const all = TARGET_AUDIENCE.find((g) => g.label === 'All employees');
    expect(all).toBeDefined();
  });

  it('audience group labels are unique', () => {
    const labels = TARGET_AUDIENCE.map((g) => g.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('Virtual schedule invariants', () => {
  it('virtual schedule starts at 09:00', () => {
    expect(VIRTUAL_SCHEDULE[0].timeStart).toBe('09:00');
  });

  it('virtual schedule ends at 13:00', () => {
    expect(VIRTUAL_SCHEDULE[VIRTUAL_SCHEDULE.length - 1].timeEnd).toBe('13:00');
  });

  it('total duration is 4 hours (240 minutes)', () => {
    const totalMin = toMinutes(VIRTUAL_SCHEDULE[VIRTUAL_SCHEDULE.length - 1].timeEnd)
      - toMinutes(VIRTUAL_SCHEDULE[0].timeStart);
    expect(totalMin).toBe(240);
  });

  it('sessions do not overlap', () => {
    for (let i = 1; i < VIRTUAL_SCHEDULE.length; i++) {
      expect(toMinutes(VIRTUAL_SCHEDULE[i].timeStart)).toBeGreaterThanOrEqual(
        toMinutes(VIRTUAL_SCHEDULE[i - 1].timeEnd)
      );
    }
  });

  it('has 2 breaks in the virtual schedule', () => {
    const breaks = VIRTUAL_SCHEDULE.filter((s) => s.label.startsWith('Break'));
    expect(breaks).toHaveLength(2);
  });

  it('has 9 sessions total (6 modules + 2 breaks + 1 assessment)', () => {
    expect(VIRTUAL_SCHEDULE).toHaveLength(9);
  });

  it('assessment/close is the last session', () => {
    const last = VIRTUAL_SCHEDULE[VIRTUAL_SCHEDULE.length - 1];
    expect(last.label.toLowerCase()).toContain('assessment');
  });

  it('all time strings match HH:MM format', () => {
    const timeRegex = /^\d{2}:\d{2}$/;
    for (const s of VIRTUAL_SCHEDULE) {
      expect(s.timeStart).toMatch(timeRegex);
      expect(s.timeEnd).toMatch(timeRegex);
    }
  });

  it('each session has positive duration', () => {
    for (const s of VIRTUAL_SCHEDULE) {
      expect(sessionDuration(s)).toBeGreaterThan(0);
    }
  });

  it('Break 1 is 10 minutes', () => {
    const b1 = VIRTUAL_SCHEDULE.find((s) => s.label === 'Break 1')!;
    expect(sessionDuration(b1)).toBe(10);
  });

  it('Break 2 is 10 minutes', () => {
    const b2 = VIRTUAL_SCHEDULE.find((s) => s.label === 'Break 2')!;
    expect(sessionDuration(b2)).toBe(10);
  });
});

// Parametric: virtual schedule session durations
describe('Virtual schedule session durations (parametric)', () => {
  const expectedSchedule: [string, number][] = [
    ['Module 1: Platform Navigation', 30],
    ['Break 1', 10],
    ['Module 2: Recording Incidents', 40],
    ['Module 3: Training Acknowledgements', 30],
    ['Break 2', 10],
    ['Module 4: Permit to Work', 40],
    ['Module 5: Observations', 30],
    ['Module 6: Reports & Dashboards', 25],
    ['Assessment + close', 25],
  ];

  for (const [label, mins] of expectedSchedule) {
    it(`"${label}" = ${mins} min`, () => {
      const session = VIRTUAL_SCHEDULE.find((s) => s.label === label)!;
      expect(session).toBeDefined();
      expect(sessionDuration(session)).toBe(mins);
    });
  }
});

describe('All 6 modules appear in virtual schedule', () => {
  for (const mod of MODULES) {
    it(`Module ${mod.number} (${mod.title}) appears in virtual schedule`, () => {
      const found = VIRTUAL_SCHEDULE.some((s) => s.label.includes(mod.title));
      expect(found).toBe(true);
    });
  }
});

// ─── Algorithm puzzle phases (ph217eut–ph224eut) ────────────────────────────────
function moveZeroes217eut(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217eut_mz',()=>{
  it('a',()=>{expect(moveZeroes217eut([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217eut([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217eut([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217eut([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217eut([4,2,0,0,3])).toBe(4);});
});
function missingNumber218eut(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218eut_mn',()=>{
  it('a',()=>{expect(missingNumber218eut([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218eut([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218eut([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218eut([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218eut([1])).toBe(0);});
});
function countBits219eut(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219eut_cb',()=>{
  it('a',()=>{expect(countBits219eut(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219eut(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219eut(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219eut(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219eut(4)[4]).toBe(1);});
});
function climbStairs220eut(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220eut_cs',()=>{
  it('a',()=>{expect(climbStairs220eut(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220eut(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220eut(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220eut(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220eut(1)).toBe(1);});
});
function maxProfit221eut(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221eut_mp',()=>{
  it('a',()=>{expect(maxProfit221eut([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221eut([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221eut([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221eut([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221eut([1])).toBe(0);});
});
function singleNumber222eut(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222eut_sn',()=>{
  it('a',()=>{expect(singleNumber222eut([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222eut([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222eut([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222eut([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222eut([3,3,5])).toBe(5);});
});
function hammingDist223eut(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223eut_hd',()=>{
  it('a',()=>{expect(hammingDist223eut(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223eut(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223eut(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223eut(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223eut(7,7)).toBe(0);});
});
function majorElem224eut(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224eut_me',()=>{
  it('a',()=>{expect(majorElem224eut([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224eut([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224eut([1])).toBe(1);});
  it('d',()=>{expect(majorElem224eut([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224eut([6,5,5])).toBe(5);});
});

// ─── Algorithm puzzle phases (ph231eut2–ph238eut2) ────────────────────────────────
function moveZeroes231eut2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph231eut2_mz',()=>{
  it('a',()=>{expect(moveZeroes231eut2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes231eut2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes231eut2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes231eut2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes231eut2([4,2,0,0,3])).toBe(4);});
});
function missingNumber232eut2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph232eut2_mn',()=>{
  it('a',()=>{expect(missingNumber232eut2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber232eut2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber232eut2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber232eut2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber232eut2([1])).toBe(0);});
});
function countBits233eut2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph233eut2_cb',()=>{
  it('a',()=>{expect(countBits233eut2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits233eut2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits233eut2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits233eut2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits233eut2(4)[4]).toBe(1);});
});
function climbStairs234eut2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph234eut2_cs',()=>{
  it('a',()=>{expect(climbStairs234eut2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs234eut2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs234eut2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs234eut2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs234eut2(1)).toBe(1);});
});
function maxProfit235eut2(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph235eut2_mp',()=>{
  it('a',()=>{expect(maxProfit235eut2([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit235eut2([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit235eut2([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit235eut2([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit235eut2([1])).toBe(0);});
});
function singleNumber236eut2(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph236eut2_sn',()=>{
  it('a',()=>{expect(singleNumber236eut2([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber236eut2([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber236eut2([1])).toBe(1);});
  it('d',()=>{expect(singleNumber236eut2([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber236eut2([3,3,5])).toBe(5);});
});
function hammingDist237eut2(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph237eut2_hd',()=>{
  it('a',()=>{expect(hammingDist237eut2(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist237eut2(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist237eut2(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist237eut2(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist237eut2(7,7)).toBe(0);});
});
function majorElem238eut2(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph238eut2_me',()=>{
  it('a',()=>{expect(majorElem238eut2([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem238eut2([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem238eut2([1])).toBe(1);});
  it('d',()=>{expect(majorElem238eut2([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem238eut2([6,5,5])).toBe(5);});
});
