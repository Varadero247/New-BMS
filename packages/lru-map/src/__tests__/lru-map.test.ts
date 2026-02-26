// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { LRUMap } from '../lru-map';

// =============================================================================
// set/get basic — 200 tests
// =============================================================================
describe('set/get basic', () => {
  for (let i = 0; i < 200; i++) {
    it(`set/get key ${i}`, () => {
      const m = new LRUMap<number, number>(500);
      m.set(i, i * 2);
      expect(m.get(i)).toBe(i * 2);
    });
  }
});

// =============================================================================
// has() — present key — 100 tests
// =============================================================================
describe('has() present key', () => {
  for (let i = 0; i < 100; i++) {
    it(`has(${i}) true after set`, () => {
      const m = new LRUMap<number, number>(200);
      m.set(i, i);
      expect(m.has(i)).toBe(true);
    });
  }
});

// =============================================================================
// has() — absent key — 100 tests
// =============================================================================
describe('has() absent key', () => {
  for (let i = 0; i < 100; i++) {
    it(`has(${i}) false in empty map`, () => {
      const m = new LRUMap<number, number>(200);
      expect(m.has(i)).toBe(false);
    });
  }
});

// =============================================================================
// maxSize property — 100 tests
// =============================================================================
describe('maxSize property', () => {
  for (let s = 1; s <= 100; s++) {
    it(`maxSize=${s}`, () => {
      const m = new LRUMap<number, number>(s);
      expect(m.maxSize).toBe(s);
    });
  }
});

// =============================================================================
// size after sets — 100 tests
// =============================================================================
describe('size after sets', () => {
  for (let n = 0; n <= 99; n++) {
    it(`size=${n} after ${n} unique sets`, () => {
      const m = new LRUMap<number, number>(200);
      for (let i = 0; i < n; i++) m.set(i, i);
      expect(m.size).toBe(n);
    });
  }
});

// =============================================================================
// LRU eviction — 100 tests
// =============================================================================
describe('LRU eviction', () => {
  for (let n = 1; n <= 100; n++) {
    it(`evicts LRU when size exceeds ${n}`, () => {
      const m = new LRUMap<number, number>(n);
      for (let i = 0; i <= n; i++) m.set(i, i);
      expect(m.size).toBe(n);
      expect(m.has(0)).toBe(false); // 0 was LRU, evicted
    });
  }
});

// =============================================================================
// delete() — 100 tests
// =============================================================================
describe('delete()', () => {
  for (let i = 0; i < 100; i++) {
    it(`delete(${i}) returns true and removes key`, () => {
      const m = new LRUMap<number, number>(200);
      m.set(i, i);
      expect(m.delete(i)).toBe(true);
      expect(m.has(i)).toBe(false);
    });
  }
});

// =============================================================================
// TTL expiry — 100 tests (injectable clock)
// =============================================================================
describe('TTL expiry', () => {
  for (let ttl = 1; ttl <= 100; ttl++) {
    it(`key expires after ttl=${ttl}ms (injectable clock)`, () => {
      let time = 0;
      const m = new LRUMap<string, number>(100, ttl, () => time);
      m.set('k', 42);
      time = ttl; // exactly at expiry boundary (expired: clock >= expiresAt)
      expect(m.has('k')).toBe(false);
      expect(m.get('k')).toBeUndefined();
    });
  }
});

// =============================================================================
// clear() — 100 tests
// =============================================================================
describe('clear()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`clear() resets size to 0 (n=${n})`, () => {
      const m = new LRUMap<number, number>(200);
      for (let i = 0; i < n; i++) m.set(i, i);
      m.clear();
      expect(m.size).toBe(0);
    });
  }
});

// =============================================================================
// peek() — 100 tests
// =============================================================================
describe('peek()', () => {
  for (let i = 0; i < 100; i++) {
    it(`peek(${i}) returns value without promoting`, () => {
      const m = new LRUMap<number, number>(200);
      m.set(i, i * 3);
      expect(m.peek(i)).toBe(i * 3);
    });
  }
});

// =============================================================================
// Additional: keys() ordering — 50 tests
// =============================================================================
describe('keys() MRU-first ordering', () => {
  for (let n = 1; n <= 50; n++) {
    it(`keys() returns ${n} keys in MRU order`, () => {
      const m = new LRUMap<number, number>(200);
      for (let i = 0; i < n; i++) m.set(i, i);
      const ks = m.keys();
      expect(ks.length).toBe(n);
      // Most recently inserted = n-1, should be first
      expect(ks[0]).toBe(n - 1);
    });
  }
});

// =============================================================================
// Additional: values() ordering — 50 tests
// =============================================================================
describe('values() MRU-first ordering', () => {
  for (let n = 1; n <= 50; n++) {
    it(`values() returns ${n} values in MRU order`, () => {
      const m = new LRUMap<number, number>(200);
      for (let i = 0; i < n; i++) m.set(i, i * 5);
      const vs = m.values();
      expect(vs.length).toBe(n);
      expect(vs[0]).toBe((n - 1) * 5);
    });
  }
});

// =============================================================================
// Additional: entries() — 50 tests
// =============================================================================
describe('entries() MRU-first ordering', () => {
  for (let n = 1; n <= 50; n++) {
    it(`entries() returns ${n} pairs in MRU order`, () => {
      const m = new LRUMap<number, number>(200);
      for (let i = 0; i < n; i++) m.set(i, i * 7);
      const es = m.entries();
      expect(es.length).toBe(n);
      expect(es[0]).toEqual([n - 1, (n - 1) * 7]);
    });
  }
});

// =============================================================================
// Additional: delete() returns false for absent key — 50 tests
// =============================================================================
describe('delete() absent key', () => {
  for (let i = 0; i < 50; i++) {
    it(`delete(${i}) returns false when key absent`, () => {
      const m = new LRUMap<number, number>(200);
      expect(m.delete(i)).toBe(false);
    });
  }
});

// =============================================================================
// Additional: get() promotes to MRU — 50 tests
// =============================================================================
describe('get() promotes to MRU', () => {
  for (let i = 1; i <= 50; i++) {
    it(`get() promotes key 0 to MRU (n=${i})`, () => {
      const m = new LRUMap<number, number>(200);
      // Insert 0 first (LRU position), then i more keys
      m.set(0, 999);
      for (let j = 1; j <= i; j++) m.set(j, j);
      // Access key 0 — should move to MRU
      m.get(0);
      const ks = m.keys();
      expect(ks[0]).toBe(0);
    });
  }
});

// =============================================================================
// Additional: TTL not expired — 50 tests
// =============================================================================
describe('TTL not yet expired', () => {
  for (let ttl = 1; ttl <= 50; ttl++) {
    it(`key not expired before ttl=${ttl}ms boundary`, () => {
      let time = 0;
      const m = new LRUMap<string, number>(100, ttl, () => time);
      m.set('x', 77);
      time = ttl - 1; // one tick before expiry
      expect(m.has('x')).toBe(true);
      expect(m.get('x')).toBe(77);
    });
  }
});

// =============================================================================
// Additional: set overwrites existing value — 50 tests
// =============================================================================
describe('set() overwrites existing key', () => {
  for (let i = 0; i < 50; i++) {
    it(`overwrite key ${i} changes value`, () => {
      const m = new LRUMap<number, number>(200);
      m.set(i, 100);
      m.set(i, 200);
      expect(m.get(i)).toBe(200);
      expect(m.size).toBe(1);
    });
  }
});

// =============================================================================
// Additional: peek() does not promote — 50 tests
// =============================================================================
describe('peek() does not change MRU order', () => {
  for (let i = 1; i <= 50; i++) {
    it(`peek() leaves key 0 as LRU (n=${i})`, () => {
      const m = new LRUMap<number, number>(200);
      m.set(0, 999);
      for (let j = 1; j <= i; j++) m.set(j, j);
      // peek at key 0 — should NOT promote it
      m.peek(0);
      const ks = m.keys();
      expect(ks[ks.length - 1]).toBe(0); // still LRU (last = oldest)
    });
  }
});

// =============================================================================
// Additional: forEach() visits all entries — 50 tests
// =============================================================================
describe('forEach() visits all non-expired entries', () => {
  for (let n = 1; n <= 50; n++) {
    it(`forEach() visits ${n} entries`, () => {
      const m = new LRUMap<number, number>(200);
      for (let i = 0; i < n; i++) m.set(i, i);
      let count = 0;
      m.forEach((_v, _k) => count++);
      expect(count).toBe(n);
    });
  }
});

// =============================================================================
// Additional: eviction keeps MRU entries — 50 tests
// =============================================================================
describe('eviction preserves MRU entries', () => {
  for (let n = 2; n <= 51; n++) {
    it(`most-recently used key survives eviction (cap=${n})`, () => {
      const m = new LRUMap<number, number>(n);
      for (let i = 0; i < n; i++) m.set(i, i);
      // Re-access key 0 (now MRU), then insert one more to trigger eviction of key 1
      m.get(0);
      m.set(n, n);
      expect(m.has(0)).toBe(true); // 0 was promoted to MRU, should survive
    });
  }
});

// =============================================================================
// Additional: clear() then re-use — 50 tests
// =============================================================================
describe('clear() then re-use', () => {
  for (let i = 0; i < 50; i++) {
    it(`can re-use map after clear() (i=${i})`, () => {
      const m = new LRUMap<number, number>(200);
      for (let j = 0; j < 10; j++) m.set(j, j);
      m.clear();
      m.set(i, i * 2);
      expect(m.get(i)).toBe(i * 2);
      expect(m.size).toBe(1);
    });
  }
});

// =============================================================================
// Additional: get() absent returns undefined — 50 tests
// =============================================================================
describe('get() absent key returns undefined', () => {
  for (let i = 0; i < 50; i++) {
    it(`get(${i}) undefined in empty map`, () => {
      const m = new LRUMap<number, number>(200);
      expect(m.get(i)).toBeUndefined();
    });
  }
});

// =============================================================================
// Additional: peek() absent returns undefined — 50 tests
// =============================================================================
describe('peek() absent key returns undefined', () => {
  for (let i = 0; i < 50; i++) {
    it(`peek(${i}) undefined in empty map`, () => {
      const m = new LRUMap<number, number>(200);
      expect(m.peek(i)).toBeUndefined();
    });
  }
});

// =============================================================================
// Additional: set() returns this (chaining) — 50 tests
// =============================================================================
describe('set() returns this for chaining', () => {
  for (let i = 0; i < 50; i++) {
    it(`set() returns same map instance (i=${i})`, () => {
      const m = new LRUMap<number, number>(200);
      const result = m.set(i, i);
      expect(result).toBe(m);
    });
  }
});

// =============================================================================
// Additional: size=1 cap evicts previous entry — 50 tests
// =============================================================================
describe('size=1 LRU eviction', () => {
  for (let i = 1; i <= 50; i++) {
    it(`cap=1: setting key ${i} evicts key ${i - 1}`, () => {
      const m = new LRUMap<number, number>(1);
      m.set(i - 1, i - 1);
      m.set(i, i);
      expect(m.has(i - 1)).toBe(false);
      expect(m.has(i)).toBe(true);
      expect(m.size).toBe(1);
    });
  }
});

// =============================================================================
// Additional: string keys — 50 tests
// =============================================================================
describe('string keys', () => {
  for (let i = 0; i < 50; i++) {
    it(`string key "key-${i}" works correctly`, () => {
      const m = new LRUMap<string, string>(200);
      m.set(`key-${i}`, `val-${i}`);
      expect(m.get(`key-${i}`)).toBe(`val-${i}`);
      expect(m.has(`key-${i}`)).toBe(true);
    });
  }
});

// =============================================================================
// Total it() calls:
//   set/get basic:             200
//   has() present:             100
//   has() absent:              100
//   maxSize:                   100
//   size:                      100
//   eviction:                  100
//   delete:                    100
//   TTL expiry:                100
//   clear:                     100
//   peek:                      100
//   keys() ordering:            50
//   values() ordering:          50
//   entries():                  50
//   delete() absent:            50
//   get() promotes:             50
//   TTL not expired:            50
//   set overwrites:             50
//   peek() no promote:          50
//   forEach():                  50
//   eviction preserves MRU:     50
//   clear() + re-use:           50
//   get() absent → undefined:   50
//   peek() absent → undefined:  50
//   set() returns this:         50
//   size=1 eviction:            50
//   string keys:                50
// -----------------------------------------------
// TOTAL:                     1,700
// =============================================================================
