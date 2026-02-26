// Copyright (c) 2026 Nexara DMCC. All rights reserved. CONFIDENTIAL — TRADE SECRET.
import type { DrillDownContext, DrillLevel } from './types';

const DRILL_ORDER: DrillLevel[] = ['year', 'quarter', 'month', 'week', 'day'];

export function getNextDrillLevel(current: DrillLevel): DrillLevel | null {
  const idx = DRILL_ORDER.indexOf(current);
  return idx < DRILL_ORDER.length - 1 ? DRILL_ORDER[idx + 1] : null;
}

export function getPrevDrillLevel(current: DrillLevel): DrillLevel | null {
  const idx = DRILL_ORDER.indexOf(current);
  return idx > 0 ? DRILL_ORDER[idx - 1] : null;
}

export function buildDrillContext(
  field: string,
  value: string | number,
  level: DrillLevel,
  parentFilters: Record<string, string | number> = {}
): DrillDownContext {
  return { field, value, level, parentFilters };
}

export function applyDrillFilter(
  rows: Record<string, unknown>[],
  context: DrillDownContext
): Record<string, unknown>[] {
  return rows.filter((row) => {
    for (const [k, v] of Object.entries(context.parentFilters)) {
      if (String(row[k]) !== String(v)) return false;
    }
    return String(row[context.field]) === String(context.value);
  });
}

export function formatDrillLabel(level: DrillLevel, value: string | number): string {
  const labels: Record<DrillLevel, string> = {
    year: `Year ${value}`,
    quarter: `Q${value}`,
    month: `Month ${value}`,
    week: `Week ${value}`,
    day: `Day ${value}`,
  };
  return labels[level] ?? String(value);
}

export function isDrillable(level: DrillLevel): boolean {
  return DRILL_ORDER.indexOf(level) < DRILL_ORDER.length - 1;
}
