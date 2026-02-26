// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.

export type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'scatter' | 'heatmap' | 'gauge' | 'funnel' | 'radar';
export type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct';
export type DrillLevel = 'year' | 'quarter' | 'month' | 'week' | 'day';

export interface DataSeries {
  name: string;
  data: number[];
  color?: string;
}

export interface ChartDataset {
  labels: string[];
  series: DataSeries[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

export interface ChartConfig {
  id: string;
  type: ChartType;
  title: string;
  dataset: ChartDataset;
  showLegend?: boolean;
  showTooltip?: boolean;
  drillEnabled?: boolean;
  thresholds?: Array<{ value: number; color: string; label: string }>;
}

export interface DashboardWidget {
  id: string;
  chartConfig: ChartConfig;
  gridCol: number;
  gridRow: number;
  width: number;
  height: number;
}

export interface DrillDownContext {
  field: string;
  value: string | number;
  level: DrillLevel;
  parentFilters: Record<string, string | number>;
}
