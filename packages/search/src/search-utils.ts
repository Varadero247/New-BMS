// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import type { SearchResultItem, SearchResultGroup, SearchFilters, SearchQuery } from './types';

const MODULE_LABELS: Record<string, string> = {
  quality: 'Quality',
  'health-safety': 'Health & Safety',
  environment: 'Environmental',
  risk: 'Risk',
  hr: 'Human Resources',
  finance: 'Finance',
  esg: 'ESG',
  infosec: 'Information Security',
  cmms: 'CMMS',
  inventory: 'Inventory',
  suppliers: 'Suppliers',
  documents: 'Documents',
  audits: 'Audits',
  incidents: 'Incidents',
  training: 'Training',
  contracts: 'Contracts',
  crm: 'CRM',
  analytics: 'Analytics',
};

const MODULE_ICONS: Record<string, string> = {
  quality: 'clipboard-check',
  'health-safety': 'shield',
  environment: 'leaf',
  risk: 'alert-triangle',
  hr: 'users',
  finance: 'credit-card',
  esg: 'globe',
  infosec: 'lock',
  cmms: 'wrench',
  inventory: 'package',
  suppliers: 'truck',
  documents: 'file-text',
  audits: 'search',
  incidents: 'alert-circle',
  training: 'book',
  contracts: 'file-contract',
  crm: 'user-plus',
  analytics: 'bar-chart',
};

const MODULE_COLORS: Record<string, string> = {
  quality: 'text-blue-600',
  'health-safety': 'text-orange-600',
  environment: 'text-green-600',
  risk: 'text-red-600',
  hr: 'text-purple-600',
  finance: 'text-yellow-600',
  esg: 'text-teal-600',
  infosec: 'text-gray-600',
  cmms: 'text-indigo-600',
  inventory: 'text-pink-600',
  suppliers: 'text-cyan-600',
  documents: 'text-slate-600',
  audits: 'text-violet-600',
  incidents: 'text-rose-600',
  training: 'text-amber-600',
  contracts: 'text-lime-600',
  crm: 'text-emerald-600',
  analytics: 'text-sky-600',
};

/**
 * Group search results by module/type.
 */
export function groupResultsByType(results: SearchResultItem[]): SearchResultGroup[] {
  const groups = new Map<string, SearchResultItem[]>();

  for (const item of results) {
    const existing = groups.get(item.module) ?? [];
    groups.set(item.module, [...existing, item]);
  }

  return Array.from(groups.entries()).map(([module, items]) => ({
    module,
    label: MODULE_LABELS[module] ?? module,
    items,
  }));
}

/**
 * Get the icon name for a module.
 */
export function getModuleIcon(module: string): string {
  return MODULE_ICONS[module] ?? 'file';
}

/**
 * Get the CSS colour class for a module.
 */
export function getModuleColor(module: string): string {
  return MODULE_COLORS[module] ?? 'text-gray-500';
}

/**
 * Format a search result item as a human-readable label.
 */
export function formatSearchResult(item: SearchResultItem): string {
  const ref = item.ref ? `[${item.ref}] ` : '';
  return `${ref}${item.title}`;
}

/**
 * Build a URL query string from a search query object.
 */
export function buildSearchUrl(query: string, filters?: SearchFilters): string {
  const params: Record<string, string> = { q: query };
  if (filters?.type) params['type'] = filters.type;
  if (filters?.module) params['module'] = filters.module;
  if (filters?.status) params['status'] = filters.status;
  if (filters?.dateFrom) params['dateFrom'] = filters.dateFrom;
  if (filters?.dateTo) params['dateTo'] = filters.dateTo;

  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
  return `/search?${qs}`;
}

/**
 * Parse URL query params into a SearchQuery object.
 */
export function parseSearchUrl(urlSearch: string): SearchQuery {
  const params: Record<string, string> = {};
  const search = urlSearch.startsWith('?') ? urlSearch.slice(1) : urlSearch;

  for (const pair of search.split('&')) {
    const [k, v] = pair.split('=');
    if (k) params[decodeURIComponent(k)] = decodeURIComponent(v ?? '');
  }

  return {
    q: params['q'] ?? '',
    type: (params['type'] as any) ?? undefined,
    limit: params['limit'] ? Number(params['limit']) : undefined,
    offset: params['offset'] ? Number(params['offset']) : undefined,
    sort: (params['sort'] as any) ?? undefined,
    filters: {
      module: params['module'],
      status: params['status'],
      dateFrom: params['dateFrom'],
      dateTo: params['dateTo'],
    },
  };
}

/**
 * Simple debounce utility.
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

/**
 * Extract highlighted snippet from a longer text.
 */
export function extractSnippet(text: string, query: string, maxLength = 150): string {
  if (!text) return '';
  const lower = text.toLowerCase();
  const qLower = query.toLowerCase();
  const idx = lower.indexOf(qLower);
  if (idx === -1) return text.slice(0, maxLength);
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + query.length + 60);
  const snippet = text.slice(start, end);
  return (start > 0 ? '...' : '') + snippet + (end < text.length ? '...' : '');
}
