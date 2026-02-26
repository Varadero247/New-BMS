// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** Rounding strategy used by roundTo(). */
export type RoundingMode = 'ceil' | 'floor' | 'round' | 'trunc';

/** Descriptive statistical summary of a numeric dataset. */
export interface StatSummary {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  count: number;
}

/** An inclusive numeric range [min, max]. */
export interface NumberRange {
  min: number;
  max: number;
}

/** Options for formatNumber(). */
export interface FormatOptions {
  decimals?: number;
  prefix?: string;
  suffix?: string;
  locale?: string;
}
