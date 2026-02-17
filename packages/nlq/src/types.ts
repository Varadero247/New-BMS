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
