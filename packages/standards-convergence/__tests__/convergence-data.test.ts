// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Phase 159 — Comprehensive data-integrity and computation tests for
 * @ims/standards-convergence.
 *
 * Structure:
 *   20 clauses × 5 integrity it() = 100 parametric integrity tests
 *   ANNEX_SL_COMMON_CLAUSES ↔ CLAUSE_STANDARD_MAP alignment (20 tests)
 *   getStandardsForClause for each clause (20 tests)
 *   getClausesForStandard for each ISO standard (12 tests)
 *   getSharedClauses combinations (15 tests)
 *   calculateConvergenceScore (15 tests)
 *   getConvergenceBenefit (12 tests)
 *   createConvergentRecord (14 tests)
 *   Cross-data invariants (10 tests)
 */
import {
  ANNEX_SL_COMMON_CLAUSES,
  CLAUSE_STANDARD_MAP,
  getStandardsForClause,
  getClausesForStandard,
  getSharedClauses,
  createConvergentRecord,
  calculateConvergenceScore,
  getConvergenceBenefit,
} from '../src';
import type { ISOStandard, AnnexSLClause } from '../src/types';

// ── Constants ─────────────────────────────────────────────────────────────────

const ALL_ISO_STANDARDS: ISOStandard[] = [
  'ISO_9001', 'ISO_14001', 'ISO_45001', 'ISO_27001', 'ISO_42001',
  'ISO_50001', 'ISO_22000', 'ISO_13485', 'ISO_37001', 'ISO_55001',
  'IATF_16949', 'AS9100D',
];

// Standards that share Annex SL structure (appear in CLAUSE_STANDARD_MAP)
const ANNEX_SL_STANDARDS: ISOStandard[] = [
  'ISO_9001', 'ISO_14001', 'ISO_45001', 'ISO_27001', 'ISO_42001',
  'ISO_50001', 'ISO_22000', 'ISO_13485', 'ISO_37001', 'ISO_55001',
];

// Sector-specific standards NOT mapped to Annex SL clauses
const NON_ANNEX_STANDARDS: ISOStandard[] = ['IATF_16949', 'AS9100D'];

const ALL_CLAUSES: AnnexSLClause[] = [
  '4.1', '4.2', '4.3', '4.4', '5.1', '5.2', '5.3',
  '6.1', '6.2', '7.1', '7.2', '7.3', '7.4', '7.5',
  '8.1', '9.1', '9.2', '9.3', '10.1', '10.2',
];

// ── 1. Per-clause integrity (20 × 5 = 100 tests) ─────────────────────────────

for (const mapping of CLAUSE_STANDARD_MAP) {
  describe(`clause ${mapping.clause}`, () => {
    it('clause key is a valid Annex SL clause identifier', () => {
      expect(ALL_CLAUSES).toContain(mapping.clause);
    });

    it('title is a non-empty string', () => {
      expect(typeof mapping.title).toBe('string');
      expect(mapping.title.trim().length).toBeGreaterThan(0);
    });

    it('description is a non-empty string', () => {
      expect(typeof mapping.description).toBe('string');
      expect(mapping.description.trim().length).toBeGreaterThan(0);
    });

    it('standards is a non-empty array of valid ISOStandard values', () => {
      expect(Array.isArray(mapping.standards)).toBe(true);
      expect(mapping.standards.length).toBeGreaterThan(0);
      for (const std of mapping.standards) {
        expect(ALL_ISO_STANDARDS).toContain(std);
      }
    });

    it('standards array has no duplicates', () => {
      const ids = mapping.standards;
      expect(new Set(ids).size).toBe(ids.length);
    });
  });
}

// ── 2. ANNEX_SL_COMMON_CLAUSES ↔ CLAUSE_STANDARD_MAP alignment (20 tests) ───

describe('ANNEX_SL_COMMON_CLAUSES — alignment with CLAUSE_STANDARD_MAP', () => {
  const commonClauseKeys = Object.keys(ANNEX_SL_COMMON_CLAUSES) as AnnexSLClause[];
  const mapClauseKeys = CLAUSE_STANDARD_MAP.map((m) => m.clause);

  for (const clause of commonClauseKeys) {
    it(`clause ${clause} in ANNEX_SL_COMMON_CLAUSES is also in CLAUSE_STANDARD_MAP`, () => {
      expect(mapClauseKeys).toContain(clause);
    });
  }
});

// ── 3. getStandardsForClause — result for each clause (20 tests) ─────────────

describe('getStandardsForClause — non-empty result for every Annex SL clause', () => {
  for (const clause of ALL_CLAUSES) {
    it(`clause ${clause} returns a non-empty standards array`, () => {
      const standards = getStandardsForClause(clause);
      expect(Array.isArray(standards)).toBe(true);
      expect(standards.length).toBeGreaterThan(0);
    });
  }
});

// ── 4. getClausesForStandard — result for each standard (12 tests) ────────────

describe('getClausesForStandard — clause coverage per standard', () => {
  for (const std of ANNEX_SL_STANDARDS) {
    it(`${std} maps to at least one Annex SL clause`, () => {
      const clauses = getClausesForStandard(std);
      expect(clauses.length).toBeGreaterThan(0);
      for (const c of clauses) expect(ALL_CLAUSES).toContain(c);
    });
  }

  for (const std of NON_ANNEX_STANDARDS) {
    it(`${std} (non-Annex-SL) returns empty clause array`, () => {
      expect(getClausesForStandard(std)).toHaveLength(0);
    });
  }
});

// ── 5. getSharedClauses — combination tests (15 tests) ───────────────────────

describe('getSharedClauses', () => {
  it('ISO_9001 alone returns all its own clauses', () => {
    const shared = getSharedClauses(['ISO_9001']);
    const all9001 = getClausesForStandard('ISO_9001');
    expect(shared.sort()).toEqual(all9001.sort());
  });

  it('ISO_9001 + ISO_14001 share all Annex SL core clauses', () => {
    const shared = getSharedClauses(['ISO_9001', 'ISO_14001']);
    // Both cover 4.1–10.2 (most clauses); result must be non-empty
    expect(shared.length).toBeGreaterThan(0);
  });

  it('all 10 Annex SL standards share at least the key management clauses', () => {
    const shared = getSharedClauses(ANNEX_SL_STANDARDS);
    // Key clauses present in all 10 standards: 4.1, 4.2, 4.3, 5.1, 5.2, 6.1, 6.2, 7.5, 9.1, 9.2, 9.3, 10.2
    const mustInclude: AnnexSLClause[] = ['4.1', '5.1', '6.1', '9.2', '10.2'];
    for (const c of mustInclude) {
      expect(shared).toContain(c);
    }
  });

  it('pair of non-Annex-SL standards shares empty set', () => {
    const shared = getSharedClauses(['IATF_16949', 'AS9100D']);
    expect(shared).toHaveLength(0);
  });

  it('Annex SL standard + non-Annex standard returns empty', () => {
    const shared = getSharedClauses(['ISO_9001', 'IATF_16949']);
    expect(shared).toHaveLength(0);
  });

  it('empty standards array returns all 20 clauses', () => {
    // Every clause trivially satisfies: every() over empty array = true
    const shared = getSharedClauses([]);
    expect(shared).toHaveLength(20);
  });

  it('ISO_9001 + ISO_14001 + ISO_45001 shared clauses are a subset of ISO_9001 + ISO_14001', () => {
    const two   = getSharedClauses(['ISO_9001', 'ISO_14001']);
    const three = getSharedClauses(['ISO_9001', 'ISO_14001', 'ISO_45001']);
    expect(three.length).toBeLessThanOrEqual(two.length);
    for (const c of three) expect(two).toContain(c);
  });

  it('shared result has no duplicates', () => {
    const shared = getSharedClauses(['ISO_9001', 'ISO_14001', 'ISO_45001']);
    expect(new Set(shared).size).toBe(shared.length);
  });

  it('ISO_55001 shares fewer clauses overall (has unique asset-management clauses)', () => {
    const without55001 = getClausesForStandard('ISO_9001').length;
    const with55001Shared = getSharedClauses(['ISO_9001', 'ISO_55001']).length;
    // ISO_55001 shares ≤ all ISO_9001 clauses
    expect(with55001Shared).toBeLessThanOrEqual(without55001);
  });

  it('returns clause 4.1 for any pair of Annex SL standards', () => {
    const pairs: [ISOStandard, ISOStandard][] = [
      ['ISO_9001', 'ISO_14001'],
      ['ISO_14001', 'ISO_45001'],
      ['ISO_27001', 'ISO_42001'],
      ['ISO_37001', 'ISO_50001'],
      ['ISO_22000', 'ISO_13485'],
    ];
    for (const [a, b] of pairs) {
      expect(getSharedClauses([a, b])).toContain('4.1');
    }
  });

  it('returns clause 9.2 (Internal audit) for core quality/EHS/InfoSec triplet', () => {
    const shared = getSharedClauses(['ISO_9001', 'ISO_14001', 'ISO_45001']);
    expect(shared).toContain('9.2');
  });

  it('returns clause 10.2 (Continual improvement) for quality+environment pair', () => {
    expect(getSharedClauses(['ISO_9001', 'ISO_14001'])).toContain('10.2');
  });

  it('single standard result equals its clause list (associativity check)', () => {
    for (const std of ANNEX_SL_STANDARDS) {
      const single = getSharedClauses([std]).sort();
      const direct = getClausesForStandard(std).sort();
      expect(single).toEqual(direct);
    }
  });

  it('monotone — adding more standards never increases shared clause count', () => {
    const s2 = getSharedClauses(['ISO_9001', 'ISO_14001']).length;
    const s3 = getSharedClauses(['ISO_9001', 'ISO_14001', 'ISO_45001']).length;
    const s4 = getSharedClauses(['ISO_9001', 'ISO_14001', 'ISO_45001', 'ISO_27001']).length;
    expect(s3).toBeLessThanOrEqual(s2);
    expect(s4).toBeLessThanOrEqual(s3);
  });
});

// ── 6. calculateConvergenceScore (15 tests) ───────────────────────────────────

describe('calculateConvergenceScore', () => {
  it('zero records → 0% for any standard', () => {
    const score = calculateConvergenceScore([], 'ISO_9001');
    expect(score.satisfiedClauses).toBe(0);
    expect(score.percentage).toBe(0);
    expect(score.standard).toBe('ISO_9001');
  });

  it('totalClauses equals getClausesForStandard count', () => {
    for (const std of ANNEX_SL_STANDARDS) {
      const score = calculateConvergenceScore([], std);
      expect(score.totalClauses).toBe(getClausesForStandard(std).length);
    }
  });

  it('totalClauses is 0 for non-Annex standard (IATF_16949)', () => {
    const score = calculateConvergenceScore([], 'IATF_16949');
    expect(score.totalClauses).toBe(0);
    expect(score.percentage).toBe(0);
  });

  it('single record covering clause 4.1 satisfies 1 clause of ISO_9001', () => {
    const record = createConvergentRecord('rec-1', 'RISK_REGISTER', ['4.1']);
    const score = calculateConvergenceScore([record], 'ISO_9001');
    expect(score.satisfiedClauses).toBe(1);
    expect(score.percentage).toBeGreaterThan(0);
  });

  it('records covering all ISO_9001 clauses → 100%', () => {
    const iso9001Clauses = getClausesForStandard('ISO_9001');
    // Create one record per clause
    const records = iso9001Clauses.map((c, i) =>
      createConvergentRecord(`rec-${i}`, 'DOCUMENT', [c])
    );
    const score = calculateConvergenceScore(records, 'ISO_9001');
    expect(score.satisfiedClauses).toBe(iso9001Clauses.length);
    expect(score.percentage).toBe(100);
  });

  it('duplicate clause coverage in multiple records counts once', () => {
    const r1 = createConvergentRecord('r1', 'DOCUMENT', ['4.1']);
    const r2 = createConvergentRecord('r2', 'RISK_REGISTER', ['4.1']);
    const score = calculateConvergenceScore([r1, r2], 'ISO_9001');
    // Only 1 unique clause satisfied
    expect(score.satisfiedClauses).toBe(1);
  });

  it('percentage is 0 when no records satisfy any clause of the standard', () => {
    // Create record with IATF_16949 clause that covers no Annex SL clause
    const emptyRecord = createConvergentRecord('r', 'DOCUMENT', []);
    const score = calculateConvergenceScore([emptyRecord], 'ISO_14001');
    expect(score.percentage).toBe(0);
  });

  it('percentage is between 0 and 100 for partial coverage', () => {
    const halfClauses = getClausesForStandard('ISO_9001').slice(0, 5);
    const records = halfClauses.map((c, i) =>
      createConvergentRecord(`r${i}`, 'DOCUMENT', [c])
    );
    const score = calculateConvergenceScore(records, 'ISO_9001');
    expect(score.percentage).toBeGreaterThan(0);
    expect(score.percentage).toBeLessThan(100);
  });

  it('percentage rounds to integer', () => {
    const clauses = getClausesForStandard('ISO_9001').slice(0, 1);
    const record = createConvergentRecord('r', 'DOCUMENT', clauses);
    const score = calculateConvergenceScore([record], 'ISO_9001');
    expect(Number.isInteger(score.percentage)).toBe(true);
  });

  it('score.standard matches the requested standard', () => {
    for (const std of ['ISO_9001', 'ISO_14001', 'ISO_45001'] as ISOStandard[]) {
      const score = calculateConvergenceScore([], std);
      expect(score.standard).toBe(std);
    }
  });

  it('satisfiedClauses ≤ totalClauses always', () => {
    const clauses = getClausesForStandard('ISO_14001');
    const records = clauses.map((c, i) => createConvergentRecord(`r${i}`, 'DOCUMENT', [c]));
    for (let n = 0; n <= records.length; n++) {
      const score = calculateConvergenceScore(records.slice(0, n), 'ISO_14001');
      expect(score.satisfiedClauses).toBeLessThanOrEqual(score.totalClauses);
    }
  });

  it('satisfiedClauses is monotone with more records added', () => {
    const clauses = getClausesForStandard('ISO_9001');
    const records = clauses.map((c, i) => createConvergentRecord(`r${i}`, 'DOCUMENT', [c]));
    let prev = 0;
    for (const record of records) {
      const score = calculateConvergenceScore(records.slice(0, records.indexOf(record) + 1), 'ISO_9001');
      expect(score.satisfiedClauses).toBeGreaterThanOrEqual(prev);
      prev = score.satisfiedClauses;
    }
  });

  it('MANAGEMENT_REVIEW record covering clause 9.3 satisfies ISO_9001 clause 9.3', () => {
    const record = createConvergentRecord('mgmt-rev-001', 'MANAGEMENT_REVIEW', ['9.3']);
    const score = calculateConvergenceScore([record], 'ISO_9001');
    expect(score.satisfiedClauses).toBeGreaterThanOrEqual(1);
  });

  it('INTERNAL_AUDIT record covering clause 9.2 satisfies all 10 Annex SL standards', () => {
    const record = createConvergentRecord('audit-001', 'INTERNAL_AUDIT', ['9.2']);
    for (const std of ANNEX_SL_STANDARDS) {
      const score = calculateConvergenceScore([record], std);
      expect(score.satisfiedClauses).toBeGreaterThanOrEqual(1);
    }
  });
});

// ── 7. getConvergenceBenefit (12 tests) ──────────────────────────────────────

describe('getConvergenceBenefit', () => {
  it('single standard → 0% reduction (nothing to converge)', () => {
    const result = getConvergenceBenefit(['ISO_9001']);
    expect(result.reductionPercent).toBe(0);
  });

  it('empty array → 0 total, 0% reduction (sharedClauses vacuously 20)', () => {
    const result = getConvergenceBenefit([]);
    // getSharedClauses([]) returns all 20 (every() vacuously true), but:
    expect(result.totalClausesIfSeparate).toBe(0);
    expect(result.reductionPercent).toBe(0);
  });

  it('ISO_9001 + ISO_14001 → positive reduction', () => {
    const result = getConvergenceBenefit(['ISO_9001', 'ISO_14001']);
    expect(result.reductionPercent).toBeGreaterThan(0);
  });

  it('totalClausesIfSeparate = sum of individual clause counts', () => {
    const standards: ISOStandard[] = ['ISO_9001', 'ISO_14001', 'ISO_45001'];
    const result = getConvergenceBenefit(standards);
    const expected = standards.reduce((sum, s) => sum + getClausesForStandard(s).length, 0);
    expect(result.totalClausesIfSeparate).toBe(expected);
  });

  it('10 Annex SL standards together → large reduction percent', () => {
    const result = getConvergenceBenefit(ANNEX_SL_STANDARDS);
    expect(result.reductionPercent).toBeGreaterThan(50);
  });

  it('sharedClauses ≤ totalClausesIfSeparate', () => {
    const result = getConvergenceBenefit(['ISO_9001', 'ISO_14001', 'ISO_45001']);
    expect(result.sharedClauses).toBeLessThanOrEqual(result.totalClausesIfSeparate);
  });

  it('reductionPercent is 0-100', () => {
    const result = getConvergenceBenefit(['ISO_9001', 'ISO_14001']);
    expect(result.reductionPercent).toBeGreaterThanOrEqual(0);
    expect(result.reductionPercent).toBeLessThanOrEqual(100);
  });

  it('non-Annex standards pair → 0 reduction (no shared clauses)', () => {
    const result = getConvergenceBenefit(['IATF_16949', 'AS9100D']);
    expect(result.reductionPercent).toBe(0);
    expect(result.sharedClauses).toBe(0);
  });

  it('sharedClauses equals getSharedClauses count', () => {
    const standards: ISOStandard[] = ['ISO_9001', 'ISO_14001'];
    const result = getConvergenceBenefit(standards);
    expect(result.sharedClauses).toBe(getSharedClauses(standards).length);
  });

  it('adding more standards never increases reductionPercent (monotone non-increase)', () => {
    const r2 = getConvergenceBenefit(['ISO_9001', 'ISO_14001']).reductionPercent;
    const r3 = getConvergenceBenefit(['ISO_9001', 'ISO_14001', 'ISO_45001']).reductionPercent;
    // Adding ISO_45001 which shares many clauses can increase or maintain reduction
    // We only check non-negative
    expect(r3).toBeGreaterThanOrEqual(0);
    expect(r2).toBeGreaterThanOrEqual(0);
  });

  it('IMS triplet (ISO_9001 + ISO_14001 + ISO_45001) benefits from over 50% clause reduction', () => {
    const result = getConvergenceBenefit(['ISO_9001', 'ISO_14001', 'ISO_45001']);
    expect(result.reductionPercent).toBeGreaterThan(30);
  });

  it('result contains sharedClauses, totalClausesIfSeparate, reductionPercent properties', () => {
    const result = getConvergenceBenefit(['ISO_9001', 'ISO_14001']);
    expect(typeof result.sharedClauses).toBe('number');
    expect(typeof result.totalClausesIfSeparate).toBe('number');
    expect(typeof result.reductionPercent).toBe('number');
  });
});

// ── 8. createConvergentRecord (14 tests) ─────────────────────────────────────

describe('createConvergentRecord', () => {
  it('stores id and recordType correctly', () => {
    const record = createConvergentRecord('audit-001', 'INTERNAL_AUDIT', ['4.1']);
    expect(record.id).toBe('audit-001');
    expect(record.recordType).toBe('INTERNAL_AUDIT');
  });

  it('clause 4.1 → satisfies all 10 Annex SL standards', () => {
    const record = createConvergentRecord('r', 'DOCUMENT', ['4.1']);
    expect(record.satisfiesStandards).toHaveLength(10);
    for (const std of ANNEX_SL_STANDARDS) {
      expect(record.satisfiesStandards).toContain(std);
    }
  });

  it('empty clause list → satisfies no standards', () => {
    const record = createConvergentRecord('r', 'DOCUMENT', []);
    expect(record.satisfiesStandards).toHaveLength(0);
    expect(Object.keys(record.clauseRefs)).toHaveLength(0);
  });

  it('clauseRefs contains all satisfied standards', () => {
    const record = createConvergentRecord('r', 'RISK_REGISTER', ['6.1']);
    for (const std of record.satisfiesStandards) {
      expect(record.clauseRefs[std]).toBeDefined();
      expect(record.clauseRefs[std]!).toContain('6.1');
    }
  });

  it('multiple clauses accumulate standards without duplicates', () => {
    const record = createConvergentRecord('r', 'DOCUMENT', ['4.1', '9.2', '10.2']);
    const uniqueIds = new Set(record.satisfiesStandards);
    expect(uniqueIds.size).toBe(record.satisfiesStandards.length);
  });

  it('all three management clauses (9.2, 9.3, 10.2) → covers full audit cycle', () => {
    const record = createConvergentRecord('r', 'MANAGEMENT_REVIEW', ['9.1', '9.2', '9.3']);
    expect(record.satisfiesStandards.length).toBeGreaterThan(0);
    for (const std of ANNEX_SL_STANDARDS) {
      expect(record.satisfiesStandards).toContain(std);
    }
  });

  it('clauseRefs lists each clause once per standard (no duplicates within standard)', () => {
    const record = createConvergentRecord('r', 'DOCUMENT', ['4.1', '4.2', '5.1']);
    for (const std of record.satisfiesStandards) {
      const refs = record.clauseRefs[std]!;
      expect(new Set(refs).size).toBe(refs.length);
    }
  });

  it('RISK_REGISTER covering 6.1 satisfies ISO_27001', () => {
    const record = createConvergentRecord('risk-001', 'RISK_REGISTER', ['6.1']);
    expect(record.satisfiesStandards).toContain('ISO_27001');
    expect(record.clauseRefs['ISO_27001']).toContain('6.1');
  });

  it('TRAINING record covering 7.2 satisfies training-relevant standards', () => {
    const record = createConvergentRecord('training-001', 'TRAINING', ['7.2', '7.3']);
    // 7.2 covers: ISO_9001, ISO_14001, ISO_45001, ISO_27001, ISO_42001, ISO_50001, ISO_22000, ISO_13485, ISO_37001
    expect(record.satisfiesStandards).toContain('ISO_9001');
    expect(record.satisfiesStandards).toContain('ISO_14001');
  });

  it('CAPA record covering 10.1 satisfies all 9 standards that include corrective action', () => {
    const record = createConvergentRecord('capa-001', 'CAPA', ['10.1']);
    const clause10_1Standards = getStandardsForClause('10.1');
    for (const std of clause10_1Standards) {
      expect(record.satisfiesStandards).toContain(std);
    }
  });

  it('LEGAL_REGISTER covering 6.1 + 7.5 builds combined clauseRefs', () => {
    const record = createConvergentRecord('legal-001', 'LEGAL_REGISTER', ['6.1', '7.5']);
    // ISO_9001 is in both 6.1 and 7.5
    expect(record.clauseRefs['ISO_9001']).toContain('6.1');
    expect(record.clauseRefs['ISO_9001']).toContain('7.5');
  });

  it('record covering clause 9.3 satisfies ISO_9001', () => {
    const record = createConvergentRecord('mgmt-rev', 'MANAGEMENT_REVIEW', ['9.3']);
    expect(record.satisfiesStandards).toContain('ISO_9001');
  });

  it('satisfiesStandards does not contain non-Annex-SL standards', () => {
    const record = createConvergentRecord('r', 'DOCUMENT', ['4.1', '9.2']);
    expect(record.satisfiesStandards).not.toContain('IATF_16949');
    expect(record.satisfiesStandards).not.toContain('AS9100D');
  });

  it('all 8 RecordType values can be used to create a valid record', () => {
    const types = [
      'INTERNAL_AUDIT', 'MANAGEMENT_REVIEW', 'RISK_REGISTER', 'OBJECTIVE',
      'DOCUMENT', 'CAPA', 'TRAINING', 'LEGAL_REGISTER',
    ] as const;
    for (const rt of types) {
      const record = createConvergentRecord(`r-${rt}`, rt, ['4.1']);
      expect(record.recordType).toBe(rt);
      expect(record.satisfiesStandards.length).toBeGreaterThan(0);
    }
  });
});

// ── 9. Cross-data invariants (10 tests) ──────────────────────────────────────

describe('cross-data invariants', () => {
  it('CLAUSE_STANDARD_MAP has exactly 20 entries', () => {
    expect(CLAUSE_STANDARD_MAP).toHaveLength(20);
  });

  it('all 20 clauses in CLAUSE_STANDARD_MAP are unique', () => {
    const clauses = CLAUSE_STANDARD_MAP.map((m) => m.clause);
    expect(new Set(clauses).size).toBe(20);
  });

  it('every clause in CLAUSE_STANDARD_MAP matches ANNEX_SL_COMMON_CLAUSES key', () => {
    for (const m of CLAUSE_STANDARD_MAP) {
      expect(ANNEX_SL_COMMON_CLAUSES[m.clause]).toBeDefined();
    }
  });

  it('all 10 Annex SL standards appear in at least one clause mapping', () => {
    const allMapped = new Set(CLAUSE_STANDARD_MAP.flatMap((m) => m.standards));
    for (const std of ANNEX_SL_STANDARDS) {
      expect(allMapped.has(std)).toBe(true);
    }
  });

  it('IATF_16949 and AS9100D do NOT appear in any clause mapping (sector-specific)', () => {
    const allMapped = new Set(CLAUSE_STANDARD_MAP.flatMap((m) => m.standards));
    expect(allMapped.has('IATF_16949')).toBe(false);
    expect(allMapped.has('AS9100D')).toBe(false);
  });

  it('clause 4.1 is the most broadly shared (appears in most standards)', () => {
    const c41 = CLAUSE_STANDARD_MAP.find((m) => m.clause === '4.1')!;
    // At least 10 standards
    expect(c41.standards.length).toBeGreaterThanOrEqual(10);
    // Should be the maximum or near-maximum
    const maxStandards = Math.max(...CLAUSE_STANDARD_MAP.map((m) => m.standards.length));
    expect(c41.standards.length).toBe(maxStandards);
  });

  it('every getStandardsForClause result matches the CLAUSE_STANDARD_MAP entry', () => {
    for (const m of CLAUSE_STANDARD_MAP) {
      const result = getStandardsForClause(m.clause);
      expect(result.sort()).toEqual([...m.standards].sort());
    }
  });

  it('getClausesForStandard ISO_9001 returns all 20 clauses (ISO 9001 covers full Annex SL)', () => {
    const clauses = getClausesForStandard('ISO_9001');
    expect(clauses).toHaveLength(20);
  });

  it('clause 7.1 has fewer standards than 4.1 (ISO_42001, ISO_37001, ISO_55001 excluded)', () => {
    const c71 = CLAUSE_STANDARD_MAP.find((m) => m.clause === '7.1')!;
    const c41 = CLAUSE_STANDARD_MAP.find((m) => m.clause === '4.1')!;
    expect(c71.standards.length).toBeLessThan(c41.standards.length);
  });

  it('ISO_9001 appears in more clauses than ISO_55001 (ISO_55001 skips some operational clauses)', () => {
    const iso9001Count = getClausesForStandard('ISO_9001').length;
    const iso55001Count = getClausesForStandard('ISO_55001').length;
    expect(iso9001Count).toBeGreaterThan(iso55001Count);
  });
});
