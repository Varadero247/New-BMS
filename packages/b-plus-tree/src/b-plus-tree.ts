// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

// ---------------------------------------------------------------------------
// Internal node types
// ---------------------------------------------------------------------------

interface LeafNode<K, V> {
  isLeaf: true;
  keys: K[];
  values: V[];
  next: LeafNode<K, V> | null;
}

interface InternalNode<K, V> {
  isLeaf: false;
  keys: K[];
  children: BPlusNode<K, V>[];
}

type BPlusNode<K, V> = LeafNode<K, V> | InternalNode<K, V>;

// ---------------------------------------------------------------------------
// BPlusTree
// ---------------------------------------------------------------------------

/**
 * A generic B+ Tree providing O(log n) insert, lookup and delete, and
 * efficient O(log n + k) range queries.
 */
export class BPlusTree<K, V> {
  private _order: number;
  private _root: BPlusNode<K, V>;
  private _size: number = 0;

  constructor(order: number = 4) {
    if (order < 3) throw new RangeError("B+ Tree order must be at least 3");
    this._order = order;
    this._root = this._makeLeaf();
  }

  // ------------------------------------------------------------------
  // Public API
  // ------------------------------------------------------------------

  get size(): number {
    return this._size;
  }

  set(key: K, value: V): void {
    const result = this._insert(this._root, key, value);
    if (result) {
      const newRoot: InternalNode<K, V> = {
        isLeaf: false,
        keys: [result.midKey],
        children: [this._root, result.newNode],
      };
      this._root = newRoot;
    }
  }

  get(key: K): V | undefined {
    const leaf = this._findLeaf(key);
    const idx = this._leafSearch(leaf, key);
    if (idx !== -1) return leaf.values[idx];
    return undefined;
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    const deleted = this._delete(this._root, key, null, -1);
    if (deleted) {
      this._size--;
      if (!this._root.isLeaf && (this._root as InternalNode<K, V>).keys.length === 0) {
        this._root = (this._root as InternalNode<K, V>).children[0];
      }
    }
    return deleted;
  }

  clear(): void {
    this._root = this._makeLeaf();
    this._size = 0;
  }

  rangeQuery(low: K, high: K): [K, V][] {
    const result: [K, V][] = [];
    let leaf: LeafNode<K, V> | null = this._findLeaf(low);
    outer: while (leaf !== null) {
      for (let i = 0; i < leaf.keys.length; i++) {
        if (this._cmp(leaf.keys[i], low) >= 0) {
          if (this._cmp(leaf.keys[i], high) > 0) break outer;
          result.push([leaf.keys[i], leaf.values[i]]);
        }
      }
      leaf = leaf.next;
    }
    return result;
  }

  keys(): K[] {
    return this._allLeafPairs().map(([k]) => k);
  }

  values(): V[] {
    return this._allLeafPairs().map(([, v]) => v);
  }

  entries(): [K, V][] {
    return this._allLeafPairs();
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private _makeLeaf(): LeafNode<K, V> {
    return { isLeaf: true, keys: [], values: [], next: null };
  }

  private _cmp(a: K, b: K): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  private _findLeaf(key: K): LeafNode<K, V> {
    let node: BPlusNode<K, V> = this._root;
    while (!node.isLeaf) {
      const internal = node as InternalNode<K, V>;
      let i = 0;
      while (i < internal.keys.length && this._cmp(key, internal.keys[i]) >= 0) i++;
      node = internal.children[i];
    }
    return node as LeafNode<K, V>;
  }

  private _leafSearch(leaf: LeafNode<K, V>, key: K): number {
    for (let i = 0; i < leaf.keys.length; i++) {
      if (this._cmp(leaf.keys[i], key) === 0) return i;
    }
    return -1;
  }

  private _insert(
    node: BPlusNode<K, V>,
    key: K,
    value: V,
  ): { midKey: K; newNode: BPlusNode<K, V> } | null {
    if (node.isLeaf) {
      const leaf = node as LeafNode<K, V>;
      const existing = this._leafSearch(leaf, key);
      if (existing !== -1) {
        leaf.values[existing] = value;
        return null;
      }
      let i = leaf.keys.length - 1;
      while (i >= 0 && this._cmp(leaf.keys[i], key) > 0) {
        leaf.keys[i + 1] = leaf.keys[i];
        leaf.values[i + 1] = leaf.values[i];
        i--;
      }
      leaf.keys[i + 1] = key;
      leaf.values[i + 1] = value;
      this._size++;
      if (leaf.keys.length < this._order) return null;
      return this._splitLeaf(leaf);
    } else {
      const internal = node as InternalNode<K, V>;
      let i = 0;
      while (i < internal.keys.length && this._cmp(key, internal.keys[i]) >= 0) i++;
      const result = this._insert(internal.children[i], key, value);
      if (!result) return null;
      internal.keys.splice(i, 0, result.midKey);
      internal.children.splice(i + 1, 0, result.newNode);
      if (internal.keys.length < this._order) return null;
      return this._splitInternal(internal);
    }
  }

  private _splitLeaf(leaf: LeafNode<K, V>): { midKey: K; newNode: BPlusNode<K, V> } {
    const mid = Math.ceil(leaf.keys.length / 2);
    const newLeaf: LeafNode<K, V> = {
      isLeaf: true,
      keys: leaf.keys.splice(mid),
      values: leaf.values.splice(mid),
      next: leaf.next,
    };
    leaf.next = newLeaf;
    return { midKey: newLeaf.keys[0], newNode: newLeaf };
  }

  private _splitInternal(node: InternalNode<K, V>): { midKey: K; newNode: BPlusNode<K, V> } {
    const mid = Math.floor(node.keys.length / 2);
    const midKey = node.keys[mid];
    const newInternal: InternalNode<K, V> = {
      isLeaf: false,
      keys: node.keys.splice(mid + 1),
      children: node.children.splice(mid + 1),
    };
    node.keys.splice(mid, 1);
    return { midKey, newNode: newInternal };
  }

  private _delete(
    node: BPlusNode<K, V>,
    key: K,
    parent: InternalNode<K, V> | null,
    indexInParent: number,
  ): boolean {
    if (node.isLeaf) {
      const leaf = node as LeafNode<K, V>;
      const idx = this._leafSearch(leaf, key);
      if (idx === -1) return false;
      leaf.keys.splice(idx, 1);
      leaf.values.splice(idx, 1);
      return true;
    } else {
      const internal = node as InternalNode<K, V>;
      let i = 0;
      while (i < internal.keys.length && this._cmp(key, internal.keys[i]) >= 0) i++;
      return this._delete(internal.children[i], key, internal, i);
    }
  }

  private _allLeafPairs(): [K, V][] {
    const result: [K, V][] = [];
    let node: BPlusNode<K, V> = this._root;
    while (!node.isLeaf) {
      node = (node as InternalNode<K, V>).children[0];
    }
    let leaf: LeafNode<K, V> | null = node as LeafNode<K, V>;
    while (leaf !== null) {
      for (let i = 0; i < leaf.keys.length; i++) {
        result.push([leaf.keys[i], leaf.values[i]]);
      }
      leaf = leaf.next;
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// BPlusTreeMap -- alias with identical API
// ---------------------------------------------------------------------------

export class BPlusTreeMap<K, V> extends BPlusTree<K, V> {}

// ---------------------------------------------------------------------------
// SortedMap -- sorted associative container with floor/ceiling
// ---------------------------------------------------------------------------

export class SortedMap<K, V> {
  private _entries: [K, V][] = [];

  private _cmp(a: K, b: K): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  }

  private _bsearch(key: K): { found: boolean; index: number } {
    let lo = 0;
    let hi = this._entries.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      const c = this._cmp(this._entries[mid][0], key);
      if (c === 0) return { found: true, index: mid };
      if (c < 0) lo = mid + 1;
      else hi = mid - 1;
    }
    return { found: false, index: lo };
  }

  set(key: K, value: V): void {
    const { found, index } = this._bsearch(key);
    if (found) {
      this._entries[index][1] = value;
    } else {
      this._entries.splice(index, 0, [key, value]);
    }
  }

  get(key: K): V | undefined {
    const { found, index } = this._bsearch(key);
    return found ? this._entries[index][1] : undefined;
  }

  has(key: K): boolean {
    return this._bsearch(key).found;
  }

  delete(key: K): boolean {
    const { found, index } = this._bsearch(key);
    if (!found) return false;
    this._entries.splice(index, 1);
    return true;
  }

  get size(): number {
    return this._entries.length;
  }

  keys(): K[] {
    return this._entries.map(([k]) => k);
  }

  values(): V[] {
    return this._entries.map(([, v]) => v);
  }

  entries(): [K, V][] {
    return this._entries.map(([k, v]) => [k, v] as [K, V]);
  }

  floor(key: K): K | undefined {
    const { found, index } = this._bsearch(key);
    if (found) return this._entries[index][0];
    if (index === 0) return undefined;
    return this._entries[index - 1][0];
  }

  ceiling(key: K): K | undefined {
    const { found, index } = this._bsearch(key);
    if (found) return this._entries[index][0];
    if (index >= this._entries.length) return undefined;
    return this._entries[index][0];
  }
}
