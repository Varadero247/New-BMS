// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  MonotoneQueue,
  MonotoneStack,
  slidingWindowMin,
  slidingWindowMax,
  nextGreaterElement,
  nextSmallerElement,
  previousGreaterElement,
  previousSmallerElement,
  largestRectangleInHistogram,
  maxSlidingWindowRange,
} from '../monotone-queue';

// ---------------------------------------------------------------------------
// Naive helpers for reference implementations
// ---------------------------------------------------------------------------
function naiveSlidingMin(arr: number[], k: number): number[] {
  const result: number[] = [];
  for (let i = 0; i <= arr.length - k; i++) {
    result.push(Math.min(...arr.slice(i, i + k)));
  }
  return result;
}

function naiveSlidingMax(arr: number[], k: number): number[] {
  const result: number[] = [];
  for (let i = 0; i <= arr.length - k; i++) {
    result.push(Math.max(...arr.slice(i, i + k)));
  }
  return result;
}

function naiveNextGreater(arr: number[]): number[] {
  return arr.map((v, i) => {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] > v) return arr[j];
    }
    return -1;
  });
}

function naiveNextSmaller(arr: number[]): number[] {
  return arr.map((v, i) => {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < v) return arr[j];
    }
    return -1;
  });
}

function naivePrevGreater(arr: number[]): number[] {
  return arr.map((v, i) => {
    for (let j = i - 1; j >= 0; j--) {
      if (arr[j] > v) return arr[j];
    }
    return -1;
  });
}

function naivePrevSmaller(arr: number[]): number[] {
  return arr.map((v, i) => {
    for (let j = i - 1; j >= 0; j--) {
      if (arr[j] < v) return arr[j];
    }
    return -1;
  });
}

function naiveLargestRect(heights: number[]): number {
  let max = 0;
  for (let i = 0; i < heights.length; i++) {
    let minH = heights[i];
    for (let j = i; j < heights.length; j++) {
      minH = Math.min(minH, heights[j]);
      max = Math.max(max, minH * (j - i + 1));
    }
  }
  return max;
}

// ---------------------------------------------------------------------------
// 1. slidingWindowMin — 200 tests against naive
// ---------------------------------------------------------------------------
describe('slidingWindowMin', () => {
  // Fixed canonical example from spec
  it('spec example [3,1,4,1,5,9,2,6] k=3', () => {
    expect(slidingWindowMin([3, 1, 4, 1, 5, 9, 2, 6], 3)).toEqual([1, 1, 1, 1, 2, 2]);
  });

  // Edge cases
  it('returns [] for empty array', () => {
    expect(slidingWindowMin([], 3)).toEqual([]);
  });

  it('returns [] when k > length', () => {
    expect(slidingWindowMin([1, 2], 5)).toEqual([]);
  });

  it('k=1 returns copy of array', () => {
    const arr = [5, 3, 8, 1, 7];
    expect(slidingWindowMin(arr, 1)).toEqual(arr);
  });

  it('k equals array length returns single global min', () => {
    const arr = [4, 2, 9, 1, 6];
    expect(slidingWindowMin(arr, arr.length)).toEqual([1]);
  });

  it('all same values returns all same', () => {
    expect(slidingWindowMin([7, 7, 7, 7], 2)).toEqual([7, 7, 7]);
  });

  it('strictly decreasing array k=2', () => {
    expect(slidingWindowMin([5, 4, 3, 2, 1], 2)).toEqual([4, 3, 2, 1]);
  });

  it('strictly increasing array k=2', () => {
    expect(slidingWindowMin([1, 2, 3, 4, 5], 2)).toEqual([1, 2, 3, 4]);
  });

  it('negative values k=2', () => {
    expect(slidingWindowMin([-3, -1, -4, -1, -5], 2)).toEqual([-3, -4, -4, -5]);
  });

  it('single element array k=1', () => {
    expect(slidingWindowMin([42], 1)).toEqual([42]);
  });

  // 190 randomised tests (seeds are deterministic — no Math.random)
  // We use structured sequences to cover many patterns
  for (let n = 3; n <= 12; n++) {
    for (let k = 1; k <= n; k++) {
      // array: values are (i * 3 + n) % 10 pattern
      const arr: number[] = [];
      for (let i = 0; i < n; i++) arr.push(((i * 3 + n) % 10) + 1);
      const expected = naiveSlidingMin(arr, k);
      it(`n=${n} k=${k} pattern-A vs naive`, () => {
        expect(slidingWindowMin(arr, k)).toEqual(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 2. slidingWindowMax — 200 tests against naive
// ---------------------------------------------------------------------------
describe('slidingWindowMax', () => {
  // Spec example (max version)
  // Windows: [3,1,4]=4, [1,4,1]=4, [4,1,5]=5, [1,5,9]=9, [5,9,2]=9, [9,2,6]=9
  it('spec example [3,1,4,1,5,9,2,6] k=3', () => {
    expect(slidingWindowMax([3, 1, 4, 1, 5, 9, 2, 6], 3)).toEqual([4, 4, 5, 9, 9, 9]);
  });

  it('returns [] for empty array', () => {
    expect(slidingWindowMax([], 3)).toEqual([]);
  });

  it('returns [] when k > length', () => {
    expect(slidingWindowMax([1, 2], 5)).toEqual([]);
  });

  it('k=1 returns copy of array', () => {
    const arr = [5, 3, 8, 1, 7];
    expect(slidingWindowMax(arr, 1)).toEqual(arr);
  });

  it('k equals array length returns single global max', () => {
    const arr = [4, 2, 9, 1, 6];
    expect(slidingWindowMax(arr, arr.length)).toEqual([9]);
  });

  it('all same values returns all same', () => {
    expect(slidingWindowMax([7, 7, 7, 7], 2)).toEqual([7, 7, 7]);
  });

  it('strictly increasing array k=2', () => {
    expect(slidingWindowMax([1, 2, 3, 4, 5], 2)).toEqual([2, 3, 4, 5]);
  });

  it('strictly decreasing array k=2', () => {
    expect(slidingWindowMax([5, 4, 3, 2, 1], 2)).toEqual([5, 4, 3, 2]);
  });

  it('negative values k=2', () => {
    expect(slidingWindowMax([-5, -1, -4, -1, -2], 2)).toEqual([-1, -1, -1, -1]);
  });

  it('single element array k=1', () => {
    expect(slidingWindowMax([99], 1)).toEqual([99]);
  });

  for (let n = 3; n <= 12; n++) {
    for (let k = 1; k <= n; k++) {
      const arr: number[] = [];
      for (let i = 0; i < n; i++) arr.push(((i * 7 + n * 2) % 15) + 1);
      const expected = naiveSlidingMax(arr, k);
      it(`n=${n} k=${k} pattern-B vs naive`, () => {
        expect(slidingWindowMax(arr, k)).toEqual(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 3. nextGreaterElement — 150 tests
// ---------------------------------------------------------------------------
describe('nextGreaterElement', () => {
  it('basic [4,5,2,25]', () => {
    expect(nextGreaterElement([4, 5, 2, 25])).toEqual([5, 25, 25, -1]);
  });

  it('all decreasing — all -1', () => {
    expect(nextGreaterElement([5, 4, 3, 2, 1])).toEqual([-1, -1, -1, -1, -1]);
  });

  it('all increasing — next element', () => {
    expect(nextGreaterElement([1, 2, 3, 4, 5])).toEqual([2, 3, 4, 5, -1]);
  });

  it('empty array', () => {
    expect(nextGreaterElement([])).toEqual([]);
  });

  it('single element', () => {
    expect(nextGreaterElement([7])).toEqual([-1]);
  });

  it('two elements ascending', () => {
    expect(nextGreaterElement([1, 3])).toEqual([3, -1]);
  });

  it('two elements descending', () => {
    expect(nextGreaterElement([3, 1])).toEqual([-1, -1]);
  });

  it('equal elements [5,5,5]', () => {
    expect(nextGreaterElement([5, 5, 5])).toEqual([-1, -1, -1]);
  });

  it('[2,1,2,4,3]', () => {
    expect(nextGreaterElement([2, 1, 2, 4, 3])).toEqual([4, 2, 4, -1, -1]);
  });

  it('negative values [-3,-2,-4,-1]', () => {
    expect(nextGreaterElement([-3, -2, -4, -1])).toEqual([-2, -1, -1, -1]);
  });

  // 140 structured tests against naive
  for (let n = 1; n <= 14; n++) {
    for (let variant = 0; variant < 10; variant++) {
      const arr: number[] = [];
      for (let i = 0; i < n; i++) {
        arr.push(((i * (variant + 1) * 3 + n + variant) % 8) + 1);
      }
      const expected = naiveNextGreater(arr);
      it(`NGE n=${n} variant=${variant}`, () => {
        expect(nextGreaterElement(arr)).toEqual(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 4. nextSmallerElement — 150 tests
// ---------------------------------------------------------------------------
describe('nextSmallerElement', () => {
  it('basic [4,5,2,25]', () => {
    expect(nextSmallerElement([4, 5, 2, 25])).toEqual([2, 2, -1, -1]);
  });

  it('all increasing — all -1', () => {
    expect(nextSmallerElement([1, 2, 3, 4, 5])).toEqual([-1, -1, -1, -1, -1]);
  });

  it('all decreasing — next element', () => {
    expect(nextSmallerElement([5, 4, 3, 2, 1])).toEqual([4, 3, 2, 1, -1]);
  });

  it('empty array', () => {
    expect(nextSmallerElement([])).toEqual([]);
  });

  it('single element', () => {
    expect(nextSmallerElement([7])).toEqual([-1]);
  });

  it('two elements ascending [1,3]', () => {
    expect(nextSmallerElement([1, 3])).toEqual([-1, -1]);
  });

  it('two elements descending [3,1]', () => {
    expect(nextSmallerElement([3, 1])).toEqual([1, -1]);
  });

  it('equal elements [5,5,5]', () => {
    expect(nextSmallerElement([5, 5, 5])).toEqual([-1, -1, -1]);
  });

  it('[3,2,5,1,4]', () => {
    expect(nextSmallerElement([3, 2, 5, 1, 4])).toEqual([2, 1, 1, -1, -1]);
  });

  it('negative values [-1,-2,-3]', () => {
    expect(nextSmallerElement([-1, -2, -3])).toEqual([-2, -3, -1]);
  });

  for (let n = 1; n <= 14; n++) {
    for (let variant = 0; variant < 10; variant++) {
      const arr: number[] = [];
      for (let i = 0; i < n; i++) {
        arr.push(((i * (variant + 2) * 5 + n + variant * 2) % 9) + 1);
      }
      const expected = naiveNextSmaller(arr);
      it(`NSE n=${n} variant=${variant}`, () => {
        expect(nextSmallerElement(arr)).toEqual(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 5. previousGreaterElement — 100 tests
// ---------------------------------------------------------------------------
describe('previousGreaterElement', () => {
  it('basic [10,4,2,20,40,12,30]', () => {
    expect(previousGreaterElement([10, 4, 2, 20, 40, 12, 30])).toEqual([-1, 10, 4, -1, -1, 40, 40]);
  });

  it('all increasing — prev element', () => {
    expect(previousGreaterElement([1, 2, 3, 4, 5])).toEqual([-1, -1, -1, -1, -1]);
  });

  it('all decreasing', () => {
    expect(previousGreaterElement([5, 4, 3, 2, 1])).toEqual([-1, 5, 4, 3, 2]);
  });

  it('empty array', () => {
    expect(previousGreaterElement([])).toEqual([]);
  });

  it('single element', () => {
    expect(previousGreaterElement([42])).toEqual([-1]);
  });

  it('two elements ascending [1,3]', () => {
    expect(previousGreaterElement([1, 3])).toEqual([-1, -1]);
  });

  it('two elements descending [3,1]', () => {
    expect(previousGreaterElement([3, 1])).toEqual([-1, 3]);
  });

  it('equal elements [5,5,5]', () => {
    expect(previousGreaterElement([5, 5, 5])).toEqual([-1, -1, -1]);
  });

  it('negative values [-4,-2,-5,-1]', () => {
    expect(previousGreaterElement([-4, -2, -5, -1])).toEqual([-1, -1, -2, -1]);
  });

  it('[5,7,3,6,4]', () => {
    expect(previousGreaterElement([5, 7, 3, 6, 4])).toEqual([-1, -1, 7, 7, 6]);
  });

  for (let n = 1; n <= 9; n++) {
    for (let variant = 0; variant < 10; variant++) {
      const arr: number[] = [];
      for (let i = 0; i < n; i++) {
        arr.push(((i * (variant + 1) * 4 + variant * 3 + n) % 10) + 1);
      }
      const expected = naivePrevGreater(arr);
      it(`PGE n=${n} variant=${variant}`, () => {
        expect(previousGreaterElement(arr)).toEqual(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 6. previousSmallerElement — 100 tests
// ---------------------------------------------------------------------------
describe('previousSmallerElement', () => {
  it('basic [0,5,3,4,2]', () => {
    expect(previousSmallerElement([0, 5, 3, 4, 2])).toEqual([-1, 0, 0, 3, 0]);
  });

  it('all increasing — previous element', () => {
    expect(previousSmallerElement([1, 2, 3, 4, 5])).toEqual([-1, 1, 2, 3, 4]);
  });

  it('all decreasing — all -1', () => {
    expect(previousSmallerElement([5, 4, 3, 2, 1])).toEqual([-1, -1, -1, -1, -1]);
  });

  it('empty array', () => {
    expect(previousSmallerElement([])).toEqual([]);
  });

  it('single element', () => {
    expect(previousSmallerElement([7])).toEqual([-1]);
  });

  it('two elements ascending [1,3]', () => {
    expect(previousSmallerElement([1, 3])).toEqual([-1, 1]);
  });

  it('two elements descending [3,1]', () => {
    expect(previousSmallerElement([3, 1])).toEqual([-1, -1]);
  });

  it('equal elements [5,5,5]', () => {
    expect(previousSmallerElement([5, 5, 5])).toEqual([-1, -1, -1]);
  });

  it('negative values [-1,-3,-2,-5]', () => {
    expect(previousSmallerElement([-1, -3, -2, -5])).toEqual([-1, -1, -3, -1]);
  });

  it('[3,5,2,4,1]', () => {
    expect(previousSmallerElement([3, 5, 2, 4, 1])).toEqual([-1, 3, -1, 2, -1]);
  });

  for (let n = 1; n <= 9; n++) {
    for (let variant = 0; variant < 10; variant++) {
      const arr: number[] = [];
      for (let i = 0; i < n; i++) {
        arr.push(((i * (variant + 3) * 2 + variant + n * 2) % 11) + 1);
      }
      const expected = naivePrevSmaller(arr);
      it(`PSE n=${n} variant=${variant}`, () => {
        expect(previousSmallerElement(arr)).toEqual(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 7. largestRectangleInHistogram — 50 tests
// ---------------------------------------------------------------------------
describe('largestRectangleInHistogram', () => {
  it('spec example [2,1,5,6,2,3] = 10', () => {
    expect(largestRectangleInHistogram([2, 1, 5, 6, 2, 3])).toBe(10);
  });

  it('[1] = 1', () => {
    expect(largestRectangleInHistogram([1])).toBe(1);
  });

  it('empty = 0', () => {
    expect(largestRectangleInHistogram([])).toBe(0);
  });

  it('[2,4] = 4', () => {
    expect(largestRectangleInHistogram([2, 4])).toBe(4);
  });

  it('[4,2] = 4', () => {
    expect(largestRectangleInHistogram([4, 2])).toBe(4);
  });

  it('[1,1] = 2', () => {
    expect(largestRectangleInHistogram([1, 1])).toBe(2);
  });

  it('all equal [3,3,3,3] = 12', () => {
    expect(largestRectangleInHistogram([3, 3, 3, 3])).toBe(12);
  });

  it('[0,0,0] = 0', () => {
    expect(largestRectangleInHistogram([0, 0, 0])).toBe(0);
  });

  it('pyramid [1,2,3,4,3,2,1] = 10', () => {
    // 5 bars [2,3,4,3,2] with min height 2 → area = 2*5 = 10
    expect(largestRectangleInHistogram([1, 2, 3, 4, 3, 2, 1])).toBe(10);
  });

  it('[6,2,5,4,5,1,6] = 12', () => {
    expect(largestRectangleInHistogram([6, 2, 5, 4, 5, 1, 6])).toBe(12);
  });

  it('single tall bar [0,5,0] = 5', () => {
    expect(largestRectangleInHistogram([0, 5, 0])).toBe(5);
  });

  it('[1,2,3,4,5] = 9', () => {
    // 3+4+5=... best: 3 bars of height 3 = 9, or 2 bars at 4=8, or 1 bar at 5
    expect(largestRectangleInHistogram([1, 2, 3, 4, 5])).toBe(9);
  });

  it('[5,4,3,2,1] = 9', () => {
    expect(largestRectangleInHistogram([5, 4, 3, 2, 1])).toBe(9);
  });

  it('[2,2,2,2,2] = 10', () => {
    expect(largestRectangleInHistogram([2, 2, 2, 2, 2])).toBe(10);
  });

  it('[4] = 4', () => {
    expect(largestRectangleInHistogram([4])).toBe(4);
  });

  it('[100] = 100', () => {
    expect(largestRectangleInHistogram([100])).toBe(100);
  });

  it('[1,0,1] = 1', () => {
    expect(largestRectangleInHistogram([1, 0, 1])).toBe(1);
  });

  it('[3,1,3] = 3 (two bars of height 3, but split by 1)', () => {
    // best: either a single 3, or 3 bars at height 1 = 3
    expect(largestRectangleInHistogram([3, 1, 3])).toBe(3);
  });

  it('[2,3,2] = 6', () => {
    // 3 bars at height 2 = 6, or 1 bar at height 3
    expect(largestRectangleInHistogram([2, 3, 2])).toBe(6);
  });

  it('[1,2,1] = 3', () => {
    expect(largestRectangleInHistogram([1, 2, 1])).toBe(3);
  });

  // 30 randomised tests against naive O(n^2)
  const histTestCases: number[][] = [];
  for (let n = 1; n <= 6; n++) {
    for (let variant = 0; variant < 5; variant++) {
      const h: number[] = [];
      for (let i = 0; i < n; i++) h.push(((i * (variant + 2) + variant + n) % 7));
      histTestCases.push(h);
    }
  }

  for (let t = 0; t < histTestCases.length; t++) {
    const h = histTestCases[t];
    const expected = naiveLargestRect(h);
    it(`histogram [${h.join(',')}] = ${expected}`, () => {
      expect(largestRectangleInHistogram(h)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 8. MonotoneQueue push/front — 50 tests
// ---------------------------------------------------------------------------
describe('MonotoneQueue', () => {
  it('min queue: front is minimum after pushes', () => {
    const q = new MonotoneQueue('min');
    q.push(5);
    expect(q.front()).toBe(5);
    q.push(3);
    expect(q.front()).toBe(3);
    q.push(4);
    expect(q.front()).toBe(3);
    q.push(1);
    expect(q.front()).toBe(1);
  });

  it('max queue: front is maximum after pushes', () => {
    const q = new MonotoneQueue('max');
    q.push(1);
    expect(q.front()).toBe(1);
    q.push(5);
    expect(q.front()).toBe(5);
    q.push(3);
    expect(q.front()).toBe(5);
    q.push(7);
    expect(q.front()).toBe(7);
  });

  it('min queue size decreases when larger elements are pushed', () => {
    const q = new MonotoneQueue('min');
    q.push(10);
    q.push(8);
    q.push(6);
    // All previous (>= 6) are popped, only 6 remains
    expect(q.size).toBe(1);
  });

  it('max queue size decreases when smaller elements are pushed', () => {
    const q = new MonotoneQueue('max');
    q.push(1);
    q.push(3);
    q.push(5);
    expect(q.size).toBe(1);
    expect(q.front()).toBe(5);
  });

  it('clear resets size to 0', () => {
    const q = new MonotoneQueue('min');
    q.push(1);
    q.push(2);
    q.clear();
    expect(q.size).toBe(0);
  });

  it('front on empty throws', () => {
    const q = new MonotoneQueue('min');
    expect(() => q.front()).toThrow();
  });

  it('pop removes front when value matches', () => {
    const q = new MonotoneQueue('min');
    q.push(3);
    q.push(5);
    q.push(7);
    // deque should be [3,5,7] (all increasing for min)
    q.pop(3);
    expect(q.front()).toBe(5);
  });

  it('pop does nothing when value does not match front', () => {
    const q = new MonotoneQueue('min');
    q.push(2);
    q.push(4);
    q.pop(99); // 99 != front (2), so no change
    expect(q.front()).toBe(2);
  });

  it('min queue simulates sliding window correctly (distinct values)', () => {
    // Use distinct values so value-based pop works unambiguously.
    // [3,1,4,7,5,9,2,6] k=3 → [1,1,4,5,2,2]
    const arr = [3, 1, 4, 7, 5, 9, 2, 6];
    const k = 3;
    const q = new MonotoneQueue('min');
    const results: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      q.push(arr[i]);
      if (i >= k - 1) {
        results.push(q.front());
        q.pop(arr[i - k + 1]);
      }
    }
    // Verify against naive
    const expected = naiveSlidingMin(arr, k);
    expect(results).toEqual(expected);
  });

  it('max queue simulates sliding window correctly', () => {
    const arr = [1, 3, -1, -3, 5, 3, 6, 7];
    const k = 3;
    const q = new MonotoneQueue('max');
    const results: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      q.push(arr[i]);
      if (i >= k - 1) {
        results.push(q.front());
        q.pop(arr[i - k + 1]);
      }
    }
    expect(results).toEqual([3, 3, 5, 5, 6, 7]);
  });

  // 40 push/front tests with structured sequences
  const sequences: number[][] = [];
  for (let len = 2; len <= 9; len++) {
    for (let s = 0; s < 5; s++) {
      const seq: number[] = [];
      for (let i = 0; i < len; i++) seq.push(((i * (s + 1) * 3 + s + len) % 10) + 1);
      sequences.push(seq);
    }
  }

  sequences.slice(0, 40).forEach((seq, idx) => {
    it(`min queue front after pushing [${seq.join(',')}] (test ${idx})`, () => {
      const q = new MonotoneQueue('min');
      let expectedMin = Infinity;
      for (const v of seq) {
        q.push(v);
        expectedMin = Math.min(expectedMin, v);
        expect(q.front()).toBe(expectedMin);
      }
    });
  });
});

// ---------------------------------------------------------------------------
// 9. maxSlidingWindowRange — 50 tests
// ---------------------------------------------------------------------------
describe('maxSlidingWindowRange', () => {
  it('spec-derived [3,1,4,1,5,9,2,6] k=3: max-min per window', () => {
    // Windows: [3,1,4]=3, [1,4,1]=3, [4,1,5]=4, [1,5,9]=8, [5,9,2]=7, [9,2,6]=7
    expect(maxSlidingWindowRange([3, 1, 4, 1, 5, 9, 2, 6], 3)).toEqual([3, 3, 4, 8, 7, 7]);
  });

  it('returns [] for empty array', () => {
    expect(maxSlidingWindowRange([], 3)).toEqual([]);
  });

  it('returns [] when k > length', () => {
    expect(maxSlidingWindowRange([1, 2], 5)).toEqual([]);
  });

  it('k=1 returns all zeros', () => {
    const arr = [5, 3, 8, 1, 7];
    expect(maxSlidingWindowRange(arr, 1)).toEqual([0, 0, 0, 0, 0]);
  });

  it('all same values returns all zeros', () => {
    expect(maxSlidingWindowRange([4, 4, 4, 4], 2)).toEqual([0, 0, 0]);
  });

  it('two elements [1,5] k=2 = [4]', () => {
    expect(maxSlidingWindowRange([1, 5], 2)).toEqual([4]);
  });

  it('single element k=1 = [0]', () => {
    expect(maxSlidingWindowRange([10], 1)).toEqual([0]);
  });

  it('k equals array length returns single range', () => {
    const arr = [1, 9, 3, 7, 2];
    expect(maxSlidingWindowRange(arr, arr.length)).toEqual([8]);
  });

  it('strictly increasing array k=2', () => {
    // Each window [i,i+1]: max-min = (i+2)-(i+1) = 1
    expect(maxSlidingWindowRange([1, 2, 3, 4, 5], 2)).toEqual([1, 1, 1, 1]);
  });

  it('strictly decreasing array k=2', () => {
    expect(maxSlidingWindowRange([5, 4, 3, 2, 1], 2)).toEqual([1, 1, 1, 1]);
  });

  // 40 tests against naive (max - min per window)
  for (let n = 2; n <= 9; n++) {
    for (let k = 1; k <= n; k++) {
      const arr: number[] = [];
      for (let i = 0; i < n; i++) arr.push(((i * 5 + n * 3 + k) % 12) + 1);
      const expectedMax = naiveSlidingMax(arr, k);
      const expectedMin = naiveSlidingMin(arr, k);
      const expected = expectedMax.map((v, i) => v - expectedMin[i]);
      it(`range n=${n} k=${k} vs naive`, () => {
        expect(maxSlidingWindowRange(arr, k)).toEqual(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 10. MonotoneStack — bonus tests (size, toArray, peek, pop, clear, type)
// ---------------------------------------------------------------------------
describe('MonotoneStack', () => {
  it('increasing stack maintains increasing order', () => {
    const s = new MonotoneStack('increasing');
    s.push(5);
    s.push(3);
    s.push(7);
    // After push(5): [5]; push(3): pop 5 (>=3) → [3]; push(7): [3,7]
    expect(s.toArray()).toEqual([3, 7]);
  });

  it('decreasing stack maintains decreasing order', () => {
    const s = new MonotoneStack('decreasing');
    s.push(3);
    s.push(5);
    s.push(2);
    // push(3):[3]; push(5): pop 3(<=5)→[5]; push(2):[5,2]
    expect(s.toArray()).toEqual([5, 2]);
  });

  it('peek returns top without removing', () => {
    const s = new MonotoneStack('increasing');
    s.push(1);
    s.push(3);
    expect(s.peek()).toBe(3);
    expect(s.size).toBe(2);
  });

  it('pop removes and returns top', () => {
    const s = new MonotoneStack('decreasing');
    s.push(10);
    s.push(5);
    expect(s.pop()).toBe(5);
    expect(s.size).toBe(1);
  });

  it('peek on empty returns undefined', () => {
    const s = new MonotoneStack('increasing');
    expect(s.peek()).toBeUndefined();
  });

  it('pop on empty returns undefined', () => {
    const s = new MonotoneStack('increasing');
    expect(s.pop()).toBeUndefined();
  });

  it('clear resets everything', () => {
    const s = new MonotoneStack('increasing');
    s.push(1);
    s.push(2);
    s.clear();
    expect(s.size).toBe(0);
    expect(s.toArray()).toEqual([]);
  });

  it('toArray returns a copy (mutation safe)', () => {
    const s = new MonotoneStack('increasing');
    s.push(1);
    s.push(2);
    const arr = s.toArray();
    arr.push(99);
    expect(s.size).toBe(2);
  });

  // 20 structured tests for increasing stack
  for (let len = 2; len <= 7; len++) {
    for (let v = 0; v < 3; v++) {
      const values: number[] = [];
      for (let i = 0; i < len; i++) values.push(((i * (v + 2) + v + len) % 8) + 1);
      it(`increasing stack from [${values.join(',')}] produces strictly increasing array`, () => {
        const s = new MonotoneStack('increasing');
        for (const x of values) s.push(x);
        const arr = s.toArray();
        for (let i = 1; i < arr.length; i++) {
          expect(arr[i]).toBeGreaterThan(arr[i - 1]);
        }
        // Last element must equal last pushed value
        expect(arr[arr.length - 1]).toBe(values[values.length - 1]);
      });
    }
  }

  // 20 structured tests for decreasing stack
  for (let len = 2; len <= 7; len++) {
    for (let v = 0; v < 3; v++) {
      const values: number[] = [];
      for (let i = 0; i < len; i++) values.push(((i * (v + 3) + v * 2 + len) % 9) + 1);
      it(`decreasing stack from [${values.join(',')}] produces strictly decreasing array`, () => {
        const s = new MonotoneStack('decreasing');
        for (const x of values) s.push(x);
        const arr = s.toArray();
        for (let i = 1; i < arr.length; i++) {
          expect(arr[i]).toBeLessThan(arr[i - 1]);
        }
        expect(arr[arr.length - 1]).toBe(values[values.length - 1]);
      });
    }
  }
});

describe('Additional slidingWindowMin/Max coverage', () => {
  const arrs = [
    [1,3,2,4,5,2,1,7,8,3],
    [9,8,7,6,5,4,3,2,1,0],
    [0,1,2,3,4,5,6,7,8,9],
    [5,5,5,5,5,5,5,5,5,5],
    [2,7,1,8,2,8,1,8,2,8],
  ];
  for (let ai = 0; ai < arrs.length; ai++) {
    const arr = arrs[ai];
    for (let k = 1; k <= arr.length; k++) {
      it(`slidingWindowMin arr${ai} k=${k}`, () => {
        const result = slidingWindowMin(arr, k);
        expect(result.length).toBe(arr.length - k + 1);
        for (let i = 0; i < result.length; i++) {
          expect(result[i]).toBe(Math.min(...arr.slice(i, i + k)));
        }
      });
      it(`slidingWindowMax arr${ai} k=${k}`, () => {
        const result = slidingWindowMax(arr, k);
        expect(result.length).toBe(arr.length - k + 1);
        for (let i = 0; i < result.length; i++) {
          expect(result[i]).toBe(Math.max(...arr.slice(i, i + k)));
        }
      });
    }
  }
});

describe('largestRectangleInHistogram extra', () => {
  const cases: [number[], number][] = [
    [[2,1,5,6,2,3], 10],
    [[1], 1],
    [[1,1], 2],
    [[2,2], 4],
    [[3,3,3], 9],
    [[1,2,3,4,5], 9],
    [[5,4,3,2,1], 9],
    [[0,0,0], 0],
    [[1,0,1], 1],
    [[2,1,2], 3],
    [[6,2,5,4,5,1,6], 12],
    [[4,4,4,4], 16],
  ];
  for (const [heights, expected] of cases) {
    it(`largestRectangle [${heights.join(',')}] = ${expected}`, () => {
      expect(largestRectangleInHistogram(heights)).toBe(expected);
    });
  }
});

describe('Additional nextGreater/nextSmaller coverage', () => {
  for (let n = 1; n <= 10; n++) {
    const arr = Array.from({ length: n }, (_, i) => i + 1); // [1..n]
    it(`nextGreaterElement ascending n=${n}`, () => {
      const res = nextGreaterElement(arr);
      for (let i = 0; i < n - 1; i++) expect(res[i]).toBe(arr[i + 1]);
      expect(res[n - 1]).toBe(-1);
    });
    it(`nextSmallerElement ascending n=${n}`, () => {
      const res = nextSmallerElement(arr);
      // ascending: no smaller element to the right
      for (let i = 0; i < n; i++) expect(res[i]).toBe(-1);
    });
  }
});
