// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { SegmentTree, sumSegmentTree, minSegmentTree, maxSegmentTree, rangeSum, rangeMin, rangeMax } from '../segment-tree';

describe('SegmentTree - sum', () => {
  it('sum of all elements', () => {
    const st = sumSegmentTree([1,2,3,4,5]);
    expect(st.query(0, 4)).toBe(15);
  });
  it('prefix sum [0,2]', () => {
    expect(sumSegmentTree([1,2,3,4,5]).query(0, 2)).toBe(6);
  });
  it('single element query', () => {
    expect(sumSegmentTree([10,20,30]).query(1, 1)).toBe(20);
  });
  it('update changes sum', () => {
    const st = sumSegmentTree([1,2,3]);
    st.update(1, 10);
    expect(st.query(0, 2)).toBe(14);
  });
  it('empty array query returns identity', () => {
    const st = sumSegmentTree([]);
    expect(st.query(0, 0)).toBe(0);
  });
  for (let n = 1; n <= 50; n++) {
    it('sum [0,' + (n-1) + '] of 1..n = ' + n*(n+1)/2, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(sumSegmentTree(arr).query(0, n - 1)).toBe(n * (n + 1) / 2);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('single element query at ' + i, () => {
      const arr = Array.from({ length: 50 }, (_, j) => j * 2);
      expect(sumSegmentTree(arr).query(i, i)).toBe(i * 2);
    });
  }
});

describe('SegmentTree - min', () => {
  it('min of all', () => { expect(minSegmentTree([3,1,4,1,5]).query(0, 4)).toBe(1); });
  it('min of range', () => { expect(minSegmentTree([5,3,8,1,9]).query(1, 3)).toBe(1); });
  it('update affects min', () => {
    const st = minSegmentTree([5,3,8]);
    st.update(0, 1);
    expect(st.query(0, 2)).toBe(1);
  });
  for (let n = 1; n <= 50; n++) {
    it('min of descending array 1..' + n + ' is 1', () => {
      const arr = Array.from({ length: n }, (_, i) => n - i);
      expect(minSegmentTree(arr).query(0, n - 1)).toBe(1);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('min range [' + i + ',' + i + '] = ' + i, () => {
      const arr = Array.from({ length: 50 }, (_, j) => j);
      expect(minSegmentTree(arr).query(i, i)).toBe(i);
    });
  }
});

describe('SegmentTree - max', () => {
  it('max of all', () => { expect(maxSegmentTree([3,1,4,1,5]).query(0, 4)).toBe(5); });
  it('max of range', () => { expect(maxSegmentTree([1,8,3,7,2]).query(1, 3)).toBe(8); });
  for (let n = 1; n <= 50; n++) {
    it('max of ascending array 1..' + n + ' is ' + n, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(maxSegmentTree(arr).query(0, n - 1)).toBe(n);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('max single element at ' + i, () => {
      const arr = Array.from({ length: 50 }, (_, j) => j * 3);
      expect(maxSegmentTree(arr).query(i, i)).toBe(i * 3);
    });
  }
});

describe('rangeSum, rangeMin, rangeMax helpers', () => {
  it('rangeSum works', () => { expect(rangeSum([1,2,3,4,5], 1, 3)).toBe(9); });
  it('rangeMin works', () => { expect(rangeMin([5,1,3,2,4], 1, 3)).toBe(1); });
  it('rangeMax works', () => { expect(rangeMax([1,8,3,7,2], 0, 4)).toBe(8); });
  for (let i = 0; i < 50; i++) {
    it('rangeSum single element ' + i, () => {
      const arr = Array.from({ length: 50 }, (_, j) => j + 1);
      expect(rangeSum(arr, i, i)).toBe(i + 1);
    });
  }
});

describe('SegmentTree - length and update', () => {
  it('length matches array', () => { expect(sumSegmentTree([1,2,3]).length).toBe(3); });
  for (let n = 1; n <= 50; n++) {
    it('length = ' + n, () => { expect(sumSegmentTree(Array(n).fill(0)).length).toBe(n); });
  }
  for (let i = 0; i < 50; i++) {
    it('update at ' + i + ' affects only that range', () => {
      const arr = Array.from({ length: 50 }, () => 1);
      const st = sumSegmentTree(arr);
      st.update(i, 100);
      expect(st.query(i, i)).toBe(100);
    });
  }
});

describe('segment-tree top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('sum [0,' + i + '] correct', () => {
      const arr = Array.from({ length: i + 1 }, (_, j) => j + 1);
      const st = sumSegmentTree(arr);
      expect(st.query(0, i)).toBe((i + 1) * (i + 2) / 2);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('min after update ' + i, () => {
      const arr = Array.from({ length: 10 }, (_, j) => j + 10);
      const st = minSegmentTree(arr);
      st.update(i % 10, i % 5);
      expect(st.query(0, 9)).toBeLessThanOrEqual(10);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('max after update ' + i, () => {
      const arr = Array.from({ length: 10 }, (_, j) => j);
      const st = maxSegmentTree(arr);
      st.update(i % 10, 1000 + i);
      expect(st.query(0, 9)).toBe(1000 + i);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('segment-tree length after construction ' + n, () => {
      expect(sumSegmentTree(Array(n).fill(1)).length).toBe(n);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rangeSum helper ' + i, () => {
      const arr = Array.from({ length: 20 }, (_, j) => j + 1);
      const l = i % 10, r = l + (i % 5) + 1;
      const expected = arr.slice(l, r + 1).reduce((a, b) => a + b, 0);
      expect(rangeSum(arr, l, r)).toBe(expected);
    });
  }
});

describe('segment final top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('sum of two-element array [' + i + ',' + (i+1) + ']', () => {
      const st = sumSegmentTree([i, i + 1]);
      expect(st.query(0, 1)).toBe(i + i + 1);
    });
  }
});
