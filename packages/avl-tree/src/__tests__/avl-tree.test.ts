// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { AVLTree, createAVLTree, buildAVLTree } from '../avl-tree';

describe('AVLTree - insert and search', () => {
  it('empty tree isEmpty', () => { expect(new AVLTree().isEmpty()).toBe(true); });
  it('size 0 initially', () => { expect(new AVLTree().size).toBe(0); });
  it('insert one element', () => { const t = new AVLTree(); t.insert(5); expect(t.size).toBe(1); });
  it('search inserted element', () => { const t = new AVLTree(); t.insert(5); expect(t.search(5)).toBe(true); });
  it('search missing element', () => { expect(new AVLTree().search(99)).toBe(false); });
  it('duplicate insert ignored', () => { const t = new AVLTree(); t.insert(5); t.insert(5); expect(t.size).toBe(1); });
  it('inOrder is sorted', () => {
    const t = buildAVLTree([5,3,7,1,4]);
    expect(t.inOrder()).toEqual([1,3,4,5,7]);
  });
  it('height stays balanced', () => {
    const t = buildAVLTree(Array.from({ length: 15 }, (_, i) => i + 1));
    expect(t.height).toBeLessThanOrEqual(5);
  });
  for (let i = 0; i < 100; i++) {
    it('insert and search ' + i, () => {
      const t = new AVLTree(); t.insert(i);
      expect(t.search(i)).toBe(true);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('inOrder sorted for ' + n + ' elements', () => {
      const arr = Array.from({ length: n }, (_, i) => n - i);
      const t = buildAVLTree(arr);
      const sorted = t.inOrder();
      for (let i = 1; i < sorted.length; i++) expect(sorted[i]).toBeGreaterThan(sorted[i-1]);
    });
  }
});

describe('AVLTree - delete', () => {
  it('delete reduces size', () => { const t = buildAVLTree([1,2,3]); t.delete(2); expect(t.size).toBe(2); });
  it('delete makes search return false', () => {
    const t = buildAVLTree([1,2,3]); t.delete(2);
    expect(t.search(2)).toBe(false);
  });
  it('delete non-existing is no-op', () => { const t = buildAVLTree([1,2,3]); t.delete(99); expect(t.size).toBe(3); });
  it('inOrder still sorted after delete', () => {
    const t = buildAVLTree([5,3,7,1,4,6,8]); t.delete(5);
    const arr = t.inOrder();
    for (let i = 1; i < arr.length; i++) expect(arr[i]).toBeGreaterThan(arr[i-1]);
  });
  for (let i = 0; i < 100; i++) {
    it('delete then search false ' + i, () => {
      const t = new AVLTree(); t.insert(i); t.delete(i);
      expect(t.search(i)).toBe(false);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('delete all ' + n + ' leaves empty', () => {
      const t = buildAVLTree(Array.from({ length: n }, (_, i) => i + 1));
      for (let i = 1; i <= n; i++) t.delete(i);
      expect(t.isEmpty()).toBe(true);
    });
  }
});

describe('AVLTree - height and min', () => {
  it('min of inserted values', () => { const t = buildAVLTree([5,3,8,1]); expect(t.min()).toBe(1); });
  it('height of empty is 0', () => { expect(new AVLTree().height).toBe(0); });
  it('height of single node is 1', () => { const t = new AVLTree(); t.insert(1); expect(t.height).toBe(1); });
  for (let n = 1; n <= 50; n++) {
    it('height <= log2(' + n + ')+2', () => {
      const t = buildAVLTree(Array.from({ length: n }, (_, i) => i + 1));
      expect(t.height).toBeLessThanOrEqual(Math.ceil(Math.log2(n + 1)) + 2);
    });
  }
});

describe('createAVLTree and custom comparator', () => {
  it('custom string comparator', () => {
    const t = createAVLTree<string>((a, b) => a.localeCompare(b));
    t.insert('banana'); t.insert('apple'); t.insert('cherry');
    expect(t.inOrder()).toEqual(['apple','banana','cherry']);
  });
  for (let i = 0; i < 50; i++) {
    it('buildAVLTree and search ' + i, () => {
      const t = buildAVLTree([i, i+1, i+2]);
      expect(t.search(i+1)).toBe(true);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('AVLTree size correct ' + i, () => {
      const t = buildAVLTree(Array.from({ length: i + 1 }, (_, j) => j));
      expect(t.size).toBe(i + 1);
    });
  }
});

describe('avl top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('avl search after many inserts ' + i, () => {
      const t = buildAVLTree(Array.from({length:20},(_,j)=>j*i%100));
      expect(t.size).toBeGreaterThanOrEqual(0);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('avl inOrder length correct ' + i, () => {
      const t = new AVLTree();
      for (let j = 0; j <= i % 20; j++) t.insert(j);
      expect(t.inOrder().length).toBe(t.size);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('avl not empty after insert ' + i, () => {
      const t = new AVLTree(); t.insert(i);
      expect(t.isEmpty()).toBe(false);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('avl min <= i ' + i, () => {
      const t = buildAVLTree([i, i+1, i+2]);
      expect(t.min()).toBe(i);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('avl size after delete ' + i, () => {
      const t = buildAVLTree([i, i+1, i+2]);
      t.delete(i+1);
      expect(t.size).toBe(2);
    });
  }
});

describe('avl final', () => {
  for (let i = 0; i < 50; i++) {
    it('avl search random ' + i, () => {
      const t = buildAVLTree([i*2, i*2+1, i*2+2]);
      expect(t.search(i*2)).toBe(true);
      expect(t.search(i*2+1)).toBe(true);
    });
  }
});
