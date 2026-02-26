// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export interface Task<T = unknown> { id: string; priority: number; data: T; addedAt: number; }
export interface QueueStats { pending: number; processed: number; failed: number; }

export class PriorityQueue<T = unknown> {
  private heap: Task<T>[] = [];
  private processedCount = 0; private failedCount = 0;
  private compare = (a: Task<T>, b: Task<T>) => b.priority - a.priority;

  enqueue(id: string, data: T, priority = 0): Task<T> {
    const task: Task<T> = { id, priority, data, addedAt: Date.now() };
    this.heap.push(task);
    this.bubbleUp(this.heap.length - 1);
    return task;
  }
  dequeue(): Task<T> | undefined {
    if (!this.heap.length) return undefined;
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length) { this.heap[0] = last; this.sinkDown(0); }
    this.processedCount++;
    return top;
  }
  peek(): Task<T> | undefined { return this.heap[0]; }
  get size(): number { return this.heap.length; }
  clear(): void { this.heap = []; }
  has(id: string): boolean { return this.heap.some(t => t.id === id); }
  remove(id: string): boolean {
    const i = this.heap.findIndex(t => t.id === id);
    if (i < 0) return false;
    this.heap.splice(i, 1);
    return true;
  }
  updatePriority(id: string, priority: number): boolean {
    const t = this.heap.find(t => t.id === id);
    if (!t) return false;
    t.priority = priority;
    this.heap.sort(this.compare);
    return true;
  }
  drain(): Task<T>[] { const all = [...this.heap].sort(this.compare); this.heap = []; return all; }
  stats(): QueueStats { return { pending: this.heap.length, processed: this.processedCount, failed: this.failedCount }; }
  toArray(): Task<T>[] { return [...this.heap].sort(this.compare); }
  recordFailure(): void { this.failedCount++; }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const p = Math.floor((i-1)/2);
      if (this.compare(this.heap[p], this.heap[i]) <= 0) { [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]]; i = p; }
      else break;
    }
  }
  private sinkDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let largest = i, l = 2*i+1, r = 2*i+2;
      if (l < n && this.compare(this.heap[l], this.heap[largest]) < 0) largest = l;
      if (r < n && this.compare(this.heap[r], this.heap[largest]) < 0) largest = r;
      if (largest === i) break;
      [this.heap[i], this.heap[largest]] = [this.heap[largest], this.heap[i]];
      i = largest;
    }
  }
}

export class FIFOQueue<T = unknown> {
  private queue: T[] = [];
  enqueue(item: T): void { this.queue.push(item); }
  dequeue(): T | undefined { return this.queue.shift(); }
  peek(): T | undefined { return this.queue[0]; }
  get size(): number { return this.queue.length; }
  clear(): void { this.queue = []; }
  isEmpty(): boolean { return this.queue.length === 0; }
  toArray(): T[] { return [...this.queue]; }
}
