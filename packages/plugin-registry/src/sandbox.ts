// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { PluginManifest } from './types';

const DANGEROUS_PATTERNS = [
  /\.\.(\/|\\)/,         // path traversal
  /^(\/|[A-Z]:\\)/,      // absolute paths
  /eval\s*\(/,           // eval calls
  /Function\s*\(/,       // Function constructor
  /require\s*\(/,        // dynamic require
  /process\.env/,        // env access
  /child_process/,       // shell execution
];

/** Validates that an entry point path is safe (relative, no traversal). */
export function validateEntryPoint(entryPoint: string): boolean {
  if (!entryPoint || typeof entryPoint !== 'string') return false;
  if (!entryPoint.endsWith('.js') && !entryPoint.endsWith('.mjs')) return false;

  for (const pattern of DANGEROUS_PATTERNS) {
    if (pattern.test(entryPoint)) return false;
  }

  return true;
}

/**
 * Checks a plugin manifest against sandbox constraints.
 * Returns an array of constraint violation messages (empty = compliant).
 */
export function checkSandboxConstraints(manifest: PluginManifest): string[] {
  const violations: string[] = [];

  if (!validateEntryPoint(manifest.entryPoint)) {
    violations.push(`entryPoint "${manifest.entryPoint}" fails sandbox path validation`);
  }

  // Dangerous permission combinations
  const hasWrite = manifest.permissions.some((p) => p.startsWith('write:'));
  const hasReadUsers = manifest.permissions.includes('read:users');
  const hasApiAccess = manifest.permissions.includes('access:api');

  if (hasWrite && hasApiAccess && hasReadUsers) {
    violations.push(
      'Plugin requests write + access:api + read:users — high-risk permission combination'
    );
  }

  if (manifest.permissions.length > 6) {
    violations.push(
      `Plugin requests ${manifest.permissions.length} permissions — exceeds recommended maximum of 6`
    );
  }

  return violations;
}

/**
 * Generates a deterministic API key for a plugin installation.
 * Format: `ims_plug_<base62 of hash>`
 */
export function generateApiKey(pluginId: string, orgId: string): string {
  const input = `${pluginId}:${orgId}`;
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash * 33) ^ input.charCodeAt(i)) >>> 0;
  }

  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  let n = hash;
  for (let i = 0; i < 16; i++) {
    result = chars[n % 62] + result;
    n = Math.floor(n / 62);
    if (n === 0) n = hash ^ (i + 1);
  }

  return `ims_plug_${result}`;
}
