// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { CompareFn, SortOrder, SortKey, SortConfig } from './types';

// ---------------------------------------------------------------------------
// Default comparator
// ---------------------------------------------------------------------------

function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Quick Sort (3-way partition, returns new array)
// ---------------------------------------------------------------------------

export function quickSort<T>(arr: readonly T[], compareFn: CompareFn<T> = defaultCompare): T[] {
  if (arr.length <= 1) return [...arr];
  const copy = [...arr];
  _quickSort3Way(copy, 0, copy.length - 1, compareFn);
  return copy;
}

function _quickSort3Way<T>(arr: T[], lo: number, hi: number, cmp: CompareFn<T>): void {
  if (lo >= hi) return;
  let lt = lo;
  let gt = hi;
  let i = lo + 1;
  const pivot = arr[lo];
  while (i <= gt) {
    const c = cmp(arr[i], pivot);
    if (c < 0) {
      [arr[lt], arr[i]] = [arr[i], arr[lt]];
      lt++;
      i++;
    } else if (c > 0) {
      [arr[i], arr[gt]] = [arr[gt], arr[i]];
      gt--;
    } else {
      i++;
    }
  }
  _quickSort3Way(arr, lo, lt - 1, cmp);
  _quickSort3Way(arr, gt + 1, hi, cmp);
}

// ---------------------------------------------------------------------------
// Merge Sort (stable, returns new array)
// ---------------------------------------------------------------------------

export function mergeSort<T>(arr: readonly T[], compareFn: CompareFn<T> = defaultCompare): T[] {
  if (arr.length <= 1) return [...arr];
  return _mergeSort([...arr], compareFn);
}

function _mergeSort<T>(arr: T[], cmp: CompareFn<T>): T[] {
  if (arr.length <= 1) return arr;
  const mid = Math.floor(arr.length / 2);
  const left = _mergeSort(arr.slice(0, mid), cmp);
  const right = _mergeSort(arr.slice(mid), cmp);
  return _merge(left, right, cmp);
}

function _merge<T>(left: T[], right: T[], cmp: CompareFn<T>): T[] {
  const result: T[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (cmp(left[i], right[j]) <= 0) {
      result.push(left[i++]);
    } else {
      result.push(right[j++]);
    }
  }
  while (i < left.length) result.push(left[i++]);
  while (j < right.length) result.push(right[j++]);
  return result;
}

// ---------------------------------------------------------------------------
// Heap Sort (returns new array)
// ---------------------------------------------------------------------------

export function heapSort<T>(arr: readonly T[], compareFn: CompareFn<T> = defaultCompare): T[] {
  if (arr.length <= 1) return [...arr];
  const copy = [...arr];
  const n = copy.length;
  // Build max-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    _heapify(copy, n, i, compareFn);
  }
  // Extract elements one by one
  for (let i = n - 1; i > 0; i--) {
    [copy[0], copy[i]] = [copy[i], copy[0]];
    _heapify(copy, i, 0, compareFn);
  }
  return copy;
}

function _heapify<T>(arr: T[], n: number, i: number, cmp: CompareFn<T>): void {
  let largest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && cmp(arr[left], arr[largest]) > 0) largest = left;
  if (right < n && cmp(arr[right], arr[largest]) > 0) largest = right;
  if (largest !== i) {
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    _heapify(arr, n, largest, cmp);
  }
}

// ---------------------------------------------------------------------------
// Insertion Sort (returns new array)
// ---------------------------------------------------------------------------

export function insertionSort<T>(arr: readonly T[], compareFn: CompareFn<T> = defaultCompare): T[] {
  if (arr.length <= 1) return [...arr];
  const copy = [...arr];
  for (let i = 1; i < copy.length; i++) {
    const key = copy[i];
    let j = i - 1;
    while (j >= 0 && compareFn(copy[j], key) > 0) {
      copy[j + 1] = copy[j];
      j--;
    }
    copy[j + 1] = key;
  }
  return copy;
}

// ---------------------------------------------------------------------------
// Bubble Sort (returns new array)
// ---------------------------------------------------------------------------

export function bubbleSort<T>(arr: readonly T[], compareFn: CompareFn<T> = defaultCompare): T[] {
  if (arr.length <= 1) return [...arr];
  const copy = [...arr];
  const n = copy.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      if (compareFn(copy[j], copy[j + 1]) > 0) {
        [copy[j], copy[j + 1]] = [copy[j + 1], copy[j]];
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return copy;
}

// ---------------------------------------------------------------------------
// Selection Sort (returns new array)
// ---------------------------------------------------------------------------

export function selectionSort<T>(arr: readonly T[], compareFn: CompareFn<T> = defaultCompare): T[] {
  if (arr.length <= 1) return [...arr];
  const copy = [...arr];
  const n = copy.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (compareFn(copy[j], copy[minIdx]) < 0) minIdx = j;
    }
    if (minIdx !== i) [copy[i], copy[minIdx]] = [copy[minIdx], copy[i]];
  }
  return copy;
}

// ---------------------------------------------------------------------------
// Counting Sort (non-negative integers only)
// ---------------------------------------------------------------------------

export function countingSort(arr: readonly number[]): number[] {
  if (arr.length === 0) return [];
  const max = Math.max(...arr);
  const min = Math.min(...arr);
  if (min < 0) throw new RangeError('countingSort requires non-negative integers');
  const count = new Array<number>(max + 1).fill(0);
  for (const v of arr) count[v]++;
  const result: number[] = [];
  for (let i = 0; i <= max; i++) {
    for (let j = 0; j < count[i]; j++) result.push(i);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Radix Sort — LSD, non-negative integers
// ---------------------------------------------------------------------------

export function radixSort(arr: readonly number[]): number[] {
  if (arr.length === 0) return [];
  if (arr.some((v) => v < 0)) throw new RangeError('radixSort requires non-negative integers');
  let copy = [...arr];
  const max = Math.max(...copy);
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    copy = _countingSortByDigit(copy, exp);
    exp *= 10;
  }
  return copy;
}

function _countingSortByDigit(arr: number[], exp: number): number[] {
  const n = arr.length;
  const output = new Array<number>(n);
  const count = new Array<number>(10).fill(0);
  for (const v of arr) count[Math.floor(v / exp) % 10]++;
  for (let i = 1; i < 10; i++) count[i] += count[i - 1];
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    output[--count[digit]] = arr[i];
  }
  return output;
}

// ---------------------------------------------------------------------------
// Bucket Sort (numbers in [0,1) or normalised; bucketCount optional)
// ---------------------------------------------------------------------------

export function bucketSort(arr: readonly number[], bucketCount?: number): number[] {
  if (arr.length === 0) return [];
  const n = arr.length;
  const k = bucketCount !== undefined && bucketCount > 0 ? bucketCount : n;

  const min = Math.min(...arr);
  const max = Math.max(...arr);

  if (min === max) return [...arr];

  const range = max - min;
  const buckets: number[][] = Array.from({ length: k }, () => []);

  for (const v of arr) {
    // Normalise to [0,1) then map to bucket index
    const normalised = (v - min) / range;
    const idx = Math.min(Math.floor(normalised * k), k - 1);
    buckets[idx].push(v);
  }

  const result: number[] = [];
  for (const bucket of buckets) {
    bucket.sort((a, b) => a - b);
    for (const v of bucket) result.push(v);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Shell Sort (Knuth gap sequence, returns new array)
// ---------------------------------------------------------------------------

export function shellSort<T>(arr: readonly T[], compareFn: CompareFn<T> = defaultCompare): T[] {
  if (arr.length <= 1) return [...arr];
  const copy = [...arr];
  const n = copy.length;
  // Knuth gap sequence: 1, 4, 13, 40, 121, ...
  let gap = 1;
  while (gap < Math.floor(n / 3)) gap = gap * 3 + 1;

  while (gap >= 1) {
    for (let i = gap; i < n; i++) {
      const temp = copy[i];
      let j = i;
      while (j >= gap && compareFn(copy[j - gap], temp) > 0) {
        copy[j] = copy[j - gap];
        j -= gap;
      }
      copy[j] = temp;
    }
    gap = Math.floor((gap - 1) / 3);
  }
  return copy;
}

// ---------------------------------------------------------------------------
// Object / multi-key sorting
// ---------------------------------------------------------------------------

export function sortBy<T>(arr: readonly T[], key: SortKey<T>, order: SortOrder = 'asc'): T[] {
  const copy = [...arr];
  copy.sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    let cmp = 0;
    if (av < bv) cmp = -1;
    else if (av > bv) cmp = 1;
    return order === 'asc' ? cmp : -cmp;
  });
  return copy;
}

export function sortByMultiple<T>(arr: readonly T[], configs: SortConfig<T>[]): T[] {
  const copy = [...arr];
  copy.sort((a, b) => {
    for (const { key, order = 'asc' } of configs) {
      const av = a[key];
      const bv = b[key];
      let cmp = 0;
      if (av < bv) cmp = -1;
      else if (av > bv) cmp = 1;
      if (cmp !== 0) return order === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
  return copy;
}

export function sortByFn<T>(arr: readonly T[], fn: (item: T) => number | string, order: SortOrder = 'asc'): T[] {
  const copy = [...arr];
  copy.sort((a, b) => {
    const av = fn(a);
    const bv = fn(b);
    let cmp = 0;
    if (av < bv) cmp = -1;
    else if (av > bv) cmp = 1;
    return order === 'asc' ? cmp : -cmp;
  });
  return copy;
}

export function stableSort<T>(arr: readonly T[], compareFn: CompareFn<T>): T[] {
  // Tag each element with original index for stability guarantee
  const tagged = arr.map((v, i) => ({ v, i }));
  tagged.sort((a, b) => {
    const c = compareFn(a.v, b.v);
    return c !== 0 ? c : a.i - b.i;
  });
  return tagged.map((t) => t.v);
}

// ---------------------------------------------------------------------------
// Search algorithms
// ---------------------------------------------------------------------------

export function binarySearch<T>(arr: readonly T[], target: T, compareFn: CompareFn<T> = defaultCompare): number {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const cmp = compareFn(arr[mid], target);
    if (cmp === 0) return mid;
    if (cmp < 0) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}

export function binarySearchLeft<T>(arr: readonly T[], target: T, compareFn: CompareFn<T> = defaultCompare): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (compareFn(arr[mid], target) < 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function binarySearchRight<T>(arr: readonly T[], target: T, compareFn: CompareFn<T> = defaultCompare): number {
  let lo = 0;
  let hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (compareFn(arr[mid], target) <= 0) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

export function interpolationSearch(arr: readonly number[], target: number): number {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi && target >= arr[lo] && target <= arr[hi]) {
    if (lo === hi) return arr[lo] === target ? lo : -1;
    const range = arr[hi] - arr[lo];
    if (range === 0) return arr[lo] === target ? lo : -1;
    const pos = lo + Math.floor(((target - arr[lo]) / range) * (hi - lo));
    if (arr[pos] === target) return pos;
    if (arr[pos] < target) lo = pos + 1;
    else hi = pos - 1;
  }
  return -1;
}

// ---------------------------------------------------------------------------
// Ranking & ordering utilities
// ---------------------------------------------------------------------------

export function rankItems<T>(arr: readonly T[], compareFn: CompareFn<T> = defaultCompare): number[] {
  if (arr.length === 0) return [];
  const indexed = arr.map((v, i) => ({ v, i }));
  indexed.sort((a, b) => compareFn(a.v, b.v));
  const ranks = new Array<number>(arr.length);
  let rank = 1;
  let i = 0;
  while (i < indexed.length) {
    let j = i;
    // Find run of equal elements
    while (j < indexed.length - 1 && compareFn(indexed[j].v, indexed[j + 1].v) === 0) j++;
    const avgRank = (rank + rank + (j - i)) / 2; // average rank for ties
    for (let k = i; k <= j; k++) ranks[indexed[k].i] = avgRank;
    rank += j - i + 1;
    i = j + 1;
  }
  return ranks;
}

export function topN<T>(arr: readonly T[], n: number, compareFn: CompareFn<T> = defaultCompare): T[] {
  if (n <= 0) return [];
  if (n >= arr.length) return mergeSort(arr, compareFn).reverse();
  // Build a min-heap of size n (use array; compareFn inverted for min-heap of top-n)
  const heap: T[] = arr.slice(0, n);
  // Build min-heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) _minHeapify(heap, n, i, compareFn);
  for (let i = n; i < arr.length; i++) {
    if (compareFn(arr[i], heap[0]) > 0) {
      heap[0] = arr[i];
      _minHeapify(heap, n, 0, compareFn);
    }
  }
  // Sort heap descending
  heap.sort((a, b) => compareFn(b, a));
  return heap;
}

function _minHeapify<T>(arr: T[], n: number, i: number, cmp: CompareFn<T>): void {
  let smallest = i;
  const left = 2 * i + 1;
  const right = 2 * i + 2;
  if (left < n && cmp(arr[left], arr[smallest]) < 0) smallest = left;
  if (right < n && cmp(arr[right], arr[smallest]) < 0) smallest = right;
  if (smallest !== i) {
    [arr[i], arr[smallest]] = [arr[smallest], arr[i]];
    _minHeapify(arr, n, smallest, cmp);
  }
}

export function bottomN<T>(arr: readonly T[], n: number, compareFn: CompareFn<T> = defaultCompare): T[] {
  if (n <= 0) return [];
  if (n >= arr.length) return mergeSort(arr, compareFn);
  // topN with inverted comparator selects the N smallest elements.
  // Inside topN the final heap.sort uses (a,b) => invertedCmp(b,a) = realCmp(a,b),
  // so the result is already sorted ascending under the real comparator.
  const inverted: CompareFn<T> = (a, b) => compareFn(b, a);
  return topN(arr, n, inverted);
}

export function isSorted<T>(arr: readonly T[], compareFn: CompareFn<T> = defaultCompare): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (compareFn(arr[i - 1], arr[i]) > 0) return false;
  }
  return true;
}

export function isSortedDesc<T>(arr: readonly T[], compareFn: CompareFn<T> = defaultCompare): boolean {
  for (let i = 1; i < arr.length; i++) {
    if (compareFn(arr[i - 1], arr[i]) < 0) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// Shuffle — Fisher-Yates with optional seeded LCG
// ---------------------------------------------------------------------------

export function shuffle<T>(arr: readonly T[], seed?: number): T[] {
  const copy = [...arr];
  let rand: () => number;
  if (seed !== undefined) {
    // Simple LCG: same constants as glibc
    let s = seed >>> 0;
    rand = () => {
      s = (Math.imul(1664525, s) + 1013904223) >>> 0;
      return s / 0x100000000;
    };
  } else {
    rand = Math.random;
  }
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ---------------------------------------------------------------------------
// Natural sort comparator
// ---------------------------------------------------------------------------

export function naturalSort(a: string, b: string): number {
  const tokenise = (s: string): Array<string | number> => {
    const parts: Array<string | number> = [];
    const re = /(\d+)|(\D+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(s)) !== null) {
      parts.push(m[1] !== undefined ? parseInt(m[1], 10) : m[2]);
    }
    return parts;
  };

  const aParts = tokenise(a);
  const bParts = tokenise(b);
  const len = Math.min(aParts.length, bParts.length);

  for (let i = 0; i < len; i++) {
    const ap = aParts[i];
    const bp = bParts[i];
    if (typeof ap === 'number' && typeof bp === 'number') {
      if (ap !== bp) return ap - bp;
    } else {
      const as = String(ap);
      const bs = String(bp);
      if (as < bs) return -1;
      if (as > bs) return 1;
    }
  }
  return aParts.length - bParts.length;
}
