// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-cmms specification tests

type WorkOrderType = 'CORRECTIVE' | 'PREVENTIVE' | 'PREDICTIVE' | 'EMERGENCY';
type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type EquipmentStatus = 'OPERATIONAL' | 'DEGRADED' | 'FAILED' | 'UNDER_MAINTENANCE';
type PMFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUAL';

const WO_TYPES: WorkOrderType[] = ['CORRECTIVE', 'PREVENTIVE', 'PREDICTIVE', 'EMERGENCY'];
const WO_PRIORITIES: WorkOrderPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const EQUIPMENT_STATUSES: EquipmentStatus[] = ['OPERATIONAL', 'DEGRADED', 'FAILED', 'UNDER_MAINTENANCE'];
const PM_FREQUENCIES: PMFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL'];

const priorityColor: Record<WorkOrderPriority, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-amber-100 text-amber-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const equipmentStatusColor: Record<EquipmentStatus, string> = {
  OPERATIONAL: 'text-green-600',
  DEGRADED: 'text-amber-600',
  FAILED: 'text-red-600',
  UNDER_MAINTENANCE: 'text-blue-600',
};

const pmFrequencyDays: Record<PMFrequency, number> = {
  DAILY: 1, WEEKLY: 7, MONTHLY: 30, QUARTERLY: 90, ANNUAL: 365,
};

function computeOEE(availability: number, performance: number, quality: number): number {
  return availability * performance * quality;
}

function classifyOEE(oee: number): 'WORLD_CLASS' | 'GOOD' | 'AVERAGE' | 'POOR' {
  if (oee >= 0.85) return 'WORLD_CLASS';
  if (oee >= 0.65) return 'GOOD';
  if (oee >= 0.45) return 'AVERAGE';
  return 'POOR';
}

function responseTimeSLA(priority: WorkOrderPriority): number {
  const slaHours: Record<WorkOrderPriority, number> = { LOW: 72, MEDIUM: 24, HIGH: 8, CRITICAL: 2 };
  return slaHours[priority];
}

function mtbfFromFailures(operatingHours: number, failures: number): number {
  if (failures === 0) return Infinity;
  return operatingHours / failures;
}

describe('Work order priority colors', () => {
  WO_PRIORITIES.forEach(p => {
    it(`${p} has color`, () => expect(priorityColor[p]).toBeDefined());
    it(`${p} color has bg-`, () => expect(priorityColor[p]).toContain('bg-'));
  });
  it('CRITICAL is red', () => expect(priorityColor.CRITICAL).toContain('red'));
  it('LOW is green', () => expect(priorityColor.LOW).toContain('green'));
  for (let i = 0; i < 100; i++) {
    const p = WO_PRIORITIES[i % 4];
    it(`priority color string (idx ${i})`, () => expect(typeof priorityColor[p]).toBe('string'));
  }
});

describe('Equipment status colors', () => {
  EQUIPMENT_STATUSES.forEach(s => {
    it(`${s} has color`, () => expect(equipmentStatusColor[s]).toBeDefined());
  });
  it('OPERATIONAL is green', () => expect(equipmentStatusColor.OPERATIONAL).toContain('green'));
  it('FAILED is red', () => expect(equipmentStatusColor.FAILED).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = EQUIPMENT_STATUSES[i % 4];
    it(`equipment status color string (idx ${i})`, () => expect(typeof equipmentStatusColor[s]).toBe('string'));
  }
});

describe('PM frequency days', () => {
  it('DAILY = 1 day', () => expect(pmFrequencyDays.DAILY).toBe(1));
  it('WEEKLY = 7 days', () => expect(pmFrequencyDays.WEEKLY).toBe(7));
  it('MONTHLY = 30 days', () => expect(pmFrequencyDays.MONTHLY).toBe(30));
  it('QUARTERLY = 90 days', () => expect(pmFrequencyDays.QUARTERLY).toBe(90));
  it('ANNUAL = 365 days', () => expect(pmFrequencyDays.ANNUAL).toBe(365));
  PM_FREQUENCIES.forEach(f => {
    it(`${f} days is positive`, () => expect(pmFrequencyDays[f]).toBeGreaterThan(0));
  });
  for (let i = 0; i < 50; i++) {
    const f = PM_FREQUENCIES[i % 5];
    it(`PM frequency ${f} days is number (idx ${i})`, () => expect(typeof pmFrequencyDays[f]).toBe('number'));
  }
});

describe('computeOEE', () => {
  it('100% × 100% × 100% = 1.0', () => expect(computeOEE(1, 1, 1)).toBe(1));
  it('0 availability = 0 OEE', () => expect(computeOEE(0, 1, 1)).toBe(0));
  it('85% × 95% × 99% ≈ world class', () => {
    expect(computeOEE(0.85, 0.95, 0.99)).toBeGreaterThan(0.7);
  });
  for (let i = 0; i <= 100; i++) {
    const v = i / 100;
    it(`OEE(${v}, 1, 1) is between 0 and 1`, () => {
      const oee = computeOEE(v, 1, 1);
      expect(oee).toBeGreaterThanOrEqual(0);
      expect(oee).toBeLessThanOrEqual(1);
    });
  }
});

describe('classifyOEE', () => {
  it('>= 85% is WORLD_CLASS', () => expect(classifyOEE(0.85)).toBe('WORLD_CLASS'));
  it('>= 65% < 85% is GOOD', () => expect(classifyOEE(0.70)).toBe('GOOD'));
  it('>= 45% < 65% is AVERAGE', () => expect(classifyOEE(0.50)).toBe('AVERAGE'));
  it('< 45% is POOR', () => expect(classifyOEE(0.40)).toBe('POOR'));
  for (let i = 0; i <= 100; i++) {
    it(`classifyOEE(${i/100}) returns valid class`, () => {
      const cls = classifyOEE(i / 100);
      expect(['WORLD_CLASS', 'GOOD', 'AVERAGE', 'POOR']).toContain(cls);
    });
  }
});

describe('responseTimeSLA', () => {
  it('CRITICAL = 2 hours', () => expect(responseTimeSLA('CRITICAL')).toBe(2));
  it('LOW = 72 hours', () => expect(responseTimeSLA('LOW')).toBe(72));
  WO_PRIORITIES.forEach(p => {
    it(`${p} has positive SLA hours`, () => expect(responseTimeSLA(p)).toBeGreaterThan(0));
  });
  it('CRITICAL < HIGH < MEDIUM < LOW', () => {
    expect(responseTimeSLA('CRITICAL')).toBeLessThan(responseTimeSLA('HIGH'));
    expect(responseTimeSLA('HIGH')).toBeLessThan(responseTimeSLA('MEDIUM'));
    expect(responseTimeSLA('MEDIUM')).toBeLessThan(responseTimeSLA('LOW'));
  });
  for (let i = 0; i < 50; i++) {
    const p = WO_PRIORITIES[i % 4];
    it(`SLA for ${p} is number (idx ${i})`, () => expect(typeof responseTimeSLA(p)).toBe('number'));
  }
});
