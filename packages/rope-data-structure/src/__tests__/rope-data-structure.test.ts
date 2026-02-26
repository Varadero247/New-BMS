// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { Rope, createRope, ropeFromParts } from '../rope-data-structure';

describe('Rope - construction and length', () => {
  it('empty rope has length 0', () => { expect(new Rope().length).toBe(0); });
  it('rope from string has correct length', () => { expect(new Rope('hello').length).toBe(5); });
  it('createRope factory works', () => { expect(createRope('abc').length).toBe(3); });
  it('toString returns original string', () => { expect(new Rope('hello').toString()).toBe('hello'); });
  it('empty rope toString is empty string', () => { expect(new Rope().toString()).toBe(''); });
  for (let i = 0; i < 50; i++) {
    it(`Rope length matches string length ${i}`, () => {
      const s = 'a'.repeat(i);
      expect(createRope(s).length).toBe(i);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`Rope toString preserves string ${i}`, () => {
      const s = `word${i}text`;
      expect(createRope(s).toString()).toBe(s);
    });
  }
});

describe('Rope - concat', () => {
  it('concat two ropes produces combined string', () => {
    const a = createRope('hello ');
    const b = createRope('world');
    expect(a.concat(b).toString()).toBe('hello world');
  });
  it('concat with empty left', () => {
    expect(new Rope().concat(createRope('x')).toString()).toBe('x');
  });
  it('concat with empty right', () => {
    expect(createRope('x').concat(new Rope()).toString()).toBe('x');
  });
  it('concat length = sum of lengths', () => {
    const a = createRope('abc'), b = createRope('def');
    expect(a.concat(b).length).toBe(6);
  });
  for (let i = 0; i < 50; i++) {
    it(`concat preserves content ${i}`, () => {
      const a = createRope(`a${i}`), b = createRope(`b${i}`);
      expect(a.concat(b).toString()).toBe(`a${i}b${i}`);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it(`concat ${n} ropes of length 1`, () => {
      let r = new Rope();
      for (let i = 0; i < n; i++) r = r.concat(createRope('x'));
      expect(r.length).toBe(n);
    });
  }
});

describe('Rope - charAt', () => {
  it('charAt(0) returns first char', () => { expect(createRope('abc').charAt(0)).toBe('a'); });
  it('charAt last index', () => { expect(createRope('abc').charAt(2)).toBe('c'); });
  it('charAt out of range returns empty', () => { expect(createRope('abc').charAt(10)).toBe(''); });
  it('charAt negative returns empty', () => { expect(createRope('abc').charAt(-1)).toBe(''); });
  for (let i = 0; i < 50; i++) {
    it(`charAt at position ${i % 5} in 5-char string ${i}`, () => {
      const s = 'abcde';
      expect(createRope(s).charAt(i % 5)).toBe(s[i % 5]);
    });
  }
});

describe('Rope - split and insert and delete', () => {
  it('split at midpoint', () => {
    const [l, r] = createRope('hello').split(2);
    expect(l.toString()).toBe('he');
    expect(r.toString()).toBe('llo');
  });
  it('insert at position', () => {
    const r = createRope('helo').insert(3, 'l');
    expect(r.toString()).toBe('hello');
  });
  it('delete range', () => {
    const r = createRope('hello world').delete(5, 6);
    expect(r.toString()).toBe('helloworld');
  });
  it('split at 0', () => {
    const [l, r] = createRope('abc').split(0);
    expect(l.toString()).toBe('');
    expect(r.toString()).toBe('abc');
  });
  it('split at end', () => {
    const [l, r] = createRope('abc').split(3);
    expect(l.toString()).toBe('abc');
    expect(r.toString()).toBe('');
  });
  for (let i = 0; i < 50; i++) {
    it(`split+concat roundtrip ${i}`, () => {
      const s = `test${i}string`;
      const mid = Math.floor(s.length / 2);
      const [l, r] = createRope(s).split(mid);
      expect(l.concat(r).toString()).toBe(s);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`insert at position 0 ${i}`, () => {
      const r = createRope(`tail${i}`).insert(0, 'head');
      expect(r.toString().startsWith('head')).toBe(true);
    });
  }
});

describe('Rope - slice, indexOf, report', () => {
  it('slice returns substring', () => { expect(createRope('hello world').slice(6)).toBe('world'); });
  it('slice with end', () => { expect(createRope('hello').slice(1, 3)).toBe('el'); });
  it('indexOf finds substring', () => { expect(createRope('hello world').indexOf('world')).toBe(6); });
  it('indexOf returns -1 for missing', () => { expect(createRope('hello').indexOf('xyz')).toBe(-1); });
  it('report is like slice', () => { expect(createRope('abcdef').report(2, 5)).toBe('cde'); });
  for (let i = 0; i < 50; i++) {
    it(`indexOf finds 'x' at position ${i}`, () => {
      const s = 'y'.repeat(i) + 'x' + 'y'.repeat(5);
      expect(createRope(s).indexOf('x')).toBe(i);
    });
  }
});

describe('ropeFromParts', () => {
  it('from empty array gives empty rope', () => { expect(ropeFromParts([]).toString()).toBe(''); });
  it('from one part', () => { expect(ropeFromParts(['hello']).toString()).toBe('hello'); });
  it('from multiple parts', () => { expect(ropeFromParts(['a', 'b', 'c']).toString()).toBe('abc'); });
  for (let n = 1; n <= 50; n++) {
    it(`ropeFromParts ${n} single chars`, () => {
      const parts = Array.from({ length: n }, (_, i) => String.fromCharCode(97 + (i % 26)));
      const r = ropeFromParts(parts);
      expect(r.length).toBe(n);
    });
  }
  for (let i = 0; i < 50; i++) {
    it(`ropeFromParts content correct ${i}`, () => {
      const parts = [`foo${i}`, `bar${i}`];
      expect(ropeFromParts(parts).toString()).toBe(`foo${i}bar${i}`);
    });
  }
});

describe('Rope extra coverage', () => {
  for (let i = 1; i <= 100; i++) {
    it(`rope concat length ${i}`, () => {
      const a = createRope('a'.repeat(i));
      const b = createRope('b'.repeat(i));
      expect(a.concat(b).length).toBe(i * 2);
    });
  }
  for (let i = 0; i < 100; i++) {
    it(`insert then delete restores ${i}`, () => {
      const s = `original${i}`;
      const r = createRope(s).insert(3, 'XXX').delete(3, 6);
      expect(r.toString()).toBe(s);
    });
  }
});

describe('rope top-up 1', () => {
  for (let i = 0; i < 100; i++) {
    it('rope slice correct ' + i, () => {
      const s = 'abcdefghij'.repeat(3);
      const r = createRope(s);
      expect(r.slice(i % 10, (i % 10) + 5)).toBe(s.slice(i % 10, (i % 10) + 5));
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rope length after insert ' + i, () => {
      const r = createRope('hello');
      const r2 = r.insert(i % 5, 'X');
      expect(r2.length).toBe(6);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rope split lengths sum to original ' + i, () => {
      const s = 'word'.repeat(10);
      const [l, r] = createRope(s).split(i % 40);
      expect(l.length + r.length).toBe(s.length);
    });
  }
});
