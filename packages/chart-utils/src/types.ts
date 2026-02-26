// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export interface DataPoint {
  x: number | string;
  y: number;
  label?: string;
  color?: string;
  meta?: Record<string, unknown>;
}

export interface Series {
  name: string;
  data: DataPoint[];
  color?: string;
  type?: 'line' | 'bar' | 'area' | 'scatter' | 'pie';
}

export interface ChartData {
  series: Series[];
  xLabels?: string[];
  title?: string;
  subtitle?: string;
}

export type TimeUnit = 'minute' | 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year';

export type AggregateMethod =
  | 'sum'
  | 'average'
  | 'min'
  | 'max'
  | 'count'
  | 'first'
  | 'last'
  | 'median'
  | 'stddev';

export interface BucketedData {
  label: string;
  value: number;
  count: number;
  from: number;
  to: number;
}

export interface HeatmapCell {
  x: string;
  y: string;
  value: number;
}

export interface PieSlice {
  label: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface Outlier {
  index: number;
  value: number;
  zscore: number;
}

export interface TrendResult {
  slope: number;
  intercept: number;
  r2: number;
  direction: 'up' | 'down' | 'flat';
  forecast: (x: number) => number;
}

export interface MovingAverage {
  period: number;
  values: number[];
}
