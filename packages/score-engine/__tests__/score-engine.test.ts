import {
  normalise,
  clampScore,
  gradeFromScore,
  levelFromScore,
  computeScoreResult,
  aggregateWeightedAverage,
  aggregateSum,
  aggregateMin,
  aggregateMax,
  aggregateGeometricMean,
  aggregate,
  computeAssessment,
  isValidGrade,
  isValidLevel,
  isValidAggregation,
  makeCriteria,
  makeInput,
  makeConfig,
  totalCriteriaWeight,
  DEFAULT_THRESHOLDS,
  ScoreGrade,
  ScoreLevel,
  AggregationMethod,
  ScoreCriteria,
  ScoreInput,
  ScoreResult,
  ScoreConfig,
} from '../src/index';

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------
function crit(id: string, weight: number, maxScore: number): ScoreCriteria {
  return { id, name: `Criteria ${id}`, weight, maxScore };
}

function inp(criteriaId: string, rawScore: number): ScoreInput {
  return { criteriaId, rawScore };
}

function res(criteriaId: string, rawScore: number, normalised: number, weighted: number): ScoreResult {
  return { criteriaId, rawScore, normalised, weighted };
}

const defaultConfig: ScoreConfig = {
  thresholds: DEFAULT_THRESHOLDS,
  aggregationMethod: 'weighted_average',
};

// ===========================================================================
// 1. DEFAULT_THRESHOLDS
// ===========================================================================
describe('DEFAULT_THRESHOLDS', () => {
  it('excellent is 90', () => expect(DEFAULT_THRESHOLDS.excellent).toBe(90));
  it('good is 75', () => expect(DEFAULT_THRESHOLDS.good).toBe(75));
  it('acceptable is 60', () => expect(DEFAULT_THRESHOLDS.acceptable).toBe(60));
  it('poor is 40', () => expect(DEFAULT_THRESHOLDS.poor).toBe(40));
  it('is an object', () => expect(typeof DEFAULT_THRESHOLDS).toBe('object'));
  it('has exactly 4 keys', () => expect(Object.keys(DEFAULT_THRESHOLDS).length).toBe(4));
  it('excellent > good', () => expect(DEFAULT_THRESHOLDS.excellent).toBeGreaterThan(DEFAULT_THRESHOLDS.good));
  it('good > acceptable', () => expect(DEFAULT_THRESHOLDS.good).toBeGreaterThan(DEFAULT_THRESHOLDS.acceptable));
  it('acceptable > poor', () => expect(DEFAULT_THRESHOLDS.acceptable).toBeGreaterThan(DEFAULT_THRESHOLDS.poor));
  it('poor >= 0', () => expect(DEFAULT_THRESHOLDS.poor).toBeGreaterThanOrEqual(0));
  it('excellent <= 100', () => expect(DEFAULT_THRESHOLDS.excellent).toBeLessThanOrEqual(100));
});

// ===========================================================================
// 2. normalise
// ===========================================================================
describe('normalise', () => {
  // max <= 0 edge cases
  it('max=0 returns 0', () => expect(normalise(0, 0)).toBe(0));
  it('max=-1 returns 0', () => expect(normalise(5, -1)).toBe(0));
  it('max=-100 returns 0', () => expect(normalise(100, -100)).toBe(0));
  it('max=0 with raw=0 returns 0', () => expect(normalise(0, 0)).toBe(0));
  it('max=0 with raw=50 returns 0', () => expect(normalise(50, 0)).toBe(0));

  // raw = 0
  it('raw=0, max=10 returns 0', () => expect(normalise(0, 10)).toBe(0));
  it('raw=0, max=100 returns 0', () => expect(normalise(0, 100)).toBe(0));
  it('raw=0, max=1 returns 0', () => expect(normalise(0, 1)).toBe(0));

  // raw = max
  it('raw=max returns 1 (max=10)', () => expect(normalise(10, 10)).toBe(1));
  it('raw=max returns 1 (max=100)', () => expect(normalise(100, 100)).toBe(1));
  it('raw=max returns 1 (max=5)', () => expect(normalise(5, 5)).toBe(1));
  it('raw=max returns 1 (max=1)', () => expect(normalise(1, 1)).toBe(1));
  it('raw=max returns 1 (max=50)', () => expect(normalise(50, 50)).toBe(1));

  // raw > max — clamped to 1
  it('raw > max clamped to 1 (11/10)', () => expect(normalise(11, 10)).toBe(1));
  it('raw > max clamped to 1 (200/100)', () => expect(normalise(200, 100)).toBe(1));
  it('raw > max clamped to 1 (999/1)', () => expect(normalise(999, 1)).toBe(1));
  it('raw > max clamped to 1 (101/100)', () => expect(normalise(101, 100)).toBe(1));

  // raw < 0 — clamped to 0
  it('raw < 0 clamped to 0 (-1/10)', () => expect(normalise(-1, 10)).toBe(0));
  it('raw < 0 clamped to 0 (-100/100)', () => expect(normalise(-100, 100)).toBe(0));
  it('raw < 0 clamped to 0 (-0.1/1)', () => expect(normalise(-0.1, 1)).toBe(0));

  // exact ratios
  it('5/10 = 0.5', () => expect(normalise(5, 10)).toBe(0.5));
  it('25/100 = 0.25', () => expect(normalise(25, 100)).toBe(0.25));
  it('75/100 = 0.75', () => expect(normalise(75, 100)).toBe(0.75));
  it('1/4 = 0.25', () => expect(normalise(1, 4)).toBe(0.25));
  it('3/4 = 0.75', () => expect(normalise(3, 4)).toBe(0.75));
  it('2/5 = 0.4', () => expect(normalise(2, 5)).toBeCloseTo(0.4));
  it('1/3 ≈ 0.333', () => expect(normalise(1, 3)).toBeCloseTo(0.333, 2));
  it('2/3 ≈ 0.667', () => expect(normalise(2, 3)).toBeCloseTo(0.667, 2));
  it('7/10 = 0.7', () => expect(normalise(7, 10)).toBeCloseTo(0.7));
  it('9/10 = 0.9', () => expect(normalise(9, 10)).toBeCloseTo(0.9));

  // parameterised loop — 50 cases
  const normCases: [number, number, number][] = [
    [0, 1, 0], [1, 1, 1], [0.5, 1, 0.5], [0.1, 1, 0.1], [0.9, 1, 0.9],
    [10, 100, 0.1], [20, 100, 0.2], [30, 100, 0.3], [40, 100, 0.4], [50, 100, 0.5],
    [60, 100, 0.6], [70, 100, 0.7], [80, 100, 0.8], [90, 100, 0.9], [100, 100, 1],
    [0, 50, 0], [25, 50, 0.5], [50, 50, 1], [10, 50, 0.2], [40, 50, 0.8],
    [0, 10, 0], [5, 10, 0.5], [10, 10, 1], [1, 10, 0.1], [9, 10, 0.9],
    [0, 200, 0], [100, 200, 0.5], [200, 200, 1], [50, 200, 0.25], [150, 200, 0.75],
    [0, 4, 0], [1, 4, 0.25], [2, 4, 0.5], [3, 4, 0.75], [4, 4, 1],
    [0, 8, 0], [2, 8, 0.25], [4, 8, 0.5], [6, 8, 0.75], [8, 8, 1],
    [150, 100, 1], [-5, 100, 0], [-1, 10, 0], [11, 10, 1], [200, 100, 1],
    [0, 1000, 0], [500, 1000, 0.5], [1000, 1000, 1], [250, 1000, 0.25], [750, 1000, 0.75],
  ];
  normCases.forEach(([raw, max, expected]) => {
    it(`normalise(${raw}, ${max}) ≈ ${expected}`, () => expect(normalise(raw, max)).toBeCloseTo(expected, 5));
  });
});

// ===========================================================================
// 3. clampScore
// ===========================================================================
describe('clampScore', () => {
  const clampCases: [number, number][] = [
    [-10, 0], [-1, 0], [-0.001, 0], [0, 0],
    [0.001, 0.001], [1, 1], [10, 10], [25, 25],
    [50, 50], [75, 75], [99, 99], [99.999, 99.999],
    [100, 100], [100.001, 100], [101, 100], [200, 100],
    [1000, 100], [-1000, 0], [50.5, 50.5], [33.33, 33.33],
  ];
  clampCases.forEach(([input, expected]) => {
    it(`clampScore(${input}) → ${expected}`, () => expect(clampScore(input)).toBeCloseTo(expected, 5));
  });

  it('returns number type', () => expect(typeof clampScore(50)).toBe('number'));
  it('handles NaN-like 0', () => expect(clampScore(0)).toBe(0));
  it('exactly 100 passes through', () => expect(clampScore(100)).toBe(100));
  it('exactly 0 passes through', () => expect(clampScore(0)).toBe(0));
  it('negative infinity → 0', () => expect(clampScore(-Infinity)).toBe(0));
  it('positive infinity → 100', () => expect(clampScore(Infinity)).toBe(100));

  // large loop — 80 parameterised cases (inside 0..100 pass-through)
  for (let v = 0; v <= 100; v += 5) {
    it(`clampScore(${v}) passthrough`, () => expect(clampScore(v)).toBe(v));
  }
  // out-of-range
  [-50, -25, -10, -5, -1, -0.1].forEach(v => {
    it(`clampScore(${v}) → 0`, () => expect(clampScore(v)).toBe(0));
  });
  [100.1, 101, 110, 150, 200, 500].forEach(v => {
    it(`clampScore(${v}) → 100`, () => expect(clampScore(v)).toBe(100));
  });
});

// ===========================================================================
// 4. gradeFromScore
// ===========================================================================
describe('gradeFromScore', () => {
  const gradeMap: [number, ScoreGrade][] = [
    [100, 'A'], [90, 'A'], [95, 'A'], [99, 'A'], [90.1, 'A'],
    [89.9, 'B'], [89, 'B'], [85, 'B'], [80, 'B'], [75, 'B'], [75.5, 'B'],
    [74.9, 'C'], [74, 'C'], [70, 'C'], [65, 'C'], [60, 'C'], [60.1, 'C'],
    [59.9, 'D'], [59, 'D'], [55, 'D'], [50, 'D'], [45, 'D'], [40, 'D'], [40.1, 'D'],
    [39.9, 'F'], [39, 'F'], [30, 'F'], [20, 'F'], [10, 'F'], [1, 'F'], [0, 'F'],
  ];
  gradeMap.forEach(([score, grade]) => {
    it(`gradeFromScore(${score}) → '${grade}'`, () => expect(gradeFromScore(score)).toBe(grade));
  });

  // Out-of-range inputs get clamped first
  it('gradeFromScore(200) → A (clamped to 100)', () => expect(gradeFromScore(200)).toBe('A'));
  it('gradeFromScore(-10) → F (clamped to 0)', () => expect(gradeFromScore(-10)).toBe('F'));
  it('gradeFromScore(-100) → F', () => expect(gradeFromScore(-100)).toBe('F'));

  // Custom thresholds
  const custom = { excellent: 80, good: 60, acceptable: 40, poor: 20 };
  it('custom: 80 → A', () => expect(gradeFromScore(80, custom)).toBe('A'));
  it('custom: 79 → B', () => expect(gradeFromScore(79, custom)).toBe('B'));
  it('custom: 60 → B', () => expect(gradeFromScore(60, custom)).toBe('B'));
  it('custom: 59 → C', () => expect(gradeFromScore(59, custom)).toBe('C'));
  it('custom: 40 → C', () => expect(gradeFromScore(40, custom)).toBe('C'));
  it('custom: 39 → D', () => expect(gradeFromScore(39, custom)).toBe('D'));
  it('custom: 20 → D', () => expect(gradeFromScore(20, custom)).toBe('D'));
  it('custom: 19 → F', () => expect(gradeFromScore(19, custom)).toBe('F'));
  it('custom: 0 → F', () => expect(gradeFromScore(0, custom)).toBe('F'));

  // Return type
  it('returns string', () => expect(typeof gradeFromScore(50)).toBe('string'));
  it('returns one of A B C D F', () => {
    ['A', 'B', 'C', 'D', 'F'].includes(gradeFromScore(50));
  });

  // Boundaries with default thresholds — loop 0..100
  for (let s = 0; s <= 100; s++) {
    const expected: ScoreGrade =
      s >= 90 ? 'A' : s >= 75 ? 'B' : s >= 60 ? 'C' : s >= 40 ? 'D' : 'F';
    it(`gradeFromScore(${s}) boundary loop`, () => expect(gradeFromScore(s)).toBe(expected));
  }
});

// ===========================================================================
// 5. levelFromScore
// ===========================================================================
describe('levelFromScore', () => {
  const levelMap: [number, ScoreLevel][] = [
    [100, 'excellent'], [90, 'excellent'], [95, 'excellent'], [92, 'excellent'],
    [89, 'good'], [85, 'good'], [75, 'good'], [76, 'good'],
    [74, 'acceptable'], [70, 'acceptable'], [60, 'acceptable'], [61, 'acceptable'],
    [59, 'poor'], [55, 'poor'], [50, 'poor'], [40, 'poor'], [41, 'poor'],
    [39, 'critical'], [30, 'critical'], [20, 'critical'], [10, 'critical'], [0, 'critical'],
  ];
  levelMap.forEach(([score, level]) => {
    it(`levelFromScore(${score}) → '${level}'`, () => expect(levelFromScore(score)).toBe(level));
  });

  // Out of range
  it('200 → excellent', () => expect(levelFromScore(200)).toBe('excellent'));
  it('-5 → critical', () => expect(levelFromScore(-5)).toBe('critical'));

  // Custom thresholds
  const custom = { excellent: 80, good: 60, acceptable: 40, poor: 20 };
  it('custom: 80 → excellent', () => expect(levelFromScore(80, custom)).toBe('excellent'));
  it('custom: 60 → good', () => expect(levelFromScore(60, custom)).toBe('good'));
  it('custom: 40 → acceptable', () => expect(levelFromScore(40, custom)).toBe('acceptable'));
  it('custom: 20 → poor', () => expect(levelFromScore(20, custom)).toBe('poor'));
  it('custom: 0 → critical', () => expect(levelFromScore(0, custom)).toBe('critical'));
  it('custom: 79 → good', () => expect(levelFromScore(79, custom)).toBe('good'));
  it('custom: 59 → acceptable', () => expect(levelFromScore(59, custom)).toBe('acceptable'));
  it('custom: 39 → poor', () => expect(levelFromScore(39, custom)).toBe('poor'));
  it('custom: 19 → critical', () => expect(levelFromScore(19, custom)).toBe('critical'));

  // Loop 0..100
  for (let s = 0; s <= 100; s++) {
    const expected: ScoreLevel =
      s >= 90 ? 'excellent' : s >= 75 ? 'good' : s >= 60 ? 'acceptable' : s >= 40 ? 'poor' : 'critical';
    it(`levelFromScore(${s}) boundary loop`, () => expect(levelFromScore(s)).toBe(expected));
  }
});

// ===========================================================================
// 6. computeScoreResult
// ===========================================================================
describe('computeScoreResult', () => {
  it('criteriaId propagated', () => {
    const r = computeScoreResult(inp('c1', 5), crit('c1', 50, 10));
    expect(r.criteriaId).toBe('c1');
  });
  it('rawScore propagated', () => {
    const r = computeScoreResult(inp('c1', 7), crit('c1', 40, 10));
    expect(r.rawScore).toBe(7);
  });
  it('normalised = raw/max (5/10=0.5)', () => {
    expect(computeScoreResult(inp('c1', 5), crit('c1', 50, 10)).normalised).toBeCloseTo(0.5);
  });
  it('normalised = 1 when raw=max', () => {
    expect(computeScoreResult(inp('x', 10), crit('x', 100, 10)).normalised).toBe(1);
  });
  it('normalised = 0 when raw=0', () => {
    expect(computeScoreResult(inp('x', 0), crit('x', 100, 10)).normalised).toBe(0);
  });
  it('weighted = normalised * weight/100 (norm=0.5, w=50 → 0.25)', () => {
    const r = computeScoreResult(inp('c1', 5), crit('c1', 50, 10));
    expect(r.weighted).toBeCloseTo(0.25);
  });
  it('weighted = 0 when raw=0', () => {
    expect(computeScoreResult(inp('c1', 0), crit('c1', 100, 10)).weighted).toBe(0);
  });
  it('weighted = weight/100 when raw=max', () => {
    const r = computeScoreResult(inp('c1', 10), crit('c1', 80, 10));
    expect(r.weighted).toBeCloseTo(0.8);
  });
  it('clamped: raw > max → normalised=1', () => {
    expect(computeScoreResult(inp('x', 20), crit('x', 50, 10)).normalised).toBe(1);
  });
  it('clamped: raw < 0 → normalised=0', () => {
    expect(computeScoreResult(inp('x', -5), crit('x', 50, 10)).normalised).toBe(0);
  });

  // Parameterised loop
  const computeCases: { raw: number; max: number; weight: number }[] = [
    { raw: 0, max: 10, weight: 100 },
    { raw: 5, max: 10, weight: 100 },
    { raw: 10, max: 10, weight: 100 },
    { raw: 0, max: 10, weight: 50 },
    { raw: 5, max: 10, weight: 50 },
    { raw: 10, max: 10, weight: 50 },
    { raw: 0, max: 100, weight: 25 },
    { raw: 25, max: 100, weight: 25 },
    { raw: 50, max: 100, weight: 25 },
    { raw: 75, max: 100, weight: 25 },
    { raw: 100, max: 100, weight: 25 },
    { raw: 3, max: 6, weight: 60 },
    { raw: 1, max: 4, weight: 80 },
    { raw: 7, max: 7, weight: 100 },
    { raw: 0, max: 5, weight: 10 },
  ];
  computeCases.forEach(({ raw, max, weight }) => {
    const expectedNorm = Math.max(0, Math.min(1, raw / max));
    const expectedWeighted = expectedNorm * (weight / 100);
    it(`computeScoreResult(raw=${raw},max=${max},w=${weight}) norm≈${expectedNorm.toFixed(3)}`, () => {
      const r = computeScoreResult(inp('c', raw), crit('c', weight, max));
      expect(r.normalised).toBeCloseTo(expectedNorm, 5);
      expect(r.weighted).toBeCloseTo(expectedWeighted, 5);
    });
  });
});

// ===========================================================================
// 7. aggregateWeightedAverage
// ===========================================================================
describe('aggregateWeightedAverage', () => {
  it('empty results → 0', () => {
    expect(aggregateWeightedAverage([], [crit('c1', 50, 10)])).toBe(0);
  });
  it('empty criteria → 0 (no matching weight)', () => {
    expect(aggregateWeightedAverage([res('c1', 5, 0.5, 0.25)], [])).toBe(0);
  });
  it('single result, full score: norm=1, w=100 → 100', () => {
    const c = crit('c1', 100, 10);
    const r = computeScoreResult(inp('c1', 10), c);
    expect(aggregateWeightedAverage([r], [c])).toBeCloseTo(100);
  });
  it('single result, half score: norm=0.5, w=100 → 50', () => {
    const c = crit('c1', 100, 10);
    const r = computeScoreResult(inp('c1', 5), c);
    expect(aggregateWeightedAverage([r], [c])).toBeCloseTo(50);
  });
  it('two equal-weight criteria, both full → 100', () => {
    const c1 = crit('c1', 50, 10);
    const c2 = crit('c2', 50, 10);
    const r1 = computeScoreResult(inp('c1', 10), c1);
    const r2 = computeScoreResult(inp('c2', 10), c2);
    expect(aggregateWeightedAverage([r1, r2], [c1, c2])).toBeCloseTo(100);
  });
  it('two equal-weight criteria, both zero → 0', () => {
    const c1 = crit('c1', 50, 10);
    const c2 = crit('c2', 50, 10);
    const r1 = computeScoreResult(inp('c1', 0), c1);
    const r2 = computeScoreResult(inp('c2', 0), c2);
    expect(aggregateWeightedAverage([r1, r2], [c1, c2])).toBeCloseTo(0);
  });
  it('two equal-weight criteria, one full one zero → 50', () => {
    const c1 = crit('c1', 50, 10);
    const c2 = crit('c2', 50, 10);
    const r1 = computeScoreResult(inp('c1', 10), c1);
    const r2 = computeScoreResult(inp('c2', 0), c2);
    expect(aggregateWeightedAverage([r1, r2], [c1, c2])).toBeCloseTo(50);
  });
  it('unequal weights: w=70 full + w=30 zero → 100 (weighted avg of answered)', () => {
    const c1 = crit('c1', 70, 10);
    const c2 = crit('c2', 30, 10);
    const r1 = computeScoreResult(inp('c1', 10), c1);
    const r2 = computeScoreResult(inp('c2', 0), c2);
    // totalWeight=100, weightedSum = 1*70 + 0*30 = 70, result = 70
    expect(aggregateWeightedAverage([r1, r2], [c1, c2])).toBeCloseTo(70);
  });
  it('only one of two answered (partial completeness)', () => {
    const c1 = crit('c1', 50, 10);
    const c2 = crit('c2', 50, 10);
    const r1 = computeScoreResult(inp('c1', 10), c1);
    // r2 not answered → only c1 in results
    // totalWeight for answered = 50; weightedSum = 1*50; result = 100
    expect(aggregateWeightedAverage([r1], [c1, c2])).toBeCloseTo(100);
  });
  it('result is clamped to 100 max', () => {
    const c = crit('c1', 100, 10);
    const r = res('c1', 10, 1, 1);
    expect(aggregateWeightedAverage([r], [c])).toBeLessThanOrEqual(100);
  });
  it('result is clamped to 0 min', () => {
    const c = crit('c1', 100, 10);
    const r = res('c1', 0, 0, 0);
    expect(aggregateWeightedAverage([r], [c])).toBeGreaterThanOrEqual(0);
  });

  // Parameterised
  const waCases: { inputs: { raw: number; max: number; weight: number }[]; expected: number }[] = [
    { inputs: [{ raw: 10, max: 10, weight: 100 }], expected: 100 },
    { inputs: [{ raw: 0, max: 10, weight: 100 }], expected: 0 },
    { inputs: [{ raw: 5, max: 10, weight: 100 }], expected: 50 },
    { inputs: [{ raw: 10, max: 10, weight: 50 }, { raw: 10, max: 10, weight: 50 }], expected: 100 },
    { inputs: [{ raw: 0, max: 10, weight: 50 }, { raw: 10, max: 10, weight: 50 }], expected: 50 },
    { inputs: [{ raw: 8, max: 10, weight: 60 }, { raw: 6, max: 10, weight: 40 }], expected: 72 },
    { inputs: [{ raw: 5, max: 10, weight: 30 }, { raw: 5, max: 10, weight: 70 }], expected: 50 },
    { inputs: [{ raw: 10, max: 10, weight: 10 }, { raw: 0, max: 10, weight: 90 }], expected: 10 },
  ];
  waCases.forEach(({ inputs, expected }, i) => {
    it(`WA parameterised case ${i}: → ${expected}`, () => {
      const criteria = inputs.map((inp2, j) => crit(`c${j}`, inp2.weight, inp2.max));
      const results2 = inputs.map((inp2, j) => computeScoreResult(inp(`c${j}`, inp2.raw), criteria[j]));
      expect(aggregateWeightedAverage(results2, criteria)).toBeCloseTo(expected, 1);
    });
  });
});

// ===========================================================================
// 8. aggregateSum
// ===========================================================================
describe('aggregateSum', () => {
  it('empty → 0', () => expect(aggregateSum([])).toBe(0));
  it('single result, weighted=1 → 100', () => {
    expect(aggregateSum([res('c1', 10, 1, 1)])).toBeCloseTo(100);
  });
  it('single result, weighted=0.5 → 50', () => {
    expect(aggregateSum([res('c1', 5, 0.5, 0.5)])).toBeCloseTo(50);
  });
  it('two results summed', () => {
    expect(aggregateSum([res('c1', 10, 1, 0.5), res('c2', 10, 1, 0.5)])).toBeCloseTo(100);
  });
  it('clamped at 100', () => {
    expect(aggregateSum([res('c1', 10, 1, 1), res('c2', 10, 1, 1)])).toBe(100);
  });
  it('clamped at 0', () => {
    expect(aggregateSum([res('c1', 0, 0, 0)])).toBe(0);
  });

  // Loop parameterised
  const sumCases: { results: ScoreResult[]; expected: number }[] = [
    { results: [res('c1', 10, 0.25, 0.25)], expected: 25 },
    { results: [res('c1', 10, 0.75, 0.75)], expected: 75 },
    { results: [res('c1', 10, 0.1, 0.1), res('c2', 10, 0.2, 0.2)], expected: 30 },
    { results: [res('c1', 10, 0.3, 0.3), res('c2', 10, 0.3, 0.3)], expected: 60 },
    { results: [res('c1', 10, 0.4, 0.4), res('c2', 10, 0.4, 0.4)], expected: 80 },
    { results: [res('c1', 10, 0, 0), res('c2', 10, 0, 0)], expected: 0 },
    { results: [res('c1', 10, 1, 0.25), res('c2', 10, 1, 0.25), res('c3', 10, 1, 0.25), res('c4', 10, 1, 0.25)], expected: 100 },
    { results: [res('c1', 10, 0.5, 0.25)], expected: 25 },
  ];
  sumCases.forEach(({ results: rs, expected }, i) => {
    it(`aggregateSum case ${i} → ${expected}`, () => expect(aggregateSum(rs)).toBeCloseTo(expected, 1));
  });
});

// ===========================================================================
// 9. aggregateMin
// ===========================================================================
describe('aggregateMin', () => {
  it('empty → 0', () => expect(aggregateMin([])).toBe(0));
  it('single result norm=0.5 → 50', () => {
    expect(aggregateMin([res('c1', 5, 0.5, 0.25)])).toBeCloseTo(50);
  });
  it('single result norm=1 → 100', () => {
    expect(aggregateMin([res('c1', 10, 1, 0.5)])).toBeCloseTo(100);
  });
  it('single result norm=0 → 0', () => {
    expect(aggregateMin([res('c1', 0, 0, 0)])).toBe(0);
  });
  it('two results: returns min', () => {
    expect(aggregateMin([res('c1', 10, 0.8, 0.4), res('c2', 10, 0.3, 0.15)])).toBeCloseTo(30);
  });
  it('three results: returns min', () => {
    expect(aggregateMin([
      res('c1', 10, 0.9, 0.45),
      res('c2', 10, 0.5, 0.25),
      res('c3', 10, 0.2, 0.1),
    ])).toBeCloseTo(20);
  });
  it('all same → that value', () => {
    expect(aggregateMin([
      res('c1', 10, 0.6, 0.3),
      res('c2', 10, 0.6, 0.3),
    ])).toBeCloseTo(60);
  });
  it('clamped to 0 min', () => {
    expect(aggregateMin([res('c1', 0, 0, 0)])).toBeGreaterThanOrEqual(0);
  });
  it('clamped to 100 max', () => {
    expect(aggregateMin([res('c1', 10, 1, 1)])).toBeLessThanOrEqual(100);
  });

  // Parameterised
  const minCases: { normals: number[]; expected: number }[] = [
    { normals: [1], expected: 100 },
    { normals: [0], expected: 0 },
    { normals: [0.5], expected: 50 },
    { normals: [0.3, 0.7], expected: 30 },
    { normals: [0.9, 0.1], expected: 10 },
    { normals: [0.5, 0.5, 0.5], expected: 50 },
    { normals: [1, 0.8, 0.6, 0.4], expected: 40 },
    { normals: [0.75, 0.25], expected: 25 },
    { normals: [0.6, 0.6, 0.6], expected: 60 },
    { normals: [0.1, 0.2, 0.3], expected: 10 },
  ];
  minCases.forEach(({ normals, expected }, i) => {
    it(`aggregateMin parameterised ${i} → ${expected}`, () => {
      const rs = normals.map((n, j) => res(`c${j}`, n * 10, n, n * 0.5));
      expect(aggregateMin(rs)).toBeCloseTo(expected, 1);
    });
  });
});

// ===========================================================================
// 10. aggregateMax
// ===========================================================================
describe('aggregateMax', () => {
  it('empty → 0', () => expect(aggregateMax([])).toBe(0));
  it('single result norm=0.5 → 50', () => {
    expect(aggregateMax([res('c1', 5, 0.5, 0.25)])).toBeCloseTo(50);
  });
  it('single result norm=1 → 100', () => {
    expect(aggregateMax([res('c1', 10, 1, 0.5)])).toBeCloseTo(100);
  });
  it('single result norm=0 → 0', () => {
    expect(aggregateMax([res('c1', 0, 0, 0)])).toBe(0);
  });
  it('two results: returns max', () => {
    expect(aggregateMax([res('c1', 10, 0.3, 0.15), res('c2', 10, 0.8, 0.4)])).toBeCloseTo(80);
  });
  it('three results: returns max', () => {
    expect(aggregateMax([
      res('c1', 10, 0.2, 0.1),
      res('c2', 10, 0.5, 0.25),
      res('c3', 10, 0.9, 0.45),
    ])).toBeCloseTo(90);
  });
  it('all same → that value', () => {
    expect(aggregateMax([
      res('c1', 10, 0.4, 0.2),
      res('c2', 10, 0.4, 0.2),
    ])).toBeCloseTo(40);
  });

  // Parameterised
  const maxCases: { normals: number[]; expected: number }[] = [
    { normals: [1], expected: 100 },
    { normals: [0], expected: 0 },
    { normals: [0.5], expected: 50 },
    { normals: [0.3, 0.7], expected: 70 },
    { normals: [0.9, 0.1], expected: 90 },
    { normals: [0.5, 0.5, 0.5], expected: 50 },
    { normals: [0.1, 0.4, 0.6, 0.8], expected: 80 },
    { normals: [0.25, 0.75], expected: 75 },
    { normals: [0.6, 0.6, 0.6], expected: 60 },
    { normals: [0.1, 0.2, 0.3], expected: 30 },
  ];
  maxCases.forEach(({ normals, expected }, i) => {
    it(`aggregateMax parameterised ${i} → ${expected}`, () => {
      const rs = normals.map((n, j) => res(`c${j}`, n * 10, n, n * 0.5));
      expect(aggregateMax(rs)).toBeCloseTo(expected, 1);
    });
  });
});

// ===========================================================================
// 11. aggregateGeometricMean
// ===========================================================================
describe('aggregateGeometricMean', () => {
  it('empty → 0', () => expect(aggregateGeometricMean([])).toBe(0));
  it('single result norm=1 → 100', () => {
    expect(aggregateGeometricMean([res('c1', 10, 1, 0.5)])).toBeCloseTo(100);
  });
  it('single result norm=0.5 → 50', () => {
    expect(aggregateGeometricMean([res('c1', 5, 0.5, 0.25)])).toBeCloseTo(50);
  });
  it('single result norm=0 → near 0 (floor 0.001)', () => {
    const v = aggregateGeometricMean([res('c1', 0, 0, 0)]);
    expect(v).toBeCloseTo(0.1, 0); // (0.001)^1 * 100 = 0.1
  });
  it('two results both norm=1 → 100', () => {
    expect(aggregateGeometricMean([
      res('c1', 10, 1, 0.5),
      res('c2', 10, 1, 0.5),
    ])).toBeCloseTo(100);
  });
  it('two results norm=0.25 and 1 → sqrt(0.25*1)*100 = 50', () => {
    const gm = aggregateGeometricMean([
      res('c1', 10, 0.25, 0.125),
      res('c2', 10, 1, 0.5),
    ]);
    expect(gm).toBeCloseTo(50, 1);
  });
  it('two results norm=0.5 and 0.5 → 50', () => {
    expect(aggregateGeometricMean([
      res('c1', 5, 0.5, 0.25),
      res('c2', 5, 0.5, 0.25),
    ])).toBeCloseTo(50, 1);
  });
  it('result <= 100', () => {
    const v = aggregateGeometricMean([res('c1', 10, 1, 1), res('c2', 10, 1, 1)]);
    expect(v).toBeLessThanOrEqual(100);
  });
  it('result >= 0', () => {
    const v = aggregateGeometricMean([res('c1', 0, 0, 0)]);
    expect(v).toBeGreaterThanOrEqual(0);
  });

  // Parameterised
  const gmCases: { normals: number[]; expectedApprox: number }[] = [
    { normals: [1, 1, 1], expectedApprox: 100 },
    { normals: [0.5, 0.5], expectedApprox: 50 },
    { normals: [1, 0.25], expectedApprox: 50 },
    { normals: [0.8, 0.8], expectedApprox: 80 },
    { normals: [0.36, 1], expectedApprox: 60 },
    { normals: [0.64, 1], expectedApprox: 80 },
    { normals: [0.5, 0.5, 0.5], expectedApprox: 50 },
    { normals: [1, 1], expectedApprox: 100 },
  ];
  gmCases.forEach(({ normals, expectedApprox }, i) => {
    it(`aggregateGeometricMean parameterised ${i} → ~${expectedApprox}`, () => {
      const rs = normals.map((n, j) => res(`c${j}`, n * 10, n, n * 0.5));
      const product = normals.reduce((p, n) => p * Math.max(0.001, n), 1);
      const expected = Math.min(100, Math.pow(product, 1 / normals.length) * 100);
      expect(aggregateGeometricMean(rs)).toBeCloseTo(expected, 1);
    });
  });
});

// ===========================================================================
// 12. aggregate (router)
// ===========================================================================
describe('aggregate', () => {
  const c1 = crit('c1', 100, 10);
  const r1 = computeScoreResult(inp('c1', 5), c1);
  const allMethods: AggregationMethod[] = ['weighted_average', 'sum', 'min', 'max', 'geometric_mean'];

  allMethods.forEach(method => {
    it(`routes to ${method} without throwing`, () => {
      expect(() => aggregate([r1], [c1], method)).not.toThrow();
    });
  });

  it('weighted_average with norm=0.5, w=100 → 50', () => {
    expect(aggregate([r1], [c1], 'weighted_average')).toBeCloseTo(50);
  });
  it('sum with norm=0.5, w=100 → 50', () => {
    expect(aggregate([r1], [c1], 'sum')).toBeCloseTo(50);
  });
  it('min with norm=0.5 → 50', () => {
    expect(aggregate([r1], [c1], 'min')).toBeCloseTo(50);
  });
  it('max with norm=0.5 → 50', () => {
    expect(aggregate([r1], [c1], 'max')).toBeCloseTo(50);
  });
  it('geometric_mean with norm=0.5 → 50', () => {
    expect(aggregate([r1], [c1], 'geometric_mean')).toBeCloseTo(50);
  });
  it('empty results → 0 for all methods', () => {
    allMethods.forEach(m => {
      expect(aggregate([], [c1], m)).toBe(0);
    });
  });
  it('weighted_average != sum when weights don\'t sum to 100', () => {
    const c2 = crit('c2', 50, 10);
    const r2 = computeScoreResult(inp('c2', 5), c2);
    const wa = aggregate([r2], [c2], 'weighted_average');
    const s = aggregate([r2], [c2], 'sum');
    // wa: (0.5 * 50) / 50 * 100 = 50; sum: 0.5 * 50/100 * 100 = 25 — different
    expect(wa).not.toEqual(s);
  });

  // Loop all methods with multiple results
  const cr = [crit('a', 50, 10), crit('b', 50, 10)];
  const rs = [computeScoreResult(inp('a', 10), cr[0]), computeScoreResult(inp('b', 5), cr[1])];
  allMethods.forEach(m => {
    it(`aggregate multi-result ${m} is a number 0..100`, () => {
      const v = aggregate(rs, cr, m);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });
});

// ===========================================================================
// 13. computeAssessment
// ===========================================================================
describe('computeAssessment', () => {
  const baseCriteria = [
    crit('c1', 50, 10),
    crit('c2', 50, 10),
  ];
  const fullInputs = [inp('c1', 10), inp('c2', 10)];
  const halfInputs = [inp('c1', 5), inp('c2', 5)];

  it('id is stored', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, fullInputs, defaultConfig);
    expect(a.id).toBe('id-1');
  });
  it('name is stored', () => {
    const a = computeAssessment('id-1', 'MyAssessment', baseCriteria, fullInputs, defaultConfig);
    expect(a.name).toBe('MyAssessment');
  });
  it('criteria stored', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, fullInputs, defaultConfig);
    expect(a.criteria).toHaveLength(2);
  });
  it('inputs stored', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, fullInputs, defaultConfig);
    expect(a.inputs).toHaveLength(2);
  });
  it('results computed for each answered criteria', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, fullInputs, defaultConfig);
    expect(a.results).toHaveLength(2);
  });
  it('full score → grade A', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, fullInputs, defaultConfig);
    expect(a.grade).toBe('A');
  });
  it('full score → level excellent', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, fullInputs, defaultConfig);
    expect(a.level).toBe('excellent');
  });
  it('full score → totalScore 100', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, fullInputs, defaultConfig);
    expect(a.totalScore).toBeCloseTo(100);
  });
  it('half score → totalScore ~50', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, halfInputs, defaultConfig);
    expect(a.totalScore).toBeCloseTo(50);
  });
  it('half score → grade D (50 < 60)', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, halfInputs, defaultConfig);
    expect(a.grade).toBe('D');
  });
  it('half score → level poor', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, halfInputs, defaultConfig);
    expect(a.level).toBe('poor');
  });
  it('completeness = 1 when all answered', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, fullInputs, defaultConfig);
    expect(a.completeness).toBe(1);
  });
  it('completeness = 0.5 when half answered', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, [inp('c1', 10)], defaultConfig);
    expect(a.completeness).toBe(0.5);
  });
  it('completeness = 0 when no criteria', () => {
    const a = computeAssessment('id-1', 'Test', [], [], defaultConfig);
    expect(a.completeness).toBe(0);
  });
  it('maxPossible = 100', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, fullInputs, defaultConfig);
    expect(a.maxPossible).toBe(100);
  });
  it('unrecognised inputs ignored', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, [inp('unknown', 10)], defaultConfig);
    expect(a.results).toHaveLength(0);
    expect(a.completeness).toBe(0);
  });
  it('zero score → grade F', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, [inp('c1', 0), inp('c2', 0)], defaultConfig);
    expect(a.grade).toBe('F');
  });
  it('zero score → level critical', () => {
    const a = computeAssessment('id-1', 'Test', baseCriteria, [inp('c1', 0), inp('c2', 0)], defaultConfig);
    expect(a.level).toBe('critical');
  });
  it('grade B for score ~80', () => {
    const cr = [crit('c1', 100, 10)];
    const a = computeAssessment('x', 'x', cr, [inp('c1', 8)], defaultConfig);
    expect(a.grade).toBe('B');
  });
  it('grade C for score ~65', () => {
    const cr = [crit('c1', 100, 10)];
    const a = computeAssessment('x', 'x', cr, [inp('c1', 6.5)], defaultConfig);
    expect(a.grade).toBe('C');
  });
  it('grade A for score 90', () => {
    const cr = [crit('c1', 100, 10)];
    const a = computeAssessment('x', 'x', cr, [inp('c1', 9)], defaultConfig);
    expect(a.grade).toBe('A');
  });
  it('sum aggregation method', () => {
    const config = makeConfig('sum');
    const cr = [crit('c1', 50, 10)];
    const a = computeAssessment('x', 'x', cr, [inp('c1', 10)], config);
    expect(a.totalScore).toBeCloseTo(50); // norm=1, weighted=0.5, sum: 0.5*100=50
  });
  it('min aggregation method', () => {
    const config = makeConfig('min');
    const cr = [crit('c1', 100, 10), crit('c2', 100, 10)];
    const a = computeAssessment('x', 'x', cr, [inp('c1', 3), inp('c2', 8)], config);
    expect(a.totalScore).toBeCloseTo(30, 1); // min(0.3,0.8)*100=30
  });
  it('max aggregation method', () => {
    const config = makeConfig('max');
    const cr = [crit('c1', 100, 10), crit('c2', 100, 10)];
    const a = computeAssessment('x', 'x', cr, [inp('c1', 3), inp('c2', 8)], config);
    expect(a.totalScore).toBeCloseTo(80, 1);
  });
  it('geometric_mean aggregation method', () => {
    const config = makeConfig('geometric_mean');
    const cr = [crit('c1', 100, 10)];
    const a = computeAssessment('x', 'x', cr, [inp('c1', 5)], config);
    expect(a.totalScore).toBeCloseTo(50, 1);
  });

  // Large parameterised loop
  const assessCases: {
    criteriaWeights: number[];
    raws: number[];
    maxScore: number;
    expectedGrade: ScoreGrade;
  }[] = [
    { criteriaWeights: [100], raws: [10], maxScore: 10, expectedGrade: 'A' },
    { criteriaWeights: [100], raws: [9], maxScore: 10, expectedGrade: 'A' },
    { criteriaWeights: [100], raws: [8], maxScore: 10, expectedGrade: 'B' },
    { criteriaWeights: [100], raws: [7.5], maxScore: 10, expectedGrade: 'B' },
    { criteriaWeights: [100], raws: [7], maxScore: 10, expectedGrade: 'C' },
    { criteriaWeights: [100], raws: [6], maxScore: 10, expectedGrade: 'C' },
    { criteriaWeights: [100], raws: [5.5], maxScore: 10, expectedGrade: 'D' },
    { criteriaWeights: [100], raws: [4], maxScore: 10, expectedGrade: 'D' },
    { criteriaWeights: [100], raws: [3], maxScore: 10, expectedGrade: 'F' },
    { criteriaWeights: [100], raws: [0], maxScore: 10, expectedGrade: 'F' },
    { criteriaWeights: [50, 50], raws: [10, 10], maxScore: 10, expectedGrade: 'A' },
    { criteriaWeights: [50, 50], raws: [0, 0], maxScore: 10, expectedGrade: 'F' },
    { criteriaWeights: [50, 50], raws: [5, 5], maxScore: 10, expectedGrade: 'D' },
  ];
  assessCases.forEach(({ criteriaWeights, raws, maxScore, expectedGrade }, i) => {
    it(`computeAssessment loop ${i} → grade ${expectedGrade}`, () => {
      const criteria = criteriaWeights.map((w, j) => crit(`c${j}`, w, maxScore));
      const inputs = raws.map((r, j) => inp(`c${j}`, r));
      const a = computeAssessment(`id${i}`, `Assessment ${i}`, criteria, inputs, defaultConfig);
      expect(a.grade).toBe(expectedGrade);
    });
  });
});

// ===========================================================================
// 14. isValidGrade
// ===========================================================================
describe('isValidGrade', () => {
  const validGrades: string[] = ['A', 'B', 'C', 'D', 'F'];
  const invalidGrades: string[] = ['E', 'G', 'a', 'b', 'c', 'd', 'f', '', ' ', '1', 'AA', 'AB', 'FA', 'excellent'];

  validGrades.forEach(g => {
    it(`isValidGrade('${g}') → true`, () => expect(isValidGrade(g)).toBe(true));
  });
  invalidGrades.forEach(g => {
    it(`isValidGrade('${g}') → false`, () => expect(isValidGrade(g)).toBe(false));
  });

  it('returns boolean', () => expect(typeof isValidGrade('A')).toBe('boolean'));
  it('type guard: all valid', () => expect(validGrades.every(g => isValidGrade(g))).toBe(true));
  it('type guard: none invalid', () => expect(invalidGrades.some(g => isValidGrade(g))).toBe(false));

  // Additional invalid checks
  ['Z', 'X', 'null', 'undefined', '0', 'false'].forEach(v => {
    it(`isValidGrade('${v}') → false`, () => expect(isValidGrade(v)).toBe(false));
  });
});

// ===========================================================================
// 15. isValidLevel
// ===========================================================================
describe('isValidLevel', () => {
  const validLevels: string[] = ['excellent', 'good', 'acceptable', 'poor', 'critical'];
  const invalidLevels: string[] = ['Excellent', 'GOOD', 'ok', 'bad', 'fail', '', ' ', 'A', 'acceptable1', 'very_good'];

  validLevels.forEach(l => {
    it(`isValidLevel('${l}') → true`, () => expect(isValidLevel(l)).toBe(true));
  });
  invalidLevels.forEach(l => {
    it(`isValidLevel('${l}') → false`, () => expect(isValidLevel(l)).toBe(false));
  });

  it('returns boolean', () => expect(typeof isValidLevel('excellent')).toBe('boolean'));
  it('all valid pass', () => expect(validLevels.every(l => isValidLevel(l))).toBe(true));
  it('no invalid pass', () => expect(invalidLevels.every(l => !isValidLevel(l))).toBe(true));

  // Extra invalid
  ['HIGH', 'LOW', 'MEDIUM', 'risk', 'grade'].forEach(v => {
    it(`isValidLevel('${v}') → false`, () => expect(isValidLevel(v)).toBe(false));
  });
});

// ===========================================================================
// 16. isValidAggregation
// ===========================================================================
describe('isValidAggregation', () => {
  const validMethods: string[] = ['weighted_average', 'sum', 'min', 'max', 'geometric_mean'];
  const invalidMethods: string[] = ['average', 'mean', 'median', 'mode', '', ' ', 'SUM', 'MIN', 'MAX', 'Weighted_Average'];

  validMethods.forEach(m => {
    it(`isValidAggregation('${m}') → true`, () => expect(isValidAggregation(m)).toBe(true));
  });
  invalidMethods.forEach(m => {
    it(`isValidAggregation('${m}') → false`, () => expect(isValidAggregation(m)).toBe(false));
  });

  it('returns boolean', () => expect(typeof isValidAggregation('sum')).toBe('boolean'));
  it('all valid pass', () => expect(validMethods.every(m => isValidAggregation(m))).toBe(true));
  it('no invalid pass', () => expect(invalidMethods.every(m => !isValidAggregation(m))).toBe(true));

  // Extra
  ['harmonic', 'rms', 'trimmed', 'none'].forEach(v => {
    it(`isValidAggregation('${v}') → false`, () => expect(isValidAggregation(v)).toBe(false));
  });
});

// ===========================================================================
// 17. makeCriteria
// ===========================================================================
describe('makeCriteria', () => {
  it('id stored', () => expect(makeCriteria('c1', 'Name', 50, 10).id).toBe('c1'));
  it('name stored', () => expect(makeCriteria('c1', 'MyName', 50, 10).name).toBe('MyName'));
  it('weight stored', () => expect(makeCriteria('c1', 'n', 75, 10).weight).toBe(75));
  it('maxScore stored', () => expect(makeCriteria('c1', 'n', 50, 20).maxScore).toBe(20));
  it('no description by default', () => expect(makeCriteria('c1', 'n', 50, 10).description).toBeUndefined());
  it('returns object', () => expect(typeof makeCriteria('x', 'y', 10, 5)).toBe('object'));

  const critCases: { id: string; name: string; weight: number; maxScore: number }[] = [
    { id: 'a', name: 'Alpha', weight: 10, maxScore: 5 },
    { id: 'b', name: 'Beta', weight: 20, maxScore: 10 },
    { id: 'c', name: 'Gamma', weight: 30, maxScore: 15 },
    { id: 'd', name: 'Delta', weight: 40, maxScore: 20 },
    { id: 'e', name: 'Epsilon', weight: 100, maxScore: 100 },
    { id: 'f', name: 'Zeta', weight: 0, maxScore: 0 },
    { id: 'g', name: 'Eta', weight: 50, maxScore: 50 },
    { id: 'h', name: 'Theta', weight: 25, maxScore: 25 },
  ];
  critCases.forEach(({ id, name, weight, maxScore }) => {
    it(`makeCriteria(${id}) stores all fields`, () => {
      const c = makeCriteria(id, name, weight, maxScore);
      expect(c.id).toBe(id);
      expect(c.name).toBe(name);
      expect(c.weight).toBe(weight);
      expect(c.maxScore).toBe(maxScore);
    });
  });
});

// ===========================================================================
// 18. makeInput
// ===========================================================================
describe('makeInput', () => {
  it('criteriaId stored', () => expect(makeInput('c1', 5).criteriaId).toBe('c1'));
  it('rawScore stored', () => expect(makeInput('c1', 7).rawScore).toBe(7));
  it('no notes by default', () => expect(makeInput('c1', 5).notes).toBeUndefined());
  it('returns object', () => expect(typeof makeInput('c1', 5)).toBe('object'));
  it('zero rawScore stored', () => expect(makeInput('c1', 0).rawScore).toBe(0));
  it('fractional rawScore stored', () => expect(makeInput('c1', 3.14).rawScore).toBeCloseTo(3.14));

  const inputCases: { id: string; raw: number }[] = [
    { id: 'a', raw: 0 },
    { id: 'b', raw: 1 },
    { id: 'c', raw: 5 },
    { id: 'd', raw: 10 },
    { id: 'e', raw: 100 },
    { id: 'f', raw: 0.5 },
    { id: 'g', raw: 99.9 },
    { id: 'h', raw: 50 },
  ];
  inputCases.forEach(({ id, raw }) => {
    it(`makeInput(${id}, ${raw}) stores fields`, () => {
      const i = makeInput(id, raw);
      expect(i.criteriaId).toBe(id);
      expect(i.rawScore).toBeCloseTo(raw);
    });
  });
});

// ===========================================================================
// 19. makeConfig
// ===========================================================================
describe('makeConfig', () => {
  it('default method is weighted_average', () => {
    expect(makeConfig().aggregationMethod).toBe('weighted_average');
  });
  it('default thresholds match DEFAULT_THRESHOLDS', () => {
    const c = makeConfig();
    expect(c.thresholds.excellent).toBe(DEFAULT_THRESHOLDS.excellent);
    expect(c.thresholds.good).toBe(DEFAULT_THRESHOLDS.good);
    expect(c.thresholds.acceptable).toBe(DEFAULT_THRESHOLDS.acceptable);
    expect(c.thresholds.poor).toBe(DEFAULT_THRESHOLDS.poor);
  });

  const methods: AggregationMethod[] = ['weighted_average', 'sum', 'min', 'max', 'geometric_mean'];
  methods.forEach(m => {
    it(`makeConfig('${m}') stores method`, () => {
      expect(makeConfig(m).aggregationMethod).toBe(m);
    });
  });

  it('custom thresholds stored', () => {
    const t = { excellent: 95, good: 80, acceptable: 65, poor: 50 };
    const c = makeConfig('sum', t);
    expect(c.thresholds.excellent).toBe(95);
    expect(c.thresholds.good).toBe(80);
    expect(c.thresholds.acceptable).toBe(65);
    expect(c.thresholds.poor).toBe(50);
  });
  it('returns object', () => expect(typeof makeConfig()).toBe('object'));
  it('has thresholds key', () => expect(makeConfig()).toHaveProperty('thresholds'));
  it('has aggregationMethod key', () => expect(makeConfig()).toHaveProperty('aggregationMethod'));
});

// ===========================================================================
// 20. totalCriteriaWeight
// ===========================================================================
describe('totalCriteriaWeight', () => {
  it('empty → 0', () => expect(totalCriteriaWeight([])).toBe(0));
  it('single criterion', () => expect(totalCriteriaWeight([crit('c1', 50, 10)])).toBe(50));
  it('two equal criteria', () => expect(totalCriteriaWeight([crit('c1', 50, 10), crit('c2', 50, 10)])).toBe(100));
  it('three criteria summed', () => {
    expect(totalCriteriaWeight([crit('c1', 30, 10), crit('c2', 30, 10), crit('c3', 40, 10)])).toBe(100);
  });
  it('weight=0 criteria', () => expect(totalCriteriaWeight([crit('c1', 0, 10)])).toBe(0));
  it('all weights 100 = 400', () => {
    expect(totalCriteriaWeight([
      crit('c1', 100, 10), crit('c2', 100, 10),
      crit('c3', 100, 10), crit('c4', 100, 10),
    ])).toBe(400);
  });
  it('returns number', () => expect(typeof totalCriteriaWeight([])).toBe('number'));

  const weightCases: { weights: number[]; expected: number }[] = [
    { weights: [10], expected: 10 },
    { weights: [10, 20], expected: 30 },
    { weights: [10, 20, 30], expected: 60 },
    { weights: [25, 25, 25, 25], expected: 100 },
    { weights: [0, 0, 0], expected: 0 },
    { weights: [100], expected: 100 },
    { weights: [33, 33, 34], expected: 100 },
    { weights: [50, 50], expected: 100 },
    { weights: [1, 2, 3, 4, 5], expected: 15 },
    { weights: [10, 10, 10, 10, 10], expected: 50 },
  ];
  weightCases.forEach(({ weights, expected }, i) => {
    it(`totalCriteriaWeight case ${i} [${weights.join(',')}] → ${expected}`, () => {
      const criteria = weights.map((w, j) => crit(`c${j}`, w, 10));
      expect(totalCriteriaWeight(criteria)).toBe(expected);
    });
  });
});

// ===========================================================================
// 21. Integration scenarios
// ===========================================================================
describe('integration: compliance risk assessment', () => {
  const complianceCriteria: ScoreCriteria[] = [
    makeCriteria('documentation', 'Documentation', 20, 10),
    makeCriteria('training', 'Training Compliance', 25, 10),
    makeCriteria('audits', 'Internal Audits', 20, 10),
    makeCriteria('incidents', 'Incident Rate', 15, 10),
    makeCriteria('corrective', 'Corrective Actions', 20, 10),
  ];

  it('total weight sums to 100', () => {
    expect(totalCriteriaWeight(complianceCriteria)).toBe(100);
  });

  it('perfect score → A grade', () => {
    const inputs = complianceCriteria.map(c => makeInput(c.id, c.maxScore));
    const a = computeAssessment('compliance-1', 'ISO Compliance', complianceCriteria, inputs, defaultConfig);
    expect(a.grade).toBe('A');
    expect(a.totalScore).toBeCloseTo(100);
    expect(a.completeness).toBe(1);
  });

  it('zero score → F grade', () => {
    const inputs = complianceCriteria.map(c => makeInput(c.id, 0));
    const a = computeAssessment('compliance-2', 'ISO Compliance', complianceCriteria, inputs, defaultConfig);
    expect(a.grade).toBe('F');
    expect(a.totalScore).toBeCloseTo(0);
    expect(a.level).toBe('critical');
  });

  it('mid score → appropriate grade', () => {
    const inputs = complianceCriteria.map(c => makeInput(c.id, 7)); // 70%
    const a = computeAssessment('compliance-3', 'ISO Compliance', complianceCriteria, inputs, defaultConfig);
    expect(a.totalScore).toBeCloseTo(70);
    expect(a.grade).toBe('C');
    expect(a.level).toBe('acceptable');
  });

  it('partial answers → completeness < 1', () => {
    const inputs = complianceCriteria.slice(0, 3).map(c => makeInput(c.id, 8));
    const a = computeAssessment('compliance-4', 'ISO Compliance', complianceCriteria, inputs, defaultConfig);
    expect(a.completeness).toBeCloseTo(3 / 5, 3);
  });

  it('grade aligns with level', () => {
    const inputs = complianceCriteria.map(c => makeInput(c.id, 9));
    const a = computeAssessment('compliance-5', 'ISO Compliance', complianceCriteria, inputs, defaultConfig);
    expect(a.grade).toBe('A');
    expect(a.level).toBe('excellent');
  });

  it('sum method: weights matter differently', () => {
    const config = makeConfig('sum');
    const inputs = complianceCriteria.map(c => makeInput(c.id, c.maxScore));
    const a = computeAssessment('compliance-6', 'ISO Compliance', complianceCriteria, inputs, config);
    // Each criterion: norm=1, weighted = 1 * w/100; sum of all = sum(w/100) = 1.0 * 100 = 100
    expect(a.totalScore).toBeCloseTo(100);
  });

  it('min method: worst criterion governs', () => {
    const config = makeConfig('min');
    const inputs = [
      makeInput('documentation', 10),
      makeInput('training', 10),
      makeInput('audits', 10),
      makeInput('incidents', 10),
      makeInput('corrective', 2), // weak link: 20%
    ];
    const a = computeAssessment('compliance-7', 'ISO Compliance', complianceCriteria, inputs, config);
    expect(a.totalScore).toBeCloseTo(20, 1);
    expect(a.grade).toBe('F');
  });

  it('max method: best criterion governs', () => {
    const config = makeConfig('max');
    const inputs = [
      makeInput('documentation', 1),
      makeInput('training', 1),
      makeInput('audits', 1),
      makeInput('incidents', 1),
      makeInput('corrective', 10), // strong one: 100%
    ];
    const a = computeAssessment('compliance-8', 'ISO Compliance', complianceCriteria, inputs, config);
    expect(a.totalScore).toBeCloseTo(100, 1);
    expect(a.grade).toBe('A');
  });
});

describe('integration: risk assessment with custom thresholds', () => {
  const strictThresholds = { excellent: 95, good: 85, acceptable: 70, poor: 50 };
  const strictConfig = makeConfig('weighted_average', strictThresholds);
  const riskCriteria: ScoreCriteria[] = [
    makeCriteria('likelihood', 'Likelihood', 40, 5),
    makeCriteria('impact', 'Impact', 40, 5),
    makeCriteria('controls', 'Controls Effectiveness', 20, 5),
  ];

  it('total weight = 100', () => expect(totalCriteriaWeight(riskCriteria)).toBe(100));

  it('strict: 90% score → grade B not A', () => {
    const inputs = riskCriteria.map(c => makeInput(c.id, c.maxScore * 0.9));
    const a = computeAssessment('risk-1', 'Risk Assessment', riskCriteria, inputs, strictConfig);
    expect(a.totalScore).toBeCloseTo(90);
    expect(a.grade).toBe('B'); // 90 < 95 threshold
  });

  it('strict: 96% → grade A', () => {
    const inputs = riskCriteria.map(c => makeInput(c.id, c.maxScore * 0.96));
    const a = computeAssessment('risk-2', 'Risk Assessment', riskCriteria, inputs, strictConfig);
    expect(a.totalScore).toBeCloseTo(96);
    expect(a.grade).toBe('A');
  });

  it('isValidGrade on assessment result', () => {
    const inputs = riskCriteria.map(c => makeInput(c.id, 3));
    const a = computeAssessment('risk-3', 'Risk Assessment', riskCriteria, inputs, strictConfig);
    expect(isValidGrade(a.grade)).toBe(true);
  });

  it('isValidLevel on assessment result', () => {
    const inputs = riskCriteria.map(c => makeInput(c.id, 3));
    const a = computeAssessment('risk-4', 'Risk Assessment', riskCriteria, inputs, strictConfig);
    expect(isValidLevel(a.level)).toBe(true);
  });
});

describe('integration: geometric mean assessment', () => {
  const gmConfig = makeConfig('geometric_mean');
  const criteria = [makeCriteria('a', 'Alpha', 50, 10), makeCriteria('b', 'Beta', 50, 10)];

  it('two full scores → 100', () => {
    const inputs = [makeInput('a', 10), makeInput('b', 10)];
    const a = computeAssessment('gm-1', 'GM Test', criteria, inputs, gmConfig);
    expect(a.totalScore).toBeCloseTo(100);
  });

  it('one full one half → ~70.7', () => {
    const inputs = [makeInput('a', 10), makeInput('b', 5)];
    const a = computeAssessment('gm-2', 'GM Test', criteria, inputs, gmConfig);
    expect(a.totalScore).toBeCloseTo(70.7, 0);
  });

  it('two half scores → 50', () => {
    const inputs = [makeInput('a', 5), makeInput('b', 5)];
    const a = computeAssessment('gm-3', 'GM Test', criteria, inputs, gmConfig);
    expect(a.totalScore).toBeCloseTo(50);
  });
});

// ===========================================================================
// 22. Additional edge cases and cross-function consistency
// ===========================================================================
describe('cross-function consistency', () => {
  it('grade and level correspond for random scores', () => {
    const scores = [0, 10, 20, 30, 39, 40, 50, 59, 60, 70, 74, 75, 80, 89, 90, 95, 100];
    scores.forEach(s => {
      const grade = gradeFromScore(s);
      const level = levelFromScore(s);
      // Both should give the same tier
      if (s >= 90) { expect(grade).toBe('A'); expect(level).toBe('excellent'); }
      else if (s >= 75) { expect(grade).toBe('B'); expect(level).toBe('good'); }
      else if (s >= 60) { expect(grade).toBe('C'); expect(level).toBe('acceptable'); }
      else if (s >= 40) { expect(grade).toBe('D'); expect(level).toBe('poor'); }
      else { expect(grade).toBe('F'); expect(level).toBe('critical'); }
    });
  });

  it('clampScore is idempotent', () => {
    [0, 25, 50, 75, 100].forEach(s => {
      expect(clampScore(clampScore(s))).toBe(clampScore(s));
    });
  });

  it('normalise then scale = same as direct percent', () => {
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(raw => {
      const norm = normalise(raw, 10);
      expect(norm * 100).toBeCloseTo(raw * 10);
    });
  });

  it('computeScoreResult.normalised consistent with normalise', () => {
    const c = crit('c', 50, 10);
    const i = inp('c', 7);
    const r = computeScoreResult(i, c);
    expect(r.normalised).toBeCloseTo(normalise(7, 10));
  });

  it('totalCriteriaWeight of 5 equal 20% criteria = 100', () => {
    const criteria = Array.from({ length: 5 }, (_, j) => crit(`c${j}`, 20, 10));
    expect(totalCriteriaWeight(criteria)).toBe(100);
  });

  it('makeConfig + computeAssessment roundtrip', () => {
    const config = makeConfig('weighted_average');
    const criteria = [makeCriteria('x', 'X', 100, 10)];
    const inputs = [makeInput('x', 10)];
    const a = computeAssessment('test', 'Test', criteria, inputs, config);
    expect(a.totalScore).toBeCloseTo(100);
    expect(isValidGrade(a.grade)).toBe(true);
    expect(isValidLevel(a.level)).toBe(true);
  });

  it('multiple aggregation methods give same result for single full criterion', () => {
    const c = [crit('c1', 100, 10)];
    const inp2 = [makeInput('c1', 10)];
    const methods: AggregationMethod[] = ['weighted_average', 'min', 'max', 'geometric_mean'];
    methods.forEach(m => {
      const a = computeAssessment('x', 'x', c, inp2, makeConfig(m));
      expect(a.totalScore).toBeCloseTo(100);
    });
  });

  it('sum method sums weighted values', () => {
    // Two criteria w=50 each; each scored 50% → weighted=0.5*0.5=0.25; sum*100=50
    const c = [crit('c1', 50, 10), crit('c2', 50, 10)];
    const inputs2 = [makeInput('c1', 5), makeInput('c2', 5)];
    const a = computeAssessment('x', 'x', c, inputs2, makeConfig('sum'));
    expect(a.totalScore).toBeCloseTo(50);
  });

  it('gradeFromScore and levelFromScore never throw for all integers 0..200', () => {
    for (let i = 0; i <= 200; i++) {
      expect(() => gradeFromScore(i)).not.toThrow();
      expect(() => levelFromScore(i)).not.toThrow();
    }
  });

  it('normalise never returns outside [0,1] for any integer raw 0..200 and max 1', () => {
    for (let raw = 0; raw <= 200; raw++) {
      const n = normalise(raw, 1);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThanOrEqual(1);
    }
  });
});

// ===========================================================================
// 23. Type validation helpers
// ===========================================================================
describe('type validation helpers', () => {
  it('all ScoreGrade values pass isValidGrade', () => {
    const grades: ScoreGrade[] = ['A', 'B', 'C', 'D', 'F'];
    grades.forEach(g => expect(isValidGrade(g)).toBe(true));
  });
  it('all ScoreLevel values pass isValidLevel', () => {
    const levels: ScoreLevel[] = ['excellent', 'good', 'acceptable', 'poor', 'critical'];
    levels.forEach(l => expect(isValidLevel(l)).toBe(true));
  });
  it('all AggregationMethod values pass isValidAggregation', () => {
    const methods: AggregationMethod[] = ['weighted_average', 'sum', 'min', 'max', 'geometric_mean'];
    methods.forEach(m => expect(isValidAggregation(m)).toBe(true));
  });
  it('isValidGrade count of valid values is 5', () => {
    const allGrades = 'ABCDEF'.split('');
    expect(allGrades.filter(isValidGrade).length).toBe(5);
  });
  it('isValidLevel count of valid values is 5', () => {
    const candidates = ['excellent', 'good', 'acceptable', 'poor', 'critical', 'bad', 'great'];
    expect(candidates.filter(isValidLevel).length).toBe(5);
  });
  it('isValidAggregation count of valid values is 5', () => {
    const candidates = ['weighted_average', 'sum', 'min', 'max', 'geometric_mean', 'median', 'mode'];
    expect(candidates.filter(isValidAggregation).length).toBe(5);
  });
});

// ===========================================================================
// 24. Stress / volume tests
// ===========================================================================
describe('stress: many criteria', () => {
  it('handles 50 equal-weight criteria (weight=2 each)', () => {
    const criteria = Array.from({ length: 50 }, (_, i) => makeCriteria(`c${i}`, `C${i}`, 2, 10));
    expect(totalCriteriaWeight(criteria)).toBe(100);
    const inputs = criteria.map(c => makeInput(c.id, 10));
    const a = computeAssessment('big', 'Big', criteria, inputs, defaultConfig);
    expect(a.totalScore).toBeCloseTo(100, 0);
    expect(a.grade).toBe('A');
    expect(a.completeness).toBe(1);
  });

  it('handles 100 criteria with half answered', () => {
    const criteria = Array.from({ length: 100 }, (_, i) => makeCriteria(`c${i}`, `C${i}`, 1, 10));
    const inputs = criteria.slice(0, 50).map(c => makeInput(c.id, 10));
    const a = computeAssessment('big2', 'Big2', criteria, inputs, defaultConfig);
    expect(a.completeness).toBeCloseTo(0.5);
    expect(a.results).toHaveLength(50);
  });

  it('normalise is fast for large values', () => {
    for (let i = 0; i < 100; i++) {
      const v = normalise(i, 100);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('gradeFromScore works correctly for all integers 0..100', () => {
    let countA = 0, countB = 0, countC = 0, countD = 0, countF = 0;
    for (let s = 0; s <= 100; s++) {
      const g = gradeFromScore(s);
      if (g === 'A') countA++;
      else if (g === 'B') countB++;
      else if (g === 'C') countC++;
      else if (g === 'D') countD++;
      else countF++;
    }
    expect(countA).toBe(11);   // 90..100
    expect(countB).toBe(15);   // 75..89
    expect(countC).toBe(15);   // 60..74
    expect(countD).toBe(20);   // 40..59
    expect(countF).toBe(40);   // 0..39
  });
});

// ===========================================================================
// 25. ScoreResult object shape
// ===========================================================================
describe('ScoreResult shape', () => {
  it('has criteriaId', () => {
    const r = computeScoreResult(inp('id1', 5), crit('id1', 50, 10));
    expect(r).toHaveProperty('criteriaId');
  });
  it('has rawScore', () => {
    const r = computeScoreResult(inp('id1', 5), crit('id1', 50, 10));
    expect(r).toHaveProperty('rawScore');
  });
  it('has normalised', () => {
    const r = computeScoreResult(inp('id1', 5), crit('id1', 50, 10));
    expect(r).toHaveProperty('normalised');
  });
  it('has weighted', () => {
    const r = computeScoreResult(inp('id1', 5), crit('id1', 50, 10));
    expect(r).toHaveProperty('weighted');
  });
  it('normalised is between 0 and 1', () => {
    const r = computeScoreResult(inp('id1', 5), crit('id1', 50, 10));
    expect(r.normalised).toBeGreaterThanOrEqual(0);
    expect(r.normalised).toBeLessThanOrEqual(1);
  });
  it('weighted is non-negative', () => {
    const r = computeScoreResult(inp('id1', 5), crit('id1', 50, 10));
    expect(r.weighted).toBeGreaterThanOrEqual(0);
  });
  it('weighted <= weight/100', () => {
    const r = computeScoreResult(inp('id1', 5), crit('id1', 50, 10));
    expect(r.weighted).toBeLessThanOrEqual(0.5 + 0.001);
  });
});

// ===========================================================================
// 26. AssessmentScore shape
// ===========================================================================
describe('AssessmentScore shape', () => {
  const a = computeAssessment(
    'shape-test',
    'Shape Test',
    [crit('c1', 100, 10)],
    [inp('c1', 8)],
    defaultConfig
  );

  it('has id', () => expect(a).toHaveProperty('id', 'shape-test'));
  it('has name', () => expect(a).toHaveProperty('name', 'Shape Test'));
  it('has criteria array', () => expect(Array.isArray(a.criteria)).toBe(true));
  it('has inputs array', () => expect(Array.isArray(a.inputs)).toBe(true));
  it('has results array', () => expect(Array.isArray(a.results)).toBe(true));
  it('has totalScore number', () => expect(typeof a.totalScore).toBe('number'));
  it('has grade string', () => expect(typeof a.grade).toBe('string'));
  it('has level string', () => expect(typeof a.level).toBe('string'));
  it('has maxPossible number', () => expect(typeof a.maxPossible).toBe('number'));
  it('has completeness number', () => expect(typeof a.completeness).toBe('number'));
  it('totalScore in [0,100]', () => {
    expect(a.totalScore).toBeGreaterThanOrEqual(0);
    expect(a.totalScore).toBeLessThanOrEqual(100);
  });
  it('completeness in [0,1]', () => {
    expect(a.completeness).toBeGreaterThanOrEqual(0);
    expect(a.completeness).toBeLessThanOrEqual(1);
  });
  it('grade is valid', () => expect(isValidGrade(a.grade)).toBe(true));
  it('level is valid', () => expect(isValidLevel(a.level)).toBe(true));
});

// ===========================================================================
// 27. normalise fine-grained loop (every integer 0..100 against max=100)
// ===========================================================================
describe('normalise fine-grained loop', () => {
  for (let raw = 0; raw <= 100; raw++) {
    it(`normalise(${raw}, 100) = ${raw / 100}`, () => {
      expect(normalise(raw, 100)).toBeCloseTo(raw / 100, 5);
    });
  }
});

// ===========================================================================
// 28. clampScore fine-grained loop (every integer -10..110)
// ===========================================================================
describe('clampScore fine-grained loop -10..110', () => {
  for (let v = -10; v <= 110; v++) {
    const expected = v < 0 ? 0 : v > 100 ? 100 : v;
    it(`clampScore(${v}) → ${expected}`, () => {
      expect(clampScore(v)).toBe(expected);
    });
  }
});

// ===========================================================================
// 29. gradeFromScore: verify non-integer boundary precision
// ===========================================================================
describe('gradeFromScore fractional boundary', () => {
  const fractions: [number, ScoreGrade][] = [
    [89.5, 'B'], [89.99, 'B'], [90.0, 'A'], [90.01, 'A'],
    [74.5, 'C'], [74.99, 'C'], [75.0, 'B'], [75.01, 'B'],
    [59.5, 'D'], [59.99, 'D'], [60.0, 'C'], [60.01, 'C'],
    [39.5, 'F'], [39.99, 'F'], [40.0, 'D'], [40.01, 'D'],
  ];
  fractions.forEach(([score, grade]) => {
    it(`gradeFromScore(${score}) → '${grade}'`, () => {
      expect(gradeFromScore(score)).toBe(grade);
    });
  });
});

// ===========================================================================
// 30. levelFromScore: verify non-integer boundary precision
// ===========================================================================
describe('levelFromScore fractional boundary', () => {
  const fractions: [number, ScoreLevel][] = [
    [89.5, 'good'], [89.99, 'good'], [90.0, 'excellent'], [90.01, 'excellent'],
    [74.5, 'acceptable'], [74.99, 'acceptable'], [75.0, 'good'], [75.01, 'good'],
    [59.5, 'poor'], [59.99, 'poor'], [60.0, 'acceptable'], [60.01, 'acceptable'],
    [39.5, 'critical'], [39.99, 'critical'], [40.0, 'poor'], [40.01, 'poor'],
  ];
  fractions.forEach(([score, level]) => {
    it(`levelFromScore(${score}) → '${level}'`, () => {
      expect(levelFromScore(score)).toBe(level);
    });
  });
});

// ===========================================================================
// 31. computeScoreResult: verify weighted = normalised * weight/100 for all weights
// ===========================================================================
describe('computeScoreResult weighted proportionality', () => {
  const weights = [0, 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 100];
  weights.forEach(w => {
    it(`weight=${w}: weighted=norm*weight/100 for raw=5, max=10`, () => {
      const c = crit('cx', w, 10);
      const r = computeScoreResult(inp('cx', 5), c);
      expect(r.weighted).toBeCloseTo(0.5 * (w / 100), 5);
    });
  });
});

// ===========================================================================
// 32. totalCriteriaWeight: single-criteria loop with varying weights
// ===========================================================================
describe('totalCriteriaWeight single criterion loop', () => {
  for (let w = 0; w <= 100; w += 5) {
    it(`single criterion weight=${w} → ${w}`, () => {
      expect(totalCriteriaWeight([crit('c', w, 10)])).toBe(w);
    });
  }
});

// ===========================================================================
// 33. makeConfig: all methods × custom threshold combinations
// ===========================================================================
describe('makeConfig method × threshold combinations', () => {
  const methods: AggregationMethod[] = ['weighted_average', 'sum', 'min', 'max', 'geometric_mean'];
  const thresholdSets = [
    { excellent: 90, good: 75, acceptable: 60, poor: 40 },
    { excellent: 95, good: 80, acceptable: 65, poor: 50 },
    { excellent: 85, good: 70, acceptable: 55, poor: 30 },
    { excellent: 80, good: 60, acceptable: 40, poor: 20 },
  ];
  methods.forEach(m => {
    thresholdSets.forEach((t, ti) => {
      it(`makeConfig(${m}, thresholdSet${ti}): method and thresholds stored`, () => {
        const c = makeConfig(m, t);
        expect(c.aggregationMethod).toBe(m);
        expect(c.thresholds.excellent).toBe(t.excellent);
        expect(c.thresholds.poor).toBe(t.poor);
      });
    });
  });
});

// ===========================================================================
// 34. aggregate method dispatch: all 5 methods × 3 input scenarios
// ===========================================================================
describe('aggregate dispatch comprehensive', () => {
  const methods: AggregationMethod[] = ['weighted_average', 'sum', 'min', 'max', 'geometric_mean'];
  const scenarios: { label: string; criteria: ScoreCriteria[]; inputs: ScoreInput[] }[] = [
    {
      label: 'single full',
      criteria: [crit('c1', 100, 10)],
      inputs: [inp('c1', 10)],
    },
    {
      label: 'single half',
      criteria: [crit('c1', 100, 10)],
      inputs: [inp('c1', 5)],
    },
    {
      label: 'two equal full',
      criteria: [crit('c1', 50, 10), crit('c2', 50, 10)],
      inputs: [inp('c1', 10), inp('c2', 10)],
    },
  ];
  methods.forEach(m => {
    scenarios.forEach(({ label, criteria: sc, inputs: si }) => {
      it(`aggregate(${m}, ${label}) is in [0,100]`, () => {
        const results = si.map(i => {
          const c = sc.find(x => x.id === i.criteriaId)!;
          return computeScoreResult(i, c);
        });
        const v = aggregate(results, sc, m);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(100);
        expect(typeof v).toBe('number');
      });
    });
  });
});

// ===========================================================================
// 35. isValidGrade/isValidLevel/isValidAggregation: exhaustive checks
// ===========================================================================
describe('isValidGrade exhaustive ASCII', () => {
  // Check a wide range of single-character strings
  const validSet = new Set(['A', 'B', 'C', 'D', 'F']);
  'EGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(ch => {
    it(`isValidGrade('${ch}') → false`, () => expect(isValidGrade(ch)).toBe(false));
  });
  'abcdefghijklmnopqrstuvwxyz'.split('').forEach(ch => {
    it(`isValidGrade lowercase '${ch}' → false`, () => expect(isValidGrade(ch)).toBe(false));
  });
});

describe('isValidLevel exhaustive', () => {
  const valids = ['excellent', 'good', 'acceptable', 'poor', 'critical'];
  const invalids = [
    'EXCELLENT', 'GOOD', 'ACCEPTABLE', 'POOR', 'CRITICAL',
    'excellent ', ' good', 'acceptabl', 'poo', 'crit',
    'average', 'high', 'low', 'medium', 'none',
    'very_good', 'very_poor', 'satisfactory', 'pass', 'fail',
  ];
  invalids.forEach(v => {
    it(`isValidLevel('${v}') → false`, () => expect(isValidLevel(v)).toBe(false));
  });
  valids.forEach(v => {
    it(`isValidLevel('${v}') → true`, () => expect(isValidLevel(v)).toBe(true));
  });
});

// ===========================================================================
// 36. computeAssessment with different aggregation methods: grade consistency
// ===========================================================================
describe('computeAssessment aggregation method consistency', () => {
  const methods: AggregationMethod[] = ['weighted_average', 'sum', 'min', 'max', 'geometric_mean'];
  const sc = [crit('a', 50, 10), crit('b', 50, 10)];

  methods.forEach(m => {
    it(`grade is valid for method ${m} with zero inputs`, () => {
      const a = computeAssessment('x', 'x', sc, [inp('a', 0), inp('b', 0)], makeConfig(m));
      expect(isValidGrade(a.grade)).toBe(true);
      expect(a.grade).toBe('F');
    });
    it(`grade is valid for method ${m} with full inputs`, () => {
      const a = computeAssessment('x', 'x', sc, [inp('a', 10), inp('b', 10)], makeConfig(m));
      expect(isValidGrade(a.grade)).toBe(true);
      expect(a.grade).toBe('A');
    });
    it(`level is valid for method ${m} with half inputs`, () => {
      const a = computeAssessment('x', 'x', sc, [inp('a', 5), inp('b', 5)], makeConfig(m));
      expect(isValidLevel(a.level)).toBe(true);
    });
  });
});

// ===========================================================================
// 37. makeCriteria: description optional field
// ===========================================================================
describe('makeCriteria description field', () => {
  it('description absent when not provided', () => {
    const c = makeCriteria('c1', 'Name', 50, 10);
    expect('description' in c ? c.description : undefined).toBeUndefined();
  });
  it('id is a string', () => expect(typeof makeCriteria('id', 'n', 10, 5).id).toBe('string'));
  it('name is a string', () => expect(typeof makeCriteria('id', 'n', 10, 5).name).toBe('string'));
  it('weight is a number', () => expect(typeof makeCriteria('id', 'n', 10, 5).weight).toBe('number'));
  it('maxScore is a number', () => expect(typeof makeCriteria('id', 'n', 10, 5).maxScore).toBe('number'));

  // Loop: 20 different criteria
  for (let i = 1; i <= 20; i++) {
    it(`makeCriteria loop ${i}: weight=${i*5}, maxScore=${i}`, () => {
      const c = makeCriteria(`crit-${i}`, `Criterion ${i}`, i * 5, i);
      expect(c.id).toBe(`crit-${i}`);
      expect(c.weight).toBe(i * 5);
      expect(c.maxScore).toBe(i);
    });
  }
});

// ===========================================================================
// 38. makeInput: notes field
// ===========================================================================
describe('makeInput notes field', () => {
  it('notes absent when not provided', () => expect(makeInput('c', 5).notes).toBeUndefined());
  it('criteriaId is string', () => expect(typeof makeInput('c', 5).criteriaId).toBe('string'));
  it('rawScore is number', () => expect(typeof makeInput('c', 5).rawScore).toBe('number'));

  // Loop: 20 different inputs
  for (let i = 0; i <= 19; i++) {
    it(`makeInput loop ${i}: raw=${i * 5}`, () => {
      const inp2 = makeInput(`crit-${i}`, i * 5);
      expect(inp2.criteriaId).toBe(`crit-${i}`);
      expect(inp2.rawScore).toBe(i * 5);
    });
  }
});

// ===========================================================================
// 39. aggregateMin / aggregateMax symmetry
// ===========================================================================
describe('aggregateMin/aggregateMax symmetry', () => {
  // For any set of results, min <= max
  const testSets: number[][] = [
    [0.1, 0.5, 0.9],
    [0.3, 0.7],
    [1],
    [0.2, 0.4, 0.6, 0.8],
    [0.5, 0.5],
    [0, 0, 1],
    [0.33, 0.66, 0.99],
  ];
  testSets.forEach((normals, i) => {
    it(`min <= max for set ${i} [${normals.join(',')}]`, () => {
      const rs = normals.map((n, j) => res(`c${j}`, n * 10, n, n * 0.5));
      expect(aggregateMin(rs)).toBeLessThanOrEqual(aggregateMax(rs));
    });
    it(`min <= weighted_avg <= max for set ${i}`, () => {
      const criteria = normals.map((_, j) => crit(`c${j}`, Math.floor(100 / normals.length), 10));
      const rs = normals.map((n, j) => res(`c${j}`, n * 10, n, n * (criteria[j].weight / 100)));
      const mn = aggregateMin(rs);
      const mx = aggregateMax(rs);
      const wa = aggregateWeightedAverage(rs, criteria);
      expect(mn).toBeLessThanOrEqual(wa + 0.001);
      expect(wa).toBeLessThanOrEqual(mx + 0.001);
    });
  });
});

// ===========================================================================
// 40. computeAssessment: completeness accuracy
// ===========================================================================
describe('computeAssessment completeness accuracy', () => {
  const sc = Array.from({ length: 10 }, (_, i) => crit(`c${i}`, 10, 10));

  for (let answered = 0; answered <= 10; answered++) {
    it(`completeness = ${answered}/10 when ${answered} criteria answered`, () => {
      const inputs = sc.slice(0, answered).map(c => makeInput(c.id, 5));
      const a = computeAssessment('x', 'x', sc, inputs, defaultConfig);
      expect(a.completeness).toBeCloseTo(answered / 10, 5);
    });
  }
});

// ===========================================================================
// 41. DEFAULT_THRESHOLDS immutability check
// ===========================================================================
describe('DEFAULT_THRESHOLDS referenced values', () => {
  it('excellent threshold is a positive number', () => {
    expect(DEFAULT_THRESHOLDS.excellent).toBeGreaterThan(0);
  });
  it('poor threshold is a non-negative number', () => {
    expect(DEFAULT_THRESHOLDS.poor).toBeGreaterThanOrEqual(0);
  });
  it('thresholds form strictly descending sequence', () => {
    const { excellent, good, acceptable, poor } = DEFAULT_THRESHOLDS;
    expect(excellent > good).toBe(true);
    expect(good > acceptable).toBe(true);
    expect(acceptable > poor).toBe(true);
  });
  it('all thresholds are finite numbers', () => {
    Object.values(DEFAULT_THRESHOLDS).forEach(v => {
      expect(Number.isFinite(v)).toBe(true);
    });
  });
  it('all thresholds are between 0 and 100 inclusive', () => {
    Object.values(DEFAULT_THRESHOLDS).forEach(v => {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    });
  });
});
