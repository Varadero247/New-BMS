// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

/** djb2 hash for strings. Returns a non-negative 32-bit integer. */
export function hashString(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h) ^ s.charCodeAt(i);
  }
  return h >>> 0;
}

/** Murmur-style integer hash. Returns a non-negative 32-bit integer. */
export function hashInteger(n: number): number {
  let h = n | 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b);
  h = h ^ (h >>> 16);
  return h >>> 0;
}

function universalHash(key: unknown): number {
  if (typeof key === 'number') return hashInteger(key);
  return hashString(String(key));
}

interface SCEntry<K, V> { key: K; value: V; }

export class HashTable<K, V> {
  private buckets: Array<Array<SCEntry<K, V>>>;
  private _size = 0;
  private readonly capacity: number;
  constructor(capacity = 64) {
    this.capacity = capacity;
    this.buckets = Array.from({ length: capacity }, () => []);
  }
  private index(key: K): number { return universalHash(key) % this.capacity; }
  set(key: K, value: V): void {
    const idx = this.index(key);
    const bucket = this.buckets[idx];
    for (const entry of bucket) {
      if (entry.key === key) { entry.value = value; return; }
    }
    bucket.push({ key, value });
    this._size++;
  }
  get(key: K): V | undefined {
    for (const entry of this.buckets[this.index(key)]) {
      if (entry.key === key) return entry.value;
    }
    return undefined;
  }
  has(key: K): boolean {
    return this.buckets[this.index(key)].some((e) => e.key === key);
  }
  delete(key: K): boolean {
    const idx = this.index(key);
    const pos = this.buckets[idx].findIndex((e) => e.key === key);
    if (pos === -1) return false;
    this.buckets[idx].splice(pos, 1);
    this._size--;
    return true;
  }
  get size(): number { return this._size; }
  clear(): void { this.buckets = Array.from({ length: this.capacity }, () => []); this._size = 0; }
  keys(): K[] { return this.buckets.flatMap((b) => b.map((e) => e.key)); }
  values(): V[] { return this.buckets.flatMap((b) => b.map((e) => e.value)); }
  entries(): [K, V][] { return this.buckets.flatMap((b) => b.map((e): [K, V] => [e.key, e.value])); }
  loadFactor(): number { return this._size / this.capacity; }
}

const DELETED = Symbol("DELETED");
interface OASlot { key: unknown; value: unknown; }
type Slot = OASlot | symbol | null;
function isEntry(s: Slot): s is OASlot {
  return s !== null && typeof s !== "symbol";
}

export class OpenAddressingTable<K, V> {
  private slots: (OASlot | symbol | null)[];
  private _size = 0;
  private capacity: number;
  constructor(capacity = 64) {
    this.capacity = capacity;
    this.slots = new Array(capacity).fill(null);
  }
  private index(key: K): number { return universalHash(key) % this.capacity; }
  private grow(): void {
    const old = this.slots;
    this.capacity *= 2;
    this.slots = new Array(this.capacity).fill(null);
    this._size = 0;
    for (const s of old) { if (s !== null && typeof s !== "symbol") this.set((s as OASlot).key as K, (s as OASlot).value as V); }
  }
  set(key: K, value: V): void {
    if (this._size / this.capacity >= 0.7) this.grow();
    let idx = this.index(key);
    let firstDeleted = -1;
    for (let p = 0; p < this.capacity; p++) {
      const s = this.slots[idx];
      if (s === null) {
        this.slots[firstDeleted !== -1 ? firstDeleted : idx] = { key, value };
        this._size++; return;
      }
      if (typeof s === "symbol") { if (firstDeleted === -1) firstDeleted = idx; }
      else if ((s as OASlot).key === key) { (s as OASlot).value = value; return; }
      idx = (idx + 1) % this.capacity;
    }
    if (firstDeleted !== -1) { this.slots[firstDeleted] = { key, value }; this._size++; }
  }
  get(key: K): V | undefined {
    let idx = this.index(key);
    for (let p = 0; p < this.capacity; p++) {
      const s = this.slots[idx];
      if (s === null) return undefined;
      if (typeof s !== "symbol" && (s as OASlot).key === key) return (s as OASlot).value as V;
      idx = (idx + 1) % this.capacity;
    }
    return undefined;
  }
  has(key: K): boolean { return this.get(key) !== undefined; }
  delete(key: K): boolean {
    let idx = this.index(key);
    for (let p = 0; p < this.capacity; p++) {
      const s = this.slots[idx];
      if (s === null) return false;
      if (typeof s !== "symbol" && (s as OASlot).key === key) {
        this.slots[idx] = DELETED; this._size--; return true;
      }
      idx = (idx + 1) % this.capacity;
    }
    return false;
  }
  get size(): number { return this._size; }
  clear(): void { this.slots = new Array(this.capacity).fill(null); this._size = 0; }
  keys(): K[] { const r: K[] = []; for (const s of this.slots) { if (s !== null && typeof s !== "symbol") r.push((s as OASlot).key as K); } return r; }
  values(): V[] { const r: V[] = []; for (const s of this.slots) { if (s !== null && typeof s !== "symbol") r.push((s as OASlot).value as V); } return r; }
}
function step2(key: unknown, cap: number): number {
  const h = universalHash(key);
  const s = 1 + (h % Math.max(cap - 1, 1));
  return s === 0 ? 1 : s;
}

export class DoubleHashTable<K, V> {
  private slots: (OASlot | symbol | null)[];
  private _size = 0;
  private capacity: number;
  constructor(capacity = 67) {
    this.capacity = capacity;
    this.slots = new Array(capacity).fill(null);
  }
  private grow(): void {
    const old = this.slots;
    this.capacity = this.capacity * 2 + 1;
    this.slots = new Array(this.capacity).fill(null);
    this._size = 0;
    for (const s of old) { if (s !== null && typeof s !== "symbol") this.set((s as OASlot).key as K, (s as OASlot).value as V); }
  }
  set(key: K, value: V): void {
    if (this._size / this.capacity >= 0.7) this.grow();
    const h1 = universalHash(key) % this.capacity;
    const h2 = step2(key, this.capacity);
    let firstDeleted = -1;
    for (let p = 0; p < this.capacity; p++) {
      const idx = (h1 + p * h2) % this.capacity;
      const s = this.slots[idx];
      if (s === null) {
        this.slots[firstDeleted !== -1 ? firstDeleted : idx] = { key, value };
        this._size++; return;
      }
      if (typeof s === "symbol") { if (firstDeleted === -1) firstDeleted = idx; }
      else if ((s as OASlot).key === key) { (s as OASlot).value = value; return; }
    }
    if (firstDeleted !== -1) { this.slots[firstDeleted] = { key, value }; this._size++; }
  }
  get(key: K): V | undefined {
    const h1 = universalHash(key) % this.capacity;
    const h2 = step2(key, this.capacity);
    for (let p = 0; p < this.capacity; p++) {
      const idx = (h1 + p * h2) % this.capacity;
      const s = this.slots[idx];
      if (s === null) return undefined;
      if (typeof s !== "symbol" && (s as OASlot).key === key) return (s as OASlot).value as V;
    }
    return undefined;
  }
  has(key: K): boolean { return this.get(key) !== undefined; }
  delete(key: K): boolean {
    const h1 = universalHash(key) % this.capacity;
    const h2 = step2(key, this.capacity);
    for (let p = 0; p < this.capacity; p++) {
      const idx = (h1 + p * h2) % this.capacity;
      const s = this.slots[idx];
      if (s === null) return false;
      if (typeof s !== "symbol" && (s as OASlot).key === key) {
        this.slots[idx] = DELETED; this._size--; return true;
      }
    }
    return false;
  }
  get size(): number { return this._size; }
  clear(): void { this.slots = new Array(this.capacity).fill(null); this._size = 0; }
  keys(): K[] { const r: K[] = []; for (const s of this.slots) { if (s !== null && typeof s !== "symbol") r.push((s as OASlot).key as K); } return r; }
  values(): V[] { const r: V[] = []; for (const s of this.slots) { if (s !== null && typeof s !== "symbol") r.push((s as OASlot).value as V); } return r; }
}