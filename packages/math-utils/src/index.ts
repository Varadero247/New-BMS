// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type { Vector, Matrix, StatsSummary, RegressionResult, DistributionParams, Fraction } from './types';

export {
  // Number theory
  gcd,
  lcm,
  isPrime,
  primes,
  factors,
  fibonacci,
  factorial,
  binomial,
  // Numeric helpers
  clamp,
  lerp,
  inverseLerp,
  mapRange,
  roundTo,
  truncateTo,
  toFraction,
  // Statistics
  sum,
  mean,
  median,
  mode,
  variance,
  stdDev,
  coefficientOfVariation,
  skewness,
  kurtosis,
  percentile,
  quartiles,
  iqr,
  zScore,
  normalize,
  standardize,
  covariance,
  correlation,
  linearRegression,
  movingAverage,
  exponentialMovingAverage,
  // Vectors
  dotProduct,
  crossProduct3d,
  magnitude,
  normalize2,
  vectorAdd,
  vectorSubtract,
  vectorScale,
} from './math-utils';
