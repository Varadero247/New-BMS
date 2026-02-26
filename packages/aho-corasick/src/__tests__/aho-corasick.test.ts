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
