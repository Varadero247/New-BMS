// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export class CartesianTreeNode<T> {
  value: T;
  left: CartesianTreeNode<T> | null = null;
  right: CartesianTreeNode<T> | null = null;
  constructor(value: T) { this.value = value; }
}

function defaultNumCompare<T>(a: T, b: T): number {
  const na = a as unknown as number;
  const nb = b as unknown as number;
  return na < nb ? -1 : na > nb ? 1 : 0;
}
export class CartesianTree<T> {
  private _root: CartesianTreeNode<T> | null = null;
  private _size = 0;
  private _compare: (a: T, b: T) => number;

  private constructor(compare: (a: T, b: T) => number) {
    this._compare = compare;
  }

  static fromArray<T>(
    arr: T[],
    compare: (a: T, b: T) => number = defaultNumCompare,
  ): CartesianTree<T> {
    const tree = new CartesianTree<T>(compare);
    tree._size = arr.length;
    if (arr.length === 0) return tree;
    const stack: CartesianTreeNode<T>[] = [];
    for (const val of arr) {
      const node = new CartesianTreeNode<T>(val);
      let last: CartesianTreeNode<T> | null = null;
      while (stack.length > 0 && compare(stack[stack.length - 1].value, val) > 0) {
        last = stack.pop()!;
      }
      node.left = last;
      if (stack.length > 0) stack[stack.length - 1].right = node;
      stack.push(node);
    }
    tree._root = stack[0];
    return tree;
  }

  get root(): CartesianTreeNode<T> | null { return this._root; }
  get size(): number { return this._size; }

  toArray(): T[] {
    const result: T[] = [];
    const inorder = (node: CartesianTreeNode<T> | null): void => {
      if (!node) return;
      inorder(node.left);
      result.push(node.value);
      inorder(node.right);
    };
    inorder(this._root);
    return result;
  }

  min(): T | undefined { return this._root?.value; }

  max(): T | undefined {
    if (!this._root) return undefined;
    let cur: CartesianTreeNode<T> = this._root;
    while (cur.right) cur = cur.right;
    return cur.value;
  }

  rangeMin(l: number, r: number): T | undefined {
    const arr = this.toArray();
    if (arr.length === 0 || l > r || l < 0 || r >= arr.length) return undefined;
    let minVal = arr[l];
    for (let i = l + 1; i <= r; i++) {
      if (this._compare(arr[i], minVal) < 0) minVal = arr[i];
    }
    return minVal;
  }
}
export class TreapNode<T> {
  value: T;
  priority: number;
  left: TreapNode<T> | null = null;
  right: TreapNode<T> | null = null;
  constructor(value: T, priority: number) {
    this.value = value;
    this.priority = priority;
  }
}
export class Treap<T> {
  private _root: TreapNode<T> | null = null;
  private _size = 0;
  private _compare: (a: T, b: T) => number;

  constructor(
    compare: (a: T, b: T) => number = defaultNumCompare,
  ) {
    this._compare = compare;
  }

  get size(): number { return this._size; }

  private rotateRight(node: TreapNode<T>): TreapNode<T> {
    const left = node.left!;
    node.left = left.right;
    left.right = node;
    return left;
  }

  private rotateLeft(node: TreapNode<T>): TreapNode<T> {
    const right = node.right!;
    node.right = right.left;
    right.left = node;
    return right;
  }

  private _insertNode(
    node: TreapNode<T> | null,
    value: T,
    priority: number,
  ): TreapNode<T> {
    if (!node) return new TreapNode<T>(value, priority);
    const cmp = this._compare(value, node.value);
    if (cmp < 0) {
      node.left = this._insertNode(node.left, value, priority);
      if (node.left.priority > node.priority) node = this.rotateRight(node);
    } else if (cmp > 0) {
      node.right = this._insertNode(node.right, value, priority);
      if (node.right.priority > node.priority) node = this.rotateLeft(node);
    }
    return node;
  }

  insert(value: T, priority: number = Math.random()): void {
    if (this.has(value)) return;
    this._root = this._insertNode(this._root, value, priority);
    this._size++;
  }
  private _deleteNode(
    node: TreapNode<T> | null,
    value: T,
  ): [TreapNode<T> | null, boolean] {
    if (!node) return [null, false];
    const cmp = this._compare(value, node.value);
    let deleted = false;
    if (cmp < 0) {
      [node.left, deleted] = this._deleteNode(node.left, value);
    } else if (cmp > 0) {
      [node.right, deleted] = this._deleteNode(node.right, value);
    } else {
      deleted = true;
      if (!node.left && !node.right) return [null, true];
      if (!node.left) {
        node = this.rotateLeft(node);
        [node.left] = this._deleteNode(node.left, value);
      } else if (!node.right) {
        node = this.rotateRight(node);
        [node.right] = this._deleteNode(node.right, value);
      } else if (node.left.priority > node.right.priority) {
        node = this.rotateRight(node);
        [node.right] = this._deleteNode(node.right, value);
      } else {
        node = this.rotateLeft(node);
        [node.left] = this._deleteNode(node.left, value);
      }
    }
    return [node, deleted];
  }

  delete(value: T): boolean {
    const [newRoot, deleted] = this._deleteNode(this._root, value);
    this._root = newRoot;
    if (deleted) this._size--;
    return deleted;
  }
  has(value: T): boolean {
    let cur = this._root;
    while (cur) {
      const cmp = this._compare(value, cur.value);
      if (cmp === 0) return true;
      cur = cmp < 0 ? cur.left : cur.right;
    }
    return false;
  }

  toSortedArray(): T[] {
    const result: T[] = [];
    const inorder = (node: TreapNode<T> | null): void => {
      if (!node) return;
      inorder(node.left);
      result.push(node.value);
      inorder(node.right);
    };
    inorder(this._root);
    return result;
  }

  private _splitNode(
    node: TreapNode<T> | null,
    splitValue: T,
  ): [TreapNode<T> | null, TreapNode<T> | null] {
    if (!node) return [null, null];
    const cmp = this._compare(node.value, splitValue);
    if (cmp <= 0) {
      const [leftRight, right] = this._splitNode(node.right, splitValue);
      node.right = leftRight;
      return [node, right];
    } else {
      const [left, rightLeft] = this._splitNode(node.left, splitValue);
      node.left = rightLeft;
      return [left, node];
    }
  }

  split(value: T): [Treap<T>, Treap<T>] {
    const [leftRoot, rightRoot] = this._splitNode(this._root, value);
    const countNodes = (n: TreapNode<T> | null): number =>
      n ? 1 + countNodes(n.left) + countNodes(n.right) : 0;
    const leftTreap = new Treap<T>(this._compare);
    const rightTreap = new Treap<T>(this._compare);
    (leftTreap as any)._root = leftRoot;
    (rightTreap as any)._root = rightRoot;
    (leftTreap as any)._size = countNodes(leftRoot);
    (rightTreap as any)._size = countNodes(rightRoot);
    this._root = null;
    this._size = 0;
    return [leftTreap, rightTreap];
  }
}
