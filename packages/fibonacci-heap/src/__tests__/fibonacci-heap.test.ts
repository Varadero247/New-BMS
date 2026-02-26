// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { FibonacciHeap, createFibonacciHeap, heapSort } from '../fibonacci-heap';

// ─── Helper ──────────────────────────────────────────────────────────────────
function makeHeap<T = number>() { return new FibonacciHeap<T>(); }
function range(n: number): number[] { return Array.from({ length: n }, (_, i) => i); }
function shuffle(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function drainKeys(h: FibonacciHeap<any>): number[] {
  const out: number[] = [];
  let m: { key: number } | null;
  while ((m = h.extractMin()) !== null) out.push(m.key);
  return out;
}

// =============================================================================
// 1. EMPTY HEAP
// =============================================================================
describe('1. Empty heap', () => {
  it('size is 0 on new heap', () => { expect(makeHeap().size).toBe(0); });
  it('isEmpty is true on new heap', () => { expect(makeHeap().isEmpty).toBe(true); });
  it('findMin returns null on empty', () => { expect(makeHeap().findMin()).toBeNull(); });
  it('extractMin returns null on empty', () => { expect(makeHeap().extractMin()).toBeNull(); });
  it('multiple extractMin calls on empty return null', () => {
    const h = makeHeap(); expect(h.extractMin()).toBeNull(); expect(h.extractMin()).toBeNull();
  });
  it('clear on empty keeps size 0', () => { const h = makeHeap(); h.clear(); expect(h.size).toBe(0); });
  it('toSortedArray on empty returns []', () => { expect(makeHeap().toSortedArray()).toEqual([]); });
  it('merge empty into empty keeps size 0', () => {
    const a = makeHeap(), b = makeHeap(); a.merge(b); expect(a.size).toBe(0);
  });
  it('createFibonacciHeap returns empty heap', () => {
    const h = createFibonacciHeap(); expect(h.isEmpty).toBe(true); expect(h.size).toBe(0);
  });
  it('createFibonacciHeap findMin is null', () => { expect(createFibonacciHeap().findMin()).toBeNull(); });

  for (let i = 0; i < 40; i++) {
    it(`empty heap invariant check #${i}`, () => {
      const h = makeHeap();
      expect(h.size).toBe(0);
      expect(h.isEmpty).toBe(true);
      expect(h.findMin()).toBeNull();
      expect(h.extractMin()).toBeNull();
      expect(h.toSortedArray()).toEqual([]);
    });
  }
});

// =============================================================================
// 2. INSERT + FIND MIN
// =============================================================================
describe('2. insert and findMin', () => {
  it('single insert: size becomes 1', () => { const h = makeHeap(); h.insert(5, 5); expect(h.size).toBe(1); });
  it('single insert: isEmpty false', () => { const h = makeHeap(); h.insert(5, 5); expect(h.isEmpty).toBe(false); });
  it('single insert: findMin key correct', () => { const h = makeHeap(); h.insert(5, 5); expect(h.findMin()!.key).toBe(5); });
  it('single insert: findMin value correct', () => { const h = makeHeap(); h.insert(3, 99); expect(h.findMin()!.value).toBe(99); });
  it('insert ascending: min tracks smallest', () => {
    const h = makeHeap();
    for (let i = 10; i >= 1; i--) h.insert(i, i);
    expect(h.findMin()!.key).toBe(1);
  });
  it('insert descending: min tracks smallest', () => {
    const h = makeHeap();
    for (let i = 1; i <= 10; i++) h.insert(i, i);
    expect(h.findMin()!.key).toBe(1);
  });
  it('insert 0: min is 0', () => { const h = makeHeap(); h.insert(0, 0); h.insert(5, 5); expect(h.findMin()!.key).toBe(0); });
  it('insert negative: min is negative', () => {
    const h = makeHeap(); h.insert(-10, -10); h.insert(5, 5); expect(h.findMin()!.key).toBe(-10);
  });
  it('insert all same key: min is that key', () => {
    const h = makeHeap(); for (let i = 0; i < 5; i++) h.insert(7, 7); expect(h.findMin()!.key).toBe(7);
  });
  it('insert returns node with correct key', () => {
    const h = makeHeap(); const n = h.insert(42, 42); expect(n.key).toBe(42);
  });
  it('insert returns node with correct value', () => {
    const h = makeHeap<string>(); const n = h.insert(1, 'hello'); expect(n.value).toBe('hello');
  });
  it('insert large key then small: min is small', () => {
    const h = makeHeap(); h.insert(1000, 1000); h.insert(1, 1); expect(h.findMin()!.key).toBe(1);
  });
  it('size increments correctly', () => {
    const h = makeHeap();
    for (let i = 0; i < 20; i++) { h.insert(i, i); expect(h.size).toBe(i + 1); }
  });

  for (let n = 1; n <= 50; n++) {
    it(`insert ${n} random elements: min is correct`, () => {
      const h = makeHeap();
      const keys = shuffle(range(n));
      for (const k of keys) h.insert(k, k);
      expect(h.findMin()!.key).toBe(0);
      expect(h.size).toBe(n);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`insert with negative keys batch #${i}`, () => {
      const h = makeHeap();
      const base = -50 + i;
      h.insert(base, base); h.insert(base + 100, base + 100);
      expect(h.findMin()!.key).toBe(base);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`insert with string values #${i}`, () => {
      const h = makeHeap<string>();
      h.insert(i, `value-${i}`);
      expect(h.findMin()!.value).toBe(`value-${i}`);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`findMin does not remove element #${i}`, () => {
      const h = makeHeap();
      h.insert(i + 1, i + 1);
      h.findMin();
      expect(h.size).toBe(1);
      h.findMin();
      expect(h.size).toBe(1);
    });
  }
});

// =============================================================================
// 3. EXTRACT MIN
// =============================================================================
describe('3. extractMin', () => {
  it('extractMin on single element returns that element', () => {
    const h = makeHeap(); h.insert(5, 5); expect(h.extractMin()!.key).toBe(5);
  });
  it('extractMin on single element leaves heap empty', () => {
    const h = makeHeap(); h.insert(5, 5); h.extractMin(); expect(h.isEmpty).toBe(true);
  });
  it('extractMin on single element: size becomes 0', () => {
    const h = makeHeap(); h.insert(5, 5); h.extractMin(); expect(h.size).toBe(0);
  });
  it('extractMin returns minimum of two elements', () => {
    const h = makeHeap(); h.insert(3, 3); h.insert(7, 7); expect(h.extractMin()!.key).toBe(3);
  });
  it('extractMin twice returns both in order', () => {
    const h = makeHeap(); h.insert(3, 3); h.insert(7, 7);
    expect(h.extractMin()!.key).toBe(3); expect(h.extractMin()!.key).toBe(7);
  });
  it('extract all elements: heap becomes empty', () => {
    const h = makeHeap(); for (let i = 0; i < 5; i++) h.insert(i, i);
    for (let i = 0; i < 5; i++) h.extractMin();
    expect(h.isEmpty).toBe(true);
  });
  it('extractMin decrements size', () => {
    const h = makeHeap(); h.insert(1, 1); h.insert(2, 2);
    h.extractMin(); expect(h.size).toBe(1);
  });
  it('extractMin value correct', () => {
    const h = makeHeap<string>(); h.insert(1, 'alpha'); h.insert(2, 'beta');
    expect(h.extractMin()!.value).toBe('alpha');
  });
  it('extractMin after clearing returns null', () => {
    const h = makeHeap(); h.insert(1, 1); h.clear(); expect(h.extractMin()).toBeNull();
  });
  it('sequential extracts yield sorted order for 10 items', () => {
    const h = makeHeap();
    const keys = [5, 2, 8, 1, 9, 3, 7, 4, 6, 0];
    for (const k of keys) h.insert(k, k);
    const result = drainKeys(h);
    expect(result).toEqual([0,1,2,3,4,5,6,7,8,9]);
  });

  for (let n = 2; n <= 60; n++) {
    it(`extract all ${n} elements in sorted order`, () => {
      const h = makeHeap();
      const keys = shuffle(range(n));
      for (const k of keys) h.insert(k, k);
      const result = drainKeys(h);
      expect(result).toEqual(range(n));
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`extract with negative keys #${i}: sorted correctly`, () => {
      const h = makeHeap();
      const vals = [-5 - i, 0, 5 + i, -1 - i, 10];
      for (const v of vals) h.insert(v, v);
      const result = drainKeys(h);
      expect(result).toEqual([...vals].sort((a, b) => a - b));
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`interleaved inserts and extracts #${i}`, () => {
      const h = makeHeap();
      h.insert(10 + i, 10 + i); h.insert(1 + i, 1 + i); h.insert(5 + i, 5 + i);
      expect(h.extractMin()!.key).toBe(1 + i);
      h.insert(0 + i, 0 + i);
      expect(h.extractMin()!.key).toBe(0 + i);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`extract from heap with duplicate keys #${i}`, () => {
      const h = makeHeap();
      for (let j = 0; j < 5; j++) h.insert(i, i);
      const keys = drainKeys(h);
      expect(keys.length).toBe(5);
      expect(keys.every(k => k === i)).toBe(true);
    });
  }
});

// =============================================================================
// 4. HEAP SORT
// =============================================================================
describe('4. heapSort', () => {
  it('sorts empty array', () => { expect(heapSort([])).toEqual([]); });
  it('sorts single element', () => { expect(heapSort([42])).toEqual([42]); });
  it('sorts two elements', () => { expect(heapSort([3, 1])).toEqual([1, 3]); });
  it('sorts already sorted', () => { expect(heapSort([1,2,3,4,5])).toEqual([1,2,3,4,5]); });
  it('sorts reverse sorted', () => { expect(heapSort([5,4,3,2,1])).toEqual([1,2,3,4,5]); });
  it('sorts with duplicates', () => { expect(heapSort([3,1,2,1,3])).toEqual([1,1,2,3,3]); });
  it('sorts negative numbers', () => { expect(heapSort([-3,-1,-2])).toEqual([-3,-2,-1]); });
  it('sorts mixed positive and negative', () => { expect(heapSort([-1,0,1,-2,2])).toEqual([-2,-1,0,1,2]); });
  it('sorts large array correctly', () => {
    const arr = shuffle(range(100));
    expect(heapSort(arr)).toEqual(range(100));
  });
  it('sorts all same values', () => { expect(heapSort([5,5,5,5])).toEqual([5,5,5,5]); });

  for (let n = 0; n <= 80; n++) {
    it(`heapSort length-${n} shuffled array`, () => {
      const arr = shuffle(range(n));
      expect(heapSort(arr)).toEqual(range(n));
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`heapSort with negative range starting at -${i+1}`, () => {
      const arr = shuffle(range(10).map(x => x - (i + 1)));
      const sorted = heapSort(arr);
      expect(sorted).toEqual([...arr].sort((a, b) => a - b));
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`heapSort duplicates pattern #${i}`, () => {
      const arr = [i, i, i+1, i+2, i, i+1];
      const sorted = heapSort(arr);
      expect(sorted).toEqual([...arr].sort((a, b) => a - b));
    });
  }
});

// =============================================================================
// 5. MERGE
// =============================================================================
describe('5. merge', () => {
  it('merge empty into non-empty preserves original', () => {
    const a = makeHeap(), b = makeHeap();
    a.insert(5, 5); a.merge(b);
    expect(a.size).toBe(1); expect(a.findMin()!.key).toBe(5);
  });
  it('merge non-empty into empty transfers ownership', () => {
    const a = makeHeap(), b = makeHeap();
    b.insert(3, 3); a.merge(b);
    expect(a.size).toBe(1); expect(a.findMin()!.key).toBe(3);
  });
  it('merge two non-empty: size is sum', () => {
    const a = makeHeap(), b = makeHeap();
    a.insert(1, 1); a.insert(2, 2); b.insert(3, 3); a.merge(b);
    expect(a.size).toBe(3);
  });
  it('merge: min is global minimum', () => {
    const a = makeHeap(), b = makeHeap();
    a.insert(5, 5); b.insert(3, 3); a.merge(b);
    expect(a.findMin()!.key).toBe(3);
  });
  it('merge: min from first heap wins when smaller', () => {
    const a = makeHeap(), b = makeHeap();
    a.insert(2, 2); b.insert(8, 8); a.merge(b);
    expect(a.findMin()!.key).toBe(2);
  });
  it('merge two heaps: extract all in sorted order', () => {
    const a = makeHeap(), b = makeHeap();
    [5, 3, 7].forEach(k => a.insert(k, k));
    [2, 6, 4].forEach(k => b.insert(k, k));
    a.merge(b);
    expect(drainKeys(a)).toEqual([2,3,4,5,6,7]);
  });
  it('merge empty into empty: size 0', () => {
    const a = makeHeap(), b = makeHeap(); a.merge(b); expect(a.size).toBe(0);
  });
  it('merge multiple heaps sequentially', () => {
    const a = makeHeap();
    for (let i = 0; i < 3; i++) {
      const b = makeHeap(); b.insert(i * 10, i * 10); a.merge(b);
    }
    expect(a.size).toBe(3); expect(a.findMin()!.key).toBe(0);
  });
  it('merge preserves all elements after extract', () => {
    const a = makeHeap(), b = makeHeap();
    for (let i = 0; i < 5; i++) a.insert(i * 2, i * 2);
    for (let i = 0; i < 5; i++) b.insert(i * 2 + 1, i * 2 + 1);
    a.merge(b);
    expect(drainKeys(a)).toEqual(range(10));
  });
  it('merge with negative keys selects correct min', () => {
    const a = makeHeap(), b = makeHeap();
    a.insert(-5, -5); b.insert(-10, -10); a.merge(b);
    expect(a.findMin()!.key).toBe(-10);
  });

  for (let n = 1; n <= 30; n++) {
    it(`merge two heaps of size ${n}: sorted drain correct`, () => {
      const a = makeHeap(), b = makeHeap();
      const aKeys = range(n).map(i => i * 2);
      const bKeys = range(n).map(i => i * 2 + 1);
      for (const k of shuffle(aKeys)) a.insert(k, k);
      for (const k of shuffle(bKeys)) b.insert(k, k);
      a.merge(b);
      expect(a.size).toBe(n * 2);
      const result = drainKeys(a);
      expect(result).toEqual([...aKeys, ...bKeys].sort((x, y) => x - y));
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`merge heaps with overlapping key ranges #${i}`, () => {
      const a = makeHeap(), b = makeHeap();
      for (let j = 0; j < 5; j++) a.insert(j + i, j + i);
      for (let j = 0; j < 5; j++) b.insert(j + i + 2, j + i + 2);
      a.merge(b);
      expect(a.size).toBe(10);
      const result = drainKeys(a);
      for (let k = 1; k < result.length; k++) expect(result[k]).toBeGreaterThanOrEqual(result[k-1]);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`merge empty into populated #${i}`, () => {
      const a = makeHeap(), b = makeHeap();
      for (let j = 0; j <= i; j++) a.insert(j, j);
      a.merge(b);
      expect(a.size).toBe(i + 1);
      expect(a.findMin()!.key).toBe(0);
    });
  }
});

// =============================================================================
// 6. TO SORTED ARRAY
// =============================================================================
describe('6. toSortedArray', () => {
  it('toSortedArray on empty heap returns []', () => { expect(makeHeap().toSortedArray()).toEqual([]); });
  it('toSortedArray on single element', () => {
    const h = makeHeap(); h.insert(7, 7);
    expect(h.toSortedArray()).toEqual([{ key: 7, value: 7 }]);
  });
  it('toSortedArray does not mutate the heap', () => {
    const h = makeHeap(); h.insert(3, 3); h.insert(1, 1);
    h.toSortedArray();
    expect(h.size).toBe(2);
    expect(h.findMin()!.key).toBe(1);
  });
  it('toSortedArray returns keys in ascending order', () => {
    const h = makeHeap();
    [5, 2, 8, 1, 9].forEach(k => h.insert(k, k));
    const arr = h.toSortedArray();
    const keys = arr.map(x => x.key);
    expect(keys).toEqual([1, 2, 5, 8, 9]);
  });
  it('toSortedArray with negative keys', () => {
    const h = makeHeap();
    [-3, 0, -1, 2].forEach(k => h.insert(k, k));
    const keys = h.toSortedArray().map(x => x.key);
    expect(keys).toEqual([-3, -1, 0, 2]);
  });
  it('toSortedArray with duplicate keys', () => {
    const h = makeHeap();
    [3, 1, 3, 2].forEach(k => h.insert(k, k));
    const keys = h.toSortedArray().map(x => x.key);
    expect(keys).toEqual([1, 2, 3, 3]);
  });
  it('toSortedArray values match keys', () => {
    const h = makeHeap<string>();
    h.insert(2, 'b'); h.insert(1, 'a'); h.insert(3, 'c');
    const arr = h.toSortedArray();
    expect(arr.map(x => x.value)).toEqual(['a', 'b', 'c']);
  });
  it('toSortedArray called twice returns same result', () => {
    const h = makeHeap();
    [4, 2, 6].forEach(k => h.insert(k, k));
    const a = h.toSortedArray().map(x => x.key);
    const b = h.toSortedArray().map(x => x.key);
    expect(a).toEqual(b);
  });
  it('toSortedArray after extractMin still correct', () => {
    const h = makeHeap();
    [1,2,3,4,5].forEach(k => h.insert(k, k));
    h.extractMin();
    const keys = h.toSortedArray().map(x => x.key);
    expect(keys).toEqual([2, 3, 4, 5]);
  });
  it('toSortedArray on 100 elements', () => {
    const h = makeHeap();
    const arr = shuffle(range(100));
    for (const k of arr) h.insert(k, k);
    const keys = h.toSortedArray().map(x => x.key);
    expect(keys).toEqual(range(100));
  });

  for (let n = 1; n <= 60; n++) {
    it(`toSortedArray for ${n} elements preserves heap`, () => {
      const h = makeHeap();
      const keys = shuffle(range(n));
      for (const k of keys) h.insert(k, k);
      h.toSortedArray();
      expect(h.size).toBe(n);
      expect(h.findMin()!.key).toBe(0);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`toSortedArray sorted check #${i}`, () => {
      const h = makeHeap();
      const vals = shuffle(range(10).map(x => x - 5 + i));
      for (const v of vals) h.insert(v, v);
      const result = h.toSortedArray().map(x => x.key);
      for (let k = 1; k < result.length; k++) expect(result[k]).toBeGreaterThanOrEqual(result[k-1]);
    });
  }
});

// =============================================================================
// 7. CLEAR
// =============================================================================
describe('7. clear', () => {
  it('clear empties the heap', () => { const h = makeHeap(); h.insert(1,1); h.clear(); expect(h.isEmpty).toBe(true); });
  it('clear sets size to 0', () => { const h = makeHeap(); h.insert(1,1); h.clear(); expect(h.size).toBe(0); });
  it('clear makes findMin return null', () => { const h = makeHeap(); h.insert(1,1); h.clear(); expect(h.findMin()).toBeNull(); });
  it('clear makes extractMin return null', () => { const h = makeHeap(); h.insert(1,1); h.clear(); expect(h.extractMin()).toBeNull(); });
  it('can insert after clear', () => {
    const h = makeHeap(); h.insert(5,5); h.clear(); h.insert(10,10);
    expect(h.size).toBe(1); expect(h.findMin()!.key).toBe(10);
  });
  it('clear twice is safe', () => { const h = makeHeap(); h.clear(); h.clear(); expect(h.isEmpty).toBe(true); });
  it('clear on empty is safe', () => { const h = makeHeap(); h.clear(); expect(h.size).toBe(0); });
  it('clear removes many elements', () => {
    const h = makeHeap(); for (let i = 0; i < 50; i++) h.insert(i,i); h.clear(); expect(h.size).toBe(0);
  });
  it('size correct after clear and re-insert', () => {
    const h = makeHeap();
    for (let i = 0; i < 5; i++) h.insert(i,i);
    h.clear();
    for (let i = 0; i < 3; i++) h.insert(i,i);
    expect(h.size).toBe(3);
  });
  it('min correct after clear and re-insert', () => {
    const h = makeHeap();
    h.insert(100,100); h.clear(); h.insert(42,42); expect(h.findMin()!.key).toBe(42);
  });

  for (let n = 1; n <= 50; n++) {
    it(`clear after inserting ${n} elements: size is 0`, () => {
      const h = makeHeap();
      for (let i = 0; i < n; i++) h.insert(i, i);
      h.clear();
      expect(h.size).toBe(0);
      expect(h.isEmpty).toBe(true);
    });
  }

  for (let i = 0; i < 40; i++) {
    it(`clear and re-use cycle #${i}`, () => {
      const h = makeHeap();
      for (let j = 0; j < 5; j++) h.insert(j + i, j + i);
      h.clear();
      h.insert(i, i);
      expect(h.findMin()!.key).toBe(i);
      expect(h.size).toBe(1);
    });
  }
});

// =============================================================================
// 8. CREATE FIBONACCI HEAP FACTORY
// =============================================================================
describe('8. createFibonacciHeap factory', () => {
  it('returns FibonacciHeap instance', () => { expect(createFibonacciHeap()).toBeInstanceOf(FibonacciHeap); });
  it('returned heap is empty', () => { expect(createFibonacciHeap().isEmpty).toBe(true); });
  it('returned heap size is 0', () => { expect(createFibonacciHeap().size).toBe(0); });
  it('can insert into factory heap', () => {
    const h = createFibonacciHeap<number>(); h.insert(5, 5); expect(h.findMin()!.key).toBe(5);
  });
  it('each call returns independent heap', () => {
    const a = createFibonacciHeap<number>(), b = createFibonacciHeap<number>();
    a.insert(1, 1); expect(b.isEmpty).toBe(true);
  });
  it('factory heap sorts correctly', () => {
    const h = createFibonacciHeap<number>();
    [3,1,4,1,5,9,2,6].forEach(k => h.insert(k, k));
    const result = drainKeys(h);
    for (let i = 1; i < result.length; i++) expect(result[i]).toBeGreaterThanOrEqual(result[i-1]);
  });
  it('factory heap with string values', () => {
    const h = createFibonacciHeap<string>();
    h.insert(2, 'world'); h.insert(1, 'hello');
    expect(h.extractMin()!.value).toBe('hello');
  });
  it('factory heap with object values', () => {
    const h = createFibonacciHeap<{ name: string }>();
    h.insert(5, { name: 'bob' }); h.insert(1, { name: 'alice' });
    expect(h.findMin()!.value.name).toBe('alice');
  });
  it('factory heap supports merge', () => {
    const a = createFibonacciHeap<number>(), b = createFibonacciHeap<number>();
    a.insert(5, 5); b.insert(3, 3); a.merge(b); expect(a.findMin()!.key).toBe(3);
  });
  it('factory heap supports clear', () => {
    const h = createFibonacciHeap<number>(); h.insert(1,1); h.clear(); expect(h.isEmpty).toBe(true);
  });

  for (let i = 0; i < 40; i++) {
    it(`factory heap round-trip #${i}`, () => {
      const h = createFibonacciHeap<number>();
      for (let j = 0; j <= i; j++) h.insert(j, j);
      expect(h.size).toBe(i + 1);
      expect(h.findMin()!.key).toBe(0);
      h.clear();
      expect(h.isEmpty).toBe(true);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`factory multiple instances independent #${i}`, () => {
      const heaps = Array.from({ length: 3 }, () => createFibonacciHeap<number>());
      heaps[0].insert(i, i);
      heaps[1].insert(i + 1, i + 1);
      expect(heaps[2].isEmpty).toBe(true);
      expect(heaps[0].size).toBe(1);
      expect(heaps[1].size).toBe(1);
    });
  }
});

// =============================================================================
// 9. EDGE CASES & STRESS
// =============================================================================
describe('9. edge cases and stress tests', () => {
  it('max integer key', () => {
    const h = makeHeap(); h.insert(Number.MAX_SAFE_INTEGER, 1); h.insert(1, 1);
    expect(h.findMin()!.key).toBe(1);
  });
  it('min integer key', () => {
    const h = makeHeap(); h.insert(Number.MIN_SAFE_INTEGER, 1); h.insert(1, 1);
    expect(h.findMin()!.key).toBe(Number.MIN_SAFE_INTEGER);
  });
  it('float keys work correctly', () => {
    const h = makeHeap(); h.insert(1.5, 1.5); h.insert(1.1, 1.1); h.insert(1.9, 1.9);
    expect(h.findMin()!.key).toBeCloseTo(1.1);
    expect(h.extractMin()!.key).toBeCloseTo(1.1);
    expect(h.extractMin()!.key).toBeCloseTo(1.5);
    expect(h.extractMin()!.key).toBeCloseTo(1.9);
  });
  it('insert 1000 elements and extract all in order', () => {
    const h = makeHeap();
    const arr = shuffle(range(1000));
    for (const k of arr) h.insert(k, k);
    const result = drainKeys(h);
    expect(result).toEqual(range(1000));
  });
  it('heap property maintained after many inserts', () => {
    const h = makeHeap();
    for (let i = 500; i >= 0; i--) h.insert(i, i);
    let prev = -Infinity;
    let item: { key: number } | null;
    while ((item = h.extractMin()) !== null) {
      expect(item.key).toBeGreaterThanOrEqual(prev);
      prev = item.key;
    }
  });
  it('merge then extract maintains heap order', () => {
    const a = makeHeap(), b = makeHeap();
    for (let i = 0; i < 20; i += 2) a.insert(i, i);
    for (let i = 1; i < 20; i += 2) b.insert(i, i);
    a.merge(b);
    expect(drainKeys(a)).toEqual(range(20));
  });
  it('alternating insert and extract keeps heap valid', () => {
    const h = makeHeap();
    // Insert ascending keys and interleave extracts - heap property holds at each extraction
    const extracted: number[] = [];
    for (let i = 0; i < 50; i++) {
      h.insert(i, i);
      if (i % 3 === 0) { const m = h.extractMin(); if (m) extracted.push(m.key); }
    }
    const remaining = drainKeys(h);
    // With ascending inserts, extracted and remaining are both non-decreasing
    for (let i = 1; i < extracted.length; i++) expect(extracted[i]).toBeGreaterThanOrEqual(extracted[i-1]);
    for (let i = 1; i < remaining.length; i++) expect(remaining[i]).toBeGreaterThanOrEqual(remaining[i-1]);
    expect(extracted.length + remaining.length).toBe(50);
  });
  it('null-like object values stored correctly', () => {
    const h = makeHeap<null>(); h.insert(1, null); expect(h.findMin()!.value).toBeNull();
  });
  it('boolean values stored correctly', () => {
    const h = makeHeap<boolean>(); h.insert(1, true); expect(h.findMin()!.value).toBe(true);
  });
  it('array values stored correctly', () => {
    const h = makeHeap<number[]>(); h.insert(1, [1,2,3]); expect(h.findMin()!.value).toEqual([1,2,3]);
  });
  it('node returned from insert tracks key', () => {
    const h = makeHeap(); const n = h.insert(77, 77); expect(n.key).toBe(77);
  });
  it('node returned from insert tracks value', () => {
    const h = makeHeap<string>(); const n = h.insert(1, 'test'); expect(n.value).toBe('test');
  });
  it('node degree starts at 0', () => {
    const h = makeHeap(); const n = h.insert(1, 1); expect(n.degree).toBe(0);
  });
  it('node marked starts as false', () => {
    const h = makeHeap(); const n = h.insert(1, 1); expect(n.marked).toBe(false);
  });
  it('node parent starts as null', () => {
    const h = makeHeap(); const n = h.insert(1, 1); expect(n.parent).toBeNull();
  });
  it('extract from heap of size 2 leaves size 1', () => {
    const h = makeHeap(); h.insert(1,1); h.insert(2,2); h.extractMin(); expect(h.size).toBe(1);
  });
  it('extract from heap of size 2 leaves correct min', () => {
    const h = makeHeap(); h.insert(1,1); h.insert(2,2); h.extractMin(); expect(h.findMin()!.key).toBe(2);
  });

  for (let n = 1; n <= 50; n++) {
    it(`stress: insert ${n*10} then drain`, () => {
      const h = makeHeap();
      const arr = shuffle(range(n * 10));
      for (const k of arr) h.insert(k, k);
      const result = drainKeys(h);
      expect(result.length).toBe(n * 10);
      for (let i = 1; i < result.length; i++) expect(result[i]).toBeGreaterThanOrEqual(result[i-1]);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`heap with all same keys #${i}: drain returns all`, () => {
      const h = makeHeap();
      const count = 5 + i;
      for (let j = 0; j < count; j++) h.insert(42, 42);
      const result = drainKeys(h);
      expect(result.length).toBe(count);
      expect(result.every(k => k === 42)).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`random merge-then-drain #${i}`, () => {
      const heaps = [makeHeap(), makeHeap(), makeHeap()];
      const allKeys: number[] = [];
      let offset = 0;
      for (const h of heaps) {
        const keys = shuffle(range(5).map(x => x + offset));
        for (const k of keys) h.insert(k, k);
        allKeys.push(...keys);
        offset += 5;
      }
      heaps[0].merge(heaps[1]);
      heaps[0].merge(heaps[2]);
      expect(heaps[0].size).toBe(15);
      const result = drainKeys(heaps[0]);
      expect(result).toEqual(allKeys.sort((a, b) => a - b));
    });
  }
});

// =============================================================================
// 10. SIZE AND IS-EMPTY INVARIANTS
// =============================================================================
describe('10. size and isEmpty invariants', () => {
  it('isEmpty reflects size correctly when empty', () => {
    const h = makeHeap(); expect(h.isEmpty).toBe(h.size === 0);
  });
  it('isEmpty reflects size correctly after insert', () => {
    const h = makeHeap(); h.insert(1,1); expect(h.isEmpty).toBe(h.size === 0);
  });
  it('isEmpty reflects size correctly after extract', () => {
    const h = makeHeap(); h.insert(1,1); h.extractMin(); expect(h.isEmpty).toBe(h.size === 0);
  });

  for (let n = 0; n <= 40; n++) {
    it(`size invariant after ${n} inserts`, () => {
      const h = makeHeap();
      for (let i = 0; i < n; i++) h.insert(i, i);
      expect(h.size).toBe(n);
      expect(h.isEmpty).toBe(n === 0);
    });
  }

  for (let n = 1; n <= 40; n++) {
    it(`size decrements correctly draining ${n} elements`, () => {
      const h = makeHeap();
      for (let i = 0; i < n; i++) h.insert(i, i);
      for (let i = n; i >= 1; i--) {
        expect(h.size).toBe(i);
        h.extractMin();
      }
      expect(h.size).toBe(0);
      expect(h.isEmpty).toBe(true);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`size after merge: sum of sizes #${i}`, () => {
      const a = makeHeap(), b = makeHeap();
      const na = i + 1, nb = i + 2;
      for (let j = 0; j < na; j++) a.insert(j, j);
      for (let j = 0; j < nb; j++) b.insert(j + 100, j + 100);
      a.merge(b);
      expect(a.size).toBe(na + nb);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`size stable after toSortedArray #${i}`, () => {
      const h = makeHeap();
      const n = i + 3;
      for (let j = 0; j < n; j++) h.insert(j, j);
      const before = h.size;
      h.toSortedArray();
      expect(h.size).toBe(before);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`isEmpty false after insert, true after drain #${i}`, () => {
      const h = makeHeap();
      h.insert(i, i);
      expect(h.isEmpty).toBe(false);
      h.extractMin();
      expect(h.isEmpty).toBe(true);
    });
  }
});
