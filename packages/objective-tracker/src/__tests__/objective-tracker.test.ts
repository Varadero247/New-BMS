// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { ObjectiveManager } from '../objective-tracker';
import { TargetTracker } from '../target-tracker';
import {
  ObjectiveStatus,
  TargetStatus,
  MeasurementUnit,
  Priority,
  StandardReference,
  Objective,
  ObjectiveTarget,
} from '../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeObjectiveData(overrides: Partial<Omit<Objective, 'id' | 'status'>> = {}): Omit<Objective, 'id' | 'status'> {
  return {
    title: 'Reduce carbon emissions',
    description: 'Cut CO2 by 30% vs baseline',
    priority: 'HIGH',
    owner: 'alice',
    department: 'Operations',
    standardReference: 'ISO_14001',
    startDate: '2026-01-01',
    targetDate: '2026-12-31',
    ...overrides,
  };
}

// ─── ObjectiveManager ────────────────────────────────────────────────────────

describe('ObjectiveManager', () => {
  let manager: ObjectiveManager;

  beforeEach(() => {
    manager = new ObjectiveManager();
  });

  // ── create ───────────────────────────────────────────────────────────────
  describe('create', () => {
    it('creates an objective with DRAFT status', () => {
      const obj = manager.create(makeObjectiveData());
      expect(obj.status).toBe('DRAFT');
    });

    it('assigns a unique id', () => {
      const a = manager.create(makeObjectiveData());
      const b = manager.create(makeObjectiveData());
      expect(a.id).toBeDefined();
      expect(b.id).toBeDefined();
      expect(a.id).not.toBe(b.id);
    });

    it('stores all supplied fields', () => {
      const data = makeObjectiveData({ title: 'Test Objective', owner: 'bob' });
      const obj = manager.create(data);
      expect(obj.title).toBe('Test Objective');
      expect(obj.owner).toBe('bob');
    });

    it('increments count after create', () => {
      manager.create(makeObjectiveData());
      expect(manager.getCount()).toBe(1);
    });

    it('returns a copy — mutating return value does not affect store', () => {
      const obj = manager.create(makeObjectiveData());
      (obj as any).title = 'tampered';
      expect(manager.get(obj.id).title).toBe('Reduce carbon emissions');
    });

    // parameterized: create 50 objectives and verify ids are unique
    it('creates 50 objectives with unique ids', () => {
      const ids = Array.from({ length: 50 }, () => manager.create(makeObjectiveData()).id);
      const unique = new Set(ids);
      expect(unique.size).toBe(50);
    });

    // parameterized: titles are preserved
    Array.from({ length: 40 }, (_, i) => i).forEach(i => {
      it(`preserves title for objective index ${i}`, () => {
        const title = `Objective Title ${i}`;
        const obj = manager.create(makeObjectiveData({ title }));
        expect(obj.title).toBe(title);
      });
    });

    // parameterized: descriptions are preserved
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`preserves description for index ${i}`, () => {
        const description = `Description content ${i}`;
        const obj = manager.create(makeObjectiveData({ description }));
        expect(obj.description).toBe(description);
      });
    });

    // parameterized: departments
    const departments = ['Operations', 'HR', 'Finance', 'Quality', 'EHS', 'IT', 'Legal', 'Marketing', 'R&D', 'Procurement'];
    departments.forEach(dept => {
      it(`stores department ${dept}`, () => {
        const obj = manager.create(makeObjectiveData({ department: dept }));
        expect(obj.department).toBe(dept);
      });
    });

    // parameterized: optional fields
    it('stores optional baseline', () => {
      const obj = manager.create(makeObjectiveData({ baseline: 100 }));
      expect(obj.baseline).toBe(100);
    });

    it('stores optional unit', () => {
      const obj = manager.create(makeObjectiveData({ unit: 'KG' }));
      expect(obj.unit).toBe('KG');
    });

    it('stores optional notes', () => {
      const obj = manager.create(makeObjectiveData({ notes: 'Important note' }));
      expect(obj.notes).toBe('Important note');
    });

    it('status is DRAFT even when other fields suggest activity', () => {
      const obj = manager.create(makeObjectiveData({ startDate: '2025-01-01' }));
      expect(obj.status).toBe('DRAFT');
    });
  });

  // ── activate ─────────────────────────────────────────────────────────────
  describe('activate', () => {
    it('sets status to ACTIVE', () => {
      const obj = manager.create(makeObjectiveData());
      const activated = manager.activate(obj.id);
      expect(activated.status).toBe('ACTIVE');
    });

    it('get reflects ACTIVE after activate', () => {
      const obj = manager.create(makeObjectiveData());
      manager.activate(obj.id);
      expect(manager.get(obj.id).status).toBe('ACTIVE');
    });

    it('throws for unknown id', () => {
      expect(() => manager.activate('nonexistent')).toThrow();
    });

    // parameterized: activate 30 objectives
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`activates objective at index ${i}`, () => {
        const obj = manager.create(makeObjectiveData({ title: `Obj ${i}` }));
        const result = manager.activate(obj.id);
        expect(result.status).toBe('ACTIVE');
      });
    });

    it('activate preserves other fields', () => {
      const obj = manager.create(makeObjectiveData({ owner: 'charlie' }));
      const result = manager.activate(obj.id);
      expect(result.owner).toBe('charlie');
    });
  });

  // ── achieve ───────────────────────────────────────────────────────────────
  describe('achieve', () => {
    it('sets status to ACHIEVED', () => {
      const obj = manager.create(makeObjectiveData());
      manager.activate(obj.id);
      const result = manager.achieve(obj.id, '2026-10-01');
      expect(result.status).toBe('ACHIEVED');
    });

    it('sets achievedDate', () => {
      const obj = manager.create(makeObjectiveData());
      const result = manager.achieve(obj.id, '2026-09-15');
      expect(result.achievedDate).toBe('2026-09-15');
    });

    it('get reflects ACHIEVED after achieve', () => {
      const obj = manager.create(makeObjectiveData());
      manager.achieve(obj.id, '2026-09-15');
      expect(manager.get(obj.id).status).toBe('ACHIEVED');
      expect(manager.get(obj.id).achievedDate).toBe('2026-09-15');
    });

    it('throws for unknown id', () => {
      expect(() => manager.achieve('bad-id', '2026-01-01')).toThrow();
    });

    // parameterized: achieve 30 objectives with different dates
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`achieves objective ${i} with correct date`, () => {
        const obj = manager.create(makeObjectiveData());
        const date = `2026-${String((i % 12) + 1).padStart(2, '0')}-01`;
        const result = manager.achieve(obj.id, date);
        expect(result.achievedDate).toBe(date);
        expect(result.status).toBe('ACHIEVED');
      });
    });
  });

  // ── markNotAchieved ───────────────────────────────────────────────────────
  describe('markNotAchieved', () => {
    it('sets status to NOT_ACHIEVED', () => {
      const obj = manager.create(makeObjectiveData());
      const result = manager.markNotAchieved(obj.id);
      expect(result.status).toBe('NOT_ACHIEVED');
    });

    it('get reflects NOT_ACHIEVED', () => {
      const obj = manager.create(makeObjectiveData());
      manager.markNotAchieved(obj.id);
      expect(manager.get(obj.id).status).toBe('NOT_ACHIEVED');
    });

    it('throws for unknown id', () => {
      expect(() => manager.markNotAchieved('missing')).toThrow();
    });

    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`markNotAchieved for objective index ${i}`, () => {
        const obj = manager.create(makeObjectiveData({ title: `Obj ${i}` }));
        const result = manager.markNotAchieved(obj.id);
        expect(result.status).toBe('NOT_ACHIEVED');
      });
    });
  });

  // ── cancel ────────────────────────────────────────────────────────────────
  describe('cancel', () => {
    it('sets status to CANCELLED', () => {
      const obj = manager.create(makeObjectiveData());
      const result = manager.cancel(obj.id);
      expect(result.status).toBe('CANCELLED');
    });

    it('get reflects CANCELLED', () => {
      const obj = manager.create(makeObjectiveData());
      manager.cancel(obj.id);
      expect(manager.get(obj.id).status).toBe('CANCELLED');
    });

    it('throws for unknown id', () => {
      expect(() => manager.cancel('missing')).toThrow();
    });

    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`cancel for objective index ${i}`, () => {
        const obj = manager.create(makeObjectiveData({ title: `Obj ${i}` }));
        const result = manager.cancel(obj.id);
        expect(result.status).toBe('CANCELLED');
      });
    });
  });

  // ── update ────────────────────────────────────────────────────────────────
  describe('update', () => {
    it('updates title', () => {
      const obj = manager.create(makeObjectiveData());
      manager.update(obj.id, { title: 'New Title' });
      expect(manager.get(obj.id).title).toBe('New Title');
    });

    it('updates priority', () => {
      const obj = manager.create(makeObjectiveData({ priority: 'LOW' }));
      manager.update(obj.id, { priority: 'CRITICAL' });
      expect(manager.get(obj.id).priority).toBe('CRITICAL');
    });

    it('updates owner', () => {
      const obj = manager.create(makeObjectiveData());
      manager.update(obj.id, { owner: 'dana' });
      expect(manager.get(obj.id).owner).toBe('dana');
    });

    it('updates notes', () => {
      const obj = manager.create(makeObjectiveData());
      manager.update(obj.id, { notes: 'Updated notes' });
      expect(manager.get(obj.id).notes).toBe('Updated notes');
    });

    it('throws for unknown id', () => {
      expect(() => manager.update('ghost', { title: 'X' })).toThrow();
    });

    it('update preserves untouched fields', () => {
      const obj = manager.create(makeObjectiveData({ department: 'EHS' }));
      manager.update(obj.id, { title: 'New' });
      expect(manager.get(obj.id).department).toBe('EHS');
    });

    it('update returns updated object', () => {
      const obj = manager.create(makeObjectiveData());
      const result = manager.update(obj.id, { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    // parameterized: update descriptions
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`update description index ${i}`, () => {
        const obj = manager.create(makeObjectiveData());
        manager.update(obj.id, { description: `Updated desc ${i}` });
        expect(manager.get(obj.id).description).toBe(`Updated desc ${i}`);
      });
    });

    // parameterized: update targetDate
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`update targetDate index ${i}`, () => {
        const obj = manager.create(makeObjectiveData());
        const newDate = `2027-0${(i % 9) + 1}-01`;
        manager.update(obj.id, { targetDate: newDate });
        expect(manager.get(obj.id).targetDate).toBe(newDate);
      });
    });
  });

  // ── get ───────────────────────────────────────────────────────────────────
  describe('get', () => {
    it('retrieves the correct objective by id', () => {
      const obj = manager.create(makeObjectiveData({ title: 'Target Obj' }));
      const retrieved = manager.get(obj.id);
      expect(retrieved.id).toBe(obj.id);
      expect(retrieved.title).toBe('Target Obj');
    });

    it('throws for missing id', () => {
      expect(() => manager.get('no-such-id')).toThrow();
    });

    it('returns a copy not the internal reference', () => {
      const obj = manager.create(makeObjectiveData());
      const a = manager.get(obj.id);
      const b = manager.get(obj.id);
      expect(a).not.toBe(b);
      expect(a).toEqual(b);
    });
  });

  // ── getAll ────────────────────────────────────────────────────────────────
  describe('getAll', () => {
    it('returns empty array when no objectives', () => {
      expect(manager.getAll()).toEqual([]);
    });

    it('returns all objectives', () => {
      manager.create(makeObjectiveData({ title: 'A' }));
      manager.create(makeObjectiveData({ title: 'B' }));
      manager.create(makeObjectiveData({ title: 'C' }));
      expect(manager.getAll()).toHaveLength(3);
    });

    // parameterized: getAll count matches create count
    Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
      it(`getAll returns ${n} items after ${n} creates`, () => {
        const m = new ObjectiveManager();
        Array.from({ length: n }, () => m.create(makeObjectiveData()));
        expect(m.getAll()).toHaveLength(n);
      });
    });
  });

  // ── getByStatus ───────────────────────────────────────────────────────────
  describe('getByStatus', () => {
    it('filters DRAFT objectives', () => {
      manager.create(makeObjectiveData());
      manager.create(makeObjectiveData());
      expect(manager.getByStatus('DRAFT')).toHaveLength(2);
    });

    it('filters ACTIVE objectives', () => {
      const obj = manager.create(makeObjectiveData());
      manager.activate(obj.id);
      expect(manager.getByStatus('ACTIVE')).toHaveLength(1);
      expect(manager.getByStatus('DRAFT')).toHaveLength(0);
    });

    it('filters ACHIEVED objectives', () => {
      const obj = manager.create(makeObjectiveData());
      manager.achieve(obj.id, '2026-06-01');
      expect(manager.getByStatus('ACHIEVED')).toHaveLength(1);
    });

    it('filters NOT_ACHIEVED objectives', () => {
      const obj = manager.create(makeObjectiveData());
      manager.markNotAchieved(obj.id);
      expect(manager.getByStatus('NOT_ACHIEVED')).toHaveLength(1);
    });

    it('filters CANCELLED objectives', () => {
      const obj = manager.create(makeObjectiveData());
      manager.cancel(obj.id);
      expect(manager.getByStatus('CANCELLED')).toHaveLength(1);
    });

    it('returns empty when no match', () => {
      manager.create(makeObjectiveData());
      expect(manager.getByStatus('CANCELLED')).toHaveLength(0);
    });

    // parameterized: multiple status transitions
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`getByStatus DRAFT check after ${i} creates`, () => {
        const m = new ObjectiveManager();
        Array.from({ length: i + 1 }, () => m.create(makeObjectiveData()));
        expect(m.getByStatus('DRAFT')).toHaveLength(i + 1);
      });
    });
  });

  // ── getByPriority ─────────────────────────────────────────────────────────
  describe('getByPriority', () => {
    const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    priorities.forEach(priority => {
      it(`filters by priority ${priority}`, () => {
        manager.create(makeObjectiveData({ priority }));
        manager.create(makeObjectiveData({ priority: 'LOW' }));
        const results = manager.getByPriority(priority);
        expect(results.every(o => o.priority === priority)).toBe(true);
      });
    });

    it('returns empty when no match', () => {
      manager.create(makeObjectiveData({ priority: 'HIGH' }));
      expect(manager.getByPriority('CRITICAL')).toHaveLength(0);
    });

    // parameterized: 30 HIGH objectives
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`getByPriority HIGH iteration ${i}`, () => {
        const m = new ObjectiveManager();
        Array.from({ length: i + 1 }, () => m.create(makeObjectiveData({ priority: 'HIGH' })));
        m.create(makeObjectiveData({ priority: 'LOW' }));
        expect(m.getByPriority('HIGH')).toHaveLength(i + 1);
      });
    });
  });

  // ── getByOwner ────────────────────────────────────────────────────────────
  describe('getByOwner', () => {
    it('filters by owner', () => {
      manager.create(makeObjectiveData({ owner: 'alice' }));
      manager.create(makeObjectiveData({ owner: 'bob' }));
      manager.create(makeObjectiveData({ owner: 'alice' }));
      expect(manager.getByOwner('alice')).toHaveLength(2);
      expect(manager.getByOwner('bob')).toHaveLength(1);
    });

    it('returns empty for unknown owner', () => {
      manager.create(makeObjectiveData({ owner: 'alice' }));
      expect(manager.getByOwner('unknown')).toHaveLength(0);
    });

    // parameterized: varied owner names
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`getByOwner for owner-${i}`, () => {
        const m = new ObjectiveManager();
        m.create(makeObjectiveData({ owner: `owner-${i}` }));
        expect(m.getByOwner(`owner-${i}`)).toHaveLength(1);
        expect(m.getByOwner(`owner-${i + 1}`)).toHaveLength(0);
      });
    });
  });

  // ── getByDepartment ───────────────────────────────────────────────────────
  describe('getByDepartment', () => {
    it('filters by department', () => {
      manager.create(makeObjectiveData({ department: 'EHS' }));
      manager.create(makeObjectiveData({ department: 'HR' }));
      manager.create(makeObjectiveData({ department: 'EHS' }));
      expect(manager.getByDepartment('EHS')).toHaveLength(2);
      expect(manager.getByDepartment('HR')).toHaveLength(1);
    });

    it('returns empty for unknown department', () => {
      expect(manager.getByDepartment('Unknown')).toHaveLength(0);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`getByDepartment iteration ${i}`, () => {
        const m = new ObjectiveManager();
        m.create(makeObjectiveData({ department: `Dept-${i}` }));
        expect(m.getByDepartment(`Dept-${i}`)).toHaveLength(1);
      });
    });
  });

  // ── getByStandard ─────────────────────────────────────────────────────────
  describe('getByStandard', () => {
    const standards: StandardReference[] = ['ISO_9001', 'ISO_14001', 'ISO_45001', 'ISO_50001', 'ISO_27001'];

    standards.forEach(std => {
      it(`filters by standard ${std}`, () => {
        manager.create(makeObjectiveData({ standardReference: std }));
        const results = manager.getByStandard(std);
        expect(results.every(o => o.standardReference === std)).toBe(true);
      });
    });

    it('returns empty for standard with no objectives', () => {
      manager.create(makeObjectiveData({ standardReference: 'ISO_9001' }));
      expect(manager.getByStandard('ISO_27001')).toHaveLength(0);
    });

    it('returns multiple objectives for same standard', () => {
      manager.create(makeObjectiveData({ standardReference: 'ISO_14001' }));
      manager.create(makeObjectiveData({ standardReference: 'ISO_14001' }));
      expect(manager.getByStandard('ISO_14001')).toHaveLength(2);
    });

    // parameterized: all 5 standards
    Array.from({ length: 5 }, (_, i) => i).forEach(i => {
      const std = standards[i];
      it(`getByStandard count for ${std} with ${i + 1} items`, () => {
        const m = new ObjectiveManager();
        Array.from({ length: i + 1 }, () => m.create(makeObjectiveData({ standardReference: std })));
        expect(m.getByStandard(std)).toHaveLength(i + 1);
      });
    });

    // more parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`getByStandard ISO_45001 iteration ${i}`, () => {
        const m = new ObjectiveManager();
        m.create(makeObjectiveData({ standardReference: 'ISO_45001' }));
        expect(m.getByStandard('ISO_45001')).toHaveLength(1);
        expect(m.getByStandard('ISO_50001')).toHaveLength(0);
      });
    });
  });

  // ── getOverdue ────────────────────────────────────────────────────────────
  describe('getOverdue', () => {
    it('returns ACTIVE objectives past targetDate', () => {
      const obj = manager.create(makeObjectiveData({ targetDate: '2025-06-01' }));
      manager.activate(obj.id);
      const overdue = manager.getOverdue('2026-01-01');
      expect(overdue).toHaveLength(1);
    });

    it('does not include DRAFT objectives', () => {
      manager.create(makeObjectiveData({ targetDate: '2025-01-01' }));
      expect(manager.getOverdue('2026-01-01')).toHaveLength(0);
    });

    it('does not include objectives with future targetDate', () => {
      const obj = manager.create(makeObjectiveData({ targetDate: '2027-01-01' }));
      manager.activate(obj.id);
      expect(manager.getOverdue('2026-01-01')).toHaveLength(0);
    });

    it('does not include ACHIEVED objectives', () => {
      const obj = manager.create(makeObjectiveData({ targetDate: '2025-01-01' }));
      manager.achieve(obj.id, '2025-12-31');
      expect(manager.getOverdue('2026-01-01')).toHaveLength(0);
    });

    it('does not include CANCELLED objectives', () => {
      const obj = manager.create(makeObjectiveData({ targetDate: '2025-01-01' }));
      manager.activate(obj.id);
      manager.cancel(obj.id);
      expect(manager.getOverdue('2026-01-01')).toHaveLength(0);
    });

    // parameterized: 30 overdue objectives
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`getOverdue detects overdue objective at index ${i}`, () => {
        const m = new ObjectiveManager();
        const obj = m.create(makeObjectiveData({ targetDate: '2025-01-01' }));
        m.activate(obj.id);
        expect(m.getOverdue('2026-01-01')).toHaveLength(1);
      });
    });

    // parameterized: mix of overdue and not
    Array.from({ length: 15 }, (_, i) => i).forEach(i => {
      it(`getOverdue mixed set at index ${i}`, () => {
        const m = new ObjectiveManager();
        const past = m.create(makeObjectiveData({ targetDate: '2025-01-01' }));
        m.activate(past.id);
        const future = m.create(makeObjectiveData({ targetDate: '2027-01-01' }));
        m.activate(future.id);
        expect(m.getOverdue('2026-01-01')).toHaveLength(1);
      });
    });
  });

  // ── getCount ──────────────────────────────────────────────────────────────
  describe('getCount', () => {
    it('returns 0 initially', () => {
      expect(manager.getCount()).toBe(0);
    });

    it('returns correct count after creates', () => {
      manager.create(makeObjectiveData());
      manager.create(makeObjectiveData());
      manager.create(makeObjectiveData());
      expect(manager.getCount()).toBe(3);
    });

    // parameterized: count for 1..40
    Array.from({ length: 40 }, (_, i) => i + 1).forEach(n => {
      it(`getCount returns ${n} after ${n} creates`, () => {
        const m = new ObjectiveManager();
        Array.from({ length: n }, () => m.create(makeObjectiveData()));
        expect(m.getCount()).toBe(n);
      });
    });
  });

  // ── full lifecycle ─────────────────────────────────────────────────────────
  describe('full lifecycle', () => {
    it('DRAFT → ACTIVE → ACHIEVED', () => {
      const obj = manager.create(makeObjectiveData());
      expect(obj.status).toBe('DRAFT');
      manager.activate(obj.id);
      expect(manager.get(obj.id).status).toBe('ACTIVE');
      manager.achieve(obj.id, '2026-11-01');
      expect(manager.get(obj.id).status).toBe('ACHIEVED');
      expect(manager.get(obj.id).achievedDate).toBe('2026-11-01');
    });

    it('DRAFT → ACTIVE → NOT_ACHIEVED', () => {
      const obj = manager.create(makeObjectiveData());
      manager.activate(obj.id);
      manager.markNotAchieved(obj.id);
      expect(manager.get(obj.id).status).toBe('NOT_ACHIEVED');
    });

    it('DRAFT → CANCELLED', () => {
      const obj = manager.create(makeObjectiveData());
      manager.cancel(obj.id);
      expect(manager.get(obj.id).status).toBe('CANCELLED');
    });

    it('DRAFT → ACTIVE → CANCELLED', () => {
      const obj = manager.create(makeObjectiveData());
      manager.activate(obj.id);
      manager.cancel(obj.id);
      expect(manager.get(obj.id).status).toBe('CANCELLED');
    });

    // parameterized: 30 full lifecycle runs
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`full lifecycle run ${i}`, () => {
        const m = new ObjectiveManager();
        const obj = m.create(makeObjectiveData({ title: `Obj-${i}` }));
        m.activate(obj.id);
        m.achieve(obj.id, '2026-12-01');
        const final = m.get(obj.id);
        expect(final.status).toBe('ACHIEVED');
        expect(final.achievedDate).toBe('2026-12-01');
      });
    });
  });

  // ── ISO standard coverage ─────────────────────────────────────────────────
  describe('ISO standard coverage', () => {
    const standards: StandardReference[] = ['ISO_9001', 'ISO_14001', 'ISO_45001', 'ISO_50001', 'ISO_27001'];

    it('supports all 5 ISO standard references', () => {
      standards.forEach(std => {
        const obj = manager.create(makeObjectiveData({ standardReference: std }));
        expect(obj.standardReference).toBe(std);
      });
      expect(manager.getCount()).toBe(5);
    });

    Array.from({ length: 5 }, (_, i) => i).forEach(i => {
      it(`standard ${standards[i]} is filterable`, () => {
        const m = new ObjectiveManager();
        m.create(makeObjectiveData({ standardReference: standards[i] }));
        expect(m.getByStandard(standards[i])).toHaveLength(1);
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`ISO standard correctness iteration ${i}`, () => {
        const m = new ObjectiveManager();
        const std = standards[i % 5];
        m.create(makeObjectiveData({ standardReference: std }));
        expect(m.getByStandard(std)[0].standardReference).toBe(std);
      });
    });
  });

  // ── priority coverage ─────────────────────────────────────────────────────
  describe('priority coverage', () => {
    const priorities: Priority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

    priorities.forEach(priority => {
      it(`priority ${priority} is preserved`, () => {
        const obj = manager.create(makeObjectiveData({ priority }));
        expect(obj.priority).toBe(priority);
      });
    });

    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`priority cycling iteration ${i}`, () => {
        const m = new ObjectiveManager();
        const priority = priorities[i % 4];
        m.create(makeObjectiveData({ priority }));
        expect(m.getByPriority(priority)).toHaveLength(1);
      });
    });
  });

  // ── measurement units ─────────────────────────────────────────────────────
  describe('measurement units', () => {
    const units: MeasurementUnit[] = ['PERCENTAGE', 'NUMBER', 'KG', 'TONNES', 'KWH', 'HOURS', 'DAYS', 'CURRENCY'];

    units.forEach(unit => {
      it(`unit ${unit} is stored`, () => {
        const obj = manager.create(makeObjectiveData({ unit }));
        expect(obj.unit).toBe(unit);
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`unit cycling iteration ${i}`, () => {
        const m = new ObjectiveManager();
        const unit = units[i % 8];
        const obj = m.create(makeObjectiveData({ unit }));
        expect(obj.unit).toBe(unit);
      });
    });
  });
});

// ─── TargetTracker ───────────────────────────────────────────────────────────

describe('TargetTracker', () => {
  let tracker: TargetTracker;

  beforeEach(() => {
    tracker = new TargetTracker();
  });

  // ── addTarget ─────────────────────────────────────────────────────────────
  describe('addTarget', () => {
    it('creates a target with PENDING status', () => {
      const t = tracker.addTarget('obj-1', 'Reduce waste', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      expect(t.status).toBe('PENDING');
    });

    it('sets currentValue to 0', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      expect(t.currentValue).toBe(0);
    });

    it('stores all provided fields', () => {
      const t = tracker.addTarget('obj-42', 'Test target', 50, 'PERCENTAGE', '2026-06-30', 'bob', '2026-01-15');
      expect(t.objectiveId).toBe('obj-42');
      expect(t.description).toBe('Test target');
      expect(t.targetValue).toBe(50);
      expect(t.unit).toBe('PERCENTAGE');
      expect(t.dueDate).toBe('2026-06-30');
      expect(t.assignedTo).toBe('bob');
    });

    it('assigns unique ids', () => {
      const a = tracker.addTarget('obj-1', 'A', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      const b = tracker.addTarget('obj-1', 'B', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      expect(a.id).not.toBe(b.id);
    });

    it('increments target count', () => {
      tracker.addTarget('obj-1', 'A', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      expect(tracker.getTargetCount()).toBe(1);
    });

    // parameterized: add 40 targets
    Array.from({ length: 40 }, (_, i) => i).forEach(i => {
      it(`addTarget index ${i} has PENDING status`, () => {
        const t = tracker.addTarget(`obj-${i}`, `Desc ${i}`, 100 + i, 'NUMBER', '2026-12-31', `user-${i}`, '2026-01-01');
        expect(t.status).toBe('PENDING');
        expect(t.currentValue).toBe(0);
      });
    });

    // parameterized: different units
    const units: MeasurementUnit[] = ['PERCENTAGE', 'NUMBER', 'KG', 'TONNES', 'KWH', 'HOURS', 'DAYS', 'CURRENCY'];
    units.forEach(unit => {
      it(`addTarget with unit ${unit}`, () => {
        const t = tracker.addTarget('obj-1', 'Desc', 100, unit, '2026-12-31', 'alice', '2026-01-01');
        expect(t.unit).toBe(unit);
      });
    });
  });

  // ── updateProgress ────────────────────────────────────────────────────────
  describe('updateProgress', () => {
    it('throws for unknown target id', () => {
      expect(() => tracker.updateProgress('nonexistent', 50, '2026-06-01')).toThrow();
    });

    it('updates currentValue', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 60, '2026-06-01');
      // 60 >= 100 * 0.7 → ON_TRACK
      expect(tracker.getByObjective('obj-1')[0].currentValue).toBe(60);
    });

    it('sets ACHIEVED when currentValue >= targetValue', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 100, '2026-06-01');
      expect(tracker.getByObjective('obj-1')[0].status).toBe('ACHIEVED');
    });

    it('sets ACHIEVED when currentValue > targetValue', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 150, '2026-06-01');
      expect(tracker.getByObjective('obj-1')[0].status).toBe('ACHIEVED');
    });

    it('sets MISSED when past due and below target', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-01-01', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 50, '2026-02-01');
      expect(tracker.getByObjective('obj-1')[0].status).toBe('MISSED');
    });

    it('sets ON_TRACK when >= 70% of target and not overdue', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 70, '2026-06-01');
      expect(tracker.getByObjective('obj-1')[0].status).toBe('ON_TRACK');
    });

    it('sets AT_RISK when < 70% of target and not overdue', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 50, '2026-06-01');
      expect(tracker.getByObjective('obj-1')[0].status).toBe('AT_RISK');
    });

    it('updates lastUpdated', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 60, '2026-08-15');
      expect(tracker.getByObjective('obj-1')[0].lastUpdated).toBe('2026-08-15');
    });

    // parameterized: achieved boundary
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`updateProgress ACHIEVED boundary at index ${i}`, () => {
        const target = 50 + i;
        const t = tracker.addTarget('obj-1', 'Desc', target, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
        tracker.updateProgress(t.id, target, '2026-06-01');
        expect(tracker.getByObjective('obj-1')[0].status).toBe('ACHIEVED');
      });
    });

    // parameterized: at-risk boundary
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`updateProgress AT_RISK boundary at index ${i}`, () => {
        const t = tracker.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
        tracker.updateProgress(t.id, 30 + i, '2026-06-01');
        // 30+i < 70 for i<40, so AT_RISK when < 70
        const expected = (30 + i) >= 70 ? 'ON_TRACK' : 'AT_RISK';
        expect(tracker.getByObjective('obj-1')[0].status).toBe(expected);
      });
    });

    // parameterized: on-track boundary (70 to 99)
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`updateProgress ON_TRACK at value ${70 + i}`, () => {
        const t = tracker.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
        const value = 70 + i;
        tracker.updateProgress(t.id, value, '2026-06-01');
        const expected = value >= 100 ? 'ACHIEVED' : 'ON_TRACK';
        expect(tracker.getByObjective('obj-1')[0].status).toBe(expected);
      });
    });

    // parameterized: missed (overdue)
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`updateProgress MISSED at index ${i}`, () => {
        const t = tracker.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-01-01', 'u', '2026-01-01');
        tracker.updateProgress(t.id, 10 + i, '2026-03-01');
        expect(tracker.getByObjective('obj-1')[0].status).toBe('MISSED');
      });
    });
  });

  // ── recordProgress ────────────────────────────────────────────────────────
  describe('recordProgress', () => {
    it('creates a ProgressRecord', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      const record = tracker.recordProgress(t.id, 50, '2026-06-01', 'alice');
      expect(record.targetId).toBe(t.id);
      expect(record.value).toBe(50);
      expect(record.recordedAt).toBe('2026-06-01');
      expect(record.recordedBy).toBe('alice');
    });

    it('stores notes when provided', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      const record = tracker.recordProgress(t.id, 50, '2026-06-01', 'alice', 'Monthly update');
      expect(record.notes).toBe('Monthly update');
    });

    it('notes is undefined when not provided', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      const record = tracker.recordProgress(t.id, 50, '2026-06-01', 'alice');
      expect(record.notes).toBeUndefined();
    });

    it('also updates target progress (currentValue)', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.recordProgress(t.id, 75, '2026-06-01', 'alice');
      expect(tracker.getByObjective('obj-1')[0].currentValue).toBe(75);
    });

    it('increments progressCount', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.recordProgress(t.id, 10, '2026-02-01', 'alice');
      tracker.recordProgress(t.id, 20, '2026-03-01', 'alice');
      expect(tracker.getProgressCount()).toBe(2);
    });

    it('throws for unknown target id', () => {
      expect(() => tracker.recordProgress('no-id', 50, '2026-06-01', 'alice')).toThrow();
    });

    // parameterized: 40 records on same target
    it('accumulates 40 progress records', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 1000, 'NUMBER', '2026-12-31', 'alice', '2026-01-01');
      Array.from({ length: 40 }, (_, i) => i).forEach(i => {
        tracker.recordProgress(t.id, (i + 1) * 10, `2026-01-${String(i + 1).padStart(2, '0')}`, 'alice');
      });
      expect(tracker.getProgressHistory(t.id)).toHaveLength(40);
    });

    // parameterized: 30 distinct targets each with 1 record
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`recordProgress for distinct target ${i}`, () => {
        const t = tracker.addTarget(`obj-${i}`, 'Desc', 100, 'NUMBER', '2026-12-31', 'user', '2026-01-01');
        const rec = tracker.recordProgress(t.id, i * 2, '2026-06-01', 'user');
        expect(rec.value).toBe(i * 2);
      });
    });

    // parameterized: status after recordProgress
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`status after recordProgress value ${50 + i}`, () => {
        const t = tracker.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
        tracker.recordProgress(t.id, 50 + i, '2026-06-01', 'u');
        const updated = tracker.getByObjective('obj-1')[0];
        const expected = (50 + i) >= 100 ? 'ACHIEVED' : (50 + i) >= 70 ? 'ON_TRACK' : 'AT_RISK';
        expect(updated.status).toBe(expected);
      });
    });
  });

  // ── getProgressHistory ────────────────────────────────────────────────────
  describe('getProgressHistory', () => {
    it('returns empty array initially', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      expect(tracker.getProgressHistory(t.id)).toEqual([]);
    });

    it('throws for unknown target', () => {
      expect(() => tracker.getProgressHistory('missing')).toThrow();
    });

    it('accumulates records in order', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.recordProgress(t.id, 10, '2026-01-01', 'alice');
      tracker.recordProgress(t.id, 20, '2026-02-01', 'alice');
      tracker.recordProgress(t.id, 30, '2026-03-01', 'alice');
      const history = tracker.getProgressHistory(t.id);
      expect(history).toHaveLength(3);
      expect(history[0].value).toBe(10);
      expect(history[1].value).toBe(20);
      expect(history[2].value).toBe(30);
    });

    // parameterized: 30 iterations checking history length
    Array.from({ length: 30 }, (_, i) => i + 1).forEach(n => {
      it(`getProgressHistory returns ${n} records`, () => {
        const t = tracker.addTarget('obj-1', 'Desc', 1000, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
        Array.from({ length: n }, (_, j) => j).forEach(j => {
          tracker.recordProgress(t.id, j, `2026-01-${String(j + 1).padStart(2, '0')}`, 'u');
        });
        expect(tracker.getProgressHistory(t.id)).toHaveLength(n);
      });
    });

    // parameterized: values match in history
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`getProgressHistory value check at index ${i}`, () => {
        const t = tracker.addTarget('obj-1', 'Desc', 1000, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
        tracker.recordProgress(t.id, i * 5, '2026-01-01', 'u');
        const history = tracker.getProgressHistory(t.id);
        expect(history[0].value).toBe(i * 5);
      });
    });
  });

  // ── getByObjective ────────────────────────────────────────────────────────
  describe('getByObjective', () => {
    it('returns targets for a given objective', () => {
      tracker.addTarget('obj-A', 'T1', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.addTarget('obj-A', 'T2', 50, 'PERCENTAGE', '2026-12-31', 'bob', '2026-01-01');
      tracker.addTarget('obj-B', 'T3', 200, 'NUMBER', '2026-12-31', 'charlie', '2026-01-01');
      expect(tracker.getByObjective('obj-A')).toHaveLength(2);
      expect(tracker.getByObjective('obj-B')).toHaveLength(1);
    });

    it('returns empty array for unknown objective', () => {
      expect(tracker.getByObjective('unknown')).toEqual([]);
    });

    // parameterized
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`getByObjective for obj-${i}`, () => {
        const t = tracker.addTarget(`obj-${i}`, 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
        expect(tracker.getByObjective(`obj-${i}`)).toHaveLength(1);
        expect(tracker.getByObjective(`obj-${i + 1000}`)).toHaveLength(0);
      });
    });
  });

  // ── getByStatus ───────────────────────────────────────────────────────────
  describe('getByStatus (TargetTracker)', () => {
    it('returns PENDING targets initially', () => {
      tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      expect(tracker.getByStatus('PENDING')).toHaveLength(1);
    });

    it('returns ACHIEVED targets after update', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 100, '2026-06-01');
      expect(tracker.getByStatus('ACHIEVED')).toHaveLength(1);
    });

    it('returns AT_RISK targets', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 30, '2026-06-01');
      expect(tracker.getByStatus('AT_RISK')).toHaveLength(1);
    });

    it('returns ON_TRACK targets', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 75, '2026-06-01');
      expect(tracker.getByStatus('ON_TRACK')).toHaveLength(1);
    });

    it('returns MISSED targets', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-01-01', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 50, '2026-03-01');
      expect(tracker.getByStatus('MISSED')).toHaveLength(1);
    });

    // parameterized: multiple achieved
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`getByStatus ACHIEVED count ${i + 1}`, () => {
        const t2 = new TargetTracker();
        Array.from({ length: i + 1 }, (_, j) => {
          const tgt = t2.addTarget(`obj-${j}`, 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
          t2.updateProgress(tgt.id, 100, '2026-06-01');
        });
        expect(t2.getByStatus('ACHIEVED')).toHaveLength(i + 1);
      });
    });
  });

  // ── getByAssignee ─────────────────────────────────────────────────────────
  describe('getByAssignee', () => {
    it('filters by assignee', () => {
      tracker.addTarget('obj-1', 'T1', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.addTarget('obj-1', 'T2', 100, 'KG', '2026-12-31', 'bob', '2026-01-01');
      tracker.addTarget('obj-1', 'T3', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      expect(tracker.getByAssignee('alice')).toHaveLength(2);
      expect(tracker.getByAssignee('bob')).toHaveLength(1);
    });

    it('returns empty for unknown assignee', () => {
      expect(tracker.getByAssignee('nobody')).toEqual([]);
    });

    // parameterized: 25 assignees
    Array.from({ length: 25 }, (_, i) => i).forEach(i => {
      it(`getByAssignee for assignee-${i}`, () => {
        const t = new TargetTracker();
        t.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-12-31', `assignee-${i}`, '2026-01-01');
        expect(t.getByAssignee(`assignee-${i}`)).toHaveLength(1);
        expect(t.getByAssignee(`assignee-${i + 1000}`)).toHaveLength(0);
      });
    });
  });

  // ── getAtRisk ─────────────────────────────────────────────────────────────
  describe('getAtRisk', () => {
    it('returns empty when no targets at risk', () => {
      expect(tracker.getAtRisk()).toHaveLength(0);
    });

    it('returns at-risk targets', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 30, '2026-06-01');
      expect(tracker.getAtRisk()).toHaveLength(1);
    });

    it('does not include on-track targets', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 80, '2026-06-01');
      expect(tracker.getAtRisk()).toHaveLength(0);
    });

    // parameterized: various at-risk counts
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`getAtRisk count ${i + 1}`, () => {
        const t2 = new TargetTracker();
        Array.from({ length: i + 1 }, (_, j) => {
          const tgt = t2.addTarget(`obj-${j}`, 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
          t2.updateProgress(tgt.id, 20, '2026-06-01');
        });
        expect(t2.getAtRisk()).toHaveLength(i + 1);
      });
    });
  });

  // ── getMissed ─────────────────────────────────────────────────────────────
  describe('getMissed', () => {
    it('returns empty when no missed targets', () => {
      expect(tracker.getMissed()).toHaveLength(0);
    });

    it('returns missed targets', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-01-01', 'alice', '2026-01-01');
      tracker.updateProgress(t.id, 50, '2026-03-01');
      expect(tracker.getMissed()).toHaveLength(1);
    });

    // parameterized
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`getMissed count ${i + 1}`, () => {
        const t2 = new TargetTracker();
        Array.from({ length: i + 1 }, (_, j) => {
          const tgt = t2.addTarget(`obj-${j}`, 'Desc', 100, 'NUMBER', '2026-01-01', 'u', '2026-01-01');
          t2.updateProgress(tgt.id, 30, '2026-03-01');
        });
        expect(t2.getMissed()).toHaveLength(i + 1);
      });
    });
  });

  // ── getAchievementRate ────────────────────────────────────────────────────
  describe('getAchievementRate', () => {
    it('returns 0 when no targets', () => {
      expect(tracker.getAchievementRate()).toBe(0);
    });

    it('returns 100 when all targets achieved', () => {
      const t1 = tracker.addTarget('obj-1', 'T1', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      const t2 = tracker.addTarget('obj-1', 'T2', 100, 'KG', '2026-12-31', 'bob', '2026-01-01');
      tracker.updateProgress(t1.id, 100, '2026-06-01');
      tracker.updateProgress(t2.id, 100, '2026-06-01');
      expect(tracker.getAchievementRate()).toBe(100);
    });

    it('returns 50 when half achieved', () => {
      const t1 = tracker.addTarget('obj-1', 'T1', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      const t2 = tracker.addTarget('obj-1', 'T2', 100, 'KG', '2026-12-31', 'bob', '2026-01-01');
      tracker.updateProgress(t1.id, 100, '2026-06-01');
      expect(tracker.getAchievementRate()).toBe(50);
    });

    it('returns 0 when none achieved', () => {
      tracker.addTarget('obj-1', 'T1', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.addTarget('obj-1', 'T2', 100, 'KG', '2026-12-31', 'bob', '2026-01-01');
      expect(tracker.getAchievementRate()).toBe(0);
    });

    // parameterized: achievement rate calculations
    Array.from({ length: 10 }, (_, i) => i + 1).forEach(achieved => {
      const total = 10;
      it(`getAchievementRate ${achieved}/${total} = ${(achieved / total) * 100}%`, () => {
        const t2 = new TargetTracker();
        const targets = Array.from({ length: total }, (_, j) =>
          t2.addTarget(`obj-${j}`, 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01')
        );
        for (let j = 0; j < achieved; j++) {
          t2.updateProgress(targets[j].id, 100, '2026-06-01');
        }
        expect(t2.getAchievementRate()).toBeCloseTo((achieved / total) * 100);
      });
    });

    // more rate iterations
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`getAchievementRate iteration ${i}`, () => {
        const t2 = new TargetTracker();
        const tgt = t2.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
        t2.updateProgress(tgt.id, 100, '2026-06-01');
        expect(t2.getAchievementRate()).toBe(100);
      });
    });
  });

  // ── getTargetCount ────────────────────────────────────────────────────────
  describe('getTargetCount', () => {
    it('returns 0 initially', () => {
      expect(tracker.getTargetCount()).toBe(0);
    });

    // parameterized: count 1..40
    Array.from({ length: 40 }, (_, i) => i + 1).forEach(n => {
      it(`getTargetCount returns ${n} after ${n} adds`, () => {
        const t2 = new TargetTracker();
        Array.from({ length: n }, (_, j) =>
          t2.addTarget(`obj-${j}`, 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01')
        );
        expect(t2.getTargetCount()).toBe(n);
      });
    });
  });

  // ── getProgressCount ──────────────────────────────────────────────────────
  describe('getProgressCount', () => {
    it('returns 0 initially', () => {
      expect(tracker.getProgressCount()).toBe(0);
    });

    it('counts progress records correctly', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'KG', '2026-12-31', 'alice', '2026-01-01');
      tracker.recordProgress(t.id, 10, '2026-01-01', 'alice');
      tracker.recordProgress(t.id, 20, '2026-02-01', 'alice');
      tracker.recordProgress(t.id, 30, '2026-03-01', 'alice');
      expect(tracker.getProgressCount()).toBe(3);
    });

    // parameterized: 1..30 records
    Array.from({ length: 30 }, (_, i) => i + 1).forEach(n => {
      it(`getProgressCount returns ${n} after ${n} records`, () => {
        const t2 = new TargetTracker();
        const tgt = t2.addTarget('obj-1', 'Desc', 1000, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
        Array.from({ length: n }, (_, j) =>
          t2.recordProgress(tgt.id, j, '2026-01-01', 'u')
        );
        expect(t2.getProgressCount()).toBe(n);
      });
    });
  });

  // ── combined tracker tests ────────────────────────────────────────────────
  describe('combined scenarios', () => {
    it('multiple objectives each with multiple targets', () => {
      const objIds = ['obj-A', 'obj-B', 'obj-C'];
      objIds.forEach(objId => {
        Array.from({ length: 3 }, (_, i) =>
          tracker.addTarget(objId, `Target ${i}`, 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01')
        );
      });
      expect(tracker.getTargetCount()).toBe(9);
      objIds.forEach(objId => {
        expect(tracker.getByObjective(objId)).toHaveLength(3);
      });
    });

    it('progress records accumulate across targets', () => {
      const t1 = tracker.addTarget('obj-1', 'T1', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
      const t2 = tracker.addTarget('obj-1', 'T2', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
      tracker.recordProgress(t1.id, 10, '2026-01-01', 'u');
      tracker.recordProgress(t1.id, 20, '2026-02-01', 'u');
      tracker.recordProgress(t2.id, 50, '2026-01-01', 'u');
      expect(tracker.getProgressCount()).toBe(3);
      expect(tracker.getProgressHistory(t1.id)).toHaveLength(2);
      expect(tracker.getProgressHistory(t2.id)).toHaveLength(1);
    });

    it('achievement rate after mixed updates', () => {
      const targets = Array.from({ length: 5 }, (_, i) =>
        tracker.addTarget(`obj-${i}`, 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01')
      );
      tracker.updateProgress(targets[0].id, 100, '2026-06-01');
      tracker.updateProgress(targets[1].id, 100, '2026-06-01');
      // 3 not achieved
      expect(tracker.getAchievementRate()).toBeCloseTo(40);
    });

    it('getAtRisk and getMissed do not overlap', () => {
      const tRisk = tracker.addTarget('obj-1', 'T1', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
      tracker.updateProgress(tRisk.id, 30, '2026-06-01');

      const tMissed = tracker.addTarget('obj-1', 'T2', 100, 'NUMBER', '2026-01-01', 'u', '2026-01-01');
      tracker.updateProgress(tMissed.id, 30, '2026-03-01');

      const atRisk = tracker.getAtRisk();
      const missed = tracker.getMissed();
      const atRiskIds = new Set(atRisk.map(t => t.id));
      const missedIds = new Set(missed.map(t => t.id));
      expect([...atRiskIds].some(id => missedIds.has(id))).toBe(false);
    });

    // parameterized: 30 combined runs
    Array.from({ length: 30 }, (_, i) => i).forEach(i => {
      it(`combined scenario run ${i}`, () => {
        const t2 = new TargetTracker();
        const tgt = t2.addTarget(`obj-${i}`, 'Desc', 100, 'NUMBER', '2026-12-31', `user-${i}`, '2026-01-01');
        t2.recordProgress(tgt.id, 50, '2026-06-01', `user-${i}`, `note-${i}`);
        const history = t2.getProgressHistory(tgt.id);
        expect(history).toHaveLength(1);
        expect(history[0].value).toBe(50);
        expect(history[0].recordedBy).toBe(`user-${i}`);
        expect(history[0].notes).toBe(`note-${i}`);
      });
    });
  });

  // ── status transition edge cases ──────────────────────────────────────────
  describe('status transitions edge cases', () => {
    it('target at exactly 70% is ON_TRACK', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
      tracker.updateProgress(t.id, 70, '2026-06-01');
      expect(tracker.getByObjective('obj-1')[0].status).toBe('ON_TRACK');
    });

    it('target at exactly 100% is ACHIEVED', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
      tracker.updateProgress(t.id, 100, '2026-06-01');
      expect(tracker.getByObjective('obj-1')[0].status).toBe('ACHIEVED');
    });

    it('target at 69% is AT_RISK', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
      tracker.updateProgress(t.id, 69, '2026-06-01');
      expect(tracker.getByObjective('obj-1')[0].status).toBe('AT_RISK');
    });

    it('overdue check: dueDate equal to lastUpdated is not overdue', () => {
      // dueDate < lastUpdated → MISSED. Equal → not missed → check 70%
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-06-01', 'u', '2026-01-01');
      tracker.updateProgress(t.id, 50, '2026-06-01');
      // dueDate '2026-06-01' is NOT < '2026-06-01', so not missed
      expect(tracker.getByObjective('obj-1')[0].status).toBe('AT_RISK');
    });

    it('overdue check: dueDate strictly before lastUpdated → MISSED', () => {
      const t = tracker.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-05-31', 'u', '2026-01-01');
      tracker.updateProgress(t.id, 50, '2026-06-01');
      expect(tracker.getByObjective('obj-1')[0].status).toBe('MISSED');
    });

    // parameterized: boundary value analysis for 70%
    [
      { value: 69, expected: 'AT_RISK' as TargetStatus },
      { value: 70, expected: 'ON_TRACK' as TargetStatus },
      { value: 71, expected: 'ON_TRACK' as TargetStatus },
      { value: 99, expected: 'ON_TRACK' as TargetStatus },
      { value: 100, expected: 'ACHIEVED' as TargetStatus },
      { value: 101, expected: 'ACHIEVED' as TargetStatus },
    ].forEach(({ value, expected }) => {
      it(`value ${value}/100 → ${expected}`, () => {
        const t = tracker.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
        tracker.updateProgress(t.id, value, '2026-06-01');
        expect(tracker.getByObjective('obj-1')[0].status).toBe(expected);
      });
    });

    // more parameterized edge cases
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`status edge case iteration ${i}: value=${i * 5}`, () => {
        const t = tracker.addTarget('obj-1', 'Desc', 100, 'NUMBER', '2026-12-31', 'u', '2026-01-01');
        const value = i * 5;
        tracker.updateProgress(t.id, value, '2026-06-01');
        const status = tracker.getByObjective('obj-1')[0].status;
        if (value >= 100) expect(status).toBe('ACHIEVED');
        else if (value >= 70) expect(status).toBe('ON_TRACK');
        else expect(status).toBe('AT_RISK');
      });
    });
  });
});
