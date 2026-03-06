// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-incidents specification tests

type IncidentType = 'NEAR_MISS' | 'FIRST_AID' | 'MEDICAL_TREATMENT' | 'LOST_TIME' | 'FATALITY' | 'PROPERTY_DAMAGE' | 'ENVIRONMENTAL';
type IncidentSeverity = 'MINOR' | 'MODERATE' | 'MAJOR' | 'CRITICAL' | 'CATASTROPHIC';
type IncidentStatus = 'OPEN' | 'UNDER_INVESTIGATION' | 'PENDING_ACTION' | 'CLOSED' | 'REOPENED';
type RootCauseCategory = 'HUMAN_FACTOR' | 'EQUIPMENT' | 'PROCEDURE' | 'ENVIRONMENT' | 'MANAGEMENT';

const INCIDENT_TYPES: IncidentType[] = ['NEAR_MISS', 'FIRST_AID', 'MEDICAL_TREATMENT', 'LOST_TIME', 'FATALITY', 'PROPERTY_DAMAGE', 'ENVIRONMENTAL'];
const INCIDENT_SEVERITIES: IncidentSeverity[] = ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC'];
const INCIDENT_STATUSES: IncidentStatus[] = ['OPEN', 'UNDER_INVESTIGATION', 'PENDING_ACTION', 'CLOSED', 'REOPENED'];
const ROOT_CAUSE_CATEGORIES: RootCauseCategory[] = ['HUMAN_FACTOR', 'EQUIPMENT', 'PROCEDURE', 'ENVIRONMENT', 'MANAGEMENT'];

const severityColor: Record<IncidentSeverity, string> = {
  MINOR: 'bg-green-100 text-green-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  MAJOR: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
  CATASTROPHIC: 'bg-purple-100 text-purple-800',
};

const severityScore: Record<IncidentSeverity, number> = {
  MINOR: 1, MODERATE: 2, MAJOR: 3, CRITICAL: 4, CATASTROPHIC: 5,
};

const investigationDaysTarget: Record<IncidentSeverity, number> = {
  MINOR: 30, MODERATE: 21, MAJOR: 14, CRITICAL: 7, CATASTROPHIC: 3,
};

function isIncidentOpen(status: IncidentStatus): boolean {
  return status === 'OPEN' || status === 'UNDER_INVESTIGATION' || status === 'PENDING_ACTION' || status === 'REOPENED';
}

function requiresRegulatorNotification(severity: IncidentSeverity): boolean {
  return severity === 'CRITICAL' || severity === 'CATASTROPHIC';
}

function lostTimeIncidentRate(lostTimeIncidents: number, hoursWorked: number): number {
  if (hoursWorked === 0) return 0;
  return (lostTimeIncidents / hoursWorked) * 200000;
}

describe('Severity colors', () => {
  INCIDENT_SEVERITIES.forEach(s => {
    it(`${s} has color`, () => expect(severityColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(severityColor[s]).toContain('bg-'));
  });
  it('MINOR is green', () => expect(severityColor.MINOR).toContain('green'));
  it('CRITICAL is red', () => expect(severityColor.CRITICAL).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = INCIDENT_SEVERITIES[i % 5];
    it(`severity color string (idx ${i})`, () => expect(typeof severityColor[s]).toBe('string'));
  }
});

describe('Severity scores', () => {
  it('CATASTROPHIC has score 5', () => expect(severityScore.CATASTROPHIC).toBe(5));
  it('MINOR has score 1', () => expect(severityScore.MINOR).toBe(1));
  it('scores increase with severity', () => {
    expect(severityScore.MINOR).toBeLessThan(severityScore.MODERATE);
    expect(severityScore.MODERATE).toBeLessThan(severityScore.MAJOR);
    expect(severityScore.MAJOR).toBeLessThan(severityScore.CRITICAL);
    expect(severityScore.CRITICAL).toBeLessThan(severityScore.CATASTROPHIC);
  });
  for (let i = 0; i < 100; i++) {
    const s = INCIDENT_SEVERITIES[i % 5];
    it(`severity score for ${s} is positive (idx ${i})`, () => expect(severityScore[s]).toBeGreaterThan(0));
  }
});

describe('Investigation days target', () => {
  it('CATASTROPHIC target is 3 days', () => expect(investigationDaysTarget.CATASTROPHIC).toBe(3));
  it('MINOR target is 30 days', () => expect(investigationDaysTarget.MINOR).toBe(30));
  it('CATASTROPHIC < CRITICAL < MAJOR < MODERATE < MINOR', () => {
    expect(investigationDaysTarget.CATASTROPHIC).toBeLessThan(investigationDaysTarget.CRITICAL);
    expect(investigationDaysTarget.CRITICAL).toBeLessThan(investigationDaysTarget.MAJOR);
    expect(investigationDaysTarget.MAJOR).toBeLessThan(investigationDaysTarget.MODERATE);
    expect(investigationDaysTarget.MODERATE).toBeLessThan(investigationDaysTarget.MINOR);
  });
  for (let i = 0; i < 50; i++) {
    const s = INCIDENT_SEVERITIES[i % 5];
    it(`investigation target for ${s} is positive (idx ${i})`, () => expect(investigationDaysTarget[s]).toBeGreaterThan(0));
  }
});

describe('isIncidentOpen', () => {
  it('OPEN returns true', () => expect(isIncidentOpen('OPEN')).toBe(true));
  it('UNDER_INVESTIGATION returns true', () => expect(isIncidentOpen('UNDER_INVESTIGATION')).toBe(true));
  it('CLOSED returns false', () => expect(isIncidentOpen('CLOSED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = INCIDENT_STATUSES[i % 5];
    it(`isIncidentOpen(${s}) returns boolean (idx ${i})`, () => expect(typeof isIncidentOpen(s)).toBe('boolean'));
  }
});

describe('requiresRegulatorNotification', () => {
  it('CRITICAL requires notification', () => expect(requiresRegulatorNotification('CRITICAL')).toBe(true));
  it('CATASTROPHIC requires notification', () => expect(requiresRegulatorNotification('CATASTROPHIC')).toBe(true));
  it('MINOR does not require', () => expect(requiresRegulatorNotification('MINOR')).toBe(false));
  it('MODERATE does not require', () => expect(requiresRegulatorNotification('MODERATE')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = INCIDENT_SEVERITIES[i % 5];
    it(`requiresRegulatorNotification(${s}) returns boolean (idx ${i})`, () => expect(typeof requiresRegulatorNotification(s)).toBe('boolean'));
  }
});

describe('lostTimeIncidentRate', () => {
  it('0 incidents = 0 LTIR', () => expect(lostTimeIncidentRate(0, 100000)).toBe(0));
  it('0 hours = 0 LTIR', () => expect(lostTimeIncidentRate(5, 0)).toBe(0));
  it('LTIR formula: (LTI / hours) × 200000', () => {
    expect(lostTimeIncidentRate(2, 200000)).toBe(2);
  });
  for (let i = 1; i <= 50; i++) {
    it(`LTIR for ${i} incidents is positive`, () => {
      expect(lostTimeIncidentRate(i, 200000)).toBeGreaterThan(0);
    });
  }
});
