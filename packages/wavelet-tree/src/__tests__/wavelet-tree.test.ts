// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  WaveletTree,
  kthSmallest,
  rangeFrequency,
  rangeCountLessEqual,
  rangeMedian,
} from '../wavelet-tree';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function naiveSorted(arr: number[], l: number, r: number): number[] {
  return arr.slice(l, r + 1).sort((a, b) => a - b);
}
function naiveCount(arr: number[], l: number, r: number, v: number): number {
  let c = 0;
  for (let i = l; i <= r; i++) if (arr[i] === v) c++;
  return c;
}
function naiveCountLE(arr: number[], l: number, r: number, v: number): number {
  let c = 0;
  for (let i = l; i <= r; i++) if (arr[i] <= v) c++;
  return c;
}
function naiveCountRange(arr: number[], l: number, r: number, lo: number, hi: number): number {
  let c = 0;
  for (let i = l; i <= r; i++) if (arr[i] >= lo && arr[i] <= hi) c++;
  return c;
}

// ---------------------------------------------------------------------------
// Section 1: kth smallest — query() via WaveletTree (200 tests)
// ---------------------------------------------------------------------------
describe('WaveletTree.query – kth smallest: standard array [3,1,4,1,5,9,2,6,5,3,5]', () => {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
  for (let trial = 0; trial < 50; trial++) {
    const l = trial % arr.length;
    const r = Math.min(l + 3, arr.length - 1);
    const sub = naiveSorted(arr, l, r);
    const k = (trial % sub.length) + 1;
    it(`kth smallest trial ${trial}: arr[${l}..${r}] k=${k}`, () => {
      expect(new WaveletTree(arr).query(l, r, k)).toBe(sub[k - 1]);
    });
  }
});

describe('WaveletTree.query – kth smallest: sorted 1..n, k=1 and k=n', () => {
  for (let n = 1; n <= 50; n++) {
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    it(`sorted 1..${n} k=1 => 1`, () => {
      expect(new WaveletTree(arr).query(0, n - 1, 1)).toBe(1);
    });
    it(`sorted 1..${n} k=${n} => ${n}`, () => {
      expect(new WaveletTree(arr).query(0, n - 1, n)).toBe(n);
    });
  }
});

describe('WaveletTree.query – kth smallest: reversed arrays', () => {
  for (let n = 2; n <= 51; n++) {
    const arr = Array.from({ length: n }, (_, i) => n - i);
    it(`reversed 1..${n} k=1 => 1`, () => {
      expect(new WaveletTree(arr).query(0, n - 1, 1)).toBe(1);
    });
  }
});

describe('WaveletTree.query – kth smallest: all-duplicates array', () => {
  for (let v = 1; v <= 50; v++) {
    const arr = Array(5).fill(v);
    it(`all-${v} array of length 5, k=1 => ${v}`, () => {
      expect(new WaveletTree(arr).query(0, 4, 1)).toBe(v);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 2: count occurrences — WaveletTree.count() (200 tests)
// ---------------------------------------------------------------------------
describe('WaveletTree.count – count occurrences: [1,2,3,2,1,4,2,5,2,3]', () => {
  const arr = [1, 2, 3, 2, 1, 4, 2, 5, 2, 3];
  for (let l = 0; l < arr.length; l++) {
    for (let r = l; r < arr.length; r++) {
      if ((l * arr.length + r) >= 50) break;
      for (const v of [1, 2, 3]) {
        it(`count arr[${l}..${r}] v=${v}`, () => {
          expect(new WaveletTree(arr).count(l, r, v)).toBe(naiveCount(arr, l, r, v));
        });
      }
    }
    if (l * arr.length >= 50) break;
  }
});

describe('WaveletTree.count – count in all-same arrays', () => {
  for (let v = 1; v <= 50; v++) {
    const arr = Array(5).fill(v);
    it(`all-${v} array count(0,4,${v}) => 5`, () => {
      expect(new WaveletTree(arr).count(0, 4, v)).toBe(5);
    });
  }
});

describe('WaveletTree.count – value not present returns 0', () => {
  for (let n = 1; n <= 50; n++) {
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    it(`1..${n} count for absent 0 => 0`, () => {
      expect(new WaveletTree(arr).count(0, n - 1, 0)).toBe(0);
    });
  }
});

describe('WaveletTree.count – full range vs naive on 1..10 repeated', () => {
  for (let reps = 1; reps <= 50; reps++) {
    const arr = Array.from({ length: reps * 10 }, (_, i) => (i % 10) + 1);
    it(`count of 5 in 1..10 repeated ${reps}x => ${reps}`, () => {
      expect(new WaveletTree(arr).count(0, reps * 10 - 1, 5)).toBe(reps);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 3: countLessEqual — WaveletTree.countLessEqual() (200 tests)
// ---------------------------------------------------------------------------
describe('WaveletTree.countLessEqual – sorted 1..n, countLE(0,n-1,k)=k', () => {
  for (let n = 1; n <= 50; n++) {
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const tree = new WaveletTree(arr);
    it(`sorted 1..${n} countLE(0,n-1,${Math.ceil(n / 2)}) = ${Math.ceil(n / 2)}`, () => {
      const v = Math.ceil(n / 2);
      expect(tree.countLessEqual(0, n - 1, v)).toBe(naiveCountLE(arr, 0, n - 1, v));
    });
  }
});

describe('WaveletTree.countLessEqual – v >= max => full range length', () => {
  for (let n = 1; n <= 50; n++) {
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    it(`countLE v=n+1 for 1..${n} => ${n}`, () => {
      expect(new WaveletTree(arr).countLessEqual(0, n - 1, n + 1)).toBe(n);
    });
  }
});

describe('WaveletTree.countLessEqual – v < min => 0', () => {
  for (let n = 1; n <= 50; n++) {
    const arr = Array.from({ length: n }, (_, i) => i + 2);
    it(`countLE v=0 for 2..${n + 1} => 0`, () => {
      expect(new WaveletTree(arr).countLessEqual(0, n - 1, 0)).toBe(0);
    });
  }
});

describe('WaveletTree.countLessEqual – various arrays vs naive', () => {
  const arr = [5, 3, 8, 1, 9, 2, 7, 4, 6, 10];
  for (let v = 0; v <= 11; v++) {
    it(`countLE full range v=${v} vs naive`, () => {
      expect(new WaveletTree(arr).countLessEqual(0, 9, v)).toBe(naiveCountLE(arr, 0, 9, v));
    });
  }
  // Sub-range tests
  for (let l = 0; l < 5; l++) {
    for (let r = l + 2; r < arr.length; r++) {
      if (l * 10 + r >= 38) break;
      const v = 5;
      it(`countLE arr[${l}..${r}] v=${v} vs naive`, () => {
        expect(new WaveletTree(arr).countLessEqual(l, r, v)).toBe(naiveCountLE(arr, l, r, v));
      });
    }
    if (l * 10 >= 38) break;
  }
});

// ---------------------------------------------------------------------------
// Section 4: countRange — WaveletTree.countRange() (150 tests)
// ---------------------------------------------------------------------------
describe('WaveletTree.countRange – full range vs naive on [1..10]', () => {
  const arr = Array.from({ length: 10 }, (_, i) => i + 1);
  for (let lo = 1; lo <= 5; lo++) {
    for (let hi = lo; hi <= 10; hi++) {
      it(`countRange [0..9] [${lo}..${hi}] vs naive`, () => {
        expect(new WaveletTree(arr).countRange(0, 9, lo, hi)).toBe(naiveCountRange(arr, 0, 9, lo, hi));
      });
    }
  }
});

describe('WaveletTree.countRange – sub-ranges of [3,1,4,1,5,9,2,6,5,3,5]', () => {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
  for (let trial = 0; trial < 50; trial++) {
    const l = trial % arr.length;
    const r = Math.min(l + 4, arr.length - 1);
    const lo = 1 + (trial % 4);
    const hi = lo + 2 + (trial % 3);
    it(`countRange trial ${trial}: arr[${l}..${r}] [${lo}..${hi}]`, () => {
      expect(new WaveletTree(arr).countRange(l, r, lo, hi)).toBe(naiveCountRange(arr, l, r, lo, hi));
    });
  }
});

describe('WaveletTree.countRange – empty range (lo > hi) => 0', () => {
  const arr = [1, 2, 3, 4, 5];
  for (let i = 0; i < 20; i++) {
    it(`countRange empty [${i + 5}..${i + 3}] => 0`, () => {
      expect(new WaveletTree(arr).countRange(0, 4, i + 5, i + 3)).toBe(0);
    });
  }
});

describe('WaveletTree.countRange – all same, full range', () => {
  for (let v = 1; v <= 20; v++) {
    const arr = Array(5).fill(v);
    it(`all-${v} countRange [${v}..${v}] => 5`, () => {
      expect(new WaveletTree(arr).countRange(0, 4, v, v)).toBe(5);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 5: size getter (50 tests)
// ---------------------------------------------------------------------------
describe('WaveletTree.size – returns length of original array', () => {
  for (let n = 1; n <= 50; n++) {
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    it(`size of 1..${n} array => ${n}`, () => {
      expect(new WaveletTree(arr).size).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 6: standalone functions (100 tests)
// ---------------------------------------------------------------------------
describe('kthSmallest – standalone function', () => {
  const arr = [7, 2, 9, 1, 5, 8, 3, 10, 4, 6];
  for (let k = 1; k <= 10; k++) {
    it(`kthSmallest full range k=${k} => ${k}`, () => {
      expect(kthSmallest(arr, 0, 9, k)).toBe(k);
    });
  }
  for (let i = 0; i < 15; i++) {
    const offset = i * 10;
    const a = arr.map(x => x + offset);
    it(`kthSmallest offset=${offset} k=5 => ${5 + offset}`, () => {
      expect(kthSmallest(a, 0, 9, 5)).toBe(5 + offset);
    });
  }
});

describe('rangeFrequency – standalone function', () => {
  const arr = [1, 2, 3, 2, 1, 4, 2, 5, 2, 3];
  for (let v = 1; v <= 5; v++) {
    it(`rangeFrequency full range v=${v}`, () => {
      const expected = arr.filter(x => x === v).length;
      expect(rangeFrequency(arr, 0, arr.length - 1, v)).toBe(expected);
    });
  }
  for (let n = 1; n <= 20; n++) {
    it(`rangeFrequency all-3 array of length ${n} => ${n}`, () => {
      const a = Array(n).fill(3);
      expect(rangeFrequency(a, 0, n - 1, 3)).toBe(n);
    });
  }
  for (let i = 0; i < 25; i++) {
    it(`rangeFrequency single element equal => 1 (trial ${i})`, () => {
      const v = i + 1;
      expect(rangeFrequency([v, v + 1, v + 2], 0, 0, v)).toBe(1);
    });
  }
});

describe('rangeCountLessEqual – standalone function', () => {
  for (let n = 1; n <= 25; n++) {
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    it(`rangeCountLessEqual 1..${n} v=n => ${n}`, () => {
      expect(rangeCountLessEqual(arr, 0, n - 1, n)).toBe(n);
    });
  }
});

describe('rangeMedian – standalone function', () => {
  for (let n = 1; n <= 10; n++) {
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    it(`rangeMedian 1..${n} => ceil(${n}/2)=${Math.ceil(n / 2)}`, () => {
      expect(rangeMedian(arr, 0, n - 1)).toBe(Math.ceil(n / 2));
    });
  }
  // Shuffled arrays
  const shuffled = [4, 2, 7, 1, 9, 3, 6, 8, 5, 10];
  it('rangeMedian shuffled full range => 5 (lower median of 1..10)', () => {
    expect(rangeMedian(shuffled, 0, 9)).toBe(5);
  });
  it('rangeMedian [1,2,3] => 2', () => {
    expect(rangeMedian([1, 2, 3], 0, 2)).toBe(2);
  });
  it('rangeMedian [1,2] => 1 (lower median)', () => {
    expect(rangeMedian([1, 2], 0, 1)).toBe(1);
  });
  it('rangeMedian [3,1,2] => 2', () => {
    expect(rangeMedian([3, 1, 2], 0, 2)).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Section 7: edge cases (100 tests)
// ---------------------------------------------------------------------------
describe('Edge case – single element arrays', () => {
  for (let v = 1; v <= 25; v++) {
    it(`single element ${v}: query => ${v}`, () => {
      const wt = new WaveletTree([v]);
      expect(wt.query(0, 0, 1)).toBe(v);
      expect(wt.count(0, 0, v)).toBe(1);
      expect(wt.countLessEqual(0, 0, v)).toBe(1);
      expect(wt.countLessEqual(0, 0, v - 1)).toBe(0);
      expect(wt.countRange(0, 0, v, v)).toBe(1);
      expect(wt.size).toBe(1);
    });
  }
});

describe('Edge case – all same value', () => {
  for (let v = 1; v <= 25; v++) {
    const n = 8;
    const arr = Array(n).fill(v);
    it(`all-${v} size=${n}: query k=1 => ${v}, count => ${n}, countLE => ${n}`, () => {
      const wt = new WaveletTree(arr);
      expect(wt.query(0, n - 1, 1)).toBe(v);
      expect(wt.query(0, n - 1, n)).toBe(v);
      expect(wt.count(0, n - 1, v)).toBe(n);
      expect(wt.countLessEqual(0, n - 1, v)).toBe(n);
      expect(wt.countRange(0, n - 1, v, v)).toBe(n);
    });
  }
});

describe('Edge case – sorted arrays various sizes', () => {
  for (let n = 2; n <= 11; n++) {
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    it(`sorted 1..${n} query k=floor(n/2)+1`, () => {
      const k = Math.floor(n / 2) + 1;
      expect(new WaveletTree(arr).query(0, n - 1, k)).toBe(k);
    });
  }
});

describe('Edge case – reverse sorted arrays', () => {
  for (let n = 2; n <= 11; n++) {
    const arr = Array.from({ length: n }, (_, i) => n - i);
    it(`reversed n..1 (n=${n}) query k=n/2 matches sorted`, () => {
      const k = Math.ceil(n / 2);
      const expected = naiveSorted(arr, 0, n - 1)[k - 1];
      expect(new WaveletTree(arr).query(0, n - 1, k)).toBe(expected);
    });
  }
});

describe('Edge case – large values', () => {
  for (let i = 0; i < 10; i++) {
    const v = 1000 + i * 100;
    const arr = [v, v + 50, v + 25, v + 75, v + 10];
    it(`large values base=${v}: countRange full => match naive`, () => {
      const wt = new WaveletTree(arr);
      const lo = v + 10;
      const hi = v + 60;
      expect(wt.countRange(0, 4, lo, hi)).toBe(naiveCountRange(arr, 0, 4, lo, hi));
    });
  }
});

// ---------------------------------------------------------------------------
// Additional top-up tests to guarantee ≥1,000 total
// ---------------------------------------------------------------------------

// describe A: kthSmallest standalone on sub-ranges of [5,3,1,4,2,8,7,6,9,10]
describe('kthSmallest standalone – sub-ranges', () => {
  const arr = [5, 3, 1, 4, 2, 8, 7, 6, 9, 10];
  for (let l = 0; l < 5; l++) {
    for (let r = l + 1; r < arr.length; r++) {
      const size = r - l + 1;
      for (let k = 1; k <= Math.min(size, 2); k++) {
        it(`kthSmallest arr[${l}..${r}] k=${k}`, () => {
          expect(kthSmallest(arr, l, r, k)).toBe(naiveSorted(arr, l, r)[k - 1]);
        });
      }
    }
  }
});

// describe B: WaveletTree.count sub-range consistency
describe('WaveletTree.count – sub-range consistency', () => {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
  for (let l = 0; l < arr.length; l++) {
    for (const v of [1, 3, 5]) {
      it(`count arr[${l}..9] v=${v} vs naive`, () => {
        expect(new WaveletTree(arr).count(l, 9, v)).toBe(naiveCount(arr, l, 9, v));
      });
    }
  }
});

// describe C: rangeCountLessEqual vs naive on mixed arrays
describe('rangeCountLessEqual – mixed arrays vs naive', () => {
  const arr = [8, 3, 7, 1, 5, 4, 9, 2, 6, 10];
  for (let v = 0; v <= 11; v++) {
    it(`rangeCountLessEqual full range v=${v} vs naive`, () => {
      expect(rangeCountLessEqual(arr, 0, 9, v)).toBe(naiveCountLE(arr, 0, 9, v));
    });
  }
  for (let l = 0; l < 5; l++) {
    it(`rangeCountLessEqual arr[${l}..9] v=5 vs naive`, () => {
      expect(rangeCountLessEqual(arr, l, 9, 5)).toBe(naiveCountLE(arr, l, 9, 5));
    });
  }
});

// describe D: WaveletTree.countRange on interleaved 1..10
describe('WaveletTree.countRange – interleaved arrays', () => {
  for (let offset = 0; offset < 10; offset++) {
    const arr = [1, 6, 2, 7, 3, 8, 4, 9, 5, 10].map(x => x + offset);
    it(`countRange interleaved offset=${offset} [${2 + offset}..${7 + offset}] vs naive`, () => {
      const wt = new WaveletTree(arr);
      const lo = 2 + offset;
      const hi = 7 + offset;
      expect(wt.countRange(0, 9, lo, hi)).toBe(naiveCountRange(arr, 0, 9, lo, hi));
    });
  }
});

// describe E: size getter on various array types
describe('WaveletTree.size – uniform/patterned arrays', () => {
  for (let n = 1; n <= 20; n++) {
    it(`size of all-7 array length ${n} => ${n}`, () => {
      expect(new WaveletTree(Array(n).fill(7)).size).toBe(n);
    });
  }
});

// describe F: kthSmallest via WaveletTree.query on shuffled offsets
describe('WaveletTree.query – shuffled array with offsets', () => {
  const base = [7, 2, 9, 1, 5, 8, 3, 10, 4, 6];
  for (let offset = 0; offset < 10; offset++) {
    const arr = base.map(x => x + offset * 5);
    for (let k = 1; k <= 5; k++) {
      it(`query offset=${offset * 5} k=${k} => ${k + offset * 5}`, () => {
        expect(new WaveletTree(arr).query(0, 9, k)).toBe(k + offset * 5);
      });
    }
  }
});

// describe G: rangeMedian on repeated-value arrays
describe('rangeMedian – repeated values', () => {
  for (let v = 1; v <= 20; v++) {
    it(`rangeMedian all-${v} array length 5 => ${v}`, () => {
      expect(rangeMedian(Array(5).fill(v), 0, 4)).toBe(v);
    });
  }
});

// describe H: WaveletTree.countLessEqual on sub-ranges vs naive
describe('WaveletTree.countLessEqual – sub-ranges vs naive [1,2,3,4,5,1,2,3,4,5]', () => {
  const arr = [1, 2, 3, 4, 5, 1, 2, 3, 4, 5];
  for (let l = 0; l < 5; l++) {
    for (let v = 1; v <= 5; v++) {
      it(`countLE arr[${l}..9] v=${v} vs naive`, () => {
        expect(new WaveletTree(arr).countLessEqual(l, 9, v)).toBe(naiveCountLE(arr, l, 9, v));
      });
    }
  }
});

// describe I: kthSmallest on two-element arrays (all k)
describe('kthSmallest – two-element arrays', () => {
  for (let a = 1; a <= 20; a++) {
    const b = a + 3;
    it(`[${a},${b}] k=1 => ${a}`, () => {
      expect(kthSmallest([a, b], 0, 1, 1)).toBe(a);
    });
    it(`[${b},${a}] k=2 => ${b}`, () => {
      expect(kthSmallest([b, a], 0, 1, 2)).toBe(b);
    });
  }
});

// describe J: countRange on [lo..hi] = full value range always returns array length
describe('WaveletTree.countRange – full value range returns length', () => {
  for (let n = 1; n <= 20; n++) {
    const arr = Array.from({ length: n }, (_, i) => (i % 5) + 1);
    it(`countRange full value span 1..5 for length-${n} array => ${n}`, () => {
      expect(new WaveletTree(arr).countRange(0, n - 1, 1, 5)).toBe(n);
    });
  }
});
