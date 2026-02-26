// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { CursorRequest, CursorResult, OffsetRequest, OffsetResult, PageRequest, PageResult, SortDirection } from './types';

export function clampPage(page: number): number {
  return Math.max(1, Math.floor(page));
}

export function clampPageSize(size: number, min = 1, max = 1000): number {
  return Math.max(min, Math.min(max, Math.floor(size)));
}

export function totalPages(total: number, pageSize: number): number {
  if (pageSize <= 0) return 0;
  return Math.ceil(total / pageSize);
}

export function getOffset(page: number, pageSize: number): number {
  return (clampPage(page) - 1) * pageSize;
}

export function sortData<T extends Record<string, unknown>>(
  data: T[],
  field: string,
  direction: SortDirection = 'asc',
): T[] {
  return [...data].sort((a, b) => {
    const av = a[field];
    const bv = b[field];
    let cmp = 0;
    if (typeof av === 'number' && typeof bv === 'number') {
      cmp = av - bv;
    } else {
      cmp = String(av ?? '').localeCompare(String(bv ?? ''));
    }
    return direction === 'asc' ? cmp : -cmp;
  });
}

export function paginate<T extends Record<string, unknown>>(
  data: T[],
  req: PageRequest,
): PageResult<T> {
  const page = clampPage(req.page);
  const pageSize = clampPageSize(req.pageSize);
  const sorted =
    req.sortField
      ? sortData(data, req.sortField, req.sortDirection ?? 'asc')
      : data;
  const total = sorted.length;
  const tp = totalPages(total, pageSize);
  const offset = getOffset(page, pageSize);
  const slice = sorted.slice(offset, offset + pageSize);
  return {
    data: slice,
    page,
    pageSize,
    total,
    totalPages: tp,
    hasNext: page < tp,
    hasPrev: page > 1,
    nextPage: page < tp ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null,
  };
}

export function paginateOffset<T>(
  data: T[],
  req: OffsetRequest,
): OffsetResult<T> {
  const offset = Math.max(0, req.offset);
  const limit = Math.max(1, req.limit);
  const total = data.length;
  const slice = data.slice(offset, offset + limit);
  return {
    data: slice,
    offset,
    limit,
    total,
    hasMore: offset + limit < total,
  };
}

export function encodeCursor(id: string | number): string {
  return Buffer.from(String(id)).toString('base64');
}

export function decodeCursor(cursor: string): string {
  try {
    return Buffer.from(cursor, 'base64').toString('utf8');
  } catch {
    return cursor;
  }
}

export function paginateCursor<T extends Record<string, unknown>>(
  data: T[],
  req: CursorRequest,
  idField = 'id',
): CursorResult<T> {
  const limit = Math.max(1, req.limit);
  const total = data.length;

  if (!req.cursor) {
    const slice = data.slice(0, limit);
    const last = slice[slice.length - 1];
    const nextCursor = slice.length === limit && slice.length < total
      ? encodeCursor(String(last?.[idField] ?? ''))
      : null;
    return { data: slice, nextCursor, prevCursor: null, hasMore: nextCursor !== null, total };
  }

  const decodedId = decodeCursor(req.cursor);
  const idx = data.findIndex((item) => String(item[idField]) === decodedId);
  const start = idx === -1 ? 0 : idx + 1;
  const slice = data.slice(start, start + limit);
  const last = slice[slice.length - 1];
  const nextCursor = slice.length === limit && start + limit < total
    ? encodeCursor(String(last?.[idField] ?? ''))
    : null;
  const prevCursor = start > 0
    ? encodeCursor(String(data[start - 1]?.[idField] ?? ''))
    : null;
  return {
    data: slice,
    nextCursor,
    prevCursor,
    hasMore: nextCursor !== null,
    total,
  };
}

export function isValidPageRequest(req: unknown): req is PageRequest {
  if (!req || typeof req !== 'object') return false;
  const r = req as Record<string, unknown>;
  return typeof r['page'] === 'number' && r['page'] >= 1 &&
    typeof r['pageSize'] === 'number' && r['pageSize'] >= 1;
}

export function isValidOffsetRequest(req: unknown): req is OffsetRequest {
  if (!req || typeof req !== 'object') return false;
  const r = req as Record<string, unknown>;
  return typeof r['offset'] === 'number' && r['offset'] >= 0 &&
    typeof r['limit'] === 'number' && r['limit'] >= 1;
}

export function buildPageMeta(result: PageResult<unknown>): {
  current: number;
  total: number;
  pageSize: number;
  totalItems: number;
  range: [number, number];
} {
  const start = getOffset(result.page, result.pageSize) + 1;
  const end = Math.min(start + result.pageSize - 1, result.total);
  return {
    current: result.page,
    total: result.totalPages,
    pageSize: result.pageSize,
    totalItems: result.total,
    range: [start, end],
  };
}
