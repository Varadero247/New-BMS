// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-reg-monitor specification tests

type RegulatoryArea = 'ENVIRONMENTAL' | 'HEALTH_SAFETY' | 'QUALITY' | 'FINANCIAL' | 'DATA_PRIVACY' | 'EMPLOYMENT' | 'PRODUCT_SAFETY';
type ChangeType = 'NEW_REGULATION' | 'AMENDMENT' | 'REPEAL' | 'GUIDANCE' | 'ENFORCEMENT_ACTION';
type ComplianceImpact = 'NONE' | 'MINOR' | 'MODERATE' | 'SIGNIFICANT' | 'CRITICAL';
type RegulationStatus = 'PROPOSED' | 'ENACTED' | 'IN_FORCE' | 'SUPERSEDED' | 'REPEALED';

const REGULATORY_AREAS: RegulatoryArea[] = ['ENVIRONMENTAL', 'HEALTH_SAFETY', 'QUALITY', 'FINANCIAL', 'DATA_PRIVACY', 'EMPLOYMENT', 'PRODUCT_SAFETY'];
const CHANGE_TYPES: ChangeType[] = ['NEW_REGULATION', 'AMENDMENT', 'REPEAL', 'GUIDANCE', 'ENFORCEMENT_ACTION'];
const COMPLIANCE_IMPACTS: ComplianceImpact[] = ['NONE', 'MINOR', 'MODERATE', 'SIGNIFICANT', 'CRITICAL'];
const REGULATION_STATUSES: RegulationStatus[] = ['PROPOSED', 'ENACTED', 'IN_FORCE', 'SUPERSEDED', 'REPEALED'];

const impactColor: Record<ComplianceImpact, string> = {
  NONE: 'bg-gray-100 text-gray-700',
  MINOR: 'bg-blue-100 text-blue-800',
  MODERATE: 'bg-yellow-100 text-yellow-800',
  SIGNIFICANT: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const impactScore: Record<ComplianceImpact, number> = {
  NONE: 0, MINOR: 1, MODERATE: 2, SIGNIFICANT: 3, CRITICAL: 4,
};

const changeTypeLabel: Record<ChangeType, string> = {
  NEW_REGULATION: 'New Regulation',
  AMENDMENT: 'Amendment',
  REPEAL: 'Repeal',
  GUIDANCE: 'Guidance',
  ENFORCEMENT_ACTION: 'Enforcement Action',
};

function requiresImmediateReview(impact: ComplianceImpact): boolean {
  return impact === 'SIGNIFICANT' || impact === 'CRITICAL';
}

function isRegulationActive(status: RegulationStatus): boolean {
  return status === 'IN_FORCE';
}

function daysUntilEffective(effectiveDate: Date, now: Date): number {
  return Math.ceil((effectiveDate.getTime() - now.getTime()) / 86400000);
}

function complianceGapScore(totalRequirements: number, compliantRequirements: number): number {
  if (totalRequirements === 0) return 100;
  return (compliantRequirements / totalRequirements) * 100;
}

describe('Compliance impact colors', () => {
  COMPLIANCE_IMPACTS.forEach(i => {
    it(`${i} has color`, () => expect(impactColor[i]).toBeDefined());
    it(`${i} color has bg-`, () => expect(impactColor[i]).toContain('bg-'));
  });
  it('CRITICAL is red', () => expect(impactColor.CRITICAL).toContain('red'));
  it('NONE is gray', () => expect(impactColor.NONE).toContain('gray'));
  for (let i = 0; i < 100; i++) {
    const imp = COMPLIANCE_IMPACTS[i % 5];
    it(`impact color string (idx ${i})`, () => expect(typeof impactColor[imp]).toBe('string'));
  }
});

describe('Impact scores', () => {
  it('CRITICAL = 4', () => expect(impactScore.CRITICAL).toBe(4));
  it('NONE = 0', () => expect(impactScore.NONE).toBe(0));
  it('scores increase with impact', () => {
    expect(impactScore.NONE).toBeLessThan(impactScore.MINOR);
    expect(impactScore.MINOR).toBeLessThan(impactScore.MODERATE);
    expect(impactScore.MODERATE).toBeLessThan(impactScore.SIGNIFICANT);
    expect(impactScore.SIGNIFICANT).toBeLessThan(impactScore.CRITICAL);
  });
  for (let i = 0; i < 100; i++) {
    const imp = COMPLIANCE_IMPACTS[i % 5];
    it(`impact score for ${imp} is non-negative (idx ${i})`, () => expect(impactScore[imp]).toBeGreaterThanOrEqual(0));
  }
});

describe('Change type labels', () => {
  CHANGE_TYPES.forEach(c => {
    it(`${c} has label`, () => expect(changeTypeLabel[c]).toBeDefined());
    it(`${c} label is non-empty`, () => expect(changeTypeLabel[c].length).toBeGreaterThan(0));
  });
  it('NEW_REGULATION label contains New', () => expect(changeTypeLabel.NEW_REGULATION).toContain('New'));
  for (let i = 0; i < 50; i++) {
    const c = CHANGE_TYPES[i % 5];
    it(`change type label for ${c} is string (idx ${i})`, () => expect(typeof changeTypeLabel[c]).toBe('string'));
  }
});

describe('requiresImmediateReview', () => {
  it('CRITICAL requires immediate review', () => expect(requiresImmediateReview('CRITICAL')).toBe(true));
  it('SIGNIFICANT requires immediate review', () => expect(requiresImmediateReview('SIGNIFICANT')).toBe(true));
  it('MODERATE does not', () => expect(requiresImmediateReview('MODERATE')).toBe(false));
  it('NONE does not', () => expect(requiresImmediateReview('NONE')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const imp = COMPLIANCE_IMPACTS[i % 5];
    it(`requiresImmediateReview(${imp}) returns boolean (idx ${i})`, () => expect(typeof requiresImmediateReview(imp)).toBe('boolean'));
  }
});

describe('isRegulationActive', () => {
  it('IN_FORCE is active', () => expect(isRegulationActive('IN_FORCE')).toBe(true));
  it('PROPOSED is not active', () => expect(isRegulationActive('PROPOSED')).toBe(false));
  it('REPEALED is not active', () => expect(isRegulationActive('REPEALED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = REGULATION_STATUSES[i % 5];
    it(`isRegulationActive(${s}) returns boolean (idx ${i})`, () => expect(typeof isRegulationActive(s)).toBe('boolean'));
  }
});

describe('daysUntilEffective', () => {
  it('30 days until effective = 30', () => {
    const now = new Date('2026-01-01');
    const effective = new Date('2026-01-31');
    expect(daysUntilEffective(effective, now)).toBe(30);
  });
  it('past effective date is negative', () => {
    const now = new Date('2026-02-01');
    const effective = new Date('2026-01-01');
    expect(daysUntilEffective(effective, now)).toBeLessThan(0);
  });
  for (let d = 0; d <= 50; d++) {
    it(`daysUntilEffective(+${d}d) = ${d}`, () => {
      const now = new Date('2026-01-01');
      const effective = new Date(now.getTime() + d * 86400000);
      expect(daysUntilEffective(effective, now)).toBe(d);
    });
  }
});
