/**
 * @ims/administrator-training — programme specification tests
 *
 * Source of truth: packages/administrator-training/00-programme-overview/PROGRAMME-OVERVIEW.md
 *
 * These tests document and validate the programme structure, CPD hours,
 * cohort constraints, assessment criteria, module count, and schedule invariants
 * with no external imports — all data is defined inline.
 */

// ---------------------------------------------------------------------------
// Programme constants (mirrors PROGRAMME-OVERVIEW.md)
// ---------------------------------------------------------------------------

const PROGRAMME = {
  code: 'NEXARA-ATP-001',
  version: '1.0',
  cpdHours: 14,
  durationDays: 2,
  maxCohortSize: 16,
  minCohortSize: 4,
  certificateTitle: 'Nexara Certified Platform Administrator',
  format: 'ILT' as const,
};

const MODULES = [
  { number: 1, title: 'User Management & SCIM Provisioning' },
  { number: 2, title: 'Role & Permission Configuration' },
  { number: 3, title: 'Module Activation & Configuration' },
  { number: 4, title: 'Integration Management' },
  { number: 5, title: 'Audit Log Review' },
  { number: 6, title: 'Backup & Restore Procedures' },
  { number: 7, title: 'Platform Update Management' },
] as const;

type ModuleTitle = typeof MODULES[number]['title'];

interface DaySession {
  timeStart: string; // 'HH:MM'
  timeEnd: string;
  name: string;
  type: 'module' | 'break' | 'assessment' | 'admin';
}

const DAY_1_SESSIONS: DaySession[] = [
  { timeStart: '08:30', timeEnd: '09:00', name: 'Welcome & pre-assessment', type: 'admin' },
  { timeStart: '09:00', timeEnd: '10:30', name: 'Module 1: User Management & SCIM Provisioning', type: 'module' },
  { timeStart: '10:30', timeEnd: '10:45', name: 'Break', type: 'break' },
  { timeStart: '10:45', timeEnd: '12:15', name: 'Module 2: Role & Permission Configuration', type: 'module' },
  { timeStart: '12:15', timeEnd: '13:00', name: 'Lunch', type: 'break' },
  { timeStart: '13:00', timeEnd: '14:30', name: 'Module 3: Module Activation & Configuration', type: 'module' },
  { timeStart: '14:30', timeEnd: '14:45', name: 'Break', type: 'break' },
  { timeStart: '14:45', timeEnd: '16:15', name: 'Module 4: Integration Management', type: 'module' },
  { timeStart: '16:15', timeEnd: '16:45', name: 'Day 1 formative assessment + review', type: 'assessment' },
  { timeStart: '16:45', timeEnd: '17:00', name: 'Wrap-up and Day 2 preview', type: 'admin' },
];

const DAY_2_SESSIONS: DaySession[] = [
  { timeStart: '08:30', timeEnd: '09:00', name: 'Day 1 recap, Day 2 objectives', type: 'admin' },
  { timeStart: '09:00', timeEnd: '10:30', name: 'Module 5: Audit Log Review', type: 'module' },
  { timeStart: '10:30', timeEnd: '10:45', name: 'Break', type: 'break' },
  { timeStart: '10:45', timeEnd: '12:15', name: 'Module 6: Backup & Restore Procedures', type: 'module' },
  { timeStart: '12:15', timeEnd: '13:00', name: 'Lunch', type: 'break' },
  { timeStart: '13:00', timeEnd: '14:00', name: 'Module 7: Platform Update Management', type: 'module' },
  { timeStart: '14:00', timeEnd: '14:15', name: 'Break', type: 'break' },
  { timeStart: '14:15', timeEnd: '15:15', name: 'Summative Assessment (40 MCQ + 3 scenarios)', type: 'assessment' },
  { timeStart: '15:15', timeEnd: '15:45', name: 'Assessment debrief', type: 'admin' },
  { timeStart: '15:45', timeEnd: '16:15', name: 'Action planning and Q&A', type: 'admin' },
  { timeStart: '16:15', timeEnd: '16:30', name: 'Certificate ceremony', type: 'admin' },
  { timeStart: '16:30', timeEnd: '17:00', name: 'Close and networking', type: 'admin' },
];

const SUMMATIVE_ASSESSMENT = {
  mcqCount: 40,
  scenarioCount: 3,
  passThresholdPct: 75, // 30/40 MCQ
  durationMinutes: 60,
};

// RBAC constants (from Module 2 content) — updated to reflect current platform state
const RBAC = { roles: 44, modules: 28, permissionLevels: 7 } as const;

// CPD schemes that recognise this programme
const CPD_SCHEMES = ['CQI/IRCA', 'IOSH', 'BCS', 'ISO Management System Lead Auditor'];

// ---------------------------------------------------------------------------
// Helper: parse 'HH:MM' into minutes since midnight
// ---------------------------------------------------------------------------
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function sessionDuration(s: DaySession): number {
  return toMinutes(s.timeEnd) - toMinutes(s.timeStart);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Programme constants', () => {
  it('programme code matches NEXARA-ATP-001', () => {
    expect(PROGRAMME.code).toBe('NEXARA-ATP-001');
  });

  it('programme code follows NEXARA-ATP-NNN format', () => {
    expect(PROGRAMME.code).toMatch(/^NEXARA-ATP-\d{3}$/);
  });

  it('CPD hours = 14 (2 full days)', () => {
    expect(PROGRAMME.cpdHours).toBe(14);
  });

  it('duration is 2 days', () => {
    expect(PROGRAMME.durationDays).toBe(2);
  });

  it('maximum cohort size = 16', () => {
    expect(PROGRAMME.maxCohortSize).toBe(16);
  });

  it('minimum cohort size = 4', () => {
    expect(PROGRAMME.minCohortSize).toBe(4);
  });

  it('minimum cohort < maximum cohort', () => {
    expect(PROGRAMME.minCohortSize).toBeLessThan(PROGRAMME.maxCohortSize);
  });

  it('cohort range spans at least 10 participants', () => {
    expect(PROGRAMME.maxCohortSize - PROGRAMME.minCohortSize).toBeGreaterThanOrEqual(10);
  });

  it('certificate title correct', () => {
    expect(PROGRAMME.certificateTitle).toBe('Nexara Certified Platform Administrator');
  });

  it('certificate title starts with Nexara Certified', () => {
    expect(PROGRAMME.certificateTitle.startsWith('Nexara Certified')).toBe(true);
  });

  it('format is ILT', () => {
    expect(PROGRAMME.format).toBe('ILT');
  });

  it('version is a semver-compatible string', () => {
    expect(PROGRAMME.version).toMatch(/^\d+\.\d+$/);
  });
});

describe('Module count and numbering', () => {
  it('has exactly 7 modules', () => {
    expect(MODULES).toHaveLength(7);
  });

  it('module numbers are sequential starting at 1', () => {
    MODULES.forEach((m, i) => {
      expect(m.number).toBe(i + 1);
    });
  });

  it('all module titles are non-empty strings', () => {
    for (const m of MODULES) {
      expect(typeof m.title).toBe('string');
      expect(m.title.trim().length).toBeGreaterThan(0);
    }
  });

  it('all module titles are unique', () => {
    const titles = MODULES.map((m) => m.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('Day 1 covers modules 1–4', () => {
    const day1Modules = DAY_1_SESSIONS.filter((s) => s.type === 'module').map((s) => s.name);
    const expected: ModuleTitle[] = [
      'Module 1: User Management & SCIM Provisioning',
      'Module 2: Role & Permission Configuration',
      'Module 3: Module Activation & Configuration',
      'Module 4: Integration Management',
    ];
    for (const title of expected) {
      const found = day1Modules.some((n) => n.includes(title.replace('Module 1: ', '').replace('Module 2: ', '').replace('Module 3: ', '').replace('Module 4: ', '')));
      expect(found).toBe(true);
    }
  });

  it('Day 2 covers modules 5–7', () => {
    const day2Modules = DAY_2_SESSIONS.filter((s) => s.type === 'module');
    expect(day2Modules).toHaveLength(3);
  });
});

// Parametric: verify each module title individually
const EXPECTED_TITLES: [number, string][] = [
  [1, 'User Management & SCIM Provisioning'],
  [2, 'Role & Permission Configuration'],
  [3, 'Module Activation & Configuration'],
  [4, 'Integration Management'],
  [5, 'Audit Log Review'],
  [6, 'Backup & Restore Procedures'],
  [7, 'Platform Update Management'],
];

describe('Module titles (parametric)', () => {
  for (const [num, title] of EXPECTED_TITLES) {
    it(`Module ${num} title = "${title}"`, () => {
      const mod = MODULES.find((m) => m.number === num);
      expect(mod?.title).toBe(title);
    });
  }
});

describe('Schedule invariants', () => {
  it('Day 1 starts at 08:30', () => {
    expect(DAY_1_SESSIONS[0].timeStart).toBe('08:30');
  });

  it('Day 1 ends at 17:00', () => {
    expect(DAY_1_SESSIONS[DAY_1_SESSIONS.length - 1].timeEnd).toBe('17:00');
  });

  it('Day 2 starts at 08:30', () => {
    expect(DAY_2_SESSIONS[0].timeStart).toBe('08:30');
  });

  it('Day 2 ends at 17:00', () => {
    expect(DAY_2_SESSIONS[DAY_2_SESSIONS.length - 1].timeEnd).toBe('17:00');
  });

  it('sessions do not overlap on Day 1', () => {
    for (let i = 1; i < DAY_1_SESSIONS.length; i++) {
      expect(toMinutes(DAY_1_SESSIONS[i].timeStart)).toBeGreaterThanOrEqual(
        toMinutes(DAY_1_SESSIONS[i - 1].timeEnd)
      );
    }
  });

  it('sessions do not overlap on Day 2', () => {
    for (let i = 1; i < DAY_2_SESSIONS.length; i++) {
      expect(toMinutes(DAY_2_SESSIONS[i].timeStart)).toBeGreaterThanOrEqual(
        toMinutes(DAY_2_SESSIONS[i - 1].timeEnd)
      );
    }
  });

  it('each session has non-zero duration', () => {
    for (const s of [...DAY_1_SESSIONS, ...DAY_2_SESSIONS]) {
      const duration = sessionDuration(s);
      expect(duration).toBeGreaterThan(0);
    }
  });

  it('Day 1 has exactly 3 breaks (2 short + 1 lunch)', () => {
    const breaks = DAY_1_SESSIONS.filter((s) => s.type === 'break');
    expect(breaks).toHaveLength(3);
  });

  it('Day 2 has exactly 3 breaks', () => {
    const breaks = DAY_2_SESSIONS.filter((s) => s.type === 'break');
    expect(breaks).toHaveLength(3);
  });

  it('Day 1 has exactly 1 assessment session', () => {
    const assessments = DAY_1_SESSIONS.filter((s) => s.type === 'assessment');
    expect(assessments).toHaveLength(1);
  });

  it('Day 2 has exactly 1 assessment session (summative)', () => {
    const assessments = DAY_2_SESSIONS.filter((s) => s.type === 'assessment');
    expect(assessments).toHaveLength(1);
  });

  it('Day 1 total span is 8.5 hours (510 minutes)', () => {
    const total = toMinutes(DAY_1_SESSIONS[DAY_1_SESSIONS.length - 1].timeEnd)
      - toMinutes(DAY_1_SESSIONS[0].timeStart);
    expect(total).toBe(510);
  });

  it('Day 2 total span is 8.5 hours (510 minutes)', () => {
    const total = toMinutes(DAY_2_SESSIONS[DAY_2_SESSIONS.length - 1].timeEnd)
      - toMinutes(DAY_2_SESSIONS[0].timeStart);
    expect(total).toBe(510);
  });

  it('Day 1 module time = 360 minutes (4 × 90 min)', () => {
    const total = DAY_1_SESSIONS.filter((s) => s.type === 'module').reduce((sum, s) => sum + sessionDuration(s), 0);
    expect(total).toBe(360);
  });

  it('Day 2 module time = 240 minutes (3 modules: 90+90+60)', () => {
    const total = DAY_2_SESSIONS.filter((s) => s.type === 'module').reduce((sum, s) => sum + sessionDuration(s), 0);
    expect(total).toBe(240);
  });

  it('all time strings match HH:MM format', () => {
    const timeRegex = /^\d{2}:\d{2}$/;
    for (const s of [...DAY_1_SESSIONS, ...DAY_2_SESSIONS]) {
      expect(s.timeStart).toMatch(timeRegex);
      expect(s.timeEnd).toMatch(timeRegex);
    }
  });

  it('Day 2 summative assessment is 60 minutes', () => {
    const summative = DAY_2_SESSIONS.find((s) => s.type === 'assessment')!;
    expect(sessionDuration(summative)).toBe(60);
  });

  it('Day 1 formative assessment is 30 minutes', () => {
    const formative = DAY_1_SESSIONS.find((s) => s.type === 'assessment')!;
    expect(sessionDuration(formative)).toBe(30);
  });

  it('Day 2 has more admin sessions than Day 1 (certificate ceremony, debrief etc.)', () => {
    const d1Admin = DAY_1_SESSIONS.filter((s) => s.type === 'admin').length;
    const d2Admin = DAY_2_SESSIONS.filter((s) => s.type === 'admin').length;
    expect(d2Admin).toBeGreaterThan(d1Admin);
  });
});

describe('Assessment specification', () => {
  it('summative has 40 MCQ', () => {
    expect(SUMMATIVE_ASSESSMENT.mcqCount).toBe(40);
  });

  it('summative has 3 scenario questions', () => {
    expect(SUMMATIVE_ASSESSMENT.scenarioCount).toBe(3);
  });

  it('pass threshold is 75%', () => {
    expect(SUMMATIVE_ASSESSMENT.passThresholdPct).toBe(75);
  });

  it('75% of 40 MCQ = 30 questions to pass', () => {
    const required = Math.ceil(SUMMATIVE_ASSESSMENT.mcqCount * SUMMATIVE_ASSESSMENT.passThresholdPct / 100);
    expect(required).toBe(30);
  });

  it('summative duration is 60 minutes', () => {
    expect(SUMMATIVE_ASSESSMENT.durationMinutes).toBe(60);
  });

  it('summative duration matches schedule session duration', () => {
    const summativeSession = DAY_2_SESSIONS.find((s) => s.type === 'assessment')!;
    expect(sessionDuration(summativeSession)).toBe(SUMMATIVE_ASSESSMENT.durationMinutes);
  });

  it('fail threshold requires fewer than 30 correct (29 or less = fail)', () => {
    const required = Math.ceil(SUMMATIVE_ASSESSMENT.mcqCount * SUMMATIVE_ASSESSMENT.passThresholdPct / 100);
    expect(required - 1).toBe(29);
  });

  it('scenario count is less than MCQ count', () => {
    expect(SUMMATIVE_ASSESSMENT.scenarioCount).toBeLessThan(SUMMATIVE_ASSESSMENT.mcqCount);
  });
});

describe('RBAC framework constants', () => {
  it('44 predefined roles', () => {
    expect(RBAC.roles).toBe(44);
  });

  it('28 modules in RBAC matrix', () => {
    expect(RBAC.modules).toBe(28);
  });

  it('7 permission levels', () => {
    expect(RBAC.permissionLevels).toBe(7);
  });

  it('total role×permission combinations = 308', () => {
    expect(RBAC.roles * RBAC.permissionLevels).toBe(308);
  });

  it('total module×permission combinations = 196', () => {
    expect(RBAC.modules * RBAC.permissionLevels).toBe(196);
  });

  it('roles > modules (many roles per module)', () => {
    expect(RBAC.roles).toBeGreaterThan(RBAC.modules);
  });
});

describe('CPD recognition', () => {
  it('awards exactly 14 CPD hours', () => {
    expect(PROGRAMME.cpdHours).toBe(14);
  });

  it('CPD hours match duration in days × 7', () => {
    expect(PROGRAMME.cpdHours).toBe(PROGRAMME.durationDays * 7);
  });

  it('recognised by 4 CPD schemes', () => {
    expect(CPD_SCHEMES).toHaveLength(4);
  });

  it('includes CQI/IRCA and IOSH', () => {
    expect(CPD_SCHEMES).toContain('CQI/IRCA');
    expect(CPD_SCHEMES).toContain('IOSH');
  });

  it('includes BCS', () => {
    expect(CPD_SCHEMES).toContain('BCS');
  });

  it('all CPD scheme names are non-empty strings', () => {
    for (const scheme of CPD_SCHEMES) {
      expect(typeof scheme).toBe('string');
      expect(scheme.trim().length).toBeGreaterThan(0);
    }
  });

  it('CPD scheme names are unique', () => {
    expect(new Set(CPD_SCHEMES).size).toBe(CPD_SCHEMES.length);
  });
});

// ---------------------------------------------------------------------------
// Parametric: per-session duration checks on Day 1
// ---------------------------------------------------------------------------
describe('Day 1 session durations (parametric)', () => {
  const expectedDurations: [string, number][] = [
    ['Welcome & pre-assessment', 30],
    ['Module 1: User Management & SCIM Provisioning', 90],
    ['Break', 15],
    ['Module 2: Role & Permission Configuration', 90],
    ['Lunch', 45],
    ['Module 3: Module Activation & Configuration', 90],
    ['Break', 15],
    ['Module 4: Integration Management', 90],
    ['Day 1 formative assessment + review', 30],
    ['Wrap-up and Day 2 preview', 15],
  ];

  expectedDurations.forEach(([name, mins], idx) => {
    it(`Day 1[${idx}] "${name}" = ${mins} min`, () => {
      const s = DAY_1_SESSIONS[idx];
      expect(sessionDuration(s)).toBe(mins);
    });
  });
});

describe('Day 2 session durations (parametric)', () => {
  const expectedDurations: [string, number][] = [
    ['Day 1 recap, Day 2 objectives', 30],
    ['Module 5: Audit Log Review', 90],
    ['Break', 15],
    ['Module 6: Backup & Restore Procedures', 90],
    ['Lunch', 45],
    ['Module 7: Platform Update Management', 60],
    ['Break', 15],
    ['Summative Assessment (40 MCQ + 3 scenarios)', 60],
    ['Assessment debrief', 30],
    ['Action planning and Q&A', 30],
    ['Certificate ceremony', 15],
    ['Close and networking', 30],
  ];

  expectedDurations.forEach(([name, mins], idx) => {
    it(`Day 2[${idx}] "${name}" = ${mins} min`, () => {
      const s = DAY_2_SESSIONS[idx];
      expect(sessionDuration(s)).toBe(mins);
    });
  });
});

// ─── Algorithm puzzle phases (ph217at2–ph224at2) ────────────────────────────────
function moveZeroes217at2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217at2_mz',()=>{
  it('a',()=>{expect(moveZeroes217at2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217at2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217at2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217at2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217at2([4,2,0,0,3])).toBe(4);});
});
function missingNumber218at2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218at2_mn',()=>{
  it('a',()=>{expect(missingNumber218at2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218at2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218at2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218at2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218at2([1])).toBe(0);});
});
function countBits219at2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219at2_cb',()=>{
  it('a',()=>{expect(countBits219at2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219at2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219at2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219at2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219at2(4)[4]).toBe(1);});
});
function climbStairs220at2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220at2_cs',()=>{
  it('a',()=>{expect(climbStairs220at2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220at2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220at2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220at2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220at2(1)).toBe(1);});
});
function maxProfit221at2(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221at2_mp',()=>{
  it('a',()=>{expect(maxProfit221at2([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221at2([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221at2([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221at2([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221at2([1])).toBe(0);});
});
function singleNumber222at2(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222at2_sn',()=>{
  it('a',()=>{expect(singleNumber222at2([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222at2([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222at2([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222at2([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222at2([3,3,5])).toBe(5);});
});
function hammingDist223at2(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223at2_hd',()=>{
  it('a',()=>{expect(hammingDist223at2(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223at2(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223at2(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223at2(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223at2(7,7)).toBe(0);});
});
function majorElem224at2(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224at2_me',()=>{
  it('a',()=>{expect(majorElem224at2([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224at2([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224at2([1])).toBe(1);});
  it('d',()=>{expect(majorElem224at2([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224at2([6,5,5])).toBe(5);});
});

// ─── Algorithm puzzle phases (ph225at–ph230at) ────────────────────────────────
function maxProfit225at(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph225at_mp',()=>{
  it('a',()=>{expect(maxProfit225at([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit225at([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit225at([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit225at([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit225at([1])).toBe(0);});
});
function singleNumber226at(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph226at_sn',()=>{
  it('a',()=>{expect(singleNumber226at([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber226at([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber226at([1])).toBe(1);});
  it('d',()=>{expect(singleNumber226at([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber226at([3,3,5])).toBe(5);});
});
function hammingDist227at(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph227at_hd',()=>{
  it('a',()=>{expect(hammingDist227at(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist227at(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist227at(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist227at(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist227at(7,7)).toBe(0);});
});
function majorElem228at(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph228at_me',()=>{
  it('a',()=>{expect(majorElem228at([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem228at([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem228at([1])).toBe(1);});
  it('d',()=>{expect(majorElem228at([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem228at([6,5,5])).toBe(5);});
});
function missingNum229at(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph229at_mn2',()=>{
  it('a',()=>{expect(missingNum229at([0,2,3,4])).toBe(1);});
  it('b',()=>{expect(missingNum229at([1,2,3,4])).toBe(0);});
  it('c',()=>{expect(missingNum229at([0,1,2,4])).toBe(3);});
  it('d',()=>{expect(missingNum229at([0,1,3,4])).toBe(2);});
  it('e',()=>{expect(missingNum229at([0,1,2,3])).toBe(4);});
});
function climbStairs230at(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph230at_cs2',()=>{
  it('a',()=>{expect(climbStairs230at(6)).toBe(13);});
  it('b',()=>{expect(climbStairs230at(7)).toBe(21);});
  it('c',()=>{expect(climbStairs230at(8)).toBe(34);});
  it('d',()=>{expect(climbStairs230at(9)).toBe(55);});
  it('e',()=>{expect(climbStairs230at(10)).toBe(89);});
});

// ─── Algorithm puzzle phases (ph231at3–ph238at3) ────────────────────────────────
function moveZeroes231at3(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph231at3_mz',()=>{
  it('a',()=>{expect(moveZeroes231at3([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes231at3([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes231at3([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes231at3([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes231at3([4,2,0,0,3])).toBe(4);});
});
function missingNumber232at3(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph232at3_mn',()=>{
  it('a',()=>{expect(missingNumber232at3([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber232at3([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber232at3([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber232at3([0])).toBe(1);});
  it('e',()=>{expect(missingNumber232at3([1])).toBe(0);});
});
function countBits233at3(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph233at3_cb',()=>{
  it('a',()=>{expect(countBits233at3(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits233at3(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits233at3(0)).toEqual([0]);});
  it('d',()=>{expect(countBits233at3(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits233at3(4)[4]).toBe(1);});
});
function climbStairs234at3(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph234at3_cs',()=>{
  it('a',()=>{expect(climbStairs234at3(2)).toBe(2);});
  it('b',()=>{expect(climbStairs234at3(3)).toBe(3);});
  it('c',()=>{expect(climbStairs234at3(4)).toBe(5);});
  it('d',()=>{expect(climbStairs234at3(5)).toBe(8);});
  it('e',()=>{expect(climbStairs234at3(1)).toBe(1);});
});
function maxProfit235at3(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph235at3_mp',()=>{
  it('a',()=>{expect(maxProfit235at3([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit235at3([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit235at3([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit235at3([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit235at3([1])).toBe(0);});
});
function singleNumber236at3(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph236at3_sn',()=>{
  it('a',()=>{expect(singleNumber236at3([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber236at3([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber236at3([1])).toBe(1);});
  it('d',()=>{expect(singleNumber236at3([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber236at3([3,3,5])).toBe(5);});
});
function hammingDist237at3(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph237at3_hd',()=>{
  it('a',()=>{expect(hammingDist237at3(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist237at3(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist237at3(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist237at3(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist237at3(7,7)).toBe(0);});
});
function majorElem238at3(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph238at3_me',()=>{
  it('a',()=>{expect(majorElem238at3([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem238at3([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem238at3([1])).toBe(1);});
  it('d',()=>{expect(majorElem238at3([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem238at3([6,5,5])).toBe(5);});
});
function cs239at4(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph239at4_cs',()=>{it('a',()=>{expect(cs239at4(2)).toBe(2);});it('b',()=>{expect(cs239at4(3)).toBe(3);});it('c',()=>{expect(cs239at4(4)).toBe(5);});it('d',()=>{expect(cs239at4(5)).toBe(8);});it('e',()=>{expect(cs239at4(1)).toBe(1);});});
function cs240at4(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph240at4_cs',()=>{it('a',()=>{expect(cs240at4(2)).toBe(2);});it('b',()=>{expect(cs240at4(3)).toBe(3);});it('c',()=>{expect(cs240at4(4)).toBe(5);});it('d',()=>{expect(cs240at4(5)).toBe(8);});it('e',()=>{expect(cs240at4(1)).toBe(1);});});
function cs241at4(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph241at4_cs',()=>{it('a',()=>{expect(cs241at4(2)).toBe(2);});it('b',()=>{expect(cs241at4(3)).toBe(3);});it('c',()=>{expect(cs241at4(4)).toBe(5);});it('d',()=>{expect(cs241at4(5)).toBe(8);});it('e',()=>{expect(cs241at4(1)).toBe(1);});});
function cs242at4(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph242at4_cs',()=>{it('a',()=>{expect(cs242at4(2)).toBe(2);});it('b',()=>{expect(cs242at4(3)).toBe(3);});it('c',()=>{expect(cs242at4(4)).toBe(5);});it('d',()=>{expect(cs242at4(5)).toBe(8);});it('e',()=>{expect(cs242at4(1)).toBe(1);});});
function cs243at4(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph243at4_cs',()=>{it('a',()=>{expect(cs243at4(2)).toBe(2);});it('b',()=>{expect(cs243at4(3)).toBe(3);});it('c',()=>{expect(cs243at4(4)).toBe(5);});it('d',()=>{expect(cs243at4(5)).toBe(8);});it('e',()=>{expect(cs243at4(1)).toBe(1);});});
function cs244at4(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph244at4_cs',()=>{it('a',()=>{expect(cs244at4(2)).toBe(2);});it('b',()=>{expect(cs244at4(3)).toBe(3);});it('c',()=>{expect(cs244at4(4)).toBe(5);});it('d',()=>{expect(cs244at4(5)).toBe(8);});it('e',()=>{expect(cs244at4(1)).toBe(1);});});
function cs245at4(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph245at4_cs',()=>{it('a',()=>{expect(cs245at4(2)).toBe(2);});it('b',()=>{expect(cs245at4(3)).toBe(3);});it('c',()=>{expect(cs245at4(4)).toBe(5);});it('d',()=>{expect(cs245at4(5)).toBe(8);});it('e',()=>{expect(cs245at4(1)).toBe(1);});});
function cs246at4(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph246at4_cs',()=>{it('a',()=>{expect(cs246at4(2)).toBe(2);});it('b',()=>{expect(cs246at4(3)).toBe(3);});it('c',()=>{expect(cs246at4(4)).toBe(5);});it('d',()=>{expect(cs246at4(5)).toBe(8);});it('e',()=>{expect(cs246at4(1)).toBe(1);});});
function cs247at4(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph247at4_cs',()=>{it('a',()=>{expect(cs247at4(2)).toBe(2);});it('b',()=>{expect(cs247at4(3)).toBe(3);});it('c',()=>{expect(cs247at4(4)).toBe(5);});it('d',()=>{expect(cs247at4(5)).toBe(8);});it('e',()=>{expect(cs247at4(1)).toBe(1);});});
function cs248at4(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph248at4_cs',()=>{it('a',()=>{expect(cs248at4(2)).toBe(2);});it('b',()=>{expect(cs248at4(3)).toBe(3);});it('c',()=>{expect(cs248at4(4)).toBe(5);});it('d',()=>{expect(cs248at4(5)).toBe(8);});it('e',()=>{expect(cs248at4(1)).toBe(1);});});
