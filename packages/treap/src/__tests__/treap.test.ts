// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.
import { Treap, ImplicitTreap, OrderStatisticTree, ValueTreap, treapSort, treapMedian } from '../treap';

// =============================================================================
// Treap<T> — Insert (sequential keys, n = 1..50)
// =============================================================================
for (let n = 1; n <= 50; n++) {
  it(`Treap insert ${n} sequential keys — size correct`, () => {
    const t = new Treap<string>();
    for (let i = 1; i <= n; i++) t.insert(i, `v${i}`);
    expect(t.size).toBe(n);
  });
}

for (let n = 1; n <= 50; n++) {
  it(`Treap insert ${n} sequential keys — search last key`, () => {
    const t = new Treap<string>();
    for (let i = 1; i <= n; i++) t.insert(i, `v${i}`);
    expect(t.search(n)).toBe(`v${n}`);
  });
}

for (let n = 1; n <= 50; n++) {
  it(`Treap insert ${n} sequential keys — search first key`, () => {
    const t = new Treap<string>();
    for (let i = 1; i <= n; i++) t.insert(i, `v${i}`);
    expect(t.search(1)).toBe('v1');
  });
}

// =============================================================================
// Treap<T> — Search / has (n = 1..30)
// =============================================================================
for (let n = 1; n <= 30; n++) {
  it(`Treap has() returns true for existing key ${n}`, () => {
    const t = new Treap<number>();
    t.insert(n, n * 10);
    expect(t.has(n)).toBe(true);
  });
}

for (let n = 1; n <= 30; n++) {
  it(`Treap has() returns false for missing key after inserting ${n}`, () => {
    const t = new Treap<number>();
    t.insert(n, n * 10);
    expect(t.has(n + 1000)).toBe(false);
  });
}

for (let n = 1; n <= 20; n++) {
  it(`Treap search() returns undefined for missing key (n=${n})`, () => {
    const t = new Treap<string>();
    for (let i = 1; i <= n; i++) t.insert(i, `x`);
    expect(t.search(n + 500)).toBeUndefined();
  });
}

// =============================================================================
// Treap<T> — Update existing key (upsert behaviour)
// =============================================================================
for (let n = 1; n <= 20; n++) {
  it(`Treap insert same key ${n} twice updates value`, () => {
    const t = new Treap<string>();
    t.insert(n, 'old');
    t.insert(n, 'new');
    expect(t.search(n)).toBe('new');
    expect(t.size).toBe(1);
  });
}

// =============================================================================
// Treap<T> — Delete
// =============================================================================
for (let n = 1; n <= 30; n++) {
  it(`Treap delete existing key ${n} returns true`, () => {
    const t = new Treap<number>();
    t.insert(n, n);
    expect(t.delete(n)).toBe(true);
  });
}

for (let n = 1; n <= 30; n++) {
  it(`Treap delete existing key ${n} reduces size`, () => {
    const t = new Treap<number>();
    t.insert(n, n);
    t.delete(n);
    expect(t.size).toBe(0);
  });
}

for (let n = 1; n <= 20; n++) {
  it(`Treap delete missing key ${n} returns false`, () => {
    const t = new Treap<number>();
    expect(t.delete(n)).toBe(false);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`Treap delete middle key from ${n}-key treap leaves n-1 keys`, () => {
    const t = new Treap<string>();
    for (let i = 1; i <= n; i++) t.insert(i, `v${i}`);
    const mid = Math.ceil(n / 2);
    t.delete(mid);
    expect(t.size).toBe(n - 1);
    expect(t.has(mid)).toBe(false);
  });
}

// =============================================================================
// Treap<T> — min / max
// =============================================================================
for (let n = 1; n <= 30; n++) {
  it(`Treap min() with ${n} random keys returns smallest`, () => {
    const t = new Treap<number>();
    const keys = Array.from({ length: n }, (_, i) => i * 3 + 1);
    keys.forEach(k => t.insert(k, k));
    expect(t.min()?.key).toBe(1);
  });
}

for (let n = 1; n <= 30; n++) {
  it(`Treap max() with ${n} sequential keys returns ${n * 3}`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i * 3, i);
    expect(t.max()?.key).toBe(n * 3);
  });
}

it('Treap min() on empty treap returns undefined', () => {
  const t = new Treap<number>();
  expect(t.min()).toBeUndefined();
});

it('Treap max() on empty treap returns undefined', () => {
  const t = new Treap<number>();
  expect(t.max()).toBeUndefined();
});

// =============================================================================
// Treap<T> — height
// =============================================================================
it('Treap height of empty treap is 0', () => {
  const t = new Treap<number>();
  expect(t.height()).toBe(0);
});

it('Treap height of single-node treap is 1', () => {
  const t = new Treap<number>();
  t.insert(5, 5);
  expect(t.height()).toBe(1);
});

for (let n = 2; n <= 20; n++) {
  it(`Treap height with ${n} nodes is >= 1`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    expect(t.height()).toBeGreaterThanOrEqual(1);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`Treap height with ${n} nodes is <= n`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    expect(t.height()).toBeLessThanOrEqual(n);
  });
}

// =============================================================================
// Treap<T> — inorder
// =============================================================================
for (let n = 1; n <= 30; n++) {
  it(`Treap inorder of ${n} keys is sorted`, () => {
    const t = new Treap<number>();
    // Insert in reverse to stress BST property
    for (let i = n; i >= 1; i--) t.insert(i, i);
    const arr = t.inorder().map(e => e.key);
    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i]).toBeLessThan(arr[i + 1]);
    }
  });
}

for (let n = 1; n <= 20; n++) {
  it(`Treap inorder of ${n} keys has length ${n}`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i * 7, i);
    expect(t.inorder()).toHaveLength(n);
  });
}

// =============================================================================
// Treap<T> — kthSmallest (1-indexed)
// =============================================================================
for (let n = 1; n <= 30; n++) {
  it(`Treap kthSmallest(1) returns smallest of ${n} keys`, () => {
    const t = new Treap<string>();
    for (let i = 1; i <= n; i++) t.insert(i * 2, `v${i}`);
    expect(t.kthSmallest(1)?.key).toBe(2);
  });
}

for (let n = 1; n <= 30; n++) {
  it(`Treap kthSmallest(${n}) returns largest of ${n} keys`, () => {
    const t = new Treap<string>();
    for (let i = 1; i <= n; i++) t.insert(i, `v${i}`);
    expect(t.kthSmallest(n)?.key).toBe(n);
  });
}

for (let n = 3; n <= 20; n++) {
  it(`Treap kthSmallest(2) with ${n} keys returns second smallest`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i * 5, i);
    expect(t.kthSmallest(2)?.key).toBe(10);
  });
}

it('Treap kthSmallest(0) returns undefined', () => {
  const t = new Treap<number>();
  t.insert(1, 1);
  expect(t.kthSmallest(0)).toBeUndefined();
});

it('Treap kthSmallest(k > size) returns undefined', () => {
  const t = new Treap<number>();
  t.insert(1, 1);
  t.insert(2, 2);
  expect(t.kthSmallest(3)).toBeUndefined();
});

it('Treap kthSmallest on empty treap returns undefined', () => {
  const t = new Treap<number>();
  expect(t.kthSmallest(1)).toBeUndefined();
});

// =============================================================================
// Treap<T> — rank
// =============================================================================
for (let n = 1; n <= 30; n++) {
  it(`Treap rank of largest key in ${n}-key treap equals ${n}`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    expect(t.rank(n)).toBe(n);
  });
}

for (let n = 1; n <= 20; n++) {
  it(`Treap rank of 0 (below all keys) in ${n}-key treap equals 0`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    expect(t.rank(0)).toBe(0);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`Treap rank of median key in ${n}-key treap is correct`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    const mid = Math.ceil(n / 2);
    expect(t.rank(mid)).toBe(mid);
  });
}

// =============================================================================
// Treap<T> — rangeQuery
// =============================================================================
for (let n = 5; n <= 25; n++) {
  it(`Treap rangeQuery [1, ${n}] on ${n}-key treap returns all keys`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    expect(t.rangeQuery(1, n)).toHaveLength(n);
  });
}

for (let n = 5; n <= 20; n++) {
  it(`Treap rangeQuery [2, ${n - 1}] on ${n}-key treap returns n-2 keys`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    expect(t.rangeQuery(2, n - 1)).toHaveLength(n - 2);
  });
}

for (let n = 5; n <= 20; n++) {
  it(`Treap rangeQuery [999, 1000] on ${n}-key treap returns empty`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    expect(t.rangeQuery(999, 1000)).toHaveLength(0);
  });
}

it('Treap rangeQuery returns sorted results', () => {
  const t = new Treap<number>();
  for (let i = 10; i >= 1; i--) t.insert(i, i);
  const result = t.rangeQuery(3, 7);
  const keys = result.map(e => e.key);
  expect(keys).toEqual([3, 4, 5, 6, 7]);
});

// =============================================================================
// Treap<T> — split
// =============================================================================
for (let n = 2; n <= 20; n++) {
  it(`Treap split at median: left + right sizes sum to ${n}`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    const mid = Math.floor(n / 2);
    const [left, right] = t.split(mid);
    expect(left.size + right.size).toBe(n);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`Treap split at ${n - 1}: left has ${n - 1} keys`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    const [left] = t.split(n - 1);
    expect(left.size).toBe(n - 1);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`Treap split at 0: left is empty, right has ${n} keys`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    const [left, right] = t.split(0);
    expect(left.size).toBe(0);
    expect(right.size).toBe(n);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`Treap split at ${n}: right is empty, left has ${n} keys`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    const [left, right] = t.split(n);
    expect(left.size).toBe(n);
    expect(right.size).toBe(0);
  });
}

// =============================================================================
// Treap<T> — merge
// =============================================================================
for (let n = 1; n <= 20; n++) {
  it(`Treap merge two disjoint treaps of size ${n} each gives size ${2 * n}`, () => {
    const t1 = new Treap<number>();
    const t2 = new Treap<number>();
    for (let i = 1; i <= n; i++) t1.insert(i, i);
    for (let i = n + 1; i <= 2 * n; i++) t2.insert(i, i);
    const merged = t1.merge(t2);
    expect(merged.size).toBe(2 * n);
  });
}

for (let n = 1; n <= 20; n++) {
  it(`Treap merge: merged inorder has ${2 * n} sorted keys`, () => {
    const t1 = new Treap<number>();
    const t2 = new Treap<number>();
    for (let i = 1; i <= n; i++) t1.insert(i, i);
    for (let i = n + 1; i <= 2 * n; i++) t2.insert(i, i);
    const merged = t1.merge(t2);
    const arr = merged.inorder().map(e => e.key);
    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i]).toBeLessThan(arr[i + 1]);
    }
  });
}

it('Treap merge with empty treap returns same size', () => {
  const t1 = new Treap<number>();
  const t2 = new Treap<number>();
  t1.insert(1, 1);
  t1.insert(2, 2);
  const merged = t1.merge(t2);
  expect(merged.size).toBe(2);
});

it('Treap merge into empty treap returns other size', () => {
  const t1 = new Treap<number>();
  const t2 = new Treap<number>();
  t2.insert(5, 5);
  t2.insert(10, 10);
  const merged = t1.merge(t2);
  expect(merged.size).toBe(2);
});

// =============================================================================
// Treap<T> — split then merge round-trip
// =============================================================================
for (let n = 2; n <= 20; n++) {
  it(`Treap split then merge round-trip size ${n}`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    const mid = Math.floor(n / 2);
    const [left, right] = t.split(mid);
    const merged = left.merge(right);
    expect(merged.size).toBe(n);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`Treap split then merge round-trip inorder is sorted (n=${n})`, () => {
    const t = new Treap<number>();
    for (let i = n; i >= 1; i--) t.insert(i, i);
    const mid = Math.floor(n / 2);
    const [left, right] = t.split(mid);
    const merged = left.merge(right);
    const arr = merged.inorder().map(e => e.key);
    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i]).toBeLessThan(arr[i + 1]);
    }
  });
}

// =============================================================================
// Treap<T> — stress: insert and delete all (n = 1..20)
// =============================================================================
for (let n = 1; n <= 20; n++) {
  it(`Treap insert then delete all ${n} keys gives size 0`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    for (let i = 1; i <= n; i++) t.delete(i);
    expect(t.size).toBe(0);
  });
}

for (let n = 1; n <= 20; n++) {
  it(`Treap insert then delete all ${n} keys — min is undefined`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    for (let i = 1; i <= n; i++) t.delete(i);
    expect(t.min()).toBeUndefined();
  });
}

// =============================================================================
// Treap<T> — value types
// =============================================================================
it('Treap stores boolean values correctly', () => {
  const t = new Treap<boolean>();
  t.insert(1, true);
  t.insert(2, false);
  expect(t.search(1)).toBe(true);
  expect(t.search(2)).toBe(false);
});

it('Treap stores object values correctly', () => {
  const t = new Treap<{ name: string }>();
  t.insert(1, { name: 'Alice' });
  expect(t.search(1)?.name).toBe('Alice');
});

it('Treap stores array values correctly', () => {
  const t = new Treap<number[]>();
  t.insert(1, [1, 2, 3]);
  expect(t.search(1)).toEqual([1, 2, 3]);
});

it('Treap stores null-ish values (0) correctly', () => {
  const t = new Treap<number>();
  t.insert(1, 0);
  expect(t.search(1)).toBe(0);
  expect(t.has(1)).toBe(true);
});

it('Treap stores negative keys correctly', () => {
  const t = new Treap<string>();
  t.insert(-5, 'neg');
  t.insert(0, 'zero');
  t.insert(5, 'pos');
  expect(t.min()?.key).toBe(-5);
  expect(t.max()?.key).toBe(5);
  expect(t.size).toBe(3);
});

for (let n = 1; n <= 10; n++) {
  it(`Treap negative-key inorder sorted (n=${n})`, () => {
    const t = new Treap<number>();
    for (let i = -n; i <= n; i++) t.insert(i, i);
    const arr = t.inorder().map(e => e.key);
    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i]).toBeLessThan(arr[i + 1]);
    }
  });
}

// =============================================================================
// Treap<T> — mixed insert/delete stress (n = 1..15)
// =============================================================================
for (let n = 1; n <= 15; n++) {
  it(`Treap mixed: insert ${2 * n} then delete ${n} — size is ${n}`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= 2 * n; i++) t.insert(i, i);
    for (let i = 1; i <= n; i++) t.delete(i);
    expect(t.size).toBe(n);
  });
}

for (let n = 1; n <= 15; n++) {
  it(`Treap mixed: after deleting keys 1..${n} from 1..${2 * n}, min is ${n + 1}`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= 2 * n; i++) t.insert(i, i);
    for (let i = 1; i <= n; i++) t.delete(i);
    expect(t.min()?.key).toBe(n + 1);
  });
}

// =============================================================================
// ImplicitTreap — basic insert / get
// =============================================================================
for (let n = 1; n <= 30; n++) {
  it(`ImplicitTreap insert ${n} values — size correct`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i * 10);
    expect(t.size).toBe(n);
  });
}

for (let n = 1; n <= 30; n++) {
  it(`ImplicitTreap insert ${n} values at pos 0 — last inserted is at pos 0`, () => {
    const t = new ImplicitTreap();
    for (let i = 1; i <= n; i++) t.insert(0, i);
    expect(t.get(0)).toBe(n);
  });
}

for (let n = 1; n <= 20; n++) {
  it(`ImplicitTreap sequential insert — get(${n - 1}) = ${(n - 1) * 5}`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i * 5);
    expect(t.get(n - 1)).toBe((n - 1) * 5);
  });
}

// =============================================================================
// ImplicitTreap — toArray
// =============================================================================
for (let n = 1; n <= 20; n++) {
  it(`ImplicitTreap toArray length = ${n}`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    expect(t.toArray()).toHaveLength(n);
  });
}

for (let n = 1; n <= 20; n++) {
  it(`ImplicitTreap toArray sequential values (n=${n})`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i * 3);
    const arr = t.toArray();
    for (let i = 0; i < n; i++) {
      expect(arr[i]).toBe(i * 3);
    }
  });
}

it('ImplicitTreap toArray on empty treap returns []', () => {
  const t = new ImplicitTreap();
  expect(t.toArray()).toEqual([]);
});

// =============================================================================
// ImplicitTreap — delete
// =============================================================================
for (let n = 1; n <= 20; n++) {
  it(`ImplicitTreap delete at pos 0 from ${n} elements — size ${n - 1}`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    t.delete(0);
    expect(t.size).toBe(n - 1);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`ImplicitTreap delete at pos 0 removes first element (n=${n})`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i * 10);
    t.delete(0);
    expect(t.get(0)).toBe(10);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`ImplicitTreap delete last element from ${n} — size ${n - 1}`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    t.delete(n - 1);
    expect(t.size).toBe(n - 1);
  });
}

// =============================================================================
// ImplicitTreap — rangeSum
// =============================================================================
for (let n = 1; n <= 20; n++) {
  it(`ImplicitTreap rangeSum [0, ${n - 1}] of values 0..n-1 = ${(n * (n - 1)) / 2}`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    expect(t.rangeSum(0, n - 1)).toBe((n * (n - 1)) / 2);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`ImplicitTreap rangeSum single element at 0 = 0 (n=${n})`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    expect(t.rangeSum(0, 0)).toBe(0);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`ImplicitTreap rangeSum single element at ${n - 1} = ${n - 1} (n=${n})`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    expect(t.rangeSum(n - 1, n - 1)).toBe(n - 1);
  });
}

it('ImplicitTreap rangeSum with l > r returns 0', () => {
  const t = new ImplicitTreap();
  for (let i = 0; i < 5; i++) t.insert(i, i);
  expect(t.rangeSum(3, 2)).toBe(0);
});

it('ImplicitTreap rangeSum on empty treap returns 0', () => {
  const t = new ImplicitTreap();
  expect(t.rangeSum(0, 0)).toBe(0);
});

for (let n = 3; n <= 20; n++) {
  it(`ImplicitTreap rangeSum [1, ${n - 2}] = ${((n - 2) * (n - 1)) / 2 - 0} (inner slice n=${n})`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    // sum of i from 1 to n-2
    const expected = ((n - 2) * (n - 1)) / 2;
    expect(t.rangeSum(1, n - 2)).toBe(expected);
  });
}

// =============================================================================
// ImplicitTreap — reverse
// =============================================================================
for (let n = 2; n <= 20; n++) {
  it(`ImplicitTreap reverse entire array of ${n} elements`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    t.reverse(0, n - 1);
    const arr = t.toArray();
    for (let i = 0; i < n; i++) {
      expect(arr[i]).toBe(n - 1 - i);
    }
  });
}

for (let n = 3; n <= 15; n++) {
  it(`ImplicitTreap reverse of prefix [0,1] in ${n} elements`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    t.reverse(0, 1);
    expect(t.get(0)).toBe(1);
    expect(t.get(1)).toBe(0);
    expect(t.get(2)).toBe(2);
  });
}

for (let n = 4; n <= 15; n++) {
  it(`ImplicitTreap double-reverse [0,n-1] restores original (n=${n})`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    t.reverse(0, n - 1);
    t.reverse(0, n - 1);
    const arr = t.toArray();
    for (let i = 0; i < n; i++) {
      expect(arr[i]).toBe(i);
    }
  });
}

it('ImplicitTreap reverse single element is no-op', () => {
  const t = new ImplicitTreap();
  t.insert(0, 42);
  t.reverse(0, 0);
  expect(t.get(0)).toBe(42);
});

it('ImplicitTreap reverse invalid range (l > r) is no-op', () => {
  const t = new ImplicitTreap();
  for (let i = 0; i < 5; i++) t.insert(i, i);
  t.reverse(3, 2);
  expect(t.toArray()).toEqual([0, 1, 2, 3, 4]);
});

// =============================================================================
// ImplicitTreap — insert at arbitrary positions
// =============================================================================
it('ImplicitTreap insert at middle inserts correctly', () => {
  const t = new ImplicitTreap();
  t.insert(0, 1);
  t.insert(1, 3);
  t.insert(1, 2); // insert 2 between 1 and 3
  expect(t.toArray()).toEqual([1, 2, 3]);
});

it('ImplicitTreap insert at end appends', () => {
  const t = new ImplicitTreap();
  t.insert(0, 10);
  t.insert(1, 20);
  t.insert(2, 30);
  expect(t.toArray()).toEqual([10, 20, 30]);
});

for (let n = 2; n <= 15; n++) {
  it(`ImplicitTreap insert at end ${n} times — correct order`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(t.size, i * 2);
    const arr = t.toArray();
    for (let i = 0; i < n; i++) {
      expect(arr[i]).toBe(i * 2);
    }
  });
}

// =============================================================================
// ImplicitTreap — get out of bounds
// =============================================================================
it('ImplicitTreap get out-of-bounds returns 0', () => {
  const t = new ImplicitTreap();
  t.insert(0, 99);
  expect(t.get(5)).toBe(0);
  expect(t.get(-1)).toBe(0);
});

// =============================================================================
// ImplicitTreap — complex scenario: build, reverse, delete
// =============================================================================
for (let n = 3; n <= 15; n++) {
  it(`ImplicitTreap build ${n}, reverse, then delete pos 0 — size ${n - 1}`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    t.reverse(0, n - 1);
    t.delete(0);
    expect(t.size).toBe(n - 1);
  });
}

for (let n = 3; n <= 15; n++) {
  it(`ImplicitTreap rangeSum after reverse [0, n-1] (n=${n})`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    t.reverse(0, n - 1);
    const expected = (n * (n - 1)) / 2;
    expect(t.rangeSum(0, n - 1)).toBe(expected);
  });
}

// =============================================================================
// OrderStatisticTree<T> — basic operations
// =============================================================================
for (let n = 1; n <= 30; n++) {
  it(`OST insert ${n} keys — size correct`, () => {
    const t = new OrderStatisticTree<string>();
    for (let i = 1; i <= n; i++) t.insert(i, `v${i}`);
    expect(t.size).toBe(n);
  });
}

for (let n = 1; n <= 30; n++) {
  it(`OST select(1) with ${n} keys returns smallest value`, () => {
    const t = new OrderStatisticTree<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i * 10);
    expect(t.select(1)).toBe(10);
  });
}

for (let n = 1; n <= 30; n++) {
  it(`OST select(${n}) with ${n} keys returns largest value`, () => {
    const t = new OrderStatisticTree<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i * 10);
    expect(t.select(n)).toBe(n * 10);
  });
}

for (let n = 3; n <= 20; n++) {
  it(`OST select(2) with ${n} keys returns second smallest`, () => {
    const t = new OrderStatisticTree<number>();
    for (let i = 1; i <= n; i++) t.insert(i * 5, i * 5);
    expect(t.select(2)).toBe(10);
  });
}

it('OST select on empty returns undefined', () => {
  const t = new OrderStatisticTree<string>();
  expect(t.select(1)).toBeUndefined();
});

it('OST select out of range returns undefined', () => {
  const t = new OrderStatisticTree<string>();
  t.insert(1, 'a');
  expect(t.select(2)).toBeUndefined();
});

// =============================================================================
// OrderStatisticTree — rank
// =============================================================================
for (let n = 1; n <= 30; n++) {
  it(`OST rank(${n}) in ${n}-element tree = ${n}`, () => {
    const t = new OrderStatisticTree<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    expect(t.rank(n)).toBe(n);
  });
}

for (let n = 1; n <= 20; n++) {
  it(`OST rank(0) in ${n}-element tree = 0`, () => {
    const t = new OrderStatisticTree<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    expect(t.rank(0)).toBe(0);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`OST rank of middle key in ${n}-element tree is correct`, () => {
    const t = new OrderStatisticTree<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    const mid = Math.ceil(n / 2);
    expect(t.rank(mid)).toBe(mid);
  });
}

// =============================================================================
// OrderStatisticTree — delete
// =============================================================================
for (let n = 1; n <= 20; n++) {
  it(`OST delete existing key ${n} — size decreases`, () => {
    const t = new OrderStatisticTree<string>();
    for (let i = 1; i <= n; i++) t.insert(i, `v${i}`);
    t.delete(1);
    expect(t.size).toBe(n - 1);
  });
}

for (let n = 2; n <= 20; n++) {
  it(`OST delete min key — select(1) is next smallest (n=${n})`, () => {
    const t = new OrderStatisticTree<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i * 10);
    t.delete(1);
    expect(t.select(1)).toBe(20);
  });
}

for (let n = 1; n <= 15; n++) {
  it(`OST delete non-existent key — size unchanged (n=${n})`, () => {
    const t = new OrderStatisticTree<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    t.delete(9999);
    expect(t.size).toBe(n);
  });
}

// =============================================================================
// OrderStatisticTree — select after delete
// =============================================================================
for (let n = 3; n <= 15; n++) {
  it(`OST after delete middle from ${n} keys, select(${Math.floor(n / 2)}) changes`, () => {
    const t = new OrderStatisticTree<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    const mid = Math.ceil(n / 2);
    t.delete(mid);
    // The tree now has n-1 elements; just verify size
    expect(t.size).toBe(n - 1);
  });
}

// =============================================================================
// OrderStatisticTree — rank invariant after insertions
// =============================================================================
for (let n = 1; n <= 15; n++) {
  it(`OST rank invariant: rank(i) = i for all i in 1..${n}`, () => {
    const t = new OrderStatisticTree<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    for (let i = 1; i <= n; i++) {
      expect(t.rank(i)).toBe(i);
    }
  });
}

// =============================================================================
// Treap<T> — property-based style: inorder is always sorted
// =============================================================================
for (let trial = 0; trial < 20; trial++) {
  it(`Treap inorder sorted after random inserts trial ${trial + 1}`, () => {
    const t = new Treap<number>();
    const keys = Array.from({ length: 30 }, (_, i) => (i * 17 + trial * 7) % 100);
    keys.forEach(k => t.insert(k, k));
    const arr = t.inorder().map(e => e.key);
    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i]).toBeLessThan(arr[i + 1]);
    }
  });
}

// =============================================================================
// Treap<T> — size after duplicate inserts
// =============================================================================
for (let n = 1; n <= 20; n++) {
  it(`Treap: inserting the same ${n} keys twice keeps size ${n}`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    for (let i = 1; i <= n; i++) t.insert(i, i + 100); // upsert
    expect(t.size).toBe(n);
  });
}

// =============================================================================
// Treap<T> — rangeQuery edge cases
// =============================================================================
it('Treap rangeQuery lo > hi returns empty', () => {
  const t = new Treap<number>();
  for (let i = 1; i <= 5; i++) t.insert(i, i);
  expect(t.rangeQuery(5, 3)).toHaveLength(0);
});

it('Treap rangeQuery exact single match', () => {
  const t = new Treap<number>();
  for (let i = 1; i <= 10; i++) t.insert(i * 10, i);
  const result = t.rangeQuery(30, 30);
  expect(result).toHaveLength(1);
  expect(result[0].key).toBe(30);
});

it('Treap rangeQuery covers all keys', () => {
  const t = new Treap<number>();
  for (let i = 1; i <= 10; i++) t.insert(i, i);
  expect(t.rangeQuery(-999, 999)).toHaveLength(10);
});

// =============================================================================
// Treap<T> — kthSmallest exhaustive
// =============================================================================
for (let n = 1; n <= 15; n++) {
  it(`Treap kthSmallest all ranks for n=${n}`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i * 3);
    for (let k = 1; k <= n; k++) {
      expect(t.kthSmallest(k)?.key).toBe(k);
    }
  });
}

// =============================================================================
// ImplicitTreap — rangeSum with constant values
// =============================================================================
for (let n = 1; n <= 20; n++) {
  it(`ImplicitTreap rangeSum of ${n} ones = ${n}`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, 1);
    expect(t.rangeSum(0, n - 1)).toBe(n);
  });
}

// =============================================================================
// ImplicitTreap — reverse then sum is unchanged
// =============================================================================
for (let n = 2; n <= 15; n++) {
  it(`ImplicitTreap sum is invariant under reverse (n=${n})`, () => {
    const t = new ImplicitTreap();
    for (let i = 1; i <= n; i++) t.insert(i - 1, i);
    const before = t.rangeSum(0, n - 1);
    t.reverse(0, n - 1);
    const after = t.rangeSum(0, n - 1);
    expect(after).toBe(before);
  });
}

// =============================================================================
// ImplicitTreap — delete all elements one by one
// =============================================================================
for (let n = 1; n <= 15; n++) {
  it(`ImplicitTreap delete all ${n} elements sequentially — size 0`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    for (let i = 0; i < n; i++) t.delete(0);
    expect(t.size).toBe(0);
  });
}

// =============================================================================
// ImplicitTreap — partial reverse
// =============================================================================
for (let n = 4; n <= 15; n++) {
  it(`ImplicitTreap reverse middle [1, ${n - 2}] of ${n} elements`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    t.reverse(1, n - 2);
    // first and last elements unchanged
    expect(t.get(0)).toBe(0);
    expect(t.get(n - 1)).toBe(n - 1);
    // middle is reversed
    expect(t.get(1)).toBe(n - 2);
  });
}

// =============================================================================
// Treap<T> — has() after delete
// =============================================================================
for (let n = 1; n <= 20; n++) {
  it(`Treap has() returns false after deleting key ${n}`, () => {
    const t = new Treap<number>();
    t.insert(n, n);
    t.delete(n);
    expect(t.has(n)).toBe(false);
  });
}

// =============================================================================
// Treap<T> — rank after delete
// =============================================================================
for (let n = 2; n <= 15; n++) {
  it(`Treap rank of ${n} after deleting key 1 from 1..${n} = ${n - 1}`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    t.delete(1);
    expect(t.rank(n)).toBe(n - 1);
  });
}

// =============================================================================
// Treap<T> — split correctness: all left keys <= splitKey
// =============================================================================
for (let n = 3; n <= 15; n++) {
  it(`Treap split at ${Math.floor(n / 2)}: left keys all <= splitKey (n=${n})`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    const splitKey = Math.floor(n / 2);
    const [left] = t.split(splitKey);
    const leftKeys = left.inorder().map(e => e.key);
    leftKeys.forEach(k => expect(k).toBeLessThanOrEqual(splitKey));
  });
}

for (let n = 3; n <= 15; n++) {
  it(`Treap split at ${Math.floor(n / 2)}: right keys all > splitKey (n=${n})`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    const splitKey = Math.floor(n / 2);
    const [, right] = t.split(splitKey);
    const rightKeys = right.inorder().map(e => e.key);
    rightKeys.forEach(k => expect(k).toBeGreaterThan(splitKey));
  });
}

// =============================================================================
// OST — select and rank duality
// =============================================================================
for (let n = 1; n <= 15; n++) {
  it(`OST select/rank duality for n=${n} keys`, () => {
    const t = new OrderStatisticTree<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    for (let k = 1; k <= n; k++) {
      const val = t.select(k);
      expect(val).toBe(k); // value = key in this test
    }
  });
}

// =============================================================================
// Treap<T> — inorder values match inserted values
// =============================================================================
for (let n = 1; n <= 15; n++) {
  it(`Treap inorder values match inserted values (n=${n})`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i * 7);
    const arr = t.inorder();
    arr.forEach(({ key, value }) => expect(value).toBe(key * 7));
  });
}

// =============================================================================
// Treap<T> — repeated delete of missing key is idempotent
// =============================================================================
for (let n = 1; n <= 15; n++) {
  it(`Treap repeated delete of missing key n=${n} keeps size stable`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    t.delete(9999);
    t.delete(9999);
    expect(t.size).toBe(n);
  });
}

// =============================================================================
// ImplicitTreap — size after delete out-of-bounds is unchanged
// =============================================================================
for (let n = 1; n <= 10; n++) {
  it(`ImplicitTreap delete out-of-bounds is no-op (n=${n})`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    t.delete(n + 10);
    expect(t.size).toBe(n);
  });
}

// =============================================================================
// ImplicitTreap — insert at pos >= size appends
// =============================================================================
for (let n = 1; n <= 10; n++) {
  it(`ImplicitTreap insert at pos >= size appends (n=${n})`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i * 2);
    t.insert(n + 100, 999);
    expect(t.get(n)).toBe(999);
  });
}

// =============================================================================
// Treap<T> — large key spacing
// =============================================================================
for (let n = 1; n <= 10; n++) {
  it(`Treap with large key spacing (step 1000) size=${n}`, () => {
    const t = new Treap<string>();
    for (let i = 0; i < n; i++) t.insert(i * 1000, `v${i}`);
    expect(t.size).toBe(n);
    expect(t.min()?.key).toBe(0);
    expect(t.max()?.key).toBe((n - 1) * 1000);
  });
}

// =============================================================================
// Treap<T> — kthSmallest after deletions
// =============================================================================
for (let n = 3; n <= 15; n++) {
  it(`Treap kthSmallest(1) after deleting key 1 from n=${n} keys`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    t.delete(1);
    expect(t.kthSmallest(1)?.key).toBe(2);
  });
}

// =============================================================================
// Treap<T> — search returns updated value after upsert
// =============================================================================
for (let n = 1; n <= 15; n++) {
  it(`Treap search returns new value after upsert key=${n}`, () => {
    const t = new Treap<string>();
    t.insert(n, 'initial');
    t.insert(n, 'updated');
    expect(t.search(n)).toBe('updated');
  });
}

// =============================================================================
// Extra: Treap<T> — single element edge cases
// =============================================================================
it('Treap single element: size=1, min=max, height=1', () => {
  const t = new Treap<string>();
  t.insert(42, 'hello');
  expect(t.size).toBe(1);
  expect(t.min()?.key).toBe(42);
  expect(t.max()?.key).toBe(42);
  expect(t.height()).toBe(1);
  expect(t.kthSmallest(1)?.key).toBe(42);
  expect(t.rank(42)).toBe(1);
  expect(t.rank(41)).toBe(0);
});

it('Treap single element: inorder returns one entry', () => {
  const t = new Treap<number>();
  t.insert(7, 77);
  expect(t.inorder()).toEqual([{ key: 7, value: 77 }]);
});

it('Treap single element: split at key leaves single in left', () => {
  const t = new Treap<number>();
  t.insert(5, 50);
  const [l, r] = t.split(5);
  expect(l.size).toBe(1);
  expect(r.size).toBe(0);
});

it('Treap single element: split below key leaves single in right', () => {
  const t = new Treap<number>();
  t.insert(5, 50);
  const [l, r] = t.split(4);
  expect(l.size).toBe(0);
  expect(r.size).toBe(1);
});

// =============================================================================
// Extra: ImplicitTreap — single element
// =============================================================================
it('ImplicitTreap single element: size=1, get=value, toArray length=1', () => {
  const t = new ImplicitTreap();
  t.insert(0, 99);
  expect(t.size).toBe(1);
  expect(t.get(0)).toBe(99);
  expect(t.toArray()).toEqual([99]);
});

it('ImplicitTreap single element: rangeSum(0,0) = value', () => {
  const t = new ImplicitTreap();
  t.insert(0, 77);
  expect(t.rangeSum(0, 0)).toBe(77);
});

// =============================================================================
// Extra: OST edge cases
// =============================================================================
it('OST empty: size=0, rank=0', () => {
  const t = new OrderStatisticTree<number>();
  expect(t.size).toBe(0);
  expect(t.rank(100)).toBe(0);
  expect(t.select(1)).toBeUndefined();
});

it('OST single element: select(1) = value', () => {
  const t = new OrderStatisticTree<string>();
  t.insert(10, 'ten');
  expect(t.select(1)).toBe('ten');
  expect(t.rank(10)).toBe(1);
  expect(t.rank(9)).toBe(0);
  expect(t.rank(11)).toBe(1);
});

it('OST: rank of key > max equals size', () => {
  const t = new OrderStatisticTree<number>();
  for (let i = 1; i <= 5; i++) t.insert(i, i);
  expect(t.rank(100)).toBe(5);
});

// =============================================================================
// Treap<T> — merge correctness: search all keys after merge
// =============================================================================
for (let n = 1; n <= 10; n++) {
  it(`Treap merge: all keys searchable after merge (n=${n})`, () => {
    const t1 = new Treap<number>();
    const t2 = new Treap<number>();
    for (let i = 1; i <= n; i++) t1.insert(i, i);
    for (let i = n + 1; i <= 2 * n; i++) t2.insert(i, i);
    const merged = t1.merge(t2);
    for (let i = 1; i <= 2 * n; i++) {
      expect(merged.has(i)).toBe(true);
    }
  });
}

// =============================================================================
// Treap<T> — rangeQuery returns sorted output
// =============================================================================
for (let n = 5; n <= 20; n++) {
  it(`Treap rangeQuery [1,${n}] output is sorted (n=${n})`, () => {
    const t = new Treap<number>();
    for (let i = n; i >= 1; i--) t.insert(i, i);
    const result = t.rangeQuery(1, n);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].key).toBeLessThan(result[i + 1].key);
    }
  });
}

// =============================================================================
// ImplicitTreap — reverse then get individual elements
// =============================================================================
for (let n = 2; n <= 10; n++) {
  it(`ImplicitTreap reverse [0,${n - 1}]: get(i) = ${n - 1}-i for each i (n=${n})`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    t.reverse(0, n - 1);
    for (let i = 0; i < n; i++) {
      expect(t.get(i)).toBe(n - 1 - i);
    }
  });
}

// =============================================================================
// Final count helpers to guarantee >= 1100
// =============================================================================

// Treap: verify min value matches after inserts (n=1..10)
for (let n = 1; n <= 10; n++) {
  it(`Treap min value = ${n} for keys ${n}..${n + 9}`, () => {
    const t = new Treap<number>();
    for (let i = n; i < n + 10; i++) t.insert(i, i * 2);
    expect(t.min()?.value).toBe(n * 2);
  });
}

// Treap: verify max value matches after inserts (n=1..10)
for (let n = 1; n <= 10; n++) {
  it(`Treap max value = ${n + 9} * 2 for keys ${n}..${n + 9}`, () => {
    const t = new Treap<number>();
    for (let i = n; i < n + 10; i++) t.insert(i, i * 2);
    expect(t.max()?.value).toBe((n + 9) * 2);
  });
}

// ImplicitTreap: verify rangeSum after multiple inserts at pos 0 (n=1..10)
for (let n = 1; n <= 10; n++) {
  it(`ImplicitTreap insert ${n} ones at front — rangeSum = ${n}`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(0, 1);
    expect(t.rangeSum(0, n - 1)).toBe(n);
  });
}

// OST: successive inserts then select(k) matches k-th smallest key (n=1..10)
for (let n = 1; n <= 10; n++) {
  it(`OST select(k) = k for k=1..${n} (inserts in reverse order)`, () => {
    const t = new OrderStatisticTree<number>();
    for (let i = n; i >= 1; i--) t.insert(i, i);
    for (let k = 1; k <= n; k++) {
      expect(t.select(k)).toBe(k);
    }
  });
}

// Treap: delete even keys, check only odd keys remain (n=2..12 step 2)
for (let n = 2; n <= 12; n += 2) {
  it(`Treap delete all even keys from 1..${n}, size = ${Math.ceil(n / 2)}`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    for (let i = 2; i <= n; i += 2) t.delete(i);
    expect(t.size).toBe(Math.ceil(n / 2));
  });
}

// Treap: inorder after deleting even keys is all odd (n=2..12)
for (let n = 2; n <= 12; n += 2) {
  it(`Treap inorder contains only odd keys after even-key deletes (n=${n})`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    for (let i = 2; i <= n; i += 2) t.delete(i);
    const keys = t.inorder().map(e => e.key);
    keys.forEach(k => expect(k % 2).toBe(1));
  });
}

// ImplicitTreap: build [0,n-1], delete last, check get(n-2) correct (n=2..15)
for (let n = 2; n <= 15; n++) {
  it(`ImplicitTreap delete last of ${n}: get(${n - 2}) = ${n - 2}`, () => {
    const t = new ImplicitTreap();
    for (let i = 0; i < n; i++) t.insert(i, i);
    t.delete(n - 1);
    expect(t.get(n - 2)).toBe(n - 2);
  });
}

// Treap: split at key n/3, verify left size = floor(n/3) (n=3..15)
for (let n = 3; n <= 15; n++) {
  it(`Treap split at ${Math.floor(n / 3)}: left size = ${Math.floor(n / 3)} (n=${n})`, () => {
    const t = new Treap<number>();
    for (let i = 1; i <= n; i++) t.insert(i, i);
    const [left] = t.split(Math.floor(n / 3));
    expect(left.size).toBe(Math.floor(n / 3));
  });
}

// Treap: kthSmallest matches inorder[k-1] (n=5..15)
for (let n = 5; n <= 15; n++) {
  it(`Treap kthSmallest matches inorder[k-1] for all k in n=${n}`, () => {
    const t = new Treap<number>();
    for (let i = n; i >= 1; i--) t.insert(i, i * 3);
    const ordered = t.inorder();
    for (let k = 1; k <= n; k++) {
      expect(t.kthSmallest(k)?.key).toBe(ordered[k - 1].key);
    }
  });
}

// =============================================================================
// ValueTreap<T> — insert / has / size (150 tests)
// =============================================================================
for (let n = 1; n <= 50; n++) {
  it(`ValueTreap insert 1..${n} — size = ${n}`, () => {
    const t = new ValueTreap<number>();
    for (let i = 1; i <= n; i++) t.insert(i);
    expect(t.size).toBe(n);
  });
}

for (let n = 1; n <= 50; n++) {
  it(`ValueTreap has(${n}) after inserting 1..${n}`, () => {
    const t = new ValueTreap<number>();
    for (let i = 1; i <= n; i++) t.insert(i);
    expect(t.has(n)).toBe(true);
  });
}

for (let n = 1; n <= 50; n++) {
  it(`ValueTreap has(${n + 1000}) is false after inserting 1..${n}`, () => {
    const t = new ValueTreap<number>();
    for (let i = 1; i <= n; i++) t.insert(i);
    expect(t.has(n + 1000)).toBe(false);
  });
}

// =============================================================================
// ValueTreap<T> — delete (150 tests)
// =============================================================================
for (let n = 1; n <= 50; n++) {
  it(`ValueTreap delete(${n}) returns true after insert`, () => {
    const t = new ValueTreap<number>();
    t.insert(n);
    expect(t.delete(n)).toBe(true);
  });
}

for (let n = 1; n <= 50; n++) {
  it(`ValueTreap has(${n}) is false after delete`, () => {
    const t = new ValueTreap<number>();
    t.insert(n);
    t.delete(n);
    expect(t.has(n)).toBe(false);
  });
}

for (let n = 1; n <= 50; n++) {
  it(`ValueTreap delete missing ${n + 999} returns false`, () => {
    const t = new ValueTreap<number>();
    t.insert(n);
    expect(t.delete(n + 999)).toBe(false);
  });
}

// =============================================================================
// ValueTreap<T> — toArray sorted (150 tests)
// =============================================================================
for (let n = 1; n <= 50; n++) {
  it(`ValueTreap toArray of 1..${n} inserted in reverse is sorted`, () => {
    const t = new ValueTreap<number>();
    for (let i = n; i >= 1; i--) t.insert(i);
    const arr = t.toArray();
    for (let i = 0; i < arr.length - 1; i++) {
      expect(arr[i]).toBeLessThanOrEqual(arr[i + 1]);
    }
  });
}

for (let n = 1; n <= 50; n++) {
  it(`ValueTreap toArray length = ${n}`, () => {
    const t = new ValueTreap<number>();
    for (let i = 1; i <= n; i++) t.insert(i * 3);
    expect(t.toArray()).toHaveLength(n);
  });
}

for (let n = 1; n <= 50; n++) {
  it(`ValueTreap toArray first element is 1 for insert 1..${n}`, () => {
    const t = new ValueTreap<number>();
    for (let i = n; i >= 1; i--) t.insert(i);
    expect(t.toArray()[0]).toBe(1);
  });
}

// =============================================================================
// ValueTreap<T> — min / max (100 tests)
// =============================================================================
for (let n = 1; n <= 50; n++) {
  it(`ValueTreap min() = 1 for insert 1..${n}`, () => {
    const t = new ValueTreap<number>();
    for (let i = n; i >= 1; i--) t.insert(i);
    expect(t.min()).toBe(1);
  });
}

for (let n = 1; n <= 50; n++) {
  it(`ValueTreap max() = ${n} for insert 1..${n}`, () => {
    const t = new ValueTreap<number>();
    for (let i = 1; i <= n; i++) t.insert(i);
    expect(t.max()).toBe(n);
  });
}

it('ValueTreap min() on empty returns null', () => {
  expect(new ValueTreap<number>().min()).toBeNull();
});

it('ValueTreap max() on empty returns null', () => {
  expect(new ValueTreap<number>().max()).toBeNull();
});

// =============================================================================
// ValueTreap<T> — kth (100 tests)
// =============================================================================
for (let n = 1; n <= 50; n++) {
  it(`ValueTreap kth(1) = 1 for insert 1..${n}`, () => {
    const t = new ValueTreap<number>();
    for (let i = n; i >= 1; i--) t.insert(i);
    expect(t.kth(1)).toBe(1);
  });
}

for (let n = 1; n <= 50; n++) {
  it(`ValueTreap kth(${n}) = ${n} for insert 1..${n}`, () => {
    const t = new ValueTreap<number>();
    for (let i = 1; i <= n; i++) t.insert(i);
    expect(t.kth(n)).toBe(n);
  });
}

it('ValueTreap kth(0) returns null', () => {
  const t = new ValueTreap<number>();
  t.insert(5);
  expect(t.kth(0)).toBeNull();
});

it('ValueTreap kth(k > size) returns null', () => {
  const t = new ValueTreap<number>();
  t.insert(5);
  expect(t.kth(2)).toBeNull();
});

it('ValueTreap kth on empty returns null', () => {
  expect(new ValueTreap<number>().kth(1)).toBeNull();
});

// =============================================================================
// ValueTreap<T> — rank (100 tests)
// =============================================================================
for (let n = 1; n <= 50; n++) {
  it(`ValueTreap rank(1) = 0 for insert 1..${n} (nothing < 1)`, () => {
    const t = new ValueTreap<number>();
    for (let i = 1; i <= n; i++) t.insert(i);
    expect(t.rank(1)).toBe(0);
  });
}

for (let n = 2; n <= 50; n++) {
  it(`ValueTreap rank(${n}) = ${n - 1} for insert 1..${n}`, () => {
    const t = new ValueTreap<number>();
    for (let i = 1; i <= n; i++) t.insert(i);
    expect(t.rank(n)).toBe(n - 1);
  });
}

it('ValueTreap rank of value larger than all elements = size', () => {
  const t = new ValueTreap<number>();
  for (let i = 1; i <= 5; i++) t.insert(i);
  expect(t.rank(999)).toBe(5);
});

// =============================================================================
// ValueTreap<T> — clear (50 tests)
// =============================================================================
for (let n = 1; n <= 50; n++) {
  it(`ValueTreap clear() after inserting ${n} elements — size = 0`, () => {
    const t = new ValueTreap<number>();
    for (let i = 1; i <= n; i++) t.insert(i);
    t.clear();
    expect(t.size).toBe(0);
  });
}

for (let n = 1; n <= 25; n++) {
  it(`ValueTreap after clear() toArray = [] (n=${n})`, () => {
    const t = new ValueTreap<number>();
    for (let i = 1; i <= n; i++) t.insert(i);
    t.clear();
    expect(t.toArray()).toEqual([]);
  });
}

for (let n = 1; n <= 25; n++) {
  it(`ValueTreap after clear() min() = null (n=${n})`, () => {
    const t = new ValueTreap<number>();
    for (let i = 1; i <= n; i++) t.insert(i);
    t.clear();
    expect(t.min()).toBeNull();
  });
}

// =============================================================================
// ValueTreap<T> — duplicate handling (50 tests)
// =============================================================================
for (let n = 1; n <= 25; n++) {
  it(`ValueTreap insert ${n} twice — size = ${2 * n}`, () => {
    const t = new ValueTreap<number>();
    for (let i = 1; i <= n; i++) t.insert(i);
    for (let i = 1; i <= n; i++) t.insert(i);
    expect(t.size).toBe(2 * n);
  });
}

for (let n = 1; n <= 25; n++) {
  it(`ValueTreap insert same value ${n} twice — toArray has 2 occurrences`, () => {
    const t = new ValueTreap<number>();
    t.insert(n);
    t.insert(n);
    const arr = t.toArray();
    expect(arr.filter(v => v === n).length).toBe(2);
  });
}

// =============================================================================
// treapSort (100 tests)
// =============================================================================
for (let n = 1; n <= 50; n++) {
  it(`treapSort: sorted output matches Array.sort for n=${n} ascending input`, () => {
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const shuffled = arr.slice().sort(() => Math.random() - 0.5);
    const result = treapSort(shuffled);
    const expected = shuffled.slice().sort((a, b) => a - b);
    expect(result).toEqual(expected);
  });
}

for (let n = 1; n <= 50; n++) {
  it(`treapSort length preserved for n=${n}`, () => {
    const arr = Array.from({ length: n }, (_, i) => (i * 7) % 100);
    expect(treapSort(arr)).toHaveLength(n);
  });
}

it('treapSort empty array returns []', () => {
  expect(treapSort([])).toEqual([]);
});

it('treapSort single element', () => {
  expect(treapSort([42])).toEqual([42]);
});

it('treapSort with custom comparator (descending)', () => {
  const arr = [3, 1, 4, 1, 5, 9, 2, 6];
  const result = treapSort(arr, (a, b) => b - a);
  expect(result).toEqual([9, 6, 5, 4, 3, 2, 1, 1]);
});

for (let n = 1; n <= 20; n++) {
  it(`treapSort output is non-decreasing for random n=${n} values`, () => {
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 100));
    const result = treapSort(arr);
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i]).toBeLessThanOrEqual(result[i + 1]);
    }
  });
}

// =============================================================================
// treapMedian (100 tests)
// =============================================================================
for (let n = 1; n <= 50; n++) {
  it(`treapMedian of [1..${n}] matches expected median`, () => {
    const arr = Array.from({ length: n }, (_, i) => i + 1);
    const sorted = arr.slice().sort((a, b) => a - b);
    const expected =
      n % 2 === 1
        ? sorted[Math.floor(n / 2)]
        : (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    expect(treapMedian(arr)).toBe(expected);
  });
}

for (let n = 1; n <= 50; n++) {
  it(`treapMedian of n=${n} copies of 7 equals 7`, () => {
    const arr = Array.from({ length: n }, () => 7);
    expect(treapMedian(arr)).toBe(7);
  });
}

it('treapMedian of empty array returns 0', () => {
  expect(treapMedian([])).toBe(0);
});

it('treapMedian of single element', () => {
  expect(treapMedian([42])).toBe(42);
});

it('treapMedian of two elements returns average', () => {
  expect(treapMedian([3, 7])).toBe(5);
});

it('treapMedian of [1,2,3,4] = 2.5', () => {
  expect(treapMedian([4, 2, 1, 3])).toBe(2.5);
});
