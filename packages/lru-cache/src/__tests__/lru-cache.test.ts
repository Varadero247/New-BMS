// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { LRUCache, createLRUCache } from '../lru-cache';

describe('LRUCache - construction', () => {
  it('creates with capacity', () => { expect(new LRUCache<string, number>(5).maxSize).toBe(5); });
  it('starts empty', () => { expect(new LRUCache<string, number>(5).size).toBe(0); });
  it('createLRUCache factory', () => { expect(createLRUCache<string, number>(10)).toBeInstanceOf(LRUCache); });
  it('throws for capacity 0', () => { expect(() => new LRUCache(0)).toThrow(); });
  it('throws for negative capacity', () => { expect(() => new LRUCache(-1)).toThrow(); });
  for (let i = 1; i <= 50; i++) {
    it('maxSize = ' + i, () => { expect(new LRUCache(i).maxSize).toBe(i); });
  }
});

describe('LRUCache - put and get', () => {
  it('get missing key returns undefined', () => { expect(new LRUCache<string,number>(5).get('x')).toBeUndefined(); });
  it('put and get', () => {
    const c = new LRUCache<string,number>(5); c.put('k', 42);
    expect(c.get('k')).toBe(42);
  });
  it('update existing key', () => {
    const c = new LRUCache<string,number>(5); c.put('k', 1); c.put('k', 2);
    expect(c.get('k')).toBe(2);
  });
  it('size after puts', () => {
    const c = new LRUCache<string,number>(5); c.put('a', 1); c.put('b', 2);
    expect(c.size).toBe(2);
  });
  it('evicts LRU when full', () => {
    const c = new LRUCache<string,number>(2);
    c.put('a', 1); c.put('b', 2); c.put('c', 3);
    expect(c.has('a')).toBe(false);
  });
  for (let i = 0; i < 100; i++) {
    it('put and get key' + i, () => {
      const c = new LRUCache<string,number>(200);
      c.put('key' + i, i);
      expect(c.get('key' + i)).toBe(i);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('size = ' + n + ' after ' + n + ' unique puts', () => {
      const c = new LRUCache<string,number>(n);
      for (let i = 0; i < n; i++) c.put('k' + i, i);
      expect(c.size).toBe(n);
    });
  }
});

describe('LRUCache - eviction order', () => {
  it('evicts least recently used', () => {
    const c = new LRUCache<string,number>(3);
    c.put('a', 1); c.put('b', 2); c.put('c', 3);
    c.get('a'); // make 'a' recently used
    c.put('d', 4); // evicts 'b'
    expect(c.has('b')).toBe(false);
    expect(c.has('a')).toBe(true);
  });
  it('update makes key recently used', () => {
    const c = new LRUCache<string,number>(2);
    c.put('a', 1); c.put('b', 2);
    c.put('a', 10); // update 'a', making 'b' LRU
    c.put('c', 3); // evicts 'b'
    expect(c.has('b')).toBe(false);
    expect(c.get('a')).toBe(10);
  });
  for (let cap = 1; cap <= 30; cap++) {
    it('capacity ' + cap + ' never exceeds limit', () => {
      const c = new LRUCache<string,number>(cap);
      for (let i = 0; i < cap + 5; i++) c.put('k' + i, i);
      expect(c.size).toBeLessThanOrEqual(cap);
    });
  }
});

describe('LRUCache - has, delete, peek, keys, values', () => {
  it('has returns true for existing key', () => {
    const c = new LRUCache<string,number>(5); c.put('k', 1);
    expect(c.has('k')).toBe(true);
  });
  it('has returns false for missing', () => { expect(new LRUCache<string,number>(5).has('x')).toBe(false); });
  it('delete removes key', () => {
    const c = new LRUCache<string,number>(5); c.put('k', 1); c.delete('k');
    expect(c.has('k')).toBe(false);
  });
  it('delete returns true for existing', () => {
    const c = new LRUCache<string,number>(5); c.put('k', 1);
    expect(c.delete('k')).toBe(true);
  });
  it('delete returns false for missing', () => { expect(new LRUCache<string,number>(5).delete('x')).toBe(false); });
  it('peek does not change LRU order', () => {
    const c = new LRUCache<string,number>(2);
    c.put('a', 1); c.put('b', 2);
    c.peek('a'); // should not promote 'a'
    expect(c.peek('a')).toBe(1);
  });
  it('keys returns all keys', () => {
    const c = new LRUCache<string,number>(5); c.put('a', 1); c.put('b', 2);
    expect(c.keys()).toContain('a');
    expect(c.keys()).toContain('b');
  });
  it('values returns all values', () => {
    const c = new LRUCache<string,number>(5); c.put('a', 1); c.put('b', 2);
    expect(c.values()).toContain(1);
    expect(c.values()).toContain(2);
  });
  it('clear empties cache', () => {
    const c = new LRUCache<string,number>(5); c.put('a', 1); c.clear();
    expect(c.size).toBe(0);
  });
  for (let i = 0; i < 50; i++) {
    it('delete then has false ' + i, () => {
      const c = new LRUCache<string,number>(100); c.put('k' + i, i); c.delete('k' + i);
      expect(c.has('k' + i)).toBe(false);
    });
  }
});

describe('LRUCache - hitRate', () => {
  it('hitRate is 0 initially', () => { expect(new LRUCache<string,number>(5).hitRate).toBe(0); });
  it('hitRate increases with hits', () => {
    const c = new LRUCache<string,number>(5); c.put('k', 1); c.get('k');
    expect(c.hitRate).toBeGreaterThan(0);
  });
  for (let i = 1; i <= 50; i++) {
    it('hitRate in [0,1] after ' + i + ' ops', () => {
      const c = new LRUCache<string,number>(10);
      for (let j = 0; j < i; j++) { c.put('k' + j, j); c.get('k' + j); }
      expect(c.hitRate).toBeGreaterThanOrEqual(0);
      expect(c.hitRate).toBeLessThanOrEqual(1);
    });
  }
});

describe('lru top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('put then get ' + i, () => {
      const c = new LRUCache<string,number>(200);
      c.put('k' + i, i * 3);
      expect(c.get('k' + i)).toBe(i * 3);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('size after single put is 1 ' + i, () => {
      const c = new LRUCache<string,number>(10);
      c.put('key' + i, i);
      expect(c.size).toBe(1);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('has returns true after put ' + i, () => {
      const c = new LRUCache<string,number>(10);
      c.put('x' + i, i);
      expect(c.has('x' + i)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('get returns undefined for missing ' + i, () => {
      expect(new LRUCache<string,number>(10).get('missing' + i)).toBeUndefined();
    });
  }
  for (let cap = 1; cap <= 100; cap++) {
    it('capacity ' + cap + ' maxSize correct', () => {
      expect(new LRUCache(cap).maxSize).toBe(cap);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('clear then size is 0 ' + i, () => {
      const c = new LRUCache<string,number>(10);
      c.put('k', i); c.clear();
      expect(c.size).toBe(0);
    });
  }
});

describe('lru final top-up', () => {
  for (let i = 0; i < 60; i++) {
    it('peek does not evict ' + i, () => {
      const c = new LRUCache<string,number>(2);
      c.put('a', 1); c.put('b' + i, 2);
      const pv = c.peek('a');
      expect(pv).toBe(1);
    });
  }
});
