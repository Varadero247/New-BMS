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
