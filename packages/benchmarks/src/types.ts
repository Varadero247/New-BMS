// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export type IndustrySegment =
  | 'manufacturing'
  | 'construction'
  | 'services'
  | 'automotive'
  | 'healthcare'
  | 'food_beverage'
  | 'energy'
  | 'technology'
  | 'logistics'
  | 'retail';

export type BenchmarkKPI =
  | 'ltifr'
  | 'trir'
  | 'dpmo'
  | 'firstPassYield'
  | 'capaCloseRate'
  | 'auditPassRate'
  | 'carbonIntensity'
  | 'genderPayGap'
  | 'trainingCompliance'
  | 'supplierNCRRate';

export interface BenchmarkDataPoint {
  industry: IndustrySegment;
  average: number;
  bestInClass: number;
  worstInClass: number;
  median: number;
  unit: string;
  lowerIsBetter: boolean;
}

export interface BenchmarkResult {
  kpi: BenchmarkKPI;
  industry: IndustrySegment;
  average: number;
  bestInClass: number;
  median: number;
  unit: string;
  lowerIsBetter: boolean;
}

export interface PercentileResult {
  value: number;
  percentile: number;
  kpi: BenchmarkKPI;
  industry: IndustrySegment;
  narrative: string;
}
