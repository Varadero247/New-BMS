'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

/**
 * React hook to check if a single feature flag is enabled.
 * Fetches from GET /api/admin/feature-flags/check?name={name}
 * Caches in React state; no re-fetch until component remounts.
 */
export function useFeatureFlag(name: string): { enabled: boolean; loading: boolean } {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchFlag() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(
          `${API_URL}/api/feature-flags/check?name=${encodeURIComponent(name)}`,
          {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (!cancelled && res.ok) {
          const json = await res.json();
          setEnabled(json.data?.enabled ?? false);
        }
      } catch {
        // Fail closed - flag stays false
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFlag();
    return () => {
      cancelled = true;
    };
  }, [name]);

  return { enabled, loading };
}

/**
 * React hook to get all feature flags as a Record<string, boolean>.
 * Fetches from GET /api/feature-flags
 * Caches in React state; no re-fetch until component remounts.
 */
export function useFeatureFlags(): { flags: Record<string, boolean>; loading: boolean } {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchFlags() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch(`${API_URL}/api/feature-flags`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!cancelled && res.ok) {
          const json = await res.json();
          setFlags(json.data ?? {});
        }
      } catch {
        // Fail closed - all flags default to false
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchFlags();
    return () => {
      cancelled = true;
    };
  }, []);

  return { flags, loading };
}
