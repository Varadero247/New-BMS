// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
export interface NLQQuery {
  original: string;
  sanitized: string;
  sql: string;
  params: unknown[];
  modules: string[];
  confidence: number;
}

export interface NLQResult {
  query: NLQQuery;
  success: boolean;
  error?: string;
}

export interface NLQPermissionContext {
  userId: string;
  role: string;
  modulePermissions: Record<string, number>;
}

export interface QueryPattern {
  patterns: RegExp[];
  sql: string;
  modules: string[];
  description: string;
  extractParams?: (match: RegExpMatchArray) => any[];
}
