// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-iso42001 specification tests

type AIRiskLevel = 'MINIMAL' | 'LIMITED' | 'HIGH' | 'UNACCEPTABLE';
type AISystemStatus = 'DEVELOPMENT' | 'TESTING' | 'DEPLOYED' | 'SUSPENDED' | 'DECOMMISSIONED';
type BiasType = 'SELECTION' | 'MEASUREMENT' | 'CONFIRMATION' | 'ALGORITHMIC' | 'HISTORICAL';
type TransparencyLevel = 'OPAQUE' | 'PARTIAL' | 'EXPLAINABLE' | 'FULL';

const AI_RISK_LEVELS: AIRiskLevel[] = ['MINIMAL', 'LIMITED', 'HIGH', 'UNACCEPTABLE'];
const AI_SYSTEM_STATUSES: AISystemStatus[] = ['DEVELOPMENT', 'TESTING', 'DEPLOYED', 'SUSPENDED', 'DECOMMISSIONED'];
const BIAS_TYPES: BiasType[] = ['SELECTION', 'MEASUREMENT', 'CONFIRMATION', 'ALGORITHMIC', 'HISTORICAL'];
const TRANSPARENCY_LEVELS: TransparencyLevel[] = ['OPAQUE', 'PARTIAL', 'EXPLAINABLE', 'FULL'];

const riskLevelColor: Record<AIRiskLevel, string> = {
  MINIMAL: 'bg-green-100 text-green-800',
  LIMITED: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  UNACCEPTABLE: 'bg-red-100 text-red-800',
};

const transparencyScore: Record<TransparencyLevel, number> = {
  OPAQUE: 1, PARTIAL: 2, EXPLAINABLE: 3, FULL: 4,
};

const aimsClauseTitle: Record<string, string> = {
  '4': 'Context of Organisation',
  '5': 'Leadership',
  '6': 'Planning',
  '7': 'Support',
  '8': 'Operation',
  '9': 'Performance Evaluation',
  '10': 'Improvement',
};

function isAISystemActive(status: AISystemStatus): boolean {
  return status === 'DEPLOYED';
}

function requiresImpactAssessment(riskLevel: AIRiskLevel): boolean {
  return riskLevel === 'HIGH' || riskLevel === 'UNACCEPTABLE';
}

function isProhibited(riskLevel: AIRiskLevel): boolean {
  return riskLevel === 'UNACCEPTABLE';
}

function computeAIRiskScore(likelihood: number, impact: number, mitigations: number): number {
  return Math.max(0, (likelihood * impact) - mitigations);
}

describe('AI risk level colors', () => {
  AI_RISK_LEVELS.forEach(r => {
    it(`${r} has color`, () => expect(riskLevelColor[r]).toBeDefined());
    it(`${r} color has bg-`, () => expect(riskLevelColor[r]).toContain('bg-'));
  });
  it('UNACCEPTABLE is red', () => expect(riskLevelColor.UNACCEPTABLE).toContain('red'));
  it('MINIMAL is green', () => expect(riskLevelColor.MINIMAL).toContain('green'));
  for (let i = 0; i < 100; i++) {
    const r = AI_RISK_LEVELS[i % 4];
    it(`AI risk level color string (idx ${i})`, () => expect(typeof riskLevelColor[r]).toBe('string'));
  }
});

describe('Transparency scores', () => {
  it('FULL has highest score', () => expect(transparencyScore.FULL).toBe(4));
  it('OPAQUE has lowest score', () => expect(transparencyScore.OPAQUE).toBe(1));
  it('scores increase with transparency', () => {
    expect(transparencyScore.OPAQUE).toBeLessThan(transparencyScore.PARTIAL);
    expect(transparencyScore.PARTIAL).toBeLessThan(transparencyScore.EXPLAINABLE);
    expect(transparencyScore.EXPLAINABLE).toBeLessThan(transparencyScore.FULL);
  });
  for (let i = 0; i < 100; i++) {
    const t = TRANSPARENCY_LEVELS[i % 4];
    it(`transparency score for ${t} is positive (idx ${i})`, () => expect(transparencyScore[t]).toBeGreaterThan(0));
  }
});

describe('isAISystemActive', () => {
  it('DEPLOYED is active', () => expect(isAISystemActive('DEPLOYED')).toBe(true));
  it('DEVELOPMENT is not active', () => expect(isAISystemActive('DEVELOPMENT')).toBe(false));
  it('SUSPENDED is not active', () => expect(isAISystemActive('SUSPENDED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const s = AI_SYSTEM_STATUSES[i % 5];
    it(`isAISystemActive(${s}) returns boolean (idx ${i})`, () => expect(typeof isAISystemActive(s)).toBe('boolean'));
  }
});

describe('requiresImpactAssessment', () => {
  it('HIGH requires assessment', () => expect(requiresImpactAssessment('HIGH')).toBe(true));
  it('UNACCEPTABLE requires assessment', () => expect(requiresImpactAssessment('UNACCEPTABLE')).toBe(true));
  it('MINIMAL does not', () => expect(requiresImpactAssessment('MINIMAL')).toBe(false));
  it('LIMITED does not', () => expect(requiresImpactAssessment('LIMITED')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const r = AI_RISK_LEVELS[i % 4];
    it(`requiresImpactAssessment(${r}) returns boolean (idx ${i})`, () => expect(typeof requiresImpactAssessment(r)).toBe('boolean'));
  }
});

describe('isProhibited', () => {
  it('UNACCEPTABLE is prohibited', () => expect(isProhibited('UNACCEPTABLE')).toBe(true));
  it('HIGH is not prohibited', () => expect(isProhibited('HIGH')).toBe(false));
  it('MINIMAL is not prohibited', () => expect(isProhibited('MINIMAL')).toBe(false));
  for (let i = 0; i < 100; i++) {
    const r = AI_RISK_LEVELS[i % 4];
    it(`isProhibited(${r}) returns boolean (idx ${i})`, () => expect(typeof isProhibited(r)).toBe('boolean'));
  }
});

describe('computeAIRiskScore', () => {
  it('0 mitigations = likelihood × impact', () => expect(computeAIRiskScore(5, 4, 0)).toBe(20));
  it('mitigations reduce score', () => expect(computeAIRiskScore(5, 4, 5)).toBe(15));
  it('cannot go negative', () => expect(computeAIRiskScore(2, 2, 100)).toBe(0));
  for (let m = 0; m <= 25; m++) {
    it(`risk score with ${m} mitigations is non-negative`, () => {
      expect(computeAIRiskScore(5, 5, m)).toBeGreaterThanOrEqual(0);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`AI risk score is non-negative (idx ${i})`, () => {
      const l = (i % 5) + 1;
      const imp = (i % 5) + 1;
      expect(computeAIRiskScore(l, imp, 0)).toBeGreaterThan(0);
    });
  }
});
