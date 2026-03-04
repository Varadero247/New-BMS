// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  groupResultsByType,
  getModuleIcon,
  getModuleColor,
  formatSearchResult,
  buildSearchUrl,
  parseSearchUrl,
  debounce,
  extractSnippet,
} from '../search-utils';
import { createSearchClient } from '../search-client';
import type { SearchResultItem, SearchFilters } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeItem(overrides: Partial<SearchResultItem> = {}): SearchResultItem {
  return {
    id: 'item-1',
    type: 'ncr',
    title: 'NCR-2026-001',
    module: 'quality',
    url: '/quality/ncr/item-1',
    ...overrides,
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// groupResultsByType
// ═════════════════════════════════════════════════════════════════════════════

describe('groupResultsByType', () => {
  it('empty array → []', () => expect(groupResultsByType([])).toEqual([]));
  it('single item → one group', () => {
    const result = groupResultsByType([makeItem()]);
    expect(result).toHaveLength(1);
  });
  it('group has correct module', () => {
    const result = groupResultsByType([makeItem({ module: 'quality' })]);
    expect(result[0].module).toBe('quality');
  });
  it('group has correct label for known module', () => {
    const result = groupResultsByType([makeItem({ module: 'quality' })]);
    expect(result[0].label).toBe('Quality');
  });
  it('group label for health-safety', () => {
    const result = groupResultsByType([makeItem({ module: 'health-safety' })]);
    expect(result[0].label).toBe('Health & Safety');
  });
  it('group label for hr', () => {
    const result = groupResultsByType([makeItem({ module: 'hr' })]);
    expect(result[0].label).toBe('Human Resources');
  });
  it('group label for unknown module → module name', () => {
    const result = groupResultsByType([makeItem({ module: 'unknown' })]);
    expect(result[0].label).toBe('unknown');
  });
  it('items from same module in one group', () => {
    const items = [
      makeItem({ id: 'a', module: 'quality' }),
      makeItem({ id: 'b', module: 'quality' }),
    ];
    const result = groupResultsByType(items);
    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(2);
  });
  it('items from different modules in different groups', () => {
    const items = [
      makeItem({ id: 'a', module: 'quality' }),
      makeItem({ id: 'b', module: 'hr' }),
    ];
    const result = groupResultsByType(items);
    expect(result).toHaveLength(2);
  });
  it('groups preserve all items', () => {
    const items = [
      makeItem({ id: 'a', module: 'quality' }),
      makeItem({ id: 'b', module: 'quality' }),
      makeItem({ id: 'c', module: 'hr' }),
    ];
    const result = groupResultsByType(items);
    const total = result.reduce((sum, g) => sum + g.items.length, 0);
    expect(total).toBe(3);
  });
  it('returns array', () => expect(Array.isArray(groupResultsByType([]))).toBe(true));
  it('each group has module, label, items properties', () => {
    const result = groupResultsByType([makeItem()]);
    expect(result[0]).toHaveProperty('module');
    expect(result[0]).toHaveProperty('label');
    expect(result[0]).toHaveProperty('items');
  });
  it('group items is array', () => {
    const result = groupResultsByType([makeItem()]);
    expect(Array.isArray(result[0].items)).toBe(true);
  });
  it('group for environment', () => {
    const result = groupResultsByType([makeItem({ module: 'environment' })]);
    expect(result[0].label).toBe('Environmental');
  });
  it('group for finance', () => {
    const result = groupResultsByType([makeItem({ module: 'finance' })]);
    expect(result[0].label).toBe('Finance');
  });
  it('group for esg', () => {
    const result = groupResultsByType([makeItem({ module: 'esg' })]);
    expect(result[0].label).toBe('ESG');
  });
  it('group for risk', () => {
    const result = groupResultsByType([makeItem({ module: 'risk' })]);
    expect(result[0].label).toBe('Risk');
  });
  it('group for infosec', () => {
    const result = groupResultsByType([makeItem({ module: 'infosec' })]);
    expect(result[0].label).toBe('Information Security');
  });
  it('group for cmms', () => {
    const result = groupResultsByType([makeItem({ module: 'cmms' })]);
    expect(result[0].label).toBe('CMMS');
  });
  it('10 items same module → 1 group of 10', () => {
    const items = Array.from({ length: 10 }, (_, i) => makeItem({ id: `i${i}`, module: 'quality' }));
    const result = groupResultsByType(items);
    expect(result).toHaveLength(1);
    expect(result[0].items).toHaveLength(10);
  });
  it('3 modules → 3 groups', () => {
    const items = [
      makeItem({ module: 'quality' }),
      makeItem({ module: 'hr' }),
      makeItem({ module: 'finance' }),
    ];
    const result = groupResultsByType(items);
    expect(result).toHaveLength(3);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// getModuleIcon
// ═════════════════════════════════════════════════════════════════════════════

describe('getModuleIcon', () => {
  it('quality → clipboard-check', () => expect(getModuleIcon('quality')).toBe('clipboard-check'));
  it('health-safety → shield', () => expect(getModuleIcon('health-safety')).toBe('shield'));
  it('environment → leaf', () => expect(getModuleIcon('environment')).toBe('leaf'));
  it('risk → alert-triangle', () => expect(getModuleIcon('risk')).toBe('alert-triangle'));
  it('hr → users', () => expect(getModuleIcon('hr')).toBe('users'));
  it('finance → credit-card', () => expect(getModuleIcon('finance')).toBe('credit-card'));
  it('esg → globe', () => expect(getModuleIcon('esg')).toBe('globe'));
  it('infosec → lock', () => expect(getModuleIcon('infosec')).toBe('lock'));
  it('cmms → wrench', () => expect(getModuleIcon('cmms')).toBe('wrench'));
  it('inventory → package', () => expect(getModuleIcon('inventory')).toBe('package'));
  it('suppliers → truck', () => expect(getModuleIcon('suppliers')).toBe('truck'));
  it('documents → file-text', () => expect(getModuleIcon('documents')).toBe('file-text'));
  it('audits → search', () => expect(getModuleIcon('audits')).toBe('search'));
  it('incidents → alert-circle', () => expect(getModuleIcon('incidents')).toBe('alert-circle'));
  it('training → book', () => expect(getModuleIcon('training')).toBe('book'));
  it('contracts → file-contract', () => expect(getModuleIcon('contracts')).toBe('file-contract'));
  it('crm → user-plus', () => expect(getModuleIcon('crm')).toBe('user-plus'));
  it('analytics → bar-chart', () => expect(getModuleIcon('analytics')).toBe('bar-chart'));
  it('unknown module → file (default)', () => expect(getModuleIcon('unknown')).toBe('file'));
  it('empty string → file (default)', () => expect(getModuleIcon('')).toBe('file'));
  it('returns string', () => expect(typeof getModuleIcon('quality')).toBe('string'));
  it('all known modules return non-empty string', () => {
    const known = ['quality', 'health-safety', 'environment', 'risk', 'hr', 'finance', 'esg', 'infosec', 'cmms', 'inventory', 'suppliers', 'documents', 'audits', 'incidents', 'training', 'contracts', 'crm', 'analytics'];
    known.forEach(m => expect(getModuleIcon(m).length).toBeGreaterThan(0));
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// getModuleColor
// ═════════════════════════════════════════════════════════════════════════════

describe('getModuleColor', () => {
  it('quality → text-blue-600', () => expect(getModuleColor('quality')).toBe('text-blue-600'));
  it('health-safety → text-orange-600', () => expect(getModuleColor('health-safety')).toBe('text-orange-600'));
  it('environment → text-green-600', () => expect(getModuleColor('environment')).toBe('text-green-600'));
  it('risk → text-red-600', () => expect(getModuleColor('risk')).toBe('text-red-600'));
  it('hr → text-purple-600', () => expect(getModuleColor('hr')).toBe('text-purple-600'));
  it('finance → text-yellow-600', () => expect(getModuleColor('finance')).toBe('text-yellow-600'));
  it('esg → text-teal-600', () => expect(getModuleColor('esg')).toBe('text-teal-600'));
  it('infosec → text-gray-600', () => expect(getModuleColor('infosec')).toBe('text-gray-600'));
  it('cmms → text-indigo-600', () => expect(getModuleColor('cmms')).toBe('text-indigo-600'));
  it('inventory → text-pink-600', () => expect(getModuleColor('inventory')).toBe('text-pink-600'));
  it('suppliers → text-cyan-600', () => expect(getModuleColor('suppliers')).toBe('text-cyan-600'));
  it('documents → text-slate-600', () => expect(getModuleColor('documents')).toBe('text-slate-600'));
  it('audits → text-violet-600', () => expect(getModuleColor('audits')).toBe('text-violet-600'));
  it('incidents → text-rose-600', () => expect(getModuleColor('incidents')).toBe('text-rose-600'));
  it('training → text-amber-600', () => expect(getModuleColor('training')).toBe('text-amber-600'));
  it('contracts → text-lime-600', () => expect(getModuleColor('contracts')).toBe('text-lime-600'));
  it('crm → text-emerald-600', () => expect(getModuleColor('crm')).toBe('text-emerald-600'));
  it('analytics → text-sky-600', () => expect(getModuleColor('analytics')).toBe('text-sky-600'));
  it('unknown → text-gray-500 (default)', () => expect(getModuleColor('unknown')).toBe('text-gray-500'));
  it('empty string → text-gray-500 (default)', () => expect(getModuleColor('')).toBe('text-gray-500'));
  it('returns string', () => expect(typeof getModuleColor('quality')).toBe('string'));
  it('all colors start with text-', () => {
    const known = ['quality', 'health-safety', 'environment', 'risk', 'hr', 'finance', 'esg', 'infosec'];
    known.forEach(m => expect(getModuleColor(m).startsWith('text-')).toBe(true));
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// formatSearchResult
// ═════════════════════════════════════════════════════════════════════════════

describe('formatSearchResult', () => {
  it('item with ref → [ref] title', () => {
    const result = formatSearchResult(makeItem({ ref: 'NCR-001', title: 'Test NCR' }));
    expect(result).toBe('[NCR-001] Test NCR');
  });
  it('item without ref → title only', () => {
    const result = formatSearchResult(makeItem({ ref: undefined, title: 'Test NCR' }));
    expect(result).toBe('Test NCR');
  });
  it('ref prefix in result', () => {
    const result = formatSearchResult(makeItem({ ref: 'INC-2026-001' }));
    expect(result).toContain('[INC-2026-001]');
  });
  it('title included in result', () => {
    const result = formatSearchResult(makeItem({ title: 'My Title' }));
    expect(result).toContain('My Title');
  });
  it('returns string', () => expect(typeof formatSearchResult(makeItem())).toBe('string'));
  it('empty ref → title only', () => {
    const result = formatSearchResult(makeItem({ ref: '', title: 'Test' }));
    // '' is falsy → no prefix
    expect(result).toBe('Test');
  });
  it('long title preserved', () => {
    const title = 'A '.repeat(50).trim();
    const result = formatSearchResult(makeItem({ title }));
    expect(result).toContain(title);
  });
  it('special chars in title preserved', () => {
    const result = formatSearchResult(makeItem({ title: 'Test (ISO 9001) — NCR' }));
    expect(result).toContain('Test (ISO 9001)');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// buildSearchUrl
// ═════════════════════════════════════════════════════════════════════════════

describe('buildSearchUrl', () => {
  it('returns /search?q=...', () => {
    expect(buildSearchUrl('test')).toContain('/search?');
  });
  it('query included', () => {
    expect(buildSearchUrl('hello')).toContain('q=hello');
  });
  it('type filter included', () => {
    const url = buildSearchUrl('test', { type: 'ncr' });
    expect(url).toContain('type=ncr');
  });
  it('module filter included', () => {
    const url = buildSearchUrl('test', { module: 'quality' });
    expect(url).toContain('module=quality');
  });
  it('status filter included', () => {
    const url = buildSearchUrl('test', { status: 'OPEN' });
    expect(url).toContain('status=OPEN');
  });
  it('dateFrom filter included', () => {
    const url = buildSearchUrl('test', { dateFrom: '2026-01-01' });
    expect(url).toContain('dateFrom=2026-01-01');
  });
  it('dateTo filter included', () => {
    const url = buildSearchUrl('test', { dateTo: '2026-12-31' });
    expect(url).toContain('dateTo=2026-12-31');
  });
  it('undefined filter keys not included', () => {
    const url = buildSearchUrl('test', { type: undefined });
    expect(url).not.toContain('type=');
  });
  it('empty filters → only q param', () => {
    const url = buildSearchUrl('test', {});
    expect(url).toBe('/search?q=test');
  });
  it('all filters combined', () => {
    const url = buildSearchUrl('ncr', { type: 'ncr', module: 'quality', status: 'OPEN' });
    expect(url).toContain('type=ncr');
    expect(url).toContain('module=quality');
    expect(url).toContain('status=OPEN');
  });
  it('special chars in query encoded', () => {
    const url = buildSearchUrl('hello world');
    expect(url).toContain('hello');
  });
  it('returns string', () => expect(typeof buildSearchUrl('test')).toBe('string'));
  it('no filters argument → only q', () => {
    const url = buildSearchUrl('test');
    expect(url).toBe('/search?q=test');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// parseSearchUrl
// ═════════════════════════════════════════════════════════════════════════════

describe('parseSearchUrl', () => {
  it('parses q param', () => {
    const result = parseSearchUrl('?q=hello');
    expect(result.q).toBe('hello');
  });
  it('parses type param', () => {
    const result = parseSearchUrl('?q=test&type=ncr');
    expect(result.type).toBe('ncr');
  });
  it('parses module param', () => {
    const result = parseSearchUrl('?q=test&module=quality');
    expect(result.filters?.module).toBe('quality');
  });
  it('parses status param', () => {
    const result = parseSearchUrl('?q=test&status=OPEN');
    expect(result.filters?.status).toBe('OPEN');
  });
  it('parses dateFrom param', () => {
    const result = parseSearchUrl('?q=test&dateFrom=2026-01-01');
    expect(result.filters?.dateFrom).toBe('2026-01-01');
  });
  it('parses dateTo param', () => {
    const result = parseSearchUrl('?q=test&dateTo=2026-12-31');
    expect(result.filters?.dateTo).toBe('2026-12-31');
  });
  it('parses limit param', () => {
    const result = parseSearchUrl('?q=test&limit=20');
    expect(result.limit).toBe(20);
  });
  it('parses offset param', () => {
    const result = parseSearchUrl('?q=test&offset=10');
    expect(result.offset).toBe(10);
  });
  it('parses sort param', () => {
    const result = parseSearchUrl('?q=test&sort=date');
    expect(result.sort).toBe('date');
  });
  it('empty string → q empty', () => {
    const result = parseSearchUrl('');
    expect(result.q).toBe('');
  });
  it('handles ? prefix', () => {
    const result = parseSearchUrl('?q=hello');
    expect(result.q).toBe('hello');
  });
  it('handles no ? prefix', () => {
    const result = parseSearchUrl('q=hello');
    expect(result.q).toBe('hello');
  });
  it('returns object', () => {
    expect(typeof parseSearchUrl('?q=test')).toBe('object');
  });
  it('result has q property', () => {
    expect(parseSearchUrl('?q=test')).toHaveProperty('q');
  });
  it('result has filters property', () => {
    expect(parseSearchUrl('?q=test')).toHaveProperty('filters');
  });
  it('round-trip: buildSearchUrl then parseSearchUrl', () => {
    const url = buildSearchUrl('ncr', { type: 'ncr', module: 'quality' });
    const params = url.split('?')[1];
    const parsed = parseSearchUrl(params);
    expect(parsed.q).toBe('ncr');
    expect(parsed.filters?.module).toBe('quality');
  });
  it('unknown params ignored gracefully', () => {
    const result = parseSearchUrl('?q=test&unknown=value');
    expect(result.q).toBe('test');
  });
  it('all params combined', () => {
    const result = parseSearchUrl('?q=hello&type=ncr&limit=20&offset=5&sort=relevance&module=quality');
    expect(result.q).toBe('hello');
    expect(result.type).toBe('ncr');
    expect(result.limit).toBe(20);
    expect(result.offset).toBe(5);
    expect(result.sort).toBe('relevance');
    expect(result.filters?.module).toBe('quality');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// extractSnippet
// ═════════════════════════════════════════════════════════════════════════════

describe('extractSnippet', () => {
  it('empty text → empty', () => expect(extractSnippet('', 'test')).toBe(''));
  it('null text → empty', () => expect(extractSnippet(null as any, 'test')).toBe(''));
  it('query found → includes query text', () => {
    const text = 'This is a test string for the quality module';
    const snippet = extractSnippet(text, 'quality');
    expect(snippet).toContain('quality');
  });
  it('query not found → returns beginning of text', () => {
    const text = 'This is some text without the keyword';
    const snippet = extractSnippet(text, 'xyz');
    expect(snippet).toBe(text.slice(0, 150));
  });
  it('respects maxLength parameter', () => {
    const text = 'a'.repeat(300);
    const snippet = extractSnippet(text, 'z');
    expect(snippet.length).toBeLessThanOrEqual(150);
  });
  it('custom maxLength — not found returns first N chars', () => {
    const text = 'abcdefghijklmnopqrstuvwxyz';
    const snippet = extractSnippet(text, 'nothere', 10);
    expect(snippet.length).toBeLessThanOrEqual(10);
    expect(snippet).toBe('abcdefghij');
  });
  it('query at start → no leading ...', () => {
    const text = 'quality management system';
    const snippet = extractSnippet(text, 'quality');
    expect(snippet.startsWith('...')).toBe(false);
  });
  it('query in middle → may have leading ...', () => {
    const text = 'a'.repeat(200) + 'quality' + 'b'.repeat(200);
    const snippet = extractSnippet(text, 'quality');
    expect(snippet).toContain('quality');
  });
  it('query at end → trailing ellipsis if text continues', () => {
    const text = 'a'.repeat(200) + 'quality';
    const snippet = extractSnippet(text, 'quality');
    expect(snippet).toContain('quality');
  });
  it('returns string', () => expect(typeof extractSnippet('test text', 'test')).toBe('string'));
  it('short text returned as-is when no match', () => {
    const text = 'short text';
    const snippet = extractSnippet(text, 'xyz');
    expect(snippet).toBe(text);
  });
  it('text length ≤ maxLength with no match → full text', () => {
    const text = 'hello world';
    expect(extractSnippet(text, 'xyz')).toBe(text);
  });
  it('case-insensitive snippet extraction', () => {
    const text = 'ISO 9001 Quality Management System';
    const snippet = extractSnippet(text, 'quality');
    expect(snippet).toContain('Quality');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// debounce
// ═════════════════════════════════════════════════════════════════════════════

describe('debounce', () => {
  beforeEach(() => { jest.useFakeTimers(); });
  afterEach(() => { jest.useRealTimers(); });

  it('does not call fn immediately', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    expect(fn).not.toHaveBeenCalled();
  });
  it('calls fn after delay', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('calls fn with last args', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    debounced('first');
    debounced('second');
    debounced('last');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('last');
  });
  it('resets timer on each call', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    debounced('a');
    jest.advanceTimersByTime(50);
    debounced('b');
    jest.advanceTimersByTime(50);
    expect(fn).not.toHaveBeenCalled();
    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('called once even if triggered many times within delay', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 200);
    for (let i = 0; i < 10; i++) debounced(i);
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('returns a function', () => {
    expect(typeof debounce(jest.fn(), 100)).toBe('function');
  });
  it('debounce with 0 delay calls immediately after microtask', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 0);
    debounced();
    jest.advanceTimersByTime(0);
    expect(fn).toHaveBeenCalled();
  });
  it('passes multiple arguments to fn', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    debounced('a', 'b', 'c');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledWith('a', 'b', 'c');
  });
  it('multiple sequential debounced calls each fired correctly', () => {
    const fn = jest.fn();
    const debounced = debounce(fn, 100);
    debounced('first');
    jest.advanceTimersByTime(100);
    debounced('second');
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenNthCalledWith(1, 'first');
    expect(fn).toHaveBeenNthCalledWith(2, 'second');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// createSearchClient
// ═════════════════════════════════════════════════════════════════════════════

const MOCK_API_URL = 'http://localhost:4050';

let mockFetch: jest.Mock;

beforeEach(() => {
  mockFetch = jest.fn();
  (global as any).fetch = mockFetch;
});

afterEach(() => {
  delete (global as any).fetch;
});

function mockSuccess(data: unknown) {
  return mockFetch.mockResolvedValue({
    ok: true,
    json: jest.fn().mockResolvedValue({ success: true, data }),
    status: 200,
    statusText: 'OK',
  });
}

function mockError(status = 500) {
  return mockFetch.mockResolvedValue({
    ok: false,
    status,
    statusText: 'Internal Server Error',
    json: jest.fn(),
  });
}

describe('createSearchClient — structure', () => {
  it('returns an object', () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    expect(typeof client).toBe('object');
  });
  it('has search method', () => {
    expect(typeof createSearchClient({ apiUrl: MOCK_API_URL }).search).toBe('function');
  });
  it('has suggest method', () => {
    expect(typeof createSearchClient({ apiUrl: MOCK_API_URL }).suggest).toBe('function');
  });
  it('has getRecent method', () => {
    expect(typeof createSearchClient({ apiUrl: MOCK_API_URL }).getRecent).toBe('function');
  });
  it('has clearRecent method', () => {
    expect(typeof createSearchClient({ apiUrl: MOCK_API_URL }).clearRecent).toBe('function');
  });
  it('has clearCache method', () => {
    expect(typeof createSearchClient({ apiUrl: MOCK_API_URL }).clearCache).toBe('function');
  });
  it('has getCacheSize method', () => {
    expect(typeof createSearchClient({ apiUrl: MOCK_API_URL }).getCacheSize).toBe('function');
  });
  it('cache starts empty', () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    expect(client.getCacheSize()).toBe(0);
  });
});

describe('createSearchClient — search', () => {
  it('calls fetch with search URL', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockSuccess({ query: 'test', totalResults: 0, items: [] });
    await client.search({ q: 'test' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/search'),
      expect.any(Object)
    );
  });
  it('includes q param in URL', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockSuccess({ query: 'ncr', totalResults: 0, items: [] });
    await client.search({ q: 'ncr' });
    expect(mockFetch.mock.calls[0][0]).toContain('q=ncr');
  });
  it('includes type param when specified', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockSuccess({ query: 'test', totalResults: 0, items: [] });
    await client.search({ q: 'test', type: 'ncr' });
    expect(mockFetch.mock.calls[0][0]).toContain('type=ncr');
  });
  it('includes limit param', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockSuccess({ query: 'test', totalResults: 0, items: [] });
    await client.search({ q: 'test', limit: 20 });
    expect(mockFetch.mock.calls[0][0]).toContain('limit=20');
  });
  it('includes offset param', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockSuccess({ query: 'test', totalResults: 0, items: [] });
    await client.search({ q: 'test', offset: 10 });
    expect(mockFetch.mock.calls[0][0]).toContain('offset=10');
  });
  it('returns search results', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    const mockData = { query: 'test', totalResults: 1, items: [makeItem()] };
    mockSuccess(mockData);
    const result = await client.search({ q: 'test' });
    expect(result.query).toBe('test');
    expect(result.items).toHaveLength(1);
  });
  it('throws on error response', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockError(500);
    await expect(client.search({ q: 'test' })).rejects.toThrow();
  });
  it('throws on network error', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockFetch.mockRejectedValue(new Error('network error'));
    await expect(client.search({ q: 'test' })).rejects.toThrow('network error');
  });
  it('caches result', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockSuccess({ query: 'test', totalResults: 0, items: [] });
    await client.search({ q: 'test' });
    expect(client.getCacheSize()).toBe(1);
  });
  it('second call uses cache', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockSuccess({ query: 'test', totalResults: 0, items: [] });
    await client.search({ q: 'test' });
    await client.search({ q: 'test' });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
  it('different query → different cache entry', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockSuccess({ query: 'test', totalResults: 0, items: [] });
    await client.search({ q: 'test' });
    mockSuccess({ query: 'ncr', totalResults: 0, items: [] });
    await client.search({ q: 'ncr' });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
  it('clearCache resets cache', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockSuccess({ query: 'test', totalResults: 0, items: [] });
    await client.search({ q: 'test' });
    client.clearCache();
    expect(client.getCacheSize()).toBe(0);
  });
  it('after clearCache, refetches', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockSuccess({ query: 'test', totalResults: 0, items: [] });
    await client.search({ q: 'test' });
    client.clearCache();
    mockSuccess({ query: 'test', totalResults: 0, items: [] });
    await client.search({ q: 'test' });
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
  it('sort param included in URL', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockSuccess({ query: 'test', totalResults: 0, items: [] });
    await client.search({ q: 'test', sort: 'date' });
    expect(mockFetch.mock.calls[0][0]).toContain('sort=date');
  });
  it('deduplicates concurrent identical requests', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockSuccess({ query: 'test', totalResults: 0, items: [] });
    const p1 = client.search({ q: 'test' });
    const p2 = client.search({ q: 'test' });
    await Promise.all([p1, p2]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});

describe('createSearchClient — suggest', () => {
  it('calls fetch suggest endpoint', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, data: { suggestions: [] } }),
    });
    await client.suggest('test');
    expect(mockFetch.mock.calls[0][0]).toContain('/api/search/suggest');
  });
  it('includes q param', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, data: { suggestions: [] } }),
    });
    await client.suggest('ncr');
    expect(mockFetch.mock.calls[0][0]).toContain('q=ncr');
  });
  it('includes default limit 5', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, data: { suggestions: [] } }),
    });
    await client.suggest('test');
    expect(mockFetch.mock.calls[0][0]).toContain('limit=5');
  });
  it('returns array', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, data: { suggestions: [{ text: 'ncr', type: 'term' }] } }),
    });
    const result = await client.suggest('nc');
    expect(Array.isArray(result)).toBe(true);
    expect(result[0].text).toBe('ncr');
  });
  it('custom limit passed', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, data: { suggestions: [] } }),
    });
    await client.suggest('test', 10);
    expect(mockFetch.mock.calls[0][0]).toContain('limit=10');
  });
});

describe('createSearchClient — getRecent / clearRecent', () => {
  it('getRecent calls fetch', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, data: { searches: [] } }),
    });
    await client.getRecent();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/search/recent'),
      expect.any(Object)
    );
  });
  it('getRecent returns array', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockFetch.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ success: true, data: { searches: [{ query: 'test', timestamp: '2026-01-01' }] } }),
    });
    const result = await client.getRecent();
    expect(Array.isArray(result)).toBe(true);
  });
  it('clearRecent calls DELETE on search/recent', async () => {
    const client = createSearchClient({ apiUrl: MOCK_API_URL });
    mockFetch.mockResolvedValue({ ok: true, json: jest.fn().mockResolvedValue({}) });
    await client.clearRecent();
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/search/recent'),
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Type & export verification
// ═════════════════════════════════════════════════════════════════════════════

describe('Type & export verification', () => {
  it('groupResultsByType is a function', () => expect(typeof groupResultsByType).toBe('function'));
  it('getModuleIcon is a function', () => expect(typeof getModuleIcon).toBe('function'));
  it('getModuleColor is a function', () => expect(typeof getModuleColor).toBe('function'));
  it('formatSearchResult is a function', () => expect(typeof formatSearchResult).toBe('function'));
  it('buildSearchUrl is a function', () => expect(typeof buildSearchUrl).toBe('function'));
  it('parseSearchUrl is a function', () => expect(typeof parseSearchUrl).toBe('function'));
  it('debounce is a function', () => expect(typeof debounce).toBe('function'));
  it('extractSnippet is a function', () => expect(typeof extractSnippet).toBe('function'));
  it('createSearchClient is a function', () => expect(typeof createSearchClient).toBe('function'));
  it('groupResultsByType returns array', () => expect(Array.isArray(groupResultsByType([]))).toBe(true));
  it('getModuleIcon returns string', () => expect(typeof getModuleIcon('quality')).toBe('string'));
  it('getModuleColor returns string', () => expect(typeof getModuleColor('quality')).toBe('string'));
  it('formatSearchResult returns string', () => expect(typeof formatSearchResult(makeItem())).toBe('string'));
  it('buildSearchUrl returns string', () => expect(typeof buildSearchUrl('test')).toBe('string'));
  it('parseSearchUrl returns object', () => expect(typeof parseSearchUrl('?q=test')).toBe('object'));
  it('extractSnippet returns string', () => expect(typeof extractSnippet('text', 'q')).toBe('string'));
  it('debounce returns function', () => expect(typeof debounce(jest.fn(), 100)).toBe('function'));
  it('createSearchClient returns object', () => expect(typeof createSearchClient({ apiUrl: MOCK_API_URL })).toBe('object'));
});
