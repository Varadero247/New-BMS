// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * OfflineCache — Cache API wrapper for offline document/task caching
 *
 * Caches the last MAX_ITEMS API responses with priority given to
 * work orders, incidents, checklists, tasks, and documents.
 */

const CACHE_NAME = 'ims-data-v1';
const MAX_ITEMS = 50;

/** URL path patterns that get priority caching */
const PRIORITY_PATTERNS = [
  '/api/*/tasks',
  '/api/*/documents',
  '/api/*/work-orders',
  '/api/*/incidents',
  '/api/*/checklists',
];

/**
 * Check whether a URL matches one of the priority caching patterns.
 */
function isPriorityUrl(url: string): boolean {
  const pathname = new URL(url).pathname;
  return PRIORITY_PATTERNS.some((pattern) => {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '[^/]+') + '(\\?.*)?$');
    return regex.test(pathname);
  });
}

export class OfflineCache {
  private metaKey = '__ims_cache_meta__';

  /**
   * Get or initialize the ordered list of cached URLs (oldest first).
   */
  private async getTrackedUrlsInternal(): Promise<string[]> {
    try {
      const cache = await caches.open(CACHE_NAME);
      const metaResponse = await cache.match(this.metaKey);
      if (metaResponse) {
        return await metaResponse.json();
      }
    } catch {
      // meta not found or corrupted
    }
    return [];
  }

  /**
   * Persist the tracked URL list into the cache itself.
   */
  private async setTrackedUrls(urls: string[]): Promise<void> {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(JSON.stringify(urls), {
      headers: { 'Content-Type': 'application/json' },
    });
    await cache.put(this.metaKey, response);
  }

  /**
   * Cache an API response. Clones the response before caching.
   * If the cache exceeds MAX_ITEMS, the oldest non-priority entry is evicted.
   * If all entries are priority, the oldest entry overall is evicted.
   */
  async cacheResponse(url: string, response: Response): Promise<void> {
    const cache = await caches.open(CACHE_NAME);
    const tracked = await this.getTrackedUrlsInternal();

    // Remove existing entry for this URL so it moves to the end (most recent)
    const idx = tracked.indexOf(url);
    if (idx !== -1) {
      tracked.splice(idx, 1);
    }

    // Evict if over limit
    while (tracked.length >= MAX_ITEMS) {
      // Try to evict the oldest non-priority URL first
      let evictIdx = tracked.findIndex((u) => !isPriorityUrl(u));
      if (evictIdx === -1) {
        evictIdx = 0; // all priority, evict oldest
      }
      const evictUrl = tracked[evictIdx];
      tracked.splice(evictIdx, 1);
      await cache.delete(evictUrl);
    }

    // Store the cloned response
    await cache.put(url, response.clone());
    tracked.push(url);
    await this.setTrackedUrls(tracked);
  }

  /**
   * Retrieve a cached response for the given URL.
   */
  async getCachedResponse(url: string): Promise<Response | null> {
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(url);
    return match || null;
  }

  /**
   * Return the list of currently cached URLs (oldest first).
   */
  async getTrackedUrls(): Promise<string[]> {
    return this.getTrackedUrlsInternal();
  }

  /**
   * Clear all cached data and metadata.
   */
  async clear(): Promise<void> {
    await caches.delete(CACHE_NAME);
  }

  /**
   * Check whether a URL is considered a priority cache target.
   */
  static isPriorityUrl(url: string): boolean {
    return isPriorityUrl(url);
  }
}

export const offlineCache = new OfflineCache();
