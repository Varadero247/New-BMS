// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** A comparison function returning negative, zero, or positive. */
export type CompareFn<T> = (a: T, b: T) => number;

/** Sort direction. */
export type SortOrder = 'asc' | 'desc';

/** A key of T that is used for sorting. */
export type SortKey<T> = keyof T;

/** Configuration for a single sort criterion. */
export interface SortConfig<T> {
  key: SortKey<T>;
  order?: SortOrder;
}

/** Result from a search operation. */
export interface SearchResult {
  index: number;
  found: boolean;
}

/** Options for binary search variants. */
export interface BinarySearchOptions<T> {
  low?: number;
  high?: number;
  compareFn?: CompareFn<T>;
}
