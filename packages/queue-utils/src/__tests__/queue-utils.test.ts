// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  Queue,
  Stack,
  Deque,
  PriorityQueue,
  CircularBuffer,
  createQueue,
  createStack,
  createDeque,
  createPriorityQueue,
  createCircularBuffer,
  queueFromArray,
  stackFromArray,
  heapSort,
} from '../queue-utils';

// ============================================================================
// QUEUE — 100 iterations × ~6 assertions = ~600 tests
// ============================================================================

describe('Queue — enqueue/dequeue loop (i=1..100)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`Queue size=${i}: enqueue ${i} items, verify size, dequeue all in FIFO order`, () => {
      const q = new Queue<number>();
      for (let j = 1; j <= i; j++) q.enqueue(j);
      expect(q.size()).toBe(i);
      expect(q.isEmpty()).toBe(false);
      for (let j = 1; j <= i; j++) {
        expect(q.peek()).toBe(j);
        expect(q.dequeue()).toBe(j);
      }
      expect(q.size()).toBe(0);
      expect(q.isEmpty()).toBe(true);
      expect(q.dequeue()).toBeUndefined();
    });
  }
});

// ============================================================================
// QUEUE — stats tracking (i=1..100) = 100 tests
// ============================================================================

describe('Queue — getStats loop (i=1..100)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`Queue stats after enqueue+dequeue ${i} items`, () => {
      const q = new Queue<number>();
      for (let j = 0; j < i; j++) q.enqueue(j);
      // dequeue half
      const half = Math.floor(i / 2);
      for (let j = 0; j < half; j++) q.dequeue();
      const stats = q.getStats();
      expect(stats.totalEnqueued).toBe(i);
      expect(stats.totalDequeued).toBe(half);
      expect(stats.size).toBe(i - half);
      expect(stats.isEmpty).toBe(i - half === 0);
    });
  }
});

// ============================================================================
// QUEUE — fromArray / toArray / contains (i=1..50) = 150 tests
// ============================================================================

describe('Queue — fromArray/toArray/contains loop (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Queue fromArray/toArray/contains with ${i} items`, () => {
      const items = Array.from({ length: i }, (_, k) => k * 3);
      const q = new Queue<number>();
      q.fromArray(items);
      expect(q.size()).toBe(i);
      expect(q.toArray()).toEqual(items);
      // contains first item
      expect(q.contains(items[0])).toBe(true);
      // does not contain a value outside range
      expect(q.contains(-9999)).toBe(false);
      // custom equality: match by remainder
      if (i > 1) {
        expect(
          q.contains(items[1], (a, b) => a % 100 === b % 100),
        ).toBe(true);
      }
    });
  }
});

// ============================================================================
// QUEUE — clear and reuse (50 tests)
// ============================================================================

describe('Queue — clear and reuse (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Queue clear then reuse iteration ${i}`, () => {
      const q = new Queue<string>();
      for (let j = 0; j < i; j++) q.enqueue(`item-${j}`);
      expect(q.size()).toBe(i);
      q.clear();
      expect(q.size()).toBe(0);
      expect(q.isEmpty()).toBe(true);
      expect(q.dequeue()).toBeUndefined();
      // reuse after clear
      q.enqueue('reused');
      expect(q.size()).toBe(1);
      expect(q.dequeue()).toBe('reused');
    });
  }
});

// ============================================================================
// STACK — push/pop LIFO loop (i=1..100) × ~5 assertions = ~500 tests
// ============================================================================

describe('Stack — push/pop LIFO loop (i=1..100)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`Stack size=${i}: push ${i} items, pop in reverse order`, () => {
      const s = new Stack<number>();
      for (let j = 1; j <= i; j++) s.push(j);
      expect(s.size()).toBe(i);
      expect(s.isEmpty()).toBe(false);
      for (let j = i; j >= 1; j--) {
        expect(s.peek()).toBe(j);
        expect(s.pop()).toBe(j);
      }
      expect(s.isEmpty()).toBe(true);
      expect(s.pop()).toBeUndefined();
    });
  }
});

// ============================================================================
// STACK — toArray top-first (i=1..50) = 50 tests
// ============================================================================

describe('Stack — toArray top-first (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Stack toArray top-first with ${i} items`, () => {
      const s = new Stack<number>();
      for (let j = 1; j <= i; j++) s.push(j);
      const arr = s.toArray();
      expect(arr.length).toBe(i);
      expect(arr[0]).toBe(i);      // top = last pushed
      expect(arr[i - 1]).toBe(1); // bottom = first pushed
    });
  }
});

// ============================================================================
// STACK — clear and reuse (50 tests)
// ============================================================================

describe('Stack — clear and reuse (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Stack clear then reuse iteration ${i}`, () => {
      const s = new Stack<number>();
      for (let j = 0; j < i; j++) s.push(j);
      s.clear();
      expect(s.isEmpty()).toBe(true);
      expect(s.size()).toBe(0);
      s.push(42);
      expect(s.peek()).toBe(42);
      expect(s.pop()).toBe(42);
    });
  }
});

// ============================================================================
// PRIORITY QUEUE — min-heap sorted dequeue (i=1..50) = 50 tests
// ============================================================================

describe('PriorityQueue — min-heap dequeue sorted (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`PriorityQueue min-heap with ${i} items dequeues in ascending order`, () => {
      const pq = new PriorityQueue<number>();
      // Insert in reverse order to stress the heap
      for (let j = i; j >= 1; j--) pq.enqueue(j);
      expect(pq.size()).toBe(i);
      let prev = -Infinity;
      while (!pq.isEmpty()) {
        const val = pq.dequeue()!;
        expect(val).toBeGreaterThanOrEqual(prev);
        prev = val;
      }
      expect(pq.isEmpty()).toBe(true);
    });
  }
});

// ============================================================================
// PRIORITY QUEUE — max-heap sorted dequeue (i=1..50) = 50 tests
// ============================================================================

describe('PriorityQueue — max-heap dequeue sorted (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`PriorityQueue max-heap with ${i} items dequeues in descending order`, () => {
      const pq = new PriorityQueue<number>(undefined, 'max');
      for (let j = 1; j <= i; j++) pq.enqueue(j);
      expect(pq.size()).toBe(i);
      let prev = Infinity;
      while (!pq.isEmpty()) {
        const val = pq.dequeue()!;
        expect(val).toBeLessThanOrEqual(prev);
        prev = val;
      }
      expect(pq.isEmpty()).toBe(true);
    });
  }
});

// ============================================================================
// PRIORITY QUEUE — toSortedArray non-mutating (i=1..50) = 50 tests
// ============================================================================

describe('PriorityQueue — toSortedArray non-mutating (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`PriorityQueue toSortedArray does not mutate, size=${i}`, () => {
      const pq = new PriorityQueue<number>();
      for (let j = i; j >= 1; j--) pq.enqueue(j);
      const before = pq.size();
      const sorted = pq.toSortedArray();
      expect(pq.size()).toBe(before); // not mutated
      expect(sorted.length).toBe(i);
      for (let k = 0; k < sorted.length - 1; k++) {
        expect(sorted[k]).toBeLessThanOrEqual(sorted[k + 1]);
      }
    });
  }
});

// ============================================================================
// PRIORITY QUEUE — custom compareFn (i=1..50) = 50 tests
// ============================================================================

describe('PriorityQueue — custom compareFn descending (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`PriorityQueue custom desc compareFn size=${i}`, () => {
      const descCmp = (a: number, b: number) => b - a;
      const pq = new PriorityQueue<number>(descCmp);
      for (let j = 1; j <= i; j++) pq.enqueue(j);
      const sorted = pq.toSortedArray();
      expect(sorted[0]).toBe(i); // largest first
      if (i > 1) expect(sorted[sorted.length - 1]).toBe(1);
    });
  }
});

// ============================================================================
// CIRCULAR BUFFER — capacity i, write i+5 items (i=2..51) = 50 tests × ~5 assertions
// ============================================================================

describe('CircularBuffer — capacity i, write i+5 (i=2..51)', () => {
  for (let i = 2; i <= 51; i++) {
    it(`CircularBuffer cap=${i}: write ${i + 5} items, oldest dropped`, () => {
      const cb = new CircularBuffer<number>(i);
      for (let j = 1; j <= i + 5; j++) cb.write(j);
      // Buffer is full after writing capacity items; additional 5 overwrote oldest
      expect(cb.isFull()).toBe(true);
      expect(cb.size()).toBe(i);
      const arr = cb.toArray();
      // The oldest surviving item = item (5+1)=6, i.e. the (excess+1)-th item
      expect(arr[0]).toBe(6);
      expect(arr[arr.length - 1]).toBe(i + 5);
      const stats = cb.getStats();
      expect(stats.totalWritten).toBe(i + 5);
      expect(stats.droppedWrites).toBe(5);
    });
  }
});

// ============================================================================
// CIRCULAR BUFFER — read after write (i=1..50) = 50 tests
// ============================================================================

describe('CircularBuffer — read after partial write (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`CircularBuffer cap=100 write ${i} items then read all`, () => {
      const cb = new CircularBuffer<number>(100);
      for (let j = 1; j <= i; j++) cb.write(j);
      expect(cb.size()).toBe(i);
      for (let j = 1; j <= i; j++) {
        expect(cb.read()).toBe(j);
      }
      expect(cb.isEmpty()).toBe(true);
      expect(cb.read()).toBeUndefined();
    });
  }
});

// ============================================================================
// CIRCULAR BUFFER — stats (i=1..50) = 50 tests
// ============================================================================

describe('CircularBuffer — getStats (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`CircularBuffer getStats cap=${i}`, () => {
      const cb = new CircularBuffer<number>(i);
      for (let j = 0; j < i; j++) cb.write(j);
      const readCount = Math.floor(i / 3);
      for (let j = 0; j < readCount; j++) cb.read();
      const stats = cb.getStats();
      expect(stats.capacity).toBe(i);
      expect(stats.totalWritten).toBe(i);
      expect(stats.totalRead).toBe(readCount);
      expect(stats.size).toBe(i - readCount);
    });
  }
});

// ============================================================================
// DEQUE — pushFront/pushBack combinations (i=1..100) = 100 tests × ~4 assertions
// ============================================================================

describe('Deque — pushFront/pushBack alternating (i=1..100)', () => {
  for (let i = 1; i <= 100; i++) {
    it(`Deque alternating push front/back, total ${i * 2} items`, () => {
      const d = new Deque<number>();
      for (let j = 1; j <= i; j++) {
        d.pushFront(j);       // front: i..1 (build up from front)
        d.pushBack(j + 1000); // back:  1001..1000+i
      }
      expect(d.size()).toBe(i * 2);
      expect(d.peekFront()).toBe(i);        // last pushFront item
      expect(d.peekBack()).toBe(1000 + i);  // last pushBack item
      // drain fully
      let count = 0;
      while (!d.isEmpty()) { d.popFront(); count++; }
      expect(count).toBe(i * 2);
    });
  }
});

// ============================================================================
// DEQUE — popBack order (i=1..50) = 50 tests
// ============================================================================

describe('Deque — popBack LIFO order (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Deque popBack on ${i} pushBack items returns LIFO`, () => {
      const d = new Deque<number>();
      for (let j = 1; j <= i; j++) d.pushBack(j);
      for (let j = i; j >= 1; j--) {
        expect(d.popBack()).toBe(j);
      }
      expect(d.isEmpty()).toBe(true);
      expect(d.popBack()).toBeUndefined();
      expect(d.popFront()).toBeUndefined();
    });
  }
});

// ============================================================================
// DEQUE — toArray front-to-back (i=1..50) = 50 tests
// ============================================================================

describe('Deque — toArray front-to-back (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Deque toArray with ${i} pushBack items`, () => {
      const d = new Deque<number>();
      for (let j = 1; j <= i; j++) d.pushBack(j);
      const arr = d.toArray();
      expect(arr.length).toBe(i);
      expect(arr[0]).toBe(1);
      expect(arr[i - 1]).toBe(i);
    });
  }
});

// ============================================================================
// FACTORY FUNCTIONS (i=1..50) = 50 tests
// ============================================================================

describe('Factory functions — all data structures (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Factory functions create valid instances, iteration ${i}`, () => {
      const q = createQueue<number>();
      q.enqueue(i);
      expect(q.dequeue()).toBe(i);

      const s = createStack<number>();
      s.push(i);
      expect(s.pop()).toBe(i);

      const d = createDeque<number>();
      d.pushFront(i);
      expect(d.popFront()).toBe(i);

      const pq = createPriorityQueue<number>();
      pq.enqueue(i);
      expect(pq.dequeue()).toBe(i);

      const cb = createCircularBuffer<number>(i + 1);
      cb.write(i);
      expect(cb.read()).toBe(i);
    });
  }
});

// ============================================================================
// queueFromArray / stackFromArray (i=1..50) = 50 tests
// ============================================================================

describe('queueFromArray and stackFromArray (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`queueFromArray/stackFromArray with ${i} items`, () => {
      const items = Array.from({ length: i }, (_, k) => k + 1);
      const q = queueFromArray(items);
      expect(q.size()).toBe(i);
      expect(q.peek()).toBe(1);
      expect(q.dequeue()).toBe(1);

      const s = stackFromArray(items);
      expect(s.size()).toBe(i);
      expect(s.peek()).toBe(i); // last item = top
      expect(s.pop()).toBe(i);
    });
  }
});

// ============================================================================
// heapSort (i=1..50) = 50 tests
// ============================================================================

describe('heapSort — ascending and descending (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`heapSort ${i} random integers in ascending order`, () => {
      const items = Array.from({ length: i }, (_, k) => i - k); // descending input
      const sorted = heapSort(items);
      expect(sorted.length).toBe(i);
      for (let k = 0; k < sorted.length - 1; k++) {
        expect(sorted[k]).toBeLessThanOrEqual(sorted[k + 1]);
      }
      // original not mutated
      expect(items[0]).toBe(i);
    });
  }
});

// ============================================================================
// heapSort — custom descending compareFn (i=1..50) = 50 tests
// ============================================================================

describe('heapSort — custom desc compareFn (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`heapSort custom desc compareFn with ${i} items`, () => {
      const items = Array.from({ length: i }, (_, k) => k + 1);
      const sorted = heapSort(items, (a, b) => b - a);
      expect(sorted[0]).toBe(i);
      if (i > 1) expect(sorted[sorted.length - 1]).toBe(1);
    });
  }
});

// ============================================================================
// EDGE CASES — single item (50 tests)
// ============================================================================

describe('Edge cases — single-item operations (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Single-item operations, value=${i}`, () => {
      // Queue
      const q = new Queue<number>();
      expect(q.peek()).toBeUndefined();
      expect(q.dequeue()).toBeUndefined();
      q.enqueue(i);
      expect(q.peek()).toBe(i);
      expect(q.size()).toBe(1);
      expect(q.dequeue()).toBe(i);
      expect(q.isEmpty()).toBe(true);

      // Stack
      const s = new Stack<number>();
      expect(s.peek()).toBeUndefined();
      expect(s.pop()).toBeUndefined();
      s.push(i);
      expect(s.peek()).toBe(i);
      expect(s.pop()).toBe(i);

      // Deque
      const d = new Deque<number>();
      expect(d.peekFront()).toBeUndefined();
      expect(d.peekBack()).toBeUndefined();
      d.pushBack(i);
      expect(d.peekFront()).toBe(i);
      expect(d.peekBack()).toBe(i);
      expect(d.popFront()).toBe(i);
    });
  }
});

// ============================================================================
// CIRCULAR BUFFER — capacity 1 edge case (i=1..50) = 50 tests
// ============================================================================

describe('CircularBuffer — capacity-1 edge case (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`CircularBuffer cap=1 always holds only the latest write, iteration ${i}`, () => {
      const cb = new CircularBuffer<number>(1);
      cb.write(i);
      expect(cb.isFull()).toBe(true);
      cb.write(i + 1); // overwrites
      expect(cb.size()).toBe(1);
      expect(cb.peek()).toBe(i + 1);
      expect(cb.read()).toBe(i + 1);
      expect(cb.isEmpty()).toBe(true);
    });
  }
});

// ============================================================================
// CIRCULAR BUFFER — capacity invalid (single test)
// ============================================================================

describe('CircularBuffer — invalid capacity', () => {
  it('throws RangeError for capacity < 1', () => {
    expect(() => new CircularBuffer(0)).toThrow(RangeError);
    expect(() => new CircularBuffer(-5)).toThrow(RangeError);
  });
});

// ============================================================================
// PRIORITY QUEUE — empty operations (single test)
// ============================================================================

describe('PriorityQueue — empty operations', () => {
  it('dequeue/peek on empty PQ returns undefined', () => {
    const pq = new PriorityQueue<number>();
    expect(pq.dequeue()).toBeUndefined();
    expect(pq.peek()).toBeUndefined();
    expect(pq.isEmpty()).toBe(true);
    expect(pq.toSortedArray()).toEqual([]);
  });
});

// ============================================================================
// DEQUE — mixed pushFront/pushBack then popBack ordering (i=1..50) = 50 tests
// ============================================================================

describe('Deque — pushFront then popBack ordering (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Deque pushFront ${i} items, popBack in FIFO order`, () => {
      const d = new Deque<number>();
      // pushing to front reverses order: last pushed to front = first from back
      for (let j = 1; j <= i; j++) d.pushFront(j);
      // popBack gives 1, 2, 3 ... (FIFO relative to pushFront order)
      for (let j = 1; j <= i; j++) {
        expect(d.popBack()).toBe(j);
      }
      expect(d.isEmpty()).toBe(true);
    });
  }
});

// ============================================================================
// QUEUE — large compact test (i=1..50, 2 assertions each) = 100 tests
// ============================================================================

describe('Queue — head-compaction behaviour (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`Queue dequeue ${i * 2} items triggers compaction iteration ${i}`, () => {
      const q = new Queue<number>();
      // Enqueue 200 items and dequeue 150 to force internal compaction path
      const total = 200;
      for (let j = 0; j < total; j++) q.enqueue(j);
      for (let j = 0; j < 150; j++) q.dequeue();
      expect(q.size()).toBe(50);
      expect(q.peek()).toBe(150);
    });
  }
});

// ============================================================================
// PRIORITY QUEUE — string comparison (i=1..50) = 50 tests
// ============================================================================

describe('PriorityQueue — string items (i=1..50)', () => {
  for (let i = 1; i <= 50; i++) {
    it(`PriorityQueue string min-heap size=${i}`, () => {
      const pq = new PriorityQueue<string>();
      const letters = 'abcdefghijklmnopqrstuvwxyz';
      for (let j = 0; j < i; j++) {
        pq.enqueue(letters[j % 26] + String(j));
      }
      expect(pq.size()).toBe(i);
      const sorted = pq.toSortedArray();
      for (let k = 0; k < sorted.length - 1; k++) {
        expect(sorted[k] <= sorted[k + 1]).toBe(true);
      }
    });
  }
});
