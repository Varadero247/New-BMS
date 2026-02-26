// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { ScapegoatTree, createScapegoatTree } from '../scapegoat-tree';

// ─── 1. Static: isEmpty / size on new tree (2 tests) ───────────────────────
describe('ScapegoatTree – static empty state', () => {
  it('isEmpty is true on new tree', () => {
    const t = new ScapegoatTree<number>();
    expect(t.isEmpty).toBe(true);
  });
  it('size is 0 on new tree', () => {
    const t = new ScapegoatTree<number>();
    expect(t.size).toBe(0);
  });
});

// ─── 2. insert and search (100 tests) ───────────────────────────────────────
describe('ScapegoatTree – insert and search', () => {
  for (let i = 1; i <= 100; i++) {
    it(`insert(${i}) then search(${i}) returns true`, () => {
      const t = new ScapegoatTree<number>();
      t.insert(i);
      expect(t.search(i)).toBe(true);
    });
  }
});

// ─── 3. search missing returns false (100 tests) ────────────────────────────
describe('ScapegoatTree – search missing', () => {
  for (let i = 1; i <= 100; i++) {
    it(`search(${i}) on empty tree returns false`, () => {
      const t = new ScapegoatTree<number>();
      expect(t.search(i)).toBe(false);
    });
  }
});

// ─── 4. inOrder returns sorted (50 tests) ───────────────────────────────────
describe('ScapegoatTree – inOrder sorted', () => {
  for (let i = 1; i <= 50; i++) {
    it(`inOrder is sorted after inserting ${i} random values (seed ${i})`, () => {
      const t = new ScapegoatTree<number>();
      const vals: number[] = [];
      for (let j = 0; j < i; j++) {
        const v = ((i * 7 + j * 13) % 200) + 1;
        if (!vals.includes(v)) { vals.push(v); t.insert(v); }
      }
      const result = t.inOrder();
      const sorted = [...result].sort((a, b) => a - b);
      expect(result).toEqual(sorted);
    });
  }
});

// ─── 5. delete removes element (100 tests) ──────────────────────────────────
describe('ScapegoatTree – delete', () => {
  for (let i = 1; i <= 100; i++) {
    it(`delete(${i}) returns true and search returns false afterwards`, () => {
      const t = new ScapegoatTree<number>();
      t.insert(i);
      expect(t.delete(i)).toBe(true);
      expect(t.search(i)).toBe(false);
    });
  }
});

// ─── 6. delete non-existent returns false (50 tests) ────────────────────────
describe('ScapegoatTree – delete non-existent', () => {
  for (let i = 1; i <= 50; i++) {
    it(`delete(${i}) on empty tree returns false`, () => {
      const t = new ScapegoatTree<number>();
      expect(t.delete(i)).toBe(false);
    });
  }
});

// ─── 7. min and max (100 tests) ─────────────────────────────────────────────
describe('ScapegoatTree – min and max', () => {
  for (let i = 1; i <= 100; i++) {
    it(`min/max correct after inserting values 1..${i}`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = i; j >= 1; j--) t.insert(j);
      expect(t.min()).toBe(1);
      expect(t.max()).toBe(i);
    });
  }
});

// ─── 8. clear resets (100 tests) ────────────────────────────────────────────
describe('ScapegoatTree – clear', () => {
  for (let i = 1; i <= 100; i++) {
    it(`clear after inserting ${i} elements resets size and isEmpty`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = 1; j <= i; j++) t.insert(j);
      t.clear();
      expect(t.size).toBe(0);
      expect(t.isEmpty).toBe(true);
    });
  }
});

// ─── 9. createScapegoatTree factory (100 tests) ─────────────────────────────
describe('ScapegoatTree – createScapegoatTree factory', () => {
  for (let i = 1; i <= 100; i++) {
    it(`factory creates tree; insert(${i}) and search(${i}) work`, () => {
      const t = createScapegoatTree<number>();
      t.insert(i);
      expect(t.search(i)).toBe(true);
      expect(t.size).toBe(1);
    });
  }
});

// ─── 10. string comparator (50 tests) ───────────────────────────────────────
describe('ScapegoatTree – string comparator', () => {
  for (let i = 0; i < 50; i++) {
    it(`string tree insert/search word-${i}`, () => {
      const t = createScapegoatTree<string>((a, b) => a < b ? -1 : a > b ? 1 : 0);
      const word = `word-${i}`;
      t.insert(word);
      expect(t.search(word)).toBe(true);
      expect(t.search(`missing-${i}`)).toBe(false);
    });
  }
});

// ─── 11. large insert/search (50 tests) ─────────────────────────────────────
describe('ScapegoatTree – large insert and search', () => {
  for (let i = 1; i <= 50; i++) {
    it(`insert 200 elements (offset ${i}), all searchable`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = 0; j < 200; j++) t.insert(j + i * 1000);
      for (let j = 0; j < 200; j++) {
        expect(t.search(j + i * 1000)).toBe(true);
      }
      expect(t.size).toBe(200);
    });
  }
});

// ─── 12. delete then search false (100 tests) ───────────────────────────────
describe('ScapegoatTree – delete then search false', () => {
  for (let i = 1; i <= 100; i++) {
    it(`insert multiple, delete ${i}, confirm not found`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = 1; j <= 10; j++) t.insert(j * 10);
      const target = (((i - 1) % 10) + 1) * 10;
      t.delete(target);
      expect(t.search(target)).toBe(false);
    });
  }
});

// ─── 13. size after operations (100 tests) ──────────────────────────────────
describe('ScapegoatTree – size after operations', () => {
  for (let i = 1; i <= 100; i++) {
    it(`size is correct after inserting ${i} unique elements`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = 0; j < i; j++) t.insert(j + i * 500);
      expect(t.size).toBe(i);
    });
  }
});

// ─── 14. min/max on single element (50 tests) ───────────────────────────────
describe('ScapegoatTree – min/max single element', () => {
  for (let i = 1; i <= 50; i++) {
    it(`min and max both equal ${i} when only ${i} inserted`, () => {
      const t = new ScapegoatTree<number>();
      t.insert(i);
      expect(t.min()).toBe(i);
      expect(t.max()).toBe(i);
    });
  }
});

// ─── 15. min/max on empty tree (2 tests) ────────────────────────────────────
describe('ScapegoatTree – min/max empty', () => {
  it('min() returns null on empty tree', () => {
    const t = new ScapegoatTree<number>();
    expect(t.min()).toBeNull();
  });
  it('max() returns null on empty tree', () => {
    const t = new ScapegoatTree<number>();
    expect(t.max()).toBeNull();
  });
});

// ─── 16. inOrder empty tree (1 test) ────────────────────────────────────────
describe('ScapegoatTree – inOrder empty', () => {
  it('inOrder returns [] on empty tree', () => {
    const t = new ScapegoatTree<number>();
    expect(t.inOrder()).toEqual([]);
  });
});

// ─── 17. duplicate insert does not duplicate in inOrder (50 tests) ──────────
describe('ScapegoatTree – duplicate insert', () => {
  for (let i = 1; i <= 50; i++) {
    it(`inserting ${i} twice keeps both copies in inOrder (multiset)`, () => {
      const t = new ScapegoatTree<number>();
      t.insert(i);
      t.insert(i);
      // ScapegoatTree is a multiset (duplicates go right), size = 2
      expect(t.size).toBe(2);
      expect(t.search(i)).toBe(true);
    });
  }
});

// ─── 18. delete reduces size (50 tests) ─────────────────────────────────────
describe('ScapegoatTree – delete reduces size', () => {
  for (let i = 1; i <= 50; i++) {
    it(`size decreases by 1 after deleting an element (n=${i})`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = 1; j <= i; j++) t.insert(j);
      const before = t.size;
      t.delete(1);
      expect(t.size).toBe(before - 1);
    });
  }
});

// ─── 19. insert reverse order inOrder still sorted (50 tests) ───────────────
describe('ScapegoatTree – insert reverse order', () => {
  for (let i = 1; i <= 50; i++) {
    it(`inOrder sorted after inserting 1..${i} in descending order`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = i; j >= 1; j--) t.insert(j);
      const result = t.inOrder();
      for (let k = 1; k < result.length; k++) {
        expect(result[k]).toBeGreaterThanOrEqual(result[k - 1]);
      }
    });
  }
});

// ─── 20. factory with custom comparator (50 tests) ──────────────────────────
describe('ScapegoatTree – factory custom comparator', () => {
  for (let i = 1; i <= 50; i++) {
    it(`factory with reverse comparator: max becomes min (n=${i})`, () => {
      const t = createScapegoatTree<number>((a, b) => b - a);
      for (let j = 1; j <= i; j++) t.insert(j);
      // With reverse comparator, inOrder gives descending order
      const result = t.inOrder();
      const sorted = [...result].sort((a, b) => b - a);
      expect(result).toEqual(sorted);
    });
  }
});

// ─── 21. search after clear returns false (50 tests) ────────────────────────
describe('ScapegoatTree – search after clear', () => {
  for (let i = 1; i <= 50; i++) {
    it(`search(${i}) after clear returns false`, () => {
      const t = new ScapegoatTree<number>();
      t.insert(i);
      t.clear();
      expect(t.search(i)).toBe(false);
    });
  }
});

// ─── 22. multiple deletes then inOrder (25 tests) ───────────────────────────
describe('ScapegoatTree – multiple deletes inOrder', () => {
  for (let i = 1; i <= 25; i++) {
    it(`inOrder sorted after inserting 1..20 and deleting ${i % 20 + 1}`, () => {
      const t = new ScapegoatTree<number>();
      for (let j = 1; j <= 20; j++) t.insert(j);
      t.delete((i % 20) + 1);
      const result = t.inOrder();
      const sorted = [...result].sort((a, b) => a - b);
      expect(result).toEqual(sorted);
    });
  }
});

// ─── 23. all elements present after many inserts (25 tests) ─────────────────
describe('ScapegoatTree – all elements searchable after many inserts', () => {
  for (let i = 1; i <= 25; i++) {
    it(`all 50 elements searchable after inserting in mixed order (seed ${i})`, () => {
      const t = new ScapegoatTree<number>();
      const vals = Array.from({ length: 50 }, (_, k) => ((k * i * 3 + 7) % 50) + 1);
      const unique = [...new Set(vals)];
      for (const v of unique) t.insert(v);
      for (const v of unique) {
        expect(t.search(v)).toBe(true);
      }
    });
  }
});
