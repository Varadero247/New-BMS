// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Proprietary and confidential. Unauthorised copying prohibited.
// See LICENCE file for details.

// ─── Types ──────────────────────────────────────────────────────────────────

export interface Point2D { x: number; y: number }
export interface Point3D { x: number; y: number; z: number }
export interface BBox { minX: number; minY: number; maxX: number; maxY: number }
export interface Circle { cx: number; cy: number; r: number }

// ─── Helper functions ────────────────────────────────────────────────────────

export function euclidean2D(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

export function euclidean3D(a: Point3D, b: Point3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function bboxContains(bbox: BBox, p: Point2D): boolean {
  return p.x >= bbox.minX && p.x <= bbox.maxX && p.y >= bbox.minY && p.y <= bbox.maxY;
}

export function bboxOverlaps(a: BBox, b: BBox): boolean {
  return a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
}

export function pointInCircle(p: Point2D, c: Circle): boolean {
  const dx = p.x - c.cx;
  const dy = p.y - c.cy;
  return dx * dx + dy * dy <= c.r * c.r;
}

// ─── Geohash ─────────────────────────────────────────────────────────────────

const GEOHASH_CHARS = '0123456789bcdefghjkmnpqrstuvwxyz';

export function geohashEncode(lat: number, lon: number, precision = 9): string {
  let minLat = -90, maxLat = 90, minLon = -180, maxLon = 180;
  let hash = '';
  let bits = 0;
  let bitsTotal = 0;
  let hashValue = 0;
  let isLon = true;

  while (hash.length < precision) {
    if (isLon) {
      const mid = (minLon + maxLon) / 2;
      if (lon >= mid) { hashValue = (hashValue << 1) | 1; minLon = mid; }
      else { hashValue = (hashValue << 1); maxLon = mid; }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat >= mid) { hashValue = (hashValue << 1) | 1; minLat = mid; }
      else { hashValue = (hashValue << 1); maxLat = mid; }
    }
    isLon = !isLon;
    bits++;
    bitsTotal++;
    if (bits === 5) {
      hash += GEOHASH_CHARS[hashValue];
      bits = 0;
      hashValue = 0;
    }
  }
  return hash;
}

export function geohashDecode(hash: string): { lat: number; lon: number; error: { lat: number; lon: number } } {
  let minLat = -90, maxLat = 90, minLon = -180, maxLon = 180;
  let isLon = true;

  for (const ch of hash) {
    const idx = GEOHASH_CHARS.indexOf(ch);
    for (let bits = 4; bits >= 0; bits--) {
      const bit = (idx >> bits) & 1;
      if (isLon) {
        const mid = (minLon + maxLon) / 2;
        if (bit) minLon = mid; else maxLon = mid;
      } else {
        const mid = (minLat + maxLat) / 2;
        if (bit) minLat = mid; else maxLat = mid;
      }
      isLon = !isLon;
    }
  }

  return {
    lat: (minLat + maxLat) / 2,
    lon: (minLon + maxLon) / 2,
    error: {
      lat: (maxLat - minLat) / 2,
      lon: (maxLon - minLon) / 2,
    },
  };
}

// ─── KDTree (2D) ─────────────────────────────────────────────────────────────

interface KDNode2D<T> {
  point: Point2D;
  data: T;
  left: KDNode2D<T> | null;
  right: KDNode2D<T> | null;
}

export class KDTree<T> {
  private root: KDNode2D<T> | null = null;
  private _size = 0;

  get size(): number { return this._size; }

  insert(point: Point2D, data: T): void {
    this.root = this._insert(this.root, point, data, 0);
    this._size++;
  }

  private _insert(node: KDNode2D<T> | null, point: Point2D, data: T, depth: number): KDNode2D<T> {
    if (node === null) return { point, data, left: null, right: null };
    const axis = depth % 2;
    const cmp = axis === 0 ? point.x - node.point.x : point.y - node.point.y;
    if (cmp < 0) node.left = this._insert(node.left, point, data, depth + 1);
    else node.right = this._insert(node.right, point, data, depth + 1);
    return node;
  }

  search(point: Point2D): T | undefined {
    let node = this.root;
    let depth = 0;
    while (node !== null) {
      if (node.point.x === point.x && node.point.y === point.y) return node.data;
      const axis = depth % 2;
      const cmp = axis === 0 ? point.x - node.point.x : point.y - node.point.y;
      node = cmp < 0 ? node.left : node.right;
      depth++;
    }
    return undefined;
  }

  nearest(point: Point2D): { point: Point2D; data: T } | undefined {
    if (this.root === null) return undefined;
    let best: { point: Point2D; data: T } | null = null;
    let bestDist = Infinity;

    const search = (node: KDNode2D<T> | null, depth: number): void => {
      if (node === null) return;
      const d = euclidean2D(point, node.point);
      if (d < bestDist) { bestDist = d; best = { point: node.point, data: node.data }; }
      const axis = depth % 2;
      const diff = axis === 0 ? point.x - node.point.x : point.y - node.point.y;
      const [near, far] = diff < 0 ? [node.left, node.right] : [node.right, node.left];
      search(near, depth + 1);
      if (Math.abs(diff) < bestDist) search(far, depth + 1);
    };

    search(this.root, 0);
    return best ?? undefined;
  }

  kNearest(point: Point2D, k: number): Array<{ point: Point2D; data: T }> {
    if (k <= 0) return [];
    const heap: Array<{ point: Point2D; data: T; dist: number }> = [];

    const search = (node: KDNode2D<T> | null, depth: number): void => {
      if (node === null) return;
      const d = euclidean2D(point, node.point);
      if (heap.length < k || d < heap[heap.length - 1].dist) {
        heap.push({ point: node.point, data: node.data, dist: d });
        heap.sort((a, b) => a.dist - b.dist);
        if (heap.length > k) heap.pop();
      }
      const axis = depth % 2;
      const diff = axis === 0 ? point.x - node.point.x : point.y - node.point.y;
      const [near, far] = diff < 0 ? [node.left, node.right] : [node.right, node.left];
      search(near, depth + 1);
      const worstDist = heap.length < k ? Infinity : heap[heap.length - 1].dist;
      if (Math.abs(diff) < worstDist) search(far, depth + 1);
    };

    search(this.root, 0);
    return heap.map(({ point: p, data }) => ({ point: p, data }));
  }

  rangeSearch(bbox: BBox): Array<{ point: Point2D; data: T }> {
    const results: Array<{ point: Point2D; data: T }> = [];

    const search = (node: KDNode2D<T> | null, depth: number): void => {
      if (node === null) return;
      if (bboxContains(bbox, node.point)) results.push({ point: node.point, data: node.data });
      const axis = depth % 2;
      if (axis === 0) {
        if (node.point.x >= bbox.minX) search(node.left, depth + 1);
        if (node.point.x <= bbox.maxX) search(node.right, depth + 1);
      } else {
        if (node.point.y >= bbox.minY) search(node.left, depth + 1);
        if (node.point.y <= bbox.maxY) search(node.right, depth + 1);
      }
    };

    search(this.root, 0);
    return results;
  }

  circleSearch(circle: Circle): Array<{ point: Point2D; data: T }> {
    const results: Array<{ point: Point2D; data: T }> = [];

    const search = (node: KDNode2D<T> | null, depth: number): void => {
      if (node === null) return;
      if (pointInCircle(node.point, circle)) results.push({ point: node.point, data: node.data });
      const axis = depth % 2;
      const diff = axis === 0 ? node.point.x - circle.cx : node.point.y - circle.cy;
      if (diff >= 0) {
        search(node.left, depth + 1);
        if (Math.abs(diff) <= circle.r) search(node.right, depth + 1);
      } else {
        search(node.right, depth + 1);
        if (Math.abs(diff) <= circle.r) search(node.left, depth + 1);
      }
    };

    search(this.root, 0);
    return results;
  }

  static build<T>(points: Array<{ point: Point2D; data: T }>): KDTree<T> {
    const tree = new KDTree<T>();
    for (const { point, data } of points) tree.insert(point, data);
    return tree;
  }
}

// ─── KDTree3D ─────────────────────────────────────────────────────────────────

interface KDNode3D<T> {
  point: Point3D;
  data: T;
  left: KDNode3D<T> | null;
  right: KDNode3D<T> | null;
}

export class KDTree3D<T> {
  private root: KDNode3D<T> | null = null;
  private _size = 0;

  get size(): number { return this._size; }

  insert(point: Point3D, data: T): void {
    this.root = this._insert(this.root, point, data, 0);
    this._size++;
  }

  private _insert(node: KDNode3D<T> | null, point: Point3D, data: T, depth: number): KDNode3D<T> {
    if (node === null) return { point, data, left: null, right: null };
    const axis = depth % 3;
    const val = axis === 0 ? point.x : axis === 1 ? point.y : point.z;
    const nodeVal = axis === 0 ? node.point.x : axis === 1 ? node.point.y : node.point.z;
    if (val < nodeVal) node.left = this._insert(node.left, point, data, depth + 1);
    else node.right = this._insert(node.right, point, data, depth + 1);
    return node;
  }

  nearest(point: Point3D): { point: Point3D; data: T } | undefined {
    if (this.root === null) return undefined;
    let best: { point: Point3D; data: T } | null = null;
    let bestDist = Infinity;

    const search = (node: KDNode3D<T> | null, depth: number): void => {
      if (node === null) return;
      const d = euclidean3D(point, node.point);
      if (d < bestDist) { bestDist = d; best = { point: node.point, data: node.data }; }
      const axis = depth % 3;
      const val = axis === 0 ? point.x : axis === 1 ? point.y : point.z;
      const nodeVal = axis === 0 ? node.point.x : axis === 1 ? node.point.y : node.point.z;
      const diff = val - nodeVal;
      const [near, far] = diff < 0 ? [node.left, node.right] : [node.right, node.left];
      search(near, depth + 1);
      if (Math.abs(diff) < bestDist) search(far, depth + 1);
    };

    search(this.root, 0);
    return best ?? undefined;
  }

  kNearest(point: Point3D, k: number): Array<{ point: Point3D; data: T }> {
    if (k <= 0) return [];
    const heap: Array<{ point: Point3D; data: T; dist: number }> = [];

    const search = (node: KDNode3D<T> | null, depth: number): void => {
      if (node === null) return;
      const d = euclidean3D(point, node.point);
      if (heap.length < k || d < heap[heap.length - 1].dist) {
        heap.push({ point: node.point, data: node.data, dist: d });
        heap.sort((a, b) => a.dist - b.dist);
        if (heap.length > k) heap.pop();
      }
      const axis = depth % 3;
      const val = axis === 0 ? point.x : axis === 1 ? point.y : point.z;
      const nodeVal = axis === 0 ? node.point.x : axis === 1 ? node.point.y : node.point.z;
      const diff = val - nodeVal;
      const [near, far] = diff < 0 ? [node.left, node.right] : [node.right, node.left];
      search(near, depth + 1);
      const worstDist = heap.length < k ? Infinity : heap[heap.length - 1].dist;
      if (Math.abs(diff) < worstDist) search(far, depth + 1);
    };

    search(this.root, 0);
    return heap.map(({ point: p, data }) => ({ point: p, data }));
  }
}

// ─── RTree (simplified, linear scan per bbox) ────────────────────────────────

interface REntry<T> { bbox: BBox; data: T }

export class RTree<T> {
  private entries: REntry<T>[] = [];

  get size(): number { return this.entries.length; }

  insert(bbox: BBox, data: T): void {
    this.entries.push({ bbox, data });
  }

  search(bbox: BBox): T[] {
    return this.entries.filter(e => bboxOverlaps(e.bbox, bbox)).map(e => e.data);
  }

  delete(bbox: BBox, data: T): boolean {
    const idx = this.entries.findIndex(
      e => e.data === data &&
        e.bbox.minX === bbox.minX && e.bbox.minY === bbox.minY &&
        e.bbox.maxX === bbox.maxX && e.bbox.maxY === bbox.maxY
    );
    if (idx === -1) return false;
    this.entries.splice(idx, 1);
    return true;
  }

  all(): T[] {
    return this.entries.map(e => e.data);
  }
}

// ─── GridIndex ────────────────────────────────────────────────────────────────

export class GridIndex<T> {
  private cells = new Map<string, Array<{ point: Point2D; data: T }>>();
  private _size = 0;
  private readonly cellSize: number;

  constructor(cellSize: number) {
    this.cellSize = cellSize;
  }

  get size(): number { return this._size; }

  private cellKey(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize);
    const cy = Math.floor(y / this.cellSize);
    return `${cx},${cy}`;
  }

  insert(point: Point2D, data: T): void {
    const key = this.cellKey(point.x, point.y);
    if (!this.cells.has(key)) this.cells.set(key, []);
    this.cells.get(key)!.push({ point, data });
    this._size++;
  }

  query(bbox: BBox): T[] {
    const cx0 = Math.floor(bbox.minX / this.cellSize);
    const cx1 = Math.floor(bbox.maxX / this.cellSize);
    const cy0 = Math.floor(bbox.minY / this.cellSize);
    const cy1 = Math.floor(bbox.maxY / this.cellSize);
    const results: T[] = [];
    for (let cx = cx0; cx <= cx1; cx++) {
      for (let cy = cy0; cy <= cy1; cy++) {
        const entries = this.cells.get(`${cx},${cy}`) ?? [];
        for (const e of entries) {
          if (bboxContains(bbox, e.point)) results.push(e.data);
        }
      }
    }
    return results;
  }

  nearest(point: Point2D): T | undefined {
    if (this._size === 0) return undefined;
    let best: T | undefined;
    let bestDist = Infinity;

    // Search expanding rings of cells until we find something closer than the ring edge
    let radius = 0;
    while (best === undefined || radius * this.cellSize < bestDist) {
      const cx0 = Math.floor(point.x / this.cellSize) - radius;
      const cx1 = Math.floor(point.x / this.cellSize) + radius;
      const cy0 = Math.floor(point.y / this.cellSize) - radius;
      const cy1 = Math.floor(point.y / this.cellSize) + radius;

      for (let cx = cx0; cx <= cx1; cx++) {
        for (let cy = cy0; cy <= cy1; cy++) {
          // Only visit cells on the border of the current ring
          if (radius > 0 && cx > cx0 && cx < cx1 && cy > cy0 && cy < cy1) continue;
          const entries = this.cells.get(`${cx},${cy}`) ?? [];
          for (const e of entries) {
            const d = euclidean2D(point, e.point);
            if (d < bestDist) { bestDist = d; best = e.data; }
          }
        }
      }

      if (best !== undefined && radius * this.cellSize >= bestDist) break;
      radius++;
      // Safety: stop after a reasonable search radius (at least 1000 cells)
      if (radius > Math.max(1000, this._size * 2)) break;
    }

    return best;
  }
}
