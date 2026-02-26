// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

// ---------------------------------------------------------------------------
// B-Tree implementation
// ---------------------------------------------------------------------------

interface BTreeNode<V> {
  keys: number[];
  values: V[];
  children: BTreeNode<V>[];
  isLeaf: boolean;
}

function createNode<V>(isLeaf: boolean): BTreeNode<V> {
  return { keys: [], values: [], children: [], isLeaf };
}

export class BTree<V> {
  private root: BTreeNode<V>;
  private t: number; // minimum degree — each non-root node has at least t-1 keys
  private _size: number = 0;

  constructor(order: number = 3) {
    if (order < 2) throw new Error('BTree order must be >= 2');
    this.t = order;
    this.root = createNode<V>(true);
  }

  get size(): number {
    return this._size;
  }

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  search(key: number): V | undefined {
    return this._search(this.root, key);
  }

  private _search(node: BTreeNode<V>, key: number): V | undefined {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    if (i < node.keys.length && key === node.keys[i]) return node.values[i];
    if (node.isLeaf) return undefined;
    return this._search(node.children[i], key);
  }

  has(key: number): boolean {
    return this.search(key) !== undefined;
  }

  // -------------------------------------------------------------------------
  // Insert
  // -------------------------------------------------------------------------

  insert(key: number, value: V): void {
    // If key already exists, update value
    if (this._update(this.root, key, value)) return;

    const root = this.root;
    if (root.keys.length === 2 * this.t - 1) {
      // Root is full — split it
      const newRoot = createNode<V>(false);
      newRoot.children.push(this.root);
      this._splitChild(newRoot, 0, root);
      this.root = newRoot;
      this._insertNonFull(newRoot, key, value);
    } else {
      this._insertNonFull(root, key, value);
    }
    this._size++;
  }

  private _update(node: BTreeNode<V>, key: number, value: V): boolean {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    if (i < node.keys.length && key === node.keys[i]) {
      node.values[i] = value;
      return true;
    }
    if (node.isLeaf) return false;
    return this._update(node.children[i], key, value);
  }

  private _insertNonFull(node: BTreeNode<V>, key: number, value: V): void {
    let i = node.keys.length - 1;
    if (node.isLeaf) {
      node.keys.push(0);
      node.values.push(value);
      while (i >= 0 && key < node.keys[i]) {
        node.keys[i + 1] = node.keys[i];
        node.values[i + 1] = node.values[i];
        i--;
      }
      node.keys[i + 1] = key;
      node.values[i + 1] = value;
    } else {
      while (i >= 0 && key < node.keys[i]) i--;
      i++;
      if (node.children[i].keys.length === 2 * this.t - 1) {
        this._splitChild(node, i, node.children[i]);
        if (key > node.keys[i]) i++;
      }
      this._insertNonFull(node.children[i], key, value);
    }
  }

  private _splitChild(parent: BTreeNode<V>, idx: number, child: BTreeNode<V>): void {
    const t = this.t;
    const newNode = createNode<V>(child.isLeaf);

    // Move the median key up to parent
    const medianKey = child.keys[t - 1];
    const medianVal = child.values[t - 1];

    // New node gets the right half of child
    newNode.keys = child.keys.splice(t); // t..2t-2
    newNode.values = child.values.splice(t);
    child.keys.splice(t - 1, 1); // remove median from child
    child.values.splice(t - 1, 1);

    if (!child.isLeaf) {
      newNode.children = child.children.splice(t);
    }

    // Insert median into parent
    parent.keys.splice(idx, 0, medianKey);
    parent.values.splice(idx, 0, medianVal);
    parent.children.splice(idx + 1, 0, newNode);
  }

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------

  delete(key: number): boolean {
    const found = this.has(key);
    if (!found) return false;
    this._delete(this.root, key);
    // Shrink root if empty
    if (this.root.keys.length === 0 && !this.root.isLeaf) {
      this.root = this.root.children[0];
    }
    this._size--;
    return true;
  }

  private _delete(node: BTreeNode<V>, key: number): void {
    const t = this.t;
    const i = this._findKeyIndex(node, key);

    if (i < node.keys.length && node.keys[i] === key) {
      // Key is in this node
      if (node.isLeaf) {
        node.keys.splice(i, 1);
        node.values.splice(i, 1);
      } else {
        this._deleteFromInternal(node, i);
      }
    } else {
      // Key not in this node
      if (node.isLeaf) return; // should not happen if has() returned true
      const child = node.children[i];
      if (child.keys.length < t) {
        this._fill(node, i);
        // After fill, re-find position
        const newI = this._findKeyIndex(node, key);
        if (newI < node.keys.length && node.keys[newI] === key) {
          this._deleteFromInternal(node, newI);
        } else {
          const ci = this._findKeyIndex(node, key);
          this._delete(node.children[ci < node.keys.length && key > node.keys[ci] ? ci + 1 : ci], key);
        }
      } else {
        this._delete(child, key);
      }
    }
  }

  private _deleteFromInternal(node: BTreeNode<V>, i: number): void {
    const t = this.t;
    const key = node.keys[i];
    const leftChild = node.children[i];
    const rightChild = node.children[i + 1];

    if (leftChild.keys.length >= t) {
      const pred = this._getPredecessor(leftChild);
      node.keys[i] = pred.key;
      node.values[i] = pred.value;
      this._delete(leftChild, pred.key);
    } else if (rightChild.keys.length >= t) {
      const succ = this._getSuccessor(rightChild);
      node.keys[i] = succ.key;
      node.values[i] = succ.value;
      this._delete(rightChild, succ.key);
    } else {
      // Merge left, key, right
      this._merge(node, i);
      this._delete(leftChild, key);
    }
  }

  private _getPredecessor(node: BTreeNode<V>): { key: number; value: V } {
    let cur = node;
    while (!cur.isLeaf) cur = cur.children[cur.children.length - 1];
    return { key: cur.keys[cur.keys.length - 1], value: cur.values[cur.values.length - 1] };
  }

  private _getSuccessor(node: BTreeNode<V>): { key: number; value: V } {
    let cur = node;
    while (!cur.isLeaf) cur = cur.children[0];
    return { key: cur.keys[0], value: cur.values[0] };
  }

  private _fill(parent: BTreeNode<V>, i: number): void {
    const t = this.t;
    if (i > 0 && parent.children[i - 1].keys.length >= t) {
      this._borrowFromPrev(parent, i);
    } else if (i < parent.children.length - 1 && parent.children[i + 1].keys.length >= t) {
      this._borrowFromNext(parent, i);
    } else {
      if (i < parent.children.length - 1) {
        this._merge(parent, i);
      } else {
        this._merge(parent, i - 1);
      }
    }
  }

  private _borrowFromPrev(parent: BTreeNode<V>, i: number): void {
    const child = parent.children[i];
    const sibling = parent.children[i - 1];

    child.keys.unshift(parent.keys[i - 1]);
    child.values.unshift(parent.values[i - 1]);

    parent.keys[i - 1] = sibling.keys.pop()!;
    parent.values[i - 1] = sibling.values.pop()!;

    if (!child.isLeaf) {
      child.children.unshift(sibling.children.pop()!);
    }
  }

  private _borrowFromNext(parent: BTreeNode<V>, i: number): void {
    const child = parent.children[i];
    const sibling = parent.children[i + 1];

    child.keys.push(parent.keys[i]);
    child.values.push(parent.values[i]);

    parent.keys[i] = sibling.keys.shift()!;
    parent.values[i] = sibling.values.shift()!;

    if (!child.isLeaf) {
      child.children.push(sibling.children.shift()!);
    }
  }

  private _merge(parent: BTreeNode<V>, i: number): void {
    const left = parent.children[i];
    const right = parent.children[i + 1];

    left.keys.push(parent.keys[i]);
    left.values.push(parent.values[i]);
    left.keys.push(...right.keys);
    left.values.push(...right.values);
    if (!left.isLeaf) {
      left.children.push(...right.children);
    }

    parent.keys.splice(i, 1);
    parent.values.splice(i, 1);
    parent.children.splice(i + 1, 1);
  }

  private _findKeyIndex(node: BTreeNode<V>, key: number): number {
    let i = 0;
    while (i < node.keys.length && key > node.keys[i]) i++;
    return i;
  }

  // -------------------------------------------------------------------------
  // Min / Max
  // -------------------------------------------------------------------------

  min(): { key: number; value: V } | undefined {
    if (this._size === 0) return undefined;
    let node = this.root;
    while (!node.isLeaf) node = node.children[0];
    return { key: node.keys[0], value: node.values[0] };
  }

  max(): { key: number; value: V } | undefined {
    if (this._size === 0) return undefined;
    let node = this.root;
    while (!node.isLeaf) node = node.children[node.children.length - 1];
    const last = node.keys.length - 1;
    return { key: node.keys[last], value: node.values[last] };
  }

  // -------------------------------------------------------------------------
  // Height
  // -------------------------------------------------------------------------

  height(): number {
    if (this._size === 0) return 0;
    let h = 1;
    let node = this.root;
    while (!node.isLeaf) {
      h++;
      node = node.children[0];
    }
    return h;
  }

  // -------------------------------------------------------------------------
  // Inorder traversal
  // -------------------------------------------------------------------------

  inorder(): Array<{ key: number; value: V }> {
    const result: Array<{ key: number; value: V }> = [];
    this._inorder(this.root, result);
    return result;
  }

  private _inorder(node: BTreeNode<V>, result: Array<{ key: number; value: V }>): void {
    for (let i = 0; i < node.keys.length; i++) {
      if (!node.isLeaf) this._inorder(node.children[i], result);
      result.push({ key: node.keys[i], value: node.values[i] });
    }
    if (!node.isLeaf) this._inorder(node.children[node.keys.length], result);
  }

  // -------------------------------------------------------------------------
  // Range search
  // -------------------------------------------------------------------------

  rangeSearch(lo: number, hi: number): Array<{ key: number; value: V }> {
    const result: Array<{ key: number; value: V }> = [];
    this._rangeSearch(this.root, lo, hi, result);
    return result;
  }

  private _rangeSearch(
    node: BTreeNode<V>,
    lo: number,
    hi: number,
    result: Array<{ key: number; value: V }>,
  ): void {
    let i = 0;
    while (i < node.keys.length) {
      if (!node.isLeaf && node.keys[i] > lo) {
        this._rangeSearch(node.children[i], lo, hi, result);
      }
      if (node.keys[i] >= lo && node.keys[i] <= hi) {
        result.push({ key: node.keys[i], value: node.values[i] });
      }
      if (node.keys[i] > hi) break;
      i++;
    }
    if (!node.isLeaf && (i === node.keys.length || node.keys[i - 1] <= hi)) {
      if (i === node.keys.length) {
        this._rangeSearch(node.children[i], lo, hi, result);
      }
    }
  }

  // -------------------------------------------------------------------------
  // Validate B-tree invariants
  // -------------------------------------------------------------------------

  validate(): boolean {
    try {
      this._validateNode(this.root, null, null, true);
      return true;
    } catch {
      return false;
    }
  }

  private _validateNode(
    node: BTreeNode<V>,
    minKey: number | null,
    maxKey: number | null,
    isRoot: boolean,
  ): number /* leaf depth */ {
    const t = this.t;
    const maxKeys = 2 * t - 1;
    const minKeys = t - 1;

    if (node.keys.length > maxKeys) {
      throw new Error(`Node has too many keys: ${node.keys.length} > ${maxKeys}`);
    }
    if (!isRoot && node.keys.length < minKeys) {
      throw new Error(`Non-root node has too few keys: ${node.keys.length} < ${minKeys}`);
    }

    // Keys sorted and within bounds
    for (let i = 0; i < node.keys.length; i++) {
      if (i > 0 && node.keys[i] <= node.keys[i - 1]) {
        throw new Error('Keys not sorted');
      }
      if (minKey !== null && node.keys[i] <= minKey) {
        throw new Error('Key violates min bound');
      }
      if (maxKey !== null && node.keys[i] >= maxKey) {
        throw new Error('Key violates max bound');
      }
    }

    if (node.isLeaf) return 0;

    if (node.children.length !== node.keys.length + 1) {
      throw new Error('Wrong number of children');
    }

    let depth = -1;
    for (let i = 0; i <= node.keys.length; i++) {
      const lo = i === 0 ? minKey : node.keys[i - 1];
      const hi = i === node.keys.length ? maxKey : node.keys[i];
      const d = this._validateNode(node.children[i], lo, hi, false);
      if (depth === -1) depth = d;
      else if (d !== depth) throw new Error('Unequal leaf depths');
    }
    return depth + 1;
  }
}

// ---------------------------------------------------------------------------
// B+ Tree implementation
// ---------------------------------------------------------------------------

interface BPlusLeaf<V> {
  kind: 'leaf';
  keys: number[];
  values: V[];
  next: BPlusLeaf<V> | null;
}

interface BPlusInternal<V> {
  kind: 'internal';
  keys: number[];
  children: BPlusNode<V>[];
}

type BPlusNode<V> = BPlusLeaf<V> | BPlusInternal<V>;

function createLeaf<V>(): BPlusLeaf<V> {
  return { kind: 'leaf', keys: [], values: [], next: null };
}

function createInternal<V>(): BPlusInternal<V> {
  return { kind: 'internal', keys: [], children: [] };
}

export class BPlusTree<V> {
  private root: BPlusNode<V>;
  private t: number; // min degree
  private _size: number = 0;

  constructor(order: number = 3) {
    if (order < 2) throw new Error('BPlusTree order must be >= 2');
    this.t = order;
    this.root = createLeaf<V>();
  }

  get size(): number {
    return this._size;
  }

  // -------------------------------------------------------------------------
  // Search
  // -------------------------------------------------------------------------

  search(key: number): V | undefined {
    const leaf = this._findLeaf(this.root, key);
    const idx = leaf.keys.indexOf(key);
    return idx === -1 ? undefined : leaf.values[idx];
  }

  private _findLeaf(node: BPlusNode<V>, key: number): BPlusLeaf<V> {
    if (node.kind === 'leaf') return node;
    let i = node.keys.length - 1;
    while (i > 0 && key < node.keys[i]) i--;
    // Navigate: key >= keys[i] goes to children[i+1], else children[0]
    let ci = 0;
    for (let j = 0; j < node.keys.length; j++) {
      if (key >= node.keys[j]) ci = j + 1;
    }
    return this._findLeaf(node.children[ci], key);
  }

  // -------------------------------------------------------------------------
  // Insert
  // -------------------------------------------------------------------------

  insert(key: number, value: V): void {
    // Update if exists
    const leaf = this._findLeaf(this.root, key);
    const idx = leaf.keys.indexOf(key);
    if (idx !== -1) {
      leaf.values[idx] = value;
      return;
    }

    const result = this._insertNode(this.root, key, value);
    if (result) {
      // Root was split
      const newRoot = createInternal<V>();
      newRoot.keys = [result.midKey];
      newRoot.children = [this.root, result.right];
      this.root = newRoot;
    }
    this._size++;
  }

  private _insertNode(
    node: BPlusNode<V>,
    key: number,
    value: V,
  ): { midKey: number; right: BPlusNode<V> } | null {
    if (node.kind === 'leaf') {
      // Insert into leaf in sorted order
      let i = 0;
      while (i < node.keys.length && key > node.keys[i]) i++;
      node.keys.splice(i, 0, key);
      node.values.splice(i, 0, value);

      if (node.keys.length > 2 * this.t - 1) {
        return this._splitLeaf(node);
      }
      return null;
    } else {
      // Find child to descend into
      let ci = node.keys.length;
      for (let j = 0; j < node.keys.length; j++) {
        if (key < node.keys[j]) { ci = j; break; }
      }
      const result = this._insertNode(node.children[ci], key, value);
      if (!result) return null;

      // Insert promoted key into this internal node
      node.keys.splice(ci, 0, result.midKey);
      node.children.splice(ci + 1, 0, result.right);

      if (node.keys.length > 2 * this.t - 1) {
        return this._splitInternal(node);
      }
      return null;
    }
  }

  private _splitLeaf(leaf: BPlusLeaf<V>): { midKey: number; right: BPlusNode<V> } {
    const mid = Math.ceil(leaf.keys.length / 2);
    const right = createLeaf<V>();
    right.keys = leaf.keys.splice(mid);
    right.values = leaf.values.splice(mid);
    right.next = leaf.next;
    leaf.next = right;
    return { midKey: right.keys[0], right };
  }

  private _splitInternal(node: BPlusInternal<V>): { midKey: number; right: BPlusNode<V> } {
    const mid = Math.floor(node.keys.length / 2);
    const midKey = node.keys[mid];
    const right = createInternal<V>();
    right.keys = node.keys.splice(mid + 1);
    right.children = node.children.splice(mid + 1);
    node.keys.splice(mid, 1); // remove promoted key from this node
    return { midKey, right };
  }

  // -------------------------------------------------------------------------
  // Delete
  // -------------------------------------------------------------------------

  delete(key: number): boolean {
    const leaf = this._findLeaf(this.root, key);
    const idx = leaf.keys.indexOf(key);
    if (idx === -1) return false;

    leaf.keys.splice(idx, 1);
    leaf.values.splice(idx, 1);
    this._size--;
    // Note: we don't rebalance for simplicity (B+ delete rebalancing is
    // complex and correctness is maintained by still-valid leaf chain).
    // For production use, full rebalancing would be added.
    return true;
  }

  // -------------------------------------------------------------------------
  // Range scan (efficient via linked leaf nodes)
  // -------------------------------------------------------------------------

  rangeScan(lo: number, hi: number): V[] {
    const result: V[] = [];
    let leaf: BPlusLeaf<V> | null = this._findLeaf(this.root, lo);
    while (leaf !== null) {
      for (let i = 0; i < leaf.keys.length; i++) {
        if (leaf.keys[i] > hi) return result;
        if (leaf.keys[i] >= lo) result.push(leaf.values[i]);
      }
      leaf = leaf.next;
    }
    return result;
  }

  // -------------------------------------------------------------------------
  // All values (in key order via leaf chain)
  // -------------------------------------------------------------------------

  allValues(): V[] {
    const result: V[] = [];
    let leaf: BPlusLeaf<V> | null = this._getFirstLeaf();
    while (leaf !== null) {
      result.push(...leaf.values);
      leaf = leaf.next;
    }
    return result;
  }

  private _getFirstLeaf(): BPlusLeaf<V> {
    let node: BPlusNode<V> = this.root;
    while (node.kind === 'internal') node = node.children[0];
    return node;
  }
}
