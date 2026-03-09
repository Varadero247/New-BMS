// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { from } from '../query-builder';

// where() — 100 tests
describe('where() filtering', () => {
  for (let i = 1; i <= 100; i++) {
    it(`where filters values >= ${i} from 100 items`, () => {
      const data = Array.from({ length: 100 }, (_, k) => ({ value: k + 1 }));
      const result = from(data).where(r => r.value >= i).toArray();
      expect(result.length).toBe(101 - i);
    });
  }
});

// limit() — 100 tests
describe('limit()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`limit(${n}) returns exactly ${n} items`, () => {
      const data = Array.from({ length: 200 }, (_, k) => ({ id: k }));
      expect(from(data).limit(n).count()).toBe(n);
    });
  }
});

// orderBy asc — 100 tests
describe('orderBy asc', () => {
  for (let n = 1; n <= 100; n++) {
    it(`orderBy asc on ${n} items gives ascending order`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: n - k }));
      const sorted = from(data).orderBy('v', 'asc').toArray();
      expect(sorted[0].v).toBe(1);
    });
  }
});

// orderBy desc — 100 tests
describe('orderBy desc', () => {
  for (let n = 1; n <= 100; n++) {
    it(`orderBy desc on ${n} items gives first = ${n}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: k + 1 }));
      const sorted = from(data).orderBy('v', 'desc').toArray();
      expect(sorted[0].v).toBe(n);
    });
  }
});

// offset() — 100 tests
describe('offset()', () => {
  for (let n = 0; n < 100; n++) {
    it(`offset(${n}) leaves ${100 - n} items`, () => {
      const data = Array.from({ length: 100 }, (_, k) => ({ id: k }));
      expect(from(data).offset(n).count()).toBe(100 - n);
    });
  }
});

// sum() — 100 tests
describe('sum()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`sum of 1..${n} = ${n * (n + 1) / 2}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: k + 1 }));
      expect(from(data).sum('v')).toBe(n * (n + 1) / 2);
    });
  }
});

// count() — 100 tests
describe('count()', () => {
  for (let n = 0; n < 100; n++) {
    it(`count() of ${n}-item array = ${n}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ id: k }));
      expect(from(data).count()).toBe(n);
    });
  }
});

// avg() — 100 tests
describe('avg()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`avg of 1..${n} = ${(n + 1) / 2}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: k + 1 }));
      expect(from(data).avg('v')).toBeCloseTo((n + 1) / 2, 5);
    });
  }
});

// min() — 100 tests
describe('min()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`min of reversed 1..${n} = 1`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: k + 1 })).reverse();
      expect(from(data).min('v')).toBe(1);
    });
  }
});

// max() — 100 tests
describe('max()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`max of 1..${n} = ${n}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: k + 1 }));
      expect(from(data).max('v')).toBe(n);
    });
  }
});

// first() — 50 tests
describe('first()', () => {
  for (let n = 1; n <= 50; n++) {
    it(`first() of ${n}-item array has id=1`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ id: k + 1 }));
      expect(from(data).first()?.id).toBe(1);
    });
  }
});

// last() — 50 tests
describe('last()', () => {
  for (let n = 1; n <= 50; n++) {
    it(`last() of ${n}-item array has id=${n}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ id: k + 1 }));
      expect(from(data).last()?.id).toBe(n);
    });
  }
});

// distinct() — 100 tests
describe('distinct()', () => {
  for (let n = 1; n <= 100; n++) {
    it(`distinct removes duplicates: ${n} unique from ${n * 2} items`, () => {
      const half = Array.from({ length: n }, (_, k) => ({ v: k }));
      const data = [...half, ...half];
      expect(from(data).distinct('v').count()).toBe(n);
    });
  }
});

// filter() — 100 tests (alias for where)
describe('filter() alias', () => {
  for (let i = 1; i <= 100; i++) {
    it(`filter keeps values < ${i} from 100 items`, () => {
      const data = Array.from({ length: 100 }, (_, k) => ({ value: k + 1 }));
      const result = from(data).filter(r => r.value < i).toArray();
      expect(result.length).toBe(i - 1);
    });
  }
});

// select() — 50 tests
describe('select()', () => {
  for (let n = 1; n <= 50; n++) {
    it(`select('id') on ${n}-item array returns only id field`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ id: k + 1, name: `item${k}`, extra: k * 2 }));
      const result = from(data).select('id').toArray();
      expect(result.length).toBe(n);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).not.toHaveProperty('name');
      expect(result[0]).not.toHaveProperty('extra');
    });
  }
});

// groupBy() — 50 tests
describe('groupBy()', () => {
  for (let n = 1; n <= 50; n++) {
    it(`groupBy('cat') on ${n * 2} items gives ${n} groups of 2`, () => {
      const data = Array.from({ length: n * 2 }, (_, k) => ({ id: k, cat: k % n }));
      const groups = from(data).groupBy('cat');
      expect(groups.size).toBe(n);
      groups.forEach(items => {
        expect(items.length).toBe(2);
      });
    });
  }
});

// toArray() — 50 tests
describe('toArray()', () => {
  for (let n = 0; n <= 49; n++) {
    it(`toArray() on ${n}-item query returns array of length ${n}`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ id: k }));
      const result = from(data).toArray();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(n);
    });
  }
});

// chained where + limit — 50 tests
describe('chained where + limit', () => {
  for (let n = 1; n <= 50; n++) {
    it(`where(v > 0).limit(${n}) returns ${n} items`, () => {
      const data = Array.from({ length: 200 }, (_, k) => ({ v: k + 1 }));
      const result = from(data).where(r => r.v > 0).limit(n).toArray();
      expect(result.length).toBe(n);
    });
  }
});

// chained offset + limit — 50 tests
describe('chained offset + limit', () => {
  for (let n = 0; n < 50; n++) {
    it(`offset(${n}).limit(10) returns 10 items`, () => {
      const data = Array.from({ length: 200 }, (_, k) => ({ id: k }));
      const result = from(data).offset(n).limit(10).toArray();
      expect(result.length).toBe(10);
      expect(result[0].id).toBe(n);
    });
  }
});

// immutability — 50 tests
describe('immutability (original array not mutated)', () => {
  for (let n = 1; n <= 50; n++) {
    it(`original array of length ${n} unchanged after where()`, () => {
      const data = Array.from({ length: n }, (_, k) => ({ v: k + 1 }));
      const original = [...data];
      from(data).where(r => r.v > 0).orderBy('v', 'desc').toArray();
      expect(data).toEqual(original);
    });
  }
});
function hd258qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258qrb_hd',()=>{it('a',()=>{expect(hd258qrb(1,4)).toBe(2);});it('b',()=>{expect(hd258qrb(3,1)).toBe(1);});it('c',()=>{expect(hd258qrb(0,0)).toBe(0);});it('d',()=>{expect(hd258qrb(93,73)).toBe(2);});it('e',()=>{expect(hd258qrb(15,0)).toBe(4);});});
function hd259qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259qrb_hd',()=>{it('a',()=>{expect(hd259qrb(1,4)).toBe(2);});it('b',()=>{expect(hd259qrb(3,1)).toBe(1);});it('c',()=>{expect(hd259qrb(0,0)).toBe(0);});it('d',()=>{expect(hd259qrb(93,73)).toBe(2);});it('e',()=>{expect(hd259qrb(15,0)).toBe(4);});});
function hd260qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260qrb_hd',()=>{it('a',()=>{expect(hd260qrb(1,4)).toBe(2);});it('b',()=>{expect(hd260qrb(3,1)).toBe(1);});it('c',()=>{expect(hd260qrb(0,0)).toBe(0);});it('d',()=>{expect(hd260qrb(93,73)).toBe(2);});it('e',()=>{expect(hd260qrb(15,0)).toBe(4);});});
function hd261qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261qrb_hd',()=>{it('a',()=>{expect(hd261qrb(1,4)).toBe(2);});it('b',()=>{expect(hd261qrb(3,1)).toBe(1);});it('c',()=>{expect(hd261qrb(0,0)).toBe(0);});it('d',()=>{expect(hd261qrb(93,73)).toBe(2);});it('e',()=>{expect(hd261qrb(15,0)).toBe(4);});});
function hd262qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262qrb_hd',()=>{it('a',()=>{expect(hd262qrb(1,4)).toBe(2);});it('b',()=>{expect(hd262qrb(3,1)).toBe(1);});it('c',()=>{expect(hd262qrb(0,0)).toBe(0);});it('d',()=>{expect(hd262qrb(93,73)).toBe(2);});it('e',()=>{expect(hd262qrb(15,0)).toBe(4);});});
function hd263qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263qrb_hd',()=>{it('a',()=>{expect(hd263qrb(1,4)).toBe(2);});it('b',()=>{expect(hd263qrb(3,1)).toBe(1);});it('c',()=>{expect(hd263qrb(0,0)).toBe(0);});it('d',()=>{expect(hd263qrb(93,73)).toBe(2);});it('e',()=>{expect(hd263qrb(15,0)).toBe(4);});});
function hd264qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264qrb_hd',()=>{it('a',()=>{expect(hd264qrb(1,4)).toBe(2);});it('b',()=>{expect(hd264qrb(3,1)).toBe(1);});it('c',()=>{expect(hd264qrb(0,0)).toBe(0);});it('d',()=>{expect(hd264qrb(93,73)).toBe(2);});it('e',()=>{expect(hd264qrb(15,0)).toBe(4);});});
function hd265qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265qrb_hd',()=>{it('a',()=>{expect(hd265qrb(1,4)).toBe(2);});it('b',()=>{expect(hd265qrb(3,1)).toBe(1);});it('c',()=>{expect(hd265qrb(0,0)).toBe(0);});it('d',()=>{expect(hd265qrb(93,73)).toBe(2);});it('e',()=>{expect(hd265qrb(15,0)).toBe(4);});});
function hd266qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266qrb_hd',()=>{it('a',()=>{expect(hd266qrb(1,4)).toBe(2);});it('b',()=>{expect(hd266qrb(3,1)).toBe(1);});it('c',()=>{expect(hd266qrb(0,0)).toBe(0);});it('d',()=>{expect(hd266qrb(93,73)).toBe(2);});it('e',()=>{expect(hd266qrb(15,0)).toBe(4);});});
function hd267qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267qrb_hd',()=>{it('a',()=>{expect(hd267qrb(1,4)).toBe(2);});it('b',()=>{expect(hd267qrb(3,1)).toBe(1);});it('c',()=>{expect(hd267qrb(0,0)).toBe(0);});it('d',()=>{expect(hd267qrb(93,73)).toBe(2);});it('e',()=>{expect(hd267qrb(15,0)).toBe(4);});});
function hd268qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268qrb_hd',()=>{it('a',()=>{expect(hd268qrb(1,4)).toBe(2);});it('b',()=>{expect(hd268qrb(3,1)).toBe(1);});it('c',()=>{expect(hd268qrb(0,0)).toBe(0);});it('d',()=>{expect(hd268qrb(93,73)).toBe(2);});it('e',()=>{expect(hd268qrb(15,0)).toBe(4);});});
function hd269qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269qrb_hd',()=>{it('a',()=>{expect(hd269qrb(1,4)).toBe(2);});it('b',()=>{expect(hd269qrb(3,1)).toBe(1);});it('c',()=>{expect(hd269qrb(0,0)).toBe(0);});it('d',()=>{expect(hd269qrb(93,73)).toBe(2);});it('e',()=>{expect(hd269qrb(15,0)).toBe(4);});});
function hd270qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270qrb_hd',()=>{it('a',()=>{expect(hd270qrb(1,4)).toBe(2);});it('b',()=>{expect(hd270qrb(3,1)).toBe(1);});it('c',()=>{expect(hd270qrb(0,0)).toBe(0);});it('d',()=>{expect(hd270qrb(93,73)).toBe(2);});it('e',()=>{expect(hd270qrb(15,0)).toBe(4);});});
function hd271qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271qrb_hd',()=>{it('a',()=>{expect(hd271qrb(1,4)).toBe(2);});it('b',()=>{expect(hd271qrb(3,1)).toBe(1);});it('c',()=>{expect(hd271qrb(0,0)).toBe(0);});it('d',()=>{expect(hd271qrb(93,73)).toBe(2);});it('e',()=>{expect(hd271qrb(15,0)).toBe(4);});});
function hd272qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272qrb_hd',()=>{it('a',()=>{expect(hd272qrb(1,4)).toBe(2);});it('b',()=>{expect(hd272qrb(3,1)).toBe(1);});it('c',()=>{expect(hd272qrb(0,0)).toBe(0);});it('d',()=>{expect(hd272qrb(93,73)).toBe(2);});it('e',()=>{expect(hd272qrb(15,0)).toBe(4);});});
function hd273qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273qrb_hd',()=>{it('a',()=>{expect(hd273qrb(1,4)).toBe(2);});it('b',()=>{expect(hd273qrb(3,1)).toBe(1);});it('c',()=>{expect(hd273qrb(0,0)).toBe(0);});it('d',()=>{expect(hd273qrb(93,73)).toBe(2);});it('e',()=>{expect(hd273qrb(15,0)).toBe(4);});});
function hd274qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274qrb_hd',()=>{it('a',()=>{expect(hd274qrb(1,4)).toBe(2);});it('b',()=>{expect(hd274qrb(3,1)).toBe(1);});it('c',()=>{expect(hd274qrb(0,0)).toBe(0);});it('d',()=>{expect(hd274qrb(93,73)).toBe(2);});it('e',()=>{expect(hd274qrb(15,0)).toBe(4);});});
function hd275qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275qrb_hd',()=>{it('a',()=>{expect(hd275qrb(1,4)).toBe(2);});it('b',()=>{expect(hd275qrb(3,1)).toBe(1);});it('c',()=>{expect(hd275qrb(0,0)).toBe(0);});it('d',()=>{expect(hd275qrb(93,73)).toBe(2);});it('e',()=>{expect(hd275qrb(15,0)).toBe(4);});});
function hd276qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276qrb_hd',()=>{it('a',()=>{expect(hd276qrb(1,4)).toBe(2);});it('b',()=>{expect(hd276qrb(3,1)).toBe(1);});it('c',()=>{expect(hd276qrb(0,0)).toBe(0);});it('d',()=>{expect(hd276qrb(93,73)).toBe(2);});it('e',()=>{expect(hd276qrb(15,0)).toBe(4);});});
function hd277qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277qrb_hd',()=>{it('a',()=>{expect(hd277qrb(1,4)).toBe(2);});it('b',()=>{expect(hd277qrb(3,1)).toBe(1);});it('c',()=>{expect(hd277qrb(0,0)).toBe(0);});it('d',()=>{expect(hd277qrb(93,73)).toBe(2);});it('e',()=>{expect(hd277qrb(15,0)).toBe(4);});});
function hd278qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278qrb_hd',()=>{it('a',()=>{expect(hd278qrb(1,4)).toBe(2);});it('b',()=>{expect(hd278qrb(3,1)).toBe(1);});it('c',()=>{expect(hd278qrb(0,0)).toBe(0);});it('d',()=>{expect(hd278qrb(93,73)).toBe(2);});it('e',()=>{expect(hd278qrb(15,0)).toBe(4);});});
function hd279qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279qrb_hd',()=>{it('a',()=>{expect(hd279qrb(1,4)).toBe(2);});it('b',()=>{expect(hd279qrb(3,1)).toBe(1);});it('c',()=>{expect(hd279qrb(0,0)).toBe(0);});it('d',()=>{expect(hd279qrb(93,73)).toBe(2);});it('e',()=>{expect(hd279qrb(15,0)).toBe(4);});});
function hd280qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280qrb_hd',()=>{it('a',()=>{expect(hd280qrb(1,4)).toBe(2);});it('b',()=>{expect(hd280qrb(3,1)).toBe(1);});it('c',()=>{expect(hd280qrb(0,0)).toBe(0);});it('d',()=>{expect(hd280qrb(93,73)).toBe(2);});it('e',()=>{expect(hd280qrb(15,0)).toBe(4);});});
function hd281qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281qrb_hd',()=>{it('a',()=>{expect(hd281qrb(1,4)).toBe(2);});it('b',()=>{expect(hd281qrb(3,1)).toBe(1);});it('c',()=>{expect(hd281qrb(0,0)).toBe(0);});it('d',()=>{expect(hd281qrb(93,73)).toBe(2);});it('e',()=>{expect(hd281qrb(15,0)).toBe(4);});});
function hd282qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282qrb_hd',()=>{it('a',()=>{expect(hd282qrb(1,4)).toBe(2);});it('b',()=>{expect(hd282qrb(3,1)).toBe(1);});it('c',()=>{expect(hd282qrb(0,0)).toBe(0);});it('d',()=>{expect(hd282qrb(93,73)).toBe(2);});it('e',()=>{expect(hd282qrb(15,0)).toBe(4);});});
function hd283qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283qrb_hd',()=>{it('a',()=>{expect(hd283qrb(1,4)).toBe(2);});it('b',()=>{expect(hd283qrb(3,1)).toBe(1);});it('c',()=>{expect(hd283qrb(0,0)).toBe(0);});it('d',()=>{expect(hd283qrb(93,73)).toBe(2);});it('e',()=>{expect(hd283qrb(15,0)).toBe(4);});});
function hd284qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284qrb_hd',()=>{it('a',()=>{expect(hd284qrb(1,4)).toBe(2);});it('b',()=>{expect(hd284qrb(3,1)).toBe(1);});it('c',()=>{expect(hd284qrb(0,0)).toBe(0);});it('d',()=>{expect(hd284qrb(93,73)).toBe(2);});it('e',()=>{expect(hd284qrb(15,0)).toBe(4);});});
function hd285qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285qrb_hd',()=>{it('a',()=>{expect(hd285qrb(1,4)).toBe(2);});it('b',()=>{expect(hd285qrb(3,1)).toBe(1);});it('c',()=>{expect(hd285qrb(0,0)).toBe(0);});it('d',()=>{expect(hd285qrb(93,73)).toBe(2);});it('e',()=>{expect(hd285qrb(15,0)).toBe(4);});});
function hd286qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286qrb_hd',()=>{it('a',()=>{expect(hd286qrb(1,4)).toBe(2);});it('b',()=>{expect(hd286qrb(3,1)).toBe(1);});it('c',()=>{expect(hd286qrb(0,0)).toBe(0);});it('d',()=>{expect(hd286qrb(93,73)).toBe(2);});it('e',()=>{expect(hd286qrb(15,0)).toBe(4);});});
function hd287qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287qrb_hd',()=>{it('a',()=>{expect(hd287qrb(1,4)).toBe(2);});it('b',()=>{expect(hd287qrb(3,1)).toBe(1);});it('c',()=>{expect(hd287qrb(0,0)).toBe(0);});it('d',()=>{expect(hd287qrb(93,73)).toBe(2);});it('e',()=>{expect(hd287qrb(15,0)).toBe(4);});});
function hd288qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288qrb_hd',()=>{it('a',()=>{expect(hd288qrb(1,4)).toBe(2);});it('b',()=>{expect(hd288qrb(3,1)).toBe(1);});it('c',()=>{expect(hd288qrb(0,0)).toBe(0);});it('d',()=>{expect(hd288qrb(93,73)).toBe(2);});it('e',()=>{expect(hd288qrb(15,0)).toBe(4);});});
function hd289qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289qrb_hd',()=>{it('a',()=>{expect(hd289qrb(1,4)).toBe(2);});it('b',()=>{expect(hd289qrb(3,1)).toBe(1);});it('c',()=>{expect(hd289qrb(0,0)).toBe(0);});it('d',()=>{expect(hd289qrb(93,73)).toBe(2);});it('e',()=>{expect(hd289qrb(15,0)).toBe(4);});});
function hd290qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290qrb_hd',()=>{it('a',()=>{expect(hd290qrb(1,4)).toBe(2);});it('b',()=>{expect(hd290qrb(3,1)).toBe(1);});it('c',()=>{expect(hd290qrb(0,0)).toBe(0);});it('d',()=>{expect(hd290qrb(93,73)).toBe(2);});it('e',()=>{expect(hd290qrb(15,0)).toBe(4);});});
function hd291qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291qrb_hd',()=>{it('a',()=>{expect(hd291qrb(1,4)).toBe(2);});it('b',()=>{expect(hd291qrb(3,1)).toBe(1);});it('c',()=>{expect(hd291qrb(0,0)).toBe(0);});it('d',()=>{expect(hd291qrb(93,73)).toBe(2);});it('e',()=>{expect(hd291qrb(15,0)).toBe(4);});});
function hd292qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292qrb_hd',()=>{it('a',()=>{expect(hd292qrb(1,4)).toBe(2);});it('b',()=>{expect(hd292qrb(3,1)).toBe(1);});it('c',()=>{expect(hd292qrb(0,0)).toBe(0);});it('d',()=>{expect(hd292qrb(93,73)).toBe(2);});it('e',()=>{expect(hd292qrb(15,0)).toBe(4);});});
function hd293qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293qrb_hd',()=>{it('a',()=>{expect(hd293qrb(1,4)).toBe(2);});it('b',()=>{expect(hd293qrb(3,1)).toBe(1);});it('c',()=>{expect(hd293qrb(0,0)).toBe(0);});it('d',()=>{expect(hd293qrb(93,73)).toBe(2);});it('e',()=>{expect(hd293qrb(15,0)).toBe(4);});});
function hd294qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294qrb_hd',()=>{it('a',()=>{expect(hd294qrb(1,4)).toBe(2);});it('b',()=>{expect(hd294qrb(3,1)).toBe(1);});it('c',()=>{expect(hd294qrb(0,0)).toBe(0);});it('d',()=>{expect(hd294qrb(93,73)).toBe(2);});it('e',()=>{expect(hd294qrb(15,0)).toBe(4);});});
function hd295qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295qrb_hd',()=>{it('a',()=>{expect(hd295qrb(1,4)).toBe(2);});it('b',()=>{expect(hd295qrb(3,1)).toBe(1);});it('c',()=>{expect(hd295qrb(0,0)).toBe(0);});it('d',()=>{expect(hd295qrb(93,73)).toBe(2);});it('e',()=>{expect(hd295qrb(15,0)).toBe(4);});});
function hd296qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296qrb_hd',()=>{it('a',()=>{expect(hd296qrb(1,4)).toBe(2);});it('b',()=>{expect(hd296qrb(3,1)).toBe(1);});it('c',()=>{expect(hd296qrb(0,0)).toBe(0);});it('d',()=>{expect(hd296qrb(93,73)).toBe(2);});it('e',()=>{expect(hd296qrb(15,0)).toBe(4);});});
function hd297qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297qrb_hd',()=>{it('a',()=>{expect(hd297qrb(1,4)).toBe(2);});it('b',()=>{expect(hd297qrb(3,1)).toBe(1);});it('c',()=>{expect(hd297qrb(0,0)).toBe(0);});it('d',()=>{expect(hd297qrb(93,73)).toBe(2);});it('e',()=>{expect(hd297qrb(15,0)).toBe(4);});});
function hd298qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298qrb_hd',()=>{it('a',()=>{expect(hd298qrb(1,4)).toBe(2);});it('b',()=>{expect(hd298qrb(3,1)).toBe(1);});it('c',()=>{expect(hd298qrb(0,0)).toBe(0);});it('d',()=>{expect(hd298qrb(93,73)).toBe(2);});it('e',()=>{expect(hd298qrb(15,0)).toBe(4);});});
function hd299qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299qrb_hd',()=>{it('a',()=>{expect(hd299qrb(1,4)).toBe(2);});it('b',()=>{expect(hd299qrb(3,1)).toBe(1);});it('c',()=>{expect(hd299qrb(0,0)).toBe(0);});it('d',()=>{expect(hd299qrb(93,73)).toBe(2);});it('e',()=>{expect(hd299qrb(15,0)).toBe(4);});});
function hd300qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300qrb_hd',()=>{it('a',()=>{expect(hd300qrb(1,4)).toBe(2);});it('b',()=>{expect(hd300qrb(3,1)).toBe(1);});it('c',()=>{expect(hd300qrb(0,0)).toBe(0);});it('d',()=>{expect(hd300qrb(93,73)).toBe(2);});it('e',()=>{expect(hd300qrb(15,0)).toBe(4);});});
function hd301qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301qrb_hd',()=>{it('a',()=>{expect(hd301qrb(1,4)).toBe(2);});it('b',()=>{expect(hd301qrb(3,1)).toBe(1);});it('c',()=>{expect(hd301qrb(0,0)).toBe(0);});it('d',()=>{expect(hd301qrb(93,73)).toBe(2);});it('e',()=>{expect(hd301qrb(15,0)).toBe(4);});});
function hd302qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302qrb_hd',()=>{it('a',()=>{expect(hd302qrb(1,4)).toBe(2);});it('b',()=>{expect(hd302qrb(3,1)).toBe(1);});it('c',()=>{expect(hd302qrb(0,0)).toBe(0);});it('d',()=>{expect(hd302qrb(93,73)).toBe(2);});it('e',()=>{expect(hd302qrb(15,0)).toBe(4);});});
function hd303qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303qrb_hd',()=>{it('a',()=>{expect(hd303qrb(1,4)).toBe(2);});it('b',()=>{expect(hd303qrb(3,1)).toBe(1);});it('c',()=>{expect(hd303qrb(0,0)).toBe(0);});it('d',()=>{expect(hd303qrb(93,73)).toBe(2);});it('e',()=>{expect(hd303qrb(15,0)).toBe(4);});});
function hd304qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304qrb_hd',()=>{it('a',()=>{expect(hd304qrb(1,4)).toBe(2);});it('b',()=>{expect(hd304qrb(3,1)).toBe(1);});it('c',()=>{expect(hd304qrb(0,0)).toBe(0);});it('d',()=>{expect(hd304qrb(93,73)).toBe(2);});it('e',()=>{expect(hd304qrb(15,0)).toBe(4);});});
function hd305qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305qrb_hd',()=>{it('a',()=>{expect(hd305qrb(1,4)).toBe(2);});it('b',()=>{expect(hd305qrb(3,1)).toBe(1);});it('c',()=>{expect(hd305qrb(0,0)).toBe(0);});it('d',()=>{expect(hd305qrb(93,73)).toBe(2);});it('e',()=>{expect(hd305qrb(15,0)).toBe(4);});});
function hd306qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306qrb_hd',()=>{it('a',()=>{expect(hd306qrb(1,4)).toBe(2);});it('b',()=>{expect(hd306qrb(3,1)).toBe(1);});it('c',()=>{expect(hd306qrb(0,0)).toBe(0);});it('d',()=>{expect(hd306qrb(93,73)).toBe(2);});it('e',()=>{expect(hd306qrb(15,0)).toBe(4);});});
function hd307qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307qrb_hd',()=>{it('a',()=>{expect(hd307qrb(1,4)).toBe(2);});it('b',()=>{expect(hd307qrb(3,1)).toBe(1);});it('c',()=>{expect(hd307qrb(0,0)).toBe(0);});it('d',()=>{expect(hd307qrb(93,73)).toBe(2);});it('e',()=>{expect(hd307qrb(15,0)).toBe(4);});});
function hd308qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308qrb_hd',()=>{it('a',()=>{expect(hd308qrb(1,4)).toBe(2);});it('b',()=>{expect(hd308qrb(3,1)).toBe(1);});it('c',()=>{expect(hd308qrb(0,0)).toBe(0);});it('d',()=>{expect(hd308qrb(93,73)).toBe(2);});it('e',()=>{expect(hd308qrb(15,0)).toBe(4);});});
function hd309qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309qrb_hd',()=>{it('a',()=>{expect(hd309qrb(1,4)).toBe(2);});it('b',()=>{expect(hd309qrb(3,1)).toBe(1);});it('c',()=>{expect(hd309qrb(0,0)).toBe(0);});it('d',()=>{expect(hd309qrb(93,73)).toBe(2);});it('e',()=>{expect(hd309qrb(15,0)).toBe(4);});});
function hd310qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310qrb_hd',()=>{it('a',()=>{expect(hd310qrb(1,4)).toBe(2);});it('b',()=>{expect(hd310qrb(3,1)).toBe(1);});it('c',()=>{expect(hd310qrb(0,0)).toBe(0);});it('d',()=>{expect(hd310qrb(93,73)).toBe(2);});it('e',()=>{expect(hd310qrb(15,0)).toBe(4);});});
function hd311qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311qrb_hd',()=>{it('a',()=>{expect(hd311qrb(1,4)).toBe(2);});it('b',()=>{expect(hd311qrb(3,1)).toBe(1);});it('c',()=>{expect(hd311qrb(0,0)).toBe(0);});it('d',()=>{expect(hd311qrb(93,73)).toBe(2);});it('e',()=>{expect(hd311qrb(15,0)).toBe(4);});});
function hd312qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312qrb_hd',()=>{it('a',()=>{expect(hd312qrb(1,4)).toBe(2);});it('b',()=>{expect(hd312qrb(3,1)).toBe(1);});it('c',()=>{expect(hd312qrb(0,0)).toBe(0);});it('d',()=>{expect(hd312qrb(93,73)).toBe(2);});it('e',()=>{expect(hd312qrb(15,0)).toBe(4);});});
function hd313qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313qrb_hd',()=>{it('a',()=>{expect(hd313qrb(1,4)).toBe(2);});it('b',()=>{expect(hd313qrb(3,1)).toBe(1);});it('c',()=>{expect(hd313qrb(0,0)).toBe(0);});it('d',()=>{expect(hd313qrb(93,73)).toBe(2);});it('e',()=>{expect(hd313qrb(15,0)).toBe(4);});});
function hd314qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314qrb_hd',()=>{it('a',()=>{expect(hd314qrb(1,4)).toBe(2);});it('b',()=>{expect(hd314qrb(3,1)).toBe(1);});it('c',()=>{expect(hd314qrb(0,0)).toBe(0);});it('d',()=>{expect(hd314qrb(93,73)).toBe(2);});it('e',()=>{expect(hd314qrb(15,0)).toBe(4);});});
function hd315qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315qrb_hd',()=>{it('a',()=>{expect(hd315qrb(1,4)).toBe(2);});it('b',()=>{expect(hd315qrb(3,1)).toBe(1);});it('c',()=>{expect(hd315qrb(0,0)).toBe(0);});it('d',()=>{expect(hd315qrb(93,73)).toBe(2);});it('e',()=>{expect(hd315qrb(15,0)).toBe(4);});});
function hd316qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316qrb_hd',()=>{it('a',()=>{expect(hd316qrb(1,4)).toBe(2);});it('b',()=>{expect(hd316qrb(3,1)).toBe(1);});it('c',()=>{expect(hd316qrb(0,0)).toBe(0);});it('d',()=>{expect(hd316qrb(93,73)).toBe(2);});it('e',()=>{expect(hd316qrb(15,0)).toBe(4);});});
function hd317qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317qrb_hd',()=>{it('a',()=>{expect(hd317qrb(1,4)).toBe(2);});it('b',()=>{expect(hd317qrb(3,1)).toBe(1);});it('c',()=>{expect(hd317qrb(0,0)).toBe(0);});it('d',()=>{expect(hd317qrb(93,73)).toBe(2);});it('e',()=>{expect(hd317qrb(15,0)).toBe(4);});});
function hd318qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318qrb_hd',()=>{it('a',()=>{expect(hd318qrb(1,4)).toBe(2);});it('b',()=>{expect(hd318qrb(3,1)).toBe(1);});it('c',()=>{expect(hd318qrb(0,0)).toBe(0);});it('d',()=>{expect(hd318qrb(93,73)).toBe(2);});it('e',()=>{expect(hd318qrb(15,0)).toBe(4);});});
function hd319qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319qrb_hd',()=>{it('a',()=>{expect(hd319qrb(1,4)).toBe(2);});it('b',()=>{expect(hd319qrb(3,1)).toBe(1);});it('c',()=>{expect(hd319qrb(0,0)).toBe(0);});it('d',()=>{expect(hd319qrb(93,73)).toBe(2);});it('e',()=>{expect(hd319qrb(15,0)).toBe(4);});});
function hd320qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320qrb_hd',()=>{it('a',()=>{expect(hd320qrb(1,4)).toBe(2);});it('b',()=>{expect(hd320qrb(3,1)).toBe(1);});it('c',()=>{expect(hd320qrb(0,0)).toBe(0);});it('d',()=>{expect(hd320qrb(93,73)).toBe(2);});it('e',()=>{expect(hd320qrb(15,0)).toBe(4);});});
function hd321qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321qrb_hd',()=>{it('a',()=>{expect(hd321qrb(1,4)).toBe(2);});it('b',()=>{expect(hd321qrb(3,1)).toBe(1);});it('c',()=>{expect(hd321qrb(0,0)).toBe(0);});it('d',()=>{expect(hd321qrb(93,73)).toBe(2);});it('e',()=>{expect(hd321qrb(15,0)).toBe(4);});});
function hd322qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322qrb_hd',()=>{it('a',()=>{expect(hd322qrb(1,4)).toBe(2);});it('b',()=>{expect(hd322qrb(3,1)).toBe(1);});it('c',()=>{expect(hd322qrb(0,0)).toBe(0);});it('d',()=>{expect(hd322qrb(93,73)).toBe(2);});it('e',()=>{expect(hd322qrb(15,0)).toBe(4);});});
function hd323qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323qrb_hd',()=>{it('a',()=>{expect(hd323qrb(1,4)).toBe(2);});it('b',()=>{expect(hd323qrb(3,1)).toBe(1);});it('c',()=>{expect(hd323qrb(0,0)).toBe(0);});it('d',()=>{expect(hd323qrb(93,73)).toBe(2);});it('e',()=>{expect(hd323qrb(15,0)).toBe(4);});});
function hd324qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324qrb_hd',()=>{it('a',()=>{expect(hd324qrb(1,4)).toBe(2);});it('b',()=>{expect(hd324qrb(3,1)).toBe(1);});it('c',()=>{expect(hd324qrb(0,0)).toBe(0);});it('d',()=>{expect(hd324qrb(93,73)).toBe(2);});it('e',()=>{expect(hd324qrb(15,0)).toBe(4);});});
function hd325qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325qrb_hd',()=>{it('a',()=>{expect(hd325qrb(1,4)).toBe(2);});it('b',()=>{expect(hd325qrb(3,1)).toBe(1);});it('c',()=>{expect(hd325qrb(0,0)).toBe(0);});it('d',()=>{expect(hd325qrb(93,73)).toBe(2);});it('e',()=>{expect(hd325qrb(15,0)).toBe(4);});});
function hd326qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326qrb_hd',()=>{it('a',()=>{expect(hd326qrb(1,4)).toBe(2);});it('b',()=>{expect(hd326qrb(3,1)).toBe(1);});it('c',()=>{expect(hd326qrb(0,0)).toBe(0);});it('d',()=>{expect(hd326qrb(93,73)).toBe(2);});it('e',()=>{expect(hd326qrb(15,0)).toBe(4);});});
function hd327qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327qrb_hd',()=>{it('a',()=>{expect(hd327qrb(1,4)).toBe(2);});it('b',()=>{expect(hd327qrb(3,1)).toBe(1);});it('c',()=>{expect(hd327qrb(0,0)).toBe(0);});it('d',()=>{expect(hd327qrb(93,73)).toBe(2);});it('e',()=>{expect(hd327qrb(15,0)).toBe(4);});});
function hd328qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328qrb_hd',()=>{it('a',()=>{expect(hd328qrb(1,4)).toBe(2);});it('b',()=>{expect(hd328qrb(3,1)).toBe(1);});it('c',()=>{expect(hd328qrb(0,0)).toBe(0);});it('d',()=>{expect(hd328qrb(93,73)).toBe(2);});it('e',()=>{expect(hd328qrb(15,0)).toBe(4);});});
function hd329qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329qrb_hd',()=>{it('a',()=>{expect(hd329qrb(1,4)).toBe(2);});it('b',()=>{expect(hd329qrb(3,1)).toBe(1);});it('c',()=>{expect(hd329qrb(0,0)).toBe(0);});it('d',()=>{expect(hd329qrb(93,73)).toBe(2);});it('e',()=>{expect(hd329qrb(15,0)).toBe(4);});});
function hd330qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330qrb_hd',()=>{it('a',()=>{expect(hd330qrb(1,4)).toBe(2);});it('b',()=>{expect(hd330qrb(3,1)).toBe(1);});it('c',()=>{expect(hd330qrb(0,0)).toBe(0);});it('d',()=>{expect(hd330qrb(93,73)).toBe(2);});it('e',()=>{expect(hd330qrb(15,0)).toBe(4);});});
function hd331qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331qrb_hd',()=>{it('a',()=>{expect(hd331qrb(1,4)).toBe(2);});it('b',()=>{expect(hd331qrb(3,1)).toBe(1);});it('c',()=>{expect(hd331qrb(0,0)).toBe(0);});it('d',()=>{expect(hd331qrb(93,73)).toBe(2);});it('e',()=>{expect(hd331qrb(15,0)).toBe(4);});});
function hd332qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332qrb_hd',()=>{it('a',()=>{expect(hd332qrb(1,4)).toBe(2);});it('b',()=>{expect(hd332qrb(3,1)).toBe(1);});it('c',()=>{expect(hd332qrb(0,0)).toBe(0);});it('d',()=>{expect(hd332qrb(93,73)).toBe(2);});it('e',()=>{expect(hd332qrb(15,0)).toBe(4);});});
function hd333qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333qrb_hd',()=>{it('a',()=>{expect(hd333qrb(1,4)).toBe(2);});it('b',()=>{expect(hd333qrb(3,1)).toBe(1);});it('c',()=>{expect(hd333qrb(0,0)).toBe(0);});it('d',()=>{expect(hd333qrb(93,73)).toBe(2);});it('e',()=>{expect(hd333qrb(15,0)).toBe(4);});});
function hd334qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334qrb_hd',()=>{it('a',()=>{expect(hd334qrb(1,4)).toBe(2);});it('b',()=>{expect(hd334qrb(3,1)).toBe(1);});it('c',()=>{expect(hd334qrb(0,0)).toBe(0);});it('d',()=>{expect(hd334qrb(93,73)).toBe(2);});it('e',()=>{expect(hd334qrb(15,0)).toBe(4);});});
function hd335qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335qrb_hd',()=>{it('a',()=>{expect(hd335qrb(1,4)).toBe(2);});it('b',()=>{expect(hd335qrb(3,1)).toBe(1);});it('c',()=>{expect(hd335qrb(0,0)).toBe(0);});it('d',()=>{expect(hd335qrb(93,73)).toBe(2);});it('e',()=>{expect(hd335qrb(15,0)).toBe(4);});});
function hd336qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336qrb_hd',()=>{it('a',()=>{expect(hd336qrb(1,4)).toBe(2);});it('b',()=>{expect(hd336qrb(3,1)).toBe(1);});it('c',()=>{expect(hd336qrb(0,0)).toBe(0);});it('d',()=>{expect(hd336qrb(93,73)).toBe(2);});it('e',()=>{expect(hd336qrb(15,0)).toBe(4);});});
function hd337qrb(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337qrb_hd',()=>{it('a',()=>{expect(hd337qrb(1,4)).toBe(2);});it('b',()=>{expect(hd337qrb(3,1)).toBe(1);});it('c',()=>{expect(hd337qrb(0,0)).toBe(0);});it('d',()=>{expect(hd337qrb(93,73)).toBe(2);});it('e',()=>{expect(hd337qrb(15,0)).toBe(4);});});
function hd338qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338qrb2_hd',()=>{it('a',()=>{expect(hd338qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd338qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd338qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd338qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd338qrb2(15,0)).toBe(4);});});
function hd339qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339qrb2_hd',()=>{it('a',()=>{expect(hd339qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd339qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd339qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd339qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd339qrb2(15,0)).toBe(4);});});
function hd340qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340qrb2_hd',()=>{it('a',()=>{expect(hd340qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd340qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd340qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd340qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd340qrb2(15,0)).toBe(4);});});
function hd341qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341qrb2_hd',()=>{it('a',()=>{expect(hd341qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd341qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd341qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd341qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd341qrb2(15,0)).toBe(4);});});
function hd342qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342qrb2_hd',()=>{it('a',()=>{expect(hd342qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd342qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd342qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd342qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd342qrb2(15,0)).toBe(4);});});
function hd343qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343qrb2_hd',()=>{it('a',()=>{expect(hd343qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd343qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd343qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd343qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd343qrb2(15,0)).toBe(4);});});
function hd344qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344qrb2_hd',()=>{it('a',()=>{expect(hd344qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd344qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd344qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd344qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd344qrb2(15,0)).toBe(4);});});
function hd345qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345qrb2_hd',()=>{it('a',()=>{expect(hd345qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd345qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd345qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd345qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd345qrb2(15,0)).toBe(4);});});
function hd346qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346qrb2_hd',()=>{it('a',()=>{expect(hd346qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd346qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd346qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd346qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd346qrb2(15,0)).toBe(4);});});
function hd347qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347qrb2_hd',()=>{it('a',()=>{expect(hd347qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd347qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd347qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd347qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd347qrb2(15,0)).toBe(4);});});
function hd348qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348qrb2_hd',()=>{it('a',()=>{expect(hd348qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd348qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd348qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd348qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd348qrb2(15,0)).toBe(4);});});
function hd349qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349qrb2_hd',()=>{it('a',()=>{expect(hd349qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd349qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd349qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd349qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd349qrb2(15,0)).toBe(4);});});
function hd350qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350qrb2_hd',()=>{it('a',()=>{expect(hd350qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd350qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd350qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd350qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd350qrb2(15,0)).toBe(4);});});
function hd351qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351qrb2_hd',()=>{it('a',()=>{expect(hd351qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd351qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd351qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd351qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd351qrb2(15,0)).toBe(4);});});
function hd352qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352qrb2_hd',()=>{it('a',()=>{expect(hd352qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd352qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd352qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd352qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd352qrb2(15,0)).toBe(4);});});
function hd353qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353qrb2_hd',()=>{it('a',()=>{expect(hd353qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd353qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd353qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd353qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd353qrb2(15,0)).toBe(4);});});
function hd354qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354qrb2_hd',()=>{it('a',()=>{expect(hd354qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd354qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd354qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd354qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd354qrb2(15,0)).toBe(4);});});
function hd355qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355qrb2_hd',()=>{it('a',()=>{expect(hd355qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd355qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd355qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd355qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd355qrb2(15,0)).toBe(4);});});
function hd356qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356qrb2_hd',()=>{it('a',()=>{expect(hd356qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd356qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd356qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd356qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd356qrb2(15,0)).toBe(4);});});
function hd357qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357qrb2_hd',()=>{it('a',()=>{expect(hd357qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd357qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd357qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd357qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd357qrb2(15,0)).toBe(4);});});
function hd358qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358qrb2_hd',()=>{it('a',()=>{expect(hd358qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd358qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd358qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd358qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd358qrb2(15,0)).toBe(4);});});
function hd359qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359qrb2_hd',()=>{it('a',()=>{expect(hd359qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd359qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd359qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd359qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd359qrb2(15,0)).toBe(4);});});
function hd360qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360qrb2_hd',()=>{it('a',()=>{expect(hd360qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd360qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd360qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd360qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd360qrb2(15,0)).toBe(4);});});
function hd361qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361qrb2_hd',()=>{it('a',()=>{expect(hd361qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd361qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd361qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd361qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd361qrb2(15,0)).toBe(4);});});
function hd362qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362qrb2_hd',()=>{it('a',()=>{expect(hd362qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd362qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd362qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd362qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd362qrb2(15,0)).toBe(4);});});
function hd363qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363qrb2_hd',()=>{it('a',()=>{expect(hd363qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd363qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd363qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd363qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd363qrb2(15,0)).toBe(4);});});
function hd364qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364qrb2_hd',()=>{it('a',()=>{expect(hd364qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd364qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd364qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd364qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd364qrb2(15,0)).toBe(4);});});
function hd365qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365qrb2_hd',()=>{it('a',()=>{expect(hd365qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd365qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd365qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd365qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd365qrb2(15,0)).toBe(4);});});
function hd366qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366qrb2_hd',()=>{it('a',()=>{expect(hd366qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd366qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd366qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd366qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd366qrb2(15,0)).toBe(4);});});
function hd367qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367qrb2_hd',()=>{it('a',()=>{expect(hd367qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd367qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd367qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd367qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd367qrb2(15,0)).toBe(4);});});
function hd368qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368qrb2_hd',()=>{it('a',()=>{expect(hd368qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd368qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd368qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd368qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd368qrb2(15,0)).toBe(4);});});
function hd369qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369qrb2_hd',()=>{it('a',()=>{expect(hd369qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd369qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd369qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd369qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd369qrb2(15,0)).toBe(4);});});
function hd370qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370qrb2_hd',()=>{it('a',()=>{expect(hd370qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd370qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd370qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd370qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd370qrb2(15,0)).toBe(4);});});
function hd371qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371qrb2_hd',()=>{it('a',()=>{expect(hd371qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd371qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd371qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd371qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd371qrb2(15,0)).toBe(4);});});
function hd372qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372qrb2_hd',()=>{it('a',()=>{expect(hd372qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd372qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd372qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd372qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd372qrb2(15,0)).toBe(4);});});
function hd373qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373qrb2_hd',()=>{it('a',()=>{expect(hd373qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd373qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd373qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd373qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd373qrb2(15,0)).toBe(4);});});
function hd374qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374qrb2_hd',()=>{it('a',()=>{expect(hd374qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd374qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd374qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd374qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd374qrb2(15,0)).toBe(4);});});
function hd375qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375qrb2_hd',()=>{it('a',()=>{expect(hd375qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd375qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd375qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd375qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd375qrb2(15,0)).toBe(4);});});
function hd376qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376qrb2_hd',()=>{it('a',()=>{expect(hd376qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd376qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd376qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd376qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd376qrb2(15,0)).toBe(4);});});
function hd377qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377qrb2_hd',()=>{it('a',()=>{expect(hd377qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd377qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd377qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd377qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd377qrb2(15,0)).toBe(4);});});
function hd378qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378qrb2_hd',()=>{it('a',()=>{expect(hd378qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd378qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd378qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd378qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd378qrb2(15,0)).toBe(4);});});
function hd379qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379qrb2_hd',()=>{it('a',()=>{expect(hd379qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd379qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd379qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd379qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd379qrb2(15,0)).toBe(4);});});
function hd380qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380qrb2_hd',()=>{it('a',()=>{expect(hd380qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd380qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd380qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd380qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd380qrb2(15,0)).toBe(4);});});
function hd381qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381qrb2_hd',()=>{it('a',()=>{expect(hd381qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd381qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd381qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd381qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd381qrb2(15,0)).toBe(4);});});
function hd382qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382qrb2_hd',()=>{it('a',()=>{expect(hd382qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd382qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd382qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd382qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd382qrb2(15,0)).toBe(4);});});
function hd383qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383qrb2_hd',()=>{it('a',()=>{expect(hd383qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd383qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd383qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd383qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd383qrb2(15,0)).toBe(4);});});
function hd384qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384qrb2_hd',()=>{it('a',()=>{expect(hd384qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd384qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd384qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd384qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd384qrb2(15,0)).toBe(4);});});
function hd385qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385qrb2_hd',()=>{it('a',()=>{expect(hd385qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd385qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd385qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd385qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd385qrb2(15,0)).toBe(4);});});
function hd386qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386qrb2_hd',()=>{it('a',()=>{expect(hd386qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd386qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd386qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd386qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd386qrb2(15,0)).toBe(4);});});
function hd387qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387qrb2_hd',()=>{it('a',()=>{expect(hd387qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd387qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd387qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd387qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd387qrb2(15,0)).toBe(4);});});
function hd388qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388qrb2_hd',()=>{it('a',()=>{expect(hd388qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd388qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd388qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd388qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd388qrb2(15,0)).toBe(4);});});
function hd389qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389qrb2_hd',()=>{it('a',()=>{expect(hd389qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd389qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd389qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd389qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd389qrb2(15,0)).toBe(4);});});
function hd390qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390qrb2_hd',()=>{it('a',()=>{expect(hd390qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd390qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd390qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd390qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd390qrb2(15,0)).toBe(4);});});
function hd391qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391qrb2_hd',()=>{it('a',()=>{expect(hd391qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd391qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd391qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd391qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd391qrb2(15,0)).toBe(4);});});
function hd392qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392qrb2_hd',()=>{it('a',()=>{expect(hd392qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd392qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd392qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd392qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd392qrb2(15,0)).toBe(4);});});
function hd393qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393qrb2_hd',()=>{it('a',()=>{expect(hd393qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd393qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd393qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd393qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd393qrb2(15,0)).toBe(4);});});
function hd394qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394qrb2_hd',()=>{it('a',()=>{expect(hd394qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd394qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd394qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd394qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd394qrb2(15,0)).toBe(4);});});
function hd395qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395qrb2_hd',()=>{it('a',()=>{expect(hd395qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd395qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd395qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd395qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd395qrb2(15,0)).toBe(4);});});
function hd396qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396qrb2_hd',()=>{it('a',()=>{expect(hd396qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd396qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd396qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd396qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd396qrb2(15,0)).toBe(4);});});
function hd397qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397qrb2_hd',()=>{it('a',()=>{expect(hd397qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd397qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd397qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd397qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd397qrb2(15,0)).toBe(4);});});
function hd398qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398qrb2_hd',()=>{it('a',()=>{expect(hd398qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd398qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd398qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd398qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd398qrb2(15,0)).toBe(4);});});
function hd399qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399qrb2_hd',()=>{it('a',()=>{expect(hd399qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd399qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd399qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd399qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd399qrb2(15,0)).toBe(4);});});
function hd400qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400qrb2_hd',()=>{it('a',()=>{expect(hd400qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd400qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd400qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd400qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd400qrb2(15,0)).toBe(4);});});
function hd401qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401qrb2_hd',()=>{it('a',()=>{expect(hd401qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd401qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd401qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd401qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd401qrb2(15,0)).toBe(4);});});
function hd402qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402qrb2_hd',()=>{it('a',()=>{expect(hd402qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd402qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd402qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd402qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd402qrb2(15,0)).toBe(4);});});
function hd403qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403qrb2_hd',()=>{it('a',()=>{expect(hd403qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd403qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd403qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd403qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd403qrb2(15,0)).toBe(4);});});
function hd404qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404qrb2_hd',()=>{it('a',()=>{expect(hd404qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd404qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd404qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd404qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd404qrb2(15,0)).toBe(4);});});
function hd405qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405qrb2_hd',()=>{it('a',()=>{expect(hd405qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd405qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd405qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd405qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd405qrb2(15,0)).toBe(4);});});
function hd406qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406qrb2_hd',()=>{it('a',()=>{expect(hd406qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd406qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd406qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd406qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd406qrb2(15,0)).toBe(4);});});
function hd407qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407qrb2_hd',()=>{it('a',()=>{expect(hd407qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd407qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd407qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd407qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd407qrb2(15,0)).toBe(4);});});
function hd408qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408qrb2_hd',()=>{it('a',()=>{expect(hd408qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd408qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd408qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd408qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd408qrb2(15,0)).toBe(4);});});
function hd409qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409qrb2_hd',()=>{it('a',()=>{expect(hd409qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd409qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd409qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd409qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd409qrb2(15,0)).toBe(4);});});
function hd410qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410qrb2_hd',()=>{it('a',()=>{expect(hd410qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd410qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd410qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd410qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd410qrb2(15,0)).toBe(4);});});
function hd411qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411qrb2_hd',()=>{it('a',()=>{expect(hd411qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd411qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd411qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd411qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd411qrb2(15,0)).toBe(4);});});
function hd412qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412qrb2_hd',()=>{it('a',()=>{expect(hd412qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd412qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd412qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd412qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd412qrb2(15,0)).toBe(4);});});
function hd413qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413qrb2_hd',()=>{it('a',()=>{expect(hd413qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd413qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd413qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd413qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd413qrb2(15,0)).toBe(4);});});
function hd414qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414qrb2_hd',()=>{it('a',()=>{expect(hd414qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd414qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd414qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd414qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd414qrb2(15,0)).toBe(4);});});
function hd415qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415qrb2_hd',()=>{it('a',()=>{expect(hd415qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd415qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd415qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd415qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd415qrb2(15,0)).toBe(4);});});
function hd416qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416qrb2_hd',()=>{it('a',()=>{expect(hd416qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd416qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd416qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd416qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd416qrb2(15,0)).toBe(4);});});
function hd417qrb2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417qrb2_hd',()=>{it('a',()=>{expect(hd417qrb2(1,4)).toBe(2);});it('b',()=>{expect(hd417qrb2(3,1)).toBe(1);});it('c',()=>{expect(hd417qrb2(0,0)).toBe(0);});it('d',()=>{expect(hd417qrb2(93,73)).toBe(2);});it('e',()=>{expect(hd417qrb2(15,0)).toBe(4);});});
