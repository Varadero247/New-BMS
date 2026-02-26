// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/**
 * MonotoneQueue — sliding window min/max using a double-ended queue.
 *
 * For type 'min': the deque always holds values in non-decreasing order so
 * the front is always the current minimum of the window.
 * For type 'max': values are in non-increasing order so the front is the max.
 */
export class MonotoneQueue {
  private type: 'min' | 'max';
  private deque: number[];

  constructor(type: 'min' | 'max') {
    this.type = type;
    this.deque = [];
  }

  /**
   * Push a new value into the queue, maintaining the monotone property by
   * popping from the back any elements that would violate it.
   */
  push(value: number): void {
    if (this.type === 'min') {
      // Remove from back while back >= value (keep non-decreasing)
      while (this.deque.length > 0 && this.deque[this.deque.length - 1] >= value) {
        this.deque.pop();
      }
    } else {
      // Remove from back while back <= value (keep non-increasing)
      while (this.deque.length > 0 && this.deque[this.deque.length - 1] <= value) {
        this.deque.pop();
      }
    }
    this.deque.push(value);
  }

  /**
   * Remove the front element of the deque if it equals the provided value.
   * Call this when the element leaving the sliding window equals the front.
   */
  pop(value: number): void {
    if (this.deque.length > 0 && this.deque[0] === value) {
      this.deque.shift();
    }
  }

  /** Return the current min (type='min') or max (type='max'). */
  front(): number {
    if (this.deque.length === 0) {
      throw new Error('MonotoneQueue is empty');
    }
    return this.deque[0];
  }

  /** Number of elements currently in the internal deque. */
  get size(): number {
    return this.deque.length;
  }

  clear(): void {
    this.deque = [];
  }
}

/**
 * MonotoneStack — a stack that maintains a monotone (increasing or decreasing)
 * sequence by popping elements that would violate the property on each push.
 *
 * 'increasing': bottom-to-top values are strictly increasing (pop larger values
 *   when a smaller one is pushed).
 * 'decreasing': bottom-to-top values are strictly decreasing (pop smaller values
 *   when a larger one is pushed).
 */
export class MonotoneStack {
  private type: 'increasing' | 'decreasing';
  private stack: number[];

  constructor(type: 'increasing' | 'decreasing') {
    this.type = type;
    this.stack = [];
  }

  push(value: number): void {
    if (this.type === 'increasing') {
      // Maintain increasing order: remove elements >= value from top
      while (this.stack.length > 0 && this.stack[this.stack.length - 1] >= value) {
        this.stack.pop();
      }
    } else {
      // Maintain decreasing order: remove elements <= value from top
      while (this.stack.length > 0 && this.stack[this.stack.length - 1] <= value) {
        this.stack.pop();
      }
    }
    this.stack.push(value);
  }

  pop(): number | undefined {
    return this.stack.pop();
  }

  peek(): number | undefined {
    if (this.stack.length === 0) return undefined;
    return this.stack[this.stack.length - 1];
  }

  get size(): number {
    return this.stack.length;
  }

  toArray(): number[] {
    return [...this.stack];
  }

  clear(): void {
    this.stack = [];
  }
}

// ---------------------------------------------------------------------------
// Sliding window helpers
// ---------------------------------------------------------------------------

/**
 * Return an array of length (arr.length - k + 1) where each element is the
 * minimum of the corresponding window of size k.
 */
export function slidingWindowMin(arr: number[], k: number): number[] {
  if (arr.length === 0 || k <= 0) return [];
  if (k > arr.length) return [];

  const result: number[] = [];
  // deque stores INDICES; front is always index of minimum in window
  const deque: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    // Remove indices that are out of the current window
    while (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift();
    }
    // Remove from back while arr[back] >= arr[i] (maintain increasing)
    while (deque.length > 0 && arr[deque[deque.length - 1]] >= arr[i]) {
      deque.pop();
    }
    deque.push(i);

    // Window is complete starting from index k-1
    if (i >= k - 1) {
      result.push(arr[deque[0]]);
    }
  }

  return result;
}

/**
 * Return an array of length (arr.length - k + 1) where each element is the
 * maximum of the corresponding window of size k.
 */
export function slidingWindowMax(arr: number[], k: number): number[] {
  if (arr.length === 0 || k <= 0) return [];
  if (k > arr.length) return [];

  const result: number[] = [];
  // deque stores INDICES; front is always index of maximum in window
  const deque: number[] = [];

  for (let i = 0; i < arr.length; i++) {
    // Remove indices out of window
    while (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift();
    }
    // Remove from back while arr[back] <= arr[i] (maintain decreasing)
    while (deque.length > 0 && arr[deque[deque.length - 1]] <= arr[i]) {
      deque.pop();
    }
    deque.push(i);

    if (i >= k - 1) {
      result.push(arr[deque[0]]);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Next / Previous greater / smaller element
// ---------------------------------------------------------------------------

/**
 * For each index i, find the next index j > i where arr[j] > arr[i].
 * Returns arr[j] at position i, or -1 if no such j exists.
 */
export function nextGreaterElement(arr: number[]): number[] {
  const n = arr.length;
  const result = new Array<number>(n).fill(-1);
  const stack: number[] = []; // stores indices

  for (let i = 0; i < n; i++) {
    // While the element at stack top is less than current, we found its NGE
    while (stack.length > 0 && arr[stack[stack.length - 1]] < arr[i]) {
      const idx = stack.pop()!;
      result[idx] = arr[i];
    }
    stack.push(i);
  }

  return result;
}

/**
 * For each index i, find the next index j > i where arr[j] < arr[i].
 * Returns arr[j] at position i, or -1 if no such j exists.
 */
export function nextSmallerElement(arr: number[]): number[] {
  const n = arr.length;
  const result = new Array<number>(n).fill(-1);
  const stack: number[] = [];

  for (let i = 0; i < n; i++) {
    while (stack.length > 0 && arr[stack[stack.length - 1]] > arr[i]) {
      const idx = stack.pop()!;
      result[idx] = arr[i];
    }
    stack.push(i);
  }

  return result;
}

/**
 * For each index i, find the previous index j < i where arr[j] > arr[i].
 * Returns arr[j] at position i, or -1 if no such j exists.
 */
export function previousGreaterElement(arr: number[]): number[] {
  const n = arr.length;
  const result = new Array<number>(n).fill(-1);
  const stack: number[] = [];

  for (let i = 0; i < n; i++) {
    // Pop elements that are <= current (they can't be "greater")
    while (stack.length > 0 && stack[stack.length - 1] <= arr[i]) {
      stack.pop();
    }
    if (stack.length > 0) {
      result[i] = stack[stack.length - 1];
    }
    stack.push(arr[i]);
  }

  return result;
}

/**
 * For each index i, find the previous index j < i where arr[j] < arr[i].
 * Returns arr[j] at position i, or -1 if no such j exists.
 */
export function previousSmallerElement(arr: number[]): number[] {
  const n = arr.length;
  const result = new Array<number>(n).fill(-1);
  const stack: number[] = [];

  for (let i = 0; i < n; i++) {
    // Pop elements that are >= current
    while (stack.length > 0 && stack[stack.length - 1] >= arr[i]) {
      stack.pop();
    }
    if (stack.length > 0) {
      result[i] = stack[stack.length - 1];
    }
    stack.push(arr[i]);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Largest rectangle in histogram
// ---------------------------------------------------------------------------

/**
 * Given an array of histogram bar heights, return the area of the largest
 * rectangle that can be formed. Classic stack-based O(n) algorithm.
 */
export function largestRectangleInHistogram(heights: number[]): number {
  const n = heights.length;
  if (n === 0) return 0;

  const stack: number[] = []; // stores indices
  let maxArea = 0;

  for (let i = 0; i <= n; i++) {
    const currentHeight = i === n ? 0 : heights[i];
    while (stack.length > 0 && heights[stack[stack.length - 1]] > currentHeight) {
      const height = heights[stack.pop()!];
      const width = stack.length === 0 ? i : i - stack[stack.length - 1] - 1;
      maxArea = Math.max(maxArea, height * width);
    }
    stack.push(i);
  }

  return maxArea;
}

// ---------------------------------------------------------------------------
// Sliding window range (max - min)
// ---------------------------------------------------------------------------

/**
 * For each window of size k, return max(window) - min(window).
 * Result length is arr.length - k + 1.
 */
export function maxSlidingWindowRange(arr: number[], k: number): number[] {
  if (arr.length === 0 || k <= 0 || k > arr.length) return [];

  const maxArr = slidingWindowMax(arr, k);
  const minArr = slidingWindowMin(arr, k);

  return maxArr.map((v, i) => v - minArr[i]);
}
