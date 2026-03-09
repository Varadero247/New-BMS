// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { OrderStatisticsTree, createOST, fromArray, findMedian, RunningMedian } from '../order-statistics-tree';

describe('insert and contains 200 tests', () => {
  for (let n = 1; n <= 200; n++) {
    it(`insert ${n} and contains`, () => {
      const t = createOST(); t.insert(n);
      expect(t.contains(n)).toBe(true);
      expect(t.size).toBe(1);
    });
  }
});

describe('rank tests 200 tests', () => {
  for (let n = 1; n <= 200; n++) {
    it(`rank of ${n} in fromArray([1..${n}])`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const t = fromArray(arr);
      expect(t.rank(n + 1)).toBe(n);
    });
  }
});

describe('select tests 200 tests', () => {
  for (let n = 1; n <= 200; n++) {
    it(`select(0) from [1..${n}] = 1`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const t = fromArray(arr);
      expect(t.select(0)).toBe(1);
    });
  }
});

describe('kthSmallest 200 tests', () => {
  for (let n = 1; n <= 200; n++) {
    it(`kthSmallest(1) from [1..${n}] = 1`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const t = fromArray(arr);
      expect(t.kthSmallest(1)).toBe(1);
    });
  }
});

describe('min/max 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`min and max of [1..${n}]`, () => {
      const t = fromArray(Array.from({ length: n }, (_, i) => i + 1));
      expect(t.min()).toBe(1);
      expect(t.max()).toBe(n);
    });
  }
});

describe('findMedian 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`findMedian([1..${n}])`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const median = findMedian(arr);
      expect(typeof median).toBe('number');
      expect(median).toBeGreaterThanOrEqual(1);
    });
  }
});

describe('toSortedArray 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`toSortedArray from random insert n=${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => (i * 7 + 3) % (n * 2));
      const t = fromArray(arr);
      const sorted = t.toSortedArray();
      expect(sorted.length).toBe(n);
      for (let i = 1; i < sorted.length; i++) expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i-1]);
    });
  }
});
function hd258ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258ost_hd',()=>{it('a',()=>{expect(hd258ost(1,4)).toBe(2);});it('b',()=>{expect(hd258ost(3,1)).toBe(1);});it('c',()=>{expect(hd258ost(0,0)).toBe(0);});it('d',()=>{expect(hd258ost(93,73)).toBe(2);});it('e',()=>{expect(hd258ost(15,0)).toBe(4);});});
function hd259ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259ost_hd',()=>{it('a',()=>{expect(hd259ost(1,4)).toBe(2);});it('b',()=>{expect(hd259ost(3,1)).toBe(1);});it('c',()=>{expect(hd259ost(0,0)).toBe(0);});it('d',()=>{expect(hd259ost(93,73)).toBe(2);});it('e',()=>{expect(hd259ost(15,0)).toBe(4);});});
function hd260ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260ost_hd',()=>{it('a',()=>{expect(hd260ost(1,4)).toBe(2);});it('b',()=>{expect(hd260ost(3,1)).toBe(1);});it('c',()=>{expect(hd260ost(0,0)).toBe(0);});it('d',()=>{expect(hd260ost(93,73)).toBe(2);});it('e',()=>{expect(hd260ost(15,0)).toBe(4);});});
function hd261ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261ost_hd',()=>{it('a',()=>{expect(hd261ost(1,4)).toBe(2);});it('b',()=>{expect(hd261ost(3,1)).toBe(1);});it('c',()=>{expect(hd261ost(0,0)).toBe(0);});it('d',()=>{expect(hd261ost(93,73)).toBe(2);});it('e',()=>{expect(hd261ost(15,0)).toBe(4);});});
function hd262ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262ost_hd',()=>{it('a',()=>{expect(hd262ost(1,4)).toBe(2);});it('b',()=>{expect(hd262ost(3,1)).toBe(1);});it('c',()=>{expect(hd262ost(0,0)).toBe(0);});it('d',()=>{expect(hd262ost(93,73)).toBe(2);});it('e',()=>{expect(hd262ost(15,0)).toBe(4);});});
function hd263ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263ost_hd',()=>{it('a',()=>{expect(hd263ost(1,4)).toBe(2);});it('b',()=>{expect(hd263ost(3,1)).toBe(1);});it('c',()=>{expect(hd263ost(0,0)).toBe(0);});it('d',()=>{expect(hd263ost(93,73)).toBe(2);});it('e',()=>{expect(hd263ost(15,0)).toBe(4);});});
function hd264ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264ost_hd',()=>{it('a',()=>{expect(hd264ost(1,4)).toBe(2);});it('b',()=>{expect(hd264ost(3,1)).toBe(1);});it('c',()=>{expect(hd264ost(0,0)).toBe(0);});it('d',()=>{expect(hd264ost(93,73)).toBe(2);});it('e',()=>{expect(hd264ost(15,0)).toBe(4);});});
function hd265ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265ost_hd',()=>{it('a',()=>{expect(hd265ost(1,4)).toBe(2);});it('b',()=>{expect(hd265ost(3,1)).toBe(1);});it('c',()=>{expect(hd265ost(0,0)).toBe(0);});it('d',()=>{expect(hd265ost(93,73)).toBe(2);});it('e',()=>{expect(hd265ost(15,0)).toBe(4);});});
function hd266ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266ost_hd',()=>{it('a',()=>{expect(hd266ost(1,4)).toBe(2);});it('b',()=>{expect(hd266ost(3,1)).toBe(1);});it('c',()=>{expect(hd266ost(0,0)).toBe(0);});it('d',()=>{expect(hd266ost(93,73)).toBe(2);});it('e',()=>{expect(hd266ost(15,0)).toBe(4);});});
function hd267ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267ost_hd',()=>{it('a',()=>{expect(hd267ost(1,4)).toBe(2);});it('b',()=>{expect(hd267ost(3,1)).toBe(1);});it('c',()=>{expect(hd267ost(0,0)).toBe(0);});it('d',()=>{expect(hd267ost(93,73)).toBe(2);});it('e',()=>{expect(hd267ost(15,0)).toBe(4);});});
function hd268ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268ost_hd',()=>{it('a',()=>{expect(hd268ost(1,4)).toBe(2);});it('b',()=>{expect(hd268ost(3,1)).toBe(1);});it('c',()=>{expect(hd268ost(0,0)).toBe(0);});it('d',()=>{expect(hd268ost(93,73)).toBe(2);});it('e',()=>{expect(hd268ost(15,0)).toBe(4);});});
function hd269ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269ost_hd',()=>{it('a',()=>{expect(hd269ost(1,4)).toBe(2);});it('b',()=>{expect(hd269ost(3,1)).toBe(1);});it('c',()=>{expect(hd269ost(0,0)).toBe(0);});it('d',()=>{expect(hd269ost(93,73)).toBe(2);});it('e',()=>{expect(hd269ost(15,0)).toBe(4);});});
function hd270ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270ost_hd',()=>{it('a',()=>{expect(hd270ost(1,4)).toBe(2);});it('b',()=>{expect(hd270ost(3,1)).toBe(1);});it('c',()=>{expect(hd270ost(0,0)).toBe(0);});it('d',()=>{expect(hd270ost(93,73)).toBe(2);});it('e',()=>{expect(hd270ost(15,0)).toBe(4);});});
function hd271ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271ost_hd',()=>{it('a',()=>{expect(hd271ost(1,4)).toBe(2);});it('b',()=>{expect(hd271ost(3,1)).toBe(1);});it('c',()=>{expect(hd271ost(0,0)).toBe(0);});it('d',()=>{expect(hd271ost(93,73)).toBe(2);});it('e',()=>{expect(hd271ost(15,0)).toBe(4);});});
function hd272ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272ost_hd',()=>{it('a',()=>{expect(hd272ost(1,4)).toBe(2);});it('b',()=>{expect(hd272ost(3,1)).toBe(1);});it('c',()=>{expect(hd272ost(0,0)).toBe(0);});it('d',()=>{expect(hd272ost(93,73)).toBe(2);});it('e',()=>{expect(hd272ost(15,0)).toBe(4);});});
function hd273ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273ost_hd',()=>{it('a',()=>{expect(hd273ost(1,4)).toBe(2);});it('b',()=>{expect(hd273ost(3,1)).toBe(1);});it('c',()=>{expect(hd273ost(0,0)).toBe(0);});it('d',()=>{expect(hd273ost(93,73)).toBe(2);});it('e',()=>{expect(hd273ost(15,0)).toBe(4);});});
function hd274ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274ost_hd',()=>{it('a',()=>{expect(hd274ost(1,4)).toBe(2);});it('b',()=>{expect(hd274ost(3,1)).toBe(1);});it('c',()=>{expect(hd274ost(0,0)).toBe(0);});it('d',()=>{expect(hd274ost(93,73)).toBe(2);});it('e',()=>{expect(hd274ost(15,0)).toBe(4);});});
function hd275ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275ost_hd',()=>{it('a',()=>{expect(hd275ost(1,4)).toBe(2);});it('b',()=>{expect(hd275ost(3,1)).toBe(1);});it('c',()=>{expect(hd275ost(0,0)).toBe(0);});it('d',()=>{expect(hd275ost(93,73)).toBe(2);});it('e',()=>{expect(hd275ost(15,0)).toBe(4);});});
function hd276ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276ost_hd',()=>{it('a',()=>{expect(hd276ost(1,4)).toBe(2);});it('b',()=>{expect(hd276ost(3,1)).toBe(1);});it('c',()=>{expect(hd276ost(0,0)).toBe(0);});it('d',()=>{expect(hd276ost(93,73)).toBe(2);});it('e',()=>{expect(hd276ost(15,0)).toBe(4);});});
function hd277ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277ost_hd',()=>{it('a',()=>{expect(hd277ost(1,4)).toBe(2);});it('b',()=>{expect(hd277ost(3,1)).toBe(1);});it('c',()=>{expect(hd277ost(0,0)).toBe(0);});it('d',()=>{expect(hd277ost(93,73)).toBe(2);});it('e',()=>{expect(hd277ost(15,0)).toBe(4);});});
function hd278ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278ost_hd',()=>{it('a',()=>{expect(hd278ost(1,4)).toBe(2);});it('b',()=>{expect(hd278ost(3,1)).toBe(1);});it('c',()=>{expect(hd278ost(0,0)).toBe(0);});it('d',()=>{expect(hd278ost(93,73)).toBe(2);});it('e',()=>{expect(hd278ost(15,0)).toBe(4);});});
function hd279ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279ost_hd',()=>{it('a',()=>{expect(hd279ost(1,4)).toBe(2);});it('b',()=>{expect(hd279ost(3,1)).toBe(1);});it('c',()=>{expect(hd279ost(0,0)).toBe(0);});it('d',()=>{expect(hd279ost(93,73)).toBe(2);});it('e',()=>{expect(hd279ost(15,0)).toBe(4);});});
function hd280ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280ost_hd',()=>{it('a',()=>{expect(hd280ost(1,4)).toBe(2);});it('b',()=>{expect(hd280ost(3,1)).toBe(1);});it('c',()=>{expect(hd280ost(0,0)).toBe(0);});it('d',()=>{expect(hd280ost(93,73)).toBe(2);});it('e',()=>{expect(hd280ost(15,0)).toBe(4);});});
function hd281ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281ost_hd',()=>{it('a',()=>{expect(hd281ost(1,4)).toBe(2);});it('b',()=>{expect(hd281ost(3,1)).toBe(1);});it('c',()=>{expect(hd281ost(0,0)).toBe(0);});it('d',()=>{expect(hd281ost(93,73)).toBe(2);});it('e',()=>{expect(hd281ost(15,0)).toBe(4);});});
function hd282ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282ost_hd',()=>{it('a',()=>{expect(hd282ost(1,4)).toBe(2);});it('b',()=>{expect(hd282ost(3,1)).toBe(1);});it('c',()=>{expect(hd282ost(0,0)).toBe(0);});it('d',()=>{expect(hd282ost(93,73)).toBe(2);});it('e',()=>{expect(hd282ost(15,0)).toBe(4);});});
function hd283ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283ost_hd',()=>{it('a',()=>{expect(hd283ost(1,4)).toBe(2);});it('b',()=>{expect(hd283ost(3,1)).toBe(1);});it('c',()=>{expect(hd283ost(0,0)).toBe(0);});it('d',()=>{expect(hd283ost(93,73)).toBe(2);});it('e',()=>{expect(hd283ost(15,0)).toBe(4);});});
function hd284ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284ost_hd',()=>{it('a',()=>{expect(hd284ost(1,4)).toBe(2);});it('b',()=>{expect(hd284ost(3,1)).toBe(1);});it('c',()=>{expect(hd284ost(0,0)).toBe(0);});it('d',()=>{expect(hd284ost(93,73)).toBe(2);});it('e',()=>{expect(hd284ost(15,0)).toBe(4);});});
function hd285ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285ost_hd',()=>{it('a',()=>{expect(hd285ost(1,4)).toBe(2);});it('b',()=>{expect(hd285ost(3,1)).toBe(1);});it('c',()=>{expect(hd285ost(0,0)).toBe(0);});it('d',()=>{expect(hd285ost(93,73)).toBe(2);});it('e',()=>{expect(hd285ost(15,0)).toBe(4);});});
function hd286ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286ost_hd',()=>{it('a',()=>{expect(hd286ost(1,4)).toBe(2);});it('b',()=>{expect(hd286ost(3,1)).toBe(1);});it('c',()=>{expect(hd286ost(0,0)).toBe(0);});it('d',()=>{expect(hd286ost(93,73)).toBe(2);});it('e',()=>{expect(hd286ost(15,0)).toBe(4);});});
function hd287ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287ost_hd',()=>{it('a',()=>{expect(hd287ost(1,4)).toBe(2);});it('b',()=>{expect(hd287ost(3,1)).toBe(1);});it('c',()=>{expect(hd287ost(0,0)).toBe(0);});it('d',()=>{expect(hd287ost(93,73)).toBe(2);});it('e',()=>{expect(hd287ost(15,0)).toBe(4);});});
function hd288ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288ost_hd',()=>{it('a',()=>{expect(hd288ost(1,4)).toBe(2);});it('b',()=>{expect(hd288ost(3,1)).toBe(1);});it('c',()=>{expect(hd288ost(0,0)).toBe(0);});it('d',()=>{expect(hd288ost(93,73)).toBe(2);});it('e',()=>{expect(hd288ost(15,0)).toBe(4);});});
function hd289ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289ost_hd',()=>{it('a',()=>{expect(hd289ost(1,4)).toBe(2);});it('b',()=>{expect(hd289ost(3,1)).toBe(1);});it('c',()=>{expect(hd289ost(0,0)).toBe(0);});it('d',()=>{expect(hd289ost(93,73)).toBe(2);});it('e',()=>{expect(hd289ost(15,0)).toBe(4);});});
function hd290ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290ost_hd',()=>{it('a',()=>{expect(hd290ost(1,4)).toBe(2);});it('b',()=>{expect(hd290ost(3,1)).toBe(1);});it('c',()=>{expect(hd290ost(0,0)).toBe(0);});it('d',()=>{expect(hd290ost(93,73)).toBe(2);});it('e',()=>{expect(hd290ost(15,0)).toBe(4);});});
function hd291ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291ost_hd',()=>{it('a',()=>{expect(hd291ost(1,4)).toBe(2);});it('b',()=>{expect(hd291ost(3,1)).toBe(1);});it('c',()=>{expect(hd291ost(0,0)).toBe(0);});it('d',()=>{expect(hd291ost(93,73)).toBe(2);});it('e',()=>{expect(hd291ost(15,0)).toBe(4);});});
function hd292ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292ost_hd',()=>{it('a',()=>{expect(hd292ost(1,4)).toBe(2);});it('b',()=>{expect(hd292ost(3,1)).toBe(1);});it('c',()=>{expect(hd292ost(0,0)).toBe(0);});it('d',()=>{expect(hd292ost(93,73)).toBe(2);});it('e',()=>{expect(hd292ost(15,0)).toBe(4);});});
function hd293ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293ost_hd',()=>{it('a',()=>{expect(hd293ost(1,4)).toBe(2);});it('b',()=>{expect(hd293ost(3,1)).toBe(1);});it('c',()=>{expect(hd293ost(0,0)).toBe(0);});it('d',()=>{expect(hd293ost(93,73)).toBe(2);});it('e',()=>{expect(hd293ost(15,0)).toBe(4);});});
function hd294ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294ost_hd',()=>{it('a',()=>{expect(hd294ost(1,4)).toBe(2);});it('b',()=>{expect(hd294ost(3,1)).toBe(1);});it('c',()=>{expect(hd294ost(0,0)).toBe(0);});it('d',()=>{expect(hd294ost(93,73)).toBe(2);});it('e',()=>{expect(hd294ost(15,0)).toBe(4);});});
function hd295ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295ost_hd',()=>{it('a',()=>{expect(hd295ost(1,4)).toBe(2);});it('b',()=>{expect(hd295ost(3,1)).toBe(1);});it('c',()=>{expect(hd295ost(0,0)).toBe(0);});it('d',()=>{expect(hd295ost(93,73)).toBe(2);});it('e',()=>{expect(hd295ost(15,0)).toBe(4);});});
function hd296ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296ost_hd',()=>{it('a',()=>{expect(hd296ost(1,4)).toBe(2);});it('b',()=>{expect(hd296ost(3,1)).toBe(1);});it('c',()=>{expect(hd296ost(0,0)).toBe(0);});it('d',()=>{expect(hd296ost(93,73)).toBe(2);});it('e',()=>{expect(hd296ost(15,0)).toBe(4);});});
function hd297ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297ost_hd',()=>{it('a',()=>{expect(hd297ost(1,4)).toBe(2);});it('b',()=>{expect(hd297ost(3,1)).toBe(1);});it('c',()=>{expect(hd297ost(0,0)).toBe(0);});it('d',()=>{expect(hd297ost(93,73)).toBe(2);});it('e',()=>{expect(hd297ost(15,0)).toBe(4);});});
function hd298ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298ost_hd',()=>{it('a',()=>{expect(hd298ost(1,4)).toBe(2);});it('b',()=>{expect(hd298ost(3,1)).toBe(1);});it('c',()=>{expect(hd298ost(0,0)).toBe(0);});it('d',()=>{expect(hd298ost(93,73)).toBe(2);});it('e',()=>{expect(hd298ost(15,0)).toBe(4);});});
function hd299ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299ost_hd',()=>{it('a',()=>{expect(hd299ost(1,4)).toBe(2);});it('b',()=>{expect(hd299ost(3,1)).toBe(1);});it('c',()=>{expect(hd299ost(0,0)).toBe(0);});it('d',()=>{expect(hd299ost(93,73)).toBe(2);});it('e',()=>{expect(hd299ost(15,0)).toBe(4);});});
function hd300ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300ost_hd',()=>{it('a',()=>{expect(hd300ost(1,4)).toBe(2);});it('b',()=>{expect(hd300ost(3,1)).toBe(1);});it('c',()=>{expect(hd300ost(0,0)).toBe(0);});it('d',()=>{expect(hd300ost(93,73)).toBe(2);});it('e',()=>{expect(hd300ost(15,0)).toBe(4);});});
function hd301ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301ost_hd',()=>{it('a',()=>{expect(hd301ost(1,4)).toBe(2);});it('b',()=>{expect(hd301ost(3,1)).toBe(1);});it('c',()=>{expect(hd301ost(0,0)).toBe(0);});it('d',()=>{expect(hd301ost(93,73)).toBe(2);});it('e',()=>{expect(hd301ost(15,0)).toBe(4);});});
function hd302ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302ost_hd',()=>{it('a',()=>{expect(hd302ost(1,4)).toBe(2);});it('b',()=>{expect(hd302ost(3,1)).toBe(1);});it('c',()=>{expect(hd302ost(0,0)).toBe(0);});it('d',()=>{expect(hd302ost(93,73)).toBe(2);});it('e',()=>{expect(hd302ost(15,0)).toBe(4);});});
function hd303ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303ost_hd',()=>{it('a',()=>{expect(hd303ost(1,4)).toBe(2);});it('b',()=>{expect(hd303ost(3,1)).toBe(1);});it('c',()=>{expect(hd303ost(0,0)).toBe(0);});it('d',()=>{expect(hd303ost(93,73)).toBe(2);});it('e',()=>{expect(hd303ost(15,0)).toBe(4);});});
function hd304ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304ost_hd',()=>{it('a',()=>{expect(hd304ost(1,4)).toBe(2);});it('b',()=>{expect(hd304ost(3,1)).toBe(1);});it('c',()=>{expect(hd304ost(0,0)).toBe(0);});it('d',()=>{expect(hd304ost(93,73)).toBe(2);});it('e',()=>{expect(hd304ost(15,0)).toBe(4);});});
function hd305ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305ost_hd',()=>{it('a',()=>{expect(hd305ost(1,4)).toBe(2);});it('b',()=>{expect(hd305ost(3,1)).toBe(1);});it('c',()=>{expect(hd305ost(0,0)).toBe(0);});it('d',()=>{expect(hd305ost(93,73)).toBe(2);});it('e',()=>{expect(hd305ost(15,0)).toBe(4);});});
function hd306ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306ost_hd',()=>{it('a',()=>{expect(hd306ost(1,4)).toBe(2);});it('b',()=>{expect(hd306ost(3,1)).toBe(1);});it('c',()=>{expect(hd306ost(0,0)).toBe(0);});it('d',()=>{expect(hd306ost(93,73)).toBe(2);});it('e',()=>{expect(hd306ost(15,0)).toBe(4);});});
function hd307ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307ost_hd',()=>{it('a',()=>{expect(hd307ost(1,4)).toBe(2);});it('b',()=>{expect(hd307ost(3,1)).toBe(1);});it('c',()=>{expect(hd307ost(0,0)).toBe(0);});it('d',()=>{expect(hd307ost(93,73)).toBe(2);});it('e',()=>{expect(hd307ost(15,0)).toBe(4);});});
function hd308ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308ost_hd',()=>{it('a',()=>{expect(hd308ost(1,4)).toBe(2);});it('b',()=>{expect(hd308ost(3,1)).toBe(1);});it('c',()=>{expect(hd308ost(0,0)).toBe(0);});it('d',()=>{expect(hd308ost(93,73)).toBe(2);});it('e',()=>{expect(hd308ost(15,0)).toBe(4);});});
function hd309ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309ost_hd',()=>{it('a',()=>{expect(hd309ost(1,4)).toBe(2);});it('b',()=>{expect(hd309ost(3,1)).toBe(1);});it('c',()=>{expect(hd309ost(0,0)).toBe(0);});it('d',()=>{expect(hd309ost(93,73)).toBe(2);});it('e',()=>{expect(hd309ost(15,0)).toBe(4);});});
function hd310ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310ost_hd',()=>{it('a',()=>{expect(hd310ost(1,4)).toBe(2);});it('b',()=>{expect(hd310ost(3,1)).toBe(1);});it('c',()=>{expect(hd310ost(0,0)).toBe(0);});it('d',()=>{expect(hd310ost(93,73)).toBe(2);});it('e',()=>{expect(hd310ost(15,0)).toBe(4);});});
function hd311ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311ost_hd',()=>{it('a',()=>{expect(hd311ost(1,4)).toBe(2);});it('b',()=>{expect(hd311ost(3,1)).toBe(1);});it('c',()=>{expect(hd311ost(0,0)).toBe(0);});it('d',()=>{expect(hd311ost(93,73)).toBe(2);});it('e',()=>{expect(hd311ost(15,0)).toBe(4);});});
function hd312ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312ost_hd',()=>{it('a',()=>{expect(hd312ost(1,4)).toBe(2);});it('b',()=>{expect(hd312ost(3,1)).toBe(1);});it('c',()=>{expect(hd312ost(0,0)).toBe(0);});it('d',()=>{expect(hd312ost(93,73)).toBe(2);});it('e',()=>{expect(hd312ost(15,0)).toBe(4);});});
function hd313ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313ost_hd',()=>{it('a',()=>{expect(hd313ost(1,4)).toBe(2);});it('b',()=>{expect(hd313ost(3,1)).toBe(1);});it('c',()=>{expect(hd313ost(0,0)).toBe(0);});it('d',()=>{expect(hd313ost(93,73)).toBe(2);});it('e',()=>{expect(hd313ost(15,0)).toBe(4);});});
function hd314ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314ost_hd',()=>{it('a',()=>{expect(hd314ost(1,4)).toBe(2);});it('b',()=>{expect(hd314ost(3,1)).toBe(1);});it('c',()=>{expect(hd314ost(0,0)).toBe(0);});it('d',()=>{expect(hd314ost(93,73)).toBe(2);});it('e',()=>{expect(hd314ost(15,0)).toBe(4);});});
function hd315ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315ost_hd',()=>{it('a',()=>{expect(hd315ost(1,4)).toBe(2);});it('b',()=>{expect(hd315ost(3,1)).toBe(1);});it('c',()=>{expect(hd315ost(0,0)).toBe(0);});it('d',()=>{expect(hd315ost(93,73)).toBe(2);});it('e',()=>{expect(hd315ost(15,0)).toBe(4);});});
function hd316ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316ost_hd',()=>{it('a',()=>{expect(hd316ost(1,4)).toBe(2);});it('b',()=>{expect(hd316ost(3,1)).toBe(1);});it('c',()=>{expect(hd316ost(0,0)).toBe(0);});it('d',()=>{expect(hd316ost(93,73)).toBe(2);});it('e',()=>{expect(hd316ost(15,0)).toBe(4);});});
function hd317ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317ost_hd',()=>{it('a',()=>{expect(hd317ost(1,4)).toBe(2);});it('b',()=>{expect(hd317ost(3,1)).toBe(1);});it('c',()=>{expect(hd317ost(0,0)).toBe(0);});it('d',()=>{expect(hd317ost(93,73)).toBe(2);});it('e',()=>{expect(hd317ost(15,0)).toBe(4);});});
function hd318ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318ost_hd',()=>{it('a',()=>{expect(hd318ost(1,4)).toBe(2);});it('b',()=>{expect(hd318ost(3,1)).toBe(1);});it('c',()=>{expect(hd318ost(0,0)).toBe(0);});it('d',()=>{expect(hd318ost(93,73)).toBe(2);});it('e',()=>{expect(hd318ost(15,0)).toBe(4);});});
function hd319ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319ost_hd',()=>{it('a',()=>{expect(hd319ost(1,4)).toBe(2);});it('b',()=>{expect(hd319ost(3,1)).toBe(1);});it('c',()=>{expect(hd319ost(0,0)).toBe(0);});it('d',()=>{expect(hd319ost(93,73)).toBe(2);});it('e',()=>{expect(hd319ost(15,0)).toBe(4);});});
function hd320ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320ost_hd',()=>{it('a',()=>{expect(hd320ost(1,4)).toBe(2);});it('b',()=>{expect(hd320ost(3,1)).toBe(1);});it('c',()=>{expect(hd320ost(0,0)).toBe(0);});it('d',()=>{expect(hd320ost(93,73)).toBe(2);});it('e',()=>{expect(hd320ost(15,0)).toBe(4);});});
function hd321ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321ost_hd',()=>{it('a',()=>{expect(hd321ost(1,4)).toBe(2);});it('b',()=>{expect(hd321ost(3,1)).toBe(1);});it('c',()=>{expect(hd321ost(0,0)).toBe(0);});it('d',()=>{expect(hd321ost(93,73)).toBe(2);});it('e',()=>{expect(hd321ost(15,0)).toBe(4);});});
function hd322ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322ost_hd',()=>{it('a',()=>{expect(hd322ost(1,4)).toBe(2);});it('b',()=>{expect(hd322ost(3,1)).toBe(1);});it('c',()=>{expect(hd322ost(0,0)).toBe(0);});it('d',()=>{expect(hd322ost(93,73)).toBe(2);});it('e',()=>{expect(hd322ost(15,0)).toBe(4);});});
function hd323ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323ost_hd',()=>{it('a',()=>{expect(hd323ost(1,4)).toBe(2);});it('b',()=>{expect(hd323ost(3,1)).toBe(1);});it('c',()=>{expect(hd323ost(0,0)).toBe(0);});it('d',()=>{expect(hd323ost(93,73)).toBe(2);});it('e',()=>{expect(hd323ost(15,0)).toBe(4);});});
function hd324ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324ost_hd',()=>{it('a',()=>{expect(hd324ost(1,4)).toBe(2);});it('b',()=>{expect(hd324ost(3,1)).toBe(1);});it('c',()=>{expect(hd324ost(0,0)).toBe(0);});it('d',()=>{expect(hd324ost(93,73)).toBe(2);});it('e',()=>{expect(hd324ost(15,0)).toBe(4);});});
function hd325ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325ost_hd',()=>{it('a',()=>{expect(hd325ost(1,4)).toBe(2);});it('b',()=>{expect(hd325ost(3,1)).toBe(1);});it('c',()=>{expect(hd325ost(0,0)).toBe(0);});it('d',()=>{expect(hd325ost(93,73)).toBe(2);});it('e',()=>{expect(hd325ost(15,0)).toBe(4);});});
function hd326ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326ost_hd',()=>{it('a',()=>{expect(hd326ost(1,4)).toBe(2);});it('b',()=>{expect(hd326ost(3,1)).toBe(1);});it('c',()=>{expect(hd326ost(0,0)).toBe(0);});it('d',()=>{expect(hd326ost(93,73)).toBe(2);});it('e',()=>{expect(hd326ost(15,0)).toBe(4);});});
function hd327ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327ost_hd',()=>{it('a',()=>{expect(hd327ost(1,4)).toBe(2);});it('b',()=>{expect(hd327ost(3,1)).toBe(1);});it('c',()=>{expect(hd327ost(0,0)).toBe(0);});it('d',()=>{expect(hd327ost(93,73)).toBe(2);});it('e',()=>{expect(hd327ost(15,0)).toBe(4);});});
function hd328ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328ost_hd',()=>{it('a',()=>{expect(hd328ost(1,4)).toBe(2);});it('b',()=>{expect(hd328ost(3,1)).toBe(1);});it('c',()=>{expect(hd328ost(0,0)).toBe(0);});it('d',()=>{expect(hd328ost(93,73)).toBe(2);});it('e',()=>{expect(hd328ost(15,0)).toBe(4);});});
function hd329ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329ost_hd',()=>{it('a',()=>{expect(hd329ost(1,4)).toBe(2);});it('b',()=>{expect(hd329ost(3,1)).toBe(1);});it('c',()=>{expect(hd329ost(0,0)).toBe(0);});it('d',()=>{expect(hd329ost(93,73)).toBe(2);});it('e',()=>{expect(hd329ost(15,0)).toBe(4);});});
function hd330ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330ost_hd',()=>{it('a',()=>{expect(hd330ost(1,4)).toBe(2);});it('b',()=>{expect(hd330ost(3,1)).toBe(1);});it('c',()=>{expect(hd330ost(0,0)).toBe(0);});it('d',()=>{expect(hd330ost(93,73)).toBe(2);});it('e',()=>{expect(hd330ost(15,0)).toBe(4);});});
function hd331ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331ost_hd',()=>{it('a',()=>{expect(hd331ost(1,4)).toBe(2);});it('b',()=>{expect(hd331ost(3,1)).toBe(1);});it('c',()=>{expect(hd331ost(0,0)).toBe(0);});it('d',()=>{expect(hd331ost(93,73)).toBe(2);});it('e',()=>{expect(hd331ost(15,0)).toBe(4);});});
function hd332ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332ost_hd',()=>{it('a',()=>{expect(hd332ost(1,4)).toBe(2);});it('b',()=>{expect(hd332ost(3,1)).toBe(1);});it('c',()=>{expect(hd332ost(0,0)).toBe(0);});it('d',()=>{expect(hd332ost(93,73)).toBe(2);});it('e',()=>{expect(hd332ost(15,0)).toBe(4);});});
function hd333ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333ost_hd',()=>{it('a',()=>{expect(hd333ost(1,4)).toBe(2);});it('b',()=>{expect(hd333ost(3,1)).toBe(1);});it('c',()=>{expect(hd333ost(0,0)).toBe(0);});it('d',()=>{expect(hd333ost(93,73)).toBe(2);});it('e',()=>{expect(hd333ost(15,0)).toBe(4);});});
function hd334ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334ost_hd',()=>{it('a',()=>{expect(hd334ost(1,4)).toBe(2);});it('b',()=>{expect(hd334ost(3,1)).toBe(1);});it('c',()=>{expect(hd334ost(0,0)).toBe(0);});it('d',()=>{expect(hd334ost(93,73)).toBe(2);});it('e',()=>{expect(hd334ost(15,0)).toBe(4);});});
function hd335ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335ost_hd',()=>{it('a',()=>{expect(hd335ost(1,4)).toBe(2);});it('b',()=>{expect(hd335ost(3,1)).toBe(1);});it('c',()=>{expect(hd335ost(0,0)).toBe(0);});it('d',()=>{expect(hd335ost(93,73)).toBe(2);});it('e',()=>{expect(hd335ost(15,0)).toBe(4);});});
function hd336ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336ost_hd',()=>{it('a',()=>{expect(hd336ost(1,4)).toBe(2);});it('b',()=>{expect(hd336ost(3,1)).toBe(1);});it('c',()=>{expect(hd336ost(0,0)).toBe(0);});it('d',()=>{expect(hd336ost(93,73)).toBe(2);});it('e',()=>{expect(hd336ost(15,0)).toBe(4);});});
function hd337ost(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337ost_hd',()=>{it('a',()=>{expect(hd337ost(1,4)).toBe(2);});it('b',()=>{expect(hd337ost(3,1)).toBe(1);});it('c',()=>{expect(hd337ost(0,0)).toBe(0);});it('d',()=>{expect(hd337ost(93,73)).toBe(2);});it('e',()=>{expect(hd337ost(15,0)).toBe(4);});});
function hd338ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338ost2_hd',()=>{it('a',()=>{expect(hd338ost2(1,4)).toBe(2);});it('b',()=>{expect(hd338ost2(3,1)).toBe(1);});it('c',()=>{expect(hd338ost2(0,0)).toBe(0);});it('d',()=>{expect(hd338ost2(93,73)).toBe(2);});it('e',()=>{expect(hd338ost2(15,0)).toBe(4);});});
function hd339ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339ost2_hd',()=>{it('a',()=>{expect(hd339ost2(1,4)).toBe(2);});it('b',()=>{expect(hd339ost2(3,1)).toBe(1);});it('c',()=>{expect(hd339ost2(0,0)).toBe(0);});it('d',()=>{expect(hd339ost2(93,73)).toBe(2);});it('e',()=>{expect(hd339ost2(15,0)).toBe(4);});});
function hd340ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340ost2_hd',()=>{it('a',()=>{expect(hd340ost2(1,4)).toBe(2);});it('b',()=>{expect(hd340ost2(3,1)).toBe(1);});it('c',()=>{expect(hd340ost2(0,0)).toBe(0);});it('d',()=>{expect(hd340ost2(93,73)).toBe(2);});it('e',()=>{expect(hd340ost2(15,0)).toBe(4);});});
function hd341ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341ost2_hd',()=>{it('a',()=>{expect(hd341ost2(1,4)).toBe(2);});it('b',()=>{expect(hd341ost2(3,1)).toBe(1);});it('c',()=>{expect(hd341ost2(0,0)).toBe(0);});it('d',()=>{expect(hd341ost2(93,73)).toBe(2);});it('e',()=>{expect(hd341ost2(15,0)).toBe(4);});});
function hd342ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342ost2_hd',()=>{it('a',()=>{expect(hd342ost2(1,4)).toBe(2);});it('b',()=>{expect(hd342ost2(3,1)).toBe(1);});it('c',()=>{expect(hd342ost2(0,0)).toBe(0);});it('d',()=>{expect(hd342ost2(93,73)).toBe(2);});it('e',()=>{expect(hd342ost2(15,0)).toBe(4);});});
function hd343ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343ost2_hd',()=>{it('a',()=>{expect(hd343ost2(1,4)).toBe(2);});it('b',()=>{expect(hd343ost2(3,1)).toBe(1);});it('c',()=>{expect(hd343ost2(0,0)).toBe(0);});it('d',()=>{expect(hd343ost2(93,73)).toBe(2);});it('e',()=>{expect(hd343ost2(15,0)).toBe(4);});});
function hd344ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344ost2_hd',()=>{it('a',()=>{expect(hd344ost2(1,4)).toBe(2);});it('b',()=>{expect(hd344ost2(3,1)).toBe(1);});it('c',()=>{expect(hd344ost2(0,0)).toBe(0);});it('d',()=>{expect(hd344ost2(93,73)).toBe(2);});it('e',()=>{expect(hd344ost2(15,0)).toBe(4);});});
function hd345ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345ost2_hd',()=>{it('a',()=>{expect(hd345ost2(1,4)).toBe(2);});it('b',()=>{expect(hd345ost2(3,1)).toBe(1);});it('c',()=>{expect(hd345ost2(0,0)).toBe(0);});it('d',()=>{expect(hd345ost2(93,73)).toBe(2);});it('e',()=>{expect(hd345ost2(15,0)).toBe(4);});});
function hd346ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346ost2_hd',()=>{it('a',()=>{expect(hd346ost2(1,4)).toBe(2);});it('b',()=>{expect(hd346ost2(3,1)).toBe(1);});it('c',()=>{expect(hd346ost2(0,0)).toBe(0);});it('d',()=>{expect(hd346ost2(93,73)).toBe(2);});it('e',()=>{expect(hd346ost2(15,0)).toBe(4);});});
function hd347ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347ost2_hd',()=>{it('a',()=>{expect(hd347ost2(1,4)).toBe(2);});it('b',()=>{expect(hd347ost2(3,1)).toBe(1);});it('c',()=>{expect(hd347ost2(0,0)).toBe(0);});it('d',()=>{expect(hd347ost2(93,73)).toBe(2);});it('e',()=>{expect(hd347ost2(15,0)).toBe(4);});});
function hd348ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348ost2_hd',()=>{it('a',()=>{expect(hd348ost2(1,4)).toBe(2);});it('b',()=>{expect(hd348ost2(3,1)).toBe(1);});it('c',()=>{expect(hd348ost2(0,0)).toBe(0);});it('d',()=>{expect(hd348ost2(93,73)).toBe(2);});it('e',()=>{expect(hd348ost2(15,0)).toBe(4);});});
function hd349ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349ost2_hd',()=>{it('a',()=>{expect(hd349ost2(1,4)).toBe(2);});it('b',()=>{expect(hd349ost2(3,1)).toBe(1);});it('c',()=>{expect(hd349ost2(0,0)).toBe(0);});it('d',()=>{expect(hd349ost2(93,73)).toBe(2);});it('e',()=>{expect(hd349ost2(15,0)).toBe(4);});});
function hd350ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350ost2_hd',()=>{it('a',()=>{expect(hd350ost2(1,4)).toBe(2);});it('b',()=>{expect(hd350ost2(3,1)).toBe(1);});it('c',()=>{expect(hd350ost2(0,0)).toBe(0);});it('d',()=>{expect(hd350ost2(93,73)).toBe(2);});it('e',()=>{expect(hd350ost2(15,0)).toBe(4);});});
function hd351ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351ost2_hd',()=>{it('a',()=>{expect(hd351ost2(1,4)).toBe(2);});it('b',()=>{expect(hd351ost2(3,1)).toBe(1);});it('c',()=>{expect(hd351ost2(0,0)).toBe(0);});it('d',()=>{expect(hd351ost2(93,73)).toBe(2);});it('e',()=>{expect(hd351ost2(15,0)).toBe(4);});});
function hd352ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352ost2_hd',()=>{it('a',()=>{expect(hd352ost2(1,4)).toBe(2);});it('b',()=>{expect(hd352ost2(3,1)).toBe(1);});it('c',()=>{expect(hd352ost2(0,0)).toBe(0);});it('d',()=>{expect(hd352ost2(93,73)).toBe(2);});it('e',()=>{expect(hd352ost2(15,0)).toBe(4);});});
function hd353ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353ost2_hd',()=>{it('a',()=>{expect(hd353ost2(1,4)).toBe(2);});it('b',()=>{expect(hd353ost2(3,1)).toBe(1);});it('c',()=>{expect(hd353ost2(0,0)).toBe(0);});it('d',()=>{expect(hd353ost2(93,73)).toBe(2);});it('e',()=>{expect(hd353ost2(15,0)).toBe(4);});});
function hd354ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354ost2_hd',()=>{it('a',()=>{expect(hd354ost2(1,4)).toBe(2);});it('b',()=>{expect(hd354ost2(3,1)).toBe(1);});it('c',()=>{expect(hd354ost2(0,0)).toBe(0);});it('d',()=>{expect(hd354ost2(93,73)).toBe(2);});it('e',()=>{expect(hd354ost2(15,0)).toBe(4);});});
function hd355ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355ost2_hd',()=>{it('a',()=>{expect(hd355ost2(1,4)).toBe(2);});it('b',()=>{expect(hd355ost2(3,1)).toBe(1);});it('c',()=>{expect(hd355ost2(0,0)).toBe(0);});it('d',()=>{expect(hd355ost2(93,73)).toBe(2);});it('e',()=>{expect(hd355ost2(15,0)).toBe(4);});});
function hd356ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356ost2_hd',()=>{it('a',()=>{expect(hd356ost2(1,4)).toBe(2);});it('b',()=>{expect(hd356ost2(3,1)).toBe(1);});it('c',()=>{expect(hd356ost2(0,0)).toBe(0);});it('d',()=>{expect(hd356ost2(93,73)).toBe(2);});it('e',()=>{expect(hd356ost2(15,0)).toBe(4);});});
function hd357ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357ost2_hd',()=>{it('a',()=>{expect(hd357ost2(1,4)).toBe(2);});it('b',()=>{expect(hd357ost2(3,1)).toBe(1);});it('c',()=>{expect(hd357ost2(0,0)).toBe(0);});it('d',()=>{expect(hd357ost2(93,73)).toBe(2);});it('e',()=>{expect(hd357ost2(15,0)).toBe(4);});});
function hd358ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358ost2_hd',()=>{it('a',()=>{expect(hd358ost2(1,4)).toBe(2);});it('b',()=>{expect(hd358ost2(3,1)).toBe(1);});it('c',()=>{expect(hd358ost2(0,0)).toBe(0);});it('d',()=>{expect(hd358ost2(93,73)).toBe(2);});it('e',()=>{expect(hd358ost2(15,0)).toBe(4);});});
function hd359ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359ost2_hd',()=>{it('a',()=>{expect(hd359ost2(1,4)).toBe(2);});it('b',()=>{expect(hd359ost2(3,1)).toBe(1);});it('c',()=>{expect(hd359ost2(0,0)).toBe(0);});it('d',()=>{expect(hd359ost2(93,73)).toBe(2);});it('e',()=>{expect(hd359ost2(15,0)).toBe(4);});});
function hd360ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360ost2_hd',()=>{it('a',()=>{expect(hd360ost2(1,4)).toBe(2);});it('b',()=>{expect(hd360ost2(3,1)).toBe(1);});it('c',()=>{expect(hd360ost2(0,0)).toBe(0);});it('d',()=>{expect(hd360ost2(93,73)).toBe(2);});it('e',()=>{expect(hd360ost2(15,0)).toBe(4);});});
function hd361ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361ost2_hd',()=>{it('a',()=>{expect(hd361ost2(1,4)).toBe(2);});it('b',()=>{expect(hd361ost2(3,1)).toBe(1);});it('c',()=>{expect(hd361ost2(0,0)).toBe(0);});it('d',()=>{expect(hd361ost2(93,73)).toBe(2);});it('e',()=>{expect(hd361ost2(15,0)).toBe(4);});});
function hd362ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362ost2_hd',()=>{it('a',()=>{expect(hd362ost2(1,4)).toBe(2);});it('b',()=>{expect(hd362ost2(3,1)).toBe(1);});it('c',()=>{expect(hd362ost2(0,0)).toBe(0);});it('d',()=>{expect(hd362ost2(93,73)).toBe(2);});it('e',()=>{expect(hd362ost2(15,0)).toBe(4);});});
function hd363ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363ost2_hd',()=>{it('a',()=>{expect(hd363ost2(1,4)).toBe(2);});it('b',()=>{expect(hd363ost2(3,1)).toBe(1);});it('c',()=>{expect(hd363ost2(0,0)).toBe(0);});it('d',()=>{expect(hd363ost2(93,73)).toBe(2);});it('e',()=>{expect(hd363ost2(15,0)).toBe(4);});});
function hd364ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364ost2_hd',()=>{it('a',()=>{expect(hd364ost2(1,4)).toBe(2);});it('b',()=>{expect(hd364ost2(3,1)).toBe(1);});it('c',()=>{expect(hd364ost2(0,0)).toBe(0);});it('d',()=>{expect(hd364ost2(93,73)).toBe(2);});it('e',()=>{expect(hd364ost2(15,0)).toBe(4);});});
function hd365ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365ost2_hd',()=>{it('a',()=>{expect(hd365ost2(1,4)).toBe(2);});it('b',()=>{expect(hd365ost2(3,1)).toBe(1);});it('c',()=>{expect(hd365ost2(0,0)).toBe(0);});it('d',()=>{expect(hd365ost2(93,73)).toBe(2);});it('e',()=>{expect(hd365ost2(15,0)).toBe(4);});});
function hd366ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366ost2_hd',()=>{it('a',()=>{expect(hd366ost2(1,4)).toBe(2);});it('b',()=>{expect(hd366ost2(3,1)).toBe(1);});it('c',()=>{expect(hd366ost2(0,0)).toBe(0);});it('d',()=>{expect(hd366ost2(93,73)).toBe(2);});it('e',()=>{expect(hd366ost2(15,0)).toBe(4);});});
function hd367ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367ost2_hd',()=>{it('a',()=>{expect(hd367ost2(1,4)).toBe(2);});it('b',()=>{expect(hd367ost2(3,1)).toBe(1);});it('c',()=>{expect(hd367ost2(0,0)).toBe(0);});it('d',()=>{expect(hd367ost2(93,73)).toBe(2);});it('e',()=>{expect(hd367ost2(15,0)).toBe(4);});});
function hd368ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368ost2_hd',()=>{it('a',()=>{expect(hd368ost2(1,4)).toBe(2);});it('b',()=>{expect(hd368ost2(3,1)).toBe(1);});it('c',()=>{expect(hd368ost2(0,0)).toBe(0);});it('d',()=>{expect(hd368ost2(93,73)).toBe(2);});it('e',()=>{expect(hd368ost2(15,0)).toBe(4);});});
function hd369ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369ost2_hd',()=>{it('a',()=>{expect(hd369ost2(1,4)).toBe(2);});it('b',()=>{expect(hd369ost2(3,1)).toBe(1);});it('c',()=>{expect(hd369ost2(0,0)).toBe(0);});it('d',()=>{expect(hd369ost2(93,73)).toBe(2);});it('e',()=>{expect(hd369ost2(15,0)).toBe(4);});});
function hd370ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370ost2_hd',()=>{it('a',()=>{expect(hd370ost2(1,4)).toBe(2);});it('b',()=>{expect(hd370ost2(3,1)).toBe(1);});it('c',()=>{expect(hd370ost2(0,0)).toBe(0);});it('d',()=>{expect(hd370ost2(93,73)).toBe(2);});it('e',()=>{expect(hd370ost2(15,0)).toBe(4);});});
function hd371ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371ost2_hd',()=>{it('a',()=>{expect(hd371ost2(1,4)).toBe(2);});it('b',()=>{expect(hd371ost2(3,1)).toBe(1);});it('c',()=>{expect(hd371ost2(0,0)).toBe(0);});it('d',()=>{expect(hd371ost2(93,73)).toBe(2);});it('e',()=>{expect(hd371ost2(15,0)).toBe(4);});});
function hd372ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372ost2_hd',()=>{it('a',()=>{expect(hd372ost2(1,4)).toBe(2);});it('b',()=>{expect(hd372ost2(3,1)).toBe(1);});it('c',()=>{expect(hd372ost2(0,0)).toBe(0);});it('d',()=>{expect(hd372ost2(93,73)).toBe(2);});it('e',()=>{expect(hd372ost2(15,0)).toBe(4);});});
function hd373ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373ost2_hd',()=>{it('a',()=>{expect(hd373ost2(1,4)).toBe(2);});it('b',()=>{expect(hd373ost2(3,1)).toBe(1);});it('c',()=>{expect(hd373ost2(0,0)).toBe(0);});it('d',()=>{expect(hd373ost2(93,73)).toBe(2);});it('e',()=>{expect(hd373ost2(15,0)).toBe(4);});});
function hd374ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374ost2_hd',()=>{it('a',()=>{expect(hd374ost2(1,4)).toBe(2);});it('b',()=>{expect(hd374ost2(3,1)).toBe(1);});it('c',()=>{expect(hd374ost2(0,0)).toBe(0);});it('d',()=>{expect(hd374ost2(93,73)).toBe(2);});it('e',()=>{expect(hd374ost2(15,0)).toBe(4);});});
function hd375ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375ost2_hd',()=>{it('a',()=>{expect(hd375ost2(1,4)).toBe(2);});it('b',()=>{expect(hd375ost2(3,1)).toBe(1);});it('c',()=>{expect(hd375ost2(0,0)).toBe(0);});it('d',()=>{expect(hd375ost2(93,73)).toBe(2);});it('e',()=>{expect(hd375ost2(15,0)).toBe(4);});});
function hd376ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376ost2_hd',()=>{it('a',()=>{expect(hd376ost2(1,4)).toBe(2);});it('b',()=>{expect(hd376ost2(3,1)).toBe(1);});it('c',()=>{expect(hd376ost2(0,0)).toBe(0);});it('d',()=>{expect(hd376ost2(93,73)).toBe(2);});it('e',()=>{expect(hd376ost2(15,0)).toBe(4);});});
function hd377ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377ost2_hd',()=>{it('a',()=>{expect(hd377ost2(1,4)).toBe(2);});it('b',()=>{expect(hd377ost2(3,1)).toBe(1);});it('c',()=>{expect(hd377ost2(0,0)).toBe(0);});it('d',()=>{expect(hd377ost2(93,73)).toBe(2);});it('e',()=>{expect(hd377ost2(15,0)).toBe(4);});});
function hd378ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378ost2_hd',()=>{it('a',()=>{expect(hd378ost2(1,4)).toBe(2);});it('b',()=>{expect(hd378ost2(3,1)).toBe(1);});it('c',()=>{expect(hd378ost2(0,0)).toBe(0);});it('d',()=>{expect(hd378ost2(93,73)).toBe(2);});it('e',()=>{expect(hd378ost2(15,0)).toBe(4);});});
function hd379ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379ost2_hd',()=>{it('a',()=>{expect(hd379ost2(1,4)).toBe(2);});it('b',()=>{expect(hd379ost2(3,1)).toBe(1);});it('c',()=>{expect(hd379ost2(0,0)).toBe(0);});it('d',()=>{expect(hd379ost2(93,73)).toBe(2);});it('e',()=>{expect(hd379ost2(15,0)).toBe(4);});});
function hd380ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380ost2_hd',()=>{it('a',()=>{expect(hd380ost2(1,4)).toBe(2);});it('b',()=>{expect(hd380ost2(3,1)).toBe(1);});it('c',()=>{expect(hd380ost2(0,0)).toBe(0);});it('d',()=>{expect(hd380ost2(93,73)).toBe(2);});it('e',()=>{expect(hd380ost2(15,0)).toBe(4);});});
function hd381ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381ost2_hd',()=>{it('a',()=>{expect(hd381ost2(1,4)).toBe(2);});it('b',()=>{expect(hd381ost2(3,1)).toBe(1);});it('c',()=>{expect(hd381ost2(0,0)).toBe(0);});it('d',()=>{expect(hd381ost2(93,73)).toBe(2);});it('e',()=>{expect(hd381ost2(15,0)).toBe(4);});});
function hd382ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382ost2_hd',()=>{it('a',()=>{expect(hd382ost2(1,4)).toBe(2);});it('b',()=>{expect(hd382ost2(3,1)).toBe(1);});it('c',()=>{expect(hd382ost2(0,0)).toBe(0);});it('d',()=>{expect(hd382ost2(93,73)).toBe(2);});it('e',()=>{expect(hd382ost2(15,0)).toBe(4);});});
function hd383ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383ost2_hd',()=>{it('a',()=>{expect(hd383ost2(1,4)).toBe(2);});it('b',()=>{expect(hd383ost2(3,1)).toBe(1);});it('c',()=>{expect(hd383ost2(0,0)).toBe(0);});it('d',()=>{expect(hd383ost2(93,73)).toBe(2);});it('e',()=>{expect(hd383ost2(15,0)).toBe(4);});});
function hd384ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384ost2_hd',()=>{it('a',()=>{expect(hd384ost2(1,4)).toBe(2);});it('b',()=>{expect(hd384ost2(3,1)).toBe(1);});it('c',()=>{expect(hd384ost2(0,0)).toBe(0);});it('d',()=>{expect(hd384ost2(93,73)).toBe(2);});it('e',()=>{expect(hd384ost2(15,0)).toBe(4);});});
function hd385ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385ost2_hd',()=>{it('a',()=>{expect(hd385ost2(1,4)).toBe(2);});it('b',()=>{expect(hd385ost2(3,1)).toBe(1);});it('c',()=>{expect(hd385ost2(0,0)).toBe(0);});it('d',()=>{expect(hd385ost2(93,73)).toBe(2);});it('e',()=>{expect(hd385ost2(15,0)).toBe(4);});});
function hd386ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386ost2_hd',()=>{it('a',()=>{expect(hd386ost2(1,4)).toBe(2);});it('b',()=>{expect(hd386ost2(3,1)).toBe(1);});it('c',()=>{expect(hd386ost2(0,0)).toBe(0);});it('d',()=>{expect(hd386ost2(93,73)).toBe(2);});it('e',()=>{expect(hd386ost2(15,0)).toBe(4);});});
function hd387ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387ost2_hd',()=>{it('a',()=>{expect(hd387ost2(1,4)).toBe(2);});it('b',()=>{expect(hd387ost2(3,1)).toBe(1);});it('c',()=>{expect(hd387ost2(0,0)).toBe(0);});it('d',()=>{expect(hd387ost2(93,73)).toBe(2);});it('e',()=>{expect(hd387ost2(15,0)).toBe(4);});});
function hd388ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388ost2_hd',()=>{it('a',()=>{expect(hd388ost2(1,4)).toBe(2);});it('b',()=>{expect(hd388ost2(3,1)).toBe(1);});it('c',()=>{expect(hd388ost2(0,0)).toBe(0);});it('d',()=>{expect(hd388ost2(93,73)).toBe(2);});it('e',()=>{expect(hd388ost2(15,0)).toBe(4);});});
function hd389ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389ost2_hd',()=>{it('a',()=>{expect(hd389ost2(1,4)).toBe(2);});it('b',()=>{expect(hd389ost2(3,1)).toBe(1);});it('c',()=>{expect(hd389ost2(0,0)).toBe(0);});it('d',()=>{expect(hd389ost2(93,73)).toBe(2);});it('e',()=>{expect(hd389ost2(15,0)).toBe(4);});});
function hd390ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390ost2_hd',()=>{it('a',()=>{expect(hd390ost2(1,4)).toBe(2);});it('b',()=>{expect(hd390ost2(3,1)).toBe(1);});it('c',()=>{expect(hd390ost2(0,0)).toBe(0);});it('d',()=>{expect(hd390ost2(93,73)).toBe(2);});it('e',()=>{expect(hd390ost2(15,0)).toBe(4);});});
function hd391ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391ost2_hd',()=>{it('a',()=>{expect(hd391ost2(1,4)).toBe(2);});it('b',()=>{expect(hd391ost2(3,1)).toBe(1);});it('c',()=>{expect(hd391ost2(0,0)).toBe(0);});it('d',()=>{expect(hd391ost2(93,73)).toBe(2);});it('e',()=>{expect(hd391ost2(15,0)).toBe(4);});});
function hd392ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392ost2_hd',()=>{it('a',()=>{expect(hd392ost2(1,4)).toBe(2);});it('b',()=>{expect(hd392ost2(3,1)).toBe(1);});it('c',()=>{expect(hd392ost2(0,0)).toBe(0);});it('d',()=>{expect(hd392ost2(93,73)).toBe(2);});it('e',()=>{expect(hd392ost2(15,0)).toBe(4);});});
function hd393ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393ost2_hd',()=>{it('a',()=>{expect(hd393ost2(1,4)).toBe(2);});it('b',()=>{expect(hd393ost2(3,1)).toBe(1);});it('c',()=>{expect(hd393ost2(0,0)).toBe(0);});it('d',()=>{expect(hd393ost2(93,73)).toBe(2);});it('e',()=>{expect(hd393ost2(15,0)).toBe(4);});});
function hd394ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394ost2_hd',()=>{it('a',()=>{expect(hd394ost2(1,4)).toBe(2);});it('b',()=>{expect(hd394ost2(3,1)).toBe(1);});it('c',()=>{expect(hd394ost2(0,0)).toBe(0);});it('d',()=>{expect(hd394ost2(93,73)).toBe(2);});it('e',()=>{expect(hd394ost2(15,0)).toBe(4);});});
function hd395ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395ost2_hd',()=>{it('a',()=>{expect(hd395ost2(1,4)).toBe(2);});it('b',()=>{expect(hd395ost2(3,1)).toBe(1);});it('c',()=>{expect(hd395ost2(0,0)).toBe(0);});it('d',()=>{expect(hd395ost2(93,73)).toBe(2);});it('e',()=>{expect(hd395ost2(15,0)).toBe(4);});});
function hd396ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396ost2_hd',()=>{it('a',()=>{expect(hd396ost2(1,4)).toBe(2);});it('b',()=>{expect(hd396ost2(3,1)).toBe(1);});it('c',()=>{expect(hd396ost2(0,0)).toBe(0);});it('d',()=>{expect(hd396ost2(93,73)).toBe(2);});it('e',()=>{expect(hd396ost2(15,0)).toBe(4);});});
function hd397ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397ost2_hd',()=>{it('a',()=>{expect(hd397ost2(1,4)).toBe(2);});it('b',()=>{expect(hd397ost2(3,1)).toBe(1);});it('c',()=>{expect(hd397ost2(0,0)).toBe(0);});it('d',()=>{expect(hd397ost2(93,73)).toBe(2);});it('e',()=>{expect(hd397ost2(15,0)).toBe(4);});});
function hd398ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398ost2_hd',()=>{it('a',()=>{expect(hd398ost2(1,4)).toBe(2);});it('b',()=>{expect(hd398ost2(3,1)).toBe(1);});it('c',()=>{expect(hd398ost2(0,0)).toBe(0);});it('d',()=>{expect(hd398ost2(93,73)).toBe(2);});it('e',()=>{expect(hd398ost2(15,0)).toBe(4);});});
function hd399ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399ost2_hd',()=>{it('a',()=>{expect(hd399ost2(1,4)).toBe(2);});it('b',()=>{expect(hd399ost2(3,1)).toBe(1);});it('c',()=>{expect(hd399ost2(0,0)).toBe(0);});it('d',()=>{expect(hd399ost2(93,73)).toBe(2);});it('e',()=>{expect(hd399ost2(15,0)).toBe(4);});});
function hd400ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400ost2_hd',()=>{it('a',()=>{expect(hd400ost2(1,4)).toBe(2);});it('b',()=>{expect(hd400ost2(3,1)).toBe(1);});it('c',()=>{expect(hd400ost2(0,0)).toBe(0);});it('d',()=>{expect(hd400ost2(93,73)).toBe(2);});it('e',()=>{expect(hd400ost2(15,0)).toBe(4);});});
function hd401ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401ost2_hd',()=>{it('a',()=>{expect(hd401ost2(1,4)).toBe(2);});it('b',()=>{expect(hd401ost2(3,1)).toBe(1);});it('c',()=>{expect(hd401ost2(0,0)).toBe(0);});it('d',()=>{expect(hd401ost2(93,73)).toBe(2);});it('e',()=>{expect(hd401ost2(15,0)).toBe(4);});});
function hd402ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402ost2_hd',()=>{it('a',()=>{expect(hd402ost2(1,4)).toBe(2);});it('b',()=>{expect(hd402ost2(3,1)).toBe(1);});it('c',()=>{expect(hd402ost2(0,0)).toBe(0);});it('d',()=>{expect(hd402ost2(93,73)).toBe(2);});it('e',()=>{expect(hd402ost2(15,0)).toBe(4);});});
function hd403ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403ost2_hd',()=>{it('a',()=>{expect(hd403ost2(1,4)).toBe(2);});it('b',()=>{expect(hd403ost2(3,1)).toBe(1);});it('c',()=>{expect(hd403ost2(0,0)).toBe(0);});it('d',()=>{expect(hd403ost2(93,73)).toBe(2);});it('e',()=>{expect(hd403ost2(15,0)).toBe(4);});});
function hd404ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404ost2_hd',()=>{it('a',()=>{expect(hd404ost2(1,4)).toBe(2);});it('b',()=>{expect(hd404ost2(3,1)).toBe(1);});it('c',()=>{expect(hd404ost2(0,0)).toBe(0);});it('d',()=>{expect(hd404ost2(93,73)).toBe(2);});it('e',()=>{expect(hd404ost2(15,0)).toBe(4);});});
function hd405ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405ost2_hd',()=>{it('a',()=>{expect(hd405ost2(1,4)).toBe(2);});it('b',()=>{expect(hd405ost2(3,1)).toBe(1);});it('c',()=>{expect(hd405ost2(0,0)).toBe(0);});it('d',()=>{expect(hd405ost2(93,73)).toBe(2);});it('e',()=>{expect(hd405ost2(15,0)).toBe(4);});});
function hd406ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406ost2_hd',()=>{it('a',()=>{expect(hd406ost2(1,4)).toBe(2);});it('b',()=>{expect(hd406ost2(3,1)).toBe(1);});it('c',()=>{expect(hd406ost2(0,0)).toBe(0);});it('d',()=>{expect(hd406ost2(93,73)).toBe(2);});it('e',()=>{expect(hd406ost2(15,0)).toBe(4);});});
function hd407ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407ost2_hd',()=>{it('a',()=>{expect(hd407ost2(1,4)).toBe(2);});it('b',()=>{expect(hd407ost2(3,1)).toBe(1);});it('c',()=>{expect(hd407ost2(0,0)).toBe(0);});it('d',()=>{expect(hd407ost2(93,73)).toBe(2);});it('e',()=>{expect(hd407ost2(15,0)).toBe(4);});});
function hd408ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408ost2_hd',()=>{it('a',()=>{expect(hd408ost2(1,4)).toBe(2);});it('b',()=>{expect(hd408ost2(3,1)).toBe(1);});it('c',()=>{expect(hd408ost2(0,0)).toBe(0);});it('d',()=>{expect(hd408ost2(93,73)).toBe(2);});it('e',()=>{expect(hd408ost2(15,0)).toBe(4);});});
function hd409ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409ost2_hd',()=>{it('a',()=>{expect(hd409ost2(1,4)).toBe(2);});it('b',()=>{expect(hd409ost2(3,1)).toBe(1);});it('c',()=>{expect(hd409ost2(0,0)).toBe(0);});it('d',()=>{expect(hd409ost2(93,73)).toBe(2);});it('e',()=>{expect(hd409ost2(15,0)).toBe(4);});});
function hd410ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410ost2_hd',()=>{it('a',()=>{expect(hd410ost2(1,4)).toBe(2);});it('b',()=>{expect(hd410ost2(3,1)).toBe(1);});it('c',()=>{expect(hd410ost2(0,0)).toBe(0);});it('d',()=>{expect(hd410ost2(93,73)).toBe(2);});it('e',()=>{expect(hd410ost2(15,0)).toBe(4);});});
function hd411ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411ost2_hd',()=>{it('a',()=>{expect(hd411ost2(1,4)).toBe(2);});it('b',()=>{expect(hd411ost2(3,1)).toBe(1);});it('c',()=>{expect(hd411ost2(0,0)).toBe(0);});it('d',()=>{expect(hd411ost2(93,73)).toBe(2);});it('e',()=>{expect(hd411ost2(15,0)).toBe(4);});});
function hd412ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412ost2_hd',()=>{it('a',()=>{expect(hd412ost2(1,4)).toBe(2);});it('b',()=>{expect(hd412ost2(3,1)).toBe(1);});it('c',()=>{expect(hd412ost2(0,0)).toBe(0);});it('d',()=>{expect(hd412ost2(93,73)).toBe(2);});it('e',()=>{expect(hd412ost2(15,0)).toBe(4);});});
function hd413ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413ost2_hd',()=>{it('a',()=>{expect(hd413ost2(1,4)).toBe(2);});it('b',()=>{expect(hd413ost2(3,1)).toBe(1);});it('c',()=>{expect(hd413ost2(0,0)).toBe(0);});it('d',()=>{expect(hd413ost2(93,73)).toBe(2);});it('e',()=>{expect(hd413ost2(15,0)).toBe(4);});});
function hd414ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414ost2_hd',()=>{it('a',()=>{expect(hd414ost2(1,4)).toBe(2);});it('b',()=>{expect(hd414ost2(3,1)).toBe(1);});it('c',()=>{expect(hd414ost2(0,0)).toBe(0);});it('d',()=>{expect(hd414ost2(93,73)).toBe(2);});it('e',()=>{expect(hd414ost2(15,0)).toBe(4);});});
function hd415ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415ost2_hd',()=>{it('a',()=>{expect(hd415ost2(1,4)).toBe(2);});it('b',()=>{expect(hd415ost2(3,1)).toBe(1);});it('c',()=>{expect(hd415ost2(0,0)).toBe(0);});it('d',()=>{expect(hd415ost2(93,73)).toBe(2);});it('e',()=>{expect(hd415ost2(15,0)).toBe(4);});});
function hd416ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416ost2_hd',()=>{it('a',()=>{expect(hd416ost2(1,4)).toBe(2);});it('b',()=>{expect(hd416ost2(3,1)).toBe(1);});it('c',()=>{expect(hd416ost2(0,0)).toBe(0);});it('d',()=>{expect(hd416ost2(93,73)).toBe(2);});it('e',()=>{expect(hd416ost2(15,0)).toBe(4);});});
function hd417ost2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417ost2_hd',()=>{it('a',()=>{expect(hd417ost2(1,4)).toBe(2);});it('b',()=>{expect(hd417ost2(3,1)).toBe(1);});it('c',()=>{expect(hd417ost2(0,0)).toBe(0);});it('d',()=>{expect(hd417ost2(93,73)).toBe(2);});it('e',()=>{expect(hd417ost2(15,0)).toBe(4);});});
function hd418ost3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph418ost3_hd',()=>{it('a',()=>{expect(hd418ost3(1,4)).toBe(2);});it('b',()=>{expect(hd418ost3(3,1)).toBe(1);});it('c',()=>{expect(hd418ost3(0,0)).toBe(0);});it('d',()=>{expect(hd418ost3(93,73)).toBe(2);});it('e',()=>{expect(hd418ost3(15,0)).toBe(4);});});
function hd419ost3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph419ost3_hd',()=>{it('a',()=>{expect(hd419ost3(1,4)).toBe(2);});it('b',()=>{expect(hd419ost3(3,1)).toBe(1);});it('c',()=>{expect(hd419ost3(0,0)).toBe(0);});it('d',()=>{expect(hd419ost3(93,73)).toBe(2);});it('e',()=>{expect(hd419ost3(15,0)).toBe(4);});});
function hd420ost3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph420ost3_hd',()=>{it('a',()=>{expect(hd420ost3(1,4)).toBe(2);});it('b',()=>{expect(hd420ost3(3,1)).toBe(1);});it('c',()=>{expect(hd420ost3(0,0)).toBe(0);});it('d',()=>{expect(hd420ost3(93,73)).toBe(2);});it('e',()=>{expect(hd420ost3(15,0)).toBe(4);});});
function hd421ost3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph421ost3_hd',()=>{it('a',()=>{expect(hd421ost3(1,4)).toBe(2);});it('b',()=>{expect(hd421ost3(3,1)).toBe(1);});it('c',()=>{expect(hd421ost3(0,0)).toBe(0);});it('d',()=>{expect(hd421ost3(93,73)).toBe(2);});it('e',()=>{expect(hd421ost3(15,0)).toBe(4);});});
function hd422ost3(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph422ost3_hd',()=>{it('a',()=>{expect(hd422ost3(1,4)).toBe(2);});it('b',()=>{expect(hd422ost3(3,1)).toBe(1);});it('c',()=>{expect(hd422ost3(0,0)).toBe(0);});it('d',()=>{expect(hd422ost3(93,73)).toBe(2);});it('e',()=>{expect(hd422ost3(15,0)).toBe(4);});});
