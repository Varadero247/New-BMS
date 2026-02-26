// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface Point2D {
  x: number;
  y: number;
}

export interface Bounds {
  x: number;      // top-left x
  y: number;      // top-left y
  width: number;
  height: number;
}

export interface PointData<T> {
  point: Point2D;
  data: T;
}

// Helper: check if point is in bounds (inclusive on top-left, exclusive on bottom-right)
export function inBounds(point: Point2D, bounds: Bounds): boolean {
  return (
    point.x >= bounds.x &&
    point.x < bounds.x + bounds.width &&
    point.y >= bounds.y &&
    point.y < bounds.y + bounds.height
  );
}

// Helper: check if two bounds overlap
export function boundsOverlap(a: Bounds, b: Bounds): boolean {
  return !(
    a.x + a.width <= b.x ||
    b.x + b.width <= a.x ||
    a.y + a.height <= b.y ||
    b.y + b.height <= a.y
  );
}

// Helper: check if bounds contains another bounds completely
export function boundsContains(outer: Bounds, inner: Bounds): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

// Helper: Euclidean distance between two points
export function distance2D(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// Helper: minimum distance from point to bounds (0 if inside)
export function distanceToBounds(point: Point2D, bounds: Bounds): number {
  const dx = Math.max(bounds.x - point.x, 0, point.x - (bounds.x + bounds.width));
  const dy = Math.max(bounds.y - point.y, 0, point.y - (bounds.y + bounds.height));
  return Math.sqrt(dx * dx + dy * dy);
}

// Internal node for Point Quadtree
class QTNode<T> {
  points: Array<PointData<T>> = [];
  children: [QTNode<T> | null, QTNode<T> | null, QTNode<T> | null, QTNode<T> | null] = [null, null, null, null];
  // children: [NW, NE, SW, SE]

  constructor(public bounds: Bounds) {}

  get isLeaf(): boolean {
    return this.children[0] === null && this.children[1] === null &&
           this.children[2] === null && this.children[3] === null;
  }

  subdivide(): void {
    const hw = this.bounds.width / 2;
    const hh = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;
    this.children[0] = new QTNode<T>({ x, y, width: hw, height: hh });                        // NW
    this.children[1] = new QTNode<T>({ x: x + hw, y, width: hw, height: hh });                // NE
    this.children[2] = new QTNode<T>({ x, y: y + hh, width: hw, height: hh });                // SW
    this.children[3] = new QTNode<T>({ x: x + hw, y: y + hh, width: hw, height: hh });        // SE
  }

  getChildIndex(point: Point2D): number {
    const midX = this.bounds.x + this.bounds.width / 2;
    const midY = this.bounds.y + this.bounds.height / 2;
    const east = point.x >= midX;
    const south = point.y >= midY;
    if (!south && !east) return 0; // NW
    if (!south && east) return 1;  // NE
    if (south && !east) return 2;  // SW
    return 3;                       // SE
  }
}

// Point Quadtree — stores points with associated data
export class Quadtree<T> {
  private _root: QTNode<T>;
  private _capacity: number;
  private _size = 0;

  constructor(bounds: Bounds, capacity = 4) {
    this._root = new QTNode<T>(bounds);
    this._capacity = capacity;
  }

  get bounds(): Bounds {
    return this._root.bounds;
  }

  get size(): number {
    return this._size;
  }

  get depth(): number {
    return this._nodeDepth(this._root);
  }

  private _nodeDepth(node: QTNode<T> | null): number {
    if (node === null) return 0;
    if (node.isLeaf) return 1;
    let max = 0;
    for (const child of node.children) {
      const d = this._nodeDepth(child);
      if (d > max) max = d;
    }
    return max + 1;
  }

  contains(point: Point2D): boolean {
    return inBounds(point, this._root.bounds);
  }

  insert(point: Point2D, data: T): boolean {
    if (!inBounds(point, this._root.bounds)) return false;
    this._insert(this._root, point, data);
    this._size++;
    return true;
  }

  private _insert(node: QTNode<T>, point: Point2D, data: T): void {
    if (node.isLeaf) {
      if (node.points.length < this._capacity) {
        node.points.push({ point, data });
        return;
      }
      // Split
      node.subdivide();
      // Redistribute existing points
      const existing = node.points.splice(0);
      for (const pd of existing) {
        const idx = node.getChildIndex(pd.point);
        const child = node.children[idx];
        if (child !== null && inBounds(pd.point, child.bounds)) {
          this._insert(child, pd.point, pd.data);
        } else {
          // fallback: keep in current node if can't place in child
          node.points.push(pd);
        }
      }
    }
    const idx = node.getChildIndex(point);
    const child = node.children[idx];
    if (child !== null && inBounds(point, child.bounds)) {
      this._insert(child, point, data);
    } else {
      // Place in current node if no fitting child
      node.points.push({ point, data });
    }
  }

  query(region: Bounds): Array<PointData<T>> {
    const result: Array<PointData<T>> = [];
    this._query(this._root, region, result);
    return result;
  }

  private _query(node: QTNode<T> | null, region: Bounds, result: Array<PointData<T>>): void {
    if (node === null) return;
    if (!boundsOverlap(node.bounds, region)) return;
    for (const pd of node.points) {
      if (inBounds(pd.point, region)) result.push(pd);
    }
    for (const child of node.children) {
      this._query(child, region, result);
    }
  }

  queryCircle(center: Point2D, radius: number): Array<PointData<T>> {
    // Build a bounding box for the circle, then filter
    const region: Bounds = {
      x: center.x - radius,
      y: center.y - radius,
      width: radius * 2,
      height: radius * 2,
    };
    const candidates = this.query(region);
    return candidates.filter(pd => distance2D(pd.point, center) <= radius);
  }

  nearest(point: Point2D, k: number): Array<PointData<T>> {
    if (k <= 0) return [];
    const all = this.all();
    // Sort by distance
    all.sort((a, b) => distance2D(a.point, point) - distance2D(b.point, point));
    return all.slice(0, k);
  }

  closestPoint(point: Point2D): PointData<T> | null {
    const results = this.nearest(point, 1);
    return results.length > 0 ? results[0] : null;
  }

  remove(point: Point2D): boolean {
    const removed = this._remove(this._root, point);
    if (removed) this._size--;
    return removed;
  }

  private _remove(node: QTNode<T> | null, point: Point2D): boolean {
    if (node === null) return false;
    // Try to remove from this node's points
    for (let i = 0; i < node.points.length; i++) {
      const pd = node.points[i];
      if (pd.point.x === point.x && pd.point.y === point.y) {
        node.points.splice(i, 1);
        return true;
      }
    }
    // Try children
    for (const child of node.children) {
      if (child !== null && inBounds(point, child.bounds)) {
        if (this._remove(child, point)) return true;
      }
    }
    return false;
  }

  all(): Array<PointData<T>> {
    const result: Array<PointData<T>> = [];
    this._collect(this._root, result);
    return result;
  }

  private _collect(node: QTNode<T> | null, result: Array<PointData<T>>): void {
    if (node === null) return;
    for (const pd of node.points) result.push(pd);
    for (const child of node.children) this._collect(child, result);
  }

  clear(): void {
    this._root = new QTNode<T>(this._root.bounds);
    this._size = 0;
  }
}

// Internal node for Region Quadtree
interface RQNode {
  bounds: Bounds;
  value: number;
  children: [RQNode | null, RQNode | null, RQNode | null, RQNode | null];
}

function makeRQNode(bounds: Bounds): RQNode {
  return { bounds, value: 0, children: [null, null, null, null] };
}

// Region Quadtree — stores 2D grid data
export class RegionQuadtree {
  private _root: RQNode;
  private _maxDepth: number;
  private _size = 0;

  constructor(bounds: Bounds, maxDepth = 8) {
    this._root = makeRQNode(bounds);
    this._maxDepth = maxDepth;
  }

  set(point: Point2D, value: number): void {
    this._set(this._root, point, value, 0);
  }

  private _set(node: RQNode, point: Point2D, value: number, depth: number): void {
    if (!inBounds(point, node.bounds)) return;
    if (depth >= this._maxDepth || (node.bounds.width <= 1 && node.bounds.height <= 1)) {
      if (node.value === 0 && value !== 0) this._size++;
      else if (node.value !== 0 && value === 0) this._size--;
      node.value = value;
      return;
    }
    // Subdivide if needed
    if (node.children[0] === null) {
      const hw = node.bounds.width / 2;
      const hh = node.bounds.height / 2;
      const x = node.bounds.x;
      const y = node.bounds.y;
      node.children[0] = makeRQNode({ x, y, width: hw, height: hh });
      node.children[1] = makeRQNode({ x: x + hw, y, width: hw, height: hh });
      node.children[2] = makeRQNode({ x, y: y + hh, width: hw, height: hh });
      node.children[3] = makeRQNode({ x: x + hw, y: y + hh, width: hw, height: hh });
    }
    for (const child of node.children) {
      if (child !== null && inBounds(point, child.bounds)) {
        this._set(child, point, value, depth + 1);
        return;
      }
    }
    // Fallback: store in current node
    if (node.value === 0 && value !== 0) this._size++;
    else if (node.value !== 0 && value === 0) this._size--;
    node.value = value;
  }

  get(point: Point2D): number {
    return this._get(this._root, point);
  }

  private _get(node: RQNode | null, point: Point2D): number {
    if (node === null) return 0;
    if (!inBounds(point, node.bounds)) return 0;
    // If leaf or max depth
    if (node.children[0] === null) return node.value;
    for (const child of node.children) {
      if (child !== null && inBounds(point, child.bounds)) {
        return this._get(child, point);
      }
    }
    return node.value;
  }

  querySum(region: Bounds): number {
    return this._querySum(this._root, region);
  }

  private _querySum(node: RQNode | null, region: Bounds): number {
    if (node === null) return 0;
    if (!boundsOverlap(node.bounds, region)) return 0;
    if (node.children[0] === null) {
      // Leaf: return value if center point is in region
      const cx = node.bounds.x + node.bounds.width / 2;
      const cy = node.bounds.y + node.bounds.height / 2;
      return inBounds({ x: cx, y: cy }, region) ? node.value : 0;
    }
    let sum = 0;
    for (const child of node.children) sum += this._querySum(child, region);
    return sum;
  }

  queryCount(region: Bounds): number {
    return this._queryCount(this._root, region);
  }

  private _queryCount(node: RQNode | null, region: Bounds): number {
    if (node === null) return 0;
    if (!boundsOverlap(node.bounds, region)) return 0;
    if (node.children[0] === null) {
      const cx = node.bounds.x + node.bounds.width / 2;
      const cy = node.bounds.y + node.bounds.height / 2;
      return (node.value !== 0 && inBounds({ x: cx, y: cy }, region)) ? 1 : 0;
    }
    let count = 0;
    for (const child of node.children) count += this._queryCount(child, region);
    return count;
  }

  get size(): number {
    return this._size;
  }

  clear(): void {
    this._root = makeRQNode(this._root.bounds);
    this._size = 0;
  }
}

// Build quadtree from array of points
export function buildQuadtree<T>(
  points: Array<PointData<T>>,
  bounds: Bounds,
  capacity = 4
): Quadtree<T> {
  const qt = new Quadtree<T>(bounds, capacity);
  for (const pd of points) {
    qt.insert(pd.point, pd.data);
  }
  return qt;
}
