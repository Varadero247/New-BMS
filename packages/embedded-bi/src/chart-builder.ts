// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.
import type { ChartType, ChartConfig, ChartDataset, DataSeries, AggregationType } from './types';

export const VALID_CHART_TYPES: ChartType[] = [
  'line', 'bar', 'pie', 'donut', 'area', 'scatter', 'heatmap', 'gauge', 'funnel', 'radar',
];

export function isValidChartType(type: string): type is ChartType {
  return VALID_CHART_TYPES.includes(type as ChartType);
}

export function buildChartConfig(
  id: string,
  type: ChartType,
  title: string,
  dataset: ChartDataset,
  opts: Partial<Omit<ChartConfig, 'id' | 'type' | 'title' | 'dataset'>> = {}
): ChartConfig {
  return {
    id,
    type,
    title,
    dataset,
    showLegend: true,
    showTooltip: true,
    drillEnabled: false,
    ...opts,
  };
}

export function buildEmptyDataset(labels: string[] = [], seriesNames: string[] = []): ChartDataset {
  return {
    labels,
    series: seriesNames.map((name) => ({ name, data: labels.map(() => 0) })),
  };
}

export function aggregateData(
  rows: Record<string, unknown>[],
  groupByKey: string,
  valueKey: string,
  aggregation: AggregationType
): { label: string; value: number }[] {
  const grouped = new Map<string, number[]>();
  for (const row of rows) {
    const label = String(row[groupByKey] ?? 'Unknown');
    const val = Number(row[valueKey] ?? 0);
    const existing = grouped.get(label) ?? [];
    existing.push(val);
    grouped.set(label, existing);
  }

  const result: { label: string; value: number }[] = [];
  for (const [label, vals] of grouped) {
    let value: number;
    switch (aggregation) {
      case 'count': value = vals.length; break;
      case 'sum': value = vals.reduce((s, v) => s + v, 0); break;
      case 'avg': value = vals.reduce((s, v) => s + v, 0) / vals.length; break;
      case 'min': value = Math.min(...vals); break;
      case 'max': value = Math.max(...vals); break;
      case 'distinct': value = new Set(vals).size; break;
      default: value = vals.length;
    }
    result.push({ label, value });
  }
  return result.sort((a, b) => a.label.localeCompare(b.label));
}

export function buildSeriesFromAggregation(
  data: { label: string; value: number }[],
  seriesName: string,
  color?: string
): DataSeries {
  return {
    name: seriesName,
    data: data.map((d) => d.value),
    color,
  };
}

export function validateChartConfig(config: ChartConfig): string[] {
  const errors: string[] = [];
  if (!config.id) errors.push('Chart id is required');
  if (!config.title) errors.push('Chart title is required');
  if (!isValidChartType(config.type)) errors.push(`Invalid chart type: ${config.type}`);
  if (!config.dataset) errors.push('Chart dataset is required');
  if (!config.dataset?.labels?.length) errors.push('Chart dataset must have labels');
  if (!config.dataset?.series?.length) errors.push('Chart dataset must have at least one series');
  return errors;
}

export function normalizeSeriesData(series: DataSeries, maxValue: number): DataSeries {
  if (maxValue === 0) return { ...series, data: series.data.map(() => 0) };
  return { ...series, data: series.data.map((v) => Math.round((v / maxValue) * 100) / 100) };
}

export function getChartColors(count: number): string[] {
  const palette = [
    '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed',
    '#0891b2', '#be185d', '#65a30d', '#ea580c', '#0f766e',
  ];
  const result: string[] = [];
  for (let i = 0; i < count; i++) result.push(palette[i % palette.length]);
  return result;
}

export function mergeDatasets(a: ChartDataset, b: ChartDataset): ChartDataset {
  const allLabels = Array.from(new Set([...a.labels, ...b.labels])).sort();
  return {
    labels: allLabels,
    series: [...a.series, ...b.series],
    xAxisLabel: a.xAxisLabel ?? b.xAxisLabel,
    yAxisLabel: a.yAxisLabel ?? b.yAxisLabel,
  };
}
