// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface CacheEntry<V> {
  key: string;
  value: V;
  hits: number;
  createdAt: number;
  lastAccessed: number;
  expiresAt?: number;
}

export interface CacheStats {
  size: number;
  capacity: number;
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
}

// ── LRU Cache ────────────────────────────────────────────────────────────────
// Uses a doubly-linked list + Map for O(1) get/set.

interface LRUNode<V> {
  key: string;
  entry: CacheEntry<V>;
  prev: LRUNode<V> | null;
  next: LRUNode<V> | null;
}

export class LRUCache<V = unknown> {
  private readonly _capacity: number;
  private readonly _map: Map<string, LRUNode<V>>;
  private _head: LRUNode<V> | null; // most-recently used
  private _tail: LRUNode<V> | null; // least-recently used
  private _hits: number;
  private _misses: number;
  private _evictions: number;

  constructor(capacity: number) {
    if (capacity < 1) throw new Error('Capacity must be >= 1');
    this._capacity = capacity;
    this._map = new Map();
    this._head = null;
    this._tail = null;
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
  }

  private _moveToHead(node: LRUNode<V>): void {
    if (node === this._head) return;
    this._removeNode(node);
    this._prependNode(node);
  }

  private _removeNode(node: LRUNode<V>): void {
    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;
    if (node === this._head) this._head = node.next;
    if (node === this._tail) this._tail = node.prev;
    node.prev = null;
    node.next = null;
  }

  private _prependNode(node: LRUNode<V>): void {
    node.next = this._head;
    node.prev = null;
    if (this._head) this._head.prev = node;
    this._head = node;
    if (!this._tail) this._tail = node;
  }

  private _isExpired(entry: CacheEntry<V>): boolean {
    return entry.expiresAt !== undefined && Date.now() > entry.expiresAt;
  }

  get(key: string): V | undefined {
    const node = this._map.get(key);
    if (!node) { this._misses++; return undefined; }
    if (this._isExpired(node.entry)) {
      this._removeNode(node);
      this._map.delete(key);
      this._misses++;
      return undefined;
    }
    node.entry.hits++;
    node.entry.lastAccessed = Date.now();
    this._moveToHead(node);
    this._hits++;
    return node.entry.value;
  }

  set(key: string, value: V, ttlMs?: number): this {
    const now = Date.now();
    const existing = this._map.get(key);
    if (existing) {
      existing.entry.value = value;
      existing.entry.lastAccessed = now;
      existing.entry.expiresAt = ttlMs !== undefined ? now + ttlMs : undefined;
      this._moveToHead(existing);
      return this;
    }
    const entry: CacheEntry<V> = {
      key,
      value,
      hits: 0,
      createdAt: now,
      lastAccessed: now,
      expiresAt: ttlMs !== undefined ? now + ttlMs : undefined,
    };
    const node: LRUNode<V> = { key, entry, prev: null, next: null };
    this._map.set(key, node);
    this._prependNode(node);
    if (this._map.size > this._capacity) {
      this.evict();
    }
    return this;
  }

  has(key: string): boolean {
    const node = this._map.get(key);
    if (!node) return false;
    if (this._isExpired(node.entry)) {
      this._removeNode(node);
      this._map.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    const node = this._map.get(key);
    if (!node) return false;
    this._removeNode(node);
    this._map.delete(key);
    return true;
  }

  clear(): void {
    this._map.clear();
    this._head = null;
    this._tail = null;
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
  }

  size(): number { return this._map.size; }

  keys(): string[] {
    const result: string[] = [];
    let cur = this._head;
    while (cur) { result.push(cur.key); cur = cur.next; }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    let cur = this._head;
    while (cur) { result.push(cur.entry.value); cur = cur.next; }
    return result;
  }

  entries(): Array<[string, V]> {
    const result: Array<[string, V]> = [];
    let cur = this._head;
    while (cur) { result.push([cur.key, cur.entry.value]); cur = cur.next; }
    return result;
  }

  stats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      size: this._map.size,
      capacity: this._capacity,
      hits: this._hits,
      misses: this._misses,
      evictions: this._evictions,
      hitRate: total === 0 ? 0 : this._hits / total,
    };
  }

  peek(key: string): V | undefined {
    const node = this._map.get(key);
    if (!node) return undefined;
    if (this._isExpired(node.entry)) {
      this._removeNode(node);
      this._map.delete(key);
      return undefined;
    }
    return node.entry.value;
  }

  evict(): string | undefined {
    if (!this._tail) return undefined;
    const key = this._tail.key;
    this._removeNode(this._tail);
    this._map.delete(key);
    this._evictions++;
    return key;
  }
}

// ── LFU Cache ────────────────────────────────────────────────────────────────
// Tracks frequency buckets for O(1) eviction of least-frequently used item.

export class LFUCache<V = unknown> {
  private readonly _capacity: number;
  private readonly _map: Map<string, CacheEntry<V>>;
  private readonly _freqMap: Map<number, Set<string>>; // freq → set of keys (insertion order = LRU within freq)
  private _minFreq: number;
  private _hits: number;
  private _misses: number;
  private _evictions: number;

  constructor(capacity: number) {
    if (capacity < 1) throw new Error('Capacity must be >= 1');
    this._capacity = capacity;
    this._map = new Map();
    this._freqMap = new Map();
    this._minFreq = 0;
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
  }

  private _isExpired(entry: CacheEntry<V>): boolean {
    return entry.expiresAt !== undefined && Date.now() > entry.expiresAt;
  }

  private _addToFreq(freq: number, key: string): void {
    if (!this._freqMap.has(freq)) this._freqMap.set(freq, new Set());
    this._freqMap.get(freq)!.add(key);
  }

  private _removeFromFreq(freq: number, key: string): void {
    const bucket = this._freqMap.get(freq);
    if (!bucket) return;
    bucket.delete(key);
    if (bucket.size === 0) this._freqMap.delete(freq);
  }

  private _incrementFreq(entry: CacheEntry<V>): void {
    const oldFreq = entry.hits;
    this._removeFromFreq(oldFreq, entry.key);
    entry.hits++;
    this._addToFreq(entry.hits, entry.key);
    if (this._minFreq === oldFreq && !this._freqMap.has(oldFreq)) {
      this._minFreq = entry.hits;
    }
  }

  get(key: string): V | undefined {
    const entry = this._map.get(key);
    if (!entry) { this._misses++; return undefined; }
    if (this._isExpired(entry)) {
      this._removeFromFreq(entry.hits, key);
      this._map.delete(key);
      this._misses++;
      return undefined;
    }
    this._incrementFreq(entry);
    entry.lastAccessed = Date.now();
    this._hits++;
    return entry.value;
  }

  set(key: string, value: V, ttlMs?: number): this {
    const now = Date.now();
    const existing = this._map.get(key);
    if (existing) {
      existing.value = value;
      existing.lastAccessed = now;
      existing.expiresAt = ttlMs !== undefined ? now + ttlMs : undefined;
      this._incrementFreq(existing);
      return this;
    }
    // Need to evict if at capacity
    if (this._map.size >= this._capacity) {
      const bucket = this._freqMap.get(this._minFreq);
      if (bucket && bucket.size > 0) {
        const evictKey = bucket.keys().next().value as string;
        bucket.delete(evictKey);
        if (bucket.size === 0) this._freqMap.delete(this._minFreq);
        this._map.delete(evictKey);
        this._evictions++;
      }
    }
    const entry: CacheEntry<V> = {
      key,
      value,
      hits: 1,
      createdAt: now,
      lastAccessed: now,
      expiresAt: ttlMs !== undefined ? now + ttlMs : undefined,
    };
    this._map.set(key, entry);
    this._addToFreq(1, key);
    this._minFreq = 1;
    return this;
  }

  has(key: string): boolean {
    const entry = this._map.get(key);
    if (!entry) return false;
    if (this._isExpired(entry)) {
      this._removeFromFreq(entry.hits, key);
      this._map.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    const entry = this._map.get(key);
    if (!entry) return false;
    this._removeFromFreq(entry.hits, key);
    this._map.delete(key);
    return true;
  }

  clear(): void {
    this._map.clear();
    this._freqMap.clear();
    this._minFreq = 0;
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
  }

  size(): number { return this._map.size; }

  keys(): string[] { return Array.from(this._map.keys()); }

  stats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      size: this._map.size,
      capacity: this._capacity,
      hits: this._hits,
      misses: this._misses,
      evictions: this._evictions,
      hitRate: total === 0 ? 0 : this._hits / total,
    };
  }

  minFrequency(): number { return this._minFreq; }
}

// ── TTL Cache ────────────────────────────────────────────────────────────────

export class TTLCache<V = unknown> {
  private readonly _defaultTtlMs: number;
  private readonly _capacity: number;
  private readonly _map: Map<string, CacheEntry<V>>;
  private _hits: number;
  private _misses: number;
  private _evictions: number;

  constructor(defaultTtlMs: number, capacity = Infinity) {
    this._defaultTtlMs = defaultTtlMs;
    this._capacity = capacity;
    this._map = new Map();
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
  }

  private _isExpired(entry: CacheEntry<V>): boolean {
    return entry.expiresAt !== undefined && Date.now() > entry.expiresAt;
  }

  get(key: string): V | undefined {
    const entry = this._map.get(key);
    if (!entry) { this._misses++; return undefined; }
    if (this._isExpired(entry)) {
      this._map.delete(key);
      this._misses++;
      return undefined;
    }
    entry.hits++;
    entry.lastAccessed = Date.now();
    this._hits++;
    return entry.value;
  }

  set(key: string, value: V, ttlMs?: number): this {
    const now = Date.now();
    const ttl = ttlMs !== undefined ? ttlMs : this._defaultTtlMs;
    const entry: CacheEntry<V> = {
      key,
      value,
      hits: 0,
      createdAt: now,
      lastAccessed: now,
      expiresAt: now + ttl,
    };
    // Evict oldest if at capacity (only if finite capacity)
    if (this._capacity !== Infinity && this._map.size >= this._capacity && !this._map.has(key)) {
      const firstKey = this._map.keys().next().value as string;
      this._map.delete(firstKey);
      this._evictions++;
    }
    this._map.set(key, entry);
    return this;
  }

  has(key: string): boolean {
    const entry = this._map.get(key);
    if (!entry) return false;
    if (this._isExpired(entry)) {
      this._map.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this._map.delete(key);
  }

  clear(): void {
    this._map.clear();
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
  }

  size(): number {
    let count = 0;
    const now = Date.now();
    for (const entry of this._map.values()) {
      if (entry.expiresAt === undefined || now <= entry.expiresAt) count++;
    }
    return count;
  }

  purgeExpired(): number {
    let count = 0;
    const now = Date.now();
    for (const [key, entry] of this._map) {
      if (entry.expiresAt !== undefined && now > entry.expiresAt) {
        this._map.delete(key);
        count++;
      }
    }
    return count;
  }

  ttlRemaining(key: string): number {
    const entry = this._map.get(key);
    if (!entry) return -1;
    if (entry.expiresAt === undefined) return Infinity;
    const remaining = entry.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  stats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      size: this.size(),
      capacity: this._capacity === Infinity ? -1 : this._capacity,
      hits: this._hits,
      misses: this._misses,
      evictions: this._evictions,
      hitRate: total === 0 ? 0 : this._hits / total,
    };
  }
}

// ── FIFO Cache ───────────────────────────────────────────────────────────────

export class FIFOCache<V = unknown> {
  private readonly _capacity: number;
  private readonly _map: Map<string, CacheEntry<V>>; // insertion order = FIFO
  private _hits: number;
  private _misses: number;
  private _evictions: number;

  constructor(capacity: number) {
    if (capacity < 1) throw new Error('Capacity must be >= 1');
    this._capacity = capacity;
    this._map = new Map();
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
  }

  get(key: string): V | undefined {
    const entry = this._map.get(key);
    if (!entry) { this._misses++; return undefined; }
    entry.hits++;
    entry.lastAccessed = Date.now();
    this._hits++;
    return entry.value;
  }

  set(key: string, value: V): this {
    const now = Date.now();
    if (this._map.has(key)) {
      const entry = this._map.get(key)!;
      entry.value = value;
      entry.lastAccessed = now;
      return this;
    }
    // Evict oldest (first in map) if at capacity
    if (this._map.size >= this._capacity) {
      const firstKey = this._map.keys().next().value as string;
      this._map.delete(firstKey);
      this._evictions++;
    }
    const entry: CacheEntry<V> = {
      key,
      value,
      hits: 0,
      createdAt: now,
      lastAccessed: now,
    };
    this._map.set(key, entry);
    return this;
  }

  has(key: string): boolean { return this._map.has(key); }

  delete(key: string): boolean { return this._map.delete(key); }

  clear(): void {
    this._map.clear();
    this._hits = 0;
    this._misses = 0;
    this._evictions = 0;
  }

  size(): number { return this._map.size; }

  oldest(): string | undefined {
    const first = this._map.keys().next();
    return first.done ? undefined : first.value;
  }

  newest(): string | undefined {
    let last: string | undefined;
    for (const key of this._map.keys()) last = key;
    return last;
  }

  entries(): Array<[string, V]> {
    const result: Array<[string, V]> = [];
    for (const [key, entry] of this._map) {
      result.push([key, entry.value]);
    }
    return result;
  }

  stats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      size: this._map.size,
      capacity: this._capacity,
      hits: this._hits,
      misses: this._misses,
      evictions: this._evictions,
      hitRate: total === 0 ? 0 : this._hits / total,
    };
  }
}

// ── Two-Level Cache ───────────────────────────────────────────────────────────

export class TwoLevelCache<V = unknown> {
  private readonly _l1: LRUCache<V>;
  private readonly _l2: LRUCache<V>;
  private readonly _l2TtlMs?: number;

  constructor(l1Capacity: number, l2Capacity: number, l2TtlMs?: number) {
    this._l1 = new LRUCache<V>(l1Capacity);
    this._l2 = new LRUCache<V>(l2Capacity);
    this._l2TtlMs = l2TtlMs;
  }

  get(key: string): V | undefined {
    const l1Val = this._l1.peek(key);
    if (l1Val !== undefined) {
      // Already in L1 — do a proper get to update recency
      return this._l1.get(key);
    }
    // Check L2 and promote to L1
    const l2Val = this._l2.get(key);
    if (l2Val !== undefined) {
      this._l1.set(key, l2Val);
      return l2Val;
    }
    return undefined;
  }

  set(key: string, value: V): this {
    this._l1.set(key, value);
    this._l2.set(key, value, this._l2TtlMs);
    return this;
  }

  has(key: string): boolean {
    return this._l1.has(key) || this._l2.has(key);
  }

  delete(key: string): boolean {
    const d1 = this._l1.delete(key);
    const d2 = this._l2.delete(key);
    return d1 || d2;
  }

  clear(): void {
    this._l1.clear();
    this._l2.clear();
  }

  stats(): { l1: CacheStats; l2: CacheStats } {
    return { l1: this._l1.stats(), l2: this._l2.stats() };
  }
}

// ── Memoize ───────────────────────────────────────────────────────────────────

export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  opts?: { maxSize?: number; ttlMs?: number; keyFn?: (...args: unknown[]) => string }
): T & { cache: LRUCache<ReturnType<T>>; clear: () => void } {
  const maxSize = opts?.maxSize ?? 256;
  const ttlMs = opts?.ttlMs;
  const keyFn = opts?.keyFn ?? ((...args: unknown[]) => JSON.stringify(args));
  const cache = new LRUCache<ReturnType<T>>(maxSize);

  const memoized = function (...args: unknown[]): ReturnType<T> {
    const key = keyFn(...args);
    const cached = cache.get(key);
    if (cached !== undefined) return cached;
    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result, ttlMs);
    return result;
  } as T & { cache: LRUCache<ReturnType<T>>; clear: () => void };

  memoized.cache = cache;
  memoized.clear = () => cache.clear();
  return memoized;
}

// ── Utility helpers ───────────────────────────────────────────────────────────

export function createCache<V>(
  strategy: 'lru' | 'lfu' | 'ttl' | 'fifo',
  opts: { capacity?: number; ttlMs?: number }
): LRUCache<V> | LFUCache<V> | TTLCache<V> | FIFOCache<V> {
  const cap = opts.capacity ?? 100;
  const ttl = opts.ttlMs ?? 60_000;
  switch (strategy) {
    case 'lru': return new LRUCache<V>(cap);
    case 'lfu': return new LFUCache<V>(cap);
    case 'ttl': return new TTLCache<V>(ttl, cap);
    case 'fifo': return new FIFOCache<V>(cap);
    default: throw new Error(`Unknown strategy: ${strategy as string}`);
  }
}

export function warmUp<V>(
  cache: LRUCache<V> | TTLCache<V>,
  entries: Array<[string, V]>
): void {
  for (const [key, value] of entries) {
    cache.set(key, value);
  }
}

export function serialize<V>(cache: LRUCache<V> | FIFOCache<V>): string {
  const ents = cache.entries();
  return JSON.stringify(ents);
}

export function deserialize<V>(json: string): Array<[string, V]> {
  return JSON.parse(json) as Array<[string, V]>;
}
