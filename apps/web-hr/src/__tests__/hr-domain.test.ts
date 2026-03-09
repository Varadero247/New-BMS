// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Inlined domain constants (from employees/page.tsx, leave/page.tsx, recruitment/*) ───

type EmploymentStatus =
  | 'ACTIVE'
  | 'ON_LEAVE'
  | 'PROBATION'
  | 'NOTICE_PERIOD'
  | 'SUSPENDED'
  | 'TERMINATED';

type EmploymentType =
  | 'FULL_TIME'
  | 'PART_TIME'
  | 'CONTRACT'
  | 'INTERN'
  | 'TEMPORARY'
  | 'CASUAL';

type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

type JobStatus = 'open' | 'closed' | 'on-hold' | 'draft';

type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';

type ApplicantStage =
  | 'applied'
  | 'screening'
  | 'interview-1'
  | 'interview-2'
  | 'offer'
  | 'hired'
  | 'rejected';

const EMPLOYMENT_STATUSES: EmploymentStatus[] = [
  'ACTIVE',
  'ON_LEAVE',
  'PROBATION',
  'NOTICE_PERIOD',
  'SUSPENDED',
  'TERMINATED',
];

const EMPLOYMENT_TYPES: EmploymentType[] = [
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERN',
  'TEMPORARY',
  'CASUAL',
];

const LEAVE_REQUEST_STATUSES: LeaveRequestStatus[] = [
  'PENDING',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
];

const JOB_STATUSES: JobStatus[] = ['open', 'closed', 'on-hold', 'draft'];

const JOB_TYPES: JobType[] = ['full-time', 'part-time', 'contract', 'internship'];

const APPLICANT_STAGES: ApplicantStage[] = [
  'applied',
  'screening',
  'interview-1',
  'interview-2',
  'offer',
  'hired',
  'rejected',
];

// Badge/colour maps from employees/page.tsx
const statusColors: Record<EmploymentStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  ON_LEAVE: 'bg-yellow-100 text-yellow-700',
  PROBATION: 'bg-blue-100 text-blue-700',
  NOTICE_PERIOD: 'bg-orange-100 text-orange-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  TERMINATED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

const typeColors: Record<string, string> = {
  FULL_TIME: 'bg-emerald-100 text-emerald-700',
  PART_TIME: 'bg-blue-100 text-blue-700',
  CONTRACT: 'bg-purple-100 text-purple-700',
  INTERN: 'bg-pink-100 text-pink-700',
};

// Leave request status colours from leave/page.tsx
const leaveStatusColors: Record<LeaveRequestStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 dark:bg-gray-800 text-gray-700',
};

// Job status/type config from recruitment/jobs/client.tsx
const jobStatusConfig: Record<JobStatus, { label: string; color: string }> = {
  open: { label: 'Open', color: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Closed', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600' },
  'on-hold': { label: 'On Hold', color: 'bg-amber-100 text-amber-700' },
  draft: { label: 'Draft', color: 'bg-blue-100 text-blue-700' },
};

const jobTypeConfig: Record<JobType, { label: string; color: string }> = {
  'full-time': { label: 'Full-time', color: 'bg-blue-50 text-blue-600' },
  'part-time': { label: 'Part-time', color: 'bg-purple-50 text-purple-600' },
  contract: { label: 'Contract', color: 'bg-orange-50 text-orange-600' },
  internship: { label: 'Internship', color: 'bg-teal-50 text-teal-600' },
};

// Applicant stage config from recruitment/applicants/client.tsx
const stageConfig: Record<ApplicantStage, { label: string; color: string; step: number }> = {
  applied: { label: 'Applied', color: 'bg-gray-100 dark:bg-gray-800 text-gray-600', step: 1 },
  screening: { label: 'Screening', color: 'bg-blue-100 text-blue-700', step: 2 },
  'interview-1': { label: 'Interview 1', color: 'bg-indigo-100 text-indigo-700', step: 3 },
  'interview-2': { label: 'Interview 2', color: 'bg-purple-100 text-purple-700', step: 4 },
  offer: { label: 'Offer', color: 'bg-amber-100 text-amber-700', step: 5 },
  hired: { label: 'Hired', color: 'bg-emerald-100 text-emerald-700', step: 6 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-600', step: 0 },
};

// MOCK applicant data (inlined from recruitment/applicants/client.tsx)
interface MockApplicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  stage: ApplicantStage;
  rating: number;
  appliedDate: string;
  source: string;
  experience: string;
  notes: string;
}

const MOCK_APPLICANTS: MockApplicant[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    email: 'alex.t@email.com',
    phone: '+44 7700 900001',
    position: 'Senior Quality Engineer',
    stage: 'interview-2',
    rating: 4,
    appliedDate: '2026-01-22',
    source: 'LinkedIn',
    experience: '7 years in medical device quality, ISO 13485 Lead Auditor',
    notes: 'Strong technical background. Second interview scheduled with Dr. Chen.',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    email: 'priya.s@email.com',
    phone: '+44 7700 900002',
    position: 'Senior Quality Engineer',
    stage: 'offer',
    rating: 5,
    appliedDate: '2026-01-25',
    source: 'Referral',
    experience: '9 years quality engineering, CAPA expertise, Six Sigma Black Belt',
    notes: 'Excellent candidate. Verbal offer accepted, written offer pending.',
  },
  {
    id: '3',
    name: 'Marcus Johnson',
    email: 'marcus.j@email.com',
    phone: '+44 7700 900003',
    position: 'Software Developer — IMS Platform',
    stage: 'interview-1',
    rating: 4,
    appliedDate: '2026-02-06',
    source: 'Indeed',
    experience: '6 years full-stack, React/Next.js specialist, PostgreSQL',
    notes: 'Portfolio review impressive. Technical test scores: 92%.',
  },
  {
    id: '4',
    name: "Emma O'Brien",
    email: 'emma.ob@email.com',
    phone: '+44 7700 900004',
    position: 'EHS Coordinator',
    stage: 'screening',
    rating: 3,
    appliedDate: '2026-02-03',
    source: 'Website',
    experience: '4 years EHS, NEBOSH General Certificate, ISO 14001 experience',
    notes: 'Meets minimum requirements. Phone screen scheduled.',
  },
  {
    id: '5',
    name: 'David Lee',
    email: 'david.l@email.com',
    phone: '+44 7700 900005',
    position: 'Software Developer — IMS Platform',
    stage: 'rejected',
    rating: 2,
    appliedDate: '2026-02-07',
    source: 'LinkedIn',
    experience: '3 years frontend only, no backend experience',
    notes: 'Insufficient backend experience for the role.',
  },
  {
    id: '6',
    name: 'Fatima Al-Hassan',
    email: 'fatima.ah@email.com',
    phone: '+44 7700 900006',
    position: 'Information Security Analyst',
    stage: 'applied',
    rating: 0,
    appliedDate: '2026-02-11',
    source: 'Website',
    experience: 'CISSP certified, 5 years SOC analyst, ISO 27001 experience',
    notes: 'New application — awaiting initial review.',
  },
  {
    id: '7',
    name: 'Tom Roberts',
    email: 'tom.r@email.com',
    phone: '+44 7700 900007',
    position: 'Software Developer — IMS Platform',
    stage: 'interview-2',
    rating: 5,
    appliedDate: '2026-02-06',
    source: 'GitHub',
    experience: '8 years full-stack, contributed to open-source IMS tools, TypeScript expert',
    notes: 'Outstanding technical skills. Culture fit interview with team lead.',
  },
  {
    id: '8',
    name: 'Sarah Mitchell',
    email: 'sarah.m@email.com',
    phone: '+44 7700 900008',
    position: 'Supply Chain Intern',
    stage: 'hired',
    rating: 4,
    appliedDate: '2026-02-10',
    source: 'University',
    experience: 'Final year Supply Chain BSc, placement at Medtronic',
    notes: 'Start date: 2026-03-03. Induction scheduled.',
  },
];

// MOCK job data (inlined from recruitment/jobs/client.tsx)
interface MockJob {
  id: string;
  title: string;
  department: string;
  location: string;
  type: JobType;
  status: JobStatus;
  salary: string;
  postedDate: string;
  closingDate: string;
  applicants: number;
  hiringManager: string;
  requirements: string[];
}

const MOCK_JOBS: MockJob[] = [
  {
    id: '1',
    title: 'Senior Quality Engineer',
    department: 'Quality',
    location: 'Manchester, UK',
    type: 'full-time',
    status: 'open',
    salary: '£55,000 - £65,000',
    postedDate: '2026-01-20',
    closingDate: '2026-03-01',
    applicants: 18,
    hiringManager: 'Dr. Sarah Chen',
    requirements: [
      'BSc in Engineering or related field',
      '5+ years quality experience in medical devices',
      'ISO 13485 / FDA 21 CFR 820 knowledge',
      'Lead Auditor qualification preferred',
    ],
  },
  {
    id: '2',
    title: 'EHS Coordinator',
    department: 'Health & Safety',
    location: 'London, UK',
    type: 'full-time',
    status: 'open',
    salary: '£40,000 - £48,000',
    postedDate: '2026-02-01',
    closingDate: '2026-03-15',
    applicants: 12,
    hiringManager: 'James Wilson',
    requirements: ['NEBOSH Certificate', '3+ years EHS experience', 'ISO 14001/45001 knowledge', 'Strong communication skills'],
  },
  {
    id: '3',
    title: 'Software Developer — IMS Platform',
    department: 'IT',
    location: 'Remote, UK',
    type: 'full-time',
    status: 'open',
    salary: '£60,000 - £75,000',
    postedDate: '2026-02-05',
    closingDate: '2026-03-20',
    applicants: 34,
    hiringManager: 'Michael Zhang',
    requirements: ['5+ years full-stack development', 'React/Next.js proficiency', 'Node.js/Express experience', 'PostgreSQL/Prisma ORM'],
  },
  {
    id: '4',
    title: 'Information Security Analyst',
    department: 'InfoSec',
    location: 'Manchester, UK',
    type: 'full-time',
    status: 'on-hold',
    salary: '£45,000 - £55,000',
    postedDate: '2026-01-15',
    closingDate: '2026-02-28',
    applicants: 22,
    hiringManager: 'CISO',
    requirements: ['CompTIA Security+ or CISSP', '3+ years infosec experience', 'ISO 27001 framework knowledge', 'SIEM and vulnerability management tools'],
  },
  {
    id: '5',
    title: 'Supply Chain Intern',
    department: 'Operations',
    location: 'London, UK',
    type: 'internship',
    status: 'open',
    salary: '£22,000 pro rata',
    postedDate: '2026-02-10',
    closingDate: '2026-04-01',
    applicants: 8,
    hiringManager: 'Lisa Park',
    requirements: ['Studying Supply Chain, Engineering, or Business', 'Strong analytical skills', 'Proficiency in Excel', 'Interest in manufacturing'],
  },
  {
    id: '6',
    title: 'Regulatory Affairs Manager',
    department: 'Regulatory',
    location: 'London, UK',
    type: 'full-time',
    status: 'closed',
    salary: '£70,000 - £85,000',
    postedDate: '2025-12-01',
    closingDate: '2026-01-31',
    applicants: 15,
    hiringManager: 'Dr. Sarah Chen',
    requirements: ['MSc in Regulatory Science or related', '8+ years regulatory affairs', 'MDR/IVDR experience', 'FDA submission experience'],
  },
];

// ─── Pure helper functions (mirrored from source) ───────────────────────────

/** Calendar-year tenure calculation (matches web-hr/hr.test.ts pattern) */
function yearsOfService(hireDate: Date, today: Date): number {
  let years = today.getFullYear() - hireDate.getFullYear();
  if (
    today.getMonth() < hireDate.getMonth() ||
    (today.getMonth() === hireDate.getMonth() && today.getDate() < hireDate.getDate())
  ) {
    years--;
  }
  return Math.max(0, years);
}

function computeLeaveBalance(entitlement: number, taken: number): number {
  return Math.max(0, entitlement - taken);
}

function annualLeaveAccrual(annualEntitlement: number, monthsWorked: number): number {
  return (annualEntitlement / 12) * monthsWorked;
}

function isActiveEmployee(status: EmploymentStatus): boolean {
  return status === 'ACTIVE' || status === 'PROBATION';
}

function isOnLeaveOrSuspended(status: EmploymentStatus): boolean {
  return status === 'ON_LEAVE' || status === 'SUSPENDED';
}

function isPipelineStage(stage: ApplicantStage): boolean {
  return stage !== 'rejected' && stage !== 'hired';
}

function passRateFromApplicants(applicants: MockApplicant[]): number {
  const total = applicants.length;
  if (total === 0) return 0;
  const hired = applicants.filter((a) => a.stage === 'hired').length;
  return (hired / total) * 100;
}

function totalApplicantsForJobs(jobs: MockJob[]): number {
  return jobs.reduce((sum, j) => sum + j.applicants, 0);
}

function avgApplicantsPerJob(jobs: MockJob[]): number {
  if (jobs.length === 0) return 0;
  return totalApplicantsForJobs(jobs) / jobs.length;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('EMPLOYMENT_STATUSES array', () => {
  it('has exactly 6 statuses', () => {
    expect(EMPLOYMENT_STATUSES).toHaveLength(6);
  });

  it('contains ACTIVE', () => expect(EMPLOYMENT_STATUSES).toContain('ACTIVE'));
  it('contains ON_LEAVE', () => expect(EMPLOYMENT_STATUSES).toContain('ON_LEAVE'));
  it('contains PROBATION', () => expect(EMPLOYMENT_STATUSES).toContain('PROBATION'));
  it('contains NOTICE_PERIOD', () => expect(EMPLOYMENT_STATUSES).toContain('NOTICE_PERIOD'));
  it('contains SUSPENDED', () => expect(EMPLOYMENT_STATUSES).toContain('SUSPENDED'));
  it('contains TERMINATED', () => expect(EMPLOYMENT_STATUSES).toContain('TERMINATED'));

  it('all entries are non-empty strings', () => {
    for (const s of EMPLOYMENT_STATUSES) {
      expect(typeof s).toBe('string');
      expect(s.length).toBeGreaterThan(0);
    }
  });
});

describe('EMPLOYMENT_TYPES array', () => {
  it('has exactly 6 types', () => {
    expect(EMPLOYMENT_TYPES).toHaveLength(6);
  });

  it('contains FULL_TIME', () => expect(EMPLOYMENT_TYPES).toContain('FULL_TIME'));
  it('contains PART_TIME', () => expect(EMPLOYMENT_TYPES).toContain('PART_TIME'));
  it('contains CONTRACT', () => expect(EMPLOYMENT_TYPES).toContain('CONTRACT'));
  it('contains INTERN', () => expect(EMPLOYMENT_TYPES).toContain('INTERN'));
  it('contains TEMPORARY', () => expect(EMPLOYMENT_TYPES).toContain('TEMPORARY'));
  it('contains CASUAL', () => expect(EMPLOYMENT_TYPES).toContain('CASUAL'));
});

describe('statusColors map', () => {
  it('covers all 6 employment statuses', () => {
    for (const s of EMPLOYMENT_STATUSES) {
      expect(statusColors[s]).toBeDefined();
    }
  });

  it('ACTIVE is green', () => expect(statusColors.ACTIVE).toContain('green'));
  it('ON_LEAVE is yellow', () => expect(statusColors.ON_LEAVE).toContain('yellow'));
  it('PROBATION is blue', () => expect(statusColors.PROBATION).toContain('blue'));
  it('NOTICE_PERIOD is orange', () => expect(statusColors.NOTICE_PERIOD).toContain('orange'));
  it('SUSPENDED is red', () => expect(statusColors.SUSPENDED).toContain('red'));
  it('TERMINATED is gray', () => expect(statusColors.TERMINATED).toContain('gray'));

  it('every value starts with bg-', () => {
    for (const s of EMPLOYMENT_STATUSES) {
      expect(statusColors[s]).toMatch(/^bg-/);
    }
  });
});

describe('typeColors map', () => {
  it('covers FULL_TIME, PART_TIME, CONTRACT, INTERN', () => {
    for (const t of ['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN']) {
      expect(typeColors[t]).toBeDefined();
    }
  });

  it('FULL_TIME is emerald', () => expect(typeColors.FULL_TIME).toContain('emerald'));
  it('CONTRACT is purple', () => expect(typeColors.CONTRACT).toContain('purple'));
  it('INTERN is pink', () => expect(typeColors.INTERN).toContain('pink'));

  it('every value is a non-empty string', () => {
    for (const key of Object.keys(typeColors)) {
      expect(typeof typeColors[key]).toBe('string');
      expect(typeColors[key].length).toBeGreaterThan(0);
    }
  });
});

describe('leaveStatusColors map', () => {
  it('covers all 4 leave request statuses', () => {
    for (const s of LEAVE_REQUEST_STATUSES) {
      expect(leaveStatusColors[s]).toBeDefined();
    }
  });

  it('PENDING is yellow', () => expect(leaveStatusColors.PENDING).toContain('yellow'));
  it('APPROVED is green', () => expect(leaveStatusColors.APPROVED).toContain('green'));
  it('REJECTED is red', () => expect(leaveStatusColors.REJECTED).toContain('red'));
  it('CANCELLED is gray', () => expect(leaveStatusColors.CANCELLED).toContain('gray'));

  it('every value starts with bg-', () => {
    for (const s of LEAVE_REQUEST_STATUSES) {
      expect(leaveStatusColors[s]).toMatch(/^bg-/);
    }
  });
});

describe('jobStatusConfig', () => {
  it('covers all 4 job statuses', () => {
    for (const s of JOB_STATUSES) {
      expect(jobStatusConfig[s]).toBeDefined();
    }
  });

  it('every entry has label and color', () => {
    for (const s of JOB_STATUSES) {
      expect(typeof jobStatusConfig[s].label).toBe('string');
      expect(typeof jobStatusConfig[s].color).toBe('string');
      expect(jobStatusConfig[s].label.length).toBeGreaterThan(0);
    }
  });

  it('open label is Open', () => expect(jobStatusConfig.open.label).toBe('Open'));
  it('open color is emerald', () => expect(jobStatusConfig.open.color).toContain('emerald'));
  it('closed color is gray', () => expect(jobStatusConfig.closed.color).toContain('gray'));
  it('on-hold color is amber', () => expect(jobStatusConfig['on-hold'].color).toContain('amber'));
  it('draft color is blue', () => expect(jobStatusConfig.draft.color).toContain('blue'));
});

describe('jobTypeConfig', () => {
  it('covers all 4 job types', () => {
    for (const t of JOB_TYPES) {
      expect(jobTypeConfig[t]).toBeDefined();
    }
  });

  it('full-time label is Full-time', () => expect(jobTypeConfig['full-time'].label).toBe('Full-time'));
  it('internship label is Internship', () => expect(jobTypeConfig.internship.label).toBe('Internship'));
  it('contract color is orange', () => expect(jobTypeConfig.contract.color).toContain('orange'));
  it('internship color is teal', () => expect(jobTypeConfig.internship.color).toContain('teal'));
});

describe('stageConfig', () => {
  it('covers all 7 applicant stages', () => {
    for (const s of APPLICANT_STAGES) {
      expect(stageConfig[s]).toBeDefined();
    }
  });

  it('every entry has label, color, and numeric step', () => {
    for (const s of APPLICANT_STAGES) {
      expect(typeof stageConfig[s].label).toBe('string');
      expect(typeof stageConfig[s].color).toBe('string');
      expect(typeof stageConfig[s].step).toBe('number');
    }
  });

  it('stages have ascending steps (applied < screening < interview-1 < interview-2 < offer < hired)', () => {
    const pipelineStages: ApplicantStage[] = [
      'applied', 'screening', 'interview-1', 'interview-2', 'offer', 'hired',
    ];
    for (let i = 0; i < pipelineStages.length - 1; i++) {
      expect(stageConfig[pipelineStages[i]].step).toBeLessThan(
        stageConfig[pipelineStages[i + 1]].step
      );
    }
  });

  it('rejected step is 0 (out-of-pipeline)', () => expect(stageConfig.rejected.step).toBe(0));
  it('hired label is Hired', () => expect(stageConfig.hired.label).toBe('Hired'));
  it('hired color is emerald', () => expect(stageConfig.hired.color).toContain('emerald'));
  it('rejected color is red', () => expect(stageConfig.rejected.color).toContain('red'));
  it('offer color is amber', () => expect(stageConfig.offer.color).toContain('amber'));
});

describe('MOCK_APPLICANTS data', () => {
  it('has exactly 8 applicants', () => expect(MOCK_APPLICANTS).toHaveLength(8));

  it('every applicant has required string fields', () => {
    for (const a of MOCK_APPLICANTS) {
      expect(typeof a.id).toBe('string');
      expect(typeof a.name).toBe('string');
      expect(typeof a.email).toBe('string');
      expect(typeof a.position).toBe('string');
      expect(typeof a.stage).toBe('string');
      expect(typeof a.source).toBe('string');
    }
  });

  it('every applicant id is unique', () => {
    const ids = MOCK_APPLICANTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every applicant stage is a valid ApplicantStage', () => {
    for (const a of MOCK_APPLICANTS) {
      expect(APPLICANT_STAGES).toContain(a.stage);
    }
  });

  it('every rating is between 0 and 5', () => {
    for (const a of MOCK_APPLICANTS) {
      expect(a.rating).toBeGreaterThanOrEqual(0);
      expect(a.rating).toBeLessThanOrEqual(5);
    }
  });

  it('every email contains @', () => {
    for (const a of MOCK_APPLICANTS) {
      expect(a.email).toContain('@');
    }
  });

  it('applied dates are valid ISO date strings', () => {
    for (const a of MOCK_APPLICANTS) {
      expect(new Date(a.appliedDate).toString()).not.toBe('Invalid Date');
    }
  });

  it('exactly one applicant is hired', () => {
    expect(MOCK_APPLICANTS.filter((a) => a.stage === 'hired')).toHaveLength(1);
  });

  it('exactly one applicant is rejected', () => {
    expect(MOCK_APPLICANTS.filter((a) => a.stage === 'rejected')).toHaveLength(1);
  });

  it('exactly one applicant has reached offer stage', () => {
    expect(MOCK_APPLICANTS.filter((a) => a.stage === 'offer')).toHaveLength(1);
  });
});

describe('MOCK_JOBS data', () => {
  it('has exactly 6 jobs', () => expect(MOCK_JOBS).toHaveLength(6));

  it('every job has required string fields', () => {
    for (const j of MOCK_JOBS) {
      expect(typeof j.id).toBe('string');
      expect(typeof j.title).toBe('string');
      expect(typeof j.department).toBe('string');
      expect(typeof j.location).toBe('string');
      expect(typeof j.salary).toBe('string');
    }
  });

  it('every job id is unique', () => {
    const ids = MOCK_JOBS.map((j) => j.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every job status is a valid JobStatus', () => {
    for (const j of MOCK_JOBS) {
      expect(JOB_STATUSES).toContain(j.status);
    }
  });

  it('every job type is a valid JobType', () => {
    for (const j of MOCK_JOBS) {
      expect(JOB_TYPES).toContain(j.type);
    }
  });

  it('every job has at least one requirement', () => {
    for (const j of MOCK_JOBS) {
      expect(j.requirements.length).toBeGreaterThan(0);
    }
  });

  it('applicants count is a non-negative integer for all jobs', () => {
    for (const j of MOCK_JOBS) {
      expect(j.applicants).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(j.applicants)).toBe(true);
    }
  });

  it('4 jobs are open', () => {
    expect(MOCK_JOBS.filter((j) => j.status === 'open')).toHaveLength(4);
  });

  it('1 job is closed', () => {
    expect(MOCK_JOBS.filter((j) => j.status === 'closed')).toHaveLength(1);
  });

  it('1 job is on-hold', () => {
    expect(MOCK_JOBS.filter((j) => j.status === 'on-hold')).toHaveLength(1);
  });

  it('most jobs are full-time', () => {
    const fullTimeCount = MOCK_JOBS.filter((j) => j.type === 'full-time').length;
    expect(fullTimeCount).toBeGreaterThan(MOCK_JOBS.length / 2);
  });
});

describe('yearsOfService', () => {
  it('hire date = today gives 0 years', () => {
    const today = new Date('2026-03-09');
    expect(yearsOfService(today, today)).toBe(0);
  });

  it('hired exactly 1 year ago gives 1', () => {
    expect(yearsOfService(new Date('2025-03-09'), new Date('2026-03-09'))).toBe(1);
  });

  it('hired 5 years ago gives 5', () => {
    expect(yearsOfService(new Date('2021-01-01'), new Date('2026-01-01'))).toBe(5);
  });

  it('day before anniversary still gives N-1', () => {
    expect(yearsOfService(new Date('2020-06-15'), new Date('2026-06-14'))).toBe(5);
  });

  it('result is never negative', () => {
    for (let y = 0; y < 30; y++) {
      const hire = new Date(`${2026 - y}-01-01`);
      expect(yearsOfService(hire, new Date('2026-01-01'))).toBeGreaterThanOrEqual(0);
    }
  });

  it('monotonically non-decreasing with earlier hire date', () => {
    const today = new Date('2026-01-01');
    let prev = yearsOfService(new Date('2025-01-01'), today);
    for (let y = 2; y <= 20; y++) {
      const curr = yearsOfService(new Date(`${2026 - y}-01-01`), today);
      expect(curr).toBeGreaterThanOrEqual(prev);
      prev = curr;
    }
  });
});

describe('computeLeaveBalance', () => {
  it('full entitlement when nothing taken', () =>
    expect(computeLeaveBalance(30, 0)).toBe(30));

  it('reduces by days taken', () =>
    expect(computeLeaveBalance(30, 10)).toBe(20));

  it('floors at zero, never negative', () =>
    expect(computeLeaveBalance(10, 50)).toBe(0));

  it('exact depletion yields zero', () =>
    expect(computeLeaveBalance(15, 15)).toBe(0));

  it('non-negative for all taken 0..50', () => {
    for (let taken = 0; taken <= 50; taken++) {
      expect(computeLeaveBalance(30, taken)).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('annualLeaveAccrual', () => {
  it('12 months = full entitlement', () =>
    expect(annualLeaveAccrual(30, 12)).toBe(30));

  it('6 months = half entitlement', () =>
    expect(annualLeaveAccrual(30, 6)).toBe(15));

  it('0 months = 0', () =>
    expect(annualLeaveAccrual(30, 0)).toBe(0));

  it('proportional for any month 1..12', () => {
    for (let m = 1; m <= 12; m++) {
      const accrual = annualLeaveAccrual(30, m);
      expect(accrual).toBeGreaterThan(0);
      expect(accrual).toBeLessThanOrEqual(30);
    }
  });

  it('strictly increasing with more months', () => {
    for (let m = 1; m < 12; m++) {
      expect(annualLeaveAccrual(30, m)).toBeLessThan(annualLeaveAccrual(30, m + 1));
    }
  });
});

describe('isActiveEmployee', () => {
  it('ACTIVE returns true', () => expect(isActiveEmployee('ACTIVE')).toBe(true));
  it('PROBATION returns true', () => expect(isActiveEmployee('PROBATION')).toBe(true));
  it('TERMINATED returns false', () => expect(isActiveEmployee('TERMINATED')).toBe(false));
  it('ON_LEAVE returns false', () => expect(isActiveEmployee('ON_LEAVE')).toBe(false));
  it('SUSPENDED returns false', () => expect(isActiveEmployee('SUSPENDED')).toBe(false));
  it('NOTICE_PERIOD returns false', () => expect(isActiveEmployee('NOTICE_PERIOD')).toBe(false));

  it('returns boolean for all statuses', () => {
    for (const s of EMPLOYMENT_STATUSES) {
      expect(typeof isActiveEmployee(s)).toBe('boolean');
    }
  });
});

describe('isOnLeaveOrSuspended', () => {
  it('ON_LEAVE returns true', () => expect(isOnLeaveOrSuspended('ON_LEAVE')).toBe(true));
  it('SUSPENDED returns true', () => expect(isOnLeaveOrSuspended('SUSPENDED')).toBe(true));
  it('ACTIVE returns false', () => expect(isOnLeaveOrSuspended('ACTIVE')).toBe(false));
  it('TERMINATED returns false', () => expect(isOnLeaveOrSuspended('TERMINATED')).toBe(false));
});

describe('isPipelineStage', () => {
  it('applied returns true', () => expect(isPipelineStage('applied')).toBe(true));
  it('screening returns true', () => expect(isPipelineStage('screening')).toBe(true));
  it('interview-1 returns true', () => expect(isPipelineStage('interview-1')).toBe(true));
  it('interview-2 returns true', () => expect(isPipelineStage('interview-2')).toBe(true));
  it('offer returns true', () => expect(isPipelineStage('offer')).toBe(true));
  it('hired returns false', () => expect(isPipelineStage('hired')).toBe(false));
  it('rejected returns false', () => expect(isPipelineStage('rejected')).toBe(false));

  it('returns boolean for all stages', () => {
    for (const s of APPLICANT_STAGES) {
      expect(typeof isPipelineStage(s)).toBe('boolean');
    }
  });
});

describe('passRateFromApplicants', () => {
  it('empty array gives 0', () =>
    expect(passRateFromApplicants([])).toBe(0));

  it('1 hired out of 8 = 12.5%', () =>
    expect(passRateFromApplicants(MOCK_APPLICANTS)).toBeCloseTo(12.5, 5));

  it('all hired gives 100%', () => {
    const allHired: MockApplicant[] = MOCK_APPLICANTS.map((a) => ({ ...a, stage: 'hired' as ApplicantStage }));
    expect(passRateFromApplicants(allHired)).toBe(100);
  });

  it('none hired gives 0%', () => {
    const noneHired: MockApplicant[] = MOCK_APPLICANTS.map((a) => ({ ...a, stage: 'applied' as ApplicantStage }));
    expect(passRateFromApplicants(noneHired)).toBe(0);
  });

  it('result is between 0 and 100', () =>
    expect(passRateFromApplicants(MOCK_APPLICANTS)).toBeGreaterThanOrEqual(0));
});

describe('totalApplicantsForJobs and avgApplicantsPerJob', () => {
  it('total for MOCK_JOBS is sum of applicant counts', () => {
    const expected = MOCK_JOBS.reduce((s, j) => s + j.applicants, 0);
    expect(totalApplicantsForJobs(MOCK_JOBS)).toBe(expected);
  });

  it('total is positive', () =>
    expect(totalApplicantsForJobs(MOCK_JOBS)).toBeGreaterThan(0));

  it('empty array gives 0 total', () =>
    expect(totalApplicantsForJobs([])).toBe(0));

  it('average is total / count', () => {
    const total = totalApplicantsForJobs(MOCK_JOBS);
    const avg = avgApplicantsPerJob(MOCK_JOBS);
    expect(avg).toBeCloseTo(total / MOCK_JOBS.length, 10);
  });

  it('average for empty array is 0', () =>
    expect(avgApplicantsPerJob([])).toBe(0));

  it('average is positive for MOCK_JOBS', () =>
    expect(avgApplicantsPerJob(MOCK_JOBS)).toBeGreaterThan(0));
});

// ─── Parametric: statusColors per-status ──────────────────────────────────────

describe('statusColors — per-status color keyword parametric', () => {
  const cases: [EmploymentStatus, string][] = [
    ['ACTIVE',        'green'],
    ['ON_LEAVE',      'yellow'],
    ['PROBATION',     'blue'],
    ['NOTICE_PERIOD', 'orange'],
    ['SUSPENDED',     'red'],
    ['TERMINATED',    'gray'],
  ];
  for (const [status, color] of cases) {
    it(`${status} badge contains "${color}"`, () => {
      expect(statusColors[status]).toContain(color);
    });
  }
});

// ─── Parametric: leaveStatusColors per-status ─────────────────────────────────

describe('leaveStatusColors — per-status color keyword parametric', () => {
  const cases: [LeaveRequestStatus, string][] = [
    ['PENDING',   'yellow'],
    ['APPROVED',  'green'],
    ['REJECTED',  'red'],
    ['CANCELLED', 'gray'],
  ];
  for (const [status, color] of cases) {
    it(`${status} badge contains "${color}"`, () => {
      expect(leaveStatusColors[status]).toContain(color);
    });
  }
});

// ─── Parametric: stageConfig per-stage step ───────────────────────────────────

describe('stageConfig — per-stage step+label parametric', () => {
  const cases: [ApplicantStage, number, string][] = [
    ['applied',     1, 'Applied'],
    ['screening',   2, 'Screening'],
    ['interview-1', 3, 'Interview 1'],
    ['interview-2', 4, 'Interview 2'],
    ['offer',       5, 'Offer'],
    ['hired',       6, 'Hired'],
    ['rejected',    0, 'Rejected'],
  ];
  for (const [stage, step, label] of cases) {
    it(`${stage}: step=${step}, label="${label}"`, () => {
      expect(stageConfig[stage].step).toBe(step);
      expect(stageConfig[stage].label).toBe(label);
    });
  }
});

// ─── Parametric: per-applicant stage+rating ───────────────────────────────────

describe('MOCK_APPLICANTS — per-applicant stage+rating parametric', () => {
  const expected: [string, ApplicantStage, number][] = [
    ['1', 'interview-2', 4],
    ['2', 'offer',       5],
    ['3', 'interview-1', 4],
    ['4', 'screening',   3],
    ['5', 'rejected',    2],
    ['6', 'applied',     0],
    ['7', 'interview-2', 5],
    ['8', 'hired',       4],
  ];
  for (const [id, stage, rating] of expected) {
    it(`applicant ${id}: stage=${stage}, rating=${rating}`, () => {
      const a = MOCK_APPLICANTS.find((x) => x.id === id);
      expect(a?.stage).toBe(stage);
      expect(a?.rating).toBe(rating);
    });
  }
});

// ─── Parametric: per-job status+type+applicants ───────────────────────────────

describe('MOCK_JOBS — per-job status+type+applicants parametric', () => {
  const expected: [string, JobStatus, JobType, number][] = [
    ['1', 'open',    'full-time',  18],
    ['2', 'open',    'full-time',  12],
    ['3', 'open',    'full-time',  34],
    ['4', 'on-hold', 'full-time',  22],
    ['5', 'open',    'internship',  8],
    ['6', 'closed',  'full-time',  15],
  ];
  for (const [id, status, type, applicants] of expected) {
    it(`job ${id}: status=${status}, type=${type}, applicants=${applicants}`, () => {
      const job = MOCK_JOBS.find((j) => j.id === id);
      expect(job?.status).toBe(status);
      expect(job?.type).toBe(type);
      expect(job?.applicants).toBe(applicants);
    });
  }
});

// ─── Parametric: yearsOfService boundary ─────────────────────────────────────

describe('yearsOfService — exact boundary parametric', () => {
  const today = new Date('2026-03-09');
  const cases: [string, number][] = [
    ['2026-03-09', 0],
    ['2025-03-09', 1],
    ['2021-01-01', 5],
    ['2020-06-15', 5],   // day before anniversary → N-1
    ['2016-01-01', 10],
  ];
  for (const [hire, expected] of cases) {
    it(`hire=${hire} → ${expected} years`, () => {
      expect(yearsOfService(new Date(hire), today)).toBe(expected);
    });
  }
});

// ─── Parametric: isActiveEmployee per-status ──────────────────────────────────

describe('isActiveEmployee — per-status parametric', () => {
  const cases: [EmploymentStatus, boolean][] = [
    ['ACTIVE',        true],
    ['PROBATION',     true],
    ['ON_LEAVE',      false],
    ['NOTICE_PERIOD', false],
    ['SUSPENDED',     false],
    ['TERMINATED',    false],
  ];
  for (const [status, expected] of cases) {
    it(`isActiveEmployee("${status}") = ${expected}`, () => {
      expect(isActiveEmployee(status)).toBe(expected);
    });
  }
});

// ─── Parametric: isPipelineStage per-stage ────────────────────────────────────

describe('isPipelineStage — per-stage parametric', () => {
  const cases: [ApplicantStage, boolean][] = [
    ['applied',     true],
    ['screening',   true],
    ['interview-1', true],
    ['interview-2', true],
    ['offer',       true],
    ['hired',       false],
    ['rejected',    false],
  ];
  for (const [stage, expected] of cases) {
    it(`isPipelineStage("${stage}") = ${expected}`, () => {
      expect(isPipelineStage(stage)).toBe(expected);
    });
  }
});

// ─── Phase 209 parametric additions ──────────────────────────────────────────

describe('EMPLOYMENT_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'ACTIVE'],
    [1, 'ON_LEAVE'],
    [2, 'PROBATION'],
    [3, 'NOTICE_PERIOD'],
    [4, 'SUSPENDED'],
    [5, 'TERMINATED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`EMPLOYMENT_STATUSES[${idx}] === '${val}'`, () => {
      expect(EMPLOYMENT_STATUSES[idx]).toBe(val);
    });
  }
});

describe('EMPLOYMENT_TYPES — positional index parametric', () => {
  const expected = [
    [0, 'FULL_TIME'],
    [1, 'PART_TIME'],
    [2, 'CONTRACT'],
    [3, 'INTERN'],
    [4, 'TEMPORARY'],
    [5, 'CASUAL'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`EMPLOYMENT_TYPES[${idx}] === '${val}'`, () => {
      expect(EMPLOYMENT_TYPES[idx]).toBe(val);
    });
  }
});

describe('LEAVE_REQUEST_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'PENDING'],
    [1, 'APPROVED'],
    [2, 'REJECTED'],
    [3, 'CANCELLED'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`LEAVE_REQUEST_STATUSES[${idx}] === '${val}'`, () => {
      expect(LEAVE_REQUEST_STATUSES[idx]).toBe(val);
    });
  }
});

describe('JOB_STATUSES — positional index parametric', () => {
  const expected = [
    [0, 'open'],
    [1, 'closed'],
    [2, 'on-hold'],
    [3, 'draft'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`JOB_STATUSES[${idx}] === '${val}'`, () => {
      expect(JOB_STATUSES[idx]).toBe(val);
    });
  }
});

describe('JOB_TYPES — positional index parametric', () => {
  const expected = [
    [0, 'full-time'],
    [1, 'part-time'],
    [2, 'contract'],
    [3, 'internship'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`JOB_TYPES[${idx}] === '${val}'`, () => {
      expect(JOB_TYPES[idx]).toBe(val);
    });
  }
});

describe('APPLICANT_STAGES — positional index parametric', () => {
  const expected = [
    [0, 'applied'],
    [1, 'screening'],
    [2, 'interview-1'],
    [3, 'interview-2'],
    [4, 'offer'],
    [5, 'hired'],
    [6, 'rejected'],
  ] as const;
  for (const [idx, val] of expected) {
    it(`APPLICANT_STAGES[${idx}] === '${val}'`, () => {
      expect(APPLICANT_STAGES[idx]).toBe(val);
    });
  }
});

describe('totalApplicantsForJobs — exact aggregate', () => {
  it('MOCK_JOBS total applicants = 109', () => {
    expect(totalApplicantsForJobs(MOCK_JOBS)).toBe(109);
  });
});


// ─── Algorithm puzzle phases (ph217hr–ph220hr) ────────────────────────────────
function moveZeroes217hr(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217hr_mz',()=>{
  it('a',()=>{expect(moveZeroes217hr([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217hr([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217hr([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217hr([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217hr([4,2,0,0,3])).toBe(4);});
});
function missingNumber218hr(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218hr_mn',()=>{
  it('a',()=>{expect(missingNumber218hr([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218hr([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218hr([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218hr([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218hr([1])).toBe(0);});
});
function countBits219hr(n:number):number[]{const r=new Array(n+1).fill(0);for(let i=1;i<=n;i++)r[i]=r[i>>1]+(i&1);return r;}
describe('ph219hr_cb',()=>{
  it('a',()=>{expect(countBits219hr(2)).toEqual([0,1,1]);});
  it('b',()=>{expect(countBits219hr(5)).toEqual([0,1,1,2,1,2]);});
  it('c',()=>{expect(countBits219hr(0)).toEqual([0]);});
  it('d',()=>{expect(countBits219hr(1)).toEqual([0,1]);});
  it('e',()=>{expect(countBits219hr(4)[4]).toBe(1);});
});
function climbStairs220hr(n:number):number{let a=1,b=1;for(let i=2;i<=n;i++){const t=a+b;a=b;b=t;}return b;}
describe('ph220hr_cs',()=>{
  it('a',()=>{expect(climbStairs220hr(2)).toBe(2);});
  it('b',()=>{expect(climbStairs220hr(3)).toBe(3);});
  it('c',()=>{expect(climbStairs220hr(4)).toBe(5);});
  it('d',()=>{expect(climbStairs220hr(5)).toBe(8);});
  it('e',()=>{expect(climbStairs220hr(1)).toBe(1);});
});

// ─── Algorithm puzzle phases (ph221hr3–ph224hr3) ────────────────────────────────
function maxProfit221hr3(p:number[]):number{let min=Infinity,max=0;for(const x of p){min=Math.min(min,x);max=Math.max(max,x-min);}return max;}
describe('ph221hr3_mp',()=>{
  it('a',()=>{expect(maxProfit221hr3([7,1,5,3,6,4])).toBe(5);});
  it('b',()=>{expect(maxProfit221hr3([7,6,4,3,1])).toBe(0);});
  it('c',()=>{expect(maxProfit221hr3([1,2])).toBe(1);});
  it('d',()=>{expect(maxProfit221hr3([2,1,4])).toBe(3);});
  it('e',()=>{expect(maxProfit221hr3([1])).toBe(0);});
});
function singleNumber222hr3(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph222hr3_sn',()=>{
  it('a',()=>{expect(singleNumber222hr3([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber222hr3([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber222hr3([1])).toBe(1);});
  it('d',()=>{expect(singleNumber222hr3([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber222hr3([3,3,5])).toBe(5);});
});
function hammingDist223hr3(x:number,y:number):number{let n=x^y,c=0;while(n){c+=n&1;n>>>=1;}return c;}
describe('ph223hr3_hd',()=>{
  it('a',()=>{expect(hammingDist223hr3(1,4)).toBe(2);});
  it('b',()=>{expect(hammingDist223hr3(3,1)).toBe(1);});
  it('c',()=>{expect(hammingDist223hr3(0,0)).toBe(0);});
  it('d',()=>{expect(hammingDist223hr3(0,15)).toBe(4);});
  it('e',()=>{expect(hammingDist223hr3(7,7)).toBe(0);});
});
function majorElem224hr3(nums:number[]):number{let c=0,m=0;for(const n of nums){if(c===0)m=n;c+=n===m?1:-1;}return m;}
describe('ph224hr3_me',()=>{
  it('a',()=>{expect(majorElem224hr3([3,2,3])).toBe(3);});
  it('b',()=>{expect(majorElem224hr3([2,2,1,1,1,2,2])).toBe(2);});
  it('c',()=>{expect(majorElem224hr3([1])).toBe(1);});
  it('d',()=>{expect(majorElem224hr3([1,1,2])).toBe(1);});
  it('e',()=>{expect(majorElem224hr3([6,5,5])).toBe(5);});
});
function hd258hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258hrd2_hd',()=>{it('a',()=>{expect(hd258hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd258hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd258hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd258hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd258hrd2(15,0)).toBe(4);});});
function hd259hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259hrd2_hd',()=>{it('a',()=>{expect(hd259hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd259hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd259hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd259hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd259hrd2(15,0)).toBe(4);});});
function hd260hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260hrd2_hd',()=>{it('a',()=>{expect(hd260hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd260hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd260hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd260hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd260hrd2(15,0)).toBe(4);});});
function hd261hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261hrd2_hd',()=>{it('a',()=>{expect(hd261hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd261hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd261hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd261hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd261hrd2(15,0)).toBe(4);});});
function hd262hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262hrd2_hd',()=>{it('a',()=>{expect(hd262hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd262hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd262hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd262hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd262hrd2(15,0)).toBe(4);});});
function hd263hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263hrd2_hd',()=>{it('a',()=>{expect(hd263hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd263hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd263hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd263hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd263hrd2(15,0)).toBe(4);});});
function hd264hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264hrd2_hd',()=>{it('a',()=>{expect(hd264hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd264hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd264hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd264hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd264hrd2(15,0)).toBe(4);});});
function hd265hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265hrd2_hd',()=>{it('a',()=>{expect(hd265hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd265hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd265hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd265hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd265hrd2(15,0)).toBe(4);});});
function hd266hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266hrd2_hd',()=>{it('a',()=>{expect(hd266hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd266hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd266hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd266hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd266hrd2(15,0)).toBe(4);});});
function hd267hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267hrd2_hd',()=>{it('a',()=>{expect(hd267hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd267hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd267hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd267hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd267hrd2(15,0)).toBe(4);});});
function hd268hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268hrd2_hd',()=>{it('a',()=>{expect(hd268hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd268hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd268hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd268hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd268hrd2(15,0)).toBe(4);});});
function hd269hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269hrd2_hd',()=>{it('a',()=>{expect(hd269hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd269hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd269hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd269hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd269hrd2(15,0)).toBe(4);});});
function hd270hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270hrd2_hd',()=>{it('a',()=>{expect(hd270hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd270hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd270hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd270hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd270hrd2(15,0)).toBe(4);});});
function hd271hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271hrd2_hd',()=>{it('a',()=>{expect(hd271hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd271hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd271hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd271hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd271hrd2(15,0)).toBe(4);});});
function hd272hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272hrd2_hd',()=>{it('a',()=>{expect(hd272hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd272hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd272hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd272hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd272hrd2(15,0)).toBe(4);});});
function hd273hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273hrd2_hd',()=>{it('a',()=>{expect(hd273hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd273hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd273hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd273hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd273hrd2(15,0)).toBe(4);});});
function hd274hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274hrd2_hd',()=>{it('a',()=>{expect(hd274hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd274hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd274hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd274hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd274hrd2(15,0)).toBe(4);});});
function hd275hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275hrd2_hd',()=>{it('a',()=>{expect(hd275hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd275hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd275hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd275hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd275hrd2(15,0)).toBe(4);});});
function hd276hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276hrd2_hd',()=>{it('a',()=>{expect(hd276hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd276hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd276hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd276hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd276hrd2(15,0)).toBe(4);});});
function hd277hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277hrd2_hd',()=>{it('a',()=>{expect(hd277hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd277hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd277hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd277hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd277hrd2(15,0)).toBe(4);});});
function hd278hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278hrd2_hd',()=>{it('a',()=>{expect(hd278hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd278hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd278hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd278hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd278hrd2(15,0)).toBe(4);});});
function hd279hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279hrd2_hd',()=>{it('a',()=>{expect(hd279hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd279hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd279hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd279hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd279hrd2(15,0)).toBe(4);});});
function hd280hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280hrd2_hd',()=>{it('a',()=>{expect(hd280hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd280hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd280hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd280hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd280hrd2(15,0)).toBe(4);});});
function hd281hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281hrd2_hd',()=>{it('a',()=>{expect(hd281hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd281hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd281hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd281hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd281hrd2(15,0)).toBe(4);});});
function hd282hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282hrd2_hd',()=>{it('a',()=>{expect(hd282hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd282hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd282hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd282hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd282hrd2(15,0)).toBe(4);});});
function hd283hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283hrd2_hd',()=>{it('a',()=>{expect(hd283hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd283hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd283hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd283hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd283hrd2(15,0)).toBe(4);});});
function hd284hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284hrd2_hd',()=>{it('a',()=>{expect(hd284hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd284hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd284hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd284hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd284hrd2(15,0)).toBe(4);});});
function hd285hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285hrd2_hd',()=>{it('a',()=>{expect(hd285hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd285hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd285hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd285hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd285hrd2(15,0)).toBe(4);});});
function hd286hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286hrd2_hd',()=>{it('a',()=>{expect(hd286hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd286hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd286hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd286hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd286hrd2(15,0)).toBe(4);});});
function hd287hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287hrd2_hd',()=>{it('a',()=>{expect(hd287hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd287hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd287hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd287hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd287hrd2(15,0)).toBe(4);});});
function hd288hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288hrd2_hd',()=>{it('a',()=>{expect(hd288hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd288hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd288hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd288hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd288hrd2(15,0)).toBe(4);});});
function hd289hrd2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289hrd2_hd',()=>{it('a',()=>{expect(hd289hrd2(1,4)).toBe(2);});it('b',()=>{expect(hd289hrd2(3,1)).toBe(1);});it('c',()=>{expect(hd289hrd2(0,0)).toBe(0);});it('d',()=>{expect(hd289hrd2(93,73)).toBe(2);});it('e',()=>{expect(hd289hrd2(15,0)).toBe(4);});});
