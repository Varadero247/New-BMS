// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ---------------------------------------------------------------------------
// SeededRandom — deterministic LCG-based PRNG
// ---------------------------------------------------------------------------
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    // Force state to a positive 32-bit integer
    this.state = (seed >>> 0) || 1;
  }

  /** Returns a pseudo-random float in [0, 1) */
  next(): number {
    // LCG: Numerical Recipes parameters
    this.state = ((this.state * 1664525 + 1013904223) >>> 0);
    return this.state / 0x100000000;
  }

  /** Returns a pseudo-random integer in [0, max) */
  nextInt(max: number): number {
    return Math.floor(this.next() * max);
  }
}

// ---------------------------------------------------------------------------
// Helper: build a SeededRandom or a wrapper around Math.random
// ---------------------------------------------------------------------------
function makeRng(seed?: number): SeededRandom {
  // When no seed provided use a time-based seed so we still get a SeededRandom
  // instance (Math.random cannot be used as a consistent SeededRandom).
  return new SeededRandom(seed !== undefined ? seed : (Date.now() & 0x7fffffff));
}

// ---------------------------------------------------------------------------
// ReservoirSampler<T>
// ---------------------------------------------------------------------------
export class ReservoirSampler<T> {
  private k: number;
  private reservoir: T[] = [];
  private _size: number = 0;
  private rng: SeededRandom;

  constructor(k: number, seed?: number) {
    this.k = k;
    this.rng = makeRng(seed);
  }

  add(item: T): void {
    this._size++;
    if (this.reservoir.length < this.k) {
      this.reservoir.push(item);
    } else {
      // Algorithm R: replace with probability k/n
      const j = Math.floor(this.rng.next() * this._size);
      if (j < this.k) {
        this.reservoir[j] = item;
      }
    }
  }

  getSample(): T[] {
    return [...this.reservoir];
  }

  get size(): number {
    return this._size;
  }

  clear(): void {
    this.reservoir = [];
    this._size = 0;
  }
}

// ---------------------------------------------------------------------------
// WeightedSampler<T>
// ---------------------------------------------------------------------------
export class WeightedSampler<T> {
  private items: T[];
  private weights: number[];
  private cumulative: number[];
  private total: number;
  private rng: SeededRandom;

  constructor(items: T[], weights: number[], seed?: number) {
    if (items.length !== weights.length) {
      throw new Error('items and weights must have the same length');
    }
    this.items = [...items];
    this.weights = [...weights];
    this.rng = makeRng(seed);

    // Build cumulative distribution
    this.cumulative = [];
    let sum = 0;
    for (const w of weights) {
      sum += w;
      this.cumulative.push(sum);
    }
    this.total = sum;
  }

  private _pickOne(): T {
    const r = this.rng.next() * this.total;
    for (let i = 0; i < this.cumulative.length; i++) {
      if (r < this.cumulative[i]) return this.items[i];
    }
    return this.items[this.items.length - 1];
  }

  sample(): T {
    return this._pickOne();
  }

  sampleN(n: number): T[] {
    const result: T[] = [];
    for (let i = 0; i < n; i++) {
      result.push(this._pickOne());
    }
    return result;
  }

  sampleWithoutReplacement(n: number): T[] {
    if (n > this.items.length) {
      throw new Error('n cannot exceed population size');
    }
    // Use a copy of weights and do n rounds of weighted selection + removal
    const remaining = [...this.items];
    const remWeights = [...this.weights];
    const result: T[] = [];

    for (let pick = 0; pick < n; pick++) {
      let total = remWeights.reduce((a, b) => a + b, 0);
      const r = this.rng.next() * total;
      let cum = 0;
      let chosen = remaining.length - 1;
      for (let i = 0; i < remaining.length; i++) {
        cum += remWeights[i];
        if (r < cum) {
          chosen = i;
          break;
        }
      }
      result.push(remaining[chosen]);
      remaining.splice(chosen, 1);
      remWeights.splice(chosen, 1);
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// AliasMethod<T> — O(1) weighted sampling
// ---------------------------------------------------------------------------
export class AliasMethod<T> {
  private items: T[];
  private prob: number[];
  private alias: number[];
  private n: number;
  private rng: SeededRandom;

  constructor(items: T[], weights: number[], seed?: number) {
    if (items.length !== weights.length) {
      throw new Error('items and weights must have the same length');
    }
    this.items = [...items];
    this.n = items.length;
    this.rng = makeRng(seed);
    this.prob = new Array(this.n).fill(0);
    this.alias = new Array(this.n).fill(0);
    this._buildTable(weights);
  }

  private _buildTable(weights: number[]): void {
    const n = this.n;
    const total = weights.reduce((a, b) => a + b, 0);
    const scaled = weights.map(w => (w / total) * n);

    const small: number[] = [];
    const large: number[] = [];

    for (let i = 0; i < n; i++) {
      if (scaled[i] < 1) small.push(i);
      else large.push(i);
    }

    while (small.length > 0 && large.length > 0) {
      const l = small.pop()!;
      const g = large.pop()!;
      this.prob[l] = scaled[l];
      this.alias[l] = g;
      scaled[g] = scaled[g] + scaled[l] - 1;
      if (scaled[g] < 1) small.push(g);
      else large.push(g);
    }

    while (large.length > 0) {
      const g = large.pop()!;
      this.prob[g] = 1;
    }
    while (small.length > 0) {
      const s = small.pop()!;
      this.prob[s] = 1;
    }
  }

  sample(): T {
    const i = this.rng.nextInt(this.n);
    const coin = this.rng.next();
    return coin < this.prob[i] ? this.items[i] : this.items[this.alias[i]];
  }

  sampleN(n: number): T[] {
    const result: T[] = [];
    for (let i = 0; i < n; i++) {
      result.push(this.sample());
    }
    return result;
  }
}

// ---------------------------------------------------------------------------
// Standalone functions
// ---------------------------------------------------------------------------

/** Reservoir sampling from a finite array */
export function reservoirSample<T>(stream: T[], k: number, seed?: number): T[] {
  const rng = makeRng(seed);
  const reservoir: T[] = [];
  for (let i = 0; i < stream.length; i++) {
    if (i < k) {
      reservoir.push(stream[i]);
    } else {
      const j = Math.floor(rng.next() * (i + 1));
      if (j < k) {
        reservoir[j] = stream[i];
      }
    }
  }
  return reservoir;
}

/** Single weighted random sample */
export function weightedSample<T>(items: T[], weights: number[], seed?: number): T {
  if (items.length === 0) throw new Error('items must not be empty');
  const rng = makeRng(seed);
  const total = weights.reduce((a, b) => a + b, 0);
  const r = rng.next() * total;
  let cum = 0;
  for (let i = 0; i < items.length; i++) {
    cum += weights[i];
    if (r < cum) return items[i];
  }
  return items[items.length - 1];
}

/** Fisher-Yates shuffle (returns a new array) */
export function shuffleArray<T>(arr: T[], seed?: number): T[] {
  const rng = makeRng(seed);
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng.next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Sample k items without replacement from population */
export function sampleWithoutReplacement<T>(population: T[], k: number, seed?: number): T[] {
  if (k > population.length) {
    throw new Error('k cannot exceed population size');
  }
  const rng = makeRng(seed);
  const copy = [...population];
  const result: T[] = [];
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(rng.next() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
    result.push(copy[i]);
  }
  return result;
}

/** Systematic sampling: evenly spaced selection of k items */
export function systematicSample<T>(population: T[], k: number): T[] {
  if (k <= 0 || population.length === 0) return [];
  if (k >= population.length) return [...population];
  const interval = population.length / k;
  const result: T[] = [];
  for (let i = 0; i < k; i++) {
    result.push(population[Math.floor(i * interval)]);
  }
  return result;
}

/** Stratified sampling: takes samplesPerStratum items from each stratum */
export function stratifiedSample<T>(strata: T[][], samplesPerStratum: number, seed?: number): T[] {
  const result: T[] = [];
  for (const stratum of strata) {
    const n = Math.min(samplesPerStratum, stratum.length);
    const sampled = sampleWithoutReplacement(stratum, n, seed);
    result.push(...sampled);
  }
  return result;
}

/** Bootstrap sample: sample with replacement, default same size as population */
export function bootstrapSample<T>(population: T[], n?: number, seed?: number): T[] {
  const size = n !== undefined ? n : population.length;
  const rng = makeRng(seed);
  const result: T[] = [];
  for (let i = 0; i < size; i++) {
    result.push(population[Math.floor(rng.next() * population.length)]);
  }
  return result;
}

/** Poisson disk sampling in a 2D rectangle */
export function poissonDiskSampling(
  width: number,
  height: number,
  minDist: number,
  seed?: number
): Array<[number, number]> {
  const rng = makeRng(seed);
  const cellSize = minDist / Math.SQRT2;
  const gridW = Math.ceil(width / cellSize);
  const gridH = Math.ceil(height / cellSize);
  const grid: Array<[number, number] | null> = new Array(gridW * gridH).fill(null);
  const active: Array<[number, number]> = [];
  const result: Array<[number, number]> = [];

  const gridIndex = (x: number, y: number) =>
    Math.floor(x / cellSize) + Math.floor(y / cellSize) * gridW;

  const place = (p: [number, number]) => {
    grid[gridIndex(p[0], p[1])] = p;
    active.push(p);
    result.push(p);
  };

  const isFarEnough = (p: [number, number]): boolean => {
    const gx = Math.floor(p[0] / cellSize);
    const gy = Math.floor(p[1] / cellSize);
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const nx = gx + dx;
        const ny = gy + dy;
        if (nx < 0 || nx >= gridW || ny < 0 || ny >= gridH) continue;
        const neighbour = grid[nx + ny * gridW];
        if (!neighbour) continue;
        const dist = Math.hypot(p[0] - neighbour[0], p[1] - neighbour[1]);
        if (dist < minDist) return false;
      }
    }
    return true;
  };

  // Initial point
  const init: [number, number] = [rng.next() * width, rng.next() * height];
  place(init);

  const MAX_ATTEMPTS = 30;
  while (active.length > 0) {
    const idx = Math.floor(rng.next() * active.length);
    const origin = active[idx];
    let found = false;
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
      const angle = rng.next() * 2 * Math.PI;
      const dist = minDist + rng.next() * minDist;
      const candidate: [number, number] = [
        origin[0] + Math.cos(angle) * dist,
        origin[1] + Math.sin(angle) * dist,
      ];
      if (
        candidate[0] >= 0 && candidate[0] < width &&
        candidate[1] >= 0 && candidate[1] < height &&
        isFarEnough(candidate)
      ) {
        place(candidate);
        found = true;
        break;
      }
    }
    if (!found) {
      active.splice(idx, 1);
    }
  }
  return result;
}

/** Latin Hypercube Sampling: returns n points in dims-dimensional [0,1]^dims space */
export function latinHypercubeSample(dims: number, n: number, seed?: number): number[][] {
  const rng = makeRng(seed);
  // For each dimension, create a permutation of [0..n-1] and add a random offset
  const result: number[][] = Array.from({ length: n }, () => new Array(dims).fill(0));

  for (let d = 0; d < dims; d++) {
    // Create indices [0, 1, ..., n-1] and shuffle them
    const indices = Array.from({ length: n }, (_, i) => i);
    // Fisher-Yates shuffle with rng
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(rng.next() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    for (let i = 0; i < n; i++) {
      result[i][d] = (indices[i] + rng.next()) / n;
    }
  }
  return result;
}
