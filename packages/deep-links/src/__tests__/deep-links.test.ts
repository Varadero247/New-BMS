// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import {
  buildDeepLink,
  parseDeepLink,
  isDeepLink,
  getModuleFromUrl,
  buildSearchUrl,
} from '../url-builder';
import { createDeepLinkRegistry } from '../registry';
import { DEFAULT_DEEP_LINKS } from '../defaults';
import type { DeepLinkConfig } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeConfig(overrides: Partial<DeepLinkConfig> = {}): DeepLinkConfig {
  return {
    module: 'quality',
    entityType: 'ncr',
    urlPattern: '/quality/ncr/{id}',
    requiresAuth: true,
    ...overrides,
  };
}

const SAMPLE_CONFIGS: DeepLinkConfig[] = [
  makeConfig({ module: 'quality', entityType: 'ncr', urlPattern: '/quality/ncr/{id}' }),
  makeConfig({ module: 'quality', entityType: 'capa', urlPattern: '/quality/capa/{id}' }),
  makeConfig({ module: 'health-safety', entityType: 'incident', urlPattern: '/health-safety/incident/{id}' }),
  makeConfig({ module: 'hr', entityType: 'employee', urlPattern: '/hr/employees/{id}' }),
];

// ═════════════════════════════════════════════════════════════════════════════
// buildDeepLink
// ═════════════════════════════════════════════════════════════════════════════

describe('buildDeepLink — basic', () => {
  it('returns /<module>/<entityType>/<entityId>', () => {
    expect(buildDeepLink('quality', 'ncr', 'ncr-001')).toBe('/quality/ncr/ncr-001');
  });
  it('includes entityId in URL', () => {
    expect(buildDeepLink('hr', 'employee', 'emp-123')).toContain('emp-123');
  });
  it('includes module in URL', () => {
    expect(buildDeepLink('quality', 'ncr', 'id1')).toContain('quality');
  });
  it('includes entityType in URL', () => {
    expect(buildDeepLink('quality', 'ncr', 'id1')).toContain('ncr');
  });
  it('URL starts with /', () => {
    expect(buildDeepLink('quality', 'ncr', 'id1').startsWith('/')).toBe(true);
  });
  it('returns string', () => {
    expect(typeof buildDeepLink('quality', 'ncr', 'id1')).toBe('string');
  });
  it('no params → no query string', () => {
    const url = buildDeepLink('quality', 'ncr', 'id1');
    expect(url).not.toContain('?');
  });
  it('health-safety module URL', () => {
    const url = buildDeepLink('health-safety', 'incident', 'inc-001');
    expect(url).toBe('/health-safety/incident/inc-001');
  });
  it('all standard modules build correctly', () => {
    const modules = ['quality', 'hr', 'finance', 'esg', 'risk', 'infosec'];
    modules.forEach(m => {
      const url = buildDeepLink(m, 'item', 'id1');
      expect(url.startsWith(`/${m}/`)).toBe(true);
    });
  });
  it('UUID entityId', () => {
    const url = buildDeepLink('quality', 'ncr', '550e8400-e29b-41d4-a716-446655440000');
    expect(url).toContain('550e8400-e29b-41d4-a716-446655440000');
  });
});

describe('buildDeepLink — with params', () => {
  it('appends query string when params provided', () => {
    const url = buildDeepLink('quality', 'ncr', 'id1', { tab: 'details' });
    expect(url).toContain('?');
    expect(url).toContain('tab=details');
  });
  it('multiple params all included', () => {
    const url = buildDeepLink('quality', 'ncr', 'id1', { tab: 'details', view: 'expanded' });
    expect(url).toContain('tab=details');
    expect(url).toContain('view=expanded');
  });
  it('empty params → no query string', () => {
    const url = buildDeepLink('quality', 'ncr', 'id1', {});
    expect(url).not.toContain('?');
  });
  it('special chars in params are encoded', () => {
    const url = buildDeepLink('quality', 'ncr', 'id1', { filter: 'a b' });
    expect(url).toContain('filter=');
  });
  it('params after path', () => {
    const url = buildDeepLink('quality', 'ncr', 'id1', { x: '1' });
    const [path, qs] = url.split('?');
    expect(path).toBe('/quality/ncr/id1');
    expect(qs).toContain('x=1');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// parseDeepLink
// ═════════════════════════════════════════════════════════════════════════════

describe('parseDeepLink — guards', () => {
  it('null url → null', () => expect(parseDeepLink(null as any, SAMPLE_CONFIGS)).toBeNull());
  it('empty url → null', () => expect(parseDeepLink('', SAMPLE_CONFIGS)).toBeNull());
  it('url without leading / → null', () => expect(parseDeepLink('quality/ncr/id1', SAMPLE_CONFIGS)).toBeNull());
  it('url with less than 3 path parts → null', () => {
    expect(parseDeepLink('/quality/ncr', SAMPLE_CONFIGS)).toBeNull();
  });
  it('url with unknown module → null', () => {
    expect(parseDeepLink('/unknown/item/id1', SAMPLE_CONFIGS)).toBeNull();
  });
  it('url with known module but wrong entityType → null', () => {
    expect(parseDeepLink('/quality/unknown/id1', SAMPLE_CONFIGS)).toBeNull();
  });
});

describe('parseDeepLink — valid URLs', () => {
  it('parses module', () => {
    const result = parseDeepLink('/quality/ncr/ncr-001', SAMPLE_CONFIGS);
    expect(result!.module).toBe('quality');
  });
  it('parses entityType', () => {
    const result = parseDeepLink('/quality/ncr/ncr-001', SAMPLE_CONFIGS);
    expect(result!.entityType).toBe('ncr');
  });
  it('parses entityId', () => {
    const result = parseDeepLink('/quality/ncr/ncr-001', SAMPLE_CONFIGS);
    expect(result!.entityId).toBe('ncr-001');
  });
  it('returns correct url (path without query)', () => {
    const result = parseDeepLink('/quality/ncr/ncr-001', SAMPLE_CONFIGS);
    expect(result!.url).toBe('/quality/ncr/ncr-001');
  });
  it('params empty when no query string', () => {
    const result = parseDeepLink('/quality/ncr/ncr-001', SAMPLE_CONFIGS);
    expect(Object.keys(result!.params)).toHaveLength(0);
  });
  it('returns ResolvedDeepLink shape', () => {
    const result = parseDeepLink('/quality/ncr/ncr-001', SAMPLE_CONFIGS);
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('module');
    expect(result).toHaveProperty('entityType');
    expect(result).toHaveProperty('entityId');
    expect(result).toHaveProperty('params');
  });
  it('health-safety URL parses correctly', () => {
    const result = parseDeepLink('/health-safety/incident/inc-001', SAMPLE_CONFIGS);
    expect(result!.module).toBe('health-safety');
    expect(result!.entityType).toBe('incident');
    expect(result!.entityId).toBe('inc-001');
  });
  it('hr employee URL parses correctly', () => {
    const result = parseDeepLink('/hr/employees/emp-001', [makeConfig({ module: 'hr', entityType: 'employees' })]);
    expect(result!.module).toBe('hr');
  });
});

describe('parseDeepLink — with query params', () => {
  it('parses query params into params object', () => {
    const result = parseDeepLink('/quality/ncr/id1?tab=details', SAMPLE_CONFIGS);
    expect(result!.params.tab).toBe('details');
  });
  it('parses multiple query params', () => {
    const result = parseDeepLink('/quality/ncr/id1?tab=details&view=expanded', SAMPLE_CONFIGS);
    expect(result!.params.tab).toBe('details');
    expect(result!.params.view).toBe('expanded');
  });
  it('url field does not include query string', () => {
    const result = parseDeepLink('/quality/ncr/id1?tab=details', SAMPLE_CONFIGS);
    expect(result!.url).toBe('/quality/ncr/id1');
  });
  it('empty configs → null for known-structure url', () => {
    expect(parseDeepLink('/quality/ncr/id1', [])).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// isDeepLink
// ═════════════════════════════════════════════════════════════════════════════

describe('isDeepLink', () => {
  it('valid deep link → true', () => expect(isDeepLink('/quality/ncr/id1')).toBe(true));
  it('empty string → false', () => expect(isDeepLink('')).toBe(false));
  it('null → false', () => expect(isDeepLink(null as any)).toBe(false));
  it('no leading / → false', () => expect(isDeepLink('quality/ncr/id1')).toBe(false));
  it('only one segment → false', () => expect(isDeepLink('/quality')).toBe(false));
  it('two segments → false', () => expect(isDeepLink('/quality/ncr')).toBe(false));
  it('three segments → true', () => expect(isDeepLink('/quality/ncr/id1')).toBe(true));
  it('health-safety url → true', () => expect(isDeepLink('/health-safety/incident/inc-001')).toBe(true));
  it('external url → false', () => expect(isDeepLink('https://example.com')).toBe(false));
  it('relative url without module structure → false', () => expect(isDeepLink('/api')).toBe(false));
  it('returns boolean', () => expect(typeof isDeepLink('/quality/ncr/id')).toBe('boolean'));
  it('url with query string → true (path still matches)', () => {
    expect(isDeepLink('/quality/ncr/id1?tab=x')).toBe(true);
  });
  it('numeric id → true', () => expect(isDeepLink('/finance/invoice/12345')).toBe(true));
  it('uuid id → true', () => {
    expect(isDeepLink('/quality/ncr/550e8400-e29b-41d4-a716-446655440000')).toBe(true);
  });
  it('four path segments → true (regex only checks first 3)', () => {
    expect(isDeepLink('/a/b/c/d')).toBe(true);
  });
  it('dashboard path → false (single segment)', () => expect(isDeepLink('/dashboard')).toBe(false));
});

// ═════════════════════════════════════════════════════════════════════════════
// getModuleFromUrl
// ═════════════════════════════════════════════════════════════════════════════

describe('getModuleFromUrl', () => {
  it('extracts module from /quality/ncr/id', () => {
    expect(getModuleFromUrl('/quality/ncr/id1')).toBe('quality');
  });
  it('extracts module from /health-safety/incident/id', () => {
    expect(getModuleFromUrl('/health-safety/incident/id1')).toBe('health-safety');
  });
  it('extracts module from /hr/employees/id', () => {
    expect(getModuleFromUrl('/hr/employees/id1')).toBe('hr');
  });
  it('single segment url → first segment', () => {
    expect(getModuleFromUrl('/dashboard')).toBe('dashboard');
  });
  it('empty string → null', () => expect(getModuleFromUrl('')).toBeNull());
  it('null → null', () => expect(getModuleFromUrl(null as any)).toBeNull());
  it('no leading / → null', () => expect(getModuleFromUrl('quality/ncr')).toBeNull());
  it('returns string', () => expect(typeof getModuleFromUrl('/quality/x/y')).toBe('string'));
  it('/risk/register/id → risk', () => {
    expect(getModuleFromUrl('/risk/register/id1')).toBe('risk');
  });
  it('/finance/invoices/id → finance', () => {
    expect(getModuleFromUrl('/finance/invoices/id1')).toBe('finance');
  });
  it('/esg/emissions/id → esg', () => {
    expect(getModuleFromUrl('/esg/emissions/id1')).toBe('esg');
  });
  it('/infosec/risks/id → infosec', () => {
    expect(getModuleFromUrl('/infosec/risks/id1')).toBe('infosec');
  });
  it('/ alone → null (no path parts)', () => expect(getModuleFromUrl('/')).toBeNull());
  it('url with query → still extracts module', () => {
    expect(getModuleFromUrl('/quality/ncr/id1?tab=x')).toBe('quality');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// buildSearchUrl (deep-links/url-builder version)
// ═════════════════════════════════════════════════════════════════════════════

describe('buildSearchUrl (url-builder)', () => {
  it('returns URL starting with /search', () => {
    expect(buildSearchUrl('test').startsWith('/search')).toBe(true);
  });
  it('includes query param q', () => {
    expect(buildSearchUrl('hello')).toContain('q=hello');
  });
  it('includes filters in URL', () => {
    const url = buildSearchUrl('ncr', { type: 'quality' });
    expect(url).toContain('type=quality');
  });
  it('multiple filters included', () => {
    const url = buildSearchUrl('ncr', { type: 'quality', status: 'OPEN' });
    expect(url).toContain('type=quality');
    expect(url).toContain('status=OPEN');
  });
  it('no filters → only q param', () => {
    const url = buildSearchUrl('test');
    expect(url).toBe('/search?q=test');
  });
  it('empty query included', () => {
    const url = buildSearchUrl('');
    expect(url).toContain('q=');
  });
  it('special chars encoded', () => {
    const url = buildSearchUrl('hello world');
    expect(url).toContain('hello');
  });
  it('returns string', () => expect(typeof buildSearchUrl('test')).toBe('string'));
});

// ═════════════════════════════════════════════════════════════════════════════
// DeepLinkRegistry
// ═════════════════════════════════════════════════════════════════════════════

describe('DeepLinkRegistry — initialization', () => {
  it('empty registry with no initial configs', () => {
    const registry = createDeepLinkRegistry();
    expect(registry.getAllConfigs()).toHaveLength(0);
  });
  it('initializes with provided configs', () => {
    const registry = createDeepLinkRegistry(SAMPLE_CONFIGS);
    expect(registry.getAllConfigs()).toHaveLength(SAMPLE_CONFIGS.length);
  });
  it('getAllConfigs returns array', () => {
    expect(Array.isArray(createDeepLinkRegistry().getAllConfigs())).toBe(true);
  });
});

describe('DeepLinkRegistry — register', () => {
  let registry: ReturnType<typeof createDeepLinkRegistry>;
  beforeEach(() => { registry = createDeepLinkRegistry(); });

  it('registers a config', () => {
    registry.register(makeConfig());
    expect(registry.getAllConfigs()).toHaveLength(1);
  });
  it('getConfig finds registered config', () => {
    registry.register(makeConfig({ module: 'quality', entityType: 'ncr' }));
    expect(registry.getConfig('quality', 'ncr')).toBeDefined();
  });
  it('getConfig returns correct module', () => {
    registry.register(makeConfig({ module: 'quality', entityType: 'ncr' }));
    expect(registry.getConfig('quality', 'ncr')!.module).toBe('quality');
  });
  it('getConfig returns correct entityType', () => {
    registry.register(makeConfig({ module: 'quality', entityType: 'ncr' }));
    expect(registry.getConfig('quality', 'ncr')!.entityType).toBe('ncr');
  });
  it('registering same module+entityType overwrites', () => {
    registry.register(makeConfig({ module: 'quality', entityType: 'ncr', requiresAuth: true }));
    registry.register(makeConfig({ module: 'quality', entityType: 'ncr', requiresAuth: false }));
    expect(registry.getConfig('quality', 'ncr')!.requiresAuth).toBe(false);
  });
  it('getConfig returns undefined for unregistered', () => {
    expect(registry.getConfig('unknown', 'item')).toBeUndefined();
  });
  it('can register multiple different module+entityType combos', () => {
    registry.register(makeConfig({ module: 'quality', entityType: 'ncr' }));
    registry.register(makeConfig({ module: 'hr', entityType: 'employee' }));
    registry.register(makeConfig({ module: 'finance', entityType: 'invoice' }));
    expect(registry.getAllConfigs()).toHaveLength(3);
  });
});

describe('DeepLinkRegistry — unregister', () => {
  let registry: ReturnType<typeof createDeepLinkRegistry>;
  beforeEach(() => {
    registry = createDeepLinkRegistry(SAMPLE_CONFIGS);
  });

  it('removes a config', () => {
    const before = registry.getAllConfigs().length;
    registry.unregister('quality', 'ncr');
    expect(registry.getAllConfigs()).toHaveLength(before - 1);
  });
  it('unregistered config not found', () => {
    registry.unregister('quality', 'ncr');
    expect(registry.getConfig('quality', 'ncr')).toBeUndefined();
  });
  it('other configs unaffected', () => {
    registry.unregister('quality', 'ncr');
    expect(registry.getConfig('quality', 'capa')).toBeDefined();
  });
  it('unregister non-existent is no-op', () => {
    const before = registry.getAllConfigs().length;
    registry.unregister('nonexistent', 'type');
    expect(registry.getAllConfigs()).toHaveLength(before);
  });
  it('can re-register after unregister', () => {
    registry.unregister('quality', 'ncr');
    registry.register(makeConfig({ module: 'quality', entityType: 'ncr' }));
    expect(registry.getConfig('quality', 'ncr')).toBeDefined();
  });
});

describe('DeepLinkRegistry — resolve', () => {
  let registry: ReturnType<typeof createDeepLinkRegistry>;
  beforeEach(() => { registry = createDeepLinkRegistry(SAMPLE_CONFIGS); });

  it('resolves known module+entityType to URL', () => {
    const result = registry.resolve('quality', 'ncr', 'ncr-001');
    expect(result).not.toBeNull();
    expect(result!.url).toContain('ncr-001');
  });
  it('resolved url contains module and entityType', () => {
    const result = registry.resolve('quality', 'ncr', 'id1');
    expect(result!.url).toContain('quality');
    expect(result!.url).toContain('ncr');
  });
  it('resolved result has correct module', () => {
    expect(registry.resolve('quality', 'ncr', 'id1')!.module).toBe('quality');
  });
  it('resolved result has correct entityType', () => {
    expect(registry.resolve('quality', 'ncr', 'id1')!.entityType).toBe('ncr');
  });
  it('resolved result has correct entityId', () => {
    expect(registry.resolve('quality', 'ncr', 'my-id')!.entityId).toBe('my-id');
  });
  it('unknown module+entityType → null', () => {
    expect(registry.resolve('unknown', 'item', 'id1')).toBeNull();
  });
  it('resolve with additional params', () => {
    const result = registry.resolve('quality', 'ncr', 'id1', { tab: 'details' });
    expect(result!.params.tab).toBe('details');
  });
  it('resolve without params → empty params', () => {
    const result = registry.resolve('quality', 'ncr', 'id1');
    expect(result!.params).toEqual({});
  });
});

describe('DeepLinkRegistry — parse', () => {
  let registry: ReturnType<typeof createDeepLinkRegistry>;
  beforeEach(() => { registry = createDeepLinkRegistry(SAMPLE_CONFIGS); });

  it('parses registered URL', () => {
    const result = registry.parse('/quality/ncr/ncr-001');
    expect(result).not.toBeNull();
    expect(result!.module).toBe('quality');
  });
  it('returns null for unknown module', () => {
    expect(registry.parse('/unknown/type/id')).toBeNull();
  });
  it('returns null for invalid URL', () => {
    expect(registry.parse('')).toBeNull();
  });
  it('parses URL with query params', () => {
    const result = registry.parse('/quality/ncr/id1?tab=x');
    expect(result!.params.tab).toBe('x');
  });
  it('parsed result has all fields', () => {
    const result = registry.parse('/quality/ncr/id1');
    expect(result).toHaveProperty('url');
    expect(result).toHaveProperty('module');
    expect(result).toHaveProperty('entityType');
    expect(result).toHaveProperty('entityId');
    expect(result).toHaveProperty('params');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// DEFAULT_DEEP_LINKS
// ═════════════════════════════════════════════════════════════════════════════

describe('DEFAULT_DEEP_LINKS — structure', () => {
  it('is an array', () => expect(Array.isArray(DEFAULT_DEEP_LINKS)).toBe(true));
  it('has entries', () => expect(DEFAULT_DEEP_LINKS.length).toBeGreaterThan(0));
  it('every config has module', () => DEFAULT_DEEP_LINKS.forEach(c => expect(c.module).toBeTruthy()));
  it('every config has entityType', () => DEFAULT_DEEP_LINKS.forEach(c => expect(c.entityType).toBeTruthy()));
  it('every config has urlPattern', () => DEFAULT_DEEP_LINKS.forEach(c => expect(c.urlPattern).toBeTruthy()));
  it('all requiresAuth is true', () => DEFAULT_DEEP_LINKS.forEach(c => expect(c.requiresAuth).toBe(true)));
  it('all urlPatterns contain {id}', () => DEFAULT_DEEP_LINKS.forEach(c => expect(c.urlPattern).toContain('{id}')));
  it('quality module configs exist', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'quality')).toBe(true);
  });
  it('health-safety module configs exist', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'health-safety')).toBe(true);
  });
  it('hr module configs exist', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'hr')).toBe(true);
  });
  it('environment module configs exist', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'environment')).toBe(true);
  });
  it('finance module configs exist', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'finance')).toBe(true);
  });
  it('esg module configs exist', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'esg')).toBe(true);
  });
  it('infosec module configs exist', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'infosec')).toBe(true);
  });
  it('risk module configs exist', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'risk')).toBe(true);
  });
  it('suppliers module configs exist', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'suppliers')).toBe(true);
  });
  it('quality ncr config exists', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'quality' && c.entityType === 'ncr')).toBe(true);
  });
  it('quality capa config exists', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'quality' && c.entityType === 'capa')).toBe(true);
  });
  it('health-safety incident config exists', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'health-safety' && c.entityType === 'incident')).toBe(true);
  });
  it('hr employee config exists', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'hr' && c.entityType === 'employee')).toBe(true);
  });
  it('risk.risk config exists', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'risk' && c.entityType === 'risk')).toBe(true);
  });
});

describe('DEFAULT_DEEP_LINKS — registrable', () => {
  it('all DEFAULT_DEEP_LINKS can be registered without error', () => {
    expect(() => createDeepLinkRegistry(DEFAULT_DEEP_LINKS)).not.toThrow();
  });
  it('registry initialized with defaults has correct count', () => {
    const registry = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
    expect(registry.getAllConfigs()).toHaveLength(DEFAULT_DEEP_LINKS.length);
  });
  it('each default config is findable', () => {
    const registry = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
    DEFAULT_DEEP_LINKS.forEach(c => {
      expect(registry.getConfig(c.module, c.entityType)).toBeDefined();
    });
  });
  it('can resolve quality ncr', () => {
    const registry = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
    const result = registry.resolve('quality', 'ncr', 'ncr-001');
    expect(result).not.toBeNull();
    expect(result!.entityId).toBe('ncr-001');
  });
  it('can resolve health-safety incident', () => {
    const registry = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
    const result = registry.resolve('health-safety', 'incident', 'inc-001');
    expect(result).not.toBeNull();
  });
  it('can resolve risk.risk', () => {
    const registry = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
    const result = registry.resolve('risk', 'risk', 'risk-001');
    expect(result).not.toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Type & export verification
// ═════════════════════════════════════════════════════════════════════════════

describe('Type & export verification', () => {
  it('buildDeepLink is a function', () => expect(typeof buildDeepLink).toBe('function'));
  it('parseDeepLink is a function', () => expect(typeof parseDeepLink).toBe('function'));
  it('isDeepLink is a function', () => expect(typeof isDeepLink).toBe('function'));
  it('getModuleFromUrl is a function', () => expect(typeof getModuleFromUrl).toBe('function'));
  it('buildSearchUrl is a function', () => expect(typeof buildSearchUrl).toBe('function'));
  it('createDeepLinkRegistry is a function', () => expect(typeof createDeepLinkRegistry).toBe('function'));
  it('DEFAULT_DEEP_LINKS is an array', () => expect(Array.isArray(DEFAULT_DEEP_LINKS)).toBe(true));
  it('buildDeepLink returns string', () => expect(typeof buildDeepLink('q', 'n', 'i')).toBe('string'));
  it('isDeepLink returns boolean', () => expect(typeof isDeepLink('/a/b/c')).toBe('boolean'));
  it('getModuleFromUrl returns string or null', () => {
    const r = getModuleFromUrl('/quality/ncr/id');
    expect(r === null || typeof r === 'string').toBe(true);
  });
  it('createDeepLinkRegistry returns object', () => expect(typeof createDeepLinkRegistry()).toBe('object'));
  it('registry has register method', () => expect(typeof createDeepLinkRegistry().register).toBe('function'));
  it('registry has unregister method', () => expect(typeof createDeepLinkRegistry().unregister).toBe('function'));
  it('registry has resolve method', () => expect(typeof createDeepLinkRegistry().resolve).toBe('function'));
  it('registry has parse method', () => expect(typeof createDeepLinkRegistry().parse).toBe('function'));
  it('registry has getConfig method', () => expect(typeof createDeepLinkRegistry().getConfig).toBe('function'));
  it('registry has getAllConfigs method', () => expect(typeof createDeepLinkRegistry().getAllConfigs).toBe('function'));
});

// ═════════════════════════════════════════════════════════════════════════════
// Round-trip: build then parse
// ═════════════════════════════════════════════════════════════════════════════

describe('Round-trip: buildDeepLink → parseDeepLink', () => {
  SAMPLE_CONFIGS.forEach(config => {
    it(`round-trip for ${config.module}/${config.entityType}`, () => {
      const entityId = 'test-id-001';
      const url = buildDeepLink(config.module, config.entityType, entityId);
      const parsed = parseDeepLink(url, SAMPLE_CONFIGS);
      expect(parsed).not.toBeNull();
      expect(parsed!.module).toBe(config.module);
      expect(parsed!.entityType).toBe(config.entityType);
      expect(parsed!.entityId).toBe(entityId);
    });
  });

  it('round-trip with params', () => {
    const url = buildDeepLink('quality', 'ncr', 'id1', { tab: 'details' });
    const parsed = parseDeepLink(url, SAMPLE_CONFIGS);
    expect(parsed).not.toBeNull();
    expect(parsed!.entityId).toBe('id1');
  });

  it('registry resolve then parse round-trip', () => {
    const registry = createDeepLinkRegistry(SAMPLE_CONFIGS);
    const resolved = registry.resolve('quality', 'ncr', 'my-ncr');
    const parsed = registry.parse(resolved!.url);
    expect(parsed!.entityId).toBe('my-ncr');
  });
});
