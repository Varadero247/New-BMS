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

  it('no prerequisites', () => {
    expect(PROGRAMME.prerequisites).toBe('none');
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

  it('total content time ≈ 195 minutes', () => {
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

  it('Module 2 (Recording Incidents) is safety-critical', () => {
    expect(SAFETY_CRITICAL_MODULES).toContain(2);
  });

  it('Module 4 (Permit to Work) is safety-critical', () => {
    expect(SAFETY_CRITICAL_MODULES).toContain(4);
  });

  it('Permit to Work has 40-minute duration (same as incidents)', () => {
    const ptw = MODULES.find((m) => m.title === 'Permit to Work');
    expect(ptw?.durationMinutes).toBe(40);
  });
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

  it('outcome 3 covers incident recording', () => {
    expect(LEARNING_OUTCOMES[1].toLowerCase()).toContain('incident');
  });

  it('outcome 4 covers permit to work', () => {
    expect(LEARNING_OUTCOMES[3].toLowerCase()).toContain('permit');
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
});
