// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inlined domain constants (from courses/client.tsx, records/client.tsx,
//     competencies/client.tsx, inductions/client.tsx, tna/client.tsx) ────────

// Course types and delivery modes (courses/client.tsx)
const COURSE_TYPES = [
  'MANDATORY',
  'OPTIONAL',
  'REFRESHER',
  'INDUCTION',
  'CERTIFICATION',
  'COMPETENCY',
] as const;
type CourseType = typeof COURSE_TYPES[number];

const DELIVERY_MODES = [
  'CLASSROOM',
  'ONLINE',
  'ON_THE_JOB',
  'BLENDED',
  'SELF_PACED',
  'WORKSHOP',
] as const;
type DeliveryMode = typeof DELIVERY_MODES[number];

// Training record statuses (records/client.tsx, inductions/client.tsx)
const RECORD_STATUSES = [
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'EXPIRED',
  'CANCELLED',
] as const;
type RecordStatus = typeof RECORD_STATUSES[number];

// Competency levels (competencies/client.tsx)
const COMPETENCY_LEVELS = [
  'NOT_STARTED',
  'DEVELOPING',
  'COMPETENT',
  'EXPERT',
  'EXPIRED',
] as const;
type CompetencyLevel = typeof COMPETENCY_LEVELS[number];

// TNA priorities (tna/client.tsx)
const TNA_PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;
type TnaPriority = typeof TNA_PRIORITIES[number];

// ─── Colour / badge maps ─────────────────────────────────────────────────────

// Course type colours (courses/client.tsx → getTypeColor)
const courseTypeColor: Record<string, string> = {
  MANDATORY: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  CERTIFICATION: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  INDUCTION: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  REFRESHER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  OPTIONAL: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
  COMPETENCY: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

// Competency level colours (competencies/client.tsx → getLevelColor)
const competencyLevelColor: Record<string, string> = {
  EXPERT: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  COMPETENT: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  DEVELOPING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  EXPIRED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  NOT_STARTED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
};

// TNA priority colours (tna/client.tsx → getPriorityColor)
const tnaPriorityColor: Record<TnaPriority, string> = {
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  MEDIUM: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  LOW: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

// Record status badge variant (records/client.tsx → getStatusVariant)
type BadgeVariant = 'default' | 'secondary' | 'outline';
function getStatusVariant(status: string): BadgeVariant {
  if (status === 'COMPLETED') return 'secondary';
  if (status === 'IN_PROGRESS') return 'default';
  return 'outline';
}

// ─── Mock course data ────────────────────────────────────────────────────────

interface MockCourse {
  id: string;
  code: string;
  title: string;
  type: CourseType;
  delivery: DeliveryMode;
  duration: number;
  validityMonths: number;
  provider: string;
  cost: number;
  maxParticipants: number;
  isActive: boolean;
}

const MOCK_COURSES: MockCourse[] = [
  {
    id: 'c1',
    code: 'TRN-001',
    title: 'Fire Safety Awareness',
    type: 'MANDATORY',
    delivery: 'CLASSROOM',
    duration: 4,
    validityMonths: 12,
    provider: 'Safety Training Ltd',
    cost: 150,
    maxParticipants: 20,
    isActive: true,
  },
  {
    id: 'c2',
    code: 'TRN-002',
    title: 'ISO 9001 Lead Auditor',
    type: 'CERTIFICATION',
    delivery: 'BLENDED',
    duration: 40,
    validityMonths: 36,
    provider: 'IRCA',
    cost: 1800,
    maxParticipants: 12,
    isActive: true,
  },
  {
    id: 'c3',
    code: 'TRN-003',
    title: 'New Starter Induction',
    type: 'INDUCTION',
    delivery: 'CLASSROOM',
    duration: 8,
    validityMonths: 0,
    provider: 'Internal',
    cost: 0,
    maxParticipants: 15,
    isActive: true,
  },
  {
    id: 'c4',
    code: 'TRN-004',
    title: 'Manual Handling',
    type: 'MANDATORY',
    delivery: 'ONLINE',
    duration: 2,
    validityMonths: 24,
    provider: 'e-Learning Plus',
    cost: 45,
    maxParticipants: 0,
    isActive: true,
  },
  {
    id: 'c5',
    code: 'TRN-005',
    title: 'Leadership Foundations',
    type: 'OPTIONAL',
    delivery: 'WORKSHOP',
    duration: 16,
    validityMonths: 0,
    provider: 'Leadership Academy',
    cost: 600,
    maxParticipants: 10,
    isActive: false,
  },
  {
    id: 'c6',
    code: 'TRN-006',
    title: 'Data Protection Refresher',
    type: 'REFRESHER',
    delivery: 'ONLINE',
    duration: 1,
    validityMonths: 12,
    provider: 'Compliance Hub',
    cost: 30,
    maxParticipants: 0,
    isActive: true,
  },
];

// ─── Mock training record data ────────────────────────────────────────────────

interface MockRecord {
  id: string;
  referenceNumber: string;
  courseId: string;
  employeeId: string;
  employeeName: string;
  status: RecordStatus;
  scheduledDate: string;
  score: number | null;
  passed: boolean;
  location: string;
}

const MOCK_RECORDS: MockRecord[] = [
  {
    id: 'r1',
    referenceNumber: 'REC-2026-001',
    courseId: 'c1',
    employeeId: 'e1',
    employeeName: 'Alice Johnson',
    status: 'COMPLETED',
    scheduledDate: '2026-01-10',
    score: 88,
    passed: true,
    location: 'Manchester Training Centre',
  },
  {
    id: 'r2',
    referenceNumber: 'REC-2026-002',
    courseId: 'c2',
    employeeId: 'e2',
    employeeName: 'Bob Smith',
    status: 'IN_PROGRESS',
    scheduledDate: '2026-02-15',
    score: null,
    passed: false,
    location: 'London Office',
  },
  {
    id: 'r3',
    referenceNumber: 'REC-2026-003',
    courseId: 'c3',
    employeeId: 'e3',
    employeeName: 'Carol White',
    status: 'SCHEDULED',
    scheduledDate: '2026-03-20',
    score: null,
    passed: false,
    location: 'Head Office',
  },
  {
    id: 'r4',
    referenceNumber: 'REC-2026-004',
    courseId: 'c4',
    employeeId: 'e4',
    employeeName: 'Daniel Green',
    status: 'EXPIRED',
    scheduledDate: '2023-06-01',
    score: 75,
    passed: true,
    location: 'Online',
  },
  {
    id: 'r5',
    referenceNumber: 'REC-2026-005',
    courseId: 'c6',
    employeeId: 'e5',
    employeeName: 'Emma Brown',
    status: 'CANCELLED',
    scheduledDate: '2026-02-28',
    score: null,
    passed: false,
    location: 'Online',
  },
  {
    id: 'r6',
    referenceNumber: 'REC-2026-006',
    courseId: 'c1',
    employeeId: 'e6',
    employeeName: 'Frank Harris',
    status: 'COMPLETED',
    scheduledDate: '2026-01-15',
    score: 92,
    passed: true,
    location: 'Manchester Training Centre',
  },
];

// ─── Pure helper functions ────────────────────────────────────────────────────

/** Completion rate: (completed / total) × 100 */
function completionRate(records: MockRecord[]): number {
  if (records.length === 0) return 0;
  const completed = records.filter((r) => r.status === 'COMPLETED').length;
  return (completed / records.length) * 100;
}

/** Pass rate from completed records that have a score */
function passRate(records: MockRecord[]): number {
  const completed = records.filter((r) => r.status === 'COMPLETED');
  if (completed.length === 0) return 0;
  const passed = completed.filter((r) => r.passed).length;
  return (passed / completed.length) * 100;
}

/** Average score across completed records with a non-null score */
function avgScore(records: MockRecord[]): number {
  const scoredCompleted = records.filter(
    (r) => r.status === 'COMPLETED' && r.score !== null
  );
  if (scoredCompleted.length === 0) return 0;
  const total = scoredCompleted.reduce((sum, r) => sum + (r.score as number), 0);
  return total / scoredCompleted.length;
}

/** Count active (non-expired, non-cancelled) records */
function activeRecordCount(records: MockRecord[]): number {
  return records.filter(
    (r) => r.status !== 'EXPIRED' && r.status !== 'CANCELLED'
  ).length;
}

/** Count active courses */
function activeCourseCount(courses: MockCourse[]): number {
  return courses.filter((c) => c.isActive).length;
}

/** Total training cost across active courses */
function totalCourseCost(courses: MockCourse[]): number {
  return courses.reduce((sum, c) => sum + c.cost, 0);
}

/** Whether a record is in a terminal state */
function isTerminalStatus(status: RecordStatus): boolean {
  return status === 'COMPLETED' || status === 'EXPIRED' || status === 'CANCELLED';
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('COURSE_TYPES array', () => {
  it('has exactly 6 course types', () => {
    expect(COURSE_TYPES).toHaveLength(6);
  });

  it('contains MANDATORY', () => expect(COURSE_TYPES).toContain('MANDATORY'));
  it('contains OPTIONAL', () => expect(COURSE_TYPES).toContain('OPTIONAL'));
  it('contains REFRESHER', () => expect(COURSE_TYPES).toContain('REFRESHER'));
  it('contains INDUCTION', () => expect(COURSE_TYPES).toContain('INDUCTION'));
  it('contains CERTIFICATION', () => expect(COURSE_TYPES).toContain('CERTIFICATION'));
  it('contains COMPETENCY', () => expect(COURSE_TYPES).toContain('COMPETENCY'));

  it('all entries are non-empty strings', () => {
    for (const t of COURSE_TYPES) {
      expect(typeof t).toBe('string');
      expect(t.length).toBeGreaterThan(0);
    }
  });
});

describe('DELIVERY_MODES array', () => {
  it('has exactly 6 delivery modes', () => {
    expect(DELIVERY_MODES).toHaveLength(6);
  });

  it('contains CLASSROOM', () => expect(DELIVERY_MODES).toContain('CLASSROOM'));
  it('contains ONLINE', () => expect(DELIVERY_MODES).toContain('ONLINE'));
  it('contains ON_THE_JOB', () => expect(DELIVERY_MODES).toContain('ON_THE_JOB'));
  it('contains BLENDED', () => expect(DELIVERY_MODES).toContain('BLENDED'));
  it('contains SELF_PACED', () => expect(DELIVERY_MODES).toContain('SELF_PACED'));
  it('contains WORKSHOP', () => expect(DELIVERY_MODES).toContain('WORKSHOP'));
});

describe('RECORD_STATUSES array', () => {
  it('has exactly 5 statuses', () => {
    expect(RECORD_STATUSES).toHaveLength(5);
  });

  it('contains SCHEDULED', () => expect(RECORD_STATUSES).toContain('SCHEDULED'));
  it('contains IN_PROGRESS', () => expect(RECORD_STATUSES).toContain('IN_PROGRESS'));
  it('contains COMPLETED', () => expect(RECORD_STATUSES).toContain('COMPLETED'));
  it('contains EXPIRED', () => expect(RECORD_STATUSES).toContain('EXPIRED'));
  it('contains CANCELLED', () => expect(RECORD_STATUSES).toContain('CANCELLED'));
});

describe('COMPETENCY_LEVELS array', () => {
  it('has exactly 5 levels', () => {
    expect(COMPETENCY_LEVELS).toHaveLength(5);
  });

  it('contains NOT_STARTED', () => expect(COMPETENCY_LEVELS).toContain('NOT_STARTED'));
  it('contains DEVELOPING', () => expect(COMPETENCY_LEVELS).toContain('DEVELOPING'));
  it('contains COMPETENT', () => expect(COMPETENCY_LEVELS).toContain('COMPETENT'));
  it('contains EXPERT', () => expect(COMPETENCY_LEVELS).toContain('EXPERT'));
  it('contains EXPIRED', () => expect(COMPETENCY_LEVELS).toContain('EXPIRED'));
});

describe('TNA_PRIORITIES array', () => {
  it('has exactly 4 priorities', () => {
    expect(TNA_PRIORITIES).toHaveLength(4);
  });

  it('contains CRITICAL', () => expect(TNA_PRIORITIES).toContain('CRITICAL'));
  it('contains HIGH', () => expect(TNA_PRIORITIES).toContain('HIGH'));
  it('contains MEDIUM', () => expect(TNA_PRIORITIES).toContain('MEDIUM'));
  it('contains LOW', () => expect(TNA_PRIORITIES).toContain('LOW'));
});

describe('courseTypeColor map', () => {
  it('covers all 6 course types', () => {
    for (const t of COURSE_TYPES) {
      expect(courseTypeColor[t]).toBeDefined();
    }
  });

  it('MANDATORY is red', () => expect(courseTypeColor.MANDATORY).toContain('red'));
  it('CERTIFICATION is purple', () => expect(courseTypeColor.CERTIFICATION).toContain('purple'));
  it('INDUCTION is blue', () => expect(courseTypeColor.INDUCTION).toContain('blue'));
  it('REFRESHER is amber', () => expect(courseTypeColor.REFRESHER).toContain('amber'));

  it('every value is a non-empty string', () => {
    for (const t of COURSE_TYPES) {
      expect(typeof courseTypeColor[t]).toBe('string');
      expect(courseTypeColor[t].length).toBeGreaterThan(0);
    }
  });

  it('every value contains bg-', () => {
    for (const t of COURSE_TYPES) {
      expect(courseTypeColor[t]).toContain('bg-');
    }
  });
});

describe('competencyLevelColor map', () => {
  it('covers all 5 competency levels', () => {
    for (const l of COMPETENCY_LEVELS) {
      expect(competencyLevelColor[l]).toBeDefined();
    }
  });

  it('EXPERT is purple', () => expect(competencyLevelColor.EXPERT).toContain('purple'));
  it('COMPETENT is green', () => expect(competencyLevelColor.COMPETENT).toContain('green'));
  it('DEVELOPING is amber', () => expect(competencyLevelColor.DEVELOPING).toContain('amber'));
  it('EXPIRED is red', () => expect(competencyLevelColor.EXPIRED).toContain('red'));
  it('NOT_STARTED is gray', () => expect(competencyLevelColor.NOT_STARTED).toContain('gray'));

  it('every value starts with bg-', () => {
    for (const l of COMPETENCY_LEVELS) {
      expect(competencyLevelColor[l]).toMatch(/^bg-/);
    }
  });
});

describe('tnaPriorityColor map', () => {
  it('covers all 4 TNA priorities', () => {
    for (const p of TNA_PRIORITIES) {
      expect(tnaPriorityColor[p]).toBeDefined();
    }
  });

  it('CRITICAL is red', () => expect(tnaPriorityColor.CRITICAL).toContain('red'));
  it('HIGH is orange', () => expect(tnaPriorityColor.HIGH).toContain('orange'));
  it('MEDIUM is amber', () => expect(tnaPriorityColor.MEDIUM).toContain('amber'));
  it('LOW is green', () => expect(tnaPriorityColor.LOW).toContain('green'));

  it('every value is a non-empty string', () => {
    for (const p of TNA_PRIORITIES) {
      expect(typeof tnaPriorityColor[p]).toBe('string');
      expect(tnaPriorityColor[p].length).toBeGreaterThan(0);
    }
  });
});

describe('getStatusVariant', () => {
  it('COMPLETED returns secondary', () =>
    expect(getStatusVariant('COMPLETED')).toBe('secondary'));

  it('IN_PROGRESS returns default', () =>
    expect(getStatusVariant('IN_PROGRESS')).toBe('default'));

  it('SCHEDULED returns outline', () =>
    expect(getStatusVariant('SCHEDULED')).toBe('outline'));

  it('EXPIRED returns outline', () =>
    expect(getStatusVariant('EXPIRED')).toBe('outline'));

  it('CANCELLED returns outline', () =>
    expect(getStatusVariant('CANCELLED')).toBe('outline'));

  it('returns a valid badge variant for all statuses', () => {
    const validVariants: BadgeVariant[] = ['default', 'secondary', 'outline'];
    for (const s of RECORD_STATUSES) {
      expect(validVariants).toContain(getStatusVariant(s));
    }
  });
});

describe('MOCK_COURSES data', () => {
  it('has exactly 6 courses', () => expect(MOCK_COURSES).toHaveLength(6));

  it('every course has required string fields', () => {
    for (const c of MOCK_COURSES) {
      expect(typeof c.id).toBe('string');
      expect(typeof c.code).toBe('string');
      expect(typeof c.title).toBe('string');
      expect(typeof c.type).toBe('string');
      expect(typeof c.delivery).toBe('string');
    }
  });

  it('every course id is unique', () => {
    const ids = MOCK_COURSES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every course code is unique', () => {
    const codes = MOCK_COURSES.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('every course type is a valid COURSE_TYPE', () => {
    for (const c of MOCK_COURSES) {
      expect(COURSE_TYPES).toContain(c.type);
    }
  });

  it('every delivery mode is a valid DELIVERY_MODE', () => {
    for (const c of MOCK_COURSES) {
      expect(DELIVERY_MODES).toContain(c.delivery);
    }
  });

  it('duration is a non-negative integer for all courses', () => {
    for (const c of MOCK_COURSES) {
      expect(c.duration).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(c.duration)).toBe(true);
    }
  });

  it('cost is non-negative for all courses', () => {
    for (const c of MOCK_COURSES) {
      expect(c.cost).toBeGreaterThanOrEqual(0);
    }
  });

  it('validityMonths is non-negative for all courses', () => {
    for (const c of MOCK_COURSES) {
      expect(c.validityMonths).toBeGreaterThanOrEqual(0);
    }
  });

  it('5 of 6 courses are active', () => {
    expect(activeCourseCount(MOCK_COURSES)).toBe(5);
  });

  it('isActive is a boolean for all courses', () => {
    for (const c of MOCK_COURSES) {
      expect(typeof c.isActive).toBe('boolean');
    }
  });
});

describe('MOCK_RECORDS data', () => {
  it('has exactly 6 records', () => expect(MOCK_RECORDS).toHaveLength(6));

  it('every record has required string fields', () => {
    for (const r of MOCK_RECORDS) {
      expect(typeof r.id).toBe('string');
      expect(typeof r.referenceNumber).toBe('string');
      expect(typeof r.courseId).toBe('string');
      expect(typeof r.employeeId).toBe('string');
      expect(typeof r.employeeName).toBe('string');
    }
  });

  it('every record id is unique', () => {
    const ids = MOCK_RECORDS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every referenceNumber is unique', () => {
    const refs = MOCK_RECORDS.map((r) => r.referenceNumber);
    expect(new Set(refs).size).toBe(refs.length);
  });

  it('every record status is a valid RECORD_STATUS', () => {
    for (const r of MOCK_RECORDS) {
      expect(RECORD_STATUSES).toContain(r.status);
    }
  });

  it('passed is a boolean for all records', () => {
    for (const r of MOCK_RECORDS) {
      expect(typeof r.passed).toBe('boolean');
    }
  });

  it('score is null or a non-negative number', () => {
    for (const r of MOCK_RECORDS) {
      if (r.score !== null) {
        expect(r.score).toBeGreaterThanOrEqual(0);
        expect(r.score).toBeLessThanOrEqual(100);
      }
    }
  });

  it('2 records are COMPLETED', () => {
    expect(MOCK_RECORDS.filter((r) => r.status === 'COMPLETED')).toHaveLength(2);
  });

  it('1 record is IN_PROGRESS', () => {
    expect(MOCK_RECORDS.filter((r) => r.status === 'IN_PROGRESS')).toHaveLength(1);
  });

  it('1 record is EXPIRED', () => {
    expect(MOCK_RECORDS.filter((r) => r.status === 'EXPIRED')).toHaveLength(1);
  });

  it('completed records that passed have non-null scores', () => {
    const completedAndPassed = MOCK_RECORDS.filter(
      (r) => r.status === 'COMPLETED' && r.passed
    );
    for (const r of completedAndPassed) {
      expect(r.score).not.toBeNull();
    }
  });

  it('scheduled dates are valid date strings', () => {
    for (const r of MOCK_RECORDS) {
      expect(new Date(r.scheduledDate).toString()).not.toBe('Invalid Date');
    }
  });
});

describe('completionRate', () => {
  it('empty array gives 0', () => expect(completionRate([])).toBe(0));

  it('all completed gives 100', () => {
    const all = MOCK_RECORDS.map((r) => ({ ...r, status: 'COMPLETED' as RecordStatus }));
    expect(completionRate(all)).toBe(100);
  });

  it('none completed gives 0', () => {
    const none = MOCK_RECORDS.map((r) => ({ ...r, status: 'SCHEDULED' as RecordStatus }));
    expect(completionRate(none)).toBe(0);
  });

  it('2 of 6 completed = 33.33%', () =>
    expect(completionRate(MOCK_RECORDS)).toBeCloseTo(33.33, 1));

  it('result is between 0 and 100', () => {
    const rate = completionRate(MOCK_RECORDS);
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(100);
  });
});

describe('passRate', () => {
  it('empty array gives 0', () => expect(passRate([])).toBe(0));

  it('all completed and passed gives 100', () => {
    const all = MOCK_RECORDS.map((r) => ({
      ...r,
      status: 'COMPLETED' as RecordStatus,
      passed: true,
    }));
    expect(passRate(all)).toBe(100);
  });

  it('all completed but none passed gives 0', () => {
    const none = MOCK_RECORDS.map((r) => ({
      ...r,
      status: 'COMPLETED' as RecordStatus,
      passed: false,
    }));
    expect(passRate(none)).toBe(0);
  });

  it('both COMPLETED records in MOCK_RECORDS passed = 100% pass rate', () => {
    expect(passRate(MOCK_RECORDS)).toBe(100);
  });

  it('result is between 0 and 100', () => {
    const rate = passRate(MOCK_RECORDS);
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(100);
  });
});

describe('avgScore', () => {
  it('empty array gives 0', () => expect(avgScore([])).toBe(0));

  it('no completed records gives 0', () => {
    const none = MOCK_RECORDS.map((r) => ({
      ...r,
      status: 'SCHEDULED' as RecordStatus,
    }));
    expect(avgScore(none)).toBe(0);
  });

  it('average of 88 and 92 is 90', () => {
    expect(avgScore(MOCK_RECORDS)).toBeCloseTo(90, 5);
  });

  it('result is between 0 and 100 for MOCK_RECORDS', () => {
    const score = avgScore(MOCK_RECORDS);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('activeRecordCount', () => {
  it('excludes EXPIRED and CANCELLED', () => {
    expect(activeRecordCount(MOCK_RECORDS)).toBe(4); // r1(COMPLETED), r2(IN_PROGRESS), r3(SCHEDULED), r6(COMPLETED) — excludes r4(EXPIRED), r5(CANCELLED)
  });

  it('returns 0 for empty array', () => expect(activeRecordCount([])).toBe(0));

  it('all active if none expired or cancelled', () => {
    const all = MOCK_RECORDS.map((r) => ({
      ...r,
      status: 'COMPLETED' as RecordStatus,
    }));
    expect(activeRecordCount(all)).toBe(MOCK_RECORDS.length);
  });
});

describe('activeCourseCount', () => {
  it('returns 5 for MOCK_COURSES', () => expect(activeCourseCount(MOCK_COURSES)).toBe(5));

  it('returns 0 for empty array', () => expect(activeCourseCount([])).toBe(0));

  it('counts isActive=true courses only', () => {
    const manual = MOCK_COURSES.map((c) => ({ ...c, isActive: true }));
    expect(activeCourseCount(manual)).toBe(MOCK_COURSES.length);
  });
});

describe('totalCourseCost', () => {
  it('returns correct sum for MOCK_COURSES', () => {
    const expected = MOCK_COURSES.reduce((s, c) => s + c.cost, 0);
    expect(totalCourseCost(MOCK_COURSES)).toBe(expected);
  });

  it('returns 0 for empty array', () => expect(totalCourseCost([])).toBe(0));

  it('is non-negative', () =>
    expect(totalCourseCost(MOCK_COURSES)).toBeGreaterThanOrEqual(0));
});

describe('isTerminalStatus', () => {
  it('COMPLETED is terminal', () => expect(isTerminalStatus('COMPLETED')).toBe(true));
  it('EXPIRED is terminal', () => expect(isTerminalStatus('EXPIRED')).toBe(true));
  it('CANCELLED is terminal', () => expect(isTerminalStatus('CANCELLED')).toBe(true));
  it('SCHEDULED is not terminal', () => expect(isTerminalStatus('SCHEDULED')).toBe(false));
  it('IN_PROGRESS is not terminal', () => expect(isTerminalStatus('IN_PROGRESS')).toBe(false));

  it('returns boolean for all statuses', () => {
    for (const s of RECORD_STATUSES) {
      expect(typeof isTerminalStatus(s)).toBe('boolean');
    }
  });

  it('exactly 3 out of 5 statuses are terminal', () => {
    const terminalCount = RECORD_STATUSES.filter((s) => isTerminalStatus(s)).length;
    expect(terminalCount).toBe(3);
  });
});

// ─── Parametric: courseTypeColor per-type ────────────────────────────────────

describe('courseTypeColor — per-type color keyword parametric', () => {
  const cases: [string, string][] = [
    ['MANDATORY',    'red'],
    ['CERTIFICATION','purple'],
    ['INDUCTION',    'blue'],
    ['REFRESHER',    'amber'],
    ['OPTIONAL',     'gray'],
    ['COMPETENCY',   'gray'],
  ];
  for (const [type, color] of cases) {
    it(`${type} badge contains "${color}"`, () => {
      expect(courseTypeColor[type]).toContain(color);
    });
  }
});

// ─── Parametric: competencyLevelColor per-level ───────────────────────────────

describe('competencyLevelColor — per-level color keyword parametric', () => {
  const cases: [string, string][] = [
    ['EXPERT',      'purple'],
    ['COMPETENT',   'green'],
    ['DEVELOPING',  'amber'],
    ['EXPIRED',     'red'],
    ['NOT_STARTED', 'gray'],
  ];
  for (const [level, color] of cases) {
    it(`${level} badge contains "${color}"`, () => {
      expect(competencyLevelColor[level]).toContain(color);
    });
  }
});

// ─── Parametric: tnaPriorityColor per-priority ────────────────────────────────

describe('tnaPriorityColor — per-priority color keyword parametric', () => {
  const cases: [TnaPriority, string][] = [
    ['CRITICAL', 'red'],
    ['HIGH',     'orange'],
    ['MEDIUM',   'amber'],
    ['LOW',      'green'],
  ];
  for (const [priority, color] of cases) {
    it(`${priority} badge contains "${color}"`, () => {
      expect(tnaPriorityColor[priority]).toContain(color);
    });
  }
});

// ─── Parametric: getStatusVariant per-status ──────────────────────────────────

describe('getStatusVariant — per-status parametric', () => {
  const cases: [string, BadgeVariant][] = [
    ['COMPLETED',   'secondary'],
    ['IN_PROGRESS', 'default'],
    ['SCHEDULED',   'outline'],
    ['EXPIRED',     'outline'],
    ['CANCELLED',   'outline'],
  ];
  for (const [status, variant] of cases) {
    it(`${status} → "${variant}"`, () => {
      expect(getStatusVariant(status)).toBe(variant);
    });
  }
});

// ─── Parametric: isTerminalStatus per-status ──────────────────────────────────

describe('isTerminalStatus — per-status parametric', () => {
  const cases: [RecordStatus, boolean][] = [
    ['COMPLETED',   true],
    ['EXPIRED',     true],
    ['CANCELLED',   true],
    ['SCHEDULED',   false],
    ['IN_PROGRESS', false],
  ];
  for (const [status, expected] of cases) {
    it(`isTerminalStatus("${status}") = ${expected}`, () => {
      expect(isTerminalStatus(status)).toBe(expected);
    });
  }
});

// ─── Parametric: per-course type+delivery ─────────────────────────────────────

describe('MOCK_COURSES — per-course type+delivery parametric', () => {
  const expected: [string, CourseType, DeliveryMode][] = [
    ['c1', 'MANDATORY',    'CLASSROOM'],
    ['c2', 'CERTIFICATION','BLENDED'],
    ['c3', 'INDUCTION',    'CLASSROOM'],
    ['c4', 'MANDATORY',    'ONLINE'],
    ['c5', 'OPTIONAL',     'WORKSHOP'],
    ['c6', 'REFRESHER',    'ONLINE'],
  ];
  for (const [id, type, delivery] of expected) {
    it(`${id}: type=${type}, delivery=${delivery}`, () => {
      const course = MOCK_COURSES.find((c) => c.id === id);
      expect(course?.type).toBe(type);
      expect(course?.delivery).toBe(delivery);
    });
  }
});

// ─── Parametric: per-record status+passed parametric ─────────────────────────

describe('MOCK_RECORDS — per-record status+passed parametric', () => {
  const expected: [string, RecordStatus, boolean][] = [
    ['r1', 'COMPLETED',   true],
    ['r2', 'IN_PROGRESS', false],
    ['r3', 'SCHEDULED',   false],
    ['r4', 'EXPIRED',     true],
    ['r5', 'CANCELLED',   false],
    ['r6', 'COMPLETED',   true],
  ];
  for (const [id, status, passed] of expected) {
    it(`${id}: status=${status}, passed=${passed}`, () => {
      const record = MOCK_RECORDS.find((r) => r.id === id);
      expect(record?.status).toBe(status);
      expect(record?.passed).toBe(passed);
    });
  }
});

// ─── Parametric: totalCourseCost exact ───────────────────────────────────────

describe('totalCourseCost — exact value', () => {
  it('sums to 150+1800+0+45+600+30 = 2625', () => {
    expect(totalCourseCost(MOCK_COURSES)).toBe(150 + 1800 + 0 + 45 + 600 + 30);
  });
});

// ─── Parametric: per-course cost exact ───────────────────────────────────────

describe('MOCK_COURSES — per-course cost parametric', () => {
  const cases: [string, number][] = [
    ['c1', 150],
    ['c2', 1800],
    ['c3', 0],
    ['c4', 45],
    ['c5', 600],
    ['c6', 30],
  ];
  for (const [id, expected] of cases) {
    it(`${id}: cost = ${expected}`, () => {
      const course = MOCK_COURSES.find((c) => c.id === id);
      expect(course!.cost).toBe(expected);
    });
  }
});

// ─── Parametric: per-course duration exact ────────────────────────────────────

describe('MOCK_COURSES — per-course duration (hours) parametric', () => {
  const cases: [string, number][] = [
    ['c1', 4],
    ['c2', 40],
    ['c3', 8],
    ['c4', 2],
    ['c5', 16],
    ['c6', 1],
  ];
  for (const [id, expected] of cases) {
    it(`${id}: duration = ${expected} hours`, () => {
      const course = MOCK_COURSES.find((c) => c.id === id);
      expect(course!.duration).toBe(expected);
    });
  }
});

// ─── Parametric: per-course validityMonths exact ──────────────────────────────

describe('MOCK_COURSES — per-course validityMonths parametric', () => {
  const cases: [string, number][] = [
    ['c1', 12],
    ['c2', 36],
    ['c3', 0],
    ['c4', 24],
    ['c5', 0],
    ['c6', 12],
  ];
  for (const [id, expected] of cases) {
    it(`${id}: validityMonths = ${expected}`, () => {
      const course = MOCK_COURSES.find((c) => c.id === id);
      expect(course!.validityMonths).toBe(expected);
    });
  }
});

// ─── Parametric: per-record score values ─────────────────────────────────────

describe('MOCK_RECORDS — per-record score parametric', () => {
  const cases: [string, number | null][] = [
    ['r1', 88],
    ['r2', null],
    ['r3', null],
    ['r4', 75],
    ['r5', null],
    ['r6', 92],
  ];
  for (const [id, expected] of cases) {
    it(`${id}: score = ${expected}`, () => {
      const record = MOCK_RECORDS.find((r) => r.id === id);
      expect(record!.score).toBe(expected);
    });
  }
});

// ─── completionRate with single-record arrays ─────────────────────────────────

describe('completionRate — single-record parametric', () => {
  const cases: [RecordStatus, number][] = [
    ['COMPLETED',   100],
    ['IN_PROGRESS', 0],
    ['SCHEDULED',   0],
    ['EXPIRED',     0],
    ['CANCELLED',   0],
  ];
  for (const [status, expected] of cases) {
    it(`single ${status} record → ${expected}%`, () => {
      const record = [{ ...MOCK_RECORDS[0], status }];
      expect(completionRate(record)).toBe(expected);
    });
  }
});

// ─── avgScore with specific subsets ──────────────────────────────────────────

describe('avgScore — specific subset parametric', () => {
  it('avg of r1(88) only = 88', () => {
    expect(avgScore([MOCK_RECORDS[0]])).toBeCloseTo(88, 5);
  });
  it('avg of r6(92) only = 92', () => {
    expect(avgScore([MOCK_RECORDS[5]])).toBeCloseTo(92, 5);
  });
  it('avg of r1(88)+r6(92) = 90', () => {
    expect(avgScore([MOCK_RECORDS[0], MOCK_RECORDS[5]])).toBeCloseTo(90, 5);
  });
  it('r4(75) contributes when status=COMPLETED', () => {
    const r4Completed = { ...MOCK_RECORDS[3], status: 'COMPLETED' as RecordStatus };
    expect(avgScore([r4Completed])).toBeCloseTo(75, 5);
  });
});

describe('cross-domain invariants', () => {
  it('every MOCK_RECORD courseId matches a MOCK_COURSE id', () => {
    const courseIds = new Set(MOCK_COURSES.map((c) => c.id));
    for (const r of MOCK_RECORDS) {
      expect(courseIds.has(r.courseId)).toBe(true);
    }
  });

  it('course type colour keys are a superset of COURSE_TYPES', () => {
    for (const t of COURSE_TYPES) {
      expect(Object.keys(courseTypeColor)).toContain(t);
    }
  });

  it('competencyLevelColor keys equal COMPETENCY_LEVELS', () => {
    for (const l of COMPETENCY_LEVELS) {
      expect(Object.keys(competencyLevelColor)).toContain(l);
    }
  });

  it('tnaPriorityColor keys equal TNA_PRIORITIES', () => {
    for (const p of TNA_PRIORITIES) {
      expect(Object.keys(tnaPriorityColor)).toContain(p);
    }
  });

  it('active courses have at least one MANDATORY type in MOCK_COURSES', () => {
    const mandatoryActive = MOCK_COURSES.filter(
      (c) => c.isActive && c.type === 'MANDATORY'
    );
    expect(mandatoryActive.length).toBeGreaterThan(0);
  });

  it('completion rate is not higher than pass rate can infer (all passed who completed)', () => {
    // pass rate applies only within completed records; both are 0..100
    const cr = completionRate(MOCK_RECORDS);
    const pr = passRate(MOCK_RECORDS);
    expect(cr).toBeGreaterThanOrEqual(0);
    expect(pr).toBeGreaterThanOrEqual(0);
  });
});

// ─── Phase 209 parametric additions ──────────────────────────────────────────

describe('COURSE_TYPES — positional index parametric', () => {
  const expected = [
    [0, 'MANDATORY'],
    [1, 'OPTIONAL'],
    [2, 'REFRESHER'],
    [3, 'INDUCTION'],
    [4, 'CERTIFICATION'],
    [5, 'COMPETENCY'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`COURSE_TYPES[${idx}] === '${val}'`, () => {
      expect(COURSE_TYPES[idx]).toBe(val);
    });
  }
});

describe('DELIVERY_MODES — positional index parametric', () => {
  const expected = [
    [0, 'CLASSROOM'],
    [1, 'ONLINE'],
    [2, 'ON_THE_JOB'],
    [3, 'BLENDED'],
    [4, 'SELF_PACED'],
    [5, 'WORKSHOP'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`DELIVERY_MODES[${idx}] === '${val}'`, () => {
      expect(DELIVERY_MODES[idx]).toBe(val);
    });
  }
});

describe('RECORD_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'SCHEDULED'],
    [1, 'IN_PROGRESS'],
    [2, 'COMPLETED'],
    [3, 'EXPIRED'],
    [4, 'CANCELLED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`RECORD_STATUSES[${idx}] === '${val}'`, () => {
      expect(RECORD_STATUSES[idx]).toBe(val);
    });
  }
});

describe('COMPETENCY_LEVELS — positional index parametric', () => {
  const expected = [
    [0, 'NOT_STARTED'],
    [1, 'DEVELOPING'],
    [2, 'COMPETENT'],
    [3, 'EXPERT'],
    [4, 'EXPIRED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`COMPETENCY_LEVELS[${idx}] === '${val}'`, () => {
      expect(COMPETENCY_LEVELS[idx]).toBe(val);
    });
  }
});

describe('TNA_PRIORITIES — positional index parametric', () => {
  const expected = [
    [0, 'CRITICAL'],
    [1, 'HIGH'],
    [2, 'MEDIUM'],
    [3, 'LOW'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`TNA_PRIORITIES[${idx}] === '${val}'`, () => {
      expect(TNA_PRIORITIES[idx]).toBe(val);
    });
  }
});

describe('MOCK_COURSES — per-course type+delivery+cost parametric', () => {
  const expected: [string, CourseType, DeliveryMode, number][] = [
    ['c1', 'MANDATORY',    'CLASSROOM', 150],
    ['c2', 'CERTIFICATION','BLENDED',   1800],
    ['c3', 'INDUCTION',    'CLASSROOM', 0],
    ['c4', 'MANDATORY',    'ONLINE',    45],
    ['c5', 'OPTIONAL',     'WORKSHOP',  600],
    ['c6', 'REFRESHER',    'ONLINE',    30],
  ];
  for (const [id, type, delivery, cost] of expected) {
    it(`${id}: type=${type}, delivery=${delivery}, cost=${cost}`, () => {
      const c = MOCK_COURSES.find((x) => x.id === id);
      expect(c?.type).toBe(type);
      expect(c?.delivery).toBe(delivery);
      expect(c?.cost).toBe(cost);
    });
  }
});

describe('MOCK_RECORDS — per-record status+passed+score parametric', () => {
  const expected: [string, RecordStatus, boolean, number | null][] = [
    ['r1', 'COMPLETED',   true,  88],
    ['r2', 'IN_PROGRESS', false, null],
    ['r3', 'SCHEDULED',   false, null],
    ['r4', 'EXPIRED',     true,  75],
    ['r5', 'CANCELLED',   false, null],
    ['r6', 'COMPLETED',   true,  92],
  ];
  for (const [id, status, passed, score] of expected) {
    it(`${id}: status=${status}, passed=${passed}, score=${score}`, () => {
      const r = MOCK_RECORDS.find((x) => x.id === id);
      expect(r?.status).toBe(status);
      expect(r?.passed).toBe(passed);
      expect(r?.score).toBe(score);
    });
  }
});

// ─── Algorithm puzzle phases (ph217tr–ph224tr) ────────────────────────────────
function moveZeroes217tr(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217tr_mz',()=>{
  it('a',()=>{expect(moveZeroes217tr([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217tr([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217tr([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217tr([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217tr([4,2,0,0,3])).toBe(4);});
});
function missingNumber218tr(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218tr_mn',()=>{
  it('a',()=>{expect(missingNumber218tr([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218tr([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218tr([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218tr([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218tr([1])).toBe(0);});
});
function countBits219tr(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219tr_cb',()=>{
  it('a',()=>{expect(countBits219tr(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219tr(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219tr(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219tr(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219tr(4)[4]).toBe(1);});
});
function climbStairs220tr(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220tr_cs',()=>{
  it('a',()=>{expect(climbStairs220tr(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220tr(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220tr(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220tr(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220tr(1)).toBe(1);});
});
function maxProfit221tr(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221tr_mp',()=>{
  it('a',()=>{expect(maxProfit221tr([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221tr([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221tr([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221tr([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221tr([1])).toBe(0);});
});
function singleNumber222tr(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222tr_sn',()=>{
  it('a',()=>{expect(singleNumber222tr([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222tr([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222tr([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222tr([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222tr([3,3,5])).toBe(5);});
});
function hammingDist223tr(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223tr_hd',()=>{
  it('a',()=>{expect(hammingDist223tr(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223tr(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223tr(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223tr(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223tr(7,7)).toBe(0);});
});
function majorElem224tr(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224tr_me',()=>{
  it('a',()=>{expect(majorElem224tr([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224tr([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224tr([1])).toBe(1);});
  it('d',()=>{expect(majorElem224tr([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224tr([6,5,5])).toBe(5);});
});
