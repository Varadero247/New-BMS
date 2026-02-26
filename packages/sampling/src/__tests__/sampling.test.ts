// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  SeededRandom,
  ReservoirSampler,
  WeightedSampler,
  AliasMethod,
  reservoirSample,
  weightedSample,
  shuffleArray,
  sampleWithoutReplacement,
  systematicSample,
  stratifiedSample,
  bootstrapSample,
  poissonDiskSampling,
  latinHypercubeSample,
} from '../sampling';

// ---------------------------------------------------------------------------
// 1. reservoirSample — size (100 tests)
// ---------------------------------------------------------------------------
describe('reservoirSample size', () => {
  for (let i = 0; i < 100; i++) {
    const n = 5 + i;          // population size 5..104
    const k = 1 + (i % n);    // k in [1, n]
    it(`n=${n} k=${k} => length min(k,n)`, () => {
      const pop = Array.from({ length: n }, (_, idx) => idx);
      const result = reservoirSample(pop, k, i);
      expect(result.length).toBe(Math.min(k, n));
    });
  }
});

// ---------------------------------------------------------------------------
// 2. reservoirSample uniqueness (100 tests)
// ---------------------------------------------------------------------------
describe('reservoirSample uniqueness', () => {
  for (let i = 0; i < 100; i++) {
    const n = 10 + i;
    const k = 1 + (i % 9) + 1; // k in [2, 10]
    it(`n=${n} k=${k} seed=${i} — no duplicates`, () => {
      const pop = Array.from({ length: n }, (_, idx) => idx * 3);
      const result = reservoirSample(pop, k, i + 200);
      const unique = new Set(result);
      expect(unique.size).toBe(result.length);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. reservoirSample elements valid (100 tests)
// ---------------------------------------------------------------------------
describe('reservoirSample elements valid', () => {
  for (let i = 0; i < 100; i++) {
    const n = 8 + i;
    const k = 3;
    it(`n=${n} k=${k} seed=${i} — all from population`, () => {
      const pop = Array.from({ length: n }, (_, idx) => `item-${idx}`);
      const popSet = new Set(pop);
      const result = reservoirSample(pop, k, i + 400);
      for (const el of result) {
        expect(popSet.has(el)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 4. shuffleArray (100 tests)
// ---------------------------------------------------------------------------
describe('shuffleArray', () => {
  for (let i = 0; i < 100; i++) {
    const size = 5 + (i % 15);
    it(`size=${size} seed=${i} — same elements`, () => {
      const original = Array.from({ length: size }, (_, idx) => idx * 7);
      const shuffled = shuffleArray(original, i + 600);
      expect(shuffled.length).toBe(original.length);
      expect([...shuffled].sort((a, b) => a - b)).toEqual(
        [...original].sort((a, b) => a - b)
      );
    });
  }
});

// ---------------------------------------------------------------------------
// 5. sampleWithoutReplacement (100 tests)
// ---------------------------------------------------------------------------
describe('sampleWithoutReplacement', () => {
  for (let i = 0; i < 100; i++) {
    const n = 10 + (i % 20);
    const k = 1 + (i % Math.min(n, 9));
    it(`n=${n} k=${k} seed=${i} — size, no dups, from population`, () => {
      const pop = Array.from({ length: n }, (_, idx) => idx + 100);
      const result = sampleWithoutReplacement(pop, k, i + 800);
      expect(result.length).toBe(k);
      const unique = new Set(result);
      expect(unique.size).toBe(k);
      for (const el of result) {
        expect(pop).toContain(el);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 6. weightedSample returns element from items (50 tests)
// ---------------------------------------------------------------------------
describe('weightedSample', () => {
  const items = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
  const weights = [1, 2, 3, 2, 1];
  for (let i = 0; i < 50; i++) {
    it(`seed=${i} — returns valid item`, () => {
      const result = weightedSample(items, weights, i + 1000);
      expect(items).toContain(result);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. WeightedSampler.sample (50 tests)
// ---------------------------------------------------------------------------
describe('WeightedSampler.sample', () => {
  const items = [10, 20, 30, 40, 50];
  const weights = [5, 4, 3, 2, 1];
  for (let i = 0; i < 50; i++) {
    it(`seed=${i} — returns valid item`, () => {
      const sampler = new WeightedSampler(items, weights, i + 1100);
      const result = sampler.sample();
      expect(items).toContain(result);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. AliasMethod.sample (50 tests)
// ---------------------------------------------------------------------------
describe('AliasMethod.sample', () => {
  const items = ['a', 'b', 'c', 'd'];
  const weights = [1, 3, 2, 4];
  for (let i = 0; i < 50; i++) {
    it(`seed=${i} — returns item from population`, () => {
      const alias = new AliasMethod(items, weights, i + 1200);
      const result = alias.sample();
      expect(items).toContain(result);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. AliasMethod.sampleN — correct length (50 tests)
// ---------------------------------------------------------------------------
describe('AliasMethod.sampleN', () => {
  const items = [100, 200, 300, 400, 500];
  const weights = [2, 2, 2, 2, 2];
  for (let i = 0; i < 50; i++) {
    const n = 1 + (i % 20);
    it(`n=${n} seed=${i} — length=${n}`, () => {
      const alias = new AliasMethod(items, weights, i + 1300);
      const result = alias.sampleN(n);
      expect(result.length).toBe(n);
      for (const el of result) {
        expect(items).toContain(el);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 10. systematicSample — correct size and from population (100 tests)
// ---------------------------------------------------------------------------
describe('systematicSample', () => {
  for (let i = 0; i < 100; i++) {
    const n = 10 + i;
    const k = 1 + (i % 9);
    it(`n=${n} k=${k} — size and validity`, () => {
      const pop = Array.from({ length: n }, (_, idx) => idx * 2);
      const result = systematicSample(pop, k);
      expect(result.length).toBe(k);
      for (const el of result) {
        expect(pop).toContain(el);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 11. bootstrapSample — same size as population (100 tests)
// ---------------------------------------------------------------------------
describe('bootstrapSample', () => {
  for (let i = 0; i < 100; i++) {
    const n = 5 + (i % 20);
    it(`n=${n} seed=${i} — length=${n} and elements from pop`, () => {
      const pop = Array.from({ length: n }, (_, idx) => idx * 5 + 1);
      const result = bootstrapSample(pop, undefined, i + 1500);
      expect(result.length).toBe(n);
      for (const el of result) {
        expect(pop).toContain(el);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 12. SeededRandom determinism (100 tests)
// ---------------------------------------------------------------------------
describe('SeededRandom determinism', () => {
  for (let i = 0; i < 100; i++) {
    const seed = 42 + i * 7;
    it(`seed=${seed} — same sequence on two instances`, () => {
      const rng1 = new SeededRandom(seed);
      const rng2 = new SeededRandom(seed);
      for (let j = 0; j < 10; j++) {
        expect(rng1.next()).toBe(rng2.next());
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 13. SeededRandom range (50 tests)
// ---------------------------------------------------------------------------
describe('SeededRandom range', () => {
  for (let i = 0; i < 50; i++) {
    const seed = 99 + i * 13;
    const max = 2 + (i % 50);
    it(`seed=${seed} max=${max} — next in [0,1), nextInt in [0,${max})`, () => {
      const rng = new SeededRandom(seed);
      for (let j = 0; j < 20; j++) {
        const v = rng.next();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
      const rng2 = new SeededRandom(seed);
      for (let j = 0; j < 20; j++) {
        const v = rng2.nextInt(max);
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(max);
        expect(Number.isInteger(v)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 14. latinHypercubeSample — correct dimensions (50 tests)
// ---------------------------------------------------------------------------
describe('latinHypercubeSample', () => {
  for (let i = 0; i < 50; i++) {
    const dims = 1 + (i % 5);
    const n = 5 + (i % 15);
    it(`dims=${dims} n=${n} seed=${i} — shape and [0,1) values`, () => {
      const result = latinHypercubeSample(dims, n, i + 2000);
      expect(result.length).toBe(n);
      for (const point of result) {
        expect(point.length).toBe(dims);
        for (const v of point) {
          expect(v).toBeGreaterThanOrEqual(0);
          expect(v).toBeLessThan(1);
        }
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 15. stratifiedSample (50 tests)
// ---------------------------------------------------------------------------
describe('stratifiedSample', () => {
  for (let i = 0; i < 50; i++) {
    const numStrata = 2 + (i % 4);
    const stratumSize = 5 + (i % 10);
    const samplesPerStratum = 1 + (i % 4);
    it(`strata=${numStrata} stratumSize=${stratumSize} sps=${samplesPerStratum} seed=${i}`, () => {
      const strata = Array.from({ length: numStrata }, (_, s) =>
        Array.from({ length: stratumSize }, (_, j) => s * 100 + j)
      );
      const result = stratifiedSample(strata, samplesPerStratum, i + 2100);
      expect(result.length).toBe(numStrata * samplesPerStratum);
      // All elements should come from valid stratum items
      const allItems = new Set(strata.flat());
      for (const el of result) {
        expect(allItems.has(el)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 16. ReservoirSampler class (50 tests)
// ---------------------------------------------------------------------------
describe('ReservoirSampler class', () => {
  for (let i = 0; i < 50; i++) {
    const k = 3 + (i % 7);
    const total = 20 + i;
    it(`k=${k} total=${total} seed=${i} — size tracking and getSample`, () => {
      const sampler = new ReservoirSampler<number>(k, i + 2200);
      for (let j = 0; j < total; j++) {
        sampler.add(j * 2);
        expect(sampler.size).toBe(j + 1);
      }
      const sample = sampler.getSample();
      expect(sample.length).toBe(Math.min(k, total));
    });
  }
});

// ---------------------------------------------------------------------------
// 17. ReservoirSampler.clear (25 tests)
// ---------------------------------------------------------------------------
describe('ReservoirSampler.clear', () => {
  for (let i = 0; i < 25; i++) {
    it(`clear test #${i}`, () => {
      const sampler = new ReservoirSampler<string>(5, i + 2300);
      for (let j = 0; j < 15; j++) sampler.add(`item-${j}`);
      expect(sampler.size).toBe(15);
      sampler.clear();
      expect(sampler.size).toBe(0);
      expect(sampler.getSample()).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// 18. WeightedSampler.sampleN (25 tests)
// ---------------------------------------------------------------------------
describe('WeightedSampler.sampleN', () => {
  for (let i = 0; i < 25; i++) {
    const n = 5 + (i % 15);
    it(`sampleN(${n}) seed=${i} — length and validity`, () => {
      const items = ['x', 'y', 'z', 'w'];
      const weights = [1, 2, 3, 4];
      const sampler = new WeightedSampler(items, weights, i + 2400);
      const result = sampler.sampleN(n);
      expect(result.length).toBe(n);
      for (const el of result) {
        expect(items).toContain(el);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 19. WeightedSampler.sampleWithoutReplacement (25 tests)
// ---------------------------------------------------------------------------
describe('WeightedSampler.sampleWithoutReplacement', () => {
  for (let i = 0; i < 25; i++) {
    const n = 2 + (i % 4);
    it(`sampleWithoutReplacement(${n}) seed=${i} — no dups`, () => {
      const items = ['p', 'q', 'r', 's', 't'];
      const weights = [1, 2, 3, 2, 1];
      const sampler = new WeightedSampler(items, weights, i + 2500);
      const result = sampler.sampleWithoutReplacement(n);
      expect(result.length).toBe(n);
      const unique = new Set(result);
      expect(unique.size).toBe(n);
      for (const el of result) {
        expect(items).toContain(el);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 20. reservoirSample determinism (25 tests)
// ---------------------------------------------------------------------------
describe('reservoirSample determinism', () => {
  for (let i = 0; i < 25; i++) {
    const seed = 77 + i * 11;
    const k = 5;
    it(`seed=${seed} — two calls produce identical results`, () => {
      const pop = Array.from({ length: 30 }, (_, idx) => idx);
      const r1 = reservoirSample(pop, k, seed);
      const r2 = reservoirSample(pop, k, seed);
      expect(r1).toEqual(r2);
    });
  }
});

// ---------------------------------------------------------------------------
// 21. shuffleArray determinism (25 tests)
// ---------------------------------------------------------------------------
describe('shuffleArray determinism', () => {
  for (let i = 0; i < 25; i++) {
    const seed = 55 + i * 3;
    it(`seed=${seed} — two shuffles are identical`, () => {
      const arr = Array.from({ length: 15 }, (_, idx) => idx * 4);
      const s1 = shuffleArray(arr, seed);
      const s2 = shuffleArray(arr, seed);
      expect(s1).toEqual(s2);
    });
  }
});

// ---------------------------------------------------------------------------
// 22. bootstrapSample with explicit n (25 tests)
// ---------------------------------------------------------------------------
describe('bootstrapSample explicit n', () => {
  for (let i = 0; i < 25; i++) {
    const pop = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const n = 3 + (i % 18);
    it(`n=${n} seed=${i} — length=${n}`, () => {
      const result = bootstrapSample(pop, n, i + 2600);
      expect(result.length).toBe(n);
      for (const el of result) {
        expect(pop).toContain(el);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 23. systematicSample edge cases (25 tests)
// ---------------------------------------------------------------------------
describe('systematicSample edge cases', () => {
  for (let i = 0; i < 25; i++) {
    it(`edge case #${i}`, () => {
      const n = 50 + i;
      const pop = Array.from({ length: n }, (_, idx) => idx);

      // k == 1 → one element
      const r1 = systematicSample(pop, 1);
      expect(r1.length).toBe(1);
      expect(pop).toContain(r1[0]);

      // k == n → all elements
      const r2 = systematicSample(pop, n);
      expect(r2.length).toBe(n);

      // k == 0 → empty
      expect(systematicSample(pop, 0)).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// 24. poissonDiskSampling basic (25 tests)
// ---------------------------------------------------------------------------
describe('poissonDiskSampling', () => {
  for (let i = 0; i < 25; i++) {
    const minDist = 10 + i;
    it(`width=100 height=100 minDist=${minDist} seed=${i} — points in bounds and spaced`, () => {
      const pts = poissonDiskSampling(100, 100, minDist, i + 3000);
      expect(pts.length).toBeGreaterThanOrEqual(1);
      for (const [x, y] of pts) {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThan(100);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThan(100);
      }
      // Check minimum distance constraint
      for (let a = 0; a < pts.length; a++) {
        for (let b = a + 1; b < pts.length; b++) {
          const dist = Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1]);
          expect(dist).toBeGreaterThanOrEqual(minDist - 1e-9);
        }
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 25. LHS stratification property (25 tests)
// ---------------------------------------------------------------------------
describe('latinHypercubeSample stratification', () => {
  for (let i = 0; i < 25; i++) {
    const dims = 2 + (i % 4);
    const n = 8 + (i % 10);
    it(`dims=${dims} n=${n} seed=${i} — each stratum represented per dimension`, () => {
      const result = latinHypercubeSample(dims, n, i + 3100);
      expect(result.length).toBe(n);
      // For each dimension, each interval [j/n, (j+1)/n) should contain exactly one point
      for (let d = 0; d < dims; d++) {
        const strata = new Array(n).fill(0);
        for (const point of result) {
          const bin = Math.floor(point[d] * n);
          strata[bin]++;
        }
        for (const count of strata) {
          expect(count).toBe(1);
        }
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 26. SeededRandom sequence independence (25 tests)
// ---------------------------------------------------------------------------
describe('SeededRandom sequence independence', () => {
  for (let i = 0; i < 25; i++) {
    it(`seeds ${i} and ${i + 1} produce different sequences`, () => {
      const rng1 = new SeededRandom(i * 17 + 1);
      const rng2 = new SeededRandom(i * 17 + 2);
      const seq1 = Array.from({ length: 5 }, () => rng1.next());
      const seq2 = Array.from({ length: 5 }, () => rng2.next());
      // They should not be identical (overwhelmingly likely with different seeds)
      expect(seq1).not.toEqual(seq2);
    });
  }
});

// ---------------------------------------------------------------------------
// 27. AliasMethod distribution (25 tests)
// ---------------------------------------------------------------------------
describe('AliasMethod distribution', () => {
  for (let i = 0; i < 25; i++) {
    it(`equal weights seed=${i} — all items appear in large sample`, () => {
      const items = ['a', 'b', 'c', 'd'];
      const alias = new AliasMethod(items, [1, 1, 1, 1], i + 3200);
      const counts = new Map<string, number>();
      const sample = alias.sampleN(400);
      for (const el of sample) {
        counts.set(el, (counts.get(el) || 0) + 1);
      }
      // Each item should appear at least once in 400 samples
      for (const item of items) {
        expect((counts.get(item) || 0)).toBeGreaterThan(0);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 28. reservoirSample k=0 (10 tests)
// ---------------------------------------------------------------------------
describe('reservoirSample k=0', () => {
  for (let i = 0; i < 10; i++) {
    it(`k=0 n=${10 + i} => empty`, () => {
      const pop = Array.from({ length: 10 + i }, (_, idx) => idx);
      const result = reservoirSample(pop, 0, i);
      expect(result).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// 29. reservoirSample k >= n (10 tests)
// ---------------------------------------------------------------------------
describe('reservoirSample k >= n', () => {
  for (let i = 0; i < 10; i++) {
    const n = 5 + i;
    it(`k=${n + 5} n=${n} => returns all n items`, () => {
      const pop = Array.from({ length: n }, (_, idx) => idx * 3);
      const result = reservoirSample(pop, n + 5, i + 3400);
      expect(result.length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// 30. sampleWithoutReplacement k=0 (10 tests)
// ---------------------------------------------------------------------------
describe('sampleWithoutReplacement k=0', () => {
  for (let i = 0; i < 10; i++) {
    it(`k=0 returns empty #${i}`, () => {
      const pop = [1, 2, 3, 4, 5];
      const result = sampleWithoutReplacement(pop, 0, i + 3500);
      expect(result).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// 31. sampleWithoutReplacement k=n (10 tests)
// ---------------------------------------------------------------------------
describe('sampleWithoutReplacement k=n', () => {
  for (let i = 0; i < 10; i++) {
    const n = 5 + i;
    it(`k=n=${n} => permutation of population`, () => {
      const pop = Array.from({ length: n }, (_, idx) => idx + 1);
      const result = sampleWithoutReplacement(pop, n, i + 3600);
      expect(result.length).toBe(n);
      expect(new Set(result).size).toBe(n);
      expect([...result].sort((a, b) => a - b)).toEqual(pop);
    });
  }
});

// ---------------------------------------------------------------------------
// 32. WeightedSampler throw on mismatch (5 tests)
// ---------------------------------------------------------------------------
describe('WeightedSampler mismatch error', () => {
  for (let i = 0; i < 5; i++) {
    it(`throws when items.length != weights.length #${i}`, () => {
      expect(() => new WeightedSampler([1, 2, 3], [1, 2], i)).toThrow();
    });
  }
});

// ---------------------------------------------------------------------------
// 33. AliasMethod throw on mismatch (5 tests)
// ---------------------------------------------------------------------------
describe('AliasMethod mismatch error', () => {
  for (let i = 0; i < 5; i++) {
    it(`throws when items.length != weights.length #${i}`, () => {
      expect(() => new AliasMethod(['a', 'b'], [1])).toThrow();
    });
  }
});

// ---------------------------------------------------------------------------
// 34. bootstrapSample with replacement (allows duplicates) (25 tests)
// ---------------------------------------------------------------------------
describe('bootstrapSample allows duplicates', () => {
  for (let i = 0; i < 25; i++) {
    it(`seed=${i + 3700} — may contain duplicates (sampling with replacement)`, () => {
      const pop = [1, 2, 3]; // tiny population, large sample → must have duplicates
      const result = bootstrapSample(pop, 50, i + 3700);
      expect(result.length).toBe(50);
      // At least some values must repeat
      const unique = new Set(result);
      expect(unique.size).toBeLessThanOrEqual(3);
    });
  }
});

// ---------------------------------------------------------------------------
// 35. stratifiedSample proportionality (25 tests)
// ---------------------------------------------------------------------------
describe('stratifiedSample total count', () => {
  for (let i = 0; i < 25; i++) {
    const strata = [
      Array.from({ length: 10 }, (_, j) => j),
      Array.from({ length: 10 }, (_, j) => 100 + j),
      Array.from({ length: 10 }, (_, j) => 200 + j),
    ];
    const sps = 1 + (i % 5);
    it(`3 strata sps=${sps} seed=${i} — total=${3 * sps}`, () => {
      const result = stratifiedSample(strata, sps, i + 3800);
      expect(result.length).toBe(3 * sps);
    });
  }
});
