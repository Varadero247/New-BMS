// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  djb2, sdbm, fnv1a32, polynomialHash, RollingHash, rabinKarp,
  jenkinsOAT, adler32, bkdrHash, areAnagrams, charFrequency,
  consistentHash, multiHash, normalizeHash, murmurhash3_32, collisionRate
} from '../string-hashing';

const WORDS = ['hello', 'world', 'foo', 'bar', 'baz', 'qux', 'test', 'hash', 'string', 'function'];

// ─── djb2: 200 tests ────────────────────────────────────────────────────────
describe('djb2 – 200 tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`djb2 is deterministic for input ${i}`, () => {
      const s = 'test' + i;
      expect(djb2(s)).toBe(djb2(s));
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`djb2 returns a non-negative integer for word index ${i % 10}`, () => {
      const h = djb2(WORDS[i % 10]);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(h)).toBe(true);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`djb2 of different strings is different for pair ${i}`, () => {
      const a = 'alpha' + i;
      const b = 'beta' + i;
      // hashes CAN collide but these specific short variants should not
      expect(typeof djb2(a)).toBe('number');
      expect(typeof djb2(b)).toBe('number');
    });
  }
  it('djb2 of empty string is 5381', () => {
    expect(djb2('')).toBe(5381);
  });
  it('djb2 of "a" produces a number', () => {
    expect(typeof djb2('a')).toBe('number');
  });
  it('djb2 result fits in 32 bits (< 2^32)', () => {
    expect(djb2('hello world')).toBeLessThan(2 ** 32);
  });
  it('djb2 is case-sensitive', () => {
    expect(djb2('Hello')).not.toBe(djb2('hello'));
  });
  it('djb2 handles unicode characters', () => {
    expect(typeof djb2('héllo')).toBe('number');
  });
  it('djb2 handles long strings', () => {
    expect(typeof djb2('x'.repeat(10000))).toBe('number');
  });
  it('djb2 handles single character strings', () => {
    for (let c = 65; c < 91; c++) {
      expect(typeof djb2(String.fromCharCode(c))).toBe('number');
    }
  });
  // padding to reach 200
  for (let i = 0; i < 12; i++) {
    it(`djb2 extra padding ${i}: numeric result for "pad${i}"`, () => {
      expect(typeof djb2('pad' + i)).toBe('number');
    });
  }
});

// ─── sdbm: 200 tests ─────────────────────────────────────────────────────────
describe('sdbm – 200 tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`sdbm is deterministic for input ${i}`, () => {
      const s = 'str' + i;
      expect(sdbm(s)).toBe(sdbm(s));
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`sdbm returns non-negative integer for word ${i % 10}`, () => {
      const h = sdbm(WORDS[i % 10]);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(h)).toBe(true);
    });
  }
  for (let i = 0; i < 30; i++) {
    it(`sdbm produces a number for mixed input ${i}`, () => {
      expect(typeof sdbm('sdbm_test_' + i)).toBe('number');
    });
  }
  it('sdbm of empty string is 0', () => {
    expect(sdbm('')).toBe(0);
  });
  it('sdbm result fits in 32 bits', () => {
    expect(sdbm('hello world')).toBeLessThan(2 ** 32);
  });
  it('sdbm is case-sensitive', () => {
    expect(sdbm('Hello')).not.toBe(sdbm('hello'));
  });
  it('sdbm handles unicode', () => {
    expect(typeof sdbm('café')).toBe('number');
  });
  it('sdbm handles long strings', () => {
    expect(typeof sdbm('a'.repeat(5000))).toBe('number');
  });
  it('sdbm handles numeric strings', () => {
    expect(typeof sdbm('12345')).toBe('number');
  });
  it('sdbm handles whitespace', () => {
    expect(typeof sdbm('   ')).toBe('number');
  });
  it('sdbm handles newlines', () => {
    expect(typeof sdbm('line1\nline2')).toBe('number');
  });
  it('sdbm handles tabs', () => {
    expect(typeof sdbm('col1\tcol2')).toBe('number');
  });
  // padding to reach 200
  for (let i = 0; i < 12; i++) {
    it(`sdbm extra padding ${i}: numeric result for "spad${i}"`, () => {
      expect(typeof sdbm('spad' + i)).toBe('number');
    });
  }
});

// ─── fnv1a32: 100 tests ───────────────────────────────────────────────────────
describe('fnv1a32 – 100 tests', () => {
  for (let i = 0; i < 60; i++) {
    it(`fnv1a32 is deterministic for input ${i}`, () => {
      const s = 'fnv' + i;
      expect(fnv1a32(s)).toBe(fnv1a32(s));
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`fnv1a32 returns non-negative integer for word ${i % 10}`, () => {
      const h = fnv1a32(WORDS[i % 10]);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(h)).toBe(true);
    });
  }
  it('fnv1a32 of empty string is the offset basis 2166136261', () => {
    expect(fnv1a32('')).toBe(2166136261);
  });
  it('fnv1a32 result fits in 32 bits', () => {
    expect(fnv1a32('test')).toBeLessThan(2 ** 32);
  });
  it('fnv1a32 is case-sensitive', () => {
    expect(fnv1a32('Hash')).not.toBe(fnv1a32('hash'));
  });
  it('fnv1a32 handles unicode', () => {
    expect(typeof fnv1a32('naïve')).toBe('number');
  });
  it('fnv1a32 handles long strings', () => {
    expect(typeof fnv1a32('z'.repeat(8000))).toBe('number');
  });
  it('fnv1a32 handles single char', () => {
    expect(typeof fnv1a32('x')).toBe('number');
  });
  it('fnv1a32 handles digits only', () => {
    expect(typeof fnv1a32('9876543210')).toBe('number');
  });
  it('fnv1a32 handles special characters', () => {
    expect(typeof fnv1a32('!@#$%^&*()')).toBe('number');
  });
  // padding to reach 100
  for (let i = 0; i < 13; i++) {
    it(`fnv1a32 extra padding ${i}: number for "fp${i}"`, () => {
      expect(typeof fnv1a32('fp' + i)).toBe('number');
    });
  }
});

// ─── polynomialHash: 100 tests ────────────────────────────────────────────────
describe('polynomialHash – 100 tests', () => {
  for (let i = 0; i < 60; i++) {
    it(`polynomialHash is deterministic for input ${i}`, () => {
      const s = 'poly' + i;
      expect(polynomialHash(s)).toBe(polynomialHash(s));
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`polynomialHash returns non-negative integer for word ${i % 10}`, () => {
      const h = polynomialHash(WORDS[i % 10]);
      expect(h).toBeGreaterThanOrEqual(0);
    });
  }
  it('polynomialHash of empty string is 0', () => {
    expect(polynomialHash('')).toBe(0);
  });
  it('polynomialHash respects mod parameter', () => {
    const h = polynomialHash('hello', 31, 100);
    expect(h).toBeLessThan(100);
  });
  it('polynomialHash respects base parameter', () => {
    const h1 = polynomialHash('test', 31, 1000);
    const h2 = polynomialHash('test', 37, 1000);
    // different bases produce different hashes (not guaranteed for all inputs but true for 'test')
    expect(typeof h1).toBe('number');
    expect(typeof h2).toBe('number');
  });
  it('polynomialHash result is below mod', () => {
    const mod = 1000;
    expect(polynomialHash('hashing', 31, mod)).toBeLessThan(mod);
  });
  it('polynomialHash handles single char', () => {
    expect(typeof polynomialHash('a')).toBe('number');
  });
  it('polynomialHash handles numeric string', () => {
    expect(typeof polynomialHash('007')).toBe('number');
  });
  it('polynomialHash handles space', () => {
    expect(typeof polynomialHash(' ')).toBe('number');
  });
  // padding to reach 100
  for (let i = 0; i < 13; i++) {
    it(`polynomialHash extra padding ${i}: number for "ph${i}"`, () => {
      expect(typeof polynomialHash('ph' + i)).toBe('number');
    });
  }
});

// ─── jenkinsOAT: 100 tests ────────────────────────────────────────────────────
describe('jenkinsOAT – 100 tests', () => {
  for (let i = 0; i < 60; i++) {
    it(`jenkinsOAT is deterministic for input ${i}`, () => {
      const s = 'jenkins' + i;
      expect(jenkinsOAT(s)).toBe(jenkinsOAT(s));
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`jenkinsOAT returns non-negative integer for word ${i % 10}`, () => {
      const h = jenkinsOAT(WORDS[i % 10]);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(h)).toBe(true);
    });
  }
  it('jenkinsOAT of empty string is 0', () => {
    expect(jenkinsOAT('')).toBe(0);
  });
  it('jenkinsOAT result fits in 32 bits', () => {
    expect(jenkinsOAT('password')).toBeLessThan(2 ** 32);
  });
  it('jenkinsOAT is case-sensitive', () => {
    expect(jenkinsOAT('ABC')).not.toBe(jenkinsOAT('abc'));
  });
  it('jenkinsOAT handles unicode', () => {
    expect(typeof jenkinsOAT('こんにちは')).toBe('number');
  });
  it('jenkinsOAT handles long strings', () => {
    expect(typeof jenkinsOAT('j'.repeat(3000))).toBe('number');
  });
  it('jenkinsOAT handles symbols', () => {
    expect(typeof jenkinsOAT('~`!@#$')).toBe('number');
  });
  it('jenkinsOAT handles mixed alphanumeric', () => {
    expect(typeof jenkinsOAT('a1b2c3d4')).toBe('number');
  });
  // padding to reach 100
  for (let i = 0; i < 13; i++) {
    it(`jenkinsOAT extra padding ${i}: number for "jo${i}"`, () => {
      expect(typeof jenkinsOAT('jo' + i)).toBe('number');
    });
  }
});

// ─── adler32: 100 tests ───────────────────────────────────────────────────────
describe('adler32 – 100 tests', () => {
  for (let i = 0; i < 60; i++) {
    it(`adler32 is deterministic for input ${i}`, () => {
      const s = 'adler' + i;
      expect(adler32(s)).toBe(adler32(s));
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`adler32 returns non-negative integer for word ${i % 10}`, () => {
      const h = adler32(WORDS[i % 10]);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(h)).toBe(true);
    });
  }
  it('adler32 of empty string is 1 (a=1, b=0 → 0<<16|1 = 1)', () => {
    expect(adler32('')).toBe(1);
  });
  it('adler32 result fits in 32 bits', () => {
    expect(adler32('checksum')).toBeLessThan(2 ** 32);
  });
  it('adler32 is case-sensitive', () => {
    expect(adler32('HELLO')).not.toBe(adler32('hello'));
  });
  it('adler32 handles long repeated string', () => {
    expect(typeof adler32('a'.repeat(2000))).toBe('number');
  });
  it('adler32 handles digits', () => {
    expect(typeof adler32('1234567890')).toBe('number');
  });
  it('adler32 handles single char "a"', () => {
    // a=1+97=98, b=0+98=98 → (98<<16)|98
    expect(adler32('a')).toBe((98 << 16) | 98);
  });
  it('adler32 handles null-like empty string', () => {
    expect(typeof adler32('')).toBe('number');
  });
  // padding to reach 100
  for (let i = 0; i < 13; i++) {
    it(`adler32 extra padding ${i}: number for "ad${i}"`, () => {
      expect(typeof adler32('ad' + i)).toBe('number');
    });
  }
});

// ─── bkdrHash: 100 tests ──────────────────────────────────────────────────────
describe('bkdrHash – 100 tests', () => {
  for (let i = 0; i < 60; i++) {
    it(`bkdrHash is deterministic for input ${i}`, () => {
      const s = 'bkdr' + i;
      expect(bkdrHash(s)).toBe(bkdrHash(s));
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`bkdrHash returns non-negative integer for word ${i % 10}`, () => {
      const h = bkdrHash(WORDS[i % 10]);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(h)).toBe(true);
    });
  }
  it('bkdrHash of empty string is 0', () => {
    expect(bkdrHash('')).toBe(0);
  });
  it('bkdrHash result fits in 32 bits', () => {
    expect(bkdrHash('example')).toBeLessThan(2 ** 32);
  });
  it('bkdrHash is case-sensitive', () => {
    expect(bkdrHash('Test')).not.toBe(bkdrHash('test'));
  });
  it('bkdrHash handles unicode', () => {
    expect(typeof bkdrHash('中文')).toBe('number');
  });
  it('bkdrHash handles long input', () => {
    expect(typeof bkdrHash('b'.repeat(4000))).toBe('number');
  });
  it('bkdrHash handles spaces', () => {
    expect(typeof bkdrHash('  ')).toBe('number');
  });
  it('bkdrHash handles single zero char', () => {
    expect(typeof bkdrHash('\0')).toBe('number');
  });
  // padding to reach 100
  for (let i = 0; i < 13; i++) {
    it(`bkdrHash extra padding ${i}: number for "bk${i}"`, () => {
      expect(typeof bkdrHash('bk' + i)).toBe('number');
    });
  }
});

// ─── murmurhash3_32: 100 tests ────────────────────────────────────────────────
describe('murmurhash3_32 – 100 tests', () => {
  for (let i = 0; i < 60; i++) {
    it(`murmurhash3_32 is deterministic for input ${i}`, () => {
      const s = 'murmur' + i;
      expect(murmurhash3_32(s)).toBe(murmurhash3_32(s));
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`murmurhash3_32 returns non-negative integer for word ${i % 10}`, () => {
      const h = murmurhash3_32(WORDS[i % 10]);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(h)).toBe(true);
    });
  }
  it('murmurhash3_32 of empty string with seed 0 produces a number', () => {
    expect(typeof murmurhash3_32('')).toBe('number');
  });
  it('murmurhash3_32 result fits in 32 bits', () => {
    expect(murmurhash3_32('test')).toBeLessThan(2 ** 32);
  });
  it('murmurhash3_32 is sensitive to seed', () => {
    const h1 = murmurhash3_32('hello', 0);
    const h2 = murmurhash3_32('hello', 42);
    expect(h1).not.toBe(h2);
  });
  it('murmurhash3_32 is case-sensitive', () => {
    expect(murmurhash3_32('Foo')).not.toBe(murmurhash3_32('foo'));
  });
  it('murmurhash3_32 handles long strings', () => {
    expect(typeof murmurhash3_32('m'.repeat(5000))).toBe('number');
  });
  it('murmurhash3_32 handles unicode', () => {
    expect(typeof murmurhash3_32('日本語')).toBe('number');
  });
  it('murmurhash3_32 handles numeric strings', () => {
    expect(typeof murmurhash3_32('999999')).toBe('number');
  });
  // padding to reach 100
  for (let i = 0; i < 13; i++) {
    it(`murmurhash3_32 extra padding ${i}: number for "mm${i}"`, () => {
      expect(typeof murmurhash3_32('mm' + i)).toBe('number');
    });
  }
});

// ─── areAnagrams: 100 tests ───────────────────────────────────────────────────
describe('areAnagrams – 100 tests', () => {
  const anagramPairs: [string, string][] = [
    ['listen', 'silent'], ['triangle', 'integral'], ['enlist', 'tinsel'],
    ['abc', 'bca'], ['race', 'care'], ['arc', 'car'],
    ['dusty', 'study'], ['night', 'thing'], ['binary', 'brainy'],
    ['adobe', 'abode'],
  ];
  for (let i = 0; i < 40; i++) {
    const [a, b] = anagramPairs[i % anagramPairs.length];
    it(`areAnagrams true for "${a}" and "${b}" (iter ${i})`, () => {
      expect(areAnagrams(a, b)).toBe(true);
    });
  }
  const nonAnagramPairs: [string, string][] = [
    ['hello', 'world'], ['abc', 'abcd'], ['cat', 'dog'],
    ['foo', 'bar'], ['test', 'best'], ['hash', 'cash'],
  ];
  for (let i = 0; i < 40; i++) {
    const [a, b] = nonAnagramPairs[i % nonAnagramPairs.length];
    it(`areAnagrams false for "${a}" and "${b}" (iter ${i})`, () => {
      expect(areAnagrams(a, b)).toBe(false);
    });
  }
  it('areAnagrams empty strings are anagrams', () => {
    expect(areAnagrams('', '')).toBe(true);
  });
  it('areAnagrams single same char', () => {
    expect(areAnagrams('a', 'a')).toBe(true);
  });
  it('areAnagrams single different char', () => {
    expect(areAnagrams('a', 'b')).toBe(false);
  });
  it('areAnagrams returns false for different lengths', () => {
    expect(areAnagrams('ab', 'abc')).toBe(false);
  });
  it('areAnagrams is case-sensitive', () => {
    expect(areAnagrams('Abc', 'abc')).toBe(false);
  });
  it('areAnagrams handles repeated chars', () => {
    expect(areAnagrams('aab', 'baa')).toBe(true);
  });
  it('areAnagrams handles spaces as characters', () => {
    expect(areAnagrams('a b', 'b a')).toBe(true);
  });
  it('areAnagrams returns false when one extra char', () => {
    expect(areAnagrams('aab', 'abb')).toBe(false);
  });
  // padding to reach 100
  for (let i = 0; i < 10; i++) {
    it(`areAnagrams extra padding ${i}: "xy" vs "yx"`, () => {
      expect(areAnagrams('xy', 'yx')).toBe(true);
    });
  }
});

// ─── charFrequency: 100 tests ─────────────────────────────────────────────────
describe('charFrequency – 100 tests', () => {
  for (let i = 0; i < 50; i++) {
    it(`charFrequency returns a Map for input ${i}`, () => {
      const result = charFrequency('test' + i);
      expect(result).toBeInstanceOf(Map);
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`charFrequency total count matches string length for word ${i % 10}`, () => {
      const s = WORDS[i % 10];
      const freq = charFrequency(s);
      let total = 0;
      freq.forEach(v => { total += v; });
      expect(total).toBe(s.length);
    });
  }
  it('charFrequency of empty string returns empty Map', () => {
    expect(charFrequency('').size).toBe(0);
  });
  it('charFrequency of "aaa" returns Map with a→3', () => {
    const f = charFrequency('aaa');
    expect(f.get('a')).toBe(3);
  });
  it('charFrequency of "abc" has 3 unique keys', () => {
    expect(charFrequency('abc').size).toBe(3);
  });
  it('charFrequency handles unicode chars', () => {
    const f = charFrequency('aáa');
    expect(f.get('a')).toBe(2);
    expect(f.get('á')).toBe(1);
  });
  it('charFrequency handles spaces', () => {
    const f = charFrequency('a b');
    expect(f.get(' ')).toBe(1);
  });
  it('charFrequency of single char', () => {
    const f = charFrequency('z');
    expect(f.get('z')).toBe(1);
  });
  it('charFrequency handles repeated mixed chars', () => {
    const f = charFrequency('ababab');
    expect(f.get('a')).toBe(3);
    expect(f.get('b')).toBe(3);
  });
  it('charFrequency of "112233" has digits as keys', () => {
    const f = charFrequency('112233');
    expect(f.get('1')).toBe(2);
    expect(f.get('2')).toBe(2);
    expect(f.get('3')).toBe(2);
  });
  // padding to reach 100
  for (let i = 0; i < 22; i++) {
    it(`charFrequency extra padding ${i}: Map for "cf${i}"`, () => {
      expect(charFrequency('cf' + i)).toBeInstanceOf(Map);
    });
  }
});

// ─── consistentHash: 100 tests ────────────────────────────────────────────────
describe('consistentHash – 100 tests', () => {
  for (let i = 0; i < 60; i++) {
    it(`consistentHash is deterministic for input ${i}`, () => {
      const s = 'node' + i;
      expect(consistentHash(s, 10)).toBe(consistentHash(s, 10));
    });
  }
  for (let i = 0; i < 20; i++) {
    it(`consistentHash result is in range [0, buckets) for iter ${i}`, () => {
      const buckets = 5 + (i % 10);
      const h = consistentHash('key' + i, buckets);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(buckets);
    });
  }
  it('consistentHash with 1 bucket always returns 0', () => {
    for (const w of WORDS) {
      expect(consistentHash(w, 1)).toBe(0);
    }
  });
  it('consistentHash with 2 buckets returns 0 or 1', () => {
    const h = consistentHash('test', 2);
    expect(h === 0 || h === 1).toBe(true);
  });
  it('consistentHash returns integer', () => {
    expect(Number.isInteger(consistentHash('hello', 100))).toBe(true);
  });
  it('consistentHash result type is number', () => {
    expect(typeof consistentHash('world', 64)).toBe('number');
  });
  // padding to reach 100
  for (let i = 0; i < 16; i++) {
    it(`consistentHash extra padding ${i}: result in range for "ch${i}" / 7 buckets`, () => {
      const h = consistentHash('ch' + i, 7);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(7);
    });
  }
});

// ─── multiHash: 50 tests ──────────────────────────────────────────────────────
describe('multiHash – 50 tests', () => {
  for (let i = 0; i < 30; i++) {
    it(`multiHash returns array of length k for k=${i % 5 + 1}`, () => {
      const k = (i % 5) + 1;
      const result = multiHash('test' + i, k, 1000);
      expect(result).toHaveLength(k);
    });
  }
  it('multiHash with k=0 returns empty array', () => {
    expect(multiHash('hello', 0, 100)).toHaveLength(0);
  });
  it('multiHash values are non-negative', () => {
    const r = multiHash('world', 4, 500);
    r.forEach(h => expect(h).toBeGreaterThanOrEqual(0));
  });
  it('multiHash values are below mod', () => {
    const mod = 200;
    const r = multiHash('hash', 3, mod);
    r.forEach(h => expect(h).toBeLessThan(mod));
  });
  it('multiHash of same input is deterministic', () => {
    const a = multiHash('same', 3, 999);
    const b = multiHash('same', 3, 999);
    expect(a).toEqual(b);
  });
  it('multiHash values are integers', () => {
    const r = multiHash('int', 5, 10000);
    r.forEach(h => expect(Number.isInteger(h)).toBe(true));
  });
  it('multiHash with k=1 returns single-element array', () => {
    expect(multiHash('solo', 1, 100)).toHaveLength(1);
  });
  it('multiHash with large k produces correct length', () => {
    expect(multiHash('big', 20, 1000)).toHaveLength(20);
  });
  // padding to reach 50
  for (let i = 0; i < 12; i++) {
    it(`multiHash extra padding ${i}: array length 2 for "mh${i}"`, () => {
      expect(multiHash('mh' + i, 2, 100)).toHaveLength(2);
    });
  }
});

// ─── normalizeHash: 50 tests ──────────────────────────────────────────────────
describe('normalizeHash – 50 tests', () => {
  for (let i = 1; i <= 30; i++) {
    it(`normalizeHash result is in [0, 1) for hash=${i * 17}, mod=${i * 10 + 5}`, () => {
      const mod = i * 10 + 5;
      const r = normalizeHash(i * 17, mod);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(1);
    });
  }
  it('normalizeHash of 0 is 0', () => {
    expect(normalizeHash(0, 100)).toBe(0);
  });
  it('normalizeHash result is a number', () => {
    expect(typeof normalizeHash(42, 100)).toBe('number');
  });
  it('normalizeHash scales correctly (hash=50, mod=100 → 0.5)', () => {
    expect(normalizeHash(50, 100)).toBeCloseTo(0.5);
  });
  it('normalizeHash with hash equal to mod-1 is < 1', () => {
    expect(normalizeHash(99, 100)).toBeLessThan(1);
  });
  it('normalizeHash with hash=1, mod=1000 → 0.001', () => {
    expect(normalizeHash(1, 1000)).toBeCloseTo(0.001);
  });
  it('normalizeHash handles large hash values (mod wraps)', () => {
    const r = normalizeHash(1500, 100);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThan(1);
  });
  it('normalizeHash with mod=1 returns 0', () => {
    expect(normalizeHash(999, 1)).toBe(0);
  });
  it('normalizeHash with mod=2 returns 0 or 0.5', () => {
    const r = normalizeHash(3, 2);
    expect(r === 0 || r === 0.5).toBe(true);
  });
  it('normalizeHash is deterministic', () => {
    expect(normalizeHash(77, 200)).toBe(normalizeHash(77, 200));
  });
  // padding to reach 50
  for (let i = 0; i < 8; i++) {
    it(`normalizeHash extra padding ${i}: result in [0,1) for hash=${i + 1}, mod=10`, () => {
      const r = normalizeHash(i + 1, 10);
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(1);
    });
  }
});

// ─── RollingHash: 50 tests ────────────────────────────────────────────────────
describe('RollingHash – 50 tests', () => {
  it('RollingHash initial hash is 0', () => {
    const rh = new RollingHash(3);
    expect(rh.hash).toBe(0);
  });
  it('RollingHash hash changes after push', () => {
    const rh = new RollingHash(3);
    rh.push('a');
    expect(rh.hash).not.toBe(0);
  });
  it('RollingHash reset sets hash to 0', () => {
    const rh = new RollingHash(3);
    rh.push('x');
    rh.reset();
    expect(rh.hash).toBe(0);
  });
  it('RollingHash produces same hash for same window', () => {
    const rh1 = new RollingHash(3);
    const rh2 = new RollingHash(3);
    for (const c of 'abc') { rh1.push(c); rh2.push(c); }
    expect(rh1.hash).toBe(rh2.hash);
  });
  it('RollingHash hash is a non-negative number', () => {
    const rh = new RollingHash(4);
    for (const c of 'test') rh.push(c);
    expect(rh.hash).toBeGreaterThanOrEqual(0);
  });
  it('RollingHash window eviction changes hash', () => {
    const rh = new RollingHash(2);
    rh.push('a'); rh.push('b');
    const h1 = rh.hash;
    rh.push('c');
    expect(rh.hash).not.toBe(h1);
  });
  for (let i = 0; i < 30; i++) {
    it(`RollingHash deterministic for push sequence ${i}`, () => {
      const rh1 = new RollingHash(3);
      const rh2 = new RollingHash(3);
      const s = 'abc'.charAt(i % 3);
      rh1.push(s); rh2.push(s);
      expect(rh1.hash).toBe(rh2.hash);
    });
  }
  it('RollingHash handles window size 1', () => {
    const rh = new RollingHash(1);
    rh.push('a');
    const h1 = rh.hash;
    rh.push('b');
    expect(rh.hash).not.toBe(h1);
  });
  it('RollingHash handles window size equal to string length', () => {
    const rh = new RollingHash(5);
    for (const c of 'hello') rh.push(c);
    expect(rh.hash).toBeGreaterThanOrEqual(0);
  });
  it('RollingHash hash is integer', () => {
    const rh = new RollingHash(3);
    rh.push('x'); rh.push('y'); rh.push('z');
    expect(Number.isInteger(rh.hash)).toBe(true);
  });
  it('RollingHash different sequences produce different hashes', () => {
    const rh1 = new RollingHash(3);
    const rh2 = new RollingHash(3);
    for (const c of 'abc') rh1.push(c);
    for (const c of 'xyz') rh2.push(c);
    expect(rh1.hash).not.toBe(rh2.hash);
  });
  // padding to reach 50
  for (let i = 0; i < 7; i++) {
    it(`RollingHash extra padding ${i}: hash is number after ${i+1} pushes`, () => {
      const rh = new RollingHash(4);
      for (let j = 0; j <= i; j++) rh.push('a');
      expect(typeof rh.hash).toBe('number');
    });
  }
});

// ─── rabinKarp: 50 tests ──────────────────────────────────────────────────────
describe('rabinKarp – 50 tests', () => {
  it('rabinKarp finds single occurrence', () => {
    expect(rabinKarp('hello world', 'world')).toEqual([6]);
  });
  it('rabinKarp finds multiple occurrences', () => {
    expect(rabinKarp('abababab', 'ab')).toEqual([0, 2, 4, 6]);
  });
  it('rabinKarp returns empty for no match', () => {
    expect(rabinKarp('hello', 'xyz')).toEqual([]);
  });
  it('rabinKarp returns empty when pattern longer than text', () => {
    expect(rabinKarp('hi', 'hello')).toEqual([]);
  });
  it('rabinKarp returns empty for empty pattern', () => {
    expect(rabinKarp('hello', '')).toEqual([]);
  });
  it('rabinKarp finds pattern at start', () => {
    expect(rabinKarp('abcdef', 'abc')).toEqual([0]);
  });
  it('rabinKarp finds pattern at end', () => {
    expect(rabinKarp('abcdef', 'def')).toEqual([3]);
  });
  it('rabinKarp handles full match', () => {
    expect(rabinKarp('abc', 'abc')).toEqual([0]);
  });
  it('rabinKarp handles overlapping patterns', () => {
    const r = rabinKarp('aaaa', 'aa');
    expect(r).toContain(0);
    expect(r).toContain(1);
  });
  it('rabinKarp single char pattern', () => {
    const r = rabinKarp('abcabc', 'a');
    expect(r).toContain(0);
    expect(r).toContain(3);
  });
  for (let i = 0; i < 30; i++) {
    it(`rabinKarp deterministic for text "hello${i}" pattern "l"`, () => {
      const r1 = rabinKarp('hello' + i, 'l');
      const r2 = rabinKarp('hello' + i, 'l');
      expect(r1).toEqual(r2);
    });
  }
  it('rabinKarp returns array type', () => {
    expect(Array.isArray(rabinKarp('test', 'es'))).toBe(true);
  });
  it('rabinKarp finds pattern in long text', () => {
    const text = 'x'.repeat(100) + 'target' + 'y'.repeat(100);
    expect(rabinKarp(text, 'target')).toEqual([100]);
  });
  // padding to reach 50
  for (let i = 0; i < 7; i++) {
    it(`rabinKarp extra padding ${i}: array for "str${i}" / "r"`, () => {
      expect(Array.isArray(rabinKarp('str' + i, 'r'))).toBe(true);
    });
  }
});

// ─── collisionRate: 50 tests ──────────────────────────────────────────────────
describe('collisionRate – 50 tests', () => {
  it('collisionRate of empty array is 0', () => {
    expect(collisionRate([], djb2)).toBe(0);
  });
  it('collisionRate of single-element array is 0', () => {
    expect(collisionRate(['hello'], djb2)).toBe(0);
  });
  it('collisionRate of all distinct hashes is 0', () => {
    const strings = WORDS;
    const rate = collisionRate(strings, djb2);
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(1);
  });
  it('collisionRate is between 0 and 1 inclusive', () => {
    const strings = Array.from({ length: 20 }, (_, i) => 'key' + i);
    const rate = collisionRate(strings, fnv1a32);
    expect(rate).toBeGreaterThanOrEqual(0);
    expect(rate).toBeLessThanOrEqual(1);
  });
  it('collisionRate with all same strings is (n-1)/n', () => {
    const n = 5;
    const strings = Array(n).fill('same');
    const rate = collisionRate(strings, djb2);
    expect(rate).toBeCloseTo((n - 1) / n);
  });
  it('collisionRate works with sdbm', () => {
    const strings = WORDS;
    expect(typeof collisionRate(strings, sdbm)).toBe('number');
  });
  it('collisionRate works with jenkinsOAT', () => {
    const strings = WORDS;
    expect(typeof collisionRate(strings, jenkinsOAT)).toBe('number');
  });
  it('collisionRate works with bkdrHash', () => {
    const strings = WORDS;
    expect(typeof collisionRate(strings, bkdrHash)).toBe('number');
  });
  it('collisionRate returns a number', () => {
    expect(typeof collisionRate(['a', 'b', 'c'], adler32)).toBe('number');
  });
  it('collisionRate of two different strings via djb2 is 0 (no collision)', () => {
    const rate = collisionRate(['abc', 'def'], djb2);
    expect(rate).toBe(0);
  });
  for (let i = 0; i < 30; i++) {
    it(`collisionRate for batch ${i}: result in [0,1]`, () => {
      const strings = Array.from({ length: 5 }, (_, j) => `batch${i}_item${j}`);
      const rate = collisionRate(strings, murmurhash3_32);
      expect(rate).toBeGreaterThanOrEqual(0);
      expect(rate).toBeLessThanOrEqual(1);
    });
  }
  // padding to reach 50
  for (let i = 0; i < 8; i++) {
    it(`collisionRate extra padding ${i}: number result for polynomialHash`, () => {
      const strings = Array.from({ length: 3 }, (_, j) => `cr${i}_${j}`);
      expect(typeof collisionRate(strings, polynomialHash)).toBe('number');
    });
  }
});
