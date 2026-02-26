// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// Default comparators
// ---------------------------------------------------------------------------

/** Default numeric comparator — ascending order */
export const numericAsc = (a: number, b: number): number => a - b;

/** Default numeric comparator — descending order */
export const numericDesc = (a: number, b: number): number => b - a;

/** Internal: default comparator used when none is provided */
function defaultCompare<T>(a: T, b: T): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

// ---------------------------------------------------------------------------
// Bubble Sort — O(n²) average/worst, O(n) best (already sorted), stable
// ---------------------------------------------------------------------------
export function bubbleSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const cmp = compare ?? defaultCompare;
  const result = arr.slice();
  const n = result.length;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - i; j++) {
      if (cmp(result[j], result[j + 1]) > 0) {
        const tmp = result[j];
        result[j] = result[j + 1];
        result[j + 1] = tmp;
        swapped = true;
      }
    }
    if (!swapped) break;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Selection Sort — O(n²) always, not stable
// ---------------------------------------------------------------------------
export function selectionSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const cmp = compare ?? defaultCompare;
  const result = arr.slice();
  const n = result.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      if (cmp(result[j], result[minIdx]) < 0) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      const tmp = result[i];
      result[i] = result[minIdx];
      result[minIdx] = tmp;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Insertion Sort — O(n²) worst, O(n) best, stable
// ---------------------------------------------------------------------------
export function insertionSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const cmp = compare ?? defaultCompare;
  const result = arr.slice();
  const n = result.length;
  for (let i = 1; i < n; i++) {
    const key = result[i];
    let j = i - 1;
    while (j >= 0 && cmp(result[j], key) > 0) {
      result[j + 1] = result[j];
      j--;
    }
    result[j + 1] = key;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Shell Sort — O(n log² n) worst (Ciura gaps), not stable
// ---------------------------------------------------------------------------
export function shellSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const cmp = compare ?? defaultCompare;
  const result = arr.slice();
  const n = result.length;
  // Ciura gap sequence
  const gaps = [701, 301, 132, 57, 23, 10, 4, 1];
  for (const gap of gaps) {
    if (gap >= n) continue;
    for (let i = gap; i < n; i++) {
      const temp = result[i];
      let j = i;
      while (j >= gap && cmp(result[j - gap], temp) > 0) {
        result[j] = result[j - gap];
        j -= gap;
      }
      result[j] = temp;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Merge Sort — O(n log n) always, stable
// ---------------------------------------------------------------------------
export function mergeSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const cmp = compare ?? defaultCompare;

  function merge(left: T[], right: T[]): T[] {
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

  function sort(a: T[]): T[] {
    if (a.length <= 1) return a.slice();
    const mid = Math.floor(a.length / 2);
    return merge(sort(a.slice(0, mid)), sort(a.slice(mid)));
  }

  return sort(arr);
}

// ---------------------------------------------------------------------------
// Quick Sort — O(n log n) average, O(n²) worst, not stable
// ---------------------------------------------------------------------------
export function quickSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const cmp = compare ?? defaultCompare;

  function sort(a: T[], lo: number, hi: number): void {
    if (lo >= hi) return;
    // median-of-three pivot
    const mid = Math.floor((lo + hi) / 2);
    if (cmp(a[mid], a[lo]) < 0) { const t = a[lo]; a[lo] = a[mid]; a[mid] = t; }
    if (cmp(a[hi], a[lo]) < 0) { const t = a[lo]; a[lo] = a[hi]; a[hi] = t; }
    if (cmp(a[mid], a[hi]) < 0) { const t = a[mid]; a[mid] = a[hi]; a[hi] = t; }
    const pivot = a[hi];
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      if (cmp(a[j], pivot) <= 0) {
        i++;
        const t = a[i]; a[i] = a[j]; a[j] = t;
      }
    }
    const t = a[i + 1]; a[i + 1] = a[hi]; a[hi] = t;
    const p = i + 1;
    sort(a, lo, p - 1);
    sort(a, p + 1, hi);
  }

  const result = arr.slice();
  sort(result, 0, result.length - 1);
  return result;
}

// ---------------------------------------------------------------------------
// Heap Sort — O(n log n) always, not stable
// ---------------------------------------------------------------------------
export function heapSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const cmp = compare ?? defaultCompare;
  const result = arr.slice();
  const n = result.length;

  function heapify(a: T[], size: number, root: number): void {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < size && cmp(a[left], a[largest]) > 0) largest = left;
    if (right < size && cmp(a[right], a[largest]) > 0) largest = right;
    if (largest !== root) {
      const tmp = a[root]; a[root] = a[largest]; a[largest] = tmp;
      heapify(a, size, largest);
    }
  }

  // Build max heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    heapify(result, n, i);
  }
  // Extract elements
  for (let i = n - 1; i > 0; i--) {
    const tmp = result[0]; result[0] = result[i]; result[i] = tmp;
    heapify(result, i, 0);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Tim Sort — simplified: insertion sort for small runs + bottom-up merge
// ---------------------------------------------------------------------------
const TIM_RUN = 32;

export function timSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const cmp = compare ?? defaultCompare;
  const result = arr.slice();
  const n = result.length;

  // Insertion sort for each run
  for (let i = 0; i < n; i += TIM_RUN) {
    const end = Math.min(i + TIM_RUN - 1, n - 1);
    for (let j = i + 1; j <= end; j++) {
      const key = result[j];
      let k = j - 1;
      while (k >= i && cmp(result[k], key) > 0) {
        result[k + 1] = result[k];
        k--;
      }
      result[k + 1] = key;
    }
  }

  // Merge runs
  function mergeRuns(a: T[], lo: number, mid: number, hi: number): void {
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      if (cmp(left[i], right[j]) <= 0) {
        a[k++] = left[i++];
      } else {
        a[k++] = right[j++];
      }
    }
    while (i < left.length) a[k++] = left[i++];
    while (j < right.length) a[k++] = right[j++];
  }

  for (let size = TIM_RUN; size < n; size *= 2) {
    for (let lo = 0; lo < n; lo += 2 * size) {
      const mid = Math.min(lo + size - 1, n - 1);
      const hi = Math.min(lo + 2 * size - 1, n - 1);
      if (mid < hi) mergeRuns(result, lo, mid, hi);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Tree Sort — insert into BST then in-order traversal
// ---------------------------------------------------------------------------
interface BSTNode<T> {
  value: T;
  left: BSTNode<T> | null;
  right: BSTNode<T> | null;
}

export function treeSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const cmp = compare ?? defaultCompare;
  if (arr.length === 0) return [];

  function insert(node: BSTNode<T> | null, value: T): BSTNode<T> {
    if (node === null) return { value, left: null, right: null };
    if (cmp(value, node.value) <= 0) {
      node.left = insert(node.left, value);
    } else {
      node.right = insert(node.right, value);
    }
    return node;
  }

  function inOrder(node: BSTNode<T> | null, out: T[]): void {
    if (node === null) return;
    inOrder(node.left, out);
    out.push(node.value);
    inOrder(node.right, out);
  }

  let root: BSTNode<T> | null = null;
  for (const val of arr) {
    root = insert(root, val);
  }
  const result: T[] = [];
  inOrder(root, result);
  return result;
}

// ---------------------------------------------------------------------------
// Counting Sort — O(n + k), only for non-negative integers
// ---------------------------------------------------------------------------
export function countingSort(arr: number[], min?: number, max?: number): number[] {
  if (arr.length === 0) return [];
  const lo = min !== undefined ? min : Math.min(...arr);
  const hi = max !== undefined ? max : Math.max(...arr);
  const range = hi - lo + 1;
  const count = new Array<number>(range).fill(0);
  for (const v of arr) {
    count[v - lo]++;
  }
  const result: number[] = [];
  for (let i = 0; i < range; i++) {
    for (let j = 0; j < count[i]; j++) {
      result.push(i + lo);
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Radix Sort — LSD, handles non-negative integers
// ---------------------------------------------------------------------------
export function radixSort(arr: number[]): number[] {
  if (arr.length === 0) return [];
  const result = arr.slice();
  const max = Math.max(...result);
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    countingSortByDigit(result, exp);
    exp *= 10;
  }
  return result;
}

function countingSortByDigit(arr: number[], exp: number): void {
  const n = arr.length;
  const output = new Array<number>(n);
  const count = new Array<number>(10).fill(0);
  for (let i = 0; i < n; i++) {
    count[Math.floor(arr[i] / exp) % 10]++;
  }
  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }
  for (let i = n - 1; i >= 0; i--) {
    const digit = Math.floor(arr[i] / exp) % 10;
    output[--count[digit]] = arr[i];
  }
  for (let i = 0; i < n; i++) {
    arr[i] = output[i];
  }
}

// ---------------------------------------------------------------------------
// Bucket Sort — for uniformly distributed numbers
// ---------------------------------------------------------------------------
export function bucketSort(arr: number[], bucketCount?: number): number[] {
  if (arr.length === 0) return [];
  const n = arr.length;
  const bCount = bucketCount ?? Math.max(1, Math.floor(Math.sqrt(n)));
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const range = max - min;

  const buckets: number[][] = Array.from({ length: bCount }, () => []);

  for (const v of arr) {
    let idx: number;
    if (range === 0) {
      idx = 0;
    } else {
      idx = Math.min(Math.floor(((v - min) / range) * bCount), bCount - 1);
    }
    buckets[idx].push(v);
  }

  const result: number[] = [];
  for (const bucket of buckets) {
    bucket.sort((a, b) => a - b);
    result.push(...bucket);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Cocktail Sort (bidirectional bubble sort) — O(n²), stable
// ---------------------------------------------------------------------------
export function cocktailSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const cmp = compare ?? defaultCompare;
  const result = arr.slice();
  let lo = 0;
  let hi = result.length - 1;
  let swapped = true;

  while (swapped && lo < hi) {
    swapped = false;
    for (let i = lo; i < hi; i++) {
      if (cmp(result[i], result[i + 1]) > 0) {
        const tmp = result[i]; result[i] = result[i + 1]; result[i + 1] = tmp;
        swapped = true;
      }
    }
    hi--;
    for (let i = hi; i > lo; i--) {
      if (cmp(result[i - 1], result[i]) > 0) {
        const tmp = result[i - 1]; result[i - 1] = result[i]; result[i] = tmp;
        swapped = true;
      }
    }
    lo++;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Gnome Sort — O(n²), stable
// ---------------------------------------------------------------------------
export function gnomeSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const cmp = compare ?? defaultCompare;
  const result = arr.slice();
  const n = result.length;
  let i = 0;
  while (i < n) {
    if (i === 0 || cmp(result[i - 1], result[i]) <= 0) {
      i++;
    } else {
      const tmp = result[i]; result[i] = result[i - 1]; result[i - 1] = tmp;
      i--;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Cycle Sort — O(n²), minimises writes, not stable
// ---------------------------------------------------------------------------
export function cycleSort<T>(arr: T[], compare?: (a: T, b: T) => number): T[] {
  const cmp = compare ?? defaultCompare;
  const result = arr.slice();
  const n = result.length;

  for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
    let item = result[cycleStart];
    let pos = cycleStart;

    for (let i = cycleStart + 1; i < n; i++) {
      if (cmp(result[i], item) < 0) pos++;
    }

    if (pos === cycleStart) continue;

    while (cmp(item, result[pos]) === 0) pos++;
    if (pos !== cycleStart) {
      const tmp = result[pos];
      result[pos] = item;
      item = tmp;
    }

    while (pos !== cycleStart) {
      pos = cycleStart;
      for (let i = cycleStart + 1; i < n; i++) {
        if (cmp(result[i], item) < 0) pos++;
      }
      while (cmp(item, result[pos]) === 0) pos++;
      if (cmp(item, result[pos]) !== 0) {
        const tmp = result[pos];
        result[pos] = item;
        item = tmp;
      }
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

/** Check if array is sorted (ascending by default) */
export function isSorted<T>(arr: T[], compare?: (a: T, b: T) => number): boolean {
  const cmp = compare ?? defaultCompare;
  for (let i = 1; i < arr.length; i++) {
    if (cmp(arr[i - 1], arr[i]) > 0) return false;
  }
  return true;
}

/**
 * Stable sort wrapper — guarantees stability by tagging each element with its
 * original index and using a tie-breaking comparator.
 */
export function stableSort<T>(arr: T[], compare: (a: T, b: T) => number): T[] {
  return arr
    .map((v, i) => ({ v, i }))
    .sort((a, b) => {
      const c = compare(a.v, b.v);
      return c !== 0 ? c : a.i - b.i;
    })
    .map(({ v }) => v);
}

/**
 * Count the number of swaps performed by bubble sort on the given array.
 * Useful for complexity analysis / inversion counting.
 */
export function countSwaps(arr: number[]): number {
  const a = arr.slice();
  let swaps = 0;
  const n = a.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - 1 - i; j++) {
      if (a[j] > a[j + 1]) {
        const tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp;
        swaps++;
      }
    }
  }
  return swaps;
}

/**
 * Count inversions in array using merge sort — O(n log n).
 * An inversion is a pair (i, j) where i < j and arr[i] > arr[j].
 */
export function countInversions(arr: number[]): number {
  function mergeCount(a: number[]): [number[], number] {
    if (a.length <= 1) return [a.slice(), 0];
    const mid = Math.floor(a.length / 2);
    const [left, lc] = mergeCount(a.slice(0, mid));
    const [right, rc] = mergeCount(a.slice(mid));
    const merged: number[] = [];
    let count = lc + rc;
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        merged.push(left[i++]);
      } else {
        // all remaining elements in left form inversions with right[j]
        count += left.length - i;
        merged.push(right[j++]);
      }
    }
    while (i < left.length) merged.push(left[i++]);
    while (j < right.length) merged.push(right[j++]);
    return [merged, count];
  }

  const [, count] = mergeCount(arr);
  return count;
}
