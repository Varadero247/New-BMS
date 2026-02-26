// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { randomBytes as cryptoRandomBytes } from 'crypto';
import type { SeededRng, WeightedItem } from './types';

// ---------------------------------------------------------------------------
// Seeded RNG — Mulberry32 PRNG
// ---------------------------------------------------------------------------

/**
 * Creates a Mulberry32 seeded PRNG. Deterministic given the same seed.
 */
export function createRng(seed: number): SeededRng {
  let s = seed >>> 0; // treat as unsigned 32-bit
  return {
    next(): number {
      s += 0x6d2b79f5;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      t = (t ^ (t >>> 14)) >>> 0;
      return t / 0x100000000;
    },
    nextInt(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
  };
}

/**
 * Deterministic Fisher-Yates shuffle using a seeded RNG. Returns a new array.
 */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = arr.slice();
  const rng = createRng(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = rng.nextInt(0, i);
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
}

/**
 * Sample n items without replacement using a seeded RNG. Returns a new array.
 */
export function seededSample<T>(arr: T[], n: number, seed: number): T[] {
  const copy = arr.slice();
  const rng = createRng(seed);
  const count = Math.min(n, copy.length);
  for (let i = copy.length - 1; i > copy.length - 1 - count; i--) {
    const j = rng.nextInt(0, i);
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy.slice(copy.length - count);
}

// ---------------------------------------------------------------------------
// Crypto-quality randomness
// ---------------------------------------------------------------------------

/**
 * Generates a UUID v4 (random) formatted as 8-4-4-4-12.
 */
export function randomUuid(): string {
  const buf = cryptoRandomBytes(16);
  // Set version bits (v4)
  buf[6] = (buf[6]! & 0x0f) | 0x40;
  // Set variant bits
  buf[8] = (buf[8]! & 0x3f) | 0x80;
  const hex = buf.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

/**
 * Returns n random bytes as a Buffer.
 */
export function randomBytes(n: number): Buffer {
  return cryptoRandomBytes(n);
}

/**
 * Returns a string of n random hex characters (uses n/2 bytes, rounded up).
 */
export function randomHex(n: number): string {
  const bytes = Math.ceil(n / 2);
  return cryptoRandomBytes(bytes).toString('hex').slice(0, n);
}

/**
 * Generates a URL-safe random token of the given character length (default 32).
 * Uses base64url encoding stripped of padding.
 */
export function randomToken(length = 32): string {
  const bytes = Math.ceil(length * 3 / 4) + 1;
  const raw = cryptoRandomBytes(bytes)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
  return raw.slice(0, length);
}

// ---------------------------------------------------------------------------
// Basic random utilities (Math.random based)
// ---------------------------------------------------------------------------

/**
 * Returns a random integer in [min, max] inclusive.
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Returns a random float in [min, max).
 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Returns true with the given probability (default 0.5).
 */
export function randomBool(probability = 0.5): boolean {
  return Math.random() < probability;
}

/**
 * Returns a random element from arr. Throws if arr is empty.
 */
export function randomElement<T>(arr: T[]): T {
  if (arr.length === 0) throw new Error('randomElement: array must not be empty');
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

/**
 * Returns n elements picked with replacement from arr.
 */
export function randomElements<T>(arr: T[], n: number): T[] {
  if (arr.length === 0) throw new Error('randomElements: array must not be empty');
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    result.push(arr[Math.floor(Math.random() * arr.length)] as T);
  }
  return result;
}

/**
 * Picks n distinct elements without replacement using partial Fisher-Yates.
 * Returns a new array.
 */
export function sample<T>(arr: T[], n: number): T[] {
  if (n > arr.length) throw new Error('sample: n cannot exceed array length');
  const copy = arr.slice();
  for (let i = copy.length - 1; i > copy.length - 1 - n; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy.slice(copy.length - n);
}

/**
 * Returns a new shuffled array (Fisher-Yates).
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j] as T, result[i] as T];
  }
  return result;
}

/**
 * Picks one item from a weighted list.
 */
export function weightedRandom<T>(items: WeightedItem<T>[]): T {
  if (items.length === 0) throw new Error('weightedRandom: items must not be empty');
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight <= 0) throw new Error('weightedRandom: total weight must be positive');
  let rand = Math.random() * totalWeight;
  for (const item of items) {
    rand -= item.weight;
    if (rand <= 0) return item.value;
  }
  return (items[items.length - 1] as WeightedItem<T>).value;
}

/**
 * Picks n items from a weighted list with replacement.
 */
export function weightedSample<T>(items: WeightedItem<T>[], n: number): T[] {
  const result: T[] = [];
  for (let i = 0; i < n; i++) {
    result.push(weightedRandom(items));
  }
  return result;
}

// ---------------------------------------------------------------------------
// Distributions
// ---------------------------------------------------------------------------

/**
 * Box-Muller transform: returns a normally-distributed random number.
 */
export function normalRandom(mean = 0, std = 1): number {
  let u: number, v: number;
  do {
    u = Math.random();
    v = Math.random();
  } while (u === 0);
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * std + mean;
}

/**
 * Returns a random number following an exponential distribution with the given rate.
 */
export function exponentialRandom(rate = 1): number {
  if (rate <= 0) throw new Error('exponentialRandom: rate must be positive');
  let u: number;
  do {
    u = Math.random();
  } while (u === 0);
  return -Math.log(u) / rate;
}

/**
 * Returns a Poisson-distributed random integer using Knuth's algorithm.
 */
export function poissonRandom(lambda: number): number {
  if (lambda <= 0) throw new Error('poissonRandom: lambda must be positive');
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

/**
 * Returns a uniformly-distributed random number in [min, max).
 */
export function uniformRandom(min = 0, max = 1): number {
  return Math.random() * (max - min) + min;
}

// ---------------------------------------------------------------------------
// String / data generation
// ---------------------------------------------------------------------------

const DEFAULT_CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Returns a random string of given length from the given charset (default alphanumeric).
 */
export function randomString(length: number, charset = DEFAULT_CHARSET): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}

const EMAIL_DOMAINS = ['example.com', 'mail.test', 'demo.io', 'random.org', 'sample.net'];

/**
 * Returns a plausible random email address.
 */
export function randomEmail(): string {
  const user = randomString(8, 'abcdefghijklmnopqrstuvwxyz0123456789');
  const domain = randomElement(EMAIL_DOMAINS);
  return `${user}@${domain}`;
}

const FIRST_NAMES = [
  'Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry',
  'Isabel', 'James', 'Karen', 'Liam', 'Mia', 'Noah', 'Olivia', 'Peter',
  'Quinn', 'Rachel', 'Sam', 'Tanya', 'Uma', 'Victor', 'Wendy', 'Xavier',
  'Yasmine', 'Zara',
];

const LAST_NAMES = [
  'Smith', 'Jones', 'Williams', 'Taylor', 'Brown', 'Davies', 'Evans',
  'Wilson', 'Thomas', 'Roberts', 'Johnson', 'Lewis', 'Walker', 'Robinson',
  'Wood', 'Thompson', 'White', 'Watson', 'Jackson', 'Wright',
];

/**
 * Returns a random first + last name from built-in lists.
 */
export function randomName(): string {
  return `${randomElement(FIRST_NAMES)} ${randomElement(LAST_NAMES)}`;
}

/**
 * Returns a random Date between start and end (defaults: 2000-01-01 to now).
 */
export function randomDate(
  start = new Date('2000-01-01'),
  end = new Date(),
): Date {
  const startMs = start.getTime();
  const endMs = end.getTime();
  return new Date(startMs + Math.random() * (endMs - startMs));
}

/**
 * Returns a random CSS hex color string (#RRGGBB).
 */
export function randomColor(): string {
  const r = randomInt(0, 255).toString(16).padStart(2, '0');
  const g = randomInt(0, 255).toString(16).padStart(2, '0');
  const b = randomInt(0, 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

/**
 * Returns a random IPv4 address string.
 */
export function randomIp(): string {
  return [
    randomInt(1, 254),
    randomInt(0, 255),
    randomInt(0, 255),
    randomInt(1, 254),
  ].join('.');
}

/**
 * Returns a random UK phone number in the format 07XXX XXXXXX.
 */
export function randomPhoneUk(): string {
  const mid = randomInt(100, 999);
  const end = randomInt(100000, 999999);
  return `07${mid} ${end}`;
}

// ---------------------------------------------------------------------------
// Statistics helpers
// ---------------------------------------------------------------------------

/**
 * Returns the arithmetic mean of an array of numbers.
 */
export function mean(samples: number[]): number {
  if (samples.length === 0) throw new Error('mean: samples must not be empty');
  return samples.reduce((a, b) => a + b, 0) / samples.length;
}

/**
 * Returns the sample standard deviation (Bessel's correction, n-1 denominator).
 */
export function stdDevSamples(samples: number[]): number {
  if (samples.length < 2) throw new Error('stdDevSamples: need at least 2 samples');
  const m = mean(samples);
  const variance = samples.reduce((sum, x) => sum + (x - m) ** 2, 0) / (samples.length - 1);
  return Math.sqrt(variance);
}

/**
 * Returns a frequency histogram (array of bin counts) for the given samples.
 */
export function histogram(samples: number[], bins: number): number[] {
  if (bins < 1) throw new Error('histogram: bins must be >= 1');
  if (samples.length === 0) return new Array(bins).fill(0) as number[];
  const min = Math.min(...samples);
  const max = Math.max(...samples);
  const counts = new Array(bins).fill(0) as number[];
  const range = max - min;
  if (range === 0) {
    counts[0] = samples.length;
    return counts;
  }
  for (const s of samples) {
    const idx = Math.min(Math.floor(((s - min) / range) * bins), bins - 1);
    counts[idx]++;
  }
  return counts;
}
