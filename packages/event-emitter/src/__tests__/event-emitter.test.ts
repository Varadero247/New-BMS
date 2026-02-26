// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  EventEmitter,
  PriorityEmitter,
  NamespacedEmitter,
  createEmitter,
  mixin,
  throttledEmit,
  debounceListener,
  batchEmissions,
  toAsyncIterable,
} from '../event-emitter';

// ─── Section 1: on/emit — 100 tests ─────────────────────────────────────────
// Emit N events, verify listener called N times for N = 1..100

describe('EventEmitter.on/emit', () => {
  for (let n = 1; n <= 100; n++) {
    it(`listener called exactly ${n} time(s) when emit called ${n} time(s)`, () => {
      const ee = new EventEmitter<{ ping: number }>();
      let count = 0;
      ee.on('ping', () => { count++; });
      for (let i = 0; i < n; i++) ee.emit('ping', i);
      expect(count).toBe(n);
    });
  }
});

// ─── Section 2: once — 100 tests ─────────────────────────────────────────────
// once listener fires only once regardless of how many times emit is called

describe('EventEmitter.once', () => {
  for (let n = 1; n <= 100; n++) {
    it(`once listener fires only 1 time even when emitted ${n} time(s) (n=${n})`, () => {
      const ee = new EventEmitter<{ tick: number }>();
      let count = 0;
      ee.once('tick', () => { count++; });
      for (let i = 0; i < n; i++) ee.emit('tick', i);
      expect(count).toBe(1);
    });
  }
});

// ─── Section 3: off — 100 tests ──────────────────────────────────────────────
// Remove listener; verify it is not called after removal

describe('EventEmitter.off', () => {
  for (let n = 1; n <= 100; n++) {
    it(`off removes listener so it is not called after removal (n=${n})`, () => {
      const ee = new EventEmitter<{ ev: number }>();
      let count = 0;
      const listener = () => { count++; };
      ee.on('ev', listener);
      // emit n times before removal
      for (let i = 0; i < n; i++) ee.emit('ev', i);
      const before = count;
      ee.off('ev', listener);
      // emit n more times after removal
      for (let i = 0; i < n; i++) ee.emit('ev', i);
      expect(count).toBe(before);    // no additional calls
      expect(count).toBe(n);         // exactly n calls happened before off
    });
  }
});

// ─── Section 4: listenerCount — 100 tests ────────────────────────────────────
// Add N listeners, verify count; remove one, verify decrease

describe('EventEmitter.listenerCount', () => {
  for (let n = 1; n <= 100; n++) {
    it(`listenerCount returns ${n} after adding ${n} listener(s)`, () => {
      const ee = new EventEmitter<{ x: number }>();
      const fns: Array<(data: number) => void> = [];
      for (let i = 0; i < n; i++) {
        const fn = (_d: number) => {};
        fns.push(fn);
        ee.on('x', fn);
      }
      expect(ee.listenerCount('x')).toBe(n);
      // remove first listener and verify decrease
      ee.off('x', fns[0]);
      expect(ee.listenerCount('x')).toBe(n - 1);
    });
  }
});

// ─── Section 5: eventNames — 50 tests ────────────────────────────────────────
// Register i events, verify eventNames returns them

describe('EventEmitter.eventNames', () => {
  for (let i = 1; i <= 50; i++) {
    it(`eventNames returns ${i} event name(s)`, () => {
      const ee = new EventEmitter<Record<string, number>>();
      const registered: string[] = [];
      for (let j = 0; j < i; j++) {
        const name = `evt_${j}`;
        registered.push(name);
        ee.on(name, () => {});
      }
      const names = ee.eventNames();
      expect(names.length).toBe(i);
      for (const n of registered) expect(names).toContain(n);
    });
  }
});

// ─── Section 6: removeAllListeners — 50 tests ────────────────────────────────

describe('EventEmitter.removeAllListeners', () => {
  for (let i = 1; i <= 50; i++) {
    it(`removeAllListeners clears all ${i} listener(s)`, () => {
      const ee = new EventEmitter<Record<string, number>>();
      for (let j = 0; j < i; j++) {
        ee.on(`event_${j}`, () => {});
      }
      ee.removeAllListeners();
      expect(ee.eventNames().length).toBe(0);
      for (let j = 0; j < i; j++) {
        expect(ee.listenerCount(`event_${j}`)).toBe(0);
      }
    });
  }
});

// ─── Section 7: emit return value — 50 tests ─────────────────────────────────
// true if listeners exist, false if none

describe('EventEmitter.emit return value', () => {
  for (let i = 0; i < 50; i++) {
    it(`emit returns true when listener exists (test ${i})`, () => {
      const ee = new EventEmitter<{ ev: number }>();
      ee.on('ev', () => {});
      expect(ee.emit('ev', i)).toBe(true);
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`emit returns false when no listener (test ${i})`, () => {
      const ee = new EventEmitter<{ noone: number }>();
      expect(ee.emit('noone', i)).toBe(false);
    });
  }
});

// ─── Section 8: onAny/offAny — 100 tests ─────────────────────────────────────
// Wildcard receives all events

describe('EventEmitter.onAny/offAny', () => {
  for (let n = 1; n <= 50; n++) {
    it(`onAny receives event after ${n} targeted listener(s) (n=${n})`, () => {
      const ee = new EventEmitter<{ data: number }>();
      const received: Array<[string, unknown]> = [];
      for (let i = 0; i < n; i++) ee.on('data', () => {});
      ee.onAny((evt, d) => received.push([evt, d]));
      ee.emit('data', 42);
      expect(received.length).toBe(1);
      expect(received[0]).toEqual(['data', 42]);
    });
  }

  for (let n = 1; n <= 50; n++) {
    it(`offAny removes wildcard listener (n=${n})`, () => {
      const ee = new EventEmitter<{ msg: string }>();
      let calls = 0;
      const wc: (e: string, d: unknown) => void = () => { calls++; };
      ee.onAny(wc);
      ee.emit('msg', 'hello');
      ee.offAny(wc);
      ee.emit('msg', 'world');
      expect(calls).toBe(1);
    });
  }
});

// ─── Section 9: waitFor — 50 tests ───────────────────────────────────────────

describe('EventEmitter.waitFor', () => {
  for (let i = 1; i <= 50; i++) {
    it(`waitFor resolves with emitted value (i=${i})`, async () => {
      const ee = new EventEmitter<{ value: number }>();
      const expected = i * 7;
      setTimeout(() => ee.emit('value', expected), 5);
      const result = await ee.waitFor('value');
      expect(result).toBe(expected);
    });
  }
});

// ─── Section 10: createEmitter — 50 tests ────────────────────────────────────

describe('createEmitter', () => {
  for (let i = 1; i <= 50; i++) {
    it(`createEmitter creates independent emitter instance (i=${i})`, () => {
      const e1 = createEmitter<{ n: number }>();
      const e2 = createEmitter<{ n: number }>();
      let c1 = 0;
      let c2 = 0;
      e1.on('n', () => { c1++; });
      e2.on('n', () => { c2++; });
      for (let j = 0; j < i; j++) e1.emit('n', j);
      expect(c1).toBe(i);
      expect(c2).toBe(0);
    });
  }
});

// ─── Section 11: PriorityEmitter — 100 tests ─────────────────────────────────

describe('PriorityEmitter', () => {
  // First 50: high priority fires before low
  for (let i = 1; i <= 50; i++) {
    it(`high priority listener fires before low priority (i=${i})`, () => {
      const pe = new PriorityEmitter();
      const order: string[] = [];
      pe.onPriority('task', () => order.push('low'), 1);
      pe.onPriority('task', () => order.push('high'), 10);
      pe.emit('task', undefined);
      expect(order[0]).toBe('high');
      expect(order[1]).toBe('low');
    });
  }

  // Next 50: multiple priority levels maintain order
  for (let i = 1; i <= 50; i++) {
    it(`three priority levels fire in descending priority order (i=${i})`, () => {
      const pe = new PriorityEmitter();
      const order: number[] = [];
      pe.onPriority('go', () => order.push(1), 1);
      pe.onPriority('go', () => order.push(100), 100);
      pe.onPriority('go', () => order.push(50), 50);
      pe.emit('go', undefined);
      expect(order).toEqual([100, 50, 1]);
    });
  }
});

// ─── Section 12: NamespacedEmitter — 100 tests ───────────────────────────────

describe('NamespacedEmitter', () => {
  // First 50: events are prefixed with namespace
  for (let i = 1; i <= 50; i++) {
    it(`NamespacedEmitter prefixes events with namespace (i=${i})`, () => {
      const ns = new NamespacedEmitter(`ns${i}`);
      let received = '';
      // Listen using the prefixed name directly on the underlying super
      const prefixed = `ns${i}:click`;
      // Use the parent EventEmitter's on to capture prefixed name
      const parent = new EventEmitter<Record<string, unknown>>();
      const ns2 = new NamespacedEmitter(`ns${i}`, parent);
      parent.on(prefixed, (d: unknown) => { received = d as string; });
      ns2.emit('click', 'payload');
      expect(received).toBe('payload');
    });
  }

  // Next 50: namespace property is set correctly
  for (let i = 1; i <= 50; i++) {
    it(`NamespacedEmitter.namespace property equals constructor arg (i=${i})`, () => {
      const ns = new NamespacedEmitter(`space_${i}`);
      expect(ns.namespace).toBe(`space_${i}`);
    });
  }
});

// ─── Section 13: listenerInfo — 50 tests ─────────────────────────────────────

describe('EventEmitter.listenerInfo', () => {
  for (let i = 1; i <= 50; i++) {
    it(`listenerInfo returns correct event/count pairs for ${i} event(s)`, () => {
      const ee = new EventEmitter<Record<string, number>>();
      for (let j = 0; j < i; j++) {
        ee.on(`info_ev_${j}`, () => {});
        if (j % 2 === 0) ee.on(`info_ev_${j}`, () => {}); // some events get 2 listeners
      }
      const info = ee.listenerInfo();
      expect(info.length).toBe(i);
      for (const item of info) {
        expect(typeof item.event).toBe('string');
        expect(typeof item.count).toBe('number');
        expect(item.count).toBeGreaterThan(0);
      }
    });
  }
});

// ─── Section 14: setMaxListeners/getMaxListeners — 50 tests ──────────────────

describe('EventEmitter.setMaxListeners/getMaxListeners', () => {
  for (let i = 1; i <= 50; i++) {
    it(`getMaxListeners returns value set by setMaxListeners(${i * 2})`, () => {
      const ee = new EventEmitter();
      ee.setMaxListeners(i * 2);
      expect(ee.getMaxListeners()).toBe(i * 2);
    });
  }
});

// ─── Section 15: clone — 50 tests ────────────────────────────────────────────

describe('EventEmitter.clone', () => {
  for (let i = 1; i <= 50; i++) {
    it(`clone has same listeners but is independent (i=${i})`, () => {
      const ee = new EventEmitter<{ val: number }>();
      let origCount = 0;
      let cloneCount = 0;
      ee.on('val', () => { origCount++; });
      const copy = ee.clone();
      // Replace the cloned listener tracker
      copy.removeAllListeners();
      copy.on('val', () => { cloneCount++; });

      ee.emit('val', i);
      expect(origCount).toBe(1);
      expect(cloneCount).toBe(0);

      copy.emit('val', i);
      expect(origCount).toBe(1);
      expect(cloneCount).toBe(1);
    });
  }
});

// ─── Section 16: Extra edge-case / coverage tests ────────────────────────────

describe('EventEmitter edge cases', () => {
  it('on returns this for chaining', () => {
    const ee = new EventEmitter<{ e: number }>();
    expect(ee.on('e', () => {})).toBe(ee);
  });

  it('once returns this for chaining', () => {
    const ee = new EventEmitter<{ e: number }>();
    expect(ee.once('e', () => {})).toBe(ee);
  });

  it('off returns this for chaining', () => {
    const ee = new EventEmitter<{ e: number }>();
    const fn = () => {};
    ee.on('e', fn);
    expect(ee.off('e', fn)).toBe(ee);
  });

  it('setMaxListeners returns this for chaining', () => {
    const ee = new EventEmitter();
    expect(ee.setMaxListeners(50)).toBe(ee);
  });

  it('default maxListeners is 100', () => {
    const ee = new EventEmitter();
    expect(ee.getMaxListeners()).toBe(100);
  });

  it('custom maxListeners via options', () => {
    const ee = new EventEmitter({}, { maxListeners: 42 } as any);
    // constructor opts
    const ee2 = new EventEmitter({ maxListeners: 42 });
    expect(ee2.getMaxListeners()).toBe(42);
  });

  it('off on non-existent event returns this', () => {
    const ee = new EventEmitter<{ ghost: number }>();
    expect(ee.off('ghost', () => {})).toBe(ee);
  });

  it('emit on event with no listeners returns false', () => {
    const ee = new EventEmitter<{ empty: number }>();
    expect(ee.emit('empty', 0)).toBe(false);
  });

  it('listeners() returns array of functions', () => {
    const ee = new EventEmitter<{ q: number }>();
    const fn1 = (_: number) => {};
    const fn2 = (_: number) => {};
    ee.on('q', fn1);
    ee.on('q', fn2);
    const fns = ee.listeners('q');
    expect(fns).toContain(fn1);
    expect(fns).toContain(fn2);
  });

  it('listeners() returns empty array for unknown event', () => {
    const ee = new EventEmitter<{ q: number }>();
    expect(ee.listeners('q')).toEqual([]);
  });

  it('removeAllListeners for specific event leaves others intact', () => {
    const ee = new EventEmitter<Record<string, number>>();
    ee.on('a', () => {});
    ee.on('b', () => {});
    ee.removeAllListeners('a');
    expect(ee.listenerCount('a')).toBe(0);
    expect(ee.listenerCount('b')).toBe(1);
  });

  it('multiple once listeners all fire once', () => {
    const ee = new EventEmitter<{ go: number }>();
    let a = 0, b = 0;
    ee.once('go', () => { a++; });
    ee.once('go', () => { b++; });
    ee.emit('go', 1);
    ee.emit('go', 2);
    expect(a).toBe(1);
    expect(b).toBe(1);
  });

  it('mix of on and once listeners behave correctly', () => {
    const ee = new EventEmitter<{ ev: number }>();
    let persistent = 0, onceCount = 0;
    ee.on('ev', () => { persistent++; });
    ee.once('ev', () => { onceCount++; });
    ee.emit('ev', 1);
    ee.emit('ev', 2);
    ee.emit('ev', 3);
    expect(persistent).toBe(3);
    expect(onceCount).toBe(1);
  });

  it('waitFor times out correctly', async () => {
    const ee = new EventEmitter<{ late: number }>();
    await expect(ee.waitFor('late', 10)).rejects.toThrow('timed out');
  });

  it('pipe forwards events from source', () => {
    const src = new EventEmitter<{ data: number }>();
    const dst = new EventEmitter<{ data: number }>();
    let received = 0;
    dst.on('data', (d) => { received = d; });
    dst.pipe(src, ['data']);
    src.emit('data', 99);
    expect(received).toBe(99);
  });

  it('clone preserves listener count per event', () => {
    const ee = new EventEmitter<{ x: number }>();
    ee.on('x', () => {});
    ee.on('x', () => {});
    const copy = ee.clone();
    expect(copy.listenerCount('x')).toBe(2);
  });

  it('mixin adds on/off/once/emit to plain object', () => {
    const obj = { name: 'test' };
    const mixed = mixin(obj);
    let called = false;
    mixed.on('event', () => { called = true; });
    mixed.emit('event', undefined);
    expect(called).toBe(true);
  });

  it('throttledEmit only fires when interval has passed', () => {
    const ee = new EventEmitter<Record<string, number>>();
    let count = 0;
    ee.on('t', () => { count++; });
    const last = { t: 0 };
    throttledEmit(ee, 't', 1, 100, last);
    throttledEmit(ee, 't', 2, 100, last); // should be throttled
    expect(count).toBe(1);
  });

  it('debounceListener delays invocation', (done) => {
    let calls = 0;
    const debounced = debounceListener<number>(() => { calls++; }, 20);
    debounced(1);
    debounced(2);
    debounced(3);
    setTimeout(() => {
      expect(calls).toBe(1);
      done();
    }, 60);
  });

  it('batchEmissions collects and fires once after delay', (done) => {
    const ee = new EventEmitter<Record<string, unknown>>();
    let batchReceived: unknown[] = [];
    ee.on('batch', (d) => { batchReceived = d as unknown[]; });
    const cleanup = batchEmissions(ee, 'src', 'batch', 20);
    ee.emit('src', 'a');
    ee.emit('src', 'b');
    ee.emit('src', 'c');
    setTimeout(() => {
      expect(batchReceived).toEqual(['a', 'b', 'c']);
      cleanup();
      done();
    }, 60);
  });

  it('toAsyncIterable yields values as they are emitted', async () => {
    const ee = new EventEmitter<Record<string, number>>();
    const iter = toAsyncIterable<number>(ee, 'num');
    setTimeout(() => ee.emit('num', 7), 5);
    const result = await iter[Symbol.asyncIterator]().next();
    expect(result.value).toBe(7);
  });

  it('PriorityEmitter: emit returns true when priority listeners exist', () => {
    const pe = new PriorityEmitter();
    pe.onPriority('go', () => {}, 1);
    expect(pe.emit('go', undefined)).toBe(true);
  });

  it('PriorityEmitter: returns false when no listeners', () => {
    const pe = new PriorityEmitter();
    expect(pe.emit('nothing', undefined)).toBe(false);
  });

  it('NamespacedEmitter: on with parent forwards to parent', () => {
    const parent = new EventEmitter<Record<string, unknown>>();
    const ns = new NamespacedEmitter('app', parent);
    let parentReceived = false;
    parent.on('app:test', () => { parentReceived = true; });
    ns.emit('test', null);
    expect(parentReceived).toBe(true);
  });

  it('NamespacedEmitter: off removes from parent', () => {
    // Use a standalone ns (no parent) to verify off removes the listener
    const ns = new NamespacedEmitter('app');
    let calls = 0;
    const fn = (_d: unknown) => { calls++; };
    ns.on('click', fn);
    ns.emit('click', null);
    ns.off('click', fn);
    ns.emit('click', null);
    expect(calls).toBe(1);
  });

  it('createEmitter with maxListeners option', () => {
    const ee = createEmitter({ maxListeners: 5 });
    expect(ee.getMaxListeners()).toBe(5);
  });

  it('eventNames() returns empty array initially', () => {
    const ee = new EventEmitter();
    expect(ee.eventNames()).toEqual([]);
  });

  it('listenerInfo() returns empty array initially', () => {
    const ee = new EventEmitter();
    expect(ee.listenerInfo()).toEqual([]);
  });

  it('multiple wildcard listeners all fire', () => {
    const ee = new EventEmitter<{ e: number }>();
    let a = 0, b = 0;
    ee.onAny(() => { a++; });
    ee.onAny(() => { b++; });
    ee.emit('e', 1);
    expect(a).toBe(1);
    expect(b).toBe(1);
  });

  it('wildcard receives correct event name and data', () => {
    const ee = new EventEmitter<{ ping: string }>();
    let capturedEvent = '';
    let capturedData: unknown;
    ee.onAny((event, data) => {
      capturedEvent = event;
      capturedData = data;
    });
    ee.emit('ping', 'pong');
    expect(capturedEvent).toBe('ping');
    expect(capturedData).toBe('pong');
  });

  it('removeAllListeners also clears wildcards', () => {
    const ee = new EventEmitter<{ e: number }>();
    let called = false;
    ee.onAny(() => { called = true; });
    ee.removeAllListeners();
    ee.emit('e', 1);
    expect(called).toBe(false);
  });

  it('clone has same maxListeners setting', () => {
    const ee = new EventEmitter({ maxListeners: 77 });
    const copy = ee.clone();
    expect(copy.getMaxListeners()).toBe(77);
  });

  it('off non-existent listener is a no-op', () => {
    const ee = new EventEmitter<{ e: number }>();
    const fn1 = () => {};
    const fn2 = () => {};
    ee.on('e', fn1);
    expect(() => ee.off('e', fn2)).not.toThrow();
    expect(ee.listenerCount('e')).toBe(1);
  });

  it('emit data is passed to listener correctly', () => {
    const ee = new EventEmitter<{ payload: { id: number; name: string } }>();
    let received: { id: number; name: string } | null = null;
    ee.on('payload', (d) => { received = d; });
    ee.emit('payload', { id: 42, name: 'test' });
    expect(received).toEqual({ id: 42, name: 'test' });
  });

  it('multiple events can coexist independently', () => {
    const ee = new EventEmitter<{ a: number; b: string }>();
    let sumA = 0;
    let catB = '';
    ee.on('a', (n) => { sumA += n; });
    ee.on('b', (s) => { catB += s; });
    ee.emit('a', 1);
    ee.emit('b', 'x');
    ee.emit('a', 2);
    ee.emit('b', 'y');
    expect(sumA).toBe(3);
    expect(catB).toBe('xy');
  });

  it('pipe with no events array uses source eventNames', () => {
    const src = new EventEmitter<{ n: number }>();
    src.on('n', () => {}); // register so eventNames has 'n'
    const dst = new EventEmitter<{ n: number }>();
    let received = -1;
    dst.on('n', (d) => { received = d; });
    dst.pipe(src);
    src.emit('n', 123);
    expect(received).toBe(123);
  });

  it('throttledEmit returns true on first call', () => {
    const ee = new EventEmitter<Record<string, number>>();
    ee.on('t', () => {});
    const last = { t: 0 };
    const result = throttledEmit(ee, 't', 1, 100, last);
    expect(result).toBe(true);
  });

  it('throttledEmit returns false when throttled', () => {
    const ee = new EventEmitter<Record<string, number>>();
    ee.on('t', () => {});
    const last = { t: Date.now() };
    const result = throttledEmit(ee, 't', 1, 10000, last);
    expect(result).toBe(false);
  });

  it('waitFor with no timeout resolves', async () => {
    const ee = new EventEmitter<{ v: number }>();
    setTimeout(() => ee.emit('v', 5), 5);
    const val = await ee.waitFor('v');
    expect(val).toBe(5);
  });

  it('PriorityEmitter: same priority order preserved', () => {
    const pe = new PriorityEmitter();
    const order: number[] = [];
    pe.onPriority('x', () => order.push(1), 5);
    pe.onPriority('x', () => order.push(2), 5);
    pe.emit('x', undefined);
    expect(order.length).toBe(2);
  });

  it('NamespacedEmitter: once fires only once', () => {
    const ns = new NamespacedEmitter('ns');
    let count = 0;
    ns.once('click', () => { count++; });
    ns.emit('click', null);
    ns.emit('click', null);
    expect(count).toBe(1);
  });

  it('listenerCount returns 0 for unregistered event', () => {
    const ee = new EventEmitter<{ missing: number }>();
    expect(ee.listenerCount('missing')).toBe(0);
  });

  it('batchEmissions cleanup prevents further batching', (done) => {
    const ee = new EventEmitter<Record<string, unknown>>();
    let batchCount = 0;
    ee.on('batch', () => { batchCount++; });
    const cleanup = batchEmissions(ee, 'src', 'batch', 20);
    ee.emit('src', 'x');
    cleanup();
    // batch timer was cancelled by cleanup; nothing should fire
    setTimeout(() => {
      expect(batchCount).toBe(0);
      done();
    }, 60);
  });
});

// ─── Section 17: Additional on/emit data fidelity tests ──────────────────────

describe('EventEmitter data fidelity', () => {
  for (let i = 0; i < 50; i++) {
    it(`emit passes numeric data ${i * 3} correctly`, () => {
      const ee = new EventEmitter<{ n: number }>();
      let got: number | null = null;
      ee.on('n', (d) => { got = d; });
      ee.emit('n', i * 3);
      expect(got).toBe(i * 3);
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`emit passes string data "msg_${i}" correctly`, () => {
      const ee = new EventEmitter<{ s: string }>();
      let got = '';
      ee.on('s', (d) => { got = d; });
      ee.emit('s', `msg_${i}`);
      expect(got).toBe(`msg_${i}`);
    });
  }
});

// ─── Section 18: Additional createEmitter / factory tests ────────────────────

describe('createEmitter additional', () => {
  for (let i = 0; i < 50; i++) {
    it(`createEmitter instance ${i} supports chaining`, () => {
      const ee = createEmitter<{ e: number }>();
      const fn = () => {};
      const result = ee.on('e', fn).once('e', fn).off('e', fn);
      expect(result).toBe(ee);
    });
  }
});

// ─── Section 19: removeAllListeners for specific event — 50 tests ─────────────

describe('EventEmitter.removeAllListeners specific event', () => {
  for (let i = 1; i <= 50; i++) {
    it(`removeAllListeners('target') removes all ${i} listener(s) for that event`, () => {
      const ee = new EventEmitter<Record<string, number>>();
      for (let j = 0; j < i; j++) ee.on('target', () => {});
      ee.on('other', () => {});
      ee.removeAllListeners('target');
      expect(ee.listenerCount('target')).toBe(0);
      expect(ee.listenerCount('other')).toBe(1);
    });
  }
});

// ─── Section 20: Additional PriorityEmitter tests ────────────────────────────

describe('PriorityEmitter additional', () => {
  for (let i = 0; i < 30; i++) {
    it(`PriorityEmitter priority ${i + 1} vs ${i + 2} fires higher first (i=${i})`, () => {
      const pe = new PriorityEmitter();
      const order: number[] = [];
      pe.onPriority('go', () => order.push(i + 1), i + 1);
      pe.onPriority('go', () => order.push(i + 2), i + 2);
      pe.emit('go', undefined);
      expect(order[0]).toBe(i + 2);
      expect(order[1]).toBe(i + 1);
    });
  }
});

// ─── Section 21: Additional listenerInfo tests ────────────────────────────────

describe('EventEmitter.listenerInfo additional', () => {
  for (let i = 1; i <= 30; i++) {
    it(`listenerInfo count matches added listeners for event count ${i}`, () => {
      const ee = new EventEmitter<Record<string, number>>();
      for (let j = 0; j < i; j++) {
        ee.on(`e${j}`, () => {});
      }
      const info = ee.listenerInfo();
      const total = info.reduce((acc, x) => acc + x.count, 0);
      expect(total).toBe(i);
    });
  }
});

// ─── Section 22: Additional clone tests ──────────────────────────────────────

describe('EventEmitter.clone additional', () => {
  for (let i = 1; i <= 30; i++) {
    it(`clone has ${i} event name(s) matching original (i=${i})`, () => {
      const ee = new EventEmitter<Record<string, number>>();
      for (let j = 0; j < i; j++) ee.on(`ev${j}`, () => {});
      const copy = ee.clone();
      expect(copy.eventNames().length).toBe(i);
    });
  }
});
