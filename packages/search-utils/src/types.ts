// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface SearchDocument { id: string; [field: string]: unknown; }
export interface SearchResult<T extends SearchDocument = SearchDocument> { document: T; score: number; highlights?: Record<string, string>; }
export interface IndexOptions { fields: string[]; stopWords?: string[]; stemming?: boolean; caseSensitive?: boolean; }
export interface QueryToken { type: 'term' | 'phrase' | 'must' | 'must_not' | 'wildcard'; value: string; }
export interface SearchOptions { limit?: number; offset?: number; fields?: string[]; fuzzy?: boolean; highlight?: boolean; }
export interface IndexStats { documentCount: number; termCount: number; avgDocLength: number; }
