// Copyright (c) 2026 Nexara DMCC. All rights reserved.

const DEFAULT_MAX_LEVEL = 16;
const DEFAULT_P = 0.5;

interface SkipNode<T> {
  key: T;
  forward: Array<SkipNode<T> | null>;
}

function newNode<T>(key: T, level: number): SkipNode<T> {
  return { key, forward: new Array(level + 1).fill(null) };
}

function makeRandomLevel(maxLevel: number, probability: number): () => number {
  return () => {
    let lvl = 0;
    while (Math.random() < probability && lvl < maxLevel) lvl++;
    return lvl;
  };
}

export class SkipList<T = number> {
  private header: SkipNode<T>;
  private level = 0;
  private _size = 0;
  private cmp: (a: T, b: T) => number;
  private maxLevel: number;
  private randomLevel: () => number;

  constructor(
    compareFn?: (a: T, b: T) => number,
    maxLevel: number = DEFAULT_MAX_LEVEL,
    probability: number = DEFAULT_P
  ) {
    this.cmp = compareFn ?? ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    this.maxLevel = maxLevel;
    this.randomLevel = makeRandomLevel(maxLevel, probability);
    this.header = { key: undefined as unknown as T, forward: new Array(maxLevel + 1).fill(null) };
  }

  insert(value: T): void {
    const update: Array<SkipNode<T> | null> = new Array(this.maxLevel + 1).fill(null);
    let curr: SkipNode<T> | null = this.header;
    for (let i = this.level; i >= 0; i--) {
      while (curr!.forward[i] && this.cmp(curr!.forward[i]!.key, value) < 0) curr = curr!.forward[i];
      update[i] = curr;
    }
    curr = curr!.forward[0];
    if (curr && this.cmp(curr.key, value) === 0) return; // duplicate — skip list stores unique values
    const lvl = this.randomLevel();
    if (lvl > this.level) {
      for (let i = this.level + 1; i <= lvl; i++) update[i] = this.header;
      this.level = lvl;
    }
    const node = newNode(value, lvl);
    for (let i = 0; i <= lvl; i++) {
      node.forward[i] = update[i]!.forward[i];
      update[i]!.forward[i] = node;
    }
    this._size++;
  }

  delete(value: T): boolean {
    const update: Array<SkipNode<T> | null> = new Array(this.maxLevel + 1).fill(null);
    let curr: SkipNode<T> | null = this.header;
    for (let i = this.level; i >= 0; i--) {
      while (curr!.forward[i] && this.cmp(curr!.forward[i]!.key, value) < 0) curr = curr!.forward[i];
      update[i] = curr;
    }
    curr = curr!.forward[0];
    if (!curr || this.cmp(curr.key, value) !== 0) return false;
    for (let i = 0; i <= this.level; i++) {
      if (update[i]!.forward[i] !== curr) break;
      update[i]!.forward[i] = curr.forward[i];
    }
    while (this.level > 0 && !this.header.forward[this.level]) this.level--;
    this._size--;
    return true;
  }

  has(value: T): boolean {
    let curr: SkipNode<T> | null = this.header;
    for (let i = this.level; i >= 0; i--)
      while (curr!.forward[i] && this.cmp(curr!.forward[i]!.key, value) < 0) curr = curr!.forward[i];
    curr = curr!.forward[0];
    return !!(curr && this.cmp(curr.key, value) === 0);
  }

  min(): T | null {
    const first = this.header.forward[0];
    return first ? first.key : null;
  }

  max(): T | null {
    let curr: SkipNode<T> | null = this.header;
    for (let i = this.level; i >= 0; i--)
      while (curr!.forward[i]) curr = curr!.forward[i];
    return curr === this.header ? null : curr!.key;
  }

  toArray(): T[] {
    const result: T[] = [];
    let curr = this.header.forward[0];
    while (curr) { result.push(curr.key); curr = curr.forward[0]; }
    return result;
  }

  get size(): number { return this._size; }

  clear(): void {
    this.header = { key: undefined as unknown as T, forward: new Array(this.maxLevel + 1).fill(null) };
    this.level = 0;
    this._size = 0;
  }

  /**
   * rank — 0-indexed position of value in sorted order.
   * Returns -1 if not found.
   */
  rank(value: T): number {
    let rank = 0;
    let curr: SkipNode<T> | null = this.header;
    // Walk level 0 to count position
    // For simplicity use level-0 traversal (O(n) in worst case but correct)
    let node = this.header.forward[0];
    while (node) {
      const c = this.cmp(node.key, value);
      if (c === 0) return rank;
      if (c > 0) break;
      rank++;
      node = node.forward[0];
    }
    return -1;
  }

  /**
   * kth — 0-indexed k-th smallest element. Returns null if out of bounds.
   */
  kth(k: number): T | null {
    if (k < 0 || k >= this._size) return null;
    let node = this.header.forward[0];
    let i = 0;
    while (node) {
      if (i === k) return node.key;
      i++;
      node = node.forward[0];
    }
    return null;
  }

  isEmpty(): boolean { return this._size === 0; }

  /** @internal — used by skipListRangeQuery */
  _compare(a: T, b: T): number { return this.cmp(a, b); }
}

// ---------------------------------------------------------------------------
// SkipListMap
// ---------------------------------------------------------------------------

interface SkipMapNode<K, V> {
  key: K;
  value: V;
  forward: Array<SkipMapNode<K, V> | null>;
}

function newMapNode<K, V>(key: K, value: V, level: number): SkipMapNode<K, V> {
  return { key, value, forward: new Array(level + 1).fill(null) };
}

export class SkipListMap<K, V> {
  private header: SkipMapNode<K, V>;
  private level = 0;
  private _size = 0;
  private cmp: (a: K, b: K) => number;
  private maxLevel: number;
  private randomLevel: () => number;

  constructor(compareFn?: (a: K, b: K) => number, maxLevel: number = DEFAULT_MAX_LEVEL) {
    this.cmp = compareFn ?? ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    this.maxLevel = maxLevel;
    this.randomLevel = makeRandomLevel(maxLevel, DEFAULT_P);
    this.header = { key: undefined as unknown as K, value: undefined as unknown as V, forward: new Array(maxLevel + 1).fill(null) };
  }

  set(key: K, value: V): void {
    const update: Array<SkipMapNode<K, V> | null> = new Array(this.maxLevel + 1).fill(null);
    let curr: SkipMapNode<K, V> | null = this.header;
    for (let i = this.level; i >= 0; i--) {
      while (curr!.forward[i] && this.cmp(curr!.forward[i]!.key, key) < 0) curr = curr!.forward[i];
      update[i] = curr;
    }
    curr = curr!.forward[0];
    if (curr && this.cmp(curr.key, key) === 0) {
      curr.value = value; // update existing
      return;
    }
    const lvl = this.randomLevel();
    if (lvl > this.level) {
      for (let i = this.level + 1; i <= lvl; i++) update[i] = this.header;
      this.level = lvl;
    }
    const node = newMapNode(key, value, lvl);
    for (let i = 0; i <= lvl; i++) {
      node.forward[i] = update[i]!.forward[i];
      update[i]!.forward[i] = node;
    }
    this._size++;
  }

  get(key: K): V | undefined {
    let curr: SkipMapNode<K, V> | null = this.header;
    for (let i = this.level; i >= 0; i--)
      while (curr!.forward[i] && this.cmp(curr!.forward[i]!.key, key) < 0) curr = curr!.forward[i];
    curr = curr!.forward[0];
    if (curr && this.cmp(curr.key, key) === 0) return curr.value;
    return undefined;
  }

  delete(key: K): boolean {
    const update: Array<SkipMapNode<K, V> | null> = new Array(this.maxLevel + 1).fill(null);
    let curr: SkipMapNode<K, V> | null = this.header;
    for (let i = this.level; i >= 0; i--) {
      while (curr!.forward[i] && this.cmp(curr!.forward[i]!.key, key) < 0) curr = curr!.forward[i];
      update[i] = curr;
    }
    curr = curr!.forward[0];
    if (!curr || this.cmp(curr.key, key) !== 0) return false;
    for (let i = 0; i <= this.level; i++) {
      if (update[i]!.forward[i] !== curr) break;
      update[i]!.forward[i] = curr.forward[i];
    }
    while (this.level > 0 && !this.header.forward[this.level]) this.level--;
    this._size--;
    return true;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  keys(): K[] {
    const result: K[] = [];
    let curr = this.header.forward[0];
    while (curr) { result.push(curr.key); curr = curr.forward[0]; }
    return result;
  }

  values(): V[] {
    const result: V[] = [];
    let curr = this.header.forward[0];
    while (curr) { result.push(curr.value); curr = curr.forward[0]; }
    return result;
  }

  entries(): Array<[K, V]> {
    const result: Array<[K, V]> = [];
    let curr = this.header.forward[0];
    while (curr) { result.push([curr.key, curr.value]); curr = curr.forward[0]; }
    return result;
  }

  get size(): number { return this._size; }
}

// ---------------------------------------------------------------------------
// Standalone functions
// ---------------------------------------------------------------------------

export function skipListSort<T>(arr: T[], compareFn?: (a: T, b: T) => number): T[] {
  const list = new SkipList<T>(compareFn);
  for (const item of arr) list.insert(item);
  return list.toArray();
}

export function skipListRangeQuery<T>(list: SkipList<T>, lo: T, hi: T): T[] {
  const result: T[] = [];
  for (const v of list.toArray()) {
    if (list._compare(v, lo) >= 0 && list._compare(v, hi) <= 0) {
      result.push(v);
    }
  }
  return result;
}

export function createSkipList<T>(cmp?: (a: T, b: T) => number): SkipList<T> { return new SkipList<T>(cmp); }
