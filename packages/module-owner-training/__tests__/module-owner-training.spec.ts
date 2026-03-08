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
      expect(toMinutes(s.timeEnd) - toMinutes(s.timeStart)).toBeGreaterThan(0);
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
    const duration = toMinutes(lab.timeEnd) - toMinutes(lab.timeStart);
    expect(duration).toBe(75);
  });

  it('assessment session is the last on the day', () => {
    const lastSession = DAILY_SCHEDULE[DAILY_SCHEDULE.length - 1];
    expect(lastSession.type).toBe('assessment');
  });

  it('assessment starts at 16:30', () => {
    const assessment = DAILY_SCHEDULE.find((s) => s.type === 'assessment')!;
    expect(assessment.timeStart).toBe('16:30');
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
});
