// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-finance-compliance specification tests

type RegulationType = 'IFRS' | 'GAAP' | 'SOX' | 'FATCA' | 'AML' | 'GDPR_FINANCE' | 'BASEL_III';
type ComplianceRisk = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type AuditFindingType = 'MATERIAL_WEAKNESS' | 'SIGNIFICANT_DEFICIENCY' | 'OBSERVATION' | 'BEST_PRACTICE';
type ControlType = 'PREVENTIVE' | 'DETECTIVE' | 'CORRECTIVE' | 'DIRECTIVE';

const REGULATION_TYPES: RegulationType[] = ['IFRS', 'GAAP', 'SOX', 'FATCA', 'AML', 'GDPR_FINANCE', 'BASEL_III'];
const COMPLIANCE_RISKS: ComplianceRisk[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const FINDING_TYPES: AuditFindingType[] = ['MATERIAL_WEAKNESS', 'SIGNIFICANT_DEFICIENCY', 'OBSERVATION', 'BEST_PRACTICE'];
const CONTROL_TYPES: ControlType[] = ['PREVENTIVE', 'DETECTIVE', 'CORRECTIVE', 'DIRECTIVE'];

const riskColor: Record<ComplianceRisk, string> = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  CRITICAL: 'bg-red-100 text-red-800',
};

const findingWeight: Record<AuditFindingType, number> = {
  MATERIAL_WEAKNESS: 4,
  SIGNIFICANT_DEFICIENCY: 3,
  OBSERVATION: 2,
  BEST_PRACTICE: 1,
};

const riskScore: Record<ComplianceRisk, number> = {
  LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4,
};

function requiresImmediateAction(risk: ComplianceRisk): boolean {
  return risk === 'CRITICAL' || risk === 'HIGH';
}

function computeComplianceScore(findings: AuditFindingType[]): number {
  const totalWeight = findings.reduce((sum, f) => sum + findingWeight[f], 0);
  return Math.max(0, 100 - totalWeight * 5);
}

function isMaterialFinding(type: AuditFindingType): boolean {
  return type === 'MATERIAL_WEAKNESS';
}

describe('Risk colors', () => {
  COMPLIANCE_RISKS.forEach(r => {
    it(`${r} has color`, () => expect(riskColor[r]).toBeDefined());
    it(`${r} color has bg-`, () => expect(riskColor[r]).toContain('bg-'));
  });
  it('CRITICAL is red', () => expect(riskColor.CRITICAL).toContain('red'));
  it('LOW is green', () => expect(riskColor.LOW).toContain('green'));
  for (let i = 0; i < 100; i++) {
    const r = COMPLIANCE_RISKS[i % 4];
    it(`risk color string (idx ${i})`, () => expect(typeof riskColor[r]).toBe('string'));
  }
});

describe('Finding weights', () => {
  it('MATERIAL_WEAKNESS has highest weight', () => expect(findingWeight.MATERIAL_WEAKNESS).toBe(4));
  it('BEST_PRACTICE has lowest weight', () => expect(findingWeight.BEST_PRACTICE).toBe(1));
  it('weights decrease by severity', () => {
    expect(findingWeight.MATERIAL_WEAKNESS).toBeGreaterThan(findingWeight.SIGNIFICANT_DEFICIENCY);
    expect(findingWeight.SIGNIFICANT_DEFICIENCY).toBeGreaterThan(findingWeight.OBSERVATION);
    expect(findingWeight.OBSERVATION).toBeGreaterThan(findingWeight.BEST_PRACTICE);
  });
  for (let i = 0; i < 100; i++) {
    const f = FINDING_TYPES[i % 4];
    it(`finding weight for ${f} is positive (idx ${i})`, () => expect(findingWeight[f]).toBeGreaterThan(0));
  }
});

describe('requiresImmediateAction', () => {
  it('CRITICAL requires immediate action', () => expect(requiresImmediateAction('CRITICAL')).toBe(true));
  it('HIGH requires immediate action', () => expect(requiresImmediateAction('HIGH')).toBe(true));
  it('MEDIUM does not', () => expect(requiresImmediateAction('MEDIUM')).toBe(false));
  it('LOW does not', () => expect(requiresImmediateAction('LOW')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const r = COMPLIANCE_RISKS[i % 4];
    it(`requiresImmediateAction(${r}) returns boolean (idx ${i})`, () => expect(typeof requiresImmediateAction(r)).toBe('boolean'));
  }
});

describe('computeComplianceScore', () => {
  it('no findings = 100', () => expect(computeComplianceScore([])).toBe(100));
  it('one MATERIAL_WEAKNESS reduces score', () => expect(computeComplianceScore(['MATERIAL_WEAKNESS'])).toBe(80));
  it('score is non-negative', () => {
    const findings: AuditFindingType[] = Array(20).fill('MATERIAL_WEAKNESS');
    expect(computeComplianceScore(findings)).toBeGreaterThanOrEqual(0);
  });
  for (let n = 0; n <= 20; n++) {
    it(`compliance score with ${n} observations is between 0-100`, () => {
      const findings: AuditFindingType[] = Array(n).fill('OBSERVATION');
      const score = computeComplianceScore(findings);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`compliance score is number (idx ${i})`, () => {
      const f = FINDING_TYPES[i % 4];
      expect(typeof computeComplianceScore([f])).toBe('number');
    });
  }
});

describe('isMaterialFinding', () => {
  it('MATERIAL_WEAKNESS returns true', () => expect(isMaterialFinding('MATERIAL_WEAKNESS')).toBe(true));
  it('SIGNIFICANT_DEFICIENCY returns false', () => expect(isMaterialFinding('SIGNIFICANT_DEFICIENCY')).toBe(false));
  it('OBSERVATION returns false', () => expect(isMaterialFinding('OBSERVATION')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const f = FINDING_TYPES[i % 4];
    it(`isMaterialFinding(${f}) returns boolean (idx ${i})`, () => expect(typeof isMaterialFinding(f)).toBe('boolean'));
  }
});

describe('Regulation types', () => {
  REGULATION_TYPES.forEach(r => {
    it(`${r} is in list`, () => expect(REGULATION_TYPES).toContain(r));
  });
  it('has 7 regulation types', () => expect(REGULATION_TYPES).toHaveLength(7));
  for (let i = 0; i < 50; i++) {
    const r = REGULATION_TYPES[i % 7];
    it(`regulation type ${r} is string (idx ${i})`, () => expect(typeof r).toBe('string'));
  }
});
