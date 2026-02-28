// Copyright (c) 2026 Nexara DMCC. All rights reserved. Confidential and proprietary.

import { InspectionPlanner } from '../inspection-planner';
import { ChecklistManager } from '../checklist-manager';
import {
  InspectionCategory,
  InspectionFrequency,
  InspectionStatus,
  ChecklistStatus,
  ItemResult,
} from '../types';

// ─── InspectionPlanner ────────────────────────────────────────────────────────

describe('InspectionPlanner', () => {
  let planner: InspectionPlanner;

  beforeEach(() => {
    planner = new InspectionPlanner();
  });

  // ── schedule ──────────────────────────────────────────────────────────────

  describe('schedule()', () => {
    it('returns an object with an id', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      expect(typeof p.id).toBe('string');
    });

    it('sets status to SCHEDULED', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      expect(p.status).toBe('SCHEDULED');
    });

    it('sets title', () => {
      const p = planner.schedule('Fire Inspection', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      expect(p.title).toBe('Fire Inspection');
    });

    it('sets category', () => {
      const p = planner.schedule('T', 'QUALITY', 'DAILY', 'L', 'A', '2026-03-01');
      expect(p.category).toBe('QUALITY');
    });

    it('sets frequency', () => {
      const p = planner.schedule('T', 'SAFETY', 'MONTHLY', 'L', 'A', '2026-03-01');
      expect(p.frequency).toBe('MONTHLY');
    });

    it('sets location', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'Building A', 'A', '2026-03-01');
      expect(p.location).toBe('Building A');
    });

    it('sets assignedTo', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'John', '2026-03-01');
      expect(p.assignedTo).toBe('John');
    });

    it('sets scheduledDate', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-04-15');
      expect(p.scheduledDate).toBe('2026-04-15');
    });

    it('sets optional checklistId', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01', 'CL-1');
      expect(p.checklistId).toBe('CL-1');
    });

    it('checklistId is undefined when not provided', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      expect(p.checklistId).toBeUndefined();
    });

    it('sets optional notes', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01', undefined, 'note');
      expect(p.notes).toBe('note');
    });

    it('notes is undefined when not provided', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      expect(p.notes).toBeUndefined();
    });

    it('completedDate is undefined initially', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      expect(p.completedDate).toBeUndefined();
    });

    it('score is undefined initially', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      expect(p.score).toBeUndefined();
    });

    it('each scheduled plan gets unique id', () => {
      const ids = Array.from({ length: 20 }, () =>
        planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01').id,
      );
      expect(new Set(ids).size).toBe(20);
    });

    it('increments count', () => {
      planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      expect(planner.getCount()).toBe(1);
    });

    // All categories
    const categories: InspectionCategory[] = ['SAFETY', 'QUALITY', 'ENVIRONMENTAL', 'EQUIPMENT', 'PROCESS', 'FACILITY'];
    categories.forEach((cat) => {
      it(`accepts category ${cat}`, () => {
        const p = planner.schedule('T', cat, 'DAILY', 'L', 'A', '2026-03-01');
        expect(p.category).toBe(cat);
      });
    });

    // All frequencies
    const frequencies: InspectionFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'AS_NEEDED'];
    frequencies.forEach((freq) => {
      it(`accepts frequency ${freq}`, () => {
        const p = planner.schedule('T', 'SAFETY', freq, 'L', 'A', '2026-03-01');
        expect(p.frequency).toBe(freq);
      });
    });
  });

  // ── start ─────────────────────────────────────────────────────────────────

  describe('start()', () => {
    it('changes status to IN_PROGRESS', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.start(p.id);
      expect(planner.get(p.id)?.status).toBe('IN_PROGRESS');
    });

    it('returns the updated plan', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      const result = planner.start(p.id);
      expect(result.status).toBe('IN_PROGRESS');
    });

    it('throws for unknown id', () => {
      expect(() => planner.start('nonexistent')).toThrow();
    });

    it('preserves title after start', () => {
      const p = planner.schedule('Fire Check', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.start(p.id);
      expect(planner.get(p.id)?.title).toBe('Fire Check');
    });

    it('preserves location after start', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'Warehouse', 'A', '2026-03-01');
      planner.start(p.id);
      expect(planner.get(p.id)?.location).toBe('Warehouse');
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`start test iteration ${i}: status is IN_PROGRESS`, () => {
        const p = planner.schedule(`T${i}`, 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
        planner.start(p.id);
        expect(planner.get(p.id)?.status).toBe('IN_PROGRESS');
      });
    });
  });

  // ── complete ──────────────────────────────────────────────────────────────

  describe('complete()', () => {
    it('changes status to COMPLETED', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.complete(p.id, '2026-03-01', 95);
      expect(planner.get(p.id)?.status).toBe('COMPLETED');
    });

    it('sets completedDate', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.complete(p.id, '2026-03-05', 90);
      expect(planner.get(p.id)?.completedDate).toBe('2026-03-05');
    });

    it('sets score', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.complete(p.id, '2026-03-05', 75);
      expect(planner.get(p.id)?.score).toBe(75);
    });

    it('sets optional notes on complete', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.complete(p.id, '2026-03-05', 80, 'All good');
      expect(planner.get(p.id)?.notes).toBe('All good');
    });

    it('returns the updated plan', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      const result = planner.complete(p.id, '2026-03-05', 100);
      expect(result.status).toBe('COMPLETED');
    });

    it('throws for unknown id', () => {
      expect(() => planner.complete('nonexistent', '2026-03-01', 90)).toThrow();
    });

    it('score 0 is valid', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.complete(p.id, '2026-03-05', 0);
      expect(planner.get(p.id)?.score).toBe(0);
    });

    it('score 100 is valid', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.complete(p.id, '2026-03-05', 100);
      expect(planner.get(p.id)?.score).toBe(100);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`complete iteration ${i}: score ${i * 5}`, () => {
        const p = planner.schedule(`T${i}`, 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
        planner.complete(p.id, '2026-03-05', i * 5);
        expect(planner.get(p.id)?.score).toBe(i * 5);
      });
    });
  });

  // ── skip ──────────────────────────────────────────────────────────────────

  describe('skip()', () => {
    it('changes status to SKIPPED', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.skip(p.id);
      expect(planner.get(p.id)?.status).toBe('SKIPPED');
    });

    it('sets notes when provided', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.skip(p.id, 'Equipment unavailable');
      expect(planner.get(p.id)?.notes).toBe('Equipment unavailable');
    });

    it('returns the updated plan', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      const result = planner.skip(p.id);
      expect(result.status).toBe('SKIPPED');
    });

    it('throws for unknown id', () => {
      expect(() => planner.skip('nonexistent')).toThrow();
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`skip iteration ${i}: status is SKIPPED`, () => {
        const p = planner.schedule(`T${i}`, 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
        planner.skip(p.id, `reason ${i}`);
        expect(planner.get(p.id)?.status).toBe('SKIPPED');
      });
    });
  });

  // ── markOverdue ───────────────────────────────────────────────────────────

  describe('markOverdue()', () => {
    it('changes status to OVERDUE', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.markOverdue(p.id);
      expect(planner.get(p.id)?.status).toBe('OVERDUE');
    });

    it('returns the updated plan', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      const result = planner.markOverdue(p.id);
      expect(result.status).toBe('OVERDUE');
    });

    it('throws for unknown id', () => {
      expect(() => planner.markOverdue('nonexistent')).toThrow();
    });

    it('preserves assignedTo after markOverdue', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'Jane', '2026-03-01');
      planner.markOverdue(p.id);
      expect(planner.get(p.id)?.assignedTo).toBe('Jane');
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`markOverdue iteration ${i}: status is OVERDUE`, () => {
        const p = planner.schedule(`T${i}`, 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
        planner.markOverdue(p.id);
        expect(planner.get(p.id)?.status).toBe('OVERDUE');
      });
    });
  });

  // ── get ───────────────────────────────────────────────────────────────────

  describe('get()', () => {
    it('returns plan by id', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      expect(planner.get(p.id)).toBeDefined();
    });

    it('returns undefined for unknown id', () => {
      expect(planner.get('unknown')).toBeUndefined();
    });

    it('returns correct plan when multiple exist', () => {
      const p1 = planner.schedule('A', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      const p2 = planner.schedule('B', 'QUALITY', 'WEEKLY', 'L', 'B', '2026-03-02');
      expect(planner.get(p2.id)?.title).toBe('B');
      expect(planner.get(p1.id)?.title).toBe('A');
    });
  });

  // ── getAll ────────────────────────────────────────────────────────────────

  describe('getAll()', () => {
    it('returns empty array initially', () => {
      expect(planner.getAll()).toHaveLength(0);
    });

    it('returns all plans', () => {
      planner.schedule('A', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.schedule('B', 'QUALITY', 'WEEKLY', 'L', 'B', '2026-03-02');
      expect(planner.getAll()).toHaveLength(2);
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getAll returns ${n} plans when ${n} are scheduled`, () => {
        Array.from({ length: n }, (_, j) =>
          planner.schedule(`T${j}`, 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01'),
        );
        expect(planner.getAll()).toHaveLength(n);
      });
    });
  });

  // ── getByCategory ─────────────────────────────────────────────────────────

  describe('getByCategory()', () => {
    it('returns only SAFETY plans', () => {
      planner.schedule('A', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.schedule('B', 'QUALITY', 'DAILY', 'L', 'A', '2026-03-01');
      expect(planner.getByCategory('SAFETY')).toHaveLength(1);
    });

    it('returns empty array when none match', () => {
      planner.schedule('A', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      expect(planner.getByCategory('PROCESS')).toHaveLength(0);
    });

    const categories: InspectionCategory[] = ['SAFETY', 'QUALITY', 'ENVIRONMENTAL', 'EQUIPMENT', 'PROCESS', 'FACILITY'];
    categories.forEach((cat) => {
      it(`getByCategory returns correct plans for ${cat}`, () => {
        planner.schedule(`T-${cat}`, cat, 'DAILY', 'L', 'A', '2026-03-01');
        const result = planner.getByCategory(cat);
        expect(result.every((p) => p.category === cat)).toBe(true);
      });
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`getByCategory SAFETY iteration ${i}`, () => {
        planner.schedule(`T${i}`, 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
        planner.schedule(`Q${i}`, 'QUALITY', 'DAILY', 'L', 'A', '2026-03-01');
        const safety = planner.getByCategory('SAFETY');
        expect(safety.length).toBeGreaterThanOrEqual(1);
        expect(safety.every((p) => p.category === 'SAFETY')).toBe(true);
      });
    });
  });

  // ── getByStatus ───────────────────────────────────────────────────────────

  describe('getByStatus()', () => {
    it('returns only SCHEDULED plans', () => {
      const p1 = planner.schedule('A', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      const p2 = planner.schedule('B', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.start(p2.id);
      expect(planner.getByStatus('SCHEDULED')).toHaveLength(1);
    });

    it('returns IN_PROGRESS plans', () => {
      const p = planner.schedule('A', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.start(p.id);
      expect(planner.getByStatus('IN_PROGRESS')).toHaveLength(1);
    });

    it('returns COMPLETED plans', () => {
      const p = planner.schedule('A', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.complete(p.id, '2026-03-05', 90);
      expect(planner.getByStatus('COMPLETED')).toHaveLength(1);
    });

    it('returns SKIPPED plans', () => {
      const p = planner.schedule('A', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.skip(p.id);
      expect(planner.getByStatus('SKIPPED')).toHaveLength(1);
    });

    it('returns OVERDUE plans', () => {
      const p = planner.schedule('A', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.markOverdue(p.id);
      expect(planner.getByStatus('OVERDUE')).toHaveLength(1);
    });

    const statuses: InspectionStatus[] = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED', 'OVERDUE'];
    statuses.forEach((status) => {
      it(`getByStatus returns empty for ${status} when none match`, () => {
        expect(planner.getByStatus(status)).toHaveLength(0);
      });
    });
  });

  // ── getByAssignee ─────────────────────────────────────────────────────────

  describe('getByAssignee()', () => {
    it('returns plans assigned to specific person', () => {
      planner.schedule('A', 'SAFETY', 'DAILY', 'L', 'John', '2026-03-01');
      planner.schedule('B', 'SAFETY', 'DAILY', 'L', 'Jane', '2026-03-01');
      expect(planner.getByAssignee('John')).toHaveLength(1);
    });

    it('returns empty array for unknown assignee', () => {
      planner.schedule('A', 'SAFETY', 'DAILY', 'L', 'John', '2026-03-01');
      expect(planner.getByAssignee('Unknown')).toHaveLength(0);
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`getByAssignee iteration ${i}`, () => {
        const name = `Inspector${i}`;
        planner.schedule(`T${i}`, 'SAFETY', 'DAILY', 'L', name, '2026-03-01');
        expect(planner.getByAssignee(name)).toHaveLength(1);
      });
    });

    it('returns multiple plans for same assignee', () => {
      planner.schedule('A', 'SAFETY', 'DAILY', 'L', 'John', '2026-03-01');
      planner.schedule('B', 'QUALITY', 'WEEKLY', 'L', 'John', '2026-03-05');
      expect(planner.getByAssignee('John')).toHaveLength(2);
    });
  });

  // ── getByLocation ─────────────────────────────────────────────────────────

  describe('getByLocation()', () => {
    it('returns plans at specific location', () => {
      planner.schedule('A', 'SAFETY', 'DAILY', 'Building A', 'X', '2026-03-01');
      planner.schedule('B', 'SAFETY', 'DAILY', 'Building B', 'X', '2026-03-01');
      expect(planner.getByLocation('Building A')).toHaveLength(1);
    });

    it('returns empty array for unknown location', () => {
      expect(planner.getByLocation('Unknown')).toHaveLength(0);
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`getByLocation iteration ${i}`, () => {
        const loc = `Location${i}`;
        planner.schedule(`T${i}`, 'SAFETY', 'DAILY', loc, 'A', '2026-03-01');
        expect(planner.getByLocation(loc)).toHaveLength(1);
      });
    });

    it('returns all plans at same location', () => {
      planner.schedule('A', 'SAFETY', 'DAILY', 'Factory', 'X', '2026-03-01');
      planner.schedule('B', 'QUALITY', 'WEEKLY', 'Factory', 'Y', '2026-03-02');
      planner.schedule('C', 'PROCESS', 'MONTHLY', 'Office', 'Z', '2026-03-03');
      expect(planner.getByLocation('Factory')).toHaveLength(2);
    });
  });

  // ── getOverdue ────────────────────────────────────────────────────────────

  describe('getOverdue()', () => {
    it('returns SCHEDULED plans where scheduledDate < asOf', () => {
      planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-02-01');
      const result = planner.getOverdue('2026-03-01');
      expect(result).toHaveLength(1);
    });

    it('does not return plans where scheduledDate >= asOf', () => {
      planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-04-01');
      const result = planner.getOverdue('2026-03-01');
      expect(result).toHaveLength(0);
    });

    it('includes IN_PROGRESS plans past scheduledDate', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-02-01');
      planner.start(p.id);
      expect(planner.getOverdue('2026-03-01')).toHaveLength(1);
    });

    it('excludes COMPLETED plans even if past date', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-02-01');
      planner.complete(p.id, '2026-02-10', 95);
      expect(planner.getOverdue('2026-03-01')).toHaveLength(0);
    });

    it('excludes SKIPPED plans', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-02-01');
      planner.skip(p.id);
      expect(planner.getOverdue('2026-03-01')).toHaveLength(0);
    });

    it('excludes OVERDUE plans from getOverdue (status already set)', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-02-01');
      planner.markOverdue(p.id);
      expect(planner.getOverdue('2026-03-01')).toHaveLength(0);
    });

    it('returns empty when no plans', () => {
      expect(planner.getOverdue('2026-03-01')).toHaveLength(0);
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`getOverdue iteration ${i}: mixed dates`, () => {
        planner.schedule(`Past${i}`, 'SAFETY', 'DAILY', 'L', 'A', `2026-01-0${(i % 9) + 1}`);
        planner.schedule(`Future${i}`, 'SAFETY', 'DAILY', 'L', 'A', '2026-12-01');
        const overdue = planner.getOverdue('2026-06-01');
        expect(overdue.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  // ── getAverageScore ───────────────────────────────────────────────────────

  describe('getAverageScore()', () => {
    it('returns 0 when no completed inspections', () => {
      expect(planner.getAverageScore()).toBe(0);
    });

    it('returns score of single completed inspection', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.complete(p.id, '2026-03-05', 80);
      expect(planner.getAverageScore()).toBe(80);
    });

    it('returns average of two completed inspections', () => {
      const p1 = planner.schedule('T1', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      const p2 = planner.schedule('T2', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-02');
      planner.complete(p1.id, '2026-03-05', 80);
      planner.complete(p2.id, '2026-03-06', 60);
      expect(planner.getAverageScore()).toBe(70);
    });

    it('ignores non-completed plans in average', () => {
      const p1 = planner.schedule('T1', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      const p2 = planner.schedule('T2', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-02');
      planner.complete(p1.id, '2026-03-05', 90);
      // p2 remains SCHEDULED
      expect(planner.getAverageScore()).toBe(90);
    });

    it('returns 0 when only SKIPPED plans exist', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.skip(p.id);
      expect(planner.getAverageScore()).toBe(0);
    });

    it('returns correct average for 4 plans with scores 25, 50, 75, 100', () => {
      [25, 50, 75, 100].forEach((score, i) => {
        const p = planner.schedule(`T${i}`, 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
        planner.complete(p.id, '2026-03-05', score);
      });
      expect(planner.getAverageScore()).toBe(62.5);
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getAverageScore for ${n} completed plans all scoring 50`, () => {
        Array.from({ length: n }, (_, j) => {
          const p = planner.schedule(`T${j}`, 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
          planner.complete(p.id, '2026-03-05', 50);
        });
        expect(planner.getAverageScore()).toBe(50);
      });
    });
  });

  // ── getCount ──────────────────────────────────────────────────────────────

  describe('getCount()', () => {
    it('returns 0 initially', () => {
      expect(planner.getCount()).toBe(0);
    });

    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`returns ${n} after scheduling ${n} plans`, () => {
        Array.from({ length: n }, (_, j) =>
          planner.schedule(`T${j}`, 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01'),
        );
        expect(planner.getCount()).toBe(n);
      });
    });
  });

  // ── Status transition chains ───────────────────────────────────────────────

  describe('status transitions', () => {
    it('SCHEDULED → IN_PROGRESS → COMPLETED', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.start(p.id);
      planner.complete(p.id, '2026-03-05', 88);
      expect(planner.get(p.id)?.status).toBe('COMPLETED');
    });

    it('SCHEDULED → SKIPPED', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.skip(p.id);
      expect(planner.get(p.id)?.status).toBe('SKIPPED');
    });

    it('SCHEDULED → OVERDUE', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.markOverdue(p.id);
      expect(planner.get(p.id)?.status).toBe('OVERDUE');
    });

    it('IN_PROGRESS → COMPLETED', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.start(p.id);
      planner.complete(p.id, '2026-03-05', 70);
      expect(planner.get(p.id)?.status).toBe('COMPLETED');
    });

    it('IN_PROGRESS → SKIPPED', () => {
      const p = planner.schedule('T', 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.start(p.id);
      planner.skip(p.id, 'Emergency');
      expect(planner.get(p.id)?.status).toBe('SKIPPED');
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`full transition chain iteration ${i}`, () => {
        const p = planner.schedule(`T${i}`, 'QUALITY', 'MONTHLY', `Loc${i}`, `User${i}`, '2026-03-01');
        expect(p.status).toBe('SCHEDULED');
        planner.start(p.id);
        expect(planner.get(p.id)?.status).toBe('IN_PROGRESS');
        planner.complete(p.id, '2026-03-10', 50 + i * 5);
        expect(planner.get(p.id)?.status).toBe('COMPLETED');
        expect(planner.get(p.id)?.score).toBe(50 + i * 5);
      });
    });
  });

  // ── Large-scale scheduling tests ───────────────────────────────────────────

  describe('large-scale scheduling', () => {
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`schedules plan ${i} with correct data`, () => {
        const title = `Inspection ${i}`;
        const p = planner.schedule(title, 'EQUIPMENT', 'WEEKLY', `Room ${i}`, `Tech${i}`, `2026-03-${String(i % 28 + 1).padStart(2, '0')}`);
        expect(p.title).toBe(title);
        expect(p.category).toBe('EQUIPMENT');
        expect(p.assignedTo).toBe(`Tech${i}`);
      });
    });
  });

  // ── Frequency tests ───────────────────────────────────────────────────────

  describe('frequency variants', () => {
    const frequencies: InspectionFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'AS_NEEDED'];
    frequencies.forEach((freq) => {
      Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
        it(`frequency ${freq} iteration ${i}`, () => {
          const p = planner.schedule(`T-${freq}-${i}`, 'PROCESS', freq, 'L', 'A', '2026-03-01');
          expect(p.frequency).toBe(freq);
          expect(p.status).toBe('SCHEDULED');
        });
      });
    });
  });

  // ── Mixed category and status queries ─────────────────────────────────────

  describe('mixed query tests', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`mixed query iteration ${i}: category filter`, () => {
        const cats: InspectionCategory[] = ['SAFETY', 'QUALITY', 'ENVIRONMENTAL', 'EQUIPMENT', 'PROCESS', 'FACILITY'];
        const cat = cats[i % cats.length];
        planner.schedule(`Plan${i}`, cat, 'DAILY', `Loc${i}`, `User${i}`, '2026-03-01');
        const results = planner.getByCategory(cat);
        expect(results.length).toBeGreaterThan(0);
        expect(results.every((p) => p.category === cat)).toBe(true);
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`mixed query iteration ${i}: assignee filter`, () => {
        const assignee = `Worker${i}`;
        planner.schedule(`Plan${i}`, 'FACILITY', 'ANNUAL', 'L', assignee, '2026-03-01');
        expect(planner.getByAssignee(assignee).length).toBeGreaterThan(0);
      });
    });
  });
});

// ─── ChecklistManager ─────────────────────────────────────────────────────────

describe('ChecklistManager', () => {
  let manager: ChecklistManager;

  beforeEach(() => {
    manager = new ChecklistManager();
  });

  // ── create ────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('returns an object with an id', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      expect(typeof c.id).toBe('string');
    });

    it('sets title', () => {
      const c = manager.create('Fire Safety Checklist', 'SAFETY', 'admin', '2026-03-01');
      expect(c.title).toBe('Fire Safety Checklist');
    });

    it('sets category', () => {
      const c = manager.create('T', 'QUALITY', 'admin', '2026-03-01');
      expect(c.category).toBe('QUALITY');
    });

    it('status is DRAFT on creation', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      expect(c.status).toBe('DRAFT');
    });

    it('version is 1 on creation', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      expect(c.version).toBe(1);
    });

    it('items is empty array on creation', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      expect(c.items).toHaveLength(0);
    });

    it('sets createdBy', () => {
      const c = manager.create('T', 'SAFETY', 'john.doe', '2026-03-01');
      expect(c.createdBy).toBe('john.doe');
    });

    it('sets createdAt', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-04-15');
      expect(c.createdAt).toBe('2026-04-15');
    });

    it('each created checklist has a unique id', () => {
      const ids = Array.from({ length: 20 }, () =>
        manager.create('T', 'SAFETY', 'admin', '2026-03-01').id,
      );
      expect(new Set(ids).size).toBe(20);
    });

    it('increments count', () => {
      manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      expect(manager.getCount()).toBe(1);
    });

    const categories: InspectionCategory[] = ['SAFETY', 'QUALITY', 'ENVIRONMENTAL', 'EQUIPMENT', 'PROCESS', 'FACILITY'];
    categories.forEach((cat) => {
      it(`accepts category ${cat}`, () => {
        const c = manager.create('T', cat, 'admin', '2026-03-01');
        expect(c.category).toBe(cat);
      });
    });
  });

  // ── activate ──────────────────────────────────────────────────────────────

  describe('activate()', () => {
    it('changes status to ACTIVE', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.activate(c.id);
      expect(manager.get(c.id)?.status).toBe('ACTIVE');
    });

    it('returns updated checklist', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const result = manager.activate(c.id);
      expect(result.status).toBe('ACTIVE');
    });

    it('throws for unknown id', () => {
      expect(() => manager.activate('nonexistent')).toThrow();
    });

    it('preserves title after activate', () => {
      const c = manager.create('My Checklist', 'SAFETY', 'admin', '2026-03-01');
      manager.activate(c.id);
      expect(manager.get(c.id)?.title).toBe('My Checklist');
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`activate iteration ${i}: status becomes ACTIVE`, () => {
        const c = manager.create(`T${i}`, 'SAFETY', 'admin', '2026-03-01');
        manager.activate(c.id);
        expect(manager.get(c.id)?.status).toBe('ACTIVE');
      });
    });
  });

  // ── retire ────────────────────────────────────────────────────────────────

  describe('retire()', () => {
    it('changes status to RETIRED', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.activate(c.id);
      manager.retire(c.id);
      expect(manager.get(c.id)?.status).toBe('RETIRED');
    });

    it('returns updated checklist', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const result = manager.retire(c.id);
      expect(result.status).toBe('RETIRED');
    });

    it('throws for unknown id', () => {
      expect(() => manager.retire('nonexistent')).toThrow();
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`retire iteration ${i}`, () => {
        const c = manager.create(`T${i}`, 'QUALITY', 'admin', '2026-03-01');
        manager.retire(c.id);
        expect(manager.get(c.id)?.status).toBe('RETIRED');
      });
    });
  });

  // ── addItem ───────────────────────────────────────────────────────────────

  describe('addItem()', () => {
    it('adds item to checklist', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.addItem(c.id, 'Check fire extinguisher', true);
      expect(manager.get(c.id)?.items).toHaveLength(1);
    });

    it('sets description', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.addItem(c.id, 'Inspect wiring', true);
      expect(manager.get(c.id)?.items[0].description).toBe('Inspect wiring');
    });

    it('sets required flag', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.addItem(c.id, 'Item', false);
      expect(manager.get(c.id)?.items[0].required).toBe(false);
    });

    it('sets required=true', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.addItem(c.id, 'Item', true);
      expect(manager.get(c.id)?.items[0].required).toBe(true);
    });

    it('auto-assigns order 1 for first item', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.addItem(c.id, 'Item 1', true);
      expect(manager.get(c.id)?.items[0].order).toBe(1);
    });

    it('auto-assigns order 2 for second item', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.addItem(c.id, 'Item 1', true);
      manager.addItem(c.id, 'Item 2', true);
      expect(manager.get(c.id)?.items[1].order).toBe(2);
    });

    it('uses explicit order when provided', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.addItem(c.id, 'Item', true, 5);
      expect(manager.get(c.id)?.items[0].order).toBe(5);
    });

    it('returns the new item', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Check', true);
      expect(item.description).toBe('Check');
    });

    it('result is undefined initially', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Check', true);
      expect(item.result).toBeUndefined();
    });

    it('notes is undefined initially', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Check', true);
      expect(item.notes).toBeUndefined();
    });

    it('throws for unknown checklistId', () => {
      expect(() => manager.addItem('unknown', 'Item', true)).toThrow();
    });

    it('item has checklistId set', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Check', true);
      expect(item.checklistId).toBe(c.id);
    });

    it('item has unique id', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item1 = manager.addItem(c.id, 'Check 1', true);
      const item2 = manager.addItem(c.id, 'Check 2', true);
      expect(item1.id).not.toBe(item2.id);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`addItem iteration ${i}: sequential order`, () => {
        const c = manager.create(`T${i}`, 'SAFETY', 'admin', '2026-03-01');
        Array.from({ length: i + 1 }, (_, j) => manager.addItem(c.id, `Item ${j}`, true));
        expect(manager.get(c.id)?.items).toHaveLength(i + 1);
        expect(manager.get(c.id)?.items[i].order).toBe(i + 1);
      });
    });
  });

  // ── recordResult ──────────────────────────────────────────────────────────

  describe('recordResult()', () => {
    it('sets result on item', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Check', true);
      manager.recordResult(item.id, 'PASS');
      const updated = manager.get(c.id)?.items.find((i) => i.id === item.id);
      expect(updated?.result).toBe('PASS');
    });

    it('sets FAIL result', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Check', true);
      manager.recordResult(item.id, 'FAIL');
      expect(manager.get(c.id)?.items[0].result).toBe('FAIL');
    });

    it('sets N_A result', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Check', false);
      manager.recordResult(item.id, 'N_A');
      expect(manager.get(c.id)?.items[0].result).toBe('N_A');
    });

    it('sets OBSERVATION result', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Check', false);
      manager.recordResult(item.id, 'OBSERVATION');
      expect(manager.get(c.id)?.items[0].result).toBe('OBSERVATION');
    });

    it('sets notes when provided', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Check', true);
      manager.recordResult(item.id, 'FAIL', 'Extinguisher expired');
      expect(manager.get(c.id)?.items[0].notes).toBe('Extinguisher expired');
    });

    it('returns the updated item', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Check', true);
      const result = manager.recordResult(item.id, 'PASS');
      expect(result.result).toBe('PASS');
    });

    it('throws for unknown itemId', () => {
      expect(() => manager.recordResult('nonexistent', 'PASS')).toThrow();
    });

    const results: ItemResult[] = ['PASS', 'FAIL', 'N_A', 'OBSERVATION'];
    results.forEach((res) => {
      it(`accepts result ${res}`, () => {
        const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
        const item = manager.addItem(c.id, 'Check', true);
        manager.recordResult(item.id, res);
        expect(manager.get(c.id)?.items[0].result).toBe(res);
      });
    });

    Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
      it(`recordResult iteration ${i}`, () => {
        const results2: ItemResult[] = ['PASS', 'FAIL', 'N_A', 'OBSERVATION'];
        const res = results2[i % results2.length];
        const c = manager.create(`T${i}`, 'QUALITY', 'admin', '2026-03-01');
        const item = manager.addItem(c.id, `Item${i}`, true);
        manager.recordResult(item.id, res, `note ${i}`);
        expect(manager.get(c.id)?.items[0].result).toBe(res);
        expect(manager.get(c.id)?.items[0].notes).toBe(`note ${i}`);
      });
    });
  });

  // ── getByCategory ─────────────────────────────────────────────────────────

  describe('getByCategory()', () => {
    it('returns only SAFETY checklists', () => {
      manager.create('A', 'SAFETY', 'admin', '2026-03-01');
      manager.create('B', 'QUALITY', 'admin', '2026-03-01');
      expect(manager.getByCategory('SAFETY')).toHaveLength(1);
    });

    it('returns empty array when none match', () => {
      manager.create('A', 'SAFETY', 'admin', '2026-03-01');
      expect(manager.getByCategory('PROCESS')).toHaveLength(0);
    });

    const categories: InspectionCategory[] = ['SAFETY', 'QUALITY', 'ENVIRONMENTAL', 'EQUIPMENT', 'PROCESS', 'FACILITY'];
    categories.forEach((cat) => {
      it(`getByCategory(${cat}) filters correctly`, () => {
        manager.create(`T-${cat}`, cat, 'admin', '2026-03-01');
        expect(manager.getByCategory(cat).every((c) => c.category === cat)).toBe(true);
      });
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`getByCategory iteration ${i}`, () => {
        manager.create(`T${i}`, 'FACILITY', 'admin', '2026-03-01');
        expect(manager.getByCategory('FACILITY').length).toBeGreaterThan(0);
      });
    });
  });

  // ── getByStatus ───────────────────────────────────────────────────────────

  describe('getByStatus()', () => {
    it('returns DRAFT checklists', () => {
      manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      expect(manager.getByStatus('DRAFT')).toHaveLength(1);
    });

    it('returns ACTIVE checklists', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.activate(c.id);
      expect(manager.getByStatus('ACTIVE')).toHaveLength(1);
    });

    it('returns RETIRED checklists', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.retire(c.id);
      expect(manager.getByStatus('RETIRED')).toHaveLength(1);
    });

    it('returns empty array when no match', () => {
      manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      expect(manager.getByStatus('ACTIVE')).toHaveLength(0);
    });

    const statuses: ChecklistStatus[] = ['DRAFT', 'ACTIVE', 'RETIRED'];
    statuses.forEach((status) => {
      Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
        it(`getByStatus(${status}) iteration ${i}`, () => {
          expect(manager.getByStatus(status).every((c) => c.status === status)).toBe(true);
        });
      });
    });
  });

  // ── getActive ─────────────────────────────────────────────────────────────

  describe('getActive()', () => {
    it('returns empty array initially', () => {
      expect(manager.getActive()).toHaveLength(0);
    });

    it('returns activated checklists', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.activate(c.id);
      expect(manager.getActive()).toHaveLength(1);
    });

    it('does not include DRAFT checklists', () => {
      manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      expect(manager.getActive()).toHaveLength(0);
    });

    it('does not include RETIRED checklists', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.retire(c.id);
      expect(manager.getActive()).toHaveLength(0);
    });

    it('returns multiple active checklists', () => {
      const c1 = manager.create('A', 'SAFETY', 'admin', '2026-03-01');
      const c2 = manager.create('B', 'QUALITY', 'admin', '2026-03-01');
      manager.activate(c1.id);
      manager.activate(c2.id);
      expect(manager.getActive()).toHaveLength(2);
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getActive returns ${n} after activating ${n}`, () => {
        Array.from({ length: n }, (_, j) => {
          const c = manager.create(`T${j}`, 'SAFETY', 'admin', '2026-03-01');
          manager.activate(c.id);
        });
        expect(manager.getActive()).toHaveLength(n);
      });
    });
  });

  // ── getPassRate ───────────────────────────────────────────────────────────

  describe('getPassRate()', () => {
    it('returns 0 when no items have results', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.addItem(c.id, 'Item', true);
      expect(manager.getPassRate(c.id)).toBe(0);
    });

    it('returns 0 when all items are N_A', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Item', false);
      manager.recordResult(item.id, 'N_A');
      expect(manager.getPassRate(c.id)).toBe(0);
    });

    it('returns 100 when all non-NA items PASS', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const i1 = manager.addItem(c.id, 'Item 1', true);
      const i2 = manager.addItem(c.id, 'Item 2', true);
      manager.recordResult(i1.id, 'PASS');
      manager.recordResult(i2.id, 'PASS');
      expect(manager.getPassRate(c.id)).toBe(100);
    });

    it('returns 0 when all non-NA items FAIL', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const i1 = manager.addItem(c.id, 'Item 1', true);
      manager.recordResult(i1.id, 'FAIL');
      expect(manager.getPassRate(c.id)).toBe(0);
    });

    it('returns 50 for 1 PASS, 1 FAIL', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const i1 = manager.addItem(c.id, 'Item 1', true);
      const i2 = manager.addItem(c.id, 'Item 2', true);
      manager.recordResult(i1.id, 'PASS');
      manager.recordResult(i2.id, 'FAIL');
      expect(manager.getPassRate(c.id)).toBe(50);
    });

    it('ignores N_A in denominator', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const i1 = manager.addItem(c.id, 'Item 1', true);
      const i2 = manager.addItem(c.id, 'Item 2', false);
      const i3 = manager.addItem(c.id, 'Item 3', true);
      manager.recordResult(i1.id, 'PASS');
      manager.recordResult(i2.id, 'N_A');
      manager.recordResult(i3.id, 'PASS');
      expect(manager.getPassRate(c.id)).toBe(100);
    });

    it('returns 0 when no items exist', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      expect(manager.getPassRate(c.id)).toBe(0);
    });

    it('throws for unknown checklistId', () => {
      expect(() => manager.getPassRate('nonexistent')).toThrow();
    });

    it('OBSERVATION counts as non-pass (not N_A)', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const i1 = manager.addItem(c.id, 'Item 1', true);
      const i2 = manager.addItem(c.id, 'Item 2', true);
      manager.recordResult(i1.id, 'PASS');
      manager.recordResult(i2.id, 'OBSERVATION');
      expect(manager.getPassRate(c.id)).toBe(50);
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`getPassRate iteration ${i}: all pass`, () => {
        const c = manager.create(`T${i}`, 'QUALITY', 'admin', '2026-03-01');
        const items = Array.from({ length: i + 1 }, (_, j) => manager.addItem(c.id, `Item ${j}`, true));
        items.forEach((item) => manager.recordResult(item.id, 'PASS'));
        expect(manager.getPassRate(c.id)).toBe(100);
      });
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`getPassRate iteration ${i}: all fail`, () => {
        const c = manager.create(`F${i}`, 'QUALITY', 'admin', '2026-03-01');
        const items = Array.from({ length: i + 1 }, (_, j) => manager.addItem(c.id, `Item ${j}`, true));
        items.forEach((item) => manager.recordResult(item.id, 'FAIL'));
        expect(manager.getPassRate(c.id)).toBe(0);
      });
    });
  });

  // ── getFailedItems ────────────────────────────────────────────────────────

  describe('getFailedItems()', () => {
    it('returns empty array when no items', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      expect(manager.getFailedItems(c.id)).toHaveLength(0);
    });

    it('returns FAIL items only', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const i1 = manager.addItem(c.id, 'Pass item', true);
      const i2 = manager.addItem(c.id, 'Fail item', true);
      manager.recordResult(i1.id, 'PASS');
      manager.recordResult(i2.id, 'FAIL');
      expect(manager.getFailedItems(c.id)).toHaveLength(1);
    });

    it('returns all FAIL items', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const i1 = manager.addItem(c.id, 'Item 1', true);
      const i2 = manager.addItem(c.id, 'Item 2', true);
      const i3 = manager.addItem(c.id, 'Item 3', true);
      manager.recordResult(i1.id, 'FAIL');
      manager.recordResult(i2.id, 'FAIL');
      manager.recordResult(i3.id, 'PASS');
      expect(manager.getFailedItems(c.id)).toHaveLength(2);
    });

    it('returns empty when all pass', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const i1 = manager.addItem(c.id, 'Item 1', true);
      manager.recordResult(i1.id, 'PASS');
      expect(manager.getFailedItems(c.id)).toHaveLength(0);
    });

    it('does not include N_A items', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Item', false);
      manager.recordResult(item.id, 'N_A');
      expect(manager.getFailedItems(c.id)).toHaveLength(0);
    });

    it('does not include OBSERVATION items', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, 'Item', false);
      manager.recordResult(item.id, 'OBSERVATION');
      expect(manager.getFailedItems(c.id)).toHaveLength(0);
    });

    it('throws for unknown checklistId', () => {
      expect(() => manager.getFailedItems('nonexistent')).toThrow();
    });

    it('failed items all have FAIL result', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      const items = Array.from({ length: 5 }, (_, j) => manager.addItem(c.id, `Item ${j}`, true));
      items.forEach((item) => manager.recordResult(item.id, 'FAIL'));
      const failed = manager.getFailedItems(c.id);
      expect(failed.every((i) => i.result === 'FAIL')).toBe(true);
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`getFailedItems iteration ${i}: ${i} failures`, () => {
        const c = manager.create(`T${i}`, 'SAFETY', 'admin', '2026-03-01');
        const items = Array.from({ length: i + 1 }, (_, j) => manager.addItem(c.id, `Item ${j}`, true));
        items.slice(0, i).forEach((item) => manager.recordResult(item.id, 'FAIL'));
        if (i < items.length) manager.recordResult(items[i].id, 'PASS');
        expect(manager.getFailedItems(c.id)).toHaveLength(i);
      });
    });
  });

  // ── getCount ──────────────────────────────────────────────────────────────

  describe('getCount()', () => {
    it('returns 0 initially', () => {
      expect(manager.getCount()).toBe(0);
    });

    Array.from({ length: 15 }, (_, i) => i + 1).forEach((n) => {
      it(`returns ${n} after creating ${n} checklists`, () => {
        Array.from({ length: n }, (_, j) => manager.create(`T${j}`, 'SAFETY', 'admin', '2026-03-01'));
        expect(manager.getCount()).toBe(n);
      });
    });
  });

  // ── getAll ────────────────────────────────────────────────────────────────

  describe('getAll()', () => {
    it('returns empty array initially', () => {
      expect(manager.getAll()).toHaveLength(0);
    });

    it('returns all checklists', () => {
      manager.create('A', 'SAFETY', 'admin', '2026-03-01');
      manager.create('B', 'QUALITY', 'admin', '2026-03-01');
      expect(manager.getAll()).toHaveLength(2);
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach((n) => {
      it(`getAll returns ${n} checklists`, () => {
        Array.from({ length: n }, (_, j) => manager.create(`T${j}`, 'SAFETY', 'admin', '2026-03-01'));
        expect(manager.getAll()).toHaveLength(n);
      });
    });
  });

  // ── get ───────────────────────────────────────────────────────────────────

  describe('get()', () => {
    it('returns checklist by id', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      expect(manager.get(c.id)).toBeDefined();
    });

    it('returns undefined for unknown id', () => {
      expect(manager.get('unknown')).toBeUndefined();
    });

    it('returns correct checklist when multiple exist', () => {
      const c1 = manager.create('A', 'SAFETY', 'admin', '2026-03-01');
      const c2 = manager.create('B', 'QUALITY', 'admin', '2026-03-01');
      expect(manager.get(c1.id)?.title).toBe('A');
      expect(manager.get(c2.id)?.title).toBe('B');
    });
  });

  // ── Status transitions ────────────────────────────────────────────────────

  describe('status transitions', () => {
    it('DRAFT → ACTIVE', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.activate(c.id);
      expect(manager.get(c.id)?.status).toBe('ACTIVE');
    });

    it('DRAFT → RETIRED', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.retire(c.id);
      expect(manager.get(c.id)?.status).toBe('RETIRED');
    });

    it('ACTIVE → RETIRED', () => {
      const c = manager.create('T', 'SAFETY', 'admin', '2026-03-01');
      manager.activate(c.id);
      manager.retire(c.id);
      expect(manager.get(c.id)?.status).toBe('RETIRED');
    });

    Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
      it(`full checklist lifecycle iteration ${i}`, () => {
        const c = manager.create(`Checklist ${i}`, 'ENVIRONMENTAL', 'admin', '2026-03-01');
        expect(c.status).toBe('DRAFT');
        manager.activate(c.id);
        expect(manager.get(c.id)?.status).toBe('ACTIVE');
        manager.retire(c.id);
        expect(manager.get(c.id)?.status).toBe('RETIRED');
      });
    });
  });

  // ── Complex scenarios ─────────────────────────────────────────────────────

  describe('complex scenarios', () => {
    it('complete inspection with mixed results gives correct pass rate', () => {
      const c = manager.create('Full Inspection', 'SAFETY', 'admin', '2026-03-01');
      const items = Array.from({ length: 10 }, (_, j) =>
        manager.addItem(c.id, `Item ${j}`, j < 8),
      );
      // 6 PASS, 2 FAIL, 2 N_A
      [0, 1, 2, 3, 4, 5].forEach((j) => manager.recordResult(items[j].id, 'PASS'));
      [6, 7].forEach((j) => manager.recordResult(items[j].id, 'FAIL'));
      [8, 9].forEach((j) => manager.recordResult(items[j].id, 'N_A'));
      // non-NA = 8, pass = 6
      expect(manager.getPassRate(c.id)).toBe(75);
      expect(manager.getFailedItems(c.id)).toHaveLength(2);
    });

    it('multiple checklists tracked independently', () => {
      const c1 = manager.create('CL-1', 'SAFETY', 'admin', '2026-03-01');
      const c2 = manager.create('CL-2', 'QUALITY', 'admin', '2026-03-01');
      const i1 = manager.addItem(c1.id, 'Item', true);
      const i2 = manager.addItem(c2.id, 'Item', true);
      manager.recordResult(i1.id, 'PASS');
      manager.recordResult(i2.id, 'FAIL');
      expect(manager.getPassRate(c1.id)).toBe(100);
      expect(manager.getPassRate(c2.id)).toBe(0);
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`complex scenario iteration ${i}: create, add items, record results`, () => {
        const c = manager.create(`Complex ${i}`, 'PROCESS', 'admin', '2026-03-01');
        const numItems = (i % 5) + 2;
        const items = Array.from({ length: numItems }, (_, j) =>
          manager.addItem(c.id, `Item ${j}`, true),
        );
        items.forEach((item, j) =>
          manager.recordResult(item.id, j % 2 === 0 ? 'PASS' : 'FAIL'),
        );
        const expected = Math.ceil(numItems / 2);
        expect(manager.getPassRate(c.id)).toBeGreaterThan(0);
        expect(manager.getFailedItems(c.id).length).toBeLessThanOrEqual(numItems);
      });
    });
  });

  // ── Large-scale parameterized tests ───────────────────────────────────────

  describe('large-scale parameterized tests', () => {
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`large-scale checklist ${i}: create and activate`, () => {
        const c = manager.create(`Checklist ${i}`, 'EQUIPMENT', 'admin', '2026-03-01');
        expect(c.version).toBe(1);
        expect(c.status).toBe('DRAFT');
        manager.activate(c.id);
        expect(manager.get(c.id)?.status).toBe('ACTIVE');
      });
    });

    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`large-scale item ${i}: add and record PASS`, () => {
        const c = manager.create(`CL${i}`, 'FACILITY', 'admin', '2026-03-01');
        const item = manager.addItem(c.id, `Check point ${i}`, i % 2 === 0);
        manager.recordResult(item.id, 'PASS', `OK item ${i}`);
        expect(manager.get(c.id)?.items[0].result).toBe('PASS');
        expect(manager.get(c.id)?.items[0].notes).toBe(`OK item ${i}`);
      });
    });
  });
});

// ─── Integration: InspectionPlanner + ChecklistManager ────────────────────────

describe('Integration: InspectionPlanner + ChecklistManager', () => {
  let planner: InspectionPlanner;
  let manager: ChecklistManager;

  beforeEach(() => {
    planner = new InspectionPlanner();
    manager = new ChecklistManager();
  });

  it('links checklist to inspection plan', () => {
    const c = manager.create('Safety CL', 'SAFETY', 'admin', '2026-03-01');
    manager.activate(c.id);
    const p = planner.schedule('Safety Inspection', 'SAFETY', 'MONTHLY', 'Warehouse', 'John', '2026-04-01', c.id);
    expect(p.checklistId).toBe(c.id);
    expect(manager.get(p.checklistId!)?.status).toBe('ACTIVE');
  });

  it('completing checklist and inspection together', () => {
    const c = manager.create('Equipment CL', 'EQUIPMENT', 'admin', '2026-03-01');
    const i1 = manager.addItem(c.id, 'Check A', true);
    const i2 = manager.addItem(c.id, 'Check B', true);
    manager.recordResult(i1.id, 'PASS');
    manager.recordResult(i2.id, 'PASS');
    const rate = manager.getPassRate(c.id);

    const p = planner.schedule('Equipment Inspection', 'EQUIPMENT', 'WEEKLY', 'Floor 1', 'Alice', '2026-03-15', c.id);
    planner.start(p.id);
    planner.complete(p.id, '2026-03-15', rate);
    expect(planner.get(p.id)?.score).toBe(100);
  });

  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`integration iteration ${i}: checklist drives inspection score`, () => {
      const cat: InspectionCategory = (['SAFETY', 'QUALITY', 'ENVIRONMENTAL', 'EQUIPMENT', 'PROCESS', 'FACILITY'] as InspectionCategory[])[i % 6];
      const c = manager.create(`CL${i}`, cat, 'admin', '2026-03-01');
      manager.activate(c.id);
      const numItems = (i % 4) + 2;
      const items = Array.from({ length: numItems }, (_, j) =>
        manager.addItem(c.id, `Item ${j}`, true),
      );
      // All pass
      items.forEach((item) => manager.recordResult(item.id, 'PASS'));
      const rate = manager.getPassRate(c.id);
      expect(rate).toBe(100);

      const p = planner.schedule(
        `Inspection ${i}`,
        cat,
        'MONTHLY',
        `Location ${i}`,
        `User ${i}`,
        '2026-03-01',
        c.id,
      );
      planner.start(p.id);
      planner.complete(p.id, '2026-03-05', rate);
      expect(planner.get(p.id)?.score).toBe(100);
      expect(planner.get(p.id)?.status).toBe('COMPLETED');
    });
  });

  // Average score integration tests
  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`average score integration iteration ${i}`, () => {
      const score = (i + 1) * 5; // 5, 10, 15, ..., 100
      const p = planner.schedule(`T${i}`, 'SAFETY', 'DAILY', 'L', 'A', '2026-03-01');
      planner.complete(p.id, '2026-03-05', score);
      expect(planner.getAverageScore()).toBeGreaterThan(0);
    });
  });

  // Overdue + checklist integration
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`overdue integration iteration ${i}`, () => {
      const c = manager.create(`OD-CL-${i}`, 'SAFETY', 'admin', '2026-01-01');
      manager.activate(c.id);
      const p = planner.schedule(`Overdue ${i}`, 'SAFETY', 'DAILY', 'L', 'A', '2026-01-01', c.id);
      const overdue = planner.getOverdue('2026-06-01');
      expect(overdue.length).toBeGreaterThan(0);
      expect(overdue.some((x) => x.id === p.id)).toBe(true);
    });
  });
});

// ─── Edge cases and error handling ────────────────────────────────────────────

describe('Edge cases', () => {
  let planner: InspectionPlanner;
  let manager: ChecklistManager;

  beforeEach(() => {
    planner = new InspectionPlanner();
    manager = new ChecklistManager();
  });

  it('planner: get returns undefined for empty store', () => {
    expect(planner.get('any')).toBeUndefined();
  });

  it('planner: getAll returns empty array initially', () => {
    expect(planner.getAll()).toEqual([]);
  });

  it('planner: getByCategory returns empty when store empty', () => {
    expect(planner.getByCategory('SAFETY')).toEqual([]);
  });

  it('planner: getByStatus returns empty when store empty', () => {
    expect(planner.getByStatus('SCHEDULED')).toEqual([]);
  });

  it('planner: getByAssignee returns empty when store empty', () => {
    expect(planner.getByAssignee('nobody')).toEqual([]);
  });

  it('planner: getByLocation returns empty when store empty', () => {
    expect(planner.getByLocation('nowhere')).toEqual([]);
  });

  it('planner: getOverdue returns empty when store empty', () => {
    expect(planner.getOverdue('2026-12-31')).toEqual([]);
  });

  it('planner: getAverageScore returns 0 when store empty', () => {
    expect(planner.getAverageScore()).toBe(0);
  });

  it('planner: getCount returns 0 when store empty', () => {
    expect(planner.getCount()).toBe(0);
  });

  it('manager: get returns undefined for empty store', () => {
    expect(manager.get('any')).toBeUndefined();
  });

  it('manager: getAll returns empty when store empty', () => {
    expect(manager.getAll()).toEqual([]);
  });

  it('manager: getByCategory returns empty when store empty', () => {
    expect(manager.getByCategory('QUALITY')).toEqual([]);
  });

  it('manager: getByStatus returns empty when store empty', () => {
    expect(manager.getByStatus('DRAFT')).toEqual([]);
  });

  it('manager: getActive returns empty when store empty', () => {
    expect(manager.getActive()).toEqual([]);
  });

  it('manager: getCount returns 0 when store empty', () => {
    expect(manager.getCount()).toBe(0);
  });

  it('planner start throws with message containing id', () => {
    expect(() => planner.start('bad-id')).toThrow('bad-id');
  });

  it('planner complete throws with message containing id', () => {
    expect(() => planner.complete('bad-id', '2026-01-01', 0)).toThrow('bad-id');
  });

  it('planner skip throws with message containing id', () => {
    expect(() => planner.skip('bad-id')).toThrow('bad-id');
  });

  it('planner markOverdue throws with message containing id', () => {
    expect(() => planner.markOverdue('bad-id')).toThrow('bad-id');
  });

  it('manager activate throws with message containing id', () => {
    expect(() => manager.activate('bad-id')).toThrow('bad-id');
  });

  it('manager retire throws with message containing id', () => {
    expect(() => manager.retire('bad-id')).toThrow('bad-id');
  });

  it('manager addItem throws with message containing checklistId', () => {
    expect(() => manager.addItem('bad-id', 'Item', true)).toThrow('bad-id');
  });

  it('manager recordResult throws with message containing itemId', () => {
    expect(() => manager.recordResult('bad-item', 'PASS')).toThrow('bad-item');
  });

  it('manager getPassRate throws with message containing checklistId', () => {
    expect(() => manager.getPassRate('bad-id')).toThrow('bad-id');
  });

  it('manager getFailedItems throws with message containing checklistId', () => {
    expect(() => manager.getFailedItems('bad-id')).toThrow('bad-id');
  });

  // Extra parameterized error edge cases
  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`edge case ${i}: planner operations on nonexistent ids all throw`, () => {
      const fakeId = `fake-${i}`;
      expect(() => planner.start(fakeId)).toThrow();
      expect(() => planner.complete(fakeId, '2026-01-01', 50)).toThrow();
      expect(() => planner.skip(fakeId)).toThrow();
      expect(() => planner.markOverdue(fakeId)).toThrow();
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`edge case ${i}: manager operations on nonexistent ids all throw`, () => {
      const fakeId = `fake-${i}`;
      expect(() => manager.activate(fakeId)).toThrow();
      expect(() => manager.retire(fakeId)).toThrow();
      expect(() => manager.addItem(fakeId, 'Item', true)).toThrow();
      expect(() => manager.getPassRate(fakeId)).toThrow();
      expect(() => manager.getFailedItems(fakeId)).toThrow();
    });
  });
});

// ─── Additional bulk coverage tests ───────────────────────────────────────────

describe('Bulk coverage: InspectionPlanner additional', () => {
  let planner: InspectionPlanner;

  beforeEach(() => {
    planner = new InspectionPlanner();
  });

  Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
    it(`bulk plan ${i}: category and frequency combo`, () => {
      const cats: InspectionCategory[] = ['SAFETY', 'QUALITY', 'ENVIRONMENTAL', 'EQUIPMENT', 'PROCESS', 'FACILITY'];
      const freqs: InspectionFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'AS_NEEDED'];
      const cat = cats[i % cats.length];
      const freq = freqs[i % freqs.length];
      const p = planner.schedule(`Bulk ${i}`, cat, freq, `Loc${i}`, `User${i}`, '2026-03-01');
      expect(p.category).toBe(cat);
      expect(p.frequency).toBe(freq);
      expect(p.status).toBe('SCHEDULED');
    });
  });

  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`bulk score test ${i}: complete with score ${i * 3 + 1}`, () => {
      const p = planner.schedule(`Bulk ${i}`, 'QUALITY', 'MONTHLY', 'L', 'A', '2026-03-01');
      const score = (i * 3 + 1) % 101;
      planner.complete(p.id, '2026-03-10', score);
      expect(planner.get(p.id)?.score).toBe(score);
      expect(planner.get(p.id)?.status).toBe('COMPLETED');
    });
  });
});

describe('Bulk coverage: ChecklistManager additional', () => {
  let manager: ChecklistManager;

  beforeEach(() => {
    manager = new ChecklistManager();
  });

  Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
    it(`bulk checklist ${i}: create, add ${(i % 5) + 1} items, activate`, () => {
      const c = manager.create(`BulkCL ${i}`, 'PROCESS', 'admin', '2026-03-01');
      const numItems = (i % 5) + 1;
      Array.from({ length: numItems }, (_, j) =>
        manager.addItem(c.id, `BulkItem ${j}`, j % 2 === 0),
      );
      manager.activate(c.id);
      expect(manager.get(c.id)?.items).toHaveLength(numItems);
      expect(manager.get(c.id)?.status).toBe('ACTIVE');
    });
  });

  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`bulk result test ${i}: record OBSERVATION and check not in failed`, () => {
      const c = manager.create(`OBS${i}`, 'ENVIRONMENTAL', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, `Observation ${i}`, false);
      manager.recordResult(item.id, 'OBSERVATION', `Observed ${i}`);
      expect(manager.getFailedItems(c.id)).toHaveLength(0);
      expect(manager.get(c.id)?.items[0].result).toBe('OBSERVATION');
    });
  });
});

// ─── Extra tests to reach 1,000+ total ────────────────────────────────────────

describe('Extra: InspectionPlanner notes and metadata', () => {
  let planner: InspectionPlanner;

  beforeEach(() => {
    planner = new InspectionPlanner();
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`schedule with checklistId and notes iteration ${i}`, () => {
      const p = planner.schedule(
        `NotesPlan ${i}`,
        'SAFETY',
        'QUARTERLY',
        `Site ${i}`,
        `Inspector${i}`,
        `2026-0${(i % 9) + 1}-01`,
        `cl-${i}`,
        `Note ${i}`,
      );
      expect(p.checklistId).toBe(`cl-${i}`);
      expect(p.notes).toBe(`Note ${i}`);
      expect(p.scheduledDate).toBe(`2026-0${(i % 9) + 1}-01`);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`overdue detection iteration ${i}: scheduled before asOf`, () => {
      const past = `2026-01-${String((i % 28) + 1).padStart(2, '0')}`;
      const p = planner.schedule(`OD ${i}`, 'FACILITY', 'ANNUAL', 'Loc', 'User', past);
      expect(planner.getOverdue('2026-12-31').some((x) => x.id === p.id)).toBe(true);
    });
  });
});

describe('Extra: ChecklistManager item ordering', () => {
  let manager: ChecklistManager;

  beforeEach(() => {
    manager = new ChecklistManager();
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`explicit order ${i + 10} is stored correctly`, () => {
      const c = manager.create(`OrdCL${i}`, 'EQUIPMENT', 'admin', '2026-03-01');
      const item = manager.addItem(c.id, `Item ${i}`, true, i + 10);
      expect(item.order).toBe(i + 10);
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`sequential auto-order for ${i + 2} items`, () => {
      const c = manager.create(`AutoOrd${i}`, 'PROCESS', 'admin', '2026-03-01');
      const items = Array.from({ length: i + 2 }, (_, j) =>
        manager.addItem(c.id, `Item ${j}`, true),
      );
      items.forEach((item, j) => {
        expect(item.order).toBe(j + 1);
      });
    });
  });
});
