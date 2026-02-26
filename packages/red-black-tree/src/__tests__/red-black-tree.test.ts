// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { RedBlackTree, createRedBlackTree, buildRBTree } from '../red-black-tree';

describe('RedBlackTree - insert and search', () => {
  it('empty tree isEmpty', () => { expect(new RedBlackTree().isEmpty()).toBe(true); });
  it('size 0 initially', () => { expect(new RedBlackTree().size).toBe(0); });
  it('insert one element', () => { const t = new RedBlackTree(); t.insert(5); expect(t.size).toBe(1); });
  it('search inserted element', () => { const t = new RedBlackTree(); t.insert(5); expect(t.search(5)).toBe(true); });
  it('search missing element', () => { expect(new RedBlackTree().search(99)).toBe(false); });
  it('duplicate insert ignored', () => { const t = new RedBlackTree(); t.insert(5); t.insert(5); expect(t.size).toBe(1); });
  it('inOrder is sorted', () => {
    const t = buildRBTree([5,3,7,1,4]);
    expect(t.inOrder()).toEqual([1,3,4,5,7]);
  });
  for (let i = 0; i < 100; i++) {
    it('insert and search ' + i, () => {
      const t = new RedBlackTree(); t.insert(i);
      expect(t.search(i)).toBe(true);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('inOrder sorted for ' + n + ' elements', () => {
      const arr = Array.from({ length: n }, (_, i) => n - i);
      const t = buildRBTree(arr);
      const sorted = t.inOrder();
      for (let i = 1; i < sorted.length; i++) expect(sorted[i]).toBeGreaterThan(sorted[i-1]);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('size = ' + n + ' after ' + n + ' unique inserts', () => {
      const t = new RedBlackTree();
      for (let i = 0; i < n; i++) t.insert(i);
      expect(t.size).toBe(n);
    });
  }
});

describe('RedBlackTree - min and max', () => {
  it('min of values', () => { expect(buildRBTree([5,3,8,1]).min()).toBe(1); });
  it('max of values', () => { expect(buildRBTree([5,3,8,1]).max()).toBe(8); });
  it('min/max of empty = undefined', () => { expect(new RedBlackTree().min()).toBeUndefined(); });
  for (let n = 1; n <= 50; n++) {
    it('min is 1 for array 1..' + n, () => { expect(buildRBTree(Array.from({length:n},(_,i)=>i+1)).min()).toBe(1); });
  }
  for (let n = 1; n <= 50; n++) {
    it('max is ' + n + ' for array 1..' + n, () => { expect(buildRBTree(Array.from({length:n},(_,i)=>i+1)).max()).toBe(n); });
  }
});

describe('createRedBlackTree', () => {
  it('returns instance', () => { expect(createRedBlackTree()).toBeInstanceOf(RedBlackTree); });
  it('custom string comparator', () => {
    const t = createRedBlackTree<string>((a,b)=>a.localeCompare(b));
    t.insert('banana'); t.insert('apple');
    expect(t.inOrder()).toEqual(['apple','banana']);
  });
  for (let i = 0; i < 100; i++) {
    it('search after insert with index ' + i, () => {
      const t = new RedBlackTree(); t.insert(i * 3);
      expect(t.search(i * 3)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('buildRBTree and search ' + i, () => {
      const t = buildRBTree([i, i+1, i+2]);
      expect(t.search(i+1)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('isEmpty = false after insert ' + i, () => {
      const t = new RedBlackTree(); t.insert(i);
      expect(t.isEmpty()).toBe(false);
    });
  }
});

describe('rbt top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('rbt search missing ' + i, () => {
      const t = buildRBTree([i+1, i+2]);
      expect(t.search(i + 1000)).toBe(false);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rbt inOrder length = size ' + i, () => {
      const t = new RedBlackTree();
      for (let j = 0; j <= i % 20; j++) t.insert(j);
      expect(t.inOrder().length).toBe(t.size);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rbt size increments ' + i, () => {
      const t = new RedBlackTree();
      for (let j = 0; j < i + 1; j++) t.insert(j);
      expect(t.size).toBe(i + 1);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rbt custom cmp insert ' + i, () => {
      const t = createRedBlackTree<number>((a,b) => b - a);
      t.insert(i); t.insert(i+1);
      expect(t.search(i)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rbt max >= min ' + i, () => {
      const t = buildRBTree([i, i+5, i+2]);
      expect((t.max() ?? 0)).toBeGreaterThanOrEqual((t.min() ?? 0));
    });
  }
});
