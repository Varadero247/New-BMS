// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
'use client';

/**
 * useOfflineStatus — React hook for monitoring online/offline state and sync queue
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { syncQueue } from './sync-queue';

export interface OfflineStatus {
  isOnline: boolean;
  pendingSync: number;
  lastSyncAt: Date | null;
}

const POLL_INTERVAL_MS = 5000;

export function useOfflineStatus(): OfflineStatus {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingSync, setPendingSync] = useState<number>(0);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const updateQueueLength = useCallback(async () => {
    try {
      const length = await syncQueue.getQueueLength();
      setPendingSync(length);
    } catch {
      // IndexedDB may not be available in SSR
    }
  }, []);

  const handleOnline = useCallback(async () => {
    setIsOnline(true);

    // Flush the sync queue when coming back online
    try {
      await syncQueue.flush();
      setLastSyncAt(new Date());
      await updateQueueLength();
    } catch {
      // flush may partially fail
    }

    // Notify the service worker to replay as well
    if (navigator.serviceWorker?.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'REPLAY_QUEUE' });
    }
  }, [updateQueueLength]);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for sync complete messages from the service worker
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SYNC_COMPLETE') {
        setLastSyncAt(new Date());
        updateQueueLength();
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);

    // Initial queue length check
    updateQueueLength();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, [handleOnline, handleOffline, updateQueueLength]);

  // Poll queue length every 5 seconds when offline
  useEffect(() => {
    if (!isOnline) {
      pollRef.current = setInterval(updateQueueLength, POLL_INTERVAL_MS);
    } else {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    }

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [isOnline, updateQueueLength]);

  return { isOnline, pendingSync, lastSyncAt };
}
