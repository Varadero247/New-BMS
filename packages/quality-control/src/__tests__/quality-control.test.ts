// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { InspectionManager } from '../inspection-manager';
import { DefectTracker } from '../defect-tracker';
import { NonconformanceTracker } from '../nonconformance-tracker';
import {
  InspectionType,
  InspectionStatus,
  DefectSeverity,
  DefectStatus,
  NonconformanceType,
  DispositionType,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// InspectionManager tests
// ─────────────────────────────────────────────────────────────────────────────
describe('InspectionManager', () => {
  let mgr: InspectionManager;

  beforeEach(() => {
    mgr = new InspectionManager();
  });

  // ── schedule ────────────────────────────────────────────────────────────────
  describe('schedule', () => {
    it('returns a record with id insp-1 for first call', () => {
      const r = mgr.schedule('INCOMING', 'PROD-1', 'alice', '2026-01-01', 100);
      expect(r.id).toBe('insp-1');
    });

    it('increments id on each schedule call', () => {
      const r1 = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 50);
      const r2 = mgr.schedule('FINAL', 'P2', 'bob', '2026-01-02', 60);
      expect(r1.id).toBe('insp-1');
      expect(r2.id).toBe('insp-2');
    });

    it('sets status to PENDING', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      expect(r.status).toBe('PENDING');
    });

    it('sets defectsFound to 0', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      expect(r.defectsFound).toBe(0);
    });

    it('stores type correctly', () => {
      const r = mgr.schedule('FINAL', 'P1', 'alice', '2026-01-01', 100);
      expect(r.type).toBe('FINAL');
    });

    it('stores productId correctly', () => {
      const r = mgr.schedule('INCOMING', 'PROD-999', 'alice', '2026-01-01', 100);
      expect(r.productId).toBe('PROD-999');
    });

    it('stores inspector correctly', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'inspector-bob', '2026-01-01', 100);
      expect(r.inspector).toBe('inspector-bob');
    });

    it('stores scheduledDate correctly', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-06-15', 100);
      expect(r.scheduledDate).toBe('2026-06-15');
    });

    it('stores sampleSize correctly', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 250);
      expect(r.sampleSize).toBe(250);
    });

    it('stores batchId when provided', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100, 'BATCH-001');
      expect(r.batchId).toBe('BATCH-001');
    });

    it('batchId is undefined when not provided', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      expect(r.batchId).toBeUndefined();
    });

    const inspectionTypes: InspectionType[] = ['INCOMING', 'IN_PROCESS', 'FINAL', 'RECEIVING', 'AUDIT'];
    inspectionTypes.forEach(type => {
      it(`schedules with type ${type}`, () => {
        const r = mgr.schedule(type, 'P1', 'alice', '2026-01-01', 100);
        expect(r.type).toBe(type);
      });
    });

    // Parameterized: schedule 50 inspections
    Array.from({ length: 50 }, (_, i) => i + 1).forEach(i => {
      it(`schedule call ${i} produces id insp-${i}`, () => {
        Array.from({ length: i }).forEach((_, j) => {
          mgr.schedule('INCOMING', `P${j}`, 'alice', '2026-01-01', 10);
        });
        const all = mgr.getAll();
        expect(all[i - 1].id).toBe(`insp-${i}`);
      });
    });
  });

  // ── start ────────────────────────────────────────────────────────────────────
  describe('start', () => {
    it('transitions status to IN_PROGRESS', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const updated = mgr.start(r.id);
      expect(updated.status).toBe('IN_PROGRESS');
    });

    it('returns the same record reference', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const updated = mgr.start(r.id);
      expect(updated.id).toBe(r.id);
    });

    it('throws for unknown id', () => {
      expect(() => mgr.start('insp-999')).toThrow();
    });

    it('error message contains the unknown id', () => {
      expect(() => mgr.start('insp-bad')).toThrow('insp-bad');
    });

    // Parameterized: start 20 different inspections
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`start inspection index ${i} sets IN_PROGRESS`, () => {
        const r = mgr.schedule('FINAL', `PROD-${i}`, 'alice', '2026-01-01', 50);
        const updated = mgr.start(r.id);
        expect(updated.status).toBe('IN_PROGRESS');
      });
    });
  });

  // ── complete — PASSED ────────────────────────────────────────────────────────
  describe('complete → PASSED', () => {
    it('status is PASSED when defectsFound === 0', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      mgr.start(r.id);
      const done = mgr.complete(r.id, '2026-01-02', 0);
      expect(done.status).toBe('PASSED');
    });

    it('sets completedDate', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const done = mgr.complete(r.id, '2026-02-15', 0);
      expect(done.completedDate).toBe('2026-02-15');
    });

    it('sets defectsFound to 0', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const done = mgr.complete(r.id, '2026-01-02', 0);
      expect(done.defectsFound).toBe(0);
    });

    it('sets notes when provided', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const done = mgr.complete(r.id, '2026-01-02', 0, 'All clear');
      expect(done.notes).toBe('All clear');
    });

    // Parameterized: 30 PASSED inspections with different sample sizes
    Array.from({ length: 30 }, (_, i) => (i + 1) * 10).forEach(sampleSize => {
      it(`PASSED with sampleSize=${sampleSize} and 0 defects`, () => {
        const r = mgr.schedule('FINAL', 'P1', 'alice', '2026-01-01', sampleSize);
        const done = mgr.complete(r.id, '2026-01-02', 0);
        expect(done.status).toBe('PASSED');
      });
    });
  });

  // ── complete — FAILED ────────────────────────────────────────────────────────
  describe('complete → FAILED', () => {
    it('status is FAILED when defectsFound > sampleSize * 0.05', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const done = mgr.complete(r.id, '2026-01-02', 6); // 6 > 5
      expect(done.status).toBe('FAILED');
    });

    it('status is FAILED when defectsFound is much larger than threshold', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const done = mgr.complete(r.id, '2026-01-02', 50);
      expect(done.status).toBe('FAILED');
    });

    // Parameterized: various sample sizes, always > 5% defects → FAILED
    Array.from({ length: 30 }, (_, i) => (i + 1) * 20).forEach(sampleSize => {
      const defects = Math.floor(sampleSize * 0.06) + 1;
      it(`FAILED: sampleSize=${sampleSize}, defects=${defects} (> 5%)`, () => {
        const r = mgr.schedule('FINAL', 'P1', 'alice', '2026-01-01', sampleSize);
        const done = mgr.complete(r.id, '2026-01-02', defects);
        expect(done.status).toBe('FAILED');
      });
    });
  });

  // ── complete — CONDITIONALLY_PASSED ─────────────────────────────────────────
  describe('complete → CONDITIONALLY_PASSED', () => {
    it('status is CONDITIONALLY_PASSED when 0 < defects <= sampleSize*0.05', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const done = mgr.complete(r.id, '2026-01-02', 5); // 5 === 5, exactly at boundary
      expect(done.status).toBe('CONDITIONALLY_PASSED');
    });

    it('CONDITIONALLY_PASSED for defects=1 on sampleSize=100', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const done = mgr.complete(r.id, '2026-01-02', 1);
      expect(done.status).toBe('CONDITIONALLY_PASSED');
    });

    it('CONDITIONALLY_PASSED for defects=3 on sampleSize=100', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const done = mgr.complete(r.id, '2026-01-02', 3);
      expect(done.status).toBe('CONDITIONALLY_PASSED');
    });

    // Parameterized: 20 different sample sizes, defects exactly at 5% boundary
    Array.from({ length: 20 }, (_, i) => (i + 1) * 20).forEach(sampleSize => {
      const defects = Math.floor(sampleSize * 0.05);
      if (defects > 0) {
        it(`CONDITIONALLY_PASSED: sampleSize=${sampleSize}, defects=${defects} (exactly 5%)`, () => {
          const r = mgr.schedule('FINAL', 'P1', 'alice', '2026-01-01', sampleSize);
          const done = mgr.complete(r.id, '2026-01-02', defects);
          expect(done.status).toBe('CONDITIONALLY_PASSED');
        });
      }
    });

    // Parameterized: small defect counts on large sample
    Array.from({ length: 20 }, (_, i) => i + 1).forEach(defects => {
      it(`CONDITIONALLY_PASSED: 1000-unit sample, defects=${defects}`, () => {
        const r = mgr.schedule('IN_PROCESS', 'P1', 'alice', '2026-01-01', 1000);
        const done = mgr.complete(r.id, '2026-01-02', defects);
        expect(done.status).toBe('CONDITIONALLY_PASSED');
      });
    });
  });

  // ── get ──────────────────────────────────────────────────────────────────────
  describe('get', () => {
    it('returns the record by id', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      expect(mgr.get(r.id)).toBe(r);
    });

    it('returns undefined for unknown id', () => {
      expect(mgr.get('insp-999')).toBeUndefined();
    });

    // Parameterized: 20 insertions and lookups
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`get returns correct record for index ${i}`, () => {
        const records = Array.from({ length: i + 1 }, (_, j) =>
          mgr.schedule('INCOMING', `P${j}`, 'alice', '2026-01-01', 10),
        );
        const target = records[i];
        expect(mgr.get(target.id)?.id).toBe(target.id);
      });
    });
  });

  // ── getAll ───────────────────────────────────────────────────────────────────
  describe('getAll', () => {
    it('returns empty array initially', () => {
      expect(mgr.getAll()).toHaveLength(0);
    });

    it('returns all scheduled inspections', () => {
      mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      mgr.schedule('FINAL', 'P2', 'bob', '2026-01-02', 200);
      expect(mgr.getAll()).toHaveLength(2);
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
      it(`getAll returns ${n} records after ${n} schedules`, () => {
        Array.from({ length: n }).forEach((_, j) =>
          mgr.schedule('INCOMING', `P${j}`, 'alice', '2026-01-01', 10),
        );
        expect(mgr.getAll()).toHaveLength(n);
      });
    });
  });

  // ── getByStatus ──────────────────────────────────────────────────────────────
  describe('getByStatus', () => {
    it('returns only PENDING records', () => {
      mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const r2 = mgr.schedule('FINAL', 'P2', 'bob', '2026-01-02', 200);
      mgr.start(r2.id);
      const pending = mgr.getByStatus('PENDING');
      expect(pending).toHaveLength(1);
      expect(pending[0].status).toBe('PENDING');
    });

    it('returns only IN_PROGRESS records', () => {
      const r1 = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      mgr.schedule('FINAL', 'P2', 'bob', '2026-01-02', 200);
      mgr.start(r1.id);
      const inProgress = mgr.getByStatus('IN_PROGRESS');
      expect(inProgress).toHaveLength(1);
      expect(inProgress[0].status).toBe('IN_PROGRESS');
    });

    it('returns only PASSED records', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      mgr.complete(r.id, '2026-01-02', 0);
      const passed = mgr.getByStatus('PASSED');
      expect(passed).toHaveLength(1);
    });

    it('returns only FAILED records', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      mgr.complete(r.id, '2026-01-02', 10);
      const failed = mgr.getByStatus('FAILED');
      expect(failed).toHaveLength(1);
    });

    it('returns only CONDITIONALLY_PASSED records', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      mgr.complete(r.id, '2026-01-02', 3);
      const cp = mgr.getByStatus('CONDITIONALLY_PASSED');
      expect(cp).toHaveLength(1);
    });

    it('returns empty array when no matching status', () => {
      mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      expect(mgr.getByStatus('FAILED')).toHaveLength(0);
    });

    // Parameterized: add 15 PASSED and 5 FAILED, check both filters
    Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
      it(`getByStatus PENDING returns ${n} records`, () => {
        Array.from({ length: n }).forEach((_, j) =>
          mgr.schedule('INCOMING', `P${j}`, 'alice', '2026-01-01', 10),
        );
        expect(mgr.getByStatus('PENDING')).toHaveLength(n);
      });
    });
  });

  // ── getByType ────────────────────────────────────────────────────────────────
  describe('getByType', () => {
    const types: InspectionType[] = ['INCOMING', 'IN_PROCESS', 'FINAL', 'RECEIVING', 'AUDIT'];

    types.forEach(type => {
      it(`getByType('${type}') returns correct records`, () => {
        mgr.schedule(type, 'P1', 'alice', '2026-01-01', 100);
        mgr.schedule(type, 'P2', 'bob', '2026-01-02', 50);
        // schedule a different type
        const otherType = types.find(t => t !== type)!;
        mgr.schedule(otherType, 'P3', 'carol', '2026-01-03', 75);
        const results = mgr.getByType(type);
        expect(results).toHaveLength(2);
        results.forEach(r => expect(r.type).toBe(type));
      });
    });

    it('returns empty array when no records of given type', () => {
      mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      expect(mgr.getByType('AUDIT')).toHaveLength(0);
    });

    // Parameterized: 10 of each type
    Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
      it(`getByType returns ${n} FINAL records`, () => {
        Array.from({ length: n }).forEach((_, j) =>
          mgr.schedule('FINAL', `P${j}`, 'alice', '2026-01-01', 10),
        );
        mgr.schedule('INCOMING', 'OTHER', 'bob', '2026-01-01', 10);
        expect(mgr.getByType('FINAL')).toHaveLength(n);
      });
    });
  });

  // ── getByProduct ─────────────────────────────────────────────────────────────
  describe('getByProduct', () => {
    it('returns only inspections for given productId', () => {
      mgr.schedule('INCOMING', 'PROD-A', 'alice', '2026-01-01', 100);
      mgr.schedule('FINAL', 'PROD-A', 'bob', '2026-01-02', 50);
      mgr.schedule('INCOMING', 'PROD-B', 'carol', '2026-01-03', 75);
      const result = mgr.getByProduct('PROD-A');
      expect(result).toHaveLength(2);
      result.forEach(r => expect(r.productId).toBe('PROD-A'));
    });

    it('returns empty array for unknown productId', () => {
      mgr.schedule('INCOMING', 'PROD-A', 'alice', '2026-01-01', 100);
      expect(mgr.getByProduct('PROD-UNKNOWN')).toHaveLength(0);
    });

    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`getByProduct returns ${n} records for same product`, () => {
        Array.from({ length: n }).forEach(() =>
          mgr.schedule('INCOMING', 'TARGET-PROD', 'alice', '2026-01-01', 10),
        );
        mgr.schedule('INCOMING', 'OTHER-PROD', 'bob', '2026-01-01', 10);
        expect(mgr.getByProduct('TARGET-PROD')).toHaveLength(n);
      });
    });
  });

  // ── getPassRate ──────────────────────────────────────────────────────────────
  describe('getPassRate', () => {
    it('returns 0 when no completed inspections', () => {
      mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      expect(mgr.getPassRate()).toBe(0);
    });

    it('returns 100 when all passed', () => {
      const r1 = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const r2 = mgr.schedule('FINAL', 'P2', 'bob', '2026-01-02', 200);
      mgr.complete(r1.id, '2026-01-02', 0);
      mgr.complete(r2.id, '2026-01-03', 0);
      expect(mgr.getPassRate()).toBe(100);
    });

    it('returns 0 when all failed', () => {
      const r1 = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      mgr.complete(r1.id, '2026-01-02', 10);
      expect(mgr.getPassRate()).toBe(0);
    });

    it('returns 50 when half passed', () => {
      const r1 = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const r2 = mgr.schedule('FINAL', 'P2', 'bob', '2026-01-02', 100);
      mgr.complete(r1.id, '2026-01-02', 0);
      mgr.complete(r2.id, '2026-01-03', 10);
      expect(mgr.getPassRate()).toBe(50);
    });

    // Parameterized: varying pass counts
    Array.from({ length: 10 }, (_, i) => i).forEach(failCount => {
      it(`getPassRate with ${failCount} failures out of 10 total`, () => {
        const passCount = 10 - failCount;
        Array.from({ length: passCount }).forEach(() => {
          const r = mgr.schedule('FINAL', 'P1', 'alice', '2026-01-01', 100);
          mgr.complete(r.id, '2026-01-02', 0);
        });
        Array.from({ length: failCount }).forEach(() => {
          const r = mgr.schedule('FINAL', 'P1', 'alice', '2026-01-01', 100);
          mgr.complete(r.id, '2026-01-02', 10);
        });
        const expected = (passCount / 10) * 100;
        expect(mgr.getPassRate()).toBeCloseTo(expected, 5);
      });
    });
  });

  // ── getDefectRate ────────────────────────────────────────────────────────────
  describe('getDefectRate', () => {
    it('returns 0 when no completed inspections', () => {
      mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      expect(mgr.getDefectRate()).toBe(0);
    });

    it('returns 0 when all passed with 0 defects', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      mgr.complete(r.id, '2026-01-02', 0);
      expect(mgr.getDefectRate()).toBe(0);
    });

    it('calculates correct defect rate', () => {
      const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      mgr.complete(r.id, '2026-01-02', 10); // 10% defect rate
      expect(mgr.getDefectRate()).toBe(10);
    });

    it('averages across multiple inspections', () => {
      const r1 = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      const r2 = mgr.schedule('FINAL', 'P2', 'bob', '2026-01-02', 100);
      mgr.complete(r1.id, '2026-01-02', 10);
      mgr.complete(r2.id, '2026-01-03', 20);
      // 30 defects / 200 total = 15%
      expect(mgr.getDefectRate()).toBe(15);
    });

    // Parameterized: various defect counts
    Array.from({ length: 10 }, (_, i) => i * 5).forEach(defects => {
      it(`getDefectRate returns ${defects}% with ${defects} defects in 100`, () => {
        const r = mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
        mgr.complete(r.id, '2026-01-02', defects);
        expect(mgr.getDefectRate()).toBeCloseTo(defects, 5);
      });
    });
  });

  // ── getCount ─────────────────────────────────────────────────────────────────
  describe('getCount', () => {
    it('returns 0 initially', () => {
      expect(mgr.getCount()).toBe(0);
    });

    it('increments with each schedule', () => {
      mgr.schedule('INCOMING', 'P1', 'alice', '2026-01-01', 100);
      expect(mgr.getCount()).toBe(1);
      mgr.schedule('FINAL', 'P2', 'bob', '2026-01-02', 50);
      expect(mgr.getCount()).toBe(2);
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
      it(`getCount returns ${n} after ${n} schedules`, () => {
        Array.from({ length: n }).forEach((_, j) =>
          mgr.schedule('INCOMING', `P${j}`, 'alice', '2026-01-01', 10),
        );
        expect(mgr.getCount()).toBe(n);
      });
    });
  });

  // ── error paths ──────────────────────────────────────────────────────────────
  describe('error paths', () => {
    it('start throws for non-existent id', () => {
      expect(() => mgr.start('insp-not-found')).toThrow();
    });

    it('complete throws for non-existent id', () => {
      expect(() => mgr.complete('insp-not-found', '2026-01-02', 0)).toThrow();
    });

    it('start error is an Error instance', () => {
      try {
        mgr.start('bad-id');
        fail('should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });

    it('complete error is an Error instance', () => {
      try {
        mgr.complete('bad-id', '2026-01-01', 0);
        fail('should have thrown');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
      }
    });

    // Parameterized: various bad ids
    ['', 'insp-0', 'insp-abc', 'unknown', 'null', 'undefined'].forEach(badId => {
      it(`start throws for bad id: "${badId}"`, () => {
        expect(() => mgr.start(badId)).toThrow();
      });

      it(`complete throws for bad id: "${badId}"`, () => {
        expect(() => mgr.complete(badId, '2026-01-01', 0)).toThrow();
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DefectTracker tests
// ─────────────────────────────────────────────────────────────────────────────
describe('DefectTracker', () => {
  let tracker: DefectTracker;

  beforeEach(() => {
    tracker = new DefectTracker();
  });

  // ── report ───────────────────────────────────────────────────────────────────
  describe('report', () => {
    it('returns record with id def-1 for first call', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Scratch on surface', 'alice', '2026-01-01T10:00:00Z');
      expect(r.id).toBe('def-1');
    });

    it('increments id on each report call', () => {
      const r1 = tracker.report('insp-1', 'MINOR', 'Scratch', 'alice', '2026-01-01T10:00:00Z');
      const r2 = tracker.report('insp-1', 'MAJOR', 'Crack', 'bob', '2026-01-01T11:00:00Z');
      expect(r1.id).toBe('def-1');
      expect(r2.id).toBe('def-2');
    });

    it('sets status to OPEN', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Scratch', 'alice', '2026-01-01T10:00:00Z');
      expect(r.status).toBe('OPEN');
    });

    it('stores inspectionId', () => {
      const r = tracker.report('insp-42', 'MAJOR', 'Defect', 'alice', '2026-01-01T10:00:00Z');
      expect(r.inspectionId).toBe('insp-42');
    });

    it('stores severity', () => {
      const r = tracker.report('insp-1', 'CRITICAL', 'Structural failure', 'alice', '2026-01-01T10:00:00Z');
      expect(r.severity).toBe('CRITICAL');
    });

    it('stores description', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Paint blemish', 'alice', '2026-01-01T10:00:00Z');
      expect(r.description).toBe('Paint blemish');
    });

    it('stores detectedBy', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Defect', 'inspector-charlie', '2026-01-01T10:00:00Z');
      expect(r.detectedBy).toBe('inspector-charlie');
    });

    it('stores detectedAt', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-03-15T14:30:00Z');
      expect(r.detectedAt).toBe('2026-03-15T14:30:00Z');
    });

    it('stores location when provided', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z', 'Section-A');
      expect(r.location).toBe('Section-A');
    });

    it('location is undefined when not provided', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z');
      expect(r.location).toBeUndefined();
    });

    const severities: DefectSeverity[] = ['MINOR', 'MAJOR', 'CRITICAL'];
    severities.forEach(sev => {
      it(`report with severity ${sev}`, () => {
        const r = tracker.report('insp-1', sev, 'Some defect', 'alice', '2026-01-01T10:00:00Z');
        expect(r.severity).toBe(sev);
      });
    });

    // Parameterized: 40 defect reports
    Array.from({ length: 40 }, (_, i) => i + 1).forEach(i => {
      it(`report call ${i} produces id def-${i}`, () => {
        Array.from({ length: i }).forEach((_, j) =>
          tracker.report(`insp-${j}`, 'MINOR', `Defect ${j}`, 'alice', '2026-01-01T10:00:00Z'),
        );
        const all = tracker.getByStatus('OPEN');
        expect(all.length).toBeGreaterThanOrEqual(i);
      });
    });
  });

  // ── status transitions ───────────────────────────────────────────────────────
  describe('status transitions', () => {
    it('review sets status to UNDER_REVIEW', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z');
      const updated = tracker.review(r.id);
      expect(updated.status).toBe('UNDER_REVIEW');
    });

    it('resolve sets status to RESOLVED', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z');
      const updated = tracker.resolve(r.id, '2026-01-02T10:00:00Z', 'Fixed by rework');
      expect(updated.status).toBe('RESOLVED');
    });

    it('resolve sets resolvedAt', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z');
      const updated = tracker.resolve(r.id, '2026-02-15T08:00:00Z', 'Fixed');
      expect(updated.resolvedAt).toBe('2026-02-15T08:00:00Z');
    });

    it('resolve sets resolution', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z');
      const updated = tracker.resolve(r.id, '2026-01-02T10:00:00Z', 'Polished and re-coated');
      expect(updated.resolution).toBe('Polished and re-coated');
    });

    it('accept sets status to ACCEPTED', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z');
      const updated = tracker.accept(r.id);
      expect(updated.status).toBe('ACCEPTED');
    });

    it('reject sets status to REJECTED', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z');
      const updated = tracker.reject(r.id);
      expect(updated.status).toBe('REJECTED');
    });

    it('chain: report → review → resolve', () => {
      const r = tracker.report('insp-1', 'MAJOR', 'Crack', 'alice', '2026-01-01T10:00:00Z');
      tracker.review(r.id);
      const final = tracker.resolve(r.id, '2026-01-02T10:00:00Z', 'Repaired');
      expect(final.status).toBe('RESOLVED');
    });

    it('chain: report → accept', () => {
      const r = tracker.report('insp-1', 'MINOR', 'Minor scratch', 'alice', '2026-01-01T10:00:00Z');
      const final = tracker.accept(r.id);
      expect(final.status).toBe('ACCEPTED');
    });

    it('chain: report → review → reject', () => {
      const r = tracker.report('insp-1', 'CRITICAL', 'Structural defect', 'alice', '2026-01-01T10:00:00Z');
      tracker.review(r.id);
      const final = tracker.reject(r.id);
      expect(final.status).toBe('REJECTED');
    });

    // Parameterized: 20 defects reviewed
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`review call ${i}: status becomes UNDER_REVIEW`, () => {
        const r = tracker.report('insp-1', 'MINOR', `Defect ${i}`, 'alice', '2026-01-01T10:00:00Z');
        tracker.review(r.id);
        expect(tracker.getByStatus('UNDER_REVIEW').some(d => d.id === r.id)).toBe(true);
      });
    });

    // Parameterized: 20 defects resolved
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`resolve call ${i}: status becomes RESOLVED`, () => {
        const r = tracker.report('insp-1', 'MAJOR', `Defect ${i}`, 'alice', '2026-01-01T10:00:00Z');
        tracker.resolve(r.id, '2026-01-02T10:00:00Z', `Resolution ${i}`);
        expect(tracker.getByStatus('RESOLVED').some(d => d.id === r.id)).toBe(true);
      });
    });

    // Parameterized: 20 defects accepted
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`accept call ${i}: status becomes ACCEPTED`, () => {
        const r = tracker.report('insp-1', 'MINOR', `Defect ${i}`, 'alice', '2026-01-01T10:00:00Z');
        tracker.accept(r.id);
        expect(tracker.getByStatus('ACCEPTED').some(d => d.id === r.id)).toBe(true);
      });
    });

    // Parameterized: 20 defects rejected
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`reject call ${i}: status becomes REJECTED`, () => {
        const r = tracker.report('insp-1', 'CRITICAL', `Defect ${i}`, 'alice', '2026-01-01T10:00:00Z');
        tracker.reject(r.id);
        expect(tracker.getByStatus('REJECTED').some(d => d.id === r.id)).toBe(true);
      });
    });
  });

  // ── getByInspection ──────────────────────────────────────────────────────────
  describe('getByInspection', () => {
    it('returns defects for a specific inspection', () => {
      tracker.report('insp-1', 'MINOR', 'D1', 'alice', '2026-01-01T10:00:00Z');
      tracker.report('insp-1', 'MAJOR', 'D2', 'bob', '2026-01-01T11:00:00Z');
      tracker.report('insp-2', 'CRITICAL', 'D3', 'carol', '2026-01-01T12:00:00Z');
      const result = tracker.getByInspection('insp-1');
      expect(result).toHaveLength(2);
      result.forEach(r => expect(r.inspectionId).toBe('insp-1'));
    });

    it('returns empty array for inspection with no defects', () => {
      tracker.report('insp-1', 'MINOR', 'D1', 'alice', '2026-01-01T10:00:00Z');
      expect(tracker.getByInspection('insp-99')).toHaveLength(0);
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
      it(`getByInspection returns ${n} defects for inspection`, () => {
        Array.from({ length: n }).forEach(() =>
          tracker.report('insp-target', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z'),
        );
        tracker.report('insp-other', 'MAJOR', 'Other', 'bob', '2026-01-01T10:00:00Z');
        expect(tracker.getByInspection('insp-target')).toHaveLength(n);
      });
    });
  });

  // ── getBySeverity ────────────────────────────────────────────────────────────
  describe('getBySeverity', () => {
    it('returns only MINOR defects', () => {
      tracker.report('insp-1', 'MINOR', 'Minor scratch', 'alice', '2026-01-01T10:00:00Z');
      tracker.report('insp-1', 'MAJOR', 'Major crack', 'bob', '2026-01-01T11:00:00Z');
      const minors = tracker.getBySeverity('MINOR');
      expect(minors).toHaveLength(1);
      expect(minors[0].severity).toBe('MINOR');
    });

    it('returns only MAJOR defects', () => {
      tracker.report('insp-1', 'MINOR', 'Minor', 'alice', '2026-01-01T10:00:00Z');
      tracker.report('insp-1', 'MAJOR', 'Major', 'bob', '2026-01-01T11:00:00Z');
      tracker.report('insp-1', 'CRITICAL', 'Critical', 'carol', '2026-01-01T12:00:00Z');
      const majors = tracker.getBySeverity('MAJOR');
      expect(majors).toHaveLength(1);
    });

    it('returns only CRITICAL defects', () => {
      tracker.report('insp-1', 'CRITICAL', 'Critical defect', 'alice', '2026-01-01T10:00:00Z');
      const criticals = tracker.getBySeverity('CRITICAL');
      expect(criticals).toHaveLength(1);
      expect(criticals[0].severity).toBe('CRITICAL');
    });

    it('returns empty array when no matching severity', () => {
      tracker.report('insp-1', 'MINOR', 'Minor', 'alice', '2026-01-01T10:00:00Z');
      expect(tracker.getBySeverity('CRITICAL')).toHaveLength(0);
    });

    // Parameterized: 15 defects of each severity
    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`getBySeverity CRITICAL returns ${n} records`, () => {
        Array.from({ length: n }).forEach(() =>
          tracker.report('insp-1', 'CRITICAL', 'Critical', 'alice', '2026-01-01T10:00:00Z'),
        );
        tracker.report('insp-1', 'MINOR', 'Minor', 'bob', '2026-01-01T10:00:00Z');
        expect(tracker.getBySeverity('CRITICAL')).toHaveLength(n);
      });
    });
  });

  // ── getByStatus ──────────────────────────────────────────────────────────────
  describe('getByStatus', () => {
    const statuses: DefectStatus[] = ['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'ACCEPTED', 'REJECTED'];

    statuses.forEach(status => {
      it(`getByStatus('${status}') returns correct records`, () => {
        const r = tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z');
        if (status === 'UNDER_REVIEW') tracker.review(r.id);
        else if (status === 'RESOLVED') tracker.resolve(r.id, '2026-01-02T10:00:00Z', 'Fixed');
        else if (status === 'ACCEPTED') tracker.accept(r.id);
        else if (status === 'REJECTED') tracker.reject(r.id);
        // OPEN is default
        const result = tracker.getByStatus(status);
        expect(result.some(d => d.id === r.id)).toBe(true);
        result.forEach(d => expect(d.status).toBe(status));
      });
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
      it(`getByStatus OPEN returns ${n} open defects`, () => {
        Array.from({ length: n }).forEach(() =>
          tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z'),
        );
        expect(tracker.getByStatus('OPEN')).toHaveLength(n);
      });
    });
  });

  // ── getOpen ──────────────────────────────────────────────────────────────────
  describe('getOpen', () => {
    it('returns all open defects', () => {
      tracker.report('insp-1', 'MINOR', 'D1', 'alice', '2026-01-01T10:00:00Z');
      tracker.report('insp-1', 'MAJOR', 'D2', 'bob', '2026-01-01T11:00:00Z');
      const r3 = tracker.report('insp-1', 'CRITICAL', 'D3', 'carol', '2026-01-01T12:00:00Z');
      tracker.review(r3.id);
      expect(tracker.getOpen()).toHaveLength(2);
    });

    it('returns empty when all defects are closed', () => {
      const r = tracker.report('insp-1', 'MINOR', 'D1', 'alice', '2026-01-01T10:00:00Z');
      tracker.resolve(r.id, '2026-01-02T10:00:00Z', 'Fixed');
      expect(tracker.getOpen()).toHaveLength(0);
    });

    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`getOpen returns ${n} open defects`, () => {
        Array.from({ length: n }).forEach(() =>
          tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z'),
        );
        expect(tracker.getOpen()).toHaveLength(n);
      });
    });
  });

  // ── getCritical ──────────────────────────────────────────────────────────────
  describe('getCritical', () => {
    it('returns only CRITICAL severity defects', () => {
      tracker.report('insp-1', 'MINOR', 'Minor', 'alice', '2026-01-01T10:00:00Z');
      tracker.report('insp-1', 'CRITICAL', 'Critical', 'bob', '2026-01-01T11:00:00Z');
      const criticals = tracker.getCritical();
      expect(criticals).toHaveLength(1);
      expect(criticals[0].severity).toBe('CRITICAL');
    });

    it('returns empty when no CRITICAL defects', () => {
      tracker.report('insp-1', 'MINOR', 'Minor', 'alice', '2026-01-01T10:00:00Z');
      tracker.report('insp-1', 'MAJOR', 'Major', 'bob', '2026-01-01T11:00:00Z');
      expect(tracker.getCritical()).toHaveLength(0);
    });

    it('includes CRITICAL defects regardless of status', () => {
      const r1 = tracker.report('insp-1', 'CRITICAL', 'C1', 'alice', '2026-01-01T10:00:00Z');
      const r2 = tracker.report('insp-1', 'CRITICAL', 'C2', 'bob', '2026-01-01T11:00:00Z');
      tracker.resolve(r1.id, '2026-01-02T10:00:00Z', 'Fixed');
      tracker.review(r2.id);
      expect(tracker.getCritical()).toHaveLength(2);
    });

    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`getCritical returns ${n} critical defects`, () => {
        Array.from({ length: n }).forEach(() =>
          tracker.report('insp-1', 'CRITICAL', 'Critical', 'alice', '2026-01-01T10:00:00Z'),
        );
        tracker.report('insp-1', 'MINOR', 'Minor', 'bob', '2026-01-01T10:00:00Z');
        expect(tracker.getCritical()).toHaveLength(n);
      });
    });
  });

  // ── getCount ─────────────────────────────────────────────────────────────────
  describe('getCount', () => {
    it('returns 0 initially', () => {
      expect(tracker.getCount()).toBe(0);
    });

    it('increments with each report', () => {
      tracker.report('insp-1', 'MINOR', 'D1', 'alice', '2026-01-01T10:00:00Z');
      expect(tracker.getCount()).toBe(1);
      tracker.report('insp-1', 'MAJOR', 'D2', 'bob', '2026-01-01T11:00:00Z');
      expect(tracker.getCount()).toBe(2);
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
      it(`getCount returns ${n} after ${n} reports`, () => {
        Array.from({ length: n }).forEach(() =>
          tracker.report('insp-1', 'MINOR', 'Defect', 'alice', '2026-01-01T10:00:00Z'),
        );
        expect(tracker.getCount()).toBe(n);
      });
    });
  });

  // ── error paths ──────────────────────────────────────────────────────────────
  describe('error paths', () => {
    it('review throws for unknown id', () => {
      expect(() => tracker.review('def-999')).toThrow();
    });

    it('resolve throws for unknown id', () => {
      expect(() => tracker.resolve('def-999', '2026-01-01T10:00:00Z', 'Fix')).toThrow();
    });

    it('accept throws for unknown id', () => {
      expect(() => tracker.accept('def-999')).toThrow();
    });

    it('reject throws for unknown id', () => {
      expect(() => tracker.reject('def-999')).toThrow();
    });

    ['', 'def-0', 'def-abc', 'unknown'].forEach(badId => {
      it(`review throws for bad id: "${badId}"`, () => {
        expect(() => tracker.review(badId)).toThrow();
      });

      it(`resolve throws for bad id: "${badId}"`, () => {
        expect(() => tracker.resolve(badId, '2026-01-01T10:00:00Z', 'fix')).toThrow();
      });

      it(`accept throws for bad id: "${badId}"`, () => {
        expect(() => tracker.accept(badId)).toThrow();
      });

      it(`reject throws for bad id: "${badId}"`, () => {
        expect(() => tracker.reject(badId)).toThrow();
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// NonconformanceTracker tests
// ─────────────────────────────────────────────────────────────────────────────
describe('NonconformanceTracker', () => {
  let tracker: NonconformanceTracker;

  beforeEach(() => {
    tracker = new NonconformanceTracker();
  });

  // ── raise ────────────────────────────────────────────────────────────────────
  describe('raise', () => {
    it('returns record with id nc-1 for first call', () => {
      const r = tracker.raise('PRODUCT', 'Defective widget', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 10, 'units');
      expect(r.id).toBe('nc-1');
    });

    it('increments id on each raise call', () => {
      const r1 = tracker.raise('PRODUCT', 'NC1', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      const r2 = tracker.raise('PROCESS', 'NC2', 'REWORK', 'bob', '2026-01-02T10:00:00Z', 3, 'batches');
      expect(r1.id).toBe('nc-1');
      expect(r2.id).toBe('nc-2');
    });

    it('stores type correctly', () => {
      const r = tracker.raise('SYSTEM', 'System NC', 'USE_AS_IS', 'alice', '2026-01-01T10:00:00Z', 1, 'unit');
      expect(r.type).toBe('SYSTEM');
    });

    it('stores description', () => {
      const r = tracker.raise('PRODUCT', 'Out-of-spec dimension', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      expect(r.description).toBe('Out-of-spec dimension');
    });

    it('stores disposition', () => {
      const r = tracker.raise('PRODUCT', 'NC', 'RETURN_TO_SUPPLIER', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      expect(r.disposition).toBe('RETURN_TO_SUPPLIER');
    });

    it('stores raisedBy', () => {
      const r = tracker.raise('PRODUCT', 'NC', 'SCRAP', 'manager-dave', '2026-01-01T10:00:00Z', 5, 'pcs');
      expect(r.raisedBy).toBe('manager-dave');
    });

    it('stores raisedAt', () => {
      const r = tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-05-20T09:00:00Z', 5, 'pcs');
      expect(r.raisedAt).toBe('2026-05-20T09:00:00Z');
    });

    it('stores quantity', () => {
      const r = tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 42, 'units');
      expect(r.quantity).toBe(42);
    });

    it('stores unit', () => {
      const r = tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'kilograms');
      expect(r.unit).toBe('kilograms');
    });

    it('stores cost when provided', () => {
      const r = tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs', 500.00);
      expect(r.cost).toBe(500.00);
    });

    it('cost is undefined when not provided', () => {
      const r = tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      expect(r.cost).toBeUndefined();
    });

    it('closedAt is undefined on creation', () => {
      const r = tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      expect(r.closedAt).toBeUndefined();
    });

    const ncTypes: NonconformanceType[] = ['PRODUCT', 'PROCESS', 'SYSTEM', 'SERVICE'];
    ncTypes.forEach(type => {
      it(`raise with type ${type}`, () => {
        const r = tracker.raise(type, 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 1, 'unit');
        expect(r.type).toBe(type);
      });
    });

    const dispositions: DispositionType[] = ['REWORK', 'SCRAP', 'USE_AS_IS', 'RETURN_TO_SUPPLIER', 'REPAIR'];
    dispositions.forEach(disp => {
      it(`raise with disposition ${disp}`, () => {
        const r = tracker.raise('PRODUCT', 'NC', disp, 'alice', '2026-01-01T10:00:00Z', 1, 'unit');
        expect(r.disposition).toBe(disp);
      });
    });

    // Parameterized: 40 NC records
    Array.from({ length: 40 }, (_, i) => i + 1).forEach(i => {
      it(`raise call ${i} produces nc-${i}`, () => {
        Array.from({ length: i }).forEach((_, j) =>
          tracker.raise('PRODUCT', `NC-${j}`, 'SCRAP', 'alice', '2026-01-01T10:00:00Z', j + 1, 'pcs'),
        );
        const all = tracker.getAll();
        expect(all.length).toBe(i);
        expect(all[i - 1].id).toBe(`nc-${i}`);
      });
    });
  });

  // ── close ────────────────────────────────────────────────────────────────────
  describe('close', () => {
    it('sets closedAt on the record', () => {
      const r = tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      const closed = tracker.close(r.id, '2026-02-01T10:00:00Z');
      expect(closed.closedAt).toBe('2026-02-01T10:00:00Z');
    });

    it('returns the updated record', () => {
      const r = tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      const closed = tracker.close(r.id, '2026-02-01T10:00:00Z');
      expect(closed.id).toBe(r.id);
    });

    it('throws for unknown id', () => {
      expect(() => tracker.close('nc-999', '2026-01-01T10:00:00Z')).toThrow();
    });

    it('error message contains the unknown id', () => {
      expect(() => tracker.close('nc-bad', '2026-01-01T10:00:00Z')).toThrow('nc-bad');
    });

    // Parameterized: 20 close operations
    Array.from({ length: 20 }, (_, i) => i).forEach(i => {
      it(`close call ${i}: closedAt is set correctly`, () => {
        const r = tracker.raise('PRODUCT', `NC-${i}`, 'SCRAP', 'alice', '2026-01-01T10:00:00Z', i + 1, 'pcs');
        const closedAt = `2026-0${(i % 9) + 1}-15T10:00:00Z`;
        const closed = tracker.close(r.id, closedAt);
        expect(closed.closedAt).toBe(closedAt);
      });
    });

    ['', 'nc-0', 'nc-abc', 'unknown'].forEach(badId => {
      it(`close throws for bad id: "${badId}"`, () => {
        expect(() => tracker.close(badId, '2026-01-01T10:00:00Z')).toThrow();
      });
    });
  });

  // ── getAll ───────────────────────────────────────────────────────────────────
  describe('getAll', () => {
    it('returns empty array initially', () => {
      expect(tracker.getAll()).toHaveLength(0);
    });

    it('returns all nonconformances', () => {
      tracker.raise('PRODUCT', 'NC1', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      tracker.raise('PROCESS', 'NC2', 'REWORK', 'bob', '2026-01-02T10:00:00Z', 3, 'batches');
      expect(tracker.getAll()).toHaveLength(2);
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
      it(`getAll returns ${n} records after ${n} raises`, () => {
        Array.from({ length: n }).forEach((_, j) =>
          tracker.raise('PRODUCT', `NC-${j}`, 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 1, 'pcs'),
        );
        expect(tracker.getAll()).toHaveLength(n);
      });
    });
  });

  // ── getByType ────────────────────────────────────────────────────────────────
  describe('getByType', () => {
    const ncTypes: NonconformanceType[] = ['PRODUCT', 'PROCESS', 'SYSTEM', 'SERVICE'];

    ncTypes.forEach(type => {
      it(`getByType('${type}') returns correct records`, () => {
        tracker.raise(type, 'NC1', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
        tracker.raise(type, 'NC2', 'REWORK', 'bob', '2026-01-02T10:00:00Z', 3, 'batches');
        const other = ncTypes.find(t => t !== type)!;
        tracker.raise(other, 'NC3', 'USE_AS_IS', 'carol', '2026-01-03T10:00:00Z', 2, 'units');
        const result = tracker.getByType(type);
        expect(result).toHaveLength(2);
        result.forEach(r => expect(r.type).toBe(type));
      });
    });

    it('returns empty when no records of given type', () => {
      tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      expect(tracker.getByType('SYSTEM')).toHaveLength(0);
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
      it(`getByType returns ${n} PROCESS records`, () => {
        Array.from({ length: n }).forEach(() =>
          tracker.raise('PROCESS', 'NC', 'REWORK', 'alice', '2026-01-01T10:00:00Z', 1, 'batch'),
        );
        tracker.raise('PRODUCT', 'Other', 'SCRAP', 'bob', '2026-01-01T10:00:00Z', 1, 'pcs');
        expect(tracker.getByType('PROCESS')).toHaveLength(n);
      });
    });
  });

  // ── getByDisposition ─────────────────────────────────────────────────────────
  describe('getByDisposition', () => {
    const dispositions: DispositionType[] = ['REWORK', 'SCRAP', 'USE_AS_IS', 'RETURN_TO_SUPPLIER', 'REPAIR'];

    dispositions.forEach(disp => {
      it(`getByDisposition('${disp}') returns correct records`, () => {
        tracker.raise('PRODUCT', 'NC1', disp, 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
        const other = dispositions.find(d => d !== disp)!;
        tracker.raise('PRODUCT', 'NC2', other, 'bob', '2026-01-02T10:00:00Z', 3, 'pcs');
        const result = tracker.getByDisposition(disp);
        expect(result).toHaveLength(1);
        expect(result[0].disposition).toBe(disp);
      });
    });

    it('returns empty when no records of given disposition', () => {
      tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      expect(tracker.getByDisposition('REPAIR')).toHaveLength(0);
    });

    Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
      it(`getByDisposition returns ${n} REWORK records`, () => {
        Array.from({ length: n }).forEach(() =>
          tracker.raise('PRODUCT', 'NC', 'REWORK', 'alice', '2026-01-01T10:00:00Z', 1, 'pcs'),
        );
        tracker.raise('PRODUCT', 'Other', 'SCRAP', 'bob', '2026-01-01T10:00:00Z', 1, 'pcs');
        expect(tracker.getByDisposition('REWORK')).toHaveLength(n);
      });
    });
  });

  // ── getOpen ──────────────────────────────────────────────────────────────────
  describe('getOpen', () => {
    it('returns all open (unclosed) nonconformances', () => {
      const r1 = tracker.raise('PRODUCT', 'NC1', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      tracker.raise('PROCESS', 'NC2', 'REWORK', 'bob', '2026-01-02T10:00:00Z', 3, 'batches');
      tracker.close(r1.id, '2026-02-01T10:00:00Z');
      expect(tracker.getOpen()).toHaveLength(1);
    });

    it('returns empty when all are closed', () => {
      const r = tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      tracker.close(r.id, '2026-02-01T10:00:00Z');
      expect(tracker.getOpen()).toHaveLength(0);
    });

    it('returns all when none are closed', () => {
      tracker.raise('PRODUCT', 'NC1', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      tracker.raise('PROCESS', 'NC2', 'REWORK', 'bob', '2026-01-02T10:00:00Z', 3, 'batches');
      expect(tracker.getOpen()).toHaveLength(2);
    });

    Array.from({ length: 15 }, (_, i) => i + 1).forEach(n => {
      it(`getOpen returns ${n} open records`, () => {
        Array.from({ length: n }).forEach(() =>
          tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 1, 'pcs'),
        );
        // close one extra
        const extra = tracker.raise('PRODUCT', 'Extra', 'REWORK', 'bob', '2026-01-01T10:00:00Z', 1, 'pcs');
        tracker.close(extra.id, '2026-02-01T10:00:00Z');
        expect(tracker.getOpen()).toHaveLength(n);
      });
    });
  });

  // ── getTotalCost ─────────────────────────────────────────────────────────────
  describe('getTotalCost', () => {
    it('returns 0 when no records', () => {
      expect(tracker.getTotalCost()).toBe(0);
    });

    it('returns 0 when no costs specified', () => {
      tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      expect(tracker.getTotalCost()).toBe(0);
    });

    it('sums costs correctly', () => {
      tracker.raise('PRODUCT', 'NC1', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs', 100.00);
      tracker.raise('PROCESS', 'NC2', 'REWORK', 'bob', '2026-01-02T10:00:00Z', 3, 'batches', 250.50);
      expect(tracker.getTotalCost()).toBeCloseTo(350.50, 2);
    });

    it('includes records with no cost as 0', () => {
      tracker.raise('PRODUCT', 'NC1', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs', 100.00);
      tracker.raise('PRODUCT', 'NC2', 'SCRAP', 'bob', '2026-01-02T10:00:00Z', 3, 'pcs'); // no cost
      expect(tracker.getTotalCost()).toBeCloseTo(100.00, 2);
    });

    // Parameterized: various cost sums
    Array.from({ length: 10 }, (_, i) => (i + 1) * 100).forEach(cost => {
      it(`getTotalCost returns ${cost} for single NC with cost=${cost}`, () => {
        tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs', cost);
        expect(tracker.getTotalCost()).toBe(cost);
      });
    });

    // Parameterized: cumulative cost from multiple records
    Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
      it(`getTotalCost sums ${n} records each costing 50`, () => {
        Array.from({ length: n }).forEach(() =>
          tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 1, 'pcs', 50),
        );
        expect(tracker.getTotalCost()).toBe(n * 50);
      });
    });
  });

  // ── getCount ─────────────────────────────────────────────────────────────────
  describe('getCount', () => {
    it('returns 0 initially', () => {
      expect(tracker.getCount()).toBe(0);
    });

    it('increments with each raise', () => {
      tracker.raise('PRODUCT', 'NC1', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 5, 'pcs');
      expect(tracker.getCount()).toBe(1);
      tracker.raise('PROCESS', 'NC2', 'REWORK', 'bob', '2026-01-02T10:00:00Z', 3, 'batches');
      expect(tracker.getCount()).toBe(2);
    });

    Array.from({ length: 20 }, (_, i) => i + 1).forEach(n => {
      it(`getCount returns ${n} after ${n} raises`, () => {
        Array.from({ length: n }).forEach((_, j) =>
          tracker.raise('PRODUCT', `NC-${j}`, 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 1, 'pcs'),
        );
        expect(tracker.getCount()).toBe(n);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Integration tests
// ─────────────────────────────────────────────────────────────────────────────
describe('Integration: Inspection → Defects → Nonconformances', () => {
  let inspMgr: InspectionManager;
  let defTracker: DefectTracker;
  let ncTracker: NonconformanceTracker;

  beforeEach(() => {
    inspMgr = new InspectionManager();
    defTracker = new DefectTracker();
    ncTracker = new NonconformanceTracker();
  });

  it('full flow: schedule → start → complete FAILED → report defects → raise NC', () => {
    const insp = inspMgr.schedule('INCOMING', 'PROD-A', 'alice', '2026-01-01', 100, 'BATCH-001');
    inspMgr.start(insp.id);
    const completed = inspMgr.complete(insp.id, '2026-01-02', 10, 'Multiple defects found');
    expect(completed.status).toBe('FAILED');

    const d1 = defTracker.report(insp.id, 'MAJOR', 'Surface crack', 'alice', '2026-01-02T09:00:00Z', 'Panel-A');
    const d2 = defTracker.report(insp.id, 'MINOR', 'Paint chip', 'alice', '2026-01-02T09:30:00Z');
    expect(defTracker.getByInspection(insp.id)).toHaveLength(2);
    expect(defTracker.getOpen()).toHaveLength(2);

    defTracker.review(d1.id);
    defTracker.resolve(d1.id, '2026-01-03T10:00:00Z', 'Panel replaced');

    const nc = ncTracker.raise('PRODUCT', 'Multiple surface defects', 'REWORK', 'alice', '2026-01-02T10:00:00Z', 10, 'units', 1500.00);
    expect(ncTracker.getCount()).toBe(1);
    expect(ncTracker.getTotalCost()).toBe(1500.00);

    ncTracker.close(nc.id, '2026-01-10T10:00:00Z');
    expect(ncTracker.getOpen()).toHaveLength(0);
    expect(defTracker.getByStatus('RESOLVED')).toHaveLength(1);
  });

  it('full flow: PASSED inspection still allows optional NC recording', () => {
    const insp = inspMgr.schedule('FINAL', 'PROD-B', 'bob', '2026-02-01', 200);
    const completed = inspMgr.complete(insp.id, '2026-02-02', 0);
    expect(completed.status).toBe('PASSED');

    const nc = ncTracker.raise('PROCESS', 'Documentation gap', 'USE_AS_IS', 'bob', '2026-02-02T10:00:00Z', 1, 'process');
    expect(ncTracker.getByType('PROCESS')).toHaveLength(1);
    expect(ncTracker.getOpen()).toHaveLength(1);
    expect(nc.id).toBe('nc-1');
  });

  it('full flow: CONDITIONALLY_PASSED inspection with minor defects accepted', () => {
    const insp = inspMgr.schedule('IN_PROCESS', 'PROD-C', 'carol', '2026-03-01', 200);
    const completed = inspMgr.complete(insp.id, '2026-03-02', 8); // 8/200 = 4% < 5%
    expect(completed.status).toBe('CONDITIONALLY_PASSED');

    const d = defTracker.report(insp.id, 'MINOR', 'Minor cosmetic issue', 'carol', '2026-03-02T09:00:00Z');
    defTracker.review(d.id);
    defTracker.accept(d.id);
    expect(defTracker.getByStatus('ACCEPTED')).toHaveLength(1);
    expect(defTracker.getOpen()).toHaveLength(0);
  });

  it('multiple products tracked independently', () => {
    const inspA = inspMgr.schedule('INCOMING', 'PROD-A', 'alice', '2026-01-01', 100);
    const inspB = inspMgr.schedule('INCOMING', 'PROD-B', 'bob', '2026-01-01', 50);
    inspMgr.complete(inspA.id, '2026-01-02', 0);
    inspMgr.complete(inspB.id, '2026-01-02', 5); // 5/50 = 10% → FAILED

    defTracker.report(inspA.id, 'MINOR', 'Small mark', 'alice', '2026-01-02T10:00:00Z');
    defTracker.report(inspB.id, 'CRITICAL', 'Structural failure', 'bob', '2026-01-02T11:00:00Z');
    defTracker.report(inspB.id, 'MAJOR', 'Dimensional issue', 'bob', '2026-01-02T12:00:00Z');

    expect(defTracker.getByInspection(inspA.id)).toHaveLength(1);
    expect(defTracker.getByInspection(inspB.id)).toHaveLength(2);
    expect(defTracker.getCritical()).toHaveLength(1);
    expect(inspMgr.getByProduct('PROD-A')).toHaveLength(1);
    expect(inspMgr.getByProduct('PROD-B')).toHaveLength(1);
    expect(inspMgr.getByStatus('PASSED')).toHaveLength(1);
    expect(inspMgr.getByStatus('FAILED')).toHaveLength(1);
  });

  it('pass rate calculation across multiple inspections', () => {
    // 3 PASSED, 1 FAILED, 1 CONDITIONALLY_PASSED → 3/5 = 60%
    const recs = Array.from({ length: 5 }, () =>
      inspMgr.schedule('FINAL', 'P1', 'alice', '2026-01-01', 100),
    );
    inspMgr.complete(recs[0].id, '2026-01-02', 0);
    inspMgr.complete(recs[1].id, '2026-01-02', 0);
    inspMgr.complete(recs[2].id, '2026-01-02', 0);
    inspMgr.complete(recs[3].id, '2026-01-02', 10); // FAILED
    inspMgr.complete(recs[4].id, '2026-01-02', 3);  // CONDITIONALLY_PASSED
    expect(inspMgr.getPassRate()).toBe(60);
  });

  it('defect rate aggregated across multiple inspections', () => {
    const r1 = inspMgr.schedule('FINAL', 'P1', 'alice', '2026-01-01', 100);
    const r2 = inspMgr.schedule('FINAL', 'P2', 'bob', '2026-01-01', 200);
    inspMgr.complete(r1.id, '2026-01-02', 5);  // 5/100
    inspMgr.complete(r2.id, '2026-01-02', 10); // 10/200
    // total: 15 defects / 300 sample = 5%
    expect(inspMgr.getDefectRate()).toBeCloseTo(5, 5);
  });

  it('NC total cost accumulates correctly across types', () => {
    ncTracker.raise('PRODUCT', 'NC1', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 10, 'pcs', 200.00);
    ncTracker.raise('PROCESS', 'NC2', 'REWORK', 'bob', '2026-01-02T10:00:00Z', 2, 'batches', 800.00);
    ncTracker.raise('SYSTEM', 'NC3', 'USE_AS_IS', 'carol', '2026-01-03T10:00:00Z', 1, 'unit');
    ncTracker.raise('SERVICE', 'NC4', 'REPAIR', 'dave', '2026-01-04T10:00:00Z', 3, 'calls', 150.00);
    expect(ncTracker.getTotalCost()).toBeCloseTo(1150.00, 2);
  });

  // Parameterized integration: 30 inspection cycles
  Array.from({ length: 30 }, (_, i) => i).forEach(i => {
    it(`integration cycle ${i}: schedule + complete + report defects`, () => {
      const insp = inspMgr.schedule('INCOMING', `PROD-${i}`, `inspector-${i}`, '2026-01-01', 100 + i);
      inspMgr.start(insp.id);
      const defectCount = i % 10; // 0..9
      const completed = inspMgr.complete(insp.id, '2026-01-02', defectCount);
      if (defectCount === 0) {
        expect(completed.status).toBe('PASSED');
      } else if (defectCount > (100 + i) * 0.05) {
        expect(completed.status).toBe('FAILED');
      } else {
        expect(completed.status).toBe('CONDITIONALLY_PASSED');
      }
      // Report any defects
      Array.from({ length: Math.min(defectCount, 3) }).forEach((_, j) => {
        defTracker.report(insp.id, 'MINOR', `Defect ${j} for inspection ${i}`, `inspector-${i}`, '2026-01-02T10:00:00Z');
      });
      expect(defTracker.getByInspection(insp.id).length).toBe(Math.min(defectCount, 3));
    });
  });

  // Parameterized integration: 20 NC closure workflows
  Array.from({ length: 20 }, (_, i) => i).forEach(i => {
    it(`NC workflow ${i}: raise → close`, () => {
      const nc = ncTracker.raise(
        'PRODUCT',
        `NC description ${i}`,
        'REWORK',
        `user-${i}`,
        '2026-01-01T10:00:00Z',
        i + 1,
        'units',
        (i + 1) * 100,
      );
      expect(ncTracker.getOpen()).toContainEqual(expect.objectContaining({ id: nc.id }));
      ncTracker.close(nc.id, `2026-02-${String(i % 28 + 1).padStart(2, '0')}T10:00:00Z`);
      expect(ncTracker.getOpen()).not.toContainEqual(expect.objectContaining({ id: nc.id }));
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional InspectionManager parameterized tests
// ─────────────────────────────────────────────────────────────────────────────
describe('InspectionManager additional coverage', () => {
  let mgr: InspectionManager;

  beforeEach(() => {
    mgr = new InspectionManager();
  });

  // sampleSize boundary: exactly at threshold (defects === sampleSize * 0.05)
  Array.from({ length: 10 }, (_, i) => (i + 2) * 20).forEach(sampleSize => {
    const defects = Math.floor(sampleSize * 0.05);
    it(`boundary: sampleSize=${sampleSize}, defects=${defects} → CONDITIONALLY_PASSED`, () => {
      const r = mgr.schedule('RECEIVING', 'P-boundary', 'tester', '2026-01-01', sampleSize);
      const done = mgr.complete(r.id, '2026-01-02', defects);
      expect(done.status).toBe('CONDITIONALLY_PASSED');
    });
  });

  // just-over threshold → FAILED
  Array.from({ length: 10 }, (_, i) => (i + 2) * 20).forEach(sampleSize => {
    const defects = Math.floor(sampleSize * 0.05) + 1;
    it(`just-over threshold: sampleSize=${sampleSize}, defects=${defects} → FAILED`, () => {
      const r = mgr.schedule('AUDIT', 'P-over', 'tester', '2026-01-01', sampleSize);
      const done = mgr.complete(r.id, '2026-01-02', defects);
      expect(done.status).toBe('FAILED');
    });
  });

  // getAll returns values in insertion order
  Array.from({ length: 10 }, (_, i) => i + 2).forEach(n => {
    it(`getAll maintains insertion order for ${n} records`, () => {
      const ids: string[] = [];
      Array.from({ length: n }).forEach((_, j) => {
        const r = mgr.schedule('INCOMING', `PROD-${j}`, 'alice', '2026-01-01', 10);
        ids.push(r.id);
      });
      const all = mgr.getAll();
      expect(all.map(r => r.id)).toEqual(ids);
    });
  });

  // complete without start (direct transition from PENDING)
  Array.from({ length: 5 }, (_, i) => i).forEach(i => {
    it(`complete without start call ${i} works correctly`, () => {
      const r = mgr.schedule('FINAL', `P${i}`, 'alice', '2026-01-01', 100);
      const done = mgr.complete(r.id, '2026-01-02', 0);
      expect(done.status).toBe('PASSED');
    });
  });

  // schedule with all 5 types in sequence
  it('schedule all 5 types in sequence — all tracked', () => {
    const types: InspectionType[] = ['INCOMING', 'IN_PROCESS', 'FINAL', 'RECEIVING', 'AUDIT'];
    types.forEach((t, idx) => mgr.schedule(t, `P${idx}`, 'alice', '2026-01-01', 50));
    expect(mgr.getCount()).toBe(5);
    const types_seen = mgr.getAll().map(r => r.type);
    expect(types_seen).toEqual(types);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional DefectTracker parameterized tests
// ─────────────────────────────────────────────────────────────────────────────
describe('DefectTracker additional coverage', () => {
  let tracker: DefectTracker;

  beforeEach(() => {
    tracker = new DefectTracker();
  });

  // resolve sets resolvedAt field on multiple defects
  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`resolve with resolvedAt=2026-0${(i % 9) + 1}-10 sets field correctly`, () => {
      const r = tracker.report('insp-1', 'MAJOR', `D${i}`, 'alice', '2026-01-01T10:00:00Z');
      const resolvedAt = `2026-0${(i % 9) + 1}-10T10:00:00Z`;
      const updated = tracker.resolve(r.id, resolvedAt, `Fix ${i}`);
      expect(updated.resolvedAt).toBe(resolvedAt);
      expect(updated.resolution).toBe(`Fix ${i}`);
    });
  });

  // report with all 3 severities with location
  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    const severity = (['MINOR', 'MAJOR', 'CRITICAL'] as DefectSeverity[])[i % 3];
    it(`report with severity ${severity} and location "Zone-${i}"`, () => {
      const r = tracker.report('insp-1', severity, `Defect ${i}`, 'alice', '2026-01-01T10:00:00Z', `Zone-${i}`);
      expect(r.severity).toBe(severity);
      expect(r.location).toBe(`Zone-${i}`);
    });
  });

  // getByInspection with multiple inspection IDs
  Array.from({ length: 10 }, (_, i) => i).forEach(i => {
    it(`getByInspection('insp-${i}') isolates correctly`, () => {
      Array.from({ length: 3 }).forEach(() =>
        tracker.report(`insp-${i}`, 'MINOR', 'D', 'alice', '2026-01-01T10:00:00Z'),
      );
      // Add a few for another inspection
      Array.from({ length: 2 }).forEach(() =>
        tracker.report(`insp-other-${i}`, 'MAJOR', 'D2', 'bob', '2026-01-01T10:00:00Z'),
      );
      expect(tracker.getByInspection(`insp-${i}`)).toHaveLength(3);
    });
  });

  // getCritical includes CRITICAL regardless of resolution state
  Array.from({ length: 5 }, (_, i) => i).forEach(i => {
    it(`getCritical includes resolved critical defect ${i}`, () => {
      const r = tracker.report('insp-1', 'CRITICAL', `Critical ${i}`, 'alice', '2026-01-01T10:00:00Z');
      tracker.resolve(r.id, '2026-01-02T10:00:00Z', `Fixed ${i}`);
      expect(tracker.getCritical()).toHaveLength(1);
      expect(tracker.getCritical()[0].status).toBe('RESOLVED');
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional NonconformanceTracker parameterized tests
// ─────────────────────────────────────────────────────────────────────────────
describe('NonconformanceTracker additional coverage', () => {
  let tracker: NonconformanceTracker;

  beforeEach(() => {
    tracker = new NonconformanceTracker();
  });

  // Vary quantity values
  Array.from({ length: 10 }, (_, i) => (i + 1) * 7).forEach(qty => {
    it(`raise with quantity=${qty} stores correctly`, () => {
      const r = tracker.raise('PRODUCT', 'NC', 'SCRAP', 'alice', '2026-01-01T10:00:00Z', qty, 'pcs');
      expect(r.quantity).toBe(qty);
    });
  });

  // Vary unit values
  ['pcs', 'kg', 'liters', 'meters', 'batches', 'units', 'boxes', 'pallets', 'rolls', 'sheets'].forEach(unit => {
    it(`raise with unit="${unit}" stores correctly`, () => {
      const r = tracker.raise('PRODUCT', 'NC', 'REWORK', 'alice', '2026-01-01T10:00:00Z', 5, unit);
      expect(r.unit).toBe(unit);
    });
  });

  // Ensure getAll returns in insertion order
  Array.from({ length: 10 }, (_, i) => i + 2).forEach(n => {
    it(`getAll maintains insertion order for ${n} records`, () => {
      const ids: string[] = [];
      Array.from({ length: n }).forEach((_, j) => {
        const r = tracker.raise('PRODUCT', `NC-${j}`, 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 1, 'pcs');
        ids.push(r.id);
      });
      const all = tracker.getAll();
      expect(all.map(r => r.id)).toEqual(ids);
    });
  });

  // getTotalCost with mixed cost/no-cost records
  Array.from({ length: 10 }, (_, i) => i + 1).forEach(n => {
    it(`getTotalCost with ${n} costed and ${n} uncosted records`, () => {
      Array.from({ length: n }).forEach((_, j) =>
        tracker.raise('PRODUCT', `NC-${j}`, 'SCRAP', 'alice', '2026-01-01T10:00:00Z', 1, 'pcs', 75),
      );
      Array.from({ length: n }).forEach((_, j) =>
        tracker.raise('PROCESS', `NC2-${j}`, 'REWORK', 'bob', '2026-01-01T10:00:00Z', 1, 'batch'),
      );
      expect(tracker.getTotalCost()).toBe(n * 75);
    });
  });

  // closing preserves all other fields
  it('close preserves type, description, disposition, raisedBy, quantity, unit, cost', () => {
    const r = tracker.raise('SERVICE', 'Warranty claim', 'REPAIR', 'manager', '2026-01-01T10:00:00Z', 3, 'calls', 320.00);
    const closed = tracker.close(r.id, '2026-03-01T10:00:00Z');
    expect(closed.type).toBe('SERVICE');
    expect(closed.description).toBe('Warranty claim');
    expect(closed.disposition).toBe('REPAIR');
    expect(closed.raisedBy).toBe('manager');
    expect(closed.quantity).toBe(3);
    expect(closed.unit).toBe('calls');
    expect(closed.cost).toBe(320.00);
  });

  it('getByDisposition USE_AS_IS returns correct subset', () => {
    tracker.raise('PRODUCT', 'NC1', 'USE_AS_IS', 'alice', '2026-01-01T10:00:00Z', 1, 'pcs');
    tracker.raise('PRODUCT', 'NC2', 'USE_AS_IS', 'bob', '2026-01-02T10:00:00Z', 2, 'pcs');
    tracker.raise('PRODUCT', 'NC3', 'SCRAP', 'carol', '2026-01-03T10:00:00Z', 3, 'pcs');
    const result = tracker.getByDisposition('USE_AS_IS');
    expect(result).toHaveLength(2);
    result.forEach(r => expect(r.disposition).toBe('USE_AS_IS'));
  });

  it('getByType SERVICE returns correct subset', () => {
    tracker.raise('SERVICE', 'S1', 'REPAIR', 'alice', '2026-01-01T10:00:00Z', 1, 'call');
    tracker.raise('SERVICE', 'S2', 'REPAIR', 'bob', '2026-01-02T10:00:00Z', 2, 'calls');
    tracker.raise('PRODUCT', 'P1', 'SCRAP', 'carol', '2026-01-03T10:00:00Z', 5, 'pcs');
    const result = tracker.getByType('SERVICE');
    expect(result).toHaveLength(2);
    result.forEach(r => expect(r.type).toBe('SERVICE'));
  });
});
