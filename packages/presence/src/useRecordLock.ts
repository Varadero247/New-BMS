'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { PresenceUser, LockResult } from './index';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface UseRecordLockReturn {
  isLocked: boolean;
  lockedBy: PresenceUser | null;
  viewers: PresenceUser[];
  acquireLock: (force?: boolean) => Promise<LockResult>;
  releaseLock: () => Promise<void>;
}

async function fetchApi<T>(path: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  });
  const json = await res.json();
  return json.data as T;
}

export function useRecordLock(recordType: string, recordId: string): UseRecordLockReturn {
  const [isLocked, setIsLocked] = useState(false);
  const [lockedBy, setLockedBy] = useState<PresenceUser | null>(null);
  const [viewers, setViewers] = useState<PresenceUser[]>([]);
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasLockRef = useRef(false);

  const fetchPresence = useCallback(async () => {
    try {
      const data = await fetchApi<{ viewers: PresenceUser[] }>(
        `/api/presence?recordType=${encodeURIComponent(recordType)}&recordId=${encodeURIComponent(recordId)}`
      );
      setViewers(data.viewers || []);
    } catch {
      // Silently ignore polling failures
    }
  }, [recordType, recordId]);

  const doAcquireLock = useCallback(
    async (force?: boolean): Promise<LockResult> => {
      try {
        const data = await fetchApi<LockResult>('/api/presence/lock', {
          method: 'POST',
          body: JSON.stringify({ recordType, recordId, force }),
        });

        if (data.acquired) {
          setIsLocked(false);
          setLockedBy(null);
          hasLockRef.current = true;

          // Start refresh interval (every 20s)
          if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
          refreshIntervalRef.current = setInterval(async () => {
            try {
              await fetchApi('/api/presence/refresh', {
                method: 'PUT',
                body: JSON.stringify({ recordType, recordId }),
              });
            } catch {
              // Silently ignore refresh failures
            }
          }, 20_000);
        } else {
          setIsLocked(true);
          setLockedBy(data.lockedBy || null);
          hasLockRef.current = false;
        }

        return data;
      } catch {
        return { acquired: false };
      }
    },
    [recordType, recordId]
  );

  const doReleaseLock = useCallback(async (): Promise<void> => {
    hasLockRef.current = false;
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
    try {
      await fetchApi('/api/presence/lock', {
        method: 'DELETE',
        body: JSON.stringify({ recordType, recordId }),
      });
    } catch {
      // Silently ignore release failures
    }
    setIsLocked(false);
    setLockedBy(null);
  }, [recordType, recordId]);

  // Poll for presence on mount
  useEffect(() => {
    fetchPresence();
    pollIntervalRef.current = setInterval(fetchPresence, 10_000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      // Release lock on unmount if we hold it
      if (hasLockRef.current) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        // Use sendBeacon or sync fetch for cleanup
        try {
          navigator.sendBeacon(
            `${API_BASE}/api/presence/lock?_method=DELETE`,
            new Blob([JSON.stringify({ recordType, recordId })], { type: 'application/json' })
          );
        } catch {
          // Best-effort cleanup, the TTL will handle it
        }
      }
    };
  }, [recordType, recordId, fetchPresence]);

  return {
    isLocked,
    lockedBy,
    viewers,
    acquireLock: doAcquireLock,
    releaseLock: doReleaseLock,
  };
}
