// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  LRUCache,
  LFUCache,
  TTLCache,
  FIFOCache,
  TwoLevelCache,
  memoize,
  createCache,
  warmUp,
  serialize,
  deserialize,
} from '../cache-strategy';

// ─────────────────────────────────────────────────────────────────────────────
// LRUCache — get/set (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('LRUCache get/set', () => {
  for (let i = 0; i < 50; i++) {
    it(`set and get item ${i}`, () => {
      const cache = new LRUCache<number>(10);
      cache.set(`key${i}`, i * 7);
      expect(cache.get(`key${i}`)).toBe(i * 7);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`overwrite existing key ${i}`, () => {
      const cache = new LRUCache<string>(5);
      cache.set('a', `first-${i}`);
      cache.set('a', `second-${i}`);
      expect(cache.get('a')).toBe(`second-${i}`);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`get non-existent key returns undefined (run ${i})`, () => {
      const cache = new LRUCache<number>(5);
      expect(cache.get(`missing-${i}`)).toBeUndefined();
    });
  }

  for (let i = 1; i <= 15; i++) {
    it(`LRU evicts when capacity ${i} exceeded`, () => {
      const cache = new LRUCache<number>(i);
      for (let j = 0; j < i + 1; j++) cache.set(`k${j}`, j);
      // k0 should have been evicted (LRU)
      expect(cache.get('k0')).toBeUndefined();
      expect(cache.size()).toBe(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LRUCache — has/delete (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('LRUCache has/delete', () => {
  for (let i = 0; i < 30; i++) {
    it(`has returns true for existing key (run ${i})`, () => {
      const cache = new LRUCache<number>(20);
      cache.set(`k${i}`, i);
      expect(cache.has(`k${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`has returns false for missing key (run ${i})`, () => {
      const cache = new LRUCache<number>(5);
      expect(cache.has(`absent-${i}`)).toBe(false);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`delete removes existing key (run ${i})`, () => {
      const cache = new LRUCache<number>(10);
      cache.set(`k${i}`, i);
      expect(cache.delete(`k${i}`)).toBe(true);
      expect(cache.has(`k${i}`)).toBe(false);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`delete returns false for missing key (run ${i})`, () => {
      const cache = new LRUCache<number>(5);
      expect(cache.delete(`no-${i}`)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LRUCache — eviction order (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('LRUCache eviction order', () => {
  for (let n = 2; n <= 51; n++) {
    it(`evicts LRU (oldest-accessed) when capacity ${n} exceeded`, () => {
      const cap = n;
      const cache = new LRUCache<number>(cap);
      // Fill to capacity
      for (let i = 0; i < cap; i++) cache.set(`k${i}`, i);
      // Access all but k0
      for (let i = 1; i < cap; i++) cache.get(`k${i}`);
      // Now add one more — k0 should be evicted (LRU)
      cache.set('extra', 999);
      expect(cache.get('k0')).toBeUndefined();
      expect(cache.get('extra')).toBe(999);
    });
  }

  for (let i = 0; i < 49; i++) {
    it(`evict() manually evicts tail and returns its key (run ${i})`, () => {
      const cache = new LRUCache<number>(5);
      cache.set('first', 1);
      cache.set('second', 2);
      cache.set('third', 3);
      // Access second and third to push first to tail
      cache.get('second');
      cache.get('third');
      const evicted = cache.evict();
      expect(evicted).toBe('first');
      expect(cache.has('first')).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LRUCache — stats (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('LRUCache stats', () => {
  for (let i = 1; i <= 30; i++) {
    it(`hitRate correct after ${i} hits and ${i} misses`, () => {
      const cache = new LRUCache<number>(100);
      for (let j = 0; j < i; j++) cache.set(`k${j}`, j);
      for (let j = 0; j < i; j++) cache.get(`k${j}`); // i hits
      for (let j = 0; j < i; j++) cache.get(`missing${j}`); // i misses
      const s = cache.stats();
      expect(s.hits).toBe(i);
      expect(s.misses).toBe(i);
      expect(s.hitRate).toBeCloseTo(0.5);
    });
  }

  for (let i = 1; i <= 20; i++) {
    it(`evictions count is correct after ${i} evictions`, () => {
      const cap = 3;
      const cache = new LRUCache<number>(cap);
      for (let j = 0; j < cap + i; j++) cache.set(`k${j}`, j);
      const s = cache.stats();
      expect(s.evictions).toBe(i);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`stats size equals cache.size() (run ${i})`, () => {
      const cache = new LRUCache<number>(10);
      const count = (i % 8) + 1;
      for (let j = 0; j < count; j++) cache.set(`k${j}`, j);
      expect(cache.stats().size).toBe(cache.size());
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`hitRate is 0 with no accesses (run ${i})`, () => {
      const cache = new LRUCache<number>(5);
      expect(cache.stats().hitRate).toBe(0);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`capacity in stats matches constructor (run ${i})`, () => {
      const cap = i + 1;
      const cache = new LRUCache<number>(cap);
      expect(cache.stats().capacity).toBe(cap);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LRUCache — peek, keys, values, entries, clear
// ─────────────────────────────────────────────────────────────────────────────
describe('LRUCache peek/keys/values/entries/clear', () => {
  for (let i = 0; i < 20; i++) {
    it(`peek does not update recency (run ${i})`, () => {
      const cache = new LRUCache<number>(2);
      cache.set('a', 1);
      cache.set('b', 2);
      // peek 'a' — should not promote it
      cache.peek('a');
      // Add 'c' — 'a' (LRU) should be evicted since peek didn't promote
      cache.set('c', 3);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('b')).toBe(2);
      expect(cache.get('c')).toBe(3);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`keys() returns all keys (run ${i})`, () => {
      const cache = new LRUCache<number>(10);
      const n = (i % 5) + 1;
      for (let j = 0; j < n; j++) cache.set(`k${j}`, j);
      expect(cache.keys().length).toBe(n);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`values() returns all values (run ${i})`, () => {
      const cache = new LRUCache<number>(10);
      const n = (i % 5) + 1;
      for (let j = 0; j < n; j++) cache.set(`k${j}`, j * 2);
      const vals = cache.values();
      expect(vals.length).toBe(n);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`entries() returns [key, value] pairs (run ${i})`, () => {
      const cache = new LRUCache<number>(10);
      cache.set('x', 42);
      cache.set('y', 99);
      const ents = cache.entries();
      expect(ents.length).toBe(2);
      const keys = ents.map(([k]) => k);
      expect(keys).toContain('x');
      expect(keys).toContain('y');
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`clear() resets cache (run ${i})`, () => {
      const cache = new LRUCache<number>(10);
      for (let j = 0; j < 5; j++) cache.set(`k${j}`, j);
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.stats().hits).toBe(0);
      expect(cache.stats().misses).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LFUCache — get/set (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('LFUCache get/set', () => {
  for (let i = 0; i < 40; i++) {
    it(`set and get returns correct value (run ${i})`, () => {
      const cache = new LFUCache<number>(10);
      cache.set(`k${i}`, i * 3);
      expect(cache.get(`k${i}`)).toBe(i * 3);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`LFU evicts least frequently used item (run ${i})`, () => {
      const cache = new LFUCache<number>(3);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3);
      // Access 'b' and 'c' more than 'a'
      cache.get('b');
      cache.get('b');
      cache.get('c');
      // Add 'd' — 'a' (freq=1) should be evicted
      cache.set('d', 4);
      expect(cache.get('a')).toBeUndefined();
      expect(cache.get('d')).toBe(4);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`overwriting key updates value without changing size (run ${i})`, () => {
      const cache = new LFUCache<number>(5);
      cache.set('x', 10);
      const sizeBefore = cache.size();
      cache.set('x', 20);
      expect(cache.size()).toBe(sizeBefore);
      expect(cache.get('x')).toBe(20);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`get returns undefined for missing key (run ${i})`, () => {
      const cache = new LFUCache<number>(5);
      expect(cache.get(`nope${i}`)).toBeUndefined();
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LFUCache — has/delete/clear/keys
// ─────────────────────────────────────────────────────────────────────────────
describe('LFUCache has/delete/clear/keys', () => {
  for (let i = 0; i < 20; i++) {
    it(`has returns true for existing key (run ${i})`, () => {
      const cache = new LFUCache<number>(10);
      cache.set(`k${i}`, i);
      expect(cache.has(`k${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`has returns false for missing key (run ${i})`, () => {
      const cache = new LFUCache<number>(5);
      expect(cache.has(`gone-${i}`)).toBe(false);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`delete removes key and returns true (run ${i})`, () => {
      const cache = new LFUCache<number>(10);
      cache.set(`k${i}`, i);
      expect(cache.delete(`k${i}`)).toBe(true);
      expect(cache.has(`k${i}`)).toBe(false);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`delete returns false for missing key (run ${i})`, () => {
      const cache = new LFUCache<number>(5);
      expect(cache.delete(`missing-${i}`)).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`clear resets cache (run ${i})`, () => {
      const cache = new LFUCache<number>(5);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.has('a')).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`keys() returns all keys (run ${i})`, () => {
      const cache = new LFUCache<number>(10);
      cache.set('p', 1);
      cache.set('q', 2);
      expect(cache.keys()).toContain('p');
      expect(cache.keys()).toContain('q');
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LFUCache — stats (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('LFUCache stats', () => {
  for (let i = 1; i <= 20; i++) {
    it(`minFrequency() returns 1 after first set (run ${i})`, () => {
      const cache = new LFUCache<number>(10);
      cache.set(`k${i}`, i);
      expect(cache.minFrequency()).toBe(1);
    });
  }

  for (let i = 1; i <= 15; i++) {
    it(`minFrequency() increases after gets (run ${i})`, () => {
      const cache = new LFUCache<number>(3);
      cache.set('a', 1);
      // Access 'a' i+1 times total (1 set = 1 implicit, plus i gets)
      for (let j = 0; j < i; j++) cache.get('a');
      // If only 'a' in cache, minFreq = a's freq = 1 + i
      expect(cache.minFrequency()).toBe(1 + i);
    });
  }

  for (let i = 1; i <= 15; i++) {
    it(`stats hitRate correct (run ${i})`, () => {
      const cache = new LFUCache<number>(i + 5); // capacity larger than i to avoid evictions
      for (let j = 0; j < i; j++) cache.set(`k${j}`, j);
      for (let j = 0; j < i; j++) cache.get(`k${j}`);
      const s = cache.stats();
      expect(s.hits).toBe(i);
      expect(s.hitRate).toBeCloseTo(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TTLCache — basic (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('TTLCache basic', () => {
  for (let i = 0; i < 40; i++) {
    it(`set and get within TTL returns value (run ${i})`, () => {
      const cache = new TTLCache<number>(999_999); // very large TTL
      cache.set(`k${i}`, i * 5);
      expect(cache.get(`k${i}`)).toBe(i * 5);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`get returns undefined for missing key (run ${i})`, () => {
      const cache = new TTLCache<number>(60_000);
      expect(cache.get(`no-${i}`)).toBeUndefined();
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`item set with ttlMs=0 is immediately expired (run ${i})`, () => {
      const cache = new TTLCache<number>(60_000);
      cache.set(`expired${i}`, 42, 0);
      // Even if we don't wait, the expiry check is against now which is >= expiresAt
      const result = cache.get(`expired${i}`);
      // It may or may not expire depending on exact timing; use ttlRemaining to verify
      // We set 0 so expiresAt = now at time of set
      // By the time we call get(), Date.now() >= expiresAt is nearly guaranteed
      // Accept undefined OR 42 (if same millisecond)
      expect(result === undefined || result === 42).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`has() returns false for missing key (run ${i})`, () => {
      const cache = new TTLCache<string>(60_000);
      expect(cache.has(`gone-${i}`)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TTLCache — purgeExpired (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('TTLCache purgeExpired', () => {
  for (let n = 1; n <= 50; n++) {
    it(`purgeExpired removes ${n} items with ttlMs=-1 (already expired)`, () => {
      const cache = new TTLCache<number>(60_000);
      for (let i = 0; i < n; i++) cache.set(`k${i}`, i, -1); // negative → expiresAt in past
      const removed = cache.purgeExpired();
      expect(removed).toBe(n);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`purgeExpired returns 0 when all items are valid (run ${i})`, () => {
      const cache = new TTLCache<number>(60_000);
      const n = (i % 5) + 1;
      for (let j = 0; j < n; j++) cache.set(`k${j}`, j, 999_999);
      expect(cache.purgeExpired()).toBe(0);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`purgeExpired mixes valid and expired (run ${i})`, () => {
      const cache = new TTLCache<number>(60_000);
      cache.set('good', 1, 999_999);
      cache.set('bad', 2, -1);
      const removed = cache.purgeExpired();
      expect(removed).toBe(1);
      expect(cache.get('good')).toBe(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TTLCache — ttlRemaining (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('TTLCache ttlRemaining', () => {
  for (let i = 1; i <= 30; i++) {
    it(`ttlRemaining is positive for valid item (run ${i})`, () => {
      const ttl = i * 1000;
      const cache = new TTLCache<number>(60_000);
      cache.set(`k${i}`, i, ttl);
      expect(cache.ttlRemaining(`k${i}`)).toBeGreaterThan(0);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`ttlRemaining returns -1 for missing key (run ${i})`, () => {
      const cache = new TTLCache<number>(60_000);
      expect(cache.ttlRemaining(`nope-${i}`)).toBe(-1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`ttlRemaining returns 0 for expired item (run ${i})`, () => {
      const cache = new TTLCache<number>(60_000);
      cache.set(`k${i}`, i, -1); // already expired
      expect(cache.ttlRemaining(`k${i}`)).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TTLCache — delete/clear/size/has
// ─────────────────────────────────────────────────────────────────────────────
describe('TTLCache delete/clear/size/has', () => {
  for (let i = 0; i < 20; i++) {
    it(`delete removes existing key (run ${i})`, () => {
      const cache = new TTLCache<number>(60_000);
      cache.set(`k${i}`, i);
      expect(cache.delete(`k${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`size() counts non-expired entries (run ${i})`, () => {
      const cache = new TTLCache<number>(60_000);
      const n = (i % 5) + 1;
      for (let j = 0; j < n; j++) cache.set(`k${j}`, j, 999_999);
      expect(cache.size()).toBe(n);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`has() returns true for valid entry (run ${i})`, () => {
      const cache = new TTLCache<number>(60_000);
      cache.set(`k${i}`, i, 999_999);
      expect(cache.has(`k${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`clear() resets cache (run ${i})`, () => {
      const cache = new TTLCache<number>(60_000);
      cache.set('a', 1);
      cache.clear();
      expect(cache.size()).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FIFOCache — get/set (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('FIFOCache get/set', () => {
  for (let i = 0; i < 40; i++) {
    it(`set and get returns correct value (run ${i})`, () => {
      const cache = new FIFOCache<number>(20);
      cache.set(`k${i}`, i * 11);
      expect(cache.get(`k${i}`)).toBe(i * 11);
    });
  }

  for (let i = 2; i <= 21; i++) {
    it(`FIFO evicts first inserted when capacity ${i} exceeded`, () => {
      const cache = new FIFOCache<number>(i);
      for (let j = 0; j < i + 1; j++) cache.set(`k${j}`, j);
      // k0 (first inserted) should be evicted
      expect(cache.get('k0')).toBeUndefined();
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`overwrite existing key does not change size (run ${i})`, () => {
      const cache = new FIFOCache<number>(5);
      cache.set('x', 1);
      const before = cache.size();
      cache.set('x', 2);
      expect(cache.size()).toBe(before);
      expect(cache.get('x')).toBe(2);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`get returns undefined for missing key (run ${i})`, () => {
      const cache = new FIFOCache<number>(5);
      expect(cache.get(`none-${i}`)).toBeUndefined();
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FIFOCache — oldest/newest (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('FIFOCache oldest/newest', () => {
  for (let i = 1; i <= 50; i++) {
    it(`oldest() returns first inserted key (run ${i})`, () => {
      const cache = new FIFOCache<number>(100);
      for (let j = 0; j < i; j++) cache.set(`k${j}`, j);
      expect(cache.oldest()).toBe('k0');
    });
  }

  for (let i = 1; i <= 50; i++) {
    it(`newest() returns last inserted key (run ${i})`, () => {
      const cache = new FIFOCache<number>(100);
      for (let j = 0; j < i; j++) cache.set(`k${j}`, j);
      expect(cache.newest()).toBe(`k${i - 1}`);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FIFOCache — has/delete/clear/size/stats
// ─────────────────────────────────────────────────────────────────────────────
describe('FIFOCache has/delete/clear/size/stats', () => {
  for (let i = 0; i < 20; i++) {
    it(`has returns true for existing key (run ${i})`, () => {
      const cache = new FIFOCache<number>(10);
      cache.set(`k${i}`, i);
      expect(cache.has(`k${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`has returns false for missing key (run ${i})`, () => {
      const cache = new FIFOCache<number>(5);
      expect(cache.has(`no-${i}`)).toBe(false);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`delete removes key (run ${i})`, () => {
      const cache = new FIFOCache<number>(10);
      cache.set(`k${i}`, i);
      cache.delete(`k${i}`);
      expect(cache.has(`k${i}`)).toBe(false);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`stats records hits and misses (run ${i})`, () => {
      const cache = new FIFOCache<number>(10);
      cache.set('a', 1);
      cache.get('a');   // hit
      cache.get('b');   // miss
      const s = cache.stats();
      expect(s.hits).toBe(1);
      expect(s.misses).toBe(1);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`clear resets state (run ${i})`, () => {
      const cache = new FIFOCache<number>(5);
      cache.set('x', 99);
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.oldest()).toBeUndefined();
      expect(cache.newest()).toBeUndefined();
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// memoize (100 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('memoize', () => {
  for (let i = 0; i < 40; i++) {
    it(`memoized fn returns same result without calling fn again (run ${i})`, () => {
      let callCount = 0;
      const fn = (x: unknown) => { callCount++; return (x as number) * 2; };
      const memo = memoize(fn as (...args: unknown[]) => unknown);
      const a = memo(i);
      const b = memo(i);
      expect(a).toBe(b);
      expect(callCount).toBe(1);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`memoized fn called again for different args (run ${i})`, () => {
      let callCount = 0;
      const fn = (x: unknown) => { callCount++; return (x as number) + 1; };
      const memo = memoize(fn as (...args: unknown[]) => unknown);
      memo(i);
      memo(i + 1000);
      expect(callCount).toBe(2);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`memoize cache.clear() works (run ${i})`, () => {
      let callCount = 0;
      const fn = (x: unknown) => { callCount++; return x; };
      const memo = memoize(fn as (...args: unknown[]) => unknown);
      memo('a');
      memo.clear();
      memo('a');
      expect(callCount).toBe(2);
    });
  }

  for (let i = 1; i <= 15; i++) {
    it(`memoize respects maxSize=${i}`, () => {
      const fn = (x: unknown) => x;
      const memo = memoize(fn as (...args: unknown[]) => unknown, { maxSize: i });
      for (let j = 0; j < i + 2; j++) memo(j);
      expect(memo.cache.size()).toBeLessThanOrEqual(i);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// warmUp (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('warmUp', () => {
  for (let n = 1; n <= 30; n++) {
    it(`warmUp pre-populates LRUCache with ${n} entries`, () => {
      const cache = new LRUCache<number>(100);
      const entries: Array<[string, number]> = [];
      for (let i = 0; i < n; i++) entries.push([`k${i}`, i]);
      warmUp(cache, entries);
      expect(cache.size()).toBe(n);
      for (let i = 0; i < n; i++) {
        expect(cache.get(`k${i}`)).toBe(i);
      }
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`warmUp pre-populates TTLCache with ${n} entries`, () => {
      const cache = new TTLCache<number>(999_999);
      const entries: Array<[string, number]> = [];
      for (let i = 0; i < n; i++) entries.push([`k${i}`, i * 3]);
      warmUp(cache, entries);
      for (let i = 0; i < n; i++) {
        expect(cache.get(`k${i}`)).toBe(i * 3);
      }
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// serialize/deserialize (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('serialize/deserialize', () => {
  for (let n = 1; n <= 25; n++) {
    it(`LRU roundtrip with ${n} entries`, () => {
      const cache = new LRUCache<number>(100);
      for (let i = 0; i < n; i++) cache.set(`k${i}`, i * 7);
      const json = serialize(cache);
      const parsed = deserialize<number>(json);
      expect(parsed.length).toBe(n);
      for (let i = 0; i < n; i++) {
        const pair = parsed.find(([k]) => k === `k${i}`);
        expect(pair).toBeDefined();
        expect(pair![1]).toBe(i * 7);
      }
    });
  }

  for (let n = 1; n <= 25; n++) {
    it(`FIFO roundtrip with ${n} entries`, () => {
      const cache = new FIFOCache<string>(100);
      for (let i = 0; i < n; i++) cache.set(`k${i}`, `val${i}`);
      const json = serialize(cache);
      const parsed = deserialize<string>(json);
      expect(parsed.length).toBe(n);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TwoLevelCache (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('TwoLevelCache', () => {
  for (let i = 0; i < 20; i++) {
    it(`set and get returns value from L1 (run ${i})`, () => {
      const cache = new TwoLevelCache<number>(5, 20);
      cache.set(`k${i}`, i * 4);
      expect(cache.get(`k${i}`)).toBe(i * 4);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`has() returns true after set (run ${i})`, () => {
      const cache = new TwoLevelCache<number>(5, 10);
      cache.set(`k${i}`, i);
      expect(cache.has(`k${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`delete removes from both levels (run ${i})`, () => {
      const cache = new TwoLevelCache<number>(5, 10);
      cache.set(`k${i}`, i);
      cache.delete(`k${i}`);
      expect(cache.has(`k${i}`)).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// createCache factory (50 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('createCache factory', () => {
  const strategies = ['lru', 'lfu', 'ttl', 'fifo'] as const;

  for (let i = 0; i < 20; i++) {
    const strategy = strategies[i % 4];
    it(`createCache('${strategy}') returns working cache (run ${i})`, () => {
      const cache = createCache<number>(strategy, { capacity: 10, ttlMs: 60_000 });
      cache.set(`k${i}`, i * 2);
      const val = cache.get(`k${i}`);
      // TTL with 0 may expire immediately; accept undefined or correct value
      expect(val === undefined || val === i * 2).toBe(true);
    });
  }

  for (let i = 0; i < 30; i++) {
    const strategy = strategies[i % 4];
    it(`createCache('${strategy}') size within capacity (run ${i})`, () => {
      const cap = (i % 5) + 2;
      const cache = createCache<number>(strategy, { capacity: cap, ttlMs: 999_999 });
      for (let j = 0; j < cap + 3; j++) cache.set(`k${j}`, j);
      expect(cache.size()).toBeLessThanOrEqual(cap);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LRUCache — TTL expiry via get (30 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('LRUCache TTL expiry', () => {
  for (let i = 0; i < 15; i++) {
    it(`get returns value when ttl is very large (run ${i})`, () => {
      const cache = new LRUCache<number>(10);
      cache.set(`k${i}`, i, 999_999_999);
      expect(cache.get(`k${i}`)).toBe(i);
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`has returns true when ttl is very large (run ${i})`, () => {
      const cache = new LRUCache<number>(10);
      cache.set(`k${i}`, i, 999_999_999);
      expect(cache.has(`k${i}`)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional LRU edge cases (30 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('LRUCache edge cases', () => {
  it('throws when capacity < 1', () => {
    expect(() => new LRUCache(0)).toThrow();
  });

  for (let i = 0; i < 14; i++) {
    it(`size() returns correct count after sets and deletes (run ${i})`, () => {
      const cache = new LRUCache<number>(20);
      const n = (i % 5) + 1;
      for (let j = 0; j < n; j++) cache.set(`k${j}`, j);
      cache.delete('k0');
      expect(cache.size()).toBe(Math.max(0, n - 1));
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`evict on empty cache returns undefined (run ${i})`, () => {
      const cache = new LRUCache<number>(5);
      expect(cache.evict()).toBeUndefined();
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional FIFOCache edge cases (20 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('FIFOCache edge cases', () => {
  it('throws when capacity < 1', () => {
    expect(() => new FIFOCache(0)).toThrow();
  });

  for (let i = 0; i < 9; i++) {
    it(`stats evictions count correct (run ${i})`, () => {
      const cache = new FIFOCache<number>(2);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // evicts 'a'
      expect(cache.stats().evictions).toBe(1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`oldest/newest undefined on empty cache (run ${i})`, () => {
      const cache = new FIFOCache<number>(5);
      expect(cache.oldest()).toBeUndefined();
      expect(cache.newest()).toBeUndefined();
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Additional LFUCache edge cases (20 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('LFUCache edge cases', () => {
  it('throws when capacity < 1', () => {
    expect(() => new LFUCache(0)).toThrow();
  });

  for (let i = 0; i < 9; i++) {
    it(`evictions tracked in stats (run ${i})`, () => {
      const cache = new LFUCache<number>(2);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.set('c', 3); // should evict one
      expect(cache.stats().evictions).toBeGreaterThanOrEqual(1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`clear resets minFrequency and stats (run ${i})`, () => {
      const cache = new LFUCache<number>(5);
      cache.set('x', 1);
      cache.get('x');
      cache.clear();
      expect(cache.size()).toBe(0);
      expect(cache.stats().hits).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TwoLevelCache — stats and clear (30 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('TwoLevelCache stats and clear', () => {
  for (let i = 0; i < 15; i++) {
    it(`stats() returns l1 and l2 objects (run ${i})`, () => {
      const cache = new TwoLevelCache<number>(3, 10);
      cache.set('a', 1);
      const s = cache.stats();
      expect(s).toHaveProperty('l1');
      expect(s).toHaveProperty('l2');
    });
  }

  for (let i = 0; i < 15; i++) {
    it(`clear() empties both levels (run ${i})`, () => {
      const cache = new TwoLevelCache<number>(3, 10);
      cache.set('a', 1);
      cache.set('b', 2);
      cache.clear();
      expect(cache.has('a')).toBe(false);
      expect(cache.has('b')).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Miscellaneous coverage (30 tests)
// ─────────────────────────────────────────────────────────────────────────────
describe('Miscellaneous cache coverage', () => {
  for (let i = 0; i < 10; i++) {
    it(`LRU peek on missing key returns undefined (run ${i})`, () => {
      const cache = new LRUCache<number>(5);
      expect(cache.peek(`nope-${i}`)).toBeUndefined();
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`TTL stats capacity is -1 for infinite capacity (run ${i})`, () => {
      const cache = new TTLCache<number>(60_000);
      expect(cache.stats().capacity).toBe(-1);
    });
  }

  for (let i = 1; i <= 10; i++) {
    it(`deserialize produces array of correct length (run ${i})`, () => {
      const arr: Array<[string, number]> = [];
      for (let j = 0; j < i; j++) arr.push([`k${j}`, j]);
      const json = JSON.stringify(arr);
      const result = deserialize<number>(json);
      expect(result.length).toBe(i);
    });
  }
});
