// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

const STORAGE_KEY = 'ims-color-mode';

/**
 * Returns a string of inline JavaScript to be injected into <head> before
 * page load. This script reads the stored color mode from localStorage and
 * applies the 'dark' class to documentElement synchronously, preventing a
 * flash of incorrect theme (FOIT/FOUC).
 *
 * Usage in Next.js layout:
 *   <script dangerouslySetInnerHTML={{ __html: getDarkModeScript() }} />
 */
export function getDarkModeScript(): string {
  return `(function(){
  try {
    var STORAGE_KEY = '${STORAGE_KEY}';
    var stored = localStorage.getItem(STORAGE_KEY);
    var mode = (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
    var prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var resolved = mode === 'dark' || (mode === 'system' && prefersDark) ? 'dark' : 'light';
    if (resolved === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch(e) {}
})();`;
}
