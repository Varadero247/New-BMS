// Copyright (c) 2026 Nexara DMCC. All rights reserved.

function murmur3(str: string, seed: number): number {
  let h = seed >>> 0;
  for (let i = 0; i < str.length; i++) {
    let k = str.charCodeAt(i);
    k = Math.imul(k, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, 0x1b873593);
    h ^= k; h = (h << 13) | (h >>> 19);
    h = (Math.imul(h, 5) + 0xe6546b64) | 0;
  }
  h ^= str.length; h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
}

const DELETED = Symbol('DELETED');

export class CuckooHashMap<V> {
  private t1: Array<[string, V] | null | typeof DELETED>;
  private t2: Array<[string, V] | null | typeof DELETED>;
  private capacity: number;
  private count: number;
  private seed1: number;
  private seed2: number;
  private readonly MAX_LOOP = 500;

  constructor(capacity = 64, seed1 = 0x12345678, seed2 = 0x87654321) {
    this.capacity = Math.max(capacity, 8);
    this.t1 = new Array(this.capacity).fill(null);
    this.t2 = new Array(this.capacity).fill(null);
    this.count = 0;
    this.seed1 = seed1;
    this.seed2 = seed2;
  }

  private h1(key: string): number { return murmur3(key, this.seed1) % this.capacity; }
  private h2(key: string): number { return murmur3(key, this.seed2) % this.capacity; }

  set(key: string, value: V): void {
    // Check if key exists first — update in place
    const i1 = this.h1(key), i2 = this.h2(key);
    const e1 = this.t1[i1], e2 = this.t2[i2];
    if (e1 && e1 !== DELETED && (e1 as [string, V])[0] === key) {
      (this.t1[i1] as [string, V])[1] = value; return;
    }
    if (e2 && e2 !== DELETED && (e2 as [string, V])[0] === key) {
      (this.t2[i2] as [string, V])[1] = value; return;
    }

    // Insert new key via cuckoo displacement
    this.count++;
    let cur: [string, V] = [key, value];
    let useT1 = true;

    for (let i = 0; i < this.MAX_LOOP; i++) {
      if (useT1) {
        const pos = this.h1(cur[0]);
        const existing = this.t1[pos];
        this.t1[pos] = cur;
        if (!existing || existing === DELETED) return;
        cur = existing as [string, V];
        useT1 = false;
      } else {
        const pos = this.h2(cur[0]);
        const existing = this.t2[pos];
        this.t2[pos] = cur;
        if (!existing || existing === DELETED) return;
        cur = existing as [string, V];
        useT1 = true;
      }
    }

    // Cycle detected — rehash and re-insert the displaced entry
    this.count--; // undo the increment; rehash + set will re-add
    this.rehash();
    this.set(cur[0], cur[1]);
  }

  get(key: string): V | undefined {
    const i1 = this.h1(key), i2 = this.h2(key);
    const e1 = this.t1[i1];
    if (e1 && e1 !== DELETED && (e1 as [string, V])[0] === key) return (e1 as [string, V])[1];
    const e2 = this.t2[i2];
    if (e2 && e2 !== DELETED && (e2 as [string, V])[0] === key) return (e2 as [string, V])[1];
    return undefined;
  }

  has(key: string): boolean { return this.get(key) !== undefined; }

  delete(key: string): boolean {
    const i1 = this.h1(key);
    if (this.t1[i1] && this.t1[i1] !== DELETED && (this.t1[i1] as [string, V])[0] === key) {
      this.t1[i1] = DELETED; this.count--; return true;
    }
    const i2 = this.h2(key);
    if (this.t2[i2] && this.t2[i2] !== DELETED && (this.t2[i2] as [string, V])[0] === key) {
      this.t2[i2] = DELETED; this.count--; return true;
    }
    return false;
  }

  private rehash(): void {
    const old1 = this.t1.slice(), old2 = this.t2.slice();
    this.capacity *= 2;
    this.t1 = new Array(this.capacity).fill(null);
    this.t2 = new Array(this.capacity).fill(null);
    this.count = 0;
    this.seed1 = murmur3(String(this.seed1), 0x1234) >>> 0;
    this.seed2 = murmur3(String(this.seed2), 0x5678) >>> 0;
    for (const e of [...old1, ...old2]) {
      if (e && e !== DELETED) this.set((e as [string, V])[0], (e as [string, V])[1]);
    }
  }

  get size(): number { return this.count; }
  get loadFactor(): number { return this.count / (2 * this.capacity); }

  keys(): string[] {
    const result: string[] = [];
    for (const e of [...this.t1, ...this.t2]) {
      if (e && e !== DELETED) result.push((e as [string, V])[0]);
    }
    return result;
  }

  values(): V[] {
    return this.keys().map(k => this.get(k)!);
  }

  entries(): Array<[string, V]> {
    return this.keys().map(k => [k, this.get(k)!]);
  }

  clear(): void {
    this.t1.fill(null); this.t2.fill(null); this.count = 0;
  }
}

// Robin Hood Hash Map (linear probing with displacement tracking)
export class RobinHoodHashMap<V> {
  private _keys: Array<string | null>;
  private _vals: Array<V | null>;
  private _dists: number[]; // probe distance from ideal slot (-1 = empty)
  private capacity: number;
  private count: number;
  private readonly LOAD_THRESHOLD = 0.65;

  constructor(capacity = 16) {
    this.capacity = Math.max(capacity, 8);
    this._keys = new Array(this.capacity).fill(null);
    this._vals = new Array(this.capacity).fill(null);
    this._dists = new Array(this.capacity).fill(-1);
    this.count = 0;
  }

  private hash(key: string): number { return murmur3(key, 42) % this.capacity; }

  set(key: string, value: V): void {
    if (this.count / this.capacity >= this.LOAD_THRESHOLD) this.grow();
    this._insert(key, value, true);
  }

  // Internal insert. When isNewEntry=true, increments count on a new key.
  private _insert(key: string, value: V, isNewEntry: boolean): void {
    let pos = this.hash(key);
    let dist = 0;
    let curKey: string = key;
    let curVal: V = value;
    let counted = false; // have we incremented count for this new key?

    for (let step = 0; step < this.capacity; step++) {
      const idx = (pos + step) % this.capacity;

      if (this._dists[idx] === -1) {
        // Empty slot — place here
        this._keys[idx] = curKey;
        this._vals[idx] = curVal;
        this._dists[idx] = dist;
        if (isNewEntry && !counted) this.count++;
        return;
      }

      if (this._keys[idx] === key) {
        // Existing key — update value only (no count change)
        this._vals[idx] = value;
        return;
      }

      // Robin Hood: if existing entry has shorter probe distance, steal its slot
      if (this._dists[idx] < dist) {
        // Place curKey here, continue with the displaced entry
        const tmpK = this._keys[idx]!;
        const tmpV = this._vals[idx]!;
        const tmpD = this._dists[idx];

        this._keys[idx] = curKey;
        this._vals[idx] = curVal;
        this._dists[idx] = dist;

        if (isNewEntry && !counted) {
          this.count++;
          counted = true;
        }

        // Now re-home the displaced entry
        // Reset to probe from displaced entry's ideal slot
        curKey = tmpK;
        curVal = tmpV;
        // The displaced entry's ideal position:
        const displacedHome = this.hash(curKey);
        // Its new dist when starting from the NEXT slot after idx:
        dist = ((idx + 1) % this.capacity - displacedHome + this.capacity) % this.capacity;
        pos = (idx + 1) % this.capacity;
        step = -1; // will become 0 at loop increment, then idx = pos + 0 = pos
        isNewEntry = false; // the displaced entry already existed (was counted)
        continue;
      }

      dist++;
    }
  }

  get(key: string): V | undefined {
    const startPos = this.hash(key);
    for (let i = 0; i < this.capacity; i++) {
      const idx = (startPos + i) % this.capacity;
      if (this._dists[idx] === -1) return undefined;
      if (this._dists[idx] < i) return undefined; // invariant: can't be further than this
      if (this._keys[idx] === key) return this._vals[idx]!;
    }
    return undefined;
  }

  has(key: string): boolean { return this.get(key) !== undefined; }

  private grow(): void {
    const oldKeys = this._keys.slice();
    const oldVals = this._vals.slice();
    const oldCap = oldKeys.length;
    this.capacity *= 2;
    this._keys = new Array(this.capacity).fill(null);
    this._vals = new Array(this.capacity).fill(null);
    this._dists = new Array(this.capacity).fill(-1);
    this.count = 0;
    for (let i = 0; i < oldCap; i++) {
      if (oldKeys[i] !== null && this._dists !== null) {
        this._insert(oldKeys[i]!, oldVals[i]!, true);
      }
    }
  }

  delete(key: string): boolean {
    const startPos = this.hash(key);
    let foundIdx = -1;
    for (let i = 0; i < this.capacity; i++) {
      const idx = (startPos + i) % this.capacity;
      if (this._dists[idx] === -1) return false;
      if (this._dists[idx] < i) return false;
      if (this._keys[idx] === key) { foundIdx = idx; break; }
    }
    if (foundIdx === -1) return false;

    // Backward shift deletion: shift subsequent entries back by one
    let cur = foundIdx;
    while (true) {
      const next = (cur + 1) % this.capacity;
      // Stop if next slot is empty or is at its ideal position (dist === 0)
      if (this._dists[next] === -1 || this._dists[next] === 0) {
        this._keys[cur] = null;
        this._vals[cur] = null;
        this._dists[cur] = -1;
        break;
      }
      this._keys[cur] = this._keys[next];
      this._vals[cur] = this._vals[next];
      this._dists[cur] = this._dists[next] - 1;
      cur = next;
    }
    this.count--;
    return true;
  }

  get size(): number { return this.count; }

  clear(): void {
    this._keys.fill(null);
    this._vals.fill(null);
    this._dists.fill(-1);
    this.count = 0;
  }
}

// Double Hashing map
export class DoubleHashMap<V> {
  private _keys: Array<string | null>;
  private _vals: Array<V | null>;
  private capacity: number;
  private count: number;
  private readonly DELETED_KEY = '\x00__DELETED__\x00';

  constructor(capacity = 17) { // prime for better distribution
    this.capacity = capacity;
    this._keys = new Array(capacity).fill(null);
    this._vals = new Array(capacity).fill(null);
    this.count = 0;
  }

  private h1(key: string): number { return murmur3(key, 1) % this.capacity; }
  private h2(key: string): number {
    const h = murmur3(key, 2) % (this.capacity - 1);
    return h === 0 ? 1 : h; // ensure non-zero step
  }

  set(key: string, value: V): void {
    if (this.count / this.capacity > 0.6) this.grow();
    const pos = this.h1(key);
    const step = this.h2(key);
    let firstDeleted = -1;
    for (let i = 0; i < this.capacity; i++) {
      const idx = (pos + i * step) % this.capacity;
      if (this._keys[idx] === null) {
        const insertAt = firstDeleted >= 0 ? firstDeleted : idx;
        this._keys[insertAt] = key;
        this._vals[insertAt] = value;
        this.count++;
        return;
      }
      if (this._keys[idx] === key) {
        this._vals[idx] = value;
        return;
      }
      if (this._keys[idx] === this.DELETED_KEY && firstDeleted < 0) {
        firstDeleted = idx;
      }
    }
    if (firstDeleted >= 0) {
      this._keys[firstDeleted] = key;
      this._vals[firstDeleted] = value;
      this.count++;
    }
  }

  get(key: string): V | undefined {
    const pos = this.h1(key);
    const step = this.h2(key);
    for (let i = 0; i < this.capacity; i++) {
      const idx = (pos + i * step) % this.capacity;
      if (this._keys[idx] === null) return undefined;
      if (this._keys[idx] === key) return this._vals[idx]!;
    }
    return undefined;
  }

  has(key: string): boolean { return this.get(key) !== undefined; }

  delete(key: string): boolean {
    const pos = this.h1(key);
    const step = this.h2(key);
    for (let i = 0; i < this.capacity; i++) {
      const idx = (pos + i * step) % this.capacity;
      if (this._keys[idx] === null) return false;
      if (this._keys[idx] === key) {
        this._keys[idx] = this.DELETED_KEY;
        this._vals[idx] = null;
        this.count--;
        return true;
      }
    }
    return false;
  }

  private grow(): void {
    const oldKeys = this._keys.slice();
    const oldVals = this._vals.slice();
    // Find next prime >= 2 * capacity
    let nc = this.capacity * 2 + 1;
    while (!this.isPrime(nc)) nc += 2;
    this.capacity = nc;
    this._keys = new Array(nc).fill(null);
    this._vals = new Array(nc).fill(null);
    this.count = 0;
    for (let i = 0; i < oldKeys.length; i++) {
      if (oldKeys[i] !== null && oldKeys[i] !== this.DELETED_KEY) {
        this.set(oldKeys[i]!, oldVals[i]!);
      }
    }
  }

  private isPrime(n: number): boolean {
    if (n < 2) return false;
    for (let i = 2; i * i <= n; i++) if (n % i === 0) return false;
    return true;
  }

  get size(): number { return this.count; }

  clear(): void {
    this._keys.fill(null);
    this._vals.fill(null);
    this.count = 0;
  }
}
