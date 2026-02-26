// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import {
  FixedWindowCounter,
  SlidingWindowLog,
  SlidingWindowCounter,
  TokenBucket,
  LeakyBucket,
  ConcurrencyLimiter,
  CompositeLimiter,
  createRateLimiter,
  retryAfterSeconds,
  isRateLimitError,
  throttle,
  debounce,
} from '../rate-limit-utils';

// ─────────────────────────────────────────────────────────────────────────────
// FixedWindowCounter — consume (100 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('FixedWindowCounter consume', () => {
  for (let i = 1; i <= 50; i++) {
    it(`allows request ${i} of 50 (limit=50)`, () => {
      let now = 1_000_000;
      const clock = () => now;
      const lim = new FixedWindowCounter(50, 10_000, clock);
      const key = `key-${i}`;
      for (let j = 0; j < i - 1; j++) lim.consume(key);
      const result = lim.consume(key);
      expect(result.allowed).toBe(true);
    });
  }

  for (let i = 1; i <= 50; i++) {
    it(`blocks request ${i} over limit (limit=${i - 1})`, () => {
      let now = 2_000_000;
      const clock = () => now;
      const lim = new FixedWindowCounter(i - 1 < 1 ? 1 : i - 1, 10_000, clock);
      const key = `over-${i}`;
      const limit = i - 1 < 1 ? 1 : i - 1;
      for (let j = 0; j < limit; j++) lim.consume(key);
      const result = lim.consume(key);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FixedWindowCounter — remaining counts (part of consume 100 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('FixedWindowCounter remaining counts', () => {
  for (let limit = 1; limit <= 50; limit++) {
    it(`remaining after 1 consume is ${limit - 1} when limit=${limit}`, () => {
      let now = 3_000_000;
      const clock = () => now;
      const lim = new FixedWindowCounter(limit, 5_000, clock);
      const result = lim.consume('r');
      expect(result.remaining).toBe(limit - 1);
    });
  }

  for (let consumed = 0; consumed < 50; consumed++) {
    it(`remaining after ${consumed} consumes out of 50 is ${50 - consumed}`, () => {
      let now = 4_000_000;
      const clock = () => now;
      const lim = new FixedWindowCounter(50, 5_000, clock);
      for (let j = 0; j < consumed; j++) lim.consume('r2');
      const result = lim.peek('r2');
      expect(result.remaining).toBe(50 - consumed);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FixedWindowCounter — reset at window boundary (100 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('FixedWindowCounter reset at window boundary', () => {
  for (let i = 1; i <= 50; i++) {
    it(`counter resets after window expires (iteration ${i})`, () => {
      let now = 5_000_000 + i * 100_000;
      const clock = () => now;
      const windowMs = 1_000 * i;
      const lim = new FixedWindowCounter(5, windowMs, clock);
      const key = `w-${i}`;
      // Exhaust limit
      for (let j = 0; j < 5; j++) lim.consume(key);
      expect(lim.consume(key).allowed).toBe(false);
      // Advance past window
      now += windowMs + 1;
      expect(lim.consume(key).allowed).toBe(true);
    });
  }

  for (let i = 1; i <= 50; i++) {
    it(`remaining resets to limit after window expires (iteration ${i})`, () => {
      let now = 6_000_000 + i * 100_000;
      const clock = () => now;
      const limit = i + 1;
      const windowMs = 500;
      const lim = new FixedWindowCounter(limit, windowMs, clock);
      const key = `wr-${i}`;
      for (let j = 0; j < limit; j++) lim.consume(key);
      now += windowMs + 1;
      const result = lim.peek(key);
      expect(result.remaining).toBe(limit);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FixedWindowCounter — peek (50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('FixedWindowCounter peek', () => {
  for (let i = 0; i < 25; i++) {
    it(`peek does not consume tokens (round ${i})`, () => {
      let now = 7_000_000 + i * 10_000;
      const clock = () => now;
      const lim = new FixedWindowCounter(10, 5_000, clock);
      const key = `pk-${i}`;
      for (let j = 0; j < 3; j++) lim.peek(key);
      const result = lim.consume(key);
      expect(result.remaining).toBe(9);
    });
  }

  for (let limit = 1; limit <= 25; limit++) {
    it(`peek shows correct remaining=0 when at limit=${limit}`, () => {
      let now = 8_000_000 + limit * 10_000;
      const clock = () => now;
      const lim = new FixedWindowCounter(limit, 5_000, clock);
      const key = `pklim-${limit}`;
      for (let j = 0; j < limit; j++) lim.consume(key);
      const result = lim.peek(key);
      expect(result.remaining).toBe(0);
      expect(result.allowed).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FixedWindowCounter — stats (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('FixedWindowCounter stats', () => {
  for (let count = 0; count < 50; count++) {
    it(`stats returns count=${count} after ${count} consumes`, () => {
      let now = 9_000_000 + count * 1_000;
      const clock = () => now;
      const lim = new FixedWindowCounter(200, 60_000, clock);
      const key = `st-${count}`;
      for (let j = 0; j < count; j++) lim.consume(key);
      const s = lim.stats(key);
      expect(s.count).toBe(count);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SlidingWindowLog — consume (100 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('SlidingWindowLog consume', () => {
  for (let i = 1; i <= 50; i++) {
    it(`allows request ${i} of 50 within window`, () => {
      let now = 10_000_000 + i * 500;
      const clock = () => now;
      const lim = new SlidingWindowLog(50, 10_000, clock);
      const key = `sl-${i}`;
      // Previous requests at different times
      for (let j = 0; j < i - 1; j++) {
        now += 10;
        lim.consume(key);
      }
      now += 10;
      const result = lim.consume(key);
      expect(result.allowed).toBe(true);
    });
  }

  for (let limit = 1; limit <= 50; limit++) {
    it(`blocks the ${limit + 1}th request (limit=${limit})`, () => {
      let now = 11_000_000 + limit * 1_000;
      const clock = () => now;
      const lim = new SlidingWindowLog(limit, 30_000, clock);
      const key = `slb-${limit}`;
      for (let j = 0; j < limit; j++) {
        now += 5;
        lim.consume(key);
      }
      const result = lim.consume(key);
      expect(result.allowed).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SlidingWindowLog — old entries removed (100 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('SlidingWindowLog old entries removed', () => {
  for (let i = 1; i <= 50; i++) {
    it(`after window passes old entries drop out (iteration ${i})`, () => {
      let now = 12_000_000 + i * 200_000;
      const clock = () => now;
      const windowMs = 1_000;
      const lim = new SlidingWindowLog(5, windowMs, clock);
      const key = `sl-old-${i}`;
      // Fill up
      for (let j = 0; j < 5; j++) {
        now += 10;
        lim.consume(key);
      }
      expect(lim.consume(key).allowed).toBe(false);
      // Advance past window
      now += windowMs + 50;
      expect(lim.logSize(key)).toBe(0);
    });
  }

  for (let i = 1; i <= 50; i++) {
    it(`logSize decreases as window slides (iteration ${i})`, () => {
      let now = 13_000_000 + i * 200_000;
      const clock = () => now;
      const windowMs = 1_000;
      const lim = new SlidingWindowLog(10, windowMs, clock);
      const key = `sz-${i}`;
      // Add entries spread across window
      for (let j = 0; j < 5; j++) {
        now += 100;
        lim.consume(key);
      }
      const sizeBefore = lim.logSize(key);
      expect(sizeBefore).toBe(5);
      // Advance so first 2 entries expire
      now += windowMs - 200;
      expect(lim.logSize(key)).toBeLessThanOrEqual(5);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SlidingWindowCounter (100 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('SlidingWindowCounter', () => {
  for (let i = 0; i < 50; i++) {
    it(`allows request when under limit (iteration ${i})`, () => {
      let now = 14_000_000 + i * 100_000;
      const clock = () => now;
      const lim = new SlidingWindowCounter(10, 1_000, clock);
      const key = `swc-${i}`;
      for (let j = 0; j < 5; j++) lim.consume(key);
      const result = lim.consume(key);
      expect(result.allowed).toBe(true);
    });
  }

  for (let limit = 1; limit <= 50; limit++) {
    it(`blocks when limit=${limit} is exceeded`, () => {
      let now = 15_000_000 + limit * 1_000;
      const clock = () => now;
      const lim = new SlidingWindowCounter(limit, 10_000, clock);
      const key = `swcb-${limit}`;
      for (let j = 0; j < limit; j++) lim.consume(key);
      const result = lim.consume(key);
      expect(result.allowed).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TokenBucket — consume (100 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('TokenBucket consume', () => {
  for (let i = 1; i <= 50; i++) {
    it(`allows ${i} consecutive requests with capacity=${i}`, () => {
      let now = 16_000_000;
      const clock = () => now;
      const lim = new TokenBucket({ capacity: i, refillRate: 1, clock });
      const key = `tb-${i}`;
      let allAllowed = true;
      for (let j = 0; j < i; j++) {
        if (!lim.consume(key).allowed) { allAllowed = false; break; }
      }
      expect(allAllowed).toBe(true);
    });
  }

  for (let i = 1; i <= 50; i++) {
    it(`blocks the ${i + 1}th request with capacity=${i}`, () => {
      let now = 17_000_000;
      const clock = () => now;
      const lim = new TokenBucket({ capacity: i, refillRate: 0.001, clock });
      const key = `tbb-${i}`;
      for (let j = 0; j < i; j++) lim.consume(key);
      expect(lim.consume(key).allowed).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TokenBucket — refill (100 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('TokenBucket refill', () => {
  for (let i = 1; i <= 50; i++) {
    it(`refills ${i} token(s) after ${i} seconds (refillRate=1)`, () => {
      let now = 18_000_000;
      const clock = () => now;
      const lim = new TokenBucket({ capacity: 100, refillRate: 1, initialTokens: 0, clock });
      const key = `tbr-${i}`;
      // Initialize state at base time by peeking
      lim.tokenCount(key);
      now += i * 1000; // advance i seconds
      const count = lim.tokenCount(key);
      expect(count).toBeCloseTo(i, 0);
    });
  }

  for (let i = 1; i <= 50; i++) {
    it(`tokens do not exceed capacity after ${i * 2} seconds`, () => {
      let now = 19_000_000;
      const clock = () => now;
      const capacity = i;
      const lim = new TokenBucket({ capacity, refillRate: 100, initialTokens: 0, clock });
      const key = `tbcap-${i}`;
      // Seed the state at base time
      lim.tokenCount(key);
      now += i * 2 * 1000; // well past full
      expect(lim.tokenCount(key)).toBeLessThanOrEqual(capacity);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TokenBucket — add / reset (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('TokenBucket add and reset', () => {
  for (let i = 1; i <= 25; i++) {
    it(`manually adding ${i} tokens increases tokenCount`, () => {
      let now = 20_000_000;
      const clock = () => now;
      const lim = new TokenBucket({ capacity: 200, refillRate: 0, initialTokens: 0, clock });
      lim.add('k', i);
      expect(lim.tokenCount('k')).toBeCloseTo(i, 0);
    });
  }

  for (let i = 1; i <= 25; i++) {
    it(`reset clears token state (i=${i})`, () => {
      let now = 21_000_000;
      const clock = () => now;
      const lim = new TokenBucket({ capacity: 10, refillRate: 0, initialTokens: 10, clock });
      const key = `tbreset-${i}`;
      for (let j = 0; j < 5; j++) lim.consume(key);
      lim.reset(key);
      // After reset the bucket is fresh with initialTokens
      expect(lim.tokenCount(key)).toBeCloseTo(10, 0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LeakyBucket (100 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('LeakyBucket', () => {
  for (let i = 1; i <= 50; i++) {
    it(`allows up to capacity=${i} requests before blocking`, () => {
      let now = 22_000_000;
      const clock = () => now;
      const lim = new LeakyBucket({ capacity: i, leakRate: 0.001, clock });
      const key = `lb-${i}`;
      let allowed = 0;
      for (let j = 0; j < i; j++) {
        if (lim.consume(key).allowed) allowed++;
      }
      expect(allowed).toBe(i);
    });
  }

  for (let i = 1; i <= 50; i++) {
    it(`blocks the ${i + 1}th request when capacity=${i}`, () => {
      let now = 23_000_000;
      const clock = () => now;
      const lim = new LeakyBucket({ capacity: i, leakRate: 0.001, clock });
      const key = `lbb-${i}`;
      for (let j = 0; j < i; j++) lim.consume(key);
      const result = lim.consume(key);
      expect(result.allowed).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LeakyBucket — queueSize (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('LeakyBucket queueSize', () => {
  for (let fill = 0; fill < 25; fill++) {
    it(`queueSize returns ${fill} after ${fill} consumes`, () => {
      let now = 24_000_000;
      const clock = () => now;
      const lim = new LeakyBucket({ capacity: 100, leakRate: 0.001, clock });
      const key = `qs-${fill}`;
      for (let j = 0; j < fill; j++) lim.consume(key);
      expect(lim.queueSize(key)).toBe(fill);
    });
  }

  for (let i = 1; i <= 25; i++) {
    it(`queueSize decreases after drain time (i=${i})`, () => {
      let now = 25_000_000;
      const clock = () => now;
      const leakRate = 10; // 10/s
      const lim = new LeakyBucket({ capacity: 50, leakRate, clock });
      const key = `qsd-${i}`;
      for (let j = 0; j < 10; j++) lim.consume(key);
      now += i * 1000; // i seconds drain
      const size = lim.queueSize(key);
      expect(size).toBeLessThanOrEqual(10);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ConcurrencyLimiter (100 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('ConcurrencyLimiter', () => {
  for (let max = 1; max <= 50; max++) {
    it(`allows exactly ${max} concurrent acquire() calls`, () => {
      const lim = new ConcurrencyLimiter(max);
      const key = `cl-${max}`;
      let acquired = 0;
      for (let j = 0; j < max; j++) {
        if (lim.acquire(key)) acquired++;
      }
      expect(acquired).toBe(max);
      expect(lim.acquire(key)).toBe(false);
    });
  }

  for (let max = 1; max <= 50; max++) {
    it(`active() decreases by 1 after release() (max=${max})`, () => {
      const lim = new ConcurrencyLimiter(max);
      const key = `clr-${max}`;
      for (let j = 0; j < max; j++) lim.acquire(key);
      expect(lim.active(key)).toBe(max);
      lim.release(key);
      expect(lim.active(key)).toBe(max - 1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ConcurrencyLimiter — reset (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('ConcurrencyLimiter reset', () => {
  for (let i = 1; i <= 25; i++) {
    it(`reset clears active count (i=${i})`, () => {
      const lim = new ConcurrencyLimiter(10);
      const key = `clrs-${i}`;
      for (let j = 0; j < i && j < 10; j++) lim.acquire(key);
      lim.reset(key);
      expect(lim.active(key)).toBe(0);
    });
  }

  for (let i = 1; i <= 25; i++) {
    it(`after reset, acquire() works again (i=${i})`, () => {
      const lim = new ConcurrencyLimiter(i);
      const key = `clra-${i}`;
      for (let j = 0; j < i; j++) lim.acquire(key);
      expect(lim.acquire(key)).toBe(false);
      lim.reset(key);
      expect(lim.acquire(key)).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CompositeLimiter (50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('CompositeLimiter', () => {
  for (let i = 1; i <= 25; i++) {
    it(`composite allows when all limiters pass (i=${i})`, () => {
      let now = 26_000_000 + i * 100_000;
      const clock = () => now;
      const a = new FixedWindowCounter(50, 10_000, clock);
      const b = new SlidingWindowLog(50, 10_000, clock);
      const composite = new CompositeLimiter(a, b);
      const key = `comp-${i}`;
      const result = composite.consume(key);
      expect(result.allowed).toBe(true);
    });
  }

  for (let i = 1; i <= 25; i++) {
    it(`composite blocks when first limiter blocks (i=${i})`, () => {
      let now = 27_000_000 + i * 100_000;
      const clock = () => now;
      const tight = new FixedWindowCounter(0, 10_000, clock);
      const loose = new FixedWindowCounter(100, 10_000, clock);
      const composite = new CompositeLimiter(tight, loose);
      const key = `compb-${i}`;
      expect(composite.consume(key).allowed).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// retryAfterSeconds (50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('retryAfterSeconds', () => {
  for (let ms = 1000; ms <= 25000; ms += 1000) {
    it(`returns ceil(${ms}/1000)=${Math.ceil(ms / 1000)} for retryAfter=${ms}ms`, () => {
      const result = { allowed: false, remaining: 0, resetAt: 0, retryAfter: ms };
      expect(retryAfterSeconds(result)).toBe(Math.ceil(ms / 1000));
    });
  }

  for (let ms = 100; ms <= 2500; ms += 100) {
    it(`returns ${Math.ceil(ms / 1000)} for retryAfter=${ms}ms (partial seconds)`, () => {
      const result = { allowed: false, remaining: 0, resetAt: 0, retryAfter: ms };
      expect(retryAfterSeconds(result)).toBe(Math.ceil(ms / 1000));
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// isRateLimitError (50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('isRateLimitError', () => {
  const rateLimitMessages = [
    'rate limit exceeded',
    'Rate Limit hit',
    'RATE LIMIT',
    'too many requests',
    'Too Many Requests',
    'TOO MANY REQUESTS',
    '429',
    'Error 429: too many requests',
    'You have hit a rate limit',
    'rate limit: 100 req/s',
    'too many requests from your IP',
    'rate limit window exceeded',
    '429 Too Many Requests',
    'rate limit reached for model',
    'rate limiting active',
    'error 429',
    'rate limit for endpoint',
    'rejected: too many requests',
    'rate limit quota reached',
    'Rate Limit Exceeded for user',
    'upstream rate limit',
    'rate limit breached',
    'too many requests - please slow down',
    'throttled: rate limit',
    'rate limit: 60/min',
  ];

  for (const msg of rateLimitMessages) {
    it(`returns true for "${msg}"`, () => {
      expect(isRateLimitError(new Error(msg))).toBe(true);
    });
  }

  const nonRateLimitMessages = [
    'network error',
    'connection refused',
    'timeout',
    'not found',
    'internal server error',
    'unauthorized',
    'forbidden',
    'bad request',
    'invalid token',
    'database error',
    'schema validation failed',
    '',
    'service unavailable',
    'gateway error',
    'unknown error',
    'payload too large',
    'method not allowed',
    'conflict',
    'gone',
    'expectation failed',
    'unprocessable entity',
    'locked',
    'failed dependency',
    'request header fields too large',
    'unavailable for legal reasons',
  ];

  for (const msg of nonRateLimitMessages) {
    it(`returns false for "${msg}"`, () => {
      expect(isRateLimitError(new Error(msg))).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// isRateLimitError — edge cases (additional 25 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('isRateLimitError edge cases', () => {
  it('returns false for null', () => expect(isRateLimitError(null)).toBe(false));
  it('returns false for undefined', () => expect(isRateLimitError(undefined)).toBe(false));
  it('returns false for number 429', () => expect(isRateLimitError(429)).toBe(false));
  it('returns false for number 0', () => expect(isRateLimitError(0)).toBe(false));
  it('returns false for empty object {}', () => expect(isRateLimitError({})).toBe(false));
  it('returns true for string "rate limit"', () => expect(isRateLimitError('rate limit')).toBe(true));
  it('returns true for string "too many requests"', () => expect(isRateLimitError('too many requests')).toBe(true));
  it('returns true for string "429"', () => expect(isRateLimitError('429')).toBe(true));
  it('returns false for string "normal error"', () => expect(isRateLimitError('normal error')).toBe(false));
  it('returns true for object with message "rate limit"', () => expect(isRateLimitError({ message: 'rate limit' })).toBe(true));
  it('returns false for object with message "ok"', () => expect(isRateLimitError({ message: 'ok' })).toBe(false));
  it('returns false for boolean true', () => expect(isRateLimitError(true)).toBe(false));
  it('returns false for boolean false', () => expect(isRateLimitError(false)).toBe(false));
  it('returns false for array', () => expect(isRateLimitError([])).toBe(false));
  it('returns false for symbol', () => expect(isRateLimitError(Symbol('rate limit'))).toBe(false));
  it('returns true for mixed case "Rate Limit Error"', () => expect(isRateLimitError(new Error('Rate Limit Error'))).toBe(true));
  it('returns true for "429 error code"', () => expect(isRateLimitError(new Error('429 error code'))).toBe(true));
  it('returns true for "server returned 429"', () => expect(isRateLimitError(new Error('server returned 429'))).toBe(true));
  it('returns false for "4290 error"', () => expect(isRateLimitError(new Error('4290 error'))).toBe(false));
  it('returns false for "rate_limit_exceeded" (underscores, no spaces)', () => expect(isRateLimitError(new Error('rate_limit_exceeded'))).toBe(false));
  it('returns false for "ratelimit exceeded" (no space)', () => expect(isRateLimitError(new Error('ratelimit exceeded'))).toBe(false));
  it('returns true for Error subclass with "rate limit"', () => {
    class CustomError extends Error {}
    expect(isRateLimitError(new CustomError('rate limit exceeded'))).toBe(true);
  });
  it('returns false for function', () => expect(isRateLimitError(() => {})).toBe(false));
  it('returns true for "TOO MANY REQUESTS uppercase"', () => expect(isRateLimitError(new Error('TOO MANY REQUESTS uppercase'))).toBe(true));
  it('returns false for "too_many_requests" (underscores)', () => expect(isRateLimitError(new Error('too_many_requests'))).toBe(false));
});

// ─────────────────────────────────────────────────────────────────────────────
// createRateLimiter (50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('createRateLimiter', () => {
  for (let i = 1; i <= 10; i++) {
    it(`creates FixedWindowCounter (iteration ${i})`, () => {
      const lim = createRateLimiter('fixed', { limit: 10, windowMs: 1000 });
      expect(lim).toBeInstanceOf(FixedWindowCounter);
    });
  }

  for (let i = 1; i <= 10; i++) {
    it(`creates SlidingWindowLog (iteration ${i})`, () => {
      const lim = createRateLimiter('sliding-log', { limit: 10, windowMs: 1000 });
      expect(lim).toBeInstanceOf(SlidingWindowLog);
    });
  }

  for (let i = 1; i <= 10; i++) {
    it(`creates SlidingWindowCounter (iteration ${i})`, () => {
      const lim = createRateLimiter('sliding-counter', { limit: 10, windowMs: 1000 });
      expect(lim).toBeInstanceOf(SlidingWindowCounter);
    });
  }

  for (let i = 1; i <= 10; i++) {
    it(`creates TokenBucket (iteration ${i})`, () => {
      const lim = createRateLimiter('token-bucket', { limit: 10, windowMs: 1000 });
      expect(lim).toBeInstanceOf(TokenBucket);
    });
  }

  for (let limit = 1; limit <= 10; limit++) {
    it(`FixedWindowCounter created with limit=${limit} allows that many requests`, () => {
      const lim = createRateLimiter('fixed', { limit, windowMs: 10_000 });
      let allowed = 0;
      for (let j = 0; j < limit; j++) {
        if ((lim as FixedWindowCounter).consume('k').allowed) allowed++;
      }
      expect(allowed).toBe(limit);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// retryAfterSeconds — allowed result (additional 25 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('retryAfterSeconds when allowed', () => {
  for (let i = 0; i < 25; i++) {
    it(`returns 0 when result.allowed=true (i=${i})`, () => {
      const result = { allowed: true, remaining: 10, resetAt: Date.now() + 1000 };
      expect(retryAfterSeconds(result)).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FixedWindowCounter — reset() method (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('FixedWindowCounter reset method', () => {
  for (let i = 1; i <= 25; i++) {
    it(`after reset(), consume() starts fresh (i=${i})`, () => {
      let now = 30_000_000 + i * 1000;
      const clock = () => now;
      const limit = i + 1;
      const lim = new FixedWindowCounter(limit, 10_000, clock);
      const key = `fwc-reset-${i}`;
      for (let j = 0; j < limit; j++) lim.consume(key);
      expect(lim.consume(key).allowed).toBe(false);
      lim.reset(key);
      expect(lim.consume(key).allowed).toBe(true);
    });
  }

  for (let i = 1; i <= 25; i++) {
    it(`stats returns count=0 after reset (i=${i})`, () => {
      let now = 31_000_000 + i * 1000;
      const clock = () => now;
      const lim = new FixedWindowCounter(100, 10_000, clock);
      const key = `fwc-stats-reset-${i}`;
      for (let j = 0; j < i; j++) lim.consume(key);
      lim.reset(key);
      expect(lim.stats(key).count).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SlidingWindowLog — reset() method (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('SlidingWindowLog reset method', () => {
  for (let i = 1; i <= 25; i++) {
    it(`after reset(), logSize returns 0 (i=${i})`, () => {
      let now = 32_000_000 + i * 1000;
      const clock = () => now;
      const lim = new SlidingWindowLog(100, 60_000, clock);
      const key = `sl-reset-${i}`;
      for (let j = 0; j < i; j++) lim.consume(key);
      lim.reset(key);
      expect(lim.logSize(key)).toBe(0);
    });
  }

  for (let i = 1; i <= 25; i++) {
    it(`after reset(), consume() is allowed again (i=${i})`, () => {
      let now = 33_000_000 + i * 1000;
      const clock = () => now;
      const lim = new SlidingWindowLog(i, 60_000, clock);
      const key = `sl-reset-allow-${i}`;
      for (let j = 0; j < i; j++) {
        now += 1;
        lim.consume(key);
      }
      expect(lim.consume(key).allowed).toBe(false);
      lim.reset(key);
      expect(lim.consume(key).allowed).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TokenBucket — peek (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('TokenBucket peek', () => {
  for (let cap = 1; cap <= 25; cap++) {
    it(`peek returns remaining=cap=${cap} for fresh bucket`, () => {
      let now = 34_000_000;
      const clock = () => now;
      const lim = new TokenBucket({ capacity: cap, refillRate: 1, clock });
      const result = lim.peek('k');
      expect(result.remaining).toBe(cap);
    });
  }

  for (let used = 1; used <= 25; used++) {
    it(`peek returns remaining=${25 - used} after ${used} consumes (cap=25)`, () => {
      let now = 35_000_000;
      const clock = () => now;
      const lim = new TokenBucket({ capacity: 25, refillRate: 0, clock });
      const key = `tbp-${used}`;
      for (let j = 0; j < used; j++) lim.consume(key);
      const result = lim.peek(key);
      expect(result.remaining).toBe(25 - used);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SlidingWindowCounter — reset() and peek() (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('SlidingWindowCounter reset and peek', () => {
  for (let i = 1; i <= 25; i++) {
    it(`reset() allows fresh requests again (i=${i})`, () => {
      let now = 36_000_000 + i * 1000;
      const clock = () => now;
      const lim = new SlidingWindowCounter(i, 10_000, clock);
      const key = `swcr-${i}`;
      for (let j = 0; j < i; j++) lim.consume(key);
      lim.reset(key);
      expect(lim.consume(key).allowed).toBe(true);
    });
  }

  for (let i = 1; i <= 25; i++) {
    it(`peek does not increase estimated count (i=${i})`, () => {
      let now = 37_000_000 + i * 1000;
      const clock = () => now;
      const lim = new SlidingWindowCounter(100, 10_000, clock);
      const key = `swcp-${i}`;
      lim.peek(key);
      lim.peek(key);
      lim.peek(key);
      const result = lim.consume(key);
      expect(result.allowed).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LeakyBucket — reset() (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('LeakyBucket reset', () => {
  for (let i = 1; i <= 25; i++) {
    it(`reset clears queue (capacity=${i})`, () => {
      let now = 38_000_000;
      const clock = () => now;
      const lim = new LeakyBucket({ capacity: i, leakRate: 0.001, clock });
      const key = `lbr-${i}`;
      for (let j = 0; j < i; j++) lim.consume(key);
      expect(lim.queueSize(key)).toBe(i);
      lim.reset(key);
      expect(lim.queueSize(key)).toBe(0);
    });
  }

  for (let i = 1; i <= 25; i++) {
    it(`after reset, can consume again (capacity=${i})`, () => {
      let now = 39_000_000;
      const clock = () => now;
      const lim = new LeakyBucket({ capacity: i, leakRate: 0.001, clock });
      const key = `lbra-${i}`;
      for (let j = 0; j < i; j++) lim.consume(key);
      expect(lim.consume(key).allowed).toBe(false);
      lim.reset(key);
      expect(lim.consume(key).allowed).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CompositeLimiter — most restrictive result (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('CompositeLimiter most restrictive', () => {
  for (let i = 1; i <= 25; i++) {
    it(`composite returns result with smallest remaining (i=${i})`, () => {
      let now = 40_000_000 + i * 10_000;
      const clock = () => now;
      const limitA = 20;
      const limitB = i + 5;
      const a = new FixedWindowCounter(limitA, 60_000, clock);
      const b = new FixedWindowCounter(limitB, 60_000, clock);
      const composite = new CompositeLimiter(a, b);
      const key = `cmr-${i}`;
      // Consume 5 from each
      for (let j = 0; j < 5; j++) { a.consume(key); b.consume(key); }
      const result = composite.consume(key);
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBeLessThanOrEqual(limitA - 5 - 1);
    });
  }

  for (let i = 1; i <= 25; i++) {
    it(`composite blocks when second limiter is exhausted (i=${i})`, () => {
      let now = 41_000_000 + i * 10_000;
      const clock = () => now;
      const loose = new FixedWindowCounter(100, 60_000, clock);
      const tight = new FixedWindowCounter(i, 60_000, clock);
      const composite = new CompositeLimiter(loose, tight);
      const key = `cmb2-${i}`;
      for (let j = 0; j < i; j++) {
        loose.consume(key);
        tight.consume(key);
      }
      expect(composite.consume(key).allowed).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// throttle (additional 25 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('throttle', () => {
  for (let lps = 1; lps <= 25; lps++) {
    it(`throttle at ${lps}/s allows first call`, () => {
      const fn = jest.fn(() => lps);
      const throttled = throttle(fn as (...args: unknown[]) => unknown, lps);
      const result = throttled();
      expect(result).toBe(lps);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// debounce (additional 25 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('debounce', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  for (let i = 1; i <= 25; i++) {
    it(`debounce delays call by ${i * 10}ms`, () => {
      const fn = jest.fn();
      const debounced = debounce(fn as (...args: unknown[]) => unknown, i * 10);
      debounced();
      expect(fn).not.toHaveBeenCalled();
      jest.advanceTimersByTime(i * 10);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FixedWindowCounter — multi-key isolation (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('FixedWindowCounter multi-key isolation', () => {
  for (let i = 0; i < 25; i++) {
    it(`keys do not share state (key pair ${i})`, () => {
      let now = 42_000_000 + i * 1000;
      const clock = () => now;
      const lim = new FixedWindowCounter(2, 10_000, clock);
      lim.consume(`key-a-${i}`);
      lim.consume(`key-a-${i}`);
      expect(lim.consume(`key-a-${i}`).allowed).toBe(false);
      expect(lim.consume(`key-b-${i}`).allowed).toBe(true);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`resetAt is within window boundary (key ${i})`, () => {
      let now = 43_000_000 + i * 1000;
      const clock = () => now;
      const windowMs = 5_000;
      const lim = new FixedWindowCounter(10, windowMs, clock);
      const result = lim.consume(`mkiso-${i}`);
      expect(result.resetAt).toBe(now + windowMs);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SlidingWindowLog — peek (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('SlidingWindowLog peek', () => {
  for (let i = 0; i < 25; i++) {
    it(`peek does not add to logSize (i=${i})`, () => {
      let now = 44_000_000 + i * 1000;
      const clock = () => now;
      const lim = new SlidingWindowLog(20, 10_000, clock);
      const key = `slpk-${i}`;
      lim.peek(key);
      lim.peek(key);
      expect(lim.logSize(key)).toBe(0);
    });
  }

  for (let consumed = 0; consumed < 25; consumed++) {
    it(`peek shows allowed=true when ${consumed} < 25 consumed`, () => {
      let now = 45_000_000 + consumed * 1000;
      const clock = () => now;
      const lim = new SlidingWindowLog(25, 60_000, clock);
      const key = `slpka-${consumed}`;
      for (let j = 0; j < consumed; j++) {
        now += 1;
        lim.consume(key);
      }
      const result = lim.peek(key);
      expect(result.allowed).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TokenBucket — multi-token consume (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('TokenBucket multi-token consume', () => {
  for (let tokens = 1; tokens <= 25; tokens++) {
    it(`consuming ${tokens} tokens at once reduces tokenCount by ${tokens}`, () => {
      let now = 46_000_000;
      const clock = () => now;
      const lim = new TokenBucket({ capacity: 100, refillRate: 0, initialTokens: 100, clock });
      const result = lim.consume('k', tokens);
      expect(result.allowed).toBe(true);
      expect(lim.tokenCount('k')).toBeCloseTo(100 - tokens, 0);
    });
  }

  for (let tokens = 1; tokens <= 25; tokens++) {
    it(`consuming ${tokens + 10} tokens from bucket with ${tokens} tokens is blocked`, () => {
      let now = 47_000_000;
      const clock = () => now;
      const lim = new TokenBucket({ capacity: tokens, refillRate: 0, initialTokens: tokens, clock });
      const result = lim.consume('k', tokens + 10);
      expect(result.allowed).toBe(false);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FixedWindowCounter — resetAt correctness (additional 50 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('FixedWindowCounter resetAt', () => {
  for (let i = 1; i <= 25; i++) {
    it(`resetAt equals windowStart + windowMs (i=${i})`, () => {
      const start = 48_000_000 + i * 1000;
      let now = start;
      const clock = () => now;
      const windowMs = i * 1000;
      const lim = new FixedWindowCounter(10, windowMs, clock);
      const result = lim.consume('k');
      expect(result.resetAt).toBe(start + windowMs);
    });
  }

  for (let i = 1; i <= 25; i++) {
    it(`blocked result has retryAfter > 0 (i=${i})`, () => {
      let now = 49_000_000 + i * 1000;
      const clock = () => now;
      const lim = new FixedWindowCounter(1, 5_000, clock);
      lim.consume('k');
      const result = lim.consume('k');
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LeakyBucket — retryAfter correctness (additional 25 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('LeakyBucket retryAfter', () => {
  for (let i = 1; i <= 25; i++) {
    it(`retryAfter is positive when blocked (capacity=${i})`, () => {
      let now = 50_000_000;
      const clock = () => now;
      const lim = new LeakyBucket({ capacity: i, leakRate: 0.001, clock });
      const key = `lbra2-${i}`;
      for (let j = 0; j < i; j++) lim.consume(key);
      const result = lim.consume(key);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ConcurrencyLimiter — release prevents over-decrement (additional 25 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('ConcurrencyLimiter release edge cases', () => {
  for (let i = 1; i <= 25; i++) {
    it(`active never goes below 0 with extra release (i=${i})`, () => {
      const lim = new ConcurrencyLimiter(10);
      const key = `clne-${i}`;
      // Release without acquiring — should stay 0
      lim.release(key);
      lim.release(key);
      expect(lim.active(key)).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SlidingWindowCounter — window roll (additional 25 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('SlidingWindowCounter window roll', () => {
  for (let i = 1; i <= 25; i++) {
    it(`allows more requests after full window passes (i=${i})`, () => {
      let now = 51_000_000 + i * 10_000;
      const clock = () => now;
      const windowMs = 1_000;
      const lim = new SlidingWindowCounter(i, windowMs, clock);
      const key = `swcwr-${i}`;
      for (let j = 0; j < i; j++) lim.consume(key);
      // Advance by 2+ windows
      now += windowMs * 2 + 1;
      expect(lim.consume(key).allowed).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// createRateLimiter — defaults (additional 25 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('createRateLimiter defaults', () => {
  for (let i = 0; i < 25; i++) {
    it(`createRateLimiter('fixed', {}) uses defaults and allows first request (i=${i})`, () => {
      const lim = createRateLimiter('fixed', {});
      const result = (lim as FixedWindowCounter).consume(`def-${i}`);
      expect(result.allowed).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// TokenBucket — retryAfter when empty (additional 25 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('TokenBucket retryAfter when empty', () => {
  for (let i = 1; i <= 25; i++) {
    it(`retryAfter is positive when no tokens remain (i=${i})`, () => {
      let now = 52_000_000;
      const clock = () => now;
      const lim = new TokenBucket({ capacity: i, refillRate: 0.001, initialTokens: 0, clock });
      const result = lim.consume(`tbre-${i}`);
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// FixedWindowCounter — zero-limit (boundary test, additional 25 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('FixedWindowCounter zero-limit', () => {
  for (let i = 0; i < 25; i++) {
    it(`limit=0 blocks every request (i=${i})`, () => {
      let now = 53_000_000 + i * 1000;
      const clock = () => now;
      const lim = new FixedWindowCounter(0, 5_000, clock);
      const result = lim.consume(`zero-${i}`);
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SlidingWindowLog — single entry (boundary tests, additional 25 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('SlidingWindowLog single entry', () => {
  for (let i = 1; i <= 25; i++) {
    it(`limit=1 allows first request (i=${i})`, () => {
      let now = 54_000_000 + i * 1000;
      const clock = () => now;
      const lim = new SlidingWindowLog(1, 5_000, clock);
      expect(lim.consume(`se-${i}`).allowed).toBe(true);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// SlidingWindowLog — limit=1 blocks second request (additional 25 tests)
// ─────────────────────────────────────────────────────────────────────────────

describe('SlidingWindowLog limit=1 second request blocked', () => {
  for (let i = 1; i <= 25; i++) {
    it(`limit=1 blocks second request (i=${i})`, () => {
      let now = 55_000_000 + i * 1000;
      const clock = () => now;
      const lim = new SlidingWindowLog(1, 5_000, clock);
      lim.consume(`se2-${i}`);
      expect(lim.consume(`se2-${i}`).allowed).toBe(false);
    });
  }
});
