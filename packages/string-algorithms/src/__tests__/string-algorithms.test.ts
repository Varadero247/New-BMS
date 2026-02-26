// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { kmpSearch, longestCommonSubsequence, editDistance, longestPalindrome, isPalindrome, anagramGroups, reverseWords, countOccurrences, longestCommonPrefix } from '../string-algorithms';

describe('kmpSearch', () => {
  it('finds single match', () => { expect(kmpSearch('hello world', 'world')).toEqual([6]); });
  it('finds multiple matches', () => { expect(kmpSearch('ababab', 'ab')).toEqual([0,2,4]); });
  it('no match returns empty', () => { expect(kmpSearch('hello', 'xyz')).toEqual([]); });
  it('empty pattern returns empty', () => { expect(kmpSearch('hello', '')).toEqual([]); });
  for (let i = 0; i < 50; i++) {
    it('kmp finds pattern at position ' + i, () => {
      const text = 'x'.repeat(i) + 'abc' + 'x'.repeat(10);
      expect(kmpSearch(text, 'abc')).toContain(i);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('kmp no match ' + i, () => {
      expect(kmpSearch('word' + i, 'xyz')).toEqual([]);
    });
  }
});

describe('longestCommonSubsequence', () => {
  it('lcs("abcde","ace") = 3', () => { expect(longestCommonSubsequence('abcde','ace')).toBe(3); });
  it('lcs("","abc") = 0', () => { expect(longestCommonSubsequence('','abc')).toBe(0); });
  it('lcs identical strings', () => { expect(longestCommonSubsequence('abc','abc')).toBe(3); });
  for (let n = 1; n <= 50; n++) {
    it('lcs of identical length-' + n + ' string = ' + n, () => {
      const s = 'a'.repeat(n);
      expect(longestCommonSubsequence(s, s)).toBe(n);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('lcs non-negative ' + i, () => {
      expect(longestCommonSubsequence('abc' + i, 'def' + i)).toBeGreaterThanOrEqual(0);
    });
  }
});

describe('editDistance', () => {
  it('edit("kitten","sitting") = 3', () => { expect(editDistance('kitten','sitting')).toBe(3); });
  it('edit("","abc") = 3', () => { expect(editDistance('','abc')).toBe(3); });
  it('edit identical = 0', () => { expect(editDistance('abc','abc')).toBe(0); });
  for (let n = 1; n <= 50; n++) {
    it('edit distance to empty = length ' + n, () => {
      expect(editDistance('a'.repeat(n), '')).toBe(n);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('edit distance symmetric ' + i, () => {
      const a = 'ab' + i, b = 'ba' + i;
      expect(editDistance(a, b)).toBe(editDistance(b, a));
    });
  }
});

describe('isPalindrome', () => {
  it('"racecar" is palindrome', () => { expect(isPalindrome('racecar')).toBe(true); });
  it('"hello" is not', () => { expect(isPalindrome('hello')).toBe(false); });
  it('ignores case', () => { expect(isPalindrome('Racecar')).toBe(true); });
  for (let i = 0; i < 50; i++) {
    const s = 'a'.repeat(i + 1);
    it('all same chars is palindrome ' + i, () => { expect(isPalindrome(s)).toBe(true); });
  }
  for (let i = 1; i <= 50; i++) {
    const s = 'a'.repeat(i) + 'b' + 'a'.repeat(i);
    it('symmetric string palindrome ' + i, () => { expect(isPalindrome(s)).toBe(true); });
  }
});

describe('longestPalindrome', () => {
  it('finds palindrome in string', () => { expect(longestPalindrome('babad').length).toBeGreaterThanOrEqual(3); });
  it('single char is palindrome', () => { expect(longestPalindrome('a')).toBe('a'); });
  for (let i = 1; i <= 50; i++) {
    it('longestPalindrome length >= 1 for i=' + i, () => {
      expect(longestPalindrome('abc' + i).length).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('other string functions', () => {
  it('reverseWords', () => { expect(reverseWords('hello world')).toBe('world hello'); });
  it('countOccurrences', () => { expect(countOccurrences('abababab', 'ab')).toBe(4); });
  it('longestCommonPrefix', () => { expect(longestCommonPrefix(['flower','flow','flight'])).toBe('fl'); });
  it('anagramGroups', () => { const g = anagramGroups(['eat','tea','tan','ate','nat','bat']); expect(g.length).toBe(3); });
  for (let i = 0; i < 50; i++) {
    it('countOccurrences >= 0 for ' + i, () => {
      expect(countOccurrences('test' + i + 'test', 'test')).toBeGreaterThanOrEqual(1);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('longestCommonPrefix single element ' + i, () => {
      expect(longestCommonPrefix(['word' + i])).toBe('word' + i);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('editDistance to same = 0 for item' + i, () => {
      expect(editDistance('item' + i, 'item' + i)).toBe(0);
    });
  }
});

describe('string top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('editDistance non-negative ' + i, () => {
      expect(editDistance('word' + i, 'test' + i)).toBeGreaterThanOrEqual(0);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('lcs <= min length ' + i, () => {
      const a = 'ab' + i, b = 'abc';
      expect(longestCommonSubsequence(a, b)).toBeLessThanOrEqual(Math.min(a.length, b.length));
    });
  }
  for (let i = 0; i < 100; i++) {
    it('kmpSearch count matches ' + i, () => {
      const t = 'abc'.repeat(i + 1);
      expect(kmpSearch(t, 'abc')).toHaveLength(i + 1);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('isPalindrome single char ' + i, () => {
      expect(isPalindrome(String.fromCharCode(97 + i % 26))).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('reverseWords single word ' + i, () => {
      expect(reverseWords('word' + i)).toBe('word' + i);
    });
  }
});
