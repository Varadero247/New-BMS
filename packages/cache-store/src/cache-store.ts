// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface CacheEntry<T> { value: T; expiresAt: number | null; hits: number; insertedAt: number; }
export interface CacheStats { size: number; hits: number; misses: number; evictions: number; }

export class LRUCache<T> {
  private map = new Map<string, CacheEntry<T>>();
  private hitCount = 0; private missCount = 0; private evictionCount = 0;
  constructor(private maxSize: number, private defaultTtlMs: number | null = null) {}
  get(key: string): T | undefined {
    const e = this.map.get(key);
    if (!e) { this.missCount++; return undefined; }
    if (e.expiresAt !== null && Date.now() > e.expiresAt) { this.map.delete(key); this.missCount++; return undefined; }
    this.hitCount++; e.hits++;
    this.map.delete(key); this.map.set(key, e);
    return e.value;
  }
  set(key: string, value: T, ttlMs?: number): void {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size >= this.maxSize) { const oldest = this.map.keys().next().value; if (oldest) { this.map.delete(oldest); this.evictionCount++; } }
    const expiresAt = ttlMs != null ? Date.now()+ttlMs : this.defaultTtlMs != null ? Date.now()+this.defaultTtlMs : null;
    this.map.set(key, { value, expiresAt, hits: 0, insertedAt: Date.now() });
  }
  has(key: string): boolean { return this.get(key) !== undefined; }
  delete(key: string): boolean { return this.map.delete(key); }
  clear(): void { this.map.clear(); this.evictionCount += this.map.size; }
  get size(): number { return this.map.size; }
  stats(): CacheStats { return { size: this.map.size, hits: this.hitCount, misses: this.missCount, evictions: this.evictionCount }; }
  keys(): string[] { return [...this.map.keys()]; }
  values(): T[] { return [...this.map.values()].map(e => e.value); }
  entries(): [string, T][] { return [...this.map.entries()].map(([k,e]) => [k, e.value]); }
  evictExpired(): number {
    const now = Date.now(); let n = 0;
    for (const [k,e] of this.map) if (e.expiresAt !== null && now > e.expiresAt) { this.map.delete(k); n++; }
    return n;
  }
}

export class TTLCache<T> extends LRUCache<T> {
  constructor(defaultTtlMs: number, maxSize = 1000) { super(maxSize, defaultTtlMs); }
}

export class LFUCache<T> {
  private values = new Map<string, T>();
  private freq = new Map<string, number>();
  private hitCount = 0; private missCount = 0; private evictionCount = 0;
  constructor(private maxSize: number) {}
  get(key: string): T | undefined {
    if (!this.values.has(key)) { this.missCount++; return undefined; }
    this.hitCount++; this.freq.set(key, (this.freq.get(key) ?? 0) + 1);
    return this.values.get(key);
  }
  set(key: string, value: T): void {
    if (this.values.has(key)) { this.values.set(key, value); this.freq.set(key, (this.freq.get(key) ?? 0)+1); return; }
    if (this.values.size >= this.maxSize) {
      let minFreq = Infinity, minKey = '';
      for (const [k,f] of this.freq) if (f < minFreq) { minFreq = f; minKey = k; }
      this.values.delete(minKey); this.freq.delete(minKey); this.evictionCount++;
    }
    this.values.set(key, value); this.freq.set(key, 1);
  }
  delete(key: string): boolean { this.freq.delete(key); return this.values.delete(key); }
  clear(): void { this.values.clear(); this.freq.clear(); }
  get size(): number { return this.values.size; }
  stats(): CacheStats { return { size: this.values.size, hits: this.hitCount, misses: this.missCount, evictions: this.evictionCount }; }
}

export function memoize<T>(fn: (...args: unknown[]) => T, keyFn?: (...args: unknown[]) => string): (...args: unknown[]) => T {
  const cache = new Map<string, T>();
  return (...args: unknown[]) => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key)!;
  };
}
