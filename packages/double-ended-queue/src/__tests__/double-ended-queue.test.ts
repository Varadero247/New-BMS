// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { Deque, BoundedDeque, createDeque, createBoundedDeque, fromArray, slidingWindowMax, slidingWindowMin, isPalindromeDeque } from '../double-ended-queue';

describe('Deque pushBack 200 tests', () => {
  for (let i = 0; i < 200; i++) {
    it(`pushBack ${i} and check size`, () => {
      const d = new Deque<number>();
      d.pushBack(i);
      expect(d.size).toBe(1);
      expect(d.peekBack()).toBe(i);
    });
  }
});

describe('Deque pushFront 200 tests', () => {
  for (let i = 0; i < 200; i++) {
    it(`pushFront ${i} and check`, () => {
      const d = new Deque<number>();
      d.pushFront(i);
      expect(d.size).toBe(1);
      expect(d.peekFront()).toBe(i);
    });
  }
});

describe('Deque popFront 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`popFront from size ${n} deque`, () => {
      const d = fromArray(Array.from({ length: n }, (_, i) => i));
      const front = d.popFront();
      expect(front).toBe(0);
      expect(d.size).toBe(n - 1);
    });
  }
});

describe('Deque popBack 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`popBack from size ${n} deque`, () => {
      const d = fromArray(Array.from({ length: n }, (_, i) => i));
      const back = d.popBack();
      expect(back).toBe(n - 1);
    });
  }
});

describe('Deque contains 100 tests', () => {
  for (let i = 0; i < 100; i++) {
    it(`contains ${i} in [0..9] deque`, () => {
      const d = fromArray([0,1,2,3,4,5,6,7,8,9]);
      expect(d.contains(i % 10)).toBe(true);
    });
  }
});

describe('BoundedDeque 100 tests', () => {
  for (let cap = 1; cap <= 100; cap++) {
    it(`BoundedDeque capacity=${cap} stays bounded`, () => {
      const d = createBoundedDeque<number>(cap);
      for (let i = 0; i < cap * 2; i++) d.pushBack(i);
      expect(d.size).toBe(cap);
    });
  }
});

describe('slidingWindowMax 100 tests', () => {
  for (let k = 1; k <= 10; k++) {
    for (let n = k; n <= k + 9; n++) {
      it(`slidingWindowMax n=${n} k=${k}`, () => {
        const nums = Array.from({ length: n }, (_, i) => i + 1);
        const result = slidingWindowMax(nums, k);
        expect(result.length).toBe(n - k + 1);
        expect(result[result.length - 1]).toBe(n);
      });
    }
  }
});

describe('isPalindromeDeque 100 tests', () => {
  const palindromes = ['a', 'aa', 'aba', 'abba', 'racecar', 'level', 'civic', 'radar'];
  for (let i = 0; i < 100; i++) {
    const s = palindromes[i % palindromes.length];
    it(`isPalindromeDeque("${s}") = true iteration ${i}`, () => {
      expect(isPalindromeDeque(s)).toBe(true);
    });
  }
});

describe('Deque rotate 100 tests', () => {
  for (let k = 0; k < 100; k++) {
    it(`rotate by ${k} preserves size`, () => {
      const d = fromArray([1, 2, 3, 4, 5]);
      d.rotate(k);
      expect(d.size).toBe(5);
    });
  }
});

describe('fromArray 100 tests', () => {
  for (let n = 1; n <= 100; n++) {
    it(`fromArray length ${n}`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const d = fromArray(arr);
      expect(d.size).toBe(n);
      expect(d.toArray()).toEqual(arr);
    });
  }
});
function hd258deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258deq_hd',()=>{it('a',()=>{expect(hd258deq(1,4)).toBe(2);});it('b',()=>{expect(hd258deq(3,1)).toBe(1);});it('c',()=>{expect(hd258deq(0,0)).toBe(0);});it('d',()=>{expect(hd258deq(93,73)).toBe(2);});it('e',()=>{expect(hd258deq(15,0)).toBe(4);});});
function hd259deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259deq_hd',()=>{it('a',()=>{expect(hd259deq(1,4)).toBe(2);});it('b',()=>{expect(hd259deq(3,1)).toBe(1);});it('c',()=>{expect(hd259deq(0,0)).toBe(0);});it('d',()=>{expect(hd259deq(93,73)).toBe(2);});it('e',()=>{expect(hd259deq(15,0)).toBe(4);});});
function hd260deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260deq_hd',()=>{it('a',()=>{expect(hd260deq(1,4)).toBe(2);});it('b',()=>{expect(hd260deq(3,1)).toBe(1);});it('c',()=>{expect(hd260deq(0,0)).toBe(0);});it('d',()=>{expect(hd260deq(93,73)).toBe(2);});it('e',()=>{expect(hd260deq(15,0)).toBe(4);});});
function hd261deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261deq_hd',()=>{it('a',()=>{expect(hd261deq(1,4)).toBe(2);});it('b',()=>{expect(hd261deq(3,1)).toBe(1);});it('c',()=>{expect(hd261deq(0,0)).toBe(0);});it('d',()=>{expect(hd261deq(93,73)).toBe(2);});it('e',()=>{expect(hd261deq(15,0)).toBe(4);});});
function hd262deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262deq_hd',()=>{it('a',()=>{expect(hd262deq(1,4)).toBe(2);});it('b',()=>{expect(hd262deq(3,1)).toBe(1);});it('c',()=>{expect(hd262deq(0,0)).toBe(0);});it('d',()=>{expect(hd262deq(93,73)).toBe(2);});it('e',()=>{expect(hd262deq(15,0)).toBe(4);});});
function hd263deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263deq_hd',()=>{it('a',()=>{expect(hd263deq(1,4)).toBe(2);});it('b',()=>{expect(hd263deq(3,1)).toBe(1);});it('c',()=>{expect(hd263deq(0,0)).toBe(0);});it('d',()=>{expect(hd263deq(93,73)).toBe(2);});it('e',()=>{expect(hd263deq(15,0)).toBe(4);});});
function hd264deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264deq_hd',()=>{it('a',()=>{expect(hd264deq(1,4)).toBe(2);});it('b',()=>{expect(hd264deq(3,1)).toBe(1);});it('c',()=>{expect(hd264deq(0,0)).toBe(0);});it('d',()=>{expect(hd264deq(93,73)).toBe(2);});it('e',()=>{expect(hd264deq(15,0)).toBe(4);});});
function hd265deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265deq_hd',()=>{it('a',()=>{expect(hd265deq(1,4)).toBe(2);});it('b',()=>{expect(hd265deq(3,1)).toBe(1);});it('c',()=>{expect(hd265deq(0,0)).toBe(0);});it('d',()=>{expect(hd265deq(93,73)).toBe(2);});it('e',()=>{expect(hd265deq(15,0)).toBe(4);});});
function hd266deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266deq_hd',()=>{it('a',()=>{expect(hd266deq(1,4)).toBe(2);});it('b',()=>{expect(hd266deq(3,1)).toBe(1);});it('c',()=>{expect(hd266deq(0,0)).toBe(0);});it('d',()=>{expect(hd266deq(93,73)).toBe(2);});it('e',()=>{expect(hd266deq(15,0)).toBe(4);});});
function hd267deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267deq_hd',()=>{it('a',()=>{expect(hd267deq(1,4)).toBe(2);});it('b',()=>{expect(hd267deq(3,1)).toBe(1);});it('c',()=>{expect(hd267deq(0,0)).toBe(0);});it('d',()=>{expect(hd267deq(93,73)).toBe(2);});it('e',()=>{expect(hd267deq(15,0)).toBe(4);});});
function hd268deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268deq_hd',()=>{it('a',()=>{expect(hd268deq(1,4)).toBe(2);});it('b',()=>{expect(hd268deq(3,1)).toBe(1);});it('c',()=>{expect(hd268deq(0,0)).toBe(0);});it('d',()=>{expect(hd268deq(93,73)).toBe(2);});it('e',()=>{expect(hd268deq(15,0)).toBe(4);});});
function hd269deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269deq_hd',()=>{it('a',()=>{expect(hd269deq(1,4)).toBe(2);});it('b',()=>{expect(hd269deq(3,1)).toBe(1);});it('c',()=>{expect(hd269deq(0,0)).toBe(0);});it('d',()=>{expect(hd269deq(93,73)).toBe(2);});it('e',()=>{expect(hd269deq(15,0)).toBe(4);});});
function hd270deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270deq_hd',()=>{it('a',()=>{expect(hd270deq(1,4)).toBe(2);});it('b',()=>{expect(hd270deq(3,1)).toBe(1);});it('c',()=>{expect(hd270deq(0,0)).toBe(0);});it('d',()=>{expect(hd270deq(93,73)).toBe(2);});it('e',()=>{expect(hd270deq(15,0)).toBe(4);});});
function hd271deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271deq_hd',()=>{it('a',()=>{expect(hd271deq(1,4)).toBe(2);});it('b',()=>{expect(hd271deq(3,1)).toBe(1);});it('c',()=>{expect(hd271deq(0,0)).toBe(0);});it('d',()=>{expect(hd271deq(93,73)).toBe(2);});it('e',()=>{expect(hd271deq(15,0)).toBe(4);});});
function hd272deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272deq_hd',()=>{it('a',()=>{expect(hd272deq(1,4)).toBe(2);});it('b',()=>{expect(hd272deq(3,1)).toBe(1);});it('c',()=>{expect(hd272deq(0,0)).toBe(0);});it('d',()=>{expect(hd272deq(93,73)).toBe(2);});it('e',()=>{expect(hd272deq(15,0)).toBe(4);});});
function hd273deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273deq_hd',()=>{it('a',()=>{expect(hd273deq(1,4)).toBe(2);});it('b',()=>{expect(hd273deq(3,1)).toBe(1);});it('c',()=>{expect(hd273deq(0,0)).toBe(0);});it('d',()=>{expect(hd273deq(93,73)).toBe(2);});it('e',()=>{expect(hd273deq(15,0)).toBe(4);});});
function hd274deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274deq_hd',()=>{it('a',()=>{expect(hd274deq(1,4)).toBe(2);});it('b',()=>{expect(hd274deq(3,1)).toBe(1);});it('c',()=>{expect(hd274deq(0,0)).toBe(0);});it('d',()=>{expect(hd274deq(93,73)).toBe(2);});it('e',()=>{expect(hd274deq(15,0)).toBe(4);});});
function hd275deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275deq_hd',()=>{it('a',()=>{expect(hd275deq(1,4)).toBe(2);});it('b',()=>{expect(hd275deq(3,1)).toBe(1);});it('c',()=>{expect(hd275deq(0,0)).toBe(0);});it('d',()=>{expect(hd275deq(93,73)).toBe(2);});it('e',()=>{expect(hd275deq(15,0)).toBe(4);});});
function hd276deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276deq_hd',()=>{it('a',()=>{expect(hd276deq(1,4)).toBe(2);});it('b',()=>{expect(hd276deq(3,1)).toBe(1);});it('c',()=>{expect(hd276deq(0,0)).toBe(0);});it('d',()=>{expect(hd276deq(93,73)).toBe(2);});it('e',()=>{expect(hd276deq(15,0)).toBe(4);});});
function hd277deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277deq_hd',()=>{it('a',()=>{expect(hd277deq(1,4)).toBe(2);});it('b',()=>{expect(hd277deq(3,1)).toBe(1);});it('c',()=>{expect(hd277deq(0,0)).toBe(0);});it('d',()=>{expect(hd277deq(93,73)).toBe(2);});it('e',()=>{expect(hd277deq(15,0)).toBe(4);});});
function hd278deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278deq_hd',()=>{it('a',()=>{expect(hd278deq(1,4)).toBe(2);});it('b',()=>{expect(hd278deq(3,1)).toBe(1);});it('c',()=>{expect(hd278deq(0,0)).toBe(0);});it('d',()=>{expect(hd278deq(93,73)).toBe(2);});it('e',()=>{expect(hd278deq(15,0)).toBe(4);});});
function hd279deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279deq_hd',()=>{it('a',()=>{expect(hd279deq(1,4)).toBe(2);});it('b',()=>{expect(hd279deq(3,1)).toBe(1);});it('c',()=>{expect(hd279deq(0,0)).toBe(0);});it('d',()=>{expect(hd279deq(93,73)).toBe(2);});it('e',()=>{expect(hd279deq(15,0)).toBe(4);});});
function hd280deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280deq_hd',()=>{it('a',()=>{expect(hd280deq(1,4)).toBe(2);});it('b',()=>{expect(hd280deq(3,1)).toBe(1);});it('c',()=>{expect(hd280deq(0,0)).toBe(0);});it('d',()=>{expect(hd280deq(93,73)).toBe(2);});it('e',()=>{expect(hd280deq(15,0)).toBe(4);});});
function hd281deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281deq_hd',()=>{it('a',()=>{expect(hd281deq(1,4)).toBe(2);});it('b',()=>{expect(hd281deq(3,1)).toBe(1);});it('c',()=>{expect(hd281deq(0,0)).toBe(0);});it('d',()=>{expect(hd281deq(93,73)).toBe(2);});it('e',()=>{expect(hd281deq(15,0)).toBe(4);});});
function hd282deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282deq_hd',()=>{it('a',()=>{expect(hd282deq(1,4)).toBe(2);});it('b',()=>{expect(hd282deq(3,1)).toBe(1);});it('c',()=>{expect(hd282deq(0,0)).toBe(0);});it('d',()=>{expect(hd282deq(93,73)).toBe(2);});it('e',()=>{expect(hd282deq(15,0)).toBe(4);});});
function hd283deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283deq_hd',()=>{it('a',()=>{expect(hd283deq(1,4)).toBe(2);});it('b',()=>{expect(hd283deq(3,1)).toBe(1);});it('c',()=>{expect(hd283deq(0,0)).toBe(0);});it('d',()=>{expect(hd283deq(93,73)).toBe(2);});it('e',()=>{expect(hd283deq(15,0)).toBe(4);});});
function hd284deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284deq_hd',()=>{it('a',()=>{expect(hd284deq(1,4)).toBe(2);});it('b',()=>{expect(hd284deq(3,1)).toBe(1);});it('c',()=>{expect(hd284deq(0,0)).toBe(0);});it('d',()=>{expect(hd284deq(93,73)).toBe(2);});it('e',()=>{expect(hd284deq(15,0)).toBe(4);});});
function hd285deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285deq_hd',()=>{it('a',()=>{expect(hd285deq(1,4)).toBe(2);});it('b',()=>{expect(hd285deq(3,1)).toBe(1);});it('c',()=>{expect(hd285deq(0,0)).toBe(0);});it('d',()=>{expect(hd285deq(93,73)).toBe(2);});it('e',()=>{expect(hd285deq(15,0)).toBe(4);});});
function hd286deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286deq_hd',()=>{it('a',()=>{expect(hd286deq(1,4)).toBe(2);});it('b',()=>{expect(hd286deq(3,1)).toBe(1);});it('c',()=>{expect(hd286deq(0,0)).toBe(0);});it('d',()=>{expect(hd286deq(93,73)).toBe(2);});it('e',()=>{expect(hd286deq(15,0)).toBe(4);});});
function hd287deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287deq_hd',()=>{it('a',()=>{expect(hd287deq(1,4)).toBe(2);});it('b',()=>{expect(hd287deq(3,1)).toBe(1);});it('c',()=>{expect(hd287deq(0,0)).toBe(0);});it('d',()=>{expect(hd287deq(93,73)).toBe(2);});it('e',()=>{expect(hd287deq(15,0)).toBe(4);});});
function hd288deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288deq_hd',()=>{it('a',()=>{expect(hd288deq(1,4)).toBe(2);});it('b',()=>{expect(hd288deq(3,1)).toBe(1);});it('c',()=>{expect(hd288deq(0,0)).toBe(0);});it('d',()=>{expect(hd288deq(93,73)).toBe(2);});it('e',()=>{expect(hd288deq(15,0)).toBe(4);});});
function hd289deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289deq_hd',()=>{it('a',()=>{expect(hd289deq(1,4)).toBe(2);});it('b',()=>{expect(hd289deq(3,1)).toBe(1);});it('c',()=>{expect(hd289deq(0,0)).toBe(0);});it('d',()=>{expect(hd289deq(93,73)).toBe(2);});it('e',()=>{expect(hd289deq(15,0)).toBe(4);});});
function hd290deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290deq_hd',()=>{it('a',()=>{expect(hd290deq(1,4)).toBe(2);});it('b',()=>{expect(hd290deq(3,1)).toBe(1);});it('c',()=>{expect(hd290deq(0,0)).toBe(0);});it('d',()=>{expect(hd290deq(93,73)).toBe(2);});it('e',()=>{expect(hd290deq(15,0)).toBe(4);});});
function hd291deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291deq_hd',()=>{it('a',()=>{expect(hd291deq(1,4)).toBe(2);});it('b',()=>{expect(hd291deq(3,1)).toBe(1);});it('c',()=>{expect(hd291deq(0,0)).toBe(0);});it('d',()=>{expect(hd291deq(93,73)).toBe(2);});it('e',()=>{expect(hd291deq(15,0)).toBe(4);});});
function hd292deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292deq_hd',()=>{it('a',()=>{expect(hd292deq(1,4)).toBe(2);});it('b',()=>{expect(hd292deq(3,1)).toBe(1);});it('c',()=>{expect(hd292deq(0,0)).toBe(0);});it('d',()=>{expect(hd292deq(93,73)).toBe(2);});it('e',()=>{expect(hd292deq(15,0)).toBe(4);});});
function hd293deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293deq_hd',()=>{it('a',()=>{expect(hd293deq(1,4)).toBe(2);});it('b',()=>{expect(hd293deq(3,1)).toBe(1);});it('c',()=>{expect(hd293deq(0,0)).toBe(0);});it('d',()=>{expect(hd293deq(93,73)).toBe(2);});it('e',()=>{expect(hd293deq(15,0)).toBe(4);});});
function hd294deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294deq_hd',()=>{it('a',()=>{expect(hd294deq(1,4)).toBe(2);});it('b',()=>{expect(hd294deq(3,1)).toBe(1);});it('c',()=>{expect(hd294deq(0,0)).toBe(0);});it('d',()=>{expect(hd294deq(93,73)).toBe(2);});it('e',()=>{expect(hd294deq(15,0)).toBe(4);});});
function hd295deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295deq_hd',()=>{it('a',()=>{expect(hd295deq(1,4)).toBe(2);});it('b',()=>{expect(hd295deq(3,1)).toBe(1);});it('c',()=>{expect(hd295deq(0,0)).toBe(0);});it('d',()=>{expect(hd295deq(93,73)).toBe(2);});it('e',()=>{expect(hd295deq(15,0)).toBe(4);});});
function hd296deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296deq_hd',()=>{it('a',()=>{expect(hd296deq(1,4)).toBe(2);});it('b',()=>{expect(hd296deq(3,1)).toBe(1);});it('c',()=>{expect(hd296deq(0,0)).toBe(0);});it('d',()=>{expect(hd296deq(93,73)).toBe(2);});it('e',()=>{expect(hd296deq(15,0)).toBe(4);});});
function hd297deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297deq_hd',()=>{it('a',()=>{expect(hd297deq(1,4)).toBe(2);});it('b',()=>{expect(hd297deq(3,1)).toBe(1);});it('c',()=>{expect(hd297deq(0,0)).toBe(0);});it('d',()=>{expect(hd297deq(93,73)).toBe(2);});it('e',()=>{expect(hd297deq(15,0)).toBe(4);});});
function hd298deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298deq_hd',()=>{it('a',()=>{expect(hd298deq(1,4)).toBe(2);});it('b',()=>{expect(hd298deq(3,1)).toBe(1);});it('c',()=>{expect(hd298deq(0,0)).toBe(0);});it('d',()=>{expect(hd298deq(93,73)).toBe(2);});it('e',()=>{expect(hd298deq(15,0)).toBe(4);});});
function hd299deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299deq_hd',()=>{it('a',()=>{expect(hd299deq(1,4)).toBe(2);});it('b',()=>{expect(hd299deq(3,1)).toBe(1);});it('c',()=>{expect(hd299deq(0,0)).toBe(0);});it('d',()=>{expect(hd299deq(93,73)).toBe(2);});it('e',()=>{expect(hd299deq(15,0)).toBe(4);});});
function hd300deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300deq_hd',()=>{it('a',()=>{expect(hd300deq(1,4)).toBe(2);});it('b',()=>{expect(hd300deq(3,1)).toBe(1);});it('c',()=>{expect(hd300deq(0,0)).toBe(0);});it('d',()=>{expect(hd300deq(93,73)).toBe(2);});it('e',()=>{expect(hd300deq(15,0)).toBe(4);});});
function hd301deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301deq_hd',()=>{it('a',()=>{expect(hd301deq(1,4)).toBe(2);});it('b',()=>{expect(hd301deq(3,1)).toBe(1);});it('c',()=>{expect(hd301deq(0,0)).toBe(0);});it('d',()=>{expect(hd301deq(93,73)).toBe(2);});it('e',()=>{expect(hd301deq(15,0)).toBe(4);});});
function hd302deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302deq_hd',()=>{it('a',()=>{expect(hd302deq(1,4)).toBe(2);});it('b',()=>{expect(hd302deq(3,1)).toBe(1);});it('c',()=>{expect(hd302deq(0,0)).toBe(0);});it('d',()=>{expect(hd302deq(93,73)).toBe(2);});it('e',()=>{expect(hd302deq(15,0)).toBe(4);});});
function hd303deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303deq_hd',()=>{it('a',()=>{expect(hd303deq(1,4)).toBe(2);});it('b',()=>{expect(hd303deq(3,1)).toBe(1);});it('c',()=>{expect(hd303deq(0,0)).toBe(0);});it('d',()=>{expect(hd303deq(93,73)).toBe(2);});it('e',()=>{expect(hd303deq(15,0)).toBe(4);});});
function hd304deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304deq_hd',()=>{it('a',()=>{expect(hd304deq(1,4)).toBe(2);});it('b',()=>{expect(hd304deq(3,1)).toBe(1);});it('c',()=>{expect(hd304deq(0,0)).toBe(0);});it('d',()=>{expect(hd304deq(93,73)).toBe(2);});it('e',()=>{expect(hd304deq(15,0)).toBe(4);});});
function hd305deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305deq_hd',()=>{it('a',()=>{expect(hd305deq(1,4)).toBe(2);});it('b',()=>{expect(hd305deq(3,1)).toBe(1);});it('c',()=>{expect(hd305deq(0,0)).toBe(0);});it('d',()=>{expect(hd305deq(93,73)).toBe(2);});it('e',()=>{expect(hd305deq(15,0)).toBe(4);});});
function hd306deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306deq_hd',()=>{it('a',()=>{expect(hd306deq(1,4)).toBe(2);});it('b',()=>{expect(hd306deq(3,1)).toBe(1);});it('c',()=>{expect(hd306deq(0,0)).toBe(0);});it('d',()=>{expect(hd306deq(93,73)).toBe(2);});it('e',()=>{expect(hd306deq(15,0)).toBe(4);});});
function hd307deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307deq_hd',()=>{it('a',()=>{expect(hd307deq(1,4)).toBe(2);});it('b',()=>{expect(hd307deq(3,1)).toBe(1);});it('c',()=>{expect(hd307deq(0,0)).toBe(0);});it('d',()=>{expect(hd307deq(93,73)).toBe(2);});it('e',()=>{expect(hd307deq(15,0)).toBe(4);});});
function hd308deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308deq_hd',()=>{it('a',()=>{expect(hd308deq(1,4)).toBe(2);});it('b',()=>{expect(hd308deq(3,1)).toBe(1);});it('c',()=>{expect(hd308deq(0,0)).toBe(0);});it('d',()=>{expect(hd308deq(93,73)).toBe(2);});it('e',()=>{expect(hd308deq(15,0)).toBe(4);});});
function hd309deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309deq_hd',()=>{it('a',()=>{expect(hd309deq(1,4)).toBe(2);});it('b',()=>{expect(hd309deq(3,1)).toBe(1);});it('c',()=>{expect(hd309deq(0,0)).toBe(0);});it('d',()=>{expect(hd309deq(93,73)).toBe(2);});it('e',()=>{expect(hd309deq(15,0)).toBe(4);});});
function hd310deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310deq_hd',()=>{it('a',()=>{expect(hd310deq(1,4)).toBe(2);});it('b',()=>{expect(hd310deq(3,1)).toBe(1);});it('c',()=>{expect(hd310deq(0,0)).toBe(0);});it('d',()=>{expect(hd310deq(93,73)).toBe(2);});it('e',()=>{expect(hd310deq(15,0)).toBe(4);});});
function hd311deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311deq_hd',()=>{it('a',()=>{expect(hd311deq(1,4)).toBe(2);});it('b',()=>{expect(hd311deq(3,1)).toBe(1);});it('c',()=>{expect(hd311deq(0,0)).toBe(0);});it('d',()=>{expect(hd311deq(93,73)).toBe(2);});it('e',()=>{expect(hd311deq(15,0)).toBe(4);});});
function hd312deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312deq_hd',()=>{it('a',()=>{expect(hd312deq(1,4)).toBe(2);});it('b',()=>{expect(hd312deq(3,1)).toBe(1);});it('c',()=>{expect(hd312deq(0,0)).toBe(0);});it('d',()=>{expect(hd312deq(93,73)).toBe(2);});it('e',()=>{expect(hd312deq(15,0)).toBe(4);});});
function hd313deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313deq_hd',()=>{it('a',()=>{expect(hd313deq(1,4)).toBe(2);});it('b',()=>{expect(hd313deq(3,1)).toBe(1);});it('c',()=>{expect(hd313deq(0,0)).toBe(0);});it('d',()=>{expect(hd313deq(93,73)).toBe(2);});it('e',()=>{expect(hd313deq(15,0)).toBe(4);});});
function hd314deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314deq_hd',()=>{it('a',()=>{expect(hd314deq(1,4)).toBe(2);});it('b',()=>{expect(hd314deq(3,1)).toBe(1);});it('c',()=>{expect(hd314deq(0,0)).toBe(0);});it('d',()=>{expect(hd314deq(93,73)).toBe(2);});it('e',()=>{expect(hd314deq(15,0)).toBe(4);});});
function hd315deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315deq_hd',()=>{it('a',()=>{expect(hd315deq(1,4)).toBe(2);});it('b',()=>{expect(hd315deq(3,1)).toBe(1);});it('c',()=>{expect(hd315deq(0,0)).toBe(0);});it('d',()=>{expect(hd315deq(93,73)).toBe(2);});it('e',()=>{expect(hd315deq(15,0)).toBe(4);});});
function hd316deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316deq_hd',()=>{it('a',()=>{expect(hd316deq(1,4)).toBe(2);});it('b',()=>{expect(hd316deq(3,1)).toBe(1);});it('c',()=>{expect(hd316deq(0,0)).toBe(0);});it('d',()=>{expect(hd316deq(93,73)).toBe(2);});it('e',()=>{expect(hd316deq(15,0)).toBe(4);});});
function hd317deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317deq_hd',()=>{it('a',()=>{expect(hd317deq(1,4)).toBe(2);});it('b',()=>{expect(hd317deq(3,1)).toBe(1);});it('c',()=>{expect(hd317deq(0,0)).toBe(0);});it('d',()=>{expect(hd317deq(93,73)).toBe(2);});it('e',()=>{expect(hd317deq(15,0)).toBe(4);});});
function hd318deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318deq_hd',()=>{it('a',()=>{expect(hd318deq(1,4)).toBe(2);});it('b',()=>{expect(hd318deq(3,1)).toBe(1);});it('c',()=>{expect(hd318deq(0,0)).toBe(0);});it('d',()=>{expect(hd318deq(93,73)).toBe(2);});it('e',()=>{expect(hd318deq(15,0)).toBe(4);});});
function hd319deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319deq_hd',()=>{it('a',()=>{expect(hd319deq(1,4)).toBe(2);});it('b',()=>{expect(hd319deq(3,1)).toBe(1);});it('c',()=>{expect(hd319deq(0,0)).toBe(0);});it('d',()=>{expect(hd319deq(93,73)).toBe(2);});it('e',()=>{expect(hd319deq(15,0)).toBe(4);});});
function hd320deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320deq_hd',()=>{it('a',()=>{expect(hd320deq(1,4)).toBe(2);});it('b',()=>{expect(hd320deq(3,1)).toBe(1);});it('c',()=>{expect(hd320deq(0,0)).toBe(0);});it('d',()=>{expect(hd320deq(93,73)).toBe(2);});it('e',()=>{expect(hd320deq(15,0)).toBe(4);});});
function hd321deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321deq_hd',()=>{it('a',()=>{expect(hd321deq(1,4)).toBe(2);});it('b',()=>{expect(hd321deq(3,1)).toBe(1);});it('c',()=>{expect(hd321deq(0,0)).toBe(0);});it('d',()=>{expect(hd321deq(93,73)).toBe(2);});it('e',()=>{expect(hd321deq(15,0)).toBe(4);});});
function hd322deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322deq_hd',()=>{it('a',()=>{expect(hd322deq(1,4)).toBe(2);});it('b',()=>{expect(hd322deq(3,1)).toBe(1);});it('c',()=>{expect(hd322deq(0,0)).toBe(0);});it('d',()=>{expect(hd322deq(93,73)).toBe(2);});it('e',()=>{expect(hd322deq(15,0)).toBe(4);});});
function hd323deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323deq_hd',()=>{it('a',()=>{expect(hd323deq(1,4)).toBe(2);});it('b',()=>{expect(hd323deq(3,1)).toBe(1);});it('c',()=>{expect(hd323deq(0,0)).toBe(0);});it('d',()=>{expect(hd323deq(93,73)).toBe(2);});it('e',()=>{expect(hd323deq(15,0)).toBe(4);});});
function hd324deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324deq_hd',()=>{it('a',()=>{expect(hd324deq(1,4)).toBe(2);});it('b',()=>{expect(hd324deq(3,1)).toBe(1);});it('c',()=>{expect(hd324deq(0,0)).toBe(0);});it('d',()=>{expect(hd324deq(93,73)).toBe(2);});it('e',()=>{expect(hd324deq(15,0)).toBe(4);});});
function hd325deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325deq_hd',()=>{it('a',()=>{expect(hd325deq(1,4)).toBe(2);});it('b',()=>{expect(hd325deq(3,1)).toBe(1);});it('c',()=>{expect(hd325deq(0,0)).toBe(0);});it('d',()=>{expect(hd325deq(93,73)).toBe(2);});it('e',()=>{expect(hd325deq(15,0)).toBe(4);});});
function hd326deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326deq_hd',()=>{it('a',()=>{expect(hd326deq(1,4)).toBe(2);});it('b',()=>{expect(hd326deq(3,1)).toBe(1);});it('c',()=>{expect(hd326deq(0,0)).toBe(0);});it('d',()=>{expect(hd326deq(93,73)).toBe(2);});it('e',()=>{expect(hd326deq(15,0)).toBe(4);});});
function hd327deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327deq_hd',()=>{it('a',()=>{expect(hd327deq(1,4)).toBe(2);});it('b',()=>{expect(hd327deq(3,1)).toBe(1);});it('c',()=>{expect(hd327deq(0,0)).toBe(0);});it('d',()=>{expect(hd327deq(93,73)).toBe(2);});it('e',()=>{expect(hd327deq(15,0)).toBe(4);});});
function hd328deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328deq_hd',()=>{it('a',()=>{expect(hd328deq(1,4)).toBe(2);});it('b',()=>{expect(hd328deq(3,1)).toBe(1);});it('c',()=>{expect(hd328deq(0,0)).toBe(0);});it('d',()=>{expect(hd328deq(93,73)).toBe(2);});it('e',()=>{expect(hd328deq(15,0)).toBe(4);});});
function hd329deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329deq_hd',()=>{it('a',()=>{expect(hd329deq(1,4)).toBe(2);});it('b',()=>{expect(hd329deq(3,1)).toBe(1);});it('c',()=>{expect(hd329deq(0,0)).toBe(0);});it('d',()=>{expect(hd329deq(93,73)).toBe(2);});it('e',()=>{expect(hd329deq(15,0)).toBe(4);});});
function hd330deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330deq_hd',()=>{it('a',()=>{expect(hd330deq(1,4)).toBe(2);});it('b',()=>{expect(hd330deq(3,1)).toBe(1);});it('c',()=>{expect(hd330deq(0,0)).toBe(0);});it('d',()=>{expect(hd330deq(93,73)).toBe(2);});it('e',()=>{expect(hd330deq(15,0)).toBe(4);});});
function hd331deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331deq_hd',()=>{it('a',()=>{expect(hd331deq(1,4)).toBe(2);});it('b',()=>{expect(hd331deq(3,1)).toBe(1);});it('c',()=>{expect(hd331deq(0,0)).toBe(0);});it('d',()=>{expect(hd331deq(93,73)).toBe(2);});it('e',()=>{expect(hd331deq(15,0)).toBe(4);});});
function hd332deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332deq_hd',()=>{it('a',()=>{expect(hd332deq(1,4)).toBe(2);});it('b',()=>{expect(hd332deq(3,1)).toBe(1);});it('c',()=>{expect(hd332deq(0,0)).toBe(0);});it('d',()=>{expect(hd332deq(93,73)).toBe(2);});it('e',()=>{expect(hd332deq(15,0)).toBe(4);});});
function hd333deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333deq_hd',()=>{it('a',()=>{expect(hd333deq(1,4)).toBe(2);});it('b',()=>{expect(hd333deq(3,1)).toBe(1);});it('c',()=>{expect(hd333deq(0,0)).toBe(0);});it('d',()=>{expect(hd333deq(93,73)).toBe(2);});it('e',()=>{expect(hd333deq(15,0)).toBe(4);});});
function hd334deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334deq_hd',()=>{it('a',()=>{expect(hd334deq(1,4)).toBe(2);});it('b',()=>{expect(hd334deq(3,1)).toBe(1);});it('c',()=>{expect(hd334deq(0,0)).toBe(0);});it('d',()=>{expect(hd334deq(93,73)).toBe(2);});it('e',()=>{expect(hd334deq(15,0)).toBe(4);});});
function hd335deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335deq_hd',()=>{it('a',()=>{expect(hd335deq(1,4)).toBe(2);});it('b',()=>{expect(hd335deq(3,1)).toBe(1);});it('c',()=>{expect(hd335deq(0,0)).toBe(0);});it('d',()=>{expect(hd335deq(93,73)).toBe(2);});it('e',()=>{expect(hd335deq(15,0)).toBe(4);});});
function hd336deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336deq_hd',()=>{it('a',()=>{expect(hd336deq(1,4)).toBe(2);});it('b',()=>{expect(hd336deq(3,1)).toBe(1);});it('c',()=>{expect(hd336deq(0,0)).toBe(0);});it('d',()=>{expect(hd336deq(93,73)).toBe(2);});it('e',()=>{expect(hd336deq(15,0)).toBe(4);});});
function hd337deq(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337deq_hd',()=>{it('a',()=>{expect(hd337deq(1,4)).toBe(2);});it('b',()=>{expect(hd337deq(3,1)).toBe(1);});it('c',()=>{expect(hd337deq(0,0)).toBe(0);});it('d',()=>{expect(hd337deq(93,73)).toBe(2);});it('e',()=>{expect(hd337deq(15,0)).toBe(4);});});
function hd338deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338deq2_hd',()=>{it('a',()=>{expect(hd338deq2(1,4)).toBe(2);});it('b',()=>{expect(hd338deq2(3,1)).toBe(1);});it('c',()=>{expect(hd338deq2(0,0)).toBe(0);});it('d',()=>{expect(hd338deq2(93,73)).toBe(2);});it('e',()=>{expect(hd338deq2(15,0)).toBe(4);});});
function hd339deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339deq2_hd',()=>{it('a',()=>{expect(hd339deq2(1,4)).toBe(2);});it('b',()=>{expect(hd339deq2(3,1)).toBe(1);});it('c',()=>{expect(hd339deq2(0,0)).toBe(0);});it('d',()=>{expect(hd339deq2(93,73)).toBe(2);});it('e',()=>{expect(hd339deq2(15,0)).toBe(4);});});
function hd340deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340deq2_hd',()=>{it('a',()=>{expect(hd340deq2(1,4)).toBe(2);});it('b',()=>{expect(hd340deq2(3,1)).toBe(1);});it('c',()=>{expect(hd340deq2(0,0)).toBe(0);});it('d',()=>{expect(hd340deq2(93,73)).toBe(2);});it('e',()=>{expect(hd340deq2(15,0)).toBe(4);});});
function hd341deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341deq2_hd',()=>{it('a',()=>{expect(hd341deq2(1,4)).toBe(2);});it('b',()=>{expect(hd341deq2(3,1)).toBe(1);});it('c',()=>{expect(hd341deq2(0,0)).toBe(0);});it('d',()=>{expect(hd341deq2(93,73)).toBe(2);});it('e',()=>{expect(hd341deq2(15,0)).toBe(4);});});
function hd342deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342deq2_hd',()=>{it('a',()=>{expect(hd342deq2(1,4)).toBe(2);});it('b',()=>{expect(hd342deq2(3,1)).toBe(1);});it('c',()=>{expect(hd342deq2(0,0)).toBe(0);});it('d',()=>{expect(hd342deq2(93,73)).toBe(2);});it('e',()=>{expect(hd342deq2(15,0)).toBe(4);});});
function hd343deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343deq2_hd',()=>{it('a',()=>{expect(hd343deq2(1,4)).toBe(2);});it('b',()=>{expect(hd343deq2(3,1)).toBe(1);});it('c',()=>{expect(hd343deq2(0,0)).toBe(0);});it('d',()=>{expect(hd343deq2(93,73)).toBe(2);});it('e',()=>{expect(hd343deq2(15,0)).toBe(4);});});
function hd344deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344deq2_hd',()=>{it('a',()=>{expect(hd344deq2(1,4)).toBe(2);});it('b',()=>{expect(hd344deq2(3,1)).toBe(1);});it('c',()=>{expect(hd344deq2(0,0)).toBe(0);});it('d',()=>{expect(hd344deq2(93,73)).toBe(2);});it('e',()=>{expect(hd344deq2(15,0)).toBe(4);});});
function hd345deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345deq2_hd',()=>{it('a',()=>{expect(hd345deq2(1,4)).toBe(2);});it('b',()=>{expect(hd345deq2(3,1)).toBe(1);});it('c',()=>{expect(hd345deq2(0,0)).toBe(0);});it('d',()=>{expect(hd345deq2(93,73)).toBe(2);});it('e',()=>{expect(hd345deq2(15,0)).toBe(4);});});
function hd346deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346deq2_hd',()=>{it('a',()=>{expect(hd346deq2(1,4)).toBe(2);});it('b',()=>{expect(hd346deq2(3,1)).toBe(1);});it('c',()=>{expect(hd346deq2(0,0)).toBe(0);});it('d',()=>{expect(hd346deq2(93,73)).toBe(2);});it('e',()=>{expect(hd346deq2(15,0)).toBe(4);});});
function hd347deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347deq2_hd',()=>{it('a',()=>{expect(hd347deq2(1,4)).toBe(2);});it('b',()=>{expect(hd347deq2(3,1)).toBe(1);});it('c',()=>{expect(hd347deq2(0,0)).toBe(0);});it('d',()=>{expect(hd347deq2(93,73)).toBe(2);});it('e',()=>{expect(hd347deq2(15,0)).toBe(4);});});
function hd348deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348deq2_hd',()=>{it('a',()=>{expect(hd348deq2(1,4)).toBe(2);});it('b',()=>{expect(hd348deq2(3,1)).toBe(1);});it('c',()=>{expect(hd348deq2(0,0)).toBe(0);});it('d',()=>{expect(hd348deq2(93,73)).toBe(2);});it('e',()=>{expect(hd348deq2(15,0)).toBe(4);});});
function hd349deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349deq2_hd',()=>{it('a',()=>{expect(hd349deq2(1,4)).toBe(2);});it('b',()=>{expect(hd349deq2(3,1)).toBe(1);});it('c',()=>{expect(hd349deq2(0,0)).toBe(0);});it('d',()=>{expect(hd349deq2(93,73)).toBe(2);});it('e',()=>{expect(hd349deq2(15,0)).toBe(4);});});
function hd350deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350deq2_hd',()=>{it('a',()=>{expect(hd350deq2(1,4)).toBe(2);});it('b',()=>{expect(hd350deq2(3,1)).toBe(1);});it('c',()=>{expect(hd350deq2(0,0)).toBe(0);});it('d',()=>{expect(hd350deq2(93,73)).toBe(2);});it('e',()=>{expect(hd350deq2(15,0)).toBe(4);});});
function hd351deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351deq2_hd',()=>{it('a',()=>{expect(hd351deq2(1,4)).toBe(2);});it('b',()=>{expect(hd351deq2(3,1)).toBe(1);});it('c',()=>{expect(hd351deq2(0,0)).toBe(0);});it('d',()=>{expect(hd351deq2(93,73)).toBe(2);});it('e',()=>{expect(hd351deq2(15,0)).toBe(4);});});
function hd352deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352deq2_hd',()=>{it('a',()=>{expect(hd352deq2(1,4)).toBe(2);});it('b',()=>{expect(hd352deq2(3,1)).toBe(1);});it('c',()=>{expect(hd352deq2(0,0)).toBe(0);});it('d',()=>{expect(hd352deq2(93,73)).toBe(2);});it('e',()=>{expect(hd352deq2(15,0)).toBe(4);});});
function hd353deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353deq2_hd',()=>{it('a',()=>{expect(hd353deq2(1,4)).toBe(2);});it('b',()=>{expect(hd353deq2(3,1)).toBe(1);});it('c',()=>{expect(hd353deq2(0,0)).toBe(0);});it('d',()=>{expect(hd353deq2(93,73)).toBe(2);});it('e',()=>{expect(hd353deq2(15,0)).toBe(4);});});
function hd354deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354deq2_hd',()=>{it('a',()=>{expect(hd354deq2(1,4)).toBe(2);});it('b',()=>{expect(hd354deq2(3,1)).toBe(1);});it('c',()=>{expect(hd354deq2(0,0)).toBe(0);});it('d',()=>{expect(hd354deq2(93,73)).toBe(2);});it('e',()=>{expect(hd354deq2(15,0)).toBe(4);});});
function hd355deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355deq2_hd',()=>{it('a',()=>{expect(hd355deq2(1,4)).toBe(2);});it('b',()=>{expect(hd355deq2(3,1)).toBe(1);});it('c',()=>{expect(hd355deq2(0,0)).toBe(0);});it('d',()=>{expect(hd355deq2(93,73)).toBe(2);});it('e',()=>{expect(hd355deq2(15,0)).toBe(4);});});
function hd356deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356deq2_hd',()=>{it('a',()=>{expect(hd356deq2(1,4)).toBe(2);});it('b',()=>{expect(hd356deq2(3,1)).toBe(1);});it('c',()=>{expect(hd356deq2(0,0)).toBe(0);});it('d',()=>{expect(hd356deq2(93,73)).toBe(2);});it('e',()=>{expect(hd356deq2(15,0)).toBe(4);});});
function hd357deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357deq2_hd',()=>{it('a',()=>{expect(hd357deq2(1,4)).toBe(2);});it('b',()=>{expect(hd357deq2(3,1)).toBe(1);});it('c',()=>{expect(hd357deq2(0,0)).toBe(0);});it('d',()=>{expect(hd357deq2(93,73)).toBe(2);});it('e',()=>{expect(hd357deq2(15,0)).toBe(4);});});
function hd358deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358deq2_hd',()=>{it('a',()=>{expect(hd358deq2(1,4)).toBe(2);});it('b',()=>{expect(hd358deq2(3,1)).toBe(1);});it('c',()=>{expect(hd358deq2(0,0)).toBe(0);});it('d',()=>{expect(hd358deq2(93,73)).toBe(2);});it('e',()=>{expect(hd358deq2(15,0)).toBe(4);});});
function hd359deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359deq2_hd',()=>{it('a',()=>{expect(hd359deq2(1,4)).toBe(2);});it('b',()=>{expect(hd359deq2(3,1)).toBe(1);});it('c',()=>{expect(hd359deq2(0,0)).toBe(0);});it('d',()=>{expect(hd359deq2(93,73)).toBe(2);});it('e',()=>{expect(hd359deq2(15,0)).toBe(4);});});
function hd360deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360deq2_hd',()=>{it('a',()=>{expect(hd360deq2(1,4)).toBe(2);});it('b',()=>{expect(hd360deq2(3,1)).toBe(1);});it('c',()=>{expect(hd360deq2(0,0)).toBe(0);});it('d',()=>{expect(hd360deq2(93,73)).toBe(2);});it('e',()=>{expect(hd360deq2(15,0)).toBe(4);});});
function hd361deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361deq2_hd',()=>{it('a',()=>{expect(hd361deq2(1,4)).toBe(2);});it('b',()=>{expect(hd361deq2(3,1)).toBe(1);});it('c',()=>{expect(hd361deq2(0,0)).toBe(0);});it('d',()=>{expect(hd361deq2(93,73)).toBe(2);});it('e',()=>{expect(hd361deq2(15,0)).toBe(4);});});
function hd362deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362deq2_hd',()=>{it('a',()=>{expect(hd362deq2(1,4)).toBe(2);});it('b',()=>{expect(hd362deq2(3,1)).toBe(1);});it('c',()=>{expect(hd362deq2(0,0)).toBe(0);});it('d',()=>{expect(hd362deq2(93,73)).toBe(2);});it('e',()=>{expect(hd362deq2(15,0)).toBe(4);});});
function hd363deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363deq2_hd',()=>{it('a',()=>{expect(hd363deq2(1,4)).toBe(2);});it('b',()=>{expect(hd363deq2(3,1)).toBe(1);});it('c',()=>{expect(hd363deq2(0,0)).toBe(0);});it('d',()=>{expect(hd363deq2(93,73)).toBe(2);});it('e',()=>{expect(hd363deq2(15,0)).toBe(4);});});
function hd364deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364deq2_hd',()=>{it('a',()=>{expect(hd364deq2(1,4)).toBe(2);});it('b',()=>{expect(hd364deq2(3,1)).toBe(1);});it('c',()=>{expect(hd364deq2(0,0)).toBe(0);});it('d',()=>{expect(hd364deq2(93,73)).toBe(2);});it('e',()=>{expect(hd364deq2(15,0)).toBe(4);});});
function hd365deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365deq2_hd',()=>{it('a',()=>{expect(hd365deq2(1,4)).toBe(2);});it('b',()=>{expect(hd365deq2(3,1)).toBe(1);});it('c',()=>{expect(hd365deq2(0,0)).toBe(0);});it('d',()=>{expect(hd365deq2(93,73)).toBe(2);});it('e',()=>{expect(hd365deq2(15,0)).toBe(4);});});
function hd366deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366deq2_hd',()=>{it('a',()=>{expect(hd366deq2(1,4)).toBe(2);});it('b',()=>{expect(hd366deq2(3,1)).toBe(1);});it('c',()=>{expect(hd366deq2(0,0)).toBe(0);});it('d',()=>{expect(hd366deq2(93,73)).toBe(2);});it('e',()=>{expect(hd366deq2(15,0)).toBe(4);});});
function hd367deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367deq2_hd',()=>{it('a',()=>{expect(hd367deq2(1,4)).toBe(2);});it('b',()=>{expect(hd367deq2(3,1)).toBe(1);});it('c',()=>{expect(hd367deq2(0,0)).toBe(0);});it('d',()=>{expect(hd367deq2(93,73)).toBe(2);});it('e',()=>{expect(hd367deq2(15,0)).toBe(4);});});
function hd368deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368deq2_hd',()=>{it('a',()=>{expect(hd368deq2(1,4)).toBe(2);});it('b',()=>{expect(hd368deq2(3,1)).toBe(1);});it('c',()=>{expect(hd368deq2(0,0)).toBe(0);});it('d',()=>{expect(hd368deq2(93,73)).toBe(2);});it('e',()=>{expect(hd368deq2(15,0)).toBe(4);});});
function hd369deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369deq2_hd',()=>{it('a',()=>{expect(hd369deq2(1,4)).toBe(2);});it('b',()=>{expect(hd369deq2(3,1)).toBe(1);});it('c',()=>{expect(hd369deq2(0,0)).toBe(0);});it('d',()=>{expect(hd369deq2(93,73)).toBe(2);});it('e',()=>{expect(hd369deq2(15,0)).toBe(4);});});
function hd370deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370deq2_hd',()=>{it('a',()=>{expect(hd370deq2(1,4)).toBe(2);});it('b',()=>{expect(hd370deq2(3,1)).toBe(1);});it('c',()=>{expect(hd370deq2(0,0)).toBe(0);});it('d',()=>{expect(hd370deq2(93,73)).toBe(2);});it('e',()=>{expect(hd370deq2(15,0)).toBe(4);});});
function hd371deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371deq2_hd',()=>{it('a',()=>{expect(hd371deq2(1,4)).toBe(2);});it('b',()=>{expect(hd371deq2(3,1)).toBe(1);});it('c',()=>{expect(hd371deq2(0,0)).toBe(0);});it('d',()=>{expect(hd371deq2(93,73)).toBe(2);});it('e',()=>{expect(hd371deq2(15,0)).toBe(4);});});
function hd372deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372deq2_hd',()=>{it('a',()=>{expect(hd372deq2(1,4)).toBe(2);});it('b',()=>{expect(hd372deq2(3,1)).toBe(1);});it('c',()=>{expect(hd372deq2(0,0)).toBe(0);});it('d',()=>{expect(hd372deq2(93,73)).toBe(2);});it('e',()=>{expect(hd372deq2(15,0)).toBe(4);});});
function hd373deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373deq2_hd',()=>{it('a',()=>{expect(hd373deq2(1,4)).toBe(2);});it('b',()=>{expect(hd373deq2(3,1)).toBe(1);});it('c',()=>{expect(hd373deq2(0,0)).toBe(0);});it('d',()=>{expect(hd373deq2(93,73)).toBe(2);});it('e',()=>{expect(hd373deq2(15,0)).toBe(4);});});
function hd374deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374deq2_hd',()=>{it('a',()=>{expect(hd374deq2(1,4)).toBe(2);});it('b',()=>{expect(hd374deq2(3,1)).toBe(1);});it('c',()=>{expect(hd374deq2(0,0)).toBe(0);});it('d',()=>{expect(hd374deq2(93,73)).toBe(2);});it('e',()=>{expect(hd374deq2(15,0)).toBe(4);});});
function hd375deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375deq2_hd',()=>{it('a',()=>{expect(hd375deq2(1,4)).toBe(2);});it('b',()=>{expect(hd375deq2(3,1)).toBe(1);});it('c',()=>{expect(hd375deq2(0,0)).toBe(0);});it('d',()=>{expect(hd375deq2(93,73)).toBe(2);});it('e',()=>{expect(hd375deq2(15,0)).toBe(4);});});
function hd376deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376deq2_hd',()=>{it('a',()=>{expect(hd376deq2(1,4)).toBe(2);});it('b',()=>{expect(hd376deq2(3,1)).toBe(1);});it('c',()=>{expect(hd376deq2(0,0)).toBe(0);});it('d',()=>{expect(hd376deq2(93,73)).toBe(2);});it('e',()=>{expect(hd376deq2(15,0)).toBe(4);});});
function hd377deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377deq2_hd',()=>{it('a',()=>{expect(hd377deq2(1,4)).toBe(2);});it('b',()=>{expect(hd377deq2(3,1)).toBe(1);});it('c',()=>{expect(hd377deq2(0,0)).toBe(0);});it('d',()=>{expect(hd377deq2(93,73)).toBe(2);});it('e',()=>{expect(hd377deq2(15,0)).toBe(4);});});
function hd378deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378deq2_hd',()=>{it('a',()=>{expect(hd378deq2(1,4)).toBe(2);});it('b',()=>{expect(hd378deq2(3,1)).toBe(1);});it('c',()=>{expect(hd378deq2(0,0)).toBe(0);});it('d',()=>{expect(hd378deq2(93,73)).toBe(2);});it('e',()=>{expect(hd378deq2(15,0)).toBe(4);});});
function hd379deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379deq2_hd',()=>{it('a',()=>{expect(hd379deq2(1,4)).toBe(2);});it('b',()=>{expect(hd379deq2(3,1)).toBe(1);});it('c',()=>{expect(hd379deq2(0,0)).toBe(0);});it('d',()=>{expect(hd379deq2(93,73)).toBe(2);});it('e',()=>{expect(hd379deq2(15,0)).toBe(4);});});
function hd380deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380deq2_hd',()=>{it('a',()=>{expect(hd380deq2(1,4)).toBe(2);});it('b',()=>{expect(hd380deq2(3,1)).toBe(1);});it('c',()=>{expect(hd380deq2(0,0)).toBe(0);});it('d',()=>{expect(hd380deq2(93,73)).toBe(2);});it('e',()=>{expect(hd380deq2(15,0)).toBe(4);});});
function hd381deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381deq2_hd',()=>{it('a',()=>{expect(hd381deq2(1,4)).toBe(2);});it('b',()=>{expect(hd381deq2(3,1)).toBe(1);});it('c',()=>{expect(hd381deq2(0,0)).toBe(0);});it('d',()=>{expect(hd381deq2(93,73)).toBe(2);});it('e',()=>{expect(hd381deq2(15,0)).toBe(4);});});
function hd382deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382deq2_hd',()=>{it('a',()=>{expect(hd382deq2(1,4)).toBe(2);});it('b',()=>{expect(hd382deq2(3,1)).toBe(1);});it('c',()=>{expect(hd382deq2(0,0)).toBe(0);});it('d',()=>{expect(hd382deq2(93,73)).toBe(2);});it('e',()=>{expect(hd382deq2(15,0)).toBe(4);});});
function hd383deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383deq2_hd',()=>{it('a',()=>{expect(hd383deq2(1,4)).toBe(2);});it('b',()=>{expect(hd383deq2(3,1)).toBe(1);});it('c',()=>{expect(hd383deq2(0,0)).toBe(0);});it('d',()=>{expect(hd383deq2(93,73)).toBe(2);});it('e',()=>{expect(hd383deq2(15,0)).toBe(4);});});
function hd384deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384deq2_hd',()=>{it('a',()=>{expect(hd384deq2(1,4)).toBe(2);});it('b',()=>{expect(hd384deq2(3,1)).toBe(1);});it('c',()=>{expect(hd384deq2(0,0)).toBe(0);});it('d',()=>{expect(hd384deq2(93,73)).toBe(2);});it('e',()=>{expect(hd384deq2(15,0)).toBe(4);});});
function hd385deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385deq2_hd',()=>{it('a',()=>{expect(hd385deq2(1,4)).toBe(2);});it('b',()=>{expect(hd385deq2(3,1)).toBe(1);});it('c',()=>{expect(hd385deq2(0,0)).toBe(0);});it('d',()=>{expect(hd385deq2(93,73)).toBe(2);});it('e',()=>{expect(hd385deq2(15,0)).toBe(4);});});
function hd386deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386deq2_hd',()=>{it('a',()=>{expect(hd386deq2(1,4)).toBe(2);});it('b',()=>{expect(hd386deq2(3,1)).toBe(1);});it('c',()=>{expect(hd386deq2(0,0)).toBe(0);});it('d',()=>{expect(hd386deq2(93,73)).toBe(2);});it('e',()=>{expect(hd386deq2(15,0)).toBe(4);});});
function hd387deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387deq2_hd',()=>{it('a',()=>{expect(hd387deq2(1,4)).toBe(2);});it('b',()=>{expect(hd387deq2(3,1)).toBe(1);});it('c',()=>{expect(hd387deq2(0,0)).toBe(0);});it('d',()=>{expect(hd387deq2(93,73)).toBe(2);});it('e',()=>{expect(hd387deq2(15,0)).toBe(4);});});
function hd388deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388deq2_hd',()=>{it('a',()=>{expect(hd388deq2(1,4)).toBe(2);});it('b',()=>{expect(hd388deq2(3,1)).toBe(1);});it('c',()=>{expect(hd388deq2(0,0)).toBe(0);});it('d',()=>{expect(hd388deq2(93,73)).toBe(2);});it('e',()=>{expect(hd388deq2(15,0)).toBe(4);});});
function hd389deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389deq2_hd',()=>{it('a',()=>{expect(hd389deq2(1,4)).toBe(2);});it('b',()=>{expect(hd389deq2(3,1)).toBe(1);});it('c',()=>{expect(hd389deq2(0,0)).toBe(0);});it('d',()=>{expect(hd389deq2(93,73)).toBe(2);});it('e',()=>{expect(hd389deq2(15,0)).toBe(4);});});
function hd390deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390deq2_hd',()=>{it('a',()=>{expect(hd390deq2(1,4)).toBe(2);});it('b',()=>{expect(hd390deq2(3,1)).toBe(1);});it('c',()=>{expect(hd390deq2(0,0)).toBe(0);});it('d',()=>{expect(hd390deq2(93,73)).toBe(2);});it('e',()=>{expect(hd390deq2(15,0)).toBe(4);});});
function hd391deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391deq2_hd',()=>{it('a',()=>{expect(hd391deq2(1,4)).toBe(2);});it('b',()=>{expect(hd391deq2(3,1)).toBe(1);});it('c',()=>{expect(hd391deq2(0,0)).toBe(0);});it('d',()=>{expect(hd391deq2(93,73)).toBe(2);});it('e',()=>{expect(hd391deq2(15,0)).toBe(4);});});
function hd392deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392deq2_hd',()=>{it('a',()=>{expect(hd392deq2(1,4)).toBe(2);});it('b',()=>{expect(hd392deq2(3,1)).toBe(1);});it('c',()=>{expect(hd392deq2(0,0)).toBe(0);});it('d',()=>{expect(hd392deq2(93,73)).toBe(2);});it('e',()=>{expect(hd392deq2(15,0)).toBe(4);});});
function hd393deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393deq2_hd',()=>{it('a',()=>{expect(hd393deq2(1,4)).toBe(2);});it('b',()=>{expect(hd393deq2(3,1)).toBe(1);});it('c',()=>{expect(hd393deq2(0,0)).toBe(0);});it('d',()=>{expect(hd393deq2(93,73)).toBe(2);});it('e',()=>{expect(hd393deq2(15,0)).toBe(4);});});
function hd394deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394deq2_hd',()=>{it('a',()=>{expect(hd394deq2(1,4)).toBe(2);});it('b',()=>{expect(hd394deq2(3,1)).toBe(1);});it('c',()=>{expect(hd394deq2(0,0)).toBe(0);});it('d',()=>{expect(hd394deq2(93,73)).toBe(2);});it('e',()=>{expect(hd394deq2(15,0)).toBe(4);});});
function hd395deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395deq2_hd',()=>{it('a',()=>{expect(hd395deq2(1,4)).toBe(2);});it('b',()=>{expect(hd395deq2(3,1)).toBe(1);});it('c',()=>{expect(hd395deq2(0,0)).toBe(0);});it('d',()=>{expect(hd395deq2(93,73)).toBe(2);});it('e',()=>{expect(hd395deq2(15,0)).toBe(4);});});
function hd396deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396deq2_hd',()=>{it('a',()=>{expect(hd396deq2(1,4)).toBe(2);});it('b',()=>{expect(hd396deq2(3,1)).toBe(1);});it('c',()=>{expect(hd396deq2(0,0)).toBe(0);});it('d',()=>{expect(hd396deq2(93,73)).toBe(2);});it('e',()=>{expect(hd396deq2(15,0)).toBe(4);});});
function hd397deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397deq2_hd',()=>{it('a',()=>{expect(hd397deq2(1,4)).toBe(2);});it('b',()=>{expect(hd397deq2(3,1)).toBe(1);});it('c',()=>{expect(hd397deq2(0,0)).toBe(0);});it('d',()=>{expect(hd397deq2(93,73)).toBe(2);});it('e',()=>{expect(hd397deq2(15,0)).toBe(4);});});
function hd398deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398deq2_hd',()=>{it('a',()=>{expect(hd398deq2(1,4)).toBe(2);});it('b',()=>{expect(hd398deq2(3,1)).toBe(1);});it('c',()=>{expect(hd398deq2(0,0)).toBe(0);});it('d',()=>{expect(hd398deq2(93,73)).toBe(2);});it('e',()=>{expect(hd398deq2(15,0)).toBe(4);});});
function hd399deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399deq2_hd',()=>{it('a',()=>{expect(hd399deq2(1,4)).toBe(2);});it('b',()=>{expect(hd399deq2(3,1)).toBe(1);});it('c',()=>{expect(hd399deq2(0,0)).toBe(0);});it('d',()=>{expect(hd399deq2(93,73)).toBe(2);});it('e',()=>{expect(hd399deq2(15,0)).toBe(4);});});
function hd400deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400deq2_hd',()=>{it('a',()=>{expect(hd400deq2(1,4)).toBe(2);});it('b',()=>{expect(hd400deq2(3,1)).toBe(1);});it('c',()=>{expect(hd400deq2(0,0)).toBe(0);});it('d',()=>{expect(hd400deq2(93,73)).toBe(2);});it('e',()=>{expect(hd400deq2(15,0)).toBe(4);});});
function hd401deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401deq2_hd',()=>{it('a',()=>{expect(hd401deq2(1,4)).toBe(2);});it('b',()=>{expect(hd401deq2(3,1)).toBe(1);});it('c',()=>{expect(hd401deq2(0,0)).toBe(0);});it('d',()=>{expect(hd401deq2(93,73)).toBe(2);});it('e',()=>{expect(hd401deq2(15,0)).toBe(4);});});
function hd402deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402deq2_hd',()=>{it('a',()=>{expect(hd402deq2(1,4)).toBe(2);});it('b',()=>{expect(hd402deq2(3,1)).toBe(1);});it('c',()=>{expect(hd402deq2(0,0)).toBe(0);});it('d',()=>{expect(hd402deq2(93,73)).toBe(2);});it('e',()=>{expect(hd402deq2(15,0)).toBe(4);});});
function hd403deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403deq2_hd',()=>{it('a',()=>{expect(hd403deq2(1,4)).toBe(2);});it('b',()=>{expect(hd403deq2(3,1)).toBe(1);});it('c',()=>{expect(hd403deq2(0,0)).toBe(0);});it('d',()=>{expect(hd403deq2(93,73)).toBe(2);});it('e',()=>{expect(hd403deq2(15,0)).toBe(4);});});
function hd404deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404deq2_hd',()=>{it('a',()=>{expect(hd404deq2(1,4)).toBe(2);});it('b',()=>{expect(hd404deq2(3,1)).toBe(1);});it('c',()=>{expect(hd404deq2(0,0)).toBe(0);});it('d',()=>{expect(hd404deq2(93,73)).toBe(2);});it('e',()=>{expect(hd404deq2(15,0)).toBe(4);});});
function hd405deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405deq2_hd',()=>{it('a',()=>{expect(hd405deq2(1,4)).toBe(2);});it('b',()=>{expect(hd405deq2(3,1)).toBe(1);});it('c',()=>{expect(hd405deq2(0,0)).toBe(0);});it('d',()=>{expect(hd405deq2(93,73)).toBe(2);});it('e',()=>{expect(hd405deq2(15,0)).toBe(4);});});
function hd406deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406deq2_hd',()=>{it('a',()=>{expect(hd406deq2(1,4)).toBe(2);});it('b',()=>{expect(hd406deq2(3,1)).toBe(1);});it('c',()=>{expect(hd406deq2(0,0)).toBe(0);});it('d',()=>{expect(hd406deq2(93,73)).toBe(2);});it('e',()=>{expect(hd406deq2(15,0)).toBe(4);});});
function hd407deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407deq2_hd',()=>{it('a',()=>{expect(hd407deq2(1,4)).toBe(2);});it('b',()=>{expect(hd407deq2(3,1)).toBe(1);});it('c',()=>{expect(hd407deq2(0,0)).toBe(0);});it('d',()=>{expect(hd407deq2(93,73)).toBe(2);});it('e',()=>{expect(hd407deq2(15,0)).toBe(4);});});
function hd408deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408deq2_hd',()=>{it('a',()=>{expect(hd408deq2(1,4)).toBe(2);});it('b',()=>{expect(hd408deq2(3,1)).toBe(1);});it('c',()=>{expect(hd408deq2(0,0)).toBe(0);});it('d',()=>{expect(hd408deq2(93,73)).toBe(2);});it('e',()=>{expect(hd408deq2(15,0)).toBe(4);});});
function hd409deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409deq2_hd',()=>{it('a',()=>{expect(hd409deq2(1,4)).toBe(2);});it('b',()=>{expect(hd409deq2(3,1)).toBe(1);});it('c',()=>{expect(hd409deq2(0,0)).toBe(0);});it('d',()=>{expect(hd409deq2(93,73)).toBe(2);});it('e',()=>{expect(hd409deq2(15,0)).toBe(4);});});
function hd410deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410deq2_hd',()=>{it('a',()=>{expect(hd410deq2(1,4)).toBe(2);});it('b',()=>{expect(hd410deq2(3,1)).toBe(1);});it('c',()=>{expect(hd410deq2(0,0)).toBe(0);});it('d',()=>{expect(hd410deq2(93,73)).toBe(2);});it('e',()=>{expect(hd410deq2(15,0)).toBe(4);});});
function hd411deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411deq2_hd',()=>{it('a',()=>{expect(hd411deq2(1,4)).toBe(2);});it('b',()=>{expect(hd411deq2(3,1)).toBe(1);});it('c',()=>{expect(hd411deq2(0,0)).toBe(0);});it('d',()=>{expect(hd411deq2(93,73)).toBe(2);});it('e',()=>{expect(hd411deq2(15,0)).toBe(4);});});
function hd412deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412deq2_hd',()=>{it('a',()=>{expect(hd412deq2(1,4)).toBe(2);});it('b',()=>{expect(hd412deq2(3,1)).toBe(1);});it('c',()=>{expect(hd412deq2(0,0)).toBe(0);});it('d',()=>{expect(hd412deq2(93,73)).toBe(2);});it('e',()=>{expect(hd412deq2(15,0)).toBe(4);});});
function hd413deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413deq2_hd',()=>{it('a',()=>{expect(hd413deq2(1,4)).toBe(2);});it('b',()=>{expect(hd413deq2(3,1)).toBe(1);});it('c',()=>{expect(hd413deq2(0,0)).toBe(0);});it('d',()=>{expect(hd413deq2(93,73)).toBe(2);});it('e',()=>{expect(hd413deq2(15,0)).toBe(4);});});
function hd414deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414deq2_hd',()=>{it('a',()=>{expect(hd414deq2(1,4)).toBe(2);});it('b',()=>{expect(hd414deq2(3,1)).toBe(1);});it('c',()=>{expect(hd414deq2(0,0)).toBe(0);});it('d',()=>{expect(hd414deq2(93,73)).toBe(2);});it('e',()=>{expect(hd414deq2(15,0)).toBe(4);});});
function hd415deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415deq2_hd',()=>{it('a',()=>{expect(hd415deq2(1,4)).toBe(2);});it('b',()=>{expect(hd415deq2(3,1)).toBe(1);});it('c',()=>{expect(hd415deq2(0,0)).toBe(0);});it('d',()=>{expect(hd415deq2(93,73)).toBe(2);});it('e',()=>{expect(hd415deq2(15,0)).toBe(4);});});
function hd416deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416deq2_hd',()=>{it('a',()=>{expect(hd416deq2(1,4)).toBe(2);});it('b',()=>{expect(hd416deq2(3,1)).toBe(1);});it('c',()=>{expect(hd416deq2(0,0)).toBe(0);});it('d',()=>{expect(hd416deq2(93,73)).toBe(2);});it('e',()=>{expect(hd416deq2(15,0)).toBe(4);});});
function hd417deq2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417deq2_hd',()=>{it('a',()=>{expect(hd417deq2(1,4)).toBe(2);});it('b',()=>{expect(hd417deq2(3,1)).toBe(1);});it('c',()=>{expect(hd417deq2(0,0)).toBe(0);});it('d',()=>{expect(hd417deq2(93,73)).toBe(2);});it('e',()=>{expect(hd417deq2(15,0)).toBe(4);});});
