// Copyright (c) 2026 Nexara DMCC. All rights reserved.

interface AVLNode<T> { key: T; height: number; left: AVLNode<T> | null; right: AVLNode<T> | null; }

function height<T>(n: AVLNode<T> | null): number { return n ? n.height : 0; }
function bf<T>(n: AVLNode<T>): number { return height(n.left) - height(n.right); }
function updateHeight<T>(n: AVLNode<T>): void { n.height = 1 + Math.max(height(n.left), height(n.right)); }

function rotateRight<T>(y: AVLNode<T>): AVLNode<T> {
  const x = y.left!;
  y.left = x.right; x.right = y;
  updateHeight(y); updateHeight(x);
  return x;
}

function rotateLeft<T>(x: AVLNode<T>): AVLNode<T> {
  const y = x.right!;
  x.right = y.left; y.left = x;
  updateHeight(x); updateHeight(y);
  return y;
}

function balance<T>(n: AVLNode<T>): AVLNode<T> {
  updateHeight(n);
  const b = bf(n);
  if (b > 1) {
    if (n.left && bf(n.left) < 0) n.left = rotateLeft(n.left);
    return rotateRight(n);
  }
  if (b < -1) {
    if (n.right && bf(n.right) > 0) n.right = rotateRight(n.right);
    return rotateLeft(n);
  }
  return n;
}

function insertNode<T>(node: AVLNode<T> | null, key: T, cmp: (a: T, b: T) => number): AVLNode<T> {
  if (!node) return { key, height: 1, left: null, right: null };
  const c = cmp(key, node.key);
  if (c < 0) node.left = insertNode(node.left, key, cmp);
  else if (c > 0) node.right = insertNode(node.right, key, cmp);
  else return node; // duplicate
  return balance(node);
}

function searchNode<T>(node: AVLNode<T> | null, key: T, cmp: (a: T, b: T) => number): boolean {
  if (!node) return false;
  const c = cmp(key, node.key);
  if (c === 0) return true;
  return c < 0 ? searchNode(node.left, key, cmp) : searchNode(node.right, key, cmp);
}

function minNode<T>(n: AVLNode<T>): AVLNode<T> { return n.left ? minNode(n.left) : n; }

function deleteNode<T>(node: AVLNode<T> | null, key: T, cmp: (a: T, b: T) => number): AVLNode<T> | null {
  if (!node) return null;
  const c = cmp(key, node.key);
  if (c < 0) node.left = deleteNode(node.left, key, cmp);
  else if (c > 0) node.right = deleteNode(node.right, key, cmp);
  else {
    if (!node.left) return node.right;
    if (!node.right) return node.left;
    const successor = minNode(node.right);
    node.key = successor.key;
    node.right = deleteNode(node.right, successor.key, cmp);
  }
  return balance(node);
}

function inOrder<T>(n: AVLNode<T> | null, result: T[]): void {
  if (!n) return;
  inOrder(n.left, result); result.push(n.key); inOrder(n.right, result);
}

function countNodes<T>(n: AVLNode<T> | null): number {
  if (!n) return 0;
  return 1 + countNodes(n.left) + countNodes(n.right);
}

export class AVLTree<T = number> {
  private root: AVLNode<T> | null = null;
  private cmp: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.cmp = comparator ?? ((a: T, b: T) => (a < b ? -1 : a > b ? 1 : 0));
  }

  insert(key: T): void { this.root = insertNode(this.root, key, this.cmp); }
  search(key: T): boolean { return searchNode(this.root, key, this.cmp); }
  delete(key: T): void { this.root = deleteNode(this.root, key, this.cmp); }
  inOrder(): T[] { const r: T[] = []; inOrder(this.root, r); return r; }
  get size(): number { return countNodes(this.root); }
  get height(): number { return height(this.root); }
  isEmpty(): boolean { return this.root === null; }
  min(): T | undefined { return this.root ? minNode(this.root).key : undefined; }
}

export function createAVLTree<T>(cmp?: (a: T, b: T) => number): AVLTree<T> { return new AVLTree<T>(cmp); }

export function buildAVLTree(values: number[]): AVLTree<number> {
  const t = new AVLTree<number>();
  for (const v of values) t.insert(v);
  return t;
}
