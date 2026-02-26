// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

export const RECENT_KEY = 'ims-command-palette-recent';

/**
 * Reads the list of recently used command IDs from localStorage.
 * Returns up to `max` items. Handles malformed JSON gracefully.
 */
export function getRecentCommandIds(max = 10): string[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === 'string')
      .slice(0, max);
  } catch {
    return [];
  }
}

/**
 * Adds a command ID to the front of the recent list.
 * Deduplicates (removes existing occurrence) and trims to `max` length.
 * Persists the updated list to localStorage.
 */
export function addRecentCommandId(id: string, max = 10): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const current = getRecentCommandIds(1000); // get all before trimming
    const deduped = current.filter((item) => item !== id);
    const updated = [id, ...deduped].slice(0, max);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clears the recent commands list from localStorage.
 */
export function clearRecentCommands(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(RECENT_KEY);
}
