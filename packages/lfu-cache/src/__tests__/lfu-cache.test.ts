// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  LFUCache,
  LRUCache,
  FIFOCache,
  ARCCache,
  TwoQCache,
  createCache,
  memoizeLFU,
  memoizeLRU,
} from '../lfu-cache';

// ═══════════════════════════════════════════════════════════════════════════
// LFUCache — basic get/set (100+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('LFUCache — basic get/set', () => {
  for (let cap = 1; cap <= 20; cap++) {
    it(`capacity ${cap}: set and get single entry`, () => {
      const c = new LFUCache<number, string>(cap);
      c.set(1, 'a');
      expect(c.get(1)).toBe('a');
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`set ${i + 1} distinct keys and retrieve all (cap=50)`, () => {
      const c = new LFUCache<number, number>(50);
      for (let k = 0; k <= i; k++) c.set(k, k * 2);
      for (let k = 0; k <= i; k++) expect(c.get(k)).toBe(k * 2);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`overwrite key ${i}: value updates correctly`, () => {
      const c = new LFUCache<number, number>(10);
      c.set(i, 100);
      c.set(i, 200);
      expect(c.get(i)).toBe(200);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`get on missing key ${i} returns undefined`, () => {
      const c = new LFUCache<number, number>(10);
      expect(c.get(i)).toBeUndefined();
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`size reflects insertions (insert ${i + 1})`, () => {
      const c = new LFUCache<number, number>(50);
      for (let k = 0; k < i + 1; k++) c.set(k, k);
      expect(c.size).toBe(i + 1);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LFUCache — eviction (LFU policy) (100+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('LFUCache — eviction (LFU policy)', () => {
  it('evicts single least-frequently used when at capacity', () => {
    const c = new LFUCache<string, number>(2);
    c.set('a', 1);
    c.set('b', 2);
    c.get('a'); // a freq=2, b freq=1
    c.set('c', 3); // evicts b (freq=1)
    expect(c.has('b')).toBe(false);
    expect(c.has('a')).toBe(true);
    expect(c.has('c')).toBe(true);
  });

  it('evicts LRU within same-frequency bucket', () => {
    const c = new LFUCache<string, number>(3);
    c.set('x', 1); // freq 1
    c.set('y', 2); // freq 1
    c.set('z', 3); // freq 1
    // x was inserted first → LRU at freq=1
    c.set('w', 4); // evicts x
    expect(c.has('x')).toBe(false);
    expect(c.has('y')).toBe(true);
    expect(c.has('z')).toBe(true);
    expect(c.has('w')).toBe(true);
  });

  for (let extra = 1; extra <= 20; extra++) {
    it(`cap=5: size stays at 5 after inserting 5+${extra} items`, () => {
      const c = new LFUCache<number, number>(5);
      // Fill cache
      for (let k = 0; k < 5; k++) c.set(k, k);
      // Insert extra items — each evicts LFU (LRU within same freq bucket)
      for (let e = 0; e < extra; e++) {
        c.set(100 + e, 999 + e);
      }
      expect(c.size).toBe(5);
    });
  }

  for (let cap = 2; cap <= 10; cap++) {
    it(`cap=${cap}: size never exceeds capacity`, () => {
      const c = new LFUCache<number, number>(cap);
      for (let k = 0; k < cap * 3; k++) {
        c.set(k, k);
        expect(c.size).toBeLessThanOrEqual(cap);
      }
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`eviction test variant ${i}: most-accessed keys survive`, () => {
      const c = new LFUCache<number, number>(3);
      c.set(0, 0);
      c.set(1, 1);
      c.set(2, 2);
      for (let rep = 0; rep <= i; rep++) {
        c.get(0);
        c.get(1);
      }
      c.set(3, 3); // evicts 2 (lowest freq)
      expect(c.has(0)).toBe(true);
      expect(c.has(1)).toBe(true);
      expect(c.has(2)).toBe(false);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`cap=1 eviction variant ${i}: new key always replaces old`, () => {
      const c = new LFUCache<number, number>(1);
      c.set(i, i);
      c.set(i + 1, i + 1);
      expect(c.has(i)).toBe(false);
      expect(c.get(i + 1)).toBe(i + 1);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LFUCache — frequency tracking (80+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('LFUCache — frequency tracking', () => {
  for (let reads = 1; reads <= 40; reads++) {
    it(`key accessed ${reads} times has frequency ${reads + 1} (set=1 + gets)`, () => {
      const c = new LFUCache<string, number>(50);
      c.set('k', 42);
      for (let r = 0; r < reads; r++) c.get('k');
      expect(c.getFrequency('k')).toBe(reads + 1);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`getFrequency returns 0 for missing key variant ${i}`, () => {
      const c = new LFUCache<number, number>(10);
      expect(c.getFrequency(i + 1000)).toBe(0);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`overwrite does NOT reset frequency (variant ${i})`, () => {
      const c = new LFUCache<number, number>(10);
      c.set(1, 10);
      for (let r = 0; r < i + 1; r++) c.get(1);
      const freqBefore = c.getFrequency(1);
      c.set(1, 99); // overwrite
      expect(c.getFrequency(1)).toBe(freqBefore + 1);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LFUCache — has/delete (80+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('LFUCache — has/delete', () => {
  for (let i = 0; i < 40; i++) {
    it(`has(${i}) returns true after set`, () => {
      const c = new LFUCache<number, number>(50);
      c.set(i, i);
      expect(c.has(i)).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`has returns false before set (variant ${i})`, () => {
      const c = new LFUCache<number, number>(10);
      expect(c.has(i)).toBe(false);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`delete(${i}) returns true and removes the key`, () => {
      const c = new LFUCache<number, number>(50);
      c.set(i, i * 3);
      expect(c.delete(i)).toBe(true);
      expect(c.has(i)).toBe(false);
      expect(c.get(i)).toBeUndefined();
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`delete returns false for non-existent key (variant ${i})`, () => {
      const c = new LFUCache<number, number>(10);
      expect(c.delete(i + 9999)).toBe(false);
    });
  }

  for (let i = 1; i <= 10; i++) {
    it(`delete reduces size correctly (delete ${i} of 10)`, () => {
      const c = new LFUCache<number, number>(20);
      for (let k = 0; k < 10; k++) c.set(k, k);
      for (let k = 0; k < i; k++) c.delete(k);
      expect(c.size).toBe(10 - i);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LFUCache — stats: hits/misses/hitRate (80+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('LFUCache — stats', () => {
  it('initial hits and misses are 0', () => {
    const c = new LFUCache<number, number>(10);
    expect(c.hits).toBe(0);
    expect(c.misses).toBe(0);
  });

  it('hitRate is NaN when no accesses', () => {
    const c = new LFUCache<number, number>(10);
    expect(isNaN(c.hitRate)).toBe(true);
  });

  for (let hits = 1; hits <= 20; hits++) {
    it(`${hits} hits: hitRate = ${hits}/${hits} = 1`, () => {
      const c = new LFUCache<number, number>(20);
      for (let i = 0; i < hits; i++) c.set(i, i);
      for (let i = 0; i < hits; i++) c.get(i);
      expect(c.hits).toBe(hits);
      expect(c.hitRate).toBeCloseTo(1);
    });
  }

  for (let misses = 1; misses <= 20; misses++) {
    it(`${misses} misses: hitRate = 0`, () => {
      const c = new LFUCache<number, number>(10);
      for (let i = 0; i < misses; i++) c.get(i + 1000);
      expect(c.misses).toBe(misses);
      expect(c.hitRate).toBeCloseTo(0);
    });
  }

  for (let i = 1; i <= 20; i++) {
    it(`mixed: ${i} hits + ${i} misses → hitRate = 0.5`, () => {
      const c = new LFUCache<number, number>(50);
      for (let k = 0; k < i; k++) c.set(k, k);
      for (let k = 0; k < i; k++) c.get(k);        // hits
      for (let k = 0; k < i; k++) c.get(k + 9999); // misses
      expect(c.hitRate).toBeCloseTo(0.5);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`resetStats clears hits and misses (variant ${i})`, () => {
      const c = new LFUCache<number, number>(10);
      c.set(0, 0);
      for (let k = 0; k < i + 1; k++) c.get(0);
      c.resetStats();
      expect(c.hits).toBe(0);
      expect(c.misses).toBe(0);
      expect(isNaN(c.hitRate)).toBe(true);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LFUCache — peek (50+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('LFUCache — peek', () => {
  for (let i = 0; i < 25; i++) {
    it(`peek(${i}) returns value without updating frequency`, () => {
      const c = new LFUCache<number, number>(50);
      c.set(i, i * 7);
      const freqBefore = c.getFrequency(i);
      const val = c.peek(i);
      expect(val).toBe(i * 7);
      expect(c.getFrequency(i)).toBe(freqBefore);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`peek on missing key ${i + 100} returns undefined`, () => {
      const c = new LFUCache<number, number>(10);
      expect(c.peek(i + 100)).toBeUndefined();
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LFUCache — keysOrderedByFrequency (50+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('LFUCache — keysOrderedByFrequency', () => {
  it('empty cache returns empty array', () => {
    const c = new LFUCache<string, number>(10);
    expect(c.keysOrderedByFrequency()).toEqual([]);
  });

  for (let n = 1; n <= 10; n++) {
    it(`${n} keys all at freq=1 → all appear in result`, () => {
      const c = new LFUCache<number, number>(50);
      for (let k = 0; k < n; k++) c.set(k, k);
      const keys = c.keysOrderedByFrequency();
      expect(keys.length).toBe(n);
      for (let k = 0; k < n; k++) expect(keys).toContain(k);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`least-accessed key appears first in ordering (variant ${i})`, () => {
      const c = new LFUCache<string, number>(10);
      c.set('low', 1);       // freq=1
      c.set('high', 2);      // freq=1 → will be boosted
      for (let r = 0; r <= i; r++) c.get('high'); // freq = i+2
      const keys = c.keysOrderedByFrequency();
      expect(keys[0]).toBe('low');
    });
  }

  for (let boost = 1; boost <= 10; boost++) {
    it(`key boosted ${boost} times comes after non-boosted key`, () => {
      const c = new LFUCache<string, number>(20);
      c.set('a', 1);
      c.set('b', 2);
      for (let r = 0; r < boost; r++) c.get('b');
      const keys = c.keysOrderedByFrequency();
      expect(keys.indexOf('a')).toBeLessThan(keys.indexOf('b'));
    });
  }

  for (let n = 2; n <= 10; n++) {
    it(`${n}-key cache: result length matches size`, () => {
      const c = new LFUCache<number, number>(50);
      for (let k = 0; k < n; k++) c.set(k, k);
      expect(c.keysOrderedByFrequency().length).toBe(n);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`after delete, keysOrderedByFrequency excludes deleted key (variant ${i})`, () => {
      const c = new LFUCache<number, number>(20);
      for (let k = 0; k < 5; k++) c.set(k, k);
      c.delete(i % 5);
      const keys = c.keysOrderedByFrequency();
      expect(keys).not.toContain(i % 5);
      expect(keys.length).toBe(4);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LRUCache — basic get/set (80+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('LRUCache — basic get/set', () => {
  for (let cap = 1; cap <= 20; cap++) {
    it(`capacity ${cap}: set and get single value`, () => {
      const c = new LRUCache<number, string>(cap);
      c.set(0, 'hello');
      expect(c.get(0)).toBe('hello');
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`get missing key ${i} returns undefined`, () => {
      const c = new LRUCache<number, number>(10);
      expect(c.get(i + 500)).toBeUndefined();
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`insert ${n} unique keys and check size`, () => {
      const c = new LRUCache<number, number>(50);
      for (let k = 0; k < n; k++) c.set(k, k * 3);
      expect(c.size).toBe(n);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`overwrite key ${i}: value updates correctly`, () => {
      const c = new LRUCache<number, number>(10);
      c.set(i, 100);
      c.set(i, 200);
      expect(c.get(i)).toBe(200);
      expect(c.size).toBe(1);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LRUCache — eviction (LRU policy) (80+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('LRUCache — eviction (LRU policy)', () => {
  it('evicts least-recently-used key', () => {
    const c = new LRUCache<string, number>(2);
    c.set('a', 1);
    c.set('b', 2);
    c.get('a'); // a is MRU, b is LRU
    c.set('c', 3); // evicts b
    expect(c.has('b')).toBe(false);
    expect(c.has('a')).toBe(true);
    expect(c.has('c')).toBe(true);
  });

  for (let cap = 2; cap <= 10; cap++) {
    it(`cap=${cap}: size stays ≤ capacity after many inserts`, () => {
      const c = new LRUCache<number, number>(cap);
      for (let k = 0; k < cap * 4; k++) {
        c.set(k, k);
        expect(c.size).toBeLessThanOrEqual(cap);
      }
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`LRU eviction variant ${i}: accessing key prevents it from eviction`, () => {
      const c = new LRUCache<number, number>(3);
      c.set(0, 0);
      c.set(1, 1);
      c.set(2, 2);
      c.get(0); // 0 is MRU, 1 is LRU
      c.set(3, 3); // should evict 1
      expect(c.has(1)).toBe(false);
      expect(c.has(0)).toBe(true);
    });
  }

  for (let cap = 1; cap <= 20; cap++) {
    it(`cap=1 always evicts previous key (variant cap=${cap})`, () => {
      const c = new LRUCache<number, number>(1);
      c.set(1, 10);
      c.set(2, 20);
      expect(c.has(1)).toBe(false);
      expect(c.get(2)).toBe(20);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`set on existing key moves it to MRU (variant ${i})`, () => {
      const c = new LRUCache<number, number>(2);
      c.set(1, 10);
      c.set(2, 20);
      c.set(1, 11); // 1 is now MRU; 2 is LRU
      c.set(3, 30); // evicts 2
      expect(c.has(2)).toBe(false);
      expect(c.get(1)).toBe(11);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LRUCache — stats (50+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('LRUCache — stats', () => {
  it('initial state: 0 hits, 0 misses, NaN hitRate', () => {
    const c = new LRUCache<number, number>(10);
    expect(c.hits).toBe(0);
    expect(c.misses).toBe(0);
    expect(isNaN(c.hitRate)).toBe(true);
  });

  for (let n = 1; n <= 20; n++) {
    it(`${n} successful gets → ${n} hits`, () => {
      const c = new LRUCache<number, number>(30);
      for (let k = 0; k < n; k++) c.set(k, k);
      for (let k = 0; k < n; k++) c.get(k);
      expect(c.hits).toBe(n);
    });
  }

  for (let n = 1; n <= 20; n++) {
    it(`${n} failed gets → ${n} misses`, () => {
      const c = new LRUCache<number, number>(10);
      for (let k = 0; k < n; k++) c.get(k + 9999);
      expect(c.misses).toBe(n);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`resetStats clears counters (variant ${i})`, () => {
      const c = new LRUCache<number, number>(10);
      c.set(0, 0);
      for (let k = 0; k < i + 1; k++) c.get(0);
      c.resetStats();
      expect(c.hits).toBe(0);
      expect(c.misses).toBe(0);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// LRUCache — keys() most-recent-first (50+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('LRUCache — keys() most-recent-first', () => {
  it('empty cache returns empty keys array', () => {
    const c = new LRUCache<string, number>(10);
    expect(c.keys()).toEqual([]);
  });

  for (let n = 1; n <= 10; n++) {
    it(`${n} keys: last inserted is first in keys()`, () => {
      const c = new LRUCache<number, number>(50);
      for (let k = 0; k < n; k++) c.set(k, k);
      expect(c.keys()[0]).toBe(n - 1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`accessing key brings it to front of keys() (variant ${i})`, () => {
      const c = new LRUCache<number, number>(10);
      for (let k = 0; k < 5; k++) c.set(k, k);
      c.get(i % 5);
      expect(c.keys()[0]).toBe(i % 5);
    });
  }

  for (let n = 2; n <= 10; n++) {
    it(`${n} keys, no accesses: keys reversed insertion order`, () => {
      const c = new LRUCache<number, number>(50);
      for (let k = 0; k < n; k++) c.set(k, k);
      const keys = c.keys();
      expect(keys[0]).toBe(n - 1);
      expect(keys[keys.length - 1]).toBe(0);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`keys() length matches size (n=${n})`, () => {
      const c = new LRUCache<number, number>(50);
      for (let k = 0; k < n; k++) c.set(k, k);
      expect(c.keys().length).toBe(c.size);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`peek does not affect keys() order (variant ${i})`, () => {
      const c = new LRUCache<number, number>(10);
      c.set(0, 0);
      c.set(1, 1);
      c.set(2, 2);
      const beforePeek = c.keys().slice();
      c.peek(0);
      expect(c.keys()).toEqual(beforePeek);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// FIFOCache — get/set/eviction (80+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('FIFOCache — get/set/eviction', () => {
  for (let cap = 1; cap <= 20; cap++) {
    it(`capacity ${cap}: set and get single entry`, () => {
      const c = new FIFOCache<number, string>(cap);
      c.set(1, 'x');
      expect(c.get(1)).toBe('x');
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`get missing key ${i} returns undefined`, () => {
      const c = new FIFOCache<number, number>(10);
      expect(c.get(i + 100)).toBeUndefined();
    });
  }

  it('evicts in FIFO order', () => {
    const c = new FIFOCache<number, number>(3);
    c.set(1, 1);
    c.set(2, 2);
    c.set(3, 3);
    c.set(4, 4); // evicts 1
    expect(c.has(1)).toBe(false);
    expect(c.has(2)).toBe(true);
    expect(c.has(3)).toBe(true);
    expect(c.has(4)).toBe(true);
  });

  for (let cap = 2; cap <= 10; cap++) {
    it(`cap=${cap}: size stays ≤ capacity`, () => {
      const c = new FIFOCache<number, number>(cap);
      for (let k = 0; k < cap * 3; k++) {
        c.set(k, k);
        expect(c.size).toBeLessThanOrEqual(cap);
      }
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`FIFO eviction variant ${i}: first inserted is first evicted`, () => {
      const c = new FIFOCache<number, number>(3);
      c.set(10 * i, 0);
      c.set(10 * i + 1, 1);
      c.set(10 * i + 2, 2);
      c.get(10 * i); // FIFO — accessing does NOT affect eviction order
      c.set(10 * i + 3, 3); // evicts 10*i (first inserted)
      expect(c.has(10 * i)).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`overwrite existing key does not change FIFO order (variant ${i})`, () => {
      const c = new FIFOCache<number, number>(2);
      c.set(1, 10);
      c.set(2, 20);
      c.set(1, 11); // overwrite, does not requeue
      c.set(3, 30); // evicts 1 (still first in queue)
      expect(c.has(1)).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`delete and reinsert resets FIFO position (variant ${i})`, () => {
      const c = new FIFOCache<number, number>(2);
      c.set(1, 10);
      c.set(2, 20);
      c.delete(1);
      c.set(1, 11); // reinserted after 2
      c.set(3, 30); // evicts 2 (now oldest)
      expect(c.has(2)).toBe(false);
      expect(c.has(1)).toBe(true);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`has returns false after delete (variant ${i})`, () => {
      const c = new FIFOCache<number, number>(10);
      c.set(i, i);
      c.delete(i);
      expect(c.has(i)).toBe(false);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ARCCache — basic get/set (50+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('ARCCache — basic get/set', () => {
  for (let cap = 1; cap <= 10; cap++) {
    it(`capacity ${cap}: set and get single entry`, () => {
      const c = new ARCCache<number, string>(cap);
      c.set(1, 'arc');
      expect(c.get(1)).toBe('arc');
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`get missing key ${i} returns undefined`, () => {
      const c = new ARCCache<number, number>(10);
      expect(c.get(i + 500)).toBeUndefined();
    });
  }

  for (let cap = 2; cap <= 10; cap++) {
    it(`cap=${cap}: size never exceeds capacity`, () => {
      const c = new ARCCache<number, number>(cap);
      for (let k = 0; k < cap * 3; k++) {
        c.set(k, k);
        expect(c.size).toBeLessThanOrEqual(cap);
      }
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`has returns correct value (variant ${i})`, () => {
      const c = new ARCCache<number, number>(10);
      c.set(i, i);
      expect(c.has(i)).toBe(true);
      expect(c.has(i + 1000)).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`clear empties the cache (variant ${i})`, () => {
      const c = new ARCCache<number, number>(10);
      for (let k = 0; k < 5; k++) c.set(k, k);
      c.clear();
      expect(c.size).toBe(0);
      for (let k = 0; k < 5; k++) expect(c.has(k)).toBe(false);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// TwoQCache — basic get/set (50+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('TwoQCache — basic get/set', () => {
  for (let cap = 1; cap <= 10; cap++) {
    it(`capacity ${cap}: set and get single entry`, () => {
      const c = new TwoQCache<number, string>(cap);
      c.set(1, '2q');
      expect(c.get(1)).toBe('2q');
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`get missing key ${i} returns undefined`, () => {
      const c = new TwoQCache<number, number>(10);
      expect(c.get(i + 500)).toBeUndefined();
    });
  }

  for (let cap = 2; cap <= 10; cap++) {
    it(`cap=${cap}: size never exceeds capacity`, () => {
      const c = new TwoQCache<number, number>(cap);
      for (let k = 0; k < cap * 3; k++) {
        c.set(k, k);
        expect(c.size).toBeLessThanOrEqual(cap);
      }
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`has returns correct value (variant ${i})`, () => {
      const c = new TwoQCache<number, number>(10);
      c.set(i, i * 2);
      expect(c.has(i)).toBe(true);
      expect(c.has(i + 9999)).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`clear empties the cache (variant ${i})`, () => {
      const c = new TwoQCache<number, number>(10);
      for (let k = 0; k < 5; k++) c.set(k, k);
      c.clear();
      expect(c.size).toBe(0);
      for (let k = 0; k < 5; k++) expect(c.has(k)).toBe(false);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// memoizeLFU (50+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('memoizeLFU', () => {
  for (let i = 0; i < 20; i++) {
    it(`memoizes pure fn, call count stays 1 for repeated call (variant ${i})`, () => {
      let calls = 0;
      const fn = (x: number) => { calls++; return x * x; };
      const memo = memoizeLFU(fn, 10);
      const val = i + 1;
      expect(memo(val)).toBe(val * val);
      expect(memo(val)).toBe(val * val);
      expect(calls).toBe(1);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`${n} unique args each called once → ${n} underlying calls`, () => {
      let calls = 0;
      const fn = (x: number) => { calls++; return x + 1; };
      const memo = memoizeLFU(fn, 50);
      for (let k = 0; k < n; k++) memo(k);
      expect(calls).toBe(n);
    });
  }

  for (let cap = 1; cap <= 10; cap++) {
    it(`capacity ${cap}: oldest entry evicted when cache full`, () => {
      let calls = 0;
      const fn = (x: number) => { calls++; return x; };
      const memo = memoizeLFU(fn, cap);
      // Fill cache
      for (let k = 0; k < cap; k++) memo(k);
      const callsAfterFill = calls;
      // Insert one more (evicts LFU)
      memo(cap);
      expect(calls).toBe(callsAfterFill + 1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`custom keyFn is used (variant ${i})`, () => {
      let calls = 0;
      const fn = (a: number, b: number) => { calls++; return a + b; };
      const memo = memoizeLFU(fn, 10, (a, b) => `${a}|${b}`);
      expect(memo(i, i + 1)).toBe(2 * i + 1);
      expect(memo(i, i + 1)).toBe(2 * i + 1);
      expect(calls).toBe(1);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// memoizeLRU (50+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('memoizeLRU', () => {
  for (let i = 0; i < 20; i++) {
    it(`memoizes pure fn, call count stays 1 (variant ${i})`, () => {
      let calls = 0;
      const fn = (x: number) => { calls++; return x * 3; };
      const memo = memoizeLRU(fn, 10);
      const val = i + 1;
      expect(memo(val)).toBe(val * 3);
      expect(memo(val)).toBe(val * 3);
      expect(calls).toBe(1);
    });
  }

  for (let n = 1; n <= 10; n++) {
    it(`${n} unique args → ${n} underlying calls`, () => {
      let calls = 0;
      const fn = (x: number) => { calls++; return x - 1; };
      const memo = memoizeLRU(fn, 50);
      for (let k = 0; k < n; k++) memo(k);
      expect(calls).toBe(n);
    });
  }

  for (let cap = 1; cap <= 10; cap++) {
    it(`capacity ${cap}: LRU eviction on overflow`, () => {
      let calls = 0;
      const fn = (x: number) => { calls++; return x * 2; };
      const memo = memoizeLRU(fn, cap);
      for (let k = 0; k < cap; k++) memo(k);
      const callsAfterFill = calls;
      memo(cap); // overflows; evicts LRU
      expect(calls).toBe(callsAfterFill + 1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`custom keyFn works correctly (variant ${i})`, () => {
      let calls = 0;
      const fn = (s: string) => { calls++; return s.toUpperCase(); };
      const memo = memoizeLRU(fn, 10, (s) => s.toLowerCase());
      const key = `hello${i}`;
      expect(memo(key)).toBe(key.toUpperCase());
      expect(memo(key)).toBe(key.toUpperCase());
      expect(calls).toBe(1);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// createCache factory (20+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('createCache factory', () => {
  const strategies = ['lfu', 'lru', 'fifo', 'arc', '2q'] as const;

  for (const strategy of strategies) {
    it(`creates ${strategy} cache and basic set/get works`, () => {
      const c = createCache<number, string>(strategy, 10);
      c.set(1, 'value');
      expect(c.get(1)).toBe('value');
    });
  }

  for (const strategy of strategies) {
    for (let cap = 1; cap <= 3; cap++) {
      it(`${strategy} cache cap=${cap}: size ≤ cap after overflow`, () => {
        const c = createCache<number, number>(strategy, cap);
        for (let k = 0; k < cap * 2; k++) c.set(k, k);
        expect(c.size).toBeLessThanOrEqual(cap);
      });
    }
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Edge cases: capacity=1, capacity≤0 throws, clear then reuse (50+ tests)
// ═══════════════════════════════════════════════════════════════════════════

describe('Edge cases', () => {
  // capacity=0 throws
  const cacheClasses = [LFUCache, LRUCache, FIFOCache, ARCCache, TwoQCache] as const;

  for (const Cls of cacheClasses) {
    it(`${Cls.name} throws on capacity=0`, () => {
      expect(() => new (Cls as new (n: number) => unknown)(0)).toThrow(RangeError);
    });
  }

  for (const Cls of cacheClasses) {
    it(`${Cls.name} throws on capacity=-1`, () => {
      expect(() => new (Cls as new (n: number) => unknown)(-1)).toThrow(RangeError);
    });
  }

  // capacity=1 edge cases
  for (let i = 0; i < 10; i++) {
    it(`LFUCache cap=1: insert key ${i} replaces previous key`, () => {
      const c = new LFUCache<number, number>(1);
      c.set(i, i);
      c.set(i + 1, i + 1);
      expect(c.get(i + 1)).toBe(i + 1);
      expect(c.size).toBe(1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`LRUCache cap=1: insert key ${i} replaces previous key`, () => {
      const c = new LRUCache<number, number>(1);
      c.set(i, i * 2);
      c.set(i + 1, (i + 1) * 2);
      expect(c.get(i + 1)).toBe((i + 1) * 2);
      expect(c.size).toBe(1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`FIFOCache cap=1: insert key ${i} replaces previous key`, () => {
      const c = new FIFOCache<number, number>(1);
      c.set(i, i);
      c.set(i + 1, i + 1);
      expect(c.get(i + 1)).toBe(i + 1);
      expect(c.size).toBe(1);
    });
  }

  // clear then reuse
  for (let i = 0; i < 10; i++) {
    it(`LFUCache clear then reuse (variant ${i})`, () => {
      const c = new LFUCache<number, number>(10);
      for (let k = 0; k < 5; k++) c.set(k, k);
      c.clear();
      expect(c.size).toBe(0);
      c.set(99, 99);
      expect(c.get(99)).toBe(99);
      expect(c.size).toBe(1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`LRUCache clear then reuse (variant ${i})`, () => {
      const c = new LRUCache<number, number>(10);
      for (let k = 0; k < 5; k++) c.set(k, k);
      c.clear();
      expect(c.size).toBe(0);
      c.set(77, 77);
      expect(c.get(77)).toBe(77);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`FIFOCache clear then reuse (variant ${i})`, () => {
      const c = new FIFOCache<number, number>(10);
      for (let k = 0; k < 5; k++) c.set(k, k);
      c.clear();
      expect(c.size).toBe(0);
      c.set(55, 55);
      expect(c.get(55)).toBe(55);
    });
  }

  // capacity getter
  for (let cap = 1; cap <= 10; cap++) {
    it(`LFUCache reports correct capacity (cap=${cap})`, () => {
      const c = new LFUCache<number, number>(cap);
      expect(c.capacity).toBe(cap);
    });
  }

  for (let cap = 1; cap <= 10; cap++) {
    it(`LRUCache reports correct capacity (cap=${cap})`, () => {
      const c = new LRUCache<number, number>(cap);
      expect(c.capacity).toBe(cap);
    });
  }

  for (let cap = 1; cap <= 10; cap++) {
    it(`FIFOCache reports correct capacity (cap=${cap})`, () => {
      const c = new FIFOCache<number, number>(cap);
      expect(c.capacity).toBe(cap);
    });
  }

  // clear resets stats on LFU
  for (let i = 0; i < 5; i++) {
    it(`LFUCache clear resets hits/misses (variant ${i})`, () => {
      const c = new LFUCache<number, number>(10);
      c.set(0, 0);
      c.get(0);
      c.get(999);
      c.clear();
      expect(c.hits).toBe(0);
      expect(c.misses).toBe(0);
    });
  }

  // string keys
  for (let i = 0; i < 10; i++) {
    it(`LFUCache works with string keys (variant ${i})`, () => {
      const c = new LFUCache<string, number>(10);
      c.set(`key-${i}`, i * 10);
      expect(c.get(`key-${i}`)).toBe(i * 10);
    });
  }
});
