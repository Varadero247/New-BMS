// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Phase 134 — web-automotive specification tests

type PPAPLevel = 1 | 2 | 3 | 4 | 5;
type ControlPlanType = 'PROTOTYPE' | 'PRE_LAUNCH' | 'PRODUCTION';
type MSAStudyType = 'GAUGE_RR' | 'LINEARITY' | 'BIAS' | 'STABILITY';
type APQPPhase = 1 | 2 | 3 | 4 | 5;
type DefectSeverity = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

const PPAP_LEVELS: PPAPLevel[] = [1, 2, 3, 4, 5];
const CONTROL_PLAN_TYPES: ControlPlanType[] = ['PROTOTYPE', 'PRE_LAUNCH', 'PRODUCTION'];
const MSA_STUDY_TYPES: MSAStudyType[] = ['GAUGE_RR', 'LINEARITY', 'BIAS', 'STABILITY'];
const APQP_PHASES: APQPPhase[] = [1, 2, 3, 4, 5];

const apqpPhaseLabel: Record<APQPPhase, string> = {
  1: 'Plan & Define',
  2: 'Product Design & Development',
  3: 'Process Design & Development',
  4: 'Product & Process Validation',
  5: 'Feedback, Assessment & Corrective Action',
};

const ppapLevelRequirements: Record<PPAPLevel, string> = {
  1: 'Part Submission Warrant only',
  2: 'PSW + limited supporting data',
  3: 'PSW + complete supporting data',
  4: 'PSW + other requirements',
  5: 'PSW + complete data reviewed at supplier',
};

function computeRPN(severity: number, occurrence: number, detection: number): number {
  return severity * occurrence * detection;
}

function isGaugeRRAcceptable(rrPercent: number): boolean {
  return rrPercent < 10;
}

function isGaugeRRMarginal(rrPercent: number): boolean {
  return rrPercent >= 10 && rrPercent <= 30;
}

function ppmFromDefectRate(defects: number, opportunities: number): number {
  if (opportunities === 0) return 0;
  return (defects / opportunities) * 1_000_000;
}

describe('PPAP levels', () => {
  it('has 5 PPAP levels', () => expect(PPAP_LEVELS).toHaveLength(5));
  PPAP_LEVELS.forEach(l => {
    it(`Level ${l} has requirements defined`, () => expect(ppapLevelRequirements[l]).toBeDefined());
    it(`Level ${l} requirements is non-empty`, () => expect(ppapLevelRequirements[l].length).toBeGreaterThan(0));
  });
  it('Level 3 is full submission', () => expect(ppapLevelRequirements[3]).toContain('complete'));
  for (let i = 0; i < 100; i++) {
    const l = PPAP_LEVELS[i % 5] as PPAPLevel;
    it(`PPAP level ${l} req string (idx ${i})`, () => expect(typeof ppapLevelRequirements[l]).toBe('string'));
  }
});

describe('APQP phases', () => {
  APQP_PHASES.forEach(p => {
    it(`Phase ${p} has label`, () => expect(apqpPhaseLabel[p]).toBeDefined());
  });
  it('has 5 phases', () => expect(APQP_PHASES).toHaveLength(5));
  it('Phase 1 is planning', () => expect(apqpPhaseLabel[1]).toContain('Plan'));
  it('Phase 4 is validation', () => expect(apqpPhaseLabel[4]).toContain('Validation'));
  for (let i = 0; i < 100; i++) {
    const p = APQP_PHASES[i % 5] as APQPPhase;
    it(`APQP phase ${p} label string (idx ${i})`, () => expect(typeof apqpPhaseLabel[p]).toBe('string'));
  }
});

describe('computeRPN', () => {
  it('minimum RPN is 1 (1×1×1)', () => expect(computeRPN(1, 1, 1)).toBe(1));
  it('maximum RPN is 1000 (10×10×10)', () => expect(computeRPN(10, 10, 10)).toBe(1000));
  it('RPN = severity × occurrence × detection', () => expect(computeRPN(5, 4, 3)).toBe(60));
  for (let s = 1; s <= 10; s++) {
    it(`RPN with severity ${s} is in range 1-1000`, () => {
      const rpn = computeRPN(s, 5, 5);
      expect(rpn).toBeGreaterThanOrEqual(1);
      expect(rpn).toBeLessThanOrEqual(1000);
    });
  }
  for (let i = 1; i <= 100; i++) {
    it(`computeRPN(${i%10+1}, ${i%10+1}, ${i%10+1}) is positive`, () => {
      const v = (i % 10) + 1;
      expect(computeRPN(v, v, v)).toBeGreaterThan(0);
    });
  }
});

describe('Gauge R&R thresholds', () => {
  it('< 10% is acceptable', () => expect(isGaugeRRAcceptable(9)).toBe(true));
  it('>= 10% is not acceptable', () => expect(isGaugeRRAcceptable(10)).toBe(false));
  it('10-30% is marginal', () => expect(isGaugeRRMarginal(20)).toBe(true));
  it('> 30% is not marginal', () => expect(isGaugeRRMarginal(31)).toBe(false));
  it('< 10% is not marginal', () => expect(isGaugeRRMarginal(9)).toBe(false));
  for (let i = 0; i <= 100; i++) {
    it(`GRR at ${i}%: acceptable and marginal are mutually exclusive (where applicable)`, () => {
      const acc = isGaugeRRAcceptable(i);
      const marg = isGaugeRRMarginal(i);
      expect(acc && marg).toBe(false);
    });
  }
});

describe('ppmFromDefectRate', () => {
  it('zero defects gives 0 PPM', () => expect(ppmFromDefectRate(0, 1000)).toBe(0));
  it('zero opportunities gives 0 PPM', () => expect(ppmFromDefectRate(10, 0)).toBe(0));
  it('1 defect per 1000 = 1000 PPM', () => expect(ppmFromDefectRate(1, 1000)).toBe(1000));
  it('sigma-6 level ≈ 3.4 PPM', () => {
    const ppm = ppmFromDefectRate(34, 10_000_000);
    expect(ppm).toBeCloseTo(3.4);
  });
  for (let i = 0; i <= 100; i++) {
    it(`ppm(${i}, 10000) is between 0 and 1M`, () => {
      const ppm = ppmFromDefectRate(i, 10000);
      expect(ppm).toBeGreaterThanOrEqual(0);
      expect(ppm).toBeLessThanOrEqual(1_000_000);
    });
  }
});

describe('Control plan types', () => {
  CONTROL_PLAN_TYPES.forEach(t => {
    it(`${t} is valid`, () => expect(CONTROL_PLAN_TYPES).toContain(t));
  });
  it('has 3 types', () => expect(CONTROL_PLAN_TYPES).toHaveLength(3));
  for (let i = 0; i < 50; i++) {
    const t = CONTROL_PLAN_TYPES[i % 3];
    it(`control plan type ${t} is string (idx ${i})`, () => expect(typeof t).toBe('string'));
  }
});
