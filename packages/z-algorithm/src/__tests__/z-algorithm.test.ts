// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import {
  buildZArray,
  buildZArrayInt,
  zSearch,
  countOccurrences,
  contains,
  longestPrefixSuffix,
  hasPeriod,
  minPeriod,
  allPeriods,
  zToKMPFailure,
  countDistinctSubstrings,
  isRotation,
  findPrefixMatches,
  smallestRotation,
  findAnagrams,
} from '../z-algorithm';

// ---------------------------------------------------------------------------
// buildZArray — length === n (200 tests, n=1..200)
// ---------------------------------------------------------------------------
describe('buildZArray length equals string length', () => {
  for (let n = 1; n <= 200; n++) {
    it(`length ${n}: all-'a' string has z.length === ${n}`, () => {
      const s = 'a'.repeat(n);
      expect(buildZArray(s).length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// buildZArray z[0] === n convention (200 tests, n=1..200)
// ---------------------------------------------------------------------------
describe('buildZArray z[0] === n convention', () => {
  for (let n = 1; n <= 200; n++) {
    it(`n=${n}: z[0] === ${n} for mixed string`, () => {
      // Use a varied string to avoid trivial all-same case
      const chars = 'abcdefghij';
      const s = Array.from({ length: n }, (_, i) => chars[i % chars.length]).join('');
      const z = buildZArray(s);
      expect(z[0]).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// buildZArray empty string
// ---------------------------------------------------------------------------
describe('buildZArray edge cases', () => {
  it('empty string returns []', () => {
    expect(buildZArray('')).toEqual([]);
  });

  it('single char: z = [1]', () => {
    expect(buildZArray('a')).toEqual([1]);
  });

  it('two same chars: z = [2,1]', () => {
    expect(buildZArray('aa')).toEqual([2, 1]);
  });

  it('two different chars: z = [2,0]', () => {
    expect(buildZArray('ab')).toEqual([2, 0]);
  });

  it('"aaa": z = [3,2,1]', () => {
    expect(buildZArray('aaa')).toEqual([3, 2, 1]);
  });

  it('"aab": z[1]=1, z[2]=0', () => {
    const z = buildZArray('aab');
    expect(z[1]).toBe(1);
    expect(z[2]).toBe(0);
  });

  it('"abab": z[0]=4, z[2]=2', () => {
    const z = buildZArray('abab');
    expect(z[0]).toBe(4);
    expect(z[2]).toBe(2);
  });

  it('"abcabc": z[3]=3', () => {
    const z = buildZArray('abcabc');
    expect(z[3]).toBe(3);
  });

  it('"abacaba": z[4]=3', () => {
    const z = buildZArray('abacaba');
    expect(z[4]).toBe(3);
  });

  it('all same chars length 10: z[i]=10-i', () => {
    const z = buildZArray('aaaaaaaaaa');
    for (let i = 0; i < 10; i++) {
      expect(z[i]).toBe(10 - i);
    }
  });
});

// ---------------------------------------------------------------------------
// buildZArray — z[i] never exceeds n-i (100 tests)
// ---------------------------------------------------------------------------
describe('buildZArray z[i] <= n-i for all i', () => {
  const strings = [
    'abcdef', 'aaaaaa', 'ababab', 'abcabc', 'xyzxyz',
    'abacaba', 'banana', 'mississippi', 'abababab', 'hello',
  ];
  for (let t = 0; t < strings.length; t++) {
    const s = strings[t];
    for (let i = 0; i < s.length && i < 10; i++) {
      it(`"${s}" z[${i}] <= ${s.length - i}`, () => {
        const z = buildZArray(s);
        expect(z[i]).toBeLessThanOrEqual(s.length - i);
        expect(z[i]).toBeGreaterThanOrEqual(0);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// zSearch exact match (100 tests, i=1..100)
// ---------------------------------------------------------------------------
describe('zSearch: single-char pattern in all-a string of length 100', () => {
  for (let i = 1; i <= 100; i++) {
    it(`pattern length ${i} of 'a' in 'a'.repeat(100): first occurrence is 0`, () => {
      const text = 'a'.repeat(100);
      const pattern = 'a'.repeat(i);
      const results = zSearch(text, pattern);
      // All occurrences: positions 0..(100-i)
      expect(results.length).toBe(100 - i + 1);
      expect(results[0]).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// zSearch no match (100 tests)
// ---------------------------------------------------------------------------
describe('zSearch no match cases', () => {
  for (let i = 1; i <= 100; i++) {
    it(`no-match test ${i}: pattern not in text`, () => {
      const text = 'a'.repeat(i);
      const pattern = 'b' + 'a'.repeat(i - 1);
      const results = zSearch(text, pattern);
      expect(results).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// zSearch pattern longer than text (50 tests)
// ---------------------------------------------------------------------------
describe('zSearch pattern longer than text', () => {
  for (let i = 1; i <= 50; i++) {
    it(`pattern length ${i + 10} in text length ${i}`, () => {
      const text = 'a'.repeat(i);
      const pattern = 'a'.repeat(i + 10);
      expect(zSearch(text, pattern)).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// zSearch empty pattern (50 tests)
// ---------------------------------------------------------------------------
describe('zSearch empty pattern returns all positions', () => {
  for (let n = 0; n <= 49; n++) {
    it(`empty pattern in text of length ${n} returns ${n + 1} positions`, () => {
      const text = 'a'.repeat(n);
      const result = zSearch(text, '');
      expect(result.length).toBe(n + 1);
      for (let i = 0; i <= n; i++) {
        expect(result[i]).toBe(i);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// zSearch specific patterns (extra coverage)
// ---------------------------------------------------------------------------
describe('zSearch specific pattern searches', () => {
  it('find "abc" in "abcabc"', () => {
    expect(zSearch('abcabc', 'abc')).toEqual([0, 3]);
  });

  it('find "a" in "aaaa"', () => {
    expect(zSearch('aaaa', 'a')).toEqual([0, 1, 2, 3]);
  });

  it('find "aa" in "aaaa"', () => {
    expect(zSearch('aaaa', 'aa')).toEqual([0, 1, 2]);
  });

  it('find "xyz" in "abcxyzdef"', () => {
    expect(zSearch('abcxyzdef', 'xyz')).toEqual([3]);
  });

  it('find "x" not in "abcde"', () => {
    expect(zSearch('abcde', 'x')).toEqual([]);
  });

  it('pattern equals text', () => {
    expect(zSearch('hello', 'hello')).toEqual([0]);
  });

  it('overlapping matches "aa" in "aaaa"', () => {
    expect(zSearch('aaaa', 'aa')).toEqual([0, 1, 2]);
  });

  it('"banana": find "an"', () => {
    expect(zSearch('banana', 'an')).toEqual([1, 3]);
  });

  it('"mississippi": find "issi"', () => {
    expect(zSearch('mississippi', 'issi')).toEqual([1, 4]);
  });

  it('"abababab": find "abab"', () => {
    expect(zSearch('abababab', 'abab')).toEqual([0, 2, 4]);
  });
});

// ---------------------------------------------------------------------------
// countOccurrences (100 tests)
// ---------------------------------------------------------------------------
describe('countOccurrences basic (100 tests)', () => {
  // Test countOccurrences("a".repeat(k), "a") === k for k=1..100
  for (let k = 1; k <= 100; k++) {
    it(`countOccurrences('a'x${k}, 'a') === ${k}`, () => {
      expect(countOccurrences('a'.repeat(k), 'a')).toBe(k);
    });
  }
});

describe('countOccurrences extended', () => {
  it('countOccurrences("abc", "xyz") === 0', () => {
    expect(countOccurrences('abc', 'xyz')).toBe(0);
  });

  it('countOccurrences("abcabc", "abc") === 2', () => {
    expect(countOccurrences('abcabc', 'abc')).toBe(2);
  });

  it('countOccurrences("aaaa", "aa") === 3', () => {
    expect(countOccurrences('aaaa', 'aa')).toBe(3);
  });

  it('countOccurrences("", "a") === 0', () => {
    expect(countOccurrences('', 'a')).toBe(0);
  });

  it('countOccurrences("a", "") === 2', () => {
    expect(countOccurrences('a', '')).toBe(2);
  });

  it('countOccurrences("banana", "an") === 2', () => {
    expect(countOccurrences('banana', 'an')).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// contains — true cases (50 tests)
// ---------------------------------------------------------------------------
describe('contains true cases (50 tests)', () => {
  const words = [
    'abcde', 'hello', 'world', 'foo', 'bar', 'baz', 'qux', 'quux', 'corge', 'grault',
    'garply', 'waldo', 'fred', 'plugh', 'xyzzy', 'thud', 'alpha', 'beta', 'gamma', 'delta',
    'epsilon', 'zeta', 'eta', 'theta', 'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi',
    'omicron', 'pi', 'rho', 'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
    'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  ];
  for (let i = 0; i < 50; i++) {
    const text = words[i] + 'xyz' + words[(i + 1) % 50];
    const pattern = words[i];
    it(`contains "${pattern}" in composed text (test ${i + 1})`, () => {
      expect(contains(text, pattern)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// contains — false cases (50 tests)
// ---------------------------------------------------------------------------
describe('contains false cases (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`contains false test ${i}: 'a'x${i} does not contain 'b'`, () => {
      expect(contains('a'.repeat(i), 'b')).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// contains extra cases
// ---------------------------------------------------------------------------
describe('contains extra edge cases', () => {
  it('empty pattern returns true', () => {
    expect(contains('abc', '')).toBe(true);
  });

  it('empty text and empty pattern returns true', () => {
    expect(contains('', '')).toBe(true);
  });

  it('empty text and non-empty pattern returns false', () => {
    expect(contains('', 'a')).toBe(false);
  });

  it('pattern equals text returns true', () => {
    expect(contains('hello', 'hello')).toBe(true);
  });

  it('pattern longer than text returns false', () => {
    expect(contains('hi', 'hello')).toBe(false);
  });

  it('"abcde" contains "cd"', () => {
    expect(contains('abcde', 'cd')).toBe(true);
  });

  it('"abcde" does not contain "xyz"', () => {
    expect(contains('abcde', 'xyz')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// longestPrefixSuffix (100 tests)
// ---------------------------------------------------------------------------
describe('longestPrefixSuffix: "ab".repeat(k) has lps >= 2 for k>=2 (50 tests)', () => {
  for (let k = 2; k <= 51; k++) {
    it(`longestPrefixSuffix("ab".repeat(${k})) >= 2`, () => {
      const s = 'ab'.repeat(k);
      expect(longestPrefixSuffix(s)).toBeGreaterThanOrEqual(2);
    });
  }
});

describe('longestPrefixSuffix: single-char repetitions (50 tests)', () => {
  for (let k = 2; k <= 51; k++) {
    it(`longestPrefixSuffix('a'.repeat(${k})) === ${k - 1}`, () => {
      expect(longestPrefixSuffix('a'.repeat(k))).toBe(k - 1);
    });
  }
});

describe('longestPrefixSuffix specific values', () => {
  it('"abab" === 2', () => {
    expect(longestPrefixSuffix('abab')).toBe(2);
  });

  it('"abcabc" === 3', () => {
    expect(longestPrefixSuffix('abcabc')).toBe(3);
  });

  it('"abacaba" === 3', () => {
    expect(longestPrefixSuffix('abacaba')).toBe(3);
  });

  it('"abcde" === 0', () => {
    expect(longestPrefixSuffix('abcde')).toBe(0);
  });

  it('"a" === 0', () => {
    expect(longestPrefixSuffix('a')).toBe(0);
  });

  it('"" === 0', () => {
    expect(longestPrefixSuffix('')).toBe(0);
  });

  it('"abcdabc" === 3', () => {
    expect(longestPrefixSuffix('abcdabc')).toBe(3);
  });

  it('"aabaa" === 2', () => {
    expect(longestPrefixSuffix('aabaa')).toBe(2);
  });

  it('"aabaab" === 3', () => {
    expect(longestPrefixSuffix('aabaab')).toBe(3);
  });

  it('"abababab" === 6', () => {
    expect(longestPrefixSuffix('abababab')).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// hasPeriod (100 tests)
// ---------------------------------------------------------------------------
describe('hasPeriod true cases: "a".repeat(n) has period 1 (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`hasPeriod('a'x${n}, 1) === true`, () => {
      expect(hasPeriod('a'.repeat(n), 1)).toBe(true);
    });
  }
});

describe('hasPeriod true cases: "ab".repeat(n) has period 2 (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`hasPeriod("ab".repeat(${n}), 2) === true`, () => {
      expect(hasPeriod('ab'.repeat(n), 2)).toBe(true);
    });
  }
});

describe('hasPeriod false cases', () => {
  it('"abab" does NOT have period 3', () => {
    expect(hasPeriod('abab', 3)).toBe(false);
  });

  it('"abc" does NOT have period 2 (length not divisible)', () => {
    expect(hasPeriod('abc', 2)).toBe(false);
  });

  it('"abcd" does NOT have period 3 (length not divisible)', () => {
    expect(hasPeriod('abcd', 3)).toBe(false);
  });

  it('"abab" has period 2', () => {
    expect(hasPeriod('abab', 2)).toBe(true);
  });

  it('"abcabc" has period 3', () => {
    expect(hasPeriod('abcabc', 3)).toBe(true);
  });

  it('period 0 returns false', () => {
    expect(hasPeriod('abc', 0)).toBe(false);
  });

  it('period negative returns false', () => {
    expect(hasPeriod('abc', -1)).toBe(false);
  });

  it('period > length returns false', () => {
    expect(hasPeriod('abc', 5)).toBe(false);
  });

  it('"abcabd" does NOT have period 3', () => {
    expect(hasPeriod('abcabd', 3)).toBe(false);
  });

  it('every string has period equal to its length', () => {
    expect(hasPeriod('xyz', 3)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// minPeriod (100 tests)
// ---------------------------------------------------------------------------
describe('minPeriod: "a".repeat(n) has minPeriod 1 (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`minPeriod('a'x${n}) === 1`, () => {
      expect(minPeriod('a'.repeat(n))).toBe(1);
    });
  }
});

describe('minPeriod: "ab".repeat(n) has minPeriod 2 (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`minPeriod("ab".repeat(${n})) === 2`, () => {
      expect(minPeriod('ab'.repeat(n))).toBe(2);
    });
  }
});

describe('minPeriod specific values', () => {
  it('"aaaa" === 1', () => {
    expect(minPeriod('aaaa')).toBe(1);
  });

  it('"abab" === 2', () => {
    expect(minPeriod('abab')).toBe(2);
  });

  it('"abcabc" === 3', () => {
    expect(minPeriod('abcabc')).toBe(3);
  });

  it('"abcde" === 5', () => {
    expect(minPeriod('abcde')).toBe(5);
  });

  it('"abc" === 3', () => {
    expect(minPeriod('abc')).toBe(3);
  });

  it('"" === 0', () => {
    expect(minPeriod('')).toBe(0);
  });

  it('"a" === 1', () => {
    expect(minPeriod('a')).toBe(1);
  });

  it('"abcabcabc" === 3', () => {
    expect(minPeriod('abcabcabc')).toBe(3);
  });

  it('"xyzxyz" === 3', () => {
    expect(minPeriod('xyzxyz')).toBe(3);
  });

  it('"aababab" === 7 (no smaller period divides 7)', () => {
    // "aababab" length 7 — check if any period 1-6 (divisor of 7) works: only 1 and 7
    // period 1 requires all same chars — no. So minPeriod = 7
    expect(minPeriod('aababab')).toBe(7);
  });
});

// ---------------------------------------------------------------------------
// isRotation (100 tests)
// ---------------------------------------------------------------------------
describe('isRotation true cases: rotations of "abcde" (50 tests)', () => {
  const base = 'abcde';
  for (let i = 0; i < 50; i++) {
    const rot = i % base.length;
    const rotated = base.slice(rot) + base.slice(0, rot);
    it(`isRotation("${base}", "${rotated}") === true (rotation by ${rot}, test ${i + 1})`, () => {
      expect(isRotation(base, rotated)).toBe(true);
    });
  }
});

describe('isRotation false cases (50 tests)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`isRotation false test ${i}: different lengths`, () => {
      expect(isRotation('a'.repeat(i), 'a'.repeat(i + 1))).toBe(false);
    });
  }
});

describe('isRotation specific cases', () => {
  it('"abc" rotation "bca" === true', () => {
    expect(isRotation('abc', 'bca')).toBe(true);
  });

  it('"abc" rotation "cab" === true', () => {
    expect(isRotation('abc', 'cab')).toBe(true);
  });

  it('"abc" "bac" === false', () => {
    expect(isRotation('abc', 'bac')).toBe(false);
  });

  it('empty strings are rotations', () => {
    expect(isRotation('', '')).toBe(true);
  });

  it('single same char', () => {
    expect(isRotation('a', 'a')).toBe(true);
  });

  it('single different char', () => {
    expect(isRotation('a', 'b')).toBe(false);
  });

  it('"abcd" rotation "cdab" === true', () => {
    expect(isRotation('abcd', 'cdab')).toBe(true);
  });

  it('"abcd" "abdc" === false', () => {
    expect(isRotation('abcd', 'abdc')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// findPrefixMatches (50 tests)
// ---------------------------------------------------------------------------
describe('findPrefixMatches (50 tests)', () => {
  // For 'a'.repeat(n), all positions i>=1 have z[i]=n-i >= minLen=1
  for (let n = 2; n <= 51; n++) {
    it(`findPrefixMatches('a'x${n}, 1) returns ${n - 1} positions`, () => {
      const s = 'a'.repeat(n);
      const matches = findPrefixMatches(s, 1);
      expect(matches.length).toBe(n - 1);
    });
  }
});

describe('findPrefixMatches specific cases', () => {
  it('"abab" minLen=2: positions where z[i]>=2', () => {
    // z = [4,0,2,0], so position 2 qualifies
    const matches = findPrefixMatches('abab', 2);
    expect(matches).toContain(2);
  });

  it('"abcabc" minLen=3: position 3 qualifies', () => {
    const matches = findPrefixMatches('abcabc', 3);
    expect(matches).toContain(3);
  });

  it('"abcde" minLen=1: no position qualifies (all z[i]=0 for i>0)', () => {
    const matches = findPrefixMatches('abcde', 1);
    expect(matches).toEqual([]);
  });

  it('minLen=0 returns all positions 1..n-1 for non-trivial string', () => {
    // Every z[i]>=0 is always true
    const s = 'abcde';
    const matches = findPrefixMatches(s, 0);
    expect(matches.length).toBe(s.length - 1);
  });

  it('empty string: no positions', () => {
    expect(findPrefixMatches('', 1)).toEqual([]);
  });

  it('single char: no positions (loop starts at i=1)', () => {
    expect(findPrefixMatches('a', 1)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// smallestRotation (50 tests)
// ---------------------------------------------------------------------------
describe('smallestRotation result is always a rotation of input (50 tests)', () => {
  const testStrings = [
    'cba', 'bca', 'cab', 'zyx', 'dcba', 'abcd', 'bcda', 'cdab', 'dabc',
    'zyxw', 'hello', 'world', 'alpha', 'beta', 'gamma', 'delta', 'omega',
    'test', 'case', 'sort', 'ring', 'loop', 'path', 'node', 'tree',
    'heap', 'stack', 'queue', 'graph', 'hash', 'list', 'array', 'tuple',
    'map', 'set', 'key', 'val', 'idx', 'ptr', 'ref', 'obj', 'cls',
    'fn', 'op', 'ty', 'str', 'int', 'num', 'bool', 'nil', 'err', 'ok',
  ];
  for (let i = 0; i < 50; i++) {
    const s = testStrings[i];
    it(`smallestRotation("${s}") is a rotation of "${s}"`, () => {
      const result = smallestRotation(s);
      expect(result.length).toBe(s.length);
      expect(isRotation(s, result)).toBe(true);
    });
  }
});

describe('smallestRotation specific values', () => {
  it('"cba" smallest rotation is "acb"', () => {
    expect(smallestRotation('cba')).toBe('acb');
  });

  it('"bca" smallest rotation is "abc"', () => {
    expect(smallestRotation('bca')).toBe('abc');
  });

  it('"abc" smallest rotation is "abc"', () => {
    expect(smallestRotation('abc')).toBe('abc');
  });

  it('"cab" smallest rotation is "abc"', () => {
    expect(smallestRotation('cab')).toBe('abc');
  });

  it('"dcba" smallest rotation starts with "a"', () => {
    const r = smallestRotation('dcba');
    expect(r[0]).toBe('a');
  });

  it('empty string returns empty', () => {
    expect(smallestRotation('')).toBe('');
  });

  it('single char returns same', () => {
    expect(smallestRotation('z')).toBe('z');
  });

  it('"aaa" returns "aaa"', () => {
    expect(smallestRotation('aaa')).toBe('aaa');
  });

  it('"ba" returns "ab"', () => {
    expect(smallestRotation('ba')).toBe('ab');
  });

  it('"zyxwvu" starts with "u"', () => {
    const r = smallestRotation('zyxwvu');
    expect(r[0]).toBe('u');
  });

  it('smallestRotation is lexicographically <= all rotations', () => {
    const s = 'dcbae';
    const result = smallestRotation(s);
    const n = s.length;
    for (let i = 0; i < n; i++) {
      const rot = s.slice(i) + s.slice(0, i);
      expect(result <= rot).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// buildZArrayInt length (50 tests, n=1..50)
// ---------------------------------------------------------------------------
describe('buildZArrayInt length (50 tests)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`buildZArrayInt([0..${n - 1}]).length === ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      expect(buildZArrayInt(arr).length).toBe(n);
    });
  }
});

describe('buildZArrayInt specific cases', () => {
  it('empty array returns []', () => {
    expect(buildZArrayInt([])).toEqual([]);
  });

  it('single element: z=[1]', () => {
    expect(buildZArrayInt([5])).toEqual([1]);
  });

  it('[1,1,1]: z=[3,2,1]', () => {
    expect(buildZArrayInt([1, 1, 1])).toEqual([3, 2, 1]);
  });

  it('[1,2,3]: z[1]=0, z[2]=0', () => {
    const z = buildZArrayInt([1, 2, 3]);
    expect(z[1]).toBe(0);
    expect(z[2]).toBe(0);
  });

  it('[1,2,1,2]: z[2]=2', () => {
    const z = buildZArrayInt([1, 2, 1, 2]);
    expect(z[2]).toBe(2);
  });

  it('z[0] always equals n', () => {
    for (let n = 1; n <= 10; n++) {
      const arr = Array.from({ length: n }, (_, i) => i % 3);
      const z = buildZArrayInt(arr);
      expect(z[0]).toBe(n);
    }
  });

  it('all same values: z[i] = n-i', () => {
    const arr = [7, 7, 7, 7, 7];
    const z = buildZArrayInt(arr);
    for (let i = 0; i < 5; i++) {
      expect(z[i]).toBe(5 - i);
    }
  });

  it('search pattern in int array via buildZArrayInt', () => {
    // pattern [1,2] in [1,2,3,1,2,4]: occurrences at 0 and 3
    const pattern = [1, 2];
    const text = [1, 2, 3, 1, 2, 4];
    const sep = [-1]; // separator not in either
    const combined = [...pattern, ...sep, ...text];
    const z = buildZArrayInt(combined);
    const m = pattern.length;
    const positions: number[] = [];
    for (let i = m + 1; i < combined.length; i++) {
      if (z[i] >= m) positions.push(i - m - 1);
    }
    expect(positions).toEqual([0, 3]);
  });
});

// ---------------------------------------------------------------------------
// findAnagrams (50 tests)
// ---------------------------------------------------------------------------
describe('findAnagrams classic test case (10 tests)', () => {
  it('findAnagrams("cbaebabacd", "abc") === [0, 6]', () => {
    expect(findAnagrams('cbaebabacd', 'abc')).toEqual([0, 6]);
  });

  it('findAnagrams("abab", "ab") === [0, 1, 2]', () => {
    expect(findAnagrams('abab', 'ab')).toEqual([0, 1, 2]);
  });

  it('pattern longer than text returns []', () => {
    expect(findAnagrams('ab', 'abc')).toEqual([]);
  });

  it('findAnagrams("baa", "aa") === [1]', () => {
    expect(findAnagrams('baa', 'aa')).toEqual([1]);
  });

  it('findAnagrams("aaaa", "a") === [0,1,2,3]', () => {
    expect(findAnagrams('aaaa', 'a')).toEqual([0, 1, 2, 3]);
  });

  it('findAnagrams("abc", "cba") === [0]', () => {
    expect(findAnagrams('abc', 'cba')).toEqual([0]);
  });

  it('findAnagrams("xyz", "abc") === []', () => {
    expect(findAnagrams('xyz', 'abc')).toEqual([]);
  });

  it('findAnagrams("aab", "baa") === [0]', () => {
    expect(findAnagrams('aab', 'baa')).toEqual([0]);
  });

  it('findAnagrams("abcd", "dcba") === [0]', () => {
    expect(findAnagrams('abcd', 'dcba')).toEqual([0]);
  });

  it('findAnagrams("ababab", "bab") === [1, 3]', () => {
    // text windows of length 3: "aba","bab","aba","bab"...
    // "aba" has a:2,b:1; "bab" has b:2,a:1; pattern "bab" has b:2,a:1
    // positions 1 and 3 are "bab"
    expect(findAnagrams('ababab', 'bab')).toEqual([1, 3]);
  });
});

describe('findAnagrams: single-char text and pattern (40 tests)', () => {
  for (let i = 1; i <= 40; i++) {
    it(`findAnagrams('a'x${i}, 'a') returns ${i} positions`, () => {
      const result = findAnagrams('a'.repeat(i), 'a');
      expect(result.length).toBe(i);
      for (let j = 0; j < i; j++) {
        expect(result[j]).toBe(j);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// allPeriods (additional coverage)
// ---------------------------------------------------------------------------
describe('allPeriods', () => {
  it('"a" has periods [1]', () => {
    expect(allPeriods('a')).toEqual([1]);
  });

  it('"aa" has periods [1, 2]', () => {
    expect(allPeriods('aa')).toEqual([1, 2]);
  });

  it('"ab" has periods [2]', () => {
    expect(allPeriods('ab')).toEqual([2]);
  });

  it('"abab" has periods [2, 4]', () => {
    expect(allPeriods('abab')).toEqual([2, 4]);
  });

  it('"aaaa" has periods [1, 2, 4]', () => {
    expect(allPeriods('aaaa')).toEqual([1, 2, 4]);
  });

  it('"abcabc" has periods [3, 6]', () => {
    expect(allPeriods('abcabc')).toEqual([3, 6]);
  });

  it('"abc" has periods [3]', () => {
    expect(allPeriods('abc')).toEqual([3]);
  });

  it('"abcabcabc" has periods [3, 9]', () => {
    expect(allPeriods('abcabcabc')).toEqual([3, 9]);
  });

  it('"aaaaaa" has periods [1, 2, 3, 6]', () => {
    expect(allPeriods('aaaaaa')).toEqual([1, 2, 3, 6]);
  });

  it('every string contains its own length as a period', () => {
    const strings = ['a', 'ab', 'abc', 'abcd', 'abcde'];
    for (const s of strings) {
      const periods = allPeriods(s);
      expect(periods).toContain(s.length);
    }
  });
});

// ---------------------------------------------------------------------------
// countDistinctSubstrings (additional coverage)
// ---------------------------------------------------------------------------
describe('countDistinctSubstrings', () => {
  it('"a" has 1 distinct substring', () => {
    expect(countDistinctSubstrings('a')).toBe(1);
  });

  it('"ab" has 3 distinct substrings: "a","b","ab"', () => {
    expect(countDistinctSubstrings('ab')).toBe(3);
  });

  it('"aa" has 2 distinct substrings: "a","aa"', () => {
    expect(countDistinctSubstrings('aa')).toBe(2);
  });

  it('"abc" has 6 distinct substrings', () => {
    expect(countDistinctSubstrings('abc')).toBe(6);
  });

  it('"aab" has 5 distinct substrings: "a","b","aa","ab","aab"', () => {
    expect(countDistinctSubstrings('aab')).toBe(5);
  });

  it('result is always positive for non-empty string', () => {
    const strings = ['x', 'xy', 'xyz', 'aaa', 'aba'];
    for (const s of strings) {
      expect(countDistinctSubstrings(s)).toBeGreaterThan(0);
    }
  });

  it('result <= n*(n+1)/2', () => {
    const s = 'abcde';
    const n = s.length;
    expect(countDistinctSubstrings(s)).toBeLessThanOrEqual((n * (n + 1)) / 2);
  });

  it('"aaa" has 3 distinct substrings: "a","aa","aaa"', () => {
    expect(countDistinctSubstrings('aaa')).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// zToKMPFailure (additional coverage)
// ---------------------------------------------------------------------------
describe('zToKMPFailure', () => {
  it('empty input returns []', () => {
    expect(zToKMPFailure([])).toEqual([]);
  });

  it('single element returns [0]', () => {
    expect(zToKMPFailure([1])).toEqual([0]);
  });

  it('returns array of same length', () => {
    const z = buildZArray('abcabc');
    const f = zToKMPFailure(z);
    expect(f.length).toBe(z.length);
  });

  it('all values are non-negative', () => {
    const z = buildZArray('abababab');
    const f = zToKMPFailure(z);
    for (const v of f) {
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it('input with z values produces non-negative output', () => {
    const z = [6, 0, 3, 0, 3, 0]; // from "abcabc"
    const f = zToKMPFailure(z);
    expect(f.length).toBe(6);
    for (const v of f) {
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Additional integration tests: Z-array property verification
// ---------------------------------------------------------------------------
describe('Z-array correctness: z[i] chars match prefix chars', () => {
  const testCases = [
    'abcabc',
    'abababab',
    'aabaabaab',
    'mississippi',
    'banana',
    'abracadabra',
  ];

  for (const s of testCases) {
    it(`verify z[i] chars match prefix for "${s}"`, () => {
      const z = buildZArray(s);
      for (let i = 1; i < s.length; i++) {
        // First z[i] chars of s[i..] must equal first z[i] chars of s
        const len = z[i];
        for (let j = 0; j < len; j++) {
          expect(s[i + j]).toBe(s[j]);
        }
        // If z[i] < n-i, next char must differ (or we're at end)
        if (i + len < s.length && len < s.length) {
          // The character at position z[i] in prefix must differ from s[i+z[i]]
          // (This ensures z[i] is maximal)
          if (len < s.length) {
            expect(s[i + len] === s[len]).toBe(false);
          }
        }
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Large input performance / correctness tests
// ---------------------------------------------------------------------------
describe('Z-algorithm on larger inputs', () => {
  it('buildZArray on 500-char all-same string', () => {
    const s = 'a'.repeat(500);
    const z = buildZArray(s);
    expect(z.length).toBe(500);
    expect(z[0]).toBe(500);
    for (let i = 1; i < 500; i++) {
      expect(z[i]).toBe(500 - i);
    }
  });

  it('zSearch "abc" in 300-char "abc".repeat(100)', () => {
    const text = 'abc'.repeat(100);
    const results = zSearch(text, 'abc');
    expect(results.length).toBe(100);
    for (let i = 0; i < 100; i++) {
      expect(results[i]).toBe(i * 3);
    }
  });

  it('countOccurrences on 300-char string', () => {
    const text = 'ab'.repeat(150);
    expect(countOccurrences(text, 'ab')).toBe(150);
  });

  it('isRotation on 100-char strings', () => {
    const base = 'abcde'.repeat(20);
    const rotated = base.slice(13) + base.slice(0, 13);
    expect(isRotation(base, rotated)).toBe(true);
  });

  it('minPeriod on "xyz".repeat(50)', () => {
    expect(minPeriod('xyz'.repeat(50))).toBe(3);
  });

  it('findAnagrams on 50-char string', () => {
    const text = 'ab'.repeat(25);
    const pattern = 'ba';
    const positions = findAnagrams(text, pattern);
    // Every window of 2 chars is either "ab" or "ba", both are anagrams of "ba"
    expect(positions.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Stress tests: Z-array for random-ish strings (50 tests)
// ---------------------------------------------------------------------------
describe('buildZArray on varied strings (50 tests)', () => {
  const alphabet = 'abcde';
  for (let i = 0; i < 50; i++) {
    const len = (i % 10) + 3;
    const s = Array.from({ length: len }, (_, j) => alphabet[(i * 3 + j * 7) % 5]).join('');
    it(`buildZArray("${s}") is valid`, () => {
      const z = buildZArray(s);
      expect(z.length).toBe(s.length);
      expect(z[0]).toBe(s.length);
      for (let k = 1; k < s.length; k++) {
        expect(z[k]).toBeGreaterThanOrEqual(0);
        expect(z[k]).toBeLessThanOrEqual(s.length - k);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// hasPeriod: period = string length always true (30 tests)
// ---------------------------------------------------------------------------
describe('hasPeriod: period === length is always true (30 tests)', () => {
  const strings = [
    'a', 'ab', 'abc', 'abcd', 'abcde', 'xyz', 'hello', 'world',
    'abcdef', 'abcdefg', 'qwerty', 'asdf', 'zxcv', 'foo', 'bar',
    'test', 'case', 'data', 'code', 'list', 'tree', 'node', 'leaf',
    'root', 'path', 'edge', 'link', 'sort', 'find', 'seek',
  ];
  for (let i = 0; i < 30; i++) {
    const s = strings[i];
    it(`hasPeriod("${s}", ${s.length}) === true`, () => {
      expect(hasPeriod(s, s.length)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// allPeriods always contains length (20 tests)
// ---------------------------------------------------------------------------
describe('allPeriods always contains string.length (20 tests)', () => {
  const samples = [
    'a', 'ba', 'abc', 'abcd', 'hello',
    'world', 'xy', 'xyz', 'abcde', 'fghij',
    'klmno', 'pqrst', 'uvwxy', 'z', 'az',
    'baz', 'qux', 'quux', 'corge', 'grault',
  ];
  for (let i = 0; i < 20; i++) {
    const s = samples[i];
    it(`allPeriods("${s}") contains ${s.length}`, () => {
      expect(allPeriods(s)).toContain(s.length);
    });
  }
});

// ---------------------------------------------------------------------------
// contains: a string always contains itself (30 tests)
// ---------------------------------------------------------------------------
describe('contains: string contains itself (30 tests)', () => {
  const samples = [
    'a', 'ab', 'abc', 'xyz', 'hello', 'world', 'foo', 'bar', 'baz',
    'qux', 'quux', 'test', 'case', 'node', 'tree', 'heap', 'sort',
    'abcd', 'efgh', 'ijkl', 'mnop', 'qrst', 'uvwx', 'yz', 'alpha',
    'beta', 'gamma', 'delta', 'omega', 'sigma',
  ];
  for (let i = 0; i < 30; i++) {
    const s = samples[i];
    it(`contains("${s}", "${s}") === true`, () => {
      expect(contains(s, s)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// zSearch: pattern equals text always returns [0] (30 tests)
// ---------------------------------------------------------------------------
describe('zSearch: pattern equals text returns [0] (30 tests)', () => {
  const samples = [
    'a', 'ab', 'abc', 'xyz', 'hello', 'world', 'foo', 'bar', 'baz',
    'qux', 'quux', 'test', 'case', 'node', 'tree', 'heap', 'sort',
    'abcd', 'efgh', 'ijkl', 'mnop', 'qrst', 'uvwx', 'yz', 'alpha',
    'beta', 'gamma', 'delta', 'omega', 'sigma',
  ];
  for (let i = 0; i < 30; i++) {
    const s = samples[i];
    it(`zSearch("${s}", "${s}") === [0]`, () => {
      expect(zSearch(s, s)).toEqual([0]);
    });
  }
});

// ---------------------------------------------------------------------------
// buildZArrayInt: z[0] === n for all n=1..50
// ---------------------------------------------------------------------------
describe('buildZArrayInt z[0] === n for n=1..50', () => {
  for (let n = 1; n <= 50; n++) {
    it(`buildZArrayInt(all-same[${n}])[0] === ${n}`, () => {
      const arr = new Array(n).fill(42);
      expect(buildZArrayInt(arr)[0]).toBe(n);
    });
  }
});
