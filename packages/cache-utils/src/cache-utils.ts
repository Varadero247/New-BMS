// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ─── LRU Cache ────────────────────────────────────────────────────────────────

export interface LRUCache<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V): void;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  size: number;
  keys(): K[];
  values(): V[];
  entries(): [K, V][];
}

class LRUNode<K, V> {
  key: K;
  value: V;
  prev: LRUNode<K, V> | null = null;
  next: LRUNode<K, V> | null = null;
  constructor(key: K, value: V) {
    this.key = key;
    this.value = value;
  }
}

class LRUCacheImpl<K, V> implements LRUCache<K, V> {
  private capacity: number;
  private map: Map<K, LRUNode<K, V>>;
  private head: LRUNode<K, V>; // most recently used sentinel
  private tail: LRUNode<K, V>; // least recently used sentinel

  constructor(capacity: number) {
    if (capacity < 1) throw new RangeError('Capacity must be >= 1');
    this.capacity = capacity;
    this.map = new Map();
    // head <-> tail are sentinels
    this.head = new LRUNode<K, V>(null as unknown as K, null as unknown as V);
    this.tail = new LRUNode<K, V>(null as unknown as K, null as unknown as V);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private removeNode(node: LRUNode<K, V>): void {
    const prev = node.prev!;
    const next = node.next!;
    prev.next = next;
    next.prev = prev;
  }

  private insertAfterHead(node: LRUNode<K, V>): void {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next!.prev = node;
    this.head.next = node;
  }

  get(key: K): V | undefined {
    const node = this.map.get(key);
    if (!node) return undefined;
    this.removeNode(node);
    this.insertAfterHead(node);
    return node.value;
  }

  set(key: K, value: V): void {
    if (this.map.has(key)) {
      const node = this.map.get(key)!;
      node.value = value;
      this.removeNode(node);
      this.insertAfterHead(node);
    } else {
      if (this.map.size >= this.capacity) {
        const lru = this.tail.prev!;
        this.removeNode(lru);
        this.map.delete(lru.key);
      }
      const node = new LRUNode<K, V>(key, value);
      this.map.set(key, node);
      this.insertAfterHead(node);
    }
  }

  has(key: K): boolean {
    return this.map.has(key);
  }

  delete(key: K): boolean {
    const node = this.map.get(key);
    if (!node) return false;
    this.removeNode(node);
    this.map.delete(key);
    return true;
  }

  clear(): void {
    this.map.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  get size(): number {
    return this.map.size;
  }

  keys(): K[] {
    const result: K[] = [];
    let node = this.head.next!;
    while (node !== this.tail) {
      result.push(node.key);
      node = node.next!;
    }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    let node = this.head.next!;
    while (node !== this.tail) {
      result.push(node.value);
      node = node.next!;
    }
    return result;
  }

  entries(): [K, V][] {
    const result: [K, V][] = [];
    let node = this.head.next!;
    while (node !== this.tail) {
      result.push([node.key, node.value]);
      node = node.next!;
    }
    return result;
  }
}

export function createLRUCache<K, V>(capacity: number): LRUCache<K, V> {
  return new LRUCacheImpl<K, V>(capacity);
}

// ─── TTL Cache ────────────────────────────────────────────────────────────────

export interface TTLCache<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V, ttlMs?: number): void;
  has(key: K): boolean;
  delete(key: K): boolean;
  clear(): void;
  size(): number;
}

interface TTLEntry<V> {
  value: V;
  expiresAt: number;
}

class TTLCacheImpl<K, V> implements TTLCache<K, V> {
  private defaultTtlMs: number;
  private store: Map<K, TTLEntry<V>>;

  constructor(defaultTtlMs: number) {
    if (defaultTtlMs < 0) throw new RangeError('defaultTtlMs must be >= 0');
    this.defaultTtlMs = defaultTtlMs;
    this.store = new Map();
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V, ttlMs?: number): void {
    const ttl = ttlMs !== undefined ? ttlMs : this.defaultTtlMs;
    this.store.set(key, { value, expiresAt: Date.now() + ttl });
  }

  has(key: K): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  delete(key: K): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    // Only count non-expired entries
    let count = 0;
    const now = Date.now();
    for (const entry of this.store.values()) {
      if (now <= entry.expiresAt) count++;
    }
    return count;
  }
}

export function createTTLCache<K, V>(defaultTtlMs: number): TTLCache<K, V> {
  return new TTLCacheImpl<K, V>(defaultTtlMs);
}

// ─── Memoization ──────────────────────────────────────────────────────────────

export function memoize<A extends unknown[], R>(
  fn: (...args: A) => R,
  keyFn?: (...args: A) => string
): (...args: A) => R {
  const cache = new Map<string, R>();
  return (...args: A): R => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key) as R;
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

export function memoizeAsync<A extends unknown[], R>(
  fn: (...args: A) => Promise<R>,
  keyFn?: (...args: A) => string
): (...args: A) => Promise<R> {
  const cache = new Map<string, Promise<R>>();
  return (...args: A): Promise<R> => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (cache.has(key)) return cache.get(key) as Promise<R>;
    const promise = fn(...args).catch((err) => {
      cache.delete(key);
      throw err;
    });
    cache.set(key, promise);
    return promise;
  };
}

// ─── Simple In-Memory Store ───────────────────────────────────────────────────

export function createStore<V>(): {
  get(key: string): V | undefined;
  set(key: string, value: V): void;
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  size(): number;
  keys(): string[];
} {
  const store = new Map<string, V>();
  return {
    get(key: string): V | undefined {
      return store.get(key);
    },
    set(key: string, value: V): void {
      store.set(key, value);
    },
    has(key: string): boolean {
      return store.has(key);
    },
    delete(key: string): boolean {
      return store.delete(key);
    },
    clear(): void {
      store.clear();
    },
    size(): number {
      return store.size;
    },
    keys(): string[] {
      return Array.from(store.keys());
    },
  };
}

// ─── Cache Key Builders ───────────────────────────────────────────────────────

export function buildKey(...parts: (string | number)[]): string {
  return parts.join(':');
}

export function hashKey(data: unknown): string {
  const str = JSON.stringify(data) ?? String(data);
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  return hash.toString(16).padStart(8, '0');
}
