export type SortDirection = 'asc' | 'desc';

export interface PageRequest {
  page: number;    // 1-based
  pageSize: number;
  sortField?: string;
  sortDirection?: SortDirection;
}

export interface PageResult<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface CursorRequest {
  cursor?: string;
  limit: number;
  direction?: 'forward' | 'backward';
}

export interface CursorResult<T> {
  data: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
  total: number;
}

export interface OffsetRequest {
  offset: number;
  limit: number;
}

export interface OffsetResult<T> {
  data: T[];
  offset: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
