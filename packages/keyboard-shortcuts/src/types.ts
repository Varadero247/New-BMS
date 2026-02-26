// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export type ModifierKey = 'ctrl' | 'meta' | 'alt' | 'shift';
export type ShortcutKey = string; // e.g. 'k', 'ArrowUp', 'Enter', '/'

export interface KeyboardShortcut {
  id: string;
  keys: string; // display string e.g. "Cmd+K" or "G then D"
  description: string;
  category: string;
  modifiers?: ModifierKey[];
  key?: ShortcutKey;
  chord?: [string, string]; // two-key chord sequence
  enabled?: boolean;
  action?: () => void;
}

export interface ShortcutGroup {
  category: string;
  shortcuts: KeyboardShortcut[];
}

export interface ShortcutRegistry {
  shortcuts: Map<string, KeyboardShortcut>;
  register(shortcut: KeyboardShortcut): void;
  unregister(id: string): void;
  getAll(): KeyboardShortcut[];
  getByCategory(category: string): KeyboardShortcut[];
  findById(id: string): KeyboardShortcut | undefined;
}
