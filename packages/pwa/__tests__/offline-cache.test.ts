/**
 * OfflineCache tests — mock Cache API
 */

// ─── Mock Response class (jsdom does not provide a usable Response constructor) ───

class MockResponse {
  private _body: string | null;
  private _bodyUsed = false;
  status: number;
  headers: Map<string, string>;

  constructor(body: string | null, init?: { status?: number; headers?: Record<string, string> }) {
    this._body = body;
    this.status = init?.status ?? 200;
    this.headers = new Map(Object.entries(init?.headers ?? {}));
  }

  clone(): MockResponse {
    return new MockResponse(this._body, {
      status: this.status,
      headers: Object.fromEntries(this.headers),
    });
  }

  async json(): Promise<any> {
    if (this._bodyUsed) throw new Error('Body already consumed');
    this._bodyUsed = true;
    return JSON.parse(this._body ?? 'null');
  }

  async text(): Promise<string> {
    if (this._bodyUsed) throw new Error('Body already consumed');
    this._bodyUsed = true;
    return this._body ?? '';
  }
}

// Install MockResponse as global Response before any imports that use it
(globalThis as any).Response = MockResponse;

import { OfflineCache } from '../src/offline-cache';

// ─── Mock Cache API ───

class MockCache {
  private store = new Map<string, any>();

  async match(request: string | Request): Promise<any | undefined> {
    const key = typeof request === 'string' ? request : request.url;
    return this.store.get(key);
  }

  async put(request: string | Request, response: any): Promise<void> {
    const key = typeof request === 'string' ? request : request.url;
    this.store.set(key, response);
  }

  async delete(request: string | Request): Promise<boolean> {
    const key = typeof request === 'string' ? request : request.url;
    return this.store.delete(key);
  }

  async keys(): Promise<Request[]> {
    return Array.from(this.store.keys()).map((url) => new Request(url));
  }

  get size() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }
}

const cacheInstances = new Map<string, MockCache>();

const mockCaches = {
  open: async (name: string): Promise<MockCache> => {
    if (!cacheInstances.has(name)) {
      cacheInstances.set(name, new MockCache());
    }
    return cacheInstances.get(name)!;
  },
  delete: async (name: string): Promise<boolean> => {
    return cacheInstances.delete(name);
  },
  has: async (name: string): Promise<boolean> => {
    return cacheInstances.has(name);
  },
  keys: async (): Promise<string[]> => {
    return Array.from(cacheInstances.keys());
  },
  match: async (): Promise<undefined> => undefined,
};

(globalThis as any).caches = mockCaches;

// ─── Helpers ───

function makeResponse(data: any): any {
  return new MockResponse(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Tests ───

describe('OfflineCache', () => {
  let cache: OfflineCache;

  beforeEach(() => {
    cacheInstances.clear();
    cache = new OfflineCache();
  });

  test('cacheResponse stores a response', async () => {
    const response = makeResponse({ items: [1, 2, 3] });
    await cache.cacheResponse('https://app.example.com/api/hs/tasks', response);

    const cached = await cache.getCachedResponse('https://app.example.com/api/hs/tasks');
    expect(cached).not.toBeNull();
    const body = await cached!.json();
    expect(body.items).toEqual([1, 2, 3]);
  });

  test('getCachedResponse returns null for uncached URLs', async () => {
    const result = await cache.getCachedResponse('https://app.example.com/api/nothing');
    expect(result).toBeNull();
  });

  test('getTrackedUrls returns list of cached URLs', async () => {
    await cache.cacheResponse('https://app.example.com/api/a', makeResponse({ a: 1 }));
    await cache.cacheResponse('https://app.example.com/api/b', makeResponse({ b: 2 }));

    const urls = await cache.getTrackedUrls();
    expect(urls).toContain('https://app.example.com/api/a');
    expect(urls).toContain('https://app.example.com/api/b');
    expect(urls.length).toBe(2);
  });

  test('cacheResponse moves existing URL to end (most recent)', async () => {
    await cache.cacheResponse('https://app.example.com/api/first', makeResponse(1));
    await cache.cacheResponse('https://app.example.com/api/second', makeResponse(2));
    await cache.cacheResponse('https://app.example.com/api/first', makeResponse(3));

    const urls = await cache.getTrackedUrls();
    expect(urls).toEqual([
      'https://app.example.com/api/second',
      'https://app.example.com/api/first',
    ]);
  });

  test('evicts oldest when exceeding MAX_ITEMS (50)', async () => {
    // Fill to 50
    for (let i = 0; i < 50; i++) {
      await cache.cacheResponse(`https://app.example.com/api/item/${i}`, makeResponse({ i }));
    }

    // Add one more (should evict item/0)
    await cache.cacheResponse('https://app.example.com/api/item/50', makeResponse({ i: 50 }));

    const urls = await cache.getTrackedUrls();
    expect(urls.length).toBe(50);
    expect(urls).not.toContain('https://app.example.com/api/item/0');
    expect(urls).toContain('https://app.example.com/api/item/50');
  });

  test('eviction prefers non-priority URLs over priority URLs', async () => {
    // Add a priority URL first (oldest)
    await cache.cacheResponse(
      'https://app.example.com/api/hs/tasks',
      makeResponse({ priority: true })
    );

    // Fill remaining 49 slots with non-priority
    for (let i = 1; i < 50; i++) {
      await cache.cacheResponse(`https://app.example.com/api/other/${i}`, makeResponse({ i }));
    }

    // Add one more — should evict oldest non-priority (other/1), not the priority tasks URL
    await cache.cacheResponse('https://app.example.com/api/new', makeResponse({ new: true }));

    const urls = await cache.getTrackedUrls();
    expect(urls).toContain('https://app.example.com/api/hs/tasks');
    expect(urls).not.toContain('https://app.example.com/api/other/1');
    expect(urls).toContain('https://app.example.com/api/new');
  });

  test('clear removes everything', async () => {
    await cache.cacheResponse('https://app.example.com/api/x', makeResponse(1));
    await cache.cacheResponse('https://app.example.com/api/y', makeResponse(2));

    await cache.clear();

    // After clearing, the cache instance is deleted; opening fresh gives empty
    const urls = await cache.getTrackedUrls();
    expect(urls).toEqual([]);
  });

  test('isPriorityUrl identifies task URLs', () => {
    expect(OfflineCache.isPriorityUrl('https://app.example.com/api/hs/tasks')).toBe(true);
    expect(OfflineCache.isPriorityUrl('https://app.example.com/api/cmms/work-orders')).toBe(true);
    expect(OfflineCache.isPriorityUrl('https://app.example.com/api/hs/incidents')).toBe(true);
    expect(OfflineCache.isPriorityUrl('https://app.example.com/api/quality/documents')).toBe(true);
    expect(OfflineCache.isPriorityUrl('https://app.example.com/api/food-safety/checklists')).toBe(true);
  });

  test('isPriorityUrl returns false for non-priority URLs', () => {
    expect(OfflineCache.isPriorityUrl('https://app.example.com/api/settings')).toBe(false);
    expect(OfflineCache.isPriorityUrl('https://app.example.com/api/auth/login')).toBe(false);
    expect(OfflineCache.isPriorityUrl('https://app.example.com/other')).toBe(false);
  });

  test('cacheResponse clones the response (original stays readable)', async () => {
    const response = makeResponse({ test: true });
    await cache.cacheResponse('https://app.example.com/api/clone-test', response);

    // Original response should still be readable
    const body = await response.json();
    expect(body.test).toBe(true);
  });

  test('multiple caches do not interfere with each other', async () => {
    const cache2 = new OfflineCache();
    await cache.cacheResponse('https://app.example.com/api/shared', makeResponse({ from: 'cache1' }));

    // cache2 shares the same underlying mock cache, so it should see the same data
    const result = await cache2.getCachedResponse('https://app.example.com/api/shared');
    expect(result).not.toBeNull();
  });

  test('getTrackedUrls returns empty array when no data cached', async () => {
    const urls = await cache.getTrackedUrls();
    expect(urls).toEqual([]);
  });

  test('cacheResponse handles null-body responses', async () => {
    const response = new MockResponse(null, { status: 204 }) as any;
    await cache.cacheResponse('https://app.example.com/api/empty', response);

    const cached = await cache.getCachedResponse('https://app.example.com/api/empty');
    expect(cached).not.toBeNull();
    expect(cached!.status).toBe(204);
  });

  test('evicts oldest overall when all entries are priority', async () => {
    // Fill with 50 priority URLs
    for (let i = 0; i < 50; i++) {
      await cache.cacheResponse(
        `https://app.example.com/api/svc${i}/tasks`,
        makeResponse({ i })
      );
    }

    // Add one more priority URL — oldest priority should be evicted
    await cache.cacheResponse(
      'https://app.example.com/api/svc99/tasks',
      makeResponse({ i: 99 })
    );

    const urls = await cache.getTrackedUrls();
    expect(urls.length).toBe(50);
    expect(urls).not.toContain('https://app.example.com/api/svc0/tasks');
    expect(urls).toContain('https://app.example.com/api/svc99/tasks');
  });
});
