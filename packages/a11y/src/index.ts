/**
 * Accessibility Utilities for IMS Web Applications
 * WCAG 2.2 AA Compliance Helpers
 */

// Skip Navigation Link component config
export const SKIP_NAV_ID = 'main-content';

export interface SkipNavConfig {
  targetId: string;
  label: string;
}

export const defaultSkipNav: SkipNavConfig = {
  targetId: SKIP_NAV_ID,
  label: 'Skip to main content',
};

// Color contrast checker (WCAG 2.2 AA requires 4.5:1 for normal text, 3:1 for large text)
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function meetsWCAGAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

export function meetsWCAGAAA(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// ARIA Live Region helpers
export type AriaLiveRegion = 'polite' | 'assertive' | 'off';

export function getAriaLiveProps(type: 'status' | 'alert' | 'log') {
  switch (type) {
    case 'alert':
      return { 'aria-live': 'assertive' as const, role: 'alert' };
    case 'status':
      return { 'aria-live': 'polite' as const, role: 'status' };
    case 'log':
      return { 'aria-live': 'polite' as const, role: 'log' };
  }
}

// Keyboard navigation helpers
export const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable]',
].join(', ');

export function trapFocus(container: HTMLElement) {
  const focusable = container.querySelectorAll(FOCUSABLE_SELECTOR);
  const first = focusable[0] as HTMLElement;
  const last = focusable[focusable.length - 1] as HTMLElement;

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', handleKeyDown);
  return () => container.removeEventListener('keydown', handleKeyDown);
}

// Form error association helper
export function getFieldErrorId(fieldName: string): string {
  return `${fieldName}-error`;
}

export function getFieldDescribedBy(fieldName: string, hasError: boolean): string | undefined {
  return hasError ? getFieldErrorId(fieldName) : undefined;
}
