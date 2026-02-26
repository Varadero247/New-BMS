// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

// ---------------------------------------------------------------------------
// PersistentStack<T>
// ---------------------------------------------------------------------------

interface StackNode<T> {
  readonly value: T;
  readonly next: StackNode<T> | null;
}

export class PersistentStack<T> {
  private readonly _head: StackNode<T> | null;
  private readonly _size: number;

  private constructor(head: StackNode<T> | null, size: number) {
    this._head = head;
    this._size = size;
  }

  static empty<T>(): PersistentStack<T> {
    return new PersistentStack<T>(null, 0);
  }

  push(value: T): PersistentStack<T> {
    return new PersistentStack<T>({ value, next: this._head }, this._size + 1);
  }

  pop(): PersistentStack<T> {
    if (this._head === null) return this;
    return new PersistentStack<T>(this._head.next, this._size - 1);
  }

  peek(): T | undefined {
    return this._head?.value;
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  get size(): number {
    return this._size;
  }

  toArray(): T[] {
    const result: T[] = [];
    let node = this._head;
    while (node !== null) {
      result.push(node.value);
      node = node.next;
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// PersistentQueue<T> — implemented as two persistent stacks (front / back)
// ---------------------------------------------------------------------------

export class PersistentQueue<T> {
  private readonly _front: PersistentStack<T>;
  private readonly _back: PersistentStack<T>;
  private readonly _size: number;

  private constructor(
    front: PersistentStack<T>,
    back: PersistentStack<T>,
    size: number,
  ) {
    this._front = front;
    this._back = back;
    this._size = size;
  }

  static empty<T>(): PersistentQueue<T> {
    return new PersistentQueue<T>(
      PersistentStack.empty<T>(),
      PersistentStack.empty<T>(),
      0,
    );
  }

  private rebalanced(): PersistentQueue<T> {
    if (!this._front.isEmpty) return this;
    // Reverse back into front; back top = most recently enqueued = last in FIFO
    // back.toArray() gives [newest-first], so we reverse to get oldest at top of new front
    const backArr = this._back.toArray(); // top-first = newest first
    let newFront = PersistentStack.empty<T>();
    // push in order [newest..oldest] so oldest ends up on top
    for (let i = 0; i < backArr.length; i++) {
      newFront = newFront.push(backArr[i]);
    }
    // newFront top = oldest element = first in FIFO
    return new PersistentQueue<T>(newFront, PersistentStack.empty<T>(), this._size);
  }

  enqueue(value: T): PersistentQueue<T> {
    return new PersistentQueue<T>(this._front, this._back.push(value), this._size + 1);
  }

  dequeue(): PersistentQueue<T> {
    if (this._size === 0) return this;
    const balanced = this.rebalanced();
    return new PersistentQueue<T>(
      balanced._front.pop(),
      balanced._back,
      balanced._size - 1,
    );
  }

  front(): T | undefined {
    if (this._size === 0) return undefined;
    return this.rebalanced()._front.peek();
  }

  get isEmpty(): boolean {
    return this._size === 0;
  }

  get size(): number {
    return this._size;
  }

  toArray(): T[] {
    // front toArray gives top-first (oldest first in queue)
    // back toArray gives top-first (newest first); reverse it to get oldest-first
    const frontArr = this._front.toArray();
    const backArr = this._back.toArray().reverse();
    return [...frontArr, ...backArr];
  }
}

// ---------------------------------------------------------------------------
// PersistentList<T> — immutable singly-linked list
// ---------------------------------------------------------------------------

interface ListNode<T> {
  readonly head: T;
  readonly tail: PersistentList<T>;
}

export class PersistentList<T> {
  private readonly _node: ListNode<T> | null;
  private readonly _length: number;

  private constructor(node: ListNode<T> | null, length: number) {
    this._node = node;
    this._length = length;
  }

  static empty<T>(): PersistentList<T> {
    return new PersistentList<T>(null, 0);
  }

  static from<T>(arr: T[]): PersistentList<T> {
    let list = PersistentList.empty<T>();
    for (let i = arr.length - 1; i >= 0; i--) {
      list = list.prepend(arr[i]);
    }
    return list;
  }

  prepend(value: T): PersistentList<T> {
    return new PersistentList<T>({ head: value, tail: this }, this._length + 1);
  }

  head(): T | undefined {
    return this._node?.head;
  }

  tail(): PersistentList<T> {
    if (this._node === null) return this;
    return this._node.tail;
  }

  get length(): number {
    return this._length;
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._length) return undefined;
    let cur: PersistentList<T> = this;
    for (let i = 0; i < index; i++) {
      cur = cur.tail();
    }
    return cur.head();
  }

  toArray(): T[] {
    const result: T[] = [];
    let cur: PersistentList<T> = this;
    while (cur._node !== null) {
      result.push(cur._node.head);
      cur = cur._node.tail;
    }
    return result;
  }

  reverse(): PersistentList<T> {
    let result = PersistentList.empty<T>();
    let cur: PersistentList<T> = this;
    while (cur._node !== null) {
      result = result.prepend(cur._node.head);
      cur = cur._node.tail;
    }
    return result;
  }

  map<U>(fn: (value: T) => U): PersistentList<U> {
    return PersistentList.from(this.toArray().map(fn));
  }

  filter(fn: (value: T) => boolean): PersistentList<T> {
    return PersistentList.from(this.toArray().filter(fn));
  }
}

// ---------------------------------------------------------------------------
// PersistentMap<K extends string, V> — immutable map via sorted array structure
// Uses copy-on-write over a flat sorted key array for correctness and simplicity.
// ---------------------------------------------------------------------------

export class PersistentMap<K extends string, V> {
  // Sorted array of [key, value] pairs kept sorted by key for binary search
  private readonly _entries: ReadonlyArray<readonly [K, V]>;

  private constructor(entries: ReadonlyArray<readonly [K, V]>) {
    this._entries = entries;
  }

  static empty<K extends string, V>(): PersistentMap<K, V> {
    return new PersistentMap<K, V>([]);
  }

  private _indexOf(key: K): number {
    let lo = 0;
    let hi = this._entries.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const midKey = this._entries[mid][0];
      if (midKey === key) return mid;
      if (midKey < key) lo = mid + 1;
      else hi = mid - 1;
    }
    return ~lo; // negative: insertion point = ~result
  }

  set(key: K, value: V): PersistentMap<K, V> {
    const idx = this._indexOf(key);
    if (idx >= 0) {
      // Key exists — replace in place (copy-on-write)
      const newEntries = this._entries.slice() as Array<readonly [K, V]>;
      newEntries[idx] = [key, value];
      return new PersistentMap<K, V>(newEntries);
    }
    // Insert at insertion point
    const insertAt = ~idx;
    const newEntries = [
      ...this._entries.slice(0, insertAt),
      [key, value] as readonly [K, V],
      ...this._entries.slice(insertAt),
    ];
    return new PersistentMap<K, V>(newEntries);
  }

  get(key: K): V | undefined {
    const idx = this._indexOf(key);
    return idx >= 0 ? this._entries[idx][1] : undefined;
  }

  has(key: K): boolean {
    return this._indexOf(key) >= 0;
  }

  delete(key: K): PersistentMap<K, V> {
    const idx = this._indexOf(key);
    if (idx < 0) return this;
    const newEntries = [
      ...this._entries.slice(0, idx),
      ...this._entries.slice(idx + 1),
    ];
    return new PersistentMap<K, V>(newEntries);
  }

  get size(): number {
    return this._entries.length;
  }

  entries(): Array<[K, V]> {
    return this._entries.map(([k, v]) => [k, v] as [K, V]);
  }

  keys(): K[] {
    return this._entries.map(([k]) => k);
  }

  values(): V[] {
    return this._entries.map(([, v]) => v);
  }
}

// ---------------------------------------------------------------------------
// PersistentSet<T extends string> — immutable set backed by PersistentMap
// ---------------------------------------------------------------------------

export class PersistentSet<T extends string> {
  private readonly _map: PersistentMap<T, true>;

  private constructor(map: PersistentMap<T, true>) {
    this._map = map;
  }

  static empty<T extends string>(): PersistentSet<T> {
    return new PersistentSet<T>(PersistentMap.empty<T, true>());
  }

  add(value: T): PersistentSet<T> {
    return new PersistentSet<T>(this._map.set(value, true));
  }

  delete(value: T): PersistentSet<T> {
    return new PersistentSet<T>(this._map.delete(value));
  }

  has(value: T): boolean {
    return this._map.has(value);
  }

  get size(): number {
    return this._map.size;
  }

  toArray(): T[] {
    return this._map.keys();
  }

  union(other: PersistentSet<T>): PersistentSet<T> {
    let result: PersistentSet<T> = this;
    for (const v of other.toArray()) {
      result = result.add(v);
    }
    return result;
  }

  intersection(other: PersistentSet<T>): PersistentSet<T> {
    let result = PersistentSet.empty<T>();
    for (const v of this.toArray()) {
      if (other.has(v)) result = result.add(v);
    }
    return result;
  }

  difference(other: PersistentSet<T>): PersistentSet<T> {
    let result: PersistentSet<T> = this;
    for (const v of other.toArray()) {
      result = result.delete(v);
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// PersistentVector<T> — immutable array using copy-on-write over a plain array
// This is structurally simple and guaranteed correct; full path-copy trie
// can be layered on top later.
// ---------------------------------------------------------------------------

export class PersistentVector<T> {
  private readonly _data: ReadonlyArray<T>;

  private constructor(data: ReadonlyArray<T>) {
    this._data = data;
  }

  static empty<T>(): PersistentVector<T> {
    return new PersistentVector<T>([]);
  }

  static from<T>(arr: T[]): PersistentVector<T> {
    return new PersistentVector<T>(arr.slice());
  }

  get length(): number {
    return this._data.length;
  }

  get(index: number): T | undefined {
    if (index < 0 || index >= this._data.length) return undefined;
    return this._data[index];
  }

  set(index: number, value: T): PersistentVector<T> {
    if (index < 0 || index >= this._data.length) return this;
    const newData = this._data.slice() as T[];
    newData[index] = value;
    return new PersistentVector<T>(newData);
  }

  push(value: T): PersistentVector<T> {
    return new PersistentVector<T>([...this._data, value]);
  }

  pop(): PersistentVector<T> {
    if (this._data.length === 0) return this;
    return new PersistentVector<T>(this._data.slice(0, this._data.length - 1));
  }

  toArray(): T[] {
    return this._data.slice() as T[];
  }
}

// ---------------------------------------------------------------------------
// VersionedStore<T> — wraps any value with full version history
// ---------------------------------------------------------------------------

export class VersionedStore<T> {
  private readonly _history: ReadonlyArray<T>;

  private constructor(history: ReadonlyArray<T>) {
    this._history = history;
  }

  static create<T>(initialValue: T): VersionedStore<T> {
    return new VersionedStore<T>([initialValue]);
  }

  update(fn: (current: T) => T): VersionedStore<T> {
    const next = fn(this._history[this._history.length - 1]);
    return new VersionedStore<T>([...this._history, next]);
  }

  get current(): T {
    return this._history[this._history.length - 1];
  }

  getVersion(n: number): T | undefined {
    if (n < 0 || n >= this._history.length) return undefined;
    return this._history[n];
  }

  get historyLength(): number {
    return this._history.length;
  }
}
