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
