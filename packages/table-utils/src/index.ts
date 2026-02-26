// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type { Row, AggFn, AggSpec, JoinResult, PivotOptions, SortSpec, TableSummary, ColumnSummary } from './types';

export {
  // Basic operations
  select,
  reject,
  rename,
  addColumn,
  updateColumn,
  dropNulls,
  fillNulls,
  deduplicate,
  limit,
  offset,
  paginate,
  // Filtering
  where,
  whereEquals,
  whereIn,
  whereNotIn,
  whereBetween,
  whereLike,
  // Sorting
  orderBy,
  orderByField,
  // Aggregation
  computeAgg,
  aggregate,
  rollup,
  // Joins
  innerJoin,
  leftJoin,
  rightJoin,
  crossJoin,
  lookupJoin,
  // Pivot / unpivot
  pivot,
  unpivot,
  // Reshape
  transpose,
  flatten,
  nest,
  toKeyValue,
  fromKeyValue,
  // Statistics / summary
  getColumns,
  columnValues,
  columnStats,
  frequencyTable,
  crossTab,
  summarize,
  // Utilities
  sampleRows,
  chunk,
  zip,
  diff,
} from './table-utils';
