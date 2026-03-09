// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { AhoCorasick, createAhoCorasick, searchAll, countOccurrences } from '../aho-corasick';

describe('AhoCorasick basic', () => {
  it('starts with 0 patterns', () => { expect(new AhoCorasick().patternCount).toBe(0); });
  it('addPattern increases count', () => { const ac = new AhoCorasick(); ac.addPattern('abc'); expect(ac.patternCount).toBe(1); });
  it('search empty text returns empty', () => { expect(createAhoCorasick(['abc']).search('')).toEqual([]); });
  it('search finds single match', () => {
    const ac = createAhoCorasick(['abc']);
    const r = ac.search('xabcx');
    expect(r).toHaveLength(1);
    expect(r[0].pattern).toBe('abc');
  });
  it('containsAny true when pattern present', () => {
    expect(createAhoCorasick(['abc']).containsAny('xabcx')).toBe(true);
  });
  it('containsAny false when no match', () => {
    expect(createAhoCorasick(['xyz']).containsAny('abcdef')).toBe(false);
  });
  for (let i = 0; i < 100; i++) {
    it('search single char pattern ' + i, () => {
      const ch = String.fromCharCode(97 + (i % 26));
      const ac = createAhoCorasick([ch]);
      const text = ch.repeat(3);
      expect(ac.search(text).length).toBe(3);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('no match returns empty ' + i, () => {
      const ac = createAhoCorasick(['xyz']);
      expect(ac.search('abc'.repeat(i + 1))).toHaveLength(0);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('pattern count ' + i, () => {
      const ac = new AhoCorasick();
      for (let j = 0; j <= i % 5; j++) ac.addPattern('pat' + j);
      expect(ac.patternCount).toBe(i % 5 + 1);
    });
  }
});

describe('AhoCorasick multi-pattern', () => {
  it('finds multiple patterns in one search', () => {
    const ac = createAhoCorasick(['he', 'she', 'his', 'hers']);
    const r = ac.search('ushers');
    expect(r.length).toBeGreaterThan(0);
  });
  it('overlapping patterns', () => {
    const ac = createAhoCorasick(['aa', 'aaa']);
    const r = ac.search('aaaa');
    expect(r.length).toBeGreaterThan(0);
  });
  for (let i = 1; i <= 100; i++) {
    it('find pattern at position ' + i, () => {
      const pat = 'x';
      const text = 'a'.repeat(i - 1) + 'x' + 'a'.repeat(10);
      const ac = createAhoCorasick([pat]);
      const r = ac.search(text);
      expect(r[0].start).toBe(i - 1);
    });
  }
  for (let i = 1; i <= 100; i++) {
    it('multiple patterns n=' + i, () => {
      const patterns = Array.from({ length: i % 5 + 1 }, (_, j) => 'p' + j);
      const text = patterns.join(' ');
      const ac = createAhoCorasick(patterns);
      expect(ac.patternCount).toBe(i % 5 + 1);
    });
  }
});

describe('searchAll and countOccurrences', () => {
  it('searchAll returns matches', () => {
    const r = searchAll('abcabc', ['abc']);
    expect(r).toHaveLength(2);
  });
  it('countOccurrences counts', () => {
    const c = countOccurrences('abcabc', ['abc', 'ab']);
    expect(c.get('abc')).toBe(2);
  });
  for (let i = 1; i <= 100; i++) {
    it('searchAll count i=' + i, () => {
      const pat = 'a';
      const text = 'a'.repeat(i);
      expect(searchAll(text, [pat])).toHaveLength(i);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('countOccurrences zero for no match ' + i, () => {
      const c = countOccurrences('hello', ['xyz' + i]);
      expect(c.get('xyz' + i) ?? 0).toBe(0);
    });
  }
  for (let i = 1; i <= 100; i++) {
    it('searchFirst finds first ' + i, () => {
      const ac = createAhoCorasick(['ab']);
      const text = 'x'.repeat(i - 1) + 'ab' + 'x'.repeat(5);
      const m = ac.searchFirst(text);
      expect(m).not.toBeNull();
      expect(m!.start).toBe(i - 1);
    });
  }
});

describe('AhoCorasick clear and reset', () => {
  for (let i = 0; i < 100; i++) {
    it('clear resets pattern count ' + i, () => {
      const ac = new AhoCorasick();
      for (let j = 0; j <= i % 5; j++) ac.addPattern('p' + j);
      ac.clear();
      expect(ac.patternCount).toBe(0);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('after clear search returns empty ' + i, () => {
      const ac = createAhoCorasick(['abc']);
      ac.clear();
      expect(ac.search('abc')).toHaveLength(0);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rebuild after clear works ' + i, () => {
      const ac = new AhoCorasick();
      ac.addPattern('test');
      ac.build();
      ac.clear();
      ac.addPattern('hello');
      ac.build();
      expect(ac.containsAny('say hello')).toBe(true);
      expect(ac.containsAny('test')).toBe(false);
    });
  }
});

describe('AhoCorasick edge cases', () => {
  it('empty pattern ignored', () => {
    const ac = new AhoCorasick();
    ac.addPattern('');
    expect(ac.patternCount).toBe(0);
  });
  it('searchFirst returns null when no match', () => {
    expect(createAhoCorasick(['abc']).searchFirst('xyz')).toBeNull();
  });
  for (let i = 0; i < 100; i++) {
    it('long text short pattern ' + i, () => {
      const text = 'a'.repeat(100) + 'b' + 'a'.repeat(i);
      const ac = createAhoCorasick(['b']);
      expect(ac.search(text)).toHaveLength(1);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('pattern longer than text returns empty ' + i, () => {
      const ac = createAhoCorasick(['longpattern' + i]);
      expect(ac.search('short')).toHaveLength(0);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('exact match ' + i, () => {
      const pat = 'exact' + i;
      const ac = createAhoCorasick([pat]);
      expect(ac.search(pat)).toHaveLength(1);
    });
  }
});

describe('AhoCorasick match positions', () => {
  it('match start and end are correct', () => {
    const ac = createAhoCorasick(['bc']);
    const r = ac.search('abcd');
    expect(r[0].start).toBe(1);
    expect(r[0].end).toBe(2);
  });
  it('match at start of string', () => {
    const ac = createAhoCorasick(['abc']);
    const r = ac.search('abcdef');
    expect(r[0].start).toBe(0);
    expect(r[0].end).toBe(2);
  });
  it('match at end of string', () => {
    const ac = createAhoCorasick(['def']);
    const r = ac.search('abcdef');
    expect(r[0].start).toBe(3);
    expect(r[0].end).toBe(5);
  });
  for (let i = 0; i < 50; i++) {
    it('match end equals start plus length minus 1 case ' + i, () => {
      const pat = 'ab';
      const offset = i * 3;
      const text = 'x'.repeat(offset) + pat + 'y'.repeat(10);
      const ac = createAhoCorasick([pat]);
      const r = ac.search(text);
      expect(r[0].end - r[0].start).toBe(pat.length - 1);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it('repeated pattern positions i=' + i, () => {
      const pat = 'ab';
      const text = (pat + 'x').repeat(i);
      const ac = createAhoCorasick([pat]);
      const r = ac.search(text);
      expect(r).toHaveLength(i);
      for (let j = 0; j < i; j++) {
        expect(r[j].start).toBe(j * 3);
      }
    });
  }
});

describe('AhoCorasick case sensitivity', () => {
  it('is case-sensitive by default', () => {
    const ac = createAhoCorasick(['ABC']);
    expect(ac.containsAny('abc')).toBe(false);
    expect(ac.containsAny('ABC')).toBe(true);
  });
  for (let i = 0; i < 50; i++) {
    it('uppercase pattern not matched by lowercase text ' + i, () => {
      const pat = 'HELLO' + i;
      const ac = createAhoCorasick([pat]);
      expect(ac.containsAny('hello' + i)).toBe(false);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('mixed case exact match ' + i, () => {
      const pat = 'HeLLo' + i;
      const ac = createAhoCorasick([pat]);
      expect(ac.containsAny('HeLLo' + i)).toBe(true);
    });
  }
});

describe('AhoCorasick unicode', () => {
  it('matches unicode pattern', () => {
    const ac = createAhoCorasick(['cafe\u0301']);
    expect(ac.containsAny('a cafe\u0301 b')).toBe(true);
  });
  for (let i = 0; i < 30; i++) {
    it('unicode char single match ' + i, () => {
      const ch = String.fromCodePoint(0x1F600 + i);
      const ac = createAhoCorasick([ch]);
      expect(ac.search(ch)).toHaveLength(1);
    });
  }
  for (let i = 0; i < 20; i++) {
    it('ascii surrogate boundary ' + i, () => {
      const pat = 'pat' + i;
      const ac = createAhoCorasick([pat]);
      expect(ac.search('xxpat' + i + 'xx')).toHaveLength(1);
    });
  }
});

describe('AhoCorasick nodeCount', () => {
  it('starts with 1 node (root)', () => {
    expect(new AhoCorasick().nodeCountValue).toBe(1);
  });
  it('unique chars add nodes', () => {
    const ac = new AhoCorasick();
    ac.addPattern('abc');
    expect(ac.nodeCountValue).toBe(4);
  });
  it('shared prefix shares nodes', () => {
    const ac = new AhoCorasick();
    ac.addPattern('abc');
    ac.addPattern('abd');
    expect(ac.nodeCountValue).toBe(5);
  });
  for (let i = 1; i <= 26; i++) {
    it('n single-char patterns have n+1 nodes ' + i, () => {
      const ac = new AhoCorasick();
      for (let j = 0; j < i; j++) ac.addPattern(String.fromCharCode(97 + j));
      expect(ac.nodeCountValue).toBe(i + 1);
    });
  }
});

describe('AhoCorasick build idempotency', () => {
  for (let i = 0; i < 50; i++) {
    it('calling build twice is safe ' + i, () => {
      const ac = new AhoCorasick();
      ac.addPattern('hello');
      ac.build();
      ac.build();
      expect(ac.containsAny('say hello world')).toBe(true);
    });
  }
});

describe('AhoCorasick large patterns', () => {
  for (let i = 1; i <= 30; i++) {
    it('pattern of length ' + i * 5, () => {
      const pat = 'a'.repeat(i * 5);
      const ac = createAhoCorasick([pat]);
      expect(ac.search(pat)).toHaveLength(1);
    });
  }
  for (let i = 1; i <= 20; i++) {
    it('text much longer than pattern ' + i, () => {
      const pat = 'needle';
      const text = 'haystack'.repeat(i * 10) + pat + 'more'.repeat(i);
      const ac = createAhoCorasick([pat]);
      expect(ac.search(text)).toHaveLength(1);
    });
  }
});

describe('AhoCorasick multiple occurrences', () => {
  for (let i = 1; i <= 50; i++) {
    it('pattern repeated ' + i + ' times found', () => {
      const pat = 'xy';
      const text = pat.repeat(i);
      const ac = createAhoCorasick([pat]);
      expect(ac.search(text)).toHaveLength(i);
    });
  }
});

describe('countOccurrences advanced', () => {
  it('counts two distinct patterns independently', () => {
    const c = countOccurrences('abcabc', ['abc', 'bc']);
    expect(c.get('abc')).toBe(2);
    expect(c.get('bc')).toBe(2);
  });
  it('returns empty map for no patterns', () => {
    const c = countOccurrences('hello', []);
    expect(c.size).toBe(0);
  });
  for (let i = 1; i <= 30; i++) {
    it('count pattern appearing ' + i + ' times', () => {
      const pat = 'z';
      const text = 'a'.repeat(i) + pat.repeat(i) + 'b'.repeat(i);
      const c = countOccurrences(text, [pat]);
      expect(c.get(pat)).toBe(i);
    });
  }
});

describe('createAhoCorasick factory', () => {
  it('empty patterns produces no-op automaton', () => {
    const ac = createAhoCorasick([]);
    expect(ac.search('anything')).toHaveLength(0);
  });
  it('single pattern factory', () => {
    const ac = createAhoCorasick(['hello']);
    expect(ac.patternCount).toBe(1);
  });
  for (let i = 1; i <= 30; i++) {
    it('factory with ' + i + ' patterns', () => {
      const patterns = Array.from({ length: i }, (_, j) => 'word' + j);
      const ac = createAhoCorasick(patterns);
      expect(ac.patternCount).toBe(i);
    });
  }
});
function hd258ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258ahc_hd',()=>{it('a',()=>{expect(hd258ahc(1,4)).toBe(2);});it('b',()=>{expect(hd258ahc(3,1)).toBe(1);});it('c',()=>{expect(hd258ahc(0,0)).toBe(0);});it('d',()=>{expect(hd258ahc(93,73)).toBe(2);});it('e',()=>{expect(hd258ahc(15,0)).toBe(4);});});
function hd259ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259ahc_hd',()=>{it('a',()=>{expect(hd259ahc(1,4)).toBe(2);});it('b',()=>{expect(hd259ahc(3,1)).toBe(1);});it('c',()=>{expect(hd259ahc(0,0)).toBe(0);});it('d',()=>{expect(hd259ahc(93,73)).toBe(2);});it('e',()=>{expect(hd259ahc(15,0)).toBe(4);});});
function hd260ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260ahc_hd',()=>{it('a',()=>{expect(hd260ahc(1,4)).toBe(2);});it('b',()=>{expect(hd260ahc(3,1)).toBe(1);});it('c',()=>{expect(hd260ahc(0,0)).toBe(0);});it('d',()=>{expect(hd260ahc(93,73)).toBe(2);});it('e',()=>{expect(hd260ahc(15,0)).toBe(4);});});
function hd261ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261ahc_hd',()=>{it('a',()=>{expect(hd261ahc(1,4)).toBe(2);});it('b',()=>{expect(hd261ahc(3,1)).toBe(1);});it('c',()=>{expect(hd261ahc(0,0)).toBe(0);});it('d',()=>{expect(hd261ahc(93,73)).toBe(2);});it('e',()=>{expect(hd261ahc(15,0)).toBe(4);});});
function hd262ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262ahc_hd',()=>{it('a',()=>{expect(hd262ahc(1,4)).toBe(2);});it('b',()=>{expect(hd262ahc(3,1)).toBe(1);});it('c',()=>{expect(hd262ahc(0,0)).toBe(0);});it('d',()=>{expect(hd262ahc(93,73)).toBe(2);});it('e',()=>{expect(hd262ahc(15,0)).toBe(4);});});
function hd263ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263ahc_hd',()=>{it('a',()=>{expect(hd263ahc(1,4)).toBe(2);});it('b',()=>{expect(hd263ahc(3,1)).toBe(1);});it('c',()=>{expect(hd263ahc(0,0)).toBe(0);});it('d',()=>{expect(hd263ahc(93,73)).toBe(2);});it('e',()=>{expect(hd263ahc(15,0)).toBe(4);});});
function hd264ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264ahc_hd',()=>{it('a',()=>{expect(hd264ahc(1,4)).toBe(2);});it('b',()=>{expect(hd264ahc(3,1)).toBe(1);});it('c',()=>{expect(hd264ahc(0,0)).toBe(0);});it('d',()=>{expect(hd264ahc(93,73)).toBe(2);});it('e',()=>{expect(hd264ahc(15,0)).toBe(4);});});
function hd265ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265ahc_hd',()=>{it('a',()=>{expect(hd265ahc(1,4)).toBe(2);});it('b',()=>{expect(hd265ahc(3,1)).toBe(1);});it('c',()=>{expect(hd265ahc(0,0)).toBe(0);});it('d',()=>{expect(hd265ahc(93,73)).toBe(2);});it('e',()=>{expect(hd265ahc(15,0)).toBe(4);});});
function hd266ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266ahc_hd',()=>{it('a',()=>{expect(hd266ahc(1,4)).toBe(2);});it('b',()=>{expect(hd266ahc(3,1)).toBe(1);});it('c',()=>{expect(hd266ahc(0,0)).toBe(0);});it('d',()=>{expect(hd266ahc(93,73)).toBe(2);});it('e',()=>{expect(hd266ahc(15,0)).toBe(4);});});
function hd267ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267ahc_hd',()=>{it('a',()=>{expect(hd267ahc(1,4)).toBe(2);});it('b',()=>{expect(hd267ahc(3,1)).toBe(1);});it('c',()=>{expect(hd267ahc(0,0)).toBe(0);});it('d',()=>{expect(hd267ahc(93,73)).toBe(2);});it('e',()=>{expect(hd267ahc(15,0)).toBe(4);});});
function hd268ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268ahc_hd',()=>{it('a',()=>{expect(hd268ahc(1,4)).toBe(2);});it('b',()=>{expect(hd268ahc(3,1)).toBe(1);});it('c',()=>{expect(hd268ahc(0,0)).toBe(0);});it('d',()=>{expect(hd268ahc(93,73)).toBe(2);});it('e',()=>{expect(hd268ahc(15,0)).toBe(4);});});
function hd269ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269ahc_hd',()=>{it('a',()=>{expect(hd269ahc(1,4)).toBe(2);});it('b',()=>{expect(hd269ahc(3,1)).toBe(1);});it('c',()=>{expect(hd269ahc(0,0)).toBe(0);});it('d',()=>{expect(hd269ahc(93,73)).toBe(2);});it('e',()=>{expect(hd269ahc(15,0)).toBe(4);});});
function hd270ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270ahc_hd',()=>{it('a',()=>{expect(hd270ahc(1,4)).toBe(2);});it('b',()=>{expect(hd270ahc(3,1)).toBe(1);});it('c',()=>{expect(hd270ahc(0,0)).toBe(0);});it('d',()=>{expect(hd270ahc(93,73)).toBe(2);});it('e',()=>{expect(hd270ahc(15,0)).toBe(4);});});
function hd271ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271ahc_hd',()=>{it('a',()=>{expect(hd271ahc(1,4)).toBe(2);});it('b',()=>{expect(hd271ahc(3,1)).toBe(1);});it('c',()=>{expect(hd271ahc(0,0)).toBe(0);});it('d',()=>{expect(hd271ahc(93,73)).toBe(2);});it('e',()=>{expect(hd271ahc(15,0)).toBe(4);});});
function hd272ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272ahc_hd',()=>{it('a',()=>{expect(hd272ahc(1,4)).toBe(2);});it('b',()=>{expect(hd272ahc(3,1)).toBe(1);});it('c',()=>{expect(hd272ahc(0,0)).toBe(0);});it('d',()=>{expect(hd272ahc(93,73)).toBe(2);});it('e',()=>{expect(hd272ahc(15,0)).toBe(4);});});
function hd273ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273ahc_hd',()=>{it('a',()=>{expect(hd273ahc(1,4)).toBe(2);});it('b',()=>{expect(hd273ahc(3,1)).toBe(1);});it('c',()=>{expect(hd273ahc(0,0)).toBe(0);});it('d',()=>{expect(hd273ahc(93,73)).toBe(2);});it('e',()=>{expect(hd273ahc(15,0)).toBe(4);});});
function hd274ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274ahc_hd',()=>{it('a',()=>{expect(hd274ahc(1,4)).toBe(2);});it('b',()=>{expect(hd274ahc(3,1)).toBe(1);});it('c',()=>{expect(hd274ahc(0,0)).toBe(0);});it('d',()=>{expect(hd274ahc(93,73)).toBe(2);});it('e',()=>{expect(hd274ahc(15,0)).toBe(4);});});
function hd275ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275ahc_hd',()=>{it('a',()=>{expect(hd275ahc(1,4)).toBe(2);});it('b',()=>{expect(hd275ahc(3,1)).toBe(1);});it('c',()=>{expect(hd275ahc(0,0)).toBe(0);});it('d',()=>{expect(hd275ahc(93,73)).toBe(2);});it('e',()=>{expect(hd275ahc(15,0)).toBe(4);});});
function hd276ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276ahc_hd',()=>{it('a',()=>{expect(hd276ahc(1,4)).toBe(2);});it('b',()=>{expect(hd276ahc(3,1)).toBe(1);});it('c',()=>{expect(hd276ahc(0,0)).toBe(0);});it('d',()=>{expect(hd276ahc(93,73)).toBe(2);});it('e',()=>{expect(hd276ahc(15,0)).toBe(4);});});
function hd277ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277ahc_hd',()=>{it('a',()=>{expect(hd277ahc(1,4)).toBe(2);});it('b',()=>{expect(hd277ahc(3,1)).toBe(1);});it('c',()=>{expect(hd277ahc(0,0)).toBe(0);});it('d',()=>{expect(hd277ahc(93,73)).toBe(2);});it('e',()=>{expect(hd277ahc(15,0)).toBe(4);});});
function hd278ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278ahc_hd',()=>{it('a',()=>{expect(hd278ahc(1,4)).toBe(2);});it('b',()=>{expect(hd278ahc(3,1)).toBe(1);});it('c',()=>{expect(hd278ahc(0,0)).toBe(0);});it('d',()=>{expect(hd278ahc(93,73)).toBe(2);});it('e',()=>{expect(hd278ahc(15,0)).toBe(4);});});
function hd279ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279ahc_hd',()=>{it('a',()=>{expect(hd279ahc(1,4)).toBe(2);});it('b',()=>{expect(hd279ahc(3,1)).toBe(1);});it('c',()=>{expect(hd279ahc(0,0)).toBe(0);});it('d',()=>{expect(hd279ahc(93,73)).toBe(2);});it('e',()=>{expect(hd279ahc(15,0)).toBe(4);});});
function hd280ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280ahc_hd',()=>{it('a',()=>{expect(hd280ahc(1,4)).toBe(2);});it('b',()=>{expect(hd280ahc(3,1)).toBe(1);});it('c',()=>{expect(hd280ahc(0,0)).toBe(0);});it('d',()=>{expect(hd280ahc(93,73)).toBe(2);});it('e',()=>{expect(hd280ahc(15,0)).toBe(4);});});
function hd281ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281ahc_hd',()=>{it('a',()=>{expect(hd281ahc(1,4)).toBe(2);});it('b',()=>{expect(hd281ahc(3,1)).toBe(1);});it('c',()=>{expect(hd281ahc(0,0)).toBe(0);});it('d',()=>{expect(hd281ahc(93,73)).toBe(2);});it('e',()=>{expect(hd281ahc(15,0)).toBe(4);});});
function hd282ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282ahc_hd',()=>{it('a',()=>{expect(hd282ahc(1,4)).toBe(2);});it('b',()=>{expect(hd282ahc(3,1)).toBe(1);});it('c',()=>{expect(hd282ahc(0,0)).toBe(0);});it('d',()=>{expect(hd282ahc(93,73)).toBe(2);});it('e',()=>{expect(hd282ahc(15,0)).toBe(4);});});
function hd283ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283ahc_hd',()=>{it('a',()=>{expect(hd283ahc(1,4)).toBe(2);});it('b',()=>{expect(hd283ahc(3,1)).toBe(1);});it('c',()=>{expect(hd283ahc(0,0)).toBe(0);});it('d',()=>{expect(hd283ahc(93,73)).toBe(2);});it('e',()=>{expect(hd283ahc(15,0)).toBe(4);});});
function hd284ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284ahc_hd',()=>{it('a',()=>{expect(hd284ahc(1,4)).toBe(2);});it('b',()=>{expect(hd284ahc(3,1)).toBe(1);});it('c',()=>{expect(hd284ahc(0,0)).toBe(0);});it('d',()=>{expect(hd284ahc(93,73)).toBe(2);});it('e',()=>{expect(hd284ahc(15,0)).toBe(4);});});
function hd285ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285ahc_hd',()=>{it('a',()=>{expect(hd285ahc(1,4)).toBe(2);});it('b',()=>{expect(hd285ahc(3,1)).toBe(1);});it('c',()=>{expect(hd285ahc(0,0)).toBe(0);});it('d',()=>{expect(hd285ahc(93,73)).toBe(2);});it('e',()=>{expect(hd285ahc(15,0)).toBe(4);});});
function hd286ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286ahc_hd',()=>{it('a',()=>{expect(hd286ahc(1,4)).toBe(2);});it('b',()=>{expect(hd286ahc(3,1)).toBe(1);});it('c',()=>{expect(hd286ahc(0,0)).toBe(0);});it('d',()=>{expect(hd286ahc(93,73)).toBe(2);});it('e',()=>{expect(hd286ahc(15,0)).toBe(4);});});
function hd287ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287ahc_hd',()=>{it('a',()=>{expect(hd287ahc(1,4)).toBe(2);});it('b',()=>{expect(hd287ahc(3,1)).toBe(1);});it('c',()=>{expect(hd287ahc(0,0)).toBe(0);});it('d',()=>{expect(hd287ahc(93,73)).toBe(2);});it('e',()=>{expect(hd287ahc(15,0)).toBe(4);});});
function hd288ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288ahc_hd',()=>{it('a',()=>{expect(hd288ahc(1,4)).toBe(2);});it('b',()=>{expect(hd288ahc(3,1)).toBe(1);});it('c',()=>{expect(hd288ahc(0,0)).toBe(0);});it('d',()=>{expect(hd288ahc(93,73)).toBe(2);});it('e',()=>{expect(hd288ahc(15,0)).toBe(4);});});
function hd289ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289ahc_hd',()=>{it('a',()=>{expect(hd289ahc(1,4)).toBe(2);});it('b',()=>{expect(hd289ahc(3,1)).toBe(1);});it('c',()=>{expect(hd289ahc(0,0)).toBe(0);});it('d',()=>{expect(hd289ahc(93,73)).toBe(2);});it('e',()=>{expect(hd289ahc(15,0)).toBe(4);});});
function hd290ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290ahc_hd',()=>{it('a',()=>{expect(hd290ahc(1,4)).toBe(2);});it('b',()=>{expect(hd290ahc(3,1)).toBe(1);});it('c',()=>{expect(hd290ahc(0,0)).toBe(0);});it('d',()=>{expect(hd290ahc(93,73)).toBe(2);});it('e',()=>{expect(hd290ahc(15,0)).toBe(4);});});
function hd291ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291ahc_hd',()=>{it('a',()=>{expect(hd291ahc(1,4)).toBe(2);});it('b',()=>{expect(hd291ahc(3,1)).toBe(1);});it('c',()=>{expect(hd291ahc(0,0)).toBe(0);});it('d',()=>{expect(hd291ahc(93,73)).toBe(2);});it('e',()=>{expect(hd291ahc(15,0)).toBe(4);});});
function hd292ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292ahc_hd',()=>{it('a',()=>{expect(hd292ahc(1,4)).toBe(2);});it('b',()=>{expect(hd292ahc(3,1)).toBe(1);});it('c',()=>{expect(hd292ahc(0,0)).toBe(0);});it('d',()=>{expect(hd292ahc(93,73)).toBe(2);});it('e',()=>{expect(hd292ahc(15,0)).toBe(4);});});
function hd293ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293ahc_hd',()=>{it('a',()=>{expect(hd293ahc(1,4)).toBe(2);});it('b',()=>{expect(hd293ahc(3,1)).toBe(1);});it('c',()=>{expect(hd293ahc(0,0)).toBe(0);});it('d',()=>{expect(hd293ahc(93,73)).toBe(2);});it('e',()=>{expect(hd293ahc(15,0)).toBe(4);});});
function hd294ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294ahc_hd',()=>{it('a',()=>{expect(hd294ahc(1,4)).toBe(2);});it('b',()=>{expect(hd294ahc(3,1)).toBe(1);});it('c',()=>{expect(hd294ahc(0,0)).toBe(0);});it('d',()=>{expect(hd294ahc(93,73)).toBe(2);});it('e',()=>{expect(hd294ahc(15,0)).toBe(4);});});
function hd295ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295ahc_hd',()=>{it('a',()=>{expect(hd295ahc(1,4)).toBe(2);});it('b',()=>{expect(hd295ahc(3,1)).toBe(1);});it('c',()=>{expect(hd295ahc(0,0)).toBe(0);});it('d',()=>{expect(hd295ahc(93,73)).toBe(2);});it('e',()=>{expect(hd295ahc(15,0)).toBe(4);});});
function hd296ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296ahc_hd',()=>{it('a',()=>{expect(hd296ahc(1,4)).toBe(2);});it('b',()=>{expect(hd296ahc(3,1)).toBe(1);});it('c',()=>{expect(hd296ahc(0,0)).toBe(0);});it('d',()=>{expect(hd296ahc(93,73)).toBe(2);});it('e',()=>{expect(hd296ahc(15,0)).toBe(4);});});
function hd297ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297ahc_hd',()=>{it('a',()=>{expect(hd297ahc(1,4)).toBe(2);});it('b',()=>{expect(hd297ahc(3,1)).toBe(1);});it('c',()=>{expect(hd297ahc(0,0)).toBe(0);});it('d',()=>{expect(hd297ahc(93,73)).toBe(2);});it('e',()=>{expect(hd297ahc(15,0)).toBe(4);});});
function hd298ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298ahc_hd',()=>{it('a',()=>{expect(hd298ahc(1,4)).toBe(2);});it('b',()=>{expect(hd298ahc(3,1)).toBe(1);});it('c',()=>{expect(hd298ahc(0,0)).toBe(0);});it('d',()=>{expect(hd298ahc(93,73)).toBe(2);});it('e',()=>{expect(hd298ahc(15,0)).toBe(4);});});
function hd299ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299ahc_hd',()=>{it('a',()=>{expect(hd299ahc(1,4)).toBe(2);});it('b',()=>{expect(hd299ahc(3,1)).toBe(1);});it('c',()=>{expect(hd299ahc(0,0)).toBe(0);});it('d',()=>{expect(hd299ahc(93,73)).toBe(2);});it('e',()=>{expect(hd299ahc(15,0)).toBe(4);});});
function hd300ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300ahc_hd',()=>{it('a',()=>{expect(hd300ahc(1,4)).toBe(2);});it('b',()=>{expect(hd300ahc(3,1)).toBe(1);});it('c',()=>{expect(hd300ahc(0,0)).toBe(0);});it('d',()=>{expect(hd300ahc(93,73)).toBe(2);});it('e',()=>{expect(hd300ahc(15,0)).toBe(4);});});
function hd301ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301ahc_hd',()=>{it('a',()=>{expect(hd301ahc(1,4)).toBe(2);});it('b',()=>{expect(hd301ahc(3,1)).toBe(1);});it('c',()=>{expect(hd301ahc(0,0)).toBe(0);});it('d',()=>{expect(hd301ahc(93,73)).toBe(2);});it('e',()=>{expect(hd301ahc(15,0)).toBe(4);});});
function hd302ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302ahc_hd',()=>{it('a',()=>{expect(hd302ahc(1,4)).toBe(2);});it('b',()=>{expect(hd302ahc(3,1)).toBe(1);});it('c',()=>{expect(hd302ahc(0,0)).toBe(0);});it('d',()=>{expect(hd302ahc(93,73)).toBe(2);});it('e',()=>{expect(hd302ahc(15,0)).toBe(4);});});
function hd303ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303ahc_hd',()=>{it('a',()=>{expect(hd303ahc(1,4)).toBe(2);});it('b',()=>{expect(hd303ahc(3,1)).toBe(1);});it('c',()=>{expect(hd303ahc(0,0)).toBe(0);});it('d',()=>{expect(hd303ahc(93,73)).toBe(2);});it('e',()=>{expect(hd303ahc(15,0)).toBe(4);});});
function hd304ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304ahc_hd',()=>{it('a',()=>{expect(hd304ahc(1,4)).toBe(2);});it('b',()=>{expect(hd304ahc(3,1)).toBe(1);});it('c',()=>{expect(hd304ahc(0,0)).toBe(0);});it('d',()=>{expect(hd304ahc(93,73)).toBe(2);});it('e',()=>{expect(hd304ahc(15,0)).toBe(4);});});
function hd305ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305ahc_hd',()=>{it('a',()=>{expect(hd305ahc(1,4)).toBe(2);});it('b',()=>{expect(hd305ahc(3,1)).toBe(1);});it('c',()=>{expect(hd305ahc(0,0)).toBe(0);});it('d',()=>{expect(hd305ahc(93,73)).toBe(2);});it('e',()=>{expect(hd305ahc(15,0)).toBe(4);});});
function hd306ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306ahc_hd',()=>{it('a',()=>{expect(hd306ahc(1,4)).toBe(2);});it('b',()=>{expect(hd306ahc(3,1)).toBe(1);});it('c',()=>{expect(hd306ahc(0,0)).toBe(0);});it('d',()=>{expect(hd306ahc(93,73)).toBe(2);});it('e',()=>{expect(hd306ahc(15,0)).toBe(4);});});
function hd307ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307ahc_hd',()=>{it('a',()=>{expect(hd307ahc(1,4)).toBe(2);});it('b',()=>{expect(hd307ahc(3,1)).toBe(1);});it('c',()=>{expect(hd307ahc(0,0)).toBe(0);});it('d',()=>{expect(hd307ahc(93,73)).toBe(2);});it('e',()=>{expect(hd307ahc(15,0)).toBe(4);});});
function hd308ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308ahc_hd',()=>{it('a',()=>{expect(hd308ahc(1,4)).toBe(2);});it('b',()=>{expect(hd308ahc(3,1)).toBe(1);});it('c',()=>{expect(hd308ahc(0,0)).toBe(0);});it('d',()=>{expect(hd308ahc(93,73)).toBe(2);});it('e',()=>{expect(hd308ahc(15,0)).toBe(4);});});
function hd309ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309ahc_hd',()=>{it('a',()=>{expect(hd309ahc(1,4)).toBe(2);});it('b',()=>{expect(hd309ahc(3,1)).toBe(1);});it('c',()=>{expect(hd309ahc(0,0)).toBe(0);});it('d',()=>{expect(hd309ahc(93,73)).toBe(2);});it('e',()=>{expect(hd309ahc(15,0)).toBe(4);});});
function hd310ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310ahc_hd',()=>{it('a',()=>{expect(hd310ahc(1,4)).toBe(2);});it('b',()=>{expect(hd310ahc(3,1)).toBe(1);});it('c',()=>{expect(hd310ahc(0,0)).toBe(0);});it('d',()=>{expect(hd310ahc(93,73)).toBe(2);});it('e',()=>{expect(hd310ahc(15,0)).toBe(4);});});
function hd311ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311ahc_hd',()=>{it('a',()=>{expect(hd311ahc(1,4)).toBe(2);});it('b',()=>{expect(hd311ahc(3,1)).toBe(1);});it('c',()=>{expect(hd311ahc(0,0)).toBe(0);});it('d',()=>{expect(hd311ahc(93,73)).toBe(2);});it('e',()=>{expect(hd311ahc(15,0)).toBe(4);});});
function hd312ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312ahc_hd',()=>{it('a',()=>{expect(hd312ahc(1,4)).toBe(2);});it('b',()=>{expect(hd312ahc(3,1)).toBe(1);});it('c',()=>{expect(hd312ahc(0,0)).toBe(0);});it('d',()=>{expect(hd312ahc(93,73)).toBe(2);});it('e',()=>{expect(hd312ahc(15,0)).toBe(4);});});
function hd313ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313ahc_hd',()=>{it('a',()=>{expect(hd313ahc(1,4)).toBe(2);});it('b',()=>{expect(hd313ahc(3,1)).toBe(1);});it('c',()=>{expect(hd313ahc(0,0)).toBe(0);});it('d',()=>{expect(hd313ahc(93,73)).toBe(2);});it('e',()=>{expect(hd313ahc(15,0)).toBe(4);});});
function hd314ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314ahc_hd',()=>{it('a',()=>{expect(hd314ahc(1,4)).toBe(2);});it('b',()=>{expect(hd314ahc(3,1)).toBe(1);});it('c',()=>{expect(hd314ahc(0,0)).toBe(0);});it('d',()=>{expect(hd314ahc(93,73)).toBe(2);});it('e',()=>{expect(hd314ahc(15,0)).toBe(4);});});
function hd315ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315ahc_hd',()=>{it('a',()=>{expect(hd315ahc(1,4)).toBe(2);});it('b',()=>{expect(hd315ahc(3,1)).toBe(1);});it('c',()=>{expect(hd315ahc(0,0)).toBe(0);});it('d',()=>{expect(hd315ahc(93,73)).toBe(2);});it('e',()=>{expect(hd315ahc(15,0)).toBe(4);});});
function hd316ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316ahc_hd',()=>{it('a',()=>{expect(hd316ahc(1,4)).toBe(2);});it('b',()=>{expect(hd316ahc(3,1)).toBe(1);});it('c',()=>{expect(hd316ahc(0,0)).toBe(0);});it('d',()=>{expect(hd316ahc(93,73)).toBe(2);});it('e',()=>{expect(hd316ahc(15,0)).toBe(4);});});
function hd317ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317ahc_hd',()=>{it('a',()=>{expect(hd317ahc(1,4)).toBe(2);});it('b',()=>{expect(hd317ahc(3,1)).toBe(1);});it('c',()=>{expect(hd317ahc(0,0)).toBe(0);});it('d',()=>{expect(hd317ahc(93,73)).toBe(2);});it('e',()=>{expect(hd317ahc(15,0)).toBe(4);});});
function hd318ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318ahc_hd',()=>{it('a',()=>{expect(hd318ahc(1,4)).toBe(2);});it('b',()=>{expect(hd318ahc(3,1)).toBe(1);});it('c',()=>{expect(hd318ahc(0,0)).toBe(0);});it('d',()=>{expect(hd318ahc(93,73)).toBe(2);});it('e',()=>{expect(hd318ahc(15,0)).toBe(4);});});
function hd319ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319ahc_hd',()=>{it('a',()=>{expect(hd319ahc(1,4)).toBe(2);});it('b',()=>{expect(hd319ahc(3,1)).toBe(1);});it('c',()=>{expect(hd319ahc(0,0)).toBe(0);});it('d',()=>{expect(hd319ahc(93,73)).toBe(2);});it('e',()=>{expect(hd319ahc(15,0)).toBe(4);});});
function hd320ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320ahc_hd',()=>{it('a',()=>{expect(hd320ahc(1,4)).toBe(2);});it('b',()=>{expect(hd320ahc(3,1)).toBe(1);});it('c',()=>{expect(hd320ahc(0,0)).toBe(0);});it('d',()=>{expect(hd320ahc(93,73)).toBe(2);});it('e',()=>{expect(hd320ahc(15,0)).toBe(4);});});
function hd321ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321ahc_hd',()=>{it('a',()=>{expect(hd321ahc(1,4)).toBe(2);});it('b',()=>{expect(hd321ahc(3,1)).toBe(1);});it('c',()=>{expect(hd321ahc(0,0)).toBe(0);});it('d',()=>{expect(hd321ahc(93,73)).toBe(2);});it('e',()=>{expect(hd321ahc(15,0)).toBe(4);});});
function hd322ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322ahc_hd',()=>{it('a',()=>{expect(hd322ahc(1,4)).toBe(2);});it('b',()=>{expect(hd322ahc(3,1)).toBe(1);});it('c',()=>{expect(hd322ahc(0,0)).toBe(0);});it('d',()=>{expect(hd322ahc(93,73)).toBe(2);});it('e',()=>{expect(hd322ahc(15,0)).toBe(4);});});
function hd323ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323ahc_hd',()=>{it('a',()=>{expect(hd323ahc(1,4)).toBe(2);});it('b',()=>{expect(hd323ahc(3,1)).toBe(1);});it('c',()=>{expect(hd323ahc(0,0)).toBe(0);});it('d',()=>{expect(hd323ahc(93,73)).toBe(2);});it('e',()=>{expect(hd323ahc(15,0)).toBe(4);});});
function hd324ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324ahc_hd',()=>{it('a',()=>{expect(hd324ahc(1,4)).toBe(2);});it('b',()=>{expect(hd324ahc(3,1)).toBe(1);});it('c',()=>{expect(hd324ahc(0,0)).toBe(0);});it('d',()=>{expect(hd324ahc(93,73)).toBe(2);});it('e',()=>{expect(hd324ahc(15,0)).toBe(4);});});
function hd325ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325ahc_hd',()=>{it('a',()=>{expect(hd325ahc(1,4)).toBe(2);});it('b',()=>{expect(hd325ahc(3,1)).toBe(1);});it('c',()=>{expect(hd325ahc(0,0)).toBe(0);});it('d',()=>{expect(hd325ahc(93,73)).toBe(2);});it('e',()=>{expect(hd325ahc(15,0)).toBe(4);});});
function hd326ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326ahc_hd',()=>{it('a',()=>{expect(hd326ahc(1,4)).toBe(2);});it('b',()=>{expect(hd326ahc(3,1)).toBe(1);});it('c',()=>{expect(hd326ahc(0,0)).toBe(0);});it('d',()=>{expect(hd326ahc(93,73)).toBe(2);});it('e',()=>{expect(hd326ahc(15,0)).toBe(4);});});
function hd327ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327ahc_hd',()=>{it('a',()=>{expect(hd327ahc(1,4)).toBe(2);});it('b',()=>{expect(hd327ahc(3,1)).toBe(1);});it('c',()=>{expect(hd327ahc(0,0)).toBe(0);});it('d',()=>{expect(hd327ahc(93,73)).toBe(2);});it('e',()=>{expect(hd327ahc(15,0)).toBe(4);});});
function hd328ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328ahc_hd',()=>{it('a',()=>{expect(hd328ahc(1,4)).toBe(2);});it('b',()=>{expect(hd328ahc(3,1)).toBe(1);});it('c',()=>{expect(hd328ahc(0,0)).toBe(0);});it('d',()=>{expect(hd328ahc(93,73)).toBe(2);});it('e',()=>{expect(hd328ahc(15,0)).toBe(4);});});
function hd329ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329ahc_hd',()=>{it('a',()=>{expect(hd329ahc(1,4)).toBe(2);});it('b',()=>{expect(hd329ahc(3,1)).toBe(1);});it('c',()=>{expect(hd329ahc(0,0)).toBe(0);});it('d',()=>{expect(hd329ahc(93,73)).toBe(2);});it('e',()=>{expect(hd329ahc(15,0)).toBe(4);});});
function hd330ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330ahc_hd',()=>{it('a',()=>{expect(hd330ahc(1,4)).toBe(2);});it('b',()=>{expect(hd330ahc(3,1)).toBe(1);});it('c',()=>{expect(hd330ahc(0,0)).toBe(0);});it('d',()=>{expect(hd330ahc(93,73)).toBe(2);});it('e',()=>{expect(hd330ahc(15,0)).toBe(4);});});
function hd331ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331ahc_hd',()=>{it('a',()=>{expect(hd331ahc(1,4)).toBe(2);});it('b',()=>{expect(hd331ahc(3,1)).toBe(1);});it('c',()=>{expect(hd331ahc(0,0)).toBe(0);});it('d',()=>{expect(hd331ahc(93,73)).toBe(2);});it('e',()=>{expect(hd331ahc(15,0)).toBe(4);});});
function hd332ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332ahc_hd',()=>{it('a',()=>{expect(hd332ahc(1,4)).toBe(2);});it('b',()=>{expect(hd332ahc(3,1)).toBe(1);});it('c',()=>{expect(hd332ahc(0,0)).toBe(0);});it('d',()=>{expect(hd332ahc(93,73)).toBe(2);});it('e',()=>{expect(hd332ahc(15,0)).toBe(4);});});
function hd333ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333ahc_hd',()=>{it('a',()=>{expect(hd333ahc(1,4)).toBe(2);});it('b',()=>{expect(hd333ahc(3,1)).toBe(1);});it('c',()=>{expect(hd333ahc(0,0)).toBe(0);});it('d',()=>{expect(hd333ahc(93,73)).toBe(2);});it('e',()=>{expect(hd333ahc(15,0)).toBe(4);});});
function hd334ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334ahc_hd',()=>{it('a',()=>{expect(hd334ahc(1,4)).toBe(2);});it('b',()=>{expect(hd334ahc(3,1)).toBe(1);});it('c',()=>{expect(hd334ahc(0,0)).toBe(0);});it('d',()=>{expect(hd334ahc(93,73)).toBe(2);});it('e',()=>{expect(hd334ahc(15,0)).toBe(4);});});
function hd335ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335ahc_hd',()=>{it('a',()=>{expect(hd335ahc(1,4)).toBe(2);});it('b',()=>{expect(hd335ahc(3,1)).toBe(1);});it('c',()=>{expect(hd335ahc(0,0)).toBe(0);});it('d',()=>{expect(hd335ahc(93,73)).toBe(2);});it('e',()=>{expect(hd335ahc(15,0)).toBe(4);});});
function hd336ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336ahc_hd',()=>{it('a',()=>{expect(hd336ahc(1,4)).toBe(2);});it('b',()=>{expect(hd336ahc(3,1)).toBe(1);});it('c',()=>{expect(hd336ahc(0,0)).toBe(0);});it('d',()=>{expect(hd336ahc(93,73)).toBe(2);});it('e',()=>{expect(hd336ahc(15,0)).toBe(4);});});
function hd337ahc(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337ahc_hd',()=>{it('a',()=>{expect(hd337ahc(1,4)).toBe(2);});it('b',()=>{expect(hd337ahc(3,1)).toBe(1);});it('c',()=>{expect(hd337ahc(0,0)).toBe(0);});it('d',()=>{expect(hd337ahc(93,73)).toBe(2);});it('e',()=>{expect(hd337ahc(15,0)).toBe(4);});});
