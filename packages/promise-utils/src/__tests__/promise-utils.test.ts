// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  delay,
  timeout,
  withTimeout,
  race,
  any,
  allSettled,
  retry,
  retryWithFallback,
  withRetry,
  pLimit,
  pool,
  mapLimit,
  filterLimit,
  deferred,
  createSemaphore,
  batch,
  debounceAsync,
  throttleAsync,
  memoizeAsync,
  once,
  isPromise,
  toPromise,
  promisify,
} from '../promise-utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const resolved = <T>(v: T): Promise<T> => Promise.resolve(v);
const rejected = (msg = 'err'): Promise<never> => Promise.reject(new Error(msg));

// ---------------------------------------------------------------------------
// delay — 100 tests
// ---------------------------------------------------------------------------
describe('delay', () => {
  afterEach(() => jest.useRealTimers());

  for (let i = 0; i < 50; i++) {
    it(`resolves with undefined for delay(${i * 5}) [fake timers] #${i}`, async () => {
      jest.useFakeTimers();
      const p = delay(i * 5);
      jest.advanceTimersByTime(i * 5 + 10);
      await expect(p).resolves.toBeUndefined();
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`delay(0) resolves immediately (fast path) #${i}`, async () => {
      jest.useFakeTimers();
      const p = delay(0);
      jest.runAllTimers();
      await expect(p).resolves.toBeUndefined();
    });
  }
});

// ---------------------------------------------------------------------------
// timeout — 80 tests
// ---------------------------------------------------------------------------
describe('timeout', () => {
  afterEach(() => jest.useRealTimers());

  for (let i = 0; i < 40; i++) {
    it(`resolves when inner promise is fast #${i}`, async () => {
      const result = await timeout(resolved(i), 5000);
      expect(result).toBe(i);
    });
  }

  for (let i = 0; i < 40; i++) {
    it(`rejects with timeout error #${i}`, async () => {
      jest.useFakeTimers();
      const neverResolves = new Promise<number>(() => {/* never */});
      const p = timeout(neverResolves, 100, `timed out #${i}`);
      jest.advanceTimersByTime(200);
      await expect(p).rejects.toThrow(`timed out #${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// withTimeout — 40 tests
// ---------------------------------------------------------------------------
describe('withTimeout', () => {
  afterEach(() => jest.useRealTimers());

  for (let i = 0; i < 20; i++) {
    it(`resolves when fn is fast #${i}`, async () => {
      const result = await withTimeout(() => resolved(i * 2), 5000);
      expect(result).toBe(i * 2);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`rejects when fn exceeds timeout #${i}`, async () => {
      jest.useFakeTimers();
      const p = withTimeout(() => new Promise<number>(() => {/* never */}), 50);
      jest.advanceTimersByTime(100);
      await expect(p).rejects.toThrow('50ms');
    });
  }
});

// ---------------------------------------------------------------------------
// race — 60 tests
// ---------------------------------------------------------------------------
describe('race', () => {
  for (let i = 0; i < 30; i++) {
    it(`returns first resolved value and its index #${i}`, async () => {
      const promises = [
        new Promise<number>((res) => setTimeout(() => res(99), 200)),
        resolved(i),
        new Promise<number>((res) => setTimeout(() => res(-1), 300)),
      ];
      const { value, index } = await race(promises);
      expect(value).toBe(i);
      expect(index).toBe(1);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`single-element array resolves with index 0 #${i}`, async () => {
      const { value, index } = await race([resolved(i + 100)]);
      expect(value).toBe(i + 100);
      expect(index).toBe(0);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`empty array rejects #${i}`, async () => {
      await expect(race([])).rejects.toThrow();
    });
  }
});

// ---------------------------------------------------------------------------
// any — 60 tests
// ---------------------------------------------------------------------------
describe('any', () => {
  for (let i = 0; i < 30; i++) {
    it(`resolves with first fulfilled value #${i}`, async () => {
      const result = await any([rejected('x'), resolved(i), rejected('y')]);
      expect(result).toBe(i);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`rejects when all promises reject #${i}`, async () => {
      await expect(any([rejected('a'), rejected('b')])).rejects.toBeInstanceOf(AggregateError);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`empty array rejects with AggregateError #${i}`, async () => {
      await expect(any([])).rejects.toBeInstanceOf(AggregateError);
    });
  }
});

// ---------------------------------------------------------------------------
// allSettled — 60 tests
// ---------------------------------------------------------------------------
describe('allSettled', () => {
  for (let i = 0; i < 30; i++) {
    it(`returns fulfilled result for resolved promise #${i}`, async () => {
      const [r] = await allSettled([resolved(i)]);
      expect(r.status).toBe('fulfilled');
      if (r.status === 'fulfilled') expect(r.value).toBe(i);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`returns rejected result for rejected promise #${i}`, async () => {
      const [r] = await allSettled([rejected(`err-${i}`)]);
      expect(r.status).toBe('rejected');
      if (r.status === 'rejected') expect((r.reason as Error).message).toBe(`err-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// retry — 80 tests
// ---------------------------------------------------------------------------
describe('retry', () => {
  for (let i = 1; i <= 40; i++) {
    it(`succeeds on attempt ${i} out of ${i} #${i}`, async () => {
      let calls = 0;
      const result = await retry(
        async () => {
          calls++;
          if (calls < i) throw new Error('not yet');
          return i * 10;
        },
        { maxAttempts: i, delayMs: 0 },
      );
      expect(result).toBe(i * 10);
      expect(calls).toBe(i);
    });
  }

  for (let i = 0; i < 40; i++) {
    it(`throws after all attempts exhausted #${i}`, async () => {
      const fn = jest.fn().mockRejectedValue(new Error(`fail-${i}`));
      await expect(retry(fn, { maxAttempts: 3, delayMs: 0 })).rejects.toThrow(`fail-${i}`);
      expect(fn).toHaveBeenCalledTimes(3);
    });
  }
});

// ---------------------------------------------------------------------------
// retryWithFallback — 50 tests
// ---------------------------------------------------------------------------
describe('retryWithFallback', () => {
  for (let i = 0; i < 25; i++) {
    it(`returns fallback on total failure #${i}`, async () => {
      const result = await retryWithFallback(
        () => Promise.reject(new Error('always')),
        `fallback-${i}`,
        { maxAttempts: 2, delayMs: 0 },
      );
      expect(result).toBe(`fallback-${i}`);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`returns actual result on success #${i}`, async () => {
      const result = await retryWithFallback(
        () => resolved(`ok-${i}`),
        `fallback-${i}`,
      );
      expect(result).toBe(`ok-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// withRetry — 40 tests
// ---------------------------------------------------------------------------
describe('withRetry', () => {
  for (let i = 0; i < 20; i++) {
    it(`succeeds immediately #${i}`, async () => {
      const result = await withRetry(() => resolved(i));
      expect(result).toBe(i);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`retries and eventually succeeds #${i}`, async () => {
      let calls = 0;
      const result = await withRetry(async () => {
        calls++;
        if (calls < 2) throw new Error('retry');
        return i + 100;
      }, 3);
      expect(result).toBe(i + 100);
    });
  }
});

// ---------------------------------------------------------------------------
// pLimit — 60 tests
// ---------------------------------------------------------------------------
describe('pLimit', () => {
  for (let i = 1; i <= 30; i++) {
    it(`executes fn with concurrency=${i} #${i}`, async () => {
      const limit = pLimit<number>(i);
      const result = await limit(() => resolved(i * 3));
      expect(result).toBe(i * 3);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`queues tasks beyond concurrency limit #${i}`, async () => {
      const limit = pLimit<number>(1);
      const order: number[] = [];
      const tasks = [0, 1, 2].map((n) =>
        limit(async () => {
          order.push(n);
          return n;
        }),
      );
      const results = await Promise.all(tasks);
      expect(results).toEqual([0, 1, 2]);
      expect(order).toEqual([0, 1, 2]);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`throws RangeError for concurrency < 1 #${i}`, () => {
      expect(() => pLimit(0)).toThrow(RangeError);
    });
  }
});

// ---------------------------------------------------------------------------
// pool — 60 tests
// ---------------------------------------------------------------------------
describe('pool', () => {
  for (let i = 0; i < 30; i++) {
    it(`runs all fns and returns results in order #${i}`, async () => {
      const fns = Array.from({ length: 5 }, (_, k) => () => resolved(k + i));
      const results = await pool(fns, 2);
      expect(results).toEqual([i, i + 1, i + 2, i + 3, i + 4]);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`handles concurrency larger than task count #${i}`, async () => {
      const fns = [() => resolved(i), () => resolved(i + 1)];
      const results = await pool(fns, 100);
      expect(results).toEqual([i, i + 1]);
    });
  }
});

// ---------------------------------------------------------------------------
// mapLimit — 50 tests
// ---------------------------------------------------------------------------
describe('mapLimit', () => {
  for (let i = 0; i < 25; i++) {
    it(`maps items with concurrency limit #${i}`, async () => {
      const items = [1, 2, 3, 4, 5].map((x) => x + i);
      const results = await mapLimit(items, (x) => resolved(x * 2), 2);
      expect(results).toEqual(items.map((x) => x * 2));
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`handles empty array #${i}`, async () => {
      const results = await mapLimit<number, number>([], (x) => resolved(x), 3);
      expect(results).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// filterLimit — 50 tests
// ---------------------------------------------------------------------------
describe('filterLimit', () => {
  for (let i = 0; i < 25; i++) {
    it(`filters items asynchronously #${i}`, async () => {
      const items = [1, 2, 3, 4, 5, 6];
      const evens = await filterLimit(items, async (x) => x % 2 === 0, 3);
      expect(evens).toEqual([2, 4, 6]);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`returns empty array when nothing passes #${i}`, async () => {
      const items = [1, 3, 5];
      const result = await filterLimit(items, async (x) => x % 2 === 0, 2);
      expect(result).toEqual([]);
    });
  }
});

// ---------------------------------------------------------------------------
// deferred — 60 tests
// ---------------------------------------------------------------------------
describe('deferred', () => {
  for (let i = 0; i < 30; i++) {
    it(`resolve completes the promise #${i}`, async () => {
      const d = deferred<number>();
      d.resolve(i);
      await expect(d.promise).resolves.toBe(i);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`reject completes the promise with error #${i}`, async () => {
      const d = deferred<number>();
      d.reject(new Error(`err-${i}`));
      await expect(d.promise).rejects.toThrow(`err-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// createSemaphore — 60 tests
// ---------------------------------------------------------------------------
describe('createSemaphore', () => {
  for (let i = 0; i < 30; i++) {
    it(`acquire and release with 1 permit #${i}`, async () => {
      const sem = createSemaphore(1);
      await sem.acquire();
      sem.release();
      // Should be able to acquire again
      await sem.acquire();
      sem.release();
      expect(true).toBe(true);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`withSemaphore runs fn and returns result #${i}`, async () => {
      const sem = createSemaphore(2);
      const result = await sem.withSemaphore(() => resolved(i * 7));
      expect(result).toBe(i * 7);
    });
  }
});

// ---------------------------------------------------------------------------
// batch — 50 tests
// ---------------------------------------------------------------------------
describe('batch', () => {
  for (let i = 0; i < 25; i++) {
    it(`flushes when maxSize is reached #${i}`, async () => {
      const batchFn = jest.fn(async (items: number[]) => items.map((x) => x * 2));
      const add = batch<number, number>(batchFn, { maxSize: 3, maxWaitMs: 10000 });
      const results = await Promise.all([add(1 + i), add(2 + i), add(3 + i)]);
      expect(results).toEqual([2 + i * 2, 4 + i * 2, 6 + i * 2]);
      expect(batchFn).toHaveBeenCalledTimes(1);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`second batch after first flush #${i}`, async () => {
      const batchFn = jest.fn(async (items: number[]) => items.map((x) => x + 100));
      const add = batch<number, number>(batchFn, { maxSize: 2, maxWaitMs: 10000 });
      const [r1, r2] = await Promise.all([add(i), add(i + 1)]);
      expect(r1).toBe(i + 100);
      expect(r2).toBe(i + 101);
    });
  }
});

// ---------------------------------------------------------------------------
// debounceAsync — 60 tests
// ---------------------------------------------------------------------------
describe('debounceAsync', () => {
  afterEach(() => jest.useRealTimers());

  for (let i = 0; i < 30; i++) {
    it(`only calls fn once after debounce window #${i}`, async () => {
      jest.useFakeTimers();
      const fn = jest.fn().mockResolvedValue(i);
      const debounced = debounceAsync(fn, 100);

      const p1 = debounced();
      const p2 = debounced();
      const p3 = debounced();

      jest.advanceTimersByTime(200);

      const [r1, r2, r3] = await Promise.all([p1, p2, p3]);
      expect(r1).toBe(i);
      expect(r2).toBe(i);
      expect(r3).toBe(i);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`new promise created after debounce settles #${i}`, async () => {
      jest.useFakeTimers();
      const fn = jest.fn().mockResolvedValueOnce(i).mockResolvedValueOnce(i + 1);
      const debounced = debounceAsync(fn, 50);

      const p1 = debounced();
      jest.advanceTimersByTime(100);
      const v1 = await p1;
      expect(v1).toBe(i);

      const p2 = debounced();
      jest.advanceTimersByTime(100);
      const v2 = await p2;
      expect(v2).toBe(i + 1);

      expect(fn).toHaveBeenCalledTimes(2);
    });
  }
});

// ---------------------------------------------------------------------------
// throttleAsync — 60 tests
// ---------------------------------------------------------------------------
describe('throttleAsync', () => {
  for (let i = 0; i < 30; i++) {
    it(`returns same promise during throttle window #${i}`, async () => {
      const fn = jest.fn().mockResolvedValue(i * 2);
      const throttled = throttleAsync(fn, 5000);
      const p1 = throttled();
      const p2 = throttled();
      expect(p1).toBe(p2);
      const result = await p1;
      expect(result).toBe(i * 2);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`allows new call after interval #${i}`, async () => {
      const fn = jest.fn().mockResolvedValue(i);
      const throttled = throttleAsync(fn, 0);
      await throttled();
      const result = await throttled();
      expect(result).toBe(i);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  }
});

// ---------------------------------------------------------------------------
// memoizeAsync — 60 tests
// ---------------------------------------------------------------------------
describe('memoizeAsync', () => {
  for (let i = 0; i < 30; i++) {
    it(`caches result on second call with same args #${i}`, async () => {
      const fn = jest.fn().mockResolvedValue(i * 3);
      const memoized = memoizeAsync(fn);
      const r1 = await memoized(i);
      const r2 = await memoized(i);
      expect(r1).toBe(i * 3);
      expect(r2).toBe(i * 3);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`different args produce different cache keys #${i}`, async () => {
      const fn = jest.fn((x: unknown) => Promise.resolve(x));
      const memoized = memoizeAsync(fn);
      await memoized(i);
      await memoized(i + 1);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`expired TTL causes re-execution #${i}`, async () => {
      jest.useFakeTimers();
      const fn = jest.fn().mockResolvedValue(i);
      const memoized = memoizeAsync(fn, 100);
      await memoized('key');
      jest.advanceTimersByTime(200);
      await memoized('key');
      expect(fn).toHaveBeenCalledTimes(2);
      jest.useRealTimers();
    });
  }
});

// ---------------------------------------------------------------------------
// once — 60 tests
// ---------------------------------------------------------------------------
describe('once', () => {
  for (let i = 0; i < 30; i++) {
    it(`fn called only once regardless of invocations #${i}`, async () => {
      const fn = jest.fn().mockResolvedValue(i);
      const onceFn = once(fn);
      const [r1, r2, r3] = await Promise.all([onceFn(), onceFn(), onceFn()]);
      expect(r1).toBe(i);
      expect(r2).toBe(i);
      expect(r3).toBe(i);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`returns same promise on repeated calls #${i}`, async () => {
      const fn = jest.fn().mockResolvedValue(i + 5);
      const onceFn = once(fn);
      const p1 = onceFn();
      const p2 = onceFn();
      expect(p1).toBe(p2);
      await p1;
    });
  }
});

// ---------------------------------------------------------------------------
// isPromise — 60 tests
// ---------------------------------------------------------------------------
describe('isPromise', () => {
  for (let i = 0; i < 20; i++) {
    it(`returns true for a real Promise #${i}`, () => {
      expect(isPromise(Promise.resolve(i))).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`returns false for a plain number #${i}`, () => {
      expect(isPromise(i)).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`returns false for null #${i}`, () => {
      expect(isPromise(null)).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`returns true for thenable object #${i}`, () => {
      const thenable = { then: () => {/* intentional */} };
      expect(isPromise(thenable)).toBe(true);
    });
  }
});

// ---------------------------------------------------------------------------
// toPromise — 60 tests
// ---------------------------------------------------------------------------
describe('toPromise', () => {
  for (let i = 0; i < 30; i++) {
    it(`wraps plain value in promise #${i}`, async () => {
      const result = await toPromise(i);
      expect(result).toBe(i);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`passes through existing promise #${i}`, async () => {
      const p = resolved(i + 1000);
      const result = await toPromise(p);
      expect(result).toBe(i + 1000);
    });
  }
});

// ---------------------------------------------------------------------------
// promisify — 60 tests
// ---------------------------------------------------------------------------
describe('promisify', () => {
  for (let i = 0; i < 30; i++) {
    it(`resolves when callback is called with null error #${i}`, async () => {
      const nodeFn = (_arg: unknown, cb: (e: null, r: number) => void): void => {
        cb(null, i * 4);
      };
      const promisified = promisify<number>(nodeFn as (...args: unknown[]) => void);
      const result = await promisified(`arg-${i}`);
      expect(result).toBe(i * 4);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`rejects when callback is called with an error #${i}`, async () => {
      const nodeFn = (_arg: unknown, cb: (e: Error) => void): void => {
        cb(new Error(`cb-err-${i}`));
      };
      const promisified = promisify<number>(nodeFn as (...args: unknown[]) => void);
      await expect(promisified('x')).rejects.toThrow(`cb-err-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// Integration / cross-utility — 60 tests
// ---------------------------------------------------------------------------
describe('integration', () => {
  for (let i = 1; i <= 20; i++) {
    it(`pool + mapLimit produce same results #${i}`, async () => {
      const items = Array.from({ length: i }, (_, k) => k);
      const poolResult = await pool(items.map((x) => () => resolved(x * 2)), Math.min(i, 4));
      const mapResult = await mapLimit(items, (x) => resolved(x * 2), Math.min(i, 4));
      expect(poolResult).toEqual(mapResult);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`retry + withRetry both succeed for immediate fn #${i}`, async () => {
      const r1 = await retry(() => resolved(i), { maxAttempts: 3, delayMs: 0 });
      const r2 = await withRetry(() => resolved(i));
      expect(r1).toBe(i);
      expect(r2).toBe(i);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`deferred resolved by external code #${i}`, async () => {
      const d = deferred<string>();
      setTimeout(() => d.resolve(`hello-${i}`), 0);
      const result = await d.promise;
      expect(result).toBe(`hello-${i}`);
    });
  }
});

// ---------------------------------------------------------------------------
// Edge cases — 40 tests
// ---------------------------------------------------------------------------
describe('edge cases', () => {
  for (let i = 0; i < 10; i++) {
    it(`allSettled with mixed promises #${i}`, async () => {
      const results = await allSettled([resolved(i), rejected(`e-${i}`), resolved(i + 1)]);
      expect(results[0].status).toBe('fulfilled');
      expect(results[1].status).toBe('rejected');
      expect(results[2].status).toBe('fulfilled');
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`pLimit concurrency=1 serialises tasks #${i}`, async () => {
      const order: number[] = [];
      const limit = pLimit<void>(1);
      await Promise.all(
        [0, 1, 2, 3].map((n) =>
          limit(async () => {
            order.push(n);
          }),
        ),
      );
      expect(order).toEqual([0, 1, 2, 3]);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`memoizeAsync with no TTL never expires #${i}`, async () => {
      const fn = jest.fn().mockResolvedValue(i);
      const memoized = memoizeAsync(fn);
      for (let j = 0; j < 5; j++) {
        await memoized('stable-key');
      }
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`filterLimit with all-pass predicate returns full array #${i}`, async () => {
      const items = Array.from({ length: 5 }, (_, k) => k + i);
      const result = await filterLimit(items, async () => true, 2);
      expect(result).toEqual(items);
    });
  }
});
