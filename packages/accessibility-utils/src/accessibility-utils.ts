// Copyright (c) 2026 Nexara DMCC. All rights reserved.

// ---------------------------------------------------------------------------
// ARIA utilities
// ---------------------------------------------------------------------------

/**
 * Returns an ARIA label attribute map for a given role and label.
 */
export function ariaLabel(element: string, label: string): Record<string, string> {
  return { role: element, 'aria-label': label };
}

/**
 * Returns an aria-describedby attribute map for a given ID.
 */
export function ariaDescribedBy(id: string): Record<string, string> {
  return { 'aria-describedby': id };
}

/**
 * Returns an aria-live attribute map.
 */
export function ariaLive(politeness: 'polite' | 'assertive' | 'off'): Record<string, string> {
  return { 'aria-live': politeness };
}

/**
 * Returns an aria-expanded attribute map.
 */
export function ariaExpanded(expanded: boolean): Record<string, string> {
  return { 'aria-expanded': String(expanded) };
}

/**
 * Returns an aria-hidden attribute map.
 */
export function ariaHidden(hidden: boolean): Record<string, string> {
  return { 'aria-hidden': String(hidden) };
}

/**
 * Returns an aria-required attribute map.
 */
export function ariaRequired(required: boolean): Record<string, string> {
  return { 'aria-required': String(required) };
}

/**
 * Returns an aria-invalid attribute map.
 */
export function ariaInvalid(invalid: boolean): Record<string, string> {
  return { 'aria-invalid': String(invalid) };
}

/**
 * Returns an aria-checked attribute map.
 */
export function ariaChecked(checked: boolean | 'mixed'): Record<string, string> {
  return { 'aria-checked': String(checked) };
}

/**
 * Returns an aria-disabled attribute map.
 */
export function ariaDisabled(disabled: boolean): Record<string, string> {
  return { 'aria-disabled': String(disabled) };
}

/**
 * Returns an aria-selected attribute map.
 */
export function ariaSelected(selected: boolean): Record<string, string> {
  return { 'aria-selected': String(selected) };
}

/**
 * Returns an aria-pressed attribute map.
 */
export function ariaPressed(pressed: boolean | 'mixed'): Record<string, string> {
  return { 'aria-pressed': String(pressed) };
}

// ---------------------------------------------------------------------------
// Color contrast (WCAG)
// ---------------------------------------------------------------------------

/**
 * Computes relative luminance from linearised RGB components (each 0–255).
 * Formula: https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
 */
export function getRelativeLuminance(r: number, g: number, b: number): number {
  const linearise = (c: number): number => {
    const sRGB = c / 255;
    return sRGB <= 0.04045 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linearise(r) + 0.7152 * linearise(g) + 0.0722 * linearise(b);
}

/**
 * Computes the WCAG contrast ratio between two relative luminance values.
 * l1 and l2 can be in any order; the function picks the lighter one automatically.
 */
export function getContrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Returns true if the contrast ratio meets WCAG AA (≥ 4.5:1).
 */
export function passesAA(ratio: number): boolean {
  return ratio >= 4.5;
}

/**
 * Returns true if the contrast ratio meets WCAG AAA (≥ 7.0:1).
 */
export function passesAAA(ratio: number): boolean {
  return ratio >= 7.0;
}

/**
 * Returns true if the contrast ratio meets WCAG AA Large text (≥ 3.0:1).
 */
export function passesAALarge(ratio: number): boolean {
  return ratio >= 3.0;
}

// ---------------------------------------------------------------------------
// Focus management helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if an element with the given tabIndex and disabled state is
 * focusable.  An element is focusable if tabIndex >= 0 and not disabled.
 */
export function isFocusable(tabIndex: number, disabled: boolean): boolean {
  return !disabled && tabIndex >= 0;
}

/**
 * Returns a CSS selector string for all natively focusable elements.
 */
export function getFocusableSelector(): string {
  return [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');
}

// ---------------------------------------------------------------------------
// Keyboard navigation
// ---------------------------------------------------------------------------

/**
 * Returns true if the key is one of the four arrow keys.
 */
export function isArrowKey(key: string): boolean {
  return ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key);
}

/**
 * Returns true if the key is Enter or Space (both activate interactive elements).
 */
export function isEnterOrSpace(key: string): boolean {
  return key === 'Enter' || key === ' ';
}

/**
 * Returns true if the key is Escape.
 */
export function isEscapeKey(key: string): boolean {
  return key === 'Escape';
}

/**
 * Returns the next focused index in a list, supporting both looping and clamping.
 * @param current  The current zero-based index.
 * @param total    The total number of items.
 * @param direction 1 for next, -1 for previous.
 * @param loop     When true the list wraps around (default: true).
 */
export function getNextIndex(
  current: number,
  total: number,
  direction: 1 | -1,
  loop = true,
): number {
  if (total <= 0) return 0;
  const next = current + direction;
  if (loop) {
    return ((next % total) + total) % total;
  }
  return Math.max(0, Math.min(total - 1, next));
}

// ---------------------------------------------------------------------------
// Screen reader text
// ---------------------------------------------------------------------------

/**
 * Returns a class-name string that applies visually-hidden (sr-only) styling.
 * The text itself is passed through so callers can use it as a label value.
 */
export function srOnly(text: string): string {
  return `sr-only:${text}`;
}

/** Counter used to guarantee unique IDs within a process. */
let _idCounter = 0;

/**
 * Generates a unique DOM-safe ID string.
 * @param prefix Optional prefix (defaults to "ims").
 */
export function generateId(prefix = 'ims'): string {
  _idCounter += 1;
  return `${prefix}-${_idCounter}`;
}

// ---------------------------------------------------------------------------
// Role validation
// ---------------------------------------------------------------------------

const VALID_ARIA_ROLES = new Set([
  // Abstract roles (informational)
  'command', 'composite', 'input', 'landmark', 'range', 'roletype',
  'section', 'sectionhead', 'select', 'structure', 'widget', 'window',
  // Widget roles
  'alert', 'alertdialog', 'button', 'checkbox', 'dialog', 'gridcell',
  'link', 'log', 'marquee', 'menuitem', 'menuitemcheckbox', 'menuitemradio',
  'option', 'progressbar', 'radio', 'scrollbar', 'searchbox', 'separator',
  'slider', 'spinbutton', 'status', 'switch', 'tab', 'tabpanel',
  'textbox', 'timer', 'tooltip', 'treeitem',
  // Composite roles
  'combobox', 'grid', 'listbox', 'menu', 'menubar', 'radiogroup',
  'tablist', 'tree', 'treegrid',
  // Document structure roles
  'application', 'article', 'blockquote', 'caption', 'cell', 'columnheader',
  'definition', 'deletion', 'directory', 'document', 'emphasis', 'feed',
  'figure', 'generic', 'group', 'heading', 'img', 'insertion', 'list',
  'listitem', 'math', 'meter', 'none', 'note', 'paragraph', 'presentation',
  'row', 'rowgroup', 'rowheader', 'strong', 'subscript', 'superscript',
  'table', 'term', 'time', 'toolbar',
  // Landmark roles
  'banner', 'complementary', 'contentinfo', 'form', 'main', 'navigation',
  'region', 'search',
]);

const LANDMARK_ROLES = new Set([
  'banner', 'complementary', 'contentinfo', 'form', 'main',
  'navigation', 'region', 'search',
]);

const WIDGET_ROLES = new Set([
  'alert', 'alertdialog', 'button', 'checkbox', 'combobox', 'dialog',
  'gridcell', 'link', 'listbox', 'log', 'marquee', 'menu', 'menubar',
  'menuitem', 'menuitemcheckbox', 'menuitemradio', 'option', 'progressbar',
  'radio', 'radiogroup', 'scrollbar', 'searchbox', 'separator', 'slider',
  'spinbutton', 'status', 'switch', 'tab', 'tablist', 'tabpanel',
  'textbox', 'timer', 'tooltip', 'tree', 'treegrid', 'treeitem',
]);

/**
 * Returns true if the given string is a valid WAI-ARIA role.
 */
export function isValidAriaRole(role: string): boolean {
  return VALID_ARIA_ROLES.has(role);
}

/**
 * Returns true if the role is a WAI-ARIA landmark role.
 */
export function isLandmarkRole(role: string): boolean {
  return LANDMARK_ROLES.has(role);
}

/**
 * Returns true if the role is a WAI-ARIA widget role.
 */
export function isWidgetRole(role: string): boolean {
  return WIDGET_ROLES.has(role);
}
