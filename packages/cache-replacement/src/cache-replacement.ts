// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

/** Statistics snapshot for any cache implementation. */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  size: number;
  capacity: number;
}

// ---------------------------------------------------------------------------
// LRU Cache — Least Recently Used
// ---------------------------------------------------------------------------

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

export class LRUCache<K, V> {
  private readonly _capacity: number;
  private _map: Map<K, LRUNode<K, V>>;
  private _head: LRUNode<K, V>; // dummy head (MRU side)
  private _tail: LRUNode<K, V>; // dummy tail (LRU side)
  private _hits = 0;
  private _misses = 0;

  constructor(capacity: number) {
    if (capacity < 1) throw new RangeError('LRUCache capacity must be >= 1');
    this._capacity = capacity;
    this._map = new Map();
    this._head = new LRUNode<K, V>(null as unknown as K, null as unknown as V);
    this._tail = new LRUNode<K, V>(null as unknown as K, null as unknown as V);
    this._head.next = this._tail;
    this._tail.prev = this._head;
  }

  get capacity(): number { return this._capacity; }
  get size(): number { return this._map.size; }

  private _remove(node: LRUNode<K, V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private _insertFront(node: LRUNode<K, V>): void {
    node.next = this._head.next;
    node.prev = this._head;
    this._head.next!.prev = node;
    this._head.next = node;
  }

  get(key: K): V | undefined {
    const node = this._map.get(key);
    if (!node) { this._misses++; return undefined; }
    this._hits++;
    this._remove(node);
    this._insertFront(node);
    return node.value;
  }

  set(key: K, value: V): void {
    if (this._map.has(key)) {
      const node = this._map.get(key)!;
      node.value = value;
      this._remove(node);
      this._insertFront(node);
    } else {
      if (this._map.size >= this._capacity) {
        const lru = this._tail.prev!;
        this._remove(lru);
        this._map.delete(lru.key);
      }
      const node = new LRUNode(key, value);
      this._map.set(key, node);
      this._insertFront(node);
    }
  }

  delete(key: K): boolean {
    const node = this._map.get(key);
    if (!node) return false;
    this._remove(node);
    this._map.delete(key);
    return true;
  }

  has(key: K): boolean { return this._map.has(key); }

  clear(): void {
    this._map.clear();
    this._head.next = this._tail;
    this._tail.prev = this._head;
    this._hits = 0;
    this._misses = 0;
  }

  keys(): K[] {
    const result: K[] = [];
    let cur = this._head.next;
    while (cur !== this._tail) {
      result.push(cur!.key);
      cur = cur!.next;
    }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    let cur = this._head.next;
    while (cur !== this._tail) {
      result.push(cur!.value);
      cur = cur!.next;
    }
    return result;
  }

  stats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      hits: this._hits,
      misses: this._misses,
      hitRate: total === 0 ? 0 : this._hits / total,
      size: this._map.size,
      capacity: this._capacity,
    };
  }
}

// ---------------------------------------------------------------------------
// LFU Cache — Least Frequently Used
// ---------------------------------------------------------------------------

interface LFUEntry<V> {
  value: V;
  freq: number;
}

export class LFUCache<K, V> {
  private readonly _capacity: number;
  private _map: Map<K, LFUEntry<V>>;
  private _freqMap: Map<number, Set<K>>;
  private _minFreq = 0;
  private _hits = 0;
  private _misses = 0;

  constructor(capacity: number) {
    if (capacity < 1) throw new RangeError('LFUCache capacity must be >= 1');
    this._capacity = capacity;
    this._map = new Map();
    this._freqMap = new Map();
  }

  get capacity(): number { return this._capacity; }
  get size(): number { return this._map.size; }

  private _addToFreq(freq: number, key: K): void {
    if (!this._freqMap.has(freq)) this._freqMap.set(freq, new Set());
    this._freqMap.get(freq)!.add(key);
  }

  private _removeFromFreq(freq: number, key: K): void {
    const set = this._freqMap.get(freq);
    if (!set) return;
    set.delete(key);
    if (set.size === 0) this._freqMap.delete(freq);
  }

  get(key: K): V | undefined {
    const entry = this._map.get(key);
    if (!entry) { this._misses++; return undefined; }
    this._hits++;
    this._removeFromFreq(entry.freq, key);
    entry.freq++;
    this._addToFreq(entry.freq, key);
    if (!this._freqMap.has(this._minFreq)) this._minFreq++;
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this._map.has(key)) {
      const entry = this._map.get(key)!;
      this._removeFromFreq(entry.freq, key);
      entry.freq++;
      entry.value = value;
      this._addToFreq(entry.freq, key);
      if (!this._freqMap.has(this._minFreq)) this._minFreq = entry.freq;
    } else {
      if (this._map.size >= this._capacity) {
        const minSet = this._freqMap.get(this._minFreq);
        if (minSet && minSet.size > 0) {
          const evictKey = minSet.values().next().value as K;
          minSet.delete(evictKey);
          if (minSet.size === 0) this._freqMap.delete(this._minFreq);
          this._map.delete(evictKey);
        }
      }
      this._map.set(key, { value, freq: 1 });
      this._addToFreq(1, key);
      this._minFreq = 1;
    }
  }

  delete(key: K): boolean {
    const entry = this._map.get(key);
    if (!entry) return false;
    this._removeFromFreq(entry.freq, key);
    this._map.delete(key);
    return true;
  }

  has(key: K): boolean { return this._map.has(key); }

  clear(): void {
    this._map.clear();
    this._freqMap.clear();
    this._minFreq = 0;
    this._hits = 0;
    this._misses = 0;
  }

  keys(): K[] { return Array.from(this._map.keys()); }

  values(): V[] { return Array.from(this._map.values()).map(e => e.value); }

  stats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      hits: this._hits,
      misses: this._misses,
      hitRate: total === 0 ? 0 : this._hits / total,
      size: this._map.size,
      capacity: this._capacity,
    };
  }
}

// ---------------------------------------------------------------------------
// FIFO Cache — First In First Out
// ---------------------------------------------------------------------------

export class FIFOCache<K, V> {
  private readonly _capacity: number;
  private _map: Map<K, V>;
  private _order: K[];
  private _hits = 0;
  private _misses = 0;

  constructor(capacity: number) {
    if (capacity < 1) throw new RangeError('FIFOCache capacity must be >= 1');
    this._capacity = capacity;
    this._map = new Map();
    this._order = [];
  }

  get capacity(): number { return this._capacity; }
  get size(): number { return this._map.size; }

  get(key: K): V | undefined {
    const val = this._map.get(key);
    if (val === undefined && !this._map.has(key)) { this._misses++; return undefined; }
    this._hits++;
    return val;
  }

  set(key: K, value: V): void {
    if (this._map.has(key)) {
      this._map.set(key, value);
      return;
    }
    if (this._map.size >= this._capacity) {
      const oldest = this._order.shift()!;
      this._map.delete(oldest);
    }
    this._map.set(key, value);
    this._order.push(key);
  }

  delete(key: K): boolean {
    if (!this._map.has(key)) return false;
    this._map.delete(key);
    this._order = this._order.filter(k => k !== key);
    return true;
  }

  has(key: K): boolean { return this._map.has(key); }

  clear(): void {
    this._map.clear();
    this._order = [];
    this._hits = 0;
    this._misses = 0;
  }

  keys(): K[] { return [...this._order]; }

  values(): V[] { return this._order.map(k => this._map.get(k)!); }

  stats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      hits: this._hits,
      misses: this._misses,
      hitRate: total === 0 ? 0 : this._hits / total,
      size: this._map.size,
      capacity: this._capacity,
    };
  }
}

// ---------------------------------------------------------------------------
// MRU Cache — Most Recently Used (evicts the most recently used entry)
// ---------------------------------------------------------------------------

export class MRUCache<K, V> {
  private readonly _capacity: number;
  private _map: Map<K, V>;
  private _order: K[]; // last element = most recently used
  private _hits = 0;
  private _misses = 0;

  constructor(capacity: number) {
    if (capacity < 1) throw new RangeError('MRUCache capacity must be >= 1');
    this._capacity = capacity;
    this._map = new Map();
    this._order = [];
  }

  get capacity(): number { return this._capacity; }
  get size(): number { return this._map.size; }

  get(key: K): V | undefined {
    if (!this._map.has(key)) { this._misses++; return undefined; }
    this._hits++;
    // Move to end (most recent)
    this._order = this._order.filter(k => k !== key);
    this._order.push(key);
    return this._map.get(key);
  }

  set(key: K, value: V): void {
    if (this._map.has(key)) {
      this._map.set(key, value);
      this._order = this._order.filter(k => k !== key);
      this._order.push(key);
      return;
    }
    if (this._map.size >= this._capacity) {
      // Evict most recently used (last element)
      const mru = this._order.pop()!;
      this._map.delete(mru);
    }
    this._map.set(key, value);
    this._order.push(key);
  }

  delete(key: K): boolean {
    if (!this._map.has(key)) return false;
    this._map.delete(key);
    this._order = this._order.filter(k => k !== key);
    return true;
  }

  has(key: K): boolean { return this._map.has(key); }

  clear(): void {
    this._map.clear();
    this._order = [];
    this._hits = 0;
    this._misses = 0;
  }

  keys(): K[] { return [...this._order]; }

  values(): V[] { return this._order.map(k => this._map.get(k)!); }

  stats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      hits: this._hits,
      misses: this._misses,
      hitRate: total === 0 ? 0 : this._hits / total,
      size: this._map.size,
      capacity: this._capacity,
    };
  }
}

// ---------------------------------------------------------------------------
// ARC Cache — Adaptive Replacement Cache (Megiddo & Modha, 2003)
// ---------------------------------------------------------------------------
// Maintains four lists: T1 (recent once), T2 (frequent), B1 (ghost of T1), B2 (ghost of T2)
// p = target size of T1

export class ARCCache<K, V> {
  private readonly _capacity: number;
  private _p = 0; // target size of T1

  // Live entries
  private _T1: Map<K, V> = new Map();
  private _T2: Map<K, V> = new Map();
  // Ghost entries (keys only, no values)
  private _B1: Set<K> = new Set();
  private _B2: Set<K> = new Set();

  private _hits = 0;
  private _misses = 0;

  constructor(capacity: number) {
    if (capacity < 1) throw new RangeError('ARCCache capacity must be >= 1');
    this._capacity = capacity;
  }

  get capacity(): number { return this._capacity; }
  get size(): number { return this._T1.size + this._T2.size; }

  has(key: K): boolean { return this._T1.has(key) || this._T2.has(key); }

  private _replace(inB2: boolean): void {
    const t1Size = this._T1.size;
    if (t1Size > 0 && (t1Size > this._p || (inB2 && t1Size === this._p))) {
      // Evict from T1 (oldest)
      const evictKey = this._T1.keys().next().value as K;
      this._T1.delete(evictKey);
      this._B1.add(evictKey);
    } else if (this._T2.size > 0) {
      // Evict from T2 (oldest)
      const evictKey = this._T2.keys().next().value as K;
      this._T2.delete(evictKey);
      this._B2.add(evictKey);
    } else if (this._T1.size > 0) {
      const evictKey = this._T1.keys().next().value as K;
      this._T1.delete(evictKey);
      this._B1.add(evictKey);
    }
  }

  get(key: K): V | undefined {
    if (this._T1.has(key)) {
      this._hits++;
      const val = this._T1.get(key)!;
      this._T1.delete(key);
      this._T2.set(key, val);
      return val;
    }
    if (this._T2.has(key)) {
      this._hits++;
      // Move to MRU position in T2 (re-insert)
      const val = this._T2.get(key)!;
      this._T2.delete(key);
      this._T2.set(key, val);
      return val;
    }
    this._misses++;
    return undefined;
  }

  set(key: K, value: V): void {
    if (this._T1.has(key)) {
      this._T1.delete(key);
      this._T2.set(key, value);
      return;
    }
    if (this._T2.has(key)) {
      this._T2.delete(key);
      this._T2.set(key, value);
      return;
    }

    const total = this._T1.size + this._T2.size;

    if (this._B1.has(key)) {
      // Increase p
      const delta = this._B2.size >= this._B1.size ? 1 : Math.floor(this._B2.size / this._B1.size);
      this._p = Math.min(this._p + delta, this._capacity);
      if (total >= this._capacity) this._replace(false);
      this._B1.delete(key);
      this._T2.set(key, value);
      return;
    }

    if (this._B2.has(key)) {
      // Decrease p
      const delta = this._B1.size >= this._B2.size ? 1 : Math.floor(this._B1.size / this._B2.size);
      this._p = Math.max(this._p - delta, 0);
      if (total >= this._capacity) this._replace(true);
      this._B2.delete(key);
      this._T2.set(key, value);
      return;
    }

    // New key
    if (total >= this._capacity) {
      if (this._T1.size + this._B1.size >= this._capacity) {
        if (this._T1.size < this._capacity) {
          // Remove oldest from B1
          const oldestB1 = this._B1.values().next().value as K;
          this._B1.delete(oldestB1);
          this._replace(false);
        } else {
          const evictKey = this._T1.keys().next().value as K;
          this._T1.delete(evictKey);
        }
      } else {
        const total2 = this._T1.size + this._B1.size + this._T2.size + this._B2.size;
        if (total2 >= 2 * this._capacity) {
          const oldestB2 = this._B2.values().next().value as K;
          if (oldestB2 !== undefined) this._B2.delete(oldestB2);
        }
        this._replace(false);
      }
    }
    this._T1.set(key, value);
  }

  clear(): void {
    this._T1.clear(); this._T2.clear();
    this._B1.clear(); this._B2.clear();
    this._p = 0;
    this._hits = 0; this._misses = 0;
  }

  stats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      hits: this._hits,
      misses: this._misses,
      hitRate: total === 0 ? 0 : this._hits / total,
      size: this._T1.size + this._T2.size,
      capacity: this._capacity,
    };
  }
}

// ---------------------------------------------------------------------------
// TLRU Cache — Time-aware Least Recently Used (TTL per entry)
// ---------------------------------------------------------------------------

interface TLRUEntry<V> {
  value: V;
  expiresAt: number; // ms epoch; 0 = never
}

class TLRUNode<K, V> {
  key: K;
  entry: TLRUEntry<V>;
  prev: TLRUNode<K, V> | null = null;
  next: TLRUNode<K, V> | null = null;
  constructor(key: K, entry: TLRUEntry<V>) {
    this.key = key;
    this.entry = entry;
  }
}

export class TLRUCache<K, V> {
  private readonly _capacity: number;
  private readonly _defaultTtl: number;
  private _map: Map<K, TLRUNode<K, V>>;
  private _head: TLRUNode<K, V>;
  private _tail: TLRUNode<K, V>;
  private _hits = 0;
  private _misses = 0;

  constructor(capacity: number, defaultTtlMs = 0) {
    if (capacity < 1) throw new RangeError('TLRUCache capacity must be >= 1');
    this._capacity = capacity;
    this._defaultTtl = defaultTtlMs;
    this._map = new Map();
    this._head = new TLRUNode<K, V>(null as unknown as K, { value: null as unknown as V, expiresAt: 0 });
    this._tail = new TLRUNode<K, V>(null as unknown as K, { value: null as unknown as V, expiresAt: 0 });
    this._head.next = this._tail;
    this._tail.prev = this._head;
  }

  get capacity(): number { return this._capacity; }
  get size(): number { return this._map.size; }

  private _isExpired(node: TLRUNode<K, V>): boolean {
    return node.entry.expiresAt > 0 && Date.now() > node.entry.expiresAt;
  }

  private _remove(node: TLRUNode<K, V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private _insertFront(node: TLRUNode<K, V>): void {
    node.next = this._head.next;
    node.prev = this._head;
    this._head.next!.prev = node;
    this._head.next = node;
  }

  get(key: K): V | undefined {
    const node = this._map.get(key);
    if (!node) { this._misses++; return undefined; }
    if (this._isExpired(node)) {
      this._remove(node);
      this._map.delete(key);
      this._misses++;
      return undefined;
    }
    this._hits++;
    this._remove(node);
    this._insertFront(node);
    return node.entry.value;
  }

  set(key: K, value: V, ttlMs?: number): void {
    const effectiveTtl = ttlMs !== undefined ? ttlMs : this._defaultTtl;
    const expiresAt = effectiveTtl > 0 ? Date.now() + effectiveTtl : 0;
    if (this._map.has(key)) {
      const node = this._map.get(key)!;
      node.entry = { value, expiresAt };
      this._remove(node);
      this._insertFront(node);
    } else {
      if (this._map.size >= this._capacity) {
        const lru = this._tail.prev!;
        if (lru !== this._head) {
          this._remove(lru);
          this._map.delete(lru.key);
        }
      }
      const node = new TLRUNode(key, { value, expiresAt });
      this._map.set(key, node);
      this._insertFront(node);
    }
  }

  delete(key: K): boolean {
    const node = this._map.get(key);
    if (!node) return false;
    this._remove(node);
    this._map.delete(key);
    return true;
  }

  has(key: K): boolean {
    const node = this._map.get(key);
    if (!node) return false;
    if (this._isExpired(node)) {
      this._remove(node);
      this._map.delete(node.key);
      return false;
    }
    return true;
  }

  purgeExpired(): number {
    let count = 0;
    for (const [key, node] of this._map) {
      if (this._isExpired(node)) {
        this._remove(node);
        this._map.delete(key);
        count++;
      }
    }
    return count;
  }

  clear(): void {
    this._map.clear();
    this._head.next = this._tail;
    this._tail.prev = this._head;
    this._hits = 0;
    this._misses = 0;
  }

  stats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      hits: this._hits,
      misses: this._misses,
      hitRate: total === 0 ? 0 : this._hits / total,
      size: this._map.size,
      capacity: this._capacity,
    };
  }
}

// ---------------------------------------------------------------------------
// 2Q Cache — Two-Queue (Johnson & Shasha, 1994)
// Hot queue = LRU (frequently accessed), Warm queue = FIFO (recently accessed once)
// ---------------------------------------------------------------------------

export class TwoQCache<K, V> {
  private readonly _capacity: number;
  private readonly _warmRatio: number; // fraction of capacity for warm (FIFO) queue
  private _warm: Map<K, V>; // FIFO
  private _warmOrder: K[];
  private _hot: Map<K, V>; // LRU
  private _hotHead: LRUNode<K, V>;
  private _hotTail: LRUNode<K, V>;
  private _hotMap: Map<K, LRUNode<K, V>>;
  private _ghost: Set<K>; // ghost of evicted warm entries
  private _hits = 0;
  private _misses = 0;

  constructor(capacity: number, warmRatio = 0.25) {
    if (capacity < 1) throw new RangeError('TwoQCache capacity must be >= 1');
    this._capacity = capacity;
    this._warmRatio = warmRatio;
    this._warm = new Map();
    this._warmOrder = [];
    this._hot = new Map();
    this._hotMap = new Map();
    this._ghost = new Set();
    this._hotHead = new LRUNode<K, V>(null as unknown as K, null as unknown as V);
    this._hotTail = new LRUNode<K, V>(null as unknown as K, null as unknown as V);
    this._hotHead.next = this._hotTail;
    this._hotTail.prev = this._hotHead;
  }

  get capacity(): number { return this._capacity; }
  get size(): number { return this._warm.size + this._hot.size; }

  has(key: K): boolean { return this._warm.has(key) || this._hot.has(key); }

  private get _warmCapacity(): number {
    return Math.max(1, Math.floor(this._capacity * this._warmRatio));
  }

  private get _hotCapacity(): number {
    return Math.max(1, this._capacity - this._warmCapacity);
  }

  private _hotRemove(node: LRUNode<K, V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
  }

  private _hotInsertFront(node: LRUNode<K, V>): void {
    node.next = this._hotHead.next;
    node.prev = this._hotHead;
    this._hotHead.next!.prev = node;
    this._hotHead.next = node;
  }

  private _hotEvict(): void {
    const lru = this._hotTail.prev!;
    if (lru !== this._hotHead) {
      this._hotRemove(lru);
      this._hotMap.delete(lru.key);
      this._hot.delete(lru.key);
    }
  }

  private _hotSet(key: K, value: V): void {
    if (this._hotMap.has(key)) {
      const node = this._hotMap.get(key)!;
      node.value = value;
      this._hot.set(key, value);
      this._hotRemove(node);
      this._hotInsertFront(node);
    } else {
      if (this._hot.size >= this._hotCapacity) this._hotEvict();
      const node = new LRUNode(key, value);
      this._hotMap.set(key, node);
      this._hot.set(key, value);
      this._hotInsertFront(node);
    }
  }

  get(key: K): V | undefined {
    if (this._hot.has(key)) {
      this._hits++;
      const node = this._hotMap.get(key)!;
      this._hotRemove(node);
      this._hotInsertFront(node);
      return node.value;
    }
    if (this._warm.has(key)) {
      this._hits++;
      const val = this._warm.get(key)!;
      // Promote to hot
      this._warm.delete(key);
      this._warmOrder = this._warmOrder.filter(k => k !== key);
      this._hotSet(key, val);
      return val;
    }
    this._misses++;
    return undefined;
  }

  set(key: K, value: V): void {
    if (this._hot.has(key)) {
      this._hotSet(key, value);
      return;
    }
    if (this._warm.has(key)) {
      // Update value; keep in warm
      this._warm.set(key, value);
      return;
    }
    if (this._ghost.has(key)) {
      // Seen before — promote directly to hot
      this._ghost.delete(key);
      this._hotSet(key, value);
      return;
    }
    // New entry — insert into warm (FIFO)
    if (this._warm.size >= this._warmCapacity) {
      const oldest = this._warmOrder.shift()!;
      this._warm.delete(oldest);
      this._ghost.add(oldest);
      // Trim ghost list
      if (this._ghost.size > this._capacity) {
        const firstGhost = this._ghost.values().next().value as K;
        this._ghost.delete(firstGhost);
      }
    }
    this._warm.set(key, value);
    this._warmOrder.push(key);
  }

  clear(): void {
    this._warm.clear(); this._warmOrder = [];
    this._hot.clear(); this._hotMap.clear();
    this._hotHead.next = this._hotTail; this._hotTail.prev = this._hotHead;
    this._ghost.clear();
    this._hits = 0; this._misses = 0;
  }

  stats(): CacheStats {
    const total = this._hits + this._misses;
    return {
      hits: this._hits,
      misses: this._misses,
      hitRate: total === 0 ? 0 : this._hits / total,
      size: this._warm.size + this._hot.size,
      capacity: this._capacity,
    };
  }
}

// ---------------------------------------------------------------------------
// simulateCache helper
// ---------------------------------------------------------------------------

export function simulateCache<K>(
  cache: { get: (k: K) => unknown; set: (k: K, v: unknown) => void },
  requests: K[]
): CacheStats {
  let hits = 0;
  let misses = 0;
  for (const key of requests) {
    const val = cache.get(key);
    if (val !== undefined) {
      hits++;
    } else {
      misses++;
      cache.set(key, key); // store key as its own value
    }
  }
  const total = hits + misses;
  // Try to read size/capacity from cache if available
  const anyCache = cache as Record<string, unknown>;
  const size = typeof anyCache['size'] === 'number' ? anyCache['size'] as number : 0;
  const capacity = typeof anyCache['capacity'] === 'number' ? anyCache['capacity'] as number : 0;
  return {
    hits,
    misses,
    hitRate: total === 0 ? 0 : hits / total,
    size,
    capacity,
  };
}

// ---------------------------------------------------------------------------
// Bélády's Optimal Algorithm — compute optimal hit rate for a request sequence
// ---------------------------------------------------------------------------

export function optimalHitRate(capacity: number, requests: number[]): number {
  if (requests.length === 0) return 0;
  if (capacity <= 0) return 0;

  const cache = new Set<number>();
  let hits = 0;

  for (let i = 0; i < requests.length; i++) {
    const key = requests[i];
    if (cache.has(key)) {
      hits++;
    } else {
      if (cache.size >= capacity) {
        // Evict the page whose next use is furthest in the future
        let evictKey = -1;
        let farthest = i;
        for (const k of cache) {
          let nextUse = requests.length; // never used again = infinity
          for (let j = i + 1; j < requests.length; j++) {
            if (requests[j] === k) { nextUse = j; break; }
          }
          if (nextUse > farthest) {
            farthest = nextUse;
            evictKey = k;
          }
        }
        if (evictKey !== -1) cache.delete(evictKey);
        else {
          // All remaining are used again — just evict one arbitrarily
          const first = cache.values().next().value as number;
          cache.delete(first);
        }
      }
      cache.add(key);
    }
  }

  return hits / requests.length;
}
