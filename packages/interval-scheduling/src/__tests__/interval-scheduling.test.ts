// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  maxNonOverlapping,
  mergeIntervals,
  doOverlap,
  intersectionLength,
  minMachines,
  maxWeightScheduleValue,
  maxWeightSchedule,
  activitySelection,
  intervalCoverage,
  minIntervalsTocover,
  longestIncreasingSubsequenceLength,
  trapRainWater,
  jobSchedulingMaxProfit,
  partitionIntoMinChains,
  Interval,
  WeightedInterval,
  Job,
} from '../interval-scheduling';

// ---------------------------------------------------------------------------
// 1. maxNonOverlapping count (150 tests)
// ---------------------------------------------------------------------------
describe('maxNonOverlapping', () => {
  it('empty input returns empty array', () => {
    expect(maxNonOverlapping([])).toEqual([]);
  });

  it('single interval returns that interval', () => {
    expect(maxNonOverlapping([{ start: 0, end: 5 }])).toEqual([{ start: 0, end: 5 }]);
  });

  it('two non-overlapping intervals returns both', () => {
    const result = maxNonOverlapping([{ start: 0, end: 2 }, { start: 3, end: 5 }]);
    expect(result).toHaveLength(2);
  });

  it('two overlapping intervals returns one', () => {
    const result = maxNonOverlapping([{ start: 0, end: 5 }, { start: 3, end: 7 }]);
    expect(result).toHaveLength(1);
  });

  it('classic example [[1,2],[2,3],[3,4],[1,3]] → 3 selected', () => {
    const ivs = [{ start: 1, end: 2 }, { start: 2, end: 3 }, { start: 3, end: 4 }, { start: 1, end: 3 }];
    expect(maxNonOverlapping(ivs)).toHaveLength(3);
  });

  it('[[1,3],[2,4],[3,5]] → 2 selected', () => {
    const ivs = [{ start: 1, end: 3 }, { start: 2, end: 4 }, { start: 3, end: 5 }];
    expect(maxNonOverlapping(ivs)).toHaveLength(2);
  });

  // For loops: varying interval lengths with no overlaps → all selected
  for (let n = 1; n <= 50; n++) {
    it(`${n} non-overlapping unit intervals → all ${n} selected`, () => {
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({ start: i * 2, end: i * 2 + 1 }));
      expect(maxNonOverlapping(ivs)).toHaveLength(n);
    });
  }

  // For loops: all same interval → only 1 selected
  for (let n = 2; n <= 20; n++) {
    it(`${n} identical intervals [0,1] → only 1 selected`, () => {
      const ivs: Interval[] = Array.from({ length: n }, () => ({ start: 0, end: 1 }));
      expect(maxNonOverlapping(ivs)).toHaveLength(1);
    });
  }

  // For loops: staggered intervals where only every other one is compatible
  for (let k = 2; k <= 30; k++) {
    it(`staggered: ${k} intervals with step 1, range 2 → ~${Math.ceil(k / 2)} selected`, () => {
      const ivs: Interval[] = Array.from({ length: k }, (_, i) => ({ start: i, end: i + 2 }));
      const result = maxNonOverlapping(ivs);
      // Greedy by end time should select ceil(k/2) intervals
      expect(result.length).toBe(Math.ceil(k / 2));
    });
  }

  // Selected intervals should not overlap
  it('result intervals never overlap each other', () => {
    const ivs = [
      { start: 0, end: 6 }, { start: 1, end: 4 }, { start: 5, end: 9 },
      { start: 3, end: 5 }, { start: 8, end: 10 },
    ];
    const result = maxNonOverlapping(ivs);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].end).toBeLessThanOrEqual(result[i + 1].start);
    }
  });

  // Selected intervals should be a subset of input
  it('result is a subset of input', () => {
    const ivs = [{ start: 0, end: 3 }, { start: 1, end: 4 }, { start: 2, end: 5 }];
    const result = maxNonOverlapping(ivs);
    for (const iv of result) {
      expect(ivs).toContainEqual(iv);
    }
  });

  // touching intervals (end == next start) are non-overlapping
  it('adjacent touching intervals are both selected', () => {
    const result = maxNonOverlapping([{ start: 0, end: 5 }, { start: 5, end: 10 }]);
    expect(result).toHaveLength(2);
  });

  it('three touching intervals are all selected', () => {
    const result = maxNonOverlapping([{ start: 0, end: 3 }, { start: 3, end: 6 }, { start: 6, end: 9 }]);
    expect(result).toHaveLength(3);
  });

  // Count verification for known optimal solutions
  for (let size = 1; size <= 20; size++) {
    it(`all unit-length intervals at positions 0..${size - 1} → all ${size} selected`, () => {
      const ivs: Interval[] = Array.from({ length: size }, (_, i) => ({ start: i, end: i + 1 }));
      expect(maxNonOverlapping(ivs)).toHaveLength(size);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. mergeIntervals (150 tests)
// ---------------------------------------------------------------------------
describe('mergeIntervals', () => {
  it('empty input returns empty array', () => {
    expect(mergeIntervals([])).toEqual([]);
  });

  it('single interval returns that interval', () => {
    expect(mergeIntervals([{ start: 2, end: 7 }])).toEqual([{ start: 2, end: 7 }]);
  });

  it('two non-overlapping intervals stay separate', () => {
    expect(mergeIntervals([{ start: 1, end: 3 }, { start: 5, end: 7 }])).toEqual([
      { start: 1, end: 3 }, { start: 5, end: 7 },
    ]);
  });

  it('two overlapping intervals merge into one', () => {
    expect(mergeIntervals([{ start: 1, end: 5 }, { start: 3, end: 8 }])).toEqual([{ start: 1, end: 8 }]);
  });

  it('classic [[1,3],[2,6],[8,10],[15,18]] → [[1,6],[8,10],[15,18]]', () => {
    const result = mergeIntervals([
      { start: 1, end: 3 }, { start: 2, end: 6 }, { start: 8, end: 10 }, { start: 15, end: 18 },
    ]);
    expect(result).toEqual([{ start: 1, end: 6 }, { start: 8, end: 10 }, { start: 15, end: 18 }]);
  });

  it('all intervals overlap → one merged interval', () => {
    const result = mergeIntervals([{ start: 1, end: 10 }, { start: 2, end: 8 }, { start: 5, end: 12 }]);
    expect(result).toEqual([{ start: 1, end: 12 }]);
  });

  it('touching intervals [0,5],[5,10] merge into [0,10]', () => {
    expect(mergeIntervals([{ start: 0, end: 5 }, { start: 5, end: 10 }])).toEqual([{ start: 0, end: 10 }]);
  });

  // Result should have no internal overlaps
  for (let n = 2; n <= 30; n++) {
    it(`merged result of ${n} random-ish intervals has no overlapping pairs`, () => {
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({
        start: (i % 5) * 3,
        end: (i % 5) * 3 + 4,
      }));
      const result = mergeIntervals(ivs);
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].end).toBeLessThanOrEqual(result[i + 1].start);
      }
    });
  }

  // n non-overlapping intervals → n results
  for (let n = 1; n <= 30; n++) {
    it(`${n} non-overlapping intervals produce ${n} merged groups`, () => {
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({ start: i * 10, end: i * 10 + 5 }));
      expect(mergeIntervals(ivs)).toHaveLength(n);
    });
  }

  // All intervals are identical → one merged interval
  for (let n = 2; n <= 10; n++) {
    it(`${n} identical [0,4] intervals merge into one`, () => {
      const ivs: Interval[] = Array.from({ length: n }, () => ({ start: 0, end: 4 }));
      expect(mergeIntervals(ivs)).toEqual([{ start: 0, end: 4 }]);
    });
  }

  // Pairs that fully contain each other
  for (let i = 1; i <= 20; i++) {
    it(`inner interval fully contained: [0,${i * 10}] contains [1,${i * 10 - 1}] → single merged`, () => {
      const result = mergeIntervals([{ start: 0, end: i * 10 }, { start: 1, end: i * 10 - 1 }]);
      expect(result).toEqual([{ start: 0, end: i * 10 }]);
    });
  }

  // merged result start ≤ all input starts, end ≥ all input ends (when all overlap)
  it('merged single interval covers all inputs when all overlap', () => {
    const ivs = [{ start: 2, end: 8 }, { start: 3, end: 12 }, { start: 1, end: 5 }];
    const result = mergeIntervals(ivs);
    expect(result).toHaveLength(1);
    expect(result[0].start).toBe(1);
    expect(result[0].end).toBe(12);
  });

  // Input in reverse order should still merge correctly
  for (let n = 2; n <= 20; n++) {
    it(`reverse-ordered ${n} overlapping intervals still merges correctly`, () => {
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({ start: (n - i) * 2, end: (n - i) * 2 + 3 }));
      const result = mergeIntervals(ivs);
      // All should be in sorted order
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].start).toBeLessThan(result[i + 1].start);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 3. doOverlap (100 tests)
// ---------------------------------------------------------------------------
describe('doOverlap', () => {
  it('[0,5] and [3,8] overlap', () => expect(doOverlap({ start: 0, end: 5 }, { start: 3, end: 8 })).toBe(true));
  it('[0,5] and [5,10] do NOT overlap (touching)', () => expect(doOverlap({ start: 0, end: 5 }, { start: 5, end: 10 })).toBe(false));
  it('[0,5] and [6,10] do NOT overlap', () => expect(doOverlap({ start: 0, end: 5 }, { start: 6, end: 10 })).toBe(false));
  it('[3,8] and [0,5] overlap (reverse order)', () => expect(doOverlap({ start: 3, end: 8 }, { start: 0, end: 5 })).toBe(true));
  it('identical intervals overlap', () => expect(doOverlap({ start: 2, end: 7 }, { start: 2, end: 7 })).toBe(true));
  it('one contains the other → overlap', () => expect(doOverlap({ start: 0, end: 10 }, { start: 3, end: 7 })).toBe(true));

  // Non-overlapping pairs with various gaps
  for (let gap = 1; gap <= 20; gap++) {
    it(`[0,5] and [${5 + gap},${10 + gap}] do NOT overlap (gap=${gap})`, () => {
      expect(doOverlap({ start: 0, end: 5 }, { start: 5 + gap, end: 10 + gap })).toBe(false);
    });
  }

  // Overlapping pairs with various overlap amounts
  for (let overlap = 1; overlap <= 20; overlap++) {
    it(`[0,10] and [${10 - overlap},20] DO overlap (overlap=${overlap})`, () => {
      expect(doOverlap({ start: 0, end: 10 }, { start: 10 - overlap, end: 20 })).toBe(true);
    });
  }

  // Zero-length interval inside another: doOverlap({0,10},{pos,pos}) = 0<pos && pos<10 = true for 1<=pos<=9
  for (let pos = 1; pos < 10; pos++) {
    it(`zero-length interval at ${pos} inside [0,10]: a.start<b.end && b.start<a.end → true`, () => {
      // [pos,pos]: a.start<b.end => 0<pos (true), b.start<a.end => pos<10 (true for 1..9)
      expect(doOverlap({ start: 0, end: 10 }, { start: pos, end: pos })).toBe(true);
    });
  }

  // Symmetric property
  for (let i = 0; i < 20; i++) {
    it(`doOverlap is symmetric for pair ${i}`, () => {
      const a: Interval = { start: i, end: i + 3 };
      const b: Interval = { start: i + 2, end: i + 6 };
      expect(doOverlap(a, b)).toBe(doOverlap(b, a));
    });
  }

  // Adjacent (touching) never overlaps
  for (let x = 0; x < 20; x++) {
    it(`adjacent intervals [${x},${x + 5}] and [${x + 5},${x + 10}] do NOT overlap`, () => {
      expect(doOverlap({ start: x, end: x + 5 }, { start: x + 5, end: x + 10 })).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. intersectionLength (100 tests)
// ---------------------------------------------------------------------------
describe('intersectionLength', () => {
  it('[0,5] ∩ [3,8] = 2', () => expect(intersectionLength({ start: 0, end: 5 }, { start: 3, end: 8 })).toBe(2));
  it('[0,5] ∩ [5,10] = 0 (touching)', () => expect(intersectionLength({ start: 0, end: 5 }, { start: 5, end: 10 })).toBe(0));
  it('[0,10] ∩ [2,7] = 5 (containment)', () => expect(intersectionLength({ start: 0, end: 10 }, { start: 2, end: 7 })).toBe(5));
  it('identical intervals → full length', () => expect(intersectionLength({ start: 3, end: 9 }, { start: 3, end: 9 })).toBe(6));
  it('non-overlapping → 0', () => expect(intersectionLength({ start: 0, end: 3 }, { start: 5, end: 9 })).toBe(0));

  // Exact overlap amounts: [0,10] ∩ [10-ov, 20] = min(ov, 10) since start is capped at 0
  for (let ov = 1; ov <= 20; ov++) {
    const expectedOverlap = Math.min(ov, 10);
    it(`[0,10] ∩ [${10 - ov},20] = ${expectedOverlap}`, () => {
      expect(intersectionLength({ start: 0, end: 10 }, { start: 10 - ov, end: 20 })).toBe(expectedOverlap);
    });
  }

  // Symmetric property
  for (let i = 0; i < 20; i++) {
    it(`intersectionLength is symmetric: pair ${i}`, () => {
      const a: Interval = { start: i, end: i + 5 };
      const b: Interval = { start: i + 2, end: i + 8 };
      expect(intersectionLength(a, b)).toBe(intersectionLength(b, a));
    });
  }

  // Zero for various gap sizes
  for (let gap = 1; gap <= 20; gap++) {
    it(`[0,5] ∩ [${5 + gap},10] = 0 when gap=${gap}`, () => {
      expect(intersectionLength({ start: 0, end: 5 }, { start: 5 + gap, end: 10 })).toBe(0);
    });
  }

  // Length of contained interval
  for (let len = 1; len <= 10; len++) {
    it(`[0,100] ∩ [10,${10 + len}] = ${len}`, () => {
      expect(intersectionLength({ start: 0, end: 100 }, { start: 10, end: 10 + len })).toBe(len);
    });
  }

  // Result is always non-negative
  for (let i = 0; i < 15; i++) {
    it(`intersectionLength is non-negative: pair ${i}`, () => {
      const a: Interval = { start: i * 3, end: i * 3 + 5 };
      const b: Interval = { start: i * 3 + 7, end: i * 3 + 12 };
      expect(intersectionLength(a, b)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. minMachines (100 tests)
// ---------------------------------------------------------------------------
describe('minMachines', () => {
  it('empty input → 0', () => expect(minMachines([])).toBe(0));
  it('single interval → 1', () => expect(minMachines([{ start: 0, end: 5 }])).toBe(1));

  it('two non-overlapping → 1', () => {
    expect(minMachines([{ start: 0, end: 3 }, { start: 5, end: 8 }])).toBe(1);
  });

  it('two overlapping → 2', () => {
    expect(minMachines([{ start: 0, end: 5 }, { start: 2, end: 7 }])).toBe(2);
  });

  it('three all-overlapping → 3', () => {
    expect(minMachines([{ start: 0, end: 10 }, { start: 1, end: 5 }, { start: 2, end: 8 }])).toBe(3);
  });

  it('touching intervals (end==start) need only 1 machine', () => {
    expect(minMachines([{ start: 0, end: 5 }, { start: 5, end: 10 }])).toBe(1);
  });

  // n simultaneous intervals → n machines
  for (let n = 1; n <= 30; n++) {
    it(`${n} all-overlapping intervals [0,10] → ${n} machines`, () => {
      const ivs: Interval[] = Array.from({ length: n }, () => ({ start: 0, end: 10 }));
      expect(minMachines(ivs)).toBe(n);
    });
  }

  // n sequential non-overlapping → 1 machine
  for (let n = 1; n <= 20; n++) {
    it(`${n} sequential non-overlapping intervals → 1 machine`, () => {
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({ start: i * 5, end: i * 5 + 4 }));
      expect(minMachines(ivs)).toBe(1);
    });
  }

  // pyramid: 1 at time 0-10, 2 at time 1-9, 3 at time 2-8 → max at peak
  for (let depth = 1; depth <= 10; depth++) {
    it(`nested ${depth} intervals → ${depth} machines`, () => {
      const ivs: Interval[] = Array.from({ length: depth }, (_, i) => ({ start: i, end: 20 - i }));
      expect(minMachines(ivs)).toBe(depth);
    });
  }

  // Two groups of concurrent intervals
  for (let g = 2; g <= 10; g++) {
    it(`two groups of ${g} concurrent intervals → ${g} machines`, () => {
      const groupA: Interval[] = Array.from({ length: g }, () => ({ start: 0, end: 5 }));
      const groupB: Interval[] = Array.from({ length: g }, () => ({ start: 6, end: 10 }));
      expect(minMachines([...groupA, ...groupB])).toBe(g);
    });
  }

  // Touching chains require only 1 machine
  for (let n = 2; n <= 15; n++) {
    it(`${n} touching intervals require 1 machine`, () => {
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({ start: i * 3, end: i * 3 + 3 }));
      expect(minMachines(ivs)).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. maxWeightScheduleValue (100 tests)
// ---------------------------------------------------------------------------
describe('maxWeightScheduleValue', () => {
  it('empty input → 0', () => expect(maxWeightScheduleValue([])).toBe(0));

  it('single interval returns its weight', () => {
    expect(maxWeightScheduleValue([{ start: 0, end: 5, weight: 7 }])).toBe(7);
  });

  it('two non-overlapping → sum of weights', () => {
    const ivs: WeightedInterval[] = [{ start: 0, end: 3, weight: 4 }, { start: 5, end: 8, weight: 6 }];
    expect(maxWeightScheduleValue(ivs)).toBe(10);
  });

  it('two overlapping → picks heavier one', () => {
    const ivs: WeightedInterval[] = [{ start: 0, end: 5, weight: 3 }, { start: 3, end: 8, weight: 9 }];
    expect(maxWeightScheduleValue(ivs)).toBe(9);
  });

  it('classic: [1,3,w=4], [2,5,w=10], [3,6,w=3] → 10 (pick heaviest non-overlapping)', () => {
    // [1,3] and [3,6] touch but don't overlap → can combine for 4+3=7
    // [2,5] alone = 10; [1,3]+[3,6]=7; optimal = 10
    const ivs: WeightedInterval[] = [
      { start: 1, end: 3, weight: 4 },
      { start: 2, end: 5, weight: 10 },
      { start: 3, end: 6, weight: 3 },
    ];
    expect(maxWeightScheduleValue(ivs)).toBe(10);
  });

  // Non-overlapping: total weight equals sum of all weights
  for (let n = 1; n <= 20; n++) {
    it(`${n} non-overlapping intervals → sum of all weights`, () => {
      const ivs: WeightedInterval[] = Array.from({ length: n }, (_, i) => ({
        start: i * 10,
        end: i * 10 + 5,
        weight: i + 1,
      }));
      const total = ivs.reduce((s, iv) => s + iv.weight, 0);
      expect(maxWeightScheduleValue(ivs)).toBe(total);
    });
  }

  // All same interval: pick max weight
  for (let n = 2; n <= 10; n++) {
    it(`${n} identical intervals → max single weight`, () => {
      const ivs: WeightedInterval[] = Array.from({ length: n }, (_, i) => ({
        start: 0, end: 5, weight: i + 1,
      }));
      expect(maxWeightScheduleValue(ivs)).toBe(n); // max weight = n
    });
  }

  // Result is at least as large as the max single weight
  for (let n = 2; n <= 20; n++) {
    it(`result >= max single weight, n=${n}`, () => {
      const ivs: WeightedInterval[] = Array.from({ length: n }, (_, i) => ({
        start: i * 2,
        end: i * 2 + 3,
        weight: (i + 1) * 2,
      }));
      const maxW = Math.max(...ivs.map(iv => iv.weight));
      expect(maxWeightScheduleValue(ivs)).toBeGreaterThanOrEqual(maxW);
    });
  }

  // Chain of compatible intervals: total should equal sum
  for (let n = 2; n <= 20; n++) {
    it(`chain of ${n} compatible intervals sums all weights`, () => {
      const ivs: WeightedInterval[] = Array.from({ length: n }, (_, i) => ({
        start: i * 5,
        end: i * 5 + 5,
        weight: 3,
      }));
      expect(maxWeightScheduleValue(ivs)).toBe(n * 3);
    });
  }

  // Heavier overlapping interval beats lighter compatible chain
  it('single heavy [0,20,w=100] beats chain of lighters', () => {
    const chain: WeightedInterval[] = Array.from({ length: 5 }, (_, i) => ({
      start: i * 4, end: i * 4 + 4, weight: 15,
    }));
    const heavy: WeightedInterval = { start: 0, end: 20, weight: 100 };
    expect(maxWeightScheduleValue([...chain, heavy])).toBe(100);
  });

  it('chain beats single heavy when chain sum > heavy', () => {
    const chain: WeightedInterval[] = Array.from({ length: 10 }, (_, i) => ({
      start: i * 4, end: i * 4 + 4, weight: 15,
    }));
    const heavy: WeightedInterval = { start: 0, end: 40, weight: 100 };
    expect(maxWeightScheduleValue([...chain, heavy])).toBe(150);
  });
});

// ---------------------------------------------------------------------------
// 7. activitySelection (100 tests)
// ---------------------------------------------------------------------------
describe('activitySelection', () => {
  it('empty input → empty', () => expect(activitySelection([])).toEqual([]));

  it('single job returns that job', () => {
    const job: Job = { id: 1, start: 0, end: 5 };
    expect(activitySelection([job])).toEqual([job]);
  });

  it('two non-overlapping jobs → both selected', () => {
    const jobs: Job[] = [{ id: 1, start: 0, end: 3 }, { id: 2, start: 5, end: 8 }];
    expect(activitySelection(jobs)).toHaveLength(2);
  });

  it('two overlapping jobs → one selected', () => {
    const jobs: Job[] = [{ id: 1, start: 0, end: 5 }, { id: 2, start: 3, end: 8 }];
    expect(activitySelection(jobs)).toHaveLength(1);
  });

  it('result jobs do not overlap', () => {
    const jobs: Job[] = [
      { id: 1, start: 0, end: 6 }, { id: 2, start: 1, end: 4 },
      { id: 3, start: 3, end: 5 }, { id: 4, start: 5, end: 9 },
    ];
    const result = activitySelection(jobs);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].end).toBeLessThanOrEqual(result[i + 1].start);
    }
  });

  // String IDs preserved
  it('preserves string IDs', () => {
    const jobs: Job[] = [{ id: 'a', start: 0, end: 3 }, { id: 'b', start: 5, end: 8 }];
    const result = activitySelection(jobs);
    expect(result.map(j => j.id)).toEqual(expect.arrayContaining(['a', 'b']));
  });

  // n non-overlapping → all n selected
  for (let n = 1; n <= 30; n++) {
    it(`${n} non-overlapping jobs → all ${n} selected`, () => {
      const jobs: Job[] = Array.from({ length: n }, (_, i) => ({ id: i, start: i * 4, end: i * 4 + 3 }));
      expect(activitySelection(jobs)).toHaveLength(n);
    });
  }

  // n identical jobs → 1 selected
  for (let n = 2; n <= 15; n++) {
    it(`${n} identical jobs [0,5] → 1 selected`, () => {
      const jobs: Job[] = Array.from({ length: n }, (_, i) => ({ id: i, start: 0, end: 5 }));
      expect(activitySelection(jobs)).toHaveLength(1);
    });
  }

  // Result is subset of input
  for (let n = 3; n <= 15; n++) {
    it(`result is subset of input (n=${n})`, () => {
      const jobs: Job[] = Array.from({ length: n }, (_, i) => ({ id: i, start: i, end: i + 2 }));
      const result = activitySelection(jobs);
      for (const j of result) {
        expect(jobs.some(orig => orig.id === j.id)).toBe(true);
      }
    });
  }

  // Touching jobs both selected
  for (let n = 2; n <= 10; n++) {
    it(`${n} touching jobs (end=next start) → all ${n} selected`, () => {
      const jobs: Job[] = Array.from({ length: n }, (_, i) => ({ id: i, start: i * 5, end: i * 5 + 5 }));
      expect(activitySelection(jobs)).toHaveLength(n);
    });
  }

  // Staggered: only every other fits
  for (let k = 2; k <= 20; k++) {
    it(`staggered ${k} jobs (step 1, length 2) → ceil(${k}/2) selected`, () => {
      const jobs: Job[] = Array.from({ length: k }, (_, i) => ({ id: i, start: i, end: i + 2 }));
      expect(activitySelection(jobs)).toHaveLength(Math.ceil(k / 2));
    });
  }
});

// ---------------------------------------------------------------------------
// 8. intervalCoverage (50 tests)
// ---------------------------------------------------------------------------
describe('intervalCoverage', () => {
  it('single interval covering target → true', () => {
    expect(intervalCoverage([{ start: 0, end: 10 }], { start: 2, end: 8 })).toBe(true);
  });

  it('no intervals → false', () => {
    expect(intervalCoverage([], { start: 0, end: 5 })).toBe(false);
  });

  it('interval exactly matching target → true', () => {
    expect(intervalCoverage([{ start: 0, end: 5 }], { start: 0, end: 5 })).toBe(true);
  });

  it('gap in coverage → false', () => {
    expect(intervalCoverage([{ start: 0, end: 3 }, { start: 5, end: 10 }], { start: 0, end: 10 })).toBe(false);
  });

  it('two overlapping intervals covering target → true', () => {
    expect(intervalCoverage([{ start: 0, end: 6 }, { start: 4, end: 10 }], { start: 0, end: 10 })).toBe(true);
  });

  // Degenerate target (start >= end) is trivially covered
  for (let i = 0; i < 5; i++) {
    it(`degenerate target [${i},${i}] → true`, () => {
      expect(intervalCoverage([], { start: i, end: i })).toBe(true);
    });
  }

  // Chain of touching intervals covers contiguous range
  for (let n = 2; n <= 15; n++) {
    it(`chain of ${n} touching intervals covers [0,${n * 3}] → true`, () => {
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({ start: i * 3, end: i * 3 + 3 }));
      expect(intervalCoverage(ivs, { start: 0, end: n * 3 })).toBe(true);
    });
  }

  // Single interval not covering entire target → false
  for (let gap = 1; gap <= 5; gap++) {
    it(`single [0,${10 - gap}] does NOT cover [0,10] (gap=${gap})`, () => {
      expect(intervalCoverage([{ start: 0, end: 10 - gap }], { start: 0, end: 10 })).toBe(false);
    });
  }

  // Target partially covered from left but not right → false
  for (let i = 1; i <= 10; i++) {
    it(`[0,5] does NOT cover [0,${5 + i}]`, () => {
      expect(intervalCoverage([{ start: 0, end: 5 }], { start: 0, end: 5 + i })).toBe(false);
    });
  }

  // Intervals before target → false (if they don't cover it)
  for (let i = 1; i <= 5; i++) {
    it(`[${-i},5] and [7,12] does NOT cover [5,10] with gap at 6`, () => {
      expect(intervalCoverage([{ start: -i, end: 5 }, { start: 7, end: 12 }], { start: 5, end: 10 })).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 9. minIntervalsToCover (50 tests)
// ---------------------------------------------------------------------------
describe('minIntervalsTocover', () => {
  it('single interval exactly covering target → 1', () => {
    expect(minIntervalsTocover([{ start: 0, end: 10 }], { start: 0, end: 10 })).toBe(1);
  });

  it('impossible (no intervals) → -1', () => {
    expect(minIntervalsTocover([], { start: 0, end: 5 })).toBe(-1);
  });

  it('gap in coverage → -1', () => {
    expect(minIntervalsTocover([{ start: 0, end: 3 }, { start: 5, end: 10 }], { start: 0, end: 10 })).toBe(-1);
  });

  it('degenerate target → 0', () => {
    expect(minIntervalsTocover([], { start: 5, end: 5 })).toBe(0);
  });

  it('two intervals needed [0,6],[4,10] for [0,10] → 2', () => {
    expect(minIntervalsTocover([{ start: 0, end: 6 }, { start: 4, end: 10 }], { start: 0, end: 10 })).toBe(2);
  });

  // n touching intervals: needs n to cover [0, n*5]
  for (let n = 1; n <= 10; n++) {
    it(`${n} touching intervals: min to cover [0,${n * 5}] = ${n}`, () => {
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({ start: i * 5, end: i * 5 + 5 }));
      expect(minIntervalsTocover(ivs, { start: 0, end: n * 5 })).toBe(n);
    });
  }

  // Single interval larger than target → 1
  for (let extra = 1; extra <= 10; extra++) {
    it(`single [0,${10 + extra}] covering [0,10] → 1`, () => {
      expect(minIntervalsTocover([{ start: 0, end: 10 + extra }], { start: 0, end: 10 })).toBe(1);
    });
  }

  // Overlapping intervals where greedy picks best extension
  for (let n = 2; n <= 10; n++) {
    it(`${n} overlapping intervals [0..n], greedy finds optimal`, () => {
      // All start at 0, covering progressively more → 1 is optimal
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({ start: 0, end: (i + 1) * 2 }));
      expect(minIntervalsTocover(ivs, { start: 0, end: n * 2 })).toBe(1);
    });
  }

  // Multiple short intervals covering together
  for (let n = 3; n <= 10; n++) {
    it(`${n} unit intervals covering [0,${n}] → ${n}`, () => {
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({ start: i, end: i + 1 }));
      expect(minIntervalsTocover(ivs, { start: 0, end: n })).toBe(n);
    });
  }

  // Impossible: interval ends before target starts
  for (let i = 1; i <= 5; i++) {
    it(`intervals all before target → -1 (offset=${i})`, () => {
      const ivs: Interval[] = Array.from({ length: 3 }, (_, j) => ({ start: j, end: j + 1 }));
      expect(minIntervalsTocover(ivs, { start: 5 + i, end: 10 + i })).toBe(-1);
    });
  }
});

// ---------------------------------------------------------------------------
// 10. longestIncreasingSubsequenceLength (100 tests)
// ---------------------------------------------------------------------------
describe('longestIncreasingSubsequenceLength', () => {
  it('empty array → 0', () => expect(longestIncreasingSubsequenceLength([])).toBe(0));
  it('single element → 1', () => expect(longestIncreasingSubsequenceLength([5])).toBe(1));
  it('[10,9,2,5,3,7,101,18] → 4', () => expect(longestIncreasingSubsequenceLength([10, 9, 2, 5, 3, 7, 101, 18])).toBe(4));
  it('[0,1,0,3,2,3] → 4', () => expect(longestIncreasingSubsequenceLength([0, 1, 0, 3, 2, 3])).toBe(4));
  it('[7,7,7,7,7] → 1 (no strict increase)', () => expect(longestIncreasingSubsequenceLength([7, 7, 7, 7, 7])).toBe(1));
  it('[1,2,3,4,5] → 5 (already sorted)', () => expect(longestIncreasingSubsequenceLength([1, 2, 3, 4, 5])).toBe(5));
  it('[5,4,3,2,1] → 1 (strictly decreasing)', () => expect(longestIncreasingSubsequenceLength([5, 4, 3, 2, 1])).toBe(1));
  it('[1,3,2,4] → 3', () => expect(longestIncreasingSubsequenceLength([1, 3, 2, 4])).toBe(3));
  it('[2,5,1,8,3] → 3', () => expect(longestIncreasingSubsequenceLength([2, 5, 1, 8, 3])).toBe(3));

  // Sorted array of length n → LIS = n
  for (let n = 1; n <= 30; n++) {
    it(`sorted [1..${n}] → LIS = ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(longestIncreasingSubsequenceLength(arr)).toBe(n);
    });
  }

  // All same elements → LIS = 1
  for (let n = 2; n <= 15; n++) {
    it(`all-same array length ${n} → LIS = 1`, () => {
      const arr = Array.from({ length: n }, () => 42);
      expect(longestIncreasingSubsequenceLength(arr)).toBe(1);
    });
  }

  // Strictly decreasing → LIS = 1
  for (let n = 2; n <= 15; n++) {
    it(`strictly decreasing length ${n} → LIS = 1`, () => {
      const arr = Array.from({ length: n }, (_, i) => n - i);
      expect(longestIncreasingSubsequenceLength(arr)).toBe(1);
    });
  }

  // Alternating up-down
  for (let n = 2; n <= 20; n++) {
    it(`alternating [1,n,1,n,...] length ${n * 2} → LIS ≥ 2`, () => {
      const arr: number[] = [];
      for (let i = 0; i < n; i++) { arr.push(1); arr.push(100); }
      expect(longestIncreasingSubsequenceLength(arr)).toBeGreaterThanOrEqual(2);
    });
  }

  // Known: [3,5,6,2,5,4,19,5,6,7,12] → LIS = 6
  it('[3,5,6,2,5,4,19,5,6,7,12] → LIS = 6', () => {
    expect(longestIncreasingSubsequenceLength([3, 5, 6, 2, 5, 4, 19, 5, 6, 7, 12])).toBe(6);
  });

  // LIS of two-element strictly increasing → 2
  for (let i = 0; i < 15; i++) {
    it(`two strictly increasing [${i},${i + 1}] → LIS = 2`, () => {
      expect(longestIncreasingSubsequenceLength([i, i + 1])).toBe(2);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. trapRainWater (50 tests)
// ---------------------------------------------------------------------------
describe('trapRainWater', () => {
  it('[0,1,0,2,1,0,1,3,2,1,2,1] → 6', () => {
    expect(trapRainWater([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])).toBe(6);
  });

  it('[4,2,0,3,2,5] → 9', () => {
    expect(trapRainWater([4, 2, 0, 3, 2, 5])).toBe(9);
  });

  it('empty array → 0', () => expect(trapRainWater([])).toBe(0));
  it('single bar → 0', () => expect(trapRainWater([5])).toBe(0));
  it('two bars → 0', () => expect(trapRainWater([3, 4])).toBe(0));
  it('flat (all same) → 0', () => expect(trapRainWater([3, 3, 3, 3])).toBe(0));
  it('strictly increasing → 0', () => expect(trapRainWater([1, 2, 3, 4, 5])).toBe(0));
  it('strictly decreasing → 0', () => expect(trapRainWater([5, 4, 3, 2, 1])).toBe(0));
  it('[3,0,3] → 3', () => expect(trapRainWater([3, 0, 3])).toBe(3));
  it('[3,0,0,3] → 6', () => expect(trapRainWater([3, 0, 0, 3])).toBe(6));
  it('[2,0,2] → 2', () => expect(trapRainWater([2, 0, 2])).toBe(2));
  it('[1,0,1] → 1', () => expect(trapRainWater([1, 0, 1])).toBe(1));
  it('[5,0,5] → 5', () => expect(trapRainWater([5, 0, 5])).toBe(5));

  // [h,0,0,...,0,h] with n zeros → h*n
  for (let n = 1; n <= 15; n++) {
    it(`[3, ${n} zeros, 3] → ${3 * n} water`, () => {
      const arr = [3, ...Array(n).fill(0), 3];
      expect(trapRainWater(arr)).toBe(3 * n);
    });
  }

  // Bounded by the lower of the two walls
  for (let h = 1; h <= 10; h++) {
    it(`[${h + 2},0,${h}] → ${h} water (limited by right wall)`, () => {
      expect(trapRainWater([h + 2, 0, h])).toBe(h);
    });
  }

  // All zeros → 0
  for (let n = 1; n <= 5; n++) {
    it(`all-zeros array length ${n + 2} → 0 water`, () => {
      const arr = Array(n + 2).fill(0);
      expect(trapRainWater(arr)).toBe(0);
    });
  }

  // [1,0,2] → 1
  it('[1,0,2] → 1', () => expect(trapRainWater([1, 0, 2])).toBe(1));

  // Result is always non-negative
  for (let i = 0; i < 5; i++) {
    it(`result is non-negative for random pattern ${i}`, () => {
      const arr = [i + 1, 0, i, 0, i + 2];
      expect(trapRainWater(arr)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 12. jobSchedulingMaxProfit (50 tests)
// ---------------------------------------------------------------------------
describe('jobSchedulingMaxProfit', () => {
  it('empty input → 0', () => expect(jobSchedulingMaxProfit([], [], [])).toBe(0));

  it('single job → its profit', () => {
    expect(jobSchedulingMaxProfit([1], [3], [10])).toBe(10);
  });

  it('two non-overlapping → sum of profits', () => {
    expect(jobSchedulingMaxProfit([1, 4], [3, 6], [5, 8])).toBe(13);
  });

  it('two overlapping → picks higher profit', () => {
    expect(jobSchedulingMaxProfit([1, 2], [4, 5], [3, 10])).toBe(10);
  });

  it('classic: start=[1,2,3,3], end=[3,5,10,6], profit=[50,10,40,70] → 120', () => {
    expect(jobSchedulingMaxProfit([1, 2, 3, 3], [3, 5, 10, 6], [50, 10, 40, 70])).toBe(120);
  });

  it('LeetCode example: start=[1,2,3,4,6], end=[3,5,10,6,9], profit=[20,20,100,70,60] → 150', () => {
    expect(jobSchedulingMaxProfit([1, 2, 3, 4, 6], [3, 5, 10, 6, 9], [20, 20, 100, 70, 60])).toBe(150);
  });

  it('LeetCode example 2: start=[1,1,1], end=[2,3,4], profit=[5,6,4] → 6', () => {
    expect(jobSchedulingMaxProfit([1, 1, 1], [2, 3, 4], [5, 6, 4])).toBe(6);
  });

  // n non-overlapping → sum of all profits
  for (let n = 1; n <= 15; n++) {
    it(`${n} non-overlapping jobs → sum of all profits`, () => {
      const starts = Array.from({ length: n }, (_, i) => i * 10);
      const ends = Array.from({ length: n }, (_, i) => i * 10 + 5);
      const profs = Array.from({ length: n }, (_, i) => (i + 1) * 3);
      const total = profs.reduce((s, p) => s + p, 0);
      expect(jobSchedulingMaxProfit(starts, ends, profs)).toBe(total);
    });
  }

  // n identical jobs → max single profit
  for (let n = 2; n <= 10; n++) {
    it(`${n} identical overlapping jobs → max single profit`, () => {
      const starts = Array.from({ length: n }, () => 0);
      const ends = Array.from({ length: n }, () => 5);
      const profs = Array.from({ length: n }, (_, i) => (i + 1) * 5);
      expect(jobSchedulingMaxProfit(starts, ends, profs)).toBe(n * 5); // last job has highest profit
    });
  }

  // All jobs with profit 0 → 0
  for (let n = 1; n <= 5; n++) {
    it(`${n} jobs all with profit 0 → 0`, () => {
      const starts = Array.from({ length: n }, (_, i) => i * 3);
      const ends = Array.from({ length: n }, (_, i) => i * 3 + 2);
      const profs = Array.from({ length: n }, () => 0);
      expect(jobSchedulingMaxProfit(starts, ends, profs)).toBe(0);
    });
  }

  // Result must be at least max single profit
  for (let n = 2; n <= 10; n++) {
    it(`result >= max single profit for ${n} jobs`, () => {
      const starts = Array.from({ length: n }, (_, i) => i * 2);
      const ends = Array.from({ length: n }, (_, i) => i * 2 + 3);
      const profs = Array.from({ length: n }, (_, i) => (i + 1) * 7);
      const maxP = Math.max(...profs);
      expect(jobSchedulingMaxProfit(starts, ends, profs)).toBeGreaterThanOrEqual(maxP);
    });
  }

  // Chain overlapping greedily: alternating heavy/light with compatibility
  for (let k = 2; k <= 8; k++) {
    it(`chain of ${k} compatible jobs → sum of profits`, () => {
      const starts = Array.from({ length: k }, (_, i) => i * 5);
      const ends = Array.from({ length: k }, (_, i) => i * 5 + 5);
      const profs = Array.from({ length: k }, () => 10);
      expect(jobSchedulingMaxProfit(starts, ends, profs)).toBe(k * 10);
    });
  }
});

// ---------------------------------------------------------------------------
// 13. partitionIntoMinChains (50 tests)
// ---------------------------------------------------------------------------
describe('partitionIntoMinChains', () => {
  it('empty input → empty', () => expect(partitionIntoMinChains([])).toEqual([]));

  it('single interval → one chain', () => {
    const result = partitionIntoMinChains([{ start: 0, end: 5 }]);
    expect(result).toHaveLength(1);
    expect(result[0]).toHaveLength(1);
  });

  it('two non-overlapping → one chain', () => {
    const result = partitionIntoMinChains([{ start: 0, end: 3 }, { start: 5, end: 8 }]);
    expect(result).toHaveLength(1);
  });

  it('two overlapping → two chains', () => {
    const result = partitionIntoMinChains([{ start: 0, end: 5 }, { start: 2, end: 7 }]);
    expect(result).toHaveLength(2);
  });

  it('three mutual overlapping → three chains', () => {
    const result = partitionIntoMinChains([
      { start: 0, end: 10 }, { start: 1, end: 9 }, { start: 2, end: 8 },
    ]);
    expect(result).toHaveLength(3);
  });

  // n non-overlapping → 1 chain
  for (let n = 2; n <= 20; n++) {
    it(`${n} sequential non-overlapping → 1 chain`, () => {
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({ start: i * 5, end: i * 5 + 4 }));
      expect(partitionIntoMinChains(ivs)).toHaveLength(1);
    });
  }

  // n simultaneous → n chains
  for (let n = 2; n <= 10; n++) {
    it(`${n} identical intervals → ${n} chains`, () => {
      const ivs: Interval[] = Array.from({ length: n }, () => ({ start: 0, end: 5 }));
      expect(partitionIntoMinChains(ivs)).toHaveLength(n);
    });
  }

  // Each interval in each chain should not overlap with others in same chain
  for (let n = 3; n <= 10; n++) {
    it(`no overlaps within any chain for ${n} intervals`, () => {
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({ start: i % 3, end: (i % 3) + 2 }));
      const chains = partitionIntoMinChains(ivs);
      for (const chain of chains) {
        for (let i = 0; i < chain.length - 1; i++) {
          expect(chain[i].end).toBeLessThanOrEqual(chain[i + 1].start);
        }
      }
    });
  }

  // All intervals accounted for in partition
  for (let n = 2; n <= 10; n++) {
    it(`partition covers all ${n} intervals`, () => {
      const ivs: Interval[] = Array.from({ length: n }, (_, i) => ({ start: i, end: i + 2 }));
      const chains = partitionIntoMinChains(ivs);
      const total = chains.reduce((sum, chain) => sum + chain.length, 0);
      expect(total).toBe(n);
    });
  }

  // Two groups: k concurrent, then k more concurrent → 2 chains max needed
  for (let k = 2; k <= 8; k++) {
    it(`two groups of ${k} concurrent → ${k} chains`, () => {
      const groupA: Interval[] = Array.from({ length: k }, () => ({ start: 0, end: 5 }));
      const groupB: Interval[] = Array.from({ length: k }, () => ({ start: 6, end: 10 }));
      // groupA needs k chains, each compatible with one from groupB
      const result = partitionIntoMinChains([...groupA, ...groupB]);
      expect(result).toHaveLength(k);
    });
  }
});
