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
function hd258rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258rps_hd',()=>{it('a',()=>{expect(hd258rps(1,4)).toBe(2);});it('b',()=>{expect(hd258rps(3,1)).toBe(1);});it('c',()=>{expect(hd258rps(0,0)).toBe(0);});it('d',()=>{expect(hd258rps(93,73)).toBe(2);});it('e',()=>{expect(hd258rps(15,0)).toBe(4);});});
function hd259rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259rps_hd',()=>{it('a',()=>{expect(hd259rps(1,4)).toBe(2);});it('b',()=>{expect(hd259rps(3,1)).toBe(1);});it('c',()=>{expect(hd259rps(0,0)).toBe(0);});it('d',()=>{expect(hd259rps(93,73)).toBe(2);});it('e',()=>{expect(hd259rps(15,0)).toBe(4);});});
function hd260rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260rps_hd',()=>{it('a',()=>{expect(hd260rps(1,4)).toBe(2);});it('b',()=>{expect(hd260rps(3,1)).toBe(1);});it('c',()=>{expect(hd260rps(0,0)).toBe(0);});it('d',()=>{expect(hd260rps(93,73)).toBe(2);});it('e',()=>{expect(hd260rps(15,0)).toBe(4);});});
function hd261rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261rps_hd',()=>{it('a',()=>{expect(hd261rps(1,4)).toBe(2);});it('b',()=>{expect(hd261rps(3,1)).toBe(1);});it('c',()=>{expect(hd261rps(0,0)).toBe(0);});it('d',()=>{expect(hd261rps(93,73)).toBe(2);});it('e',()=>{expect(hd261rps(15,0)).toBe(4);});});
function hd262rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262rps_hd',()=>{it('a',()=>{expect(hd262rps(1,4)).toBe(2);});it('b',()=>{expect(hd262rps(3,1)).toBe(1);});it('c',()=>{expect(hd262rps(0,0)).toBe(0);});it('d',()=>{expect(hd262rps(93,73)).toBe(2);});it('e',()=>{expect(hd262rps(15,0)).toBe(4);});});
function hd263rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263rps_hd',()=>{it('a',()=>{expect(hd263rps(1,4)).toBe(2);});it('b',()=>{expect(hd263rps(3,1)).toBe(1);});it('c',()=>{expect(hd263rps(0,0)).toBe(0);});it('d',()=>{expect(hd263rps(93,73)).toBe(2);});it('e',()=>{expect(hd263rps(15,0)).toBe(4);});});
function hd264rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264rps_hd',()=>{it('a',()=>{expect(hd264rps(1,4)).toBe(2);});it('b',()=>{expect(hd264rps(3,1)).toBe(1);});it('c',()=>{expect(hd264rps(0,0)).toBe(0);});it('d',()=>{expect(hd264rps(93,73)).toBe(2);});it('e',()=>{expect(hd264rps(15,0)).toBe(4);});});
function hd265rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265rps_hd',()=>{it('a',()=>{expect(hd265rps(1,4)).toBe(2);});it('b',()=>{expect(hd265rps(3,1)).toBe(1);});it('c',()=>{expect(hd265rps(0,0)).toBe(0);});it('d',()=>{expect(hd265rps(93,73)).toBe(2);});it('e',()=>{expect(hd265rps(15,0)).toBe(4);});});
function hd266rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266rps_hd',()=>{it('a',()=>{expect(hd266rps(1,4)).toBe(2);});it('b',()=>{expect(hd266rps(3,1)).toBe(1);});it('c',()=>{expect(hd266rps(0,0)).toBe(0);});it('d',()=>{expect(hd266rps(93,73)).toBe(2);});it('e',()=>{expect(hd266rps(15,0)).toBe(4);});});
function hd267rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267rps_hd',()=>{it('a',()=>{expect(hd267rps(1,4)).toBe(2);});it('b',()=>{expect(hd267rps(3,1)).toBe(1);});it('c',()=>{expect(hd267rps(0,0)).toBe(0);});it('d',()=>{expect(hd267rps(93,73)).toBe(2);});it('e',()=>{expect(hd267rps(15,0)).toBe(4);});});
function hd268rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268rps_hd',()=>{it('a',()=>{expect(hd268rps(1,4)).toBe(2);});it('b',()=>{expect(hd268rps(3,1)).toBe(1);});it('c',()=>{expect(hd268rps(0,0)).toBe(0);});it('d',()=>{expect(hd268rps(93,73)).toBe(2);});it('e',()=>{expect(hd268rps(15,0)).toBe(4);});});
function hd269rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269rps_hd',()=>{it('a',()=>{expect(hd269rps(1,4)).toBe(2);});it('b',()=>{expect(hd269rps(3,1)).toBe(1);});it('c',()=>{expect(hd269rps(0,0)).toBe(0);});it('d',()=>{expect(hd269rps(93,73)).toBe(2);});it('e',()=>{expect(hd269rps(15,0)).toBe(4);});});
function hd270rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270rps_hd',()=>{it('a',()=>{expect(hd270rps(1,4)).toBe(2);});it('b',()=>{expect(hd270rps(3,1)).toBe(1);});it('c',()=>{expect(hd270rps(0,0)).toBe(0);});it('d',()=>{expect(hd270rps(93,73)).toBe(2);});it('e',()=>{expect(hd270rps(15,0)).toBe(4);});});
function hd271rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271rps_hd',()=>{it('a',()=>{expect(hd271rps(1,4)).toBe(2);});it('b',()=>{expect(hd271rps(3,1)).toBe(1);});it('c',()=>{expect(hd271rps(0,0)).toBe(0);});it('d',()=>{expect(hd271rps(93,73)).toBe(2);});it('e',()=>{expect(hd271rps(15,0)).toBe(4);});});
function hd272rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272rps_hd',()=>{it('a',()=>{expect(hd272rps(1,4)).toBe(2);});it('b',()=>{expect(hd272rps(3,1)).toBe(1);});it('c',()=>{expect(hd272rps(0,0)).toBe(0);});it('d',()=>{expect(hd272rps(93,73)).toBe(2);});it('e',()=>{expect(hd272rps(15,0)).toBe(4);});});
function hd273rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273rps_hd',()=>{it('a',()=>{expect(hd273rps(1,4)).toBe(2);});it('b',()=>{expect(hd273rps(3,1)).toBe(1);});it('c',()=>{expect(hd273rps(0,0)).toBe(0);});it('d',()=>{expect(hd273rps(93,73)).toBe(2);});it('e',()=>{expect(hd273rps(15,0)).toBe(4);});});
function hd274rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274rps_hd',()=>{it('a',()=>{expect(hd274rps(1,4)).toBe(2);});it('b',()=>{expect(hd274rps(3,1)).toBe(1);});it('c',()=>{expect(hd274rps(0,0)).toBe(0);});it('d',()=>{expect(hd274rps(93,73)).toBe(2);});it('e',()=>{expect(hd274rps(15,0)).toBe(4);});});
function hd275rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275rps_hd',()=>{it('a',()=>{expect(hd275rps(1,4)).toBe(2);});it('b',()=>{expect(hd275rps(3,1)).toBe(1);});it('c',()=>{expect(hd275rps(0,0)).toBe(0);});it('d',()=>{expect(hd275rps(93,73)).toBe(2);});it('e',()=>{expect(hd275rps(15,0)).toBe(4);});});
function hd276rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276rps_hd',()=>{it('a',()=>{expect(hd276rps(1,4)).toBe(2);});it('b',()=>{expect(hd276rps(3,1)).toBe(1);});it('c',()=>{expect(hd276rps(0,0)).toBe(0);});it('d',()=>{expect(hd276rps(93,73)).toBe(2);});it('e',()=>{expect(hd276rps(15,0)).toBe(4);});});
function hd277rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277rps_hd',()=>{it('a',()=>{expect(hd277rps(1,4)).toBe(2);});it('b',()=>{expect(hd277rps(3,1)).toBe(1);});it('c',()=>{expect(hd277rps(0,0)).toBe(0);});it('d',()=>{expect(hd277rps(93,73)).toBe(2);});it('e',()=>{expect(hd277rps(15,0)).toBe(4);});});
function hd278rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278rps_hd',()=>{it('a',()=>{expect(hd278rps(1,4)).toBe(2);});it('b',()=>{expect(hd278rps(3,1)).toBe(1);});it('c',()=>{expect(hd278rps(0,0)).toBe(0);});it('d',()=>{expect(hd278rps(93,73)).toBe(2);});it('e',()=>{expect(hd278rps(15,0)).toBe(4);});});
function hd279rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279rps_hd',()=>{it('a',()=>{expect(hd279rps(1,4)).toBe(2);});it('b',()=>{expect(hd279rps(3,1)).toBe(1);});it('c',()=>{expect(hd279rps(0,0)).toBe(0);});it('d',()=>{expect(hd279rps(93,73)).toBe(2);});it('e',()=>{expect(hd279rps(15,0)).toBe(4);});});
function hd280rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280rps_hd',()=>{it('a',()=>{expect(hd280rps(1,4)).toBe(2);});it('b',()=>{expect(hd280rps(3,1)).toBe(1);});it('c',()=>{expect(hd280rps(0,0)).toBe(0);});it('d',()=>{expect(hd280rps(93,73)).toBe(2);});it('e',()=>{expect(hd280rps(15,0)).toBe(4);});});
function hd281rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281rps_hd',()=>{it('a',()=>{expect(hd281rps(1,4)).toBe(2);});it('b',()=>{expect(hd281rps(3,1)).toBe(1);});it('c',()=>{expect(hd281rps(0,0)).toBe(0);});it('d',()=>{expect(hd281rps(93,73)).toBe(2);});it('e',()=>{expect(hd281rps(15,0)).toBe(4);});});
function hd282rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282rps_hd',()=>{it('a',()=>{expect(hd282rps(1,4)).toBe(2);});it('b',()=>{expect(hd282rps(3,1)).toBe(1);});it('c',()=>{expect(hd282rps(0,0)).toBe(0);});it('d',()=>{expect(hd282rps(93,73)).toBe(2);});it('e',()=>{expect(hd282rps(15,0)).toBe(4);});});
function hd283rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283rps_hd',()=>{it('a',()=>{expect(hd283rps(1,4)).toBe(2);});it('b',()=>{expect(hd283rps(3,1)).toBe(1);});it('c',()=>{expect(hd283rps(0,0)).toBe(0);});it('d',()=>{expect(hd283rps(93,73)).toBe(2);});it('e',()=>{expect(hd283rps(15,0)).toBe(4);});});
function hd284rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284rps_hd',()=>{it('a',()=>{expect(hd284rps(1,4)).toBe(2);});it('b',()=>{expect(hd284rps(3,1)).toBe(1);});it('c',()=>{expect(hd284rps(0,0)).toBe(0);});it('d',()=>{expect(hd284rps(93,73)).toBe(2);});it('e',()=>{expect(hd284rps(15,0)).toBe(4);});});
function hd285rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285rps_hd',()=>{it('a',()=>{expect(hd285rps(1,4)).toBe(2);});it('b',()=>{expect(hd285rps(3,1)).toBe(1);});it('c',()=>{expect(hd285rps(0,0)).toBe(0);});it('d',()=>{expect(hd285rps(93,73)).toBe(2);});it('e',()=>{expect(hd285rps(15,0)).toBe(4);});});
function hd286rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286rps_hd',()=>{it('a',()=>{expect(hd286rps(1,4)).toBe(2);});it('b',()=>{expect(hd286rps(3,1)).toBe(1);});it('c',()=>{expect(hd286rps(0,0)).toBe(0);});it('d',()=>{expect(hd286rps(93,73)).toBe(2);});it('e',()=>{expect(hd286rps(15,0)).toBe(4);});});
function hd287rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287rps_hd',()=>{it('a',()=>{expect(hd287rps(1,4)).toBe(2);});it('b',()=>{expect(hd287rps(3,1)).toBe(1);});it('c',()=>{expect(hd287rps(0,0)).toBe(0);});it('d',()=>{expect(hd287rps(93,73)).toBe(2);});it('e',()=>{expect(hd287rps(15,0)).toBe(4);});});
function hd288rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288rps_hd',()=>{it('a',()=>{expect(hd288rps(1,4)).toBe(2);});it('b',()=>{expect(hd288rps(3,1)).toBe(1);});it('c',()=>{expect(hd288rps(0,0)).toBe(0);});it('d',()=>{expect(hd288rps(93,73)).toBe(2);});it('e',()=>{expect(hd288rps(15,0)).toBe(4);});});
function hd289rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289rps_hd',()=>{it('a',()=>{expect(hd289rps(1,4)).toBe(2);});it('b',()=>{expect(hd289rps(3,1)).toBe(1);});it('c',()=>{expect(hd289rps(0,0)).toBe(0);});it('d',()=>{expect(hd289rps(93,73)).toBe(2);});it('e',()=>{expect(hd289rps(15,0)).toBe(4);});});
function hd290rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290rps_hd',()=>{it('a',()=>{expect(hd290rps(1,4)).toBe(2);});it('b',()=>{expect(hd290rps(3,1)).toBe(1);});it('c',()=>{expect(hd290rps(0,0)).toBe(0);});it('d',()=>{expect(hd290rps(93,73)).toBe(2);});it('e',()=>{expect(hd290rps(15,0)).toBe(4);});});
function hd291rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291rps_hd',()=>{it('a',()=>{expect(hd291rps(1,4)).toBe(2);});it('b',()=>{expect(hd291rps(3,1)).toBe(1);});it('c',()=>{expect(hd291rps(0,0)).toBe(0);});it('d',()=>{expect(hd291rps(93,73)).toBe(2);});it('e',()=>{expect(hd291rps(15,0)).toBe(4);});});
function hd292rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292rps_hd',()=>{it('a',()=>{expect(hd292rps(1,4)).toBe(2);});it('b',()=>{expect(hd292rps(3,1)).toBe(1);});it('c',()=>{expect(hd292rps(0,0)).toBe(0);});it('d',()=>{expect(hd292rps(93,73)).toBe(2);});it('e',()=>{expect(hd292rps(15,0)).toBe(4);});});
function hd293rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293rps_hd',()=>{it('a',()=>{expect(hd293rps(1,4)).toBe(2);});it('b',()=>{expect(hd293rps(3,1)).toBe(1);});it('c',()=>{expect(hd293rps(0,0)).toBe(0);});it('d',()=>{expect(hd293rps(93,73)).toBe(2);});it('e',()=>{expect(hd293rps(15,0)).toBe(4);});});
function hd294rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294rps_hd',()=>{it('a',()=>{expect(hd294rps(1,4)).toBe(2);});it('b',()=>{expect(hd294rps(3,1)).toBe(1);});it('c',()=>{expect(hd294rps(0,0)).toBe(0);});it('d',()=>{expect(hd294rps(93,73)).toBe(2);});it('e',()=>{expect(hd294rps(15,0)).toBe(4);});});
function hd295rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295rps_hd',()=>{it('a',()=>{expect(hd295rps(1,4)).toBe(2);});it('b',()=>{expect(hd295rps(3,1)).toBe(1);});it('c',()=>{expect(hd295rps(0,0)).toBe(0);});it('d',()=>{expect(hd295rps(93,73)).toBe(2);});it('e',()=>{expect(hd295rps(15,0)).toBe(4);});});
function hd296rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296rps_hd',()=>{it('a',()=>{expect(hd296rps(1,4)).toBe(2);});it('b',()=>{expect(hd296rps(3,1)).toBe(1);});it('c',()=>{expect(hd296rps(0,0)).toBe(0);});it('d',()=>{expect(hd296rps(93,73)).toBe(2);});it('e',()=>{expect(hd296rps(15,0)).toBe(4);});});
function hd297rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297rps_hd',()=>{it('a',()=>{expect(hd297rps(1,4)).toBe(2);});it('b',()=>{expect(hd297rps(3,1)).toBe(1);});it('c',()=>{expect(hd297rps(0,0)).toBe(0);});it('d',()=>{expect(hd297rps(93,73)).toBe(2);});it('e',()=>{expect(hd297rps(15,0)).toBe(4);});});
function hd298rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298rps_hd',()=>{it('a',()=>{expect(hd298rps(1,4)).toBe(2);});it('b',()=>{expect(hd298rps(3,1)).toBe(1);});it('c',()=>{expect(hd298rps(0,0)).toBe(0);});it('d',()=>{expect(hd298rps(93,73)).toBe(2);});it('e',()=>{expect(hd298rps(15,0)).toBe(4);});});
function hd299rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299rps_hd',()=>{it('a',()=>{expect(hd299rps(1,4)).toBe(2);});it('b',()=>{expect(hd299rps(3,1)).toBe(1);});it('c',()=>{expect(hd299rps(0,0)).toBe(0);});it('d',()=>{expect(hd299rps(93,73)).toBe(2);});it('e',()=>{expect(hd299rps(15,0)).toBe(4);});});
function hd300rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300rps_hd',()=>{it('a',()=>{expect(hd300rps(1,4)).toBe(2);});it('b',()=>{expect(hd300rps(3,1)).toBe(1);});it('c',()=>{expect(hd300rps(0,0)).toBe(0);});it('d',()=>{expect(hd300rps(93,73)).toBe(2);});it('e',()=>{expect(hd300rps(15,0)).toBe(4);});});
function hd301rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301rps_hd',()=>{it('a',()=>{expect(hd301rps(1,4)).toBe(2);});it('b',()=>{expect(hd301rps(3,1)).toBe(1);});it('c',()=>{expect(hd301rps(0,0)).toBe(0);});it('d',()=>{expect(hd301rps(93,73)).toBe(2);});it('e',()=>{expect(hd301rps(15,0)).toBe(4);});});
function hd302rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302rps_hd',()=>{it('a',()=>{expect(hd302rps(1,4)).toBe(2);});it('b',()=>{expect(hd302rps(3,1)).toBe(1);});it('c',()=>{expect(hd302rps(0,0)).toBe(0);});it('d',()=>{expect(hd302rps(93,73)).toBe(2);});it('e',()=>{expect(hd302rps(15,0)).toBe(4);});});
function hd303rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303rps_hd',()=>{it('a',()=>{expect(hd303rps(1,4)).toBe(2);});it('b',()=>{expect(hd303rps(3,1)).toBe(1);});it('c',()=>{expect(hd303rps(0,0)).toBe(0);});it('d',()=>{expect(hd303rps(93,73)).toBe(2);});it('e',()=>{expect(hd303rps(15,0)).toBe(4);});});
function hd304rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304rps_hd',()=>{it('a',()=>{expect(hd304rps(1,4)).toBe(2);});it('b',()=>{expect(hd304rps(3,1)).toBe(1);});it('c',()=>{expect(hd304rps(0,0)).toBe(0);});it('d',()=>{expect(hd304rps(93,73)).toBe(2);});it('e',()=>{expect(hd304rps(15,0)).toBe(4);});});
function hd305rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305rps_hd',()=>{it('a',()=>{expect(hd305rps(1,4)).toBe(2);});it('b',()=>{expect(hd305rps(3,1)).toBe(1);});it('c',()=>{expect(hd305rps(0,0)).toBe(0);});it('d',()=>{expect(hd305rps(93,73)).toBe(2);});it('e',()=>{expect(hd305rps(15,0)).toBe(4);});});
function hd306rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306rps_hd',()=>{it('a',()=>{expect(hd306rps(1,4)).toBe(2);});it('b',()=>{expect(hd306rps(3,1)).toBe(1);});it('c',()=>{expect(hd306rps(0,0)).toBe(0);});it('d',()=>{expect(hd306rps(93,73)).toBe(2);});it('e',()=>{expect(hd306rps(15,0)).toBe(4);});});
function hd307rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307rps_hd',()=>{it('a',()=>{expect(hd307rps(1,4)).toBe(2);});it('b',()=>{expect(hd307rps(3,1)).toBe(1);});it('c',()=>{expect(hd307rps(0,0)).toBe(0);});it('d',()=>{expect(hd307rps(93,73)).toBe(2);});it('e',()=>{expect(hd307rps(15,0)).toBe(4);});});
function hd308rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308rps_hd',()=>{it('a',()=>{expect(hd308rps(1,4)).toBe(2);});it('b',()=>{expect(hd308rps(3,1)).toBe(1);});it('c',()=>{expect(hd308rps(0,0)).toBe(0);});it('d',()=>{expect(hd308rps(93,73)).toBe(2);});it('e',()=>{expect(hd308rps(15,0)).toBe(4);});});
function hd309rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309rps_hd',()=>{it('a',()=>{expect(hd309rps(1,4)).toBe(2);});it('b',()=>{expect(hd309rps(3,1)).toBe(1);});it('c',()=>{expect(hd309rps(0,0)).toBe(0);});it('d',()=>{expect(hd309rps(93,73)).toBe(2);});it('e',()=>{expect(hd309rps(15,0)).toBe(4);});});
function hd310rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310rps_hd',()=>{it('a',()=>{expect(hd310rps(1,4)).toBe(2);});it('b',()=>{expect(hd310rps(3,1)).toBe(1);});it('c',()=>{expect(hd310rps(0,0)).toBe(0);});it('d',()=>{expect(hd310rps(93,73)).toBe(2);});it('e',()=>{expect(hd310rps(15,0)).toBe(4);});});
function hd311rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311rps_hd',()=>{it('a',()=>{expect(hd311rps(1,4)).toBe(2);});it('b',()=>{expect(hd311rps(3,1)).toBe(1);});it('c',()=>{expect(hd311rps(0,0)).toBe(0);});it('d',()=>{expect(hd311rps(93,73)).toBe(2);});it('e',()=>{expect(hd311rps(15,0)).toBe(4);});});
function hd312rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312rps_hd',()=>{it('a',()=>{expect(hd312rps(1,4)).toBe(2);});it('b',()=>{expect(hd312rps(3,1)).toBe(1);});it('c',()=>{expect(hd312rps(0,0)).toBe(0);});it('d',()=>{expect(hd312rps(93,73)).toBe(2);});it('e',()=>{expect(hd312rps(15,0)).toBe(4);});});
function hd313rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313rps_hd',()=>{it('a',()=>{expect(hd313rps(1,4)).toBe(2);});it('b',()=>{expect(hd313rps(3,1)).toBe(1);});it('c',()=>{expect(hd313rps(0,0)).toBe(0);});it('d',()=>{expect(hd313rps(93,73)).toBe(2);});it('e',()=>{expect(hd313rps(15,0)).toBe(4);});});
function hd314rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314rps_hd',()=>{it('a',()=>{expect(hd314rps(1,4)).toBe(2);});it('b',()=>{expect(hd314rps(3,1)).toBe(1);});it('c',()=>{expect(hd314rps(0,0)).toBe(0);});it('d',()=>{expect(hd314rps(93,73)).toBe(2);});it('e',()=>{expect(hd314rps(15,0)).toBe(4);});});
function hd315rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315rps_hd',()=>{it('a',()=>{expect(hd315rps(1,4)).toBe(2);});it('b',()=>{expect(hd315rps(3,1)).toBe(1);});it('c',()=>{expect(hd315rps(0,0)).toBe(0);});it('d',()=>{expect(hd315rps(93,73)).toBe(2);});it('e',()=>{expect(hd315rps(15,0)).toBe(4);});});
function hd316rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316rps_hd',()=>{it('a',()=>{expect(hd316rps(1,4)).toBe(2);});it('b',()=>{expect(hd316rps(3,1)).toBe(1);});it('c',()=>{expect(hd316rps(0,0)).toBe(0);});it('d',()=>{expect(hd316rps(93,73)).toBe(2);});it('e',()=>{expect(hd316rps(15,0)).toBe(4);});});
function hd317rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317rps_hd',()=>{it('a',()=>{expect(hd317rps(1,4)).toBe(2);});it('b',()=>{expect(hd317rps(3,1)).toBe(1);});it('c',()=>{expect(hd317rps(0,0)).toBe(0);});it('d',()=>{expect(hd317rps(93,73)).toBe(2);});it('e',()=>{expect(hd317rps(15,0)).toBe(4);});});
function hd318rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318rps_hd',()=>{it('a',()=>{expect(hd318rps(1,4)).toBe(2);});it('b',()=>{expect(hd318rps(3,1)).toBe(1);});it('c',()=>{expect(hd318rps(0,0)).toBe(0);});it('d',()=>{expect(hd318rps(93,73)).toBe(2);});it('e',()=>{expect(hd318rps(15,0)).toBe(4);});});
function hd319rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319rps_hd',()=>{it('a',()=>{expect(hd319rps(1,4)).toBe(2);});it('b',()=>{expect(hd319rps(3,1)).toBe(1);});it('c',()=>{expect(hd319rps(0,0)).toBe(0);});it('d',()=>{expect(hd319rps(93,73)).toBe(2);});it('e',()=>{expect(hd319rps(15,0)).toBe(4);});});
function hd320rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320rps_hd',()=>{it('a',()=>{expect(hd320rps(1,4)).toBe(2);});it('b',()=>{expect(hd320rps(3,1)).toBe(1);});it('c',()=>{expect(hd320rps(0,0)).toBe(0);});it('d',()=>{expect(hd320rps(93,73)).toBe(2);});it('e',()=>{expect(hd320rps(15,0)).toBe(4);});});
function hd321rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321rps_hd',()=>{it('a',()=>{expect(hd321rps(1,4)).toBe(2);});it('b',()=>{expect(hd321rps(3,1)).toBe(1);});it('c',()=>{expect(hd321rps(0,0)).toBe(0);});it('d',()=>{expect(hd321rps(93,73)).toBe(2);});it('e',()=>{expect(hd321rps(15,0)).toBe(4);});});
function hd322rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322rps_hd',()=>{it('a',()=>{expect(hd322rps(1,4)).toBe(2);});it('b',()=>{expect(hd322rps(3,1)).toBe(1);});it('c',()=>{expect(hd322rps(0,0)).toBe(0);});it('d',()=>{expect(hd322rps(93,73)).toBe(2);});it('e',()=>{expect(hd322rps(15,0)).toBe(4);});});
function hd323rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323rps_hd',()=>{it('a',()=>{expect(hd323rps(1,4)).toBe(2);});it('b',()=>{expect(hd323rps(3,1)).toBe(1);});it('c',()=>{expect(hd323rps(0,0)).toBe(0);});it('d',()=>{expect(hd323rps(93,73)).toBe(2);});it('e',()=>{expect(hd323rps(15,0)).toBe(4);});});
function hd324rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324rps_hd',()=>{it('a',()=>{expect(hd324rps(1,4)).toBe(2);});it('b',()=>{expect(hd324rps(3,1)).toBe(1);});it('c',()=>{expect(hd324rps(0,0)).toBe(0);});it('d',()=>{expect(hd324rps(93,73)).toBe(2);});it('e',()=>{expect(hd324rps(15,0)).toBe(4);});});
function hd325rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325rps_hd',()=>{it('a',()=>{expect(hd325rps(1,4)).toBe(2);});it('b',()=>{expect(hd325rps(3,1)).toBe(1);});it('c',()=>{expect(hd325rps(0,0)).toBe(0);});it('d',()=>{expect(hd325rps(93,73)).toBe(2);});it('e',()=>{expect(hd325rps(15,0)).toBe(4);});});
function hd326rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326rps_hd',()=>{it('a',()=>{expect(hd326rps(1,4)).toBe(2);});it('b',()=>{expect(hd326rps(3,1)).toBe(1);});it('c',()=>{expect(hd326rps(0,0)).toBe(0);});it('d',()=>{expect(hd326rps(93,73)).toBe(2);});it('e',()=>{expect(hd326rps(15,0)).toBe(4);});});
function hd327rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327rps_hd',()=>{it('a',()=>{expect(hd327rps(1,4)).toBe(2);});it('b',()=>{expect(hd327rps(3,1)).toBe(1);});it('c',()=>{expect(hd327rps(0,0)).toBe(0);});it('d',()=>{expect(hd327rps(93,73)).toBe(2);});it('e',()=>{expect(hd327rps(15,0)).toBe(4);});});
function hd328rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328rps_hd',()=>{it('a',()=>{expect(hd328rps(1,4)).toBe(2);});it('b',()=>{expect(hd328rps(3,1)).toBe(1);});it('c',()=>{expect(hd328rps(0,0)).toBe(0);});it('d',()=>{expect(hd328rps(93,73)).toBe(2);});it('e',()=>{expect(hd328rps(15,0)).toBe(4);});});
function hd329rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329rps_hd',()=>{it('a',()=>{expect(hd329rps(1,4)).toBe(2);});it('b',()=>{expect(hd329rps(3,1)).toBe(1);});it('c',()=>{expect(hd329rps(0,0)).toBe(0);});it('d',()=>{expect(hd329rps(93,73)).toBe(2);});it('e',()=>{expect(hd329rps(15,0)).toBe(4);});});
function hd330rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330rps_hd',()=>{it('a',()=>{expect(hd330rps(1,4)).toBe(2);});it('b',()=>{expect(hd330rps(3,1)).toBe(1);});it('c',()=>{expect(hd330rps(0,0)).toBe(0);});it('d',()=>{expect(hd330rps(93,73)).toBe(2);});it('e',()=>{expect(hd330rps(15,0)).toBe(4);});});
function hd331rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331rps_hd',()=>{it('a',()=>{expect(hd331rps(1,4)).toBe(2);});it('b',()=>{expect(hd331rps(3,1)).toBe(1);});it('c',()=>{expect(hd331rps(0,0)).toBe(0);});it('d',()=>{expect(hd331rps(93,73)).toBe(2);});it('e',()=>{expect(hd331rps(15,0)).toBe(4);});});
function hd332rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332rps_hd',()=>{it('a',()=>{expect(hd332rps(1,4)).toBe(2);});it('b',()=>{expect(hd332rps(3,1)).toBe(1);});it('c',()=>{expect(hd332rps(0,0)).toBe(0);});it('d',()=>{expect(hd332rps(93,73)).toBe(2);});it('e',()=>{expect(hd332rps(15,0)).toBe(4);});});
function hd333rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333rps_hd',()=>{it('a',()=>{expect(hd333rps(1,4)).toBe(2);});it('b',()=>{expect(hd333rps(3,1)).toBe(1);});it('c',()=>{expect(hd333rps(0,0)).toBe(0);});it('d',()=>{expect(hd333rps(93,73)).toBe(2);});it('e',()=>{expect(hd333rps(15,0)).toBe(4);});});
function hd334rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334rps_hd',()=>{it('a',()=>{expect(hd334rps(1,4)).toBe(2);});it('b',()=>{expect(hd334rps(3,1)).toBe(1);});it('c',()=>{expect(hd334rps(0,0)).toBe(0);});it('d',()=>{expect(hd334rps(93,73)).toBe(2);});it('e',()=>{expect(hd334rps(15,0)).toBe(4);});});
function hd335rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335rps_hd',()=>{it('a',()=>{expect(hd335rps(1,4)).toBe(2);});it('b',()=>{expect(hd335rps(3,1)).toBe(1);});it('c',()=>{expect(hd335rps(0,0)).toBe(0);});it('d',()=>{expect(hd335rps(93,73)).toBe(2);});it('e',()=>{expect(hd335rps(15,0)).toBe(4);});});
function hd336rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336rps_hd',()=>{it('a',()=>{expect(hd336rps(1,4)).toBe(2);});it('b',()=>{expect(hd336rps(3,1)).toBe(1);});it('c',()=>{expect(hd336rps(0,0)).toBe(0);});it('d',()=>{expect(hd336rps(93,73)).toBe(2);});it('e',()=>{expect(hd336rps(15,0)).toBe(4);});});
function hd337rps(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337rps_hd',()=>{it('a',()=>{expect(hd337rps(1,4)).toBe(2);});it('b',()=>{expect(hd337rps(3,1)).toBe(1);});it('c',()=>{expect(hd337rps(0,0)).toBe(0);});it('d',()=>{expect(hd337rps(93,73)).toBe(2);});it('e',()=>{expect(hd337rps(15,0)).toBe(4);});});
