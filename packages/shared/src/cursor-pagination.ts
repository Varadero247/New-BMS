// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Cursor-based pagination utility for Prisma.
 *
 * Provides an alternative to offset-based pagination that scales better
 * for large datasets. Uses Prisma's native cursor/skip/take pattern.
 *
 * Usage:
 * ```typescript
 * import { parseCursorParams, buildCursorQuery, formatCursorResult } from '@ims/shared';
 *
 * const params = parseCursorParams(req.query);
 * const query = buildCursorQuery(params);
 * const items = await prisma.risk.findMany({ ...query, where: { status: 'ACTIVE' } });
 * const result = formatCursorResult(items, params);
 * res.json({ success: true, data: result.data, meta: result.meta });
 * ```
 */

// ============================================
// TYPES
// ============================================

export interface CursorPaginationParams {
  /** Cursor ID to paginate after (exclusive) */
  cursor?: string;
  /** Number of items to fetch (default: 20, max: 100) */
  limit: number;
  /** Sort direction (default: 'desc') */
  direction: 'asc' | 'desc';
  /** Field to sort/cursor by (default: 'createdAt') */
  sortBy: string;
}

export interface CursorPaginationMeta {
  /** Number of items returned */
  count: number;
  /** Requested limit */
  limit: number;
  /** Whether there are more items after this page */
  hasMore: boolean;
  /** Cursor for the next page (last item's ID), null if no more pages */
  nextCursor: string | null;
  /** Cursor for the previous page (first item's ID), null if first page */
  prevCursor: string | null;
}

export interface CursorPaginationResult<T> {
  data: T[];
  meta: CursorPaginationMeta;
}

export interface PrismaCursorQuery {
  take: number;
  skip?: number;
  cursor?: { id: string };
  orderBy: Record<string, 'asc' | 'desc'>;
}

// ============================================
// FUNCTIONS
// ============================================

/**
 * Parse cursor pagination parameters from a query string object.
 *
 * Supports:
 * - `cursor` - ID of the last item from the previous page
 * - `limit` - Number of items per page (1-100, default 20)
 * - `direction` - Sort direction ('asc' or 'desc', default 'desc')
 * - `sortBy` - Field to sort by (default 'createdAt')
 */
export function parseCursorParams(query: Record<string, any>): CursorPaginationParams {
  const cursor =
    typeof query.cursor === 'string' && query.cursor.length > 0 ? query.cursor : undefined;

  const rawLimit = parseInt(query.limit as string, 10);
  const limit = Number.isNaN(rawLimit) ? 20 : Math.min(Math.max(1, rawLimit), 100);

  const direction: 'asc' | 'desc' = query.direction === 'asc' ? 'asc' : 'desc';

  const sortBy =
    typeof query.sortBy === 'string' && query.sortBy.length > 0 ? query.sortBy : 'createdAt';

  return { cursor, limit, direction, sortBy };
}

/**
 * Build a Prisma-compatible query object for cursor-based pagination.
 *
 * Returns `take`, `skip`, `cursor`, and `orderBy` that can be spread
 * into a Prisma `findMany` call.
 *
 * We fetch `limit + 1` items to detect if there are more pages,
 * then trim the extra item in `formatCursorResult`.
 */
export function buildCursorQuery(params: CursorPaginationParams): PrismaCursorQuery {
  const query: PrismaCursorQuery = {
    // Fetch one extra to detect hasMore
    take: params.limit + 1,
    orderBy: { [params.sortBy]: params.direction },
  };

  if (params.cursor) {
    query.cursor = { id: params.cursor };
    query.skip = 1; // Skip the cursor item itself
  }

  return query;
}

/**
 * Format the result of a cursor-paginated query into a standardized
 * response with data and meta.
 *
 * Expects the items to have been fetched with `limit + 1` (from `buildCursorQuery`).
 * Trims the extra item and computes `hasMore` and `nextCursor`.
 */
export function formatCursorResult<T extends { id: string }>(
  items: T[],
  params: CursorPaginationParams
): CursorPaginationResult<T> {
  const hasMore = items.length > params.limit;
  const data = hasMore ? items.slice(0, params.limit) : items;

  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : null;

  const prevCursor = params.cursor ?? null;

  return {
    data,
    meta: {
      count: data.length,
      limit: params.limit,
      hasMore,
      nextCursor,
      prevCursor,
    },
  };
}
