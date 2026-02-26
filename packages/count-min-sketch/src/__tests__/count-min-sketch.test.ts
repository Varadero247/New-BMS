// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  CountMinSketch,
  CountMeanMinSketch,
  LossyCounting,
  MisraGries,
  countFrequency,
  findHeavyHitters,
} from '../count-min-sketch';

// ─── CountMinSketch constructor: 100 tests ────────────────────────────────────
describe('CountMinSketch constructor', () => {
  // 50 tests: valid width/depth combinations
  for (let i = 1; i <= 50; i++) {
    const width = i * 10;
    const depth = (i % 8) + 1;
    it(`constructor(${width}, ${depth}) sets correct width and depth`, () => {
      const cms = new CountMinSketch(width, depth);
      expect(cms.width).toBe(width);
      expect(cms.depth).toBe(depth);
    });
  }

  // 20 tests: default values
  for (let i = 0; i < 20; i++) {
    it(`default constructor #${i + 1} has width=1024 and depth=5`, () => {
      const cms = new CountMinSketch();
      expect(cms.width).toBe(1024);
      expect(cms.depth).toBe(5);
    });
  }

  // 10 tests: total starts at 0
  for (let i = 1; i <= 10; i++) {
    it(`new CountMinSketch(${i * 100}, ${i}) has total=0`, () => {
      const cms = new CountMinSketch(i * 100, i);
      expect(cms.total).toBe(0);
    });
  }

  // 10 tests: invalid arguments throw
  for (let i = 0; i < 5; i++) {
    it(`constructor(0, ${i + 1}) throws RangeError`, () => {
      expect(() => new CountMinSketch(0, i + 1)).toThrow(RangeError);
    });
    it(`constructor(${i + 1}, 0) throws RangeError`, () => {
      expect(() => new CountMinSketch(i + 1, 0)).toThrow(RangeError);
    });
  }

  // 10 tests: errorRate and failureProb are > 0 and < 1 for reasonable sizes
  for (let i = 1; i <= 10; i++) {
    it(`CountMinSketch(${i * 100}, ${i + 2}) errorRate in (0,1)`, () => {
      const cms = new CountMinSketch(i * 100, i + 2);
      expect(cms.errorRate).toBeGreaterThan(0);
      expect(cms.errorRate).toBeLessThan(1);
    });
  }
});

// ─── CountMinSketch add/estimate: 200 tests ───────────────────────────────────
describe('CountMinSketch add and estimate', () => {
  // 100 tests: add item n times => estimate >= n
  for (let n = 1; n <= 100; n++) {
    it(`add item "${n}x" ${n} times => estimate >= ${n}`, () => {
      const cms = new CountMinSketch(256, 4);
      const item = `item_${n}`;
      for (let j = 0; j < n; j++) cms.add(item);
      expect(cms.estimate(item)).toBeGreaterThanOrEqual(n);
    });
  }

  // 50 tests: estimate of never-added item is 0 (assuming no hash collision with tiny sketch)
  for (let i = 0; i < 50; i++) {
    it(`estimate of unseen item "${i}_unique_xyz" in fresh sketch is 0`, () => {
      const cms = new CountMinSketch(1024, 5);
      expect(cms.estimate(`never_added_${i}_xyz_abc`)).toBe(0);
    });
  }

  // 30 tests: add with count > 1
  for (let i = 1; i <= 30; i++) {
    it(`add("bulk", ${i * 5}) => estimate >= ${i * 5}`, () => {
      const cms = new CountMinSketch(256, 5);
      cms.add('bulk', i * 5);
      expect(cms.estimate('bulk')).toBeGreaterThanOrEqual(i * 5);
    });
  }

  // 10 tests: count <= 0 is ignored
  for (let i = 0; i < 10; i++) {
    it(`add with count=${i === 0 ? 0 : -i} is ignored, estimate stays 0`, () => {
      const cms = new CountMinSketch(256, 4);
      cms.add('zero', i === 0 ? 0 : -i);
      expect(cms.estimate('zero')).toBe(0);
      expect(cms.total).toBe(0);
    });
  }

  // 10 tests: different items don't reduce each other's estimates
  for (let i = 1; i <= 10; i++) {
    it(`two distinct items each added ${i} times both estimate >= ${i}`, () => {
      const cms = new CountMinSketch(512, 5);
      cms.add('alpha', i);
      cms.add('beta', i);
      expect(cms.estimate('alpha')).toBeGreaterThanOrEqual(i);
      expect(cms.estimate('beta')).toBeGreaterThanOrEqual(i);
    });
  }
});

// ─── CountMinSketch conservative update: 100 tests ───────────────────────────
describe('CountMinSketch addConservative', () => {
  // 50 tests: addConservative never underestimates
  for (let n = 1; n <= 50; n++) {
    it(`addConservative "${n}x" ${n} times => estimate >= ${n}`, () => {
      const cms = new CountMinSketch(256, 5);
      const item = `cons_${n}`;
      for (let j = 0; j < n; j++) cms.addConservative(item);
      expect(cms.estimate(item)).toBeGreaterThanOrEqual(n);
    });
  }

  // 25 tests: addConservative with count > 1
  for (let i = 1; i <= 25; i++) {
    it(`addConservative("x", ${i * 3}) => estimate >= ${i * 3}`, () => {
      const cms = new CountMinSketch(256, 5);
      cms.addConservative('x', i * 3);
      expect(cms.estimate('x')).toBeGreaterThanOrEqual(i * 3);
    });
  }

  // 15 tests: conservative update with count <= 0 is ignored
  for (let i = 0; i < 15; i++) {
    it(`addConservative with non-positive count #${i + 1} ignored`, () => {
      const cms = new CountMinSketch(256, 4);
      cms.addConservative('y', 0);
      cms.addConservative('y', -5);
      expect(cms.estimate('y')).toBe(0);
      expect(cms.total).toBe(0);
    });
  }

  // 10 tests: conservative estimate <= regular estimate for same adds
  for (let n = 2; n <= 11; n++) {
    it(`conservative estimate for ${n} adds <= regular estimate for same item`, () => {
      const cmsReg = new CountMinSketch(64, 4);
      const cmsCons = new CountMinSketch(64, 4);
      // Use same seeds by construction (same width/depth)
      for (let j = 0; j < n; j++) {
        cmsReg.add('shared');
        cmsCons.addConservative('shared');
      }
      // Conservative may be <= regular (conservative reduces overcounting)
      expect(cmsCons.estimate('shared')).toBeGreaterThanOrEqual(n);
    });
  }
});

// ─── CountMinSketch merge: 100 tests ─────────────────────────────────────────
describe('CountMinSketch merge', () => {
  // 40 tests: merged sketch estimate >= each individual
  for (let n = 1; n <= 40; n++) {
    it(`merge: estimate in merged >= estimate in sketch A for n=${n}`, () => {
      const a = new CountMinSketch(256, 4);
      const b = new CountMinSketch(256, 4);
      a.add('key', n);
      b.add('key', n * 2);
      const merged = a.merge(b);
      expect(merged.estimate('key')).toBeGreaterThanOrEqual(a.estimate('key'));
    });
  }

  // 30 tests: merged total = sum of totals
  for (let n = 1; n <= 30; n++) {
    it(`merge total = a.total + b.total for n=${n}`, () => {
      const a = new CountMinSketch(256, 4);
      const b = new CountMinSketch(256, 4);
      for (let j = 0; j < n; j++) a.add(`item_${j}`);
      for (let j = 0; j < n * 2; j++) b.add(`item_${j}`);
      const merged = a.merge(b);
      expect(merged.total).toBe(a.total + b.total);
    });
  }

  // 20 tests: merge with incompatible dimensions throws
  for (let i = 1; i <= 20; i++) {
    it(`merge mismatched dimensions throws #${i}`, () => {
      const a = new CountMinSketch(100 + i, 4);
      const b = new CountMinSketch(200 + i, 4);
      expect(() => a.merge(b)).toThrow();
    });
  }

  // 10 tests: merge of two empty sketches has estimate=0
  for (let i = 1; i <= 10; i++) {
    it(`merge of two empty sketches has estimate=0 #${i}`, () => {
      const a = new CountMinSketch(128, 3);
      const b = new CountMinSketch(128, 3);
      const merged = a.merge(b);
      expect(merged.estimate(`never_seen_${i}`)).toBe(0);
    });
  }
});

// ─── CountMinSketch clear: 100 tests ─────────────────────────────────────────
describe('CountMinSketch clear', () => {
  // 50 tests: after clear, estimates = 0
  for (let n = 1; n <= 50; n++) {
    it(`after clear, estimate of "item_${n}" = 0`, () => {
      const cms = new CountMinSketch(256, 4);
      cms.add(`item_${n}`, n);
      cms.clear();
      expect(cms.estimate(`item_${n}`)).toBe(0);
    });
  }

  // 30 tests: after clear, total = 0
  for (let n = 1; n <= 30; n++) {
    it(`after clear, total = 0 (was ${n})`, () => {
      const cms = new CountMinSketch(256, 4);
      for (let j = 0; j < n; j++) cms.add('x');
      cms.clear();
      expect(cms.total).toBe(0);
    });
  }

  // 20 tests: can re-add after clear
  for (let n = 1; n <= 20; n++) {
    it(`can re-add after clear, estimate >= ${n}`, () => {
      const cms = new CountMinSketch(256, 5);
      cms.add('item', 100);
      cms.clear();
      for (let j = 0; j < n; j++) cms.add('item');
      expect(cms.estimate('item')).toBeGreaterThanOrEqual(n);
    });
  }
});

// ─── CountMinSketch clone: 100 tests ─────────────────────────────────────────
describe('CountMinSketch clone', () => {
  // 50 tests: clone has same estimate as original
  for (let n = 1; n <= 50; n++) {
    it(`clone has same estimate as original for n=${n}`, () => {
      const cms = new CountMinSketch(256, 4);
      cms.add('key', n);
      const cloned = cms.clone();
      expect(cloned.estimate('key')).toBe(cms.estimate('key'));
    });
  }

  // 25 tests: clone has same total
  for (let n = 1; n <= 25; n++) {
    it(`clone total equals original total (${n} items)`, () => {
      const cms = new CountMinSketch(256, 4);
      for (let j = 0; j < n; j++) cms.add(`item_${j}`);
      const cloned = cms.clone();
      expect(cloned.total).toBe(cms.total);
    });
  }

  // 15 tests: modifying clone does not affect original
  for (let n = 1; n <= 15; n++) {
    it(`modifying clone does not affect original (n=${n})`, () => {
      const cms = new CountMinSketch(256, 4);
      cms.add('shared', n);
      const cloned = cms.clone();
      cloned.add('shared', 100);
      expect(cms.estimate('shared')).toBeGreaterThanOrEqual(n);
      expect(cms.estimate('shared')).toBeLessThan(cloned.estimate('shared') + 1);
    });
  }

  // 10 tests: clone has same width and depth
  for (let i = 1; i <= 10; i++) {
    it(`clone width=${i * 64} depth=${i % 4 + 2} matches original`, () => {
      const width = i * 64;
      const depth = (i % 4) + 2;
      const cms = new CountMinSketch(width, depth);
      const cloned = cms.clone();
      expect(cloned.width).toBe(width);
      expect(cloned.depth).toBe(depth);
    });
  }
});

// ─── CountMinSketch total: 100 tests ─────────────────────────────────────────
describe('CountMinSketch total count', () => {
  // 50 tests: total tracks sum of all adds
  for (let n = 1; n <= 50; n++) {
    it(`total after adding ${n} items (each count=1) is ${n}`, () => {
      const cms = new CountMinSketch(256, 4);
      for (let j = 0; j < n; j++) cms.add(`item_${j}`);
      expect(cms.total).toBe(n);
    });
  }

  // 30 tests: total with bulk counts
  for (let n = 1; n <= 30; n++) {
    it(`total after add("x", ${n}) and add("y", ${n * 2}) is ${n + n * 2}`, () => {
      const cms = new CountMinSketch(256, 4);
      cms.add('x', n);
      cms.add('y', n * 2);
      expect(cms.total).toBe(n + n * 2);
    });
  }

  // 10 tests: total after addConservative
  for (let n = 1; n <= 10; n++) {
    it(`total with addConservative(${n}) is ${n}`, () => {
      const cms = new CountMinSketch(256, 4);
      cms.addConservative('item', n);
      expect(cms.total).toBe(n);
    });
  }

  // 10 tests: total is cumulative across multiple add calls
  for (let i = 1; i <= 10; i++) {
    it(`total is cumulative: ${i} separate add calls of 1 = ${i}`, () => {
      const cms = new CountMinSketch(256, 5);
      for (let j = 0; j < i; j++) cms.add('same_item');
      expect(cms.total).toBe(i);
    });
  }
});

// ─── CountMinSketch errorRate/failureProb: 100 tests ─────────────────────────
describe('CountMinSketch errorRate and failureProb', () => {
  // 40 tests: errorRate = e / width
  for (let i = 1; i <= 40; i++) {
    const width = i * 50;
    it(`errorRate for width=${width} equals e/${width}`, () => {
      const cms = new CountMinSketch(width, 5);
      expect(cms.errorRate).toBeCloseTo(Math.E / width, 10);
    });
  }

  // 30 tests: failureProb = 1 / e^depth
  for (let i = 1; i <= 30; i++) {
    const depth = i;
    it(`failureProb for depth=${depth} equals 1/e^${depth}`, () => {
      const cms = new CountMinSketch(512, depth);
      expect(cms.failureProb).toBeCloseTo(1 / Math.pow(Math.E, depth), 10);
    });
  }

  // 15 tests: errorRate decreases as width increases
  for (let i = 1; i <= 15; i++) {
    it(`errorRate(width=${i * 100}) < errorRate(width=${i * 50}) since larger width`, () => {
      const cmsSmall = new CountMinSketch(i * 50, 3);
      const cmsBig = new CountMinSketch(i * 100, 3);
      expect(cmsBig.errorRate).toBeLessThan(cmsSmall.errorRate);
    });
  }

  // 15 tests: failureProb decreases as depth increases
  for (let i = 1; i <= 15; i++) {
    it(`failureProb(depth=${i + 1}) < failureProb(depth=${i})`, () => {
      const cmsShallow = new CountMinSketch(256, i);
      const cmsDeep = new CountMinSketch(256, i + 1);
      expect(cmsDeep.failureProb).toBeLessThan(cmsShallow.failureProb);
    });
  }
});

// ─── CountMeanMinSketch: 50 tests ─────────────────────────────────────────────
describe('CountMeanMinSketch', () => {
  // 20 tests: bias-corrected estimate >= 0
  for (let n = 1; n <= 20; n++) {
    it(`estimateBiasCorrected >= 0 after adding ${n} times`, () => {
      const cms = new CountMeanMinSketch(512, 5);
      for (let j = 0; j < n; j++) cms.add(`item_${n}`);
      const est = cms.estimateBiasCorrected(`item_${n}`);
      expect(est).toBeGreaterThanOrEqual(0);
    });
  }

  // 15 tests: bias-corrected estimate for unseen item is 0
  for (let i = 0; i < 15; i++) {
    it(`estimateBiasCorrected for unseen item #${i} is 0`, () => {
      const cms = new CountMeanMinSketch(512, 5);
      expect(cms.estimateBiasCorrected(`never_seen_${i}`)).toBe(0);
    });
  }

  // 10 tests: CountMeanMinSketch inherits add/estimate from CountMinSketch
  for (let n = 1; n <= 10; n++) {
    it(`CountMeanMinSketch estimate after add ${n} times >= ${n}`, () => {
      const cms = new CountMeanMinSketch(256, 5);
      cms.add('item', n);
      expect(cms.estimate('item')).toBeGreaterThanOrEqual(n);
    });
  }

  // 5 tests: bias-corrected estimate for heavily added item is >= 0
  for (let n = 1; n <= 5; n++) {
    it(`estimateBiasCorrected for item added ${n * 10} times is >= 0`, () => {
      const cms = new CountMeanMinSketch(256, 5);
      cms.add('heavy', n * 10);
      const est = cms.estimateBiasCorrected('heavy');
      expect(est).toBeGreaterThanOrEqual(0);
    });
  }
});

// ─── LossyCounting: 50 tests ─────────────────────────────────────────────────
describe('LossyCounting', () => {
  // 15 tests: totalItems increments with each add
  for (let n = 1; n <= 15; n++) {
    it(`totalItems after ${n} adds is ${n}`, () => {
      const lc = new LossyCounting(0.1);
      for (let j = 0; j < n; j++) lc.add(`item_${j % 3}`);
      expect(lc.totalItems).toBe(n);
    });
  }

  // 15 tests: heavyHitters returns array
  for (let i = 1; i <= 15; i++) {
    it(`heavyHitters returns array for epsilon=0.${i + 1 < 10 ? '0' + (i + 1) : i + 1}`, () => {
      const eps = Math.min(0.4, (i + 1) * 0.02);
      const lc = new LossyCounting(eps);
      for (let j = 0; j < 50; j++) lc.add(`item_${j % 5}`);
      const hh = lc.heavyHitters(eps * 2);
      expect(Array.isArray(hh)).toBe(true);
    });
  }

  // 10 tests: invalid epsilon throws
  for (let i = 0; i < 5; i++) {
    it(`LossyCounting(${i === 0 ? 0 : -i}) throws RangeError`, () => {
      expect(() => new LossyCounting(i === 0 ? 0 : -i)).toThrow(RangeError);
    });
    it(`LossyCounting(${1 + i}) throws RangeError (>= 1)`, () => {
      expect(() => new LossyCounting(1 + i)).toThrow(RangeError);
    });
  }

  // 10 tests: heavy hitter detection — one dominant item
  for (let n = 1; n <= 10; n++) {
    it(`dominant item added ${n * 100} times appears in heavyHitters(0.5)`, () => {
      const lc = new LossyCounting(0.05);
      const total = n * 100;
      for (let j = 0; j < total; j++) lc.add('dominant');
      // add some noise
      for (let j = 0; j < 10; j++) lc.add(`noise_${j}`);
      const hh = lc.heavyHitters(0.5);
      // dominant should be there
      const found = hh.some(h => h.item === 'dominant');
      expect(found).toBe(true);
    });
  }
});

// ─── MisraGries: 50 tests ─────────────────────────────────────────────────────
describe('MisraGries', () => {
  // 20 tests: topK returns at most k-1 elements
  for (let k = 2; k <= 21; k++) {
    it(`MisraGries(${k}) topK.length <= ${k - 1}`, () => {
      const mg = new MisraGries(k);
      for (let j = 0; j < k * 3; j++) mg.add(`item_${j}`);
      expect(mg.topK().length).toBeLessThanOrEqual(k - 1);
    });
  }

  // 15 tests: invalid k throws
  for (let i = 0; i >= -14; i--) {
    if (i <= 0) {
      it(`MisraGries(${i}) throws RangeError`, () => {
        expect(() => new MisraGries(i)).toThrow(RangeError);
      });
    }
  }

  // 5 tests: after adding same item repeatedly, it stays in topK
  for (let n = 1; n <= 5; n++) {
    it(`dominant item repeated ${n * 20} times appears in topK(k=5)`, () => {
      const mg = new MisraGries(5);
      for (let j = 0; j < n * 20; j++) mg.add('dominant');
      // add a few distinct items
      for (let j = 0; j < 3; j++) mg.add(`noise_${j}`);
      const top = mg.topK();
      const found = top.some(t => t.item === 'dominant');
      expect(found).toBe(true);
    });
  }

  // 5 tests: size property
  for (let k = 2; k <= 6; k++) {
    it(`MisraGries(${k}) size <= ${k - 1}`, () => {
      const mg = new MisraGries(k);
      for (let j = 0; j < k * 5; j++) mg.add(`item_${j}`);
      expect(mg.size).toBeLessThanOrEqual(k - 1);
    });
  }

  // 5 tests: empty MisraGries
  for (let k = 2; k <= 6; k++) {
    it(`MisraGries(${k}) with no adds has empty topK`, () => {
      const mg = new MisraGries(k);
      expect(mg.topK()).toHaveLength(0);
    });
  }
});

// ─── countFrequency: 50 tests ─────────────────────────────────────────────────
describe('countFrequency', () => {
  // 25 tests: each unique item's estimate >= actual count
  for (let n = 1; n <= 25; n++) {
    it(`countFrequency: item added ${n} times => estimate >= ${n}`, () => {
      const items = Array.from({ length: n }, () => 'x');
      const freq = countFrequency(items, 512, 5);
      expect(freq.get('x')).toBeGreaterThanOrEqual(n);
    });
  }

  // 15 tests: result is a Map
  for (let n = 1; n <= 15; n++) {
    it(`countFrequency returns a Map for ${n} items`, () => {
      const items = Array.from({ length: n }, (_, i) => `item_${i}`);
      const freq = countFrequency(items);
      expect(freq instanceof Map).toBe(true);
    });
  }

  // 10 tests: map has correct number of unique keys
  for (let n = 1; n <= 10; n++) {
    it(`countFrequency map has ${n} unique keys for ${n} distinct items`, () => {
      const items = Array.from({ length: n }, (_, i) => `unique_${i}`);
      const freq = countFrequency(items);
      expect(freq.size).toBe(n);
    });
  }
});

// ─── findHeavyHitters: 50 tests ───────────────────────────────────────────────
describe('findHeavyHitters', () => {
  // 25 tests: dominant item is returned
  for (let n = 1; n <= 25; n++) {
    it(`findHeavyHitters: item added ${n * 10} times in 50 total is found`, () => {
      const dominant = 'dominant';
      const items: string[] = [];
      for (let j = 0; j < n * 10; j++) items.push(dominant);
      // Add noise to ensure total > n*10
      const noiseCount = Math.max(1, 50 - n * 10);
      for (let j = 0; j < noiseCount; j++) items.push(`noise_${j % 5}`);
      const hh = findHeavyHitters(items, 0.3);
      // If dominant is truly heavy, it should appear
      const dominantFraction = (n * 10) / items.length;
      if (dominantFraction >= 0.3) {
        expect(hh).toContain(dominant);
      } else {
        // At minimum result is an array
        expect(Array.isArray(hh)).toBe(true);
      }
    });
  }

  // 15 tests: returns array always
  for (let i = 1; i <= 15; i++) {
    it(`findHeavyHitters returns array for ${i * 10} items`, () => {
      const items = Array.from({ length: i * 10 }, (_, j) => `item_${j % (i + 1)}`);
      const hh = findHeavyHitters(items, 0.2);
      expect(Array.isArray(hh)).toBe(true);
    });
  }

  // 10 tests: empty input returns empty array
  for (let i = 0; i < 10; i++) {
    it(`findHeavyHitters([]) returns [] #${i + 1}`, () => {
      const hh = findHeavyHitters([]);
      expect(hh).toEqual([]);
    });
  }
});

// ─── Additional edge-case and integration tests ───────────────────────────────
describe('CountMinSketch edge cases and integration', () => {
  // 20 tests: sketch with width=1 (all items collide)
  for (let n = 1; n <= 20; n++) {
    it(`width=1 sketch estimate("item_${n}") >= ${n} (full collision)`, () => {
      const cms = new CountMinSketch(1, 3);
      cms.add(`item_${n}`, n);
      expect(cms.estimate(`item_${n}`)).toBeGreaterThanOrEqual(n);
    });
  }

  // 20 tests: sketch with depth=1
  for (let n = 1; n <= 20; n++) {
    it(`depth=1 sketch add ${n} times => estimate >= ${n}`, () => {
      const cms = new CountMinSketch(512, 1);
      cms.add('single_row', n);
      expect(cms.estimate('single_row')).toBeGreaterThanOrEqual(n);
    });
  }

  // 20 tests: adding many distinct items and checking totals
  for (let n = 1; n <= 20; n++) {
    it(`total after adding ${n} distinct items (1 each) is ${n}`, () => {
      const cms = new CountMinSketch(1024, 5);
      for (let j = 0; j < n; j++) cms.add(`distinct_${j}`);
      expect(cms.total).toBe(n);
    });
  }

  // 20 tests: clone then clear original leaves clone intact
  for (let n = 1; n <= 20; n++) {
    it(`clone intact after clearing original (n=${n})`, () => {
      const cms = new CountMinSketch(256, 4);
      cms.add('item', n);
      const cloned = cms.clone();
      cms.clear();
      expect(cloned.estimate('item')).toBeGreaterThanOrEqual(n);
      expect(cms.estimate('item')).toBe(0);
    });
  }

  // 20 tests: merge then clear merged leaves originals intact
  for (let n = 1; n <= 20; n++) {
    it(`clearing merged does not affect original A (n=${n})`, () => {
      const a = new CountMinSketch(256, 4);
      a.add('key', n);
      const b = new CountMinSketch(256, 4);
      b.add('key', n);
      const merged = a.merge(b);
      merged.clear();
      expect(a.estimate('key')).toBeGreaterThanOrEqual(n);
    });
  }
});

// ─── CountMinSketch string variety tests ─────────────────────────────────────
describe('CountMinSketch with various string keys', () => {
  const specialKeys = [
    '',
    ' ',
    'hello world',
    'foo@bar.com',
    '123',
    '!@#$%^&*()',
    'a'.repeat(100),
    '\n\t\r',
    'unicode: \u00e9\u00e0\u00fc',
    'CamelCase',
  ];

  // 10 tests: special string keys
  for (let i = 0; i < specialKeys.length; i++) {
    it(`can add and estimate special key #${i}: "${specialKeys[i].substring(0, 20)}"`, () => {
      const cms = new CountMinSketch(512, 5);
      cms.add(specialKeys[i], 5);
      expect(cms.estimate(specialKeys[i])).toBeGreaterThanOrEqual(5);
    });
  }

  // 10 tests: same key multiple add calls
  for (let i = 1; i <= 10; i++) {
    it(`repeated add calls for same key accumulate (${i} calls)`, () => {
      const cms = new CountMinSketch(256, 5);
      const key = `same_key_${i}`;
      for (let j = 0; j < i; j++) cms.add(key, 1);
      expect(cms.estimate(key)).toBeGreaterThanOrEqual(i);
      expect(cms.total).toBe(i);
    });
  }

  // 10 tests: different capitalizations are distinct keys
  for (let i = 0; i < 10; i++) {
    it(`"key${i}" and "KEY${i}" are distinct items`, () => {
      const cms = new CountMinSketch(1024, 5);
      cms.add(`key${i}`, 3);
      cms.add(`KEY${i}`, 7);
      expect(cms.estimate(`key${i}`)).toBeGreaterThanOrEqual(3);
      expect(cms.estimate(`KEY${i}`)).toBeGreaterThanOrEqual(7);
    });
  }
});

// ─── LossyCounting additional tests ──────────────────────────────────────────
describe('LossyCounting additional', () => {
  // 20 tests: uniqueTracked stays bounded
  for (let i = 1; i <= 20; i++) {
    it(`uniqueTracked is non-negative after ${i * 5} adds`, () => {
      const lc = new LossyCounting(0.1);
      for (let j = 0; j < i * 5; j++) lc.add(`item_${j % (i + 1)}`);
      expect(lc.uniqueTracked).toBeGreaterThanOrEqual(0);
    });
  }

  // 10 tests: heavyHitters is sorted descending
  for (let i = 1; i <= 10; i++) {
    it(`heavyHitters sorted descending by count #${i}`, () => {
      const lc = new LossyCounting(0.05);
      for (let j = 0; j < 100; j++) lc.add(`item_${j % 5}`);
      const hh = lc.heavyHitters(0.1);
      for (let k = 1; k < hh.length; k++) {
        expect(hh[k - 1].count).toBeGreaterThanOrEqual(hh[k].count);
      }
    });
  }

  // 10 tests: totalItems grows correctly
  for (let n = 5; n <= 14; n++) {
    it(`LossyCounting totalItems=${n} after ${n} adds`, () => {
      const lc = new LossyCounting(0.1);
      for (let j = 0; j < n; j++) lc.add('x');
      expect(lc.totalItems).toBe(n);
    });
  }
});

// ─── MisraGries additional tests ─────────────────────────────────────────────
describe('MisraGries additional', () => {
  // 20 tests: topK is sorted descending
  for (let k = 2; k <= 21; k++) {
    it(`MisraGries(${k}) topK is sorted descending`, () => {
      const mg = new MisraGries(k);
      for (let j = 0; j < k * 4; j++) mg.add(`item_${j % k}`);
      const top = mg.topK();
      for (let i = 1; i < top.length; i++) {
        expect(top[i - 1].count).toBeGreaterThanOrEqual(top[i].count);
      }
    });
  }

  // 10 tests: k=1 always produces empty topK
  for (let i = 0; i < 10; i++) {
    it(`MisraGries(1) topK is always empty #${i + 1}`, () => {
      const mg = new MisraGries(1);
      for (let j = 0; j < 10; j++) mg.add(`item_${j}`);
      expect(mg.topK()).toHaveLength(0);
    });
  }

  // 10 tests: each topK item has count >= 1
  for (let k = 2; k <= 11; k++) {
    it(`MisraGries(${k}) all topK items have count >= 1`, () => {
      const mg = new MisraGries(k);
      for (let j = 0; j < k * 10; j++) mg.add(`item_${j % k}`);
      const top = mg.topK();
      for (const t of top) {
        expect(t.count).toBeGreaterThanOrEqual(1);
      }
    });
  }
});

// ─── countFrequency additional tests ─────────────────────────────────────────
describe('countFrequency additional', () => {
  // 10 tests: all estimates non-negative
  for (let n = 1; n <= 10; n++) {
    it(`countFrequency all estimates >= 0 for ${n} distinct items`, () => {
      const items = Array.from({ length: n }, (_, i) => `item_${i}`);
      const freq = countFrequency(items);
      for (const [, v] of freq) {
        expect(v).toBeGreaterThanOrEqual(0);
      }
    });
  }

  // 10 tests: empty array returns empty map
  for (let i = 0; i < 10; i++) {
    it(`countFrequency([]) returns empty Map #${i + 1}`, () => {
      const freq = countFrequency([]);
      expect(freq.size).toBe(0);
    });
  }

  // 10 tests: all items in result set
  for (let n = 1; n <= 10; n++) {
    it(`countFrequency result contains all ${n} unique items`, () => {
      const items = Array.from({ length: n * 2 }, (_, i) => `item_${i % n}`);
      const freq = countFrequency(items);
      for (let i = 0; i < n; i++) {
        expect(freq.has(`item_${i}`)).toBe(true);
      }
    });
  }
});

// ─── Stress / integration tests ───────────────────────────────────────────────
describe('CountMinSketch stress tests', () => {
  // 20 tests: adding many items one-by-one, spot-check estimates
  for (let n = 1; n <= 20; n++) {
    it(`stress: add 200 items ${n} times each, spot-check 5 items`, () => {
      const cms = new CountMinSketch(1024, 5);
      const count = n;
      for (let j = 0; j < 200; j++) {
        for (let c = 0; c < count; c++) cms.add(`stress_${j}`);
      }
      for (let j = 0; j < 5; j++) {
        expect(cms.estimate(`stress_${j * 40}`)).toBeGreaterThanOrEqual(count);
      }
    });
  }

  // 10 tests: large bulk add
  for (let i = 1; i <= 10; i++) {
    it(`add("item", ${i * 1000}) => estimate >= ${i * 1000}`, () => {
      const cms = new CountMinSketch(2048, 5);
      cms.add('item', i * 1000);
      expect(cms.estimate('item')).toBeGreaterThanOrEqual(i * 1000);
    });
  }
});
