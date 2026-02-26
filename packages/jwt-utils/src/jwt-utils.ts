// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import * as crypto from 'crypto';
import {
  JwtAlgorithm,
  JwtHeader,
  JwtPayload,
  JwtParts,
  SignOptions,
  VerifyOptions,
  VerifyResult,
} from './types';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

const ALG_TO_HASH: Record<JwtAlgorithm, string> = {
  HS256: 'sha256',
  HS384: 'sha384',
  HS512: 'sha512',
};

// ---------------------------------------------------------------------------
// Base64URL encode / decode
// ---------------------------------------------------------------------------

export function base64urlEncode(data: string | Buffer): string {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64urlDecode(encoded: string): string {
  return base64urlDecodeBuffer(encoded).toString('utf8');
}

export function base64urlDecodeBuffer(encoded: string): Buffer {
  const padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const padded2 = pad === 0 ? padded : padded + '='.repeat(4 - pad);
  return Buffer.from(padded2, 'base64');
}

// ---------------------------------------------------------------------------
// Internal sign helper
// ---------------------------------------------------------------------------

function hmacSign(algorithm: JwtAlgorithm, key: string, data: string): string {
  return crypto
    .createHmac(ALG_TO_HASH[algorithm], key)
    .update(data)
    .digest('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// ---------------------------------------------------------------------------
// sign
// ---------------------------------------------------------------------------

export function sign(payload: JwtPayload, secret: string, options: SignOptions = {}): string {
  const alg: JwtAlgorithm = options.algorithm ?? 'HS256';
  const header: JwtHeader = { alg, typ: 'JWT' };

  const now = Math.floor(Date.now() / 1000);
  const claims: JwtPayload = { ...payload, iat: now };

  if (options.expiresIn !== undefined) claims.exp = now + options.expiresIn;
  if (options.notBefore !== undefined) claims.nbf = now + options.notBefore;
  if (options.issuer !== undefined) claims.iss = options.issuer;
  if (options.subject !== undefined) claims.sub = options.subject;
  if (options.audience !== undefined) claims.aud = options.audience;
  if (options.jwtid !== undefined) claims.jti = options.jwtid;

  const headerPart = base64urlEncode(JSON.stringify(header));
  const payloadPart = base64urlEncode(JSON.stringify(claims));
  const signingInput = `${headerPart}.${payloadPart}`;
  const sig = hmacSign(alg, secret, signingInput);

  return `${signingInput}.${sig}`;
}

// ---------------------------------------------------------------------------
// decode (no verify)
// ---------------------------------------------------------------------------

export function decode(token: string): JwtParts | null {
  if (typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const headerRaw = base64urlDecode(parts[0]);
    const payloadRaw = base64urlDecode(parts[1]);
    const header = JSON.parse(headerRaw) as JwtHeader;
    const payload = JSON.parse(payloadRaw) as JwtPayload;
    return { header, payload, signature: parts[2], raw: token };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// verify
// ---------------------------------------------------------------------------

export function verify(token: string, secret: string, options: VerifyOptions = {}): VerifyResult {
  const parts = token.split('.');
  if (parts.length !== 3) return { valid: false, error: 'Malformed token' };

  let header: JwtHeader;
  let payload: JwtPayload;
  try {
    header = JSON.parse(base64urlDecode(parts[0])) as JwtHeader;
    payload = JSON.parse(base64urlDecode(parts[1])) as JwtPayload;
  } catch {
    return { valid: false, error: 'Failed to parse token' };
  }

  // Algorithm check
  const alg = header.alg as JwtAlgorithm;
  if (!ALG_TO_HASH[alg]) return { valid: false, error: `Unsupported algorithm: ${alg}` };
  if (options.algorithms && options.algorithms.length > 0 && !options.algorithms.includes(alg)) {
    return { valid: false, error: `Algorithm ${alg} not allowed` };
  }

  // Signature check
  const signingInput = `${parts[0]}.${parts[1]}`;
  const expected = hmacSign(alg, secret, signingInput);
  let sigMatch = false;
  try {
    const expectedBuf = Buffer.from(expected, 'utf8');
    const actualBuf = Buffer.from(parts[2], 'utf8');
    if (expectedBuf.length === actualBuf.length) {
      sigMatch = crypto.timingSafeEqual(expectedBuf, actualBuf);
    }
  } catch {
    sigMatch = false;
  }
  if (!sigMatch) return { valid: false, error: 'Invalid signature' };

  const now = Math.floor(Date.now() / 1000);
  const tolerance = options.clockTolerance ?? 0;

  // Expiration check
  if (!options.ignoreExpiration && payload.exp !== undefined) {
    if (now > payload.exp + tolerance) {
      return { valid: false, error: 'Token has expired' };
    }
  }

  // Not-before check
  if (payload.nbf !== undefined && now < payload.nbf - tolerance) {
    return { valid: false, error: 'Token not yet valid' };
  }

  // Issuer check
  if (options.issuer !== undefined && payload.iss !== options.issuer) {
    return { valid: false, error: 'Invalid issuer' };
  }

  // Audience check
  if (options.audience !== undefined) {
    const expected_aud = Array.isArray(options.audience) ? options.audience : [options.audience];
    const token_aud = Array.isArray(payload.aud) ? payload.aud : payload.aud ? [payload.aud] : [];
    const hasAud = expected_aud.some((a) => token_aud.includes(a));
    if (!hasAud) return { valid: false, error: 'Invalid audience' };
  }

  // Subject check
  if (options.subject !== undefined && payload.sub !== options.subject) {
    return { valid: false, error: 'Invalid subject' };
  }

  return { valid: true, payload };
}

// ---------------------------------------------------------------------------
// Inspection helpers
// ---------------------------------------------------------------------------

export function isExpired(token: string, clockTolerance = 0): boolean {
  const parts = decode(token);
  if (!parts || parts.payload.exp === undefined) return false;
  const now = Math.floor(Date.now() / 1000);
  return now > parts.payload.exp + clockTolerance;
}

export function getExpiry(token: string): Date | null {
  const parts = decode(token);
  if (!parts || parts.payload.exp === undefined) return null;
  return new Date(parts.payload.exp * 1000);
}

export function getIssuedAt(token: string): Date | null {
  const parts = decode(token);
  if (!parts || parts.payload.iat === undefined) return null;
  return new Date(parts.payload.iat * 1000);
}

export function getSubject(token: string): string | null {
  const parts = decode(token);
  if (!parts || parts.payload.sub === undefined) return null;
  return parts.payload.sub;
}

export function getIssuer(token: string): string | null {
  const parts = decode(token);
  if (!parts || parts.payload.iss === undefined) return null;
  return parts.payload.iss;
}

export function getAudience(token: string): string | string[] | null {
  const parts = decode(token);
  if (!parts || parts.payload.aud === undefined) return null;
  return parts.payload.aud;
}

export function getClaims(token: string): JwtPayload | null {
  const parts = decode(token);
  if (!parts) return null;
  return parts.payload;
}

export function getRemainingSeconds(token: string): number {
  const parts = decode(token);
  if (!parts || parts.payload.exp === undefined) return 0;
  const now = Math.floor(Date.now() / 1000);
  return parts.payload.exp - now;
}

export function getAlgorithm(token: string): JwtAlgorithm | null {
  const parts = decode(token);
  if (!parts) return null;
  const alg = parts.header.alg;
  if (!ALG_TO_HASH[alg]) return null;
  return alg;
}

// ---------------------------------------------------------------------------
// Token manipulation
// ---------------------------------------------------------------------------

export function refresh(
  token: string,
  secret: string,
  ttl: number,
  verifyOptions?: VerifyOptions,
): string | null {
  const result = verify(token, secret, verifyOptions);
  if (!result.valid || !result.payload) return null;
  const { exp: _exp, iat: _iat, ...rest } = result.payload;
  const decoded = decode(token);
  if (!decoded) return null;
  const alg = decoded.header.alg;
  return sign(rest, secret, { algorithm: alg, expiresIn: ttl });
}

export function addClaims(
  token: string,
  secret: string,
  extra: Record<string, unknown>,
): string | null {
  const result = verify(token, secret);
  if (!result.valid || !result.payload) return null;
  const decoded = decode(token);
  if (!decoded) return null;
  const alg = decoded.header.alg;
  const { iat: _iat, exp: _exp, ...rest } = result.payload;
  const merged: JwtPayload = { ...rest, ...extra };
  const opts: SignOptions = { algorithm: alg };
  if (result.payload.exp !== undefined) {
    const remaining = result.payload.exp - Math.floor(Date.now() / 1000);
    if (remaining > 0) opts.expiresIn = remaining;
  }
  return sign(merged, secret, opts);
}

export function stripClaims(
  token: string,
  secret: string,
  keys: string[],
): string | null {
  const result = verify(token, secret);
  if (!result.valid || !result.payload) return null;
  const decoded = decode(token);
  if (!decoded) return null;
  const alg = decoded.header.alg;
  const { iat: _iat, exp: _exp, ...rest } = result.payload;
  const stripped: JwtPayload = { ...rest };
  for (const k of keys) {
    delete stripped[k];
  }
  const opts: SignOptions = { algorithm: alg };
  if (result.payload.exp !== undefined) {
    const remaining = result.payload.exp - Math.floor(Date.now() / 1000);
    if (remaining > 0) opts.expiresIn = remaining;
  }
  return sign(stripped, secret, opts);
}

// ---------------------------------------------------------------------------
// Payload builders
// ---------------------------------------------------------------------------

export function buildAccessToken(
  sub: string,
  roles: string[],
  extra: Record<string, unknown> = {},
): JwtPayload {
  return { sub, roles, type: 'access', ...extra };
}

export function buildRefreshToken(sub: string, family?: string): JwtPayload {
  const payload: JwtPayload = { sub, type: 'refresh' };
  if (family !== undefined) payload.family = family;
  return payload;
}

export function buildApiKeyPayload(
  keyId: string,
  scopes: string[],
  orgId?: string,
): JwtPayload {
  const payload: JwtPayload = { keyId, scopes, type: 'api_key' };
  if (orgId !== undefined) payload.orgId = orgId;
  return payload;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

export function isJwt(s: string): boolean {
  if (typeof s !== 'string') return false;
  const parts = s.split('.');
  if (parts.length !== 3) return false;
  const b64url = /^[A-Za-z0-9_-]+$/;
  return parts.every((p) => p.length > 0 && b64url.test(p));
}

export function parseBearer(authHeader: string): string | null {
  if (typeof authHeader !== 'string') return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  return match[1].trim() || null;
}

export function generateJti(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function compareTokens(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8');
    const bufB = Buffer.from(b, 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
