// Copyright (c) 2026 Nexara DMCC. All rights reserved.

/**
 * WaveletTree — supports efficient range frequency / order-statistic queries
 * over integer sequences in O(log(max-val)) per query.
 *
 * Convention: all l/r indices are 0-based, inclusive on both ends.
 */
export class WaveletTree {
  /** Original array length stored at the root */
  private readonly _size: number;

  /** Value-range low/high for this node */
  private readonly lo: number;
  private readonly hi: number;

  /**
   * prefix[i] = number of elements among arr[0..i-1] that go to the LEFT child
   * (i.e. value <= mid).  prefix[0] = 0 always.  Length = n+1.
   */
  private readonly prefix: number[];

  private readonly left: WaveletTree | null;
  private readonly right: WaveletTree | null;

  constructor(arr: number[], lo?: number, hi?: number) {
    this._size = arr.length;

    // Determine value range for this node
    if (lo === undefined || hi === undefined) {
      if (arr.length === 0) {
        this.lo = 0;
        this.hi = 0;
      } else {
        this.lo = Math.min(...arr);
        this.hi = Math.max(...arr);
      }
    } else {
      this.lo = lo;
      this.hi = hi;
    }

    const n = arr.length;

    if (n === 0 || this.lo === this.hi) {
      // Leaf node: no children, prefix not needed
      this.prefix = [];
      this.left = null;
      this.right = null;
      return;
    }

    const mid = Math.floor((this.lo + this.hi) / 2);

    // Build prefix array: prefix[i] = # elements in arr[0..i-1] with value <= mid
    this.prefix = new Array(n + 1);
    this.prefix[0] = 0;
    const leftArr: number[] = [];
    const rightArr: number[] = [];

    for (let i = 0; i < n; i++) {
      if (arr[i] <= mid) {
        this.prefix[i + 1] = this.prefix[i] + 1;
        leftArr.push(arr[i]);
      } else {
        this.prefix[i + 1] = this.prefix[i];
        rightArr.push(arr[i]);
      }
    }

    this.left = new WaveletTree(leftArr, this.lo, mid);
    this.right = new WaveletTree(rightArr, mid + 1, this.hi);
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  /** Number of elements in arr[0..pos] (inclusive) that went LEFT (value <= mid). */
  private leftCount(pos: number): number {
    // pos is 0-based; prefix has length n+1
    return this.prefix[pos + 1];
  }

  /** Total elements mapped to left child at this level. */
  private get totalLeft(): number {
    return this.prefix.length > 0 ? this.prefix[this.prefix.length - 1] : 0;
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /** Number of elements in the original array (only meaningful at root). */
  get size(): number {
    return this._size;
  }

  /**
   * k-th smallest element in arr[l..r] (1-indexed k).
   * Equivalent to the old kthSmallest interface.
   */
  query(l: number, r: number, k: number): number {
    if (this.lo === this.hi) return this.lo;

    // Elements going LEFT in [l..r]
    const lb = this.prefix[l];       // # left elements before index l
    const rb = this.prefix[r + 1];   // # left elements up to index r (inclusive)
    const countLeft = rb - lb;

    if (k <= countLeft) {
      // k-th smallest is in left child; map indices
      return this.left!.query(lb, rb - 1, k);
    } else {
      // It's in the right child; map indices
      const lo2 = l - lb;
      const ro2 = r + 1 - rb - 1; // = (r - rb+1 - 1) after removing left elements
      return this.right!.query(lo2, ro2, k - countLeft);
    }
  }

  /**
   * Count occurrences of value v in arr[l..r].
   */
  count(l: number, r: number, v: number): number {
    if (v < this.lo || v > this.hi) return 0;
    if (this.lo === this.hi) {
      // Every element in this node equals lo (=v), so count = r - l + 1
      return r - l + 1;
    }

    const mid = Math.floor((this.lo + this.hi) / 2);
    const lb = this.prefix[l];
    const rb = this.prefix[r + 1];

    if (v <= mid) {
      return this.left!.count(lb, rb - 1, v);
    } else {
      const lo2 = l - lb;
      const ro2 = r - rb; // right-child index for r: (r+1 - rb) elements in [0..r] went right, indices 0..r-rb
      return this.right!.count(lo2, ro2, v);
    }
  }

  /**
   * Count elements <= v in arr[l..r].
   */
  countLessEqual(l: number, r: number, v: number): number {
    if (v < this.lo) return 0;
    if (v >= this.hi) return r - l + 1;
    if (this.lo === this.hi) {
      // All elements here equal lo; return r-l+1 if lo<=v, else 0
      return this.lo <= v ? r - l + 1 : 0;
    }

    const mid = Math.floor((this.lo + this.hi) / 2);
    const lb = this.prefix[l];
    const rb = this.prefix[r + 1];
    const countLeft = rb - lb;
    const countRight = (r - l + 1) - countLeft;

    if (v <= mid) {
      // Right child all > mid > v, only recurse left
      if (countLeft === 0) return 0;
      return this.left!.countLessEqual(lb, rb - 1, v);
    } else {
      // All left elements are <= mid <= v, plus some from right
      const rightContrib = countRight === 0 ? 0 : this.right!.countLessEqual(l - lb, r - rb, v);
      return countLeft + rightContrib;
    }
  }

  /**
   * Count elements in [lo, hi] in arr[l..r].
   */
  countRange(l: number, r: number, lo: number, hi: number): number {
    if (lo > hi) return 0;
    return this.countLessEqual(l, r, hi) - this.countLessEqual(l, r, lo - 1);
  }
}

// ---------------------------------------------------------------------------
// Standalone convenience functions
// ---------------------------------------------------------------------------

/**
 * k-th smallest element in arr[l..r] (1-indexed k).
 */
export function kthSmallest(arr: number[], l: number, r: number, k: number): number {
  return new WaveletTree(arr).query(l, r, k);
}

/**
 * Count occurrences of v in arr[l..r].
 */
export function rangeFrequency(arr: number[], l: number, r: number, v: number): number {
  return new WaveletTree(arr).count(l, r, v);
}

/**
 * Count elements <= v in arr[l..r].
 */
export function rangeCountLessEqual(arr: number[], l: number, r: number, v: number): number {
  return new WaveletTree(arr).countLessEqual(l, r, v);
}

/**
 * Median of arr[l..r].
 * For even-length ranges, returns the lower median.
 */
export function rangeMedian(arr: number[], l: number, r: number): number {
  const len = r - l + 1;
  const k = Math.ceil(len / 2);
  return new WaveletTree(arr).query(l, r, k);
}
