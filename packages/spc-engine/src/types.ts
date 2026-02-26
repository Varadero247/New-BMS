// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface DataPoint {
  value: number;
  timestamp: Date;
  subgroup?: number;
}

export interface PlottedPoint {
  value: number;
  timestamp: Date;
  subgroup?: number;
  index: number;
  outOfControl: boolean;
  violationRules: string[];
}

export interface ControlChart {
  type: 'XBAR_R' | 'XBAR_S' | 'IMR' | 'P' | 'NP' | 'C' | 'U';
  ucl: number;
  lcl: number;
  centerLine: number;
  dataPoints: PlottedPoint[];
  outOfControl: OutOfControlPoint[];
  // For Xbar-R, also include range chart
  rangeUcl?: number;
  rangeLcl?: number;
  rangeCenterLine?: number;
  rangePoints?: PlottedPoint[];
}

export interface OutOfControlPoint {
  index: number;
  value: number;
  rules: string[];
}

export interface CapabilityResult {
  cp: number;
  cpk: number;
  pp: number;
  ppk: number;
  sigma: number;
  mean: number;
  status: 'CAPABLE' | 'MARGINAL' | 'INCAPABLE'; // >=1.67 | 1.33-1.67 | <1.33
}

export interface Violation {
  pointIndex: number;
  rule: string;
  description: string;
}

export interface PChartDataPoint {
  defectives: number;
  sampleSize: number;
  timestamp: Date;
}
