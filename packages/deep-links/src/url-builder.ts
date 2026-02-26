// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
import type { DeepLinkConfig, ResolvedDeepLink } from './types';

export function buildDeepLink(
  module: string,
  entityType: string,
  entityId: string,
  params?: Record<string, string>
): string {
  let url = `/${module}/${entityType}/${entityId}`;
  if (params && Object.keys(params).length > 0) {
    const qs = new URLSearchParams(params).toString();
    url += `?${qs}`;
  }
  return url;
}

export function parseDeepLink(
  url: string,
  configs: DeepLinkConfig[]
): ResolvedDeepLink | null {
  if (!url || !url.startsWith('/')) return null;
  const parts = url.split('?');
  const pathParts = parts[0].split('/').filter(Boolean);
  if (pathParts.length < 3) return null;

  const [module, entityType, entityId] = pathParts;
  const params: Record<string, string> = {};
  if (parts[1]) {
    new URLSearchParams(parts[1]).forEach((v, k) => { params[k] = v; });
  }

  const config = configs.find(c => c.module === module && c.entityType === entityType);
  if (!config) return null;

  return { url: parts[0], module, entityType, entityId, params };
}

export function isDeepLink(url: string): boolean {
  if (!url) return false;
  return /^\/[a-z0-9-]+\/[a-z0-9-]+\/[a-z0-9-]+/.test(url);
}

export function getModuleFromUrl(url: string): string | null {
  if (!url || !url.startsWith('/')) return null;
  const parts = url.split('/').filter(Boolean);
  return parts[0] || null;
}

export function buildSearchUrl(query: string, filters?: Record<string, string>): string {
  const params = new URLSearchParams({ q: query, ...filters });
  return `/search?${params.toString()}`;
}
