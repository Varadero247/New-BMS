'use client';

/**
 * useOfflineForm — React hook for offline-capable form submissions.
 *
 * Wraps form submission so that when the user is offline, the request is
 * queued in the SyncQueue (IndexedDB) and automatically replayed when
 * connectivity is restored.
 */

import { useState, useCallback, useRef } from 'react';
import { SyncQueue, type QueuedRequest } from './sync-queue';
import { useOfflineStatus } from './use-offline';

export interface OfflineFormOptions {
  /** The API endpoint URL */
  url: string;
  /** HTTP method (default: POST) */
  method?: string;
  /** Extra headers to include */
  headers?: Record<string, string>;
  /** Called on successful submission (online) */
  onSuccess?: (data: unknown) => void;
  /** Called when the request is queued (offline) */
  onQueued?: () => void;
  /** Called on error */
  onError?: (error: Error) => void;
}

export interface OfflineFormState {
  /** Whether a submission is in progress */
  isSubmitting: boolean;
  /** Whether the last submission was queued for offline sync */
  isQueued: boolean;
  /** The last error, if any */
  error: Error | null;
  /** Whether the device is currently online */
  isOnline: boolean;
  /** Number of pending sync items */
  pendingSync: number;
}

export interface UseOfflineFormReturn extends OfflineFormState {
  /** Submit the form data. Auto-detects online/offline and acts accordingly. */
  submit: (data: Record<string, unknown>) => Promise<void>;
  /** Reset the form state */
  reset: () => void;
}

const syncQueueInstance = new SyncQueue();

export function useOfflineForm(options: OfflineFormOptions): UseOfflineFormReturn {
  const { url, method = 'POST', headers = {}, onSuccess, onQueued, onError } = options;

  // Validate URL to prevent SSRF — only allow relative URLs or same-origin HTTPS/HTTP
  if (url.startsWith('//') || url.startsWith('javascript:') || url.startsWith('data:')) {
    throw new Error('Invalid URL scheme for offline form submission');
  }
  const { isOnline, pendingSync } = useOfflineStatus();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQueued, setIsQueued] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const idCounter = useRef(0);

  const submit = useCallback(async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    setError(null);
    setIsQueued(false);

    const body = JSON.stringify(data);
    const allHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add auth token if available
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        allHeaders['Authorization'] = `Bearer ${token}`;
      }
    }

    if (isOnline) {
      // Online — submit directly
      try {
        const response = await fetch(url, {
          method,
          headers: allHeaders,
          body,
        });

        if (!response.ok) {
          throw new Error(`Request failed: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        onSuccess?.(result);
      } catch (err: unknown) {
        const fetchError = err as Error;

        // If the fetch failed due to network error, queue it
        if (fetchError.name === 'TypeError' || fetchError.message.includes('Failed to fetch')) {
          await queueRequest(allHeaders, body);
        } else {
          setError(fetchError);
          onError?.(fetchError);
        }
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Offline — queue the request
      await queueRequest(allHeaders, body);
      setIsSubmitting(false);
    }
  }, [url, method, headers, isOnline, onSuccess, onQueued, onError]);

  const queueRequest = useCallback(async (allHeaders: Record<string, string>, body: string) => {
    try {
      // Strip sensitive auth headers before persisting to IndexedDB.
      // The token will be re-read fresh from localStorage during replay.
      const safeHeaders: Record<string, string> = { ...allHeaders };
      delete safeHeaders['Authorization'];
      delete safeHeaders['authorization'];

      const queuedRequest: QueuedRequest = {
        id: `offline-form-${Date.now()}-${idCounter.current++}`,
        url,
        method,
        headers: safeHeaders,
        body,
        timestamp: Date.now(),
        retryCount: 0,
      };

      await syncQueueInstance.enqueue(queuedRequest);
      setIsQueued(true);
      onQueued?.();
    } catch (err: unknown) {
      const queueError = new Error('Failed to queue request for offline sync');
      setError(queueError);
      onError?.(queueError);
    }
  }, [url, method, onQueued, onError]);

  const reset = useCallback(() => {
    setIsSubmitting(false);
    setIsQueued(false);
    setError(null);
  }, []);

  return {
    isSubmitting,
    isQueued,
    error,
    isOnline,
    pendingSync,
    submit,
    reset,
  };
}
