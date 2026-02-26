// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { Row, AggFn, AggSpec, PivotOptions, SortSpec, TableSummary, ColumnSummary } from './types';

// ─── Basic Operations ────────────────────────────────────────────────────────

export function select<T extends Row>(rows: T[], fields: string[]): Row[] {
  return rows.map((row) => {
    const result: Row = {};
    for (const f of fields) {
      if (Object.prototype.hasOwnProperty.call(row, f)) {
        result[f] = row[f];
      }
    }
    return result;
  });
}

export function reject<T extends Row>(rows: T[], fields: string[]): Row[] {
  const fieldSet = new Set(fields);
  return rows.map((row) => {
    const result: Row = {};
    for (const key of Object.keys(row)) {
      if (!fieldSet.has(key)) {
        result[key] = row[key];
      }
    }
    return result;
  });
}

export function rename<T extends Row>(rows: T[], mapping: Record<string, string>): Row[] {
  return rows.map((row) => {
    const result: Row = {};
    for (const key of Object.keys(row)) {
      const newKey = mapping[key] ?? key;
      result[newKey] = row[key];
    }
    return result;
  });
}

export function addColumn<T extends Row>(rows: T[], name: string, fn: (row: T, i: number) => unknown): Row[] {
  return rows.map((row, i) => ({ ...row, [name]: fn(row, i) }));
}

export function updateColumn<T extends Row>(
  rows: T[],
  name: string,
  fn: (val: unknown, row: T, i: number) => unknown,
): Row[] {
  return rows.map((row, i) => ({ ...row, [name]: fn(row[name], row, i) }));
}

export function dropNulls<T extends Row>(rows: T[], fields?: string[]): T[] {
  return rows.filter((row) => {
    const keys = fields ?? Object.keys(row);
    return keys.every((k) => row[k] !== null && row[k] !== undefined);
  });
}

export function fillNulls<T extends Row>(rows: T[], defaults: Partial<Row>): T[] {
  return rows.map((row) => {
    const result = { ...row } as Row;
    for (const [key, val] of Object.entries(defaults)) {
      if (result[key] === null || result[key] === undefined) {
        result[key] = val;
      }
    }
    return result as T;
  });
}

export function deduplicate<T extends Row>(rows: T[], keys?: string[]): T[] {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const keyStr = keys
      ? keys.map((k) => JSON.stringify(row[k])).join('|')
      : JSON.stringify(row);
    if (seen.has(keyStr)) return false;
    seen.add(keyStr);
    return true;
  });
}

export function limit<T extends Row>(rows: T[], n: number): T[] {
  return rows.slice(0, n);
}

export function offset<T extends Row>(rows: T[], n: number): T[] {
  return rows.slice(n);
}

export function paginate<T extends Row>(
  rows: T[],
  page: number,
  pageSize: number,
): { rows: T[]; total: number; page: number; pageSize: number; totalPages: number } {
  const total = rows.length;
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
  const start = (page - 1) * pageSize;
  return { rows: rows.slice(start, start + pageSize), total, page, pageSize, totalPages };
}

// ─── Filtering ───────────────────────────────────────────────────────────────

export function where<T extends Row>(rows: T[], predicate: (row: T) => boolean): T[] {
  return rows.filter(predicate);
}

export function whereEquals<T extends Row>(rows: T[], field: string, value: unknown): T[] {
  return rows.filter((row) => row[field] === value);
}

export function whereIn<T extends Row>(rows: T[], field: string, values: unknown[]): T[] {
  const set = new Set(values);
  return rows.filter((row) => set.has(row[field]));
}

export function whereNotIn<T extends Row>(rows: T[], field: string, values: unknown[]): T[] {
  const set = new Set(values);
  return rows.filter((row) => !set.has(row[field]));
}

export function whereBetween<T extends Row>(rows: T[], field: string, min: number, max: number): T[] {
  return rows.filter((row) => {
    const v = row[field] as number;
    return v >= min && v <= max;
  });
}

export function whereLike<T extends Row>(rows: T[], field: string, pattern: string): T[] {
  // Escape regex special chars, then convert % -> .* and _ -> .
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  const regexStr = escaped.replace(/%/g, '.*').replace(/_/g, '.');
  const re = new RegExp(`^${regexStr}$`, 'i');
  return rows.filter((row) => re.test(String(row[field] ?? '')));
}

// ─── Sorting ─────────────────────────────────────────────────────────────────

export function orderBy<T extends Row>(rows: T[], specs: SortSpec[]): T[] {
  return [...rows].sort((a, b) => {
    for (const spec of specs) {
      const dir = spec.direction === 'desc' ? -1 : 1;
      const nullsFirst = spec.nulls === 'first';
      const av = a[spec.field];
      const bv = b[spec.field];
      const aNull = av === null || av === undefined;
      const bNull = bv === null || bv === undefined;
      if (aNull && bNull) continue;
      if (aNull) return nullsFirst ? -1 : 1;
      if (bNull) return nullsFirst ? 1 : -1;
      if (av < bv) return -1 * dir;
      if (av > bv) return 1 * dir;
    }
    return 0;
  });
}

export function orderByField<T extends Row>(rows: T[], field: string, order?: unknown[]): T[] {
  if (!order || order.length === 0) {
    return orderBy(rows, [{ field, direction: 'asc' }]);
  }
  const indexMap = new Map(order.map((v, i) => [v, i]));
  return [...rows].sort((a, b) => {
    const ai = indexMap.has(a[field]) ? (indexMap.get(a[field]) as number) : Infinity;
    const bi = indexMap.has(b[field]) ? (indexMap.get(b[field]) as number) : Infinity;
    return ai - bi;
  });
}

// ─── Aggregation helpers ─────────────────────────────────────────────────────

export function computeAgg(values: unknown[], fn: AggFn): unknown {
  if (fn === 'count') return values.length;
  if (fn === 'first') return values.length > 0 ? values[0] : null;
  if (fn === 'last') return values.length > 0 ? values[values.length - 1] : null;
  if (fn === 'array') return values;
  if (fn === 'countDistinct') return new Set(values).size;
  const nums = values.filter((v) => v !== null && v !== undefined && !isNaN(Number(v))).map(Number);
  if (nums.length === 0) return null;
  if (fn === 'sum') return nums.reduce((a, b) => a + b, 0);
  if (fn === 'avg') return nums.reduce((a, b) => a + b, 0) / nums.length;
  if (fn === 'min') return Math.min(...nums);
  if (fn === 'max') return Math.max(...nums);
  return null;
}

export function aggregate(rows: Row[], groupBy: string[], aggs: AggSpec[]): Row[] {
  const groups = new Map<string, Row[]>();
  for (const row of rows) {
    const key = groupBy.map((k) => JSON.stringify(row[k])).join('||');
    if (!groups.has(key)) groups.set(key, []);
    (groups.get(key) as Row[]).push(row);
  }
  const result: Row[] = [];
  for (const [, groupRows] of groups) {
    const out: Row = {};
    for (const k of groupBy) out[k] = groupRows[0][k];
    for (const spec of aggs) {
      const vals = groupRows.map((r) => r[spec.field]);
      const alias = spec.alias ?? `${spec.fn}_${spec.field}`;
      out[alias] = computeAgg(vals, spec.fn);
    }
    result.push(out);
  }
  return result;
}

export function rollup(rows: Row[], groupBy: string[], aggs: AggSpec[]): Row[] {
  const result = aggregate(rows, groupBy, aggs);
  // Grand total row
  const total: Row = {};
  for (const k of groupBy) total[k] = null;
  for (const spec of aggs) {
    const vals = rows.map((r) => r[spec.field]);
    const alias = spec.alias ?? `${spec.fn}_${spec.field}`;
    total[alias] = computeAgg(vals, spec.fn);
  }
  result.push(total);
  return result;
}

// ─── Joins ───────────────────────────────────────────────────────────────────

function buildIndex<R extends Row>(right: R[], key: string): Map<unknown, R[]> {
  const idx = new Map<unknown, R[]>();
  for (const row of right) {
    const k = row[key];
    if (!idx.has(k)) idx.set(k, []);
    (idx.get(k) as R[]).push(row);
  }
  return idx;
}

export function innerJoin<L extends Row, R extends Row>(
  left: L[],
  right: R[],
  leftKey: string,
  rightKey: string,
): Row[] {
  const idx = buildIndex(right, rightKey);
  const result: Row[] = [];
  for (const lRow of left) {
    const matches = idx.get(lRow[leftKey]);
    if (matches) {
      for (const rRow of matches) {
        result.push({ ...lRow, ...rRow });
      }
    }
  }
  return result;
}

export function leftJoin<L extends Row, R extends Row>(
  left: L[],
  right: R[],
  leftKey: string,
  rightKey: string,
): Row[] {
  const idx = buildIndex(right, rightKey);
  const result: Row[] = [];
  for (const lRow of left) {
    const matches = idx.get(lRow[leftKey]);
    if (matches && matches.length > 0) {
      for (const rRow of matches) {
        result.push({ ...lRow, ...rRow });
      }
    } else {
      result.push({ ...lRow });
    }
  }
  return result;
}

export function rightJoin<L extends Row, R extends Row>(
  left: L[],
  right: R[],
  leftKey: string,
  rightKey: string,
): Row[] {
  return leftJoin(right, left, rightKey, leftKey);
}

export function crossJoin<L extends Row, R extends Row>(left: L[], right: R[]): Row[] {
  const result: Row[] = [];
  for (const lRow of left) {
    for (const rRow of right) {
      result.push({ ...lRow, ...rRow });
    }
  }
  return result;
}

export function lookupJoin<L extends Row, R extends Row>(
  left: L[],
  right: R[],
  leftKey: string,
  rightKey: string,
  fields: string[],
): Row[] {
  const idx = new Map<unknown, R>();
  for (const row of right) {
    if (!idx.has(row[rightKey])) idx.set(row[rightKey], row);
  }
  return left.map((lRow) => {
    const match = idx.get(lRow[leftKey]);
    const extra: Row = {};
    for (const f of fields) {
      extra[f] = match !== undefined ? match[f] : null;
    }
    return { ...lRow, ...extra };
  });
}

// ─── Pivot / Unpivot ─────────────────────────────────────────────────────────

export function pivot(rows: Row[], options: PivotOptions): Row[] {
  const { rows: rowKeys, columns: colField, values: valField, aggFn = 'sum' } = options;
  // Collect unique column values
  const colVals = [...new Set(rows.map((r) => String(r[colField] ?? '')))].sort();
  // Group by rowKeys
  const groups = new Map<string, Row[]>();
  const keyRows = new Map<string, Row>();
  for (const row of rows) {
    const key = rowKeys.map((k) => JSON.stringify(row[k])).join('||');
    if (!groups.has(key)) {
      groups.set(key, []);
      const seed: Row = {};
      for (const k of rowKeys) seed[k] = row[k];
      keyRows.set(key, seed);
    }
    (groups.get(key) as Row[]).push(row);
  }
  const result: Row[] = [];
  for (const [key, groupRows] of groups) {
    const out: Row = { ...(keyRows.get(key) as Row) };
    for (const cv of colVals) {
      const matching = groupRows.filter((r) => String(r[colField] ?? '') === cv);
      const vals = matching.map((r) => r[valField]);
      out[cv] = computeAgg(vals, aggFn);
    }
    result.push(out);
  }
  return result;
}

export function unpivot(rows: Row[], idFields: string[], valueField: string, nameField: string): Row[] {
  const idSet = new Set(idFields);
  const result: Row[] = [];
  for (const row of rows) {
    const idPart: Row = {};
    for (const f of idFields) idPart[f] = row[f];
    for (const col of Object.keys(row)) {
      if (!idSet.has(col)) {
        result.push({ ...idPart, [nameField]: col, [valueField]: row[col] });
      }
    }
  }
  return result;
}

// ─── Reshape ─────────────────────────────────────────────────────────────────

export function transpose(rows: Row[]): Row[] {
  if (rows.length === 0) return [];
  const cols = Object.keys(rows[0]);
  return cols.map((col) => {
    const out: Row = { field: col };
    rows.forEach((row, i) => {
      out[String(i)] = row[col];
    });
    return out;
  });
}

function flattenObj(obj: Row, prefix: string, separator: string): Row {
  const result: Row = {};
  for (const [key, val] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}${separator}${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObj(val as Row, newKey, separator));
    } else {
      result[newKey] = val;
    }
  }
  return result;
}

export function flatten(rows: Row[], separator = '.'): Row[] {
  return rows.map((row) => flattenObj(row, '', separator));
}

export function nest(rows: Row[], groupBy: string, childKey = 'children'): Row[] {
  const groups = new Map<unknown, Row[]>();
  for (const row of rows) {
    const key = row[groupBy];
    if (!groups.has(key)) groups.set(key, []);
    (groups.get(key) as Row[]).push(row);
  }
  return [...groups.entries()].map(([key, children]) => ({
    [groupBy]: key,
    [childKey]: children,
  }));
}

export function toKeyValue(rows: Row[], keyField: string, valueField: string): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const row of rows) {
    result[String(row[keyField])] = row[valueField];
  }
  return result;
}

export function fromKeyValue(map: Record<string, unknown>, keyField: string, valueField: string): Row[] {
  return Object.entries(map).map(([k, v]) => ({ [keyField]: k, [valueField]: v }));
}

// ─── Statistics / Summary ────────────────────────────────────────────────────

export function getColumns(rows: Row[]): string[] {
  const keys = new Set<string>();
  for (const row of rows) {
    for (const k of Object.keys(row)) keys.add(k);
  }
  return [...keys];
}

export function columnValues<T extends Row>(rows: T[], field: string): unknown[] {
  return rows.map((r) => r[field]);
}

export function columnStats(values: number[]): {
  min: number;
  max: number;
  sum: number;
  mean: number;
  median: number;
  stdDev: number;
} {
  if (values.length === 0) {
    return { min: NaN, max: NaN, sum: 0, mean: NaN, median: NaN, stdDev: NaN };
  }
  const sorted = [...values].sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const mean = sum / values.length;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  const stdDev = Math.sqrt(variance);
  return { min: sorted[0], max: sorted[sorted.length - 1], sum, mean, median, stdDev };
}

export function frequencyTable(
  rows: Row[],
  field: string,
): Array<{ value: unknown; count: number; pct: number }> {
  const counts = new Map<unknown, number>();
  for (const row of rows) {
    const v = row[field];
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  const total = rows.length;
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count, pct: total > 0 ? count / total : 0 }))
    .sort((a, b) => b.count - a.count);
}

export function crossTab(
  rows: Row[],
  rowField: string,
  colField: string,
  aggField: string,
  fn: AggFn = 'sum',
): Row[] {
  const colVals = [...new Set(rows.map((r) => String(r[colField] ?? '')))].sort();
  const rowGroups = new Map<unknown, Row[]>();
  for (const row of rows) {
    const k = row[rowField];
    if (!rowGroups.has(k)) rowGroups.set(k, []);
    (rowGroups.get(k) as Row[]).push(row);
  }
  const result: Row[] = [];
  for (const [rVal, rRows] of rowGroups) {
    const out: Row = { [rowField]: rVal };
    for (const cv of colVals) {
      const vals = rRows.filter((r) => String(r[colField] ?? '') === cv).map((r) => r[aggField]);
      out[cv] = computeAgg(vals, fn);
    }
    result.push(out);
  }
  return result;
}

export function summarize(rows: Row[]): TableSummary {
  if (rows.length === 0) return { rowCount: 0, columnCount: 0, columns: [] };
  const cols = getColumns(rows);
  const columns: ColumnSummary[] = cols.map((name) => {
    const vals = rows.map((r) => r[name]);
    const nonNull = vals.filter((v) => v !== null && v !== undefined);
    const nullCount = vals.length - nonNull.length;
    const distinctCount = new Set(vals.map((v) => JSON.stringify(v))).size;
    // Detect type from first non-null value
    const sample = nonNull[0];
    const type = sample === undefined ? 'null' : typeof sample;
    let min: unknown;
    let max: unknown;
    if (type === 'number') {
      const nums = nonNull.map(Number);
      min = Math.min(...nums);
      max = Math.max(...nums);
    } else if (type === 'string') {
      const strs = nonNull as string[];
      min = strs.reduce((a, b) => (a < b ? a : b));
      max = strs.reduce((a, b) => (a > b ? a : b));
    }
    return { name, type, nullCount, distinctCount, min, max };
  });
  return { rowCount: rows.length, columnCount: cols.length, columns };
}

// ─── Utilities ───────────────────────────────────────────────────────────────

export function sampleRows<T extends Row>(rows: T[], n: number, seed = 42): T[] {
  // Deterministic LCG pseudo-random
  let state = seed >>> 0;
  const rand = () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  const arr = [...rows];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, n);
}

export function chunk<T extends Row>(rows: T[], size: number): T[][] {
  if (size <= 0) return [];
  const result: T[][] = [];
  for (let i = 0; i < rows.length; i += size) {
    result.push(rows.slice(i, i + size));
  }
  return result;
}

export function zip<L extends Row, R extends Row>(left: L[], right: R[]): Row[] {
  const len = Math.max(left.length, right.length);
  const result: Row[] = [];
  for (let i = 0; i < len; i++) {
    result.push({ ...(left[i] ?? {}), ...(right[i] ?? {}) });
  }
  return result;
}

export function diff<T extends Row>(
  a: T[],
  b: T[],
  keys: string[],
): { added: T[]; removed: T[]; changed: T[] } {
  const keyOf = (row: T) => keys.map((k) => JSON.stringify(row[k])).join('||');
  const aMap = new Map<string, T>();
  const bMap = new Map<string, T>();
  for (const row of a) aMap.set(keyOf(row), row);
  for (const row of b) bMap.set(keyOf(row), row);
  const added: T[] = [];
  const removed: T[] = [];
  const changed: T[] = [];
  for (const [k, row] of bMap) {
    if (!aMap.has(k)) added.push(row);
  }
  for (const [k, row] of aMap) {
    if (!bMap.has(k)) removed.push(row);
    else if (JSON.stringify(row) !== JSON.stringify(bMap.get(k))) changed.push(row);
  }
  return { added, removed, changed };
}
