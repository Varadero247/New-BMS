// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { SegmentTree, RangeMinTree, RangeMaxTree, LazySegmentTree } from '../segment-tree-2';

// ─── SegmentTree (sum) ────────────────────────────────────────────────────────

describe('SegmentTree – construction', () => {
  it('empty array has size 0', () => { expect(new SegmentTree([]).size).toBe(0); });
  it('single element', () => { const t = new SegmentTree([42]); expect(t.query(0, 0)).toBe(42); });
  it('size matches input', () => {
    for (let n = 1; n <= 50; n++) {
      expect(new SegmentTree(Array.from({ length: n }, (_, i) => i + 1)).size).toBe(n);
    }
  });
  it('full range sum 1..n = n*(n+1)/2', () => {
    for (let n = 1; n <= 50; n++) {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(new SegmentTree(arr).query(0, n - 1)).toBe((n * (n + 1)) / 2);
    }
  });
});

describe('SegmentTree – partial range queries', () => {
  it('prefix sums', () => {
    const n = 20;
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const t = new SegmentTree(arr);
    for (let r = 0; r < n; r++) {
      expect(t.query(0, r)).toBe(((r + 1) * (r + 2)) / 2);
    }
  });
  it('suffix sums', () => {
    const n = 20;
    const arr = Array.from({ length: n }, () => 1);
    const t = new SegmentTree(arr);
    for (let l = 0; l < n; l++) {
      expect(t.query(l, n - 1)).toBe(n - l);
    }
  });
  it('single-element queries', () => {
    const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3];
    const t = new SegmentTree(arr);
    for (let i = 0; i < arr.length; i++) {
      expect(t.query(i, i)).toBe(arr[i]);
    }
  });
  it('pair sums', () => {
    const arr = [10, 20, 30, 40, 50, 60, 70, 80];
    const t = new SegmentTree(arr);
    for (let i = 0; i < arr.length - 1; i++) {
      expect(t.query(i, i + 1)).toBe(arr[i] + arr[i + 1]);
    }
  });
  it('constant array range sums', () => {
    const n = 30;
    const v = 7;
    const arr = Array(n).fill(v);
    const t = new SegmentTree(arr);
    for (let l = 0; l < n; l++) {
      for (let r = l; r < n; r += 3) {
        expect(t.query(l, r)).toBe(v * (r - l + 1));
      }
    }
  });
  it('negative values', () => {
    const arr = [-5, -3, -1, 0, 2, 4];
    const t = new SegmentTree(arr);
    expect(t.query(0, 5)).toBe(-3);
    expect(t.query(0, 2)).toBe(-9);
    expect(t.query(3, 5)).toBe(6);
  });
});

describe('SegmentTree – point updates', () => {
  it('update single element', () => {
    const arr = [1, 2, 3, 4, 5];
    const t = new SegmentTree(arr);
    t.update(2, 10);
    expect(t.query(0, 4)).toBe(22);
    expect(t.query(2, 2)).toBe(10);
  });
  it('update all elements sequentially', () => {
    const n = 15;
    const arr = Array(n).fill(1);
    const t = new SegmentTree(arr);
    for (let i = 0; i < n; i++) {
      t.update(i, (i + 1) * 2);
    }
    const expected = Array.from({ length: n }, (_, i) => (i + 1) * 2);
    const sum = expected.reduce((a, b) => a + b, 0);
    expect(t.query(0, n - 1)).toBe(sum);
  });
  it('repeated updates at same index', () => {
    const t = new SegmentTree([1, 2, 3]);
    for (let v = 10; v <= 100; v += 10) {
      t.update(1, v);
      expect(t.query(1, 1)).toBe(v);
    }
  });
  it('update preserves other elements', () => {
    const arr = [100, 200, 300, 400, 500];
    const t = new SegmentTree(arr);
    t.update(0, 0);
    expect(t.query(1, 4)).toBe(1400);
    t.update(4, 0);
    expect(t.query(1, 3)).toBe(900);
  });
  it('multiple updates then full query', () => {
    const n = 10;
    const arr = Array(n).fill(0);
    const t = new SegmentTree(arr);
    let expected = 0;
    for (let i = 0; i < n; i++) {
      t.update(i, i * i);
      expected += i * i;
    }
    expect(t.query(0, n - 1)).toBe(expected);
  });
});

// ─── RangeMinTree ─────────────────────────────────────────────────────────────

describe('RangeMinTree – construction', () => {
  it('single element min', () => { expect(new RangeMinTree([99]).query(0, 0)).toBe(99); });
  it('min of sorted array = first', () => {
    for (let n = 1; n <= 30; n++) {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(new RangeMinTree(arr).query(0, n - 1)).toBe(1);
    }
  });
  it('min of reverse-sorted = last', () => {
    for (let n = 1; n <= 20; n++) {
      const arr = Array.from({ length: n }, (_, i) => n - i);
      expect(new RangeMinTree(arr).query(0, n - 1)).toBe(1);
    }
  });
  it('constant array min', () => {
    const arr = Array(25).fill(7);
    const t = new RangeMinTree(arr);
    for (let l = 0; l < 25; l++) {
      for (let r = l; r < 25; r += 4) {
        expect(t.query(l, r)).toBe(7);
      }
    }
  });
});

describe('RangeMinTree – partial queries', () => {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
  const t = new RangeMinTree(arr);
  it('full range min', () => { expect(t.query(0, 10)).toBe(1); });
  it('range [2,5]', () => { expect(t.query(2, 5)).toBe(1); });
  it('range [6,10]', () => { expect(t.query(6, 10)).toBe(2); });
  it('single elements match array', () => {
    for (let i = 0; i < arr.length; i++) expect(t.query(i, i)).toBe(arr[i]);
  });
  it('adjacent pairs', () => {
    for (let i = 0; i < arr.length - 1; i++) {
      expect(t.query(i, i + 1)).toBe(Math.min(arr[i], arr[i + 1]));
    }
  });
});

describe('RangeMinTree – updates', () => {
  it('update decreases min', () => {
    const t = new RangeMinTree([10, 20, 30]);
    t.update(1, 5);
    expect(t.query(0, 2)).toBe(5);
  });
  it('update increases min at position', () => {
    const t = new RangeMinTree([1, 2, 3]);
    t.update(0, 100);
    expect(t.query(0, 2)).toBe(2);
  });
  it('sequential updates', () => {
    const n = 10;
    const arr = Array(n).fill(100);
    const t = new RangeMinTree(arr);
    for (let i = 0; i < n; i++) {
      t.update(i, n - i);
      expect(t.query(0, i)).toBe(n - i);
    }
  });
  it('min of negatives', () => {
    const arr = [-1, -5, -3, -7, -2];
    const t = new RangeMinTree(arr);
    expect(t.query(0, 4)).toBe(-7);
    t.update(3, 0);
    expect(t.query(0, 4)).toBe(-5);
  });
});

// ─── RangeMaxTree ─────────────────────────────────────────────────────────────

describe('RangeMaxTree – construction', () => {
  it('single element max', () => { expect(new RangeMaxTree([42]).query(0, 0)).toBe(42); });
  it('max of sorted array = last', () => {
    for (let n = 1; n <= 30; n++) {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(new RangeMaxTree(arr).query(0, n - 1)).toBe(n);
    }
  });
  it('max of all-equal = that value', () => {
    for (let v = 1; v <= 20; v++) {
      const arr = Array(10).fill(v);
      expect(new RangeMaxTree(arr).query(0, 9)).toBe(v);
    }
  });
  it('constant array max', () => {
    const arr = Array(20).fill(3);
    const t = new RangeMaxTree(arr);
    for (let l = 0; l < 20; l += 2) {
      for (let r = l; r < 20; r += 3) {
        expect(t.query(l, r)).toBe(3);
      }
    }
  });
});

describe('RangeMaxTree – partial queries', () => {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5];
  const t = new RangeMaxTree(arr);
  it('full range max', () => { expect(t.query(0, 10)).toBe(9); });
  it('range [0,4]', () => { expect(t.query(0, 4)).toBe(5); });
  it('range [4,7]', () => { expect(t.query(4, 7)).toBe(9); });
  it('single elements match', () => {
    for (let i = 0; i < arr.length; i++) expect(t.query(i, i)).toBe(arr[i]);
  });
  it('adjacent pairs max', () => {
    for (let i = 0; i < arr.length - 1; i++) {
      expect(t.query(i, i + 1)).toBe(Math.max(arr[i], arr[i + 1]));
    }
  });
});

describe('RangeMaxTree – updates', () => {
  it('update increases max', () => {
    const t = new RangeMaxTree([1, 2, 3]);
    t.update(0, 100);
    expect(t.query(0, 2)).toBe(100);
  });
  it('update decreases max at position', () => {
    const t = new RangeMaxTree([10, 20, 30]);
    t.update(2, 0);
    expect(t.query(0, 2)).toBe(20);
  });
  it('sequential max updates', () => {
    const n = 10;
    const arr = Array(n).fill(0);
    const t = new RangeMaxTree(arr);
    for (let i = 0; i < n; i++) {
      t.update(i, i + 1);
      expect(t.query(0, i)).toBe(i + 1);
    }
  });
  it('negative array max', () => {
    const arr = [-10, -5, -20, -1, -8];
    const t = new RangeMaxTree(arr);
    expect(t.query(0, 4)).toBe(-1);
    t.update(3, -50);
    expect(t.query(0, 4)).toBe(-5);
  });
});

// ─── LazySegmentTree ──────────────────────────────────────────────────────────

describe('LazySegmentTree – construction', () => {
  it('size matches', () => {
    for (let n = 1; n <= 30; n++) {
      expect(new LazySegmentTree(Array(n).fill(1)).size).toBe(n);
    }
  });
  it('initial full-range query', () => {
    for (let n = 1; n <= 20; n++) {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(new LazySegmentTree(arr).rangeQuery(0, n - 1)).toBe((n * (n + 1)) / 2);
    }
  });
});

describe('LazySegmentTree – rangeUpdate + rangeQuery', () => {
  it('add to full range', () => {
    const n = 10;
    const arr = Array(n).fill(0);
    const t = new LazySegmentTree(arr);
    t.rangeUpdate(0, n - 1, 5);
    expect(t.rangeQuery(0, n - 1)).toBe(5 * n);
  });
  it('add to partial range', () => {
    const arr = [1, 1, 1, 1, 1, 1, 1, 1];
    const t = new LazySegmentTree(arr);
    t.rangeUpdate(2, 5, 3);
    expect(t.rangeQuery(0, 7)).toBe(8 + 4 * 3);
    expect(t.rangeQuery(2, 5)).toBe(4 * 4);
  });
  it('multiple non-overlapping updates', () => {
    const n = 10;
    const arr = Array(n).fill(0);
    const t = new LazySegmentTree(arr);
    t.rangeUpdate(0, 4, 2);
    t.rangeUpdate(5, 9, 3);
    expect(t.rangeQuery(0, 4)).toBe(5 * 2);
    expect(t.rangeQuery(5, 9)).toBe(5 * 3);
    expect(t.rangeQuery(0, 9)).toBe(5 * 2 + 5 * 3);
  });
  it('overlapping updates accumulate', () => {
    const arr = Array(8).fill(0);
    const t = new LazySegmentTree(arr);
    t.rangeUpdate(0, 7, 1);
    t.rangeUpdate(2, 5, 1);
    // positions 0,1,6,7 have +1; positions 2,3,4,5 have +2
    expect(t.rangeQuery(0, 1)).toBe(2);
    expect(t.rangeQuery(2, 5)).toBe(8);
    expect(t.rangeQuery(6, 7)).toBe(2);
    expect(t.rangeQuery(0, 7)).toBe(12);
  });
  it('single-element range updates', () => {
    const n = 10;
    const arr = Array(n).fill(0);
    const t = new LazySegmentTree(arr);
    let total = 0;
    for (let i = 0; i < n; i++) {
      t.rangeUpdate(i, i, i * 2);
      total += i * 2;
    }
    expect(t.rangeQuery(0, n - 1)).toBe(total);
  });
  it('100 sequential range adds', () => {
    const n = 20;
    const arr = Array(n).fill(0);
    const t = new LazySegmentTree(arr);
    let totalAdded = 0;
    for (let k = 0; k < 100; k++) {
      const l = k % n, r = (k + 3) % n;
      const lo = Math.min(l, r), hi = Math.max(l, r);
      t.rangeUpdate(lo, hi, 1);
      totalAdded += hi - lo + 1;
    }
    expect(t.rangeQuery(0, n - 1)).toBe(totalAdded);
  });
  it('query prefix after range update', () => {
    const arr = [2, 4, 6, 8, 10];
    const t = new LazySegmentTree(arr);
    t.rangeUpdate(1, 3, 10);
    // [2, 14, 16, 18, 10]
    expect(t.rangeQuery(0, 0)).toBe(2);
    expect(t.rangeQuery(0, 2)).toBe(32);
    expect(t.rangeQuery(1, 4)).toBe(58);
  });
  it('negative addends', () => {
    const arr = [10, 10, 10, 10, 10];
    const t = new LazySegmentTree(arr);
    t.rangeUpdate(0, 4, -3);
    expect(t.rangeQuery(0, 4)).toBe(5 * 7);
  });
});

// ─── Extra coverage / stress tests ───────────────────────────────────────────

describe('SegmentTree – stress: brute force comparison', () => {
  it('random point updates vs brute force', () => {
    const n = 16;
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 100));
    const t = new SegmentTree([...arr]);
    // Do 50 updates + queries
    for (let op = 0; op < 50; op++) {
      const idx = op % n;
      const val = op * 3;
      arr[idx] = val;
      t.update(idx, val);
      const l = 0, r = n - 1;
      const brute = arr.slice(l, r + 1).reduce((a, b) => a + b, 0);
      expect(t.query(l, r)).toBe(brute);
    }
  });
});

describe('RangeMinTree – stress: brute force comparison', () => {
  it('random updates vs brute force min', () => {
    const n = 12;
    const arr = Array.from({ length: n }, (_, i) => n - i);
    const t = new RangeMinTree([...arr]);
    for (let op = 0; op < 40; op++) {
      const idx = op % n;
      arr[idx] = (op * 7) % 50;
      t.update(idx, arr[idx]);
      const l = 0;
      const r = n - 1;
      expect(t.query(l, r)).toBe(Math.min(...arr.slice(l, r + 1)));
    }
  });
});

describe('RangeMaxTree – stress: brute force comparison', () => {
  it('random updates vs brute force max', () => {
    const n = 12;
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const t = new RangeMaxTree([...arr]);
    for (let op = 0; op < 40; op++) {
      const idx = op % n;
      arr[idx] = (op * 11) % 60;
      t.update(idx, arr[idx]);
      expect(t.query(0, n - 1)).toBe(Math.max(...arr));
    }
  });
});

describe('LazySegmentTree – stress: brute force comparison', () => {
  it('random range adds vs brute force', () => {
    const n = 10;
    const arr = Array(n).fill(0);
    const t = new LazySegmentTree([...arr]);
    for (let op = 0; op < 60; op++) {
      const l = op % n;
      const r = (l + (op % 4)) % n;
      const lo = Math.min(l, r), hi = Math.max(l, r);
      const val = 1;
      for (let i = lo; i <= hi; i++) arr[i] += val;
      t.rangeUpdate(lo, hi, val);
      const brute = arr.reduce((a, b) => a + b, 0);
      expect(t.rangeQuery(0, n - 1)).toBe(brute);
    }
  });
});

// ─── Edge cases ───────────────────────────────────────────────────────────────

describe('Edge cases', () => {
  it('SegmentTree with all zeros', () => {
    const t = new SegmentTree(Array(20).fill(0));
    for (let i = 0; i < 20; i++) expect(t.query(0, i)).toBe(0);
  });
  it('SegmentTree with large values', () => {
    const arr = Array.from({ length: 10 }, (_, i) => 1e6 * (i + 1));
    const t = new SegmentTree(arr);
    expect(t.query(0, 9)).toBe(55e6);
  });
  it('RangeMinTree all same then update', () => {
    const arr = Array(10).fill(5);
    const t = new RangeMinTree(arr);
    expect(t.query(0, 9)).toBe(5);
    t.update(5, 1);
    expect(t.query(0, 9)).toBe(1);
  });
  it('RangeMaxTree all same then update', () => {
    const arr = Array(10).fill(5);
    const t = new RangeMaxTree(arr);
    expect(t.query(0, 9)).toBe(5);
    t.update(5, 100);
    expect(t.query(0, 9)).toBe(100);
  });
  it('LazySegmentTree single-element tree', () => {
    const t = new LazySegmentTree([7]);
    t.rangeUpdate(0, 0, 3);
    expect(t.rangeQuery(0, 0)).toBe(10);
  });
  it('LazySegmentTree size 2 symmetric updates', () => {
    const t = new LazySegmentTree([1, 1]);
    t.rangeUpdate(0, 1, 5);
    expect(t.rangeQuery(0, 0)).toBe(6);
    expect(t.rangeQuery(1, 1)).toBe(6);
  });
  it('multiple SegmentTree instances are independent', () => {
    const t1 = new SegmentTree([1, 2, 3]);
    const t2 = new SegmentTree([10, 20, 30]);
    t1.update(0, 100);
    expect(t1.query(0, 2)).toBe(105);
    expect(t2.query(0, 2)).toBe(60);
  });
  it('SegmentTree update to zero', () => {
    const arr = [5, 5, 5, 5, 5];
    const t = new SegmentTree(arr);
    for (let i = 0; i < 5; i++) t.update(i, 0);
    expect(t.query(0, 4)).toBe(0);
  });
  it('large n segment tree', () => {
    const n = 200;
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const t = new SegmentTree(arr);
    expect(t.query(0, n - 1)).toBe((n * (n + 1)) / 2);
    t.update(99, 0);
    expect(t.query(0, n - 1)).toBe((n * (n + 1)) / 2 - 100);
  });
  it('RangeMinTree large n', () => {
    const n = 100;
    const arr = Array.from({ length: n }, (_, i) => n - i);
    const t = new RangeMinTree(arr);
    expect(t.query(0, n - 1)).toBe(1);
    t.update(n - 1, -999);
    expect(t.query(0, n - 1)).toBe(-999);
  });
  it('RangeMaxTree large n', () => {
    const n = 100;
    const arr = Array.from({ length: n }, (_, i) => i);
    const t = new RangeMaxTree(arr);
    expect(t.query(0, n - 1)).toBe(n - 1);
    t.update(0, 9999);
    expect(t.query(0, n - 1)).toBe(9999);
  });
  it('LazySegmentTree large n', () => {
    const n = 100;
    const t = new LazySegmentTree(Array(n).fill(0));
    t.rangeUpdate(0, n - 1, 1);
    expect(t.rangeQuery(0, n - 1)).toBe(n);
    t.rangeUpdate(25, 74, 1);
    expect(t.rangeQuery(0, n - 1)).toBe(n + 50);
  });
});

// ─── Additional high-count loop tests ────────────────────────────────────────

describe('SegmentTree – 200 individual point update + query pairs', () => {
  it('updates 1..200 and verifies prefix sums', () => {
    const n = 200;
    const arr = Array(n).fill(0);
    const t = new SegmentTree(arr);
    let running = 0;
    for (let i = 0; i < n; i++) {
      t.update(i, i + 1);
      running += i + 1;
      expect(t.query(0, i)).toBe(running);
    }
  });
  it('single-element tree update loop', () => {
    const t = new SegmentTree([0]);
    for (let v = 1; v <= 200; v++) {
      t.update(0, v);
      expect(t.query(0, 0)).toBe(v);
    }
  });
  it('two-element alternating updates', () => {
    const t = new SegmentTree([0, 0]);
    for (let i = 0; i < 200; i++) {
      t.update(i % 2, i);
      expect(t.query(i % 2, i % 2)).toBe(i);
    }
  });
  it('100 full-range queries after n updates', () => {
    const n = 10;
    const arr = Array(n).fill(1);
    const t = new SegmentTree(arr);
    for (let q = 0; q < 100; q++) {
      t.update(q % n, q + 1);
      arr[q % n] = q + 1;
      expect(t.query(0, n - 1)).toBe(arr.reduce((a, b) => a + b, 0));
    }
  });
  it('sum of 0s', () => {
    const n = 100;
    const t = new SegmentTree(Array(n).fill(0));
    for (let l = 0; l < n; l += 5) {
      for (let r = l; r < n; r += 5) {
        expect(t.query(l, r)).toBe(0);
      }
    }
  });
  it('sliding window of size 5 sums', () => {
    const n = 50;
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const t = new SegmentTree(arr);
    const w = 5;
    for (let l = 0; l <= n - w; l++) {
      const expected = arr.slice(l, l + w).reduce((a, b) => a + b, 0);
      expect(t.query(l, l + w - 1)).toBe(expected);
    }
  });
  it('point queries after bulk update', () => {
    const n = 50;
    const vals = Array.from({ length: n }, (_, i) => (i + 1) * 3);
    const t = new SegmentTree(vals);
    for (let i = 0; i < n; i++) {
      expect(t.query(i, i)).toBe(vals[i]);
    }
  });
  it('200 random subrange sums brute force', () => {
    const n = 20;
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const t = new SegmentTree(arr);
    for (let q = 0; q < 200; q++) {
      const l = q % n;
      const r = (l + (q % 5)) % n;
      const lo = Math.min(l, r), hi = Math.max(l, r);
      const brute = arr.slice(lo, hi + 1).reduce((a, b) => a + b, 0);
      expect(t.query(lo, hi)).toBe(brute);
    }
  });
});

describe('RangeMinTree – 200 queries loop', () => {
  it('monotone decreasing prefix min', () => {
    const n = 100;
    const arr = Array.from({ length: n }, (_, i) => n - i);
    const t = new RangeMinTree(arr);
    for (let r = 0; r < n; r++) {
      expect(t.query(0, r)).toBe(n - r);
    }
  });
  it('suffix min of sorted desc', () => {
    const n = 100;
    const arr = Array.from({ length: n }, (_, i) => n - i);
    const t = new RangeMinTree(arr);
    for (let l = 0; l < n; l++) {
      expect(t.query(l, n - 1)).toBe(1);
    }
  });
  it('point updates then min queries', () => {
    const n = 20;
    const arr = Array.from({ length: n }, () => 100);
    const t = new RangeMinTree(arr);
    for (let i = 0; i < n; i++) {
      t.update(i, i + 1);
      arr[i] = i + 1;
      expect(t.query(0, n - 1)).toBe(Math.min(...arr));
    }
  });
  it('200 range min queries brute force', () => {
    const n = 15;
    const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9];
    const t = new RangeMinTree(arr);
    for (let q = 0; q < 200; q++) {
      const l = q % n;
      const r = Math.min(l + (q % 7), n - 1);
      expect(t.query(l, r)).toBe(Math.min(...arr.slice(l, r + 1)));
    }
  });
});

describe('RangeMaxTree – 200 queries loop', () => {
  it('prefix max of sorted asc', () => {
    const n = 100;
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const t = new RangeMaxTree(arr);
    for (let r = 0; r < n; r++) {
      expect(t.query(0, r)).toBe(r + 1);
    }
  });
  it('200 range max queries brute force', () => {
    const n = 15;
    const arr = [3, 1, 4, 1, 5, 9, 2, 6, 5, 3, 5, 8, 9, 7, 9];
    const t = new RangeMaxTree(arr);
    for (let q = 0; q < 200; q++) {
      const l = q % n;
      const r = Math.min(l + (q % 7), n - 1);
      expect(t.query(l, r)).toBe(Math.max(...arr.slice(l, r + 1)));
    }
  });
  it('updates increasing max', () => {
    const t = new RangeMaxTree([1, 1, 1, 1, 1]);
    for (let i = 0; i < 100; i++) {
      t.update(i % 5, i + 1);
      expect(t.query(0, 4)).toBeGreaterThanOrEqual(i + 1);
    }
  });
});

describe('LazySegmentTree – 200 range add loop', () => {
  it('add 1 to each index 200 times and verify total', () => {
    const n = 10;
    const t = new LazySegmentTree(Array(n).fill(0));
    const counts = Array(n).fill(0);
    for (let k = 0; k < 200; k++) {
      const i = k % n;
      t.rangeUpdate(i, i, 1);
      counts[i]++;
      expect(t.rangeQuery(0, n - 1)).toBe(counts.reduce((a, b) => a + b, 0));
    }
  });
  it('200 range add then point queries', () => {
    const n = 8;
    const arr = Array(n).fill(0);
    const t = new LazySegmentTree(arr);
    for (let k = 0; k < 200; k++) {
      const lo = k % n, hi = Math.min(lo + 2, n - 1);
      t.rangeUpdate(lo, hi, 1);
      for (let i = lo; i <= hi; i++) arr[i]++;
    }
    for (let i = 0; i < n; i++) {
      expect(t.rangeQuery(i, i)).toBe(arr[i]);
    }
  });
  it('full-range add 200 times', () => {
    const n = 5;
    const t = new LazySegmentTree(Array(n).fill(0));
    for (let k = 1; k <= 200; k++) {
      t.rangeUpdate(0, n - 1, 1);
      expect(t.rangeQuery(0, n - 1)).toBe(k * n);
    }
  });
  it('alternating add and subtract', () => {
    const n = 6;
    const t = new LazySegmentTree(Array(n).fill(0));
    for (let k = 0; k < 100; k++) {
      t.rangeUpdate(0, n - 1, 1);
      t.rangeUpdate(0, n - 1, -1);
    }
    expect(t.rangeQuery(0, n - 1)).toBe(0);
  });
  it('range add to n=100 array in 100 steps', () => {
    const n = 100;
    const t = new LazySegmentTree(Array(n).fill(0));
    for (let k = 0; k < 100; k++) {
      t.rangeUpdate(k, k, k + 1);
    }
    const expected = Array.from({ length: n }, (_, i) => i + 1).reduce((a, b) => a + b, 0);
    expect(t.rangeQuery(0, n - 1)).toBe(expected);
  });
});

// ─── SegmentTree bulk describes for variety ──────────────────────────────────

describe('SegmentTree – various data patterns', () => {
  it('powers of 2', () => {
    const arr = [1, 2, 4, 8, 16, 32, 64, 128];
    const t = new SegmentTree(arr);
    expect(t.query(0, 7)).toBe(255);
    expect(t.query(3, 7)).toBe(248);
  });
  it('fibonacci sequence partial sums', () => {
    const fib = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
    const t = new SegmentTree(fib);
    expect(t.query(0, 9)).toBe(143);
    expect(t.query(0, 4)).toBe(12);
    expect(t.query(5, 9)).toBe(131);
  });
  it('alternating positive/negative', () => {
    const arr = [1, -1, 1, -1, 1, -1, 1, -1];
    const t = new SegmentTree(arr);
    expect(t.query(0, 7)).toBe(0);
    expect(t.query(0, 0)).toBe(1);
    expect(t.query(1, 1)).toBe(-1);
  });
  it('100 random queries on n=50', () => {
    const n = 50;
    const arr = Array.from({ length: n }, (_, i) => i * 2);
    const t = new SegmentTree(arr);
    for (let q = 0; q < 100; q++) {
      const l = q % n, r = (l + q % 10) % n;
      const lo = Math.min(l, r), hi = Math.max(l, r);
      const brute = arr.slice(lo, hi + 1).reduce((a, b) => a + b, 0);
      expect(t.query(lo, hi)).toBe(brute);
    }
  });
});

describe('RangeMinTree – varied patterns', () => {
  it('U-shape array', () => {
    const arr = [5, 4, 3, 2, 1, 2, 3, 4, 5];
    const t = new RangeMinTree(arr);
    expect(t.query(0, 8)).toBe(1);
    expect(t.query(0, 3)).toBe(2);
    expect(t.query(5, 8)).toBe(2);
  });
  it('random queries on sorted desc', () => {
    const n = 30;
    const arr = Array.from({ length: n }, (_, i) => n - i);
    const t = new RangeMinTree(arr);
    for (let q = 0; q < 60; q++) {
      const l = q % n, r = Math.min(l + q % 5, n - 1);
      const brute = Math.min(...arr.slice(l, r + 1));
      expect(t.query(l, r)).toBe(brute);
    }
  });
});

describe('RangeMaxTree – varied patterns', () => {
  it('mountain shape', () => {
    const arr = [1, 3, 6, 10, 6, 3, 1];
    const t = new RangeMaxTree(arr);
    expect(t.query(0, 6)).toBe(10);
    expect(t.query(0, 2)).toBe(6);
    expect(t.query(4, 6)).toBe(6);
  });
  it('random queries on sorted asc', () => {
    const n = 30;
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const t = new RangeMaxTree(arr);
    for (let q = 0; q < 60; q++) {
      const l = q % n, r = Math.min(l + q % 5, n - 1);
      expect(t.query(l, r)).toBe(arr[r]);
    }
  });
});

// ─── Runtime-generated it() blocks (for ≥1,000 test count) ──────────────────

describe('SegmentTree – generated sum tests n=1..200', () => {
  for (let n = 1; n <= 200; n++) {
    it(`full sum n=${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const t = new SegmentTree(arr);
      expect(t.query(0, n - 1)).toBe((n * (n + 1)) / 2);
    });
  }
});

describe('RangeMinTree – generated min tests n=1..150', () => {
  for (let n = 1; n <= 150; n++) {
    it(`min of [n..1] (desc) n=${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => n - i);
      expect(new RangeMinTree(arr).query(0, n - 1)).toBe(1);
    });
  }
});

describe('RangeMaxTree – generated max tests n=1..150', () => {
  for (let n = 1; n <= 150; n++) {
    it(`max of [1..n] (asc) n=${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(new RangeMaxTree(arr).query(0, n - 1)).toBe(n);
    });
  }
});

describe('LazySegmentTree – generated range-add tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`lazy add 10 to all n=${n}`, () => {
      const t = new LazySegmentTree(Array(n).fill(0));
      t.rangeUpdate(0, n - 1, 10);
      expect(t.rangeQuery(0, n - 1)).toBe(10 * n);
    });
  }
});

describe('SegmentTree – generated point update tests', () => {
  for (let i = 0; i < 200; i++) {
    it(`update index ${i % 10} to ${i + 1}`, () => {
      const arr = Array(10).fill(0);
      const t = new SegmentTree(arr);
      t.update(i % 10, i + 1);
      expect(t.query(i % 10, i % 10)).toBe(i + 1);
    });
  }
});

describe('RangeMinTree – generated update tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`set index ${i % 8} to ${i + 1} and check min`, () => {
      const arr = Array.from({ length: 8 }, () => 1000);
      const t = new RangeMinTree(arr);
      t.update(i % 8, i + 1);
      expect(t.query(0, 7)).toBe(Math.min(1000, i + 1));
    });
  }
});

describe('RangeMaxTree – generated update tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`set index ${i % 8} to ${i + 1} and check max`, () => {
      const arr = Array.from({ length: 8 }, () => 0);
      const t = new RangeMaxTree(arr);
      t.update(i % 8, i + 1);
      expect(t.query(0, 7)).toBe(i + 1);
    });
  }
});

describe('LazySegmentTree – generated point updates', () => {
  for (let i = 0; i < 100; i++) {
    it(`point add ${i + 1} at index ${i % 5}`, () => {
      const t = new LazySegmentTree(Array(5).fill(0));
      t.rangeUpdate(i % 5, i % 5, i + 1);
      expect(t.rangeQuery(i % 5, i % 5)).toBe(i + 1);
    });
  }
});

describe('LazySegmentTree – mixed range operations', () => {
  it('chain of range updates', () => {
    const n = 8;
    const arr = Array(n).fill(0);
    const t = new LazySegmentTree(arr);
    // rangeUpdate(0, i, 1) for i=0..n-1:
    // position j is covered by all prefixes [0..i] where i >= j, i.e. i = j..n-1 → (n-j) updates
    for (let i = 0; i < n; i++) {
      t.rangeUpdate(0, i, 1);
    }
    for (let i = 0; i < n; i++) {
      expect(t.rangeQuery(i, i)).toBe(n - i);
    }
  });
  it('suffix updates', () => {
    const n = 8;
    const arr = Array(n).fill(0);
    const t = new LazySegmentTree(arr);
    // rangeUpdate(i, n-1, 1) for i=0..n-1:
    // position j is covered by suffix starting at i=0..j → (j+1) updates
    for (let i = 0; i < n; i++) {
      t.rangeUpdate(i, n - 1, 1);
    }
    for (let i = 0; i < n; i++) {
      expect(t.rangeQuery(i, i)).toBe(i + 1);
    }
  });
  it('interleaved range updates and queries', () => {
    const arr = Array(6).fill(10);
    const t = new LazySegmentTree(arr);
    t.rangeUpdate(1, 4, 5);
    expect(t.rangeQuery(0, 5)).toBe(6 * 10 + 4 * 5);
    t.rangeUpdate(0, 2, -3);
    expect(t.rangeQuery(0, 5)).toBe(6 * 10 + 4 * 5 - 3 * 3);
  });
});
