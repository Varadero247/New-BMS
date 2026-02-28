// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { PermitManager } from '../permit-manager';
import { IsolationTracker } from '../isolation-tracker';
import {
  PermitType,
  PermitStatus,
  RiskLevel,
  IsolationType,
  IsolationStatus,
  PermitRecord,
  IsolationRecord,
} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const ALL_PERMIT_TYPES: PermitType[] = [
  'HOT_WORK',
  'CONFINED_SPACE',
  'ELECTRICAL',
  'EXCAVATION',
  'WORKING_AT_HEIGHT',
  'RADIATION',
  'CHEMICAL',
];

const ALL_PERMIT_STATUSES: PermitStatus[] = [
  'DRAFT',
  'PENDING_APPROVAL',
  'APPROVED',
  'ACTIVE',
  'SUSPENDED',
  'COMPLETED',
  'CANCELLED',
];

const ALL_RISK_LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

const ALL_ISOLATION_TYPES: IsolationType[] = [
  'LOCKOUT',
  'TAGOUT',
  'LOCKOUT_TAGOUT',
  'VALVE_LOCK',
  'ELECTRICAL_ISOLATION',
];

const ALL_ISOLATION_STATUSES: IsolationStatus[] = ['APPLIED', 'VERIFIED', 'REMOVED', 'FAILED'];

function makePermit(
  pm: PermitManager,
  overrides: Partial<{
    type: PermitType;
    title: string;
    location: string;
    workDescription: string;
    riskLevel: RiskLevel;
    requestedBy: string;
    requestedAt: string;
    supervisor: string;
    hazards: string[];
    precautions: string[];
    workers: string[];
    notes: string;
  }> = {},
): PermitRecord {
  return pm.draft(
    overrides.type ?? 'HOT_WORK',
    overrides.title ?? 'Test Permit',
    overrides.location ?? 'Zone A',
    overrides.workDescription ?? 'Welding operations',
    overrides.riskLevel ?? 'HIGH',
    overrides.requestedBy ?? 'user1',
    overrides.requestedAt ?? '2026-01-01T08:00:00Z',
    overrides.supervisor ?? 'supervisor1',
    overrides.hazards ?? ['Fire', 'Burns'],
    overrides.precautions ?? ['Fire extinguisher', 'PPE'],
    overrides.workers ?? ['worker1', 'worker2'],
    overrides.notes,
  );
}

/** Draft → PENDING_APPROVAL → APPROVED → ACTIVE */
function makeActivePermit(pm: PermitManager, overrides = {}): PermitRecord {
  const p = makePermit(pm, overrides);
  pm.submitForApproval(p.id);
  pm.approve(p.id, 'approver1', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
  pm.activate(p.id);
  return pm.get(p.id)!;
}

function makeApprovedPermit(pm: PermitManager, overrides = {}): PermitRecord {
  const p = makePermit(pm, overrides);
  pm.submitForApproval(p.id);
  pm.approve(p.id, 'approver1', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
  return pm.get(p.id)!;
}

function makeIso(
  tracker: IsolationTracker,
  permitId: string,
  overrides: Partial<{
    type: IsolationType;
    isolationPoint: string;
    appliedBy: string;
    appliedAt: string;
    notes: string;
  }> = {},
): IsolationRecord {
  return tracker.apply(
    permitId,
    overrides.type ?? 'LOCKOUT',
    overrides.isolationPoint ?? 'Panel A',
    overrides.appliedBy ?? 'tech1',
    overrides.appliedAt ?? '2026-01-01T10:00:00Z',
    overrides.notes,
  );
}

// ===========================================================================
// PermitManager tests
// ===========================================================================
describe('PermitManager', () => {
  let pm: PermitManager;

  beforeEach(() => {
    pm = new PermitManager();
  });

  // -------------------------------------------------------------------------
  // Construction & initial state
  // -------------------------------------------------------------------------
  describe('initial state', () => {
    it('starts with zero permits', () => {
      expect(pm.getCount()).toBe(0);
    });

    it('getAll returns empty array initially', () => {
      expect(pm.getAll()).toEqual([]);
    });

    it('get returns undefined for unknown id', () => {
      expect(pm.get('unknown')).toBeUndefined();
    });

    it('getActive returns empty array initially', () => {
      expect(pm.getActive()).toEqual([]);
    });

    it('getByType returns empty array initially', () => {
      ALL_PERMIT_TYPES.forEach((t) => {
        expect(pm.getByType(t)).toEqual([]);
      });
    });

    it('getByStatus returns empty array initially', () => {
      ALL_PERMIT_STATUSES.forEach((s) => {
        expect(pm.getByStatus(s)).toEqual([]);
      });
    });

    it('getByRiskLevel returns empty array initially', () => {
      ALL_RISK_LEVELS.forEach((l) => {
        expect(pm.getByRiskLevel(l)).toEqual([]);
      });
    });

    it('getExpired returns empty array initially', () => {
      expect(pm.getExpired('2026-12-31T00:00:00Z')).toEqual([]);
    });

    it('getByRequestor returns empty array initially', () => {
      expect(pm.getByRequestor('nobody')).toEqual([]);
    });

    it('getBySupervisor returns empty array initially', () => {
      expect(pm.getBySupervisor('nobody')).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // draft()
  // -------------------------------------------------------------------------
  describe('draft()', () => {
    it('returns a PermitRecord with DRAFT status', () => {
      const p = makePermit(pm);
      expect(p.status).toBe('DRAFT');
    });

    it('assigns a unique id', () => {
      const p1 = makePermit(pm);
      const p2 = makePermit(pm);
      expect(p1.id).not.toBe(p2.id);
    });

    it('stores the correct type', () => {
      const p = makePermit(pm, { type: 'CONFINED_SPACE' });
      expect(p.type).toBe('CONFINED_SPACE');
    });

    it('stores the correct title', () => {
      const p = makePermit(pm, { title: 'Hot Work Permit 001' });
      expect(p.title).toBe('Hot Work Permit 001');
    });

    it('stores the correct location', () => {
      const p = makePermit(pm, { location: 'Building 3 Roof' });
      expect(p.location).toBe('Building 3 Roof');
    });

    it('stores the correct workDescription', () => {
      const p = makePermit(pm, { workDescription: 'Electrical panel replacement' });
      expect(p.workDescription).toBe('Electrical panel replacement');
    });

    it('stores the correct riskLevel', () => {
      const p = makePermit(pm, { riskLevel: 'CRITICAL' });
      expect(p.riskLevel).toBe('CRITICAL');
    });

    it('stores requestedBy', () => {
      const p = makePermit(pm, { requestedBy: 'john.doe' });
      expect(p.requestedBy).toBe('john.doe');
    });

    it('stores requestedAt', () => {
      const p = makePermit(pm, { requestedAt: '2026-03-01T07:30:00Z' });
      expect(p.requestedAt).toBe('2026-03-01T07:30:00Z');
    });

    it('stores supervisor', () => {
      const p = makePermit(pm, { supervisor: 'jane.smith' });
      expect(p.supervisor).toBe('jane.smith');
    });

    it('stores hazards array', () => {
      const p = makePermit(pm, { hazards: ['Sparks', 'Heat'] });
      expect(p.hazards).toEqual(['Sparks', 'Heat']);
    });

    it('stores precautions array', () => {
      const p = makePermit(pm, { precautions: ['Fire watch', 'Hot work blanket'] });
      expect(p.precautions).toEqual(['Fire watch', 'Hot work blanket']);
    });

    it('stores workers array', () => {
      const p = makePermit(pm, { workers: ['w1', 'w2', 'w3'] });
      expect(p.workers).toEqual(['w1', 'w2', 'w3']);
    });

    it('stores optional notes when provided', () => {
      const p = makePermit(pm, { notes: 'Special precautions needed' });
      expect(p.notes).toBe('Special precautions needed');
    });

    it('notes is undefined when not provided', () => {
      const p = makePermit(pm);
      expect(p.notes).toBeUndefined();
    });

    it('approvedBy is undefined initially', () => {
      const p = makePermit(pm);
      expect(p.approvedBy).toBeUndefined();
    });

    it('approvedAt is undefined initially', () => {
      const p = makePermit(pm);
      expect(p.approvedAt).toBeUndefined();
    });

    it('validFrom is undefined initially', () => {
      const p = makePermit(pm);
      expect(p.validFrom).toBeUndefined();
    });

    it('validUntil is undefined initially', () => {
      const p = makePermit(pm);
      expect(p.validUntil).toBeUndefined();
    });

    it('completedAt is undefined initially', () => {
      const p = makePermit(pm);
      expect(p.completedAt).toBeUndefined();
    });

    it('cancelledAt is undefined initially', () => {
      const p = makePermit(pm);
      expect(p.cancelledAt).toBeUndefined();
    });

    it('increments count after each draft', () => {
      makePermit(pm);
      expect(pm.getCount()).toBe(1);
      makePermit(pm);
      expect(pm.getCount()).toBe(2);
    });

    it('hazards array is a copy (mutation safe)', () => {
      const hazards = ['H1', 'H2'];
      const p = makePermit(pm, { hazards });
      hazards.push('H3');
      expect(p.hazards).toHaveLength(2);
    });

    it('workers array is a copy (mutation safe)', () => {
      const workers = ['w1'];
      const p = makePermit(pm, { workers });
      workers.push('w2');
      expect(p.workers).toHaveLength(1);
    });

    // All permit types
    ALL_PERMIT_TYPES.forEach((type) => {
      it(`creates a DRAFT permit for type ${type}`, () => {
        const p = makePermit(pm, { type });
        expect(p.type).toBe(type);
        expect(p.status).toBe('DRAFT');
      });
    });

    // All risk levels
    ALL_RISK_LEVELS.forEach((level) => {
      it(`creates a DRAFT permit for riskLevel ${level}`, () => {
        const p = makePermit(pm, { riskLevel: level });
        expect(p.riskLevel).toBe(level);
        expect(p.status).toBe('DRAFT');
      });
    });

    // Bulk: 50 unique permits
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`bulk draft permit #${i} has unique id`, () => {
        const p = makePermit(pm, { title: `Permit ${i}` });
        expect(p.id).toBeTruthy();
        expect(typeof p.id).toBe('string');
      });
    });
  });

  // -------------------------------------------------------------------------
  // submitForApproval()
  // -------------------------------------------------------------------------
  describe('submitForApproval()', () => {
    it('transitions DRAFT → PENDING_APPROVAL', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      expect(pm.get(p.id)!.status).toBe('PENDING_APPROVAL');
    });

    it('returns the updated record', () => {
      const p = makePermit(pm);
      const result = pm.submitForApproval(p.id);
      expect(result.status).toBe('PENDING_APPROVAL');
    });

    it('throws for unknown id', () => {
      expect(() => pm.submitForApproval('no-such-id')).toThrow();
    });

    it('throws if permit is already PENDING_APPROVAL', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      expect(() => pm.submitForApproval(p.id)).toThrow();
    });

    it('throws if permit is APPROVED', () => {
      const p = makeApprovedPermit(pm);
      expect(() => pm.submitForApproval(p.id)).toThrow();
    });

    it('throws if permit is ACTIVE', () => {
      const p = makeActivePermit(pm);
      expect(() => pm.submitForApproval(p.id)).toThrow();
    });

    it('throws if permit is COMPLETED', () => {
      const p = makeActivePermit(pm);
      pm.complete(p.id, '2026-01-01T17:00:00Z');
      expect(() => pm.submitForApproval(p.id)).toThrow();
    });

    it('throws if permit is CANCELLED', () => {
      const p = makePermit(pm);
      pm.cancel(p.id, '2026-01-01T09:00:00Z');
      expect(() => pm.submitForApproval(p.id)).toThrow();
    });

    it('does not change other fields', () => {
      const p = makePermit(pm, { title: 'My Permit', location: 'Site B' });
      pm.submitForApproval(p.id);
      const updated = pm.get(p.id)!;
      expect(updated.title).toBe('My Permit');
      expect(updated.location).toBe('Site B');
    });

    // Parameterized: 20 permits submitted
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`submit permit ${i} transitions to PENDING_APPROVAL`, () => {
        const p = makePermit(pm);
        const result = pm.submitForApproval(p.id);
        expect(result.status).toBe('PENDING_APPROVAL');
      });
    });
  });

  // -------------------------------------------------------------------------
  // approve()
  // -------------------------------------------------------------------------
  describe('approve()', () => {
    it('transitions PENDING_APPROVAL → APPROVED', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      pm.approve(p.id, 'mgr1', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
      expect(pm.get(p.id)!.status).toBe('APPROVED');
    });

    it('stores approvedBy', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      pm.approve(p.id, 'mgr2', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
      expect(pm.get(p.id)!.approvedBy).toBe('mgr2');
    });

    it('stores approvedAt', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      pm.approve(p.id, 'mgr1', '2026-02-15T14:00:00Z', '2026-02-15T15:00:00Z', '2026-02-15T22:00:00Z');
      expect(pm.get(p.id)!.approvedAt).toBe('2026-02-15T14:00:00Z');
    });

    it('stores validFrom', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      pm.approve(p.id, 'mgr1', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
      expect(pm.get(p.id)!.validFrom).toBe('2026-01-01T10:00:00Z');
    });

    it('stores validUntil', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      pm.approve(p.id, 'mgr1', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
      expect(pm.get(p.id)!.validUntil).toBe('2026-01-01T18:00:00Z');
    });

    it('returns updated record', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      const result = pm.approve(p.id, 'mgr1', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
      expect(result.status).toBe('APPROVED');
    });

    it('throws for unknown id', () => {
      expect(() =>
        pm.approve('no-such-id', 'mgr1', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z'),
      ).toThrow();
    });

    it('throws if permit is DRAFT', () => {
      const p = makePermit(pm);
      expect(() =>
        pm.approve(p.id, 'mgr1', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z'),
      ).toThrow();
    });

    it('throws if permit is already APPROVED', () => {
      const p = makeApprovedPermit(pm);
      expect(() =>
        pm.approve(p.id, 'mgr1', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z'),
      ).toThrow();
    });

    it('throws if permit is ACTIVE', () => {
      const p = makeActivePermit(pm);
      expect(() =>
        pm.approve(p.id, 'mgr1', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z'),
      ).toThrow();
    });

    // Parameterized: 20 approvals
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`approve permit ${i} sets status APPROVED`, () => {
        const p = makePermit(pm);
        pm.submitForApproval(p.id);
        const result = pm.approve(
          p.id,
          `approver${i}`,
          '2026-01-01T09:00:00Z',
          '2026-01-01T10:00:00Z',
          '2026-01-01T18:00:00Z',
        );
        expect(result.status).toBe('APPROVED');
        expect(result.approvedBy).toBe(`approver${i}`);
      });
    });
  });

  // -------------------------------------------------------------------------
  // activate()
  // -------------------------------------------------------------------------
  describe('activate()', () => {
    it('transitions APPROVED → ACTIVE', () => {
      const p = makeApprovedPermit(pm);
      pm.activate(p.id);
      expect(pm.get(p.id)!.status).toBe('ACTIVE');
    });

    it('returns updated record', () => {
      const p = makeApprovedPermit(pm);
      const result = pm.activate(p.id);
      expect(result.status).toBe('ACTIVE');
    });

    it('throws for unknown id', () => {
      expect(() => pm.activate('no-such-id')).toThrow();
    });

    it('throws if permit is DRAFT', () => {
      const p = makePermit(pm);
      expect(() => pm.activate(p.id)).toThrow();
    });

    it('throws if permit is PENDING_APPROVAL', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      expect(() => pm.activate(p.id)).toThrow();
    });

    it('throws if permit is already ACTIVE', () => {
      const p = makeActivePermit(pm);
      expect(() => pm.activate(p.id)).toThrow();
    });

    it('throws if permit is SUSPENDED', () => {
      const p = makeActivePermit(pm);
      pm.suspend(p.id);
      expect(() => pm.activate(p.id)).toThrow();
    });

    it('throws if permit is COMPLETED', () => {
      const p = makeActivePermit(pm);
      pm.complete(p.id, '2026-01-01T17:00:00Z');
      expect(() => pm.activate(p.id)).toThrow();
    });

    it('throws if permit is CANCELLED', () => {
      const p = makeApprovedPermit(pm);
      pm.cancel(p.id, '2026-01-01T09:30:00Z');
      expect(() => pm.activate(p.id)).toThrow();
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`activate permit ${i} sets status to ACTIVE`, () => {
        const p = makeApprovedPermit(pm);
        const result = pm.activate(p.id);
        expect(result.status).toBe('ACTIVE');
      });
    });
  });

  // -------------------------------------------------------------------------
  // suspend()
  // -------------------------------------------------------------------------
  describe('suspend()', () => {
    it('transitions ACTIVE → SUSPENDED', () => {
      const p = makeActivePermit(pm);
      pm.suspend(p.id);
      expect(pm.get(p.id)!.status).toBe('SUSPENDED');
    });

    it('returns updated record', () => {
      const p = makeActivePermit(pm);
      const result = pm.suspend(p.id);
      expect(result.status).toBe('SUSPENDED');
    });

    it('throws for unknown id', () => {
      expect(() => pm.suspend('no-such-id')).toThrow();
    });

    it('throws if permit is DRAFT', () => {
      const p = makePermit(pm);
      expect(() => pm.suspend(p.id)).toThrow();
    });

    it('throws if permit is PENDING_APPROVAL', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      expect(() => pm.suspend(p.id)).toThrow();
    });

    it('throws if permit is APPROVED', () => {
      const p = makeApprovedPermit(pm);
      expect(() => pm.suspend(p.id)).toThrow();
    });

    it('throws if permit is SUSPENDED', () => {
      const p = makeActivePermit(pm);
      pm.suspend(p.id);
      expect(() => pm.suspend(p.id)).toThrow();
    });

    it('throws if permit is COMPLETED', () => {
      const p = makeActivePermit(pm);
      pm.complete(p.id, '2026-01-01T17:00:00Z');
      expect(() => pm.suspend(p.id)).toThrow();
    });

    it('throws if permit is CANCELLED', () => {
      const p = makeActivePermit(pm);
      pm.cancel(p.id, '2026-01-01T17:00:00Z');
      expect(() => pm.suspend(p.id)).toThrow();
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`suspend permit ${i} sets status to SUSPENDED`, () => {
        const p = makeActivePermit(pm);
        const result = pm.suspend(p.id);
        expect(result.status).toBe('SUSPENDED');
      });
    });
  });

  // -------------------------------------------------------------------------
  // complete()
  // -------------------------------------------------------------------------
  describe('complete()', () => {
    it('transitions ACTIVE → COMPLETED', () => {
      const p = makeActivePermit(pm);
      pm.complete(p.id, '2026-01-01T17:00:00Z');
      expect(pm.get(p.id)!.status).toBe('COMPLETED');
    });

    it('stores completedAt', () => {
      const p = makeActivePermit(pm);
      pm.complete(p.id, '2026-01-01T17:30:00Z');
      expect(pm.get(p.id)!.completedAt).toBe('2026-01-01T17:30:00Z');
    });

    it('returns updated record', () => {
      const p = makeActivePermit(pm);
      const result = pm.complete(p.id, '2026-01-01T17:00:00Z');
      expect(result.status).toBe('COMPLETED');
    });

    it('throws for unknown id', () => {
      expect(() => pm.complete('no-such-id', '2026-01-01T17:00:00Z')).toThrow();
    });

    it('throws if permit is DRAFT', () => {
      const p = makePermit(pm);
      expect(() => pm.complete(p.id, '2026-01-01T17:00:00Z')).toThrow();
    });

    it('throws if permit is PENDING_APPROVAL', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      expect(() => pm.complete(p.id, '2026-01-01T17:00:00Z')).toThrow();
    });

    it('throws if permit is APPROVED', () => {
      const p = makeApprovedPermit(pm);
      expect(() => pm.complete(p.id, '2026-01-01T17:00:00Z')).toThrow();
    });

    it('throws if permit is SUSPENDED', () => {
      const p = makeActivePermit(pm);
      pm.suspend(p.id);
      expect(() => pm.complete(p.id, '2026-01-01T17:00:00Z')).toThrow();
    });

    it('throws if permit is already COMPLETED', () => {
      const p = makeActivePermit(pm);
      pm.complete(p.id, '2026-01-01T17:00:00Z');
      expect(() => pm.complete(p.id, '2026-01-01T17:05:00Z')).toThrow();
    });

    it('throws if permit is CANCELLED', () => {
      const p = makeActivePermit(pm);
      pm.cancel(p.id, '2026-01-01T17:00:00Z');
      expect(() => pm.complete(p.id, '2026-01-01T17:05:00Z')).toThrow();
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`complete permit ${i} sets status to COMPLETED`, () => {
        const p = makeActivePermit(pm);
        const result = pm.complete(p.id, `2026-01-01T1${(i % 8) + 0}:00:00Z`);
        expect(result.status).toBe('COMPLETED');
      });
    });
  });

  // -------------------------------------------------------------------------
  // cancel()
  // -------------------------------------------------------------------------
  describe('cancel()', () => {
    it('cancels a DRAFT permit', () => {
      const p = makePermit(pm);
      pm.cancel(p.id, '2026-01-01T08:30:00Z');
      expect(pm.get(p.id)!.status).toBe('CANCELLED');
    });

    it('cancels a PENDING_APPROVAL permit', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      pm.cancel(p.id, '2026-01-01T08:30:00Z');
      expect(pm.get(p.id)!.status).toBe('CANCELLED');
    });

    it('cancels an APPROVED permit', () => {
      const p = makeApprovedPermit(pm);
      pm.cancel(p.id, '2026-01-01T09:30:00Z');
      expect(pm.get(p.id)!.status).toBe('CANCELLED');
    });

    it('cancels an ACTIVE permit', () => {
      const p = makeActivePermit(pm);
      pm.cancel(p.id, '2026-01-01T15:00:00Z');
      expect(pm.get(p.id)!.status).toBe('CANCELLED');
    });

    it('cancels a SUSPENDED permit', () => {
      const p = makeActivePermit(pm);
      pm.suspend(p.id);
      pm.cancel(p.id, '2026-01-01T15:00:00Z');
      expect(pm.get(p.id)!.status).toBe('CANCELLED');
    });

    it('stores cancelledAt', () => {
      const p = makePermit(pm);
      pm.cancel(p.id, '2026-01-01T08:45:00Z');
      expect(pm.get(p.id)!.cancelledAt).toBe('2026-01-01T08:45:00Z');
    });

    it('returns updated record', () => {
      const p = makePermit(pm);
      const result = pm.cancel(p.id, '2026-01-01T08:30:00Z');
      expect(result.status).toBe('CANCELLED');
    });

    it('throws for unknown id', () => {
      expect(() => pm.cancel('no-such-id', '2026-01-01T08:30:00Z')).toThrow();
    });

    it('throws if permit is COMPLETED', () => {
      const p = makeActivePermit(pm);
      pm.complete(p.id, '2026-01-01T17:00:00Z');
      expect(() => pm.cancel(p.id, '2026-01-01T17:05:00Z')).toThrow();
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`cancel permit ${i} sets status to CANCELLED`, () => {
        const p = makePermit(pm);
        const result = pm.cancel(p.id, '2026-01-01T08:30:00Z');
        expect(result.status).toBe('CANCELLED');
      });
    });
  });

  // -------------------------------------------------------------------------
  // addWorker()
  // -------------------------------------------------------------------------
  describe('addWorker()', () => {
    it('adds a worker to the permit', () => {
      const p = makePermit(pm, { workers: [] });
      pm.addWorker(p.id, 'new-worker');
      expect(pm.get(p.id)!.workers).toContain('new-worker');
    });

    it('returns updated record', () => {
      const p = makePermit(pm);
      const result = pm.addWorker(p.id, 'worker99');
      expect(result.workers).toContain('worker99');
    });

    it('throws for unknown id', () => {
      expect(() => pm.addWorker('no-such-id', 'worker1')).toThrow();
    });

    it('increases worker count by 1', () => {
      const p = makePermit(pm, { workers: ['w1', 'w2'] });
      pm.addWorker(p.id, 'w3');
      expect(pm.get(p.id)!.workers).toHaveLength(3);
    });

    it('allows adding duplicate workers', () => {
      const p = makePermit(pm, { workers: ['w1'] });
      pm.addWorker(p.id, 'w1');
      expect(pm.get(p.id)!.workers).toHaveLength(2);
    });

    // Parameterized: add 30 workers
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`addWorker iteration ${i} appends correctly`, () => {
        const p = makePermit(pm, { workers: [] });
        pm.addWorker(p.id, `worker-${i}`);
        expect(pm.get(p.id)!.workers).toContain(`worker-${i}`);
      });
    });
  });

  // -------------------------------------------------------------------------
  // get() and getAll()
  // -------------------------------------------------------------------------
  describe('get() and getAll()', () => {
    it('get returns the correct permit by id', () => {
      const p = makePermit(pm, { title: 'Unique Title' });
      expect(pm.get(p.id)!.title).toBe('Unique Title');
    });

    it('get returns undefined for nonexistent id', () => {
      expect(pm.get('xyz')).toBeUndefined();
    });

    it('getAll returns all permits', () => {
      makePermit(pm);
      makePermit(pm);
      makePermit(pm);
      expect(pm.getAll()).toHaveLength(3);
    });

    it('getAll returns empty when no permits', () => {
      expect(pm.getAll()).toHaveLength(0);
    });

    it('getAll length matches getCount', () => {
      makePermit(pm);
      makePermit(pm);
      expect(pm.getAll()).toHaveLength(pm.getCount());
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getAll contains permit at index ${i}`, () => {
        const permits: PermitRecord[] = [];
        Array.from({ length: i + 1 }, (_, j) => j).forEach((j) => {
          permits.push(makePermit(pm, { title: `Permit ${j}` }));
        });
        const all = pm.getAll();
        expect(all).toHaveLength(i + 1);
        permits.forEach((p) => {
          expect(all.find((x) => x.id === p.id)).toBeDefined();
        });
      });
    });
  });

  // -------------------------------------------------------------------------
  // getByType()
  // -------------------------------------------------------------------------
  describe('getByType()', () => {
    ALL_PERMIT_TYPES.forEach((type) => {
      it(`filters by type ${type}`, () => {
        makePermit(pm, { type });
        makePermit(pm, { type: type === 'HOT_WORK' ? 'ELECTRICAL' : 'HOT_WORK' });
        const result = pm.getByType(type);
        expect(result.every((r) => r.type === type)).toBe(true);
        expect(result.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('returns empty array when no permits of type', () => {
      makePermit(pm, { type: 'HOT_WORK' });
      expect(pm.getByType('RADIATION')).toHaveLength(0);
    });

    it('returns multiple permits of same type', () => {
      makePermit(pm, { type: 'ELECTRICAL' });
      makePermit(pm, { type: 'ELECTRICAL' });
      makePermit(pm, { type: 'HOT_WORK' });
      expect(pm.getByType('ELECTRICAL')).toHaveLength(2);
    });

    // Parameterized: 5 permits per type
    ALL_PERMIT_TYPES.forEach((type) => {
      Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
        it(`getByType ${type} iteration ${i}`, () => {
          const p = makePermit(pm, { type });
          const results = pm.getByType(type);
          expect(results.find((r) => r.id === p.id)).toBeDefined();
        });
      });
    });
  });

  // -------------------------------------------------------------------------
  // getByStatus()
  // -------------------------------------------------------------------------
  describe('getByStatus()', () => {
    it('returns DRAFT permits', () => {
      makePermit(pm);
      expect(pm.getByStatus('DRAFT')).toHaveLength(1);
    });

    it('returns PENDING_APPROVAL permits', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      expect(pm.getByStatus('PENDING_APPROVAL')).toHaveLength(1);
    });

    it('returns APPROVED permits', () => {
      makeApprovedPermit(pm);
      expect(pm.getByStatus('APPROVED')).toHaveLength(1);
    });

    it('returns ACTIVE permits', () => {
      makeActivePermit(pm);
      expect(pm.getByStatus('ACTIVE')).toHaveLength(1);
    });

    it('returns SUSPENDED permits', () => {
      const p = makeActivePermit(pm);
      pm.suspend(p.id);
      expect(pm.getByStatus('SUSPENDED')).toHaveLength(1);
    });

    it('returns COMPLETED permits', () => {
      const p = makeActivePermit(pm);
      pm.complete(p.id, '2026-01-01T17:00:00Z');
      expect(pm.getByStatus('COMPLETED')).toHaveLength(1);
    });

    it('returns CANCELLED permits', () => {
      const p = makePermit(pm);
      pm.cancel(p.id, '2026-01-01T08:30:00Z');
      expect(pm.getByStatus('CANCELLED')).toHaveLength(1);
    });

    it('returns empty array for status with no permits', () => {
      makePermit(pm); // DRAFT
      expect(pm.getByStatus('ACTIVE')).toHaveLength(0);
    });

    it('correctly filters after status transition', () => {
      const p = makePermit(pm);
      expect(pm.getByStatus('DRAFT')).toHaveLength(1);
      pm.submitForApproval(p.id);
      expect(pm.getByStatus('DRAFT')).toHaveLength(0);
      expect(pm.getByStatus('PENDING_APPROVAL')).toHaveLength(1);
    });

    // Parameterized: 10 per status
    ALL_PERMIT_STATUSES.forEach((status) => {
      Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
        it(`getByStatus ${status} iteration ${i} returns correct type`, () => {
          const p = makePermit(pm);
          if (status === 'PENDING_APPROVAL') pm.submitForApproval(p.id);
          else if (status === 'APPROVED') {
            pm.submitForApproval(p.id);
            pm.approve(p.id, 'a', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
          } else if (status === 'ACTIVE') {
            pm.submitForApproval(p.id);
            pm.approve(p.id, 'a', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
            pm.activate(p.id);
          } else if (status === 'SUSPENDED') {
            pm.submitForApproval(p.id);
            pm.approve(p.id, 'a', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
            pm.activate(p.id);
            pm.suspend(p.id);
          } else if (status === 'COMPLETED') {
            pm.submitForApproval(p.id);
            pm.approve(p.id, 'a', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
            pm.activate(p.id);
            pm.complete(p.id, '2026-01-01T17:00:00Z');
          } else if (status === 'CANCELLED') {
            pm.cancel(p.id, '2026-01-01T08:30:00Z');
          }
          const results = pm.getByStatus(status);
          expect(results.every((r) => r.status === status)).toBe(true);
        });
      });
    });
  });

  // -------------------------------------------------------------------------
  // getByRiskLevel()
  // -------------------------------------------------------------------------
  describe('getByRiskLevel()', () => {
    ALL_RISK_LEVELS.forEach((level) => {
      it(`filters by riskLevel ${level}`, () => {
        makePermit(pm, { riskLevel: level });
        const results = pm.getByRiskLevel(level);
        expect(results.every((r) => r.riskLevel === level)).toBe(true);
        expect(results.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('returns empty for unrepresented risk level', () => {
      makePermit(pm, { riskLevel: 'LOW' });
      expect(pm.getByRiskLevel('CRITICAL')).toHaveLength(0);
    });

    it('returns multiple for same risk level', () => {
      makePermit(pm, { riskLevel: 'HIGH' });
      makePermit(pm, { riskLevel: 'HIGH' });
      expect(pm.getByRiskLevel('HIGH')).toHaveLength(2);
    });

    // Parameterized
    ALL_RISK_LEVELS.forEach((level) => {
      Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
        it(`getByRiskLevel ${level} iteration ${i}`, () => {
          const p = makePermit(pm, { riskLevel: level });
          const results = pm.getByRiskLevel(level);
          expect(results.find((r) => r.id === p.id)).toBeDefined();
        });
      });
    });
  });

  // -------------------------------------------------------------------------
  // getActive()
  // -------------------------------------------------------------------------
  describe('getActive()', () => {
    it('returns only ACTIVE permits', () => {
      makeActivePermit(pm);
      makePermit(pm); // DRAFT
      const active = pm.getActive();
      expect(active.every((r) => r.status === 'ACTIVE')).toBe(true);
    });

    it('returns empty when no active permits', () => {
      makePermit(pm);
      expect(pm.getActive()).toHaveLength(0);
    });

    it('returns correct count of active permits', () => {
      makeActivePermit(pm);
      makeActivePermit(pm);
      makePermit(pm);
      expect(pm.getActive()).toHaveLength(2);
    });

    it('does not include SUSPENDED permits', () => {
      const p = makeActivePermit(pm);
      pm.suspend(p.id);
      expect(pm.getActive()).toHaveLength(0);
    });

    it('does not include COMPLETED permits', () => {
      const p = makeActivePermit(pm);
      pm.complete(p.id, '2026-01-01T17:00:00Z');
      expect(pm.getActive()).toHaveLength(0);
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getActive iteration ${i} returns only active`, () => {
        makeActivePermit(pm);
        const active = pm.getActive();
        expect(active.every((r) => r.status === 'ACTIVE')).toBe(true);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getExpired()
  // -------------------------------------------------------------------------
  describe('getExpired()', () => {
    it('returns ACTIVE permits past validUntil', () => {
      const p = makeActivePermit(pm);
      // validUntil is set to '2026-01-01T18:00:00Z' by makeActivePermit
      const expired = pm.getExpired('2026-01-02T00:00:00Z');
      expect(expired.find((r) => r.id === p.id)).toBeDefined();
    });

    it('does not return ACTIVE permits not yet expired', () => {
      makeActivePermit(pm);
      const expired = pm.getExpired('2026-01-01T12:00:00Z');
      expect(expired).toHaveLength(0);
    });

    it('returns APPROVED permits past validUntil', () => {
      const p = makeApprovedPermit(pm);
      const expired = pm.getExpired('2026-01-02T00:00:00Z');
      expect(expired.find((r) => r.id === p.id)).toBeDefined();
    });

    it('does not return DRAFT permits', () => {
      makePermit(pm);
      expect(pm.getExpired('2026-12-31T00:00:00Z')).toHaveLength(0);
    });

    it('does not return COMPLETED permits', () => {
      const p = makeActivePermit(pm);
      pm.complete(p.id, '2026-01-01T17:00:00Z');
      expect(pm.getExpired('2026-01-02T00:00:00Z')).toHaveLength(0);
    });

    it('does not return CANCELLED permits', () => {
      const p = makeActivePermit(pm);
      pm.cancel(p.id, '2026-01-01T11:00:00Z');
      expect(pm.getExpired('2026-01-02T00:00:00Z')).toHaveLength(0);
    });

    it('does not include a permit with no validUntil', () => {
      makePermit(pm); // DRAFT, no validUntil
      expect(pm.getExpired('2026-12-31T00:00:00Z')).toHaveLength(0);
    });

    it('boundary: validUntil equal to asOf is not expired', () => {
      makeActivePermit(pm); // validUntil = '2026-01-01T18:00:00Z'
      const expired = pm.getExpired('2026-01-01T18:00:00Z');
      expect(expired).toHaveLength(0);
    });

    // Parameterized: 20 expiry checks
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getExpired iteration ${i} finds correct permits`, () => {
        const p = makeActivePermit(pm);
        const expired = pm.getExpired('2026-06-01T00:00:00Z');
        expect(expired.find((r) => r.id === p.id)).toBeDefined();
      });
    });
  });

  // -------------------------------------------------------------------------
  // getByRequestor() and getBySupervisor()
  // -------------------------------------------------------------------------
  describe('getByRequestor()', () => {
    it('returns permits by requestedBy', () => {
      makePermit(pm, { requestedBy: 'alice' });
      makePermit(pm, { requestedBy: 'bob' });
      expect(pm.getByRequestor('alice')).toHaveLength(1);
    });

    it('returns empty for unknown requestor', () => {
      makePermit(pm, { requestedBy: 'alice' });
      expect(pm.getByRequestor('charlie')).toHaveLength(0);
    });

    it('returns multiple permits by same requestor', () => {
      makePermit(pm, { requestedBy: 'alice' });
      makePermit(pm, { requestedBy: 'alice' });
      expect(pm.getByRequestor('alice')).toHaveLength(2);
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getByRequestor iteration ${i}`, () => {
        const user = `user-${i}`;
        makePermit(pm, { requestedBy: user });
        const results = pm.getByRequestor(user);
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(results.every((r) => r.requestedBy === user)).toBe(true);
      });
    });
  });

  describe('getBySupervisor()', () => {
    it('returns permits by supervisor', () => {
      makePermit(pm, { supervisor: 'sup1' });
      makePermit(pm, { supervisor: 'sup2' });
      expect(pm.getBySupervisor('sup1')).toHaveLength(1);
    });

    it('returns empty for unknown supervisor', () => {
      makePermit(pm, { supervisor: 'sup1' });
      expect(pm.getBySupervisor('sup-unknown')).toHaveLength(0);
    });

    it('returns multiple permits by same supervisor', () => {
      makePermit(pm, { supervisor: 'sup1' });
      makePermit(pm, { supervisor: 'sup1' });
      expect(pm.getBySupervisor('sup1')).toHaveLength(2);
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getBySupervisor iteration ${i}`, () => {
        const sup = `sup-${i}`;
        makePermit(pm, { supervisor: sup });
        const results = pm.getBySupervisor(sup);
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(results.every((r) => r.supervisor === sup)).toBe(true);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getCount()
  // -------------------------------------------------------------------------
  describe('getCount()', () => {
    it('returns 0 initially', () => {
      expect(pm.getCount()).toBe(0);
    });

    it('increments with each draft', () => {
      makePermit(pm);
      expect(pm.getCount()).toBe(1);
      makePermit(pm);
      expect(pm.getCount()).toBe(2);
    });

    it('does not decrease on status change', () => {
      const p = makePermit(pm);
      pm.cancel(p.id, '2026-01-01T08:30:00Z');
      expect(pm.getCount()).toBe(1);
    });

    // Parameterized
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getCount returns 1 after 1 draft (iteration ${i})`, () => {
        makePermit(pm);
        expect(pm.getCount()).toBe(1);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Full lifecycle tests
  // -------------------------------------------------------------------------
  describe('full lifecycle', () => {
    it('DRAFT → PENDING_APPROVAL → APPROVED → ACTIVE → COMPLETED', () => {
      const p = makePermit(pm);
      expect(p.status).toBe('DRAFT');

      pm.submitForApproval(p.id);
      expect(pm.get(p.id)!.status).toBe('PENDING_APPROVAL');

      pm.approve(p.id, 'mgr', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
      expect(pm.get(p.id)!.status).toBe('APPROVED');

      pm.activate(p.id);
      expect(pm.get(p.id)!.status).toBe('ACTIVE');

      pm.complete(p.id, '2026-01-01T17:00:00Z');
      expect(pm.get(p.id)!.status).toBe('COMPLETED');
      expect(pm.get(p.id)!.completedAt).toBe('2026-01-01T17:00:00Z');
    });

    it('DRAFT → PENDING_APPROVAL → APPROVED → ACTIVE → SUSPENDED → CANCELLED', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      pm.approve(p.id, 'mgr', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
      pm.activate(p.id);
      pm.suspend(p.id);
      pm.cancel(p.id, '2026-01-01T16:00:00Z');
      expect(pm.get(p.id)!.status).toBe('CANCELLED');
      expect(pm.get(p.id)!.cancelledAt).toBe('2026-01-01T16:00:00Z');
    });

    it('DRAFT → CANCELLED', () => {
      const p = makePermit(pm);
      pm.cancel(p.id, '2026-01-01T08:30:00Z');
      expect(pm.get(p.id)!.status).toBe('CANCELLED');
    });

    it('PENDING_APPROVAL → CANCELLED', () => {
      const p = makePermit(pm);
      pm.submitForApproval(p.id);
      pm.cancel(p.id, '2026-01-01T08:30:00Z');
      expect(pm.get(p.id)!.status).toBe('CANCELLED');
    });

    it('APPROVED → CANCELLED', () => {
      const p = makeApprovedPermit(pm);
      pm.cancel(p.id, '2026-01-01T09:30:00Z');
      expect(pm.get(p.id)!.status).toBe('CANCELLED');
    });

    it('multiple lifecycle transitions preserve other fields', () => {
      const p = makePermit(pm, {
        title: 'Lifecycle Test',
        location: 'Plant 2',
        riskLevel: 'CRITICAL',
        requestedBy: 'requester1',
        supervisor: 'supervisor2',
      });
      pm.submitForApproval(p.id);
      pm.approve(p.id, 'mgr', '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
      pm.activate(p.id);
      const final = pm.get(p.id)!;
      expect(final.title).toBe('Lifecycle Test');
      expect(final.location).toBe('Plant 2');
      expect(final.riskLevel).toBe('CRITICAL');
      expect(final.requestedBy).toBe('requester1');
      expect(final.supervisor).toBe('supervisor2');
    });

    // Parameterized lifecycle
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`full lifecycle iteration ${i}`, () => {
        const p = makePermit(pm);
        pm.submitForApproval(p.id);
        pm.approve(p.id, `approver${i}`, '2026-01-01T09:00:00Z', '2026-01-01T10:00:00Z', '2026-01-01T18:00:00Z');
        pm.activate(p.id);
        pm.complete(p.id, '2026-01-01T17:00:00Z');
        expect(pm.get(p.id)!.status).toBe('COMPLETED');
        expect(pm.get(p.id)!.approvedBy).toBe(`approver${i}`);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases & misc
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    it('multiple permits coexist independently', () => {
      const p1 = makePermit(pm, { title: 'P1', type: 'HOT_WORK' });
      const p2 = makePermit(pm, { title: 'P2', type: 'ELECTRICAL' });
      pm.submitForApproval(p1.id);
      expect(pm.get(p1.id)!.status).toBe('PENDING_APPROVAL');
      expect(pm.get(p2.id)!.status).toBe('DRAFT');
    });

    it('workers array starts as copy of provided array', () => {
      const workers = ['w1', 'w2'];
      const p = makePermit(pm, { workers });
      workers.length = 0;
      expect(pm.get(p.id)!.workers).toHaveLength(2);
    });

    it('hazards array starts as copy', () => {
      const hazards = ['H1'];
      const p = makePermit(pm, { hazards });
      hazards.push('H2');
      expect(pm.get(p.id)!.hazards).toHaveLength(1);
    });

    it('empty hazards and precautions are valid', () => {
      const p = makePermit(pm, { hazards: [], precautions: [] });
      expect(p.hazards).toEqual([]);
      expect(p.precautions).toEqual([]);
    });

    it('empty workers list is valid', () => {
      const p = makePermit(pm, { workers: [] });
      expect(p.workers).toEqual([]);
    });

    it('notes can be an empty string', () => {
      const p = makePermit(pm, { notes: '' });
      expect(p.notes).toBe('');
    });

    it('does not throw on get for empty store', () => {
      expect(() => pm.get('any-id')).not.toThrow();
    });

    // Stress test: 50 permits with all types and risk levels
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`stress test permit ${i} with varied attributes`, () => {
        const type = ALL_PERMIT_TYPES[i % ALL_PERMIT_TYPES.length];
        const level = ALL_RISK_LEVELS[i % ALL_RISK_LEVELS.length];
        const p = makePermit(pm, { type, riskLevel: level, title: `Stress ${i}` });
        expect(p.type).toBe(type);
        expect(p.riskLevel).toBe(level);
        expect(p.title).toBe(`Stress ${i}`);
        expect(p.status).toBe('DRAFT');
      });
    });
  });
});

// ===========================================================================
// IsolationTracker tests
// ===========================================================================
describe('IsolationTracker', () => {
  let tracker: IsolationTracker;

  beforeEach(() => {
    tracker = new IsolationTracker();
  });

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------
  describe('initial state', () => {
    it('starts with zero isolations', () => {
      expect(tracker.getCount()).toBe(0);
    });

    it('getApplied returns empty initially', () => {
      expect(tracker.getApplied()).toEqual([]);
    });

    it('getUnverified returns empty initially', () => {
      expect(tracker.getUnverified()).toEqual([]);
    });

    it('getByStatus returns empty for all statuses initially', () => {
      ALL_ISOLATION_STATUSES.forEach((s) => {
        expect(tracker.getByStatus(s)).toEqual([]);
      });
    });

    it('getByType returns empty for all types initially', () => {
      ALL_ISOLATION_TYPES.forEach((t) => {
        expect(tracker.getByType(t)).toEqual([]);
      });
    });

    it('getByPermit returns empty initially', () => {
      expect(tracker.getByPermit('any-permit')).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // apply()
  // -------------------------------------------------------------------------
  describe('apply()', () => {
    it('returns a record with APPLIED status', () => {
      const iso = makeIso(tracker, 'permit-1');
      expect(iso.status).toBe('APPLIED');
    });

    it('assigns a unique id', () => {
      const iso1 = makeIso(tracker, 'permit-1');
      const iso2 = makeIso(tracker, 'permit-1');
      expect(iso1.id).not.toBe(iso2.id);
    });

    it('stores permitId', () => {
      const iso = makeIso(tracker, 'permit-42');
      expect(iso.permitId).toBe('permit-42');
    });

    it('stores type', () => {
      const iso = makeIso(tracker, 'permit-1', { type: 'TAGOUT' });
      expect(iso.type).toBe('TAGOUT');
    });

    it('stores isolationPoint', () => {
      const iso = makeIso(tracker, 'permit-1', { isolationPoint: 'Breaker 3B' });
      expect(iso.isolationPoint).toBe('Breaker 3B');
    });

    it('stores appliedBy', () => {
      const iso = makeIso(tracker, 'permit-1', { appliedBy: 'tech2' });
      expect(iso.appliedBy).toBe('tech2');
    });

    it('stores appliedAt', () => {
      const iso = makeIso(tracker, 'permit-1', { appliedAt: '2026-02-01T08:00:00Z' });
      expect(iso.appliedAt).toBe('2026-02-01T08:00:00Z');
    });

    it('stores optional notes', () => {
      const iso = makeIso(tracker, 'permit-1', { notes: 'Double-checked' });
      expect(iso.notes).toBe('Double-checked');
    });

    it('notes undefined when not provided', () => {
      const iso = makeIso(tracker, 'permit-1');
      expect(iso.notes).toBeUndefined();
    });

    it('verifiedBy undefined initially', () => {
      const iso = makeIso(tracker, 'permit-1');
      expect(iso.verifiedBy).toBeUndefined();
    });

    it('verifiedAt undefined initially', () => {
      const iso = makeIso(tracker, 'permit-1');
      expect(iso.verifiedAt).toBeUndefined();
    });

    it('removedBy undefined initially', () => {
      const iso = makeIso(tracker, 'permit-1');
      expect(iso.removedBy).toBeUndefined();
    });

    it('removedAt undefined initially', () => {
      const iso = makeIso(tracker, 'permit-1');
      expect(iso.removedAt).toBeUndefined();
    });

    it('increments count', () => {
      makeIso(tracker, 'permit-1');
      expect(tracker.getCount()).toBe(1);
      makeIso(tracker, 'permit-1');
      expect(tracker.getCount()).toBe(2);
    });

    // All isolation types
    ALL_ISOLATION_TYPES.forEach((type) => {
      it(`applies isolation of type ${type}`, () => {
        const iso = makeIso(tracker, 'permit-1', { type });
        expect(iso.type).toBe(type);
        expect(iso.status).toBe('APPLIED');
      });
    });

    // Parameterized: 50 applications
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`apply isolation ${i} has unique id and APPLIED status`, () => {
        const iso = makeIso(tracker, `permit-${i}`);
        expect(iso.id).toBeTruthy();
        expect(iso.status).toBe('APPLIED');
      });
    });
  });

  // -------------------------------------------------------------------------
  // verify()
  // -------------------------------------------------------------------------
  describe('verify()', () => {
    it('transitions APPLIED → VERIFIED', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      expect(tracker.getByPermit('permit-1')[0].status).toBe('VERIFIED');
    });

    it('stores verifiedBy', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector2', '2026-01-01T10:30:00Z');
      expect(tracker.getByPermit('permit-1')[0].verifiedBy).toBe('inspector2');
    });

    it('stores verifiedAt', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-02-15T11:00:00Z');
      expect(tracker.getByPermit('permit-1')[0].verifiedAt).toBe('2026-02-15T11:00:00Z');
    });

    it('returns updated record', () => {
      const iso = makeIso(tracker, 'permit-1');
      const result = tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      expect(result.status).toBe('VERIFIED');
    });

    it('throws for unknown id', () => {
      expect(() => tracker.verify('no-such-id', 'inspector1', '2026-01-01T10:30:00Z')).toThrow();
    });

    it('throws if already VERIFIED', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      expect(() => tracker.verify(iso.id, 'inspector1', '2026-01-01T10:31:00Z')).toThrow();
    });

    it('throws if REMOVED', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      tracker.remove(iso.id, 'tech1', '2026-01-01T17:00:00Z');
      expect(() => tracker.verify(iso.id, 'inspector1', '2026-01-01T17:05:00Z')).toThrow();
    });

    it('throws if FAILED', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.markFailed(iso.id);
      expect(() => tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z')).toThrow();
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`verify iteration ${i} sets VERIFIED status`, () => {
        const iso = makeIso(tracker, `permit-${i}`);
        const result = tracker.verify(iso.id, `inspector${i}`, '2026-01-01T10:30:00Z');
        expect(result.status).toBe('VERIFIED');
        expect(result.verifiedBy).toBe(`inspector${i}`);
      });
    });
  });

  // -------------------------------------------------------------------------
  // remove()
  // -------------------------------------------------------------------------
  describe('remove()', () => {
    it('transitions VERIFIED → REMOVED', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      tracker.remove(iso.id, 'tech1', '2026-01-01T17:00:00Z');
      expect(tracker.getByPermit('permit-1')[0].status).toBe('REMOVED');
    });

    it('stores removedBy', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      tracker.remove(iso.id, 'tech99', '2026-01-01T17:00:00Z');
      expect(tracker.getByPermit('permit-1')[0].removedBy).toBe('tech99');
    });

    it('stores removedAt', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      tracker.remove(iso.id, 'tech1', '2026-02-20T16:30:00Z');
      expect(tracker.getByPermit('permit-1')[0].removedAt).toBe('2026-02-20T16:30:00Z');
    });

    it('returns updated record', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      const result = tracker.remove(iso.id, 'tech1', '2026-01-01T17:00:00Z');
      expect(result.status).toBe('REMOVED');
    });

    it('throws for unknown id', () => {
      expect(() => tracker.remove('no-such-id', 'tech1', '2026-01-01T17:00:00Z')).toThrow();
    });

    it('throws if APPLIED (not yet verified)', () => {
      const iso = makeIso(tracker, 'permit-1');
      expect(() => tracker.remove(iso.id, 'tech1', '2026-01-01T17:00:00Z')).toThrow();
    });

    it('throws if already REMOVED', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      tracker.remove(iso.id, 'tech1', '2026-01-01T17:00:00Z');
      expect(() => tracker.remove(iso.id, 'tech1', '2026-01-01T17:05:00Z')).toThrow();
    });

    it('throws if FAILED', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.markFailed(iso.id);
      expect(() => tracker.remove(iso.id, 'tech1', '2026-01-01T17:00:00Z')).toThrow();
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`remove iteration ${i} sets REMOVED status`, () => {
        const iso = makeIso(tracker, `permit-${i}`);
        tracker.verify(iso.id, `inspector${i}`, '2026-01-01T10:30:00Z');
        const result = tracker.remove(iso.id, `tech${i}`, '2026-01-01T17:00:00Z');
        expect(result.status).toBe('REMOVED');
        expect(result.removedBy).toBe(`tech${i}`);
      });
    });
  });

  // -------------------------------------------------------------------------
  // markFailed()
  // -------------------------------------------------------------------------
  describe('markFailed()', () => {
    it('marks APPLIED isolation as FAILED', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.markFailed(iso.id);
      expect(tracker.getByPermit('permit-1')[0].status).toBe('FAILED');
    });

    it('marks VERIFIED isolation as FAILED', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      tracker.markFailed(iso.id);
      expect(tracker.getByPermit('permit-1')[0].status).toBe('FAILED');
    });

    it('returns the updated record', () => {
      const iso = makeIso(tracker, 'permit-1');
      const result = tracker.markFailed(iso.id);
      expect(result.status).toBe('FAILED');
    });

    it('throws for unknown id', () => {
      expect(() => tracker.markFailed('no-such-id')).toThrow();
    });

    it('can mark an already FAILED isolation as FAILED again', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.markFailed(iso.id);
      // markFailed has no guard on current status — it just sets FAILED
      expect(() => tracker.markFailed(iso.id)).not.toThrow();
      expect(tracker.getByPermit('permit-1')[0].status).toBe('FAILED');
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`markFailed iteration ${i} sets FAILED status`, () => {
        const iso = makeIso(tracker, `permit-${i}`);
        const result = tracker.markFailed(iso.id);
        expect(result.status).toBe('FAILED');
      });
    });
  });

  // -------------------------------------------------------------------------
  // getByPermit()
  // -------------------------------------------------------------------------
  describe('getByPermit()', () => {
    it('returns all isolations for a permit', () => {
      makeIso(tracker, 'permit-A');
      makeIso(tracker, 'permit-A');
      makeIso(tracker, 'permit-B');
      expect(tracker.getByPermit('permit-A')).toHaveLength(2);
    });

    it('returns empty for unknown permit', () => {
      makeIso(tracker, 'permit-A');
      expect(tracker.getByPermit('permit-Z')).toHaveLength(0);
    });

    it('returns only isolations for the requested permit', () => {
      makeIso(tracker, 'permit-A');
      makeIso(tracker, 'permit-B');
      const results = tracker.getByPermit('permit-A');
      expect(results.every((r) => r.permitId === 'permit-A')).toBe(true);
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getByPermit iteration ${i}`, () => {
        const permitId = `permit-${i}`;
        makeIso(tracker, permitId);
        makeIso(tracker, permitId);
        const results = tracker.getByPermit(permitId);
        expect(results).toHaveLength(2);
        expect(results.every((r) => r.permitId === permitId)).toBe(true);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getByStatus()
  // -------------------------------------------------------------------------
  describe('getByStatus()', () => {
    it('returns APPLIED isolations', () => {
      makeIso(tracker, 'permit-1');
      expect(tracker.getByStatus('APPLIED')).toHaveLength(1);
    });

    it('returns VERIFIED isolations', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      expect(tracker.getByStatus('VERIFIED')).toHaveLength(1);
    });

    it('returns REMOVED isolations', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      tracker.remove(iso.id, 'tech1', '2026-01-01T17:00:00Z');
      expect(tracker.getByStatus('REMOVED')).toHaveLength(1);
    });

    it('returns FAILED isolations', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.markFailed(iso.id);
      expect(tracker.getByStatus('FAILED')).toHaveLength(1);
    });

    it('filters correctly after transition', () => {
      const iso = makeIso(tracker, 'permit-1');
      expect(tracker.getByStatus('APPLIED')).toHaveLength(1);
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      expect(tracker.getByStatus('APPLIED')).toHaveLength(0);
      expect(tracker.getByStatus('VERIFIED')).toHaveLength(1);
    });

    it('returns empty for status with no isolations', () => {
      makeIso(tracker, 'permit-1');
      expect(tracker.getByStatus('FAILED')).toHaveLength(0);
    });

    // Parameterized
    ALL_ISOLATION_STATUSES.forEach((status) => {
      Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
        it(`getByStatus ${status} iteration ${i}`, () => {
          const iso = makeIso(tracker, `permit-${status}-${i}`);
          if (status === 'VERIFIED') {
            tracker.verify(iso.id, 'inspector', '2026-01-01T10:30:00Z');
          } else if (status === 'REMOVED') {
            tracker.verify(iso.id, 'inspector', '2026-01-01T10:30:00Z');
            tracker.remove(iso.id, 'tech', '2026-01-01T17:00:00Z');
          } else if (status === 'FAILED') {
            tracker.markFailed(iso.id);
          }
          const results = tracker.getByStatus(status);
          expect(results.every((r) => r.status === status)).toBe(true);
        });
      });
    });
  });

  // -------------------------------------------------------------------------
  // getByType()
  // -------------------------------------------------------------------------
  describe('getByType()', () => {
    ALL_ISOLATION_TYPES.forEach((type) => {
      it(`filters by type ${type}`, () => {
        makeIso(tracker, 'permit-1', { type });
        const results = tracker.getByType(type);
        expect(results.every((r) => r.type === type)).toBe(true);
        expect(results.length).toBeGreaterThanOrEqual(1);
      });
    });

    it('returns empty when no isolations of type', () => {
      makeIso(tracker, 'permit-1', { type: 'LOCKOUT' });
      expect(tracker.getByType('TAGOUT')).toHaveLength(0);
    });

    it('returns multiple isolations of same type', () => {
      makeIso(tracker, 'permit-1', { type: 'LOCKOUT_TAGOUT' });
      makeIso(tracker, 'permit-2', { type: 'LOCKOUT_TAGOUT' });
      expect(tracker.getByType('LOCKOUT_TAGOUT')).toHaveLength(2);
    });

    // Parameterized
    ALL_ISOLATION_TYPES.forEach((type) => {
      Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
        it(`getByType ${type} iteration ${i}`, () => {
          const iso = makeIso(tracker, `permit-${i}`, { type });
          const results = tracker.getByType(type);
          expect(results.find((r) => r.id === iso.id)).toBeDefined();
        });
      });
    });
  });

  // -------------------------------------------------------------------------
  // getApplied() and getUnverified()
  // -------------------------------------------------------------------------
  describe('getApplied() and getUnverified()', () => {
    it('getApplied returns only APPLIED isolations', () => {
      makeIso(tracker, 'permit-1');
      const iso2 = makeIso(tracker, 'permit-2');
      tracker.verify(iso2.id, 'inspector1', '2026-01-01T10:30:00Z');
      expect(tracker.getApplied()).toHaveLength(1);
      expect(tracker.getApplied()[0].status).toBe('APPLIED');
    });

    it('getUnverified returns APPLIED isolations', () => {
      makeIso(tracker, 'permit-1');
      expect(tracker.getUnverified()).toHaveLength(1);
    });

    it('getUnverified decreases after verification', () => {
      const iso = makeIso(tracker, 'permit-1');
      expect(tracker.getUnverified()).toHaveLength(1);
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      expect(tracker.getUnverified()).toHaveLength(0);
    });

    it('getApplied is empty when all verified', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      expect(tracker.getApplied()).toHaveLength(0);
    });

    it('getApplied not affected by FAILED status', () => {
      const iso1 = makeIso(tracker, 'permit-1');
      const iso2 = makeIso(tracker, 'permit-2');
      tracker.markFailed(iso2.id);
      expect(tracker.getApplied()).toHaveLength(1);
      expect(tracker.getApplied()[0].id).toBe(iso1.id);
    });

    // Parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`getApplied iteration ${i} returns correct count`, () => {
        makeIso(tracker, `permit-${i}`);
        expect(tracker.getApplied().length).toBeGreaterThanOrEqual(1);
        expect(tracker.getUnverified().length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getCount()
  // -------------------------------------------------------------------------
  describe('getCount()', () => {
    it('returns 0 initially', () => {
      expect(tracker.getCount()).toBe(0);
    });

    it('increments with each apply', () => {
      makeIso(tracker, 'permit-1');
      expect(tracker.getCount()).toBe(1);
      makeIso(tracker, 'permit-1');
      expect(tracker.getCount()).toBe(2);
    });

    it('does not decrease after verify/remove/fail', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      tracker.remove(iso.id, 'tech1', '2026-01-01T17:00:00Z');
      expect(tracker.getCount()).toBe(1);
    });

    // Parameterized
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getCount returns 1 after 1 apply (iteration ${i})`, () => {
        makeIso(tracker, `permit-${i}`);
        expect(tracker.getCount()).toBe(1);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Full lifecycle
  // -------------------------------------------------------------------------
  describe('full isolation lifecycle', () => {
    it('APPLIED → VERIFIED → REMOVED full lifecycle', () => {
      const iso = makeIso(tracker, 'permit-1');
      expect(iso.status).toBe('APPLIED');

      const verified = tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      expect(verified.status).toBe('VERIFIED');
      expect(verified.verifiedBy).toBe('inspector1');
      expect(verified.verifiedAt).toBe('2026-01-01T10:30:00Z');

      const removed = tracker.remove(iso.id, 'tech1', '2026-01-01T17:00:00Z');
      expect(removed.status).toBe('REMOVED');
      expect(removed.removedBy).toBe('tech1');
      expect(removed.removedAt).toBe('2026-01-01T17:00:00Z');
    });

    it('APPLIED → FAILED lifecycle', () => {
      const iso = makeIso(tracker, 'permit-1');
      const failed = tracker.markFailed(iso.id);
      expect(failed.status).toBe('FAILED');
    });

    it('APPLIED → VERIFIED → FAILED lifecycle', () => {
      const iso = makeIso(tracker, 'permit-1');
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      const failed = tracker.markFailed(iso.id);
      expect(failed.status).toBe('FAILED');
    });

    it('multiple isolations for same permit have independent lifecycles', () => {
      const iso1 = makeIso(tracker, 'permit-1', { type: 'LOCKOUT' });
      const iso2 = makeIso(tracker, 'permit-1', { type: 'TAGOUT' });
      tracker.verify(iso1.id, 'inspector1', '2026-01-01T10:30:00Z');
      expect(tracker.getByPermit('permit-1').find((r) => r.id === iso1.id)!.status).toBe('VERIFIED');
      expect(tracker.getByPermit('permit-1').find((r) => r.id === iso2.id)!.status).toBe('APPLIED');
    });

    it('lifecycle preserves isolationPoint throughout', () => {
      const iso = makeIso(tracker, 'permit-1', { isolationPoint: 'Main Switchboard' });
      tracker.verify(iso.id, 'inspector1', '2026-01-01T10:30:00Z');
      tracker.remove(iso.id, 'tech1', '2026-01-01T17:00:00Z');
      expect(tracker.getByPermit('permit-1')[0].isolationPoint).toBe('Main Switchboard');
    });

    // Parameterized full lifecycle
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`full isolation lifecycle iteration ${i}`, () => {
        const type = ALL_ISOLATION_TYPES[i % ALL_ISOLATION_TYPES.length];
        const iso = makeIso(tracker, `permit-lc-${i}`, { type });
        tracker.verify(iso.id, `inspector${i}`, '2026-01-01T10:30:00Z');
        tracker.remove(iso.id, `tech${i}`, '2026-01-01T17:00:00Z');
        const result = tracker.getByPermit(`permit-lc-${i}`)[0];
        expect(result.status).toBe('REMOVED');
        expect(result.verifiedBy).toBe(`inspector${i}`);
        expect(result.removedBy).toBe(`tech${i}`);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    it('multiple permits with multiple isolations each', () => {
      ['P1', 'P2', 'P3'].forEach((pid) => {
        makeIso(tracker, pid, { type: 'LOCKOUT' });
        makeIso(tracker, pid, { type: 'TAGOUT' });
      });
      expect(tracker.getCount()).toBe(6);
      expect(tracker.getByPermit('P1')).toHaveLength(2);
      expect(tracker.getByPermit('P2')).toHaveLength(2);
      expect(tracker.getByPermit('P3')).toHaveLength(2);
    });

    it('notes can be empty string', () => {
      const iso = makeIso(tracker, 'permit-1', { notes: '' });
      expect(iso.notes).toBe('');
    });

    it('different isolation types tracked correctly', () => {
      ALL_ISOLATION_TYPES.forEach((type) => {
        makeIso(tracker, 'permit-1', { type });
      });
      ALL_ISOLATION_TYPES.forEach((type) => {
        expect(tracker.getByType(type).length).toBeGreaterThanOrEqual(1);
      });
    });

    it('getApplied and getUnverified return same results (both = APPLIED)', () => {
      makeIso(tracker, 'p1');
      makeIso(tracker, 'p2');
      expect(tracker.getApplied()).toHaveLength(tracker.getUnverified().length);
    });

    // Stress test
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`stress test isolation ${i} with varied types`, () => {
        const type = ALL_ISOLATION_TYPES[i % ALL_ISOLATION_TYPES.length];
        const iso = makeIso(tracker, `permit-stress-${i}`, { type, appliedBy: `tech${i}` });
        expect(iso.type).toBe(type);
        expect(iso.appliedBy).toBe(`tech${i}`);
        expect(iso.status).toBe('APPLIED');
      });
    });
  });
});

// ===========================================================================
// Integration: PermitManager + IsolationTracker together
// ===========================================================================
describe('Integration: PermitManager + IsolationTracker', () => {
  let pm: PermitManager;
  let tracker: IsolationTracker;

  beforeEach(() => {
    pm = new PermitManager();
    tracker = new IsolationTracker();
  });

  it('creates a permit and applies isolations for it', () => {
    const permit = makeActivePermit(pm);
    const iso1 = makeIso(tracker, permit.id, { type: 'LOCKOUT' });
    const iso2 = makeIso(tracker, permit.id, { type: 'TAGOUT' });
    expect(tracker.getByPermit(permit.id)).toHaveLength(2);
    expect(iso1.permitId).toBe(permit.id);
    expect(iso2.permitId).toBe(permit.id);
  });

  it('isolations are linked to their permit ids', () => {
    const p1 = makeActivePermit(pm);
    const p2 = makeActivePermit(pm);
    makeIso(tracker, p1.id);
    makeIso(tracker, p2.id);
    expect(tracker.getByPermit(p1.id)).toHaveLength(1);
    expect(tracker.getByPermit(p2.id)).toHaveLength(1);
  });

  it('completing a permit does not affect isolation records', () => {
    const permit = makeActivePermit(pm);
    const iso = makeIso(tracker, permit.id);
    pm.complete(permit.id, '2026-01-01T17:00:00Z');
    expect(tracker.getByPermit(permit.id)[0].status).toBe('APPLIED');
  });

  it('full workflow: permit lifecycle + isolation lifecycle', () => {
    // Create and activate permit
    const permit = makeActivePermit(pm, { type: 'ELECTRICAL', riskLevel: 'HIGH' });

    // Apply and verify isolation
    const iso = makeIso(tracker, permit.id, {
      type: 'ELECTRICAL_ISOLATION',
      isolationPoint: 'MCC Panel 5',
      appliedBy: 'electrician1',
    });
    tracker.verify(iso.id, 'safety-officer', '2026-01-01T10:15:00Z');

    // Complete work
    pm.complete(permit.id, '2026-01-01T16:45:00Z');

    // Remove isolation
    tracker.remove(iso.id, 'electrician1', '2026-01-01T16:50:00Z');

    const finalPermit = pm.get(permit.id)!;
    const finalIso = tracker.getByPermit(permit.id)[0];

    expect(finalPermit.status).toBe('COMPLETED');
    expect(finalIso.status).toBe('REMOVED');
    expect(finalIso.verifiedBy).toBe('safety-officer');
    expect(finalIso.removedBy).toBe('electrician1');
  });

  it('hot work permit with multiple isolations', () => {
    const permit = makeActivePermit(pm, { type: 'HOT_WORK', riskLevel: 'CRITICAL' });
    makeIso(tracker, permit.id, { type: 'LOCKOUT', isolationPoint: 'Gas supply' });
    makeIso(tracker, permit.id, { type: 'VALVE_LOCK', isolationPoint: 'Water valve' });
    makeIso(tracker, permit.id, { type: 'TAGOUT', isolationPoint: 'Electrical feed' });

    const isos = tracker.getByPermit(permit.id);
    expect(isos).toHaveLength(3);
    expect(isos.every((r) => r.status === 'APPLIED')).toBe(true);
  });

  it('confined space permit with LOTO isolation', () => {
    const permit = makeActivePermit(pm, { type: 'CONFINED_SPACE', riskLevel: 'HIGH' });
    const iso = makeIso(tracker, permit.id, { type: 'LOCKOUT_TAGOUT', isolationPoint: 'Entry hatch' });
    tracker.verify(iso.id, 'safety-eng', '2026-01-01T09:00:00Z');
    expect(tracker.getByPermit(permit.id)[0].status).toBe('VERIFIED');
    expect(pm.get(permit.id)!.status).toBe('ACTIVE');
  });

  it('cancelled permit isolations remain accessible', () => {
    const permit = makeActivePermit(pm);
    makeIso(tracker, permit.id);
    pm.cancel(permit.id, '2026-01-01T11:00:00Z');
    expect(pm.get(permit.id)!.status).toBe('CANCELLED');
    expect(tracker.getByPermit(permit.id)).toHaveLength(1);
  });

  it('getExpired returns permits with linked isolations still APPLIED', () => {
    const permit = makeActivePermit(pm);
    makeIso(tracker, permit.id, { type: 'LOCKOUT' });
    const expired = pm.getExpired('2026-06-01T00:00:00Z');
    expect(expired.find((p) => p.id === permit.id)).toBeDefined();
    expect(tracker.getByPermit(permit.id)).toHaveLength(1);
  });

  // Parameterized integration tests
  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`integration iteration ${i}: permit + isolation lifecycle`, () => {
      const type = ALL_PERMIT_TYPES[i % ALL_PERMIT_TYPES.length];
      const isoType = ALL_ISOLATION_TYPES[i % ALL_ISOLATION_TYPES.length];
      const permit = makeActivePermit(pm, { type });
      const iso = makeIso(tracker, permit.id, { type: isoType });
      tracker.verify(iso.id, `insp${i}`, '2026-01-01T10:00:00Z');
      tracker.remove(iso.id, `tech${i}`, '2026-01-01T17:00:00Z');
      pm.complete(permit.id, '2026-01-01T17:05:00Z');
      expect(pm.get(permit.id)!.status).toBe('COMPLETED');
      expect(tracker.getByPermit(permit.id)[0].status).toBe('REMOVED');
    });
  });

  // Additional integration edge cases
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`integration edge case ${i}: multiple permits independent isolation tracking`, () => {
      const p1 = makeActivePermit(pm, { riskLevel: ALL_RISK_LEVELS[i % 4] });
      const p2 = makeActivePermit(pm, { riskLevel: ALL_RISK_LEVELS[(i + 1) % 4] });
      makeIso(tracker, p1.id, { type: ALL_ISOLATION_TYPES[i % 5] });
      makeIso(tracker, p2.id, { type: ALL_ISOLATION_TYPES[(i + 1) % 5] });
      expect(tracker.getByPermit(p1.id)).toHaveLength(1);
      expect(tracker.getByPermit(p2.id)).toHaveLength(1);
      expect(tracker.getCount()).toBe(2);
    });
  });
});

// ===========================================================================
// Type/interface shape tests
// ===========================================================================
describe('Type shape validation', () => {
  let pm: PermitManager;
  let tracker: IsolationTracker;

  beforeEach(() => {
    pm = new PermitManager();
    tracker = new IsolationTracker();
  });

  it('PermitRecord has required fields', () => {
    const p = makePermit(pm);
    expect(typeof p.id).toBe('string');
    expect(typeof p.type).toBe('string');
    expect(typeof p.status).toBe('string');
    expect(typeof p.title).toBe('string');
    expect(typeof p.location).toBe('string');
    expect(typeof p.workDescription).toBe('string');
    expect(typeof p.riskLevel).toBe('string');
    expect(typeof p.requestedBy).toBe('string');
    expect(typeof p.requestedAt).toBe('string');
    expect(typeof p.supervisor).toBe('string');
    expect(Array.isArray(p.hazards)).toBe(true);
    expect(Array.isArray(p.precautions)).toBe(true);
    expect(Array.isArray(p.workers)).toBe(true);
  });

  it('IsolationRecord has required fields', () => {
    const iso = makeIso(tracker, 'permit-1');
    expect(typeof iso.id).toBe('string');
    expect(typeof iso.permitId).toBe('string');
    expect(typeof iso.type).toBe('string');
    expect(typeof iso.status).toBe('string');
    expect(typeof iso.isolationPoint).toBe('string');
    expect(typeof iso.appliedBy).toBe('string');
    expect(typeof iso.appliedAt).toBe('string');
  });

  // Parameterized: verify all permit types produce valid records
  ALL_PERMIT_TYPES.forEach((type) => {
    it(`PermitRecord for type ${type} has correct shape`, () => {
      const p = makePermit(pm, { type });
      expect(p.type).toBe(type);
      expect(ALL_PERMIT_STATUSES).toContain(p.status);
      expect(ALL_RISK_LEVELS).toContain(p.riskLevel);
    });
  });

  // Parameterized: verify all isolation types
  ALL_ISOLATION_TYPES.forEach((type) => {
    it(`IsolationRecord for type ${type} has correct shape`, () => {
      const iso = makeIso(tracker, 'p1', { type });
      expect(iso.type).toBe(type);
      expect(ALL_ISOLATION_STATUSES).toContain(iso.status);
    });
  });

  // Parameterized: 20 mixed records
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`type shape test ${i}`, () => {
      const p = makePermit(pm, {
        type: ALL_PERMIT_TYPES[i % ALL_PERMIT_TYPES.length],
        riskLevel: ALL_RISK_LEVELS[i % ALL_RISK_LEVELS.length],
      });
      const iso = makeIso(tracker, p.id, {
        type: ALL_ISOLATION_TYPES[i % ALL_ISOLATION_TYPES.length],
      });
      expect(p.id).toBeTruthy();
      expect(iso.id).toBeTruthy();
      expect(iso.permitId).toBe(p.id);
    });
  });
});
