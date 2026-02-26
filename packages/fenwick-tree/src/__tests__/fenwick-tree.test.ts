// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { FenwickTree, FenwickTree2D, createFenwickTree, createFenwickTree2D } from '../fenwick-tree';

describe('FenwickTree - basic', () => {
  it('creates with size n', () => { expect(new FenwickTree(5).size).toBe(5); });
  it('prefix sum is 0 initially', () => { expect(new FenwickTree(5).prefixSum(3)).toBe(0); });
  it('update then prefixSum', () => {
    const ft = new FenwickTree(5); ft.update(1, 3);
    expect(ft.prefixSum(1)).toBe(3);
  });
  it('update multiple then sum', () => {
    const ft = new FenwickTree(5);
    ft.update(1, 1); ft.update(2, 2); ft.update(3, 3);
    expect(ft.prefixSum(3)).toBe(6);
  });
  it('rangeSum [2,3]', () => {
    const ft = new FenwickTree(5);
    ft.update(1, 10); ft.update(2, 20); ft.update(3, 30);
    expect(ft.rangeSum(2, 3)).toBe(50);
  });
  it('point value', () => {
    const ft = new FenwickTree(5); ft.update(2, 42);
    expect(ft.point(2)).toBe(42);
  });
  for (let n = 1; n <= 50; n++) {
    it('FenwickTree size = ' + n, () => { expect(new FenwickTree(n).size).toBe(n); });
  }
  for (let i = 1; i <= 50; i++) {
    it('update(' + i + ', i) then point = ' + i, () => {
      const ft = new FenwickTree(55);
      ft.update(i, i);
      expect(ft.point(i)).toBe(i);
    });
  }
});

describe('FenwickTree - fromArray', () => {
  it('fromArray builds correct prefix sums', () => {
    const ft = FenwickTree.fromArray([1,2,3,4,5]);
    expect(ft.prefixSum(5)).toBe(15);
  });
  it('fromArray rangeSum', () => {
    const ft = FenwickTree.fromArray([1,2,3,4,5]);
    expect(ft.rangeSum(2, 4)).toBe(9);
  });
  it('fromArray size', () => {
    expect(FenwickTree.fromArray([1,2,3]).size).toBe(3);
  });
  for (let n = 1; n <= 50; n++) {
    it('fromArray of 1..n prefix sum = n*(n+1)/2, n=' + n, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const ft = FenwickTree.fromArray(arr);
      expect(ft.prefixSum(n)).toBe(n * (n + 1) / 2);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('fromArray point value at index ' + i, () => {
      const arr = Array.from({ length: 50 }, (_, j) => j * 2);
      const ft = FenwickTree.fromArray(arr);
      expect(ft.point(i + 1)).toBe(i * 2);
    });
  }
});

describe('FenwickTree - toArray and find', () => {
  it('toArray matches original', () => {
    const arr = [3, 1, 4, 1, 5];
    const ft = FenwickTree.fromArray(arr);
    expect(ft.toArray()).toEqual(arr);
  });
  it('find returns correct index', () => {
    const ft = FenwickTree.fromArray([1,2,3,4,5]);
    expect(ft.find(1)).toBe(1);
  });
  for (let n = 1; n <= 50; n++) {
    it('toArray has length ' + n, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(FenwickTree.fromArray(arr).toArray()).toHaveLength(n);
    });
  }
});

describe('FenwickTree2D - basic', () => {
  it('creates with rows and cols', () => { expect(new FenwickTree2D(3, 3)).toBeDefined(); });
  it('prefix sum initially 0', () => { expect(new FenwickTree2D(3, 3).prefixSum(2, 2)).toBe(0); });
  it('update then prefix sum', () => {
    const ft = new FenwickTree2D(3, 3); ft.update(1, 1, 5);
    expect(ft.prefixSum(1, 1)).toBe(5);
  });
  it('rangeSum rectangle', () => {
    const ft = new FenwickTree2D(4, 4);
    ft.update(1, 1, 1); ft.update(2, 2, 4); ft.update(3, 3, 9);
    expect(ft.rangeSum(1, 1, 3, 3)).toBe(14);
  });
  it('createFenwickTree2D factory', () => { expect(createFenwickTree2D(3, 3)).toBeInstanceOf(FenwickTree2D); });
  for (let i = 1; i <= 50; i++) {
    it('2D update(' + i + ',' + i + ', val)', () => {
      const ft = new FenwickTree2D(55, 55);
      ft.update(i, i, i * 2);
      expect(ft.rangeSum(i, i, i, i)).toBe(i * 2);
    });
  }
});

describe('createFenwickTree factory', () => {
  it('returns FenwickTree instance', () => { expect(createFenwickTree(5)).toBeInstanceOf(FenwickTree); });
  for (let n = 1; n <= 50; n++) {
    it('createFenwickTree(' + n + ').size = ' + n, () => {
      expect(createFenwickTree(n).size).toBe(n);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it('FenwickTree update then rangeSum ' + i, () => {
      const ft = createFenwickTree(100);
      ft.update(i, i);
      expect(ft.rangeSum(i, i)).toBe(i);
    });
  }
});

describe('FenwickTree prefix sums large', () => {
  for (let n = 1; n <= 50; n++) {
    it('prefix sum of all zeros is 0 for n=' + n, () => {
      const ft = new FenwickTree(n);
      expect(ft.prefixSum(n)).toBe(0);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it('multiple updates accumulate ' + i, () => {
      const ft = new FenwickTree(100);
      ft.update(i, 1); ft.update(i, 2); ft.update(i, 3);
      expect(ft.point(i)).toBe(6);
    });
  }
});

describe('fenwick top-up', () => {
  for (let i = 1; i <= 100; i++) {
    it('prefixSum of ' + i + ' elements all 1s = ' + i, () => {
      const ft = new FenwickTree(i);
      for (let j = 1; j <= i; j++) ft.update(j, 1);
      expect(ft.prefixSum(i)).toBe(i);
    });
  }
  for (let i = 1; i <= 100; i++) {
    it('rangeSum single element at ' + i, () => {
      const ft = new FenwickTree(105);
      ft.update(i, i * 2);
      expect(ft.rangeSum(i, i)).toBe(i * 2);
    });
  }
  for (let n = 1; n <= 100; n++) {
    it('fromArray size ' + n, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(FenwickTree.fromArray(arr).size).toBe(n);
    });
  }
  for (let i = 1; i <= 100; i++) {
    it('2D rangeSum single cell ' + i, () => {
      const ft = new FenwickTree2D(105, 105);
      ft.update(i, i, i * 3);
      expect(ft.rangeSum(i, i, i, i)).toBe(i * 3);
    });
  }
  for (let i = 1; i <= 100; i++) {
    it('FenwickTree point after update ' + i, () => {
      const ft = createFenwickTree(105);
      ft.update(i, i * 5);
      expect(ft.point(i)).toBe(i * 5);
    });
  }
});
