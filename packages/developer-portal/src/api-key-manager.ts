// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import { createHash, randomBytes } from 'crypto';

/** Generates a new API key with optional prefix. Default prefix: `ims_sk_`. */
export function generateApiKey(prefix = 'ims_sk_'): string {
  const random = randomBytes(24).toString('hex');
  return `${prefix}${random}`;
}

/** Returns the SHA-256 hex hash of an API key. */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/** Returns true if the key matches the `ims_sk_<32+ hex chars>` or `ims_sb_<32+ hex chars>` pattern. */
export function validateApiKeyFormat(key: string): boolean {
  return /^ims_(sk|sb|pk)_[0-9a-f]{40,}$/.test(key);
}

/** Returns a masked version: first 10 chars + `...` + last 4 chars. */
export function maskApiKey(key: string): string {
  if (key.length <= 14) return '***';
  return `${key.slice(0, 10)}...${key.slice(-4)}`;
}

/** Returns true if the key is a production key (prefix `ims_sk_`). */
export function isProductionKey(key: string): boolean {
  return key.startsWith('ims_sk_');
}

/** Returns true if the key is a sandbox key (prefix `ims_sb_`). */
export function isSandboxKey(key: string): boolean {
  return key.startsWith('ims_sb_');
}
