// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { AuditPlanner } from '../audit-planner';
import { FindingTracker } from '../finding-tracker';
import {
  AuditType,
  AuditStatus,
  AuditScope,
  FindingSeverity,
  FindingStatus,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// AuditPlanner tests
// ─────────────────────────────────────────────────────────────────────────────

describe('AuditPlanner', () => {
  let planner: AuditPlanner;

  beforeEach(() => {
    planner = new AuditPlanner();
  });

  // ── plan() ──────────────────────────────────────────────────────────────────

  describe('plan()', () => {
    it('creates an audit with PLANNED status', () => {
      const audit = planner.plan(
        'INTERNAL',
        ['QUALITY'],
        'Q1 Internal Audit',
        'auditor-1',
        'dept-a',
        '2026-03-01',
        '2026-03-05',
        ['ISO 9001:2015'],
        ['Verify process compliance']
      );
      expect(audit.status).toBe('PLANNED');
    });

    it('returns an audit with a generated id', () => {
      const audit = planner.plan(
        'INTERNAL',
        ['QUALITY'],
        'Audit',
        'lead',
        'auditee',
        '2026-03-01',
        '2026-03-05',
        ['ISO 9001'],
        ['obj1']
      );
      expect(audit.id).toBeTruthy();
      expect(typeof audit.id).toBe('string');
    });

    it('stores the type correctly', () => {
      const audit = planner.plan(
        'EXTERNAL',
        ['QUALITY'],
        'Ext Audit',
        'lead',
        'auditee',
        '2026-03-01',
        '2026-03-05',
        ['ISO 9001'],
        ['obj1']
      );
      expect(audit.type).toBe('EXTERNAL');
    });

    it('stores multiple scopes', () => {
      const audit = planner.plan(
        'INTERNAL',
        ['QUALITY', 'ENVIRONMENT'],
        'Multi-scope',
        'lead',
        'auditee',
        '2026-03-01',
        '2026-03-05',
        ['ISO 9001'],
        ['obj1']
      );
      expect(audit.scope).toContain('QUALITY');
      expect(audit.scope).toContain('ENVIRONMENT');
    });

    it('stores auditTeam when provided', () => {
      const audit = planner.plan(
        'INTERNAL',
        ['QUALITY'],
        'Team Audit',
        'lead',
        'auditee',
        '2026-03-01',
        '2026-03-05',
        ['ISO 9001'],
        ['obj1'],
        ['member-1', 'member-2']
      );
      expect(audit.auditTeam).toContain('member-1');
      expect(audit.auditTeam).toContain('member-2');
    });

    it('defaults auditTeam to empty array when not provided', () => {
      const audit = planner.plan(
        'INTERNAL',
        ['QUALITY'],
        'Solo Audit',
        'lead',
        'auditee',
        '2026-03-01',
        '2026-03-05',
        ['ISO 9001'],
        ['obj1']
      );
      expect(audit.auditTeam).toEqual([]);
    });

    it('stores standardsReferenced', () => {
      const audit = planner.plan(
        'INTERNAL',
        ['QUALITY', 'ENVIRONMENT'],
        'IMS Audit',
        'lead',
        'auditee',
        '2026-03-01',
        '2026-03-05',
        ['ISO 9001:2015', 'ISO 14001:2015'],
        ['obj1']
      );
      expect(audit.standardsReferenced).toContain('ISO 9001:2015');
      expect(audit.standardsReferenced).toContain('ISO 14001:2015');
    });

    it('stores objectives', () => {
      const audit = planner.plan(
        'INTERNAL',
        ['QUALITY'],
        'Objective Audit',
        'lead',
        'auditee',
        '2026-03-01',
        '2026-03-05',
        ['ISO 9001'],
        ['Verify clause 7.1', 'Check records']
      );
      expect(audit.objectives).toContain('Verify clause 7.1');
      expect(audit.objectives).toContain('Check records');
    });

    it('stores plannedStartDate and plannedEndDate', () => {
      const audit = planner.plan(
        'INTERNAL',
        ['QUALITY'],
        'Date Audit',
        'lead',
        'auditee',
        '2026-04-01',
        '2026-04-10',
        ['ISO 9001'],
        ['obj']
      );
      expect(audit.plannedStartDate).toBe('2026-04-01');
      expect(audit.plannedEndDate).toBe('2026-04-10');
    });

    it('actualStartDate is undefined initially', () => {
      const audit = planner.plan(
        'INTERNAL',
        ['QUALITY'],
        'Audit',
        'lead',
        'auditee',
        '2026-03-01',
        '2026-03-05',
        ['ISO 9001'],
        ['obj']
      );
      expect(audit.actualStartDate).toBeUndefined();
    });

    it('actualEndDate is undefined initially', () => {
      const audit = planner.plan(
        'INTERNAL',
        ['QUALITY'],
        'Audit',
        'lead',
        'auditee',
        '2026-03-01',
        '2026-03-05',
        ['ISO 9001'],
        ['obj']
      );
      expect(audit.actualEndDate).toBeUndefined();
    });

    it('throws when title is empty', () => {
      expect(() =>
        planner.plan('INTERNAL', ['QUALITY'], '', 'lead', 'auditee', '2026-03-01', '2026-03-05', ['ISO'], ['obj'])
      ).toThrow();
    });

    it('throws when title is whitespace only', () => {
      expect(() =>
        planner.plan('INTERNAL', ['QUALITY'], '   ', 'lead', 'auditee', '2026-03-01', '2026-03-05', ['ISO'], ['obj'])
      ).toThrow();
    });

    it('throws when leadAuditor is empty', () => {
      expect(() =>
        planner.plan('INTERNAL', ['QUALITY'], 'Title', '', 'auditee', '2026-03-01', '2026-03-05', ['ISO'], ['obj'])
      ).toThrow();
    });

    it('throws when auditee is empty', () => {
      expect(() =>
        planner.plan('INTERNAL', ['QUALITY'], 'Title', 'lead', '', '2026-03-01', '2026-03-05', ['ISO'], ['obj'])
      ).toThrow();
    });

    it('throws when scope array is empty', () => {
      expect(() =>
        planner.plan('INTERNAL', [], 'Title', 'lead', 'auditee', '2026-03-01', '2026-03-05', ['ISO'], ['obj'])
      ).toThrow();
    });

    it('throws when objectives array is empty', () => {
      expect(() =>
        planner.plan('INTERNAL', ['QUALITY'], 'Title', 'lead', 'auditee', '2026-03-01', '2026-03-05', ['ISO'], [])
      ).toThrow();
    });

    it('increments count after plan', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A1', 'l', 'a', '2026-01-01', '2026-01-05', ['ISO'], ['o']);
      expect(planner.getCount()).toBe(1);
    });

    it('each call produces a unique id', () => {
      const a1 = planner.plan('INTERNAL', ['QUALITY'], 'A1', 'l', 'a', '2026-01-01', '2026-01-05', ['ISO'], ['o']);
      const a2 = planner.plan('INTERNAL', ['QUALITY'], 'A2', 'l', 'a', '2026-01-01', '2026-01-05', ['ISO'], ['o']);
      expect(a1.id).not.toBe(a2.id);
    });

    it('trims the title', () => {
      const audit = planner.plan(
        'INTERNAL',
        ['QUALITY'],
        '  My Audit  ',
        'lead',
        'auditee',
        '2026-03-01',
        '2026-03-05',
        ['ISO'],
        ['obj']
      );
      expect(audit.title).toBe('My Audit');
    });

    it('notes is undefined by default', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-01-01', '2026-01-05', ['ISO'], ['o']);
      expect(audit.notes).toBeUndefined();
    });
  });

  // ── All AuditType values ─────────────────────────────────────────────────

  describe('AuditType enum coverage', () => {
    const types: AuditType[] = ['INTERNAL', 'EXTERNAL', 'SUPPLIER', 'REGULATORY', 'CERTIFICATION'];

    types.forEach(type => {
      it(`plans audit of type ${type}`, () => {
        const audit = planner.plan(type, ['QUALITY'], `${type} audit`, 'lead', 'auditee', '2026-03-01', '2026-03-05', ['ISO'], ['obj']);
        expect(audit.type).toBe(type);
      });
    });
  });

  // ── All AuditScope values ────────────────────────────────────────────────

  describe('AuditScope enum coverage', () => {
    const scopes: AuditScope[] = ['QUALITY', 'ENVIRONMENT', 'HEALTH_SAFETY', 'INFORMATION_SECURITY', 'ENERGY', 'FOOD_SAFETY'];

    scopes.forEach(scope => {
      it(`plans audit with scope ${scope}`, () => {
        const audit = planner.plan('INTERNAL', [scope], `${scope} audit`, 'lead', 'auditee', '2026-03-01', '2026-03-05', ['ISO'], ['obj']);
        expect(audit.scope).toContain(scope);
      });
    });
  });

  // ── start() ─────────────────────────────────────────────────────────────

  describe('start()', () => {
    it('transitions PLANNED → IN_PROGRESS', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const started = planner.start(audit.id, '2026-03-01');
      expect(started.status).toBe('IN_PROGRESS');
    });

    it('sets actualStartDate', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const started = planner.start(audit.id, '2026-03-02');
      expect(started.actualStartDate).toBe('2026-03-02');
    });

    it('throws when audit not found', () => {
      expect(() => planner.start('nonexistent', '2026-03-01')).toThrow();
    });

    it('throws when status is COMPLETED', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.start(audit.id, '2026-03-01');
      planner.complete(audit.id, '2026-03-05');
      expect(() => planner.start(audit.id, '2026-03-06')).toThrow();
    });

    it('throws when status is CANCELLED', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.cancel(audit.id);
      expect(() => planner.start(audit.id, '2026-03-01')).toThrow();
    });

    it('throws when status is IN_PROGRESS', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.start(audit.id, '2026-03-01');
      expect(() => planner.start(audit.id, '2026-03-02')).toThrow();
    });

    it('allows starting a POSTPONED audit', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.postpone(audit.id, '2026-04-01', '2026-04-05');
      const started = planner.start(audit.id, '2026-04-01');
      expect(started.status).toBe('IN_PROGRESS');
    });

    it('returns the updated record', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const result = planner.start(audit.id, '2026-03-01');
      expect(result.id).toBe(audit.id);
    });
  });

  // ── complete() ──────────────────────────────────────────────────────────

  describe('complete()', () => {
    it('transitions IN_PROGRESS → COMPLETED', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.start(audit.id, '2026-03-01');
      const completed = planner.complete(audit.id, '2026-03-05');
      expect(completed.status).toBe('COMPLETED');
    });

    it('sets actualEndDate', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.start(audit.id, '2026-03-01');
      const completed = planner.complete(audit.id, '2026-03-05');
      expect(completed.actualEndDate).toBe('2026-03-05');
    });

    it('throws when audit not found', () => {
      expect(() => planner.complete('nonexistent', '2026-03-05')).toThrow();
    });

    it('throws when status is PLANNED', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      expect(() => planner.complete(audit.id, '2026-03-05')).toThrow();
    });

    it('throws when status is CANCELLED', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.cancel(audit.id);
      expect(() => planner.complete(audit.id, '2026-03-05')).toThrow();
    });

    it('throws when already COMPLETED', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.start(audit.id, '2026-03-01');
      planner.complete(audit.id, '2026-03-05');
      expect(() => planner.complete(audit.id, '2026-03-06')).toThrow();
    });
  });

  // ── cancel() ────────────────────────────────────────────────────────────

  describe('cancel()', () => {
    it('cancels a PLANNED audit', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const cancelled = planner.cancel(audit.id);
      expect(cancelled.status).toBe('CANCELLED');
    });

    it('cancels an IN_PROGRESS audit', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.start(audit.id, '2026-03-01');
      const cancelled = planner.cancel(audit.id);
      expect(cancelled.status).toBe('CANCELLED');
    });

    it('cancels a POSTPONED audit', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.postpone(audit.id, '2026-04-01', '2026-04-05');
      const cancelled = planner.cancel(audit.id);
      expect(cancelled.status).toBe('CANCELLED');
    });

    it('throws when audit not found', () => {
      expect(() => planner.cancel('nonexistent')).toThrow();
    });

    it('throws when already CANCELLED', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.cancel(audit.id);
      expect(() => planner.cancel(audit.id)).toThrow();
    });

    it('throws when already COMPLETED', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.start(audit.id, '2026-03-01');
      planner.complete(audit.id, '2026-03-05');
      expect(() => planner.cancel(audit.id)).toThrow();
    });
  });

  // ── postpone() ──────────────────────────────────────────────────────────

  describe('postpone()', () => {
    it('transitions PLANNED → POSTPONED', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const postponed = planner.postpone(audit.id, '2026-04-01', '2026-04-05');
      expect(postponed.status).toBe('POSTPONED');
    });

    it('updates plannedStartDate', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const postponed = planner.postpone(audit.id, '2026-04-01', '2026-04-05');
      expect(postponed.plannedStartDate).toBe('2026-04-01');
    });

    it('updates plannedEndDate', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const postponed = planner.postpone(audit.id, '2026-04-01', '2026-04-05');
      expect(postponed.plannedEndDate).toBe('2026-04-05');
    });

    it('throws when audit not found', () => {
      expect(() => planner.postpone('nonexistent', '2026-04-01', '2026-04-05')).toThrow();
    });

    it('throws when status is IN_PROGRESS', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.start(audit.id, '2026-03-01');
      expect(() => planner.postpone(audit.id, '2026-04-01', '2026-04-05')).toThrow();
    });

    it('throws when status is COMPLETED', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.start(audit.id, '2026-03-01');
      planner.complete(audit.id, '2026-03-05');
      expect(() => planner.postpone(audit.id, '2026-04-01', '2026-04-05')).toThrow();
    });

    it('throws when status is CANCELLED', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.cancel(audit.id);
      expect(() => planner.postpone(audit.id, '2026-04-01', '2026-04-05')).toThrow();
    });

    it('throws when already POSTPONED', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.postpone(audit.id, '2026-04-01', '2026-04-05');
      expect(() => planner.postpone(audit.id, '2026-05-01', '2026-05-05')).toThrow();
    });
  });

  // ── addAuditor() ─────────────────────────────────────────────────────────

  describe('addAuditor()', () => {
    it('adds an auditor to the team', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.addAuditor(audit.id, 'member-x');
      const fetched = planner.get(audit.id)!;
      expect(fetched.auditTeam).toContain('member-x');
    });

    it('can add multiple auditors', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.addAuditor(audit.id, 'member-1');
      planner.addAuditor(audit.id, 'member-2');
      const fetched = planner.get(audit.id)!;
      expect(fetched.auditTeam.length).toBe(2);
    });

    it('throws when audit not found', () => {
      expect(() => planner.addAuditor('nonexistent', 'member-1')).toThrow();
    });

    it('throws when auditorId is empty', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      expect(() => planner.addAuditor(audit.id, '')).toThrow();
    });

    it('trims the auditor id', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.addAuditor(audit.id, '  aud-1  ');
      const fetched = planner.get(audit.id)!;
      expect(fetched.auditTeam).toContain('aud-1');
    });
  });

  // ── get() ────────────────────────────────────────────────────────────────

  describe('get()', () => {
    it('returns the audit by id', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const fetched = planner.get(audit.id);
      expect(fetched).toBeDefined();
      expect(fetched!.id).toBe(audit.id);
    });

    it('returns undefined for unknown id', () => {
      expect(planner.get('unknown')).toBeUndefined();
    });
  });

  // ── getAll() ─────────────────────────────────────────────────────────────

  describe('getAll()', () => {
    it('returns empty array initially', () => {
      expect(planner.getAll()).toEqual([]);
    });

    it('returns all audits', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A1', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.plan('EXTERNAL', ['ENVIRONMENT'], 'A2', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      expect(planner.getAll().length).toBe(2);
    });

    it('returns correct count after multiple plans', () => {
      for (let i = 0; i < 5; i++) {
        planner.plan('INTERNAL', ['QUALITY'], `Audit ${i}`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      }
      expect(planner.getAll().length).toBe(5);
    });
  });

  // ── getByType() ───────────────────────────────────────────────────────────

  describe('getByType()', () => {
    it('filters by INTERNAL type', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'I1', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.plan('EXTERNAL', ['QUALITY'], 'E1', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const result = planner.getByType('INTERNAL');
      expect(result.every(a => a.type === 'INTERNAL')).toBe(true);
      expect(result.length).toBe(1);
    });

    it('returns empty for type with no audits', () => {
      expect(planner.getByType('REGULATORY')).toEqual([]);
    });

    const types: AuditType[] = ['INTERNAL', 'EXTERNAL', 'SUPPLIER', 'REGULATORY', 'CERTIFICATION'];
    types.forEach(type => {
      it(`getByType returns correct audits for ${type}`, () => {
        planner.plan(type, ['QUALITY'], `${type} audit`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        const result = planner.getByType(type);
        expect(result.some(a => a.type === type)).toBe(true);
      });
    });
  });

  // ── getByStatus() ─────────────────────────────────────────────────────────

  describe('getByStatus()', () => {
    it('returns PLANNED audits', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const result = planner.getByStatus('PLANNED');
      expect(result.length).toBe(1);
      expect(result[0].status).toBe('PLANNED');
    });

    it('returns IN_PROGRESS audits', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.start(audit.id, '2026-03-01');
      expect(planner.getByStatus('IN_PROGRESS').length).toBe(1);
    });

    it('returns COMPLETED audits', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.start(audit.id, '2026-03-01');
      planner.complete(audit.id, '2026-03-05');
      expect(planner.getByStatus('COMPLETED').length).toBe(1);
    });

    it('returns CANCELLED audits', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.cancel(audit.id);
      expect(planner.getByStatus('CANCELLED').length).toBe(1);
    });

    it('returns POSTPONED audits', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.postpone(audit.id, '2026-04-01', '2026-04-05');
      expect(planner.getByStatus('POSTPONED').length).toBe(1);
    });

    it('returns empty for status with no matches', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      expect(planner.getByStatus('CANCELLED').length).toBe(0);
    });

    const statuses: AuditStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'POSTPONED'];
    statuses.forEach(status => {
      it(`getByStatus returns correct type for ${status}`, () => {
        const results = planner.getByStatus(status);
        expect(Array.isArray(results)).toBe(true);
      });
    });
  });

  // ── getByAuditee() ───────────────────────────────────────────────────────

  describe('getByAuditee()', () => {
    it('returns audits for the specified auditee', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A1', 'l', 'dept-a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.plan('INTERNAL', ['QUALITY'], 'A2', 'l', 'dept-b', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const result = planner.getByAuditee('dept-a');
      expect(result.length).toBe(1);
      expect(result[0].auditee).toBe('dept-a');
    });

    it('returns empty when auditee has no audits', () => {
      expect(planner.getByAuditee('nonexistent')).toEqual([]);
    });

    it('returns multiple audits for same auditee', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A1', 'l', 'dept-a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.plan('EXTERNAL', ['ENVIRONMENT'], 'A2', 'l', 'dept-a', '2026-04-01', '2026-04-05', ['ISO'], ['o']);
      expect(planner.getByAuditee('dept-a').length).toBe(2);
    });
  });

  // ── getByLeadAuditor() ──────────────────────────────────────────────────

  describe('getByLeadAuditor()', () => {
    it('returns audits for the specified lead auditor', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A1', 'auditor-x', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.plan('INTERNAL', ['QUALITY'], 'A2', 'auditor-y', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const result = planner.getByLeadAuditor('auditor-x');
      expect(result.length).toBe(1);
      expect(result[0].leadAuditor).toBe('auditor-x');
    });

    it('returns empty for unknown auditor', () => {
      expect(planner.getByLeadAuditor('nobody')).toEqual([]);
    });

    it('returns multiple audits for same lead auditor', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A1', 'aud-1', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.plan('EXTERNAL', ['ENVIRONMENT'], 'A2', 'aud-1', 'b', '2026-04-01', '2026-04-05', ['ISO'], ['o']);
      expect(planner.getByLeadAuditor('aud-1').length).toBe(2);
    });
  });

  // ── getByScope() ─────────────────────────────────────────────────────────

  describe('getByScope()', () => {
    it('returns audits that include the given scope', () => {
      planner.plan('INTERNAL', ['QUALITY', 'ENVIRONMENT'], 'A1', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.plan('INTERNAL', ['HEALTH_SAFETY'], 'A2', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const result = planner.getByScope('QUALITY');
      expect(result.length).toBe(1);
    });

    it('returns empty when no audits have the scope', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      expect(planner.getByScope('ENERGY')).toEqual([]);
    });

    it('returns audit with exactly that scope', () => {
      planner.plan('INTERNAL', ['FOOD_SAFETY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const result = planner.getByScope('FOOD_SAFETY');
      expect(result.length).toBe(1);
    });

    const scopes: AuditScope[] = ['QUALITY', 'ENVIRONMENT', 'HEALTH_SAFETY', 'INFORMATION_SECURITY', 'ENERGY', 'FOOD_SAFETY'];
    scopes.forEach(scope => {
      it(`getByScope handles ${scope}`, () => {
        planner.plan('INTERNAL', [scope], `${scope} audit`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        const result = planner.getByScope(scope);
        expect(result.some(a => a.scope.includes(scope))).toBe(true);
      });
    });
  });

  // ── getOverdue() ─────────────────────────────────────────────────────────

  describe('getOverdue()', () => {
    it('returns PLANNED audits whose plannedEndDate < asOf', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-01-01', '2026-01-10', ['ISO'], ['o']);
      const result = planner.getOverdue('2026-02-01');
      expect(result.length).toBe(1);
    });

    it('does not return audits with plannedEndDate >= asOf', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      const result = planner.getOverdue('2026-02-01');
      expect(result.length).toBe(0);
    });

    it('does not return COMPLETED audits even if past end date', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-01-01', '2026-01-10', ['ISO'], ['o']);
      planner.start(audit.id, '2026-01-01');
      planner.complete(audit.id, '2026-01-10');
      expect(planner.getOverdue('2026-02-01').length).toBe(0);
    });

    it('does not return CANCELLED audits even if past end date', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-01-01', '2026-01-10', ['ISO'], ['o']);
      planner.cancel(audit.id);
      expect(planner.getOverdue('2026-02-01').length).toBe(0);
    });

    it('returns IN_PROGRESS audits that are overdue', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-01-01', '2026-01-10', ['ISO'], ['o']);
      planner.start(audit.id, '2026-01-01');
      expect(planner.getOverdue('2026-02-01').length).toBe(1);
    });

    it('does not return POSTPONED audits even if new end date is past', () => {
      const audit = planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      planner.postpone(audit.id, '2026-01-01', '2026-01-05');
      expect(planner.getOverdue('2026-02-01').length).toBe(0);
    });

    it('returns empty when no overdue audits', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-05-01', '2026-05-10', ['ISO'], ['o']);
      expect(planner.getOverdue('2026-02-01').length).toBe(0);
    });
  });

  // ── getCount() ───────────────────────────────────────────────────────────

  describe('getCount()', () => {
    it('returns 0 for empty planner', () => {
      expect(planner.getCount()).toBe(0);
    });

    it('returns 1 after one plan', () => {
      planner.plan('INTERNAL', ['QUALITY'], 'A', 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
      expect(planner.getCount()).toBe(1);
    });

    Array.from({ length: 10 }, (_, i) => i + 2).forEach(n => {
      it(`returns ${n} after ${n} plans`, () => {
        for (let k = 0; k < n; k++) {
          planner.plan('INTERNAL', ['QUALITY'], `A${k}`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        }
        expect(planner.getCount()).toBe(n);
      });
    });
  });

  // ── Parameterized bulk plan tests ────────────────────────────────────────

  describe('bulk plan parameterized tests', () => {
    const types: AuditType[] = ['INTERNAL', 'EXTERNAL', 'SUPPLIER', 'REGULATORY', 'CERTIFICATION'];
    const scopes: AuditScope[] = ['QUALITY', 'ENVIRONMENT', 'HEALTH_SAFETY', 'INFORMATION_SECURITY', 'ENERGY', 'FOOD_SAFETY'];

    Array.from({ length: 50 }, (_, i) => i).forEach(i => {
      it(`plan bulk test #${i}: creates audit with id`, () => {
        const type = types[i % types.length];
        const scope = scopes[i % scopes.length];
        const audit = planner.plan(
          type,
          [scope],
          `Bulk Audit ${i}`,
          `lead-${i}`,
          `dept-${i % 10}`,
          '2026-03-01',
          '2026-03-10',
          ['ISO 9001'],
          [`Objective ${i}`]
        );
        expect(audit.id).toBeTruthy();
        expect(audit.type).toBe(type);
        expect(audit.scope).toContain(scope);
        expect(audit.status).toBe('PLANNED');
        expect(audit.title).toBe(`Bulk Audit ${i}`);
      });
    });
  });

  // ── Status transition cycle tests ────────────────────────────────────────

  describe('full lifecycle transitions', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`lifecycle test #${i}: PLANNED → IN_PROGRESS → COMPLETED`, () => {
        const audit = planner.plan('INTERNAL', ['QUALITY'], `Lifecycle ${i}`, 'l', 'a', '2026-03-01', '2026-03-10', ['ISO'], ['obj']);
        expect(audit.status).toBe('PLANNED');
        const started = planner.start(audit.id, '2026-03-01');
        expect(started.status).toBe('IN_PROGRESS');
        const completed = planner.complete(audit.id, '2026-03-10');
        expect(completed.status).toBe('COMPLETED');
      });
    });

    Array.from({ length: 10 }, (_, i) => i).forEach(i => {
      it(`postpone then start lifecycle #${i}`, () => {
        const audit = planner.plan('INTERNAL', ['QUALITY'], `Postpone ${i}`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['obj']);
        planner.postpone(audit.id, '2026-04-01', '2026-04-10');
        expect(planner.get(audit.id)!.status).toBe('POSTPONED');
        const started = planner.start(audit.id, '2026-04-01');
        expect(started.status).toBe('IN_PROGRESS');
      });
    });

    Array.from({ length: 10 }, (_, i) => i).forEach(i => {
      it(`cancel test #${i}: PLANNED → CANCELLED`, () => {
        const audit = planner.plan('INTERNAL', ['QUALITY'], `Cancel ${i}`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['obj']);
        const cancelled = planner.cancel(audit.id);
        expect(cancelled.status).toBe('CANCELLED');
      });
    });
  });

  // ── Multiple scope audits ─────────────────────────────────────────────────

  describe('multi-scope audits', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`multi-scope test #${i}`, () => {
        const scopes: AuditScope[] = ['QUALITY', 'ENVIRONMENT', 'HEALTH_SAFETY'];
        const audit = planner.plan('INTERNAL', scopes, `IMS Audit ${i}`, 'l', 'a', '2026-03-01', '2026-03-10', ['ISO 9001', 'ISO 14001', 'ISO 45001'], ['obj1', 'obj2']);
        expect(audit.scope.length).toBe(3);
        expect(audit.standardsReferenced.length).toBe(3);
        expect(audit.objectives.length).toBe(2);
      });
    });
  });

  // ── addAuditor mass tests ─────────────────────────────────────────────────

  describe('addAuditor mass tests', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`addAuditor test #${i}`, () => {
        const audit = planner.plan('INTERNAL', ['QUALITY'], `A${i}`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        planner.addAuditor(audit.id, `extra-aud-${i}`);
        const fetched = planner.get(audit.id)!;
        expect(fetched.auditTeam).toContain(`extra-aud-${i}`);
      });
    });
  });

  // ── Error message tests ───────────────────────────────────────────────────

  describe('error message tests', () => {
    it('start not found error contains id', () => {
      try {
        planner.start('bad-id', '2026-03-01');
      } catch (e: unknown) {
        expect((e as Error).message).toContain('bad-id');
      }
    });

    it('complete not found error contains id', () => {
      try {
        planner.complete('bad-id', '2026-03-05');
      } catch (e: unknown) {
        expect((e as Error).message).toContain('bad-id');
      }
    });

    it('cancel not found error contains id', () => {
      try {
        planner.cancel('bad-id');
      } catch (e: unknown) {
        expect((e as Error).message).toContain('bad-id');
      }
    });

    it('postpone not found error contains id', () => {
      try {
        planner.postpone('bad-id', '2026-04-01', '2026-04-05');
      } catch (e: unknown) {
        expect((e as Error).message).toContain('bad-id');
      }
    });

    it('addAuditor not found error contains id', () => {
      try {
        planner.addAuditor('bad-id', 'member');
      } catch (e: unknown) {
        expect((e as Error).message).toContain('bad-id');
      }
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FindingTracker tests
// ─────────────────────────────────────────────────────────────────────────────

describe('FindingTracker', () => {
  let tracker: FindingTracker;

  beforeEach(() => {
    tracker = new FindingTracker();
  });

  // ── raise() ───────────────────────────────────────────────────────────────

  describe('raise()', () => {
    it('creates a finding with OPEN status', () => {
      const f = tracker.raise('aud-1', 'OBSERVATION', 'Clause 4.1', 'Context not fully defined', 'Process doc review', 'auditor-1', '2026-03-01');
      expect(f.status).toBe('OPEN');
    });

    it('generates a unique id', () => {
      const f = tracker.raise('aud-1', 'OBSERVATION', 'Clause 4.1', 'Desc', 'Evidence', 'aud', '2026-03-01');
      expect(f.id).toBeTruthy();
      expect(typeof f.id).toBe('string');
    });

    it('stores auditId', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'Clause 6.1', 'Risk process incomplete', 'Records review', 'aud', '2026-03-01');
      expect(f.auditId).toBe('aud-1');
    });

    it('stores severity', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'Clause 8.1', 'Critical process gap', 'Obs', 'aud', '2026-03-01');
      expect(f.severity).toBe('MAJOR_NC');
    });

    it('stores clauseReference', () => {
      const f = tracker.raise('aud-1', 'OBSERVATION', 'Clause 9.3', 'Management review frequency', 'Minutes', 'aud', '2026-03-01');
      expect(f.clauseReference).toBe('Clause 9.3');
    });

    it('stores description', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'Clause 5.1', 'Leadership commitment evidence lacking', 'Interviews', 'aud', '2026-03-01');
      expect(f.description).toBe('Leadership commitment evidence lacking');
    });

    it('stores evidence', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'Clause 7.2', 'Competence records incomplete', 'Training records', 'aud', '2026-03-01');
      expect(f.evidence).toBe('Training records');
    });

    it('stores raisedBy', () => {
      const f = tracker.raise('aud-1', 'OBSERVATION', 'Clause 10.1', 'Improvement not tracked', 'Action log', 'auditor-lead', '2026-03-01');
      expect(f.raisedBy).toBe('auditor-lead');
    });

    it('stores raisedAt', () => {
      const f = tracker.raise('aud-1', 'OBSERVATION', 'Clause 4.1', 'Desc', 'Evidence', 'aud', '2026-03-15');
      expect(f.raisedAt).toBe('2026-03-15');
    });

    it('stores responseDeadline when provided', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'Clause 8.1', 'Desc', 'Evidence', 'aud', '2026-03-01', '2026-03-30');
      expect(f.responseDeadline).toBe('2026-03-30');
    });

    it('responseDeadline is undefined when not provided', () => {
      const f = tracker.raise('aud-1', 'OBSERVATION', 'Clause 4.1', 'Desc', 'Evidence', 'aud', '2026-03-01');
      expect(f.responseDeadline).toBeUndefined();
    });

    it('response is undefined initially', () => {
      const f = tracker.raise('aud-1', 'OBSERVATION', 'Clause 4.1', 'Desc', 'Evidence', 'aud', '2026-03-01');
      expect(f.response).toBeUndefined();
    });

    it('capaId is undefined initially', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'Clause 8.1', 'Desc', 'Evidence', 'aud', '2026-03-01');
      expect(f.capaId).toBeUndefined();
    });

    it('each finding has a unique id', () => {
      const f1 = tracker.raise('aud-1', 'OBSERVATION', 'C1', 'D1', 'E1', 'a', '2026-03-01');
      const f2 = tracker.raise('aud-1', 'MINOR_NC', 'C2', 'D2', 'E2', 'a', '2026-03-01');
      expect(f1.id).not.toBe(f2.id);
    });

    it('throws when auditId is empty', () => {
      expect(() => tracker.raise('', 'OBSERVATION', 'C', 'D', 'E', 'a', '2026-03-01')).toThrow();
    });

    it('throws when clauseReference is empty', () => {
      expect(() => tracker.raise('aud-1', 'OBSERVATION', '', 'D', 'E', 'a', '2026-03-01')).toThrow();
    });

    it('throws when description is empty', () => {
      expect(() => tracker.raise('aud-1', 'OBSERVATION', 'C', '', 'E', 'a', '2026-03-01')).toThrow();
    });

    it('throws when evidence is empty', () => {
      expect(() => tracker.raise('aud-1', 'OBSERVATION', 'C', 'D', '', 'a', '2026-03-01')).toThrow();
    });

    it('throws when raisedBy is empty', () => {
      expect(() => tracker.raise('aud-1', 'OBSERVATION', 'C', 'D', 'E', '', '2026-03-01')).toThrow();
    });

    it('increments count after raise', () => {
      tracker.raise('aud-1', 'OBSERVATION', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(tracker.getCount()).toBe(1);
    });
  });

  // ── FindingSeverity enum coverage ────────────────────────────────────────

  describe('FindingSeverity enum coverage', () => {
    const severities: FindingSeverity[] = ['OBSERVATION', 'MINOR_NC', 'MAJOR_NC', 'CRITICAL_NC'];
    severities.forEach(severity => {
      it(`raises finding with severity ${severity}`, () => {
        const f = tracker.raise('aud-1', severity, 'Clause 1', `Desc ${severity}`, 'Evidence', 'aud', '2026-03-01');
        expect(f.severity).toBe(severity);
      });
    });
  });

  // ── respond() ────────────────────────────────────────────────────────────

  describe('respond()', () => {
    it('transitions OPEN → RESPONDED', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      const responded = tracker.respond(f.id, 'Action taken: process updated', '2026-03-10');
      expect(responded.status).toBe('RESPONDED');
    });

    it('stores the response text', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Corrective action implemented', '2026-03-10');
      const fetched = tracker.getByAudit('aud-1')[0];
      expect(fetched.response).toBe('Corrective action implemented');
    });

    it('stores respondedAt', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Fixed', '2026-03-15');
      const fetched = tracker.getByAudit('aud-1')[0];
      expect(fetched.respondedAt).toBe('2026-03-15');
    });

    it('throws when finding not found', () => {
      expect(() => tracker.respond('nonexistent', 'response', '2026-03-10')).toThrow();
    });

    it('throws when response is empty', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(() => tracker.respond(f.id, '', '2026-03-10')).toThrow();
    });

    it('throws when status is RESPONDED', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      expect(() => tracker.respond(f.id, 'Another response', '2026-03-11')).toThrow();
    });

    it('throws when status is CLOSED', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      tracker.verify(f.id, 'verifier', '2026-03-20');
      tracker.close(f.id, '2026-03-25');
      expect(() => tracker.respond(f.id, 'Late response', '2026-03-26')).toThrow();
    });

    it('allows responding to OVERDUE finding', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01', '2026-03-10');
      tracker.markOverdue(f.id);
      const responded = tracker.respond(f.id, 'Late but responded', '2026-03-15');
      expect(responded.status).toBe('RESPONDED');
    });
  });

  // ── verify() ─────────────────────────────────────────────────────────────

  describe('verify()', () => {
    it('transitions RESPONDED → VERIFIED', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      const verified = tracker.verify(f.id, 'verifier-1', '2026-03-20');
      expect(verified.status).toBe('VERIFIED');
    });

    it('stores verifiedBy', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      tracker.verify(f.id, 'lead-auditor', '2026-03-20');
      const fetched = tracker.getByAudit('aud-1')[0];
      expect(fetched.verifiedBy).toBe('lead-auditor');
    });

    it('stores verifiedAt', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      tracker.verify(f.id, 'verifier', '2026-03-22');
      const fetched = tracker.getByAudit('aud-1')[0];
      expect(fetched.verifiedAt).toBe('2026-03-22');
    });

    it('throws when finding not found', () => {
      expect(() => tracker.verify('nonexistent', 'verifier', '2026-03-20')).toThrow();
    });

    it('throws when status is OPEN', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(() => tracker.verify(f.id, 'verifier', '2026-03-20')).toThrow();
    });

    it('throws when status is CLOSED', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      tracker.verify(f.id, 'verifier', '2026-03-20');
      tracker.close(f.id, '2026-03-25');
      expect(() => tracker.verify(f.id, 'verifier', '2026-03-26')).toThrow();
    });

    it('throws when verifiedBy is empty', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      expect(() => tracker.verify(f.id, '', '2026-03-20')).toThrow();
    });
  });

  // ── close() ──────────────────────────────────────────────────────────────

  describe('close()', () => {
    it('transitions VERIFIED → CLOSED', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      tracker.verify(f.id, 'verifier', '2026-03-20');
      const closed = tracker.close(f.id, '2026-03-25');
      expect(closed.status).toBe('CLOSED');
    });

    it('stores closedAt', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      tracker.verify(f.id, 'verifier', '2026-03-20');
      tracker.close(f.id, '2026-03-28');
      const fetched = tracker.getByAudit('aud-1')[0];
      expect(fetched.closedAt).toBe('2026-03-28');
    });

    it('throws when finding not found', () => {
      expect(() => tracker.close('nonexistent', '2026-03-25')).toThrow();
    });

    it('throws when status is OPEN', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(() => tracker.close(f.id, '2026-03-25')).toThrow();
    });

    it('throws when status is RESPONDED', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      expect(() => tracker.close(f.id, '2026-03-25')).toThrow();
    });

    it('throws when status is CANCELLED (already CLOSED)', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      tracker.verify(f.id, 'verifier', '2026-03-20');
      tracker.close(f.id, '2026-03-25');
      expect(() => tracker.close(f.id, '2026-03-30')).toThrow();
    });
  });

  // ── markOverdue() ─────────────────────────────────────────────────────────

  describe('markOverdue()', () => {
    it('transitions OPEN → OVERDUE', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01', '2026-03-15');
      const overdue = tracker.markOverdue(f.id);
      expect(overdue.status).toBe('OVERDUE');
    });

    it('throws when finding not found', () => {
      expect(() => tracker.markOverdue('nonexistent')).toThrow();
    });

    it('throws when status is RESPONDED', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      expect(() => tracker.markOverdue(f.id)).toThrow();
    });

    it('throws when status is VERIFIED', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      tracker.verify(f.id, 'verifier', '2026-03-20');
      expect(() => tracker.markOverdue(f.id)).toThrow();
    });

    it('throws when status is CLOSED', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      tracker.verify(f.id, 'verifier', '2026-03-20');
      tracker.close(f.id, '2026-03-25');
      expect(() => tracker.markOverdue(f.id)).toThrow();
    });

    it('throws when already OVERDUE', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01', '2026-03-15');
      tracker.markOverdue(f.id);
      expect(() => tracker.markOverdue(f.id)).toThrow();
    });
  });

  // ── linkCAPA() ────────────────────────────────────────────────────────────

  describe('linkCAPA()', () => {
    it('sets capaId on a finding', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      const updated = tracker.linkCAPA(f.id, 'CAPA-001');
      expect(updated.capaId).toBe('CAPA-001');
    });

    it('throws when finding not found', () => {
      expect(() => tracker.linkCAPA('nonexistent', 'CAPA-001')).toThrow();
    });

    it('throws when capaId is empty', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(() => tracker.linkCAPA(f.id, '')).toThrow();
    });

    it('can link CAPA to any status finding', () => {
      const f = tracker.raise('aud-1', 'CRITICAL_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      const updated = tracker.linkCAPA(f.id, 'CAPA-002');
      expect(updated.capaId).toBe('CAPA-002');
    });

    it('overwrites existing capaId', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.linkCAPA(f.id, 'CAPA-001');
      tracker.linkCAPA(f.id, 'CAPA-002');
      const fetched = tracker.getByAudit('aud-1')[0];
      expect(fetched.capaId).toBe('CAPA-002');
    });

    it('trims capaId', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.linkCAPA(f.id, '  CAPA-003  ');
      const fetched = tracker.getByAudit('aud-1')[0];
      expect(fetched.capaId).toBe('CAPA-003');
    });
  });

  // ── getByAudit() ──────────────────────────────────────────────────────────

  describe('getByAudit()', () => {
    it('returns findings for a given audit', () => {
      tracker.raise('aud-1', 'OBSERVATION', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.raise('aud-1', 'MINOR_NC', 'C2', 'D2', 'E2', 'a', '2026-03-01');
      tracker.raise('aud-2', 'MAJOR_NC', 'C3', 'D3', 'E3', 'a', '2026-03-01');
      const result = tracker.getByAudit('aud-1');
      expect(result.length).toBe(2);
      expect(result.every(f => f.auditId === 'aud-1')).toBe(true);
    });

    it('returns empty array for unknown audit', () => {
      expect(tracker.getByAudit('aud-unknown')).toEqual([]);
    });

    it('returns all findings for an audit', () => {
      for (let i = 0; i < 5; i++) {
        tracker.raise('aud-x', 'OBSERVATION', `C${i}`, `D${i}`, `E${i}`, 'a', '2026-03-01');
      }
      expect(tracker.getByAudit('aud-x').length).toBe(5);
    });
  });

  // ── getBySeverity() ───────────────────────────────────────────────────────

  describe('getBySeverity()', () => {
    it('filters by OBSERVATION', () => {
      tracker.raise('aud-1', 'OBSERVATION', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.raise('aud-1', 'MAJOR_NC', 'C2', 'D2', 'E2', 'a', '2026-03-01');
      expect(tracker.getBySeverity('OBSERVATION').length).toBe(1);
    });

    it('filters by MINOR_NC', () => {
      tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.raise('aud-1', 'MAJOR_NC', 'C2', 'D2', 'E2', 'a', '2026-03-01');
      expect(tracker.getBySeverity('MINOR_NC').length).toBe(1);
    });

    it('filters by MAJOR_NC', () => {
      tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(tracker.getBySeverity('MAJOR_NC').length).toBe(1);
    });

    it('filters by CRITICAL_NC', () => {
      tracker.raise('aud-1', 'CRITICAL_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(tracker.getBySeverity('CRITICAL_NC').length).toBe(1);
    });

    it('returns empty for severity with no findings', () => {
      expect(tracker.getBySeverity('CRITICAL_NC')).toEqual([]);
    });

    const severities: FindingSeverity[] = ['OBSERVATION', 'MINOR_NC', 'MAJOR_NC', 'CRITICAL_NC'];
    severities.forEach(severity => {
      it(`getBySeverity correctness for ${severity}`, () => {
        const f = tracker.raise('aud-1', severity, 'C', `Desc ${severity}`, 'E', 'a', '2026-03-01');
        const result = tracker.getBySeverity(severity);
        expect(result.some(r => r.id === f.id)).toBe(true);
      });
    });
  });

  // ── getByStatus() ─────────────────────────────────────────────────────────

  describe('getByStatus()', () => {
    it('returns OPEN findings', () => {
      tracker.raise('aud-1', 'OBSERVATION', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(tracker.getByStatus('OPEN').length).toBe(1);
    });

    it('returns RESPONDED findings', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      expect(tracker.getByStatus('RESPONDED').length).toBe(1);
    });

    it('returns VERIFIED findings', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      tracker.verify(f.id, 'verifier', '2026-03-20');
      expect(tracker.getByStatus('VERIFIED').length).toBe(1);
    });

    it('returns CLOSED findings', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      tracker.verify(f.id, 'verifier', '2026-03-20');
      tracker.close(f.id, '2026-03-25');
      expect(tracker.getByStatus('CLOSED').length).toBe(1);
    });

    it('returns OVERDUE findings', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01', '2026-03-15');
      tracker.markOverdue(f.id);
      expect(tracker.getByStatus('OVERDUE').length).toBe(1);
    });

    it('returns empty for status with no matches', () => {
      tracker.raise('aud-1', 'OBSERVATION', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(tracker.getByStatus('CLOSED').length).toBe(0);
    });

    const statuses: FindingStatus[] = ['OPEN', 'RESPONDED', 'VERIFIED', 'CLOSED', 'OVERDUE'];
    statuses.forEach(status => {
      it(`getByStatus returns array for ${status}`, () => {
        expect(Array.isArray(tracker.getByStatus(status))).toBe(true);
      });
    });
  });

  // ── getOpen() ─────────────────────────────────────────────────────────────

  describe('getOpen()', () => {
    it('returns only OPEN findings', () => {
      const f1 = tracker.raise('aud-1', 'OBSERVATION', 'C1', 'D1', 'E1', 'a', '2026-03-01');
      const f2 = tracker.raise('aud-1', 'MINOR_NC', 'C2', 'D2', 'E2', 'a', '2026-03-01');
      tracker.respond(f2.id, 'Response', '2026-03-10');
      const open = tracker.getOpen();
      expect(open.length).toBe(1);
      expect(open[0].id).toBe(f1.id);
    });

    it('returns empty when no open findings', () => {
      const f = tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.respond(f.id, 'Response', '2026-03-10');
      expect(tracker.getOpen()).toEqual([]);
    });

    it('does not include OVERDUE in getOpen()', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01', '2026-03-05');
      tracker.markOverdue(f.id);
      expect(tracker.getOpen().length).toBe(0);
    });
  });

  // ── getMajorOrCritical() ──────────────────────────────────────────────────

  describe('getMajorOrCritical()', () => {
    it('returns MAJOR_NC findings', () => {
      tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(tracker.getMajorOrCritical().length).toBe(1);
    });

    it('returns CRITICAL_NC findings', () => {
      tracker.raise('aud-1', 'CRITICAL_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(tracker.getMajorOrCritical().length).toBe(1);
    });

    it('does not return OBSERVATION findings', () => {
      tracker.raise('aud-1', 'OBSERVATION', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(tracker.getMajorOrCritical().length).toBe(0);
    });

    it('does not return MINOR_NC findings', () => {
      tracker.raise('aud-1', 'MINOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(tracker.getMajorOrCritical().length).toBe(0);
    });

    it('returns both MAJOR and CRITICAL together', () => {
      tracker.raise('aud-1', 'MAJOR_NC', 'C1', 'D1', 'E1', 'a', '2026-03-01');
      tracker.raise('aud-1', 'CRITICAL_NC', 'C2', 'D2', 'E2', 'a', '2026-03-01');
      expect(tracker.getMajorOrCritical().length).toBe(2);
    });

    it('returns empty when no major or critical', () => {
      tracker.raise('aud-1', 'OBSERVATION', 'C', 'D', 'E', 'a', '2026-03-01');
      tracker.raise('aud-1', 'MINOR_NC', 'C2', 'D2', 'E2', 'a', '2026-03-01');
      expect(tracker.getMajorOrCritical().length).toBe(0);
    });
  });

  // ── getUnresponsed() ─────────────────────────────────────────────────────

  describe('getUnresponsed()', () => {
    it('returns OPEN findings with overdue responseDeadline', () => {
      tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01', '2026-03-10');
      const result = tracker.getUnresponsed('2026-03-15');
      expect(result.length).toBe(1);
    });

    it('does not return findings without responseDeadline', () => {
      tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01');
      const result = tracker.getUnresponsed('2026-03-15');
      expect(result.length).toBe(0);
    });

    it('does not return findings with responseDeadline >= asOf', () => {
      tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01', '2026-04-01');
      const result = tracker.getUnresponsed('2026-03-15');
      expect(result.length).toBe(0);
    });

    it('does not return already responded findings', () => {
      const f = tracker.raise('aud-1', 'MAJOR_NC', 'C', 'D', 'E', 'a', '2026-03-01', '2026-03-10');
      tracker.respond(f.id, 'Response', '2026-03-12');
      const result = tracker.getUnresponsed('2026-03-15');
      expect(result.length).toBe(0);
    });

    it('returns multiple unresponsed findings', () => {
      tracker.raise('aud-1', 'MAJOR_NC', 'C1', 'D1', 'E1', 'a', '2026-03-01', '2026-03-10');
      tracker.raise('aud-1', 'CRITICAL_NC', 'C2', 'D2', 'E2', 'a', '2026-03-01', '2026-03-08');
      const result = tracker.getUnresponsed('2026-03-15');
      expect(result.length).toBe(2);
    });
  });

  // ── getCount() ────────────────────────────────────────────────────────────

  describe('getCount()', () => {
    it('returns 0 initially', () => {
      expect(tracker.getCount()).toBe(0);
    });

    it('returns 1 after one raise', () => {
      tracker.raise('aud-1', 'OBSERVATION', 'C', 'D', 'E', 'a', '2026-03-01');
      expect(tracker.getCount()).toBe(1);
    });

    Array.from({ length: 10 }, (_, i) => i + 2).forEach(n => {
      it(`returns ${n} after ${n} findings raised`, () => {
        for (let k = 0; k < n; k++) {
          tracker.raise(`aud-${k % 3}`, 'OBSERVATION', `C${k}`, `D${k}`, `E${k}`, 'a', '2026-03-01');
        }
        expect(tracker.getCount()).toBe(n);
      });
    });
  });

  // ── Full lifecycle tests ──────────────────────────────────────────────────

  describe('full finding lifecycle', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`full lifecycle #${i}: OPEN → RESPONDED → VERIFIED → CLOSED`, () => {
        const f = tracker.raise(`aud-${i % 5}`, 'MINOR_NC', `Clause ${i}.1`, `Finding ${i}`, `Evidence ${i}`, 'auditor', '2026-03-01');
        expect(f.status).toBe('OPEN');
        tracker.respond(f.id, `Response ${i}`, '2026-03-10');
        expect(tracker.getByAudit(`aud-${i % 5}`).find(x => x.id === f.id)!.status).toBe('RESPONDED');
        tracker.verify(f.id, 'lead-verifier', '2026-03-20');
        expect(tracker.getByStatus('VERIFIED').some(x => x.id === f.id)).toBe(true);
        tracker.close(f.id, '2026-03-25');
        expect(tracker.getByStatus('CLOSED').some(x => x.id === f.id)).toBe(true);
      });
    });
  });

  // ── Mixed audit findings tests ────────────────────────────────────────────

  describe('multi-audit scenarios', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`multi-audit finding test #${i}`, () => {
        const auditId = `aud-${i}`;
        const f1 = tracker.raise(auditId, 'OBSERVATION', 'C1', 'D1', 'E1', 'a', '2026-03-01');
        const f2 = tracker.raise(auditId, 'MAJOR_NC', 'C2', 'D2', 'E2', 'a', '2026-03-01');
        const f3 = tracker.raise(`other-${i}`, 'MINOR_NC', 'C3', 'D3', 'E3', 'a', '2026-03-01');
        const byAudit = tracker.getByAudit(auditId);
        expect(byAudit.length).toBe(2);
        expect(byAudit.map(f => f.id)).toContain(f1.id);
        expect(byAudit.map(f => f.id)).toContain(f2.id);
        expect(byAudit.map(f => f.id)).not.toContain(f3.id);
      });
    });
  });

  // ── Parameterized bulk raise tests ───────────────────────────────────────

  describe('bulk raise parameterized tests', () => {
    const severities: FindingSeverity[] = ['OBSERVATION', 'MINOR_NC', 'MAJOR_NC', 'CRITICAL_NC'];

    Array.from({ length: 50 }, (_, i) => i).forEach(i => {
      it(`bulk raise test #${i}: stores correct data`, () => {
        const severity = severities[i % severities.length];
        const f = tracker.raise(
          `aud-bulk-${i % 10}`,
          severity,
          `ISO 9001:2015 clause ${(i % 10) + 1}.${i % 5}`,
          `Non-conformance description for finding ${i}`,
          `Evidence from document review ${i}`,
          `auditor-${i % 5}`,
          '2026-03-01',
          i % 2 === 0 ? '2026-03-30' : undefined
        );
        expect(f.severity).toBe(severity);
        expect(f.auditId).toBe(`aud-bulk-${i % 10}`);
        expect(f.status).toBe('OPEN');
        if (i % 2 === 0) {
          expect(f.responseDeadline).toBe('2026-03-30');
        } else {
          expect(f.responseDeadline).toBeUndefined();
        }
      });
    });
  });

  // ── CAPA linkage tests ────────────────────────────────────────────────────

  describe('CAPA linkage parameterized tests', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`CAPA linkage test #${i}`, () => {
        const f = tracker.raise(`aud-${i}`, 'MAJOR_NC', `C${i}`, `D${i}`, `E${i}`, 'a', '2026-03-01');
        const capaId = `CAPA-2026-${String(i + 1).padStart(3, '0')}`;
        const updated = tracker.linkCAPA(f.id, capaId);
        expect(updated.capaId).toBe(capaId);
        expect(tracker.getByAudit(`aud-${i}`)[0].capaId).toBe(capaId);
      });
    });
  });

  // ── Error handling comprehensive tests ───────────────────────────────────

  describe('comprehensive error handling', () => {
    it('respond throws with correct message for unknown id', () => {
      expect(() => tracker.respond('missing', 'R', '2026-03-01')).toThrow();
    });

    it('verify throws with correct message for unknown id', () => {
      expect(() => tracker.verify('missing', 'v', '2026-03-01')).toThrow();
    });

    it('close throws with correct message for unknown id', () => {
      expect(() => tracker.close('missing', '2026-03-01')).toThrow();
    });

    it('markOverdue throws with correct message for unknown id', () => {
      expect(() => tracker.markOverdue('missing')).toThrow();
    });

    it('linkCAPA throws with correct message for unknown id', () => {
      expect(() => tracker.linkCAPA('missing', 'CAPA-001')).toThrow();
    });

    Array.from({ length: 10 }, (_, i) => i).forEach(i => {
      it(`error test #${i}: operate on nonexistent finding ${i}`, () => {
        expect(() => tracker.respond(`fake-${i}`, 'R', '2026-03-01')).toThrow();
        expect(() => tracker.verify(`fake-${i}`, 'v', '2026-03-01')).toThrow();
        expect(() => tracker.close(`fake-${i}`, '2026-03-01')).toThrow();
        expect(() => tracker.markOverdue(`fake-${i}`)).toThrow();
        expect(() => tracker.linkCAPA(`fake-${i}`, 'CAPA-X')).toThrow();
      });
    });
  });

  // ── getUnresponsed boundary tests ────────────────────────────────────────

  describe('getUnresponsed boundary date tests', () => {
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`boundary test #${i}: deadline exactly matches asOf`, () => {
        const deadline = `2026-03-${String(i + 10).padStart(2, '0')}`;
        const asOf = deadline; // same date
        tracker.raise('aud-1', 'MAJOR_NC', 'C', `D${i}`, 'E', 'a', '2026-03-01', deadline);
        // deadline < asOf is false when equal, so should NOT return
        const result = tracker.getUnresponsed(asOf);
        expect(result.length).toBe(0);
      });
    });
  });

  // ── getOverdue boundary tests (via planner) ───────────────────────────────

  describe('mixed planner and tracker integration', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`integration test #${i}: planner + tracker combined`, () => {
        const lp = new AuditPlanner();
        const lt = new FindingTracker();

        const audit = lp.plan(
          'INTERNAL',
          ['QUALITY'],
          `Audit ${i}`,
          `lead-${i}`,
          `dept-${i % 5}`,
          '2026-03-01',
          '2026-03-10',
          ['ISO 9001:2015'],
          [`Verify clause ${i}`]
        );

        const finding = lt.raise(
          audit.id,
          'MINOR_NC',
          `Clause ${i}.1`,
          `Description ${i}`,
          `Evidence ${i}`,
          `lead-${i}`,
          '2026-03-02',
          '2026-03-20'
        );

        lp.start(audit.id, '2026-03-01');
        lt.respond(finding.id, `Response to finding ${i}`, '2026-03-15');
        lt.verify(finding.id, `lead-${i}`, '2026-03-18');
        lt.close(finding.id, '2026-03-20');
        lp.complete(audit.id, '2026-03-10');

        expect(lp.get(audit.id)!.status).toBe('COMPLETED');
        expect(lt.getByAudit(audit.id)[0].status).toBe('CLOSED');
        expect(lt.getCount()).toBe(1);
        expect(lp.getCount()).toBe(1);
      });
    });
  });

  // ── Additional bulk lifecycle tests ──────────────────────────────────────

  describe('overdue then respond lifecycle', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`overdue → respond lifecycle #${i}`, () => {
        const f = tracker.raise(`aud-ov-${i}`, 'CRITICAL_NC', `C${i}`, `Overdue desc ${i}`, `E${i}`, 'a', '2026-03-01', '2026-03-10');
        tracker.markOverdue(f.id);
        expect(tracker.getByStatus('OVERDUE').some(x => x.id === f.id)).toBe(true);
        tracker.respond(f.id, `Late response ${i}`, '2026-03-20');
        expect(tracker.getByStatus('RESPONDED').some(x => x.id === f.id)).toBe(true);
        tracker.verify(f.id, `verifier-${i}`, '2026-03-25');
        expect(tracker.getByStatus('VERIFIED').some(x => x.id === f.id)).toBe(true);
        tracker.close(f.id, '2026-03-28');
        expect(tracker.getByStatus('CLOSED').some(x => x.id === f.id)).toBe(true);
      });
    });
  });

  // ── CAPA + lifecycle combined ─────────────────────────────────────────────

  describe('CAPA linkage during lifecycle', () => {
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`CAPA during lifecycle #${i}: links before respond`, () => {
        const f = tracker.raise(`aud-cl-${i}`, 'MAJOR_NC', `Cl ${i}`, `D${i}`, `E${i}`, 'a', '2026-03-01');
        tracker.linkCAPA(f.id, `CAPA-PRE-${i}`);
        expect(tracker.getByAudit(`aud-cl-${i}`)[0].capaId).toBe(`CAPA-PRE-${i}`);
        tracker.respond(f.id, `R${i}`, '2026-03-10');
        expect(tracker.getByStatus('RESPONDED').some(x => x.capaId === `CAPA-PRE-${i}`)).toBe(true);
      });
    });
  });

  // ── getBySeverity mass tests ───────────────────────────────────────────────

  describe('getBySeverity mass population tests', () => {
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`getBySeverity mass test #${i}: correct count`, () => {
        const severities: FindingSeverity[] = ['OBSERVATION', 'MINOR_NC', 'MAJOR_NC', 'CRITICAL_NC'];
        const targetSeverity = severities[i % severities.length];
        // raise one of each severity
        severities.forEach(sev => {
          tracker.raise(`aud-sev-${i}`, sev, `C-${sev}`, `D ${i}`, `E ${i}`, 'a', '2026-03-01');
        });
        const result = tracker.getBySeverity(targetSeverity);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result.every(f => f.severity === targetSeverity)).toBe(true);
      });
    });
  });

  // ── getByStatus mass tests ────────────────────────────────────────────────

  describe('getByStatus mass population tests', () => {
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`getByStatus OPEN mass test #${i}`, () => {
        tracker.raise(`aud-gbs-${i}`, 'MINOR_NC', `C${i}`, `D${i}`, `E${i}`, 'a', '2026-03-01');
        const open = tracker.getOpen();
        expect(open.length).toBeGreaterThanOrEqual(1);
        expect(open.every(f => f.status === 'OPEN')).toBe(true);
      });
    });
  });

  // ── Multiple findings per audit ───────────────────────────────────────────

  describe('multiple findings per audit', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`multiple findings per audit #${i}`, () => {
        const auditId = `aud-multi-${i}`;
        const count = (i % 5) + 2; // 2 to 6 findings
        for (let k = 0; k < count; k++) {
          tracker.raise(auditId, 'OBSERVATION', `Clause ${k}`, `Desc ${k}`, `Evidence ${k}`, 'a', '2026-03-01');
        }
        expect(tracker.getByAudit(auditId).length).toBe(count);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional AuditPlanner extended tests
// ─────────────────────────────────────────────────────────────────────────────

describe('AuditPlanner extended', () => {
  let planner: AuditPlanner;

  beforeEach(() => {
    planner = new AuditPlanner();
  });

  // ── getByType extended ────────────────────────────────────────────────────

  describe('getByType extended', () => {
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`getByType extended #${i}: INTERNAL count correct`, () => {
        const types: AuditType[] = ['INTERNAL', 'EXTERNAL', 'SUPPLIER'];
        for (let k = 0; k < 3; k++) {
          planner.plan(types[k], ['QUALITY'], `T${i}-${k}`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        }
        expect(planner.getByType('INTERNAL').length).toBe(1);
        expect(planner.getByType('EXTERNAL').length).toBe(1);
        expect(planner.getByType('SUPPLIER').length).toBe(1);
      });
    });
  });

  // ── getByAuditee extended ─────────────────────────────────────────────────

  describe('getByAuditee extended', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`getByAuditee extended #${i}: filters correctly`, () => {
        const auditee = `dept-ext-${i}`;
        const other = `other-dept-${i}`;
        planner.plan('INTERNAL', ['QUALITY'], `A-${i}-1`, 'l', auditee, '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        planner.plan('EXTERNAL', ['ENVIRONMENT'], `A-${i}-2`, 'l', other, '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        const result = planner.getByAuditee(auditee);
        expect(result.length).toBe(1);
        expect(result[0].auditee).toBe(auditee);
      });
    });
  });

  // ── getByScope extended ───────────────────────────────────────────────────

  describe('getByScope extended', () => {
    const allScopes: AuditScope[] = ['QUALITY', 'ENVIRONMENT', 'HEALTH_SAFETY', 'INFORMATION_SECURITY', 'ENERGY', 'FOOD_SAFETY'];

    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`getByScope extended #${i}`, () => {
        const scope = allScopes[i % allScopes.length];
        planner.plan('INTERNAL', [scope, 'QUALITY'], `Scope-${i}`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        const result = planner.getByScope(scope);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result.every(a => a.scope.includes(scope))).toBe(true);
      });
    });
  });

  // ── postpone and re-verify state ─────────────────────────────────────────

  describe('postpone state verification', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`postpone state test #${i}: updated dates persist`, () => {
        const newStart = `2026-0${(i % 9) + 1}-01`;
        const newEnd = `2026-0${(i % 9) + 1}-15`;
        const audit = planner.plan('INTERNAL', ['QUALITY'], `Post-${i}`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        planner.postpone(audit.id, newStart, newEnd);
        const fetched = planner.get(audit.id)!;
        expect(fetched.plannedStartDate).toBe(newStart);
        expect(fetched.plannedEndDate).toBe(newEnd);
        expect(fetched.status).toBe('POSTPONED');
      });
    });
  });

  // ── getOverdue extended ───────────────────────────────────────────────────

  describe('getOverdue extended', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`getOverdue extended #${i}: only active overdue returned`, () => {
        const past = '2026-01-10';
        const future = '2026-12-31';
        const a1 = planner.plan('INTERNAL', ['QUALITY'], `OD-${i}-past`, 'l', 'a', '2026-01-01', past, ['ISO'], ['o']);
        const a2 = planner.plan('EXTERNAL', ['ENVIRONMENT'], `OD-${i}-future`, 'l', 'b', '2026-11-01', future, ['ISO'], ['o']);
        const overdue = planner.getOverdue('2026-06-01');
        expect(overdue.map(a => a.id)).toContain(a1.id);
        expect(overdue.map(a => a.id)).not.toContain(a2.id);
      });
    });
  });

  // ── addAuditor then getByLeadAuditor ─────────────────────────────────────

  describe('addAuditor + getByLeadAuditor combined', () => {
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`addAuditor + getByLeadAuditor #${i}`, () => {
        const lead = `lead-combined-${i}`;
        const audit = planner.plan('INTERNAL', ['QUALITY'], `A${i}`, lead, 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        planner.addAuditor(audit.id, `extra-${i}-a`);
        planner.addAuditor(audit.id, `extra-${i}-b`);
        const byLead = planner.getByLeadAuditor(lead);
        expect(byLead.length).toBe(1);
        expect(byLead[0].auditTeam).toContain(`extra-${i}-a`);
        expect(byLead[0].auditTeam).toContain(`extra-${i}-b`);
      });
    });
  });

  // ── getAll isolation (separate instance) ─────────────────────────────────

  describe('getAll isolation tests', () => {
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`getAll isolation #${i}: new instance is empty`, () => {
        const fresh = new AuditPlanner();
        expect(fresh.getAll()).toEqual([]);
        expect(fresh.getCount()).toBe(0);
      });
    });
  });

  // ── complete sets dates correctly ─────────────────────────────────────────

  describe('complete sets actual dates', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`complete sets actualEndDate #${i}`, () => {
        const endDate = `2026-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`;
        const audit = planner.plan('INTERNAL', ['QUALITY'], `Complete-${i}`, 'l', 'a', '2026-01-01', '2026-01-31', ['ISO'], ['o']);
        planner.start(audit.id, '2026-01-02');
        planner.complete(audit.id, endDate);
        expect(planner.get(audit.id)!.actualEndDate).toBe(endDate);
      });
    });
  });

  // ── start sets actualStartDate ────────────────────────────────────────────

  describe('start sets actualStartDate', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`start sets actualStartDate #${i}`, () => {
        const startDate = `2026-0${(i % 9) + 1}-${String((i % 28) + 1).padStart(2, '0')}`;
        const audit = planner.plan('INTERNAL', ['QUALITY'], `Start-${i}`, 'l', 'a', '2026-01-01', '2026-01-31', ['ISO'], ['o']);
        planner.start(audit.id, startDate);
        expect(planner.get(audit.id)!.actualStartDate).toBe(startDate);
      });
    });
  });

  // ── getByLeadAuditor extended mass ────────────────────────────────────────

  describe('getByLeadAuditor mass', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`getByLeadAuditor mass #${i}: returns only audits for that lead`, () => {
        const lead = `mass-lead-${i}`;
        const otherLead = `other-mass-lead-${i}`;
        planner.plan('INTERNAL', ['QUALITY'], `AL-${i}`, lead, 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        planner.plan('EXTERNAL', ['ENVIRONMENT'], `AL-other-${i}`, otherLead, 'b', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        const result = planner.getByLeadAuditor(lead);
        expect(result.every(a => a.leadAuditor === lead)).toBe(true);
        expect(result.length).toBe(1);
      });
    });
  });

  // ── standards referenced tests ────────────────────────────────────────────

  describe('standards referenced tests', () => {
    const stdSets = [
      ['ISO 9001:2015'],
      ['ISO 14001:2015'],
      ['ISO 45001:2018'],
      ['ISO 9001:2015', 'ISO 14001:2015'],
      ['ISO 9001:2015', 'ISO 14001:2015', 'ISO 45001:2018'],
    ];

    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`standards referenced test #${i}`, () => {
        const standards = stdSets[i % stdSets.length];
        const audit = planner.plan('INTERNAL', ['QUALITY'], `StdAudit-${i}`, 'l', 'a', '2026-03-01', '2026-03-05', standards, ['o']);
        expect(audit.standardsReferenced.length).toBe(standards.length);
        standards.forEach(s => expect(audit.standardsReferenced).toContain(s));
      });
    });
  });

  // ── notes field (not in spec but accessible via plan) ────────────────────

  describe('plan immutability of auditTeam input', () => {
    Array.from({ length: 10 }, (_, i) => i).forEach(i => {
      it(`auditTeam is not shared reference #${i}`, () => {
        const team = [`member-${i}-a`, `member-${i}-b`];
        const audit = planner.plan('INTERNAL', ['QUALITY'], `Imm-${i}`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o'], team);
        team.push('injected');
        expect(planner.get(audit.id)!.auditTeam).not.toContain('injected');
      });
    });
  });

  // ── scope immutability ────────────────────────────────────────────────────

  describe('scope immutability', () => {
    Array.from({ length: 10 }, (_, i) => i).forEach(i => {
      it(`scope array is not shared reference #${i}`, () => {
        const scope: AuditScope[] = ['QUALITY'];
        const audit = planner.plan('INTERNAL', scope, `ScopeImm-${i}`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        scope.push('ENVIRONMENT');
        expect(planner.get(audit.id)!.scope.length).toBe(1);
      });
    });
  });

  // ── cancel immutability (status string check) ─────────────────────────────

  describe('cancel does not affect other audits', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`cancel isolation #${i}: cancelling one does not affect another`, () => {
        const a1 = planner.plan('INTERNAL', ['QUALITY'], `A1-${i}`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], ['o']);
        const a2 = planner.plan('EXTERNAL', ['ENVIRONMENT'], `A2-${i}`, 'l', 'b', '2026-04-01', '2026-04-05', ['ISO'], ['o']);
        planner.cancel(a1.id);
        expect(planner.get(a2.id)!.status).toBe('PLANNED');
      });
    });
  });

  // ── start actualStartDate persistence ────────────────────────────────────

  describe('start date persistence', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`start date persists through get() #${i}`, () => {
        const dateStr = `2026-03-${String((i % 28) + 1).padStart(2, '0')}`;
        const audit = planner.plan('INTERNAL', ['QUALITY'], `DatePersist-${i}`, 'l', 'a', '2026-03-01', '2026-03-31', ['ISO'], ['o']);
        planner.start(audit.id, dateStr);
        const fetched = planner.get(audit.id);
        expect(fetched!.actualStartDate).toBe(dateStr);
      });
    });
  });

  // ── multiple objectives stored ────────────────────────────────────────────

  describe('multiple objectives stored correctly', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`objectives stored #${i}`, () => {
        const objectives = Array.from({ length: (i % 5) + 1 }, (_, k) => `Objective ${i}-${k}`);
        const audit = planner.plan('INTERNAL', ['QUALITY'], `ObjAudit-${i}`, 'l', 'a', '2026-03-01', '2026-03-05', ['ISO'], objectives);
        expect(audit.objectives.length).toBe(objectives.length);
        objectives.forEach(o => expect(audit.objectives).toContain(o));
      });
    });
  });

  // ── REGULATORY and CERTIFICATION audit types ──────────────────────────────

  describe('regulatory and certification type audits', () => {
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`regulatory audit #${i} stores correctly`, () => {
        const audit = planner.plan('REGULATORY', ['QUALITY', 'ENVIRONMENT'], `RegAudit-${i}`, `regAud-${i}`, `regDept-${i}`, '2026-06-01', '2026-06-10', ['ISO 9001', 'ISO 14001'], ['Regulatory compliance check']);
        expect(audit.type).toBe('REGULATORY');
        expect(audit.leadAuditor).toBe(`regAud-${i}`);
      });
    });
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`certification audit #${i} stores correctly`, () => {
        const audit = planner.plan('CERTIFICATION', ['QUALITY'], `CertAudit-${i}`, `certAud-${i}`, `certOrg-${i}`, '2026-09-01', '2026-09-05', ['ISO 9001:2015'], ['Third-party certification']);
        expect(audit.type).toBe('CERTIFICATION');
        expect(audit.status).toBe('PLANNED');
        expect(audit.scope).toContain('QUALITY');
      });
    });
  });

  // ── supplier audit type tests ─────────────────────────────────────────────

  describe('supplier audit type tests', () => {
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`supplier audit type #${i}`, () => {
        const audit = planner.plan(
          'SUPPLIER',
          ['QUALITY', 'FOOD_SAFETY'],
          `SupplierAudit-${i}`,
          `supply-lead-${i}`,
          `supplier-org-${i}`,
          '2026-07-01',
          '2026-07-03',
          ['ISO 9001:2015', 'ISO 22000:2018'],
          [`Verify supplier quality clause ${i}`, `Check food safety controls ${i}`],
          [`team-a-${i}`, `team-b-${i}`]
        );
        expect(audit.type).toBe('SUPPLIER');
        expect(audit.scope).toContain('QUALITY');
        expect(audit.scope).toContain('FOOD_SAFETY');
        expect(audit.auditTeam.length).toBe(2);
        expect(audit.objectives.length).toBe(2);
        expect(audit.status).toBe('PLANNED');
      });
    });
  });
});
