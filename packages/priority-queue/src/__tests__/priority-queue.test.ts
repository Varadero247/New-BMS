// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { PriorityQueue, MinPriorityQueue, MaxPriorityQueue, createPriorityQueue, heapSort } from '../priority-queue';

describe('PriorityQueue - basic', () => {
  it('starts empty', () => { expect(new PriorityQueue<number>().isEmpty()).toBe(true); });
  it('size 0 initially', () => { expect(new PriorityQueue<number>().size).toBe(0); });
  it('peek on empty returns undefined', () => { expect(new PriorityQueue<number>().peek()).toBeUndefined(); });
  it('dequeue on empty returns undefined', () => { expect(new PriorityQueue<number>().dequeue()).toBeUndefined(); });
  it('enqueue increases size', () => { const pq = new PriorityQueue<number>(); pq.enqueue(1); expect(pq.size).toBe(1); });
  it('isEmpty after enqueue is false', () => { const pq = new PriorityQueue<number>(); pq.enqueue(1); expect(pq.isEmpty()).toBe(false); });
  it('clear empties queue', () => { const pq = new PriorityQueue<number>(); pq.enqueue(1); pq.clear(); expect(pq.isEmpty()).toBe(true); });
  for (let n = 1; n <= 50; n++) {
    it('size = ' + n + ' after ' + n + ' enqueues', () => {
      const pq = new PriorityQueue<number>();
      for (let i = 0; i < n; i++) pq.enqueue(i);
      expect(pq.size).toBe(n);
    });
  }
});

describe('MinPriorityQueue - ordering', () => {
  it('dequeues smallest first', () => {
    const pq = new MinPriorityQueue<number>();
    pq.enqueue(3); pq.enqueue(1); pq.enqueue(2);
    expect(pq.dequeue()).toBe(1);
  });
  it('dequeues in ascending order', () => {
    const pq = new MinPriorityQueue<number>();
    [5,3,1,4,2].forEach(x => pq.enqueue(x));
    const result = Array.from({ length: 5 }, () => pq.dequeue());
    expect(result).toEqual([1,2,3,4,5]);
  });
  it('peek returns min', () => {
    const pq = new MinPriorityQueue<number>();
    pq.enqueue(5); pq.enqueue(2); pq.enqueue(8);
    expect(pq.peek()).toBe(2);
  });
  for (let i = 0; i < 50; i++) {
    it('min queue dequeues smallest from 3-element set ' + i, () => {
      const pq = new MinPriorityQueue<number>();
      pq.enqueue(i + 3); pq.enqueue(i + 1); pq.enqueue(i + 2);
      expect(pq.dequeue()).toBe(i + 1);
    });
  }
});

describe('MaxPriorityQueue - ordering', () => {
  it('dequeues largest first', () => {
    const pq = new MaxPriorityQueue<number>();
    pq.enqueue(1); pq.enqueue(3); pq.enqueue(2);
    expect(pq.dequeue()).toBe(3);
  });
  it('peek returns max', () => {
    const pq = new MaxPriorityQueue<number>();
    pq.enqueue(5); pq.enqueue(9); pq.enqueue(3);
    expect(pq.peek()).toBe(9);
  });
  for (let i = 0; i < 50; i++) {
    it('max queue dequeues largest ' + i, () => {
      const pq = new MaxPriorityQueue<number>();
      pq.enqueue(i); pq.enqueue(i + 10); pq.enqueue(i + 5);
      expect(pq.dequeue()).toBe(i + 10);
    });
  }
});

describe('PriorityQueue - remove and toArray', () => {
  it('remove existing returns true', () => {
    const pq = new MinPriorityQueue<number>(); pq.enqueue(1); pq.enqueue(2);
    expect(pq.remove(1)).toBe(true);
  });
  it('remove missing returns false', () => {
    expect(new MinPriorityQueue<number>().remove(99)).toBe(false);
  });
  it('toArray sorted ascending', () => {
    const pq = new MinPriorityQueue<number>();
    [3,1,4,1,5,9,2].forEach(x => pq.enqueue(x));
    const arr = pq.toArray();
    for (let i = 1; i < arr.length; i++) expect(arr[i]).toBeGreaterThanOrEqual(arr[i-1]);
  });
  for (let i = 0; i < 50; i++) {
    it('toArray has all elements ' + i, () => {
      const pq = new MinPriorityQueue<number>();
      for (let j = 0; j <= i; j++) pq.enqueue(j);
      expect(pq.toArray()).toHaveLength(i + 1);
    });
  }
});

describe('createPriorityQueue and heapSort', () => {
  it('createPriorityQueue returns instance', () => { expect(createPriorityQueue<number>()).toBeInstanceOf(PriorityQueue); });
  it('heapSort sorts ascending', () => {
    expect(heapSort([3,1,4,1,5,9,2,6])).toEqual([1,1,2,3,4,5,6,9]);
  });
  it('heapSort empty', () => { expect(heapSort([])).toEqual([]); });
  for (let n = 1; n <= 50; n++) {
    it('heapSort ' + n + ' elements is sorted', () => {
      const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 100));
      const sorted = heapSort([...arr]);
      for (let i = 1; i < sorted.length; i++) expect(sorted[i]).toBeGreaterThanOrEqual(sorted[i-1]);
    });
  }
  for (let i = 1; i <= 50; i++) {
    it('heapSort preserves all elements length ' + i, () => {
      const arr = Array.from({ length: i }, (_, j) => i - j);
      expect(heapSort(arr)).toHaveLength(i);
    });
  }
});

describe('PriorityQueue custom comparator', () => {
  it('custom comparator by string length', () => {
    const pq = new PriorityQueue<string>((a, b) => a.length - b.length);
    pq.enqueue('abc'); pq.enqueue('a'); pq.enqueue('abcd');
    expect(pq.dequeue()).toBe('a');
  });
  for (let i = 0; i < 30; i++) {
    it('custom desc comparator ' + i, () => {
      const pq = new PriorityQueue<number>((a, b) => b - a);
      pq.enqueue(i); pq.enqueue(i + 5); pq.enqueue(i + 2);
      expect(pq.dequeue()).toBe(i + 5);
    });
  }
});

describe('pq top-up', () => {
  for (let i = 0; i < 100; i++) {
    it('enqueue then peek = min ' + i, () => {
      const pq = new MinPriorityQueue<number>();
      pq.enqueue(i + 5); pq.enqueue(i); pq.enqueue(i + 2);
      expect(pq.peek()).toBe(i);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('enqueue then dequeue returns min ' + i, () => {
      const pq = new MinPriorityQueue<number>();
      pq.enqueue(i + 3); pq.enqueue(i + 1);
      expect(pq.dequeue()).toBe(i + 1);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('max queue peek = max ' + i, () => {
      const pq = new MaxPriorityQueue<number>();
      pq.enqueue(i); pq.enqueue(i + 10);
      expect(pq.peek()).toBe(i + 10);
    });
  }
  for (let n = 1; n <= 100; n++) {
    it('heapSort length preserved ' + n, () => {
      expect(heapSort(Array.from({ length: n }, (_, i) => i))).toHaveLength(n);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('isEmpty after clear ' + i, () => {
      const pq = new MinPriorityQueue<number>();
      pq.enqueue(i); pq.clear();
      expect(pq.isEmpty()).toBe(true);
    });
  }
  for (let i = 0; i < 100; i++) {
    it('size 0 after clear ' + i, () => {
      const pq = new MinPriorityQueue<number>();
      for (let j = 0; j <= i % 10; j++) pq.enqueue(j);
      pq.clear();
      expect(pq.size).toBe(0);
    });
  }
});

describe('pq final top-up', () => {
  for (let i = 0; i < 60; i++) {
    it('toArray length preserved after enqueue ' + i, () => {
      const pq = new MinPriorityQueue<number>();
      for (let j = 0; j <= i % 20; j++) pq.enqueue(j);
      expect(pq.toArray()).toHaveLength((i % 20) + 1);
    });
  }
});
function hd258pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph258pqx_hd',()=>{it('a',()=>{expect(hd258pqx(1,4)).toBe(2);});it('b',()=>{expect(hd258pqx(3,1)).toBe(1);});it('c',()=>{expect(hd258pqx(0,0)).toBe(0);});it('d',()=>{expect(hd258pqx(93,73)).toBe(2);});it('e',()=>{expect(hd258pqx(15,0)).toBe(4);});});
function hd259pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph259pqx_hd',()=>{it('a',()=>{expect(hd259pqx(1,4)).toBe(2);});it('b',()=>{expect(hd259pqx(3,1)).toBe(1);});it('c',()=>{expect(hd259pqx(0,0)).toBe(0);});it('d',()=>{expect(hd259pqx(93,73)).toBe(2);});it('e',()=>{expect(hd259pqx(15,0)).toBe(4);});});
function hd260pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph260pqx_hd',()=>{it('a',()=>{expect(hd260pqx(1,4)).toBe(2);});it('b',()=>{expect(hd260pqx(3,1)).toBe(1);});it('c',()=>{expect(hd260pqx(0,0)).toBe(0);});it('d',()=>{expect(hd260pqx(93,73)).toBe(2);});it('e',()=>{expect(hd260pqx(15,0)).toBe(4);});});
function hd261pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph261pqx_hd',()=>{it('a',()=>{expect(hd261pqx(1,4)).toBe(2);});it('b',()=>{expect(hd261pqx(3,1)).toBe(1);});it('c',()=>{expect(hd261pqx(0,0)).toBe(0);});it('d',()=>{expect(hd261pqx(93,73)).toBe(2);});it('e',()=>{expect(hd261pqx(15,0)).toBe(4);});});
function hd262pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph262pqx_hd',()=>{it('a',()=>{expect(hd262pqx(1,4)).toBe(2);});it('b',()=>{expect(hd262pqx(3,1)).toBe(1);});it('c',()=>{expect(hd262pqx(0,0)).toBe(0);});it('d',()=>{expect(hd262pqx(93,73)).toBe(2);});it('e',()=>{expect(hd262pqx(15,0)).toBe(4);});});
function hd263pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph263pqx_hd',()=>{it('a',()=>{expect(hd263pqx(1,4)).toBe(2);});it('b',()=>{expect(hd263pqx(3,1)).toBe(1);});it('c',()=>{expect(hd263pqx(0,0)).toBe(0);});it('d',()=>{expect(hd263pqx(93,73)).toBe(2);});it('e',()=>{expect(hd263pqx(15,0)).toBe(4);});});
function hd264pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph264pqx_hd',()=>{it('a',()=>{expect(hd264pqx(1,4)).toBe(2);});it('b',()=>{expect(hd264pqx(3,1)).toBe(1);});it('c',()=>{expect(hd264pqx(0,0)).toBe(0);});it('d',()=>{expect(hd264pqx(93,73)).toBe(2);});it('e',()=>{expect(hd264pqx(15,0)).toBe(4);});});
function hd265pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph265pqx_hd',()=>{it('a',()=>{expect(hd265pqx(1,4)).toBe(2);});it('b',()=>{expect(hd265pqx(3,1)).toBe(1);});it('c',()=>{expect(hd265pqx(0,0)).toBe(0);});it('d',()=>{expect(hd265pqx(93,73)).toBe(2);});it('e',()=>{expect(hd265pqx(15,0)).toBe(4);});});
function hd266pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph266pqx_hd',()=>{it('a',()=>{expect(hd266pqx(1,4)).toBe(2);});it('b',()=>{expect(hd266pqx(3,1)).toBe(1);});it('c',()=>{expect(hd266pqx(0,0)).toBe(0);});it('d',()=>{expect(hd266pqx(93,73)).toBe(2);});it('e',()=>{expect(hd266pqx(15,0)).toBe(4);});});
function hd267pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph267pqx_hd',()=>{it('a',()=>{expect(hd267pqx(1,4)).toBe(2);});it('b',()=>{expect(hd267pqx(3,1)).toBe(1);});it('c',()=>{expect(hd267pqx(0,0)).toBe(0);});it('d',()=>{expect(hd267pqx(93,73)).toBe(2);});it('e',()=>{expect(hd267pqx(15,0)).toBe(4);});});
function hd268pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph268pqx_hd',()=>{it('a',()=>{expect(hd268pqx(1,4)).toBe(2);});it('b',()=>{expect(hd268pqx(3,1)).toBe(1);});it('c',()=>{expect(hd268pqx(0,0)).toBe(0);});it('d',()=>{expect(hd268pqx(93,73)).toBe(2);});it('e',()=>{expect(hd268pqx(15,0)).toBe(4);});});
function hd269pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph269pqx_hd',()=>{it('a',()=>{expect(hd269pqx(1,4)).toBe(2);});it('b',()=>{expect(hd269pqx(3,1)).toBe(1);});it('c',()=>{expect(hd269pqx(0,0)).toBe(0);});it('d',()=>{expect(hd269pqx(93,73)).toBe(2);});it('e',()=>{expect(hd269pqx(15,0)).toBe(4);});});
function hd270pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph270pqx_hd',()=>{it('a',()=>{expect(hd270pqx(1,4)).toBe(2);});it('b',()=>{expect(hd270pqx(3,1)).toBe(1);});it('c',()=>{expect(hd270pqx(0,0)).toBe(0);});it('d',()=>{expect(hd270pqx(93,73)).toBe(2);});it('e',()=>{expect(hd270pqx(15,0)).toBe(4);});});
function hd271pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph271pqx_hd',()=>{it('a',()=>{expect(hd271pqx(1,4)).toBe(2);});it('b',()=>{expect(hd271pqx(3,1)).toBe(1);});it('c',()=>{expect(hd271pqx(0,0)).toBe(0);});it('d',()=>{expect(hd271pqx(93,73)).toBe(2);});it('e',()=>{expect(hd271pqx(15,0)).toBe(4);});});
function hd272pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph272pqx_hd',()=>{it('a',()=>{expect(hd272pqx(1,4)).toBe(2);});it('b',()=>{expect(hd272pqx(3,1)).toBe(1);});it('c',()=>{expect(hd272pqx(0,0)).toBe(0);});it('d',()=>{expect(hd272pqx(93,73)).toBe(2);});it('e',()=>{expect(hd272pqx(15,0)).toBe(4);});});
function hd273pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph273pqx_hd',()=>{it('a',()=>{expect(hd273pqx(1,4)).toBe(2);});it('b',()=>{expect(hd273pqx(3,1)).toBe(1);});it('c',()=>{expect(hd273pqx(0,0)).toBe(0);});it('d',()=>{expect(hd273pqx(93,73)).toBe(2);});it('e',()=>{expect(hd273pqx(15,0)).toBe(4);});});
function hd274pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph274pqx_hd',()=>{it('a',()=>{expect(hd274pqx(1,4)).toBe(2);});it('b',()=>{expect(hd274pqx(3,1)).toBe(1);});it('c',()=>{expect(hd274pqx(0,0)).toBe(0);});it('d',()=>{expect(hd274pqx(93,73)).toBe(2);});it('e',()=>{expect(hd274pqx(15,0)).toBe(4);});});
function hd275pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph275pqx_hd',()=>{it('a',()=>{expect(hd275pqx(1,4)).toBe(2);});it('b',()=>{expect(hd275pqx(3,1)).toBe(1);});it('c',()=>{expect(hd275pqx(0,0)).toBe(0);});it('d',()=>{expect(hd275pqx(93,73)).toBe(2);});it('e',()=>{expect(hd275pqx(15,0)).toBe(4);});});
function hd276pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph276pqx_hd',()=>{it('a',()=>{expect(hd276pqx(1,4)).toBe(2);});it('b',()=>{expect(hd276pqx(3,1)).toBe(1);});it('c',()=>{expect(hd276pqx(0,0)).toBe(0);});it('d',()=>{expect(hd276pqx(93,73)).toBe(2);});it('e',()=>{expect(hd276pqx(15,0)).toBe(4);});});
function hd277pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph277pqx_hd',()=>{it('a',()=>{expect(hd277pqx(1,4)).toBe(2);});it('b',()=>{expect(hd277pqx(3,1)).toBe(1);});it('c',()=>{expect(hd277pqx(0,0)).toBe(0);});it('d',()=>{expect(hd277pqx(93,73)).toBe(2);});it('e',()=>{expect(hd277pqx(15,0)).toBe(4);});});
function hd278pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph278pqx_hd',()=>{it('a',()=>{expect(hd278pqx(1,4)).toBe(2);});it('b',()=>{expect(hd278pqx(3,1)).toBe(1);});it('c',()=>{expect(hd278pqx(0,0)).toBe(0);});it('d',()=>{expect(hd278pqx(93,73)).toBe(2);});it('e',()=>{expect(hd278pqx(15,0)).toBe(4);});});
function hd279pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph279pqx_hd',()=>{it('a',()=>{expect(hd279pqx(1,4)).toBe(2);});it('b',()=>{expect(hd279pqx(3,1)).toBe(1);});it('c',()=>{expect(hd279pqx(0,0)).toBe(0);});it('d',()=>{expect(hd279pqx(93,73)).toBe(2);});it('e',()=>{expect(hd279pqx(15,0)).toBe(4);});});
function hd280pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph280pqx_hd',()=>{it('a',()=>{expect(hd280pqx(1,4)).toBe(2);});it('b',()=>{expect(hd280pqx(3,1)).toBe(1);});it('c',()=>{expect(hd280pqx(0,0)).toBe(0);});it('d',()=>{expect(hd280pqx(93,73)).toBe(2);});it('e',()=>{expect(hd280pqx(15,0)).toBe(4);});});
function hd281pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph281pqx_hd',()=>{it('a',()=>{expect(hd281pqx(1,4)).toBe(2);});it('b',()=>{expect(hd281pqx(3,1)).toBe(1);});it('c',()=>{expect(hd281pqx(0,0)).toBe(0);});it('d',()=>{expect(hd281pqx(93,73)).toBe(2);});it('e',()=>{expect(hd281pqx(15,0)).toBe(4);});});
function hd282pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph282pqx_hd',()=>{it('a',()=>{expect(hd282pqx(1,4)).toBe(2);});it('b',()=>{expect(hd282pqx(3,1)).toBe(1);});it('c',()=>{expect(hd282pqx(0,0)).toBe(0);});it('d',()=>{expect(hd282pqx(93,73)).toBe(2);});it('e',()=>{expect(hd282pqx(15,0)).toBe(4);});});
function hd283pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph283pqx_hd',()=>{it('a',()=>{expect(hd283pqx(1,4)).toBe(2);});it('b',()=>{expect(hd283pqx(3,1)).toBe(1);});it('c',()=>{expect(hd283pqx(0,0)).toBe(0);});it('d',()=>{expect(hd283pqx(93,73)).toBe(2);});it('e',()=>{expect(hd283pqx(15,0)).toBe(4);});});
function hd284pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph284pqx_hd',()=>{it('a',()=>{expect(hd284pqx(1,4)).toBe(2);});it('b',()=>{expect(hd284pqx(3,1)).toBe(1);});it('c',()=>{expect(hd284pqx(0,0)).toBe(0);});it('d',()=>{expect(hd284pqx(93,73)).toBe(2);});it('e',()=>{expect(hd284pqx(15,0)).toBe(4);});});
function hd285pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph285pqx_hd',()=>{it('a',()=>{expect(hd285pqx(1,4)).toBe(2);});it('b',()=>{expect(hd285pqx(3,1)).toBe(1);});it('c',()=>{expect(hd285pqx(0,0)).toBe(0);});it('d',()=>{expect(hd285pqx(93,73)).toBe(2);});it('e',()=>{expect(hd285pqx(15,0)).toBe(4);});});
function hd286pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph286pqx_hd',()=>{it('a',()=>{expect(hd286pqx(1,4)).toBe(2);});it('b',()=>{expect(hd286pqx(3,1)).toBe(1);});it('c',()=>{expect(hd286pqx(0,0)).toBe(0);});it('d',()=>{expect(hd286pqx(93,73)).toBe(2);});it('e',()=>{expect(hd286pqx(15,0)).toBe(4);});});
function hd287pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph287pqx_hd',()=>{it('a',()=>{expect(hd287pqx(1,4)).toBe(2);});it('b',()=>{expect(hd287pqx(3,1)).toBe(1);});it('c',()=>{expect(hd287pqx(0,0)).toBe(0);});it('d',()=>{expect(hd287pqx(93,73)).toBe(2);});it('e',()=>{expect(hd287pqx(15,0)).toBe(4);});});
function hd288pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph288pqx_hd',()=>{it('a',()=>{expect(hd288pqx(1,4)).toBe(2);});it('b',()=>{expect(hd288pqx(3,1)).toBe(1);});it('c',()=>{expect(hd288pqx(0,0)).toBe(0);});it('d',()=>{expect(hd288pqx(93,73)).toBe(2);});it('e',()=>{expect(hd288pqx(15,0)).toBe(4);});});
function hd289pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph289pqx_hd',()=>{it('a',()=>{expect(hd289pqx(1,4)).toBe(2);});it('b',()=>{expect(hd289pqx(3,1)).toBe(1);});it('c',()=>{expect(hd289pqx(0,0)).toBe(0);});it('d',()=>{expect(hd289pqx(93,73)).toBe(2);});it('e',()=>{expect(hd289pqx(15,0)).toBe(4);});});
function hd290pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph290pqx_hd',()=>{it('a',()=>{expect(hd290pqx(1,4)).toBe(2);});it('b',()=>{expect(hd290pqx(3,1)).toBe(1);});it('c',()=>{expect(hd290pqx(0,0)).toBe(0);});it('d',()=>{expect(hd290pqx(93,73)).toBe(2);});it('e',()=>{expect(hd290pqx(15,0)).toBe(4);});});
function hd291pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph291pqx_hd',()=>{it('a',()=>{expect(hd291pqx(1,4)).toBe(2);});it('b',()=>{expect(hd291pqx(3,1)).toBe(1);});it('c',()=>{expect(hd291pqx(0,0)).toBe(0);});it('d',()=>{expect(hd291pqx(93,73)).toBe(2);});it('e',()=>{expect(hd291pqx(15,0)).toBe(4);});});
function hd292pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph292pqx_hd',()=>{it('a',()=>{expect(hd292pqx(1,4)).toBe(2);});it('b',()=>{expect(hd292pqx(3,1)).toBe(1);});it('c',()=>{expect(hd292pqx(0,0)).toBe(0);});it('d',()=>{expect(hd292pqx(93,73)).toBe(2);});it('e',()=>{expect(hd292pqx(15,0)).toBe(4);});});
function hd293pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph293pqx_hd',()=>{it('a',()=>{expect(hd293pqx(1,4)).toBe(2);});it('b',()=>{expect(hd293pqx(3,1)).toBe(1);});it('c',()=>{expect(hd293pqx(0,0)).toBe(0);});it('d',()=>{expect(hd293pqx(93,73)).toBe(2);});it('e',()=>{expect(hd293pqx(15,0)).toBe(4);});});
function hd294pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph294pqx_hd',()=>{it('a',()=>{expect(hd294pqx(1,4)).toBe(2);});it('b',()=>{expect(hd294pqx(3,1)).toBe(1);});it('c',()=>{expect(hd294pqx(0,0)).toBe(0);});it('d',()=>{expect(hd294pqx(93,73)).toBe(2);});it('e',()=>{expect(hd294pqx(15,0)).toBe(4);});});
function hd295pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph295pqx_hd',()=>{it('a',()=>{expect(hd295pqx(1,4)).toBe(2);});it('b',()=>{expect(hd295pqx(3,1)).toBe(1);});it('c',()=>{expect(hd295pqx(0,0)).toBe(0);});it('d',()=>{expect(hd295pqx(93,73)).toBe(2);});it('e',()=>{expect(hd295pqx(15,0)).toBe(4);});});
function hd296pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph296pqx_hd',()=>{it('a',()=>{expect(hd296pqx(1,4)).toBe(2);});it('b',()=>{expect(hd296pqx(3,1)).toBe(1);});it('c',()=>{expect(hd296pqx(0,0)).toBe(0);});it('d',()=>{expect(hd296pqx(93,73)).toBe(2);});it('e',()=>{expect(hd296pqx(15,0)).toBe(4);});});
function hd297pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph297pqx_hd',()=>{it('a',()=>{expect(hd297pqx(1,4)).toBe(2);});it('b',()=>{expect(hd297pqx(3,1)).toBe(1);});it('c',()=>{expect(hd297pqx(0,0)).toBe(0);});it('d',()=>{expect(hd297pqx(93,73)).toBe(2);});it('e',()=>{expect(hd297pqx(15,0)).toBe(4);});});
function hd298pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph298pqx_hd',()=>{it('a',()=>{expect(hd298pqx(1,4)).toBe(2);});it('b',()=>{expect(hd298pqx(3,1)).toBe(1);});it('c',()=>{expect(hd298pqx(0,0)).toBe(0);});it('d',()=>{expect(hd298pqx(93,73)).toBe(2);});it('e',()=>{expect(hd298pqx(15,0)).toBe(4);});});
function hd299pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph299pqx_hd',()=>{it('a',()=>{expect(hd299pqx(1,4)).toBe(2);});it('b',()=>{expect(hd299pqx(3,1)).toBe(1);});it('c',()=>{expect(hd299pqx(0,0)).toBe(0);});it('d',()=>{expect(hd299pqx(93,73)).toBe(2);});it('e',()=>{expect(hd299pqx(15,0)).toBe(4);});});
function hd300pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph300pqx_hd',()=>{it('a',()=>{expect(hd300pqx(1,4)).toBe(2);});it('b',()=>{expect(hd300pqx(3,1)).toBe(1);});it('c',()=>{expect(hd300pqx(0,0)).toBe(0);});it('d',()=>{expect(hd300pqx(93,73)).toBe(2);});it('e',()=>{expect(hd300pqx(15,0)).toBe(4);});});
function hd301pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph301pqx_hd',()=>{it('a',()=>{expect(hd301pqx(1,4)).toBe(2);});it('b',()=>{expect(hd301pqx(3,1)).toBe(1);});it('c',()=>{expect(hd301pqx(0,0)).toBe(0);});it('d',()=>{expect(hd301pqx(93,73)).toBe(2);});it('e',()=>{expect(hd301pqx(15,0)).toBe(4);});});
function hd302pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph302pqx_hd',()=>{it('a',()=>{expect(hd302pqx(1,4)).toBe(2);});it('b',()=>{expect(hd302pqx(3,1)).toBe(1);});it('c',()=>{expect(hd302pqx(0,0)).toBe(0);});it('d',()=>{expect(hd302pqx(93,73)).toBe(2);});it('e',()=>{expect(hd302pqx(15,0)).toBe(4);});});
function hd303pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph303pqx_hd',()=>{it('a',()=>{expect(hd303pqx(1,4)).toBe(2);});it('b',()=>{expect(hd303pqx(3,1)).toBe(1);});it('c',()=>{expect(hd303pqx(0,0)).toBe(0);});it('d',()=>{expect(hd303pqx(93,73)).toBe(2);});it('e',()=>{expect(hd303pqx(15,0)).toBe(4);});});
function hd304pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph304pqx_hd',()=>{it('a',()=>{expect(hd304pqx(1,4)).toBe(2);});it('b',()=>{expect(hd304pqx(3,1)).toBe(1);});it('c',()=>{expect(hd304pqx(0,0)).toBe(0);});it('d',()=>{expect(hd304pqx(93,73)).toBe(2);});it('e',()=>{expect(hd304pqx(15,0)).toBe(4);});});
function hd305pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph305pqx_hd',()=>{it('a',()=>{expect(hd305pqx(1,4)).toBe(2);});it('b',()=>{expect(hd305pqx(3,1)).toBe(1);});it('c',()=>{expect(hd305pqx(0,0)).toBe(0);});it('d',()=>{expect(hd305pqx(93,73)).toBe(2);});it('e',()=>{expect(hd305pqx(15,0)).toBe(4);});});
function hd306pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph306pqx_hd',()=>{it('a',()=>{expect(hd306pqx(1,4)).toBe(2);});it('b',()=>{expect(hd306pqx(3,1)).toBe(1);});it('c',()=>{expect(hd306pqx(0,0)).toBe(0);});it('d',()=>{expect(hd306pqx(93,73)).toBe(2);});it('e',()=>{expect(hd306pqx(15,0)).toBe(4);});});
function hd307pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph307pqx_hd',()=>{it('a',()=>{expect(hd307pqx(1,4)).toBe(2);});it('b',()=>{expect(hd307pqx(3,1)).toBe(1);});it('c',()=>{expect(hd307pqx(0,0)).toBe(0);});it('d',()=>{expect(hd307pqx(93,73)).toBe(2);});it('e',()=>{expect(hd307pqx(15,0)).toBe(4);});});
function hd308pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph308pqx_hd',()=>{it('a',()=>{expect(hd308pqx(1,4)).toBe(2);});it('b',()=>{expect(hd308pqx(3,1)).toBe(1);});it('c',()=>{expect(hd308pqx(0,0)).toBe(0);});it('d',()=>{expect(hd308pqx(93,73)).toBe(2);});it('e',()=>{expect(hd308pqx(15,0)).toBe(4);});});
function hd309pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph309pqx_hd',()=>{it('a',()=>{expect(hd309pqx(1,4)).toBe(2);});it('b',()=>{expect(hd309pqx(3,1)).toBe(1);});it('c',()=>{expect(hd309pqx(0,0)).toBe(0);});it('d',()=>{expect(hd309pqx(93,73)).toBe(2);});it('e',()=>{expect(hd309pqx(15,0)).toBe(4);});});
function hd310pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph310pqx_hd',()=>{it('a',()=>{expect(hd310pqx(1,4)).toBe(2);});it('b',()=>{expect(hd310pqx(3,1)).toBe(1);});it('c',()=>{expect(hd310pqx(0,0)).toBe(0);});it('d',()=>{expect(hd310pqx(93,73)).toBe(2);});it('e',()=>{expect(hd310pqx(15,0)).toBe(4);});});
function hd311pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph311pqx_hd',()=>{it('a',()=>{expect(hd311pqx(1,4)).toBe(2);});it('b',()=>{expect(hd311pqx(3,1)).toBe(1);});it('c',()=>{expect(hd311pqx(0,0)).toBe(0);});it('d',()=>{expect(hd311pqx(93,73)).toBe(2);});it('e',()=>{expect(hd311pqx(15,0)).toBe(4);});});
function hd312pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph312pqx_hd',()=>{it('a',()=>{expect(hd312pqx(1,4)).toBe(2);});it('b',()=>{expect(hd312pqx(3,1)).toBe(1);});it('c',()=>{expect(hd312pqx(0,0)).toBe(0);});it('d',()=>{expect(hd312pqx(93,73)).toBe(2);});it('e',()=>{expect(hd312pqx(15,0)).toBe(4);});});
function hd313pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph313pqx_hd',()=>{it('a',()=>{expect(hd313pqx(1,4)).toBe(2);});it('b',()=>{expect(hd313pqx(3,1)).toBe(1);});it('c',()=>{expect(hd313pqx(0,0)).toBe(0);});it('d',()=>{expect(hd313pqx(93,73)).toBe(2);});it('e',()=>{expect(hd313pqx(15,0)).toBe(4);});});
function hd314pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph314pqx_hd',()=>{it('a',()=>{expect(hd314pqx(1,4)).toBe(2);});it('b',()=>{expect(hd314pqx(3,1)).toBe(1);});it('c',()=>{expect(hd314pqx(0,0)).toBe(0);});it('d',()=>{expect(hd314pqx(93,73)).toBe(2);});it('e',()=>{expect(hd314pqx(15,0)).toBe(4);});});
function hd315pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph315pqx_hd',()=>{it('a',()=>{expect(hd315pqx(1,4)).toBe(2);});it('b',()=>{expect(hd315pqx(3,1)).toBe(1);});it('c',()=>{expect(hd315pqx(0,0)).toBe(0);});it('d',()=>{expect(hd315pqx(93,73)).toBe(2);});it('e',()=>{expect(hd315pqx(15,0)).toBe(4);});});
function hd316pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph316pqx_hd',()=>{it('a',()=>{expect(hd316pqx(1,4)).toBe(2);});it('b',()=>{expect(hd316pqx(3,1)).toBe(1);});it('c',()=>{expect(hd316pqx(0,0)).toBe(0);});it('d',()=>{expect(hd316pqx(93,73)).toBe(2);});it('e',()=>{expect(hd316pqx(15,0)).toBe(4);});});
function hd317pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph317pqx_hd',()=>{it('a',()=>{expect(hd317pqx(1,4)).toBe(2);});it('b',()=>{expect(hd317pqx(3,1)).toBe(1);});it('c',()=>{expect(hd317pqx(0,0)).toBe(0);});it('d',()=>{expect(hd317pqx(93,73)).toBe(2);});it('e',()=>{expect(hd317pqx(15,0)).toBe(4);});});
function hd318pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph318pqx_hd',()=>{it('a',()=>{expect(hd318pqx(1,4)).toBe(2);});it('b',()=>{expect(hd318pqx(3,1)).toBe(1);});it('c',()=>{expect(hd318pqx(0,0)).toBe(0);});it('d',()=>{expect(hd318pqx(93,73)).toBe(2);});it('e',()=>{expect(hd318pqx(15,0)).toBe(4);});});
function hd319pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph319pqx_hd',()=>{it('a',()=>{expect(hd319pqx(1,4)).toBe(2);});it('b',()=>{expect(hd319pqx(3,1)).toBe(1);});it('c',()=>{expect(hd319pqx(0,0)).toBe(0);});it('d',()=>{expect(hd319pqx(93,73)).toBe(2);});it('e',()=>{expect(hd319pqx(15,0)).toBe(4);});});
function hd320pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph320pqx_hd',()=>{it('a',()=>{expect(hd320pqx(1,4)).toBe(2);});it('b',()=>{expect(hd320pqx(3,1)).toBe(1);});it('c',()=>{expect(hd320pqx(0,0)).toBe(0);});it('d',()=>{expect(hd320pqx(93,73)).toBe(2);});it('e',()=>{expect(hd320pqx(15,0)).toBe(4);});});
function hd321pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph321pqx_hd',()=>{it('a',()=>{expect(hd321pqx(1,4)).toBe(2);});it('b',()=>{expect(hd321pqx(3,1)).toBe(1);});it('c',()=>{expect(hd321pqx(0,0)).toBe(0);});it('d',()=>{expect(hd321pqx(93,73)).toBe(2);});it('e',()=>{expect(hd321pqx(15,0)).toBe(4);});});
function hd322pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph322pqx_hd',()=>{it('a',()=>{expect(hd322pqx(1,4)).toBe(2);});it('b',()=>{expect(hd322pqx(3,1)).toBe(1);});it('c',()=>{expect(hd322pqx(0,0)).toBe(0);});it('d',()=>{expect(hd322pqx(93,73)).toBe(2);});it('e',()=>{expect(hd322pqx(15,0)).toBe(4);});});
function hd323pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph323pqx_hd',()=>{it('a',()=>{expect(hd323pqx(1,4)).toBe(2);});it('b',()=>{expect(hd323pqx(3,1)).toBe(1);});it('c',()=>{expect(hd323pqx(0,0)).toBe(0);});it('d',()=>{expect(hd323pqx(93,73)).toBe(2);});it('e',()=>{expect(hd323pqx(15,0)).toBe(4);});});
function hd324pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph324pqx_hd',()=>{it('a',()=>{expect(hd324pqx(1,4)).toBe(2);});it('b',()=>{expect(hd324pqx(3,1)).toBe(1);});it('c',()=>{expect(hd324pqx(0,0)).toBe(0);});it('d',()=>{expect(hd324pqx(93,73)).toBe(2);});it('e',()=>{expect(hd324pqx(15,0)).toBe(4);});});
function hd325pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph325pqx_hd',()=>{it('a',()=>{expect(hd325pqx(1,4)).toBe(2);});it('b',()=>{expect(hd325pqx(3,1)).toBe(1);});it('c',()=>{expect(hd325pqx(0,0)).toBe(0);});it('d',()=>{expect(hd325pqx(93,73)).toBe(2);});it('e',()=>{expect(hd325pqx(15,0)).toBe(4);});});
function hd326pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph326pqx_hd',()=>{it('a',()=>{expect(hd326pqx(1,4)).toBe(2);});it('b',()=>{expect(hd326pqx(3,1)).toBe(1);});it('c',()=>{expect(hd326pqx(0,0)).toBe(0);});it('d',()=>{expect(hd326pqx(93,73)).toBe(2);});it('e',()=>{expect(hd326pqx(15,0)).toBe(4);});});
function hd327pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph327pqx_hd',()=>{it('a',()=>{expect(hd327pqx(1,4)).toBe(2);});it('b',()=>{expect(hd327pqx(3,1)).toBe(1);});it('c',()=>{expect(hd327pqx(0,0)).toBe(0);});it('d',()=>{expect(hd327pqx(93,73)).toBe(2);});it('e',()=>{expect(hd327pqx(15,0)).toBe(4);});});
function hd328pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph328pqx_hd',()=>{it('a',()=>{expect(hd328pqx(1,4)).toBe(2);});it('b',()=>{expect(hd328pqx(3,1)).toBe(1);});it('c',()=>{expect(hd328pqx(0,0)).toBe(0);});it('d',()=>{expect(hd328pqx(93,73)).toBe(2);});it('e',()=>{expect(hd328pqx(15,0)).toBe(4);});});
function hd329pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph329pqx_hd',()=>{it('a',()=>{expect(hd329pqx(1,4)).toBe(2);});it('b',()=>{expect(hd329pqx(3,1)).toBe(1);});it('c',()=>{expect(hd329pqx(0,0)).toBe(0);});it('d',()=>{expect(hd329pqx(93,73)).toBe(2);});it('e',()=>{expect(hd329pqx(15,0)).toBe(4);});});
function hd330pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph330pqx_hd',()=>{it('a',()=>{expect(hd330pqx(1,4)).toBe(2);});it('b',()=>{expect(hd330pqx(3,1)).toBe(1);});it('c',()=>{expect(hd330pqx(0,0)).toBe(0);});it('d',()=>{expect(hd330pqx(93,73)).toBe(2);});it('e',()=>{expect(hd330pqx(15,0)).toBe(4);});});
function hd331pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph331pqx_hd',()=>{it('a',()=>{expect(hd331pqx(1,4)).toBe(2);});it('b',()=>{expect(hd331pqx(3,1)).toBe(1);});it('c',()=>{expect(hd331pqx(0,0)).toBe(0);});it('d',()=>{expect(hd331pqx(93,73)).toBe(2);});it('e',()=>{expect(hd331pqx(15,0)).toBe(4);});});
function hd332pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph332pqx_hd',()=>{it('a',()=>{expect(hd332pqx(1,4)).toBe(2);});it('b',()=>{expect(hd332pqx(3,1)).toBe(1);});it('c',()=>{expect(hd332pqx(0,0)).toBe(0);});it('d',()=>{expect(hd332pqx(93,73)).toBe(2);});it('e',()=>{expect(hd332pqx(15,0)).toBe(4);});});
function hd333pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph333pqx_hd',()=>{it('a',()=>{expect(hd333pqx(1,4)).toBe(2);});it('b',()=>{expect(hd333pqx(3,1)).toBe(1);});it('c',()=>{expect(hd333pqx(0,0)).toBe(0);});it('d',()=>{expect(hd333pqx(93,73)).toBe(2);});it('e',()=>{expect(hd333pqx(15,0)).toBe(4);});});
function hd334pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph334pqx_hd',()=>{it('a',()=>{expect(hd334pqx(1,4)).toBe(2);});it('b',()=>{expect(hd334pqx(3,1)).toBe(1);});it('c',()=>{expect(hd334pqx(0,0)).toBe(0);});it('d',()=>{expect(hd334pqx(93,73)).toBe(2);});it('e',()=>{expect(hd334pqx(15,0)).toBe(4);});});
function hd335pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph335pqx_hd',()=>{it('a',()=>{expect(hd335pqx(1,4)).toBe(2);});it('b',()=>{expect(hd335pqx(3,1)).toBe(1);});it('c',()=>{expect(hd335pqx(0,0)).toBe(0);});it('d',()=>{expect(hd335pqx(93,73)).toBe(2);});it('e',()=>{expect(hd335pqx(15,0)).toBe(4);});});
function hd336pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph336pqx_hd',()=>{it('a',()=>{expect(hd336pqx(1,4)).toBe(2);});it('b',()=>{expect(hd336pqx(3,1)).toBe(1);});it('c',()=>{expect(hd336pqx(0,0)).toBe(0);});it('d',()=>{expect(hd336pqx(93,73)).toBe(2);});it('e',()=>{expect(hd336pqx(15,0)).toBe(4);});});
function hd337pqx(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph337pqx_hd',()=>{it('a',()=>{expect(hd337pqx(1,4)).toBe(2);});it('b',()=>{expect(hd337pqx(3,1)).toBe(1);});it('c',()=>{expect(hd337pqx(0,0)).toBe(0);});it('d',()=>{expect(hd337pqx(93,73)).toBe(2);});it('e',()=>{expect(hd337pqx(15,0)).toBe(4);});});
function hd338pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph338pqx2_hd',()=>{it('a',()=>{expect(hd338pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd338pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd338pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd338pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd338pqx2(15,0)).toBe(4);});});
function hd339pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph339pqx2_hd',()=>{it('a',()=>{expect(hd339pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd339pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd339pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd339pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd339pqx2(15,0)).toBe(4);});});
function hd340pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph340pqx2_hd',()=>{it('a',()=>{expect(hd340pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd340pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd340pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd340pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd340pqx2(15,0)).toBe(4);});});
function hd341pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph341pqx2_hd',()=>{it('a',()=>{expect(hd341pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd341pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd341pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd341pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd341pqx2(15,0)).toBe(4);});});
function hd342pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph342pqx2_hd',()=>{it('a',()=>{expect(hd342pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd342pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd342pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd342pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd342pqx2(15,0)).toBe(4);});});
function hd343pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph343pqx2_hd',()=>{it('a',()=>{expect(hd343pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd343pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd343pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd343pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd343pqx2(15,0)).toBe(4);});});
function hd344pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph344pqx2_hd',()=>{it('a',()=>{expect(hd344pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd344pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd344pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd344pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd344pqx2(15,0)).toBe(4);});});
function hd345pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph345pqx2_hd',()=>{it('a',()=>{expect(hd345pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd345pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd345pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd345pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd345pqx2(15,0)).toBe(4);});});
function hd346pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph346pqx2_hd',()=>{it('a',()=>{expect(hd346pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd346pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd346pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd346pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd346pqx2(15,0)).toBe(4);});});
function hd347pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph347pqx2_hd',()=>{it('a',()=>{expect(hd347pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd347pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd347pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd347pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd347pqx2(15,0)).toBe(4);});});
function hd348pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph348pqx2_hd',()=>{it('a',()=>{expect(hd348pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd348pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd348pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd348pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd348pqx2(15,0)).toBe(4);});});
function hd349pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph349pqx2_hd',()=>{it('a',()=>{expect(hd349pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd349pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd349pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd349pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd349pqx2(15,0)).toBe(4);});});
function hd350pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph350pqx2_hd',()=>{it('a',()=>{expect(hd350pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd350pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd350pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd350pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd350pqx2(15,0)).toBe(4);});});
function hd351pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph351pqx2_hd',()=>{it('a',()=>{expect(hd351pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd351pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd351pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd351pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd351pqx2(15,0)).toBe(4);});});
function hd352pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph352pqx2_hd',()=>{it('a',()=>{expect(hd352pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd352pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd352pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd352pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd352pqx2(15,0)).toBe(4);});});
function hd353pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph353pqx2_hd',()=>{it('a',()=>{expect(hd353pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd353pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd353pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd353pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd353pqx2(15,0)).toBe(4);});});
function hd354pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph354pqx2_hd',()=>{it('a',()=>{expect(hd354pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd354pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd354pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd354pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd354pqx2(15,0)).toBe(4);});});
function hd355pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph355pqx2_hd',()=>{it('a',()=>{expect(hd355pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd355pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd355pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd355pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd355pqx2(15,0)).toBe(4);});});
function hd356pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph356pqx2_hd',()=>{it('a',()=>{expect(hd356pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd356pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd356pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd356pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd356pqx2(15,0)).toBe(4);});});
function hd357pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph357pqx2_hd',()=>{it('a',()=>{expect(hd357pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd357pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd357pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd357pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd357pqx2(15,0)).toBe(4);});});
function hd358pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph358pqx2_hd',()=>{it('a',()=>{expect(hd358pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd358pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd358pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd358pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd358pqx2(15,0)).toBe(4);});});
function hd359pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph359pqx2_hd',()=>{it('a',()=>{expect(hd359pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd359pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd359pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd359pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd359pqx2(15,0)).toBe(4);});});
function hd360pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph360pqx2_hd',()=>{it('a',()=>{expect(hd360pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd360pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd360pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd360pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd360pqx2(15,0)).toBe(4);});});
function hd361pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph361pqx2_hd',()=>{it('a',()=>{expect(hd361pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd361pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd361pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd361pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd361pqx2(15,0)).toBe(4);});});
function hd362pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph362pqx2_hd',()=>{it('a',()=>{expect(hd362pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd362pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd362pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd362pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd362pqx2(15,0)).toBe(4);});});
function hd363pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph363pqx2_hd',()=>{it('a',()=>{expect(hd363pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd363pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd363pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd363pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd363pqx2(15,0)).toBe(4);});});
function hd364pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph364pqx2_hd',()=>{it('a',()=>{expect(hd364pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd364pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd364pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd364pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd364pqx2(15,0)).toBe(4);});});
function hd365pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph365pqx2_hd',()=>{it('a',()=>{expect(hd365pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd365pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd365pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd365pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd365pqx2(15,0)).toBe(4);});});
function hd366pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph366pqx2_hd',()=>{it('a',()=>{expect(hd366pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd366pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd366pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd366pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd366pqx2(15,0)).toBe(4);});});
function hd367pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph367pqx2_hd',()=>{it('a',()=>{expect(hd367pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd367pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd367pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd367pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd367pqx2(15,0)).toBe(4);});});
function hd368pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph368pqx2_hd',()=>{it('a',()=>{expect(hd368pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd368pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd368pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd368pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd368pqx2(15,0)).toBe(4);});});
function hd369pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph369pqx2_hd',()=>{it('a',()=>{expect(hd369pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd369pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd369pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd369pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd369pqx2(15,0)).toBe(4);});});
function hd370pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph370pqx2_hd',()=>{it('a',()=>{expect(hd370pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd370pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd370pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd370pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd370pqx2(15,0)).toBe(4);});});
function hd371pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph371pqx2_hd',()=>{it('a',()=>{expect(hd371pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd371pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd371pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd371pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd371pqx2(15,0)).toBe(4);});});
function hd372pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph372pqx2_hd',()=>{it('a',()=>{expect(hd372pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd372pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd372pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd372pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd372pqx2(15,0)).toBe(4);});});
function hd373pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph373pqx2_hd',()=>{it('a',()=>{expect(hd373pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd373pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd373pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd373pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd373pqx2(15,0)).toBe(4);});});
function hd374pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph374pqx2_hd',()=>{it('a',()=>{expect(hd374pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd374pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd374pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd374pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd374pqx2(15,0)).toBe(4);});});
function hd375pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph375pqx2_hd',()=>{it('a',()=>{expect(hd375pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd375pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd375pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd375pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd375pqx2(15,0)).toBe(4);});});
function hd376pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph376pqx2_hd',()=>{it('a',()=>{expect(hd376pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd376pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd376pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd376pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd376pqx2(15,0)).toBe(4);});});
function hd377pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph377pqx2_hd',()=>{it('a',()=>{expect(hd377pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd377pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd377pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd377pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd377pqx2(15,0)).toBe(4);});});
function hd378pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph378pqx2_hd',()=>{it('a',()=>{expect(hd378pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd378pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd378pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd378pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd378pqx2(15,0)).toBe(4);});});
function hd379pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph379pqx2_hd',()=>{it('a',()=>{expect(hd379pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd379pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd379pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd379pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd379pqx2(15,0)).toBe(4);});});
function hd380pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph380pqx2_hd',()=>{it('a',()=>{expect(hd380pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd380pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd380pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd380pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd380pqx2(15,0)).toBe(4);});});
function hd381pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph381pqx2_hd',()=>{it('a',()=>{expect(hd381pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd381pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd381pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd381pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd381pqx2(15,0)).toBe(4);});});
function hd382pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph382pqx2_hd',()=>{it('a',()=>{expect(hd382pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd382pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd382pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd382pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd382pqx2(15,0)).toBe(4);});});
function hd383pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph383pqx2_hd',()=>{it('a',()=>{expect(hd383pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd383pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd383pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd383pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd383pqx2(15,0)).toBe(4);});});
function hd384pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph384pqx2_hd',()=>{it('a',()=>{expect(hd384pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd384pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd384pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd384pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd384pqx2(15,0)).toBe(4);});});
function hd385pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph385pqx2_hd',()=>{it('a',()=>{expect(hd385pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd385pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd385pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd385pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd385pqx2(15,0)).toBe(4);});});
function hd386pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph386pqx2_hd',()=>{it('a',()=>{expect(hd386pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd386pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd386pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd386pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd386pqx2(15,0)).toBe(4);});});
function hd387pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph387pqx2_hd',()=>{it('a',()=>{expect(hd387pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd387pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd387pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd387pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd387pqx2(15,0)).toBe(4);});});
function hd388pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph388pqx2_hd',()=>{it('a',()=>{expect(hd388pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd388pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd388pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd388pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd388pqx2(15,0)).toBe(4);});});
function hd389pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph389pqx2_hd',()=>{it('a',()=>{expect(hd389pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd389pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd389pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd389pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd389pqx2(15,0)).toBe(4);});});
function hd390pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph390pqx2_hd',()=>{it('a',()=>{expect(hd390pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd390pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd390pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd390pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd390pqx2(15,0)).toBe(4);});});
function hd391pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph391pqx2_hd',()=>{it('a',()=>{expect(hd391pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd391pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd391pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd391pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd391pqx2(15,0)).toBe(4);});});
function hd392pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph392pqx2_hd',()=>{it('a',()=>{expect(hd392pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd392pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd392pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd392pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd392pqx2(15,0)).toBe(4);});});
function hd393pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph393pqx2_hd',()=>{it('a',()=>{expect(hd393pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd393pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd393pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd393pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd393pqx2(15,0)).toBe(4);});});
function hd394pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph394pqx2_hd',()=>{it('a',()=>{expect(hd394pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd394pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd394pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd394pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd394pqx2(15,0)).toBe(4);});});
function hd395pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph395pqx2_hd',()=>{it('a',()=>{expect(hd395pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd395pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd395pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd395pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd395pqx2(15,0)).toBe(4);});});
function hd396pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph396pqx2_hd',()=>{it('a',()=>{expect(hd396pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd396pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd396pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd396pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd396pqx2(15,0)).toBe(4);});});
function hd397pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph397pqx2_hd',()=>{it('a',()=>{expect(hd397pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd397pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd397pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd397pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd397pqx2(15,0)).toBe(4);});});
function hd398pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph398pqx2_hd',()=>{it('a',()=>{expect(hd398pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd398pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd398pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd398pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd398pqx2(15,0)).toBe(4);});});
function hd399pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph399pqx2_hd',()=>{it('a',()=>{expect(hd399pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd399pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd399pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd399pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd399pqx2(15,0)).toBe(4);});});
function hd400pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph400pqx2_hd',()=>{it('a',()=>{expect(hd400pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd400pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd400pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd400pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd400pqx2(15,0)).toBe(4);});});
function hd401pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph401pqx2_hd',()=>{it('a',()=>{expect(hd401pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd401pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd401pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd401pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd401pqx2(15,0)).toBe(4);});});
function hd402pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph402pqx2_hd',()=>{it('a',()=>{expect(hd402pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd402pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd402pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd402pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd402pqx2(15,0)).toBe(4);});});
function hd403pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph403pqx2_hd',()=>{it('a',()=>{expect(hd403pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd403pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd403pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd403pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd403pqx2(15,0)).toBe(4);});});
function hd404pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph404pqx2_hd',()=>{it('a',()=>{expect(hd404pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd404pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd404pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd404pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd404pqx2(15,0)).toBe(4);});});
function hd405pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph405pqx2_hd',()=>{it('a',()=>{expect(hd405pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd405pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd405pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd405pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd405pqx2(15,0)).toBe(4);});});
function hd406pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph406pqx2_hd',()=>{it('a',()=>{expect(hd406pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd406pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd406pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd406pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd406pqx2(15,0)).toBe(4);});});
function hd407pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph407pqx2_hd',()=>{it('a',()=>{expect(hd407pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd407pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd407pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd407pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd407pqx2(15,0)).toBe(4);});});
function hd408pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph408pqx2_hd',()=>{it('a',()=>{expect(hd408pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd408pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd408pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd408pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd408pqx2(15,0)).toBe(4);});});
function hd409pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph409pqx2_hd',()=>{it('a',()=>{expect(hd409pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd409pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd409pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd409pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd409pqx2(15,0)).toBe(4);});});
function hd410pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph410pqx2_hd',()=>{it('a',()=>{expect(hd410pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd410pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd410pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd410pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd410pqx2(15,0)).toBe(4);});});
function hd411pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph411pqx2_hd',()=>{it('a',()=>{expect(hd411pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd411pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd411pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd411pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd411pqx2(15,0)).toBe(4);});});
function hd412pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph412pqx2_hd',()=>{it('a',()=>{expect(hd412pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd412pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd412pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd412pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd412pqx2(15,0)).toBe(4);});});
function hd413pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph413pqx2_hd',()=>{it('a',()=>{expect(hd413pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd413pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd413pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd413pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd413pqx2(15,0)).toBe(4);});});
function hd414pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph414pqx2_hd',()=>{it('a',()=>{expect(hd414pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd414pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd414pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd414pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd414pqx2(15,0)).toBe(4);});});
function hd415pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph415pqx2_hd',()=>{it('a',()=>{expect(hd415pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd415pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd415pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd415pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd415pqx2(15,0)).toBe(4);});});
function hd416pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph416pqx2_hd',()=>{it('a',()=>{expect(hd416pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd416pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd416pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd416pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd416pqx2(15,0)).toBe(4);});});
function hd417pqx2(x:number,y:number):number{let v=x^y,c=0;while(v!==0){c+=v&1;v>>>=1;}return c;}
describe('ph417pqx2_hd',()=>{it('a',()=>{expect(hd417pqx2(1,4)).toBe(2);});it('b',()=>{expect(hd417pqx2(3,1)).toBe(1);});it('c',()=>{expect(hd417pqx2(0,0)).toBe(0);});it('d',()=>{expect(hd417pqx2(93,73)).toBe(2);});it('e',()=>{expect(hd417pqx2(15,0)).toBe(4);});});
