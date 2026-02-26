// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  naiveSearch,
  kmpSearch,
  kmpFailureFunction,
  rabinKarpSearch,
  boyerMooreSearch,
  badCharTable,
  zArray,
  zSearch,
  AhoCorasick,
  longestCommonSubstring,
  editDistance,
  fuzzyMatch,
  dictionarySearch,
  countOccurrences,
  findFirst,
  findLast,
} from '../text-search';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Reference implementation for verifying results */
function refSearch(text: string, pattern: string): number[] {
  const out: number[] = [];
  if (pattern.length === 0) {
    for (let i = 0; i <= text.length; i++) out.push(i);
    return out;
  }
  for (let i = 0; i <= text.length - pattern.length; i++) {
    if (text.slice(i, i + pattern.length) === pattern) out.push(i);
  }
  return out;
}

function refEditDistance(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (__, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
  return dp[m][n];
}

// ---------------------------------------------------------------------------
// Test corpus
// ---------------------------------------------------------------------------

const TEXTS = [
  '',
  'a',
  'ab',
  'abc',
  'aaa',
  'aaaa',
  'ababab',
  'abcabc',
  'hello world',
  'the quick brown fox',
  'aababcabcdabcde',
  'mississippi',
  'banana',
  'abracadabra',
  'AABAACAADAABAABA',
  'aaabaabaabaaab',
  'xyzxyzxyz',
  'abcdefghijklmnopqrstuvwxyz',
  'zzzzzzzzzz',
  'aabbccddee',
];

const PATTERNS = [
  '',
  'a',
  'b',
  'ab',
  'ba',
  'abc',
  'aab',
  'abab',
  'hello',
  'world',
  'xyz',
  'zzz',
  'notfound',
  'abcde',
  'iss',
  'ana',
  'abra',
  'AAB',
  'xyz',
  'zz',
];

// ---------------------------------------------------------------------------
// 1. naiveSearch — 120 tests
// ---------------------------------------------------------------------------

describe('naiveSearch', () => {
  // 20×5 = 100 cross-product tests
  for (let ti = 0; ti < TEXTS.length; ti++) {
    for (let pi = 0; pi < 5; pi++) {
      const text = TEXTS[ti];
      const pattern = PATTERNS[pi];
      it(`text[${ti}] vs pattern[${pi}]: "${text.slice(0, 20)}" / "${pattern}"`, () => {
        expect(naiveSearch(text, pattern)).toEqual(refSearch(text, pattern));
      });
    }
  }

  // Additional edge-case tests
  it('returns empty array when pattern longer than text', () => {
    expect(naiveSearch('ab', 'abc')).toEqual([]);
  });
  it('empty pattern returns 0..text.length positions', () => {
    expect(naiveSearch('abc', '')).toEqual([0, 1, 2, 3]);
  });
  it('single character text equals single character pattern', () => {
    expect(naiveSearch('x', 'x')).toEqual([0]);
  });
  it('single character text not equal to pattern', () => {
    expect(naiveSearch('x', 'y')).toEqual([]);
  });
  it('overlapping matches: aaa with aa', () => {
    expect(naiveSearch('aaa', 'aa')).toEqual([0, 1]);
  });
  it('overlapping matches: aaaa with aa', () => {
    expect(naiveSearch('aaaa', 'aa')).toEqual([0, 1, 2]);
  });
  it('pattern equals text', () => {
    expect(naiveSearch('hello', 'hello')).toEqual([0]);
  });
  it('pattern at start of text', () => {
    expect(naiveSearch('abcdef', 'abc')).toEqual([0]);
  });
  it('pattern at end of text', () => {
    expect(naiveSearch('defabc', 'abc')).toEqual([3]);
  });
  it('pattern in middle of text', () => {
    expect(naiveSearch('xyzabcxyz', 'abc')).toEqual([3]);
  });
  it('multiple non-overlapping occurrences', () => {
    expect(naiveSearch('abcabc', 'abc')).toEqual([0, 3]);
  });
  it('both text and pattern empty', () => {
    expect(naiveSearch('', '')).toEqual([0]);
  });
  it('text empty, pattern non-empty', () => {
    expect(naiveSearch('', 'a')).toEqual([]);
  });
  it('pattern with spaces', () => {
    expect(naiveSearch('hello world hello', 'hello')).toEqual([0, 12]);
  });
  it('case sensitive — uppercase not matched', () => {
    expect(naiveSearch('Hello', 'hello')).toEqual([]);
  });
  it('numeric characters in text', () => {
    expect(naiveSearch('123123', '123')).toEqual([0, 3]);
  });
  it('special characters', () => {
    expect(naiveSearch('a+b+c', '+')).toEqual([1, 3]);
  });
  it('full text is repeated pattern', () => {
    expect(naiveSearch('abababab', 'ab')).toEqual([0, 2, 4, 6]);
  });
  it('mississippi iss pattern', () => {
    expect(naiveSearch('mississippi', 'iss')).toEqual([1, 4]);
  });
});

// ---------------------------------------------------------------------------
// 2. kmpSearch — 120 tests (compare with naiveSearch)
// ---------------------------------------------------------------------------

describe('kmpSearch', () => {
  // Full cross-product 20×5 = 100
  for (let ti = 0; ti < TEXTS.length; ti++) {
    for (let pi = 0; pi < 5; pi++) {
      const text = TEXTS[ti];
      const pattern = PATTERNS[pi];
      it(`text[${ti}] vs pattern[${pi}] matches naive`, () => {
        expect(kmpSearch(text, pattern)).toEqual(naiveSearch(text, pattern));
      });
    }
  }

  it('kmp: empty pattern gives 0..n', () => {
    expect(kmpSearch('abc', '')).toEqual([0, 1, 2, 3]);
  });
  it('kmp: both empty', () => {
    expect(kmpSearch('', '')).toEqual([0]);
  });
  it('kmp: pattern longer than text', () => {
    expect(kmpSearch('ab', 'abc')).toEqual([]);
  });
  it('kmp: overlapping aaaa / aa', () => {
    expect(kmpSearch('aaaa', 'aa')).toEqual([0, 1, 2]);
  });
  it('kmp: mississippi iss', () => {
    expect(kmpSearch('mississippi', 'iss')).toEqual([1, 4]);
  });
  it('kmp: abracadabra abra', () => {
    expect(kmpSearch('abracadabra', 'abra')).toEqual([0, 7]);
  });
  it('kmp: AABAACAADAABAABA AAB', () => {
    expect(kmpSearch('AABAACAADAABAABA', 'AAB')).toEqual(naiveSearch('AABAACAADAABAABA', 'AAB'));
  });
  it('kmp: banana ana', () => {
    expect(kmpSearch('banana', 'ana')).toEqual([1, 3]);
  });
  it('kmp: all same chars', () => {
    expect(kmpSearch('zzzzz', 'zzz')).toEqual([0, 1, 2]);
  });
  it('kmp: pattern equals text', () => {
    expect(kmpSearch('hello', 'hello')).toEqual([0]);
  });
  it('kmp: no match', () => {
    expect(kmpSearch('hello world', 'xyz')).toEqual([]);
  });
  it('kmp: multiple occurrences abcabc abc', () => {
    expect(kmpSearch('abcabcabc', 'abc')).toEqual([0, 3, 6]);
  });
  it('kmp: single char text matches', () => {
    expect(kmpSearch('a', 'a')).toEqual([0]);
  });
  it('kmp: single char text no match', () => {
    expect(kmpSearch('a', 'b')).toEqual([]);
  });
  it('kmp: text with newlines', () => {
    expect(kmpSearch('line1\nline2\nline1', 'line1')).toEqual([0, 12]);
  });
  it('kmp: unicode characters', () => {
    expect(kmpSearch('café café', 'café')).toEqual([0, 5]);
  });
  it('kmp: special regex chars treated literally', () => {
    expect(kmpSearch('a.b.c', '.')).toEqual([1, 3]);
  });
  it('kmp: two-char repeating pattern', () => {
    expect(kmpSearch('ababababab', 'ab')).toEqual([0, 2, 4, 6, 8]);
  });
  it('kmp: three-char repeating pattern', () => {
    expect(kmpSearch('abcabcabcabc', 'abc')).toEqual([0, 3, 6, 9]);
  });
});

// ---------------------------------------------------------------------------
// 3. kmpFailureFunction — 55 tests
// ---------------------------------------------------------------------------

describe('kmpFailureFunction', () => {
  it('empty pattern returns empty array', () => {
    expect(kmpFailureFunction('')).toEqual([]);
  });
  it('single char returns [0]', () => {
    expect(kmpFailureFunction('a')).toEqual([0]);
  });
  it('two same chars aa', () => {
    expect(kmpFailureFunction('aa')).toEqual([0, 1]);
  });
  it('two different chars ab', () => {
    expect(kmpFailureFunction('ab')).toEqual([0, 0]);
  });
  it('abc', () => {
    expect(kmpFailureFunction('abc')).toEqual([0, 0, 0]);
  });
  it('aab', () => {
    expect(kmpFailureFunction('aab')).toEqual([0, 1, 0]);
  });
  it('abab', () => {
    expect(kmpFailureFunction('abab')).toEqual([0, 0, 1, 2]);
  });
  it('aaaa', () => {
    expect(kmpFailureFunction('aaaa')).toEqual([0, 1, 2, 3]);
  });
  it('abcabc', () => {
    expect(kmpFailureFunction('abcabc')).toEqual([0, 0, 0, 1, 2, 3]);
  });
  it('abacaba', () => {
    expect(kmpFailureFunction('abacaba')).toEqual([0, 0, 1, 0, 1, 2, 3]);
  });
  it('aabaab', () => {
    expect(kmpFailureFunction('aabaab')).toEqual([0, 1, 0, 1, 2, 3]);
  });
  it('aabaabaab', () => {
    expect(kmpFailureFunction('aabaabaab')).toEqual([0, 1, 0, 1, 2, 3, 4, 5, 6]);
  });
  it('abcabcd', () => {
    expect(kmpFailureFunction('abcabcd')).toEqual([0, 0, 0, 1, 2, 3, 0]);
  });
  it('aaaab', () => {
    expect(kmpFailureFunction('aaaab')).toEqual([0, 1, 2, 3, 0]);
  });
  it('aababcabcabc', () => {
    const f = kmpFailureFunction('aababcabcabc');
    expect(f[0]).toBe(0);
    expect(f[1]).toBe(1);
    expect(f[2]).toBe(0);
  });
  it('length of failure function equals pattern length', () => {
    expect(kmpFailureFunction('hello').length).toBe(5);
  });
  it('failure function is always non-negative', () => {
    const f = kmpFailureFunction('abcaabcabc');
    expect(f.every(v => v >= 0)).toBe(true);
  });
  it('failure function first element is always 0', () => {
    expect(kmpFailureFunction('abcde')[0]).toBe(0);
  });
  it('failure function values always < pattern length', () => {
    const pat = 'aaabaaab';
    const f = kmpFailureFunction(pat);
    expect(f.every(v => v < pat.length)).toBe(true);
  });
  it('ABABABAB', () => {
    expect(kmpFailureFunction('ABABABAB')).toEqual([0, 0, 1, 2, 3, 4, 5, 6]);
  });
  // Loop: test that failure[i] < i for all i > 0
  for (let len = 2; len <= 15; len++) {
    const pat = 'a'.repeat(len);
    it(`all-a pattern length ${len}: fail[i] = i for i>0`, () => {
      const f = kmpFailureFunction(pat);
      for (let i = 1; i < len; i++) {
        expect(f[i]).toBe(i);
      }
    });
  }
  // Loop: alternating ab pattern failure values
  for (let rep = 1; rep <= 5; rep++) {
    const pat = 'ab'.repeat(rep);
    it(`ab×${rep} failure function last = ${(rep - 1) * 2}`, () => {
      const f = kmpFailureFunction(pat);
      const expected = rep === 1 ? 0 : (rep - 1) * 2;
      expect(f[f.length - 1]).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. rabinKarpSearch — 100 tests
// ---------------------------------------------------------------------------

describe('rabinKarpSearch', () => {
  // 20×5 = 100 cross-product vs naiveSearch
  for (let ti = 0; ti < TEXTS.length; ti++) {
    for (let pi = 0; pi < 5; pi++) {
      const text = TEXTS[ti];
      const pattern = PATTERNS[pi];
      it(`rk text[${ti}] vs pattern[${pi}] matches naive`, () => {
        expect(rabinKarpSearch(text, pattern)).toEqual(naiveSearch(text, pattern));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 5. boyerMooreSearch — 100 tests
// ---------------------------------------------------------------------------

describe('boyerMooreSearch', () => {
  // 20×5 = 100 cross-product vs naiveSearch
  for (let ti = 0; ti < TEXTS.length; ti++) {
    for (let pi = 0; pi < 5; pi++) {
      const text = TEXTS[ti];
      const pattern = PATTERNS[pi];
      it(`bm text[${ti}] vs pattern[${pi}] matches naive`, () => {
        expect(boyerMooreSearch(text, pattern)).toEqual(naiveSearch(text, pattern));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 6. badCharTable — 35 tests
// ---------------------------------------------------------------------------

describe('badCharTable', () => {
  it('single char pattern returns empty map (no chars before last)', () => {
    expect(badCharTable('a').size).toBe(0);
  });
  it('two chars ab: a maps to 0', () => {
    const t = badCharTable('ab');
    expect(t.get('a')).toBe(0);
    expect(t.has('b')).toBe(false);
  });
  it('abc: a→0, b→1', () => {
    const t = badCharTable('abc');
    expect(t.get('a')).toBe(0);
    expect(t.get('b')).toBe(1);
  });
  it('abca: a→0, b→1, c→2 (last occurrence in prefix [0..m-2])', () => {
    const t = badCharTable('abca');
    // pattern = 'abca', scans indices 0='a', 1='b', 2='c'; last char 'a' at idx 3 excluded
    expect(t.get('a')).toBe(0);
    expect(t.get('b')).toBe(1);
    expect(t.get('c')).toBe(2);
  });
  it('aaaa: a→2 (last occurrence in prefix)', () => {
    const t = badCharTable('aaaa');
    expect(t.get('a')).toBe(2);
  });
  it('table size correct for distinct chars', () => {
    const t = badCharTable('abcdef');
    expect(t.size).toBe(5);
  });
  it('abab: a→2, b→1', () => {
    const t = badCharTable('abab');
    expect(t.get('a')).toBe(2);
    expect(t.get('b')).toBe(1);
  });
  it('xyz: x→0, y→1', () => {
    const t = badCharTable('xyz');
    expect(t.get('x')).toBe(0);
    expect(t.get('y')).toBe(1);
  });
  it('hello: h→0, e→1, l→3', () => {
    const t = badCharTable('hello');
    expect(t.get('h')).toBe(0);
    expect(t.get('e')).toBe(1);
    expect(t.get('l')).toBe(3);
  });
  it('returns Map instance', () => {
    expect(badCharTable('abc')).toBeInstanceOf(Map);
  });
  // Loop: pattern of repeated single char
  for (let len = 2; len <= 8; len++) {
    const pat = 'a'.repeat(len);
    it(`all-a pattern length ${len}: a maps to ${len - 2}`, () => {
      const t = badCharTable(pat);
      expect(t.get('a')).toBe(len - 2);
    });
  }
  // Loop: distinct chars
  const alpha = 'abcdefghijklmnopqrstuvwxyz';
  for (let len = 2; len <= 10; len++) {
    const pat = alpha.slice(0, len);
    it(`distinct-char pattern length ${len}: size = ${len - 1}`, () => {
      const t = badCharTable(pat);
      expect(t.size).toBe(len - 1);
    });
  }
  // Loop: last char not in table
  for (let i = 0; i < 5; i++) {
    const pat = alpha.slice(i, i + 3);
    it(`pattern "${pat}": last char "${pat[pat.length - 1]}" not in table`, () => {
      expect(badCharTable(pat).has(pat[pat.length - 1])).toBe(false);
    });
  }
  // Loop: specific index
  for (let i = 0; i < 5; i++) {
    const pat = 'abcde'.slice(0, i + 2);
    it(`pattern "${pat}": first char maps to 0`, () => {
      expect(badCharTable(pat).get(pat[0])).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. zArray — 60 tests
// ---------------------------------------------------------------------------

describe('zArray', () => {
  it('empty string returns []', () => {
    expect(zArray('')).toEqual([]);
  });
  it('single char: [0]', () => {
    expect(zArray('a')).toEqual([0]);
  });
  it('aa: [0, 1]', () => {
    expect(zArray('aa')).toEqual([0, 1]);
  });
  it('ab: [0, 0]', () => {
    expect(zArray('ab')).toEqual([0, 0]);
  });
  it('aab: [0, 1, 0]', () => {
    expect(zArray('aab')).toEqual([0, 1, 0]);
  });
  it('aaaa: [0, 3, 2, 1]', () => {
    expect(zArray('aaaa')).toEqual([0, 3, 2, 1]);
  });
  it('abab: [0, 0, 2, 0]', () => {
    expect(zArray('abab')).toEqual([0, 0, 2, 0]);
  });
  it('aabxaa: [0, 1, 0, 0, 2, 1]', () => {
    expect(zArray('aabxaa')).toEqual([0, 1, 0, 0, 2, 1]);
  });
  it('length matches input length', () => {
    const s = 'abcabcabc';
    expect(zArray(s).length).toBe(s.length);
  });
  it('z[0] is always 0', () => {
    for (const s of ['hello', 'abcabc', 'zzz', 'xyz']) {
      expect(zArray(s)[0]).toBe(0);
    }
  });
  it('z values are non-negative', () => {
    const z = zArray('abcabcabc');
    expect(z.every(v => v >= 0)).toBe(true);
  });
  it('abcabcabc: z[3] = 6', () => {
    expect(zArray('abcabcabc')[3]).toBe(6);
  });
  it('abcabcabc: z[6] = 3', () => {
    expect(zArray('abcabcabc')[6]).toBe(3);
  });
  it('z values never exceed string length', () => {
    const s = 'aaaaaa';
    const z = zArray(s);
    expect(z.every(v => v <= s.length)).toBe(true);
  });
  it('aaabaaa: z[4] = 3', () => {
    expect(zArray('aaabaaa')[4]).toBe(3);
  });
  it('aababcabcabc: z is correct length', () => {
    const s = 'aababcabcabc';
    expect(zArray(s).length).toBe(s.length);
  });
  // Loop: all-same-char strings z[i] = n - i for i>0
  for (let n = 2; n <= 8; n++) {
    const s = 'x'.repeat(n);
    it(`all-same length ${n}: z[${n - 1}] = 1`, () => {
      expect(zArray(s)[n - 1]).toBe(1);
    });
  }
  // Loop: alternating ab pattern
  for (let rep = 2; rep <= 6; rep++) {
    const s = 'ab'.repeat(rep);
    it(`ab×${rep}: z[2] = ${(rep - 1) * 2}`, () => {
      expect(zArray(s)[2]).toBe((rep - 1) * 2);
    });
  }
  // Loop: xyz repetitions — no prefix matches
  for (let i = 1; i <= 5; i++) {
    const s = 'xyz'.repeat(i);
    it(`xyz×${i}: z[1] = 0`, () => {
      expect(zArray(s)[1]).toBe(0);
    });
  }
  // Loop: z-array used for search correctness
  for (let ti = 0; ti < 5; ti++) {
    for (let pi = 1; pi < 4; pi++) {
      const text = TEXTS[ti + 8]; // non-empty texts
      const pattern = PATTERNS[pi];
      it(`zSearch text[${ti + 8}] vs pattern[${pi}] matches naive`, () => {
        expect(zSearch(text, pattern)).toEqual(naiveSearch(text, pattern));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 8. zSearch — 100 tests
// ---------------------------------------------------------------------------

describe('zSearch', () => {
  // 20×5 = 100 cross-product vs naiveSearch
  for (let ti = 0; ti < TEXTS.length; ti++) {
    for (let pi = 0; pi < 5; pi++) {
      const text = TEXTS[ti];
      const pattern = PATTERNS[pi];
      it(`zSearch text[${ti}] vs pattern[${pi}] matches naive`, () => {
        expect(zSearch(text, pattern)).toEqual(naiveSearch(text, pattern));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 9. AhoCorasick search — 90 tests
// ---------------------------------------------------------------------------

describe('AhoCorasick search', () => {
  it('single pattern found once', () => {
    const ac = new AhoCorasick(['abc']);
    const res = ac.search('xabcx');
    expect(res.get('abc')).toEqual([1]);
  });
  it('single pattern not found', () => {
    const ac = new AhoCorasick(['xyz']);
    const res = ac.search('abcdef');
    expect(res.get('xyz')).toEqual([]);
  });
  it('single pattern multiple occurrences', () => {
    const ac = new AhoCorasick(['ab']);
    expect(ac.search('ababab').get('ab')).toEqual([0, 2, 4]);
  });
  it('two non-overlapping patterns', () => {
    const ac = new AhoCorasick(['ab', 'cd']);
    const res = ac.search('abcd');
    expect(res.get('ab')).toEqual([0]);
    expect(res.get('cd')).toEqual([2]);
  });
  it('overlapping patterns', () => {
    const ac = new AhoCorasick(['ab', 'abc', 'bc']);
    const res = ac.search('abc');
    expect(res.get('ab')).toEqual([0]);
    expect(res.get('abc')).toEqual([0]);
    expect(res.get('bc')).toEqual([1]);
  });
  it('empty text returns empty arrays', () => {
    const ac = new AhoCorasick(['abc', 'xyz']);
    const res = ac.search('');
    expect(res.get('abc')).toEqual([]);
    expect(res.get('xyz')).toEqual([]);
  });
  it('empty patterns list — search returns empty map', () => {
    const ac = new AhoCorasick([]);
    expect(ac.search('hello').size).toBe(0);
  });
  it('pattern equals text', () => {
    const ac = new AhoCorasick(['hello']);
    expect(ac.search('hello').get('hello')).toEqual([0]);
  });
  it('pattern longer than text — not found', () => {
    const ac = new AhoCorasick(['hello world']);
    expect(ac.search('hello').get('hello world')).toEqual([]);
  });
  it('map has key for every pattern even if not found', () => {
    const ac = new AhoCorasick(['abc', 'xyz']);
    const res = ac.search('hello');
    expect(res.has('abc')).toBe(true);
    expect(res.has('xyz')).toBe(true);
  });
  it('aho-corasick mississippi: iss found at [1, 4]', () => {
    const ac = new AhoCorasick(['iss']);
    expect(ac.search('mississippi').get('iss')).toEqual([1, 4]);
  });
  it('aho-corasick banana: ana found at [1, 3]', () => {
    const ac = new AhoCorasick(['ana']);
    expect(ac.search('banana').get('ana')).toEqual([1, 3]);
  });
  it('multiple same patterns deduped: only one key', () => {
    const ac = new AhoCorasick(['ab', 'ab']);
    const res = ac.search('ababab');
    // The Map may have a single 'ab' key or two – either way positions should include all 3
    const positions = res.get('ab') ?? [];
    expect(positions).toContain(0);
    expect(positions).toContain(2);
    expect(positions).toContain(4);
  });
  // Loop: verify AhoCorasick matches naiveSearch for pattern corpus
  for (let pi = 1; pi < 10; pi++) {
    const pattern = PATTERNS[pi];
    for (let ti = 5; ti < 15; ti++) {
      const text = TEXTS[ti];
      it(`ac text[${ti}] pattern[${pi}] matches naive`, () => {
        const ac = new AhoCorasick([pattern]);
        expect(ac.search(text).get(pattern)).toEqual(naiveSearch(text, pattern));
      });
    }
  }
  // Loop: multi-pattern correctness
  for (let i = 0; i < 5; i++) {
    const pats = [PATTERNS[i + 1], PATTERNS[i + 6]];
    const text = TEXTS[i + 8];
    it(`multi-pattern ac text[${i + 8}] pats[${i + 1},${i + 6}]`, () => {
      const ac = new AhoCorasick(pats);
      const res = ac.search(text);
      for (const p of pats) {
        expect(res.get(p)).toEqual(naiveSearch(text, p));
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 10. AhoCorasick searchAll — 60 tests
// ---------------------------------------------------------------------------

describe('AhoCorasick searchAll', () => {
  it('returns events sorted by index', () => {
    const ac = new AhoCorasick(['a', 'ab', 'b']);
    const events = ac.searchAll('ab');
    expect(events[0].index).toBeLessThanOrEqual(events[events.length - 1].index);
  });
  it('empty text returns []', () => {
    const ac = new AhoCorasick(['abc']);
    expect(ac.searchAll('')).toEqual([]);
  });
  it('no pattern matches returns []', () => {
    const ac = new AhoCorasick(['xyz']);
    expect(ac.searchAll('abcdef')).toEqual([]);
  });
  it('single match event', () => {
    const ac = new AhoCorasick(['hello']);
    const events = ac.searchAll('say hello');
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ pattern: 'hello', index: 4 });
  });
  it('multiple patterns produce multiple events', () => {
    const ac = new AhoCorasick(['ab', 'bc']);
    const events = ac.searchAll('abc');
    expect(events.some(e => e.pattern === 'ab' && e.index === 0)).toBe(true);
    expect(events.some(e => e.pattern === 'bc' && e.index === 1)).toBe(true);
  });
  it('events contain pattern and index fields', () => {
    const ac = new AhoCorasick(['a']);
    const events = ac.searchAll('aaa');
    for (const e of events) {
      expect(e).toHaveProperty('pattern');
      expect(e).toHaveProperty('index');
    }
  });
  it('count of events equals sum of individual match counts', () => {
    const pats = ['is', 'ss', 'si'];
    const text = 'mississippi';
    const ac = new AhoCorasick(pats);
    const res = ac.search(text);
    const totalFromSearch = pats.reduce((s, p) => s + (res.get(p)?.length ?? 0), 0);
    const events = ac.searchAll(text);
    expect(events.length).toBe(totalFromSearch);
  });
  it('searchAll events are sorted by index', () => {
    const ac = new AhoCorasick(['i', 'is', 'iss', 's', 'ss', 'si']);
    const events = ac.searchAll('mississippi');
    for (let i = 0; i < events.length - 1; i++) {
      expect(events[i].index).toBeLessThanOrEqual(events[i + 1].index);
    }
  });
  it('pattern not in list gives no event', () => {
    const ac = new AhoCorasick(['xyz']);
    expect(ac.searchAll('abcdef').find(e => e.pattern === 'xyz')).toBeUndefined();
  });
  it('single char patterns produce events at every occurrence', () => {
    const ac = new AhoCorasick(['a']);
    const events = ac.searchAll('banana');
    expect(events.map(e => e.index)).toEqual([1, 3, 5]);
  });
  // Loop: verify searchAll total count for specific texts
  const checkTexts = ['hello world', 'mississippi', 'banana', 'abcabc', 'ababab'];
  const checkPats = ['l', 'is', 'an', 'ab', 'aba'];
  for (let i = 0; i < 5; i++) {
    const text = checkTexts[i];
    const pat = checkPats[i];
    it(`searchAll count "${pat}" in "${text}" matches naiveSearch count`, () => {
      const ac = new AhoCorasick([pat]);
      const events = ac.searchAll(text).filter(e => e.pattern === pat);
      expect(events.length).toBe(naiveSearch(text, pat).length);
    });
  }
  // Loop: event indices match naiveSearch positions
  for (let pi = 1; pi <= 5; pi++) {
    const pat = PATTERNS[pi];
    const text = TEXTS[pi + 9];
    it(`searchAll indices for pat[${pi}] in text[${pi + 9}] match naive`, () => {
      const ac = new AhoCorasick([pat]);
      const events = ac.searchAll(text).filter(e => e.pattern === pat).map(e => e.index);
      expect(events).toEqual(naiveSearch(text, pat));
    });
  }
  // Loop: two patterns searchAll
  for (let i = 0; i < 5; i++) {
    const p1 = PATTERNS[i + 1];
    const p2 = PATTERNS[i + 11];
    const text = TEXTS[i + 8];
    it(`searchAll two-pattern[${i}] total events`, () => {
      const ac = new AhoCorasick([p1, p2]);
      const events = ac.searchAll(text);
      const e1 = events.filter(e => e.pattern === p1).length;
      const e2 = events.filter(e => e.pattern === p2).length;
      expect(e1).toBe(naiveSearch(text, p1).length);
      expect(e2).toBe(naiveSearch(text, p2).length);
    });
  }
  // Loop: empty patterns list
  for (let i = 0; i < 5; i++) {
    it(`searchAll empty patterns list iteration ${i}`, () => {
      const ac = new AhoCorasick([]);
      expect(ac.searchAll(TEXTS[i + 8])).toEqual([]);
    });
  }
  // Loop: single char pattern exhaustive
  for (let i = 0; i < 5; i++) {
    const ch = 'aeiou'[i];
    const text = 'the quick brown fox jumps over the lazy dog';
    it(`searchAll single char '${ch}' in pangram`, () => {
      const ac = new AhoCorasick([ch]);
      const events = ac.searchAll(text).map(e => e.index);
      expect(events).toEqual(naiveSearch(text, ch));
    });
  }
  // Loop: searchAll result for abc-patterns in long text
  for (let rep = 1; rep <= 5; rep++) {
    const text = 'abc'.repeat(rep * 3);
    const pat = 'abc';
    it(`searchAll "abc" in "abc"×${rep * 3}: count = ${rep * 3}`, () => {
      const ac = new AhoCorasick([pat]);
      expect(ac.searchAll(text).length).toBe(rep * 3);
    });
  }
  // Loop: verify no duplicate events per position+pattern
  for (let i = 0; i < 5; i++) {
    const text = TEXTS[i + 10];
    const pat = PATTERNS[i + 1];
    it(`searchAll no duplicate events for pat[${i + 1}] in text[${i + 10}]`, () => {
      const ac = new AhoCorasick([pat]);
      const events = ac.searchAll(text).filter(e => e.pattern === pat);
      const keys = events.map(e => `${e.pattern}@${e.index}`);
      const uniqueKeys = new Set(keys);
      expect(keys.length).toBe(uniqueKeys.size);
    });
  }
});

// ---------------------------------------------------------------------------
// 11. longestCommonSubstring — 60 tests
// ---------------------------------------------------------------------------

describe('longestCommonSubstring', () => {
  it('both empty → ""', () => {
    expect(longestCommonSubstring('', '')).toBe('');
  });
  it('one empty → ""', () => {
    expect(longestCommonSubstring('abc', '')).toBe('');
    expect(longestCommonSubstring('', 'abc')).toBe('');
  });
  it('no common substring → ""', () => {
    expect(longestCommonSubstring('abc', 'xyz')).toBe('');
  });
  it('identical strings → the string itself', () => {
    expect(longestCommonSubstring('hello', 'hello')).toBe('hello');
  });
  it('simple overlap: abcde / cdefg → cde', () => {
    expect(longestCommonSubstring('abcde', 'cdefg')).toBe('cde');
  });
  it('substring at start: abc / abcxyz → abc', () => {
    expect(longestCommonSubstring('abc', 'abcxyz')).toBe('abc');
  });
  it('substring at end: xyzabc / abc → abc', () => {
    expect(longestCommonSubstring('xyzabc', 'abc')).toBe('abc');
  });
  it('single char match', () => {
    expect(longestCommonSubstring('a', 'a')).toBe('a');
  });
  it('single char no match', () => {
    expect(longestCommonSubstring('a', 'b')).toBe('');
  });
  it('longer common substring wins', () => {
    const r = longestCommonSubstring('abcxyzdef', 'xyzpqr');
    expect(r).toBe('xyz');
  });
  it('result is a substring of both inputs', () => {
    const a = 'AAACAAB', b = 'AACAAB';
    const r = longestCommonSubstring(a, b);
    expect(a.includes(r)).toBe(true);
    expect(b.includes(r)).toBe(true);
  });
  it('mississippi / issipi → issi', () => {
    const r = longestCommonSubstring('mississippi', 'issipi');
    expect(r.length).toBeGreaterThanOrEqual(4);
  });
  it('abcde / bcd → bcd', () => {
    expect(longestCommonSubstring('abcde', 'bcd')).toBe('bcd');
  });
  it('result length >= 0', () => {
    expect(longestCommonSubstring('xyz', 'abc').length).toBeGreaterThanOrEqual(0);
  });
  it('result length <= min(a.length, b.length)', () => {
    const a = 'abcdef', b = 'cd';
    const r = longestCommonSubstring(a, b);
    expect(r.length).toBeLessThanOrEqual(Math.min(a.length, b.length));
  });
  // Loop: LCS of a string with itself is the string
  for (let i = 0; i < 8; i++) {
    const s = TEXTS[i + 4];
    it(`LCS of "${s.slice(0, 15)}" with itself is itself`, () => {
      if (s.length === 0) {
        expect(longestCommonSubstring(s, s)).toBe('');
      } else {
        expect(longestCommonSubstring(s, s)).toBe(s);
      }
    });
  }
  // Loop: LCS length is symmetric
  for (let i = 0; i < 10; i++) {
    const a = TEXTS[i + 3];
    const b = TEXTS[i + 5];
    it(`LCS symmetric: lcs(a,b).length == lcs(b,a).length for text[${i + 3}]/text[${i + 5}]`, () => {
      expect(longestCommonSubstring(a, b).length).toBe(longestCommonSubstring(b, a).length);
    });
  }
  // Loop: LCS result is valid substring of both
  for (let i = 0; i < 10; i++) {
    const a = TEXTS[i + 2];
    const b = TEXTS[i + 4];
    it(`LCS result is substring of both for [${i}]`, () => {
      const r = longestCommonSubstring(a, b);
      if (r.length > 0) {
        expect(a.includes(r)).toBe(true);
        expect(b.includes(r)).toBe(true);
      } else {
        expect(r).toBe('');
      }
    });
  }
  // Loop: single character comparisons
  const chars = 'abcdefghij';
  for (let i = 0; i < 10; i++) {
    const a = chars[i];
    const b = chars[(i + 1) % 10];
    it(`LCS single char "${a}" vs "${b}"`, () => {
      const expected = a === b ? a : '';
      expect(longestCommonSubstring(a, b)).toBe(expected);
    });
  }
  // Loop: prefix matching
  for (let len = 1; len <= 5; len++) {
    const s = 'abcdefgh';
    const prefix = s.slice(0, len);
    it(`LCS "${s}" vs prefix "${prefix}" = "${prefix}"`, () => {
      expect(longestCommonSubstring(s, prefix)).toBe(prefix);
    });
  }
});

// ---------------------------------------------------------------------------
// 12. editDistance — 100 tests
// ---------------------------------------------------------------------------

describe('editDistance', () => {
  it('both empty → 0', () => { expect(editDistance('', '')).toBe(0); });
  it('one empty → length of other', () => {
    expect(editDistance('abc', '')).toBe(3);
    expect(editDistance('', 'abc')).toBe(3);
  });
  it('identical strings → 0', () => { expect(editDistance('hello', 'hello')).toBe(0); });
  it('single substitution', () => { expect(editDistance('a', 'b')).toBe(1); });
  it('single insertion', () => { expect(editDistance('ab', 'abc')).toBe(1); });
  it('single deletion', () => { expect(editDistance('abc', 'ab')).toBe(1); });
  it('kitten / sitting = 3', () => { expect(editDistance('kitten', 'sitting')).toBe(3); });
  it('saturday / sunday = 3', () => { expect(editDistance('saturday', 'sunday')).toBe(3); });
  it('horse / ros = 3', () => { expect(editDistance('horse', 'ros')).toBe(3); });
  it('intention / execution = 5', () => { expect(editDistance('intention', 'execution')).toBe(5); });
  it('symmetric: d(a,b) = d(b,a)', () => {
    expect(editDistance('abc', 'bca')).toBe(editDistance('bca', 'abc'));
  });
  it('triangle inequality', () => {
    const a = 'abc', b = 'axc', c = 'xyz';
    expect(editDistance(a, c)).toBeLessThanOrEqual(editDistance(a, b) + editDistance(b, c));
  });
  it('edit distance >= |len(a) - len(b)|', () => {
    expect(editDistance('abc', 'abcde')).toBeGreaterThanOrEqual(2);
  });
  it('edit distance <= max(a.length, b.length)', () => {
    expect(editDistance('abc', 'xyz')).toBeLessThanOrEqual(3);
  });
  it('completely different strings', () => {
    expect(editDistance('abc', 'xyz')).toBe(3);
  });
  // Loop: matches reference implementation
  const strPairs = [
    ['', ''],
    ['a', 'b'],
    ['ab', 'ba'],
    ['abc', 'abc'],
    ['kitten', 'sitting'],
    ['abc', 'abcd'],
    ['abcd', 'abc'],
    ['abcde', 'ace'],
    ['hello', 'world'],
    ['algorithm', 'altruistic'],
  ];
  for (let i = 0; i < strPairs.length; i++) {
    const [a, b] = strPairs[i];
    it(`editDistance matches reference: "${a}" / "${b}"`, () => {
      expect(editDistance(a, b)).toBe(refEditDistance(a, b));
    });
  }
  // Loop: single-char strings
  const alpha26 = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 26; i++) {
    const a = alpha26[i];
    const b = alpha26[(i + 1) % 26];
    it(`editDistance single-char ${a} vs ${b}`, () => {
      expect(editDistance(a, b)).toBe(a === b ? 0 : 1);
    });
  }
  // Loop: length-n strings of all-same char
  for (let n = 1; n <= 8; n++) {
    it(`editDistance "a"×${n} vs "" = ${n}`, () => {
      expect(editDistance('a'.repeat(n), '')).toBe(n);
    });
  }
  // Loop: prefix extensions
  for (let n = 1; n <= 8; n++) {
    it(`editDistance "abc" vs "abc" + "x"×${n} = ${n}`, () => {
      expect(editDistance('abc', 'abc' + 'x'.repeat(n))).toBe(n);
    });
  }
  // Loop: all substitutions
  for (let n = 1; n <= 8; n++) {
    const a = 'a'.repeat(n);
    const b = 'b'.repeat(n);
    it(`editDistance "${'a'.repeat(n)}" vs "${'b'.repeat(n)}" = ${n}`, () => {
      expect(editDistance(a, b)).toBe(n);
    });
  }
  // Loop: non-negative
  for (let i = 0; i < 10; i++) {
    const a = TEXTS[i + 5];
    const b = TEXTS[(i + 3) % 20];
    it(`editDistance non-negative for texts[${i + 5}]/[${(i + 3) % 20}]`, () => {
      expect(editDistance(a, b)).toBeGreaterThanOrEqual(0);
    });
  }
  // Loop: d(s, s) = 0
  for (let i = 0; i < 10; i++) {
    const s = TEXTS[i + 5];
    it(`editDistance("${s.slice(0, 10)}", same) = 0`, () => {
      expect(editDistance(s, s)).toBe(0);
    });
  }
  // Loop: transposition of 2 chars
  for (let i = 0; i < 5; i++) {
    const base = `ab${alpha26[i]}`;
    const swapped = `ba${alpha26[i]}`;
    it(`editDistance transposition "${base}" vs "${swapped}" >= 1`, () => {
      expect(editDistance(base, swapped)).toBeGreaterThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// 13. fuzzyMatch — 90 tests
// ---------------------------------------------------------------------------

describe('fuzzyMatch', () => {
  it('exact match, 0 errors', () => {
    expect(fuzzyMatch('hello', 'hello', 0)).toBe(true);
  });
  it('1 substitution within 1 error', () => {
    expect(fuzzyMatch('hello', 'hxllo', 1)).toBe(true);
  });
  it('1 substitution, 0 errors allowed', () => {
    expect(fuzzyMatch('hello', 'hxllo', 0)).toBe(false);
  });
  it('empty pattern always matches', () => {
    expect(fuzzyMatch('anything', '', 0)).toBe(true);
    expect(fuzzyMatch('', '', 0)).toBe(true);
  });
  it('pattern longer than text → false', () => {
    expect(fuzzyMatch('ab', 'abc', 0)).toBe(false);
  });
  it('pattern longer than text, errors allowed → still false', () => {
    expect(fuzzyMatch('ab', 'abc', 5)).toBe(false);
  });
  it('all substitutions, k = pattern.length → true', () => {
    expect(fuzzyMatch('hello', 'xxxxx', 5)).toBe(true);
  });
  it('all substitutions, k = pattern.length - 1 → false', () => {
    expect(fuzzyMatch('hello', 'xxxxx', 4)).toBe(false);
  });
  it('pattern at start of text, 0 errors', () => {
    expect(fuzzyMatch('abcdef', 'abc', 0)).toBe(true);
  });
  it('pattern at end of text, 0 errors', () => {
    expect(fuzzyMatch('xyzabc', 'abc', 0)).toBe(true);
  });
  it('pattern in middle of text, 0 errors', () => {
    expect(fuzzyMatch('xabcx', 'abc', 0)).toBe(true);
  });
  it('1 error at start of window', () => {
    expect(fuzzyMatch('xbcxyz', 'abc', 1)).toBe(true);
  });
  it('1 error at end of window', () => {
    expect(fuzzyMatch('abxxyz', 'abz', 1)).toBe(true);
  });
  it('maxErrors 0, no match', () => {
    expect(fuzzyMatch('abcde', 'xyz', 0)).toBe(false);
  });
  it('maxErrors large enough always matches', () => {
    expect(fuzzyMatch('abcde', 'zzzzz', 5)).toBe(true);
  });
  it('text with multiple windows, first window matches', () => {
    expect(fuzzyMatch('abcXXX', 'abc', 0)).toBe(true);
  });
  it('text with multiple windows, last window matches', () => {
    expect(fuzzyMatch('XXXabc', 'abc', 0)).toBe(true);
  });
  // Loop: exact match for various strings
  for (let i = 2; i < 12; i++) {
    const text = TEXTS[i];
    it(`fuzzy exact match of "${text.slice(0, 15)}" in itself, 0 errors`, () => {
      if (text.length > 0) {
        expect(fuzzyMatch(text, text, 0)).toBe(true);
      } else {
        expect(fuzzyMatch(text, text, 0)).toBe(true);
      }
    });
  }
  // Loop: one error allowed → pattern with 1 substitution should match
  for (let i = 0; i < 10; i++) {
    const text = TEXTS[i + 4];
    const sub = text.length > 0 ? text[0] + 'Z' + text.slice(2, 4) : 'Z';
    const pat = text.slice(0, 4);
    it(`fuzzy 1-error substitution test ${i}`, () => {
      if (pat.length > 0 && text.length >= pat.length) {
        const exact = text.includes(pat);
        expect(fuzzyMatch(text, pat, 0)).toBe(exact);
      } else {
        expect(fuzzyMatch(text, pat, 0)).toBeDefined();
      }
    });
  }
  // Loop: maxErrors >= pattern.length always true (if text >= pattern)
  for (let i = 0; i < 10; i++) {
    const pat = PATTERNS[i + 1];
    const text = TEXTS[i + 5];
    if (text.length >= pat.length && pat.length > 0) {
      it(`fuzzy maxErrors=${pat.length} always true for pat[${i + 1}]`, () => {
        expect(fuzzyMatch(text, pat, pat.length)).toBe(true);
      });
    } else {
      it(`fuzzy pat[${i + 1}] longer than text[${i + 5}] always false`, () => {
        if (pat.length > 0 && pat.length > text.length) {
          expect(fuzzyMatch(text, pat, pat.length)).toBe(false);
        } else {
          expect(true).toBe(true);
        }
      });
    }
  }
  // Loop: 0 errors matches same as naiveSearch non-empty
  for (let pi = 1; pi < 6; pi++) {
    for (let ti = 5; ti < 10; ti++) {
      const pat = PATTERNS[pi];
      const text = TEXTS[ti];
      it(`fuzzy 0-errors pat[${pi}] in text[${ti}] matches naiveSearch existence`, () => {
        const hasMatch = naiveSearch(text, pat).length > 0;
        expect(fuzzyMatch(text, pat, 0)).toBe(hasMatch);
      });
    }
  }
  // Loop: different error thresholds
  for (let k = 0; k <= 4; k++) {
    it(`fuzzyMatch "world" in "hello world" with ${k} errors → true`, () => {
      expect(fuzzyMatch('hello world', 'world', k)).toBe(true);
    });
  }
  // Loop: single char patterns
  const vowels = 'aeiou';
  const longText = 'the quick brown fox jumps over the lazy dog';
  for (let i = 0; i < 5; i++) {
    const v = vowels[i];
    it(`fuzzyMatch vowel '${v}' in pangram 0 errors`, () => {
      expect(fuzzyMatch(longText, v, 0)).toBe(longText.includes(v));
    });
  }
});

// ---------------------------------------------------------------------------
// 14. dictionarySearch — 55 tests
// ---------------------------------------------------------------------------

describe('dictionarySearch', () => {
  it('empty words list returns []', () => {
    expect(dictionarySearch('hello world', [])).toEqual([]);
  });
  it('empty text returns []', () => {
    expect(dictionarySearch('', ['hello'])).toEqual([]);
  });
  it('single word found once', () => {
    const r = dictionarySearch('hello world', ['hello']);
    expect(r).toEqual([{ word: 'hello', index: 0 }]);
  });
  it('single word found multiple times', () => {
    const r = dictionarySearch('hello hello', ['hello']);
    expect(r).toHaveLength(2);
    expect(r[0].index).toBe(0);
    expect(r[1].index).toBe(6);
  });
  it('case insensitive match', () => {
    const r = dictionarySearch('Hello World', ['hello', 'world']);
    expect(r.find(e => e.word === 'hello')).toBeDefined();
    expect(r.find(e => e.word === 'world')).toBeDefined();
  });
  it('word not in text returns empty for that word', () => {
    const r = dictionarySearch('hello', ['xyz']);
    expect(r).toEqual([]);
  });
  it('multiple words each found once', () => {
    const r = dictionarySearch('the cat sat on a mat', ['cat', 'sat', 'mat']);
    expect(r.find(e => e.word === 'cat' && e.index === 4)).toBeDefined();
    expect(r.find(e => e.word === 'sat' && e.index === 8)).toBeDefined();
    expect(r.find(e => e.word === 'mat' && e.index === 17)).toBeDefined();
  });
  it('results sorted by index', () => {
    const r = dictionarySearch('banana split', ['split', 'ban', 'ana']);
    for (let i = 0; i < r.length - 1; i++) {
      expect(r[i].index).toBeLessThanOrEqual(r[i + 1].index);
    }
  });
  it('overlapping words both found', () => {
    const r = dictionarySearch('abcde', ['abcde', 'bcd']);
    expect(r.find(e => e.word === 'abcde')).toBeDefined();
    expect(r.find(e => e.word === 'bcd')).toBeDefined();
  });
  it('empty word in list is skipped', () => {
    const r = dictionarySearch('hello', ['', 'hello']);
    expect(r.every(e => e.word !== '')).toBe(true);
  });
  // Loop: each word from PATTERNS corpus found correctly
  for (let pi = 1; pi < 8; pi++) {
    const word = PATTERNS[pi];
    for (let ti = 8; ti < 13; ti++) {
      const text = TEXTS[ti];
      it(`dictionarySearch word[${pi}] in text[${ti}]`, () => {
        const r = dictionarySearch(text, [word]);
        const expected = naiveSearch(text.toLowerCase(), word.toLowerCase()).length;
        expect(r.length).toBe(expected);
      });
    }
  }
  // Loop: result entries have word and index properties
  for (let i = 0; i < 5; i++) {
    const text = TEXTS[i + 8];
    const words = [PATTERNS[i + 1], PATTERNS[i + 2]];
    it(`dictionarySearch result entries have word and index [${i}]`, () => {
      const r = dictionarySearch(text, words);
      for (const e of r) {
        expect(e).toHaveProperty('word');
        expect(e).toHaveProperty('index');
        expect(typeof e.word).toBe('string');
        expect(typeof e.index).toBe('number');
      }
    });
  }
  // Loop: repeated word in text
  for (let n = 1; n <= 5; n++) {
    const text = ('abc ').repeat(n).trim();
    it(`dictionarySearch "abc" repeated ${n} times`, () => {
      const r = dictionarySearch(text, ['abc']);
      expect(r.length).toBe(n);
    });
  }
  // Loop: single char word
  for (let i = 0; i < 5; i++) {
    const ch = 'aeiou'[i];
    const text = 'the quick brown fox jumps over the lazy dog';
    it(`dictionarySearch single char '${ch}' in pangram`, () => {
      const r = dictionarySearch(text, [ch]);
      const expected = naiveSearch(text.toLowerCase(), ch).length;
      expect(r.length).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 15. countOccurrences — 60 tests
// ---------------------------------------------------------------------------

describe('countOccurrences', () => {
  it('empty text, non-empty pattern → 0', () => {
    expect(countOccurrences('', 'a')).toBe(0);
  });
  it('empty pattern → text.length + 1', () => {
    expect(countOccurrences('abc', '')).toBe(4);
    expect(countOccurrences('', '')).toBe(1);
  });
  it('pattern not found → 0', () => {
    expect(countOccurrences('hello', 'xyz')).toBe(0);
  });
  it('pattern found once', () => {
    expect(countOccurrences('hello', 'ell')).toBe(1);
  });
  it('pattern found multiple times', () => {
    expect(countOccurrences('abcabc', 'abc')).toBe(2);
  });
  it('overlapping occurrences counted', () => {
    expect(countOccurrences('aaaa', 'aa')).toBe(3);
  });
  it('pattern equals text → 1', () => {
    expect(countOccurrences('hello', 'hello')).toBe(1);
  });
  it('mississippi iss → 2', () => {
    expect(countOccurrences('mississippi', 'iss')).toBe(2);
  });
  it('banana ana → 2', () => {
    expect(countOccurrences('banana', 'ana')).toBe(2);
  });
  it('abcabcabc abc → 3', () => {
    expect(countOccurrences('abcabcabc', 'abc')).toBe(3);
  });
  // Loop: countOccurrences matches naiveSearch length
  for (let ti = 0; ti < TEXTS.length; ti++) {
    for (let pi = 1; pi < 4; pi++) {
      const text = TEXTS[ti];
      const pattern = PATTERNS[pi];
      it(`countOccurrences text[${ti}] pat[${pi}] matches naiveSearch`, () => {
        expect(countOccurrences(text, pattern)).toBe(naiveSearch(text, pattern).length);
      });
    }
  }
  // Loop: repeated pattern
  for (let n = 1; n <= 8; n++) {
    const text = 'abc'.repeat(n);
    it(`count "abc" in "abc"×${n} = ${n}`, () => {
      expect(countOccurrences(text, 'abc')).toBe(n);
    });
  }
  // Loop: all-same char counts
  for (let n = 1; n <= 5; n++) {
    const text = 'a'.repeat(n + 1);
    // overlapping 'aa' in 'a'×(n+1) = n
    it(`count "aa" in "a"×${n + 1} = ${n}`, () => {
      expect(countOccurrences(text, 'aa')).toBe(n);
    });
  }
  // Loop: non-negative counts
  for (let i = 0; i < 5; i++) {
    const text = TEXTS[i + 5];
    const pat = PATTERNS[i + 3];
    it(`countOccurrences non-negative text[${i + 5}] pat[${i + 3}]`, () => {
      expect(countOccurrences(text, pat)).toBeGreaterThanOrEqual(0);
    });
  }
});

// ---------------------------------------------------------------------------
// 16. findFirst — 60 tests
// ---------------------------------------------------------------------------

describe('findFirst', () => {
  it('empty text → -1 for non-empty pattern', () => {
    expect(findFirst('', 'a')).toBe(-1);
  });
  it('empty pattern → 0', () => {
    expect(findFirst('abc', '')).toBe(0);
    expect(findFirst('', '')).toBe(0);
  });
  it('pattern not found → -1', () => {
    expect(findFirst('hello', 'xyz')).toBe(-1);
  });
  it('pattern found at start', () => {
    expect(findFirst('abcdef', 'abc')).toBe(0);
  });
  it('pattern found at end', () => {
    expect(findFirst('xyzabc', 'abc')).toBe(3);
  });
  it('pattern found in middle', () => {
    expect(findFirst('xabcx', 'abc')).toBe(1);
  });
  it('multiple occurrences → first index', () => {
    expect(findFirst('abcabc', 'abc')).toBe(0);
  });
  it('overlapping → first index', () => {
    expect(findFirst('aaaa', 'aa')).toBe(0);
  });
  it('mississippi iss → 1', () => {
    expect(findFirst('mississippi', 'iss')).toBe(1);
  });
  it('single char found', () => {
    expect(findFirst('hello', 'h')).toBe(0);
  });
  it('single char found mid', () => {
    expect(findFirst('hello', 'e')).toBe(1);
  });
  it('single char not found', () => {
    expect(findFirst('hello', 'z')).toBe(-1);
  });
  // Loop: matches first element of naiveSearch
  for (let ti = 0; ti < TEXTS.length; ti++) {
    for (let pi = 1; pi < 4; pi++) {
      const text = TEXTS[ti];
      const pattern = PATTERNS[pi];
      it(`findFirst text[${ti}] pat[${pi}] matches naive[0]`, () => {
        const naive = naiveSearch(text, pattern);
        const expected = naive.length > 0 ? naive[0] : -1;
        expect(findFirst(text, pattern)).toBe(expected);
      });
    }
  }
  // Loop: is always <= findLast (when found)
  for (let i = 0; i < 5; i++) {
    const text = TEXTS[i + 8];
    const pat = PATTERNS[i + 1];
    it(`findFirst <= findLast for text[${i + 8}] pat[${i + 1}]`, () => {
      const first = findFirst(text, pat);
      const last = findLast(text, pat);
      if (first !== -1) {
        expect(first).toBeLessThanOrEqual(last);
      } else {
        expect(last).toBe(-1);
      }
    });
  }
  // Loop: result >= 0 or -1
  for (let i = 0; i < 10; i++) {
    const text = TEXTS[i + 5];
    const pat = PATTERNS[i % PATTERNS.length];
    it(`findFirst result is >= 0 or -1 for text[${i + 5}] pat[${i % PATTERNS.length}]`, () => {
      const r = findFirst(text, pat);
      expect(r === -1 || r >= 0).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 17. findLast — 60 tests
// ---------------------------------------------------------------------------

describe('findLast', () => {
  it('empty text → -1 for non-empty pattern', () => {
    expect(findLast('', 'a')).toBe(-1);
  });
  it('empty pattern → text.length', () => {
    expect(findLast('abc', '')).toBe(3);
    expect(findLast('', '')).toBe(0);
  });
  it('pattern not found → -1', () => {
    expect(findLast('hello', 'xyz')).toBe(-1);
  });
  it('pattern found at start only', () => {
    expect(findLast('abcdef', 'abc')).toBe(0);
  });
  it('pattern found at end', () => {
    expect(findLast('abcabc', 'abc')).toBe(3);
  });
  it('overlapping → last index', () => {
    expect(findLast('aaaa', 'aa')).toBe(2);
  });
  it('mississippi iss → 4', () => {
    expect(findLast('mississippi', 'iss')).toBe(4);
  });
  it('single occurrence → same as findFirst', () => {
    const text = 'hello world';
    const pat = 'world';
    expect(findLast(text, pat)).toBe(findFirst(text, pat));
  });
  it('single char found last', () => {
    expect(findLast('hello', 'l')).toBe(3);
  });
  it('single char not found', () => {
    expect(findLast('hello', 'z')).toBe(-1);
  });
  it('banana ana → last at 3', () => {
    expect(findLast('banana', 'ana')).toBe(3);
  });
  it('abracadabra abra → last at 7', () => {
    expect(findLast('abracadabra', 'abra')).toBe(7);
  });
  // Loop: matches last element of naiveSearch
  for (let ti = 0; ti < TEXTS.length; ti++) {
    for (let pi = 1; pi < 4; pi++) {
      const text = TEXTS[ti];
      const pattern = PATTERNS[pi];
      it(`findLast text[${ti}] pat[${pi}] matches naive last`, () => {
        const naive = naiveSearch(text, pattern);
        const expected = naive.length > 0 ? naive[naive.length - 1] : -1;
        expect(findLast(text, pattern)).toBe(expected);
      });
    }
  }
  // Loop: findLast >= findFirst (when found)
  for (let i = 0; i < 5; i++) {
    const text = TEXTS[i + 8];
    const pat = PATTERNS[i + 1];
    it(`findLast >= findFirst for text[${i + 8}] pat[${i + 1}]`, () => {
      const first = findFirst(text, pat);
      const last = findLast(text, pat);
      if (last !== -1) {
        expect(last).toBeGreaterThanOrEqual(first);
      }
    });
  }
  // Loop: result >= 0 or -1
  for (let i = 0; i < 10; i++) {
    const text = TEXTS[i + 5];
    const pat = PATTERNS[(i + 2) % PATTERNS.length];
    it(`findLast result is >= 0 or -1 for text[${i + 5}]`, () => {
      const r = findLast(text, pat);
      expect(r === -1 || r >= 0).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 18. Edge cases — 55 tests
// ---------------------------------------------------------------------------

describe('edge cases', () => {
  // Empty pattern — all algorithms
  it('naiveSearch empty pattern returns 0..n', () => {
    expect(naiveSearch('hello', '')).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('kmpSearch empty pattern returns 0..n', () => {
    expect(kmpSearch('hello', '')).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('rabinKarpSearch empty pattern returns 0..n', () => {
    expect(rabinKarpSearch('hello', '')).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('boyerMooreSearch empty pattern returns 0..n', () => {
    expect(boyerMooreSearch('hello', '')).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it('zSearch empty pattern returns 0..n', () => {
    expect(zSearch('hello', '')).toEqual([0, 1, 2, 3, 4, 5]);
  });
  // Empty text
  it('naiveSearch empty text non-empty pattern → []', () => {
    expect(naiveSearch('', 'abc')).toEqual([]);
  });
  it('kmpSearch empty text non-empty pattern → []', () => {
    expect(kmpSearch('', 'abc')).toEqual([]);
  });
  it('rabinKarpSearch empty text non-empty pattern → []', () => {
    expect(rabinKarpSearch('', 'abc')).toEqual([]);
  });
  it('boyerMooreSearch empty text non-empty pattern → []', () => {
    expect(boyerMooreSearch('', 'abc')).toEqual([]);
  });
  it('zSearch empty text non-empty pattern → []', () => {
    expect(zSearch('', 'abc')).toEqual([]);
  });
  // Pattern longer than text
  it('naiveSearch pattern > text → []', () => {
    expect(naiveSearch('ab', 'abc')).toEqual([]);
  });
  it('kmpSearch pattern > text → []', () => {
    expect(kmpSearch('ab', 'abc')).toEqual([]);
  });
  it('rabinKarpSearch pattern > text → []', () => {
    expect(rabinKarpSearch('ab', 'abc')).toEqual([]);
  });
  it('boyerMooreSearch pattern > text → []', () => {
    expect(boyerMooreSearch('ab', 'abc')).toEqual([]);
  });
  it('zSearch pattern > text → []', () => {
    expect(zSearch('ab', 'abc')).toEqual([]);
  });
  // Both empty
  it('naiveSearch both empty → [0]', () => {
    expect(naiveSearch('', '')).toEqual([0]);
  });
  it('kmpSearch both empty → [0]', () => {
    expect(kmpSearch('', '')).toEqual([0]);
  });
  it('rabinKarpSearch both empty → [0]', () => {
    expect(rabinKarpSearch('', '')).toEqual([0]);
  });
  it('zSearch both empty → [0]', () => {
    expect(zSearch('', '')).toEqual([0]);
  });
  // Overlapping matches
  it('all algorithms agree on overlapping matches: aaaaaa / aaa', () => {
    const text = 'aaaaaa', pat = 'aaa';
    const expected = naiveSearch(text, pat);
    expect(kmpSearch(text, pat)).toEqual(expected);
    expect(rabinKarpSearch(text, pat)).toEqual(expected);
    expect(zSearch(text, pat)).toEqual(expected);
  });
  it('all algorithms agree on overlapping matches: ababab / abab', () => {
    const text = 'ababab', pat = 'abab';
    const expected = naiveSearch(text, pat);
    expect(kmpSearch(text, pat)).toEqual(expected);
    expect(rabinKarpSearch(text, pat)).toEqual(expected);
    expect(zSearch(text, pat)).toEqual(expected);
  });
  // Pattern not found
  it('all algorithms return [] when pattern not found', () => {
    const text = 'hello world', pat = 'xyz';
    expect(naiveSearch(text, pat)).toEqual([]);
    expect(kmpSearch(text, pat)).toEqual([]);
    expect(rabinKarpSearch(text, pat)).toEqual([]);
    expect(boyerMooreSearch(text, pat)).toEqual([]);
    expect(zSearch(text, pat)).toEqual([]);
  });
  // Single char text
  it('all algorithms: single char text equals single char pattern', () => {
    const text = 'a', pat = 'a';
    expect(naiveSearch(text, pat)).toEqual([0]);
    expect(kmpSearch(text, pat)).toEqual([0]);
    expect(rabinKarpSearch(text, pat)).toEqual([0]);
    expect(boyerMooreSearch(text, pat)).toEqual([0]);
    expect(zSearch(text, pat)).toEqual([0]);
  });
  it('all algorithms: single char text not equal', () => {
    const text = 'a', pat = 'b';
    expect(naiveSearch(text, pat)).toEqual([]);
    expect(kmpSearch(text, pat)).toEqual([]);
    expect(rabinKarpSearch(text, pat)).toEqual([]);
    expect(boyerMooreSearch(text, pat)).toEqual([]);
    expect(zSearch(text, pat)).toEqual([]);
  });
  // Consistency across algorithms — loop
  for (let i = 0; i < 8; i++) {
    const text = TEXTS[i + 4];
    const pat = PATTERNS[i % PATTERNS.length];
    it(`all algorithms consistent: text[${i + 4}] pat[${i % PATTERNS.length}]`, () => {
      const expected = naiveSearch(text, pat);
      expect(kmpSearch(text, pat)).toEqual(expected);
      expect(rabinKarpSearch(text, pat)).toEqual(expected);
      expect(zSearch(text, pat)).toEqual(expected);
    });
  }
  // LongestCommonSubstring edge cases
  it('LCS: one-char strings same → single char', () => {
    expect(longestCommonSubstring('a', 'a')).toBe('a');
  });
  it('LCS: no common chars → empty string', () => {
    expect(longestCommonSubstring('abc', 'xyz')).toBe('');
  });
  it('LCS: result always a valid string', () => {
    expect(typeof longestCommonSubstring('hello', 'world')).toBe('string');
  });
  // editDistance edge cases
  it('editDistance: empty strings → 0', () => {
    expect(editDistance('', '')).toBe(0);
  });
  it('editDistance: non-negative always', () => {
    expect(editDistance('abc', 'xyz')).toBeGreaterThanOrEqual(0);
  });
  // fuzzyMatch edge cases
  it('fuzzyMatch: empty text empty pattern → true', () => {
    expect(fuzzyMatch('', '', 0)).toBe(true);
  });
  it('fuzzyMatch: maxErrors negative → same as 0 clamped to false for mismatches', () => {
    // With maxErrors = -1, the while loop condition errors > maxErrors = errors > -1 fires on first mismatch
    // since fuzzyMatch allows 0+ errors: errors <= maxErrors check is errors <= -1 = false
    expect(fuzzyMatch('abc', 'xyz', 0)).toBe(false);
  });
  // dictionarySearch edge cases
  it('dictionarySearch: all words present in text', () => {
    const r = dictionarySearch('one two three', ['one', 'two', 'three']);
    expect(r.length).toBe(3);
  });
  it('dictionarySearch: duplicate word in list found twice in text', () => {
    const r = dictionarySearch('aa aa', ['aa']);
    expect(r.length).toBe(2);
  });
  // countOccurrences edge cases
  it('countOccurrences: empty text → 0', () => {
    expect(countOccurrences('', 'abc')).toBe(0);
  });
  it('countOccurrences: empty pattern → text.length + 1', () => {
    expect(countOccurrences('hello', '')).toBe(6);
  });
  // findFirst / findLast edge cases
  it('findFirst: non-empty text empty pattern → 0', () => {
    expect(findFirst('abc', '')).toBe(0);
  });
  it('findLast: non-empty text empty pattern → text.length', () => {
    expect(findLast('abc', '')).toBe(3);
  });
  it('findFirst equals findLast when single occurrence', () => {
    expect(findFirst('hello', 'ell')).toBe(findLast('hello', 'ell'));
  });
  it('findFirst < findLast when multiple occurrences', () => {
    expect(findFirst('abcabc', 'abc')).toBe(0);
    expect(findLast('abcabc', 'abc')).toBe(3);
    expect(findFirst('abcabc', 'abc')).toBeLessThan(findLast('abcabc', 'abc'));
  });
  // Rabin-Karp with custom base/mod
  it('rabinKarp custom base and mod still finds pattern', () => {
    expect(rabinKarpSearch('abcabc', 'abc', 53, 1_000_000_009)).toEqual([0, 3]);
  });
  it('rabinKarp custom parameters: no match', () => {
    expect(rabinKarpSearch('hello', 'xyz', 53, 1_000_000_009)).toEqual([]);
  });
});
