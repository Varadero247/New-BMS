// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { SupplierRegistry } from '../supplier-registry';
import { EvaluationTracker } from '../evaluation-tracker';
import {
  SupplierStatus,
  SupplierCategory,
  EvaluationCriteria,
  EvaluationResult,
  PerformanceRating,
  SupplierRecord,
  SupplierEvaluation,
} from '../types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ALL_STATUSES: SupplierStatus[] = [
  'PENDING_APPROVAL',
  'APPROVED',
  'CONDITIONAL',
  'SUSPENDED',
  'DISQUALIFIED',
];

const ALL_CATEGORIES: SupplierCategory[] = ['CRITICAL', 'MAJOR', 'MINOR', 'PREFERRED'];

const ALL_RESULTS: EvaluationResult[] = ['APPROVED', 'CONDITIONAL', 'REJECTED'];

const ALL_CRITERIA: EvaluationCriteria[] = [
  'QUALITY',
  'DELIVERY',
  'PRICE',
  'SERVICE',
  'COMPLIANCE',
  'FINANCIAL_STABILITY',
];

const ALL_RATINGS: PerformanceRating[] = [1, 2, 3, 4, 5];

function makeScores(value: number): Record<EvaluationCriteria, number> {
  return {
    QUALITY: value,
    DELIVERY: value,
    PRICE: value,
    SERVICE: value,
    COMPLIANCE: value,
    FINANCIAL_STABILITY: value,
  };
}

function makeVariedScores(base: number): Record<EvaluationCriteria, number> {
  return {
    QUALITY: base,
    DELIVERY: base + 5,
    PRICE: base + 10,
    SERVICE: base + 2,
    COMPLIANCE: base + 8,
    FINANCIAL_STABILITY: base + 4,
  };
}

// ---------------------------------------------------------------------------
// SupplierRegistry
// ---------------------------------------------------------------------------

describe('SupplierRegistry', () => {
  let registry: SupplierRegistry;

  beforeEach(() => {
    registry = new SupplierRegistry();
  });

  // -------------------------------------------------------------------------
  // register
  // -------------------------------------------------------------------------

  describe('register()', () => {
    it('returns a supplier record with an id', () => {
      const r = registry.register('Acme Corp', 'CRITICAL', 'US', 'acme@example.com', ['Widget A']);
      expect(r.id).toBeDefined();
      expect(typeof r.id).toBe('string');
    });

    it('sets initial status to PENDING_APPROVAL', () => {
      const r = registry.register('Acme Corp', 'CRITICAL', 'US', 'acme@example.com', ['Widget A']);
      expect(r.status).toBe('PENDING_APPROVAL');
    });

    it('stores the supplier name correctly', () => {
      const r = registry.register('Beta Supplies', 'MAJOR', 'UK', 'beta@example.com', ['Part X']);
      expect(r.name).toBe('Beta Supplies');
    });

    it('stores category correctly', () => {
      const r = registry.register('Gamma Ltd', 'MINOR', 'DE', 'gamma@example.com', ['Part Y']);
      expect(r.category).toBe('MINOR');
    });

    it('stores country correctly', () => {
      const r = registry.register('Delta Inc', 'PREFERRED', 'CA', 'delta@example.com', ['Tool Z']);
      expect(r.country).toBe('CA');
    });

    it('stores contactEmail correctly', () => {
      const r = registry.register('Epsilon GmbH', 'CRITICAL', 'AT', 'eps@example.com', ['Cable A']);
      expect(r.contactEmail).toBe('eps@example.com');
    });

    it('stores products array correctly', () => {
      const r = registry.register('Zeta Co', 'MAJOR', 'FR', 'zeta@example.com', ['Prod1', 'Prod2']);
      expect(r.products).toEqual(['Prod1', 'Prod2']);
    });

    it('stores notes when provided', () => {
      const r = registry.register('Eta Corp', 'MINOR', 'JP', 'eta@example.com', ['Item'], 'Some notes');
      expect(r.notes).toBe('Some notes');
    });

    it('leaves notes undefined when not provided', () => {
      const r = registry.register('Theta Ltd', 'PREFERRED', 'AU', 'theta@example.com', ['Box']);
      expect(r.notes).toBeUndefined();
    });

    it('increments count after each registration', () => {
      registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      registry.register('B', 'MAJOR', 'US', 'b@e.com', []);
      expect(registry.getCount()).toBe(2);
    });

    it('each supplier gets a unique id', () => {
      const ids = Array.from({ length: 10 }, (_, i) =>
        registry.register(`Supplier ${i}`, 'MINOR', 'US', `s${i}@e.com`, []).id,
      );
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });

    it('returned record has no approvedBy initially', () => {
      const r = registry.register('Iota', 'CRITICAL', 'US', 'iota@e.com', []);
      expect(r.approvedBy).toBeUndefined();
    });

    it('returned record has no approvedAt initially', () => {
      const r = registry.register('Kappa', 'CRITICAL', 'US', 'kappa@e.com', []);
      expect(r.approvedAt).toBeUndefined();
    });

    it('returned record has no reviewDate initially', () => {
      const r = registry.register('Lambda', 'CRITICAL', 'US', 'lambda@e.com', []);
      expect(r.reviewDate).toBeUndefined();
    });

    it('returned record has no overallRating initially', () => {
      const r = registry.register('Mu', 'CRITICAL', 'US', 'mu@e.com', []);
      expect(r.overallRating).toBeUndefined();
    });

    it('products array is copied (mutation safe)', () => {
      const products = ['Prod1', 'Prod2'];
      const r = registry.register('Nu', 'MAJOR', 'US', 'nu@e.com', products);
      products.push('Prod3');
      expect(r.products).toHaveLength(2);
    });

    // Test all categories
    ALL_CATEGORIES.forEach((cat) => {
      it(`registers supplier with category ${cat}`, () => {
        const r = registry.register(`Supplier-${cat}`, cat, 'US', `${cat}@e.com`, []);
        expect(r.category).toBe(cat);
      });
    });

    // Parameterised: register 50 suppliers
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`registers supplier index ${i} with correct name`, () => {
        const r = registry.register(`Bulk Supplier ${i}`, 'MINOR', 'US', `bulk${i}@e.com`, [`Product${i}`]);
        expect(r.name).toBe(`Bulk Supplier ${i}`);
        expect(r.status).toBe('PENDING_APPROVAL');
      });
    });
  });

  // -------------------------------------------------------------------------
  // approve
  // -------------------------------------------------------------------------

  describe('approve()', () => {
    it('changes status to APPROVED', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      const approved = registry.approve(r.id, 'admin@ims.com', '2026-01-01');
      expect(approved.status).toBe('APPROVED');
    });

    it('sets approvedBy', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      const approved = registry.approve(r.id, 'admin@ims.com', '2026-01-01');
      expect(approved.approvedBy).toBe('admin@ims.com');
    });

    it('sets approvedAt', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      const approved = registry.approve(r.id, 'admin@ims.com', '2026-01-15');
      expect(approved.approvedAt).toBe('2026-01-15');
    });

    it('sets reviewDate when provided', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      const approved = registry.approve(r.id, 'admin@ims.com', '2026-01-01', '2027-01-01');
      expect(approved.reviewDate).toBe('2027-01-01');
    });

    it('does not set reviewDate when not provided', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      const approved = registry.approve(r.id, 'admin@ims.com', '2026-01-01');
      expect(approved.reviewDate).toBeUndefined();
    });

    it('throws for unknown id', () => {
      expect(() => registry.approve('UNKNOWN', 'admin', '2026-01-01')).toThrow();
    });

    it('persists the APPROVED status when re-fetched', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.approve(r.id, 'admin@ims.com', '2026-01-01');
      expect(registry.get(r.id)?.status).toBe('APPROVED');
    });

    it('appears in getApproved() list', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.approve(r.id, 'admin@ims.com', '2026-01-01');
      const approved = registry.getApproved();
      expect(approved.find((s) => s.id === r.id)).toBeDefined();
    });

    // Parameterised: approve 50 suppliers
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`approves supplier index ${i} correctly`, () => {
        const r = registry.register(`Supplier ${i}`, 'CRITICAL', 'US', `s${i}@e.com`, []);
        const approved = registry.approve(r.id, `approver${i}@ims.com`, `2026-01-${String(i % 28 + 1).padStart(2, '0')}`);
        expect(approved.status).toBe('APPROVED');
        expect(approved.approvedBy).toBe(`approver${i}@ims.com`);
      });
    });
  });

  // -------------------------------------------------------------------------
  // makeConditional
  // -------------------------------------------------------------------------

  describe('makeConditional()', () => {
    it('changes status to CONDITIONAL', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      const result = registry.makeConditional(r.id);
      expect(result.status).toBe('CONDITIONAL');
    });

    it('throws for unknown id', () => {
      expect(() => registry.makeConditional('UNKNOWN')).toThrow();
    });

    it('persists CONDITIONAL status', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.makeConditional(r.id);
      expect(registry.get(r.id)?.status).toBe('CONDITIONAL');
    });

    it('appears in getHighRisk()', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.makeConditional(r.id);
      const highRisk = registry.getHighRisk();
      expect(highRisk.find((s) => s.id === r.id)).toBeDefined();
    });

    it('appears in getByStatus("CONDITIONAL")', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.makeConditional(r.id);
      expect(registry.getByStatus('CONDITIONAL').find((s) => s.id === r.id)).toBeDefined();
    });

    // Parameterised
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`makeConditional index ${i} sets status correctly`, () => {
        const r = registry.register(`Supplier ${i}`, 'MAJOR', 'US', `s${i}@e.com`, []);
        const result = registry.makeConditional(r.id);
        expect(result.status).toBe('CONDITIONAL');
      });
    });
  });

  // -------------------------------------------------------------------------
  // suspend
  // -------------------------------------------------------------------------

  describe('suspend()', () => {
    it('changes status to SUSPENDED', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      const result = registry.suspend(r.id);
      expect(result.status).toBe('SUSPENDED');
    });

    it('throws for unknown id', () => {
      expect(() => registry.suspend('UNKNOWN')).toThrow();
    });

    it('persists SUSPENDED status', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.suspend(r.id);
      expect(registry.get(r.id)?.status).toBe('SUSPENDED');
    });

    it('appears in getHighRisk()', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.suspend(r.id);
      expect(registry.getHighRisk().find((s) => s.id === r.id)).toBeDefined();
    });

    it('does NOT appear in getApproved()', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.suspend(r.id);
      expect(registry.getApproved().find((s) => s.id === r.id)).toBeUndefined();
    });

    // Parameterised
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`suspend index ${i} sets status correctly`, () => {
        const r = registry.register(`Supplier ${i}`, 'MAJOR', 'US', `s${i}@e.com`, []);
        const result = registry.suspend(r.id);
        expect(result.status).toBe('SUSPENDED');
      });
    });
  });

  // -------------------------------------------------------------------------
  // disqualify
  // -------------------------------------------------------------------------

  describe('disqualify()', () => {
    it('changes status to DISQUALIFIED', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      const result = registry.disqualify(r.id);
      expect(result.status).toBe('DISQUALIFIED');
    });

    it('throws for unknown id', () => {
      expect(() => registry.disqualify('UNKNOWN')).toThrow();
    });

    it('persists DISQUALIFIED status', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.disqualify(r.id);
      expect(registry.get(r.id)?.status).toBe('DISQUALIFIED');
    });

    it('does NOT appear in getApproved()', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.disqualify(r.id);
      expect(registry.getApproved().find((s) => s.id === r.id)).toBeUndefined();
    });

    it('does NOT appear in getHighRisk()', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.disqualify(r.id);
      expect(registry.getHighRisk().find((s) => s.id === r.id)).toBeUndefined();
    });

    // Parameterised
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`disqualify index ${i} sets status correctly`, () => {
        const r = registry.register(`Supplier ${i}`, 'MINOR', 'US', `s${i}@e.com`, []);
        const result = registry.disqualify(r.id);
        expect(result.status).toBe('DISQUALIFIED');
      });
    });
  });

  // -------------------------------------------------------------------------
  // updateRating
  // -------------------------------------------------------------------------

  describe('updateRating()', () => {
    ALL_RATINGS.forEach((rating) => {
      it(`sets overallRating to ${rating}`, () => {
        const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
        const updated = registry.updateRating(r.id, rating);
        expect(updated.overallRating).toBe(rating);
      });
    });

    it('throws for unknown id', () => {
      expect(() => registry.updateRating('UNKNOWN', 3)).toThrow();
    });

    it('persists rating after update', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.updateRating(r.id, 4);
      expect(registry.get(r.id)?.overallRating).toBe(4);
    });

    it('overwrites previous rating', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.updateRating(r.id, 2);
      registry.updateRating(r.id, 5);
      expect(registry.get(r.id)?.overallRating).toBe(5);
    });

    // Parameterised: update rating for 50 suppliers
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`updateRating for supplier ${i} persists correctly`, () => {
        const r = registry.register(`Supplier ${i}`, 'PREFERRED', 'US', `s${i}@e.com`, []);
        const rating = ((i % 5) + 1) as PerformanceRating;
        registry.updateRating(r.id, rating);
        expect(registry.get(r.id)?.overallRating).toBe(rating);
      });
    });
  });

  // -------------------------------------------------------------------------
  // get / getAll
  // -------------------------------------------------------------------------

  describe('get()', () => {
    it('returns undefined for unknown id', () => {
      expect(registry.get('UNKNOWN')).toBeUndefined();
    });

    it('returns supplier for known id', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      expect(registry.get(r.id)).toBeDefined();
    });

    it('returned object matches registered data', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', ['P1']);
      const fetched = registry.get(r.id);
      expect(fetched?.name).toBe('Acme');
      expect(fetched?.category).toBe('CRITICAL');
    });

    it('is a copy (mutation does not affect store)', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', ['P1']);
      const fetched = registry.get(r.id) as SupplierRecord;
      (fetched as any).name = 'Modified';
      expect(registry.get(r.id)?.name).toBe('Acme');
    });

    // Parameterised
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`get() returns correct supplier for index ${i}`, () => {
        const r = registry.register(`Supplier ${i}`, 'MINOR', 'US', `s${i}@e.com`, []);
        const fetched = registry.get(r.id);
        expect(fetched?.id).toBe(r.id);
        expect(fetched?.name).toBe(`Supplier ${i}`);
      });
    });
  });

  describe('getAll()', () => {
    it('returns empty array when no suppliers', () => {
      expect(registry.getAll()).toEqual([]);
    });

    it('returns all registered suppliers', () => {
      registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      registry.register('B', 'MAJOR', 'UK', 'b@e.com', []);
      expect(registry.getAll()).toHaveLength(2);
    });

    it('count matches getCount()', () => {
      Array.from({ length: 5 }, (_, i) =>
        registry.register(`S${i}`, 'MINOR', 'US', `s${i}@e.com`, []),
      );
      expect(registry.getAll()).toHaveLength(registry.getCount());
    });

    // Parameterised
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`getAll() returns ${n} suppliers after ${n} registrations`, () => {
        for (let j = 0; j < n; j++) {
          registry.register(`S${j}`, 'MINOR', 'US', `s${j}@e.com`, []);
        }
        expect(registry.getAll()).toHaveLength(n);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getByStatus
  // -------------------------------------------------------------------------

  describe('getByStatus()', () => {
    it('returns only PENDING_APPROVAL suppliers', () => {
      registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      registry.register('B', 'MAJOR', 'UK', 'b@e.com', []);
      const pending = registry.getByStatus('PENDING_APPROVAL');
      expect(pending).toHaveLength(2);
    });

    it('returns empty when no supplier in that status', () => {
      registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      expect(registry.getByStatus('APPROVED')).toHaveLength(0);
    });

    it('filters correctly after status transition', () => {
      const r = registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      registry.approve(r.id, 'admin', '2026-01-01');
      expect(registry.getByStatus('PENDING_APPROVAL')).toHaveLength(0);
      expect(registry.getByStatus('APPROVED')).toHaveLength(1);
    });

    ALL_STATUSES.forEach((status) => {
      it(`getByStatus('${status}') returns only that status`, () => {
        const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
        switch (status) {
          case 'APPROVED':
            registry.approve(r.id, 'admin', '2026-01-01');
            break;
          case 'CONDITIONAL':
            registry.makeConditional(r.id);
            break;
          case 'SUSPENDED':
            registry.suspend(r.id);
            break;
          case 'DISQUALIFIED':
            registry.disqualify(r.id);
            break;
          default:
            break;
        }
        const results = registry.getByStatus(status);
        expect(results.every((s) => s.status === status)).toBe(true);
      });
    });

    // Parameterised: register 40 suppliers and filter
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`getByStatus index ${i} - registered supplier has PENDING_APPROVAL`, () => {
        registry.register(`Supplier ${i}`, 'MINOR', 'US', `s${i}@e.com`, []);
        const pending = registry.getByStatus('PENDING_APPROVAL');
        expect(pending.length).toBeGreaterThanOrEqual(1);
        expect(pending.every((s) => s.status === 'PENDING_APPROVAL')).toBe(true);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getByCategory
  // -------------------------------------------------------------------------

  describe('getByCategory()', () => {
    ALL_CATEGORIES.forEach((cat) => {
      it(`filters by category ${cat}`, () => {
        registry.register(`S-${cat}`, cat, 'US', `${cat}@e.com`, []);
        const results = registry.getByCategory(cat);
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(results.every((s) => s.category === cat)).toBe(true);
      });
    });

    it('returns empty for category with no suppliers', () => {
      registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      expect(registry.getByCategory('PREFERRED')).toHaveLength(0);
    });

    // Parameterised
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`getByCategory index ${i} - returns correct category`, () => {
        const cat = ALL_CATEGORIES[i % ALL_CATEGORIES.length];
        registry.register(`Supplier ${i}`, cat, 'US', `s${i}@e.com`, []);
        const results = registry.getByCategory(cat);
        expect(results.some((s) => s.name === `Supplier ${i}`)).toBe(true);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getByCountry
  // -------------------------------------------------------------------------

  describe('getByCountry()', () => {
    it('returns suppliers for a given country', () => {
      registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      registry.register('B', 'MAJOR', 'UK', 'b@e.com', []);
      expect(registry.getByCountry('US')).toHaveLength(1);
      expect(registry.getByCountry('UK')).toHaveLength(1);
    });

    it('returns empty for unknown country', () => {
      registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      expect(registry.getByCountry('ZZ')).toHaveLength(0);
    });

    it('returns multiple suppliers for same country', () => {
      registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      registry.register('B', 'MAJOR', 'US', 'b@e.com', []);
      expect(registry.getByCountry('US')).toHaveLength(2);
    });

    // Parameterised
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`getByCountry index ${i} returns correct supplier`, () => {
        const country = `CC${i % 20}`;
        registry.register(`Supplier ${i}`, 'MINOR', country, `s${i}@e.com`, []);
        const results = registry.getByCountry(country);
        expect(results.some((s) => s.name === `Supplier ${i}`)).toBe(true);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getApproved
  // -------------------------------------------------------------------------

  describe('getApproved()', () => {
    it('returns empty array initially', () => {
      expect(registry.getApproved()).toHaveLength(0);
    });

    it('returns approved suppliers only', () => {
      const r1 = registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      const r2 = registry.register('B', 'MAJOR', 'UK', 'b@e.com', []);
      registry.approve(r1.id, 'admin', '2026-01-01');
      expect(registry.getApproved()).toHaveLength(1);
      expect(registry.getApproved()[0].id).toBe(r1.id);
    });

    it('does not include CONDITIONAL suppliers', () => {
      const r = registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      registry.makeConditional(r.id);
      expect(registry.getApproved()).toHaveLength(0);
    });

    // Parameterised: approve 50 suppliers and check count
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`getApproved index ${i} - count matches number approved`, () => {
        const r = registry.register(`Supplier ${i}`, 'CRITICAL', 'US', `s${i}@e.com`, []);
        registry.approve(r.id, 'admin', '2026-01-01');
        expect(registry.getApproved().length).toBeGreaterThanOrEqual(1);
        expect(registry.getApproved().every((s) => s.status === 'APPROVED')).toBe(true);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getHighRisk
  // -------------------------------------------------------------------------

  describe('getHighRisk()', () => {
    it('returns empty array initially', () => {
      expect(registry.getHighRisk()).toHaveLength(0);
    });

    it('includes CONDITIONAL suppliers', () => {
      const r = registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      registry.makeConditional(r.id);
      expect(registry.getHighRisk()).toHaveLength(1);
    });

    it('includes SUSPENDED suppliers', () => {
      const r = registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      registry.suspend(r.id);
      expect(registry.getHighRisk()).toHaveLength(1);
    });

    it('does not include PENDING_APPROVAL suppliers', () => {
      registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      expect(registry.getHighRisk()).toHaveLength(0);
    });

    it('does not include DISQUALIFIED suppliers', () => {
      const r = registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      registry.disqualify(r.id);
      expect(registry.getHighRisk()).toHaveLength(0);
    });

    it('includes both CONDITIONAL and SUSPENDED', () => {
      const r1 = registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      const r2 = registry.register('B', 'MAJOR', 'UK', 'b@e.com', []);
      registry.makeConditional(r1.id);
      registry.suspend(r2.id);
      expect(registry.getHighRisk()).toHaveLength(2);
    });

    // Parameterised
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getHighRisk index ${i} - suspended supplier appears`, () => {
        const r = registry.register(`Supplier ${i}`, 'MAJOR', 'US', `s${i}@e.com`, []);
        registry.suspend(r.id);
        expect(registry.getHighRisk().find((s) => s.id === r.id)).toBeDefined();
      });
    });
  });

  // -------------------------------------------------------------------------
  // getOverdueReview
  // -------------------------------------------------------------------------

  describe('getOverdueReview()', () => {
    it('returns empty when no suppliers', () => {
      expect(registry.getOverdueReview('2026-06-01')).toHaveLength(0);
    });

    it('includes APPROVED supplier with overdue reviewDate', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.approve(r.id, 'admin', '2025-01-01', '2025-12-31');
      const overdue = registry.getOverdueReview('2026-01-01');
      expect(overdue.find((s) => s.id === r.id)).toBeDefined();
    });

    it('excludes APPROVED supplier with future reviewDate', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.approve(r.id, 'admin', '2025-01-01', '2027-12-31');
      const overdue = registry.getOverdueReview('2026-01-01');
      expect(overdue.find((s) => s.id === r.id)).toBeUndefined();
    });

    it('includes CONDITIONAL supplier with overdue reviewDate', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.approve(r.id, 'admin', '2025-01-01', '2025-06-01');
      registry.makeConditional(r.id);
      const overdue = registry.getOverdueReview('2026-01-01');
      expect(overdue.find((s) => s.id === r.id)).toBeDefined();
    });

    it('excludes SUSPENDED supplier', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.approve(r.id, 'admin', '2025-01-01', '2025-06-01');
      registry.suspend(r.id);
      const overdue = registry.getOverdueReview('2026-01-01');
      expect(overdue.find((s) => s.id === r.id)).toBeUndefined();
    });

    it('excludes APPROVED supplier with no reviewDate', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.approve(r.id, 'admin', '2025-01-01');
      const overdue = registry.getOverdueReview('2026-01-01');
      expect(overdue.find((s) => s.id === r.id)).toBeUndefined();
    });

    it('returns multiple overdue suppliers', () => {
      const r1 = registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      const r2 = registry.register('B', 'MAJOR', 'UK', 'b@e.com', []);
      registry.approve(r1.id, 'admin', '2025-01-01', '2025-06-01');
      registry.approve(r2.id, 'admin', '2025-02-01', '2025-08-01');
      expect(registry.getOverdueReview('2026-01-01')).toHaveLength(2);
    });

    // Parameterised
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`getOverdueReview index ${i} - overdue detection`, () => {
        const r = registry.register(`Supplier ${i}`, 'CRITICAL', 'US', `s${i}@e.com`, []);
        registry.approve(r.id, 'admin', '2025-01-01', '2025-12-31');
        const overdue = registry.getOverdueReview('2026-06-01');
        expect(overdue.find((s) => s.id === r.id)).toBeDefined();
      });
    });
  });

  // -------------------------------------------------------------------------
  // getCount
  // -------------------------------------------------------------------------

  describe('getCount()', () => {
    it('returns 0 initially', () => {
      expect(registry.getCount()).toBe(0);
    });

    it('increments after registration', () => {
      registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      expect(registry.getCount()).toBe(1);
    });

    it('does not change after status transitions', () => {
      const r = registry.register('A', 'CRITICAL', 'US', 'a@e.com', []);
      registry.approve(r.id, 'admin', '2026-01-01');
      registry.suspend(r.id);
      expect(registry.getCount()).toBe(1);
    });

    // Parameterised
    Array.from({ length: 50 }, (_, i) => i + 1).forEach((n) => {
      it(`getCount() returns ${n} after ${n} registrations`, () => {
        for (let j = 0; j < n; j++) {
          registry.register(`S${j}`, 'MINOR', 'US', `s${j}@e.com`, []);
        }
        expect(registry.getCount()).toBe(n);
      });
    });
  });

  // -------------------------------------------------------------------------
  // Status transition chains
  // -------------------------------------------------------------------------

  describe('status transition chains', () => {
    it('PENDING → APPROVED → SUSPENDED', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      expect(r.status).toBe('PENDING_APPROVAL');
      registry.approve(r.id, 'admin', '2026-01-01');
      registry.suspend(r.id);
      expect(registry.get(r.id)?.status).toBe('SUSPENDED');
    });

    it('PENDING → CONDITIONAL → DISQUALIFIED', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.makeConditional(r.id);
      registry.disqualify(r.id);
      expect(registry.get(r.id)?.status).toBe('DISQUALIFIED');
    });

    it('PENDING → APPROVED → CONDITIONAL → APPROVED', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.approve(r.id, 'admin', '2026-01-01');
      registry.makeConditional(r.id);
      registry.approve(r.id, 'admin', '2026-06-01');
      expect(registry.get(r.id)?.status).toBe('APPROVED');
    });

    it('PENDING → SUSPENDED → APPROVED', () => {
      const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
      registry.suspend(r.id);
      registry.approve(r.id, 'admin', '2026-01-01');
      expect(registry.get(r.id)?.status).toBe('APPROVED');
    });

    // Parameterised: transition through all statuses
    ALL_STATUSES.forEach((finalStatus) => {
      it(`can reach final status ${finalStatus}`, () => {
        const r = registry.register('Acme', 'CRITICAL', 'US', 'a@e.com', []);
        switch (finalStatus) {
          case 'PENDING_APPROVAL':
            break;
          case 'APPROVED':
            registry.approve(r.id, 'admin', '2026-01-01');
            break;
          case 'CONDITIONAL':
            registry.makeConditional(r.id);
            break;
          case 'SUSPENDED':
            registry.suspend(r.id);
            break;
          case 'DISQUALIFIED':
            registry.disqualify(r.id);
            break;
        }
        expect(registry.get(r.id)?.status).toBe(finalStatus);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// EvaluationTracker
// ---------------------------------------------------------------------------

describe('EvaluationTracker', () => {
  let tracker: EvaluationTracker;

  beforeEach(() => {
    tracker = new EvaluationTracker();
  });

  const defaultScores: Record<EvaluationCriteria, number> = makeScores(80);

  // -------------------------------------------------------------------------
  // evaluate
  // -------------------------------------------------------------------------

  describe('evaluate()', () => {
    it('returns an evaluation with an id', () => {
      const e = tracker.evaluate('SUP-001', 'auditor@ims.com', '2026-01-15', 'APPROVED', defaultScores);
      expect(e.id).toBeDefined();
      expect(typeof e.id).toBe('string');
    });

    it('stores supplierId correctly', () => {
      const e = tracker.evaluate('SUP-001', 'auditor@ims.com', '2026-01-15', 'APPROVED', defaultScores);
      expect(e.supplierId).toBe('SUP-001');
    });

    it('stores evaluatedBy correctly', () => {
      const e = tracker.evaluate('SUP-001', 'auditor@ims.com', '2026-01-15', 'APPROVED', defaultScores);
      expect(e.evaluatedBy).toBe('auditor@ims.com');
    });

    it('stores evaluatedAt correctly', () => {
      const e = tracker.evaluate('SUP-001', 'auditor@ims.com', '2026-01-15', 'APPROVED', defaultScores);
      expect(e.evaluatedAt).toBe('2026-01-15');
    });

    it('stores result correctly', () => {
      const e = tracker.evaluate('SUP-001', 'auditor@ims.com', '2026-01-15', 'CONDITIONAL', defaultScores);
      expect(e.result).toBe('CONDITIONAL');
    });

    it('computes overallScore as average of scores', () => {
      const scores = makeScores(80);
      const e = tracker.evaluate('SUP-001', 'auditor@ims.com', '2026-01-15', 'APPROVED', scores);
      expect(e.overallScore).toBeCloseTo(80);
    });

    it('stores comments when provided', () => {
      const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-15', 'APPROVED', defaultScores, 'Good supplier');
      expect(e.comments).toBe('Good supplier');
    });

    it('leaves comments undefined when not provided', () => {
      const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-15', 'APPROVED', defaultScores);
      expect(e.comments).toBeUndefined();
    });

    it('stores nextEvaluationDate when provided', () => {
      const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-15', 'APPROVED', defaultScores, undefined, '2027-01-15');
      expect(e.nextEvaluationDate).toBe('2027-01-15');
    });

    it('leaves nextEvaluationDate undefined when not provided', () => {
      const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-15', 'APPROVED', defaultScores);
      expect(e.nextEvaluationDate).toBeUndefined();
    });

    it('each evaluation gets a unique id', () => {
      const ids = Array.from({ length: 10 }, (_, i) =>
        tracker.evaluate('SUP-001', 'a@ims.com', `2026-01-${String(i + 1).padStart(2, '0')}`, 'APPROVED', defaultScores).id,
      );
      expect(new Set(ids).size).toBe(10);
    });

    it('increments count after each evaluation', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', defaultScores);
      tracker.evaluate('SUP-002', 'a@ims.com', '2026-01-02', 'REJECTED', defaultScores);
      expect(tracker.getCount()).toBe(2);
    });

    it('stores all six criteria scores', () => {
      const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-15', 'APPROVED', defaultScores);
      ALL_CRITERIA.forEach((c) => expect(e.scores[c]).toBeDefined());
    });

    it('computes correct average for varied scores', () => {
      const scores = makeVariedScores(70);
      const vals = Object.values(scores) as number[];
      const expected = vals.reduce((a, b) => a + b, 0) / vals.length;
      const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-15', 'APPROVED', scores);
      expect(e.overallScore).toBeCloseTo(expected);
    });

    // All results
    ALL_RESULTS.forEach((result) => {
      it(`evaluate with result ${result}`, () => {
        const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-15', result, defaultScores);
        expect(e.result).toBe(result);
      });
    });

    // Parameterised: 60 evaluations
    Array.from({ length: 60 }, (_, i) => i).forEach((i) => {
      it(`evaluate index ${i} - correct supplierId and result`, () => {
        const result = ALL_RESULTS[i % ALL_RESULTS.length];
        const e = tracker.evaluate(`SUP-${i}`, `auditor${i}@ims.com`, `2026-01-15`, result, makeScores(50 + i));
        expect(e.supplierId).toBe(`SUP-${i}`);
        expect(e.result).toBe(result);
        expect(e.overallScore).toBeCloseTo(50 + i);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getBySupplier
  // -------------------------------------------------------------------------

  describe('getBySupplier()', () => {
    it('returns empty for unknown supplier', () => {
      expect(tracker.getBySupplier('SUP-999')).toHaveLength(0);
    });

    it('returns evaluations for given supplier', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', defaultScores);
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-06-01', 'APPROVED', defaultScores);
      expect(tracker.getBySupplier('SUP-001')).toHaveLength(2);
    });

    it('does not return evaluations for other suppliers', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', defaultScores);
      tracker.evaluate('SUP-002', 'a@ims.com', '2026-01-02', 'APPROVED', defaultScores);
      const result = tracker.getBySupplier('SUP-001');
      expect(result.every((e) => e.supplierId === 'SUP-001')).toBe(true);
    });

    // Parameterised
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`getBySupplier index ${i} returns correct count`, () => {
        const sid = `SUP-${i}`;
        tracker.evaluate(sid, 'a@ims.com', '2026-01-01', 'APPROVED', defaultScores);
        tracker.evaluate(sid, 'a@ims.com', '2026-06-01', 'CONDITIONAL', defaultScores);
        expect(tracker.getBySupplier(sid)).toHaveLength(2);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getLatest
  // -------------------------------------------------------------------------

  describe('getLatest()', () => {
    it('returns undefined for unknown supplier', () => {
      expect(tracker.getLatest('SUP-999')).toBeUndefined();
    });

    it('returns the single evaluation when only one exists', () => {
      const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', defaultScores);
      expect(tracker.getLatest('SUP-001')?.id).toBe(e.id);
    });

    it('returns the most recent evaluation by date', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', defaultScores);
      const latest = tracker.evaluate('SUP-001', 'a@ims.com', '2026-06-01', 'CONDITIONAL', defaultScores);
      expect(tracker.getLatest('SUP-001')?.id).toBe(latest.id);
    });

    it('returns the most recent when evaluations are out of order', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-06-01', 'APPROVED', defaultScores);
      const oldest = tracker.evaluate('SUP-001', 'a@ims.com', '2025-01-01', 'REJECTED', defaultScores);
      expect(tracker.getLatest('SUP-001')?.evaluatedAt).toBe('2026-06-01');
    });

    it('latest result matches expected result', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', defaultScores);
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-12-31', 'REJECTED', defaultScores);
      expect(tracker.getLatest('SUP-001')?.result).toBe('REJECTED');
    });

    // Parameterised
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`getLatest index ${i} returns the latest by date`, () => {
        const sid = `SUP-${i}`;
        tracker.evaluate(sid, 'a@ims.com', '2025-01-01', 'APPROVED', defaultScores);
        const latest = tracker.evaluate(sid, 'a@ims.com', '2026-12-31', 'CONDITIONAL', defaultScores);
        expect(tracker.getLatest(sid)?.id).toBe(latest.id);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getByResult
  // -------------------------------------------------------------------------

  describe('getByResult()', () => {
    it('returns empty when no evaluations', () => {
      expect(tracker.getByResult('APPROVED')).toHaveLength(0);
    });

    it('returns only matching result', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', defaultScores);
      tracker.evaluate('SUP-002', 'a@ims.com', '2026-01-02', 'REJECTED', defaultScores);
      const approved = tracker.getByResult('APPROVED');
      expect(approved).toHaveLength(1);
      expect(approved[0].result).toBe('APPROVED');
    });

    ALL_RESULTS.forEach((result) => {
      it(`getByResult('${result}') returns only that result`, () => {
        tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', result, defaultScores);
        const results = tracker.getByResult(result);
        expect(results.length).toBeGreaterThanOrEqual(1);
        expect(results.every((e) => e.result === result)).toBe(true);
      });
    });

    // Parameterised
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`getByResult index ${i} - correct filtering`, () => {
        const result = ALL_RESULTS[i % ALL_RESULTS.length];
        tracker.evaluate(`SUP-${i}`, 'a@ims.com', '2026-01-01', result, defaultScores);
        const filtered = tracker.getByResult(result);
        expect(filtered.some((e) => e.supplierId === `SUP-${i}`)).toBe(true);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getAverageScore
  // -------------------------------------------------------------------------

  describe('getAverageScore()', () => {
    it('returns 0 for unknown supplier', () => {
      expect(tracker.getAverageScore('SUP-999')).toBe(0);
    });

    it('returns the overallScore for a single evaluation', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(70));
      expect(tracker.getAverageScore('SUP-001')).toBeCloseTo(70);
    });

    it('returns average of multiple evaluations', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(60));
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-06-01', 'APPROVED', makeScores(80));
      expect(tracker.getAverageScore('SUP-001')).toBeCloseTo(70);
    });

    it('is not affected by other suppliers', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(90));
      tracker.evaluate('SUP-002', 'a@ims.com', '2026-01-02', 'APPROVED', makeScores(10));
      expect(tracker.getAverageScore('SUP-001')).toBeCloseTo(90);
    });

    // Parameterised: score values 0–99
    Array.from({ length: 50 }, (_, i) => i * 2).forEach((score) => {
      it(`getAverageScore returns ~${score} for single eval with score ${score}`, () => {
        tracker.evaluate(`SUP-S${score}`, 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(score));
        expect(tracker.getAverageScore(`SUP-S${score}`)).toBeCloseTo(score);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getTopPerformers
  // -------------------------------------------------------------------------

  describe('getTopPerformers()', () => {
    it('returns empty when no evaluations', () => {
      expect(tracker.getTopPerformers(80)).toHaveLength(0);
    });

    it('includes supplier above threshold', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(90));
      const top = tracker.getTopPerformers(80);
      expect(top).toContain('SUP-001');
    });

    it('excludes supplier below threshold', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(70));
      const top = tracker.getTopPerformers(80);
      expect(top).not.toContain('SUP-001');
    });

    it('includes supplier exactly at threshold', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(80));
      const top = tracker.getTopPerformers(80);
      expect(top).toContain('SUP-001');
    });

    it('returns multiple top performers', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(90));
      tracker.evaluate('SUP-002', 'a@ims.com', '2026-01-02', 'APPROVED', makeScores(85));
      tracker.evaluate('SUP-003', 'a@ims.com', '2026-01-03', 'APPROVED', makeScores(70));
      const top = tracker.getTopPerformers(80);
      expect(top).toContain('SUP-001');
      expect(top).toContain('SUP-002');
      expect(top).not.toContain('SUP-003');
    });

    it('average across multiple evals determines inclusion', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(60));
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-06-01', 'APPROVED', makeScores(100));
      // average = 80, exactly at threshold
      const top = tracker.getTopPerformers(80);
      expect(top).toContain('SUP-001');
    });

    it('average below threshold excludes supplier', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(60));
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-06-01', 'APPROVED', makeScores(90));
      // average = 75, below 80
      const top = tracker.getTopPerformers(80);
      expect(top).not.toContain('SUP-001');
    });

    // Parameterised: thresholds
    Array.from({ length: 30 }, (_, i) => i * 2 + 20).forEach((threshold) => {
      it(`getTopPerformers(${threshold}) returns suppliers at or above threshold`, () => {
        const sid = `SUP-T${threshold}`;
        tracker.evaluate(sid, 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(threshold));
        const top = tracker.getTopPerformers(threshold);
        expect(top).toContain(sid);
      });
    });

    // Parameterised: below threshold
    Array.from({ length: 30 }, (_, i) => i * 2 + 20).forEach((threshold) => {
      it(`getTopPerformers(${threshold}) excludes suppliers below threshold`, () => {
        const sid = `SUP-LOW${threshold}`;
        tracker.evaluate(sid, 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(threshold - 1));
        const top = tracker.getTopPerformers(threshold);
        expect(top).not.toContain(sid);
      });
    });
  });

  // -------------------------------------------------------------------------
  // getCount
  // -------------------------------------------------------------------------

  describe('getCount()', () => {
    it('returns 0 initially', () => {
      expect(tracker.getCount()).toBe(0);
    });

    it('returns 1 after one evaluation', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', defaultScores);
      expect(tracker.getCount()).toBe(1);
    });

    it('returns correct count after multiple evaluations', () => {
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', defaultScores);
      tracker.evaluate('SUP-002', 'a@ims.com', '2026-01-02', 'REJECTED', defaultScores);
      tracker.evaluate('SUP-001', 'a@ims.com', '2026-06-01', 'CONDITIONAL', defaultScores);
      expect(tracker.getCount()).toBe(3);
    });

    // Parameterised
    Array.from({ length: 50 }, (_, i) => i + 1).forEach((n) => {
      it(`getCount() returns ${n} after ${n} evaluations`, () => {
        for (let j = 0; j < n; j++) {
          tracker.evaluate(`SUP-${j}`, 'a@ims.com', '2026-01-01', 'APPROVED', defaultScores);
        }
        expect(tracker.getCount()).toBe(n);
      });
    });
  });

  // -------------------------------------------------------------------------
  // score computation edge cases
  // -------------------------------------------------------------------------

  describe('score computation', () => {
    it('overallScore with all zeros is 0', () => {
      const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(0));
      expect(e.overallScore).toBe(0);
    });

    it('overallScore with all 100s is 100', () => {
      const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(100));
      expect(e.overallScore).toBe(100);
    });

    it('overallScore is correctly averaged across 6 criteria', () => {
      const scores: Record<EvaluationCriteria, number> = {
        QUALITY: 100,
        DELIVERY: 80,
        PRICE: 60,
        SERVICE: 40,
        COMPLIANCE: 20,
        FINANCIAL_STABILITY: 0,
      };
      // average = (100+80+60+40+20+0)/6 = 300/6 = 50
      const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', scores);
      expect(e.overallScore).toBeCloseTo(50);
    });

    it('scores object is stored correctly per criterion', () => {
      const scores: Record<EvaluationCriteria, number> = {
        QUALITY: 95,
        DELIVERY: 85,
        PRICE: 75,
        SERVICE: 65,
        COMPLIANCE: 55,
        FINANCIAL_STABILITY: 45,
      };
      const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', scores);
      expect(e.scores.QUALITY).toBe(95);
      expect(e.scores.DELIVERY).toBe(85);
      expect(e.scores.PRICE).toBe(75);
      expect(e.scores.SERVICE).toBe(65);
      expect(e.scores.COMPLIANCE).toBe(55);
      expect(e.scores.FINANCIAL_STABILITY).toBe(45);
    });

    it('returned evaluation is a copy (mutation does not affect store)', () => {
      const e = tracker.evaluate('SUP-001', 'a@ims.com', '2026-01-01', 'APPROVED', defaultScores);
      (e as any).result = 'REJECTED';
      expect(tracker.getBySupplier('SUP-001')[0].result).toBe('APPROVED');
    });

    // Parameterised: varied score sets
    Array.from({ length: 40 }, (_, i) => i).forEach((i) => {
      it(`score computation index ${i} - overallScore matches average`, () => {
        const base = i * 2;
        const scores = makeVariedScores(base);
        const vals = Object.values(scores) as number[];
        const expected = vals.reduce((a, b) => a + b, 0) / vals.length;
        const e = tracker.evaluate(`SUP-${i}`, 'a@ims.com', '2026-01-01', 'APPROVED', scores);
        expect(e.overallScore).toBeCloseTo(expected);
      });
    });
  });
});

// ---------------------------------------------------------------------------
// Integration: SupplierRegistry + EvaluationTracker
// ---------------------------------------------------------------------------

describe('Integration: SupplierRegistry + EvaluationTracker', () => {
  let registry: SupplierRegistry;
  let tracker: EvaluationTracker;

  beforeEach(() => {
    registry = new SupplierRegistry();
    tracker = new EvaluationTracker();
  });

  it('register a supplier then evaluate it', () => {
    const s = registry.register('Acme', 'CRITICAL', 'US', 'acme@e.com', ['Widget']);
    registry.approve(s.id, 'admin', '2026-01-01');
    const e = tracker.evaluate(s.id, 'auditor@ims.com', '2026-02-01', 'APPROVED', makeScores(85));
    expect(e.supplierId).toBe(s.id);
    expect(e.overallScore).toBeCloseTo(85);
  });

  it('top performers are evaluated approved suppliers', () => {
    const s1 = registry.register('Alpha', 'CRITICAL', 'US', 'alpha@e.com', []);
    const s2 = registry.register('Beta', 'MAJOR', 'UK', 'beta@e.com', []);
    registry.approve(s1.id, 'admin', '2026-01-01');
    registry.approve(s2.id, 'admin', '2026-01-01');
    tracker.evaluate(s1.id, 'a@ims.com', '2026-02-01', 'APPROVED', makeScores(90));
    tracker.evaluate(s2.id, 'a@ims.com', '2026-02-02', 'APPROVED', makeScores(75));
    const top = tracker.getTopPerformers(80);
    expect(top).toContain(s1.id);
    expect(top).not.toContain(s2.id);
  });

  it('latest evaluation reflects current supplier standing', () => {
    const s = registry.register('Gamma', 'MINOR', 'DE', 'g@e.com', []);
    registry.approve(s.id, 'admin', '2026-01-01');
    tracker.evaluate(s.id, 'a@ims.com', '2026-01-15', 'APPROVED', makeScores(80));
    registry.makeConditional(s.id);
    tracker.evaluate(s.id, 'a@ims.com', '2026-06-01', 'CONDITIONAL', makeScores(60));
    const latest = tracker.getLatest(s.id);
    expect(latest?.result).toBe('CONDITIONAL');
    expect(registry.get(s.id)?.status).toBe('CONDITIONAL');
  });

  it('average score tracks across multiple re-evaluations', () => {
    const s = registry.register('Delta', 'PREFERRED', 'AU', 'd@e.com', []);
    registry.approve(s.id, 'admin', '2026-01-01');
    tracker.evaluate(s.id, 'a@ims.com', '2026-01-01', 'APPROVED', makeScores(70));
    tracker.evaluate(s.id, 'a@ims.com', '2026-04-01', 'APPROVED', makeScores(80));
    tracker.evaluate(s.id, 'a@ims.com', '2026-07-01', 'APPROVED', makeScores(90));
    // average = (70+80+90)/3 = 80
    expect(tracker.getAverageScore(s.id)).toBeCloseTo(80);
  });

  it('suspended supplier still has evaluations', () => {
    const s = registry.register('Epsilon', 'CRITICAL', 'US', 'e@e.com', []);
    registry.approve(s.id, 'admin', '2026-01-01');
    tracker.evaluate(s.id, 'a@ims.com', '2026-01-15', 'APPROVED', makeScores(75));
    registry.suspend(s.id);
    expect(tracker.getBySupplier(s.id)).toHaveLength(1);
    expect(registry.get(s.id)?.status).toBe('SUSPENDED');
  });

  it('overdue review supplier can still be evaluated', () => {
    const s = registry.register('Zeta', 'MAJOR', 'FR', 'z@e.com', []);
    registry.approve(s.id, 'admin', '2025-01-01', '2025-12-31');
    const overdue = registry.getOverdueReview('2026-06-01');
    expect(overdue.find((r) => r.id === s.id)).toBeDefined();
    // Still can evaluate
    const e = tracker.evaluate(s.id, 'a@ims.com', '2026-06-15', 'APPROVED', makeScores(88));
    expect(e.supplierId).toBe(s.id);
  });

  // Parameterised: 50 integrated scenarios
  Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
    it(`integration scenario ${i}: register, approve, evaluate, check top performer`, () => {
      const s = registry.register(`Supplier ${i}`, ALL_CATEGORIES[i % 4], 'US', `s${i}@e.com`, [`Prod${i}`]);
      registry.approve(s.id, `admin${i}@ims.com`, '2026-01-01');
      const score = 70 + (i % 30);
      tracker.evaluate(s.id, `auditor${i}@ims.com`, '2026-02-01', 'APPROVED', makeScores(score));
      const avg = tracker.getAverageScore(s.id);
      expect(avg).toBeCloseTo(score);
      const isTop = tracker.getTopPerformers(80).includes(s.id);
      expect(isTop).toBe(score >= 80);
    });
  });
});
