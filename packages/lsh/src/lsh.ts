// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ---------------------------------------------------------------------------
// Seeded pseudo-random number generator (Mulberry32)
// ---------------------------------------------------------------------------
function mulberry32(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s += 0x6d2b79f5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Standalone utility functions
// ---------------------------------------------------------------------------

/**
 * Cosine similarity between two vectors.
 * Returns NaN if either vector has zero magnitude.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Vectors must have equal length');
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return NaN;
  return dot / denom;
}

/**
 * Jaccard similarity between two sets.
 */
export function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let intersection = 0;
  for (const item of a) {
    if (b.has(item)) intersection++;
  }
  const union = a.size + b.size - intersection;
  return union === 0 ? 1 : intersection / union;
}

/**
 * Hamming distance between two bigints (number of differing bits within `bits` width).
 */
export function hammingDistance(a: bigint, b: bigint, bits: number = 64): number {
  let xor = (a ^ b) & ((1n << BigInt(bits)) - 1n);
  let count = 0;
  while (xor > 0n) {
    count += Number(xor & 1n);
    xor >>= 1n;
  }
  return count;
}

/**
 * Random projection hash: returns 1 if dot(v, plane) >= 0, else 0.
 */
export function randomProjectionHash(v: number[], plane: number[]): number {
  if (v.length !== plane.length) throw new Error('Vectors must have equal length');
  let dot = 0;
  for (let i = 0; i < v.length; i++) dot += v[i] * plane[i];
  return dot >= 0 ? 1 : 0;
}

/**
 * Generate `numPlanes` random unit-normal hyperplanes of dimension `dim`.
 */
export function generateRandomPlanes(dim: number, numPlanes: number, seed?: number): number[][] {
  const rand = mulberry32(seed !== undefined ? seed : 42);
  const planes: number[][] = [];
  for (let p = 0; p < numPlanes; p++) {
    const plane: number[] = [];
    // Box-Muller to get approximate normal distribution values
    for (let i = 0; i < dim; i += 2) {
      const u1 = rand();
      const u2 = rand();
      const mag = Math.sqrt(-2 * Math.log(u1 + 1e-15));
      const z0 = mag * Math.cos(2 * Math.PI * u2);
      const z1 = mag * Math.sin(2 * Math.PI * u2);
      plane.push(z0);
      if (i + 1 < dim) plane.push(z1);
    }
    planes.push(plane);
  }
  return planes;
}

// ---------------------------------------------------------------------------
// LSH — Random Projection LSH for Euclidean/cosine space
// ---------------------------------------------------------------------------
export class LSH {
  private readonly dim: number;
  private readonly numHashes: number;
  private readonly numBands: number;
  private readonly rowsPerBand: number;
  private readonly planes: number[][];
  private readonly buckets: Map<string, Set<string>>[];
  private readonly store: Map<string, number[]>;

  constructor(dim: number, numHashes: number, numBands: number, seed?: number) {
    if (numHashes % numBands !== 0) {
      throw new Error('numHashes must be divisible by numBands');
    }
    this.dim = dim;
    this.numHashes = numHashes;
    this.numBands = numBands;
    this.rowsPerBand = numHashes / numBands;
    this.planes = generateRandomPlanes(dim, numHashes, seed !== undefined ? seed : 42);
    this.buckets = Array.from({ length: numBands }, () => new Map<string, Set<string>>());
    this.store = new Map();
  }

  private _hashVector(vector: number[]): number[] {
    return this.planes.map(plane => randomProjectionHash(vector, plane));
  }

  private _bandKey(hashes: number[], band: number): string {
    const start = band * this.rowsPerBand;
    return hashes.slice(start, start + this.rowsPerBand).join(',');
  }

  add(id: string, vector: number[]): void {
    if (vector.length !== this.dim) {
      throw new Error(`Vector dimension mismatch: expected ${this.dim}, got ${vector.length}`);
    }
    this.store.set(id, vector);
    const hashes = this._hashVector(vector);
    for (let b = 0; b < this.numBands; b++) {
      const key = this._bandKey(hashes, b);
      if (!this.buckets[b].has(key)) this.buckets[b].set(key, new Set());
      this.buckets[b].get(key)!.add(id);
    }
  }

  query(vector: number[], topK?: number): string[] {
    if (vector.length !== this.dim) {
      throw new Error(`Vector dimension mismatch: expected ${this.dim}, got ${vector.length}`);
    }
    const hashes = this._hashVector(vector);
    const candidates = new Set<string>();
    for (let b = 0; b < this.numBands; b++) {
      const key = this._bandKey(hashes, b);
      const bucket = this.buckets[b].get(key);
      if (bucket) {
        for (const id of bucket) candidates.add(id);
      }
    }
    const result = Array.from(candidates);
    if (topK !== undefined) return result.slice(0, topK);
    return result;
  }

  clear(): void {
    this.store.clear();
    for (const bandMap of this.buckets) bandMap.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

// ---------------------------------------------------------------------------
// MinHashLSH — MinHash LSH for Jaccard similarity on sets
// ---------------------------------------------------------------------------
export class MinHashLSH {
  private readonly numHashes: number;
  private readonly numBands: number;
  private readonly rowsPerBand: number;
  private readonly aCoeffs: number[];
  private readonly bCoeffs: number[];
  private readonly prime: number;
  private readonly buckets: Map<string, Set<string>>[];
  private readonly store: Map<string, string[]>;

  constructor(numHashes: number, numBands: number, seed?: number) {
    if (numHashes % numBands !== 0) {
      throw new Error('numHashes must be divisible by numBands');
    }
    this.numHashes = numHashes;
    this.numBands = numBands;
    this.rowsPerBand = numHashes / numBands;
    this.prime = 2147483647; // Mersenne prime 2^31-1
    const rand = mulberry32(seed !== undefined ? seed : 99);
    this.aCoeffs = Array.from({ length: numHashes }, () => Math.floor(rand() * (this.prime - 1)) + 1);
    this.bCoeffs = Array.from({ length: numHashes }, () => Math.floor(rand() * this.prime));
    this.buckets = Array.from({ length: numBands }, () => new Map<string, Set<string>>());
    this.store = new Map();
  }

  private _minHash(items: string[]): number[] {
    // Assign integer IDs to each item via a stable hash
    const sig = new Array(this.numHashes).fill(Infinity);
    for (const item of items) {
      const x = this._strHash(item);
      for (let i = 0; i < this.numHashes; i++) {
        const h = ((this.aCoeffs[i] * x + this.bCoeffs[i]) % this.prime + this.prime) % this.prime;
        if (h < sig[i]) sig[i] = h;
      }
    }
    return sig;
  }

  private _strHash(s: string): number {
    // FNV-1a 32-bit
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }

  private _bandKey(sig: number[], band: number): string {
    const start = band * this.rowsPerBand;
    return sig.slice(start, start + this.rowsPerBand).join(',');
  }

  add(id: string, items: string[]): void {
    this.store.set(id, items);
    const sig = this._minHash(items);
    for (let b = 0; b < this.numBands; b++) {
      const key = this._bandKey(sig, b);
      if (!this.buckets[b].has(key)) this.buckets[b].set(key, new Set());
      this.buckets[b].get(key)!.add(id);
    }
  }

  query(items: string[], threshold?: number): string[] {
    const sig = this._minHash(items);
    const candidates = new Set<string>();
    for (let b = 0; b < this.numBands; b++) {
      const key = this._bandKey(sig, b);
      const bucket = this.buckets[b].get(key);
      if (bucket) {
        for (const id of bucket) candidates.add(id);
      }
    }

    if (threshold === undefined) return Array.from(candidates);

    // Filter by actual Jaccard similarity estimate
    const querySet = new Set(items);
    return Array.from(candidates).filter(id => {
      const stored = this.store.get(id);
      if (!stored) return false;
      return jaccardSimilarity(querySet, new Set(stored)) >= threshold;
    });
  }

  clear(): void {
    this.store.clear();
    for (const bandMap of this.buckets) bandMap.clear();
  }

  get size(): number {
    return this.store.size;
  }
}

// ---------------------------------------------------------------------------
// SimHash — Charikar's SimHash for text/token similarity
// ---------------------------------------------------------------------------
export class SimHash {
  private readonly bits: number;

  constructor(bits: number = 64) {
    if (bits < 1 || bits > 64) throw new Error('bits must be between 1 and 64');
    this.bits = bits;
  }

  private _tokenHash(token: string): bigint {
    // FNV-1a 64-bit approximation using two 32-bit halves
    let h1 = 2166136261;
    let h2 = 2246822519;
    for (let i = 0; i < token.length; i++) {
      const c = token.charCodeAt(i);
      h1 = Math.imul(h1 ^ c, 16777619) >>> 0;
      h2 = Math.imul(h2 ^ c, 2246822519) >>> 0;
    }
    return (BigInt(h1) << 32n) | BigInt(h2);
  }

  hash(tokens: string[]): bigint {
    const v = new Array(this.bits).fill(0);
    for (const token of tokens) {
      const h = this._tokenHash(token);
      for (let i = 0; i < this.bits; i++) {
        if ((h >> BigInt(i)) & 1n) {
          v[i]++;
        } else {
          v[i]--;
        }
      }
    }
    let result = 0n;
    for (let i = 0; i < this.bits; i++) {
      if (v[i] > 0) result |= (1n << BigInt(i));
    }
    return result;
  }

  hammingDistance(a: bigint, b: bigint): number {
    return hammingDistance(a, b, this.bits);
  }

  similarity(a: bigint, b: bigint): number {
    const dist = this.hammingDistance(a, b);
    return 1 - dist / this.bits;
  }

  /**
   * Find all pairs of texts with similarity above `threshold`.
   * Each text is represented as a token array (string[]).
   */
  nearDuplicates(texts: string[][], threshold: number = 0.8): Array<[number, number]> {
    const hashes = texts.map(t => this.hash(t));
    const pairs: Array<[number, number]> = [];
    for (let i = 0; i < hashes.length; i++) {
      for (let j = i + 1; j < hashes.length; j++) {
        if (this.similarity(hashes[i], hashes[j]) > threshold) {
          pairs.push([i, j]);
        }
      }
    }
    return pairs;
  }
}
