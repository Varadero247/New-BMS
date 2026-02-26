// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

export const COLLAB_COLORS: string[] = [
  '#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6',
  '#1abc9c', '#e67e22', '#34495e', '#e91e63', '#00bcd4',
  '#ff5722', '#607d8b', '#8bc34a', '#ff9800', '#673ab7',
  '#03a9f4', '#f44336', '#4caf50', '#ffeb3b', '#795548',
];

/**
 * Assigns a color from the palette that is not already in use.
 * Falls back to a deterministic color from userId hash if all are taken.
 */
export function assignColor(userId: string, usedColors: Set<string>): string {
  for (const color of COLLAB_COLORS) {
    if (!usedColors.has(color)) return color;
  }
  // all palette colors used — fall back to deterministic hash color
  return getColorForUser(userId);
}

/**
 * Deterministically derives a hex color from a userId by hashing its characters.
 * This ensures the same user always gets the same fallback color.
 */
export function getColorForUser(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  // Map to palette index first for nice colors
  const index = hash % COLLAB_COLORS.length;
  return COLLAB_COLORS[index];
}
