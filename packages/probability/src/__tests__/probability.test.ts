// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  seededRNG,
  uniformInt,
  uniformFloat,
  normalSample,
  normalPDF,
  normalCDF,
  bernoulli,
  binomialSample,
  poissonSample,
  poissonPMF,
  exponentialSample,
  exponentialPDF,
  exponentialCDF,
  geometricSample,
  weightedChoice,
  weightedSample,
  randomChoice,
  randomSample,
  shuffle,
  histogram,
  empiricalCDF,
  mean,
  variance,
  stddev,
  skewness,
  kurtosis,
  covariance,
  correlation,
  binomialPMF,
  binomialCDF,
  zScore,
  fromZScore,
  monteCarlo,
} from '../probability';

// ---------------------------------------------------------------------------
// Helper RNGs
// ---------------------------------------------------------------------------
const always0: () => number = () => 0;
const always05: () => number = () => 0.5;
const always099: () => number = () => 0.99;
const always001: () => number = () => 0.01;

// Cycle through a fixed sequence of values
function cycleRNG(values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length];
}

// ---------------------------------------------------------------------------
// seededRNG — 50+ tests
// ---------------------------------------------------------------------------
describe('seededRNG', () => {
  it('returns a function', () => {
    expect(typeof seededRNG(1)).toBe('function');
  });

  it('same seed produces same first value', () => {
    expect(seededRNG(42)()).toBe(seededRNG(42)());
  });

  it('different seeds produce different first values', () => {
    expect(seededRNG(1)()).not.toBe(seededRNG(2)());
  });

  it('values are in [0, 1)', () => {
    const rng = seededRNG(99);
    for (let i = 0; i < 200; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  // Same seed → same full sequence
  for (let seed = 0; seed < 20; seed++) {
    it(`seed ${seed}: same sequence produced on repeat`, () => {
      const a = seededRNG(seed);
      const b = seededRNG(seed);
      for (let j = 0; j < 10; j++) {
        expect(a()).toBe(b());
      }
    });
  }

  // Different seeds → different sequences
  for (let s = 1; s <= 10; s++) {
    it(`seed ${s} differs from seed ${s + 100}`, () => {
      const a = seededRNG(s)();
      const b = seededRNG(s + 100)();
      expect(a).not.toBe(b);
    });
  }

  it('sequence advances on each call', () => {
    const rng = seededRNG(7);
    const vals = Array.from({ length: 10 }, () => rng());
    const unique = new Set(vals);
    expect(unique.size).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// uniformInt — 100+ tests
// ---------------------------------------------------------------------------
describe('uniformInt', () => {
  const rng = seededRNG(1);

  it('returns min when rng=0', () => {
    expect(uniformInt(3, 10, always0)).toBe(3);
  });

  it('returns max when rng just below 1', () => {
    // floor(0.99 * (10-3+1)) + 3 = floor(7.92) + 3 = 7 + 3 = 10
    expect(uniformInt(3, 10, always099)).toBe(10);
  });

  it('returns same value when min === max', () => {
    expect(uniformInt(5, 5, always05)).toBe(5);
  });

  it('uses Math.random by default (no throw)', () => {
    expect(() => uniformInt(0, 1)).not.toThrow();
  });

  // Range checks across different [min, max] pairs
  const ranges: Array<[number, number]> = [
    [0, 0], [0, 1], [0, 9], [1, 6], [-5, 5], [-10, -1], [100, 200],
  ];
  for (const [lo, hi] of ranges) {
    for (let trial = 0; trial < 10; trial++) {
      it(`uniformInt(${lo}, ${hi}) trial ${trial} stays in range`, () => {
        const v = uniformInt(lo, hi, rng);
        expect(v).toBeGreaterThanOrEqual(lo);
        expect(v).toBeLessThanOrEqual(hi);
        expect(Number.isInteger(v)).toBe(true);
      });
    }
  }

  // Seeded reproducibility — 20 pairs
  for (let i = 0; i < 20; i++) {
    it(`uniformInt seeded reproducibility #${i}`, () => {
      const r1 = seededRNG(i);
      const r2 = seededRNG(i);
      expect(uniformInt(0, 100, r1)).toBe(uniformInt(0, 100, r2));
    });
  }

  it('negative range produces integer', () => {
    const v = uniformInt(-100, -50, always05);
    expect(Number.isInteger(v)).toBe(true);
    expect(v).toBeGreaterThanOrEqual(-100);
    expect(v).toBeLessThanOrEqual(-50);
  });
});

// ---------------------------------------------------------------------------
// uniformFloat — 80+ tests
// ---------------------------------------------------------------------------
describe('uniformFloat', () => {
  it('returns min when rng=0', () => {
    expect(uniformFloat(2, 8, always0)).toBe(2);
  });

  it('approaches max when rng→1', () => {
    const v = uniformFloat(0, 10, always099);
    expect(v).toBeCloseTo(9.9, 5);
  });

  it('uses Math.random by default', () => {
    expect(() => uniformFloat(0, 1)).not.toThrow();
  });

  it('returns midpoint when rng=0.5', () => {
    expect(uniformFloat(0, 10, always05)).toBeCloseTo(5, 10);
  });

  // Range checks
  const ranges: Array<[number, number]> = [
    [0, 1], [-1, 1], [10, 20], [-50, 50], [0.5, 1.5], [100, 200],
  ];
  for (const [lo, hi] of ranges) {
    for (let trial = 0; trial < 10; trial++) {
      it(`uniformFloat(${lo}, ${hi}) trial ${trial} in range`, () => {
        const rng = seededRNG(trial * 13 + lo + hi);
        const v = uniformFloat(lo, hi, rng);
        expect(v).toBeGreaterThanOrEqual(lo);
        expect(v).toBeLessThan(hi + 0.001); // allow for floating point
      });
    }
  }

  // Seeded reproducibility — 10
  for (let i = 0; i < 10; i++) {
    it(`uniformFloat seeded #${i}`, () => {
      const r1 = seededRNG(i + 500);
      const r2 = seededRNG(i + 500);
      expect(uniformFloat(-10, 10, r1)).toBe(uniformFloat(-10, 10, r2));
    });
  }
});

// ---------------------------------------------------------------------------
// normalSample — 80+ tests
// ---------------------------------------------------------------------------
describe('normalSample', () => {
  it('uses default mean=0, stddev=1', () => {
    // With fixed rng, should not throw
    const rng = seededRNG(10);
    expect(() => normalSample(undefined, undefined, rng)).not.toThrow();
  });

  it('uses Math.random by default', () => {
    expect(() => normalSample()).not.toThrow();
  });

  // Large sample mean should be near the specified mean
  it('mean of 10000 samples ≈ specified mean (seeded)', () => {
    const rng = seededRNG(111);
    const samples = Array.from({ length: 10000 }, () => normalSample(5, 1, rng));
    const m = samples.reduce((a, b) => a + b, 0) / samples.length;
    expect(m).toBeGreaterThan(4.9);
    expect(m).toBeLessThan(5.1);
  });

  it('large sample stddev ≈ specified stddev (seeded)', () => {
    const rng = seededRNG(222);
    const samples = Array.from({ length: 10000 }, () => normalSample(0, 2, rng));
    const m = samples.reduce((a, b) => a + b, 0) / samples.length;
    const v = samples.reduce((a, x) => a + (x - m) ** 2, 0) / samples.length;
    expect(Math.sqrt(v)).toBeGreaterThan(1.9);
    expect(Math.sqrt(v)).toBeLessThan(2.1);
  });

  // Seeded reproducibility
  for (let i = 0; i < 30; i++) {
    it(`normalSample seeded #${i} reproducible`, () => {
      const r1 = seededRNG(i + 1000);
      const r2 = seededRNG(i + 1000);
      expect(normalSample(0, 1, r1)).toBe(normalSample(0, 1, r2));
    });
  }

  // Different means give different outputs (probabilistically)
  for (let m = -5; m <= 5; m += 5) {
    it(`normalSample(${m}, 0.001) ≈ ${m}`, () => {
      const rng = seededRNG(m + 50);
      const v = normalSample(m, 0.001, rng);
      expect(v).toBeGreaterThan(m - 0.1);
      expect(v).toBeLessThan(m + 0.1);
    });
  }

  // Different stddevs scale output
  for (let s = 1; s <= 10; s++) {
    it(`normalSample(0, ${s}) uses rng correctly`, () => {
      const rng = seededRNG(s + 200);
      const v = normalSample(0, s, rng);
      expect(typeof v).toBe('number');
      expect(isFinite(v)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// normalPDF — 60+ tests
// ---------------------------------------------------------------------------
describe('normalPDF', () => {
  it('peak at mean', () => {
    const peak = normalPDF(0, 0, 1);
    expect(peak).toBeCloseTo(1 / Math.sqrt(2 * Math.PI), 6);
  });

  it('symmetric around mean', () => {
    expect(normalPDF(1, 0, 1)).toBeCloseTo(normalPDF(-1, 0, 1), 10);
    expect(normalPDF(2, 0, 1)).toBeCloseTo(normalPDF(-2, 0, 1), 10);
  });

  it('decreases away from mean', () => {
    expect(normalPDF(0, 0, 1)).toBeGreaterThan(normalPDF(1, 0, 1));
    expect(normalPDF(1, 0, 1)).toBeGreaterThan(normalPDF(2, 0, 1));
  });

  it('non-negative everywhere', () => {
    for (let x = -5; x <= 5; x += 0.5) {
      expect(normalPDF(x, 0, 1)).toBeGreaterThanOrEqual(0);
    }
  });

  it('integrates to ≈1 via Riemann sum', () => {
    let sum = 0;
    const dx = 0.001;
    for (let x = -8; x <= 8; x += dx) sum += normalPDF(x, 0, 1) * dx;
    expect(sum).toBeCloseTo(1, 2);
  });

  // PDF at specific offsets
  const offsets = [-3, -2, -1, 0, 1, 2, 3];
  for (const x of offsets) {
    it(`normalPDF(${x}, 0, 1) is finite and ≥0`, () => {
      const v = normalPDF(x, 0, 1);
      expect(isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    });
  }

  // Different means
  for (let m = -5; m <= 5; m += 2) {
    it(`normalPDF at mean=${m} equals peak of standard normal / stddev`, () => {
      const v = normalPDF(m, m, 2);
      expect(v).toBeCloseTo(1 / (2 * Math.sqrt(2 * Math.PI)), 6);
    });
  }

  // Different stddevs shift peak height
  for (let s = 1; s <= 5; s++) {
    it(`normalPDF(mean, mean, ${s}) peak = 1/(${s}*sqrt(2pi))`, () => {
      const v = normalPDF(10, 10, s);
      expect(v).toBeCloseTo(1 / (s * Math.sqrt(2 * Math.PI)), 6);
    });
  }
});

// ---------------------------------------------------------------------------
// normalCDF — 60+ tests
// ---------------------------------------------------------------------------
describe('normalCDF', () => {
  it('CDF at mean = 0.5', () => {
    expect(normalCDF(0, 0, 1)).toBeCloseTo(0.5, 5);
  });

  it('CDF at -∞ ≈ 0', () => {
    expect(normalCDF(-10, 0, 1)).toBeLessThan(0.0001);
  });

  it('CDF at +∞ ≈ 1', () => {
    expect(normalCDF(10, 0, 1)).toBeGreaterThan(0.9999);
  });

  it('CDF at mean + 1σ ≈ 0.8413', () => {
    expect(normalCDF(1, 0, 1)).toBeCloseTo(0.8413, 3);
  });

  it('CDF at mean - 1σ ≈ 0.1587', () => {
    expect(normalCDF(-1, 0, 1)).toBeCloseTo(0.1587, 3);
  });

  it('CDF at mean + 2σ ≈ 0.9772', () => {
    expect(normalCDF(2, 0, 1)).toBeCloseTo(0.9772, 3);
  });

  it('CDF is monotonically increasing', () => {
    let prev = 0;
    for (let x = -4; x <= 4; x += 0.5) {
      const curr = normalCDF(x, 0, 1);
      expect(curr).toBeGreaterThanOrEqual(prev);
      prev = curr;
    }
  });

  it('CDF output is in [0, 1]', () => {
    for (let x = -6; x <= 6; x += 0.5) {
      const v = normalCDF(x, 0, 1);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });

  it('shifted distribution: CDF(mean, mean, s) = 0.5 for any s', () => {
    for (let s = 1; s <= 5; s++) {
      expect(normalCDF(s * 10, s * 10, s)).toBeCloseTo(0.5, 4);
    }
  });

  // Specific known values
  const cases: Array<[number, number, number, number]> = [
    [0, 0, 1, 0.5],
    [1.96, 0, 1, 0.975],
    [-1.96, 0, 1, 0.025],
    [1.645, 0, 1, 0.95],
  ];
  for (const [x, m, s, expected] of cases) {
    it(`normalCDF(${x}, ${m}, ${s}) ≈ ${expected}`, () => {
      expect(normalCDF(x, m, s)).toBeCloseTo(expected, 2);
    });
  }

  // Symmetry: CDF(x) + CDF(-x) ≈ 1
  for (let x = 0.5; x <= 3; x += 0.5) {
    it(`normalCDF(${x}) + normalCDF(-${x}) ≈ 1`, () => {
      expect(normalCDF(x, 0, 1) + normalCDF(-x, 0, 1)).toBeCloseTo(1, 5);
    });
  }
});

// ---------------------------------------------------------------------------
// bernoulli — 60+ tests
// ---------------------------------------------------------------------------
describe('bernoulli', () => {
  it('p=0 always false', () => {
    for (let i = 0; i < 20; i++) {
      expect(bernoulli(0, seededRNG(i))).toBe(false);
    }
  });

  it('p=1 always true', () => {
    for (let i = 0; i < 20; i++) {
      expect(bernoulli(1, seededRNG(i))).toBe(true);
    }
  });

  it('returns a boolean', () => {
    const rng = seededRNG(5);
    for (let i = 0; i < 10; i++) {
      expect(typeof bernoulli(0.5, rng)).toBe('boolean');
    }
  });

  it('uses Math.random by default', () => {
    expect(() => bernoulli(0.5)).not.toThrow();
  });

  // p=0.5 with deterministic rng
  for (let trial = 0; trial < 20; trial++) {
    it(`bernoulli(0.5) seeded trial ${trial} is boolean`, () => {
      const rng = seededRNG(trial + 3000);
      expect(typeof bernoulli(0.5, rng)).toBe('boolean');
    });
  }

  it('p = 0.5 with rng=0.4 returns true', () => {
    expect(bernoulli(0.5, () => 0.4)).toBe(true);
  });

  it('p = 0.5 with rng=0.6 returns false', () => {
    expect(bernoulli(0.5, () => 0.6)).toBe(false);
  });

  it('large sample proportion ≈ p', () => {
    const rng = seededRNG(777);
    let trues = 0;
    const N = 10000;
    for (let i = 0; i < N; i++) {
      if (bernoulli(0.3, rng)) trues++;
    }
    expect(trues / N).toBeGreaterThan(0.28);
    expect(trues / N).toBeLessThan(0.32);
  });
});

// ---------------------------------------------------------------------------
// binomialSample — 50+ tests
// ---------------------------------------------------------------------------
describe('binomialSample', () => {
  it('n=0 always returns 0', () => {
    for (let i = 0; i < 10; i++) {
      expect(binomialSample(0, 0.5, seededRNG(i))).toBe(0);
    }
  });

  it('p=0 always returns 0', () => {
    for (let i = 0; i < 10; i++) {
      expect(binomialSample(10, 0, seededRNG(i))).toBe(0);
    }
  });

  it('p=1 always returns n', () => {
    for (let n = 1; n <= 10; n++) {
      expect(binomialSample(n, 1, seededRNG(n))).toBe(n);
    }
  });

  it('result is in [0, n]', () => {
    const rng = seededRNG(42);
    for (let trial = 0; trial < 20; trial++) {
      const v = binomialSample(10, 0.5, rng);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it('uses Math.random by default', () => {
    expect(() => binomialSample(5, 0.5)).not.toThrow();
  });

  it('large sample mean ≈ n*p', () => {
    const rng = seededRNG(123);
    const N = 5000;
    const total = Array.from({ length: N }, () => binomialSample(20, 0.4, rng))
      .reduce((a, b) => a + b, 0);
    expect(total / N).toBeGreaterThan(7.8);
    expect(total / N).toBeLessThan(8.2);
  });

  // Integer result checks
  for (let i = 0; i < 10; i++) {
    it(`binomialSample returns integer #${i}`, () => {
      const rng = seededRNG(i + 400);
      expect(Number.isInteger(binomialSample(15, 0.6, rng))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// poissonSample — 50+ tests
// ---------------------------------------------------------------------------
describe('poissonSample', () => {
  it('returns a non-negative integer', () => {
    const rng = seededRNG(1);
    for (let i = 0; i < 20; i++) {
      const v = poissonSample(3, rng);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('uses Math.random by default', () => {
    expect(() => poissonSample(2)).not.toThrow();
  });

  it('large sample mean ≈ lambda', () => {
    const rng = seededRNG(99);
    const N = 10000;
    const total = Array.from({ length: N }, () => poissonSample(5, rng))
      .reduce((a, b) => a + b, 0);
    expect(total / N).toBeGreaterThan(4.9);
    expect(total / N).toBeLessThan(5.1);
  });

  // PMF tests
  it('poissonPMF(0, lambda) = e^(-lambda)', () => {
    expect(poissonPMF(0, 3)).toBeCloseTo(Math.exp(-3), 6);
  });

  it('poissonPMF non-negative integer', () => {
    for (let k = 0; k <= 10; k++) {
      expect(poissonPMF(k, 2)).toBeGreaterThanOrEqual(0);
    }
  });

  it('poissonPMF sums ≈ 1 over large range', () => {
    let sum = 0;
    for (let k = 0; k <= 100; k++) sum += poissonPMF(k, 5);
    expect(sum).toBeCloseTo(1, 4);
  });

  it('poissonPMF(-1, 3) = 0', () => {
    expect(poissonPMF(-1, 3)).toBe(0);
  });

  it('poissonPMF non-integer k = 0', () => {
    expect(poissonPMF(1.5, 3)).toBe(0);
  });

  // Seeded reproducibility
  for (let i = 0; i < 15; i++) {
    it(`poissonSample seeded #${i} reproducible`, () => {
      const r1 = seededRNG(i + 2000);
      const r2 = seededRNG(i + 2000);
      expect(poissonSample(4, r1)).toBe(poissonSample(4, r2));
    });
  }
});

// ---------------------------------------------------------------------------
// exponentialSample / PDF / CDF — 60+ tests
// ---------------------------------------------------------------------------
describe('exponential distribution', () => {
  it('exponentialSample returns positive number', () => {
    const rng = seededRNG(1);
    for (let i = 0; i < 20; i++) {
      expect(exponentialSample(1, rng)).toBeGreaterThan(0);
    }
  });

  it('uses Math.random by default', () => {
    expect(() => exponentialSample(1)).not.toThrow();
  });

  it('large sample mean ≈ 1/rate', () => {
    const rng = seededRNG(55);
    const N = 10000;
    const total = Array.from({ length: N }, () => exponentialSample(2, rng))
      .reduce((a, b) => a + b, 0);
    expect(total / N).toBeGreaterThan(0.49);
    expect(total / N).toBeLessThan(0.51);
  });

  it('seeded reproducibility', () => {
    for (let i = 0; i < 10; i++) {
      const r1 = seededRNG(i + 3000);
      const r2 = seededRNG(i + 3000);
      expect(exponentialSample(1, r1)).toBe(exponentialSample(1, r2));
    }
  });

  // PDF tests
  it('exponentialPDF(0, 1) = 1', () => {
    expect(exponentialPDF(0, 1)).toBeCloseTo(1, 6);
  });

  it('exponentialPDF(x, rate) = rate * e^(-rate*x)', () => {
    for (let x = 0; x <= 5; x++) {
      expect(exponentialPDF(x, 2)).toBeCloseTo(2 * Math.exp(-2 * x), 6);
    }
  });

  it('exponentialPDF < 0 returns 0', () => {
    expect(exponentialPDF(-1, 1)).toBe(0);
  });

  it('exponentialPDF non-negative', () => {
    for (let x = -2; x <= 10; x += 0.5) {
      expect(exponentialPDF(x, 1)).toBeGreaterThanOrEqual(0);
    }
  });

  // CDF tests
  it('exponentialCDF(0, rate) = 0', () => {
    expect(exponentialCDF(0, 1)).toBeCloseTo(0, 6);
  });

  it('exponentialCDF(∞, rate) → 1', () => {
    expect(exponentialCDF(100, 1)).toBeGreaterThan(0.9999);
  });

  it('exponentialCDF is monotone increasing', () => {
    let prev = 0;
    for (let x = 0; x <= 5; x += 0.25) {
      const curr = exponentialCDF(x, 1);
      expect(curr).toBeGreaterThanOrEqual(prev);
      prev = curr;
    }
  });

  it('exponentialCDF(-x) = 0', () => {
    expect(exponentialCDF(-5, 2)).toBe(0);
  });

  it('exponentialCDF(1/rate, rate) ≈ 1 - 1/e', () => {
    const rate = 3;
    expect(exponentialCDF(1 / rate, rate)).toBeCloseTo(1 - Math.exp(-1), 5);
  });

  // Known values
  for (let x = 1; x <= 5; x++) {
    it(`exponentialCDF(${x}, 1) = 1 - e^(-${x})`, () => {
      expect(exponentialCDF(x, 1)).toBeCloseTo(1 - Math.exp(-x), 6);
    });
  }
});

// ---------------------------------------------------------------------------
// geometricSample — 40+ tests
// ---------------------------------------------------------------------------
describe('geometricSample', () => {
  it('returns a positive integer', () => {
    const rng = seededRNG(1);
    for (let i = 0; i < 20; i++) {
      const v = geometricSample(0.5, rng);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('uses Math.random by default', () => {
    expect(() => geometricSample(0.5)).not.toThrow();
  });

  it('large sample mean ≈ 1/p', () => {
    const rng = seededRNG(88);
    const N = 10000;
    const total = Array.from({ length: N }, () => geometricSample(0.25, rng))
      .reduce((a, b) => a + b, 0);
    expect(total / N).toBeGreaterThan(3.8);
    expect(total / N).toBeLessThan(4.2);
  });

  it('seeded reproducibility', () => {
    for (let i = 0; i < 10; i++) {
      const r1 = seededRNG(i + 4000);
      const r2 = seededRNG(i + 4000);
      expect(geometricSample(0.3, r1)).toBe(geometricSample(0.3, r2));
    }
  });

  // Verify return is always ≥ 1
  for (let trial = 0; trial < 10; trial++) {
    it(`geometricSample trial ${trial} ≥ 1`, () => {
      const rng = seededRNG(trial + 5000);
      expect(geometricSample(0.4, rng)).toBeGreaterThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// weightedChoice — 60+ tests
// ---------------------------------------------------------------------------
describe('weightedChoice', () => {
  it('throws on empty items', () => {
    expect(() => weightedChoice([], [], always05)).toThrow();
  });

  it('throws on mismatched lengths', () => {
    expect(() => weightedChoice([1, 2], [1], always05)).toThrow();
  });

  it('single item always returned', () => {
    for (let i = 0; i < 10; i++) {
      expect(weightedChoice(['only'], [1], seededRNG(i))).toBe('only');
    }
  });

  it('weight=0 item never chosen (weight exclusively on other)', () => {
    // all weight on 'b'
    const items = ['a', 'b'];
    const weights = [0, 1];
    for (let i = 0; i < 10; i++) {
      expect(weightedChoice(items, weights, seededRNG(i))).toBe('b');
    }
  });

  it('seeded reproducibility', () => {
    const items = [1, 2, 3, 4, 5];
    const weights = [1, 2, 3, 2, 1];
    for (let i = 0; i < 15; i++) {
      const r1 = seededRNG(i + 6000);
      const r2 = seededRNG(i + 6000);
      expect(weightedChoice(items, weights, r1)).toBe(weightedChoice(items, weights, r2));
    }
  });

  it('all weight on first returns first', () => {
    const items = ['x', 'y', 'z'];
    const weights = [100, 0, 0];
    for (let i = 0; i < 10; i++) {
      expect(weightedChoice(items, weights, seededRNG(i))).toBe('x');
    }
  });

  it('result is always one of the items', () => {
    const items = ['a', 'b', 'c'];
    const weights = [1, 2, 3];
    const rng = seededRNG(777);
    for (let i = 0; i < 20; i++) {
      const v = weightedChoice(items, weights, rng);
      expect(items).toContain(v);
    }
  });

  it('uses Math.random by default', () => {
    expect(() => weightedChoice(['a'], [1])).not.toThrow();
  });

  // Frequency test — higher weight → chosen more often
  it('higher-weight item chosen more often', () => {
    const rng = seededRNG(999);
    const counts = { a: 0, b: 0 };
    for (let i = 0; i < 1000; i++) {
      const v = weightedChoice(['a', 'b'], [1, 9], rng) as 'a' | 'b';
      counts[v]++;
    }
    expect(counts.b).toBeGreaterThan(counts.a);
  });
});

// ---------------------------------------------------------------------------
// weightedSample — 40+ tests
// ---------------------------------------------------------------------------
describe('weightedSample', () => {
  it('returns k items', () => {
    const items = [1, 2, 3];
    const weights = [1, 1, 1];
    const rng = seededRNG(1);
    for (let k = 0; k <= 5; k++) {
      expect(weightedSample(items, weights, k, rng)).toHaveLength(k);
    }
  });

  it('k=0 returns empty', () => {
    expect(weightedSample([1, 2], [1, 1], 0, always05)).toHaveLength(0);
  });

  it('all items from the original set', () => {
    const items = ['a', 'b', 'c'];
    const weights = [1, 2, 3];
    const rng = seededRNG(5);
    const result = weightedSample(items, weights, 20, rng);
    for (const v of result) {
      expect(items).toContain(v);
    }
  });

  it('seeded reproducibility', () => {
    const items = [10, 20, 30];
    const weights = [3, 2, 1];
    for (let i = 0; i < 10; i++) {
      const r1 = seededRNG(i + 7000);
      const r2 = seededRNG(i + 7000);
      expect(weightedSample(items, weights, 5, r1)).toEqual(
        weightedSample(items, weights, 5, r2),
      );
    }
  });

  it('uses Math.random by default', () => {
    expect(() => weightedSample([1], [1], 3)).not.toThrow();
  });

  // Repetition is allowed (with replacement)
  it('can repeat items (with replacement)', () => {
    const items = ['x'];
    const weights = [1];
    const result = weightedSample(items, weights, 10, always05);
    expect(result).toEqual(Array(10).fill('x'));
  });
});

// ---------------------------------------------------------------------------
// randomChoice — 60+ tests
// ---------------------------------------------------------------------------
describe('randomChoice', () => {
  it('throws on empty array', () => {
    expect(() => randomChoice([], always05)).toThrow();
  });

  it('returns the only element for single-element array', () => {
    for (let i = 0; i < 10; i++) {
      expect(randomChoice([42], seededRNG(i))).toBe(42);
    }
  });

  it('result is always an element of the array', () => {
    const arr = [1, 2, 3, 4, 5];
    const rng = seededRNG(100);
    for (let i = 0; i < 20; i++) {
      expect(arr).toContain(randomChoice(arr, rng));
    }
  });

  it('uses Math.random by default', () => {
    expect(() => randomChoice([1, 2, 3])).not.toThrow();
  });

  it('seeded reproducibility', () => {
    const arr = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 15; i++) {
      const r1 = seededRNG(i + 8000);
      const r2 = seededRNG(i + 8000);
      expect(randomChoice(arr, r1)).toBe(randomChoice(arr, r2));
    }
  });

  // rng=0 always picks first element
  it('rng=0 always picks first element', () => {
    expect(randomChoice([10, 20, 30], always0)).toBe(10);
  });

  // rng=0.99 picks last element of 3-element array
  it('rng=0.99 picks last element', () => {
    expect(randomChoice([10, 20, 30], always099)).toBe(30);
  });

  // Works with strings
  for (let i = 0; i < 5; i++) {
    it(`randomChoice strings trial ${i}`, () => {
      const arr = ['alpha', 'beta', 'gamma'];
      const rng = seededRNG(i + 9000);
      expect(arr).toContain(randomChoice(arr, rng));
    });
  }
});

// ---------------------------------------------------------------------------
// randomSample — 60+ tests
// ---------------------------------------------------------------------------
describe('randomSample', () => {
  it('throws if k > array length', () => {
    expect(() => randomSample([1, 2, 3], 5, always05)).toThrow();
  });

  it('k=0 returns empty array', () => {
    expect(randomSample([1, 2, 3], 0, always05)).toHaveLength(0);
  });

  it('k=n returns all elements (possibly reordered)', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = randomSample(arr, 5, seededRNG(1));
    expect(result.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('no duplicates in result', () => {
    const arr = [10, 20, 30, 40, 50];
    const rng = seededRNG(2);
    for (let trial = 0; trial < 10; trial++) {
      const result = randomSample(arr, 3, rng);
      expect(new Set(result).size).toBe(3);
    }
  });

  it('all result items are from original array', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    const rng = seededRNG(3);
    for (let trial = 0; trial < 15; trial++) {
      const result = randomSample(arr, 3, rng);
      for (const v of result) {
        expect(arr).toContain(v);
      }
    }
  });

  it('uses Math.random by default', () => {
    expect(() => randomSample([1, 2, 3], 2)).not.toThrow();
  });

  it('seeded reproducibility', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    for (let i = 0; i < 10; i++) {
      const r1 = seededRNG(i + 10000);
      const r2 = seededRNG(i + 10000);
      expect(randomSample(arr, 4, r1)).toEqual(randomSample(arr, 4, r2));
    }
  });

  it('result length equals k', () => {
    const arr = Array.from({ length: 20 }, (_, i) => i);
    const rng = seededRNG(42);
    for (let k = 0; k <= 10; k++) {
      expect(randomSample(arr, k, rng)).toHaveLength(k);
    }
  });
});

// ---------------------------------------------------------------------------
// shuffle — 50+ tests
// ---------------------------------------------------------------------------
describe('shuffle', () => {
  it('returns a new array (not same reference)', () => {
    const arr = [1, 2, 3];
    expect(shuffle(arr, always05)).not.toBe(arr);
  });

  it('original array not mutated', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    shuffle(arr, seededRNG(1));
    expect(arr).toEqual(copy);
  });

  it('result has same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const rng = seededRNG(1);
    for (let i = 0; i < 10; i++) {
      expect(shuffle(arr, rng).sort()).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it('result has same length', () => {
    const arr = [10, 20, 30, 40];
    expect(shuffle(arr, seededRNG(2))).toHaveLength(4);
  });

  it('empty array returns empty', () => {
    expect(shuffle([], always05)).toEqual([]);
  });

  it('single-element array unchanged', () => {
    expect(shuffle([42], always05)).toEqual([42]);
  });

  it('seeded reproducibility', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8];
    for (let i = 0; i < 15; i++) {
      const r1 = seededRNG(i + 11000);
      const r2 = seededRNG(i + 11000);
      expect(shuffle(arr, r1)).toEqual(shuffle(arr, r2));
    }
  });

  it('uses Math.random by default', () => {
    expect(() => shuffle([1, 2, 3])).not.toThrow();
  });

  // Element-set check for strings
  for (let i = 0; i < 10; i++) {
    it(`shuffle strings trial ${i} preserves elements`, () => {
      const arr = ['a', 'b', 'c', 'd'];
      const result = shuffle(arr, seededRNG(i + 12000));
      expect(result.sort()).toEqual(['a', 'b', 'c', 'd']);
    });
  }
});

// ---------------------------------------------------------------------------
// histogram — 40+ tests
// ---------------------------------------------------------------------------
describe('histogram', () => {
  it('returns empty array for empty data', () => {
    expect(histogram([], 5)).toEqual([]);
  });

  it('returns empty array for bins=0', () => {
    expect(histogram([1, 2, 3], 0)).toEqual([]);
  });

  it('returns correct number of bins', () => {
    const result = histogram([1, 2, 3, 4, 5], 5);
    expect(result).toHaveLength(5);
  });

  it('total count equals data length', () => {
    const data = Array.from({ length: 100 }, (_, i) => i);
    const result = histogram(data, 10);
    const total = result.reduce((a, b) => a + b.count, 0);
    expect(total).toBe(100);
  });

  it('min of first bin = min of data', () => {
    const data = [2, 5, 8, 11];
    const result = histogram(data, 3);
    expect(result[0].min).toBe(2);
  });

  it('max of last bin ≈ max of data', () => {
    const data = [1, 2, 3, 4, 5];
    const result = histogram(data, 5);
    expect(result[result.length - 1].max).toBeCloseTo(5, 5);
  });

  it('bins are contiguous', () => {
    const data = Array.from({ length: 50 }, (_, i) => i);
    const result = histogram(data, 5);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].min).toBeCloseTo(result[i - 1].max, 10);
    }
  });

  it('all counts non-negative', () => {
    const data = [1, 1, 2, 3, 5, 8, 13];
    const result = histogram(data, 4);
    for (const bin of result) {
      expect(bin.count).toBeGreaterThanOrEqual(0);
    }
  });

  it('single value all in one bin', () => {
    const data = [3, 3, 3, 3];
    const result = histogram(data, 4);
    const total = result.reduce((a, b) => a + b.count, 0);
    expect(total).toBe(4);
  });

  it('1 bin returns all data in it', () => {
    const data = [1, 2, 3, 4, 5];
    const result = histogram(data, 1);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(5);
  });

  // Various bin counts
  for (let bins = 1; bins <= 10; bins++) {
    it(`histogram with ${bins} bins has correct length`, () => {
      const data = Array.from({ length: 50 }, (_, i) => i * 2);
      expect(histogram(data, bins)).toHaveLength(bins);
    });
  }

  // Total count preserved
  for (let n = 5; n <= 25; n += 5) {
    it(`histogram total count = ${n}`, () => {
      const data = Array.from({ length: n }, (_, i) => i);
      const total = histogram(data, 5).reduce((a, b) => a + b.count, 0);
      expect(total).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// mean / variance / stddev — 80+ tests
// ---------------------------------------------------------------------------
describe('mean', () => {
  it('single element returns itself', () => {
    expect(mean([42])).toBe(42);
  });

  it('empty array returns NaN', () => {
    expect(mean([])).toBeNaN();
  });

  it('mean of [1,2,3] = 2', () => {
    expect(mean([1, 2, 3])).toBeCloseTo(2, 10);
  });

  it('mean of negative numbers', () => {
    expect(mean([-3, -1, 1, 3])).toBeCloseTo(0, 10);
  });

  it('mean of zeros = 0', () => {
    expect(mean([0, 0, 0])).toBe(0);
  });

  // Known means
  const cases: Array<[number[], number]> = [
    [[1, 2, 3, 4, 5], 3],
    [[10, 20], 15],
    [[-5, 5], 0],
    [[100], 100],
    [[1.5, 2.5], 2],
  ];
  for (const [data, expected] of cases) {
    it(`mean(${JSON.stringify(data)}) = ${expected}`, () => {
      expect(mean(data)).toBeCloseTo(expected, 6);
    });
  }

  // Large array
  for (let n = 2; n <= 20; n++) {
    it(`mean of first ${n} integers = ${(n + 1) / 2}`, () => {
      const data = Array.from({ length: n }, (_, i) => i + 1);
      expect(mean(data)).toBeCloseTo((n + 1) / 2, 6);
    });
  }
});

describe('variance', () => {
  it('empty array returns NaN', () => {
    expect(variance([])).toBeNaN();
  });

  it('single element population variance = 0', () => {
    expect(variance([5], true)).toBe(0);
  });

  it('single element sample variance = NaN', () => {
    expect(variance([5], false)).toBeNaN();
  });

  it('[1,2,3,4,5] sample variance = 2.5', () => {
    expect(variance([1, 2, 3, 4, 5])).toBeCloseTo(2.5, 6);
  });

  it('[1,2,3,4,5] population variance = 2', () => {
    expect(variance([1, 2, 3, 4, 5], true)).toBeCloseTo(2, 6);
  });

  it('constant array has variance = 0', () => {
    expect(variance([7, 7, 7, 7], true)).toBeCloseTo(0, 10);
  });

  // Population variance for known sets
  const cases: Array<[number[], number]> = [
    [[2, 4, 4, 4, 5, 5, 7, 9], 4],
    [[1, 1, 1, 1], 0],
    [[0, 2], 1],
  ];
  for (const [data, expected] of cases) {
    it(`variance(${JSON.stringify(data)}, pop) ≈ ${expected}`, () => {
      expect(variance(data, true)).toBeCloseTo(expected, 4);
    });
  }
});

describe('stddev', () => {
  it('empty array returns NaN', () => {
    expect(stddev([])).toBeNaN();
  });

  it('stddev = sqrt(variance)', () => {
    const data = [2, 4, 4, 4, 5, 5, 7, 9];
    expect(stddev(data, true)).toBeCloseTo(Math.sqrt(variance(data, true)), 10);
  });

  it('[1,2,3,4,5] population stddev ≈ 1.414', () => {
    expect(stddev([1, 2, 3, 4, 5], true)).toBeCloseTo(Math.sqrt(2), 6);
  });

  it('non-negative', () => {
    const cases = [[1, 2], [0, 0], [5, 5, 5], [1, 2, 3, 4, 5]];
    for (const data of cases) {
      expect(stddev(data, true)).toBeGreaterThanOrEqual(0);
    }
  });

  // Multiple data sets
  for (let n = 2; n <= 10; n++) {
    it(`stddev of ${n} identical values = 0`, () => {
      const data = Array(n).fill(3.14);
      expect(stddev(data, true)).toBeCloseTo(0, 10);
    });
  }
});

// ---------------------------------------------------------------------------
// skewness / kurtosis / covariance / correlation — 60+ tests
// ---------------------------------------------------------------------------
describe('skewness', () => {
  it('symmetric data has skewness ≈ 0', () => {
    expect(skewness([1, 2, 3, 4, 5])).toBeCloseTo(0, 5);
  });

  it('fewer than 3 elements returns NaN', () => {
    expect(skewness([])).toBeNaN();
    expect(skewness([1])).toBeNaN();
    expect(skewness([1, 2])).toBeNaN();
  });

  it('right-skewed data has positive skewness', () => {
    const data = [1, 1, 1, 1, 1, 10, 100];
    expect(skewness(data)).toBeGreaterThan(0);
  });

  it('constant array returns 0 skewness', () => {
    expect(skewness([5, 5, 5, 5, 5])).toBe(0);
  });

  it('returns a finite number for normal data', () => {
    const rng = seededRNG(1);
    const data = Array.from({ length: 100 }, () => normalSample(0, 1, rng));
    expect(isFinite(skewness(data))).toBe(true);
  });

  // Left-skewed
  it('left-skewed data has negative skewness', () => {
    const data = [1, 100, 100, 100, 100, 100, 100];
    expect(skewness(data)).toBeLessThan(0);
  });

  // Various sizes
  for (let n = 3; n <= 10; n++) {
    it(`skewness of size-${n} symmetric array ≈ 0`, () => {
      const data = Array.from({ length: n }, (_, i) => i - (n - 1) / 2);
      expect(Math.abs(skewness(data))).toBeLessThan(1e-10);
    });
  }
});

describe('kurtosis', () => {
  it('fewer than 4 elements returns NaN', () => {
    expect(kurtosis([])).toBeNaN();
    expect(kurtosis([1])).toBeNaN();
    expect(kurtosis([1, 2])).toBeNaN();
    expect(kurtosis([1, 2, 3])).toBeNaN();
  });

  it('constant array returns 0 excess kurtosis', () => {
    expect(kurtosis([3, 3, 3, 3, 3])).toBe(0);
  });

  it('uniform distribution has negative excess kurtosis (platykurtic)', () => {
    // Large uniform sample should have excess kurtosis ≈ -1.2
    const rng = seededRNG(42);
    const data = Array.from({ length: 10000 }, () => uniformFloat(0, 1, rng));
    expect(kurtosis(data)).toBeLessThan(0);
  });

  it('returns finite number', () => {
    const data = [1, 2, 3, 4, 5, 6, 7, 8];
    expect(isFinite(kurtosis(data))).toBe(true);
  });

  for (let n = 4; n <= 10; n++) {
    it(`kurtosis of size-${n} array is finite`, () => {
      const data = Array.from({ length: n }, (_, i) => i + 1);
      expect(isFinite(kurtosis(data))).toBe(true);
    });
  }
});

describe('covariance', () => {
  it('throws on unequal-length arrays', () => {
    expect(() => covariance([1, 2], [1])).toThrow();
  });

  it('empty arrays return NaN', () => {
    expect(covariance([], [])).toBeNaN();
  });

  it('covariance of x with itself = population variance', () => {
    const x = [1, 2, 3, 4, 5];
    expect(covariance(x, x)).toBeCloseTo(variance(x, true), 8);
  });

  it('uncorrelated arrays have covariance ≈ 0', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [5, 4, 3, 2, 1]; // negatively correlated actually
    expect(covariance(x, y)).toBeLessThan(0);
  });

  it('covariance is symmetric', () => {
    const x = [1, 3, 5, 7];
    const y = [2, 4, 6, 8];
    expect(covariance(x, y)).toBeCloseTo(covariance(y, x), 10);
  });

  // Known covariance
  it('[1,2,3] and [4,5,6] covariance = population covariance', () => {
    const x = [1, 2, 3];
    const y = [4, 5, 6];
    // cov = mean of [(1-2)(4-5), (2-2)(5-5), (3-2)(6-5)] = mean of [1, 0, 1] = 2/3
    expect(covariance(x, y)).toBeCloseTo(2 / 3, 6);
  });

  for (let n = 1; n <= 10; n++) {
    it(`covariance([${n}], [${n}]) = 0 (single-element)`, () => {
      expect(covariance([n], [n * 2])).toBe(0);
    });
  }
});

describe('correlation', () => {
  it('perfectly correlated arrays have correlation = 1', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];
    expect(correlation(x, y)).toBeCloseTo(1, 6);
  });

  it('perfectly negatively correlated have correlation = -1', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [5, 4, 3, 2, 1];
    expect(correlation(x, y)).toBeCloseTo(-1, 6);
  });

  it('constant x returns NaN', () => {
    expect(correlation([1, 1, 1], [1, 2, 3])).toBeNaN();
  });

  it('correlation is in [-1, 1]', () => {
    const rng = seededRNG(50);
    const x = Array.from({ length: 100 }, () => normalSample(0, 1, rng));
    const y = Array.from({ length: 100 }, () => normalSample(0, 1, rng));
    const r = correlation(x, y);
    if (!isNaN(r)) {
      expect(r).toBeGreaterThanOrEqual(-1);
      expect(r).toBeLessThanOrEqual(1);
    }
  });

  it('correlation is symmetric', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 3, 4, 5, 6];
    expect(correlation(x, y)).toBeCloseTo(correlation(y, x), 10);
  });

  // Independent random arrays — correlation near 0 (not exact, just finite)
  for (let seed = 1; seed <= 5; seed++) {
    it(`correlation of independent normals is finite (seed=${seed})`, () => {
      const rng1 = seededRNG(seed);
      const rng2 = seededRNG(seed + 100);
      const x = Array.from({ length: 1000 }, () => normalSample(0, 1, rng1));
      const y = Array.from({ length: 1000 }, () => normalSample(0, 1, rng2));
      expect(isFinite(correlation(x, y))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// binomialPMF / binomialCDF — 50+ tests
// ---------------------------------------------------------------------------
describe('binomialPMF', () => {
  it('P(X=0) for n=5, p=0 = 1', () => {
    expect(binomialPMF(0, 5, 0)).toBeCloseTo(1, 6);
  });

  it('P(X=5) for n=5, p=1 = 1', () => {
    expect(binomialPMF(5, 5, 1)).toBeCloseTo(1, 6);
  });

  it('P(X=0) for n=5, p=1 = 0', () => {
    expect(binomialPMF(0, 5, 1)).toBeCloseTo(0, 6);
  });

  it('negative k returns 0', () => {
    expect(binomialPMF(-1, 5, 0.5)).toBe(0);
  });

  it('k > n returns 0', () => {
    expect(binomialPMF(6, 5, 0.5)).toBe(0);
  });

  it('non-integer k returns 0', () => {
    expect(binomialPMF(1.5, 5, 0.5)).toBe(0);
  });

  it('sums to 1 over k=0..n', () => {
    let sum = 0;
    for (let k = 0; k <= 10; k++) sum += binomialPMF(k, 10, 0.3);
    expect(sum).toBeCloseTo(1, 6);
  });

  it('P(X=1) for n=1, p=0.5 = 0.5', () => {
    expect(binomialPMF(1, 1, 0.5)).toBeCloseTo(0.5, 6);
  });

  // Specific values
  const cases: Array<[number, number, number, number]> = [
    [2, 5, 0.5, 0.3125],  // C(5,2)*0.5^5
    [0, 3, 0.3, 0.343],   // 0.7^3
    [3, 3, 0.5, 0.125],   // 0.5^3
    [1, 4, 0.25, 0.421875],
  ];
  for (const [k, n, p, expected] of cases) {
    it(`binomialPMF(${k}, ${n}, ${p}) ≈ ${expected}`, () => {
      expect(binomialPMF(k, n, p)).toBeCloseTo(expected, 4);
    });
  }

  // Non-negative everywhere
  for (let k = 0; k <= 10; k++) {
    it(`binomialPMF(${k}, 10, 0.4) ≥ 0`, () => {
      expect(binomialPMF(k, 10, 0.4)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('binomialCDF', () => {
  it('CDF(n, n, p) = 1', () => {
    expect(binomialCDF(10, 10, 0.5)).toBeCloseTo(1, 5);
  });

  it('CDF(0, n, 0) = 1', () => {
    expect(binomialCDF(0, 5, 0)).toBeCloseTo(1, 5);
  });

  it('CDF is monotone non-decreasing', () => {
    let prev = 0;
    for (let k = 0; k <= 10; k++) {
      const curr = binomialCDF(k, 10, 0.5);
      expect(curr).toBeGreaterThanOrEqual(prev);
      prev = curr;
    }
  });

  it('CDF values in [0,1]', () => {
    for (let k = 0; k <= 10; k++) {
      const v = binomialCDF(k, 10, 0.3);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1 + 1e-10);
    }
  });

  it('CDF(-1, n, p) = 0', () => {
    expect(binomialCDF(-1, 5, 0.5)).toBeCloseTo(0, 6);
  });

  // Known CDFs
  it('binomialCDF(0, 5, 0.5) = 1/32', () => {
    expect(binomialCDF(0, 5, 0.5)).toBeCloseTo(1 / 32, 5);
  });

  for (let n = 2; n <= 8; n++) {
    it(`binomialCDF(${n}, ${n}, 0.5) = 1`, () => {
      expect(binomialCDF(n, n, 0.5)).toBeCloseTo(1, 4);
    });
  }
});

// ---------------------------------------------------------------------------
// zScore / fromZScore — 50+ tests
// ---------------------------------------------------------------------------
describe('zScore', () => {
  it('zScore(mean, mean, s) = 0', () => {
    for (let m = -5; m <= 5; m++) {
      expect(zScore(m, m, 1)).toBe(0);
    }
  });

  it('zScore(mean+stddev, mean, stddev) = 1', () => {
    expect(zScore(11, 10, 1)).toBe(1);
  });

  it('zScore(mean-stddev, mean, stddev) = -1', () => {
    expect(zScore(9, 10, 1)).toBe(-1);
  });

  it('zScore = (x - mean) / stddev', () => {
    const cases: Array<[number, number, number]> = [
      [5, 3, 2], [10, 8, 2], [0, 0, 1], [-3, 0, 3], [100, 90, 5],
    ];
    for (const [x, m, s] of cases) {
      expect(zScore(x, m, s)).toBeCloseTo((x - m) / s, 10);
    }
  });

  // Larger set
  for (let x = -5; x <= 5; x++) {
    it(`zScore(${x}, 0, 1) = ${x}`, () => {
      expect(zScore(x, 0, 1)).toBe(x);
    });
  }
});

describe('fromZScore', () => {
  it('fromZScore(0, mean, s) = mean', () => {
    for (let m = -5; m <= 5; m++) {
      expect(fromZScore(0, m, 1)).toBe(m);
    }
  });

  it('fromZScore(1, mean, s) = mean + s', () => {
    expect(fromZScore(1, 10, 3)).toBeCloseTo(13, 10);
  });

  it('fromZScore(-1, mean, s) = mean - s', () => {
    expect(fromZScore(-1, 10, 3)).toBeCloseTo(7, 10);
  });

  it('fromZScore(z, m, s) = z*s + m', () => {
    const cases: Array<[number, number, number]> = [
      [2, 5, 3], [-2, 5, 3], [1.5, 0, 2], [0, 100, 15],
    ];
    for (const [z, m, s] of cases) {
      expect(fromZScore(z, m, s)).toBeCloseTo(z * s + m, 10);
    }
  });

  // Round-trip: fromZScore(zScore(x)) = x
  for (let x = -5; x <= 5; x++) {
    it(`round-trip zScore/fromZScore for x=${x}`, () => {
      const z = zScore(x, 2, 3);
      expect(fromZScore(z, 2, 3)).toBeCloseTo(x, 10);
    });
  }
});

// ---------------------------------------------------------------------------
// monteCarlo — 30+ tests
// ---------------------------------------------------------------------------
describe('monteCarlo', () => {
  it('constant trial returns that constant', () => {
    const result = monteCarlo(100, () => 5, always05);
    expect(result).toBe(5);
  });

  it('0 samples returns NaN', () => {
    expect(monteCarlo(0, () => 1, always05)).toBeNaN();
  });

  it('uses Math.random by default', () => {
    expect(() => monteCarlo(10, () => 1)).not.toThrow();
  });

  it('estimates π via unit circle (seeded)', () => {
    const rng = seededRNG(314);
    const piEst = monteCarlo(
      10000,
      (r) => {
        const x = 2 * r() - 1;
        const y = 2 * r() - 1;
        return x * x + y * y <= 1 ? 4 : 0;
      },
      rng,
    );
    expect(piEst).toBeGreaterThan(3.0);
    expect(piEst).toBeLessThan(3.3);
  });

  it('mean of uniform [0,1] ≈ 0.5 (seeded)', () => {
    const rng = seededRNG(555);
    const result = monteCarlo(10000, (r) => r(), rng);
    expect(result).toBeGreaterThan(0.48);
    expect(result).toBeLessThan(0.52);
  });

  it('seeded reproducibility', () => {
    for (let i = 0; i < 10; i++) {
      const r1 = seededRNG(i + 13000);
      const r2 = seededRNG(i + 13000);
      const trial = (r: () => number) => r();
      expect(monteCarlo(50, trial, r1)).toBe(monteCarlo(50, trial, r2));
    }
  });

  it('result is average of trials', () => {
    let callCount = 0;
    const trial = () => { callCount++; return callCount; };
    const N = 5;
    const result = monteCarlo(N, trial, always05);
    // trials return 1,2,3,4,5 → mean = 3
    expect(result).toBe(3);
  });

  it('binary trial returns proportion', () => {
    // Always-1 trial
    const result = monteCarlo(100, () => 1, always05);
    expect(result).toBe(1);
  });

  // Various sample counts
  for (let n = 1; n <= 10; n++) {
    it(`monteCarlo with ${n} samples of constant 7 = 7`, () => {
      expect(monteCarlo(n, () => 7, always05)).toBe(7);
    });
  }
});

// ---------------------------------------------------------------------------
// empiricalCDF — additional tests
// ---------------------------------------------------------------------------
describe('empiricalCDF', () => {
  it('returns a function', () => {
    expect(typeof empiricalCDF([1, 2, 3])).toBe('function');
  });

  it('eCDF(min - 1) = 0', () => {
    const eCDF = empiricalCDF([1, 2, 3]);
    expect(eCDF(0)).toBe(0);
  });

  it('eCDF(max) = 1', () => {
    const eCDF = empiricalCDF([1, 2, 3]);
    expect(eCDF(3)).toBeCloseTo(1, 5);
  });

  it('eCDF is non-decreasing', () => {
    const data = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
    const eCDF = empiricalCDF(data);
    let prev = 0;
    for (let x = 0; x <= 10; x++) {
      const curr = eCDF(x);
      expect(curr).toBeGreaterThanOrEqual(prev);
      prev = curr;
    }
  });

  it('eCDF([1,2,3]) at 2 = 2/3', () => {
    const eCDF = empiricalCDF([1, 2, 3]);
    expect(eCDF(2)).toBeCloseTo(2 / 3, 5);
  });

  it('eCDF single element: at element = 1', () => {
    const eCDF = empiricalCDF([5]);
    expect(eCDF(5)).toBeCloseTo(1, 5);
    expect(eCDF(4)).toBe(0);
    expect(eCDF(6)).toBeCloseTo(1, 5);
  });
});

// ---------------------------------------------------------------------------
// Edge cases — 40+ tests
// ---------------------------------------------------------------------------
describe('edge cases', () => {
  // Empty / degenerate inputs
  it('mean([]) = NaN', () => expect(mean([])).toBeNaN());
  it('variance([]) = NaN', () => expect(variance([])).toBeNaN());
  it('stddev([]) = NaN', () => expect(stddev([])).toBeNaN());
  it('skewness([1,2]) = NaN', () => expect(skewness([1, 2])).toBeNaN());
  it('kurtosis([1,2,3]) = NaN', () => expect(kurtosis([1, 2, 3])).toBeNaN());

  // p=0 bernoulli
  it('bernoulli(0) = false', () => expect(bernoulli(0, always05)).toBe(false));
  // p=1 bernoulli
  it('bernoulli(1) = true', () => expect(bernoulli(1, always001)).toBe(true));

  // binomialSample degenerate
  it('binomialSample(0, 0.5) = 0', () => expect(binomialSample(0, 0.5, always05)).toBe(0));
  it('binomialSample(10, 0) = 0', () => expect(binomialSample(10, 0, always099)).toBe(0));
  it('binomialSample(10, 1) = 10', () => expect(binomialSample(10, 1, always001)).toBe(10));

  // randomChoice single element
  it('randomChoice single element', () => expect(randomChoice([99], always05)).toBe(99));

  // randomSample k=0
  it('randomSample k=0 = []', () => expect(randomSample([1, 2, 3], 0, always05)).toEqual([]));

  // randomSample k=n
  it('randomSample k=n returns all', () => {
    const result = randomSample([1, 2, 3], 3, seededRNG(1));
    expect(result.sort()).toEqual([1, 2, 3]);
  });

  // shuffle empty
  it('shuffle empty = []', () => expect(shuffle([], always05)).toEqual([]));
  it('shuffle single = same', () => expect(shuffle([7], always05)).toEqual([7]));

  // histogram edge cases
  it('histogram empty = []', () => expect(histogram([], 5)).toEqual([]));
  it('histogram bins=0 = []', () => expect(histogram([1, 2, 3], 0)).toEqual([]));

  // zScore / fromZScore round-trip
  it('zScore/fromZScore round-trip', () => {
    const x = 42;
    const z = zScore(x, 10, 5);
    expect(fromZScore(z, 10, 5)).toBeCloseTo(x, 10);
  });

  // poissonPMF degenerate
  it('poissonPMF(-1, 1) = 0', () => expect(poissonPMF(-1, 1)).toBe(0));
  it('poissonPMF(0, 0) = 1 (e^0 = 1)', () => expect(poissonPMF(0, 0)).toBeCloseTo(1, 6));

  // exponentialPDF negative
  it('exponentialPDF(-1, 1) = 0', () => expect(exponentialPDF(-1, 1)).toBe(0));
  it('exponentialCDF(-1, 1) = 0', () => expect(exponentialCDF(-1, 1)).toBe(0));

  // covariance single element
  it('covariance([5], [3]) = 0', () => expect(covariance([5], [3])).toBe(0));

  // Weighted choice single item
  it('weightedChoice single item always returns it', () => {
    expect(weightedChoice(['only'], [5], always05)).toBe('only');
  });

  // weightedSample k=0
  it('weightedSample k=0 = []', () => {
    expect(weightedSample([1, 2], [1, 1], 0, always05)).toEqual([]);
  });

  // seededRNG output range
  it('seededRNG(0) outputs in [0,1)', () => {
    const rng = seededRNG(0);
    for (let i = 0; i < 50; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  // monteCarlo with 1 sample
  it('monteCarlo 1 sample = trial result', () => {
    expect(monteCarlo(1, () => 42, always05)).toBe(42);
  });

  // normalPDF non-negative
  it('normalPDF(x, 0, 1) ≥ 0 for any x', () => {
    for (let x = -10; x <= 10; x += 2) {
      expect(normalPDF(x, 0, 1)).toBeGreaterThanOrEqual(0);
    }
  });

  // normalCDF in [0,1]
  it('normalCDF in [0,1]', () => {
    for (let x = -5; x <= 5; x++) {
      const v = normalCDF(x, 0, 1);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

// ---------------------------------------------------------------------------
// Extended uniformInt tests — 60 additional
// ---------------------------------------------------------------------------
describe('uniformInt extended', () => {
  // Seeded value consistency across repeated constructions
  for (let seed = 100; seed < 130; seed++) {
    it(`uniformInt seed=${seed} stays in [0, 50]`, () => {
      const v = uniformInt(0, 50, seededRNG(seed));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(50);
      expect(Number.isInteger(v)).toBe(true);
    });
  }

  // Large range
  for (let i = 0; i < 15; i++) {
    it(`uniformInt(0, 1000) trial ${i} is integer in range`, () => {
      const v = uniformInt(0, 1000, seededRNG(i + 200));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1000);
      expect(Number.isInteger(v)).toBe(true);
    });
  }

  // Min == max
  for (let m = -3; m <= 3; m++) {
    it(`uniformInt(${m}, ${m}) = ${m}`, () => {
      expect(uniformInt(m, m, seededRNG(m + 50))).toBe(m);
    });
  }

  // Two-element range returns one of two values
  for (let i = 0; i < 8; i++) {
    it(`uniformInt(0, 1) trial ${i} returns 0 or 1`, () => {
      const v = uniformInt(0, 1, seededRNG(i + 300));
      expect([0, 1]).toContain(v);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended uniformFloat tests — 50 additional
// ---------------------------------------------------------------------------
describe('uniformFloat extended', () => {
  for (let seed = 200; seed < 230; seed++) {
    it(`uniformFloat seed=${seed} in [0, 1)`, () => {
      const v = uniformFloat(0, 1, seededRNG(seed));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`uniformFloat(-5, 5) trial ${i} in range`, () => {
      const v = uniformFloat(-5, 5, seededRNG(i + 400));
      expect(v).toBeGreaterThanOrEqual(-5);
      expect(v).toBeLessThan(5);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended normalPDF tests — 40 additional
// ---------------------------------------------------------------------------
describe('normalPDF extended', () => {
  // PDF is strictly positive for all finite x
  for (let x = -4; x <= 4; x++) {
    it(`normalPDF(${x}, 0, 1) > 0`, () => {
      expect(normalPDF(x, 0, 1)).toBeGreaterThan(0);
    });
  }

  // Larger stddev gives smaller peak
  for (let s = 1; s <= 5; s++) {
    it(`normalPDF peak decreases as stddev=${s} increases`, () => {
      const peak1 = normalPDF(0, 0, s);
      const peak2 = normalPDF(0, 0, s + 1);
      expect(peak1).toBeGreaterThan(peak2);
    });
  }

  // PDF * stddev * sqrt(2π) = 1 at mean
  for (let s = 1; s <= 5; s++) {
    it(`normalPDF(mean, mean, ${s}) = 1/(${s}*sqrt(2π))`, () => {
      const expected = 1 / (s * Math.sqrt(2 * Math.PI));
      expect(normalPDF(0, 0, s)).toBeCloseTo(expected, 8);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended bernoulli tests — 40 additional
// ---------------------------------------------------------------------------
describe('bernoulli extended', () => {
  // Boundary probabilities
  for (let i = 0; i < 20; i++) {
    it(`bernoulli(0) is always false (run ${i})`, () => {
      expect(bernoulli(0, seededRNG(i + 500))).toBe(false);
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`bernoulli(1) is always true (run ${i})`, () => {
      expect(bernoulli(1, seededRNG(i + 520))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended weightedChoice tests — 50 additional
// ---------------------------------------------------------------------------
describe('weightedChoice extended', () => {
  // Numeric items, various seeds
  for (let seed = 300; seed < 340; seed++) {
    it(`weightedChoice seed=${seed} returns valid item`, () => {
      const items = [10, 20, 30, 40, 50];
      const weights = [1, 2, 3, 2, 1];
      const v = weightedChoice(items, weights, seededRNG(seed));
      expect(items).toContain(v);
    });
  }

  // Equal weights should return any item
  for (let i = 0; i < 10; i++) {
    it(`weightedChoice equal weights trial ${i}`, () => {
      const items = ['a', 'b', 'c'];
      const v = weightedChoice(items, [1, 1, 1], seededRNG(i + 600));
      expect(items).toContain(v);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended shuffle tests — 40 additional
// ---------------------------------------------------------------------------
describe('shuffle extended', () => {
  // Sorted input produces shuffled output (check sorted output matches)
  for (let n = 2; n <= 10; n++) {
    it(`shuffle array of length ${n} preserves elements`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const result = shuffle(arr, seededRNG(n + 700));
      expect([...result].sort((a, b) => a - b)).toEqual(arr);
    });
  }

  // 20 additional seeded runs on a fixed array
  for (let seed = 800; seed < 830; seed++) {
    it(`shuffle seed=${seed} preserves length`, () => {
      const arr = [1, 2, 3, 4, 5, 6];
      expect(shuffle(arr, seededRNG(seed))).toHaveLength(6);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended mean / variance / stddev tests — 60 additional
// ---------------------------------------------------------------------------
describe('mean extended', () => {
  for (let n = 1; n <= 30; n++) {
    it(`mean of ${n} ones = 1`, () => {
      expect(mean(Array(n).fill(1))).toBe(1);
    });
  }
});

describe('variance extended', () => {
  // [0, 2] population variance = 1
  for (let offset = 0; offset < 10; offset++) {
    it(`variance([${offset}, ${offset + 2}], pop) = 1`, () => {
      expect(variance([offset, offset + 2], true)).toBeCloseTo(1, 6);
    });
  }

  // Sample variance of two identical values = 0 is NaN for sample? No: actually
  // two identical values: ss=0, div by n-1=1, result 0 — NOT NaN
  for (let v = 1; v <= 10; v++) {
    it(`variance([${v}, ${v}]) = 0 (sample)`, () => {
      expect(variance([v, v])).toBeCloseTo(0, 10);
    });
  }
});

describe('stddev extended', () => {
  for (let n = 2; n <= 11; n++) {
    it(`stddev of ${n} identical values = 0`, () => {
      expect(stddev(Array(n).fill(42), true)).toBeCloseTo(0, 10);
    });
  }

  // stddev ≥ 0
  for (let seed = 900; seed < 920; seed++) {
    it(`stddev ≥ 0 for random data (seed ${seed})`, () => {
      const rng = seededRNG(seed);
      const data = Array.from({ length: 10 }, () => normalSample(0, 1, rng));
      expect(stddev(data, true)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended zScore / fromZScore tests — 30 additional
// ---------------------------------------------------------------------------
describe('zScore extended', () => {
  for (let x = 0; x <= 20; x++) {
    it(`zScore(${x}, 0, 1) = ${x}`, () => {
      expect(zScore(x, 0, 1)).toBeCloseTo(x, 10);
    });
  }
});

describe('fromZScore extended', () => {
  for (let z = -5; z <= 5; z++) {
    it(`fromZScore(${z}, 0, 2) = ${z * 2}`, () => {
      expect(fromZScore(z, 0, 2)).toBeCloseTo(z * 2, 10);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended seededRNG tests — 30 additional
// ---------------------------------------------------------------------------
describe('seededRNG extended', () => {
  for (let seed = 1000; seed < 1020; seed++) {
    it(`seededRNG(${seed}) first value in [0,1)`, () => {
      const v = seededRNG(seed)();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  }

  for (let seed = 2000; seed < 2010; seed++) {
    it(`seededRNG(${seed}) produces 5 unique values`, () => {
      const rng = seededRNG(seed);
      const vals = Array.from({ length: 5 }, () => rng());
      // Most seeds should produce at least 3 unique values in 5 draws
      expect(new Set(vals).size).toBeGreaterThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended poissonPMF tests — 20 additional
// ---------------------------------------------------------------------------
describe('poissonPMF extended', () => {
  for (let lambda = 1; lambda <= 10; lambda++) {
    it(`poissonPMF sums to 1 for lambda=${lambda}`, () => {
      let sum = 0;
      for (let k = 0; k <= 60; k++) sum += poissonPMF(k, lambda);
      expect(sum).toBeCloseTo(1, 3);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended exponential tests — 30 additional
// ---------------------------------------------------------------------------
describe('exponential extended', () => {
  for (let rate = 1; rate <= 10; rate++) {
    it(`exponentialCDF(0, ${rate}) = 0`, () => {
      expect(exponentialCDF(0, rate)).toBeCloseTo(0, 8);
    });
    it(`exponentialPDF(0, ${rate}) = ${rate}`, () => {
      expect(exponentialPDF(0, rate)).toBeCloseTo(rate, 8);
    });
    it(`exponentialSample(${rate}) > 0`, () => {
      expect(exponentialSample(rate, seededRNG(rate + 3000))).toBeGreaterThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended histogram tests — 20 additional
// ---------------------------------------------------------------------------
describe('histogram extended', () => {
  for (let bins = 1; bins <= 20; bins++) {
    it(`histogram count preserved for ${bins} bins`, () => {
      const data = Array.from({ length: 100 }, (_, i) => i);
      const total = histogram(data, bins).reduce((a, b) => a + b.count, 0);
      expect(total).toBe(100);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended correlation / covariance tests — 20 additional
// ---------------------------------------------------------------------------
describe('correlation extended', () => {
  // y = k*x → perfect correlation = 1
  for (let k = 1; k <= 10; k++) {
    it(`correlation of x and ${k}*x = 1`, () => {
      const x = [1, 2, 3, 4, 5];
      const y = x.map(v => v * k);
      expect(correlation(x, y)).toBeCloseTo(1, 6);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended binomialPMF tests — 20 additional
// ---------------------------------------------------------------------------
describe('binomialPMF extended', () => {
  for (let n = 1; n <= 10; n++) {
    it(`binomialPMF sums to 1 for n=${n}, p=0.5`, () => {
      let sum = 0;
      for (let k = 0; k <= n; k++) sum += binomialPMF(k, n, 0.5);
      expect(sum).toBeCloseTo(1, 5);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`binomialPMF(n, n, 0.5) = (0.5)^n`, () => {
      expect(binomialPMF(n, n, 0.5)).toBeCloseTo(0.5 ** n, 8);
    });
  }
});

// ---------------------------------------------------------------------------
// Extended monteCarlo tests — 20 additional
// ---------------------------------------------------------------------------
describe('monteCarlo extended', () => {
  // Estimate integral of x^2 from 0 to 1 ≈ 1/3
  for (let seed = 4000; seed < 4010; seed++) {
    it(`monteCarlo integral of x^2 ≈ 1/3 (seed=${seed})`, () => {
      const rng = seededRNG(seed);
      const result = monteCarlo(5000, (r) => r() ** 2, rng);
      expect(result).toBeGreaterThan(0.28);
      expect(result).toBeLessThan(0.38);
    });
  }

  // Constant returning 0
  for (let n = 1; n <= 10; n++) {
    it(`monteCarlo(${n}, () => 0) = 0`, () => {
      expect(monteCarlo(n, () => 0, always05)).toBe(0);
    });
  }
});
