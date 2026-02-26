// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

interface SplayNode<K, V> {
  key: K;
  value: V;
  left: SplayNode<K, V> | null;
  right: SplayNode<K, V> | null;
}

function makeNode<K, V>(key: K, value: V): SplayNode<K, V> {
  return { key, value, left: null, right: null };
}

export class SplayTree<K, V> {
  private root: SplayNode<K, V> | null = null;
  private _size = 0;
  private cmp: (a: K, b: K) => number;

  constructor(comparator?: (a: K, b: K) => number) {
    if (comparator) {
      this.cmp = comparator;
    } else {
      this.cmp = (a: K, b: K): number => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      };
    }
  }

  get size(): number { return this._size; }

  private rotateRight(x: SplayNode<K, V>): SplayNode<K, V> {
    const y = x.left!;
    x.left = y.right;
    y.right = x;
    return y;
  }

  private rotateLeft(x: SplayNode<K, V>): SplayNode<K, V> {
    const y = x.right!;
    x.right = y.left;
    y.left = x;
    return y;
  }

  private splay(root: SplayNode<K, V> | null, key: K): SplayNode<K, V> | null {
    if (root === null) return null;
    const header = makeNode<K, V>(key, undefined as unknown as V);
    let leftMax: SplayNode<K, V> = header;
    let rightMin: SplayNode<K, V> = header;
    let t: SplayNode<K, V> = root;
    for (;;) {
      const c = this.cmp(key, t.key);
      if (c < 0) {
        if (t.left === null) break;
        if (this.cmp(key, t.left.key) < 0) {
          t = this.rotateRight(t);
          if (t.left === null) break;
        }
        rightMin.left = t;
        rightMin = t;
        t = t.left!;
        rightMin.left = null;
      } else if (c > 0) {
        if (t.right === null) break;
        if (this.cmp(key, t.right.key) > 0) {
          t = this.rotateLeft(t);
          if (t.right === null) break;
        }
        leftMax.right = t;
        leftMax = t;
        t = t.right!;
        leftMax.right = null;
      } else {
        break;
      }
    }
    leftMax.right = t.left;
    rightMin.left = t.right;
    t.left = header.right;
    t.right = header.left;
    return t;
  }

  insert(key: K, value: V): void {
    if (this.root === null) {
      this.root = makeNode(key, value);
      this._size++;
      return;
    }
    this.root = this.splay(this.root, key)!;
    const c = this.cmp(key, this.root.key);
    if (c === 0) { this.root.value = value; return; }
    const node = makeNode(key, value);
    if (c < 0) {
      node.left = this.root.left;
      node.right = this.root;
      this.root.left = null;
    } else {
      node.right = this.root.right;
      node.left = this.root;
      this.root.right = null;
    }
    this.root = node;
    this._size++;
  }

  find(key: K): V | undefined {
    if (this.root === null) return undefined;
    this.root = this.splay(this.root, key)!;
    if (this.cmp(key, this.root.key) !== 0) return undefined;
    return this.root.value;
  }

  has(key: K): boolean { return this.find(key) !== undefined; }

  delete(key: K): boolean {
    if (this.root === null) return false;
    this.root = this.splay(this.root, key)!;
    if (this.cmp(key, this.root.key) !== 0) return false;
    const left = this.root.left;
    const right = this.root.right;
    if (left === null) {
      this.root = right;
    } else {
      const newLeft = this.splay(left, key)!;
      newLeft.right = right;
      this.root = newLeft;
    }
    this._size--;
    return true;
  }

  min(): { key: K; value: V } | null {
    if (this.root === null) return null;
    let cur = this.root;
    while (cur.left !== null) cur = cur.left;
    return { key: cur.key, value: cur.value };
  }

  max(): { key: K; value: V } | null {
    if (this.root === null) return null;
    let cur = this.root;
    while (cur.right !== null) cur = cur.right;
    return { key: cur.key, value: cur.value };
  }

  inOrder(): Array<{ key: K; value: V }> {
    const result: Array<{ key: K; value: V }> = [];
    const traverse = (node: SplayNode<K, V> | null): void => {
      if (node === null) return;
      traverse(node.left);
      result.push({ key: node.key, value: node.value });
      traverse(node.right);
    };
    traverse(this.root);
    return result;
  }

  rangeQuery(lo: K, hi: K): Array<{ key: K; value: V }> {
    return this.inOrder().filter(
      (entry) => this.cmp(entry.key, lo) >= 0 && this.cmp(entry.key, hi) <= 0
    );
  }

  split(key: K): [SplayTree<K, V>, SplayTree<K, V>] {
    const tLeft = new SplayTree<K, V>(this.cmp);
    const tRight = new SplayTree<K, V>(this.cmp);
    if (this.root === null) return [tLeft, tRight];
    this.root = this.splay(this.root, key)!;
    const c = this.cmp(key, this.root.key);
    const priv = (t: SplayTree<K,V>) => t as unknown as {root:SplayNode<K,V>|null;_size:number};
    if (c >= 0) {
      priv(tLeft).root = this.root;
      priv(tRight).root = this.root.right;
      this.root.right = null;
    } else {
      priv(tRight).root = this.root;
      priv(tLeft).root = this.root.left;
      this.root.left = null;
    }
    priv(tLeft)._size = countNodes(priv(tLeft).root);
    priv(tRight)._size = countNodes(priv(tRight).root);
    this.root = null; this._size = 0;
    return [tLeft, tRight];
  }

  join(other: SplayTree<K, V>): SplayTree<K, V> {
    const result = new SplayTree<K, V>(this.cmp);
    const priv = (t: SplayTree<K,V>) => t as unknown as {root:SplayNode<K,V>|null;_size:number};
    if (this.root === null) {
      priv(result).root = priv(other).root;
      priv(result)._size = other.size;
      priv(other).root = null; priv(other)._size = 0;
      return result;
    }
    if (priv(other).root === null) {
      priv(result).root = this.root;
      priv(result)._size = this._size;
      this.root = null; this._size = 0;
      return result;
    }
    const maxLeft = this.max()!;
    this.root = this.splay(this.root, maxLeft.key)!;
    this.root.right = priv(other).root;
    priv(result).root = this.root;
    priv(result)._size = this._size + other.size;
    this.root = null; this._size = 0;
    priv(other).root = null; priv(other)._size = 0;
    return result;
  }

  clear(): void { this.root = null; this._size = 0; }
}

function countNodes<K, V>(node: SplayNode<K, V> | null): number {
  if (node === null) return 0;
  return 1 + countNodes(node.left) + countNodes(node.right);
}
