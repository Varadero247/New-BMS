/**
 * IMS Service Worker — Offline support for the Integrated Management System
 *
 * Strategies:
 * - Static assets (CSS, JS, images): Cache-first, populated on install
 * - API GET requests: Stale-while-revalidate with data cache (last 50 responses)
 * - API mutations (POST/PUT/PATCH/DELETE): Queue to IndexedDB on failure, replay on reconnect
 */

/// <reference lib="webworker" />
export {}; // Treat as ES module so `declare const self` below is module-scoped
declare const self: ServiceWorkerGlobalScope;

const STATIC_CACHE = 'ims-offline-v1';
const DATA_CACHE = 'ims-data-v1';
const META_KEY = '__ims_cache_meta__';
const MAX_DATA_ITEMS = 50;

// Sync queue constants (mirrors sync-queue.ts for SW context)
const DB_NAME = 'ims-sync-queue';
const STORE_NAME = 'mutations';
const DB_VERSION = 1;
const MAX_RETRIES = 3;

// Static assets to precache on install
const PRECACHE_URLS = ['/', '/manifest.json'];

// Priority URL patterns for data caching
const PRIORITY_PATTERNS = [
  /\/api\/[^/]+\/tasks/,
  /\/api\/[^/]+\/documents/,
  /\/api\/[^/]+\/work-orders/,
  /\/api\/[^/]+\/incidents/,
  /\/api\/[^/]+\/checklists/,
];

function isPriorityUrl(url: string): boolean {
  try {
    const pathname = new URL(url).pathname;
    return PRIORITY_PATTERNS.some((re) => re.test(pathname));
  } catch {
    return false;
  }
}

// ─── IndexedDB helpers (self-contained for SW context) ───

function openSyncDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

interface QueuedMutation {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
  retryCount: number;
}

async function enqueueMutation(mutation: QueuedMutation): Promise<void> {
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(mutation);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function getAllMutations(): Promise<QueuedMutation[]> {
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const req = tx.objectStore(STORE_NAME).index('timestamp').getAll();
    req.onsuccess = () => {
      db.close();
      resolve(req.result);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

async function removeMutation(id: string): Promise<void> {
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

// ─── Data cache metadata helpers ───

async function getTrackedUrls(): Promise<string[]> {
  try {
    const cache = await caches.open(DATA_CACHE);
    const metaResp = await cache.match(META_KEY);
    if (metaResp) return await metaResp.json();
  } catch {
    /* ignore */
  }
  return [];
}

async function setTrackedUrls(urls: string[]): Promise<void> {
  const cache = await caches.open(DATA_CACHE);
  await cache.put(
    META_KEY,
    new Response(JSON.stringify(urls), {
      headers: { 'Content-Type': 'application/json' },
    })
  );
}

async function cacheDataResponse(url: string, response: Response): Promise<void> {
  const cache = await caches.open(DATA_CACHE);
  const tracked = await getTrackedUrls();

  const idx = tracked.indexOf(url);
  if (idx !== -1) tracked.splice(idx, 1);

  while (tracked.length >= MAX_DATA_ITEMS) {
    let evictIdx = tracked.findIndex((u) => !isPriorityUrl(u));
    if (evictIdx === -1) evictIdx = 0;
    await cache.delete(tracked[evictIdx]);
    tracked.splice(evictIdx, 1);
  }

  await cache.put(url, response.clone());
  tracked.push(url);
  await setTrackedUrls(tracked);
}

// ─── Install ───

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate — clean up old caches ───

self.addEventListener('activate', (event: ExtendableEvent) => {
  const currentCaches = new Set([STATIC_CACHE, DATA_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.filter((name) => !currentCaches.has(name)).map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch ───

self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Static assets — cache-first
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // API GET requests — stale-while-revalidate
  if (url.pathname.startsWith('/api/') && request.method === 'GET') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // API mutations — network with offline queue fallback
  if (
    url.pathname.startsWith('/api/') &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)
  ) {
    event.respondWith(networkWithQueue(request));
    return;
  }
});

function isStaticAsset(pathname: string): boolean {
  return /\.(css|js|mjs|woff2?|ttf|eot|svg|png|jpg|jpeg|gif|ico|webp)(\?.*)?$/.test(pathname);
}

async function cacheFirst(request: Request): Promise<Response> {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

async function staleWhileRevalidate(request: Request): Promise<Response> {
  const cache = await caches.open(DATA_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cacheDataResponse(request.url, response);
      }
      return response;
    })
    .catch(() => null);

  // Return cached immediately if available, otherwise wait for network
  if (cached) {
    // Fire-and-forget revalidation
    fetchPromise;
    return cached;
  }

  const networkResponse = await fetchPromise;
  if (networkResponse) return networkResponse;

  return new Response(JSON.stringify({ success: false, error: 'Offline - no cached data' }), {
    status: 503,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function networkWithQueue(request: Request): Promise<Response> {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch {
    // Network failed — queue the mutation for later replay
    const body = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    const mutation: QueuedMutation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      url: request.url,
      method: request.method,
      headers,
      body: body || null,
      timestamp: Date.now(),
      retryCount: 0,
    };

    await enqueueMutation(mutation);

    return new Response(
      JSON.stringify({
        success: true,
        queued: true,
        message: 'Request queued for sync when online',
        queueId: mutation.id,
      }),
      {
        status: 202,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

// ─── Online event — replay queued mutations ───

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data?.type === 'REPLAY_QUEUE') {
    event.waitUntil(replayQueue());
  }
});

async function replayQueue(): Promise<void> {
  const entries = await getAllMutations();
  for (const entry of entries) {
    try {
      const response = await fetch(entry.url, {
        method: entry.method,
        headers: entry.headers,
        body: entry.body,
      });

      if (response.ok) {
        await removeMutation(entry.id);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch {
      const newRetryCount = entry.retryCount + 1;
      if (newRetryCount >= MAX_RETRIES) {
        await removeMutation(entry.id);
      } else {
        await removeMutation(entry.id);
        await enqueueMutation({ ...entry, retryCount: newRetryCount });
      }
    }
  }

  // Notify all clients about sync completion
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE' });
  });
}
