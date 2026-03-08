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

// RBAC constants (from Module 2 content)
const RBAC = { roles: 39, modules: 17, permissionLevels: 7 } as const;

// CPD schemes that recognise this programme
const CPD_SCHEMES = ['CQI/IRCA', 'IOSH', 'BCS', 'ISO Management System Lead Auditor'];

// ---------------------------------------------------------------------------
// Helper: parse 'HH:MM' into minutes since midnight
// ---------------------------------------------------------------------------
function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Programme constants', () => {
  it('programme code matches NEXARA-ATP-001', () => {
    expect(PROGRAMME.code).toBe('NEXARA-ATP-001');
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

  it('certificate title correct', () => {
    expect(PROGRAMME.certificateTitle).toBe('Nexara Certified Platform Administrator');
  });

  it('format is ILT', () => {
    expect(PROGRAMME.format).toBe('ILT');
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
      const duration = toMinutes(s.timeEnd) - toMinutes(s.timeStart);
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
});

describe('RBAC framework constants', () => {
  it('39 predefined roles', () => {
    expect(RBAC.roles).toBe(39);
  });

  it('17 modules in RBAC matrix', () => {
    expect(RBAC.modules).toBe(17);
  });

  it('7 permission levels', () => {
    expect(RBAC.permissionLevels).toBe(7);
  });

  it('total role×permission combinations = 273', () => {
    expect(RBAC.roles * RBAC.permissionLevels).toBe(273);
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
});
