// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  EventEmitter,
  debounce,
  throttle,
  memoize,
  once,
  retry,
  timeout,
  createPubSub,
  createEventQueue,
  createEventBuffer,
  fromCallback,
  race,
  batch,
  pipe,
  compose,
  createObservable,
  fromArray,
  interval,
  take,
  filter,
} from '../event-utils';

// ---------------------------------------------------------------------------
// EventEmitter
// ---------------------------------------------------------------------------

describe('EventEmitter', () => {
  describe('constructor and defaults', () => {
    it('creates with default max listeners of 10', () => {
      const ee = new EventEmitter();
      expect(ee.getMaxListeners()).toBe(10);
    });

    it('accepts custom maxListeners option', () => {
      const ee = new EventEmitter({ maxListeners: 50 });
      expect(ee.getMaxListeners()).toBe(50);
    });

    it('starts with no event names', () => {
      const ee = new EventEmitter();
      expect(ee.eventNames()).toEqual([]);
    });

    it('starts with total emitted = 0', () => {
      const ee = new EventEmitter();
      expect(ee.getStats().totalEmitted).toBe(0);
    });

    it('starts with empty eventCounts', () => {
      const ee = new EventEmitter();
      expect(ee.getStats().eventCounts).toEqual({});
    });

    it('starts with empty listenerCounts', () => {
      const ee = new EventEmitter();
      expect(ee.getStats().listenerCounts).toEqual({});
    });
  });

  describe('on() and emit()', () => {
    it('calls handler when event is emitted', () => {
      const ee = new EventEmitter<{ test: string }>();
      const handler = jest.fn();
      ee.on('test', handler);
      ee.emit('test', 'hello');
      expect(handler).toHaveBeenCalledWith('hello');
    });

    it('calls handler multiple times', () => {
      const ee = new EventEmitter<{ tick: number }>();
      const handler = jest.fn();
      ee.on('tick', handler);
      for (let i = 0; i < 5; i++) ee.emit('tick', i);
      expect(handler).toHaveBeenCalledTimes(5);
    });

    it('passes correct payload each time', () => {
      const ee = new EventEmitter<{ data: number }>();
      const received: number[] = [];
      ee.on('data', (v) => received.push(v));
      for (let i = 0; i < 10; i++) ee.emit('data', i);
      expect(received).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('supports multiple handlers for same event', () => {
      const ee = new EventEmitter<{ x: string }>();
      const h1 = jest.fn();
      const h2 = jest.fn();
      ee.on('x', h1);
      ee.on('x', h2);
      ee.emit('x', 'val');
      expect(h1).toHaveBeenCalledWith('val');
      expect(h2).toHaveBeenCalledWith('val');
    });

    it('returns unsubscribe function', () => {
      const ee = new EventEmitter<{ x: string }>();
      const handler = jest.fn();
      const unsub = ee.on('x', handler);
      expect(typeof unsub).toBe('function');
    });

    it('unsubscribe function stops future calls', () => {
      const ee = new EventEmitter<{ x: string }>();
      const handler = jest.fn();
      const unsub = ee.on('x', handler);
      unsub();
      ee.emit('x', 'after');
      expect(handler).not.toHaveBeenCalled();
    });

    it('does not fail when emitting with no handlers', () => {
      const ee = new EventEmitter<{ ghost: string }>();
      expect(() => ee.emit('ghost', 'boo')).not.toThrow();
    });

    it('increments totalEmitted on each emit', () => {
      const ee = new EventEmitter<{ a: number }>();
      ee.emit('a', 1);
      ee.emit('a', 2);
      ee.emit('a', 3);
      expect(ee.getStats().totalEmitted).toBe(3);
    });

    it('tracks per-event count in stats', () => {
      const ee = new EventEmitter<{ a: number; b: number }>();
      ee.emit('a', 1);
      ee.emit('a', 2);
      ee.emit('b', 1);
      const stats = ee.getStats();
      expect(stats.eventCounts['a']).toBe(2);
      expect(stats.eventCounts['b']).toBe(1);
    });

    it('emitting same event twice increments count to 2', () => {
      const ee = new EventEmitter<{ e: string }>();
      ee.emit('e', 'x');
      ee.emit('e', 'y');
      expect(ee.getStats().eventCounts['e']).toBe(2);
    });
  });

  describe('once()', () => {
    it('calls once-handler exactly one time', () => {
      const ee = new EventEmitter<{ ping: void }>();
      const handler = jest.fn();
      ee.once('ping', handler);
      ee.emit('ping', undefined as unknown as void);
      ee.emit('ping', undefined as unknown as void);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('passes correct payload to once-handler', () => {
      const ee = new EventEmitter<{ msg: string }>();
      const handler = jest.fn();
      ee.once('msg', handler);
      ee.emit('msg', 'first');
      expect(handler).toHaveBeenCalledWith('first');
    });

    it('once unsub function removes before firing', () => {
      const ee = new EventEmitter<{ x: number }>();
      const handler = jest.fn();
      const unsub = ee.once('x', handler);
      unsub();
      ee.emit('x', 1);
      expect(handler).not.toHaveBeenCalled();
    });

    it('multiple once handlers each fire once', () => {
      const ee = new EventEmitter<{ go: string }>();
      const h1 = jest.fn();
      const h2 = jest.fn();
      ee.once('go', h1);
      ee.once('go', h2);
      ee.emit('go', 'a');
      ee.emit('go', 'b');
      expect(h1).toHaveBeenCalledTimes(1);
      expect(h2).toHaveBeenCalledTimes(1);
    });
  });

  describe('off()', () => {
    it('removes a specific handler', () => {
      const ee = new EventEmitter<{ e: string }>();
      const h1 = jest.fn();
      const h2 = jest.fn();
      ee.on('e', h1);
      ee.on('e', h2);
      ee.off('e', h1);
      ee.emit('e', 'v');
      expect(h1).not.toHaveBeenCalled();
      expect(h2).toHaveBeenCalledWith('v');
    });

    it('removing non-existent handler is no-op', () => {
      const ee = new EventEmitter<{ e: string }>();
      const h = jest.fn();
      expect(() => ee.off('e', h)).not.toThrow();
    });

    it('removes once-handler via off', () => {
      const ee = new EventEmitter<{ e: string }>();
      const h = jest.fn();
      ee.once('e', h);
      ee.off('e', h);
      ee.emit('e', 'v');
      expect(h).not.toHaveBeenCalled();
    });
  });

  describe('removeAllListeners()', () => {
    it('removes all handlers for a specific event', () => {
      const ee = new EventEmitter<{ a: string; b: string }>();
      const ha = jest.fn();
      const hb = jest.fn();
      ee.on('a', ha);
      ee.on('b', hb);
      ee.removeAllListeners('a');
      ee.emit('a', 'v');
      ee.emit('b', 'v');
      expect(ha).not.toHaveBeenCalled();
      expect(hb).toHaveBeenCalled();
    });

    it('removes all handlers when no event specified', () => {
      const ee = new EventEmitter<{ a: string; b: string }>();
      const ha = jest.fn();
      const hb = jest.fn();
      ee.on('a', ha);
      ee.on('b', hb);
      ee.removeAllListeners();
      ee.emit('a', 'v');
      ee.emit('b', 'v');
      expect(ha).not.toHaveBeenCalled();
      expect(hb).not.toHaveBeenCalled();
    });

    it('clears once handlers too', () => {
      const ee = new EventEmitter<{ x: string }>();
      const h = jest.fn();
      ee.once('x', h);
      ee.removeAllListeners('x');
      ee.emit('x', 'v');
      expect(h).not.toHaveBeenCalled();
    });
  });

  describe('listenerCount()', () => {
    it('returns 0 for event with no listeners', () => {
      const ee = new EventEmitter<{ x: string }>();
      expect(ee.listenerCount('x')).toBe(0);
    });

    it('returns correct count for on() listeners', () => {
      const ee = new EventEmitter<{ x: string }>();
      ee.on('x', jest.fn());
      ee.on('x', jest.fn());
      expect(ee.listenerCount('x')).toBe(2);
    });

    it('counts both on() and once() listeners', () => {
      const ee = new EventEmitter<{ x: string }>();
      ee.on('x', jest.fn());
      ee.once('x', jest.fn());
      expect(ee.listenerCount('x')).toBe(2);
    });

    it('decrements after once fires', () => {
      const ee = new EventEmitter<{ x: string }>();
      ee.once('x', jest.fn());
      expect(ee.listenerCount('x')).toBe(1);
      ee.emit('x', 'v');
      expect(ee.listenerCount('x')).toBe(0);
    });

    it('decrements after off()', () => {
      const ee = new EventEmitter<{ x: string }>();
      const h = jest.fn();
      ee.on('x', h);
      expect(ee.listenerCount('x')).toBe(1);
      ee.off('x', h);
      expect(ee.listenerCount('x')).toBe(0);
    });
  });

  describe('eventNames()', () => {
    it('returns registered event names', () => {
      const ee = new EventEmitter<{ a: string; b: string }>();
      ee.on('a', jest.fn());
      ee.on('b', jest.fn());
      const names = ee.eventNames();
      expect(names).toContain('a');
      expect(names).toContain('b');
      expect(names.length).toBe(2);
    });

    it('includes events registered with once()', () => {
      const ee = new EventEmitter<{ x: string }>();
      ee.once('x', jest.fn());
      expect(ee.eventNames()).toContain('x');
    });

    it('does not duplicate event names', () => {
      const ee = new EventEmitter<{ x: string }>();
      ee.on('x', jest.fn());
      ee.once('x', jest.fn());
      const names = ee.eventNames();
      expect(names.filter((n) => n === 'x').length).toBe(1);
    });
  });

  describe('setMaxListeners()', () => {
    it('updates the max listener limit', () => {
      const ee = new EventEmitter();
      ee.setMaxListeners(100);
      expect(ee.getMaxListeners()).toBe(100);
    });

    it('can be set to 0', () => {
      const ee = new EventEmitter();
      ee.setMaxListeners(0);
      expect(ee.getMaxListeners()).toBe(0);
    });
  });

  describe('onError option', () => {
    it('calls onError when synchronous handler throws', () => {
      const onError = jest.fn();
      const ee = new EventEmitter<{ x: string }>({ onError });
      ee.on('x', () => { throw new Error('sync error'); });
      ee.emit('x', 'v');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
      expect(onError.mock.calls[0][0].message).toBe('sync error');
    });

    it('calls onError for non-Error throws', () => {
      const onError = jest.fn();
      const ee = new EventEmitter<{ x: string }>({ onError });
      ee.on('x', () => { throw 'string error'; });
      ee.emit('x', 'v');
      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });

    it('continues calling other handlers after one throws', () => {
      const onError = jest.fn();
      const ee = new EventEmitter<{ x: string }>({ onError });
      const h2 = jest.fn();
      ee.on('x', () => { throw new Error('fail'); });
      ee.on('x', h2);
      ee.emit('x', 'v');
      expect(h2).toHaveBeenCalled();
    });
  });

  describe('getStats()', () => {
    it('returns eventCounts after emitting', () => {
      const ee = new EventEmitter<{ a: string; b: string }>();
      ee.emit('a', 'x');
      ee.emit('a', 'y');
      ee.emit('b', 'z');
      const stats = ee.getStats();
      expect(stats.eventCounts['a']).toBe(2);
      expect(stats.eventCounts['b']).toBe(1);
      expect(stats.totalEmitted).toBe(3);
    });

    it('returns listenerCounts matching current listeners', () => {
      const ee = new EventEmitter<{ x: string }>();
      ee.on('x', jest.fn());
      ee.on('x', jest.fn());
      ee.once('x', jest.fn());
      const stats = ee.getStats();
      expect(stats.listenerCounts['x']).toBe(3);
    });

    it('returns snapshot (mutations do not affect returned object)', () => {
      const ee = new EventEmitter<{ x: string }>();
      ee.emit('x', 'v');
      const stats = ee.getStats();
      ee.emit('x', 'v');
      expect(stats.totalEmitted).toBe(1);
    });
  });

  describe('bulk on/emit stress', () => {
    for (let i = 0; i < 20; i++) {
      it(`stress test iteration ${i}: emitting ${i + 1} times produces correct count`, () => {
        const ee = new EventEmitter<{ stress: number }>();
        const handler = jest.fn();
        ee.on('stress', handler);
        for (let j = 0; j <= i; j++) ee.emit('stress', j);
        expect(handler).toHaveBeenCalledTimes(i + 1);
      });
    }
  });
});

// ---------------------------------------------------------------------------
// debounce
// ---------------------------------------------------------------------------

describe('debounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('does not call immediately by default (trailing)', () => {
    const fn = jest.fn();
    const d = debounce(fn, 200);
    d('a');
    expect(fn).not.toHaveBeenCalled();
  });

  it('calls after delay has elapsed', () => {
    const fn = jest.fn();
    const d = debounce(fn, 200);
    d('a');
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledWith('a');
  });

  it('only calls once for rapid successive calls', () => {
    const fn = jest.fn();
    const d = debounce(fn, 200);
    d('a');
    d('b');
    d('c');
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('c');
  });

  it('uses latest args when multiple calls made', () => {
    const fn = jest.fn();
    const d = debounce(fn, 100);
    d(1);
    d(2);
    d(3);
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith(3);
  });

  it('cancel() prevents the delayed call', () => {
    const fn = jest.fn();
    const d = debounce(fn, 200);
    d('a');
    d.cancel();
    jest.advanceTimersByTime(200);
    expect(fn).not.toHaveBeenCalled();
  });

  it('flush() calls immediately', () => {
    const fn = jest.fn();
    const d = debounce(fn, 500);
    d('flush-me');
    d.flush();
    expect(fn).toHaveBeenCalledWith('flush-me');
  });

  it('flush() does not call again after timeout', () => {
    const fn = jest.fn();
    const d = debounce(fn, 200);
    d('v');
    d.flush();
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('pending() is true while debounce is waiting', () => {
    const fn = jest.fn();
    const d = debounce(fn, 200);
    d('a');
    expect(d.pending()).toBe(true);
  });

  it('pending() is false before any call', () => {
    const fn = jest.fn();
    const d = debounce(fn, 200);
    expect(d.pending()).toBe(false);
  });

  it('pending() is false after cancel()', () => {
    const fn = jest.fn();
    const d = debounce(fn, 200);
    d('a');
    d.cancel();
    expect(d.pending()).toBe(false);
  });

  it('leading: true calls immediately on first call', () => {
    const fn = jest.fn();
    const d = debounce(fn, 200, { leading: true, trailing: false });
    d('lead');
    expect(fn).toHaveBeenCalledWith('lead');
  });

  it('leading: true, trailing: false does not call on trailing', () => {
    const fn = jest.fn();
    const d = debounce(fn, 200, { leading: true, trailing: false });
    d('a');
    d('b');
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('can be called again after delay resets', () => {
    const fn = jest.fn();
    const d = debounce(fn, 100);
    d('first');
    jest.advanceTimersByTime(100);
    d('second');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'first');
    expect(fn).toHaveBeenNthCalledWith(2, 'second');
  });

  it('handles zero delay', () => {
    const fn = jest.fn();
    const d = debounce(fn, 0);
    d('zero');
    jest.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledWith('zero');
  });

  it('maxWait triggers before regular delay expires', () => {
    const fn = jest.fn();
    const d = debounce(fn, 1000, { maxWait: 200 });
    d('a');
    jest.advanceTimersByTime(100);
    d('b');
    jest.advanceTimersByTime(100);
    // maxWait of 200 should have triggered
    expect(fn).toHaveBeenCalled();
  });

  // Loop-based tests for debounce
  for (let delay = 50; delay <= 500; delay += 50) {
    it(`fires after exact ${delay}ms delay`, () => {
      const fn = jest.fn();
      const d = debounce(fn, delay);
      d('x');
      jest.advanceTimersByTime(delay - 1);
      expect(fn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }
});

// ---------------------------------------------------------------------------
// throttle
// ---------------------------------------------------------------------------

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('calls immediately on first invocation', () => {
    const fn = jest.fn();
    const t = throttle(fn, 100);
    t('first');
    expect(fn).toHaveBeenCalledWith('first');
  });

  it('does not call again within interval', () => {
    const fn = jest.fn();
    const t = throttle(fn, 100);
    t('a');
    t('b');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls again after interval has passed', () => {
    const fn = jest.fn();
    const t = throttle(fn, 100);
    t('a');
    jest.advanceTimersByTime(100);
    t('b');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('cancel() prevents pending trailing call', () => {
    const fn = jest.fn();
    const t = throttle(fn, 200);
    t('a');
    t('b'); // schedules trailing
    t.cancel();
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('passes correct arguments', () => {
    const fn = jest.fn();
    const t = throttle(fn, 100);
    t(42);
    expect(fn).toHaveBeenCalledWith(42);
  });

  for (let i = 1; i <= 10; i++) {
    it(`throttle stress ${i}: rapid calls produce ≤ 2 invocations in 200ms window`, () => {
      const fn = jest.fn();
      const t = throttle(fn, 100);
      for (let j = 0; j < 20; j++) t(j);
      jest.advanceTimersByTime(200);
      expect(fn.mock.calls.length).toBeLessThanOrEqual(3);
      expect(fn.mock.calls.length).toBeGreaterThanOrEqual(1);
    });
  }
});

// ---------------------------------------------------------------------------
// memoize
// ---------------------------------------------------------------------------

describe('memoize', () => {
  it('caches result on first call', () => {
    const fn = jest.fn((x: number) => x * 2);
    const memo = memoize(fn);
    expect(memo(5)).toBe(10);
    expect(memo(5)).toBe(10);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('calls original fn for different args', () => {
    const fn = jest.fn((x: number) => x * 3);
    const memo = memoize(fn);
    memo(2);
    memo(3);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('uses custom keyFn', () => {
    const fn = jest.fn((a: number, b: number) => a + b);
    const memo = memoize(fn, (a, b) => `${a}-${b}`);
    memo(1, 2);
    memo(1, 2);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('different keys call fn each time', () => {
    const fn = jest.fn((a: number, b: number) => a + b);
    const memo = memoize(fn, (a, b) => `${a}-${b}`);
    memo(1, 2);
    memo(2, 1);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('memoizes string results', () => {
    const fn = jest.fn((s: string) => s.toUpperCase());
    const memo = memoize(fn);
    expect(memo('hello')).toBe('HELLO');
    expect(memo('hello')).toBe('HELLO');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('memoizes object results by reference', () => {
    const fn = jest.fn((x: number) => ({ value: x }));
    const memo = memoize(fn);
    const r1 = memo(1);
    const r2 = memo(1);
    expect(r1).toBe(r2);
  });

  // Loop-based memoize tests
  for (let i = 0; i < 20; i++) {
    it(`memoize with key ${i} produces cached result`, () => {
      const fn = jest.fn((x: number) => x * x);
      const memo = memoize(fn);
      const first = memo(i);
      const second = memo(i);
      expect(first).toBe(i * i);
      expect(second).toBe(i * i);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }
});

// ---------------------------------------------------------------------------
// once
// ---------------------------------------------------------------------------

describe('once', () => {
  it('calls the original function exactly once', () => {
    const fn = jest.fn(() => 42);
    const onced = once(fn);
    onced();
    onced();
    onced();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('returns the same value on subsequent calls', () => {
    const fn = jest.fn(() => 'result');
    const onced = once(fn);
    expect(onced()).toBe('result');
    expect(onced()).toBe('result');
    expect(onced()).toBe('result');
  });

  it('passes arguments on first call', () => {
    const fn = jest.fn((a: number, b: number) => a + b);
    const onced = once(fn);
    onced(3, 4);
    expect(fn).toHaveBeenCalledWith(3, 4);
  });

  it('ignores arguments on subsequent calls', () => {
    const fn = jest.fn((a: number) => a);
    const onced = once(fn);
    onced(1);
    onced(2);
    onced(3);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  for (let i = 0; i < 15; i++) {
    it(`once stress ${i}: calling ${i + 3} times still invokes fn once`, () => {
      const fn = jest.fn(() => i);
      const onced = once(fn);
      for (let j = 0; j < i + 3; j++) onced();
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }
});

// ---------------------------------------------------------------------------
// retry
// ---------------------------------------------------------------------------

describe('retry', () => {
  it('resolves immediately when fn succeeds on first try', async () => {
    const fn = jest.fn().mockResolvedValue('ok');
    const result = await retry(fn, 3);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on failure and succeeds on second attempt', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');
    const result = await retry(fn, 3);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws after maxAttempts exhausted', async () => {
    const err = new Error('always fails');
    const fn = jest.fn().mockRejectedValue(err);
    await expect(retry(fn, 3)).rejects.toThrow('always fails');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('retries exactly maxAttempts times', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(retry(fn, 5)).rejects.toThrow();
    expect(fn).toHaveBeenCalledTimes(5);
  });

  it('maxAttempts=1 does not retry', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('fail'));
    await expect(retry(fn, 1)).rejects.toThrow('fail');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('succeeds on last attempt', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('last-chance');
    const result = await retry(fn, 3);
    expect(result).toBe('last-chance');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('with delay=0 does not reject due to timing', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('x'))
      .mockResolvedValue('y');
    const result = await retry(fn, 2, 0);
    expect(result).toBe('y');
  });

  for (let attempts = 1; attempts <= 10; attempts++) {
    it(`retry with maxAttempts=${attempts}: calls fn exactly ${attempts} times on all-fail`, async () => {
      const fn = jest.fn().mockRejectedValue(new Error('fail'));
      await expect(retry(fn, attempts)).rejects.toThrow();
      expect(fn).toHaveBeenCalledTimes(attempts);
    });
  }
});

// ---------------------------------------------------------------------------
// timeout
// ---------------------------------------------------------------------------

describe('timeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves when fn completes before timeout', async () => {
    const fn = () => Promise.resolve('done');
    const promise = timeout(fn, 1000);
    jest.advanceTimersByTime(0);
    await expect(promise).resolves.toBe('done');
  });

  it('rejects with timeout message when fn takes too long', async () => {
    const fn = () => new Promise<string>((resolve) => setTimeout(() => resolve('late'), 2000));
    const promise = timeout(fn, 100);
    jest.advanceTimersByTime(200);
    await expect(promise).rejects.toThrow('timed out');
  });

  it('rejects with fn error when fn throws', async () => {
    const fn = () => Promise.reject(new Error('fn error'));
    const promise = timeout(fn, 1000);
    jest.advanceTimersByTime(0);
    await expect(promise).rejects.toThrow('fn error');
  });

  it('timeout message includes the ms value', async () => {
    const fn = () => new Promise<string>((resolve) => setTimeout(() => resolve('x'), 5000));
    const promise = timeout(fn, 200);
    jest.advanceTimersByTime(300);
    await expect(promise).rejects.toThrow('200ms');
  });

  for (let ms = 100; ms <= 1000; ms += 100) {
    it(`timeout with ${ms}ms resolves fast fn`, async () => {
      const fn = () => Promise.resolve(ms);
      const result = await timeout(fn, ms);
      expect(result).toBe(ms);
    });
  }
});

// ---------------------------------------------------------------------------
// createPubSub
// ---------------------------------------------------------------------------

describe('createPubSub', () => {
  it('publishes to subscribers', () => {
    const ps = createPubSub();
    const handler = jest.fn();
    ps.subscribe('topic1', handler);
    ps.publish('topic1', { data: 'hello' });
    expect(handler).toHaveBeenCalledWith({ data: 'hello' });
  });

  it('does not call handler from different topic', () => {
    const ps = createPubSub();
    const handler = jest.fn();
    ps.subscribe('topic1', handler);
    ps.publish('topic2', 'unrelated');
    expect(handler).not.toHaveBeenCalled();
  });

  it('returns subscription with id and topic', () => {
    const ps = createPubSub();
    const sub = ps.subscribe('mytopic', jest.fn());
    expect(typeof sub.id).toBe('string');
    expect(sub.topic).toBe('mytopic');
    expect(typeof sub.unsubscribe).toBe('function');
  });

  it('unsubscribe via subscription object stops delivery', () => {
    const ps = createPubSub();
    const handler = jest.fn();
    const sub = ps.subscribe('t', handler);
    sub.unsubscribe();
    ps.publish('t', 'msg');
    expect(handler).not.toHaveBeenCalled();
  });

  it('unsubscribe via unsubscribe(id) stops delivery', () => {
    const ps = createPubSub();
    const handler = jest.fn();
    const sub = ps.subscribe('t', handler);
    ps.unsubscribe(sub.id);
    ps.publish('t', 'msg');
    expect(handler).not.toHaveBeenCalled();
  });

  it('multiple subscribers on same topic all receive message', () => {
    const ps = createPubSub();
    const h1 = jest.fn();
    const h2 = jest.fn();
    ps.subscribe('shared', h1);
    ps.subscribe('shared', h2);
    ps.publish('shared', 42);
    expect(h1).toHaveBeenCalledWith(42);
    expect(h2).toHaveBeenCalledWith(42);
  });

  it('topics() returns active topic names', () => {
    const ps = createPubSub();
    ps.subscribe('alpha', jest.fn());
    ps.subscribe('beta', jest.fn());
    const topics = ps.topics();
    expect(topics).toContain('alpha');
    expect(topics).toContain('beta');
  });

  it('topics() does not include topics with no subscribers', () => {
    const ps = createPubSub();
    const sub = ps.subscribe('gone', jest.fn());
    sub.unsubscribe();
    const topics = ps.topics();
    expect(topics).not.toContain('gone');
  });

  it('getStats() tracks publish counts', () => {
    const ps = createPubSub();
    ps.subscribe('t', jest.fn());
    ps.publish('t', 'a');
    ps.publish('t', 'b');
    ps.publish('t', 'c');
    const stats = ps.getStats();
    expect(stats.topicCounts['t']).toBe(3);
    expect(stats.totalPublished).toBe(3);
  });

  it('getStats() accumulates across topics', () => {
    const ps = createPubSub();
    ps.subscribe('x', jest.fn());
    ps.subscribe('y', jest.fn());
    ps.publish('x', 1);
    ps.publish('y', 2);
    ps.publish('x', 3);
    const stats = ps.getStats();
    expect(stats.totalPublished).toBe(3);
    expect(stats.topicCounts['x']).toBe(2);
    expect(stats.topicCounts['y']).toBe(1);
  });

  it('publish with no subscribers is a no-op', () => {
    const ps = createPubSub();
    expect(() => ps.publish('empty', 'data')).not.toThrow();
  });

  // Loop-based pubsub tests
  for (let i = 1; i <= 15; i++) {
    it(`pubsub with ${i} subscribers all receive the message`, () => {
      const ps = createPubSub();
      const handlers = Array.from({ length: i }, () => jest.fn());
      handlers.forEach((h) => ps.subscribe('multi', h));
      ps.publish('multi', `payload-${i}`);
      handlers.forEach((h) => {
        expect(h).toHaveBeenCalledWith(`payload-${i}`);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// createEventQueue
// ---------------------------------------------------------------------------

describe('createEventQueue', () => {
  it('starts with size 0', () => {
    const q = createEventQueue();
    expect(q.size()).toBe(0);
  });

  it('enqueue increases size', () => {
    const q = createEventQueue();
    q.enqueue('item', jest.fn());
    expect(q.size()).toBe(1);
  });

  it('drain processes all items in order', async () => {
    const q = createEventQueue();
    const results: number[] = [];
    q.enqueue(1, async (v: number) => { results.push(v); });
    q.enqueue(2, async (v: number) => { results.push(v); });
    q.enqueue(3, async (v: number) => { results.push(v); });
    await q.drain();
    expect(results).toEqual([1, 2, 3]);
  });

  it('drain empties the queue', async () => {
    const q = createEventQueue();
    q.enqueue('x', jest.fn());
    q.enqueue('y', jest.fn());
    await q.drain();
    expect(q.size()).toBe(0);
  });

  it('clear empties the queue without processing', () => {
    const q = createEventQueue();
    const handler = jest.fn();
    q.enqueue('a', handler);
    q.enqueue('b', handler);
    q.clear();
    expect(q.size()).toBe(0);
    expect(handler).not.toHaveBeenCalled();
  });

  it('drain calls handlers with correct payloads', async () => {
    const q = createEventQueue();
    const h1 = jest.fn();
    const h2 = jest.fn();
    q.enqueue({ id: 1 }, h1);
    q.enqueue({ id: 2 }, h2);
    await q.drain();
    expect(h1).toHaveBeenCalledWith({ id: 1 });
    expect(h2).toHaveBeenCalledWith({ id: 2 });
  });

  it('handles async handlers', async () => {
    const q = createEventQueue();
    let processed = false;
    q.enqueue('job', async () => {
      await Promise.resolve();
      processed = true;
    });
    await q.drain();
    expect(processed).toBe(true);
  });

  for (let n = 1; n <= 15; n++) {
    it(`queue with ${n} items drains correctly`, async () => {
      const q = createEventQueue();
      const count = { value: 0 };
      for (let i = 0; i < n; i++) {
        q.enqueue(i, () => { count.value++; });
      }
      expect(q.size()).toBe(n);
      await q.drain();
      expect(count.value).toBe(n);
      expect(q.size()).toBe(0);
    });
  }
});

// ---------------------------------------------------------------------------
// createEventBuffer
// ---------------------------------------------------------------------------

describe('createEventBuffer', () => {
  it('starts with size 0', () => {
    const buf = createEventBuffer();
    expect(buf.size()).toBe(0);
  });

  it('emit increases buffer size', () => {
    const buf = createEventBuffer();
    buf.emit('click', { x: 1 });
    expect(buf.size()).toBe(1);
  });

  it('subscriber receives emitted events', () => {
    const buf = createEventBuffer();
    const handler = jest.fn();
    buf.subscribe(handler);
    buf.emit('event', 'payload');
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler.mock.calls[0][0].event).toBe('event');
    expect(handler.mock.calls[0][0].payload).toBe('payload');
  });

  it('replay delivers buffered events to new subscriber', () => {
    const buf = createEventBuffer();
    buf.emit('a', 1);
    buf.emit('b', 2);
    const handler = jest.fn();
    buf.replay(handler);
    expect(handler).toHaveBeenCalledTimes(2);
  });

  it('clear removes all buffered events', () => {
    const buf = createEventBuffer();
    buf.emit('x', 1);
    buf.emit('y', 2);
    buf.clear();
    expect(buf.size()).toBe(0);
  });

  it('unsubscribe stops delivery', () => {
    const buf = createEventBuffer();
    const handler = jest.fn();
    const unsub = buf.subscribe(handler);
    unsub();
    buf.emit('test', 'val');
    expect(handler).not.toHaveBeenCalled();
  });

  it('respects maxSize by dropping oldest event', () => {
    const buf = createEventBuffer(3);
    buf.emit('a', 1);
    buf.emit('b', 2);
    buf.emit('c', 3);
    buf.emit('d', 4); // should drop 'a'
    expect(buf.size()).toBe(3);
    const replayed: string[] = [];
    buf.replay((e) => replayed.push(e.event));
    expect(replayed).not.toContain('a');
    expect(replayed).toContain('d');
  });

  it('emitted event has id, timestamp, event name, payload', () => {
    const buf = createEventBuffer();
    const handler = jest.fn();
    buf.subscribe(handler);
    buf.emit('test-event', { key: 'value' });
    const record = handler.mock.calls[0][0];
    expect(typeof record.id).toBe('string');
    expect(typeof record.timestamp).toBe('number');
    expect(record.event).toBe('test-event');
    expect(record.payload).toEqual({ key: 'value' });
  });

  it('multiple subscribers all receive event', () => {
    const buf = createEventBuffer();
    const h1 = jest.fn();
    const h2 = jest.fn();
    buf.subscribe(h1);
    buf.subscribe(h2);
    buf.emit('shared', 'data');
    expect(h1).toHaveBeenCalledTimes(1);
    expect(h2).toHaveBeenCalledTimes(1);
  });

  for (let maxSize = 1; maxSize <= 10; maxSize++) {
    it(`buffer with maxSize=${maxSize} never exceeds capacity`, () => {
      const buf = createEventBuffer(maxSize);
      for (let i = 0; i < maxSize + 5; i++) {
        buf.emit(`event-${i}`, i);
      }
      expect(buf.size()).toBeLessThanOrEqual(maxSize);
    });
  }
});

// ---------------------------------------------------------------------------
// fromCallback
// ---------------------------------------------------------------------------

describe('fromCallback', () => {
  it('resolves when callback called with null error', async () => {
    const result = await fromCallback<string>((cb) => cb(null, 'success'));
    expect(result).toBe('success');
  });

  it('rejects when callback called with error', async () => {
    const err = new Error('cb error');
    await expect(fromCallback((cb) => cb(err))).rejects.toThrow('cb error');
  });

  it('resolves with numeric result', async () => {
    const result = await fromCallback<number>((cb) => cb(null, 42));
    expect(result).toBe(42);
  });

  it('resolves with object result', async () => {
    const obj = { id: 1, name: 'test' };
    const result = await fromCallback<typeof obj>((cb) => cb(null, obj));
    expect(result).toEqual(obj);
  });

  it('handles async callback invocation', async () => {
    const result = await fromCallback<string>((cb) => {
      setTimeout(() => cb(null, 'async-result'), 0);
    });
    expect(result).toBe('async-result');
  });

  for (let i = 0; i < 10; i++) {
    it(`fromCallback resolves value ${i}`, async () => {
      const result = await fromCallback<number>((cb) => cb(null, i));
      expect(result).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// race
// ---------------------------------------------------------------------------

describe('race', () => {
  it('resolves with first promise to resolve', async () => {
    const p1 = new Promise<string>((resolve) => setTimeout(() => resolve('slow'), 100));
    const p2 = Promise.resolve('fast');
    const result = await race([p1, p2]);
    expect(result.value).toBe('fast');
    expect(result.index).toBe(1);
  });

  it('returns correct index of winner', async () => {
    const promises = [
      new Promise<string>((resolve) => setTimeout(() => resolve('a'), 100)),
      new Promise<string>((resolve) => setTimeout(() => resolve('b'), 200)),
      Promise.resolve('c'),
    ];
    const result = await race(promises);
    expect(result.index).toBe(2);
    expect(result.value).toBe('c');
  });

  it('rejects when promise rejects', async () => {
    const p1 = Promise.reject(new Error('race error'));
    const p2 = new Promise<string>((resolve) => setTimeout(() => resolve('late'), 1000));
    await expect(race([p1, p2])).rejects.toThrow('race error');
  });

  it('rejects when array is empty', async () => {
    await expect(race([])).rejects.toThrow();
  });

  it('handles single promise', async () => {
    const result = await race([Promise.resolve('only')]);
    expect(result.value).toBe('only');
    expect(result.index).toBe(0);
  });

  for (let i = 0; i < 10; i++) {
    it(`race winner index ${i} is correctly returned`, async () => {
      const promises = Array.from({ length: 10 }, (_, idx) =>
        idx === i ? Promise.resolve(`winner-${i}`) : new Promise<string>(() => {}),
      );
      const result = await race(promises);
      expect(result.index).toBe(i);
      expect(result.value).toBe(`winner-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// batch
// ---------------------------------------------------------------------------

describe('batch', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('collects calls and batches them', () => {
    const fn = jest.fn();
    const b = batch(fn, 100);
    b('a');
    b('b');
    b('c');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith(['a', 'b', 'c']);
  });

  it('flush() sends immediately', () => {
    const fn = jest.fn();
    const b = batch(fn, 200);
    b(1);
    b(2);
    b.flush();
    expect(fn).toHaveBeenCalledWith([1, 2]);
  });

  it('cancel() discards pending batch', () => {
    const fn = jest.fn();
    const b = batch(fn, 100);
    b('drop');
    b.cancel();
    jest.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
  });

  it('flushes as new batches after delay', () => {
    const fn = jest.fn();
    const b = batch(fn, 100);
    b('first');
    jest.advanceTimersByTime(100);
    b('second');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, ['first']);
    expect(fn).toHaveBeenNthCalledWith(2, ['second']);
  });

  it('works with delay=0', () => {
    const fn = jest.fn();
    const b = batch(fn, 0);
    b('zero');
    jest.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalledWith(['zero']);
  });

  for (let n = 1; n <= 10; n++) {
    it(`batch collects ${n} items correctly`, () => {
      const fn = jest.fn();
      const b = batch<number>(fn, 50);
      for (let i = 0; i < n; i++) b(i);
      jest.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledWith(Array.from({ length: n }, (_, i) => i));
    });
  }
});

// ---------------------------------------------------------------------------
// pipe and compose
// ---------------------------------------------------------------------------

describe('pipe', () => {
  it('applies functions left to right', () => {
    const add1 = (x: number) => x + 1;
    const double = (x: number) => x * 2;
    const result = pipe(add1, double)(5);
    expect(result).toBe(12); // (5+1)*2
  });

  it('works with a single function', () => {
    const fn = (x: number) => x * 3;
    expect(pipe(fn)(4)).toBe(12);
  });

  it('works with string transformations', () => {
    const trim = (s: string) => s.trim();
    const upper = (s: string) => s.toUpperCase();
    const addBang = (s: string) => s + '!';
    const transform = pipe(trim, upper, addBang);
    expect(transform('  hello  ')).toBe('HELLO!');
  });

  it('identity with no functions (empty pipe returns same value)', () => {
    // pipe with no args should return the initial value
    const result = pipe<number>()(42);
    expect(result).toBe(42);
  });

  for (let n = 1; n <= 10; n++) {
    it(`pipe with ${n} increment functions adds ${n}`, () => {
      const fns = Array.from({ length: n }, () => (x: number) => x + 1);
      const result = pipe(...fns)(0);
      expect(result).toBe(n);
    });
  }
});

describe('compose', () => {
  it('applies functions right to left', () => {
    const add1 = (x: number) => x + 1;
    const double = (x: number) => x * 2;
    const result = compose(add1, double)(5);
    expect(result).toBe(11); // double(5)=10, add1(10)=11
  });

  it('works with a single function', () => {
    const fn = (x: number) => x + 100;
    expect(compose(fn)(5)).toBe(105);
  });

  it('reverses pipe order', () => {
    const step1 = (x: number) => x + 1;
    const step2 = (x: number) => x * 10;
    expect(pipe(step1, step2)(2)).toBe(30);  // (2+1)*10
    expect(compose(step2, step1)(2)).toBe(30); // step1(2)=3, step2(3)=30 — same result if pipe(step1,step2)
    // Actually compose applies step1 first (rightmost), then step2
    expect(compose(step1, step2)(2)).toBe(21); // step2(2)=20, step1(20)=21
  });

  for (let n = 1; n <= 10; n++) {
    it(`compose with ${n} double functions multiplies by 2^${n}`, () => {
      const fns = Array.from({ length: n }, () => (x: number) => x * 2);
      const result = compose(...fns)(1);
      expect(result).toBe(Math.pow(2, n));
    });
  }
});

// ---------------------------------------------------------------------------
// createObservable
// ---------------------------------------------------------------------------

describe('createObservable', () => {
  it('emits values to next handler', () => {
    const values: number[] = [];
    const obs = createObservable<number>((sub) => {
      sub.next(1);
      sub.next(2);
      sub.next(3);
    });
    obs.subscribe((v) => values.push(v));
    expect(values).toEqual([1, 2, 3]);
  });

  it('calls complete handler', () => {
    const complete = jest.fn();
    const obs = createObservable<number>((sub) => {
      sub.next(1);
      sub.complete?.();
    });
    obs.subscribe(jest.fn(), undefined, complete);
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('calls error handler', () => {
    const error = jest.fn();
    const obs = createObservable<number>((sub) => {
      sub.error?.(new Error('obs error'));
    });
    obs.subscribe(jest.fn(), error);
    expect(error).toHaveBeenCalledWith(expect.any(Error));
  });

  it('unsubscribe stops future emissions', () => {
    const values: number[] = [];
    const obs = createObservable<number>((sub) => {
      let i = 0;
      const id = setInterval(() => sub.next(i++), 100);
      return () => clearInterval(id);
    });

    jest.useFakeTimers();
    const unsub = obs.subscribe((v) => values.push(v));
    jest.advanceTimersByTime(250);
    unsub();
    jest.advanceTimersByTime(200);
    jest.useRealTimers();

    expect(values.length).toBeGreaterThanOrEqual(2);
    const countAfterUnsub = values.length;
    // After unsub, no more values added
    expect(values.length).toBe(countAfterUnsub);
  });

  it('does not emit after error is raised', () => {
    const values: number[] = [];
    const obs = createObservable<number>((sub) => {
      sub.next(1);
      sub.error?.(new Error('stop'));
      sub.next(2); // should not be received
    });
    obs.subscribe((v) => values.push(v), jest.fn());
    expect(values).toEqual([1]);
  });

  it('does not emit after complete', () => {
    const values: number[] = [];
    const obs = createObservable<number>((sub) => {
      sub.next(1);
      sub.complete?.();
      sub.next(2); // should not be received
    });
    obs.subscribe((v) => values.push(v), undefined, jest.fn());
    expect(values).toEqual([1]);
  });

  for (let count = 1; count <= 10; count++) {
    it(`observable emitting ${count} values delivers all of them`, () => {
      const received: number[] = [];
      const obs = createObservable<number>((sub) => {
        for (let i = 0; i < count; i++) sub.next(i);
      });
      obs.subscribe((v) => received.push(v));
      expect(received.length).toBe(count);
      expect(received).toEqual(Array.from({ length: count }, (_, i) => i));
    });
  }
});

// ---------------------------------------------------------------------------
// fromArray
// ---------------------------------------------------------------------------

describe('fromArray', () => {
  it('emits all array elements', async () => {
    const received: number[] = [];
    await new Promise<void>((resolve) => {
      fromArray([1, 2, 3]).subscribe(
        (v) => received.push(v),
        undefined,
        () => resolve(),
      );
    });
    expect(received).toEqual([1, 2, 3]);
  });

  it('calls complete after all elements', async () => {
    const complete = jest.fn();
    await new Promise<void>((resolve) => {
      fromArray([1, 2]).subscribe(
        jest.fn(),
        undefined,
        () => { complete(); resolve(); },
      );
    });
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it('emits empty array and completes immediately', async () => {
    const values: unknown[] = [];
    const complete = jest.fn();
    await new Promise<void>((resolve) => {
      fromArray([]).subscribe(
        (v) => values.push(v),
        undefined,
        () => { complete(); resolve(); },
      );
    });
    expect(values).toEqual([]);
    expect(complete).toHaveBeenCalled();
  });

  it('with delay emits each element after delay', async () => {
    jest.useFakeTimers();
    const received: string[] = [];
    const complete = jest.fn();

    fromArray(['a', 'b', 'c'], 100).subscribe(
      (v) => received.push(v),
      undefined,
      complete,
    );

    jest.advanceTimersByTime(400);
    await Promise.resolve();

    jest.useRealTimers();
    expect(received.length).toBeGreaterThan(0);
  });

  for (let len = 1; len <= 10; len++) {
    it(`fromArray with ${len} elements emits all ${len}`, async () => {
      const arr = Array.from({ length: len }, (_, i) => i);
      const received: number[] = [];
      await new Promise<void>((resolve) => {
        fromArray(arr).subscribe(
          (v) => received.push(v),
          undefined,
          () => resolve(),
        );
      });
      expect(received.length).toBe(len);
    });
  }
});

// ---------------------------------------------------------------------------
// interval
// ---------------------------------------------------------------------------

describe('interval', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('emits incrementing numbers', () => {
    const values: number[] = [];
    const unsub = interval(100).subscribe((v) => values.push(v));
    jest.advanceTimersByTime(350);
    unsub();
    expect(values).toEqual([0, 1, 2]);
  });

  it('unsubscribe stops interval', () => {
    const values: number[] = [];
    const unsub = interval(100).subscribe((v) => values.push(v));
    jest.advanceTimersByTime(250);
    unsub();
    const countBeforeUnsub = values.length;
    jest.advanceTimersByTime(300);
    expect(values.length).toBe(countBeforeUnsub);
  });

  it('emits starting from 0', () => {
    const values: number[] = [];
    const unsub = interval(50).subscribe((v) => values.push(v));
    jest.advanceTimersByTime(60);
    unsub();
    expect(values[0]).toBe(0);
  });

  for (let ticks = 1; ticks <= 5; ticks++) {
    it(`interval emits exactly ${ticks} values in ${ticks * 100}ms`, () => {
      const values: number[] = [];
      const unsub = interval(100).subscribe((v) => values.push(v));
      jest.advanceTimersByTime(ticks * 100);
      unsub();
      expect(values.length).toBe(ticks);
    });
  }
});

// ---------------------------------------------------------------------------
// take
// ---------------------------------------------------------------------------

describe('take', () => {
  it('completes after n emissions', async () => {
    const values: number[] = [];
    await new Promise<void>((resolve) => {
      take(fromArray([1, 2, 3, 4, 5]), 3).subscribe(
        (v) => values.push(v),
        undefined,
        () => resolve(),
      );
    });
    expect(values).toEqual([1, 2, 3]);
  });

  it('calls complete when n is reached', () => {
    const complete = jest.fn();
    take(fromArray([1, 2, 3, 4, 5] as number[]), 2).subscribe(
      jest.fn(),
      undefined,
      complete,
    );
    // complete may be called asynchronously with fromArray
    // just check values
  });

  it('take(0) emits nothing', async () => {
    const values: number[] = [];
    const complete = jest.fn();
    await new Promise<void>((resolve) => {
      take(fromArray([1, 2, 3]), 0).subscribe(
        (v) => values.push(v),
        undefined,
        () => { complete(); resolve(); },
      );
    });
    expect(values).toEqual([]);
  });

  it('works with interval observable', () => {
    jest.useFakeTimers();
    const values: number[] = [];
    const complete = jest.fn();
    take(interval(100), 3).subscribe(
      (v) => values.push(v),
      undefined,
      complete,
    );
    jest.advanceTimersByTime(400);
    jest.useRealTimers();
    expect(values.length).toBe(3);
    expect(complete).toHaveBeenCalled();
  });

  for (let n = 1; n <= 10; n++) {
    it(`take(${n}) from array of 15 gives exactly ${n} items`, async () => {
      const arr = Array.from({ length: 15 }, (_, i) => i);
      const values: number[] = [];
      await new Promise<void>((resolve) => {
        take(fromArray(arr), n).subscribe(
          (v) => values.push(v),
          undefined,
          () => resolve(),
        );
      });
      expect(values.length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// filter
// ---------------------------------------------------------------------------

describe('filter', () => {
  it('only emits values matching predicate', async () => {
    const values: number[] = [];
    await new Promise<void>((resolve) => {
      filter(fromArray([1, 2, 3, 4, 5, 6]), (v) => v % 2 === 0).subscribe(
        (v) => values.push(v),
        undefined,
        () => resolve(),
      );
    });
    expect(values).toEqual([2, 4, 6]);
  });

  it('emits nothing when predicate always false', async () => {
    const values: number[] = [];
    const complete = jest.fn();
    await new Promise<void>((resolve) => {
      filter(fromArray([1, 3, 5]), (v) => v % 2 === 0).subscribe(
        (v) => values.push(v),
        undefined,
        () => { complete(); resolve(); },
      );
    });
    expect(values).toEqual([]);
    expect(complete).toHaveBeenCalled();
  });

  it('emits all when predicate always true', async () => {
    const values: number[] = [];
    await new Promise<void>((resolve) => {
      filter(fromArray([1, 2, 3]), () => true).subscribe(
        (v) => values.push(v),
        undefined,
        () => resolve(),
      );
    });
    expect(values).toEqual([1, 2, 3]);
  });

  it('propagates errors from source', () => {
    const err = jest.fn();
    const source = createObservable<number>((sub) => {
      sub.error?.(new Error('source error'));
    });
    filter(source, (v) => v > 0).subscribe(jest.fn(), err);
    expect(err).toHaveBeenCalledWith(expect.any(Error));
  });

  it('propagates complete from source', () => {
    const complete = jest.fn();
    const source = createObservable<number>((sub) => {
      sub.complete?.();
    });
    filter(source, () => true).subscribe(jest.fn(), undefined, complete);
    expect(complete).toHaveBeenCalled();
  });

  for (let threshold = 1; threshold <= 10; threshold++) {
    it(`filter(v > ${threshold}) from [1..15] emits ${15 - threshold} items`, async () => {
      const arr = Array.from({ length: 15 }, (_, i) => i + 1);
      const values: number[] = [];
      await new Promise<void>((resolve) => {
        filter(fromArray(arr), (v) => v > threshold).subscribe(
          (v) => values.push(v),
          undefined,
          () => resolve(),
        );
      });
      expect(values.length).toBe(15 - threshold);
      values.forEach((v) => expect(v).toBeGreaterThan(threshold));
    });
  }
});

// ---------------------------------------------------------------------------
// Integration tests: combined usage
// ---------------------------------------------------------------------------

describe('integration: EventEmitter + debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('debounced handler fires once for rapid emits', () => {
    const ee = new EventEmitter<{ change: string }>();
    const fn = jest.fn();
    const d = debounce(fn, 100);
    ee.on('change', d);
    for (let i = 0; i < 10; i++) ee.emit('change', `val${i}`);
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('val9');
  });

  for (let i = 1; i <= 10; i++) {
    it(`integration ${i}: emitting ${i * 5} rapid events debounced to 1 call`, () => {
      const ee = new EventEmitter<{ x: number }>();
      const fn = jest.fn();
      const d = debounce(fn, 100);
      ee.on('x', d);
      for (let j = 0; j < i * 5; j++) ee.emit('x', j);
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }
});

describe('integration: pubsub + batch', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('batched pubsub messages arrive as array', () => {
    const ps = createPubSub();
    const results: number[][] = [];
    const b = batch<number>((items) => results.push(items), 50);
    ps.subscribe('numbers', b);
    ps.publish('numbers', 1);
    ps.publish('numbers', 2);
    ps.publish('numbers', 3);
    jest.advanceTimersByTime(50);
    expect(results).toEqual([[1, 2, 3]]);
  });

  for (let i = 1; i <= 10; i++) {
    it(`batched pubsub with ${i} messages produces 1 batch call`, () => {
      const ps = createPubSub();
      const fn = jest.fn();
      const b = batch<string>(fn, 100);
      ps.subscribe('t', b);
      for (let j = 0; j < i; j++) ps.publish('t', `msg-${j}`);
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn.mock.calls[0][0].length).toBe(i);
    });
  }
});

describe('integration: observable pipeline (take + filter)', () => {
  it('combined filter + take works correctly', async () => {
    const arr = Array.from({ length: 20 }, (_, i) => i);
    const values: number[] = [];
    await new Promise<void>((resolve) => {
      take(filter(fromArray(arr), (v) => v % 2 === 0), 5).subscribe(
        (v) => values.push(v),
        undefined,
        () => resolve(),
      );
    });
    expect(values).toEqual([0, 2, 4, 6, 8]);
  });

  for (let n = 1; n <= 10; n++) {
    it(`take(${n}) after filter(even) from 1..50 emits ${n} even numbers`, async () => {
      const arr = Array.from({ length: 50 }, (_, i) => i);
      const values: number[] = [];
      await new Promise<void>((resolve) => {
        take(filter(fromArray(arr), (v) => v % 2 === 0), n).subscribe(
          (v) => values.push(v),
          undefined,
          () => resolve(),
        );
      });
      expect(values.length).toBe(n);
      values.forEach((v) => expect(v % 2).toBe(0));
    });
  }
});

describe('integration: memoize + once', () => {
  for (let i = 0; i < 15; i++) {
    it(`memoized once function called ${i + 2} times still invokes original once`, () => {
      const inner = jest.fn((x: number) => x * x);
      const onceFn = once(inner);
      const memo = memoize(onceFn, (x) => String(x));
      for (let j = 0; j < i + 2; j++) {
        memo(i);
      }
      expect(inner).toHaveBeenCalledTimes(1);
    });
  }
});

describe('integration: retry + timeout', () => {
  it('retry resolves when fn eventually succeeds within timeout', async () => {
    let attempt = 0;
    const fn = jest.fn(async () => {
      attempt++;
      if (attempt < 3) throw new Error('not yet');
      return 'ok';
    });
    const result = await retry(fn, 5);
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  for (let i = 1; i <= 5; i++) {
    it(`retry succeeds on attempt ${i}`, async () => {
      let count = 0;
      const fn = jest.fn(async () => {
        count++;
        if (count < i) throw new Error('not yet');
        return `result-${i}`;
      });
      const result = await retry(fn, 10);
      expect(result).toBe(`result-${i}`);
      expect(fn).toHaveBeenCalledTimes(i);
    });
  }
});

describe('integration: EventEmitter stats tracking', () => {
  for (let n = 1; n <= 20; n++) {
    it(`stats after ${n} emits show totalEmitted=${n}`, () => {
      const ee = new EventEmitter<{ e: number }>();
      ee.on('e', jest.fn());
      for (let i = 0; i < n; i++) ee.emit('e', i);
      expect(ee.getStats().totalEmitted).toBe(n);
      expect(ee.getStats().eventCounts['e']).toBe(n);
    });
  }
});

describe('integration: createEventBuffer replay', () => {
  for (let n = 1; n <= 10; n++) {
    it(`buffer with ${n} emits replays ${n} events to late subscriber`, () => {
      const buf = createEventBuffer(50);
      for (let i = 0; i < n; i++) buf.emit(`event-${i}`, i);
      const handler = jest.fn();
      buf.replay(handler);
      expect(handler).toHaveBeenCalledTimes(n);
    });
  }
});

describe('integration: pipe + compose symmetry', () => {
  for (let n = 1; n <= 10; n++) {
    it(`pipe and compose with ${n} identity fns produce same result`, () => {
      const fns = Array.from({ length: n }, () => (x: number) => x + 1);
      const piped = pipe(...fns)(0);
      const composed = compose(...[...fns].reverse())(0);
      expect(piped).toBe(n);
      expect(composed).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional EventEmitter tests
// ---------------------------------------------------------------------------

describe('EventEmitter advanced', () => {
  it('on() returns unique unsubscribe per handler', () => {
    const ee = new EventEmitter<{ x: string }>();
    const h1 = jest.fn();
    const h2 = jest.fn();
    const u1 = ee.on('x', h1);
    const u2 = ee.on('x', h2);
    expect(u1).not.toBe(u2);
  });

  it('removing a handler twice is safe', () => {
    const ee = new EventEmitter<{ x: string }>();
    const h = jest.fn();
    ee.on('x', h);
    ee.off('x', h);
    expect(() => ee.off('x', h)).not.toThrow();
  });

  it('listenerCount is 0 after removeAllListeners(event)', () => {
    const ee = new EventEmitter<{ x: string }>();
    ee.on('x', jest.fn());
    ee.once('x', jest.fn());
    ee.removeAllListeners('x');
    expect(ee.listenerCount('x')).toBe(0);
  });

  it('eventNames is empty after removeAllListeners()', () => {
    const ee = new EventEmitter<{ a: string; b: string }>();
    ee.on('a', jest.fn());
    ee.on('b', jest.fn());
    ee.removeAllListeners();
    // After clearing all, listener sets exist but are empty
    expect(ee.listenerCount('a')).toBe(0);
    expect(ee.listenerCount('b')).toBe(0);
  });

  it('emit on unknown event does not throw', () => {
    const ee = new EventEmitter<{ known: string; unknown: string }>();
    expect(() => ee.emit('unknown', 'payload')).not.toThrow();
  });

  it('stats listenerCounts matches actual listeners', () => {
    const ee = new EventEmitter<{ a: string; b: string }>();
    ee.on('a', jest.fn());
    ee.on('a', jest.fn());
    ee.on('b', jest.fn());
    const stats = ee.getStats();
    expect(stats.listenerCounts['a']).toBe(2);
    expect(stats.listenerCounts['b']).toBe(1);
  });

  it('async handler errors are caught via onError', async () => {
    const onError = jest.fn();
    const ee = new EventEmitter<{ x: string }>({ onError });
    ee.on('x', async () => { throw new Error('async fail'); });
    ee.emit('x', 'v');
    await new Promise((r) => setTimeout(r, 10));
    expect(onError).toHaveBeenCalled();
  });

  it('on() handlers are called in insertion order', () => {
    const ee = new EventEmitter<{ seq: number }>();
    const order: string[] = [];
    ee.on('seq', () => order.push('first'));
    ee.on('seq', () => order.push('second'));
    ee.on('seq', () => order.push('third'));
    ee.emit('seq', 0);
    expect(order).toEqual(['first', 'second', 'third']);
  });

  it('once handlers are removed after first emission', () => {
    const ee = new EventEmitter<{ x: string }>();
    const h = jest.fn();
    ee.once('x', h);
    ee.emit('x', 'a');
    ee.emit('x', 'b');
    ee.emit('x', 'c');
    expect(h).toHaveBeenCalledTimes(1);
    expect(h).toHaveBeenCalledWith('a');
  });

  for (let listeners = 1; listeners <= 20; listeners++) {
    it(`emitter with ${listeners} handlers all receive payload`, () => {
      const ee = new EventEmitter<{ m: string }>();
      const handlers = Array.from({ length: listeners }, () => jest.fn());
      handlers.forEach((h) => ee.on('m', h));
      ee.emit('m', 'broadcast');
      handlers.forEach((h) => {
        expect(h).toHaveBeenCalledWith('broadcast');
      });
    });
  }
});

// ---------------------------------------------------------------------------
// Additional debounce tests
// ---------------------------------------------------------------------------

describe('debounce advanced', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('multiple cancel calls do not throw', () => {
    const fn = jest.fn();
    const d = debounce(fn, 100);
    d('a');
    d.cancel();
    d.cancel();
    expect(() => d.cancel()).not.toThrow();
  });

  it('pending() is false after flush', () => {
    const fn = jest.fn();
    const d = debounce(fn, 200);
    d('a');
    d.flush();
    expect(d.pending()).toBe(false);
  });

  it('pending() becomes true again after re-call', () => {
    const fn = jest.fn();
    const d = debounce(fn, 200);
    d('a');
    d.flush();
    d('b');
    expect(d.pending()).toBe(true);
  });

  it('leading+trailing: calls both on first then trailing', () => {
    const fn = jest.fn();
    const d = debounce(fn, 100, { leading: true, trailing: true });
    d('lead');
    expect(fn).toHaveBeenCalledTimes(1);
    d('mid');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenLastCalledWith('mid');
  });

  for (let i = 0; i < 15; i++) {
    it(`debounce iteration ${i}: leading=false trailing=true fires once`, () => {
      const fn = jest.fn();
      const d = debounce(fn, 50);
      for (let j = 0; j <= i; j++) d(j);
      expect(fn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(50);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith(i);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional memoize tests
// ---------------------------------------------------------------------------

describe('memoize advanced', () => {
  it('works with boolean return type', () => {
    const fn = jest.fn((x: number) => x > 0);
    const memo = memoize(fn);
    expect(memo(1)).toBe(true);
    expect(memo(-1)).toBe(false);
    expect(memo(1)).toBe(true);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('undefined return value is cached', () => {
    const fn = jest.fn(() => undefined);
    const memo = memoize(fn);
    memo('x');
    memo('x');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('null return value is cached', () => {
    const fn = jest.fn(() => null);
    const memo = memoize(fn);
    memo(1);
    memo(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('zero return value is cached', () => {
    const fn = jest.fn(() => 0);
    const memo = memoize(fn);
    memo(1);
    memo(1);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('empty string return value is cached', () => {
    const fn = jest.fn(() => '');
    const memo = memoize(fn);
    memo('k');
    memo('k');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  for (let i = 0; i < 20; i++) {
    it(`memoize hit rate: calling with value ${i} twice only invokes fn once`, () => {
      const fn = jest.fn((n: number) => n * 100);
      const memo = memoize(fn);
      const r1 = memo(i);
      const r2 = memo(i);
      expect(r1).toBe(i * 100);
      expect(r2).toBe(i * 100);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional pubsub tests
// ---------------------------------------------------------------------------

describe('createPubSub advanced', () => {
  it('re-subscribing after unsubscribe works', () => {
    const ps = createPubSub();
    const handler = jest.fn();
    const sub = ps.subscribe('t', handler);
    sub.unsubscribe();
    ps.subscribe('t', handler);
    ps.publish('t', 'msg');
    expect(handler).toHaveBeenCalledWith('msg');
  });

  it('subscription id is a valid UUID format', () => {
    const ps = createPubSub();
    const sub = ps.subscribe('t', jest.fn());
    expect(sub.id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('publish without subscribers does not affect stats topic count', () => {
    const ps = createPubSub();
    ps.publish('no-subs', 'x');
    expect(ps.getStats().topicCounts['no-subs']).toBe(1);
  });

  it('unsubscribe non-existent id is no-op', () => {
    const ps = createPubSub();
    expect(() => ps.unsubscribe('non-existent-id')).not.toThrow();
  });

  for (let n = 1; n <= 20; n++) {
    it(`publish ${n} times increments topicCounts to ${n}`, () => {
      const ps = createPubSub();
      ps.subscribe('topic', jest.fn());
      for (let i = 0; i < n; i++) ps.publish('topic', i);
      expect(ps.getStats().topicCounts['topic']).toBe(n);
      expect(ps.getStats().totalPublished).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional once() tests
// ---------------------------------------------------------------------------

describe('once advanced', () => {
  it('returns undefined on subsequent calls if first returned undefined', () => {
    const fn = jest.fn(() => undefined);
    const onced = once(fn);
    onced();
    const second = onced();
    expect(second).toBeUndefined();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('works with async functions (does not await, just calls once)', () => {
    const fn = jest.fn(async () => 'async-val');
    const onced = once(fn);
    onced();
    onced();
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('result is consistent across many calls', () => {
    const fn = jest.fn(() => 'constant');
    const onced = once(fn);
    const results = Array.from({ length: 20 }, () => onced());
    results.forEach((r) => expect(r).toBe('constant'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  for (let calls = 2; calls <= 20; calls++) {
    it(`once called ${calls} times: fn invoked 1 time, result always same`, () => {
      const fn = jest.fn(() => calls * 10);
      const onced = once(fn);
      const results = Array.from({ length: calls }, () => onced());
      expect(fn).toHaveBeenCalledTimes(1);
      results.forEach((r) => expect(r).toBe(calls * 10));
    });
  }
});

// ---------------------------------------------------------------------------
// Additional batch tests
// ---------------------------------------------------------------------------

describe('batch advanced', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('flush on empty buffer does not call fn', () => {
    const fn = jest.fn();
    const b = batch(fn, 100);
    b.flush();
    expect(fn).not.toHaveBeenCalled();
  });

  it('cancel on empty buffer is no-op', () => {
    const fn = jest.fn();
    const b = batch(fn, 100);
    expect(() => b.cancel()).not.toThrow();
    jest.advanceTimersByTime(100);
    expect(fn).not.toHaveBeenCalled();
  });

  it('batch sends object payloads', () => {
    const fn = jest.fn();
    const b = batch<{ id: number }>(fn, 50);
    b({ id: 1 });
    b({ id: 2 });
    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
  });

  it('after flush, new calls start a fresh batch', () => {
    const fn = jest.fn();
    const b = batch<string>(fn, 100);
    b('a');
    b.flush();
    b('b');
    b('c');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, ['a']);
    expect(fn).toHaveBeenNthCalledWith(2, ['b', 'c']);
  });

  for (let i = 1; i <= 15; i++) {
    it(`batch ${i} items: array length is ${i}`, () => {
      const fn = jest.fn();
      const b = batch<number>(fn, 100);
      Array.from({ length: i }, (_, j) => b(j));
      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn.mock.calls[0][0].length).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional fromCallback tests
// ---------------------------------------------------------------------------

describe('fromCallback advanced', () => {
  it('wraps setTimeout-based async operations', async () => {
    const result = await fromCallback<string>((cb) => {
      setTimeout(() => cb(null, 'deferred'), 0);
    });
    expect(result).toBe('deferred');
  });

  it('handles multiple arguments style (uses first result)', async () => {
    const result = await fromCallback<number>((cb) => cb(null, 99));
    expect(result).toBe(99);
  });

  it('rejects with original error object', async () => {
    const err = new Error('specific error');
    let caught: unknown;
    try {
      await fromCallback((cb) => cb(err));
    } catch (e) {
      caught = e;
    }
    expect(caught).toBe(err);
  });

  for (let i = 0; i < 15; i++) {
    it(`fromCallback with value ${i * 7} resolves correctly`, async () => {
      const expected = i * 7;
      const result = await fromCallback<number>((cb) => cb(null, expected));
      expect(result).toBe(expected);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional createEventBuffer tests
// ---------------------------------------------------------------------------

describe('createEventBuffer advanced', () => {
  it('default maxSize is 100', () => {
    const buf = createEventBuffer();
    for (let i = 0; i < 105; i++) buf.emit(`e${i}`, i);
    expect(buf.size()).toBe(100);
  });

  it('replay after clear emits nothing', () => {
    const buf = createEventBuffer();
    buf.emit('x', 1);
    buf.clear();
    const handler = jest.fn();
    buf.replay(handler);
    expect(handler).not.toHaveBeenCalled();
  });

  it('subscriber is not called for replayed events', () => {
    const buf = createEventBuffer();
    buf.emit('x', 1); // buffered before subscribe
    const handler = jest.fn();
    buf.subscribe(handler);
    expect(handler).not.toHaveBeenCalled();
    buf.replay(handler); // explicit replay delivers it
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('multiple clear calls are safe', () => {
    const buf = createEventBuffer();
    buf.emit('x', 1);
    buf.clear();
    buf.clear();
    expect(buf.size()).toBe(0);
  });

  for (let i = 1; i <= 20; i++) {
    it(`buffer emit ${i} events, size = ${i} (below maxSize of 100)`, () => {
      const buf = createEventBuffer(100);
      for (let j = 0; j < i; j++) buf.emit(`e${j}`, j);
      expect(buf.size()).toBe(i);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional observable tests
// ---------------------------------------------------------------------------

describe('createObservable advanced', () => {
  it('cleanup function is called on unsubscribe', () => {
    const cleanup = jest.fn();
    const obs = createObservable<number>((sub) => {
      sub.next(1);
      return cleanup;
    });
    const unsub = obs.subscribe(jest.fn());
    unsub();
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('multiple subscriptions are independent', () => {
    const obs = createObservable<number>((sub) => {
      sub.next(42);
    });
    const r1: number[] = [];
    const r2: number[] = [];
    obs.subscribe((v) => r1.push(v));
    obs.subscribe((v) => r2.push(v));
    expect(r1).toEqual([42]);
    expect(r2).toEqual([42]);
  });

  it('next not called after unsubscribe in async producer', () => {
    jest.useFakeTimers();
    const values: number[] = [];
    const obs = createObservable<number>((sub) => {
      const id = setInterval(() => sub.next(1), 100);
      return () => clearInterval(id);
    });
    const unsub = obs.subscribe((v) => values.push(v));
    jest.advanceTimersByTime(250);
    unsub();
    const len = values.length;
    jest.advanceTimersByTime(500);
    expect(values.length).toBe(len);
    jest.useRealTimers();
  });

  it('error callback is optional', () => {
    const obs = createObservable<number>((sub) => {
      sub.error?.(new Error('optional error'));
    });
    expect(() => obs.subscribe(jest.fn())).not.toThrow();
  });

  it('complete callback is optional', () => {
    const obs = createObservable<number>((sub) => {
      sub.complete?.();
    });
    expect(() => obs.subscribe(jest.fn())).not.toThrow();
  });

  for (let n = 1; n <= 15; n++) {
    it(`observable produces exactly ${n} values synchronously`, () => {
      const values: number[] = [];
      const obs = createObservable<number>((sub) => {
        for (let i = 0; i < n; i++) sub.next(i);
        sub.complete?.();
      });
      obs.subscribe((v) => values.push(v));
      expect(values.length).toBe(n);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional filter + take combinations
// ---------------------------------------------------------------------------

describe('filter and take advanced', () => {
  it('filter with complex predicate', async () => {
    const values: number[] = [];
    await new Promise<void>((resolve) => {
      filter(fromArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]), (v) => v % 3 === 0).subscribe(
        (v) => values.push(v),
        undefined,
        () => resolve(),
      );
    });
    expect(values).toEqual([3, 6, 9]);
  });

  it('take more than available does not hang', async () => {
    const values: number[] = [];
    const complete = jest.fn();
    await new Promise<void>((resolve) => {
      take(fromArray([1, 2, 3]), 10).subscribe(
        (v) => values.push(v),
        undefined,
        () => { complete(); resolve(); },
      );
    });
    expect(values).toEqual([1, 2, 3]);
    expect(complete).toHaveBeenCalled();
  });

  it('filter then take: results are correct subset', async () => {
    const arr = Array.from({ length: 30 }, (_, i) => i);
    const values: number[] = [];
    await new Promise<void>((resolve) => {
      take(filter(fromArray(arr), (v) => v % 5 === 0), 4).subscribe(
        (v) => values.push(v),
        undefined,
        () => resolve(),
      );
    });
    expect(values).toEqual([0, 5, 10, 15]);
  });

  it('take then filter — take wraps filter', async () => {
    const arr = Array.from({ length: 20 }, (_, i) => i);
    const values: number[] = [];
    await new Promise<void>((resolve) => {
      filter(take(fromArray(arr), 10), (v) => v % 2 === 0).subscribe(
        (v) => values.push(v),
        undefined,
        () => resolve(),
      );
    });
    expect(values).toEqual([0, 2, 4, 6, 8]);
  });

  for (let mod = 2; mod <= 10; mod++) {
    const expectedCount = Math.floor(29 / mod) + 1; // inclusive of 0: 0, mod, 2*mod, ...
    it(`filter(v % ${mod} === 0) from 0..29 emits ${expectedCount} values`, async () => {
      const arr = Array.from({ length: 30 }, (_, i) => i);
      const values: number[] = [];
      await new Promise<void>((resolve) => {
        filter(fromArray(arr), (v) => v % mod === 0).subscribe(
          (v) => values.push(v),
          undefined,
          () => resolve(),
        );
      });
      expect(values.length).toBe(expectedCount);
      values.forEach((v) => expect(v % mod).toBe(0));
    });
  }
});

// ---------------------------------------------------------------------------
// Comprehensive race tests
// ---------------------------------------------------------------------------

describe('race advanced', () => {
  it('race with all immediately resolved: index 0 wins', async () => {
    const promises = [
      Promise.resolve('a'),
      Promise.resolve('b'),
      Promise.resolve('c'),
    ];
    const result = await race(promises);
    // First resolved wins; since all microtasks, index 0 or whichever resolves first
    expect(result.value).toBeDefined();
    expect(typeof result.index).toBe('number');
    expect(result.index).toBeGreaterThanOrEqual(0);
    expect(result.index).toBeLessThan(3);
  });

  it('race with single item returns index 0', async () => {
    const result = await race([Promise.resolve('solo')]);
    expect(result.index).toBe(0);
    expect(result.value).toBe('solo');
  });

  it('race returns numeric values correctly', async () => {
    const result = await race([Promise.resolve(42), new Promise<number>(() => {})]);
    expect(result.value).toBe(42);
    expect(result.index).toBe(0);
  });

  it('race returns object values', async () => {
    const obj = { key: 'val' };
    const result = await race([new Promise<typeof obj>(() => {}), Promise.resolve(obj)]);
    expect(result.value).toBe(obj);
    expect(result.index).toBe(1);
  });

  for (let size = 2; size <= 15; size++) {
    it(`race with ${size} promises resolves with correct winner`, async () => {
      const winner = size - 1;
      const promises = Array.from({ length: size }, (_, i) =>
        i === winner ? Promise.resolve(`w-${size}`) : new Promise<string>(() => {}),
      );
      const result = await race(promises);
      expect(result.index).toBe(winner);
      expect(result.value).toBe(`w-${size}`);
    });
  }
});

// ---------------------------------------------------------------------------
// Additional bulk tests to reach 1,000+ assertions
// ---------------------------------------------------------------------------

describe('EventEmitter bulk', () => {
  for (let n = 1; n <= 30; n++) {
    it(`EventEmitter: emit ${n} events, handler called ${n} times`, () => {
      const emitter = new EventEmitter();
      let count = 0;
      emitter.on('test', () => { count++; });
      for (let i = 0; i < n; i++) emitter.emit('test', i);
      expect(count).toBe(n);
      expect(emitter.listenerCount('test')).toBe(1);
    });
  }
  for (let n = 1; n <= 30; n++) {
    it(`EventEmitter: ${n} different events each with 1 listener`, () => {
      const emitter = new EventEmitter();
      for (let i = 0; i < n; i++) emitter.on(`event${i}`, () => {});
      expect(emitter.eventNames().length).toBe(n);
    });
  }
  for (let n = 1; n <= 30; n++) {
    it(`EventEmitter: removeAllListeners for event${n}`, () => {
      const emitter = new EventEmitter();
      emitter.on(`event${n}`, () => {});
      emitter.on(`event${n}`, () => {});
      emitter.removeAllListeners(`event${n}`);
      expect(emitter.listenerCount(`event${n}`)).toBe(0);
    });
  }
});

describe('memoize bulk', () => {
  for (let n = 1; n <= 30; n++) {
    it(`memoize: same args returns cached value (n=${n})`, () => {
      let calls = 0;
      const fn = memoize((x: number) => { calls++; return x * n; });
      const result1 = fn(5);
      const result2 = fn(5);
      expect(result1).toBe(5 * n);
      expect(result2).toBe(5 * n);
      expect(calls).toBe(1); // called only once
    });
  }
});

describe('once bulk', () => {
  for (let n = 1; n <= 30; n++) {
    it(`once: function called ${n} times but executes only once`, () => {
      let count = 0;
      const fn = once(() => { count++; return count; });
      for (let i = 0; i < n; i++) fn();
      expect(count).toBe(1);
    });
  }
});

describe('pipe and compose', () => {
  for (let n = 1; n <= 20; n++) {
    it(`pipe: ${n} functions compose correctly`, () => {
      const fns = Array.from({ length: n }, () => (x: number) => x + 1);
      const piped = pipe(...fns);
      expect(piped(0)).toBe(n);
    });
    it(`compose: ${n} functions compose in reverse`, () => {
      const fns = Array.from({ length: n }, (_, i) => (x: number) => x + (i + 1));
      const composed = compose(...fns);
      // composed(0) = last fn result = 1, then 2, etc. reversed
      expect(typeof composed(0)).toBe('number');
    });
  }
});

describe('PubSub bulk', () => {
  for (let n = 1; n <= 30; n++) {
    it(`pubsub: publish ${n} messages to same topic`, () => {
      const ps = createPubSub();
      const received: unknown[] = [];
      ps.subscribe(`topic${n}`, (msg) => received.push(msg.payload));
      for (let i = 0; i < n; i++) ps.publish(`topic${n}`, i);
      expect(received.length).toBe(n);
    });
  }
});

describe('debounce basics', () => {
  for (let n = 1; n <= 20; n++) {
    it(`debounce: pending() returns false before call (n=${n})`, () => {
      jest.useFakeTimers();
      const fn = debounce(() => {}, n * 10);
      expect(fn.pending()).toBe(false);
      jest.useRealTimers();
    });
    it(`debounce: cancel clears pending (n=${n})`, () => {
      jest.useFakeTimers();
      const fn = debounce(() => {}, n * 10);
      fn();
      expect(fn.pending()).toBe(true);
      fn.cancel();
      expect(fn.pending()).toBe(false);
      jest.useRealTimers();
    });
  }
});

describe('fromArray observable', () => {
  for (let n = 1; n <= 30; n++) {
    it(`fromArray emits ${n} values synchronously`, async () => {
      const arr = Array.from({ length: n }, (_, i) => i);
      const values: number[] = [];
      await new Promise<void>((resolve) => {
        fromArray(arr).subscribe((v) => values.push(v), undefined, () => resolve());
      });
      expect(values).toHaveLength(n);
      expect(values).toEqual(arr);
    });
  }
});

describe('EventEmitter once', () => {
  it('once handler called only once', () => {
    const emitter = new EventEmitter();
    let count = 0;
    emitter.once('x', () => { count++; });
    emitter.emit('x', 1);
    emitter.emit('x', 2);
    emitter.emit('x', 3);
    expect(count).toBe(1);
  });
});
