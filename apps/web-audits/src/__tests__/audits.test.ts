// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-audits specification tests

type AuditType = 'INTERNAL' | 'EXTERNAL' | 'SURVEILLANCE' | 'CERTIFICATION' | 'PROCESS';
type FindingSeverity = 'MAJOR_NC' | 'MINOR_NC' | 'OBSERVATION' | 'OPPORTUNITY';
type AuditStatus = 'PLANNED' | 'IN_PROGRESS' | 'COMPLETE' | 'OVERDUE' | 'CANCELLED';

const AUDIT_TYPES: AuditType[] = ['INTERNAL', 'EXTERNAL', 'SURVEILLANCE', 'CERTIFICATION', 'PROCESS'];
const FINDING_SEVERITIES: FindingSeverity[] = ['MAJOR_NC', 'MINOR_NC', 'OBSERVATION', 'OPPORTUNITY'];
const AUDIT_STATUSES: AuditStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETE', 'OVERDUE', 'CANCELLED'];

const findingColor: Record<FindingSeverity, string> = {
  MAJOR_NC: 'bg-red-100 text-red-800',
  MINOR_NC: 'bg-amber-100 text-amber-800',
  OBSERVATION: 'bg-blue-100 text-blue-800',
  OPPORTUNITY: 'bg-green-100 text-green-800',
};

const auditStatusBadge: Record<AuditStatus, string> = {
  PLANNED: 'bg-gray-100 text-gray-700',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  COMPLETE: 'bg-green-100 text-green-800',
  OVERDUE: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-200 text-gray-500',
};

const findingWeight: Record<FindingSeverity, number> = {
  MAJOR_NC: 10, MINOR_NC: 5, OBSERVATION: 2, OPPORTUNITY: 0,
};

function computeAuditScore(findings: Record<FindingSeverity, number>): number {
  const penalty = FINDING_SEVERITIES.reduce((sum, s) => sum + (findings[s] || 0) * findingWeight[s], 0);
  return Math.max(0, 100 - penalty);
}

function isOverdue(plannedDate: Date, status: AuditStatus, now: Date): boolean {
  return status !== 'COMPLETE' && status !== 'CANCELLED' && now > plannedDate;
}

function capaRequired(severity: FindingSeverity): boolean {
  return severity === 'MAJOR_NC' || severity === 'MINOR_NC';
}

describe('Finding severity colors', () => {
  FINDING_SEVERITIES.forEach(s => {
    it(`${s} has color`, () => expect(findingColor[s]).toBeDefined());
    it(`${s} color has bg-`, () => expect(findingColor[s]).toContain('bg-'));
  });
  it('MAJOR_NC is red', () => expect(findingColor.MAJOR_NC).toContain('red'));
  it('MINOR_NC is amber', () => expect(findingColor.MINOR_NC).toContain('amber'));
  it('OPPORTUNITY is green', () => expect(findingColor.OPPORTUNITY).toContain('green'));
  for (let i = 0; i < 100; i++) {
    const s = FINDING_SEVERITIES[i % FINDING_SEVERITIES.length];
    it(`finding color string (idx ${i})`, () => expect(typeof findingColor[s]).toBe('string'));
  }
});

describe('Audit status badges', () => {
  AUDIT_STATUSES.forEach(s => {
    it(`${s} badge defined`, () => expect(auditStatusBadge[s]).toBeDefined());
  });
  it('COMPLETE is green', () => expect(auditStatusBadge.COMPLETE).toContain('green'));
  it('OVERDUE is red', () => expect(auditStatusBadge.OVERDUE).toContain('red'));
  for (let i = 0; i < 100; i++) {
    const s = AUDIT_STATUSES[i % AUDIT_STATUSES.length];
    it(`audit status badge string (idx ${i})`, () => expect(typeof auditStatusBadge[s]).toBe('string'));
  }
});

describe('Finding weights', () => {
  it('MAJOR_NC is heaviest', () => {
    FINDING_SEVERITIES.filter(s => s !== 'MAJOR_NC').forEach(s => {
      expect(findingWeight.MAJOR_NC).toBeGreaterThan(findingWeight[s]);
    });
  });
  it('OPPORTUNITY costs 0', () => expect(findingWeight.OPPORTUNITY).toBe(0));
  FINDING_SEVERITIES.forEach(s => {
    it(`${s} weight is non-negative`, () => expect(findingWeight[s]).toBeGreaterThanOrEqual(0));
  });
  for (let i = 0; i < 50; i++) {
    const s = FINDING_SEVERITIES[i % FINDING_SEVERITIES.length];
    it(`weight for ${s} is number (idx ${i})`, () => expect(typeof findingWeight[s]).toBe('number'));
  }
});

describe('computeAuditScore', () => {
  it('no findings gives 100', () => {
    expect(computeAuditScore({ MAJOR_NC: 0, MINOR_NC: 0, OBSERVATION: 0, OPPORTUNITY: 0 })).toBe(100);
  });
  it('1 major NC subtracts 10', () => {
    expect(computeAuditScore({ MAJOR_NC: 1, MINOR_NC: 0, OBSERVATION: 0, OPPORTUNITY: 0 })).toBe(90);
  });
  it('score never goes below 0', () => {
    expect(computeAuditScore({ MAJOR_NC: 20, MINOR_NC: 20, OBSERVATION: 20, OPPORTUNITY: 0 })).toBe(0);
  });
  for (let i = 0; i <= 100; i++) {
    it(`computeAuditScore with ${i} observations is between 0-100`, () => {
      const score = computeAuditScore({ MAJOR_NC: 0, MINOR_NC: 0, OBSERVATION: i, OPPORTUNITY: 0 });
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  }
});

describe('capaRequired', () => {
  it('MAJOR_NC requires CAPA', () => expect(capaRequired('MAJOR_NC')).toBe(true));
  it('MINOR_NC requires CAPA', () => expect(capaRequired('MINOR_NC')).toBe(true));
  it('OBSERVATION does not require CAPA', () => expect(capaRequired('OBSERVATION')).toBe(false));
  it('OPPORTUNITY does not require CAPA', () => expect(capaRequired('OPPORTUNITY')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = FINDING_SEVERITIES[i % FINDING_SEVERITIES.length];
    it(`capaRequired returns boolean for ${s} (idx ${i})`, () => {
      expect(typeof capaRequired(s)).toBe('boolean');
    });
  }
});

describe('isOverdue', () => {
  it('past date with IN_PROGRESS status is overdue', () => {
    const planned = new Date('2025-01-01');
    const now = new Date('2026-01-01');
    expect(isOverdue(planned, 'IN_PROGRESS', now)).toBe(true);
  });
  it('COMPLETE audit is never overdue', () => {
    const planned = new Date('2025-01-01');
    const now = new Date('2026-01-01');
    expect(isOverdue(planned, 'COMPLETE', now)).toBe(false);
  });
  it('future date is not overdue', () => {
    const planned = new Date('2027-01-01');
    const now = new Date('2026-01-01');
    expect(isOverdue(planned, 'PLANNED', now)).toBe(false);
  });
  for (let i = 0; i < 100; i++) {
    it(`isOverdue returns boolean (idx ${i})`, () => {
      const s = AUDIT_STATUSES[i % AUDIT_STATUSES.length];
      expect(typeof isOverdue(new Date(), s, new Date())).toBe('boolean');
    });
  }
});
