// Copyright (c) 2026 Nexara DMCC. All rights reserved.

const ALPHA = 0.7;

interface SGNode<T> {
  value: T;
  left: SGNode<T> | null;
  right: SGNode<T> | null;
  size: number;
}

function makeNode<T>(value: T): SGNode<T> {
  return { value, left: null, right: null, size: 1 };
}

function nodeSize<T>(n: SGNode<T> | null): number {
  return n ? n.size : 0;
}

function updateSize<T>(n: SGNode<T>): void {
  n.size = 1 + nodeSize(n.left) + nodeSize(n.right);
}

function isBalanced<T>(n: SGNode<T>): boolean {
  const s = nodeSize(n);
  return nodeSize(n.left) <= ALPHA * s && nodeSize(n.right) <= ALPHA * s;
}

function flatten<T>(n: SGNode<T> | null, arr: SGNode<T>[]): void {
  if (!n) return;
  flatten(n.left, arr);
  arr.push(n);
  flatten(n.right, arr);
}

function buildBalanced<T>(arr: SGNode<T>[], lo: number, hi: number): SGNode<T> | null {
  if (lo > hi) return null;
  const mid = Math.floor((lo + hi) / 2);
  const node = arr[mid];
  node.left = buildBalanced(arr, lo, mid - 1);
  node.right = buildBalanced(arr, mid + 1, hi);
  updateSize(node);
  return node;
}

function rebuild<T>(n: SGNode<T>): SGNode<T> {
  const arr: SGNode<T>[] = [];
  flatten(n, arr);
  return buildBalanced(arr, 0, arr.length - 1)!;
}

export class ScapegoatTree<T> {
  private root: SGNode<T> | null = null;
  private _size = 0;
  private maxSize = 0;
  private comparator: (a: T, b: T) => number;

  constructor(comparator: (a: T, b: T) => number = (a: any, b: any) => a < b ? -1 : a > b ? 1 : 0) {
    this.comparator = comparator;
  }

  get size(): number { return this._size; }
  get isEmpty(): boolean { return this._size === 0; }

  insert(value: T): void {
    const path: SGNode<T>[] = [];
    this.root = this._insert(this.root, value, path);
    this._size++;
    this.maxSize = Math.max(this.maxSize, this._size);
    // Find scapegoat
    if (path.length > Math.log(this._size) / Math.log(1 / ALPHA) + 1) {
      for (let i = path.length - 1; i >= 0; i--) {
        if (!isBalanced(path[i])) {
          const rebuilt = rebuild(path[i]);
          if (i === 0) { this.root = rebuilt; }
          else {
            const parent = path[i - 1];
            if (parent.left === path[i]) parent.left = rebuilt;
            else parent.right = rebuilt;
          }
          break;
        }
      }
    }
  }

  private _insert(node: SGNode<T> | null, value: T, path: SGNode<T>[]): SGNode<T> {
    if (!node) return makeNode(value);
    path.push(node);
    const cmp = this.comparator(value, node.value);
    if (cmp < 0) node.left = this._insert(node.left, value, path);
    else if (cmp > 0) node.right = this._insert(node.right, value, path);
    updateSize(node);
    return node;
  }

  search(value: T): boolean {
    let node = this.root;
    while (node) {
      const cmp = this.comparator(value, node.value);
      if (cmp === 0) return true;
      node = cmp < 0 ? node.left : node.right;
    }
    return false;
  }

  delete(value: T): boolean {
    const [newRoot, deleted] = this._delete(this.root, value);
    this.root = newRoot;
    if (deleted) {
      this._size--;
      if (this._size < ALPHA * this.maxSize) {
        this.root = this.root ? rebuild(this.root) : null;
        this.maxSize = this._size;
      }
    }
    return deleted;
  }

  private _delete(node: SGNode<T> | null, value: T): [SGNode<T> | null, boolean] {
    if (!node) return [null, false];
    const cmp = this.comparator(value, node.value);
    if (cmp < 0) {
      const [left, del] = this._delete(node.left, value);
      node.left = left; updateSize(node); return [node, del];
    } else if (cmp > 0) {
      const [right, del] = this._delete(node.right, value);
      node.right = right; updateSize(node); return [node, del];
    } else {
      if (!node.left) return [node.right, true];
      if (!node.right) return [node.left, true];
      // Find in-order successor
      let succ = node.right;
      while (succ.left) succ = succ.left;
      node.value = succ.value;
      const [right, del] = this._delete(node.right, succ.value);
      node.right = right; updateSize(node); return [node, del];
    }
  }

  min(): T | null {
    if (!this.root) return null;
    let n = this.root;
    while (n.left) n = n.left;
    return n.value;
  }

  max(): T | null {
    if (!this.root) return null;
    let n = this.root;
    while (n.right) n = n.right;
    return n.value;
  }

  inOrder(): T[] {
    const result: T[] = [];
    const visit = (n: SGNode<T> | null) => {
      if (!n) return;
      visit(n.left);
      result.push(n.value);
      visit(n.right);
    };
    visit(this.root);
    return result;
  }

  clear(): void { this.root = null; this._size = 0; this.maxSize = 0; }
}

export function createScapegoatTree<T>(comparator?: (a: T, b: T) => number): ScapegoatTree<T> {
  return new ScapegoatTree<T>(comparator);
}
