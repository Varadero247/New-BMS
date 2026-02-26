// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export type SearchEntityType =
  | 'ncr'
  | 'capa'
  | 'document'
  | 'incident'
  | 'risk'
  | 'audit'
  | 'supplier'
  | 'user'
  | 'asset'
  | 'training'
  | 'all';

export type SearchSortOrder = 'relevance' | 'date' | 'title';

export interface SearchResultItem {
  id: string;
  type: SearchEntityType;
  title: string;
  ref?: string;
  status?: string;
  createdAt?: string;
  module: string;
  url: string;
  score?: number;
  highlights?: Record<string, string[]>;
}

export interface SearchResults {
  query: string;
  totalResults: number;
  items: SearchResultItem[];
  facets?: Record<string, Array<{ value: string; count: number }>>;
  took?: number; // ms
}

export interface SearchFilters {
  type?: SearchEntityType;
  module?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  assignedTo?: string;
}

export interface SearchQuery {
  q: string;
  type?: SearchEntityType;
  limit?: number;
  offset?: number;
  sort?: SearchSortOrder;
  filters?: SearchFilters;
}

export interface SearchSuggestion {
  text: string;
  type: 'term' | 'recent' | 'entity';
}

export interface RecentSearch {
  query: string;
  timestamp: string;
  resultCount?: number;
}

export interface SearchResultGroup {
  module: string;
  label: string;
  items: SearchResultItem[];
}

export interface SearchClientOptions {
  apiUrl: string;
  timeout?: number;
  cacheMs?: number;
}
