// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

import { BTree, BPlusTree } from '../b-tree';

// =============================================================================
// BTree — insert and search (keys 1..100)
// =============================================================================
describe('BTree insert and search', () => {
  for (let n = 1; n <= 100; n++) {
    it(`BTree order 3: insert 1..${n}, search key ${n}`, () => {
      const t = new BTree<string>();
      for (let i = 1; i <= n; i++) t.insert(i, `v${i}`);
      expect(t.search(n)).toBe(`v${n}`);
      expect(t.size).toBe(n);
    });
  }
});

// =============================================================================
// BTree — search missing keys (1..50)
// =============================================================================
describe('BTree search missing keys', () => {
  for (let n = 1; n <= 50; n++) {
    it(`BTree: search missing key ${n + 1000} returns undefined`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i * 10);
      expect(t.search(n + 1000)).toBeUndefined();
    });
  }
});

// =============================================================================
// BTree — has() true and false (1..50)
// =============================================================================
describe('BTree has()', () => {
  for (let n = 1; n <= 50; n++) {
    it(`BTree has: key ${n} present, key ${n + 500} absent`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      expect(t.has(n)).toBe(true);
      expect(t.has(n + 500)).toBe(false);
    });
  }
});

// =============================================================================
// BTree — delete existing keys (1..80)
// =============================================================================
describe('BTree delete existing keys', () => {
  for (let n = 1; n <= 80; n++) {
    it(`BTree delete: remove key ${n} from 1..${n} tree`, () => {
      const t = new BTree<string>();
      for (let i = 1; i <= n; i++) t.insert(i, `v${i}`);
      expect(t.delete(n)).toBe(true);
      expect(t.search(n)).toBeUndefined();
      expect(t.size).toBe(n - 1);
    });
  }
});

// =============================================================================
// BTree — delete non-existing keys (1..40)
// =============================================================================
describe('BTree delete non-existing keys', () => {
  for (let n = 1; n <= 40; n++) {
    it(`BTree delete missing key ${n + 200} returns false`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      expect(t.delete(n + 200)).toBe(false);
      expect(t.size).toBe(n);
    });
  }
});

// =============================================================================
// BTree — min() (1..50)
// =============================================================================
describe('BTree min()', () => {
  for (let n = 1; n <= 50; n++) {
    it(`BTree min: min of 1..${n} is 1`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i * 2);
      const m = t.min();
      expect(m).toBeDefined();
      expect(m!.key).toBe(1);
      expect(m!.value).toBe(2);
    });
  }
});

// =============================================================================
// BTree — max() (1..50)
// =============================================================================
describe('BTree max()', () => {
  for (let n = 1; n <= 50; n++) {
    it(`BTree max: max of 1..${n} is ${n}`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i * 3);
      const m = t.max();
      expect(m).toBeDefined();
      expect(m!.key).toBe(n);
      expect(m!.value).toBe(n * 3);
    });
  }
});

// =============================================================================
// BTree — inorder() returns sorted keys (1..60)
// =============================================================================
describe('BTree inorder sorted', () => {
  for (let n = 1; n <= 60; n++) {
    it(`BTree inorder sorted for n=${n}`, () => {
      const t = new BTree<number>();
      // Insert in reverse order to stress sorting
      for (let i = n; i >= 1; i--) t.insert(i, i);
      const arr = t.inorder();
      expect(arr.length).toBe(n);
      for (let i = 0; i < arr.length; i++) {
        expect(arr[i].key).toBe(i + 1);
      }
    });
  }
});

// =============================================================================
// BTree — rangeSearch (1..40)
// =============================================================================
describe('BTree rangeSearch', () => {
  for (let n = 5; n <= 44; n++) {
    it(`BTree rangeSearch [2,${n - 1}] in tree 1..${n}`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      const result = t.rangeSearch(2, n - 1);
      const keys = result.map(r => r.key);
      expect(keys.length).toBe(n - 2);
      expect(keys[0]).toBe(2);
      expect(keys[keys.length - 1]).toBe(n - 1);
    });
  }
});

// =============================================================================
// BTree — validate() on fresh trees (order 2..8, sizes 1..5)
// =============================================================================
describe('BTree validate()', () => {
  const orders = [2, 3, 4, 5, 6, 7, 8];
  const sizes = [1, 2, 3, 4, 5];
  for (const order of orders) {
    for (const size of sizes) {
      it(`BTree validate: order=${order} size=${size}`, () => {
        const t = new BTree<number>(order);
        for (let i = 1; i <= size; i++) t.insert(i, i);
        expect(t.validate()).toBe(true);
      });
    }
  }
});

// =============================================================================
// BTree — validate() after deletions
// =============================================================================
describe('BTree validate after deletions', () => {
  for (let n = 5; n <= 34; n++) {
    it(`BTree validate after deleting half of 1..${n}`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      for (let i = 2; i <= n; i += 2) t.delete(i);
      expect(t.validate()).toBe(true);
    });
  }
});

// =============================================================================
// BTree — various orders: insert and search (orders 2..7, 10 inserts each)
// =============================================================================
describe('BTree various orders', () => {
  const orders = [2, 3, 4, 5, 6, 7];
  const keys = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  for (const order of orders) {
    for (const key of keys) {
      it(`BTree order=${order}: insert 10 keys, search ${key}`, () => {
        const t = new BTree<string>(order);
        keys.forEach(k => t.insert(k, `val${k}`));
        expect(t.search(key)).toBe(`val${key}`);
        expect(t.size).toBe(keys.length);
      });
    }
  }
});

// =============================================================================
// BTree — update existing key
// =============================================================================
describe('BTree update existing key', () => {
  for (let n = 1; n <= 50; n++) {
    it(`BTree update: overwrite value of key ${n}`, () => {
      const t = new BTree<string>();
      for (let i = 1; i <= n; i++) t.insert(i, `old${i}`);
      t.insert(n, 'updated');
      expect(t.search(n)).toBe('updated');
      expect(t.size).toBe(n); // size unchanged
    });
  }
});

// =============================================================================
// BTree — height grows correctly (sizes 1..30)
// =============================================================================
describe('BTree height', () => {
  for (let n = 1; n <= 30; n++) {
    it(`BTree height >= 1 for n=${n}`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      expect(t.height()).toBeGreaterThanOrEqual(1);
    });
  }
});

// =============================================================================
// BTree — empty tree edge cases
// =============================================================================
describe('BTree empty tree edge cases', () => {
  it('empty tree: size is 0', () => {
    const t = new BTree<number>();
    expect(t.size).toBe(0);
  });
  it('empty tree: search returns undefined', () => {
    const t = new BTree<number>();
    expect(t.search(1)).toBeUndefined();
  });
  it('empty tree: has returns false', () => {
    const t = new BTree<number>();
    expect(t.has(1)).toBe(false);
  });
  it('empty tree: delete returns false', () => {
    const t = new BTree<number>();
    expect(t.delete(1)).toBe(false);
  });
  it('empty tree: min returns undefined', () => {
    const t = new BTree<number>();
    expect(t.min()).toBeUndefined();
  });
  it('empty tree: max returns undefined', () => {
    const t = new BTree<number>();
    expect(t.max()).toBeUndefined();
  });
  it('empty tree: inorder returns empty array', () => {
    const t = new BTree<number>();
    expect(t.inorder()).toEqual([]);
  });
  it('empty tree: rangeSearch returns empty array', () => {
    const t = new BTree<number>();
    expect(t.rangeSearch(1, 10)).toEqual([]);
  });
  it('empty tree: height is 0', () => {
    const t = new BTree<number>();
    expect(t.height()).toBe(0);
  });
  it('empty tree: validate returns true', () => {
    const t = new BTree<number>();
    expect(t.validate()).toBe(true);
  });
});

// =============================================================================
// BTree — large tree operations (n=200,300)
// =============================================================================
describe('BTree large insertions', () => {
  it('BTree insert 200 keys, all searchable', () => {
    const t = new BTree<number>();
    for (let i = 1; i <= 200; i++) t.insert(i, i * 10);
    expect(t.size).toBe(200);
    for (let i = 1; i <= 200; i++) expect(t.search(i)).toBe(i * 10);
  });

  it('BTree insert 300 keys in reverse, inorder correct', () => {
    const t = new BTree<number>();
    for (let i = 300; i >= 1; i--) t.insert(i, i);
    const arr = t.inorder();
    expect(arr.length).toBe(300);
    for (let i = 0; i < arr.length; i++) expect(arr[i].key).toBe(i + 1);
  });

  it('BTree insert 200 then delete all, size 0', () => {
    const t = new BTree<number>();
    for (let i = 1; i <= 200; i++) t.insert(i, i);
    for (let i = 1; i <= 200; i++) t.delete(i);
    expect(t.size).toBe(0);
    expect(t.min()).toBeUndefined();
    expect(t.max()).toBeUndefined();
  });

  it('BTree insert 500 keys, validate passes', () => {
    const t = new BTree<number>();
    for (let i = 1; i <= 500; i++) t.insert(i, i);
    expect(t.validate()).toBe(true);
  });

  it('BTree order 2 insert 100 keys, validate passes', () => {
    const t = new BTree<number>(2);
    for (let i = 1; i <= 100; i++) t.insert(i, i);
    expect(t.validate()).toBe(true);
    expect(t.size).toBe(100);
  });
});

// =============================================================================
// BTree — rangeSearch edge cases
// =============================================================================
describe('BTree rangeSearch edge cases', () => {
  it('rangeSearch empty result when lo > hi', () => {
    const t = new BTree<number>();
    for (let i = 1; i <= 10; i++) t.insert(i, i);
    expect(t.rangeSearch(10, 1)).toEqual([]);
  });

  it('rangeSearch single key range', () => {
    const t = new BTree<number>();
    for (let i = 1; i <= 10; i++) t.insert(i, i);
    const res = t.rangeSearch(5, 5);
    expect(res.length).toBe(1);
    expect(res[0].key).toBe(5);
  });

  it('rangeSearch entire tree', () => {
    const t = new BTree<number>();
    for (let i = 1; i <= 20; i++) t.insert(i, i);
    const res = t.rangeSearch(1, 20);
    expect(res.length).toBe(20);
  });

  it('rangeSearch outside tree range returns empty', () => {
    const t = new BTree<number>();
    for (let i = 1; i <= 10; i++) t.insert(i, i);
    expect(t.rangeSearch(100, 200)).toEqual([]);
  });

  it('rangeSearch results in order', () => {
    const t = new BTree<number>();
    for (let i = 50; i >= 1; i--) t.insert(i, i);
    const res = t.rangeSearch(10, 20);
    const keys = res.map(r => r.key);
    for (let i = 1; i < keys.length; i++) expect(keys[i]).toBeGreaterThan(keys[i - 1]);
  });
});

// =============================================================================
// BTree — delete first and last keys (1..40)
// =============================================================================
describe('BTree delete boundary keys', () => {
  for (let n = 2; n <= 41; n++) {
    it(`BTree delete first key from 1..${n}`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      t.delete(1);
      expect(t.has(1)).toBe(false);
      expect(t.size).toBe(n - 1);
      expect(t.min()!.key).toBe(2);
    });
  }
});

// =============================================================================
// BTree — constructor invalid order throws
// =============================================================================
describe('BTree constructor validation', () => {
  it('throws on order < 2', () => {
    expect(() => new BTree(1)).toThrow();
  });
  it('throws on order 0', () => {
    expect(() => new BTree(0)).toThrow();
  });
  it('does not throw on order 2', () => {
    expect(() => new BTree(2)).not.toThrow();
  });
  it('does not throw on order 10', () => {
    expect(() => new BTree(10)).not.toThrow();
  });
});

// =============================================================================
// BTree — inorder returns correct values (1..30)
// =============================================================================
describe('BTree inorder values correct', () => {
  for (let n = 1; n <= 30; n++) {
    it(`BTree inorder: values correct for n=${n}`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i * 7);
      const arr = t.inorder();
      for (let i = 0; i < arr.length; i++) {
        expect(arr[i].value).toBe((i + 1) * 7);
      }
    });
  }
});

// =============================================================================
// BTree — delete middle keys stress (sizes 3..30)
// =============================================================================
describe('BTree delete middle keys', () => {
  for (let n = 3; n <= 30; n++) {
    it(`BTree delete middle key ${Math.ceil(n / 2)} from 1..${n}`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      const mid = Math.ceil(n / 2);
      expect(t.delete(mid)).toBe(true);
      expect(t.search(mid)).toBeUndefined();
      expect(t.size).toBe(n - 1);
      expect(t.validate()).toBe(true);
    });
  }
});

// =============================================================================
// BTree — size tracking after multiple operations
// =============================================================================
describe('BTree size tracking', () => {
  it('size increments on each unique insert', () => {
    const t = new BTree<number>();
    for (let i = 1; i <= 20; i++) {
      t.insert(i, i);
      expect(t.size).toBe(i);
    }
  });

  it('size unchanged on duplicate insert', () => {
    const t = new BTree<number>();
    t.insert(1, 100);
    t.insert(1, 200);
    expect(t.size).toBe(1);
  });

  it('size decrements on delete', () => {
    const t = new BTree<number>();
    for (let i = 1; i <= 10; i++) t.insert(i, i);
    for (let i = 1; i <= 10; i++) {
      t.delete(i);
      expect(t.size).toBe(10 - i);
    }
  });
});

// =============================================================================
// BTree — random-order insertions (1..40)
// =============================================================================
describe('BTree random-order insertions', () => {
  for (let n = 1; n <= 40; n++) {
    it(`BTree random order n=${n}: all keys found`, () => {
      const t = new BTree<number>();
      // Insert using a permutation based on n
      const keys: number[] = [];
      for (let i = 1; i <= n; i++) keys.push(i);
      // Simple deterministic shuffle: reverse-interleave
      const shuffled: number[] = [];
      let lo = 0, hi = keys.length - 1;
      while (lo <= hi) {
        if (lo === hi) { shuffled.push(keys[lo]); break; }
        shuffled.push(keys[hi--]);
        shuffled.push(keys[lo++]);
      }
      for (const k of shuffled) t.insert(k, k * 2);
      expect(t.size).toBe(n);
      for (let i = 1; i <= n; i++) expect(t.search(i)).toBe(i * 2);
    });
  }
});

// =============================================================================
// BPlusTree — insert and search (1..100)
// =============================================================================
describe('BPlusTree insert and search', () => {
  for (let n = 1; n <= 100; n++) {
    it(`BPlusTree insert 1..${n}, search ${n}`, () => {
      const t = new BPlusTree<string>();
      for (let i = 1; i <= n; i++) t.insert(i, `vp${i}`);
      expect(t.search(n)).toBe(`vp${n}`);
      expect(t.size).toBe(n);
    });
  }
});

// =============================================================================
// BPlusTree — search missing keys (1..50)
// =============================================================================
describe('BPlusTree search missing keys', () => {
  for (let n = 1; n <= 50; n++) {
    it(`BPlusTree missing key ${n + 500} returns undefined`, () => {
      const t = new BPlusTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      expect(t.search(n + 500)).toBeUndefined();
    });
  }
});

// =============================================================================
// BPlusTree — delete (1..60)
// =============================================================================
describe('BPlusTree delete', () => {
  for (let n = 1; n <= 60; n++) {
    it(`BPlusTree delete key ${n} from 1..${n}`, () => {
      const t = new BPlusTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i * 5);
      expect(t.delete(n)).toBe(true);
      expect(t.search(n)).toBeUndefined();
      expect(t.size).toBe(n - 1);
    });
  }
});

// =============================================================================
// BPlusTree — delete missing key (1..40)
// =============================================================================
describe('BPlusTree delete missing key', () => {
  for (let n = 1; n <= 40; n++) {
    it(`BPlusTree delete missing key ${n + 100} returns false`, () => {
      const t = new BPlusTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      expect(t.delete(n + 100)).toBe(false);
      expect(t.size).toBe(n);
    });
  }
});

// =============================================================================
// BPlusTree — rangeScan (5..50)
// =============================================================================
describe('BPlusTree rangeScan', () => {
  for (let n = 5; n <= 50; n++) {
    it(`BPlusTree rangeScan [2,${n - 1}] in 1..${n}`, () => {
      const t = new BPlusTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      const result = t.rangeScan(2, n - 1);
      expect(result.length).toBe(n - 2);
      expect(result[0]).toBe(2);
      expect(result[result.length - 1]).toBe(n - 1);
    });
  }
});

// =============================================================================
// BPlusTree — allValues() (1..40)
// =============================================================================
describe('BPlusTree allValues()', () => {
  for (let n = 1; n <= 40; n++) {
    it(`BPlusTree allValues for n=${n}`, () => {
      const t = new BPlusTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i * 4);
      const vals = t.allValues();
      expect(vals.length).toBe(n);
      for (let i = 0; i < n; i++) expect(vals[i]).toBe((i + 1) * 4);
    });
  }
});

// =============================================================================
// BPlusTree — update existing key
// =============================================================================
describe('BPlusTree update existing key', () => {
  for (let n = 1; n <= 40; n++) {
    it(`BPlusTree update key ${n} in 1..${n}`, () => {
      const t = new BPlusTree<string>();
      for (let i = 1; i <= n; i++) t.insert(i, `orig${i}`);
      t.insert(n, 'updated');
      expect(t.search(n)).toBe('updated');
      expect(t.size).toBe(n);
    });
  }
});

// =============================================================================
// BPlusTree — rangeScan edge cases
// =============================================================================
describe('BPlusTree rangeScan edge cases', () => {
  it('rangeScan empty tree returns []', () => {
    const t = new BPlusTree<number>();
    expect(t.rangeScan(1, 10)).toEqual([]);
  });

  it('rangeScan entire range', () => {
    const t = new BPlusTree<number>();
    for (let i = 1; i <= 20; i++) t.insert(i, i);
    expect(t.rangeScan(1, 20).length).toBe(20);
  });

  it('rangeScan single key', () => {
    const t = new BPlusTree<number>();
    for (let i = 1; i <= 10; i++) t.insert(i, i);
    const res = t.rangeScan(5, 5);
    expect(res).toEqual([5]);
  });

  it('rangeScan outside range returns []', () => {
    const t = new BPlusTree<number>();
    for (let i = 1; i <= 10; i++) t.insert(i, i);
    expect(t.rangeScan(100, 200)).toEqual([]);
  });

  it('rangeScan with deleted keys', () => {
    const t = new BPlusTree<number>();
    for (let i = 1; i <= 10; i++) t.insert(i, i);
    t.delete(5);
    const res = t.rangeScan(3, 7);
    expect(res).not.toContain(5);
    expect(res.length).toBe(4); // 3, 4, 6, 7
  });

  it('rangeScan result values correct', () => {
    const t = new BPlusTree<number>();
    for (let i = 1; i <= 20; i++) t.insert(i, i * 10);
    const res = t.rangeScan(5, 8);
    expect(res).toEqual([50, 60, 70, 80]);
  });
});

// =============================================================================
// BPlusTree — empty tree edge cases
// =============================================================================
describe('BPlusTree empty tree edge cases', () => {
  it('empty: size 0', () => {
    const t = new BPlusTree<number>();
    expect(t.size).toBe(0);
  });
  it('empty: search undefined', () => {
    const t = new BPlusTree<number>();
    expect(t.search(1)).toBeUndefined();
  });
  it('empty: delete returns false', () => {
    const t = new BPlusTree<number>();
    expect(t.delete(1)).toBe(false);
  });
  it('empty: allValues returns []', () => {
    const t = new BPlusTree<number>();
    expect(t.allValues()).toEqual([]);
  });
  it('empty: rangeScan returns []', () => {
    const t = new BPlusTree<number>();
    expect(t.rangeScan(1, 100)).toEqual([]);
  });
});

// =============================================================================
// BPlusTree — large insertions
// =============================================================================
describe('BPlusTree large insertions', () => {
  it('insert 200 keys, all searchable', () => {
    const t = new BPlusTree<number>();
    for (let i = 1; i <= 200; i++) t.insert(i, i * 3);
    expect(t.size).toBe(200);
    for (let i = 1; i <= 200; i++) expect(t.search(i)).toBe(i * 3);
  });

  it('insert 300 keys in reverse, allValues in order', () => {
    const t = new BPlusTree<number>();
    for (let i = 300; i >= 1; i--) t.insert(i, i);
    const vals = t.allValues();
    expect(vals.length).toBe(300);
    for (let i = 0; i < 300; i++) expect(vals[i]).toBe(i + 1);
  });

  it('insert 400 then delete even keys, odd keys remain', () => {
    const t = new BPlusTree<number>();
    for (let i = 1; i <= 400; i++) t.insert(i, i);
    for (let i = 2; i <= 400; i += 2) t.delete(i);
    expect(t.size).toBe(200);
    for (let i = 1; i <= 400; i += 2) expect(t.search(i)).toBe(i);
    for (let i = 2; i <= 400; i += 2) expect(t.search(i)).toBeUndefined();
  });
});

// =============================================================================
// BPlusTree — constructor validation
// =============================================================================
describe('BPlusTree constructor validation', () => {
  it('throws on order < 2', () => {
    expect(() => new BPlusTree(1)).toThrow();
  });
  it('throws on order 0', () => {
    expect(() => new BPlusTree(0)).toThrow();
  });
  it('does not throw on order 2', () => {
    expect(() => new BPlusTree(2)).not.toThrow();
  });
  it('does not throw on order 5', () => {
    expect(() => new BPlusTree(5)).not.toThrow();
  });
});

// =============================================================================
// BPlusTree — various orders (2..7)
// =============================================================================
describe('BPlusTree various orders', () => {
  const orders = [2, 3, 4, 5, 6, 7];
  for (const order of orders) {
    for (let n = 1; n <= 10; n++) {
      it(`BPlusTree order=${order} n=${n}: size and search correct`, () => {
        const t = new BPlusTree<number>(order);
        for (let i = 1; i <= n; i++) t.insert(i, i);
        expect(t.size).toBe(n);
        expect(t.search(n)).toBe(n);
        expect(t.search(0)).toBeUndefined();
      });
    }
  }
});

// =============================================================================
// BTree — delete and reinsert (1..30)
// =============================================================================
describe('BTree delete and reinsert', () => {
  for (let n = 1; n <= 30; n++) {
    it(`BTree delete key ${n} then reinsert, searchable`, () => {
      const t = new BTree<string>();
      for (let i = 1; i <= n; i++) t.insert(i, `v${i}`);
      t.delete(n);
      t.insert(n, 'reinserted');
      expect(t.search(n)).toBe('reinserted');
      expect(t.size).toBe(n);
    });
  }
});

// =============================================================================
// BTree — inorder after deletions (2..20)
// =============================================================================
describe('BTree inorder after deletions', () => {
  for (let n = 2; n <= 21; n++) {
    it(`BTree inorder after removing key 1 from 1..${n}`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      t.delete(1);
      const arr = t.inorder();
      expect(arr.length).toBe(n - 1);
      expect(arr[0].key).toBe(2);
      for (let i = 0; i < arr.length - 1; i++) {
        expect(arr[i].key).toBeLessThan(arr[i + 1].key);
      }
    });
  }
});

// =============================================================================
// BTree — height bounded by log (sizes 10,50,100,200,500)
// =============================================================================
describe('BTree height bounded', () => {
  const sizes = [10, 50, 100, 200, 500];
  for (const n of sizes) {
    it(`BTree height for n=${n} is bounded`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      const h = t.height();
      // B-tree of order t=3 has height <= log_{t-1}(n) + 1 roughly
      expect(h).toBeGreaterThan(0);
      expect(h).toBeLessThanOrEqual(Math.ceil(Math.log2(n + 1)) + 2);
    });
  }
});

// =============================================================================
// BTree — min after deletions (2..30)
// =============================================================================
describe('BTree min after deletions', () => {
  for (let n = 2; n <= 30; n++) {
    it(`BTree min after delete 1 from 1..${n} is 2`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      t.delete(1);
      expect(t.min()!.key).toBe(2);
    });
  }
});

// =============================================================================
// BTree — max after deletions (2..30)
// =============================================================================
describe('BTree max after deletions', () => {
  for (let n = 2; n <= 30; n++) {
    it(`BTree max after delete ${n} from 1..${n} is ${n - 1}`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      t.delete(n);
      expect(t.max()!.key).toBe(n - 1);
    });
  }
});

// =============================================================================
// BTree — alternating insert/delete stress (1..20)
// =============================================================================
describe('BTree alternating insert/delete stress', () => {
  for (let n = 1; n <= 20; n++) {
    it(`BTree alternating ops for n=${n}`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n * 2; i++) t.insert(i, i);
      for (let i = 1; i <= n; i++) t.delete(i);
      expect(t.size).toBe(n);
      for (let i = 1; i <= n; i++) expect(t.search(i)).toBeUndefined();
      for (let i = n + 1; i <= n * 2; i++) expect(t.search(i)).toBe(i);
      expect(t.validate()).toBe(true);
    });
  }
});

// =============================================================================
// BTree — high-order (t=10) insertions (1..20)
// =============================================================================
describe('BTree high order t=10', () => {
  for (let n = 1; n <= 20; n++) {
    it(`BTree t=10, n=${n}: insert and search`, () => {
      const t = new BTree<number>(10);
      for (let i = 1; i <= n; i++) t.insert(i, i * 11);
      expect(t.search(n)).toBe(n * 11);
      expect(t.size).toBe(n);
      expect(t.validate()).toBe(true);
    });
  }
});

// =============================================================================
// BPlusTree — delete first key (2..30)
// =============================================================================
describe('BPlusTree delete first key', () => {
  for (let n = 2; n <= 30; n++) {
    it(`BPlusTree delete key 1 from 1..${n}`, () => {
      const t = new BPlusTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      t.delete(1);
      expect(t.search(1)).toBeUndefined();
      expect(t.size).toBe(n - 1);
    });
  }
});

// =============================================================================
// BPlusTree — delete last key (2..30)
// =============================================================================
describe('BPlusTree delete last key', () => {
  for (let n = 2; n <= 30; n++) {
    it(`BPlusTree delete key ${n} from 1..${n}`, () => {
      const t = new BPlusTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      t.delete(n);
      expect(t.search(n)).toBeUndefined();
      expect(t.size).toBe(n - 1);
    });
  }
});

// =============================================================================
// BPlusTree — rangeScan with holes (1..20)
// =============================================================================
describe('BPlusTree rangeScan with holes', () => {
  for (let n = 5; n <= 24; n++) {
    it(`BPlusTree rangeScan [3,${n}] after deleting 1 and 2`, () => {
      const t = new BPlusTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      t.delete(1);
      t.delete(2);
      const res = t.rangeScan(1, n);
      expect(res.length).toBe(n - 2);
      expect(res[0]).toBe(3);
    });
  }
});

// =============================================================================
// BTree — search all keys individually (tree of 50 keys)
// =============================================================================
describe('BTree search each key individually', () => {
  const N = 50;
  const tree = new BTree<number>();
  for (let i = 1; i <= N; i++) tree.insert(i, i * 100);

  for (let i = 1; i <= N; i++) {
    it(`BTree search key ${i} = ${i * 100}`, () => {
      expect(tree.search(i)).toBe(i * 100);
    });
  }
});

// =============================================================================
// BPlusTree — allValues after partial deletion (1..20)
// =============================================================================
describe('BPlusTree allValues after partial deletion', () => {
  for (let n = 3; n <= 22; n++) {
    it(`BPlusTree allValues: n=${n} after deleting key 2`, () => {
      const t = new BPlusTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      t.delete(2);
      const vals = t.allValues();
      expect(vals.length).toBe(n - 1);
      expect(vals).not.toContain(2);
      expect(vals).toContain(1);
      expect(vals).toContain(n);
    });
  }
});

// =============================================================================
// BTree — size after multiple deletions of same key
// =============================================================================
describe('BTree double delete', () => {
  it('delete same key twice, second returns false', () => {
    const t = new BTree<number>();
    t.insert(1, 100);
    expect(t.delete(1)).toBe(true);
    expect(t.delete(1)).toBe(false);
    expect(t.size).toBe(0);
  });

  it('delete non-inserted key always false', () => {
    const t = new BTree<number>();
    for (let i = 1; i <= 5; i++) t.insert(i, i);
    expect(t.delete(10)).toBe(false);
    expect(t.delete(10)).toBe(false);
  });
});

// =============================================================================
// BTree — validate after high-order split stress
// =============================================================================
describe('BTree validate high-order stress', () => {
  const orders = [2, 3, 4, 5];
  const sizes = [10, 25, 50];
  for (const order of orders) {
    for (const size of sizes) {
      it(`BTree order=${order} size=${size} validate after inserts/deletes`, () => {
        const t = new BTree<number>(order);
        for (let i = 1; i <= size; i++) t.insert(i, i);
        // Delete every 3rd key
        for (let i = 3; i <= size; i += 3) t.delete(i);
        expect(t.validate()).toBe(true);
      });
    }
  }
});

// =============================================================================
// BPlusTree — size tracking
// =============================================================================
describe('BPlusTree size tracking', () => {
  it('size increments on unique inserts', () => {
    const t = new BPlusTree<number>();
    for (let i = 1; i <= 15; i++) {
      t.insert(i, i);
      expect(t.size).toBe(i);
    }
  });

  it('size unchanged on duplicate insert', () => {
    const t = new BPlusTree<number>();
    t.insert(1, 10);
    t.insert(1, 20);
    expect(t.size).toBe(1);
    expect(t.search(1)).toBe(20);
  });

  it('size decrements on delete', () => {
    const t = new BPlusTree<number>();
    for (let i = 1; i <= 10; i++) t.insert(i, i);
    for (let i = 1; i <= 10; i++) {
      t.delete(i);
      expect(t.size).toBe(10 - i);
    }
  });
});

// =============================================================================
// BTree — insert negative keys
// =============================================================================
describe('BTree negative keys', () => {
  it('insert negative keys, inorder sorted', () => {
    const t = new BTree<string>();
    for (let i = -10; i <= 10; i++) t.insert(i, `n${i}`);
    const arr = t.inorder();
    expect(arr.length).toBe(21);
    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i].key).toBeLessThan(arr[i + 1].key);
    }
  });

  it('min is negative', () => {
    const t = new BTree<number>();
    for (let i = -5; i <= 5; i++) t.insert(i, i);
    expect(t.min()!.key).toBe(-5);
  });

  it('rangeSearch across zero', () => {
    const t = new BTree<number>();
    for (let i = -10; i <= 10; i++) t.insert(i, i);
    const res = t.rangeSearch(-3, 3);
    expect(res.length).toBe(7);
    expect(res[0].key).toBe(-3);
    expect(res[6].key).toBe(3);
  });
});

// =============================================================================
// BPlusTree — insert negative keys
// =============================================================================
describe('BPlusTree negative keys', () => {
  it('insert negative keys, allValues sorted', () => {
    const t = new BPlusTree<number>();
    for (let i = -10; i <= 10; i++) t.insert(i, i);
    const vals = t.allValues();
    expect(vals.length).toBe(21);
    for (let i = 0; i < vals.length - 1; i++) {
      expect(vals[i]).toBeLessThan(vals[i + 1]);
    }
  });

  it('rangeScan across zero', () => {
    const t = new BPlusTree<number>();
    for (let i = -10; i <= 10; i++) t.insert(i, i * 2);
    const res = t.rangeScan(-2, 2);
    expect(res.length).toBe(5);
    expect(res[0]).toBe(-4);
    expect(res[4]).toBe(4);
  });
});

// =============================================================================
// BTree — order 2 (2-3 tree) stress
// =============================================================================
describe('BTree order 2 (2-3 tree) stress', () => {
  for (let n = 1; n <= 30; n++) {
    it(`BTree order=2 n=${n}: insert, search, delete`, () => {
      const t = new BTree<number>(2);
      for (let i = 1; i <= n; i++) t.insert(i, i);
      expect(t.search(Math.ceil(n / 2))).toBe(Math.ceil(n / 2));
      if (n > 1) {
        t.delete(1);
        expect(t.search(1)).toBeUndefined();
        expect(t.size).toBe(n - 1);
      }
      expect(t.validate()).toBe(true);
    });
  }
});

// =============================================================================
// Additional BTree rangeSearch boundary tests
// =============================================================================
describe('BTree rangeSearch boundary', () => {
  for (let n = 10; n <= 29; n++) {
    it(`BTree rangeSearch [1,${n}] all keys`, () => {
      const t = new BTree<number>();
      for (let i = 1; i <= n; i++) t.insert(i, i);
      const res = t.rangeSearch(1, n);
      expect(res.length).toBe(n);
    });
  }
});

// =============================================================================
// BPlusTree — rangeScan contiguous (1..20)
// =============================================================================
describe('BPlusTree rangeScan contiguous', () => {
  for (let n = 1; n <= 20; n++) {
    it(`BPlusTree rangeScan [1,${n}] all present`, () => {
      const t = new BPlusTree<number>();
      for (let i = 1; i <= 30; i++) t.insert(i, i);
      const res = t.rangeScan(1, n);
      expect(res.length).toBe(n);
    });
  }
});
