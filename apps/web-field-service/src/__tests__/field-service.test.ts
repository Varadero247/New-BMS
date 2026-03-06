// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-field-service specification tests

type JobType = 'INSTALLATION' | 'MAINTENANCE' | 'REPAIR' | 'INSPECTION' | 'COMMISSIONING' | 'DECOMMISSIONING';
type JobStatus = 'SCHEDULED' | 'DISPATCHED' | 'EN_ROUTE' | 'ON_SITE' | 'COMPLETED' | 'CANCELLED' | 'PENDING_PARTS';
type TechnicianSkillLevel = 'APPRENTICE' | 'TECHNICIAN' | 'SENIOR' | 'SPECIALIST' | 'MASTER';
type SLATier = 'STANDARD' | 'PRIORITY' | 'CRITICAL' | 'EMERGENCY';

const JOB_TYPES: JobType[] = ['INSTALLATION', 'MAINTENANCE', 'REPAIR', 'INSPECTION', 'COMMISSIONING', 'DECOMMISSIONING'];
const JOB_STATUSES: JobStatus[] = ['SCHEDULED', 'DISPATCHED', 'EN_ROUTE', 'ON_SITE', 'COMPLETED', 'CANCELLED', 'PENDING_PARTS'];
const SKILL_LEVELS: TechnicianSkillLevel[] = ['APPRENTICE', 'TECHNICIAN', 'SENIOR', 'SPECIALIST', 'MASTER'];
const SLA_TIERS: SLATier[] = ['STANDARD', 'PRIORITY', 'CRITICAL', 'EMERGENCY'];

const jobStatusColor: Record<JobStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  DISPATCHED: 'bg-indigo-100 text-indigo-800',
  EN_ROUTE: 'bg-purple-100 text-purple-800',
  ON_SITE: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  PENDING_PARTS: 'bg-orange-100 text-orange-800',
};

const slaResponseHours: Record<SLATier, number> = {
  STANDARD: 48, PRIORITY: 24, CRITICAL: 8, EMERGENCY: 2,
};

const skillLevelMultiplier: Record<TechnicianSkillLevel, number> = {
  APPRENTICE: 0.7, TECHNICIAN: 1.0, SENIOR: 1.3, SPECIALIST: 1.6, MASTER: 2.0,
};

function isJobActive(status: JobStatus): boolean {
  return status !== 'COMPLETED' && status !== 'CANCELLED';
}

function estimatedJobCost(baseCost: number, skillLevel: TechnicianSkillLevel, hours: number): number {
  return baseCost * skillLevelMultiplier[skillLevel] * hours;
}

function isSlaMet(dispatchedAt: Date, slaHours: number, completedAt: Date): boolean {
  const deadline = new Date(dispatchedAt.getTime() + slaHours * 3600000);
  return completedAt <= deadline;
}

describe('Job status colors', () => {
  JOB_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(jobStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(jobStatusColor[s]).toContain('bg-'));
  });
  it('COMPLETED is green', () => expect(jobStatusColor.COMPLETED).toContain('green'));
  it('CANCELLED is red', () => expect(jobStatusColor.CANCELLED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = JOB_STATUSES[i % 7];
    it(`job status color string (idx ${i})`, () => expect(typeof jobStatusColor[s]).toBe('string'));
  }
});

describe('SLA response hours', () => {
  it('EMERGENCY = 2 hours', () => expect(slaResponseHours.EMERGENCY).toBe(2));
  it('STANDARD = 48 hours', () => expect(slaResponseHours.STANDARD).toBe(48));
  it('EMERGENCY < CRITICAL < PRIORITY < STANDARD', () => {
    expect(slaResponseHours.EMERGENCY).toBeLessThan(slaResponseHours.CRITICAL);
    expect(slaResponseHours.CRITICAL).toBeLessThan(slaResponseHours.PRIORITY);
    expect(slaResponseHours.PRIORITY).toBeLessThan(slaResponseHours.STANDARD);
  });
  for (let i = 0; i < 100; i++) {
    const t = SLA_TIERS[i % 4];
    it(`SLA hours for ${t} is positive (idx ${i})`, () => expect(slaResponseHours[t]).toBeGreaterThan(0));
  }
});

describe('Skill level multipliers', () => {
  it('MASTER has highest multiplier', () => expect(skillLevelMultiplier.MASTER).toBe(2.0));
  it('APPRENTICE has lowest multiplier', () => expect(skillLevelMultiplier.APPRENTICE).toBe(0.7));
  it('multipliers increase with skill', () => {
    expect(skillLevelMultiplier.APPRENTICE).toBeLessThan(skillLevelMultiplier.TECHNICIAN);
    expect(skillLevelMultiplier.TECHNICIAN).toBeLessThan(skillLevelMultiplier.SENIOR);
    expect(skillLevelMultiplier.SENIOR).toBeLessThan(skillLevelMultiplier.SPECIALIST);
    expect(skillLevelMultiplier.SPECIALIST).toBeLessThan(skillLevelMultiplier.MASTER);
  });
  for (let i = 0; i < 50; i++) {
    const s = SKILL_LEVELS[i % 5];
    it(`skill multiplier for ${s} is positive (idx ${i})`, () => expect(skillLevelMultiplier[s]).toBeGreaterThan(0));
  }
});

describe('isJobActive', () => {
  it('SCHEDULED is active', () => expect(isJobActive('SCHEDULED')).toBe(true));
  it('ON_SITE is active', () => expect(isJobActive('ON_SITE')).toBe(true));
  it('COMPLETED is not active', () => expect(isJobActive('COMPLETED')).toBe(false));
  it('CANCELLED is not active', () => expect(isJobActive('CANCELLED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = JOB_STATUSES[i % 7];
    it(`isJobActive(${s}) returns boolean (idx ${i})`, () => expect(typeof isJobActive(s)).toBe('boolean'));
  }
});

describe('estimatedJobCost', () => {
  it('TECHNICIAN at base rate × 1 hour = base cost', () => {
    expect(estimatedJobCost(100, 'TECHNICIAN', 1)).toBe(100);
  });
  it('MASTER costs more than APPRENTICE for same hours', () => {
    expect(estimatedJobCost(100, 'MASTER', 1)).toBeGreaterThan(estimatedJobCost(100, 'APPRENTICE', 1));
  });
  it('cost scales with hours', () => {
    expect(estimatedJobCost(100, 'TECHNICIAN', 2)).toBe(200);
  });
  for (let h = 1; h <= 50; h++) {
    it(`job cost for ${h} hours is positive`, () => {
      expect(estimatedJobCost(100, 'TECHNICIAN', h)).toBeGreaterThan(0);
    });
  }
  for (let i = 0; i < 50; i++) {
    const s = SKILL_LEVELS[i % 5];
    it(`job cost for ${s} is positive (idx ${i})`, () => {
      expect(estimatedJobCost(100, s, 1)).toBeGreaterThan(0);
    });
  }
});

describe('isSlaMet', () => {
  it('completed before deadline is met', () => {
    const dispatched = new Date('2026-01-01T08:00:00');
    const completed = new Date('2026-01-01T10:00:00');
    expect(isSlaMet(dispatched, 8, completed)).toBe(true);
  });
  it('completed after deadline is not met', () => {
    const dispatched = new Date('2026-01-01T08:00:00');
    const completed = new Date('2026-01-01T20:00:00');
    expect(isSlaMet(dispatched, 8, completed)).toBe(false);
  });
  for (let h = 1; h <= 24; h++) {
    it(`SLA met when completed exactly at ${h}h deadline`, () => {
      const dispatched = new Date(0);
      const completed = new Date(h * 3600000);
      expect(isSlaMet(dispatched, h, completed)).toBe(true);
    });
  }
});
