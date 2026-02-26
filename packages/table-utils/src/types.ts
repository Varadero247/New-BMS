// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export type Row = Record<string, unknown>;
export type AggFn = 'sum' | 'count' | 'avg' | 'min' | 'max' | 'first' | 'last' | 'countDistinct' | 'array';
export interface AggSpec { field: string; fn: AggFn; alias?: string; }
export interface JoinResult<L extends Row, R extends Row> extends Row { _left: L; _right: R | null; }
export interface PivotOptions { rows: string[]; columns: string; values: string; aggFn?: AggFn; }
export interface SortSpec { field: string; direction?: 'asc' | 'desc'; nulls?: 'first' | 'last'; }
export interface TableSummary { rowCount: number; columnCount: number; columns: ColumnSummary[]; }
export interface ColumnSummary { name: string; type: string; nullCount: number; distinctCount: number; min?: unknown; max?: unknown; }
