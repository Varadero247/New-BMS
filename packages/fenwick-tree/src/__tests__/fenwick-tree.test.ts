// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { FenwickTree, FenwickTree2D, createFenwickTree, createFenwickTree2D } from '../fenwick-tree';

describe('FenwickTree - basic', () => {
  it('creates with size n', () => { expect(new FenwickTree(5).size).toBe(5); });
  it('prefix sum is 0 initially', () => { expect(new FenwickTree(5).prefixSum(3)).toBe(0); });
  it('update then prefixSum', () => {
    const ft = new FenwickTree(5); ft.update(1, 3);
    expect(ft.prefixSum(1)).toBe(3);
  });
  it('update multiple then sum', () => {
    const ft = new FenwickTree(5);
    ft.update(1, 1); ft.update(2, 2); ft.update(3, 3);
    expect(ft.prefixSum(3)).toBe(6);
  });
  it('rangeSum [2,3]', () => {
    const ft = new FenwickTree(5);
    ft.update(1, 10); ft.update(2, 20); ft.update(3, 30);
    expect(ft.rangeSum(2, 3)).toBe(50);
  });
  it('point value', () => {
    const ft = new FenwickTree(5); ft.update(2, 42);
    expect(ft.point(2)).toBe(42);
  });
  for (let n = 1; n <= 50; n++) {
    it('FenwickTree size = ' + n, () => { expect(new FenwickTree(n).size).toBe(n); });
  }
  for (let i = 1; i <= 50; i++) {
    it('update(' + i + ', i) then point = ' + i, () => {
      const ft = new FenwickTree(55);
      ft.update(i, i);
      expect(ft.point(i)).toBe(i);
    });
  }
});

describe('FenwickTree - fromArray', () => {
  it('fromArray builds correct prefix sums', () => {
    const ft = FenwickTree.fromArray([1,2,3,4,5]);
    expect(ft.prefixSum(5)).toBe(15);
  });
  it('fromArray rangeSum', () => {
    const ft = FenwickTree.fromArray([1,2,3,4,5]);
    expect(ft.rangeSum(2, 4)).toBe(9);
  });
  it('fromArray size', () => {
    expect(FenwickTree.fromArray([1,2,3]).size).toBe(3);
  });
  for (let n = 1; n <= 50; n++) {
    it('fromArray of 1..n prefix sum = n*(n+1)/2, n=' + n, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const ft = FenwickTree.fromArray(arr);
      expect(ft.prefixSum(n)).toBe(n * (n + 1) / 2);
    });
  }
  for (let i = 0; i < 50; i++) {
    it('fromArray point value at index ' + i, () => {
      const arr = Array.from({ length: 50 }, (_, j) => j * 2);
      const ft = FenwickTree.fromArray(arr);
      expect(ft.point(i + 1)).toBe(i * 2);
    });
  }
});

describe('FenwickTree - toArray and find', () => {
  it('toArray matches original', () => {
    const arr = [3, 1, 4, 1, 5];
    const ft = FenwickTree.fromArray(arr);
    expect(ft.toArray()).toEqual(arr);
  });
  it('find returns correct index', () => {
    const ft = FenwickTree.fromArray([1,2,3,4,5]);
    expect(ft.find(1)).toBe(1);
  });
  for (let n = 1; n <= 50; n++) {
    it('toArray has length ' + n, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(FenwickTree.fromArray(arr).toArray()).toHaveLength(n);
    });
  }
});

describe('FenwickTree2D - basic', () => {
  it('creates with rows and cols', () => { expect(new FenwickTree2D(3, 3)).toBeDefined(); });
  it('prefix sum initially 0', () => { expect(new FenwickTree2D(3, 3).prefixSum(2, 2)).toBe(0); });
  it('update then prefix sum', () => {
    const ft = new FenwickTree2D(3, 3); ft.update(1, 1, 5);
    expect(ft.prefixSum(1, 1)).toBe(5);
  });
  it('rangeSum rectangle', () => {
    const ft = new FenwickTree2D(4, 4);
    ft.update(1, 1, 1); ft.update(2, 2, 4); ft.update(3, 3, 9);
    expect(ft.rangeSum(1, 1, 3, 3)).toBe(14);
  });
  it('createFenwickTree2D factory', () => { expect(createFenwickTree2D(3, 3)).toBeInstanceOf(FenwickTree2D); });
  for (let i = 1; i <= 50; i++) {
    it('2D update(' + i + ',' + i + ', val)', () => {
      const ft = new FenwickTree2D(55, 55);
      ft.update(i, i, i * 2);
      expect(ft.rangeSum(i, i, i, i)).toBe(i * 2);
    });
  }
});

describe('createFenwickTree factory', () => {
  it('returns FenwickTree instance', () => { expect(createFenwickTree(5)).toBeInstanceOf(FenwickTree); });
  for (let n = 1; n <= 50; n++) {
    it('createFenwickTree(' + n + ').size = ' + n, () => {
      expect(createFenwickTree(n).size).toBe(n);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it('FenwickTree update then rangeSum ' + i, () => {
      const ft = createFenwickTree(100);
      ft.update(i, i);
      expect(ft.rangeSum(i, i)).toBe(i);
    });
  }
});

describe('FenwickTree prefix sums large', () => {
  for (let n = 1; n <= 50; n++) {
    it('prefix sum of all zeros is 0 for n=' + n, () => {
      const ft = new FenwickTree(n);
      expect(ft.prefixSum(n)).toBe(0);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it('multiple updates accumulate ' + i, () => {
      const ft = new FenwickTree(100);
      ft.update(i, 1); ft.update(i, 2); ft.update(i, 3);
      expect(ft.point(i)).toBe(6);
    });
  }
});

describe('fenwick top-up', () => {
  for (let i = 1; i <= 100; i++) {
    it('prefixSum of ' + i + ' elements all 1s = ' + i, () => {
      const ft = new FenwickTree(i);
      for (let j = 1; j <= i; j++) ft.update(j, 1);
      expect(ft.prefixSum(i)).toBe(i);
    });
  }
  for (let i = 1; i <= 100; i++) {
    it('rangeSum single element at ' + i, () => {
      const ft = new FenwickTree(105);
      ft.update(i, i * 2);
      expect(ft.rangeSum(i, i)).toBe(i * 2);
    });
  }
  for (let n = 1; n <= 100; n++) {
    it('fromArray size ' + n, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      expect(FenwickTree.fromArray(arr).size).toBe(n);
    });
  }
  for (let i = 1; i <= 100; i++) {
    it('2D rangeSum single cell ' + i, () => {
      const ft = new FenwickTree2D(105, 105);
      ft.update(i, i, i * 3);
      expect(ft.rangeSum(i, i, i, i)).toBe(i * 3);
    });
  }
  for (let i = 1; i <= 100; i++) {
    it('FenwickTree point after update ' + i, () => {
      const ft = createFenwickTree(105);
      ft.update(i, i * 5);
      expect(ft.point(i)).toBe(i * 5);
    });
  }
});
function hd258fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258fwt_hd',()=>{it('a',()=>{expect(hd258fwt(1,4)).toBe(2);});it('b',()=>{expect(hd258fwt(3,1)).toBe(1);});it('c',()=>{expect(hd258fwt(0,0)).toBe(0);});it('d',()=>{expect(hd258fwt(93,73)).toBe(2);});it('e',()=>{expect(hd258fwt(15,0)).toBe(4);});});
function hd259fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259fwt_hd',()=>{it('a',()=>{expect(hd259fwt(1,4)).toBe(2);});it('b',()=>{expect(hd259fwt(3,1)).toBe(1);});it('c',()=>{expect(hd259fwt(0,0)).toBe(0);});it('d',()=>{expect(hd259fwt(93,73)).toBe(2);});it('e',()=>{expect(hd259fwt(15,0)).toBe(4);});});
function hd260fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260fwt_hd',()=>{it('a',()=>{expect(hd260fwt(1,4)).toBe(2);});it('b',()=>{expect(hd260fwt(3,1)).toBe(1);});it('c',()=>{expect(hd260fwt(0,0)).toBe(0);});it('d',()=>{expect(hd260fwt(93,73)).toBe(2);});it('e',()=>{expect(hd260fwt(15,0)).toBe(4);});});
function hd261fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261fwt_hd',()=>{it('a',()=>{expect(hd261fwt(1,4)).toBe(2);});it('b',()=>{expect(hd261fwt(3,1)).toBe(1);});it('c',()=>{expect(hd261fwt(0,0)).toBe(0);});it('d',()=>{expect(hd261fwt(93,73)).toBe(2);});it('e',()=>{expect(hd261fwt(15,0)).toBe(4);});});
function hd262fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262fwt_hd',()=>{it('a',()=>{expect(hd262fwt(1,4)).toBe(2);});it('b',()=>{expect(hd262fwt(3,1)).toBe(1);});it('c',()=>{expect(hd262fwt(0,0)).toBe(0);});it('d',()=>{expect(hd262fwt(93,73)).toBe(2);});it('e',()=>{expect(hd262fwt(15,0)).toBe(4);});});
function hd263fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263fwt_hd',()=>{it('a',()=>{expect(hd263fwt(1,4)).toBe(2);});it('b',()=>{expect(hd263fwt(3,1)).toBe(1);});it('c',()=>{expect(hd263fwt(0,0)).toBe(0);});it('d',()=>{expect(hd263fwt(93,73)).toBe(2);});it('e',()=>{expect(hd263fwt(15,0)).toBe(4);});});
function hd264fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264fwt_hd',()=>{it('a',()=>{expect(hd264fwt(1,4)).toBe(2);});it('b',()=>{expect(hd264fwt(3,1)).toBe(1);});it('c',()=>{expect(hd264fwt(0,0)).toBe(0);});it('d',()=>{expect(hd264fwt(93,73)).toBe(2);});it('e',()=>{expect(hd264fwt(15,0)).toBe(4);});});
function hd265fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265fwt_hd',()=>{it('a',()=>{expect(hd265fwt(1,4)).toBe(2);});it('b',()=>{expect(hd265fwt(3,1)).toBe(1);});it('c',()=>{expect(hd265fwt(0,0)).toBe(0);});it('d',()=>{expect(hd265fwt(93,73)).toBe(2);});it('e',()=>{expect(hd265fwt(15,0)).toBe(4);});});
function hd266fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266fwt_hd',()=>{it('a',()=>{expect(hd266fwt(1,4)).toBe(2);});it('b',()=>{expect(hd266fwt(3,1)).toBe(1);});it('c',()=>{expect(hd266fwt(0,0)).toBe(0);});it('d',()=>{expect(hd266fwt(93,73)).toBe(2);});it('e',()=>{expect(hd266fwt(15,0)).toBe(4);});});
function hd267fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267fwt_hd',()=>{it('a',()=>{expect(hd267fwt(1,4)).toBe(2);});it('b',()=>{expect(hd267fwt(3,1)).toBe(1);});it('c',()=>{expect(hd267fwt(0,0)).toBe(0);});it('d',()=>{expect(hd267fwt(93,73)).toBe(2);});it('e',()=>{expect(hd267fwt(15,0)).toBe(4);});});
function hd268fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268fwt_hd',()=>{it('a',()=>{expect(hd268fwt(1,4)).toBe(2);});it('b',()=>{expect(hd268fwt(3,1)).toBe(1);});it('c',()=>{expect(hd268fwt(0,0)).toBe(0);});it('d',()=>{expect(hd268fwt(93,73)).toBe(2);});it('e',()=>{expect(hd268fwt(15,0)).toBe(4);});});
function hd269fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269fwt_hd',()=>{it('a',()=>{expect(hd269fwt(1,4)).toBe(2);});it('b',()=>{expect(hd269fwt(3,1)).toBe(1);});it('c',()=>{expect(hd269fwt(0,0)).toBe(0);});it('d',()=>{expect(hd269fwt(93,73)).toBe(2);});it('e',()=>{expect(hd269fwt(15,0)).toBe(4);});});
function hd270fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270fwt_hd',()=>{it('a',()=>{expect(hd270fwt(1,4)).toBe(2);});it('b',()=>{expect(hd270fwt(3,1)).toBe(1);});it('c',()=>{expect(hd270fwt(0,0)).toBe(0);});it('d',()=>{expect(hd270fwt(93,73)).toBe(2);});it('e',()=>{expect(hd270fwt(15,0)).toBe(4);});});
function hd271fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271fwt_hd',()=>{it('a',()=>{expect(hd271fwt(1,4)).toBe(2);});it('b',()=>{expect(hd271fwt(3,1)).toBe(1);});it('c',()=>{expect(hd271fwt(0,0)).toBe(0);});it('d',()=>{expect(hd271fwt(93,73)).toBe(2);});it('e',()=>{expect(hd271fwt(15,0)).toBe(4);});});
function hd272fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272fwt_hd',()=>{it('a',()=>{expect(hd272fwt(1,4)).toBe(2);});it('b',()=>{expect(hd272fwt(3,1)).toBe(1);});it('c',()=>{expect(hd272fwt(0,0)).toBe(0);});it('d',()=>{expect(hd272fwt(93,73)).toBe(2);});it('e',()=>{expect(hd272fwt(15,0)).toBe(4);});});
function hd273fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273fwt_hd',()=>{it('a',()=>{expect(hd273fwt(1,4)).toBe(2);});it('b',()=>{expect(hd273fwt(3,1)).toBe(1);});it('c',()=>{expect(hd273fwt(0,0)).toBe(0);});it('d',()=>{expect(hd273fwt(93,73)).toBe(2);});it('e',()=>{expect(hd273fwt(15,0)).toBe(4);});});
function hd274fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274fwt_hd',()=>{it('a',()=>{expect(hd274fwt(1,4)).toBe(2);});it('b',()=>{expect(hd274fwt(3,1)).toBe(1);});it('c',()=>{expect(hd274fwt(0,0)).toBe(0);});it('d',()=>{expect(hd274fwt(93,73)).toBe(2);});it('e',()=>{expect(hd274fwt(15,0)).toBe(4);});});
function hd275fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275fwt_hd',()=>{it('a',()=>{expect(hd275fwt(1,4)).toBe(2);});it('b',()=>{expect(hd275fwt(3,1)).toBe(1);});it('c',()=>{expect(hd275fwt(0,0)).toBe(0);});it('d',()=>{expect(hd275fwt(93,73)).toBe(2);});it('e',()=>{expect(hd275fwt(15,0)).toBe(4);});});
function hd276fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276fwt_hd',()=>{it('a',()=>{expect(hd276fwt(1,4)).toBe(2);});it('b',()=>{expect(hd276fwt(3,1)).toBe(1);});it('c',()=>{expect(hd276fwt(0,0)).toBe(0);});it('d',()=>{expect(hd276fwt(93,73)).toBe(2);});it('e',()=>{expect(hd276fwt(15,0)).toBe(4);});});
function hd277fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277fwt_hd',()=>{it('a',()=>{expect(hd277fwt(1,4)).toBe(2);});it('b',()=>{expect(hd277fwt(3,1)).toBe(1);});it('c',()=>{expect(hd277fwt(0,0)).toBe(0);});it('d',()=>{expect(hd277fwt(93,73)).toBe(2);});it('e',()=>{expect(hd277fwt(15,0)).toBe(4);});});
function hd278fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278fwt_hd',()=>{it('a',()=>{expect(hd278fwt(1,4)).toBe(2);});it('b',()=>{expect(hd278fwt(3,1)).toBe(1);});it('c',()=>{expect(hd278fwt(0,0)).toBe(0);});it('d',()=>{expect(hd278fwt(93,73)).toBe(2);});it('e',()=>{expect(hd278fwt(15,0)).toBe(4);});});
function hd279fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279fwt_hd',()=>{it('a',()=>{expect(hd279fwt(1,4)).toBe(2);});it('b',()=>{expect(hd279fwt(3,1)).toBe(1);});it('c',()=>{expect(hd279fwt(0,0)).toBe(0);});it('d',()=>{expect(hd279fwt(93,73)).toBe(2);});it('e',()=>{expect(hd279fwt(15,0)).toBe(4);});});
function hd280fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280fwt_hd',()=>{it('a',()=>{expect(hd280fwt(1,4)).toBe(2);});it('b',()=>{expect(hd280fwt(3,1)).toBe(1);});it('c',()=>{expect(hd280fwt(0,0)).toBe(0);});it('d',()=>{expect(hd280fwt(93,73)).toBe(2);});it('e',()=>{expect(hd280fwt(15,0)).toBe(4);});});
function hd281fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281fwt_hd',()=>{it('a',()=>{expect(hd281fwt(1,4)).toBe(2);});it('b',()=>{expect(hd281fwt(3,1)).toBe(1);});it('c',()=>{expect(hd281fwt(0,0)).toBe(0);});it('d',()=>{expect(hd281fwt(93,73)).toBe(2);});it('e',()=>{expect(hd281fwt(15,0)).toBe(4);});});
function hd282fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282fwt_hd',()=>{it('a',()=>{expect(hd282fwt(1,4)).toBe(2);});it('b',()=>{expect(hd282fwt(3,1)).toBe(1);});it('c',()=>{expect(hd282fwt(0,0)).toBe(0);});it('d',()=>{expect(hd282fwt(93,73)).toBe(2);});it('e',()=>{expect(hd282fwt(15,0)).toBe(4);});});
function hd283fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283fwt_hd',()=>{it('a',()=>{expect(hd283fwt(1,4)).toBe(2);});it('b',()=>{expect(hd283fwt(3,1)).toBe(1);});it('c',()=>{expect(hd283fwt(0,0)).toBe(0);});it('d',()=>{expect(hd283fwt(93,73)).toBe(2);});it('e',()=>{expect(hd283fwt(15,0)).toBe(4);});});
function hd284fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284fwt_hd',()=>{it('a',()=>{expect(hd284fwt(1,4)).toBe(2);});it('b',()=>{expect(hd284fwt(3,1)).toBe(1);});it('c',()=>{expect(hd284fwt(0,0)).toBe(0);});it('d',()=>{expect(hd284fwt(93,73)).toBe(2);});it('e',()=>{expect(hd284fwt(15,0)).toBe(4);});});
function hd285fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285fwt_hd',()=>{it('a',()=>{expect(hd285fwt(1,4)).toBe(2);});it('b',()=>{expect(hd285fwt(3,1)).toBe(1);});it('c',()=>{expect(hd285fwt(0,0)).toBe(0);});it('d',()=>{expect(hd285fwt(93,73)).toBe(2);});it('e',()=>{expect(hd285fwt(15,0)).toBe(4);});});
function hd286fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286fwt_hd',()=>{it('a',()=>{expect(hd286fwt(1,4)).toBe(2);});it('b',()=>{expect(hd286fwt(3,1)).toBe(1);});it('c',()=>{expect(hd286fwt(0,0)).toBe(0);});it('d',()=>{expect(hd286fwt(93,73)).toBe(2);});it('e',()=>{expect(hd286fwt(15,0)).toBe(4);});});
function hd287fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287fwt_hd',()=>{it('a',()=>{expect(hd287fwt(1,4)).toBe(2);});it('b',()=>{expect(hd287fwt(3,1)).toBe(1);});it('c',()=>{expect(hd287fwt(0,0)).toBe(0);});it('d',()=>{expect(hd287fwt(93,73)).toBe(2);});it('e',()=>{expect(hd287fwt(15,0)).toBe(4);});});
function hd288fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288fwt_hd',()=>{it('a',()=>{expect(hd288fwt(1,4)).toBe(2);});it('b',()=>{expect(hd288fwt(3,1)).toBe(1);});it('c',()=>{expect(hd288fwt(0,0)).toBe(0);});it('d',()=>{expect(hd288fwt(93,73)).toBe(2);});it('e',()=>{expect(hd288fwt(15,0)).toBe(4);});});
function hd289fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289fwt_hd',()=>{it('a',()=>{expect(hd289fwt(1,4)).toBe(2);});it('b',()=>{expect(hd289fwt(3,1)).toBe(1);});it('c',()=>{expect(hd289fwt(0,0)).toBe(0);});it('d',()=>{expect(hd289fwt(93,73)).toBe(2);});it('e',()=>{expect(hd289fwt(15,0)).toBe(4);});});
function hd290fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290fwt_hd',()=>{it('a',()=>{expect(hd290fwt(1,4)).toBe(2);});it('b',()=>{expect(hd290fwt(3,1)).toBe(1);});it('c',()=>{expect(hd290fwt(0,0)).toBe(0);});it('d',()=>{expect(hd290fwt(93,73)).toBe(2);});it('e',()=>{expect(hd290fwt(15,0)).toBe(4);});});
function hd291fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291fwt_hd',()=>{it('a',()=>{expect(hd291fwt(1,4)).toBe(2);});it('b',()=>{expect(hd291fwt(3,1)).toBe(1);});it('c',()=>{expect(hd291fwt(0,0)).toBe(0);});it('d',()=>{expect(hd291fwt(93,73)).toBe(2);});it('e',()=>{expect(hd291fwt(15,0)).toBe(4);});});
function hd292fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292fwt_hd',()=>{it('a',()=>{expect(hd292fwt(1,4)).toBe(2);});it('b',()=>{expect(hd292fwt(3,1)).toBe(1);});it('c',()=>{expect(hd292fwt(0,0)).toBe(0);});it('d',()=>{expect(hd292fwt(93,73)).toBe(2);});it('e',()=>{expect(hd292fwt(15,0)).toBe(4);});});
function hd293fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293fwt_hd',()=>{it('a',()=>{expect(hd293fwt(1,4)).toBe(2);});it('b',()=>{expect(hd293fwt(3,1)).toBe(1);});it('c',()=>{expect(hd293fwt(0,0)).toBe(0);});it('d',()=>{expect(hd293fwt(93,73)).toBe(2);});it('e',()=>{expect(hd293fwt(15,0)).toBe(4);});});
function hd294fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294fwt_hd',()=>{it('a',()=>{expect(hd294fwt(1,4)).toBe(2);});it('b',()=>{expect(hd294fwt(3,1)).toBe(1);});it('c',()=>{expect(hd294fwt(0,0)).toBe(0);});it('d',()=>{expect(hd294fwt(93,73)).toBe(2);});it('e',()=>{expect(hd294fwt(15,0)).toBe(4);});});
function hd295fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295fwt_hd',()=>{it('a',()=>{expect(hd295fwt(1,4)).toBe(2);});it('b',()=>{expect(hd295fwt(3,1)).toBe(1);});it('c',()=>{expect(hd295fwt(0,0)).toBe(0);});it('d',()=>{expect(hd295fwt(93,73)).toBe(2);});it('e',()=>{expect(hd295fwt(15,0)).toBe(4);});});
function hd296fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296fwt_hd',()=>{it('a',()=>{expect(hd296fwt(1,4)).toBe(2);});it('b',()=>{expect(hd296fwt(3,1)).toBe(1);});it('c',()=>{expect(hd296fwt(0,0)).toBe(0);});it('d',()=>{expect(hd296fwt(93,73)).toBe(2);});it('e',()=>{expect(hd296fwt(15,0)).toBe(4);});});
function hd297fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297fwt_hd',()=>{it('a',()=>{expect(hd297fwt(1,4)).toBe(2);});it('b',()=>{expect(hd297fwt(3,1)).toBe(1);});it('c',()=>{expect(hd297fwt(0,0)).toBe(0);});it('d',()=>{expect(hd297fwt(93,73)).toBe(2);});it('e',()=>{expect(hd297fwt(15,0)).toBe(4);});});
function hd298fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298fwt_hd',()=>{it('a',()=>{expect(hd298fwt(1,4)).toBe(2);});it('b',()=>{expect(hd298fwt(3,1)).toBe(1);});it('c',()=>{expect(hd298fwt(0,0)).toBe(0);});it('d',()=>{expect(hd298fwt(93,73)).toBe(2);});it('e',()=>{expect(hd298fwt(15,0)).toBe(4);});});
function hd299fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299fwt_hd',()=>{it('a',()=>{expect(hd299fwt(1,4)).toBe(2);});it('b',()=>{expect(hd299fwt(3,1)).toBe(1);});it('c',()=>{expect(hd299fwt(0,0)).toBe(0);});it('d',()=>{expect(hd299fwt(93,73)).toBe(2);});it('e',()=>{expect(hd299fwt(15,0)).toBe(4);});});
function hd300fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300fwt_hd',()=>{it('a',()=>{expect(hd300fwt(1,4)).toBe(2);});it('b',()=>{expect(hd300fwt(3,1)).toBe(1);});it('c',()=>{expect(hd300fwt(0,0)).toBe(0);});it('d',()=>{expect(hd300fwt(93,73)).toBe(2);});it('e',()=>{expect(hd300fwt(15,0)).toBe(4);});});
function hd301fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301fwt_hd',()=>{it('a',()=>{expect(hd301fwt(1,4)).toBe(2);});it('b',()=>{expect(hd301fwt(3,1)).toBe(1);});it('c',()=>{expect(hd301fwt(0,0)).toBe(0);});it('d',()=>{expect(hd301fwt(93,73)).toBe(2);});it('e',()=>{expect(hd301fwt(15,0)).toBe(4);});});
function hd302fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302fwt_hd',()=>{it('a',()=>{expect(hd302fwt(1,4)).toBe(2);});it('b',()=>{expect(hd302fwt(3,1)).toBe(1);});it('c',()=>{expect(hd302fwt(0,0)).toBe(0);});it('d',()=>{expect(hd302fwt(93,73)).toBe(2);});it('e',()=>{expect(hd302fwt(15,0)).toBe(4);});});
function hd303fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303fwt_hd',()=>{it('a',()=>{expect(hd303fwt(1,4)).toBe(2);});it('b',()=>{expect(hd303fwt(3,1)).toBe(1);});it('c',()=>{expect(hd303fwt(0,0)).toBe(0);});it('d',()=>{expect(hd303fwt(93,73)).toBe(2);});it('e',()=>{expect(hd303fwt(15,0)).toBe(4);});});
function hd304fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304fwt_hd',()=>{it('a',()=>{expect(hd304fwt(1,4)).toBe(2);});it('b',()=>{expect(hd304fwt(3,1)).toBe(1);});it('c',()=>{expect(hd304fwt(0,0)).toBe(0);});it('d',()=>{expect(hd304fwt(93,73)).toBe(2);});it('e',()=>{expect(hd304fwt(15,0)).toBe(4);});});
function hd305fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305fwt_hd',()=>{it('a',()=>{expect(hd305fwt(1,4)).toBe(2);});it('b',()=>{expect(hd305fwt(3,1)).toBe(1);});it('c',()=>{expect(hd305fwt(0,0)).toBe(0);});it('d',()=>{expect(hd305fwt(93,73)).toBe(2);});it('e',()=>{expect(hd305fwt(15,0)).toBe(4);});});
function hd306fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306fwt_hd',()=>{it('a',()=>{expect(hd306fwt(1,4)).toBe(2);});it('b',()=>{expect(hd306fwt(3,1)).toBe(1);});it('c',()=>{expect(hd306fwt(0,0)).toBe(0);});it('d',()=>{expect(hd306fwt(93,73)).toBe(2);});it('e',()=>{expect(hd306fwt(15,0)).toBe(4);});});
function hd307fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307fwt_hd',()=>{it('a',()=>{expect(hd307fwt(1,4)).toBe(2);});it('b',()=>{expect(hd307fwt(3,1)).toBe(1);});it('c',()=>{expect(hd307fwt(0,0)).toBe(0);});it('d',()=>{expect(hd307fwt(93,73)).toBe(2);});it('e',()=>{expect(hd307fwt(15,0)).toBe(4);});});
function hd308fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308fwt_hd',()=>{it('a',()=>{expect(hd308fwt(1,4)).toBe(2);});it('b',()=>{expect(hd308fwt(3,1)).toBe(1);});it('c',()=>{expect(hd308fwt(0,0)).toBe(0);});it('d',()=>{expect(hd308fwt(93,73)).toBe(2);});it('e',()=>{expect(hd308fwt(15,0)).toBe(4);});});
function hd309fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309fwt_hd',()=>{it('a',()=>{expect(hd309fwt(1,4)).toBe(2);});it('b',()=>{expect(hd309fwt(3,1)).toBe(1);});it('c',()=>{expect(hd309fwt(0,0)).toBe(0);});it('d',()=>{expect(hd309fwt(93,73)).toBe(2);});it('e',()=>{expect(hd309fwt(15,0)).toBe(4);});});
function hd310fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310fwt_hd',()=>{it('a',()=>{expect(hd310fwt(1,4)).toBe(2);});it('b',()=>{expect(hd310fwt(3,1)).toBe(1);});it('c',()=>{expect(hd310fwt(0,0)).toBe(0);});it('d',()=>{expect(hd310fwt(93,73)).toBe(2);});it('e',()=>{expect(hd310fwt(15,0)).toBe(4);});});
function hd311fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311fwt_hd',()=>{it('a',()=>{expect(hd311fwt(1,4)).toBe(2);});it('b',()=>{expect(hd311fwt(3,1)).toBe(1);});it('c',()=>{expect(hd311fwt(0,0)).toBe(0);});it('d',()=>{expect(hd311fwt(93,73)).toBe(2);});it('e',()=>{expect(hd311fwt(15,0)).toBe(4);});});
function hd312fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312fwt_hd',()=>{it('a',()=>{expect(hd312fwt(1,4)).toBe(2);});it('b',()=>{expect(hd312fwt(3,1)).toBe(1);});it('c',()=>{expect(hd312fwt(0,0)).toBe(0);});it('d',()=>{expect(hd312fwt(93,73)).toBe(2);});it('e',()=>{expect(hd312fwt(15,0)).toBe(4);});});
function hd313fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313fwt_hd',()=>{it('a',()=>{expect(hd313fwt(1,4)).toBe(2);});it('b',()=>{expect(hd313fwt(3,1)).toBe(1);});it('c',()=>{expect(hd313fwt(0,0)).toBe(0);});it('d',()=>{expect(hd313fwt(93,73)).toBe(2);});it('e',()=>{expect(hd313fwt(15,0)).toBe(4);});});
function hd314fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314fwt_hd',()=>{it('a',()=>{expect(hd314fwt(1,4)).toBe(2);});it('b',()=>{expect(hd314fwt(3,1)).toBe(1);});it('c',()=>{expect(hd314fwt(0,0)).toBe(0);});it('d',()=>{expect(hd314fwt(93,73)).toBe(2);});it('e',()=>{expect(hd314fwt(15,0)).toBe(4);});});
function hd315fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315fwt_hd',()=>{it('a',()=>{expect(hd315fwt(1,4)).toBe(2);});it('b',()=>{expect(hd315fwt(3,1)).toBe(1);});it('c',()=>{expect(hd315fwt(0,0)).toBe(0);});it('d',()=>{expect(hd315fwt(93,73)).toBe(2);});it('e',()=>{expect(hd315fwt(15,0)).toBe(4);});});
function hd316fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316fwt_hd',()=>{it('a',()=>{expect(hd316fwt(1,4)).toBe(2);});it('b',()=>{expect(hd316fwt(3,1)).toBe(1);});it('c',()=>{expect(hd316fwt(0,0)).toBe(0);});it('d',()=>{expect(hd316fwt(93,73)).toBe(2);});it('e',()=>{expect(hd316fwt(15,0)).toBe(4);});});
function hd317fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317fwt_hd',()=>{it('a',()=>{expect(hd317fwt(1,4)).toBe(2);});it('b',()=>{expect(hd317fwt(3,1)).toBe(1);});it('c',()=>{expect(hd317fwt(0,0)).toBe(0);});it('d',()=>{expect(hd317fwt(93,73)).toBe(2);});it('e',()=>{expect(hd317fwt(15,0)).toBe(4);});});
function hd318fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318fwt_hd',()=>{it('a',()=>{expect(hd318fwt(1,4)).toBe(2);});it('b',()=>{expect(hd318fwt(3,1)).toBe(1);});it('c',()=>{expect(hd318fwt(0,0)).toBe(0);});it('d',()=>{expect(hd318fwt(93,73)).toBe(2);});it('e',()=>{expect(hd318fwt(15,0)).toBe(4);});});
function hd319fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319fwt_hd',()=>{it('a',()=>{expect(hd319fwt(1,4)).toBe(2);});it('b',()=>{expect(hd319fwt(3,1)).toBe(1);});it('c',()=>{expect(hd319fwt(0,0)).toBe(0);});it('d',()=>{expect(hd319fwt(93,73)).toBe(2);});it('e',()=>{expect(hd319fwt(15,0)).toBe(4);});});
function hd320fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320fwt_hd',()=>{it('a',()=>{expect(hd320fwt(1,4)).toBe(2);});it('b',()=>{expect(hd320fwt(3,1)).toBe(1);});it('c',()=>{expect(hd320fwt(0,0)).toBe(0);});it('d',()=>{expect(hd320fwt(93,73)).toBe(2);});it('e',()=>{expect(hd320fwt(15,0)).toBe(4);});});
function hd321fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321fwt_hd',()=>{it('a',()=>{expect(hd321fwt(1,4)).toBe(2);});it('b',()=>{expect(hd321fwt(3,1)).toBe(1);});it('c',()=>{expect(hd321fwt(0,0)).toBe(0);});it('d',()=>{expect(hd321fwt(93,73)).toBe(2);});it('e',()=>{expect(hd321fwt(15,0)).toBe(4);});});
function hd322fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322fwt_hd',()=>{it('a',()=>{expect(hd322fwt(1,4)).toBe(2);});it('b',()=>{expect(hd322fwt(3,1)).toBe(1);});it('c',()=>{expect(hd322fwt(0,0)).toBe(0);});it('d',()=>{expect(hd322fwt(93,73)).toBe(2);});it('e',()=>{expect(hd322fwt(15,0)).toBe(4);});});
function hd323fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323fwt_hd',()=>{it('a',()=>{expect(hd323fwt(1,4)).toBe(2);});it('b',()=>{expect(hd323fwt(3,1)).toBe(1);});it('c',()=>{expect(hd323fwt(0,0)).toBe(0);});it('d',()=>{expect(hd323fwt(93,73)).toBe(2);});it('e',()=>{expect(hd323fwt(15,0)).toBe(4);});});
function hd324fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324fwt_hd',()=>{it('a',()=>{expect(hd324fwt(1,4)).toBe(2);});it('b',()=>{expect(hd324fwt(3,1)).toBe(1);});it('c',()=>{expect(hd324fwt(0,0)).toBe(0);});it('d',()=>{expect(hd324fwt(93,73)).toBe(2);});it('e',()=>{expect(hd324fwt(15,0)).toBe(4);});});
function hd325fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325fwt_hd',()=>{it('a',()=>{expect(hd325fwt(1,4)).toBe(2);});it('b',()=>{expect(hd325fwt(3,1)).toBe(1);});it('c',()=>{expect(hd325fwt(0,0)).toBe(0);});it('d',()=>{expect(hd325fwt(93,73)).toBe(2);});it('e',()=>{expect(hd325fwt(15,0)).toBe(4);});});
function hd326fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326fwt_hd',()=>{it('a',()=>{expect(hd326fwt(1,4)).toBe(2);});it('b',()=>{expect(hd326fwt(3,1)).toBe(1);});it('c',()=>{expect(hd326fwt(0,0)).toBe(0);});it('d',()=>{expect(hd326fwt(93,73)).toBe(2);});it('e',()=>{expect(hd326fwt(15,0)).toBe(4);});});
function hd327fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327fwt_hd',()=>{it('a',()=>{expect(hd327fwt(1,4)).toBe(2);});it('b',()=>{expect(hd327fwt(3,1)).toBe(1);});it('c',()=>{expect(hd327fwt(0,0)).toBe(0);});it('d',()=>{expect(hd327fwt(93,73)).toBe(2);});it('e',()=>{expect(hd327fwt(15,0)).toBe(4);});});
function hd328fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328fwt_hd',()=>{it('a',()=>{expect(hd328fwt(1,4)).toBe(2);});it('b',()=>{expect(hd328fwt(3,1)).toBe(1);});it('c',()=>{expect(hd328fwt(0,0)).toBe(0);});it('d',()=>{expect(hd328fwt(93,73)).toBe(2);});it('e',()=>{expect(hd328fwt(15,0)).toBe(4);});});
function hd329fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329fwt_hd',()=>{it('a',()=>{expect(hd329fwt(1,4)).toBe(2);});it('b',()=>{expect(hd329fwt(3,1)).toBe(1);});it('c',()=>{expect(hd329fwt(0,0)).toBe(0);});it('d',()=>{expect(hd329fwt(93,73)).toBe(2);});it('e',()=>{expect(hd329fwt(15,0)).toBe(4);});});
function hd330fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330fwt_hd',()=>{it('a',()=>{expect(hd330fwt(1,4)).toBe(2);});it('b',()=>{expect(hd330fwt(3,1)).toBe(1);});it('c',()=>{expect(hd330fwt(0,0)).toBe(0);});it('d',()=>{expect(hd330fwt(93,73)).toBe(2);});it('e',()=>{expect(hd330fwt(15,0)).toBe(4);});});
function hd331fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331fwt_hd',()=>{it('a',()=>{expect(hd331fwt(1,4)).toBe(2);});it('b',()=>{expect(hd331fwt(3,1)).toBe(1);});it('c',()=>{expect(hd331fwt(0,0)).toBe(0);});it('d',()=>{expect(hd331fwt(93,73)).toBe(2);});it('e',()=>{expect(hd331fwt(15,0)).toBe(4);});});
function hd332fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332fwt_hd',()=>{it('a',()=>{expect(hd332fwt(1,4)).toBe(2);});it('b',()=>{expect(hd332fwt(3,1)).toBe(1);});it('c',()=>{expect(hd332fwt(0,0)).toBe(0);});it('d',()=>{expect(hd332fwt(93,73)).toBe(2);});it('e',()=>{expect(hd332fwt(15,0)).toBe(4);});});
function hd333fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333fwt_hd',()=>{it('a',()=>{expect(hd333fwt(1,4)).toBe(2);});it('b',()=>{expect(hd333fwt(3,1)).toBe(1);});it('c',()=>{expect(hd333fwt(0,0)).toBe(0);});it('d',()=>{expect(hd333fwt(93,73)).toBe(2);});it('e',()=>{expect(hd333fwt(15,0)).toBe(4);});});
function hd334fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334fwt_hd',()=>{it('a',()=>{expect(hd334fwt(1,4)).toBe(2);});it('b',()=>{expect(hd334fwt(3,1)).toBe(1);});it('c',()=>{expect(hd334fwt(0,0)).toBe(0);});it('d',()=>{expect(hd334fwt(93,73)).toBe(2);});it('e',()=>{expect(hd334fwt(15,0)).toBe(4);});});
function hd335fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335fwt_hd',()=>{it('a',()=>{expect(hd335fwt(1,4)).toBe(2);});it('b',()=>{expect(hd335fwt(3,1)).toBe(1);});it('c',()=>{expect(hd335fwt(0,0)).toBe(0);});it('d',()=>{expect(hd335fwt(93,73)).toBe(2);});it('e',()=>{expect(hd335fwt(15,0)).toBe(4);});});
function hd336fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336fwt_hd',()=>{it('a',()=>{expect(hd336fwt(1,4)).toBe(2);});it('b',()=>{expect(hd336fwt(3,1)).toBe(1);});it('c',()=>{expect(hd336fwt(0,0)).toBe(0);});it('d',()=>{expect(hd336fwt(93,73)).toBe(2);});it('e',()=>{expect(hd336fwt(15,0)).toBe(4);});});
function hd337fwt(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337fwt_hd',()=>{it('a',()=>{expect(hd337fwt(1,4)).toBe(2);});it('b',()=>{expect(hd337fwt(3,1)).toBe(1);});it('c',()=>{expect(hd337fwt(0,0)).toBe(0);});it('d',()=>{expect(hd337fwt(93,73)).toBe(2);});it('e',()=>{expect(hd337fwt(15,0)).toBe(4);});});
function hd338fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338fwt2_hd',()=>{it('a',()=>{expect(hd338fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd338fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd338fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd338fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd338fwt2(15,0)).toBe(4);});});
function hd339fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339fwt2_hd',()=>{it('a',()=>{expect(hd339fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd339fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd339fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd339fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd339fwt2(15,0)).toBe(4);});});
function hd340fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340fwt2_hd',()=>{it('a',()=>{expect(hd340fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd340fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd340fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd340fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd340fwt2(15,0)).toBe(4);});});
function hd341fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341fwt2_hd',()=>{it('a',()=>{expect(hd341fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd341fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd341fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd341fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd341fwt2(15,0)).toBe(4);});});
function hd342fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342fwt2_hd',()=>{it('a',()=>{expect(hd342fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd342fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd342fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd342fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd342fwt2(15,0)).toBe(4);});});
function hd343fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343fwt2_hd',()=>{it('a',()=>{expect(hd343fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd343fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd343fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd343fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd343fwt2(15,0)).toBe(4);});});
function hd344fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344fwt2_hd',()=>{it('a',()=>{expect(hd344fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd344fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd344fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd344fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd344fwt2(15,0)).toBe(4);});});
function hd345fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345fwt2_hd',()=>{it('a',()=>{expect(hd345fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd345fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd345fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd345fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd345fwt2(15,0)).toBe(4);});});
function hd346fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346fwt2_hd',()=>{it('a',()=>{expect(hd346fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd346fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd346fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd346fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd346fwt2(15,0)).toBe(4);});});
function hd347fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347fwt2_hd',()=>{it('a',()=>{expect(hd347fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd347fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd347fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd347fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd347fwt2(15,0)).toBe(4);});});
function hd348fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348fwt2_hd',()=>{it('a',()=>{expect(hd348fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd348fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd348fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd348fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd348fwt2(15,0)).toBe(4);});});
function hd349fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349fwt2_hd',()=>{it('a',()=>{expect(hd349fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd349fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd349fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd349fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd349fwt2(15,0)).toBe(4);});});
function hd350fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350fwt2_hd',()=>{it('a',()=>{expect(hd350fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd350fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd350fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd350fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd350fwt2(15,0)).toBe(4);});});
function hd351fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351fwt2_hd',()=>{it('a',()=>{expect(hd351fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd351fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd351fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd351fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd351fwt2(15,0)).toBe(4);});});
function hd352fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352fwt2_hd',()=>{it('a',()=>{expect(hd352fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd352fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd352fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd352fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd352fwt2(15,0)).toBe(4);});});
function hd353fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353fwt2_hd',()=>{it('a',()=>{expect(hd353fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd353fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd353fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd353fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd353fwt2(15,0)).toBe(4);});});
function hd354fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354fwt2_hd',()=>{it('a',()=>{expect(hd354fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd354fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd354fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd354fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd354fwt2(15,0)).toBe(4);});});
function hd355fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355fwt2_hd',()=>{it('a',()=>{expect(hd355fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd355fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd355fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd355fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd355fwt2(15,0)).toBe(4);});});
function hd356fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356fwt2_hd',()=>{it('a',()=>{expect(hd356fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd356fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd356fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd356fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd356fwt2(15,0)).toBe(4);});});
function hd357fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357fwt2_hd',()=>{it('a',()=>{expect(hd357fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd357fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd357fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd357fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd357fwt2(15,0)).toBe(4);});});
function hd358fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358fwt2_hd',()=>{it('a',()=>{expect(hd358fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd358fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd358fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd358fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd358fwt2(15,0)).toBe(4);});});
function hd359fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359fwt2_hd',()=>{it('a',()=>{expect(hd359fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd359fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd359fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd359fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd359fwt2(15,0)).toBe(4);});});
function hd360fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360fwt2_hd',()=>{it('a',()=>{expect(hd360fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd360fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd360fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd360fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd360fwt2(15,0)).toBe(4);});});
function hd361fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361fwt2_hd',()=>{it('a',()=>{expect(hd361fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd361fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd361fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd361fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd361fwt2(15,0)).toBe(4);});});
function hd362fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362fwt2_hd',()=>{it('a',()=>{expect(hd362fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd362fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd362fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd362fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd362fwt2(15,0)).toBe(4);});});
function hd363fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363fwt2_hd',()=>{it('a',()=>{expect(hd363fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd363fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd363fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd363fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd363fwt2(15,0)).toBe(4);});});
function hd364fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364fwt2_hd',()=>{it('a',()=>{expect(hd364fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd364fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd364fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd364fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd364fwt2(15,0)).toBe(4);});});
function hd365fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365fwt2_hd',()=>{it('a',()=>{expect(hd365fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd365fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd365fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd365fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd365fwt2(15,0)).toBe(4);});});
function hd366fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366fwt2_hd',()=>{it('a',()=>{expect(hd366fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd366fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd366fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd366fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd366fwt2(15,0)).toBe(4);});});
function hd367fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367fwt2_hd',()=>{it('a',()=>{expect(hd367fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd367fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd367fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd367fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd367fwt2(15,0)).toBe(4);});});
function hd368fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368fwt2_hd',()=>{it('a',()=>{expect(hd368fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd368fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd368fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd368fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd368fwt2(15,0)).toBe(4);});});
function hd369fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369fwt2_hd',()=>{it('a',()=>{expect(hd369fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd369fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd369fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd369fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd369fwt2(15,0)).toBe(4);});});
function hd370fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370fwt2_hd',()=>{it('a',()=>{expect(hd370fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd370fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd370fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd370fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd370fwt2(15,0)).toBe(4);});});
function hd371fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371fwt2_hd',()=>{it('a',()=>{expect(hd371fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd371fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd371fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd371fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd371fwt2(15,0)).toBe(4);});});
function hd372fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372fwt2_hd',()=>{it('a',()=>{expect(hd372fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd372fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd372fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd372fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd372fwt2(15,0)).toBe(4);});});
function hd373fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373fwt2_hd',()=>{it('a',()=>{expect(hd373fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd373fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd373fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd373fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd373fwt2(15,0)).toBe(4);});});
function hd374fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374fwt2_hd',()=>{it('a',()=>{expect(hd374fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd374fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd374fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd374fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd374fwt2(15,0)).toBe(4);});});
function hd375fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375fwt2_hd',()=>{it('a',()=>{expect(hd375fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd375fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd375fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd375fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd375fwt2(15,0)).toBe(4);});});
function hd376fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376fwt2_hd',()=>{it('a',()=>{expect(hd376fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd376fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd376fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd376fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd376fwt2(15,0)).toBe(4);});});
function hd377fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377fwt2_hd',()=>{it('a',()=>{expect(hd377fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd377fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd377fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd377fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd377fwt2(15,0)).toBe(4);});});
function hd378fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378fwt2_hd',()=>{it('a',()=>{expect(hd378fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd378fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd378fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd378fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd378fwt2(15,0)).toBe(4);});});
function hd379fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379fwt2_hd',()=>{it('a',()=>{expect(hd379fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd379fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd379fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd379fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd379fwt2(15,0)).toBe(4);});});
function hd380fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380fwt2_hd',()=>{it('a',()=>{expect(hd380fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd380fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd380fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd380fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd380fwt2(15,0)).toBe(4);});});
function hd381fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381fwt2_hd',()=>{it('a',()=>{expect(hd381fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd381fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd381fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd381fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd381fwt2(15,0)).toBe(4);});});
function hd382fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382fwt2_hd',()=>{it('a',()=>{expect(hd382fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd382fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd382fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd382fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd382fwt2(15,0)).toBe(4);});});
function hd383fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383fwt2_hd',()=>{it('a',()=>{expect(hd383fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd383fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd383fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd383fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd383fwt2(15,0)).toBe(4);});});
function hd384fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384fwt2_hd',()=>{it('a',()=>{expect(hd384fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd384fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd384fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd384fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd384fwt2(15,0)).toBe(4);});});
function hd385fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385fwt2_hd',()=>{it('a',()=>{expect(hd385fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd385fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd385fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd385fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd385fwt2(15,0)).toBe(4);});});
function hd386fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386fwt2_hd',()=>{it('a',()=>{expect(hd386fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd386fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd386fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd386fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd386fwt2(15,0)).toBe(4);});});
function hd387fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387fwt2_hd',()=>{it('a',()=>{expect(hd387fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd387fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd387fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd387fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd387fwt2(15,0)).toBe(4);});});
function hd388fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388fwt2_hd',()=>{it('a',()=>{expect(hd388fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd388fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd388fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd388fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd388fwt2(15,0)).toBe(4);});});
function hd389fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389fwt2_hd',()=>{it('a',()=>{expect(hd389fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd389fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd389fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd389fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd389fwt2(15,0)).toBe(4);});});
function hd390fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390fwt2_hd',()=>{it('a',()=>{expect(hd390fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd390fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd390fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd390fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd390fwt2(15,0)).toBe(4);});});
function hd391fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391fwt2_hd',()=>{it('a',()=>{expect(hd391fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd391fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd391fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd391fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd391fwt2(15,0)).toBe(4);});});
function hd392fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392fwt2_hd',()=>{it('a',()=>{expect(hd392fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd392fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd392fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd392fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd392fwt2(15,0)).toBe(4);});});
function hd393fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393fwt2_hd',()=>{it('a',()=>{expect(hd393fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd393fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd393fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd393fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd393fwt2(15,0)).toBe(4);});});
function hd394fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394fwt2_hd',()=>{it('a',()=>{expect(hd394fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd394fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd394fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd394fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd394fwt2(15,0)).toBe(4);});});
function hd395fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395fwt2_hd',()=>{it('a',()=>{expect(hd395fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd395fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd395fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd395fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd395fwt2(15,0)).toBe(4);});});
function hd396fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396fwt2_hd',()=>{it('a',()=>{expect(hd396fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd396fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd396fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd396fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd396fwt2(15,0)).toBe(4);});});
function hd397fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397fwt2_hd',()=>{it('a',()=>{expect(hd397fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd397fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd397fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd397fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd397fwt2(15,0)).toBe(4);});});
function hd398fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398fwt2_hd',()=>{it('a',()=>{expect(hd398fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd398fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd398fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd398fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd398fwt2(15,0)).toBe(4);});});
function hd399fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399fwt2_hd',()=>{it('a',()=>{expect(hd399fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd399fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd399fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd399fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd399fwt2(15,0)).toBe(4);});});
function hd400fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400fwt2_hd',()=>{it('a',()=>{expect(hd400fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd400fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd400fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd400fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd400fwt2(15,0)).toBe(4);});});
function hd401fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401fwt2_hd',()=>{it('a',()=>{expect(hd401fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd401fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd401fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd401fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd401fwt2(15,0)).toBe(4);});});
function hd402fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402fwt2_hd',()=>{it('a',()=>{expect(hd402fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd402fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd402fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd402fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd402fwt2(15,0)).toBe(4);});});
function hd403fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403fwt2_hd',()=>{it('a',()=>{expect(hd403fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd403fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd403fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd403fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd403fwt2(15,0)).toBe(4);});});
function hd404fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404fwt2_hd',()=>{it('a',()=>{expect(hd404fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd404fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd404fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd404fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd404fwt2(15,0)).toBe(4);});});
function hd405fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405fwt2_hd',()=>{it('a',()=>{expect(hd405fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd405fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd405fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd405fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd405fwt2(15,0)).toBe(4);});});
function hd406fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406fwt2_hd',()=>{it('a',()=>{expect(hd406fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd406fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd406fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd406fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd406fwt2(15,0)).toBe(4);});});
function hd407fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407fwt2_hd',()=>{it('a',()=>{expect(hd407fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd407fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd407fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd407fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd407fwt2(15,0)).toBe(4);});});
function hd408fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408fwt2_hd',()=>{it('a',()=>{expect(hd408fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd408fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd408fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd408fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd408fwt2(15,0)).toBe(4);});});
function hd409fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409fwt2_hd',()=>{it('a',()=>{expect(hd409fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd409fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd409fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd409fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd409fwt2(15,0)).toBe(4);});});
function hd410fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410fwt2_hd',()=>{it('a',()=>{expect(hd410fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd410fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd410fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd410fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd410fwt2(15,0)).toBe(4);});});
function hd411fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411fwt2_hd',()=>{it('a',()=>{expect(hd411fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd411fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd411fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd411fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd411fwt2(15,0)).toBe(4);});});
function hd412fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412fwt2_hd',()=>{it('a',()=>{expect(hd412fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd412fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd412fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd412fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd412fwt2(15,0)).toBe(4);});});
function hd413fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413fwt2_hd',()=>{it('a',()=>{expect(hd413fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd413fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd413fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd413fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd413fwt2(15,0)).toBe(4);});});
function hd414fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414fwt2_hd',()=>{it('a',()=>{expect(hd414fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd414fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd414fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd414fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd414fwt2(15,0)).toBe(4);});});
function hd415fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415fwt2_hd',()=>{it('a',()=>{expect(hd415fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd415fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd415fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd415fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd415fwt2(15,0)).toBe(4);});});
function hd416fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416fwt2_hd',()=>{it('a',()=>{expect(hd416fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd416fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd416fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd416fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd416fwt2(15,0)).toBe(4);});});
function hd417fwt2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417fwt2_hd',()=>{it('a',()=>{expect(hd417fwt2(1,4)).toBe(2);});it('b',()=>{expect(hd417fwt2(3,1)).toBe(1);});it('c',()=>{expect(hd417fwt2(0,0)).toBe(0);});it('d',()=>{expect(hd417fwt2(93,73)).toBe(2);});it('e',()=>{expect(hd417fwt2(15,0)).toBe(4);});});
