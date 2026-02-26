// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import type { KeyboardShortcut } from './types';

const KEY_ALIASES: Record<string, string> = {
  cmd: 'meta',
  command: 'meta',
  win: 'meta',
  windows: 'meta',
  option: 'alt',
  esc: 'escape',
  del: 'delete',
  ins: 'insert',
  pgup: 'pageup',
  pgdn: 'pagedown',
  return: 'enter',
  space: ' ',
};

const DISPLAY_NAMES: Record<string, string> = {
  meta: typeof process !== 'undefined' && process.platform === 'darwin' ? 'Cmd' : 'Win',
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: 'Shift',
  escape: 'Esc',
  enter: 'Enter',
  backspace: 'Backspace',
  delete: 'Delete',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  pageup: 'PgUp',
  pagedown: 'PgDn',
  home: 'Home',
  end: 'End',
  tab: 'Tab',
  insert: 'Ins',
  ' ': 'Space',
};

/**
 * Parses a shortcut string like "Cmd+K" or "Ctrl+Shift+Z" into
 * { modifiers: string[], key: string }.
 */
export function parseShortcut(keys: string): { modifiers: string[]; key: string } {
  if (!keys || typeof keys !== 'string') {
    return { modifiers: [], key: '' };
  }

  // Handle chord sequences (e.g. "G then D")
  const chordMatch = keys.match(/^(.+)\s+then\s+(.+)$/i);
  if (chordMatch) {
    return { modifiers: [], key: keys };
  }

  const parts = keys.split('+').map((p) => p.trim().toLowerCase());
  if (parts.length === 0) return { modifiers: [], key: '' };

  const modifierSet = new Set(['ctrl', 'meta', 'cmd', 'command', 'alt', 'option', 'shift', 'win', 'windows']);
  const modifiers: string[] = [];
  let key = '';

  for (const part of parts) {
    const resolved = KEY_ALIASES[part] || part;
    if (modifierSet.has(part)) {
      const normalized = KEY_ALIASES[part] || part;
      modifiers.push(normalized);
    } else {
      key = resolved;
    }
  }

  // If every part was a modifier, treat the last as the key
  if (!key && parts.length > 0) {
    const last = parts[parts.length - 1];
    key = KEY_ALIASES[last] || last;
    modifiers.pop();
  }

  return { modifiers, key };
}

/**
 * Checks whether a KeyboardEvent matches a given shortcut definition.
 */
export function matchesShortcut(
  event: { ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; shiftKey?: boolean; key?: string },
  shortcut: KeyboardShortcut
): boolean {
  if (!shortcut.key && !shortcut.chord) return false;

  // Chord shortcuts are not matchable via single keydown events
  if (shortcut.chord) return false;

  const mods = shortcut.modifiers || [];
  const wantsCtrl = mods.includes('ctrl');
  const wantsMeta = mods.includes('meta');
  const wantsAlt = mods.includes('alt');
  const wantsShift = mods.includes('shift');

  if (Boolean(event.ctrlKey) !== wantsCtrl) return false;
  if (Boolean(event.metaKey) !== wantsMeta) return false;
  if (Boolean(event.altKey) !== wantsAlt) return false;
  if (Boolean(event.shiftKey) !== wantsShift) return false;

  const eventKey = (event.key || '').toLowerCase();
  const shortcutKey = (shortcut.key || '').toLowerCase();

  return eventKey === shortcutKey;
}

/**
 * Formats a set of modifiers and a key into a display string.
 */
export function formatShortcut(modifiers: string[], key: string): string {
  const parts: string[] = [];

  for (const mod of modifiers) {
    const display = DISPLAY_NAMES[mod.toLowerCase()] || mod;
    parts.push(display);
  }

  if (key) {
    const display = DISPLAY_NAMES[key.toLowerCase()] || key.toUpperCase();
    parts.push(display);
  }

  return parts.join('+');
}

/**
 * Normalizes a key name for display (e.g. 'meta' → 'Cmd' on Mac).
 */
export function normalizeKey(key: string): string {
  if (!key) return '';
  const lower = key.toLowerCase();
  const resolved = KEY_ALIASES[lower] || lower;
  return DISPLAY_NAMES[resolved] || key;
}
