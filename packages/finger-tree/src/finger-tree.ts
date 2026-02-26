// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export class FingerDeque<T> {
  private readonly _items: readonly T[];

  private constructor(items: readonly T[]) { this._items = items; }

  static empty<T>(): FingerDeque<T>{ return new FingerDeque<T>([]); }
  static of<T>(...items: T[]): FingerDeque<T>{ return new FingerDeque<T>(Object.freeze([...items]) as readonly T[]); }
  static from<T>(items: Iterable<T>): FingerDeque<T>{ return new FingerDeque<T>(Object.freeze([...items]) as readonly T[]); }
  get size(): number { return this._items.length; }
  get isEmpty(): boolean { return this._items.length === 0; }
  peekFront(): T | undefined { return this._items[0]; }
  peekBack(): T | undefined { return this._items[this._items.length - 1]; }
  get(index: number): T | undefined { if (index < 0 || index >= this._items.length) return undefined; return this._items[index]; }
  pushFront(item: T): FingerDeque<T>{ return new FingerDeque<T>(Object.freeze([item, ...this._items]) as readonly T[]); }
  pushBack(item: T): FingerDeque<T>{ return new FingerDeque<T>(Object.freeze([...this._items, item]) as readonly T[]); }
  popFront(): [T, FingerDeque<T>] | undefined { if (!this._items.length) return undefined; const [head, ...tail]=this._items as T[]; return [head, new FingerDeque<T>(Object.freeze(tail) as readonly T[])]; }
  popBack(): [T, FingerDeque<T>] | undefined { if (!this._items.length) return undefined; const last=this._items[this._items.length-1] as T; return [last, new FingerDeque<T>(Object.freeze(this._items.slice(0,-1)) as readonly T[])]; }
  concat(other: FingerDeque<T>): FingerDeque<T>{ return new FingerDeque<T>(Object.freeze([...this._items,...other._items]) as readonly T[]); }
  splitAt(index: number): [FingerDeque<T>, FingerDeque<T>] { const c=Math.max(0,Math.min(index,this._items.length)); return [new FingerDeque<T>(Object.freeze(this._items.slice(0,c)) as readonly T[]), new FingerDeque<T>(Object.freeze(this._items.slice(c)) as readonly T[])]; }
  toArray(): T[] { return [...this._items]; }
  [Symbol.iterator](): Iterator<T>{ let idx=0; const items=this._items; return { next(): IteratorResult<T>{ if (idx < items.length) return {value: items[idx++] as T, done: false}; return {value: undefined as unknown as T, done: true}; } }; }
  map<U>(fn: (item: T) => U): FingerDeque<U>{ return new FingerDeque<U>(Object.freeze(this._items.map(fn)) as readonly U[]); }
  filter(fn: (item: T) => boolean): FingerDeque<T>{ return new FingerDeque<T>(Object.freeze(this._items.filter(fn)) as readonly T[]); }
  reduce<U>(fn: (acc: U, item: T) => U, initial: U): U { return this._items.reduce(fn, initial); }
}
interface StackNode<T> {
  readonly value: T;
  readonly next: StackNode<T> | null;
}

export class PersistentStack<T> {
  private readonly _head: StackNode<T> | null;
  private readonly _size: number;

  private constructor(head: StackNode<T> | null, size: number) {
    this._head = head; this._size = size;
  }

  static empty<T>(): PersistentStack<T>{ return new PersistentStack<T>(null, 0); }

  push(item: T): PersistentStack<T>{ return new PersistentStack<T>({ value: item, next: this._head }, this._size + 1); }

  pop(): [T, PersistentStack<T>] | undefined {
    if (this._head === null) return undefined;
    return [this._head.value, new PersistentStack<T>(this._head.next, this._size - 1)];
  }

  peek(): T | undefined { return this._head?.value; }
  get size(): number { return this._size; }
  get isEmpty(): boolean { return this._size === 0; }

  toArray(): T[] {
    const out: T[] = [];
    let node = this._head;
    while (node !== null) { out.push(node.value); node = node.next; }
    return out;
  }
}
export class PersistentQueue<T> {
  private readonly _inbox: PersistentStack<T>;
  private readonly _outbox: PersistentStack<T>;
  private readonly _size: number;

  private constructor(inbox: PersistentStack<T>, outbox: PersistentStack<T>, size: number) {
    this._inbox=inbox; this._outbox=outbox; this._size=size;
  }

  static empty<T>(): PersistentQueue<T>{
    return new PersistentQueue<T>(PersistentStack.empty<T>(), PersistentStack.empty<T>(), 0);
  }

  enqueue(item: T): PersistentQueue<T>{
    return new PersistentQueue<T>(this._inbox.push(item), this._outbox, this._size + 1);
  }

  private _normalised(): PersistentQueue<T>{
    if (!this._outbox.isEmpty) return this;
    let out = PersistentStack.empty<T>();
    let inbox = this._inbox;
    while (!inbox.isEmpty) {
      const r = inbox.pop();
      if (!r) break;
      const [val, rest] = r;
      out = out.push(val);
      inbox = rest;
    }
    return new PersistentQueue<T>(PersistentStack.empty<T>(), out, this._size);
  }

  dequeue(): [T, PersistentQueue<T>] | undefined {
    const n = this._normalised();
    if (n._outbox.isEmpty) return undefined;
    const r = n._outbox.pop();
    if (!r) return undefined;
    const [val, restOut] = r;
    return [val, new PersistentQueue<T>(n._inbox, restOut, n._size - 1)];
  }

  front(): T | undefined { return this._normalised()._outbox.peek(); }
  get size(): number { return this._size; }
  get isEmpty(): boolean { return this._size === 0; }

  toArray(): T[] {
    const n = this._normalised();
    return [...n._outbox.toArray(), ...n._inbox.toArray().reverse()];
  }
}