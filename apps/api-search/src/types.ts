// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export type SearchEntityType =
  | 'all'
  | 'ncr'
  | 'capa'
  | 'document'
  | 'incident'
  | 'risk'
  | 'audit'
  | 'supplier'
  | 'user'
  | 'asset'
  | 'training';

export type SearchSortOrder = 'relevance' | 'date' | 'title';

export interface SearchResultItem {
  id: string;
  type: SearchEntityType;
  title: string;
  ref?: string;
  status?: string;
  description?: string;
  createdAt: string;
  module: string;
  url: string;
  score?: number;
}

export interface SearchResults {
  items: SearchResultItem[];
  total: number;
  limit: number;
  offset: number;
  query: string;
  type: SearchEntityType;
}

export interface SearchQuery {
  q: string;
  type?: SearchEntityType;
  limit?: number;
  offset?: number;
  sort?: SearchSortOrder;
}

export interface SuggestQuery {
  q: string;
  limit?: number;
}

export interface SuggestResult {
  suggestions: string[];
}

export interface RecentSearch {
  query: string;
  timestamp: string;
  type?: SearchEntityType;
}

export interface SearchAdapter {
  search(query: SearchQuery): Promise<SearchResults>;
  suggest(query: SuggestQuery): Promise<SuggestResult>;
}
