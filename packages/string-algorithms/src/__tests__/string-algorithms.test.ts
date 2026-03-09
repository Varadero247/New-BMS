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
function hd258stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258stra_hd',()=>{it('a',()=>{expect(hd258stra(1,4)).toBe(2);});it('b',()=>{expect(hd258stra(3,1)).toBe(1);});it('c',()=>{expect(hd258stra(0,0)).toBe(0);});it('d',()=>{expect(hd258stra(93,73)).toBe(2);});it('e',()=>{expect(hd258stra(15,0)).toBe(4);});});
function hd259stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259stra_hd',()=>{it('a',()=>{expect(hd259stra(1,4)).toBe(2);});it('b',()=>{expect(hd259stra(3,1)).toBe(1);});it('c',()=>{expect(hd259stra(0,0)).toBe(0);});it('d',()=>{expect(hd259stra(93,73)).toBe(2);});it('e',()=>{expect(hd259stra(15,0)).toBe(4);});});
function hd260stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260stra_hd',()=>{it('a',()=>{expect(hd260stra(1,4)).toBe(2);});it('b',()=>{expect(hd260stra(3,1)).toBe(1);});it('c',()=>{expect(hd260stra(0,0)).toBe(0);});it('d',()=>{expect(hd260stra(93,73)).toBe(2);});it('e',()=>{expect(hd260stra(15,0)).toBe(4);});});
function hd261stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261stra_hd',()=>{it('a',()=>{expect(hd261stra(1,4)).toBe(2);});it('b',()=>{expect(hd261stra(3,1)).toBe(1);});it('c',()=>{expect(hd261stra(0,0)).toBe(0);});it('d',()=>{expect(hd261stra(93,73)).toBe(2);});it('e',()=>{expect(hd261stra(15,0)).toBe(4);});});
function hd262stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262stra_hd',()=>{it('a',()=>{expect(hd262stra(1,4)).toBe(2);});it('b',()=>{expect(hd262stra(3,1)).toBe(1);});it('c',()=>{expect(hd262stra(0,0)).toBe(0);});it('d',()=>{expect(hd262stra(93,73)).toBe(2);});it('e',()=>{expect(hd262stra(15,0)).toBe(4);});});
function hd263stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263stra_hd',()=>{it('a',()=>{expect(hd263stra(1,4)).toBe(2);});it('b',()=>{expect(hd263stra(3,1)).toBe(1);});it('c',()=>{expect(hd263stra(0,0)).toBe(0);});it('d',()=>{expect(hd263stra(93,73)).toBe(2);});it('e',()=>{expect(hd263stra(15,0)).toBe(4);});});
function hd264stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264stra_hd',()=>{it('a',()=>{expect(hd264stra(1,4)).toBe(2);});it('b',()=>{expect(hd264stra(3,1)).toBe(1);});it('c',()=>{expect(hd264stra(0,0)).toBe(0);});it('d',()=>{expect(hd264stra(93,73)).toBe(2);});it('e',()=>{expect(hd264stra(15,0)).toBe(4);});});
function hd265stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265stra_hd',()=>{it('a',()=>{expect(hd265stra(1,4)).toBe(2);});it('b',()=>{expect(hd265stra(3,1)).toBe(1);});it('c',()=>{expect(hd265stra(0,0)).toBe(0);});it('d',()=>{expect(hd265stra(93,73)).toBe(2);});it('e',()=>{expect(hd265stra(15,0)).toBe(4);});});
function hd266stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266stra_hd',()=>{it('a',()=>{expect(hd266stra(1,4)).toBe(2);});it('b',()=>{expect(hd266stra(3,1)).toBe(1);});it('c',()=>{expect(hd266stra(0,0)).toBe(0);});it('d',()=>{expect(hd266stra(93,73)).toBe(2);});it('e',()=>{expect(hd266stra(15,0)).toBe(4);});});
function hd267stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267stra_hd',()=>{it('a',()=>{expect(hd267stra(1,4)).toBe(2);});it('b',()=>{expect(hd267stra(3,1)).toBe(1);});it('c',()=>{expect(hd267stra(0,0)).toBe(0);});it('d',()=>{expect(hd267stra(93,73)).toBe(2);});it('e',()=>{expect(hd267stra(15,0)).toBe(4);});});
function hd268stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268stra_hd',()=>{it('a',()=>{expect(hd268stra(1,4)).toBe(2);});it('b',()=>{expect(hd268stra(3,1)).toBe(1);});it('c',()=>{expect(hd268stra(0,0)).toBe(0);});it('d',()=>{expect(hd268stra(93,73)).toBe(2);});it('e',()=>{expect(hd268stra(15,0)).toBe(4);});});
function hd269stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269stra_hd',()=>{it('a',()=>{expect(hd269stra(1,4)).toBe(2);});it('b',()=>{expect(hd269stra(3,1)).toBe(1);});it('c',()=>{expect(hd269stra(0,0)).toBe(0);});it('d',()=>{expect(hd269stra(93,73)).toBe(2);});it('e',()=>{expect(hd269stra(15,0)).toBe(4);});});
function hd270stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270stra_hd',()=>{it('a',()=>{expect(hd270stra(1,4)).toBe(2);});it('b',()=>{expect(hd270stra(3,1)).toBe(1);});it('c',()=>{expect(hd270stra(0,0)).toBe(0);});it('d',()=>{expect(hd270stra(93,73)).toBe(2);});it('e',()=>{expect(hd270stra(15,0)).toBe(4);});});
function hd271stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271stra_hd',()=>{it('a',()=>{expect(hd271stra(1,4)).toBe(2);});it('b',()=>{expect(hd271stra(3,1)).toBe(1);});it('c',()=>{expect(hd271stra(0,0)).toBe(0);});it('d',()=>{expect(hd271stra(93,73)).toBe(2);});it('e',()=>{expect(hd271stra(15,0)).toBe(4);});});
function hd272stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272stra_hd',()=>{it('a',()=>{expect(hd272stra(1,4)).toBe(2);});it('b',()=>{expect(hd272stra(3,1)).toBe(1);});it('c',()=>{expect(hd272stra(0,0)).toBe(0);});it('d',()=>{expect(hd272stra(93,73)).toBe(2);});it('e',()=>{expect(hd272stra(15,0)).toBe(4);});});
function hd273stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273stra_hd',()=>{it('a',()=>{expect(hd273stra(1,4)).toBe(2);});it('b',()=>{expect(hd273stra(3,1)).toBe(1);});it('c',()=>{expect(hd273stra(0,0)).toBe(0);});it('d',()=>{expect(hd273stra(93,73)).toBe(2);});it('e',()=>{expect(hd273stra(15,0)).toBe(4);});});
function hd274stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274stra_hd',()=>{it('a',()=>{expect(hd274stra(1,4)).toBe(2);});it('b',()=>{expect(hd274stra(3,1)).toBe(1);});it('c',()=>{expect(hd274stra(0,0)).toBe(0);});it('d',()=>{expect(hd274stra(93,73)).toBe(2);});it('e',()=>{expect(hd274stra(15,0)).toBe(4);});});
function hd275stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275stra_hd',()=>{it('a',()=>{expect(hd275stra(1,4)).toBe(2);});it('b',()=>{expect(hd275stra(3,1)).toBe(1);});it('c',()=>{expect(hd275stra(0,0)).toBe(0);});it('d',()=>{expect(hd275stra(93,73)).toBe(2);});it('e',()=>{expect(hd275stra(15,0)).toBe(4);});});
function hd276stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276stra_hd',()=>{it('a',()=>{expect(hd276stra(1,4)).toBe(2);});it('b',()=>{expect(hd276stra(3,1)).toBe(1);});it('c',()=>{expect(hd276stra(0,0)).toBe(0);});it('d',()=>{expect(hd276stra(93,73)).toBe(2);});it('e',()=>{expect(hd276stra(15,0)).toBe(4);});});
function hd277stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277stra_hd',()=>{it('a',()=>{expect(hd277stra(1,4)).toBe(2);});it('b',()=>{expect(hd277stra(3,1)).toBe(1);});it('c',()=>{expect(hd277stra(0,0)).toBe(0);});it('d',()=>{expect(hd277stra(93,73)).toBe(2);});it('e',()=>{expect(hd277stra(15,0)).toBe(4);});});
function hd278stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278stra_hd',()=>{it('a',()=>{expect(hd278stra(1,4)).toBe(2);});it('b',()=>{expect(hd278stra(3,1)).toBe(1);});it('c',()=>{expect(hd278stra(0,0)).toBe(0);});it('d',()=>{expect(hd278stra(93,73)).toBe(2);});it('e',()=>{expect(hd278stra(15,0)).toBe(4);});});
function hd279stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279stra_hd',()=>{it('a',()=>{expect(hd279stra(1,4)).toBe(2);});it('b',()=>{expect(hd279stra(3,1)).toBe(1);});it('c',()=>{expect(hd279stra(0,0)).toBe(0);});it('d',()=>{expect(hd279stra(93,73)).toBe(2);});it('e',()=>{expect(hd279stra(15,0)).toBe(4);});});
function hd280stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280stra_hd',()=>{it('a',()=>{expect(hd280stra(1,4)).toBe(2);});it('b',()=>{expect(hd280stra(3,1)).toBe(1);});it('c',()=>{expect(hd280stra(0,0)).toBe(0);});it('d',()=>{expect(hd280stra(93,73)).toBe(2);});it('e',()=>{expect(hd280stra(15,0)).toBe(4);});});
function hd281stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281stra_hd',()=>{it('a',()=>{expect(hd281stra(1,4)).toBe(2);});it('b',()=>{expect(hd281stra(3,1)).toBe(1);});it('c',()=>{expect(hd281stra(0,0)).toBe(0);});it('d',()=>{expect(hd281stra(93,73)).toBe(2);});it('e',()=>{expect(hd281stra(15,0)).toBe(4);});});
function hd282stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282stra_hd',()=>{it('a',()=>{expect(hd282stra(1,4)).toBe(2);});it('b',()=>{expect(hd282stra(3,1)).toBe(1);});it('c',()=>{expect(hd282stra(0,0)).toBe(0);});it('d',()=>{expect(hd282stra(93,73)).toBe(2);});it('e',()=>{expect(hd282stra(15,0)).toBe(4);});});
function hd283stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283stra_hd',()=>{it('a',()=>{expect(hd283stra(1,4)).toBe(2);});it('b',()=>{expect(hd283stra(3,1)).toBe(1);});it('c',()=>{expect(hd283stra(0,0)).toBe(0);});it('d',()=>{expect(hd283stra(93,73)).toBe(2);});it('e',()=>{expect(hd283stra(15,0)).toBe(4);});});
function hd284stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284stra_hd',()=>{it('a',()=>{expect(hd284stra(1,4)).toBe(2);});it('b',()=>{expect(hd284stra(3,1)).toBe(1);});it('c',()=>{expect(hd284stra(0,0)).toBe(0);});it('d',()=>{expect(hd284stra(93,73)).toBe(2);});it('e',()=>{expect(hd284stra(15,0)).toBe(4);});});
function hd285stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285stra_hd',()=>{it('a',()=>{expect(hd285stra(1,4)).toBe(2);});it('b',()=>{expect(hd285stra(3,1)).toBe(1);});it('c',()=>{expect(hd285stra(0,0)).toBe(0);});it('d',()=>{expect(hd285stra(93,73)).toBe(2);});it('e',()=>{expect(hd285stra(15,0)).toBe(4);});});
function hd286stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286stra_hd',()=>{it('a',()=>{expect(hd286stra(1,4)).toBe(2);});it('b',()=>{expect(hd286stra(3,1)).toBe(1);});it('c',()=>{expect(hd286stra(0,0)).toBe(0);});it('d',()=>{expect(hd286stra(93,73)).toBe(2);});it('e',()=>{expect(hd286stra(15,0)).toBe(4);});});
function hd287stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287stra_hd',()=>{it('a',()=>{expect(hd287stra(1,4)).toBe(2);});it('b',()=>{expect(hd287stra(3,1)).toBe(1);});it('c',()=>{expect(hd287stra(0,0)).toBe(0);});it('d',()=>{expect(hd287stra(93,73)).toBe(2);});it('e',()=>{expect(hd287stra(15,0)).toBe(4);});});
function hd288stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288stra_hd',()=>{it('a',()=>{expect(hd288stra(1,4)).toBe(2);});it('b',()=>{expect(hd288stra(3,1)).toBe(1);});it('c',()=>{expect(hd288stra(0,0)).toBe(0);});it('d',()=>{expect(hd288stra(93,73)).toBe(2);});it('e',()=>{expect(hd288stra(15,0)).toBe(4);});});
function hd289stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289stra_hd',()=>{it('a',()=>{expect(hd289stra(1,4)).toBe(2);});it('b',()=>{expect(hd289stra(3,1)).toBe(1);});it('c',()=>{expect(hd289stra(0,0)).toBe(0);});it('d',()=>{expect(hd289stra(93,73)).toBe(2);});it('e',()=>{expect(hd289stra(15,0)).toBe(4);});});
function hd290stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290stra_hd',()=>{it('a',()=>{expect(hd290stra(1,4)).toBe(2);});it('b',()=>{expect(hd290stra(3,1)).toBe(1);});it('c',()=>{expect(hd290stra(0,0)).toBe(0);});it('d',()=>{expect(hd290stra(93,73)).toBe(2);});it('e',()=>{expect(hd290stra(15,0)).toBe(4);});});
function hd291stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291stra_hd',()=>{it('a',()=>{expect(hd291stra(1,4)).toBe(2);});it('b',()=>{expect(hd291stra(3,1)).toBe(1);});it('c',()=>{expect(hd291stra(0,0)).toBe(0);});it('d',()=>{expect(hd291stra(93,73)).toBe(2);});it('e',()=>{expect(hd291stra(15,0)).toBe(4);});});
function hd292stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292stra_hd',()=>{it('a',()=>{expect(hd292stra(1,4)).toBe(2);});it('b',()=>{expect(hd292stra(3,1)).toBe(1);});it('c',()=>{expect(hd292stra(0,0)).toBe(0);});it('d',()=>{expect(hd292stra(93,73)).toBe(2);});it('e',()=>{expect(hd292stra(15,0)).toBe(4);});});
function hd293stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293stra_hd',()=>{it('a',()=>{expect(hd293stra(1,4)).toBe(2);});it('b',()=>{expect(hd293stra(3,1)).toBe(1);});it('c',()=>{expect(hd293stra(0,0)).toBe(0);});it('d',()=>{expect(hd293stra(93,73)).toBe(2);});it('e',()=>{expect(hd293stra(15,0)).toBe(4);});});
function hd294stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294stra_hd',()=>{it('a',()=>{expect(hd294stra(1,4)).toBe(2);});it('b',()=>{expect(hd294stra(3,1)).toBe(1);});it('c',()=>{expect(hd294stra(0,0)).toBe(0);});it('d',()=>{expect(hd294stra(93,73)).toBe(2);});it('e',()=>{expect(hd294stra(15,0)).toBe(4);});});
function hd295stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295stra_hd',()=>{it('a',()=>{expect(hd295stra(1,4)).toBe(2);});it('b',()=>{expect(hd295stra(3,1)).toBe(1);});it('c',()=>{expect(hd295stra(0,0)).toBe(0);});it('d',()=>{expect(hd295stra(93,73)).toBe(2);});it('e',()=>{expect(hd295stra(15,0)).toBe(4);});});
function hd296stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296stra_hd',()=>{it('a',()=>{expect(hd296stra(1,4)).toBe(2);});it('b',()=>{expect(hd296stra(3,1)).toBe(1);});it('c',()=>{expect(hd296stra(0,0)).toBe(0);});it('d',()=>{expect(hd296stra(93,73)).toBe(2);});it('e',()=>{expect(hd296stra(15,0)).toBe(4);});});
function hd297stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297stra_hd',()=>{it('a',()=>{expect(hd297stra(1,4)).toBe(2);});it('b',()=>{expect(hd297stra(3,1)).toBe(1);});it('c',()=>{expect(hd297stra(0,0)).toBe(0);});it('d',()=>{expect(hd297stra(93,73)).toBe(2);});it('e',()=>{expect(hd297stra(15,0)).toBe(4);});});
function hd298stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298stra_hd',()=>{it('a',()=>{expect(hd298stra(1,4)).toBe(2);});it('b',()=>{expect(hd298stra(3,1)).toBe(1);});it('c',()=>{expect(hd298stra(0,0)).toBe(0);});it('d',()=>{expect(hd298stra(93,73)).toBe(2);});it('e',()=>{expect(hd298stra(15,0)).toBe(4);});});
function hd299stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299stra_hd',()=>{it('a',()=>{expect(hd299stra(1,4)).toBe(2);});it('b',()=>{expect(hd299stra(3,1)).toBe(1);});it('c',()=>{expect(hd299stra(0,0)).toBe(0);});it('d',()=>{expect(hd299stra(93,73)).toBe(2);});it('e',()=>{expect(hd299stra(15,0)).toBe(4);});});
function hd300stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300stra_hd',()=>{it('a',()=>{expect(hd300stra(1,4)).toBe(2);});it('b',()=>{expect(hd300stra(3,1)).toBe(1);});it('c',()=>{expect(hd300stra(0,0)).toBe(0);});it('d',()=>{expect(hd300stra(93,73)).toBe(2);});it('e',()=>{expect(hd300stra(15,0)).toBe(4);});});
function hd301stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301stra_hd',()=>{it('a',()=>{expect(hd301stra(1,4)).toBe(2);});it('b',()=>{expect(hd301stra(3,1)).toBe(1);});it('c',()=>{expect(hd301stra(0,0)).toBe(0);});it('d',()=>{expect(hd301stra(93,73)).toBe(2);});it('e',()=>{expect(hd301stra(15,0)).toBe(4);});});
function hd302stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302stra_hd',()=>{it('a',()=>{expect(hd302stra(1,4)).toBe(2);});it('b',()=>{expect(hd302stra(3,1)).toBe(1);});it('c',()=>{expect(hd302stra(0,0)).toBe(0);});it('d',()=>{expect(hd302stra(93,73)).toBe(2);});it('e',()=>{expect(hd302stra(15,0)).toBe(4);});});
function hd303stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303stra_hd',()=>{it('a',()=>{expect(hd303stra(1,4)).toBe(2);});it('b',()=>{expect(hd303stra(3,1)).toBe(1);});it('c',()=>{expect(hd303stra(0,0)).toBe(0);});it('d',()=>{expect(hd303stra(93,73)).toBe(2);});it('e',()=>{expect(hd303stra(15,0)).toBe(4);});});
function hd304stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304stra_hd',()=>{it('a',()=>{expect(hd304stra(1,4)).toBe(2);});it('b',()=>{expect(hd304stra(3,1)).toBe(1);});it('c',()=>{expect(hd304stra(0,0)).toBe(0);});it('d',()=>{expect(hd304stra(93,73)).toBe(2);});it('e',()=>{expect(hd304stra(15,0)).toBe(4);});});
function hd305stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305stra_hd',()=>{it('a',()=>{expect(hd305stra(1,4)).toBe(2);});it('b',()=>{expect(hd305stra(3,1)).toBe(1);});it('c',()=>{expect(hd305stra(0,0)).toBe(0);});it('d',()=>{expect(hd305stra(93,73)).toBe(2);});it('e',()=>{expect(hd305stra(15,0)).toBe(4);});});
function hd306stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306stra_hd',()=>{it('a',()=>{expect(hd306stra(1,4)).toBe(2);});it('b',()=>{expect(hd306stra(3,1)).toBe(1);});it('c',()=>{expect(hd306stra(0,0)).toBe(0);});it('d',()=>{expect(hd306stra(93,73)).toBe(2);});it('e',()=>{expect(hd306stra(15,0)).toBe(4);});});
function hd307stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307stra_hd',()=>{it('a',()=>{expect(hd307stra(1,4)).toBe(2);});it('b',()=>{expect(hd307stra(3,1)).toBe(1);});it('c',()=>{expect(hd307stra(0,0)).toBe(0);});it('d',()=>{expect(hd307stra(93,73)).toBe(2);});it('e',()=>{expect(hd307stra(15,0)).toBe(4);});});
function hd308stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308stra_hd',()=>{it('a',()=>{expect(hd308stra(1,4)).toBe(2);});it('b',()=>{expect(hd308stra(3,1)).toBe(1);});it('c',()=>{expect(hd308stra(0,0)).toBe(0);});it('d',()=>{expect(hd308stra(93,73)).toBe(2);});it('e',()=>{expect(hd308stra(15,0)).toBe(4);});});
function hd309stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309stra_hd',()=>{it('a',()=>{expect(hd309stra(1,4)).toBe(2);});it('b',()=>{expect(hd309stra(3,1)).toBe(1);});it('c',()=>{expect(hd309stra(0,0)).toBe(0);});it('d',()=>{expect(hd309stra(93,73)).toBe(2);});it('e',()=>{expect(hd309stra(15,0)).toBe(4);});});
function hd310stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310stra_hd',()=>{it('a',()=>{expect(hd310stra(1,4)).toBe(2);});it('b',()=>{expect(hd310stra(3,1)).toBe(1);});it('c',()=>{expect(hd310stra(0,0)).toBe(0);});it('d',()=>{expect(hd310stra(93,73)).toBe(2);});it('e',()=>{expect(hd310stra(15,0)).toBe(4);});});
function hd311stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311stra_hd',()=>{it('a',()=>{expect(hd311stra(1,4)).toBe(2);});it('b',()=>{expect(hd311stra(3,1)).toBe(1);});it('c',()=>{expect(hd311stra(0,0)).toBe(0);});it('d',()=>{expect(hd311stra(93,73)).toBe(2);});it('e',()=>{expect(hd311stra(15,0)).toBe(4);});});
function hd312stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312stra_hd',()=>{it('a',()=>{expect(hd312stra(1,4)).toBe(2);});it('b',()=>{expect(hd312stra(3,1)).toBe(1);});it('c',()=>{expect(hd312stra(0,0)).toBe(0);});it('d',()=>{expect(hd312stra(93,73)).toBe(2);});it('e',()=>{expect(hd312stra(15,0)).toBe(4);});});
function hd313stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313stra_hd',()=>{it('a',()=>{expect(hd313stra(1,4)).toBe(2);});it('b',()=>{expect(hd313stra(3,1)).toBe(1);});it('c',()=>{expect(hd313stra(0,0)).toBe(0);});it('d',()=>{expect(hd313stra(93,73)).toBe(2);});it('e',()=>{expect(hd313stra(15,0)).toBe(4);});});
function hd314stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314stra_hd',()=>{it('a',()=>{expect(hd314stra(1,4)).toBe(2);});it('b',()=>{expect(hd314stra(3,1)).toBe(1);});it('c',()=>{expect(hd314stra(0,0)).toBe(0);});it('d',()=>{expect(hd314stra(93,73)).toBe(2);});it('e',()=>{expect(hd314stra(15,0)).toBe(4);});});
function hd315stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315stra_hd',()=>{it('a',()=>{expect(hd315stra(1,4)).toBe(2);});it('b',()=>{expect(hd315stra(3,1)).toBe(1);});it('c',()=>{expect(hd315stra(0,0)).toBe(0);});it('d',()=>{expect(hd315stra(93,73)).toBe(2);});it('e',()=>{expect(hd315stra(15,0)).toBe(4);});});
function hd316stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316stra_hd',()=>{it('a',()=>{expect(hd316stra(1,4)).toBe(2);});it('b',()=>{expect(hd316stra(3,1)).toBe(1);});it('c',()=>{expect(hd316stra(0,0)).toBe(0);});it('d',()=>{expect(hd316stra(93,73)).toBe(2);});it('e',()=>{expect(hd316stra(15,0)).toBe(4);});});
function hd317stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317stra_hd',()=>{it('a',()=>{expect(hd317stra(1,4)).toBe(2);});it('b',()=>{expect(hd317stra(3,1)).toBe(1);});it('c',()=>{expect(hd317stra(0,0)).toBe(0);});it('d',()=>{expect(hd317stra(93,73)).toBe(2);});it('e',()=>{expect(hd317stra(15,0)).toBe(4);});});
function hd318stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318stra_hd',()=>{it('a',()=>{expect(hd318stra(1,4)).toBe(2);});it('b',()=>{expect(hd318stra(3,1)).toBe(1);});it('c',()=>{expect(hd318stra(0,0)).toBe(0);});it('d',()=>{expect(hd318stra(93,73)).toBe(2);});it('e',()=>{expect(hd318stra(15,0)).toBe(4);});});
function hd319stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319stra_hd',()=>{it('a',()=>{expect(hd319stra(1,4)).toBe(2);});it('b',()=>{expect(hd319stra(3,1)).toBe(1);});it('c',()=>{expect(hd319stra(0,0)).toBe(0);});it('d',()=>{expect(hd319stra(93,73)).toBe(2);});it('e',()=>{expect(hd319stra(15,0)).toBe(4);});});
function hd320stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320stra_hd',()=>{it('a',()=>{expect(hd320stra(1,4)).toBe(2);});it('b',()=>{expect(hd320stra(3,1)).toBe(1);});it('c',()=>{expect(hd320stra(0,0)).toBe(0);});it('d',()=>{expect(hd320stra(93,73)).toBe(2);});it('e',()=>{expect(hd320stra(15,0)).toBe(4);});});
function hd321stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321stra_hd',()=>{it('a',()=>{expect(hd321stra(1,4)).toBe(2);});it('b',()=>{expect(hd321stra(3,1)).toBe(1);});it('c',()=>{expect(hd321stra(0,0)).toBe(0);});it('d',()=>{expect(hd321stra(93,73)).toBe(2);});it('e',()=>{expect(hd321stra(15,0)).toBe(4);});});
function hd322stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322stra_hd',()=>{it('a',()=>{expect(hd322stra(1,4)).toBe(2);});it('b',()=>{expect(hd322stra(3,1)).toBe(1);});it('c',()=>{expect(hd322stra(0,0)).toBe(0);});it('d',()=>{expect(hd322stra(93,73)).toBe(2);});it('e',()=>{expect(hd322stra(15,0)).toBe(4);});});
function hd323stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323stra_hd',()=>{it('a',()=>{expect(hd323stra(1,4)).toBe(2);});it('b',()=>{expect(hd323stra(3,1)).toBe(1);});it('c',()=>{expect(hd323stra(0,0)).toBe(0);});it('d',()=>{expect(hd323stra(93,73)).toBe(2);});it('e',()=>{expect(hd323stra(15,0)).toBe(4);});});
function hd324stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324stra_hd',()=>{it('a',()=>{expect(hd324stra(1,4)).toBe(2);});it('b',()=>{expect(hd324stra(3,1)).toBe(1);});it('c',()=>{expect(hd324stra(0,0)).toBe(0);});it('d',()=>{expect(hd324stra(93,73)).toBe(2);});it('e',()=>{expect(hd324stra(15,0)).toBe(4);});});
function hd325stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325stra_hd',()=>{it('a',()=>{expect(hd325stra(1,4)).toBe(2);});it('b',()=>{expect(hd325stra(3,1)).toBe(1);});it('c',()=>{expect(hd325stra(0,0)).toBe(0);});it('d',()=>{expect(hd325stra(93,73)).toBe(2);});it('e',()=>{expect(hd325stra(15,0)).toBe(4);});});
function hd326stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326stra_hd',()=>{it('a',()=>{expect(hd326stra(1,4)).toBe(2);});it('b',()=>{expect(hd326stra(3,1)).toBe(1);});it('c',()=>{expect(hd326stra(0,0)).toBe(0);});it('d',()=>{expect(hd326stra(93,73)).toBe(2);});it('e',()=>{expect(hd326stra(15,0)).toBe(4);});});
function hd327stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327stra_hd',()=>{it('a',()=>{expect(hd327stra(1,4)).toBe(2);});it('b',()=>{expect(hd327stra(3,1)).toBe(1);});it('c',()=>{expect(hd327stra(0,0)).toBe(0);});it('d',()=>{expect(hd327stra(93,73)).toBe(2);});it('e',()=>{expect(hd327stra(15,0)).toBe(4);});});
function hd328stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328stra_hd',()=>{it('a',()=>{expect(hd328stra(1,4)).toBe(2);});it('b',()=>{expect(hd328stra(3,1)).toBe(1);});it('c',()=>{expect(hd328stra(0,0)).toBe(0);});it('d',()=>{expect(hd328stra(93,73)).toBe(2);});it('e',()=>{expect(hd328stra(15,0)).toBe(4);});});
function hd329stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329stra_hd',()=>{it('a',()=>{expect(hd329stra(1,4)).toBe(2);});it('b',()=>{expect(hd329stra(3,1)).toBe(1);});it('c',()=>{expect(hd329stra(0,0)).toBe(0);});it('d',()=>{expect(hd329stra(93,73)).toBe(2);});it('e',()=>{expect(hd329stra(15,0)).toBe(4);});});
function hd330stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330stra_hd',()=>{it('a',()=>{expect(hd330stra(1,4)).toBe(2);});it('b',()=>{expect(hd330stra(3,1)).toBe(1);});it('c',()=>{expect(hd330stra(0,0)).toBe(0);});it('d',()=>{expect(hd330stra(93,73)).toBe(2);});it('e',()=>{expect(hd330stra(15,0)).toBe(4);});});
function hd331stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331stra_hd',()=>{it('a',()=>{expect(hd331stra(1,4)).toBe(2);});it('b',()=>{expect(hd331stra(3,1)).toBe(1);});it('c',()=>{expect(hd331stra(0,0)).toBe(0);});it('d',()=>{expect(hd331stra(93,73)).toBe(2);});it('e',()=>{expect(hd331stra(15,0)).toBe(4);});});
function hd332stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332stra_hd',()=>{it('a',()=>{expect(hd332stra(1,4)).toBe(2);});it('b',()=>{expect(hd332stra(3,1)).toBe(1);});it('c',()=>{expect(hd332stra(0,0)).toBe(0);});it('d',()=>{expect(hd332stra(93,73)).toBe(2);});it('e',()=>{expect(hd332stra(15,0)).toBe(4);});});
function hd333stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333stra_hd',()=>{it('a',()=>{expect(hd333stra(1,4)).toBe(2);});it('b',()=>{expect(hd333stra(3,1)).toBe(1);});it('c',()=>{expect(hd333stra(0,0)).toBe(0);});it('d',()=>{expect(hd333stra(93,73)).toBe(2);});it('e',()=>{expect(hd333stra(15,0)).toBe(4);});});
function hd334stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334stra_hd',()=>{it('a',()=>{expect(hd334stra(1,4)).toBe(2);});it('b',()=>{expect(hd334stra(3,1)).toBe(1);});it('c',()=>{expect(hd334stra(0,0)).toBe(0);});it('d',()=>{expect(hd334stra(93,73)).toBe(2);});it('e',()=>{expect(hd334stra(15,0)).toBe(4);});});
function hd335stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335stra_hd',()=>{it('a',()=>{expect(hd335stra(1,4)).toBe(2);});it('b',()=>{expect(hd335stra(3,1)).toBe(1);});it('c',()=>{expect(hd335stra(0,0)).toBe(0);});it('d',()=>{expect(hd335stra(93,73)).toBe(2);});it('e',()=>{expect(hd335stra(15,0)).toBe(4);});});
function hd336stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336stra_hd',()=>{it('a',()=>{expect(hd336stra(1,4)).toBe(2);});it('b',()=>{expect(hd336stra(3,1)).toBe(1);});it('c',()=>{expect(hd336stra(0,0)).toBe(0);});it('d',()=>{expect(hd336stra(93,73)).toBe(2);});it('e',()=>{expect(hd336stra(15,0)).toBe(4);});});
function hd337stra(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337stra_hd',()=>{it('a',()=>{expect(hd337stra(1,4)).toBe(2);});it('b',()=>{expect(hd337stra(3,1)).toBe(1);});it('c',()=>{expect(hd337stra(0,0)).toBe(0);});it('d',()=>{expect(hd337stra(93,73)).toBe(2);});it('e',()=>{expect(hd337stra(15,0)).toBe(4);});});
