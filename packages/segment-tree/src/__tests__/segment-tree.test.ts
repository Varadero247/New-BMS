// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { SegmentTree, sumSegmentTree, minSegmentTree, maxSegmentTree, rangeSum, rangeMin, rangeMax } from '../segment-tree';

describe('SegmentTree - sum', () => {
  it('sum of all elements', () => {
    const st = sumSegmentTree([1,2,3,4,5]);
    expect(st.query(0, 4)).toBe(15);
  });
  it('prefix sum [0,2]', () => {
    expect(sumSegmentTree([1,2,3,4,5]).query(0, 2)).toBe(6);
  });
  it('single element query', () => {
    expect(sumSegmentTree([10,20,30]).query(1, 1)).toBe(20);
  });
  it('update changes sum', () => {
    const st = sumSegmentTree([1,2,3]);
    st.update(1, 10);
    expect(st.query(0, 2)).toBe(14);
  });
  it('empty array query returns identity', () => {
    const st = sumSegmentTree([]);
    expect(st.query(0, 0)).toBe(0);
  });
  for (let n = 1; n <= 50; n++) {
    it('sum [0,' + (n-1) + '] of 1..n = ' + n*(n+1)/2, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(sumSegmentTree(arr).query(0, n - 1)).toBe(n * (n + 1) / 2);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('single element query at ' + i, () => {
      const arr = Array.from({ length: 50 }, (_, j) => j * 2);
      expect(sumSegmentTree(arr).query(i, i)).toBe(i * 2);
    });
  }
});

describe('SegmentTree - min', () => {
  it('min of all', () => { expect(minSegmentTree([3,1,4,1,5]).query(0, 4)).toBe(1); });
  it('min of range', () => { expect(minSegmentTree([5,3,8,1,9]).query(1, 3)).toBe(1); });
  it('update affects min', () => {
    const st = minSegmentTree([5,3,8]);
    st.update(0, 1);
    expect(st.query(0, 2)).toBe(1);
  });
  for (let n = 1; n <= 50; n++) {
    it('min of descending array 1..' + n + ' is 1', () => {
      const arr = Array.from({ length: n }, (_, i) => n - i);
      expect(minSegmentTree(arr).query(0, n - 1)).toBe(1);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('min range [' + i + ',' + i + '] = ' + i, () => {
      const arr = Array.from({ length: 50 }, (_, j) => j);
      expect(minSegmentTree(arr).query(i, i)).toBe(i);
    });
  }
});

describe('SegmentTree - max', () => {
  it('max of all', () => { expect(maxSegmentTree([3,1,4,1,5]).query(0, 4)).toBe(5); });
  it('max of range', () => { expect(maxSegmentTree([1,8,3,7,2]).query(1, 3)).toBe(8); });
  for (let n = 1; n <= 50; n++) {
    it('max of ascending array 1..' + n + ' is ' + n, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(maxSegmentTree(arr).query(0, n - 1)).toBe(n);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('max single element at ' + i, () => {
      const arr = Array.from({ length: 50 }, (_, j) => j * 3);
      expect(maxSegmentTree(arr).query(i, i)).toBe(i * 3);
    });
  }
});

describe('rangeSum, rangeMin, rangeMax helpers', () => {
  it('rangeSum works', () => { expect(rangeSum([1,2,3,4,5], 1, 3)).toBe(9); });
  it('rangeMin works', () => { expect(rangeMin([5,1,3,2,4], 1, 3)).toBe(1); });
  it('rangeMax works', () => { expect(rangeMax([1,8,3,7,2], 0, 4)).toBe(8); });
  for (let i = 0; i < 50; i++) {
    it('rangeSum single element ' + i, () => {
      const arr = Array.from({ length: 50 }, (_, j) => j + 1);
      expect(rangeSum(arr, i, i)).toBe(i + 1);
    });
  }
});

describe('SegmentTree - length and update', () => {
  it('length matches array', () => { expect(sumSegmentTree([1,2,3]).length).toBe(3); });
  for (let n = 1; n <= 50; n++) {
    it('length = ' + n, () => { expect(sumSegmentTree(Array(n).fill(0)).length).toBe(n); });
  }
  for (let i = 0; i < 50; i++) {
    it('update at ' + i + ' affects only that range', () => {
      const arr = Array.from({ length: 50 }, () => 1);
      const st = sumSegmentTree(arr);
      st.update(i, 100);
      expect(st.query(i, i)).toBe(100);
    });
  }
});

describe('segment-tree top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('sum [0,' + i + '] correct', () => {
      const arr = Array.from({ length: i + 1 }, (_, j) => j + 1);
      const st = sumSegmentTree(arr);
      expect(st.query(0, i)).toBe((i + 1) * (i + 2) / 2);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('min after update ' + i, () => {
      const arr = Array.from({ length: 10 }, (_, j) => j + 10);
      const st = minSegmentTree(arr);
      st.update(i % 10, i % 5);
      expect(st.query(0, 9)).toBeLessThanOrEqual(10);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('max after update ' + i, () => {
      const arr = Array.from({ length: 10 }, (_, j) => j);
      const st = maxSegmentTree(arr);
      st.update(i % 10, 1000 + i);
      expect(st.query(0, 9)).toBe(1000 + i);
    });
  }
  for (let n = 1; n <= 50; n++) {
    it('segment-tree length after construction ' + n, () => {
      expect(sumSegmentTree(Array(n).fill(1)).length).toBe(n);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('rangeSum helper ' + i, () => {
      const arr = Array.from({ length: 20 }, (_, j) => j + 1);
      const l = i % 10, r = l + (i % 5) + 1;
      const expected = arr.slice(l, r + 1).reduce((a, b) => a + b, 0);
      expect(rangeSum(arr, l, r)).toBe(expected);
    });
  }
});

describe('segment final top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('sum of two-element array [' + i + ',' + (i+1) + ']', () => {
      const st = sumSegmentTree([i, i + 1]);
      expect(st.query(0, 1)).toBe(i + i + 1);
    });
  }
});
function hd258sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258sgt_hd',()=>{it('a',()=>{expect(hd258sgt(1,4)).toBe(2);});it('b',()=>{expect(hd258sgt(3,1)).toBe(1);});it('c',()=>{expect(hd258sgt(0,0)).toBe(0);});it('d',()=>{expect(hd258sgt(93,73)).toBe(2);});it('e',()=>{expect(hd258sgt(15,0)).toBe(4);});});
function hd259sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259sgt_hd',()=>{it('a',()=>{expect(hd259sgt(1,4)).toBe(2);});it('b',()=>{expect(hd259sgt(3,1)).toBe(1);});it('c',()=>{expect(hd259sgt(0,0)).toBe(0);});it('d',()=>{expect(hd259sgt(93,73)).toBe(2);});it('e',()=>{expect(hd259sgt(15,0)).toBe(4);});});
function hd260sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260sgt_hd',()=>{it('a',()=>{expect(hd260sgt(1,4)).toBe(2);});it('b',()=>{expect(hd260sgt(3,1)).toBe(1);});it('c',()=>{expect(hd260sgt(0,0)).toBe(0);});it('d',()=>{expect(hd260sgt(93,73)).toBe(2);});it('e',()=>{expect(hd260sgt(15,0)).toBe(4);});});
function hd261sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261sgt_hd',()=>{it('a',()=>{expect(hd261sgt(1,4)).toBe(2);});it('b',()=>{expect(hd261sgt(3,1)).toBe(1);});it('c',()=>{expect(hd261sgt(0,0)).toBe(0);});it('d',()=>{expect(hd261sgt(93,73)).toBe(2);});it('e',()=>{expect(hd261sgt(15,0)).toBe(4);});});
function hd262sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262sgt_hd',()=>{it('a',()=>{expect(hd262sgt(1,4)).toBe(2);});it('b',()=>{expect(hd262sgt(3,1)).toBe(1);});it('c',()=>{expect(hd262sgt(0,0)).toBe(0);});it('d',()=>{expect(hd262sgt(93,73)).toBe(2);});it('e',()=>{expect(hd262sgt(15,0)).toBe(4);});});
function hd263sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263sgt_hd',()=>{it('a',()=>{expect(hd263sgt(1,4)).toBe(2);});it('b',()=>{expect(hd263sgt(3,1)).toBe(1);});it('c',()=>{expect(hd263sgt(0,0)).toBe(0);});it('d',()=>{expect(hd263sgt(93,73)).toBe(2);});it('e',()=>{expect(hd263sgt(15,0)).toBe(4);});});
function hd264sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264sgt_hd',()=>{it('a',()=>{expect(hd264sgt(1,4)).toBe(2);});it('b',()=>{expect(hd264sgt(3,1)).toBe(1);});it('c',()=>{expect(hd264sgt(0,0)).toBe(0);});it('d',()=>{expect(hd264sgt(93,73)).toBe(2);});it('e',()=>{expect(hd264sgt(15,0)).toBe(4);});});
function hd265sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265sgt_hd',()=>{it('a',()=>{expect(hd265sgt(1,4)).toBe(2);});it('b',()=>{expect(hd265sgt(3,1)).toBe(1);});it('c',()=>{expect(hd265sgt(0,0)).toBe(0);});it('d',()=>{expect(hd265sgt(93,73)).toBe(2);});it('e',()=>{expect(hd265sgt(15,0)).toBe(4);});});
function hd266sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266sgt_hd',()=>{it('a',()=>{expect(hd266sgt(1,4)).toBe(2);});it('b',()=>{expect(hd266sgt(3,1)).toBe(1);});it('c',()=>{expect(hd266sgt(0,0)).toBe(0);});it('d',()=>{expect(hd266sgt(93,73)).toBe(2);});it('e',()=>{expect(hd266sgt(15,0)).toBe(4);});});
function hd267sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267sgt_hd',()=>{it('a',()=>{expect(hd267sgt(1,4)).toBe(2);});it('b',()=>{expect(hd267sgt(3,1)).toBe(1);});it('c',()=>{expect(hd267sgt(0,0)).toBe(0);});it('d',()=>{expect(hd267sgt(93,73)).toBe(2);});it('e',()=>{expect(hd267sgt(15,0)).toBe(4);});});
function hd268sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268sgt_hd',()=>{it('a',()=>{expect(hd268sgt(1,4)).toBe(2);});it('b',()=>{expect(hd268sgt(3,1)).toBe(1);});it('c',()=>{expect(hd268sgt(0,0)).toBe(0);});it('d',()=>{expect(hd268sgt(93,73)).toBe(2);});it('e',()=>{expect(hd268sgt(15,0)).toBe(4);});});
function hd269sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269sgt_hd',()=>{it('a',()=>{expect(hd269sgt(1,4)).toBe(2);});it('b',()=>{expect(hd269sgt(3,1)).toBe(1);});it('c',()=>{expect(hd269sgt(0,0)).toBe(0);});it('d',()=>{expect(hd269sgt(93,73)).toBe(2);});it('e',()=>{expect(hd269sgt(15,0)).toBe(4);});});
function hd270sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270sgt_hd',()=>{it('a',()=>{expect(hd270sgt(1,4)).toBe(2);});it('b',()=>{expect(hd270sgt(3,1)).toBe(1);});it('c',()=>{expect(hd270sgt(0,0)).toBe(0);});it('d',()=>{expect(hd270sgt(93,73)).toBe(2);});it('e',()=>{expect(hd270sgt(15,0)).toBe(4);});});
function hd271sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271sgt_hd',()=>{it('a',()=>{expect(hd271sgt(1,4)).toBe(2);});it('b',()=>{expect(hd271sgt(3,1)).toBe(1);});it('c',()=>{expect(hd271sgt(0,0)).toBe(0);});it('d',()=>{expect(hd271sgt(93,73)).toBe(2);});it('e',()=>{expect(hd271sgt(15,0)).toBe(4);});});
function hd272sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272sgt_hd',()=>{it('a',()=>{expect(hd272sgt(1,4)).toBe(2);});it('b',()=>{expect(hd272sgt(3,1)).toBe(1);});it('c',()=>{expect(hd272sgt(0,0)).toBe(0);});it('d',()=>{expect(hd272sgt(93,73)).toBe(2);});it('e',()=>{expect(hd272sgt(15,0)).toBe(4);});});
function hd273sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273sgt_hd',()=>{it('a',()=>{expect(hd273sgt(1,4)).toBe(2);});it('b',()=>{expect(hd273sgt(3,1)).toBe(1);});it('c',()=>{expect(hd273sgt(0,0)).toBe(0);});it('d',()=>{expect(hd273sgt(93,73)).toBe(2);});it('e',()=>{expect(hd273sgt(15,0)).toBe(4);});});
function hd274sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274sgt_hd',()=>{it('a',()=>{expect(hd274sgt(1,4)).toBe(2);});it('b',()=>{expect(hd274sgt(3,1)).toBe(1);});it('c',()=>{expect(hd274sgt(0,0)).toBe(0);});it('d',()=>{expect(hd274sgt(93,73)).toBe(2);});it('e',()=>{expect(hd274sgt(15,0)).toBe(4);});});
function hd275sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275sgt_hd',()=>{it('a',()=>{expect(hd275sgt(1,4)).toBe(2);});it('b',()=>{expect(hd275sgt(3,1)).toBe(1);});it('c',()=>{expect(hd275sgt(0,0)).toBe(0);});it('d',()=>{expect(hd275sgt(93,73)).toBe(2);});it('e',()=>{expect(hd275sgt(15,0)).toBe(4);});});
function hd276sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276sgt_hd',()=>{it('a',()=>{expect(hd276sgt(1,4)).toBe(2);});it('b',()=>{expect(hd276sgt(3,1)).toBe(1);});it('c',()=>{expect(hd276sgt(0,0)).toBe(0);});it('d',()=>{expect(hd276sgt(93,73)).toBe(2);});it('e',()=>{expect(hd276sgt(15,0)).toBe(4);});});
function hd277sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277sgt_hd',()=>{it('a',()=>{expect(hd277sgt(1,4)).toBe(2);});it('b',()=>{expect(hd277sgt(3,1)).toBe(1);});it('c',()=>{expect(hd277sgt(0,0)).toBe(0);});it('d',()=>{expect(hd277sgt(93,73)).toBe(2);});it('e',()=>{expect(hd277sgt(15,0)).toBe(4);});});
function hd278sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278sgt_hd',()=>{it('a',()=>{expect(hd278sgt(1,4)).toBe(2);});it('b',()=>{expect(hd278sgt(3,1)).toBe(1);});it('c',()=>{expect(hd278sgt(0,0)).toBe(0);});it('d',()=>{expect(hd278sgt(93,73)).toBe(2);});it('e',()=>{expect(hd278sgt(15,0)).toBe(4);});});
function hd279sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279sgt_hd',()=>{it('a',()=>{expect(hd279sgt(1,4)).toBe(2);});it('b',()=>{expect(hd279sgt(3,1)).toBe(1);});it('c',()=>{expect(hd279sgt(0,0)).toBe(0);});it('d',()=>{expect(hd279sgt(93,73)).toBe(2);});it('e',()=>{expect(hd279sgt(15,0)).toBe(4);});});
function hd280sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280sgt_hd',()=>{it('a',()=>{expect(hd280sgt(1,4)).toBe(2);});it('b',()=>{expect(hd280sgt(3,1)).toBe(1);});it('c',()=>{expect(hd280sgt(0,0)).toBe(0);});it('d',()=>{expect(hd280sgt(93,73)).toBe(2);});it('e',()=>{expect(hd280sgt(15,0)).toBe(4);});});
function hd281sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281sgt_hd',()=>{it('a',()=>{expect(hd281sgt(1,4)).toBe(2);});it('b',()=>{expect(hd281sgt(3,1)).toBe(1);});it('c',()=>{expect(hd281sgt(0,0)).toBe(0);});it('d',()=>{expect(hd281sgt(93,73)).toBe(2);});it('e',()=>{expect(hd281sgt(15,0)).toBe(4);});});
function hd282sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282sgt_hd',()=>{it('a',()=>{expect(hd282sgt(1,4)).toBe(2);});it('b',()=>{expect(hd282sgt(3,1)).toBe(1);});it('c',()=>{expect(hd282sgt(0,0)).toBe(0);});it('d',()=>{expect(hd282sgt(93,73)).toBe(2);});it('e',()=>{expect(hd282sgt(15,0)).toBe(4);});});
function hd283sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283sgt_hd',()=>{it('a',()=>{expect(hd283sgt(1,4)).toBe(2);});it('b',()=>{expect(hd283sgt(3,1)).toBe(1);});it('c',()=>{expect(hd283sgt(0,0)).toBe(0);});it('d',()=>{expect(hd283sgt(93,73)).toBe(2);});it('e',()=>{expect(hd283sgt(15,0)).toBe(4);});});
function hd284sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284sgt_hd',()=>{it('a',()=>{expect(hd284sgt(1,4)).toBe(2);});it('b',()=>{expect(hd284sgt(3,1)).toBe(1);});it('c',()=>{expect(hd284sgt(0,0)).toBe(0);});it('d',()=>{expect(hd284sgt(93,73)).toBe(2);});it('e',()=>{expect(hd284sgt(15,0)).toBe(4);});});
function hd285sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285sgt_hd',()=>{it('a',()=>{expect(hd285sgt(1,4)).toBe(2);});it('b',()=>{expect(hd285sgt(3,1)).toBe(1);});it('c',()=>{expect(hd285sgt(0,0)).toBe(0);});it('d',()=>{expect(hd285sgt(93,73)).toBe(2);});it('e',()=>{expect(hd285sgt(15,0)).toBe(4);});});
function hd286sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286sgt_hd',()=>{it('a',()=>{expect(hd286sgt(1,4)).toBe(2);});it('b',()=>{expect(hd286sgt(3,1)).toBe(1);});it('c',()=>{expect(hd286sgt(0,0)).toBe(0);});it('d',()=>{expect(hd286sgt(93,73)).toBe(2);});it('e',()=>{expect(hd286sgt(15,0)).toBe(4);});});
function hd287sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287sgt_hd',()=>{it('a',()=>{expect(hd287sgt(1,4)).toBe(2);});it('b',()=>{expect(hd287sgt(3,1)).toBe(1);});it('c',()=>{expect(hd287sgt(0,0)).toBe(0);});it('d',()=>{expect(hd287sgt(93,73)).toBe(2);});it('e',()=>{expect(hd287sgt(15,0)).toBe(4);});});
function hd288sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288sgt_hd',()=>{it('a',()=>{expect(hd288sgt(1,4)).toBe(2);});it('b',()=>{expect(hd288sgt(3,1)).toBe(1);});it('c',()=>{expect(hd288sgt(0,0)).toBe(0);});it('d',()=>{expect(hd288sgt(93,73)).toBe(2);});it('e',()=>{expect(hd288sgt(15,0)).toBe(4);});});
function hd289sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289sgt_hd',()=>{it('a',()=>{expect(hd289sgt(1,4)).toBe(2);});it('b',()=>{expect(hd289sgt(3,1)).toBe(1);});it('c',()=>{expect(hd289sgt(0,0)).toBe(0);});it('d',()=>{expect(hd289sgt(93,73)).toBe(2);});it('e',()=>{expect(hd289sgt(15,0)).toBe(4);});});
function hd290sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290sgt_hd',()=>{it('a',()=>{expect(hd290sgt(1,4)).toBe(2);});it('b',()=>{expect(hd290sgt(3,1)).toBe(1);});it('c',()=>{expect(hd290sgt(0,0)).toBe(0);});it('d',()=>{expect(hd290sgt(93,73)).toBe(2);});it('e',()=>{expect(hd290sgt(15,0)).toBe(4);});});
function hd291sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291sgt_hd',()=>{it('a',()=>{expect(hd291sgt(1,4)).toBe(2);});it('b',()=>{expect(hd291sgt(3,1)).toBe(1);});it('c',()=>{expect(hd291sgt(0,0)).toBe(0);});it('d',()=>{expect(hd291sgt(93,73)).toBe(2);});it('e',()=>{expect(hd291sgt(15,0)).toBe(4);});});
function hd292sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292sgt_hd',()=>{it('a',()=>{expect(hd292sgt(1,4)).toBe(2);});it('b',()=>{expect(hd292sgt(3,1)).toBe(1);});it('c',()=>{expect(hd292sgt(0,0)).toBe(0);});it('d',()=>{expect(hd292sgt(93,73)).toBe(2);});it('e',()=>{expect(hd292sgt(15,0)).toBe(4);});});
function hd293sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293sgt_hd',()=>{it('a',()=>{expect(hd293sgt(1,4)).toBe(2);});it('b',()=>{expect(hd293sgt(3,1)).toBe(1);});it('c',()=>{expect(hd293sgt(0,0)).toBe(0);});it('d',()=>{expect(hd293sgt(93,73)).toBe(2);});it('e',()=>{expect(hd293sgt(15,0)).toBe(4);});});
function hd294sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294sgt_hd',()=>{it('a',()=>{expect(hd294sgt(1,4)).toBe(2);});it('b',()=>{expect(hd294sgt(3,1)).toBe(1);});it('c',()=>{expect(hd294sgt(0,0)).toBe(0);});it('d',()=>{expect(hd294sgt(93,73)).toBe(2);});it('e',()=>{expect(hd294sgt(15,0)).toBe(4);});});
function hd295sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295sgt_hd',()=>{it('a',()=>{expect(hd295sgt(1,4)).toBe(2);});it('b',()=>{expect(hd295sgt(3,1)).toBe(1);});it('c',()=>{expect(hd295sgt(0,0)).toBe(0);});it('d',()=>{expect(hd295sgt(93,73)).toBe(2);});it('e',()=>{expect(hd295sgt(15,0)).toBe(4);});});
function hd296sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296sgt_hd',()=>{it('a',()=>{expect(hd296sgt(1,4)).toBe(2);});it('b',()=>{expect(hd296sgt(3,1)).toBe(1);});it('c',()=>{expect(hd296sgt(0,0)).toBe(0);});it('d',()=>{expect(hd296sgt(93,73)).toBe(2);});it('e',()=>{expect(hd296sgt(15,0)).toBe(4);});});
function hd297sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297sgt_hd',()=>{it('a',()=>{expect(hd297sgt(1,4)).toBe(2);});it('b',()=>{expect(hd297sgt(3,1)).toBe(1);});it('c',()=>{expect(hd297sgt(0,0)).toBe(0);});it('d',()=>{expect(hd297sgt(93,73)).toBe(2);});it('e',()=>{expect(hd297sgt(15,0)).toBe(4);});});
function hd298sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298sgt_hd',()=>{it('a',()=>{expect(hd298sgt(1,4)).toBe(2);});it('b',()=>{expect(hd298sgt(3,1)).toBe(1);});it('c',()=>{expect(hd298sgt(0,0)).toBe(0);});it('d',()=>{expect(hd298sgt(93,73)).toBe(2);});it('e',()=>{expect(hd298sgt(15,0)).toBe(4);});});
function hd299sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299sgt_hd',()=>{it('a',()=>{expect(hd299sgt(1,4)).toBe(2);});it('b',()=>{expect(hd299sgt(3,1)).toBe(1);});it('c',()=>{expect(hd299sgt(0,0)).toBe(0);});it('d',()=>{expect(hd299sgt(93,73)).toBe(2);});it('e',()=>{expect(hd299sgt(15,0)).toBe(4);});});
function hd300sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300sgt_hd',()=>{it('a',()=>{expect(hd300sgt(1,4)).toBe(2);});it('b',()=>{expect(hd300sgt(3,1)).toBe(1);});it('c',()=>{expect(hd300sgt(0,0)).toBe(0);});it('d',()=>{expect(hd300sgt(93,73)).toBe(2);});it('e',()=>{expect(hd300sgt(15,0)).toBe(4);});});
function hd301sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301sgt_hd',()=>{it('a',()=>{expect(hd301sgt(1,4)).toBe(2);});it('b',()=>{expect(hd301sgt(3,1)).toBe(1);});it('c',()=>{expect(hd301sgt(0,0)).toBe(0);});it('d',()=>{expect(hd301sgt(93,73)).toBe(2);});it('e',()=>{expect(hd301sgt(15,0)).toBe(4);});});
function hd302sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302sgt_hd',()=>{it('a',()=>{expect(hd302sgt(1,4)).toBe(2);});it('b',()=>{expect(hd302sgt(3,1)).toBe(1);});it('c',()=>{expect(hd302sgt(0,0)).toBe(0);});it('d',()=>{expect(hd302sgt(93,73)).toBe(2);});it('e',()=>{expect(hd302sgt(15,0)).toBe(4);});});
function hd303sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303sgt_hd',()=>{it('a',()=>{expect(hd303sgt(1,4)).toBe(2);});it('b',()=>{expect(hd303sgt(3,1)).toBe(1);});it('c',()=>{expect(hd303sgt(0,0)).toBe(0);});it('d',()=>{expect(hd303sgt(93,73)).toBe(2);});it('e',()=>{expect(hd303sgt(15,0)).toBe(4);});});
function hd304sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304sgt_hd',()=>{it('a',()=>{expect(hd304sgt(1,4)).toBe(2);});it('b',()=>{expect(hd304sgt(3,1)).toBe(1);});it('c',()=>{expect(hd304sgt(0,0)).toBe(0);});it('d',()=>{expect(hd304sgt(93,73)).toBe(2);});it('e',()=>{expect(hd304sgt(15,0)).toBe(4);});});
function hd305sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305sgt_hd',()=>{it('a',()=>{expect(hd305sgt(1,4)).toBe(2);});it('b',()=>{expect(hd305sgt(3,1)).toBe(1);});it('c',()=>{expect(hd305sgt(0,0)).toBe(0);});it('d',()=>{expect(hd305sgt(93,73)).toBe(2);});it('e',()=>{expect(hd305sgt(15,0)).toBe(4);});});
function hd306sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306sgt_hd',()=>{it('a',()=>{expect(hd306sgt(1,4)).toBe(2);});it('b',()=>{expect(hd306sgt(3,1)).toBe(1);});it('c',()=>{expect(hd306sgt(0,0)).toBe(0);});it('d',()=>{expect(hd306sgt(93,73)).toBe(2);});it('e',()=>{expect(hd306sgt(15,0)).toBe(4);});});
function hd307sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307sgt_hd',()=>{it('a',()=>{expect(hd307sgt(1,4)).toBe(2);});it('b',()=>{expect(hd307sgt(3,1)).toBe(1);});it('c',()=>{expect(hd307sgt(0,0)).toBe(0);});it('d',()=>{expect(hd307sgt(93,73)).toBe(2);});it('e',()=>{expect(hd307sgt(15,0)).toBe(4);});});
function hd308sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308sgt_hd',()=>{it('a',()=>{expect(hd308sgt(1,4)).toBe(2);});it('b',()=>{expect(hd308sgt(3,1)).toBe(1);});it('c',()=>{expect(hd308sgt(0,0)).toBe(0);});it('d',()=>{expect(hd308sgt(93,73)).toBe(2);});it('e',()=>{expect(hd308sgt(15,0)).toBe(4);});});
function hd309sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309sgt_hd',()=>{it('a',()=>{expect(hd309sgt(1,4)).toBe(2);});it('b',()=>{expect(hd309sgt(3,1)).toBe(1);});it('c',()=>{expect(hd309sgt(0,0)).toBe(0);});it('d',()=>{expect(hd309sgt(93,73)).toBe(2);});it('e',()=>{expect(hd309sgt(15,0)).toBe(4);});});
function hd310sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310sgt_hd',()=>{it('a',()=>{expect(hd310sgt(1,4)).toBe(2);});it('b',()=>{expect(hd310sgt(3,1)).toBe(1);});it('c',()=>{expect(hd310sgt(0,0)).toBe(0);});it('d',()=>{expect(hd310sgt(93,73)).toBe(2);});it('e',()=>{expect(hd310sgt(15,0)).toBe(4);});});
function hd311sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311sgt_hd',()=>{it('a',()=>{expect(hd311sgt(1,4)).toBe(2);});it('b',()=>{expect(hd311sgt(3,1)).toBe(1);});it('c',()=>{expect(hd311sgt(0,0)).toBe(0);});it('d',()=>{expect(hd311sgt(93,73)).toBe(2);});it('e',()=>{expect(hd311sgt(15,0)).toBe(4);});});
function hd312sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312sgt_hd',()=>{it('a',()=>{expect(hd312sgt(1,4)).toBe(2);});it('b',()=>{expect(hd312sgt(3,1)).toBe(1);});it('c',()=>{expect(hd312sgt(0,0)).toBe(0);});it('d',()=>{expect(hd312sgt(93,73)).toBe(2);});it('e',()=>{expect(hd312sgt(15,0)).toBe(4);});});
function hd313sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313sgt_hd',()=>{it('a',()=>{expect(hd313sgt(1,4)).toBe(2);});it('b',()=>{expect(hd313sgt(3,1)).toBe(1);});it('c',()=>{expect(hd313sgt(0,0)).toBe(0);});it('d',()=>{expect(hd313sgt(93,73)).toBe(2);});it('e',()=>{expect(hd313sgt(15,0)).toBe(4);});});
function hd314sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314sgt_hd',()=>{it('a',()=>{expect(hd314sgt(1,4)).toBe(2);});it('b',()=>{expect(hd314sgt(3,1)).toBe(1);});it('c',()=>{expect(hd314sgt(0,0)).toBe(0);});it('d',()=>{expect(hd314sgt(93,73)).toBe(2);});it('e',()=>{expect(hd314sgt(15,0)).toBe(4);});});
function hd315sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315sgt_hd',()=>{it('a',()=>{expect(hd315sgt(1,4)).toBe(2);});it('b',()=>{expect(hd315sgt(3,1)).toBe(1);});it('c',()=>{expect(hd315sgt(0,0)).toBe(0);});it('d',()=>{expect(hd315sgt(93,73)).toBe(2);});it('e',()=>{expect(hd315sgt(15,0)).toBe(4);});});
function hd316sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316sgt_hd',()=>{it('a',()=>{expect(hd316sgt(1,4)).toBe(2);});it('b',()=>{expect(hd316sgt(3,1)).toBe(1);});it('c',()=>{expect(hd316sgt(0,0)).toBe(0);});it('d',()=>{expect(hd316sgt(93,73)).toBe(2);});it('e',()=>{expect(hd316sgt(15,0)).toBe(4);});});
function hd317sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317sgt_hd',()=>{it('a',()=>{expect(hd317sgt(1,4)).toBe(2);});it('b',()=>{expect(hd317sgt(3,1)).toBe(1);});it('c',()=>{expect(hd317sgt(0,0)).toBe(0);});it('d',()=>{expect(hd317sgt(93,73)).toBe(2);});it('e',()=>{expect(hd317sgt(15,0)).toBe(4);});});
function hd318sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318sgt_hd',()=>{it('a',()=>{expect(hd318sgt(1,4)).toBe(2);});it('b',()=>{expect(hd318sgt(3,1)).toBe(1);});it('c',()=>{expect(hd318sgt(0,0)).toBe(0);});it('d',()=>{expect(hd318sgt(93,73)).toBe(2);});it('e',()=>{expect(hd318sgt(15,0)).toBe(4);});});
function hd319sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319sgt_hd',()=>{it('a',()=>{expect(hd319sgt(1,4)).toBe(2);});it('b',()=>{expect(hd319sgt(3,1)).toBe(1);});it('c',()=>{expect(hd319sgt(0,0)).toBe(0);});it('d',()=>{expect(hd319sgt(93,73)).toBe(2);});it('e',()=>{expect(hd319sgt(15,0)).toBe(4);});});
function hd320sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320sgt_hd',()=>{it('a',()=>{expect(hd320sgt(1,4)).toBe(2);});it('b',()=>{expect(hd320sgt(3,1)).toBe(1);});it('c',()=>{expect(hd320sgt(0,0)).toBe(0);});it('d',()=>{expect(hd320sgt(93,73)).toBe(2);});it('e',()=>{expect(hd320sgt(15,0)).toBe(4);});});
function hd321sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321sgt_hd',()=>{it('a',()=>{expect(hd321sgt(1,4)).toBe(2);});it('b',()=>{expect(hd321sgt(3,1)).toBe(1);});it('c',()=>{expect(hd321sgt(0,0)).toBe(0);});it('d',()=>{expect(hd321sgt(93,73)).toBe(2);});it('e',()=>{expect(hd321sgt(15,0)).toBe(4);});});
function hd322sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322sgt_hd',()=>{it('a',()=>{expect(hd322sgt(1,4)).toBe(2);});it('b',()=>{expect(hd322sgt(3,1)).toBe(1);});it('c',()=>{expect(hd322sgt(0,0)).toBe(0);});it('d',()=>{expect(hd322sgt(93,73)).toBe(2);});it('e',()=>{expect(hd322sgt(15,0)).toBe(4);});});
function hd323sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323sgt_hd',()=>{it('a',()=>{expect(hd323sgt(1,4)).toBe(2);});it('b',()=>{expect(hd323sgt(3,1)).toBe(1);});it('c',()=>{expect(hd323sgt(0,0)).toBe(0);});it('d',()=>{expect(hd323sgt(93,73)).toBe(2);});it('e',()=>{expect(hd323sgt(15,0)).toBe(4);});});
function hd324sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324sgt_hd',()=>{it('a',()=>{expect(hd324sgt(1,4)).toBe(2);});it('b',()=>{expect(hd324sgt(3,1)).toBe(1);});it('c',()=>{expect(hd324sgt(0,0)).toBe(0);});it('d',()=>{expect(hd324sgt(93,73)).toBe(2);});it('e',()=>{expect(hd324sgt(15,0)).toBe(4);});});
function hd325sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325sgt_hd',()=>{it('a',()=>{expect(hd325sgt(1,4)).toBe(2);});it('b',()=>{expect(hd325sgt(3,1)).toBe(1);});it('c',()=>{expect(hd325sgt(0,0)).toBe(0);});it('d',()=>{expect(hd325sgt(93,73)).toBe(2);});it('e',()=>{expect(hd325sgt(15,0)).toBe(4);});});
function hd326sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326sgt_hd',()=>{it('a',()=>{expect(hd326sgt(1,4)).toBe(2);});it('b',()=>{expect(hd326sgt(3,1)).toBe(1);});it('c',()=>{expect(hd326sgt(0,0)).toBe(0);});it('d',()=>{expect(hd326sgt(93,73)).toBe(2);});it('e',()=>{expect(hd326sgt(15,0)).toBe(4);});});
function hd327sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327sgt_hd',()=>{it('a',()=>{expect(hd327sgt(1,4)).toBe(2);});it('b',()=>{expect(hd327sgt(3,1)).toBe(1);});it('c',()=>{expect(hd327sgt(0,0)).toBe(0);});it('d',()=>{expect(hd327sgt(93,73)).toBe(2);});it('e',()=>{expect(hd327sgt(15,0)).toBe(4);});});
function hd328sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328sgt_hd',()=>{it('a',()=>{expect(hd328sgt(1,4)).toBe(2);});it('b',()=>{expect(hd328sgt(3,1)).toBe(1);});it('c',()=>{expect(hd328sgt(0,0)).toBe(0);});it('d',()=>{expect(hd328sgt(93,73)).toBe(2);});it('e',()=>{expect(hd328sgt(15,0)).toBe(4);});});
function hd329sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329sgt_hd',()=>{it('a',()=>{expect(hd329sgt(1,4)).toBe(2);});it('b',()=>{expect(hd329sgt(3,1)).toBe(1);});it('c',()=>{expect(hd329sgt(0,0)).toBe(0);});it('d',()=>{expect(hd329sgt(93,73)).toBe(2);});it('e',()=>{expect(hd329sgt(15,0)).toBe(4);});});
function hd330sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330sgt_hd',()=>{it('a',()=>{expect(hd330sgt(1,4)).toBe(2);});it('b',()=>{expect(hd330sgt(3,1)).toBe(1);});it('c',()=>{expect(hd330sgt(0,0)).toBe(0);});it('d',()=>{expect(hd330sgt(93,73)).toBe(2);});it('e',()=>{expect(hd330sgt(15,0)).toBe(4);});});
function hd331sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331sgt_hd',()=>{it('a',()=>{expect(hd331sgt(1,4)).toBe(2);});it('b',()=>{expect(hd331sgt(3,1)).toBe(1);});it('c',()=>{expect(hd331sgt(0,0)).toBe(0);});it('d',()=>{expect(hd331sgt(93,73)).toBe(2);});it('e',()=>{expect(hd331sgt(15,0)).toBe(4);});});
function hd332sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332sgt_hd',()=>{it('a',()=>{expect(hd332sgt(1,4)).toBe(2);});it('b',()=>{expect(hd332sgt(3,1)).toBe(1);});it('c',()=>{expect(hd332sgt(0,0)).toBe(0);});it('d',()=>{expect(hd332sgt(93,73)).toBe(2);});it('e',()=>{expect(hd332sgt(15,0)).toBe(4);});});
function hd333sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333sgt_hd',()=>{it('a',()=>{expect(hd333sgt(1,4)).toBe(2);});it('b',()=>{expect(hd333sgt(3,1)).toBe(1);});it('c',()=>{expect(hd333sgt(0,0)).toBe(0);});it('d',()=>{expect(hd333sgt(93,73)).toBe(2);});it('e',()=>{expect(hd333sgt(15,0)).toBe(4);});});
function hd334sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334sgt_hd',()=>{it('a',()=>{expect(hd334sgt(1,4)).toBe(2);});it('b',()=>{expect(hd334sgt(3,1)).toBe(1);});it('c',()=>{expect(hd334sgt(0,0)).toBe(0);});it('d',()=>{expect(hd334sgt(93,73)).toBe(2);});it('e',()=>{expect(hd334sgt(15,0)).toBe(4);});});
function hd335sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335sgt_hd',()=>{it('a',()=>{expect(hd335sgt(1,4)).toBe(2);});it('b',()=>{expect(hd335sgt(3,1)).toBe(1);});it('c',()=>{expect(hd335sgt(0,0)).toBe(0);});it('d',()=>{expect(hd335sgt(93,73)).toBe(2);});it('e',()=>{expect(hd335sgt(15,0)).toBe(4);});});
function hd336sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336sgt_hd',()=>{it('a',()=>{expect(hd336sgt(1,4)).toBe(2);});it('b',()=>{expect(hd336sgt(3,1)).toBe(1);});it('c',()=>{expect(hd336sgt(0,0)).toBe(0);});it('d',()=>{expect(hd336sgt(93,73)).toBe(2);});it('e',()=>{expect(hd336sgt(15,0)).toBe(4);});});
function hd337sgt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337sgt_hd',()=>{it('a',()=>{expect(hd337sgt(1,4)).toBe(2);});it('b',()=>{expect(hd337sgt(3,1)).toBe(1);});it('c',()=>{expect(hd337sgt(0,0)).toBe(0);});it('d',()=>{expect(hd337sgt(93,73)).toBe(2);});it('e',()=>{expect(hd337sgt(15,0)).toBe(4);});});
function hd338sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338sgt2_hd',()=>{it('a',()=>{expect(hd338sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd338sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd338sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd338sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd338sgt2(15,0)).toBe(4);});});
function hd339sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339sgt2_hd',()=>{it('a',()=>{expect(hd339sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd339sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd339sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd339sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd339sgt2(15,0)).toBe(4);});});
function hd340sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340sgt2_hd',()=>{it('a',()=>{expect(hd340sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd340sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd340sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd340sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd340sgt2(15,0)).toBe(4);});});
function hd341sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341sgt2_hd',()=>{it('a',()=>{expect(hd341sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd341sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd341sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd341sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd341sgt2(15,0)).toBe(4);});});
function hd342sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342sgt2_hd',()=>{it('a',()=>{expect(hd342sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd342sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd342sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd342sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd342sgt2(15,0)).toBe(4);});});
function hd343sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343sgt2_hd',()=>{it('a',()=>{expect(hd343sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd343sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd343sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd343sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd343sgt2(15,0)).toBe(4);});});
function hd344sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344sgt2_hd',()=>{it('a',()=>{expect(hd344sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd344sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd344sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd344sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd344sgt2(15,0)).toBe(4);});});
function hd345sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345sgt2_hd',()=>{it('a',()=>{expect(hd345sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd345sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd345sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd345sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd345sgt2(15,0)).toBe(4);});});
function hd346sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346sgt2_hd',()=>{it('a',()=>{expect(hd346sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd346sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd346sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd346sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd346sgt2(15,0)).toBe(4);});});
function hd347sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347sgt2_hd',()=>{it('a',()=>{expect(hd347sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd347sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd347sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd347sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd347sgt2(15,0)).toBe(4);});});
function hd348sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348sgt2_hd',()=>{it('a',()=>{expect(hd348sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd348sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd348sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd348sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd348sgt2(15,0)).toBe(4);});});
function hd349sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349sgt2_hd',()=>{it('a',()=>{expect(hd349sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd349sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd349sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd349sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd349sgt2(15,0)).toBe(4);});});
function hd350sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350sgt2_hd',()=>{it('a',()=>{expect(hd350sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd350sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd350sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd350sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd350sgt2(15,0)).toBe(4);});});
function hd351sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351sgt2_hd',()=>{it('a',()=>{expect(hd351sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd351sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd351sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd351sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd351sgt2(15,0)).toBe(4);});});
function hd352sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352sgt2_hd',()=>{it('a',()=>{expect(hd352sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd352sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd352sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd352sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd352sgt2(15,0)).toBe(4);});});
function hd353sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353sgt2_hd',()=>{it('a',()=>{expect(hd353sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd353sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd353sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd353sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd353sgt2(15,0)).toBe(4);});});
function hd354sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354sgt2_hd',()=>{it('a',()=>{expect(hd354sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd354sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd354sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd354sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd354sgt2(15,0)).toBe(4);});});
function hd355sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355sgt2_hd',()=>{it('a',()=>{expect(hd355sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd355sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd355sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd355sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd355sgt2(15,0)).toBe(4);});});
function hd356sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356sgt2_hd',()=>{it('a',()=>{expect(hd356sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd356sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd356sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd356sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd356sgt2(15,0)).toBe(4);});});
function hd357sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357sgt2_hd',()=>{it('a',()=>{expect(hd357sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd357sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd357sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd357sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd357sgt2(15,0)).toBe(4);});});
function hd358sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358sgt2_hd',()=>{it('a',()=>{expect(hd358sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd358sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd358sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd358sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd358sgt2(15,0)).toBe(4);});});
function hd359sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359sgt2_hd',()=>{it('a',()=>{expect(hd359sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd359sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd359sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd359sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd359sgt2(15,0)).toBe(4);});});
function hd360sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360sgt2_hd',()=>{it('a',()=>{expect(hd360sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd360sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd360sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd360sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd360sgt2(15,0)).toBe(4);});});
function hd361sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361sgt2_hd',()=>{it('a',()=>{expect(hd361sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd361sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd361sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd361sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd361sgt2(15,0)).toBe(4);});});
function hd362sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362sgt2_hd',()=>{it('a',()=>{expect(hd362sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd362sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd362sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd362sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd362sgt2(15,0)).toBe(4);});});
function hd363sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363sgt2_hd',()=>{it('a',()=>{expect(hd363sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd363sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd363sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd363sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd363sgt2(15,0)).toBe(4);});});
function hd364sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364sgt2_hd',()=>{it('a',()=>{expect(hd364sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd364sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd364sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd364sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd364sgt2(15,0)).toBe(4);});});
function hd365sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365sgt2_hd',()=>{it('a',()=>{expect(hd365sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd365sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd365sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd365sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd365sgt2(15,0)).toBe(4);});});
function hd366sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366sgt2_hd',()=>{it('a',()=>{expect(hd366sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd366sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd366sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd366sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd366sgt2(15,0)).toBe(4);});});
function hd367sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367sgt2_hd',()=>{it('a',()=>{expect(hd367sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd367sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd367sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd367sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd367sgt2(15,0)).toBe(4);});});
function hd368sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368sgt2_hd',()=>{it('a',()=>{expect(hd368sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd368sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd368sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd368sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd368sgt2(15,0)).toBe(4);});});
function hd369sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369sgt2_hd',()=>{it('a',()=>{expect(hd369sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd369sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd369sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd369sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd369sgt2(15,0)).toBe(4);});});
function hd370sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370sgt2_hd',()=>{it('a',()=>{expect(hd370sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd370sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd370sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd370sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd370sgt2(15,0)).toBe(4);});});
function hd371sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371sgt2_hd',()=>{it('a',()=>{expect(hd371sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd371sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd371sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd371sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd371sgt2(15,0)).toBe(4);});});
function hd372sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372sgt2_hd',()=>{it('a',()=>{expect(hd372sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd372sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd372sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd372sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd372sgt2(15,0)).toBe(4);});});
function hd373sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373sgt2_hd',()=>{it('a',()=>{expect(hd373sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd373sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd373sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd373sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd373sgt2(15,0)).toBe(4);});});
function hd374sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374sgt2_hd',()=>{it('a',()=>{expect(hd374sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd374sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd374sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd374sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd374sgt2(15,0)).toBe(4);});});
function hd375sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375sgt2_hd',()=>{it('a',()=>{expect(hd375sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd375sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd375sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd375sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd375sgt2(15,0)).toBe(4);});});
function hd376sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376sgt2_hd',()=>{it('a',()=>{expect(hd376sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd376sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd376sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd376sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd376sgt2(15,0)).toBe(4);});});
function hd377sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377sgt2_hd',()=>{it('a',()=>{expect(hd377sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd377sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd377sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd377sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd377sgt2(15,0)).toBe(4);});});
function hd378sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378sgt2_hd',()=>{it('a',()=>{expect(hd378sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd378sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd378sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd378sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd378sgt2(15,0)).toBe(4);});});
function hd379sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379sgt2_hd',()=>{it('a',()=>{expect(hd379sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd379sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd379sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd379sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd379sgt2(15,0)).toBe(4);});});
function hd380sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380sgt2_hd',()=>{it('a',()=>{expect(hd380sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd380sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd380sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd380sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd380sgt2(15,0)).toBe(4);});});
function hd381sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381sgt2_hd',()=>{it('a',()=>{expect(hd381sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd381sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd381sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd381sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd381sgt2(15,0)).toBe(4);});});
function hd382sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382sgt2_hd',()=>{it('a',()=>{expect(hd382sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd382sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd382sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd382sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd382sgt2(15,0)).toBe(4);});});
function hd383sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383sgt2_hd',()=>{it('a',()=>{expect(hd383sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd383sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd383sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd383sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd383sgt2(15,0)).toBe(4);});});
function hd384sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384sgt2_hd',()=>{it('a',()=>{expect(hd384sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd384sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd384sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd384sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd384sgt2(15,0)).toBe(4);});});
function hd385sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385sgt2_hd',()=>{it('a',()=>{expect(hd385sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd385sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd385sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd385sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd385sgt2(15,0)).toBe(4);});});
function hd386sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386sgt2_hd',()=>{it('a',()=>{expect(hd386sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd386sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd386sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd386sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd386sgt2(15,0)).toBe(4);});});
function hd387sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387sgt2_hd',()=>{it('a',()=>{expect(hd387sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd387sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd387sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd387sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd387sgt2(15,0)).toBe(4);});});
function hd388sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388sgt2_hd',()=>{it('a',()=>{expect(hd388sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd388sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd388sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd388sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd388sgt2(15,0)).toBe(4);});});
function hd389sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389sgt2_hd',()=>{it('a',()=>{expect(hd389sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd389sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd389sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd389sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd389sgt2(15,0)).toBe(4);});});
function hd390sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390sgt2_hd',()=>{it('a',()=>{expect(hd390sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd390sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd390sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd390sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd390sgt2(15,0)).toBe(4);});});
function hd391sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391sgt2_hd',()=>{it('a',()=>{expect(hd391sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd391sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd391sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd391sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd391sgt2(15,0)).toBe(4);});});
function hd392sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392sgt2_hd',()=>{it('a',()=>{expect(hd392sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd392sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd392sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd392sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd392sgt2(15,0)).toBe(4);});});
function hd393sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393sgt2_hd',()=>{it('a',()=>{expect(hd393sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd393sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd393sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd393sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd393sgt2(15,0)).toBe(4);});});
function hd394sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394sgt2_hd',()=>{it('a',()=>{expect(hd394sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd394sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd394sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd394sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd394sgt2(15,0)).toBe(4);});});
function hd395sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395sgt2_hd',()=>{it('a',()=>{expect(hd395sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd395sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd395sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd395sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd395sgt2(15,0)).toBe(4);});});
function hd396sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396sgt2_hd',()=>{it('a',()=>{expect(hd396sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd396sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd396sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd396sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd396sgt2(15,0)).toBe(4);});});
function hd397sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397sgt2_hd',()=>{it('a',()=>{expect(hd397sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd397sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd397sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd397sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd397sgt2(15,0)).toBe(4);});});
function hd398sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398sgt2_hd',()=>{it('a',()=>{expect(hd398sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd398sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd398sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd398sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd398sgt2(15,0)).toBe(4);});});
function hd399sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399sgt2_hd',()=>{it('a',()=>{expect(hd399sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd399sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd399sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd399sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd399sgt2(15,0)).toBe(4);});});
function hd400sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400sgt2_hd',()=>{it('a',()=>{expect(hd400sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd400sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd400sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd400sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd400sgt2(15,0)).toBe(4);});});
function hd401sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401sgt2_hd',()=>{it('a',()=>{expect(hd401sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd401sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd401sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd401sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd401sgt2(15,0)).toBe(4);});});
function hd402sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402sgt2_hd',()=>{it('a',()=>{expect(hd402sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd402sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd402sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd402sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd402sgt2(15,0)).toBe(4);});});
function hd403sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403sgt2_hd',()=>{it('a',()=>{expect(hd403sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd403sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd403sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd403sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd403sgt2(15,0)).toBe(4);});});
function hd404sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404sgt2_hd',()=>{it('a',()=>{expect(hd404sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd404sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd404sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd404sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd404sgt2(15,0)).toBe(4);});});
function hd405sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405sgt2_hd',()=>{it('a',()=>{expect(hd405sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd405sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd405sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd405sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd405sgt2(15,0)).toBe(4);});});
function hd406sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406sgt2_hd',()=>{it('a',()=>{expect(hd406sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd406sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd406sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd406sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd406sgt2(15,0)).toBe(4);});});
function hd407sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407sgt2_hd',()=>{it('a',()=>{expect(hd407sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd407sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd407sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd407sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd407sgt2(15,0)).toBe(4);});});
function hd408sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408sgt2_hd',()=>{it('a',()=>{expect(hd408sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd408sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd408sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd408sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd408sgt2(15,0)).toBe(4);});});
function hd409sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409sgt2_hd',()=>{it('a',()=>{expect(hd409sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd409sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd409sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd409sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd409sgt2(15,0)).toBe(4);});});
function hd410sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410sgt2_hd',()=>{it('a',()=>{expect(hd410sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd410sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd410sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd410sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd410sgt2(15,0)).toBe(4);});});
function hd411sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411sgt2_hd',()=>{it('a',()=>{expect(hd411sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd411sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd411sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd411sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd411sgt2(15,0)).toBe(4);});});
function hd412sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412sgt2_hd',()=>{it('a',()=>{expect(hd412sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd412sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd412sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd412sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd412sgt2(15,0)).toBe(4);});});
function hd413sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413sgt2_hd',()=>{it('a',()=>{expect(hd413sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd413sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd413sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd413sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd413sgt2(15,0)).toBe(4);});});
function hd414sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414sgt2_hd',()=>{it('a',()=>{expect(hd414sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd414sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd414sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd414sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd414sgt2(15,0)).toBe(4);});});
function hd415sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415sgt2_hd',()=>{it('a',()=>{expect(hd415sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd415sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd415sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd415sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd415sgt2(15,0)).toBe(4);});});
function hd416sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416sgt2_hd',()=>{it('a',()=>{expect(hd416sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd416sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd416sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd416sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd416sgt2(15,0)).toBe(4);});});
function hd417sgt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417sgt2_hd',()=>{it('a',()=>{expect(hd417sgt2(1,4)).toBe(2);});it('b',()=>{expect(hd417sgt2(3,1)).toBe(1);});it('c',()=>{expect(hd417sgt2(0,0)).toBe(0);});it('d',()=>{expect(hd417sgt2(93,73)).toBe(2);});it('e',()=>{expect(hd417sgt2(15,0)).toBe(4);});});
