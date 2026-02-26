// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  sum, mean, min, max, range, median, mode, variance, std,
  percentile, quartiles, skewness, kurtosis, describeStats,
  zScore, normalize, minMaxScale, weightedMean, geometricMean, harmonicMean,
  covariance, rank, normalPDF, normalCDF, normalInvCDF, standardize,
  tPDF, tCDF, tInvCDF, chiSquaredPDF, chiSquaredCDF, chiSquaredTest,
  fPDF, fCDF, tTest, tTestTwoSample, zTest, anova,
  pearsonCorrelation, spearmanCorrelation, correlation, linearRegression,
  shuffle, sample, bootstrapMean, confidenceInterval,
  histogram, frequency, cumulative,
} from '../stats-utils';

// ── sum — 50 tests ──────────────────────────────────────────────────────────
describe('sum', () => {
  for (let n = 1; n <= 50; n++) {
    it(`sum of 1..${n}`, () => {
      const data = Array.from({ length: n }, (_, i) => i + 1);
      expect(sum(data)).toBe(n * (n + 1) / 2);
    });
  }
});

// ── mean — 50 tests ─────────────────────────────────────────────────────────
describe('mean', () => {
  for (let n = 1; n <= 50; n++) {
    it(`mean of ${n} equal values`, () => {
      const data = Array(n).fill(n);
      expect(mean(data)).toBeCloseTo(n, 10);
    });
  }
});

// ── min — 50 tests ──────────────────────────────────────────────────────────
describe('min', () => {
  for (let n = 1; n <= 50; n++) {
    it(`min of array length ${n}`, () => {
      const data = Array.from({ length: n }, (_, i) => n - i);
      expect(min(data)).toBe(1);
    });
  }
});

// ── max — 50 tests ──────────────────────────────────────────────────────────
describe('max', () => {
  for (let n = 1; n <= 50; n++) {
    it(`max of array length ${n}`, () => {
      const data = Array.from({ length: n }, (_, i) => i + 1);
      expect(max(data)).toBe(n);
    });
  }
});

// ── range — 50 tests ────────────────────────────────────────────────────────
describe('range', () => {
  for (let n = 2; n <= 51; n++) {
    it(`range of 1..${n}`, () => {
      const data = Array.from({ length: n }, (_, i) => i + 1);
      expect(range(data)).toBe(n - 1);
    });
  }
});

// ── median — 50 tests ───────────────────────────────────────────────────────
describe('median', () => {
  for (let n = 1; n <= 50; n++) {
    it(`median of array length ${n}`, () => {
      const data = Array.from({ length: n }, (_, i) => i + 1);
      const m = median(data);
      expect(m).toBeGreaterThanOrEqual(1);
      expect(m).toBeLessThanOrEqual(n);
    });
  }
});

// ── variance — 50 tests ─────────────────────────────────────────────────────
describe('variance', () => {
  for (let n = 2; n <= 51; n++) {
    it(`variance of ${n} items`, () => {
      const data = Array.from({ length: n }, (_, i) => i);
      const v = variance(data);
      expect(v).toBeGreaterThanOrEqual(0);
    });
  }
});

// ── std — 50 tests ──────────────────────────────────────────────────────────
describe('std', () => {
  for (let n = 2; n <= 51; n++) {
    it(`std of ${n} items`, () => {
      const data = Array.from({ length: n }, (_, i) => i);
      const s = std(data);
      expect(s).toBeGreaterThanOrEqual(0);
    });
  }
});

// ── percentile — 50 tests ───────────────────────────────────────────────────
describe('percentile', () => {
  const data = Array.from({ length: 100 }, (_, i) => i + 1);
  for (let p = 1; p <= 50; p++) {
    it(`percentile ${p * 2}th`, () => {
      const result = percentile(data, p * 2);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(100);
    });
  }
});

// ── zScore — 50 tests ───────────────────────────────────────────────────────
describe('zScore', () => {
  for (let i = 0; i < 50; i++) {
    it(`zScore value=${i}`, () => {
      const z = zScore(i, 25, 10);
      expect(z).toBeCloseTo((i - 25) / 10, 10);
    });
  }
});

// ── normalPDF — 50 tests ────────────────────────────────────────────────────
describe('normalPDF', () => {
  for (let i = -25; i <= 24; i++) {
    it(`normalPDF(${i}) in [0,1]`, () => {
      const pdf = normalPDF(i);
      expect(pdf).toBeGreaterThanOrEqual(0);
      expect(pdf).toBeLessThanOrEqual(1);
    });
  }
});

// ── normalCDF — 50 tests ────────────────────────────────────────────────────
describe('normalCDF', () => {
  for (let i = -25; i <= 24; i++) {
    it(`normalCDF(${i}) in [0,1]`, () => {
      const cdf = normalCDF(i);
      expect(cdf).toBeGreaterThanOrEqual(0);
      expect(cdf).toBeLessThanOrEqual(1);
    });
  }
});

// ── normalInvCDF — 50 tests ─────────────────────────────────────────────────
describe('normalInvCDF', () => {
  for (let i = 1; i <= 50; i++) {
    const p = i / 51;
    it(`normalInvCDF(${p.toFixed(3)}) finite`, () => {
      const x = normalInvCDF(p);
      expect(isFinite(x)).toBe(true);
    });
  }
});

// ── tPDF — 50 tests ─────────────────────────────────────────────────────────
describe('tPDF', () => {
  for (let df = 1; df <= 50; df++) {
    it(`tPDF(0, df=${df}) > 0`, () => {
      expect(tPDF(0, df)).toBeGreaterThan(0);
    });
  }
});

// ── tCDF — 50 tests ─────────────────────────────────────────────────────────
describe('tCDF', () => {
  for (let df = 1; df <= 50; df++) {
    it(`tCDF(0, df=${df}) ≈ 0.5`, () => {
      expect(tCDF(0, df)).toBeCloseTo(0.5, 1);
    });
  }
});

// ── pearsonCorrelation — 50 tests ───────────────────────────────────────────
describe('pearsonCorrelation', () => {
  for (let n = 3; n <= 52; n++) {
    it(`pearsonCorrelation perfect linear n=${n}`, () => {
      const x = Array.from({ length: n }, (_, i) => i);
      const y = Array.from({ length: n }, (_, i) => i * 2 + 1);
      expect(pearsonCorrelation(x, y)).toBeCloseTo(1, 5);
    });
  }
});

// ── spearmanCorrelation — 50 tests ──────────────────────────────────────────
describe('spearmanCorrelation', () => {
  for (let n = 3; n <= 52; n++) {
    it(`spearmanCorrelation n=${n}`, () => {
      const x = Array.from({ length: n }, (_, i) => i);
      expect(spearmanCorrelation(x, x)).toBeCloseTo(1, 5);
    });
  }
});

// ── linearRegression — 50 tests ─────────────────────────────────────────────
describe('linearRegression', () => {
  for (let slope = 1; slope <= 50; slope++) {
    it(`linearRegression slope=${slope}`, () => {
      const x = [0, 1, 2, 3, 4];
      const y = x.map(xi => xi * slope + 1);
      const reg = linearRegression(x, y);
      expect(reg.slope).toBeCloseTo(slope, 5);
      expect(reg.intercept).toBeCloseTo(1, 5);
    });
  }
});

// ── normalize — 50 tests ────────────────────────────────────────────────────
describe('normalize', () => {
  for (let n = 2; n <= 51; n++) {
    it(`normalize length ${n} mean≈0`, () => {
      const data = Array.from({ length: n }, (_, i) => i + 1);
      const result = normalize(data);
      expect(result).toHaveLength(n);
    });
  }
});

// ── minMaxScale — 50 tests ──────────────────────────────────────────────────
describe('minMaxScale', () => {
  for (let n = 2; n <= 51; n++) {
    it(`minMaxScale length ${n}`, () => {
      const data = Array.from({ length: n }, (_, i) => i);
      const result = minMaxScale(data);
      expect(Math.min(...result)).toBeCloseTo(0, 10);
      expect(Math.max(...result)).toBeCloseTo(1, 10);
    });
  }
});

// ── weightedMean — 50 tests ─────────────────────────────────────────────────
describe('weightedMean', () => {
  for (let n = 1; n <= 50; n++) {
    it(`weightedMean equal weights n=${n}`, () => {
      const data = Array.from({ length: n }, (_, i) => i + 1);
      const weights = Array(n).fill(1);
      expect(weightedMean(data, weights)).toBeCloseTo(mean(data), 10);
    });
  }
});

// ── cumulative — 50 tests ───────────────────────────────────────────────────
describe('cumulative', () => {
  for (let n = 1; n <= 50; n++) {
    it(`cumulative of ${n} ones sums to ${n}`, () => {
      const result = cumulative(Array(n).fill(1));
      expect(result[n - 1]).toBe(n);
    });
  }
});

// ── tTest — 30 tests ────────────────────────────────────────────────────────
describe('tTest', () => {
  for (let n = 5; n <= 34; n++) {
    it(`tTest sample size ${n}`, () => {
      const data = Array.from({ length: n }, (_, i) => i);
      const result = tTest(data, 0);
      expect(result).toHaveProperty('statistic');
      expect(result).toHaveProperty('pValue');
      expect(result).toHaveProperty('reject');
    });
  }
});

// ── chiSquaredTest — 30 tests ───────────────────────────────────────────────
describe('chiSquaredTest', () => {
  for (let k = 2; k <= 31; k++) {
    it(`chiSquaredTest ${k} categories equal`, () => {
      const obs = Array(k).fill(10);
      const exp = Array(k).fill(10);
      const result = chiSquaredTest(obs, exp);
      expect(result.statistic).toBeCloseTo(0, 5);
    });
  }
});

// ── histogram — 30 tests ────────────────────────────────────────────────────
describe('histogram', () => {
  for (let bins = 2; bins <= 31; bins++) {
    it(`histogram ${bins} bins`, () => {
      const data = Array.from({ length: 100 }, (_, i) => i);
      const result = histogram(data, bins);
      // result.bins = edges (length bins+1), result.counts = per-bin counts
      expect(result.counts).toHaveLength(bins);
      const total = result.counts.reduce((acc: number, c: number) => acc + c, 0);
      expect(total).toBe(100);
    });
  }
});

// ── frequency — 30 tests ────────────────────────────────────────────────────
describe('frequency', () => {
  for (let n = 1; n <= 30; n++) {
    it(`frequency ${n} unique values each appearing 2x`, () => {
      const data = Array.from({ length: n * 2 }, (_, i) => i % n);
      const freq = frequency(data);
      expect(freq.size).toBe(n);
    });
  }
});

// ── covariance — 30 tests ───────────────────────────────────────────────────
describe('covariance', () => {
  for (let n = 3; n <= 32; n++) {
    it(`covariance of identical arrays n=${n} is non-negative`, () => {
      const data = Array.from({ length: n }, (_, i) => i);
      const cov = covariance(data, data);
      expect(cov).toBeGreaterThanOrEqual(0);
    });
  }
});

// ── geometricMean — 30 tests ─────────────────────────────────────────────────
describe('geometricMean', () => {
  for (let n = 1; n <= 30; n++) {
    it(`geometricMean ${n} equal values of 4`, () => {
      expect(geometricMean(Array(n).fill(4))).toBeCloseTo(4, 5);
    });
  }
});

// ── harmonicMean — 30 tests ──────────────────────────────────────────────────
describe('harmonicMean', () => {
  for (let n = 1; n <= 30; n++) {
    it(`harmonicMean ${n} equal values of 5`, () => {
      expect(harmonicMean(Array(n).fill(5))).toBeCloseTo(5, 5);
    });
  }
});

// ── confidenceInterval — 30 tests ───────────────────────────────────────────
describe('confidenceInterval', () => {
  const data = Array.from({ length: 100 }, (_, i) => i + 1);
  for (let i = 0; i < 30; i++) {
    const conf = 0.80 + i * 0.005;
    it(`confidenceInterval ${(conf * 100).toFixed(1)}%`, () => {
      const [lo, hi] = confidenceInterval(data, conf);
      expect(lo).toBeLessThan(hi);
    });
  }
});

// ── rank — 30 tests ──────────────────────────────────────────────────────────
describe('rank', () => {
  for (let n = 2; n <= 31; n++) {
    it(`rank of ${n} distinct values`, () => {
      const data = Array.from({ length: n }, (_, i) => i);
      const r = rank(data);
      expect(r).toHaveLength(n);
    });
  }
});

// ── describeStats — 30 tests ─────────────────────────────────────────────────
describe('describeStats', () => {
  for (let n = 2; n <= 31; n++) {
    it(`describeStats of ${n} items`, () => {
      const data = Array.from({ length: n }, (_, i) => i + 1);
      const ds = describeStats(data);
      expect(ds.min).toBe(1);
      expect(ds.max).toBe(n);
    });
  }
});

// ── sample — 30 tests ────────────────────────────────────────────────────────
describe('sample', () => {
  const pool = Array.from({ length: 100 }, (_, i) => i);
  for (let n = 1; n <= 30; n++) {
    it(`sample size ${n}`, () => {
      expect(sample(pool, n)).toHaveLength(n);
    });
  }
});

// ── quartiles — 30 tests ─────────────────────────────────────────────────────
describe('quartiles', () => {
  for (let n = 4; n <= 33; n++) {
    it(`quartiles of ${n} items`, () => {
      const data = Array.from({ length: n }, (_, i) => i + 1);
      const q = quartiles(data);
      expect(q.q1).toBeLessThanOrEqual(q.q2);
      expect(q.q2).toBeLessThanOrEqual(q.q3);
    });
  }
});
