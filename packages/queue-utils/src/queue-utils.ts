// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { CircularBufferStats, DequeNode, HeapType, QueueStats } from './types';

// ---------------------------------------------------------------------------
// Queue
// ---------------------------------------------------------------------------

/**
 * A FIFO queue backed by an array.
 * All enqueue/dequeue operations are O(1) amortised using a head-pointer
 * trick to avoid the O(n) cost of `Array.shift()`.
 */
export class Queue<T> {
  private _data: Array<T | undefined> = [];
  private _head = 0;
  private _totalEnqueued = 0;
  private _totalDequeued = 0;

  enqueue(item: T): void {
    this._data.push(item);
    this._totalEnqueued++;
  }

  dequeue(): T | undefined {
    if (this._head >= this._data.length) return undefined;
    const item = this._data[this._head] as T;
    this._data[this._head] = undefined; // release reference
    this._head++;
    this._totalDequeued++;
    // Compact the internal array when the dead-zone grows large
    if (this._head > 64 && this._head > this._data.length >> 1) {
      this._data = this._data.slice(this._head);
      this._head = 0;
    }
    return item;
  }

  peek(): T | undefined {
    if (this._head >= this._data.length) return undefined;
    return this._data[this._head] as T;
  }

  isEmpty(): boolean {
    return this._head >= this._data.length;
  }

  size(): number {
    return this._data.length - this._head;
  }

  clear(): void {
    this._data = [];
    this._head = 0;
  }

  toArray(): T[] {
    return this._data.slice(this._head) as T[];
  }

  fromArray(items: T[]): void {
    this._data = [...items];
    this._head = 0;
  }

  contains(item: T, eq?: (a: T, b: T) => boolean): boolean {
    const compareFn = eq ?? ((a: T, b: T) => a === b);
    for (let i = this._head; i < this._data.length; i++) {
      if (compareFn(this._data[i] as T, item)) return true;
    }
    return false;
  }

  getStats(): QueueStats {
    return {
      size: this.size(),
      totalEnqueued: this._totalEnqueued,
      totalDequeued: this._totalDequeued,
      isEmpty: this.isEmpty(),
    };
  }
}

// ---------------------------------------------------------------------------
// Stack
// ---------------------------------------------------------------------------

/**
 * A LIFO stack backed by an array.
 */
export class Stack<T> {
  private _data: T[] = [];

  push(item: T): void {
    this._data.push(item);
  }

  pop(): T | undefined {
    return this._data.pop();
  }

  peek(): T | undefined {
    return this._data.length > 0 ? this._data[this._data.length - 1] : undefined;
  }

  isEmpty(): boolean {
    return this._data.length === 0;
  }

  size(): number {
    return this._data.length;
  }

  clear(): void {
    this._data = [];
  }

  /** Returns items with the top of the stack first. */
  toArray(): T[] {
    return this._data.slice().reverse();
  }
}

// ---------------------------------------------------------------------------
// Deque
// ---------------------------------------------------------------------------

/**
 * A double-ended queue backed by a doubly-linked list.
 * All push/pop/peek operations are O(1).
 */
export class Deque<T> {
  private _head: DequeNode<T> | null = null;
  private _tail: DequeNode<T> | null = null;
  private _size = 0;

  private _makeNode(value: T): DequeNode<T> {
    return { value, prev: null, next: null };
  }

  pushFront(item: T): void {
    const node = this._makeNode(item);
    if (this._head === null) {
      this._head = this._tail = node;
    } else {
      node.next = this._head;
      this._head.prev = node;
      this._head = node;
    }
    this._size++;
  }

  pushBack(item: T): void {
    const node = this._makeNode(item);
    if (this._tail === null) {
      this._head = this._tail = node;
    } else {
      node.prev = this._tail;
      this._tail.next = node;
      this._tail = node;
    }
    this._size++;
  }

  popFront(): T | undefined {
    if (this._head === null) return undefined;
    const value = this._head.value;
    this._head = this._head.next;
    if (this._head !== null) {
      this._head.prev = null;
    } else {
      this._tail = null;
    }
    this._size--;
    return value;
  }

  popBack(): T | undefined {
    if (this._tail === null) return undefined;
    const value = this._tail.value;
    this._tail = this._tail.prev;
    if (this._tail !== null) {
      this._tail.next = null;
    } else {
      this._head = null;
    }
    this._size--;
    return value;
  }

  peekFront(): T | undefined {
    return this._head?.value;
  }

  peekBack(): T | undefined {
    return this._tail?.value;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  size(): number {
    return this._size;
  }

  /** Returns items in order from front to back. */
  toArray(): T[] {
    const result: T[] = [];
    let cur = this._head;
    while (cur !== null) {
      result.push(cur.value);
      cur = cur.next;
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// PriorityQueue  (binary min-heap / max-heap)
// ---------------------------------------------------------------------------

/**
 * A priority queue implemented as a binary heap.
 * Defaults to a min-heap with natural ordering (numbers ascending).
 */
export class PriorityQueue<T> {
  private _heap: T[] = [];
  private _compareFn: (a: T, b: T) => number;

  constructor(compareFn?: (a: T, b: T) => number, type: HeapType = 'min') {
    if (compareFn) {
      this._compareFn = compareFn;
    } else if (type === 'max') {
      this._compareFn = (a, b) => {
        if (a < b) return 1;
        if (a > b) return -1;
        return 0;
      };
    } else {
      this._compareFn = (a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      };
    }
  }

  private _swap(i: number, j: number): void {
    const tmp = this._heap[i];
    this._heap[i] = this._heap[j];
    this._heap[j] = tmp;
  }

  private _siftUp(idx: number): void {
    while (idx > 0) {
      const parent = (idx - 1) >> 1;
      if (this._compareFn(this._heap[idx], this._heap[parent]) < 0) {
        this._swap(idx, parent);
        idx = parent;
      } else {
        break;
      }
    }
  }

  private _siftDown(idx: number): void {
    const n = this._heap.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < n && this._compareFn(this._heap[left], this._heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < n && this._compareFn(this._heap[right], this._heap[smallest]) < 0) {
        smallest = right;
      }
      if (smallest !== idx) {
        this._swap(idx, smallest);
        idx = smallest;
      } else {
        break;
      }
    }
  }

  enqueue(item: T): void {
    this._heap.push(item);
    this._siftUp(this._heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this._heap.length === 0) return undefined;
    const top = this._heap[0];
    const last = this._heap.pop()!;
    if (this._heap.length > 0) {
      this._heap[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  peek(): T | undefined {
    return this._heap[0];
  }

  isEmpty(): boolean {
    return this._heap.length === 0;
  }

  size(): number {
    return this._heap.length;
  }

  /** Drains a copy of the heap into a sorted array without mutating this instance. */
  toSortedArray(): T[] {
    const copy = new PriorityQueue<T>(this._compareFn);
    copy._heap = this._heap.slice();
    const result: T[] = [];
    while (!copy.isEmpty()) {
      result.push(copy.dequeue()!);
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// CircularBuffer
// ---------------------------------------------------------------------------

/**
 * A fixed-capacity circular (ring) buffer.
 * When full, the oldest entry is overwritten on the next write.
 */
export class CircularBuffer<T> {
  private _buf: Array<T | undefined>;
  private _readIdx = 0;
  private _writeIdx = 0;
  private _size = 0;
  private _cap: number;
  private _totalWritten = 0;
  private _totalRead = 0;
  private _droppedWrites = 0;

  constructor(capacity: number) {
    if (capacity < 1) throw new RangeError('CircularBuffer capacity must be >= 1');
    this._cap = capacity;
    this._buf = new Array<T | undefined>(capacity).fill(undefined);
  }

  /** Write an item. When full, the oldest item is overwritten and counted as dropped. */
  write(item: T): void {
    if (this._size === this._cap) {
      // Overwrite oldest — advance read pointer to discard it
      this._readIdx = (this._readIdx + 1) % this._cap;
      this._droppedWrites++;
    } else {
      this._size++;
    }
    this._buf[this._writeIdx] = item;
    this._writeIdx = (this._writeIdx + 1) % this._cap;
    this._totalWritten++;
  }

  read(): T | undefined {
    if (this._size === 0) return undefined;
    const item = this._buf[this._readIdx] as T;
    this._buf[this._readIdx] = undefined;
    this._readIdx = (this._readIdx + 1) % this._cap;
    this._size--;
    this._totalRead++;
    return item;
  }

  peek(): T | undefined {
    if (this._size === 0) return undefined;
    return this._buf[this._readIdx] as T;
  }

  isEmpty(): boolean {
    return this._size === 0;
  }

  isFull(): boolean {
    return this._size === this._cap;
  }

  size(): number {
    return this._size;
  }

  capacity(): number {
    return this._cap;
  }

  /** Returns the current contents from oldest to newest, without consuming them. */
  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      result.push(this._buf[(this._readIdx + i) % this._cap] as T);
    }
    return result;
  }

  getStats(): CircularBufferStats {
    return {
      capacity: this._cap,
      size: this._size,
      isFull: this.isFull(),
      isEmpty: this.isEmpty(),
      totalWritten: this._totalWritten,
      totalRead: this._totalRead,
      droppedWrites: this._droppedWrites,
    };
  }
}

// ---------------------------------------------------------------------------
// Factory functions
// ---------------------------------------------------------------------------

/** Factory — creates an empty Queue<T>. */
export function createQueue<T>(): Queue<T> {
  return new Queue<T>();
}

/** Factory — creates an empty Stack<T>. */
export function createStack<T>(): Stack<T> {
  return new Stack<T>();
}

/** Factory — creates an empty Deque<T>. */
export function createDeque<T>(): Deque<T> {
  return new Deque<T>();
}

/** Factory — creates an empty PriorityQueue<T>. */
export function createPriorityQueue<T>(
  compareFn?: (a: T, b: T) => number,
  type?: HeapType,
): PriorityQueue<T> {
  return new PriorityQueue<T>(compareFn, type);
}

/** Factory — creates an empty CircularBuffer<T> with the given capacity. */
export function createCircularBuffer<T>(capacity: number): CircularBuffer<T> {
  return new CircularBuffer<T>(capacity);
}

/** Creates a Queue pre-filled with the provided items (first item = front). */
export function queueFromArray<T>(items: T[]): Queue<T> {
  const q = new Queue<T>();
  q.fromArray(items);
  return q;
}

/** Creates a Stack pre-filled with the provided items (last item = top). */
export function stackFromArray<T>(items: T[]): Stack<T> {
  const s = new Stack<T>();
  for (const item of items) s.push(item);
  return s;
}

/**
 * Sorts `items` using a PriorityQueue heap-sort.
 * Returns a new sorted array; does not mutate the input.
 */
export function heapSort<T>(items: T[], compareFn?: (a: T, b: T) => number): T[] {
  const pq = new PriorityQueue<T>(compareFn, 'min');
  for (const item of items) pq.enqueue(item);
  const result: T[] = [];
  while (!pq.isEmpty()) result.push(pq.dequeue()!);
  return result;
}
