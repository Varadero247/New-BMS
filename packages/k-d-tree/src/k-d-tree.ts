// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

export interface Point { coords: number[]; }

function dist(a: Point, b: Point): number {
  return Math.sqrt(a.coords.reduce((s, c, i) => s + (c - b.coords[i]) ** 2, 0));
}

function eqPt(a: Point, b: Point): boolean {
  return a.coords.length === b.coords.length && a.coords.every((c, i) => c === b.coords[i]);
}

interface KDNode {
  point: Point;
  left: KDNode | null;
  right: KDNode | null;
}

export class KDTree {
  private _root: KDNode | null = null;
  private _size = 0;
  private readonly _k: number;

  constructor(k = 2) { this._k = k; }

  insert(point: Point): void {
    this._root = this._ins(this._root, point, 0);
    this._size++;
  }

  private _ins(n: KDNode | null, pt: Point, depth: number): KDNode {
    if (n === null) return { point: pt, left: null, right: null };
    const axis = depth % this._k;
    if (pt.coords[axis] < n.point.coords[axis]) n.left = this._ins(n.left, pt, depth + 1);
    else n.right = this._ins(n.right, pt, depth + 1);
    return n;
  }

  search(point: Point): boolean {
    return this._search(this._root, point, 0);
  }

  private _search(n: KDNode | null, pt: Point, depth: number): boolean {
    if (n === null) return false;
    if (eqPt(n.point, pt)) return true;
    const axis = depth % this._k;
    if (pt.coords[axis] < n.point.coords[axis]) return this._search(n.left, pt, depth + 1);
    return this._search(n.right, pt, depth + 1);
  }

  delete(point: Point): boolean {
    const before = this._size;
    this._root = this._del(this._root, point, 0);
    return this._size < before;
  }

  private _findMin(n: KDNode | null, axis: number, depth: number): KDNode | null {
    if (n === null) return null;
    const curAxis = depth % this._k;
    if (curAxis === axis) {
      if (n.left === null) return n;
      return this._findMin(n.left, axis, depth + 1);
    }
    const lMin = this._findMin(n.left, axis, depth + 1);
    const rMin = this._findMin(n.right, axis, depth + 1);
    let min = n;
    if (lMin && lMin.point.coords[axis] < min.point.coords[axis]) min = lMin;
    if (rMin && rMin.point.coords[axis] < min.point.coords[axis]) min = rMin;
    return min;
  }

  private _del(n: KDNode | null, pt: Point, depth: number): KDNode | null {
    if (n === null) return null;
    const axis = depth % this._k;
    if (eqPt(n.point, pt)) {
      this._size--;
      if (n.right !== null) {
        const min = this._findMin(n.right, axis, depth + 1)!;
        n.point = min.point;
        n.right = this._del(n.right, min.point, depth + 1);
        this._size++;
      } else if (n.left !== null) {
        const min = this._findMin(n.left, axis, depth + 1)!;
        n.point = min.point;
        n.right = this._del(n.left, min.point, depth + 1);
        this._size++;
        n.left = null;
      } else {
        return null;
      }
      return n;
    }
    if (pt.coords[axis] < n.point.coords[axis]) n.left = this._del(n.left, pt, depth + 1);
    else n.right = this._del(n.right, pt, depth + 1);
    return n;
  }

  nearestNeighbor(point: Point): Point | undefined {
    if (this._root === null) return undefined;
    let best: { node: KDNode; dist: number } = { node: this._root, dist: Infinity };
    this._nn(this._root, point, 0, best);
    return best.node.point;
  }

  private _nn(n: KDNode | null, pt: Point, depth: number, best: { node: KDNode; dist: number }): void {
    if (n === null) return;
    const d = dist(n.point, pt);
    if (d < best.dist) { best.dist = d; best.node = n; }
    const axis = depth % this._k;
    const diff = pt.coords[axis] - n.point.coords[axis];
    const [first, second] = diff <= 0 ? [n.left, n.right] : [n.right, n.left];
    this._nn(first, pt, depth + 1, best);
    if (Math.abs(diff) < best.dist) this._nn(second, pt, depth + 1, best);
  }

  rangeSearch(center: Point, radius: number): Point[] {
    const out: Point[] = [];
    this._range(this._root, center, radius, 0, out);
    return out;
  }

  private _range(n: KDNode | null, c: Point, r: number, depth: number, out: Point[]): void {
    if (n === null) return;
    if (dist(n.point, c) <= r) out.push(n.point);
    const axis = depth % this._k;
    const diff = c.coords[axis] - n.point.coords[axis];
    this._range(n.left, c, r, depth + 1, out);
    if (Math.abs(diff) <= r) this._range(n.right, c, r, depth + 1, out);
    else if (diff > 0) this._range(n.right, c, r, depth + 1, out);
  }

  kNearestNeighbors(point: Point, k: number): Point[] {
    const heap: { point: Point; dist: number }[] = [];
    this._knn(this._root, point, k, 0, heap);
    return heap.sort((a, b) => a.dist - b.dist).map(h => h.point);
  }

  private _knn(n: KDNode | null, pt: Point, k: number, depth: number, heap: { point: Point; dist: number }[]): void {
    if (n === null) return;
    const d = dist(n.point, pt);
    if (heap.length < k || d < heap[heap.length - 1].dist) {
      heap.push({ point: n.point, dist: d });
      heap.sort((a, b) => a.dist - b.dist);
      if (heap.length > k) heap.pop();
    }
    const axis = depth % this._k;
    const diff = pt.coords[axis] - n.point.coords[axis];
    const [first, second] = diff <= 0 ? [n.left, n.right] : [n.right, n.left];
    this._knn(first, pt, k, depth + 1, heap);
    if (heap.length < k || Math.abs(diff) < heap[heap.length - 1].dist) {
      this._knn(second, pt, k, depth + 1, heap);
    }
  }

  get size(): number { return this._size; }
  clear(): void { this._root = null; this._size = 0; }
  toArray(): Point[] {
    const out: Point[] = [];
    const stk: KDNode[] = [];
    let n = this._root;
    while (n || stk.length) {
      while (n) { stk.push(n); n = n.left; }
      n = stk.pop()!;
      out.push(n.point);
      n = n.right;
    }
    return out;
  }
}

export class KDTreeMap<V> {
  private _tree: KDTree;
  private _map: Map<string, V> = new Map();

  constructor(k = 2) { this._tree = new KDTree(k); }

  private _key(pt: Point): string { return pt.coords.join(","); }

  set(point: Point, value: V): void {
    const k = this._key(point);
    if (!this._map.has(k)) this._tree.insert(point);
    this._map.set(k, value);
  }

  get(point: Point): V | undefined { return this._map.get(this._key(point)); }
  has(point: Point): boolean { return this._map.has(this._key(point)); }

  delete(point: Point): boolean {
    const k = this._key(point);
    if (!this._map.has(k)) return false;
    this._map.delete(k);
    return this._tree.delete(point);
  }

  get size(): number { return this._map.size; }

  rangeGet(center: Point, radius: number): [Point, V][] {
    return this._tree.rangeSearch(center, radius)
      .map(pt => [pt, this._map.get(this._key(pt))!] as [Point, V]);
  }
}

export class QuadTree {
  private _points: { x: number; y: number; data?: unknown }[] = [];

  insert(x: number, y: number, data?: unknown): void {
    this._points.push({ x, y, data });
  }

  query(x: number, y: number, radius: number): { x: number; y: number }[] {
    return this._points.filter(p => Math.hypot(p.x - x, p.y - y) <= radius);
  }

  get size(): number { return this._points.length; }
}
