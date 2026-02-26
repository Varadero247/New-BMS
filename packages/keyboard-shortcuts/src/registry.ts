// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { KeyboardShortcut, ShortcutRegistry } from './types';

/**
 * Creates a new ShortcutRegistry instance backed by a Map.
 */
export function createShortcutRegistry(): ShortcutRegistry {
  const shortcuts = new Map<string, KeyboardShortcut>();

  return {
    shortcuts,

    register(shortcut: KeyboardShortcut): void {
      if (!shortcut || !shortcut.id) {
        throw new Error('Shortcut must have a valid id');
      }
      shortcuts.set(shortcut.id, { ...shortcut, enabled: shortcut.enabled !== false });
    },

    unregister(id: string): void {
      shortcuts.delete(id);
    },

    getAll(): KeyboardShortcut[] {
      return Array.from(shortcuts.values());
    },

    getByCategory(category: string): KeyboardShortcut[] {
      return Array.from(shortcuts.values()).filter((s) => s.category === category);
    },

    findById(id: string): KeyboardShortcut | undefined {
      return shortcuts.get(id);
    },
  };
}
