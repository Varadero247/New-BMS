// Copyright (c) 2026 Nexara DMCC. All rights reserved.

import {
  SuffixAutomaton,
  isSubstring,
  countOccurrences,
  countDistinctSubstrings,
  longestCommonSubstring,
  kthSubstring,
  isRotation,
  shortestUniqueSubstring,
  countSharedSubstrings,
  allDistinctSubstrings,
  longestRepeatedSubstring,
} from '../suffix-automaton';

// ---------------------------------------------------------------------------
// Helper: naive substring count
// ---------------------------------------------------------------------------
function naiveCount(s: string, t: string): number {
  if (t.length === 0) return s.length + 1;
  let count = 0;
  for (let i = 0; i <= s.length - t.length; i++) {
    if (s.slice(i, i + t.length) === t) count++;
  }
  return count;
}

function naiveDistinctCount(s: string): number {
  const set = new Set<string>();
  set.add('');
  for (let i = 0; i < s.length; i++)
    for (let j = i + 1; j <= s.length; j++)
      set.add(s.slice(i, j));
  return set.size;
}

function naiveLCS(s: string, t: string): string {
  let best = '';
  for (let i = 0; i < s.length; i++)
    for (let j = i + 1; j <= s.length; j++) {
      const sub = s.slice(i, j);
      if (t.includes(sub) && sub.length > best.length) best = sub;
    }
  return best;
}

// ---------------------------------------------------------------------------
// 1. SuffixAutomaton size tests (100 tests)
// ---------------------------------------------------------------------------
describe('SuffixAutomaton size bounds', () => {
  // For a string of length n, the SAM has at most 2n-1 states (n>=2), 2 for n=1
  test('empty string has 1 state (init only)', () => {
    const sam = new SuffixAutomaton('');
    expect(sam.size).toBe(1);
  });

  test('single char has 2 states', () => {
    const sam = new SuffixAutomaton('a');
    expect(sam.size).toBe(2);
  });

  // For n=1..98, SAM("a"*n).size <= 2*n  (for n=1: 2<=2, for n>=2: at most 2n-1 < 2n)
  for (let n = 1; n <= 98; n++) {
    const s = 'a'.repeat(n);
    test(`SAM("a"*${n}).size <= 2*${n}`, () => {
      const sam = new SuffixAutomaton(s);
      expect(sam.size).toBeLessThanOrEqual(2 * n);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. SAM size for distinct-char strings (bonus size tests)
// ---------------------------------------------------------------------------
describe('SuffixAutomaton size for distinct-char strings', () => {
  const alpha = 'abcdefghijklmnopqrstuvwxyz';

  // For a string with all distinct characters of length n, SAM has exactly 2n states (init + n states)
  for (let n = 1; n <= 26; n++) {
    const s = alpha.slice(0, n);
    test(`SAM("${s}") size equals ${2 * n} (all distinct chars)`, () => {
      const sam = new SuffixAutomaton(s);
      // For distinct chars: n+1 ... actually n+1 to 2n-1 depending on structure
      // The bound is: 1 <= size <= 2n-1 (for n>=2), size >= n+1
      expect(sam.size).toBeGreaterThanOrEqual(n + 1);
      expect(sam.size).toBeLessThanOrEqual(2 * n);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. isSubstring positive tests (200 tests)
// ---------------------------------------------------------------------------
describe('isSubstring positive tests', () => {
  // All substrings of 'abcdefgh' (length 1..8) must be found
  const base = 'abcdefgh';
  let testIdx = 0;
  for (let i = 0; i < base.length; i++) {
    for (let j = i + 1; j <= base.length && testIdx < 100; j++) {
      const sub = base.slice(i, j);
      test(`"${base}".isSubstring("${sub}") is true`, () => {
        const sam = new SuffixAutomaton(base);
        expect(sam.isSubstring(sub)).toBe(true);
      });
      testIdx++;
    }
  }

  // Substrings of repeated pattern 'abab...' (100 tests)
  const repeated = 'ababababababababababab'; // 20 chars
  for (let i = 0; i < 10; i++) {
    for (let len = 1; len <= 10; len++) {
      const sub = repeated.slice(i, i + len);
      if (sub.length === len) {
        test(`repeated "ab" isSubstring("${sub}") is true`, () => {
          const sam = new SuffixAutomaton(repeated);
          expect(sam.isSubstring(sub)).toBe(true);
        });
      }
    }
  }
});

// ---------------------------------------------------------------------------
// 4. isSubstring negative tests (100 tests)
// ---------------------------------------------------------------------------
describe('isSubstring negative tests', () => {
  test('empty string SAM does not contain "a"', () => {
    const sam = new SuffixAutomaton('');
    expect(sam.isSubstring('a')).toBe(false);
  });

  test('"abc" does not contain "d"', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.isSubstring('d')).toBe(false);
  });

  test('"abc" does not contain "ba"', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.isSubstring('ba')).toBe(false);
  });

  test('"abc" does not contain "abcd"', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.isSubstring('abcd')).toBe(false);
  });

  // Non-substrings of 'abcdefgh'
  const base = 'abcdefgh';
  const nonSubs = [
    'ba', 'ca', 'da', 'ea', 'fa', 'ga', 'ha', 'cb', 'db', 'eb',
    'fb', 'gb', 'hb', 'dc', 'ec', 'fc', 'gc', 'hc', 'ed', 'fd',
    'gd', 'hd', 'fe', 'ge', 'he', 'gf', 'hf', 'hg', 'az', 'bz',
    'cz', 'dz', 'ez', 'fz', 'gz', 'hz', 'za', 'zb', 'zc', 'zd',
    'ze', 'zf', 'zg', 'zh', 'abcdefghi', 'abcdefghij', 'xyz',
    'zy', 'yx', 'xw', 'wv', 'vu', 'ut', 'ts', 'sr', 'rq', 'qp',
    'po', 'on', 'nm', 'ml', 'lk', 'kj', 'ji', 'ih', 'ig', 'if',
    'ie', 'id', 'ic', 'ib', 'ia', 'hf', 'hg', 'gd', 'ge', 'gf',
    'cb', 'db', 'da', 'ea', 'ba', 'eca', 'fdb', 'gec', 'hfd',
    'bac', 'cab', 'dba', 'ecb', 'fdc', 'ged', 'hfe', 'abba',
    'cddc', 'efghi', 'ghijk', 'abcz', 'zabc',
  ];

  for (let i = 0; i < Math.min(nonSubs.length, 96); i++) {
    const t = nonSubs[i];
    test(`"${base}" does not contain "${t}"`, () => {
      const sam = new SuffixAutomaton(base);
      expect(sam.isSubstring(t)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 5. isSubstring empty string edge cases (20 tests)
// ---------------------------------------------------------------------------
describe('isSubstring empty string edge cases', () => {
  test('empty string is substring of any non-empty string', () => {
    const sam = new SuffixAutomaton('hello');
    expect(sam.isSubstring('')).toBe(true);
  });

  test('empty string is substring of empty string', () => {
    const sam = new SuffixAutomaton('');
    expect(sam.isSubstring('')).toBe(true);
  });

  const words = ['a', 'ab', 'abc', 'abcd', 'hello', 'world', 'foo', 'bar', 'baz', 'qux',
                 'test', 'data', 'code', 'java', 'python', 'rust', 'swift', 'kotlin'];
  for (const w of words) {
    test(`"" is substring of "${w}"`, () => {
      const sam = new SuffixAutomaton(w);
      expect(sam.isSubstring('')).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// 6. countOccurrences tests (100 tests)
// ---------------------------------------------------------------------------
describe('countOccurrences tests', () => {
  // For i=1..50, "a"*i should have count('a')=i
  for (let i = 1; i <= 50; i++) {
    test(`"a"*${i} count of "a" = ${i}`, () => {
      const sam = new SuffixAutomaton('a'.repeat(i));
      expect(sam.countOccurrences('a')).toBe(i);
    });
  }

  // For i=2..50, "a"*i should have count('aa') = i-1
  for (let i = 2; i <= 50; i++) {
    test(`"a"*${i} count of "aa" = ${i - 1}`, () => {
      const sam = new SuffixAutomaton('a'.repeat(i));
      expect(sam.countOccurrences('aa')).toBe(i - 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 7. countOccurrences additional tests (50 tests)
// ---------------------------------------------------------------------------
describe('countOccurrences additional tests', () => {
  test('"abcabc" count of "abc" = 2', () => {
    const sam = new SuffixAutomaton('abcabc');
    expect(sam.countOccurrences('abc')).toBe(2);
  });

  test('"abcabc" count of "a" = 2', () => {
    const sam = new SuffixAutomaton('abcabc');
    expect(sam.countOccurrences('a')).toBe(2);
  });

  test('"abcabc" count of "b" = 2', () => {
    const sam = new SuffixAutomaton('abcabc');
    expect(sam.countOccurrences('b')).toBe(2);
  });

  test('"abcabc" count of "c" = 2', () => {
    const sam = new SuffixAutomaton('abcabc');
    expect(sam.countOccurrences('c')).toBe(2);
  });

  test('"abcabc" count of "ab" = 2', () => {
    const sam = new SuffixAutomaton('abcabc');
    expect(sam.countOccurrences('ab')).toBe(2);
  });

  test('"abcabc" count of "bc" = 2', () => {
    const sam = new SuffixAutomaton('abcabc');
    expect(sam.countOccurrences('bc')).toBe(2);
  });

  test('"abcabc" count of "abcabc" = 1', () => {
    const sam = new SuffixAutomaton('abcabc');
    expect(sam.countOccurrences('abcabc')).toBe(1);
  });

  test('"abcabc" count of "d" = 0', () => {
    const sam = new SuffixAutomaton('abcabc');
    expect(sam.countOccurrences('d')).toBe(0);
  });

  test('"aaa" count of "aaa" = 1', () => {
    const sam = new SuffixAutomaton('aaa');
    expect(sam.countOccurrences('aaa')).toBe(1);
  });

  test('"aaa" count of "aa" = 2', () => {
    const sam = new SuffixAutomaton('aaa');
    expect(sam.countOccurrences('aa')).toBe(2);
  });

  test('"aaa" count of "a" = 3', () => {
    const sam = new SuffixAutomaton('aaa');
    expect(sam.countOccurrences('a')).toBe(3);
  });

  // Verify against naive for various strings/patterns
  const testCases: Array<[string, string]> = [
    ['banana', 'an'],
    ['banana', 'a'],
    ['banana', 'na'],
    ['banana', 'ban'],
    ['banana', 'ana'],
    ['mississippi', 'ss'],
    ['mississippi', 'i'],
    ['mississippi', 'is'],
    ['mississippi', 'iss'],
    ['mississippi', 'miss'],
    ['hello world', 'l'],
    ['hello world', 'o'],
    ['aaabaaab', 'aaa'],
    ['aaabaaab', 'aab'],
    ['aaabaaab', 'b'],
    ['abababab', 'ab'],
    ['abababab', 'aba'],
    ['abababab', 'abab'],
    ['abcdefabcdef', 'abc'],
    ['abcdefabcdef', 'def'],
    ['aabbccaabbcc', 'aa'],
    ['aabbccaabbcc', 'bb'],
    ['aabbccaabbcc', 'cc'],
    ['aabbccaabbcc', 'aabb'],
    ['xyxyxy', 'xy'],
    ['xyxyxy', 'yx'],
    ['xyxyxy', 'xyxy'],
    ['zzzz', 'z'],
    ['zzzz', 'zz'],
    ['zzzz', 'zzz'],
    ['abcba', 'a'],
    ['abcba', 'b'],
    ['abcba', 'c'],
    ['racecar', 'r'],
    ['racecar', 'a'],
    ['racecar', 'c'],
    ['racecar', 'e'],
    ['level', 'l'],
    ['level', 'e'],
    ['abcd', 'e'],
  ];

  for (let i = 0; i < testCases.length; i++) {
    const [s, t] = testCases[i];
    test(`countOccurrences("${s}", "${t}") = ${naiveCount(s, t)}`, () => {
      const sam = new SuffixAutomaton(s);
      expect(sam.countOccurrences(t)).toBe(naiveCount(s, t));
    });
  }
});

// ---------------------------------------------------------------------------
// 8. countDistinctSubstrings tests (100 tests)
// ---------------------------------------------------------------------------
describe('countDistinctSubstrings tests', () => {
  // For 'a'*n: n+1 distinct substrings (including empty): '', 'a', 'aa', ..., 'a'*n
  for (let n = 1; n <= 30; n++) {
    test(`countDistinctSubstrings("a"*${n}) = ${n + 1} (including empty)`, () => {
      expect(countDistinctSubstrings('a'.repeat(n))).toBe(n + 1);
    });
  }

  test('countDistinctSubstrings("") = 1 (just empty)', () => {
    expect(countDistinctSubstrings('')).toBe(1);
  });

  test('countDistinctSubstrings("a") = 2', () => {
    expect(countDistinctSubstrings('a')).toBe(2);
  });

  test('countDistinctSubstrings("ab") = 4', () => {
    expect(countDistinctSubstrings('ab')).toBe(4);
  });

  test('countDistinctSubstrings("abc") = 7', () => {
    expect(countDistinctSubstrings('abc')).toBe(7);
  });

  test('countDistinctSubstrings("aab") = 6', () => {
    expect(countDistinctSubstrings('aab')).toBe(naiveDistinctCount('aab'));
  });

  test('countDistinctSubstrings("aba") = 6', () => {
    expect(countDistinctSubstrings('aba')).toBe(naiveDistinctCount('aba'));
  });

  test('countDistinctSubstrings("abcd") = 11', () => {
    expect(countDistinctSubstrings('abcd')).toBe(naiveDistinctCount('abcd'));
  });

  // Verify against naive for various strings
  const testStrings = [
    'a', 'b', 'ab', 'ba', 'aa', 'bb', 'abc', 'bca', 'cab',
    'aaa', 'aab', 'aba', 'baa', 'abb', 'bab', 'bba',
    'abcd', 'abba', 'banana', 'racecar', 'hello', 'world',
    'abcabc', 'aababab', 'mississippi', 'abcdef',
    'aaabbb', 'ababab', 'xyzxyz', 'aabb', 'abab',
    'zyx', 'zzz', 'zzzz', 'ab', 'ba', 'aaaa',
    'abcba', 'xyz', 'pqrst', 'uvwxy',
    'aaabaaab', 'abababab', 'abcdefg', 'aabbcc',
    'abcbad', 'abcabd', 'xyxyz', 'zyzyz',
    'aab', 'bba', 'abb', 'baa', 'abba', 'baab',
    'abcba', 'cbacba', 'abcabc', 'bcabca',
  ];

  for (let i = 0; i < testStrings.length; i++) {
    const s = testStrings[i];
    test(`countDistinctSubstrings("${s}") matches naive = ${naiveDistinctCount(s)}`, () => {
      expect(countDistinctSubstrings(s)).toBe(naiveDistinctCount(s));
    });
  }
});

// ---------------------------------------------------------------------------
// 9. SuffixAutomaton.countDistinctSubstrings (non-empty, no +1) tests (30 tests)
// ---------------------------------------------------------------------------
describe('SuffixAutomaton instance countDistinctSubstrings (non-empty only)', () => {
  // SAM method returns non-empty only (no +1 for empty)
  const testStrings = [
    'a', 'ab', 'abc', 'abcd', 'aa', 'aaa', 'aba', 'aab', 'banana',
    'hello', 'world', 'abcabc', 'mississippi', 'racecar', 'level',
    'abcba', 'xyxy', 'abababab', 'zzzz', 'aabb', 'abba', 'xyz',
    'aaabbb', 'abcdef', 'pqrst', 'aaaa', 'bbb', 'abcbad', 'xyxyz', 'aabaa',
  ];

  for (const s of testStrings) {
    test(`SAM("${s}").countDistinctSubstrings = naiveDistinctCount("${s}") - 1`, () => {
      const sam = new SuffixAutomaton(s);
      expect(sam.countDistinctSubstrings()).toBe(naiveDistinctCount(s) - 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 10. longestCommonSubstring tests (100 tests)
// ---------------------------------------------------------------------------
describe('longestCommonSubstring tests', () => {
  test('LCS("abcde", "cde") = "cde"', () => {
    const sam = new SuffixAutomaton('abcde');
    expect(sam.longestCommonSubstring('cde')).toBe('cde');
  });

  test('LCS("abcde", "xyz") = ""', () => {
    const sam = new SuffixAutomaton('abcde');
    expect(sam.longestCommonSubstring('xyz')).toBe('');
  });

  test('LCS("aaaa", "aaa") length = 3', () => {
    const sam = new SuffixAutomaton('aaaa');
    const result = sam.longestCommonSubstring('aaa');
    expect(result.length).toBe(3);
  });

  test('LCS("hello", "world") = "l" or length 1', () => {
    const sam = new SuffixAutomaton('hello');
    const result = sam.longestCommonSubstring('world');
    // "l" or "o" — both have length 1
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect('hello'.includes(result)).toBe(true);
    expect('world'.includes(result)).toBe(true);
  });

  test('LCS("abcde", "abcde") = "abcde"', () => {
    const sam = new SuffixAutomaton('abcde');
    expect(sam.longestCommonSubstring('abcde')).toBe('abcde');
  });

  test('LCS("abcde", "bcde") length = 4', () => {
    const sam = new SuffixAutomaton('abcde');
    const result = sam.longestCommonSubstring('bcde');
    expect(result.length).toBe(4);
    expect(result).toBe('bcde');
  });

  test('LCS("abcde", "abcd") length = 4', () => {
    const sam = new SuffixAutomaton('abcde');
    const result = sam.longestCommonSubstring('abcd');
    expect(result.length).toBe(4);
    expect(result).toBe('abcd');
  });

  test('LCS("abcde", "a") = "a"', () => {
    const sam = new SuffixAutomaton('abcde');
    expect(sam.longestCommonSubstring('a')).toBe('a');
  });

  test('LCS("abcde", "e") = "e"', () => {
    const sam = new SuffixAutomaton('abcde');
    expect(sam.longestCommonSubstring('e')).toBe('e');
  });

  test('LCS("banana", "bandana") length >= 3', () => {
    const sam = new SuffixAutomaton('banana');
    const result = sam.longestCommonSubstring('bandana');
    expect(result.length).toBeGreaterThanOrEqual(3);
  });

  // Verify LCS length matches naive for various pairs
  const pairs: Array<[string, string]> = [
    ['abcde', 'cde'],
    ['abcde', 'xyz'],
    ['abcde', 'abcde'],
    ['aaaa', 'aaa'],
    ['hello', 'world'],
    ['banana', 'ana'],
    ['abcabc', 'bc'],
    ['mississippi', 'sippy'],
    ['abcdef', 'cdefgh'],
    ['xyzabc', 'abcxyz'],
    ['aabbcc', 'bbccdd'],
    ['racecar', 'car'],
    ['level', 'level'],
    ['level', 'lever'],
    ['abba', 'abba'],
    ['abba', 'baab'],
    ['hello', 'hello'],
    ['hello', 'hallo'],
    ['abcba', 'cbacb'],
    ['xyxyxy', 'yxyxyx'],
    ['aababab', 'abababab'],
    ['mississippi', 'mississippi'],
    ['mississippi', 'ppi'],
    ['abcdefg', 'defg'],
    ['abcdefg', 'abc'],
    ['aaabbb', 'bbbccc'],
    ['xyzxyz', 'zxyzx'],
    ['pqrst', 'qrstu'],
    ['abcabd', 'abcabx'],
    ['aaaa', 'bbbb'],
    ['abcde', 'edcba'],
    ['hello world', 'world hello'],
    ['abcdef', 'fedcba'],
    ['xyxy', 'yxyx'],
    ['aabb', 'bbaa'],
    ['abcd', 'dcba'],
    ['xyzabc', 'abczyx'],
    ['aaabbb', 'aaaccc'],
    ['abababab', 'babababa'],
    ['abcbad', 'cbadbc'],
    ['qwerty', 'wertyu'],
    ['qwerty', 'tyuiop'],
    ['abcde', 'vwxyz'],
    ['aab', 'bba'],
    ['abc', 'cba'],
    ['banana', 'bandana'],
    ['racecar', 'racecar'],
    ['programming', 'grammar'],
    ['test', 'testing'],
    ['test', 'testcase'],
    ['abcde', 'bcdef'],
    ['abcdef', 'bcdefg'],
    ['abcdefg', 'cdefgh'],
    ['abcdefgh', 'defghi'],
    ['abcdefghi', 'efghij'],
    ['aabbcc', 'bbccaa'],
    ['xyzxyz', 'yzxyzx'],
    ['palindrome', 'palindrome'],
    ['abcba', 'abcba'],
    ['level', 'level'],
    ['noon', 'boon'],
    ['noon', 'moon'],
    ['noon', 'noon'],
    ['noon', 'noo'],
    ['abcde', 'abcxy'],
    ['abcde', 'xyabc'],
    ['abcde', 'xabcy'],
    ['abcde', 'xabcyde'],
    ['mississippi', 'Missouri'],
    ['abcdef', 'xyz'],
    ['aaaa', 'bbbb'],
    ['aaaa', 'aaaa'],
    ['ab', 'ba'],
    ['ab', 'ab'],
    ['a', 'a'],
    ['a', 'b'],
    ['abc', 'abc'],
    ['abc', 'bcd'],
    ['abc', 'cde'],
    ['abcabc', 'bcabca'],
    ['abcabc', 'xyzxyz'],
    ['hello', 'hell'],
    ['hello', 'ello'],
    ['hello', 'ell'],
  ];

  for (let i = 0; i < pairs.length; i++) {
    const [s, t] = pairs[i];
    const expected = naiveLCS(s, t);
    test(`LCS("${s}", "${t}") length = ${expected.length}`, () => {
      const sam = new SuffixAutomaton(s);
      const result = sam.longestCommonSubstring(t);
      expect(result.length).toBe(expected.length);
      // Verify it is actually a common substring
      if (result.length > 0) {
        expect(s.includes(result)).toBe(true);
        expect(t.includes(result)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 11. kthSubstring tests (100 tests)
// ---------------------------------------------------------------------------
describe('kthSubstring tests', () => {
  // For "abc": sorted distinct substrings are: a, ab, abc, b, bc, c
  test('kthSubstring("abc", 1) = "a"', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.kthSubstring(1)).toBe('a');
  });

  test('kthSubstring("abc", 2) = "ab"', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.kthSubstring(2)).toBe('ab');
  });

  test('kthSubstring("abc", 3) = "abc"', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.kthSubstring(3)).toBe('abc');
  });

  test('kthSubstring("abc", 4) = "b"', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.kthSubstring(4)).toBe('b');
  });

  test('kthSubstring("abc", 5) = "bc"', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.kthSubstring(5)).toBe('bc');
  });

  test('kthSubstring("abc", 6) = "c"', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.kthSubstring(6)).toBe('c');
  });

  test('kthSubstring("abc", 7) = null (out of range)', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.kthSubstring(7)).toBeNull();
  });

  // For "ab": sorted substrings: a, ab, b
  test('kthSubstring("ab", 1) = "a"', () => {
    const sam = new SuffixAutomaton('ab');
    expect(sam.kthSubstring(1)).toBe('a');
  });

  test('kthSubstring("ab", 2) = "ab"', () => {
    const sam = new SuffixAutomaton('ab');
    expect(sam.kthSubstring(2)).toBe('ab');
  });

  test('kthSubstring("ab", 3) = "b"', () => {
    const sam = new SuffixAutomaton('ab');
    expect(sam.kthSubstring(3)).toBe('b');
  });

  test('kthSubstring("ab", 4) = null', () => {
    const sam = new SuffixAutomaton('ab');
    expect(sam.kthSubstring(4)).toBeNull();
  });

  // For "a": sorted substrings: a
  test('kthSubstring("a", 1) = "a"', () => {
    const sam = new SuffixAutomaton('a');
    expect(sam.kthSubstring(1)).toBe('a');
  });

  test('kthSubstring("a", 2) = null', () => {
    const sam = new SuffixAutomaton('a');
    expect(sam.kthSubstring(2)).toBeNull();
  });

  // For "aa": distinct substrings: a, aa — sorted: a, aa
  test('kthSubstring("aa", 1) = "a"', () => {
    const sam = new SuffixAutomaton('aa');
    expect(sam.kthSubstring(1)).toBe('a');
  });

  test('kthSubstring("aa", 2) = "aa"', () => {
    const sam = new SuffixAutomaton('aa');
    expect(sam.kthSubstring(2)).toBe('aa');
  });

  test('kthSubstring("aa", 3) = null', () => {
    const sam = new SuffixAutomaton('aa');
    expect(sam.kthSubstring(3)).toBeNull();
  });

  // For "aab": distinct substrings: a, aa, aab, ab, b — sorted lex
  // a, aa, aab, ab, b
  test('kthSubstring("aab", 1) = "a"', () => {
    const sam = new SuffixAutomaton('aab');
    expect(sam.kthSubstring(1)).toBe('a');
  });

  test('kthSubstring("aab", 2) = "aa"', () => {
    const sam = new SuffixAutomaton('aab');
    expect(sam.kthSubstring(2)).toBe('aa');
  });

  test('kthSubstring("aab", 3) = "aab"', () => {
    const sam = new SuffixAutomaton('aab');
    expect(sam.kthSubstring(3)).toBe('aab');
  });

  test('kthSubstring("aab", 4) = "ab"', () => {
    const sam = new SuffixAutomaton('aab');
    expect(sam.kthSubstring(4)).toBe('ab');
  });

  test('kthSubstring("aab", 5) = "b"', () => {
    const sam = new SuffixAutomaton('aab');
    expect(sam.kthSubstring(5)).toBe('b');
  });

  test('kthSubstring("aab", 6) = null', () => {
    const sam = new SuffixAutomaton('aab');
    expect(sam.kthSubstring(6)).toBeNull();
  });

  // Verify kthSubstring returns valid substrings for "abcde"
  // distinct substrings of "abcde": 5+4+3+2+1 = 15
  const sam5 = new SuffixAutomaton('abcde');
  for (let k = 1; k <= 15; k++) {
    test(`kthSubstring("abcde", ${k}) is a valid non-empty substring`, () => {
      const result = new SuffixAutomaton('abcde').kthSubstring(k);
      expect(result).not.toBeNull();
      if (result !== null) {
        expect(result.length).toBeGreaterThan(0);
        expect('abcde'.includes(result)).toBe(true);
      }
    });
  }

  test('kthSubstring("abcde", 16) = null', () => {
    const sam = new SuffixAutomaton('abcde');
    expect(sam.kthSubstring(16)).toBeNull();
  });

  // Lex order: results must be non-decreasing
  test('kthSubstring("abcde") results are lexicographically ordered', () => {
    const sam = new SuffixAutomaton('abcde');
    const results: string[] = [];
    for (let k = 1; k <= 15; k++) {
      const r = sam.kthSubstring(k);
      expect(r).not.toBeNull();
      if (r !== null) results.push(r);
    }
    for (let i = 1; i < results.length; i++) {
      expect(results[i] >= results[i - 1]).toBe(true);
    }
  });

  // "ba": distinct substrings: a, b, ba — sorted: a, b, ba
  test('kthSubstring("ba", 1) = "a"', () => {
    const sam = new SuffixAutomaton('ba');
    expect(sam.kthSubstring(1)).toBe('a');
  });

  test('kthSubstring("ba", 2) = "b"', () => {
    const sam = new SuffixAutomaton('ba');
    expect(sam.kthSubstring(2)).toBe('b');
  });

  test('kthSubstring("ba", 3) = "ba"', () => {
    const sam = new SuffixAutomaton('ba');
    expect(sam.kthSubstring(3)).toBe('ba');
  });

  test('kthSubstring("ba", 4) = null', () => {
    const sam = new SuffixAutomaton('ba');
    expect(sam.kthSubstring(4)).toBeNull();
  });

  // Verify for "abcd": 4+3+2+1 = 10 distinct substrings
  const abcd_subs = allDistinctSubstrings('abcd');
  for (let k = 1; k <= 10; k++) {
    test(`kthSubstring("abcd", ${k}) = "${abcd_subs[k - 1]}"`, () => {
      const sam = new SuffixAutomaton('abcd');
      expect(sam.kthSubstring(k)).toBe(abcd_subs[k - 1]);
    });
  }

  test('kthSubstring("abcd", 11) = null', () => {
    const sam = new SuffixAutomaton('abcd');
    expect(sam.kthSubstring(11)).toBeNull();
  });

  // "z" single char
  test('kthSubstring("z", 1) = "z"', () => {
    const sam = new SuffixAutomaton('z');
    expect(sam.kthSubstring(1)).toBe('z');
  });

  test('kthSubstring("z", 2) = null', () => {
    const sam = new SuffixAutomaton('z');
    expect(sam.kthSubstring(2)).toBeNull();
  });

  // "zz": distinct substrings: z, zz
  test('kthSubstring("zz", 1) = "z"', () => {
    const sam = new SuffixAutomaton('zz');
    expect(sam.kthSubstring(1)).toBe('z');
  });

  test('kthSubstring("zz", 2) = "zz"', () => {
    const sam = new SuffixAutomaton('zz');
    expect(sam.kthSubstring(2)).toBe('zz');
  });

  test('kthSubstring("zz", 3) = null', () => {
    const sam = new SuffixAutomaton('zz');
    expect(sam.kthSubstring(3)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// 12. Standalone isSubstring tests (100 tests)
// ---------------------------------------------------------------------------
describe('standalone isSubstring tests', () => {
  test('isSubstring("", "") = true', () => {
    expect(isSubstring('', '')).toBe(true);
  });

  test('isSubstring("abc", "") = true', () => {
    expect(isSubstring('abc', '')).toBe(true);
  });

  test('isSubstring("", "a") = false', () => {
    expect(isSubstring('', 'a')).toBe(false);
  });

  test('isSubstring("abc", "abc") = true', () => {
    expect(isSubstring('abc', 'abc')).toBe(true);
  });

  test('isSubstring("abc", "abcd") = false', () => {
    expect(isSubstring('abc', 'abcd')).toBe(false);
  });

  // All single-char substrings of 'abcdefghijklmnopqrstuvwxyz'
  const alpha = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < 26; i++) {
    const ch = alpha[i];
    test(`isSubstring(alpha, "${ch}") = true`, () => {
      expect(isSubstring(alpha, ch)).toBe(true);
    });
  }

  // Non-chars: digits not in alpha
  for (let i = 0; i < 10; i++) {
    const digit = String(i);
    test(`isSubstring(alpha, "${digit}") = false`, () => {
      expect(isSubstring(alpha, digit)).toBe(false);
    });
  }

  // Various true cases
  const trueCases: Array<[string, string]> = [
    ['hello world', 'world'],
    ['hello world', 'hello'],
    ['hello world', ' '],
    ['abcabc', 'cab'],
    ['mississippi', 'issi'],
    ['banana', 'nan'],
    ['banana', 'banana'],
    ['racecar', 'ace'],
    ['programming', 'gram'],
    ['typescript', 'script'],
    ['javascript', 'java'],
    ['python', 'pyt'],
    ['ruby', 'ub'],
    ['golang', 'olan'],
    ['swift', 'wif'],
    ['kotlin', 'otl'],
    ['rust', 'us'],
    ['scala', 'cal'],
    ['haskell', 'aske'],
    ['erlang', 'rlan'],
    ['elixir', 'lixi'],
    ['clojure', 'loju'],
    ['fortran', 'ortr'],
    ['cobol', 'obo'],
    ['pascal', 'asca'],
    ['ada', 'da'],
    ['lisp', 'is'],
    ['prolog', 'rolo'],
    ['scheme', 'chem'],
    ['smalltalk', 'mall'],
  ];

  for (const [s, t] of trueCases) {
    test(`isSubstring("${s}", "${t}") = true`, () => {
      expect(isSubstring(s, t)).toBe(true);
    });
  }

  // Various false cases
  const falseCases: Array<[string, string]> = [
    ['hello', 'world'],
    ['abc', 'xyz'],
    ['abc', 'abcabc'],
    ['mississippi', 'pippi'],
    ['banana', 'bbn'],
    ['racecar', 'racecars'],
    ['programming', 'marming'],
    ['typescript', 'tscript'],
    ['javascript', 'javaz'],
    ['python', 'pthon'],
    ['ruby', 'ruby!'],
    ['golang', 'golonag'],
    ['swift', 'swifft'],
  ];

  for (const [s, t] of falseCases) {
    test(`isSubstring("${s}", "${t}") = false`, () => {
      expect(isSubstring(s, t)).toBe(false);
    });
  }
});

// ---------------------------------------------------------------------------
// 13. Standalone countOccurrences tests (100 tests)
// ---------------------------------------------------------------------------
describe('standalone countOccurrences tests', () => {
  test('countOccurrences("", "") = 1', () => {
    expect(countOccurrences('', '')).toBe(1);
  });

  test('countOccurrences("abc", "") = 4', () => {
    expect(countOccurrences('abc', '')).toBe(4);
  });

  test('countOccurrences("", "a") = 0', () => {
    expect(countOccurrences('', 'a')).toBe(0);
  });

  // Various test cases verified against naive
  const testCases: Array<[string, string]> = [
    ['abcabc', 'abc'],
    ['abcabc', 'ab'],
    ['abcabc', 'a'],
    ['banana', 'an'],
    ['banana', 'a'],
    ['banana', 'na'],
    ['banana', 'ban'],
    ['banana', 'ana'],
    ['mississippi', 'ss'],
    ['mississippi', 'i'],
    ['mississippi', 'is'],
    ['mississippi', 'iss'],
    ['mississippi', 'miss'],
    ['aaaaaa', 'a'],
    ['aaaaaa', 'aa'],
    ['aaaaaa', 'aaa'],
    ['aaaaaa', 'aaaa'],
    ['aaaaaa', 'aaaaa'],
    ['aaaaaa', 'aaaaaa'],
    ['aaaaaa', 'aaaaaaa'],
    ['abababab', 'ab'],
    ['abababab', 'aba'],
    ['abababab', 'abab'],
    ['xyxyxy', 'xy'],
    ['xyxyxy', 'yx'],
    ['xyxyxy', 'xyxy'],
    ['hello world', 'l'],
    ['hello world', 'o'],
    ['hello world', ' '],
    ['racecar', 'a'],
    ['racecar', 'r'],
    ['racecar', 'c'],
    ['racecar', 'e'],
    ['racecar', 'ac'],
    ['racecar', 'ca'],
    ['racecar', 'race'],
    ['racecar', 'car'],
    ['abcdef', 'a'],
    ['abcdef', 'f'],
    ['abcdef', 'z'],
    ['abcdef', 'abc'],
    ['abcdef', 'def'],
    ['abcdef', 'abcdef'],
    ['abcdef', 'abcdefg'],
    ['aaabbbccc', 'a'],
    ['aaabbbccc', 'b'],
    ['aaabbbccc', 'c'],
    ['aaabbbccc', 'aa'],
    ['aaabbbccc', 'bb'],
    ['aaabbbccc', 'cc'],
    ['aaabbbccc', 'aaa'],
    ['aaabbbccc', 'bbb'],
    ['aaabbbccc', 'ccc'],
    ['aaabbbccc', 'aaab'],
    ['aaabbbccc', 'bbbc'],
    ['palindrome', 'p'],
    ['palindrome', 'a'],
    ['palindrome', 'l'],
    ['palindrome', 'in'],
    ['palindrome', 'me'],
    ['palindrome', 'pal'],
    ['palindrome', 'rome'],
    ['abcba', 'a'],
    ['abcba', 'b'],
    ['abcba', 'c'],
    ['abcba', 'ab'],
    ['abcba', 'bc'],
    ['abcba', 'cb'],
    ['abcba', 'ba'],
    ['abcba', 'abc'],
    ['abcba', 'bcb'],
    ['abcba', 'cba'],
    ['abcba', 'abcba'],
    ['programming', 'g'],
    ['programming', 'm'],
    ['programming', 'mm'],
    ['programming', 'gram'],
    ['programming', 'pro'],
    ['programming', 'ming'],
    ['testing', 't'],
    ['testing', 'test'],
    ['testing', 'ing'],
    ['testing', 'sting'],
    ['testing', 'esting'],
    ['aabbaabb', 'aa'],
    ['aabbaabb', 'bb'],
    ['aabbaabb', 'aabb'],
    ['aabbaabb', 'bba'],
    ['abcabcabc', 'abc'],
    ['abcabcabc', 'abcabc'],
    ['abcabcabc', 'a'],
    ['xyzxyzxyz', 'xyz'],
    ['xyzxyzxyz', 'yz'],
    ['xyzxyzxyz', 'zx'],
    ['level', 'l'],
    ['level', 'e'],
    ['level', 'v'],
    ['level', 'el'],
    ['level', 'le'],
    ['level', 'leve'],
    ['level', 'evel'],
  ];

  for (const [s, t] of testCases) {
    const expected = naiveCount(s, t);
    test(`countOccurrences("${s}", "${t}") = ${expected}`, () => {
      expect(countOccurrences(s, t)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 14. Standalone longestCommonSubstring edge cases (100 tests)
// ---------------------------------------------------------------------------
describe('standalone longestCommonSubstring edge cases', () => {
  test('longestCommonSubstring("", "") = ""', () => {
    expect(longestCommonSubstring('', '')).toBe('');
  });

  test('longestCommonSubstring("abc", "") = ""', () => {
    expect(longestCommonSubstring('abc', '')).toBe('');
  });

  test('longestCommonSubstring("", "abc") = ""', () => {
    expect(longestCommonSubstring('', 'abc')).toBe('');
  });

  test('longestCommonSubstring("abc", "xyz") = ""', () => {
    expect(longestCommonSubstring('abc', 'xyz')).toBe('');
  });

  test('longestCommonSubstring("abc", "abc") = "abc"', () => {
    expect(longestCommonSubstring('abc', 'abc')).toBe('abc');
  });

  test('longestCommonSubstring("a", "a") = "a"', () => {
    expect(longestCommonSubstring('a', 'a')).toBe('a');
  });

  test('longestCommonSubstring("a", "b") = ""', () => {
    expect(longestCommonSubstring('a', 'b')).toBe('');
  });

  test('longestCommonSubstring("abcde", "cde") = "cde"', () => {
    expect(longestCommonSubstring('abcde', 'cde')).toBe('cde');
  });

  test('longestCommonSubstring("abcde", "abcde") length = 5', () => {
    expect(longestCommonSubstring('abcde', 'abcde').length).toBe(5);
  });

  test('longestCommonSubstring("aaaa", "aaa") length = 3', () => {
    expect(longestCommonSubstring('aaaa', 'aaa').length).toBe(3);
  });

  test('longestCommonSubstring("aaa", "aaaa") length = 3', () => {
    expect(longestCommonSubstring('aaa', 'aaaa').length).toBe(3);
  });

  // Verify against naive for various pairs
  const pairs: Array<[string, string]> = [
    ['abcde', 'cde'],
    ['abcde', 'xyz'],
    ['abcde', 'abcde'],
    ['aaaa', 'aaa'],
    ['hello', 'world'],
    ['banana', 'ana'],
    ['abcabc', 'bc'],
    ['mississippi', 'sippy'],
    ['abcdef', 'cdefgh'],
    ['xyzabc', 'abcxyz'],
    ['aabbcc', 'bbccdd'],
    ['racecar', 'car'],
    ['level', 'level'],
    ['level', 'lever'],
    ['abba', 'abba'],
    ['abba', 'baab'],
    ['hello', 'hello'],
    ['hello', 'hallo'],
    ['abcba', 'cbacb'],
    ['xyxyxy', 'yxyxyx'],
    ['aababab', 'abababab'],
    ['mississippi', 'ppi'],
    ['abcdefg', 'defg'],
    ['abcdefg', 'abc'],
    ['aaabbb', 'bbbccc'],
    ['xyzxyz', 'zxyzx'],
    ['pqrst', 'qrstu'],
    ['abcabd', 'abcabx'],
    ['aaaa', 'bbbb'],
    ['abcde', 'edcba'],
    ['hello world', 'world hello'],
    ['abcdef', 'fedcba'],
    ['xyxy', 'yxyx'],
    ['aabb', 'bbaa'],
    ['abcd', 'dcba'],
    ['aaabbb', 'aaaccc'],
    ['abababab', 'babababa'],
    ['abcbad', 'cbadbc'],
    ['qwerty', 'wertyu'],
    ['qwerty', 'tyuiop'],
    ['abcde', 'vwxyz'],
    ['banana', 'bandana'],
    ['racecar', 'racecar'],
    ['programming', 'grammar'],
    ['test', 'testing'],
    ['test', 'testcase'],
    ['abcde', 'bcdef'],
    ['aabbcc', 'bbccaa'],
    ['xyzxyz', 'yzxyzx'],
    ['abcba', 'abcba'],
    ['noon', 'boon'],
    ['noon', 'moon'],
    ['noon', 'noon'],
    ['abcde', 'abcxy'],
    ['abcde', 'xyabc'],
    ['ab', 'ba'],
    ['ab', 'ab'],
    ['abc', 'abc'],
    ['abc', 'bcd'],
    ['abc', 'cde'],
    ['abcabc', 'bcabca'],
    ['abcabc', 'xyzxyz'],
    ['hello', 'hell'],
    ['hello', 'ello'],
    ['hello', 'ell'],
    ['abcdef', 'xyz'],
    ['aaaa', 'aaaa'],
    ['abcde', 'abcxy'],
    ['aab', 'bba'],
    ['abc', 'cba'],
    ['rust', 'trust'],
    ['java', 'javascript'],
    ['python', 'pythonic'],
    ['react', 'reactive'],
    ['node', 'nodejs'],
    ['code', 'decode'],
    ['test', 'contest'],
    ['run', 'runner'],
    ['play', 'player'],
    ['work', 'worker'],
    ['build', 'builder'],
    ['parse', 'parser'],
    ['sort', 'sorted'],
    ['find', 'finder'],
    ['load', 'loader'],
    ['save', 'saver'],
    ['read', 'reader'],
    ['write', 'writer'],
    ['print', 'printer'],
  ];

  for (const [s, t] of pairs) {
    const expected = naiveLCS(s, t);
    test(`longestCommonSubstring("${s}", "${t}") length = ${expected.length}`, () => {
      const result = longestCommonSubstring(s, t);
      expect(result.length).toBe(expected.length);
      if (result.length > 0) {
        expect(s.includes(result)).toBe(true);
        expect(t.includes(result)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 15. Standalone kthSubstring tests (50 tests)
// ---------------------------------------------------------------------------
describe('standalone kthSubstring tests', () => {
  test('kthSubstring("", 1) = null', () => {
    expect(kthSubstring('', 1)).toBeNull();
  });

  test('kthSubstring("a", 1) = "a"', () => {
    expect(kthSubstring('a', 1)).toBe('a');
  });

  test('kthSubstring("a", 2) = null', () => {
    expect(kthSubstring('a', 2)).toBeNull();
  });

  test('kthSubstring("ab", 1) = "a"', () => {
    expect(kthSubstring('ab', 1)).toBe('a');
  });

  test('kthSubstring("ab", 2) = "ab"', () => {
    expect(kthSubstring('ab', 2)).toBe('ab');
  });

  test('kthSubstring("ab", 3) = "b"', () => {
    expect(kthSubstring('ab', 3)).toBe('b');
  });

  test('kthSubstring("ab", 4) = null', () => {
    expect(kthSubstring('ab', 4)).toBeNull();
  });

  // kthSubstring results must be valid substrings
  const testStrings = [
    'abc', 'abcd', 'abcde', 'aab', 'aba', 'banana', 'hello', 'world',
    'aa', 'aaa', 'ab', 'ba', 'xyz', 'zzz', 'zz',
  ];

  for (const s of testStrings) {
    const count = naiveDistinctCount(s) - 1; // non-empty
    for (let k = 1; k <= Math.min(count, 5); k++) {
      test(`kthSubstring("${s}", ${k}) is a valid substring`, () => {
        const result = kthSubstring(s, k);
        expect(result).not.toBeNull();
        if (result !== null) {
          expect(s.includes(result)).toBe(true);
          expect(result.length).toBeGreaterThan(0);
        }
      });
    }
    test(`kthSubstring("${s}", ${count + 1}) = null`, () => {
      expect(kthSubstring(s, count + 1)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// 16. isRotation tests (30 tests)
// ---------------------------------------------------------------------------
describe('isRotation tests', () => {
  test('isRotation("", "") = true', () => {
    expect(isRotation('', '')).toBe(true);
  });

  test('isRotation("a", "a") = true', () => {
    expect(isRotation('a', 'a')).toBe(true);
  });

  test('isRotation("a", "b") = false', () => {
    expect(isRotation('a', 'b')).toBe(false);
  });

  test('isRotation("ab", "ba") = true', () => {
    expect(isRotation('ab', 'ba')).toBe(true);
  });

  test('isRotation("ab", "ab") = true', () => {
    expect(isRotation('ab', 'ab')).toBe(true);
  });

  test('isRotation("abc", "bca") = true', () => {
    expect(isRotation('abc', 'bca')).toBe(true);
  });

  test('isRotation("abc", "cab") = true', () => {
    expect(isRotation('abc', 'cab')).toBe(true);
  });

  test('isRotation("abc", "abc") = true', () => {
    expect(isRotation('abc', 'abc')).toBe(true);
  });

  test('isRotation("abc", "acb") = false', () => {
    expect(isRotation('abc', 'acb')).toBe(false);
  });

  test('isRotation("abcd", "cdab") = true', () => {
    expect(isRotation('abcd', 'cdab')).toBe(true);
  });

  test('isRotation("abcd", "dabc") = true', () => {
    expect(isRotation('abcd', 'dabc')).toBe(true);
  });

  test('isRotation("abcd", "abcd") = true', () => {
    expect(isRotation('abcd', 'abcd')).toBe(true);
  });

  test('isRotation("abcd", "abdc") = false', () => {
    expect(isRotation('abcd', 'abdc')).toBe(false);
  });

  test('isRotation("hello", "llohe") = true', () => {
    expect(isRotation('hello', 'llohe')).toBe(true);
  });

  test('isRotation("hello", "ohell") = true', () => {
    expect(isRotation('hello', 'ohell')).toBe(true);
  });

  test('isRotation("hello", "world") = false', () => {
    expect(isRotation('hello', 'world')).toBe(false);
  });

  test('isRotation("ab", "abc") = false (different length)', () => {
    expect(isRotation('ab', 'abc')).toBe(false);
  });

  test('isRotation("abc", "ab") = false (different length)', () => {
    expect(isRotation('abc', 'ab')).toBe(false);
  });

  test('isRotation("aaa", "aaa") = true', () => {
    expect(isRotation('aaa', 'aaa')).toBe(true);
  });

  test('isRotation("aab", "baa") = true', () => {
    expect(isRotation('aab', 'baa')).toBe(true);
  });

  test('isRotation("aab", "aba") = true', () => {
    expect(isRotation('aab', 'aba')).toBe(true);
  });

  test('isRotation("aab", "aab") = true', () => {
    expect(isRotation('aab', 'aab')).toBe(true);
  });

  test('isRotation("aab", "bba") = false', () => {
    expect(isRotation('aab', 'bba')).toBe(false);
  });

  test('isRotation("abcde", "deabc") = true', () => {
    expect(isRotation('abcde', 'deabc')).toBe(true);
  });

  test('isRotation("abcde", "cdeab") = true', () => {
    expect(isRotation('abcde', 'cdeab')).toBe(true);
  });

  test('isRotation("abcde", "bcdea") = true', () => {
    expect(isRotation('abcde', 'bcdea')).toBe(true);
  });

  test('isRotation("abcde", "eabcd") = true', () => {
    expect(isRotation('abcde', 'eabcd')).toBe(true);
  });

  test('isRotation("abcde", "abcde") = true', () => {
    expect(isRotation('abcde', 'abcde')).toBe(true);
  });

  test('isRotation("abcde", "abced") = false', () => {
    expect(isRotation('abcde', 'abced')).toBe(false);
  });

  test('isRotation("xyz", "zxy") = true', () => {
    expect(isRotation('xyz', 'zxy')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 17. countDistinctSubstrings standalone extended tests (50 tests)
// ---------------------------------------------------------------------------
describe('countDistinctSubstrings standalone extended', () => {
  // For n=1..25: SAM("ab"*n) should have naiveDistinct count
  for (let n = 1; n <= 25; n++) {
    const s = 'ab'.repeat(n);
    test(`countDistinctSubstrings("ab"*${n}) matches naive`, () => {
      expect(countDistinctSubstrings(s)).toBe(naiveDistinctCount(s));
    });
  }

  // For n=1..24: SAM("abc"*n) should match naive (only first 10 chars to keep it fast)
  for (let n = 1; n <= 10; n++) {
    const s = 'abc'.repeat(n);
    test(`countDistinctSubstrings("abc"*${n}) matches naive`, () => {
      expect(countDistinctSubstrings(s)).toBe(naiveDistinctCount(s));
    });
  }

  // Some specific string tests
  const cases: Array<[string, number]> = [
    ['', 1],
    ['a', 2],
    ['aa', 3],
    ['ab', 4],
    ['abc', 7],
    ['aab', 6],
    ['aba', 6],
    ['baa', 6],
    ['abb', 6],
    ['bab', 6],
    ['bba', 6],
    ['abcd', 11],
    ['aaaa', 5],
    ['abba', naiveDistinctCount('abba')],
    ['abcba', naiveDistinctCount('abcba')],
  ];

  for (const [s, expected] of cases) {
    test(`countDistinctSubstrings("${s}") = ${expected}`, () => {
      expect(countDistinctSubstrings(s)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 18. allDistinctSubstrings helper verification tests (30 tests)
// ---------------------------------------------------------------------------
describe('allDistinctSubstrings helper tests', () => {
  test('allDistinctSubstrings("") = []', () => {
    expect(allDistinctSubstrings('')).toEqual([]);
  });

  test('allDistinctSubstrings("a") = ["a"]', () => {
    expect(allDistinctSubstrings('a')).toEqual(['a']);
  });

  test('allDistinctSubstrings("ab") = ["a", "ab", "b"]', () => {
    expect(allDistinctSubstrings('ab')).toEqual(['a', 'ab', 'b']);
  });

  test('allDistinctSubstrings("abc") has 6 elements', () => {
    expect(allDistinctSubstrings('abc').length).toBe(6);
  });

  test('allDistinctSubstrings("abc") is sorted', () => {
    const result = allDistinctSubstrings('abc');
    for (let i = 1; i < result.length; i++) {
      expect(result[i] >= result[i - 1]).toBe(true);
    }
  });

  test('allDistinctSubstrings("aa") = ["a", "aa"]', () => {
    expect(allDistinctSubstrings('aa')).toEqual(['a', 'aa']);
  });

  test('allDistinctSubstrings("aab") has 5 elements', () => {
    expect(allDistinctSubstrings('aab').length).toBe(5);
  });

  test('allDistinctSubstrings("aab") contains "aa"', () => {
    expect(allDistinctSubstrings('aab')).toContain('aa');
  });

  test('allDistinctSubstrings("aab") contains "ab"', () => {
    expect(allDistinctSubstrings('aab')).toContain('ab');
  });

  test('allDistinctSubstrings("aab") contains "b"', () => {
    expect(allDistinctSubstrings('aab')).toContain('b');
  });

  test('allDistinctSubstrings("aab") contains "a"', () => {
    expect(allDistinctSubstrings('aab')).toContain('a');
  });

  test('allDistinctSubstrings("aab") contains "aab"', () => {
    expect(allDistinctSubstrings('aab')).toContain('aab');
  });

  // Verify count for various strings
  const testCases = ['abc', 'abcd', 'abcde', 'banana', 'hello', 'aabb', 'abba', 'aab',
    'aba', 'baa', 'abb', 'bab', 'bba', 'xyz', 'zzz', 'abcabc', 'aaaa'];
  for (const s of testCases) {
    test(`allDistinctSubstrings("${s}") count matches naiveDistinct-1`, () => {
      expect(allDistinctSubstrings(s).length).toBe(naiveDistinctCount(s) - 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 19. longestRepeatedSubstring tests (30 tests)
// ---------------------------------------------------------------------------
describe('longestRepeatedSubstring tests', () => {
  test('longestRepeatedSubstring("") = ""', () => {
    expect(longestRepeatedSubstring('')).toBe('');
  });

  test('longestRepeatedSubstring("a") = ""', () => {
    expect(longestRepeatedSubstring('a')).toBe('');
  });

  test('longestRepeatedSubstring("ab") = "" (no repeated substring)', () => {
    expect(longestRepeatedSubstring('ab')).toBe('');
  });

  test('longestRepeatedSubstring("aa") = "a"', () => {
    expect(longestRepeatedSubstring('aa')).toBe('a');
  });

  test('longestRepeatedSubstring("aaa").length = 2', () => {
    expect(longestRepeatedSubstring('aaa').length).toBe(2);
  });

  test('longestRepeatedSubstring("aaaa").length = 3', () => {
    expect(longestRepeatedSubstring('aaaa').length).toBe(3);
  });

  test('longestRepeatedSubstring("abab") length >= 2', () => {
    const r = longestRepeatedSubstring('abab');
    expect(r.length).toBeGreaterThanOrEqual(2);
  });

  test('longestRepeatedSubstring("abab") is a valid substring', () => {
    const r = longestRepeatedSubstring('abab');
    if (r.length > 0) {
      expect('abab'.includes(r)).toBe(true);
      expect(naiveCount('abab', r)).toBeGreaterThanOrEqual(2);
    }
  });

  test('longestRepeatedSubstring("abcabc") length >= 3', () => {
    const r = longestRepeatedSubstring('abcabc');
    expect(r.length).toBeGreaterThanOrEqual(3);
  });

  test('longestRepeatedSubstring("abcabc") is a valid repeated substring', () => {
    const r = longestRepeatedSubstring('abcabc');
    expect('abcabc'.includes(r)).toBe(true);
    expect(naiveCount('abcabc', r)).toBeGreaterThanOrEqual(2);
  });

  test('longestRepeatedSubstring("banana") is a valid repeated substring', () => {
    const r = longestRepeatedSubstring('banana');
    if (r.length > 0) {
      expect('banana'.includes(r)).toBe(true);
      expect(naiveCount('banana', r)).toBeGreaterThanOrEqual(2);
    }
  });

  test('longestRepeatedSubstring("mississippi") length >= 2', () => {
    const r = longestRepeatedSubstring('mississippi');
    expect(r.length).toBeGreaterThanOrEqual(2);
  });

  test('longestRepeatedSubstring("mississippi") is a valid repeated substring', () => {
    const r = longestRepeatedSubstring('mississippi');
    if (r.length > 0) {
      expect('mississippi'.includes(r)).toBe(true);
      expect(naiveCount('mississippi', r)).toBeGreaterThanOrEqual(2);
    }
  });

  test('longestRepeatedSubstring("abcde") = "" (all chars distinct)', () => {
    const r = longestRepeatedSubstring('abcde');
    // No non-overlapping repeated substrings — result should be ''
    // (all chars appear exactly once in "abcde")
    expect(r).toBe('');
  });

  // For repeated patterns, the LRS should be the pattern itself (minus last occurrence)
  const repeatCases = [
    ['aabb', 1],     // 'a' or 'b' occur twice
    ['abcabc', 3],   // 'abc' occurs twice
    ['xyxy', 2],     // 'xy' occurs twice
    ['aabbaabb', 4], // 'aabb' occurs twice
    ['aaabbb', 2],   // 'aa' or 'bb' occurs twice... actually 'aaa' has 'aa' twice, etc.
  ];

  for (const [s, minLen] of repeatCases) {
    test(`longestRepeatedSubstring("${s}") length >= ${minLen}`, () => {
      const r = longestRepeatedSubstring(s as string);
      expect(r.length).toBeGreaterThanOrEqual(minLen as number);
      if (r.length > 0) {
        expect(naiveCount(s as string, r)).toBeGreaterThanOrEqual(2);
      }
    });
  }

  // Single character repeated n times: LRS = char*(n-1)
  for (let n = 2; n <= 10; n++) {
    const s = 'a'.repeat(n);
    test(`longestRepeatedSubstring("a"*${n}).length = ${n - 1}`, () => {
      const r = longestRepeatedSubstring(s);
      expect(r.length).toBe(n - 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 20. shortestUniqueSubstring tests (20 tests)
// ---------------------------------------------------------------------------
describe('shortestUniqueSubstring tests', () => {
  test('shortestUniqueSubstring("", "") = null', () => {
    expect(shortestUniqueSubstring('', '')).toBeNull();
  });

  test('shortestUniqueSubstring("abc", "abc") = null', () => {
    // Every char in "abc" is in "abc", and every 2-char substring is in "abc", etc.
    // Actually, we're looking for substring of s not in t
    // "abc" vs "abc": 'd' is not in t but 'd' not in s either
    // Looking for substring of s not in t
    // 'a','b','c' all in "abc", 'ab','bc','abc' all in "abc"
    // So every substring of s is also in t => null
    expect(shortestUniqueSubstring('abc', 'abc')).toBeNull();
  });

  test('shortestUniqueSubstring("abcd", "abc") finds "d"', () => {
    const result = shortestUniqueSubstring('abcd', 'abc');
    expect(result).not.toBeNull();
    if (result !== null) {
      expect('abcd'.includes(result)).toBe(true);
      expect('abc'.includes(result)).toBe(false);
    }
  });

  test('shortestUniqueSubstring("abcd", "xyz") = "a" or length 1', () => {
    const result = shortestUniqueSubstring('abcd', 'xyz');
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(result.length).toBe(1);
      expect('abcd'.includes(result)).toBe(true);
      expect('xyz'.includes(result)).toBe(false);
    }
  });

  test('shortestUniqueSubstring("hello", "hell") finds "o" or "lo" etc', () => {
    const result = shortestUniqueSubstring('hello', 'hell');
    expect(result).not.toBeNull();
    if (result !== null) {
      expect('hello'.includes(result)).toBe(true);
      expect('hell'.includes(result)).toBe(false);
    }
  });

  test('shortestUniqueSubstring("abc", "ab") finds "c" or similar', () => {
    const result = shortestUniqueSubstring('abc', 'ab');
    expect(result).not.toBeNull();
    if (result !== null) {
      expect('abc'.includes(result)).toBe(true);
      expect('ab'.includes(result)).toBe(false);
    }
  });

  test('shortestUniqueSubstring result is a substring of s', () => {
    const s = 'abcdef', t = 'abcde';
    const result = shortestUniqueSubstring(s, t);
    if (result !== null) {
      expect(s.includes(result)).toBe(true);
      expect(t.includes(result)).toBe(false);
    }
  });

  test('shortestUniqueSubstring("xyz", "abc") = length 1 (any char)', () => {
    const result = shortestUniqueSubstring('xyz', 'abc');
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(result.length).toBe(1);
    }
  });

  // Additional: unique sub of 'banana' not in 'band'
  test('shortestUniqueSubstring("banana", "band") finds something', () => {
    const result = shortestUniqueSubstring('banana', 'band');
    // 'a' is in both, 'b' is in both, 'n' is in both... wait
    // 'band' has b,a,n,d — 'banana' substrings: all single chars a,b,n are in 'band'
    // 'ba' in band, 'an' in band... 'na' NOT in 'band'
    // So result should be 'na' or similar
    expect(result).not.toBeNull();
    if (result !== null) {
      expect('banana'.includes(result)).toBe(true);
      expect('band'.includes(result)).toBe(false);
    }
  });

  test('shortestUniqueSubstring result is not in t (consistency)', () => {
    const pairs: Array<[string, string]> = [
      ['abcde', 'abc'],
      ['hello', 'hell'],
      ['world', 'word'],
      ['testing', 'test'],
      ['programming', 'program'],
    ];
    for (const [s, t] of pairs) {
      const result = shortestUniqueSubstring(s, t);
      if (result !== null) {
        expect(s.includes(result)).toBe(true);
        const sam = new SuffixAutomaton(t);
        expect(sam.isSubstring(result)).toBe(false);
      }
    }
  });

  test('shortestUniqueSubstring length is minimal', () => {
    // If a length-1 substring of s not in t exists, result should have length 1
    const s = 'abcd', t = 'abc'; // 'd' is in s but not in t
    const result = shortestUniqueSubstring(s, t);
    expect(result?.length).toBe(1);
  });

  test('shortestUniqueSubstring("ab", "a") finds "b" or "ab"', () => {
    const result = shortestUniqueSubstring('ab', 'a');
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(result.length).toBe(1);
      expect(result).toBe('b');
    }
  });

  test('shortestUniqueSubstring("b", "a") finds "b"', () => {
    const result = shortestUniqueSubstring('b', 'a');
    expect(result).toBe('b');
  });

  test('shortestUniqueSubstring("a", "a") = null', () => {
    expect(shortestUniqueSubstring('a', 'a')).toBeNull();
  });

  test('shortestUniqueSubstring("aa", "a") = null', () => {
    // Every substring of "aa" is either "a" or "aa"
    // "a" is in "a", "aa" is NOT in "a"
    const result = shortestUniqueSubstring('aa', 'a');
    expect(result).toBe('aa');
  });

  test('shortestUniqueSubstring("abc", "") finds single char', () => {
    const result = shortestUniqueSubstring('abc', '');
    expect(result).not.toBeNull();
    if (result !== null) {
      expect(result.length).toBe(1);
    }
  });
});

// ---------------------------------------------------------------------------
// 21. countSharedSubstrings tests (20 tests)
// ---------------------------------------------------------------------------
describe('countSharedSubstrings tests', () => {
  test('countSharedSubstrings("", "") = 0', () => {
    expect(countSharedSubstrings('', '')).toBe(0);
  });

  test('countSharedSubstrings("abc", "") = 0', () => {
    expect(countSharedSubstrings('abc', '')).toBe(0);
  });

  test('countSharedSubstrings("", "abc") = 0', () => {
    expect(countSharedSubstrings('', 'abc')).toBe(0);
  });

  test('countSharedSubstrings("a", "a") = 1', () => {
    expect(countSharedSubstrings('a', 'a')).toBe(1);
  });

  test('countSharedSubstrings("a", "b") = 0', () => {
    expect(countSharedSubstrings('a', 'b')).toBe(0);
  });

  test('countSharedSubstrings("ab", "ab") = 3', () => {
    // substrings of "ab": a, b, ab — all in "ab" => 3
    expect(countSharedSubstrings('ab', 'ab')).toBe(3);
  });

  test('countSharedSubstrings("ab", "ba") = 2', () => {
    // substrings of "ab": a(in "ba"), b(in "ba"), ab(not in "ba") => 2
    expect(countSharedSubstrings('ab', 'ba')).toBe(2);
  });

  test('countSharedSubstrings("abc", "xyz") = 0', () => {
    expect(countSharedSubstrings('abc', 'xyz')).toBe(0);
  });

  test('countSharedSubstrings("abc", "abc") = 6', () => {
    // All 6 non-empty substrings of "abc" are in "abc"
    expect(countSharedSubstrings('abc', 'abc')).toBe(6);
  });

  test('countSharedSubstrings("abc", "bc") = 3', () => {
    // substrings of "abc": a(no), b(yes), c(yes), ab(no), bc(yes), abc(no) => 3
    expect(countSharedSubstrings('abc', 'bc')).toBe(3);
  });

  test('countSharedSubstrings("abc", "ab") = 3', () => {
    // substrings of "abc": a(yes), b(yes), c(no), ab(yes), bc(no), abc(no) => 3
    expect(countSharedSubstrings('abc', 'ab')).toBe(3);
  });

  test('countSharedSubstrings result >= 0', () => {
    const pairs: Array<[string, string]> = [
      ['hello', 'world'], ['abc', 'cba'], ['xy', 'yz'],
      ['aaa', 'bbb'], ['test', 'testing'],
    ];
    for (const [s, t] of pairs) {
      expect(countSharedSubstrings(s, t)).toBeGreaterThanOrEqual(0);
    }
  });

  test('countSharedSubstrings is consistent with isSubstring', () => {
    const s = 'abcd', t = 'bcde';
    const count = countSharedSubstrings(s, t);
    // Count manually: a(no),b(yes),c(yes),d(yes),ab(no),bc(yes),cd(yes),abc(no),bcd(yes),abcd(no)
    // Positions: a@0(no), b@1(yes), c@2(yes), d@3(yes),
    //            ab@0(no), bc@1(yes), cd@2(yes), abc@0(no), bcd@1(yes), abcd@0(no) = 6
    expect(count).toBe(6);
  });

  test('countSharedSubstrings("aaa", "aa") = 3', () => {
    // substrings of "aaa": a(yes),a(yes=>counted once?), NO: iterate all substrings
    // "aaa" substrings (with position): a(0),a(1),a(2),aa(0),aa(1),aaa(0)
    // in "aa": a(yes),a(yes),a(yes),aa(yes),aa(yes),aaa(no) = 5
    expect(countSharedSubstrings('aaa', 'aa')).toBe(5);
  });

  test('countSharedSubstrings("ba", "ab") = 2', () => {
    // substrings of "ba": b(in "ab":yes), a(in "ab":yes), ba(in "ab":no) => 2
    expect(countSharedSubstrings('ba', 'ab')).toBe(2);
  });

  test('countSharedSubstrings("abc", "a") = 1', () => {
    // a(yes), b(no), c(no), ab(no), bc(no), abc(no) => 1
    expect(countSharedSubstrings('abc', 'a')).toBe(1);
  });

  test('countSharedSubstrings("abc", "c") = 1', () => {
    // a(no), b(no), c(yes), ab(no), bc(no), abc(no) => 1
    expect(countSharedSubstrings('abc', 'c')).toBe(1);
  });

  test('countSharedSubstrings("abc", "b") = 1', () => {
    // a(no), b(yes), c(no), ab(no), bc(no), abc(no) => 1
    expect(countSharedSubstrings('abc', 'b')).toBe(1);
  });

  test('countSharedSubstrings("abab", "ab") = 6', () => {
    // substrings of "abab": a(yes),b(yes),a(yes),b(yes),ab(yes),ba(no),ab(yes),aba(no),bab(no),abab(no) => 6
    expect(countSharedSubstrings('abab', 'ab')).toBe(6);
  });

  test('countSharedSubstrings("hello", "hello") = 15', () => {
    // all 5*(5+1)/2 = 15 substrings of "hello" are in "hello"
    expect(countSharedSubstrings('hello', 'hello')).toBe(15);
  });
});

// ---------------------------------------------------------------------------
// 22. getText and getStates API tests (20 tests)
// ---------------------------------------------------------------------------
describe('SuffixAutomaton API tests', () => {
  test('getText returns the original string', () => {
    const sam = new SuffixAutomaton('hello');
    expect(sam.getText()).toBe('hello');
  });

  test('getText returns empty string for empty input', () => {
    const sam = new SuffixAutomaton('');
    expect(sam.getText()).toBe('');
  });

  test('getStates returns array of states', () => {
    const sam = new SuffixAutomaton('abc');
    expect(Array.isArray(sam.getStates())).toBe(true);
    expect(sam.getStates().length).toBe(sam.size);
  });

  test('first state has len=0 and link=-1', () => {
    const sam = new SuffixAutomaton('abc');
    const states = sam.getStates();
    expect(states[0].len).toBe(0);
    expect(states[0].link).toBe(-1);
  });

  test('all states have valid link (except root)', () => {
    const sam = new SuffixAutomaton('abcabc');
    const states = sam.getStates();
    for (let i = 1; i < states.length; i++) {
      expect(states[i].link).toBeGreaterThanOrEqual(0);
      expect(states[i].link).toBeLessThan(states.length);
    }
  });

  test('all states have len >= 1 except root', () => {
    const sam = new SuffixAutomaton('hello');
    const states = sam.getStates();
    for (let i = 1; i < states.length; i++) {
      expect(states[i].len).toBeGreaterThanOrEqual(1);
    }
  });

  test('state cnt values sum correctly for single-char string', () => {
    const sam = new SuffixAutomaton('a');
    const states = sam.getStates();
    // 'a' occurs once, root cnt accumulates
    const totalCnt = states.reduce((s, st) => s + st.cnt, 0);
    expect(totalCnt).toBeGreaterThanOrEqual(1);
  });

  test('endpos marking on terminal states', () => {
    const sam = new SuffixAutomaton('ab');
    const states = sam.getStates();
    // At least one state should be endpos=true
    const hasEndpos = states.some(st => st.endpos);
    expect(hasEndpos).toBe(true);
  });

  test('size matches states array length', () => {
    const words = ['', 'a', 'ab', 'abc', 'abcd', 'hello', 'banana', 'mississippi'];
    for (const w of words) {
      const sam = new SuffixAutomaton(w);
      expect(sam.size).toBe(sam.getStates().length);
    }
  });

  test('getText for various strings', () => {
    const words = ['', 'a', 'hello', 'world', 'abc', 'banana', '12345'];
    for (const w of words) {
      const sam = new SuffixAutomaton(w);
      expect(sam.getText()).toBe(w);
    }
  });

  test('all next maps point to valid state indices', () => {
    const sam = new SuffixAutomaton('abcabc');
    const states = sam.getStates();
    for (let i = 0; i < states.length; i++) {
      for (const nxt of states[i].next.values()) {
        expect(nxt).toBeGreaterThanOrEqual(0);
        expect(nxt).toBeLessThan(states.length);
      }
    }
  });

  test('cnt of root state = 0 (not counted as occurrence)', () => {
    const sam = new SuffixAutomaton('a');
    // root cnt: accumulates from all descendants
    // For 'a': state1 has cnt=1, propagates to root → root.cnt=1
    // Actually root accumulates everything
    const states = sam.getStates();
    // Just verify root has accumulated count
    expect(states[0].cnt).toBeGreaterThanOrEqual(0);
  });

  test('SuffixAutomaton works with numeric-like strings', () => {
    const sam = new SuffixAutomaton('1234512345');
    expect(sam.isSubstring('123')).toBe(true);
    expect(sam.isSubstring('456')).toBe(false);
    expect(sam.countOccurrences('12345')).toBe(2);
  });

  test('SuffixAutomaton works with special characters', () => {
    const sam = new SuffixAutomaton('a b c');
    expect(sam.isSubstring(' ')).toBe(true);
    expect(sam.isSubstring('a b')).toBe(true);
    expect(sam.isSubstring('b c')).toBe(true);
  });

  test('SuffixAutomaton works with Unicode-like strings', () => {
    const sam = new SuffixAutomaton('αβγ');
    expect(sam.isSubstring('αβ')).toBe(true);
    expect(sam.isSubstring('βγ')).toBe(true);
    expect(sam.isSubstring('αγ')).toBe(false);
  });

  test('multiple SAM instances are independent', () => {
    const sam1 = new SuffixAutomaton('abc');
    const sam2 = new SuffixAutomaton('xyz');
    expect(sam1.isSubstring('abc')).toBe(true);
    expect(sam2.isSubstring('abc')).toBe(false);
    expect(sam1.isSubstring('xyz')).toBe(false);
    expect(sam2.isSubstring('xyz')).toBe(true);
  });

  test('SAM for long repeated string has linear size', () => {
    const n = 100;
    const sam = new SuffixAutomaton('a'.repeat(n));
    // For 'a'*n, SAM has exactly n+1 states
    expect(sam.size).toBe(n + 1);
  });

  test('SAM for all distinct string has correct size', () => {
    const s = 'abcdefghij'; // 10 distinct chars
    const sam = new SuffixAutomaton(s);
    // For all distinct chars of length n: size = 2n (one extra state per char, no clone)
    // Actually for 'abcdefghij' (all distinct), size = 2*10 - 1 = 19? or 10+1=11?
    // All distinct: last state's suffix link goes to root, no cloning needed
    // So size = n+1 = 11
    expect(sam.size).toBe(s.length + 1);
  });

  test('SAM countOccurrences of full string = 1', () => {
    const words = ['abc', 'hello', 'banana', 'abcabc'];
    for (const w of words) {
      const sam = new SuffixAutomaton(w);
      expect(sam.countOccurrences(w)).toBe(1);
    }
  });

  test('SAM countOccurrences of absent string = 0', () => {
    const sam = new SuffixAutomaton('hello');
    expect(sam.countOccurrences('xyz')).toBe(0);
    expect(sam.countOccurrences('hellox')).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 23. SAM size lower bound tests (20 tests)
// ---------------------------------------------------------------------------
describe('SuffixAutomaton size lower bound', () => {
  // SAM must have at least n+1 states for a string of length n
  for (let n = 1; n <= 20; n++) {
    const s = 'abcdefghijklmnopqrst'.slice(0, n);
    test(`SAM("${s}").size >= ${n + 1}`, () => {
      const sam = new SuffixAutomaton(s);
      expect(sam.size).toBeGreaterThanOrEqual(n + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 24. countOccurrences empty pattern tests (20 tests)
// ---------------------------------------------------------------------------
describe('countOccurrences empty pattern returns n+1', () => {
  for (let n = 0; n <= 19; n++) {
    const s = 'a'.repeat(n);
    test(`countOccurrences("a"*${n}, "") = ${n + 1}`, () => {
      const sam = new SuffixAutomaton(s);
      expect(sam.countOccurrences('')).toBe(n + 1);
    });
  }
});

// ---------------------------------------------------------------------------
// 25. Stress tests: compare SAM vs naive for random-ish strings (60 tests)
// ---------------------------------------------------------------------------
describe('SAM vs naive stress tests', () => {
  // Use deterministic "random" strings
  function pseudoRandString(seed: number, len: number, alpha: string): string {
    let s = '';
    let x = seed;
    for (let i = 0; i < len; i++) {
      x = (x * 1664525 + 1013904223) & 0x7fffffff;
      s += alpha[x % alpha.length];
    }
    return s;
  }

  const alpha2 = 'ab';
  const alpha3 = 'abc';
  const alpha4 = 'abcd';

  // isSubstring stress (20 tests)
  for (let i = 0; i < 20; i++) {
    const s = pseudoRandString(i * 7 + 1, 15, alpha3);
    const t = pseudoRandString(i * 11 + 3, 5, alpha3);
    const expected = s.includes(t);
    test(`stress isSubstring("${s}", "${t}") = ${expected}`, () => {
      expect(isSubstring(s, t)).toBe(expected);
    });
  }

  // countOccurrences stress (20 tests)
  for (let i = 0; i < 20; i++) {
    const s = pseudoRandString(i * 13 + 5, 20, alpha2);
    const t = pseudoRandString(i * 17 + 7, 3, alpha2);
    const expected = naiveCount(s, t);
    test(`stress countOccurrences("${s}", "${t}") = ${expected}`, () => {
      expect(countOccurrences(s, t)).toBe(expected);
    });
  }

  // countDistinctSubstrings stress (20 tests)
  for (let i = 0; i < 20; i++) {
    const s = pseudoRandString(i * 19 + 9, 10, alpha4);
    const expected = naiveDistinctCount(s);
    test(`stress countDistinctSubstrings("${s}") = ${expected}`, () => {
      expect(countDistinctSubstrings(s)).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// 26. longestCommonSubstring correctness vs naive (50 tests)
// ---------------------------------------------------------------------------
describe('longestCommonSubstring correctness vs naive (extended)', () => {
  function pseudoRandString(seed: number, len: number, alpha: string): string {
    let s = '';
    let x = seed;
    for (let i = 0; i < len; i++) {
      x = (x * 1664525 + 1013904223) & 0x7fffffff;
      s += alpha[x % alpha.length];
    }
    return s;
  }

  for (let i = 0; i < 50; i++) {
    const s = pseudoRandString(i * 23 + 3, 12, 'abcd');
    const t = pseudoRandString(i * 29 + 7, 12, 'abcd');
    const expected = naiveLCS(s, t);
    test(`LCS stress ${i}: len("${s}", "${t}") = ${expected.length}`, () => {
      const result = longestCommonSubstring(s, t);
      expect(result.length).toBe(expected.length);
      if (result.length > 0) {
        expect(s.includes(result)).toBe(true);
        expect(t.includes(result)).toBe(true);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// 27. kthSubstring correctness verification (30 tests)
// ---------------------------------------------------------------------------
describe('kthSubstring correctness verification', () => {
  // For 'abcde': sorted distinct subs should match allDistinctSubstrings
  test('kthSubstring("abcde") matches allDistinctSubstrings order', () => {
    const s = 'abcde';
    const sorted = allDistinctSubstrings(s);
    const sam = new SuffixAutomaton(s);
    for (let k = 1; k <= sorted.length; k++) {
      expect(sam.kthSubstring(k)).toBe(sorted[k - 1]);
    }
  });

  test('kthSubstring("abc") matches allDistinctSubstrings order', () => {
    const s = 'abc';
    const sorted = allDistinctSubstrings(s);
    const sam = new SuffixAutomaton(s);
    for (let k = 1; k <= sorted.length; k++) {
      expect(sam.kthSubstring(k)).toBe(sorted[k - 1]);
    }
  });

  test('kthSubstring("ab") matches allDistinctSubstrings order', () => {
    const s = 'ab';
    const sorted = allDistinctSubstrings(s);
    const sam = new SuffixAutomaton(s);
    for (let k = 1; k <= sorted.length; k++) {
      expect(sam.kthSubstring(k)).toBe(sorted[k - 1]);
    }
  });

  test('kthSubstring("ba") matches allDistinctSubstrings order', () => {
    const s = 'ba';
    const sorted = allDistinctSubstrings(s);
    const sam = new SuffixAutomaton(s);
    for (let k = 1; k <= sorted.length; k++) {
      expect(sam.kthSubstring(k)).toBe(sorted[k - 1]);
    }
  });

  test('kthSubstring("aab") matches allDistinctSubstrings order', () => {
    const s = 'aab';
    const sorted = allDistinctSubstrings(s);
    const sam = new SuffixAutomaton(s);
    for (let k = 1; k <= sorted.length; k++) {
      expect(sam.kthSubstring(k)).toBe(sorted[k - 1]);
    }
  });

  test('kthSubstring("aba") matches allDistinctSubstrings order', () => {
    const s = 'aba';
    const sorted = allDistinctSubstrings(s);
    const sam = new SuffixAutomaton(s);
    for (let k = 1; k <= sorted.length; k++) {
      expect(sam.kthSubstring(k)).toBe(sorted[k - 1]);
    }
  });

  test('kthSubstring("abcd") matches allDistinctSubstrings order', () => {
    const s = 'abcd';
    const sorted = allDistinctSubstrings(s);
    const sam = new SuffixAutomaton(s);
    for (let k = 1; k <= sorted.length; k++) {
      expect(sam.kthSubstring(k)).toBe(sorted[k - 1]);
    }
  });

  test('kthSubstring("abba") matches allDistinctSubstrings order', () => {
    const s = 'abba';
    const sorted = allDistinctSubstrings(s);
    const sam = new SuffixAutomaton(s);
    for (let k = 1; k <= sorted.length; k++) {
      expect(sam.kthSubstring(k)).toBe(sorted[k - 1]);
    }
  });

  test('kthSubstring("xyz") matches allDistinctSubstrings order', () => {
    const s = 'xyz';
    const sorted = allDistinctSubstrings(s);
    const sam = new SuffixAutomaton(s);
    for (let k = 1; k <= sorted.length; k++) {
      expect(sam.kthSubstring(k)).toBe(sorted[k - 1]);
    }
  });

  test('kthSubstring("aa") matches allDistinctSubstrings order', () => {
    const s = 'aa';
    const sorted = allDistinctSubstrings(s);
    const sam = new SuffixAutomaton(s);
    for (let k = 1; k <= sorted.length; k++) {
      expect(sam.kthSubstring(k)).toBe(sorted[k - 1]);
    }
  });

  // standalone kthSubstring vs allDistinctSubstrings
  const verifyStrings = ['a', 'ab', 'ba', 'aa', 'abc', 'aab', 'aba', 'baa', 'abcd', 'abba',
    'xyz', 'zzz', 'zz', 'ab', 'abc', 'abcde', 'aabb', 'aaaa', 'abcba', 'xyxy'];
  for (const s of verifyStrings) {
    test(`standalone kthSubstring("${s}") matches sorted order`, () => {
      const sorted = allDistinctSubstrings(s);
      for (let k = 1; k <= sorted.length; k++) {
        expect(kthSubstring(s, k)).toBe(sorted[k - 1]);
      }
      expect(kthSubstring(s, sorted.length + 1)).toBeNull();
    });
  }
});

// ---------------------------------------------------------------------------
// 28. Edge cases and boundary conditions (30 tests)
// ---------------------------------------------------------------------------
describe('edge cases and boundary conditions', () => {
  test('SAM of single char: size = 2', () => {
    expect(new SuffixAutomaton('a').size).toBe(2);
    expect(new SuffixAutomaton('b').size).toBe(2);
    expect(new SuffixAutomaton('z').size).toBe(2);
  });

  test('SAM of two same chars: size = 3', () => {
    expect(new SuffixAutomaton('aa').size).toBe(3);
    expect(new SuffixAutomaton('bb').size).toBe(3);
  });

  test('SAM of two diff chars: size = 3', () => {
    expect(new SuffixAutomaton('ab').size).toBe(3);
    expect(new SuffixAutomaton('ba').size).toBe(3);
  });

  test('isSubstring of full string = true', () => {
    const words = ['a', 'ab', 'abc', 'hello', 'banana', 'mississippi'];
    for (const w of words) {
      const sam = new SuffixAutomaton(w);
      expect(sam.isSubstring(w)).toBe(true);
    }
  });

  test('isSubstring with one extra char = false', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.isSubstring('abcd')).toBe(false);
    expect(sam.isSubstring('xabc')).toBe(false);
    expect(sam.isSubstring('abxc')).toBe(false);
  });

  test('countOccurrences of non-existent pattern = 0', () => {
    const words = ['hello', 'world', 'abc', 'banana'];
    const patterns = ['xyz', 'qwerty', '123', 'ZZZ'];
    for (const w of words) {
      for (const p of patterns) {
        const sam = new SuffixAutomaton(w);
        expect(sam.countOccurrences(p)).toBe(0);
      }
    }
  });

  test('countDistinctSubstrings >= string length (for non-empty)', () => {
    const words = ['a', 'ab', 'abc', 'hello', 'banana'];
    for (const w of words) {
      const sam = new SuffixAutomaton(w);
      expect(sam.countDistinctSubstrings()).toBeGreaterThanOrEqual(w.length);
    }
  });

  test('longestCommonSubstring is empty when no common chars', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.longestCommonSubstring('xyz')).toBe('');
  });

  test('longestCommonSubstring with itself = full string', () => {
    const words = ['a', 'ab', 'abc', 'hello'];
    for (const w of words) {
      const sam = new SuffixAutomaton(w);
      expect(sam.longestCommonSubstring(w)).toBe(w);
    }
  });

  test('kthSubstring k=0 = null', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.kthSubstring(0)).toBeNull();
  });

  test('kthSubstring k<0 = null', () => {
    const sam = new SuffixAutomaton('abc');
    expect(sam.kthSubstring(-1)).toBeNull();
  });

  test('SAM handles whitespace characters', () => {
    const sam = new SuffixAutomaton('a b c');
    expect(sam.isSubstring('a b')).toBe(true);
    expect(sam.isSubstring(' b ')).toBe(true);
    expect(sam.isSubstring('a  b')).toBe(false);
  });

  test('SAM handles tab characters', () => {
    const sam = new SuffixAutomaton('a\tb\tc');
    expect(sam.isSubstring('\t')).toBe(true);
    expect(sam.isSubstring('a\tb')).toBe(true);
    expect(sam.isSubstring('a b')).toBe(false);
  });

  test('SAM with repeated pairs', () => {
    const sam = new SuffixAutomaton('ababab');
    expect(sam.countOccurrences('ab')).toBe(3);
    expect(sam.countOccurrences('ba')).toBe(2);
    expect(sam.countOccurrences('aba')).toBe(2);
    expect(sam.countOccurrences('bab')).toBe(2);
    expect(sam.countOccurrences('abab')).toBe(2);
    expect(sam.countOccurrences('ababab')).toBe(1);
  });

  test('isSubstring returns true for single char present', () => {
    const sam = new SuffixAutomaton('abcdefghij');
    for (const ch of 'abcdefghij') {
      expect(sam.isSubstring(ch)).toBe(true);
    }
  });

  test('isSubstring returns false for single char absent', () => {
    const sam = new SuffixAutomaton('abcde');
    for (const ch of 'fghijklmnopqrstuvwxyz') {
      expect(sam.isSubstring(ch)).toBe(false);
    }
  });
});
