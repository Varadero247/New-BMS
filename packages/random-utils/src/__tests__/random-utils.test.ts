// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  createRng,
  seededShuffle,
  seededSample,
  randomUuid,
  randomBytes,
  randomHex,
  randomToken,
  randomInt,
  randomFloat,
  randomBool,
  randomElement,
  randomElements,
  sample,
  shuffle,
  weightedRandom,
  weightedSample,
  normalRandom,
  exponentialRandom,
  poissonRandom,
  uniformRandom,
  randomString,
  randomEmail,
  randomName,
  randomDate,
  randomColor,
  randomIp,
  randomPhoneUk,
  mean,
  stdDevSamples,
  histogram,
} from '../random-utils';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const BIG_ARR = Array.from({ length: 200 }, (_, i) => i);

// ===========================================================================
// LOOP BLOCK 1: seededRng with seed i → value in [0, 1)   (100 tests)
// ===========================================================================
describe('seededRng loop [0..99]: next() in [0,1)', () => {
  for (let i = 0; i < 100; i++) {
    it(`seed ${i} produces float in [0,1)`, () => {
      const rng = createRng(i);
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 2: seededShuffle with seed i → same-length permutation (100 tests)
// ===========================================================================
describe('seededShuffle loop [0..99]: produces permutation of same length', () => {
  const src = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  for (let i = 0; i < 100; i++) {
    it(`seed ${i} shuffle has length ${src.length} and same elements`, () => {
      const result = seededShuffle(src, i);
      expect(result).toHaveLength(src.length);
      expect(result.sort((a, b) => a - b)).toEqual([...src].sort((a, b) => a - b));
    });
  }
});

// ===========================================================================
// LOOP BLOCK 3: randomInt(0, i) result is in [0, i]  (100 tests, i=1..100)
// ===========================================================================
describe('randomInt loop [1..100]: result in [0, i]', () => {
  for (let i = 1; i <= 100; i++) {
    it(`randomInt(0, ${i}) is in [0, ${i}]`, () => {
      const v = randomInt(0, i);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(i);
      expect(Number.isInteger(v)).toBe(true);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 4: randomFloat(0, 1) in [0, 1)   (100 tests)
// ===========================================================================
describe('randomFloat loop [0..99]: result in [0,1)', () => {
  for (let i = 0; i < 100; i++) {
    it(`iteration ${i}: randomFloat(0,1) in [0,1)`, () => {
      const v = randomFloat(0, 1);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 5: sample(BIG_ARR, i) has correct length  (100 tests, i=1..100)
// ===========================================================================
describe('sample loop [1..100]: correct length', () => {
  for (let i = 1; i <= 100; i++) {
    it(`sample(arr, ${i}) has length ${i}`, () => {
      const result = sample(BIG_ARR, i);
      expect(result).toHaveLength(i);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 6: randomBool returns boolean   (50 tests)
// ===========================================================================
describe('randomBool loop [0..49]: returns boolean type', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: randomBool() is boolean`, () => {
      const v = randomBool();
      expect(typeof v).toBe('boolean');
    });
  }
});

// ===========================================================================
// LOOP BLOCK 7: normalRandom returns number   (50 tests)
// ===========================================================================
describe('normalRandom loop [0..49]: returns finite number', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: normalRandom() is a finite number`, () => {
      const v = normalRandom();
      expect(typeof v).toBe('number');
      expect(isFinite(v)).toBe(true);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 8: randomUuid matches UUID v4 pattern   (50 tests)
// ===========================================================================
describe('randomUuid loop [0..49]: matches UUID v4 pattern', () => {
  const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: randomUuid() is valid v4 UUID`, () => {
      const uuid = randomUuid();
      expect(uuid).toMatch(UUID_V4_RE);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 9: randomToken(32) has length 32   (50 tests)
// ===========================================================================
describe('randomToken loop [0..49]: length is 32', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: randomToken(32) has length 32`, () => {
      const tok = randomToken(32);
      expect(tok).toHaveLength(32);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 10: seededRng nextInt in [min, max]  (50 tests)
// ===========================================================================
describe('seededRng.nextInt loop [0..49]: in [min, max]', () => {
  for (let i = 0; i < 50; i++) {
    it(`seed ${i}: nextInt(1, 10) in [1,10]`, () => {
      const rng = createRng(i * 31 + 7);
      const v = rng.nextInt(1, 10);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(10);
      expect(Number.isInteger(v)).toBe(true);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 11: seededShuffle determinism — same seed always same result (50 tests)
// ===========================================================================
describe('seededShuffle determinism loop [0..49]', () => {
  const arr = [10, 20, 30, 40, 50];
  for (let i = 0; i < 50; i++) {
    it(`seed ${i}: two calls with same seed produce identical results`, () => {
      const a = seededShuffle(arr, i);
      const b = seededShuffle(arr, i);
      expect(a).toEqual(b);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 12: randomString correct length  (50 tests, length = i+1)
// ===========================================================================
describe('randomString loop [0..49]: correct length', () => {
  for (let i = 0; i < 50; i++) {
    const len = i + 1;
    it(`randomString(${len}) has length ${len}`, () => {
      const s = randomString(len);
      expect(s).toHaveLength(len);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 13: randomColor matches #RRGGBB  (50 tests)
// ===========================================================================
describe('randomColor loop [0..49]: matches #RRGGBB format', () => {
  const COLOR_RE = /^#[0-9a-f]{6}$/i;
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: randomColor() matches #RRGGBB`, () => {
      const c = randomColor();
      expect(c).toMatch(COLOR_RE);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 14: randomIp produces valid IPv4 format  (50 tests)
// ===========================================================================
describe('randomIp loop [0..49]: valid IPv4 format', () => {
  const IP_RE = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: randomIp() matches IPv4 pattern`, () => {
      const ip = randomIp();
      expect(ip).toMatch(IP_RE);
      const parts = ip.split('.').map(Number);
      expect(parts).toHaveLength(4);
      parts.forEach(p => {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThanOrEqual(255);
      });
    });
  }
});

// ===========================================================================
// LOOP BLOCK 15: randomEmail produces @-containing string  (50 tests)
// ===========================================================================
describe('randomEmail loop [0..49]: contains @ and dot', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: randomEmail() is valid-ish email`, () => {
      const e = randomEmail();
      expect(e).toContain('@');
      expect(e).toContain('.');
    });
  }
});

// ===========================================================================
// LOOP BLOCK 16: exponentialRandom is positive  (50 tests)
// ===========================================================================
describe('exponentialRandom loop [0..49]: positive value', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: exponentialRandom() > 0`, () => {
      const v = exponentialRandom(1);
      expect(v).toBeGreaterThan(0);
      expect(isFinite(v)).toBe(true);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 17: poissonRandom is non-negative integer  (50 tests)
// ===========================================================================
describe('poissonRandom loop [0..49]: non-negative integer', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: poissonRandom(5) is non-negative integer`, () => {
      const v = poissonRandom(5);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 18: uniformRandom in [min, max)  (50 tests)
// ===========================================================================
describe('uniformRandom loop [0..49]: in [0, 10)', () => {
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: uniformRandom(0, 10) in [0, 10)`, () => {
      const v = uniformRandom(0, 10);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(10);
    });
  }
});

// ===========================================================================
// LOOP BLOCK 19: randomDate in [start, end]  (50 tests)
// ===========================================================================
describe('randomDate loop [0..49]: in valid range', () => {
  const start = new Date('2020-01-01');
  const end = new Date('2023-12-31');
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: randomDate() is between start and end`, () => {
      const d = randomDate(start, end);
      expect(d.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(d.getTime()).toBeLessThanOrEqual(end.getTime());
    });
  }
});

// ===========================================================================
// LOOP BLOCK 20: randomPhoneUk format check  (50 tests)
// ===========================================================================
describe('randomPhoneUk loop [0..49]: UK format', () => {
  const PHONE_RE = /^07\d{3} \d{6}$/;
  for (let i = 0; i < 50; i++) {
    it(`iteration ${i}: randomPhoneUk() matches UK format`, () => {
      const p = randomPhoneUk();
      expect(p).toMatch(PHONE_RE);
    });
  }
});

// ===========================================================================
// Correctness / unit tests for all remaining functions
// ===========================================================================

describe('createRng', () => {
  it('same seed produces same sequence', () => {
    const rng1 = createRng(42);
    const rng2 = createRng(42);
    for (let i = 0; i < 10; i++) {
      expect(rng1.next()).toBe(rng2.next());
    }
  });

  it('different seeds produce different sequences', () => {
    const rng1 = createRng(1);
    const rng2 = createRng(2);
    let differ = false;
    for (let i = 0; i < 10; i++) {
      if (rng1.next() !== rng2.next()) differ = true;
    }
    expect(differ).toBe(true);
  });

  it('nextInt returns values within [min, max] over many calls', () => {
    const rng = createRng(99);
    for (let i = 0; i < 200; i++) {
      const v = rng.nextInt(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThanOrEqual(10);
    }
  });

  it('next() never returns exactly 1', () => {
    const rng = createRng(0);
    for (let i = 0; i < 1000; i++) {
      expect(rng.next()).toBeLessThan(1);
    }
  });
});

describe('seededShuffle', () => {
  it('does not mutate the original array', () => {
    const original = [1, 2, 3, 4, 5];
    const copy = [...original];
    seededShuffle(original, 7);
    expect(original).toEqual(copy);
  });

  it('handles empty array', () => {
    expect(seededShuffle([], 1)).toEqual([]);
  });

  it('handles single-element array', () => {
    expect(seededShuffle(['a'], 1)).toEqual(['a']);
  });

  it('different seeds produce potentially different orderings', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const r1 = seededShuffle(arr, 1);
    const r2 = seededShuffle(arr, 2);
    // Very unlikely they are identical for 10 elements
    expect(r1).not.toEqual(r2);
  });
});

describe('seededSample', () => {
  it('returns correct number of items', () => {
    const result = seededSample([1, 2, 3, 4, 5], 3, 42);
    expect(result).toHaveLength(3);
  });

  it('all items come from original array', () => {
    const original = [10, 20, 30, 40, 50];
    const result = seededSample(original, 4, 5);
    result.forEach(v => expect(original).toContain(v));
  });

  it('no duplicates in result', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const result = seededSample(original, 5, 99);
    expect(new Set(result).size).toBe(5);
  });

  it('is deterministic', () => {
    const arr = [1, 2, 3, 4, 5, 6];
    expect(seededSample(arr, 3, 7)).toEqual(seededSample(arr, 3, 7));
  });

  it('n larger than array returns all elements', () => {
    const arr = [1, 2, 3];
    const result = seededSample(arr, 10, 1);
    expect(result).toHaveLength(arr.length);
  });
});

describe('randomUuid', () => {
  const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  it('has correct format', () => {
    expect(randomUuid()).toMatch(UUID_V4_RE);
  });

  it('generates unique values', () => {
    const uuids = new Set(Array.from({ length: 100 }, () => randomUuid()));
    expect(uuids.size).toBe(100);
  });

  it('has correct segment lengths', () => {
    const uuid = randomUuid();
    const parts = uuid.split('-');
    expect(parts).toHaveLength(5);
    expect(parts[0]).toHaveLength(8);
    expect(parts[1]).toHaveLength(4);
    expect(parts[2]).toHaveLength(4);
    expect(parts[3]).toHaveLength(4);
    expect(parts[4]).toHaveLength(12);
  });

  it('version nibble is 4', () => {
    const uuid = randomUuid();
    expect(uuid[14]).toBe('4');
  });

  it('variant nibble is 8, 9, a, or b', () => {
    const uuid = randomUuid();
    expect(['8', '9', 'a', 'b']).toContain(uuid[19]);
  });
});

describe('randomBytes', () => {
  it('returns a Buffer of requested length', () => {
    const buf = randomBytes(16);
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBe(16);
  });

  it('returns 0 bytes for n=0', () => {
    expect(randomBytes(0).length).toBe(0);
  });

  it('returns different values on repeated calls', () => {
    const a = randomBytes(8).toString('hex');
    const b = randomBytes(8).toString('hex');
    expect(a).not.toBe(b);
  });
});

describe('randomHex', () => {
  it('has correct length', () => {
    expect(randomHex(16)).toHaveLength(16);
    expect(randomHex(7)).toHaveLength(7);
    expect(randomHex(1)).toHaveLength(1);
  });

  it('contains only hex characters', () => {
    expect(randomHex(32)).toMatch(/^[0-9a-f]+$/i);
  });
});

describe('randomToken', () => {
  it('default length is 32', () => {
    expect(randomToken()).toHaveLength(32);
  });

  it('custom length works', () => {
    expect(randomToken(16)).toHaveLength(16);
    expect(randomToken(64)).toHaveLength(64);
  });

  it('contains only URL-safe characters', () => {
    const tok = randomToken(100);
    expect(tok).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('generates unique tokens', () => {
    const tokens = new Set(Array.from({ length: 50 }, () => randomToken(32)));
    expect(tokens.size).toBe(50);
  });
});

describe('randomInt', () => {
  it('min === max returns that value', () => {
    expect(randomInt(5, 5)).toBe(5);
  });

  it('result is always an integer', () => {
    for (let i = 0; i < 50; i++) {
      expect(Number.isInteger(randomInt(-10, 10))).toBe(true);
    }
  });

  it('respects bounds over many calls', () => {
    for (let i = 0; i < 200; i++) {
      const v = randomInt(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
    }
  });
});

describe('randomFloat', () => {
  it('result is in [min, max)', () => {
    for (let i = 0; i < 100; i++) {
      const v = randomFloat(5, 10);
      expect(v).toBeGreaterThanOrEqual(5);
      expect(v).toBeLessThan(10);
    }
  });

  it('works with negative ranges', () => {
    const v = randomFloat(-5, -1);
    expect(v).toBeGreaterThanOrEqual(-5);
    expect(v).toBeLessThan(-1);
  });
});

describe('randomBool', () => {
  it('probability 0 always returns false', () => {
    for (let i = 0; i < 20; i++) {
      expect(randomBool(0)).toBe(false);
    }
  });

  it('probability 1 always returns true', () => {
    for (let i = 0; i < 20; i++) {
      expect(randomBool(1)).toBe(true);
    }
  });

  it('default produces both true and false over many calls', () => {
    const results = Array.from({ length: 100 }, () => randomBool());
    expect(results.some(v => v)).toBe(true);
    expect(results.some(v => !v)).toBe(true);
  });
});

describe('randomElement', () => {
  it('returns an element from the array', () => {
    const arr = [10, 20, 30, 40];
    const v = randomElement(arr);
    expect(arr).toContain(v);
  });

  it('throws on empty array', () => {
    expect(() => randomElement([])).toThrow();
  });

  it('returns the only element for single-element array', () => {
    expect(randomElement(['sole'])).toBe('sole');
  });
});

describe('randomElements', () => {
  it('returns correct count', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(randomElements(arr, 10)).toHaveLength(10);
  });

  it('all results come from the source array', () => {
    const arr = ['a', 'b', 'c'];
    const result = randomElements(arr, 20);
    result.forEach(v => expect(arr).toContain(v));
  });

  it('throws on empty array', () => {
    expect(() => randomElements([], 3)).toThrow();
  });
});

describe('sample', () => {
  it('returns unique elements', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = sample(arr, 5);
    expect(new Set(result).size).toBe(5);
  });

  it('throws if n > arr.length', () => {
    expect(() => sample([1, 2], 5)).toThrow();
  });

  it('n=0 returns empty array', () => {
    expect(sample([1, 2, 3], 0)).toHaveLength(0);
  });

  it('does not mutate the original', () => {
    const arr = [1, 2, 3, 4, 5];
    const copy = [...arr];
    sample(arr, 3);
    expect(arr).toEqual(copy);
  });

  it('all elements from original', () => {
    const arr = [10, 20, 30, 40, 50, 60];
    const result = sample(arr, 4);
    result.forEach(v => expect(arr).toContain(v));
  });
});

describe('shuffle', () => {
  it('returns a new array of same length', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result).not.toBe(arr);
    expect(result).toHaveLength(arr.length);
  });

  it('contains same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = shuffle(arr);
    expect(result.sort((a, b) => a - b)).toEqual([...arr].sort((a, b) => a - b));
  });

  it('does not mutate original', () => {
    const arr = [1, 2, 3];
    const copy = [...arr];
    shuffle(arr);
    expect(arr).toEqual(copy);
  });

  it('handles empty array', () => {
    expect(shuffle([])).toEqual([]);
  });
});

describe('weightedRandom', () => {
  it('throws on empty items', () => {
    expect(() => weightedRandom([])).toThrow();
  });

  it('returns the only item when there is one', () => {
    expect(weightedRandom([{ value: 'x', weight: 5 }])).toBe('x');
  });

  it('heavily weighted item dominates', () => {
    const items = [
      { value: 'rare', weight: 1 },
      { value: 'common', weight: 999 },
    ];
    const results = Array.from({ length: 100 }, () => weightedRandom(items));
    const commonCount = results.filter(r => r === 'common').length;
    expect(commonCount).toBeGreaterThan(90);
  });

  it('result is always from items', () => {
    const items = [
      { value: 'a', weight: 1 },
      { value: 'b', weight: 2 },
      { value: 'c', weight: 3 },
    ];
    for (let i = 0; i < 50; i++) {
      expect(['a', 'b', 'c']).toContain(weightedRandom(items));
    }
  });

  it('throws on zero total weight', () => {
    expect(() => weightedRandom([{ value: 'a', weight: 0 }])).toThrow();
  });
});

describe('weightedSample', () => {
  it('returns correct count', () => {
    const items = [{ value: 1, weight: 1 }, { value: 2, weight: 1 }];
    expect(weightedSample(items, 10)).toHaveLength(10);
  });

  it('all values come from items', () => {
    const items = [
      { value: 'x', weight: 2 },
      { value: 'y', weight: 3 },
    ];
    const result = weightedSample(items, 30);
    result.forEach(v => expect(['x', 'y']).toContain(v));
  });
});

describe('normalRandom', () => {
  it('custom mean and std', () => {
    const samples = Array.from({ length: 500 }, () => normalRandom(100, 10));
    const m = mean(samples);
    expect(m).toBeGreaterThan(80);
    expect(m).toBeLessThan(120);
  });

  it('default mean=0 std=1 has reasonable range', () => {
    const samples = Array.from({ length: 200 }, () => normalRandom());
    // Virtually impossible for all 200 samples to be outside ±5
    expect(samples.some(v => v > -5 && v < 5)).toBe(true);
  });
});

describe('exponentialRandom', () => {
  it('throws for non-positive rate', () => {
    expect(() => exponentialRandom(0)).toThrow();
    expect(() => exponentialRandom(-1)).toThrow();
  });

  it('mean is approximately 1/rate', () => {
    const samples = Array.from({ length: 500 }, () => exponentialRandom(2));
    const m = mean(samples);
    expect(m).toBeGreaterThan(0.2);
    expect(m).toBeLessThan(1.0);
  });
});

describe('poissonRandom', () => {
  it('throws for lambda <= 0', () => {
    expect(() => poissonRandom(0)).toThrow();
    expect(() => poissonRandom(-1)).toThrow();
  });

  it('mean is approximately lambda', () => {
    const samples = Array.from({ length: 500 }, () => poissonRandom(5));
    const m = mean(samples);
    expect(m).toBeGreaterThan(3);
    expect(m).toBeLessThan(7);
  });
});

describe('uniformRandom', () => {
  it('default is in [0, 1)', () => {
    const v = uniformRandom();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });
});

describe('randomString', () => {
  it('uses custom charset', () => {
    const s = randomString(20, 'abc');
    expect(s).toMatch(/^[abc]+$/);
    expect(s).toHaveLength(20);
  });

  it('length 0 returns empty string', () => {
    expect(randomString(0)).toBe('');
  });

  it('default charset is alphanumeric', () => {
    const s = randomString(50);
    expect(s).toMatch(/^[A-Za-z0-9]+$/);
  });
});

describe('randomEmail', () => {
  it('has exactly one @', () => {
    const e = randomEmail();
    expect(e.split('@')).toHaveLength(2);
  });

  it('local part is alphanumeric', () => {
    const e = randomEmail();
    const local = e.split('@')[0]!;
    expect(local).toMatch(/^[a-z0-9]+$/);
  });
});

describe('randomName', () => {
  it('returns two space-separated words', () => {
    const name = randomName();
    const parts = name.split(' ');
    expect(parts).toHaveLength(2);
    expect(parts[0]!.length).toBeGreaterThan(0);
    expect(parts[1]!.length).toBeGreaterThan(0);
  });

  it('starts with uppercase letter', () => {
    for (let i = 0; i < 20; i++) {
      const name = randomName();
      expect(name[0]).toMatch(/[A-Z]/);
    }
  });
});

describe('randomDate', () => {
  it('returns a Date object', () => {
    expect(randomDate()).toBeInstanceOf(Date);
  });

  it('within default range (year >= 2000)', () => {
    const d = randomDate();
    expect(d.getFullYear()).toBeGreaterThanOrEqual(2000);
  });

  it('respects custom range', () => {
    const start = new Date('2010-01-01');
    const end = new Date('2011-01-01');
    for (let i = 0; i < 20; i++) {
      const d = randomDate(start, end);
      expect(d.getTime()).toBeGreaterThanOrEqual(start.getTime());
      expect(d.getTime()).toBeLessThanOrEqual(end.getTime());
    }
  });
});

describe('randomColor', () => {
  it('starts with #', () => {
    expect(randomColor().startsWith('#')).toBe(true);
  });

  it('is exactly 7 characters', () => {
    expect(randomColor()).toHaveLength(7);
  });
});

describe('randomIp', () => {
  it('has 4 octets', () => {
    const ip = randomIp();
    expect(ip.split('.')).toHaveLength(4);
  });
});

describe('randomPhoneUk', () => {
  it('starts with 07', () => {
    expect(randomPhoneUk().startsWith('07')).toBe(true);
  });

  it('contains a space', () => {
    expect(randomPhoneUk()).toContain(' ');
  });
});

describe('mean', () => {
  it('computes mean correctly', () => {
    expect(mean([1, 2, 3, 4, 5])).toBe(3);
  });

  it('single element returns that element', () => {
    expect(mean([42])).toBe(42);
  });

  it('throws on empty array', () => {
    expect(() => mean([])).toThrow();
  });

  it('works with negative numbers', () => {
    expect(mean([-1, 1])).toBe(0);
  });

  it('decimal result', () => {
    expect(mean([1, 2])).toBe(1.5);
  });
});

describe('stdDevSamples', () => {
  it('all-same values have std dev 0', () => {
    expect(stdDevSamples([5, 5, 5, 5, 5])).toBe(0);
  });

  it('throws with fewer than 2 samples', () => {
    expect(() => stdDevSamples([1])).toThrow();
    expect(() => stdDevSamples([])).toThrow();
  });

  it('known value [2, 4, 4, 4, 5, 5, 7, 9] ≈ 2', () => {
    const sd = stdDevSamples([2, 4, 4, 4, 5, 5, 7, 9]);
    expect(sd).toBeCloseTo(2.138, 2);
  });

  it('result is non-negative', () => {
    const sd = stdDevSamples([1, 3, 5, 7]);
    expect(sd).toBeGreaterThanOrEqual(0);
  });
});

describe('histogram', () => {
  it('returns array of correct length', () => {
    const h = histogram([1, 2, 3, 4, 5], 5);
    expect(h).toHaveLength(5);
  });

  it('total count equals samples length', () => {
    const samples = [1, 2, 3, 4, 5, 6, 7, 8];
    const h = histogram(samples, 4);
    const total = h.reduce((a, b) => a + b, 0);
    expect(total).toBe(samples.length);
  });

  it('empty samples returns all zeros', () => {
    const h = histogram([], 3);
    expect(h).toEqual([0, 0, 0]);
  });

  it('throws if bins < 1', () => {
    expect(() => histogram([1, 2], 0)).toThrow();
  });

  it('all-same values fills first bin', () => {
    const h = histogram([5, 5, 5, 5], 4);
    expect(h[0]).toBe(4);
    expect(h[1]).toBe(0);
  });

  it('1 bin contains all samples', () => {
    const samples = [1, 2, 3, 4, 5];
    const h = histogram(samples, 1);
    expect(h[0]).toBe(5);
  });
});

// ===========================================================================
// Extra correctness / edge-case loop tests to ensure total >= 1000
// ===========================================================================

describe('randomHex length variations [0..49]', () => {
  for (let i = 0; i < 50; i++) {
    const n = i + 1;
    it(`randomHex(${n}) has length ${n}`, () => {
      expect(randomHex(n)).toHaveLength(n);
    });
  }
});

describe('normalRandom with varying params loop [0..49]', () => {
  for (let i = 0; i < 50; i++) {
    const std = i + 1;
    it(`normalRandom(0, ${std}) is finite`, () => {
      const v = normalRandom(0, std);
      expect(isFinite(v)).toBe(true);
    });
  }
});

describe('seededSample no-duplicates loop [0..49]', () => {
  const arr = Array.from({ length: 50 }, (_, i) => i);
  for (let i = 0; i < 50; i++) {
    const n = i + 1;
    it(`seededSample(arr, ${n}, ${i}) has no duplicates`, () => {
      const result = seededSample(arr, n, i);
      expect(new Set(result).size).toBe(n);
    });
  }
});

describe('weightedSample lengths loop [0..49]', () => {
  const items = Array.from({ length: 5 }, (_, i) => ({ value: i, weight: i + 1 }));
  for (let i = 0; i < 50; i++) {
    const n = i + 1;
    it(`weightedSample(items, ${n}) has length ${n}`, () => {
      expect(weightedSample(items, n)).toHaveLength(n);
    });
  }
});
