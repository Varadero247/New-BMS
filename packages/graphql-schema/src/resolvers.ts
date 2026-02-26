// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { Connection, Edge, PageInfo } from './types';

// ── Custom error classes ─────────────────────────────────────────────────────

export class AuthorizationError extends Error {
  readonly code = 'AUTHORIZATION_ERROR';
  constructor(message = 'Not authorised to perform this action') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  readonly code = 'NOT_FOUND';
  constructor(resource: string, id?: string) {
    super(id ? `${resource} with id "${id}" not found` : `${resource} not found`);
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends Error {
  readonly code = 'VALIDATION_ERROR';
  readonly fields: string[];
  constructor(message: string, fields: string[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

// ── Pagination helpers ───────────────────────────────────────────────────────

/**
 * Converts GraphQL cursor-based pagination args into Prisma-compatible
 * take/skip/cursor values.
 */
export function createPaginationArgs(
  first?: number,
  after?: string,
  last?: number,
  before?: string
): { take: number; skip: number; cursor?: string } {
  const DEFAULT_PAGE_SIZE = 20;
  const MAX_PAGE_SIZE = 100;

  if (last !== undefined && last !== null) {
    const take = Math.min(Math.max(last, 1), MAX_PAGE_SIZE);
    return { take: -take, skip: 0, cursor: before };
  }

  const take = Math.min(Math.max(first ?? DEFAULT_PAGE_SIZE, 1), MAX_PAGE_SIZE);
  const skip = after ? 1 : 0;
  return { take, skip, cursor: after };
}

/** Builds a Prisma-compatible orderBy object from optional sort/order args */
export function buildOrderBy(
  sort?: string,
  order?: string
): Record<string, 'asc' | 'desc'> {
  if (!sort) return { createdAt: 'desc' };
  const direction: 'asc' | 'desc' =
    order?.toLowerCase() === 'asc' ? 'asc' : 'desc';
  return { [sort]: direction };
}

/** Encodes a cursor from an item id */
function encodeCursor(id: string): string {
  return Buffer.from(`cursor:${id}`).toString('base64');
}

/**
 * Formats a list of items as a GraphQL Connection with edges and pageInfo.
 */
export function formatConnection<T extends { id: string }>(
  items: T[],
  total: number,
  args: { first?: number; after?: string }
): Connection<T> {
  const edges: Edge<T>[] = items.map((item) => ({
    node: item,
    cursor: encodeCursor(item.id),
  }));

  const pageSize = args.first ?? 20;
  const hasNextPage = items.length === pageSize && total > pageSize;
  const hasPreviousPage = Boolean(args.after);

  const pageInfo: PageInfo = {
    hasNextPage,
    hasPreviousPage,
    startCursor: edges.length > 0 ? edges[0].cursor : undefined,
    endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
    totalCount: total,
  };

  return { edges, pageInfo, totalCount: total };
}
