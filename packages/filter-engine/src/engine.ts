// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type {
  FilterCondition,
  FilterGroup,
  FilterOperator,
  FilterQuery,
  FilterResult,
  LogicalOperator,
  SortDirection,
  SortSpec,
} from './types';

const VALID_OPERATORS: FilterOperator[] = [
  'eq', 'ne', 'gt', 'gte', 'lt', 'lte',
  'contains', 'starts_with', 'ends_with',
  'in', 'not_in', 'is_null', 'is_not_null',
  'between', 'regex',
];

const VALID_LOGIC: LogicalOperator[] = ['AND', 'OR', 'NOT'];
const VALID_SORT_DIRS: SortDirection[] = ['asc', 'desc'];

export function isValidOperator(op: string): op is FilterOperator {
  return VALID_OPERATORS.includes(op as FilterOperator);
}

export function isValidLogic(l: string): l is LogicalOperator {
  return VALID_LOGIC.includes(l as LogicalOperator);
}

export function isValidSortDirection(d: string): d is SortDirection {
  return VALID_SORT_DIRS.includes(d as SortDirection);
}

export function evaluateCondition(
  item: Record<string, unknown>,
  condition: FilterCondition,
): boolean {
  const raw = item[condition.field];
  const { operator, value, value2, caseSensitive = false } = condition;

  const normalize = (v: unknown): string =>
    caseSensitive ? String(v ?? '') : String(v ?? '').toLowerCase();

  switch (operator) {
    case 'eq':
      return raw === value;
    case 'ne':
      return raw !== value;
    case 'gt':
      return typeof raw === 'number' && typeof value === 'number' && raw > value;
    case 'gte':
      return typeof raw === 'number' && typeof value === 'number' && raw >= value;
    case 'lt':
      return typeof raw === 'number' && typeof value === 'number' && raw < value;
    case 'lte':
      return typeof raw === 'number' && typeof value === 'number' && raw <= value;
    case 'contains': {
      const haystack = normalize(raw);
      const needle = normalize(value);
      return haystack.includes(needle);
    }
    case 'starts_with': {
      const haystack = normalize(raw);
      const needle = normalize(value);
      return haystack.startsWith(needle);
    }
    case 'ends_with': {
      const haystack = normalize(raw);
      const needle = normalize(value);
      return haystack.endsWith(needle);
    }
    case 'in':
      return Array.isArray(value) && value.includes(raw);
    case 'not_in':
      return Array.isArray(value) && !value.includes(raw);
    case 'is_null':
      return raw === null || raw === undefined;
    case 'is_not_null':
      return raw !== null && raw !== undefined;
    case 'between':
      return (
        typeof raw === 'number' &&
        typeof value === 'number' &&
        typeof value2 === 'number' &&
        raw >= value &&
        raw <= value2
      );
    case 'regex': {
      try {
        const flags = caseSensitive ? '' : 'i';
        const re = new RegExp(String(value), flags);
        return re.test(String(raw ?? ''));
      } catch {
        return false;
      }
    }
    default:
      return false;
  }
}

export function evaluateGroup(
  item: Record<string, unknown>,
  group: FilterGroup,
): boolean {
  const conditions = group.conditions ?? [];
  const groups = group.groups ?? [];
  const allTests: boolean[] = [
    ...conditions.map((c) => evaluateCondition(item, c)),
    ...groups.map((g) => evaluateGroup(item, g)),
  ];

  if (allTests.length === 0) return true;

  switch (group.logic) {
    case 'AND':
      return allTests.every(Boolean);
    case 'OR':
      return allTests.some(Boolean);
    case 'NOT':
      return !allTests[0];
    default:
      return true;
  }
}

export function applyFilter<T extends Record<string, unknown>>(
  data: T[],
  filter?: FilterGroup,
): T[] {
  if (!filter) return data;
  return data.filter((item) => evaluateGroup(item, filter));
}

export function applySort<T extends Record<string, unknown>>(
  data: T[],
  sort?: SortSpec[],
): T[] {
  if (!sort || sort.length === 0) return data;
  return [...data].sort((a, b) => {
    for (const spec of sort) {
      const av = a[spec.field];
      const bv = b[spec.field];
      let cmp = 0;
      if (typeof av === 'number' && typeof bv === 'number') {
        cmp = av - bv;
      } else if (typeof av === 'string' && typeof bv === 'string') {
        cmp = av.localeCompare(bv);
      } else {
        cmp = String(av ?? '').localeCompare(String(bv ?? ''));
      }
      if (cmp !== 0) return spec.direction === 'asc' ? cmp : -cmp;
    }
    return 0;
  });
}

export function applyPagination<T>(
  data: T[],
  limit?: number,
  offset?: number,
): T[] {
  const start = offset ?? 0;
  const end = limit !== undefined ? start + limit : undefined;
  return data.slice(start, end);
}

export function query<T extends Record<string, unknown>>(
  data: T[],
  q: FilterQuery,
): FilterResult<T> {
  const total = data.length;
  const filtered = applyFilter(data, q.filter);
  const sorted = applySort(filtered, q.sort);
  const paginated = applyPagination(sorted, q.limit, q.offset);
  const filteredCount = filtered.length;
  const offset = q.offset ?? 0;
  const limit = q.limit;
  const hasMore = limit !== undefined ? offset + limit < filteredCount : false;
  return { data: paginated, total, filtered: filteredCount, hasMore };
}

export function makeCondition(
  field: string,
  operator: FilterOperator,
  value?: unknown,
  value2?: unknown,
  caseSensitive?: boolean,
): FilterCondition {
  const c: FilterCondition = { field, operator };
  if (value !== undefined) c.value = value;
  if (value2 !== undefined) c.value2 = value2;
  if (caseSensitive !== undefined) c.caseSensitive = caseSensitive;
  return c;
}

export function makeGroup(
  logic: LogicalOperator,
  conditions?: FilterCondition[],
  groups?: FilterGroup[],
): FilterGroup {
  const g: FilterGroup = { logic };
  if (conditions && conditions.length > 0) g.conditions = conditions;
  if (groups && groups.length > 0) g.groups = groups;
  return g;
}

export function countMatches<T extends Record<string, unknown>>(
  data: T[],
  filter: FilterGroup,
): number {
  return applyFilter(data, filter).length;
}
