// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { NLQQuery, NLQPermissionContext } from './types';
import { QUERY_PATTERNS } from './patterns';

// SQL injection patterns to strip.
// The /gi flags are safe here: String.prototype.replace() with /g resets lastIndex
// internally, so there is no cross-call state bug (unlike RegExp.exec/test).
const INJECTION_PATTERNS = [
  /;\s*DROP\s+/gi,
  /;\s*DELETE\s+/gi,
  /;\s*UPDATE\s+/gi,
  /;\s*INSERT\s+/gi,
  /;\s*ALTER\s+/gi,
  /;\s*CREATE\s+/gi,
  /;\s*TRUNCATE\s+/gi,
  /UNION\s+SELECT/gi,
  /--/g,
  /\/\*[\s\S]*?\*\//g,
  /xp_/gi,
  /exec\s*\(/gi,
  /EXECUTE\s+/gi,
  /INTO\s+OUTFILE/gi,
  /LOAD_FILE/gi,
];

/**
 * Sanitize a natural language query by removing potential SQL injection patterns.
 * @param query - Raw query string from user
 * @returns Sanitized query string
 */
export function sanitizeQuery(query: string): string {
  let sanitized = query.trim();

  for (const pattern of INJECTION_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }

  // Remove any remaining semicolons
  sanitized = sanitized.replace(/;/g, '');

  // Remove excessive whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
}

/**
 * Parse a natural language query into SQL using pattern matching.
 *
 * @param query - Natural language query string
 * @param context - User permission context for authorization checks
 * @returns Parsed query with SQL, params, and required modules
 */
export function parseNaturalLanguage(query: string, context: NLQPermissionContext): NLQQuery {
  const sanitized = sanitizeQuery(query);

  // Try to match against known patterns
  for (const pattern of QUERY_PATTERNS) {
    for (const regex of pattern.patterns) {
      const match = sanitized.match(regex);
      if (match) {
        // Check permissions before returning
        const hasPermission = validateQueryPermissions(pattern.modules, context.modulePermissions);

        if (!hasPermission) {
          return {
            original: query,
            sanitized,
            sql: '',
            params: [],
            modules: pattern.modules,
            confidence: 0,
          };
        }

        const params = pattern.extractParams ? pattern.extractParams(match) : [];

        return {
          original: query,
          sanitized,
          sql: pattern.sql,
          params,
          modules: pattern.modules,
          confidence: 0.9,
        };
      }
    }
  }

  // No pattern matched
  return {
    original: query,
    sanitized,
    sql: '',
    params: [],
    modules: [],
    confidence: 0,
  };
}

/**
 * Validate that a user has permissions for all required modules.
 *
 * @param modules - Array of module names required by the query
 * @param userPermissions - User's permission levels per module (0-6)
 * @returns true if user has at least VIEW (level 1) on all required modules
 */
export function validateQueryPermissions(
  modules: string[],
  userPermissions: Record<string, number>
): boolean {
  if (modules.length === 0) return true;

  return modules.every((module) => {
    const level = userPermissions[module];
    // Need at least VIEW (level 1) permission
    return level !== undefined && level >= 1;
  });
}
