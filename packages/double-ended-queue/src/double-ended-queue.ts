// Copyright (c) 2026 Nexara DMCC. All rights reserved.

export class Deque<T> {
  private items: T[] = [];
  pushFront(value: T): void { this.items.unshift(value); }
  pushBack(value: T): void { this.items.push(value); }
  popFront(): T | undefined { return this.items.shift(); }
  popBack(): T | undefined { return this.items.pop(); }
  peekFront(): T | undefined { return this.items[0]; }
  peekBack(): T | undefined { return this.items[this.items.length - 1]; }
  get size(): number { return this.items.length; }
  get isEmpty(): boolean { return this.items.length === 0; }
  clear(): void { this.items = []; }
  toArray(): T[] { return [...this.items]; }
  contains(value: T): boolean { return this.items.includes(value); }
  at(index: number): T | undefined { return index < 0 ? this.items[this.items.length + index] : this.items[index]; }
  reverse(): void { this.items.reverse(); }
  rotate(k: number): void {
    if (!this.items.length) return;
    const n = this.items.length;
    const steps = ((k % n) + n) % n;
    this.items = [...this.items.slice(steps), ...this.items.slice(0, steps)];
  }
  [Symbol.iterator](): Iterator<T> { return this.items[Symbol.iterator](); }
}

export class BoundedDeque<T> extends Deque<T> {
  constructor(private capacity: number) { super(); }
  pushFront(value: T): void { if (this.size >= this.capacity) this.popBack(); super.pushFront(value); }
  pushBack(value: T): void { if (this.size >= this.capacity) this.popFront(); super.pushBack(value); }
  get isFull(): boolean { return this.size >= this.capacity; }
}

export function createDeque<T>(): Deque<T> { return new Deque<T>(); }
export function createBoundedDeque<T>(capacity: number): BoundedDeque<T> { return new BoundedDeque<T>(capacity); }
export function fromArray<T>(arr: T[]): Deque<T> {
  const d = new Deque<T>(); for (const x of arr) d.pushBack(x); return d;
}

export function slidingWindowMax(nums: number[], k: number): number[] {
  if (!nums.length || k <= 0) return [];
  const result: number[] = [], dq: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    while (dq.length && dq[0] <= i - k) dq.shift();
    while (dq.length && nums[dq[dq.length - 1]] <= nums[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) result.push(nums[dq[0]]);
  }
  return result;
}

export function slidingWindowMin(nums: number[], k: number): number[] {
  if (!nums.length || k <= 0) return [];
  const result: number[] = [], dq: number[] = [];
  for (let i = 0; i < nums.length; i++) {
    while (dq.length && dq[0] <= i - k) dq.shift();
    while (dq.length && nums[dq[dq.length - 1]] >= nums[i]) dq.pop();
    dq.push(i);
    if (i >= k - 1) result.push(nums[dq[0]]);
  }
  return result;
}

export function isPalindromeDeque(s: string): boolean {
  const d = fromArray(s.split(''));
  while (d.size > 1) { if (d.popFront() !== d.popBack()) return false; }
  return true;
}
