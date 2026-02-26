// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { PluginManifest, PluginPermission, PluginCategory } from './types';

const SEMVER_RE = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/;
const PLUGIN_ID_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const VALID_CATEGORIES: PluginCategory[] = [
  'integration', 'report', 'workflow', 'dashboard', 'compliance',
  'notification', 'data-import', 'ai', 'custom',
];

const VALID_PERMISSIONS: PluginPermission[] = [
  'read:quality', 'write:quality', 'read:hse', 'write:hse',
  'read:documents', 'write:documents', 'read:analytics',
  'send:notifications', 'access:api', 'read:users',
];

export function isSemver(version: string): boolean {
  return SEMVER_RE.test(version);
}

/**
 * Compares two semver strings.
 * Returns -1 if v1 < v2, 0 if equal, 1 if v1 > v2.
 */
export function compareVersions(v1: string, v2: string): -1 | 0 | 1 {
  const parse = (v: string) => v.split('-')[0].split('.').map(Number);
  const a = parse(v1);
  const b = parse(v2);
  for (let i = 0; i < 3; i++) {
    const ai = a[i] ?? 0;
    const bi = b[i] ?? 0;
    if (ai < bi) return -1;
    if (ai > bi) return 1;
  }
  return 0;
}

/**
 * Returns denied permissions: permissions in `requested` that are not in `allowed`.
 */
export function checkPermissions(
  requested: PluginPermission[],
  allowed: PluginPermission[]
): PluginPermission[] {
  const allowedSet = new Set(allowed);
  return requested.filter((p) => !allowedSet.has(p));
}

export function validateManifest(
  manifest: Partial<PluginManifest>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!manifest.id) {
    errors.push('Plugin id is required');
  } else if (!PLUGIN_ID_RE.test(manifest.id)) {
    errors.push('Plugin id must be lowercase alphanumeric with hyphens (e.g. my-plugin)');
  }

  if (!manifest.name) {
    errors.push('Plugin name is required');
  } else if (manifest.name.length < 1 || manifest.name.length > 100) {
    errors.push('Plugin name must be 1-100 characters');
  }

  if (!manifest.version) {
    errors.push('Plugin version is required');
  } else if (!isSemver(manifest.version)) {
    errors.push(`Plugin version "${manifest.version}" is not valid semver`);
  }

  if (!manifest.description) errors.push('Plugin description is required');
  if (!manifest.author) errors.push('Plugin author is required');
  if (!manifest.authorEmail) errors.push('Plugin authorEmail is required');

  if (!manifest.category) {
    errors.push('Plugin category is required');
  } else if (!VALID_CATEGORIES.includes(manifest.category)) {
    errors.push(`Unknown category: "${manifest.category}"`);
  }

  if (!Array.isArray(manifest.permissions)) {
    errors.push('Plugin permissions must be an array');
  } else {
    for (const perm of manifest.permissions) {
      if (!VALID_PERMISSIONS.includes(perm as PluginPermission)) {
        errors.push(`Unknown permission: "${perm}"`);
      }
    }
  }

  if (!manifest.entryPoint || manifest.entryPoint.trim() === '') {
    errors.push('Plugin entryPoint is required');
  }

  if (!manifest.licenseType) {
    errors.push('Plugin licenseType is required');
  } else if (!['free', 'paid', 'freemium'].includes(manifest.licenseType)) {
    errors.push('Plugin licenseType must be free, paid, or freemium');
  } else if (manifest.licenseType === 'paid') {
    if (manifest.price === undefined || manifest.price === null) {
      errors.push('Plugin price is required for paid plugins');
    } else if (typeof manifest.price !== 'number' || manifest.price < 0) {
      errors.push('Plugin price must be a non-negative number');
    }
  }

  if (manifest.minPlatformVersion && !isSemver(manifest.minPlatformVersion)) {
    errors.push(`minPlatformVersion "${manifest.minPlatformVersion}" is not valid semver`);
  }

  return { valid: errors.length === 0, errors };
}
