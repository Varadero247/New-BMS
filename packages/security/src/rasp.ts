// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Runtime Application Self-Protection (RASP)
 *
 * Express middleware that detects common injection attack patterns in real-time
 * and blocks malicious requests before they reach route handlers.
 *
 * Detects:
 *   - SQL Injection
 *   - Cross-Site Scripting (XSS)
 *   - Command Injection
 *   - Path Traversal
 *   - LDAP Injection
 */

import type { Request, Response, NextFunction } from 'express';

export type RaspThreatType =
  | 'sql_injection'
  | 'xss'
  | 'command_injection'
  | 'path_traversal'
  | 'ldap_injection';

export interface RaspThreat {
  type: RaspThreatType;
  field: string;
  value: string;
  pattern: string;
}

export interface RaspOptions {
  /** Which threat types to detect. Defaults to all. */
  threats?: RaspThreatType[];
  /** Called when a threat is detected (before blocking). Useful for logging. */
  onThreat?: (threat: RaspThreat, req: Request) => void;
  /** When true, log but don't block (monitoring mode). Default: false. */
  monitorOnly?: boolean;
}

// ── Detection patterns ─────────────────────────────────────────────────────────

const SQL_INJECTION_PATTERNS: RegExp[] = [
  /(\bUNION\b.{0,30}\bSELECT\b)/i,
  /(\bSELECT\b.{0,30}\bFROM\b)/i,
  /(\bINSERT\b.{0,30}\bINTO\b)/i,
  /(\bDELETE\b.{0,30}\bFROM\b)/i,
  /(\bDROP\b.{0,20}\bTABLE\b)/i,
  /(\bDROP\b.{0,20}\bDATABASE\b)/i,
  /(\bTRUNCATE\b.{0,20}\bTABLE\b)/i,
  /(\bEXEC\b.{0,10}\()/i,
  /(\bEXECUTE\b.{0,10}\()/i,
  /(;\s*(DROP|DELETE|TRUNCATE|ALTER|CREATE)\b)/i,
  /('|\\")\s*(OR|AND)\s*('|\\"|1|true)/i,
  /(--(?:\s|$)|\/\*[\s\S]*?\*\/)/,
  /(\bSLEEP\s*\(|\bWAITFOR\s+DELAY\b|\bBENCHMARK\s*\(|\bPG_SLEEP\s*\()/i,
];

const XSS_PATTERNS: RegExp[] = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/i,
  /<script[^>]*>/i,
  /javascript\s*:/i,
  /vbscript\s*:/i,
  /on\w+\s*=\s*["']?[^"'>]*/i,
  /<\s*iframe[^>]*>/i,
  /<\s*img[^>]+src\s*=\s*["']?javascript/i,
  /expression\s*\(/i,
  /data\s*:\s*text\/html/i,
  /<\s*object[^>]*>/i,
  /<\s*embed[^>]*>/i,
];

const COMMAND_INJECTION_PATTERNS: RegExp[] = [
  /[;&|`].*(?:ls|cat|rm|curl|wget|bash|sh|python|perl|ruby|php)\b/i,
  /\$\(.*\)/,
  /`[^`]+`/,
  /\|\s*(?:ls|cat|rm|curl|wget|bash|sh|python|nc|ncat)\b/i,
  /(?:;|\|\|?|&&)\s*(?:echo|printf|id|whoami|uname|pwd)\b/i,
];

const PATH_TRAVERSAL_PATTERNS: RegExp[] = [
  /\.\.\/|\.\.\\|\.\.\%2[fF]/,
  /%2e%2e%2f|%2e%2e\/|\.\.%2f/i,
  /\.\.[\/\\]/,
  /%c0%ae|%c0%af|%c1%9c/i, // Unicode path traversal encodings
];

const LDAP_INJECTION_PATTERNS: RegExp[] = [
  /[)(\\*\x00]/,
  /\(\s*\|/,
  /\(\s*&/,
  /\bldap:\/\//i,
];

const PATTERNS: Record<RaspThreatType, RegExp[]> = {
  sql_injection: SQL_INJECTION_PATTERNS,
  xss: XSS_PATTERNS,
  command_injection: COMMAND_INJECTION_PATTERNS,
  path_traversal: PATH_TRAVERSAL_PATTERNS,
  ldap_injection: LDAP_INJECTION_PATTERNS,
};

// ── Detection logic ────────────────────────────────────────────────────────────

/**
 * Scan a string value against patterns for a given threat type.
 * Returns the matching pattern string, or null if clean.
 */
export function scanValue(value: string, threatType: RaspThreatType): string | null {
  const patterns = PATTERNS[threatType];
  for (const pattern of patterns) {
    if (pattern.test(value)) {
      return pattern.toString();
    }
  }
  return null;
}

/**
 * Recursively extract all string values from a request body, query, or params object.
 */
function extractStrings(obj: unknown, prefix = ''): Array<{ field: string; value: string }> {
  if (typeof obj === 'string') {
    return [{ field: prefix || 'value', value: obj }];
  }
  if (Array.isArray(obj)) {
    return obj.flatMap((item, i) => extractStrings(item, `${prefix}[${i}]`));
  }
  if (obj && typeof obj === 'object') {
    return Object.entries(obj as Record<string, unknown>).flatMap(([key, val]) =>
      extractStrings(val, prefix ? `${prefix}.${key}` : key)
    );
  }
  return [];
}

/**
 * Scan an entire request for injection threats.
 */
export function scanRequest(req: Request, threats: RaspThreatType[]): RaspThreat[] {
  const sources = [
    { source: req.body, prefix: 'body' },
    { source: req.query, prefix: 'query' },
    { source: req.params, prefix: 'params' },
  ];

  const detected: RaspThreat[] = [];

  for (const { source, prefix } of sources) {
    if (!source) continue;
    const fields = extractStrings(source, prefix);

    for (const { field, value } of fields) {
      for (const threat of threats) {
        const pattern = scanValue(value, threat);
        if (pattern) {
          detected.push({ type: threat, field, value: value.slice(0, 200), pattern });
        }
      }
    }
  }

  return detected;
}

// ── Middleware factory ─────────────────────────────────────────────────────────

const ALL_THREATS: RaspThreatType[] = [
  'sql_injection',
  'xss',
  'command_injection',
  'path_traversal',
  'ldap_injection',
];

/**
 * Create a RASP middleware for an Express app.
 *
 * @example
 * ```ts
 * import { createRasp } from '@ims/security';
 * app.use(createRasp({
 *   onThreat: (threat, req) => logger.warn('RASP threat', { threat, path: req.path }),
 * }));
 * ```
 */
export function createRasp(opts: RaspOptions = {}) {
  const { threats = ALL_THREATS, onThreat, monitorOnly = false } = opts;

  return (req: Request, res: Response, next: NextFunction): void => {
    const detected = scanRequest(req, threats);

    if (detected.length === 0) {
      next();
      return;
    }

    // Notify for all detected threats
    for (const threat of detected) {
      onThreat?.(threat, req);
    }

    if (monitorOnly) {
      next();
      return;
    }

    res.status(400).json({
      error: 'REQUEST_BLOCKED',
      message: 'Request blocked by security policy',
      code: detected[0].type,
    });
  };
}
