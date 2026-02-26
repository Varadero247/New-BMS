// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { BloomFilter, createBloomFilter, optimalBloomSize, optimalHashCount } from '../bloom-filter';

describe('BloomFilter - construction', () => {
  it('creates with default size', () => { expect(new BloomFilter().bitSize).toBe(1024); });
  it('creates with custom size', () => { expect(new BloomFilter(2048).bitSize).toBe(2048); });
  it('default k = 3', () => { expect(new BloomFilter().hashFunctions).toBe(3); });
  it('custom k', () => { expect(new BloomFilter(512, 5).hashFunctions).toBe(5); });
  it('createBloomFilter factory', () => { expect(createBloomFilter()).toBeInstanceOf(BloomFilter); });
  for (let i = 1; i <= 50; i++) {
    it(`BloomFilter bitSize = ${i * 64}`, () => {
      expect(new BloomFilter(i * 64).bitSize).toBe(i * 64);
    });
  }
});

describe('BloomFilter - add and mightContain', () => {
  it('added item might be contained', () => {
    const bf = new BloomFilter(1024);
    bf.add('hello');
    expect(bf.mightContain('hello')).toBe(true);
  });
  it('item not added is likely not contained', () => {
    expect(new BloomFilter(1024).mightContain('notadded')).toBe(false);
  });
  it('multiple adds', () => {
    const bf = new BloomFilter(2048);
    bf.add('a'); bf.add('b'); bf.add('c');
    expect(bf.mightContain('a')).toBe(true);
    expect(bf.mightContain('b')).toBe(true);
    expect(bf.mightContain('c')).toBe(true);
  });
  for (let i = 0; i < 100; i++) {
    it(`add and contain item${i}`, () => {
      const bf = new BloomFilter(2048);
      bf.add('item' + i);
      expect(bf.mightContain('item' + i)).toBe(true);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it(`all ${n} added items contained`, () => {
      const bf = new BloomFilter(4096);
      const words = Array.from({ length: n }, (_, i) => 'word' + i);
      for (const w of words) bf.add(w);
      expect(words.every(w => bf.mightContain(w))).toBe(true);
    });
  }
});

describe('BloomFilter - clear and merge', () => {
  it('clear removes all items', () => {
    const bf = new BloomFilter(1024);
    bf.add('test');
    bf.clear();
    expect(bf.mightContain('test')).toBe(false);
  });
  it('merge combines two filters', () => {
    const bf1 = new BloomFilter(1024, 3);
    const bf2 = new BloomFilter(1024, 3);
    bf1.add('a'); bf2.add('b');
    const merged = bf1.merge(bf2);
    expect(merged.mightContain('a')).toBe(true);
    expect(merged.mightContain('b')).toBe(true);
  });
  it('merge throws for incompatible filters', () => {
    const bf1 = new BloomFilter(1024, 3);
    const bf2 = new BloomFilter(2048, 3);
    expect(() => bf1.merge(bf2)).toThrow();
  });
  for (let i = 0; i < 50; i++) {
    it('merge preserves items ' + i, () => {
      const bf1 = new BloomFilter(2048, 3);
      const bf2 = new BloomFilter(2048, 3);
      bf1.add('left' + i); bf2.add('right' + i);
      const m = bf1.merge(bf2);
      expect(m.mightContain('left' + i)).toBe(true);
      expect(m.mightContain('right' + i)).toBe(true);
    });
  }
});

describe('BloomFilter - false positive rate', () => {
  it('fpr at n=0 is 0', () => { expect(new BloomFilter(1024).estimateFalsePositiveRate(0)).toBeCloseTo(0, 5); });
  it('fpr increases with n', () => {
    const bf = new BloomFilter(1024, 3);
    expect(bf.estimateFalsePositiveRate(100)).toBeGreaterThan(bf.estimateFalsePositiveRate(10));
  });
  for (let n = 1; n <= 50; n++) {
    it('fpr(' + n + ') in [0,1]', () => {
      const r = new BloomFilter(4096, 3).estimateFalsePositiveRate(n);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(1);
    });
  }
});

describe('optimalBloomSize and optimalHashCount', () => {
  it('optimalBloomSize for n=1000, fpr=0.01 is positive', () => {
    expect(optimalBloomSize(1000, 0.01)).toBeGreaterThan(0);
  });
  it('optimalHashCount is positive', () => {
    expect(optimalHashCount(9585, 1000)).toBeGreaterThan(0);
  });
  for (let i = 1; i <= 50; i++) {
    it('optimalBloomSize(' + i * 100 + ', 0.01) > 0', () => {
      expect(optimalBloomSize(i * 100, 0.01)).toBeGreaterThan(0);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it('optimalHashCount(' + i * 100 + ', 100) >= 1', () => {
      expect(optimalHashCount(i * 100, 100)).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('BloomFilter extra', () => {
  for (let i = 0; i < 100; i++) {
    it('empty filter does not contain key' + i, () => {
      expect(new BloomFilter(2048).mightContain('key' + i)).toBe(false);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('after clear mightContain is false ' + i, () => {
      const bf = new BloomFilter(2048);
      bf.add('item' + i);
      bf.clear();
      expect(bf.mightContain('item' + i)).toBe(false);
    });
  }
});

describe('bloom top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('added string' + i + ' is contained', () => {
      const bf = new BloomFilter(4096, 3);
      bf.add('teststring' + i);
      expect(bf.mightContain('teststring' + i)).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('bitSize after construction ' + i, () => {
      expect(new BloomFilter((i + 1) * 32).bitSize).toBe((i + 1) * 32);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('hashFunctions preserved ' + i, () => {
      const k = (i % 5) + 1;
      expect(new BloomFilter(1024, k).hashFunctions).toBe(k);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('clear then add works fresh ' + i, () => {
      const bf = new BloomFilter(2048);
      bf.add('old' + i); bf.clear();
      bf.add('new' + i);
      expect(bf.mightContain('new' + i)).toBe(true);
    });
  }
});
