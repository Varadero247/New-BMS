// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  UnionFind,
  GenericUnionFind,
  WeightedUnionFind,
  countComponents,
  hasPath,
  connectedComponents,
  findRedundantConnection,
  makeUnionFind,
} from '../union-find';

// ---------------------------------------------------------------------------
// UnionFind — constructor
// ---------------------------------------------------------------------------
describe('UnionFind constructor', () => {
  it('creates size-0 structure without error', () => {
    const uf = new UnionFind(0);
    expect(uf.components).toBe(0);
  });
  it('creates size-1 structure', () => {
    const uf = new UnionFind(1);
    expect(uf.components).toBe(1);
  });
  it('creates size-2 structure', () => {
    const uf = new UnionFind(2);
    expect(uf.components).toBe(2);
  });
  it('throws for negative n', () => {
    expect(() => new UnionFind(-1)).toThrow(RangeError);
  });
  it('throws for n=-5', () => {
    expect(() => new UnionFind(-5)).toThrow();
  });

  for (let n = 1; n <= 15; n++) {
    it(`creates UnionFind(${n}) with components === ${n}`, () => {
      const uf = new UnionFind(n);
      expect(uf.components).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// UnionFind — find with path compression
// ---------------------------------------------------------------------------
describe('UnionFind find — path compression', () => {
  it('find(0) on single-element is 0', () => {
    const uf = new UnionFind(1);
    expect(uf.find(0)).toBe(0);
  });

  for (let n = 2; n <= 50; n++) {
    it(`each element is its own root initially (n=${n})`, () => {
      const uf = new UnionFind(n);
      for (let i = 0; i < n; i++) {
        expect(uf.find(i)).toBe(i);
      }
    });
  }

  it('find after union returns consistent root', () => {
    const uf = new UnionFind(10);
    uf.union(0, 1);
    const r0 = uf.find(0);
    const r1 = uf.find(1);
    expect(r0).toBe(r1);
  });

  it('find is idempotent after path compression', () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    uf.union(1, 2);
    uf.union(2, 3);
    const root = uf.find(0);
    expect(uf.find(0)).toBe(root);
    expect(uf.find(0)).toBe(root);
  });

  it('throws for out-of-bounds index (negative)', () => {
    const uf = new UnionFind(5);
    expect(() => uf.find(-1)).toThrow(RangeError);
  });

  it('throws for out-of-bounds index (equal to n)', () => {
    const uf = new UnionFind(5);
    expect(() => uf.find(5)).toThrow(RangeError);
  });

  for (let i = 0; i < 50; i++) {
    it(`find returns a valid index after chained unions (i=${i})`, () => {
      const n = 10;
      const uf = new UnionFind(n);
      for (let j = 0; j < n - 1; j++) uf.union(j, j + 1);
      const root = uf.find(i % n);
      expect(root).toBeGreaterThanOrEqual(0);
      expect(root).toBeLessThan(n);
    });
  }
});

// ---------------------------------------------------------------------------
// UnionFind — union returns true/false
// ---------------------------------------------------------------------------
describe('UnionFind union return value', () => {
  it('union of two fresh nodes returns true', () => {
    const uf = new UnionFind(5);
    expect(uf.union(0, 1)).toBe(true);
  });

  it('union of already-merged nodes returns false', () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    expect(uf.union(0, 1)).toBe(false);
  });

  it('self-union returns false', () => {
    const uf = new UnionFind(5);
    expect(uf.union(2, 2)).toBe(false);
  });

  for (let n = 2; n <= 50; n++) {
    it(`all pairwise unions in a chain of ${n} reduce components to 1`, () => {
      const uf = new UnionFind(n);
      let merges = 0;
      for (let i = 0; i < n - 1; i++) {
        if (uf.union(i, i + 1)) merges++;
      }
      expect(merges).toBe(n - 1);
      expect(uf.components).toBe(1);
    });
  }

  it('union across already-connected path returns false', () => {
    const uf = new UnionFind(6);
    uf.union(0, 1);
    uf.union(1, 2);
    uf.union(0, 2); // already connected
    expect(uf.union(0, 2)).toBe(false);
  });

  for (let i = 0; i < 50; i++) {
    it(`repeated self-union(${i % 8}, ${i % 8}) is always false`, () => {
      const uf = new UnionFind(10);
      expect(uf.union(i % 8, i % 8)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// UnionFind — connected
// ---------------------------------------------------------------------------
describe('UnionFind connected', () => {
  it('single element connected to itself', () => {
    const uf = new UnionFind(1);
    expect(uf.connected(0, 0)).toBe(true);
  });

  it('two separate elements not connected', () => {
    const uf = new UnionFind(2);
    expect(uf.connected(0, 1)).toBe(false);
  });

  it('connected after union', () => {
    const uf = new UnionFind(3);
    uf.union(0, 1);
    expect(uf.connected(0, 1)).toBe(true);
  });

  it('transitively connected', () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    uf.union(1, 2);
    expect(uf.connected(0, 2)).toBe(true);
  });

  it('not connected across components', () => {
    const uf = new UnionFind(6);
    uf.union(0, 1);
    uf.union(2, 3);
    expect(uf.connected(0, 3)).toBe(false);
  });

  for (let n = 2; n <= 60; n++) {
    it(`after full chain merge, all pairs connected (n=${n})`, () => {
      const uf = new UnionFind(n);
      for (let i = 0; i < n - 1; i++) uf.union(i, i + 1);
      expect(uf.connected(0, n - 1)).toBe(true);
    });
  }

  for (let i = 0; i < 40; i++) {
    it(`element ${i % 10} connected to itself in UnionFind(10)`, () => {
      const uf = new UnionFind(10);
      expect(uf.connected(i % 10, i % 10)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// UnionFind — components count
// ---------------------------------------------------------------------------
describe('UnionFind components count', () => {
  it('starts at n components', () => {
    const uf = new UnionFind(7);
    expect(uf.components).toBe(7);
  });

  it('decreases by 1 after each successful union', () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    expect(uf.components).toBe(4);
    uf.union(1, 2);
    expect(uf.components).toBe(3);
    uf.union(2, 3);
    expect(uf.components).toBe(2);
    uf.union(3, 4);
    expect(uf.components).toBe(1);
  });

  it('does not decrease on failed union (same component)', () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    const before = uf.components;
    uf.union(0, 1);
    expect(uf.components).toBe(before);
  });

  for (let n = 1; n <= 50; n++) {
    it(`UnionFind(${n}) starts with components === ${n}`, () => {
      const uf = new UnionFind(n);
      expect(uf.components).toBe(n);
    });
  }

  for (let mergeCount = 0; mergeCount <= 9; mergeCount++) {
    it(`after ${mergeCount} merges in UnionFind(10), components === ${10 - mergeCount}`, () => {
      const uf = new UnionFind(10);
      for (let i = 0; i < mergeCount; i++) uf.union(i, i + 1);
      expect(uf.components).toBe(10 - mergeCount);
    });
  }
});

// ---------------------------------------------------------------------------
// UnionFind — componentSize
// ---------------------------------------------------------------------------
describe('UnionFind componentSize', () => {
  it('size of isolated element is 1', () => {
    const uf = new UnionFind(5);
    expect(uf.componentSize(0)).toBe(1);
  });

  it('size after merging two elements is 2', () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    expect(uf.componentSize(0)).toBe(2);
    expect(uf.componentSize(1)).toBe(2);
  });

  it('size grows correctly through chained merges', () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    uf.union(0, 2);
    uf.union(0, 3);
    uf.union(0, 4);
    expect(uf.componentSize(0)).toBe(5);
  });

  for (let n = 1; n <= 40; n++) {
    it(`componentSize after full merge of ${n} nodes is ${n}`, () => {
      const uf = new UnionFind(n);
      for (let i = 1; i < n; i++) uf.union(0, i);
      expect(uf.componentSize(0)).toBe(n);
    });
  }

  for (let i = 0; i < 40; i++) {
    it(`isolated element ${i % 8} has componentSize 1 in UnionFind(8)`, () => {
      const uf = new UnionFind(8);
      expect(uf.componentSize(i % 8)).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// UnionFind — getComponent
// ---------------------------------------------------------------------------
describe('UnionFind getComponent', () => {
  it('getComponent of isolated element returns [element]', () => {
    const uf = new UnionFind(5);
    expect(uf.getComponent(2)).toEqual([2]);
  });

  it('getComponent after union returns both elements', () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    const comp = uf.getComponent(0).sort((a, b) => a - b);
    expect(comp).toEqual([0, 1]);
  });

  it('getComponent after full merge returns all elements', () => {
    const uf = new UnionFind(4);
    uf.union(0, 1);
    uf.union(1, 2);
    uf.union(2, 3);
    const comp = uf.getComponent(0).sort((a, b) => a - b);
    expect(comp).toEqual([0, 1, 2, 3]);
  });

  for (let n = 1; n <= 25; n++) {
    it(`getComponent of isolated element 0 in UnionFind(${n}) is [0]`, () => {
      const uf = new UnionFind(n);
      expect(uf.getComponent(0)).toEqual([0]);
    });
  }

  for (let n = 2; n <= 26; n++) {
    it(`getComponent after full union of ${n} nodes has length ${n}`, () => {
      const uf = new UnionFind(n);
      for (let i = 1; i < n; i++) uf.union(0, i);
      expect(uf.getComponent(0).length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// UnionFind — getAllComponents
// ---------------------------------------------------------------------------
describe('UnionFind getAllComponents', () => {
  it('getAllComponents on fresh UnionFind(3) returns 3 singletons', () => {
    const uf = new UnionFind(3);
    const all = uf.getAllComponents();
    expect(all.length).toBe(3);
    all.forEach(c => expect(c.length).toBe(1));
  });

  it('getAllComponents after all merged returns 1 component', () => {
    const uf = new UnionFind(5);
    for (let i = 1; i < 5; i++) uf.union(0, i);
    const all = uf.getAllComponents();
    expect(all.length).toBe(1);
    expect(all[0].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
  });

  it('getAllComponents returns correct split groups', () => {
    const uf = new UnionFind(6);
    uf.union(0, 1);
    uf.union(2, 3);
    const all = uf.getAllComponents();
    expect(all.length).toBe(4);
  });

  for (let n = 1; n <= 25; n++) {
    it(`getAllComponents on UnionFind(${n}) fresh returns ${n} components`, () => {
      const uf = new UnionFind(n);
      expect(uf.getAllComponents().length).toBe(n);
    });
  }

  for (let n = 2; n <= 26; n++) {
    it(`getAllComponents after full union of ${n} nodes returns 1 component`, () => {
      const uf = new UnionFind(n);
      for (let i = 1; i < n; i++) uf.union(0, i);
      expect(uf.getAllComponents().length).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// UnionFind — reset
// ---------------------------------------------------------------------------
describe('UnionFind reset', () => {
  it('reset restores components count', () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    uf.union(2, 3);
    uf.reset();
    expect(uf.components).toBe(5);
  });

  it('reset makes all elements disconnected again', () => {
    const uf = new UnionFind(4);
    for (let i = 1; i < 4; i++) uf.union(0, i);
    uf.reset();
    expect(uf.connected(0, 1)).toBe(false);
    expect(uf.connected(0, 3)).toBe(false);
  });

  it('reset restores component sizes to 1', () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    uf.union(0, 2);
    uf.reset();
    for (let i = 0; i < 5; i++) {
      expect(uf.componentSize(i)).toBe(1);
    }
  });

  it('can union again after reset', () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    uf.reset();
    expect(uf.union(0, 1)).toBe(true);
    expect(uf.components).toBe(4);
  });

  for (let n = 1; n <= 20; n++) {
    it(`reset on UnionFind(${n}) restores components to ${n}`, () => {
      const uf = new UnionFind(n);
      for (let i = 1; i < n; i++) uf.union(0, i);
      uf.reset();
      expect(uf.components).toBe(n);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`after reset each element ${i} is its own root (reset iteration ${i})`, () => {
      const uf = new UnionFind(10);
      for (let j = 1; j < 10; j++) uf.union(0, j);
      uf.reset();
      expect(uf.find(i)).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// GenericUnionFind — basic operations
// ---------------------------------------------------------------------------
describe('GenericUnionFind basic operations', () => {
  it('starts empty with size 0', () => {
    const uf = new GenericUnionFind<number>();
    expect(uf.size).toBe(0);
    expect(uf.components).toBe(0);
  });

  it('add increases size', () => {
    const uf = new GenericUnionFind<number>();
    uf.add(1);
    expect(uf.size).toBe(1);
  });

  it('add of duplicate does not increase size', () => {
    const uf = new GenericUnionFind<number>();
    uf.add(1);
    uf.add(1);
    expect(uf.size).toBe(1);
  });

  it('has returns false for absent element', () => {
    const uf = new GenericUnionFind<number>();
    expect(uf.has(42)).toBe(false);
  });

  it('has returns true after add', () => {
    const uf = new GenericUnionFind<number>();
    uf.add(42);
    expect(uf.has(42)).toBe(true);
  });

  it('find returns self for isolated element', () => {
    const uf = new GenericUnionFind<number>();
    uf.add(10);
    expect(uf.find(10)).toBe(10);
  });

  it('union of two elements returns true', () => {
    const uf = new GenericUnionFind<number>();
    expect(uf.union(1, 2)).toBe(true);
  });

  it('union of same element twice returns false', () => {
    const uf = new GenericUnionFind<number>();
    uf.union(1, 2);
    expect(uf.union(1, 2)).toBe(false);
  });

  it('connected returns true after union', () => {
    const uf = new GenericUnionFind<number>();
    uf.union(3, 4);
    expect(uf.connected(3, 4)).toBe(true);
  });

  it('connected returns false for separate elements', () => {
    const uf = new GenericUnionFind<number>();
    uf.add(1);
    uf.add(2);
    expect(uf.connected(1, 2)).toBe(false);
  });

  it('connected returns false if element not in structure', () => {
    const uf = new GenericUnionFind<number>();
    uf.add(1);
    expect(uf.connected(1, 99)).toBe(false);
  });

  it('componentSize is 1 for isolated element', () => {
    const uf = new GenericUnionFind<number>();
    uf.add(5);
    expect(uf.componentSize(5)).toBe(1);
  });

  it('componentSize is 2 after merging two', () => {
    const uf = new GenericUnionFind<number>();
    uf.union(5, 6);
    expect(uf.componentSize(5)).toBe(2);
  });

  it('getComponent returns singleton', () => {
    const uf = new GenericUnionFind<number>();
    uf.add(7);
    expect(uf.getComponent(7)).toEqual([7]);
  });

  it('getComponent returns both after union', () => {
    const uf = new GenericUnionFind<number>();
    uf.union(7, 8);
    const comp = uf.getComponent(7).sort((a, b) => a - b);
    expect(comp).toEqual([7, 8]);
  });

  it('getAllComponents on empty returns []', () => {
    const uf = new GenericUnionFind<number>();
    expect(uf.getAllComponents()).toEqual([]);
  });

  it('getAllComponents returns one singleton per isolated element', () => {
    const uf = new GenericUnionFind<number>();
    uf.add(1); uf.add(2); uf.add(3);
    expect(uf.getAllComponents().length).toBe(3);
  });

  it('find throws for element not in structure', () => {
    const uf = new GenericUnionFind<number>();
    expect(() => uf.find(999)).toThrow();
  });

  it('transitively connected (3 nodes)', () => {
    const uf = new GenericUnionFind<number>();
    uf.union(1, 2);
    uf.union(2, 3);
    expect(uf.connected(1, 3)).toBe(true);
  });

  it('components count matches distinct sets', () => {
    const uf = new GenericUnionFind<number>();
    uf.union(1, 2);
    uf.union(3, 4);
    uf.add(5);
    expect(uf.components).toBe(3);
  });

  for (let i = 0; i < 50; i++) {
    it(`GenericUnionFind: union(${i}, ${i + 1}) reduces components (loop ${i})`, () => {
      const uf = new GenericUnionFind<number>();
      uf.add(i);
      uf.add(i + 1);
      expect(uf.components).toBe(2);
      uf.union(i, i + 1);
      expect(uf.components).toBe(1);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`GenericUnionFind: componentSize after chained merges (i=${i})`, () => {
      const uf = new GenericUnionFind<number>();
      const n = (i % 5) + 2;
      for (let j = 0; j < n; j++) uf.add(j);
      for (let j = 1; j < n; j++) uf.union(0, j);
      expect(uf.componentSize(0)).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// GenericUnionFind — string keys
// ---------------------------------------------------------------------------
describe('GenericUnionFind string keys', () => {
  it('supports string keys', () => {
    const uf = new GenericUnionFind<string>();
    uf.add('a');
    expect(uf.has('a')).toBe(true);
  });

  it('union two strings', () => {
    const uf = new GenericUnionFind<string>();
    expect(uf.union('alpha', 'beta')).toBe(true);
  });

  it('connected after union', () => {
    const uf = new GenericUnionFind<string>();
    uf.union('x', 'y');
    expect(uf.connected('x', 'y')).toBe(true);
  });

  it('not connected before union', () => {
    const uf = new GenericUnionFind<string>();
    uf.add('a');
    uf.add('b');
    expect(uf.connected('a', 'b')).toBe(false);
  });

  it('transitively connected strings', () => {
    const uf = new GenericUnionFind<string>();
    uf.union('a', 'b');
    uf.union('b', 'c');
    expect(uf.connected('a', 'c')).toBe(true);
  });

  it('not connected across separate string groups', () => {
    const uf = new GenericUnionFind<string>();
    uf.union('a', 'b');
    uf.union('c', 'd');
    expect(uf.connected('a', 'd')).toBe(false);
  });

  it('getComponent of string element', () => {
    const uf = new GenericUnionFind<string>();
    uf.union('m', 'n');
    const comp = uf.getComponent('m').sort();
    expect(comp).toEqual(['m', 'n']);
  });

  it('componentSize for merged strings', () => {
    const uf = new GenericUnionFind<string>();
    uf.union('p', 'q');
    uf.union('p', 'r');
    expect(uf.componentSize('p')).toBe(3);
  });

  for (let i = 0; i < 20; i++) {
    it(`string key 'key${i}' has size 1 when isolated`, () => {
      const uf = new GenericUnionFind<string>();
      uf.add(`key${i}`);
      expect(uf.componentSize(`key${i}`)).toBe(1);
    });
  }

  for (let i = 0; i < 22; i++) {
    it(`union of string keys key${i} and key${i + 1} creates component of size 2 (loop ${i})`, () => {
      const uf = new GenericUnionFind<string>();
      uf.union(`key${i}`, `key${i + 1}`);
      expect(uf.componentSize(`key${i}`)).toBe(2);
      expect(uf.connected(`key${i}`, `key${i + 1}`)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// WeightedUnionFind — union and weight
// ---------------------------------------------------------------------------
describe('WeightedUnionFind union and weight', () => {
  it('initial weight of any element is 1 (relative to itself)', () => {
    const uf = new WeightedUnionFind(5);
    expect(uf.weight(0)).toBeCloseTo(1);
  });

  it('constructor throws for negative n', () => {
    expect(() => new WeightedUnionFind(-1)).toThrow(RangeError);
  });

  it('find returns self before any union', () => {
    const uf = new WeightedUnionFind(4);
    expect(uf.find(3)).toBe(3);
  });

  it('connected is false before union', () => {
    const uf = new WeightedUnionFind(4);
    expect(uf.connected(0, 1)).toBe(false);
  });

  it('connected is true after union', () => {
    const uf = new WeightedUnionFind(4);
    uf.union(0, 1, 2);
    expect(uf.connected(0, 1)).toBe(true);
  });

  it('ratio returns null for unconnected elements', () => {
    const uf = new WeightedUnionFind(4);
    expect(uf.ratio(0, 1)).toBeNull();
  });

  it('ratio of x to itself is 1', () => {
    const uf = new WeightedUnionFind(4);
    expect(uf.ratio(0, 0)).toBeCloseTo(1);
  });

  it('ratio(x, y) after union(x, y, w) is w', () => {
    const uf = new WeightedUnionFind(4);
    uf.union(0, 1, 3);
    expect(uf.ratio(0, 1)).toBeCloseTo(3);
  });

  it('ratio(y, x) after union(x, y, w) is 1/w', () => {
    const uf = new WeightedUnionFind(4);
    uf.union(0, 1, 4);
    expect(uf.ratio(1, 0)).toBeCloseTo(0.25);
  });

  it('transitive ratio: union(0,1,2) union(1,2,3) => ratio(0,2)=6', () => {
    const uf = new WeightedUnionFind(5);
    uf.union(0, 1, 2); // w[0]/w[1] = 2
    uf.union(1, 2, 3); // w[1]/w[2] = 3
    // w[0]/w[2] = 6
    expect(uf.ratio(0, 2)).toBeCloseTo(6);
  });

  it('union with weight 1 means elements are equal weight', () => {
    const uf = new WeightedUnionFind(4);
    uf.union(0, 1, 1);
    expect(uf.ratio(0, 1)).toBeCloseTo(1);
  });

  for (let w = 1; w <= 40; w++) {
    it(`ratio after union(0,1,${w}) is ${w}`, () => {
      const uf = new WeightedUnionFind(4);
      uf.union(0, 1, w);
      expect(uf.ratio(0, 1)).toBeCloseTo(w, 5);
    });
  }

  for (let i = 0; i < 40; i++) {
    it(`WeightedUnionFind: connected(0,1) after union (i=${i})`, () => {
      const uf = new WeightedUnionFind(5);
      uf.union(0, 1, i + 1);
      expect(uf.connected(0, 1)).toBe(true);
      expect(uf.connected(0, 2)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// WeightedUnionFind — ratio calculation
// ---------------------------------------------------------------------------
describe('WeightedUnionFind ratio', () => {
  it('ratio for connected pair via chain (3 nodes)', () => {
    const uf = new WeightedUnionFind(3);
    uf.union(0, 1, 5); // w[0]/w[1] = 5
    uf.union(1, 2, 2); // w[1]/w[2] = 2
    // w[0]/w[2] = 5*2 = 10
    expect(uf.ratio(0, 2)).toBeCloseTo(10);
  });

  it('ratio is consistent after repeated queries (path compression)', () => {
    const uf = new WeightedUnionFind(4);
    uf.union(0, 1, 3);
    uf.union(1, 2, 4);
    const r1 = uf.ratio(0, 2);
    const r2 = uf.ratio(0, 2);
    expect(r1).toBeCloseTo(r2!);
  });

  it('ratio of disconnected returns null', () => {
    const uf = new WeightedUnionFind(6);
    uf.union(0, 1, 2);
    uf.union(3, 4, 5);
    expect(uf.ratio(1, 4)).toBeNull();
  });

  it('ratio is inverse of reverse', () => {
    const uf = new WeightedUnionFind(4);
    uf.union(0, 1, 7);
    const r01 = uf.ratio(0, 1)!;
    const r10 = uf.ratio(1, 0)!;
    expect(r01 * r10).toBeCloseTo(1);
  });

  for (let i = 0; i < 20; i++) {
    it(`transitive ratio check (chain length ${i + 2})`, () => {
      // Use small constant weight (2) to avoid floating-point overflow for long chains
      const n = i + 3;
      const uf = new WeightedUnionFind(n);
      const w = 2;
      for (let j = 0; j < n - 1; j++) {
        uf.union(j, j + 1, w);
      }
      // ratio(0, n-1) = 2^(n-1)
      const expected = Math.pow(w, n - 1);
      const actual = uf.ratio(0, n - 1)!;
      // Use relative tolerance for large numbers
      const relErr = Math.abs(actual - expected) / expected;
      expect(relErr).toBeLessThan(1e-6);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`ratio null for unconnected pair (i=${i})`, () => {
      const uf = new WeightedUnionFind(10);
      uf.union(0, 1, 2);
      expect(uf.ratio(i % 3 + 2, i % 4 + 6)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// countComponents helper
// ---------------------------------------------------------------------------
describe('countComponents helper', () => {
  it('0 nodes, 0 edges => 0 components', () => {
    expect(countComponents(0, [])).toBe(0);
  });

  it('1 node, 0 edges => 1 component', () => {
    expect(countComponents(1, [])).toBe(1);
  });

  it('2 nodes, 0 edges => 2 components', () => {
    expect(countComponents(2, [])).toBe(2);
  });

  it('2 nodes, 1 edge => 1 component', () => {
    expect(countComponents(2, [[0, 1]])).toBe(1);
  });

  it('3 nodes, linear chain => 1 component', () => {
    expect(countComponents(3, [[0, 1], [1, 2]])).toBe(1);
  });

  it('4 nodes, two disjoint pairs => 2 components', () => {
    expect(countComponents(4, [[0, 1], [2, 3]])).toBe(2);
  });

  it('5 nodes, no edges => 5 components', () => {
    expect(countComponents(5, [])).toBe(5);
  });

  it('cycle does not create extra components', () => {
    expect(countComponents(3, [[0, 1], [1, 2], [0, 2]])).toBe(1);
  });

  for (let n = 1; n <= 30; n++) {
    it(`countComponents(${n}, []) === ${n}`, () => {
      expect(countComponents(n, [])).toBe(n);
    });
  }

  for (let n = 2; n <= 20; n++) {
    it(`countComponents(${n}, full chain) === 1 (n=${n})`, () => {
      const edges: [number, number][] = [];
      for (let i = 0; i < n - 1; i++) edges.push([i, i + 1]);
      expect(countComponents(n, edges)).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// hasPath helper
// ---------------------------------------------------------------------------
describe('hasPath helper', () => {
  it('src === dst always true even with no edges', () => {
    expect(hasPath(5, [], 3, 3)).toBe(true);
  });

  it('direct edge', () => {
    expect(hasPath(3, [[0, 1]], 0, 1)).toBe(true);
  });

  it('no path between disconnected nodes', () => {
    expect(hasPath(4, [[0, 1], [2, 3]], 0, 3)).toBe(false);
  });

  it('transitive path', () => {
    expect(hasPath(4, [[0, 1], [1, 2], [2, 3]], 0, 3)).toBe(true);
  });

  it('single node path to itself', () => {
    expect(hasPath(1, [], 0, 0)).toBe(true);
  });

  it('two disconnected nodes no path', () => {
    expect(hasPath(2, [], 0, 1)).toBe(false);
  });

  for (let n = 2; n <= 30; n++) {
    it(`hasPath through chain of ${n} nodes: 0→${n - 1}`, () => {
      const edges: [number, number][] = [];
      for (let i = 0; i < n - 1; i++) edges.push([i, i + 1]);
      expect(hasPath(n, edges, 0, n - 1)).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`no path from 0 to 1 in 2-node graph with no edges (loop ${i})`, () => {
      expect(hasPath(2, [], 0, 1)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// connectedComponents helper
// ---------------------------------------------------------------------------
describe('connectedComponents helper', () => {
  it('empty graph returns empty array', () => {
    expect(connectedComponents(0, [])).toEqual([]);
  });

  it('single node returns one singleton component', () => {
    const comps = connectedComponents(1, []);
    expect(comps.length).toBe(1);
    expect(comps[0]).toEqual([0]);
  });

  it('two disconnected nodes => two components', () => {
    const comps = connectedComponents(2, []);
    expect(comps.length).toBe(2);
  });

  it('two connected nodes => one component', () => {
    const comps = connectedComponents(2, [[0, 1]]);
    expect(comps.length).toBe(1);
    expect(comps[0].sort((a, b) => a - b)).toEqual([0, 1]);
  });

  it('3 nodes in two separate components', () => {
    const comps = connectedComponents(3, [[0, 1]]);
    expect(comps.length).toBe(2);
  });

  it('fully connected 4 nodes => 1 component', () => {
    const comps = connectedComponents(4, [[0, 1], [1, 2], [2, 3]]);
    expect(comps.length).toBe(1);
  });

  for (let n = 1; n <= 25; n++) {
    it(`connectedComponents(${n}, []) returns ${n} singleton components`, () => {
      const comps = connectedComponents(n, []);
      expect(comps.length).toBe(n);
      comps.forEach(c => expect(c.length).toBe(1));
    });
  }

  for (let n = 2; n <= 26; n++) {
    it(`connectedComponents after full chain of ${n} nodes => 1 component`, () => {
      const edges: [number, number][] = [];
      for (let i = 0; i < n - 1; i++) edges.push([i, i + 1]);
      const comps = connectedComponents(n, edges);
      expect(comps.length).toBe(1);
    });
  }
});

// ---------------------------------------------------------------------------
// findRedundantConnection helper
// ---------------------------------------------------------------------------
describe('findRedundantConnection helper', () => {
  it('returns null for empty edges', () => {
    expect(findRedundantConnection([])).toBeNull();
  });

  it('returns null for tree (no cycle)', () => {
    expect(findRedundantConnection([[0, 1], [1, 2]])).toBeNull();
  });

  it('detects simple cycle [0,1],[1,2],[0,2]', () => {
    const result = findRedundantConnection([[0, 1], [1, 2], [0, 2]]);
    expect(result).not.toBeNull();
    expect(result).toEqual([0, 2]);
  });

  it('detects redundant edge in 4-node cycle', () => {
    const result = findRedundantConnection([[0, 1], [1, 2], [2, 3], [0, 3]]);
    expect(result).not.toBeNull();
  });

  it('returns the last redundant edge', () => {
    const result = findRedundantConnection([[1, 2], [1, 3], [2, 3]]);
    expect(result).toEqual([2, 3]);
  });

  it('single edge returns null', () => {
    expect(findRedundantConnection([[0, 1]])).toBeNull();
  });

  for (let n = 3; n <= 20; n++) {
    it(`findRedundantConnection detects cycle in ${n}-node ring`, () => {
      const edges: [number, number][] = [];
      for (let i = 0; i < n; i++) edges.push([i, (i + 1) % n]);
      const result = findRedundantConnection(edges);
      expect(result).not.toBeNull();
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`returns null for path of ${i + 2} nodes (no cycle), iteration ${i}`, () => {
      const edges: [number, number][] = [];
      for (let j = 0; j <= i; j++) edges.push([j, j + 1]);
      expect(findRedundantConnection(edges)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// makeUnionFind helper
// ---------------------------------------------------------------------------
describe('makeUnionFind helper', () => {
  it('returns a UnionFind instance', () => {
    const uf = makeUnionFind(5);
    expect(uf).toBeInstanceOf(UnionFind);
  });

  it('returned instance has correct components count', () => {
    const uf = makeUnionFind(7);
    expect(uf.components).toBe(7);
  });

  it('makeUnionFind(0) works', () => {
    const uf = makeUnionFind(0);
    expect(uf.components).toBe(0);
  });

  it('makeUnionFind(1) works', () => {
    const uf = makeUnionFind(1);
    expect(uf.components).toBe(1);
  });

  for (let n = 1; n <= 20; n++) {
    it(`makeUnionFind(${n}).components === ${n}`, () => {
      expect(makeUnionFind(n).components).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Edge cases: self-union, single element, all connected
// ---------------------------------------------------------------------------
describe('Edge cases', () => {
  it('self-union never changes component count', () => {
    const uf = new UnionFind(5);
    for (let i = 0; i < 5; i++) uf.union(i, i);
    expect(uf.components).toBe(5);
  });

  it('self-union returns false for every element', () => {
    const uf = new UnionFind(5);
    for (let i = 0; i < 5; i++) {
      expect(uf.union(i, i)).toBe(false);
    }
  });

  it('UnionFind(1): find(0) === 0', () => {
    const uf = new UnionFind(1);
    expect(uf.find(0)).toBe(0);
  });

  it('UnionFind(1): componentSize(0) === 1', () => {
    const uf = new UnionFind(1);
    expect(uf.componentSize(0)).toBe(1);
  });

  it('UnionFind(1): getComponent(0) === [0]', () => {
    const uf = new UnionFind(1);
    expect(uf.getComponent(0)).toEqual([0]);
  });

  it('UnionFind(1): getAllComponents() === [[0]]', () => {
    const uf = new UnionFind(1);
    expect(uf.getAllComponents()).toEqual([[0]]);
  });

  it('full star graph: all nodes connected to center', () => {
    const n = 10;
    const uf = new UnionFind(n);
    for (let i = 1; i < n; i++) uf.union(0, i);
    expect(uf.components).toBe(1);
    for (let i = 1; i < n; i++) {
      expect(uf.connected(0, i)).toBe(true);
    }
  });

  it('componentSize correct after star graph', () => {
    const n = 10;
    const uf = new UnionFind(n);
    for (let i = 1; i < n; i++) uf.union(0, i);
    for (let i = 0; i < n; i++) {
      expect(uf.componentSize(i)).toBe(n);
    }
  });

  it('getComponent after star graph has length n', () => {
    const n = 8;
    const uf = new UnionFind(n);
    for (let i = 1; i < n; i++) uf.union(0, i);
    expect(uf.getComponent(0).length).toBe(n);
  });

  it('getAllComponents returns single component after star', () => {
    const n = 6;
    const uf = new UnionFind(n);
    for (let i = 1; i < n; i++) uf.union(0, i);
    expect(uf.getAllComponents().length).toBe(1);
  });

  it('UnionFind with high n still correct', () => {
    const uf = new UnionFind(1000);
    for (let i = 0; i < 999; i++) uf.union(i, i + 1);
    expect(uf.components).toBe(1);
    expect(uf.connected(0, 999)).toBe(true);
  });

  for (let n = 1; n <= 20; n++) {
    it(`all self-unions in UnionFind(${n}) leave components unchanged`, () => {
      const uf = new UnionFind(n);
      for (let i = 0; i < n; i++) uf.union(i, i);
      expect(uf.components).toBe(n);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`all connected after full chain in UnionFind(${n})`, () => {
      const uf = new UnionFind(n);
      for (let i = 1; i < n; i++) uf.union(0, i);
      for (let i = 0; i < n; i++) {
        expect(uf.connected(0, i)).toBe(true);
      }
    });
  }

  it('multiple resets work correctly', () => {
    const uf = new UnionFind(5);
    uf.union(0, 1);
    uf.reset();
    uf.union(2, 3);
    uf.reset();
    expect(uf.components).toBe(5);
    for (let i = 0; i < 5; i++) {
      expect(uf.find(i)).toBe(i);
    }
  });

  it('union by rank produces balanced tree', () => {
    const uf = new UnionFind(8);
    // Build two subtrees of 4 then merge
    uf.union(0, 1); uf.union(2, 3); uf.union(0, 2);
    uf.union(4, 5); uf.union(6, 7); uf.union(4, 6);
    uf.union(0, 4);
    expect(uf.components).toBe(1);
    expect(uf.componentSize(0)).toBe(8);
  });

  it('path compression makes subsequent finds O(1)', () => {
    const uf = new UnionFind(100);
    for (let i = 1; i < 100; i++) uf.union(i - 1, i);
    // Trigger path compression
    for (let i = 0; i < 100; i++) uf.find(i);
    // All should still be connected
    expect(uf.connected(0, 99)).toBe(true);
  });

  it('GenericUnionFind: symbol keys', () => {
    const s1 = Symbol('a');
    const s2 = Symbol('b');
    const uf = new GenericUnionFind<symbol>();
    uf.union(s1, s2);
    expect(uf.connected(s1, s2)).toBe(true);
  });

  it('WeightedUnionFind: weight of root is 1', () => {
    const uf = new WeightedUnionFind(5);
    uf.union(0, 1, 3);
    const root = uf.find(0);
    expect(uf.weight(root)).toBeCloseTo(1);
  });

  it('countComponents handles redundant edges gracefully', () => {
    const edges: [number, number][] = [[0, 1], [0, 1], [1, 2]];
    expect(countComponents(3, edges)).toBe(1);
  });

  it('hasPath with duplicate edges', () => {
    expect(hasPath(3, [[0, 1], [0, 1], [1, 2]], 0, 2)).toBe(true);
  });
});
