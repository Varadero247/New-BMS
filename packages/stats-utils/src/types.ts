// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface DescriptiveStats {
  count: number;
  mean: number;
  median: number;
  mode: number[];
  std: number;
  variance: number;
  min: number;
  max: number;
  range: number;
  skewness: number;
  kurtosis: number;
  q1: number;
  q3: number;
  iqr: number;
  sum: number;
}

export interface HypothesisTestResult {
  statistic: number;
  pValue: number;
  reject: boolean;
  confidenceInterval?: [number, number];
  degreesOfFreedom?: number;
}

export interface RegressionResult {
  slope: number;
  intercept: number;
  r2: number;
  residuals: number[];
  predict: (x: number) => number;
}

export interface CorrelationResult {
  pearson: number;
  spearman: number;
}

export interface HistogramResult {
  bins: number[];
  counts: number[];
  density: number[];
}
