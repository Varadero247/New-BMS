// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/**
 * Web App Manifest Generator — Creates per-module PWA manifests
 * Generates W3C Web App Manifest JSON for IMS modules with custom icons and theme colors.
 */

export interface ManifestConfig {
  name: string;
  shortName: string;
  description?: string;
  startUrl: string;
  themeColor: string;
  backgroundColor: string;
  display?: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  orientation?: 'portrait' | 'landscape' | 'any';
  icons?: ManifestIcon[];
  categories?: string[];
  lang?: string;
  scope?: string;
}

export interface ManifestIcon {
  src: string;
  sizes: string;
  type: string;
  purpose?: 'any' | 'maskable' | 'monochrome';
}

const DEFAULT_ICONS: ManifestIcon[] = [
  { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png' },
  { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
  { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
  { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
  { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
  { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
  { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
  { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
];

/** Module-specific theme colors */
const MODULE_THEMES: Record<string, { themeColor: string; backgroundColor: string }> = {
  dashboard: { themeColor: '#2563eb', backgroundColor: '#f8fafc' },
  'health-safety': { themeColor: '#dc2626', backgroundColor: '#fef2f2' },
  environment: { themeColor: '#16a34a', backgroundColor: '#f0fdf4' },
  quality: { themeColor: '#9333ea', backgroundColor: '#faf5ff' },
  hr: { themeColor: '#0891b2', backgroundColor: '#ecfeff' },
  finance: { themeColor: '#059669', backgroundColor: '#ecfdf5' },
  crm: { themeColor: '#2563eb', backgroundColor: '#eff6ff' },
  infosec: { themeColor: '#7c3aed', backgroundColor: '#f5f3ff' },
  esg: { themeColor: '#16a34a', backgroundColor: '#f0fdf4' },
  risk: { themeColor: '#ea580c', backgroundColor: '#fff7ed' },
  chemicals: { themeColor: '#ca8a04', backgroundColor: '#fefce8' },
  emergency: { themeColor: '#dc2626', backgroundColor: '#fef2f2' },
  'field-service': { themeColor: '#0284c7', backgroundColor: '#f0f9ff' },
};

/**
 * Generate a W3C Web App Manifest for a given module.
 */
export function generateManifest(config: ManifestConfig): Record<string, unknown> {
  return {
    name: config.name,
    short_name: config.shortName,
    description: config.description || `${config.name} — IMS Platform`,
    start_url: config.startUrl,
    display: config.display || 'standalone',
    orientation: config.orientation || 'any',
    theme_color: config.themeColor,
    background_color: config.backgroundColor,
    icons: config.icons || DEFAULT_ICONS,
    categories: config.categories || ['business', 'productivity'],
    lang: config.lang || 'en',
    scope: config.scope || '/',
    prefer_related_applications: false,
  };
}

/**
 * Generate a manifest for a specific IMS module by name.
 */
export function generateModuleManifest(
  moduleName: string,
  moduleLabel: string,
  port: number
): Record<string, unknown> {
  const theme = MODULE_THEMES[moduleName] || { themeColor: '#2563eb', backgroundColor: '#f8fafc' };

  return generateManifest({
    name: `${moduleLabel} — IMS`,
    shortName: moduleLabel,
    description: `${moduleLabel} module for the Integrated Management System`,
    startUrl: `http://localhost:${port}`,
    themeColor: theme.themeColor,
    backgroundColor: theme.backgroundColor,
    scope: '/',
  });
}

/**
 * Inject or update the manifest link tag in the document head.
 * Call this on app mount to dynamically set the manifest.
 */
export function injectManifest(manifest: Record<string, unknown>): void {
  if (typeof document === 'undefined') return;

  const blob = new Blob([JSON.stringify(manifest)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'manifest';
    document.head.appendChild(link);
  }

  // Revoke previous blob URL if exists
  if (link.href.startsWith('blob:')) {
    URL.revokeObjectURL(link.href);
  }

  link.href = url;
}

/**
 * Update the theme-color meta tag.
 */
export function setThemeColor(color: string): void {
  if (typeof document === 'undefined') return;

  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'theme-color';
    document.head.appendChild(meta);
  }
  meta.content = color;
}
