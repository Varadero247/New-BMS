// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import crypto from 'crypto';

/** Stored magic-link token record */
export interface MagicLinkRecord {
  hashedToken: string;
  email: string;
  redirectUrl: string;
  expiresAt: Date;
  usedAt: Date | null;
}

export interface MagicLinkOptions {
  /** Token TTL in milliseconds (default: 15 minutes) */
  ttlMs?: number;
  /** Base URL of the application, used to construct the magic link */
  appUrl?: string;
}

/**
 * Hash a raw token for safe storage (SHA-256).
 * The raw token is sent to the user; only the hash is stored server-side.
 */
export function hashMagicLinkToken(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Generate a new magic-link token pair.
 *
 * Returns:
 *  - `rawToken`: include in the email link (never store this)
 *  - `hashedToken`: store in DB / cache
 *  - `magicLink`: full URL to email the user
 *  - `expiresAt`: when the token expires
 */
export function generateMagicLink(
  email: string,
  redirectUrl = '/',
  opts: MagicLinkOptions = {}
): { rawToken: string; hashedToken: string; magicLink: string; expiresAt: Date } {
  const { ttlMs = 15 * 60 * 1000, appUrl = process.env.APP_URL || 'http://localhost:3000' } =
    opts;

  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashMagicLinkToken(rawToken);
  const expiresAt = new Date(Date.now() + ttlMs);

  const params = new URLSearchParams({
    token: rawToken,
    email,
    redirect: redirectUrl,
  });
  const magicLink = `${appUrl}/auth/magic?${params.toString()}`;

  return { rawToken, hashedToken, magicLink, expiresAt };
}

/**
 * Verify a submitted magic-link token against a stored record.
 *
 * Returns `'ok'` on success or a reason string on failure.
 * Always call `markUsed()` / invalidate after a successful verification.
 */
export function verifyMagicLinkToken(
  rawToken: string,
  record: MagicLinkRecord
): 'ok' | 'expired' | 'already_used' | 'invalid' {
  if (record.usedAt) return 'already_used';
  if (record.expiresAt <= new Date()) return 'expired';

  const submitted = hashMagicLinkToken(rawToken);

  // Constant-time comparison to avoid timing attacks
  const stored = Buffer.from(record.hashedToken, 'hex');
  const incoming = Buffer.from(submitted, 'hex');

  if (stored.length !== incoming.length) return 'invalid';
  if (!crypto.timingSafeEqual(stored, incoming)) return 'invalid';

  return 'ok';
}

/**
 * Simple in-memory magic-link store for environments that don't have a DB adapter
 * wired up yet (e.g. tests, edge functions).
 *
 * In production replace with a DB-backed implementation.
 */
export class InMemoryMagicLinkStore {
  private store = new Map<string, MagicLinkRecord>();

  save(hashedToken: string, record: MagicLinkRecord): void {
    this.store.set(hashedToken, record);
  }

  find(hashedToken: string): MagicLinkRecord | null {
    return this.store.get(hashedToken) ?? null;
  }

  markUsed(hashedToken: string): boolean {
    const rec = this.store.get(hashedToken);
    if (!rec) return false;
    rec.usedAt = new Date();
    return true;
  }

  delete(hashedToken: string): boolean {
    return this.store.delete(hashedToken);
  }

  /** Purge expired tokens (call periodically to prevent memory growth). */
  purgeExpired(): number {
    const now = new Date();
    let purged = 0;
    for (const [key, rec] of this.store) {
      if (rec.expiresAt <= now) {
        this.store.delete(key);
        purged++;
      }
    }
    return purged;
  }

  get size(): number {
    return this.store.size;
  }
}
