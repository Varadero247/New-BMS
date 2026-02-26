// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export class RingBuffer<T> {
  private buffer: (T | undefined)[];
  private head = 0;
  private tail = 0;
  private _size = 0;
  readonly capacity: number;

  constructor(capacity: number) {
    if (capacity <= 0) throw new RangeError('Capacity must be positive');
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }

  get size(): number { return this._size; }
  get isEmpty(): boolean { return this._size === 0; }
  get isFull(): boolean { return this._size === this.capacity; }

  push(item: T): boolean {
    if (this.isFull) return false;
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this._size++;
    return true;
  }

  pushOverwrite(item: T): void {
    if (this.isFull) {
      // Overwrite oldest
      this.head = (this.head + 1) % this.capacity;
      this._size--;
    }
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;
    this._size++;
  }

  pop(): T | undefined {
    if (this.isEmpty) return undefined;
    const item = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.capacity;
    this._size--;
    return item;
  }

  peek(): T | undefined {
    if (this.isEmpty) return undefined;
    return this.buffer[this.head];
  }

  peekLast(): T | undefined {
    if (this.isEmpty) return undefined;
    const idx = (this.tail - 1 + this.capacity) % this.capacity;
    return this.buffer[idx];
  }

  at(index: number): T | undefined {
    if (index < 0 || index >= this._size) return undefined;
    return this.buffer[(this.head + index) % this.capacity];
  }

  clear(): void {
    this.buffer = new Array(this.capacity);
    this.head = 0;
    this.tail = 0;
    this._size = 0;
  }

  toArray(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this._size; i++) {
      result.push(this.buffer[(this.head + i) % this.capacity] as T);
    }
    return result;
  }

  [Symbol.iterator](): Iterator<T> {
    let i = 0;
    return {
      next: () => i < this._size
        ? { value: this.buffer[(this.head + i++) % this.capacity] as T, done: false }
        : { value: undefined as any, done: true }
    };
  }
}

export class OverwritingRingBuffer<T> extends RingBuffer<T> {
  push(item: T): boolean {
    this.pushOverwrite(item);
    return true;
  }
}

export function createRingBuffer<T>(capacity: number): RingBuffer<T> {
  return new RingBuffer<T>(capacity);
}

export function createOverwritingBuffer<T>(capacity: number): OverwritingRingBuffer<T> {
  return new OverwritingRingBuffer<T>(capacity);
}

export function fromArray<T>(items: T[], capacity?: number): RingBuffer<T> {
  const cap = capacity ?? items.length;
  const rb = new RingBuffer<T>(cap);
  for (const item of items) rb.push(item);
  return rb;
}
