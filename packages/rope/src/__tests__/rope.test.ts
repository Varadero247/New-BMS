// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { Rope, ropeConcat, ropeInsert, ropeDelete, ropeSubstring, rebalance } from '../rope';

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function naiveInsert(s: string, index: number, ins: string): string {
  const i = Math.max(0, Math.min(index, s.length));
  return s.slice(0, i) + ins + s.slice(i);
}
function naiveDelete(s: string, start: number, end: number): string {
  const s2 = Math.max(0, Math.min(start, s.length));
  const e2 = Math.max(0, Math.min(end, s.length));
  return s.slice(0, s2) + s.slice(e2);
}

// ---------------------------------------------------------------------------
// 1. constructor / toString — 100 tests
// ---------------------------------------------------------------------------
describe('constructor and toString', () => {
  const cases: string[] = [];
  cases.push('');
  cases.push('a');
  cases.push('ab');
  cases.push('abc');
  cases.push('hello world');
  cases.push('The quick brown fox');
  // 6 manual, fill remaining 94 with generated strings
  for (let i = 0; i < 94; i++) {
    cases.push('x'.repeat(i) + String.fromCharCode(65 + (i % 26)));
  }

  for (let i = 0; i < 100; i++) {
    const s = cases[i] ?? '';
    it(`toString #${i}: Rope("${s.slice(0, 20)}") === original`, () => {
      expect(new Rope(s).toString()).toBe(s);
    });
  }
});

// ---------------------------------------------------------------------------
// 2. static from() toString — 10 tests
// ---------------------------------------------------------------------------
describe('static from', () => {
  const samples = ['', 'a', 'hello', 'world', '12345', 'abcdefghijklmnop', 'UPPER', 'mixed123', 'spaces here', 'end'];
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    it(`Rope.from("${s}").toString()`, () => {
      expect(Rope.from(s).toString()).toBe(s);
    });
  }
});

// ---------------------------------------------------------------------------
// 3. length — 100 tests
// ---------------------------------------------------------------------------
describe('length', () => {
  it('empty string has length 0', () => {
    expect(new Rope('').length).toBe(0);
  });

  for (let i = 1; i <= 99; i++) {
    const s = 'a'.repeat(i);
    it(`length of ${'a'.repeat(Math.min(i, 5))}... (len=${i})`, () => {
      expect(new Rope(s).length).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// 4. charAt — 150 tests
// ---------------------------------------------------------------------------
describe('charAt', () => {
  // Out-of-bounds returns ''
  it('charAt(-1) returns empty string', () => {
    expect(new Rope('hello').charAt(-1)).toBe('');
  });
  it('charAt(length) returns empty string', () => {
    const r = new Rope('hello');
    expect(r.charAt(r.length)).toBe('');
  });

  // Every character of a set of strings
  const testStrings = [
    'abcdefghijklmnop',            // 16
    'Hello, World!',               // 13
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',  // 26
    '0123456789',                  // 10
    'The quick brown fox jumps',   // 25
    'over the lazy dog',           // 18
    'pack my box with five',       // 21
    'dozen liquor jugs',           // 18
  ];

  let count = 0;
  for (const s of testStrings) {
    for (let i = 0; i < s.length && count < 148; i++, count++) {
      const idx = i;
      const str = s;
      it(`charAt(${idx}) in "${str.slice(0, 10)}..."`, () => {
        expect(new Rope(str).charAt(idx)).toBe(str[idx]);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 5. substring — 150 tests
// ---------------------------------------------------------------------------
describe('substring', () => {
  it('empty string substring returns empty', () => {
    expect(new Rope('').substring(0, 0)).toBe('');
  });
  it('start === end returns empty', () => {
    expect(new Rope('hello').substring(2, 2)).toBe('');
  });
  it('start > end returns empty', () => {
    expect(new Rope('hello').substring(4, 2)).toBe('');
  });

  const bases = [
    'abcdefghijklmnopqrstuvwxyz',
    'The quick brown fox jumps over',
    '0123456789abcdef',
    'HELLO WORLD THIS IS A TEST',
    'rope data structure test',
  ];

  let count = 0;
  for (const s of bases) {
    const len = s.length;
    for (let start = 0; start < len && count < 147; start += 2) {
      for (let end = start; end <= len && count < 147; end += 3, count++) {
        const st = start, en = end, str = s;
        it(`substring(${st},${en}) of "${str.slice(0, 12)}..."`, () => {
          expect(new Rope(str).substring(st, en)).toBe(str.substring(st, en));
        });
      }
    }
  }
});

// ---------------------------------------------------------------------------
// 6. concat (Rope method) — 100 tests
// ---------------------------------------------------------------------------
describe('Rope#concat', () => {
  it('empty + empty', () => {
    expect(new Rope('').concat(new Rope('')).toString()).toBe('');
  });
  it('empty + string', () => {
    expect(new Rope('').concat(new Rope('hello')).toString()).toBe('hello');
  });
  it('string + empty', () => {
    expect(new Rope('hello').concat(new Rope('')).toString()).toBe('hello');
  });

  const lefts  = ['a', 'ab', 'hello', 'foo', 'The quick', 'UPPER', '12345', 'xyz', 'part1', 'alpha'];
  const rights = ['b', 'cd', 'world', 'bar', ' brown fox', 'lower', '67890', 'abc', 'part2', 'beta'];

  for (let i = 0; i < lefts.length; i++) {
    for (let j = 0; j < rights.length; j++) {
      const a = lefts[i], b = rights[j];
      it(`concat "${a}" + "${b}"`, () => {
        expect(new Rope(a).concat(new Rope(b)).toString()).toBe(a + b);
      });
    }
  }
  // 3 manual + 100 generated = 103, fine
});

// ---------------------------------------------------------------------------
// 7. Rope.concat static — 20 tests
// ---------------------------------------------------------------------------
describe('Rope.concat static', () => {
  it('no args returns empty', () => {
    expect(Rope.concat().toString()).toBe('');
  });
  it('single rope returns same content', () => {
    expect(Rope.concat(new Rope('hello')).toString()).toBe('hello');
  });

  const parts = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'];
  for (let n = 2; n <= 5; n++) {
    for (let i = 0; i <= 5 - n; i++) {
      const slice = parts.slice(i, i + n);
      it(`Rope.concat(${slice.join(', ')})`, () => {
        const ropes = slice.map((s) => new Rope(s));
        expect(Rope.concat(...ropes).toString()).toBe(slice.join(''));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 8. split — 100 tests
// ---------------------------------------------------------------------------
describe('split', () => {
  it('split at 0 gives empty left', () => {
    const [l, r] = new Rope('hello').split(0);
    expect(l.toString()).toBe('');
    expect(r.toString()).toBe('hello');
  });
  it('split at length gives empty right', () => {
    const r = new Rope('hello');
    const [l, ri] = r.split(r.length);
    expect(l.toString()).toBe('hello');
    expect(ri.toString()).toBe('');
  });
  it('split preserves content', () => {
    const s = 'abcdefgh';
    const [l, r] = new Rope(s).split(4);
    expect(l.toString() + r.toString()).toBe(s);
  });

  const strings = [
    'abcdefghijklmnopqrstuvwxyz',
    'The quick brown fox',
    'hello world test',
    '0123456789',
    'RopeDataStructure',
    'aaaaaaaaaaaaaaaa',
    'ABCDEFGHabcdefgh',
    'Split me correctly',
    'test123test456',
    'endofstring',
  ];

  for (const s of strings) {
    for (let i = 1; i < s.length; i += Math.max(1, Math.floor(s.length / 10))) {
      const idx = i;
      const str = s;
      it(`split("${str.slice(0, 10)}...") at ${idx}`, () => {
        const [l, r] = new Rope(str).split(idx);
        expect(l.toString() + r.toString()).toBe(str);
        expect(l.toString()).toBe(str.slice(0, idx));
        expect(r.toString()).toBe(str.slice(idx));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// 9. insert — 100 tests
// ---------------------------------------------------------------------------
describe('insert', () => {
  it('insert into empty creates string', () => {
    expect(new Rope('').insert(0, 'hi').toString()).toBe('hi');
  });
  it('insert at start prepends', () => {
    expect(new Rope('world').insert(0, 'hello ').toString()).toBe('hello world');
  });
  it('insert at end appends', () => {
    const r = new Rope('hello');
    expect(r.insert(r.length, ' world').toString()).toBe('hello world');
  });
  it('insert in middle', () => {
    expect(new Rope('helloworld').insert(5, ' ').toString()).toBe('hello world');
  });

  const bases = [
    'abcdefgh',
    'hello world',
    'test string',
    'rope insert',
    '0123456789',
    'UPPERCASE',
    'mixed123ABC',
    'short',
    'longer string here',
    'abcdefghijklmnopqrst',
  ];
  const inserts = ['X', 'YZ', '123', '--', '..', '!', 'INSERT', 'mid', 'end', 'start'];

  let count = 0;
  for (const base of bases) {
    for (const ins of inserts) {
      if (count >= 96) break;
      for (let i = 0; i <= base.length && count < 96; i += Math.max(1, Math.floor(base.length / 3)), count++) {
        const idx = i;
        const b = base, s = ins;
        it(`insert "${s}" into "${b.slice(0,8)}..." at ${idx}`, () => {
          expect(new Rope(b).insert(idx, s).toString()).toBe(naiveInsert(b, idx, s));
        });
      }
    }
  }
});

// ---------------------------------------------------------------------------
// 10. delete — 100 tests
// ---------------------------------------------------------------------------
describe('delete', () => {
  it('delete nothing (start===end) returns original', () => {
    expect(new Rope('hello').delete(2, 2).toString()).toBe('hello');
  });
  it('delete everything returns empty', () => {
    const r = new Rope('hello');
    expect(r.delete(0, r.length).toString()).toBe('');
  });
  it('delete from start', () => {
    expect(new Rope('hello world').delete(0, 6).toString()).toBe('world');
  });
  it('delete from end', () => {
    expect(new Rope('hello world').delete(5, 11).toString()).toBe('hello');
  });
  it('delete middle', () => {
    expect(new Rope('hello world').delete(5, 6).toString()).toBe('helloworld');
  });

  const bases = [
    'abcdefghijklmnopqrstuvwxyz',
    'hello world test',
    '0123456789',
    'delete me entirely',
    'short',
    'ABCDEFGHIJKLMNO',
    'rope delete test case',
    'aabbccddee',
    'the quick brown',
    'fox jumps over',
  ];

  let count = 0;
  for (const s of bases) {
    const len = s.length;
    for (let start = 0; start < len && count < 95; start += Math.max(1, Math.floor(len / 5))) {
      for (let end = start + 1; end <= len && count < 95; end += Math.max(1, Math.floor(len / 4)), count++) {
        const st = start, en = end, str = s;
        it(`delete [${st},${en}) from "${str.slice(0,10)}..."`, () => {
          expect(new Rope(str).delete(st, en).toString()).toBe(naiveDelete(str, st, en));
        });
      }
    }
  }
});

// ---------------------------------------------------------------------------
// 11. indexOf — 50 tests
// ---------------------------------------------------------------------------
describe('indexOf', () => {
  it('empty needle returns 0', () => {
    expect(new Rope('hello').indexOf('')).toBe(0);
  });
  it('not found returns -1', () => {
    expect(new Rope('hello').indexOf('xyz')).toBe(-1);
  });
  it('found at start', () => {
    expect(new Rope('hello world').indexOf('hello')).toBe(0);
  });
  it('found at end', () => {
    expect(new Rope('hello world').indexOf('world')).toBe(6);
  });
  it('single char found', () => {
    expect(new Rope('abcde').indexOf('c')).toBe(2);
  });

  const haystacks = [
    'abcdefghijklmnopqrstuvwxyz',
    'the quick brown fox',
    'hello world hello',
    'aaabbbcccdddeee',
    '0123456789012345',
    'UPPER lower Mixed',
    'repeat repeat repeat',
    'one two three four',
    'find the needle here',
    'last occurrence test',
  ];
  const needles  = ['abc', 'xyz', 'the', 'fox', '999', 'def', 'brown', 'two', 'needle', 'last'];

  for (let i = 0; i < haystacks.length && i < 45; i++) {
    const h = haystacks[i], n = needles[i];
    it(`indexOf "${n}" in "${h.slice(0,20)}..."`, () => {
      expect(new Rope(h).indexOf(n)).toBe(h.indexOf(n));
    });
  }
});

// ---------------------------------------------------------------------------
// 12. ropeConcat standalone — 20 tests
// ---------------------------------------------------------------------------
describe('ropeConcat', () => {
  const lefts  = ['', 'a', 'hello', 'foo', 'The ', 'UPPER', '12345', 'xyz', 'part1-', 'alpha'];
  const rights = ['', 'b', 'world', 'bar', 'end',  'lower', '67890', 'abc', 'part2',  'beta'];

  for (let i = 0; i < 10; i++) {
    const a = lefts[i], b = rights[i];
    it(`ropeConcat("${a}", "${b}")`, () => {
      expect(ropeConcat(a, b).toString()).toBe(a + b);
    });
  }

  // 10 more with length checks
  for (let i = 0; i < 10; i++) {
    const a = lefts[i] + '-extra', b = rights[i] + '-more';
    it(`ropeConcat length check ${i}`, () => {
      const r = ropeConcat(a, b);
      expect(r.length).toBe(a.length + b.length);
    });
  }
});

// ---------------------------------------------------------------------------
// 13. ropeInsert standalone — 15 tests
// ---------------------------------------------------------------------------
describe('ropeInsert', () => {
  it('ropeInsert basic', () => {
    expect(ropeInsert('helloworld', 5, ' ')).toBe('hello world');
  });
  it('ropeInsert at start', () => {
    expect(ropeInsert('world', 0, 'hello ')).toBe('hello world');
  });
  it('ropeInsert at end', () => {
    expect(ropeInsert('hello', 5, ' world')).toBe('hello world');
  });

  const bases    = ['abcde', 'hello', '12345', 'UPPER', 'test1', 'xyzw',  'test', 'abcd', 'ef', 'rope'];
  const inserts2 = ['X',     'mid',   '0',    'lower', 'INS',   '--',    '!!',   'qq',   'ZZ', 'GO'];
  const indices  = [2,        2,       0,      3,       4,       1,       2,      3,      1,    0];

  for (let i = 0; i < 10; i++) {
    const b = bases[i], ins = inserts2[i], idx = indices[i];
    it(`ropeInsert("${b}", ${idx}, "${ins}")`, () => {
      expect(ropeInsert(b, idx, ins)).toBe(naiveInsert(b, idx, ins));
    });
  }
  // 3 already + 10 loop = 13, add 2 more
  it('ropeInsert empty base', () => {
    expect(ropeInsert('', 0, 'hello')).toBe('hello');
  });
  it('ropeInsert empty insert', () => {
    expect(ropeInsert('hello', 2, '')).toBe('hello');
  });
});

// ---------------------------------------------------------------------------
// 14. ropeDelete standalone — 15 tests
// ---------------------------------------------------------------------------
describe('ropeDelete', () => {
  it('ropeDelete basic', () => {
    expect(ropeDelete('hello world', 5, 6)).toBe('helloworld');
  });
  it('ropeDelete from start', () => {
    expect(ropeDelete('hello world', 0, 6)).toBe('world');
  });
  it('ropeDelete to end', () => {
    expect(ropeDelete('hello world', 5, 11)).toBe('hello');
  });
  it('ropeDelete nothing (same indices)', () => {
    expect(ropeDelete('hello', 2, 2)).toBe('hello');
  });
  it('ropeDelete everything', () => {
    expect(ropeDelete('hello', 0, 5)).toBe('');
  });

  const bases2  = ['abcdefgh', 'hello world', '0123456789', 'ABCDEFGH', 'test string'];
  const starts2 = [1,           0,             3,             2,          4];
  const ends2   = [3,           5,             7,             6,          9];

  for (let i = 0; i < 5; i++) {
    const b = bases2[i], st = starts2[i], en = ends2[i];
    it(`ropeDelete("${b}", ${st}, ${en})`, () => {
      expect(ropeDelete(b, st, en)).toBe(naiveDelete(b, st, en));
    });
  }

  // 5 more variety
  it('ropeDelete single char middle', () => { expect(ropeDelete('abcde', 2, 3)).toBe('abde'); });
  it('ropeDelete last char', () => { expect(ropeDelete('abcde', 4, 5)).toBe('abcd'); });
  it('ropeDelete first char', () => { expect(ropeDelete('abcde', 0, 1)).toBe('bcde'); });
  it('ropeDelete clamped start', () => { expect(ropeDelete('hello', -2, 3)).toBe('lo'); });
  it('ropeDelete clamped end', () => { expect(ropeDelete('hello', 2, 100)).toBe('he'); });
});

// ---------------------------------------------------------------------------
// 15. ropeSubstring standalone — 20 tests
// ---------------------------------------------------------------------------
describe('ropeSubstring', () => {
  it('full string', () => {
    expect(ropeSubstring('hello', 0, 5)).toBe('hello');
  });
  it('empty range', () => {
    expect(ropeSubstring('hello', 2, 2)).toBe('');
  });
  it('start only', () => {
    expect(ropeSubstring('hello world', 0, 5)).toBe('hello');
  });
  it('end only', () => {
    expect(ropeSubstring('hello world', 6, 11)).toBe('world');
  });
  it('middle', () => {
    expect(ropeSubstring('abcdefgh', 2, 6)).toBe('cdef');
  });

  const bases3   = ['0123456789', 'abcdefghij', 'ABCDEFGHIJ', 'hello world', 'ropedatastructure'];
  const starts3  = [0, 1, 2, 3, 4];
  const ends3    = [5, 4, 7, 8, 10];

  for (let i = 0; i < 5; i++) {
    const b = bases3[i], st = starts3[i], en = ends3[i];
    it(`ropeSubstring("${b}", ${st}, ${en})`, () => {
      expect(ropeSubstring(b, st, en)).toBe(b.substring(st, en));
    });
  }

  // 10 more
  for (let i = 0; i < 10; i++) {
    const b = 'abcdefghijklmnopqrstuvwxyz';
    const st = i * 2;
    const en = i * 2 + 5;
    it(`ropeSubstring alphabet [${st},${en})`, () => {
      expect(ropeSubstring(b, st, en)).toBe(b.substring(st, en));
    });
  }
});

// ---------------------------------------------------------------------------
// 16. rebalance — 20 tests
// ---------------------------------------------------------------------------
describe('rebalance', () => {
  it('rebalanced rope preserves content', () => {
    const r = new Rope('hello world');
    expect(rebalance(r).toString()).toBe('hello world');
  });
  it('rebalanced length matches', () => {
    const r = new Rope('test string');
    const rb = rebalance(r);
    expect(rb.length).toBe(r.length);
  });
  it('rebalance empty rope', () => {
    expect(rebalance(new Rope('')).toString()).toBe('');
  });
  it('rebalance single char', () => {
    expect(rebalance(new Rope('x')).toString()).toBe('x');
  });

  const strings2 = [
    'abcdefghijklmnopqrstuvwxyz',
    'The quick brown fox jumps over the lazy dog',
    '0123456789',
    'UPPER CASE STRING',
    'short',
    'a longer string for rebalance testing purposes',
    'mixed123ABC!@#',
    'spaces   between   words',
  ];

  for (const s of strings2) {
    it(`rebalance preserves "${s.slice(0, 20)}..."`, () => {
      const r = new Rope(s);
      expect(rebalance(r).toString()).toBe(s);
    });
  }

  // 4 + 8 = 12, need 8 more
  it('rebalance chained concat', () => {
    let r = new Rope('');
    for (let i = 0; i < 20; i++) r = r.concat(new Rope('abc'));
    expect(rebalance(r).toString()).toBe('abc'.repeat(20));
  });
  it('rebalance charAt still works', () => {
    const s = 'rebalance test';
    const r = rebalance(new Rope(s));
    expect(r.charAt(3)).toBe(s[3]);
  });
  it('rebalance substring still works', () => {
    const s = 'rebalance substring test';
    const r = rebalance(new Rope(s));
    expect(r.substring(10, 19)).toBe(s.substring(10, 19));
  });
  it('rebalance insert still works', () => {
    const s = 'rebalance';
    const r = rebalance(new Rope(s));
    expect(r.insert(4, 'X').toString()).toBe(naiveInsert(s, 4, 'X'));
  });
  it('rebalance delete still works', () => {
    const s = 'rebalance test';
    const r = rebalance(new Rope(s));
    expect(r.delete(3, 6).toString()).toBe(naiveDelete(s, 3, 6));
  });
  it('rebalance split still works', () => {
    const s = 'rebalanced';
    const r = rebalance(new Rope(s));
    const [l, ri] = r.split(5);
    expect(l.toString() + ri.toString()).toBe(s);
  });
  it('rebalance indexOf still works', () => {
    const s = 'find the needle in haystack';
    const r = rebalance(new Rope(s));
    expect(r.indexOf('needle')).toBe(s.indexOf('needle'));
  });
  it('rebalance on already-balanced rope', () => {
    const r = new Rope('already balanced rope string');
    const rb = rebalance(r);
    expect(rb.toString()).toBe(r.toString());
  });
});

// ---------------------------------------------------------------------------
// 17. edge cases and large strings — 50 tests
// ---------------------------------------------------------------------------
describe('edge cases', () => {
  it('large string constructor', () => {
    const s = 'x'.repeat(1000);
    expect(new Rope(s).length).toBe(1000);
  });
  it('large string toString', () => {
    const s = 'ab'.repeat(500);
    expect(new Rope(s).toString()).toBe(s);
  });
  it('large string charAt', () => {
    const s = 'abcde'.repeat(200);
    expect(new Rope(s).charAt(499)).toBe(s[499]);
  });
  it('large string substring', () => {
    const s = 'abcdefghij'.repeat(100);
    expect(new Rope(s).substring(100, 200)).toBe(s.substring(100, 200));
  });
  it('many small concats', () => {
    let r = new Rope('');
    let expected = '';
    for (let i = 0; i < 50; i++) {
      const ch = String.fromCharCode(65 + (i % 26));
      r = r.concat(new Rope(ch));
      expected += ch;
    }
    expect(r.toString()).toBe(expected);
  });

  it('insert at every position of short string', () => {
    const base = 'hello';
    for (let i = 0; i <= base.length; i++) {
      expect(new Rope(base).insert(i, 'X').toString()).toBe(naiveInsert(base, i, 'X'));
    }
  });
  it('delete each single char', () => {
    const base = 'abcde';
    for (let i = 0; i < base.length; i++) {
      expect(new Rope(base).delete(i, i + 1).toString()).toBe(naiveDelete(base, i, i + 1));
    }
  });

  // charAt boundary for various lengths
  for (let len = 1; len <= 20; len++) {
    const s = 'a'.repeat(len);
    it(`charAt last index of length-${len} string`, () => {
      expect(new Rope(s).charAt(len - 1)).toBe('a');
    });
  }

  // substring clamping
  it('substring with negative start', () => {
    expect(new Rope('hello').substring(-1, 3)).toBe('hel');
  });
  it('substring with end > length', () => {
    expect(new Rope('hello').substring(2, 100)).toBe('llo');
  });
  it('substring whole string', () => {
    const s = 'complete string';
    expect(new Rope(s).substring(0, s.length)).toBe(s);
  });

  // indexOf edge cases
  it('indexOf with multi-leaf rope', () => {
    const r = new Rope('hello').concat(new Rope(' world'));
    expect(r.indexOf('world')).toBe(6);
  });
  it('indexOf needle longer than rope', () => {
    expect(new Rope('hi').indexOf('hello world')).toBe(-1);
  });
  it('indexOf full match', () => {
    const s = 'find me';
    expect(new Rope(s).indexOf(s)).toBe(0);
  });
  it('indexOf repeated pattern', () => {
    const s = 'ababab';
    expect(new Rope(s).indexOf('ab')).toBe(0);
  });

  // concat produces correct length
  for (let i = 0; i < 5; i++) {
    const a = 'x'.repeat(i * 3);
    const b = 'y'.repeat(i * 2 + 1);
    it(`concat length ${a.length}+${b.length}`, () => {
      expect(new Rope(a).concat(new Rope(b)).length).toBe(a.length + b.length);
    });
  }
});

// ---------------------------------------------------------------------------
// 18. chaining operations — 30 tests
// ---------------------------------------------------------------------------
describe('chaining operations', () => {
  it('insert then delete', () => {
    const s = 'hello world';
    const r = new Rope(s).insert(5, ' beautiful').delete(5, 15);
    expect(r.toString()).toBe(s);
  });
  it('concat then split', () => {
    const a = 'hello', b = ' world';
    const r = new Rope(a).concat(new Rope(b));
    const [l, ri] = r.split(a.length);
    expect(l.toString()).toBe(a);
    expect(ri.toString()).toBe(b);
  });
  it('multiple inserts', () => {
    let r = new Rope('ace');
    r = r.insert(1, 'b');
    r = r.insert(3, 'd');
    expect(r.toString()).toBe('abcde');
  });
  it('multiple deletes', () => {
    let r = new Rope('aXbXcXd');
    r = r.delete(1, 2);
    r = r.delete(2, 3);
    r = r.delete(3, 4);
    expect(r.toString()).toBe('abcd');
  });
  it('insert at start repeatedly', () => {
    let r = new Rope('');
    for (let i = 4; i >= 0; i--) {
      r = r.insert(0, String(i));
    }
    expect(r.toString()).toBe('01234');
  });
  it('insert at end repeatedly', () => {
    let r = new Rope('');
    for (let i = 0; i < 5; i++) {
      r = r.insert(r.length, String(i));
    }
    expect(r.toString()).toBe('01234');
  });

  // 6 manual + 24 generated
  for (let i = 0; i < 24; i++) {
    const base = 'abcdefghij';
    const insPos = i % (base.length + 1);
    const ins = 'X'.repeat((i % 3) + 1);
    const expected_s = naiveInsert(base, insPos, ins);
    const delStart = Math.min(insPos, expected_s.length);
    const delEnd = Math.min(delStart + ins.length, expected_s.length);
    it(`chain insert+delete #${i}`, () => {
      const r = new Rope(base).insert(insPos, ins).delete(delStart, delEnd);
      expect(r.toString()).toBe(base);
    });
  }
});

// ---------------------------------------------------------------------------
// 19. Rope.from and instanceof checks — 10 tests
// ---------------------------------------------------------------------------
describe('Rope.from', () => {
  it('returns Rope instance', () => {
    expect(Rope.from('hello')).toBeInstanceOf(Rope);
  });
  it('same content as constructor', () => {
    const s = 'test string';
    expect(Rope.from(s).toString()).toBe(new Rope(s).toString());
  });
  it('same length as constructor', () => {
    const s = 'length check';
    expect(Rope.from(s).length).toBe(new Rope(s).length);
  });
  it('Rope.from empty', () => {
    expect(Rope.from('').toString()).toBe('');
  });
  it('Rope.from supports charAt', () => {
    const s = 'charAt test';
    expect(Rope.from(s).charAt(4)).toBe(s[4]);
  });
  it('Rope.from supports substring', () => {
    const s = 'substring from test';
    expect(Rope.from(s).substring(0, 9)).toBe(s.substring(0, 9));
  });
  it('Rope.from supports concat', () => {
    expect(Rope.from('hello').concat(Rope.from(' world')).toString()).toBe('hello world');
  });
  it('Rope.from supports insert', () => {
    expect(Rope.from('helloworld').insert(5, ' ').toString()).toBe('hello world');
  });
  it('Rope.from supports delete', () => {
    expect(Rope.from('hello world').delete(5, 6).toString()).toBe('helloworld');
  });
  it('Rope.from supports indexOf', () => {
    const s = 'find needle here';
    expect(Rope.from(s).indexOf('needle')).toBe(s.indexOf('needle'));
  });
});

// ---------------------------------------------------------------------------
// 20. Extra coverage to ensure ≥1,000 total tests
// ---------------------------------------------------------------------------
describe('extra coverage', () => {
  // 50 more charAt tests across varied strings
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  for (let i = 0; i < 50; i++) {
    const s = alphabet.slice(i % 40, (i % 40) + 15);
    const idx = i % s.length;
    it(`extra charAt ${i}: index ${idx} in "${s}"`, () => {
      expect(new Rope(s).charAt(idx)).toBe(s[idx]);
    });
  }

  // 50 more substring tests
  for (let i = 0; i < 50; i++) {
    const s = 'The quick brown fox jumps over the lazy dog';
    const start = i % s.length;
    const end = Math.min(start + (i % 10) + 1, s.length);
    it(`extra substring ${i}: [${start},${end})`, () => {
      expect(new Rope(s).substring(start, end)).toBe(s.substring(start, end));
    });
  }

  // 50 more concat tests
  for (let i = 0; i < 50; i++) {
    const a = alphabet.slice(0, i % 30 + 1);
    const b = alphabet.slice(i % 20, i % 20 + 10);
    it(`extra concat ${i}: len=${a.length}+${b.length}`, () => {
      expect(new Rope(a).concat(new Rope(b)).toString()).toBe(a + b);
    });
  }

  // 50 more insert tests
  for (let i = 0; i < 50; i++) {
    const s = 'insertbase' + i;
    const idx = i % (s.length + 1);
    const ins = 'I' + i;
    it(`extra insert ${i}: pos ${idx}`, () => {
      expect(new Rope(s).insert(idx, ins).toString()).toBe(naiveInsert(s, idx, ins));
    });
  }

  // 50 more delete tests
  for (let i = 0; i < 50; i++) {
    const s = 'deletebase' + ('x'.repeat(i % 10));
    const start = i % Math.max(1, s.length);
    const end = Math.min(start + 3, s.length);
    it(`extra delete ${i}: [${start},${end})`, () => {
      expect(new Rope(s).delete(start, end).toString()).toBe(naiveDelete(s, start, end));
    });
  }

  // 30 more length tests
  for (let i = 0; i < 30; i++) {
    const s = (i % 2 === 0 ? 'even' : 'odd').repeat(i + 1);
    it(`extra length ${i}: string of len ${s.length}`, () => {
      expect(new Rope(s).length).toBe(s.length);
    });
  }

  // 20 more split tests
  for (let i = 0; i < 20; i++) {
    const s = 'splitteststring' + i;
    const idx = i % s.length;
    it(`extra split ${i} at ${idx}`, () => {
      const [l, r] = new Rope(s).split(idx);
      expect(l.toString() + r.toString()).toBe(s);
    });
  }
});
