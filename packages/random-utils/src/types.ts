// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** A seeded pseudo-random number generator */
export interface SeededRng {
  /** Returns a float in [0, 1) */
  next(): number;
  /** Returns an integer in [min, max] inclusive */
  nextInt(min: number, max: number): number;
}

/** Options for sampling */
export interface SampleOptions {
  replacement?: boolean;
  seed?: number;
}

/** An item with an associated numeric weight */
export interface WeightedItem<T> {
  value: T;
  weight: number;
}

/** Supported UUID versions */
export type UuidVersion = 'v4' | 'v7';

/** Supported probability distributions */
export type Distribution = 'uniform' | 'normal' | 'exponential' | 'poisson';
