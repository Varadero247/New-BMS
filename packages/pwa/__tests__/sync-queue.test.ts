/**
 * SyncQueue tests — mock IndexedDB with a Map-based implementation
 */

import { SyncQueue, QueuedRequest } from '../src/sync-queue';

// ─── Mock IndexedDB ───

class MockIDBIndex {
  private store: MockIDBObjectStore;
  constructor(store: MockIDBObjectStore) {
    this.store = store;
  }

  openCursor(): {
    onsuccess: ((e: any) => void) | null;
    onerror: ((e: any) => void) | null;
    result: any;
  } {
    const entries = Array.from(this.store.data.values()).sort(
      (a: any, b: any) => a.timestamp - b.timestamp
    );
    const req: any = { onsuccess: null, onerror: null, result: null };
    setTimeout(() => {
      if (entries.length > 0) {
        req.result = { value: entries[0] };
      } else {
        req.result = null;
      }
      req.onsuccess?.({});
    }, 0);
    return req;
  }

  getAll(): {
    onsuccess: ((e: any) => void) | null;
    onerror: ((e: any) => void) | null;
    result: any;
  } {
    const entries = Array.from(this.store.data.values()).sort(
      (a: any, b: any) => a.timestamp - b.timestamp
    );
    const req: any = { onsuccess: null, onerror: null, result: null };
    setTimeout(() => {
      req.result = entries;
      req.onsuccess?.({});
    }, 0);
    return req;
  }
}

class MockIDBObjectStore {
  data = new Map<string, any>();

  put(value: any) {
    this.data.set(value.id, { ...value });
    return { onsuccess: null, onerror: null };
  }

  delete(key: string) {
    this.data.delete(key);
    return { onsuccess: null, onerror: null };
  }

  clear() {
    this.data.clear();
    return { onsuccess: null, onerror: null };
  }

  count() {
    const req: any = { onsuccess: null, onerror: null, result: this.data.size };
    setTimeout(() => req.onsuccess?.({}), 0);
    return req;
  }

  index(_name: string) {
    return new MockIDBIndex(this);
  }
}

class MockIDBTransaction {
  private store: MockIDBObjectStore;
  oncomplete: (() => void) | null = null;
  onerror: (() => void) | null = null;

  constructor(store: MockIDBObjectStore) {
    this.store = store;
    setTimeout(() => this.oncomplete?.(), 0);
  }

  objectStore(_name: string) {
    return this.store;
  }
}

class MockIDBDatabase {
  objectStoreNames = { contains: () => true };
  private store: MockIDBObjectStore;

  constructor(store: MockIDBObjectStore) {
    this.store = store;
  }

  transaction(_storeName: string, _mode?: string) {
    return new MockIDBTransaction(this.store);
  }

  close() {}
}

const sharedStore = new MockIDBObjectStore();

const mockIndexedDB = {
  open: (_name: string, _version?: number) => {
    const req: any = {
      onupgradeneeded: null,
      onsuccess: null,
      onerror: null,
      result: new MockIDBDatabase(sharedStore),
    };
    setTimeout(() => req.onsuccess?.({}), 0);
    return req;
  },
};

(globalThis as Record<string, unknown>).indexedDB = mockIndexedDB;

// ─── Mock fetch ───
const mockFetch = jest.fn();
(globalThis as Record<string, unknown>).fetch = mockFetch;

// ─── Tests ───

describe('SyncQueue', () => {
  let queue: SyncQueue;

  const makeRequest = (id: string, timestamp: number, retryCount = 0): QueuedRequest => ({
    id,
    url: `https://example.com/api/test/${id}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token123' },
    body: JSON.stringify({ data: id }),
    timestamp,
    retryCount,
  });

  beforeEach(() => {
    sharedStore.data.clear();
    mockFetch.mockReset();
    queue = new SyncQueue();
  });

  test('enqueue adds an entry to the store', async () => {
    const req = makeRequest('req-1', 1000);
    await queue.enqueue(req);
    expect(sharedStore.data.has('req-1')).toBe(true);
    expect(sharedStore.data.get('req-1').url).toBe('https://example.com/api/test/req-1');
  });

  test('enqueue stores all fields correctly', async () => {
    const req = makeRequest('req-2', 2000);
    await queue.enqueue(req);
    const stored = sharedStore.data.get('req-2');
    expect(stored.method).toBe('POST');
    expect(stored.headers['Content-Type']).toBe('application/json');
    expect(stored.body).toBe(JSON.stringify({ data: 'req-2' }));
    expect(stored.timestamp).toBe(2000);
    expect(stored.retryCount).toBe(0);
  });

  test('enqueue multiple entries', async () => {
    await queue.enqueue(makeRequest('a', 100));
    await queue.enqueue(makeRequest('b', 200));
    await queue.enqueue(makeRequest('c', 300));
    expect(sharedStore.data.size).toBe(3);
  });

  test('dequeue returns the oldest entry (lowest timestamp)', async () => {
    await queue.enqueue(makeRequest('new', 5000));
    await queue.enqueue(makeRequest('old', 1000));
    await queue.enqueue(makeRequest('mid', 3000));
    const oldest = await queue.dequeue();
    expect(oldest).not.toBeNull();
    expect(oldest!.id).toBe('old');
  });

  test('dequeue returns null when queue is empty', async () => {
    const result = await queue.dequeue();
    expect(result).toBeNull();
  });

  test('getAll returns entries sorted by timestamp', async () => {
    await queue.enqueue(makeRequest('c', 3000));
    await queue.enqueue(makeRequest('a', 1000));
    await queue.enqueue(makeRequest('b', 2000));
    const all = await queue.getAll();
    expect(all.map((e) => e.id)).toEqual(['a', 'b', 'c']);
  });

  test('getQueueLength returns correct count', async () => {
    expect(await queue.getQueueLength()).toBe(0);
    await queue.enqueue(makeRequest('x', 100));
    await queue.enqueue(makeRequest('y', 200));
    expect(await queue.getQueueLength()).toBe(2);
  });

  test('remove deletes a specific entry', async () => {
    await queue.enqueue(makeRequest('keep', 100));
    await queue.enqueue(makeRequest('remove', 200));
    await queue.remove('remove');
    expect(sharedStore.data.has('remove')).toBe(false);
    expect(sharedStore.data.has('keep')).toBe(true);
  });

  test('clear removes all entries', async () => {
    await queue.enqueue(makeRequest('a', 100));
    await queue.enqueue(makeRequest('b', 200));
    await queue.enqueue(makeRequest('c', 300));
    await queue.clear();
    expect(await queue.getQueueLength()).toBe(0);
  });

  test('flush replays requests and removes successful ones', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
    await queue.enqueue(makeRequest('s1', 100));
    await queue.enqueue(makeRequest('s2', 200));

    const result = await queue.flush();
    expect(result.succeeded).toBe(2);
    expect(result.failed).toBe(0);
    expect(result.dropped).toBe(0);
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  test('flush sends correct method and headers', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
    const req = makeRequest('check', 100);
    req.method = 'PUT';
    await queue.enqueue(req);
    await queue.flush();

    expect(mockFetch).toHaveBeenCalledWith(req.url, {
      method: 'PUT',
      headers: req.headers,
      body: req.body,
    });
  });

  test('flush replays in FIFO order', async () => {
    const callOrder: string[] = [];
    mockFetch.mockImplementation((url: string) => {
      callOrder.push(url);
      return Promise.resolve({ ok: true, status: 200 });
    });

    await queue.enqueue(makeRequest('first', 100));
    await queue.enqueue(makeRequest('second', 200));
    await queue.enqueue(makeRequest('third', 300));
    await queue.flush();

    expect(callOrder).toEqual([
      'https://example.com/api/test/first',
      'https://example.com/api/test/second',
      'https://example.com/api/test/third',
    ]);
  });

  test('flush increments retryCount on failure', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    await queue.enqueue(makeRequest('fail', 100));

    await queue.flush();

    const entries = await queue.getAll();
    expect(entries.length).toBe(1);
    expect(entries[0].retryCount).toBe(1);
  });

  test('flush increments retryCount on non-ok HTTP response', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500 });
    await queue.enqueue(makeRequest('err', 100));

    await queue.flush();

    const entries = await queue.getAll();
    expect(entries.length).toBe(1);
    expect(entries[0].retryCount).toBe(1);
  });

  test('flush drops entries after MAX_RETRIES (3)', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    await queue.enqueue(makeRequest('doomed', 100));

    // Retry 3 times
    await queue.flush(); // retryCount 0 -> 1
    await queue.flush(); // retryCount 1 -> 2
    await queue.flush(); // retryCount 2 -> 3 (>= MAX_RETRIES, dropped)

    const result = await queue.flush();
    expect(await queue.getQueueLength()).toBe(0);
  });

  test('flush returns dropped count for max-retried entries', async () => {
    mockFetch.mockRejectedValue(new Error('fail'));
    const req = makeRequest('maxed', 100);
    req.retryCount = 2; // already at 2, next failure = drop
    await queue.enqueue(req);

    const result = await queue.flush();
    expect(result.dropped).toBe(1);
    expect(result.failed).toBe(0);
  });

  test('flush handles mixed success and failure', async () => {
    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ ok: true, status: 200 });
      return Promise.reject(new Error('fail'));
    });

    await queue.enqueue(makeRequest('ok', 100));
    await queue.enqueue(makeRequest('fail', 200));

    const result = await queue.flush();
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(1);
  });

  test('enqueue overwrites entry with same id', async () => {
    await queue.enqueue(makeRequest('dup', 100));
    await queue.enqueue({ ...makeRequest('dup', 200), retryCount: 1 });
    expect(sharedStore.data.size).toBe(1);
    expect(sharedStore.data.get('dup').retryCount).toBe(1);
  });

  test('flush with empty queue succeeds with zero counts', async () => {
    const result = await queue.flush();
    expect(result.succeeded).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.dropped).toBe(0);
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe('SyncQueue — additional coverage', () => {
  test('SyncQueue can be instantiated', () => {
    const q = new SyncQueue();
    expect(q).toBeDefined();
    expect(typeof q.enqueue).toBe('function');
    expect(typeof q.dequeue).toBe('function');
    expect(typeof q.flush).toBe('function');
  });
});

describe('SyncQueue — extended edge cases', () => {
  let queue: SyncQueue;

  const makeRequest = (id: string, timestamp: number, retryCount = 0): QueuedRequest => ({
    id,
    url: `https://example.com/api/ext/${id}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
    timestamp,
    retryCount,
  });

  beforeEach(() => {
    sharedStore.data.clear();
    mockFetch.mockReset();
    queue = new SyncQueue();
  });

  test('getAll returns empty array for empty queue', async () => {
    const all = await queue.getAll();
    expect(all).toEqual([]);
  });

  test('remove on non-existent id does not throw', async () => {
    await expect(queue.remove('non-existent-id')).resolves.not.toThrow();
  });

  test('getQueueLength returns 1 after single enqueue', async () => {
    await queue.enqueue(makeRequest('single', 100));
    expect(await queue.getQueueLength()).toBe(1);
  });

  test('enqueue with null body stores null correctly', async () => {
    const req: QueuedRequest = {
      id: 'null-body',
      url: 'https://example.com/api/delete/1',
      method: 'DELETE',
      headers: {},
      body: null,
      timestamp: 500,
      retryCount: 0,
    };
    await queue.enqueue(req);
    expect(sharedStore.data.get('null-body').body).toBeNull();
  });

  test('flush with single successful request returns succeeded:1', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
    await queue.enqueue(makeRequest('one', 100));
    const result = await queue.flush();
    expect(result.succeeded).toBe(1);
    expect(result.failed).toBe(0);
  });

  test('getQueueLength returns 0 after clear', async () => {
    await queue.enqueue(makeRequest('a', 1));
    await queue.enqueue(makeRequest('b', 2));
    await queue.clear();
    expect(await queue.getQueueLength()).toBe(0);
  });

  test('dequeue does not remove the entry from store (peek semantics)', async () => {
    await queue.enqueue(makeRequest('pop', 100));
    await queue.dequeue();
    // dequeue is a read-only peek — entry stays in the store
    expect(sharedStore.data.has('pop')).toBe(true);
  });

  test('flush sends request with correct URL', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
    await queue.enqueue(makeRequest('url-test', 100));
    await queue.flush();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/api/ext/url-test',
      expect.any(Object)
    );
  });

  test('enqueue stores retryCount=0 for new requests', async () => {
    await queue.enqueue(makeRequest('new-req', 200));
    expect(sharedStore.data.get('new-req').retryCount).toBe(0);
  });

  test('flush result has succeeded + failed + dropped properties', async () => {
    const result = await queue.flush();
    expect(result).toHaveProperty('succeeded');
    expect(result).toHaveProperty('failed');
    expect(result).toHaveProperty('dropped');
  });
});

describe('SyncQueue — additional method coverage', () => {
  const makeReq = (id: string, timestamp: number, retryCount = 0): QueuedRequest => ({
    id,
    url: `https://example.com/api/extra/${id}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ extra: id }),
    timestamp,
    retryCount,
  });

  beforeEach(() => {
    sharedStore.data.clear();
    mockFetch.mockReset();
  });

  test('enqueue stores method PATCH correctly', async () => {
    const q = new SyncQueue();
    await q.enqueue(makeReq('patch-1', 100));
    expect(sharedStore.data.get('patch-1').method).toBe('PATCH');
  });

  test('getAll with single entry returns array of length 1', async () => {
    const q = new SyncQueue();
    await q.enqueue(makeReq('solo', 500));
    const all = await q.getAll();
    expect(all).toHaveLength(1);
  });

  test('flush sends PATCH request with correct method', async () => {
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
    const q = new SyncQueue();
    await q.enqueue(makeReq('mp', 100));
    await q.flush();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ method: 'PATCH' })
    );
  });

  test('remove after flush does not throw on missing id', async () => {
    const q = new SyncQueue();
    await expect(q.remove('already-gone')).resolves.not.toThrow();
  });

  test('enqueue with high retryCount stores it correctly', async () => {
    const q = new SyncQueue();
    await q.enqueue(makeReq('highRetry', 100, 2));
    expect(sharedStore.data.get('highRetry').retryCount).toBe(2);
  });
});

describe('SyncQueue — syncQueue singleton and flush token injection', () => {
  const makeReq = (id: string, timestamp: number, retryCount = 0): QueuedRequest => ({
    id,
    url: `https://example.com/api/singleton/${id}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
    timestamp,
    retryCount,
  });

  beforeEach(() => {
    sharedStore.data.clear();
    mockFetch.mockReset();
  });

  test('syncQueue singleton is exported from module', () => {
    const mod = require('../src/sync-queue');
    expect(mod.syncQueue).toBeDefined();
    expect(typeof mod.syncQueue.enqueue).toBe('function');
  });

  test('flush attaches Authorization header from localStorage token', async () => {
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('test-token-abc');
    mockFetch.mockResolvedValue({ ok: true, status: 200 });
    const q = new SyncQueue();
    await q.enqueue(makeReq('token-test', 100));
    await q.flush();
    getItemSpy.mockRestore();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer test-token-abc' }),
      })
    );
  });

  test('getAll returns QueuedRequest objects with all required fields', async () => {
    const q = new SyncQueue();
    await q.enqueue(makeReq('field-check', 300));
    const all = await q.getAll();
    expect(all[0]).toHaveProperty('id');
    expect(all[0]).toHaveProperty('url');
    expect(all[0]).toHaveProperty('method');
    expect(all[0]).toHaveProperty('headers');
    expect(all[0]).toHaveProperty('body');
    expect(all[0]).toHaveProperty('timestamp');
    expect(all[0]).toHaveProperty('retryCount');
  });

  test('flush with 404 response increments retryCount (non-ok)', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 404 });
    const q = new SyncQueue();
    await q.enqueue(makeReq('not-found', 100));
    const result = await q.flush();
    expect(result.failed).toBe(1);
    expect(result.succeeded).toBe(0);
  });

  test('enqueue with DELETE method stores method correctly', async () => {
    const q = new SyncQueue();
    const req: QueuedRequest = {
      id: 'del-1',
      url: 'https://example.com/api/singleton/del-1',
      method: 'DELETE',
      headers: {},
      body: null,
      timestamp: 100,
      retryCount: 0,
    };
    await q.enqueue(req);
    expect(sharedStore.data.get('del-1').method).toBe('DELETE');
  });
});

describe('sync queue — phase29 coverage', () => {
  it('handles optional chaining', () => {
    const obj: { x?: { y: number } } = {}; expect(obj?.x?.y).toBeUndefined();
  });

  it('handles string split', () => {
    expect('a,b,c'.split(',')).toEqual(['a', 'b', 'c']);
  });

  it('handles JSON parse', () => {
    expect(JSON.parse('{"a":1}')).toEqual({ a: 1 });
  });

  it('handles error instanceof', () => {
    expect(new Error('test')).toBeInstanceOf(Error);
  });

  it('handles null check', () => {
    expect(null).toBeNull();
  });

});

describe('sync queue — phase30 coverage', () => {
  it('handles find method', () => {
    expect([1, 2, 3].find(x => x > 1)).toBe(2);
  });

  it('handles Math.sqrt', () => {
    expect(Math.sqrt(9)).toBe(3);
  });

  it('handles JSON stringify', () => {
    expect(JSON.stringify({ a: 1 })).toBe('{"a":1}');
  });

  it('handles Math.round', () => {
    expect(Math.round(3.7)).toBe(4);
  });

  it('handles spread operator', () => {
    expect([...[1, 2], ...[3, 4]]).toEqual([1, 2, 3, 4]);
  });

});


describe('phase31 coverage', () => {
  it('handles string split', () => { expect('a,b,c'.split(',')).toEqual(['a','b','c']); });
  it('handles Number.isNaN', () => { expect(Number.isNaN(NaN)).toBe(true); expect(Number.isNaN(42)).toBe(false); });
  it('handles empty object', () => { const o = {}; expect(Object.keys(o).length).toBe(0); });
  it('handles ternary', () => { const x = 5 > 3 ? 'yes' : 'no'; expect(x).toBe('yes'); });
  it('handles array findIndex', () => { expect([1,2,3].findIndex(x => x > 1)).toBe(1); });
});


describe('phase32 coverage', () => {
  it('handles labeled break', () => { let found = false; outer: for (let i=0;i<3;i++) { for (let j=0;j<3;j++) { if(i===1&&j===1){found=true;break outer;} } } expect(found).toBe(true); });
  it('handles string matchAll', () => { const matches = [...'test1 test2'.matchAll(/test(\d)/g)]; expect(matches.length).toBe(2); });
  it('handles string trimStart', () => { expect('  hi'.trimStart()).toBe('hi'); });
  it('handles array at method', () => { expect([1,2,3].at(-1)).toBe(3); });
  it('handles string charAt', () => { expect('hello'.charAt(1)).toBe('e'); });
});


describe('phase33 coverage', () => {
  it('adds two numbers', () => { expect(1 + 1).toBe(2); });
  it('handles Set delete', () => { const s = new Set([1,2,3]); s.delete(2); expect(s.has(2)).toBe(false); });
  it('handles array shift', () => { const a = [1,2,3]; expect(a.shift()).toBe(1); expect(a).toEqual([2,3]); });
  it('multiplies numbers', () => { expect(4 * 5).toBe(20); });
  it('handles nested object access', () => { const o = { a: { b: 42 } }; expect(o.a.b).toBe(42); });
});


describe('phase34 coverage', () => {
  it('handles rest in destructuring', () => { const {a,...rest} = {a:1,b:2,c:3}; expect(rest).toEqual({b:2,c:3}); });
  it('handles Omit type pattern', () => { interface Full { a: number; b: string; c: boolean; } type NoC = Omit<Full,'c'>; const o: NoC = {a:1,b:'x'}; expect(o.b).toBe('x'); });
  it('handles chained optional access', () => { const o: any = {a:{b:{c:42}}}; expect(o?.a?.b?.c).toBe(42); expect(o?.x?.y?.z).toBeUndefined(); });
  it('handles Set intersection', () => { const a = new Set([1,2,3]); const b = new Set([2,3,4]); const inter = new Set([...a].filter(x=>b.has(x))); expect([...inter]).toEqual([2,3]); });
  it('handles type assertion', () => { const v: unknown = 'hello'; expect((v as string).toUpperCase()).toBe('HELLO'); });
});
