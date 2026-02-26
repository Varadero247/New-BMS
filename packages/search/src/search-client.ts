// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type {
  SearchQuery,
  SearchResults,
  SearchSuggestion,
  RecentSearch,
  SearchClientOptions,
} from './types';

interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

/**
 * Create a search client for interacting with `apps/api-search`.
 */
export function createSearchClient(options: SearchClientOptions) {
  const { apiUrl, timeout = 5000, cacheMs = 30_000 } = options;
  const cache = new Map<string, CacheEntry>();
  const inFlight = new Map<string, Promise<unknown>>();

  function getCached<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  function setCached(key: string, data: unknown): void {
    cache.set(key, { data, expiresAt: Date.now() + cacheMs });
  }

  function buildQueryString(params: Record<string, string | number | undefined>): string {
    const pairs = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
    return pairs.length > 0 ? `?${pairs.join('&')}` : '';
  }

  async function fetchWithTimeout<T>(url: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Search request failed: ${res.status} ${res.statusText}`);
      }
      return await res.json() as T;
    } finally {
      clearTimeout(id);
    }
  }

  async function dedupedFetch<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
    const cached = getCached<T>(key);
    if (cached !== null) return cached;

    const existing = inFlight.get(key);
    if (existing) return existing as Promise<T>;

    const promise = fetcher().then((data) => {
      setCached(key, data);
      inFlight.delete(key);
      return data;
    }).catch((err) => {
      inFlight.delete(key);
      throw err;
    });

    inFlight.set(key, promise);
    return promise;
  }

  return {
    async search(query: SearchQuery): Promise<SearchResults> {
      const qs = buildQueryString({
        q: query.q,
        type: query.type,
        limit: query.limit,
        offset: query.offset,
        sort: query.sort,
      });
      const url = `${apiUrl}/api/search${qs}`;
      const cacheKey = url;

      return dedupedFetch(cacheKey, () =>
        fetchWithTimeout<{ success: boolean; data: SearchResults }>(url).then((r) => r.data)
      );
    },

    async suggest(q: string, limit = 5): Promise<SearchSuggestion[]> {
      const qs = buildQueryString({ q, limit });
      const url = `${apiUrl}/api/search/suggest${qs}`;
      return dedupedFetch(url, () =>
        fetchWithTimeout<{ success: boolean; data: { suggestions: SearchSuggestion[] } }>(url).then(
          (r) => r.data.suggestions
        )
      );
    },

    async getRecent(): Promise<RecentSearch[]> {
      const url = `${apiUrl}/api/search/recent`;
      return fetchWithTimeout<{ success: boolean; data: { searches: RecentSearch[] } }>(url).then(
        (r) => r.data.searches
      );
    },

    async clearRecent(): Promise<void> {
      await fetchWithTimeout(`${apiUrl}/api/search/recent`, { method: 'DELETE' });
    },

    clearCache(): void {
      cache.clear();
    },

    getCacheSize(): number {
      return cache.size;
    },
  };
}

export type SearchClient = ReturnType<typeof createSearchClient>;
