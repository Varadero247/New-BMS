// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface FuzzyMatch<T = string> { item: T; score: number; index: number; }
export interface FuzzySearchOptions { threshold?: number; key?: string; limit?: number; caseSensitive?: boolean; }
export interface EditOperation { type: 'insert' | 'delete' | 'replace' | 'transpose'; position: number; from?: string; to?: string; }
