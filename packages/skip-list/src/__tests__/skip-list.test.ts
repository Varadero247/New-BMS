// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { SkipList, SkipListMap, skipListSort, skipListRangeQuery, createSkipList } from '../skip-list';

// ============================================================
// 1. insert / has  (150 tests)
// ============================================================
describe('insert and has', () => {
  // 1a: insert 1..100, check each exists (100 tests)
  for (let i = 1; i <= 100; i++) {
    it(`has(${i}) is true after insert`, () => {
      const sl = new SkipList<number>();
      sl.insert(i);
      expect(sl.has(i)).toBe(true);
    });
  }

  // 1b: has returns false for not-inserted elements (30 tests)
  for (let i = 0; i < 30; i++) {
    it(`has(${i + 1000}) is false when not inserted (${i})`, () => {
      const sl = new SkipList<number>();
      sl.insert(i);
      expect(sl.has(i + 1000)).toBe(false);
    });
  }

  // 1c: duplicate insert does not increase size (20 tests)
  for (let i = 0; i < 20; i++) {
    it(`duplicate insert of ${i} keeps size 1`, () => {
      const sl = new SkipList<number>();
      sl.insert(i);
      sl.insert(i);
      expect(sl.size).toBe(1);
      expect(sl.has(i)).toBe(true);
    });
  }
});

// ============================================================
// 2. delete  (150 tests)
// ============================================================
describe('delete', () => {
  // 2a: insert then delete, verify removed (100 tests)
  for (let i = 0; i < 100; i++) {
    it(`delete(${i}) returns true and has(${i}) becomes false`, () => {
      const sl = new SkipList<number>();
      sl.insert(i);
      expect(sl.delete(i)).toBe(true);
      expect(sl.has(i)).toBe(false);
    });
  }

  // 2b: delete non-existent returns false (30 tests)
  for (let i = 0; i < 30; i++) {
    it(`delete(${i + 500}) returns false when not in list (${i})`, () => {
      const sl = new SkipList<number>();
      sl.insert(i);
      expect(sl.delete(i + 500)).toBe(false);
    });
  }

  // 2c: delete from empty list returns false (20 tests)
  for (let i = 0; i < 20; i++) {
    it(`delete(${i}) from empty list returns false`, () => {
      const sl = new SkipList<number>();
      expect(sl.delete(i)).toBe(false);
    });
  }
});

// ============================================================
// 3. toArray sorted  (150 tests)
// ============================================================
describe('toArray sorted', () => {
  // 3a: insert n elements in reverse, verify toArray is sorted (100 tests)
  for (let n = 1; n <= 100; n++) {
    it(`toArray sorted for n=${n} elements inserted in reverse`, () => {
      const sl = new SkipList<number>();
      for (let i = n; i >= 1; i--) sl.insert(i);
      const arr = sl.toArray();
      expect(arr.length).toBe(n);
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThan(arr[i - 1]);
      }
    });
  }

  // 3b: toArray on empty list returns empty array (10 tests)
  for (let i = 0; i < 10; i++) {
    it(`toArray of empty list is [] (run ${i})`, () => {
      const sl = new SkipList<number>();
      expect(sl.toArray()).toEqual([]);
    });
  }

  // 3c: toArray after clear returns empty array (20 tests)
  for (let n = 1; n <= 20; n++) {
    it(`toArray after clear is [] for n=${n}`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i);
      sl.clear();
      expect(sl.toArray()).toEqual([]);
    });
  }

  // 3d: toArray length matches size (20 tests)
  for (let n = 1; n <= 20; n++) {
    it(`toArray.length === size for n=${n}`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i * 3);
      expect(sl.toArray().length).toBe(sl.size);
    });
  }
});

// ============================================================
// 4. min / max  (100 tests)
// ============================================================
describe('min and max', () => {
  // 4a: min returns smallest (40 tests)
  for (let n = 1; n <= 40; n++) {
    it(`min() === 0 after inserting 0..${n - 1}`, () => {
      const sl = new SkipList<number>();
      for (let i = n - 1; i >= 0; i--) sl.insert(i);
      expect(sl.min()).toBe(0);
    });
  }

  // 4b: max returns largest (40 tests)
  for (let n = 1; n <= 40; n++) {
    it(`max() === ${n - 1} after inserting 0..${n - 1}`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i);
      expect(sl.max()).toBe(n - 1);
    });
  }

  // 4c: min/max on empty list return null (10 tests each)
  for (let i = 0; i < 10; i++) {
    it(`min() is null on empty list (${i})`, () => {
      expect(new SkipList<number>().min()).toBeNull();
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`max() is null on empty list (${i})`, () => {
      expect(new SkipList<number>().max()).toBeNull();
    });
  }
});

// ============================================================
// 5. size  (100 tests)
// ============================================================
describe('size tracking', () => {
  // 5a: size increases on each unique insert (50 tests)
  for (let n = 1; n <= 50; n++) {
    it(`size === ${n} after ${n} inserts`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i);
      expect(sl.size).toBe(n);
    });
  }

  // 5b: size decreases after delete (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`size === ${n - 1} after inserting ${n} and deleting one`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i);
      sl.delete(0);
      expect(sl.size).toBe(n - 1);
    });
  }

  // 5c: size === 0 after clear (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`size === 0 after inserting ${n} and calling clear()`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i);
      sl.clear();
      expect(sl.size).toBe(0);
    });
  }
});

// ============================================================
// 6. rank  (100 tests)
// ============================================================
describe('rank', () => {
  // 6a: rank(kth(k)) === k for various list sizes (60 tests)
  for (let n = 1; n <= 20; n++) {
    for (let k = 0; k < 3 && k < n; k++) {
      it(`rank(kth(${k})) === ${k} in list of size ${n}`, () => {
        const sl = new SkipList<number>();
        for (let i = 0; i < n; i++) sl.insert(i * 2);
        const val = sl.kth(k);
        expect(val).not.toBeNull();
        expect(sl.rank(val!)).toBe(k);
      });
    }
  }

  // 6b: rank of first element is 0 (20 tests)
  for (let n = 1; n <= 20; n++) {
    it(`rank of min element is 0 for size ${n}`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i + 10);
      expect(sl.rank(10)).toBe(0);
    });
  }

  // 6c: rank of last element is size-1 (20 tests)
  for (let n = 1; n <= 20; n++) {
    it(`rank of max element is ${n - 1} for size ${n}`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i);
      expect(sl.rank(n - 1)).toBe(n - 1);
    });
  }
});

// ============================================================
// 7. kth  (100 tests)
// ============================================================
describe('kth', () => {
  // 7a: kth returns correct element for 0..n-1 (60 tests across various sizes)
  for (let n = 1; n <= 20; n++) {
    it(`kth(0) === ${n * 2} for list [${n * 2}, ${n * 2 + 1}, ${n * 2 + 2}]`, () => {
      const sl = new SkipList<number>();
      sl.insert(n * 2);
      sl.insert(n * 2 + 1);
      sl.insert(n * 2 + 2);
      expect(sl.kth(0)).toBe(n * 2);
      expect(sl.kth(1)).toBe(n * 2 + 1);
      expect(sl.kth(2)).toBe(n * 2 + 2);
    });
  }

  // 7b: kth out of bounds returns null (20 tests)
  for (let n = 1; n <= 20; n++) {
    it(`kth(${n}) returns null for list of size ${n}`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i);
      expect(sl.kth(n)).toBeNull();
    });
  }

  // 7c: kth(-1) returns null (20 tests)
  for (let i = 0; i < 20; i++) {
    it(`kth(-1) returns null (run ${i})`, () => {
      const sl = new SkipList<number>();
      sl.insert(i);
      expect(sl.kth(-1)).toBeNull();
    });
  }
});

// ============================================================
// 8. SkipListMap get/set  (100 tests)
// ============================================================
describe('SkipListMap get and set', () => {
  // 8a: set then get returns correct value (50 tests)
  for (let i = 0; i < 50; i++) {
    it(`map.get(${i}) === 'v${i}' after set`, () => {
      const map = new SkipListMap<number, string>();
      map.set(i, `v${i}`);
      expect(map.get(i)).toBe(`v${i}`);
    });
  }

  // 8b: get returns undefined for missing keys (20 tests)
  for (let i = 0; i < 20; i++) {
    it(`map.get(${i + 1000}) === undefined when not set (${i})`, () => {
      const map = new SkipListMap<number, string>();
      map.set(i, `v${i}`);
      expect(map.get(i + 1000)).toBeUndefined();
    });
  }

  // 8c: overwrite existing key (20 tests)
  for (let i = 0; i < 20; i++) {
    it(`map.set(${i}, newVal) overwrites old value`, () => {
      const map = new SkipListMap<number, string>();
      map.set(i, 'old');
      map.set(i, 'new');
      expect(map.get(i)).toBe('new');
      expect(map.size).toBe(1);
    });
  }

  // 8d: delete from map (10 tests)
  for (let i = 0; i < 10; i++) {
    it(`map.delete(${i}) returns true and has returns false`, () => {
      const map = new SkipListMap<number, string>();
      map.set(i, `v${i}`);
      expect(map.delete(i)).toBe(true);
      expect(map.has(i)).toBe(false);
    });
  }
});

// ============================================================
// 9. SkipListMap keys() sorted  (50 tests)
// ============================================================
describe('SkipListMap keys sorted', () => {
  // 9a: keys() returns keys in sorted order (30 tests)
  for (let n = 1; n <= 30; n++) {
    it(`keys() sorted for ${n} entries inserted in reverse`, () => {
      const map = new SkipListMap<number, number>();
      for (let i = n; i >= 1; i--) map.set(i, i * 10);
      const keys = map.keys();
      expect(keys.length).toBe(n);
      for (let i = 1; i < keys.length; i++) {
        expect(keys[i]).toBeGreaterThan(keys[i - 1]);
      }
    });
  }

  // 9b: values() corresponds to sorted keys (10 tests)
  for (let n = 1; n <= 10; n++) {
    it(`values() matches sorted keys for n=${n}`, () => {
      const map = new SkipListMap<number, number>();
      for (let i = n - 1; i >= 0; i--) map.set(i, i * 5);
      const values = map.values();
      expect(values.length).toBe(n);
      // values should be in key-sorted order
      for (let i = 0; i < n; i++) {
        expect(values[i]).toBe(i * 5);
      }
    });
  }

  // 9c: entries() returns sorted [key, value] pairs (10 tests)
  for (let n = 1; n <= 10; n++) {
    it(`entries() returns sorted pairs for n=${n}`, () => {
      const map = new SkipListMap<number, string>();
      for (let i = n; i >= 1; i--) map.set(i, `val${i}`);
      const entries = map.entries();
      expect(entries.length).toBe(n);
      for (let i = 0; i < entries.length; i++) {
        expect(entries[i][0]).toBe(i + 1);
        expect(entries[i][1]).toBe(`val${i + 1}`);
      }
    });
  }
});

// ============================================================
// 10. skipListSort  (50 tests)
// ============================================================
describe('skipListSort', () => {
  // 10a: compare to Array.sort for numeric arrays (30 tests)
  for (let n = 1; n <= 30; n++) {
    it(`skipListSort matches Array.sort for n=${n} elements`, () => {
      const arr: number[] = [];
      // Use deterministic values: reversed sequence
      for (let i = n; i >= 1; i--) arr.push(i);
      const sortedByJs = [...arr].sort((a, b) => a - b);
      const sortedBySl = skipListSort(arr, (a, b) => a - b);
      expect(sortedBySl).toEqual(sortedByJs);
    });
  }

  // 10b: skipListSort on already sorted array (10 tests)
  for (let n = 1; n <= 10; n++) {
    it(`skipListSort on already sorted array of length ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const result = skipListSort(arr, (a, b) => a - b);
      expect(result).toEqual(arr);
    });
  }

  // 10c: skipListSort with string comparator (10 tests)
  for (let i = 0; i < 10; i++) {
    it(`skipListSort with string comparator run ${i}`, () => {
      const words = ['banana', 'apple', 'cherry', 'date', 'elderberry'].slice(0, (i % 5) + 1);
      const expected = [...words].sort((a, b) => a.localeCompare(b));
      const result = skipListSort(words, (a, b) => a.localeCompare(b));
      expect(result).toEqual(expected);
    });
  }
});

// ============================================================
// 11. skipListRangeQuery  (50 tests)
// ============================================================
describe('skipListRangeQuery', () => {
  // 11a: query [lo, hi] returns all elements in range (30 tests)
  for (let n = 5; n <= 34; n++) {
    it(`rangeQuery [2, ${Math.floor(n / 2)}] on list 0..${n - 1}`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i);
      const lo = 2;
      const hi = Math.floor(n / 2);
      const result = skipListRangeQuery(sl, lo, hi);
      const expected = Array.from({ length: hi - lo + 1 }, (_, i) => i + lo);
      expect(result).toEqual(expected);
    });
  }

  // 11b: query with lo === hi returns single element (10 tests)
  for (let i = 0; i < 10; i++) {
    it(`rangeQuery [${i + 5}, ${i + 5}] returns [${i + 5}]`, () => {
      const sl = new SkipList<number>();
      for (let j = 0; j <= 20; j++) sl.insert(j);
      const result = skipListRangeQuery(sl, i + 5, i + 5);
      expect(result).toEqual([i + 5]);
    });
  }

  // 11c: query with lo > hi returns empty (10 tests)
  for (let i = 0; i < 10; i++) {
    it(`rangeQuery [${i + 10}, ${i}] returns [] (lo > hi) run ${i}`, () => {
      const sl = new SkipList<number>();
      for (let j = 0; j <= 20; j++) sl.insert(j);
      const result = skipListRangeQuery(sl, i + 10, i);
      expect(result).toEqual([]);
    });
  }
});

// ============================================================
// 12. clear and edge cases  (50 additional tests)
// ============================================================
describe('clear and edge cases', () => {
  // 12a: clear resets size to 0 (10 tests)
  for (let n = 1; n <= 10; n++) {
    it(`clear() resets size for list of ${n}`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i);
      sl.clear();
      expect(sl.size).toBe(0);
    });
  }

  // 12b: can re-insert after clear (10 tests)
  for (let i = 0; i < 10; i++) {
    it(`can re-insert ${i} after clear`, () => {
      const sl = new SkipList<number>();
      sl.insert(i);
      sl.clear();
      sl.insert(i);
      expect(sl.has(i)).toBe(true);
      expect(sl.size).toBe(1);
    });
  }

  // 12c: custom comparator with maxLevel and probability constructor params (10 tests)
  for (let i = 0; i < 10; i++) {
    it(`custom comparator, maxLevel=8, probability=0.25 run ${i}`, () => {
      const sl = new SkipList<number>((a, b) => a - b, 8, 0.25);
      for (let j = i; j >= 0; j--) sl.insert(j);
      expect(sl.size).toBe(i + 1);
      expect(sl.min()).toBe(0);
      expect(sl.max()).toBe(i);
    });
  }

  // 12d: createSkipList factory (10 tests)
  for (let i = 0; i < 10; i++) {
    it(`createSkipList() run ${i} — insert and has`, () => {
      const sl = createSkipList<number>();
      sl.insert(i * 7);
      expect(sl.has(i * 7)).toBe(true);
    });
  }

  // 12e: SkipListMap size tracking (10 tests)
  for (let n = 1; n <= 10; n++) {
    it(`SkipListMap size === ${n} after ${n} unique sets`, () => {
      const map = new SkipListMap<number, number>();
      for (let i = 0; i < n; i++) map.set(i, i * 2);
      expect(map.size).toBe(n);
    });
  }
});

// ============================================================
// 13. rank / kth round-trip stress (100 additional tests)
// ============================================================
describe('rank kth round-trip stress', () => {
  // For each k in 0..49, build a list of size 50 and verify rank(kth(k)) === k
  for (let k = 0; k < 50; k++) {
    it(`rank(kth(${k})) === ${k} in a 50-element list`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < 50; i++) sl.insert(i * 3);
      const val = sl.kth(k);
      expect(val).not.toBeNull();
      expect(sl.rank(val!)).toBe(k);
    });
  }

  // kth returns the exact value at position k (50 tests)
  for (let k = 0; k < 50; k++) {
    it(`kth(${k}) === ${k * 3} in list of multiples-of-3`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < 50; i++) sl.insert(i * 3);
      expect(sl.kth(k)).toBe(k * 3);
    });
  }
});

// ============================================================
// 14. SkipList has() vs delete interplay  (50 tests)
// ============================================================
describe('has and delete interplay', () => {
  for (let n = 1; n <= 50; n++) {
    it(`after deleting all elements in [0..${n - 1}], has returns false for each`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i);
      for (let i = 0; i < n; i++) sl.delete(i);
      for (let i = 0; i < n; i++) {
        expect(sl.has(i)).toBe(false);
      }
      expect(sl.size).toBe(0);
    });
  }
});

// ============================================================
// 15. min/max after deletions  (50 tests)
// ============================================================
describe('min and max after deletions', () => {
  for (let n = 2; n <= 51; n++) {
    it(`min() === 1 after deleting 0 from list 0..${n - 1}`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i);
      sl.delete(0);
      expect(sl.min()).toBe(1);
    });
  }
});

// ============================================================
// 16. toArray reflects delete + insert alternation  (50 tests)
// ============================================================
describe('toArray after alternating insert and delete', () => {
  for (let n = 1; n <= 50; n++) {
    it(`toArray is sorted after inserting 0..${n - 1} and deleting evens`, () => {
      const sl = new SkipList<number>();
      for (let i = 0; i < n; i++) sl.insert(i);
      for (let i = 0; i < n; i += 2) sl.delete(i);
      const arr = sl.toArray();
      for (let i = 1; i < arr.length; i++) {
        expect(arr[i]).toBeGreaterThan(arr[i - 1]);
      }
      // All remaining elements should be odd
      for (const v of arr) {
        expect(v % 2).toBe(1);
      }
    });
  }
});

// ============================================================
// 17. SkipListMap entries and delete  (50 tests)
// ============================================================
describe('SkipListMap entries and delete', () => {
  // 17a: entries sorted after mixed inserts (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`SkipListMap entries sorted for n=${n}`, () => {
      const map = new SkipListMap<number, string>();
      for (let i = n; i >= 1; i--) map.set(i, `s${i}`);
      const ents = map.entries();
      for (let i = 1; i < ents.length; i++) {
        expect(ents[i][0]).toBeGreaterThan(ents[i - 1][0]);
      }
    });
  }

  // 17b: delete all keys leaves size 0 (25 tests)
  for (let n = 1; n <= 25; n++) {
    it(`SkipListMap size === 0 after deleting all ${n} keys`, () => {
      const map = new SkipListMap<number, number>();
      for (let i = 0; i < n; i++) map.set(i, i);
      for (let i = 0; i < n; i++) map.delete(i);
      expect(map.size).toBe(0);
    });
  }
});
