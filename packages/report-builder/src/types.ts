// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export type ReportFieldType = 'text' | 'number' | 'date' | 'boolean' | 'enum' | 'computed';
export type AggregationType = 'count' | 'sum' | 'avg' | 'min' | 'max' | 'distinct_count';
export type ChartType = 'bar' | 'line' | 'pie' | 'donut' | 'area' | 'scatter' | 'table' | 'kpi';
export type ReportFormat = 'pdf' | 'xlsx' | 'csv' | 'json' | 'html';

export interface ReportField {
  id: string;
  name: string;
  label: string;
  type: ReportFieldType;
  source: string; // table.column or computed expression
  format?: string; // date format, number format
  width?: number;
  visible?: boolean;
  sortable?: boolean;
  filterable?: boolean;
}

export interface ReportGroupBy {
  field: string;
  interval?: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface ReportSort {
  field: string;
  order: 'asc' | 'desc';
}

export interface ReportFilter {
  field: string;
  operator: string;
  value: unknown;
}

export interface ReportDefinition {
  id: string;
  name: string;
  description?: string;
  module: string;
  entity: string;
  fields: ReportField[];
  filters?: ReportFilter[];
  groupBy?: ReportGroupBy[];
  sort?: ReportSort[];
  chartType?: ChartType;
  chartConfig?: Record<string, unknown>;
  limit?: number;
  format?: ReportFormat;
  createdBy: string;
  createdAt: Date;
  isTemplate: boolean;
  isPublic: boolean;
}
