// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export class LRUCache<K, V> {
  private map = new Map<K, V>();
  constructor(private capacity: number) {}
  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined;
    const val = this.map.get(key)!;
    this.map.delete(key);
    this.map.set(key, val);
    return val;
  }
  set(key: K, value: V): void {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.capacity) this.map.delete(this.map.keys().next().value as K);
    this.map.set(key, value);
  }
  has(key: K): boolean { return this.map.has(key); }
  get size(): number { return this.map.size; }
  clear(): void { this.map.clear(); }
}

export class MRUCache<K, V> {
  private keys: K[] = [];
  private map = new Map<K, V>();
  constructor(private capacity: number) {}
  get(key: K): V | undefined { return this.map.get(key); }
  set(key: K, value: V): void {
    if (this.map.has(key)) {
      this.keys = this.keys.filter(k => k !== key);
    } else if (this.map.size >= this.capacity && this.keys.length > 0) {
      const mru = this.keys.pop()!;
      this.map.delete(mru);
    }
    this.keys.push(key);
    this.map.set(key, value);
  }
  has(key: K): boolean { return this.map.has(key); }
  get size(): number { return this.map.size; }
}

export class TTLCache<K, V> {
  private map = new Map<K, { value: V; expires: number }>();
  constructor(private ttlMs: number) {}
  set(key: K, value: V): void {
    this.map.set(key, { value, expires: Date.now() + this.ttlMs });
  }
  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expires) { this.map.delete(key); return undefined; }
    return entry.value;
  }
  has(key: K): boolean { return this.get(key) !== undefined; }
  delete(key: K): boolean { return this.map.delete(key); }
  get size(): number { return this.map.size; }
}

export class WriteBackCache<K, V> {
  private dirty = new Map<K, V>();
  private clean = new Map<K, V>();
  get(key: K): V | undefined { return this.dirty.get(key) ?? this.clean.get(key); }
  write(key: K, value: V): void { this.dirty.set(key, value); }
  flush(): Map<K, V> {
    const out = new Map(this.dirty);
    for (const [k, v] of this.dirty) this.clean.set(k, v);
    this.dirty.clear();
    return out;
  }
  isDirty(key: K): boolean { return this.dirty.has(key); }
  get dirtyCount(): number { return this.dirty.size; }
}

export class ReadThroughCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private loader: (key: K) => V) {}
  get(key: K): V {
    if (!this.cache.has(key)) this.cache.set(key, this.loader(key));
    return this.cache.get(key)!;
  }
  invalidate(key: K): void { this.cache.delete(key); }
  get size(): number { return this.cache.size; }
}
