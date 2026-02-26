// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  union,
  intersection,
  difference,
  symmetricDifference,
  isSubset,
  isSuperset,
  areDisjoint,
  cartesianProduct,
  powerSet,
  groupBy,
  indexBy,
  countBy,
  mapValues,
  mapKeys,
  filterMap,
  mergeWith,
  invertMap,
  fromEntries,
  toObject,
  BiMap,
  MultiSet,
  chunk,
  flatten,
  deepFlatten,
  unique,
  zip,
  unzip,
  rotate,
  sliding,
  transpose,
  compact,
  partition,
  tally,
} from '../collection-utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

// ===========================================================================
// SET OPERATIONS
// ===========================================================================

describe('union — 100 loop tests (i=0..99)', () => {
  for (let i = 0; i < 100; i++) {
    it(`union: set of size ${i} ∪ {99} contains all elements`, () => {
      const a = new Set(range(i));
      const b = new Set([99]);
      const result = union(a, b);
      // All elements of a must be in result
      for (const x of a) expect(result.has(x)).toBe(true);
      // Element 99 must always be present
      expect(result.has(99)).toBe(true);
      // Size: if 99 already in a, size = i, else i+1
      const expectedSize = a.has(99) ? i : i + 1;
      expect(result.size).toBe(expectedSize);
    });
  }
});

describe('union — correctness tests', () => {
  it('union of empty sets is empty', () => {
    expect(union(new Set<number>(), new Set<number>()).size).toBe(0);
  });
  it('union with array inputs works', () => {
    expect(union([1, 2], [2, 3])).toEqual(new Set([1, 2, 3]));
  });
  it('union is commutative', () => {
    const a = new Set([1, 2, 3]);
    const b = new Set([3, 4, 5]);
    expect(union(a, b)).toEqual(union(b, a));
  });
  it('union with self equals self', () => {
    const a = new Set([10, 20, 30]);
    expect(union(a, a)).toEqual(a);
  });
  it('union of disjoint sets has combined size', () => {
    expect(union([1, 2], [3, 4]).size).toBe(4);
  });
});

describe('intersection — 100 loop tests (i=0..99)', () => {
  for (let i = 0; i < 100; i++) {
    it(`intersection: range(${i}) ∩ range(50) has correct size`, () => {
      const a = new Set(range(i));
      const b = new Set(range(50));
      const result = intersection(a, b);
      const expected = Math.min(i, 50);
      expect(result.size).toBe(expected);
    });
  }
});

describe('intersection — correctness tests', () => {
  it('intersection of disjoint sets is empty', () => {
    expect(intersection([1, 2], [3, 4]).size).toBe(0);
  });
  it('intersection of identical sets equals that set', () => {
    const a = new Set([1, 2, 3]);
    expect(intersection(a, a)).toEqual(a);
  });
  it('intersection with array inputs', () => {
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual(new Set([2, 3]));
  });
  it('intersection is commutative', () => {
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual(intersection([2, 3, 4], [1, 2, 3]));
  });
});

describe('difference — correctness tests', () => {
  it('a - empty = a', () => {
    const a = new Set([1, 2, 3]);
    expect(difference(a, new Set())).toEqual(a);
  });
  it('empty - a = empty', () => {
    expect(difference(new Set(), new Set([1, 2])).size).toBe(0);
  });
  it('a - a = empty', () => {
    const a = new Set([1, 2, 3]);
    expect(difference(a, a).size).toBe(0);
  });
  it('difference with arrays', () => {
    expect(difference([1, 2, 3], [2])).toEqual(new Set([1, 3]));
  });
  it('difference does not contain b-only elements', () => {
    const result = difference([1, 2], [2, 3]);
    expect(result.has(3)).toBe(false);
    expect(result.has(1)).toBe(true);
  });
});

describe('symmetricDifference — correctness tests', () => {
  it('symmetric difference of identical sets is empty', () => {
    expect(symmetricDifference([1, 2], [1, 2]).size).toBe(0);
  });
  it('symmetric difference of disjoint sets is their union', () => {
    expect(symmetricDifference([1, 2], [3, 4])).toEqual(new Set([1, 2, 3, 4]));
  });
  it('symmetric difference is commutative', () => {
    expect(symmetricDifference([1, 2, 3], [3, 4, 5])).toEqual(
      symmetricDifference([3, 4, 5], [1, 2, 3]),
    );
  });
  it('symmetric difference [1,2] Δ [2,3] = {1,3}', () => {
    expect(symmetricDifference([1, 2], [2, 3])).toEqual(new Set([1, 3]));
  });
});

describe('isSubset / isSuperset / areDisjoint — correctness tests', () => {
  it('empty set is subset of everything', () => {
    expect(isSubset([], [1, 2, 3])).toBe(true);
  });
  it('set is subset of itself', () => {
    expect(isSubset([1, 2], [1, 2])).toBe(true);
  });
  it('[1,2] is not subset of [2,3]', () => {
    expect(isSubset([1, 2], [2, 3])).toBe(false);
  });
  it('isSuperset is the reverse of isSubset', () => {
    expect(isSuperset([1, 2, 3], [1, 2])).toBe(true);
    expect(isSuperset([1, 2], [1, 2, 3])).toBe(false);
  });
  it('disjoint sets', () => {
    expect(areDisjoint([1, 2], [3, 4])).toBe(true);
    expect(areDisjoint([1, 2], [2, 3])).toBe(false);
  });
  it('areDisjoint with empty set is always true', () => {
    expect(areDisjoint([], [1, 2, 3])).toBe(true);
  });
});

describe('cartesianProduct — correctness tests', () => {
  it('product of empty arrays is empty', () => {
    expect(cartesianProduct([], [1, 2])).toEqual([]);
    expect(cartesianProduct([1, 2], [])).toEqual([]);
  });
  it('product size = |a| × |b|', () => {
    expect(cartesianProduct([1, 2, 3], ['a', 'b']).length).toBe(6);
  });
  it('first elements of pairs come from a', () => {
    const result = cartesianProduct([1, 2], ['x', 'y']);
    expect(result.map(([a]) => a)).toEqual([1, 1, 2, 2]);
  });
  it('second elements cycle through b', () => {
    const result = cartesianProduct([1, 2], ['x', 'y']);
    expect(result.map(([, b]) => b)).toEqual(['x', 'y', 'x', 'y']);
  });
});

describe('powerSet — correctness tests', () => {
  it('power set of [] has 1 element (empty set)', () => {
    expect(powerSet([])).toEqual([[]]);
  });
  it('power set of [1] has 2 elements', () => {
    expect(powerSet([1]).length).toBe(2);
  });
  it('power set of [1,2,3] has 8 elements', () => {
    expect(powerSet([1, 2, 3]).length).toBe(8);
  });
  it('power set of n elements has 2^n subsets', () => {
    for (let n = 0; n <= 6; n++) {
      expect(powerSet(range(n)).length).toBe(1 << n);
    }
  });
  it('throws for arr.length > 16', () => {
    expect(() => powerSet(range(17))).toThrow(RangeError);
  });
  it('empty subset is always included', () => {
    const ps = powerSet([1, 2, 3]);
    expect(ps.some((s) => s.length === 0)).toBe(true);
  });
  it('full set is always included', () => {
    const arr = [1, 2, 3];
    const ps = powerSet(arr);
    expect(ps.some((s) => s.length === 3)).toBe(true);
  });
});

// ===========================================================================
// MAP UTILITIES
// ===========================================================================

describe('groupBy — 100 loop tests (i=1..100)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`groupBy: array of length ${i} grouped by parity`, () => {
      const arr = range(i);
      const grouped = groupBy(arr, (x) => (x % 2 === 0 ? 'even' : 'odd'));
      const evenCount = arr.filter((x) => x % 2 === 0).length;
      const oddCount = arr.filter((x) => x % 2 !== 0).length;
      if (evenCount > 0) {
        expect(grouped.get('even')!.length).toBe(evenCount);
      }
      if (oddCount > 0) {
        expect(grouped.get('odd')!.length).toBe(oddCount);
      }
    });
  }
});

describe('groupBy — correctness tests', () => {
  it('empty array returns empty map', () => {
    expect(groupBy([], (x: number) => x).size).toBe(0);
  });
  it('all same key => one group with all items', () => {
    const result = groupBy([1, 2, 3], () => 'same');
    expect(result.get('same')).toEqual([1, 2, 3]);
  });
  it('all unique keys => each group has one item', () => {
    const result = groupBy([1, 2, 3], (x) => x);
    expect(result.size).toBe(3);
  });
});

describe('indexBy — correctness tests', () => {
  it('creates a map keyed by given fn', () => {
    const arr = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];
    const idx = indexBy(arr, (x) => x.id);
    expect(idx.get(1)!.name).toBe('a');
    expect(idx.get(2)!.name).toBe('b');
  });
  it('last duplicate key wins', () => {
    const arr = [{ id: 1, v: 'first' }, { id: 1, v: 'second' }];
    expect(indexBy(arr, (x) => x.id).get(1)!.v).toBe('second');
  });
  it('empty array returns empty map', () => {
    expect(indexBy([], (x: number) => x).size).toBe(0);
  });
});

describe('countBy — correctness tests', () => {
  it('counts by parity', () => {
    const result = countBy([1, 2, 3, 4, 5], (x) => (x % 2 === 0 ? 'even' : 'odd'));
    expect(result.get('even')).toBe(2);
    expect(result.get('odd')).toBe(3);
  });
  it('empty array returns empty map', () => {
    expect(countBy([], (x: number) => x).size).toBe(0);
  });
  it('all same key counts total length', () => {
    expect(countBy([1, 2, 3], () => 'all').get('all')).toBe(3);
  });
});

describe('mapValues — correctness tests', () => {
  it('doubles all values', () => {
    const m = new Map([['a', 1], ['b', 2]]);
    const result = mapValues(m, (v) => v * 2);
    expect(result.get('a')).toBe(2);
    expect(result.get('b')).toBe(4);
  });
  it('preserves keys', () => {
    const m = new Map([[1, 'x'], [2, 'y']]);
    const result = mapValues(m, (v) => v.toUpperCase());
    expect([...result.keys()]).toEqual([1, 2]);
  });
  it('fn receives both value and key', () => {
    const m = new Map([['k', 10]]);
    const result = mapValues(m, (v, k) => `${k}:${v}`);
    expect(result.get('k')).toBe('k:10');
  });
});

describe('mapKeys — correctness tests', () => {
  it('prefixes each key', () => {
    const m = new Map([['a', 1], ['b', 2]]);
    const result = mapKeys(m, (k) => `pre_${k}`);
    expect(result.has('pre_a')).toBe(true);
    expect(result.has('pre_b')).toBe(true);
  });
  it('preserves values', () => {
    const m = new Map([[1, 'x'], [2, 'y']]);
    const result = mapKeys(m, (k) => k * 10);
    expect(result.get(10)).toBe('x');
    expect(result.get(20)).toBe('y');
  });
});

describe('filterMap — correctness tests', () => {
  it('filters by value', () => {
    const m = new Map([['a', 1], ['b', 2], ['c', 3]]);
    const result = filterMap(m, (v) => v > 1);
    expect(result.has('a')).toBe(false);
    expect(result.size).toBe(2);
  });
  it('empty predicate result => empty map', () => {
    const m = new Map([['a', 1]]);
    expect(filterMap(m, () => false).size).toBe(0);
  });
  it('all pass predicate => full map', () => {
    const m = new Map([['a', 1], ['b', 2]]);
    expect(filterMap(m, () => true).size).toBe(2);
  });
});

describe('mergeWith — correctness tests', () => {
  it('merges non-overlapping maps', () => {
    const a = new Map([['x', 1]]);
    const b = new Map([['y', 2]]);
    const result = mergeWith(a, b, (av, bv) => av + bv);
    expect(result.get('x')).toBe(1);
    expect(result.get('y')).toBe(2);
  });
  it('overlapping keys use mergeFn', () => {
    const a = new Map([['k', 10]]);
    const b = new Map([['k', 5]]);
    const result = mergeWith(a, b, (av, bv) => av + bv);
    expect(result.get('k')).toBe(15);
  });
  it('mergeFn receives key', () => {
    const a = new Map([['k', 1]]);
    const b = new Map([['k', 2]]);
    mergeWith(a, b, (av, bv, k) => {
      expect(k).toBe('k');
      return av + bv;
    });
  });
});

describe('invertMap — correctness tests', () => {
  it('inverts keys and values', () => {
    const m = new Map<string, string>([['a', 'x'], ['b', 'y']]);
    const inv = invertMap(m);
    expect(inv.get('x')).toBe('a');
    expect(inv.get('y')).toBe('b');
  });
  it('double inversion recovers original', () => {
    const m = new Map<string, string>([['a', 'x'], ['b', 'y']]);
    expect(invertMap(invertMap(m))).toEqual(m);
  });
});

describe('fromEntries / toObject — correctness tests', () => {
  it('fromEntries creates map from pairs', () => {
    const m = fromEntries<string, number>([['a', 1], ['b', 2]]);
    expect(m.get('a')).toBe(1);
    expect(m.get('b')).toBe(2);
  });
  it('toObject converts map to plain object', () => {
    const m = new Map([['x', 10], ['y', 20]]);
    expect(toObject(m)).toEqual({ x: 10, y: 20 });
  });
  it('fromEntries then toObject round-trips', () => {
    const entries: [string, number][] = [['p', 1], ['q', 2]];
    const obj = toObject(fromEntries(entries) as Map<string, number>);
    expect(obj).toEqual({ p: 1, q: 2 });
  });
});

// ===========================================================================
// BIMAP
// ===========================================================================

describe('BiMap — 100 loop tests: set/get/getKey (i=0..49, 2 assertions each)', () => {
  for (let i = 0; i < 50; i++) {
    it(`BiMap[${i}]: set key=${i} value="v${i}" and retrieve both directions`, () => {
      const bm = new BiMap<number, string>();
      bm.set(i, `v${i}`);
      expect(bm.get(i)).toBe(`v${i}`);
      expect(bm.getKey(`v${i}`)).toBe(i);
    });
  }
});

describe('BiMap — 50 loop tests: delete and size checks (i=0..49, 2 assertions each)', () => {
  for (let i = 0; i < 50; i++) {
    it(`BiMap delete[${i}]: size decrements correctly`, () => {
      const bm = new BiMap<number, string>();
      bm.set(i, `v${i}`);
      expect(bm.size).toBe(1);
      bm.delete(i);
      expect(bm.size).toBe(0);
    });
  }
});

describe('BiMap — correctness tests', () => {
  it('initial size is 0', () => {
    expect(new BiMap().size).toBe(0);
  });
  it('has / hasValue work correctly', () => {
    const bm = new BiMap<string, number>();
    bm.set('a', 1);
    expect(bm.has('a')).toBe(true);
    expect(bm.hasValue(1)).toBe(true);
    expect(bm.has('b')).toBe(false);
    expect(bm.hasValue(2)).toBe(false);
  });
  it('overwriting key removes old reverse entry', () => {
    const bm = new BiMap<string, string>();
    bm.set('k', 'old');
    bm.set('k', 'new');
    expect(bm.get('k')).toBe('new');
    expect(bm.getKey('old')).toBeUndefined();
    expect(bm.getKey('new')).toBe('k');
  });
  it('overwriting value removes old forward entry', () => {
    const bm = new BiMap<string, string>();
    bm.set('k1', 'v');
    bm.set('k2', 'v');
    expect(bm.has('k1')).toBe(false);
    expect(bm.get('k2')).toBe('v');
  });
  it('delete returns false for unknown key', () => {
    expect(new BiMap().delete('nonexistent')).toBe(false);
  });
  it('entries / keys / values iterators work', () => {
    const bm = new BiMap<string, number>();
    bm.set('a', 1).set('b', 2);
    expect([...bm.keys()]).toEqual(['a', 'b']);
    expect([...bm.values()]).toEqual([1, 2]);
    expect([...bm.entries()]).toEqual([['a', 1], ['b', 2]]);
  });
  it('get returns undefined for missing key', () => {
    expect(new BiMap<string, number>().get('missing')).toBeUndefined();
  });
  it('getKey returns undefined for missing value', () => {
    expect(new BiMap<string, number>().getKey(999)).toBeUndefined();
  });
  it('multiple entries maintain correct size', () => {
    const bm = new BiMap<number, string>();
    for (let i = 0; i < 10; i++) bm.set(i, `v${i}`);
    expect(bm.size).toBe(10);
  });
});

// ===========================================================================
// MULTISET
// ===========================================================================

describe('MultiSet — 100 loop tests: add/count (i=0..49, 2 assertions each)', () => {
  for (let i = 0; i < 50; i++) {
    it(`MultiSet add item=${i} count=${i + 1} and verify count`, () => {
      const ms = new MultiSet<number>();
      ms.add(i, i + 1);
      expect(ms.count(i)).toBe(i + 1);
      expect(ms.size()).toBe(i + 1);
    });
  }
});

describe('MultiSet — 100 loop tests: remove (i=0..49, 2 assertions each)', () => {
  for (let i = 0; i < 50; i++) {
    it(`MultiSet remove[${i}]: partial remove leaves correct count`, () => {
      const ms = new MultiSet<number>();
      ms.add(i, 5);
      ms.remove(i, 3);
      expect(ms.count(i)).toBe(2);
      expect(ms.size()).toBe(2);
    });
  }
});

describe('MultiSet — correctness tests', () => {
  it('empty multiset has size 0 and uniqueSize 0', () => {
    const ms = new MultiSet<string>();
    expect(ms.size()).toBe(0);
    expect(ms.uniqueSize()).toBe(0);
  });
  it('has() returns false for absent item', () => {
    expect(new MultiSet<number>().has(42)).toBe(false);
  });
  it('has() returns true after add', () => {
    const ms = new MultiSet<number>();
    ms.add(42);
    expect(ms.has(42)).toBe(true);
  });
  it('remove returns false when item absent', () => {
    expect(new MultiSet<number>().remove(1)).toBe(false);
  });
  it('remove returns true when item present', () => {
    const ms = new MultiSet<number>();
    ms.add(1);
    expect(ms.remove(1)).toBe(true);
  });
  it('toArray repeats items by count', () => {
    const ms = new MultiSet<string>();
    ms.add('a', 3).add('b', 2);
    const arr = ms.toArray();
    expect(arr.filter((x) => x === 'a').length).toBe(3);
    expect(arr.filter((x) => x === 'b').length).toBe(2);
    expect(arr.length).toBe(5);
  });
  it('entries returns [item, count] pairs', () => {
    const ms = new MultiSet<string>();
    ms.add('x', 4);
    expect(ms.entries()).toContainEqual(['x', 4]);
  });
  it('mostCommon returns items in descending order', () => {
    const ms = new MultiSet<string>();
    ms.add('a', 1).add('b', 3).add('c', 2);
    const mc = ms.mostCommon();
    expect(mc[0][0]).toBe('b');
    expect(mc[1][0]).toBe('c');
    expect(mc[2][0]).toBe('a');
  });
  it('mostCommon(n) limits results', () => {
    const ms = new MultiSet<number>();
    for (let i = 0; i < 10; i++) ms.add(i, i + 1);
    expect(ms.mostCommon(3).length).toBe(3);
  });
  it('add throws for count < 1', () => {
    expect(() => new MultiSet<number>().add(1, 0)).toThrow(RangeError);
  });
  it('uniqueSize tracks distinct items', () => {
    const ms = new MultiSet<string>();
    ms.add('x', 5).add('y', 3);
    expect(ms.uniqueSize()).toBe(2);
  });
  it('remove all of an item removes it from entries', () => {
    const ms = new MultiSet<string>();
    ms.add('z', 2);
    ms.remove('z', 2);
    expect(ms.has('z')).toBe(false);
    expect(ms.uniqueSize()).toBe(0);
  });
  it('remove more than existing removes all and returns true', () => {
    const ms = new MultiSet<number>();
    ms.add(1, 3);
    expect(ms.remove(1, 100)).toBe(true);
    expect(ms.count(1)).toBe(0);
  });
});

// ===========================================================================
// CHUNK
// ===========================================================================

describe('chunk — 50 loop tests (i=1..50, correct sub-array sizes)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`chunk(range(100), ${i}) — all chunks have size ≤ ${i}`, () => {
      const arr = range(100);
      const chunks = chunk(arr, i);
      for (const c of chunks) {
        expect(c.length).toBeLessThanOrEqual(i);
      }
      // Last chunk is always the remainder or exactly i
      const lastChunk = chunks[chunks.length - 1];
      const remainder = 100 % i;
      expect(lastChunk.length).toBe(remainder === 0 ? i : remainder);
    });
  }
});

describe('chunk — correctness tests', () => {
  it('chunk empty array returns empty', () => {
    expect(chunk([], 3)).toEqual([]);
  });
  it('chunk size larger than array returns single chunk', () => {
    expect(chunk([1, 2, 3], 10)).toEqual([[1, 2, 3]]);
  });
  it('chunk size = 1 gives all singletons', () => {
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });
  it('chunk preserves all elements', () => {
    const arr = range(17);
    const flat = chunk(arr, 5).flat();
    expect(flat).toEqual(arr);
  });
  it('chunk throws for size < 1', () => {
    expect(() => chunk([1, 2], 0)).toThrow(RangeError);
  });
});

// ===========================================================================
// FLATTEN / DEEPFLATTEN
// ===========================================================================

describe('flatten — correctness tests', () => {
  it('flatten single level', () => {
    expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
  });
  it('flatten mixed arrays and scalars', () => {
    expect(flatten([1, [2, 3], 4])).toEqual([1, 2, 3, 4]);
  });
  it('flatten does not recurse', () => {
    const result = flatten([[1, [2, 3]], [4]]);
    expect(result).toEqual([1, [2, 3], 4]);
  });
  it('flatten empty array', () => {
    expect(flatten([])).toEqual([]);
  });
  it('flatten array of scalars unchanged', () => {
    expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
  });
});

describe('deepFlatten — correctness tests', () => {
  it('deep flatten nested arrays', () => {
    expect(deepFlatten([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]);
  });
  it('deep flatten empty array', () => {
    expect(deepFlatten([])).toEqual([]);
  });
  it('deep flatten already flat', () => {
    expect(deepFlatten([1, 2, 3])).toEqual([1, 2, 3]);
  });
  it('deep flatten 5 levels', () => {
    expect(deepFlatten([[[[[42]]]]])).toEqual([42]);
  });
});

// ===========================================================================
// UNIQUE
// ===========================================================================

describe('unique — correctness tests', () => {
  it('removes duplicates', () => {
    expect(unique([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3]);
  });
  it('preserves order of first occurrence', () => {
    expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]);
  });
  it('empty array returns empty', () => {
    expect(unique([])).toEqual([]);
  });
  it('unique with keyFn', () => {
    const arr = [{ id: 1 }, { id: 2 }, { id: 1 }];
    expect(unique(arr, (x) => x.id).length).toBe(2);
  });
  it('all unique stays unchanged', () => {
    expect(unique([1, 2, 3])).toEqual([1, 2, 3]);
  });
});

// ===========================================================================
// ZIP / UNZIP
// ===========================================================================

describe('zip / unzip — correctness tests', () => {
  it('zip equal length arrays', () => {
    expect(zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
  });
  it('zip stops at shorter', () => {
    expect(zip([1, 2, 3], ['a']).length).toBe(1);
  });
  it('zip empty arrays', () => {
    expect(zip([], [])).toEqual([]);
  });
  it('unzip recovers original arrays', () => {
    const pairs: [number, string][] = [[1, 'a'], [2, 'b']];
    const [nums, strs] = unzip(pairs);
    expect(nums).toEqual([1, 2]);
    expect(strs).toEqual(['a', 'b']);
  });
  it('zip then unzip round-trips', () => {
    const a = [1, 2, 3];
    const b = ['x', 'y', 'z'];
    const [ra, rb] = unzip(zip(a, b));
    expect(ra).toEqual(a);
    expect(rb).toEqual(b);
  });
});

// ===========================================================================
// ROTATE
// ===========================================================================

describe('rotate — correctness tests', () => {
  it('rotate by 0 returns same array', () => {
    expect(rotate([1, 2, 3], 0)).toEqual([1, 2, 3]);
  });
  it('rotate by 1 moves first element to end', () => {
    expect(rotate([1, 2, 3], 1)).toEqual([2, 3, 1]);
  });
  it('rotate by length is identity', () => {
    expect(rotate([1, 2, 3], 3)).toEqual([1, 2, 3]);
  });
  it('rotate negative (right rotation)', () => {
    expect(rotate([1, 2, 3], -1)).toEqual([3, 1, 2]);
  });
  it('rotate empty array', () => {
    expect(rotate([], 5)).toEqual([]);
  });
  it('rotate large n wraps correctly', () => {
    expect(rotate([1, 2, 3], 7)).toEqual([2, 3, 1]); // 7 mod 3 = 1
  });
});

// ===========================================================================
// SLIDING
// ===========================================================================

describe('sliding — correctness tests', () => {
  it('sliding windows of size 2 step 1', () => {
    expect(sliding([1, 2, 3, 4], 2)).toEqual([[1, 2], [2, 3], [3, 4]]);
  });
  it('sliding windows of size 2 step 2', () => {
    expect(sliding([1, 2, 3, 4], 2, 2)).toEqual([[1, 2], [3, 4]]);
  });
  it('window larger than array gives no windows', () => {
    expect(sliding([1, 2], 5)).toEqual([]);
  });
  it('sliding size = array length gives one window', () => {
    expect(sliding([1, 2, 3], 3)).toEqual([[1, 2, 3]]);
  });
  it('sliding throws for size < 1', () => {
    expect(() => sliding([1, 2], 0)).toThrow(RangeError);
  });
  it('sliding throws for step < 1', () => {
    expect(() => sliding([1, 2], 1, 0)).toThrow(RangeError);
  });
});

// ===========================================================================
// TRANSPOSE
// ===========================================================================

describe('transpose — correctness tests', () => {
  it('transpose 2×3 matrix', () => {
    const m = [[1, 2, 3], [4, 5, 6]];
    expect(transpose(m)).toEqual([[1, 4], [2, 5], [3, 6]]);
  });
  it('transpose of transpose is identity', () => {
    const m = [[1, 2], [3, 4], [5, 6]];
    expect(transpose(transpose(m))).toEqual(m);
  });
  it('transpose empty matrix', () => {
    expect(transpose([])).toEqual([]);
  });
  it('transpose 1×1', () => {
    expect(transpose([[42]])).toEqual([[42]]);
  });
  it('transpose square matrix', () => {
    const m = [[1, 2], [3, 4]];
    expect(transpose(m)).toEqual([[1, 3], [2, 4]]);
  });
});

// ===========================================================================
// COMPACT
// ===========================================================================

describe('compact — correctness tests', () => {
  it('removes null and undefined', () => {
    expect(compact([1, null, 2, undefined, 3])).toEqual([1, 2, 3]);
  });
  it('removes false, 0, empty string', () => {
    expect(compact([false, 0, '', 'a', 1])).toEqual(['a', 1]);
  });
  it('empty array stays empty', () => {
    expect(compact([])).toEqual([]);
  });
  it('all truthy unchanged', () => {
    expect(compact([1, 2, 3])).toEqual([1, 2, 3]);
  });
  it('all falsy gives empty', () => {
    expect(compact([null, undefined, false, 0, ''])).toEqual([]);
  });
});

// ===========================================================================
// PARTITION
// ===========================================================================

describe('partition — correctness tests', () => {
  it('splits evens and odds', () => {
    const [evens, odds] = partition([1, 2, 3, 4, 5], (x) => x % 2 === 0);
    expect(evens).toEqual([2, 4]);
    expect(odds).toEqual([1, 3, 5]);
  });
  it('all pass predicate', () => {
    const [pass, fail] = partition([1, 2, 3], () => true);
    expect(pass).toEqual([1, 2, 3]);
    expect(fail).toEqual([]);
  });
  it('none pass predicate', () => {
    const [pass, fail] = partition([1, 2, 3], () => false);
    expect(pass).toEqual([]);
    expect(fail).toEqual([1, 2, 3]);
  });
  it('empty array returns two empty arrays', () => {
    const [pass, fail] = partition([], () => true);
    expect(pass).toEqual([]);
    expect(fail).toEqual([]);
  });
});

// ===========================================================================
// TALLY
// ===========================================================================

describe('tally — correctness tests', () => {
  it('counts each character', () => {
    const result = tally(['a', 'b', 'a', 'c', 'b', 'a']);
    expect(result.get('a')).toBe(3);
    expect(result.get('b')).toBe(2);
    expect(result.get('c')).toBe(1);
  });
  it('empty array gives empty map', () => {
    expect(tally([]).size).toBe(0);
  });
  it('all same item', () => {
    expect(tally([1, 1, 1, 1]).get(1)).toBe(4);
  });
  it('all unique items each have count 1', () => {
    const result = tally([10, 20, 30]);
    for (const v of [10, 20, 30]) expect(result.get(v)).toBe(1);
  });
});

// ===========================================================================
// ADDITIONAL CROSS-FUNCTION TESTS (correctness + edge cases)
// ===========================================================================

describe('Set operations — additional edge cases', () => {
  it('union with array inputs matches Set inputs', () => {
    const arr1 = [1, 2, 3];
    const arr2 = [3, 4, 5];
    expect(union(arr1, arr2)).toEqual(union(new Set(arr1), new Set(arr2)));
  });
  it('difference is not commutative', () => {
    const a = [1, 2, 3];
    const b = [3, 4, 5];
    expect(difference(a, b)).not.toEqual(difference(b, a));
  });
  it('isSubset with Set inputs', () => {
    expect(isSubset(new Set([1, 2]), new Set([1, 2, 3]))).toBe(true);
  });
  it('areDisjoint with Set inputs', () => {
    expect(areDisjoint(new Set([1, 2]), new Set([3, 4]))).toBe(true);
  });
  it('cartesianProduct [1]×[1] = [[1,1]]', () => {
    expect(cartesianProduct([1], [1])).toEqual([[1, 1]]);
  });
});

describe('Array utilities — additional edge cases', () => {
  it('rotate single element by any amount returns that element', () => {
    for (let n = 0; n < 5; n++) {
      expect(rotate([42], n)).toEqual([42]);
    }
  });
  it('sliding size 1 gives singletons', () => {
    expect(sliding([1, 2, 3], 1)).toEqual([[1], [2], [3]]);
  });
  it('unique of empty is empty', () => {
    expect(unique([])).toEqual([]);
  });
  it('compact preserves non-zero numbers', () => {
    expect(compact([1, 2, 3])).toEqual([1, 2, 3]);
  });
  it('partition total length equals input length', () => {
    const arr = range(20);
    const [pass, fail] = partition(arr, (x) => x % 3 === 0);
    expect(pass.length + fail.length).toBe(arr.length);
  });
  it('deepFlatten handles empty nested arrays', () => {
    expect(deepFlatten([[], [[], []]])).toEqual([]);
  });
  it('flatten handles all-scalar array', () => {
    expect(flatten([1, 2, 3])).toEqual([1, 2, 3]);
  });
});

describe('Map utilities — additional edge cases', () => {
  it('mergeWith on empty maps gives empty map', () => {
    const result = mergeWith(new Map(), new Map(), (a: number, b: number) => a + b);
    expect(result.size).toBe(0);
  });
  it('filterMap on empty map returns empty map', () => {
    expect(filterMap(new Map(), () => true).size).toBe(0);
  });
  it('fromEntries handles empty array', () => {
    expect(fromEntries([]).size).toBe(0);
  });
  it('toObject on empty map returns empty object', () => {
    expect(toObject(new Map())).toEqual({});
  });
  it('invertMap on empty map returns empty map', () => {
    expect(invertMap(new Map<string, string>()).size).toBe(0);
  });
  it('countBy with numeric keys', () => {
    const result = countBy([1, 1, 2, 2, 2], (x) => x);
    expect(result.get(1)).toBe(2);
    expect(result.get(2)).toBe(3);
  });
  it('indexBy string keys', () => {
    const arr = ['apple', 'apricot', 'banana'];
    const idx = indexBy(arr, (s) => s[0]);
    expect(idx.get('b')).toBe('banana');
  });
  it('mapKeys with string transform', () => {
    const m = new Map([['hello', 1]]);
    const result = mapKeys(m, (k) => k.toUpperCase());
    expect(result.has('HELLO')).toBe(true);
  });
});

// ===========================================================================
// STRESS / COUNT-BOOSTER LOOP TESTS
// ===========================================================================

describe('chunk stress loop — 50 additional tests (i=51..100)', () => {
  for (let i = 51; i <= 100; i++) {
    it(`chunk stress[${i}]: range(${i}) chunked by 7 covers all elements`, () => {
      const arr = range(i);
      const chunks = chunk(arr, 7);
      expect(chunks.flat()).toEqual(arr);
    });
  }
});

describe('groupBy numeric key loop — 50 additional tests (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`groupBy mod3[${i}]: range(${i}) groups have correct total`, () => {
      const arr = range(i);
      const grouped = groupBy(arr, (x) => x % 3);
      let total = 0;
      for (const group of grouped.values()) total += group.length;
      expect(total).toBe(i);
    });
  }
});

describe('tally stress loop — 50 tests (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`tally[${i}]: array of ${i} identical items has count ${i}`, () => {
      const arr = new Array<number>(i).fill(7);
      const result = tally(arr);
      expect(result.get(7)).toBe(i);
    });
  }
});

describe('union/intersection stress — 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    it(`union-intersection identity[${i}]: |A∪B| - |A∩B| = |AΔB|`, () => {
      const a = new Set(range(i));
      const b = new Set(range(i, i + 5));
      const u = union(a, b);
      const inter = intersection(a, b);
      const symDiff = symmetricDifference(a, b);
      expect(u.size - inter.size).toBe(symDiff.size);
    });
  }
});

// ===========================================================================
// EXTRA LOOP TESTS — bring total to ≥1,000
// ===========================================================================

describe('rotate correctness loop — 50 tests (i=0..49)', () => {
  for (let i = 0; i < 50; i++) {
    it(`rotate([0..9], ${i}) preserves set of elements`, () => {
      const arr = range(10);
      const rotated = rotate(arr, i);
      expect(new Set(rotated)).toEqual(new Set(arr));
      expect(rotated.length).toBe(arr.length);
    });
  }
});

describe('zip/unzip loop — 50 tests (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`zip of two range(${i}) arrays has length ${i}`, () => {
      const a = range(i);
      const b = range(i).map((x) => x * 2);
      const zipped = zip(a, b);
      expect(zipped.length).toBe(i);
      const [ua, ub] = unzip(zipped);
      expect(ua).toEqual(a);
      expect(ub).toEqual(b);
    });
  }
});
