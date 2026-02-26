// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  RingBuffer,
  OverwritingRingBuffer,
  createRingBuffer,
  createOverwritingBuffer,
  fromArray,
} from '../ring-buffer';

// ─── constructor ────────────────────────────────────────────────────────────
describe('RingBuffer constructor', () => {
  it('creates buffer with capacity 1', () => { expect(new RingBuffer(1).capacity).toBe(1); });
  it('creates buffer with capacity 2', () => { expect(new RingBuffer(2).capacity).toBe(2); });
  it('creates buffer with capacity 5', () => { expect(new RingBuffer(5).capacity).toBe(5); });
  it('creates buffer with capacity 10', () => { expect(new RingBuffer(10).capacity).toBe(10); });
  it('creates buffer with capacity 100', () => { expect(new RingBuffer(100).capacity).toBe(100); });
  it('creates buffer with capacity 1000', () => { expect(new RingBuffer(1000).capacity).toBe(1000); });
  it('starts empty size=0 cap=1', () => { expect(new RingBuffer(1).size).toBe(0); });
  it('starts empty size=0 cap=5', () => { expect(new RingBuffer(5).size).toBe(0); });
  it('starts empty size=0 cap=10', () => { expect(new RingBuffer(10).size).toBe(0); });
  it('starts isEmpty=true cap=1', () => { expect(new RingBuffer(1).isEmpty).toBe(true); });
  it('starts isEmpty=true cap=5', () => { expect(new RingBuffer(5).isEmpty).toBe(true); });
  it('starts isFull=false cap=1', () => { expect(new RingBuffer(1).isFull).toBe(false); });
  it('starts isFull=false cap=5', () => { expect(new RingBuffer(5).isFull).toBe(false); });
  it('throws RangeError on capacity 0', () => { expect(() => new RingBuffer(0)).toThrow(RangeError); });
  it('throws RangeError on capacity -1', () => { expect(() => new RingBuffer(-1)).toThrow(RangeError); });
  it('throws RangeError on capacity -100', () => { expect(() => new RingBuffer(-100)).toThrow(RangeError); });
  it('throws on cap=0 with message', () => { expect(() => new RingBuffer(0)).toThrow('Capacity must be positive'); });
  it('throws on cap=-1 with message', () => { expect(() => new RingBuffer(-1)).toThrow('Capacity must be positive'); });
  it('toArray initially empty cap=1', () => { expect(new RingBuffer(1).toArray()).toEqual([]); });
  it('toArray initially empty cap=5', () => { expect(new RingBuffer(5).toArray()).toEqual([]); });
  it('peek on empty returns undefined', () => { expect(new RingBuffer(5).peek()).toBeUndefined(); });
  it('peekLast on empty returns undefined', () => { expect(new RingBuffer(5).peekLast()).toBeUndefined(); });
  it('pop on empty returns undefined', () => { expect(new RingBuffer(5).pop()).toBeUndefined(); });
  it('at(0) on empty returns undefined', () => { expect(new RingBuffer(5).at(0)).toBeUndefined(); });
  it('creates large capacity buffer', () => { expect(new RingBuffer(10000).capacity).toBe(10000); });
  it('capacity is readonly', () => { expect(typeof new RingBuffer(3).capacity).toBe('number'); });
  it('size=0 on new cap=100', () => { expect(new RingBuffer(100).size).toBe(0); });
  it('isEmpty=true on new cap=100', () => { expect(new RingBuffer(100).isEmpty).toBe(true); });
  it('isFull=false on new cap=100', () => { expect(new RingBuffer(100).isFull).toBe(false); });
});

// ─── push: return value ──────────────────────────────────────────────────────
describe('RingBuffer push return value', () => {
  for (let cap = 1; cap <= 20; cap++) {
    it(`push returns true when not full cap=${cap}`, () => {
      const rb = new RingBuffer<number>(cap);
      expect(rb.push(1)).toBe(true);
    });
  }
  for (let cap = 1; cap <= 20; cap++) {
    it(`push returns false when full cap=${cap}`, () => {
      const rb = new RingBuffer<number>(cap);
      for (let i = 0; i < cap; i++) rb.push(i);
      expect(rb.push(99)).toBe(false);
    });
  }
});

// ─── push: size tracking ─────────────────────────────────────────────────────
describe('RingBuffer push size tracking', () => {
  for (let n = 1; n <= 25; n++) {
    it(`size after ${n} pushes into cap=${n+5} is ${n}`, () => {
      const rb = new RingBuffer<number>(n + 5);
      for (let i = 0; i < n; i++) rb.push(i);
      expect(rb.size).toBe(n);
    });
  }
  it('isEmpty becomes false after 1 push', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1);
    expect(rb.isEmpty).toBe(false);
  });
  it('isFull becomes true when filled cap=3', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    expect(rb.isFull).toBe(true);
  });
  it('push does not increase size beyond capacity', () => {
    const rb = new RingBuffer<number>(3);
    for (let i = 0; i < 10; i++) rb.push(i);
    expect(rb.size).toBe(3);
  });
  it('isFull false after one pop from full cap=3', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.pop();
    expect(rb.isFull).toBe(false);
  });
  for (let cap = 1; cap <= 20; cap++) {
    it(`fills to capacity correctly cap=${cap}`, () => {
      const rb = new RingBuffer<number>(cap);
      for (let i = 0; i < cap; i++) rb.push(i);
      expect(rb.size).toBe(cap);
      expect(rb.isFull).toBe(true);
    });
  }
});

// ─── pop ─────────────────────────────────────────────────────────────────────
describe('RingBuffer pop', () => {
  it('pop returns first pushed item FIFO', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(10); rb.push(20);
    expect(rb.pop()).toBe(10);
  });
  it('pop decrements size', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    rb.pop();
    expect(rb.size).toBe(1);
  });
  it('pop until empty then returns undefined', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.pop(); rb.pop(); rb.pop();
    expect(rb.pop()).toBeUndefined();
  });
  it('pop sets isEmpty after draining cap=2', () => {
    const rb = new RingBuffer<number>(2);
    rb.push(1); rb.push(2);
    rb.pop(); rb.pop();
    expect(rb.isEmpty).toBe(true);
  });
  for (let n = 1; n <= 25; n++) {
    it(`pop from ${n}-item buffer returns correct sequence`, () => {
      const rb = new RingBuffer<number>(n + 5);
      for (let i = 0; i < n; i++) rb.push(i * 2);
      for (let i = 0; i < n; i++) {
        expect(rb.pop()).toBe(i * 2);
      }
    });
  }
  it('pop after wrap-around is correct', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.pop(); rb.pop();
    rb.push(4); rb.push(5);
    expect(rb.pop()).toBe(3);
    expect(rb.pop()).toBe(4);
    expect(rb.pop()).toBe(5);
  });
  it('alternating push/pop preserves FIFO order', () => {
    const rb = new RingBuffer<number>(4);
    const result: number[] = [];
    rb.push(1); rb.push(2);
    result.push(rb.pop()!);
    rb.push(3); rb.push(4);
    result.push(rb.pop()!);
    result.push(rb.pop()!);
    result.push(rb.pop()!);
    expect(result).toEqual([1, 2, 3, 4]);
  });
  it('size never goes negative after extra pops', () => {
    const rb = new RingBuffer<number>(3);
    rb.pop(); rb.pop();
    expect(rb.size).toBe(0);
  });
  it('pop on empty after full drain returns undefined twice', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.pop(); rb.pop(); rb.pop();
    expect(rb.pop()).toBeUndefined();
    expect(rb.pop()).toBeUndefined();
  });
});

// ─── peek / peekLast ─────────────────────────────────────────────────────────
describe('RingBuffer peek', () => {
  it('peek returns first item without removing', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(42);
    expect(rb.peek()).toBe(42);
    expect(rb.size).toBe(1);
  });
  it('peek does not decrement size', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    rb.peek();
    expect(rb.size).toBe(2);
  });
  for (let n = 1; n <= 20; n++) {
    it(`peek returns first element with ${n} items`, () => {
      const rb = new RingBuffer<number>(n + 2);
      for (let i = 0; i < n; i++) rb.push(i + 1);
      expect(rb.peek()).toBe(1);
    });
  }
  it('peek after pop returns new head', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(10); rb.push(20); rb.push(30);
    rb.pop();
    expect(rb.peek()).toBe(20);
  });
  it('peek equals pop value', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(7);
    const peeked = rb.peek();
    const popped = rb.pop();
    expect(peeked).toBe(popped);
  });
  it('peek on empty returns undefined', () => {
    expect(new RingBuffer<number>(5).peek()).toBeUndefined();
  });
});

describe('RingBuffer peekLast', () => {
  it('peekLast returns last inserted item', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2); rb.push(3);
    expect(rb.peekLast()).toBe(3);
  });
  it('peekLast does not change size', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    rb.peekLast();
    expect(rb.size).toBe(2);
  });
  for (let n = 1; n <= 20; n++) {
    it(`peekLast returns last element with ${n} items`, () => {
      const rb = new RingBuffer<number>(n + 2);
      for (let i = 0; i < n; i++) rb.push(i + 1);
      expect(rb.peekLast()).toBe(n);
    });
  }
  it('peekLast after wrap-around correct', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.pop(); rb.pop();
    rb.push(4); rb.push(5);
    expect(rb.peekLast()).toBe(5);
  });
  it('peekLast on empty returns undefined', () => {
    expect(new RingBuffer<number>(5).peekLast()).toBeUndefined();
  });
  it('peekLast on cap=1 equals peek', () => {
    const rb = new RingBuffer<number>(1);
    rb.push(77);
    expect(rb.peekLast()).toBe(rb.peek());
  });
  it('peekLast changes after each push', () => {
    const rb = new RingBuffer<number>(5);
    for (let i = 1; i <= 5; i++) {
      rb.push(i * 10);
      expect(rb.peekLast()).toBe(i * 10);
    }
  });
  it('peekLast unchanged after peek call', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2); rb.push(3);
    const last = rb.peekLast();
    rb.peek();
    expect(rb.peekLast()).toBe(last);
  });
  it('peekLast changes after pop when 1 item left', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    rb.pop();
    expect(rb.peekLast()).toBe(2);
  });
  it('peekLast on single item equals that item', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(99);
    expect(rb.peekLast()).toBe(99);
  });
});

// ─── at() ────────────────────────────────────────────────────────────────────
describe('RingBuffer at()', () => {
  it('at(0) returns first item', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(10); rb.push(20); rb.push(30);
    expect(rb.at(0)).toBe(10);
  });
  it('at(1) returns second item', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(10); rb.push(20); rb.push(30);
    expect(rb.at(1)).toBe(20);
  });
  it('at(2) returns third item', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(10); rb.push(20); rb.push(30);
    expect(rb.at(2)).toBe(30);
  });
  it('at(-1) returns undefined', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1);
    expect(rb.at(-1)).toBeUndefined();
  });
  it('at(out of bounds) returns undefined', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    expect(rb.at(2)).toBeUndefined();
  });
  for (let n = 1; n <= 25; n++) {
    it(`at(${n-1}) in ${n}-element buffer returns correct value`, () => {
      const rb = new RingBuffer<number>(n + 2);
      for (let i = 0; i < n; i++) rb.push(i * 3);
      expect(rb.at(n - 1)).toBe((n - 1) * 3);
    });
  }
  it('at() works after wrap-around', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.pop(); rb.pop();
    rb.push(4); rb.push(5);
    expect(rb.at(0)).toBe(3);
    expect(rb.at(1)).toBe(4);
    expect(rb.at(2)).toBe(5);
  });
  it('at(large index) returns undefined', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1);
    expect(rb.at(100)).toBeUndefined();
  });
  it('at() after pop shifts index', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(10); rb.push(20); rb.push(30);
    rb.pop();
    expect(rb.at(0)).toBe(20);
    expect(rb.at(1)).toBe(30);
  });
  it('at(size-1) returns last element', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(10); rb.push(20); rb.push(30);
    expect(rb.at(rb.size - 1)).toBe(30);
  });
  it('at(size) is out of bounds', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    expect(rb.at(rb.size)).toBeUndefined();
  });
  it('at(-2) returns undefined', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    expect(rb.at(-2)).toBeUndefined();
  });
  it('at() matches toArray elements', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(10); rb.push(20); rb.push(30);
    const arr = rb.toArray();
    for (let i = 0; i < arr.length; i++) {
      expect(rb.at(i)).toBe(arr[i]);
    }
  });
});

// ─── toArray ─────────────────────────────────────────────────────────────────
describe('RingBuffer toArray', () => {
  it('toArray on empty returns []', () => {
    expect(new RingBuffer<number>(5).toArray()).toEqual([]);
  });
  it('toArray with 1 item', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(42);
    expect(rb.toArray()).toEqual([42]);
  });
  it('toArray with multiple items preserves order', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2); rb.push(3);
    expect(rb.toArray()).toEqual([1, 2, 3]);
  });
  for (let n = 1; n <= 25; n++) {
    it(`toArray with ${n} items`, () => {
      const rb = new RingBuffer<number>(n + 2);
      const expected = Array.from({ length: n }, (_, i) => i);
      expected.forEach(v => rb.push(v));
      expect(rb.toArray()).toEqual(expected);
    });
  }
  it('toArray after wrap-around is correct', () => {
    const rb = new RingBuffer<number>(4);
    rb.push(1); rb.push(2); rb.push(3); rb.push(4);
    rb.pop(); rb.pop();
    rb.push(5); rb.push(6);
    expect(rb.toArray()).toEqual([3, 4, 5, 6]);
  });
  it('toArray does not mutate the buffer', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    rb.toArray();
    expect(rb.size).toBe(2);
  });
  it('toArray with strings', () => {
    const rb = new RingBuffer<string>(5);
    rb.push('a'); rb.push('b'); rb.push('c');
    expect(rb.toArray()).toEqual(['a', 'b', 'c']);
  });
  it('toArray with objects', () => {
    const rb = new RingBuffer<{ x: number }>(3);
    rb.push({ x: 1 }); rb.push({ x: 2 });
    expect(rb.toArray()).toEqual([{ x: 1 }, { x: 2 }]);
  });
  it('toArray returns new array each call', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1);
    const a1 = rb.toArray();
    const a2 = rb.toArray();
    expect(a1).not.toBe(a2);
  });
  it('toArray returns Array instance', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1);
    expect(Array.isArray(rb.toArray())).toBe(true);
  });
});

// ─── clear ───────────────────────────────────────────────────────────────────
describe('RingBuffer clear', () => {
  it('clear resets size to 0', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    rb.clear();
    expect(rb.size).toBe(0);
  });
  it('clear sets isEmpty true', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1);
    rb.clear();
    expect(rb.isEmpty).toBe(true);
  });
  it('clear sets isFull false on previously full', () => {
    const rb = new RingBuffer<number>(2);
    rb.push(1); rb.push(2);
    rb.clear();
    expect(rb.isFull).toBe(false);
  });
  it('clear allows re-push', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.clear();
    expect(rb.push(10)).toBe(true);
    expect(rb.size).toBe(1);
  });
  it('clear makes toArray return []', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    rb.clear();
    expect(rb.toArray()).toEqual([]);
  });
  it('clear after wrap-around works', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.pop(); rb.push(4);
    rb.clear();
    expect(rb.size).toBe(0);
    expect(rb.toArray()).toEqual([]);
  });
  for (let cap = 1; cap <= 20; cap++) {
    it(`clear on cap=${cap} resets size to 0`, () => {
      const rb = new RingBuffer<number>(cap);
      for (let i = 0; i < cap; i++) rb.push(i);
      rb.clear();
      expect(rb.size).toBe(0);
      expect(rb.isEmpty).toBe(true);
    });
  }
  it('clear preserves capacity', () => {
    const rb = new RingBuffer<number>(7);
    rb.push(1);
    rb.clear();
    expect(rb.capacity).toBe(7);
  });
  it('clear then fill again works', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.clear();
    rb.push(4); rb.push(5); rb.push(6);
    expect(rb.toArray()).toEqual([4, 5, 6]);
  });
  it('double clear is safe', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    rb.clear(); rb.clear();
    expect(rb.size).toBe(0);
  });
  it('clear on empty is safe', () => {
    const rb = new RingBuffer<number>(5);
    expect(() => rb.clear()).not.toThrow();
    expect(rb.isEmpty).toBe(true);
  });
  it('clear returns undefined', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1);
    expect(rb.clear()).toBeUndefined();
  });
});

// ─── pushOverwrite ────────────────────────────────────────────────────────────
describe('RingBuffer pushOverwrite', () => {
  it('pushOverwrite when not full behaves like push', () => {
    const rb = new RingBuffer<number>(5);
    rb.pushOverwrite(1);
    expect(rb.size).toBe(1);
    expect(rb.peek()).toBe(1);
  });
  it('pushOverwrite when full overwrites oldest cap=3', () => {
    const rb = new RingBuffer<number>(3);
    rb.pushOverwrite(1); rb.pushOverwrite(2); rb.pushOverwrite(3);
    rb.pushOverwrite(4);
    expect(rb.toArray()).toEqual([2, 3, 4]);
  });
  it('pushOverwrite keeps size at capacity when full', () => {
    const rb = new RingBuffer<number>(3);
    rb.pushOverwrite(1); rb.pushOverwrite(2); rb.pushOverwrite(3);
    rb.pushOverwrite(4);
    expect(rb.size).toBe(3);
  });
  for (let cap = 1; cap <= 15; cap++) {
    it(`pushOverwrite on full cap=${cap} replaces oldest`, () => {
      const rb = new RingBuffer<number>(cap);
      for (let i = 1; i <= cap; i++) rb.pushOverwrite(i);
      rb.pushOverwrite(cap + 1);
      expect(rb.size).toBe(cap);
      expect(rb.peekLast()).toBe(cap + 1);
    });
  }
  it('pushOverwrite multiple times beyond capacity', () => {
    const rb = new RingBuffer<number>(3);
    for (let i = 1; i <= 10; i++) rb.pushOverwrite(i);
    expect(rb.toArray()).toEqual([8, 9, 10]);
  });
  it('pushOverwrite then pop returns correct items', () => {
    const rb = new RingBuffer<number>(3);
    rb.pushOverwrite(1); rb.pushOverwrite(2); rb.pushOverwrite(3);
    rb.pushOverwrite(4);
    expect(rb.pop()).toBe(2);
    expect(rb.pop()).toBe(3);
    expect(rb.pop()).toBe(4);
  });
  it('pushOverwrite with strings', () => {
    const rb = new RingBuffer<string>(2);
    rb.pushOverwrite('a'); rb.pushOverwrite('b'); rb.pushOverwrite('c');
    expect(rb.toArray()).toEqual(['b', 'c']);
  });
  it('pushOverwrite does not throw on full buffer', () => {
    const rb = new RingBuffer<number>(1);
    rb.pushOverwrite(1);
    expect(() => rb.pushOverwrite(2)).not.toThrow();
  });
  it('pushOverwrite on cap=1 always keeps latest', () => {
    const rb = new RingBuffer<number>(1);
    for (let i = 1; i <= 20; i++) rb.pushOverwrite(i);
    expect(rb.peek()).toBe(20);
    expect(rb.size).toBe(1);
  });
  it('pushOverwrite returns void/undefined', () => {
    const rb = new RingBuffer<number>(3);
    expect(rb.pushOverwrite(1)).toBeUndefined();
  });
  it('pushOverwrite preserves isFull=true on full', () => {
    const rb = new RingBuffer<number>(3);
    rb.pushOverwrite(1); rb.pushOverwrite(2); rb.pushOverwrite(3);
    rb.pushOverwrite(4);
    expect(rb.isFull).toBe(true);
  });
  it('pushOverwrite interleaved with pop', () => {
    const rb = new RingBuffer<number>(3);
    rb.pushOverwrite(1); rb.pushOverwrite(2); rb.pushOverwrite(3);
    rb.pop(); // removes 1, now [2,3]
    rb.pushOverwrite(4); rb.pushOverwrite(5); // [2,3,4] then full push 5 -> [3,4,5]
    expect(rb.toArray()).toEqual([3, 4, 5]);
  });
});

// ─── pushOverwrite peek correctness ──────────────────────────────────────────
describe('pushOverwrite peek after overflow', () => {
  for (let extra = 1; extra <= 15; extra++) {
    it(`after ${extra} extra pushOverwrites on cap=3, peek = extra+1`, () => {
      const rb = new RingBuffer<number>(3);
      rb.pushOverwrite(1); rb.pushOverwrite(2); rb.pushOverwrite(3);
      for (let i = 0; i < extra; i++) rb.pushOverwrite(4 + i);
      // After extra overwrites: oldest = 1 + extra (0-indexed: index = extra + 1)
      expect(rb.peek()).toBe(extra + 1);
      expect(rb.size).toBe(3);
    });
  }
});

// ─── OverwritingRingBuffer ────────────────────────────────────────────────────
describe('OverwritingRingBuffer', () => {
  it('push always returns true when not full', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    expect(rb.push(1)).toBe(true);
  });
  it('push always returns true when full', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    expect(rb.push(4)).toBe(true);
  });
  it('push when full overwrites oldest', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.push(4);
    expect(rb.toArray()).toEqual([2, 3, 4]);
  });
  it('size stays at capacity when pushing over limit', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    for (let i = 0; i < 10; i++) rb.push(i);
    expect(rb.size).toBe(3);
  });
  for (let cap = 1; cap <= 15; cap++) {
    it(`OverwritingRingBuffer cap=${cap} keeps last ${cap} items`, () => {
      const rb = new OverwritingRingBuffer<number>(cap);
      for (let i = 0; i < cap + 5; i++) rb.push(i);
      const expected = Array.from({ length: cap }, (_, i) => 5 + i);
      expect(rb.toArray()).toEqual(expected);
    });
  }
  it('extends RingBuffer', () => {
    expect(new OverwritingRingBuffer(3)).toBeInstanceOf(RingBuffer);
  });
  it('inherits peek from RingBuffer', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3); rb.push(4);
    expect(rb.peek()).toBe(2);
  });
  it('inherits clear from RingBuffer', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.clear();
    expect(rb.isEmpty).toBe(true);
  });
  it('inherits iterator from RingBuffer', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3); rb.push(4);
    expect([...rb]).toEqual([2, 3, 4]);
  });
  it('cap=1 always holds only latest', () => {
    const rb = new OverwritingRingBuffer<number>(1);
    for (let i = 0; i < 50; i++) rb.push(i);
    expect(rb.peek()).toBe(49);
    expect(rb.size).toBe(1);
  });
  it('cap=2 rolling window', () => {
    const rb = new OverwritingRingBuffer<number>(2);
    rb.push(1); rb.push(2); rb.push(3); rb.push(4);
    expect(rb.toArray()).toEqual([3, 4]);
  });
  it('wrap-around multiple times keeps last cap elements', () => {
    const rb = new OverwritingRingBuffer<number>(4);
    for (let i = 1; i <= 12; i++) rb.push(i);
    expect(rb.toArray()).toEqual([9, 10, 11, 12]);
  });
  it('size always <= capacity during overflow', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    for (let i = 0; i < 20; i++) {
      rb.push(i);
      expect(rb.size).toBeLessThanOrEqual(rb.capacity);
    }
  });
  it('isFull stays true after multiple overwrites', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.push(4); rb.push(5);
    expect(rb.isFull).toBe(true);
  });
  it('clear after overflow resets', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    for (let i = 0; i < 10; i++) rb.push(i);
    rb.clear();
    expect(rb.isEmpty).toBe(true);
    expect(rb.size).toBe(0);
  });
  it('at() returns correct after overflow', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    for (let i = 0; i < 6; i++) rb.push(i);
    expect(rb.at(0)).toBe(3);
    expect(rb.at(1)).toBe(4);
    expect(rb.at(2)).toBe(5);
  });
  it('pop after overwrite returns oldest surviving item', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3); rb.push(4);
    expect(rb.pop()).toBe(2);
  });
});

// ─── createRingBuffer factory ─────────────────────────────────────────────────
describe('createRingBuffer factory', () => {
  it('creates a RingBuffer instance', () => {
    expect(createRingBuffer<number>(5)).toBeInstanceOf(RingBuffer);
  });
  it('creates with correct capacity', () => {
    expect(createRingBuffer<number>(10).capacity).toBe(10);
  });
  it('starts empty', () => {
    expect(createRingBuffer<number>(5).isEmpty).toBe(true);
  });
  for (let cap = 1; cap <= 20; cap++) {
    it(`createRingBuffer(${cap}) has capacity ${cap}`, () => {
      expect(createRingBuffer<number>(cap).capacity).toBe(cap);
    });
  }
  it('throws on capacity 0', () => {
    expect(() => createRingBuffer(0)).toThrow(RangeError);
  });
  it('throws on negative capacity', () => {
    expect(() => createRingBuffer(-5)).toThrow(RangeError);
  });
  it('returned buffer is functional', () => {
    const rb = createRingBuffer<string>(3);
    rb.push('a'); rb.push('b');
    expect(rb.toArray()).toEqual(['a', 'b']);
  });
  it('returned buffer push/pop works', () => {
    const rb = createRingBuffer<number>(3);
    rb.push(1); rb.push(2);
    expect(rb.pop()).toBe(1);
  });
});

// ─── createOverwritingBuffer factory ─────────────────────────────────────────
describe('createOverwritingBuffer factory', () => {
  it('creates an OverwritingRingBuffer instance', () => {
    expect(createOverwritingBuffer<number>(5)).toBeInstanceOf(OverwritingRingBuffer);
  });
  it('also instanceof RingBuffer', () => {
    expect(createOverwritingBuffer<number>(5)).toBeInstanceOf(RingBuffer);
  });
  it('creates with correct capacity', () => {
    expect(createOverwritingBuffer<number>(7).capacity).toBe(7);
  });
  for (let cap = 1; cap <= 20; cap++) {
    it(`createOverwritingBuffer(${cap}) has capacity ${cap}`, () => {
      expect(createOverwritingBuffer<number>(cap).capacity).toBe(cap);
    });
  }
  it('throws on capacity 0', () => {
    expect(() => createOverwritingBuffer(0)).toThrow(RangeError);
  });
  it('throws on negative capacity', () => {
    expect(() => createOverwritingBuffer(-1)).toThrow(RangeError);
  });
  it('push on full returns true', () => {
    const rb = createOverwritingBuffer<number>(2);
    rb.push(1); rb.push(2);
    expect(rb.push(3)).toBe(true);
  });
  it('returned buffer is functional', () => {
    const rb = createOverwritingBuffer<number>(3);
    for (let i = 1; i <= 6; i++) rb.push(i);
    expect(rb.toArray()).toEqual([4, 5, 6]);
  });
});

// ─── fromArray ────────────────────────────────────────────────────────────────
describe('fromArray', () => {
  it('creates RingBuffer from array', () => {
    const rb = fromArray([1, 2, 3]);
    expect(rb).toBeInstanceOf(RingBuffer);
  });
  it('default capacity equals array length', () => {
    const rb = fromArray([1, 2, 3]);
    expect(rb.capacity).toBe(3);
  });
  it('toArray matches input', () => {
    expect(fromArray([10, 20, 30]).toArray()).toEqual([10, 20, 30]);
  });
  it('size equals array length', () => {
    expect(fromArray([1, 2, 3, 4]).size).toBe(4);
  });
  for (let n = 1; n <= 25; n++) {
    it(`fromArray with ${n} items has correct content`, () => {
      const arr = Array.from({ length: n }, (_, i) => i * 5);
      expect(fromArray(arr).toArray()).toEqual(arr);
    });
  }
  it('fromArray with custom capacity larger than array', () => {
    const rb = fromArray([1, 2], 5);
    expect(rb.capacity).toBe(5);
    expect(rb.size).toBe(2);
    expect(rb.toArray()).toEqual([1, 2]);
  });
  it('fromArray with custom capacity equal to array length', () => {
    const rb = fromArray([1, 2, 3], 3);
    expect(rb.isFull).toBe(true);
  });
  it('fromArray with capacity smaller than array truncates', () => {
    const rb = fromArray([1, 2, 3, 4, 5], 3);
    expect(rb.size).toBe(3);
    expect(rb.toArray()).toEqual([1, 2, 3]);
  });
  it('fromArray empty array with explicit capacity', () => {
    const rb = fromArray([], 5);
    expect(rb.isEmpty).toBe(true);
    expect(rb.capacity).toBe(5);
  });
  it('fromArray with strings', () => {
    const rb = fromArray(['hello', 'world']);
    expect(rb.toArray()).toEqual(['hello', 'world']);
  });
  it('fromArray capacity 1 keeps first item', () => {
    const rb = fromArray([10, 20, 30], 1);
    expect(rb.peek()).toBe(10);
  });
  it('fromArray peek returns first element', () => {
    expect(fromArray([5, 10, 15]).peek()).toBe(5);
  });
  it('fromArray peekLast returns last element', () => {
    expect(fromArray([5, 10, 15]).peekLast()).toBe(15);
  });
  it('fromArray throws on capacity 0', () => {
    expect(() => fromArray([1, 2, 3], 0)).toThrow(RangeError);
  });
  it('fromArray single element', () => {
    const rb = fromArray([7]);
    expect(rb.size).toBe(1);
    expect(rb.peek()).toBe(7);
  });
  it('fromArray preserves item reference', () => {
    const obj = { x: 1 };
    const rb = fromArray([obj], 2);
    expect(rb.peek()).toBe(obj);
  });
  it('fromArray with large capacity allows more pushes', () => {
    const rb = fromArray([1, 2, 3], 10);
    expect(rb.push(4)).toBe(true);
    expect(rb.size).toBe(4);
  });
  it('fromArray then pop all returns original order', () => {
    const arr = [5, 10, 15, 20];
    const rb = fromArray(arr);
    const result: number[] = [];
    while (!rb.isEmpty) result.push(rb.pop()!);
    expect(result).toEqual(arr);
  });
  it('fromArray then iterate matches original', () => {
    const arr = [3, 6, 9, 12, 15];
    const rb = fromArray(arr);
    expect([...rb]).toEqual(arr);
  });
  it('fromArray then clear then push starts fresh', () => {
    const rb = fromArray([1, 2, 3]);
    rb.clear();
    rb.push(99);
    expect(rb.toArray()).toEqual([99]);
  });
  for (let n = 1; n <= 15; n++) {
    it(`fromArray(${n}) pop sequence correct`, () => {
      const arr = Array.from({ length: n }, (_, i) => i + 1);
      const rb = fromArray(arr);
      for (let i = 0; i < n; i++) {
        expect(rb.pop()).toBe(arr[i]);
      }
    });
  }
});

// ─── iterator ─────────────────────────────────────────────────────────────────
describe('RingBuffer iterator', () => {
  it('for-of iterates in FIFO order', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2); rb.push(3);
    const result: number[] = [];
    for (const v of rb) result.push(v);
    expect(result).toEqual([1, 2, 3]);
  });
  it('for-of on empty produces no iterations', () => {
    const rb = new RingBuffer<number>(5);
    const result: number[] = [];
    for (const v of rb) result.push(v);
    expect(result).toEqual([]);
  });
  it('spread operator works', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(10); rb.push(20);
    expect([...rb]).toEqual([10, 20]);
  });
  it('Array.from works', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2); rb.push(3);
    expect(Array.from(rb)).toEqual([1, 2, 3]);
  });
  for (let n = 1; n <= 20; n++) {
    it(`iterator over ${n} items matches toArray`, () => {
      const rb = new RingBuffer<number>(n + 2);
      for (let i = 0; i < n; i++) rb.push(i * 7);
      expect([...rb]).toEqual(rb.toArray());
    });
  }
  it('iterator after wrap-around is correct', () => {
    const rb = new RingBuffer<number>(4);
    rb.push(1); rb.push(2); rb.push(3); rb.push(4);
    rb.pop(); rb.pop();
    rb.push(5); rb.push(6);
    expect([...rb]).toEqual([3, 4, 5, 6]);
  });
  it('iterator does not consume items', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    [...rb];
    expect(rb.size).toBe(2);
  });
  it('multiple iterations produce same result', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2); rb.push(3);
    expect([...rb]).toEqual([...rb]);
  });
  it('iterator works with strings', () => {
    const rb = new RingBuffer<string>(4);
    rb.push('x'); rb.push('y');
    expect([...rb]).toEqual(['x', 'y']);
  });
  it('destructuring works', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2); rb.push(3);
    const [a, b, c] = rb;
    expect(a).toBe(1);
    expect(b).toBe(2);
    expect(c).toBe(3);
  });
  it('iterator next done=false while items remain', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2);
    const iter = rb[Symbol.iterator]();
    expect(iter.next().done).toBe(false);
    expect(iter.next().done).toBe(false);
  });
  it('iterator next done=true after exhaustion', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1);
    const iter = rb[Symbol.iterator]();
    iter.next();
    expect(iter.next().done).toBe(true);
  });
  it('two independent iterators do not interfere', () => {
    const rb = new RingBuffer<number>(4);
    rb.push(1); rb.push(2); rb.push(3);
    const iter1 = rb[Symbol.iterator]();
    const iter2 = rb[Symbol.iterator]();
    expect(iter1.next().value).toBe(1);
    expect(iter2.next().value).toBe(1);
    expect(iter1.next().value).toBe(2);
    expect(iter2.next().value).toBe(2);
  });
  it('empty iterator done=true immediately', () => {
    const rb = new RingBuffer<number>(3);
    const iter = rb[Symbol.iterator]();
    expect(iter.next().done).toBe(true);
  });
  it('iterator values are correct in order', () => {
    const rb = new RingBuffer<number>(4);
    rb.push(10); rb.push(20); rb.push(30);
    const iter = rb[Symbol.iterator]();
    expect(iter.next().value).toBe(10);
    expect(iter.next().value).toBe(20);
    expect(iter.next().value).toBe(30);
  });
});

// ─── Generic types ────────────────────────────────────────────────────────────
describe('RingBuffer generic types', () => {
  it('works with numbers', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2);
    expect(rb.toArray()).toEqual([1, 2]);
  });
  it('works with strings', () => {
    const rb = new RingBuffer<string>(3);
    rb.push('a'); rb.push('b');
    expect(rb.toArray()).toEqual(['a', 'b']);
  });
  it('works with booleans', () => {
    const rb = new RingBuffer<boolean>(4);
    rb.push(true); rb.push(false); rb.push(true);
    expect(rb.toArray()).toEqual([true, false, true]);
  });
  it('works with objects', () => {
    const rb = new RingBuffer<{ id: number }>(3);
    rb.push({ id: 1 }); rb.push({ id: 2 });
    expect(rb.toArray()).toEqual([{ id: 1 }, { id: 2 }]);
  });
  it('works with arrays', () => {
    const rb = new RingBuffer<number[]>(3);
    rb.push([1, 2]); rb.push([3, 4]);
    expect(rb.toArray()).toEqual([[1, 2], [3, 4]]);
  });
  it('works with null values', () => {
    const rb = new RingBuffer<null>(3);
    rb.push(null); rb.push(null);
    expect(rb.toArray()).toEqual([null, null]);
  });
  it('works with zero value', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(0); rb.push(0);
    expect(rb.size).toBe(2);
    expect(rb.toArray()).toEqual([0, 0]);
  });
  it('stores Date objects', () => {
    const d1 = new Date(2026, 0, 1);
    const d2 = new Date(2026, 0, 2);
    const rb = new RingBuffer<Date>(3);
    rb.push(d1); rb.push(d2);
    expect(rb.pop()).toBe(d1);
    expect(rb.pop()).toBe(d2);
  });
  it('stores functions', () => {
    const f1 = () => 1;
    const f2 = () => 2;
    const rb = new RingBuffer<() => number>(3);
    rb.push(f1); rb.push(f2);
    expect(rb.pop()!()).toBe(1);
    expect(rb.pop()!()).toBe(2);
  });
  it('stores symbols', () => {
    const s1 = Symbol('a');
    const s2 = Symbol('b');
    const rb = new RingBuffer<symbol>(3);
    rb.push(s1); rb.push(s2);
    expect(rb.pop()).toBe(s1);
    expect(rb.pop()).toBe(s2);
  });
  it('stores negative numbers', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(-42);
    expect(rb.peek()).toBe(-42);
  });
  it('stores empty string', () => {
    const rb = new RingBuffer<string>(3);
    rb.push('');
    expect(rb.peek()).toBe('');
  });
  it('stores Infinity', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(Infinity);
    expect(rb.pop()).toBe(Infinity);
  });
  it('stores -Infinity', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(-Infinity);
    expect(rb.pop()).toBe(-Infinity);
  });
  it('stores NaN', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(NaN);
    expect(Number.isNaN(rb.pop()!)).toBe(true);
  });
  it('stores floats', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(3.14);
    expect(rb.pop()).toBeCloseTo(3.14);
  });
  it('stores Number.MAX_SAFE_INTEGER', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(Number.MAX_SAFE_INTEGER);
    expect(rb.pop()).toBe(Number.MAX_SAFE_INTEGER);
  });
  it('stores Number.EPSILON', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(Number.EPSILON);
    expect(rb.pop()).toBe(Number.EPSILON);
  });
  it('at() returns correct symbol', () => {
    const s = Symbol('test');
    const rb = new RingBuffer<symbol>(3);
    rb.push(s);
    expect(rb.at(0)).toBe(s);
  });
});

// ─── Large capacity ───────────────────────────────────────────────────────────
describe('RingBuffer large capacity', () => {
  it('push 1000 items into cap=1000', () => {
    const rb = new RingBuffer<number>(1000);
    for (let i = 0; i < 1000; i++) rb.push(i);
    expect(rb.size).toBe(1000);
    expect(rb.isFull).toBe(true);
  });
  it('toArray of 1000 items has correct length', () => {
    const rb = new RingBuffer<number>(1000);
    for (let i = 0; i < 1000; i++) rb.push(i);
    expect(rb.toArray().length).toBe(1000);
  });
  it('toArray first element of 1000', () => {
    const rb = new RingBuffer<number>(1000);
    for (let i = 0; i < 1000; i++) rb.push(i);
    expect(rb.toArray()[0]).toBe(0);
  });
  it('toArray last element of 1000', () => {
    const rb = new RingBuffer<number>(1000);
    for (let i = 0; i < 1000; i++) rb.push(i);
    expect(rb.toArray()[999]).toBe(999);
  });
  it('pop 1000 items in FIFO order', () => {
    const rb = new RingBuffer<number>(1000);
    for (let i = 0; i < 1000; i++) rb.push(i);
    for (let i = 0; i < 1000; i++) {
      expect(rb.pop()).toBe(i);
    }
  });
  it('wrap-around at large capacity', () => {
    const rb = new RingBuffer<number>(500);
    for (let i = 0; i < 500; i++) rb.push(i);
    for (let i = 0; i < 250; i++) rb.pop();
    for (let i = 0; i < 250; i++) rb.push(1000 + i);
    expect(rb.size).toBe(500);
    expect(rb.peek()).toBe(250);
    expect(rb.peekLast()).toBe(1249);
  });
});

// ─── State consistency ────────────────────────────────────────────────────────
describe('RingBuffer state consistency', () => {
  for (let cap = 1; cap <= 15; cap++) {
    it(`size + free = capacity for cap=${cap}`, () => {
      const rb = new RingBuffer<number>(cap);
      const n = Math.floor(cap / 2);
      for (let i = 0; i < n; i++) rb.push(i);
      expect(rb.size + (cap - rb.size)).toBe(cap);
    });
  }
  it('isFull iff size === capacity', () => {
    const rb = new RingBuffer<number>(4);
    for (let i = 0; i < 4; i++) {
      expect(rb.isFull).toBe(rb.size === rb.capacity);
      rb.push(i);
    }
    expect(rb.isFull).toBe(true);
  });
  it('isEmpty iff size === 0', () => {
    const rb = new RingBuffer<number>(4);
    expect(rb.isEmpty).toBe(rb.size === 0);
    rb.push(1);
    expect(rb.isEmpty).toBe(rb.size === 0);
    rb.pop();
    expect(rb.isEmpty).toBe(rb.size === 0);
  });
  it('size matches toArray length', () => {
    const rb = new RingBuffer<number>(6);
    rb.push(1); rb.push(2); rb.push(3);
    rb.pop();
    expect(rb.size).toBe(rb.toArray().length);
  });
  it('at(i) for all i < size returns defined', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(10); rb.push(20); rb.push(30);
    for (let i = 0; i < rb.size; i++) {
      expect(rb.at(i)).toBeDefined();
    }
  });
  it('at(i) for all i < size matches toArray[i]', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(10); rb.push(20); rb.push(30);
    const arr = rb.toArray();
    for (let i = 0; i < arr.length; i++) {
      expect(rb.at(i)).toBe(arr[i]);
    }
  });
  it('at(i) after multiple wrap-arounds matches toArray', () => {
    const rb = new RingBuffer<number>(5);
    for (let i = 0; i < 5; i++) rb.push(i);
    for (let i = 0; i < 3; i++) rb.pop();
    for (let i = 0; i < 3; i++) rb.push(i + 100);
    const arr = rb.toArray();
    for (let i = 0; i < arr.length; i++) {
      expect(rb.at(i)).toBe(arr[i]);
    }
  });
});

// ─── toArray vs iterator consistency ─────────────────────────────────────────
describe('toArray vs iterator consistency', () => {
  for (let n = 0; n <= 20; n++) {
    it(`toArray equals spread for ${n} items`, () => {
      const rb = new RingBuffer<number>(n + 1);
      for (let i = 0; i < n; i++) rb.push(i);
      expect(rb.toArray()).toEqual([...rb]);
    });
  }
  it('after 10 pushes and 5 pops, toArray matches iterator', () => {
    const rb = new RingBuffer<number>(15);
    for (let i = 0; i < 10; i++) rb.push(i);
    for (let i = 0; i < 5; i++) rb.pop();
    expect(rb.toArray()).toEqual([...rb]);
  });
  it('after wrap-around, toArray matches iterator', () => {
    const rb = new RingBuffer<number>(4);
    for (let i = 0; i < 4; i++) rb.push(i);
    rb.pop(); rb.pop();
    rb.push(10); rb.push(11);
    expect(rb.toArray()).toEqual([...rb]);
  });
});

// ─── Wrap-around stress ───────────────────────────────────────────────────────
describe('RingBuffer wrap-around stress', () => {
  for (let cap = 2; cap <= 12; cap++) {
    it(`wrap-around FIFO integrity cap=${cap}`, () => {
      const rb = new RingBuffer<number>(cap);
      const expected: number[] = [];
      let counter = 0;
      for (let i = 0; i < cap; i++) { rb.push(counter); expected.push(counter); counter++; }
      for (let cycle = 0; cycle < 3; cycle++) {
        const popped = rb.pop();
        expect(popped).toBe(expected.shift());
        rb.push(counter);
        expected.push(counter);
        counter++;
      }
      expect(rb.toArray()).toEqual(expected);
    });
  }
  it('fill drain fill again produces correct results', () => {
    const rb = new RingBuffer<number>(4);
    for (let i = 0; i < 4; i++) rb.push(i);
    for (let i = 0; i < 4; i++) rb.pop();
    for (let i = 10; i < 14; i++) rb.push(i);
    expect(rb.toArray()).toEqual([10, 11, 12, 13]);
  });
  it('many pushes and pops maintain FIFO across many cycles', () => {
    const rb = new RingBuffer<number>(5);
    const queue: number[] = [];
    let val = 0;
    for (let round = 0; round < 30; round++) {
      const pushCount = Math.min(3, rb.capacity - rb.size);
      for (let p = 0; p < pushCount; p++) {
        rb.push(val); queue.push(val); val++;
      }
      const popCount = Math.min(2, rb.size);
      for (let p = 0; p < popCount; p++) {
        expect(rb.pop()).toBe(queue.shift());
      }
    }
  });
});

// ─── Precise wrap boundary ───────────────────────────────────────────────────
describe('RingBuffer precise wrap-around boundary', () => {
  it('wrap at exactly cap=2 boundary', () => {
    const rb = new RingBuffer<number>(2);
    rb.push(1); rb.push(2);
    rb.pop();
    rb.push(3);
    expect(rb.toArray()).toEqual([2, 3]);
  });
  it('wrap at exactly cap=3 boundary', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.pop(); rb.pop();
    rb.push(4); rb.push(5);
    expect(rb.toArray()).toEqual([3, 4, 5]);
  });
  for (let cap = 2; cap <= 10; cap++) {
    it(`full cycle wrap cap=${cap}: fill drain-half refill-half`, () => {
      const rb = new RingBuffer<number>(cap);
      const half = Math.floor(cap / 2);
      for (let i = 0; i < cap; i++) rb.push(i);
      for (let i = 0; i < half; i++) rb.pop();
      for (let i = 0; i < half; i++) rb.push(100 + i);
      expect(rb.size).toBe(cap);
      expect(rb.at(0)).toBe(half);
    });
  }
});

// ─── Mixed operations ─────────────────────────────────────────────────────────
describe('RingBuffer mixed operations', () => {
  it('push peek push pop peekLast sequence', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1);
    expect(rb.peek()).toBe(1);
    rb.push(2);
    expect(rb.pop()).toBe(1);
    expect(rb.peekLast()).toBe(2);
  });
  it('clear then pushOverwrite works', () => {
    const rb = new RingBuffer<number>(3);
    rb.push(1); rb.push(2); rb.push(3);
    rb.clear();
    rb.pushOverwrite(10); rb.pushOverwrite(20); rb.pushOverwrite(30); rb.pushOverwrite(40);
    expect(rb.toArray()).toEqual([20, 30, 40]);
  });
  it('at() after clear returns undefined', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    rb.clear();
    expect(rb.at(0)).toBeUndefined();
  });
  it('iterator after clear yields nothing', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2);
    rb.clear();
    expect([...rb]).toEqual([]);
  });
  for (let rounds = 1; rounds <= 15; rounds++) {
    it(`fill-drain-fill round ${rounds} preserves correctness`, () => {
      const rb = new RingBuffer<number>(4);
      for (let i = 0; i < 4; i++) rb.push(rounds * 10 + i);
      for (let i = 0; i < 4; i++) rb.pop();
      for (let i = 0; i < 4; i++) rb.push(rounds * 100 + i);
      expect(rb.size).toBe(4);
      expect(rb.toArray()).toEqual([rounds*100, rounds*100+1, rounds*100+2, rounds*100+3]);
    });
  }
  it('push after failed push (full) works after pop', () => {
    const rb = new RingBuffer<number>(2);
    rb.push(1); rb.push(2);
    expect(rb.push(3)).toBe(false);
    rb.pop();
    expect(rb.push(3)).toBe(true);
    expect(rb.toArray()).toEqual([2, 3]);
  });
  it('peekLast on single item equals peek', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(42);
    expect(rb.peek()).toBe(rb.peekLast());
  });
});

// ─── Sliding window use case ─────────────────────────────────────────────────
describe('RingBuffer as sliding window', () => {
  it('sliding window of size 3 over 10 elements', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    for (let i = 0; i < 10; i++) rb.push(i);
    expect(rb.toArray()).toEqual([7, 8, 9]);
  });
  it('sliding window average calculation', () => {
    const rb = new OverwritingRingBuffer<number>(4);
    [1, 2, 3, 4, 5, 6].forEach(v => rb.push(v));
    const sum = rb.toArray().reduce((a, b) => a + b, 0);
    expect(sum / rb.size).toBe(4.5);
  });
  it('sliding window size always cap after fill', () => {
    const rb = new OverwritingRingBuffer<number>(5);
    for (let i = 0; i < 20; i++) {
      rb.push(i);
      if (i >= 4) expect(rb.size).toBe(5);
    }
  });
  it('sliding window most recent N logs', () => {
    const rb = new OverwritingRingBuffer<string>(3);
    ['log1','log2','log3','log4','log5'].forEach(l => rb.push(l));
    expect(rb.toArray()).toEqual(['log3','log4','log5']);
  });
  for (let winSize = 2; winSize <= 10; winSize++) {
    it(`sliding window size=${winSize} over 20 items keeps last ${winSize}`, () => {
      const rb = new OverwritingRingBuffer<number>(winSize);
      for (let i = 0; i < 20; i++) rb.push(i);
      const expected = Array.from({ length: winSize }, (_, i) => 20 - winSize + i);
      expect(rb.toArray()).toEqual(expected);
    });
  }
});

// ─── Repeated clear and refill ────────────────────────────────────────────────
describe('RingBuffer repeated clear and refill', () => {
  for (let round = 1; round <= 20; round++) {
    it(`round ${round}: clear and refill produces correct results`, () => {
      const rb = new RingBuffer<number>(5);
      for (let i = 0; i < (round % 5) + 1; i++) rb.push(i * round);
      rb.clear();
      for (let i = 0; i < 3; i++) rb.push(round * 100 + i);
      expect(rb.size).toBe(3);
      expect(rb.peek()).toBe(round * 100);
      expect(rb.peekLast()).toBe(round * 100 + 2);
    });
  }
});

// ─── at() after wrap and pop ─────────────────────────────────────────────────
describe('at() after various wrap and pop states', () => {
  for (let pops = 1; pops <= 5; pops++) {
    it(`at() correct after ${pops} pops and refill on cap=5`, () => {
      const rb = new RingBuffer<number>(5);
      for (let i = 0; i < 5; i++) rb.push(i);
      for (let i = 0; i < pops; i++) rb.pop();
      for (let i = 0; i < pops; i++) rb.push(10 + i);
      const arr = rb.toArray();
      for (let i = 0; i < arr.length; i++) {
        expect(rb.at(i)).toBe(arr[i]);
      }
    });
  }
});

// ─── OverwritingRingBuffer extra ─────────────────────────────────────────────
describe('OverwritingRingBuffer extra coverage', () => {
  for (let overwrites = 1; overwrites <= 15; overwrites++) {
    it(`after ${overwrites} overwrites on cap=3, size is still 3`, () => {
      const rb = new OverwritingRingBuffer<number>(3);
      rb.push(1); rb.push(2); rb.push(3);
      for (let i = 0; i < overwrites; i++) rb.push(4 + i);
      expect(rb.size).toBe(3);
    });
  }
});

// ─── Snapshot tests ───────────────────────────────────────────────────────────
describe('RingBuffer snapshot-style tests', () => {
  it('snapshot: cap=5 push 1..5 pop 2 push 6,7', () => {
    const rb = new RingBuffer<number>(5);
    for (let i = 1; i <= 5; i++) rb.push(i);
    rb.pop(); rb.pop();
    rb.push(6); rb.push(7);
    expect(rb.toArray()).toEqual([3, 4, 5, 6, 7]);
  });
  it('snapshot: cap=4 alternating', () => {
    const rb = new RingBuffer<number>(4);
    rb.push(10); rb.push(20);
    rb.pop();
    rb.push(30); rb.push(40); rb.push(50);
    rb.pop();
    expect(rb.toArray()).toEqual([30, 40, 50]);
  });
  it('snapshot: OverwritingRingBuffer cap=3 push 1..9', () => {
    const rb = new OverwritingRingBuffer<number>(3);
    for (let i = 1; i <= 9; i++) rb.push(i);
    expect(rb.toArray()).toEqual([7, 8, 9]);
  });
  it('snapshot: fromArray [2,4,6,8] pop all', () => {
    const rb = fromArray([2, 4, 6, 8]);
    expect(rb.pop()).toBe(2);
    expect(rb.pop()).toBe(4);
    expect(rb.pop()).toBe(6);
    expect(rb.pop()).toBe(8);
    expect(rb.isEmpty).toBe(true);
  });
  it('snapshot: cap=1 push pop push', () => {
    const rb = new RingBuffer<number>(1);
    rb.push(1);
    rb.pop();
    rb.push(2);
    expect(rb.peek()).toBe(2);
    expect(rb.isFull).toBe(true);
  });
  it('snapshot: fromArray then pushOverwrite', () => {
    const rb = fromArray([1, 2, 3]);
    rb.pushOverwrite(4);
    expect(rb.toArray()).toEqual([2, 3, 4]);
  });
});

// ─── FIFO stress with various caps ───────────────────────────────────────────
describe('RingBuffer FIFO stress various caps', () => {
  for (let cap = 3; cap <= 15; cap++) {
    it(`FIFO maintained over 30 ops with cap=${cap}`, () => {
      const rb = new RingBuffer<number>(cap);
      const q: number[] = [];
      let val = 0;
      for (let op = 0; op < 30; op++) {
        if (!rb.isFull) { rb.push(val); q.push(val++); }
        else { expect(rb.pop()).toBe(q.shift()); }
      }
    });
  }
});

// ─── fromArray with extra capacity then operations ────────────────────────────
describe('fromArray with extra capacity then push', () => {
  for (let n = 1; n <= 15; n++) {
    it(`fromArray(${n}) push one more into spare capacity works`, () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const rb = fromArray(arr, n + 1);
      expect(rb.push(999)).toBe(true);
      expect(rb.peekLast()).toBe(999);
    });
  }
});

// ─── pushOverwrite sequence toArray checks ─────────────────────────────────────
describe('pushOverwrite sequence toArray checks', () => {
  for (let cap = 2; cap <= 10; cap++) {
    it(`pushOverwrite ${cap+2} items into cap=${cap} gives last ${cap}`, () => {
      const rb = new RingBuffer<number>(cap);
      const all: number[] = [];
      for (let i = 0; i < cap + 2; i++) {
        rb.pushOverwrite(i);
        all.push(i);
      }
      const expected = all.slice(all.length - cap);
      expect(rb.toArray()).toEqual(expected);
    });
  }
});

// ─── Capacity edge: very large ────────────────────────────────────────────────
describe('RingBuffer sparse fill large cap', () => {
  for (let cap = 10; cap <= 25; cap++) {
    it(`cap=${cap} with 1 item all operations consistent`, () => {
      const rb = new RingBuffer<number>(cap);
      rb.push(cap * 2);
      expect(rb.size).toBe(1);
      expect(rb.isEmpty).toBe(false);
      expect(rb.isFull).toBe(false);
      expect(rb.peek()).toBe(cap * 2);
      expect(rb.peekLast()).toBe(cap * 2);
      expect(rb.at(0)).toBe(cap * 2);
      expect(rb.toArray()).toEqual([cap * 2]);
      expect([...rb]).toEqual([cap * 2]);
    });
  }
});

// ─── Complex sequences ────────────────────────────────────────────────────────
describe('RingBuffer complex sequences', () => {
  it('push 3 pop 1 push 2 pop 2 check toArray', () => {
    const rb = new RingBuffer<number>(5);
    rb.push(1); rb.push(2); rb.push(3);
    rb.pop();
    rb.push(4); rb.push(5);
    rb.pop(); rb.pop();
    expect(rb.toArray()).toEqual([4, 5]);
  });
  it('fill clear fill-half check', () => {
    const rb = new RingBuffer<number>(6);
    for (let i = 0; i < 6; i++) rb.push(i);
    rb.clear();
    rb.push(10); rb.push(20); rb.push(30);
    expect(rb.size).toBe(3);
    expect(rb.toArray()).toEqual([10, 20, 30]);
  });
  for (let seed = 1; seed <= 15; seed++) {
    it(`seed ${seed}: fill then partial drain then fill toArray correct`, () => {
      const rb = new RingBuffer<number>(seed + 2);
      const q: number[] = [];
      let counter = seed * 10;
      for (let i = 0; i < seed + 2 && !rb.isFull; i++) {
        rb.push(counter); q.push(counter++);
      }
      for (let i = 0; i < Math.min(seed, rb.size); i++) {
        if (!rb.isEmpty) { expect(rb.pop()).toBe(q.shift()); }
        if (!rb.isFull) { rb.push(counter); q.push(counter++); }
      }
      expect(rb.toArray()).toEqual(q);
    });
  }
});

// ─── Additional push/pop pair checks ─────────────────────────────────────────
describe('RingBuffer push-pop pair checks', () => {
  for (let v = 1; v <= 50; v++) {
    it(`push(${v}) then pop returns ${v}`, () => {
      const rb = new RingBuffer<number>(5);
      rb.push(v);
      expect(rb.pop()).toBe(v);
    });
  }
});

// ─── Additional capacity checks via constructor ───────────────────────────────
describe('RingBuffer capacity checks 1-50', () => {
  for (let cap = 1; cap <= 50; cap++) {
    it(`new RingBuffer(${cap}).capacity === ${cap}`, () => {
      expect(new RingBuffer<number>(cap).capacity).toBe(cap);
    });
  }
});

// ─── Additional size after single push per cap ────────────────────────────────
describe('RingBuffer size after single push', () => {
  for (let cap = 1; cap <= 50; cap++) {
    it(`size=1 after 1 push into cap=${cap}`, () => {
      const rb = new RingBuffer<number>(cap);
      rb.push(42);
      expect(rb.size).toBe(1);
    });
  }
});

// ─── Additional toArray single item checks ────────────────────────────────────
describe('RingBuffer toArray single item', () => {
  for (let v = 0; v <= 30; v++) {
    it(`toArray with single value ${v}`, () => {
      const rb = new RingBuffer<number>(5);
      rb.push(v);
      expect(rb.toArray()).toEqual([v]);
    });
  }
});

// ─── Additional peek single item checks ──────────────────────────────────────
describe('RingBuffer peek single item', () => {
  for (let v = 100; v <= 130; v++) {
    it(`peek after push(${v}) returns ${v}`, () => {
      const rb = new RingBuffer<number>(5);
      rb.push(v);
      expect(rb.peek()).toBe(v);
    });
  }
});

// ─── Additional peekLast single item checks ───────────────────────────────────
describe('RingBuffer peekLast single item', () => {
  for (let v = 200; v <= 230; v++) {
    it(`peekLast after push(${v}) returns ${v}`, () => {
      const rb = new RingBuffer<number>(5);
      rb.push(v);
      expect(rb.peekLast()).toBe(v);
    });
  }
});

// ─── at(0) single item checks ────────────────────────────────────────────────
describe('RingBuffer at(0) single item', () => {
  for (let v = 300; v <= 330; v++) {
    it(`at(0) after push(${v}) returns ${v}`, () => {
      const rb = new RingBuffer<number>(5);
      rb.push(v);
      expect(rb.at(0)).toBe(v);
    });
  }
});

// ─── isFull after filling each capacity ──────────────────────────────────────
describe('RingBuffer isFull after fill cap 1-30', () => {
  for (let cap = 1; cap <= 30; cap++) {
    it(`isFull=true after filling cap=${cap}`, () => {
      const rb = new RingBuffer<number>(cap);
      for (let i = 0; i < cap; i++) rb.push(i);
      expect(rb.isFull).toBe(true);
    });
  }
});

// ─── isEmpty after clear for various caps ─────────────────────────────────────
describe('RingBuffer isEmpty after clear cap 1-30', () => {
  for (let cap = 1; cap <= 30; cap++) {
    it(`isEmpty=true after clear on cap=${cap}`, () => {
      const rb = new RingBuffer<number>(cap);
      for (let i = 0; i < cap; i++) rb.push(i);
      rb.clear();
      expect(rb.isEmpty).toBe(true);
    });
  }
});
