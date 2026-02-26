// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { OrderStatisticsTree, createOST, fromArray, findMedian, RunningMedian } from '../order-statistics-tree';

describe('insert and contains 200 tests', () => {
  for (let n = 1; n <= 200; n++) {
    it(`insert ${n} and contains`, () => {
      const t = createOST(); t.insert(n);
      expect(t.contains(n)).toBe(true);
      expect(t.size).toBe(1);
    });
  }
});

describe('rank tests 200 tests', () => {
  for (let n = 1; n <= 200; n++) {
    it(`rank of ${n} in fromArray([1..${n}])`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const t = fromArray(arr);
      expect(t.rank(n + 1)).toBe(n);
    });
  }
});

describe('select tests 200 tests', () => {
  for (let n = 1; n <= 200; n++) {
    it(`select(0) from [1..${n}] = 1`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const t = fromArray(arr);
      expect(t.select(0)).toBe(1);
    });
  }
});

describe('kthSmallest 200 tests', () => {
  for (let n = 1; n <= 200; n++) {
    it(`kthSmallest(1) from [1..${n}] = 1`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const t = fromArray(arr);
      expect(t.kthSmallest(1)).toBe(1);
    });
  }
});

describe('min/max 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`min and max of [1..${n}]`, () => {
      const t = fromArray(Array.from({ length: n }, (_, i) => i + 1));
      expect(t.min()).toBe(1);
      expect(t.max()).toBe(n);
    });
  }
});

describe('findMedian 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`findMedian([1..${n}])`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const median = findMedian(arr);
      expect(typeof median).toBe('number');
      expect(median).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('toSortedArray 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`toSortedArray from random insert n=${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => (i * 7 + 3) % (n * 2));
      const t = fromArray(arr);
      const sorted = t.toSortedArray();
      expect(sorted.length).toBe(n);
      for (let i = 1; i < sorted.length; i++) expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i-1]);
    });
  }
});
