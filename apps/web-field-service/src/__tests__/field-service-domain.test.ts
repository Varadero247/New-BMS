// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ── Domain constants (inlined — no imports from page source files) ─────────

type JobStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PENDING' | 'CANCELLED';
type JobPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
type TechnicianStatus = 'AVAILABLE' | 'ON_JOB' | 'EN_ROUTE' | 'OFF_DUTY' | 'ON_LEAVE';
type ScheduleType = 'PREVENTIVE' | 'REACTIVE' | 'INSPECTION' | 'INSTALLATION' | 'EMERGENCY';
type ScheduleStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
type Recurrence = 'NONE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
type KpiCategory = 'OPERATIONS' | 'FINANCIAL' | 'QUALITY' | 'CUSTOMER' | 'SAFETY' | 'PRODUCTIVITY';
type KpiTrend = 'UP' | 'DOWN' | 'FLAT' | 'STABLE';
type KpiPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';

const JOB_STATUSES: JobStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PENDING', 'CANCELLED'];
const JOB_PRIORITIES: JobPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
const TECHNICIAN_STATUSES: TechnicianStatus[] = ['AVAILABLE', 'ON_JOB', 'EN_ROUTE', 'OFF_DUTY', 'ON_LEAVE'];
const SCHEDULE_TYPES: ScheduleType[] = ['PREVENTIVE', 'REACTIVE', 'INSPECTION', 'INSTALLATION', 'EMERGENCY'];
const SCHEDULE_STATUSES: ScheduleStatus[] = ['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const RECURRENCES: Recurrence[] = ['NONE', 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'];
const KPI_CATEGORIES: KpiCategory[] = ['OPERATIONS', 'FINANCIAL', 'QUALITY', 'CUSTOMER', 'SAFETY', 'PRODUCTIVITY'];
const KPI_TRENDS: KpiTrend[] = ['UP', 'DOWN', 'FLAT', 'STABLE'];
const KPI_PERIODS: KpiPeriod[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUALLY'];

const priorityColors: Record<JobPriority, string> = {
  URGENT: 'bg-red-100 text-red-700',
  HIGH: 'bg-orange-100 text-orange-700',
  MEDIUM: 'bg-yellow-100 text-yellow-700',
  LOW: 'bg-green-100 text-green-700',
};

const jobStatusColors: Record<JobStatus, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  SCHEDULED: 'bg-purple-100 text-purple-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
};

const technicianStatusColors: Record<TechnicianStatus, string> = {
  AVAILABLE: 'bg-green-100 text-green-700',
  ON_JOB: 'bg-blue-100 text-blue-700',
  EN_ROUTE: 'bg-yellow-100 text-yellow-700',
  OFF_DUTY: 'bg-gray-100 text-gray-600',
  ON_LEAVE: 'bg-orange-100 text-orange-700',
};

const scheduleStatusColors: Record<ScheduleStatus, string> = {
  CONFIRMED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-teal-100 text-teal-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const kpiTrendColors: Record<KpiTrend, string> = {
  UP: 'bg-green-100 text-green-700',
  DOWN: 'bg-red-100 text-red-700',
  FLAT: 'bg-gray-100 text-gray-600',
  STABLE: 'bg-blue-100 text-blue-700',
};

// ── Mock data ──────────────────────────────────────────────────────────────

interface Job {
  id: string;
  jobNumber: string;
  title: string;
  customerName: string;
  technicianName: string;
  scheduledDate: string;
  priority: JobPriority;
  status: JobStatus;
  siteAddress: string;
  estimatedHours: number;
}

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string;
  certifications: string;
  region: string;
  status: TechnicianStatus;
  activeJobs: number;
}

interface ScheduleEntry {
  id: string;
  title: string;
  technicianName: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  type: ScheduleType;
  recurrence: Recurrence;
  status: ScheduleStatus;
}

interface KpiEntry {
  id: string;
  name: string;
  category: KpiCategory;
  currentValue: number;
  target: number;
  unit: string;
  trend: KpiTrend;
  period: KpiPeriod;
}

const MOCK_JOBS: Job[] = [
  { id: 'j1', jobNumber: 'JOB-2026-001', title: 'HVAC Maintenance Service', customerName: 'Acme Corp', technicianName: 'John Smith', scheduledDate: '2026-03-15', priority: 'HIGH', status: 'SCHEDULED', siteAddress: '10 Main St, London', estimatedHours: 4 },
  { id: 'j2', jobNumber: 'JOB-2026-002', title: 'Electrical Panel Repair', customerName: 'Beta Ltd', technicianName: 'Sarah Jones', scheduledDate: '2026-03-16', priority: 'URGENT', status: 'IN_PROGRESS', siteAddress: '25 Park Ave, Manchester', estimatedHours: 6 },
  { id: 'j3', jobNumber: 'JOB-2026-003', title: 'Annual Boiler Inspection', customerName: 'Gamma PLC', technicianName: 'Mike Taylor', scheduledDate: '2026-03-10', priority: 'MEDIUM', status: 'COMPLETED', siteAddress: '7 Church Rd, Birmingham', estimatedHours: 3 },
  { id: 'j4', jobNumber: 'JOB-2026-004', title: 'Fire Suppression Test', customerName: 'Delta Inc', technicianName: '', scheduledDate: '2026-03-20', priority: 'LOW', status: 'PENDING', siteAddress: '100 High St, Leeds', estimatedHours: 2 },
  { id: 'j5', jobNumber: 'JOB-2026-005', title: 'Chiller Unit Replacement', customerName: 'Epsilon Co', technicianName: 'Jane Brown', scheduledDate: '2026-03-12', priority: 'HIGH', status: 'CANCELLED', siteAddress: '55 King St, Bristol', estimatedHours: 8 },
];

const MOCK_TECHNICIANS: Technician[] = [
  { id: 't1', name: 'John Smith', email: 'j.smith@company.com', phone: '+44 7700 100001', specialization: 'HVAC', certifications: 'Gas Safe, F-Gas', region: 'London', status: 'AVAILABLE', activeJobs: 0 },
  { id: 't2', name: 'Sarah Jones', email: 's.jones@company.com', phone: '+44 7700 100002', specialization: 'Electrical', certifications: 'NICEIC, City & Guilds', region: 'Manchester', status: 'ON_JOB', activeJobs: 1 },
  { id: 't3', name: 'Mike Taylor', email: 'm.taylor@company.com', phone: '+44 7700 100003', specialization: 'Plumbing', certifications: 'CIPHE', region: 'Birmingham', status: 'EN_ROUTE', activeJobs: 1 },
  { id: 't4', name: 'Jane Brown', email: 'j.brown@company.com', phone: '+44 7700 100004', specialization: 'Fire Safety', certifications: 'BAFE', region: 'Bristol', status: 'OFF_DUTY', activeJobs: 0 },
  { id: 't5', name: 'Paul Green', email: 'p.green@company.com', phone: '+44 7700 100005', specialization: 'HVAC', certifications: 'Gas Safe', region: 'Leeds', status: 'ON_LEAVE', activeJobs: 0 },
];

const MOCK_SCHEDULES: ScheduleEntry[] = [
  { id: 's1', title: 'Quarterly HVAC Inspection', technicianName: 'John Smith', scheduledDate: '2026-03-15', scheduledTime: '09:00', duration: 2, type: 'PREVENTIVE', recurrence: 'QUARTERLY', status: 'CONFIRMED' },
  { id: 's2', title: 'Emergency Boiler Repair', technicianName: 'Mike Taylor', scheduledDate: '2026-03-09', scheduledTime: '14:00', duration: 3, type: 'EMERGENCY', recurrence: 'NONE', status: 'IN_PROGRESS' },
  { id: 's3', title: 'Electrical Safety Inspection', technicianName: 'Sarah Jones', scheduledDate: '2026-03-20', scheduledTime: '10:00', duration: 4, type: 'INSPECTION', recurrence: 'ANNUALLY', status: 'PENDING' },
  { id: 's4', title: 'New AC Installation', technicianName: 'John Smith', scheduledDate: '2026-03-25', scheduledTime: '08:00', duration: 6, type: 'INSTALLATION', recurrence: 'NONE', status: 'CONFIRMED' },
  { id: 's5', title: 'Reactive Pump Repair', technicianName: 'Jane Brown', scheduledDate: '2026-03-08', scheduledTime: '11:00', duration: 2, type: 'REACTIVE', recurrence: 'NONE', status: 'CANCELLED' },
];

const MOCK_KPIS: KpiEntry[] = [
  { id: 'k1', name: 'First-Time Fix Rate', category: 'QUALITY', currentValue: 87, target: 90, unit: '%', trend: 'UP', period: 'MONTHLY' },
  { id: 'k2', name: 'Mean Time to Repair', category: 'OPERATIONS', currentValue: 3.2, target: 4.0, unit: 'hrs', trend: 'DOWN', period: 'WEEKLY' },
  { id: 'k3', name: 'Customer Satisfaction', category: 'CUSTOMER', currentValue: 92, target: 90, unit: '%', trend: 'UP', period: 'MONTHLY' },
  { id: 'k4', name: 'Revenue per Job', category: 'FINANCIAL', currentValue: 480, target: 500, unit: '£', trend: 'STABLE', period: 'QUARTERLY' },
  { id: 'k5', name: 'Safety Incidents', category: 'SAFETY', currentValue: 0, target: 0, unit: 'count', trend: 'FLAT', period: 'MONTHLY' },
  { id: 'k6', name: 'Technician Utilisation', category: 'PRODUCTIVITY', currentValue: 78, target: 80, unit: '%', trend: 'UP', period: 'WEEKLY' },
];

// ── Helper functions (inlined) ─────────────────────────────────────────────

function getKpiProgress(current: number, target: number): number {
  if (!target) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}

function isJobOnTarget(current: number, target: number): boolean {
  return target > 0 && current >= target;
}

function filterJobsByStatus(jobs: Job[], status: JobStatus): Job[] {
  return jobs.filter((j) => j.status === status);
}

function filterJobsByPriority(jobs: Job[], priority: JobPriority): Job[] {
  return jobs.filter((j) => j.priority === priority);
}

function countTechniciansByStatus(techs: Technician[], status: TechnicianStatus): number {
  return techs.filter((t) => t.status === status).length;
}

function isTechnicianAvailableForDispatch(status: TechnicianStatus): boolean {
  return status === 'AVAILABLE';
}

function totalEstimatedHours(jobs: Job[]): number {
  return jobs.reduce((sum, j) => sum + j.estimatedHours, 0);
}

function jobsWithUnassignedTechnician(jobs: Job[]): Job[] {
  return jobs.filter((j) => !j.technicianName || j.technicianName.trim() === '');
}

function nextSchedulesDue(schedules: ScheduleEntry[], statuses: ScheduleStatus[]): ScheduleEntry[] {
  return schedules.filter((s) => statuses.includes(s.status));
}

function labelForStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST SUITES
// ═══════════════════════════════════════════════════════════════════════════

describe('Job status array', () => {
  it('has exactly 5 statuses', () => expect(JOB_STATUSES).toHaveLength(5));
  it('contains SCHEDULED', () => expect(JOB_STATUSES).toContain('SCHEDULED'));
  it('contains IN_PROGRESS', () => expect(JOB_STATUSES).toContain('IN_PROGRESS'));
  it('contains COMPLETED', () => expect(JOB_STATUSES).toContain('COMPLETED'));
  it('contains PENDING', () => expect(JOB_STATUSES).toContain('PENDING'));
  it('contains CANCELLED', () => expect(JOB_STATUSES).toContain('CANCELLED'));
  for (const s of JOB_STATUSES) {
    it(`status "${s}" is a non-empty string`, () => expect(s.length).toBeGreaterThan(0));
  }
});

describe('Job priority array', () => {
  it('has exactly 4 priorities', () => expect(JOB_PRIORITIES).toHaveLength(4));
  it('contains URGENT', () => expect(JOB_PRIORITIES).toContain('URGENT'));
  it('contains HIGH', () => expect(JOB_PRIORITIES).toContain('HIGH'));
  it('contains MEDIUM', () => expect(JOB_PRIORITIES).toContain('MEDIUM'));
  it('contains LOW', () => expect(JOB_PRIORITIES).toContain('LOW'));
  for (const p of JOB_PRIORITIES) {
    it(`priority "${p}" is a string`, () => expect(typeof p).toBe('string'));
  }
});

describe('Priority color map', () => {
  for (const p of JOB_PRIORITIES) {
    it(`${p} has a color class`, () => expect(priorityColors[p]).toBeDefined());
    it(`${p} color includes bg-`, () => expect(priorityColors[p]).toContain('bg-'));
    it(`${p} color includes text-`, () => expect(priorityColors[p]).toContain('text-'));
  }
  it('URGENT is red', () => expect(priorityColors.URGENT).toContain('red'));
  it('HIGH is orange', () => expect(priorityColors.HIGH).toContain('orange'));
  it('MEDIUM is yellow', () => expect(priorityColors.MEDIUM).toContain('yellow'));
  it('LOW is green', () => expect(priorityColors.LOW).toContain('green'));
});

describe('Job status color map', () => {
  for (const s of JOB_STATUSES) {
    it(`${s} has a color class`, () => expect(jobStatusColors[s]).toBeDefined());
    it(`${s} color includes bg-`, () => expect(jobStatusColors[s]).toContain('bg-'));
  }
  it('COMPLETED is green', () => expect(jobStatusColors.COMPLETED).toContain('green'));
  it('IN_PROGRESS is blue', () => expect(jobStatusColors.IN_PROGRESS).toContain('blue'));
  it('SCHEDULED is purple', () => expect(jobStatusColors.SCHEDULED).toContain('purple'));
  it('PENDING is yellow', () => expect(jobStatusColors.PENDING).toContain('yellow'));
  it('CANCELLED is gray', () => expect(jobStatusColors.CANCELLED).toContain('gray'));
});

describe('Technician status array', () => {
  it('has exactly 5 statuses', () => expect(TECHNICIAN_STATUSES).toHaveLength(5));
  for (const s of TECHNICIAN_STATUSES) {
    it(`technician status "${s}" is defined`, () => expect(s).toBeDefined());
  }
  it('includes AVAILABLE', () => expect(TECHNICIAN_STATUSES).toContain('AVAILABLE'));
  it('includes ON_JOB', () => expect(TECHNICIAN_STATUSES).toContain('ON_JOB'));
  it('includes EN_ROUTE', () => expect(TECHNICIAN_STATUSES).toContain('EN_ROUTE'));
  it('includes OFF_DUTY', () => expect(TECHNICIAN_STATUSES).toContain('OFF_DUTY'));
  it('includes ON_LEAVE', () => expect(TECHNICIAN_STATUSES).toContain('ON_LEAVE'));
});

describe('Technician status color map', () => {
  for (const s of TECHNICIAN_STATUSES) {
    it(`${s} has a color class`, () => expect(technicianStatusColors[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(technicianStatusColors[s]).toContain('bg-'));
  }
  it('AVAILABLE is green', () => expect(technicianStatusColors.AVAILABLE).toContain('green'));
  it('ON_JOB is blue', () => expect(technicianStatusColors.ON_JOB).toContain('blue'));
  it('EN_ROUTE is yellow', () => expect(technicianStatusColors.EN_ROUTE).toContain('yellow'));
  it('ON_LEAVE is orange', () => expect(technicianStatusColors.ON_LEAVE).toContain('orange'));
});

describe('Schedule type array', () => {
  it('has exactly 5 types', () => expect(SCHEDULE_TYPES).toHaveLength(5));
  for (const t of SCHEDULE_TYPES) {
    it(`schedule type "${t}" is a non-empty string`, () => expect(t.length).toBeGreaterThan(0));
  }
  it('includes PREVENTIVE', () => expect(SCHEDULE_TYPES).toContain('PREVENTIVE'));
  it('includes EMERGENCY', () => expect(SCHEDULE_TYPES).toContain('EMERGENCY'));
  it('includes INSTALLATION', () => expect(SCHEDULE_TYPES).toContain('INSTALLATION'));
});

describe('Recurrence array', () => {
  it('has exactly 6 options', () => expect(RECURRENCES).toHaveLength(6));
  it('starts with NONE', () => expect(RECURRENCES[0]).toBe('NONE'));
  for (const r of RECURRENCES) {
    it(`recurrence "${r}" is defined`, () => expect(r).toBeDefined());
  }
  it('includes DAILY', () => expect(RECURRENCES).toContain('DAILY'));
  it('includes QUARTERLY', () => expect(RECURRENCES).toContain('QUARTERLY'));
  it('includes ANNUALLY', () => expect(RECURRENCES).toContain('ANNUALLY'));
});

describe('Schedule status color map', () => {
  for (const s of SCHEDULE_STATUSES) {
    it(`${s} has a color class`, () => expect(scheduleStatusColors[s]).toBeDefined());
    it(`${s} color has text-`, () => expect(scheduleStatusColors[s]).toContain('text-'));
  }
  it('CONFIRMED is green', () => expect(scheduleStatusColors.CONFIRMED).toContain('green'));
  it('CANCELLED is red', () => expect(scheduleStatusColors.CANCELLED).toContain('red'));
  it('COMPLETED is teal', () => expect(scheduleStatusColors.COMPLETED).toContain('teal'));
});

describe('KPI category array', () => {
  it('has exactly 6 categories', () => expect(KPI_CATEGORIES).toHaveLength(6));
  for (const c of KPI_CATEGORIES) {
    it(`category "${c}" is a non-empty string`, () => expect(c.length).toBeGreaterThan(0));
  }
  it('includes QUALITY', () => expect(KPI_CATEGORIES).toContain('QUALITY'));
  it('includes SAFETY', () => expect(KPI_CATEGORIES).toContain('SAFETY'));
  it('includes PRODUCTIVITY', () => expect(KPI_CATEGORIES).toContain('PRODUCTIVITY'));
});

describe('KPI trend color map', () => {
  for (const t of KPI_TRENDS) {
    it(`trend "${t}" has a color class`, () => expect(kpiTrendColors[t]).toBeDefined());
    it(`trend "${t}" color has bg-`, () => expect(kpiTrendColors[t]).toContain('bg-'));
  }
  it('UP is green', () => expect(kpiTrendColors.UP).toContain('green'));
  it('DOWN is red', () => expect(kpiTrendColors.DOWN).toContain('red'));
  it('STABLE is blue', () => expect(kpiTrendColors.STABLE).toContain('blue'));
});

describe('Mock job data shape', () => {
  it('has 5 mock jobs', () => expect(MOCK_JOBS).toHaveLength(5));
  for (const job of MOCK_JOBS) {
    it(`job "${job.jobNumber}" has an id`, () => expect(job.id).toBeTruthy());
    it(`job "${job.jobNumber}" has a title`, () => expect(job.title.length).toBeGreaterThan(0));
    it(`job "${job.jobNumber}" has a valid status`, () => expect(JOB_STATUSES).toContain(job.status));
    it(`job "${job.jobNumber}" has a valid priority`, () => expect(JOB_PRIORITIES).toContain(job.priority));
    it(`job "${job.jobNumber}" estimatedHours >= 0`, () => expect(job.estimatedHours).toBeGreaterThanOrEqual(0));
  }
  it('job numbers are unique', () => {
    const nums = MOCK_JOBS.map((j) => j.jobNumber);
    expect(new Set(nums).size).toBe(nums.length);
  });
  it('at least one job is SCHEDULED', () => {
    expect(MOCK_JOBS.some((j) => j.status === 'SCHEDULED')).toBe(true);
  });
  it('at least one job is COMPLETED', () => {
    expect(MOCK_JOBS.some((j) => j.status === 'COMPLETED')).toBe(true);
  });
});

describe('Mock technician data shape', () => {
  it('has 5 mock technicians', () => expect(MOCK_TECHNICIANS).toHaveLength(5));
  for (const t of MOCK_TECHNICIANS) {
    it(`technician "${t.name}" has an id`, () => expect(t.id).toBeTruthy());
    it(`technician "${t.name}" has a valid status`, () => expect(TECHNICIAN_STATUSES).toContain(t.status));
    it(`technician "${t.name}" activeJobs >= 0`, () => expect(t.activeJobs).toBeGreaterThanOrEqual(0));
    it(`technician "${t.name}" has email`, () => expect(t.email).toContain('@'));
  }
  it('all technician ids are unique', () => {
    const ids = MOCK_TECHNICIANS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('Mock schedule data shape', () => {
  it('has 5 mock schedules', () => expect(MOCK_SCHEDULES).toHaveLength(5));
  for (const s of MOCK_SCHEDULES) {
    it(`schedule "${s.title}" has a valid type`, () => expect(SCHEDULE_TYPES).toContain(s.type));
    it(`schedule "${s.title}" has a valid recurrence`, () => expect(RECURRENCES).toContain(s.recurrence));
    it(`schedule "${s.title}" has a valid status`, () => expect(SCHEDULE_STATUSES).toContain(s.status));
    it(`schedule "${s.title}" duration >= 0`, () => expect(s.duration).toBeGreaterThanOrEqual(0));
  }
});

describe('getKpiProgress helper', () => {
  it('returns 0 when target is 0', () => expect(getKpiProgress(50, 0)).toBe(0));
  it('returns 100 when at target', () => expect(getKpiProgress(90, 90)).toBe(100));
  it('caps at 100 when above target', () => expect(getKpiProgress(120, 90)).toBe(100));
  it('returns 50 at half of target', () => expect(getKpiProgress(45, 90)).toBe(50));
  it('rounds to nearest integer', () => expect(getKpiProgress(1, 3)).toBe(33));
  it('returns 0 for zero current value with positive target', () => expect(getKpiProgress(0, 100)).toBe(0));
  for (const kpi of MOCK_KPIS) {
    it(`getKpiProgress for "${kpi.name}" is in [0, 100]`, () => {
      const p = getKpiProgress(kpi.currentValue, kpi.target);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(100);
    });
  }
});

describe('isJobOnTarget helper', () => {
  it('returns false when target is 0', () => expect(isJobOnTarget(80, 0)).toBe(false));
  it('returns true when current equals target', () => expect(isJobOnTarget(90, 90)).toBe(true));
  it('returns true when current exceeds target', () => expect(isJobOnTarget(95, 90)).toBe(true));
  it('returns false when current is below target', () => expect(isJobOnTarget(80, 90)).toBe(false));
});

describe('filterJobsByStatus helper', () => {
  it('returns only SCHEDULED jobs', () => {
    const result = filterJobsByStatus(MOCK_JOBS, 'SCHEDULED');
    expect(result.every((j) => j.status === 'SCHEDULED')).toBe(true);
  });
  it('returns only COMPLETED jobs', () => {
    const result = filterJobsByStatus(MOCK_JOBS, 'COMPLETED');
    expect(result.every((j) => j.status === 'COMPLETED')).toBe(true);
  });
  it('returns empty array for status with no jobs', () => {
    const result = filterJobsByStatus([], 'URGENT' as unknown as JobStatus);
    expect(result).toHaveLength(0);
  });
  for (const s of JOB_STATUSES) {
    it(`filterJobsByStatus for "${s}" returns an array`, () => {
      expect(Array.isArray(filterJobsByStatus(MOCK_JOBS, s))).toBe(true);
    });
  }
});

describe('filterJobsByPriority helper', () => {
  it('returns only URGENT jobs', () => {
    const result = filterJobsByPriority(MOCK_JOBS, 'URGENT');
    expect(result.every((j) => j.priority === 'URGENT')).toBe(true);
  });
  it('count of HIGH jobs matches expected', () => {
    const result = filterJobsByPriority(MOCK_JOBS, 'HIGH');
    expect(result.length).toBeGreaterThanOrEqual(1);
  });
  for (const p of JOB_PRIORITIES) {
    it(`filterJobsByPriority("${p}") returns an array`, () => {
      expect(Array.isArray(filterJobsByPriority(MOCK_JOBS, p))).toBe(true);
    });
  }
});

describe('countTechniciansByStatus helper', () => {
  it('available count >= 0', () => expect(countTechniciansByStatus(MOCK_TECHNICIANS, 'AVAILABLE')).toBeGreaterThanOrEqual(0));
  it('counts match total when all statuses summed', () => {
    const total = TECHNICIAN_STATUSES.reduce(
      (sum, s) => sum + countTechniciansByStatus(MOCK_TECHNICIANS, s),
      0,
    );
    expect(total).toBe(MOCK_TECHNICIANS.length);
  });
  for (const s of TECHNICIAN_STATUSES) {
    it(`countTechniciansByStatus("${s}") returns a number`, () => {
      expect(typeof countTechniciansByStatus(MOCK_TECHNICIANS, s)).toBe('number');
    });
  }
});

describe('isTechnicianAvailableForDispatch helper', () => {
  it('AVAILABLE returns true', () => expect(isTechnicianAvailableForDispatch('AVAILABLE')).toBe(true));
  it('ON_JOB returns false', () => expect(isTechnicianAvailableForDispatch('ON_JOB')).toBe(false));
  it('EN_ROUTE returns false', () => expect(isTechnicianAvailableForDispatch('EN_ROUTE')).toBe(false));
  it('OFF_DUTY returns false', () => expect(isTechnicianAvailableForDispatch('OFF_DUTY')).toBe(false));
  it('ON_LEAVE returns false', () => expect(isTechnicianAvailableForDispatch('ON_LEAVE')).toBe(false));
  for (const s of TECHNICIAN_STATUSES) {
    it(`isTechnicianAvailableForDispatch("${s}") returns boolean`, () => {
      expect(typeof isTechnicianAvailableForDispatch(s)).toBe('boolean');
    });
  }
});

describe('totalEstimatedHours helper', () => {
  it('returns 0 for empty list', () => expect(totalEstimatedHours([])).toBe(0));
  it('sums all hours correctly', () => {
    const expectedTotal = MOCK_JOBS.reduce((sum, j) => sum + j.estimatedHours, 0);
    expect(totalEstimatedHours(MOCK_JOBS)).toBe(expectedTotal);
  });
  it('result is a positive number for mock jobs', () => {
    expect(totalEstimatedHours(MOCK_JOBS)).toBeGreaterThan(0);
  });
});

describe('jobsWithUnassignedTechnician helper', () => {
  it('returns array', () => expect(Array.isArray(jobsWithUnassignedTechnician(MOCK_JOBS))).toBe(true));
  it('pending job with no technician is unassigned', () => {
    const result = jobsWithUnassignedTechnician(MOCK_JOBS);
    expect(result.some((j) => j.id === 'j4')).toBe(true);
  });
  it('assigned jobs are not in the result', () => {
    const result = jobsWithUnassignedTechnician(MOCK_JOBS);
    expect(result.every((j) => !j.technicianName || j.technicianName.trim() === '')).toBe(true);
  });
});

describe('nextSchedulesDue helper', () => {
  it('returns confirmed and pending schedules', () => {
    const due = nextSchedulesDue(MOCK_SCHEDULES, ['CONFIRMED', 'PENDING']);
    expect(due.every((s) => ['CONFIRMED', 'PENDING'].includes(s.status))).toBe(true);
  });
  it('returns empty for empty input', () => {
    expect(nextSchedulesDue([], ['CONFIRMED'])).toHaveLength(0);
  });
  it('at least one CONFIRMED schedule exists in mock data', () => {
    const due = nextSchedulesDue(MOCK_SCHEDULES, ['CONFIRMED']);
    expect(due.length).toBeGreaterThanOrEqual(1);
  });
});

describe('labelForStatus helper', () => {
  it('converts IN_PROGRESS to "IN PROGRESS"', () => expect(labelForStatus('IN_PROGRESS')).toBe('IN PROGRESS'));
  it('converts ON_JOB to "ON JOB"', () => expect(labelForStatus('ON_JOB')).toBe('ON JOB'));
  it('leaves single-word statuses unchanged', () => expect(labelForStatus('AVAILABLE')).toBe('AVAILABLE'));
  it('converts OFF_DUTY to "OFF DUTY"', () => expect(labelForStatus('OFF_DUTY')).toBe('OFF DUTY'));
  it('converts EN_ROUTE to "EN ROUTE"', () => expect(labelForStatus('EN_ROUTE')).toBe('EN ROUTE'));
});

describe('Mock KPI data shape', () => {
  it('has 6 mock KPIs', () => expect(MOCK_KPIS).toHaveLength(6));
  for (const kpi of MOCK_KPIS) {
    it(`KPI "${kpi.name}" has a valid category`, () => expect(KPI_CATEGORIES).toContain(kpi.category));
    it(`KPI "${kpi.name}" has a valid trend`, () => expect(KPI_TRENDS).toContain(kpi.trend));
    it(`KPI "${kpi.name}" has a valid period`, () => expect(KPI_PERIODS).toContain(kpi.period));
    it(`KPI "${kpi.name}" currentValue is a number`, () => expect(typeof kpi.currentValue).toBe('number'));
    it(`KPI "${kpi.name}" unit is a non-empty string`, () => expect(kpi.unit.length).toBeGreaterThan(0));
  }
  it('all KPI ids are unique', () => {
    const ids = MOCK_KPIS.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('at least one KPI has UP trend', () => {
    expect(MOCK_KPIS.some((k) => k.trend === 'UP')).toBe(true);
  });
  it('covers QUALITY category', () => {
    expect(MOCK_KPIS.some((k) => k.category === 'QUALITY')).toBe(true);
  });
  it('covers SAFETY category', () => {
    expect(MOCK_KPIS.some((k) => k.category === 'SAFETY')).toBe(true);
  });
  it('covers FINANCIAL category', () => {
    expect(MOCK_KPIS.some((k) => k.category === 'FINANCIAL')).toBe(true);
  });
});

// ─── Parametric: JOB_STATUSES positional index ────────────────────────────────

describe('JOB_STATUSES — positional index parametric', () => {
  const cases: [JobStatus, number][] = [
    ['SCHEDULED', 0],
    ['IN_PROGRESS', 1],
    ['COMPLETED', 2],
    ['PENDING', 3],
    ['CANCELLED', 4],
  ];
  for (const [status, idx] of cases) {
    it(`${status} is at index ${idx}`, () => {
      expect(JOB_STATUSES[idx]).toBe(status);
    });
  }
});

// ─── Parametric: JOB_PRIORITIES positional index ──────────────────────────────

describe('JOB_PRIORITIES — positional index parametric', () => {
  const cases: [JobPriority, number][] = [
    ['URGENT', 0],
    ['HIGH', 1],
    ['MEDIUM', 2],
    ['LOW', 3],
  ];
  for (const [priority, idx] of cases) {
    it(`${priority} is at index ${idx}`, () => {
      expect(JOB_PRIORITIES[idx]).toBe(priority);
    });
  }
});

// ─── Parametric: TECHNICIAN_STATUSES positional index ────────────────────────

describe('TECHNICIAN_STATUSES — positional index parametric', () => {
  const cases: [TechnicianStatus, number][] = [
    ['AVAILABLE', 0],
    ['ON_JOB', 1],
    ['EN_ROUTE', 2],
    ['OFF_DUTY', 3],
    ['ON_LEAVE', 4],
  ];
  for (const [status, idx] of cases) {
    it(`${status} is at index ${idx}`, () => {
      expect(TECHNICIAN_STATUSES[idx]).toBe(status);
    });
  }
});

// ─── Parametric: SCHEDULE_TYPES positional index ──────────────────────────────

describe('SCHEDULE_TYPES — positional index parametric', () => {
  const cases: [ScheduleType, number][] = [
    ['PREVENTIVE', 0],
    ['REACTIVE', 1],
    ['INSPECTION', 2],
    ['INSTALLATION', 3],
    ['EMERGENCY', 4],
  ];
  for (const [type, idx] of cases) {
    it(`${type} is at index ${idx}`, () => {
      expect(SCHEDULE_TYPES[idx]).toBe(type);
    });
  }
});

// ─── Parametric: MOCK_JOBS per-job exact priority+status+estimatedHours ───────

describe('MOCK_JOBS — per-job exact priority+status+estimatedHours parametric', () => {
  const cases: [string, JobPriority, JobStatus, number][] = [
    ['j1', 'HIGH', 'SCHEDULED', 4],
    ['j2', 'URGENT', 'IN_PROGRESS', 6],
    ['j3', 'MEDIUM', 'COMPLETED', 3],
    ['j4', 'LOW', 'PENDING', 2],
    ['j5', 'HIGH', 'CANCELLED', 8],
  ];
  for (const [id, priority, status, estimatedHours] of cases) {
    it(`${id}: priority=${priority}, status=${status}, estimatedHours=${estimatedHours}`, () => {
      const j = MOCK_JOBS.find((x) => x.id === id)!;
      expect(j.priority).toBe(priority);
      expect(j.status).toBe(status);
      expect(j.estimatedHours).toBe(estimatedHours);
    });
  }
});

// ─── Parametric: MOCK_TECHNICIANS per-technician exact status+activeJobs ──────

describe('MOCK_TECHNICIANS — per-technician exact status+activeJobs parametric', () => {
  const cases: [string, TechnicianStatus, number][] = [
    ['t1', 'AVAILABLE', 0],
    ['t2', 'ON_JOB', 1],
    ['t3', 'EN_ROUTE', 1],
    ['t4', 'OFF_DUTY', 0],
    ['t5', 'ON_LEAVE', 0],
  ];
  for (const [id, status, activeJobs] of cases) {
    it(`${id}: status=${status}, activeJobs=${activeJobs}`, () => {
      const t = MOCK_TECHNICIANS.find((x) => x.id === id)!;
      expect(t.status).toBe(status);
      expect(t.activeJobs).toBe(activeJobs);
    });
  }
});

// ─── totalEstimatedHours exact sum ────────────────────────────────────────────

describe('totalEstimatedHours — exact sum for MOCK_JOBS', () => {
  it('total is 23 hours (4+6+3+2+8)', () => {
    expect(totalEstimatedHours(MOCK_JOBS)).toBe(23);
  });
});
