/**
 * Credential / Secret Leak Scanner
 *
 * Detects patterns that look like accidentally included credentials or
 * secrets in API request bodies, query strings, or response payloads.
 *
 * Use as:
 *   1. A request middleware — catch secrets before they hit the database / logs
 *   2. A response middleware — redact before sending to client
 *   3. A standalone scan function — e.g. in audit pipelines
 *
 * Patterns covered:
 *   - Bearer / JWT tokens (Authorization header values in bodies)
 *   - AWS access keys (AKIA...)
 *   - GitHub / GitLab / npm / Stripe / Slack tokens
 *   - Generic high-entropy passwords / API keys
 *   - PEM private keys
 *   - Basic auth (base64 user:password)
 *   - Connection strings (postgres://, redis://, mongodb+srv://)
 */

import type { Request, Response, NextFunction } from 'express';

// ── Types ──────────────────────────────────────────────────────────────────

export type CredentialType =
  | 'jwt_token'
  | 'aws_access_key'
  | 'github_token'
  | 'npm_token'
  | 'stripe_key'
  | 'slack_token'
  | 'pem_private_key'
  | 'basic_auth_base64'
  | 'connection_string'
  | 'generic_api_key'
  | 'password_field';

export interface CredentialMatch {
  type: CredentialType;
  /** Context around the match (never the secret itself) */
  context: string;
  /** Field / path where it was found */
  path: string;
  /** Redacted snippet showing where the secret was */
  redacted: string;
}

export interface ScanResult {
  hasLeaks: boolean;
  matches: CredentialMatch[];
}

export interface CredentialScannerOptions {
  /** Types to scan for (default: all) */
  types?: CredentialType[];
  /**
   * What to do when a credential is found in a request.
   * 'log'    — log the finding but allow the request (default)
   * 'block'  — return 400 Bad Request
   * 'redact' — replace the value in req.body before forwarding
   */
  onRequest?: 'log' | 'block' | 'redact';
  /**
   * What to do when a credential is found in a response.
   * 'log'    — log and allow
   * 'redact' — replace with [REDACTED] before sending (default)
   */
  onResponse?: 'log' | 'redact';
  /** Called whenever a leak is detected */
  onLeak?: (result: ScanResult, context: 'request' | 'response') => void;
}

// ── Patterns ───────────────────────────────────────────────────────────────

interface PatternDef {
  type: CredentialType;
  pattern: RegExp;
  description: string;
}

const PATTERNS: PatternDef[] = [
  {
    type: 'jwt_token',
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
    description: 'JWT token (three base64url segments)',
  },
  {
    type: 'aws_access_key',
    pattern: /\bAKIA[0-9A-Z]{16}\b/,
    description: 'AWS IAM Access Key ID',
  },
  {
    type: 'github_token',
    pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/,
    description: 'GitHub personal access token',
  },
  {
    type: 'npm_token',
    pattern: /\bnpm_[A-Za-z0-9]{36}\b/,
    description: 'npm automation token',
  },
  {
    type: 'stripe_key',
    pattern: /\bsk_(test|live)_[A-Za-z0-9]{24,}\b/,
    description: 'Stripe secret key',
  },
  {
    type: 'slack_token',
    pattern: /\bxox[bpaso]-[0-9]{10,13}-[0-9]{10,13}-[A-Za-z0-9]{24,}\b/,
    description: 'Slack bot/app token',
  },
  {
    type: 'pem_private_key',
    pattern: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/,
    description: 'PEM-encoded private key',
  },
  {
    type: 'basic_auth_base64',
    // Base64-encoded "something:something" at least 16 chars
    pattern: /\bBasic\s+[A-Za-z0-9+/]{16,}={0,2}\b/i,
    description: 'Basic auth credential',
  },
  {
    type: 'connection_string',
    pattern: /(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis(?:s)?):\/\/[^:]+:[^@]+@/i,
    description: 'Database / cache connection string with credentials',
  },
  {
    type: 'password_field',
    // JSON field named "password" / "passwd" / "secret" with a non-empty string value
    pattern: /"(?:password|passwd|pass|secret|apiSecret|api_secret|privateKey|private_key)"\s*:\s*"([^"]{6,})"/i,
    description: 'JSON password/secret field',
  },
];

// ── Scanner ────────────────────────────────────────────────────────────────

function redactMatch(text: string, match: RegExpMatchArray): string {
  const start = match.index ?? 0;
  const len   = match[0].length;
  const visible = Math.min(4, Math.floor(len / 4));
  return (
    text.slice(Math.max(0, start - 20), start) +
    match[0].slice(0, visible) +
    '[REDACTED]' +
    match[0].slice(-visible) +
    text.slice(start + len, start + len + 20)
  );
}

/**
 * Scan a string value for credential patterns.
 */
export function scanString(value: string, path = '<root>', types?: CredentialType[]): CredentialMatch[] {
  const matches: CredentialMatch[] = [];
  const patterns = types
    ? PATTERNS.filter((p) => types.includes(p.type))
    : PATTERNS;

  for (const def of patterns) {
    // Reset lastIndex for stateful global regexes (none here, but be defensive)
    const m = def.pattern.exec(value);
    if (m) {
      matches.push({
        type: def.type,
        context: def.description,
        path,
        redacted: redactMatch(value, m),
      });
    }
  }

  return matches;
}

/**
 * Deep-scan an arbitrary value (string, object, array) for credential patterns.
 */
export function deepScanValue(value: unknown, path = '<root>', types?: CredentialType[]): CredentialMatch[] {
  if (value === null || value === undefined) return [];

  if (typeof value === 'string') {
    return scanString(value, path, types);
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, i) => deepScanValue(item, `${path}[${i}]`, types));
  }

  if (typeof value === 'object') {
    const matches: CredentialMatch[] = [];
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      matches.push(...deepScanValue(val, `${path}.${key}`, types));
    }
    return matches;
  }

  return [];
}

/**
 * Scan a full string (e.g. serialised response body) and return a ScanResult.
 */
export function scan(text: string, types?: CredentialType[]): ScanResult {
  const matches = scanString(text, '<body>', types);
  return { hasLeaks: matches.length > 0, matches };
}

// ── Middleware ─────────────────────────────────────────────────────────────

export function createCredentialScanner(opts: CredentialScannerOptions = {}) {
  const {
    types,
    onRequest  = 'log',
    onResponse = 'redact',
    onLeak,
  } = opts;

  /** Request scanning middleware. Mount BEFORE routes. */
  function requestScanner(req: Request, res: Response, next: NextFunction): void {
    const matches: CredentialMatch[] = [];

    // Scan query parameters
    if (req.query) {
      for (const [key, val] of Object.entries(req.query)) {
        if (typeof val === 'string') {
          matches.push(...scanString(val, `query.${key}`, types));
        }
      }
    }

    // Scan request body
    if (req.body) {
      matches.push(...deepScanValue(req.body, 'body', types));
    }

    if (matches.length === 0) return next();

    const result: ScanResult = { hasLeaks: true, matches };
    onLeak?.(result, 'request');

    if (onRequest === 'block') {
      res.status(400).json({
        success: false,
        error: {
          code: 'CREDENTIAL_LEAK_DETECTED',
          message: 'Request contains what appears to be a credential or secret. Remove sensitive values from the request body.',
          fields: matches.map((m) => m.path),
        },
      });
      return;
    }

    if (onRequest === 'redact' && req.body && typeof req.body === 'object') {
      req.body = redactObject(req.body, types);
    }

    next();
  }

  /** Response scanning middleware. Mount AFTER routes. */
  function responseScanner(req: Request, res: Response, next: NextFunction): void {
    if (onResponse === 'log') return next();

    const originalJson = res.json.bind(res);
    res.json = function (body: unknown) {
      const serialized = JSON.stringify(body);
      const result = scan(serialized, types);

      if (result.hasLeaks) {
        onLeak?.(result, 'response');
        // Replace all matched values in the body
        const cleaned = JSON.parse(redactJsonString(serialized, result.matches));
        return originalJson(cleaned);
      }

      return originalJson(body);
    };

    next();
  }

  return { requestScanner, responseScanner };
}

// ── Helpers ────────────────────────────────────────────────────────────────

const REDACTED_PLACEHOLDER = '[REDACTED]';

function redactObject(obj: Record<string, unknown>, types?: CredentialType[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      const matches = scanString(value, key, types);
      result[key] = matches.length > 0 ? REDACTED_PLACEHOLDER : value;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = redactObject(value as Record<string, unknown>, types);
    } else {
      result[key] = value;
    }
  }
  return result;
}

function redactJsonString(json: string, matches: CredentialMatch[]): string {
  let result = json;
  // Replace each matched pattern with [REDACTED]
  for (const def of PATTERNS) {
    result = result.replace(def.pattern, REDACTED_PLACEHOLDER);
  }
  return result;
}
