// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Shared type utilities across all IMS services.
 * Eliminates the need for `any` in common patterns.
 *
 * Note: ApiResponse, PaginationMeta, and parsePagination are defined
 * in index.ts. This module provides additional complementary types.
 */

import type { ApiResponse, PaginationMeta } from './index';

/** Paginated API response */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}

/** Authenticated request user shape */
export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'USER' | 'VIEWER';
  organisationId?: string;
}

/** Parse pagination params from query string (with take alias for Prisma) */
export function parsePaginationWithTake(query: Record<string, unknown>): {
  page: number;
  limit: number;
  skip: number;
  take: number;
} {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  return { page, limit, skip: (page - 1) * limit, take: limit };
}
