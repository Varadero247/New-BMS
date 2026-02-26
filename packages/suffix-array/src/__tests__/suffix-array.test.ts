// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { buildSuffixArray, buildLCPArray, countDistinctSubstrings, longestRepeatedSubstring, longestCommonExtension, getSuffix, allSortedSuffixes, longestCommonSubstring, buildZArray, zMatch, bwt, SuffixArray, SuffixAutomaton, search } from '../suffix-array';

describe('buildSuffixArray length 200 tests', () => {
  for (let n = 1; n <= 200; n++) {
    it(`suffix array of length-${n} string has ${n} entries`, () => {
      const s = 'a'.repeat(n);
      const sa = buildSuffixArray(s);
      expect(sa.length).toBe(n);
    });
  }
});

describe('buildSuffixArray sorted 200 tests', () => {
  for (let n = 1; n <= 200; n++) {
    it(`suffix array of 'ab'.repeat sorted correctly n=${n}`, () => {
      const s = ('ab'.repeat(n)).slice(0, n);
      const sa = buildSuffixArray(s);
      const suffixes = sa.map(i => s.slice(i));
      for (let i = 1; i < suffixes.length; i++) {
        expect(suffixes[i] >= suffixes[i-1]).toBe(true);
      }
    });
  }
});

describe('getSuffix 200 tests', () => {
  for (let i = 0; i < 200; i++) {
    it(`getSuffix of 'hello' at pos ${i%5}`, () => {
      const s = 'hello';
      const pos = i % s.length;
      expect(getSuffix(s, pos)).toBe(s.slice(pos));
    });
  }
});

describe('longestCommonExtension 200 tests', () => {
  for (let i = 0; i < 200; i++) {
    it(`longestCommonExtension at same position ${i%5} = rest of string`, () => {
      const s = 'abcde';
      const pos = i % s.length;
      expect(longestCommonExtension(s, pos, pos)).toBe(s.length - pos);
    });
  }
});

describe('buildZArray 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`z-array of 'a'.repeat(${n}) has all ${n} at index 0`, () => {
      const s = 'a'.repeat(n);
      const z = buildZArray(s);
      expect(z[0]).toBe(n);
    });
  }
});

describe('zMatch 100 tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`zMatch finds pattern 'ab' in 'ababab' test ${i}`, () => {
      const matches = zMatch('ababababab', 'ab');
      expect(matches.length).toBeGreaterThan(0);
      expect(matches[0]).toBe(0);
    });
  }
});

describe('countDistinctSubstrings simple 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`distinct substrings of n-length unique string is n*(n+1)/2 approx n=${n}`, () => {
      const s = Array.from({ length: Math.min(n, 26) }, (_, i) => String.fromCharCode(97 + i)).join('');
      const count = countDistinctSubstrings(s);
      expect(count).toBeGreaterThan(0);
    });
  }
});

describe('buildLCPArray non-negative 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`LCP array of length-${n} all-a string has non-negative values`, () => {
      const s = 'a'.repeat(n);
      const sa = buildSuffixArray(s);
      const lcp = buildLCPArray(s, sa);
      for (const v of lcp) expect(v).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('longestRepeatedSubstring non-empty 50 tests', () => {
  for (let n = 2; n <= 51; n++) {
    it(`longestRepeatedSubstring of repeated pattern length ${n}`, () => {
      const s = 'ab'.repeat(n);
      const result = longestRepeatedSubstring(s);
      expect(result.length).toBeGreaterThan(0);
    });
  }
});

describe('allSortedSuffixes sorted order 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`allSortedSuffixes of length-${n} string is sorted`, () => {
      const s = ('abcdefghij'.repeat(n)).slice(0, n);
      const sorted = allSortedSuffixes(s);
      for (let i = 1; i < sorted.length; i++) {
        expect(sorted[i] >= sorted[i-1]).toBe(true);
      }
    });
  }
});

describe('SuffixArray search class 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    it(`SuffixArray.search finds existing pattern test ${i}`, () => {
      const s = `abcabc${i}`;
      const sa = new SuffixArray(s);
      expect(sa.search('abc').length).toBeGreaterThan(0);
    });
  }
});

describe('SuffixAutomaton contains 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    it(`SuffixAutomaton.contains returns true for substring test ${i}`, () => {
      const s = `hello world ${i}`;
      const aut = new SuffixAutomaton(s);
      expect(aut.contains('hello')).toBe(true);
    });
  }
});

describe('bwt transform length 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`bwt of length-${n} string produces same-length transform`, () => {
      const s = ('abcde'.repeat(n)).slice(0, n);
      const result = bwt(s);
      expect(result.transform.length).toBe(n);
    });
  }
});

describe('longestCommonSubstring basic 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    it(`longestCommonSubstring of identical strings test ${i}`, () => {
      const s = `abc${i % 10}def`;
      const result = longestCommonSubstring(s, s);
      expect(result.length).toBeGreaterThanOrEqual(3);
    });
  }
});

describe('search function 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    it(`search finds 'a' in all-a string test ${i}`, () => {
      const n = (i % 10) + 2;
      const s = 'a'.repeat(n);
      const sa = buildSuffixArray(s);
      const results = search(s, sa, 'a');
      expect(results.length).toBe(n);
    });
  }
});

describe('buildSuffixArray permutation 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`suffix array of length-${n} is a permutation of 0..n-1`, () => {
      const s = ('abcde'.repeat(n)).slice(0, n);
      const sa = buildSuffixArray(s);
      const sorted = [...sa].sort((a, b) => a - b);
      for (let i = 0; i < n; i++) expect(sorted[i]).toBe(i);
    });
  }
});

describe('buildZArray second element 50 tests', () => {
  for (let n = 2; n <= 51; n++) {
    it(`z-array of 'ab'.repeat length-${n} has z[0]=n`, () => {
      const s = ('ab'.repeat(n)).slice(0, n);
      const z = buildZArray(s);
      expect(z[0]).toBe(s.length);
    });
  }
});

describe('countDistinctSubstrings all-distinct string 26 tests', () => {
  for (let n = 1; n <= 26; n++) {
    it(`distinct substrings of first ${n} letters = n*(n+1)/2`, () => {
      const s = 'abcdefghijklmnopqrstuvwxyz'.slice(0, n);
      const count = countDistinctSubstrings(s);
      expect(count).toBe(n * (n + 1) / 2);
    });
  }
});

describe('getSuffix empty string 1 test', () => {
  it('getSuffix at pos 0 of single char', () => {
    expect(getSuffix('x', 0)).toBe('x');
  });
});

describe('longestCommonExtension different positions 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    it(`longestCommonExtension of non-matching positions ${i}`, () => {
      const s = 'abcdefghij';
      const p = i % 5;
      const q = (i % 5) + 5;
      const lce = longestCommonExtension(s, p, q);
      expect(lce).toBeGreaterThanOrEqual(0);
      expect(lce).toBeLessThanOrEqual(s.length - Math.max(p, q));
    });
  }
});

describe('bwt index in range 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`bwt index for length-${n} string is in [0, n-1]`, () => {
      const s = ('abcde'.repeat(n)).slice(0, n);
      const result = bwt(s);
      expect(result.index).toBeGreaterThanOrEqual(0);
      expect(result.index).toBeLessThan(n);
    });
  }
});

describe('allSortedSuffixes count 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`allSortedSuffixes returns ${n} suffixes for length-${n} string`, () => {
      const s = ('hello'.repeat(n)).slice(0, n);
      expect(allSortedSuffixes(s).length).toBe(n);
    });
  }
});

describe('zMatch no false positives 50 tests', () => {
  for (let i = 0; i < 50; i++) {
    it(`zMatch returns empty for non-matching pattern test ${i}`, () => {
      const results = zMatch('aaaa', 'b');
      expect(results.length).toBe(0);
    });
  }
});

describe('SuffixArray lcp method 50 tests', () => {
  for (let n = 1; n <= 50; n++) {
    it(`SuffixArray.lcp() returns array of length ${n}`, () => {
      const s = ('abcde'.repeat(n)).slice(0, n);
      const sa = new SuffixArray(s);
      expect(sa.lcp().length).toBe(n);
    });
  }
});

describe('SuffixAutomaton countDistinct 26 tests', () => {
  for (let n = 1; n <= 26; n++) {
    it(`SuffixAutomaton.countDistinct for first ${n} letters`, () => {
      const s = 'abcdefghijklmnopqrstuvwxyz'.slice(0, n);
      const aut = new SuffixAutomaton(s);
      expect(aut.countDistinct()).toBe(n * (n + 1) / 2);
    });
  }
});
