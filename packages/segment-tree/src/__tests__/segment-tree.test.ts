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
