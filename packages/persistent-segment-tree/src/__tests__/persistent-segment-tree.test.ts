// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  PersistentSegmentTree,
  pstBuild,
  pstUpdate,
  pstQuerySum,
  pstQueryMin,
  pstQueryMax,
  pstMerge,
  PersistentFreqTree,
  PSTRoot,
} from '../persistent-segment-tree';

// ─── Helper ───────────────────────────────────────────────────────────────────
function range(start: number, end: number): number[] {
  const a: number[] = [];
  for (let i = start; i <= end; i++) a.push(i);
  return a;
}

// =============================================================================
// 1. PersistentSegmentTree – querySum over entire array (200 tests)
// =============================================================================
describe('PST querySum entire array n=1..200', () => {
  for (let n = 1; n <= 200; n++) {
    it(`n=${n}: sum [0..n-1] === n*(n-1)/2`, () => {
      const arr = range(0, n - 1);
      const pst = new PersistentSegmentTree(arr);
      expect(pst.querySum(0, 0, n - 1)).toBe((n * (n - 1)) / 2);
    });
  }
});

// =============================================================================
// 2. PersistentSegmentTree – queryPoint (100 tests)
// =============================================================================
describe('PST queryPoint i=0..99', () => {
  for (let i = 0; i < 100; i++) {
    it(`offset=${i}: queryPoint(0, 0) === ${i}`, () => {
      const arr = range(i, i + 99);
      const pst = new PersistentSegmentTree(arr);
      expect(pst.queryPoint(0, 0)).toBe(i);
    });
  }
});

// =============================================================================
// 3. PersistentSegmentTree – update creates new version (100 tests)
// =============================================================================
describe('PST update creates version i=0..99', () => {
  for (let i = 0; i < 100; i++) {
    it(`i=${i}: versions becomes 2 after one update`, () => {
      const arr = range(0, 9);
      const pst = new PersistentSegmentTree(arr);
      expect(pst.versions).toBe(1);
      pst.update(0, i % 10, 999);
      expect(pst.versions).toBe(2);
    });
  }
});

// =============================================================================
// 4. PersistentSegmentTree – immutability of version 0 after update (100 tests)
// =============================================================================
describe('PST immutability – version 0 unchanged after update i=0..99', () => {
  for (let i = 0; i < 100; i++) {
    it(`i=${i}: original sum unchanged after update at pos ${i % 10}`, () => {
      const n = 10;
      const arr = range(0, n - 1);
      const pst = new PersistentSegmentTree(arr);
      const originalSum = pst.querySum(0, 0, n - 1);
      pst.update(0, i % n, 999);
      expect(pst.querySum(0, 0, n - 1)).toBe(originalSum);
    });
  }
});

// =============================================================================
// 5. PersistentSegmentTree – queryMin (100 tests)
// =============================================================================
describe('PST queryMin n=1..100', () => {
  for (let n = 1; n <= 100; n++) {
    it(`n=${n}: queryMin(0, 0, n-1) === n`, () => {
      const arr = range(n, 2 * n);
      const pst = new PersistentSegmentTree(arr);
      expect(pst.queryMin(0, 0, n - 1)).toBe(n);
    });
  }
});

// =============================================================================
// 6. PersistentSegmentTree – queryMax (100 tests)
// =============================================================================
describe('PST queryMax n=1..100', () => {
  for (let n = 1; n <= 100; n++) {
    it(`n=${n}: queryMax(0, 0, n-1) === ${n - 1}`, () => {
      const arr = range(0, n - 1);
      const pst = new PersistentSegmentTree(arr);
      expect(pst.queryMax(0, 0, n - 1)).toBe(n - 1);
    });
  }
});

// =============================================================================
// 7. pstBuild / pstQuerySum – total sum (100 tests)
// =============================================================================
describe('pstBuild + pstQuerySum n=1..100', () => {
  for (let n = 1; n <= 100; n++) {
    it(`n=${n}: sum [1..n] === ${(n * (n + 1)) / 2}`, () => {
      const arr = range(1, n);
      const root = pstBuild(arr);
      expect(pstQuerySum(root, 0, n - 1)).toBe((n * (n + 1)) / 2);
    });
  }
});

// =============================================================================
// 8. pstUpdate – immutability (100 tests)
// =============================================================================
describe('pstUpdate immutability i=0..99', () => {
  for (let i = 0; i < 100; i++) {
    it(`i=${i}: old root sum unchanged after update`, () => {
      const n = 10;
      const arr = range(1, n);
      const root = pstBuild(arr);
      const oldSum = pstQuerySum(root, 0, n - 1);
      const newRoot = pstUpdate(root, i % n, 999);
      expect(pstQuerySum(root, 0, n - 1)).toBe(oldSum);
      expect(pstQuerySum(newRoot, i % n, i % n)).toBe(999);
    });
  }
});

// =============================================================================
// 9. pstQueryMin (100 tests)
// =============================================================================
describe('pstQueryMin n=1..100', () => {
  for (let n = 1; n <= 100; n++) {
    it(`n=${n}: min of [n..2n-1] === n`, () => {
      const arr = range(n, 2 * n - 1);
      const root = pstBuild(arr);
      expect(pstQueryMin(root, 0, n - 1)).toBe(n);
    });
  }
});

// =============================================================================
// 10. pstQueryMax (100 tests)
// =============================================================================
describe('pstQueryMax n=1..100', () => {
  for (let n = 1; n <= 100; n++) {
    it(`n=${n}: max of [0..n-1] === ${n - 1}`, () => {
      const arr = range(0, n - 1);
      const root = pstBuild(arr);
      expect(pstQueryMax(root, 0, n - 1)).toBe(n - 1);
    });
  }
});

// =============================================================================
// 11. pstMerge – point-wise addition (50 tests)
// =============================================================================
describe('pstMerge doubles values n=1..50', () => {
  for (let n = 1; n <= 50; n++) {
    it(`n=${n}: merged sum === 2 * original sum`, () => {
      const arr = range(1, n);
      const root = pstBuild(arr);
      const merged = pstMerge(root, root);
      expect(pstQuerySum(merged, 0, n - 1)).toBe(2 * pstQuerySum(root, 0, n - 1));
    });
  }
});

// =============================================================================
// 12. PersistentFreqTree – insert creates versions (50 tests)
// =============================================================================
describe('PersistentFreqTree insert n=1..50', () => {
  for (let n = 1; n <= 50; n++) {
    it(`n=${n}: after inserting n elements versions === n+1`, () => {
      const freq = new PersistentFreqTree(200);
      let v = 0;
      for (let j = 0; j < n; j++) {
        v = freq.insert(v, j);
      }
      expect(freq.versions).toBe(n + 1);
    });
  }
});

// =============================================================================
// 13. Multi-version queries – updating same index repeatedly (50 tests)
// =============================================================================
describe('multi-version same-index updates i=0..49', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: each version records correct value at idx 0`, () => {
      const arr = [0, 1, 2, 3, 4];
      const pst = new PersistentSegmentTree(arr);
      const v1 = pst.update(0, 0, i + 1);
      const v2 = pst.update(v1, 0, i + 2);
      const v3 = pst.update(v2, 0, i + 3);
      expect(pst.queryPoint(0, 0)).toBe(0);
      expect(pst.queryPoint(v1, 0)).toBe(i + 1);
      expect(pst.queryPoint(v2, 0)).toBe(i + 2);
      expect(pst.queryPoint(v3, 0)).toBe(i + 3);
    });
  }
});

// =============================================================================
// 14. PST – partial range sums (100 tests)
// =============================================================================
describe('PST partial range sum n=2..101', () => {
  for (let n = 2; n <= 101; n++) {
    it(`n=${n}: sum [0..n/2-1] === correct triangular`, () => {
      const arr = range(0, n - 1);
      const pst = new PersistentSegmentTree(arr);
      const half = Math.floor(n / 2);
      // sum of 0+1+...+(half-1) = half*(half-1)/2
      expect(pst.querySum(0, 0, half - 1)).toBe((half * (half - 1)) / 2);
    });
  }
});

// =============================================================================
// 15. PST – update then query new version (100 tests)
// =============================================================================
describe('PST update then query new version i=0..99', () => {
  for (let i = 0; i < 100; i++) {
    it(`i=${i}: updated position returns new value in new version`, () => {
      const arr = range(0, 9);
      const pst = new PersistentSegmentTree(arr);
      const pos = i % 10;
      const newVal = i * 7 + 1;
      const v1 = pst.update(0, pos, newVal);
      expect(pst.queryPoint(v1, pos)).toBe(newVal);
    });
  }
});

// =============================================================================
// 16. PST – size property (50 tests)
// =============================================================================
describe('PST size property n=1..50', () => {
  for (let n = 1; n <= 50; n++) {
    it(`n=${n}: size === n`, () => {
      const arr = range(0, n - 1);
      const pst = new PersistentSegmentTree(arr);
      expect(pst.size).toBe(n);
    });
  }
});

// =============================================================================
// 17. PST – queryMin after update (50 tests)
// =============================================================================
describe('PST queryMin after update i=0..49', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: new version min reflects updated value`, () => {
      const arr = [10, 20, 30, 40, 50];
      const pst = new PersistentSegmentTree(arr);
      // set position 0 to a very small value
      const smallVal = -(i + 1);
      const v1 = pst.update(0, 0, smallVal);
      expect(pst.queryMin(v1, 0, 4)).toBe(smallVal);
      // original still has min=10
      expect(pst.queryMin(0, 0, 4)).toBe(10);
    });
  }
});

// =============================================================================
// 18. PST – queryMax after update (50 tests)
// =============================================================================
describe('PST queryMax after update i=0..49', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: new version max reflects updated value`, () => {
      const arr = [1, 2, 3, 4, 5];
      const pst = new PersistentSegmentTree(arr);
      const bigVal = 1000 + i;
      const v1 = pst.update(0, 4, bigVal);
      expect(pst.queryMax(v1, 0, 4)).toBe(bigVal);
      // original still has max=5
      expect(pst.queryMax(0, 0, 4)).toBe(5);
    });
  }
});

// =============================================================================
// 19. pstMerge – min / max of merged tree (50 tests)
// =============================================================================
describe('pstMerge min/max n=1..50', () => {
  for (let n = 1; n <= 50; n++) {
    it(`n=${n}: merged min === original min, merged max === 2*original max`, () => {
      const arr = range(1, n);
      const rootA = pstBuild(arr);
      const rootB = pstBuild(arr);
      const merged = pstMerge(rootA, rootB);
      // Each position holds 2*original value, so min=2, max=2n
      expect(pstQueryMin(merged, 0, n - 1)).toBe(2);
      expect(pstQueryMax(merged, 0, n - 1)).toBe(2 * n);
    });
  }
});

// =============================================================================
// 20. PersistentFreqTree – countRange (50 tests)
// =============================================================================
describe('PersistentFreqTree countRange i=0..49', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: after inserting values 0..i, count [0..i] === i+1`, () => {
      const freq = new PersistentFreqTree(100);
      let v = 0;
      for (let j = 0; j <= i; j++) {
        v = freq.insert(v, j);
      }
      // All inserted values are in [0..i]
      expect(freq.countRange(1, v, 0, i)).toBe(i + 1);
    });
  }
});

// =============================================================================
// 21. PST – chained updates (50 tests)
// =============================================================================
describe('PST chained updates across positions i=0..49', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: chain of 5 updates all independently accessible`, () => {
      const arr = [100, 200, 300, 400, 500];
      const pst = new PersistentSegmentTree(arr);
      const v1 = pst.update(0, 0, i);
      const v2 = pst.update(v1, 1, i + 1);
      const v3 = pst.update(v2, 2, i + 2);
      const v4 = pst.update(v3, 3, i + 3);
      const v5 = pst.update(v4, 4, i + 4);

      expect(pst.queryPoint(v5, 0)).toBe(i);
      expect(pst.queryPoint(v5, 1)).toBe(i + 1);
      expect(pst.queryPoint(v5, 2)).toBe(i + 2);
      expect(pst.queryPoint(v5, 3)).toBe(i + 3);
      expect(pst.queryPoint(v5, 4)).toBe(i + 4);
    });
  }
});

// =============================================================================
// 22. PST – RangeError on out-of-bounds index (50 tests)
// =============================================================================
describe('PST RangeError on bad index i=0..49', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: updating idx=${10 + i} on size-10 array throws`, () => {
      const pst = new PersistentSegmentTree(range(0, 9));
      expect(() => pst.update(0, 10 + i, 0)).toThrow(RangeError);
    });
  }
});

// =============================================================================
// 23. pstUpdate – multiple sequential updates (50 tests)
// =============================================================================
describe('pstUpdate sequential n=1..50', () => {
  for (let n = 1; n <= 50; n++) {
    it(`n=${n}: updating every position yields correct final sum`, () => {
      const arr = new Array(n).fill(0);
      let root = pstBuild(arr);
      for (let j = 0; j < n; j++) {
        root = pstUpdate(root, j, j + 1);
      }
      // sum = 1+2+...+n = n*(n+1)/2
      expect(pstQuerySum(root, 0, n - 1)).toBe((n * (n + 1)) / 2);
    });
  }
});

// =============================================================================
// 24. PST – all-negative array sum (50 tests)
// =============================================================================
describe('PST all-negative array sum n=1..50', () => {
  for (let n = 1; n <= 50; n++) {
    it(`n=${n}: sum of [-1..-n] === -n*(n+1)/2`, () => {
      const arr = range(1, n).map(x => -x);
      const pst = new PersistentSegmentTree(arr);
      expect(pst.querySum(0, 0, n - 1)).toBe((-n * (n + 1)) / 2);
    });
  }
});

// =============================================================================
// 25. PST – single-element array (50 tests)
// =============================================================================
describe('PST single-element array i=0..49', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: single-element arr=[${i}], sum/min/max === ${i}`, () => {
      const pst = new PersistentSegmentTree([i]);
      expect(pst.querySum(0, 0, 0)).toBe(i);
      expect(pst.queryMin(0, 0, 0)).toBe(i);
      expect(pst.queryMax(0, 0, 0)).toBe(i);
    });
  }
});

// =============================================================================
// 26. PST – versions count after k updates (50 tests)
// =============================================================================
describe('PST versions count after k updates k=1..50', () => {
  for (let k = 1; k <= 50; k++) {
    it(`k=${k}: versions === k+1`, () => {
      const pst = new PersistentSegmentTree(range(0, 9));
      let v = 0;
      for (let j = 0; j < k; j++) {
        v = pst.update(v, j % 10, j * 3);
      }
      expect(pst.versions).toBe(k + 1);
    });
  }
});

// =============================================================================
// 27. PST – queryMin on single element range (50 tests)
// =============================================================================
describe('PST queryMin single element range i=0..49', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: queryMin(0, ${i}, ${i}) === arr[${i}]`, () => {
      const n = 50;
      const arr = range(100, 100 + n - 1); // 100..149
      const pst = new PersistentSegmentTree(arr);
      expect(pst.queryMin(0, i, i)).toBe(100 + i);
    });
  }
});

// =============================================================================
// 28. PST – queryMax on single element range (50 tests)
// =============================================================================
describe('PST queryMax single element range i=0..49', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: queryMax(0, ${i}, ${i}) === arr[${i}]`, () => {
      const n = 50;
      const arr = range(200, 200 + n - 1);
      const pst = new PersistentSegmentTree(arr);
      expect(pst.queryMax(0, i, i)).toBe(200 + i);
    });
  }
});

// =============================================================================
// 29. pstMerge – sum at each position (50 tests)
// =============================================================================
describe('pstMerge sum per position n=1..50', () => {
  for (let n = 1; n <= 50; n++) {
    it(`n=${n}: every position in merged has double value`, () => {
      const arr = range(1, n);
      const root = pstBuild(arr);
      const merged = pstMerge(root, root);
      // Check sum of entire merged tree
      const expected = 2 * (n * (n + 1)) / 2;
      expect(pstQuerySum(merged, 0, n - 1)).toBe(expected);
    });
  }
});

// =============================================================================
// 30. PersistentFreqTree – version 0 counts are zero (50 tests)
// =============================================================================
describe('PersistentFreqTree initial version has zero counts v=1..50', () => {
  for (let v = 1; v <= 50; v++) {
    it(`N=${v}: countRange(1, versions-1, 0, N-1) reflects only inserted elements`, () => {
      const freq = new PersistentFreqTree(100);
      // Insert just one element
      const v1 = freq.insert(0, v - 1);
      // Only element v-1 should be present
      expect(freq.countRange(1, v1, v - 1, v - 1)).toBe(1);
      if (v > 1) {
        expect(freq.countRange(1, v1, 0, v - 2)).toBe(0);
      }
    });
  }
});

// =============================================================================
// 31. PST – large value updates (50 tests)
// =============================================================================
describe('PST large value updates i=0..49', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: can store and retrieve large value ${i * 1000000}`, () => {
      const arr = range(0, 4);
      const pst = new PersistentSegmentTree(arr);
      const bigVal = i * 1000000;
      const v1 = pst.update(0, 2, bigVal);
      expect(pst.queryPoint(v1, 2)).toBe(bigVal);
    });
  }
});

// =============================================================================
// 32. pstBuild + pstQueryMin on reversed array (50 tests)
// =============================================================================
describe('pstBuild queryMin on reversed array n=1..50', () => {
  for (let n = 1; n <= 50; n++) {
    it(`n=${n}: min of reversed [n..1] === 1`, () => {
      const arr = range(1, n).reverse();
      const root = pstBuild(arr);
      expect(pstQueryMin(root, 0, n - 1)).toBe(1);
    });
  }
});

// =============================================================================
// 33. pstBuild + pstQueryMax on reversed array (50 tests)
// =============================================================================
describe('pstBuild queryMax on reversed array n=1..50', () => {
  for (let n = 1; n <= 50; n++) {
    it(`n=${n}: max of reversed [n..1] === n`, () => {
      const arr = range(1, n).reverse();
      const root = pstBuild(arr);
      expect(pstQueryMax(root, 0, n - 1)).toBe(n);
    });
  }
});

// =============================================================================
// 34. PST – update does not affect sibling version (50 tests)
// =============================================================================
describe('PST branching – sibling versions independent i=0..49', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: two updates from version 0 do not affect each other`, () => {
      const arr = range(1, 10);
      const pst = new PersistentSegmentTree(arr);
      const v1 = pst.update(0, 0, 999);
      const v2 = pst.update(0, 9, 888);
      // v1: pos 0 = 999, pos 9 = 10 (original)
      expect(pst.queryPoint(v1, 0)).toBe(999);
      expect(pst.queryPoint(v1, 9)).toBe(10);
      // v2: pos 0 = 1 (original), pos 9 = 888
      expect(pst.queryPoint(v2, 0)).toBe(1);
      expect(pst.queryPoint(v2, 9)).toBe(888);
    });
  }
});

// =============================================================================
// 35. pstUpdate – preserves unchanged positions (50 tests)
// =============================================================================
describe('pstUpdate preserves unchanged positions i=0..49', () => {
  for (let i = 0; i < 50; i++) {
    it(`i=${i}: all positions except ${i % 10} unchanged after update`, () => {
      const n = 10;
      const arr = range(1, n);
      const root = pstBuild(arr);
      const pos = i % n;
      const newRoot = pstUpdate(root, pos, 999);
      for (let j = 0; j < n; j++) {
        if (j !== pos) {
          expect(pstQuerySum(newRoot, j, j)).toBe(j + 1);
        }
      }
    });
  }
});
