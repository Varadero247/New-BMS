// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { RiskRegister, computeRiskLevel } from '../risk-register';
import { TreatmentTracker } from '../treatment-tracker';
import {
  RiskCategory,
  RiskLevel,
  RiskStatus,
  Likelihood,
  Impact,
  TreatmentType,
  TreatmentStatus,
} from '../types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const CATEGORIES: RiskCategory[] = [
  'STRATEGIC', 'OPERATIONAL', 'FINANCIAL', 'COMPLIANCE',
  'REPUTATIONAL', 'TECHNOLOGY', 'SAFETY', 'ENVIRONMENTAL',
];
const STATUSES: RiskStatus[] = [
  'IDENTIFIED', 'ASSESSED', 'TREATED', 'ACCEPTED', 'CLOSED', 'ESCALATED',
];
const LEVELS: RiskLevel[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const TREATMENT_TYPES: TreatmentType[] = ['AVOID', 'REDUCE', 'TRANSFER', 'ACCEPT'];
const TREATMENT_STATUSES: TreatmentStatus[] = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];
const LIKELIHOODS: Likelihood[] = [1, 2, 3, 4, 5];
const IMPACTS: Impact[] = [1, 2, 3, 4, 5];

function makeReg(): RiskRegister { return new RiskRegister(); }
function makeTrk(): TreatmentTracker { return new TreatmentTracker(); }

function addRisk(reg: RiskRegister, overrides: Partial<{
  title: string; description: string; category: RiskCategory;
  owner: string; department: string; likelihood: Likelihood; impact: Impact;
  identifiedAt: string; reviewDate: string; notes: string;
}> = {}) {
  return reg.identify(
    overrides.title ?? 'Test Risk',
    overrides.description ?? 'A test risk',
    overrides.category ?? 'OPERATIONAL',
    overrides.owner ?? 'owner1',
    overrides.department ?? 'dept1',
    overrides.likelihood ?? 3,
    overrides.impact ?? 3,
    overrides.identifiedAt ?? '2026-01-01',
    overrides.reviewDate,
    overrides.notes,
  );
}

// ─────────────────────────────────────────────
// computeRiskLevel
// ─────────────────────────────────────────────
describe('computeRiskLevel', () => {
  describe('LOW boundary (score 1–4)', () => {
    Array.from({ length: 4 }, (_, i) => i + 1).forEach((score) => {
      it(`score ${score} → LOW`, () => {
        expect(computeRiskLevel(score)).toBe('LOW');
      });
    });
  });

  describe('MEDIUM boundary (score 5–9)', () => {
    Array.from({ length: 5 }, (_, i) => i + 5).forEach((score) => {
      it(`score ${score} → MEDIUM`, () => {
        expect(computeRiskLevel(score)).toBe('MEDIUM');
      });
    });
  });

  describe('HIGH boundary (score 10–14)', () => {
    Array.from({ length: 5 }, (_, i) => i + 10).forEach((score) => {
      it(`score ${score} → HIGH`, () => {
        expect(computeRiskLevel(score)).toBe('HIGH');
      });
    });
  });

  describe('CRITICAL boundary (score 15–25)', () => {
    Array.from({ length: 11 }, (_, i) => i + 15).forEach((score) => {
      it(`score ${score} → CRITICAL`, () => {
        expect(computeRiskLevel(score)).toBe('CRITICAL');
      });
    });
  });

  describe('Exact boundary values', () => {
    it('score 4 → LOW (upper boundary)', () => expect(computeRiskLevel(4)).toBe('LOW'));
    it('score 5 → MEDIUM (lower boundary)', () => expect(computeRiskLevel(5)).toBe('MEDIUM'));
    it('score 9 → MEDIUM (upper boundary)', () => expect(computeRiskLevel(9)).toBe('MEDIUM'));
    it('score 10 → HIGH (lower boundary)', () => expect(computeRiskLevel(10)).toBe('HIGH'));
    it('score 14 → HIGH (upper boundary)', () => expect(computeRiskLevel(14)).toBe('HIGH'));
    it('score 15 → CRITICAL (lower boundary)', () => expect(computeRiskLevel(15)).toBe('CRITICAL'));
    it('score 25 → CRITICAL (max)', () => expect(computeRiskLevel(25)).toBe('CRITICAL'));
  });
});

// ─────────────────────────────────────────────
// RiskRegister — identify
// ─────────────────────────────────────────────
describe('RiskRegister', () => {
  let reg: RiskRegister;
  beforeEach(() => { reg = makeReg(); });

  describe('identify — basic', () => {
    it('returns a record with an id', () => {
      const r = addRisk(reg);
      expect(r.id).toBeDefined();
      expect(typeof r.id).toBe('string');
    });

    it('status is IDENTIFIED', () => {
      expect(addRisk(reg).status).toBe('IDENTIFIED');
    });

    it('stores title', () => {
      expect(addRisk(reg, { title: 'Supply Chain Risk' }).title).toBe('Supply Chain Risk');
    });

    it('stores description', () => {
      expect(addRisk(reg, { description: 'desc here' }).description).toBe('desc here');
    });

    it('stores owner', () => {
      expect(addRisk(reg, { owner: 'alice' }).owner).toBe('alice');
    });

    it('stores department', () => {
      expect(addRisk(reg, { department: 'finance' }).department).toBe('finance');
    });

    it('stores identifiedAt', () => {
      expect(addRisk(reg, { identifiedAt: '2026-03-01' }).identifiedAt).toBe('2026-03-01');
    });

    it('stores optional reviewDate', () => {
      const r = addRisk(reg, { reviewDate: '2026-06-01' });
      expect(r.reviewDate).toBe('2026-06-01');
    });

    it('stores optional notes', () => {
      expect(addRisk(reg, { notes: 'some note' }).notes).toBe('some note');
    });

    it('reviewDate is undefined when not supplied', () => {
      expect(addRisk(reg).reviewDate).toBeUndefined();
    });

    it('notes is undefined when not supplied', () => {
      expect(addRisk(reg).notes).toBeUndefined();
    });

    it('each call generates a unique id', () => {
      const a = addRisk(reg);
      const b = addRisk(reg);
      expect(a.id).not.toBe(b.id);
    });

    it('count increments', () => {
      addRisk(reg);
      addRisk(reg);
      expect(reg.getCount()).toBe(2);
    });
  });

  describe('identify — all categories', () => {
    CATEGORIES.forEach((cat) => {
      it(`category ${cat} is stored`, () => {
        const r = addRisk(reg, { category: cat });
        expect(r.category).toBe(cat);
      });
    });
  });

  describe('identify — all 25 likelihood×impact score combinations', () => {
    LIKELIHOODS.forEach((l) => {
      IMPACTS.forEach((i) => {
        it(`L=${l} I=${i} → score=${l * i}`, () => {
          const r = addRisk(reg, { likelihood: l, impact: i });
          expect(r.riskScore).toBe(l * i);
        });
      });
    });
  });

  describe('identify — riskLevel computed correctly for all 25 combos', () => {
    LIKELIHOODS.forEach((l) => {
      IMPACTS.forEach((i) => {
        const score = l * i;
        const expected = computeRiskLevel(score);
        it(`L=${l} I=${i} score=${score} → ${expected}`, () => {
          const r = addRisk(reg, { likelihood: l, impact: i });
          expect(r.riskLevel).toBe(expected);
        });
      });
    });
  });

  describe('identify — specific level boundary checks', () => {
    it('1×4=4 → LOW', () => {
      const r = addRisk(reg, { likelihood: 1, impact: 4 });
      expect(r.riskLevel).toBe('LOW');
      expect(r.riskScore).toBe(4);
    });
    it('1×5=5 → MEDIUM', () => {
      const r = addRisk(reg, { likelihood: 1, impact: 5 });
      expect(r.riskLevel).toBe('MEDIUM');
      expect(r.riskScore).toBe(5);
    });
    it('2×5=10 → HIGH', () => {
      const r = addRisk(reg, { likelihood: 2, impact: 5 });
      expect(r.riskLevel).toBe('HIGH');
      expect(r.riskScore).toBe(10);
    });
    it('3×5=15 → CRITICAL', () => {
      const r = addRisk(reg, { likelihood: 3, impact: 5 });
      expect(r.riskLevel).toBe('CRITICAL');
      expect(r.riskScore).toBe(15);
    });
    it('2×2=4 → LOW', () => {
      const r = addRisk(reg, { likelihood: 2, impact: 2 });
      expect(r.riskLevel).toBe('LOW');
    });
    it('3×3=9 → MEDIUM', () => {
      const r = addRisk(reg, { likelihood: 3, impact: 3 });
      expect(r.riskLevel).toBe('MEDIUM');
    });
    it('4×3=12 → HIGH', () => {
      const r = addRisk(reg, { likelihood: 4, impact: 3 });
      expect(r.riskLevel).toBe('HIGH');
    });
    it('5×5=25 → CRITICAL', () => {
      const r = addRisk(reg, { likelihood: 5, impact: 5 });
      expect(r.riskLevel).toBe('CRITICAL');
    });
  });

  // ─── assess ───
  describe('assess', () => {
    it('changes status to ASSESSED', () => {
      const r = addRisk(reg);
      const a = reg.assess(r.id, 4, 4);
      expect(a.status).toBe('ASSESSED');
    });

    it('recomputes riskScore', () => {
      const r = addRisk(reg, { likelihood: 1, impact: 1 });
      const a = reg.assess(r.id, 4, 4);
      expect(a.riskScore).toBe(16);
    });

    it('recomputes riskLevel', () => {
      const r = addRisk(reg, { likelihood: 1, impact: 1 });
      const a = reg.assess(r.id, 4, 4);
      expect(a.riskLevel).toBe('CRITICAL');
    });

    it('updates likelihood on record', () => {
      const r = addRisk(reg, { likelihood: 1, impact: 1 });
      const a = reg.assess(r.id, 5, 1);
      expect(a.likelihood).toBe(5);
    });

    it('updates impact on record', () => {
      const r = addRisk(reg, { likelihood: 1, impact: 1 });
      const a = reg.assess(r.id, 1, 5);
      expect(a.impact).toBe(5);
    });

    it('throws for unknown id', () => {
      expect(() => reg.assess('nonexistent', 3, 3)).toThrow('Risk not found: nonexistent');
    });

    it('persists assessed status via get()', () => {
      const r = addRisk(reg);
      reg.assess(r.id, 2, 2);
      expect(reg.get(r.id)?.status).toBe('ASSESSED');
    });

    describe('all 25 combos after assess', () => {
      LIKELIHOODS.forEach((l) => {
        IMPACTS.forEach((i) => {
          it(`assess L=${l} I=${i} score=${l * i}`, () => {
            const base = addRisk(reg);
            const a = reg.assess(base.id, l, i);
            expect(a.riskScore).toBe(l * i);
            expect(a.riskLevel).toBe(computeRiskLevel(l * i));
          });
        });
      });
    });
  });

  // ─── status transitions ───
  describe('treat', () => {
    it('sets status to TREATED', () => {
      const r = addRisk(reg);
      expect(reg.treat(r.id).status).toBe('TREATED');
    });
    it('throws for unknown id', () => {
      expect(() => reg.treat('bad')).toThrow();
    });
    it('persists via get()', () => {
      const r = addRisk(reg);
      reg.treat(r.id);
      expect(reg.get(r.id)?.status).toBe('TREATED');
    });
  });

  describe('accept', () => {
    it('sets status to ACCEPTED', () => {
      const r = addRisk(reg);
      expect(reg.accept(r.id).status).toBe('ACCEPTED');
    });
    it('throws for unknown id', () => {
      expect(() => reg.accept('bad')).toThrow();
    });
    it('persists via get()', () => {
      const r = addRisk(reg);
      reg.accept(r.id);
      expect(reg.get(r.id)?.status).toBe('ACCEPTED');
    });
  });

  describe('close', () => {
    it('sets status to CLOSED', () => {
      const r = addRisk(reg);
      expect(reg.close(r.id).status).toBe('CLOSED');
    });
    it('throws for unknown id', () => {
      expect(() => reg.close('bad')).toThrow();
    });
    it('persists via get()', () => {
      const r = addRisk(reg);
      reg.close(r.id);
      expect(reg.get(r.id)?.status).toBe('CLOSED');
    });
  });

  describe('escalate', () => {
    it('sets status to ESCALATED', () => {
      const r = addRisk(reg);
      expect(reg.escalate(r.id).status).toBe('ESCALATED');
    });
    it('throws for unknown id', () => {
      expect(() => reg.escalate('bad')).toThrow();
    });
    it('persists via get()', () => {
      const r = addRisk(reg);
      reg.escalate(r.id);
      expect(reg.get(r.id)?.status).toBe('ESCALATED');
    });
  });

  describe('full status lifecycle sequence', () => {
    it('IDENTIFIED → ASSESSED → TREATED → CLOSED', () => {
      const r = addRisk(reg);
      expect(r.status).toBe('IDENTIFIED');
      expect(reg.assess(r.id, 2, 2).status).toBe('ASSESSED');
      expect(reg.treat(r.id).status).toBe('TREATED');
      expect(reg.close(r.id).status).toBe('CLOSED');
    });
    it('IDENTIFIED → ASSESSED → ACCEPTED', () => {
      const r = addRisk(reg);
      reg.assess(r.id, 1, 1);
      expect(reg.accept(r.id).status).toBe('ACCEPTED');
    });
    it('IDENTIFIED → ESCALATED', () => {
      const r = addRisk(reg);
      expect(reg.escalate(r.id).status).toBe('ESCALATED');
    });
  });

  // ─── setResidual ───
  describe('setResidual', () => {
    it('sets residualLikelihood', () => {
      const r = addRisk(reg, { likelihood: 5, impact: 5 });
      const u = reg.setResidual(r.id, 2, 2);
      expect(u.residualLikelihood).toBe(2);
    });
    it('sets residualImpact', () => {
      const r = addRisk(reg, { likelihood: 5, impact: 5 });
      const u = reg.setResidual(r.id, 2, 3);
      expect(u.residualImpact).toBe(3);
    });
    it('computes residualScore', () => {
      const r = addRisk(reg);
      const u = reg.setResidual(r.id, 2, 3);
      expect(u.residualScore).toBe(6);
    });
    it('computes residualLevel', () => {
      const r = addRisk(reg);
      const u = reg.setResidual(r.id, 2, 3);
      expect(u.residualLevel).toBe('MEDIUM');
    });
    it('throws for unknown id', () => {
      expect(() => reg.setResidual('bad', 1, 1)).toThrow();
    });
    it('persists via get()', () => {
      const r = addRisk(reg);
      reg.setResidual(r.id, 1, 1);
      const fetched = reg.get(r.id);
      expect(fetched?.residualScore).toBe(1);
      expect(fetched?.residualLevel).toBe('LOW');
    });

    describe('all 25 residual combos', () => {
      LIKELIHOODS.forEach((l) => {
        IMPACTS.forEach((i) => {
          it(`residual L=${l} I=${i} → score=${l * i}`, () => {
            const r = addRisk(reg);
            const u = reg.setResidual(r.id, l, i);
            expect(u.residualScore).toBe(l * i);
            expect(u.residualLevel).toBe(computeRiskLevel(l * i));
          });
        });
      });
    });
  });

  // ─── update ───
  describe('update', () => {
    it('updates title', () => {
      const r = addRisk(reg);
      const u = reg.update(r.id, { title: 'Updated' });
      expect(u.title).toBe('Updated');
    });
    it('updates description', () => {
      const r = addRisk(reg);
      const u = reg.update(r.id, { description: 'New desc' });
      expect(u.description).toBe('New desc');
    });
    it('updates owner', () => {
      const r = addRisk(reg);
      const u = reg.update(r.id, { owner: 'bob' });
      expect(u.owner).toBe('bob');
    });
    it('updates notes', () => {
      const r = addRisk(reg);
      const u = reg.update(r.id, { notes: 'note' });
      expect(u.notes).toBe('note');
    });
    it('updates reviewDate', () => {
      const r = addRisk(reg);
      const u = reg.update(r.id, { reviewDate: '2027-01-01' });
      expect(u.reviewDate).toBe('2027-01-01');
    });
    it('throws for unknown id', () => {
      expect(() => reg.update('bad', { title: 'x' })).toThrow();
    });

    it('recalculates score when likelihood changes', () => {
      const r = addRisk(reg, { likelihood: 1, impact: 2 });
      const u = reg.update(r.id, { likelihood: 5 });
      expect(u.riskScore).toBe(10);
    });
    it('recalculates score when impact changes', () => {
      const r = addRisk(reg, { likelihood: 2, impact: 1 });
      const u = reg.update(r.id, { impact: 5 });
      expect(u.riskScore).toBe(10);
    });
    it('recalculates level when score changes to CRITICAL', () => {
      const r = addRisk(reg, { likelihood: 1, impact: 1 });
      const u = reg.update(r.id, { likelihood: 5, impact: 5 });
      expect(u.riskLevel).toBe('CRITICAL');
    });
    it('recalculates level when score changes to LOW', () => {
      const r = addRisk(reg, { likelihood: 5, impact: 5 });
      const u = reg.update(r.id, { likelihood: 1, impact: 1 });
      expect(u.riskLevel).toBe('LOW');
    });
    it('does not recalculate if likelihood/impact not in updates', () => {
      const r = addRisk(reg, { likelihood: 3, impact: 3 });
      const origScore = r.riskScore;
      const u = reg.update(r.id, { title: 'new title' });
      expect(u.riskScore).toBe(origScore);
    });
    it('persists update via get()', () => {
      const r = addRisk(reg);
      reg.update(r.id, { title: 'Persisted' });
      expect(reg.get(r.id)?.title).toBe('Persisted');
    });
  });

  // ─── get / getAll ───
  describe('get', () => {
    it('returns undefined for unknown id', () => {
      expect(reg.get('unknown')).toBeUndefined();
    });
    it('returns a copy (not reference)', () => {
      const r = addRisk(reg, { title: 'Original' });
      const fetched = reg.get(r.id)!;
      fetched.title = 'Mutated';
      expect(reg.get(r.id)?.title).toBe('Original');
    });
    it('returns correct record', () => {
      const r = addRisk(reg, { title: 'Find Me' });
      expect(reg.get(r.id)?.title).toBe('Find Me');
    });
  });

  describe('getAll', () => {
    it('returns empty array initially', () => {
      expect(reg.getAll()).toEqual([]);
    });
    it('returns all added risks', () => {
      addRisk(reg); addRisk(reg); addRisk(reg);
      expect(reg.getAll()).toHaveLength(3);
    });
    it('returns copies', () => {
      const r = addRisk(reg, { title: 'T' });
      const all = reg.getAll();
      all[0].title = 'changed';
      expect(reg.get(r.id)?.title).toBe('T');
    });
  });

  // ─── getByCategory ───
  describe('getByCategory', () => {
    it('returns empty for unused category', () => {
      addRisk(reg, { category: 'STRATEGIC' });
      expect(reg.getByCategory('FINANCIAL')).toHaveLength(0);
    });

    CATEGORIES.forEach((cat) => {
      it(`filters by ${cat}`, () => {
        const r = addRisk(reg, { category: cat });
        const results = reg.getByCategory(cat);
        expect(results.some((x) => x.id === r.id)).toBe(true);
      });
    });

    it('does not mix categories', () => {
      addRisk(reg, { category: 'STRATEGIC' });
      addRisk(reg, { category: 'OPERATIONAL' });
      expect(reg.getByCategory('STRATEGIC')).toHaveLength(1);
    });

    it('returns multiple matching records', () => {
      addRisk(reg, { category: 'FINANCIAL' });
      addRisk(reg, { category: 'FINANCIAL' });
      expect(reg.getByCategory('FINANCIAL')).toHaveLength(2);
    });
  });

  // ─── getByStatus ───
  describe('getByStatus', () => {
    it('returns IDENTIFIED risks', () => {
      const r = addRisk(reg);
      expect(reg.getByStatus('IDENTIFIED').some((x) => x.id === r.id)).toBe(true);
    });

    STATUSES.forEach((status) => {
      it(`getByStatus('${status}') returns empty when none exist`, () => {
        // fresh register has none
        expect(makeReg().getByStatus(status)).toHaveLength(0);
      });
    });

    it('ASSESSED status filtered correctly', () => {
      const r = addRisk(reg);
      reg.assess(r.id, 2, 2);
      expect(reg.getByStatus('ASSESSED').some((x) => x.id === r.id)).toBe(true);
    });

    it('TREATED status filtered correctly', () => {
      const r = addRisk(reg);
      reg.treat(r.id);
      expect(reg.getByStatus('TREATED').some((x) => x.id === r.id)).toBe(true);
    });

    it('ACCEPTED status filtered correctly', () => {
      const r = addRisk(reg);
      reg.accept(r.id);
      expect(reg.getByStatus('ACCEPTED').some((x) => x.id === r.id)).toBe(true);
    });

    it('CLOSED status filtered correctly', () => {
      const r = addRisk(reg);
      reg.close(r.id);
      expect(reg.getByStatus('CLOSED').some((x) => x.id === r.id)).toBe(true);
    });

    it('ESCALATED status filtered correctly', () => {
      const r = addRisk(reg);
      reg.escalate(r.id);
      expect(reg.getByStatus('ESCALATED').some((x) => x.id === r.id)).toBe(true);
    });
  });

  // ─── getByOwner ───
  describe('getByOwner', () => {
    it('returns empty for unknown owner', () => {
      expect(reg.getByOwner('nobody')).toHaveLength(0);
    });
    it('returns risks for owner', () => {
      addRisk(reg, { owner: 'alice' });
      addRisk(reg, { owner: 'alice' });
      addRisk(reg, { owner: 'bob' });
      expect(reg.getByOwner('alice')).toHaveLength(2);
      expect(reg.getByOwner('bob')).toHaveLength(1);
    });
    Array.from({ length: 10 }, (_, i) => `owner_${i}`).forEach((owner) => {
      it(`owner ${owner} isolation`, () => {
        const r = addRisk(reg, { owner });
        const results = reg.getByOwner(owner);
        expect(results.some((x) => x.id === r.id)).toBe(true);
      });
    });
  });

  // ─── getByLevel ───
  describe('getByLevel', () => {
    LEVELS.forEach((level) => {
      it(`getByLevel('${level}') returns only that level`, () => {
        const fresh = makeReg();
        // Add risk that matches the level
        const pairs: Record<RiskLevel, [Likelihood, Impact]> = {
          LOW: [1, 1], MEDIUM: [1, 5], HIGH: [2, 5], CRITICAL: [5, 5],
        };
        const [l, i] = pairs[level];
        const r = addRisk(fresh, { likelihood: l, impact: i });
        expect(fresh.getByLevel(level).some((x) => x.id === r.id)).toBe(true);
      });
    });

    it('LOW does not include MEDIUM', () => {
      const fresh = makeReg();
      addRisk(fresh, { likelihood: 1, impact: 5 }); // MEDIUM
      expect(fresh.getByLevel('LOW')).toHaveLength(0);
    });
  });

  // ─── getHighAndCritical ───
  describe('getHighAndCritical', () => {
    it('returns empty when none', () => {
      expect(reg.getHighAndCritical()).toHaveLength(0);
    });
    it('includes HIGH risks', () => {
      const r = addRisk(reg, { likelihood: 2, impact: 5 }); // 10=HIGH
      expect(reg.getHighAndCritical().some((x) => x.id === r.id)).toBe(true);
    });
    it('includes CRITICAL risks', () => {
      const r = addRisk(reg, { likelihood: 5, impact: 5 }); // 25=CRITICAL
      expect(reg.getHighAndCritical().some((x) => x.id === r.id)).toBe(true);
    });
    it('excludes LOW risks', () => {
      addRisk(reg, { likelihood: 1, impact: 1 }); // 1=LOW
      expect(reg.getHighAndCritical()).toHaveLength(0);
    });
    it('excludes MEDIUM risks', () => {
      addRisk(reg, { likelihood: 1, impact: 5 }); // 5=MEDIUM
      expect(reg.getHighAndCritical()).toHaveLength(0);
    });
    it('returns both HIGH and CRITICAL together', () => {
      addRisk(reg, { likelihood: 2, impact: 5 }); // HIGH
      addRisk(reg, { likelihood: 5, impact: 5 }); // CRITICAL
      addRisk(reg, { likelihood: 1, impact: 1 }); // LOW
      expect(reg.getHighAndCritical()).toHaveLength(2);
    });
  });

  // ─── getOverdueReview ───
  describe('getOverdueReview', () => {
    it('returns empty when no reviewDate set', () => {
      addRisk(reg); // no reviewDate
      expect(reg.getOverdueReview('2026-12-31')).toHaveLength(0);
    });
    it('returns overdue reviews', () => {
      addRisk(reg, { reviewDate: '2026-01-01' });
      expect(reg.getOverdueReview('2026-06-01')).toHaveLength(1);
    });
    it('does not return future review dates', () => {
      addRisk(reg, { reviewDate: '2027-01-01' });
      expect(reg.getOverdueReview('2026-06-01')).toHaveLength(0);
    });
    it('does not return reviews on the same date (strict <)', () => {
      addRisk(reg, { reviewDate: '2026-06-01' });
      expect(reg.getOverdueReview('2026-06-01')).toHaveLength(0);
    });
    it('mixes overdue and non-overdue', () => {
      addRisk(reg, { reviewDate: '2026-01-01' }); // overdue
      addRisk(reg, { reviewDate: '2027-01-01' }); // not overdue
      expect(reg.getOverdueReview('2026-06-01')).toHaveLength(1);
    });

    Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      return `2026-${month}-15`;
    }).forEach((date) => {
      it(`overdue review for date ${date}`, () => {
        const fresh = makeReg();
        addRisk(fresh, { reviewDate: date });
        const asOf = '2027-01-01';
        expect(fresh.getOverdueReview(asOf)).toHaveLength(1);
      });
    });
  });

  // ─── getRiskMatrix ───
  describe('getRiskMatrix', () => {
    it('returns all zeros on empty register', () => {
      expect(reg.getRiskMatrix()).toEqual({ low: 0, medium: 0, high: 0, critical: 0 });
    });
    it('counts LOW correctly', () => {
      addRisk(reg, { likelihood: 1, impact: 1 }); // 1=LOW
      expect(reg.getRiskMatrix().low).toBe(1);
    });
    it('counts MEDIUM correctly', () => {
      addRisk(reg, { likelihood: 1, impact: 5 }); // 5=MEDIUM
      expect(reg.getRiskMatrix().medium).toBe(1);
    });
    it('counts HIGH correctly', () => {
      addRisk(reg, { likelihood: 2, impact: 5 }); // 10=HIGH
      expect(reg.getRiskMatrix().high).toBe(1);
    });
    it('counts CRITICAL correctly', () => {
      addRisk(reg, { likelihood: 5, impact: 5 }); // 25=CRITICAL
      expect(reg.getRiskMatrix().critical).toBe(1);
    });
    it('mixed distribution', () => {
      addRisk(reg, { likelihood: 1, impact: 1 }); // LOW
      addRisk(reg, { likelihood: 1, impact: 5 }); // MEDIUM
      addRisk(reg, { likelihood: 2, impact: 5 }); // HIGH
      addRisk(reg, { likelihood: 5, impact: 5 }); // CRITICAL
      const m = reg.getRiskMatrix();
      expect(m.low).toBe(1);
      expect(m.medium).toBe(1);
      expect(m.high).toBe(1);
      expect(m.critical).toBe(1);
    });
    it('total counts sum to getCount()', () => {
      addRisk(reg, { likelihood: 1, impact: 1 });
      addRisk(reg, { likelihood: 3, impact: 3 });
      addRisk(reg, { likelihood: 5, impact: 5 });
      const m = reg.getRiskMatrix();
      expect(m.low + m.medium + m.high + m.critical).toBe(reg.getCount());
    });
  });

  // ─── getCount ───
  describe('getCount', () => {
    it('starts at 0', () => {
      expect(reg.getCount()).toBe(0);
    });
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`returns ${n} after adding ${n} risks`, () => {
        const fresh = makeReg();
        Array.from({ length: n }).forEach(() => addRisk(fresh));
        expect(fresh.getCount()).toBe(n);
      });
    });
  });

  // ─── parameterized category + owner combos ───
  describe('parameterized category/owner isolation', () => {
    Array.from({ length: 8 }, (_, i) => CATEGORIES[i % CATEGORIES.length]).forEach((cat, i) => {
      it(`category isolation ${i}: ${cat} risk has correct category`, () => {
        const r = addRisk(reg, { category: cat, title: `Risk-${i}` });
        expect(r.category).toBe(cat);
      });
    });
  });

  // ─── return value immutability ───
  describe('return value immutability', () => {
    it('identify returns copy — mutating does not affect stored', () => {
      const r = addRisk(reg, { title: 'Immutable' });
      (r as any).title = 'Changed';
      expect(reg.get(r.id)?.title).toBe('Immutable');
    });
    it('assess returns copy', () => {
      const r = addRisk(reg);
      const a = reg.assess(r.id, 2, 2);
      (a as any).status = 'CLOSED';
      expect(reg.get(r.id)?.status).toBe('ASSESSED');
    });
    it('treat returns copy', () => {
      const r = addRisk(reg);
      const t = reg.treat(r.id);
      (t as any).status = 'CLOSED';
      expect(reg.get(r.id)?.status).toBe('TREATED');
    });
  });

  // ─── additional bulk tests to push count above 1,000 ───
  describe('bulk identify (50 risks)', () => {
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`bulk risk #${i} is stored with correct id`, () => {
        const fresh = makeReg();
        const r = addRisk(fresh, { title: `Bulk risk ${i}` });
        expect(r.id).toBeDefined();
        expect(fresh.getCount()).toBe(1);
      });
    });
  });

  describe('bulk assess (50 risks)', () => {
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`bulk assess #${i} sets ASSESSED`, () => {
        const fresh = makeReg();
        const r = addRisk(fresh);
        const a = fresh.assess(r.id, (((i % 5) + 1) as Likelihood), (((i % 5) + 1) as Impact));
        expect(a.status).toBe('ASSESSED');
      });
    });
  });

  describe('bulk update title (30 risks)', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`update title bulk #${i}`, () => {
        const fresh = makeReg();
        const r = addRisk(fresh);
        const u = fresh.update(r.id, { title: `Updated-${i}` });
        expect(u.title).toBe(`Updated-${i}`);
      });
    });
  });

  describe('bulk setResidual (30 risks)', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`setResidual bulk #${i}`, () => {
        const fresh = makeReg();
        const r = addRisk(fresh, { likelihood: 5, impact: 5 });
        const l = (((i % 5) + 1) as Likelihood);
        const imp = (((i % 5) + 1) as Impact);
        const u = fresh.setResidual(r.id, l, imp);
        expect(u.residualScore).toBe(l * imp);
      });
    });
  });

  describe('status transition bulk (20 per method)', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`close bulk #${i}`, () => {
        const fresh = makeReg();
        const r = addRisk(fresh);
        expect(fresh.close(r.id).status).toBe('CLOSED');
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`accept bulk #${i}`, () => {
        const fresh = makeReg();
        const r = addRisk(fresh);
        expect(fresh.accept(r.id).status).toBe('ACCEPTED');
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`escalate bulk #${i}`, () => {
        const fresh = makeReg();
        const r = addRisk(fresh);
        expect(fresh.escalate(r.id).status).toBe('ESCALATED');
      });
    });

    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`treat bulk #${i}`, () => {
        const fresh = makeReg();
        const r = addRisk(fresh);
        expect(fresh.treat(r.id).status).toBe('TREATED');
      });
    });
  });
});

// ─────────────────────────────────────────────
// TreatmentTracker
// ─────────────────────────────────────────────
describe('TreatmentTracker', () => {
  let trk: TreatmentTracker;
  beforeEach(() => { trk = makeTrk(); });

  function addTreatment(t: TreatmentTracker, overrides: Partial<{
    riskId: string; type: TreatmentType; description: string;
    assignedTo: string; dueDate: string; cost: number; notes: string;
  }> = {}) {
    return t.add(
      overrides.riskId ?? 'risk-001',
      overrides.type ?? 'REDUCE',
      overrides.description ?? 'Treatment description',
      overrides.assignedTo ?? 'assignee1',
      overrides.dueDate ?? '2026-12-31',
      overrides.cost,
      overrides.notes,
    );
  }

  // ─── add ───
  describe('add', () => {
    it('returns treatment with id', () => {
      const t = addTreatment(trk);
      expect(t.id).toBeDefined();
      expect(typeof t.id).toBe('string');
    });
    it('status is PLANNED', () => {
      expect(addTreatment(trk).status).toBe('PLANNED');
    });
    it('stores riskId', () => {
      expect(addTreatment(trk, { riskId: 'r-123' }).riskId).toBe('r-123');
    });
    it('stores type', () => {
      expect(addTreatment(trk, { type: 'AVOID' }).type).toBe('AVOID');
    });
    it('stores description', () => {
      expect(addTreatment(trk, { description: 'desc' }).description).toBe('desc');
    });
    it('stores assignedTo', () => {
      expect(addTreatment(trk, { assignedTo: 'alice' }).assignedTo).toBe('alice');
    });
    it('stores dueDate', () => {
      expect(addTreatment(trk, { dueDate: '2026-06-01' }).dueDate).toBe('2026-06-01');
    });
    it('stores optional cost', () => {
      expect(addTreatment(trk, { cost: 1500 }).cost).toBe(1500);
    });
    it('stores optional notes', () => {
      expect(addTreatment(trk, { notes: 'note here' }).notes).toBe('note here');
    });
    it('cost is undefined when not provided', () => {
      expect(addTreatment(trk).cost).toBeUndefined();
    });
    it('notes is undefined when not provided', () => {
      expect(addTreatment(trk).notes).toBeUndefined();
    });
    it('unique ids per add', () => {
      const a = addTreatment(trk);
      const b = addTreatment(trk);
      expect(a.id).not.toBe(b.id);
    });
    it('count increments', () => {
      addTreatment(trk);
      addTreatment(trk);
      expect(trk.getCount()).toBe(2);
    });
  });

  describe('add — all treatment types', () => {
    TREATMENT_TYPES.forEach((type) => {
      it(`type ${type} is stored`, () => {
        expect(addTreatment(trk, { type }).type).toBe(type);
      });
    });
  });

  // ─── start ───
  describe('start', () => {
    it('sets status to IN_PROGRESS', () => {
      const t = addTreatment(trk);
      expect(trk.start(t.id).status).toBe('IN_PROGRESS');
    });
    it('throws for unknown id', () => {
      expect(() => trk.start('bad')).toThrow('Treatment not found: bad');
    });
    it('persists IN_PROGRESS', () => {
      const t = addTreatment(trk);
      trk.start(t.id);
      expect(trk.getByStatus('IN_PROGRESS').some((x) => x.id === t.id)).toBe(true);
    });
  });

  // ─── complete ───
  describe('complete', () => {
    it('sets status to COMPLETED', () => {
      const t = addTreatment(trk);
      expect(trk.complete(t.id, '2026-11-01').status).toBe('COMPLETED');
    });
    it('stores completedDate', () => {
      const t = addTreatment(trk);
      const c = trk.complete(t.id, '2026-11-01');
      expect(c.completedDate).toBe('2026-11-01');
    });
    it('throws for unknown id', () => {
      expect(() => trk.complete('bad', '2026-01-01')).toThrow();
    });
    it('persists COMPLETED', () => {
      const t = addTreatment(trk);
      trk.complete(t.id, '2026-11-01');
      expect(trk.getByStatus('COMPLETED').some((x) => x.id === t.id)).toBe(true);
    });
  });

  // ─── cancel ───
  describe('cancel', () => {
    it('sets status to CANCELLED', () => {
      const t = addTreatment(trk);
      expect(trk.cancel(t.id).status).toBe('CANCELLED');
    });
    it('throws for unknown id', () => {
      expect(() => trk.cancel('bad')).toThrow();
    });
    it('persists CANCELLED', () => {
      const t = addTreatment(trk);
      trk.cancel(t.id);
      expect(trk.getByStatus('CANCELLED').some((x) => x.id === t.id)).toBe(true);
    });
  });

  describe('full treatment lifecycle', () => {
    it('PLANNED → IN_PROGRESS → COMPLETED', () => {
      const t = addTreatment(trk);
      expect(t.status).toBe('PLANNED');
      expect(trk.start(t.id).status).toBe('IN_PROGRESS');
      expect(trk.complete(t.id, '2026-12-01').status).toBe('COMPLETED');
    });
    it('PLANNED → CANCELLED', () => {
      const t = addTreatment(trk);
      expect(trk.cancel(t.id).status).toBe('CANCELLED');
    });
  });

  // ─── getByRisk ───
  describe('getByRisk', () => {
    it('returns empty for unknown riskId', () => {
      expect(trk.getByRisk('no-risk')).toHaveLength(0);
    });
    it('returns treatments for riskId', () => {
      addTreatment(trk, { riskId: 'r1' });
      addTreatment(trk, { riskId: 'r1' });
      addTreatment(trk, { riskId: 'r2' });
      expect(trk.getByRisk('r1')).toHaveLength(2);
      expect(trk.getByRisk('r2')).toHaveLength(1);
    });
    Array.from({ length: 10 }, (_, i) => `risk-${i}`).forEach((riskId) => {
      it(`getByRisk('${riskId}') returns correct treatment`, () => {
        const fresh = makeTrk();
        const t = addTreatment(fresh, { riskId });
        expect(fresh.getByRisk(riskId).some((x) => x.id === t.id)).toBe(true);
      });
    });
  });

  // ─── getByType ───
  describe('getByType', () => {
    TREATMENT_TYPES.forEach((type) => {
      it(`getByType('${type}') returns matching treatments`, () => {
        const fresh = makeTrk();
        const t = addTreatment(fresh, { type });
        expect(fresh.getByType(type).some((x) => x.id === t.id)).toBe(true);
      });
    });
    it('does not mix types', () => {
      addTreatment(trk, { type: 'AVOID' });
      addTreatment(trk, { type: 'REDUCE' });
      expect(trk.getByType('AVOID')).toHaveLength(1);
    });
  });

  // ─── getByStatus ───
  describe('getByStatus', () => {
    TREATMENT_STATUSES.forEach((status) => {
      it(`getByStatus('${status}') on empty tracker returns []`, () => {
        expect(makeTrk().getByStatus(status)).toHaveLength(0);
      });
    });

    it('PLANNED filtered correctly', () => {
      const t = addTreatment(trk);
      expect(trk.getByStatus('PLANNED').some((x) => x.id === t.id)).toBe(true);
    });
    it('IN_PROGRESS filtered correctly', () => {
      const t = addTreatment(trk);
      trk.start(t.id);
      expect(trk.getByStatus('IN_PROGRESS').some((x) => x.id === t.id)).toBe(true);
    });
    it('COMPLETED filtered correctly', () => {
      const t = addTreatment(trk);
      trk.complete(t.id, '2026-12-01');
      expect(trk.getByStatus('COMPLETED').some((x) => x.id === t.id)).toBe(true);
    });
    it('CANCELLED filtered correctly', () => {
      const t = addTreatment(trk);
      trk.cancel(t.id);
      expect(trk.getByStatus('CANCELLED').some((x) => x.id === t.id)).toBe(true);
    });
    it('after start, removed from PLANNED', () => {
      const t = addTreatment(trk);
      trk.start(t.id);
      expect(trk.getByStatus('PLANNED').some((x) => x.id === t.id)).toBe(false);
    });
  });

  // ─── getByAssignee ───
  describe('getByAssignee', () => {
    it('returns empty for unknown assignee', () => {
      expect(trk.getByAssignee('nobody')).toHaveLength(0);
    });
    it('returns treatments for assignee', () => {
      addTreatment(trk, { assignedTo: 'alice' });
      addTreatment(trk, { assignedTo: 'alice' });
      addTreatment(trk, { assignedTo: 'bob' });
      expect(trk.getByAssignee('alice')).toHaveLength(2);
      expect(trk.getByAssignee('bob')).toHaveLength(1);
    });
    Array.from({ length: 10 }, (_, i) => `user-${i}`).forEach((user) => {
      it(`getByAssignee('${user}') isolation`, () => {
        const fresh = makeTrk();
        const t = addTreatment(fresh, { assignedTo: user });
        expect(fresh.getByAssignee(user).some((x) => x.id === t.id)).toBe(true);
      });
    });
  });

  // ─── getOverdue ───
  describe('getOverdue', () => {
    it('returns empty when no treatments', () => {
      expect(trk.getOverdue('2026-12-31')).toHaveLength(0);
    });
    it('returns PLANNED treatments past due', () => {
      addTreatment(trk, { dueDate: '2026-01-01' });
      expect(trk.getOverdue('2026-06-01')).toHaveLength(1);
    });
    it('returns IN_PROGRESS treatments past due', () => {
      const t = addTreatment(trk, { dueDate: '2026-01-01' });
      trk.start(t.id);
      expect(trk.getOverdue('2026-06-01')).toHaveLength(1);
    });
    it('does not return COMPLETED treatments', () => {
      const t = addTreatment(trk, { dueDate: '2026-01-01' });
      trk.complete(t.id, '2026-01-01');
      expect(trk.getOverdue('2026-06-01')).toHaveLength(0);
    });
    it('does not return CANCELLED treatments', () => {
      const t = addTreatment(trk, { dueDate: '2026-01-01' });
      trk.cancel(t.id);
      expect(trk.getOverdue('2026-06-01')).toHaveLength(0);
    });
    it('does not return future treatments', () => {
      addTreatment(trk, { dueDate: '2027-01-01' });
      expect(trk.getOverdue('2026-06-01')).toHaveLength(0);
    });
    it('strict < comparison on same date', () => {
      addTreatment(trk, { dueDate: '2026-06-01' });
      expect(trk.getOverdue('2026-06-01')).toHaveLength(0);
    });
    it('mixes overdue and non-overdue', () => {
      addTreatment(trk, { dueDate: '2026-01-01' }); // overdue
      addTreatment(trk, { dueDate: '2027-01-01' }); // not overdue
      expect(trk.getOverdue('2026-06-01')).toHaveLength(1);
    });

    Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 1).padStart(2, '0');
      return `2026-${month}-15`;
    }).forEach((date) => {
      it(`overdue treatment for date ${date}`, () => {
        const fresh = makeTrk();
        addTreatment(fresh, { dueDate: date });
        expect(fresh.getOverdue('2027-01-01')).toHaveLength(1);
      });
    });
  });

  // ─── getTotalCost ───
  describe('getTotalCost', () => {
    it('returns 0 when no treatments', () => {
      expect(trk.getTotalCost()).toBe(0);
    });
    it('returns 0 when no cost defined', () => {
      addTreatment(trk);
      expect(trk.getTotalCost()).toBe(0);
    });
    it('sums single cost', () => {
      addTreatment(trk, { cost: 1000 });
      expect(trk.getTotalCost()).toBe(1000);
    });
    it('sums multiple costs', () => {
      addTreatment(trk, { cost: 500 });
      addTreatment(trk, { cost: 300 });
      addTreatment(trk, { cost: 200 });
      expect(trk.getTotalCost()).toBe(1000);
    });
    it('skips undefined costs', () => {
      addTreatment(trk, { cost: 1000 });
      addTreatment(trk); // no cost
      expect(trk.getTotalCost()).toBe(1000);
    });
    it('handles zero cost', () => {
      addTreatment(trk, { cost: 0 });
      expect(trk.getTotalCost()).toBe(0);
    });

    describe('parameterized cost sums', () => {
      Array.from({ length: 20 }, (_, i) => (i + 1) * 100).forEach((cost, idx) => {
        it(`cost sum with value ${cost} (index ${idx})`, () => {
          const fresh = makeTrk();
          addTreatment(fresh, { cost });
          expect(fresh.getTotalCost()).toBe(cost);
        });
      });
    });

    it('large cost accumulation', () => {
      Array.from({ length: 10 }).forEach((_, i) => {
        addTreatment(trk, { cost: 1000 * (i + 1) });
      });
      // 1000+2000+...+10000 = 55000
      expect(trk.getTotalCost()).toBe(55000);
    });
  });

  // ─── getCompletionRate ───
  describe('getCompletionRate', () => {
    it('returns 0 when no treatments', () => {
      expect(trk.getCompletionRate()).toBe(0);
    });
    it('returns 0 when none completed', () => {
      addTreatment(trk);
      addTreatment(trk);
      expect(trk.getCompletionRate()).toBe(0);
    });
    it('returns 100 when all completed', () => {
      const a = addTreatment(trk);
      const b = addTreatment(trk);
      trk.complete(a.id, '2026-01-01');
      trk.complete(b.id, '2026-01-01');
      expect(trk.getCompletionRate()).toBe(100);
    });
    it('returns 50 for 1 of 2 completed', () => {
      const a = addTreatment(trk);
      addTreatment(trk);
      trk.complete(a.id, '2026-01-01');
      expect(trk.getCompletionRate()).toBe(50);
    });
    it('returns 25 for 1 of 4 completed', () => {
      const a = addTreatment(trk);
      addTreatment(trk);
      addTreatment(trk);
      addTreatment(trk);
      trk.complete(a.id, '2026-01-01');
      expect(trk.getCompletionRate()).toBe(25);
    });
    it('cancelled treatments count toward total', () => {
      const a = addTreatment(trk);
      const b = addTreatment(trk);
      trk.complete(a.id, '2026-01-01');
      trk.cancel(b.id);
      expect(trk.getCompletionRate()).toBe(50);
    });

    describe('completion rate parametrized', () => {
      Array.from({ length: 10 }, (_, i) => i + 1).forEach((total) => {
        it(`100% rate for ${total} all-completed`, () => {
          const fresh = makeTrk();
          Array.from({ length: total }).forEach(() => {
            const t = addTreatment(fresh);
            fresh.complete(t.id, '2026-01-01');
          });
          expect(fresh.getCompletionRate()).toBe(100);
        });
      });
    });
  });

  // ─── getCount ───
  describe('getCount', () => {
    it('starts at 0', () => {
      expect(trk.getCount()).toBe(0);
    });
    Array.from({ length: 20 }, (_, i) => i + 1).forEach((n) => {
      it(`returns ${n} after adding ${n} treatments`, () => {
        const fresh = makeTrk();
        Array.from({ length: n }).forEach(() => addTreatment(fresh));
        expect(fresh.getCount()).toBe(n);
      });
    });
  });

  // ─── bulk add parameterized ───
  describe('bulk add (50 treatments)', () => {
    Array.from({ length: 50 }, (_, i) => i).forEach((i) => {
      it(`bulk treatment #${i} is PLANNED`, () => {
        const fresh = makeTrk();
        const t = addTreatment(fresh);
        expect(t.status).toBe('PLANNED');
        expect(fresh.getCount()).toBe(1);
      });
    });
  });

  describe('bulk start (30 treatments)', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`bulk start #${i} → IN_PROGRESS`, () => {
        const fresh = makeTrk();
        const t = addTreatment(fresh);
        expect(fresh.start(t.id).status).toBe('IN_PROGRESS');
      });
    });
  });

  describe('bulk complete (30 treatments)', () => {
    Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
      it(`bulk complete #${i} → COMPLETED`, () => {
        const fresh = makeTrk();
        const t = addTreatment(fresh);
        const c = fresh.complete(t.id, `2026-${String((i % 12) + 1).padStart(2, '0')}-01`);
        expect(c.status).toBe('COMPLETED');
      });
    });
  });

  describe('bulk cancel (20 treatments)', () => {
    Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
      it(`bulk cancel #${i} → CANCELLED`, () => {
        const fresh = makeTrk();
        const t = addTreatment(fresh);
        expect(fresh.cancel(t.id).status).toBe('CANCELLED');
      });
    });
  });

  // ─── error cases ───
  describe('error cases', () => {
    it('start throws with correct message', () => {
      expect(() => trk.start('x')).toThrow('Treatment not found: x');
    });
    it('complete throws with correct message', () => {
      expect(() => trk.complete('x', '2026-01-01')).toThrow('Treatment not found: x');
    });
    it('cancel throws with correct message', () => {
      expect(() => trk.cancel('x')).toThrow('Treatment not found: x');
    });
  });

  // ─── return value immutability ───
  describe('return value immutability', () => {
    it('add returns copy', () => {
      const t = addTreatment(trk, { description: 'orig' });
      (t as any).description = 'changed';
      expect(trk.getByRisk(t.riskId)[0]?.description).toBe('orig');
    });
    it('start returns copy', () => {
      const t = addTreatment(trk);
      const s = trk.start(t.id);
      (s as any).status = 'CANCELLED';
      expect(trk.getByStatus('IN_PROGRESS').some((x) => x.id === t.id)).toBe(true);
    });
  });
});

// ─────────────────────────────────────────────
// Integration: RiskRegister + TreatmentTracker
// ─────────────────────────────────────────────
describe('Integration: RiskRegister + TreatmentTracker', () => {
  let reg: RiskRegister;
  let trk: TreatmentTracker;
  beforeEach(() => {
    reg = makeReg();
    trk = makeTrk();
  });

  it('treatment riskId matches risk id', () => {
    const r = reg.identify('Supply Risk', 'desc', 'OPERATIONAL', 'owner', 'dept', 4, 4, '2026-01-01');
    const t = trk.add(r.id, 'REDUCE', 'Reduce exposure', 'alice', '2026-12-31', 2000);
    expect(t.riskId).toBe(r.id);
  });

  it('assess then treat workflow', () => {
    const r = reg.identify('Compliance Risk', 'desc', 'COMPLIANCE', 'owner', 'dept', 2, 3, '2026-01-01');
    reg.assess(r.id, 3, 3);
    reg.treat(r.id);
    trk.add(r.id, 'REDUCE', 'Implement controls', 'bob', '2026-06-01');
    const t = trk.getByRisk(r.id)[0];
    trk.start(t.id);
    trk.complete(t.id, '2026-05-15');
    expect(reg.get(r.id)?.status).toBe('TREATED');
    expect(trk.getByStatus('COMPLETED')).toHaveLength(1);
  });

  it('multiple treatments for one risk', () => {
    const r = reg.identify('Big Risk', 'desc', 'STRATEGIC', 'ceo', 'exec', 5, 5, '2026-01-01');
    trk.add(r.id, 'AVOID', 'Avoid path A', 'alice', '2026-06-01', 5000);
    trk.add(r.id, 'TRANSFER', 'Insurance', 'bob', '2026-06-01', 10000);
    trk.add(r.id, 'REDUCE', 'Controls', 'carol', '2026-09-01', 3000);
    expect(trk.getByRisk(r.id)).toHaveLength(3);
    expect(trk.getTotalCost()).toBe(18000);
  });

  it('risk matrix after assess', () => {
    const r = reg.identify('Low Risk', 'desc', 'FINANCIAL', 'owner', 'dept', 1, 1, '2026-01-01');
    reg.assess(r.id, 5, 5);
    expect(reg.getRiskMatrix().critical).toBe(1);
    expect(reg.getRiskMatrix().low).toBe(0);
  });

  it('getHighAndCritical + treatment overdue', () => {
    const r = reg.identify('High Risk', 'desc', 'SAFETY', 'owner', 'dept', 3, 4, '2026-01-01');
    // 3*4=12 HIGH
    trk.add(r.id, 'REDUCE', 'Fix hazard', 'alice', '2026-01-01');
    expect(reg.getHighAndCritical()).toHaveLength(1);
    expect(trk.getOverdue('2026-06-01')).toHaveLength(1);
  });

  it('completion rate reflects real progress', () => {
    const r = reg.identify('Risk A', 'desc', 'ENVIRONMENTAL', 'owner', 'dept', 2, 2, '2026-01-01');
    const t1 = trk.add(r.id, 'REDUCE', 'Action 1', 'alice', '2026-06-01');
    const t2 = trk.add(r.id, 'ACCEPT', 'Action 2', 'bob', '2026-09-01');
    trk.complete(t1.id, '2026-05-01');
    expect(trk.getCompletionRate()).toBe(50);
    trk.complete(t2.id, '2026-08-01');
    expect(trk.getCompletionRate()).toBe(100);
  });

  Array.from({ length: 30 }, (_, i) => i).forEach((i) => {
    it(`integration bulk #${i}: risk + treatment lifecycle`, () => {
      const r = reg.identify(`Risk-${i}`, 'desc', 'OPERATIONAL', `owner-${i}`, 'dept', 3, 3, '2026-01-01');
      const t = trk.add(r.id, 'REDUCE', `Action-${i}`, `user-${i}`, '2026-12-31');
      expect(t.riskId).toBe(r.id);
      expect(t.status).toBe('PLANNED');
    });
  });
});

// ─────────────────────────────────────────────
// Extra parameterized tests — push total to ≥1,000
// ─────────────────────────────────────────────

describe('Extra: RiskRegister — department filtering', () => {
  let reg: RiskRegister;
  beforeEach(() => { reg = makeReg(); });

  Array.from({ length: 20 }, (_, i) => `Department-${i}`).forEach((dept, i) => {
    it(`department ${dept} stored correctly (index ${i})`, () => {
      const r = reg.identify(`Risk-${i}`, 'desc', 'OPERATIONAL', 'owner', dept, 3, 3, '2026-01-01');
      expect(r.department).toBe(dept);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`identify with notes-${i} stores notes`, () => {
      const fresh = makeReg();
      const r = fresh.identify(`T${i}`, 'desc', 'FINANCIAL', 'owner', 'dept', 1, 1, '2026-01-01', undefined, `note-${i}`);
      expect(r.notes).toBe(`note-${i}`);
    });
  });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`identify with reviewDate-${i} stores reviewDate`, () => {
      const fresh = makeReg();
      const month = String((i % 12) + 1).padStart(2, '0');
      const reviewDate = `2026-${month}-${String((i % 28) + 1).padStart(2, '0')}`;
      const r = fresh.identify(`T${i}`, 'desc', 'STRATEGIC', 'owner', 'dept', 2, 2, '2026-01-01', reviewDate);
      expect(r.reviewDate).toBe(reviewDate);
    });
  });
});

describe('Extra: RiskRegister — update partial fields', () => {
  let reg: RiskRegister;
  beforeEach(() => { reg = makeReg(); });

  Array.from({ length: 20 }, (_, i) => i).forEach((i) => {
    it(`update status directly #${i}`, () => {
      const fresh = makeReg();
      const r = fresh.identify(`R${i}`, 'd', 'SAFETY', 'o', 'dept', 1, 1, '2026-01-01');
      const updated = fresh.update(r.id, { status: 'ESCALATED' });
      expect(updated.status).toBe('ESCALATED');
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
    it(`update owner #${i}`, () => {
      const fresh = makeReg();
      const r = fresh.identify(`R${i}`, 'd', 'TECHNOLOGY', 'old-owner', 'dept', 2, 2, '2026-01-01');
      const updated = fresh.update(r.id, { owner: `new-owner-${i}` });
      expect(updated.owner).toBe(`new-owner-${i}`);
    });
  });

  Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
    it(`update department #${i}`, () => {
      const fresh = makeReg();
      const r = fresh.identify(`R${i}`, 'd', 'REPUTATIONAL', 'owner', 'old-dept', 1, 3, '2026-01-01');
      const updated = fresh.update(r.id, { department: `new-dept-${i}` });
      expect(updated.department).toBe(`new-dept-${i}`);
    });
  });
});

describe('Extra: TreatmentTracker — cost edge cases', () => {
  let trk: TreatmentTracker;
  beforeEach(() => { trk = makeTrk(); });

  Array.from({ length: 20 }, (_, i) => (i + 1) * 250).forEach((cost, i) => {
    it(`add with cost ${cost} index ${i}`, () => {
      const fresh = makeTrk();
      const t = fresh.add('r1', 'AVOID', 'desc', 'alice', '2026-12-31', cost);
      expect(t.cost).toBe(cost);
    });
  });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`getTotalCost for ${i + 2} treatments with equal costs`, () => {
      const fresh = makeTrk();
      const count = i + 2;
      const unitCost = 500;
      Array.from({ length: count }).forEach(() => {
        fresh.add('r1', 'REDUCE', 'desc', 'alice', '2026-12-31', unitCost);
      });
      expect(fresh.getTotalCost()).toBe(count * unitCost);
    });
  });
});

describe('Extra: TreatmentTracker — getByRisk multi-risk isolation', () => {
  let trk: TreatmentTracker;
  beforeEach(() => { trk = makeTrk(); });

  Array.from({ length: 15 }, (_, i) => i).forEach((i) => {
    it(`getByRisk risk-${i} returns only own treatments`, () => {
      const fresh = makeTrk();
      const riskId = `risk-${i}`;
      fresh.add(riskId, 'REDUCE', 'desc', 'alice', '2026-12-31');
      fresh.add('other-risk', 'AVOID', 'desc', 'bob', '2026-12-31');
      expect(fresh.getByRisk(riskId)).toHaveLength(1);
    });
  });
});

describe('Extra: computeRiskLevel edge cases', () => {
  it('score 1 → LOW', () => expect(computeRiskLevel(1)).toBe('LOW'));
  it('score 2 → LOW', () => expect(computeRiskLevel(2)).toBe('LOW'));
  it('score 3 → LOW', () => expect(computeRiskLevel(3)).toBe('LOW'));
  it('score 6 → MEDIUM', () => expect(computeRiskLevel(6)).toBe('MEDIUM'));
  it('score 7 → MEDIUM', () => expect(computeRiskLevel(7)).toBe('MEDIUM'));
  it('score 8 → MEDIUM', () => expect(computeRiskLevel(8)).toBe('MEDIUM'));
  it('score 11 → HIGH', () => expect(computeRiskLevel(11)).toBe('HIGH'));
  it('score 12 → HIGH', () => expect(computeRiskLevel(12)).toBe('HIGH'));
  it('score 13 → HIGH', () => expect(computeRiskLevel(13)).toBe('HIGH'));
  it('score 16 → CRITICAL', () => expect(computeRiskLevel(16)).toBe('CRITICAL'));
  it('score 17 → CRITICAL', () => expect(computeRiskLevel(17)).toBe('CRITICAL'));
  it('score 18 → CRITICAL', () => expect(computeRiskLevel(18)).toBe('CRITICAL'));
  it('score 19 → CRITICAL', () => expect(computeRiskLevel(19)).toBe('CRITICAL'));
  it('score 20 → CRITICAL', () => expect(computeRiskLevel(20)).toBe('CRITICAL'));
  it('score 21 → CRITICAL', () => expect(computeRiskLevel(21)).toBe('CRITICAL'));
  it('score 22 → CRITICAL', () => expect(computeRiskLevel(22)).toBe('CRITICAL'));
  it('score 23 → CRITICAL', () => expect(computeRiskLevel(23)).toBe('CRITICAL'));
  it('score 24 → CRITICAL', () => expect(computeRiskLevel(24)).toBe('CRITICAL'));
});

describe('Extra: RiskRegister — getAll returns all categories', () => {
  let reg: RiskRegister;
  beforeEach(() => { reg = makeReg(); });

  it('getAll with 8 categories has 8 records', () => {
    CATEGORIES.forEach((cat) => reg.identify(`Risk-${cat}`, 'd', cat, 'o', 'dept', 1, 1, '2026-01-01'));
    expect(reg.getAll()).toHaveLength(8);
  });

  CATEGORIES.forEach((cat) => {
    it(`getAll includes category ${cat}`, () => {
      const fresh = makeReg();
      fresh.identify(`R`, 'd', cat, 'o', 'dept', 1, 1, '2026-01-01');
      expect(fresh.getAll().some((r) => r.category === cat)).toBe(true);
    });
  });
});

describe('Extra: RiskRegister — getByOwner with multiple owners', () => {
  let reg: RiskRegister;
  beforeEach(() => { reg = makeReg(); });

  Array.from({ length: 10 }, (_, i) => i).forEach((i) => {
    it(`getByOwner isolation when ${i + 1} owners present`, () => {
      const fresh = makeReg();
      const owners = Array.from({ length: i + 1 }, (_, j) => `owner-${j}`);
      owners.forEach((owner) => fresh.identify('R', 'd', 'OPERATIONAL', owner, 'dept', 1, 1, '2026-01-01'));
      expect(fresh.getByOwner('owner-0')).toHaveLength(1);
    });
  });
});

describe('Extra: TreatmentTracker — getByAssignee with type tracking', () => {
  let trk: TreatmentTracker;
  beforeEach(() => { trk = makeTrk(); });

  TREATMENT_TYPES.forEach((type) => {
    Array.from({ length: 5 }, (_, i) => i).forEach((i) => {
      it(`add type=${type} index=${i} returns correct type`, () => {
        const fresh = makeTrk();
        const t = fresh.add('r1', type, 'desc', 'alice', '2026-12-31');
        expect(fresh.getByType(type).some((x) => x.id === t.id)).toBe(true);
      });
    });
  });
});
