// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

interface Node<K, V> {
  key: K;
  value: V;
  expiresAt: number | null;
  prev: Node<K, V> | null;
  next: Node<K, V> | null;
}

/**
 * LRUMap — Least-Recently-Used evicting Map with optional TTL.
 *
 * Internals: doubly-linked list (MRU at head, LRU at tail) + Map for O(1) operations.
 * - head.next  = most-recently used node
 * - tail.prev  = least-recently used node
 */
export class LRUMap<K, V> {
  private readonly _maxSize: number;
  private readonly _ttlMs: number | undefined;
  private readonly _clock: () => number;

  /** Sentinel head (MRU side) and tail (LRU side) — never hold real data */
  private readonly _head: Node<K, V>;
  private readonly _tail: Node<K, V>;

  private readonly _map: Map<K, Node<K, V>>;

  constructor(maxSize: number, ttlMs?: number, clock?: () => number) {
    if (maxSize < 1) throw new RangeError('maxSize must be >= 1');
    this._maxSize = maxSize;
    this._ttlMs = ttlMs;
    this._clock = clock ?? (() => Date.now());

    // Sentinel nodes — keys/values are placeholders, never accessed externally
    this._head = { key: undefined as unknown as K, value: undefined as unknown as V, expiresAt: null, prev: null, next: null };
    this._tail = { key: undefined as unknown as K, value: undefined as unknown as V, expiresAt: null, prev: null, next: null };
    this._head.next = this._tail;
    this._tail.prev = this._head;

    this._map = new Map();
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private _isExpired(node: Node<K, V>): boolean {
    if (node.expiresAt === null) return false;
    return this._clock() >= node.expiresAt;
  }

  /** Insert node immediately after sentinel head (MRU position). */
  private _insertAfterHead(node: Node<K, V>): void {
    const after = this._head.next!;
    node.prev = this._head;
    node.next = after;
    this._head.next = node;
    after.prev = node;
  }

  /** Detach node from its current list position. */
  private _detach(node: Node<K, V>): void {
    const p = node.prev!;
    const n = node.next!;
    p.next = n;
    n.prev = p;
    node.prev = null;
    node.next = null;
  }

  /** Move an existing node to the MRU (head) position. */
  private _moveToHead(node: Node<K, V>): void {
    this._detach(node);
    this._insertAfterHead(node);
  }

  /** Remove and return the LRU node (tail.prev), or null if list is empty. */
  private _evictLRU(): Node<K, V> | null {
    const lru = this._tail.prev!;
    if (lru === this._head) return null;
    this._detach(lru);
    this._map.delete(lru.key);
    return lru;
  }

  /** Lazy-expire a node: remove it and return true if it has expired. */
  private _lazyExpire(node: Node<K, V>): boolean {
    if (!this._isExpired(node)) return false;
    this._detach(node);
    this._map.delete(node.key);
    return true;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Insert or update an entry. Moves the key to MRU position.
   * Evicts the LRU entry when capacity is exceeded.
   */
  set(key: K, value: V): this {
    const existing = this._map.get(key);
    const expiresAt = this._ttlMs !== undefined ? this._clock() + this._ttlMs : null;

    if (existing !== undefined) {
      // Update in place and move to MRU
      existing.value = value;
      existing.expiresAt = expiresAt;
      this._moveToHead(existing);
      return this;
    }

    // Create new node
    const node: Node<K, V> = { key, value, expiresAt, prev: null, next: null };
    this._map.set(key, node);
    this._insertAfterHead(node);

    // Evict LRU if over capacity
    if (this._map.size > this._maxSize) {
      this._evictLRU();
    }

    return this;
  }

  /**
   * Return the value for key, moving it to MRU position.
   * Returns undefined if absent or expired (lazy expiry applied).
   */
  get(key: K): V | undefined {
    const node = this._map.get(key);
    if (node === undefined) return undefined;
    if (this._lazyExpire(node)) return undefined;
    this._moveToHead(node);
    return node.value;
  }

  /**
   * Return true if the key exists and is not expired.
   * Applies lazy expiry.
   */
  has(key: K): boolean {
    const node = this._map.get(key);
    if (node === undefined) return false;
    if (this._lazyExpire(node)) return false;
    return true;
  }

  /**
   * Remove a key. Returns true if the key existed (even if expired).
   */
  delete(key: K): boolean {
    const node = this._map.get(key);
    if (node === undefined) return false;
    this._detach(node);
    this._map.delete(key);
    return true;
  }

  /** Remove all entries. */
  clear(): void {
    this._map.clear();
    this._head.next = this._tail;
    this._tail.prev = this._head;
  }

  /**
   * Number of non-expired entries (applies lazy expiry to all entries).
   */
  get size(): number {
    // Lazy-expire all stale entries first
    if (this._ttlMs !== undefined) {
      const stale: K[] = [];
      let cur = this._head.next!;
      while (cur !== this._tail) {
        if (this._isExpired(cur)) stale.push(cur.key);
        cur = cur.next!;
      }
      for (const k of stale) this.delete(k);
    }
    return this._map.size;
  }

  /** The maximum number of entries before eviction occurs. */
  get maxSize(): number {
    return this._maxSize;
  }

  /**
   * Return all keys in MRU-first order (non-expired only).
   */
  keys(): K[] {
    const result: K[] = [];
    let cur = this._head.next!;
    while (cur !== this._tail) {
      if (!this._isExpired(cur)) result.push(cur.key);
      cur = cur.next!;
    }
    return result;
  }

  /**
   * Return all values in MRU-first order (non-expired only).
   */
  values(): V[] {
    const result: V[] = [];
    let cur = this._head.next!;
    while (cur !== this._tail) {
      if (!this._isExpired(cur)) result.push(cur.value);
      cur = cur.next!;
    }
    return result;
  }

  /**
   * Return all [key, value] pairs in MRU-first order (non-expired only).
   */
  entries(): [K, V][] {
    const result: [K, V][] = [];
    let cur = this._head.next!;
    while (cur !== this._tail) {
      if (!this._isExpired(cur)) result.push([cur.key, cur.value]);
      cur = cur.next!;
    }
    return result;
  }

  /**
   * Get value without moving to MRU position.
   * Returns undefined if absent or expired (lazy expiry applied).
   */
  peek(key: K): V | undefined {
    const node = this._map.get(key);
    if (node === undefined) return undefined;
    if (this._lazyExpire(node)) return undefined;
    return node.value;
  }

  /**
   * Invoke callback for each non-expired entry in MRU-first order.
   */
  forEach(cb: (value: V, key: K) => void): void {
    // Collect first to avoid mutation during iteration
    const pairs = this.entries();
    for (const [k, v] of pairs) cb(v, k);
  }
}
