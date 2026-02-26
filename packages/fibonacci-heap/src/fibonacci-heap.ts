// Copyright (c) 2026 Nexara DMCC. All rights reserved.

interface FibNode<T> {
  key: number;
  value: T;
  degree: number;
  marked: boolean;
  parent: FibNode<T> | null;
  child: FibNode<T> | null;
  left: FibNode<T>;
  right: FibNode<T>;
}

export class FibonacciHeap<T = number> {
  private min: FibNode<T> | null = null;
  private _size = 0;

  get size(): number { return this._size; }
  get isEmpty(): boolean { return this.min === null; }

  insert(key: number, value: T): FibNode<T> {
    const node: FibNode<T> = {
      key, value, degree: 0, marked: false,
      parent: null, child: null,
      left: null as any, right: null as any,
    };
    node.left = node;
    node.right = node;
    this._addToRootList(node);
    if (this.min === null || key < this.min.key) this.min = node;
    this._size++;
    return node;
  }

  findMin(): { key: number; value: T } | null {
    if (!this.min) return null;
    return { key: this.min.key, value: this.min.value };
  }

  extractMin(): { key: number; value: T } | null {
    const z = this.min;
    if (!z) return null;
    if (z.child) {
      const children: FibNode<T>[] = [];
      let c = z.child;
      do { children.push(c); c = c.right; } while (c !== z.child);
      for (const ch of children) { this._addToRootList(ch); ch.parent = null; }
    }
    this._removeFromRootList(z);
    if (z === z.right) {
      this.min = null;
    } else {
      this.min = z.right;
      this._consolidate();
    }
    this._size--;
    return { key: z.key, value: z.value };
  }

  merge(other: FibonacciHeap<T>): void {
    if (!other.min) return;
    if (!this.min) { this.min = other.min; this._size = other._size; return; }
    // Concatenate root lists
    const thisLast = this.min.left;
    const otherLast = other.min.left;
    thisLast.right = other.min;
    other.min.left = thisLast;
    otherLast.right = this.min;
    this.min.left = otherLast;
    if (other.min.key < this.min.key) this.min = other.min;
    this._size += other._size;
  }

  toSortedArray(): { key: number; value: T }[] {
    const result: { key: number; value: T }[] = [];
    const copy = this._clone();
    let item: { key: number; value: T } | null;
    while ((item = copy.extractMin()) !== null) result.push(item);
    return result;
  }

  private _clone(): FibonacciHeap<T> {
    const h = new FibonacciHeap<T>();
    const arr: { key: number; value: T }[] = [];
    const collect = (node: FibNode<T> | null) => {
      if (!node) return;
      let curr = node;
      do {
        arr.push({ key: curr.key, value: curr.value });
        collect(curr.child);
        curr = curr.right;
      } while (curr !== node);
    };
    collect(this.min);
    for (const { key, value } of arr) h.insert(key, value);
    return h;
  }

  clear(): void { this.min = null; this._size = 0; }

  private _addToRootList(node: FibNode<T>): void {
    if (!this.min) { this.min = node; node.left = node; node.right = node; return; }
    node.right = this.min;
    node.left = this.min.left;
    this.min.left.right = node;
    this.min.left = node;
  }

  private _removeFromRootList(node: FibNode<T>): void {
    node.left.right = node.right;
    node.right.left = node.left;
  }

  private _consolidate(): void {
    const maxDeg = Math.ceil(Math.log2(this._size + 1)) + 2;
    const A: (FibNode<T> | null)[] = new Array(maxDeg + 1).fill(null);
    const roots: FibNode<T>[] = [];
    if (!this.min) return;
    let curr = this.min;
    do { roots.push(curr); curr = curr.right; } while (curr !== this.min);
    for (let r of roots) {
      let x = r;
      let d = x.degree;
      while (A[d]) {
        let y = A[d]!;
        if (x.key > y.key) [x, y] = [y, x];
        this._link(y, x);
        A[d] = null;
        d++;
      }
      A[d] = x;
    }
    this.min = null;
    for (const node of A) {
      if (!node) continue;
      if (!this.min) { this.min = node; node.left = node; node.right = node; }
      else { this._addToRootList(node); if (node.key < this.min.key) this.min = node; }
    }
  }

  private _link(y: FibNode<T>, x: FibNode<T>): void {
    this._removeFromRootList(y);
    y.parent = x;
    if (!x.child) { x.child = y; y.left = y; y.right = y; }
    else {
      y.right = x.child;
      y.left = x.child.left;
      x.child.left.right = y;
      x.child.left = y;
    }
    x.degree++;
    y.marked = false;
  }
}

export function createFibonacciHeap<T = number>(): FibonacciHeap<T> {
  return new FibonacciHeap<T>();
}

export function heapSort(arr: number[]): number[] {
  const h = new FibonacciHeap<number>();
  for (const n of arr) h.insert(n, n);
  const result: number[] = [];
  let m: { key: number; value: number } | null;
  while ((m = h.extractMin()) !== null) result.push(m.key);
  return result;
}
