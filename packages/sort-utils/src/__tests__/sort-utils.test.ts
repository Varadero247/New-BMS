// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  quickSort,
  mergeSort,
  heapSort,
  insertionSort,
  bubbleSort,
  selectionSort,
  countingSort,
  radixSort,
  bucketSort,
  shellSort,
  sortBy,
  sortByMultiple,
  sortByFn,
  stableSort,
  binarySearch,
  binarySearchLeft,
  binarySearchRight,
  interpolationSearch,
  rankItems,
  topN,
  bottomN,
  isSorted,
  isSortedDesc,
  shuffle,
  naturalSort,
} from '../sort-utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function makeAscArr(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i + 1);
}

function makeDescArr(n: number): number[] {
  return Array.from({ length: n }, (_, i) => n - i);
}

/** Simple deterministic pseudo-random sequence for reproducible tests */
function lcg(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s;
  };
}

function makeRandomArr(n: number, seed = 42): number[] {
  const rng = lcg(seed);
  return Array.from({ length: n }, () => rng() % 1000);
}

// Reference sort (built-in, stable in V8)
function refSort(arr: number[]): number[] {
  return [...arr].sort((a, b) => a - b);
}

// All comparison-based sorters under test
type AnySort = (arr: readonly number[], cmp?: (a: number, b: number) => number) => number[];
const comparisonSorters: Array<[string, AnySort]> = [
  ['quickSort', quickSort],
  ['mergeSort', mergeSort],
  ['heapSort', heapSort],
  ['insertionSort', insertionSort],
  ['bubbleSort', bubbleSort],
  ['selectionSort', selectionSort],
  ['shellSort', shellSort],
];

// ---------------------------------------------------------------------------
// BLOCK 1: quickSort — sizes 1..100 (100 tests)
// ---------------------------------------------------------------------------
describe('quickSort — sizes 1..100', () => {
  for (let i = 1; i <= 100; i++) {
    it(`correctly sorts a random array of size ${i}`, () => {
      const arr = makeRandomArr(i, i);
      const result = quickSort(arr);
      expect(result).toEqual(refSort(arr));
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 2: mergeSort — sizes 1..100 (100 tests)
// ---------------------------------------------------------------------------
describe('mergeSort — sizes 1..100', () => {
  for (let i = 1; i <= 100; i++) {
    it(`correctly sorts a random array of size ${i}`, () => {
      const arr = makeRandomArr(i, i * 2);
      const result = mergeSort(arr);
      expect(result).toEqual(refSort(arr));
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 3: heapSort — sizes 1..50 (50 tests)
// ---------------------------------------------------------------------------
describe('heapSort — sizes 1..50', () => {
  for (let i = 1; i <= 50; i++) {
    it(`correctly sorts a random array of size ${i}`, () => {
      const arr = makeRandomArr(i, i * 3);
      expect(heapSort(arr)).toEqual(refSort(arr));
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 4: insertionSort — sizes 1..50 (50 tests)
// ---------------------------------------------------------------------------
describe('insertionSort — sizes 1..50', () => {
  for (let i = 1; i <= 50; i++) {
    it(`correctly sorts a random array of size ${i}`, () => {
      const arr = makeRandomArr(i, i * 4);
      expect(insertionSort(arr)).toEqual(refSort(arr));
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 5: bubbleSort — sizes 1..30 (30 tests)
// ---------------------------------------------------------------------------
describe('bubbleSort — sizes 1..30', () => {
  for (let i = 1; i <= 30; i++) {
    it(`correctly sorts a random array of size ${i}`, () => {
      const arr = makeRandomArr(i, i * 5);
      expect(bubbleSort(arr)).toEqual(refSort(arr));
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 6: selectionSort — sizes 1..30 (30 tests)
// ---------------------------------------------------------------------------
describe('selectionSort — sizes 1..30', () => {
  for (let i = 1; i <= 30; i++) {
    it(`correctly sorts a random array of size ${i}`, () => {
      const arr = makeRandomArr(i, i * 6);
      expect(selectionSort(arr)).toEqual(refSort(arr));
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 7: shellSort — sizes 1..50 (50 tests)
// ---------------------------------------------------------------------------
describe('shellSort — sizes 1..50', () => {
  for (let i = 1; i <= 50; i++) {
    it(`correctly sorts a random array of size ${i}`, () => {
      const arr = makeRandomArr(i, i * 7);
      expect(shellSort(arr)).toEqual(refSort(arr));
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 8: countingSort — values 0..99, 50 variants (50 tests)
// ---------------------------------------------------------------------------
describe('countingSort — 50 random non-negative arrays', () => {
  for (let i = 1; i <= 50; i++) {
    it(`countingSort variant ${i}`, () => {
      const arr = makeRandomArr(i + 5, i * 8).map((v) => v % 100);
      expect(countingSort(arr)).toEqual(refSort(arr));
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 9: radixSort — 50 variants (50 tests)
// ---------------------------------------------------------------------------
describe('radixSort — 50 random non-negative arrays', () => {
  for (let i = 1; i <= 50; i++) {
    it(`radixSort variant ${i}`, () => {
      const arr = makeRandomArr(i + 5, i * 9).map((v) => v % 10000);
      expect(radixSort(arr)).toEqual(refSort(arr));
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 10: bucketSort — 50 variants (50 tests)
// ---------------------------------------------------------------------------
describe('bucketSort — 50 random arrays', () => {
  for (let i = 1; i <= 50; i++) {
    it(`bucketSort variant ${i}`, () => {
      const arr = makeRandomArr(i + 5, i * 10).map((v) => v % 500);
      expect(bucketSort(arr)).toEqual(refSort(arr));
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 11: All sorters agree on same input — 50 arrays × 7 sorters (350 tests)
// ---------------------------------------------------------------------------
describe('all comparison sorters agree on same input', () => {
  for (let i = 0; i < 50; i++) {
    const arr = makeRandomArr(20 + i, i * 11);
    const expected = refSort(arr);
    for (const [name, sorter] of comparisonSorters) {
      it(`${name} agrees on array #${i + 1}`, () => {
        expect(sorter(arr)).toEqual(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// BLOCK 12: binarySearch — finds index correctly, sizes 1..50 (50 tests)
// ---------------------------------------------------------------------------
describe('binarySearch — finds target in sorted arrays of size 1..50', () => {
  for (let i = 1; i <= 50; i++) {
    it(`binarySearch finds middle element of size ${i}`, () => {
      const arr = makeAscArr(i);
      const target = arr[Math.floor(i / 2)];
      const idx = binarySearch(arr, target);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(arr[idx]).toBe(target);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 13: binarySearch not found — 50 tests
// ---------------------------------------------------------------------------
describe('binarySearch — returns -1 when not found (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`binarySearch returns -1 for missing value, array size ${i}`, () => {
      const arr = makeAscArr(i);
      expect(binarySearch(arr, i + 1000)).toBe(-1);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 14: binarySearchLeft / binarySearchRight — 50 tests each (100 tests)
// ---------------------------------------------------------------------------
describe('binarySearchLeft — 50 tests', () => {
  for (let i = 1; i <= 50; i++) {
    it(`binarySearchLeft insertion point for size ${i}`, () => {
      const arr = makeAscArr(i);
      // Inserting i+1 should go at the end
      const pos = binarySearchLeft(arr, i + 1);
      expect(pos).toBe(i);
    });
  }
});

describe('binarySearchRight — 50 tests', () => {
  for (let i = 1; i <= 50; i++) {
    it(`binarySearchRight insertion point for size ${i}`, () => {
      const arr = makeAscArr(i);
      // Target 1 should give right-bound of 1 (all 1s are at index 0, right bound = 1)
      const pos = binarySearchRight(arr, 1);
      expect(pos).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 15: interpolationSearch — 30 tests
// ---------------------------------------------------------------------------
describe('interpolationSearch — 30 uniform arrays', () => {
  for (let i = 1; i <= 30; i++) {
    it(`interpolationSearch finds element in uniform array of size ${i + 5}`, () => {
      const size = i + 5;
      const arr = makeAscArr(size);
      const target = arr[Math.floor(size / 2)];
      const idx = interpolationSearch(arr, target);
      expect(arr[idx]).toBe(target);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 16: isSorted / isSortedDesc — 50 tests each (100 tests)
// ---------------------------------------------------------------------------
describe('isSorted — 50 ascending arrays (should return true)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`isSorted returns true for ascending array size ${i}`, () => {
      expect(isSorted(makeAscArr(i))).toBe(true);
    });
  }
});

describe('isSortedDesc — 50 descending arrays (should return true)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`isSortedDesc returns true for descending array size ${i}`, () => {
      expect(isSortedDesc(makeDescArr(i))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 17: isSorted returns false for unsorted arrays — 30 tests
// ---------------------------------------------------------------------------
describe('isSorted returns false for reversed arrays', () => {
  for (let i = 2; i <= 31; i++) {
    it(`isSorted returns false for descending array size ${i}`, () => {
      expect(isSorted(makeDescArr(i))).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 18: No mutation — 7 sorters × 10 arrays (70 tests)
// ---------------------------------------------------------------------------
describe('sorters never mutate the original array', () => {
  const sorterList: Array<[string, (arr: readonly number[]) => number[]]> = [
    ['quickSort', quickSort],
    ['mergeSort', mergeSort],
    ['heapSort', heapSort],
    ['insertionSort', insertionSort],
    ['bubbleSort', bubbleSort],
    ['selectionSort', selectionSort],
    ['shellSort', shellSort],
  ];
  for (let i = 1; i <= 10; i++) {
    const arr = makeRandomArr(i * 3, i * 12);
    const frozen = [...arr];
    for (const [name, sorter] of sorterList) {
      it(`${name} does not mutate original array #${i}`, () => {
        sorter(arr);
        expect(arr).toEqual(frozen);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// BLOCK 19: Edge cases — empty arrays (10 sorters, 10 tests)
// ---------------------------------------------------------------------------
describe('edge case: empty arrays', () => {
  it('quickSort([]) returns []', () => expect(quickSort([])).toEqual([]));
  it('mergeSort([]) returns []', () => expect(mergeSort([])).toEqual([]));
  it('heapSort([]) returns []', () => expect(heapSort([])).toEqual([]));
  it('insertionSort([]) returns []', () => expect(insertionSort([])).toEqual([]));
  it('bubbleSort([]) returns []', () => expect(bubbleSort([])).toEqual([]));
  it('selectionSort([]) returns []', () => expect(selectionSort([])).toEqual([]));
  it('shellSort([]) returns []', () => expect(shellSort([])).toEqual([]));
  it('countingSort([]) returns []', () => expect(countingSort([])).toEqual([]));
  it('radixSort([]) returns []', () => expect(radixSort([])).toEqual([]));
  it('bucketSort([]) returns []', () => expect(bucketSort([])).toEqual([]));
});

// ---------------------------------------------------------------------------
// BLOCK 20: Edge cases — single element (10 tests)
// ---------------------------------------------------------------------------
describe('edge case: single element', () => {
  it('quickSort([42]) returns [42]', () => expect(quickSort([42])).toEqual([42]));
  it('mergeSort([42]) returns [42]', () => expect(mergeSort([42])).toEqual([42]));
  it('heapSort([42]) returns [42]', () => expect(heapSort([42])).toEqual([42]));
  it('insertionSort([42]) returns [42]', () => expect(insertionSort([42])).toEqual([42]));
  it('bubbleSort([42]) returns [42]', () => expect(bubbleSort([42])).toEqual([42]));
  it('selectionSort([42]) returns [42]', () => expect(selectionSort([42])).toEqual([42]));
  it('shellSort([42]) returns [42]', () => expect(shellSort([42])).toEqual([42]));
  it('countingSort([5]) returns [5]', () => expect(countingSort([5])).toEqual([5]));
  it('radixSort([5]) returns [5]', () => expect(radixSort([5])).toEqual([5]));
  it('bucketSort([5]) returns [5]', () => expect(bucketSort([5])).toEqual([5]));
});

// ---------------------------------------------------------------------------
// BLOCK 21: Already sorted input — all sorters (7 × 5 = 35 tests)
// ---------------------------------------------------------------------------
describe('already sorted input remains sorted', () => {
  const sizes = [1, 5, 10, 20, 50];
  for (const size of sizes) {
    const arr = makeAscArr(size);
    for (const [name, sorter] of comparisonSorters) {
      it(`${name} handles already sorted array of size ${size}`, () => {
        const result = sorter(arr);
        expect(isSorted(result)).toBe(true);
        expect(result).toEqual(arr);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// BLOCK 22: Reverse sorted input — all sorters (7 × 5 = 35 tests)
// ---------------------------------------------------------------------------
describe('reverse sorted input', () => {
  const sizes = [1, 5, 10, 20, 50];
  for (const size of sizes) {
    const arr = makeDescArr(size);
    const expected = makeAscArr(size);
    for (const [name, sorter] of comparisonSorters) {
      it(`${name} handles reverse sorted array of size ${size}`, () => {
        expect(sorter(arr)).toEqual(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// BLOCK 23: All duplicates — all sorters (7 × 5 = 35 tests)
// ---------------------------------------------------------------------------
describe('array of all identical elements', () => {
  const sizes = [1, 5, 10, 20, 50];
  for (const size of sizes) {
    const arr = new Array(size).fill(7);
    for (const [name, sorter] of comparisonSorters) {
      it(`${name} handles all-duplicates array of size ${size}`, () => {
        expect(sorter(arr)).toEqual(arr);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// BLOCK 24: sortBy / sortByMultiple / sortByFn — 30 tests each (90 tests)
// ---------------------------------------------------------------------------
interface Item {
  name: string;
  score: number;
  rank: number;
}

function makeItems(n: number): Item[] {
  const rng = lcg(99 + n);
  return Array.from({ length: n }, (_, i) => ({
    name: `item${i}`,
    score: rng() % 100,
    rank: rng() % 10,
  }));
}

describe('sortBy — 30 object arrays', () => {
  for (let i = 2; i <= 31; i++) {
    it(`sortBy score asc for array of ${i} items`, () => {
      const items = makeItems(i);
      const sorted = sortBy(items, 'score', 'asc');
      expect(isSorted(sorted.map((x) => x.score))).toBe(true);
    });
  }
});

describe('sortBy desc — 30 object arrays', () => {
  for (let i = 2; i <= 31; i++) {
    it(`sortBy score desc for array of ${i} items`, () => {
      const items = makeItems(i);
      const sorted = sortBy(items, 'score', 'desc');
      expect(isSortedDesc(sorted.map((x) => x.score))).toBe(true);
    });
  }
});

describe('sortByMultiple — 30 object arrays', () => {
  for (let i = 2; i <= 31; i++) {
    it(`sortByMultiple rank asc then score asc for ${i} items`, () => {
      const items = makeItems(i);
      const sorted = sortByMultiple(items, [
        { key: 'rank', order: 'asc' },
        { key: 'score', order: 'asc' },
      ]);
      // Ranks must be non-decreasing
      expect(isSorted(sorted.map((x) => x.rank))).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 25: sortByFn — 20 tests
// ---------------------------------------------------------------------------
describe('sortByFn — 20 tests', () => {
  for (let i = 1; i <= 20; i++) {
    it(`sortByFn by string length asc for ${i + 2} items`, () => {
      const words = Array.from({ length: i + 2 }, (_, j) => 'x'.repeat((j + 1) % 15 + 1));
      const sorted = sortByFn(words, (w) => w.length, 'asc');
      const lengths = sorted.map((w) => w.length);
      expect(isSorted(lengths)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 26: stableSort stability — 20 tests
// ---------------------------------------------------------------------------
describe('stableSort preserves relative order of equal elements', () => {
  for (let i = 1; i <= 20; i++) {
    it(`stableSort stability test #${i}`, () => {
      const items = [
        { v: 1, id: 1 },
        { v: 2, id: 2 },
        { v: 1, id: 3 },
        { v: 2, id: 4 },
        { v: 1, id: 5 },
      ];
      const sorted = stableSort(items, (a, b) => a.v - b.v);
      const ones = sorted.filter((x) => x.v === 1).map((x) => x.id);
      const twos = sorted.filter((x) => x.v === 2).map((x) => x.id);
      expect(ones).toEqual([1, 3, 5]);
      expect(twos).toEqual([2, 4]);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 27: rankItems — 30 tests
// ---------------------------------------------------------------------------
describe('rankItems — 30 tests', () => {
  for (let i = 1; i <= 30; i++) {
    it(`rankItems produces ranks of correct length for size ${i}`, () => {
      const arr = makeRandomArr(i, i * 13);
      const ranks = rankItems(arr);
      expect(ranks).toHaveLength(i);
      // All ranks must be in range [1, i]
      for (const r of ranks) {
        expect(r).toBeGreaterThanOrEqual(1);
        expect(r).toBeLessThanOrEqual(i);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 28: topN and bottomN — 30 tests each (60 tests)
// ---------------------------------------------------------------------------
describe('topN — 30 tests', () => {
  for (let i = 1; i <= 30; i++) {
    const n = Math.max(1, Math.floor(i / 2));
    it(`topN(${n}) from array of size ${i + n}`, () => {
      const arr = makeRandomArr(i + n, i * 14);
      const top = topN(arr, n);
      expect(top).toHaveLength(n);
      // All top values must be >= min of sorted top
      const sorted = refSort(arr);
      const expectedMin = sorted[sorted.length - n];
      for (const v of top) expect(v).toBeGreaterThanOrEqual(expectedMin);
    });
  }
});

describe('bottomN — 30 tests', () => {
  for (let i = 1; i <= 30; i++) {
    const n = Math.max(1, Math.floor(i / 2));
    it(`bottomN(${n}) from array of size ${i + n}`, () => {
      const arr = makeRandomArr(i + n, i * 15);
      const bottom = bottomN(arr, n);
      expect(bottom).toHaveLength(n);
      const sorted = refSort(arr);
      const expectedMax = sorted[n - 1];
      for (const v of bottom) expect(v).toBeLessThanOrEqual(expectedMax);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 29: shuffle — deterministic with seed (30 tests)
// ---------------------------------------------------------------------------
describe('shuffle — deterministic with seed', () => {
  for (let i = 1; i <= 30; i++) {
    it(`shuffle seed=${i} is deterministic and a permutation`, () => {
      const arr = makeAscArr(i * 2);
      const s1 = shuffle(arr, i);
      const s2 = shuffle(arr, i);
      expect(s1).toEqual(s2);
      // Is permutation: sorted result equals original
      expect(refSort(s1)).toEqual(arr);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 30: naturalSort — 30 tests
// ---------------------------------------------------------------------------
describe('naturalSort — 30 file-name sorting tests', () => {
  for (let i = 1; i <= 30; i++) {
    it(`naturalSort orders file${i} before file${i + 1} and file${i} before file${i * 10}`, () => {
      expect(naturalSort(`file${i}`, `file${i + 1}`)).toBeLessThan(0);
      if (i > 1) {
        expect(naturalSort(`file${i}`, `file${i * 10}`)).toBeLessThan(0);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 31: naturalSort — compare with lexicographic baseline (20 tests)
// ---------------------------------------------------------------------------
describe('naturalSort — numeric ordering beats lexicographic for numeric strings', () => {
  for (let i = 1; i <= 20; i++) {
    it(`naturalSort: "item${i}" < "item${i * 10}" but lexicographic may differ`, () => {
      const a = `item${i}`;
      const b = `item${i * 10}`;
      // Natural sort should put smaller number first
      expect(naturalSort(a, b)).toBeLessThan(0);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 32: countingSort edge cases (10 tests)
// ---------------------------------------------------------------------------
describe('countingSort — edge cases', () => {
  it('sorts all-zero array', () => expect(countingSort([0, 0, 0])).toEqual([0, 0, 0]));
  it('sorts single element [0]', () => expect(countingSort([0])).toEqual([0]));
  it('sorts [1, 0]', () => expect(countingSort([1, 0])).toEqual([0, 1]));
  it('throws on negative number', () => expect(() => countingSort([-1, 2])).toThrow(RangeError));
  it('handles large values', () => {
    const arr = [100, 50, 75, 25, 0];
    expect(countingSort(arr)).toEqual(refSort(arr));
  });
  it('handles array with repeated values', () => {
    expect(countingSort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3]);
  });
  it('handles single unique value repeated', () => {
    expect(countingSort([5, 5, 5, 5])).toEqual([5, 5, 5, 5]);
  });
  it('handles sorted input', () => {
    expect(countingSort([1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });
  it('handles reverse sorted input', () => {
    expect(countingSort([5, 4, 3, 2, 1])).toEqual([1, 2, 3, 4, 5]);
  });
  it('handles two-element array', () => {
    expect(countingSort([2, 1])).toEqual([1, 2]);
  });
});

// ---------------------------------------------------------------------------
// BLOCK 33: radixSort edge cases (10 tests)
// ---------------------------------------------------------------------------
describe('radixSort — edge cases', () => {
  it('sorts [0]', () => expect(radixSort([0])).toEqual([0]));
  it('throws on negative', () => expect(() => radixSort([-1])).toThrow(RangeError));
  it('handles all zeros', () => expect(radixSort([0, 0, 0])).toEqual([0, 0, 0]));
  it('handles large numbers', () => {
    const arr = [99999, 10000, 55555, 1];
    expect(radixSort(arr)).toEqual(refSort(arr));
  });
  it('handles repeated elements', () => {
    expect(radixSort([3, 1, 2, 1, 3])).toEqual([1, 1, 2, 3, 3]);
  });
  it('single value', () => expect(radixSort([42])).toEqual([42]));
  it('two elements in order', () => expect(radixSort([1, 2])).toEqual([1, 2]));
  it('two elements out of order', () => expect(radixSort([2, 1])).toEqual([1, 2]));
  it('handles 0 along with positives', () => expect(radixSort([5, 0, 3])).toEqual([0, 3, 5]));
  it('handles array of length 10', () => {
    const arr = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    expect(radixSort(arr)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});

// ---------------------------------------------------------------------------
// BLOCK 34: bucketSort edge cases (10 tests)
// ---------------------------------------------------------------------------
describe('bucketSort — edge cases', () => {
  it('sorts floats in [0,1)', () => {
    const arr = [0.9, 0.1, 0.5, 0.3, 0.7];
    expect(bucketSort(arr)).toEqual([0.1, 0.3, 0.5, 0.7, 0.9]);
  });
  it('handles all same values', () => expect(bucketSort([5, 5, 5])).toEqual([5, 5, 5]));
  it('handles single value', () => expect(bucketSort([3])).toEqual([3]));
  it('handles two values', () => expect(bucketSort([2, 1])).toEqual([1, 2]));
  it('handles already sorted', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(bucketSort(arr)).toEqual(arr);
  });
  it('handles reverse sorted', () => {
    const arr = [5, 4, 3, 2, 1];
    expect(bucketSort(arr)).toEqual([1, 2, 3, 4, 5]);
  });
  it('handles negative numbers (normalised)', () => {
    const arr = [-5, -3, -1, -4, -2];
    expect(bucketSort(arr)).toEqual([-5, -4, -3, -2, -1]);
  });
  it('handles custom bucketCount=1', () => {
    const arr = [3, 1, 2];
    expect(bucketSort(arr, 1)).toEqual([1, 2, 3]);
  });
  it('handles large bucketCount', () => {
    const arr = [3, 1, 2];
    expect(bucketSort(arr, 100)).toEqual([1, 2, 3]);
  });
  it('matches refSort on random floats', () => {
    const arr = [0.55, 0.12, 0.89, 0.34, 0.67, 0.23, 0.78, 0.45];
    expect(bucketSort(arr)).toEqual([...arr].sort((a, b) => a - b));
  });
});

// ---------------------------------------------------------------------------
// BLOCK 35: binarySearch — custom comparator (20 tests)
// ---------------------------------------------------------------------------
describe('binarySearch with custom comparator — 20 tests', () => {
  for (let i = 1; i <= 20; i++) {
    it(`binarySearch with reverse comparator on descending array of size ${i + 1}`, () => {
      const arr = makeDescArr(i + 1);
      const target = arr[Math.floor(i / 2)];
      const idx = binarySearch(arr, target, (a, b) => b - a);
      expect(idx).toBeGreaterThanOrEqual(0);
      expect(arr[idx]).toBe(target);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 36: interpolationSearch edge cases (10 tests)
// ---------------------------------------------------------------------------
describe('interpolationSearch — edge cases', () => {
  it('returns -1 for empty array', () => expect(interpolationSearch([], 5)).toBe(-1));
  it('finds element in single-element array', () => expect(interpolationSearch([5], 5)).toBe(0));
  it('returns -1 for single-element array when not found', () => expect(interpolationSearch([5], 3)).toBe(-1));
  it('finds first element', () => expect(interpolationSearch([1, 2, 3, 4, 5], 1)).toBe(0));
  it('finds last element', () => expect(interpolationSearch([1, 2, 3, 4, 5], 5)).toBe(4));
  it('finds middle element', () => expect(interpolationSearch([1, 2, 3, 4, 5], 3)).toBe(2));
  it('returns -1 for value below range', () => expect(interpolationSearch([2, 4, 6], 1)).toBe(-1));
  it('returns -1 for value above range', () => expect(interpolationSearch([2, 4, 6], 10)).toBe(-1));
  it('finds in large uniform array', () => {
    const arr = makeAscArr(100);
    expect(arr[interpolationSearch(arr, 50)]).toBe(50);
  });
  it('handles duplicate values — finds one of them', () => {
    const arr = [1, 2, 2, 2, 3];
    const idx = interpolationSearch(arr, 2);
    expect(arr[idx]).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// BLOCK 37: rankItems with ties (10 tests)
// ---------------------------------------------------------------------------
describe('rankItems — tie handling', () => {
  it('all same values get same average rank', () => {
    const ranks = rankItems([5, 5, 5]);
    expect(ranks[0]).toBe(ranks[1]);
    expect(ranks[1]).toBe(ranks[2]);
  });
  it('distinct values get ranks 1,2,3', () => {
    const ranks = rankItems([10, 20, 30]);
    // smallest → rank 1
    expect(ranks[0]).toBe(1);
    expect(ranks[1]).toBe(2);
    expect(ranks[2]).toBe(3);
  });
  it('tie of two: average rank is 1.5', () => {
    const ranks = rankItems([5, 5, 10]);
    expect(ranks[0]).toBe(1.5);
    expect(ranks[1]).toBe(1.5);
    expect(ranks[2]).toBe(3);
  });
  it('length matches input length', () => {
    for (let i = 0; i < 7; i++) {
      const arr = makeRandomArr(i + 1, i * 17);
      expect(rankItems(arr)).toHaveLength(i + 1);
    }
  });
});

// ---------------------------------------------------------------------------
// BLOCK 38: topN / bottomN edge cases (10 tests)
// ---------------------------------------------------------------------------
describe('topN and bottomN — edge cases', () => {
  it('topN(0) returns []', () => expect(topN([1, 2, 3], 0)).toEqual([]));
  it('bottomN(0) returns []', () => expect(bottomN([1, 2, 3], 0)).toEqual([]));
  it('topN equal to array length returns all sorted desc', () => {
    expect(topN([3, 1, 2], 3)).toEqual([3, 2, 1]);
  });
  it('bottomN equal to array length returns all sorted asc', () => {
    expect(bottomN([3, 1, 2], 3)).toEqual([1, 2, 3]);
  });
  it('topN(1) returns max element', () => {
    expect(topN([3, 1, 4, 1, 5], 1)).toEqual([5]);
  });
  it('bottomN(1) returns min element', () => {
    expect(bottomN([3, 1, 4, 1, 5], 1)).toEqual([1]);
  });
  it('topN and bottomN cover full array', () => {
    const arr = [5, 3, 1, 4, 2];
    const top3 = topN(arr, 3);
    const bot2 = bottomN(arr, 2);
    const combined = [...top3, ...bot2].sort((a, b) => a - b);
    expect(combined).toEqual([1, 2, 3, 4, 5]);
  });
  it('bottomN is sorted ascending', () => {
    const result = bottomN([5, 3, 1, 4, 2], 3);
    expect(isSorted(result)).toBe(true);
  });
  it('topN is sorted descending', () => {
    const result = topN([5, 3, 1, 4, 2], 3);
    expect(isSortedDesc(result)).toBe(true);
  });
  it('topN on single-element array', () => {
    expect(topN([42], 1)).toEqual([42]);
  });
});

// ---------------------------------------------------------------------------
// BLOCK 39: shuffle edge cases (10 tests)
// ---------------------------------------------------------------------------
describe('shuffle — edge cases', () => {
  it('empty array returns []', () => expect(shuffle([])).toEqual([]));
  it('single element returns same', () => expect(shuffle([1])).toEqual([1]));
  it('does not mutate original', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });
  it('result is a permutation', () => {
    const arr = makeAscArr(20);
    const result = shuffle(arr, 123);
    expect(refSort(result)).toEqual(arr);
  });
  it('different seeds produce different results (most of the time)', () => {
    const arr = makeAscArr(20);
    const s1 = shuffle(arr, 1);
    const s2 = shuffle(arr, 9999);
    // Very unlikely to be equal for 20 elements
    const sameOrder = s1.every((v, i) => v === s2[i]);
    expect(sameOrder).toBe(false);
  });
  it('without seed is non-deterministic over many calls', () => {
    const arr = makeAscArr(10);
    const results = new Set(Array.from({ length: 10 }, () => shuffle(arr).join(',')));
    // Should have more than 1 unique result
    expect(results.size).toBeGreaterThan(1);
  });
  it('preserves all elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr, 77);
    expect(result.sort((a, b) => a - b)).toEqual(arr);
  });
  it('two-element array returns a permutation', () => {
    const arr = [1, 2];
    const result = shuffle(arr, 1);
    expect(result.sort()).toEqual([1, 2]);
  });
  it('seed=0 is deterministic', () => {
    const arr = makeAscArr(5);
    expect(shuffle(arr, 0)).toEqual(shuffle(arr, 0));
  });
  it('large array preserves all elements', () => {
    const arr = makeAscArr(100);
    const result = shuffle(arr, 999);
    expect(refSort(result)).toEqual(arr);
  });
});

// ---------------------------------------------------------------------------
// BLOCK 40: naturalSort additional edge cases (10 tests)
// ---------------------------------------------------------------------------
describe('naturalSort — additional edge cases', () => {
  it('"file10" > "file9" under naturalSort', () => expect(naturalSort('file10', 'file9')).toBeGreaterThan(0));
  it('"file1" < "file2" under naturalSort', () => expect(naturalSort('file1', 'file2')).toBeLessThan(0));
  it('equal strings return 0', () => expect(naturalSort('abc', 'abc')).toBe(0));
  it('empty strings are equal', () => expect(naturalSort('', '')).toBe(0));
  it('pure alphabetic falls back to lexicographic', () => expect(naturalSort('abc', 'abd')).toBeLessThan(0));
  it('"img2" < "img10"', () => expect(naturalSort('img2', 'img10')).toBeLessThan(0));
  it('"v1.2" < "v1.10"', () => expect(naturalSort('v1.2', 'v1.10')).toBeLessThan(0));
  it('prefixed zeros: "01" < "2" — numeric comparison', () => expect(naturalSort('01', '2')).toBeLessThan(0));
  it('longer string with same prefix sorts after', () => expect(naturalSort('file', 'file1')).toBeLessThan(0));
  it('naturalSort used in Array.sort produces natural order', () => {
    const files = ['file10', 'file2', 'file1', 'file20', 'file3'];
    files.sort(naturalSort);
    expect(files).toEqual(['file1', 'file2', 'file3', 'file10', 'file20']);
  });
});

// ---------------------------------------------------------------------------
// BLOCK 41: sorters with custom comparators (string sorting) — 20 tests
// ---------------------------------------------------------------------------
describe('sorters with string arrays and default comparator — 20 tests', () => {
  const words = ['banana', 'apple', 'cherry', 'date', 'elderberry'];
  const expectedAsc = [...words].sort();

  const stringSorters: Array<[string, (arr: readonly string[]) => string[]]> = [
    ['quickSort', (a) => quickSort(a)],
    ['mergeSort', (a) => mergeSort(a)],
    ['heapSort', (a) => heapSort(a)],
    ['insertionSort', (a) => insertionSort(a)],
  ];

  for (let i = 0; i < 5; i++) {
    for (const [name, sorter] of stringSorters) {
      it(`${name} sorts string array correctly (run ${i + 1})`, () => {
        expect(sorter(words)).toEqual(expectedAsc);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// BLOCK 42: binarySearchLeft / binarySearchRight correctness (20 tests)
// ---------------------------------------------------------------------------
describe('binarySearchLeft and binarySearchRight correctness', () => {
  for (let i = 1; i <= 10; i++) {
    const arr = [1, 1, 2, 2, 3, 3, 4, 4].slice(0, i + 1);
    it(`binarySearchLeft for first occurrence in partial array (i=${i})`, () => {
      const pos = binarySearchLeft(arr, 2);
      // pos should be index of first 2, or where 2 would be inserted
      expect(arr.slice(0, pos).every((v) => v < 2)).toBe(true);
    });
    it(`binarySearchRight for last occurrence in partial array (i=${i})`, () => {
      const pos = binarySearchRight(arr, 2);
      expect(arr.slice(pos).every((v) => v > 2)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 43: sortByFn desc — 10 tests
// ---------------------------------------------------------------------------
describe('sortByFn desc — 10 tests', () => {
  for (let i = 1; i <= 10; i++) {
    it(`sortByFn desc for ${i + 2} numbers by value`, () => {
      const arr = makeRandomArr(i + 2, i * 21);
      const sorted = sortByFn(arr, (x) => x, 'desc');
      expect(isSortedDesc(sorted)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 44: stableSort — various compare functions (10 tests)
// ---------------------------------------------------------------------------
describe('stableSort — various comparators', () => {
  for (let i = 1; i <= 10; i++) {
    it(`stableSort with numeric comparator on array size ${i + 3}`, () => {
      const arr = makeRandomArr(i + 3, i * 22);
      const result = stableSort(arr, (a, b) => a - b);
      expect(isSorted(result)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 45: Misc coverage — isSorted with compareFn (10 tests)
// ---------------------------------------------------------------------------
describe('isSorted / isSortedDesc with custom comparator', () => {
  it('isSorted with reverse comparator on descending array', () => {
    expect(isSorted([5, 4, 3, 2, 1], (a, b) => b - a)).toBe(true);
  });
  it('isSortedDesc with reverse comparator on ascending array', () => {
    expect(isSortedDesc([1, 2, 3, 4, 5], (a, b) => b - a)).toBe(true);
  });
  it('isSorted returns true for empty array', () => expect(isSorted([])).toBe(true));
  it('isSortedDesc returns true for empty array', () => expect(isSortedDesc([])).toBe(true));
  it('isSorted returns true for single element', () => expect(isSorted([1])).toBe(true));
  it('isSortedDesc returns true for single element', () => expect(isSortedDesc([1])).toBe(true));
  it('isSorted [1,1,1] is sorted', () => expect(isSorted([1, 1, 1])).toBe(true));
  it('isSortedDesc [1,1,1] is sorted desc', () => expect(isSortedDesc([1, 1, 1])).toBe(true));
  it('isSorted [1,2,2,3] is sorted', () => expect(isSorted([1, 2, 2, 3])).toBe(true));
  it('isSortedDesc [3,2,2,1] is sortedDesc', () => expect(isSortedDesc([3, 2, 2, 1])).toBe(true));
});

// ---------------------------------------------------------------------------
// BLOCK 46: Large array smoke test — each sorter handles 500 elements (7 tests)
// ---------------------------------------------------------------------------
describe('sorters handle 500-element arrays', () => {
  const bigArr = makeRandomArr(500, 999);
  const expected = refSort(bigArr);
  for (const [name, sorter] of comparisonSorters) {
    it(`${name} correctly sorts 500 elements`, () => {
      expect(sorter(bigArr)).toEqual(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// BLOCK 47: countingSort and radixSort on large arrays (5 tests)
// ---------------------------------------------------------------------------
describe('integer sorters on larger arrays', () => {
  it('countingSort 200 elements 0..99', () => {
    const arr = makeRandomArr(200, 111).map((v) => v % 100);
    expect(countingSort(arr)).toEqual(refSort(arr));
  });
  it('radixSort 200 elements 0..9999', () => {
    const arr = makeRandomArr(200, 222).map((v) => v % 10000);
    expect(radixSort(arr)).toEqual(refSort(arr));
  });
  it('bucketSort 200 elements', () => {
    const arr = makeRandomArr(200, 333).map((v) => v % 1000);
    expect(bucketSort(arr)).toEqual(refSort(arr));
  });
  it('countingSort 300 elements with many duplicates', () => {
    const arr = makeRandomArr(300, 444).map((v) => v % 10);
    expect(countingSort(arr)).toEqual(refSort(arr));
  });
  it('radixSort handles arr with value 0', () => {
    const arr = [0, 5, 3, 0, 10, 0];
    expect(radixSort(arr)).toEqual([0, 0, 0, 3, 5, 10]);
  });
});
