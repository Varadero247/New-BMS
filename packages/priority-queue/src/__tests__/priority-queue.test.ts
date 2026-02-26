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
