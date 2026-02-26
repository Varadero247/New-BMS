// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export class VanEmdeBoasSet {
  private readonly _u: number;
  private _bits: Uint32Array;
  private _size: number;

  constructor(universeSize: number) {
    if (universeSize < 1 || universeSize > 65536)
      throw new RangeError("universeSize must be 1..65536, got " + universeSize);
    if ((universeSize & (universeSize - 1)) !== 0)
      throw new RangeError("universeSize must be power of 2, got " + universeSize);
    this._u = universeSize;
    this._bits = new Uint32Array(Math.ceil(universeSize / 32));
    this._size = 0;
  }

  get universeSize(): number { return this._u; }
  get size(): number { return this._size; }

  private _check(x: number): void {
    if (!Number.isInteger(x) || x < 0 || x >= this._u)
      throw new RangeError("Value " + x + " out of range [0, " + this._u + ")");
  }

  insert(x: number): void {
    this._check(x);
    const word = x >>> 5, bit = x & 31, mask = 1 << bit;
    if ((this._bits[word] & mask) === 0) { this._bits[word] |= mask; this._size++; }
  }

  delete(x: number): void {
    this._check(x);
    const word = x >>> 5, bit = x & 31, mask = 1 << bit;
    if ((this._bits[word] & mask) !== 0) { this._bits[word] &= ~mask; this._size--; }
  }

  has(x: number): boolean {
    if (!Number.isInteger(x) || x < 0 || x >= this._u) return false;
    const w = x >>> 5, b = x & 31;
    return (this._bits[w] >>> b & 1) === 1;
  }

  min(): number | null {
    for (let w = 0; w < this._bits.length; w++) {
      const v = this._bits[w];
      if (v !== 0) return w * 32 + _ctz32(v);
    }
    return null;
  }

  max(): number | null {
    for (let w = this._bits.length - 1; w >= 0; w--) {
      const v = this._bits[w];
      if (v !== 0) return w * 32 + _clz32c(v);
    }
    return null;
  }

  successor(x: number): number | null {
    if (!Number.isInteger(x)) return null;
    const start = x + 1;
    if (start >= this._u) return null;
    const sw = start >>> 5, sb = start & 31;
    const fw = this._bits[sw];
    const fm = fw & (~0 << sb);
    if (fm !== 0) return sw * 32 + _ctz32(fm);
    for (let w = sw + 1; w < this._bits.length; w++) {
      const bw = this._bits[w];
      if (bw !== 0) return w * 32 + _ctz32(bw);
    }
    return null;
  }

  predecessor(x: number): number | null {
    if (!Number.isInteger(x)) return null;
    const end = x - 1;
    if (end < 0) return null;
    const ew = end >>> 5, eb = end & 31;
    const ew2 = this._bits[ew];
    const lm = ew2 & ((2 << eb) - 1);
    if (lm !== 0) return ew * 32 + _clz32c(lm);
    for (let w = ew - 1; w >= 0; w--) {
      const bw = this._bits[w];
      if (bw !== 0) return w * 32 + _clz32c(bw);
    }
    return null;
  }

  toArray(): number[] {
    const result: number[] = [];
    for (let w = 0; w < this._bits.length; w++) {
      let v = this._bits[w];
      while (v !== 0) { result.push(w * 32 + _ctz32(v)); v &= v - 1; }
    }
    return result;
  }

  clear(): void { this._bits.fill(0); this._size = 0; }
}

function _ctz32(v: number): number {
  if (v === 0) return 32;
  let c = 0;
  if ((v & 0x0000ffff) === 0) { c += 16; v >>>= 16; }
  if ((v & 0x000000ff) === 0) { c += 8;  v >>>= 8; }
  if ((v & 0x0000000f) === 0) { c += 4;  v >>>= 4; }
  if ((v & 0x00000003) === 0) { c += 2;  v >>>= 2; }
  if ((v & 0x00000001) === 0) { c += 1; }
  return c;
}

function _clz32c(v: number): number { return 31 - Math.clz32(v); }

export class IntegerMinHeap {
  private _data: number[];
  constructor() { this._data = []; }
  get size(): number { return this._data.length; }
  peek(): number | undefined { return this._data[0]; }
  has(x: number): boolean { return this._data.includes(x); }
  toArray(): number[] { return [...this._data]; }
  toSortedArray(): number[] { return [...this._data].sort((a, b) => a - b); }
  clear(): void { this._data = []; }

  push(x: number): void {
    this._data.push(x);
    let i = this._data.length - 1;
    while (i > 0) {
      const p = (i - 1) >>> 1;
      if (this._data[p] <= this._data[i]) break;
      const tmp = this._data[p]; this._data[p] = this._data[i]; this._data[i] = tmp;
      i = p;
    }
  }

  pop(): number | undefined {
    if (this._data.length === 0) return undefined;
    const top = this._data[0];
    const last = this._data.pop()!;
    if (this._data.length > 0) {
      this._data[0] = last;
      let i = 0;
      const n = this._data.length;
      while (true) {
        let s = i, l = 2*i+1, r = 2*i+2;
        if (l < n && this._data[l] < this._data[s]) s = l;
        if (r < n && this._data[r] < this._data[s]) s = r;
        if (s === i) break;
        const tmp = this._data[s]; this._data[s] = this._data[i]; this._data[i] = tmp;
        i = s;
      }
    }
    return top;
  }
}

export class IntegerMaxHeap {
  private _data: number[];
  constructor() { this._data = []; }
  get size(): number { return this._data.length; }
  peek(): number | undefined { return this._data[0]; }
  has(x: number): boolean { return this._data.includes(x); }
  toArray(): number[] { return [...this._data]; }
  toSortedArray(): number[] { return [...this._data].sort((a, b) => a - b); }
  clear(): void { this._data = []; }

  push(x: number): void {
    this._data.push(x);
    let i = this._data.length - 1;
    while (i > 0) {
      const p = (i - 1) >>> 1;
      if (this._data[p] >= this._data[i]) break;
      const tmp = this._data[p]; this._data[p] = this._data[i]; this._data[i] = tmp;
      i = p;
    }
  }

  pop(): number | undefined {
    if (this._data.length === 0) return undefined;
    const top = this._data[0];
    const last = this._data.pop()!;
    if (this._data.length > 0) {
      this._data[0] = last;
      let i = 0;
      const n = this._data.length;
      while (true) {
        let s = i, l = 2*i+1, r = 2*i+2;
        if (l < n && this._data[l] > this._data[s]) s = l;
        if (r < n && this._data[r] > this._data[s]) s = r;
        if (s === i) break;
        const tmp = this._data[s]; this._data[s] = this._data[i]; this._data[i] = tmp;
        i = s;
      }
    }
    return top;
  }
}

export class SortedIntegerSet {
  private _arr: number[];
  constructor() { this._arr = []; }
  get size(): number { return this._arr.length; }
  min(): number | undefined { return this._arr[0]; }
  max(): number | undefined { return this._arr[this._arr.length - 1]; }
  toArray(): number[] { return [...this._arr]; }
  clear(): void { this._arr = []; }

  private _lb(x: number): number {
    let lo = 0, hi = this._arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this._arr[mid] < x) lo = mid + 1; else hi = mid;
    }
    return lo;
  }

  add(x: number): void {
    const idx = this._lb(x);
    if (idx < this._arr.length && this._arr[idx] === x) return;
    this._arr.splice(idx, 0, x);
  }

  delete(x: number): boolean {
    const idx = this._lb(x);
    if (idx < this._arr.length && this._arr[idx] === x) {
      this._arr.splice(idx, 1); return true;
    }
    return false;
  }

  has(x: number): boolean {
    const idx = this._lb(x);
    return idx < this._arr.length && this._arr[idx] === x;
  }

  range(lo: number, hi: number): number[] {
    const start = this._lb(lo);
    const result: number[] = [];
    for (let i = start; i < this._arr.length && this._arr[i] <= hi; i++)
      result.push(this._arr[i]);
    return result;
  }
}
