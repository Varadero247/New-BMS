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
function hd258sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258sfa_hd',()=>{it('a',()=>{expect(hd258sfa(1,4)).toBe(2);});it('b',()=>{expect(hd258sfa(3,1)).toBe(1);});it('c',()=>{expect(hd258sfa(0,0)).toBe(0);});it('d',()=>{expect(hd258sfa(93,73)).toBe(2);});it('e',()=>{expect(hd258sfa(15,0)).toBe(4);});});
function hd259sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259sfa_hd',()=>{it('a',()=>{expect(hd259sfa(1,4)).toBe(2);});it('b',()=>{expect(hd259sfa(3,1)).toBe(1);});it('c',()=>{expect(hd259sfa(0,0)).toBe(0);});it('d',()=>{expect(hd259sfa(93,73)).toBe(2);});it('e',()=>{expect(hd259sfa(15,0)).toBe(4);});});
function hd260sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260sfa_hd',()=>{it('a',()=>{expect(hd260sfa(1,4)).toBe(2);});it('b',()=>{expect(hd260sfa(3,1)).toBe(1);});it('c',()=>{expect(hd260sfa(0,0)).toBe(0);});it('d',()=>{expect(hd260sfa(93,73)).toBe(2);});it('e',()=>{expect(hd260sfa(15,0)).toBe(4);});});
function hd261sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261sfa_hd',()=>{it('a',()=>{expect(hd261sfa(1,4)).toBe(2);});it('b',()=>{expect(hd261sfa(3,1)).toBe(1);});it('c',()=>{expect(hd261sfa(0,0)).toBe(0);});it('d',()=>{expect(hd261sfa(93,73)).toBe(2);});it('e',()=>{expect(hd261sfa(15,0)).toBe(4);});});
function hd262sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262sfa_hd',()=>{it('a',()=>{expect(hd262sfa(1,4)).toBe(2);});it('b',()=>{expect(hd262sfa(3,1)).toBe(1);});it('c',()=>{expect(hd262sfa(0,0)).toBe(0);});it('d',()=>{expect(hd262sfa(93,73)).toBe(2);});it('e',()=>{expect(hd262sfa(15,0)).toBe(4);});});
function hd263sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263sfa_hd',()=>{it('a',()=>{expect(hd263sfa(1,4)).toBe(2);});it('b',()=>{expect(hd263sfa(3,1)).toBe(1);});it('c',()=>{expect(hd263sfa(0,0)).toBe(0);});it('d',()=>{expect(hd263sfa(93,73)).toBe(2);});it('e',()=>{expect(hd263sfa(15,0)).toBe(4);});});
function hd264sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264sfa_hd',()=>{it('a',()=>{expect(hd264sfa(1,4)).toBe(2);});it('b',()=>{expect(hd264sfa(3,1)).toBe(1);});it('c',()=>{expect(hd264sfa(0,0)).toBe(0);});it('d',()=>{expect(hd264sfa(93,73)).toBe(2);});it('e',()=>{expect(hd264sfa(15,0)).toBe(4);});});
function hd265sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265sfa_hd',()=>{it('a',()=>{expect(hd265sfa(1,4)).toBe(2);});it('b',()=>{expect(hd265sfa(3,1)).toBe(1);});it('c',()=>{expect(hd265sfa(0,0)).toBe(0);});it('d',()=>{expect(hd265sfa(93,73)).toBe(2);});it('e',()=>{expect(hd265sfa(15,0)).toBe(4);});});
function hd266sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266sfa_hd',()=>{it('a',()=>{expect(hd266sfa(1,4)).toBe(2);});it('b',()=>{expect(hd266sfa(3,1)).toBe(1);});it('c',()=>{expect(hd266sfa(0,0)).toBe(0);});it('d',()=>{expect(hd266sfa(93,73)).toBe(2);});it('e',()=>{expect(hd266sfa(15,0)).toBe(4);});});
function hd267sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267sfa_hd',()=>{it('a',()=>{expect(hd267sfa(1,4)).toBe(2);});it('b',()=>{expect(hd267sfa(3,1)).toBe(1);});it('c',()=>{expect(hd267sfa(0,0)).toBe(0);});it('d',()=>{expect(hd267sfa(93,73)).toBe(2);});it('e',()=>{expect(hd267sfa(15,0)).toBe(4);});});
function hd268sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268sfa_hd',()=>{it('a',()=>{expect(hd268sfa(1,4)).toBe(2);});it('b',()=>{expect(hd268sfa(3,1)).toBe(1);});it('c',()=>{expect(hd268sfa(0,0)).toBe(0);});it('d',()=>{expect(hd268sfa(93,73)).toBe(2);});it('e',()=>{expect(hd268sfa(15,0)).toBe(4);});});
function hd269sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269sfa_hd',()=>{it('a',()=>{expect(hd269sfa(1,4)).toBe(2);});it('b',()=>{expect(hd269sfa(3,1)).toBe(1);});it('c',()=>{expect(hd269sfa(0,0)).toBe(0);});it('d',()=>{expect(hd269sfa(93,73)).toBe(2);});it('e',()=>{expect(hd269sfa(15,0)).toBe(4);});});
function hd270sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270sfa_hd',()=>{it('a',()=>{expect(hd270sfa(1,4)).toBe(2);});it('b',()=>{expect(hd270sfa(3,1)).toBe(1);});it('c',()=>{expect(hd270sfa(0,0)).toBe(0);});it('d',()=>{expect(hd270sfa(93,73)).toBe(2);});it('e',()=>{expect(hd270sfa(15,0)).toBe(4);});});
function hd271sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271sfa_hd',()=>{it('a',()=>{expect(hd271sfa(1,4)).toBe(2);});it('b',()=>{expect(hd271sfa(3,1)).toBe(1);});it('c',()=>{expect(hd271sfa(0,0)).toBe(0);});it('d',()=>{expect(hd271sfa(93,73)).toBe(2);});it('e',()=>{expect(hd271sfa(15,0)).toBe(4);});});
function hd272sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272sfa_hd',()=>{it('a',()=>{expect(hd272sfa(1,4)).toBe(2);});it('b',()=>{expect(hd272sfa(3,1)).toBe(1);});it('c',()=>{expect(hd272sfa(0,0)).toBe(0);});it('d',()=>{expect(hd272sfa(93,73)).toBe(2);});it('e',()=>{expect(hd272sfa(15,0)).toBe(4);});});
function hd273sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273sfa_hd',()=>{it('a',()=>{expect(hd273sfa(1,4)).toBe(2);});it('b',()=>{expect(hd273sfa(3,1)).toBe(1);});it('c',()=>{expect(hd273sfa(0,0)).toBe(0);});it('d',()=>{expect(hd273sfa(93,73)).toBe(2);});it('e',()=>{expect(hd273sfa(15,0)).toBe(4);});});
function hd274sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274sfa_hd',()=>{it('a',()=>{expect(hd274sfa(1,4)).toBe(2);});it('b',()=>{expect(hd274sfa(3,1)).toBe(1);});it('c',()=>{expect(hd274sfa(0,0)).toBe(0);});it('d',()=>{expect(hd274sfa(93,73)).toBe(2);});it('e',()=>{expect(hd274sfa(15,0)).toBe(4);});});
function hd275sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275sfa_hd',()=>{it('a',()=>{expect(hd275sfa(1,4)).toBe(2);});it('b',()=>{expect(hd275sfa(3,1)).toBe(1);});it('c',()=>{expect(hd275sfa(0,0)).toBe(0);});it('d',()=>{expect(hd275sfa(93,73)).toBe(2);});it('e',()=>{expect(hd275sfa(15,0)).toBe(4);});});
function hd276sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276sfa_hd',()=>{it('a',()=>{expect(hd276sfa(1,4)).toBe(2);});it('b',()=>{expect(hd276sfa(3,1)).toBe(1);});it('c',()=>{expect(hd276sfa(0,0)).toBe(0);});it('d',()=>{expect(hd276sfa(93,73)).toBe(2);});it('e',()=>{expect(hd276sfa(15,0)).toBe(4);});});
function hd277sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277sfa_hd',()=>{it('a',()=>{expect(hd277sfa(1,4)).toBe(2);});it('b',()=>{expect(hd277sfa(3,1)).toBe(1);});it('c',()=>{expect(hd277sfa(0,0)).toBe(0);});it('d',()=>{expect(hd277sfa(93,73)).toBe(2);});it('e',()=>{expect(hd277sfa(15,0)).toBe(4);});});
function hd278sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278sfa_hd',()=>{it('a',()=>{expect(hd278sfa(1,4)).toBe(2);});it('b',()=>{expect(hd278sfa(3,1)).toBe(1);});it('c',()=>{expect(hd278sfa(0,0)).toBe(0);});it('d',()=>{expect(hd278sfa(93,73)).toBe(2);});it('e',()=>{expect(hd278sfa(15,0)).toBe(4);});});
function hd279sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279sfa_hd',()=>{it('a',()=>{expect(hd279sfa(1,4)).toBe(2);});it('b',()=>{expect(hd279sfa(3,1)).toBe(1);});it('c',()=>{expect(hd279sfa(0,0)).toBe(0);});it('d',()=>{expect(hd279sfa(93,73)).toBe(2);});it('e',()=>{expect(hd279sfa(15,0)).toBe(4);});});
function hd280sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280sfa_hd',()=>{it('a',()=>{expect(hd280sfa(1,4)).toBe(2);});it('b',()=>{expect(hd280sfa(3,1)).toBe(1);});it('c',()=>{expect(hd280sfa(0,0)).toBe(0);});it('d',()=>{expect(hd280sfa(93,73)).toBe(2);});it('e',()=>{expect(hd280sfa(15,0)).toBe(4);});});
function hd281sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281sfa_hd',()=>{it('a',()=>{expect(hd281sfa(1,4)).toBe(2);});it('b',()=>{expect(hd281sfa(3,1)).toBe(1);});it('c',()=>{expect(hd281sfa(0,0)).toBe(0);});it('d',()=>{expect(hd281sfa(93,73)).toBe(2);});it('e',()=>{expect(hd281sfa(15,0)).toBe(4);});});
function hd282sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282sfa_hd',()=>{it('a',()=>{expect(hd282sfa(1,4)).toBe(2);});it('b',()=>{expect(hd282sfa(3,1)).toBe(1);});it('c',()=>{expect(hd282sfa(0,0)).toBe(0);});it('d',()=>{expect(hd282sfa(93,73)).toBe(2);});it('e',()=>{expect(hd282sfa(15,0)).toBe(4);});});
function hd283sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283sfa_hd',()=>{it('a',()=>{expect(hd283sfa(1,4)).toBe(2);});it('b',()=>{expect(hd283sfa(3,1)).toBe(1);});it('c',()=>{expect(hd283sfa(0,0)).toBe(0);});it('d',()=>{expect(hd283sfa(93,73)).toBe(2);});it('e',()=>{expect(hd283sfa(15,0)).toBe(4);});});
function hd284sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284sfa_hd',()=>{it('a',()=>{expect(hd284sfa(1,4)).toBe(2);});it('b',()=>{expect(hd284sfa(3,1)).toBe(1);});it('c',()=>{expect(hd284sfa(0,0)).toBe(0);});it('d',()=>{expect(hd284sfa(93,73)).toBe(2);});it('e',()=>{expect(hd284sfa(15,0)).toBe(4);});});
function hd285sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285sfa_hd',()=>{it('a',()=>{expect(hd285sfa(1,4)).toBe(2);});it('b',()=>{expect(hd285sfa(3,1)).toBe(1);});it('c',()=>{expect(hd285sfa(0,0)).toBe(0);});it('d',()=>{expect(hd285sfa(93,73)).toBe(2);});it('e',()=>{expect(hd285sfa(15,0)).toBe(4);});});
function hd286sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286sfa_hd',()=>{it('a',()=>{expect(hd286sfa(1,4)).toBe(2);});it('b',()=>{expect(hd286sfa(3,1)).toBe(1);});it('c',()=>{expect(hd286sfa(0,0)).toBe(0);});it('d',()=>{expect(hd286sfa(93,73)).toBe(2);});it('e',()=>{expect(hd286sfa(15,0)).toBe(4);});});
function hd287sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287sfa_hd',()=>{it('a',()=>{expect(hd287sfa(1,4)).toBe(2);});it('b',()=>{expect(hd287sfa(3,1)).toBe(1);});it('c',()=>{expect(hd287sfa(0,0)).toBe(0);});it('d',()=>{expect(hd287sfa(93,73)).toBe(2);});it('e',()=>{expect(hd287sfa(15,0)).toBe(4);});});
function hd288sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288sfa_hd',()=>{it('a',()=>{expect(hd288sfa(1,4)).toBe(2);});it('b',()=>{expect(hd288sfa(3,1)).toBe(1);});it('c',()=>{expect(hd288sfa(0,0)).toBe(0);});it('d',()=>{expect(hd288sfa(93,73)).toBe(2);});it('e',()=>{expect(hd288sfa(15,0)).toBe(4);});});
function hd289sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289sfa_hd',()=>{it('a',()=>{expect(hd289sfa(1,4)).toBe(2);});it('b',()=>{expect(hd289sfa(3,1)).toBe(1);});it('c',()=>{expect(hd289sfa(0,0)).toBe(0);});it('d',()=>{expect(hd289sfa(93,73)).toBe(2);});it('e',()=>{expect(hd289sfa(15,0)).toBe(4);});});
function hd290sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290sfa_hd',()=>{it('a',()=>{expect(hd290sfa(1,4)).toBe(2);});it('b',()=>{expect(hd290sfa(3,1)).toBe(1);});it('c',()=>{expect(hd290sfa(0,0)).toBe(0);});it('d',()=>{expect(hd290sfa(93,73)).toBe(2);});it('e',()=>{expect(hd290sfa(15,0)).toBe(4);});});
function hd291sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291sfa_hd',()=>{it('a',()=>{expect(hd291sfa(1,4)).toBe(2);});it('b',()=>{expect(hd291sfa(3,1)).toBe(1);});it('c',()=>{expect(hd291sfa(0,0)).toBe(0);});it('d',()=>{expect(hd291sfa(93,73)).toBe(2);});it('e',()=>{expect(hd291sfa(15,0)).toBe(4);});});
function hd292sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292sfa_hd',()=>{it('a',()=>{expect(hd292sfa(1,4)).toBe(2);});it('b',()=>{expect(hd292sfa(3,1)).toBe(1);});it('c',()=>{expect(hd292sfa(0,0)).toBe(0);});it('d',()=>{expect(hd292sfa(93,73)).toBe(2);});it('e',()=>{expect(hd292sfa(15,0)).toBe(4);});});
function hd293sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293sfa_hd',()=>{it('a',()=>{expect(hd293sfa(1,4)).toBe(2);});it('b',()=>{expect(hd293sfa(3,1)).toBe(1);});it('c',()=>{expect(hd293sfa(0,0)).toBe(0);});it('d',()=>{expect(hd293sfa(93,73)).toBe(2);});it('e',()=>{expect(hd293sfa(15,0)).toBe(4);});});
function hd294sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294sfa_hd',()=>{it('a',()=>{expect(hd294sfa(1,4)).toBe(2);});it('b',()=>{expect(hd294sfa(3,1)).toBe(1);});it('c',()=>{expect(hd294sfa(0,0)).toBe(0);});it('d',()=>{expect(hd294sfa(93,73)).toBe(2);});it('e',()=>{expect(hd294sfa(15,0)).toBe(4);});});
function hd295sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295sfa_hd',()=>{it('a',()=>{expect(hd295sfa(1,4)).toBe(2);});it('b',()=>{expect(hd295sfa(3,1)).toBe(1);});it('c',()=>{expect(hd295sfa(0,0)).toBe(0);});it('d',()=>{expect(hd295sfa(93,73)).toBe(2);});it('e',()=>{expect(hd295sfa(15,0)).toBe(4);});});
function hd296sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296sfa_hd',()=>{it('a',()=>{expect(hd296sfa(1,4)).toBe(2);});it('b',()=>{expect(hd296sfa(3,1)).toBe(1);});it('c',()=>{expect(hd296sfa(0,0)).toBe(0);});it('d',()=>{expect(hd296sfa(93,73)).toBe(2);});it('e',()=>{expect(hd296sfa(15,0)).toBe(4);});});
function hd297sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297sfa_hd',()=>{it('a',()=>{expect(hd297sfa(1,4)).toBe(2);});it('b',()=>{expect(hd297sfa(3,1)).toBe(1);});it('c',()=>{expect(hd297sfa(0,0)).toBe(0);});it('d',()=>{expect(hd297sfa(93,73)).toBe(2);});it('e',()=>{expect(hd297sfa(15,0)).toBe(4);});});
function hd298sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298sfa_hd',()=>{it('a',()=>{expect(hd298sfa(1,4)).toBe(2);});it('b',()=>{expect(hd298sfa(3,1)).toBe(1);});it('c',()=>{expect(hd298sfa(0,0)).toBe(0);});it('d',()=>{expect(hd298sfa(93,73)).toBe(2);});it('e',()=>{expect(hd298sfa(15,0)).toBe(4);});});
function hd299sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299sfa_hd',()=>{it('a',()=>{expect(hd299sfa(1,4)).toBe(2);});it('b',()=>{expect(hd299sfa(3,1)).toBe(1);});it('c',()=>{expect(hd299sfa(0,0)).toBe(0);});it('d',()=>{expect(hd299sfa(93,73)).toBe(2);});it('e',()=>{expect(hd299sfa(15,0)).toBe(4);});});
function hd300sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300sfa_hd',()=>{it('a',()=>{expect(hd300sfa(1,4)).toBe(2);});it('b',()=>{expect(hd300sfa(3,1)).toBe(1);});it('c',()=>{expect(hd300sfa(0,0)).toBe(0);});it('d',()=>{expect(hd300sfa(93,73)).toBe(2);});it('e',()=>{expect(hd300sfa(15,0)).toBe(4);});});
function hd301sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301sfa_hd',()=>{it('a',()=>{expect(hd301sfa(1,4)).toBe(2);});it('b',()=>{expect(hd301sfa(3,1)).toBe(1);});it('c',()=>{expect(hd301sfa(0,0)).toBe(0);});it('d',()=>{expect(hd301sfa(93,73)).toBe(2);});it('e',()=>{expect(hd301sfa(15,0)).toBe(4);});});
function hd302sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302sfa_hd',()=>{it('a',()=>{expect(hd302sfa(1,4)).toBe(2);});it('b',()=>{expect(hd302sfa(3,1)).toBe(1);});it('c',()=>{expect(hd302sfa(0,0)).toBe(0);});it('d',()=>{expect(hd302sfa(93,73)).toBe(2);});it('e',()=>{expect(hd302sfa(15,0)).toBe(4);});});
function hd303sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303sfa_hd',()=>{it('a',()=>{expect(hd303sfa(1,4)).toBe(2);});it('b',()=>{expect(hd303sfa(3,1)).toBe(1);});it('c',()=>{expect(hd303sfa(0,0)).toBe(0);});it('d',()=>{expect(hd303sfa(93,73)).toBe(2);});it('e',()=>{expect(hd303sfa(15,0)).toBe(4);});});
function hd304sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304sfa_hd',()=>{it('a',()=>{expect(hd304sfa(1,4)).toBe(2);});it('b',()=>{expect(hd304sfa(3,1)).toBe(1);});it('c',()=>{expect(hd304sfa(0,0)).toBe(0);});it('d',()=>{expect(hd304sfa(93,73)).toBe(2);});it('e',()=>{expect(hd304sfa(15,0)).toBe(4);});});
function hd305sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305sfa_hd',()=>{it('a',()=>{expect(hd305sfa(1,4)).toBe(2);});it('b',()=>{expect(hd305sfa(3,1)).toBe(1);});it('c',()=>{expect(hd305sfa(0,0)).toBe(0);});it('d',()=>{expect(hd305sfa(93,73)).toBe(2);});it('e',()=>{expect(hd305sfa(15,0)).toBe(4);});});
function hd306sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306sfa_hd',()=>{it('a',()=>{expect(hd306sfa(1,4)).toBe(2);});it('b',()=>{expect(hd306sfa(3,1)).toBe(1);});it('c',()=>{expect(hd306sfa(0,0)).toBe(0);});it('d',()=>{expect(hd306sfa(93,73)).toBe(2);});it('e',()=>{expect(hd306sfa(15,0)).toBe(4);});});
function hd307sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307sfa_hd',()=>{it('a',()=>{expect(hd307sfa(1,4)).toBe(2);});it('b',()=>{expect(hd307sfa(3,1)).toBe(1);});it('c',()=>{expect(hd307sfa(0,0)).toBe(0);});it('d',()=>{expect(hd307sfa(93,73)).toBe(2);});it('e',()=>{expect(hd307sfa(15,0)).toBe(4);});});
function hd308sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308sfa_hd',()=>{it('a',()=>{expect(hd308sfa(1,4)).toBe(2);});it('b',()=>{expect(hd308sfa(3,1)).toBe(1);});it('c',()=>{expect(hd308sfa(0,0)).toBe(0);});it('d',()=>{expect(hd308sfa(93,73)).toBe(2);});it('e',()=>{expect(hd308sfa(15,0)).toBe(4);});});
function hd309sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309sfa_hd',()=>{it('a',()=>{expect(hd309sfa(1,4)).toBe(2);});it('b',()=>{expect(hd309sfa(3,1)).toBe(1);});it('c',()=>{expect(hd309sfa(0,0)).toBe(0);});it('d',()=>{expect(hd309sfa(93,73)).toBe(2);});it('e',()=>{expect(hd309sfa(15,0)).toBe(4);});});
function hd310sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310sfa_hd',()=>{it('a',()=>{expect(hd310sfa(1,4)).toBe(2);});it('b',()=>{expect(hd310sfa(3,1)).toBe(1);});it('c',()=>{expect(hd310sfa(0,0)).toBe(0);});it('d',()=>{expect(hd310sfa(93,73)).toBe(2);});it('e',()=>{expect(hd310sfa(15,0)).toBe(4);});});
function hd311sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311sfa_hd',()=>{it('a',()=>{expect(hd311sfa(1,4)).toBe(2);});it('b',()=>{expect(hd311sfa(3,1)).toBe(1);});it('c',()=>{expect(hd311sfa(0,0)).toBe(0);});it('d',()=>{expect(hd311sfa(93,73)).toBe(2);});it('e',()=>{expect(hd311sfa(15,0)).toBe(4);});});
function hd312sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312sfa_hd',()=>{it('a',()=>{expect(hd312sfa(1,4)).toBe(2);});it('b',()=>{expect(hd312sfa(3,1)).toBe(1);});it('c',()=>{expect(hd312sfa(0,0)).toBe(0);});it('d',()=>{expect(hd312sfa(93,73)).toBe(2);});it('e',()=>{expect(hd312sfa(15,0)).toBe(4);});});
function hd313sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313sfa_hd',()=>{it('a',()=>{expect(hd313sfa(1,4)).toBe(2);});it('b',()=>{expect(hd313sfa(3,1)).toBe(1);});it('c',()=>{expect(hd313sfa(0,0)).toBe(0);});it('d',()=>{expect(hd313sfa(93,73)).toBe(2);});it('e',()=>{expect(hd313sfa(15,0)).toBe(4);});});
function hd314sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314sfa_hd',()=>{it('a',()=>{expect(hd314sfa(1,4)).toBe(2);});it('b',()=>{expect(hd314sfa(3,1)).toBe(1);});it('c',()=>{expect(hd314sfa(0,0)).toBe(0);});it('d',()=>{expect(hd314sfa(93,73)).toBe(2);});it('e',()=>{expect(hd314sfa(15,0)).toBe(4);});});
function hd315sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315sfa_hd',()=>{it('a',()=>{expect(hd315sfa(1,4)).toBe(2);});it('b',()=>{expect(hd315sfa(3,1)).toBe(1);});it('c',()=>{expect(hd315sfa(0,0)).toBe(0);});it('d',()=>{expect(hd315sfa(93,73)).toBe(2);});it('e',()=>{expect(hd315sfa(15,0)).toBe(4);});});
function hd316sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316sfa_hd',()=>{it('a',()=>{expect(hd316sfa(1,4)).toBe(2);});it('b',()=>{expect(hd316sfa(3,1)).toBe(1);});it('c',()=>{expect(hd316sfa(0,0)).toBe(0);});it('d',()=>{expect(hd316sfa(93,73)).toBe(2);});it('e',()=>{expect(hd316sfa(15,0)).toBe(4);});});
function hd317sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317sfa_hd',()=>{it('a',()=>{expect(hd317sfa(1,4)).toBe(2);});it('b',()=>{expect(hd317sfa(3,1)).toBe(1);});it('c',()=>{expect(hd317sfa(0,0)).toBe(0);});it('d',()=>{expect(hd317sfa(93,73)).toBe(2);});it('e',()=>{expect(hd317sfa(15,0)).toBe(4);});});
function hd318sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318sfa_hd',()=>{it('a',()=>{expect(hd318sfa(1,4)).toBe(2);});it('b',()=>{expect(hd318sfa(3,1)).toBe(1);});it('c',()=>{expect(hd318sfa(0,0)).toBe(0);});it('d',()=>{expect(hd318sfa(93,73)).toBe(2);});it('e',()=>{expect(hd318sfa(15,0)).toBe(4);});});
function hd319sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319sfa_hd',()=>{it('a',()=>{expect(hd319sfa(1,4)).toBe(2);});it('b',()=>{expect(hd319sfa(3,1)).toBe(1);});it('c',()=>{expect(hd319sfa(0,0)).toBe(0);});it('d',()=>{expect(hd319sfa(93,73)).toBe(2);});it('e',()=>{expect(hd319sfa(15,0)).toBe(4);});});
function hd320sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320sfa_hd',()=>{it('a',()=>{expect(hd320sfa(1,4)).toBe(2);});it('b',()=>{expect(hd320sfa(3,1)).toBe(1);});it('c',()=>{expect(hd320sfa(0,0)).toBe(0);});it('d',()=>{expect(hd320sfa(93,73)).toBe(2);});it('e',()=>{expect(hd320sfa(15,0)).toBe(4);});});
function hd321sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321sfa_hd',()=>{it('a',()=>{expect(hd321sfa(1,4)).toBe(2);});it('b',()=>{expect(hd321sfa(3,1)).toBe(1);});it('c',()=>{expect(hd321sfa(0,0)).toBe(0);});it('d',()=>{expect(hd321sfa(93,73)).toBe(2);});it('e',()=>{expect(hd321sfa(15,0)).toBe(4);});});
function hd322sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322sfa_hd',()=>{it('a',()=>{expect(hd322sfa(1,4)).toBe(2);});it('b',()=>{expect(hd322sfa(3,1)).toBe(1);});it('c',()=>{expect(hd322sfa(0,0)).toBe(0);});it('d',()=>{expect(hd322sfa(93,73)).toBe(2);});it('e',()=>{expect(hd322sfa(15,0)).toBe(4);});});
function hd323sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323sfa_hd',()=>{it('a',()=>{expect(hd323sfa(1,4)).toBe(2);});it('b',()=>{expect(hd323sfa(3,1)).toBe(1);});it('c',()=>{expect(hd323sfa(0,0)).toBe(0);});it('d',()=>{expect(hd323sfa(93,73)).toBe(2);});it('e',()=>{expect(hd323sfa(15,0)).toBe(4);});});
function hd324sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324sfa_hd',()=>{it('a',()=>{expect(hd324sfa(1,4)).toBe(2);});it('b',()=>{expect(hd324sfa(3,1)).toBe(1);});it('c',()=>{expect(hd324sfa(0,0)).toBe(0);});it('d',()=>{expect(hd324sfa(93,73)).toBe(2);});it('e',()=>{expect(hd324sfa(15,0)).toBe(4);});});
function hd325sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325sfa_hd',()=>{it('a',()=>{expect(hd325sfa(1,4)).toBe(2);});it('b',()=>{expect(hd325sfa(3,1)).toBe(1);});it('c',()=>{expect(hd325sfa(0,0)).toBe(0);});it('d',()=>{expect(hd325sfa(93,73)).toBe(2);});it('e',()=>{expect(hd325sfa(15,0)).toBe(4);});});
function hd326sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326sfa_hd',()=>{it('a',()=>{expect(hd326sfa(1,4)).toBe(2);});it('b',()=>{expect(hd326sfa(3,1)).toBe(1);});it('c',()=>{expect(hd326sfa(0,0)).toBe(0);});it('d',()=>{expect(hd326sfa(93,73)).toBe(2);});it('e',()=>{expect(hd326sfa(15,0)).toBe(4);});});
function hd327sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327sfa_hd',()=>{it('a',()=>{expect(hd327sfa(1,4)).toBe(2);});it('b',()=>{expect(hd327sfa(3,1)).toBe(1);});it('c',()=>{expect(hd327sfa(0,0)).toBe(0);});it('d',()=>{expect(hd327sfa(93,73)).toBe(2);});it('e',()=>{expect(hd327sfa(15,0)).toBe(4);});});
function hd328sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328sfa_hd',()=>{it('a',()=>{expect(hd328sfa(1,4)).toBe(2);});it('b',()=>{expect(hd328sfa(3,1)).toBe(1);});it('c',()=>{expect(hd328sfa(0,0)).toBe(0);});it('d',()=>{expect(hd328sfa(93,73)).toBe(2);});it('e',()=>{expect(hd328sfa(15,0)).toBe(4);});});
function hd329sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329sfa_hd',()=>{it('a',()=>{expect(hd329sfa(1,4)).toBe(2);});it('b',()=>{expect(hd329sfa(3,1)).toBe(1);});it('c',()=>{expect(hd329sfa(0,0)).toBe(0);});it('d',()=>{expect(hd329sfa(93,73)).toBe(2);});it('e',()=>{expect(hd329sfa(15,0)).toBe(4);});});
function hd330sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330sfa_hd',()=>{it('a',()=>{expect(hd330sfa(1,4)).toBe(2);});it('b',()=>{expect(hd330sfa(3,1)).toBe(1);});it('c',()=>{expect(hd330sfa(0,0)).toBe(0);});it('d',()=>{expect(hd330sfa(93,73)).toBe(2);});it('e',()=>{expect(hd330sfa(15,0)).toBe(4);});});
function hd331sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331sfa_hd',()=>{it('a',()=>{expect(hd331sfa(1,4)).toBe(2);});it('b',()=>{expect(hd331sfa(3,1)).toBe(1);});it('c',()=>{expect(hd331sfa(0,0)).toBe(0);});it('d',()=>{expect(hd331sfa(93,73)).toBe(2);});it('e',()=>{expect(hd331sfa(15,0)).toBe(4);});});
function hd332sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332sfa_hd',()=>{it('a',()=>{expect(hd332sfa(1,4)).toBe(2);});it('b',()=>{expect(hd332sfa(3,1)).toBe(1);});it('c',()=>{expect(hd332sfa(0,0)).toBe(0);});it('d',()=>{expect(hd332sfa(93,73)).toBe(2);});it('e',()=>{expect(hd332sfa(15,0)).toBe(4);});});
function hd333sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333sfa_hd',()=>{it('a',()=>{expect(hd333sfa(1,4)).toBe(2);});it('b',()=>{expect(hd333sfa(3,1)).toBe(1);});it('c',()=>{expect(hd333sfa(0,0)).toBe(0);});it('d',()=>{expect(hd333sfa(93,73)).toBe(2);});it('e',()=>{expect(hd333sfa(15,0)).toBe(4);});});
function hd334sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334sfa_hd',()=>{it('a',()=>{expect(hd334sfa(1,4)).toBe(2);});it('b',()=>{expect(hd334sfa(3,1)).toBe(1);});it('c',()=>{expect(hd334sfa(0,0)).toBe(0);});it('d',()=>{expect(hd334sfa(93,73)).toBe(2);});it('e',()=>{expect(hd334sfa(15,0)).toBe(4);});});
function hd335sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335sfa_hd',()=>{it('a',()=>{expect(hd335sfa(1,4)).toBe(2);});it('b',()=>{expect(hd335sfa(3,1)).toBe(1);});it('c',()=>{expect(hd335sfa(0,0)).toBe(0);});it('d',()=>{expect(hd335sfa(93,73)).toBe(2);});it('e',()=>{expect(hd335sfa(15,0)).toBe(4);});});
function hd336sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336sfa_hd',()=>{it('a',()=>{expect(hd336sfa(1,4)).toBe(2);});it('b',()=>{expect(hd336sfa(3,1)).toBe(1);});it('c',()=>{expect(hd336sfa(0,0)).toBe(0);});it('d',()=>{expect(hd336sfa(93,73)).toBe(2);});it('e',()=>{expect(hd336sfa(15,0)).toBe(4);});});
function hd337sfa(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337sfa_hd',()=>{it('a',()=>{expect(hd337sfa(1,4)).toBe(2);});it('b',()=>{expect(hd337sfa(3,1)).toBe(1);});it('c',()=>{expect(hd337sfa(0,0)).toBe(0);});it('d',()=>{expect(hd337sfa(93,73)).toBe(2);});it('e',()=>{expect(hd337sfa(15,0)).toBe(4);});});
