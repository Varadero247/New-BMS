// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** A numeric array representing a mathematical vector. */
export type Vector = number[];

/** A 2D numeric array representing a matrix (rows of columns). */
export type Matrix = number[][];

/** Summary statistics for a dataset. */
export interface StatsSummary {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[];
  variance: number;
  stdDev: number;
  min: number;
  max: number;
  q1: number;
  q2: number;
  q3: number;
  iqr: number;
  skewness: number;
  kurtosis: number;
}

/** Result of a simple linear regression. */
export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
}

/** Parameters describing a probability distribution. */
export interface DistributionParams {
  mean: number;
  stdDev: number;
  min?: number;
  max?: number;
}

/** A rational fraction representation. */
export interface Fraction {
  numerator: number;
  denominator: number;
}
