// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * SyncQueue — IndexedDB-backed mutation queue for offline PWA support
 *
 * All POST/PUT/PATCH/DELETE requests that fail while offline are queued here
 * and replayed in FIFO order when connectivity is restored.
 */

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string | null;
  timestamp: number;
  retryCount: number;
}

const DB_NAME = 'ims-sync-queue';
const STORE_NAME = 'mutations';
const DB_VERSION = 1;
const MAX_RETRIES = 3;

function openDB(): Promise<IDBDatabase> {
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

export class SyncQueue {
  /**
   * Add a failed mutation request to the queue.
   */
  async enqueue(request: QueuedRequest): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(request);
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

  /**
   * Return the oldest queued request (FIFO) without removing it.
   */
  async dequeue(): Promise<QueuedRequest | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const cursor = index.openCursor();

      cursor.onsuccess = () => {
        const result = cursor.result;
        db.close();
        resolve(result ? (result.value as QueuedRequest) : null);
      };
      cursor.onerror = () => {
        db.close();
        reject(cursor.error);
      };
    });
  }

  /**
   * Remove a specific entry by ID.
   */
  async remove(id: string): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.delete(id);
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

  /**
   * Get all queued requests ordered by timestamp (oldest first).
   */
  async getAll(): Promise<QueuedRequest[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        db.close();
        resolve(request.result as QueuedRequest[]);
      };
      request.onerror = () => {
        db.close();
        reject(request.error);
      };
    });
  }

  /**
   * Replay all queued mutations in FIFO order.
   * Successful requests are removed; failed ones have retryCount incremented.
   * Requests exceeding MAX_RETRIES (3) are dropped.
   */
  async flush(): Promise<{ succeeded: number; failed: number; dropped: number }> {
    const entries = await this.getAll();
    let succeeded = 0;
    let failed = 0;
    let dropped = 0;

    for (const entry of entries) {
      try {
        // Re-attach auth token from localStorage at replay time (tokens are
        // intentionally stripped before persisting to IndexedDB for security).
        const replayHeaders: Record<string, string> = { ...entry.headers };
        if (typeof globalThis !== 'undefined' && typeof localStorage !== 'undefined') {
          const token = localStorage.getItem('token');
          if (token) {
            replayHeaders['Authorization'] = `Bearer ${token}`;
          }
        }

        const response = await fetch(entry.url, {
          method: entry.method,
          headers: replayHeaders,
          body: entry.body,
        });

        if (response.ok) {
          await this.remove(entry.id);
          succeeded++;
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch {
        const newRetryCount = entry.retryCount + 1;
        if (newRetryCount >= MAX_RETRIES) {
          await this.remove(entry.id);
          dropped++;
        } else {
          await this.enqueue({ ...entry, retryCount: newRetryCount });
          failed++;
        }
      }
    }

    return { succeeded, failed, dropped };
  }

  /**
   * Return the number of pending mutations in the queue.
   */
  async getQueueLength(): Promise<number> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const countReq = store.count();

      countReq.onsuccess = () => {
        db.close();
        resolve(countReq.result);
      };
      countReq.onerror = () => {
        db.close();
        reject(countReq.error);
      };
    });
  }

  /**
   * Remove all queued entries.
   */
  async clear(): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.clear();
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
}

export const syncQueue = new SyncQueue();
