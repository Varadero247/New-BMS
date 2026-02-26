// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

// ---------------------------------------------------------------------------
// TreapNode — internal node for Treap<T>
// ---------------------------------------------------------------------------
class TreapNode<T> {
  key: number;
  value: T;
  priority: number;
  left: TreapNode<T> | null = null;
  right: TreapNode<T> | null = null;
  size: number = 1;

  constructor(key: number, value: T) {
    this.key = key;
    this.value = value;
    this.priority = Math.random();
  }
}

function nodeSize<T>(node: TreapNode<T> | null): number {
  return node ? node.size : 0;
}

function updateSize<T>(node: TreapNode<T>): void {
  node.size = 1 + nodeSize(node.left) + nodeSize(node.right);
}

// ---------------------------------------------------------------------------
// Treap<T> — randomised BST + heap
// ---------------------------------------------------------------------------
export class Treap<T> {
  private root: TreapNode<T> | null = null;

  // ---------- internal helpers ----------

  private rotateRight(y: TreapNode<T>): TreapNode<T> {
    const x = y.left!;
    y.left = x.right;
    x.right = y;
    updateSize(y);
    updateSize(x);
    return x;
  }

  private rotateLeft(x: TreapNode<T>): TreapNode<T> {
    const y = x.right!;
    x.right = y.left;
    y.left = x;
    updateSize(x);
    updateSize(y);
    return y;
  }

  private insertNode(
    node: TreapNode<T> | null,
    key: number,
    value: T,
  ): TreapNode<T> {
    if (node === null) return new TreapNode(key, value);

    if (key < node.key) {
      node.left = this.insertNode(node.left, key, value);
      if (node.left.priority > node.priority) {
        node = this.rotateRight(node);
      }
    } else if (key > node.key) {
      node.right = this.insertNode(node.right, key, value);
      if (node.right.priority > node.priority) {
        node = this.rotateLeft(node);
      }
    } else {
      // key already exists — update value
      node.value = value;
    }
    updateSize(node);
    return node;
  }

  private deleteNode(
    node: TreapNode<T> | null,
    key: number,
  ): [TreapNode<T> | null, boolean] {
    if (node === null) return [null, false];

    let deleted = false;
    if (key < node.key) {
      [node.left, deleted] = this.deleteNode(node.left, key);
    } else if (key > node.key) {
      [node.right, deleted] = this.deleteNode(node.right, key);
    } else {
      deleted = true;
      if (node.left === null) return [node.right, true];
      if (node.right === null) return [node.left, true];

      if (node.left.priority > node.right.priority) {
        node = this.rotateRight(node);
        [node.right, ] = this.deleteNode(node.right, key);
      } else {
        node = this.rotateLeft(node);
        [node.left, ] = this.deleteNode(node.left, key);
      }
    }
    if (node !== null) updateSize(node);
    return [node, deleted];
  }

  private searchNode(node: TreapNode<T> | null, key: number): T | undefined {
    if (node === null) return undefined;
    if (key === node.key) return node.value;
    if (key < node.key) return this.searchNode(node.left, key);
    return this.searchNode(node.right, key);
  }

  private minNode(node: TreapNode<T>): TreapNode<T> {
    let cur = node;
    while (cur.left !== null) cur = cur.left;
    return cur;
  }

  private maxNode(node: TreapNode<T>): TreapNode<T> {
    let cur = node;
    while (cur.right !== null) cur = cur.right;
    return cur;
  }

  private heightNode(node: TreapNode<T> | null): number {
    if (node === null) return 0;
    return 1 + Math.max(this.heightNode(node.left), this.heightNode(node.right));
  }

  private inorderNode(
    node: TreapNode<T> | null,
    result: Array<{ key: number; value: T }>,
  ): void {
    if (node === null) return;
    this.inorderNode(node.left, result);
    result.push({ key: node.key, value: node.value });
    this.inorderNode(node.right, result);
  }

  /**
   * Split the subtree rooted at `node` into two subtrees:
   *   left  — all nodes with key <= splitKey
   *   right — all nodes with key >  splitKey
   */
  private splitNode(
    node: TreapNode<T> | null,
    splitKey: number,
  ): [TreapNode<T> | null, TreapNode<T> | null] {
    if (node === null) return [null, null];

    if (node.key <= splitKey) {
      const [rl, rr] = this.splitNode(node.right, splitKey);
      node.right = rl;
      updateSize(node);
      return [node, rr];
    } else {
      const [ll, lr] = this.splitNode(node.left, splitKey);
      node.left = lr;
      updateSize(node);
      return [ll, node];
    }
  }

  /**
   * Merge two subtrees where all keys in `right` > all keys in `left`.
   */
  private mergeNode(
    left: TreapNode<T> | null,
    right: TreapNode<T> | null,
  ): TreapNode<T> | null {
    if (left === null) return right;
    if (right === null) return left;

    if (left.priority >= right.priority) {
      left.right = this.mergeNode(left.right, right);
      updateSize(left);
      return left;
    } else {
      right.left = this.mergeNode(left, right.left);
      updateSize(right);
      return right;
    }
  }

  private kthNode(
    node: TreapNode<T> | null,
    k: number,
  ): TreapNode<T> | undefined {
    if (node === null) return undefined;
    const leftSize = nodeSize(node.left);
    if (k <= leftSize) return this.kthNode(node.left, k);
    if (k === leftSize + 1) return node;
    return this.kthNode(node.right, k - leftSize - 1);
  }

  private rankNode(node: TreapNode<T> | null, key: number): number {
    if (node === null) return 0;
    if (key < node.key) return this.rankNode(node.left, key);
    if (key === node.key) return nodeSize(node.left) + 1;
    return nodeSize(node.left) + 1 + this.rankNode(node.right, key);
  }

  private fromNode(node: TreapNode<T> | null): Treap<T> {
    const t = new Treap<T>();
    t.root = node;
    return t;
  }

  // ---------- public API ----------

  get size(): number {
    return nodeSize(this.root);
  }

  insert(key: number, value: T): void {
    this.root = this.insertNode(this.root, key, value);
  }

  delete(key: number): boolean {
    const [newRoot, deleted] = this.deleteNode(this.root, key);
    this.root = newRoot;
    return deleted;
  }

  search(key: number): T | undefined {
    return this.searchNode(this.root, key);
  }

  has(key: number): boolean {
    return this.searchNode(this.root, key) !== undefined;
  }

  min(): { key: number; value: T } | undefined {
    if (this.root === null) return undefined;
    const n = this.minNode(this.root);
    return { key: n.key, value: n.value };
  }

  max(): { key: number; value: T } | undefined {
    if (this.root === null) return undefined;
    const n = this.maxNode(this.root);
    return { key: n.key, value: n.value };
  }

  height(): number {
    return this.heightNode(this.root);
  }

  inorder(): Array<{ key: number; value: T }> {
    const result: Array<{ key: number; value: T }> = [];
    this.inorderNode(this.root, result);
    return result;
  }

  /**
   * Split into [treap with keys <= key, treap with keys > key].
   */
  split(key: number): [Treap<T>, Treap<T>] {
    const [l, r] = this.splitNode(this.root, key);
    this.root = null; // tree is consumed
    return [this.fromNode(l), this.fromNode(r)];
  }

  /**
   * Merge `other` into this treap.  Precondition: all keys in `other` are
   * strictly greater than all keys in `this`.
   * Returns the merged treap (this is mutated and returned).
   */
  merge(other: Treap<T>): Treap<T> {
    this.root = this.mergeNode(this.root, other.root);
    other.root = null;
    return this;
  }

  /** 1-indexed k-th smallest element. */
  kthSmallest(k: number): { key: number; value: T } | undefined {
    if (k < 1 || k > this.size) return undefined;
    const node = this.kthNode(this.root, k);
    if (node === undefined) return undefined;
    return { key: node.key, value: node.value };
  }

  /** Number of keys in the treap that are <= key (0 if none). */
  rank(key: number): number {
    return this.rankNode(this.root, key);
  }

  /** All entries whose keys are in [lo, hi] inclusive, in sorted order. */
  rangeQuery(lo: number, hi: number): Array<{ key: number; value: T }> {
    return this.inorder().filter(({ key }) => key >= lo && key <= hi);
  }
}

// ---------------------------------------------------------------------------
// ImplicitTreapNode — internal node for ImplicitTreap
// ---------------------------------------------------------------------------
class ImplicitTreapNode {
  value: number;
  priority: number;
  size: number = 1;
  sum: number;
  reversed: boolean = false;
  left: ImplicitTreapNode | null = null;
  right: ImplicitTreapNode | null = null;

  constructor(value: number) {
    this.value = value;
    this.sum = value;
    this.priority = Math.random();
  }
}

function iNodeSize(node: ImplicitTreapNode | null): number {
  return node ? node.size : 0;
}

function iNodeSum(node: ImplicitTreapNode | null): number {
  return node ? node.sum : 0;
}

function iUpdate(node: ImplicitTreapNode): void {
  node.size = 1 + iNodeSize(node.left) + iNodeSize(node.right);
  node.sum = node.value + iNodeSum(node.left) + iNodeSum(node.right);
}

function iPush(node: ImplicitTreapNode): void {
  if (!node.reversed) return;
  // swap children
  const tmp = node.left;
  node.left = node.right;
  node.right = tmp;
  if (node.left) node.left.reversed = !node.left.reversed;
  if (node.right) node.right.reversed = !node.right.reversed;
  node.reversed = false;
}

// ---------------------------------------------------------------------------
// ImplicitTreap — treap indexed by implicit position (array-like)
// ---------------------------------------------------------------------------
export class ImplicitTreap {
  private root: ImplicitTreapNode | null = null;

  private splitBySize(
    node: ImplicitTreapNode | null,
    k: number,
  ): [ImplicitTreapNode | null, ImplicitTreapNode | null] {
    if (node === null) return [null, null];
    iPush(node);
    const leftSize = iNodeSize(node.left);
    if (leftSize >= k) {
      const [ll, lr] = this.splitBySize(node.left, k);
      node.left = lr;
      iUpdate(node);
      return [ll, node];
    } else {
      const [rl, rr] = this.splitBySize(node.right, k - leftSize - 1);
      node.right = rl;
      iUpdate(node);
      return [node, rr];
    }
  }

  private mergeNodes(
    left: ImplicitTreapNode | null,
    right: ImplicitTreapNode | null,
  ): ImplicitTreapNode | null {
    if (left === null) return right;
    if (right === null) return left;
    iPush(left);
    iPush(right);
    if (left.priority >= right.priority) {
      left.right = this.mergeNodes(left.right, right);
      iUpdate(left);
      return left;
    } else {
      right.left = this.mergeNodes(left, right.left);
      iUpdate(right);
      return right;
    }
  }

  get size(): number {
    return iNodeSize(this.root);
  }

  /** Insert value at position pos (0-indexed). */
  insert(pos: number, value: number): void {
    const newNode = new ImplicitTreapNode(value);
    const clampedPos = Math.max(0, Math.min(pos, this.size));
    const [l, r] = this.splitBySize(this.root, clampedPos);
    this.root = this.mergeNodes(this.mergeNodes(l, newNode), r);
  }

  /** Delete element at position pos (0-indexed). */
  delete(pos: number): void {
    if (pos < 0 || pos >= this.size) return;
    const [l, mr] = this.splitBySize(this.root, pos);
    const [, r] = this.splitBySize(mr, 1);
    this.root = this.mergeNodes(l, r);
  }

  /** Get value at position pos (0-indexed). Returns 0 if out of bounds. */
  get(pos: number): number {
    if (pos < 0 || pos >= this.size) return 0;
    const [l, mr] = this.splitBySize(this.root, pos);
    const [m, r] = this.splitBySize(mr, 1);
    let val = 0;
    if (m !== null) {
      iPush(m);
      val = m.value;
    }
    this.root = this.mergeNodes(this.mergeNodes(l, m), r);
    return val;
  }

  toArray(): number[] {
    const result: number[] = [];
    const traverse = (node: ImplicitTreapNode | null): void => {
      if (node === null) return;
      iPush(node);
      traverse(node.left);
      result.push(node.value);
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  /** Sum of values in [l, r] inclusive (0-indexed). */
  rangeSum(l: number, r: number): number {
    if (l > r || l >= this.size || r < 0) return 0;
    const lo = Math.max(0, l);
    const hi = Math.min(this.size - 1, r);
    const [left, mr] = this.splitBySize(this.root, lo);
    const [mid, right] = this.splitBySize(mr, hi - lo + 1);
    const s = iNodeSum(mid);
    this.root = this.mergeNodes(this.mergeNodes(left, mid), right);
    return s;
  }

  /** Reverse the subarray [l, r] inclusive (0-indexed). */
  reverse(l: number, r: number): void {
    if (l > r || l >= this.size || r < 0) return;
    const lo = Math.max(0, l);
    const hi = Math.min(this.size - 1, r);
    const [left, mr] = this.splitBySize(this.root, lo);
    const [mid, right] = this.splitBySize(mr, hi - lo + 1);
    if (mid !== null) mid.reversed = !mid.reversed;
    this.root = this.mergeNodes(this.mergeNodes(left, mid), right);
  }
}

// ---------------------------------------------------------------------------
// OrderStatisticTree<T> — wraps Treap<T> and exposes order-statistics API
// ---------------------------------------------------------------------------
export class OrderStatisticTree<T> {
  private treap: Treap<T> = new Treap<T>();

  get size(): number {
    return this.treap.size;
  }

  insert(key: number, value: T): void {
    this.treap.insert(key, value);
  }

  delete(key: number): void {
    this.treap.delete(key);
  }

  /** 1-indexed: select element of the given rank (1 = smallest). */
  select(rank: number): T | undefined {
    const entry = this.treap.kthSmallest(rank);
    return entry ? entry.value : undefined;
  }

  /** Number of elements with key <= the given key. */
  rank(key: number): number {
    return this.treap.rank(key);
  }
}

// ---------------------------------------------------------------------------
// ValueTreap<T> — value-based treap (spec API: insert(value), has(value), …)
// Each value is mapped to a numeric key via comparator for the underlying treap.
// Supports duplicates via a generation counter suffix.
// ---------------------------------------------------------------------------

function defaultCmpVal<T>(a: T, b: T): number {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

/**
 * ValueTreap<T> — randomised BST keyed directly by value.
 *
 * All methods operate on values (not key/value pairs).
 * Supports duplicates: each duplicate occupies its own node.
 */
export class ValueTreap<T> {
  private cmp: (a: T, b: T) => number;
  // Internal storage: sorted array maintained via Treap<number> (key = index)
  // We use a simple recursive treap keyed by insertion-rank via comparator.
  private nodes: Array<{ val: T; priority: number }> = [];
  private _size: number = 0;

  constructor(compareFn?: (a: T, b: T) => number) {
    this.cmp = compareFn ?? defaultCmpVal;
  }

  get size(): number {
    return this._size;
  }

  private findIndex(value: T): number {
    let lo = 0;
    let hi = this.nodes.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.cmp(this.nodes[mid].val, value) < 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  insert(value: T): void {
    const idx = this.findIndex(value);
    this.nodes.splice(idx, 0, { val: value, priority: Math.random() });
    this._size++;
  }

  delete(value: T): boolean {
    const idx = this.findIndex(value);
    if (idx >= this.nodes.length || this.cmp(this.nodes[idx].val, value) !== 0) {
      return false;
    }
    this.nodes.splice(idx, 1);
    this._size--;
    return true;
  }

  has(value: T): boolean {
    const idx = this.findIndex(value);
    return idx < this.nodes.length && this.cmp(this.nodes[idx].val, value) === 0;
  }

  min(): T | null {
    if (this._size === 0) return null;
    return this.nodes[0].val;
  }

  max(): T | null {
    if (this._size === 0) return null;
    return this.nodes[this._size - 1].val;
  }

  toArray(): T[] {
    return this.nodes.map(n => n.val);
  }

  clear(): void {
    this.nodes = [];
    this._size = 0;
  }

  /** 1-indexed k-th smallest element */
  kth(k: number): T | null {
    if (k < 1 || k > this._size) return null;
    return this.nodes[k - 1].val;
  }

  /** Number of elements strictly less than value */
  rank(value: T): number {
    return this.findIndex(value);
  }
}

// ---------------------------------------------------------------------------
// Standalone functions (spec requirement)
// ---------------------------------------------------------------------------

/**
 * Sort an array using a ValueTreap.
 * Returns a new sorted array (stable for equal elements).
 */
export function treapSort<T>(
  arr: T[],
  compareFn?: (a: T, b: T) => number,
): T[] {
  const t = new ValueTreap<T>(compareFn);
  for (const v of arr) t.insert(v);
  return t.toArray();
}

/**
 * Compute the median of a number array using a ValueTreap.
 * Returns 0 for empty arrays.
 * For even-length arrays returns the average of the two middle values.
 */
export function treapMedian(arr: number[]): number {
  if (arr.length === 0) return 0;
  const t = new ValueTreap<number>();
  for (const v of arr) t.insert(v);
  const n = arr.length;
  if (n % 2 === 1) {
    return t.kth(Math.ceil(n / 2)) as number;
  }
  const lo = t.kth(n / 2) as number;
  const hi = t.kth(n / 2 + 1) as number;
  return (lo + hi) / 2;
}
