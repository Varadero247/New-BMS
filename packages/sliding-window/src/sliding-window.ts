// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Sliding Window Algorithm Utilities
 * Provides O(n) sliding window algorithms for arrays and streams.
 */

// ---------------------------------------------------------------------------
// slidingWindowMax
// Returns the maximum value in each window of size k using a monotonic deque.
// ---------------------------------------------------------------------------
export function slidingWindowMax(arr: number[], k: number): number[] {
  if (arr.length === 0 || k <= 0) return [];
  const n = arr.length;
  if (k > n) return [];
  const result: number[] = [];
  // deque stores indices; front is always the index of the current window max
  const deque: number[] = [];

  for (let i = 0; i < n; i++) {
    // Remove indices that are out of the current window
    while (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift();
    }
    // Remove from back all indices whose values are less than arr[i]
    while (deque.length > 0 && arr[deque[deque.length - 1]] < arr[i]) {
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
// slidingWindowMin
// Returns the minimum value in each window of size k using a monotonic deque.
// ---------------------------------------------------------------------------
export function slidingWindowMin(arr: number[], k: number): number[] {
  if (arr.length === 0 || k <= 0) return [];
  const n = arr.length;
  if (k > n) return [];
  const result: number[] = [];
  const deque: number[] = [];

  for (let i = 0; i < n; i++) {
    while (deque.length > 0 && deque[0] < i - k + 1) {
      deque.shift();
    }
    while (deque.length > 0 && arr[deque[deque.length - 1]] > arr[i]) {
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
// slidingWindowSum
// Returns the sum of each window of size k in O(n).
// ---------------------------------------------------------------------------
export function slidingWindowSum(arr: number[], k: number): number[] {
  if (arr.length === 0 || k <= 0) return [];
  const n = arr.length;
  if (k > n) return [];
  const result: number[] = [];
  let windowSum = 0;

  for (let i = 0; i < k; i++) {
    windowSum += arr[i];
  }
  result.push(windowSum);

  for (let i = k; i < n; i++) {
    windowSum += arr[i] - arr[i - k];
    result.push(windowSum);
  }
  return result;
}

// ---------------------------------------------------------------------------
// slidingWindowAvg
// Returns the average of each window of size k.
// ---------------------------------------------------------------------------
export function slidingWindowAvg(arr: number[], k: number): number[] {
  return slidingWindowSum(arr, k).map((s) => s / k);
}

// ---------------------------------------------------------------------------
// slidingWindowCount
// Returns the count of elements satisfying predicate in each window of size k.
// ---------------------------------------------------------------------------
export function slidingWindowCount(
  arr: unknown[],
  k: number,
  predicate: (x: unknown) => boolean,
): number[] {
  if (arr.length === 0 || k <= 0) return [];
  const n = arr.length;
  if (k > n) return [];
  const result: number[] = [];
  let count = 0;

  for (let i = 0; i < k; i++) {
    if (predicate(arr[i])) count++;
  }
  result.push(count);

  for (let i = k; i < n; i++) {
    if (predicate(arr[i])) count++;
    if (predicate(arr[i - k])) count--;
    result.push(count);
  }
  return result;
}

// ---------------------------------------------------------------------------
// maxSubarraySum
// Returns the maximum subarray sum of exactly length k.
// ---------------------------------------------------------------------------
export function maxSubarraySum(arr: number[], k: number): number {
  if (arr.length === 0 || k <= 0 || k > arr.length) return 0;
  const sums = slidingWindowSum(arr, k);
  return Math.max(...sums);
}

// ---------------------------------------------------------------------------
// minSubarrayLength
// Returns minimum length subarray with sum >= target; 0 if none exists.
// Uses two-pointer approach O(n) (works for non-negative values).
// ---------------------------------------------------------------------------
export function minSubarrayLength(arr: number[], target: number): number {
  const n = arr.length;
  let minLen = Infinity;
  let left = 0;
  let currentSum = 0;

  for (let right = 0; right < n; right++) {
    currentSum += arr[right];
    while (currentSum >= target) {
      minLen = Math.min(minLen, right - left + 1);
      currentSum -= arr[left];
      left++;
    }
  }
  return minLen === Infinity ? 0 : minLen;
}

// ---------------------------------------------------------------------------
// longestSubstringKDistinct
// Returns the length of the longest substring with at most k distinct chars.
// ---------------------------------------------------------------------------
export function longestSubstringKDistinct(s: string, k: number): number {
  if (k <= 0 || s.length === 0) return 0;
  const charCount = new Map<string, number>();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    charCount.set(ch, (charCount.get(ch) ?? 0) + 1);

    while (charCount.size > k) {
      const leftCh = s[left];
      const cnt = charCount.get(leftCh)!;
      if (cnt === 1) {
        charCount.delete(leftCh);
      } else {
        charCount.set(leftCh, cnt - 1);
      }
      left++;
    }
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

// ---------------------------------------------------------------------------
// longestSubstringNoRepeat
// Returns the length of the longest substring without repeating characters.
// ---------------------------------------------------------------------------
export function longestSubstringNoRepeat(s: string): number {
  const lastIndex = new Map<string, number>();
  let left = 0;
  let maxLen = 0;

  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    const prev = lastIndex.get(ch);
    if (prev !== undefined && prev >= left) {
      left = prev + 1;
    }
    lastIndex.set(ch, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}

// ---------------------------------------------------------------------------
// allAnagrams
// Returns start indices of all anagrams of p in s.
// ---------------------------------------------------------------------------
export function allAnagrams(s: string, p: string): number[] {
  const result: number[] = [];
  if (p.length > s.length || p.length === 0) return result;

  const pCount = new Array(26).fill(0);
  const wCount = new Array(26).fill(0);
  const a = 'a'.charCodeAt(0);

  for (let i = 0; i < p.length; i++) {
    pCount[p.charCodeAt(i) - a]++;
    wCount[s.charCodeAt(i) - a]++;
  }

  const equals = () => pCount.every((v, i) => v === wCount[i]);

  if (equals()) result.push(0);

  for (let i = p.length; i < s.length; i++) {
    wCount[s.charCodeAt(i) - a]++;
    wCount[s.charCodeAt(i - p.length) - a]--;
    if (equals()) result.push(i - p.length + 1);
  }
  return result;
}

// ---------------------------------------------------------------------------
// SlidingWindow class
// A fixed-size sliding window that maintains max, min, sum, avg.
// Uses a deque for O(1) amortised max/min.
// ---------------------------------------------------------------------------
export class SlidingWindow {
  private readonly _size: number;
  private readonly _buffer: number[];
  private _head: number = 0; // index of oldest element
  private _count: number = 0;
  private _sum: number = 0;
  // Deques store buffer indices
  private readonly _maxDeque: number[] = []; // front = index of max
  private readonly _minDeque: number[] = []; // front = index of min

  constructor(size: number) {
    if (size <= 0) throw new RangeError('SlidingWindow size must be > 0');
    this._size = size;
    this._buffer = new Array<number>(size).fill(0);
  }

  get size(): number {
    return this._size;
  }

  get count(): number {
    return this._count;
  }

  /**
   * Push a new value into the window, evicting the oldest if full.
   */
  push(value: number): void {
    // Index where new value will be written
    const writeIdx = (this._head + this._count) % this._size;

    if (this._count === this._size) {
      // Window is full — evict oldest (at _head)
      const evictedVal = this._buffer[this._head];
      this._sum -= evictedVal;

      // Remove from max deque if it references the evicted position
      if (this._maxDeque.length > 0 && this._maxDeque[0] === this._head) {
        this._maxDeque.shift();
      }
      if (this._minDeque.length > 0 && this._minDeque[0] === this._head) {
        this._minDeque.shift();
      }
      this._head = (this._head + 1) % this._size;
    } else {
      this._count++;
    }

    // Write value
    this._buffer[writeIdx] = value;
    this._sum += value;

    // Maintain max deque (monotonically decreasing values)
    while (
      this._maxDeque.length > 0 &&
      this._buffer[this._maxDeque[this._maxDeque.length - 1]] <= value
    ) {
      this._maxDeque.pop();
    }
    this._maxDeque.push(writeIdx);

    // Maintain min deque (monotonically increasing values)
    while (
      this._minDeque.length > 0 &&
      this._buffer[this._minDeque[this._minDeque.length - 1]] >= value
    ) {
      this._minDeque.pop();
    }
    this._minDeque.push(writeIdx);
  }

  getMax(): number {
    if (this._count === 0) throw new Error('SlidingWindow is empty');
    return this._buffer[this._maxDeque[0]];
  }

  getMin(): number {
    if (this._count === 0) throw new Error('SlidingWindow is empty');
    return this._buffer[this._minDeque[0]];
  }

  getSum(): number {
    return this._sum;
  }

  getAvg(): number {
    if (this._count === 0) return 0;
    return this._sum / this._count;
  }

  isFull(): boolean {
    return this._count === this._size;
  }
}

// ---------------------------------------------------------------------------
// RollingStats class
// Maintains Welford's online algorithm for count, sum, mean, variance, stddev.
// Supports O(1) add/remove operations suitable for sliding windows.
// Note: variance computed using Bessel-corrected (sample) variance when count > 1.
// ---------------------------------------------------------------------------
export class RollingStats {
  private _count: number = 0;
  private _sum: number = 0;
  private _m2: number = 0; // sum of squared deviations from current mean
  private _mean: number = 0;

  get count(): number {
    return this._count;
  }

  get sum(): number {
    return this._sum;
  }

  get mean(): number {
    return this._mean;
  }

  /**
   * Sample variance (Bessel-corrected). Returns 0 when count <= 1.
   */
  get variance(): number {
    if (this._count <= 1) return 0;
    return this._m2 / (this._count - 1);
  }

  get stddev(): number {
    return Math.sqrt(this.variance);
  }

  /**
   * Add a value using Welford's online algorithm.
   */
  add(x: number): void {
    this._count++;
    this._sum += x;
    const delta = x - this._mean;
    this._mean += delta / this._count;
    const delta2 = x - this._mean;
    this._m2 += delta * delta2;
  }

  /**
   * Remove a previously added value.
   * Uses the inverse of Welford's algorithm.
   * Accurate only when values are removed in the same order they were added
   * (i.e., sliding window eviction of the oldest element).
   */
  remove(x: number): void {
    if (this._count === 0) return;
    if (this._count === 1) {
      this._count = 0;
      this._sum = 0;
      this._mean = 0;
      this._m2 = 0;
      return;
    }
    this._count--;
    this._sum -= x;
    const delta = x - this._mean;
    this._mean -= delta / this._count;
    const delta2 = x - this._mean;
    this._m2 -= delta * delta2;
    if (this._m2 < 0) this._m2 = 0; // guard floating point drift
  }
}
