// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { ReportDefinition, ReportFilter, ReportSort, ReportGroupBy } from './types';

export interface BuiltQuery {
  entity: string;
  select: string[];
  where: Array<{ field: string; operator: string; value: unknown }>;
  groupBy: string[];
  orderBy: Array<{ field: string; order: 'asc' | 'desc' }>;
  limit: number;
  aggregations: Array<{ field: string; type: string; alias: string }>;
}

/** Builds a structured query object (not raw SQL) from a ReportDefinition. */
export function buildQuery(report: ReportDefinition): BuiltQuery {
  const select = report.fields
    .filter((f) => f.visible !== false)
    .map((f) => f.source);

  const where = (report.filters ?? []).map((f: ReportFilter) => ({
    field: f.field,
    operator: f.operator,
    value: f.value,
  }));

  const groupBy = (report.groupBy ?? []).map((g: ReportGroupBy) => g.field);

  const orderBy = (report.sort ?? []).map((s: ReportSort) => ({
    field: s.field,
    order: s.order,
  }));

  const aggregations = report.fields
    .filter((f) => f.type === 'computed' && f.source.includes('('))
    .map((f) => ({
      field: f.source,
      type: f.source.split('(')[0].toUpperCase(),
      alias: f.name,
    }));

  return {
    entity: report.entity,
    select,
    where,
    groupBy,
    orderBy,
    limit: report.limit ?? 1000,
    aggregations,
  };
}

/** Adds a filter condition to an existing BuiltQuery (immutable). */
export function addFilter(
  query: BuiltQuery,
  filter: { field: string; operator: string; value: unknown }
): BuiltQuery {
  return { ...query, where: [...query.where, filter] };
}

/** Adds a sort clause to an existing BuiltQuery (immutable). */
export function addSort(query: BuiltQuery, field: string, order: 'asc' | 'desc'): BuiltQuery {
  return { ...query, orderBy: [...query.orderBy, { field, order }] };
}
