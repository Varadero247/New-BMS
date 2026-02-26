// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from './types';

export interface JwtKeyRecord {
  keyId: string;
  secret: string;
  algorithm: 'HS256';
  createdAt: Date;
  /** After this date the key no longer signs new tokens but still verifies old ones */
  deprecatedAt: Date | null;
  /** After this date the key is rejected entirely */
  expiresAt: Date;
}

/**
 * In-memory JWT key rotation manager.
 *
 * Maintains a list of keys: one ACTIVE key (signs new tokens) and optional
 * DEPRECATED keys that still verify tokens during a grace period.  When
 * `rotateKey()` is called the current active key becomes deprecated and a
 * fresh key is generated.
 *
 * Intended usage: a singleton instantiated at service startup, refreshed on a
 * schedule (e.g. every 7 days via setInterval or a cron job).
 */
export class JwtKeyRotationManager {
  private keys: Map<string, JwtKeyRecord> = new Map();
  private activeKeyId: string | null = null;

  /** Grace period: deprecated keys remain valid for this long (ms). Default 7 days. */
  private readonly gracePeriodMs: number;

  constructor(gracePeriodMs = 7 * 24 * 60 * 60 * 1000) {
    this.gracePeriodMs = gracePeriodMs;
  }

  /** Generate a new 64-byte random secret and make it the active key. */
  async rotateKey(): Promise<JwtKeyRecord> {
    const now = new Date();

    // Deprecate the current active key
    if (this.activeKeyId) {
      const current = this.keys.get(this.activeKeyId);
      if (current) {
        current.deprecatedAt = now;
        current.expiresAt = new Date(now.getTime() + this.gracePeriodMs);
      }
    }

    // Create new active key
    const newKey: JwtKeyRecord = {
      keyId: crypto.randomBytes(16).toString('hex'),
      secret: crypto.randomBytes(64).toString('base64'),
      algorithm: 'HS256',
      createdAt: now,
      deprecatedAt: null,
      expiresAt: new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000), // 1 year max
    };

    this.keys.set(newKey.keyId, newKey);
    this.activeKeyId = newKey.keyId;

    // Purge fully expired keys
    this.purgeExpired();

    return newKey;
  }

  /** Get the current active key (throws if none exists — call rotateKey() first). */
  getActiveKey(): JwtKeyRecord {
    if (!this.activeKeyId) {
      throw new Error('No active JWT key. Call rotateKey() to generate one.');
    }
    const key = this.keys.get(this.activeKeyId);
    if (!key) {
      throw new Error('Active key not found in registry');
    }
    return key;
  }

  /** Retrieve any key by ID (active or deprecated during grace period). */
  getKeyById(keyId: string): JwtKeyRecord | null {
    const key = this.keys.get(keyId);
    if (!key) return null;

    // Reject fully expired keys
    if (key.expiresAt <= new Date()) {
      this.keys.delete(keyId);
      return null;
    }

    return key;
  }

  /** Sign a payload using the active key. Adds `kid` header. */
  sign(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresIn = '15m'): string {
    const activeKey = this.getActiveKey();
    return jwt.sign(payload, activeKey.secret, {
      algorithm: 'HS256',
      expiresIn,
      header: { alg: 'HS256', kid: activeKey.keyId },
    } as jwt.SignOptions);
  }

  /**
   * Verify a token, trying the embedded `kid` first then all non-expired keys.
   * Returns the decoded payload or throws.
   */
  verify(token: string): JWTPayload {
    // Extract kid from header without verifying
    const decoded = jwt.decode(token, { complete: true });
    const kid = decoded?.header?.kid as string | undefined;

    if (kid) {
      const key = this.getKeyById(kid);
      if (key) {
        return jwt.verify(token, key.secret, { algorithms: ['HS256'] }) as JWTPayload;
      }
    }

    // Fallback: try all non-expired keys
    const now = new Date();
    for (const key of this.keys.values()) {
      if (key.expiresAt > now) {
        try {
          return jwt.verify(token, key.secret, { algorithms: ['HS256'] }) as JWTPayload;
        } catch {
          // Try next key
        }
      }
    }

    throw new jwt.JsonWebTokenError('Token verification failed with all available keys');
  }

  /** Number of keys currently in the registry (active + deprecated). */
  get keyCount(): number {
    return this.keys.size;
  }

  /** Whether a key with the given ID is still within grace period. */
  isKeyValid(keyId: string): boolean {
    return this.getKeyById(keyId) !== null;
  }

  private purgeExpired(): void {
    const now = new Date();
    for (const [id, key] of this.keys) {
      if (key.expiresAt <= now) {
        this.keys.delete(id);
      }
    }
  }
}

/** Singleton instance — initialise once at startup then share across requests. */
export const jwtKeyManager = new JwtKeyRotationManager();
