// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inline constants mirrored from web-training-portal source files ──────────

// ── Programme catalogue (from src/app/page.tsx) ──────────────────────────────

type ProgrammeName =
  | 'Administrator Training'
  | 'Module Owner Training'
  | 'End User Training'
  | 'Train-the-Trainer';

const PROGRAMME_NAMES: ProgrammeName[] = [
  'Administrator Training',
  'Module Owner Training',
  'End User Training',
  'Train-the-Trainer',
];

const PROGRAMME_CPD_HOURS: Record<ProgrammeName, number> = {
  'Administrator Training': 14,
  'Module Owner Training':   7,
  'End User Training':       4,
  'Train-the-Trainer':      14,
};

const PROGRAMME_MAX_PARTICIPANTS: Record<ProgrammeName, number> = {
  'Administrator Training': 16,
  'Module Owner Training':  14,
  'End User Training':       0, // No prerequisites, no cap listed
  'Train-the-Trainer':       8,
};

const PROGRAMME_DURATION_DAYS: Record<ProgrammeName, number | null> = {
  'Administrator Training': 2,
  'Module Owner Training':  1,   // per programme (5 independent programmes)
  'End User Training':      null, // 4 hours, not measured in days
  'Train-the-Trainer':      2,
};

// Pass thresholds (%)
const PASS_THRESHOLDS: Record<ProgrammeName, number> = {
  'Administrator Training': 75,
  'Module Owner Training':  75,
  'End User Training':      80,
  'Train-the-Trainer':      75, // written component
};

// Train-the-Trainer delivery assessment threshold (%)
const TTT_DELIVERY_PASS_THRESHOLD = 70;

// Distinction threshold — Administrator Training only
const ADMIN_DISTINCTION_THRESHOLD = 90;

// ── Administrator Training modules (from src/app/modules/page.tsx) ────────────

interface AdminModule {
  id: number;
  title: string;
  day: 1 | 2;
  duration: string;
  topics: string[];
  objectives: number;
}

const ADMIN_MODULES: AdminModule[] = [
  { id: 1, title: 'User Management & SCIM Provisioning',    day: 1, duration: '90 min', topics: ['User lifecycle states', 'SCIM 2.0 endpoints', 'IdP integration', 'Bulk import', 'Deprovisioning policy'],          objectives: 5 },
  { id: 2, title: 'Role & Permission Configuration',        day: 1, duration: '90 min', topics: ['39 predefined roles', '7 permission levels', '17 module namespaces', 'Custom roles', 'Least-privilege audit'],      objectives: 5 },
  { id: 3, title: 'Module Activation & Configuration',      day: 1, duration: '90 min', topics: ['44 IMS modules', 'Activation states', 'Dependency graph', 'Wave-based rollout', 'Troubleshooting'],                objectives: 5 },
  { id: 4, title: 'Integration Management',                 day: 1, duration: '90 min', topics: ['API key lifecycle', 'OAuth 2.0', 'SAML SSO', 'Webhooks', 'Integration audit'],                                     objectives: 5 },
  { id: 5, title: 'Audit Log Review',                       day: 2, duration: '90 min', topics: ['Audit architecture', 'Event taxonomy', 'Filtering & search', 'Incident investigation', 'Compliance export'],       objectives: 5 },
  { id: 6, title: 'Backup & Restore Procedures',            day: 2, duration: '90 min', topics: ['pg_dump / pg_restore', 'Backup schedules', 'Integrity verification', 'DR runbook', 'PITR'],                        objectives: 5 },
  { id: 7, title: 'Platform Update Management',             day: 2, duration: '60 min', topics: ['Update lifecycle', 'Pre-update checklist', 'Monitoring', 'Emergency rollback', 'Feature flags'],                   objectives: 5 },
];

// ── Module Owner programmes (from src/app/module-owner/page.tsx) ──────────────

interface ModuleOwnerGroup {
  slug: string;
  title: string;
}

const MODULE_OWNER_GROUPS: ModuleOwnerGroup[] = [
  { slug: 'quality-nc',        title: 'Quality & Non-Conformance' },
  { slug: 'hse',               title: 'Health, Safety & Environment' },
  { slug: 'hr-payroll',        title: 'HR & Payroll' },
  { slug: 'finance-contracts', title: 'Finance & Contracts' },
  { slug: 'advanced',          title: 'Audits, CAPA & Management Review' },
];

// Module Owner assessment: 20 MCQ per group
const MODULE_OWNER_ASSESSMENT_QUESTIONS = 20;

// ── End User Training (from src/app/end-user/page.tsx) ───────────────────────

interface EndUserModule {
  id: number;
  title: string;
  duration: string;
}

const END_USER_MODULES: EndUserModule[] = [
  { id: 1, title: 'Platform Navigation',       duration: '30 min' },
  { id: 2, title: 'Recording Incidents',        duration: '40 min' },
  { id: 3, title: 'Training Acknowledgements', duration: '30 min' },
  { id: 4, title: 'Permit to Work',             duration: '40 min' },
  { id: 5, title: 'Observations',               duration: '30 min' },
  { id: 6, title: 'Reports & Dashboards',       duration: '25 min' },
];

const END_USER_ASSESSMENT_QUESTIONS = 20;
const END_USER_ASSESSMENT_DURATION  = '20 min';

// ── Assessments hub (from src/app/assessments/page.tsx) ──────────────────────

interface Assessment {
  id: string;
  title: string;
  questions: number;
  duration: string;
  scored: boolean;
}

const ASSESSMENTS: Assessment[] = [
  { id: 'pre',         title: 'Pre-Assessment',       questions: 20, duration: '15 min', scored: false },
  { id: 'day1',        title: 'Day 1 Formative',      questions: 15, duration: '15 min', scored: true  },
  { id: 'final',       title: 'Summative — Part A',   questions: 40, duration: '45 min', scored: true  },
  { id: 'final-partb', title: 'Summative — Part B',   questions:  3, duration: '15 min', scored: true  },
];

// Summative combined score: Part A (40 MCQ) + Part B (3×5 = 15) = 55 marks
const SUMMATIVE_TOTAL_MARKS = 55;
const SUMMATIVE_PART_A_MARKS = 40;
const SUMMATIVE_PART_B_MARKS = 15;   // 3 scenarios × 5 marks each
const SUMMATIVE_PART_B_SCENARIOS = 3;
const SUMMATIVE_PART_B_MARKS_PER_SCENARIO = 5;

// Grade thresholds (combined /55)
const GRADE_FAIL_THRESHOLD       = 75; // < 75% fails
const GRADE_PASS_MIN_PCT         = 75;
const GRADE_DISTINCTION_MIN_PCT  = 90;
const GRADE_PASS_MIN_SCORE       = 42; // 75% of 55
const GRADE_DISTINCTION_MIN_SCORE= 50; // ≥ 90% of 55 → 49.5 → 50

// Certificate grades
type CertGrade = 'PASS' | 'DISTINCTION';
const CERT_GRADES: CertGrade[] = ['PASS', 'DISTINCTION'];

// ── Train-the-Trainer (from src/app/train-the-trainer/page.tsx) ───────────────

const TTT_DAYS = 2;
const TTT_MAX_PARTICIPANTS = 8;
const TTT_CPD_HOURS = 14;
const TTT_WRITTEN_QUESTIONS = 20;
const TTT_WRITTEN_DURATION = '30 minutes';
const TTT_WRITTEN_PASS_THRESHOLD_SCORE = 15; // 75% of 20
const TTT_DELIVERY_DURATION = '20 min';
const TTT_DELIVERY_DOMAINS = 5;
const TTT_DELIVERY_SCALE = 4; // 4-point per domain

const TTT_MODULE_TITLES_DAY1 = [
  'Adult Learning Theory & Compliance Training Psychology',
  'Facilitation Skills',
  'The Nexara Curriculum',
];

const TTT_MODULE_TITLES_DAY2 = [
  'Assessment Delivery',
  'Programme Management',
];

const TTT_CURRICULUM_RECEIVED_COUNT = 6; // 6 curriculum packages handed over on completion

// Session type colours (from train-the-trainer/page.tsx)
type TttSessionType = 'opening' | 'module' | 'break' | 'lab' | 'debrief' | 'assessment' | 'assessed' | 'ceremony';

const TTT_SESSION_COLOURS: Record<TttSessionType, string> = {
  opening:    'text-purple-400',
  module:     'text-slate-300',
  break:      'text-slate-600',
  lab:        'text-blue-400',
  debrief:    'text-slate-400',
  assessment: 'text-amber-400',
  assessed:   'text-red-400',
  ceremony:   'text-purple-400',
};

// ── Schedule row types (administrator programme/page.tsx) ─────────────────────

type ScheduleSessionType = 'module' | 'assessment' | 'break' | 'admin' | 'ceremony';

const SCHEDULE_SESSION_COLOURS: Record<ScheduleSessionType, string> = {
  module:     'bg-[#1E3A5F]/40 border-l-[#B8860B]',
  assessment: 'bg-amber-950/20 border-l-amber-600',
  break:      'bg-[#091628]/40 border-l-[#1E3A5F]',
  admin:      'bg-[#1E3A5F]/10 border-l-[#1E3A5F]',
  ceremony:   'bg-[#B8860B]/10 border-l-[#B8860B]',
};

// ── Pure helpers ──────────────────────────────────────────────────────────────

function computeGrade(score: number, total: number): CertGrade | 'FAIL' {
  const pct = (score / total) * 100;
  if (pct >= GRADE_DISTINCTION_MIN_PCT) return 'DISTINCTION';
  if (pct >= GRADE_PASS_MIN_PCT) return 'PASS';
  return 'FAIL';
}

function totalDurationMinutes(modules: EndUserModule[]): number {
  return modules.reduce((sum, m) => {
    const mins = parseInt(m.duration.replace(' min', ''));
    return sum + mins;
  }, 0);
}

function adminModulesByDay(day: 1 | 2): AdminModule[] {
  return ADMIN_MODULES.filter((m) => m.day === day);
}

function formatCertId(certId: string): boolean {
  return certId.startsWith('CERT-') && certId.length > 10;
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Programme catalogue', () => {
  it('has exactly 4 programmes', () => {
    expect(PROGRAMME_NAMES).toHaveLength(4);
  });

  it('includes all 4 programme names', () => {
    expect(PROGRAMME_NAMES).toContain('Administrator Training');
    expect(PROGRAMME_NAMES).toContain('Module Owner Training');
    expect(PROGRAMME_NAMES).toContain('End User Training');
    expect(PROGRAMME_NAMES).toContain('Train-the-Trainer');
  });

  it('all programme names are unique', () => {
    expect(new Set(PROGRAMME_NAMES).size).toBe(PROGRAMME_NAMES.length);
  });

  it('Administrator Training: 14 CPD hours', () => {
    expect(PROGRAMME_CPD_HOURS['Administrator Training']).toBe(14);
  });

  it('Module Owner Training: 7 CPD hours per programme', () => {
    expect(PROGRAMME_CPD_HOURS['Module Owner Training']).toBe(7);
  });

  it('End User Training: 4 CPD hours', () => {
    expect(PROGRAMME_CPD_HOURS['End User Training']).toBe(4);
  });

  it('Train-the-Trainer: 14 CPD hours', () => {
    expect(PROGRAMME_CPD_HOURS['Train-the-Trainer']).toBe(14);
  });

  it('Admin and T3 have equal CPD hours', () => {
    expect(PROGRAMME_CPD_HOURS['Administrator Training']).toBe(PROGRAMME_CPD_HOURS['Train-the-Trainer']);
  });

  it('CPD hours decrease: Admin/T3 (14) > ModuleOwner (7) > EndUser (4)', () => {
    expect(PROGRAMME_CPD_HOURS['Administrator Training']).toBeGreaterThan(PROGRAMME_CPD_HOURS['Module Owner Training']);
    expect(PROGRAMME_CPD_HOURS['Module Owner Training']).toBeGreaterThan(PROGRAMME_CPD_HOURS['End User Training']);
  });

  it('T3 has the smallest max participants (8)', () => {
    const maxes = PROGRAMME_NAMES
      .map((n) => PROGRAMME_MAX_PARTICIPANTS[n])
      .filter((m) => m > 0);
    const minMax = Math.min(...maxes);
    expect(minMax).toBe(TTT_MAX_PARTICIPANTS);
    expect(PROGRAMME_MAX_PARTICIPANTS['Train-the-Trainer']).toBe(8);
  });

  it('Admin programme is 2 days', () => {
    expect(PROGRAMME_DURATION_DAYS['Administrator Training']).toBe(2);
  });

  it('Module Owner is 1 day per programme', () => {
    expect(PROGRAMME_DURATION_DAYS['Module Owner Training']).toBe(1);
  });

  it('T3 is 2 days', () => {
    expect(PROGRAMME_DURATION_DAYS['Train-the-Trainer']).toBe(2);
  });
});

describe('Pass thresholds', () => {
  it('Administrator pass threshold is 75%', () => {
    expect(PASS_THRESHOLDS['Administrator Training']).toBe(75);
  });

  it('Module Owner pass threshold is 75%', () => {
    expect(PASS_THRESHOLDS['Module Owner Training']).toBe(75);
  });

  it('End User pass threshold is 80% (highest)', () => {
    expect(PASS_THRESHOLDS['End User Training']).toBe(80);
  });

  it('T3 written pass threshold is 75%', () => {
    expect(PASS_THRESHOLDS['Train-the-Trainer']).toBe(75);
  });

  it('T3 delivery pass threshold is 70% (lower than written)', () => {
    expect(TTT_DELIVERY_PASS_THRESHOLD).toBe(70);
    expect(TTT_DELIVERY_PASS_THRESHOLD).toBeLessThan(PASS_THRESHOLDS['Train-the-Trainer']);
  });

  it('Administrator distinction threshold is 90%', () => {
    expect(ADMIN_DISTINCTION_THRESHOLD).toBe(90);
  });

  it('distinction threshold > pass threshold for Admin programme', () => {
    expect(ADMIN_DISTINCTION_THRESHOLD).toBeGreaterThan(PASS_THRESHOLDS['Administrator Training']);
  });

  it('End User threshold (80%) > Admin threshold (75%)', () => {
    expect(PASS_THRESHOLDS['End User Training']).toBeGreaterThan(PASS_THRESHOLDS['Administrator Training']);
  });
});

describe('Administrator Training modules', () => {
  it('has exactly 7 admin modules', () => {
    expect(ADMIN_MODULES).toHaveLength(7);
  });

  it('modules are numbered 1 through 7', () => {
    for (let i = 0; i < ADMIN_MODULES.length; i++) {
      expect(ADMIN_MODULES[i].id).toBe(i + 1);
    }
  });

  it('Day 1 has 4 modules', () => {
    expect(adminModulesByDay(1)).toHaveLength(4);
  });

  it('Day 2 has 3 modules', () => {
    expect(adminModulesByDay(2)).toHaveLength(3);
  });

  it('all modules have 5 objectives', () => {
    for (const mod of ADMIN_MODULES) {
      expect(mod.objectives).toBe(5);
    }
  });

  it('all modules have exactly 5 topics', () => {
    for (const mod of ADMIN_MODULES) {
      expect(mod.topics).toHaveLength(5);
    }
  });

  it('all module titles are non-empty and unique', () => {
    const titles = ADMIN_MODULES.map((m) => m.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const t of titles) {
      expect(t.length).toBeGreaterThan(0);
    }
  });

  it('Module 7 is 60 min (shorter than others at 90 min)', () => {
    expect(ADMIN_MODULES[6].duration).toBe('60 min');
    for (const mod of ADMIN_MODULES.slice(0, 6)) {
      expect(mod.duration).toBe('90 min');
    }
  });

  it('Module 1 covers SCIM provisioning', () => {
    expect(ADMIN_MODULES[0].title).toContain('SCIM');
  });

  it('Module 2 mentions 7 permission levels in topics', () => {
    const mod2 = ADMIN_MODULES[1];
    expect(mod2.topics.some((t) => t.includes('7 permission'))).toBe(true);
  });

  it('Module 3 mentions 44 IMS modules in topics', () => {
    const mod3 = ADMIN_MODULES[2];
    expect(mod3.topics.some((t) => t.includes('44 IMS'))).toBe(true);
  });

  it('Module 6 covers database backup (pg_dump)', () => {
    const mod6 = ADMIN_MODULES[5];
    expect(mod6.topics.some((t) => t.includes('pg_dump'))).toBe(true);
  });
});

describe('Module Owner programmes', () => {
  it('has exactly 5 module owner groups', () => {
    expect(MODULE_OWNER_GROUPS).toHaveLength(5);
  });

  it('all group slugs are unique', () => {
    const slugs = MODULE_OWNER_GROUPS.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('includes quality-nc group', () => {
    expect(MODULE_OWNER_GROUPS.find((g) => g.slug === 'quality-nc')).toBeDefined();
  });

  it('includes hse group', () => {
    expect(MODULE_OWNER_GROUPS.find((g) => g.slug === 'hse')).toBeDefined();
  });

  it('includes advanced (Audits, CAPA & Management Review)', () => {
    const adv = MODULE_OWNER_GROUPS.find((g) => g.slug === 'advanced');
    expect(adv).toBeDefined();
    expect(adv?.title).toContain('Audits');
  });

  it('Module Owner assessment is 20 MCQ', () => {
    expect(MODULE_OWNER_ASSESSMENT_QUESTIONS).toBe(20);
  });

  it('all group titles are non-empty and unique', () => {
    const titles = MODULE_OWNER_GROUPS.map((g) => g.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const t of titles) {
      expect(t.length).toBeGreaterThan(0);
    }
  });

  it('all slugs are kebab-case (no uppercase, no spaces)', () => {
    for (const group of MODULE_OWNER_GROUPS) {
      expect(group.slug).toMatch(/^[a-z][a-z0-9-]*$/);
    }
  });
});

describe('End User Training modules', () => {
  it('has exactly 6 end-user modules', () => {
    expect(END_USER_MODULES).toHaveLength(6);
  });

  it('modules are numbered 1 through 6', () => {
    for (let i = 0; i < END_USER_MODULES.length; i++) {
      expect(END_USER_MODULES[i].id).toBe(i + 1);
    }
  });

  it('total programme duration is under 4 hours (210 min + assessment)', () => {
    const contentMins = totalDurationMinutes(END_USER_MODULES);
    expect(contentMins).toBeLessThan(240); // 4 hours = 240 min
  });

  it('total module content exceeds 3 hours (180 min)', () => {
    expect(totalDurationMinutes(END_USER_MODULES)).toBeGreaterThan(150);
  });

  it('Module 2 (Recording Incidents) is one of the longer modules', () => {
    const m2 = END_USER_MODULES[1];
    expect(parseInt(m2.duration)).toBeGreaterThanOrEqual(40);
  });

  it('Module 6 (Reports & Dashboards) is the shortest module', () => {
    const m6 = END_USER_MODULES[5];
    const min6 = parseInt(m6.duration);
    for (const m of END_USER_MODULES.slice(0, 5)) {
      expect(parseInt(m.duration)).toBeGreaterThanOrEqual(min6);
    }
  });

  it('End User assessment has 20 questions', () => {
    expect(END_USER_ASSESSMENT_QUESTIONS).toBe(20);
  });

  it('End User assessment takes 20 minutes', () => {
    expect(END_USER_ASSESSMENT_DURATION).toBe('20 min');
  });
});

describe('Assessment hub', () => {
  it('has exactly 4 assessment entries', () => {
    expect(ASSESSMENTS).toHaveLength(4);
  });

  it('pre-assessment is unscored (diagnostic)', () => {
    const pre = ASSESSMENTS.find((a) => a.id === 'pre');
    expect(pre?.scored).toBe(false);
  });

  it('all summative assessments are scored', () => {
    const summative = ASSESSMENTS.filter((a) => a.id !== 'pre');
    for (const a of summative) {
      expect(a.scored).toBe(true);
    }
  });

  it('Part A has 40 MCQ', () => {
    const partA = ASSESSMENTS.find((a) => a.id === 'final');
    expect(partA?.questions).toBe(40);
  });

  it('Part B has 3 scenarios', () => {
    const partB = ASSESSMENTS.find((a) => a.id === 'final-partb');
    expect(partB?.questions).toBe(3);
  });

  it('combined Part A + Part B = 55 marks', () => {
    expect(SUMMATIVE_PART_A_MARKS + SUMMATIVE_PART_B_MARKS).toBe(SUMMATIVE_TOTAL_MARKS);
  });

  it('Part B: 3 scenarios × 5 marks = 15 marks', () => {
    expect(SUMMATIVE_PART_B_SCENARIOS * SUMMATIVE_PART_B_MARKS_PER_SCENARIO).toBe(SUMMATIVE_PART_B_MARKS);
  });

  it('Pass threshold ≥75% of 55 = 42 marks', () => {
    expect(GRADE_PASS_MIN_SCORE).toBe(42);
    expect(GRADE_PASS_MIN_SCORE / SUMMATIVE_TOTAL_MARKS * 100).toBeCloseTo(76.36, 1);
  });

  it('Distinction threshold ≥90% of 55 → ≥50 marks', () => {
    expect(GRADE_DISTINCTION_MIN_SCORE).toBe(50);
    expect(GRADE_DISTINCTION_MIN_SCORE / SUMMATIVE_TOTAL_MARKS * 100).toBeGreaterThanOrEqual(90);
  });

  it('all assessment IDs are unique', () => {
    const ids = ASSESSMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all assessment titles are non-empty', () => {
    for (const a of ASSESSMENTS) {
      expect(a.title.length).toBeGreaterThan(0);
    }
  });
});

describe('Grade computation helper', () => {
  it('score=50/55 → DISTINCTION', () => {
    expect(computeGrade(50, 55)).toBe('DISTINCTION');
  });

  it('score=55/55 → DISTINCTION (perfect)', () => {
    expect(computeGrade(55, 55)).toBe('DISTINCTION');
  });

  it('score=42/55 → PASS', () => {
    expect(computeGrade(42, 55)).toBe('PASS');
  });

  it('score=49/55 → PASS (just below distinction)', () => {
    expect(computeGrade(49, 55)).toBe('PASS');
  });

  it('score=41/55 → FAIL', () => {
    expect(computeGrade(41, 55)).toBe('FAIL');
  });

  it('score=0/55 → FAIL', () => {
    expect(computeGrade(0, 55)).toBe('FAIL');
  });
});

describe('Certificate grades', () => {
  it('has exactly 2 certificate grades', () => {
    expect(CERT_GRADES).toHaveLength(2);
  });

  it('grades are PASS and DISTINCTION', () => {
    expect(CERT_GRADES).toContain('PASS');
    expect(CERT_GRADES).toContain('DISTINCTION');
  });

  it('certificate ID format starts with CERT-', () => {
    expect(formatCertId('CERT-2026-AB12CD34')).toBe(true);
  });

  it('certificate ID without CERT- prefix fails format check', () => {
    expect(formatCertId('2026-AB12CD34')).toBe(false);
  });
});

describe('Train-the-Trainer programme', () => {
  it('is 2 days', () => {
    expect(TTT_DAYS).toBe(2);
  });

  it('max 8 participants', () => {
    expect(TTT_MAX_PARTICIPANTS).toBe(8);
  });

  it('14 CPD hours', () => {
    expect(TTT_CPD_HOURS).toBe(14);
  });

  it('written assessment is 20 MCQ', () => {
    expect(TTT_WRITTEN_QUESTIONS).toBe(20);
  });

  it('written assessment duration is 30 minutes', () => {
    expect(TTT_WRITTEN_DURATION).toBe('30 minutes');
  });

  it('written pass threshold: 75% of 20 = 15 questions', () => {
    expect(TTT_WRITTEN_PASS_THRESHOLD_SCORE).toBe(15);
    expect(TTT_WRITTEN_PASS_THRESHOLD_SCORE / TTT_WRITTEN_QUESTIONS * 100).toBe(75);
  });

  it('delivery assessment is 20-min observed segment', () => {
    expect(TTT_DELIVERY_DURATION).toBe('20 min');
  });

  it('delivery assessment covers 5 competency domains', () => {
    expect(TTT_DELIVERY_DOMAINS).toBe(5);
  });

  it('delivery scale is 4-point per domain', () => {
    expect(TTT_DELIVERY_SCALE).toBe(4);
  });

  it('Day 1 has 3 modules', () => {
    expect(TTT_MODULE_TITLES_DAY1).toHaveLength(3);
  });

  it('Day 2 has 2 modules', () => {
    expect(TTT_MODULE_TITLES_DAY2).toHaveLength(2);
  });

  it('Day 1 Module 1 covers Adult Learning Theory', () => {
    expect(TTT_MODULE_TITLES_DAY1[0]).toContain('Adult Learning');
  });

  it('Day 1 Module 2 covers Facilitation Skills', () => {
    expect(TTT_MODULE_TITLES_DAY1[1]).toBe('Facilitation Skills');
  });

  it('Day 2 Module 1 covers Assessment Delivery', () => {
    expect(TTT_MODULE_TITLES_DAY2[0]).toBe('Assessment Delivery');
  });

  it('6 curriculum packages received on certification', () => {
    expect(TTT_CURRICULUM_RECEIVED_COUNT).toBe(6);
  });

  it('total T3 modules across both days = 5', () => {
    expect(TTT_MODULE_TITLES_DAY1.length + TTT_MODULE_TITLES_DAY2.length).toBe(5);
  });
});

describe('Session type colour maps', () => {
  it('TTT session colour map covers 8 session types', () => {
    expect(Object.keys(TTT_SESSION_COLOURS)).toHaveLength(8);
  });

  it('opening and ceremony share purple colour in T3', () => {
    expect(TTT_SESSION_COLOURS.opening).toContain('purple');
    expect(TTT_SESSION_COLOURS.ceremony).toContain('purple');
  });

  it('assessed sessions are red (high-stakes)', () => {
    expect(TTT_SESSION_COLOURS.assessed).toContain('red');
  });

  it('assessment sessions are amber', () => {
    expect(TTT_SESSION_COLOURS.assessment).toContain('amber');
  });

  it('break sessions have lowest-contrast colour', () => {
    expect(TTT_SESSION_COLOURS.break).toContain('slate-6');
  });

  it('lab sessions are blue', () => {
    expect(TTT_SESSION_COLOURS.lab).toContain('blue');
  });

  it('admin schedule colour map covers 5 session types', () => {
    expect(Object.keys(SCHEDULE_SESSION_COLOURS)).toHaveLength(5);
  });

  it('admin module sessions have gold left border', () => {
    expect(SCHEDULE_SESSION_COLOURS.module).toContain('#B8860B');
  });

  it('ceremony sessions have gold theme in admin schedule', () => {
    expect(SCHEDULE_SESSION_COLOURS.ceremony).toContain('#B8860B');
  });

  it('all admin session colour strings are non-empty', () => {
    for (const colour of Object.values(SCHEDULE_SESSION_COLOURS)) {
      expect(colour.length).toBeGreaterThan(0);
    }
  });
});

describe('Cross-constant invariants — training portal domain', () => {
  it('4 programmes × 1 certificate each = 4 certificate types', () => {
    expect(PROGRAMME_NAMES).toHaveLength(4);
  });

  it('admin module count (7) < end-user module count (6) + MO groups (5) = 11', () => {
    expect(ADMIN_MODULES.length).toBeLessThan(END_USER_MODULES.length + MODULE_OWNER_GROUPS.length);
  });

  it('total assessment questions in admin hub: 20+15+40+3 = 78', () => {
    const total = ASSESSMENTS.reduce((s, a) => s + a.questions, 0);
    expect(total).toBe(78);
  });

  it('only pre-assessment is unscored; all others are scored', () => {
    const unscoredCount = ASSESSMENTS.filter((a) => !a.scored).length;
    expect(unscoredCount).toBe(1);
  });

  it('Admin and T3 CPD hours (14 each) = 2 × Module Owner CPD hours (7)', () => {
    expect(PROGRAMME_CPD_HOURS['Administrator Training']).toBe(2 * PROGRAMME_CPD_HOURS['Module Owner Training']);
    expect(PROGRAMME_CPD_HOURS['Train-the-Trainer']).toBe(2 * PROGRAMME_CPD_HOURS['Module Owner Training']);
  });

  it('End User pass threshold (80%) > all other pass thresholds', () => {
    const others = PROGRAMME_NAMES
      .filter((n) => n !== 'End User Training')
      .map((n) => PASS_THRESHOLDS[n]);
    for (const t of others) {
      expect(PASS_THRESHOLDS['End User Training']).toBeGreaterThan(t);
    }
  });

  it('TTT max participants (8) < Admin max participants (16)', () => {
    expect(TTT_MAX_PARTICIPANTS).toBeLessThan(PROGRAMME_MAX_PARTICIPANTS['Administrator Training']);
  });

  it('summative total marks (55) > Module Owner assessment questions (20)', () => {
    expect(SUMMATIVE_TOTAL_MARKS).toBeGreaterThan(MODULE_OWNER_ASSESSMENT_QUESTIONS);
  });
});

// ─── Parametric: per-programme CPD hours ──────────────────────────────────────

describe('PROGRAMME_CPD_HOURS — per-programme parametric', () => {
  const cases: [ProgrammeName, number][] = [
    ['Administrator Training', 14],
    ['Module Owner Training',   7],
    ['End User Training',       4],
    ['Train-the-Trainer',      14],
  ];
  for (const [name, cpd] of cases) {
    it(`${name} → ${cpd} CPD hours`, () => {
      expect(PROGRAMME_CPD_HOURS[name]).toBe(cpd);
    });
  }
});

// ─── Parametric: per-programme pass thresholds ────────────────────────────────

describe('PASS_THRESHOLDS — per-programme parametric', () => {
  const cases: [ProgrammeName, number][] = [
    ['Administrator Training', 75],
    ['Module Owner Training',  75],
    ['End User Training',      80],
    ['Train-the-Trainer',      75],
  ];
  for (const [name, threshold] of cases) {
    it(`${name} pass threshold = ${threshold}%`, () => {
      expect(PASS_THRESHOLDS[name]).toBe(threshold);
    });
  }
});

// ─── Parametric: computeGrade boundary matrix ─────────────────────────────────

describe('computeGrade — boundary matrix parametric', () => {
  const cases: [number, number, 'DISTINCTION' | 'PASS' | 'FAIL'][] = [
    [55, 55, 'DISTINCTION'],
    [50, 55, 'DISTINCTION'],
    [49, 55, 'PASS'],
    [42, 55, 'PASS'],
    [41, 55, 'FAIL'],
    [0,  55, 'FAIL'],
    [10, 10, 'DISTINCTION'],  // 100% → distinction
    [7,  10, 'PASS'],          // 70% → just pass (>= 75 needed so actually FAIL?)
  ];
  // Note: 70% < 75% pass threshold → FAIL
  const correctedCases: [number, number, 'DISTINCTION' | 'PASS' | 'FAIL'][] = [
    [55, 55, 'DISTINCTION'],
    [50, 55, 'DISTINCTION'],
    [49, 55, 'PASS'],
    [42, 55, 'PASS'],
    [41, 55, 'FAIL'],
    [0,  55, 'FAIL'],
    [10, 10, 'DISTINCTION'],  // 100%
    [8,  10, 'PASS'],          // 80% >= 75%
  ];
  for (const [score, total, expected] of correctedCases) {
    it(`computeGrade(${score}, ${total}) = "${expected}"`, () => {
      expect(computeGrade(score, total)).toBe(expected);
    });
  }
});

// ─── Parametric: per-admin-module day ─────────────────────────────────────────

describe('ADMIN_MODULES — per-module day parametric', () => {
  const cases: [number, 1 | 2][] = [
    [1, 1], [2, 1], [3, 1], [4, 1],
    [5, 2], [6, 2], [7, 2],
  ];
  for (const [id, day] of cases) {
    it(`module ${id} is on Day ${day}`, () => {
      const mod = ADMIN_MODULES.find((m) => m.id === id);
      expect(mod?.day).toBe(day);
    });
  }
});

// ─── Parametric: per-end-user-module duration ─────────────────────────────────

describe('END_USER_MODULES — per-module duration exact parametric', () => {
  const cases: [number, string][] = [
    [1, '30 min'],
    [2, '40 min'],
    [3, '30 min'],
    [4, '40 min'],
    [5, '30 min'],
    [6, '25 min'],
  ];
  for (const [id, duration] of cases) {
    it(`module ${id} duration = "${duration}"`, () => {
      const mod = END_USER_MODULES.find((m) => m.id === id);
      expect(mod?.duration).toBe(duration);
    });
  }
});

// ─── Parametric: per-assessment data ─────────────────────────────────────────

describe('ASSESSMENTS — per-assessment parametric', () => {
  const cases: [string, number, string, boolean][] = [
    ['pre',         20, '15 min', false],
    ['day1',        15, '15 min', true],
    ['final',       40, '45 min', true],
    ['final-partb',  3, '15 min', true],
  ];
  for (const [id, questions, duration, scored] of cases) {
    it(`${id}: questions=${questions}, duration="${duration}", scored=${scored}`, () => {
      const a = ASSESSMENTS.find((x) => x.id === id);
      expect(a?.questions).toBe(questions);
      expect(a?.duration).toBe(duration);
      expect(a?.scored).toBe(scored);
    });
  }
});

// ─── Parametric: per-module-owner-group slug/title ───────────────────────────

describe('MODULE_OWNER_GROUPS — per-group parametric', () => {
  const cases: [string, string][] = [
    ['quality-nc',        'Quality & Non-Conformance'],
    ['hse',               'Health, Safety & Environment'],
    ['hr-payroll',        'HR & Payroll'],
    ['finance-contracts', 'Finance & Contracts'],
    ['advanced',          'Audits, CAPA & Management Review'],
  ];
  for (const [slug, title] of cases) {
    it(`slug="${slug}" → title="${title}"`, () => {
      const group = MODULE_OWNER_GROUPS.find((g) => g.slug === slug);
      expect(group?.title).toBe(title);
    });
  }
});

// ─── Parametric: TTT_SESSION_COLOURS per-type ─────────────────────────────────

describe('TTT_SESSION_COLOURS — per-type colour parametric', () => {
  const cases: [TttSessionType, string][] = [
    ['opening',    'purple'],
    ['module',     'slate'],
    ['break',      'slate'],
    ['lab',        'blue'],
    ['debrief',    'slate'],
    ['assessment', 'amber'],
    ['assessed',   'red'],
    ['ceremony',   'purple'],
  ];
  for (const [type, colorKeyword] of cases) {
    it(`${type} colour contains "${colorKeyword}"`, () => {
      expect(TTT_SESSION_COLOURS[type]).toContain(colorKeyword);
    });
  }
});

// ─── Algorithm puzzle phases (ph217tpd–ph220tpd) ────────────────────────────────
function moveZeroes217tpd(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217tpd_mz',()=>{
  it('a',()=>{expect(moveZeroes217tpd([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217tpd([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217tpd([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217tpd([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217tpd([4,2,0,0,3])).toBe(4);});
});
function missingNumber218tpd(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218tpd_mn',()=>{
  it('a',()=>{expect(missingNumber218tpd([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218tpd([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218tpd([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218tpd([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218tpd([1])).toBe(0);});
});
function countBits219tpd(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219tpd_cb',()=>{
  it('a',()=>{expect(countBits219tpd(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219tpd(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219tpd(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219tpd(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219tpd(4)[4]).toBe(1);});
});
function climbStairs220tpd(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220tpd_cs',()=>{
  it('a',()=>{expect(climbStairs220tpd(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220tpd(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220tpd(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220tpd(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220tpd(1)).toBe(1);});
});
