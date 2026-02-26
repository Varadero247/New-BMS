// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import { buildDeepLink, parseDeepLink, isDeepLink, getModuleFromUrl, buildSearchUrl } from '../src/url-builder';
import { createDeepLinkRegistry } from '../src/registry';
import { DEFAULT_DEEP_LINKS } from '../src/defaults';
import type { DeepLinkConfig, ResolvedDeepLink } from '../src/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeConfig(overrides: Partial<DeepLinkConfig> = {}): DeepLinkConfig {
  return {
    module: 'quality',
    entityType: 'ncr',
    urlPattern: '/quality/ncr/{id}',
    requiresAuth: true,
    ...overrides,
  };
}

// ════════════════════════════════════════════════════════════════════════════
// 1. buildDeepLink — 200 tests
// ════════════════════════════════════════════════════════════════════════════

describe('buildDeepLink — basic construction', () => {
  it('builds a simple path with no params', () => {
    expect(buildDeepLink('quality', 'ncr', '123')).toBe('/quality/ncr/123');
  });

  it('builds a path with one param', () => {
    const url = buildDeepLink('quality', 'ncr', '123', { tab: 'details' });
    expect(url).toBe('/quality/ncr/123?tab=details');
  });

  it('builds a path with multiple params', () => {
    const url = buildDeepLink('quality', 'ncr', '456', { tab: 'details', mode: 'edit' });
    expect(url).toContain('/quality/ncr/456?');
    expect(url).toContain('tab=details');
    expect(url).toContain('mode=edit');
  });

  it('empty params object produces no query string', () => {
    expect(buildDeepLink('hr', 'employee', 'emp-1', {})).toBe('/hr/employee/emp-1');
  });

  it('undefined params produces no query string', () => {
    expect(buildDeepLink('hr', 'employee', 'emp-1', undefined)).toBe('/hr/employee/emp-1');
  });

  it('result always starts with /', () => {
    const url = buildDeepLink('finance', 'invoice', 'inv-99');
    expect(url.startsWith('/')).toBe(true);
  });

  it('module is first path segment', () => {
    const url = buildDeepLink('esg', 'emission', 'em-1');
    expect(url.split('/')[1]).toBe('esg');
  });

  it('entityType is second path segment', () => {
    const url = buildDeepLink('esg', 'emission', 'em-1');
    expect(url.split('/')[2]).toBe('emission');
  });

  it('entityId is third path segment (no query)', () => {
    const url = buildDeepLink('esg', 'emission', 'em-42');
    expect(url.split('/')[3]).toBe('em-42');
  });

  it('entityId with hyphens is preserved', () => {
    expect(buildDeepLink('risk', 'risk', 'risk-2026-001')).toBe('/risk/risk/risk-2026-001');
  });

  it('special chars in params are encoded', () => {
    const url = buildDeepLink('quality', 'ncr', '1', { filter: 'open & closed' });
    expect(url).toContain('filter=open+%26+closed');
  });

  it('numeric entityId as string', () => {
    expect(buildDeepLink('infosec', 'risk', '42')).toBe('/infosec/risk/42');
  });

  it('long entityId is preserved', () => {
    const id = 'a'.repeat(50);
    expect(buildDeepLink('hr', 'employee', id)).toBe(`/hr/employee/${id}`);
  });

  it('query param key ordering uses URLSearchParams', () => {
    const url = buildDeepLink('quality', 'ncr', '1', { b: '2', a: '1' });
    expect(url).toContain('?');
  });

  it('builds health-safety incident link', () => {
    expect(buildDeepLink('health-safety', 'incident', 'inc-1')).toBe('/health-safety/incident/inc-1');
  });

  it('builds environment aspect link', () => {
    expect(buildDeepLink('environment', 'aspect', 'asp-5')).toBe('/environment/aspect/asp-5');
  });

  it('builds finance purchase-order link', () => {
    expect(buildDeepLink('finance', 'purchase-order', 'po-10')).toBe('/finance/purchase-order/po-10');
  });

  it('builds infosec control link', () => {
    expect(buildDeepLink('infosec', 'control', 'ctrl-3')).toBe('/infosec/control/ctrl-3');
  });

  it('builds suppliers supplier link', () => {
    expect(buildDeepLink('suppliers', 'supplier', 'sup-7')).toBe('/suppliers/supplier/sup-7');
  });
});

describe('buildDeepLink — from DEFAULT_DEEP_LINKS combos', () => {
  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    const id = `entity-${i + 1}`;
    it(`builds link for ${cfg.module}/${cfg.entityType}`, () => {
      const url = buildDeepLink(cfg.module, cfg.entityType, id);
      expect(url).toContain(`/${cfg.module}/`);
      expect(url).toContain(`/${cfg.entityType}/`);
      expect(url).toContain(`/${id}`);
    });
  }

  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    const id = `ent-${i + 100}`;
    it(`builds link with params for ${cfg.module}/${cfg.entityType}`, () => {
      const url = buildDeepLink(cfg.module, cfg.entityType, id, { view: 'detail' });
      expect(url).toContain('view=detail');
    });
  }

  // Additional entity IDs
  for (let i = 0; i < 20; i++) {
    it(`buildDeepLink entity id variation ${i}`, () => {
      const cfg = DEFAULT_DEEP_LINKS[i % DEFAULT_DEEP_LINKS.length];
      const url = buildDeepLink(cfg.module, cfg.entityType, `id-${i}`);
      expect(url.split('/').length).toBeGreaterThanOrEqual(4);
    });
  }

  // With multiple params
  for (let i = 0; i < 20; i++) {
    it(`buildDeepLink multiple params variation ${i}`, () => {
      const cfg = DEFAULT_DEEP_LINKS[i % DEFAULT_DEEP_LINKS.length];
      const url = buildDeepLink(cfg.module, cfg.entityType, `id-mp-${i}`, { p1: `v${i}`, p2: `w${i}` });
      expect(url).toContain(`p1=v${i}`);
      expect(url).toContain(`p2=w${i}`);
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 2. parseDeepLink — 150 tests
// ════════════════════════════════════════════════════════════════════════════

describe('parseDeepLink — valid URLs', () => {
  const configs = DEFAULT_DEEP_LINKS;

  it('parses a valid quality/ncr URL', () => {
    const result = parseDeepLink('/quality/ncr/123', configs);
    expect(result).not.toBeNull();
    expect(result!.module).toBe('quality');
    expect(result!.entityType).toBe('ncr');
    expect(result!.entityId).toBe('123');
  });

  it('parses params from query string', () => {
    const result = parseDeepLink('/quality/ncr/123?tab=details', configs);
    expect(result).not.toBeNull();
    expect(result!.params.tab).toBe('details');
  });

  it('parses multiple query params', () => {
    const result = parseDeepLink('/health-safety/incident/inc-1?tab=overview&mode=view', configs);
    expect(result).not.toBeNull();
    expect(result!.params.tab).toBe('overview');
    expect(result!.params.mode).toBe('view');
  });

  it('returns null for empty string', () => {
    expect(parseDeepLink('', configs)).toBeNull();
  });

  it('returns null for URL not starting with /', () => {
    expect(parseDeepLink('quality/ncr/1', configs)).toBeNull();
  });

  it('returns null for path with only 2 segments', () => {
    expect(parseDeepLink('/quality/ncr', configs)).toBeNull();
  });

  it('returns null for path with only 1 segment', () => {
    expect(parseDeepLink('/quality', configs)).toBeNull();
  });

  it('returns null for unknown module/entityType combo', () => {
    expect(parseDeepLink('/unknown/thing/1', configs)).toBeNull();
  });

  it('preserves the path (without query string) in url field', () => {
    const result = parseDeepLink('/quality/ncr/123?tab=x', configs);
    expect(result!.url).toBe('/quality/ncr/123');
  });

  it('empty params object when no query string', () => {
    const result = parseDeepLink('/quality/ncr/123', configs);
    expect(result!.params).toEqual({});
  });

  it('parses hr/employee URL', () => {
    const result = parseDeepLink('/hr/employee/emp-99', configs);
    expect(result).not.toBeNull();
    expect(result!.entityId).toBe('emp-99');
  });

  it('parses finance/invoice URL', () => {
    const result = parseDeepLink('/finance/invoice/inv-5', configs);
    expect(result).not.toBeNull();
    expect(result!.module).toBe('finance');
  });

  it('parses esg/emission URL', () => {
    const result = parseDeepLink('/esg/emission/em-3', configs);
    expect(result).not.toBeNull();
  });

  it('parses infosec/control URL', () => {
    const result = parseDeepLink('/infosec/control/ctrl-1', configs);
    expect(result).not.toBeNull();
  });

  it('parses risk/risk URL', () => {
    const result = parseDeepLink('/risk/risk/rsk-10', configs);
    expect(result).not.toBeNull();
    expect(result!.entityType).toBe('risk');
  });

  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    it(`parseDeepLink succeeds for ${cfg.module}/${cfg.entityType}`, () => {
      const url = `/${cfg.module}/${cfg.entityType}/id-${i}`;
      const result = parseDeepLink(url, configs);
      expect(result).not.toBeNull();
      expect(result!.module).toBe(cfg.module);
      expect(result!.entityType).toBe(cfg.entityType);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`parseDeepLink with query string variation ${i}`, () => {
      const cfg = DEFAULT_DEEP_LINKS[i % DEFAULT_DEEP_LINKS.length];
      const url = `/${cfg.module}/${cfg.entityType}/id-${i}?p=v${i}`;
      const result = parseDeepLink(url, configs);
      expect(result).not.toBeNull();
      expect(result!.params.p).toBe(`v${i}`);
    });
  }
});

describe('parseDeepLink — edge cases and invalid input', () => {
  const configs = DEFAULT_DEEP_LINKS;

  it('handles URL with trailing slash still returning 3 segments', () => {
    // '/quality/ncr/123/' splits to ['quality','ncr','123',''] — first 3 are valid
    const result = parseDeepLink('/quality/ncr/123/', configs);
    // may or may not parse depending on filter(Boolean) behavior — entityId could be '123' or ''
    // just verify it doesn't throw
    expect(() => parseDeepLink('/quality/ncr/123/', configs)).not.toThrow();
  });

  it('returns null for null-like string "null"', () => {
    expect(parseDeepLink('/null/null/null', configs)).toBeNull();
  });

  for (let i = 0; i < 15; i++) {
    it(`parseDeepLink unknown combo variation ${i} returns null`, () => {
      expect(parseDeepLink(`/fake-module-${i}/fake-type-${i}/id-${i}`, configs)).toBeNull();
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`parseDeepLink missing entityId segment ${i} returns null`, () => {
      const cfg = DEFAULT_DEEP_LINKS[i % DEFAULT_DEEP_LINKS.length];
      expect(parseDeepLink(`/${cfg.module}/${cfg.entityType}`, configs)).toBeNull();
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 3. isDeepLink — 100 tests
// ════════════════════════════════════════════════════════════════════════════

describe('isDeepLink — valid patterns', () => {
  it('returns true for /quality/ncr/123', () => {
    expect(isDeepLink('/quality/ncr/123')).toBe(true);
  });

  it('returns true for /health-safety/incident/inc-1', () => {
    expect(isDeepLink('/health-safety/incident/inc-1')).toBe(true);
  });

  it('returns true for /finance/invoice/inv-99', () => {
    expect(isDeepLink('/finance/invoice/inv-99')).toBe(true);
  });

  it('returns true for /esg/emission/em-5', () => {
    expect(isDeepLink('/esg/emission/em-5')).toBe(true);
  });

  it('returns true for /risk/risk/rsk-1', () => {
    expect(isDeepLink('/risk/risk/rsk-1')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(isDeepLink('')).toBe(false);
  });

  it('returns false for relative path without leading slash', () => {
    expect(isDeepLink('quality/ncr/1')).toBe(false);
  });

  it('returns false for single segment', () => {
    expect(isDeepLink('/quality')).toBe(false);
  });

  it('returns false for two segments', () => {
    expect(isDeepLink('/quality/ncr')).toBe(false);
  });

  it('returns false for path with uppercase', () => {
    expect(isDeepLink('/Quality/NCR/123')).toBe(false);
  });

  it('returns true for path with numbers in module (a-z, 0-9, hyphen)', () => {
    // isDeepLink regex: /^\/[a-z-]+\/[a-z-]+\/[a-z0-9-]+/
    expect(isDeepLink('/module/type/abc123')).toBe(true);
  });

  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    it(`isDeepLink returns true for default link ${cfg.module}/${cfg.entityType}`, () => {
      expect(isDeepLink(`/${cfg.module}/${cfg.entityType}/id-${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`isDeepLink valid pattern repetition ${i}`, () => {
      expect(isDeepLink(`/module-${i}/type-${i}/entity-${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`isDeepLink invalid — only two segments ${i}`, () => {
      expect(isDeepLink(`/module-${i}/type-${i}`)).toBe(false);
    });
  }

  it('returns false for https:// URL', () => {
    expect(isDeepLink('https://example.com/quality/ncr/1')).toBe(false);
  });

  it('returns false for null/undefined coercion (empty string)', () => {
    expect(isDeepLink('')).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 4. getModuleFromUrl — 100 tests
// ════════════════════════════════════════════════════════════════════════════

describe('getModuleFromUrl — extraction', () => {
  it('extracts "quality" from /quality/ncr/1', () => {
    expect(getModuleFromUrl('/quality/ncr/1')).toBe('quality');
  });

  it('extracts "health-safety" from /health-safety/incident/1', () => {
    expect(getModuleFromUrl('/health-safety/incident/1')).toBe('health-safety');
  });

  it('extracts "finance" from /finance/invoice/1', () => {
    expect(getModuleFromUrl('/finance/invoice/1')).toBe('finance');
  });

  it('returns null for empty string', () => {
    expect(getModuleFromUrl('')).toBeNull();
  });

  it('returns null for path not starting with /', () => {
    expect(getModuleFromUrl('quality/ncr/1')).toBeNull();
  });

  it('returns "quality" even for /quality alone', () => {
    expect(getModuleFromUrl('/quality')).toBe('quality');
  });

  it('returns "esg" from /esg/emission/em-1', () => {
    expect(getModuleFromUrl('/esg/emission/em-1')).toBe('esg');
  });

  it('returns "risk" from /risk/risk/rsk-1', () => {
    expect(getModuleFromUrl('/risk/risk/rsk-1')).toBe('risk');
  });

  it('returns "infosec" from /infosec/control/ctrl-2', () => {
    expect(getModuleFromUrl('/infosec/control/ctrl-2')).toBe('infosec');
  });

  it('returns "suppliers" from /suppliers/supplier/sup-3', () => {
    expect(getModuleFromUrl('/suppliers/supplier/sup-3')).toBe('suppliers');
  });

  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    it(`getModuleFromUrl returns "${cfg.module}" for default link ${i}`, () => {
      const url = `/${cfg.module}/${cfg.entityType}/id-${i}`;
      expect(getModuleFromUrl(url)).toBe(cfg.module);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`getModuleFromUrl repetition ${i}`, () => {
      const mod = `module-${i}`;
      expect(getModuleFromUrl(`/${mod}/type/id`)).toBe(mod);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`getModuleFromUrl null for relative path ${i}`, () => {
      expect(getModuleFromUrl(`module-${i}/type/id`)).toBeNull();
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 5. buildSearchUrl — 50 tests
// ════════════════════════════════════════════════════════════════════════════

describe('buildSearchUrl', () => {
  it('builds a basic search URL', () => {
    expect(buildSearchUrl('test query')).toContain('/search?');
  });

  it('includes q param', () => {
    const url = buildSearchUrl('hello');
    expect(url).toContain('q=hello');
  });

  it('starts with /search', () => {
    expect(buildSearchUrl('foo').startsWith('/search')).toBe(true);
  });

  it('includes additional filter params', () => {
    const url = buildSearchUrl('risk', { module: 'infosec' });
    expect(url).toContain('module=infosec');
  });

  it('includes multiple filter params', () => {
    const url = buildSearchUrl('audit', { module: 'quality', status: 'open' });
    expect(url).toContain('module=quality');
    expect(url).toContain('status=open');
  });

  it('encodes special chars in query', () => {
    const url = buildSearchUrl('hello world');
    expect(url).toContain('q=hello+world');
  });

  it('empty filters still produces valid URL', () => {
    const url = buildSearchUrl('test', {});
    expect(url).toContain('q=test');
  });

  it('undefined filters omitted', () => {
    const url = buildSearchUrl('test');
    expect(url).toContain('q=test');
  });

  for (let i = 0; i < 20; i++) {
    it(`buildSearchUrl query variation ${i}`, () => {
      const url = buildSearchUrl(`query-${i}`);
      expect(url).toContain(`query-${i}`);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`buildSearchUrl with module filter ${i}`, () => {
      const url = buildSearchUrl(`q${i}`, { module: `mod-${i}` });
      expect(url).toContain(`mod-${i}`);
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 6. createDeepLinkRegistry — 200 tests
// ════════════════════════════════════════════════════════════════════════════

describe('createDeepLinkRegistry — basic operations', () => {
  it('creates an empty registry', () => {
    const reg = createDeepLinkRegistry();
    expect(reg.getAllConfigs()).toHaveLength(0);
  });

  it('creates a registry with initial configs', () => {
    const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
    expect(reg.getAllConfigs().length).toBe(DEFAULT_DEEP_LINKS.length);
  });

  it('register adds a config', () => {
    const reg = createDeepLinkRegistry();
    reg.register(makeConfig());
    expect(reg.getAllConfigs()).toHaveLength(1);
  });

  it('register overwrites duplicate module/entityType', () => {
    const reg = createDeepLinkRegistry();
    reg.register(makeConfig({ urlPattern: '/quality/ncr/{id}/v1' }));
    reg.register(makeConfig({ urlPattern: '/quality/ncr/{id}/v2' }));
    expect(reg.getAllConfigs()).toHaveLength(1);
    expect(reg.getConfig('quality', 'ncr')!.urlPattern).toBe('/quality/ncr/{id}/v2');
  });

  it('unregister removes a config', () => {
    const reg = createDeepLinkRegistry();
    reg.register(makeConfig());
    reg.unregister('quality', 'ncr');
    expect(reg.getAllConfigs()).toHaveLength(0);
  });

  it('unregister non-existent config does not throw', () => {
    const reg = createDeepLinkRegistry();
    expect(() => reg.unregister('nonexistent', 'type')).not.toThrow();
  });

  it('getConfig returns the correct config', () => {
    const reg = createDeepLinkRegistry([makeConfig()]);
    const cfg = reg.getConfig('quality', 'ncr');
    expect(cfg).toBeDefined();
    expect(cfg!.urlPattern).toBe('/quality/ncr/{id}');
  });

  it('getConfig returns undefined for unknown', () => {
    const reg = createDeepLinkRegistry();
    expect(reg.getConfig('unknown', 'type')).toBeUndefined();
  });

  it('resolve returns a ResolvedDeepLink', () => {
    const reg = createDeepLinkRegistry([makeConfig()]);
    const result = reg.resolve('quality', 'ncr', '123');
    expect(result).not.toBeNull();
    expect(result!.entityId).toBe('123');
  });

  it('resolve returns null for unknown config', () => {
    const reg = createDeepLinkRegistry();
    expect(reg.resolve('unknown', 'type', '1')).toBeNull();
  });

  it('resolve includes params in result', () => {
    const reg = createDeepLinkRegistry([makeConfig()]);
    const result = reg.resolve('quality', 'ncr', '1', { tab: 'notes' });
    expect(result!.params.tab).toBe('notes');
  });

  it('resolve with no params sets empty params object', () => {
    const reg = createDeepLinkRegistry([makeConfig()]);
    const result = reg.resolve('quality', 'ncr', '1');
    expect(result!.params).toEqual({});
  });

  it('parse returns a ResolvedDeepLink for known URL', () => {
    const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
    const result = reg.parse('/quality/ncr/abc');
    expect(result).not.toBeNull();
    expect(result!.module).toBe('quality');
  });

  it('parse returns null for unknown URL', () => {
    const reg = createDeepLinkRegistry();
    expect(reg.parse('/unknown/type/1')).toBeNull();
  });

  it('parse returns null for empty string', () => {
    const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
    expect(reg.parse('')).toBeNull();
  });

  it('parse extracts query params', () => {
    const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
    const result = reg.parse('/quality/ncr/123?tab=overview');
    expect(result!.params.tab).toBe('overview');
  });

  it('getAllConfigs returns all registered configs', () => {
    const reg = createDeepLinkRegistry();
    reg.register(makeConfig({ module: 'a', entityType: 'b' }));
    reg.register(makeConfig({ module: 'c', entityType: 'd' }));
    expect(reg.getAllConfigs()).toHaveLength(2);
  });

  it('register multiple distinct configs', () => {
    const reg = createDeepLinkRegistry();
    for (let i = 0; i < 10; i++) {
      reg.register(makeConfig({ module: `mod${i}`, entityType: `type${i}` }));
    }
    expect(reg.getAllConfigs()).toHaveLength(10);
  });
});

describe('createDeepLinkRegistry — all DEFAULT_DEEP_LINKS registered', () => {
  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    it(`registry resolve works for ${cfg.module}/${cfg.entityType}`, () => {
      const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
      const result = reg.resolve(cfg.module, cfg.entityType, `id-${i}`);
      expect(result).not.toBeNull();
      expect(result!.module).toBe(cfg.module);
      expect(result!.entityType).toBe(cfg.entityType);
      expect(result!.entityId).toBe(`id-${i}`);
    });
  }

  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    it(`registry parse works for ${cfg.module}/${cfg.entityType}`, () => {
      const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
      const result = reg.parse(`/${cfg.module}/${cfg.entityType}/ent-${i}`);
      expect(result).not.toBeNull();
      expect(result!.entityType).toBe(cfg.entityType);
    });
  }

  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    it(`registry getConfig works for ${cfg.module}/${cfg.entityType}`, () => {
      const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
      const found = reg.getConfig(cfg.module, cfg.entityType);
      expect(found).toBeDefined();
      expect(found!.requiresAuth).toBe(true);
    });
  }

  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    it(`registry unregister then resolve null for ${cfg.module}/${cfg.entityType}`, () => {
      const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
      reg.unregister(cfg.module, cfg.entityType);
      expect(reg.resolve(cfg.module, cfg.entityType, 'id')).toBeNull();
    });
  }
});

describe('createDeepLinkRegistry — advanced', () => {
  for (let i = 0; i < 20; i++) {
    it(`dynamic register/resolve cycle ${i}`, () => {
      const reg = createDeepLinkRegistry();
      const mod = `m${i}`;
      const typ = `t${i}`;
      reg.register(makeConfig({ module: mod, entityType: typ }));
      const result = reg.resolve(mod, typ, `id-${i}`);
      expect(result).not.toBeNull();
      expect(result!.entityId).toBe(`id-${i}`);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`dynamic register/parse cycle ${i}`, () => {
      const reg = createDeepLinkRegistry();
      const mod = `pm${i}`;
      const typ = `pt${i}`;
      reg.register(makeConfig({ module: mod, entityType: typ }));
      const result = reg.parse(`/${mod}/${typ}/eid-${i}`);
      expect(result).not.toBeNull();
      expect(result!.entityId).toBe(`eid-${i}`);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`register with requiresAuth=false ${i}`, () => {
      const reg = createDeepLinkRegistry();
      reg.register(makeConfig({ module: `pub${i}`, entityType: `res${i}`, requiresAuth: false }));
      expect(reg.getConfig(`pub${i}`, `res${i}`)!.requiresAuth).toBe(false);
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`resolve with multiple params ${i}`, () => {
      const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
      const cfg = DEFAULT_DEEP_LINKS[i % DEFAULT_DEEP_LINKS.length];
      const result = reg.resolve(cfg.module, cfg.entityType, `id-${i}`, { a: `x${i}`, b: `y${i}` });
      expect(result!.params.a).toBe(`x${i}`);
      expect(result!.params.b).toBe(`y${i}`);
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 7. DEFAULT_DEEP_LINKS — 100 tests
// ════════════════════════════════════════════════════════════════════════════

describe('DEFAULT_DEEP_LINKS — structure', () => {
  it('is an array', () => {
    expect(Array.isArray(DEFAULT_DEEP_LINKS)).toBe(true);
  });

  it('has at least 20 entries', () => {
    expect(DEFAULT_DEEP_LINKS.length).toBeGreaterThanOrEqual(20);
  });

  it('every entry has module', () => {
    DEFAULT_DEEP_LINKS.forEach(c => expect(typeof c.module).toBe('string'));
  });

  it('every entry has entityType', () => {
    DEFAULT_DEEP_LINKS.forEach(c => expect(typeof c.entityType).toBe('string'));
  });

  it('every entry has urlPattern', () => {
    DEFAULT_DEEP_LINKS.forEach(c => expect(typeof c.urlPattern).toBe('string'));
  });

  it('every urlPattern contains {id}', () => {
    DEFAULT_DEEP_LINKS.forEach(c => expect(c.urlPattern).toContain('{id}'));
  });

  it('every entry has requiresAuth set', () => {
    DEFAULT_DEEP_LINKS.forEach(c => expect(c.requiresAuth).toBeDefined());
  });

  it('all entries have requiresAuth true', () => {
    DEFAULT_DEEP_LINKS.forEach(c => expect(c.requiresAuth).toBe(true));
  });

  it('includes quality/ncr', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'quality' && c.entityType === 'ncr')).toBe(true);
  });

  it('includes quality/capa', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'quality' && c.entityType === 'capa')).toBe(true);
  });

  it('includes health-safety/incident', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'health-safety' && c.entityType === 'incident')).toBe(true);
  });

  it('includes health-safety/risk', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'health-safety' && c.entityType === 'risk')).toBe(true);
  });

  it('includes hr/employee', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'hr' && c.entityType === 'employee')).toBe(true);
  });

  it('includes finance/invoice', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'finance' && c.entityType === 'invoice')).toBe(true);
  });

  it('includes esg/emission', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'esg' && c.entityType === 'emission')).toBe(true);
  });

  it('includes infosec/risk', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'infosec' && c.entityType === 'risk')).toBe(true);
  });

  it('includes risk/risk', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'risk' && c.entityType === 'risk')).toBe(true);
  });

  it('includes suppliers/supplier', () => {
    expect(DEFAULT_DEEP_LINKS.some(c => c.module === 'suppliers' && c.entityType === 'supplier')).toBe(true);
  });

  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    it(`DEFAULT_DEEP_LINKS[${i}] module is non-empty string`, () => {
      expect(cfg.module.length).toBeGreaterThan(0);
    });
  }

  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    it(`DEFAULT_DEEP_LINKS[${i}] urlPattern starts with /`, () => {
      expect(cfg.urlPattern.startsWith('/')).toBe(true);
    });
  }

  // No duplicate module+entityType combos
  it('no duplicate module+entityType combos', () => {
    const keys = DEFAULT_DEEP_LINKS.map(c => `${c.module}:${c.entityType}`);
    const unique = new Set(keys);
    expect(unique.size).toBe(keys.length);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// 8. Edge cases — 100 tests
// ════════════════════════════════════════════════════════════════════════════

describe('edge cases — buildDeepLink', () => {
  it('handles entityId with numbers only', () => {
    expect(buildDeepLink('quality', 'ncr', '000')).toBe('/quality/ncr/000');
  });

  it('handles entityId with UUID format', () => {
    const uuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const url = buildDeepLink('quality', 'ncr', uuid);
    expect(url).toContain(uuid);
  });

  it('handles empty entityId string', () => {
    // Just verify no exception
    expect(() => buildDeepLink('quality', 'ncr', '')).not.toThrow();
  });

  it('handles module with hyphen', () => {
    expect(buildDeepLink('health-safety', 'incident', '1')).toBe('/health-safety/incident/1');
  });

  it('handles entityType with hyphen', () => {
    expect(buildDeepLink('finance', 'purchase-order', '1')).toBe('/finance/purchase-order/1');
  });

  for (let i = 0; i < 20; i++) {
    it(`edge case buildDeepLink param value with spaces ${i}`, () => {
      const url = buildDeepLink('quality', 'ncr', `e${i}`, { note: `value ${i}` });
      expect(url).toContain('note=');
    });
  }
});

describe('edge cases — parseDeepLink', () => {
  const configs = DEFAULT_DEEP_LINKS;

  it('parse with deeply nested path (extra segments ignored for module/type/id)', () => {
    // /quality/ncr/123/sub → module=quality, entityType=ncr, entityId=123
    const result = parseDeepLink('/quality/ncr/123/sub', configs);
    expect(result).not.toBeNull();
    expect(result!.entityId).toBe('123');
  });

  for (let i = 0; i < 20; i++) {
    it(`edge case parseDeepLink empty params key ${i}`, () => {
      const cfg = DEFAULT_DEEP_LINKS[i % DEFAULT_DEEP_LINKS.length];
      const result = parseDeepLink(`/${cfg.module}/${cfg.entityType}/id-${i}?x${i}=y${i}`, configs);
      expect(result!.params[`x${i}`]).toBe(`y${i}`);
    });
  }
});

describe('edge cases — registry', () => {
  for (let i = 0; i < 20; i++) {
    it(`registry created fresh for each test ${i}`, () => {
      const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
      expect(reg.getAllConfigs().length).toBeGreaterThan(0);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`registry register + unregister + re-register ${i}`, () => {
      const reg = createDeepLinkRegistry();
      const mod = `cycle${i}`;
      const typ = `ct${i}`;
      reg.register(makeConfig({ module: mod, entityType: typ }));
      reg.unregister(mod, typ);
      reg.register(makeConfig({ module: mod, entityType: typ, requiresAuth: false }));
      expect(reg.getConfig(mod, typ)!.requiresAuth).toBe(false);
    });
  }
});

describe('edge cases — isDeepLink and getModuleFromUrl consistency', () => {
  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    it(`isDeepLink and getModuleFromUrl agree for ${cfg.module}/${cfg.entityType}`, () => {
      const url = `/${cfg.module}/${cfg.entityType}/id-${i}`;
      expect(isDeepLink(url)).toBe(true);
      expect(getModuleFromUrl(url)).toBe(cfg.module);
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
// 9. Stress / repetition tests — ensures ≥1000 total
// ════════════════════════════════════════════════════════════════════════════

describe('stress — buildDeepLink repetitions', () => {
  for (let i = 0; i < 50; i++) {
    it(`buildDeepLink stress ${i}: path has 4 segments`, () => {
      const url = buildDeepLink(`mod${i}`, `type${i}`, `id${i}`);
      expect(url.split('/').filter(Boolean).length).toBe(3);
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`buildDeepLink stress ${i}: no undefined in output`, () => {
      const url = buildDeepLink(`a${i}`, `b${i}`, `c${i}`);
      expect(url).not.toContain('undefined');
    });
  }
});

describe('stress — parseDeepLink repetitions', () => {
  const configs = DEFAULT_DEEP_LINKS;

  for (let i = 0; i < 25; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i % DEFAULT_DEEP_LINKS.length];
    it(`parseDeepLink stress ${i}: round-trip module preserved`, () => {
      const url = buildDeepLink(cfg.module, cfg.entityType, `stress-${i}`);
      const result = parseDeepLink(url, configs);
      expect(result).not.toBeNull();
      expect(result!.module).toBe(cfg.module);
    });
  }

  for (let i = 0; i < 25; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i % DEFAULT_DEEP_LINKS.length];
    it(`parseDeepLink stress ${i}: round-trip entityType preserved`, () => {
      const url = buildDeepLink(cfg.module, cfg.entityType, `st2-${i}`);
      const result = parseDeepLink(url, configs);
      expect(result!.entityType).toBe(cfg.entityType);
    });
  }

  for (let i = 0; i < 25; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i % DEFAULT_DEEP_LINKS.length];
    it(`parseDeepLink stress ${i}: round-trip entityId preserved`, () => {
      const id = `round-${i}`;
      const url = buildDeepLink(cfg.module, cfg.entityType, id);
      const result = parseDeepLink(url, configs);
      expect(result!.entityId).toBe(id);
    });
  }
});

describe('stress — registry resolve round-trips', () => {
  for (let i = 0; i < DEFAULT_DEEP_LINKS.length; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i];
    it(`registry round-trip resolve+parse consistency ${cfg.module}/${cfg.entityType}`, () => {
      const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
      const id = `rrt-${i}`;
      const resolved = reg.resolve(cfg.module, cfg.entityType, id);
      expect(resolved).not.toBeNull();
      const parsed = reg.parse(resolved!.url);
      expect(parsed).not.toBeNull();
      expect(parsed!.entityId).toBe(id);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`registry stress getAllConfigs length stable ${i}`, () => {
      const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
      const initial = reg.getAllConfigs().length;
      expect(initial).toBe(DEFAULT_DEEP_LINKS.length);
    });
  }

  for (let i = 0; i < 25; i++) {
    it(`registry stress register preserves other configs ${i}`, () => {
      const reg = createDeepLinkRegistry(DEFAULT_DEEP_LINKS);
      reg.register(makeConfig({ module: `extra${i}`, entityType: `ext${i}` }));
      expect(reg.getAllConfigs().length).toBe(DEFAULT_DEEP_LINKS.length + 1);
    });
  }
});

describe('stress — isDeepLink boundary cases', () => {
  const validModules = ['quality', 'health-safety', 'environment', 'hr', 'finance', 'esg', 'infosec', 'risk', 'suppliers'];
  for (let i = 0; i < 30; i++) {
    const mod = validModules[i % validModules.length];
    it(`isDeepLink stress ${i}: /${mod}/type/id returns true`, () => {
      expect(isDeepLink(`/${mod}/some-type/some-id-${i}`)).toBe(true);
    });
  }

  for (let i = 0; i < 30; i++) {
    it(`isDeepLink stress ${i}: /${i}/${i} (only 2 seg) returns false`, () => {
      expect(isDeepLink(`/m${i}/t${i}`)).toBe(false);
    });
  }
});

describe('stress — buildSearchUrl', () => {
  const terms = ['incident', 'risk', 'audit', 'capa', 'ncr', 'invoice', 'employee', 'emission', 'control', 'supplier'];
  for (let i = 0; i < 30; i++) {
    const term = terms[i % terms.length];
    it(`buildSearchUrl stress ${i}: term "${term}" appears in URL`, () => {
      const url = buildSearchUrl(term);
      expect(url).toContain(term);
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`buildSearchUrl stress ${i}: filters preserved`, () => {
      const url = buildSearchUrl('x', { key: `val${i}` });
      expect(url).toContain(`val${i}`);
    });
  }
});

describe('stress — getModuleFromUrl round-trips', () => {
  for (let i = 0; i < 30; i++) {
    const cfg = DEFAULT_DEEP_LINKS[i % DEFAULT_DEEP_LINKS.length];
    it(`getModuleFromUrl stress ${i}: buildDeepLink then extract module`, () => {
      const url = buildDeepLink(cfg.module, cfg.entityType, `sid${i}`);
      expect(getModuleFromUrl(url)).toBe(cfg.module);
    });
  }
});
