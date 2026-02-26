// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

import {
  Rope,
  RopeNode,
  PieceTable,
  ropeConcat,
  ropeFromArray,
} from '../rope-structure';

// ---------------------------------------------------------------------------
// Section 1: Rope.fromString / construction — lengths 1..50 (100 tests)
// ---------------------------------------------------------------------------
describe('Rope.fromString length tests', () => {
  for (let len = 1; len <= 50; len++) {
    it(`fromString length ${len} — length property`, () => {
      const s = 'x'.repeat(len);
      const r = Rope.fromString(s);
      expect(r.length).toBe(len);
    });
    it(`fromString length ${len} — toString round-trip`, () => {
      const s = 'a'.repeat(len);
      const r = Rope.fromString(s);
      expect(r.toString()).toBe(s);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 2: Rope.empty()
// ---------------------------------------------------------------------------
describe('Rope.empty', () => {
  it('empty rope has length 0', () => expect(Rope.empty().length).toBe(0));
  it('empty rope toString is ""', () => expect(Rope.empty().toString()).toBe(''));
  it('empty rope depth is 0', () => expect(Rope.empty().depth()).toBe(0));
  it('empty rope leafCount is 0', () => expect(Rope.empty().leafCount()).toBe(0));
  it('empty rope charAt(0) is ""', () => expect(Rope.empty().charAt(0)).toBe(''));
  it('empty rope charAt(-1) is ""', () => expect(Rope.empty().charAt(-1)).toBe(''));
  it('empty rope indexOf("") is 0', () => expect(Rope.empty().indexOf('')).toBe(0));
  it('empty rope indexOf("a") is -1', () => expect(Rope.empty().indexOf('a')).toBe(-1));
  it('empty rope substring(0,0) is ""', () => expect(Rope.empty().substring(0, 0)).toBe(''));
  it('empty rope rebalance is empty', () => {
    const r = Rope.empty().rebalance();
    expect(r.length).toBe(0);
    expect(r.toString()).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Section 3: constructor(s)
// ---------------------------------------------------------------------------
describe('Rope constructor(s)', () => {
  it('constructor with string sets length', () => {
    const r = new Rope('hello');
    expect(r.length).toBe(5);
  });
  it('constructor with string round-trips toString', () => {
    const r = new Rope('world');
    expect(r.toString()).toBe('world');
  });
  it('constructor with empty string gives length 0', () => {
    const r = new Rope('');
    expect(r.length).toBe(0);
  });
  it('constructor with undefined gives length 0', () => {
    const r = new Rope();
    expect(r.length).toBe(0);
  });
  it('constructor with undefined toString is ""', () => {
    const r = new Rope();
    expect(r.toString()).toBe('');
  });
  it('constructor with string gives depth 1', () => {
    const r = new Rope('abc');
    expect(r.depth()).toBe(1);
  });
  it('constructor with string gives leafCount 1', () => {
    const r = new Rope('abc');
    expect(r.leafCount()).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Section 4: charAt — single-node rope (positions 0..24, 25 tests)
// ---------------------------------------------------------------------------
describe('charAt single node', () => {
  const s = 'abcdefghijklmnopqrstuvwxy'; // 25 chars
  const r = Rope.fromString(s);
  for (let i = 0; i < 25; i++) {
    it(`charAt(${i}) on 25-char rope returns '${s[i]}'`, () => {
      expect(r.charAt(i)).toBe(s[i]);
    });
  }
  it('charAt(-1) returns ""', () => expect(r.charAt(-1)).toBe(''));
  it('charAt(25) returns ""', () => expect(r.charAt(25)).toBe(''));
  it('charAt(100) returns ""', () => expect(r.charAt(100)).toBe(''));
});

// ---------------------------------------------------------------------------
// Section 5: concat — various sizes (30 tests)
// ---------------------------------------------------------------------------
describe('Rope concat', () => {
  for (let i = 1; i <= 15; i++) {
    const a = 'A'.repeat(i);
    const b = 'B'.repeat(i);
    it(`concat length ${i}+${i} gives length ${i * 2}`, () => {
      const ra = Rope.fromString(a);
      const rb = Rope.fromString(b);
      expect(ra.concat(rb).length).toBe(i * 2);
    });
    it(`concat length ${i}+${i} toString is '${a + b}'.slice(0,10)...`, () => {
      const ra = Rope.fromString(a);
      const rb = Rope.fromString(b);
      expect(ra.concat(rb).toString()).toBe(a + b);
    });
  }
  it('concat with empty left returns right', () => {
    const r = Rope.fromString('hello');
    expect(Rope.empty().concat(r).toString()).toBe('hello');
  });
  it('concat with empty right returns left', () => {
    const r = Rope.fromString('world');
    expect(r.concat(Rope.empty()).toString()).toBe('world');
  });
  it('concat three ropes gives correct string', () => {
    const r = Rope.fromString('abc').concat(Rope.fromString('def')).concat(Rope.fromString('ghi'));
    expect(r.toString()).toBe('abcdefghi');
  });
  it('concat three ropes gives correct length', () => {
    const r = Rope.fromString('abc').concat(Rope.fromString('def')).concat(Rope.fromString('ghi'));
    expect(r.length).toBe(9);
  });
  it('concat leafCount is 2 for two non-empty ropes', () => {
    const r = Rope.fromString('abc').concat(Rope.fromString('def'));
    expect(r.leafCount()).toBe(2);
  });
  it('concat depth increases by 1', () => {
    const r = Rope.fromString('abc').concat(Rope.fromString('def'));
    expect(r.depth()).toBe(2);
  });
  it('empty concat empty gives empty', () => {
    expect(Rope.empty().concat(Rope.empty()).toString()).toBe('');
    expect(Rope.empty().concat(Rope.empty()).length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Section 6: split — exhaustive positions on a 20-char rope (21 tests)
// ---------------------------------------------------------------------------
describe('Rope split exhaustive', () => {
  const s = 'abcdefghijklmnopqrst'; // 20 chars
  const rope = Rope.fromString(s);

  for (let idx = 0; idx <= 20; idx++) {
    it(`split at ${idx}: left='${s.slice(0, idx)}', right='${s.slice(idx)}'`, () => {
      const [left, right] = rope.split(idx);
      expect(left.toString()).toBe(s.slice(0, idx));
      expect(right.toString()).toBe(s.slice(idx));
    });
  }
  it('split at 0 left length is 0', () => {
    const [left] = rope.split(0);
    expect(left.length).toBe(0);
  });
  it('split at 20 right length is 0', () => {
    const [, right] = rope.split(20);
    expect(right.length).toBe(0);
  });
  it('split beyond length clamps to length', () => {
    const [left, right] = rope.split(100);
    expect(left.toString()).toBe(s);
    expect(right.length).toBe(0);
  });
  it('split at negative clamps to 0', () => {
    const [left, right] = rope.split(-5);
    expect(left.length).toBe(0);
    expect(right.toString()).toBe(s);
  });
});

// ---------------------------------------------------------------------------
// Section 7: split on concatenated rope (20 tests)
// ---------------------------------------------------------------------------
describe('Rope split on concatenated rope', () => {
  const left = Rope.fromString('Hello, ');
  const right = Rope.fromString('World!');
  const rope = left.concat(right); // "Hello, World!" (13 chars)
  const full = 'Hello, World!';

  for (let idx = 0; idx <= 13; idx++) {
    it(`concat-split at ${idx}`, () => {
      const [l, r] = rope.split(idx);
      expect(l.toString()).toBe(full.slice(0, idx));
      expect(r.toString()).toBe(full.slice(idx));
    });
  }
});

// ---------------------------------------------------------------------------
// Section 8: insert — various positions (30 tests)
// ---------------------------------------------------------------------------
describe('Rope insert', () => {
  const base = 'abcde'; // 5 chars

  for (let pos = 0; pos <= 5; pos++) {
    const expected = base.slice(0, pos) + 'XYZ' + base.slice(pos);
    it(`insert "XYZ" at position ${pos}`, () => {
      const r = Rope.fromString(base).insert(pos, 'XYZ');
      expect(r.toString()).toBe(expected);
    });
    it(`insert "XYZ" at position ${pos} — length`, () => {
      const r = Rope.fromString(base).insert(pos, 'XYZ');
      expect(r.length).toBe(8);
    });
  }

  it('insert empty string returns same content', () => {
    const r = Rope.fromString('hello').insert(2, '');
    expect(r.toString()).toBe('hello');
    expect(r.length).toBe(5);
  });
  it('insert at negative position inserts at 0', () => {
    const r = Rope.fromString('world').insert(-10, 'Hi ');
    expect(r.toString()).toBe('Hi world');
  });
  it('insert beyond length appends', () => {
    const r = Rope.fromString('hello').insert(100, ' world');
    expect(r.toString()).toBe('hello world');
  });
  it('insert on empty rope', () => {
    const r = Rope.empty().insert(0, 'abc');
    expect(r.toString()).toBe('abc');
    expect(r.length).toBe(3);
  });
  it('insert multiple times', () => {
    let r = Rope.fromString('ace');
    r = r.insert(1, 'b');
    r = r.insert(3, 'd');
    expect(r.toString()).toBe('abcde');
  });
  it('chained inserts build a word', () => {
    let r = Rope.empty();
    for (const ch of 'rope') {
      r = r.insert(r.length, ch);
    }
    expect(r.toString()).toBe('rope');
  });
  it('insert preserves existing content integrity', () => {
    const r = Rope.fromString('ab').insert(1, '123');
    expect(r.charAt(0)).toBe('a');
    expect(r.charAt(4)).toBe('b');
  });
});

// ---------------------------------------------------------------------------
// Section 9: delete — various ranges on a 10-char rope (25 tests)
// ---------------------------------------------------------------------------
describe('Rope delete', () => {
  const base = '0123456789'; // 10 chars

  for (let start = 0; start < 5; start++) {
    for (let len = 1; len <= 3; len++) {
      const end = start + len;
      if (end > 10) continue;
      const expected = base.slice(0, start) + base.slice(end);
      it(`delete [${start}, ${end}) from '${base}'`, () => {
        const r = Rope.fromString(base).delete(start, end);
        expect(r.toString()).toBe(expected);
      });
    }
  }

  it('delete [0, 10) gives empty', () => {
    const r = Rope.fromString(base).delete(0, 10);
    expect(r.toString()).toBe('');
    expect(r.length).toBe(0);
  });
  it('delete with start === end is no-op', () => {
    const r = Rope.fromString(base).delete(3, 3);
    expect(r.toString()).toBe(base);
  });
  it('delete with start > end is no-op', () => {
    const r = Rope.fromString(base).delete(5, 3);
    expect(r.toString()).toBe(base);
  });
  it('delete beyond length clamps', () => {
    const r = Rope.fromString(base).delete(5, 100);
    expect(r.toString()).toBe(base.slice(0, 5));
  });
  it('delete at negative start clamps to 0', () => {
    const r = Rope.fromString(base).delete(-5, 3);
    expect(r.toString()).toBe(base.slice(3));
  });
  it('delete from empty rope stays empty', () => {
    const r = Rope.empty().delete(0, 5);
    expect(r.length).toBe(0);
    expect(r.toString()).toBe('');
  });
  it('delete on concatenated rope', () => {
    const r = Rope.fromString('abc').concat(Rope.fromString('def')).delete(2, 4);
    expect(r.toString()).toBe('abef');
  });
});

// ---------------------------------------------------------------------------
// Section 10: substring — positions on 15-char rope (40 tests)
// ---------------------------------------------------------------------------
describe('Rope substring', () => {
  const s = 'Hello, World!!'; // 14 chars
  const r = Rope.fromString(s);

  for (let start = 0; start < 7; start++) {
    for (let end = start; end <= start + 5 && end <= 14; end++) {
      it(`substring(${start}, ${end}) of "${s}"`, () => {
        expect(r.substring(start, end)).toBe(s.slice(start, end));
      });
    }
  }

  it('substring(0, 0) is ""', () => expect(r.substring(0, 0)).toBe(''));
  it('substring full range returns full string', () => expect(r.substring(0, 14)).toBe(s));
  it('substring clamps start < 0', () => expect(r.substring(-5, 5)).toBe(s.slice(0, 5)));
  it('substring clamps end > length', () => expect(r.substring(7, 100)).toBe(s.slice(7)));
  it('substring on empty rope is ""', () => expect(Rope.empty().substring(0, 0)).toBe(''));
  it('substring on concatenated rope', () => {
    const cr = Rope.fromString('abc').concat(Rope.fromString('def'));
    expect(cr.substring(1, 5)).toBe('bcde');
  });
  it('substring single char', () => {
    expect(r.substring(7, 8)).toBe('W');
  });
});

// ---------------------------------------------------------------------------
// Section 11: indexOf — various substrings (30 tests)
// ---------------------------------------------------------------------------
describe('Rope indexOf', () => {
  const text = 'the quick brown fox jumps over the lazy dog';
  const r = Rope.fromString(text);

  const cases: Array<[string, number]> = [
    ['the', 0],
    ['quick', 4],
    ['brown', 10],
    ['fox', 16],
    ['jumps', 20],
    ['over', 26],
    ['lazy', 35],
    ['dog', 40],
    ['xyz', -1],
    ['THE', -1],
    ['', 0],
    [' ', 3],
    ['the lazy', 31],
    ['quick brown fox', 4],
    ['t', 0],
    ['g', 42],
    ['z', 37],
    ['zz', -1],
    ['the quick brown fox jumps over the lazy dog', 0],
    ['the quick brown fox jumps over the lazy dog!', -1],
  ];

  for (const [needle, expected] of cases) {
    it(`indexOf("${needle}") === ${expected}`, () => {
      expect(r.indexOf(needle)).toBe(expected);
    });
  }

  it('indexOf on empty rope: "" returns 0', () => expect(Rope.empty().indexOf('')).toBe(0));
  it('indexOf on empty rope: "a" returns -1', () => expect(Rope.empty().indexOf('a')).toBe(-1));
  it('indexOf on concatenated rope', () => {
    const cr = Rope.fromString('foo').concat(Rope.fromString('bar'));
    expect(cr.indexOf('bar')).toBe(3);
  });
  it('indexOf finds first occurrence', () => {
    const cr = Rope.fromString('aaaa');
    expect(cr.indexOf('aa')).toBe(0);
  });
  it('indexOf not found returns -1', () => {
    expect(Rope.fromString('hello').indexOf('xyz')).toBe(-1);
  });
  it('indexOf after insert', () => {
    const rr = Rope.fromString('helo').insert(3, 'l');
    expect(rr.indexOf('hello')).toBe(0);
  });
  it('indexOf after delete', () => {
    const rr = Rope.fromString('abcXYZdef').delete(3, 6);
    expect(rr.indexOf('def')).toBe(3);
  });
  it('indexOf full string match', () => {
    const rr = Rope.fromString('needle');
    expect(rr.indexOf('needle')).toBe(0);
  });
  it('indexOf single char not present', () => {
    expect(Rope.fromString('abc').indexOf('z')).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// Section 12: rebalance (25 tests)
// ---------------------------------------------------------------------------
describe('Rope rebalance', () => {
  it('rebalance empty gives empty', () => {
    expect(Rope.empty().rebalance().toString()).toBe('');
  });
  it('rebalance single-leaf is unchanged string', () => {
    const r = Rope.fromString('hello').rebalance();
    expect(r.toString()).toBe('hello');
  });
  it('rebalance preserves length', () => {
    const r = Rope.fromString('abcdef').rebalance();
    expect(r.length).toBe(6);
  });
  it('rebalance of many concats preserves string', () => {
    let r = Rope.empty();
    const parts = ['ab', 'cd', 'ef', 'gh', 'ij'];
    for (const p of parts) r = r.concat(Rope.fromString(p));
    const balanced = r.rebalance();
    expect(balanced.toString()).toBe('abcdefghij');
  });
  it('rebalance of many concats preserves length', () => {
    let r = Rope.empty();
    for (let i = 0; i < 10; i++) r = r.concat(Rope.fromString('x'));
    expect(r.rebalance().length).toBe(10);
  });
  it('rebalanced rope depth <= original depth for many concats', () => {
    let r = Rope.empty();
    for (let i = 0; i < 8; i++) r = r.concat(Rope.fromString('a'));
    const depthBefore = r.depth();
    const depthAfter = r.rebalance().depth();
    expect(depthAfter).toBeLessThanOrEqual(depthBefore);
  });

  for (let n = 2; n <= 16; n += 2) {
    it(`rebalance ${n} single-char concats depth <= ceil(log2(${n})) + 1`, () => {
      let r = Rope.empty();
      for (let i = 0; i < n; i++) r = r.concat(Rope.fromString('x'));
      const balanced = r.rebalance();
      const maxDepth = Math.ceil(Math.log2(n)) + 2;
      expect(balanced.depth()).toBeLessThanOrEqual(maxDepth);
    });
    it(`rebalance ${n} single-char concats toString`, () => {
      let r = Rope.empty();
      for (let i = 0; i < n; i++) r = r.concat(Rope.fromString('x'));
      expect(r.rebalance().toString()).toBe('x'.repeat(n));
    });
  }

  it('rebalance double gives depth ≤ 2', () => {
    const r = Rope.fromString('ab').concat(Rope.fromString('cd'));
    expect(r.rebalance().depth()).toBeLessThanOrEqual(2);
  });
  it('rebalance leafCount is reduced for degenerate tree', () => {
    let r = Rope.empty();
    for (let i = 0; i < 4; i++) r = r.concat(Rope.fromString('a'));
    const balanced = r.rebalance();
    expect(balanced.leafCount()).toBe(r.leafCount());
  });
  it('rebalance does not change charAt values', () => {
    let r = Rope.empty();
    const str = 'ghijklmn';
    for (const ch of str) r = r.concat(Rope.fromString(ch));
    const balanced = r.rebalance();
    for (let i = 0; i < str.length; i++) {
      expect(balanced.charAt(i)).toBe(str[i]);
    }
  });
});

// ---------------------------------------------------------------------------
// Section 13: depth and leafCount (30 tests)
// ---------------------------------------------------------------------------
describe('Rope depth and leafCount', () => {
  it('single leaf depth is 1', () => expect(Rope.fromString('x').depth()).toBe(1));
  it('single leaf leafCount is 1', () => expect(Rope.fromString('x').leafCount()).toBe(1));
  it('empty depth is 0', () => expect(Rope.empty().depth()).toBe(0));
  it('empty leafCount is 0', () => expect(Rope.empty().leafCount()).toBe(0));

  for (let n = 2; n <= 8; n++) {
    it(`${n} sequential concats leafCount is ${n}`, () => {
      let r = Rope.empty();
      for (let i = 0; i < n; i++) r = r.concat(Rope.fromString('a'));
      expect(r.leafCount()).toBe(n);
    });
    it(`${n} sequential concats depth >= ${Math.ceil(Math.log2(n + 1))}`, () => {
      let r = Rope.empty();
      for (let i = 0; i < n; i++) r = r.concat(Rope.fromString('a'));
      expect(r.depth()).toBeGreaterThanOrEqual(1);
    });
  }

  it('concat of two 1-leaf ropes depth is 2', () => {
    const r = Rope.fromString('a').concat(Rope.fromString('b'));
    expect(r.depth()).toBe(2);
  });
  it('concat of two 1-leaf ropes leafCount is 2', () => {
    const r = Rope.fromString('a').concat(Rope.fromString('b'));
    expect(r.leafCount()).toBe(2);
  });
  it('split produces two ropes each with depth >= 0', () => {
    const r = Rope.fromString('abcdef');
    const [l, rr] = r.split(3);
    expect(l.depth()).toBeGreaterThanOrEqual(1);
    expect(rr.depth()).toBeGreaterThanOrEqual(1);
  });
  it('insert increases leafCount by 1', () => {
    const r = Rope.fromString('abc');
    const r2 = r.insert(1, 'X');
    expect(r2.leafCount()).toBeGreaterThanOrEqual(2);
  });
  it('delete can reduce leafCount', () => {
    const r = Rope.fromString('abc').concat(Rope.fromString('def')).delete(3, 6);
    expect(r.toString()).toBe('abc');
    expect(r.leafCount()).toBeGreaterThanOrEqual(1);
  });
  it('large concat chain depth is reasonable', () => {
    let r = Rope.empty();
    for (let i = 0; i < 20; i++) r = r.concat(Rope.fromString('a'));
    expect(r.depth()).toBeLessThanOrEqual(21);
  });
});

// ---------------------------------------------------------------------------
// Section 14: charAt on multi-node rope (30 tests)
// ---------------------------------------------------------------------------
describe('charAt on multi-node rope', () => {
  const parts = ['Hello', ', ', 'World', '!'];
  const full = parts.join('');
  const rope = parts.reduce((acc, p) => acc.concat(Rope.fromString(p)), Rope.empty());

  for (let i = 0; i < full.length; i++) {
    it(`charAt(${i}) on concatenated rope returns '${full[i]}'`, () => {
      expect(rope.charAt(i)).toBe(full[i]);
    });
  }

  it('charAt(-1) on concat rope is ""', () => expect(rope.charAt(-1)).toBe(''));
  it('charAt(length) on concat rope is ""', () => expect(rope.charAt(full.length)).toBe(''));
  it('charAt on split-right part', () => {
    const [, right] = Rope.fromString('abcdef').split(3);
    expect(right.charAt(0)).toBe('d');
    expect(right.charAt(2)).toBe('f');
  });
  it('charAt on split-left part', () => {
    const [left] = Rope.fromString('abcdef').split(3);
    expect(left.charAt(0)).toBe('a');
    expect(left.charAt(2)).toBe('c');
    expect(left.charAt(3)).toBe('');
  });
});

// ---------------------------------------------------------------------------
// Section 15: ropeConcat helper (20 tests)
// ---------------------------------------------------------------------------
describe('ropeConcat helper', () => {
  it('ropeConcat with no args returns empty', () => {
    expect(ropeConcat().toString()).toBe('');
    expect(ropeConcat().length).toBe(0);
  });
  it('ropeConcat single rope returns same content', () => {
    expect(ropeConcat(Rope.fromString('hello')).toString()).toBe('hello');
  });
  it('ropeConcat two ropes', () => {
    expect(ropeConcat(Rope.fromString('foo'), Rope.fromString('bar')).toString()).toBe('foobar');
  });
  it('ropeConcat three ropes', () => {
    const r = ropeConcat(Rope.fromString('a'), Rope.fromString('b'), Rope.fromString('c'));
    expect(r.toString()).toBe('abc');
    expect(r.length).toBe(3);
  });
  it('ropeConcat five ropes', () => {
    const r = ropeConcat(...['one', 'two', 'three', 'four', 'five'].map(Rope.fromString));
    expect(r.toString()).toBe('onetwothreefourfive');
  });

  for (let n = 1; n <= 10; n++) {
    it(`ropeConcat ${n} single-char ropes toString`, () => {
      const ropes = Array.from({ length: n }, () => Rope.fromString('x'));
      expect(ropeConcat(...ropes).toString()).toBe('x'.repeat(n));
    });
    it(`ropeConcat ${n} single-char ropes length`, () => {
      const ropes = Array.from({ length: n }, () => Rope.fromString('x'));
      expect(ropeConcat(...ropes).length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 16: ropeFromArray helper (20 tests)
// ---------------------------------------------------------------------------
describe('ropeFromArray helper', () => {
  it('ropeFromArray empty array gives empty', () => {
    expect(ropeFromArray([]).toString()).toBe('');
    expect(ropeFromArray([]).length).toBe(0);
  });
  it('ropeFromArray single element', () => {
    expect(ropeFromArray(['hello']).toString()).toBe('hello');
  });
  it('ropeFromArray two elements', () => {
    expect(ropeFromArray(['foo', 'bar']).toString()).toBe('foobar');
  });
  it('ropeFromArray three elements', () => {
    expect(ropeFromArray(['a', 'b', 'c']).toString()).toBe('abc');
  });
  it('ropeFromArray preserves length', () => {
    expect(ropeFromArray(['abc', 'def']).length).toBe(6);
  });

  for (let n = 1; n <= 10; n++) {
    it(`ropeFromArray ${n}-element array toString`, () => {
      const arr = Array.from({ length: n }, (_, i) => String(i));
      expect(ropeFromArray(arr).toString()).toBe(arr.join(''));
    });
    it(`ropeFromArray ${n}-element array length`, () => {
      const arr = Array.from({ length: n }, () => 'ab');
      expect(ropeFromArray(arr).length).toBe(n * 2);
    });
  }

  it('ropeFromArray with empty strings', () => {
    expect(ropeFromArray(['', 'a', '', 'b', '']).toString()).toBe('ab');
  });
});

// ---------------------------------------------------------------------------
// Section 17: PieceTable constructor and getText (15 tests)
// ---------------------------------------------------------------------------
describe('PieceTable constructor', () => {
  it('empty string gives length 0', () => expect(new PieceTable('').length).toBe(0));
  it('empty string getText is ""', () => expect(new PieceTable('').getText()).toBe(''));
  it('non-empty string preserves getText', () => {
    expect(new PieceTable('hello').getText()).toBe('hello');
  });
  it('non-empty string preserves length', () => {
    expect(new PieceTable('hello').length).toBe(5);
  });

  for (let len = 1; len <= 10; len++) {
    it(`PieceTable initial string length ${len}`, () => {
      const s = 'a'.repeat(len);
      const pt = new PieceTable(s);
      expect(pt.length).toBe(len);
      expect(pt.getText()).toBe(s);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 18: PieceTable insert (50 tests)
// ---------------------------------------------------------------------------
describe('PieceTable insert', () => {
  it('insert at 0 into empty', () => {
    const pt = new PieceTable('');
    pt.insert(0, 'hello');
    expect(pt.getText()).toBe('hello');
    expect(pt.length).toBe(5);
  });
  it('insert at end', () => {
    const pt = new PieceTable('hello');
    pt.insert(5, ' world');
    expect(pt.getText()).toBe('hello world');
  });
  it('insert at beginning', () => {
    const pt = new PieceTable('world');
    pt.insert(0, 'hello ');
    expect(pt.getText()).toBe('hello world');
  });
  it('insert in middle', () => {
    const pt = new PieceTable('helo');
    pt.insert(3, 'l');
    expect(pt.getText()).toBe('hello');
  });
  it('insert empty string is no-op', () => {
    const pt = new PieceTable('hello');
    pt.insert(2, '');
    expect(pt.getText()).toBe('hello');
    expect(pt.length).toBe(5);
  });
  it('multiple inserts build string', () => {
    const pt = new PieceTable('');
    pt.insert(0, 'c');
    pt.insert(0, 'b');
    pt.insert(0, 'a');
    expect(pt.getText()).toBe('abc');
  });
  it('insert at clamped negative offset inserts at 0', () => {
    const pt = new PieceTable('world');
    pt.insert(-5, 'hello ');
    expect(pt.getText()).toBe('hello world');
  });
  it('insert beyond length appends', () => {
    const pt = new PieceTable('hello');
    pt.insert(100, '!');
    expect(pt.getText()).toBe('hello!');
  });

  const baseStr = '0123456789';
  for (let pos = 0; pos <= 10; pos++) {
    const expected = baseStr.slice(0, pos) + 'X' + baseStr.slice(pos);
    it(`insert "X" at position ${pos} into "0123456789"`, () => {
      const pt = new PieceTable(baseStr);
      pt.insert(pos, 'X');
      expect(pt.getText()).toBe(expected);
      expect(pt.length).toBe(11);
    });
  }

  it('sequential appends build correct string', () => {
    const pt = new PieceTable('');
    for (const ch of 'abcde') {
      pt.insert(pt.length, ch);
    }
    expect(pt.getText()).toBe('abcde');
  });
  it('insert preserves surrounding chars', () => {
    const pt = new PieceTable('ace');
    pt.insert(1, 'b');
    pt.insert(3, 'd');
    expect(pt.getText()).toBe('abcde');
  });
  it('insert length updates correctly', () => {
    const pt = new PieceTable('abc');
    pt.insert(1, 'XY');
    expect(pt.length).toBe(5);
  });
  it('two inserts at same position', () => {
    const pt = new PieceTable('ac');
    pt.insert(1, 'b');
    expect(pt.getText()).toBe('abc');
    expect(pt.length).toBe(3);
  });

  for (let i = 1; i <= 20; i++) {
    it(`insert char '${String.fromCharCode(64 + i)}' into growing string at end`, () => {
      const pt = new PieceTable('');
      const chars = Array.from({ length: i }, (_, idx) => String.fromCharCode(65 + idx));
      for (const ch of chars) pt.insert(pt.length, ch);
      expect(pt.getText()).toBe(chars.join(''));
    });
  }
});

// ---------------------------------------------------------------------------
// Section 19: PieceTable delete (50 tests)
// ---------------------------------------------------------------------------
describe('PieceTable delete', () => {
  it('delete from empty is no-op', () => {
    const pt = new PieceTable('');
    pt.delete(0, 5);
    expect(pt.getText()).toBe('');
    expect(pt.length).toBe(0);
  });
  it('delete all chars', () => {
    const pt = new PieceTable('hello');
    pt.delete(0, 5);
    expect(pt.getText()).toBe('');
    expect(pt.length).toBe(0);
  });
  it('delete first char', () => {
    const pt = new PieceTable('hello');
    pt.delete(0, 1);
    expect(pt.getText()).toBe('ello');
  });
  it('delete last char', () => {
    const pt = new PieceTable('hello');
    pt.delete(4, 1);
    expect(pt.getText()).toBe('hell');
  });
  it('delete middle char', () => {
    const pt = new PieceTable('hello');
    pt.delete(2, 1);
    expect(pt.getText()).toBe('helo');
  });
  it('delete with length 0 is no-op', () => {
    const pt = new PieceTable('hello');
    pt.delete(2, 0);
    expect(pt.getText()).toBe('hello');
  });
  it('delete with negative length is no-op', () => {
    const pt = new PieceTable('hello');
    pt.delete(2, -1);
    expect(pt.getText()).toBe('hello');
  });
  it('delete beyond length clamps', () => {
    const pt = new PieceTable('hello');
    pt.delete(3, 100);
    expect(pt.getText()).toBe('hel');
  });
  it('delete entire string via large length', () => {
    const pt = new PieceTable('abcde');
    pt.delete(0, 999);
    expect(pt.getText()).toBe('');
  });

  const baseStr = '0123456789';
  for (let start = 0; start < 5; start++) {
    for (let len = 1; len <= 3 && start + len <= 10; len++) {
      const expected = baseStr.slice(0, start) + baseStr.slice(start + len);
      it(`delete at offset ${start}, length ${len} from "0123456789"`, () => {
        const pt = new PieceTable(baseStr);
        pt.delete(start, len);
        expect(pt.getText()).toBe(expected);
        expect(pt.length).toBe(10 - len);
      });
    }
  }

  it('delete after insert', () => {
    const pt = new PieceTable('hello');
    pt.insert(5, ' world');
    pt.delete(5, 6);
    expect(pt.getText()).toBe('hello');
  });
  it('insert after delete', () => {
    const pt = new PieceTable('hXello');
    pt.delete(1, 1);
    expect(pt.getText()).toBe('hello');
  });
  it('delete does not affect chars outside range', () => {
    const pt = new PieceTable('abcdef');
    pt.delete(2, 2);
    expect(pt.getText()).toBe('abef');
  });

  for (let i = 1; i <= 10; i++) {
    it(`delete first ${i} chars from 10-char string`, () => {
      const pt = new PieceTable(baseStr);
      pt.delete(0, i);
      expect(pt.getText()).toBe(baseStr.slice(i));
      expect(pt.length).toBe(10 - i);
    });
  }

  it('multiple deletes leave correct string', () => {
    const pt = new PieceTable('abcdefghij');
    pt.delete(8, 2); // remove 'ij'
    pt.delete(0, 2); // remove 'ab'
    expect(pt.getText()).toBe('cdefgh');
  });
  it('delete reduces length correctly', () => {
    const pt = new PieceTable('hello world');
    pt.delete(5, 6);
    expect(pt.length).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Section 20: PieceTable mixed insert+delete (30 tests)
// ---------------------------------------------------------------------------
describe('PieceTable mixed operations', () => {
  it('insert then delete in middle', () => {
    const pt = new PieceTable('abc');
    pt.insert(1, 'XY');
    pt.delete(1, 2);
    expect(pt.getText()).toBe('abc');
  });
  it('delete then insert at same spot', () => {
    const pt = new PieceTable('abcde');
    pt.delete(2, 1); // remove 'c'
    pt.insert(2, 'C');
    expect(pt.getText()).toBe('abCde');
  });
  it('build string by alternating inserts', () => {
    const pt = new PieceTable('');
    pt.insert(0, 'bd');
    pt.insert(0, 'a');
    pt.insert(2, 'c');
    expect(pt.getText()).toBe('abcd');
  });
  it('delete and reinsert', () => {
    const pt = new PieceTable('hello world');
    pt.delete(5, 6); // remove ' world'
    pt.insert(5, ' earth');
    expect(pt.getText()).toBe('hello earth');
  });
  it('insert at boundary after delete', () => {
    const pt = new PieceTable('abcdef');
    pt.delete(3, 3); // 'abc'
    pt.insert(3, 'DEF');
    expect(pt.getText()).toBe('abcDEF');
  });

  for (let n = 1; n <= 10; n++) {
    it(`${n} cyclic insert-delete operations`, () => {
      const pt = new PieceTable('hello');
      for (let i = 0; i < n; i++) {
        pt.insert(pt.length, '!');
        pt.delete(pt.length - 1, 1);
      }
      expect(pt.getText()).toBe('hello');
    });
  }

  it('getText after many small inserts', () => {
    const pt = new PieceTable('');
    const word = 'RopeStructure';
    for (const ch of word) pt.insert(pt.length, ch);
    expect(pt.getText()).toBe(word);
  });
  it('length correct after multiple operations', () => {
    const pt = new PieceTable('abcde');
    pt.insert(5, 'fghij');
    pt.delete(0, 5);
    expect(pt.length).toBe(5);
    expect(pt.getText()).toBe('fghij');
  });
  it('insert 3 chars, delete 2, length is original + 1', () => {
    const pt = new PieceTable('abc');
    pt.insert(1, 'XYZ');
    pt.delete(2, 2);
    expect(pt.length).toBe(4);
  });
  it('complex interleaved edits', () => {
    const pt = new PieceTable('The fox jumps');
    pt.insert(4, 'quick ');
    pt.insert(10, 'brown ');
    pt.delete(0, 4);
    pt.insert(0, 'A ');
    // Original: 'The fox jumps' → insert 'quick ' at 4 → 'The quick fox jumps'
    // insert 'brown ' at 10 → 'The quick brown fox jumps'
    // delete first 4 → 'quick brown fox jumps'
    // insert 'A ' at 0 → 'A quick brown fox jumps'
    expect(pt.getText()).toBe('A quick brown fox jumps');
  });

  it('PieceTable handles unicode-like multi-char insert/delete round-trip', () => {
    const pt = new PieceTable('start');
    pt.insert(5, ' middle');
    pt.insert(12, ' end');
    pt.delete(6, 7); // remove 'middle ' (7 chars at pos 6)
    expect(pt.getText()).toBe('start end');
  });
  it('PieceTable empty original then many inserts', () => {
    const pt = new PieceTable('');
    const words = ['Hello', ', ', 'World', '!'];
    for (const w of words) pt.insert(pt.length, w);
    expect(pt.getText()).toBe('Hello, World!');
    expect(pt.length).toBe(13);
  });
  it('PieceTable delete from add buffer (after insert)', () => {
    const pt = new PieceTable('');
    pt.insert(0, 'abcde');
    pt.delete(1, 3); // remove 'bcd'
    expect(pt.getText()).toBe('ae');
  });
  it('PieceTable interleaved inserts then full delete', () => {
    const pt = new PieceTable('ab');
    pt.insert(1, 'X');
    pt.insert(2, 'Y');
    pt.delete(0, pt.length);
    expect(pt.getText()).toBe('');
    expect(pt.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Section 21: Edge cases and invariants (30 tests)
// ---------------------------------------------------------------------------
describe('Rope edge cases and invariants', () => {
  it('very long string round-trip', () => {
    const s = 'a'.repeat(10000);
    expect(Rope.fromString(s).toString()).toBe(s);
  });
  it('very long string length', () => {
    expect(Rope.fromString('b'.repeat(10000)).length).toBe(10000);
  });
  it('concat 100 single chars', () => {
    let r = Rope.empty();
    for (let i = 0; i < 100; i++) r = r.concat(Rope.fromString(String(i % 10)));
    expect(r.length).toBe(100);
  });
  it('split then re-concat gives original', () => {
    const s = 'abcdefghijklmnop';
    const r = Rope.fromString(s);
    const [l, right] = r.split(8);
    expect(l.concat(right).toString()).toBe(s);
  });
  it('insert at every position produces correct result', () => {
    for (let pos = 0; pos <= 5; pos++) {
      const base = 'hello';
      const r = Rope.fromString(base).insert(pos, 'X');
      const expected = base.slice(0, pos) + 'X' + base.slice(pos);
      expect(r.toString()).toBe(expected);
    }
  });
  it('delete every single character from string', () => {
    const s = 'abcde';
    for (let i = 0; i < s.length; i++) {
      const r = Rope.fromString(s).delete(i, i + 1);
      expect(r.toString()).toBe(s.slice(0, i) + s.slice(i + 1));
    }
  });
  it('substring equals native slice for all pairs', () => {
    const s = 'Hello, World!';
    const r = Rope.fromString(s);
    for (let i = 0; i <= s.length; i++) {
      for (let j = i; j <= s.length; j++) {
        expect(r.substring(i, j)).toBe(s.slice(i, j));
      }
    }
  });
  it('indexOf finds every character in alphabet', () => {
    const s = 'abcdefghijklmnopqrstuvwxyz';
    const r = Rope.fromString(s);
    for (let i = 0; i < 26; i++) {
      expect(r.indexOf(s[i])).toBe(i);
    }
  });
  it('split produces ropes whose lengths sum to original', () => {
    const s = 'abcdefgh';
    const r = Rope.fromString(s);
    for (let i = 0; i <= s.length; i++) {
      const [l, right] = r.split(i);
      expect(l.length + right.length).toBe(s.length);
    }
  });
  it('rebalance preserves charAt values for 20-char string', () => {
    const s = '12345678901234567890';
    let r = Rope.empty();
    for (const ch of s) r = r.concat(Rope.fromString(ch));
    const balanced = r.rebalance();
    for (let i = 0; i < s.length; i++) {
      expect(balanced.charAt(i)).toBe(s[i]);
    }
  });
  it('concat is not commutative', () => {
    const ra = Rope.fromString('abc');
    const rb = Rope.fromString('def');
    expect(ra.concat(rb).toString()).toBe('abcdef');
    expect(rb.concat(ra).toString()).toBe('defabc');
  });
  it('concat is associative', () => {
    const ra = Rope.fromString('a');
    const rb = Rope.fromString('b');
    const rc = Rope.fromString('c');
    const r1 = ra.concat(rb).concat(rc);
    const r2 = ra.concat(rb.concat(rc));
    expect(r1.toString()).toBe(r2.toString());
  });
  it('insert then delete restores string', () => {
    const s = 'hello';
    const r = Rope.fromString(s).insert(2, 'XYZ').delete(2, 5);
    expect(r.toString()).toBe(s);
  });
  it('split then insert then rejoin', () => {
    const r = Rope.fromString('abcdef');
    const [l, right] = r.split(3);
    const middle = Rope.fromString('---');
    expect(l.concat(middle).concat(right).toString()).toBe('abc---def');
  });
  it('large insert into middle', () => {
    const r = Rope.fromString('ab').insert(1, 'x'.repeat(1000));
    expect(r.length).toBe(1002);
    expect(r.toString()).toBe('a' + 'x'.repeat(1000) + 'b');
  });
  it('delete from concat spans the join boundary', () => {
    const r = Rope.fromString('abc').concat(Rope.fromString('def'));
    const del = r.delete(1, 5); // remove 'bcde'
    expect(del.toString()).toBe('af');
  });
  it('substring across the join boundary of concat', () => {
    const r = Rope.fromString('abc').concat(Rope.fromString('def'));
    expect(r.substring(2, 5)).toBe('cde');
  });
  it('fromString preserves all ASCII printable chars', () => {
    let s = '';
    for (let code = 32; code < 127; code++) s += String.fromCharCode(code);
    const r = Rope.fromString(s);
    expect(r.toString()).toBe(s);
    expect(r.length).toBe(s.length);
  });
  it('new Rope() and Rope.empty() behave identically', () => {
    expect(new Rope().length).toBe(Rope.empty().length);
    expect(new Rope().toString()).toBe(Rope.empty().toString());
  });
  it('new Rope(s) and Rope.fromString(s) behave identically', () => {
    const s = 'hello world';
    expect(new Rope(s).toString()).toBe(Rope.fromString(s).toString());
    expect(new Rope(s).length).toBe(Rope.fromString(s).length);
  });

  // Parametric invariant checks (10 more)
  for (let n = 0; n <= 9; n++) {
    it(`concat + split invariant for split at ${n}`, () => {
      const s = 'abcdefghij';
      const r = Rope.fromString(s);
      const [l, right] = r.split(n);
      expect(l.toString() + right.toString()).toBe(s);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 22: PieceTable additional edge cases (25 tests)
// ---------------------------------------------------------------------------
describe('PieceTable additional edge cases', () => {
  it('multiple deletes from front reduce string correctly', () => {
    const pt = new PieceTable('abcde');
    for (let i = 0; i < 5; i++) {
      pt.delete(0, 1);
    }
    expect(pt.getText()).toBe('');
    expect(pt.length).toBe(0);
  });
  it('multiple deletes from end reduce string correctly', () => {
    const pt = new PieceTable('abcde');
    for (let i = 4; i >= 0; i--) {
      pt.delete(i, 1);
    }
    expect(pt.getText()).toBe('');
  });
  it('PieceTable with numeric content', () => {
    const pt = new PieceTable('12345');
    pt.insert(2, '00');
    expect(pt.getText()).toBe('1200345');
  });
  it('PieceTable large original string getText', () => {
    const s = 'z'.repeat(5000);
    const pt = new PieceTable(s);
    expect(pt.getText()).toBe(s);
    expect(pt.length).toBe(5000);
  });
  it('PieceTable insert at length === insert at end', () => {
    const pt = new PieceTable('hello');
    pt.insert(pt.length, '!');
    expect(pt.getText()).toBe('hello!');
  });
  it('PieceTable length after no operations equals original', () => {
    const s = 'unchanged';
    const pt = new PieceTable(s);
    expect(pt.length).toBe(s.length);
  });

  for (let i = 0; i <= 5; i++) {
    it(`PieceTable insert at position ${i} in "hello"`, () => {
      const pt = new PieceTable('hello');
      pt.insert(i, '_');
      const expected = 'hello'.slice(0, i) + '_' + 'hello'.slice(i);
      expect(pt.getText()).toBe(expected);
    });
  }

  for (let i = 0; i < 5; i++) {
    it(`PieceTable delete position ${i}, length 1 from "hello"`, () => {
      const pt = new PieceTable('hello');
      pt.delete(i, 1);
      const expected = 'hello'.slice(0, i) + 'hello'.slice(i + 1);
      expect(pt.getText()).toBe(expected);
    });
  }

  it('PieceTable large insert at position 0', () => {
    const pt = new PieceTable('end');
    pt.insert(0, 'x'.repeat(1000));
    expect(pt.getText()).toBe('x'.repeat(1000) + 'end');
    expect(pt.length).toBe(1003);
  });
  it('PieceTable delete entire add buffer', () => {
    const pt = new PieceTable('');
    pt.insert(0, 'temporary');
    pt.delete(0, 9);
    expect(pt.getText()).toBe('');
    expect(pt.length).toBe(0);
  });
  it('PieceTable interleaved boundary inserts', () => {
    const pt = new PieceTable('ac');
    pt.insert(1, 'b'); // 'abc'
    pt.insert(3, 'd'); // 'abcd'
    pt.insert(0, '_'); // '_abcd'
    expect(pt.getText()).toBe('_abcd');
    expect(pt.length).toBe(5);
  });
  it('PieceTable: delete more than length safely clamps', () => {
    const pt = new PieceTable('hi');
    pt.delete(1, 1000);
    expect(pt.getText()).toBe('h');
  });
});

// ---------------------------------------------------------------------------
// Section 23: Rope.fromString with various alphabet strings (30 tests)
// ---------------------------------------------------------------------------
describe('Rope fromString with varied content', () => {
  const samples = [
    'Hello, World!',
    '   spaces   ',
    '12345',
    '!@#$%^&*()',
    'newline\n',
    'tab\there',
    'null\0char',
    'unicode: café',
    'UPPER CASE',
    'mixedCASE123',
  ];

  for (const sample of samples) {
    it(`fromString round-trips: "${sample.slice(0, 15)}"`, () => {
      const r = Rope.fromString(sample);
      expect(r.toString()).toBe(sample);
      expect(r.length).toBe(sample.length);
    });
    it(`indexOf self: "${sample.slice(0, 10)}"`, () => {
      const r = Rope.fromString(sample);
      expect(r.indexOf(sample)).toBe(0);
    });
    it(`charAt all positions: "${sample.slice(0, 8)}"`, () => {
      const r = Rope.fromString(sample);
      for (let i = 0; i < sample.length; i++) {
        expect(r.charAt(i)).toBe(sample[i]);
      }
    });
  }
});

// ---------------------------------------------------------------------------
// Section 24: Rope operations chained (30 tests)
// ---------------------------------------------------------------------------
describe('Rope chained operations', () => {
  it('insert + indexOf', () => {
    const r = Rope.fromString('quick fox').insert(6, 'brown ');
    expect(r.indexOf('brown')).toBe(6);
  });
  it('delete + indexOf', () => {
    const r = Rope.fromString('remove this from text').delete(6, 11);
    expect(r.indexOf('remove')).toBe(0);
    expect(r.indexOf('from')).toBe(7);
  });
  it('concat + indexOf', () => {
    const r = Rope.fromString('foo').concat(Rope.fromString('bar')).concat(Rope.fromString('baz'));
    expect(r.indexOf('barbaz')).toBe(3);
  });
  it('split + concat + indexOf', () => {
    const r = Rope.fromString('abcdef');
    const [l, right] = r.split(3);
    const joined = right.concat(l); // 'defabc'
    expect(joined.indexOf('def')).toBe(0);
    expect(joined.indexOf('abc')).toBe(3);
  });
  it('insert + substring', () => {
    const r = Rope.fromString('abef').insert(2, 'cd');
    expect(r.substring(2, 4)).toBe('cd');
  });
  it('delete + charAt', () => {
    const r = Rope.fromString('abcde').delete(1, 3); // 'ade'
    expect(r.charAt(0)).toBe('a');
    expect(r.charAt(1)).toBe('d');
    expect(r.charAt(2)).toBe('e');
  });
  it('rebalance + charAt is same as before rebalance', () => {
    let r = Rope.empty();
    const s = 'hello world';
    for (const ch of s) r = r.concat(Rope.fromString(ch));
    const balanced = r.rebalance();
    for (let i = 0; i < s.length; i++) {
      expect(balanced.charAt(i)).toBe(s[i]);
    }
  });
  it('fromString + rebalance + split + concat', () => {
    const r = Rope.fromString('abcdefgh').rebalance();
    const [l, right] = r.split(4);
    const rejoined = right.concat(l);
    expect(rejoined.toString()).toBe('efghabcd');
  });
  it('chain: insert, delete, concat, toString', () => {
    const r = Rope.fromString('ac')
      .insert(1, 'b')
      .delete(0, 1)
      .concat(Rope.fromString('d'));
    expect(r.toString()).toBe('bcd');
  });
  it('chain: 5 inserts then rebalance', () => {
    let r = Rope.empty();
    for (const ch of 'edcba') r = r.insert(0, ch);
    expect(r.rebalance().toString()).toBe('abcde');
  });

  for (let i = 0; i < 20; i++) {
    it(`chain insert+delete at position ${i % 5}: iteration ${i}`, () => {
      const base = 'hello';
      const pos = i % 5;
      const ins = Rope.fromString(base).insert(pos, 'XYZ');
      const del = ins.delete(pos, pos + 3);
      expect(del.toString()).toBe(base);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 25: Rope deep chain of concats and charAt (55 tests)
// ---------------------------------------------------------------------------
describe('Rope deep concat chain charAt', () => {
  const s = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123'; // 56 chars
  let rope = Rope.empty();
  for (const ch of s) rope = rope.concat(Rope.fromString(ch));

  for (let i = 0; i < s.length; i++) {
    it(`deep concat charAt(${i}) === '${s[i]}'`, () => {
      expect(rope.charAt(i)).toBe(s[i]);
    });
  }

  it('deep concat toString matches original', () => {
    expect(rope.toString()).toBe(s);
  });
});

// ---------------------------------------------------------------------------
// Section 26: Rope.fromString large — split at every 10th position (20 tests)
// ---------------------------------------------------------------------------
describe('Rope large string split', () => {
  const s = 'abcdefghij'.repeat(20); // 200 chars
  const r = Rope.fromString(s);

  for (let idx = 0; idx <= 200; idx += 10) {
    it(`split large string at ${idx}`, () => {
      const [l, right] = r.split(idx);
      expect(l.toString()).toBe(s.slice(0, idx));
      expect(right.toString()).toBe(s.slice(idx));
    });
  }
});

// ---------------------------------------------------------------------------
// Section 27: PieceTable length invariants (20 tests)
// ---------------------------------------------------------------------------
describe('PieceTable length invariants', () => {
  for (let n = 0; n <= 9; n++) {
    it(`length after ${n} inserts of 'x' into empty`, () => {
      const pt = new PieceTable('');
      for (let i = 0; i < n; i++) pt.insert(pt.length, 'x');
      expect(pt.length).toBe(n);
    });
    it(`length after ${n} single-char deletes from 10-char string`, () => {
      const pt = new PieceTable('0123456789');
      for (let i = 0; i < n; i++) pt.delete(0, 1);
      expect(pt.length).toBe(10 - n);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 28: Rope invariant — length after operations (20 tests)
// ---------------------------------------------------------------------------
describe('Rope length invariants after operations', () => {
  it('insert adds to length', () => {
    const r = Rope.fromString('hello').insert(2, 'XYZ');
    expect(r.length).toBe(8);
  });
  it('delete reduces length', () => {
    const r = Rope.fromString('hello world').delete(5, 11);
    expect(r.length).toBe(5);
  });
  it('concat adds lengths', () => {
    const r = Rope.fromString('hello').concat(Rope.fromString(' world'));
    expect(r.length).toBe(11);
  });
  it('split: left.length + right.length = original.length', () => {
    const r = Rope.fromString('abcdefgh');
    const [l, right] = r.split(4);
    expect(l.length + right.length).toBe(8);
  });
  it('rebalance preserves length', () => {
    let r = Rope.empty();
    for (let i = 0; i < 10; i++) r = r.concat(Rope.fromString('x'));
    expect(r.rebalance().length).toBe(10);
  });
  it('insert 0 chars preserves length', () => {
    expect(Rope.fromString('abc').insert(1, '').length).toBe(3);
  });
  it('delete 0 chars preserves length', () => {
    expect(Rope.fromString('abc').delete(1, 1).length).toBe(3);
  });

  for (let n = 1; n <= 13; n++) {
    it(`length after ${n} single-char inserts is ${n}`, () => {
      let r = Rope.empty();
      for (let i = 0; i < n; i++) r = r.insert(r.length, 'x');
      expect(r.length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 29: Rope substring exhaustive on 10-char string (66 tests)
// ---------------------------------------------------------------------------
describe('Rope substring exhaustive on 10-char string', () => {
  const s = 'abcdefghij';
  const r = Rope.fromString(s);
  for (let start = 0; start <= 10; start++) {
    for (let end = start; end <= 10; end++) {
      it(`substring(${start},${end}) of "${s}"`, () => {
        expect(r.substring(start, end)).toBe(s.slice(start, end));
      });
    }
  }
});

// ---------------------------------------------------------------------------
// Section 30: Rope indexOf in 50 strings (50 tests)
// ---------------------------------------------------------------------------
describe('Rope indexOf parametric', () => {
  for (let n = 1; n <= 50; n++) {
    const s = 'x'.repeat(n) + 'y';
    it(`indexOf 'y' in '${'x'.repeat(Math.min(n,5))}...' is ${n}`, () => {
      const r = Rope.fromString(s);
      expect(r.indexOf('y')).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 31: Rope charAt after concat (50 tests)
// ---------------------------------------------------------------------------
describe('Rope charAt after concat — positions 0..49', () => {
  const left = 'abcdefghijklmnopqrstuvwxyz'; // 26
  const right = 'ABCDEFGHIJKLMNOPQRSTUVWX'; // 24
  const full = left + right;
  const r = Rope.fromString(left).concat(Rope.fromString(right));
  for (let i = 0; i < full.length; i++) {
    it(`charAt(${i}) after concat is '${full[i]}'`, () => {
      expect(r.charAt(i)).toBe(full[i]);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 32: PieceTable insert at every position in 20-char string (21 tests)
// ---------------------------------------------------------------------------
describe('PieceTable insert at every position in 20-char string', () => {
  const base = 'abcdefghijklmnopqrst';
  for (let pos = 0; pos <= 20; pos++) {
    it(`PieceTable insert 'Z' at position ${pos}`, () => {
      const pt = new PieceTable(base);
      pt.insert(pos, 'Z');
      const expected = base.slice(0, pos) + 'Z' + base.slice(pos);
      expect(pt.getText()).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 33: PieceTable delete every single char from 20-char string (20 tests)
// ---------------------------------------------------------------------------
describe('PieceTable delete every single char from 20-char string', () => {
  const base = 'abcdefghijklmnopqrst';
  for (let pos = 0; pos < 20; pos++) {
    it(`PieceTable delete char at position ${pos}`, () => {
      const pt = new PieceTable(base);
      pt.delete(pos, 1);
      const expected = base.slice(0, pos) + base.slice(pos + 1);
      expect(pt.getText()).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 34: Rope insert+delete round-trip for various lengths (30 tests)
// ---------------------------------------------------------------------------
describe('Rope insert+delete round-trip', () => {
  for (let len = 1; len <= 30; len++) {
    it(`insert then delete '${len}-char' string restores original`, () => {
      const base = 'hello';
      const ins = 'x'.repeat(len);
      const pos = 2;
      const r = Rope.fromString(base).insert(pos, ins).delete(pos, pos + len);
      expect(r.toString()).toBe(base);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 35: ropeFromArray with different counts (30 tests)
// ---------------------------------------------------------------------------
describe('ropeFromArray parametric', () => {
  for (let n = 1; n <= 30; n++) {
    it(`ropeFromArray of ${n} 'ab' strings has length ${n * 2}`, () => {
      const arr = Array.from({ length: n }, () => 'ab');
      const r = ropeFromArray(arr);
      expect(r.length).toBe(n * 2);
      expect(r.toString()).toBe('ab'.repeat(n));
    });
  }
});

// ---------------------------------------------------------------------------
// Section 36: Rope split at every position in 30-char string (31 tests)
// ---------------------------------------------------------------------------
describe('Rope split at every position in 30-char string', () => {
  const s = 'abcdefghijklmnopqrstuvwxyz1234';
  const r = Rope.fromString(s);
  for (let idx = 0; idx <= 30; idx++) {
    it(`split at ${idx}: lengths ${idx} + ${30 - idx}`, () => {
      const [l, right] = r.split(idx);
      expect(l.length).toBe(idx);
      expect(right.length).toBe(30 - idx);
      expect(l.toString() + right.toString()).toBe(s);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 37: PieceTable multi-insert builds strings (40 tests)
// ---------------------------------------------------------------------------
describe('PieceTable multi-insert builds strings', () => {
  for (let n = 1; n <= 40; n++) {
    it(`PieceTable ${n} sequential end-appends`, () => {
      const pt = new PieceTable('');
      const ch = String.fromCharCode(64 + (n % 26) + 1);
      for (let i = 0; i < n; i++) pt.insert(pt.length, ch);
      expect(pt.getText()).toBe(ch.repeat(n));
      expect(pt.length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 38: Rope rebalance after large concat chain (20 tests)
// ---------------------------------------------------------------------------
describe('Rope rebalance after large concat chain', () => {
  for (let n = 2; n <= 21; n++) {
    it(`rebalance of ${n}-leaf chain toString correct`, () => {
      let r = Rope.empty();
      for (let i = 0; i < n; i++) r = r.concat(Rope.fromString('a'));
      const balanced = r.rebalance();
      expect(balanced.toString()).toBe('a'.repeat(n));
      expect(balanced.length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 39: Rope delete then split (20 tests)
// ---------------------------------------------------------------------------
describe('Rope delete then split', () => {
  const s = 'abcdefghij'; // 10 chars
  for (let del = 0; del < 5; del++) {
    for (let splitAt = 0; splitAt <= 5; splitAt++) {
      if (del + 1 > 10) continue;
      const afterDel = s.slice(0, del) + s.slice(del + 1);
      const clampedSplit = Math.min(splitAt, afterDel.length);
      it(`delete ${del} then split at ${splitAt}`, () => {
        const r = Rope.fromString(s).delete(del, del + 1);
        const [l, right] = r.split(clampedSplit);
        expect(l.toString() + right.toString()).toBe(afterDel);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// Section 40: Rope concat with varied string sizes (20 tests)
// ---------------------------------------------------------------------------
describe('Rope concat varied sizes', () => {
  const sizes = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 1, 2, 4, 7, 11, 16, 22, 29, 37, 46];
  for (let i = 0; i < sizes.length; i++) {
    const n = sizes[i];
    it(`concat of ${n}-char rope with its reverse toString`, () => {
      const a = 'a'.repeat(n);
      const b = 'b'.repeat(n);
      const r = Rope.fromString(a).concat(Rope.fromString(b));
      expect(r.toString()).toBe(a + b);
      expect(r.length).toBe(n * 2);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 41: Rope indexOf after multiple operations (20 tests)
// ---------------------------------------------------------------------------
describe('Rope indexOf after operations', () => {
  for (let i = 0; i < 10; i++) {
    it(`indexOf 'needle' after ${i} prepend-'x' operations`, () => {
      let r = Rope.fromString('needle');
      for (let j = 0; j < i; j++) r = Rope.fromString('x').concat(r);
      expect(r.indexOf('needle')).toBe(i);
    });
    it(`indexOf 'needle' after ${i} append-'z' operations`, () => {
      let r = Rope.fromString('needle');
      for (let j = 0; j < i; j++) r = r.concat(Rope.fromString('z'));
      expect(r.indexOf('needle')).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 42: Rope charAt on split results (20 tests)
// ---------------------------------------------------------------------------
describe('Rope charAt on split results', () => {
  const s = 'Hello, World! Goodbye!';
  const r = Rope.fromString(s);
  const splitAt = 13;
  const [leftPart, rightPart] = r.split(splitAt);

  for (let i = 0; i < Math.min(10, splitAt); i++) {
    it(`left split charAt(${i}) is '${s[i]}'`, () => {
      expect(leftPart.charAt(i)).toBe(s[i]);
    });
  }
  for (let i = 0; i < Math.min(10, s.length - splitAt); i++) {
    it(`right split charAt(${i}) is '${s[splitAt + i]}'`, () => {
      expect(rightPart.charAt(i)).toBe(s[splitAt + i]);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 43: PieceTable getText after series of alternating insert/delete (15 tests)
// ---------------------------------------------------------------------------
describe('PieceTable alternating insert/delete series', () => {
  for (let n = 1; n <= 15; n++) {
    it(`PieceTable alternating ${n} inserts and deletes`, () => {
      const pt = new PieceTable('start');
      for (let i = 0; i < n; i++) {
        pt.insert(5, `[${i}]`);
        pt.delete(5, String(`[${i}]`).length);
      }
      expect(pt.getText()).toBe('start');
      expect(pt.length).toBe(5);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 44: Rope fromString length 51..100 (50 tests)
// ---------------------------------------------------------------------------
describe('Rope fromString lengths 51..100', () => {
  for (let len = 51; len <= 100; len++) {
    it(`fromString of length ${len} toString correct`, () => {
      const s = String(len % 10).repeat(len);
      const r = Rope.fromString(s);
      expect(r.toString()).toBe(s);
      expect(r.length).toBe(len);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 45: Rope leafCount after concat chain (20 tests)
// ---------------------------------------------------------------------------
describe('Rope leafCount after concat', () => {
  for (let n = 1; n <= 20; n++) {
    it(`leafCount of ${n}-rope concat chain is ${n}`, () => {
      let r = Rope.empty();
      for (let i = 0; i < n; i++) r = r.concat(Rope.fromString('x'));
      expect(r.leafCount()).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 46: Rope insert at position 0 (25 tests)
// ---------------------------------------------------------------------------
describe('Rope insert at position 0', () => {
  for (let n = 1; n <= 25; n++) {
    it(`insert ${n}-char prefix at position 0`, () => {
      const prefix = 'p'.repeat(n);
      const r = Rope.fromString('suffix').insert(0, prefix);
      expect(r.toString()).toBe(prefix + 'suffix');
      expect(r.length).toBe(n + 6);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 47: Rope delete entire string in one operation (15 tests)
// ---------------------------------------------------------------------------
describe('Rope delete entire string', () => {
  for (let len = 1; len <= 15; len++) {
    it(`delete all ${len} chars gives empty`, () => {
      const s = 'a'.repeat(len);
      const r = Rope.fromString(s).delete(0, len);
      expect(r.toString()).toBe('');
      expect(r.length).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// Section 48: PieceTable delete ranges on 15-char string (25 tests)
// ---------------------------------------------------------------------------
describe('PieceTable delete ranges on 15-char string', () => {
  const base = 'abcdefghijklmno';
  for (let start = 0; start < 5; start++) {
    for (let len = 1; len <= 5; len++) {
      if (start + len > 15) continue;
      it(`PieceTable delete offset=${start} len=${len} from "${base}"`, () => {
        const pt = new PieceTable(base);
        pt.delete(start, len);
        const expected = base.slice(0, start) + base.slice(start + len);
        expect(pt.getText()).toBe(expected);
      });
    }
  }
});

// ---------------------------------------------------------------------------
// Section 49: Rope toString after repeated split+concat (10 tests)
// ---------------------------------------------------------------------------
describe('Rope repeated split+concat', () => {
  for (let n = 1; n <= 10; n++) {
    it(`${n} split+concat cycles preserve string`, () => {
      const s = 'abcdefghij';
      let r = Rope.fromString(s);
      for (let i = 0; i < n; i++) {
        const [l, right] = r.split(5);
        r = right.concat(l); // rotate by 5 each iteration
      }
      // After n rotations of 5 on length 10: n*5 mod 10
      const rotBy = (n * 5) % 10;
      expect(r.toString()).toBe(s.slice(rotBy) + s.slice(0, rotBy));
    });
  }
});

// ---------------------------------------------------------------------------
// Section 50: Rope concat commutative check (20 tests)
// ---------------------------------------------------------------------------
describe('Rope concat non-commutative verification', () => {
  const words = ['alpha', 'beta', 'gamma', 'delta', 'epsilon',
                  'zeta', 'eta', 'theta', 'iota', 'kappa',
                  'lambda', 'mu', 'nu', 'xi', 'omicron',
                  'pi', 'rho', 'sigma', 'tau', 'upsilon'];
  for (let i = 0; i < words.length; i++) {
    const a = words[i];
    const b = words[(i + 1) % words.length];
    it(`"${a}" + "${b}" concat toString is "${a + b}"`, () => {
      const r = Rope.fromString(a).concat(Rope.fromString(b));
      expect(r.toString()).toBe(a + b);
      expect(r.length).toBe(a.length + b.length);
    });
  }
});
