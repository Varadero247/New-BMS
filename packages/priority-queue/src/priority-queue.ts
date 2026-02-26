// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export type Comparator<T> = (a: T, b: T) => number;

export class PriorityQueue<T> {
  private heap: T[] = [];
  private cmp: Comparator<T>;

  constructor(comparator?: Comparator<T>) {
    this.cmp = comparator ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
  }

  get size(): number { return this.heap.length; }
  isEmpty(): boolean { return this.heap.length === 0; }
  peek(): T | undefined { return this.heap[0]; }

  enqueue(item: T): void {
    this.heap.push(item);
    this.siftUp(this.heap.length - 1);
  }

  dequeue(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) { this.heap[0] = last; this.siftDown(0); }
    return top;
  }

  remove(item: T): boolean {
    const idx = this.heap.findIndex(x => this.cmp(x, item) === 0);
    if (idx === -1) return false;
    const last = this.heap.pop()!;
    if (idx < this.heap.length) {
      this.heap[idx] = last;
      this.siftUp(idx);
      this.siftDown(idx);
    }
    return true;
  }

  toArray(): T[] { return [...this.heap].sort(this.cmp); }
  clear(): void { this.heap = []; }

  private siftUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.cmp(this.heap[i], this.heap[parent]) < 0) {
        [this.heap[i], this.heap[parent]] = [this.heap[parent], this.heap[i]];
        i = parent;
      } else break;
    }
  }

  private siftDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.cmp(this.heap[l], this.heap[smallest]) < 0) smallest = l;
      if (r < n && this.cmp(this.heap[r], this.heap[smallest]) < 0) smallest = r;
      if (smallest === i) break;
      [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
      i = smallest;
    }
  }
}

export class MaxPriorityQueue<T> extends PriorityQueue<T> {
  constructor() { super((a, b) => (a > b ? -1 : a < b ? 1 : 0)); }
}

export class MinPriorityQueue<T> extends PriorityQueue<T> {
  constructor() { super((a, b) => (a < b ? -1 : a > b ? 1 : 0)); }
}

export function createPriorityQueue<T>(cmp?: Comparator<T>): PriorityQueue<T> { return new PriorityQueue<T>(cmp); }

export function heapSort<T>(arr: T[], cmp?: Comparator<T>): T[] {
  const pq = new PriorityQueue<T>(cmp);
  for (const x of arr) pq.enqueue(x);
  return Array.from({ length: arr.length }, () => pq.dequeue() as T);
}
