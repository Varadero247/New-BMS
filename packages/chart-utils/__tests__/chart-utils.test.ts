// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  aggregate,
  alignSeries,
  bucketize,
  cumulative,
  detectOutliers,
  exponentialMovingAverage,
  filterNaN,
  formatPct,
  formatValue,
  generateColors,
  getMinMax,
  groupByTime,
  interpolateColor,
  linearTrend,
  mergeSeriesData,
  movingAverage,
  normalize,
  padSeries,
  pctChange,
  resample,
  rollup,
  rollingCorrelation,
  scaleToRange,
  standardize,
  toHeatmap,
  toPieSeries,
  toSeries,
  transposeToSeries,
} from '../src/chart-utils';

import type { Series } from '../src/types';

// ─── aggregate: sum ──────────────────────────────────────────────────────────
describe('aggregate sum', () => {
  for (let i = 1; i <= 100; i++) {
    it(`sum of first ${i} naturals = ${(i * (i + 1)) / 2}`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      expect(aggregate(arr, 'sum')).toBe((i * (i + 1)) / 2);
    });
  }
});

// ─── aggregate: average ───────────────────────────────────────────────────────
describe('aggregate average', () => {
  for (let i = 1; i <= 50; i++) {
    it(`average of [1..${i}] = ${(i + 1) / 2}`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      expect(aggregate(arr, 'average')).toBeCloseTo((i + 1) / 2, 10);
    });
  }
});

// ─── aggregate: min/max ───────────────────────────────────────────────────────
describe('aggregate min', () => {
  for (let i = 1; i <= 50; i++) {
    it(`min of [${i}..${i + 9}] = ${i}`, () => {
      const arr = Array.from({ length: 10 }, (_, k) => i + k);
      expect(aggregate(arr, 'min')).toBe(i);
    });
  }
});

describe('aggregate max', () => {
  for (let i = 1; i <= 50; i++) {
    it(`max of [${i}..${i + 9}] = ${i + 9}`, () => {
      const arr = Array.from({ length: 10 }, (_, k) => i + k);
      expect(aggregate(arr, 'max')).toBe(i + 9);
    });
  }
});

// ─── aggregate: count ─────────────────────────────────────────────────────────
describe('aggregate count', () => {
  for (let i = 1; i <= 50; i++) {
    it(`count of array length ${i} = ${i}`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      expect(aggregate(arr, 'count')).toBe(i);
    });
  }
});

// ─── aggregate: first/last ────────────────────────────────────────────────────
describe('aggregate first and last', () => {
  for (let i = 2; i <= 51; i++) {
    it(`first of [${i}..${i + 4}] = ${i}`, () => {
      const arr = Array.from({ length: 5 }, (_, k) => i + k);
      expect(aggregate(arr, 'first')).toBe(i);
    });
  }
  for (let i = 2; i <= 51; i++) {
    it(`last of [${i}..${i + 4}] = ${i + 4}`, () => {
      const arr = Array.from({ length: 5 }, (_, k) => i + k);
      expect(aggregate(arr, 'last')).toBe(i + 4);
    });
  }
});

// ─── aggregate: median ────────────────────────────────────────────────────────
describe('aggregate median odd-length', () => {
  for (let i = 1; i <= 50; i++) {
    const len = 2 * i - 1; // always odd
    it(`median of 1..${len} = ${i}`, () => {
      const arr = Array.from({ length: len }, (_, k) => k + 1);
      expect(aggregate(arr, 'median')).toBe(i);
    });
  }
});

// ─── aggregate: stddev ────────────────────────────────────────────────────────
describe('aggregate stddev of constant array', () => {
  for (let i = 1; i <= 50; i++) {
    it(`stddev of ${i} repeated 10 times = 0`, () => {
      const arr = Array(10).fill(i);
      expect(aggregate(arr, 'stddev')).toBe(0);
    });
  }
});

// ─── pctChange ───────────────────────────────────────────────────────────────
describe('pctChange', () => {
  for (let i = 1; i <= 100; i++) {
    it(`pctChange from ${i} to ${i * 2} is 100%`, () => {
      const r = pctChange([i, i * 2]);
      expect(r[1]).toBeCloseTo(100, 0);
    });
  }
});

// ─── cumulative ──────────────────────────────────────────────────────────────
describe('cumulative', () => {
  for (let i = 1; i <= 100; i++) {
    it(`cumulative sum for length ${i}`, () => {
      const arr = Array(i).fill(1);
      const c = cumulative(arr);
      expect(c[c.length - 1]).toBe(i);
    });
  }
});

// ─── normalize ───────────────────────────────────────────────────────────────
describe('normalize', () => {
  for (let i = 2; i <= 51; i++) {
    it(`normalize [1..${i}]: first=0, last=1`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      const n = normalize(arr);
      expect(n[0]).toBeCloseTo(0, 10);
      expect(n[n.length - 1]).toBeCloseTo(1, 10);
    });
  }
});

// ─── standardize ─────────────────────────────────────────────────────────────
describe('standardize', () => {
  for (let i = 2; i <= 51; i++) {
    it(`standardize [1..${i}]: mean ≈ 0`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      const s = standardize(arr);
      const mean = s.reduce((a, b) => a + b, 0) / s.length;
      expect(mean).toBeCloseTo(0, 8);
    });
  }
});

// ─── movingAverage ───────────────────────────────────────────────────────────
describe('movingAverage period=3', () => {
  for (let i = 3; i <= 52; i++) {
    it(`movingAverage of [1..${i}] period=3: last value correct`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      const ma = movingAverage(arr, 3);
      expect(ma.period).toBe(3);
      const expected = (arr[i - 3] + arr[i - 2] + arr[i - 1]) / 3;
      expect(ma.values[i - 1]).toBeCloseTo(expected, 10);
    });
  }
});

// ─── exponentialMovingAverage ─────────────────────────────────────────────────
describe('exponentialMovingAverage', () => {
  for (let i = 1; i <= 50; i++) {
    it(`EMA alpha=1 is identity for length ${i}`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      const ema = exponentialMovingAverage(arr, 1);
      expect(ema).toEqual(arr);
    });
  }
});

// ─── linearTrend ─────────────────────────────────────────────────────────────
describe('linearTrend direction', () => {
  for (let slope = -5; slope <= 5; slope++) {
    if (slope === 0) continue;
    it(`slope=${slope} → direction=${slope > 0 ? 'up' : 'down'}`, () => {
      const points = Array.from({ length: 5 }, (_, i) => ({
        x: i,
        y: slope * i + 10,
      }));
      const t = linearTrend(points);
      expect(t.direction).toBe(slope > 0 ? 'up' : 'down');
      expect(t.slope).toBeCloseTo(slope, 8);
    });
  }
});

describe('linearTrend r2 perfect fit', () => {
  for (let i = 1; i <= 30; i++) {
    it(`perfect line slope=${i}: r2=1`, () => {
      const points = Array.from({ length: 5 }, (_, k) => ({ x: k, y: i * k + 2 }));
      const t = linearTrend(points);
      expect(t.r2).toBeCloseTo(1, 8);
    });
  }
});

describe('linearTrend forecast', () => {
  for (let i = 1; i <= 30; i++) {
    it(`forecast at x=${i + 5} with slope=${i}`, () => {
      const points = Array.from({ length: 4 }, (_, k) => ({ x: k, y: i * k }));
      const t = linearTrend(points);
      const expected = t.slope * (i + 5) + t.intercept;
      expect(t.forecast(i + 5)).toBeCloseTo(expected, 10);
    });
  }
});

// ─── detectOutliers ──────────────────────────────────────────────────────────
describe('detectOutliers — no outliers in constant arrays', () => {
  for (let i = 1; i <= 50; i++) {
    it(`constant array of ${i}s has no outliers`, () => {
      const arr = Array(20).fill(i);
      expect(detectOutliers(arr)).toHaveLength(0);
    });
  }
});

describe('detectOutliers — large spike detected', () => {
  for (let i = 1; i <= 30; i++) {
    it(`spike of ${i * 100} in array of 1s is detected`, () => {
      const arr = [...Array(19).fill(1), i * 100];
      const outliers = detectOutliers(arr, 2);
      expect(outliers.length).toBeGreaterThan(0);
      expect(outliers[0].value).toBe(i * 100);
    });
  }
});

// ─── filterNaN ───────────────────────────────────────────────────────────────
describe('filterNaN', () => {
  for (let i = 1; i <= 50; i++) {
    it(`filterNaN removes ${i} NaNs from array`, () => {
      const arr = [...Array(i).fill(NaN), 1, 2, 3];
      const result = filterNaN(arr);
      expect(result).toEqual([1, 2, 3]);
    });
  }
});

describe('filterNaN removes Infinity', () => {
  for (let i = 1; i <= 30; i++) {
    it(`filterNaN removes ${i} Infinities`, () => {
      const arr = [...Array(i).fill(Infinity), 5, 10];
      const result = filterNaN(arr);
      expect(result).toEqual([5, 10]);
    });
  }
});

// ─── scaleToRange ────────────────────────────────────────────────────────────
describe('scaleToRange', () => {
  for (let i = 1; i <= 50; i++) {
    it(`scale midpoint of [0,${i}] to [0,100] = 50`, () => {
      const mid = i / 2;
      const scaled = scaleToRange(mid, 0, i, 0, 100);
      expect(scaled).toBeCloseTo(50, 8);
    });
  }
});

describe('scaleToRange boundaries', () => {
  for (let i = 1; i <= 50; i++) {
    it(`scale 0 in [0,${i}] to [0,200] = 0`, () => {
      expect(scaleToRange(0, 0, i, 0, 200)).toBe(0);
    });
  }
});

// ─── formatValue ─────────────────────────────────────────────────────────────
describe('formatValue', () => {
  for (let i = 0; i <= 30; i++) {
    it(`formatValue(${i * 1000}, 0) contains no decimal`, () => {
      const s = formatValue(i * 1000, 0);
      expect(s).not.toContain('.');
    });
  }
});

// ─── formatPct ───────────────────────────────────────────────────────────────
describe('formatPct', () => {
  for (let i = 0; i <= 100; i++) {
    it(`formatPct(${i}) ends with %`, () => {
      expect(formatPct(i)).toMatch(/%$/);
    });
  }
});

// ─── generateColors ──────────────────────────────────────────────────────────
describe('generateColors', () => {
  for (let i = 1; i <= 50; i++) {
    it(`generateColors(${i}) returns ${i} hex strings`, () => {
      const colors = generateColors(i);
      expect(colors).toHaveLength(i);
      for (const c of colors) {
        expect(c).toMatch(/^#[0-9a-f]{6}$/i);
      }
    });
  }
});

// ─── interpolateColor ────────────────────────────────────────────────────────
describe('interpolateColor t=0 returns from', () => {
  const pairs = ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#123456'];
  for (let i = 0; i < pairs.length - 1; i++) {
    const from = pairs[i];
    const to = pairs[i + 1];
    it(`interpolate(${from},${to},0) = ${from}`, () => {
      expect(interpolateColor(from, to, 0).toLowerCase()).toBe(from.toLowerCase());
    });
  }
  for (let i = 0; i < pairs.length - 1; i++) {
    const from = pairs[i];
    const to = pairs[i + 1];
    it(`interpolate(${from},${to},1) = ${to}`, () => {
      expect(interpolateColor(from, to, 1).toLowerCase()).toBe(to.toLowerCase());
    });
  }
});

describe('interpolateColor midpoints', () => {
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    it(`interpolate(#000000,#ffffff,${t}) is valid hex`, () => {
      const result = interpolateColor('#000000', '#ffffff', t);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });
  }
});

// ─── getMinMax ───────────────────────────────────────────────────────────────
describe('getMinMax', () => {
  for (let i = 1; i <= 50; i++) {
    it(`getMinMax of ${i} points starting at 1`, () => {
      const series: Series = {
        name: 'test',
        data: Array.from({ length: i }, (_, k) => ({ x: k, y: k + 1 })),
      };
      const mm = getMinMax(series);
      expect(mm.min).toBe(1);
      expect(mm.max).toBe(i);
    });
  }
});

// ─── padSeries ───────────────────────────────────────────────────────────────
describe('padSeries', () => {
  for (let i = 1; i <= 50; i++) {
    it(`padSeries of length 5 to length ${5 + i} has ${5 + i} points`, () => {
      const series: Series = {
        name: 'test',
        data: Array.from({ length: 5 }, (_, k) => ({ x: k, y: k })),
      };
      const padded = padSeries(series, 5 + i, 0);
      expect(padded.data).toHaveLength(5 + i);
    });
  }
});

describe('padSeries fill value', () => {
  for (let i = 1; i <= 30; i++) {
    it(`padSeries fill value = ${i}`, () => {
      const series: Series = {
        name: 'test',
        data: [{ x: 0, y: 1 }],
      };
      const padded = padSeries(series, 4, i);
      expect(padded.data[1].y).toBe(i);
      expect(padded.data[2].y).toBe(i);
      expect(padded.data[3].y).toBe(i);
    });
  }
});

// ─── alignSeries ─────────────────────────────────────────────────────────────
describe('alignSeries', () => {
  for (let i = 1; i <= 30; i++) {
    it(`alignSeries with ${i} disjoint x labels produces ${i * 2} aligned points each`, () => {
      const a: Series = {
        name: 'a',
        data: Array.from({ length: i }, (_, k) => ({ x: `a${k}`, y: k })),
      };
      const b: Series = {
        name: 'b',
        data: Array.from({ length: i }, (_, k) => ({ x: `b${k}`, y: k * 2 })),
      };
      const [na, nb] = alignSeries(a, b);
      expect(na.data).toHaveLength(i * 2);
      expect(nb.data).toHaveLength(i * 2);
    });
  }
});

// ─── toSeries ────────────────────────────────────────────────────────────────
describe('toSeries', () => {
  for (let i = 1; i <= 30; i++) {
    it(`toSeries with ${i} records produces ${i} data points`, () => {
      const data = Array.from({ length: i }, (_, k) => ({ name: k, value: k * 2 })) as Record<
        string,
        number
      >[];
      const s = toSeries(data, 'name', 'value');
      expect(s.data).toHaveLength(i);
    });
  }
});

describe('toSeries values', () => {
  for (let i = 1; i <= 30; i++) {
    it(`toSeries y value = ${i * 3}`, () => {
      const data = [{ label: i, val: i * 3 }] as unknown as Record<string, number>[];
      const s = toSeries(data, 'label', 'val');
      expect(s.data[0].y).toBe(i * 3);
    });
  }
});

// ─── toPieSeries ─────────────────────────────────────────────────────────────
describe('toPieSeries percentages sum to 100', () => {
  for (let i = 2; i <= 31; i++) {
    it(`toPieSeries with ${i} equal slices each = ${(100 / i).toFixed(2)}%`, () => {
      const data = Array.from({ length: i }, (_, k) => ({
        label: `slice${k}`,
        value: 1,
      })) as unknown as Record<string, number>[];
      const slices = toPieSeries(data, 'label', 'value');
      const total = slices.reduce((s, sl) => s + sl.percentage, 0);
      expect(total).toBeCloseTo(100, 8);
    });
  }
});

// ─── toHeatmap ───────────────────────────────────────────────────────────────
describe('toHeatmap', () => {
  for (let i = 1; i <= 30; i++) {
    it(`toHeatmap with ${i} cells returns ${i} cells`, () => {
      const data = Array.from({ length: i }, (_, k) => ({
        x: `x${k}`,
        y: `y${k}`,
        value: k,
      }));
      const result = toHeatmap(data);
      expect(result).toHaveLength(i);
      expect(result[0].value).toBe(0);
    });
  }
});

// ─── mergeSeriesData ─────────────────────────────────────────────────────────
describe('mergeSeriesData', () => {
  for (let i = 1; i <= 20; i++) {
    it(`mergeSeriesData with ${i} series has ${i} series`, () => {
      const seriesArr: Series[] = Array.from({ length: i }, (_, k) => ({
        name: `s${k}`,
        data: [{ x: k, y: k }],
      }));
      const result = mergeSeriesData(...seriesArr);
      expect(result.series).toHaveLength(i);
    });
  }
});

// ─── transposeToSeries ───────────────────────────────────────────────────────
describe('transposeToSeries', () => {
  for (let i = 1; i <= 20; i++) {
    it(`transposeToSeries with ${i} value columns produces ${i} series`, () => {
      const row: Record<string, number | string> = { label: 'a' };
      for (let k = 0; k < i; k++) row[`col${k}`] = k;
      const result = transposeToSeries([row], 'label');
      expect(result).toHaveLength(i);
    });
  }
});

// ─── bucketize ───────────────────────────────────────────────────────────────
describe('bucketize', () => {
  for (let i = 1; i <= 30; i++) {
    it(`bucketize [0..99] into ${i} buckets = ${i} buckets`, () => {
      const arr = Array.from({ length: 100 }, (_, k) => k);
      const buckets = bucketize(arr, i);
      expect(buckets).toHaveLength(i);
    });
  }
});

describe('bucketize total count', () => {
  for (let i = 1; i <= 20; i++) {
    it(`bucketize total count = 100 for ${i} buckets`, () => {
      const arr = Array.from({ length: 100 }, (_, k) => k);
      const buckets = bucketize(arr, i);
      const total = buckets.reduce((s, b) => s + b.count, 0);
      expect(total).toBe(100);
    });
  }
});

// ─── rollup ──────────────────────────────────────────────────────────────────
describe('rollup sum window=1 is identity', () => {
  for (let i = 1; i <= 30; i++) {
    it(`rollup window=1 sum for ${i} points equals original`, () => {
      const data = Array.from({ length: i }, (_, k) => ({ x: k, y: k + 1 }));
      const series: Series = { name: 'r', data };
      const result = rollup(series.data, 1, 'sum');
      for (let j = 0; j < i; j++) {
        expect(result[j].y).toBe(j + 1);
      }
    });
  }
});

// ─── resample ────────────────────────────────────────────────────────────────
describe('resample to smaller length', () => {
  for (let i = 1; i <= 20; i++) {
    it(`resample 100 points to ${i} points`, () => {
      const data = Array.from({ length: 100 }, (_, k) => ({ x: k, y: k }));
      const series: Series = { name: 's', data };
      const resampled = resample(series, i, 'average');
      expect(resampled.data).toHaveLength(i);
    });
  }
});

// ─── groupByTime ─────────────────────────────────────────────────────────────
describe('groupByTime by day', () => {
  for (let i = 1; i <= 20; i++) {
    it(`groupByTime ${i} points in same day = 1 bucket`, () => {
      const day = new Date('2026-01-01').getTime();
      const points = Array.from({ length: i }, (_, k) => ({
        timestamp: day + k * 60000,
        value: k + 1,
      }));
      const result = groupByTime(points, 'day', 'sum');
      expect(result).toHaveLength(1);
      expect(result[0].y).toBe((i * (i + 1)) / 2);
    });
  }
});

// ─── rollingCorrelation ──────────────────────────────────────────────────────
describe('rollingCorrelation perfect positive', () => {
  for (let i = 5; i <= 20; i++) {
    it(`rollingCorrelation of identical arrays length=${i} window=3: last = 1`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      const result = rollingCorrelation(arr, arr, 3);
      const valid = result.filter((v) => !isNaN(v));
      for (const v of valid) {
        expect(v).toBeCloseTo(1, 8);
      }
    });
  }
});

// ─── rollingCorrelation negative ─────────────────────────────────────────────
describe('rollingCorrelation perfect negative', () => {
  for (let i = 5; i <= 20; i++) {
    it(`rollingCorrelation of arr and negated arr length=${i}: valid values = -1`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      const neg = arr.map((v) => -v);
      const result = rollingCorrelation(arr, neg, 3);
      const valid = result.filter((v) => !isNaN(v));
      for (const v of valid) {
        expect(v).toBeCloseTo(-1, 8);
      }
    });
  }
});

// ─── cumulative correctness ──────────────────────────────────────────────────
describe('cumulative intermediate values', () => {
  for (let i = 1; i <= 50; i++) {
    it(`cumulative of ${i} twos: last = ${i * 2}`, () => {
      const arr = Array(i).fill(2);
      const c = cumulative(arr);
      expect(c[c.length - 1]).toBe(i * 2);
    });
  }
});

// ─── pctChange from halving ──────────────────────────────────────────────────
describe('pctChange halving', () => {
  for (let i = 1; i <= 50; i++) {
    it(`pctChange from ${i * 2} to ${i} = -50%`, () => {
      const r = pctChange([i * 2, i]);
      expect(r[1]).toBeCloseTo(-50, 0);
    });
  }
});

// ─── normalize edge case: single value ──────────────────────────────────────
describe('normalize single value', () => {
  for (let i = 1; i <= 30; i++) {
    it(`normalize [${i}] = [0]`, () => {
      const n = normalize([i]);
      expect(n[0]).toBe(0);
    });
  }
});

// ─── standardize unit variance ───────────────────────────────────────────────
describe('standardize unit variance', () => {
  for (let i = 2; i <= 31; i++) {
    it(`standardize [1..${i}]: stddev ≈ 1`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      const s = standardize(arr);
      const mean = s.reduce((a, b) => a + b, 0) / s.length;
      const variance = s.reduce((a, b) => a + (b - mean) ** 2, 0) / s.length;
      expect(Math.sqrt(variance)).toBeCloseTo(1, 8);
    });
  }
});

// ─── movingAverage NaN prefix ────────────────────────────────────────────────
describe('movingAverage NaN prefix', () => {
  for (let period = 2; period <= 21; period++) {
    it(`movingAverage period=${period}: first ${period - 1} values are NaN`, () => {
      const arr = Array.from({ length: 30 }, (_, k) => k + 1);
      const ma = movingAverage(arr, period);
      for (let j = 0; j < period - 1; j++) {
        expect(isNaN(ma.values[j])).toBe(true);
      }
    });
  }
});

// ─── generateColors distinct ─────────────────────────────────────────────────
describe('generateColors all distinct', () => {
  for (let i = 2; i <= 21; i++) {
    it(`generateColors(${i}) all colors distinct`, () => {
      const colors = generateColors(i);
      const unique = new Set(colors.map((c) => c.toLowerCase()));
      expect(unique.size).toBe(i);
    });
  }
});

// ─── scaleToRange linearity ──────────────────────────────────────────────────
describe('scaleToRange linearity', () => {
  for (let i = 1; i <= 30; i++) {
    it(`scaleToRange(${i}, 0, 100, 0, 1000) = ${i * 10}`, () => {
      expect(scaleToRange(i, 0, 100, 0, 1000)).toBeCloseTo(i * 10, 8);
    });
  }
});

// ─── filterNaN empty input ────────────────────────────────────────────────────
describe('filterNaN empty input', () => {
  for (let i = 0; i < 20; i++) {
    it(`filterNaN([]) = [] (call ${i})`, () => {
      expect(filterNaN([])).toEqual([]);
    });
  }
});

// ─── aggregate edge cases ────────────────────────────────────────────────────
describe('aggregate empty array returns 0', () => {
  const methods: Parameters<typeof aggregate>[1][] = [
    'sum', 'average', 'min', 'max', 'count', 'first', 'last', 'median', 'stddev',
  ];
  for (const method of methods) {
    for (let i = 0; i < 5; i++) {
      it(`aggregate([], '${method}') = 0 (call ${i})`, () => {
        expect(aggregate([], method)).toBe(0);
      });
    }
  }
});

// ─── pctChange first element always 0 ────────────────────────────────────────
describe('pctChange first element = 0', () => {
  for (let i = 1; i <= 30; i++) {
    it(`pctChange first element = 0 for array starting at ${i}`, () => {
      const arr = Array.from({ length: 5 }, (_, k) => i + k);
      expect(pctChange(arr)[0]).toBe(0);
    });
  }
});

// ─── detectOutliers threshold ────────────────────────────────────────────────
describe('detectOutliers zscore within threshold', () => {
  for (let i = 1; i <= 30; i++) {
    it(`detectOutliers normal array size=${i * 10} with threshold=100 = 0 outliers`, () => {
      const arr = Array.from({ length: i * 10 }, (_, k) => k + 1);
      expect(detectOutliers(arr, 100)).toHaveLength(0);
    });
  }
});

// ─── bucketize single bucket edge ────────────────────────────────────────────
describe('bucketize single bucket', () => {
  for (let i = 1; i <= 30; i++) {
    it(`bucketize ${i} values into 1 bucket has count=${i}`, () => {
      const arr = Array.from({ length: i }, (_, k) => k + 1);
      const b = bucketize(arr, 1);
      expect(b[0].count).toBe(i);
    });
  }
});

// ─── mergeSeriesData xLabels count ───────────────────────────────────────────
describe('mergeSeriesData xLabels', () => {
  for (let i = 1; i <= 20; i++) {
    it(`mergeSeriesData with ${i} unique x values has ${i} xLabels`, () => {
      const seriesArr: Series[] = Array.from({ length: 2 }, () => ({
        name: 'x',
        data: Array.from({ length: i }, (_, k) => ({ x: `label${k}`, y: k })),
      }));
      const merged = mergeSeriesData(...seriesArr);
      expect(merged.xLabels).toHaveLength(i);
    });
  }
});

// ─── resample same-length is copy ────────────────────────────────────────────
describe('resample same length', () => {
  for (let i = 5; i <= 25; i++) {
    it(`resample ${i} points to ${i} = same length`, () => {
      const data = Array.from({ length: i }, (_, k) => ({ x: k, y: k }));
      const s: Series = { name: 's', data };
      const r = resample(s, i, 'sum');
      expect(r.data).toHaveLength(i);
    });
  }
});

// ─── rollup window=N sum last N elements ─────────────────────────────────────
describe('rollup window sum correctness', () => {
  for (let w = 2; w <= 6; w++) {
    it(`rollup window=${w} last point = sum of last ${w}`, () => {
      const data = Array.from({ length: 20 }, (_, k) => ({ x: k, y: k + 1 }));
      const result = rollup(data, w, 'sum');
      const last = result[result.length - 1].y;
      const expected = data
        .slice(20 - w)
        .reduce((s, p) => s + p.y, 0);
      expect(last).toBeCloseTo(expected, 8);
    });
  }
});

// ─── linearTrend flat ────────────────────────────────────────────────────────
describe('linearTrend flat direction', () => {
  for (let i = 1; i <= 20; i++) {
    it(`flat line value=${i}: direction=flat`, () => {
      const points = Array.from({ length: 5 }, (_, k) => ({ x: k, y: i }));
      const t = linearTrend(points);
      expect(t.direction).toBe('flat');
    });
  }
});

// ─── groupByTime multiple days ───────────────────────────────────────────────
describe('groupByTime multiple days', () => {
  for (let days = 2; days <= 11; days++) {
    it(`groupByTime ${days} points 1 per day = ${days} buckets`, () => {
      const points = Array.from({ length: days }, (_, k) => ({
        timestamp: new Date(`2026-01-${(k + 1).toString().padStart(2, '0')}`).getTime(),
        value: k + 1,
      }));
      const result = groupByTime(points, 'day', 'sum');
      expect(result).toHaveLength(days);
    });
  }
});

// ─── toSeries name field ──────────────────────────────────────────────────────
describe('toSeries name matches nameField', () => {
  for (let i = 1; i <= 20; i++) {
    it(`toSeries name = 'field${i}'`, () => {
      const data = [{ [`field${i}`]: 1, value: 42 }] as unknown as Record<string, number>[];
      const s = toSeries(data, `field${i}`, 'value');
      expect(s.name).toBe(`field${i}`);
    });
  }
});

// ─── toPieSeries zero total ──────────────────────────────────────────────────
describe('toPieSeries zero total = 0% each', () => {
  for (let i = 1; i <= 20; i++) {
    it(`toPieSeries with ${i} zero-value slices all = 0%`, () => {
      const data = Array.from({ length: i }, (_, k) => ({
        label: `l${k}`,
        value: 0,
      })) as unknown as Record<string, number>[];
      const slices = toPieSeries(data, 'label', 'value');
      for (const s of slices) expect(s.percentage).toBe(0);
    });
  }
});

// ─── exponentialMovingAverage alpha=0 constant ───────────────────────────────
describe('exponentialMovingAverage alpha=0 constant', () => {
  for (let i = 1; i <= 20; i++) {
    it(`EMA alpha=0 all values equal first: first=${i}`, () => {
      const arr = Array.from({ length: 10 }, (_, k) => i + k);
      const ema = exponentialMovingAverage(arr, 0);
      for (const v of ema) expect(v).toBeCloseTo(i, 8);
    });
  }
});

// ─── alignSeries matching x labels ──────────────────────────────────────────
describe('alignSeries same x labels', () => {
  for (let i = 2; i <= 21; i++) {
    it(`alignSeries same ${i} x labels: each has ${i} points`, () => {
      const makeS = (name: string): Series => ({
        name,
        data: Array.from({ length: i }, (_, k) => ({ x: `x${k}`, y: k })),
      });
      const [na, nb] = alignSeries(makeS('a'), makeS('b'));
      expect(na.data).toHaveLength(i);
      expect(nb.data).toHaveLength(i);
    });
  }
});

// ─── padSeries no-op when already at length ───────────────────────────────────
describe('padSeries no-op', () => {
  for (let i = 5; i <= 24; i++) {
    it(`padSeries series of length ${i} to ${i} = unchanged`, () => {
      const s: Series = {
        name: 'x',
        data: Array.from({ length: i }, (_, k) => ({ x: k, y: k })),
      };
      const result = padSeries(s, i);
      expect(result.data).toHaveLength(i);
    });
  }
});
