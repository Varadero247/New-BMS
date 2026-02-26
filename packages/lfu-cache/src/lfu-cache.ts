// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Doubly Linked List Node ────────────────────────────────────────────────

class DLLNode<K, V> {
  key: K;
  value: V;
  freq: number;
  prev: DLLNode<K, V> | null = null;
  next: DLLNode<K, V> | null = null;

  constructor(key: K, value: V, freq = 1) {
    this.key = key;
    this.value = value;
    this.freq = freq;
  }
}

class DoublyLinkedList<K, V> {
  head: DLLNode<K, V>; // sentinel head (MRU end)
  tail: DLLNode<K, V>; // sentinel tail (LRU end)
  size = 0;

  constructor() {
    this.head = new DLLNode<K, V>(null as unknown as K, null as unknown as V);
    this.tail = new DLLNode<K, V>(null as unknown as K, null as unknown as V);
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /** Insert node right after sentinel head (most-recently-used position). */
  addToHead(node: DLLNode<K, V>): void {
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next!.prev = node;
    this.head.next = node;
    this.size++;
  }

  /** Remove an arbitrary node from the list. */
  remove(node: DLLNode<K, V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
    node.prev = null;
    node.next = null;
    this.size--;
  }

  /** Remove and return the tail node (least-recently-used). Returns null if empty. */
  removeTail(): DLLNode<K, V> | null {
    if (this.size === 0) return null;
    const node = this.tail.prev!;
    this.remove(node);
    return node;
  }

  /** Return keys in order from head (MRU) to tail (LRU). */
  keys(): K[] {
    const result: K[] = [];
    let cur = this.head.next;
    while (cur !== this.tail) {
      result.push(cur!.key);
      cur = cur!.next;
    }
    return result;
  }
}

// ─── LFU Cache ──────────────────────────────────────────────────────────────

/**
 * LFU Cache with O(1) get/set.
 * Uses a frequency map of doubly linked lists. Within each frequency bucket,
 * nodes are ordered MRU → LRU so that on eviction the least-recently-used
 * item at the minimum frequency is removed.
 */
export class LFUCache<K, V> {
  private _capacity: number;
  private _size = 0;
  private _minFreq = 0;
  private _map: Map<K, DLLNode<K, V>> = new Map();
  private _freqMap: Map<number, DoublyLinkedList<K, V>> = new Map();
  private _hits = 0;
  private _misses = 0;

  constructor(capacity: number) {
    if (capacity <= 0) throw new RangeError('LFUCache capacity must be > 0');
    this._capacity = capacity;
  }

  get capacity(): number {
    return this._capacity;
  }

  get size(): number {
    return this._size;
  }

  get hits(): number {
    return this._hits;
  }

  get misses(): number {
    return this._misses;
  }

  get hitRate(): number {
    const total = this._hits + this._misses;
    return total === 0 ? NaN : this._hits / total;
  }

  resetStats(): void {
    this._hits = 0;
    this._misses = 0;
  }

  private _getList(freq: number): DoublyLinkedList<K, V> {
    if (!this._freqMap.has(freq)) {
      this._freqMap.set(freq, new DoublyLinkedList<K, V>());
    }
    return this._freqMap.get(freq)!;
  }

  private _incrementFreq(node: DLLNode<K, V>): void {
    const oldFreq = node.freq;
    const oldList = this._getList(oldFreq);
    oldList.remove(node);
    if (oldList.size === 0) {
      this._freqMap.delete(oldFreq);
      if (this._minFreq === oldFreq) this._minFreq = oldFreq + 1;
    }
    node.freq = oldFreq + 1;
    const newList = this._getList(node.freq);
    newList.addToHead(node);
  }

  get(key: K): V | undefined {
    const node = this._map.get(key);
    if (!node) {
      this._misses++;
      return undefined;
    }
    this._hits++;
    this._incrementFreq(node);
    return node.value;
  }

  peek(key: K): V | undefined {
    return this._map.get(key)?.value;
  }

  set(key: K, value: V): void {
    if (this._map.has(key)) {
      const node = this._map.get(key)!;
      node.value = value;
      this._incrementFreq(node);
      return;
    }
    // Evict if at capacity
    if (this._size >= this._capacity) {
      const minList = this._freqMap.get(this._minFreq);
      if (minList) {
        const evicted = minList.removeTail();
        if (evicted) {
          this._map.delete(evicted.key);
          this._size--;
          if (minList.size === 0) this._freqMap.delete(this._minFreq);
        }
      }
    }
    const node = new DLLNode<K, V>(key, value, 1);
    this._map.set(key, node);
    const list = this._getList(1);
    list.addToHead(node);
    this._minFreq = 1;
    this._size++;
  }

  has(key: K): boolean {
    return this._map.has(key);
  }

  delete(key: K): boolean {
    const node = this._map.get(key);
    if (!node) return false;
    const list = this._getList(node.freq);
    list.remove(node);
    if (list.size === 0) this._freqMap.delete(node.freq);
    this._map.delete(key);
    this._size--;
    return true;
  }

  clear(): void {
    this._map.clear();
    this._freqMap.clear();
    this._size = 0;
    this._minFreq = 0;
    this._hits = 0;
    this._misses = 0;
  }

  getFrequency(key: K): number {
    return this._map.get(key)?.freq ?? 0;
  }

  keysOrderedByFrequency(): K[] {
    const result: K[] = [];
    const freqs = Array.from(this._freqMap.keys()).sort((a, b) => a - b);
    for (const freq of freqs) {
      const list = this._freqMap.get(freq)!;
      // tail→head is LRU within freq, but spec says "least to most" frequency
      // Within same freq, order doesn't matter; we add head→tail (MRU first within bucket)
      result.push(...list.keys());
    }
    return result;
  }
}

// ─── LRU Cache ──────────────────────────────────────────────────────────────

/**
 * LRU Cache with O(1) get/set using a doubly linked list + Map.
 */
export class LRUCache<K, V> {
  private _capacity: number;
  private _map: Map<K, DLLNode<K, V>> = new Map();
  private _list: DoublyLinkedList<K, V> = new DoublyLinkedList();
  private _hits = 0;
  private _misses = 0;

  constructor(capacity: number) {
    if (capacity <= 0) throw new RangeError('LRUCache capacity must be > 0');
    this._capacity = capacity;
  }

  get capacity(): number {
    return this._capacity;
  }

  get size(): number {
    return this._map.size;
  }

  get hits(): number {
    return this._hits;
  }

  get misses(): number {
    return this._misses;
  }

  get hitRate(): number {
    const total = this._hits + this._misses;
    return total === 0 ? NaN : this._hits / total;
  }

  resetStats(): void {
    this._hits = 0;
    this._misses = 0;
  }

  get(key: K): V | undefined {
    const node = this._map.get(key);
    if (!node) {
      this._misses++;
      return undefined;
    }
    this._hits++;
    this._list.remove(node);
    this._list.addToHead(node);
    return node.value;
  }

  peek(key: K): V | undefined {
    return this._map.get(key)?.value;
  }

  set(key: K, value: V): void {
    if (this._map.has(key)) {
      const node = this._map.get(key)!;
      node.value = value;
      this._list.remove(node);
      this._list.addToHead(node);
      return;
    }
    if (this._map.size >= this._capacity) {
      const evicted = this._list.removeTail();
      if (evicted) this._map.delete(evicted.key);
    }
    const node = new DLLNode<K, V>(key, value);
    this._map.set(key, node);
    this._list.addToHead(node);
  }

  has(key: K): boolean {
    return this._map.has(key);
  }

  delete(key: K): boolean {
    const node = this._map.get(key);
    if (!node) return false;
    this._list.remove(node);
    this._map.delete(key);
    return true;
  }

  clear(): void {
    this._map.clear();
    this._list = new DoublyLinkedList();
    this._hits = 0;
    this._misses = 0;
  }

  /** Returns keys most-recently-used first. */
  keys(): K[] {
    return this._list.keys();
  }
}

// ─── FIFO Cache ─────────────────────────────────────────────────────────────

export class FIFOCache<K, V> {
  private _capacity: number;
  private _map: Map<K, V> = new Map();
  private _queue: K[] = []; // front = oldest

  constructor(capacity: number) {
    if (capacity <= 0) throw new RangeError('FIFOCache capacity must be > 0');
    this._capacity = capacity;
  }

  get capacity(): number {
    return this._capacity;
  }

  get size(): number {
    return this._map.size;
  }

  get(key: K): V | undefined {
    return this._map.get(key);
  }

  set(key: K, value: V): void {
    if (this._map.has(key)) {
      this._map.set(key, value);
      return;
    }
    if (this._map.size >= this._capacity) {
      const oldest = this._queue.shift();
      if (oldest !== undefined) this._map.delete(oldest);
    }
    this._map.set(key, value);
    this._queue.push(key);
  }

  has(key: K): boolean {
    return this._map.has(key);
  }

  delete(key: K): boolean {
    if (!this._map.has(key)) return false;
    this._map.delete(key);
    this._queue = this._queue.filter(k => k !== key);
    return true;
  }

  clear(): void {
    this._map.clear();
    this._queue = [];
  }
}

// ─── ARC Cache ──────────────────────────────────────────────────────────────

/**
 * Simplified Adaptive Replacement Cache (ARC).
 * Maintains four lists: T1 (recent, once), T2 (frequent, 2+), B1, B2 (ghost).
 * The parameter p adapts based on ghost-list hits.
 */
export class ARCCache<K, V> {
  private _capacity: number;
  private _p = 0; // target size for T1

  // T1: recently used once (LRU list)
  private _t1: Map<K, V> = new Map();
  private _t1Order: K[] = [];

  // T2: used more than once (LRU list)
  private _t2: Map<K, V> = new Map();
  private _t2Order: K[] = [];

  // Ghost lists (keys only, no values)
  private _b1: Set<K> = new Set();
  private _b1Order: K[] = [];
  private _b2: Set<K> = new Set();
  private _b2Order: K[] = [];

  constructor(capacity: number) {
    if (capacity <= 0) throw new RangeError('ARCCache capacity must be > 0');
    this._capacity = capacity;
  }

  get capacity(): number {
    return this._capacity;
  }

  get size(): number {
    return this._t1.size + this._t2.size;
  }

  has(key: K): boolean {
    return this._t1.has(key) || this._t2.has(key);
  }

  private _removeFromOrder(arr: K[], key: K): void {
    const idx = arr.indexOf(key);
    if (idx !== -1) arr.splice(idx, 1);
  }

  private _replace(inB2: boolean): void {
    const t1Full = this._t1.size > 0 && (this._t1.size > this._p || (inB2 && this._t1.size === this._p));
    if (t1Full) {
      // Evict LRU from T1, move to B1
      const oldest = this._t1Order.shift();
      if (oldest !== undefined) {
        this._t1.delete(oldest);
        this._b1.add(oldest);
        this._b1Order.push(oldest);
      }
    } else if (this._t2.size > 0) {
      // Evict LRU from T2, move to B2
      const oldest = this._t2Order.shift();
      if (oldest !== undefined) {
        this._t2.delete(oldest);
        this._b2.add(oldest);
        this._b2Order.push(oldest);
      }
    }
    // Trim ghost lists if needed
    while (this._b1.size > this._capacity) {
      const k = this._b1Order.shift();
      if (k !== undefined) this._b1.delete(k);
    }
    while (this._b2.size > this._capacity) {
      const k = this._b2Order.shift();
      if (k !== undefined) this._b2.delete(k);
    }
  }

  get(key: K): V | undefined {
    if (this._t1.has(key)) {
      const val = this._t1.get(key)!;
      // Promote to T2
      this._t1.delete(key);
      this._removeFromOrder(this._t1Order, key);
      this._t2.set(key, val);
      this._t2Order.push(key);
      return val;
    }
    if (this._t2.has(key)) {
      const val = this._t2.get(key)!;
      // Move to MRU in T2
      this._removeFromOrder(this._t2Order, key);
      this._t2Order.push(key);
      return val;
    }
    return undefined;
  }

  set(key: K, value: V): void {
    // Case 1: in T1 or T2 — update
    if (this._t1.has(key)) {
      this._t1.delete(key);
      this._removeFromOrder(this._t1Order, key);
      this._t2.set(key, value);
      this._t2Order.push(key);
      return;
    }
    if (this._t2.has(key)) {
      this._t2.set(key, value);
      this._removeFromOrder(this._t2Order, key);
      this._t2Order.push(key);
      return;
    }

    // Case 2: ghost hit in B1
    if (this._b1.has(key)) {
      this._p = Math.min(this._capacity, this._p + Math.max(1, Math.floor(this._b2.size / this._b1.size)));
      this._replace(false);
      this._b1.delete(key);
      this._removeFromOrder(this._b1Order, key);
      this._t2.set(key, value);
      this._t2Order.push(key);
      return;
    }

    // Case 3: ghost hit in B2
    if (this._b2.has(key)) {
      this._p = Math.max(0, this._p - Math.max(1, Math.floor(this._b1.size / this._b2.size)));
      this._replace(true);
      this._b2.delete(key);
      this._removeFromOrder(this._b2Order, key);
      this._t2.set(key, value);
      this._t2Order.push(key);
      return;
    }

    // Case 4: new key
    const total = this.size;
    if (total >= this._capacity) {
      this._replace(false);
    }
    this._t1.set(key, value);
    this._t1Order.push(key);
  }

  clear(): void {
    this._t1.clear();
    this._t1Order = [];
    this._t2.clear();
    this._t2Order = [];
    this._b1.clear();
    this._b1Order = [];
    this._b2.clear();
    this._b2Order = [];
    this._p = 0;
  }
}

// ─── 2Q Cache ───────────────────────────────────────────────────────────────

/**
 * 2Q (Two-Queue) cache algorithm.
 * New items enter the "in" queue (FIFO). Items accessed a second time are
 * promoted to the "main" LRU queue. Eviction hits "in" first (FIFO), then
 * "main" (LRU).
 */
export class TwoQCache<K, V> {
  private _capacity: number;
  private _inCap: number;

  // in-queue: FIFO (new items)
  private _in: Map<K, V> = new Map();
  private _inOrder: K[] = [];

  // main queue: LRU (promoted items)
  private _main: Map<K, V> = new Map();
  private _mainOrder: K[] = [];

  // ghost set (items recently evicted from in-queue)
  private _ghost: Set<K> = new Set();
  private _ghostOrder: K[] = [];

  constructor(capacity: number, inCapacity?: number) {
    if (capacity <= 0) throw new RangeError('TwoQCache capacity must be > 0');
    this._capacity = capacity;
    this._inCap = inCapacity !== undefined ? inCapacity : Math.max(1, Math.floor(capacity / 4));
  }

  get capacity(): number {
    return this._capacity;
  }

  get size(): number {
    return this._in.size + this._main.size;
  }

  has(key: K): boolean {
    return this._in.has(key) || this._main.has(key);
  }

  private _removeFromOrder(arr: K[], key: K): void {
    const idx = arr.indexOf(key);
    if (idx !== -1) arr.splice(idx, 1);
  }

  get(key: K): V | undefined {
    if (this._main.has(key)) {
      const val = this._main.get(key)!;
      this._removeFromOrder(this._mainOrder, key);
      this._mainOrder.push(key);
      return val;
    }
    if (this._in.has(key)) {
      return this._in.get(key);
    }
    return undefined;
  }

  set(key: K, value: V): void {
    // Update in main
    if (this._main.has(key)) {
      this._main.set(key, value);
      this._removeFromOrder(this._mainOrder, key);
      this._mainOrder.push(key);
      return;
    }
    // Promote from in → main
    if (this._in.has(key)) {
      this._in.delete(key);
      this._removeFromOrder(this._inOrder, key);
      this._ensureMainSpace();
      this._main.set(key, value);
      this._mainOrder.push(key);
      return;
    }
    // Ghost hit → go directly to main
    if (this._ghost.has(key)) {
      this._ghost.delete(key);
      this._removeFromOrder(this._ghostOrder, key);
      this._ensureMainSpace();
      this._main.set(key, value);
      this._mainOrder.push(key);
      return;
    }
    // New item → in-queue
    this._ensureInSpace();
    this._in.set(key, value);
    this._inOrder.push(key);
  }

  private _ensureInSpace(): void {
    if (this.size >= this._capacity) {
      // First try to evict from in-queue
      if (this._inOrder.length > 0) {
        const evicted = this._inOrder.shift()!;
        this._in.delete(evicted);
        // Add to ghost
        this._ghost.add(evicted);
        this._ghostOrder.push(evicted);
        if (this._ghostOrder.length > this._capacity) {
          const old = this._ghostOrder.shift()!;
          this._ghost.delete(old);
        }
      } else {
        // Evict from main
        const evicted = this._mainOrder.shift();
        if (evicted !== undefined) this._main.delete(evicted);
      }
    } else if (this._in.size >= this._inCap) {
      const evicted = this._inOrder.shift()!;
      this._in.delete(evicted);
      this._ghost.add(evicted);
      this._ghostOrder.push(evicted);
      if (this._ghostOrder.length > this._capacity) {
        const old = this._ghostOrder.shift()!;
        this._ghost.delete(old);
      }
    }
  }

  private _ensureMainSpace(): void {
    if (this.size >= this._capacity) {
      const evicted = this._mainOrder.shift();
      if (evicted !== undefined) this._main.delete(evicted);
    }
  }

  clear(): void {
    this._in.clear();
    this._inOrder = [];
    this._main.clear();
    this._mainOrder = [];
    this._ghost.clear();
    this._ghostOrder = [];
  }
}

// ─── Factory ─────────────────────────────────────────────────────────────────

export function createCache<K, V>(
  strategy: 'lfu' | 'lru' | 'fifo' | 'arc' | '2q',
  capacity: number,
): LFUCache<K, V> | LRUCache<K, V> | FIFOCache<K, V> | ARCCache<K, V> | TwoQCache<K, V> {
  switch (strategy) {
    case 'lfu':  return new LFUCache<K, V>(capacity);
    case 'lru':  return new LRUCache<K, V>(capacity);
    case 'fifo': return new FIFOCache<K, V>(capacity);
    case 'arc':  return new ARCCache<K, V>(capacity);
    case '2q':   return new TwoQCache<K, V>(capacity);
    default:     throw new Error(`Unknown cache strategy: ${strategy as string}`);
  }
}

// ─── Memoize helpers ─────────────────────────────────────────────────────────

export function memoizeLFU<T extends unknown[], R>(
  fn: (...args: T) => R,
  capacity: number,
  keyFn: (...args: T) => string = (...args) => JSON.stringify(args),
): (...args: T) => R {
  const cache = new LFUCache<string, R>(capacity);
  return (...args: T): R => {
    const key = keyFn(...args);
    const cached = cache.peek(key);
    if (cached !== undefined) {
      cache.get(key); // increment frequency
      return cached;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

export function memoizeLRU<T extends unknown[], R>(
  fn: (...args: T) => R,
  capacity: number,
  keyFn: (...args: T) => string = (...args) => JSON.stringify(args),
): (...args: T) => R {
  const cache = new LRUCache<string, R>(capacity);
  return (...args: T): R => {
    const key = keyFn(...args);
    const cached = cache.peek(key);
    if (cached !== undefined) {
      cache.get(key); // mark as recently used
      return cached;
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}
