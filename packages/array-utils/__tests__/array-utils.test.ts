// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  unique,
  uniqueBy,
  groupBy,
  chunk,
  flatten,
  flattenDeep,
  zip,
  partition,
  difference,
  intersection,
  union,
  rotate,
  shuffle,
  sample,
  take,
  drop,
  takeRight,
  dropRight,
  compact,
  countBy,
  sortBy,
  first,
  last,
  sum,
  average,
} from '../src/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);
const range1 = (n: number): number[] => Array.from({ length: n }, (_, i) => i + 1);

// ===========================================================================
// unique — 40 tests
// ===========================================================================
describe('unique', () => {
  it('empty array returns empty', () => expect(unique([])).toEqual([]));
  it('array with no duplicates is unchanged', () => expect(unique([1, 2, 3])).toEqual([1, 2, 3]));
  it('all-same array returns single element', () => expect(unique([7, 7, 7])).toEqual([7]));
  it('preserves insertion order', () => expect(unique([3, 1, 2, 1, 3])).toEqual([3, 1, 2]));
  it('works with strings', () => expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']));
  it('works with booleans', () => expect(unique([true, false, true])).toEqual([true, false]));
  it('works with mixed types via any', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect(unique<any>([1, '1', 1])).toEqual([1, '1']);
  });

  for (let i = 1; i <= 33; i++) {
    it(`unique on range(${i}) has length ${i}`, () => {
      const arr = range(i);
      expect(unique(arr)).toHaveLength(i);
    });
  }
});

// ===========================================================================
// uniqueBy — 40 tests
// ===========================================================================
describe('uniqueBy', () => {
  const people = [
    { id: 1, name: 'Alice', dept: 'eng' },
    { id: 2, name: 'Bob',   dept: 'hr'  },
    { id: 3, name: 'Alice', dept: 'eng' },
    { id: 4, name: 'Carol', dept: 'hr'  },
  ];

  it('deduplicates by name', () =>
    expect(uniqueBy(people, 'name').map((p) => p.name)).toEqual(['Alice', 'Bob', 'Carol']));
  it('deduplicates by dept keeps first occurrence', () =>
    expect(uniqueBy(people, 'dept').map((p) => p.dept)).toEqual(['eng', 'hr']));
  it('empty array returns empty', () => expect(uniqueBy([], 'id')).toEqual([]));
  it('all unique keeps all', () =>
    expect(uniqueBy(people, 'id')).toHaveLength(4));
  it('result is subset of original', () => {
    const res = uniqueBy(people, 'dept');
    res.forEach((r) => expect(people).toContain(r));
  });
  it('single-element array unchanged', () =>
    expect(uniqueBy([{ id: 1 }], 'id')).toHaveLength(1));
  it('does not mutate original', () => {
    const orig = [{ k: 1 }, { k: 1 }];
    uniqueBy(orig, 'k');
    expect(orig).toHaveLength(2);
  });

  for (let i = 1; i <= 33; i++) {
    it(`uniqueBy on ${i * 2} items with ${i} unique keys returns ${i}`, () => {
      const arr = Array.from({ length: i * 2 }, (_, idx) => ({ k: idx % i }));
      expect(uniqueBy(arr, 'k')).toHaveLength(i);
    });
  }
});

// ===========================================================================
// groupBy — 40 tests
// ===========================================================================
describe('groupBy', () => {
  const items = [
    { cat: 'a', v: 1 }, { cat: 'b', v: 2 }, { cat: 'a', v: 3 },
    { cat: 'c', v: 4 }, { cat: 'b', v: 5 },
  ];

  it('groups correctly', () => {
    const g = groupBy(items, 'cat');
    expect(g['a']).toHaveLength(2);
    expect(g['b']).toHaveLength(2);
    expect(g['c']).toHaveLength(1);
  });
  it('empty array returns empty record', () => expect(groupBy([], 'cat')).toEqual({}));
  it('single item produces single group', () => {
    expect(groupBy([{ cat: 'x' }], 'cat')).toEqual({ x: [{ cat: 'x' }] });
  });
  it('all same key produces one group', () => {
    const arr = [{ k: 'z', n: 1 }, { k: 'z', n: 2 }];
    expect(Object.keys(groupBy(arr, 'k'))).toHaveLength(1);
  });
  it('does not mutate input', () => {
    const arr = [{ cat: 'a' }];
    groupBy(arr, 'cat');
    expect(arr).toHaveLength(1);
  });

  for (let i = 1; i <= 35; i++) {
    it(`groupBy with ${i} groups distributes all items`, () => {
      const arr = Array.from({ length: i * 3 }, (_, idx) => ({ g: idx % i, val: idx }));
      const result = groupBy(arr, 'g');
      const totalInGroups = Object.values(result).reduce((s, v) => s + v.length, 0);
      expect(totalInGroups).toBe(i * 3);
    });
  }
});

// ===========================================================================
// chunk — 50 tests
// ===========================================================================
describe('chunk', () => {
  it('empty array returns empty', () => expect(chunk([], 3)).toEqual([]));
  it('chunk size equals array length returns one chunk', () =>
    expect(chunk([1, 2, 3], 3)).toEqual([[1, 2, 3]]));
  it('chunk size 1 returns singleton arrays', () =>
    expect(chunk([1, 2, 3], 1)).toEqual([[1], [2], [3]]));
  it('last chunk may be smaller', () =>
    expect(chunk([1, 2, 3, 4, 5], 3)).toEqual([[1, 2, 3], [4, 5]]));
  it('throws on size 0', () => expect(() => chunk([1], 0)).toThrow(RangeError));
  it('throws on negative size', () => expect(() => chunk([1], -1)).toThrow(RangeError));
  it('preserves all elements', () => {
    const arr = range(100);
    const flat = chunk(arr, 7).flat();
    expect(flat).toEqual(arr);
  });
  it('chunk size larger than array returns one chunk', () =>
    expect(chunk([1, 2], 10)).toEqual([[1, 2]]));
  it('does not mutate input', () => {
    const arr = [1, 2, 3];
    chunk(arr, 2);
    expect(arr).toEqual([1, 2, 3]);
  });
  it('works with strings', () =>
    expect(chunk(['a', 'b', 'c', 'd'], 2)).toEqual([['a', 'b'], ['c', 'd']]));

  for (let i = 1; i <= 40; i++) {
    it(`chunk of size ${i} from 100-element array preserves all elements`, () => {
      const arr = range(100);
      const chunked = chunk(arr, i);
      expect(chunked.flat()).toEqual(arr);
    });
  }
});

// ===========================================================================
// flatten — 40 tests
// ===========================================================================
describe('flatten', () => {
  it('empty array returns empty', () => expect(flatten([])).toEqual([]));
  it('single inner array', () => expect(flatten([[1, 2, 3]])).toEqual([1, 2, 3]));
  it('multiple inner arrays', () =>
    expect(flatten([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]));
  it('preserves order', () =>
    expect(flatten([[3, 1], [2]])).toEqual([3, 1, 2]));
  it('handles empty inner arrays', () =>
    expect(flatten([[], [1], [], [2, 3]])).toEqual([1, 2, 3]));
  it('does not mutate input', () => {
    const arr = [[1, 2], [3]];
    flatten(arr);
    expect(arr).toHaveLength(2);
  });

  for (let i = 1; i <= 34; i++) {
    it(`flatten of ${i} inner arrays of length 3 has total length ${i * 3}`, () => {
      const arr = Array.from({ length: i }, (_, idx) => [idx * 3, idx * 3 + 1, idx * 3 + 2]);
      expect(flatten(arr)).toHaveLength(i * 3);
    });
  }
});

// ===========================================================================
// flattenDeep — 40 tests
// ===========================================================================
describe('flattenDeep', () => {
  it('empty array returns empty', () => expect(flattenDeep([])).toEqual([]));
  it('flat array returns same values', () =>
    expect(flattenDeep([1, 2, 3])).toEqual([1, 2, 3]));
  it('one level nesting', () =>
    expect(flattenDeep([[1, 2], [3]])).toEqual([1, 2, 3]));
  it('two levels nesting', () =>
    expect(flattenDeep([[[1]], [[2, 3]]])).toEqual([1, 2, 3]));
  it('deeply nested', () =>
    expect(flattenDeep([[[[[1]]]]])).toEqual([1]));
  it('mixed nesting levels', () =>
    expect(flattenDeep([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4]));
  it('handles empty nested arrays', () =>
    expect(flattenDeep([[], [[]], [[[]]]])).toEqual([]));

  for (let i = 1; i <= 33; i++) {
    it(`flattenDeep with nesting depth ${i} returns single element`, () => {
      // Build a structure like [[[...i times...[42]...]]]]
      let nested: unknown = [42];
      for (let d = 0; d < i - 1; d++) nested = [nested];
      expect(flattenDeep(nested as unknown[])).toEqual([42]);
    });
  }
});

// ===========================================================================
// zip — 40 tests
// ===========================================================================
describe('zip', () => {
  it('empty arrays return empty', () => expect(zip([], [])).toEqual([]));
  it('equal length arrays', () =>
    expect(zip([1, 2, 3], ['a', 'b', 'c'])).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]));
  it('first shorter stops at first length', () =>
    expect(zip([1], ['a', 'b'])).toEqual([[1, 'a']]));
  it('second shorter stops at second length', () =>
    expect(zip([1, 2], ['a'])).toEqual([[1, 'a']]));
  it('single element arrays', () =>
    expect(zip([42], [true])).toEqual([[42, true]]));
  it('does not mutate inputs', () => {
    const a = [1, 2];
    const b = ['x', 'y'];
    zip(a, b);
    expect(a).toEqual([1, 2]);
    expect(b).toEqual(['x', 'y']);
  });

  for (let i = 1; i <= 34; i++) {
    it(`zip of two arrays of length ${i} returns ${i} pairs`, () => {
      const a = range(i);
      const b = range1(i);
      const result = zip(a, b);
      expect(result).toHaveLength(i);
      expect(result[0]).toEqual([0, 1]);
    });
  }
});

// ===========================================================================
// partition — 40 tests
// ===========================================================================
describe('partition', () => {
  it('empty array produces two empty partitions', () =>
    expect(partition([], () => true)).toEqual([[], []]));
  it('all match', () =>
    expect(partition([1, 2, 3], () => true)).toEqual([[1, 2, 3], []]));
  it('none match', () =>
    expect(partition([1, 2, 3], () => false)).toEqual([[], [1, 2, 3]]));
  it('evens and odds', () => {
    const [evens, odds] = partition(range1(10), (n) => n % 2 === 0);
    expect(evens).toEqual([2, 4, 6, 8, 10]);
    expect(odds).toEqual([1, 3, 5, 7, 9]);
  });
  it('total count preserved', () => {
    const arr = range(50);
    const [a, b] = partition(arr, (n) => n > 25);
    expect(a.length + b.length).toBe(50);
  });
  it('does not mutate input', () => {
    const arr = [1, 2, 3];
    partition(arr, (n) => n > 1);
    expect(arr).toEqual([1, 2, 3]);
  });

  for (let i = 1; i <= 34; i++) {
    it(`partition of range(${i * 2}) by even splits evenly`, () => {
      const arr = range(i * 2);
      const [evens, odds] = partition(arr, (n) => n % 2 === 0);
      expect(evens.length).toBe(i);
      expect(odds.length).toBe(i);
    });
  }
});

// ===========================================================================
// difference — 40 tests
// ===========================================================================
describe('difference', () => {
  it('empty arrays', () => expect(difference([], [])).toEqual([]));
  it('nothing in common', () =>
    expect(difference([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3]));
  it('everything in common', () =>
    expect(difference([1, 2, 3], [1, 2, 3])).toEqual([]));
  it('partial overlap', () =>
    expect(difference([1, 2, 3, 4], [2, 4])).toEqual([1, 3]));
  it('b has extras not in a', () =>
    expect(difference([1, 2], [1, 2, 3])).toEqual([]));
  it('preserves order', () =>
    expect(difference([3, 1, 2], [2])).toEqual([3, 1]));
  it('does not mutate', () => {
    const a = [1, 2, 3];
    difference(a, [1]);
    expect(a).toEqual([1, 2, 3]);
  });

  for (let i = 1; i <= 33; i++) {
    it(`difference: removing ${i} elements from range(${i * 2}) leaves ${i}`, () => {
      const a = range(i * 2);
      const b = range(i); // first i elements
      expect(difference(a, b)).toHaveLength(i);
    });
  }
});

// ===========================================================================
// intersection — 40 tests
// ===========================================================================
describe('intersection', () => {
  it('empty arrays', () => expect(intersection([], [])).toEqual([]));
  it('no overlap returns empty', () =>
    expect(intersection([1, 2], [3, 4])).toEqual([]));
  it('full overlap returns all', () =>
    expect(intersection([1, 2, 3], [1, 2, 3])).toEqual([1, 2, 3]));
  it('partial overlap', () =>
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3]));
  it('order follows first array', () =>
    expect(intersection([3, 1, 2], [2, 3])).toEqual([3, 2]));
  it('does not mutate', () => {
    const a = [1, 2];
    intersection(a, [1]);
    expect(a).toEqual([1, 2]);
  });
  it('b empty returns empty', () =>
    expect(intersection([1, 2, 3], [])).toEqual([]));

  for (let i = 1; i <= 33; i++) {
    it(`intersection of identical range(${i}) arrays has length ${i}`, () => {
      const arr = range(i);
      expect(intersection(arr, arr)).toHaveLength(i);
    });
  }
});

// ===========================================================================
// union — 40 tests
// ===========================================================================
describe('union', () => {
  it('empty arrays', () => expect(union([], [])).toEqual([]));
  it('no overlap merges all', () =>
    expect(union([1, 2], [3, 4])).toEqual([1, 2, 3, 4]));
  it('full overlap deduplicates', () =>
    expect(union([1, 2, 3], [1, 2, 3])).toEqual([1, 2, 3]));
  it('partial overlap', () =>
    expect(union([1, 2, 3], [2, 3, 4])).toEqual([1, 2, 3, 4]));
  it('preserves first-seen order', () =>
    expect(union([3, 1], [1, 2])).toEqual([3, 1, 2]));
  it('does not mutate', () => {
    const a = [1];
    union(a, [2]);
    expect(a).toEqual([1]);
  });

  for (let i = 1; i <= 34; i++) {
    it(`union of two disjoint ranges of size ${i} has length ${i * 2}`, () => {
      const a = range(i);
      const b = Array.from({ length: i }, (_, k) => k + i);
      expect(union(a, b)).toHaveLength(i * 2);
    });
  }
});

// ===========================================================================
// rotate — 50 tests
// ===========================================================================
describe('rotate', () => {
  it('empty array returns empty', () => expect(rotate([], 3)).toEqual([]));
  it('rotate by 0 returns same', () =>
    expect(rotate([1, 2, 3], 0)).toEqual([1, 2, 3]));
  it('rotate by length returns same', () =>
    expect(rotate([1, 2, 3], 3)).toEqual([1, 2, 3]));
  it('rotate by 1', () =>
    expect(rotate([1, 2, 3], 1)).toEqual([2, 3, 1]));
  it('rotate right (negative)', () =>
    expect(rotate([1, 2, 3], -1)).toEqual([3, 1, 2]));
  it('rotate by more than length wraps', () =>
    expect(rotate([1, 2, 3], 4)).toEqual([2, 3, 1]));
  it('rotate by -length returns same', () =>
    expect(rotate([1, 2, 3], -3)).toEqual([1, 2, 3]));
  it('single element array unchanged', () =>
    expect(rotate([42], 99)).toEqual([42]));
  it('does not mutate input', () => {
    const arr = [1, 2, 3];
    rotate(arr, 1);
    expect(arr).toEqual([1, 2, 3]);
  });
  it('preserves all elements', () => {
    const arr = range(10);
    const rotated = rotate(arr, 4);
    expect(rotated.sort((a, b) => a - b)).toEqual(arr);
  });

  for (let i = 0; i <= 39; i++) {
    it(`rotate range(10) by ${i} preserves all elements`, () => {
      const arr = range(10);
      const rotated = rotate(arr, i);
      expect(rotated).toHaveLength(10);
      expect(rotated.sort((a, b) => a - b)).toEqual(arr);
    });
  }
});

// ===========================================================================
// shuffle — 40 tests
// ===========================================================================
describe('shuffle', () => {
  it('empty array returns empty', () => expect(shuffle([])).toEqual([]));
  it('single element unchanged', () => expect(shuffle([42])).toEqual([42]));
  it('preserves length', () => expect(shuffle(range(10))).toHaveLength(10));
  it('preserves all elements', () => {
    const arr = range(20);
    const s = shuffle(arr, 42);
    expect(s.sort((a, b) => a - b)).toEqual(arr);
  });
  it('seeded shuffle is deterministic', () => {
    const arr = range(10);
    expect(shuffle(arr, 1)).toEqual(shuffle(arr, 1));
  });
  it('different seeds produce different results (statistically)', () => {
    const arr = range(20);
    expect(shuffle(arr, 1)).not.toEqual(shuffle(arr, 9999));
  });
  it('does not mutate input', () => {
    const arr = range(5);
    shuffle(arr, 7);
    expect(arr).toEqual(range(5));
  });

  for (let i = 1; i <= 33; i++) {
    it(`shuffle with seed ${i} preserves all elements of range(20)`, () => {
      const arr = range(20);
      const s = shuffle(arr, i);
      expect(s.sort((a, b) => a - b)).toEqual(arr);
    });
  }
});

// ===========================================================================
// sample — 40 tests
// ===========================================================================
describe('sample', () => {
  it('sample 0 returns empty', () =>
    expect(sample([1, 2, 3], 0)).toEqual([]));
  it('sample all returns shuffled full array', () =>
    expect(sample(range(5), 5)).toHaveLength(5));
  it('sample more than length returns full array', () =>
    expect(sample([1, 2, 3], 10)).toHaveLength(3));
  it('sampled elements are all from original', () => {
    const arr = range(50);
    const s = sample(arr, 10);
    s.forEach((v) => expect(arr).toContain(v));
  });
  it('no duplicates in sample of full range', () => {
    const arr = range(10);
    const s = sample(arr, 10);
    expect(new Set(s).size).toBe(10);
  });
  it('does not mutate input', () => {
    const arr = [1, 2, 3];
    sample(arr, 2);
    expect(arr).toHaveLength(3);
  });
  it('empty input returns empty', () =>
    expect(sample([], 5)).toEqual([]));

  for (let i = 1; i <= 33; i++) {
    it(`sample ${i} from range(50) returns ${i} elements`, () => {
      const arr = range(50);
      const s = sample(arr, i);
      expect(s).toHaveLength(i);
    });
  }
});

// ===========================================================================
// take — 40 tests
// ===========================================================================
describe('take', () => {
  it('take 0 returns empty', () => expect(take([1, 2, 3], 0)).toEqual([]));
  it('take more than length returns all', () =>
    expect(take([1, 2, 3], 10)).toEqual([1, 2, 3]));
  it('take exact length', () =>
    expect(take([1, 2, 3], 3)).toEqual([1, 2, 3]));
  it('take 1', () => expect(take([1, 2, 3], 1)).toEqual([1]));
  it('take from empty', () => expect(take([], 5)).toEqual([]));
  it('negative n returns empty', () =>
    expect(take([1, 2, 3], -1)).toEqual([]));
  it('does not mutate', () => {
    const arr = [1, 2, 3];
    take(arr, 2);
    expect(arr).toEqual([1, 2, 3]);
  });

  for (let i = 1; i <= 33; i++) {
    it(`take ${i} from range(50) returns first ${i} elements`, () => {
      const arr = range(50);
      expect(take(arr, i)).toEqual(arr.slice(0, i));
    });
  }
});

// ===========================================================================
// drop — 40 tests
// ===========================================================================
describe('drop', () => {
  it('drop 0 returns all', () => expect(drop([1, 2, 3], 0)).toEqual([1, 2, 3]));
  it('drop all returns empty', () =>
    expect(drop([1, 2, 3], 3)).toEqual([]));
  it('drop more than length returns empty', () =>
    expect(drop([1, 2, 3], 10)).toEqual([]));
  it('drop 1', () => expect(drop([1, 2, 3], 1)).toEqual([2, 3]));
  it('drop from empty', () => expect(drop([], 5)).toEqual([]));
  it('negative n returns all', () =>
    expect(drop([1, 2, 3], -1)).toEqual([1, 2, 3]));
  it('does not mutate', () => {
    const arr = [1, 2, 3];
    drop(arr, 1);
    expect(arr).toEqual([1, 2, 3]);
  });

  for (let i = 1; i <= 33; i++) {
    it(`drop ${i} from range(50) returns last ${50 - i} elements`, () => {
      const arr = range(50);
      expect(drop(arr, i)).toEqual(arr.slice(i));
    });
  }
});

// ===========================================================================
// takeRight — 40 tests
// ===========================================================================
describe('takeRight', () => {
  it('takeRight 0 returns empty', () =>
    expect(takeRight([1, 2, 3], 0)).toEqual([]));
  it('takeRight more than length returns all', () =>
    expect(takeRight([1, 2, 3], 10)).toEqual([1, 2, 3]));
  it('takeRight exact length', () =>
    expect(takeRight([1, 2, 3], 3)).toEqual([1, 2, 3]));
  it('takeRight 1 returns last element', () =>
    expect(takeRight([1, 2, 3], 1)).toEqual([3]));
  it('takeRight from empty', () => expect(takeRight([], 5)).toEqual([]));
  it('negative n returns empty', () =>
    expect(takeRight([1, 2, 3], -1)).toEqual([]));
  it('does not mutate', () => {
    const arr = [1, 2, 3];
    takeRight(arr, 2);
    expect(arr).toEqual([1, 2, 3]);
  });

  for (let i = 1; i <= 33; i++) {
    it(`takeRight ${i} from range(50) returns last ${i} elements`, () => {
      const arr = range(50);
      expect(takeRight(arr, i)).toEqual(arr.slice(-i));
    });
  }
});

// ===========================================================================
// dropRight — 40 tests
// ===========================================================================
describe('dropRight', () => {
  it('dropRight 0 returns all', () =>
    expect(dropRight([1, 2, 3], 0)).toEqual([1, 2, 3]));
  it('dropRight all returns empty', () =>
    expect(dropRight([1, 2, 3], 3)).toEqual([]));
  it('dropRight more than length returns empty', () =>
    expect(dropRight([1, 2, 3], 10)).toEqual([]));
  it('dropRight 1 removes last', () =>
    expect(dropRight([1, 2, 3], 1)).toEqual([1, 2]));
  it('dropRight from empty', () => expect(dropRight([], 5)).toEqual([]));
  it('negative n returns all', () =>
    expect(dropRight([1, 2, 3], -1)).toEqual([1, 2, 3]));
  it('does not mutate', () => {
    const arr = [1, 2, 3];
    dropRight(arr, 1);
    expect(arr).toEqual([1, 2, 3]);
  });

  for (let i = 1; i <= 33; i++) {
    it(`dropRight ${i} from range(50) returns first ${50 - i} elements`, () => {
      const arr = range(50);
      expect(dropRight(arr, i)).toEqual(arr.slice(0, 50 - i));
    });
  }
});

// ===========================================================================
// compact — 40 tests
// ===========================================================================
describe('compact', () => {
  it('empty array returns empty', () => expect(compact([])).toEqual([]));
  it('removes null', () => expect(compact([1, null, 2])).toEqual([1, 2]));
  it('removes undefined', () =>
    expect(compact([1, undefined, 2])).toEqual([1, 2]));
  it('removes false', () => expect(compact([1, false, 2])).toEqual([1, 2]));
  it('removes 0', () => expect(compact([1, 0, 2])).toEqual([1, 2]));
  it("removes empty string", () => expect(compact([1, '', 2])).toEqual([1, 2]));
  it('removes all falsy types together', () =>
    expect(compact([null, undefined, false, 0, '', 1])).toEqual([1]));
  it('all truthy remains unchanged', () =>
    expect(compact([1, 2, 3])).toEqual([1, 2, 3]));
  it('does not mutate', () => {
    const arr = [1, null, 2];
    compact(arr);
    expect(arr).toHaveLength(3);
  });

  for (let i = 1; i <= 31; i++) {
    it(`compact removes ${i} nulls from mixed array`, () => {
      const arr: (number | null)[] = [];
      for (let j = 0; j < i; j++) arr.push(null);
      for (let j = 0; j < i; j++) arr.push(j + 1);
      expect(compact(arr)).toHaveLength(i);
    });
  }
});

// ===========================================================================
// countBy — 40 tests
// ===========================================================================
describe('countBy', () => {
  const data = [
    { role: 'admin', dept: 'eng' },
    { role: 'user',  dept: 'hr'  },
    { role: 'admin', dept: 'eng' },
    { role: 'guest', dept: 'hr'  },
    { role: 'user',  dept: 'eng' },
  ];

  it('counts by role correctly', () => {
    const c = countBy(data, 'role');
    expect(c['admin']).toBe(2);
    expect(c['user']).toBe(2);
    expect(c['guest']).toBe(1);
  });
  it('counts by dept correctly', () => {
    const c = countBy(data, 'dept');
    expect(c['eng']).toBe(3);
    expect(c['hr']).toBe(2);
  });
  it('empty array returns empty record', () =>
    expect(countBy([], 'role')).toEqual({}));
  it('single item produces count 1', () =>
    expect(countBy([{ t: 'x' }], 't')).toEqual({ x: 1 }));
  it('total count matches array length', () => {
    const c = countBy(data, 'role');
    const total = Object.values(c).reduce((s, v) => s + v, 0);
    expect(total).toBe(data.length);
  });
  it('does not mutate input', () => {
    countBy(data, 'role');
    expect(data).toHaveLength(5);
  });

  for (let i = 1; i <= 34; i++) {
    it(`countBy with ${i} distinct keys produces ${i} entries`, () => {
      const arr = Array.from({ length: i * 2 }, (_, idx) => ({ k: String(idx % i) }));
      const c = countBy(arr, 'k');
      expect(Object.keys(c)).toHaveLength(i);
    });
  }
});

// ===========================================================================
// sortBy — 50 tests
// ===========================================================================
describe('sortBy', () => {
  const people = [
    { name: 'Carol', age: 30 },
    { name: 'Alice', age: 25 },
    { name: 'Bob',   age: 35 },
  ];

  it('sorts by name asc', () =>
    expect(sortBy(people, 'name').map((p) => p.name)).toEqual(['Alice', 'Bob', 'Carol']));
  it('sorts by name desc', () =>
    expect(sortBy(people, 'name', 'desc').map((p) => p.name)).toEqual(['Carol', 'Bob', 'Alice']));
  it('sorts by age asc', () =>
    expect(sortBy(people, 'age').map((p) => p.age)).toEqual([25, 30, 35]));
  it('sorts by age desc', () =>
    expect(sortBy(people, 'age', 'desc').map((p) => p.age)).toEqual([35, 30, 25]));
  it('empty array returns empty', () => expect(sortBy([], 'name')).toEqual([]));
  it('does not mutate original', () => {
    sortBy(people, 'age');
    expect(people[0].name).toBe('Carol');
  });
  it('single element unchanged', () =>
    expect(sortBy([{ x: 1 }], 'x')).toEqual([{ x: 1 }]));
  it('stable sort preserves relative order of equal elements', () => {
    const arr = [{ v: 1, i: 0 }, { v: 1, i: 1 }, { v: 1, i: 2 }];
    const sorted = sortBy(arr, 'v');
    expect(sorted.map((e) => e.i)).toEqual([0, 1, 2]);
  });
  it('default direction is asc', () => {
    const arr = [{ n: 3 }, { n: 1 }, { n: 2 }];
    expect(sortBy(arr, 'n')[0].n).toBe(1);
  });
  it('handles negative numbers', () => {
    const arr = [{ n: -1 }, { n: -3 }, { n: -2 }];
    expect(sortBy(arr, 'n').map((a) => a.n)).toEqual([-3, -2, -1]);
  });

  for (let i = 1; i <= 40; i++) {
    it(`sortBy age asc on ${i} shuffled items produces sorted order`, () => {
      const arr = Array.from({ length: i }, (_, k) => ({ age: i - k }));
      const sorted = sortBy(arr, 'age');
      for (let j = 1; j < sorted.length; j++) {
        expect(sorted[j].age).toBeGreaterThanOrEqual(sorted[j - 1].age);
      }
    });
  }
});

// ===========================================================================
// first / last — 40 tests
// ===========================================================================
describe('first', () => {
  it('returns undefined for empty', () => expect(first([])).toBeUndefined());
  it('returns first element', () => expect(first([1, 2, 3])).toBe(1));
  it('single element', () => expect(first([42])).toBe(42));

  for (let i = 1; i <= 37; i++) {
    it(`first of range1(${i}) is 1`, () => {
      expect(first(range1(i))).toBe(1);
    });
  }
});

describe('last', () => {
  it('returns undefined for empty', () => expect(last([])).toBeUndefined());
  it('returns last element', () => expect(last([1, 2, 3])).toBe(3));
  it('single element', () => expect(last([42])).toBe(42));

  for (let i = 1; i <= 37; i++) {
    it(`last of range1(${i}) is ${i}`, () => {
      expect(last(range1(i))).toBe(i);
    });
  }
});

// ===========================================================================
// sum — 40 tests
// ===========================================================================
describe('sum', () => {
  it('empty array returns 0', () => expect(sum([])).toBe(0));
  it('single element', () => expect(sum([5])).toBe(5));
  it('positive integers', () => expect(sum([1, 2, 3])).toBe(6));
  it('includes negative', () => expect(sum([-1, 2, -3])).toBe(-2));
  it('floats', () => expect(sum([0.1, 0.2])).toBeCloseTo(0.3));
  it('all zeros', () => expect(sum([0, 0, 0])).toBe(0));
  it('does not mutate', () => {
    const arr = [1, 2, 3];
    sum(arr);
    expect(arr).toEqual([1, 2, 3]);
  });

  for (let i = 1; i <= 33; i++) {
    it(`sum of 1..${i} equals ${(i * (i + 1)) / 2}`, () => {
      expect(sum(range1(i))).toBe((i * (i + 1)) / 2);
    });
  }
});

// ===========================================================================
// average — 40 tests
// ===========================================================================
describe('average', () => {
  it('empty array returns NaN', () => expect(average([])).toBeNaN());
  it('single element', () => expect(average([4])).toBe(4));
  it('two elements', () => expect(average([2, 4])).toBe(3));
  it('all same', () => expect(average([7, 7, 7])).toBe(7));
  it('includes negative', () => expect(average([-5, 5])).toBe(0));
  it('floats', () => expect(average([1.5, 2.5])).toBeCloseTo(2));
  it('does not mutate', () => {
    const arr = [1, 2, 3];
    average(arr);
    expect(arr).toEqual([1, 2, 3]);
  });

  for (let i = 1; i <= 33; i++) {
    it(`average of 1..${i} equals ${((i + 1) / 2).toFixed(1)}`, () => {
      expect(average(range1(i))).toBeCloseTo((i + 1) / 2);
    });
  }
});

// ===========================================================================
// Cross-function integration tests — 30 tests
// ===========================================================================
describe('integration', () => {
  it('chunk + flatten round-trips', () => {
    const arr = range(30);
    expect(flatten(chunk(arr, 5))).toEqual(arr);
  });
  it('unique + union = union', () => {
    const a = [1, 2, 3];
    const b = [2, 3, 4];
    expect(unique(union(a, b))).toEqual(union(a, b));
  });
  it('difference + intersection cover original', () => {
    const a = range(10);
    const b = range1(5); // [1..5]
    const diff = difference(a, b);
    const inter = intersection(a, b);
    expect(diff.length + inter.length).toBe(a.length);
  });
  it('partition sums match original length', () => {
    const arr = range(20);
    const [a, b] = partition(arr, (n) => n % 3 === 0);
    expect(a.length + b.length).toBe(arr.length);
  });
  it('sortBy then first gives minimum', () => {
    const arr = [{ v: 5 }, { v: 1 }, { v: 3 }];
    expect(first(sortBy(arr, 'v'))!.v).toBe(1);
  });
  it('sortBy then last gives maximum', () => {
    const arr = [{ v: 5 }, { v: 1 }, { v: 3 }];
    expect(last(sortBy(arr, 'v'))!.v).toBe(5);
  });
  it('compact + sum works', () => {
    const arr: (number | null | false | 0 | '')[] = [1, null, 2, false, 3, 0, 4, ''];
    expect(sum(compact(arr))).toBe(10);
  });
  it('groupBy + countBy agree', () => {
    const arr = [{ k: 'a' }, { k: 'b' }, { k: 'a' }];
    const g = groupBy(arr, 'k');
    const c = countBy(arr, 'k');
    Object.keys(g).forEach((key) => expect(g[key].length).toBe(c[key]));
  });
  it('uniqueBy + groupBy: uniqueBy reduces group to 1 per key', () => {
    const arr = [{ k: 'x', v: 1 }, { k: 'x', v: 2 }, { k: 'y', v: 3 }];
    const u = uniqueBy(arr, 'k');
    const g = groupBy(u, 'k');
    Object.values(g).forEach((group) => expect(group).toHaveLength(1));
  });
  it('zip + flatten produces interleaved array', () => {
    const a = [1, 3, 5];
    const b = [2, 4, 6];
    const zipped = zip(a, b);
    expect(flatten(zipped)).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('take + drop decompose array', () => {
    const arr = range(20);
    const n = 7;
    expect([...take(arr, n), ...drop(arr, n)]).toEqual(arr);
  });
  it('takeRight + dropRight decompose array', () => {
    const arr = range(20);
    const n = 7;
    expect([...dropRight(arr, n), ...takeRight(arr, n)]).toEqual(arr);
  });
  it('shuffle preserves sum', () => {
    const arr = range1(20);
    expect(sum(shuffle(arr, 123))).toBe(sum(arr));
  });
  it('rotate twice by half length equals original', () => {
    const arr = range(10);
    expect(rotate(rotate(arr, 5), 5)).toEqual(arr);
  });
  it('sample is subset', () => {
    const arr = range(50);
    const s = sample(arr, 15);
    s.forEach((v) => expect(arr).toContain(v));
  });
  it('average of range1(n) equals (n+1)/2', () => {
    for (let n = 1; n <= 10; n++) {
      expect(average(range1(n))).toBeCloseTo((n + 1) / 2);
    }
  });
  it('flattenDeep of chunk output equals original', () => {
    const arr = range(27);
    expect(flattenDeep(chunk(arr, 3))).toEqual(arr);
  });
  it('union of a and difference(b, a) equals union(a,b)', () => {
    const a = [1, 2, 3];
    const b = [2, 3, 4, 5];
    expect(union(a, difference(b, a))).toEqual(union(a, b));
  });
  it('countBy totals equal array length', () => {
    const arr = Array.from({ length: 100 }, (_, i) => ({ g: i % 7 }));
    const c = countBy(arr, 'g');
    expect(Object.values(c).reduce((s, v) => s + v, 0)).toBe(100);
  });
  it('rotate by n then by -n returns original', () => {
    const arr = range(12);
    expect(rotate(rotate(arr, 4), -4)).toEqual(arr);
  });

  for (let i = 1; i <= 10; i++) {
    it(`integration[${i}]: chunk+unique+sum pipeline on range(${i * 10})`, () => {
      const arr = range(i * 10);
      const chunked = chunk(arr, i);
      const firstChunk = chunked[0];
      expect(unique(firstChunk)).toEqual(firstChunk); // already unique
      expect(sum(firstChunk)).toBe((firstChunk.reduce((s, v) => s + v, 0)));
    });
  }
});
