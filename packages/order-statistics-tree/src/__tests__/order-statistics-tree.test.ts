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
