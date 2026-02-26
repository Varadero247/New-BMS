// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ─── Generic Min-Heap ────────────────────────────────────────────────────────

export class MinHeap<T> {
  protected _data: T[] = [];
  protected _compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this._compare = compare;
  }

  push(item: T): void {
    this._data.push(item);
    this._bubbleUp(this._data.length - 1);
  }

  pop(): T | undefined {
    if (this._data.length === 0) return undefined;
    const top = this._data[0];
    const last = this._data.pop()!;
    if (this._data.length > 0) {
      this._data[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  peek(): T | undefined {
    return this._data.length > 0 ? this._data[0] : undefined;
  }

  get size(): number {
    return this._data.length;
  }

  isEmpty(): boolean {
    return this._data.length === 0;
  }

  toArray(): T[] {
    return [...this._data];
  }

  toSortedArray(): T[] {
    const copy = new MinHeap<T>(this._compare);
    copy._data = [...this._data];
    const result: T[] = [];
    while (!copy.isEmpty()) {
      result.push(copy.pop()!);
    }
    return result;
  }

  protected _bubbleUp(idx: number): void {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this._compare(this._data[idx], this._data[parent]) < 0) {
        [this._data[idx], this._data[parent]] = [this._data[parent], this._data[idx]];
        idx = parent;
      } else {
        break;
      }
    }
  }

  protected _siftDown(idx: number): void {
    const n = this._data.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < n && this._compare(this._data[left], this._data[smallest]) < 0) {
        smallest = left;
      }
      if (right < n && this._compare(this._data[right], this._data[smallest]) < 0) {
        smallest = right;
      }
      if (smallest !== idx) {
        [this._data[idx], this._data[smallest]] = [this._data[smallest], this._data[idx]];
        idx = smallest;
      } else {
        break;
      }
    }
  }
}

// ─── Generic Max-Heap ────────────────────────────────────────────────────────

export class MaxHeap<T> {
  protected _data: T[] = [];
  protected _compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this._compare = compare;
  }

  push(item: T): void {
    this._data.push(item);
    this._bubbleUp(this._data.length - 1);
  }

  pop(): T | undefined {
    if (this._data.length === 0) return undefined;
    const top = this._data[0];
    const last = this._data.pop()!;
    if (this._data.length > 0) {
      this._data[0] = last;
      this._siftDown(0);
    }
    return top;
  }

  peek(): T | undefined {
    return this._data.length > 0 ? this._data[0] : undefined;
  }

  get size(): number {
    return this._data.length;
  }

  isEmpty(): boolean {
    return this._data.length === 0;
  }

  toArray(): T[] {
    return [...this._data];
  }

  toSortedArray(): T[] {
    const copy = new MaxHeap<T>(this._compare);
    copy._data = [...this._data];
    const result: T[] = [];
    while (!copy.isEmpty()) {
      result.push(copy.pop()!);
    }
    return result;
  }

  protected _bubbleUp(idx: number): void {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      // max-heap: parent should be >= child, so bubble up if child > parent
      if (this._compare(this._data[idx], this._data[parent]) > 0) {
        [this._data[idx], this._data[parent]] = [this._data[parent], this._data[idx]];
        idx = parent;
      } else {
        break;
      }
    }
  }

  protected _siftDown(idx: number): void {
    const n = this._data.length;
    while (true) {
      let largest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < n && this._compare(this._data[left], this._data[largest]) > 0) {
        largest = left;
      }
      if (right < n && this._compare(this._data[right], this._data[largest]) > 0) {
        largest = right;
      }
      if (largest !== idx) {
        [this._data[idx], this._data[largest]] = [this._data[largest], this._data[idx]];
        idx = largest;
      } else {
        break;
      }
    }
  }
}

// ─── Numeric specialisations ─────────────────────────────────────────────────

export class NumericMinHeap extends MinHeap<number> {
  constructor() {
    super((a, b) => a - b);
  }
}

export class NumericMaxHeap extends MaxHeap<number> {
  constructor() {
    super((a, b) => a - b);
  }
}

// ─── Indexed Min-Heap ─────────────────────────────────────────────────────────

export class IndexedMinHeap<T extends { id: string | number }> {
  private _data: T[] = [];
  private _indexMap: Map<string | number, number> = new Map();
  private _compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this._compare = compare;
  }

  push(item: T): void {
    if (this._indexMap.has(item.id)) {
      this.update(item.id, item);
      return;
    }
    this._data.push(item);
    const idx = this._data.length - 1;
    this._indexMap.set(item.id, idx);
    this._bubbleUp(idx);
  }

  pop(): T | undefined {
    if (this._data.length === 0) return undefined;
    const top = this._data[0];
    this._indexMap.delete(top.id);
    const last = this._data.pop()!;
    if (this._data.length > 0) {
      this._data[0] = last;
      this._indexMap.set(last.id, 0);
      this._siftDown(0);
    }
    return top;
  }

  peek(): T | undefined {
    return this._data.length > 0 ? this._data[0] : undefined;
  }

  update(id: string | number, newItem: T): void {
    const idx = this._indexMap.get(id);
    if (idx === undefined) return;
    this._indexMap.delete(id);
    this._data[idx] = newItem;
    this._indexMap.set(newItem.id, idx);
    this._bubbleUp(idx);
    const newIdx = this._indexMap.get(newItem.id)!;
    this._siftDown(newIdx);
  }

  has(id: string | number): boolean {
    return this._indexMap.has(id);
  }

  get(id: string | number): T | undefined {
    const idx = this._indexMap.get(id);
    return idx !== undefined ? this._data[idx] : undefined;
  }

  delete(id: string | number): boolean {
    const idx = this._indexMap.get(id);
    if (idx === undefined) return false;
    this._indexMap.delete(id);
    const last = this._data.pop()!;
    if (idx < this._data.length) {
      this._data[idx] = last;
      this._indexMap.set(last.id, idx);
      this._bubbleUp(idx);
      const newIdx = this._indexMap.get(last.id)!;
      this._siftDown(newIdx);
    }
    return true;
  }

  get size(): number {
    return this._data.length;
  }

  isEmpty(): boolean {
    return this._data.length === 0;
  }

  private _bubbleUp(idx: number): void {
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      if (this._compare(this._data[idx], this._data[parent]) < 0) {
        this._swap(idx, parent);
        idx = parent;
      } else {
        break;
      }
    }
  }

  private _siftDown(idx: number): void {
    const n = this._data.length;
    while (true) {
      let smallest = idx;
      const left = 2 * idx + 1;
      const right = 2 * idx + 2;
      if (left < n && this._compare(this._data[left], this._data[smallest]) < 0) {
        smallest = left;
      }
      if (right < n && this._compare(this._data[right], this._data[smallest]) < 0) {
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

  private _swap(i: number, j: number): void {
    this._indexMap.set(this._data[i].id, j);
    this._indexMap.set(this._data[j].id, i);
    [this._data[i], this._data[j]] = [this._data[j], this._data[i]];
  }
}

// ─── K-way Merge ─────────────────────────────────────────────────────────────

interface MergeEntry<T> {
  value: T;
  arrayIndex: number;
  elementIndex: number;
}

export function kWayMerge<T>(arrays: T[][], compare: (a: T, b: T) => number): T[] {
  const result: T[] = [];
  const heap = new MinHeap<MergeEntry<T>>((a, b) => compare(a.value, b.value));

  for (let i = 0; i < arrays.length; i++) {
    if (arrays[i].length > 0) {
      heap.push({ value: arrays[i][0], arrayIndex: i, elementIndex: 0 });
    }
  }

  while (!heap.isEmpty()) {
    const entry = heap.pop()!;
    result.push(entry.value);
    const nextIdx = entry.elementIndex + 1;
    if (nextIdx < arrays[entry.arrayIndex].length) {
      heap.push({
        value: arrays[entry.arrayIndex][nextIdx],
        arrayIndex: entry.arrayIndex,
        elementIndex: nextIdx,
      });
    }
  }

  return result;
}

// ─── Top K / Bottom K ────────────────────────────────────────────────────────

export function topK<T>(arr: T[], k: number, compare: (a: T, b: T) => number): T[] {
  if (k <= 0) return [];
  if (k >= arr.length) {
    return [...arr].sort((a, b) => compare(b, a));
  }
  // Use a min-heap of size k; keep the largest k elements
  const heap = new MinHeap<T>(compare);
  for (const item of arr) {
    heap.push(item);
    if (heap.size > k) {
      heap.pop();
    }
  }
  return heap.toSortedArray().reverse();
}

export function bottomK<T>(arr: T[], k: number, compare: (a: T, b: T) => number): T[] {
  if (k <= 0) return [];
  if (k >= arr.length) {
    return [...arr].sort(compare);
  }
  // Use a max-heap of size k; keep the smallest k elements
  const heap = new MaxHeap<T>(compare);
  for (const item of arr) {
    heap.push(item);
    if (heap.size > k) {
      heap.pop();
    }
  }
  return heap.toSortedArray().reverse();
}

// ─── Heapify ─────────────────────────────────────────────────────────────────

export function heapifyMin<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDownMin(arr, i, n, compare);
  }
  return arr;
}

export function heapifyMax<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
  const n = arr.length;
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDownMax(arr, i, n, compare);
  }
  return arr;
}

function siftDownMin<T>(arr: T[], idx: number, n: number, compare: (a: T, b: T) => number): void {
  while (true) {
    let smallest = idx;
    const left = 2 * idx + 1;
    const right = 2 * idx + 2;
    if (left < n && compare(arr[left], arr[smallest]) < 0) smallest = left;
    if (right < n && compare(arr[right], arr[smallest]) < 0) smallest = right;
    if (smallest !== idx) {
      [arr[idx], arr[smallest]] = [arr[smallest], arr[idx]];
      idx = smallest;
    } else break;
  }
}

function siftDownMax<T>(arr: T[], idx: number, n: number, compare: (a: T, b: T) => number): void {
  while (true) {
    let largest = idx;
    const left = 2 * idx + 1;
    const right = 2 * idx + 2;
    if (left < n && compare(arr[left], arr[largest]) > 0) largest = left;
    if (right < n && compare(arr[right], arr[largest]) > 0) largest = right;
    if (largest !== idx) {
      [arr[idx], arr[largest]] = [arr[largest], arr[idx]];
      idx = largest;
    } else break;
  }
}

// ─── Heap Sort ────────────────────────────────────────────────────────────────

export function heapSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
  const a = [...arr];
  const n = a.length;
  // Build max-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDownMax(a, i, n, compare);
  }
  // Extract elements one by one
  for (let end = n - 1; end > 0; end--) {
    [a[0], a[end]] = [a[end], a[0]];
    siftDownMax(a, 0, end, compare);
  }
  return a;
}

// ─── Running Median ───────────────────────────────────────────────────────────

export class MedianFinder {
  // lower half: max-heap (stores smaller elements)
  private _lower: MaxHeap<number>;
  // upper half: min-heap (stores larger elements)
  private _upper: MinHeap<number>;

  constructor() {
    this._lower = new MaxHeap<number>((a, b) => a - b);
    this._upper = new MinHeap<number>((a, b) => a - b);
  }

  add(num: number): void {
    // Always push to lower first
    this._lower.push(num);
    // Balance: ensure lower's max <= upper's min
    if (!this._upper.isEmpty() && this._lower.peek()! > this._upper.peek()!) {
      this._upper.push(this._lower.pop()!);
    }
    // Balance sizes: lower can have at most 1 more element than upper
    if (this._lower.size > this._upper.size + 1) {
      this._upper.push(this._lower.pop()!);
    } else if (this._upper.size > this._lower.size) {
      this._lower.push(this._upper.pop()!);
    }
  }

  getMedian(): number {
    if (this._lower.size === 0 && this._upper.size === 0) {
      throw new Error('MedianFinder is empty');
    }
    if (this._lower.size > this._upper.size) {
      return this._lower.peek()!;
    }
    return (this._lower.peek()! + this._upper.peek()!) / 2;
  }

  get count(): number {
    return this._lower.size + this._upper.size;
  }
}

// ─── Builder functions ────────────────────────────────────────────────────────

export function buildMinHeap<T>(arr: T[], compare: (a: T, b: T) => number): MinHeap<T> {
  const heap = new MinHeap<T>(compare);
  for (const item of arr) {
    heap.push(item);
  }
  return heap;
}

export function buildMaxHeap<T>(arr: T[], compare: (a: T, b: T) => number): MaxHeap<T> {
  const heap = new MaxHeap<T>(compare);
  for (const item of arr) {
    heap.push(item);
  }
  return heap;
}
