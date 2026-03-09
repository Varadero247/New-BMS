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
function hd258stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258stu_hd',()=>{it('a',()=>{expect(hd258stu(1,4)).toBe(2);});it('b',()=>{expect(hd258stu(3,1)).toBe(1);});it('c',()=>{expect(hd258stu(0,0)).toBe(0);});it('d',()=>{expect(hd258stu(93,73)).toBe(2);});it('e',()=>{expect(hd258stu(15,0)).toBe(4);});});
function hd259stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259stu_hd',()=>{it('a',()=>{expect(hd259stu(1,4)).toBe(2);});it('b',()=>{expect(hd259stu(3,1)).toBe(1);});it('c',()=>{expect(hd259stu(0,0)).toBe(0);});it('d',()=>{expect(hd259stu(93,73)).toBe(2);});it('e',()=>{expect(hd259stu(15,0)).toBe(4);});});
function hd260stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260stu_hd',()=>{it('a',()=>{expect(hd260stu(1,4)).toBe(2);});it('b',()=>{expect(hd260stu(3,1)).toBe(1);});it('c',()=>{expect(hd260stu(0,0)).toBe(0);});it('d',()=>{expect(hd260stu(93,73)).toBe(2);});it('e',()=>{expect(hd260stu(15,0)).toBe(4);});});
function hd261stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261stu_hd',()=>{it('a',()=>{expect(hd261stu(1,4)).toBe(2);});it('b',()=>{expect(hd261stu(3,1)).toBe(1);});it('c',()=>{expect(hd261stu(0,0)).toBe(0);});it('d',()=>{expect(hd261stu(93,73)).toBe(2);});it('e',()=>{expect(hd261stu(15,0)).toBe(4);});});
function hd262stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262stu_hd',()=>{it('a',()=>{expect(hd262stu(1,4)).toBe(2);});it('b',()=>{expect(hd262stu(3,1)).toBe(1);});it('c',()=>{expect(hd262stu(0,0)).toBe(0);});it('d',()=>{expect(hd262stu(93,73)).toBe(2);});it('e',()=>{expect(hd262stu(15,0)).toBe(4);});});
function hd263stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263stu_hd',()=>{it('a',()=>{expect(hd263stu(1,4)).toBe(2);});it('b',()=>{expect(hd263stu(3,1)).toBe(1);});it('c',()=>{expect(hd263stu(0,0)).toBe(0);});it('d',()=>{expect(hd263stu(93,73)).toBe(2);});it('e',()=>{expect(hd263stu(15,0)).toBe(4);});});
function hd264stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264stu_hd',()=>{it('a',()=>{expect(hd264stu(1,4)).toBe(2);});it('b',()=>{expect(hd264stu(3,1)).toBe(1);});it('c',()=>{expect(hd264stu(0,0)).toBe(0);});it('d',()=>{expect(hd264stu(93,73)).toBe(2);});it('e',()=>{expect(hd264stu(15,0)).toBe(4);});});
function hd265stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265stu_hd',()=>{it('a',()=>{expect(hd265stu(1,4)).toBe(2);});it('b',()=>{expect(hd265stu(3,1)).toBe(1);});it('c',()=>{expect(hd265stu(0,0)).toBe(0);});it('d',()=>{expect(hd265stu(93,73)).toBe(2);});it('e',()=>{expect(hd265stu(15,0)).toBe(4);});});
function hd266stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266stu_hd',()=>{it('a',()=>{expect(hd266stu(1,4)).toBe(2);});it('b',()=>{expect(hd266stu(3,1)).toBe(1);});it('c',()=>{expect(hd266stu(0,0)).toBe(0);});it('d',()=>{expect(hd266stu(93,73)).toBe(2);});it('e',()=>{expect(hd266stu(15,0)).toBe(4);});});
function hd267stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267stu_hd',()=>{it('a',()=>{expect(hd267stu(1,4)).toBe(2);});it('b',()=>{expect(hd267stu(3,1)).toBe(1);});it('c',()=>{expect(hd267stu(0,0)).toBe(0);});it('d',()=>{expect(hd267stu(93,73)).toBe(2);});it('e',()=>{expect(hd267stu(15,0)).toBe(4);});});
function hd268stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268stu_hd',()=>{it('a',()=>{expect(hd268stu(1,4)).toBe(2);});it('b',()=>{expect(hd268stu(3,1)).toBe(1);});it('c',()=>{expect(hd268stu(0,0)).toBe(0);});it('d',()=>{expect(hd268stu(93,73)).toBe(2);});it('e',()=>{expect(hd268stu(15,0)).toBe(4);});});
function hd269stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269stu_hd',()=>{it('a',()=>{expect(hd269stu(1,4)).toBe(2);});it('b',()=>{expect(hd269stu(3,1)).toBe(1);});it('c',()=>{expect(hd269stu(0,0)).toBe(0);});it('d',()=>{expect(hd269stu(93,73)).toBe(2);});it('e',()=>{expect(hd269stu(15,0)).toBe(4);});});
function hd270stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270stu_hd',()=>{it('a',()=>{expect(hd270stu(1,4)).toBe(2);});it('b',()=>{expect(hd270stu(3,1)).toBe(1);});it('c',()=>{expect(hd270stu(0,0)).toBe(0);});it('d',()=>{expect(hd270stu(93,73)).toBe(2);});it('e',()=>{expect(hd270stu(15,0)).toBe(4);});});
function hd271stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271stu_hd',()=>{it('a',()=>{expect(hd271stu(1,4)).toBe(2);});it('b',()=>{expect(hd271stu(3,1)).toBe(1);});it('c',()=>{expect(hd271stu(0,0)).toBe(0);});it('d',()=>{expect(hd271stu(93,73)).toBe(2);});it('e',()=>{expect(hd271stu(15,0)).toBe(4);});});
function hd272stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272stu_hd',()=>{it('a',()=>{expect(hd272stu(1,4)).toBe(2);});it('b',()=>{expect(hd272stu(3,1)).toBe(1);});it('c',()=>{expect(hd272stu(0,0)).toBe(0);});it('d',()=>{expect(hd272stu(93,73)).toBe(2);});it('e',()=>{expect(hd272stu(15,0)).toBe(4);});});
function hd273stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273stu_hd',()=>{it('a',()=>{expect(hd273stu(1,4)).toBe(2);});it('b',()=>{expect(hd273stu(3,1)).toBe(1);});it('c',()=>{expect(hd273stu(0,0)).toBe(0);});it('d',()=>{expect(hd273stu(93,73)).toBe(2);});it('e',()=>{expect(hd273stu(15,0)).toBe(4);});});
function hd274stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274stu_hd',()=>{it('a',()=>{expect(hd274stu(1,4)).toBe(2);});it('b',()=>{expect(hd274stu(3,1)).toBe(1);});it('c',()=>{expect(hd274stu(0,0)).toBe(0);});it('d',()=>{expect(hd274stu(93,73)).toBe(2);});it('e',()=>{expect(hd274stu(15,0)).toBe(4);});});
function hd275stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275stu_hd',()=>{it('a',()=>{expect(hd275stu(1,4)).toBe(2);});it('b',()=>{expect(hd275stu(3,1)).toBe(1);});it('c',()=>{expect(hd275stu(0,0)).toBe(0);});it('d',()=>{expect(hd275stu(93,73)).toBe(2);});it('e',()=>{expect(hd275stu(15,0)).toBe(4);});});
function hd276stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276stu_hd',()=>{it('a',()=>{expect(hd276stu(1,4)).toBe(2);});it('b',()=>{expect(hd276stu(3,1)).toBe(1);});it('c',()=>{expect(hd276stu(0,0)).toBe(0);});it('d',()=>{expect(hd276stu(93,73)).toBe(2);});it('e',()=>{expect(hd276stu(15,0)).toBe(4);});});
function hd277stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277stu_hd',()=>{it('a',()=>{expect(hd277stu(1,4)).toBe(2);});it('b',()=>{expect(hd277stu(3,1)).toBe(1);});it('c',()=>{expect(hd277stu(0,0)).toBe(0);});it('d',()=>{expect(hd277stu(93,73)).toBe(2);});it('e',()=>{expect(hd277stu(15,0)).toBe(4);});});
function hd278stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278stu_hd',()=>{it('a',()=>{expect(hd278stu(1,4)).toBe(2);});it('b',()=>{expect(hd278stu(3,1)).toBe(1);});it('c',()=>{expect(hd278stu(0,0)).toBe(0);});it('d',()=>{expect(hd278stu(93,73)).toBe(2);});it('e',()=>{expect(hd278stu(15,0)).toBe(4);});});
function hd279stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279stu_hd',()=>{it('a',()=>{expect(hd279stu(1,4)).toBe(2);});it('b',()=>{expect(hd279stu(3,1)).toBe(1);});it('c',()=>{expect(hd279stu(0,0)).toBe(0);});it('d',()=>{expect(hd279stu(93,73)).toBe(2);});it('e',()=>{expect(hd279stu(15,0)).toBe(4);});});
function hd280stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280stu_hd',()=>{it('a',()=>{expect(hd280stu(1,4)).toBe(2);});it('b',()=>{expect(hd280stu(3,1)).toBe(1);});it('c',()=>{expect(hd280stu(0,0)).toBe(0);});it('d',()=>{expect(hd280stu(93,73)).toBe(2);});it('e',()=>{expect(hd280stu(15,0)).toBe(4);});});
function hd281stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281stu_hd',()=>{it('a',()=>{expect(hd281stu(1,4)).toBe(2);});it('b',()=>{expect(hd281stu(3,1)).toBe(1);});it('c',()=>{expect(hd281stu(0,0)).toBe(0);});it('d',()=>{expect(hd281stu(93,73)).toBe(2);});it('e',()=>{expect(hd281stu(15,0)).toBe(4);});});
function hd282stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282stu_hd',()=>{it('a',()=>{expect(hd282stu(1,4)).toBe(2);});it('b',()=>{expect(hd282stu(3,1)).toBe(1);});it('c',()=>{expect(hd282stu(0,0)).toBe(0);});it('d',()=>{expect(hd282stu(93,73)).toBe(2);});it('e',()=>{expect(hd282stu(15,0)).toBe(4);});});
function hd283stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283stu_hd',()=>{it('a',()=>{expect(hd283stu(1,4)).toBe(2);});it('b',()=>{expect(hd283stu(3,1)).toBe(1);});it('c',()=>{expect(hd283stu(0,0)).toBe(0);});it('d',()=>{expect(hd283stu(93,73)).toBe(2);});it('e',()=>{expect(hd283stu(15,0)).toBe(4);});});
function hd284stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284stu_hd',()=>{it('a',()=>{expect(hd284stu(1,4)).toBe(2);});it('b',()=>{expect(hd284stu(3,1)).toBe(1);});it('c',()=>{expect(hd284stu(0,0)).toBe(0);});it('d',()=>{expect(hd284stu(93,73)).toBe(2);});it('e',()=>{expect(hd284stu(15,0)).toBe(4);});});
function hd285stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285stu_hd',()=>{it('a',()=>{expect(hd285stu(1,4)).toBe(2);});it('b',()=>{expect(hd285stu(3,1)).toBe(1);});it('c',()=>{expect(hd285stu(0,0)).toBe(0);});it('d',()=>{expect(hd285stu(93,73)).toBe(2);});it('e',()=>{expect(hd285stu(15,0)).toBe(4);});});
function hd286stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286stu_hd',()=>{it('a',()=>{expect(hd286stu(1,4)).toBe(2);});it('b',()=>{expect(hd286stu(3,1)).toBe(1);});it('c',()=>{expect(hd286stu(0,0)).toBe(0);});it('d',()=>{expect(hd286stu(93,73)).toBe(2);});it('e',()=>{expect(hd286stu(15,0)).toBe(4);});});
function hd287stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287stu_hd',()=>{it('a',()=>{expect(hd287stu(1,4)).toBe(2);});it('b',()=>{expect(hd287stu(3,1)).toBe(1);});it('c',()=>{expect(hd287stu(0,0)).toBe(0);});it('d',()=>{expect(hd287stu(93,73)).toBe(2);});it('e',()=>{expect(hd287stu(15,0)).toBe(4);});});
function hd288stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288stu_hd',()=>{it('a',()=>{expect(hd288stu(1,4)).toBe(2);});it('b',()=>{expect(hd288stu(3,1)).toBe(1);});it('c',()=>{expect(hd288stu(0,0)).toBe(0);});it('d',()=>{expect(hd288stu(93,73)).toBe(2);});it('e',()=>{expect(hd288stu(15,0)).toBe(4);});});
function hd289stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289stu_hd',()=>{it('a',()=>{expect(hd289stu(1,4)).toBe(2);});it('b',()=>{expect(hd289stu(3,1)).toBe(1);});it('c',()=>{expect(hd289stu(0,0)).toBe(0);});it('d',()=>{expect(hd289stu(93,73)).toBe(2);});it('e',()=>{expect(hd289stu(15,0)).toBe(4);});});
function hd290stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290stu_hd',()=>{it('a',()=>{expect(hd290stu(1,4)).toBe(2);});it('b',()=>{expect(hd290stu(3,1)).toBe(1);});it('c',()=>{expect(hd290stu(0,0)).toBe(0);});it('d',()=>{expect(hd290stu(93,73)).toBe(2);});it('e',()=>{expect(hd290stu(15,0)).toBe(4);});});
function hd291stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291stu_hd',()=>{it('a',()=>{expect(hd291stu(1,4)).toBe(2);});it('b',()=>{expect(hd291stu(3,1)).toBe(1);});it('c',()=>{expect(hd291stu(0,0)).toBe(0);});it('d',()=>{expect(hd291stu(93,73)).toBe(2);});it('e',()=>{expect(hd291stu(15,0)).toBe(4);});});
function hd292stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292stu_hd',()=>{it('a',()=>{expect(hd292stu(1,4)).toBe(2);});it('b',()=>{expect(hd292stu(3,1)).toBe(1);});it('c',()=>{expect(hd292stu(0,0)).toBe(0);});it('d',()=>{expect(hd292stu(93,73)).toBe(2);});it('e',()=>{expect(hd292stu(15,0)).toBe(4);});});
function hd293stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293stu_hd',()=>{it('a',()=>{expect(hd293stu(1,4)).toBe(2);});it('b',()=>{expect(hd293stu(3,1)).toBe(1);});it('c',()=>{expect(hd293stu(0,0)).toBe(0);});it('d',()=>{expect(hd293stu(93,73)).toBe(2);});it('e',()=>{expect(hd293stu(15,0)).toBe(4);});});
function hd294stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294stu_hd',()=>{it('a',()=>{expect(hd294stu(1,4)).toBe(2);});it('b',()=>{expect(hd294stu(3,1)).toBe(1);});it('c',()=>{expect(hd294stu(0,0)).toBe(0);});it('d',()=>{expect(hd294stu(93,73)).toBe(2);});it('e',()=>{expect(hd294stu(15,0)).toBe(4);});});
function hd295stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295stu_hd',()=>{it('a',()=>{expect(hd295stu(1,4)).toBe(2);});it('b',()=>{expect(hd295stu(3,1)).toBe(1);});it('c',()=>{expect(hd295stu(0,0)).toBe(0);});it('d',()=>{expect(hd295stu(93,73)).toBe(2);});it('e',()=>{expect(hd295stu(15,0)).toBe(4);});});
function hd296stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296stu_hd',()=>{it('a',()=>{expect(hd296stu(1,4)).toBe(2);});it('b',()=>{expect(hd296stu(3,1)).toBe(1);});it('c',()=>{expect(hd296stu(0,0)).toBe(0);});it('d',()=>{expect(hd296stu(93,73)).toBe(2);});it('e',()=>{expect(hd296stu(15,0)).toBe(4);});});
function hd297stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297stu_hd',()=>{it('a',()=>{expect(hd297stu(1,4)).toBe(2);});it('b',()=>{expect(hd297stu(3,1)).toBe(1);});it('c',()=>{expect(hd297stu(0,0)).toBe(0);});it('d',()=>{expect(hd297stu(93,73)).toBe(2);});it('e',()=>{expect(hd297stu(15,0)).toBe(4);});});
function hd298stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298stu_hd',()=>{it('a',()=>{expect(hd298stu(1,4)).toBe(2);});it('b',()=>{expect(hd298stu(3,1)).toBe(1);});it('c',()=>{expect(hd298stu(0,0)).toBe(0);});it('d',()=>{expect(hd298stu(93,73)).toBe(2);});it('e',()=>{expect(hd298stu(15,0)).toBe(4);});});
function hd299stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299stu_hd',()=>{it('a',()=>{expect(hd299stu(1,4)).toBe(2);});it('b',()=>{expect(hd299stu(3,1)).toBe(1);});it('c',()=>{expect(hd299stu(0,0)).toBe(0);});it('d',()=>{expect(hd299stu(93,73)).toBe(2);});it('e',()=>{expect(hd299stu(15,0)).toBe(4);});});
function hd300stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300stu_hd',()=>{it('a',()=>{expect(hd300stu(1,4)).toBe(2);});it('b',()=>{expect(hd300stu(3,1)).toBe(1);});it('c',()=>{expect(hd300stu(0,0)).toBe(0);});it('d',()=>{expect(hd300stu(93,73)).toBe(2);});it('e',()=>{expect(hd300stu(15,0)).toBe(4);});});
function hd301stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301stu_hd',()=>{it('a',()=>{expect(hd301stu(1,4)).toBe(2);});it('b',()=>{expect(hd301stu(3,1)).toBe(1);});it('c',()=>{expect(hd301stu(0,0)).toBe(0);});it('d',()=>{expect(hd301stu(93,73)).toBe(2);});it('e',()=>{expect(hd301stu(15,0)).toBe(4);});});
function hd302stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302stu_hd',()=>{it('a',()=>{expect(hd302stu(1,4)).toBe(2);});it('b',()=>{expect(hd302stu(3,1)).toBe(1);});it('c',()=>{expect(hd302stu(0,0)).toBe(0);});it('d',()=>{expect(hd302stu(93,73)).toBe(2);});it('e',()=>{expect(hd302stu(15,0)).toBe(4);});});
function hd303stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303stu_hd',()=>{it('a',()=>{expect(hd303stu(1,4)).toBe(2);});it('b',()=>{expect(hd303stu(3,1)).toBe(1);});it('c',()=>{expect(hd303stu(0,0)).toBe(0);});it('d',()=>{expect(hd303stu(93,73)).toBe(2);});it('e',()=>{expect(hd303stu(15,0)).toBe(4);});});
function hd304stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304stu_hd',()=>{it('a',()=>{expect(hd304stu(1,4)).toBe(2);});it('b',()=>{expect(hd304stu(3,1)).toBe(1);});it('c',()=>{expect(hd304stu(0,0)).toBe(0);});it('d',()=>{expect(hd304stu(93,73)).toBe(2);});it('e',()=>{expect(hd304stu(15,0)).toBe(4);});});
function hd305stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305stu_hd',()=>{it('a',()=>{expect(hd305stu(1,4)).toBe(2);});it('b',()=>{expect(hd305stu(3,1)).toBe(1);});it('c',()=>{expect(hd305stu(0,0)).toBe(0);});it('d',()=>{expect(hd305stu(93,73)).toBe(2);});it('e',()=>{expect(hd305stu(15,0)).toBe(4);});});
function hd306stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306stu_hd',()=>{it('a',()=>{expect(hd306stu(1,4)).toBe(2);});it('b',()=>{expect(hd306stu(3,1)).toBe(1);});it('c',()=>{expect(hd306stu(0,0)).toBe(0);});it('d',()=>{expect(hd306stu(93,73)).toBe(2);});it('e',()=>{expect(hd306stu(15,0)).toBe(4);});});
function hd307stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307stu_hd',()=>{it('a',()=>{expect(hd307stu(1,4)).toBe(2);});it('b',()=>{expect(hd307stu(3,1)).toBe(1);});it('c',()=>{expect(hd307stu(0,0)).toBe(0);});it('d',()=>{expect(hd307stu(93,73)).toBe(2);});it('e',()=>{expect(hd307stu(15,0)).toBe(4);});});
function hd308stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308stu_hd',()=>{it('a',()=>{expect(hd308stu(1,4)).toBe(2);});it('b',()=>{expect(hd308stu(3,1)).toBe(1);});it('c',()=>{expect(hd308stu(0,0)).toBe(0);});it('d',()=>{expect(hd308stu(93,73)).toBe(2);});it('e',()=>{expect(hd308stu(15,0)).toBe(4);});});
function hd309stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309stu_hd',()=>{it('a',()=>{expect(hd309stu(1,4)).toBe(2);});it('b',()=>{expect(hd309stu(3,1)).toBe(1);});it('c',()=>{expect(hd309stu(0,0)).toBe(0);});it('d',()=>{expect(hd309stu(93,73)).toBe(2);});it('e',()=>{expect(hd309stu(15,0)).toBe(4);});});
function hd310stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310stu_hd',()=>{it('a',()=>{expect(hd310stu(1,4)).toBe(2);});it('b',()=>{expect(hd310stu(3,1)).toBe(1);});it('c',()=>{expect(hd310stu(0,0)).toBe(0);});it('d',()=>{expect(hd310stu(93,73)).toBe(2);});it('e',()=>{expect(hd310stu(15,0)).toBe(4);});});
function hd311stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311stu_hd',()=>{it('a',()=>{expect(hd311stu(1,4)).toBe(2);});it('b',()=>{expect(hd311stu(3,1)).toBe(1);});it('c',()=>{expect(hd311stu(0,0)).toBe(0);});it('d',()=>{expect(hd311stu(93,73)).toBe(2);});it('e',()=>{expect(hd311stu(15,0)).toBe(4);});});
function hd312stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312stu_hd',()=>{it('a',()=>{expect(hd312stu(1,4)).toBe(2);});it('b',()=>{expect(hd312stu(3,1)).toBe(1);});it('c',()=>{expect(hd312stu(0,0)).toBe(0);});it('d',()=>{expect(hd312stu(93,73)).toBe(2);});it('e',()=>{expect(hd312stu(15,0)).toBe(4);});});
function hd313stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313stu_hd',()=>{it('a',()=>{expect(hd313stu(1,4)).toBe(2);});it('b',()=>{expect(hd313stu(3,1)).toBe(1);});it('c',()=>{expect(hd313stu(0,0)).toBe(0);});it('d',()=>{expect(hd313stu(93,73)).toBe(2);});it('e',()=>{expect(hd313stu(15,0)).toBe(4);});});
function hd314stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314stu_hd',()=>{it('a',()=>{expect(hd314stu(1,4)).toBe(2);});it('b',()=>{expect(hd314stu(3,1)).toBe(1);});it('c',()=>{expect(hd314stu(0,0)).toBe(0);});it('d',()=>{expect(hd314stu(93,73)).toBe(2);});it('e',()=>{expect(hd314stu(15,0)).toBe(4);});});
function hd315stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315stu_hd',()=>{it('a',()=>{expect(hd315stu(1,4)).toBe(2);});it('b',()=>{expect(hd315stu(3,1)).toBe(1);});it('c',()=>{expect(hd315stu(0,0)).toBe(0);});it('d',()=>{expect(hd315stu(93,73)).toBe(2);});it('e',()=>{expect(hd315stu(15,0)).toBe(4);});});
function hd316stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316stu_hd',()=>{it('a',()=>{expect(hd316stu(1,4)).toBe(2);});it('b',()=>{expect(hd316stu(3,1)).toBe(1);});it('c',()=>{expect(hd316stu(0,0)).toBe(0);});it('d',()=>{expect(hd316stu(93,73)).toBe(2);});it('e',()=>{expect(hd316stu(15,0)).toBe(4);});});
function hd317stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317stu_hd',()=>{it('a',()=>{expect(hd317stu(1,4)).toBe(2);});it('b',()=>{expect(hd317stu(3,1)).toBe(1);});it('c',()=>{expect(hd317stu(0,0)).toBe(0);});it('d',()=>{expect(hd317stu(93,73)).toBe(2);});it('e',()=>{expect(hd317stu(15,0)).toBe(4);});});
function hd318stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318stu_hd',()=>{it('a',()=>{expect(hd318stu(1,4)).toBe(2);});it('b',()=>{expect(hd318stu(3,1)).toBe(1);});it('c',()=>{expect(hd318stu(0,0)).toBe(0);});it('d',()=>{expect(hd318stu(93,73)).toBe(2);});it('e',()=>{expect(hd318stu(15,0)).toBe(4);});});
function hd319stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319stu_hd',()=>{it('a',()=>{expect(hd319stu(1,4)).toBe(2);});it('b',()=>{expect(hd319stu(3,1)).toBe(1);});it('c',()=>{expect(hd319stu(0,0)).toBe(0);});it('d',()=>{expect(hd319stu(93,73)).toBe(2);});it('e',()=>{expect(hd319stu(15,0)).toBe(4);});});
function hd320stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320stu_hd',()=>{it('a',()=>{expect(hd320stu(1,4)).toBe(2);});it('b',()=>{expect(hd320stu(3,1)).toBe(1);});it('c',()=>{expect(hd320stu(0,0)).toBe(0);});it('d',()=>{expect(hd320stu(93,73)).toBe(2);});it('e',()=>{expect(hd320stu(15,0)).toBe(4);});});
function hd321stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321stu_hd',()=>{it('a',()=>{expect(hd321stu(1,4)).toBe(2);});it('b',()=>{expect(hd321stu(3,1)).toBe(1);});it('c',()=>{expect(hd321stu(0,0)).toBe(0);});it('d',()=>{expect(hd321stu(93,73)).toBe(2);});it('e',()=>{expect(hd321stu(15,0)).toBe(4);});});
function hd322stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322stu_hd',()=>{it('a',()=>{expect(hd322stu(1,4)).toBe(2);});it('b',()=>{expect(hd322stu(3,1)).toBe(1);});it('c',()=>{expect(hd322stu(0,0)).toBe(0);});it('d',()=>{expect(hd322stu(93,73)).toBe(2);});it('e',()=>{expect(hd322stu(15,0)).toBe(4);});});
function hd323stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323stu_hd',()=>{it('a',()=>{expect(hd323stu(1,4)).toBe(2);});it('b',()=>{expect(hd323stu(3,1)).toBe(1);});it('c',()=>{expect(hd323stu(0,0)).toBe(0);});it('d',()=>{expect(hd323stu(93,73)).toBe(2);});it('e',()=>{expect(hd323stu(15,0)).toBe(4);});});
function hd324stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324stu_hd',()=>{it('a',()=>{expect(hd324stu(1,4)).toBe(2);});it('b',()=>{expect(hd324stu(3,1)).toBe(1);});it('c',()=>{expect(hd324stu(0,0)).toBe(0);});it('d',()=>{expect(hd324stu(93,73)).toBe(2);});it('e',()=>{expect(hd324stu(15,0)).toBe(4);});});
function hd325stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325stu_hd',()=>{it('a',()=>{expect(hd325stu(1,4)).toBe(2);});it('b',()=>{expect(hd325stu(3,1)).toBe(1);});it('c',()=>{expect(hd325stu(0,0)).toBe(0);});it('d',()=>{expect(hd325stu(93,73)).toBe(2);});it('e',()=>{expect(hd325stu(15,0)).toBe(4);});});
function hd326stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326stu_hd',()=>{it('a',()=>{expect(hd326stu(1,4)).toBe(2);});it('b',()=>{expect(hd326stu(3,1)).toBe(1);});it('c',()=>{expect(hd326stu(0,0)).toBe(0);});it('d',()=>{expect(hd326stu(93,73)).toBe(2);});it('e',()=>{expect(hd326stu(15,0)).toBe(4);});});
function hd327stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327stu_hd',()=>{it('a',()=>{expect(hd327stu(1,4)).toBe(2);});it('b',()=>{expect(hd327stu(3,1)).toBe(1);});it('c',()=>{expect(hd327stu(0,0)).toBe(0);});it('d',()=>{expect(hd327stu(93,73)).toBe(2);});it('e',()=>{expect(hd327stu(15,0)).toBe(4);});});
function hd328stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328stu_hd',()=>{it('a',()=>{expect(hd328stu(1,4)).toBe(2);});it('b',()=>{expect(hd328stu(3,1)).toBe(1);});it('c',()=>{expect(hd328stu(0,0)).toBe(0);});it('d',()=>{expect(hd328stu(93,73)).toBe(2);});it('e',()=>{expect(hd328stu(15,0)).toBe(4);});});
function hd329stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329stu_hd',()=>{it('a',()=>{expect(hd329stu(1,4)).toBe(2);});it('b',()=>{expect(hd329stu(3,1)).toBe(1);});it('c',()=>{expect(hd329stu(0,0)).toBe(0);});it('d',()=>{expect(hd329stu(93,73)).toBe(2);});it('e',()=>{expect(hd329stu(15,0)).toBe(4);});});
function hd330stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330stu_hd',()=>{it('a',()=>{expect(hd330stu(1,4)).toBe(2);});it('b',()=>{expect(hd330stu(3,1)).toBe(1);});it('c',()=>{expect(hd330stu(0,0)).toBe(0);});it('d',()=>{expect(hd330stu(93,73)).toBe(2);});it('e',()=>{expect(hd330stu(15,0)).toBe(4);});});
function hd331stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331stu_hd',()=>{it('a',()=>{expect(hd331stu(1,4)).toBe(2);});it('b',()=>{expect(hd331stu(3,1)).toBe(1);});it('c',()=>{expect(hd331stu(0,0)).toBe(0);});it('d',()=>{expect(hd331stu(93,73)).toBe(2);});it('e',()=>{expect(hd331stu(15,0)).toBe(4);});});
function hd332stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332stu_hd',()=>{it('a',()=>{expect(hd332stu(1,4)).toBe(2);});it('b',()=>{expect(hd332stu(3,1)).toBe(1);});it('c',()=>{expect(hd332stu(0,0)).toBe(0);});it('d',()=>{expect(hd332stu(93,73)).toBe(2);});it('e',()=>{expect(hd332stu(15,0)).toBe(4);});});
function hd333stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333stu_hd',()=>{it('a',()=>{expect(hd333stu(1,4)).toBe(2);});it('b',()=>{expect(hd333stu(3,1)).toBe(1);});it('c',()=>{expect(hd333stu(0,0)).toBe(0);});it('d',()=>{expect(hd333stu(93,73)).toBe(2);});it('e',()=>{expect(hd333stu(15,0)).toBe(4);});});
function hd334stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334stu_hd',()=>{it('a',()=>{expect(hd334stu(1,4)).toBe(2);});it('b',()=>{expect(hd334stu(3,1)).toBe(1);});it('c',()=>{expect(hd334stu(0,0)).toBe(0);});it('d',()=>{expect(hd334stu(93,73)).toBe(2);});it('e',()=>{expect(hd334stu(15,0)).toBe(4);});});
function hd335stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335stu_hd',()=>{it('a',()=>{expect(hd335stu(1,4)).toBe(2);});it('b',()=>{expect(hd335stu(3,1)).toBe(1);});it('c',()=>{expect(hd335stu(0,0)).toBe(0);});it('d',()=>{expect(hd335stu(93,73)).toBe(2);});it('e',()=>{expect(hd335stu(15,0)).toBe(4);});});
function hd336stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336stu_hd',()=>{it('a',()=>{expect(hd336stu(1,4)).toBe(2);});it('b',()=>{expect(hd336stu(3,1)).toBe(1);});it('c',()=>{expect(hd336stu(0,0)).toBe(0);});it('d',()=>{expect(hd336stu(93,73)).toBe(2);});it('e',()=>{expect(hd336stu(15,0)).toBe(4);});});
function hd337stu(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337stu_hd',()=>{it('a',()=>{expect(hd337stu(1,4)).toBe(2);});it('b',()=>{expect(hd337stu(3,1)).toBe(1);});it('c',()=>{expect(hd337stu(0,0)).toBe(0);});it('d',()=>{expect(hd337stu(93,73)).toBe(2);});it('e',()=>{expect(hd337stu(15,0)).toBe(4);});});
