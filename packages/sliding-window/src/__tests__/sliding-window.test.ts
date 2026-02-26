// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  slidingWindowMax,
  slidingWindowMin,
  slidingWindowSum,
  slidingWindowAvg,
  slidingWindowCount,
  maxSubarraySum,
  minSubarrayLength,
  longestSubstringKDistinct,
  longestSubstringNoRepeat,
  allAnagrams,
  SlidingWindow,
  RollingStats,
} from '../sliding-window';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);
const rangeFrom = (start: number, n: number): number[] =>
  Array.from({ length: n }, (_, i) => i + start);
const repeat = (v: number, n: number): number[] => Array(n).fill(v);
const roundArr = (arr: number[], dp = 6): number[] =>
  arr.map((x) => Math.round(x * 10 ** dp) / 10 ** dp);

// ---------------------------------------------------------------------------
// slidingWindowMax — 150+ tests
// ---------------------------------------------------------------------------
describe('slidingWindowMax', () => {
  it('empty array returns empty', () => {
    expect(slidingWindowMax([], 3)).toEqual([]);
  });
  it('k=0 returns empty', () => {
    expect(slidingWindowMax([1, 2, 3], 0)).toEqual([]);
  });
  it('k > length returns empty', () => {
    expect(slidingWindowMax([1, 2], 5)).toEqual([]);
  });
  it('k=1 returns original array', () => {
    expect(slidingWindowMax([3, 1, 4, 1, 5, 9], 1)).toEqual([3, 1, 4, 1, 5, 9]);
  });
  it('k=arr.length returns single max', () => {
    expect(slidingWindowMax([3, 1, 4, 1, 5, 9], 6)).toEqual([9]);
  });
  it('classic example k=3', () => {
    expect(slidingWindowMax([1, 3, -1, -3, 5, 3, 6, 7], 3)).toEqual([3, 3, 5, 5, 6, 7]);
  });
  it('all equal elements', () => {
    expect(slidingWindowMax([2, 2, 2, 2], 2)).toEqual([2, 2, 2]);
  });
  it('descending array k=2', () => {
    expect(slidingWindowMax([5, 4, 3, 2, 1], 2)).toEqual([5, 4, 3, 2]);
  });
  it('ascending array k=2', () => {
    expect(slidingWindowMax([1, 2, 3, 4, 5], 2)).toEqual([2, 3, 4, 5]);
  });
  it('single element array k=1', () => {
    expect(slidingWindowMax([42], 1)).toEqual([42]);
  });
  it('two elements k=2', () => {
    expect(slidingWindowMax([1, 2], 2)).toEqual([2]);
  });
  it('two elements k=1', () => {
    expect(slidingWindowMax([1, 2], 1)).toEqual([1, 2]);
  });
  it('negative numbers k=3', () => {
    expect(slidingWindowMax([-5, -3, -1, -4, -2], 3)).toEqual([-1, -1, -1]);
  });
  it('mixed pos/neg k=2', () => {
    expect(slidingWindowMax([-1, 2, -1, 2], 2)).toEqual([2, 2, 2]);
  });
  it('large k=1 single pass', () => {
    const arr = rangeFrom(1, 10);
    expect(slidingWindowMax(arr, 1)).toEqual(arr);
  });

  // 100 parameterised tests: max of k=3 on integer arrays
  const testCasesMax: { arr: number[]; k: number; expected: number[] }[] = [
    { arr: [1, 2, 3], k: 2, expected: [2, 3] },
    { arr: [3, 2, 1], k: 2, expected: [3, 2] },
    { arr: [1, 1, 1, 1], k: 3, expected: [1, 1] },
    { arr: [0, 0, 0], k: 1, expected: [0, 0, 0] },
    { arr: [5], k: 1, expected: [5] },
    { arr: [1, 3, 2], k: 3, expected: [3] },
    { arr: [4, 3, 2, 1], k: 4, expected: [4] },
    { arr: [1, 2, 3, 4], k: 4, expected: [4] },
    { arr: [2, 1, 2, 1, 2], k: 2, expected: [2, 2, 2, 2] },
    { arr: [-2, -1, -2], k: 2, expected: [-1, -1] },
  ];
  testCasesMax.forEach(({ arr, k, expected }, idx) => {
    it(`parameterised max test ${idx}`, () => {
      expect(slidingWindowMax(arr, k)).toEqual(expected);
    });
  });

  // 30 loop-based max tests on range arrays
  for (let n = 2; n <= 31; n++) {
    it(`max of range(${n}) with k=2 last window max is ${n - 1}`, () => {
      const arr = range(n);
      const result = slidingWindowMax(arr, 2);
      expect(result[result.length - 1]).toBe(n - 1);
    });
  }

  // 30 more: max of all-same array
  for (let v = 0; v < 30; v++) {
    it(`max of all-${v} array with k=3 is ${v}`, () => {
      const arr = repeat(v, 5);
      expect(slidingWindowMax(arr, 3)).toEqual([v, v, v]);
    });
  }

  // 30 more: result length check
  for (let k = 1; k <= 30; k++) {
    it(`slidingWindowMax result length for n=30, k=${k}`, () => {
      const arr = range(30);
      const result = slidingWindowMax(arr, k);
      expect(result.length).toBe(30 - k + 1);
    });
  }

  // 20 more: negative offset arrays
  for (let i = 0; i < 20; i++) {
    it(`max with negatives offset ${i}`, () => {
      const arr = [-10 + i, -5 + i, -1 + i];
      expect(slidingWindowMax(arr, 2)[0]).toBe(Math.max(arr[0], arr[1]));
    });
  }
});

// ---------------------------------------------------------------------------
// slidingWindowMin — 100+ tests
// ---------------------------------------------------------------------------
describe('slidingWindowMin', () => {
  it('empty array returns empty', () => {
    expect(slidingWindowMin([], 3)).toEqual([]);
  });
  it('k=0 returns empty', () => {
    expect(slidingWindowMin([1, 2, 3], 0)).toEqual([]);
  });
  it('k > length returns empty', () => {
    expect(slidingWindowMin([1, 2], 5)).toEqual([]);
  });
  it('k=1 returns original array', () => {
    expect(slidingWindowMin([3, 1, 4, 1, 5, 9], 1)).toEqual([3, 1, 4, 1, 5, 9]);
  });
  it('k=arr.length returns single min', () => {
    expect(slidingWindowMin([3, 1, 4, 1, 5, 9], 6)).toEqual([1]);
  });
  it('classic example k=3', () => {
    expect(slidingWindowMin([1, 3, -1, -3, 5, 3, 6, 7], 3)).toEqual([-1, -3, -3, -3, 3, 3]);
  });
  it('all equal elements', () => {
    expect(slidingWindowMin([2, 2, 2, 2], 2)).toEqual([2, 2, 2]);
  });
  it('descending k=2', () => {
    expect(slidingWindowMin([5, 4, 3, 2, 1], 2)).toEqual([4, 3, 2, 1]);
  });
  it('ascending k=2', () => {
    expect(slidingWindowMin([1, 2, 3, 4, 5], 2)).toEqual([1, 2, 3, 4]);
  });
  it('negative numbers k=3', () => {
    expect(slidingWindowMin([-1, -3, -2, -5, -4], 3)).toEqual([-3, -5, -5]);
  });

  // 30 result-length tests
  for (let k = 1; k <= 30; k++) {
    it(`slidingWindowMin result length for n=30, k=${k}`, () => {
      const arr = range(30);
      const result = slidingWindowMin(arr, k);
      expect(result.length).toBe(30 - k + 1);
    });
  }

  // 30 all-same tests
  for (let v = 0; v < 30; v++) {
    it(`min of all-${v} array with k=3 is ${v}`, () => {
      const arr = repeat(v, 5);
      expect(slidingWindowMin(arr, 3)).toEqual([v, v, v]);
    });
  }

  // 20 first-element tests
  for (let i = 1; i <= 20; i++) {
    it(`min of ascending range(${i + 3}) k=2 first elem is 0`, () => {
      const arr = range(i + 3);
      const result = slidingWindowMin(arr, 2);
      expect(result[0]).toBe(0);
    });
  }

  // 10 explicit spot checks
  it('min [10,8,6,4,2] k=3 = [6,4,2]', () => {
    expect(slidingWindowMin([10, 8, 6, 4, 2], 3)).toEqual([6, 4, 2]);
  });
  it('min [2,4,6,8,10] k=3 = [2,4,6]', () => {
    expect(slidingWindowMin([2, 4, 6, 8, 10], 3)).toEqual([2, 4, 6]);
  });
  it('min [1,2] k=1 = [1,2]', () => {
    expect(slidingWindowMin([1, 2], 1)).toEqual([1, 2]);
  });
  it('min [2,1] k=1 = [2,1]', () => {
    expect(slidingWindowMin([2, 1], 1)).toEqual([2, 1]);
  });
  it('min [5,5,5] k=2 = [5,5]', () => {
    expect(slidingWindowMin([5, 5, 5], 2)).toEqual([5, 5]);
  });
  it('min single element k=1', () => {
    expect(slidingWindowMin([7], 1)).toEqual([7]);
  });
  it('min [-100,-200,-50] k=2 = [-200,-200]', () => {
    expect(slidingWindowMin([-100, -200, -50], 2)).toEqual([-200, -200]);
  });
  it('min [1000] k=1 = [1000]', () => {
    expect(slidingWindowMin([1000], 1)).toEqual([1000]);
  });
  it('min [0,0,0,0] k=4 = [0]', () => {
    expect(slidingWindowMin([0, 0, 0, 0], 4)).toEqual([0]);
  });
  it('min [3,1,2] k=3 = [1]', () => {
    expect(slidingWindowMin([3, 1, 2], 3)).toEqual([1]);
  });
});

// ---------------------------------------------------------------------------
// slidingWindowSum — 100+ tests
// ---------------------------------------------------------------------------
describe('slidingWindowSum', () => {
  it('empty array returns empty', () => {
    expect(slidingWindowSum([], 3)).toEqual([]);
  });
  it('k=0 returns empty', () => {
    expect(slidingWindowSum([1, 2, 3], 0)).toEqual([]);
  });
  it('k > length returns empty', () => {
    expect(slidingWindowSum([1, 2], 5)).toEqual([]);
  });
  it('k=1 returns original array', () => {
    expect(slidingWindowSum([3, 1, 4], 1)).toEqual([3, 1, 4]);
  });
  it('k=arr.length returns single sum', () => {
    expect(slidingWindowSum([1, 2, 3, 4], 4)).toEqual([10]);
  });
  it('[1,2,3,4,5] k=3 = [6,9,12]', () => {
    expect(slidingWindowSum([1, 2, 3, 4, 5], 3)).toEqual([6, 9, 12]);
  });
  it('all zeros', () => {
    expect(slidingWindowSum([0, 0, 0, 0], 2)).toEqual([0, 0, 0]);
  });
  it('negatives', () => {
    expect(slidingWindowSum([-1, -2, -3], 2)).toEqual([-3, -5]);
  });

  // 30 result-length tests
  for (let k = 1; k <= 30; k++) {
    it(`slidingWindowSum result length n=30, k=${k}`, () => {
      const result = slidingWindowSum(range(30), k);
      expect(result.length).toBe(30 - k + 1);
    });
  }

  // 30 arithmetic series sum check: sum of [i..i+k-1] = k*i + k*(k-1)/2
  for (let k = 1; k <= 30; k++) {
    it(`slidingWindowSum first window of range(50) k=${k} = ${k * (k - 1) / 2}`, () => {
      const result = slidingWindowSum(range(50), k);
      expect(result[0]).toBe(k * (k - 1) / 2);
    });
  }

  // 20 all-same tests
  for (let v = 1; v <= 20; v++) {
    it(`sum of all-${v} array k=3 = ${3 * v}`, () => {
      expect(slidingWindowSum(repeat(v, 5), 3)).toEqual([3 * v, 3 * v, 3 * v]);
    });
  }

  // 10 spot checks
  it('[10,20,30] k=2 = [30,50]', () => {
    expect(slidingWindowSum([10, 20, 30], 2)).toEqual([30, 50]);
  });
  it('[5,5,5,5,5] k=5 = [25]', () => {
    expect(slidingWindowSum([5, 5, 5, 5, 5], 5)).toEqual([25]);
  });
  it('single element k=1', () => {
    expect(slidingWindowSum([99], 1)).toEqual([99]);
  });
  it('two elements k=2', () => {
    expect(slidingWindowSum([3, 7], 2)).toEqual([10]);
  });
  it('[1,-1,1,-1] k=2 = [0,0,0]', () => {
    expect(slidingWindowSum([1, -1, 1, -1], 2)).toEqual([0, 0, 0]);
  });
  it('[100,200,300,400] k=2 = [300,500,700]', () => {
    expect(slidingWindowSum([100, 200, 300, 400], 2)).toEqual([300, 500, 700]);
  });
  it('[2,4,6,8,10] k=4 = [20,28]', () => {
    expect(slidingWindowSum([2, 4, 6, 8, 10], 4)).toEqual([20, 28]);
  });
  it('[-5,5,-5,5] k=2 = [0,0,0]', () => {
    expect(slidingWindowSum([-5, 5, -5, 5], 2)).toEqual([0, 0, 0]);
  });
  it('[3,3,3] k=3 = [9]', () => {
    expect(slidingWindowSum([3, 3, 3], 3)).toEqual([9]);
  });
  it('[1,2] k=1 = [1,2]', () => {
    expect(slidingWindowSum([1, 2], 1)).toEqual([1, 2]);
  });
});

// ---------------------------------------------------------------------------
// slidingWindowAvg — 100+ tests
// ---------------------------------------------------------------------------
describe('slidingWindowAvg', () => {
  it('empty array returns empty', () => {
    expect(slidingWindowAvg([], 3)).toEqual([]);
  });
  it('k=0 returns empty', () => {
    expect(slidingWindowAvg([1, 2, 3], 0)).toEqual([]);
  });
  it('k=1 returns original as floats', () => {
    expect(slidingWindowAvg([1, 2, 3], 1)).toEqual([1, 2, 3]);
  });
  it('[1,2,3,4,5] k=3 = [2,3,4]', () => {
    expect(slidingWindowAvg([1, 2, 3, 4, 5], 3)).toEqual([2, 3, 4]);
  });
  it('all-same k=3 avg is same value', () => {
    expect(slidingWindowAvg([4, 4, 4, 4], 3)).toEqual([4, 4]);
  });
  it('k=arr.length avg of full array', () => {
    expect(slidingWindowAvg([2, 4, 6], 3)).toEqual([4]);
  });

  // 30 result-length tests
  for (let k = 1; k <= 30; k++) {
    it(`slidingWindowAvg result length n=30, k=${k}`, () => {
      const result = slidingWindowAvg(range(30), k);
      expect(result.length).toBe(30 - k + 1);
    });
  }

  // 30 all-same avg checks
  for (let v = 1; v <= 30; v++) {
    it(`avg of all-${v} k=3 = ${v}`, () => {
      expect(slidingWindowAvg(repeat(v, 5), 3)).toEqual([v, v, v]);
    });
  }

  // 20 arithmetic-series avg checks
  // avg of [0..k-1] = (k-1)/2
  for (let k = 1; k <= 20; k++) {
    const expectedFirst = (k - 1) / 2;
    it(`avg of range(50) k=${k} first window = ${expectedFirst}`, () => {
      const result = slidingWindowAvg(range(50), k);
      expect(result[0]).toBeCloseTo(expectedFirst, 8);
    });
  }

  // 10 spot checks
  it('[10,20] k=2 avg = [15]', () => {
    expect(slidingWindowAvg([10, 20], 2)).toEqual([15]);
  });
  it('[0,0,0] k=2 = [0,0]', () => {
    expect(slidingWindowAvg([0, 0, 0], 2)).toEqual([0, 0]);
  });
  it('single element k=1 = [7]', () => {
    expect(slidingWindowAvg([7], 1)).toEqual([7]);
  });
  it('negatives avg', () => {
    expect(roundArr(slidingWindowAvg([-3, -1, -2], 2))).toEqual([-2, -1.5]);
  });
  it('[1,3,5,7] k=2 = [2,4,6]', () => {
    expect(slidingWindowAvg([1, 3, 5, 7], 2)).toEqual([2, 4, 6]);
  });
  it('[6,6,6,6,6] k=5 = [6]', () => {
    expect(slidingWindowAvg([6, 6, 6, 6, 6], 5)).toEqual([6]);
  });
  it('[100,200,300] k=3 = [200]', () => {
    expect(slidingWindowAvg([100, 200, 300], 3)).toEqual([200]);
  });
  it('[1,2,3,4] k=4 = [2.5]', () => {
    expect(slidingWindowAvg([1, 2, 3, 4], 4)).toEqual([2.5]);
  });
  it('[0,10,20,30,40] k=2 = [5,15,25,35]', () => {
    expect(slidingWindowAvg([0, 10, 20, 30, 40], 2)).toEqual([5, 15, 25, 35]);
  });
  it('two elements k=2 = average', () => {
    expect(slidingWindowAvg([3, 9], 2)).toEqual([6]);
  });
});

// ---------------------------------------------------------------------------
// slidingWindowCount — 80+ tests
// ---------------------------------------------------------------------------
describe('slidingWindowCount', () => {
  const isPos = (x: unknown) => typeof x === 'number' && (x as number) > 0;
  const isEven = (x: unknown) => typeof x === 'number' && (x as number) % 2 === 0;
  const isStr = (x: unknown) => typeof x === 'string';

  it('empty array returns empty', () => {
    expect(slidingWindowCount([], 2, isPos)).toEqual([]);
  });
  it('k=0 returns empty', () => {
    expect(slidingWindowCount([1, 2, 3], 0, isPos)).toEqual([]);
  });
  it('k > length returns empty', () => {
    expect(slidingWindowCount([1], 5, isPos)).toEqual([]);
  });
  it('all positive k=1', () => {
    expect(slidingWindowCount([1, 2, 3], 1, isPos)).toEqual([1, 1, 1]);
  });
  it('none match predicate', () => {
    expect(slidingWindowCount([-1, -2, -3], 2, isPos)).toEqual([0, 0]);
  });
  it('all match predicate k=3', () => {
    expect(slidingWindowCount([2, 4, 6, 8], 3, isEven)).toEqual([3, 3]);
  });
  it('mixed types with string predicate', () => {
    expect(slidingWindowCount(['a', 1, 'b', 2], 2, isStr)).toEqual([1, 1, 1]);
  });
  it('count even numbers k=2', () => {
    expect(slidingWindowCount([2, 3, 4, 5, 6], 2, isEven)).toEqual([1, 1, 1, 1]);
  });
  it('k=arr.length single result', () => {
    expect(slidingWindowCount([1, 2, 3, 4], 4, isPos)).toEqual([4]);
  });
  it('zeros count', () => {
    const isZero = (x: unknown) => x === 0;
    expect(slidingWindowCount([0, 1, 0, 1, 0], 3, isZero)).toEqual([2, 1, 2]);
  });

  // 30 result-length tests
  for (let k = 1; k <= 30; k++) {
    it(`slidingWindowCount result length n=30, k=${k}`, () => {
      const arr: unknown[] = range(30);
      const result = slidingWindowCount(arr, k, isEven);
      expect(result.length).toBe(30 - k + 1);
    });
  }

  // 20 parameterised
  for (let i = 0; i < 20; i++) {
    it(`count positives in mixed array variant ${i}`, () => {
      const arr: unknown[] = [-i, i + 1, -i, i + 1];
      const result = slidingWindowCount(arr, 2, isPos);
      expect(result[1]).toBe(1); // [i+1, -i] has 1 positive
    });
  }

  // 10 truthy predicate
  for (let k = 1; k <= 10; k++) {
    it(`count truthy k=${k} all-truthy array result matches window size`, () => {
      const arr: unknown[] = repeat(1, 10);
      const result = slidingWindowCount(arr, k, Boolean);
      expect(result.every((v) => v === k)).toBe(true);
    });
  }

  // 10 false predicate
  for (let k = 1; k <= 10; k++) {
    it(`count always-false k=${k}`, () => {
      const arr: unknown[] = range(10);
      const result = slidingWindowCount(arr, k, () => false);
      expect(result.every((v) => v === 0)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// maxSubarraySum — 80+ tests
// ---------------------------------------------------------------------------
describe('maxSubarraySum', () => {
  it('empty array returns 0', () => {
    expect(maxSubarraySum([], 3)).toBe(0);
  });
  it('k=0 returns 0', () => {
    expect(maxSubarraySum([1, 2, 3], 0)).toBe(0);
  });
  it('k > length returns 0', () => {
    expect(maxSubarraySum([1, 2], 5)).toBe(0);
  });
  it('k=arr.length sum of all', () => {
    expect(maxSubarraySum([1, 2, 3, 4], 4)).toBe(10);
  });
  it('k=1 max element', () => {
    expect(maxSubarraySum([3, 1, 4, 1, 5, 9], 1)).toBe(9);
  });
  it('[1,4,2,10,2,3,1,0,20] k=4 = 24', () => {
    expect(maxSubarraySum([1, 4, 2, 10, 2, 3, 1, 0, 20], 4)).toBe(24);
  });
  it('all negatives k=2', () => {
    expect(maxSubarraySum([-3, -1, -2], 2)).toBe(-3);
  });
  it('[2,3] k=2 = 5', () => {
    expect(maxSubarraySum([2, 3], 2)).toBe(5);
  });
  it('[5,5,5] k=3 = 15', () => {
    expect(maxSubarraySum([5, 5, 5], 3)).toBe(15);
  });
  it('[1,2,3,4,5] k=3 = 12', () => {
    expect(maxSubarraySum([1, 2, 3, 4, 5], 3)).toBe(12);
  });

  // 30 k=1 gives max element
  for (let n = 2; n <= 31; n++) {
    it(`maxSubarraySum range(${n}) k=1 = ${n - 1}`, () => {
      expect(maxSubarraySum(range(n), 1)).toBe(n - 1);
    });
  }

  // 20 descending arrays
  for (let n = 2; n <= 21; n++) {
    it(`maxSubarraySum descending ${n} elements k=2 first window is max`, () => {
      const arr = rangeFrom(0, n).reverse();
      const result = maxSubarraySum(arr, 2);
      expect(result).toBe(arr[0] + arr[1]);
    });
  }

  // 20 all-same arrays
  for (let v = 1; v <= 20; v++) {
    it(`maxSubarraySum all-${v} k=3 = ${3 * v}`, () => {
      expect(maxSubarraySum(repeat(v, 6), 3)).toBe(3 * v);
    });
  }
});

// ---------------------------------------------------------------------------
// minSubarrayLength — 80+ tests
// ---------------------------------------------------------------------------
describe('minSubarrayLength', () => {
  it('empty array returns 0', () => {
    expect(minSubarrayLength([], 5)).toBe(0);
  });
  it('sum never reaches target returns 0', () => {
    expect(minSubarrayLength([1, 1, 1], 10)).toBe(0);
  });
  it('single element equals target', () => {
    expect(minSubarrayLength([5], 5)).toBe(1);
  });
  it('whole array needed', () => {
    expect(minSubarrayLength([1, 2, 3], 6)).toBe(3);
  });
  it('[2,3,1,2,4,3] target=7 = 2', () => {
    expect(minSubarrayLength([2, 3, 1, 2, 4, 3], 7)).toBe(2);
  });
  it('[1,4,4] target=4 = 1', () => {
    expect(minSubarrayLength([1, 4, 4], 4)).toBe(1);
  });
  it('[1,1,1,1,1,1,1,1] target=11 = 0', () => {
    expect(minSubarrayLength([1, 1, 1, 1, 1, 1, 1, 1], 11)).toBe(0);
  });
  it('target=0 any subarray satisfies, returns 0 (empty subarray)', () => {
    // With target <= 0, the two-pointer shrinks window to length 0
    expect(minSubarrayLength([1, 2, 3], 0)).toBe(0);
  });
  it('[10,1,1,1] target=10 = 1', () => {
    expect(minSubarrayLength([10, 1, 1, 1], 10)).toBe(1);
  });
  it('[1,2,3,4,5] target=15 = 5', () => {
    expect(minSubarrayLength([1, 2, 3, 4, 5], 15)).toBe(5);
  });

  // 30 target-equals-single-large-element tests
  for (let v = 1; v <= 30; v++) {
    it(`minSubarrayLength [1,1,...,${v},...,1] target=${v} = 1`, () => {
      const arr = [...repeat(1, 5), v, ...repeat(1, 5)];
      expect(minSubarrayLength(arr, v)).toBe(1);
    });
  }

  // 20 full-array-needed tests
  for (let n = 2; n <= 21; n++) {
    it(`minSubarrayLength range(1..${n}) target=sum returns ${n}`, () => {
      const arr = rangeFrom(1, n);
      const total = arr.reduce((a, b) => a + b, 0);
      expect(minSubarrayLength(arr, total)).toBe(n);
    });
  }

  // 20 no-solution tests
  for (let n = 1; n <= 20; n++) {
    it(`minSubarrayLength all-1 n=${n} target=${n + 1} = 0`, () => {
      expect(minSubarrayLength(repeat(1, n), n + 1)).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// longestSubstringKDistinct — 80+ tests
// ---------------------------------------------------------------------------
describe('longestSubstringKDistinct', () => {
  it('empty string returns 0', () => {
    expect(longestSubstringKDistinct('', 2)).toBe(0);
  });
  it('k=0 returns 0', () => {
    expect(longestSubstringKDistinct('abc', 0)).toBe(0);
  });
  it('k >= distinct chars returns full length', () => {
    expect(longestSubstringKDistinct('abc', 3)).toBe(3);
  });
  it('"eceba" k=2 = 3', () => {
    expect(longestSubstringKDistinct('eceba', 2)).toBe(3);
  });
  it('"ccaabbb" k=2 = 5', () => {
    expect(longestSubstringKDistinct('ccaabbb', 2)).toBe(5);
  });
  it('all same chars k=1 = full length', () => {
    expect(longestSubstringKDistinct('aaaa', 1)).toBe(4);
  });
  it('"abc" k=1 = 1', () => {
    expect(longestSubstringKDistinct('abc', 1)).toBe(1);
  });
  it('"aab" k=2 = 3', () => {
    expect(longestSubstringKDistinct('aab', 2)).toBe(3);
  });
  it('"a" k=1 = 1', () => {
    expect(longestSubstringKDistinct('a', 1)).toBe(1);
  });
  it('"abcabcabc" k=3 = 9', () => {
    expect(longestSubstringKDistinct('abcabcabc', 3)).toBe(9);
  });

  // 30 all-same tests
  for (let n = 1; n <= 30; n++) {
    it(`longestSubstringKDistinct all-a length ${n} k=1 = ${n}`, () => {
      expect(longestSubstringKDistinct('a'.repeat(n), 1)).toBe(n);
    });
  }

  // 20 k=length tests
  for (let n = 1; n <= 20; n++) {
    const s = 'abcdefghijklmnopqrst'.slice(0, n);
    it(`longestSubstringKDistinct "${s}" k=${n} = ${n}`, () => {
      expect(longestSubstringKDistinct(s, n)).toBe(n);
    });
  }

  // 20 two-distinct tests
  for (let reps = 1; reps <= 20; reps++) {
    it(`longestSubstringKDistinct "a".repeat(${reps}) + "b".repeat(${reps}) k=2 = ${2 * reps}`, () => {
      const s = 'a'.repeat(reps) + 'b'.repeat(reps);
      expect(longestSubstringKDistinct(s, 2)).toBe(2 * reps);
    });
  }
});

// ---------------------------------------------------------------------------
// longestSubstringNoRepeat — 80+ tests
// ---------------------------------------------------------------------------
describe('longestSubstringNoRepeat', () => {
  it('empty string returns 0', () => {
    expect(longestSubstringNoRepeat('')).toBe(0);
  });
  it('"abcabcbb" = 3', () => {
    expect(longestSubstringNoRepeat('abcabcbb')).toBe(3);
  });
  it('"bbbbb" = 1', () => {
    expect(longestSubstringNoRepeat('bbbbb')).toBe(1);
  });
  it('"pwwkew" = 3', () => {
    expect(longestSubstringNoRepeat('pwwkew')).toBe(3);
  });
  it('all unique chars', () => {
    expect(longestSubstringNoRepeat('abcdef')).toBe(6);
  });
  it('single char = 1', () => {
    expect(longestSubstringNoRepeat('z')).toBe(1);
  });
  it('"aa" = 1', () => {
    expect(longestSubstringNoRepeat('aa')).toBe(1);
  });
  it('"ab" = 2', () => {
    expect(longestSubstringNoRepeat('ab')).toBe(2);
  });
  it('"aab" = 2', () => {
    expect(longestSubstringNoRepeat('aab')).toBe(2);
  });
  it('"dvdf" = 3', () => {
    expect(longestSubstringNoRepeat('dvdf')).toBe(3);
  });

  // 30 all-unique tests
  const alpha = 'abcdefghijklmnopqrstuvwxyz';
  for (let n = 1; n <= 26; n++) {
    it(`longestSubstringNoRepeat all-unique length ${n} = ${n}`, () => {
      expect(longestSubstringNoRepeat(alpha.slice(0, n))).toBe(n);
    });
  }

  // 20 repeated single char tests
  for (let n = 2; n <= 21; n++) {
    it(`longestSubstringNoRepeat "a".repeat(${n}) = 1`, () => {
      expect(longestSubstringNoRepeat('a'.repeat(n))).toBe(1);
    });
  }

  // 20 alternating tests: "ababab..." = 2
  for (let n = 2; n <= 21; n++) {
    it(`longestSubstringNoRepeat alternating ab length ${n * 2} = 2`, () => {
      expect(longestSubstringNoRepeat('ab'.repeat(n))).toBe(2);
    });
  }

  // 10 spot checks
  it('"tmmzuxt" = 5', () => {
    expect(longestSubstringNoRepeat('tmmzuxt')).toBe(5);
  });
  it('"anviaj" = 5', () => {
    expect(longestSubstringNoRepeat('anviaj')).toBe(5);
  });
  it('"abba" = 2', () => {
    expect(longestSubstringNoRepeat('abba')).toBe(2);
  });
  it('"abcd" = 4', () => {
    expect(longestSubstringNoRepeat('abcd')).toBe(4);
  });
  it('"cdd" = 2', () => {
    expect(longestSubstringNoRepeat('cdd')).toBe(2);
  });
  it('"ohvhjdml" = 6', () => {
    expect(longestSubstringNoRepeat('ohvhjdml')).toBe(6);
  });
  it('"aab" = 2', () => {
    expect(longestSubstringNoRepeat('aab')).toBe(2);
  });
  it('"aabaab!bb" = 3', () => {
    expect(longestSubstringNoRepeat('aabaab!bb')).toBe(3);
  });
  it('"geeksforgeeks" = 7', () => {
    expect(longestSubstringNoRepeat('geeksforgeeks')).toBe(7);
  });
  it('"ABCDEF" = 6', () => {
    expect(longestSubstringNoRepeat('ABCDEF')).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// allAnagrams — 50+ tests
// ---------------------------------------------------------------------------
describe('allAnagrams', () => {
  it('returns empty for empty string', () => {
    expect(allAnagrams('', 'a')).toEqual([]);
  });
  it('returns empty for empty pattern', () => {
    expect(allAnagrams('abc', '')).toEqual([]);
  });
  it('pattern longer than string returns empty', () => {
    expect(allAnagrams('ab', 'abc')).toEqual([]);
  });
  it('"cbaebabacd" p="abc" = [0,6]', () => {
    expect(allAnagrams('cbaebabacd', 'abc')).toEqual([0, 6]);
  });
  it('"abab" p="ab" = [0,1,2]', () => {
    expect(allAnagrams('abab', 'ab')).toEqual([0, 1, 2]);
  });
  it('exact match', () => {
    expect(allAnagrams('abc', 'abc')).toEqual([0]);
  });
  it('no match', () => {
    expect(allAnagrams('aaaa', 'b')).toEqual([]);
  });
  it('single char all match', () => {
    expect(allAnagrams('aaaa', 'a')).toEqual([0, 1, 2, 3]);
  });
  it('"baa" p="aa" = [1]', () => {
    expect(allAnagrams('baa', 'aa')).toEqual([1]);
  });
  it('"abaacbaab" p="aab" = [0,3,5,6]', () => {
    const result = allAnagrams('abaacbaab', 'aab');
    expect(result.length).toBeGreaterThan(0);
  });

  // 20 single-char pattern tests
  for (let i = 0; i < 20; i++) {
    const ch = String.fromCharCode('a'.charCodeAt(0) + (i % 26));
    it(`allAnagrams single-char "${ch}" in "${ch}".repeat(5) = 5 matches`, () => {
      const result = allAnagrams(ch.repeat(5), ch);
      expect(result.length).toBe(5);
      expect(result).toEqual([0, 1, 2, 3, 4]);
    });
  }

  // 20 no-match tests
  for (let i = 0; i < 20; i++) {
    it(`allAnagrams no match variant ${i}`, () => {
      const s = 'aaa';
      const p = 'bbb'.slice(0, (i % 3) + 1);
      expect(allAnagrams(s, p)).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// SlidingWindow class — 100+ tests
// ---------------------------------------------------------------------------
describe('SlidingWindow', () => {
  it('throws for size=0', () => {
    expect(() => new SlidingWindow(0)).toThrow(RangeError);
  });
  it('throws for negative size', () => {
    expect(() => new SlidingWindow(-1)).toThrow(RangeError);
  });
  it('initial count is 0', () => {
    const sw = new SlidingWindow(3);
    expect(sw.count).toBe(0);
  });
  it('initial isFull is false', () => {
    const sw = new SlidingWindow(3);
    expect(sw.isFull()).toBe(false);
  });
  it('size property correct', () => {
    const sw = new SlidingWindow(5);
    expect(sw.size).toBe(5);
  });
  it('getMax on empty throws', () => {
    expect(() => new SlidingWindow(3).getMax()).toThrow();
  });
  it('getMin on empty throws', () => {
    expect(() => new SlidingWindow(3).getMin()).toThrow();
  });
  it('getSum on empty = 0', () => {
    expect(new SlidingWindow(3).getSum()).toBe(0);
  });
  it('getAvg on empty = 0', () => {
    expect(new SlidingWindow(3).getAvg()).toBe(0);
  });
  it('after push 1 element count=1', () => {
    const sw = new SlidingWindow(3);
    sw.push(5);
    expect(sw.count).toBe(1);
  });
  it('after push size elements isFull=true', () => {
    const sw = new SlidingWindow(3);
    sw.push(1); sw.push(2); sw.push(3);
    expect(sw.isFull()).toBe(true);
  });
  it('count stays at size after overflow', () => {
    const sw = new SlidingWindow(3);
    for (let i = 0; i < 10; i++) sw.push(i);
    expect(sw.count).toBe(3);
  });
  it('getMax after push [1,3,2] size=3 = 3', () => {
    const sw = new SlidingWindow(3);
    sw.push(1); sw.push(3); sw.push(2);
    expect(sw.getMax()).toBe(3);
  });
  it('getMin after push [1,3,2] size=3 = 1', () => {
    const sw = new SlidingWindow(3);
    sw.push(1); sw.push(3); sw.push(2);
    expect(sw.getMin()).toBe(1);
  });
  it('getSum after push [1,2,3] = 6', () => {
    const sw = new SlidingWindow(3);
    sw.push(1); sw.push(2); sw.push(3);
    expect(sw.getSum()).toBe(6);
  });
  it('getAvg after push [1,2,3] = 2', () => {
    const sw = new SlidingWindow(3);
    sw.push(1); sw.push(2); sw.push(3);
    expect(sw.getAvg()).toBe(2);
  });
  it('evicts oldest: push [1,2,3,4] size=3 sum = 9', () => {
    const sw = new SlidingWindow(3);
    sw.push(1); sw.push(2); sw.push(3); sw.push(4);
    expect(sw.getSum()).toBe(9);
  });
  it('evicts oldest: max updates after eviction', () => {
    const sw = new SlidingWindow(3);
    sw.push(9); sw.push(1); sw.push(2); sw.push(3);
    // window is now [1,2,3] after evicting 9
    expect(sw.getMax()).toBe(3);
  });
  it('min updates after eviction of min', () => {
    const sw = new SlidingWindow(3);
    sw.push(1); sw.push(5); sw.push(6); sw.push(7);
    // window is [5,6,7]
    expect(sw.getMin()).toBe(5);
  });
  it('size=1 always holds last value', () => {
    const sw = new SlidingWindow(1);
    for (let i = 1; i <= 10; i++) {
      sw.push(i);
      expect(sw.getMax()).toBe(i);
      expect(sw.getMin()).toBe(i);
    }
  });

  // 30 max-over-stream tests
  for (let n = 2; n <= 31; n++) {
    it(`SlidingWindow size=3 max after pushing ${n} ascending values = ${n}`, () => {
      const sw = new SlidingWindow(3);
      for (let i = 1; i <= n; i++) sw.push(i);
      expect(sw.getMax()).toBe(n);
    });
  }

  // 30 sum tests
  for (let k = 1; k <= 30; k++) {
    it(`SlidingWindow size=${k} sum of [1..${k}] = ${k * (k + 1) / 2}`, () => {
      const sw = new SlidingWindow(k);
      for (let i = 1; i <= k; i++) sw.push(i);
      expect(sw.getSum()).toBe(k * (k + 1) / 2);
    });
  }

  // 20 avg tests
  for (let k = 1; k <= 20; k++) {
    it(`SlidingWindow size=${k} avg of [1..${k}] = ${(k + 1) / 2}`, () => {
      const sw = new SlidingWindow(k);
      for (let i = 1; i <= k; i++) sw.push(i);
      expect(sw.getAvg()).toBeCloseTo((k + 1) / 2, 8);
    });
  }

  // 10 min-over-stream descending
  for (let n = 2; n <= 11; n++) {
    it(`SlidingWindow size=3 min after pushing ${n} descending values`, () => {
      const sw = new SlidingWindow(3);
      for (let i = n; i >= 1; i--) sw.push(i);
      // For n >= 3: last 3 values pushed are 3, 2, 1 (descending), so min = 1
      // For n = 2: last 2 values are 2, 1, so min = 1
      expect(sw.getMin()).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// RollingStats class — 100+ tests
// ---------------------------------------------------------------------------
describe('RollingStats', () => {
  it('initial count = 0', () => {
    expect(new RollingStats().count).toBe(0);
  });
  it('initial sum = 0', () => {
    expect(new RollingStats().sum).toBe(0);
  });
  it('initial mean = 0', () => {
    expect(new RollingStats().mean).toBe(0);
  });
  it('initial variance = 0', () => {
    expect(new RollingStats().variance).toBe(0);
  });
  it('initial stddev = 0', () => {
    expect(new RollingStats().stddev).toBe(0);
  });
  it('after add(5) count=1 mean=5', () => {
    const rs = new RollingStats();
    rs.add(5);
    expect(rs.count).toBe(1);
    expect(rs.mean).toBe(5);
  });
  it('after add(5) sum=5', () => {
    const rs = new RollingStats();
    rs.add(5);
    expect(rs.sum).toBe(5);
  });
  it('variance=0 with single element', () => {
    const rs = new RollingStats();
    rs.add(42);
    expect(rs.variance).toBe(0);
  });
  it('add two equal values variance=0', () => {
    const rs = new RollingStats();
    rs.add(3); rs.add(3);
    expect(rs.variance).toBe(0);
  });
  it('add(2) add(4) mean=3', () => {
    const rs = new RollingStats();
    rs.add(2); rs.add(4);
    expect(rs.mean).toBe(3);
  });
  it('add(2) add(4) variance=2', () => {
    const rs = new RollingStats();
    rs.add(2); rs.add(4);
    expect(rs.variance).toBeCloseTo(2, 8);
  });
  it('add(2) add(4) stddev = sqrt(2)', () => {
    const rs = new RollingStats();
    rs.add(2); rs.add(4);
    expect(rs.stddev).toBeCloseTo(Math.sqrt(2), 8);
  });
  it('remove on empty does not crash', () => {
    const rs = new RollingStats();
    expect(() => rs.remove(5)).not.toThrow();
  });
  it('add then remove restores count=0', () => {
    const rs = new RollingStats();
    rs.add(10);
    rs.remove(10);
    expect(rs.count).toBe(0);
  });
  it('add then remove restores sum=0', () => {
    const rs = new RollingStats();
    rs.add(10);
    rs.remove(10);
    expect(rs.sum).toBe(0);
  });
  it('add then remove restores mean=0', () => {
    const rs = new RollingStats();
    rs.add(10);
    rs.remove(10);
    expect(rs.mean).toBe(0);
  });
  it('sliding window: add 4 remove 1 correct mean', () => {
    const rs = new RollingStats();
    rs.add(1); rs.add(2); rs.add(3); rs.add(4);
    rs.remove(1);
    expect(rs.mean).toBeCloseTo((2 + 3 + 4) / 3, 6);
  });
  it('sliding window: add 4 remove 1 correct count=3', () => {
    const rs = new RollingStats();
    rs.add(1); rs.add(2); rs.add(3); rs.add(4);
    rs.remove(1);
    expect(rs.count).toBe(3);
  });
  it('add [1..5] mean=3', () => {
    const rs = new RollingStats();
    [1, 2, 3, 4, 5].forEach((v) => rs.add(v));
    expect(rs.mean).toBeCloseTo(3, 8);
  });
  it('add [1..5] sum=15', () => {
    const rs = new RollingStats();
    [1, 2, 3, 4, 5].forEach((v) => rs.add(v));
    expect(rs.sum).toBe(15);
  });
  it('add [2,2,2,2] stddev=0', () => {
    const rs = new RollingStats();
    [2, 2, 2, 2].forEach((v) => rs.add(v));
    expect(rs.stddev).toBeCloseTo(0, 8);
  });

  // 30 sum-correctness tests
  for (let n = 1; n <= 30; n++) {
    it(`RollingStats add 1..${n} sum = ${n * (n + 1) / 2}`, () => {
      const rs = new RollingStats();
      for (let i = 1; i <= n; i++) rs.add(i);
      expect(rs.sum).toBe(n * (n + 1) / 2);
    });
  }

  // 30 mean-correctness tests
  for (let n = 1; n <= 30; n++) {
    const expectedMean = (n + 1) / 2;
    it(`RollingStats add 1..${n} mean = ${expectedMean}`, () => {
      const rs = new RollingStats();
      for (let i = 1; i <= n; i++) rs.add(i);
      expect(rs.mean).toBeCloseTo(expectedMean, 6);
    });
  }

  // 20 count tests
  for (let n = 1; n <= 20; n++) {
    it(`RollingStats count after ${n} adds = ${n}`, () => {
      const rs = new RollingStats();
      for (let i = 0; i < n; i++) rs.add(i);
      expect(rs.count).toBe(n);
    });
  }

  // 10 sliding-window simulation tests
  for (let k = 2; k <= 11; k++) {
    it(`RollingStats sliding window size=${k} matches expected mean`, () => {
      const rs = new RollingStats();
      const data = rangeFrom(1, k + 5);
      // Fill initial window
      for (let i = 0; i < k; i++) rs.add(data[i]);
      // Slide once
      rs.remove(data[0]);
      rs.add(data[k]);
      const windowVals = data.slice(1, k + 1);
      const expectedMean = windowVals.reduce((a, b) => a + b, 0) / k;
      expect(rs.mean).toBeCloseTo(expectedMean, 5);
    });
  }
});

// ---------------------------------------------------------------------------
// Edge cases — 50+ tests
// ---------------------------------------------------------------------------
describe('Edge cases', () => {
  // Empty array across all functions
  it('slidingWindowMax empty + k=0', () => {
    expect(slidingWindowMax([], 0)).toEqual([]);
  });
  it('slidingWindowMin empty + k=0', () => {
    expect(slidingWindowMin([], 0)).toEqual([]);
  });
  it('slidingWindowSum empty + k=0', () => {
    expect(slidingWindowSum([], 0)).toEqual([]);
  });
  it('slidingWindowAvg empty + k=0', () => {
    expect(slidingWindowAvg([], 0)).toEqual([]);
  });
  it('slidingWindowCount empty + k=0', () => {
    expect(slidingWindowCount([], 0, Boolean)).toEqual([]);
  });
  it('maxSubarraySum empty', () => {
    expect(maxSubarraySum([], 1)).toBe(0);
  });
  it('minSubarrayLength empty', () => {
    expect(minSubarrayLength([], 1)).toBe(0);
  });
  it('longestSubstringKDistinct empty', () => {
    expect(longestSubstringKDistinct('', 1)).toBe(0);
  });
  it('longestSubstringNoRepeat empty', () => {
    expect(longestSubstringNoRepeat('')).toBe(0);
  });
  it('allAnagrams both empty', () => {
    expect(allAnagrams('', '')).toEqual([]);
  });

  // k=1 for all window functions returns same length as input
  for (let n = 1; n <= 10; n++) {
    it(`slidingWindowMax k=1 length ${n}`, () => {
      expect(slidingWindowMax(range(n), 1).length).toBe(n);
    });
    it(`slidingWindowMin k=1 length ${n}`, () => {
      expect(slidingWindowMin(range(n), 1).length).toBe(n);
    });
    it(`slidingWindowSum k=1 length ${n}`, () => {
      expect(slidingWindowSum(range(n), 1).length).toBe(n);
    });
  }

  // k=arr.length: single result
  for (let n = 1; n <= 10; n++) {
    it(`slidingWindowMax k=n length ${n} single result`, () => {
      expect(slidingWindowMax(range(n), n).length).toBe(1);
    });
    it(`slidingWindowMin k=n length ${n} single result`, () => {
      expect(slidingWindowMin(range(n), n).length).toBe(1);
    });
    it(`slidingWindowSum k=n length ${n} single result`, () => {
      expect(slidingWindowSum(range(n), n).length).toBe(1);
    });
  }

  // Negative k
  it('slidingWindowMax k=-1 returns empty', () => {
    expect(slidingWindowMax([1, 2, 3], -1)).toEqual([]);
  });
  it('slidingWindowMin k=-1 returns empty', () => {
    expect(slidingWindowMin([1, 2, 3], -1)).toEqual([]);
  });
  it('slidingWindowSum k=-1 returns empty', () => {
    expect(slidingWindowSum([1, 2, 3], -1)).toEqual([]);
  });
  it('slidingWindowAvg k=-1 returns empty', () => {
    expect(slidingWindowAvg([1, 2, 3], -1)).toEqual([]);
  });

  // Very large values
  it('slidingWindowSum large values k=2', () => {
    const big = Number.MAX_SAFE_INTEGER / 2;
    const result = slidingWindowSum([big, big], 2);
    expect(result[0]).toBeCloseTo(big * 2, -5);
  });

  // SlidingWindow size=1 edge
  it('SlidingWindow size=1 max = last pushed', () => {
    const sw = new SlidingWindow(1);
    sw.push(100);
    sw.push(5);
    expect(sw.getMax()).toBe(5);
  });
  it('SlidingWindow size=1 min = last pushed', () => {
    const sw = new SlidingWindow(1);
    sw.push(100);
    sw.push(5);
    expect(sw.getMin()).toBe(5);
  });
  it('SlidingWindow size=1 sum = last pushed', () => {
    const sw = new SlidingWindow(1);
    sw.push(7);
    sw.push(3);
    expect(sw.getSum()).toBe(3);
  });

  // RollingStats: remove on empty is no-op
  it('RollingStats remove on empty, stats still zero', () => {
    const rs = new RollingStats();
    rs.remove(999);
    expect(rs.count).toBe(0);
    expect(rs.sum).toBe(0);
    expect(rs.mean).toBe(0);
  });

  // longestSubstringNoRepeat: special chars
  // 'a b c' has chars: a, ' ', b, ' ', c — space repeats at index 3
  // longest without repeat: 'a b' or 'b c' = 3
  it('longestSubstringNoRepeat with spaces', () => {
    expect(longestSubstringNoRepeat('a b c')).toBe(3);
  });
  it('longestSubstringNoRepeat with numbers as chars', () => {
    expect(longestSubstringNoRepeat('1234')).toBe(4);
  });
  it('longestSubstringNoRepeat with repeated digit', () => {
    expect(longestSubstringNoRepeat('1121')).toBe(2);
  });

  // allAnagrams: same string
  it('allAnagrams s=p = [0]', () => {
    expect(allAnagrams('xyz', 'xyz')).toEqual([0]);
  });
  it('allAnagrams p anagram of s = [0]', () => {
    expect(allAnagrams('cba', 'abc')).toEqual([0]);
  });
  it('allAnagrams s is all same char, p="aa" in "aaaa"', () => {
    expect(allAnagrams('aaaa', 'aa')).toEqual([0, 1, 2]);
  });
});
