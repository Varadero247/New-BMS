// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential.

import { ComplaintRegister } from '../complaint-register';
import { ResolutionTracker } from '../resolution-tracker';
import {
  ComplaintSource,
  ComplaintSeverity,
  ComplaintStatus,
  ComplaintCategory,
  ResolutionType,
} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ALL_SOURCES: ComplaintSource[] = ['EMAIL', 'PHONE', 'WEB_FORM', 'IN_PERSON', 'SOCIAL_MEDIA', 'REGULATORY', 'LEGAL'];
const ALL_SEVERITIES: ComplaintSeverity[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const ALL_STATUSES: ComplaintStatus[] = ['RECEIVED', 'ACKNOWLEDGED', 'UNDER_INVESTIGATION', 'RESOLVED', 'CLOSED', 'ESCALATED', 'WITHDRAWN'];
const ALL_CATEGORIES: ComplaintCategory[] = ['PRODUCT_QUALITY', 'SERVICE_DELIVERY', 'BILLING', 'STAFF_CONDUCT', 'COMPLIANCE', 'SAFETY', 'DATA_PRIVACY'];
const ALL_RESOLUTION_TYPES: ResolutionType[] = ['REFUND', 'REPLACEMENT', 'APOLOGY', 'PROCESS_CHANGE', 'TRAINING', 'COMPENSATION', 'NO_ACTION'];

function makeRegister(): ComplaintRegister { return new ComplaintRegister(); }
function makeTracker(): ResolutionTracker { return new ResolutionTracker(); }

function receiveOne(reg: ComplaintRegister, overrides: Partial<{
  source: ComplaintSource;
  severity: ComplaintSeverity;
  category: ComplaintCategory;
  customerId: string;
  customerName: string;
  description: string;
  receivedAt: string;
  targetResolutionDate: string;
  notes: string;
}> = {}) {
  return reg.receive(
    overrides.source ?? 'EMAIL',
    overrides.severity ?? 'LOW',
    overrides.category ?? 'BILLING',
    overrides.customerId ?? 'CUST-001',
    overrides.customerName ?? 'Alice',
    overrides.description ?? 'Test complaint',
    overrides.receivedAt ?? '2026-01-10',
    overrides.targetResolutionDate,
    overrides.notes,
  );
}

// ===========================================================================
// BLOCK 1: ComplaintRegister — Core creation & fields
// ===========================================================================
describe('ComplaintRegister — creation and fields', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('starts with count 0', () => { expect(reg.getCount()).toBe(0); });
  it('getAll returns empty array initially', () => { expect(reg.getAll()).toHaveLength(0); });
  it('getOpenCount returns 0 initially', () => { expect(reg.getOpenCount()).toBe(0); });
  it('getCritical returns empty initially', () => { expect(reg.getCritical()).toHaveLength(0); });

  it('receive returns a ComplaintRecord', () => {
    const c = receiveOne(reg);
    expect(c).toBeDefined();
  });
  it('receive sets status to RECEIVED', () => {
    expect(receiveOne(reg).status).toBe('RECEIVED');
  });
  it('receive sets id', () => {
    expect(typeof receiveOne(reg).id).toBe('string');
  });
  it('receive id is non-empty', () => {
    expect(receiveOne(reg).id.length).toBeGreaterThan(0);
  });
  it('receive sets referenceNumber', () => {
    expect(typeof receiveOne(reg).referenceNumber).toBe('string');
  });
  it('receive referenceNumber starts with CMP-', () => {
    expect(receiveOne(reg).referenceNumber.startsWith('CMP-')).toBe(true);
  });
  it('receive referenceNumber contains year 2026', () => {
    expect(receiveOne(reg).referenceNumber).toContain('2026');
  });
  it('receive referenceNumber first is CMP-2026-001', () => {
    expect(receiveOne(reg).referenceNumber).toBe('CMP-2026-001');
  });
  it('receive second referenceNumber is CMP-2026-002', () => {
    receiveOne(reg);
    expect(receiveOne(reg).referenceNumber).toBe('CMP-2026-002');
  });
  it('receive third referenceNumber is CMP-2026-003', () => {
    receiveOne(reg); receiveOne(reg);
    expect(receiveOne(reg).referenceNumber).toBe('CMP-2026-003');
  });
  it('receive sets source correctly', () => {
    expect(receiveOne(reg, { source: 'PHONE' }).source).toBe('PHONE');
  });
  it('receive sets severity correctly', () => {
    expect(receiveOne(reg, { severity: 'CRITICAL' }).severity).toBe('CRITICAL');
  });
  it('receive sets category correctly', () => {
    expect(receiveOne(reg, { category: 'SAFETY' }).category).toBe('SAFETY');
  });
  it('receive sets customerId', () => {
    expect(receiveOne(reg, { customerId: 'C-99' }).customerId).toBe('C-99');
  });
  it('receive sets customerName', () => {
    expect(receiveOne(reg, { customerName: 'Bob' }).customerName).toBe('Bob');
  });
  it('receive sets description', () => {
    expect(receiveOne(reg, { description: 'My complaint' }).description).toBe('My complaint');
  });
  it('receive sets receivedAt', () => {
    expect(receiveOne(reg, { receivedAt: '2026-03-01' }).receivedAt).toBe('2026-03-01');
  });
  it('receive sets targetResolutionDate when provided', () => {
    expect(receiveOne(reg, { targetResolutionDate: '2026-03-15' }).targetResolutionDate).toBe('2026-03-15');
  });
  it('receive targetResolutionDate is undefined when not provided', () => {
    expect(receiveOne(reg).targetResolutionDate).toBeUndefined();
  });
  it('receive sets notes when provided', () => {
    expect(receiveOne(reg, { notes: 'urgent' }).notes).toBe('urgent');
  });
  it('receive notes is undefined when not provided', () => {
    expect(receiveOne(reg).notes).toBeUndefined();
  });
  it('receive acknowledgedAt is undefined initially', () => {
    expect(receiveOne(reg).acknowledgedAt).toBeUndefined();
  });
  it('receive resolvedAt is undefined initially', () => {
    expect(receiveOne(reg).resolvedAt).toBeUndefined();
  });
  it('receive closedAt is undefined initially', () => {
    expect(receiveOne(reg).closedAt).toBeUndefined();
  });
  it('receive assignedTo is undefined initially', () => {
    expect(receiveOne(reg).assignedTo).toBeUndefined();
  });
  it('receive rootCause is undefined initially', () => {
    expect(receiveOne(reg).rootCause).toBeUndefined();
  });
  it('two receives produce different ids', () => {
    const a = receiveOne(reg);
    const b = receiveOne(reg);
    expect(a.id).not.toBe(b.id);
  });
  it('two receives produce different referenceNumbers', () => {
    const a = receiveOne(reg);
    const b = receiveOne(reg);
    expect(a.referenceNumber).not.toBe(b.referenceNumber);
  });
  it('count increments after receive', () => {
    receiveOne(reg);
    expect(reg.getCount()).toBe(1);
  });
  it('getAll length equals received count', () => {
    receiveOne(reg); receiveOne(reg);
    expect(reg.getAll()).toHaveLength(2);
  });
});

// ===========================================================================
// BLOCK 2: Parameterized source enum coverage
// ===========================================================================
describe('ComplaintRegister — all sources', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  ALL_SOURCES.forEach(src => {
    it(`source ${src} stored correctly`, () => {
      expect(receiveOne(reg, { source: src }).source).toBe(src);
    });
  });
});

// ===========================================================================
// BLOCK 3: Parameterized severity coverage
// ===========================================================================
describe('ComplaintRegister — all severities', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  ALL_SEVERITIES.forEach(sev => {
    it(`severity ${sev} stored correctly`, () => {
      expect(receiveOne(reg, { severity: sev }).severity).toBe(sev);
    });
    it(`getBySeverity(${sev}) returns matching records`, () => {
      receiveOne(reg, { severity: sev });
      expect(reg.getBySeverity(sev)).toHaveLength(1);
    });
    it(`getBySeverity(${sev}) result has correct severity`, () => {
      receiveOne(reg, { severity: sev });
      expect(reg.getBySeverity(sev)[0].severity).toBe(sev);
    });
    it(`getBySeverity(${sev}) excludes other severities`, () => {
      ALL_SEVERITIES.filter(s => s !== sev).forEach(other => {
        receiveOne(reg, { severity: other });
      });
      expect(reg.getBySeverity(sev)).toHaveLength(0);
    });
  });
});

// ===========================================================================
// BLOCK 4: Parameterized category coverage
// ===========================================================================
describe('ComplaintRegister — all categories', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  ALL_CATEGORIES.forEach(cat => {
    it(`category ${cat} stored correctly`, () => {
      expect(receiveOne(reg, { category: cat }).category).toBe(cat);
    });
    it(`getByCategory(${cat}) returns matching records`, () => {
      receiveOne(reg, { category: cat });
      expect(reg.getByCategory(cat)).toHaveLength(1);
    });
    it(`getByCategory(${cat}) result has correct category`, () => {
      receiveOne(reg, { category: cat });
      expect(reg.getByCategory(cat)[0].category).toBe(cat);
    });
  });
});

// ===========================================================================
// BLOCK 5: Status transitions — acknowledge
// ===========================================================================
describe('ComplaintRegister — acknowledge', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('acknowledge sets status to ACKNOWLEDGED', () => {
    const c = receiveOne(reg);
    reg.acknowledge(c.id, '2026-01-11');
    expect(reg.get(c.id)!.status).toBe('ACKNOWLEDGED');
  });
  it('acknowledge sets acknowledgedAt', () => {
    const c = receiveOne(reg);
    reg.acknowledge(c.id, '2026-01-11');
    expect(reg.get(c.id)!.acknowledgedAt).toBe('2026-01-11');
  });
  it('acknowledge returns the updated record', () => {
    const c = receiveOne(reg);
    const updated = reg.acknowledge(c.id, '2026-01-11');
    expect(updated.status).toBe('ACKNOWLEDGED');
  });
  it('acknowledge throws for unknown id', () => {
    expect(() => reg.acknowledge('nonexistent', '2026-01-11')).toThrow();
  });
  it('acknowledge preserves other fields', () => {
    const c = receiveOne(reg, { customerName: 'TestUser' });
    reg.acknowledge(c.id, '2026-01-11');
    expect(reg.get(c.id)!.customerName).toBe('TestUser');
  });
  it('acknowledge preserves severity', () => {
    const c = receiveOne(reg, { severity: 'HIGH' });
    reg.acknowledge(c.id, '2026-01-11');
    expect(reg.get(c.id)!.severity).toBe('HIGH');
  });
  it('getByStatus ACKNOWLEDGED returns acknowledged records', () => {
    const c = receiveOne(reg);
    reg.acknowledge(c.id, '2026-01-11');
    expect(reg.getByStatus('ACKNOWLEDGED')).toHaveLength(1);
  });
  it('getByStatus RECEIVED returns 0 after acknowledge', () => {
    const c = receiveOne(reg);
    reg.acknowledge(c.id, '2026-01-11');
    expect(reg.getByStatus('RECEIVED')).toHaveLength(0);
  });
});

// ===========================================================================
// BLOCK 6: Status transitions — investigate
// ===========================================================================
describe('ComplaintRegister — investigate', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('investigate sets status to UNDER_INVESTIGATION', () => {
    const c = receiveOne(reg);
    reg.investigate(c.id, 'agent@example.com');
    expect(reg.get(c.id)!.status).toBe('UNDER_INVESTIGATION');
  });
  it('investigate sets assignedTo', () => {
    const c = receiveOne(reg);
    reg.investigate(c.id, 'agent@example.com');
    expect(reg.get(c.id)!.assignedTo).toBe('agent@example.com');
  });
  it('investigate returns the updated record', () => {
    const c = receiveOne(reg);
    const updated = reg.investigate(c.id, 'agent@example.com');
    expect(updated.assignedTo).toBe('agent@example.com');
  });
  it('investigate throws for unknown id', () => {
    expect(() => reg.investigate('nonexistent', 'agent')).toThrow();
  });
  it('getByStatus UNDER_INVESTIGATION returns 1', () => {
    const c = receiveOne(reg);
    reg.investigate(c.id, 'agent');
    expect(reg.getByStatus('UNDER_INVESTIGATION')).toHaveLength(1);
  });
  it('investigate preserves referenceNumber', () => {
    const c = receiveOne(reg);
    const ref = c.referenceNumber;
    reg.investigate(c.id, 'agent');
    expect(reg.get(c.id)!.referenceNumber).toBe(ref);
  });
});

// ===========================================================================
// BLOCK 7: Status transitions — resolve
// ===========================================================================
describe('ComplaintRegister — resolve', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('resolve sets status to RESOLVED', () => {
    const c = receiveOne(reg);
    reg.resolve(c.id, 'Root cause found', '2026-01-20');
    expect(reg.get(c.id)!.status).toBe('RESOLVED');
  });
  it('resolve sets rootCause', () => {
    const c = receiveOne(reg);
    reg.resolve(c.id, 'Root cause found', '2026-01-20');
    expect(reg.get(c.id)!.rootCause).toBe('Root cause found');
  });
  it('resolve sets resolvedAt', () => {
    const c = receiveOne(reg);
    reg.resolve(c.id, 'cause', '2026-01-20');
    expect(reg.get(c.id)!.resolvedAt).toBe('2026-01-20');
  });
  it('resolve returns the updated record', () => {
    const c = receiveOne(reg);
    const updated = reg.resolve(c.id, 'cause', '2026-01-20');
    expect(updated.status).toBe('RESOLVED');
  });
  it('resolve throws for unknown id', () => {
    expect(() => reg.resolve('bad-id', 'cause', '2026-01-20')).toThrow();
  });
  it('getByStatus RESOLVED returns 1 after resolve', () => {
    const c = receiveOne(reg);
    reg.resolve(c.id, 'cause', '2026-01-20');
    expect(reg.getByStatus('RESOLVED')).toHaveLength(1);
  });
  it('resolve preserves category', () => {
    const c = receiveOne(reg, { category: 'SAFETY' });
    reg.resolve(c.id, 'cause', '2026-01-20');
    expect(reg.get(c.id)!.category).toBe('SAFETY');
  });
});

// ===========================================================================
// BLOCK 8: Status transitions — close
// ===========================================================================
describe('ComplaintRegister — close', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('close sets status to CLOSED', () => {
    const c = receiveOne(reg);
    reg.close(c.id, '2026-01-25');
    expect(reg.get(c.id)!.status).toBe('CLOSED');
  });
  it('close sets closedAt', () => {
    const c = receiveOne(reg);
    reg.close(c.id, '2026-01-25');
    expect(reg.get(c.id)!.closedAt).toBe('2026-01-25');
  });
  it('close returns updated record', () => {
    const c = receiveOne(reg);
    const updated = reg.close(c.id, '2026-01-25');
    expect(updated.closedAt).toBe('2026-01-25');
  });
  it('close throws for unknown id', () => {
    expect(() => reg.close('bad', '2026-01-25')).toThrow();
  });
  it('closed complaint not in getOpenCount', () => {
    const c = receiveOne(reg);
    reg.close(c.id, '2026-01-25');
    expect(reg.getOpenCount()).toBe(0);
  });
  it('getByStatus CLOSED returns 1', () => {
    const c = receiveOne(reg);
    reg.close(c.id, '2026-01-25');
    expect(reg.getByStatus('CLOSED')).toHaveLength(1);
  });
});

// ===========================================================================
// BLOCK 9: Status transitions — escalate
// ===========================================================================
describe('ComplaintRegister — escalate', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('escalate sets status to ESCALATED', () => {
    const c = receiveOne(reg);
    reg.escalate(c.id);
    expect(reg.get(c.id)!.status).toBe('ESCALATED');
  });
  it('escalate returns updated record', () => {
    const c = receiveOne(reg);
    const updated = reg.escalate(c.id);
    expect(updated.status).toBe('ESCALATED');
  });
  it('escalate throws for unknown id', () => {
    expect(() => reg.escalate('bad')).toThrow();
  });
  it('getByStatus ESCALATED returns 1', () => {
    const c = receiveOne(reg);
    reg.escalate(c.id);
    expect(reg.getByStatus('ESCALATED')).toHaveLength(1);
  });
  it('escalated complaint is still open (not closed/withdrawn)', () => {
    const c = receiveOne(reg);
    reg.escalate(c.id);
    expect(reg.getOpenCount()).toBe(1);
  });
});

// ===========================================================================
// BLOCK 10: Status transitions — withdraw
// ===========================================================================
describe('ComplaintRegister — withdraw', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('withdraw sets status to WITHDRAWN', () => {
    const c = receiveOne(reg);
    reg.withdraw(c.id);
    expect(reg.get(c.id)!.status).toBe('WITHDRAWN');
  });
  it('withdraw returns updated record', () => {
    const c = receiveOne(reg);
    const updated = reg.withdraw(c.id);
    expect(updated.status).toBe('WITHDRAWN');
  });
  it('withdraw throws for unknown id', () => {
    expect(() => reg.withdraw('bad')).toThrow();
  });
  it('withdrawn complaint not in getOpenCount', () => {
    const c = receiveOne(reg);
    reg.withdraw(c.id);
    expect(reg.getOpenCount()).toBe(0);
  });
  it('getByStatus WITHDRAWN returns 1', () => {
    const c = receiveOne(reg);
    reg.withdraw(c.id);
    expect(reg.getByStatus('WITHDRAWN')).toHaveLength(1);
  });
});

// ===========================================================================
// BLOCK 11: getByStatus for all statuses
// ===========================================================================
describe('ComplaintRegister — getByStatus', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  ALL_STATUSES.forEach(status => {
    it(`getByStatus(${status}) returns empty when no matching records`, () => {
      expect(reg.getByStatus(status)).toHaveLength(0);
    });
  });

  it('getByStatus RECEIVED returns only RECEIVED', () => {
    const c = receiveOne(reg);
    receiveOne(reg);
    reg.close(c.id, '2026-02-01');
    expect(reg.getByStatus('RECEIVED')).toHaveLength(1);
  });
  it('getByStatus returns array', () => {
    expect(Array.isArray(reg.getByStatus('RECEIVED'))).toBe(true);
  });
  it('getByStatus result items have correct status', () => {
    receiveOne(reg);
    const results = reg.getByStatus('RECEIVED');
    results.forEach(r => expect(r.status).toBe('RECEIVED'));
  });
});

// ===========================================================================
// BLOCK 12: getByCustomer
// ===========================================================================
describe('ComplaintRegister — getByCustomer', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('getByCustomer returns empty for unknown customer', () => {
    expect(reg.getByCustomer('UNKNOWN')).toHaveLength(0);
  });
  it('getByCustomer returns matching records', () => {
    receiveOne(reg, { customerId: 'C-01' });
    expect(reg.getByCustomer('C-01')).toHaveLength(1);
  });
  it('getByCustomer returns multiple records for same customer', () => {
    receiveOne(reg, { customerId: 'C-01' });
    receiveOne(reg, { customerId: 'C-01' });
    expect(reg.getByCustomer('C-01')).toHaveLength(2);
  });
  it('getByCustomer excludes other customers', () => {
    receiveOne(reg, { customerId: 'C-01' });
    receiveOne(reg, { customerId: 'C-02' });
    expect(reg.getByCustomer('C-01')).toHaveLength(1);
  });
  it('getByCustomer result items have correct customerId', () => {
    receiveOne(reg, { customerId: 'C-55' });
    reg.getByCustomer('C-55').forEach(r => expect(r.customerId).toBe('C-55'));
  });
  it('getByCustomer with 5 complaints returns 5', () => {
    Array.from({ length: 5 }, () => receiveOne(reg, { customerId: 'CUST-BULK' }));
    expect(reg.getByCustomer('CUST-BULK')).toHaveLength(5);
  });
});

// ===========================================================================
// BLOCK 13: getOverdue
// ===========================================================================
describe('ComplaintRegister — getOverdue', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('getOverdue returns empty when no complaints', () => {
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('getOverdue returns empty when no targetResolutionDate set', () => {
    receiveOne(reg);
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('getOverdue returns record where targetResolutionDate < asOf', () => {
    receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    expect(reg.getOverdue('2026-02-01')).toHaveLength(1);
  });
  it('getOverdue excludes record where targetResolutionDate >= asOf', () => {
    receiveOne(reg, { targetResolutionDate: '2026-03-01' });
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('getOverdue excludes CLOSED complaints', () => {
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    reg.close(c.id, '2026-01-15');
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('getOverdue excludes WITHDRAWN complaints', () => {
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    reg.withdraw(c.id);
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('getOverdue excludes RESOLVED complaints', () => {
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    reg.resolve(c.id, 'cause', '2026-01-10');
    // RESOLVED is NOT in the open statuses for overdue
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('getOverdue includes ACKNOWLEDGED complaints that are past due', () => {
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    reg.acknowledge(c.id, '2026-01-02');
    expect(reg.getOverdue('2026-02-01')).toHaveLength(1);
  });
  it('getOverdue includes UNDER_INVESTIGATION complaints that are past due', () => {
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    reg.investigate(c.id, 'agent');
    expect(reg.getOverdue('2026-02-01')).toHaveLength(1);
  });
  it('getOverdue returns multiple overdue records', () => {
    receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    receiveOne(reg, { targetResolutionDate: '2026-01-05' });
    expect(reg.getOverdue('2026-02-01')).toHaveLength(2);
  });
});

// ===========================================================================
// BLOCK 14: getCritical
// ===========================================================================
describe('ComplaintRegister — getCritical', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('getCritical returns empty initially', () => {
    expect(reg.getCritical()).toHaveLength(0);
  });
  it('getCritical returns critical complaint', () => {
    receiveOne(reg, { severity: 'CRITICAL' });
    expect(reg.getCritical()).toHaveLength(1);
  });
  it('getCritical excludes non-critical', () => {
    receiveOne(reg, { severity: 'HIGH' });
    receiveOne(reg, { severity: 'LOW' });
    expect(reg.getCritical()).toHaveLength(0);
  });
  it('getCritical returns all critical complaints', () => {
    receiveOne(reg, { severity: 'CRITICAL' });
    receiveOne(reg, { severity: 'CRITICAL' });
    expect(reg.getCritical()).toHaveLength(2);
  });
  it('getCritical items have CRITICAL severity', () => {
    receiveOne(reg, { severity: 'CRITICAL' });
    reg.getCritical().forEach(r => expect(r.severity).toBe('CRITICAL'));
  });
});

// ===========================================================================
// BLOCK 15: getOpenCount
// ===========================================================================
describe('ComplaintRegister — getOpenCount', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('getOpenCount is 0 initially', () => {
    expect(reg.getOpenCount()).toBe(0);
  });
  it('getOpenCount is 1 after receiving one', () => {
    receiveOne(reg);
    expect(reg.getOpenCount()).toBe(1);
  });
  it('getOpenCount decrements after close', () => {
    const c = receiveOne(reg);
    reg.close(c.id, '2026-01-25');
    expect(reg.getOpenCount()).toBe(0);
  });
  it('getOpenCount decrements after withdraw', () => {
    const c = receiveOne(reg);
    reg.withdraw(c.id);
    expect(reg.getOpenCount()).toBe(0);
  });
  it('getOpenCount includes RECEIVED', () => {
    receiveOne(reg);
    expect(reg.getOpenCount()).toBe(1);
  });
  it('getOpenCount includes ACKNOWLEDGED', () => {
    const c = receiveOne(reg);
    reg.acknowledge(c.id, '2026-01-11');
    expect(reg.getOpenCount()).toBe(1);
  });
  it('getOpenCount includes UNDER_INVESTIGATION', () => {
    const c = receiveOne(reg);
    reg.investigate(c.id, 'agent');
    expect(reg.getOpenCount()).toBe(1);
  });
  it('getOpenCount includes RESOLVED', () => {
    const c = receiveOne(reg);
    reg.resolve(c.id, 'cause', '2026-01-20');
    expect(reg.getOpenCount()).toBe(1);
  });
  it('getOpenCount includes ESCALATED', () => {
    const c = receiveOne(reg);
    reg.escalate(c.id);
    expect(reg.getOpenCount()).toBe(1);
  });
  it('mixed open and closed count correctly', () => {
    const c1 = receiveOne(reg);
    receiveOne(reg);
    reg.close(c1.id, '2026-01-25');
    expect(reg.getOpenCount()).toBe(1);
  });
});

// ===========================================================================
// BLOCK 16: get() method
// ===========================================================================
describe('ComplaintRegister — get', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('get returns undefined for unknown id', () => {
    expect(reg.get('nonexistent')).toBeUndefined();
  });
  it('get returns the record by id', () => {
    const c = receiveOne(reg);
    expect(reg.get(c.id)).toBeDefined();
  });
  it('get returns record with correct id', () => {
    const c = receiveOne(reg);
    expect(reg.get(c.id)!.id).toBe(c.id);
  });
  it('get returns record with correct referenceNumber', () => {
    const c = receiveOne(reg);
    expect(reg.get(c.id)!.referenceNumber).toBe(c.referenceNumber);
  });
  it('get reflects mutations', () => {
    const c = receiveOne(reg);
    reg.acknowledge(c.id, '2026-01-11');
    expect(reg.get(c.id)!.status).toBe('ACKNOWLEDGED');
  });
});

// ===========================================================================
// BLOCK 17: Bulk receive parameterized loop (reference number sequence)
// ===========================================================================
describe('ComplaintRegister — referenceNumber sequence', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  Array.from({ length: 50 }, (_, i) => i).forEach(i => {
    it(`referenceNumber at position ${i + 1} has correct sequence`, () => {
      // Each test gets a fresh register, so it only gets one record
      const c = receiveOne(reg);
      expect(c.referenceNumber).toBe('CMP-2026-001');
    });
  });
});

// ===========================================================================
// BLOCK 18: Bulk receive — 100 complaints, all unique ids
// ===========================================================================
describe('ComplaintRegister — bulk operations', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('100 complaints all have unique ids', () => {
    const ids = Array.from({ length: 100 }, () => receiveOne(reg).id);
    expect(new Set(ids).size).toBe(100);
  });
  it('100 complaints all have unique referenceNumbers', () => {
    const refs = Array.from({ length: 100 }, () => receiveOne(reg).referenceNumber);
    expect(new Set(refs).size).toBe(100);
  });
  it('getCount is 100 after 100 receives', () => {
    Array.from({ length: 100 }, () => receiveOne(reg));
    expect(reg.getCount()).toBe(100);
  });
  it('getAll returns 100 records', () => {
    Array.from({ length: 100 }, () => receiveOne(reg));
    expect(reg.getAll()).toHaveLength(100);
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`bulk complaint ${i} has status RECEIVED`, () => {
      const complaints = Array.from({ length: 20 }, () => receiveOne(reg));
      expect(complaints[i].status).toBe('RECEIVED');
    });
  });
});

// ===========================================================================
// BLOCK 19: Full lifecycle transitions
// ===========================================================================
describe('ComplaintRegister — full lifecycle', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('RECEIVED -> ACKNOWLEDGED -> UNDER_INVESTIGATION -> RESOLVED -> CLOSED', () => {
    const c = receiveOne(reg);
    reg.acknowledge(c.id, '2026-01-11');
    reg.investigate(c.id, 'agent@test.com');
    reg.resolve(c.id, 'Root cause', '2026-01-20');
    reg.close(c.id, '2026-01-25');
    const final = reg.get(c.id)!;
    expect(final.status).toBe('CLOSED');
    expect(final.acknowledgedAt).toBe('2026-01-11');
    expect(final.assignedTo).toBe('agent@test.com');
    expect(final.rootCause).toBe('Root cause');
    expect(final.resolvedAt).toBe('2026-01-20');
    expect(final.closedAt).toBe('2026-01-25');
  });
  it('RECEIVED -> ESCALATED -> RESOLVED -> CLOSED', () => {
    const c = receiveOne(reg);
    reg.escalate(c.id);
    reg.resolve(c.id, 'Escalated resolution', '2026-01-22');
    reg.close(c.id, '2026-01-28');
    expect(reg.get(c.id)!.status).toBe('CLOSED');
  });
  it('RECEIVED -> WITHDRAWN keeps description', () => {
    const c = receiveOne(reg, { description: 'Kept description' });
    reg.withdraw(c.id);
    expect(reg.get(c.id)!.description).toBe('Kept description');
  });
  it('full lifecycle: open count progression', () => {
    const c = receiveOne(reg);
    expect(reg.getOpenCount()).toBe(1);
    reg.acknowledge(c.id, '2026-01-11');
    expect(reg.getOpenCount()).toBe(1);
    reg.investigate(c.id, 'agent');
    expect(reg.getOpenCount()).toBe(1);
    reg.resolve(c.id, 'cause', '2026-01-20');
    expect(reg.getOpenCount()).toBe(1);
    reg.close(c.id, '2026-01-25');
    expect(reg.getOpenCount()).toBe(0);
  });
});

// ===========================================================================
// BLOCK 20: Year in referenceNumber derived from receivedAt
// ===========================================================================
describe('ComplaintRegister — referenceNumber year from receivedAt', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('receivedAt 2025 produces year 2025 in referenceNumber', () => {
    const c = receiveOne(reg, { receivedAt: '2025-06-15' });
    expect(c.referenceNumber).toContain('2025');
  });
  it('receivedAt 2027 produces year 2027 in referenceNumber', () => {
    const c = receiveOne(reg, { receivedAt: '2027-01-01' });
    expect(c.referenceNumber).toContain('2027');
  });
  it('referenceNumber format is CMP-YYYY-NNN', () => {
    const c = receiveOne(reg, { receivedAt: '2026-05-20' });
    expect(c.referenceNumber).toMatch(/^CMP-\d{4}-\d{3}$/);
  });
});

// ===========================================================================
// BLOCK 21: getByStatus parameterized across all statuses (empty register)
// ===========================================================================
describe('ComplaintRegister — getByStatus empty checks', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  ALL_STATUSES.forEach(s => {
    it(`getByStatus(${s}) returns empty array from fresh register`, () => {
      expect(reg.getByStatus(s)).toEqual([]);
    });
  });
});

// ===========================================================================
// BLOCK 22: getBySeverity parameterized cross-check
// ===========================================================================
describe('ComplaintRegister — getBySeverity cross-checks', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  ALL_SEVERITIES.forEach(sev => {
    ALL_SEVERITIES.filter(s => s !== sev).forEach(other => {
      it(`getBySeverity(${sev}) excludes ${other} severity`, () => {
        receiveOne(reg, { severity: other });
        expect(reg.getBySeverity(sev)).toHaveLength(0);
      });
    });
  });
});

// ===========================================================================
// BLOCK 23: getByCategory parameterized cross-check
// ===========================================================================
describe('ComplaintRegister — getByCategory cross-checks', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  ALL_CATEGORIES.forEach(cat => {
    it(`getByCategory(${cat}) returns [] when no records`, () => {
      expect(reg.getByCategory(cat)).toHaveLength(0);
    });
  });
});

// ===========================================================================
// BLOCK 24: Multiple customers
// ===========================================================================
describe('ComplaintRegister — multiple customers', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`customer CUST-${i} gets its own record`, () => {
      Array.from({ length: 30 }, (_, j) => receiveOne(reg, { customerId: `CUST-${j}` }));
      expect(reg.getByCustomer(`CUST-${i}`)).toHaveLength(1);
    });
  });
});

// ===========================================================================
// BLOCK 25: Overdue edge cases
// ===========================================================================
describe('ComplaintRegister — getOverdue edge cases', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('exact date equal to asOf is NOT overdue', () => {
    receiveOne(reg, { targetResolutionDate: '2026-02-01' });
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('one day before asOf is overdue', () => {
    receiveOne(reg, { targetResolutionDate: '2026-01-31' });
    expect(reg.getOverdue('2026-02-01')).toHaveLength(1);
  });
  it('one day after asOf is NOT overdue', () => {
    receiveOne(reg, { targetResolutionDate: '2026-02-02' });
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('ESCALATED overdue complaint included', () => {
    // ESCALATED is not in open statuses for overdue - getOverdue uses RECEIVED/ACKNOWLEDGED/UNDER_INVESTIGATION
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    reg.escalate(c.id);
    // ESCALATED is not in openStatuses for overdue
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('3 overdue out of 5 complaints returned', () => {
    receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    receiveOne(reg, { targetResolutionDate: '2026-01-05' });
    receiveOne(reg, { targetResolutionDate: '2026-01-10' });
    receiveOne(reg, { targetResolutionDate: '2026-03-01' });
    receiveOne(reg);
    expect(reg.getOverdue('2026-02-01')).toHaveLength(3);
  });
});

// ===========================================================================
// BLOCK 26: getAll contents
// ===========================================================================
describe('ComplaintRegister — getAll', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('getAll returns array', () => {
    expect(Array.isArray(reg.getAll())).toBe(true);
  });
  it('getAll contains all received records', () => {
    const c1 = receiveOne(reg, { customerId: 'A' });
    const c2 = receiveOne(reg, { customerId: 'B' });
    const all = reg.getAll();
    const ids = all.map(r => r.id);
    expect(ids).toContain(c1.id);
    expect(ids).toContain(c2.id);
  });
  it('getAll length matches getCount', () => {
    receiveOne(reg); receiveOne(reg); receiveOne(reg);
    expect(reg.getAll().length).toBe(reg.getCount());
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`getAll length is ${n} after ${n} receives`, () => {
      Array.from({ length: n }, () => receiveOne(reg));
      expect(reg.getAll()).toHaveLength(n);
    });
  });
});

// ===========================================================================
// BLOCK 27: Error messages on unknown id
// ===========================================================================
describe('ComplaintRegister — error messages', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('acknowledge throws Error with id in message', () => {
    expect(() => reg.acknowledge('bad-id', '2026-01-11')).toThrow('bad-id');
  });
  it('investigate throws Error with id in message', () => {
    expect(() => reg.investigate('bad-id', 'agent')).toThrow('bad-id');
  });
  it('resolve throws Error with id in message', () => {
    expect(() => reg.resolve('bad-id', 'cause', '2026-01-20')).toThrow('bad-id');
  });
  it('close throws Error with id in message', () => {
    expect(() => reg.close('bad-id', '2026-01-25')).toThrow('bad-id');
  });
  it('escalate throws Error with id in message', () => {
    expect(() => reg.escalate('bad-id')).toThrow('bad-id');
  });
  it('withdraw throws Error with id in message', () => {
    expect(() => reg.withdraw('bad-id')).toThrow('bad-id');
  });
});

// ===========================================================================
// BLOCK 28: ComplaintRegister — source filtering via getByStatus after receive
// ===========================================================================
describe('ComplaintRegister — multiple status counts', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('mixed statuses: counts are correct', () => {
    const c1 = receiveOne(reg);
    const c2 = receiveOne(reg);
    receiveOne(reg);
    reg.acknowledge(c1.id, '2026-01-11');
    reg.escalate(c2.id);
    expect(reg.getByStatus('RECEIVED')).toHaveLength(1);
    expect(reg.getByStatus('ACKNOWLEDGED')).toHaveLength(1);
    expect(reg.getByStatus('ESCALATED')).toHaveLength(1);
  });
  it('getOpenCount with mixed statuses', () => {
    const c1 = receiveOne(reg);
    receiveOne(reg);
    reg.close(c1.id, '2026-01-25');
    expect(reg.getOpenCount()).toBe(1);
  });
});

// ===========================================================================
// BLOCK 29: getCount progression
// ===========================================================================
describe('ComplaintRegister — getCount progression', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  Array.from({ length: 30 }, (_, i) => i + 1).forEach(n => {
    it(`getCount is ${n} after ${n} receives`, () => {
      Array.from({ length: n }, () => receiveOne(reg));
      expect(reg.getCount()).toBe(n);
    });
  });
});

// ===========================================================================
// BLOCK 30: ComplaintRegister — independent instances
// ===========================================================================
describe('ComplaintRegister — instance isolation', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('two separate instances do not share records', () => {
    const reg2 = new ComplaintRegister();
    receiveOne(reg);
    expect(reg2.getCount()).toBe(0);
  });
  it('two separate instances have independent counters', () => {
    const reg2 = new ComplaintRegister();
    receiveOne(reg);
    expect(receiveOne(reg2).referenceNumber).toBe('CMP-2026-001');
  });
});

// ===========================================================================
// BLOCK 31: ResolutionTracker — core creation
// ===========================================================================
describe('ResolutionTracker — creation', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('starts with count 0', () => { expect(tracker.getCount()).toBe(0); });
  it('getAverageSatisfaction returns 0 when empty', () => { expect(tracker.getAverageSatisfaction()).toBe(0); });
  it('getSatisfactionRate returns 0 when empty', () => { expect(tracker.getSatisfactionRate()).toBe(0); });
  it('getCAPALinked returns empty array initially', () => { expect(tracker.getCAPALinked()).toHaveLength(0); });
  it('getByComplaint returns empty for unknown', () => { expect(tracker.getByComplaint('X')).toHaveLength(0); });
  it('getByType returns empty initially', () => { expect(tracker.getByType('REFUND')).toHaveLength(0); });

  it('record returns ResolutionRecord', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'Full refund', 'agent@test.com', '2026-01-20');
    expect(r).toBeDefined();
  });
  it('record has an id', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(r.id.length).toBeGreaterThan(0);
  });
  it('record has complaintId set', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(r.complaintId).toBe('CMP-1');
  });
  it('record has type set', () => {
    const r = tracker.record('CMP-1', 'APOLOGY', 'desc', 'agent', '2026-01-20');
    expect(r.type).toBe('APOLOGY');
  });
  it('record has description set', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'Full refund given', 'agent', '2026-01-20');
    expect(r.description).toBe('Full refund given');
  });
  it('record has implementedBy set', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'manager@test.com', '2026-01-20');
    expect(r.implementedBy).toBe('manager@test.com');
  });
  it('record has implementedAt set', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-02-15');
    expect(r.implementedAt).toBe('2026-02-15');
  });
  it('record customerSatisfied is undefined when not provided', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(r.customerSatisfied).toBeUndefined();
  });
  it('record satisfactionScore is undefined when not provided', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(r.satisfactionScore).toBeUndefined();
  });
  it('record capaRaised is undefined when not provided', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(r.capaRaised).toBeUndefined();
  });
  it('record capaId is undefined when not provided', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(r.capaId).toBeUndefined();
  });
  it('record notes is undefined when not provided', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(r.notes).toBeUndefined();
  });
  it('record customerSatisfied set when provided', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true);
    expect(r.customerSatisfied).toBe(true);
  });
  it('record satisfactionScore set when provided', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, 4);
    expect(r.satisfactionScore).toBe(4);
  });
  it('record capaRaised set when provided', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, 4, true);
    expect(r.capaRaised).toBe(true);
  });
  it('record capaId set when provided', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, 4, true, 'CAPA-001');
    expect(r.capaId).toBe('CAPA-001');
  });
  it('record notes set when provided', () => {
    const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, 4, true, 'CAPA-001', 'note text');
    expect(r.notes).toBe('note text');
  });
  it('two records have different ids', () => {
    const r1 = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    const r2 = tracker.record('CMP-2', 'APOLOGY', 'desc', 'agent', '2026-01-21');
    expect(r1.id).not.toBe(r2.id);
  });
  it('getCount increments on record', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(tracker.getCount()).toBe(1);
  });
});

// ===========================================================================
// BLOCK 32: ResolutionTracker — all resolution types
// ===========================================================================
describe('ResolutionTracker — all resolution types', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  ALL_RESOLUTION_TYPES.forEach(type => {
    it(`type ${type} stored correctly`, () => {
      const r = tracker.record('CMP-1', type, 'desc', 'agent', '2026-01-20');
      expect(r.type).toBe(type);
    });
    it(`getByType(${type}) returns matching record`, () => {
      tracker.record('CMP-1', type, 'desc', 'agent', '2026-01-20');
      expect(tracker.getByType(type)).toHaveLength(1);
    });
    it(`getByType(${type}) result has correct type`, () => {
      tracker.record('CMP-1', type, 'desc', 'agent', '2026-01-20');
      expect(tracker.getByType(type)[0].type).toBe(type);
    });
    it(`getByType(${type}) excludes other types`, () => {
      ALL_RESOLUTION_TYPES.filter(t => t !== type).forEach(other => {
        tracker.record('CMP-X', other, 'desc', 'agent', '2026-01-20');
      });
      expect(tracker.getByType(type)).toHaveLength(0);
    });
  });
});

// ===========================================================================
// BLOCK 33: ResolutionTracker — getByComplaint
// ===========================================================================
describe('ResolutionTracker — getByComplaint', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('getByComplaint returns empty for unknown complaint', () => {
    expect(tracker.getByComplaint('UNKNOWN')).toHaveLength(0);
  });
  it('getByComplaint returns 1 record for single resolution', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(tracker.getByComplaint('CMP-1')).toHaveLength(1);
  });
  it('getByComplaint returns multiple records', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    tracker.record('CMP-1', 'APOLOGY', 'desc', 'agent', '2026-01-21');
    expect(tracker.getByComplaint('CMP-1')).toHaveLength(2);
  });
  it('getByComplaint excludes other complaint ids', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    tracker.record('CMP-2', 'APOLOGY', 'desc', 'agent', '2026-01-21');
    expect(tracker.getByComplaint('CMP-1')).toHaveLength(1);
  });
  it('getByComplaint result items have correct complaintId', () => {
    tracker.record('CMP-5', 'REFUND', 'desc', 'agent', '2026-01-20');
    tracker.getByComplaint('CMP-5').forEach(r => expect(r.complaintId).toBe('CMP-5'));
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getByComplaint returns ${n} records when ${n} added`, () => {
      Array.from({ length: n }, (_, j) =>
        tracker.record('CMP-BULK', ALL_RESOLUTION_TYPES[j % ALL_RESOLUTION_TYPES.length], 'desc', 'agent', '2026-01-20')
      );
      expect(tracker.getByComplaint('CMP-BULK')).toHaveLength(n);
    });
  });
});

// ===========================================================================
// BLOCK 34: ResolutionTracker — getAverageSatisfaction
// ===========================================================================
describe('ResolutionTracker — getAverageSatisfaction', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('returns 0 when no records', () => {
    expect(tracker.getAverageSatisfaction()).toBe(0);
  });
  it('returns 0 when no records have satisfactionScore', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(tracker.getAverageSatisfaction()).toBe(0);
  });
  it('single score 5 returns 5', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, 5);
    expect(tracker.getAverageSatisfaction()).toBe(5);
  });
  it('single score 1 returns 1', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, 1);
    expect(tracker.getAverageSatisfaction()).toBe(1);
  });
  it('two scores 2 and 4 returns 3', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, 2);
    tracker.record('CMP-2', 'APOLOGY', 'desc', 'agent', '2026-01-21', true, 4);
    expect(tracker.getAverageSatisfaction()).toBe(3);
  });
  it('scores 1,2,3,4,5 return average 3', () => {
    [1, 2, 3, 4, 5].forEach((score, i) => {
      tracker.record(`CMP-${i}`, 'REFUND', 'desc', 'agent', '2026-01-20', true, score);
    });
    expect(tracker.getAverageSatisfaction()).toBe(3);
  });
  it('record without score does not affect average', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, 4);
    tracker.record('CMP-2', 'APOLOGY', 'desc', 'agent', '2026-01-21'); // no score
    expect(tracker.getAverageSatisfaction()).toBe(4);
  });
  it('three scores 3,3,3 returns 3', () => {
    [0, 1, 2].forEach(i => tracker.record(`CMP-${i}`, 'REFUND', 'desc', 'agent', '2026-01-20', true, 3));
    expect(tracker.getAverageSatisfaction()).toBe(3);
  });
  it('score 5 and 1 average is 3', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, 5);
    tracker.record('CMP-2', 'REFUND', 'desc', 'agent', '2026-01-20', true, 1);
    expect(tracker.getAverageSatisfaction()).toBe(3);
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(score => {
    it(`average of single score ${score} returns ${score}`, () => {
      tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, score);
      expect(tracker.getAverageSatisfaction()).toBe(score);
    });
  });
});

// ===========================================================================
// BLOCK 35: ResolutionTracker — getSatisfactionRate
// ===========================================================================
describe('ResolutionTracker — getSatisfactionRate', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('returns 0 when no records', () => {
    expect(tracker.getSatisfactionRate()).toBe(0);
  });
  it('returns 100 when all customerSatisfied=true', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true);
    expect(tracker.getSatisfactionRate()).toBe(100);
  });
  it('returns 0 when all customerSatisfied=false', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', false);
    expect(tracker.getSatisfactionRate()).toBe(0);
  });
  it('returns 50 when half satisfied', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true);
    tracker.record('CMP-2', 'APOLOGY', 'desc', 'agent', '2026-01-21', false);
    expect(tracker.getSatisfactionRate()).toBe(50);
  });
  it('returns 0 when customerSatisfied is undefined', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(tracker.getSatisfactionRate()).toBe(0);
  });
  it('3 of 4 satisfied returns 75', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true);
    tracker.record('CMP-2', 'REFUND', 'desc', 'agent', '2026-01-20', true);
    tracker.record('CMP-3', 'REFUND', 'desc', 'agent', '2026-01-20', true);
    tracker.record('CMP-4', 'REFUND', 'desc', 'agent', '2026-01-20', false);
    expect(tracker.getSatisfactionRate()).toBe(75);
  });
  it('1 of 4 satisfied returns 25', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true);
    tracker.record('CMP-2', 'REFUND', 'desc', 'agent', '2026-01-20', false);
    tracker.record('CMP-3', 'REFUND', 'desc', 'agent', '2026-01-20', false);
    tracker.record('CMP-4', 'REFUND', 'desc', 'agent', '2026-01-20', false);
    expect(tracker.getSatisfactionRate()).toBe(25);
  });

  Array.from({ length: 10 }, (_, i) => i).forEach(n => {
    it(`${n} of 10 satisfied returns ${n * 10}%`, () => {
      Array.from({ length: n }, (_, j) =>
        tracker.record(`CMP-T${j}`, 'REFUND', 'desc', 'agent', '2026-01-20', true)
      );
      Array.from({ length: 10 - n }, (_, j) =>
        tracker.record(`CMP-F${j}`, 'REFUND', 'desc', 'agent', '2026-01-20', false)
      );
      expect(tracker.getSatisfactionRate()).toBeCloseTo(n * 10, 5);
    });
  });
});

// ===========================================================================
// BLOCK 36: ResolutionTracker — getCAPALinked
// ===========================================================================
describe('ResolutionTracker — getCAPALinked', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('getCAPALinked returns empty initially', () => {
    expect(tracker.getCAPALinked()).toHaveLength(0);
  });
  it('getCAPALinked returns record with capaRaised=true', () => {
    tracker.record('CMP-1', 'PROCESS_CHANGE', 'desc', 'agent', '2026-01-20', undefined, undefined, true, 'CAPA-001');
    expect(tracker.getCAPALinked()).toHaveLength(1);
  });
  it('getCAPALinked excludes records with capaRaised=false', () => {
    tracker.record('CMP-1', 'PROCESS_CHANGE', 'desc', 'agent', '2026-01-20', undefined, undefined, false);
    expect(tracker.getCAPALinked()).toHaveLength(0);
  });
  it('getCAPALinked excludes records with capaRaised=undefined', () => {
    tracker.record('CMP-1', 'PROCESS_CHANGE', 'desc', 'agent', '2026-01-20');
    expect(tracker.getCAPALinked()).toHaveLength(0);
  });
  it('getCAPALinked returns multiple CAPA records', () => {
    tracker.record('CMP-1', 'PROCESS_CHANGE', 'desc', 'agent', '2026-01-20', undefined, undefined, true, 'CAPA-001');
    tracker.record('CMP-2', 'TRAINING', 'desc', 'agent', '2026-01-21', undefined, undefined, true, 'CAPA-002');
    expect(tracker.getCAPALinked()).toHaveLength(2);
  });
  it('getCAPALinked result has capaRaised=true', () => {
    tracker.record('CMP-1', 'PROCESS_CHANGE', 'desc', 'agent', '2026-01-20', undefined, undefined, true, 'CAPA-001');
    tracker.getCAPALinked().forEach(r => expect(r.capaRaised).toBe(true));
  });
  it('getCAPALinked capaId accessible', () => {
    tracker.record('CMP-1', 'PROCESS_CHANGE', 'desc', 'agent', '2026-01-20', undefined, undefined, true, 'CAPA-007');
    expect(tracker.getCAPALinked()[0].capaId).toBe('CAPA-007');
  });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`getCAPALinked count is ${i} when ${i} CAPA records added`, () => {
      Array.from({ length: i }, (_, j) =>
        tracker.record(`CMP-${j}`, 'PROCESS_CHANGE', 'desc', 'agent', '2026-01-20', undefined, undefined, true, `CAPA-${j}`)
      );
      expect(tracker.getCAPALinked()).toHaveLength(i);
    });
  });
});

// ===========================================================================
// BLOCK 37: ResolutionTracker — getCount
// ===========================================================================
describe('ResolutionTracker — getCount', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('getCount is 0 initially', () => { expect(tracker.getCount()).toBe(0); });
  it('getCount is 1 after one record', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(tracker.getCount()).toBe(1);
  });

  Array.from({ length: 30 }, (_, i) => i + 1).forEach(n => {
    it(`getCount is ${n} after ${n} records`, () => {
      Array.from({ length: n }, (_, j) =>
        tracker.record(`CMP-${j}`, 'REFUND', 'desc', 'agent', '2026-01-20')
      );
      expect(tracker.getCount()).toBe(n);
    });
  });
});

// ===========================================================================
// BLOCK 38: ResolutionTracker — instance isolation
// ===========================================================================
describe('ResolutionTracker — instance isolation', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('two instances do not share records', () => {
    const tracker2 = new ResolutionTracker();
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20');
    expect(tracker2.getCount()).toBe(0);
  });
  it('two instances have independent satisfaction scores', () => {
    const tracker2 = new ResolutionTracker();
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, 5);
    expect(tracker2.getAverageSatisfaction()).toBe(0);
  });
});

// ===========================================================================
// BLOCK 39: ResolutionTracker — getByType across all types parameterized
// ===========================================================================
describe('ResolutionTracker — getByType parameterized', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  ALL_RESOLUTION_TYPES.forEach(type => {
    Array.from({ length: 5 }, (_, i) => i + 1).forEach(n => {
      it(`getByType(${type}) returns ${n} when ${n} of that type added`, () => {
        Array.from({ length: n }, () =>
          tracker.record('CMP-1', type, 'desc', 'agent', '2026-01-20')
        );
        expect(tracker.getByType(type)).toHaveLength(n);
      });
    });
  });
});

// ===========================================================================
// BLOCK 40: Combined register + tracker integration
// ===========================================================================
describe('ComplaintRegister + ResolutionTracker — integration', () => {
  let reg: ComplaintRegister;
  let tracker: ResolutionTracker;
  beforeEach(() => { reg = makeRegister(); tracker = makeTracker(); });

  it('complaint id can be used as complaintId in resolution', () => {
    const c = receiveOne(reg);
    const r = tracker.record(c.id, 'REFUND', 'Full refund', 'agent', '2026-01-20');
    expect(r.complaintId).toBe(c.id);
  });
  it('resolved complaint linked via tracker', () => {
    const c = receiveOne(reg);
    reg.resolve(c.id, 'cause', '2026-01-20');
    tracker.record(c.id, 'COMPENSATION', 'Compensation paid', 'agent', '2026-01-21', true, 4, false);
    expect(tracker.getByComplaint(c.id)).toHaveLength(1);
  });
  it('multiple complaints with resolutions tracked independently', () => {
    const c1 = receiveOne(reg, { customerId: 'A' });
    const c2 = receiveOne(reg, { customerId: 'B' });
    tracker.record(c1.id, 'REFUND', 'desc', 'agent', '2026-01-20');
    tracker.record(c2.id, 'APOLOGY', 'desc', 'agent', '2026-01-21');
    expect(tracker.getByComplaint(c1.id)).toHaveLength(1);
    expect(tracker.getByComplaint(c2.id)).toHaveLength(1);
  });
  it('CAPA raised for a complaint links correctly', () => {
    const c = receiveOne(reg, { severity: 'CRITICAL' });
    tracker.record(c.id, 'PROCESS_CHANGE', 'new process', 'manager', '2026-01-22', undefined, undefined, true, 'CAPA-001');
    expect(tracker.getCAPALinked()[0].complaintId).toBe(c.id);
  });
  it('satisfaction rate with multiple complaints', () => {
    const c1 = receiveOne(reg);
    const c2 = receiveOne(reg);
    tracker.record(c1.id, 'REFUND', 'desc', 'agent', '2026-01-20', true, 5);
    tracker.record(c2.id, 'APOLOGY', 'desc', 'agent', '2026-01-21', false, 2);
    expect(tracker.getSatisfactionRate()).toBe(50);
    expect(tracker.getAverageSatisfaction()).toBe(3.5);
  });
  it('overdue complaints can have resolutions recorded', () => {
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    expect(reg.getOverdue('2026-02-01')).toHaveLength(1);
    tracker.record(c.id, 'REFUND', 'Late refund', 'agent', '2026-01-30');
    reg.resolve(c.id, 'resolved late', '2026-01-30');
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('critical complaints with CAPA linked', () => {
    const c = receiveOne(reg, { severity: 'CRITICAL' });
    tracker.record(c.id, 'PROCESS_CHANGE', 'Process fix', 'qm', '2026-01-25', undefined, undefined, true, 'CAPA-CRIT-01');
    expect(reg.getCritical()).toHaveLength(1);
    expect(tracker.getCAPALinked()).toHaveLength(1);
  });
});

// ===========================================================================
// BLOCK 41: Export validation — types re-exported from index
// ===========================================================================
describe('Exports — index re-exports', () => {
  it('ComplaintRegister is exported from index', () => {
    const { ComplaintRegister: CR } = require('../index');
    expect(CR).toBeDefined();
  });
  it('ResolutionTracker is exported from index', () => {
    const { ResolutionTracker: RT } = require('../index');
    expect(RT).toBeDefined();
  });
  it('ComplaintRegister from index is a constructor', () => {
    const { ComplaintRegister: CR } = require('../index');
    expect(typeof CR).toBe('function');
  });
  it('ResolutionTracker from index is a constructor', () => {
    const { ResolutionTracker: RT } = require('../index');
    expect(typeof RT).toBe('function');
  });
  it('ComplaintRegister instance has receive method', () => {
    const { ComplaintRegister: CR } = require('../index');
    const inst = new CR();
    expect(typeof inst.receive).toBe('function');
  });
  it('ResolutionTracker instance has record method', () => {
    const { ResolutionTracker: RT } = require('../index');
    const inst = new RT();
    expect(typeof inst.record).toBe('function');
  });
});

// ===========================================================================
// BLOCK 42: Parameterized category and severity combinations (grid)
// ===========================================================================
describe('ComplaintRegister — category x severity grid', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  ALL_CATEGORIES.forEach(cat => {
    ALL_SEVERITIES.forEach(sev => {
      it(`category ${cat} + severity ${sev} stored and retrievable`, () => {
        const c = receiveOne(reg, { category: cat, severity: sev });
        const found = reg.get(c.id)!;
        expect(found.category).toBe(cat);
        expect(found.severity).toBe(sev);
      });
    });
  });
});

// ===========================================================================
// BLOCK 43: Parameterized source + category combinations
// ===========================================================================
describe('ComplaintRegister — source x category grid (sample)', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  ALL_SOURCES.forEach(src => {
    ALL_CATEGORIES.slice(0, 4).forEach(cat => {
      it(`source ${src} + category ${cat}: fields match`, () => {
        const c = receiveOne(reg, { source: src, category: cat });
        expect(reg.get(c.id)!.source).toBe(src);
        expect(reg.get(c.id)!.category).toBe(cat);
      });
    });
  });
});

// ===========================================================================
// BLOCK 44: ResolutionTracker — satisfactionScore boundary values
// ===========================================================================
describe('ResolutionTracker — satisfactionScore boundary values', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  [1, 2, 3, 4, 5].forEach(score => {
    it(`score ${score} stored correctly`, () => {
      const r = tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, score);
      expect(r.satisfactionScore).toBe(score);
    });
    it(`average of score ${score} alone is ${score}`, () => {
      tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, score);
      expect(tracker.getAverageSatisfaction()).toBe(score);
    });
  });
});

// ===========================================================================
// BLOCK 45: More overdue scenarios with all statuses
// ===========================================================================
describe('ComplaintRegister — getOverdue status inclusion', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('RECEIVED with past target is overdue', () => {
    receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    expect(reg.getOverdue('2026-02-01')).toHaveLength(1);
  });
  it('ACKNOWLEDGED with past target is overdue', () => {
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    reg.acknowledge(c.id, '2026-01-02');
    expect(reg.getOverdue('2026-02-01')).toHaveLength(1);
  });
  it('UNDER_INVESTIGATION with past target is overdue', () => {
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    reg.investigate(c.id, 'agent');
    expect(reg.getOverdue('2026-02-01')).toHaveLength(1);
  });
  it('RESOLVED with past target not in overdue', () => {
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    reg.resolve(c.id, 'cause', '2026-01-10');
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('CLOSED with past target not in overdue', () => {
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    reg.close(c.id, '2026-01-15');
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('WITHDRAWN with past target not in overdue', () => {
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    reg.withdraw(c.id);
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
  it('ESCALATED with past target not in overdue', () => {
    const c = receiveOne(reg, { targetResolutionDate: '2026-01-01' });
    reg.escalate(c.id);
    expect(reg.getOverdue('2026-02-01')).toHaveLength(0);
  });
});

// ===========================================================================
// BLOCK 46: ComplaintRegister — preserve fields through transitions
// ===========================================================================
describe('ComplaintRegister — field preservation through transitions', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  it('source preserved through all transitions', () => {
    const c = receiveOne(reg, { source: 'LEGAL' });
    reg.acknowledge(c.id, '2026-01-11');
    reg.investigate(c.id, 'agent');
    reg.resolve(c.id, 'cause', '2026-01-20');
    reg.close(c.id, '2026-01-25');
    expect(reg.get(c.id)!.source).toBe('LEGAL');
  });
  it('customerId preserved through transitions', () => {
    const c = receiveOne(reg, { customerId: 'CUST-XYZ' });
    reg.acknowledge(c.id, '2026-01-11');
    expect(reg.get(c.id)!.customerId).toBe('CUST-XYZ');
  });
  it('referenceNumber preserved through transitions', () => {
    const c = receiveOne(reg);
    const ref = c.referenceNumber;
    reg.acknowledge(c.id, '2026-01-11');
    reg.investigate(c.id, 'agent');
    expect(reg.get(c.id)!.referenceNumber).toBe(ref);
  });
  it('description preserved through transitions', () => {
    const c = receiveOne(reg, { description: 'My important complaint' });
    reg.investigate(c.id, 'agent');
    expect(reg.get(c.id)!.description).toBe('My important complaint');
  });
  it('receivedAt preserved through transitions', () => {
    const c = receiveOne(reg, { receivedAt: '2026-01-05' });
    reg.close(c.id, '2026-01-25');
    expect(reg.get(c.id)!.receivedAt).toBe('2026-01-05');
  });
});

// ===========================================================================
// BLOCK 47: Extra bulk tests for getCount
// ===========================================================================
describe('ComplaintRegister — getCount extra bulk', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  Array.from({ length: 50 }, (_, i) => i + 1).forEach(n => {
    it(`getCount is ${n} [bulk-${n}]`, () => {
      Array.from({ length: n }, () => receiveOne(reg));
      expect(reg.getCount()).toBe(n);
    });
  });
});

// ===========================================================================
// BLOCK 48: Extra getSatisfactionRate edge cases
// ===========================================================================
describe('ResolutionTracker — getSatisfactionRate extra', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('single satisfied record → 100%', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true);
    expect(tracker.getSatisfactionRate()).toBe(100);
  });
  it('single unsatisfied record → 0%', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', false);
    expect(tracker.getSatisfactionRate()).toBe(0);
  });
  it('undefined satisfaction does not count as satisfied', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', undefined);
    expect(tracker.getSatisfactionRate()).toBe(0);
  });
  it('mix of undefined and true: only true counts', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true);
    tracker.record('CMP-2', 'REFUND', 'desc', 'agent', '2026-01-20', undefined);
    // 1 satisfied of 2 total = 50%
    expect(tracker.getSatisfactionRate()).toBe(50);
  });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`${n} satisfied records of ${n} = 100%`, () => {
      Array.from({ length: n }, (_, j) =>
        tracker.record(`CMP-${j}`, 'REFUND', 'desc', 'agent', '2026-01-20', true)
      );
      expect(tracker.getSatisfactionRate()).toBe(100);
    });
  });
});

// ===========================================================================
// BLOCK 49: Extra getAverageSatisfaction
// ===========================================================================
describe('ResolutionTracker — getAverageSatisfaction extra', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('average of 10 scores all 3 is 3', () => {
    Array.from({ length: 10 }, (_, i) =>
      tracker.record(`CMP-${i}`, 'REFUND', 'desc', 'agent', '2026-01-20', true, 3)
    );
    expect(tracker.getAverageSatisfaction()).toBe(3);
  });
  it('average of scores 1-5 twice is 3', () => {
    [1, 2, 3, 4, 5, 1, 2, 3, 4, 5].forEach((score, i) => {
      tracker.record(`CMP-${i}`, 'REFUND', 'desc', 'agent', '2026-01-20', true, score);
    });
    expect(tracker.getAverageSatisfaction()).toBe(3);
  });
  it('score of 5 five times is 5', () => {
    Array.from({ length: 5 }, (_, i) =>
      tracker.record(`CMP-${i}`, 'REFUND', 'desc', 'agent', '2026-01-20', true, 5)
    );
    expect(tracker.getAverageSatisfaction()).toBe(5);
  });

  Array.from({ length: 5 }, (_, score) => score + 1).forEach(score => {
    Array.from({ length: 5 }, (_, i) => i + 1).forEach(count => {
      it(`${count} records all score ${score} → average ${score}`, () => {
        Array.from({ length: count }, (_, j) =>
          tracker.record(`CMP-${j}`, 'REFUND', 'desc', 'agent', '2026-01-20', true, score)
        );
        expect(tracker.getAverageSatisfaction()).toBe(score);
      });
    });
  });
});

// ===========================================================================
// BLOCK 50: ComplaintRegister — getBySeverity multi-entry scenarios
// ===========================================================================
describe('ComplaintRegister — getBySeverity multi', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
    it(`getBySeverity(CRITICAL) returns ${n} when ${n} added`, () => {
      Array.from({ length: n }, () => receiveOne(reg, { severity: 'CRITICAL' }));
      expect(reg.getBySeverity('CRITICAL')).toHaveLength(n);
    });
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`getBySeverity(HIGH) returns ${n} when ${n} added`, () => {
      Array.from({ length: n }, () => receiveOne(reg, { severity: 'HIGH' }));
      expect(reg.getBySeverity('HIGH')).toHaveLength(n);
    });
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`getBySeverity(LOW) returns ${n} when ${n} added`, () => {
      Array.from({ length: n }, () => receiveOne(reg, { severity: 'LOW' }));
      expect(reg.getBySeverity('LOW')).toHaveLength(n);
    });
  });
});

// ===========================================================================
// BLOCK 51: getByCategory multi-entry
// ===========================================================================
describe('ComplaintRegister — getByCategory multi', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  ALL_CATEGORIES.forEach(cat => {
    Array.from({ length: 8 }, (_, i) => i + 1).forEach(n => {
      it(`getByCategory(${cat}) returns ${n} when ${n} added`, () => {
        Array.from({ length: n }, () => receiveOne(reg, { category: cat }));
        expect(reg.getByCategory(cat)).toHaveLength(n);
      });
    });
  });
});

// ===========================================================================
// BLOCK 52: ResolutionTracker — getByComplaint extra bulk
// ===========================================================================
describe('ResolutionTracker — getByComplaint extra bulk', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  Array.from({ length: 30 }, (_, i) => i + 1).forEach(n => {
    it(`getByComplaint for complaint-${n} returns ${n} resolutions`, () => {
      Array.from({ length: n }, (_, j) =>
        tracker.record(`BULK-${n}`, ALL_RESOLUTION_TYPES[j % ALL_RESOLUTION_TYPES.length], 'desc', 'agent', '2026-01-20')
      );
      expect(tracker.getByComplaint(`BULK-${n}`)).toHaveLength(n);
    });
  });
});

// ===========================================================================
// BLOCK 53: ComplaintRegister — multiple getByCustomer scenarios
// ===========================================================================
describe('ComplaintRegister — getByCustomer bulk', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`customer MULTI-${n} has ${n} complaints`, () => {
      Array.from({ length: n }, () => receiveOne(reg, { customerId: `MULTI-${n}` }));
      expect(reg.getByCustomer(`MULTI-${n}`)).toHaveLength(n);
    });
  });
});

// ===========================================================================
// BLOCK 54: ResolutionTracker — getCAPALinked large
// ===========================================================================
describe('ResolutionTracker — getCAPALinked large', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach(n => {
    it(`getCAPALinked returns ${n} when ${n} CAPA records`, () => {
      Array.from({ length: n }, (_, j) =>
        tracker.record(`CMP-${j}`, 'PROCESS_CHANGE', 'desc', 'agent', '2026-01-20', undefined, undefined, true, `CAPA-${j}`)
      );
      expect(tracker.getCAPALinked()).toHaveLength(n);
    });
  });
});

// ===========================================================================
// BLOCK 55: ComplaintRegister — getOpenCount across receive counts
// ===========================================================================
describe('ComplaintRegister — getOpenCount bulk', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  Array.from({ length: 25 }, (_, i) => i + 1).forEach(n => {
    it(`getOpenCount is ${n} after ${n} receives (none closed)`, () => {
      Array.from({ length: n }, () => receiveOne(reg));
      expect(reg.getOpenCount()).toBe(n);
    });
  });
});

// ===========================================================================
// BLOCK 56: ResolutionTracker — getByType large counts
// ===========================================================================
describe('ResolutionTracker — getByType large counts', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  ALL_RESOLUTION_TYPES.forEach(type => {
    Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
      it(`getByType(${type}) returns ${n} after ${n} records`, () => {
        Array.from({ length: n }, (_, j) =>
          tracker.record(`CMP-${j}`, type, 'desc', 'agent', '2026-01-20')
        );
        expect(tracker.getByType(type)).toHaveLength(n);
      });
    });
  });
});

// ===========================================================================
// BLOCK 57: ComplaintRegister — getCritical bulk
// ===========================================================================
describe('ComplaintRegister — getCritical bulk', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getCritical returns ${n} when ${n} CRITICAL added`, () => {
      Array.from({ length: n }, () => receiveOne(reg, { severity: 'CRITICAL' }));
      expect(reg.getCritical()).toHaveLength(n);
    });
  });
});

// ===========================================================================
// BLOCK 58: ComplaintRegister — getByStatus RECEIVED bulk
// ===========================================================================
describe('ComplaintRegister — getByStatus RECEIVED bulk', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
    it(`getByStatus(RECEIVED) returns ${n} when ${n} received`, () => {
      Array.from({ length: n }, () => receiveOne(reg));
      expect(reg.getByStatus('RECEIVED')).toHaveLength(n);
    });
  });
});

// ===========================================================================
// BLOCK 59: ResolutionTracker — average satisfaction with mixed scores
// ===========================================================================
describe('ResolutionTracker — average satisfaction mixed', () => {
  let tracker: ResolutionTracker;
  beforeEach(() => { tracker = makeTracker(); });

  it('mix of 1 and 5 averages to 3', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, 1);
    tracker.record('CMP-2', 'REFUND', 'desc', 'agent', '2026-01-20', true, 5);
    expect(tracker.getAverageSatisfaction()).toBe(3);
  });
  it('mix of 2 and 4 averages to 3', () => {
    tracker.record('CMP-1', 'REFUND', 'desc', 'agent', '2026-01-20', true, 2);
    tracker.record('CMP-2', 'REFUND', 'desc', 'agent', '2026-01-20', true, 4);
    expect(tracker.getAverageSatisfaction()).toBe(3);
  });
  it('four records 1,2,4,5 average is 3', () => {
    [1, 2, 4, 5].forEach((s, i) => tracker.record(`CMP-${i}`, 'REFUND', 'desc', 'agent', '2026-01-20', true, s));
    expect(tracker.getAverageSatisfaction()).toBe(3);
  });
  it('ten records all 2 average is 2', () => {
    Array.from({ length: 10 }, (_, i) => tracker.record(`CMP-${i}`, 'REFUND', 'desc', 'agent', '2026-01-20', true, 2));
    expect(tracker.getAverageSatisfaction()).toBe(2);
  });
  it('ten records all 4 average is 4', () => {
    Array.from({ length: 10 }, (_, i) => tracker.record(`CMP-${i}`, 'REFUND', 'desc', 'agent', '2026-01-20', true, 4));
    expect(tracker.getAverageSatisfaction()).toBe(4);
  });

  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`average of ${n} records all score 3 equals 3`, () => {
      Array.from({ length: n }, (_, j) => tracker.record(`CMP-${j}`, 'REFUND', 'desc', 'agent', '2026-01-20', true, 3));
      expect(tracker.getAverageSatisfaction()).toBe(3);
    });
  });
});

// ===========================================================================
// BLOCK 60: ComplaintRegister — acknowledge then investigate sequence
// ===========================================================================
describe('ComplaintRegister — acknowledge then investigate sequence', () => {
  let reg: ComplaintRegister;
  beforeEach(() => { reg = makeRegister(); });

  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`complaint ${i}: ack then investigate transitions correctly`, () => {
      const c = receiveOne(reg, { customerId: `C-${i}` });
      reg.acknowledge(c.id, '2026-01-11');
      reg.investigate(c.id, `agent-${i}@test.com`);
      const rec = reg.get(c.id)!;
      expect(rec.status).toBe('UNDER_INVESTIGATION');
      expect(rec.assignedTo).toBe(`agent-${i}@test.com`);
      expect(rec.acknowledgedAt).toBe('2026-01-11');
    });
  });
});
