// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { BenchmarkKPI, IndustrySegment, BenchmarkResult } from './types';
import { BENCHMARK_DATA } from './benchmark-data';

/**
 * Get benchmark data for a specific KPI and industry.
 *
 * @param kpi - Key performance indicator name
 * @param industry - Industry segment
 * @returns Benchmark result or null if not found
 */
export function getBenchmark(kpi: BenchmarkKPI, industry: IndustrySegment): BenchmarkResult | null {
  const kpiData = BENCHMARK_DATA[kpi];
  if (!kpiData) return null;

  const data = kpiData[industry];
  if (!data) return null;

  return {
    kpi,
    industry,
    average: data.average,
    bestInClass: data.bestInClass,
    median: data.median,
    unit: data.unit,
    lowerIsBetter: data.lowerIsBetter,
  };
}

/**
 * Calculate what percentile a value falls in relative to industry benchmarks.
 * Uses linear interpolation between known benchmark points.
 *
 * @param value - The actual value to benchmark
 * @param kpi - KPI name
 * @param industry - Industry segment
 * @returns Percentile (0-100), where higher is better performance
 */
export function calculatePercentile(
  value: number,
  kpi: BenchmarkKPI,
  industry: IndustrySegment
): number {
  const kpiData = BENCHMARK_DATA[kpi];
  if (!kpiData) return 50;

  const data = kpiData[industry];
  if (!data) return 50;

  const { average: _average, bestInClass, worstInClass, lowerIsBetter } = data;

  // Normalize: for lowerIsBetter, invert so we can treat uniformly
  let normalizedValue: number;
  let normalizedBest: number;
  let _normalizedWorst: number;

  if (lowerIsBetter) {
    // Lower is better: best = lowest value, worst = highest value
    // Percentile: the lower the value, the higher the percentile
    normalizedValue = worstInClass - value;
    normalizedBest = worstInClass - bestInClass;
    _normalizedWorst = 0;
  } else {
    // Higher is better
    normalizedValue = value - worstInClass;
    normalizedBest = bestInClass - worstInClass;
    _normalizedWorst = 0;
  }

  if (normalizedBest === 0) return 50;

  const percentile = (normalizedValue / normalizedBest) * 100;
  return Math.max(0, Math.min(100, Math.round(percentile)));
}

/**
 * Generate a human-readable narrative comparing a value to industry benchmarks.
 *
 * @param value - The actual value
 * @param kpi - KPI name
 * @param industry - Industry segment
 * @returns Narrative string
 */
export function generateBenchmarkNarrative(
  value: number,
  kpi: BenchmarkKPI,
  industry: IndustrySegment
): string {
  const benchmark = getBenchmark(kpi, industry);
  if (!benchmark) {
    return `No benchmark data available for ${kpi} in ${industry}.`;
  }

  const percentile = calculatePercentile(value, kpi, industry);
  const kpiLabel = formatKPILabel(kpi);
  const industryLabel = industry.replace(/_/g, ' ');

  const comparison = benchmark.lowerIsBetter
    ? value < benchmark.average
      ? 'better'
      : 'worse'
    : value > benchmark.average
      ? 'better'
      : 'worse';

  const _vsAverage = benchmark.lowerIsBetter
    ? value < benchmark.average
      ? 'below'
      : 'above'
    : value > benchmark.average
      ? 'above'
      : 'below';

  let performance: string;
  if (percentile >= 90) {
    performance = 'best-in-class';
  } else if (percentile >= 75) {
    performance = 'above average';
  } else if (percentile >= 50) {
    performance = 'average';
  } else if (percentile >= 25) {
    performance = 'below average';
  } else {
    performance = 'significantly below average';
  }

  return (
    `Your ${kpiLabel} (${value}${benchmark.unit === '%' ? '%' : ' ' + benchmark.unit}) is ${comparison} than ${percentile}% of ${industryLabel} companies. ` +
    `This is ${performance}, with the industry average at ${benchmark.average}${benchmark.unit === '%' ? '%' : ' ' + benchmark.unit}. ` +
    `Best-in-class is ${benchmark.bestInClass}${benchmark.unit === '%' ? '%' : ' ' + benchmark.unit}.`
  );
}

function formatKPILabel(kpi: BenchmarkKPI): string {
  const labels: Record<BenchmarkKPI, string> = {
    ltifr: 'LTIFR',
    trir: 'TRIR',
    dpmo: 'DPMO',
    firstPassYield: 'First Pass Yield',
    capaCloseRate: 'CAPA Close Rate',
    auditPassRate: 'Audit Pass Rate',
    carbonIntensity: 'Carbon Intensity',
    genderPayGap: 'Gender Pay Gap',
    trainingCompliance: 'Training Compliance',
    supplierNCRRate: 'Supplier NCR Rate',
  };
  return labels[kpi] || kpi;
}
