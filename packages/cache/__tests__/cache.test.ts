/**
 * @ims/cache — unit tests
 *
 * We test two modes:
 * 1. Cache disabled (enabled: false) — all ops are no-ops / return null
 * 2. Cache enabled with a mocked ioredis client
 */

// Mock ioredis BEFORE importing the cache module
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockSetex = jest.fn();
const mockDel = jest.fn();
const mockExists = jest.fn();
const mockScan = jest.fn();
const mockQuit = jest.fn();
const mockOn = jest.fn();

class MockRedis {
  get = mockGet;
  set = mockSet;
  setex = mockSetex;
  del = mockDel;
  exists = mockExists;
  scan = mockScan;
  quit = mockQuit;
  on = mockOn;
}

jest.mock('ioredis', () => MockRedis);

import {
  initCache,
  cacheGet,
  cacheSet,
  cacheDel,
  cacheHas,
  cacheInvalidate,
  cacheGetOrSet,
  closeCache,
  getRedisClient,
} from '../src/index';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resetMocks() {
  mockGet.mockReset();
  mockSet.mockReset();
  mockSetex.mockReset();
  mockDel.mockReset();
  mockExists.mockReset();
  mockScan.mockReset();
  mockQuit.mockReset();
}

// ─── Disabled cache ───────────────────────────────────────────────────────────

describe('Cache disabled (enabled: false)', () => {
  beforeAll(async () => {
    await closeCache();
    initCache({ enabled: false });
  });

  afterAll(async () => {
    await closeCache();
  });

  it('getRedisClient returns null when disabled', () => {
    expect(getRedisClient()).toBeNull();
  });

  it('cacheGet returns null on every key', async () => {
    expect(await cacheGet('any-key')).toBeNull();
  });

  it('cacheSet is a no-op (no ioredis calls)', async () => {
    await cacheSet('key', { value: 42 });
    expect(mockSetex).not.toHaveBeenCalled();
    expect(mockSet).not.toHaveBeenCalled();
  });

  it('cacheDel is a no-op', async () => {
    await cacheDel('key');
    expect(mockDel).not.toHaveBeenCalled();
  });

  it('cacheHas returns false', async () => {
    expect(await cacheHas('key')).toBe(false);
  });

  it('cacheInvalidate returns 0', async () => {
    expect(await cacheInvalidate('pattern:*')).toBe(0);
  });

  it('cacheGetOrSet always calls the factory and returns its result', async () => {
    const factory = jest.fn().mockResolvedValue({ from: 'factory' });
    const result = await cacheGetOrSet('my-key', factory);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ from: 'factory' });
  });
});

// ─── Enabled cache with mocked Redis ─────────────────────────────────────────

describe('Cache enabled (mocked Redis)', () => {
  beforeAll(async () => {
    await closeCache();
    initCache({ url: 'redis://localhost:6379', prefix: 'test', defaultTtl: 60 });
  });

  beforeEach(() => resetMocks());

  afterAll(async () => {
    mockQuit.mockResolvedValue('OK');
    await closeCache();
  });

  it('getRedisClient returns the mock Redis instance', () => {
    expect(getRedisClient()).toBeInstanceOf(MockRedis);
  });

  // cacheGet
  it('cacheGet returns parsed value on cache hit', async () => {
    mockGet.mockResolvedValue(JSON.stringify({ x: 1 }));
    const result = await cacheGet<{ x: number }>('my-key');
    expect(result).toEqual({ x: 1 });
    expect(mockGet).toHaveBeenCalledWith('test:my-key');
  });

  it('cacheGet returns null on cache miss (Redis returns null)', async () => {
    mockGet.mockResolvedValue(null);
    expect(await cacheGet('missing')).toBeNull();
  });

  it('cacheGet returns null when Redis throws', async () => {
    mockGet.mockRejectedValue(new Error('connection lost'));
    expect(await cacheGet('any')).toBeNull();
  });

  // cacheSet
  it('cacheSet uses setex when TTL > 0', async () => {
    mockSetex.mockResolvedValue('OK');
    await cacheSet('user:1', { name: 'Alice' }, { ttl: 300 });
    expect(mockSetex).toHaveBeenCalledWith('test:user:1', 300, JSON.stringify({ name: 'Alice' }));
  });

  it('cacheSet uses set when TTL = 0', async () => {
    mockSet.mockResolvedValue('OK');
    await cacheSet('perm-key', 'value', { ttl: 0 });
    expect(mockSet).toHaveBeenCalledWith('test:perm-key', JSON.stringify('value'));
  });

  it('cacheSet uses defaultTtl when no options passed', async () => {
    mockSetex.mockResolvedValue('OK');
    await cacheSet('key', 'val');
    expect(mockSetex).toHaveBeenCalledWith('test:key', 60, JSON.stringify('val'));
  });

  it('cacheSet silently degrades when Redis throws', async () => {
    mockSetex.mockRejectedValue(new Error('connection lost'));
    await expect(cacheSet('key', 'val')).resolves.toBeUndefined();
  });

  // cacheDel
  it('cacheDel calls del with prefixed key', async () => {
    mockDel.mockResolvedValue(1);
    await cacheDel('user:99');
    expect(mockDel).toHaveBeenCalledWith('test:user:99');
  });

  it('cacheDel silently degrades when Redis throws', async () => {
    mockDel.mockRejectedValue(new Error('err'));
    await expect(cacheDel('key')).resolves.toBeUndefined();
  });

  // cacheHas
  it('cacheHas returns true when key exists', async () => {
    mockExists.mockResolvedValue(1);
    expect(await cacheHas('key')).toBe(true);
    expect(mockExists).toHaveBeenCalledWith('test:key');
  });

  it('cacheHas returns false when key does not exist', async () => {
    mockExists.mockResolvedValue(0);
    expect(await cacheHas('missing')).toBe(false);
  });

  it('cacheHas returns false when Redis throws', async () => {
    mockExists.mockRejectedValue(new Error('err'));
    expect(await cacheHas('key')).toBe(false);
  });

  // cacheInvalidate
  it('cacheInvalidate scans and deletes matching keys', async () => {
    // Single SCAN iteration — cursor 0 → '0' (done)
    mockScan.mockResolvedValueOnce(['0', ['test:users:1', 'test:users:2']]);
    mockDel.mockResolvedValue(2);

    const count = await cacheInvalidate('users:*');
    expect(count).toBe(2);
    expect(mockScan).toHaveBeenCalledWith('0', 'MATCH', 'test:users:*', 'COUNT', 100);
    expect(mockDel).toHaveBeenCalledWith('test:users:1', 'test:users:2');
  });

  it('cacheInvalidate handles multiple SCAN pages', async () => {
    mockScan
      .mockResolvedValueOnce(['cursor1', ['test:a:1']])
      .mockResolvedValueOnce(['0', ['test:a:2', 'test:a:3']]);
    mockDel.mockResolvedValue(1);

    const count = await cacheInvalidate('a:*');
    expect(count).toBe(3);
    expect(mockScan).toHaveBeenCalledTimes(2);
  });

  it('cacheInvalidate returns 0 when no keys match', async () => {
    mockScan.mockResolvedValueOnce(['0', []]);
    const count = await cacheInvalidate('nonexistent:*');
    expect(count).toBe(0);
    expect(mockDel).not.toHaveBeenCalled();
  });

  it('cacheInvalidate silently degrades when Redis throws', async () => {
    mockScan.mockRejectedValue(new Error('err'));
    expect(await cacheInvalidate('any:*')).toBe(0);
  });

  // cacheGetOrSet
  it('cacheGetOrSet returns cached value when present', async () => {
    mockGet.mockResolvedValue(JSON.stringify({ cached: true }));
    const factory = jest.fn();
    const result = await cacheGetOrSet('key', factory);
    expect(result).toEqual({ cached: true });
    expect(factory).not.toHaveBeenCalled();
  });

  it('cacheGetOrSet calls factory and caches when key is missing', async () => {
    mockGet.mockResolvedValue(null);
    mockSetex.mockResolvedValue('OK');
    const factory = jest.fn().mockResolvedValue({ fresh: true });

    const result = await cacheGetOrSet('key', factory, { ttl: 120 });
    expect(result).toEqual({ fresh: true });
    expect(factory).toHaveBeenCalledTimes(1);
    expect(mockSetex).toHaveBeenCalledWith('test:key', 120, JSON.stringify({ fresh: true }));
  });
});
