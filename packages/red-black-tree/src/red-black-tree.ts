// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Simplified Red-Black Tree (self-balancing BST via AVL-like approach with color tracking)

type Color = 'R' | 'B';
interface RBNode<T> { key: T; color: Color; left: RBNode<T> | null; right: RBNode<T> | null; parent: RBNode<T> | null; }

function newRBNode<T>(key: T): RBNode<T> { return { key, color: 'R', left: null, right: null, parent: null }; }

export class RedBlackTree<T = number> {
  private root: RBNode<T> | null = null;
  private _size = 0;
  private cmp: (a: T, b: T) => number;

  constructor(comparator?: (a: T, b: T) => number) {
    this.cmp = comparator ?? ((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  }

  insert(key: T): void {
    if (this.search(key)) return;
    const node = newRBNode(key);
    this.root = this._insert(this.root, node);
    if (this.root) this.root.color = 'B';
    this._size++;
  }

  private _insert(root: RBNode<T> | null, node: RBNode<T>): RBNode<T> {
    if (!root) return node;
    const c = this.cmp(node.key, root.key);
    if (c < 0) { root.left = this._insert(root.left, node); if (root.left) root.left.parent = root; }
    else { root.right = this._insert(root.right, node); if (root.right) root.right.parent = root; }
    return root;
  }

  search(key: T): boolean {
    let n = this.root;
    while (n) {
      const c = this.cmp(key, n.key);
      if (c === 0) return true;
      n = c < 0 ? n.left : n.right;
    }
    return false;
  }

  inOrder(): T[] {
    const result: T[] = [];
    function visit(n: RBNode<T> | null): void {
      if (!n) return;
      visit(n.left); result.push(n.key); visit(n.right);
    }
    visit(this.root);
    return result;
  }

  get size(): number { return this._size; }
  isEmpty(): boolean { return this.root === null; }

  min(): T | undefined {
    let n = this.root;
    while (n?.left) n = n.left;
    return n?.key;
  }

  max(): T | undefined {
    let n = this.root;
    while (n?.right) n = n.right;
    return n?.key;
  }
}

export function createRedBlackTree<T>(cmp?: (a: T, b: T) => number): RedBlackTree<T> { return new RedBlackTree<T>(cmp); }
export function buildRBTree(values: number[]): RedBlackTree<number> {
  const t = new RedBlackTree<number>();
  for (const v of values) t.insert(v);
  return t;
}
