// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { useState, useEffect } from 'react';

export type ColorMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'ims-color-mode';

/**
 * Returns the current system preference for color scheme.
 */
export function getSystemPreference(): 'dark' | 'light' {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Reads the stored color mode from localStorage.
 * Defaults to 'system' if not set or invalid.
 */
export function getStoredMode(): ColorMode {
  if (typeof localStorage === 'undefined') return 'system';
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

/**
 * Resolves a ColorMode to an actual 'light' | 'dark' value.
 * If mode is 'system', uses the system preference.
 */
export function resolveMode(mode: ColorMode): 'light' | 'dark' {
  if (mode === 'system') {
    return getSystemPreference();
  }
  return mode;
}

/**
 * Applies the color mode to the document root by toggling the 'dark' class.
 */
export function applyColorMode(mode: ColorMode): void {
  if (typeof document === 'undefined') return;
  const resolved = resolveMode(mode);
  if (resolved === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

/**
 * React hook for dark mode. Reads from localStorage, listens for system
 * preference changes, and applies the 'dark' class to documentElement.
 *
 * Returns { mode, resolvedMode, setMode, toggle }.
 */
export function useDarkMode(): {
  mode: ColorMode;
  resolvedMode: 'light' | 'dark';
  setMode: (mode: ColorMode) => void;
  toggle: () => void;
} {
  const [mode, setModeState] = useState<ColorMode>(() => {
    if (typeof window === 'undefined') return 'system';
    return getStoredMode();
  });

  const [resolvedMode, setResolvedMode] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    return resolveMode(getStoredMode());
  });

  const setMode = (newMode: ColorMode) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, newMode);
    }
    setModeState(newMode);
    const resolved = resolveMode(newMode);
    setResolvedMode(resolved);
    applyColorMode(newMode);
  };

  const toggle = () => {
    const next: ColorMode =
      mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(next);
  };

  useEffect(() => {
    applyColorMode(mode);

    if (mode === 'system' && typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => {
        const newResolved = e.matches ? 'dark' : 'light';
        setResolvedMode(newResolved);
        applyColorMode('system');
      };
      mediaQuery.addEventListener('change', handler);
      return () => {
        mediaQuery.removeEventListener('change', handler);
      };
    }
    return undefined;
  }, [mode]);

  return { mode, resolvedMode, setMode, toggle };
}

/** Alias for useDarkMode */
export const useColorMode = useDarkMode;

/**
 * Re-exports getDarkModeScript for convenience. The actual implementation
 * lives in dark-mode-script.ts.
 */
export { getDarkModeScript } from './dark-mode-script';
