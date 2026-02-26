// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/**
 * Returns true if the keyboard event is the command palette shortcut:
 * Cmd+K (macOS) or Ctrl+K (Windows/Linux).
 */
export function isCommandPaletteShortcut(e: KeyboardEvent): boolean {
  return (e.metaKey || e.ctrlKey) && e.key === 'k';
}

/**
 * Returns true if the event is the Escape key.
 */
export function isEscape(e: KeyboardEvent): boolean {
  return e.key === 'Escape';
}

/**
 * Returns true if the event is the ArrowDown key.
 */
export function isArrowDown(e: KeyboardEvent): boolean {
  return e.key === 'ArrowDown';
}

/**
 * Returns true if the event is the ArrowUp key.
 */
export function isArrowUp(e: KeyboardEvent): boolean {
  return e.key === 'ArrowUp';
}

/**
 * Returns true if the event is the Enter key.
 */
export function isEnter(e: KeyboardEvent): boolean {
  return e.key === 'Enter';
}
