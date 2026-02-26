// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  fromArray,
  toArray,
  map,
  filter,
  reduce,
  forEach,
  take,
  skip,
  takeWhile,
  skipWhile,
  flatMap,
  flatten,
  chunk,
  zip,
  enumerate,
  distinct,
  tap,
  concat,
  interleave,
  count,
  first,
  last,
  some,
  every,
  find,
  min,
  max,
  sum,
  getStats,
  range,
  repeat,
  cycle,
  generate,
  pipeline,
} from '../stream-utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeArr(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i + 1);
}

// ---------------------------------------------------------------------------
// Loop i=1..100: map transforms each item (×2) — 100 tests
// ---------------------------------------------------------------------------

describe('map: double values (i=1..100)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`map doubles array of size ${i}`, async () => {
      const arr = makeArr(i);
      const result = await toArray(map(fromArray(arr), (x) => x * 2));
      expect(result).toHaveLength(i);
      expect(result[0]).toBe(2);
      expect(result[i - 1]).toBe(i * 2);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop i=1..100: filter keeps even items — 100 tests
// ---------------------------------------------------------------------------

describe('filter: keep even numbers (i=1..100)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`filter evens from array of size ${i}`, async () => {
      const arr = makeArr(i);
      const result = await toArray(filter(fromArray(arr), (x) => x % 2 === 0));
      const expected = arr.filter((x) => x % 2 === 0);
      expect(result).toHaveLength(expected.length);
      expect(result).toEqual(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop i=1..100: take(fromArray(arr), i) returns i items — 100 tests
// ---------------------------------------------------------------------------

describe('take: first i items (i=1..100)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`take ${i} from array of size 200`, async () => {
      const arr = makeArr(200);
      const result = await toArray(take(fromArray(arr), i));
      expect(result).toHaveLength(i);
      expect(result[0]).toBe(1);
      expect(result[i - 1]).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop i=1..100: count returns correct value — 100 tests
// ---------------------------------------------------------------------------

describe('count: matches array size (i=1..100)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`count of array of size ${i} === ${i}`, async () => {
      const result = await count(fromArray(makeArr(i)));
      expect(result).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop i=1..50: chunk correct number of chunks — 50 tests
// ---------------------------------------------------------------------------

describe('chunk: correct chunk count (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`chunk array of size ${i} by 3`, async () => {
      const arr = makeArr(i);
      const chunks = await toArray(chunk(fromArray(arr), 3));
      const expectedChunkCount = Math.ceil(i / 3);
      expect(chunks).toHaveLength(expectedChunkCount);
      // Verify all items are present
      const flat = chunks.flat();
      expect(flat).toEqual(arr);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop i=1..50: range(0, i) produces i items — 50 tests
// ---------------------------------------------------------------------------

describe('range: produces correct count (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`range(0, ${i}) produces ${i} items`, async () => {
      const result = await toArray(range(0, i));
      expect(result).toHaveLength(i);
      expect(result[0]).toBe(0);
      expect(result[i - 1]).toBe(i - 1);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop i=1..50: reduce sum equals triangular number — 50 tests
// ---------------------------------------------------------------------------

describe('reduce: sum equals n*(n+1)/2 (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`reduce sum of 1..${i} === ${(i * (i + 1)) / 2}`, async () => {
      const arr = makeArr(i);
      const result = await reduce(fromArray(arr), (acc, x) => acc + x, 0);
      expect(result).toBe((i * (i + 1)) / 2);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop i=0..49: distinct deduplication — 50 tests
// ---------------------------------------------------------------------------

describe('distinct: deduplication (i=0..49)', () => {
  for (let i = 0; i <= 49; i++) {
    it(`distinct on duplicated array of size ${i + 1}`, async () => {
      // Create array [0,0,1,1,...,i,i]
      const arr: number[] = [];
      for (let j = 0; j <= i; j++) {
        arr.push(j, j);
      }
      const result = await toArray(distinct(fromArray(arr)));
      expect(result).toHaveLength(i + 1);
      for (let j = 0; j <= i; j++) {
        expect(result[j]).toBe(j);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Loop i=1..50: pipeline .map.filter.toArray — 50 tests
// ---------------------------------------------------------------------------

describe('pipeline: map + filter chain (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`pipeline map*2 then filter>i on array of size ${i}`, async () => {
      const arr = makeArr(i);
      const threshold = i;
      const result = await pipeline(fromArray(arr))
        .map((x) => x * 2)
        .filter((x) => x > threshold)
        .toArray();
      const expected = arr.map((x) => x * 2).filter((x) => x > threshold);
      expect(result).toEqual(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// Correctness tests for ALL functions (individual / edge cases)
// ---------------------------------------------------------------------------

describe('fromArray', () => {
  it('yields items in order', async () => {
    const result = await toArray(fromArray([10, 20, 30]));
    expect(result).toEqual([10, 20, 30]);
  });

  it('empty array produces empty iterable', async () => {
    const result = await toArray(fromArray([]));
    expect(result).toEqual([]);
  });

  it('single element array', async () => {
    const result = await toArray(fromArray([42]));
    expect(result).toEqual([42]);
  });

  it('works with strings', async () => {
    const result = await toArray(fromArray(['a', 'b', 'c']));
    expect(result).toEqual(['a', 'b', 'c']);
  });

  it('works with objects', async () => {
    const objs = [{ id: 1 }, { id: 2 }];
    const result = await toArray(fromArray(objs));
    expect(result).toEqual(objs);
  });
});

describe('toArray', () => {
  it('collects async iterable into array', async () => {
    const result = await toArray(fromArray([1, 2, 3]));
    expect(result).toEqual([1, 2, 3]);
  });

  it('collects sync iterable (array) into array', async () => {
    const result = await toArray([4, 5, 6]);
    expect(result).toEqual([4, 5, 6]);
  });

  it('collects sync iterable (Set) into array', async () => {
    const result = await toArray(new Set([7, 8, 9]));
    expect(result).toEqual([7, 8, 9]);
  });

  it('empty iterable returns empty array', async () => {
    const result = await toArray(fromArray([]));
    expect(result).toEqual([]);
  });
});

describe('map', () => {
  it('applies transform to each item', async () => {
    const result = await toArray(map(fromArray([1, 2, 3]), (x) => x * 3));
    expect(result).toEqual([3, 6, 9]);
  });

  it('passes index correctly', async () => {
    const indices: number[] = [];
    await toArray(map(fromArray(['a', 'b', 'c']), (_, i) => { indices.push(i); return i; }));
    expect(indices).toEqual([0, 1, 2]);
  });

  it('supports async mapper', async () => {
    const result = await toArray(map(fromArray([1, 2, 3]), async (x) => x + 10));
    expect(result).toEqual([11, 12, 13]);
  });

  it('empty source produces empty result', async () => {
    const result = await toArray(map(fromArray([]), (x: number) => x));
    expect(result).toEqual([]);
  });

  it('can chain multiple maps', async () => {
    const doubled = map(fromArray([1, 2, 3]), (x) => x * 2);
    const result = await toArray(map(doubled, (x) => x + 1));
    expect(result).toEqual([3, 5, 7]);
  });
});

describe('filter', () => {
  it('keeps items matching predicate', async () => {
    const result = await toArray(filter(fromArray([1, 2, 3, 4, 5]), (x) => x > 2));
    expect(result).toEqual([3, 4, 5]);
  });

  it('returns empty when no items match', async () => {
    const result = await toArray(filter(fromArray([1, 2, 3]), (x) => x > 100));
    expect(result).toEqual([]);
  });

  it('returns all items when all match', async () => {
    const result = await toArray(filter(fromArray([1, 2, 3]), () => true));
    expect(result).toEqual([1, 2, 3]);
  });

  it('supports async predicate', async () => {
    const result = await toArray(filter(fromArray([1, 2, 3, 4]), async (x) => x % 2 === 0));
    expect(result).toEqual([2, 4]);
  });

  it('empty source produces empty result', async () => {
    const result = await toArray(filter(fromArray([]), () => true));
    expect(result).toEqual([]);
  });
});

describe('reduce', () => {
  it('sums numbers', async () => {
    const result = await reduce(fromArray([1, 2, 3, 4]), (acc, x) => acc + x, 0);
    expect(result).toBe(10);
  });

  it('collects into array', async () => {
    const result = await reduce(fromArray([1, 2, 3]), (acc, x) => [...acc, x * 2], [] as number[]);
    expect(result).toEqual([2, 4, 6]);
  });

  it('returns initial value for empty iterable', async () => {
    const result = await reduce(fromArray([]), (acc, x: number) => acc + x, 99);
    expect(result).toBe(99);
  });

  it('supports async reducer', async () => {
    const result = await reduce(fromArray([1, 2, 3]), async (acc, x) => acc + x, 0);
    expect(result).toBe(6);
  });

  it('works with string concatenation', async () => {
    const result = await reduce(fromArray(['a', 'b', 'c']), (acc, x) => acc + x, '');
    expect(result).toBe('abc');
  });
});

describe('forEach', () => {
  it('visits each item', async () => {
    const visited: number[] = [];
    await forEach(fromArray([1, 2, 3]), (x) => { visited.push(x); });
    expect(visited).toEqual([1, 2, 3]);
  });

  it('provides correct index', async () => {
    const indices: number[] = [];
    await forEach(fromArray(['a', 'b', 'c']), (_, i) => { indices.push(i); });
    expect(indices).toEqual([0, 1, 2]);
  });

  it('supports async callback', async () => {
    const results: number[] = [];
    await forEach(fromArray([10, 20]), async (x) => { results.push(x); });
    expect(results).toEqual([10, 20]);
  });

  it('does nothing for empty iterable', async () => {
    let called = false;
    await forEach(fromArray([]), () => { called = true; });
    expect(called).toBe(false);
  });
});

describe('take', () => {
  it('takes first n items', async () => {
    const result = await toArray(take(fromArray([1, 2, 3, 4, 5]), 3));
    expect(result).toEqual([1, 2, 3]);
  });

  it('takes 0 items returns empty', async () => {
    const result = await toArray(take(fromArray([1, 2, 3]), 0));
    expect(result).toEqual([]);
  });

  it('takes more than available returns all', async () => {
    const result = await toArray(take(fromArray([1, 2, 3]), 100));
    expect(result).toEqual([1, 2, 3]);
  });

  it('takes exactly available', async () => {
    const result = await toArray(take(fromArray([1, 2, 3]), 3));
    expect(result).toEqual([1, 2, 3]);
  });

  it('takes 1 item', async () => {
    const result = await toArray(take(fromArray([42, 99, 100]), 1));
    expect(result).toEqual([42]);
  });

  it('negative n returns empty', async () => {
    const result = await toArray(take(fromArray([1, 2, 3]), -1));
    expect(result).toEqual([]);
  });
});

describe('skip', () => {
  it('skips first n items', async () => {
    const result = await toArray(skip(fromArray([1, 2, 3, 4, 5]), 2));
    expect(result).toEqual([3, 4, 5]);
  });

  it('skip 0 returns all', async () => {
    const result = await toArray(skip(fromArray([1, 2, 3]), 0));
    expect(result).toEqual([1, 2, 3]);
  });

  it('skip all returns empty', async () => {
    const result = await toArray(skip(fromArray([1, 2, 3]), 3));
    expect(result).toEqual([]);
  });

  it('skip more than available returns empty', async () => {
    const result = await toArray(skip(fromArray([1, 2, 3]), 100));
    expect(result).toEqual([]);
  });

  it('skip 1 removes first element', async () => {
    const result = await toArray(skip(fromArray([10, 20, 30]), 1));
    expect(result).toEqual([20, 30]);
  });
});

describe('takeWhile', () => {
  it('takes while condition holds', async () => {
    const result = await toArray(takeWhile(fromArray([1, 2, 3, 4, 5]), (x) => x < 4));
    expect(result).toEqual([1, 2, 3]);
  });

  it('stops at first false', async () => {
    const result = await toArray(takeWhile(fromArray([1, 3, 5, 2, 4]), (x) => x % 2 !== 0));
    expect(result).toEqual([1, 3, 5]);
  });

  it('returns empty when first item fails', async () => {
    const result = await toArray(takeWhile(fromArray([5, 1, 2]), (x) => x < 3));
    expect(result).toEqual([]);
  });

  it('returns all when all pass', async () => {
    const result = await toArray(takeWhile(fromArray([1, 2, 3]), () => true));
    expect(result).toEqual([1, 2, 3]);
  });

  it('empty source returns empty', async () => {
    const result = await toArray(takeWhile(fromArray([]), () => true));
    expect(result).toEqual([]);
  });
});

describe('skipWhile', () => {
  it('skips while condition holds then yields rest', async () => {
    const result = await toArray(skipWhile(fromArray([1, 2, 3, 4, 5]), (x) => x < 3));
    expect(result).toEqual([3, 4, 5]);
  });

  it('yields all if first item fails predicate', async () => {
    const result = await toArray(skipWhile(fromArray([5, 1, 2, 3]), (x) => x < 3));
    expect(result).toEqual([5, 1, 2, 3]);
  });

  it('returns empty if all pass predicate', async () => {
    const result = await toArray(skipWhile(fromArray([1, 2, 3]), () => true));
    expect(result).toEqual([]);
  });

  it('does not re-skip after first non-match', async () => {
    const result = await toArray(skipWhile(fromArray([1, 2, 3, 1, 2]), (x) => x <= 2));
    expect(result).toEqual([3, 1, 2]);
  });
});

describe('flatMap', () => {
  it('maps and flattens arrays', async () => {
    const result = await toArray(flatMap(fromArray([1, 2, 3]), (x) => [x, x * 10]));
    expect(result).toEqual([1, 10, 2, 20, 3, 30]);
  });

  it('works with async iterables', async () => {
    const result = await toArray(flatMap(fromArray([1, 2]), (x) => fromArray([x, x + 100])));
    expect(result).toEqual([1, 101, 2, 102]);
  });

  it('empty source produces empty result', async () => {
    const result = await toArray(flatMap(fromArray([]), (x: number) => [x]));
    expect(result).toEqual([]);
  });

  it('can produce empty inner arrays', async () => {
    const result = await toArray(flatMap(fromArray([1, 2, 3]), (x) => x === 2 ? [] : [x]));
    expect(result).toEqual([1, 3]);
  });

  it('handles varying inner sizes', async () => {
    const result = await toArray(flatMap(fromArray([3, 1, 2]), (x) => makeArr(x)));
    expect(result).toEqual([1, 2, 3, 1, 1, 2]);
  });
});

describe('flatten', () => {
  it('flattens arrays of arrays', async () => {
    const nested = fromArray([[1, 2], [3, 4], [5]]);
    const result = await toArray(flatten(nested));
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('flattens async iterables of arrays', async () => {
    async function* inner(): AsyncIterable<number[]> {
      yield [10, 20];
      yield [30];
    }
    const result = await toArray(flatten(inner()));
    expect(result).toEqual([10, 20, 30]);
  });

  it('handles empty inner arrays', async () => {
    const nested = fromArray([[], [1], [], [2, 3]]);
    const result = await toArray(flatten(nested));
    expect(result).toEqual([1, 2, 3]);
  });

  it('empty outer produces empty result', async () => {
    const result = await toArray(flatten(fromArray([])));
    expect(result).toEqual([]);
  });
});

describe('chunk', () => {
  it('chunks evenly divisible array', async () => {
    const result = await toArray(chunk(fromArray([1, 2, 3, 4, 5, 6]), 2));
    expect(result).toEqual([[1, 2], [3, 4], [5, 6]]);
  });

  it('last chunk may be smaller', async () => {
    const result = await toArray(chunk(fromArray([1, 2, 3, 4, 5]), 2));
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('chunk size larger than array returns one chunk', async () => {
    const result = await toArray(chunk(fromArray([1, 2, 3]), 10));
    expect(result).toEqual([[1, 2, 3]]);
  });

  it('chunk size 1 returns single-element chunks', async () => {
    const result = await toArray(chunk(fromArray([1, 2, 3]), 1));
    expect(result).toEqual([[1], [2], [3]]);
  });

  it('empty source produces empty result', async () => {
    const result = await toArray(chunk(fromArray([]), 3));
    expect(result).toEqual([]);
  });

  it('throws on zero chunk size', async () => {
    await expect(toArray(chunk(fromArray([1, 2, 3]), 0))).rejects.toThrow(RangeError);
  });
});

describe('zip', () => {
  it('zips two equal-length iterables', async () => {
    const result = await toArray(zip(fromArray([1, 2, 3]), fromArray(['a', 'b', 'c'])));
    expect(result).toEqual([[1, 'a'], [2, 'b'], [3, 'c']]);
  });

  it('stops at shorter iterable (a shorter)', async () => {
    const result = await toArray(zip(fromArray([1, 2]), fromArray(['a', 'b', 'c'])));
    expect(result).toEqual([[1, 'a'], [2, 'b']]);
  });

  it('stops at shorter iterable (b shorter)', async () => {
    const result = await toArray(zip(fromArray([1, 2, 3]), fromArray(['x'])));
    expect(result).toEqual([[1, 'x']]);
  });

  it('empty first produces empty result', async () => {
    const result = await toArray(zip(fromArray([]), fromArray([1, 2, 3])));
    expect(result).toEqual([]);
  });

  it('empty second produces empty result', async () => {
    const result = await toArray(zip(fromArray([1, 2, 3]), fromArray([])));
    expect(result).toEqual([]);
  });
});

describe('enumerate', () => {
  it('adds zero-based index to each item', async () => {
    const result = await toArray(enumerate(fromArray(['a', 'b', 'c'])));
    expect(result).toEqual([[0, 'a'], [1, 'b'], [2, 'c']]);
  });

  it('empty source produces empty result', async () => {
    const result = await toArray(enumerate(fromArray([])));
    expect(result).toEqual([]);
  });

  it('single item has index 0', async () => {
    const result = await toArray(enumerate(fromArray([99])));
    expect(result).toEqual([[0, 99]]);
  });
});

describe('distinct', () => {
  it('removes duplicates', async () => {
    const result = await toArray(distinct(fromArray([1, 2, 2, 3, 3, 3])));
    expect(result).toEqual([1, 2, 3]);
  });

  it('preserves first occurrence', async () => {
    const result = await toArray(distinct(fromArray([3, 1, 2, 1, 3])));
    expect(result).toEqual([3, 1, 2]);
  });

  it('no duplicates returns same order', async () => {
    const result = await toArray(distinct(fromArray([5, 4, 3, 2, 1])));
    expect(result).toEqual([5, 4, 3, 2, 1]);
  });

  it('uses keyFn for identity', async () => {
    const items = [{ id: 1, v: 'a' }, { id: 2, v: 'b' }, { id: 1, v: 'c' }];
    const result = await toArray(distinct(fromArray(items), (x) => x.id));
    expect(result).toHaveLength(2);
    expect(result[0].v).toBe('a');
  });

  it('empty source produces empty result', async () => {
    const result = await toArray(distinct(fromArray([])));
    expect(result).toEqual([]);
  });
});

describe('tap', () => {
  it('calls fn for each item without modifying stream', async () => {
    const side: number[] = [];
    const result = await toArray(tap(fromArray([1, 2, 3]), (x) => { side.push(x); }));
    expect(result).toEqual([1, 2, 3]);
    expect(side).toEqual([1, 2, 3]);
  });

  it('supports async fn', async () => {
    const side: number[] = [];
    await toArray(tap(fromArray([10, 20]), async (x) => { side.push(x); }));
    expect(side).toEqual([10, 20]);
  });

  it('empty source calls fn 0 times', async () => {
    let calls = 0;
    await toArray(tap(fromArray([]), () => { calls++; }));
    expect(calls).toBe(0);
  });
});

describe('concat', () => {
  it('concatenates two iterables', async () => {
    const result = await toArray(concat(fromArray([1, 2]), fromArray([3, 4])));
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it('concatenates three iterables', async () => {
    const result = await toArray(concat(fromArray([1]), fromArray([2, 3]), fromArray([4, 5, 6])));
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('empty iterables in middle work correctly', async () => {
    const result = await toArray(concat(fromArray([1]), fromArray([]), fromArray([2])));
    expect(result).toEqual([1, 2]);
  });

  it('single iterable returns same items', async () => {
    const result = await toArray(concat(fromArray([10, 20, 30])));
    expect(result).toEqual([10, 20, 30]);
  });

  it('no iterables returns empty', async () => {
    const result = await toArray(concat<number>());
    expect(result).toEqual([]);
  });
});

describe('interleave', () => {
  it('interleaves two equal-length iterables', async () => {
    const result = await toArray(interleave(fromArray([1, 3, 5]), fromArray([2, 4, 6])));
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('interleaves unequal-length iterables', async () => {
    const result = await toArray(interleave(fromArray([1, 2, 3]), fromArray([10])));
    expect(result).toEqual([1, 10, 2, 3]);
  });

  it('single iterable passes through', async () => {
    const result = await toArray(interleave(fromArray([1, 2, 3])));
    expect(result).toEqual([1, 2, 3]);
  });

  it('three iterables interleave correctly', async () => {
    const result = await toArray(
      interleave(fromArray([1, 4]), fromArray([2, 5]), fromArray([3, 6])),
    );
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('empty iterables produce empty result', async () => {
    const result = await toArray(interleave(fromArray([]), fromArray([])));
    expect(result).toEqual([]);
  });
});

describe('count', () => {
  it('counts non-empty iterable', async () => {
    expect(await count(fromArray([1, 2, 3, 4, 5]))).toBe(5);
  });

  it('counts empty iterable as 0', async () => {
    expect(await count(fromArray([]))).toBe(0);
  });

  it('counts single-item iterable as 1', async () => {
    expect(await count(fromArray([42]))).toBe(1);
  });
});

describe('first', () => {
  it('returns first item', async () => {
    expect(await first(fromArray([10, 20, 30]))).toBe(10);
  });

  it('returns undefined for empty iterable', async () => {
    expect(await first(fromArray([]))).toBeUndefined();
  });

  it('returns the only item in single-element iterable', async () => {
    expect(await first(fromArray([99]))).toBe(99);
  });
});

describe('last', () => {
  it('returns last item', async () => {
    expect(await last(fromArray([10, 20, 30]))).toBe(30);
  });

  it('returns undefined for empty iterable', async () => {
    expect(await last(fromArray([]))).toBeUndefined();
  });

  it('returns the only item in single-element iterable', async () => {
    expect(await last(fromArray([42]))).toBe(42);
  });
});

describe('some', () => {
  it('returns true when at least one item matches', async () => {
    expect(await some(fromArray([1, 2, 3, 4]), (x) => x === 3)).toBe(true);
  });

  it('returns false when no items match', async () => {
    expect(await some(fromArray([1, 2, 3]), (x) => x > 100)).toBe(false);
  });

  it('returns false for empty iterable', async () => {
    expect(await some(fromArray([]), () => true)).toBe(false);
  });

  it('short-circuits on first match', async () => {
    let checked = 0;
    await some(fromArray([1, 2, 3, 4, 5]), (x) => { checked++; return x === 2; });
    expect(checked).toBe(2);
  });

  it('supports async predicate', async () => {
    expect(await some(fromArray([1, 2, 3]), async (x) => x % 2 === 0)).toBe(true);
  });
});

describe('every', () => {
  it('returns true when all items match', async () => {
    expect(await every(fromArray([2, 4, 6]), (x) => x % 2 === 0)).toBe(true);
  });

  it('returns false when any item fails', async () => {
    expect(await every(fromArray([2, 3, 6]), (x) => x % 2 === 0)).toBe(false);
  });

  it('returns true for empty iterable (vacuous truth)', async () => {
    expect(await every(fromArray([]), () => false)).toBe(true);
  });

  it('short-circuits on first failure', async () => {
    let checked = 0;
    await every(fromArray([2, 3, 4, 5, 6]), (x) => { checked++; return x % 2 === 0; });
    expect(checked).toBe(2);
  });
});

describe('find', () => {
  it('returns first matching item', async () => {
    expect(await find(fromArray([1, 2, 3, 4]), (x) => x > 2)).toBe(3);
  });

  it('returns undefined when no item matches', async () => {
    expect(await find(fromArray([1, 2, 3]), (x) => x > 100)).toBeUndefined();
  });

  it('returns undefined for empty iterable', async () => {
    expect(await find(fromArray([]), () => true)).toBeUndefined();
  });

  it('supports async predicate', async () => {
    expect(await find(fromArray([1, 2, 3]), async (x) => x % 2 === 0)).toBe(2);
  });
});

describe('min', () => {
  it('returns minimum of numbers', async () => {
    expect(await min(fromArray([3, 1, 4, 1, 5, 9, 2]))).toBe(1);
  });

  it('returns undefined for empty iterable', async () => {
    expect(await min(fromArray([]))).toBeUndefined();
  });

  it('returns single element', async () => {
    expect(await min(fromArray([42]))).toBe(42);
  });

  it('uses custom comparator', async () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }];
    const result = await min(fromArray(items), (a, b) => a.v - b.v);
    expect(result?.v).toBe(1);
  });

  it('returns minimum string lexicographically', async () => {
    expect(await min(fromArray(['banana', 'apple', 'cherry']))).toBe('apple');
  });
});

describe('max', () => {
  it('returns maximum of numbers', async () => {
    expect(await max(fromArray([3, 1, 4, 1, 5, 9, 2]))).toBe(9);
  });

  it('returns undefined for empty iterable', async () => {
    expect(await max(fromArray([]))).toBeUndefined();
  });

  it('returns single element', async () => {
    expect(await max(fromArray([42]))).toBe(42);
  });

  it('uses custom comparator', async () => {
    const items = [{ v: 3 }, { v: 1 }, { v: 2 }];
    const result = await max(fromArray(items), (a, b) => a.v - b.v);
    expect(result?.v).toBe(3);
  });
});

describe('sum', () => {
  it('sums numbers correctly', async () => {
    expect(await sum(fromArray([1, 2, 3, 4, 5]))).toBe(15);
  });

  it('returns 0 for empty iterable', async () => {
    expect(await sum(fromArray([]))).toBe(0);
  });

  it('handles negative numbers', async () => {
    expect(await sum(fromArray([-1, -2, -3]))).toBe(-6);
  });

  it('handles mixed positive and negative', async () => {
    expect(await sum(fromArray([5, -3, 2]))).toBe(4);
  });

  it('single item returns that value', async () => {
    expect(await sum(fromArray([7]))).toBe(7);
  });
});

describe('getStats', () => {
  it('computes stats for [1,2,3,4,5]', async () => {
    const stats = await getStats(fromArray([1, 2, 3, 4, 5]));
    expect(stats.count).toBe(5);
    expect(stats.sum).toBe(15);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(5);
    expect(stats.mean).toBe(3);
  });

  it('empty iterable returns zeroed stats', async () => {
    const stats = await getStats(fromArray([]));
    expect(stats.count).toBe(0);
    expect(stats.sum).toBe(0);
    expect(stats.min).toBe(0);
    expect(stats.max).toBe(0);
    expect(stats.mean).toBe(0);
  });

  it('single item stats are consistent', async () => {
    const stats = await getStats(fromArray([42]));
    expect(stats.count).toBe(1);
    expect(stats.sum).toBe(42);
    expect(stats.min).toBe(42);
    expect(stats.max).toBe(42);
    expect(stats.mean).toBe(42);
  });

  it('mean is correct for even set', async () => {
    const stats = await getStats(fromArray([2, 4, 6, 8]));
    expect(stats.mean).toBe(5);
  });

  it('handles negative numbers', async () => {
    const stats = await getStats(fromArray([-5, -3, -1]));
    expect(stats.min).toBe(-5);
    expect(stats.max).toBe(-1);
    expect(stats.sum).toBe(-9);
    expect(stats.mean).toBe(-3);
  });
});

describe('range', () => {
  it('basic range 0..5', async () => {
    const result = await toArray(range(0, 5));
    expect(result).toEqual([0, 1, 2, 3, 4]);
  });

  it('range with step 2', async () => {
    const result = await toArray(range(0, 10, 2));
    expect(result).toEqual([0, 2, 4, 6, 8]);
  });

  it('range where start === end returns empty', async () => {
    const result = await toArray(range(5, 5));
    expect(result).toEqual([]);
  });

  it('range with negative step (countdown)', async () => {
    const result = await toArray(range(5, 0, -1));
    expect(result).toEqual([5, 4, 3, 2, 1]);
  });

  it('range step 0 throws', async () => {
    await expect(toArray(range(0, 10, 0))).rejects.toThrow(RangeError);
  });

  it('range(1, 6) produces [1,2,3,4,5]', async () => {
    const result = await toArray(range(1, 6));
    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  it('range with step 3', async () => {
    const result = await toArray(range(0, 9, 3));
    expect(result).toEqual([0, 3, 6]);
  });
});

describe('repeat', () => {
  it('repeats value fixed times', async () => {
    const result = await toArray(repeat(7, 4));
    expect(result).toEqual([7, 7, 7, 7]);
  });

  it('repeat 0 times returns empty', async () => {
    const result = await toArray(repeat('x', 0));
    expect(result).toEqual([]);
  });

  it('repeat 1 time returns one item', async () => {
    const result = await toArray(repeat(99, 1));
    expect(result).toEqual([99]);
  });

  it('infinite repeat capped by take', async () => {
    const result = await toArray(take(repeat(5), 3));
    expect(result).toEqual([5, 5, 5]);
  });

  it('works with objects', async () => {
    const obj = { v: 1 };
    const result = await toArray(repeat(obj, 3));
    expect(result).toHaveLength(3);
    result.forEach((r) => expect(r).toBe(obj));
  });
});

describe('cycle', () => {
  it('cycles through array fixed times', async () => {
    const result = await toArray(cycle([1, 2, 3], 2));
    expect(result).toEqual([1, 2, 3, 1, 2, 3]);
  });

  it('cycle 0 times returns empty', async () => {
    const result = await toArray(cycle([1, 2, 3], 0));
    expect(result).toEqual([]);
  });

  it('cycle 1 time returns array once', async () => {
    const result = await toArray(cycle([4, 5, 6], 1));
    expect(result).toEqual([4, 5, 6]);
  });

  it('infinite cycle capped by take', async () => {
    const result = await toArray(take(cycle(['a', 'b']), 5));
    expect(result).toEqual(['a', 'b', 'a', 'b', 'a']);
  });

  it('empty array returns empty even with times', async () => {
    const result = await toArray(cycle([], 5));
    expect(result).toEqual([]);
  });
});

describe('generate', () => {
  it('generates items using index function', async () => {
    const result = await toArray(generate((i) => i * i, 5));
    expect(result).toEqual([0, 1, 4, 9, 16]);
  });

  it('generate 0 count returns empty', async () => {
    const result = await toArray(generate((i) => i, 0));
    expect(result).toEqual([]);
  });

  it('supports async generator fn', async () => {
    const result = await toArray(generate(async (i) => i + 1, 3));
    expect(result).toEqual([1, 2, 3]);
  });

  it('infinite generate capped by take', async () => {
    const result = await toArray(take(generate((i) => i), 4));
    expect(result).toEqual([0, 1, 2, 3]);
  });

  it('generate produces correct count', async () => {
    const result = await toArray(generate((i) => i, 10));
    expect(result).toHaveLength(10);
  });
});

describe('pipeline', () => {
  it('basic toArray works', async () => {
    const result = await pipeline(fromArray([1, 2, 3])).toArray();
    expect(result).toEqual([1, 2, 3]);
  });

  it('pipeline.map transforms items', async () => {
    const result = await pipeline(fromArray([1, 2, 3])).map((x) => x * 2).toArray();
    expect(result).toEqual([2, 4, 6]);
  });

  it('pipeline.filter keeps matching items', async () => {
    const result = await pipeline(fromArray([1, 2, 3, 4])).filter((x) => x % 2 === 0).toArray();
    expect(result).toEqual([2, 4]);
  });

  it('pipeline.take limits results', async () => {
    const result = await pipeline(fromArray([1, 2, 3, 4, 5])).take(3).toArray();
    expect(result).toEqual([1, 2, 3]);
  });

  it('pipeline.skip drops items', async () => {
    const result = await pipeline(fromArray([1, 2, 3, 4, 5])).skip(2).toArray();
    expect(result).toEqual([3, 4, 5]);
  });

  it('pipeline.chunk batches correctly', async () => {
    const result = await pipeline(fromArray([1, 2, 3, 4, 5])).chunk(2).toArray();
    expect(result).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('pipeline.distinct removes duplicates', async () => {
    const result = await pipeline(fromArray([1, 2, 2, 3, 3, 3])).distinct().toArray();
    expect(result).toEqual([1, 2, 3]);
  });

  it('pipeline.tap does not modify stream', async () => {
    const tapped: number[] = [];
    const result = await pipeline(fromArray([10, 20]))
      .tap((x) => { tapped.push(x); })
      .toArray();
    expect(result).toEqual([10, 20]);
    expect(tapped).toEqual([10, 20]);
  });

  it('pipeline.forEach visits all items', async () => {
    const visited: number[] = [];
    await pipeline(fromArray([1, 2, 3])).forEach((x) => { visited.push(x); });
    expect(visited).toEqual([1, 2, 3]);
  });

  it('pipeline.reduce accumulates correctly', async () => {
    const result = await pipeline(fromArray([1, 2, 3, 4])).reduce((a, b) => a + b, 0);
    expect(result).toBe(10);
  });

  it('pipeline.count returns correct count', async () => {
    const result = await pipeline(fromArray([1, 2, 3, 4, 5])).count();
    expect(result).toBe(5);
  });

  it('pipeline.first returns first item', async () => {
    const result = await pipeline(fromArray([42, 99])).first();
    expect(result).toBe(42);
  });

  it('complex pipeline chain works end-to-end', async () => {
    // 1..20 → *3 → filter >10 → take 5 → sum via reduce
    const result = await pipeline(fromArray(makeArr(20)))
      .map((x) => x * 3)
      .filter((x) => x > 10)
      .take(5)
      .reduce((acc, x) => acc + x, 0);
    // *3: [3,6,9,12,15,18,...], >10: [12,15,18,21,...], take5: [12,15,18,21,24]
    expect(result).toBe(12 + 15 + 18 + 21 + 24);
  });

  it('pipeline.distinct with keyFn', async () => {
    const items = [{ id: 1 }, { id: 1 }, { id: 2 }];
    const result = await pipeline(fromArray(items)).distinct((x) => x.id).toArray();
    expect(result).toHaveLength(2);
  });

  it('empty pipeline returns empty', async () => {
    const result = await pipeline(fromArray([])).map((x: number) => x).toArray();
    expect(result).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Additional edge-case / integration tests
// ---------------------------------------------------------------------------

describe('integration: compose multiple utilities', () => {
  it('skip + take windowing', async () => {
    // page 2 of size 3 from 1..10
    const result = await toArray(take(skip(fromArray(makeArr(10)), 3), 3));
    expect(result).toEqual([4, 5, 6]);
  });

  it('flatMap then chunk', async () => {
    // [[1,2],[3,4],[5]] → flat [1..5] → chunk 2 → [[1,2],[3,4],[5]]
    const nested = fromArray([[1, 2], [3, 4], [5]]);
    const flat = flatMap(nested, (x) => x);
    const chunks = await toArray(chunk(flat, 2));
    expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('zip + map over pairs', async () => {
    const zipped = zip(fromArray([1, 2, 3]), fromArray([10, 20, 30]));
    const result = await toArray(map(zipped, ([a, b]) => a + b));
    expect(result).toEqual([11, 22, 33]);
  });

  it('enumerate + filter on even indices', async () => {
    const indexed = enumerate(fromArray(['a', 'b', 'c', 'd', 'e']));
    const evens = await toArray(filter(indexed, ([i]) => i % 2 === 0));
    expect(evens).toEqual([[0, 'a'], [2, 'c'], [4, 'e']]);
  });

  it('concat then distinct', async () => {
    const a = fromArray([1, 2, 3]);
    const b = fromArray([2, 3, 4]);
    const result = await toArray(distinct(concat(a, b)));
    expect(result).toEqual([1, 2, 3, 4]);
  });

  it('reduce to min via fold', async () => {
    const arr = [7, 3, 9, 1, 5];
    const result = await reduce(fromArray(arr), (acc, x) => Math.min(acc, x), Infinity);
    expect(result).toBe(1);
  });

  it('takeWhile + count', async () => {
    const n = await count(takeWhile(fromArray([2, 4, 6, 7, 8]), (x) => x % 2 === 0));
    expect(n).toBe(3);
  });

  it('generate squares then getStats', async () => {
    // squares of 1..5: [1,4,9,16,25]
    const stats = await getStats(generate((i) => (i + 1) ** 2, 5));
    expect(stats.count).toBe(5);
    expect(stats.sum).toBe(55);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(25);
    expect(stats.mean).toBe(11);
  });

  it('cycle + zip + map', async () => {
    // cycle [0,1] 2 times → [0,1,0,1], zip with [10,20,30,40] → sum pairs
    const cyc = cycle([0, 1], 2);
    const nums = fromArray([10, 20, 30, 40]);
    const result = await toArray(map(zip(cyc, nums), ([a, b]) => a + b));
    expect(result).toEqual([10, 21, 30, 41]);
  });

  it('interleave + take', async () => {
    const a = fromArray([1, 3, 5]);
    const b = fromArray([2, 4, 6]);
    const first5 = await toArray(take(interleave(a, b), 5));
    expect(first5).toEqual([1, 2, 3, 4, 5]);
  });
});

describe('type-correctness: async mapper receives correct index values', () => {
  it('indices start at 0 and increment', async () => {
    const indices: number[] = [];
    await toArray(map(fromArray(['x', 'y', 'z']), (_, i) => { indices.push(i); return i; }));
    expect(indices).toEqual([0, 1, 2]);
  });

  it('map index resets for each new invocation', async () => {
    const run1: number[] = [];
    const run2: number[] = [];
    await toArray(map(fromArray([1, 2]), (_, i) => { run1.push(i); return i; }));
    await toArray(map(fromArray([1, 2, 3]), (_, i) => { run2.push(i); return i; }));
    expect(run1).toEqual([0, 1]);
    expect(run2).toEqual([0, 1, 2]);
  });
});

describe('range: various step sizes', () => {
  it('step 1 (default)', async () => {
    expect(await toArray(range(0, 3))).toEqual([0, 1, 2]);
  });

  it('step 5', async () => {
    expect(await toArray(range(0, 20, 5))).toEqual([0, 5, 10, 15]);
  });

  it('step -2 downward', async () => {
    expect(await toArray(range(10, 0, -2))).toEqual([10, 8, 6, 4, 2]);
  });

  it('fractional step', async () => {
    const result = await toArray(range(0, 1, 0.25));
    expect(result).toHaveLength(4);
    expect(result[0]).toBeCloseTo(0);
    expect(result[3]).toBeCloseTo(0.75);
  });
});

describe('some/every edge cases', () => {
  it('some returns true immediately for first match', async () => {
    let count2 = 0;
    const result = await some(fromArray([5, 3, 1, 2]), (x) => { count2++; return x > 4; });
    expect(result).toBe(true);
    expect(count2).toBe(1);
  });

  it('every returns false immediately for first failure', async () => {
    let count2 = 0;
    const result = await every(fromArray([2, 4, 3, 6]), (x) => { count2++; return x % 2 === 0; });
    expect(result).toBe(false);
    expect(count2).toBe(3);
  });
});

describe('tap: side effects do not alter values', () => {
  it('tap on transformed stream', async () => {
    const sums: number[] = [];
    const result = await toArray(
      tap(map(fromArray([1, 2, 3]), (x) => x * 10), (x) => { sums.push(x); }),
    );
    expect(result).toEqual([10, 20, 30]);
    expect(sums).toEqual([10, 20, 30]);
  });
});

describe('flatten: deeply using flatMap recursion', () => {
  it('flatMap can simulate flatten of 2 levels', async () => {
    const nested = fromArray([[[1, 2], [3]], [[4]]]);
    const once = flatMap(nested, (inner) => inner);
    const twice = flatMap(once, (x) => x);
    const result = await toArray(twice);
    expect(result).toEqual([1, 2, 3, 4]);
  });
});

describe('pipeline: chained skip+take (pagination)', () => {
  it('page 0 size 5', async () => {
    const r = await pipeline(fromArray(makeArr(20))).skip(0).take(5).toArray();
    expect(r).toEqual([1, 2, 3, 4, 5]);
  });

  it('page 1 size 5', async () => {
    const r = await pipeline(fromArray(makeArr(20))).skip(5).take(5).toArray();
    expect(r).toEqual([6, 7, 8, 9, 10]);
  });

  it('page 2 size 5', async () => {
    const r = await pipeline(fromArray(makeArr(20))).skip(10).take(5).toArray();
    expect(r).toEqual([11, 12, 13, 14, 15]);
  });

  it('page beyond end returns remaining items', async () => {
    const r = await pipeline(fromArray(makeArr(7))).skip(5).take(5).toArray();
    expect(r).toEqual([6, 7]);
  });
});

// ---------------------------------------------------------------------------
// Loop i=1..50: skip(fromArray(arr), i) leaves correct items — 50 tests
// ---------------------------------------------------------------------------

describe('skip: correct remaining count (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`skip ${i} from array of size 60 leaves ${60 - i} items`, async () => {
      const arr = makeArr(60);
      const result = await toArray(skip(fromArray(arr), i));
      expect(result).toHaveLength(60 - i);
      expect(result[0]).toBe(i + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop i=1..50: sum(range(1, i+1)) === triangular — 50 tests
// ---------------------------------------------------------------------------

describe('sum + range: triangular numbers (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`sum(range(1, ${i + 1})) === ${(i * (i + 1)) / 2}`, async () => {
      const result = await sum(range(1, i + 1));
      expect(result).toBe((i * (i + 1)) / 2);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop i=1..50: enumerate index check — 50 tests
// ---------------------------------------------------------------------------

describe('enumerate: index correctness (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`enumerate array of size ${i} has correct last index`, async () => {
      const result = await toArray(enumerate(fromArray(makeArr(i))));
      expect(result).toHaveLength(i);
      expect(result[0][0]).toBe(0);
      expect(result[i - 1][0]).toBe(i - 1);
      expect(result[i - 1][1]).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// Loop i=1..10: repeat(i, i) yields i copies — 10 tests
// ---------------------------------------------------------------------------

describe('repeat: fixed count correctness (i=1..10)', () => {
  for (let i = 1; i <= 10; i++) {
    it(`repeat(${i}, ${i}) yields ${i} copies of value ${i}`, async () => {
      const result = await toArray(repeat(i, i));
      expect(result).toHaveLength(i);
      expect(result.every((v) => v === i)).toBe(true);
    });
  }
});
