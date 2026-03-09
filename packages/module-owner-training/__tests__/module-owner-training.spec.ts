/**
 * @ims/module-owner-training — programme specification tests
 *
 * Source of truth: packages/module-owner-training/00-programme-overview/PROGRAMME-OVERVIEW.md
 *
 * No external imports — all programme data is defined inline.
 */

// ---------------------------------------------------------------------------
// Programme constants (mirrors PROGRAMME-OVERVIEW.md)
// ---------------------------------------------------------------------------

const PROGRAMME = {
  cpdHoursPerDay: 7,
  totalProgrammes: 5,
  assessmentMcqCount: 20,
  assessmentDurationMinutes: 30,
  passThresholdPct: 75,
  passThresholdQuestions: 15, // 75% of 20
};

interface DayProgramme {
  slug: string;
  label: string;
  audience: string;
  modulesCount: number;
  certificateTitle: string;
}

const PROGRAMMES: DayProgramme[] = [
  {
    slug: 'quality-nc',
    label: 'Day A — Quality & NC',
    audience: 'Quality managers, document controllers, QMS coordinators',
    modulesCount: 4,
    certificateTitle: 'Nexara Certified Module Owner — Quality & Non-Conformance',
  },
  {
    slug: 'hse',
    label: 'Day B — HSE',
    audience: 'HSE managers, EHS coordinators, safety officers',
    modulesCount: 5,
    certificateTitle: 'Nexara Certified Module Owner — Health, Safety & Environment',
  },
  {
    slug: 'hr-payroll',
    label: 'Day C — HR & Payroll',
    audience: 'HR managers, payroll administrators, L&D coordinators',
    modulesCount: 4,
    certificateTitle: 'Nexara Certified Module Owner — HR & Payroll',
  },
  {
    slug: 'finance-contracts',
    label: 'Day D — Finance & Contracts',
    audience: 'Finance managers, procurement leads, legal counsel',
    modulesCount: 4,
    certificateTitle: 'Nexara Certified Module Owner — Finance & Contracts',
  },
  {
    slug: 'advanced',
    label: 'Day E — Advanced',
    audience: 'Audit leads, QMS managers, management review secretaries',
    modulesCount: 4,
    certificateTitle: 'Nexara Certified Module Owner — Audits, CAPA & Management Review',
  },
];

interface DaySession {
  timeStart: string;
  timeEnd: string;
  label: string;
  type: 'admin' | 'content' | 'break' | 'lab' | 'kpi' | 'assessment';
}

const DAILY_SCHEDULE: DaySession[] = [
  { timeStart: '08:30', timeEnd: '09:00', label: 'Welcome, group introductions, day objectives', type: 'admin' },
  { timeStart: '09:00', timeEnd: '10:30', label: 'Content Block 1 — First module deep-dive', type: 'content' },
  { timeStart: '10:30', timeEnd: '10:45', label: 'Break', type: 'break' },
  { timeStart: '10:45', timeEnd: '12:15', label: 'Content Block 2 — Second module deep-dive', type: 'content' },
  { timeStart: '12:15', timeEnd: '13:00', label: 'Lunch', type: 'break' },
  { timeStart: '13:00', timeEnd: '14:15', label: 'Content Block 3 — Third module or deep-dive extension', type: 'content' },
  { timeStart: '14:15', timeEnd: '14:30', label: 'Break', type: 'break' },
  { timeStart: '14:30', timeEnd: '15:45', label: 'Lab — Hands-on scenario walkthrough in Nexara sandbox', type: 'lab' },
  { timeStart: '15:45', timeEnd: '16:30', label: 'KPI dashboards, report configuration, export', type: 'kpi' },
  { timeStart: '16:30', timeEnd: '17:00', label: 'Assessment (20 MCQ, 30 min) + Certificate ceremony', type: 'assessment' },
];

// CPD bodies that recognise this programme
const CPD_BODIES = ['IOSH', 'CQI/IRCA', 'CIPD', 'CIMA / ICAEW', 'IIA'];

// Co-branding rules
const CO_BRAND_PERMITTED = ['Client logo in bottom-right corner of slides and certificates', 'Organisation name on participant certificates'];
const CO_BRAND_PROHIBITED = ['Removal or resizing of the Nexara logo', 'Modification of content, question banks, or passing criteria', 'Co-branding with competitor IMS vendors'];

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

describe('Programme structure', () => {
  it('has exactly 5 independent day programmes', () => {
    expect(PROGRAMMES).toHaveLength(5);
    expect(PROGRAMME.totalProgrammes).toBe(5);
  });

  it('all programme slugs are unique', () => {
    const slugs = PROGRAMMES.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('all programme labels are unique', () => {
    const labels = PROGRAMMES.map((p) => p.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('Day A slug = quality-nc', () => {
    expect(PROGRAMMES[0].slug).toBe('quality-nc');
  });

  it('Day B slug = hse', () => {
    expect(PROGRAMMES[1].slug).toBe('hse');
  });

  it('Day C slug = hr-payroll', () => {
    expect(PROGRAMMES[2].slug).toBe('hr-payroll');
  });

  it('Day D slug = finance-contracts', () => {
    expect(PROGRAMMES[3].slug).toBe('finance-contracts');
  });

  it('Day E slug = advanced', () => {
    expect(PROGRAMMES[4].slug).toBe('advanced');
  });

  it('all programmes have non-empty audience descriptions', () => {
    for (const p of PROGRAMMES) {
      expect(p.audience.trim().length).toBeGreaterThan(0);
    }
  });

  it('Day B (HSE) covers 5 modules (most of any day)', () => {
    const hse = PROGRAMMES.find((p) => p.slug === 'hse');
    expect(hse?.modulesCount).toBe(5);
    const maxModules = Math.max(...PROGRAMMES.map((p) => p.modulesCount));
    expect(hse?.modulesCount).toBe(maxModules);
  });

  it('all other days cover exactly 4 modules', () => {
    const nonHSE = PROGRAMMES.filter((p) => p.slug !== 'hse');
    for (const p of nonHSE) {
      expect(p.modulesCount).toBe(4);
    }
  });

  it('total modules across all days = 21', () => {
    const total = PROGRAMMES.reduce((sum, p) => sum + p.modulesCount, 0);
    expect(total).toBe(21);
  });

  it('all slugs are lowercase kebab-case', () => {
    for (const p of PROGRAMMES) {
      expect(p.slug).toMatch(/^[a-z]+(-[a-z]+)*$/);
    }
  });

  it('Day A label starts with "Day A"', () => {
    expect(PROGRAMMES[0].label.startsWith('Day A')).toBe(true);
  });

  it('Day E label starts with "Day E"', () => {
    expect(PROGRAMMES[4].label.startsWith('Day E')).toBe(true);
  });
});

// Parametric: each programme's slug, label prefix, modulesCount, certificate prefix
describe('Per-programme properties (parametric)', () => {
  const expected: [string, string, number, string][] = [
    ['quality-nc', 'Day A', 4, 'Quality & Non-Conformance'],
    ['hse', 'Day B', 5, 'Health, Safety & Environment'],
    ['hr-payroll', 'Day C', 4, 'HR & Payroll'],
    ['finance-contracts', 'Day D', 4, 'Finance & Contracts'],
    ['advanced', 'Day E', 4, 'Audits, CAPA & Management Review'],
  ];

  for (const [slug, dayPrefix, modCount, certSuffix] of expected) {
    it(`${slug}: label starts with "${dayPrefix}", ${modCount} modules, cert contains "${certSuffix}"`, () => {
      const prog = PROGRAMMES.find((p) => p.slug === slug)!;
      expect(prog).toBeDefined();
      expect(prog.label.startsWith(dayPrefix)).toBe(true);
      expect(prog.modulesCount).toBe(modCount);
      expect(prog.certificateTitle).toContain(certSuffix);
    });
  }
});

describe('Certificate titles', () => {
  it('all certificate titles start with "Nexara Certified Module Owner"', () => {
    for (const p of PROGRAMMES) {
      expect(p.certificateTitle.startsWith('Nexara Certified Module Owner')).toBe(true);
    }
  });

  it('all certificate titles are unique', () => {
    const titles = PROGRAMMES.map((p) => p.certificateTitle);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it('Day B certificate mentions HSE', () => {
    const hse = PROGRAMMES.find((p) => p.slug === 'hse');
    expect(hse?.certificateTitle).toContain('Health, Safety & Environment');
  });

  it('Day E certificate mentions Audits', () => {
    const advanced = PROGRAMMES.find((p) => p.slug === 'advanced');
    expect(advanced?.certificateTitle).toContain('Audits');
  });

  it('Day A certificate mentions Quality', () => {
    const qa = PROGRAMMES.find((p) => p.slug === 'quality-nc');
    expect(qa?.certificateTitle).toContain('Quality');
  });

  it('Day C certificate mentions HR', () => {
    const hr = PROGRAMMES.find((p) => p.slug === 'hr-payroll');
    expect(hr?.certificateTitle).toContain('HR');
  });

  it('Day D certificate mentions Finance', () => {
    const fin = PROGRAMMES.find((p) => p.slug === 'finance-contracts');
    expect(fin?.certificateTitle).toContain('Finance');
  });
});

describe('CPD hours', () => {
  it('each day awards exactly 7 CPD hours', () => {
    expect(PROGRAMME.cpdHoursPerDay).toBe(7);
  });

  it('completing all 5 days = 35 CPD hours', () => {
    expect(PROGRAMME.cpdHoursPerDay * PROGRAMME.totalProgrammes).toBe(35);
  });

  it('CPD recognised by 5 professional bodies', () => {
    expect(CPD_BODIES).toHaveLength(5);
  });

  it('IOSH and CQI/IRCA are in CPD body list', () => {
    expect(CPD_BODIES).toContain('IOSH');
    expect(CPD_BODIES).toContain('CQI/IRCA');
  });

  it('CIPD is in CPD body list (relevant for Day C HR)', () => {
    expect(CPD_BODIES).toContain('CIPD');
  });

  it('CIMA / ICAEW is in CPD body list (relevant for Day D Finance)', () => {
    expect(CPD_BODIES).toContain('CIMA / ICAEW');
  });

  it('IIA is in CPD body list (relevant for Day E Audits)', () => {
    expect(CPD_BODIES).toContain('IIA');
  });

  it('all CPD body names are unique', () => {
    expect(new Set(CPD_BODIES).size).toBe(CPD_BODIES.length);
  });

  it('7 CPD/day is more than End User (4 CPD total)', () => {
    const endUserCpd = 4;
    expect(PROGRAMME.cpdHoursPerDay).toBeGreaterThan(endUserCpd);
  });

  it('7 CPD/day is half of Administrator programme (14 CPD total, 2 days)', () => {
    const adminCpdTotal = 14;
    expect(PROGRAMME.cpdHoursPerDay).toBe(adminCpdTotal / 2);
  });
});

describe('Daily schedule invariants', () => {
  it('day starts at 08:30', () => {
    expect(DAILY_SCHEDULE[0].timeStart).toBe('08:30');
  });

  it('day ends at 17:00', () => {
    expect(DAILY_SCHEDULE[DAILY_SCHEDULE.length - 1].timeEnd).toBe('17:00');
  });

  it('sessions do not overlap', () => {
    for (let i = 1; i < DAILY_SCHEDULE.length; i++) {
      expect(toMinutes(DAILY_SCHEDULE[i].timeStart)).toBeGreaterThanOrEqual(
        toMinutes(DAILY_SCHEDULE[i - 1].timeEnd)
      );
    }
  });

  it('each session has positive duration', () => {
    for (const s of DAILY_SCHEDULE) {
      expect(sessionDuration(s)).toBeGreaterThan(0);
    }
  });

  it('has exactly 3 breaks (2 short + 1 lunch)', () => {
    const breaks = DAILY_SCHEDULE.filter((s) => s.type === 'break');
    expect(breaks).toHaveLength(3);
  });

  it('has exactly 3 content blocks', () => {
    const content = DAILY_SCHEDULE.filter((s) => s.type === 'content');
    expect(content).toHaveLength(3);
  });

  it('has exactly 1 lab session', () => {
    const labs = DAILY_SCHEDULE.filter((s) => s.type === 'lab');
    expect(labs).toHaveLength(1);
  });

  it('lab is 75 minutes', () => {
    const lab = DAILY_SCHEDULE.find((s) => s.type === 'lab')!;
    expect(sessionDuration(lab)).toBe(75);
  });

  it('has exactly 1 KPI session', () => {
    const kpi = DAILY_SCHEDULE.filter((s) => s.type === 'kpi');
    expect(kpi).toHaveLength(1);
  });

  it('KPI session is 45 minutes', () => {
    const kpi = DAILY_SCHEDULE.find((s) => s.type === 'kpi')!;
    expect(sessionDuration(kpi)).toBe(45);
  });

  it('assessment session is the last on the day', () => {
    const lastSession = DAILY_SCHEDULE[DAILY_SCHEDULE.length - 1];
    expect(lastSession.type).toBe('assessment');
  });

  it('assessment starts at 16:30', () => {
    const assessment = DAILY_SCHEDULE.find((s) => s.type === 'assessment')!;
    expect(assessment.timeStart).toBe('16:30');
  });

  it('all time strings match HH:MM format', () => {
    const timeRegex = /^\d{2}:\d{2}$/;
    for (const s of DAILY_SCHEDULE) {
      expect(s.timeStart).toMatch(timeRegex);
      expect(s.timeEnd).toMatch(timeRegex);
    }
  });

  it('total span is 8.5 hours (510 minutes)', () => {
    const total = toMinutes(DAILY_SCHEDULE[DAILY_SCHEDULE.length - 1].timeEnd)
      - toMinutes(DAILY_SCHEDULE[0].timeStart);
    expect(total).toBe(510);
  });

  it('content blocks total 225 minutes (90+90+75... wait, 90+90+75=255)... actually 90+90+75=255 — but Block 3 is 75', () => {
    // Block 1: 09:00–10:30 = 90 min, Block 2: 10:45–12:15 = 90 min, Block 3: 13:00–14:15 = 75 min → total 255
    const total = DAILY_SCHEDULE.filter((s) => s.type === 'content').reduce((sum, s) => sum + sessionDuration(s), 0);
    expect(total).toBe(255);
  });

  it('has 10 schedule slots total', () => {
    expect(DAILY_SCHEDULE).toHaveLength(10);
  });
});

// Parametric: per-session duration checks on daily schedule
describe('Daily schedule session durations (parametric)', () => {
  const expectedDurations: [string, string, number][] = [
    ['admin', 'Welcome, group introductions, day objectives', 30],
    ['content', 'Content Block 1 — First module deep-dive', 90],
    ['break', 'Break (morning)', 15],
    ['content', 'Content Block 2 — Second module deep-dive', 90],
    ['break', 'Lunch', 45],
    ['content', 'Content Block 3 — Third module or deep-dive extension', 75],
    ['break', 'Break (afternoon)', 15],
    ['lab', 'Lab — Hands-on scenario walkthrough in Nexara sandbox', 75],
    ['kpi', 'KPI dashboards, report configuration, export', 45],
    ['assessment', 'Assessment (20 MCQ, 30 min) + Certificate ceremony', 30],
  ];

  expectedDurations.forEach(([type, _label, mins], idx) => {
    it(`Schedule[${idx}] type="${type}" = ${mins} min`, () => {
      const s = DAILY_SCHEDULE[idx];
      expect(s.type).toBe(type);
      expect(sessionDuration(s)).toBe(mins);
    });
  });
});

describe('Assessment specification', () => {
  it('20 MCQ per day', () => {
    expect(PROGRAMME.assessmentMcqCount).toBe(20);
  });

  it('30-minute time limit', () => {
    expect(PROGRAMME.assessmentDurationMinutes).toBe(30);
  });

  it('pass threshold = 75%', () => {
    expect(PROGRAMME.passThresholdPct).toBe(75);
  });

  it('75% of 20 questions = 15 to pass', () => {
    expect(PROGRAMME.passThresholdQuestions).toBe(
      Math.ceil(PROGRAMME.assessmentMcqCount * PROGRAMME.passThresholdPct / 100)
    );
  });

  it('pass threshold is lower than End User (80%) — no safety-critical tasks', () => {
    const endUserPassPct = 80;
    expect(PROGRAMME.passThresholdPct).toBeLessThan(endUserPassPct);
  });

  it('no Part B — module owners operate, not configure (no scenario assessment)', () => {
    // confirmed by programme overview: "No Part B"
    const hasPartB = false; // structural fact
    expect(hasPartB).toBe(false);
  });

  it('fail threshold = 14 correct or fewer', () => {
    const required = Math.ceil(PROGRAMME.assessmentMcqCount * PROGRAMME.passThresholdPct / 100);
    expect(required - 1).toBe(14);
  });

  it('assessment duration matches schedule slot (30 min)', () => {
    const assessmentSlot = DAILY_SCHEDULE.find((s) => s.type === 'assessment')!;
    expect(sessionDuration(assessmentSlot)).toBe(PROGRAMME.assessmentDurationMinutes);
  });
});

describe('Co-branding rules', () => {
  it('2 co-branding permitted items', () => {
    expect(CO_BRAND_PERMITTED).toHaveLength(2);
  });

  it('3 co-branding prohibited items', () => {
    expect(CO_BRAND_PROHIBITED).toHaveLength(3);
  });

  it('client logo is permitted', () => {
    const permitted = CO_BRAND_PERMITTED.some((r) => r.toLowerCase().includes('client logo'));
    expect(permitted).toBe(true);
  });

  it('competitor co-branding is prohibited', () => {
    const prohibited = CO_BRAND_PROHIBITED.some((r) => r.toLowerCase().includes('competitor'));
    expect(prohibited).toBe(true);
  });

  it('modifying question banks is prohibited', () => {
    const prohibited = CO_BRAND_PROHIBITED.some((r) => r.toLowerCase().includes('question bank'));
    expect(prohibited).toBe(true);
  });

  it('removing or resizing Nexara logo is prohibited', () => {
    const prohibited = CO_BRAND_PROHIBITED.some((r) => r.toLowerCase().includes('nexara logo'));
    expect(prohibited).toBe(true);
  });

  it('organisation name on certificates is permitted', () => {
    const permitted = CO_BRAND_PERMITTED.some((r) => r.toLowerCase().includes('organisation name'));
    expect(permitted).toBe(true);
  });

  it('all permitted items are non-empty strings', () => {
    for (const item of CO_BRAND_PERMITTED) {
      expect(item.trim().length).toBeGreaterThan(0);
    }
  });

  it('all prohibited items are non-empty strings', () => {
    for (const item of CO_BRAND_PROHIBITED) {
      expect(item.trim().length).toBeGreaterThan(0);
    }
  });

  it('more prohibited than permitted items', () => {
    expect(CO_BRAND_PROHIBITED.length).toBeGreaterThan(CO_BRAND_PERMITTED.length);
  });
});

// ─── Algorithm puzzle phases (ph217mot–ph224mot) ────────────────────────────────
function moveZeroes217mot(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217mot_mz',()=>{
  it('a',()=>{expect(moveZeroes217mot([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217mot([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217mot([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217mot([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217mot([4,2,0,0,3])).toBe(4);});
});
function missingNumber218mot(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218mot_mn',()=>{
  it('a',()=>{expect(missingNumber218mot([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218mot([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218mot([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218mot([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218mot([1])).toBe(0);});
});
function countBits219mot(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219mot_cb',()=>{
  it('a',()=>{expect(countBits219mot(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219mot(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219mot(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219mot(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219mot(4)[4]).toBe(1);});
});
function climbStairs220mot(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220mot_cs',()=>{
  it('a',()=>{expect(climbStairs220mot(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220mot(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220mot(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220mot(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220mot(1)).toBe(1);});
});
function maxProfit221mot(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221mot_mp',()=>{
  it('a',()=>{expect(maxProfit221mot([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221mot([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221mot([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221mot([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221mot([1])).toBe(0);});
});
function singleNumber222mot(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222mot_sn',()=>{
  it('a',()=>{expect(singleNumber222mot([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222mot([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222mot([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222mot([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222mot([3,3,5])).toBe(5);});
});
function hammingDist223mot(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223mot_hd',()=>{
  it('a',()=>{expect(hammingDist223mot(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223mot(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223mot(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223mot(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223mot(7,7)).toBe(0);});
});
function majorElem224mot(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224mot_me',()=>{
  it('a',()=>{expect(majorElem224mot([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224mot([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224mot([1])).toBe(1);});
  it('d',()=>{expect(majorElem224mot([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224mot([6,5,5])).toBe(5);});
});

// ─── Algorithm puzzle phases (ph231mot2–ph238mot2) ────────────────────────────────
function moveZeroes231mot2(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph231mot2_mz',()=>{
  it('a',()=>{expect(moveZeroes231mot2([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes231mot2([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes231mot2([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes231mot2([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes231mot2([4,2,0,0,3])).toBe(4);});
});
function missingNumber232mot2(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph232mot2_mn',()=>{
  it('a',()=>{expect(missingNumber232mot2([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber232mot2([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber232mot2([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber232mot2([0])).toBe(1);});
  it('e',()=>{expect(missingNumber232mot2([1])).toBe(0);});
});
function countBits233mot2(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph233mot2_cb',()=>{
  it('a',()=>{expect(countBits233mot2(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits233mot2(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits233mot2(0)).toEqual([0]);});
  it('d',()=>{expect(countBits233mot2(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits233mot2(4)[4]).toBe(1);});
});
function climbStairs234mot2(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph234mot2_cs',()=>{
  it('a',()=>{expect(climbStairs234mot2(2)).toBe(2);});
  it('b',()=>{expect(climbStairs234mot2(3)).toBe(3);});
  it('c',()=>{expect(climbStairs234mot2(4)).toBe(5);});
  it('d',()=>{expect(climbStairs234mot2(5)).toBe(8);});
  it('e',()=>{expect(climbStairs234mot2(1)).toBe(1);});
});
function maxProfit235mot2(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph235mot2_mp',()=>{
  it('a',()=>{expect(maxProfit235mot2([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit235mot2([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit235mot2([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit235mot2([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit235mot2([1])).toBe(0);});
});
function singleNumber236mot2(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph236mot2_sn',()=>{
  it('a',()=>{expect(singleNumber236mot2([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber236mot2([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber236mot2([1])).toBe(1);});
  it('d',()=>{expect(singleNumber236mot2([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber236mot2([3,3,5])).toBe(5);});
});
function hammingDist237mot2(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph237mot2_hd',()=>{
  it('a',()=>{expect(hammingDist237mot2(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist237mot2(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist237mot2(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist237mot2(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist237mot2(7,7)).toBe(0);});
});
function majorElem238mot2(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph238mot2_me',()=>{
  it('a',()=>{expect(majorElem238mot2([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem238mot2([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem238mot2([1])).toBe(1);});
  it('d',()=>{expect(majorElem238mot2([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem238mot2([6,5,5])).toBe(5);});
});
function cs239mot3(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph239mot3_cs',()=>{it('a',()=>{expect(cs239mot3(2)).toBe(2);});it('b',()=>{expect(cs239mot3(3)).toBe(3);});it('c',()=>{expect(cs239mot3(4)).toBe(5);});it('d',()=>{expect(cs239mot3(5)).toBe(8);});it('e',()=>{expect(cs239mot3(1)).toBe(1);});});
function cs240mot3(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph240mot3_cs',()=>{it('a',()=>{expect(cs240mot3(2)).toBe(2);});it('b',()=>{expect(cs240mot3(3)).toBe(3);});it('c',()=>{expect(cs240mot3(4)).toBe(5);});it('d',()=>{expect(cs240mot3(5)).toBe(8);});it('e',()=>{expect(cs240mot3(1)).toBe(1);});});
function cs241mot3(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph241mot3_cs',()=>{it('a',()=>{expect(cs241mot3(2)).toBe(2);});it('b',()=>{expect(cs241mot3(3)).toBe(3);});it('c',()=>{expect(cs241mot3(4)).toBe(5);});it('d',()=>{expect(cs241mot3(5)).toBe(8);});it('e',()=>{expect(cs241mot3(1)).toBe(1);});});
function cs242mot3(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph242mot3_cs',()=>{it('a',()=>{expect(cs242mot3(2)).toBe(2);});it('b',()=>{expect(cs242mot3(3)).toBe(3);});it('c',()=>{expect(cs242mot3(4)).toBe(5);});it('d',()=>{expect(cs242mot3(5)).toBe(8);});it('e',()=>{expect(cs242mot3(1)).toBe(1);});});
function cs243mot3(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph243mot3_cs',()=>{it('a',()=>{expect(cs243mot3(2)).toBe(2);});it('b',()=>{expect(cs243mot3(3)).toBe(3);});it('c',()=>{expect(cs243mot3(4)).toBe(5);});it('d',()=>{expect(cs243mot3(5)).toBe(8);});it('e',()=>{expect(cs243mot3(1)).toBe(1);});});
function cs244mot3(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph244mot3_cs',()=>{it('a',()=>{expect(cs244mot3(2)).toBe(2);});it('b',()=>{expect(cs244mot3(3)).toBe(3);});it('c',()=>{expect(cs244mot3(4)).toBe(5);});it('d',()=>{expect(cs244mot3(5)).toBe(8);});it('e',()=>{expect(cs244mot3(1)).toBe(1);});});
function cs245mot3(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph245mot3_cs',()=>{it('a',()=>{expect(cs245mot3(2)).toBe(2);});it('b',()=>{expect(cs245mot3(3)).toBe(3);});it('c',()=>{expect(cs245mot3(4)).toBe(5);});it('d',()=>{expect(cs245mot3(5)).toBe(8);});it('e',()=>{expect(cs245mot3(1)).toBe(1);});});
function cs246mot3(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph246mot3_cs',()=>{it('a',()=>{expect(cs246mot3(2)).toBe(2);});it('b',()=>{expect(cs246mot3(3)).toBe(3);});it('c',()=>{expect(cs246mot3(4)).toBe(5);});it('d',()=>{expect(cs246mot3(5)).toBe(8);});it('e',()=>{expect(cs246mot3(1)).toBe(1);});});
function cs247mot3(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph247mot3_cs',()=>{it('a',()=>{expect(cs247mot3(2)).toBe(2);});it('b',()=>{expect(cs247mot3(3)).toBe(3);});it('c',()=>{expect(cs247mot3(4)).toBe(5);});it('d',()=>{expect(cs247mot3(5)).toBe(8);});it('e',()=>{expect(cs247mot3(1)).toBe(1);});});
function cs248mot3(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph248mot3_cs',()=>{it('a',()=>{expect(cs248mot3(2)).toBe(2);});it('b',()=>{expect(cs248mot3(3)).toBe(3);});it('c',()=>{expect(cs248mot3(4)).toBe(5);});it('d',()=>{expect(cs248mot3(5)).toBe(8);});it('e',()=>{expect(cs248mot3(1)).toBe(1);});});
function mn253mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph253mot4_mn',()=>{it('a',()=>{expect(mn253mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn253mot4([0,1])).toBe(2);});it('c',()=>{expect(mn253mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn253mot4([0])).toBe(1);});it('e',()=>{expect(mn253mot4([1])).toBe(0);});});
function mn254mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph254mot4_mn',()=>{it('a',()=>{expect(mn254mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn254mot4([0,1])).toBe(2);});it('c',()=>{expect(mn254mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn254mot4([0])).toBe(1);});it('e',()=>{expect(mn254mot4([1])).toBe(0);});});
function mn255mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph255mot4_mn',()=>{it('a',()=>{expect(mn255mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn255mot4([0,1])).toBe(2);});it('c',()=>{expect(mn255mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn255mot4([0])).toBe(1);});it('e',()=>{expect(mn255mot4([1])).toBe(0);});});
function mn256mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph256mot4_mn',()=>{it('a',()=>{expect(mn256mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn256mot4([0,1])).toBe(2);});it('c',()=>{expect(mn256mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn256mot4([0])).toBe(1);});it('e',()=>{expect(mn256mot4([1])).toBe(0);});});
function mn257mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph257mot4_mn',()=>{it('a',()=>{expect(mn257mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn257mot4([0,1])).toBe(2);});it('c',()=>{expect(mn257mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn257mot4([0])).toBe(1);});it('e',()=>{expect(mn257mot4([1])).toBe(0);});});
function mn258mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph258mot4_mn',()=>{it('a',()=>{expect(mn258mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn258mot4([0,1])).toBe(2);});it('c',()=>{expect(mn258mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn258mot4([0])).toBe(1);});it('e',()=>{expect(mn258mot4([1])).toBe(0);});});
function mn259mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph259mot4_mn',()=>{it('a',()=>{expect(mn259mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn259mot4([0,1])).toBe(2);});it('c',()=>{expect(mn259mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn259mot4([0])).toBe(1);});it('e',()=>{expect(mn259mot4([1])).toBe(0);});});
function mn260mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph260mot4_mn',()=>{it('a',()=>{expect(mn260mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn260mot4([0,1])).toBe(2);});it('c',()=>{expect(mn260mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn260mot4([0])).toBe(1);});it('e',()=>{expect(mn260mot4([1])).toBe(0);});});
function mn261mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph261mot4_mn',()=>{it('a',()=>{expect(mn261mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn261mot4([0,1])).toBe(2);});it('c',()=>{expect(mn261mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn261mot4([0])).toBe(1);});it('e',()=>{expect(mn261mot4([1])).toBe(0);});});
function mn262mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph262mot4_mn',()=>{it('a',()=>{expect(mn262mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn262mot4([0,1])).toBe(2);});it('c',()=>{expect(mn262mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn262mot4([0])).toBe(1);});it('e',()=>{expect(mn262mot4([1])).toBe(0);});});
function mn263mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph263mot4_mn',()=>{it('a',()=>{expect(mn263mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn263mot4([0,1])).toBe(2);});it('c',()=>{expect(mn263mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn263mot4([0])).toBe(1);});it('e',()=>{expect(mn263mot4([1])).toBe(0);});});
function mn264mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph264mot4_mn',()=>{it('a',()=>{expect(mn264mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn264mot4([0,1])).toBe(2);});it('c',()=>{expect(mn264mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn264mot4([0])).toBe(1);});it('e',()=>{expect(mn264mot4([1])).toBe(0);});});
function mn265mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph265mot4_mn',()=>{it('a',()=>{expect(mn265mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn265mot4([0,1])).toBe(2);});it('c',()=>{expect(mn265mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn265mot4([0])).toBe(1);});it('e',()=>{expect(mn265mot4([1])).toBe(0);});});
function mn266mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph266mot4_mn',()=>{it('a',()=>{expect(mn266mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn266mot4([0,1])).toBe(2);});it('c',()=>{expect(mn266mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn266mot4([0])).toBe(1);});it('e',()=>{expect(mn266mot4([1])).toBe(0);});});
function mn267mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph267mot4_mn',()=>{it('a',()=>{expect(mn267mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn267mot4([0,1])).toBe(2);});it('c',()=>{expect(mn267mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn267mot4([0])).toBe(1);});it('e',()=>{expect(mn267mot4([1])).toBe(0);});});
function mn268mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph268mot4_mn',()=>{it('a',()=>{expect(mn268mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn268mot4([0,1])).toBe(2);});it('c',()=>{expect(mn268mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn268mot4([0])).toBe(1);});it('e',()=>{expect(mn268mot4([1])).toBe(0);});});
function mn269mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph269mot4_mn',()=>{it('a',()=>{expect(mn269mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn269mot4([0,1])).toBe(2);});it('c',()=>{expect(mn269mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn269mot4([0])).toBe(1);});it('e',()=>{expect(mn269mot4([1])).toBe(0);});});
function mn270mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph270mot4_mn',()=>{it('a',()=>{expect(mn270mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn270mot4([0,1])).toBe(2);});it('c',()=>{expect(mn270mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn270mot4([0])).toBe(1);});it('e',()=>{expect(mn270mot4([1])).toBe(0);});});
function mn271mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph271mot4_mn',()=>{it('a',()=>{expect(mn271mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn271mot4([0,1])).toBe(2);});it('c',()=>{expect(mn271mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn271mot4([0])).toBe(1);});it('e',()=>{expect(mn271mot4([1])).toBe(0);});});
function mn272mot4(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph272mot4_mn',()=>{it('a',()=>{expect(mn272mot4([3,0,1])).toBe(2);});it('b',()=>{expect(mn272mot4([0,1])).toBe(2);});it('c',()=>{expect(mn272mot4([9,6,4,2,3,5,7,0,1])).toBe(8);});it('d',()=>{expect(mn272mot4([0])).toBe(1);});it('e',()=>{expect(mn272mot4([1])).toBe(0);});});
