import type { Request, Response } from 'express';
import {
  createPerUserRateLimit,
  InMemoryUserRateLimitStore,
  TIER_DEFAULTS,
  type UserTier,
} from '../src/middleware/per-user-rate-limit';

// ── Helpers ────────────────────────────────────────────────────────────────

function mockReq(userId?: string, tier?: UserTier): Request {
  return {
    user: userId ? { id: userId, tier: tier ?? 'standard' } : undefined,
    ip: '127.0.0.1',
    socket: { remoteAddress: '127.0.0.1' },
  } as unknown as Request;
}

function mockRes(): Response & { statusCode: number; body: unknown; headers: Record<string, unknown> } {
  const headers: Record<string, unknown> = {};
  const res = {
    statusCode: 200,
    body: null as unknown,
    headers,
    setHeader: jest.fn((k: string, v: unknown) => { headers[k] = v; }),
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockImplementation(function(this: Response, b: unknown) { (res as { body: unknown }).body = b; }),
  };
  res.status.mockImplementation((code: number) => {
    res.statusCode = code;
    return res;
  });
  return res as unknown as Response & { statusCode: number; body: unknown; headers: Record<string, unknown> };
}

function next(): jest.Mock { return jest.fn(); }

// ── Tests ──────────────────────────────────────────────────────────────────

describe('InMemoryUserRateLimitStore', () => {
  let store: InMemoryUserRateLimitStore;

  beforeEach(() => { store = new InMemoryUserRateLimitStore(999_999); });
  afterEach(() => { store.destroy(); });

  it('starts empty', () => {
    expect(store.size).toBe(0);
  });

  it('increment() creates a new entry', () => {
    const entry = store.increment('user:1', 60_000);
    expect(entry.count).toBe(1);
    expect(entry.resetAt).toBeGreaterThan(Date.now());
  });

  it('increment() accumulates within same window', () => {
    store.increment('user:1', 60_000);
    const entry = store.increment('user:1', 60_000);
    expect(entry.count).toBe(2);
  });

  it('increment() resets after window expires', () => {
    // Create entry with 1ms window so it expires immediately
    store.increment('user:1', 1);
    // Wait for expiry
    jest.useFakeTimers();
    jest.advanceTimersByTime(10);
    const entry = store.increment('user:1', 60_000);
    expect(entry.count).toBe(1);
    jest.useRealTimers();
  });

  it('get() returns undefined for unknown key', () => {
    expect(store.get('user:unknown')).toBeUndefined();
  });

  it('reset() removes an entry', () => {
    store.increment('user:1', 60_000);
    store.reset('user:1');
    expect(store.get('user:1')).toBeUndefined();
  });

  it('evictExpired() cleans up stale entries', () => {
    jest.useFakeTimers();
    store.increment('user:1', 1); // 1ms window
    jest.advanceTimersByTime(50);
    store.evictExpired();
    expect(store.size).toBe(0);
    jest.useRealTimers();
  });
});

describe('TIER_DEFAULTS', () => {
  it('enterprise has Infinity maxRequests', () => {
    expect(TIER_DEFAULTS.enterprise.maxRequests).toBe(Infinity);
  });

  it('premium allows more than standard', () => {
    expect(TIER_DEFAULTS.premium.maxRequests).toBeGreaterThan(TIER_DEFAULTS.standard.maxRequests);
  });

  it('standard allows more than basic', () => {
    expect(TIER_DEFAULTS.standard.maxRequests).toBeGreaterThan(TIER_DEFAULTS.basic.maxRequests);
  });
});

describe('createPerUserRateLimit()', () => {
  let store: InMemoryUserRateLimitStore;

  beforeEach(() => { store = new InMemoryUserRateLimitStore(999_999); });
  afterEach(() => { store.destroy(); });

  it('calls next() for unauthenticated requests', () => {
    const mw = createPerUserRateLimit({}, store);
    const req = mockReq();  // no userId
    const res = mockRes();
    const n = next();
    mw(req, res, n);
    expect(n).toHaveBeenCalled();
  });

  it('calls next() for enterprise tier (unlimited)', () => {
    const mw = createPerUserRateLimit({}, store);
    const req = mockReq('user1', 'enterprise');
    const res = mockRes();
    const n = next();
    mw(req, res, n);
    expect(n).toHaveBeenCalled();
  });

  it('calls next() on first request under limit', () => {
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 10, windowMs: 60_000 } } },
      store
    );
    const req = mockReq('user1', 'standard');
    const res = mockRes();
    const n = next();
    mw(req, res, n);
    expect(n).toHaveBeenCalled();
  });

  it('sets X-RateLimit headers on each request', () => {
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 100, windowMs: 60_000 } } },
      store
    );
    const req = mockReq('user1', 'standard');
    const res = mockRes();
    mw(req, res, next());
    expect(res.headers['X-RateLimit-Limit']).toBe(100);
    expect(res.headers['X-RateLimit-Remaining']).toBe(99);
    expect(res.headers['X-RateLimit-Reset']).toBeDefined();
  });

  it('returns 429 when limit is exceeded', () => {
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 2, windowMs: 60_000 } } },
      store
    );
    const req = mockReq('user1', 'standard');
    // Consume limit
    mw(req, mockRes(), next());
    mw(req, mockRes(), next());
    // This should be blocked
    const res = mockRes();
    const n = next();
    mw(req, res, n);
    expect(res.statusCode).toBe(429);
    expect(n).not.toHaveBeenCalled();
  });

  it('429 response includes USER_RATE_LIMIT_EXCEEDED code', () => {
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 1, windowMs: 60_000 } } },
      store
    );
    const req = mockReq('user1', 'standard');
    mw(req, mockRes(), next()); // consume
    const res = mockRes();
    mw(req, res, next());
    expect((res.body as { error: { code: string } }).error.code).toBe('USER_RATE_LIMIT_EXCEEDED');
  });

  it('sets Retry-After header on 429', () => {
    const mw = createPerUserRateLimit(
      { tiers: { basic: { maxRequests: 1, windowMs: 60_000 } } },
      store
    );
    const req = mockReq('user1', 'basic');
    mw(req, mockRes(), next()); // consume
    const res = mockRes();
    mw(req, res, next());
    expect(res.headers['Retry-After']).toBeDefined();
  });

  it('different users have independent counters', () => {
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 2, windowMs: 60_000 } } },
      store
    );
    const req1 = mockReq('user1', 'standard');
    const req2 = mockReq('user2', 'standard');
    mw(req1, mockRes(), next()); mw(req1, mockRes(), next()); // user1 at limit
    const n = next();
    mw(req2, mockRes(), n); // user2 first request — should pass
    expect(n).toHaveBeenCalled();
  });

  it('calls onLimitReached callback with userId and tier', () => {
    const onLimitReached = jest.fn();
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 1, windowMs: 60_000 } }, onLimitReached },
      store
    );
    const req = mockReq('user99', 'standard');
    mw(req, mockRes(), next()); // consume
    mw(req, mockRes(), next()); // trigger
    expect(onLimitReached).toHaveBeenCalledWith('user99', 'standard');
  });

  it('skips when skip() returns true', () => {
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 1, windowMs: 60_000 } }, skip: () => true },
      store
    );
    const req = mockReq('user1', 'standard');
    mw(req, mockRes(), next()); // consume
    const n = next();
    mw(req, mockRes(), n); // should not block
    expect(n).toHaveBeenCalled();
  });

  it('skips when RATE_LIMIT_ENABLED=false', () => {
    process.env.RATE_LIMIT_ENABLED = 'false';
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 1, windowMs: 60_000 } } },
      store
    );
    const req = mockReq('user1', 'standard');
    mw(req, mockRes(), next()); // consume
    const n = next();
    mw(req, mockRes(), n);
    expect(n).toHaveBeenCalled();
    delete process.env.RATE_LIMIT_ENABLED;
  });

  it('custom getUserId extracts from non-standard field', () => {
    const mw = createPerUserRateLimit(
      {
        getUserId: (req) => (req as unknown as { apiKey?: string }).apiKey,
        tiers: { standard: { maxRequests: 2, windowMs: 60_000 } },
      },
      store
    );
    const req = { apiKey: 'key-123', user: undefined, ip: '1.2.3.4', socket: {} } as unknown as Request;
    const n = next();
    mw(req, mockRes(), n);
    expect(n).toHaveBeenCalled();
  });

  it('X-RateLimit-Remaining decreases with each request', () => {
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 5, windowMs: 60_000 } } },
      store
    );
    const req = mockReq('user1', 'standard');
    const res1 = mockRes(); mw(req, res1, next());
    const res2 = mockRes(); mw(req, res2, next());
    expect(res1.headers['X-RateLimit-Remaining']).toBe(4);
    expect(res2.headers['X-RateLimit-Remaining']).toBe(3);
  });
});

// ── Additional coverage ─────────────────────────────────────────────────────

describe('createPerUserRateLimit() — additional coverage', () => {
  let store: InMemoryUserRateLimitStore;

  beforeEach(() => { store = new InMemoryUserRateLimitStore(999_999); });
  afterEach(() => { store.destroy(); });

  it('basic tier is blocked after its own limit is reached', () => {
    const mw = createPerUserRateLimit(
      { tiers: { basic: { maxRequests: 1, windowMs: 60_000 } } },
      store
    );
    const req = mockReq('userB', 'basic');
    mw(req, mockRes(), next()); // consume
    const res = mockRes();
    const n = next();
    mw(req, res, n);
    expect(res.statusCode).toBe(429);
    expect(n).not.toHaveBeenCalled();
  });

  it('premium tier is blocked after its own limit is reached', () => {
    const mw = createPerUserRateLimit(
      { tiers: { premium: { maxRequests: 1, windowMs: 60_000 } } },
      store
    );
    const req = mockReq('userP', 'premium');
    mw(req, mockRes(), next()); // consume
    const res = mockRes();
    const n = next();
    mw(req, res, n);
    expect(res.statusCode).toBe(429);
    expect(n).not.toHaveBeenCalled();
  });

  it('X-RateLimit-Remaining is 0 when limit is exactly exhausted', () => {
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 3, windowMs: 60_000 } } },
      store
    );
    const req = mockReq('user1', 'standard');
    mw(req, mockRes(), next());
    mw(req, mockRes(), next());
    const res = mockRes(); mw(req, res, next());
    expect(res.headers['X-RateLimit-Remaining']).toBe(0);
  });

  it('store.size grows with each new user key', () => {
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 10, windowMs: 60_000 } } },
      store
    );
    mw(mockReq('a', 'standard'), mockRes(), next());
    mw(mockReq('b', 'standard'), mockRes(), next());
    mw(mockReq('c', 'standard'), mockRes(), next());
    expect(store.size).toBe(3);
  });

  it('reset() allows a previously-blocked user to pass again', () => {
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 1, windowMs: 60_000 } } },
      store
    );
    const req = mockReq('user1', 'standard');
    mw(req, mockRes(), next()); // consume
    store.reset('user:user1');   // internal key format is "user:<id>"
    const n = next();
    mw(req, mockRes(), n);
    expect(n).toHaveBeenCalled();
  });

  it('onLimitReached is NOT called before the limit is hit', () => {
    const onLimitReached = jest.fn();
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 3, windowMs: 60_000 } }, onLimitReached },
      store
    );
    const req = mockReq('user1', 'standard');
    mw(req, mockRes(), next());
    mw(req, mockRes(), next());
    // still under limit — callback must NOT have fired
    expect(onLimitReached).not.toHaveBeenCalled();
  });

  it('skip() returning false still enforces the limit', () => {
    const mw = createPerUserRateLimit(
      { tiers: { standard: { maxRequests: 1, windowMs: 60_000 } }, skip: () => false },
      store
    );
    const req = mockReq('user1', 'standard');
    mw(req, mockRes(), next()); // consume
    const res = mockRes();
    mw(req, res, next());
    expect(res.statusCode).toBe(429);
  });
});
