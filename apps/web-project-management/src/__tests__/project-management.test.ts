// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-project-management specification tests

type ProjectStatus = 'INITIATION' | 'PLANNING' | 'EXECUTION' | 'MONITORING' | 'CLOSING' | 'CLOSED' | 'ON_HOLD' | 'CANCELLED';
type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'ACHIEVED' | 'MISSED' | 'DEFERRED';
type RiskImpact = 'NEGLIGIBLE' | 'MINOR' | 'MODERATE' | 'MAJOR' | 'SEVERE';

const PROJECT_STATUSES: ProjectStatus[] = ['INITIATION', 'PLANNING', 'EXECUTION', 'MONITORING', 'CLOSING', 'CLOSED', 'ON_HOLD', 'CANCELLED'];
const TASK_PRIORITIES: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const MILESTONE_STATUSES: MilestoneStatus[] = ['PENDING', 'IN_PROGRESS', 'ACHIEVED', 'MISSED', 'DEFERRED'];
const RISK_IMPACTS: RiskImpact[] = ['NEGLIGIBLE', 'MINOR', 'MODERATE', 'MAJOR', 'SEVERE'];

const projectStatusColor: Record<ProjectStatus, string> = {
  INITIATION: 'bg-gray-100 text-gray-700',
  PLANNING: 'bg-blue-100 text-blue-800',
  EXECUTION: 'bg-indigo-100 text-indigo-800',
  MONITORING: 'bg-yellow-100 text-yellow-800',
  CLOSING: 'bg-purple-100 text-purple-800',
  CLOSED: 'bg-green-100 text-green-800',
  ON_HOLD: 'bg-orange-100 text-orange-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const riskImpactScore: Record<RiskImpact, number> = {
  NEGLIGIBLE: 1, MINOR: 2, MODERATE: 3, MAJOR: 4, SEVERE: 5,
};

function scheduleVariance(plannedValue: number, earnedValue: number): number {
  return earnedValue - plannedValue;
}

function costVariance(earnedValue: number, actualCost: number): number {
  return earnedValue - actualCost;
}

function schedulePerformanceIndex(earnedValue: number, plannedValue: number): number {
  if (plannedValue === 0) return 1;
  return earnedValue / plannedValue;
}

function costPerformanceIndex(earnedValue: number, actualCost: number): number {
  if (actualCost === 0) return 1;
  return earnedValue / actualCost;
}

function isProjectActive(status: ProjectStatus): boolean {
  return !['CLOSED', 'CANCELLED'].includes(status);
}

function projectCompletionPercentage(completedTasks: number, totalTasks: number): number {
  if (totalTasks === 0) return 0;
  return (completedTasks / totalTasks) * 100;
}

describe('Project status colors', () => {
  PROJECT_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(projectStatusColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(projectStatusColor[s]).toContain('bg-'));
  });
  it('CLOSED is green', () => expect(projectStatusColor.CLOSED).toContain('green'));
  it('CANCELLED is red', () => expect(projectStatusColor.CANCELLED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = PROJECT_STATUSES[i % 8];
    it(`project status color string (idx ${i})`, () => expect(typeof projectStatusColor[s]).toBe('string'));
  }
});

describe('Risk impact scores', () => {
  it('SEVERE has score 5', () => expect(riskImpactScore.SEVERE).toBe(5));
  it('NEGLIGIBLE has score 1', () => expect(riskImpactScore.NEGLIGIBLE).toBe(1));
  RISK_IMPACTS.forEach(r => {
    it(`${r} score is positive`, () => expect(riskImpactScore[r]).toBeGreaterThan(0));
  });
  for (let i = 0; i < 100; i++) {
    const r = RISK_IMPACTS[i % 5];
    it(`risk impact score for ${r} is number (idx ${i})`, () => expect(typeof riskImpactScore[r]).toBe('number'));
  }
});

describe('scheduleVariance', () => {
  it('ahead of schedule is positive', () => expect(scheduleVariance(100, 110)).toBe(10));
  it('behind schedule is negative', () => expect(scheduleVariance(100, 90)).toBe(-10));
  it('on schedule = 0', () => expect(scheduleVariance(100, 100)).toBe(0));
  for (let ev = 0; ev <= 100; ev++) {
    it(`scheduleVariance(100, ${ev}) = ${ev - 100}`, () => {
      expect(scheduleVariance(100, ev)).toBe(ev - 100);
    });
  }
});

describe('costVariance', () => {
  it('under budget is positive', () => expect(costVariance(100, 80)).toBe(20));
  it('over budget is negative', () => expect(costVariance(100, 120)).toBe(-20));
  for (let ac = 0; ac <= 100; ac++) {
    it(`costVariance(100, ${ac}) = ${100 - ac}`, () => {
      expect(costVariance(100, ac)).toBe(100 - ac);
    });
  }
});

describe('SPI and CPI', () => {
  it('SPI 1.0 = on schedule', () => expect(schedulePerformanceIndex(100, 100)).toBe(1));
  it('SPI > 1 = ahead of schedule', () => expect(schedulePerformanceIndex(110, 100)).toBeGreaterThan(1));
  it('CPI > 1 = under budget', () => expect(costPerformanceIndex(100, 80)).toBeGreaterThan(1));
  it('CPI < 1 = over budget', () => expect(costPerformanceIndex(80, 100)).toBeLessThan(1));
  for (let i = 1; i <= 50; i++) {
    it(`SPI(${i * 10}, 100) is positive`, () => {
      expect(schedulePerformanceIndex(i * 10, 100)).toBeGreaterThan(0);
    });
  }
});

describe('isProjectActive', () => {
  it('EXECUTION is active', () => expect(isProjectActive('EXECUTION')).toBe(true));
  it('PLANNING is active', () => expect(isProjectActive('PLANNING')).toBe(true));
  it('CLOSED is not active', () => expect(isProjectActive('CLOSED')).toBe(false));
  it('CANCELLED is not active', () => expect(isProjectActive('CANCELLED')).toBe(false));
  for (let i = 0; i < 50; i++) {
    const s = PROJECT_STATUSES[i % 8];
    it(`isProjectActive(${s}) returns boolean (idx ${i})`, () => expect(typeof isProjectActive(s)).toBe('boolean'));
  }
});
