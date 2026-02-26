// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

const BITS_PER_WORD = 32;

function wordCount(size: number): number {
  return Math.ceil(size / BITS_PER_WORD);
}

// Mask for bits in the last word (covers only valid bit positions)
function lastWordMask(size: number): number {
  const rem = size % BITS_PER_WORD;
  return rem === 0 ? 0xffffffff : (1 << rem) - 1;
}

export class BitSet {
  private _size: number;
  private _words: Uint32Array;

  constructor(size: number) {
    if (size < 0) throw new RangeError('size must be >= 0');
    this._size = size;
    this._words = new Uint32Array(wordCount(size));
  }

  get size(): number {
    return this._size;
  }

  get byteLength(): number {
    return this._words.byteLength;
  }

  private _checkIndex(index: number): void {
    if (index < 0 || index >= this._size) {
      throw new RangeError(`index ${index} out of range [0, ${this._size})`);
    }
  }

  set(index: number): void {
    this._checkIndex(index);
    this._words[index >>> 5] |= 1 << (index & 31);
  }

  clear(index: number): void {
    this._checkIndex(index);
    this._words[index >>> 5] &= ~(1 << (index & 31));
  }

  flip(index: number): void {
    this._checkIndex(index);
    this._words[index >>> 5] ^= 1 << (index & 31);
  }

  get(index: number): boolean {
    this._checkIndex(index);
    return (this._words[index >>> 5] >>> (index & 31) & 1) === 1;
  }

  test(index: number): boolean {
    return this.get(index);
  }

  setAll(): void {
    const n = this._words.length;
    for (let i = 0; i < n; i++) {
      this._words[i] = 0xffffffff;
    }
    // Mask last word
    if (n > 0 && this._size % BITS_PER_WORD !== 0) {
      this._words[n - 1] = lastWordMask(this._size);
    }
  }

  clearAll(): void {
    this._words.fill(0);
  }

  setRange(start: number, end: number): void {
    if (start < 0 || end >= this._size || start > end) {
      throw new RangeError(`Invalid range [${start}, ${end}]`);
    }
    for (let i = start; i <= end; i++) {
      this._words[i >>> 5] |= 1 << (i & 31);
    }
  }

  clearRange(start: number, end: number): void {
    if (start < 0 || end >= this._size || start > end) {
      throw new RangeError(`Invalid range [${start}, ${end}]`);
    }
    for (let i = start; i <= end; i++) {
      this._words[i >>> 5] &= ~(1 << (i & 31));
    }
  }

  and(other: BitSet): BitSet {
    const result = new BitSet(this._size);
    const len = Math.min(this._words.length, other._words.length);
    for (let i = 0; i < len; i++) {
      result._words[i] = this._words[i] & other._words[i];
    }
    return result;
  }

  or(other: BitSet): BitSet {
    const result = new BitSet(this._size);
    const len = Math.min(this._words.length, other._words.length);
    for (let i = 0; i < len; i++) {
      result._words[i] = this._words[i] | other._words[i];
    }
    // If this is larger, copy remaining words
    for (let i = len; i < this._words.length; i++) {
      result._words[i] = this._words[i];
    }
    return result;
  }

  xor(other: BitSet): BitSet {
    const result = new BitSet(this._size);
    const len = Math.min(this._words.length, other._words.length);
    for (let i = 0; i < len; i++) {
      result._words[i] = this._words[i] ^ other._words[i];
    }
    for (let i = len; i < this._words.length; i++) {
      result._words[i] = this._words[i];
    }
    return result;
  }

  not(): BitSet {
    const result = new BitSet(this._size);
    for (let i = 0; i < this._words.length; i++) {
      result._words[i] = ~this._words[i];
    }
    // Mask last word so out-of-range bits stay 0
    if (this._words.length > 0 && this._size % BITS_PER_WORD !== 0) {
      result._words[this._words.length - 1] &= lastWordMask(this._size);
    }
    return result;
  }

  andNot(other: BitSet): BitSet {
    const result = new BitSet(this._size);
    const len = Math.min(this._words.length, other._words.length);
    for (let i = 0; i < len; i++) {
      result._words[i] = this._words[i] & ~other._words[i];
    }
    for (let i = len; i < this._words.length; i++) {
      result._words[i] = this._words[i];
    }
    return result;
  }

  andInPlace(other: BitSet): void {
    const len = Math.min(this._words.length, other._words.length);
    for (let i = 0; i < len; i++) {
      this._words[i] &= other._words[i];
    }
    // Words beyond other's length become 0
    for (let i = len; i < this._words.length; i++) {
      this._words[i] = 0;
    }
  }

  orInPlace(other: BitSet): void {
    const len = Math.min(this._words.length, other._words.length);
    for (let i = 0; i < len; i++) {
      this._words[i] |= other._words[i];
    }
  }

  xorInPlace(other: BitSet): void {
    const len = Math.min(this._words.length, other._words.length);
    for (let i = 0; i < len; i++) {
      this._words[i] ^= other._words[i];
    }
  }

  count(): number {
    return popCount32Array(this._words);
  }

  isEmpty(): boolean {
    return this.count() === 0;
  }

  isFull(): boolean {
    return this.count() === this._size;
  }

  isSubsetOf(other: BitSet): boolean {
    const len = Math.min(this._words.length, other._words.length);
    for (let i = 0; i < len; i++) {
      if ((this._words[i] & ~other._words[i]) !== 0) return false;
    }
    // Any bits in this beyond other's words means not a subset
    for (let i = len; i < this._words.length; i++) {
      if (this._words[i] !== 0) return false;
    }
    return true;
  }

  isSupersetOf(other: BitSet): boolean {
    return other.isSubsetOf(this);
  }

  intersects(other: BitSet): boolean {
    const len = Math.min(this._words.length, other._words.length);
    for (let i = 0; i < len; i++) {
      if ((this._words[i] & other._words[i]) !== 0) return true;
    }
    return false;
  }

  equals(other: BitSet): boolean {
    if (this._size !== other._size) return false;
    for (let i = 0; i < this._words.length; i++) {
      if (this._words[i] !== other._words[i]) return false;
    }
    return true;
  }

  firstSet(): number | undefined {
    for (let w = 0; w < this._words.length; w++) {
      const word = this._words[w];
      if (word !== 0) {
        const bit = w * BITS_PER_WORD + trailingZeros(word);
        return bit < this._size ? bit : undefined;
      }
    }
    return undefined;
  }

  nextSet(from: number): number | undefined {
    if (from >= this._size) return undefined;
    if (from < 0) from = 0;

    let w = from >>> 5;
    // Mask off bits before 'from' in first word
    let word = this._words[w] & (0xffffffff << (from & 31));

    while (true) {
      if (word !== 0) {
        const bit = w * BITS_PER_WORD + trailingZeros(word);
        return bit < this._size ? bit : undefined;
      }
      w++;
      if (w >= this._words.length) return undefined;
      word = this._words[w];
    }
  }

  toArray(): number[] {
    const result: number[] = [];
    let idx = this.firstSet();
    while (idx !== undefined) {
      result.push(idx);
      idx = this.nextSet(idx + 1);
    }
    return result;
  }

  toString(): string {
    let s = '';
    for (let i = 0; i < this._size; i++) {
      s += this.get(i) ? '1' : '0';
    }
    return s;
  }

  toHex(): string {
    let s = '';
    for (let i = 0; i < this._words.length; i++) {
      s += this._words[i].toString(16).padStart(8, '0');
    }
    return s;
  }

  clone(): BitSet {
    const result = new BitSet(this._size);
    result._words.set(this._words);
    return result;
  }
}

// ─── Number-level bit helpers ─────────────────────────────────────────────────

export function setBit(n: number, i: number): number {
  return (n | (1 << i)) >>> 0;
}

export function clearBit(n: number, i: number): number {
  return (n & ~(1 << i)) >>> 0;
}

export function flipBit(n: number, i: number): number {
  return (n ^ (1 << i)) >>> 0;
}

export function getBit(n: number, i: number): boolean {
  return ((n >>> i) & 1) === 1;
}

export function popCount(n: number): number {
  // Kernighan's algorithm for 32-bit
  let v = n >>> 0;
  let count = 0;
  while (v !== 0) {
    v &= v - 1;
    count++;
  }
  return count;
}

export function popCount32Array(arr: Uint32Array): number {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += popCount(arr[i]);
  }
  return total;
}

export function trailingZeros(n: number): number {
  if (n === 0) return 32;
  let v = n >>> 0;
  let count = 0;
  while ((v & 1) === 0) {
    v >>>= 1;
    count++;
  }
  return count;
}

export function leadingZeros(n: number): number {
  if (n === 0) return 32;
  let v = n >>> 0;
  let count = 0;
  while ((v & 0x80000000) === 0) {
    v <<= 1;
    count++;
  }
  return count;
}

export function isPowerOfTwo(n: number): boolean {
  if (n <= 0) return false;
  return (n & (n - 1)) === 0;
}

export function nextPowerOfTwo(n: number): number {
  if (n <= 1) return 1;
  let v = n - 1;
  v |= v >>> 1;
  v |= v >>> 2;
  v |= v >>> 4;
  v |= v >>> 8;
  v |= v >>> 16;
  return (v + 1) >>> 0;
}

export function lowestSetBit(n: number): number {
  return (n & -n) >>> 0;
}

// ─── Factory functions ────────────────────────────────────────────────────────

export function fromIndices(indices: number[], size: number): BitSet {
  const bs = new BitSet(size);
  for (const i of indices) {
    bs.set(i);
  }
  return bs;
}

export function fromString(s: string): BitSet {
  const bs = new BitSet(s.length);
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '1') bs.set(i);
  }
  return bs;
}

export function fromNumber(n: number, size: number = 32): BitSet {
  const bs = new BitSet(size);
  const v = n >>> 0;
  const limit = Math.min(size, 32);
  for (let i = 0; i < limit; i++) {
    if ((v >>> i) & 1) bs.set(i);
  }
  return bs;
}
