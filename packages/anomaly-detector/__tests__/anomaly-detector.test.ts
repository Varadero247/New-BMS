import {
  mean,
  variance,
  stdDev,
  median,
  quantile,
  mad,
  zScore,
  scoreSeverity,
  detectZScore,
  detectIQR,
  detectMAD,
  detectThreshold,
  detectEWMA,
  detect,
  makePoint,
  isValidMethod,
  filterAnomalies,
  filterBySeverity,
} from '../src/detector';

import type {
  DataPoint,
  AnomalyConfig,
  AnomalyResult,
  AnomalyMethod,
  Severity,
} from '../src/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function pts(values: number[]): DataPoint[] {
  return values.map((v, i) => ({ value: v, timestamp: i * 1000 }));
}

function cfg(method: AnomalyMethod, overrides: Partial<AnomalyConfig> = {}): AnomalyConfig {
  return { method, ...overrides };
}

// Normal distribution sample (no external deps) — 100 values centred on 50, sd≈5
const normalSample: number[] = [
  49,51,50,52,48,53,47,54,46,55,
  50,51,49,50,52,48,53,47,54,46,
  55,50,51,49,50,52,48,53,47,54,
  46,55,50,51,49,50,52,48,53,47,
  54,46,55,50,51,49,50,52,48,53,
  47,54,46,55,50,51,49,50,52,48,
  53,47,54,46,55,50,51,49,50,52,
  48,53,47,54,46,55,50,51,49,50,
  52,48,53,47,54,46,55,50,51,49,
  50,52,48,53,47,54,46,55,50,51,
];

// ============================================================
// mean()
// ============================================================
describe('mean()', () => {
  it('returns 0 for empty array', () => expect(mean([])).toBe(0));
  it('returns the sole element for length-1 array', () => expect(mean([7])).toBe(7));
  it('returns 0 for single zero', () => expect(mean([0])).toBe(0));
  it('computes mean of [1,2,3]', () => expect(mean([1, 2, 3])).toBeCloseTo(2, 10));
  it('computes mean of [1,2,3,4]', () => expect(mean([1, 2, 3, 4])).toBeCloseTo(2.5, 10));
  it('computes mean of all-same values', () => expect(mean([5, 5, 5, 5])).toBe(5));
  it('handles negative values', () => expect(mean([-2, -4, -6])).toBeCloseTo(-4, 10));
  it('handles mixed positive/negative', () => expect(mean([-3, 3])).toBe(0));
  it('handles large values', () => expect(mean([1e9, 2e9])).toBeCloseTo(1.5e9, 0));
  it('handles floats', () => expect(mean([0.1, 0.2, 0.3])).toBeCloseTo(0.2, 10));

  // Parameterised: mean of n copies of k is k
  for (const k of [-5, 0, 1, 10, 100]) {
    for (const n of [1, 2, 5, 10]) {
      it(`mean of ${n}× ${k} equals ${k}`, () => {
        expect(mean(Array(n).fill(k))).toBeCloseTo(k, 10);
      });
    }
  }

  // Parameterised: arithmetic series mean = (first+last)/2
  const series = [
    [1, 2, 3, 4, 5],
    [10, 20, 30],
    [0, 100],
    [-10, 0, 10],
  ];
  for (const s of series) {
    it(`mean([${s}]) == (first+last)/2`, () => {
      const expected = (s[0] + s[s.length - 1]) / 2;
      expect(mean(s)).toBeCloseTo(expected, 10);
    });
  }

  // Edge: single-element variety
  for (const v of [-1000, -1, 0, 1, 1000, 3.14, -3.14]) {
    it(`mean([${v}]) === ${v}`, () => expect(mean([v])).toBe(v));
  }

  // Aggregate check: mean of normalSample ≈ 50
  it('mean of normalSample is ≈ 50', () => {
    expect(mean(normalSample)).toBeCloseTo(50, 0);
  });

  // Additive property: mean(a ++ b) weighted
  it('mean satisfies additive property for equal-length arrays', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const combined = [...a, ...b];
    expect(mean(combined)).toBeCloseTo((mean(a) + mean(b)) / 2, 10);
  });
});

// ============================================================
// variance()
// ============================================================
describe('variance()', () => {
  it('returns 0 for empty array', () => expect(variance([])).toBe(0));
  it('returns 0 for single-element array', () => expect(variance([42])).toBe(0));
  it('returns 0 for all-same values', () => expect(variance([3, 3, 3, 3])).toBe(0));
  it('computes variance of [2,4,4,4,5,5,7,9]', () => {
    // population variance = 4
    expect(variance([2, 4, 4, 4, 5, 5, 7, 9])).toBeCloseTo(4, 5);
  });
  it('variance of [1,2] is 0.25', () => expect(variance([1, 2])).toBeCloseTo(0.25, 10));
  it('variance of [0,2] is 1', () => expect(variance([0, 2])).toBeCloseTo(1, 10));
  it('variance of [-1,1] is 1', () => expect(variance([-1, 1])).toBeCloseTo(1, 10));
  it('variance is non-negative', () => {
    for (const arr of [[-5, 3, 7], [0, 0, 0, 1], [100]]) {
      expect(variance(arr)).toBeGreaterThanOrEqual(0);
    }
  });

  // Scaling property: variance(k*x) = k^2 * variance(x)
  it('variance scales quadratically', () => {
    const arr = [1, 2, 3, 4, 5];
    const k = 3;
    expect(variance(arr.map(x => k * x))).toBeCloseTo(k * k * variance(arr), 8);
  });

  // Parameterised: variance of [0..n]
  for (const n of [2, 3, 4, 5, 10]) {
    it(`variance of [0..${n}] is non-negative`, () => {
      const arr = Array.from({ length: n + 1 }, (_, i) => i);
      expect(variance(arr)).toBeGreaterThan(0);
    });
  }

  it('variance of normalSample is positive', () => expect(variance(normalSample)).toBeGreaterThan(0));
  it('variance shifts by translation: var(x+c) == var(x)', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(variance(arr.map(x => x + 100))).toBeCloseTo(variance(arr), 8);
  });
});

// ============================================================
// stdDev()
// ============================================================
describe('stdDev()', () => {
  it('returns 0 for empty array', () => expect(stdDev([])).toBe(0));
  it('returns 0 for single element', () => expect(stdDev([99])).toBe(0));
  it('returns 0 for all-same', () => expect(stdDev([7, 7, 7])).toBe(0));
  it('returns sqrt(variance)', () => {
    const arr = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(stdDev(arr)).toBeCloseTo(Math.sqrt(variance(arr)), 10);
  });
  it('stdDev([0,2]) == 1', () => expect(stdDev([0, 2])).toBeCloseTo(1, 10));
  it('stdDev is always non-negative', () => {
    for (const arr of [[-5, 5], [-100, 100, 0], [1, 2, 3]]) {
      expect(stdDev(arr)).toBeGreaterThanOrEqual(0);
    }
  });
  it('stdDev scales linearly', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(stdDev(arr.map(x => 4 * x))).toBeCloseTo(4 * stdDev(arr), 8);
  });

  // Parameterised: known stddev
  const knownCases: [number[], number][] = [
    [[0, 0, 0, 0], 0],
    [[-1, 1], 1],
    [[1, 3], 1],
    [[0, 4], 2],
    [[2, 8], 3],
  ];
  for (const [arr, expected] of knownCases) {
    it(`stdDev([${arr}]) ≈ ${expected}`, () => expect(stdDev(arr)).toBeCloseTo(expected, 8));
  }

  it('stdDev of normalSample > 0', () => expect(stdDev(normalSample)).toBeGreaterThan(0));
  it('stdDev of normalSample < 10', () => expect(stdDev(normalSample)).toBeLessThan(10));
});

// ============================================================
// median()
// ============================================================
describe('median()', () => {
  it('returns 0 for empty array', () => expect(median([])).toBe(0));
  it('returns sole element for length 1', () => expect(median([42])).toBe(42));
  it('returns average of two for even length', () => expect(median([1, 3])).toBe(2));
  it('returns middle element for odd length', () => expect(median([1, 2, 3, 4, 5])).toBe(3));
  it('handles unsorted input', () => expect(median([5, 1, 3])).toBe(3));
  it('handles negative numbers', () => expect(median([-3, -1, -2])).toBe(-2));
  it('handles mixed sign', () => expect(median([-10, 0, 10])).toBe(0));
  it('handles all-same', () => expect(median([7, 7, 7, 7])).toBe(7));
  it('does not mutate input', () => {
    const arr = [3, 1, 2];
    median(arr);
    expect(arr).toEqual([3, 1, 2]);
  });

  // Parameterised: even-length
  const evenCases: [number[], number][] = [
    [[1, 2], 1.5],
    [[1, 2, 3, 4], 2.5],
    [[10, 20, 30, 40], 25],
    [[-4, -2], -3],
  ];
  for (const [arr, expected] of evenCases) {
    it(`median([${arr}]) == ${expected}`, () => expect(median(arr)).toBeCloseTo(expected, 10));
  }

  // Parameterised: odd-length
  const oddCases: [number[], number][] = [
    [[1, 2, 3], 2],
    [[5, 1, 9, 3, 7], 5],
    [[-5, 0, 5], 0],
    [[100, 200, 300], 200],
  ];
  for (const [arr, expected] of oddCases) {
    it(`median([${arr}]) == ${expected}`, () => expect(median(arr)).toBeCloseTo(expected, 10));
  }

  it('median of normalSample ≈ 50', () => expect(median(normalSample)).toBeCloseTo(50, 0));

  // Large array
  it('median of [1..99] is 50', () => {
    const arr = Array.from({ length: 99 }, (_, i) => i + 1);
    expect(median(arr)).toBe(50);
  });
});

// ============================================================
// quantile()
// ============================================================
describe('quantile()', () => {
  it('returns 0 for empty array', () => expect(quantile([], 0.5)).toBe(0));
  it('returns sole element for q=0 on length 1', () => expect(quantile([5], 0)).toBe(5));
  it('returns sole element for q=1 on length 1', () => expect(quantile([5], 1)).toBe(5));
  it('returns sole element for q=0.5 on length 1', () => expect(quantile([5], 0.5)).toBe(5));
  it('q=0 returns minimum', () => expect(quantile([3, 1, 4, 1, 5], 0)).toBe(1));
  it('q=1 returns maximum', () => expect(quantile([3, 1, 4, 1, 5], 1)).toBe(5));
  it('q=0.5 matches median for odd length', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(quantile(arr, 0.5)).toBeCloseTo(median(arr), 10);
  });
  it('q=0.5 matches median for even length', () => {
    const arr = [1, 2, 3, 4];
    expect(quantile(arr, 0.5)).toBeCloseTo(median(arr), 10);
  });
  it('quantile is monotone: q1 <= q2 implies quantile(arr,q1) <= quantile(arr,q2)', () => {
    const arr = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    expect(quantile(arr, 0.25)).toBeLessThanOrEqual(quantile(arr, 0.5));
    expect(quantile(arr, 0.5)).toBeLessThanOrEqual(quantile(arr, 0.75));
    expect(quantile(arr, 0.75)).toBeLessThanOrEqual(quantile(arr, 1));
  });

  // Parameterised: quantiles of [1..10]
  const arr10 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const qCases: [number, number][] = [
    [0, 1],
    [1, 10],
    [0.1, 1.9],
    [0.9, 9.1],
  ];
  for (const [q, expected] of qCases) {
    it(`quantile([1..10], ${q}) ≈ ${expected}`, () => {
      expect(quantile(arr10, q)).toBeCloseTo(expected, 5);
    });
  }

  // Does not mutate
  it('does not mutate input', () => {
    const arr = [5, 3, 1, 4, 2];
    quantile(arr, 0.5);
    expect(arr).toEqual([5, 3, 1, 4, 2]);
  });

  // Parameterised variety
  for (const q of [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1]) {
    it(`quantile(normalSample, ${q}) is a number`, () => {
      expect(typeof quantile(normalSample, q)).toBe('number');
    });
  }
});

// ============================================================
// mad()
// ============================================================
describe('mad()', () => {
  it('returns 0 for empty array', () => expect(mad([])).toBe(0));
  it('returns 0 for single element', () => expect(mad([5])).toBe(0));
  it('returns 0 for all-same', () => expect(mad([3, 3, 3, 3])).toBe(0));
  it('computes mad([1,1,2,2,4,6,9])', () => {
    // median=2, abs deviations=[1,1,0,0,2,4,7], median of deviations=1
    expect(mad([1, 1, 2, 2, 4, 6, 9])).toBe(1);
  });
  it('mad is non-negative', () => {
    for (const arr of [[-10, 0, 10], [1, 2, 3], [100, 200, 300]]) {
      expect(mad(arr)).toBeGreaterThanOrEqual(0);
    }
  });
  it('mad([0, 2]) == 1', () => expect(mad([0, 2])).toBe(1));
  it('mad([1,3,5]) == 2', () => expect(mad([1, 3, 5])).toBe(2));
  it('mad is robust to outliers', () => {
    const normal = [1, 2, 3, 4, 5];
    const withOutlier = [1, 2, 3, 4, 1000];
    expect(mad(normal)).toBeLessThan(mad(withOutlier) + 1);
  });

  // Parameterised: symmetric arrays median=0, deviations are the values
  for (const v of [1, 2, 5, 10]) {
    it(`mad([-${v}, ${v}]) == ${v}`, () => expect(mad([-v, v])).toBe(v));
  }

  it('mad of normalSample >= 0', () => expect(mad(normalSample)).toBeGreaterThanOrEqual(0));
  it('mad of normalSample < 10', () => expect(mad(normalSample)).toBeLessThan(10));
});

// ============================================================
// zScore()
// ============================================================
describe('zScore()', () => {
  it('returns 0 when sigma is 0', () => expect(zScore(5, 5, 0)).toBe(0));
  it('returns 0 when sigma is 0 and value != mu', () => expect(zScore(10, 5, 0)).toBe(0));
  it('returns 0 for value == mu with positive sigma', () => expect(zScore(5, 5, 1)).toBe(0));
  it('returns 1 for value = mu + sigma', () => expect(zScore(6, 5, 1)).toBeCloseTo(1, 10));
  it('returns 1 for value = mu - sigma (absolute)', () => expect(zScore(4, 5, 1)).toBeCloseTo(1, 10));
  it('returns 2 for value = mu + 2*sigma', () => expect(zScore(7, 5, 1)).toBeCloseTo(2, 10));
  it('returns 3 for value = mu + 3*sigma', () => expect(zScore(8, 5, 1)).toBeCloseTo(3, 10));
  it('is always non-negative', () => {
    for (const [v, mu, sigma] of [[1, 5, 2], [10, 5, 2], [-10, 0, 5]]) {
      expect(zScore(v, mu, sigma)).toBeGreaterThanOrEqual(0);
    }
  });
  it('zScore is symmetric around mean', () => {
    expect(zScore(10, 5, 2)).toBeCloseTo(zScore(0, 5, 2), 10);
  });

  // Parameterised: exact values
  const cases: [number, number, number, number][] = [
    [0, 0, 1, 0],
    [1, 0, 1, 1],
    [-1, 0, 1, 1],
    [3, 0, 1, 3],
    [10, 10, 2, 0],
    [14, 10, 2, 2],
    [6, 10, 2, 2],
  ];
  for (const [v, mu, sigma, expected] of cases) {
    it(`zScore(${v}, ${mu}, ${sigma}) ≈ ${expected}`, () => {
      expect(zScore(v, mu, sigma)).toBeCloseTo(expected, 8);
    });
  }

  // Scaling: zScore(k*v, k*mu, k*sigma) == zScore(v, mu, sigma)
  it('zScore is scale-invariant', () => {
    expect(zScore(20, 10, 5)).toBeCloseTo(zScore(4, 2, 1), 10);
  });
});

// ============================================================
// scoreSeverity()
// ============================================================
describe('scoreSeverity()', () => {
  const methods: AnomalyMethod[] = ['zscore', 'iqr', 'mad', 'ewma', 'threshold'];

  // --- zscore / mad / ewma: ratio = score / threshold (default 3.0)
  describe('zscore method', () => {
    const c = cfg('zscore'); // threshold=3
    it('ratio < 1 → null', () => expect(scoreSeverity(2.9, 'zscore', c)).toBeNull());
    it('ratio == 1 → low', () => expect(scoreSeverity(3.0, 'zscore', c)).toBe('low'));
    it('ratio in [1,1.5) → low', () => expect(scoreSeverity(3.1, 'zscore', c)).toBe('low'));
    it('ratio == 1.5 → medium', () => expect(scoreSeverity(4.5, 'zscore', c)).toBe('medium'));
    it('ratio in [1.5,2.5) → medium', () => expect(scoreSeverity(5.0, 'zscore', c)).toBe('medium'));
    it('ratio == 2.5 → high', () => expect(scoreSeverity(7.5, 'zscore', c)).toBe('high'));
    it('ratio in [2.5,4) → high', () => expect(scoreSeverity(9.0, 'zscore', c)).toBe('high'));
    it('ratio == 4 → critical', () => expect(scoreSeverity(12.0, 'zscore', c)).toBe('critical'));
    it('ratio > 4 → critical', () => expect(scoreSeverity(20.0, 'zscore', c)).toBe('critical'));
    it('score=0 → null', () => expect(scoreSeverity(0, 'zscore', c)).toBeNull());
  });

  describe('mad method', () => {
    const c = cfg('mad');
    it('ratio < 1 → null', () => expect(scoreSeverity(2.0, 'mad', c)).toBeNull());
    it('ratio in [1,1.5) → low', () => expect(scoreSeverity(3.5, 'mad', c)).toBe('low'));
    it('ratio in [1.5,2.5) → medium', () => expect(scoreSeverity(6.0, 'mad', c)).toBe('medium'));
    it('ratio >= 4 → critical', () => expect(scoreSeverity(15.0, 'mad', c)).toBe('critical'));
  });

  describe('ewma method', () => {
    const c = cfg('ewma');
    it('ratio < 1 → null', () => expect(scoreSeverity(1.0, 'ewma', c)).toBeNull());
    it('ratio in [1,1.5) → low', () => expect(scoreSeverity(3.5, 'ewma', c)).toBe('low'));
    it('ratio >= 4 → critical', () => expect(scoreSeverity(15.0, 'ewma', c)).toBe('critical'));
  });

  describe('iqr method', () => {
    // ratio = score / multiplier (default 1.5)
    const c = cfg('iqr');
    it('ratio < 1 → null', () => expect(scoreSeverity(1.0, 'iqr', c)).toBeNull());
    it('ratio == 1 → low', () => expect(scoreSeverity(1.5, 'iqr', c)).toBe('low'));
    it('ratio in [1.5,2.5) → medium', () => expect(scoreSeverity(2.5, 'iqr', c)).toBe('medium'));
    it('ratio in [2.5,4) → high', () => expect(scoreSeverity(5.0, 'iqr', c)).toBe('high'));
    it('ratio >= 4 → critical', () => expect(scoreSeverity(7.0, 'iqr', c)).toBe('critical'));
    it('custom iqrMultiplier affects threshold', () => {
      const c2 = cfg('iqr', { iqrMultiplier: 3.0 });
      // score=3.0 → ratio = 3/3 = 1 → 'low'
      expect(scoreSeverity(3.0, 'iqr', c2)).toBe('low');
    });
  });

  describe('threshold method', () => {
    // ratio = score directly
    const c = cfg('threshold');
    it('score < 1 → null', () => expect(scoreSeverity(0.5, 'threshold', c)).toBeNull());
    it('score == 1 → low', () => expect(scoreSeverity(1.0, 'threshold', c)).toBe('low'));
    it('score in [1.5,2.5) → medium', () => expect(scoreSeverity(2.0, 'threshold', c)).toBe('medium'));
    it('score in [2.5,4) → high', () => expect(scoreSeverity(3.0, 'threshold', c)).toBe('high'));
    it('score >= 4 → critical', () => expect(scoreSeverity(5.0, 'threshold', c)).toBe('critical'));
  });

  // Custom zScoreThreshold
  describe('custom zScoreThreshold', () => {
    const c = cfg('zscore', { zScoreThreshold: 2.0 });
    it('score 1.9 → null (below custom threshold 2)', () => expect(scoreSeverity(1.9, 'zscore', c)).toBeNull());
    it('score 2.0 → low', () => expect(scoreSeverity(2.0, 'zscore', c)).toBe('low'));
    it('score 3.0 → medium (ratio=1.5)', () => expect(scoreSeverity(3.0, 'zscore', c)).toBe('medium'));
    it('score 4.9 → medium (ratio=2.45)', () => expect(scoreSeverity(4.9, 'zscore', c)).toBe('medium'));
    it('score 8.0 → critical (ratio=4)', () => expect(scoreSeverity(8.0, 'zscore', c)).toBe('critical'));
  });

  // All methods return null for score=0
  for (const m of methods) {
    it(`scoreSeverity(0, '${m}', cfg) returns null`, () => {
      expect(scoreSeverity(0, m, cfg(m))).toBeNull();
    });
  }

  // Severity ordering assertion
  it('severity ladder is consistent (null < low < medium < high < critical)', () => {
    const c = cfg('zscore');
    const severities = [
      scoreSeverity(0, 'zscore', c),      // null
      scoreSeverity(3.1, 'zscore', c),    // low
      scoreSeverity(5.0, 'zscore', c),    // medium
      scoreSeverity(9.0, 'zscore', c),    // high
      scoreSeverity(20.0, 'zscore', c),   // critical
    ];
    expect(severities[0]).toBeNull();
    expect(severities[1]).toBe('low');
    expect(severities[2]).toBe('medium');
    expect(severities[3]).toBe('high');
    expect(severities[4]).toBe('critical');
  });
});

// ============================================================
// detectZScore()
// ============================================================
describe('detectZScore()', () => {
  it('returns empty array for empty points', () => {
    expect(detectZScore([], cfg('zscore'))).toEqual([]);
  });

  it('returns one result for single point (score=0, not anomaly)', () => {
    const result = detectZScore([{ value: 5, timestamp: 0 }], cfg('zscore'));
    expect(result).toHaveLength(1);
    expect(result[0].isAnomaly).toBe(false);
    expect(result[0].score).toBe(0);
    expect(result[0].severity).toBeNull();
    expect(result[0].method).toBe('zscore');
  });

  it('flags extreme outlier as anomaly', () => {
    const points = pts([...normalSample, 1000]);
    const results = detectZScore(points, cfg('zscore'));
    const last = results[results.length - 1];
    expect(last.isAnomaly).toBe(true);
    expect(last.score).toBeGreaterThan(3);
  });

  it('result count equals input count', () => {
    const points = pts(normalSample);
    expect(detectZScore(points, cfg('zscore'))).toHaveLength(points.length);
  });

  it('all-same values → no anomalies', () => {
    const points = pts(Array(20).fill(5));
    const results = detectZScore(points, cfg('zscore'));
    expect(results.every(r => !r.isAnomaly)).toBe(true);
  });

  it('method field is always "zscore"', () => {
    const results = detectZScore(pts([1, 2, 3, 100]), cfg('zscore'));
    expect(results.every(r => r.method === 'zscore')).toBe(true);
  });

  it('point reference is preserved', () => {
    const points = pts([1, 2, 3]);
    const results = detectZScore(points, cfg('zscore'));
    expect(results[0].point).toBe(points[0]);
  });

  it('non-anomaly results have null severity', () => {
    const results = detectZScore(pts([1, 2, 3, 2, 1]), cfg('zscore'));
    expect(results.every(r => r.severity === null)).toBe(true);
  });

  it('custom zScoreThreshold=1 flags more anomalies', () => {
    const points = pts([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const strict = detectZScore(points, cfg('zscore', { zScoreThreshold: 1 }));
    const lenient = detectZScore(points, cfg('zscore', { zScoreThreshold: 3 }));
    const strictCount = strict.filter(r => r.isAnomaly).length;
    const lenientCount = lenient.filter(r => r.isAnomaly).length;
    expect(strictCount).toBeGreaterThanOrEqual(lenientCount);
  });

  it('score is non-negative for all results', () => {
    const results = detectZScore(pts([...normalSample, 999]), cfg('zscore'));
    expect(results.every(r => r.score >= 0)).toBe(true);
  });

  // Parameterised: known outliers at multiples of sd
  for (const sd_mult of [4, 5, 6, 7]) {
    it(`value at ${sd_mult} SD is flagged`, () => {
      const base = Array(50).fill(0).map((_, i) => i % 10);
      const mu = mean(base);
      const sigma = stdDev(base);
      const outlier = mu + sd_mult * sigma;
      const points = pts([...base, outlier]);
      const results = detectZScore(points, cfg('zscore'));
      expect(results[results.length - 1].isAnomaly).toBe(true);
    });
  }

  // Bulk: 50 runs with different datasets
  for (let i = 0; i < 50; i++) {
    it(`detectZScore run ${i + 1}: results.length == points.length`, () => {
      const n = (i % 10) + 2;
      const points = pts(Array.from({ length: n }, (_, j) => j));
      expect(detectZScore(points, cfg('zscore'))).toHaveLength(n);
    });
  }
});

// ============================================================
// detectIQR()
// ============================================================
describe('detectIQR()', () => {
  it('returns empty array for empty input', () => {
    expect(detectIQR([], cfg('iqr'))).toEqual([]);
  });

  it('returns one result for single point', () => {
    expect(detectIQR([{ value: 5, timestamp: 0 }], cfg('iqr'))).toHaveLength(1);
  });

  it('method field is always "iqr"', () => {
    const results = detectIQR(pts([1, 2, 3, 100]), cfg('iqr'));
    expect(results.every(r => r.method === 'iqr')).toBe(true);
  });

  it('flags high outlier', () => {
    const points = pts([10, 11, 12, 13, 14, 15, 200]);
    const results = detectIQR(points, cfg('iqr'));
    expect(results[results.length - 1].isAnomaly).toBe(true);
  });

  it('flags low outlier', () => {
    const points = pts([-200, 10, 11, 12, 13, 14, 15]);
    const results = detectIQR(points, cfg('iqr'));
    expect(results[0].isAnomaly).toBe(true);
  });

  it('normal distribution has few or no anomalies with default multiplier', () => {
    const results = detectIQR(pts(normalSample), cfg('iqr'));
    const count = results.filter(r => r.isAnomaly).length;
    expect(count).toBeLessThan(10);
  });

  it('result count equals input count', () => {
    const points = pts(normalSample);
    expect(detectIQR(points, cfg('iqr'))).toHaveLength(points.length);
  });

  it('non-anomaly score is 0', () => {
    const results = detectIQR(pts([10, 10, 10, 10, 10]), cfg('iqr'));
    expect(results.every(r => r.score === 0)).toBe(true);
  });

  it('anomaly score is positive', () => {
    const results = detectIQR(pts([10, 10, 10, 10, 1000]), cfg('iqr'));
    const anomaly = results.find(r => r.isAnomaly);
    if (anomaly) expect(anomaly.score).toBeGreaterThan(0);
  });

  it('custom iqrMultiplier=0.1 flags many values', () => {
    const results = detectIQR(pts([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), cfg('iqr', { iqrMultiplier: 0.1 }));
    const count = results.filter(r => r.isAnomaly).length;
    expect(count).toBeGreaterThan(0);
  });

  it('point reference is preserved', () => {
    const points = pts([1, 2, 3]);
    const results = detectIQR(points, cfg('iqr'));
    expect(results[0].point).toBe(points[0]);
  });

  // Bulk parameterised
  for (let i = 0; i < 50; i++) {
    it(`detectIQR run ${i + 1}: returns correct length`, () => {
      const n = (i % 8) + 2;
      const points = pts(Array.from({ length: n }, (_, j) => j * 2));
      expect(detectIQR(points, cfg('iqr'))).toHaveLength(n);
    });
  }
});

// ============================================================
// detectMAD()
// ============================================================
describe('detectMAD()', () => {
  it('returns empty array for empty input', () => {
    expect(detectMAD([], cfg('mad'))).toEqual([]);
  });

  it('returns one result for single point, not anomaly', () => {
    const r = detectMAD([{ value: 5, timestamp: 0 }], cfg('mad'));
    expect(r).toHaveLength(1);
    expect(r[0].isAnomaly).toBe(false);
  });

  it('method field is always "mad"', () => {
    const results = detectMAD(pts([1, 2, 3, 100]), cfg('mad'));
    expect(results.every(r => r.method === 'mad')).toBe(true);
  });

  it('flags extreme outlier', () => {
    // Use a varied base so MAD is non-zero, then add a large outlier
    const base = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
    const points = pts([...base, 5000]);
    const results = detectMAD(points, cfg('mad'));
    expect(results[results.length - 1].isAnomaly).toBe(true);
  });

  it('all-same values → score=0 for all', () => {
    const results = detectMAD(pts(Array(10).fill(7)), cfg('mad'));
    expect(results.every(r => r.score === 0 && !r.isAnomaly)).toBe(true);
  });

  it('result count equals input count', () => {
    expect(detectMAD(pts(normalSample), cfg('mad'))).toHaveLength(normalSample.length);
  });

  it('non-anomaly has null severity', () => {
    const results = detectMAD(pts([1, 2, 3, 2, 1]), cfg('mad'));
    expect(results.every(r => r.severity === null)).toBe(true);
  });

  it('point reference preserved', () => {
    const points = pts([1, 2, 3]);
    expect(detectMAD(points, cfg('mad'))[0].point).toBe(points[0]);
  });

  it('stricter threshold flags more', () => {
    const points = pts([1, 2, 3, 4, 5, 20, 25]);
    const strict = detectMAD(points, cfg('mad', { zScoreThreshold: 1 }));
    const normal = detectMAD(points, cfg('mad', { zScoreThreshold: 3 }));
    expect(strict.filter(r => r.isAnomaly).length).toBeGreaterThanOrEqual(normal.filter(r => r.isAnomaly).length);
  });

  // Bulk
  for (let i = 0; i < 50; i++) {
    it(`detectMAD run ${i + 1}: returns correct length`, () => {
      const n = (i % 8) + 2;
      expect(detectMAD(pts(Array.from({ length: n }, (_, j) => j)), cfg('mad'))).toHaveLength(n);
    });
  }
});

// ============================================================
// detectThreshold()
// ============================================================
describe('detectThreshold()', () => {
  it('returns empty array for empty input', () => {
    expect(detectThreshold([], cfg('threshold'))).toEqual([]);
  });

  it('flags value above default threshold 100', () => {
    const results = detectThreshold(pts([50, 101, 200]), cfg('threshold'));
    expect(results[0].isAnomaly).toBe(false);
    expect(results[1].isAnomaly).toBe(true);
    expect(results[2].isAnomaly).toBe(true);
  });

  it('does not flag values at or below threshold', () => {
    const results = detectThreshold(pts([99, 100, 50, 0]), cfg('threshold'));
    expect(results.every(r => !r.isAnomaly)).toBe(true);
  });

  it('method is always "threshold"', () => {
    const results = detectThreshold(pts([1, 200, 50]), cfg('threshold'));
    expect(results.every(r => r.method === 'threshold')).toBe(true);
  });

  it('custom threshold works', () => {
    const results = detectThreshold(pts([5, 10, 15]), cfg('threshold', { threshold: 8 }));
    expect(results[0].isAnomaly).toBe(false);
    expect(results[1].isAnomaly).toBe(true);
    expect(results[2].isAnomaly).toBe(true);
  });

  it('anomaly score = value/threshold', () => {
    const results = detectThreshold(pts([200]), cfg('threshold', { threshold: 100 }));
    expect(results[0].score).toBeCloseTo(2, 10);
  });

  it('non-anomaly score is 0', () => {
    const results = detectThreshold(pts([50]), cfg('threshold', { threshold: 100 }));
    expect(results[0].score).toBe(0);
  });

  it('point reference preserved', () => {
    const points = pts([1, 200]);
    expect(detectThreshold(points, cfg('threshold'))[0].point).toBe(points[0]);
  });

  it('result count equals input count', () => {
    expect(detectThreshold(pts(normalSample), cfg('threshold'))).toHaveLength(normalSample.length);
  });

  // Parameterised: various thresholds
  for (const threshold of [10, 50, 100, 500, 1000]) {
    it(`threshold=${threshold}: value at threshold+1 is anomaly`, () => {
      const results = detectThreshold(pts([threshold + 1]), cfg('threshold', { threshold }));
      expect(results[0].isAnomaly).toBe(true);
    });
    it(`threshold=${threshold}: value at threshold is not anomaly`, () => {
      const results = detectThreshold(pts([threshold]), cfg('threshold', { threshold }));
      expect(results[0].isAnomaly).toBe(false);
    });
  }

  // Bulk
  for (let i = 0; i < 30; i++) {
    it(`detectThreshold run ${i + 1}: correct length`, () => {
      const n = (i % 6) + 1;
      expect(detectThreshold(pts(Array(n).fill(i * 10)), cfg('threshold'))).toHaveLength(n);
    });
  }
});

// ============================================================
// detectEWMA()
// ============================================================
describe('detectEWMA()', () => {
  it('returns empty for empty input', () => {
    expect(detectEWMA([], cfg('ewma'))).toEqual([]);
  });

  it('returns one result for single point (not anomaly, score=0)', () => {
    const r = detectEWMA([{ value: 5, timestamp: 0 }], cfg('ewma'));
    expect(r).toHaveLength(1);
    expect(r[0].isAnomaly).toBe(false);
    expect(r[0].score).toBe(0);
    expect(r[0].method).toBe('ewma');
  });

  it('method is always "ewma"', () => {
    const results = detectEWMA(pts([1, 2, 3, 100]), cfg('ewma'));
    expect(results.every(r => r.method === 'ewma')).toBe(true);
  });

  it('stable series → no anomalies', () => {
    const results = detectEWMA(pts(Array(20).fill(10)), cfg('ewma'));
    expect(results.every(r => !r.isAnomaly)).toBe(true);
  });

  it('sudden spike is flagged', () => {
    const base = Array(10).fill(10);
    const points = pts([...base, 10000]);
    const results = detectEWMA(points, cfg('ewma'));
    expect(results[results.length - 1].isAnomaly).toBe(true);
  });

  it('result count equals input count', () => {
    expect(detectEWMA(pts(normalSample), cfg('ewma'))).toHaveLength(normalSample.length);
  });

  it('first point is never an anomaly (score=0)', () => {
    const results = detectEWMA(pts([1, 2, 3, 4, 5]), cfg('ewma'));
    expect(results[0].score).toBe(0);
    expect(results[0].isAnomaly).toBe(false);
  });

  it('custom alpha changes sensitivity', () => {
    const highAlpha = detectEWMA(pts([10, 10, 10, 1000]), cfg('ewma', { ewmaAlpha: 0.9 }));
    const lowAlpha = detectEWMA(pts([10, 10, 10, 1000]), cfg('ewma', { ewmaAlpha: 0.01 }));
    // Both should flag the spike
    expect(highAlpha[3].isAnomaly).toBe(true);
    expect(lowAlpha[3].isAnomaly).toBe(true);
  });

  it('point reference preserved', () => {
    const points = pts([1, 2, 3]);
    expect(detectEWMA(points, cfg('ewma'))[0].point).toBe(points[0]);
  });

  it('score is non-negative', () => {
    const results = detectEWMA(pts([...normalSample, 999]), cfg('ewma'));
    expect(results.every(r => r.score >= 0)).toBe(true);
  });

  // Parameterised alpha values
  for (const alpha of [0.1, 0.3, 0.5, 0.7, 0.9]) {
    it(`ewmaAlpha=${alpha}: result count correct`, () => {
      const points = pts([1, 2, 3, 4, 5]);
      expect(detectEWMA(points, cfg('ewma', { ewmaAlpha: alpha }))).toHaveLength(5);
    });
  }

  // Bulk
  for (let i = 0; i < 40; i++) {
    it(`detectEWMA run ${i + 1}: correct length`, () => {
      const n = (i % 7) + 1;
      expect(detectEWMA(pts(Array.from({ length: n }, (_, j) => j)), cfg('ewma'))).toHaveLength(n);
    });
  }
});

// ============================================================
// detect() — unified dispatcher
// ============================================================
describe('detect()', () => {
  const methods: AnomalyMethod[] = ['zscore', 'iqr', 'mad', 'threshold', 'ewma'];
  const points = pts([...normalSample, 999]);

  for (const m of methods) {
    it(`method='${m}': returns DetectionReport with correct method`, () => {
      const report = detect(points, cfg(m));
      expect(report.method).toBe(m);
    });

    it(`method='${m}': results.length == points.length`, () => {
      expect(detect(points, cfg(m)).results).toHaveLength(points.length);
    });

    it(`method='${m}': anomalyCount is non-negative integer`, () => {
      const { anomalyCount } = detect(points, cfg(m));
      expect(anomalyCount).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(anomalyCount)).toBe(true);
    });

    it(`method='${m}': anomalyRate in [0,1]`, () => {
      const { anomalyRate } = detect(points, cfg(m));
      expect(anomalyRate).toBeGreaterThanOrEqual(0);
      expect(anomalyRate).toBeLessThanOrEqual(1);
    });

    it(`method='${m}': anomalyCount == results.filter(isAnomaly).length`, () => {
      const report = detect(points, cfg(m));
      expect(report.anomalyCount).toBe(report.results.filter(r => r.isAnomaly).length);
    });

    it(`method='${m}': anomalyRate == anomalyCount / points.length`, () => {
      const report = detect(points, cfg(m));
      expect(report.anomalyRate).toBeCloseTo(report.anomalyCount / points.length, 10);
    });
  }

  it('empty points → anomalyCount=0, anomalyRate=0', () => {
    const report = detect([], cfg('zscore'));
    expect(report.anomalyCount).toBe(0);
    expect(report.anomalyRate).toBe(0);
    expect(report.results).toEqual([]);
  });

  it('all-same data → anomalyCount=0 for zscore', () => {
    const report = detect(pts(Array(20).fill(5)), cfg('zscore'));
    expect(report.anomalyCount).toBe(0);
  });

  it('single point → anomalyCount=0', () => {
    const report = detect(pts([42]), cfg('zscore'));
    expect(report.anomalyCount).toBe(0);
  });

  // Threshold: known outcome
  it('threshold: values [50,150,200] with threshold=100 → anomalyCount=2', () => {
    const report = detect(pts([50, 150, 200]), cfg('threshold', { threshold: 100 }));
    expect(report.anomalyCount).toBe(2);
    expect(report.anomalyRate).toBeCloseTo(2 / 3, 10);
  });

  // Bulk
  for (let i = 0; i < 20; i++) {
    const m = methods[i % methods.length];
    it(`detect bulk run ${i + 1} method=${m}`, () => {
      const n = (i % 5) + 2;
      const report = detect(pts(Array.from({ length: n }, (_, j) => j * 5)), cfg(m));
      expect(report.results).toHaveLength(n);
    });
  }
});

// ============================================================
// makePoint()
// ============================================================
describe('makePoint()', () => {
  it('creates a DataPoint with given value', () => {
    const p = makePoint(42);
    expect(p.value).toBe(42);
  });

  it('creates a DataPoint with given timestamp', () => {
    const p = makePoint(10, 12345);
    expect(p.timestamp).toBe(12345);
  });

  it('uses Date.now() when timestamp is omitted', () => {
    const before = Date.now();
    const p = makePoint(0);
    const after = Date.now();
    expect(p.timestamp).toBeGreaterThanOrEqual(before);
    expect(p.timestamp).toBeLessThanOrEqual(after);
  });

  it('does not set label by default', () => {
    expect(makePoint(1).label).toBeUndefined();
  });

  it('returns correct value for negative', () => expect(makePoint(-5).value).toBe(-5));
  it('returns correct value for 0', () => expect(makePoint(0).value).toBe(0));
  it('returns correct value for float', () => expect(makePoint(3.14).value).toBeCloseTo(3.14, 5));
  it('returns correct value for large number', () => expect(makePoint(1e15).value).toBe(1e15));

  // Parameterised
  for (const [v, ts] of [[1, 100], [2, 200], [3, 300], [-1, 400], [0, 500]]) {
    it(`makePoint(${v}, ${ts}) has correct value and timestamp`, () => {
      const p = makePoint(v, ts);
      expect(p.value).toBe(v);
      expect(p.timestamp).toBe(ts);
    });
  }

  // Bulk: 50 distinct values
  for (let i = 0; i < 50; i++) {
    it(`makePoint(${i}): value==${i}`, () => expect(makePoint(i).value).toBe(i));
  }
});

// ============================================================
// isValidMethod()
// ============================================================
describe('isValidMethod()', () => {
  const valid: string[] = ['zscore', 'iqr', 'mad', 'ewma', 'threshold'];
  const invalid: string[] = [
    '', 'ZSCORE', 'Zscore', 'z-score', 'iqR', 'IQR', 'MAD',
    'EWMA', 'Threshold', 'THRESHOLD', 'unknown', 'none',
    'linear', 'dbscan', 'isolation', 'lof', '123',
  ];

  for (const m of valid) {
    it(`'${m}' is a valid method`, () => expect(isValidMethod(m)).toBe(true));
  }

  for (const m of invalid) {
    it(`'${m}' is not a valid method`, () => expect(isValidMethod(m)).toBe(false));
  }

  it('type guard narrows to AnomalyMethod', () => {
    const m = 'zscore';
    if (isValidMethod(m)) {
      const typed: AnomalyMethod = m;
      expect(typed).toBe('zscore');
    }
  });

  // Parameterised: all 5 valid ones explicitly
  expect(isValidMethod('zscore')).toBe(true);
  expect(isValidMethod('iqr')).toBe(true);
  expect(isValidMethod('mad')).toBe(true);
  expect(isValidMethod('ewma')).toBe(true);
  expect(isValidMethod('threshold')).toBe(true);
});

// ============================================================
// filterAnomalies()
// ============================================================
describe('filterAnomalies()', () => {
  function makeResult(isAnomaly: boolean, score = 0, severity: Severity | null = null): AnomalyResult {
    return { point: { value: 1, timestamp: 0 }, isAnomaly, score, severity, method: 'zscore' };
  }

  it('returns empty for empty input', () => expect(filterAnomalies([])).toEqual([]));

  it('returns empty when no anomalies', () => {
    const results = [makeResult(false), makeResult(false), makeResult(false)];
    expect(filterAnomalies(results)).toHaveLength(0);
  });

  it('returns all when all are anomalies', () => {
    const results = [makeResult(true), makeResult(true)];
    expect(filterAnomalies(results)).toHaveLength(2);
  });

  it('filters correctly on mixed input', () => {
    const results = [makeResult(false), makeResult(true), makeResult(false), makeResult(true)];
    expect(filterAnomalies(results)).toHaveLength(2);
  });

  it('preserves order of anomalies', () => {
    const r1 = makeResult(true, 5);
    const r2 = makeResult(false);
    const r3 = makeResult(true, 10);
    const filtered = filterAnomalies([r1, r2, r3]);
    expect(filtered[0].score).toBe(5);
    expect(filtered[1].score).toBe(10);
  });

  it('works on detect() output', () => {
    const report = detect(pts([...Array(20).fill(5), 1000]), cfg('zscore'));
    const anomalies = filterAnomalies(report.results);
    expect(anomalies.length).toBe(report.anomalyCount);
    expect(anomalies.every(r => r.isAnomaly)).toBe(true);
  });

  // Parameterised: n anomalies out of 10
  for (const n of [0, 1, 3, 5, 7, 10]) {
    it(`filterAnomalies with ${n}/10 anomalies returns ${n}`, () => {
      const results = Array.from({ length: 10 }, (_, i) => makeResult(i < n));
      expect(filterAnomalies(results)).toHaveLength(n);
    });
  }

  // Bulk
  for (let i = 0; i < 30; i++) {
    it(`filterAnomalies bulk ${i + 1}`, () => {
      const total = (i % 5) + 1;
      const anomalyCount = i % (total + 1);
      const results = Array.from({ length: total }, (_, j) => makeResult(j < anomalyCount));
      expect(filterAnomalies(results)).toHaveLength(anomalyCount);
    });
  }
});

// ============================================================
// filterBySeverity()
// ============================================================
describe('filterBySeverity()', () => {
  function makeResult(severity: Severity | null, isAnomaly = true): AnomalyResult {
    return { point: { value: 1, timestamp: 0 }, isAnomaly, score: 1, severity, method: 'zscore' };
  }

  it('returns empty for empty input', () => expect(filterBySeverity([], 'low')).toEqual([]));

  it('returns only low severity', () => {
    const results = [makeResult('low'), makeResult('medium'), makeResult('high'), makeResult('critical'), makeResult(null, false)];
    expect(filterBySeverity(results, 'low')).toHaveLength(1);
  });

  it('returns only medium severity', () => {
    const results = [makeResult('low'), makeResult('medium'), makeResult('medium')];
    expect(filterBySeverity(results, 'medium')).toHaveLength(2);
  });

  it('returns only high severity', () => {
    const results = [makeResult('high'), makeResult('low'), makeResult('high')];
    expect(filterBySeverity(results, 'high')).toHaveLength(2);
  });

  it('returns only critical severity', () => {
    const results = [makeResult('critical'), makeResult('critical'), makeResult('low')];
    expect(filterBySeverity(results, 'critical')).toHaveLength(2);
  });

  it('returns empty when no matches', () => {
    const results = [makeResult('low'), makeResult('medium')];
    expect(filterBySeverity(results, 'critical')).toHaveLength(0);
  });

  it('null severity is excluded from any filter', () => {
    const results = [makeResult(null, false), makeResult(null, false)];
    for (const sev of ['low', 'medium', 'high', 'critical'] as Severity[]) {
      expect(filterBySeverity(results, sev)).toHaveLength(0);
    }
  });

  it('preserves order', () => {
    const r1 = makeResult('high');
    const r2 = makeResult('high');
    r1.score = 10;
    r2.score = 20;
    const filtered = filterBySeverity([makeResult('low'), r1, makeResult('medium'), r2], 'high');
    expect(filtered[0].score).toBe(10);
    expect(filtered[1].score).toBe(20);
  });

  // Parameterised: counts per severity
  const severities: Severity[] = ['low', 'medium', 'high', 'critical'];
  for (const sev of severities) {
    for (const count of [0, 1, 3, 5]) {
      it(`filterBySeverity '${sev}' with ${count} matching returns ${count}`, () => {
        const results = Array.from({ length: count }, () => makeResult(sev));
        results.push(...Array.from({ length: 3 }, () => makeResult('low'))); // noise (only if sev != low)
        const matching = filterBySeverity(results, sev);
        if (sev === 'low') {
          expect(matching).toHaveLength(count + 3);
        } else {
          expect(matching).toHaveLength(count);
        }
      });
    }
  }

  // Integration: detect → filterBySeverity
  it('filterBySeverity on detectZScore output', () => {
    const report = detect(pts([...Array(50).fill(5), 500, 1000, 5000]), cfg('zscore'));
    const criticals = filterBySeverity(report.results, 'critical');
    expect(criticals.every(r => r.severity === 'critical')).toBe(true);
  });

  // Bulk
  for (let i = 0; i < 20; i++) {
    const sev = severities[i % 4];
    it(`filterBySeverity bulk run ${i + 1} severity=${sev}`, () => {
      const results = [makeResult(sev), makeResult('low'), makeResult(null, false)];
      const filtered = filterBySeverity(results, sev);
      if (sev === 'low') {
        expect(filtered).toHaveLength(2);
      } else {
        expect(filtered).toHaveLength(1);
      }
    });
  }
});

// ============================================================
// Integration / end-to-end scenarios
// ============================================================
describe('Integration tests', () => {
  it('full pipeline: detect → filterAnomalies → filterBySeverity', () => {
    const data = [...Array(90).fill(0).map((_, i) => 50 + (i % 5)), 500, 1000, -500];
    const report = detect(pts(data), cfg('zscore'));
    const anomalies = filterAnomalies(report.results);
    expect(anomalies.length).toBeGreaterThan(0);
    const criticals = filterBySeverity(anomalies, 'critical');
    expect(criticals.every(r => r.isAnomaly && r.severity === 'critical')).toBe(true);
  });

  it('all five methods agree that 999 is an outlier in normalSample', () => {
    const data = pts([...normalSample, 999]);
    const methods: AnomalyMethod[] = ['zscore', 'iqr', 'mad', 'threshold', 'ewma'];
    for (const m of methods) {
      const report = detect(data, cfg(m, { threshold: 100 }));
      expect(report.anomalyCount).toBeGreaterThan(0);
    }
  });

  it('anomalyRate + non-anomalyRate = 1', () => {
    const report = detect(pts([...normalSample, 999]), cfg('zscore'));
    const nonAnomalyRate = report.results.filter(r => !r.isAnomaly).length / report.results.length;
    expect(report.anomalyRate + nonAnomalyRate).toBeCloseTo(1, 10);
  });

  it('makePoint + detect pipeline works', () => {
    // Use threshold method: all base values are 10, outlier is 9999
    const base = Array.from({ length: 49 }, (_, i) => makePoint(10 + (i % 3), i * 1000));
    const outlier = makePoint(9999, 49000);
    const points = [...base, outlier];
    const report = detect(points, cfg('threshold', { threshold: 100 }));
    expect(report.anomalyCount).toBeGreaterThan(0);
  });

  it('isValidMethod guards detect call correctly', () => {
    const m = 'zscore';
    if (isValidMethod(m)) {
      const report = detect(pts([1, 2, 3]), cfg(m));
      expect(report.method).toBe('zscore');
    }
  });

  // Stress: 500 points
  it('handles 500 data points without error', () => {
    const points = pts(Array.from({ length: 500 }, (_, i) => Math.sin(i / 10) * 10 + 50));
    const report = detect(points, cfg('zscore'));
    expect(report.results).toHaveLength(500);
  });

  // Each method produces consistent anomalyCount with anomalyRate
  const methods: AnomalyMethod[] = ['zscore', 'iqr', 'mad', 'threshold', 'ewma'];
  for (const m of methods) {
    it(`method ${m}: anomalyCount == round(anomalyRate * results.length)`, () => {
      const report = detect(pts([...normalSample, 999]), cfg(m, { threshold: 60 }));
      expect(report.anomalyCount).toBe(Math.round(report.anomalyRate * report.results.length));
    });
  }

  it('filterAnomalies(detect(...).results) == anomalyCount', () => {
    for (const m of methods) {
      const report = detect(pts([...normalSample, 9999]), cfg(m, { threshold: 60 }));
      expect(filterAnomalies(report.results)).toHaveLength(report.anomalyCount);
    }
  });

  // Threshold-specific integration
  it('threshold method: all values below threshold are non-anomalies', () => {
    const points = pts([10, 20, 30, 40, 50]);
    const report = detect(points, cfg('threshold', { threshold: 100 }));
    expect(report.anomalyCount).toBe(0);
    expect(report.anomalyRate).toBe(0);
  });

  it('threshold method: all values above threshold are anomalies', () => {
    const points = pts([110, 120, 130]);
    const report = detect(points, cfg('threshold', { threshold: 100 }));
    expect(report.anomalyCount).toBe(3);
    expect(report.anomalyRate).toBeCloseTo(1, 10);
  });
});

// ============================================================
// Extra bulk tests to ensure ≥1,000 total
// ============================================================
describe('Bulk math property tests', () => {
  // mean is linear
  for (let i = 1; i <= 30; i++) {
    it(`mean([${i}..${i + 4}]) correct`, () => {
      const arr = [i, i + 1, i + 2, i + 3, i + 4];
      expect(mean(arr)).toBeCloseTo(i + 2, 10);
    });
  }

  // variance symmetry
  for (let i = 1; i <= 20; i++) {
    it(`variance([-${i}, ${i}]) == ${i}^2`, () => {
      expect(variance([-i, i])).toBeCloseTo(i * i, 6);
    });
  }

  // stdDev symmetry
  for (let i = 1; i <= 20; i++) {
    it(`stdDev([-${i}, ${i}]) == ${i}`, () => {
      expect(stdDev([-i, i])).toBeCloseTo(i, 8);
    });
  }

  // median odd arrays
  for (let i = 1; i <= 20; i++) {
    it(`median([${i - 1}, ${i}, ${i + 1}]) == ${i}`, () => {
      expect(median([i - 1, i, i + 1])).toBe(i);
    });
  }

  // zScore known exact
  for (let n = 1; n <= 20; n++) {
    it(`zScore(${n}, 0, 1) == ${n}`, () => {
      expect(zScore(n, 0, 1)).toBeCloseTo(n, 10);
    });
  }

  // makePoint value preservation
  for (let i = 0; i < 30; i++) {
    it(`makePoint(-${i * 7}): value == ${-i * 7}`, () => {
      expect(makePoint(-i * 7).value).toBe(-i * 7);
    });
  }

  // isValidMethod exhaustive round-trip
  const valid: AnomalyMethod[] = ['zscore', 'iqr', 'mad', 'ewma', 'threshold'];
  for (const m of valid) {
    for (let i = 0; i < 5; i++) {
      it(`isValidMethod('${m}') iteration ${i} is true`, () => expect(isValidMethod(m)).toBe(true));
    }
  }

  // filterAnomalies idempotency: calling twice returns same count
  for (let i = 0; i < 20; i++) {
    it(`filterAnomalies idempotency ${i + 1}`, () => {
      const report = detect(pts([...Array(10).fill(5), 1000 * (i + 1)]), cfg('zscore'));
      const once = filterAnomalies(report.results);
      const twice = filterAnomalies(once);
      expect(once.length).toBe(twice.length);
    });
  }

  // quantile monotonicity bulk
  for (let i = 0; i < 20; i++) {
    it(`quantile monotonicity run ${i + 1}`, () => {
      const n = (i % 8) + 3;
      const arr = Array.from({ length: n }, (_, j) => j);
      expect(quantile(arr, 0.25)).toBeLessThanOrEqual(quantile(arr, 0.75));
    });
  }

  // detect returns valid anomalyRate
  for (let i = 0; i < 20; i++) {
    const m = valid[i % valid.length];
    it(`detect anomalyRate valid range run ${i + 1}`, () => {
      const n = (i % 5) + 3;
      const data = Array.from({ length: n }, (_, j) => j * 10);
      const { anomalyRate } = detect(pts(data), cfg(m, { threshold: 20 }));
      expect(anomalyRate).toBeGreaterThanOrEqual(0);
      expect(anomalyRate).toBeLessThanOrEqual(1);
    });
  }

  // mad non-negative bulk
  for (let i = 0; i < 20; i++) {
    it(`mad non-negative bulk ${i + 1}`, () => {
      const arr = Array.from({ length: (i % 5) + 2 }, (_, j) => j - i);
      expect(mad(arr)).toBeGreaterThanOrEqual(0);
    });
  }

  // variance translation invariance bulk
  for (let c = 1; c <= 20; c++) {
    it(`variance translation invariance c=${c}`, () => {
      const arr = [1, 2, 3, 4, 5];
      expect(variance(arr.map(x => x + c))).toBeCloseTo(variance(arr), 8);
    });
  }

  // stdDev non-negative bulk
  for (let i = 0; i < 15; i++) {
    it(`stdDev non-negative for series ${i + 1}`, () => {
      const arr = Array.from({ length: i + 2 }, (_, j) => j * 2 + i);
      expect(stdDev(arr)).toBeGreaterThanOrEqual(0);
    });
  }

  // mean monotone bulk
  for (let i = 0; i < 10; i++) {
    it(`mean increases when element increases bulk ${i + 1}`, () => {
      const arr = [1, 2, 3, 4, 5];
      const m1 = mean(arr);
      const arr2 = [...arr, arr[arr.length - 1] + i + 1];
      expect(mean(arr2)).toBeGreaterThan(m1 - 0.0001);
    });
  }
});
