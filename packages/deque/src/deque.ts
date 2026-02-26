// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

const DEFAULT_CAPACITY = 16;

/**
 * Double-ended queue backed by a circular buffer for O(1) amortised
 * push/pop at both ends.
 */
export class Deque<T> {
  private _buf: (T | undefined)[];
  private _head: number;
  private _tail: number; // points to the slot AFTER the last element
  private _size: number;
  private _cap: number;

  constructor(initialCapacity = DEFAULT_CAPACITY) {
    this._cap = Math.max(initialCapacity, 1);
    this._buf = new Array(this._cap);
    this._head = 0;
    this._tail = 0;
    this._size = 0;
  }

  private _grow(): void {
    const newCap = this._cap * 2;
    const newBuf = new Array<T | undefined>(newCap);
    for (let i = 0; i < this._size; i++) {
      newBuf[i] = this._buf[(this._head + i) % this._cap];
    }
    this._buf = newBuf;
    this._head = 0;
    this._tail = this._size;
    this._cap = newCap;
  }

  /** Add item to the front of the deque. */
  pushFront(item: T): void {
    if (this._size === this._cap) this._grow();
    this._head = (this._head - 1 + this._cap) % this._cap;
    this._buf[this._head] = item;
    this._size++;
  }

  /** Add item to the back of the deque. */
  pushBack(item: T): void {
    if (this._size === this._cap) this._grow();
    this._buf[this._tail] = item;
    this._tail = (this._tail + 1) % this._cap;
    this._size++;
  }

  /** Remove and return the front item, or undefined if empty. */
  popFront(): T | undefined {
    if (this._size === 0) return undefined;
    const item = this._buf[this._head];
    this._buf[this._head] = undefined;
    this._head = (this._head + 1) % this._cap;
    this._size--;
    return item;
  }

  /** Remove and return the back item, or undefined if empty. */
  popBack(): T | undefined {
    if (this._size === 0) return undefined;
    this._tail = (this._tail - 1 + this._cap) % this._cap;
    const item = this._buf[this._tail];
    this._buf[this._tail] = undefined;
    this._size--;
    return item;
  }

  /** Return the front item without removing it, or undefined if empty. */
  peekFront(): T | undefined {
    if (this._size === 0) return undefined;
    return this._buf[this._head];
  }

  /** Return the back item without removing it, or undefined if empty. */
  peekBack(): T | undefined {
    if (this._size === 0) return undefined;
    const idx = (this._tail - 1 + this._cap) % this._cap;
    return this._buf[idx];
  }

  /**
   * Access by index (0 = front, size-1 = back).
   * Returns undefined for out-of-range indices.
   */
  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined;
    return this._buf[(this._head + index) % this._cap];
  }

  /**
   * Set by index (0 = front, size-1 = back).
   * Returns true on success, false if out of range.
   */
  set(index: number, value: T): boolean {
    if (index < 0 || index >= this._size) return false;
    this._buf[(this._head + index) % this._cap] = value;
    return true;
  }

  /** Number of elements in the deque. */
  get size(): number {
    return this._size;
  }

  /** Returns true when the deque has no elements. */
  isEmpty(): boolean {
    return this._size === 0;
  }

  /** Remove all elements. */
  clear(): void {
    this._buf = new Array(this._cap);
    this._head = 0;
    this._tail = 0;
    this._size = 0;
  }

  /** Return elements as an array from front to back. */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      result.push(this._buf[(this._head + i) % this._cap] as T);
    }
    return result;
  }

  /** Return elements as an array from back to front. */
  toArrayReverse(): T[] {
    const result: T[] = [];
    for (let i = this._size - 1; i >= 0; i--) {
      result.push(this._buf[(this._head + i) % this._cap] as T);
    }
    return result;
  }

  /** Iterate front to back. */
  [Symbol.iterator](): Iterator<T> {
    let idx = 0;
    const self = this;
    return {
      next(): IteratorResult<T> {
        if (idx < self._size) {
          return { value: self.get(idx++) as T, done: false };
        }
        return { value: undefined as unknown as T, done: true };
      },
    };
  }

  /**
   * Rotate the deque.
   * Positive n: move n items from front to back.
   * Negative n: move |n| items from back to front.
   */
  rotate(n: number): void {
    if (this._size <= 1) return;
    // Normalise n into [0, size)
    const steps = ((n % this._size) + this._size) % this._size;
    for (let i = 0; i < steps; i++) {
      const item = this.popFront();
      if (item !== undefined) this.pushBack(item);
    }
  }
}

// ---------------------------------------------------------------------------
// Stack — LIFO backed by Deque
// ---------------------------------------------------------------------------

/** Simple LIFO stack backed by a Deque. */
export class Stack<T> {
  private _dq = new Deque<T>();

  /** Push item onto the top of the stack. */
  push(item: T): void {
    this._dq.pushBack(item);
  }

  /** Pop and return the top item, or undefined if empty. */
  pop(): T | undefined {
    return this._dq.popBack();
  }

  /** Return the top item without removing it, or undefined if empty. */
  peek(): T | undefined {
    return this._dq.peekBack();
  }

  /** Number of elements. */
  get size(): number {
    return this._dq.size;
  }

  /** Returns true when the stack is empty. */
  isEmpty(): boolean {
    return this._dq.isEmpty();
  }

  /**
   * Return elements as an array with the top (most recently pushed)
   * first.
   */
  toArray(): T[] {
    return this._dq.toArrayReverse();
  }

  /** Remove all elements. */
  clear(): void {
    this._dq.clear();
  }
}

// ---------------------------------------------------------------------------
// Queue — FIFO backed by Deque
// ---------------------------------------------------------------------------

/** Simple FIFO queue backed by a Deque. */
export class Queue<T> {
  private _dq = new Deque<T>();

  /** Add item to the back of the queue. */
  enqueue(item: T): void {
    this._dq.pushBack(item);
  }

  /** Remove and return the front item, or undefined if empty. */
  dequeue(): T | undefined {
    return this._dq.popFront();
  }

  /** Return the next-to-be-dequeued item without removing it. */
  peek(): T | undefined {
    return this._dq.peekFront();
  }

  /** Number of elements. */
  get size(): number {
    return this._dq.size;
  }

  /** Returns true when the queue is empty. */
  isEmpty(): boolean {
    return this._dq.isEmpty();
  }

  /**
   * Return elements as an array from front (next) to back (last).
   */
  toArray(): T[] {
    return this._dq.toArray();
  }

  /** Remove all elements. */
  clear(): void {
    this._dq.clear();
  }
}

// ---------------------------------------------------------------------------
// CircularBuffer — fixed capacity, overwrites oldest on overflow
// ---------------------------------------------------------------------------

/** Fixed-capacity circular buffer that overwrites the oldest entry on overflow. */
export class CircularBuffer<T> {
  private _buf: (T | undefined)[];
  private _head: number;  // index of oldest item
  private _tail: number;  // index of next write slot
  private _size: number;
  private readonly _cap: number;

  constructor(capacity: number) {
    if (capacity < 1) throw new RangeError('CircularBuffer capacity must be >= 1');
    this._cap = capacity;
    this._buf = new Array(capacity);
    this._head = 0;
    this._tail = 0;
    this._size = 0;
  }

  /**
   * Push an item. If the buffer is full, the oldest item is silently
   * overwritten.
   */
  push(item: T): void {
    if (this._size === this._cap) {
      // Overwrite oldest — advance head
      this._buf[this._tail] = item;
      this._tail = (this._tail + 1) % this._cap;
      this._head = (this._head + 1) % this._cap;
    } else {
      this._buf[this._tail] = item;
      this._tail = (this._tail + 1) % this._cap;
      this._size++;
    }
  }

  /** Remove and return the oldest (front) item, or undefined if empty. */
  pop(): T | undefined {
    if (this._size === 0) return undefined;
    const item = this._buf[this._head];
    this._buf[this._head] = undefined;
    this._head = (this._head + 1) % this._cap;
    this._size--;
    return item;
  }

  /** Return the oldest item without removing it. */
  peek(): T | undefined {
    if (this._size === 0) return undefined;
    return this._buf[this._head];
  }

  /**
   * Access by index, where 0 is the oldest item.
   * Returns undefined for out-of-range indices.
   */
  get(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined;
    return this._buf[(this._head + index) % this._cap];
  }

  /** Number of elements currently stored. */
  get size(): number {
    return this._size;
  }

  /** Maximum number of elements the buffer can hold. */
  get capacity(): number {
    return this._cap;
  }

  /** Returns true when the buffer is at capacity. */
  isFull(): boolean {
    return this._size === this._cap;
  }

  /** Returns true when the buffer holds no elements. */
  isEmpty(): boolean {
    return this._size === 0;
  }

  /** Return all elements from oldest to newest. */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      result.push(this._buf[(this._head + i) % this._cap] as T);
    }
    return result;
  }

  /** Remove all elements. */
  clear(): void {
    this._buf = new Array(this._cap);
    this._head = 0;
    this._tail = 0;
    this._size = 0;
  }
}

// ---------------------------------------------------------------------------
// MonotonicDeque — sliding window max/min
// ---------------------------------------------------------------------------

/**
 * Monotonic deque used for O(n) sliding-window maximum or minimum queries.
 *
 * Pass a comparator that returns negative when `a` should be preferred over
 * `b` (e.g. `(a, b) => b - a` for maximum deque, `(a, b) => a - b` for
 * minimum deque).
 */
export class MonotonicDeque<T> {
  private _dq = new Deque<T>();
  private _compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this._compare = compare;
  }

  /**
   * Push an item to the back, maintaining the monotonic invariant by
   * removing back elements that are dominated by the new item.
   */
  push(item: T): void {
    while (!this._dq.isEmpty()) {
      const back = this._dq.peekBack() as T;
      if (this._compare(item, back) <= 0) {
        this._dq.popBack();
      } else {
        break;
      }
    }
    this._dq.pushBack(item);
  }

  /** View the current maximum (or minimum) at the front. */
  front(): T | undefined {
    return this._dq.peekFront();
  }

  /** Remove the front element. */
  popFront(): void {
    this._dq.popFront();
  }

  /** Remove the back element (used when the window slides past items). */
  popBack(): void {
    this._dq.popBack();
  }

  /** View the back element. */
  back(): T | undefined {
    return this._dq.peekBack();
  }

  /** Number of elements. */
  get size(): number {
    return this._dq.size;
  }

  /** Returns true when empty. */
  isEmpty(): boolean {
    return this._dq.isEmpty();
  }

  /** Return all elements front to back. */
  toArray(): T[] {
    return this._dq.toArray();
  }
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/** Create a Deque pre-populated from an array (index 0 → front). */
export function fromArray<T>(arr: T[]): Deque<T> {
  const dq = new Deque<T>(Math.max(arr.length, DEFAULT_CAPACITY));
  for (const item of arr) {
    dq.pushBack(item);
  }
  return dq;
}

/**
 * Convert a Stack to a Queue.
 * The top of the stack becomes the front of the queue (order is reversed
 * relative to push order, matching standard stack-to-queue reversal).
 */
export function fromStack<T>(stack: Stack<T>): Queue<T> {
  const arr = stack.toArray(); // top-first
  const q = new Queue<T>();
  for (const item of arr) {
    q.enqueue(item);
  }
  return q;
}

/** Convert a Queue to a Stack. The front of the queue becomes the top. */
export function fromQueue<T>(queue: Queue<T>): Stack<T> {
  const arr = queue.toArray(); // front-first
  const s = new Stack<T>();
  // Push in reverse so the front of the queue ends up on top
  for (let i = arr.length - 1; i >= 0; i--) {
    s.push(arr[i]);
  }
  return s;
}
