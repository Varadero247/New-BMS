// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import * as fs from 'fs';
import * as path from 'path';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FeatureFlag {
  name: string;
  description: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrgFeatureFlagOverride {
  flagName: string;
  orgId: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FlagStore {
  flags: FeatureFlag[];
  orgOverrides: OrgFeatureFlagOverride[];
}

// ─── In-memory cache with 60-second TTL ──────────────────────────────────────

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 60_000;
const cache = new Map<string, CacheEntry<boolean>>();
const allFlagsCache = new Map<string, CacheEntry<Record<string, boolean>>>();

// ─── JSON file persistence ───────────────────────────────────────────────────

const DATA_FILE = path.resolve(__dirname, '..', 'data', 'flags.json');

function readStore(): FlagStore {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw) as FlagStore;
  } catch {
    return { flags: [], orgOverrides: [] };
  }
}

function writeStore(store: FlagStore): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Check if a feature flag is enabled.
 * - Checks OrgFeatureFlagOverride first (org override), falls back to FeatureFlag.enabled
 * - Uses an in-memory cache with 60-second TTL
 * - Returns false if flag doesn't exist (fail closed)
 */
export async function isEnabled(flagName: string, orgId?: string): Promise<boolean> {
  const cacheKey = orgId ? `${flagName}:${orgId}` : flagName;

  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const store = readStore();

  // Check org override first
  if (orgId) {
    const override = store.orgOverrides.find((o) => o.flagName === flagName && o.orgId === orgId);
    if (override) {
      cache.set(cacheKey, { value: override.enabled, expiresAt: Date.now() + CACHE_TTL_MS });
      return override.enabled;
    }
  }

  // Fall back to global flag
  const flag = store.flags.find((f) => f.name === flagName);
  const enabled = flag ? flag.enabled : false;

  cache.set(cacheKey, { value: enabled, expiresAt: Date.now() + CACHE_TTL_MS });
  return enabled;
}

/**
 * Returns all flags with their effective state for the given org.
 * Uses same cache mechanism.
 */
export async function getAll(orgId?: string): Promise<Record<string, boolean>> {
  const cacheKey = orgId ? `__all__:${orgId}` : '__all__';

  const cached = allFlagsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const store = readStore();
  const result: Record<string, boolean> = {};

  for (const flag of store.flags) {
    if (orgId) {
      const override = store.orgOverrides.find(
        (o) => o.flagName === flag.name && o.orgId === orgId
      );
      result[flag.name] = override ? override.enabled : flag.enabled;
    } else {
      result[flag.name] = flag.enabled;
    }
  }

  allFlagsCache.set(cacheKey, { value: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
}

/**
 * Clears cache for a specific flag or all flags.
 */
export function invalidateCache(flagName?: string): void {
  if (flagName) {
    // Remove all cache entries that match this flag name
    for (const key of cache.keys()) {
      if (key === flagName || key.startsWith(`${flagName}:`)) {
        cache.delete(key);
      }
    }
    // Also invalidate allFlags cache
    allFlagsCache.clear();
  } else {
    cache.clear();
    allFlagsCache.clear();
  }
}

// ─── Store management (used by API routes) ───────────────────────────────────

/**
 * Get all flags with org override counts.
 */
export function getAllFlags(): FeatureFlag[] {
  return readStore().flags;
}

/**
 * Get all org overrides for a specific flag.
 */
export function getOrgOverrides(flagName: string): OrgFeatureFlagOverride[] {
  return readStore().orgOverrides.filter((o) => o.flagName === flagName);
}

/**
 * Get all org overrides across all flags.
 */
export function getAllOrgOverrides(): OrgFeatureFlagOverride[] {
  return readStore().orgOverrides;
}

/**
 * Create a new feature flag. Returns null if a flag with the same name already exists.
 */
export function createFlag(
  name: string,
  description: string,
  enabled: boolean = false
): FeatureFlag | null {
  const store = readStore();
  if (store.flags.some((f) => f.name === name)) {
    return null;
  }
  const now = new Date().toISOString();
  const flag: FeatureFlag = { name, description, enabled, createdAt: now, updatedAt: now };
  store.flags.push(flag);
  writeStore(store);
  invalidateCache(name);
  return flag;
}

/**
 * Update a feature flag. Returns the updated flag or null if not found.
 */
export function updateFlag(
  name: string,
  updates: { enabled?: boolean; description?: string }
): FeatureFlag | null {
  const store = readStore();
  const idx = store.flags.findIndex((f) => f.name === name);
  if (idx === -1) return null;

  if (updates.enabled !== undefined) store.flags[idx].enabled = updates.enabled;
  if (updates.description !== undefined) store.flags[idx].description = updates.description;
  store.flags[idx].updatedAt = new Date().toISOString();

  writeStore(store);
  invalidateCache(name);
  return store.flags[idx];
}

/**
 * Delete a feature flag and all its org overrides. Returns true if deleted.
 */
export function deleteFlag(name: string): boolean {
  const store = readStore();
  const idx = store.flags.findIndex((f) => f.name === name);
  if (idx === -1) return false;

  store.flags.splice(idx, 1);
  store.orgOverrides = store.orgOverrides.filter((o) => o.flagName !== name);
  writeStore(store);
  invalidateCache(name);
  return true;
}

/**
 * Set an org override for a flag. Creates or updates the override.
 */
export function setOrgOverride(
  flagName: string,
  orgId: string,
  enabled: boolean
): OrgFeatureFlagOverride | null {
  const store = readStore();
  // Ensure the flag exists
  if (!store.flags.some((f) => f.name === flagName)) return null;

  const now = new Date().toISOString();
  const idx = store.orgOverrides.findIndex((o) => o.flagName === flagName && o.orgId === orgId);

  if (idx >= 0) {
    store.orgOverrides[idx].enabled = enabled;
    store.orgOverrides[idx].updatedAt = now;
  } else {
    store.orgOverrides.push({ flagName, orgId, enabled, createdAt: now, updatedAt: now });
  }

  writeStore(store);
  invalidateCache(flagName);
  return store.orgOverrides.find((o) => o.flagName === flagName && o.orgId === orgId)!;
}

/**
 * Remove an org override. Returns true if removed.
 */
export function removeOrgOverride(flagName: string, orgId: string): boolean {
  const store = readStore();
  const idx = store.orgOverrides.findIndex((o) => o.flagName === flagName && o.orgId === orgId);
  if (idx === -1) return false;

  store.orgOverrides.splice(idx, 1);
  writeStore(store);
  invalidateCache(flagName);
  return true;
}

/**
 * Seed initial flags (only creates flags that don't already exist).
 */
export function seedInitialFlags(): FeatureFlag[] {
  const INITIAL_FLAGS = [
    { name: 'workflow_visual_builder', description: 'Visual drag-and-drop workflow builder' },
    { name: 'natural_language_query', description: 'AI-powered natural language data queries' },
    { name: 'predictive_analytics', description: 'ML-based predictive analytics and forecasting' },
    { name: 'anomaly_detection', description: 'Automated KPI anomaly detection alerts' },
    { name: 'ai_digests', description: 'AI-generated daily digest emails' },
    { name: 'qr_code_scanning', description: 'QR code scanning for assets and equipment' },
    { name: 'offline_inspection', description: 'Offline inspection form completion' },
    { name: 'gps_tagging', description: 'GPS location tagging on records' },
    { name: 'digital_signatures', description: 'Digital signature capture on approvals' },
    { name: 'photo_annotation', description: 'Photo capture with annotation tools' },
  ];

  const created: FeatureFlag[] = [];
  for (const flagDef of INITIAL_FLAGS) {
    const flag = createFlag(flagDef.name, flagDef.description, false);
    if (flag) created.push(flag);
  }
  return created;
}
