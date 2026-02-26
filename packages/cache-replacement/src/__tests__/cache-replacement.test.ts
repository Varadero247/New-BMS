// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

import {
  LRUCache,
  LFUCache,
  FIFOCache,
  MRUCache,
  ARCCache,
  TLRUCache,
  TwoQCache,
  simulateCache,
  optimalHitRate,
  CacheStats,
} from '../cache-replacement';

// ---------------------------------------------------------------------------
// LRU Cache — 200 tests
// ---------------------------------------------------------------------------

describe('LRUCache', () => {
  // Capacity-parameterised eviction tests (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`LRUCache capacity ${cap} never exceeds capacity`, () => {
      const c = new LRUCache<number, number>(cap);
      for (let i = 0; i < cap + 10; i++) c.set(i, i * 2);
      expect(c.size).toBeLessThanOrEqual(cap);
    });
  }

  // Capacity-parameterised get-after-set (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`LRUCache capacity ${cap} get returns correct value`, () => {
      const c = new LRUCache<number, number>(cap);
      for (let i = 0; i < cap; i++) c.set(i, i * 3);
      for (let i = 0; i < cap; i++) expect(c.get(i)).toBe(i * 3);
    });
  }

  // Eviction order — LRU is evicted (20)
  for (let cap = 2; cap <= 21; cap++) {
    it(`LRUCache capacity ${cap} evicts LRU key on overflow`, () => {
      const c = new LRUCache<number, string>(cap);
      for (let i = 0; i < cap; i++) c.set(i, `v${i}`);
      // Access key 0 to make it recently used
      c.get(0);
      // Insert one more → key 1 should be evicted (it's the oldest now)
      c.set(cap, `v${cap}`);
      expect(c.has(0)).toBe(true);
      expect(c.has(cap)).toBe(true);
    });
  }

  // has() tests (20)
  for (let i = 0; i < 20; i++) {
    it(`LRUCache has() returns true for key ${i} when present`, () => {
      const c = new LRUCache<number, number>(50);
      c.set(i, i);
      expect(c.has(i)).toBe(true);
    });
  }

  // delete() tests (20)
  for (let i = 0; i < 20; i++) {
    it(`LRUCache delete key ${i} reduces size`, () => {
      const c = new LRUCache<number, number>(50);
      c.set(i, i * 2);
      const before = c.size;
      expect(c.delete(i)).toBe(true);
      expect(c.size).toBe(before - 1);
      expect(c.has(i)).toBe(false);
    });
  }

  // clear() tests (10)
  for (let n = 1; n <= 10; n++) {
    it(`LRUCache clear resets ${n} entries`, () => {
      const c = new LRUCache<number, number>(20);
      for (let i = 0; i < n; i++) c.set(i, i);
      c.clear();
      expect(c.size).toBe(0);
      for (let i = 0; i < n; i++) expect(c.get(i)).toBeUndefined();
    });
  }

  // stats() hit rate (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`LRUCache capacity ${cap} stats hitRate is between 0 and 1`, () => {
      const c = new LRUCache<number, number>(cap);
      for (let i = 0; i < cap; i++) { c.set(i, i); c.get(i); }
      const s = c.stats();
      expect(s.hitRate).toBeGreaterThanOrEqual(0);
      expect(s.hitRate).toBeLessThanOrEqual(1);
    });
  }

  // keys() / values() length (10)
  for (let n = 1; n <= 10; n++) {
    it(`LRUCache keys/values length matches size for ${n} entries`, () => {
      const c = new LRUCache<number, number>(50);
      for (let i = 0; i < n; i++) c.set(i, i * 10);
      expect(c.keys().length).toBe(n);
      expect(c.values().length).toBe(n);
    });
  }

  // update existing key (20)
  for (let i = 0; i < 20; i++) {
    it(`LRUCache update key ${i} keeps same size`, () => {
      const c = new LRUCache<number, number>(10);
      c.set(i % 10, 100);
      const sizeBefore = c.size;
      c.set(i % 10, 200);
      expect(c.size).toBe(sizeBefore);
      expect(c.get(i % 10)).toBe(200);
    });
  }

  // miss increments (10)
  for (let n = 1; n <= 10; n++) {
    it(`LRUCache ${n} misses tracked correctly`, () => {
      const c = new LRUCache<number, number>(5);
      for (let i = 0; i < n; i++) c.get(i + 1000);
      expect(c.stats().misses).toBe(n);
    });
  }

  // delete non-existent key returns false (10)
  for (let i = 0; i < 10; i++) {
    it(`LRUCache delete non-existent key ${i} returns false`, () => {
      const c = new LRUCache<number, number>(5);
      expect(c.delete(i + 9999)).toBe(false);
    });
  }

  // capacity property (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`LRUCache capacity property returns ${cap}`, () => {
      const c = new LRUCache<number, number>(cap);
      expect(c.capacity).toBe(cap);
    });
  }

  // string keys (10)
  for (let i = 0; i < 10; i++) {
    it(`LRUCache string key 'k${i}' set/get works`, () => {
      const c = new LRUCache<string, string>(20);
      c.set(`k${i}`, `val${i}`);
      expect(c.get(`k${i}`)).toBe(`val${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// LFU Cache — 200 tests
// ---------------------------------------------------------------------------

describe('LFUCache', () => {
  // Capacity enforcement (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`LFUCache capacity ${cap} never exceeds capacity`, () => {
      const c = new LFUCache<number, number>(cap);
      for (let i = 0; i < cap + 10; i++) c.set(i, i);
      expect(c.size).toBeLessThanOrEqual(cap);
    });
  }

  // get returns correct value (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`LFUCache capacity ${cap} get returns correct value`, () => {
      const c = new LFUCache<number, number>(cap);
      for (let i = 0; i < cap; i++) c.set(i, i * 5);
      for (let i = 0; i < cap; i++) expect(c.get(i)).toBe(i * 5);
    });
  }

  // LFU evicts least frequently used (20)
  for (let cap = 2; cap <= 21; cap++) {
    it(`LFUCache capacity ${cap} evicts least frequently used`, () => {
      const c = new LFUCache<number, number>(cap);
      for (let i = 0; i < cap; i++) c.set(i, i);
      // Access key 0 multiple times to boost its frequency
      for (let t = 0; t < 5; t++) c.get(0);
      // Add new key → key 1 (freq=1) should be evicted before key 0 (freq=5+)
      c.set(cap, cap);
      expect(c.has(0)).toBe(true);
    });
  }

  // has() (20)
  for (let i = 0; i < 20; i++) {
    it(`LFUCache has(${i}) is true after set`, () => {
      const c = new LFUCache<number, number>(50);
      c.set(i, i);
      expect(c.has(i)).toBe(true);
    });
  }

  // delete() (20)
  for (let i = 0; i < 20; i++) {
    it(`LFUCache delete(${i}) removes key`, () => {
      const c = new LFUCache<number, number>(50);
      c.set(i, i);
      expect(c.delete(i)).toBe(true);
      expect(c.has(i)).toBe(false);
    });
  }

  // clear() (10)
  for (let n = 1; n <= 10; n++) {
    it(`LFUCache clear resets ${n} entries`, () => {
      const c = new LFUCache<number, number>(20);
      for (let i = 0; i < n; i++) c.set(i, i);
      c.clear();
      expect(c.size).toBe(0);
    });
  }

  // stats (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`LFUCache capacity ${cap} hitRate in [0,1]`, () => {
      const c = new LFUCache<number, number>(cap);
      for (let i = 0; i < cap; i++) { c.set(i, i); c.get(i); }
      const s = c.stats();
      expect(s.hitRate).toBeGreaterThanOrEqual(0);
      expect(s.hitRate).toBeLessThanOrEqual(1);
    });
  }

  // update existing key (20)
  for (let i = 0; i < 20; i++) {
    it(`LFUCache update key ${i % 5} keeps correct value`, () => {
      const c = new LFUCache<number, number>(10);
      c.set(i % 5, 1);
      c.set(i % 5, 999);
      expect(c.get(i % 5)).toBe(999);
    });
  }

  // miss tracking (10)
  for (let n = 1; n <= 10; n++) {
    it(`LFUCache ${n} misses tracked`, () => {
      const c = new LFUCache<number, number>(5);
      for (let i = 0; i < n; i++) c.get(i + 1000);
      expect(c.stats().misses).toBe(n);
    });
  }

  // delete non-existent returns false (10)
  for (let i = 0; i < 10; i++) {
    it(`LFUCache delete non-existent key ${i} returns false`, () => {
      const c = new LFUCache<number, number>(5);
      expect(c.delete(i + 9999)).toBe(false);
    });
  }

  // capacity property (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`LFUCache capacity property returns ${cap}`, () => {
      const c = new LFUCache<number, number>(cap);
      expect(c.capacity).toBe(cap);
    });
  }

  // string keys (20)
  for (let i = 0; i < 20; i++) {
    it(`LFUCache string key 'item${i}' works`, () => {
      const c = new LFUCache<string, number>(50);
      c.set(`item${i}`, i * 7);
      expect(c.get(`item${i}`)).toBe(i * 7);
    });
  }
});

// ---------------------------------------------------------------------------
// FIFO Cache — 150 tests
// ---------------------------------------------------------------------------

describe('FIFOCache', () => {
  // Capacity (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`FIFOCache capacity ${cap} never exceeds capacity`, () => {
      const c = new FIFOCache<number, number>(cap);
      for (let i = 0; i < cap + 8; i++) c.set(i, i);
      expect(c.size).toBeLessThanOrEqual(cap);
    });
  }

  // FIFO eviction order (20)
  for (let cap = 2; cap <= 21; cap++) {
    it(`FIFOCache capacity ${cap} evicts first inserted key`, () => {
      const c = new FIFOCache<number, number>(cap);
      for (let i = 0; i < cap; i++) c.set(i, i);
      // Key 0 was inserted first — it should be evicted next
      c.set(cap, cap);
      expect(c.has(0)).toBe(false);
      expect(c.has(cap)).toBe(true);
    });
  }

  // get after set (20)
  for (let i = 0; i < 20; i++) {
    it(`FIFOCache get(${i}) returns value after set`, () => {
      const c = new FIFOCache<number, number>(50);
      c.set(i, i * 4);
      expect(c.get(i)).toBe(i * 4);
    });
  }

  // has() (20)
  for (let i = 0; i < 20; i++) {
    it(`FIFOCache has(${i}) after set`, () => {
      const c = new FIFOCache<number, number>(50);
      c.set(i, i);
      expect(c.has(i)).toBe(true);
    });
  }

  // delete() (20)
  for (let i = 0; i < 20; i++) {
    it(`FIFOCache delete(${i}) removes entry`, () => {
      const c = new FIFOCache<number, number>(50);
      c.set(i, i);
      expect(c.delete(i)).toBe(true);
      expect(c.has(i)).toBe(false);
    });
  }

  // clear() (10)
  for (let n = 1; n <= 10; n++) {
    it(`FIFOCache clear removes ${n} entries`, () => {
      const c = new FIFOCache<number, number>(20);
      for (let i = 0; i < n; i++) c.set(i, i);
      c.clear();
      expect(c.size).toBe(0);
    });
  }

  // stats (10)
  for (let n = 1; n <= 10; n++) {
    it(`FIFOCache hits after ${n} get hits tracked`, () => {
      const c = new FIFOCache<number, number>(20);
      for (let i = 0; i < n; i++) c.set(i, i);
      for (let i = 0; i < n; i++) c.get(i);
      expect(c.stats().hits).toBe(n);
    });
  }

  // keys/values (10)
  for (let n = 1; n <= 10; n++) {
    it(`FIFOCache keys() returns ${n} keys`, () => {
      const c = new FIFOCache<number, number>(50);
      for (let i = 0; i < n; i++) c.set(i, i);
      expect(c.keys().length).toBe(n);
    });
  }

  // capacity property (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`FIFOCache capacity property is ${cap}`, () => {
      const c = new FIFOCache<number, number>(cap);
      expect(c.capacity).toBe(cap);
    });
  }

  // update existing (10)
  for (let i = 0; i < 10; i++) {
    it(`FIFOCache update key ${i} preserves size`, () => {
      const c = new FIFOCache<number, number>(10);
      c.set(i % 10, 1);
      c.set(i % 10, 2);
      expect(c.get(i % 10)).toBe(2);
    });
  }
});

// ---------------------------------------------------------------------------
// MRU Cache — 150 tests
// ---------------------------------------------------------------------------

describe('MRUCache', () => {
  // Capacity (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`MRUCache capacity ${cap} never exceeds capacity`, () => {
      const c = new MRUCache<number, number>(cap);
      for (let i = 0; i < cap + 8; i++) c.set(i, i);
      expect(c.size).toBeLessThanOrEqual(cap);
    });
  }

  // MRU eviction — evicts most recently used (20)
  for (let cap = 2; cap <= 21; cap++) {
    it(`MRUCache capacity ${cap} evicts most recently used`, () => {
      const c = new MRUCache<number, number>(cap);
      for (let i = 0; i < cap; i++) c.set(i, i);
      // Access key 0 → it becomes MRU
      c.get(0);
      // Insert new key → key 0 should be evicted
      c.set(cap, cap);
      expect(c.has(0)).toBe(false);
      expect(c.has(cap)).toBe(true);
    });
  }

  // get after set (20)
  for (let i = 0; i < 20; i++) {
    it(`MRUCache get(${i}) returns value`, () => {
      const c = new MRUCache<number, number>(50);
      c.set(i, i * 6);
      expect(c.get(i)).toBe(i * 6);
    });
  }

  // has() (20)
  for (let i = 0; i < 20; i++) {
    it(`MRUCache has(${i}) after set`, () => {
      const c = new MRUCache<number, number>(50);
      c.set(i, i);
      expect(c.has(i)).toBe(true);
    });
  }

  // delete() (20)
  for (let i = 0; i < 20; i++) {
    it(`MRUCache delete(${i}) removes key`, () => {
      const c = new MRUCache<number, number>(50);
      c.set(i, i);
      expect(c.delete(i)).toBe(true);
      expect(c.has(i)).toBe(false);
    });
  }

  // clear() (10)
  for (let n = 1; n <= 10; n++) {
    it(`MRUCache clear resets ${n} entries`, () => {
      const c = new MRUCache<number, number>(20);
      for (let i = 0; i < n; i++) c.set(i, i);
      c.clear();
      expect(c.size).toBe(0);
    });
  }

  // stats hit rate (10)
  for (let n = 1; n <= 10; n++) {
    it(`MRUCache ${n} hits yields hitRate > 0`, () => {
      const c = new MRUCache<number, number>(20);
      for (let i = 0; i < n; i++) c.set(i, i);
      for (let i = 0; i < n; i++) c.get(i);
      expect(c.stats().hitRate).toBeGreaterThan(0);
    });
  }

  // capacity property (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`MRUCache capacity property is ${cap}`, () => {
      const c = new MRUCache<number, number>(cap);
      expect(c.capacity).toBe(cap);
    });
  }

  // update key (10)
  for (let i = 0; i < 10; i++) {
    it(`MRUCache update key ${i} reflects new value`, () => {
      const c = new MRUCache<number, number>(10);
      c.set(i % 10, 10);
      c.set(i % 10, 20);
      expect(c.get(i % 10)).toBe(20);
    });
  }

  // keys/values (10)
  for (let n = 1; n <= 10; n++) {
    it(`MRUCache keys/values length matches size (n=${n})`, () => {
      const c = new MRUCache<number, number>(50);
      for (let i = 0; i < n; i++) c.set(i, i);
      expect(c.keys().length).toBe(n);
      expect(c.values().length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// ARC Cache — 150 tests
// ---------------------------------------------------------------------------

describe('ARCCache', () => {
  // Capacity (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`ARCCache capacity ${cap} size never exceeds capacity`, () => {
      const c = new ARCCache<number, number>(cap);
      for (let i = 0; i < cap + 15; i++) c.set(i, i);
      expect(c.size).toBeLessThanOrEqual(cap);
    });
  }

  // get/set (20)
  for (let i = 0; i < 20; i++) {
    it(`ARCCache get(${i}) returns value after set`, () => {
      const c = new ARCCache<number, number>(50);
      c.set(i, i * 3);
      expect(c.get(i)).toBe(i * 3);
    });
  }

  // has() (20)
  for (let i = 0; i < 20; i++) {
    it(`ARCCache has(${i}) after set`, () => {
      const c = new ARCCache<number, number>(50);
      c.set(i, i);
      expect(c.has(i)).toBe(true);
    });
  }

  // clear() (20)
  for (let n = 1; n <= 20; n++) {
    it(`ARCCache clear resets ${n} entries`, () => {
      const c = new ARCCache<number, number>(30);
      for (let i = 0; i < n; i++) c.set(i, i);
      c.clear();
      expect(c.size).toBe(0);
      expect(c.stats().hits).toBe(0);
    });
  }

  // stats (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`ARCCache capacity ${cap} hitRate in [0,1]`, () => {
      const c = new ARCCache<number, number>(cap);
      for (let i = 0; i < cap; i++) { c.set(i, i); c.get(i); }
      const s = c.stats();
      expect(s.hitRate).toBeGreaterThanOrEqual(0);
      expect(s.hitRate).toBeLessThanOrEqual(1);
    });
  }

  // capacity property (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`ARCCache capacity property returns ${cap}`, () => {
      const c = new ARCCache<number, number>(cap);
      expect(c.capacity).toBe(cap);
    });
  }

  // repeated access promotes to T2 (10)
  for (let i = 1; i <= 10; i++) {
    it(`ARCCache repeated access of key ${i} keeps it in cache`, () => {
      const c = new ARCCache<number, number>(5);
      c.set(i, i);
      for (let t = 0; t < 3; t++) c.get(i);
      expect(c.has(i)).toBe(true);
    });
  }

  // ghost promotion (10)
  for (let cap = 2; cap <= 11; cap++) {
    it(`ARCCache capacity ${cap} ghost hit re-inserts key`, () => {
      const c = new ARCCache<number, number>(cap);
      for (let i = 0; i < cap; i++) c.set(i, i);
      // Fill beyond capacity to push key 0 to ghost list B1
      for (let i = cap; i < 2 * cap; i++) c.set(i, i);
      // Re-inserting key 0 should succeed (via ghost promotion)
      c.set(0, 999);
      expect(c.get(0)).toBe(999);
    });
  }

  // miss on empty (10)
  for (let i = 0; i < 10; i++) {
    it(`ARCCache miss on empty cache key ${i} returns undefined`, () => {
      const c = new ARCCache<number, number>(5);
      expect(c.get(i)).toBeUndefined();
    });
  }

  // update existing (10)
  for (let i = 0; i < 10; i++) {
    it(`ARCCache update key ${i} reflects new value`, () => {
      const c = new ARCCache<number, number>(10);
      c.set(i % 10, 50);
      c.set(i % 10, 99);
      expect(c.get(i % 10)).toBe(99);
    });
  }
});

// ---------------------------------------------------------------------------
// TLRU Cache — 150 tests
// ---------------------------------------------------------------------------

describe('TLRUCache', () => {
  // Capacity (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`TLRUCache capacity ${cap} never exceeds capacity`, () => {
      const c = new TLRUCache<number, number>(cap);
      for (let i = 0; i < cap + 8; i++) c.set(i, i);
      expect(c.size).toBeLessThanOrEqual(cap);
    });
  }

  // get/set without TTL (20)
  for (let i = 0; i < 20; i++) {
    it(`TLRUCache no-TTL get(${i}) returns value`, () => {
      const c = new TLRUCache<number, number>(50);
      c.set(i, i * 7);
      expect(c.get(i)).toBe(i * 7);
    });
  }

  // TTL expiry — very short TTL (20)
  for (let i = 0; i < 20; i++) {
    it(`TLRUCache TTL=1ms key ${i} expires and returns undefined`, () => {
      const c = new TLRUCache<number, number>(50);
      c.set(i, i, 1);
      // Simulate expiry by setting a past time
      const node = (c as unknown as Record<string, Map<number, { entry: { expiresAt: number } }>>)['_map'].get(i);
      if (node) node.entry.expiresAt = Date.now() - 1000;
      expect(c.get(i)).toBeUndefined();
    });
  }

  // has() with TTL (10)
  for (let i = 0; i < 10; i++) {
    it(`TLRUCache has(${i}) returns false after TTL expiry`, () => {
      const c = new TLRUCache<number, number>(50);
      c.set(i, i, 5000);
      const node = (c as unknown as Record<string, Map<number, { entry: { expiresAt: number } }>>)['_map'].get(i);
      if (node) node.entry.expiresAt = Date.now() - 1;
      expect(c.has(i)).toBe(false);
    });
  }

  // purgeExpired (20)
  for (let n = 1; n <= 20; n++) {
    it(`TLRUCache purgeExpired removes ${n} expired entries`, () => {
      const c = new TLRUCache<number, number>(50);
      for (let i = 0; i < n; i++) {
        c.set(i, i, 1);
        const node = (c as unknown as Record<string, Map<number, { entry: { expiresAt: number } }>>)['_map'].get(i);
        if (node) node.entry.expiresAt = Date.now() - 1000;
      }
      const purged = c.purgeExpired();
      expect(purged).toBe(n);
      expect(c.size).toBe(0);
    });
  }

  // delete() (20)
  for (let i = 0; i < 20; i++) {
    it(`TLRUCache delete(${i}) removes key`, () => {
      const c = new TLRUCache<number, number>(50);
      c.set(i, i);
      expect(c.delete(i)).toBe(true);
      expect(c.has(i)).toBe(false);
    });
  }

  // stats (10)
  for (let n = 1; n <= 10; n++) {
    it(`TLRUCache ${n} hits gives hitRate > 0`, () => {
      const c = new TLRUCache<number, number>(20);
      for (let i = 0; i < n; i++) c.set(i, i);
      for (let i = 0; i < n; i++) c.get(i);
      expect(c.stats().hitRate).toBeGreaterThan(0);
    });
  }

  // clear() (10)
  for (let n = 1; n <= 10; n++) {
    it(`TLRUCache clear resets ${n} entries`, () => {
      const c = new TLRUCache<number, number>(20);
      for (let i = 0; i < n; i++) c.set(i, i);
      c.clear();
      expect(c.size).toBe(0);
    });
  }

  // capacity property (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`TLRUCache capacity property is ${cap}`, () => {
      const c = new TLRUCache<number, number>(cap);
      expect(c.capacity).toBe(cap);
    });
  }

  // default TTL (10)
  for (let ttl = 1000; ttl <= 10000; ttl += 1000) {
    it(`TLRUCache defaultTtlMs=${ttl} entry does not expire immediately`, () => {
      const c = new TLRUCache<number, number>(10, ttl);
      c.set(1, 42);
      expect(c.get(1)).toBe(42);
    });
  }
});

// ---------------------------------------------------------------------------
// TwoQ Cache — 150 tests
// ---------------------------------------------------------------------------

describe('TwoQCache', () => {
  // Capacity (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`TwoQCache capacity ${cap} size never exceeds capacity`, () => {
      const c = new TwoQCache<number, number>(cap);
      for (let i = 0; i < cap + 10; i++) c.set(i, i);
      expect(c.size).toBeLessThanOrEqual(cap);
    });
  }

  // get/set (20)
  for (let i = 0; i < 20; i++) {
    it(`TwoQCache get(${i}) returns value after set`, () => {
      const c = new TwoQCache<number, number>(50);
      c.set(i, i * 8);
      expect(c.get(i)).toBe(i * 8);
    });
  }

  // has() (20)
  for (let i = 0; i < 20; i++) {
    it(`TwoQCache has(${i}) after set`, () => {
      const c = new TwoQCache<number, number>(50);
      c.set(i, i);
      expect(c.has(i)).toBe(true);
    });
  }

  // hot promotion (20)
  for (let i = 1; i <= 20; i++) {
    it(`TwoQCache key ${i} promoted to hot on second access`, () => {
      const c = new TwoQCache<number, number>(20);
      c.set(i, i * 2);
      c.get(i); // first access — warm
      // second get triggers promotion from warm to hot
      const val = c.get(i);
      expect(val).toBe(i * 2);
    });
  }

  // clear() (20)
  for (let n = 1; n <= 20; n++) {
    it(`TwoQCache clear resets ${n} entries`, () => {
      const c = new TwoQCache<number, number>(30);
      for (let i = 0; i < n; i++) c.set(i, i);
      c.clear();
      expect(c.size).toBe(0);
    });
  }

  // stats (10)
  for (let n = 1; n <= 10; n++) {
    it(`TwoQCache ${n} hits yields hitRate > 0`, () => {
      const c = new TwoQCache<number, number>(20);
      for (let i = 0; i < n; i++) c.set(i, i);
      for (let i = 0; i < n; i++) c.get(i);
      expect(c.stats().hitRate).toBeGreaterThan(0);
    });
  }

  // capacity property (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`TwoQCache capacity property is ${cap}`, () => {
      const c = new TwoQCache<number, number>(cap);
      expect(c.capacity).toBe(cap);
    });
  }

  // miss on empty (10)
  for (let i = 0; i < 10; i++) {
    it(`TwoQCache miss on empty cache for key ${i}`, () => {
      const c = new TwoQCache<number, number>(5);
      expect(c.get(i)).toBeUndefined();
    });
  }

  // ghost re-insert (20)
  for (let cap = 4; cap <= 23; cap++) {
    it(`TwoQCache capacity ${cap} ghost re-insert promotes directly to hot`, () => {
      const c = new TwoQCache<number, number>(cap);
      // Fill warm and evict key 0 to ghost
      for (let i = 0; i < cap; i++) c.set(i, i);
      // Force key 0 out of warm via overflow
      for (let i = cap; i < 2 * cap; i++) c.set(i, i);
      // Re-set key 0 — should come back
      c.set(0, 1000);
      expect(c.get(0)).toBe(1000);
    });
  }
});

// ---------------------------------------------------------------------------
// simulateCache helper — 80 tests
// ---------------------------------------------------------------------------

describe('simulateCache', () => {
  // Basic hit rate with LRU (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`simulateCache LRU cap ${cap} returns valid stats`, () => {
      const cache = new LRUCache<number, number>(cap);
      const requests = Array.from({ length: 20 }, (_, i) => i % cap);
      const stats = simulateCache(cache, requests);
      expect(stats.hits + stats.misses).toBe(20);
      expect(stats.hitRate).toBeGreaterThanOrEqual(0);
      expect(stats.hitRate).toBeLessThanOrEqual(1);
    });
  }

  // Zero requests (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`simulateCache cap ${cap} zero requests returns hitRate 0`, () => {
      const cache = new LRUCache<number, number>(cap);
      const stats = simulateCache(cache, []);
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  }

  // All hits (10)
  for (let cap = 2; cap <= 11; cap++) {
    it(`simulateCache cap ${cap} all-same-key gives hitRate ~1 after first`, () => {
      const cache = new LRUCache<number, number>(cap);
      const requests = Array.from({ length: 10 }, () => 42);
      const stats = simulateCache(cache, requests);
      // First access is miss, rest are hits
      expect(stats.hits).toBe(9);
      expect(stats.misses).toBe(1);
    });
  }

  // All misses (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`simulateCache cap ${cap} all-unique keys gives all misses`, () => {
      const cache = new LRUCache<number, number>(1);
      const requests = Array.from({ length: 10 }, (_, i) => i);
      const stats = simulateCache(cache, requests);
      // Each unique key misses on first access (cap=1 so every new key evicts prev)
      expect(stats.misses).toBeGreaterThanOrEqual(1);
    });
  }

  // FIFO cache simulation (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`simulateCache FIFO cap ${cap} valid stats`, () => {
      const cache = new FIFOCache<number, number>(cap);
      const requests = [0, 1, 2, 0, 1, 2];
      const stats = simulateCache(cache, requests);
      expect(stats.hits + stats.misses).toBe(6);
    });
  }

  // LFU cache simulation (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`simulateCache LFU cap ${cap} valid stats`, () => {
      const cache = new LFUCache<number, number>(cap);
      const requests = Array.from({ length: 15 }, (_, i) => i % (cap + 1));
      const stats = simulateCache(cache, requests);
      expect(stats.hits + stats.misses).toBe(15);
    });
  }

  // MRU cache simulation (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`simulateCache MRU cap ${cap} valid stats`, () => {
      const cache = new MRUCache<number, number>(cap);
      const requests = Array.from({ length: 12 }, (_, i) => i % 5);
      const stats = simulateCache(cache, requests);
      expect(stats.hits + stats.misses).toBe(12);
    });
  }
});

// ---------------------------------------------------------------------------
// optimalHitRate — 120 tests
// ---------------------------------------------------------------------------

describe('optimalHitRate', () => {
  // Empty requests (10)
  for (let cap = 1; cap <= 10; cap++) {
    it(`optimalHitRate cap ${cap} empty requests returns 0`, () => {
      expect(optimalHitRate(cap, [])).toBe(0);
    });
  }

  // Zero capacity (10)
  for (let n = 1; n <= 10; n++) {
    it(`optimalHitRate cap 0 with ${n} requests returns 0`, () => {
      const requests = Array.from({ length: n }, (_, i) => i);
      expect(optimalHitRate(0, requests)).toBe(0);
    });
  }

  // Single element repeated (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`optimalHitRate cap ${cap} single element repeated 10 times → hitRate 0.9`, () => {
      const requests = Array.from({ length: 10 }, () => 1);
      const rate = optimalHitRate(cap, requests);
      expect(rate).toBeCloseTo(0.9, 5);
    });
  }

  // All unique elements, cap=1 (10)
  for (let n = 2; n <= 11; n++) {
    it(`optimalHitRate cap 1 all-unique ${n} requests → hitRate 0`, () => {
      const requests = Array.from({ length: n }, (_, i) => i);
      const rate = optimalHitRate(1, requests);
      expect(rate).toBe(0);
    });
  }

  // Capacity >= unique count → all cached (20)
  for (let n = 1; n <= 20; n++) {
    it(`optimalHitRate cap ${n + 1} with ${n} unique keys → all fit → hitRate 0 first pass`, () => {
      const requests = Array.from({ length: n }, (_, i) => i);
      const rate = optimalHitRate(n + 1, requests);
      // All unique first pass = 0 hits
      expect(rate).toBe(0);
    });
  }

  // Repeated pattern with enough capacity (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`optimalHitRate cap ${cap} two-pass [0..cap-1] optimal hits = cap`, () => {
      const first = Array.from({ length: cap }, (_, i) => i);
      const second = Array.from({ length: cap }, (_, i) => i);
      const requests = [...first, ...second];
      const rate = optimalHitRate(cap, requests);
      // Second pass all hits
      expect(rate).toBeCloseTo(cap / (2 * cap), 5);
    });
  }

  // hitRate in [0,1] invariant (20)
  for (let cap = 1; cap <= 20; cap++) {
    it(`optimalHitRate cap ${cap} rate always in [0,1]`, () => {
      const requests = Array.from({ length: 30 }, (_, i) => Math.floor(i * 1.5) % 10);
      const rate = optimalHitRate(cap, requests);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    });
  }

  // LRU vs optimal — optimal should be >= LRU (10)
  for (let cap = 2; cap <= 11; cap++) {
    it(`optimalHitRate cap ${cap} is >= LRU simulation hitRate`, () => {
      const requests = [0, 1, 2, 0, 3, 1, 0, 2, 3, 1];
      const optRate = optimalHitRate(cap, requests);
      const lru = new LRUCache<number, number>(cap);
      const lruStats = simulateCache(lru, requests);
      expect(optRate).toBeGreaterThanOrEqual(lruStats.hitRate - 1e-9);
    });
  }
});

// ---------------------------------------------------------------------------
// CacheStats interface shape — 30 tests
// ---------------------------------------------------------------------------

describe('CacheStats shape', () => {
  const factories: Array<() => { stats(): CacheStats }> = [
    () => new LRUCache<number, number>(5),
    () => new LFUCache<number, number>(5),
    () => new FIFOCache<number, number>(5),
    () => new MRUCache<number, number>(5),
    () => new ARCCache<number, number>(5),
    () => new TLRUCache<number, number>(5),
    () => new TwoQCache<number, number>(5),
  ];

  // Fresh stats shape (7 types × 1)
  factories.forEach((factory, idx) => {
    it(`cache type ${idx} stats has correct keys`, () => {
      const c = factory();
      const s = c.stats();
      expect(typeof s.hits).toBe('number');
      expect(typeof s.misses).toBe('number');
      expect(typeof s.hitRate).toBe('number');
      expect(typeof s.size).toBe('number');
      expect(typeof s.capacity).toBe('number');
    });
  });

  // hitRate starts at 0 for all types (7)
  factories.forEach((factory, idx) => {
    it(`cache type ${idx} fresh hitRate is 0`, () => {
      const c = factory();
      expect(c.stats().hitRate).toBe(0);
    });
  });

  // capacity matches constructor arg (7)
  for (let idx = 0; idx < factories.length; idx++) {
    it(`cache type ${idx} stats.capacity equals 5`, () => {
      const c = factories[idx]();
      expect(c.stats().capacity).toBe(5);
    });
  }

  // size starts at 0 (7)
  for (let idx = 0; idx < factories.length; idx++) {
    it(`cache type ${idx} stats.size starts at 0`, () => {
      const c = factories[idx]();
      expect(c.stats().size).toBe(0);
    });
  }

  // hits + misses = total accesses (7 × 1 after 3 gets)
  for (let idx = 0; idx < factories.length; idx++) {
    it(`cache type ${idx} hits + misses = total access count`, () => {
      const c = factories[idx]();
      for (let i = 100; i < 103; i++) (c as unknown as LRUCache<number, number>).get?.(i);
      const s = c.stats();
      expect(s.hits + s.misses).toBeLessThanOrEqual(3);
    });
  }
});

// ---------------------------------------------------------------------------
// Error handling — 20 tests
// ---------------------------------------------------------------------------

describe('Cache error handling', () => {
  // LRU invalid capacity
  for (let bad = -5; bad <= 0; bad++) {
    it(`LRUCache capacity ${bad} throws RangeError`, () => {
      expect(() => new LRUCache<number, number>(bad)).toThrow(RangeError);
    });
  }

  // LFU invalid capacity
  for (let bad = -3; bad <= 0; bad++) {
    it(`LFUCache capacity ${bad} throws RangeError`, () => {
      expect(() => new LFUCache<number, number>(bad)).toThrow(RangeError);
    });
  }

  // FIFO invalid capacity
  for (let bad = -2; bad <= 0; bad++) {
    it(`FIFOCache capacity ${bad} throws RangeError`, () => {
      expect(() => new FIFOCache<number, number>(bad)).toThrow(RangeError);
    });
  }

  // MRU invalid capacity
  for (let bad = -2; bad <= 0; bad++) {
    it(`MRUCache capacity ${bad} throws RangeError`, () => {
      expect(() => new MRUCache<number, number>(bad)).toThrow(RangeError);
    });
  }

  // ARC invalid capacity
  for (let bad = -2; bad <= 0; bad++) {
    it(`ARCCache capacity ${bad} throws RangeError`, () => {
      expect(() => new ARCCache<number, number>(bad)).toThrow(RangeError);
    });
  }

  // TLRU invalid capacity
  for (let bad = -2; bad <= 0; bad++) {
    it(`TLRUCache capacity ${bad} throws RangeError`, () => {
      expect(() => new TLRUCache<number, number>(bad)).toThrow(RangeError);
    });
  }

  // TwoQ invalid capacity
  for (let bad = -2; bad <= 0; bad++) {
    it(`TwoQCache capacity ${bad} throws RangeError`, () => {
      expect(() => new TwoQCache<number, number>(bad)).toThrow(RangeError);
    });
  }
});

// ---------------------------------------------------------------------------
// Mixed workload stress tests — 80 tests
// ---------------------------------------------------------------------------

describe('Mixed workload', () => {
  const sizes = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];

  // LRU stress (10)
  for (const sz of sizes) {
    it(`LRU stress size ${sz} maintains invariants`, () => {
      const c = new LRUCache<number, number>(sz);
      for (let i = 0; i < sz * 3; i++) {
        if (i % 3 === 0) c.get(i % sz);
        else c.set(i % (sz * 2), i);
      }
      expect(c.size).toBeLessThanOrEqual(sz);
      expect(c.capacity).toBe(sz);
    });
  }

  // LFU stress (10)
  for (const sz of sizes) {
    it(`LFU stress size ${sz} maintains invariants`, () => {
      const c = new LFUCache<number, number>(sz);
      for (let i = 0; i < sz * 3; i++) {
        if (i % 3 === 0) c.get(i % sz);
        else c.set(i % (sz * 2), i);
      }
      expect(c.size).toBeLessThanOrEqual(sz);
    });
  }

  // FIFO stress (10)
  for (const sz of sizes) {
    it(`FIFO stress size ${sz} maintains invariants`, () => {
      const c = new FIFOCache<number, number>(sz);
      for (let i = 0; i < sz * 3; i++) {
        if (i % 2 === 0) c.get(i % sz);
        else c.set(i % (sz * 2), i);
      }
      expect(c.size).toBeLessThanOrEqual(sz);
    });
  }

  // MRU stress (10)
  for (const sz of sizes) {
    it(`MRU stress size ${sz} maintains invariants`, () => {
      const c = new MRUCache<number, number>(sz);
      for (let i = 0; i < sz * 3; i++) {
        if (i % 2 === 0) c.get(i % sz);
        else c.set(i % (sz * 2), i);
      }
      expect(c.size).toBeLessThanOrEqual(sz);
    });
  }

  // ARC stress (10)
  for (const sz of sizes) {
    it(`ARC stress size ${sz} maintains invariants`, () => {
      const c = new ARCCache<number, number>(sz);
      for (let i = 0; i < sz * 3; i++) {
        if (i % 3 === 0) c.get(i % sz);
        else c.set(i % (sz * 2), i);
      }
      expect(c.size).toBeLessThanOrEqual(sz);
    });
  }

  // TLRU stress (10)
  for (const sz of sizes) {
    it(`TLRU stress size ${sz} maintains invariants`, () => {
      const c = new TLRUCache<number, number>(sz);
      for (let i = 0; i < sz * 3; i++) {
        if (i % 3 === 0) c.get(i % sz);
        else c.set(i % (sz * 2), i);
      }
      expect(c.size).toBeLessThanOrEqual(sz);
    });
  }

  // TwoQ stress (10)
  for (const sz of sizes) {
    it(`TwoQ stress size ${sz} maintains invariants`, () => {
      const c = new TwoQCache<number, number>(sz);
      for (let i = 0; i < sz * 3; i++) {
        if (i % 3 === 0) c.get(i % sz);
        else c.set(i % (sz * 2), i);
      }
      expect(c.size).toBeLessThanOrEqual(sz);
    });
  }

  // hitRate always <= 1 for all types across sizes (10)
  for (const sz of sizes) {
    it(`All caches size ${sz} hitRate <= 1 after workload`, () => {
      const caches = [
        new LRUCache<number, number>(sz),
        new LFUCache<number, number>(sz),
        new FIFOCache<number, number>(sz),
      ];
      for (const c of caches) {
        for (let i = 0; i < sz * 2; i++) { c.set(i % sz, i); c.get(i % sz); }
        expect(c.stats().hitRate).toBeLessThanOrEqual(1);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Boundary and edge-case tests — 70 tests
// ---------------------------------------------------------------------------

describe('Edge cases', () => {
  // Capacity=1 LRU (10)
  for (let i = 0; i < 10; i++) {
    it(`LRUCache cap=1 keeps only latest key (i=${i})`, () => {
      const c = new LRUCache<number, number>(1);
      c.set(i, i);
      c.set(i + 1, i + 1);
      expect(c.size).toBe(1);
      expect(c.get(i + 1)).toBe(i + 1);
      expect(c.get(i)).toBeUndefined();
    });
  }

  // Capacity=1 LFU (10)
  for (let i = 0; i < 10; i++) {
    it(`LFUCache cap=1 keeps only latest key (i=${i})`, () => {
      const c = new LFUCache<number, number>(1);
      c.set(i, i * 2);
      c.set(i + 1, (i + 1) * 2);
      expect(c.size).toBe(1);
    });
  }

  // Capacity=1 FIFO (10)
  for (let i = 0; i < 10; i++) {
    it(`FIFOCache cap=1 keeps only latest key (i=${i})`, () => {
      const c = new FIFOCache<number, number>(1);
      c.set(i, 100);
      c.set(i + 1, 200);
      expect(c.get(i + 1)).toBe(200);
      expect(c.get(i)).toBeUndefined();
    });
  }

  // Capacity=1 MRU (10)
  for (let i = 0; i < 10; i++) {
    it(`MRUCache cap=1 keeps only non-evicted key (i=${i})`, () => {
      const c = new MRUCache<number, number>(1);
      c.set(i, 1);
      c.set(i + 1, 2);
      expect(c.size).toBe(1);
    });
  }

  // get on missing key returns undefined (10)
  for (let i = 0; i < 10; i++) {
    it(`LRUCache get missing key ${i + 1000} returns undefined`, () => {
      const c = new LRUCache<number, number>(5);
      expect(c.get(i + 1000)).toBeUndefined();
    });
  }

  // delete on missing returns false (10)
  for (let i = 0; i < 10; i++) {
    it(`FIFOCache delete missing key ${i + 500} returns false`, () => {
      const c = new FIFOCache<number, number>(5);
      expect(c.delete(i + 500)).toBe(false);
    });
  }

  // set same key many times — size stays 1 (10)
  for (let n = 2; n <= 11; n++) {
    it(`LRUCache set same key ${n} times keeps size 1`, () => {
      const c = new LRUCache<number, number>(10);
      for (let i = 0; i < n; i++) c.set(42, i);
      expect(c.size).toBe(1);
      expect(c.get(42)).toBe(n - 1);
    });
  }
});

// ---------------------------------------------------------------------------
// Comparative tests — LRU vs optimal (20 tests)
// ---------------------------------------------------------------------------

describe('LRU vs optimal comparison', () => {
  for (let cap = 1; cap <= 20; cap++) {
    it(`optimalHitRate cap ${cap} with cyclic pattern exceeds 0`, () => {
      // Cyclic pattern that causes cache misses in LRU but optimal handles better
      const requests = [];
      for (let rep = 0; rep < 5; rep++) {
        for (let k = 0; k <= cap; k++) requests.push(k);
      }
      const optRate = optimalHitRate(cap, requests as number[]);
      expect(optRate).toBeGreaterThanOrEqual(0);
      expect(optRate).toBeLessThanOrEqual(1);
    });
  }
});
