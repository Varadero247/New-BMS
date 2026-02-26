// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

// LRU Cache

interface LRUNode<K, V> {
  key: K;
  value: V;
  prev: LRUNode<K, V> | null;
  next: LRUNode<K, V> | null;
}

export class LRUCache<K, V> {
  private readonly capacity: number;
  private readonly map: Map<K, LRUNode<K, V>>;
  private head: LRUNode<K, V>;
  private tail: LRUNode<K, V>;

  constructor(capacity: number) {
    if (capacity < 1) throw new RangeError("Capacity must be >= 1");
    this.capacity = capacity;
    this.map = new Map();
    this.head = { key: null as unknown as K, value: null as unknown as V, prev: null, next: null };
    this.tail = { key: null as unknown as K, value: null as unknown as V, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  private removeNode(node: LRUNode<K, V>): void {
    node.prev!.next = node.next;
    node.next!.prev = node.prev;
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
      return;
    }
    if (this.map.size >= this.capacity) {
      const lru = this.tail.prev!;
      this.removeNode(lru);
      this.map.delete(lru.key);
    }
    const node: LRUNode<K, V> = { key, value, prev: null, next: null };
    this.insertAfterHead(node);
    this.map.set(key, node);
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
    let cur = this.head.next;
    while (cur !== this.tail) {
      result.push(cur!.key);
      cur = cur!.next;
    }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    let cur = this.head.next;
    while (cur !== this.tail) {
      result.push(cur!.value);
      cur = cur!.next;
    }
    return result;
  }

  entries(): [K, V][] {
    const result: [K, V][] = [];
    let cur = this.head.next;
    while (cur !== this.tail) {
      result.push([cur!.key, cur!.value]);
      cur = cur!.next;
    }
    return result;
  }
}

// LFU Cache

interface LFUEntry<V> {
  value: V;
  freq: number;
}

export class LFUCache<K, V> {
  private readonly capacity: number;
  private readonly keyMap: Map<K, LFUEntry<V>>;
  private readonly freqMap: Map<number, Set<K>>;
  private minFreq: number;

  constructor(capacity: number) {
    if (capacity < 1) throw new RangeError("Capacity must be >= 1");
    this.capacity = capacity;
    this.keyMap = new Map();
    this.freqMap = new Map();
    this.minFreq = 0;
  }

  private incrementFreq(key: K): void {
    const entry = this.keyMap.get(key)!;
    const oldFreq = entry.freq;
    entry.freq += 1;
    const oldSet = this.freqMap.get(oldFreq)!;
    oldSet.delete(key);
    if (oldSet.size === 0) {
      this.freqMap.delete(oldFreq);
      if (this.minFreq === oldFreq) this.minFreq = entry.freq;
    }
    if (!this.freqMap.has(entry.freq)) this.freqMap.set(entry.freq, new Set());
    this.freqMap.get(entry.freq)!.add(key);
  }

  get(key: K): V | undefined {
    const entry = this.keyMap.get(key);
    if (!entry) return undefined;
    this.incrementFreq(key);
    return entry.value;
  }

  set(key: K, value: V): void {
    if (this.keyMap.has(key)) {
      this.keyMap.get(key)!.value = value;
      this.incrementFreq(key);
      return;
    }
    if (this.keyMap.size >= this.capacity) {
      const minSet = this.freqMap.get(this.minFreq)!;
      const evictKey = minSet.values().next().value as K;
      minSet.delete(evictKey);
      if (minSet.size === 0) this.freqMap.delete(this.minFreq);
      this.keyMap.delete(evictKey);
    }
    this.keyMap.set(key, { value, freq: 1 });
    if (!this.freqMap.has(1)) this.freqMap.set(1, new Set());
    this.freqMap.get(1)!.add(key);
    this.minFreq = 1;
  }

  has(key: K): boolean {
    return this.keyMap.has(key);
  }

  delete(key: K): boolean {
    const entry = this.keyMap.get(key);
    if (!entry) return false;
    const freqSet = this.freqMap.get(entry.freq)!;
    freqSet.delete(key);
    if (freqSet.size === 0) this.freqMap.delete(entry.freq);
    this.keyMap.delete(key);
    return true;
  }

  clear(): void {
    this.keyMap.clear();
    this.freqMap.clear();
    this.minFreq = 0;
  }

  get size(): number {
    return this.keyMap.size;
  }
}

// TTL Cache

interface TTLEntry<V> {
  value: V;
  expiresAt: number;
}

export class TTLCache<K, V> {
  private readonly capacity: number;
  private readonly ttlMs: number;
  private readonly store: Map<K, TTLEntry<V>>;

  constructor(capacity: number, ttlMs: number) {
    if (capacity < 1) throw new RangeError("Capacity must be >= 1");
    if (ttlMs <= 0) throw new RangeError("TTL must be > 0");
    this.capacity = capacity;
    this.ttlMs = ttlMs;
    this.store = new Map();
  }

  private isExpired(entry: TTLEntry<V>): boolean {
    return Date.now() > entry.expiresAt;
  }

  private evictExpired(): void {
    for (const [key, entry] of this.store) {
      if (this.isExpired(entry)) this.store.delete(key);
    }
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (this.isExpired(entry)) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value;
  }

  set(key: K, value: V): void {
    if (!this.store.has(key) && this.store.size >= this.capacity) {
      this.evictExpired();
      if (this.store.size >= this.capacity) {
        const firstKey = this.store.keys().next().value as K;
        this.store.delete(firstKey);
      }
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  has(key: K): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (this.isExpired(entry)) {
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

  get size(): number {
    this.evictExpired();
    return this.store.size;
  }
}
