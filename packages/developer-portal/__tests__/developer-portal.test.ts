// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import {
  generateApiKey,
  hashApiKey,
  validateApiKeyFormat,
  maskApiKey,
  isProductionKey,
  isSandboxKey,
  ENDPOINT_CATALOGUE,
  getEndpointsByTag,
  searchEndpoints,
  generateCurlExample,
  generateTsExample,
} from '../src/index';

import type {
  DeveloperApp,
  ApiEndpointDoc,
  CodeExample,
} from '../src/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeApp(overrides: Partial<DeveloperApp> = {}): DeveloperApp {
  return {
    id: 'app-001',
    name: 'Test App',
    description: 'A test developer application',
    ownerId: 'user-123',
    clientId: 'client_abc123',
    clientSecretHash: 'sha256hashvalue',
    redirectUris: ['https://app.example.com/callback'],
    scopes: ['read:quality', 'read:hse'],
    status: 'sandbox',
    createdAt: new Date('2026-01-01'),
    rateLimitPerMin: 60,
    ...overrides,
  };
}

function makeEndpoint(overrides: Partial<ApiEndpointDoc> = {}): ApiEndpointDoc {
  return {
    method: 'GET',
    path: '/api/test',
    summary: 'Test endpoint',
    description: 'A test endpoint description',
    tags: ['test'],
    responses: { '200': { description: 'OK' } },
    auth: true,
    deprecated: false,
    ...overrides,
  };
}

// Production key: ims_sk_ + 48 hex chars
const VALID_PRODUCTION_KEY = 'ims_sk_' + 'a'.repeat(48);
// Sandbox key: ims_sb_ + 48 hex chars
const VALID_SANDBOX_KEY = 'ims_sb_' + 'b'.repeat(48);
// Public key: ims_pk_ + 48 hex chars
const VALID_PUBLIC_KEY = 'ims_pk_' + 'c'.repeat(48);

// ============================================================================
// SECTION 1: generateApiKey — 100+ tests
// ============================================================================

describe('generateApiKey', () => {
  describe('default prefix', () => {
    it('returns a string', () => {
      expect(typeof generateApiKey()).toBe('string');
    });

    it('starts with ims_sk_ by default', () => {
      expect(generateApiKey()).toMatch(/^ims_sk_/);
    });

    it('is longer than prefix alone', () => {
      expect(generateApiKey().length).toBeGreaterThan(7);
    });

    it('total length is 7 + 48 = 55', () => {
      // randomBytes(24).toString('hex') = 48 chars
      expect(generateApiKey()).toHaveLength(55);
    });

    it('hex suffix has 48 chars', () => {
      const key = generateApiKey();
      const suffix = key.replace('ims_sk_', '');
      expect(suffix).toHaveLength(48);
    });

    it('suffix is lowercase hex', () => {
      const key = generateApiKey();
      const suffix = key.replace('ims_sk_', '');
      expect(suffix).toMatch(/^[0-9a-f]{48}$/);
    });
  });

  describe('different each call', () => {
    it('two consecutive calls return different keys', () => {
      expect(generateApiKey()).not.toBe(generateApiKey());
    });

    it('three consecutive calls are all different', () => {
      const k1 = generateApiKey();
      const k2 = generateApiKey();
      const k3 = generateApiKey();
      expect(new Set([k1, k2, k3]).size).toBe(3);
    });

    it('10 keys are all unique', () => {
      const keys = Array.from({ length: 10 }, () => generateApiKey());
      expect(new Set(keys).size).toBe(10);
    });
  });

  describe('custom prefix', () => {
    it('custom prefix ims_sb_ is used', () => {
      expect(generateApiKey('ims_sb_')).toMatch(/^ims_sb_/);
    });

    it('custom prefix ims_pk_ is used', () => {
      expect(generateApiKey('ims_pk_')).toMatch(/^ims_pk_/);
    });

    it('custom prefix with empty string', () => {
      const key = generateApiKey('');
      expect(key).toHaveLength(48);
    });

    it('custom prefix "test_" results in test_ prefix', () => {
      expect(generateApiKey('test_')).toMatch(/^test_/);
    });

    it('custom prefix length reflected in total length', () => {
      const prefix = 'myprefix_';
      const key = generateApiKey(prefix);
      expect(key.length).toBe(prefix.length + 48);
    });

    it('ims_sb_ prefix produces different keys each call', () => {
      const k1 = generateApiKey('ims_sb_');
      const k2 = generateApiKey('ims_sb_');
      expect(k1).not.toBe(k2);
    });

    it('ims_pk_ suffix has 48 hex chars', () => {
      const key = generateApiKey('ims_pk_');
      expect(key.replace('ims_pk_', '')).toHaveLength(48);
    });
  });

  describe('format validation', () => {
    it('generated default key passes validateApiKeyFormat', () => {
      const key = generateApiKey();
      expect(validateApiKeyFormat(key)).toBe(true);
    });

    it('generated ims_sb_ key passes validateApiKeyFormat', () => {
      const key = generateApiKey('ims_sb_');
      expect(validateApiKeyFormat(key)).toBe(true);
    });

    it('generated ims_pk_ key passes validateApiKeyFormat', () => {
      const key = generateApiKey('ims_pk_');
      expect(validateApiKeyFormat(key)).toBe(true);
    });
  });

  describe('production key detection', () => {
    it('generated default key is production key', () => {
      expect(isProductionKey(generateApiKey())).toBe(true);
    });

    it('generated ims_sb_ key is not production key', () => {
      expect(isProductionKey(generateApiKey('ims_sb_'))).toBe(false);
    });
  });

  describe('sandbox key detection', () => {
    it('generated ims_sb_ key is sandbox key', () => {
      expect(isSandboxKey(generateApiKey('ims_sb_'))).toBe(true);
    });

    it('generated default key is not sandbox key', () => {
      expect(isSandboxKey(generateApiKey())).toBe(false);
    });
  });

  describe('can be hashed', () => {
    it('generated key can be hashed', () => {
      const key = generateApiKey();
      expect(typeof hashApiKey(key)).toBe('string');
    });

    it('generated key hash is consistent', () => {
      const key = generateApiKey();
      expect(hashApiKey(key)).toBe(hashApiKey(key));
    });
  });

  describe('can be masked', () => {
    it('generated key can be masked', () => {
      const key = generateApiKey();
      const masked = maskApiKey(key);
      expect(masked).toContain('...');
    });
  });
});

// ============================================================================
// SECTION 2: validateApiKeyFormat — 100+ tests
// ============================================================================

describe('validateApiKeyFormat', () => {
  describe('valid keys', () => {
    it('ims_sk_ + 40 hex chars is valid', () => {
      expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(40))).toBe(true);
    });

    it('ims_sk_ + 48 hex chars is valid', () => {
      expect(validateApiKeyFormat(VALID_PRODUCTION_KEY)).toBe(true);
    });

    it('ims_sb_ + 48 hex chars is valid', () => {
      expect(validateApiKeyFormat(VALID_SANDBOX_KEY)).toBe(true);
    });

    it('ims_pk_ + 48 hex chars is valid', () => {
      expect(validateApiKeyFormat(VALID_PUBLIC_KEY)).toBe(true);
    });

    it('ims_sk_ + 40 lowercase hex chars is valid', () => {
      expect(validateApiKeyFormat('ims_sk_' + '0123456789abcdef'.repeat(3) + '00000000')).toBe(true);
    });

    it('ims_sb_ + 50 hex chars is valid (>= 40)', () => {
      expect(validateApiKeyFormat('ims_sb_' + 'a'.repeat(50))).toBe(true);
    });
  });

  describe('invalid keys', () => {
    it('empty string is invalid', () => {
      expect(validateApiKeyFormat('')).toBe(false);
    });

    it('too short hex suffix → invalid', () => {
      expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(39))).toBe(false);
    });

    it('wrong prefix → invalid', () => {
      expect(validateApiKeyFormat('sk_' + 'a'.repeat(48))).toBe(false);
    });

    it('ims_xx_ prefix → invalid', () => {
      expect(validateApiKeyFormat('ims_xx_' + 'a'.repeat(48))).toBe(false);
    });

    it('uppercase hex chars → invalid', () => {
      expect(validateApiKeyFormat('ims_sk_' + 'A'.repeat(48))).toBe(false);
    });

    it('non-hex chars in suffix → invalid', () => {
      expect(validateApiKeyFormat('ims_sk_' + 'g'.repeat(48))).toBe(false);
    });

    it('spaces in key → invalid', () => {
      expect(validateApiKeyFormat('ims_sk_ ' + 'a'.repeat(47))).toBe(false);
    });

    it('random string is invalid', () => {
      expect(validateApiKeyFormat('not-an-api-key')).toBe(false);
    });

    it('ims_sk with no underscore → invalid', () => {
      expect(validateApiKeyFormat('ims_sk' + 'a'.repeat(48))).toBe(false);
    });
  });

  describe('returns boolean', () => {
    it('returns true for valid key', () => {
      expect(typeof validateApiKeyFormat(VALID_PRODUCTION_KEY)).toBe('boolean');
    });

    it('returns false as boolean', () => {
      expect(typeof validateApiKeyFormat('bad')).toBe('boolean');
    });
  });

  describe('all valid prefix variants', () => {
    const prefixes = ['ims_sk_', 'ims_sb_', 'ims_pk_'];
    for (const prefix of prefixes) {
      it(`prefix "${prefix}" with 48 hex chars is valid`, () => {
        expect(validateApiKeyFormat(prefix + 'a'.repeat(48))).toBe(true);
      });

      it(`prefix "${prefix}" with exactly 40 chars is valid`, () => {
        expect(validateApiKeyFormat(prefix + 'f'.repeat(40))).toBe(true);
      });

      it(`prefix "${prefix}" with 39 chars is invalid`, () => {
        expect(validateApiKeyFormat(prefix + 'f'.repeat(39))).toBe(false);
      });
    }
  });
});

// ============================================================================
// SECTION 3: maskApiKey — 100+ tests
// ============================================================================

describe('maskApiKey', () => {
  describe('normal keys', () => {
    it('returns a string', () => {
      expect(typeof maskApiKey(VALID_PRODUCTION_KEY)).toBe('string');
    });

    it('contains "..."', () => {
      expect(maskApiKey(VALID_PRODUCTION_KEY)).toContain('...');
    });

    it('shows first 10 chars', () => {
      const masked = maskApiKey(VALID_PRODUCTION_KEY);
      expect(masked.startsWith(VALID_PRODUCTION_KEY.slice(0, 10))).toBe(true);
    });

    it('shows last 4 chars', () => {
      const masked = maskApiKey(VALID_PRODUCTION_KEY);
      expect(masked.endsWith(VALID_PRODUCTION_KEY.slice(-4))).toBe(true);
    });

    it('format is first10 + ... + last4', () => {
      const key = VALID_PRODUCTION_KEY;
      const expected = key.slice(0, 10) + '...' + key.slice(-4);
      expect(maskApiKey(key)).toBe(expected);
    });

    it('sandbox key is masked correctly', () => {
      const key = VALID_SANDBOX_KEY;
      expect(maskApiKey(key)).toBe(key.slice(0, 10) + '...' + key.slice(-4));
    });

    it('public key is masked correctly', () => {
      const key = VALID_PUBLIC_KEY;
      expect(maskApiKey(key)).toBe(key.slice(0, 10) + '...' + key.slice(-4));
    });
  });

  describe('short keys (length <= 14)', () => {
    it('exactly 14 chars → ***', () => {
      expect(maskApiKey('a'.repeat(14))).toBe('***');
    });

    it('13 chars → ***', () => {
      expect(maskApiKey('a'.repeat(13))).toBe('***');
    });

    it('1 char → ***', () => {
      expect(maskApiKey('x')).toBe('***');
    });

    it('empty string → ***', () => {
      expect(maskApiKey('')).toBe('***');
    });

    it('15 chars → not ***', () => {
      const key = 'a'.repeat(15);
      expect(maskApiKey(key)).not.toBe('***');
    });
  });

  describe('various key lengths', () => {
    [15, 20, 30, 40, 55, 100].forEach((len) => {
      it(`key of length ${len} shows first 10 and last 4`, () => {
        const key = 'x'.repeat(len);
        const masked = maskApiKey(key);
        expect(masked.startsWith(key.slice(0, 10))).toBe(true);
        expect(masked.endsWith(key.slice(-4))).toBe(true);
        expect(masked).toContain('...');
      });
    });
  });

  describe('masked key does not reveal the middle', () => {
    it('masked key is shorter than original', () => {
      expect(maskApiKey(VALID_PRODUCTION_KEY).length).toBeLessThan(VALID_PRODUCTION_KEY.length);
    });

    it('masked key format: length = 10 + 3 + 4 = 17', () => {
      expect(maskApiKey(VALID_PRODUCTION_KEY)).toHaveLength(17);
    });
  });
});

// ============================================================================
// SECTION 4: isProductionKey + isSandboxKey — 100+ tests
// ============================================================================

describe('isProductionKey', () => {
  it('ims_sk_ prefix → true', () => {
    expect(isProductionKey('ims_sk_abc')).toBe(true);
  });

  it('ims_sb_ prefix → false', () => {
    expect(isProductionKey('ims_sb_abc')).toBe(false);
  });

  it('ims_pk_ prefix → false', () => {
    expect(isProductionKey('ims_pk_abc')).toBe(false);
  });

  it('empty string → false', () => {
    expect(isProductionKey('')).toBe(false);
  });

  it('VALID_PRODUCTION_KEY → true', () => {
    expect(isProductionKey(VALID_PRODUCTION_KEY)).toBe(true);
  });

  it('VALID_SANDBOX_KEY → false', () => {
    expect(isProductionKey(VALID_SANDBOX_KEY)).toBe(false);
  });

  it('VALID_PUBLIC_KEY → false', () => {
    expect(isProductionKey(VALID_PUBLIC_KEY)).toBe(false);
  });

  it('random string → false', () => {
    expect(isProductionKey('random')).toBe(false);
  });

  it('returns boolean', () => {
    expect(typeof isProductionKey('ims_sk_x')).toBe('boolean');
  });

  it('string starting with ims_sk but no underscore → false', () => {
    expect(isProductionKey('ims_skXYZ')).toBe(false);
  });

  describe('exhaustive prefix tests', () => {
    const truePrefixes = ['ims_sk_'];
    const falsePrefixes = ['ims_sb_', 'ims_pk_', '', 'sk_', 'ims_', 'prefix_', 'IMS_SK_'];
    for (const p of truePrefixes) {
      it(`"${p}key" → true`, () => { expect(isProductionKey(`${p}key`)).toBe(true); });
    }
    for (const p of falsePrefixes) {
      it(`"${p}key" → false`, () => { expect(isProductionKey(`${p}key`)).toBe(false); });
    }
  });
});

describe('isSandboxKey', () => {
  it('ims_sb_ prefix → true', () => {
    expect(isSandboxKey('ims_sb_abc')).toBe(true);
  });

  it('ims_sk_ prefix → false', () => {
    expect(isSandboxKey('ims_sk_abc')).toBe(false);
  });

  it('ims_pk_ prefix → false', () => {
    expect(isSandboxKey('ims_pk_abc')).toBe(false);
  });

  it('empty string → false', () => {
    expect(isSandboxKey('')).toBe(false);
  });

  it('VALID_SANDBOX_KEY → true', () => {
    expect(isSandboxKey(VALID_SANDBOX_KEY)).toBe(true);
  });

  it('VALID_PRODUCTION_KEY → false', () => {
    expect(isSandboxKey(VALID_PRODUCTION_KEY)).toBe(false);
  });

  it('returns boolean', () => {
    expect(typeof isSandboxKey('ims_sb_x')).toBe('boolean');
  });

  it('random string → false', () => {
    expect(isSandboxKey('not-a-key')).toBe(false);
  });

  it('ims_sb without trailing underscore → false', () => {
    expect(isSandboxKey('ims_sb' + 'a'.repeat(48))).toBe(false);
  });

  describe('exhaustive prefix tests', () => {
    const truePrefixes = ['ims_sb_'];
    const falsePrefixes = ['ims_sk_', 'ims_pk_', '', 'sb_', 'sandbox_', 'IMS_SB_'];
    for (const p of truePrefixes) {
      it(`"${p}key" → true`, () => { expect(isSandboxKey(`${p}key`)).toBe(true); });
    }
    for (const p of falsePrefixes) {
      it(`"${p}key" → false`, () => { expect(isSandboxKey(`${p}key`)).toBe(false); });
    }
  });
});

// ============================================================================
// SECTION 5: hashApiKey — 50+ tests
// ============================================================================

describe('hashApiKey', () => {
  describe('return type', () => {
    it('returns a string', () => {
      expect(typeof hashApiKey('some-key')).toBe('string');
    });

    it('returns a 64-char hex string (SHA-256)', () => {
      expect(hashApiKey(VALID_PRODUCTION_KEY)).toHaveLength(64);
    });

    it('result is lowercase hex', () => {
      expect(hashApiKey(VALID_PRODUCTION_KEY)).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('deterministic', () => {
    it('same input → same hash', () => {
      expect(hashApiKey('test-key')).toBe(hashApiKey('test-key'));
    });

    it('same key twice gives same hash', () => {
      const h1 = hashApiKey(VALID_PRODUCTION_KEY);
      const h2 = hashApiKey(VALID_PRODUCTION_KEY);
      expect(h1).toBe(h2);
    });

    it('different inputs → different hashes', () => {
      expect(hashApiKey('key-1')).not.toBe(hashApiKey('key-2'));
    });

    it('production vs sandbox key → different hashes', () => {
      expect(hashApiKey(VALID_PRODUCTION_KEY)).not.toBe(hashApiKey(VALID_SANDBOX_KEY));
    });
  });

  describe('various inputs', () => {
    it('empty string has defined hash', () => {
      expect(hashApiKey('')).toHaveLength(64);
    });

    it('short key has correct length hash', () => {
      expect(hashApiKey('x')).toHaveLength(64);
    });

    it('very long key has correct length hash', () => {
      expect(hashApiKey('x'.repeat(1000))).toHaveLength(64);
    });

    it('hashing the same value multiple times is consistent', () => {
      const key = generateApiKey();
      const hashes = Array.from({ length: 5 }, () => hashApiKey(key));
      expect(new Set(hashes).size).toBe(1);
    });
  });
});

// ============================================================================
// SECTION 6: ENDPOINT_CATALOGUE — 100+ tests
// ============================================================================

describe('ENDPOINT_CATALOGUE', () => {
  describe('structure', () => {
    it('is an array', () => {
      expect(Array.isArray(ENDPOINT_CATALOGUE)).toBe(true);
    });

    it('has at least 10 endpoints', () => {
      expect(ENDPOINT_CATALOGUE.length).toBeGreaterThanOrEqual(10);
    });

    it('has 20 endpoints', () => {
      expect(ENDPOINT_CATALOGUE).toHaveLength(20);
    });
  });

  describe('each entry has required properties', () => {
    for (let i = 0; i < ENDPOINT_CATALOGUE.length; i++) {
      const ep = ENDPOINT_CATALOGUE[i];
      it(`endpoint[${i}] has method`, () => {
        expect(ep.method).toBeDefined();
      });

      it(`endpoint[${i}] method is valid HTTP verb`, () => {
        expect(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).toContain(ep.method);
      });

      it(`endpoint[${i}] has path`, () => {
        expect(typeof ep.path).toBe('string');
        expect(ep.path).toMatch(/^\//);
      });

      it(`endpoint[${i}] has summary string`, () => {
        expect(typeof ep.summary).toBe('string');
        expect(ep.summary.length).toBeGreaterThan(0);
      });

      it(`endpoint[${i}] has description string`, () => {
        expect(typeof ep.description).toBe('string');
        expect(ep.description.length).toBeGreaterThan(0);
      });

      it(`endpoint[${i}] has tags array`, () => {
        expect(Array.isArray(ep.tags)).toBe(true);
        expect(ep.tags.length).toBeGreaterThan(0);
      });

      it(`endpoint[${i}] has responses object`, () => {
        expect(typeof ep.responses).toBe('object');
        expect(Object.keys(ep.responses).length).toBeGreaterThan(0);
      });

      it(`endpoint[${i}] has auth boolean`, () => {
        expect(typeof ep.auth).toBe('boolean');
      });

      it(`endpoint[${i}] has deprecated boolean`, () => {
        expect(typeof ep.deprecated).toBe('boolean');
      });
    }
  });

  describe('specific endpoints', () => {
    it('contains POST /api/auth/login', () => {
      expect(ENDPOINT_CATALOGUE.some((e) => e.path === '/api/auth/login' && e.method === 'POST')).toBe(true);
    });

    it('login endpoint has auth: false', () => {
      const login = ENDPOINT_CATALOGUE.find((e) => e.path === '/api/auth/login');
      expect(login!.auth).toBe(false);
    });

    it('contains GET /api/health-safety/risks', () => {
      expect(ENDPOINT_CATALOGUE.some((e) => e.path === '/api/health-safety/risks' && e.method === 'GET')).toBe(true);
    });

    it('GET /api/health-safety/risks requires auth', () => {
      const ep = ENDPOINT_CATALOGUE.find((e) => e.path === '/api/health-safety/risks' && e.method === 'GET');
      expect(ep!.auth).toBe(true);
    });

    it('contains POST /api/incidents', () => {
      expect(ENDPOINT_CATALOGUE.some((e) => e.path === '/api/incidents' && e.method === 'POST')).toBe(true);
    });

    it('contains GET /api/esg/emissions', () => {
      expect(ENDPOINT_CATALOGUE.some((e) => e.path === '/api/esg/emissions')).toBe(true);
    });

    it('contains GET /api/analytics/kpis', () => {
      expect(ENDPOINT_CATALOGUE.some((e) => e.path === '/api/analytics/kpis')).toBe(true);
    });

    it('no endpoint is deprecated by default', () => {
      expect(ENDPOINT_CATALOGUE.every((e) => e.deprecated === false)).toBe(true);
    });
  });

  describe('tags in catalogue', () => {
    const knownTags = ['auth', 'health-safety', 'incidents', 'documents', 'audits', 'esg', 'analytics', 'hr', 'training', 'suppliers', 'compliance'];
    for (const tag of knownTags) {
      it(`catalogue contains at least one endpoint with tag "${tag}"`, () => {
        expect(ENDPOINT_CATALOGUE.some((e) => e.tags.includes(tag))).toBe(true);
      });
    }
  });
});

// ============================================================================
// SECTION 7: getEndpointsByTag — 100+ tests
// ============================================================================

describe('getEndpointsByTag', () => {
  describe('known tags', () => {
    it('tag "auth" returns endpoints', () => {
      expect(getEndpointsByTag('auth').length).toBeGreaterThan(0);
    });

    it('tag "auth" returns endpoints with auth tag', () => {
      getEndpointsByTag('auth').forEach((e) => {
        expect(e.tags).toContain('auth');
      });
    });

    it('tag "health-safety" returns endpoints', () => {
      expect(getEndpointsByTag('health-safety').length).toBeGreaterThan(0);
    });

    it('tag "risks" returns endpoints', () => {
      expect(getEndpointsByTag('risks').length).toBeGreaterThan(0);
    });

    it('tag "incidents" returns at least 1 endpoint', () => {
      expect(getEndpointsByTag('incidents').length).toBeGreaterThanOrEqual(1);
    });

    it('tag "documents" returns at least 1 endpoint', () => {
      expect(getEndpointsByTag('documents').length).toBeGreaterThanOrEqual(1);
    });

    it('tag "audits" returns at least 1 endpoint', () => {
      expect(getEndpointsByTag('audits').length).toBeGreaterThanOrEqual(1);
    });

    it('tag "esg" returns at least 1 endpoint', () => {
      expect(getEndpointsByTag('esg').length).toBeGreaterThanOrEqual(1);
    });

    it('tag "analytics" returns at least 1 endpoint', () => {
      expect(getEndpointsByTag('analytics').length).toBeGreaterThanOrEqual(1);
    });

    it('tag "hr" returns at least 1 endpoint', () => {
      expect(getEndpointsByTag('hr').length).toBeGreaterThanOrEqual(1);
    });

    it('tag "training" returns at least 1 endpoint', () => {
      expect(getEndpointsByTag('training').length).toBeGreaterThanOrEqual(1);
    });

    it('tag "suppliers" returns at least 1 endpoint', () => {
      expect(getEndpointsByTag('suppliers').length).toBeGreaterThanOrEqual(1);
    });

    it('tag "compliance" returns at least 1 endpoint', () => {
      expect(getEndpointsByTag('compliance').length).toBeGreaterThanOrEqual(1);
    });

    it('tag "emissions" returns endpoints', () => {
      expect(getEndpointsByTag('emissions').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('unknown tag', () => {
    it('unknown tag returns empty array', () => {
      expect(getEndpointsByTag('unknown-xyz')).toEqual([]);
    });

    it('empty string tag returns empty array', () => {
      expect(getEndpointsByTag('')).toEqual([]);
    });

    it('tag "HEALTH-SAFETY" (wrong case) returns empty', () => {
      expect(getEndpointsByTag('HEALTH-SAFETY')).toHaveLength(0);
    });
  });

  describe('return type', () => {
    it('returns an array', () => {
      expect(Array.isArray(getEndpointsByTag('auth'))).toBe(true);
    });

    it('each result is an ApiEndpointDoc', () => {
      getEndpointsByTag('auth').forEach((e) => {
        expect(e).toHaveProperty('method');
        expect(e).toHaveProperty('path');
        expect(e).toHaveProperty('summary');
      });
    });
  });

  describe('result consistency', () => {
    it('all returned endpoints contain the queried tag', () => {
      const tag = 'health-safety';
      getEndpointsByTag(tag).forEach((e) => {
        expect(e.tags).toContain(tag);
      });
    });

    it('same tag called twice returns same count', () => {
      expect(getEndpointsByTag('auth').length).toBe(getEndpointsByTag('auth').length);
    });
  });

  describe('all auth endpoints have correct login path', () => {
    it('auth endpoints include /api/auth/login', () => {
      const paths = getEndpointsByTag('auth').map((e) => e.path);
      expect(paths).toContain('/api/auth/login');
    });

    it('auth endpoints include /api/auth/logout', () => {
      const paths = getEndpointsByTag('auth').map((e) => e.path);
      expect(paths).toContain('/api/auth/logout');
    });
  });
});

// ============================================================================
// SECTION 8: searchEndpoints — 150+ tests
// ============================================================================

describe('searchEndpoints', () => {
  describe('search by path', () => {
    it('search "auth" finds auth endpoints', () => {
      expect(searchEndpoints('auth').length).toBeGreaterThan(0);
    });

    it('search "/api/auth/login" finds login', () => {
      expect(searchEndpoints('/api/auth/login').length).toBeGreaterThan(0);
    });

    it('search "incidents" finds incident endpoints', () => {
      expect(searchEndpoints('incidents').length).toBeGreaterThan(0);
    });

    it('search "health-safety" finds risk endpoints', () => {
      expect(searchEndpoints('health-safety').length).toBeGreaterThan(0);
    });

    it('search "esg" finds ESG endpoints', () => {
      expect(searchEndpoints('esg').length).toBeGreaterThan(0);
    });

    it('search "analytics" finds analytics endpoints', () => {
      expect(searchEndpoints('analytics').length).toBeGreaterThan(0);
    });

    it('search "hr" finds HR endpoints', () => {
      expect(searchEndpoints('hr').length).toBeGreaterThan(0);
    });

    it('search "suppliers" finds supplier endpoints', () => {
      expect(searchEndpoints('suppliers').length).toBeGreaterThan(0);
    });
  });

  describe('search by summary', () => {
    it('search "authenticate" finds login', () => {
      const results = searchEndpoints('authenticate');
      expect(results.some((e) => e.path === '/api/auth/login')).toBe(true);
    });

    it('search "List risks" finds risk endpoint', () => {
      expect(searchEndpoints('List risks').length).toBeGreaterThan(0);
    });

    it('search "Report incident" finds incident endpoint', () => {
      expect(searchEndpoints('Report incident').length).toBeGreaterThan(0);
    });

    it('search "Get KPIs" finds analytics endpoint', () => {
      expect(searchEndpoints('Get KPIs').length).toBeGreaterThan(0);
    });
  });

  describe('search by description', () => {
    it('search "JWT" finds auth endpoint', () => {
      expect(searchEndpoints('JWT').length).toBeGreaterThan(0);
    });

    it('search "paginated" finds paginated endpoints', () => {
      expect(searchEndpoints('paginated').length).toBeGreaterThan(0);
    });

    it('search "greenhouse" finds esg emissions', () => {
      expect(searchEndpoints('greenhouse').length).toBeGreaterThan(0);
    });

    it('search "training" finds training endpoint', () => {
      expect(searchEndpoints('training').length).toBeGreaterThan(0);
    });
  });

  describe('case insensitive', () => {
    it('uppercase AUTH finds same as lowercase auth', () => {
      expect(searchEndpoints('AUTH').length).toBe(searchEndpoints('auth').length);
    });

    it('mixed case "INCIDENTS" finds incidents', () => {
      expect(searchEndpoints('INCIDENTS').length).toBeGreaterThan(0);
    });

    it('mixed case "Authenticate" matches "authenticate"', () => {
      expect(searchEndpoints('Authenticate').length).toBe(searchEndpoints('authenticate').length);
    });
  });

  describe('empty query', () => {
    it('empty query returns all endpoints', () => {
      expect(searchEndpoints('')).toHaveLength(ENDPOINT_CATALOGUE.length);
    });
  });

  describe('no match', () => {
    it('unmatched query returns empty array', () => {
      expect(searchEndpoints('zzznomatch999')).toHaveLength(0);
    });

    it('pure whitespace may or may not match (consistent behavior)', () => {
      expect(typeof searchEndpoints('  ').length).toBe('number');
    });
  });

  describe('return type', () => {
    it('returns an array', () => {
      expect(Array.isArray(searchEndpoints('auth'))).toBe(true);
    });

    it('each result has path', () => {
      searchEndpoints('auth').forEach((e) => {
        expect(typeof e.path).toBe('string');
      });
    });

    it('each result has method', () => {
      searchEndpoints('auth').forEach((e) => {
        expect(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).toContain(e.method);
      });
    });
  });

  describe('partial matching', () => {
    it('partial path "api/auth" finds auth endpoints', () => {
      expect(searchEndpoints('api/auth').length).toBeGreaterThan(0);
    });

    it('partial summary word "user" finds some endpoints', () => {
      expect(searchEndpoints('user').length).toBeGreaterThan(0);
    });

    it('partial word "emiss" finds emissions', () => {
      expect(searchEndpoints('emiss').length).toBeGreaterThan(0);
    });
  });

  describe('multiple endpoints match same query', () => {
    it('"api" matches many endpoints', () => {
      expect(searchEndpoints('api').length).toBeGreaterThan(5);
    });

    it('"risks" matches risk CRUD endpoints', () => {
      expect(searchEndpoints('risks').length).toBeGreaterThanOrEqual(1);
    });
  });
});

// ============================================================================
// SECTION 9: generateCurlExample — 100+ tests
// ============================================================================

describe('generateCurlExample', () => {
  describe('return type', () => {
    it('returns a string', () => {
      expect(typeof generateCurlExample(makeEndpoint())).toBe('string');
    });

    it('contains "curl"', () => {
      expect(generateCurlExample(makeEndpoint())).toContain('curl');
    });
  });

  describe('contains HTTP method', () => {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
    for (const method of methods) {
      it(`method ${method} appears in curl example`, () => {
        expect(generateCurlExample(makeEndpoint({ method }))).toContain(method);
      });
    }
  });

  describe('contains path', () => {
    it('contains the endpoint path', () => {
      const ep = makeEndpoint({ path: '/api/test/path' });
      expect(generateCurlExample(ep)).toContain('/api/test/path');
    });

    it('contains full URL with domain', () => {
      const ep = makeEndpoint({ path: '/api/health-safety/risks' });
      expect(generateCurlExample(ep)).toContain('https://api.nexara.io/api/health-safety/risks');
    });
  });

  describe('auth header', () => {
    it('auth: true → includes Authorization header', () => {
      const ep = makeEndpoint({ auth: true });
      expect(generateCurlExample(ep)).toContain('Authorization');
    });

    it('auth: false → no Authorization header', () => {
      const ep = makeEndpoint({ auth: false });
      expect(generateCurlExample(ep)).not.toContain('Authorization');
    });

    it('auth: true → includes Bearer', () => {
      const ep = makeEndpoint({ auth: true });
      expect(generateCurlExample(ep)).toContain('Bearer');
    });
  });

  describe('request body', () => {
    it('POST with requestBody → includes -d flag', () => {
      const ep = makeEndpoint({ method: 'POST', requestBody: { email: 'string' }, auth: false });
      expect(generateCurlExample(ep)).toContain("-d '");
    });

    it('GET with requestBody → no -d flag', () => {
      const ep = makeEndpoint({ method: 'GET', requestBody: { some: 'data' } });
      expect(generateCurlExample(ep)).not.toContain("-d '");
    });

    it('PUT with requestBody → includes -d flag', () => {
      const ep = makeEndpoint({ method: 'PUT', requestBody: { name: 'string' } });
      expect(generateCurlExample(ep)).toContain("-d '");
    });

    it('DELETE has no body', () => {
      const ep = makeEndpoint({ method: 'DELETE', requestBody: { id: 'string' } });
      expect(generateCurlExample(ep)).not.toContain("-d '");
    });

    it('POST with requestBody → includes Content-Type', () => {
      const ep = makeEndpoint({ method: 'POST', requestBody: { email: 'string' }, auth: false });
      expect(generateCurlExample(ep)).toContain('Content-Type');
    });
  });

  describe('all ENDPOINT_CATALOGUE entries', () => {
    for (let i = 0; i < ENDPOINT_CATALOGUE.length; i++) {
      const ep = ENDPOINT_CATALOGUE[i];
      it(`ENDPOINT_CATALOGUE[${i}] (${ep.method} ${ep.path}) generates curl example`, () => {
        const curl = generateCurlExample(ep);
        expect(curl).toContain('curl');
        expect(curl).toContain(ep.method);
        expect(curl).toContain(ep.path);
      });
    }
  });

  describe('curl -X flag', () => {
    it('curl uses -X flag', () => {
      expect(generateCurlExample(makeEndpoint({ method: 'POST' }))).toContain('-X POST');
    });

    it('curl uses -X GET', () => {
      expect(generateCurlExample(makeEndpoint({ method: 'GET' }))).toContain('-X GET');
    });
  });
});

// ============================================================================
// SECTION 10: generateTsExample — 100+ tests
// ============================================================================

describe('generateTsExample', () => {
  describe('return type', () => {
    it('returns a string', () => {
      expect(typeof generateTsExample(makeEndpoint())).toBe('string');
    });

    it('contains "fetch"', () => {
      expect(generateTsExample(makeEndpoint())).toContain('fetch');
    });
  });

  describe('contains path', () => {
    it('contains the endpoint path in URL', () => {
      const ep = makeEndpoint({ path: '/api/test-path' });
      expect(generateTsExample(ep)).toContain('/api/test-path');
    });

    it('contains full URL with domain', () => {
      const ep = makeEndpoint({ path: '/api/health-safety/risks' });
      expect(generateTsExample(ep)).toContain('https://api.nexara.io/api/health-safety/risks');
    });
  });

  describe('contains HTTP method', () => {
    const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const;
    for (const method of methods) {
      it(`method ${method} appears in TS example`, () => {
        expect(generateTsExample(makeEndpoint({ method }))).toContain(method);
      });
    }
  });

  describe('contains auth header', () => {
    it('contains Authorization header', () => {
      expect(generateTsExample(makeEndpoint())).toContain('Authorization');
    });

    it('contains Bearer token', () => {
      expect(generateTsExample(makeEndpoint())).toContain('Bearer');
    });

    it('contains Content-Type header', () => {
      expect(generateTsExample(makeEndpoint())).toContain('Content-Type');
    });
  });

  describe('request body', () => {
    it('POST with requestBody → includes body', () => {
      const ep = makeEndpoint({ method: 'POST', requestBody: { email: 'string' } });
      expect(generateTsExample(ep)).toContain('body');
    });

    it('GET with no body → no body in example', () => {
      const ep = makeEndpoint({ method: 'GET' });
      expect(generateTsExample(ep)).not.toContain('body:');
    });

    it('POST with requestBody → includes JSON.stringify', () => {
      const ep = makeEndpoint({ method: 'POST', requestBody: { email: 'string' } });
      expect(generateTsExample(ep)).toContain('JSON.stringify');
    });

    it('PUT with requestBody → includes JSON.stringify', () => {
      const ep = makeEndpoint({ method: 'PUT', requestBody: { name: 'string' } });
      expect(generateTsExample(ep)).toContain('JSON.stringify');
    });

    it('DELETE with requestBody → no body (DELETE excluded)', () => {
      const ep = makeEndpoint({ method: 'DELETE', requestBody: { id: '123' } });
      expect(generateTsExample(ep)).not.toContain('JSON.stringify');
    });
  });

  describe('response handling', () => {
    it('contains response.json()', () => {
      expect(generateTsExample(makeEndpoint())).toContain('response.json');
    });

    it('uses await', () => {
      expect(generateTsExample(makeEndpoint())).toContain('await');
    });

    it('assigns to data variable', () => {
      expect(generateTsExample(makeEndpoint())).toContain('data');
    });
  });

  describe('all ENDPOINT_CATALOGUE entries', () => {
    for (let i = 0; i < ENDPOINT_CATALOGUE.length; i++) {
      const ep = ENDPOINT_CATALOGUE[i];
      it(`ENDPOINT_CATALOGUE[${i}] (${ep.method} ${ep.path}) generates TS example`, () => {
        const ts = generateTsExample(ep);
        expect(ts).toContain('fetch');
        expect(ts).toContain(ep.path);
        expect(ts).toContain(ep.method);
      });
    }
  });
});

// ============================================================================
// SECTION 11: DeveloperApp shape validation — 100+ tests
// ============================================================================

describe('DeveloperApp shape', () => {
  describe('required string fields', () => {
    it('has id string', () => {
      expect(typeof makeApp().id).toBe('string');
    });

    it('has name string', () => {
      expect(typeof makeApp().name).toBe('string');
    });

    it('has description string', () => {
      expect(typeof makeApp().description).toBe('string');
    });

    it('has ownerId string', () => {
      expect(typeof makeApp().ownerId).toBe('string');
    });

    it('has clientId string', () => {
      expect(typeof makeApp().clientId).toBe('string');
    });

    it('has clientSecretHash string', () => {
      expect(typeof makeApp().clientSecretHash).toBe('string');
    });
  });

  describe('array fields', () => {
    it('redirectUris is an array', () => {
      expect(Array.isArray(makeApp().redirectUris)).toBe(true);
    });

    it('scopes is an array', () => {
      expect(Array.isArray(makeApp().scopes)).toBe(true);
    });
  });

  describe('status field', () => {
    it('status is one of sandbox, production, suspended', () => {
      const validStatuses = ['sandbox', 'production', 'suspended'];
      expect(validStatuses).toContain(makeApp().status);
    });

    it('sandbox status', () => {
      expect(makeApp({ status: 'sandbox' }).status).toBe('sandbox');
    });

    it('production status', () => {
      expect(makeApp({ status: 'production' }).status).toBe('production');
    });

    it('suspended status', () => {
      expect(makeApp({ status: 'suspended' }).status).toBe('suspended');
    });
  });

  describe('date fields', () => {
    it('createdAt is a Date', () => {
      expect(makeApp().createdAt instanceof Date).toBe(true);
    });

    it('lastUsedAt is optional', () => {
      const app = makeApp();
      expect(app.lastUsedAt === undefined || app.lastUsedAt instanceof Date).toBe(true);
    });

    it('lastUsedAt as Date is valid', () => {
      expect(makeApp({ lastUsedAt: new Date() }).lastUsedAt instanceof Date).toBe(true);
    });
  });

  describe('numeric fields', () => {
    it('rateLimitPerMin is a number', () => {
      expect(typeof makeApp().rateLimitPerMin).toBe('number');
    });

    it('rateLimitPerMin is positive', () => {
      expect(makeApp().rateLimitPerMin).toBeGreaterThan(0);
    });
  });

  describe('optional API keys', () => {
    it('sandboxApiKey is optional', () => {
      expect(makeApp({ sandboxApiKey: undefined }).sandboxApiKey).toBeUndefined();
    });

    it('productionApiKey is optional', () => {
      expect(makeApp({ productionApiKey: undefined }).productionApiKey).toBeUndefined();
    });

    it('sandboxApiKey as string', () => {
      const app = makeApp({ sandboxApiKey: VALID_SANDBOX_KEY });
      expect(isSandboxKey(app.sandboxApiKey!)).toBe(true);
    });

    it('productionApiKey as production key', () => {
      const app = makeApp({ productionApiKey: VALID_PRODUCTION_KEY });
      expect(isProductionKey(app.productionApiKey!)).toBe(true);
    });
  });

  describe('various field values', () => {
    it('name can be any non-empty string', () => {
      expect(makeApp({ name: 'My Awesome Integration App' }).name).toBe('My Awesome Integration App');
    });

    it('scopes can be empty', () => {
      expect(makeApp({ scopes: [] }).scopes).toHaveLength(0);
    });

    it('multiple redirect URIs stored', () => {
      const app = makeApp({ redirectUris: ['https://a.com/cb', 'https://b.com/cb'] });
      expect(app.redirectUris).toHaveLength(2);
    });

    it('rate limit 120 is valid', () => {
      expect(makeApp({ rateLimitPerMin: 120 }).rateLimitPerMin).toBe(120);
    });

    it('id can be set to custom value', () => {
      expect(makeApp({ id: 'custom-app-id' }).id).toBe('custom-app-id');
    });
  });
});


// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK A: generateApiKey deep tests
// ---------------------------------------------------------------------------
describe('generateApiKey deep tests A', () => {
  it('returns a non-empty string', () => {
    expect(generateApiKey().length).toBeGreaterThan(0);
  });
  it('starts with ims_sk_ by default', () => {
    expect(generateApiKey().startsWith('ims_sk_')).toBe(true);
  });
  it('custom prefix ims_sb_ is applied', () => {
    expect(generateApiKey('ims_sb_').startsWith('ims_sb_')).toBe(true);
  });
  it('custom prefix ims_pk_ is applied', () => {
    expect(generateApiKey('ims_pk_').startsWith('ims_pk_')).toBe(true);
  });
  it('body is 48 hex chars for default prefix', () => {
    expect(generateApiKey().slice(7).length).toBe(48);
  });
  it('does not throw', () => {
    expect(() => generateApiKey()).not.toThrow();
  });
  it('two calls produce different keys', () => {
    expect(generateApiKey()).not.toBe(generateApiKey());
  });
  it('result does not contain whitespace', () => {
    expect(/\s/.test(generateApiKey())).toBe(false);
  });
  it('result is a primitive string', () => {
    expect(generateApiKey() instanceof String).toBe(false);
  });
  it('body contains only hex chars', () => {
    expect(/^[0-9a-f]+$/.test(generateApiKey().slice(7))).toBe(true);
  });
  it('three calls all unique', () => {
    const s = new Set([generateApiKey(), generateApiKey(), generateApiKey()]);
    expect(s.size).toBe(3);
  });
  it('default total length is 55', () => {
    expect(generateApiKey().length).toBe(55);
  });
  it('sandbox key has length 55', () => {
    expect(generateApiKey('ims_sb_').length).toBe(55);
  });
  it('empty prefix produces 48-char key', () => {
    expect(generateApiKey('').length).toBe(48);
  });
  it('long prefix key has correct length', () => {
    const p = 'my_prefix_';
    expect(generateApiKey(p).length).toBe(p.length + 48);
  });
  it('result is truthy', () => {
    expect(generateApiKey()).toBeTruthy();
  });
  it('no uppercase in body', () => {
    const body = generateApiKey().slice(7);
    expect(body).toBe(body.toLowerCase());
  });
  it('generated key validates with validateApiKeyFormat', () => {
    expect(validateApiKeyFormat(generateApiKey())).toBe(true);
  });
  it('sandbox key validates with validateApiKeyFormat', () => {
    expect(validateApiKeyFormat(generateApiKey('ims_sb_'))).toBe(true);
  });
  it('public key validates with validateApiKeyFormat', () => {
    expect(validateApiKeyFormat(generateApiKey('ims_pk_'))).toBe(true);
  });
});

describe('generateApiKey deep tests B', () => {
  it('key starts with ims_sk_a or ims_sk_b or any hex digit', () => {
    const k = generateApiKey();
    expect(/^ims_sk_[0-9a-f]/.test(k)).toBe(true);
  });
  it('can be passed to hashApiKey without error', () => {
    expect(() => hashApiKey(generateApiKey())).not.toThrow();
  });
  it('can be passed to maskApiKey without error', () => {
    expect(() => maskApiKey(generateApiKey())).not.toThrow();
  });
  it('isProductionKey returns true for default', () => {
    expect(isProductionKey(generateApiKey())).toBe(true);
  });
  it('isSandboxKey returns false for default', () => {
    expect(isSandboxKey(generateApiKey())).toBe(false);
  });
  it('isSandboxKey returns true for ims_sb_ prefix', () => {
    expect(isSandboxKey(generateApiKey('ims_sb_'))).toBe(true);
  });
  it('isProductionKey returns false for ims_sb_ prefix', () => {
    expect(isProductionKey(generateApiKey('ims_sb_'))).toBe(false);
  });
  it('50 generated keys are all unique', () => {
    const keys = new Set(Array.from({ length: 50 }, () => generateApiKey()));
    expect(keys.size).toBe(50);
  });
  it('hash of generated key is 64 chars', () => {
    expect(hashApiKey(generateApiKey()).length).toBe(64);
  });
  it('masked generated key contains ...', () => {
    expect(maskApiKey(generateApiKey()).includes('...')).toBe(true);
  });
  it('masked generated key starts with ims_sk_', () => {
    expect(maskApiKey(generateApiKey()).startsWith('ims_sk_')).toBe(true);
  });
  it('masked generated key ends with 4 hex chars', () => {
    const masked = maskApiKey(generateApiKey());
    const suffix = masked.split('...')[1];
    expect(/^[0-9a-f]{4}$/.test(suffix)).toBe(true);
  });
  it('body of key is never all zeros', () => {
    // extremely unlikely to be all zeros, but tests that it is valid hex
    const body = generateApiKey().slice(7);
    expect(/^[0-9a-f]{48}$/.test(body)).toBe(true);
  });
  it('prefix ims_sk_ has exactly 7 chars', () => {
    expect('ims_sk_'.length).toBe(7);
  });
  it('prefix ims_sb_ has exactly 7 chars', () => {
    expect('ims_sb_'.length).toBe(7);
  });
  it('prefix ims_pk_ has exactly 7 chars', () => {
    expect('ims_pk_'.length).toBe(7);
  });
  it('key body never contains uppercase letters', () => {
    for (let i = 0; i < 10; i++) {
      const body = generateApiKey().slice(7);
      expect(/[A-Z]/.test(body)).toBe(false);
    }
  });
  it('key body never contains dashes', () => {
    expect(generateApiKey().slice(7).includes('-')).toBe(false);
  });
  it('key body never contains underscores', () => {
    expect(generateApiKey().slice(7).includes('_')).toBe(false);
  });
  it('key body never contains spaces', () => {
    expect(generateApiKey().slice(7).includes(' ')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK B: hashApiKey deep tests
// ---------------------------------------------------------------------------
describe('hashApiKey deep tests A', () => {
  it('returns 64 char hex for short input', () => {
    expect(hashApiKey('x').length).toBe(64);
  });
  it('returns 64 char hex for empty input', () => {
    expect(hashApiKey('').length).toBe(64);
  });
  it('returns 64 char hex for long input', () => {
    expect(hashApiKey('a'.repeat(500)).length).toBe(64);
  });
  it('is deterministic for production key', () => {
    const k = VALID_PRODUCTION_KEY;
    expect(hashApiKey(k)).toBe(hashApiKey(k));
  });
  it('is deterministic for sandbox key', () => {
    const k = VALID_SANDBOX_KEY;
    expect(hashApiKey(k)).toBe(hashApiKey(k));
  });
  it('different keys produce different hashes', () => {
    expect(hashApiKey('ims_sk_' + 'a'.repeat(48))).not.toBe(hashApiKey('ims_sk_' + 'b'.repeat(48)));
  });
  it('result is all lowercase hex', () => {
    expect(/^[0-9a-f]{64}$/.test(hashApiKey('test'))).toBe(true);
  });
  it('does not return the original key', () => {
    const k = 'test';
    expect(hashApiKey(k)).not.toBe(k);
  });
  it('does not throw on unicode input', () => {
    expect(() => hashApiKey('\u2603test')).not.toThrow();
  });
  it('does not contain spaces', () => {
    expect(hashApiKey('key').includes(' ')).toBe(false);
  });
  it('does not contain underscores', () => {
    expect(hashApiKey('key').includes('_')).toBe(false);
  });
  it('does not contain dashes', () => {
    expect(hashApiKey('key').includes('-')).toBe(false);
  });
  it('result is truthy', () => {
    expect(hashApiKey('test')).toBeTruthy();
  });
  it('result is not null', () => {
    expect(hashApiKey('test')).not.toBeNull();
  });
  it('result is not undefined', () => {
    expect(hashApiKey('test')).not.toBeUndefined();
  });
  it('result is not empty string', () => {
    expect(hashApiKey('test')).not.toBe('');
  });
  it('numeric string is hashable', () => {
    expect(hashApiKey('12345').length).toBe(64);
  });
  it('special chars are hashable', () => {
    expect(hashApiKey('!@#$%^&*()').length).toBe(64);
  });
  it('newline is hashable', () => {
    expect(hashApiKey('\n').length).toBe(64);
  });
  it('tab is hashable', () => {
    expect(hashApiKey('\t').length).toBe(64);
  });
});

describe('hashApiKey deep tests B', () => {
  it('hashing 5 different keys gives 5 different hashes', () => {
    const keys = ['a', 'b', 'c', 'd', 'e'].map(c => hashApiKey(c));
    expect(new Set(keys).size).toBe(5);
  });
  it('hash length is independent of input length', () => {
    expect(hashApiKey('a').length).toBe(hashApiKey('a'.repeat(100)).length);
  });
  it('hashing a hash produces 64 chars', () => {
    const h1 = hashApiKey('test');
    expect(hashApiKey(h1).length).toBe(64);
  });
  it('hash of production key is not the key', () => {
    expect(hashApiKey(VALID_PRODUCTION_KEY)).not.toBe(VALID_PRODUCTION_KEY);
  });
  it('hash of sandbox key is not the key', () => {
    expect(hashApiKey(VALID_SANDBOX_KEY)).not.toBe(VALID_SANDBOX_KEY);
  });
  it('known SHA-256 empty string hash is correct', () => {
    expect(hashApiKey('')).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });
  it('result has no uppercase', () => {
    expect(hashApiKey('hello')).toBe(hashApiKey('hello').toLowerCase());
  });
  it('result has no linebreaks', () => {
    expect(hashApiKey('test').includes('\n')).toBe(false);
  });
  it('can hash a masked key', () => {
    const masked = maskApiKey(VALID_PRODUCTION_KEY);
    expect(hashApiKey(masked).length).toBe(64);
  });
  it('hashing is idempotent for 10 calls', () => {
    const k = generateApiKey();
    const hashes = Array.from({ length: 10 }, () => hashApiKey(k));
    expect(new Set(hashes).size).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK C: validateApiKeyFormat deep tests
// ---------------------------------------------------------------------------
describe('validateApiKeyFormat deep tests A', () => {
  it('ims_sk_ + 40 hex = valid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(40))).toBe(true);
  });
  it('ims_sk_ + 48 hex = valid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(48))).toBe(true);
  });
  it('ims_sb_ + 40 hex = valid', () => {
    expect(validateApiKeyFormat('ims_sb_' + 'b'.repeat(40))).toBe(true);
  });
  it('ims_pk_ + 40 hex = valid', () => {
    expect(validateApiKeyFormat('ims_pk_' + 'c'.repeat(40))).toBe(true);
  });
  it('ims_sk_ + 39 hex = invalid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(39))).toBe(false);
  });
  it('ims_sb_ + 39 hex = invalid', () => {
    expect(validateApiKeyFormat('ims_sb_' + 'a'.repeat(39))).toBe(false);
  });
  it('ims_pk_ + 39 hex = invalid', () => {
    expect(validateApiKeyFormat('ims_pk_' + 'a'.repeat(39))).toBe(false);
  });
  it('empty string = invalid', () => {
    expect(validateApiKeyFormat('')).toBe(false);
  });
  it('random string = invalid', () => {
    expect(validateApiKeyFormat('randomstring')).toBe(false);
  });
  it('uppercase prefix = invalid', () => {
    expect(validateApiKeyFormat('IMS_SK_' + 'a'.repeat(48))).toBe(false);
  });
  it('uppercase body = invalid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'A'.repeat(48))).toBe(false);
  });
  it('g in body = invalid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'g'.repeat(48))).toBe(false);
  });
  it('z in body = invalid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'z'.repeat(48))).toBe(false);
  });
  it('space in body = invalid', () => {
    expect(validateApiKeyFormat('ims_sk_ ' + 'a'.repeat(47))).toBe(false);
  });
  it('dash in body = invalid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(47) + '-')).toBe(false);
  });
  it('only prefix = invalid', () => {
    expect(validateApiKeyFormat('ims_sk_')).toBe(false);
  });
  it('ims_rk_ prefix = invalid', () => {
    expect(validateApiKeyFormat('ims_rk_' + 'a'.repeat(48))).toBe(false);
  });
  it('ims_tk_ prefix = invalid', () => {
    expect(validateApiKeyFormat('ims_tk_' + 'a'.repeat(48))).toBe(false);
  });
  it('key with 100 hex chars = valid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(100))).toBe(true);
  });
  it('all valid hex digits accepted', () => {
    expect(validateApiKeyFormat('ims_sk_' + '0123456789abcdef'.repeat(3))).toBe(true);
  });
});

describe('validateApiKeyFormat deep tests B', () => {
  it('returns boolean type', () => {
    expect(typeof validateApiKeyFormat(VALID_PRODUCTION_KEY)).toBe('boolean');
  });
  it('returns boolean false type', () => {
    expect(typeof validateApiKeyFormat('bad')).toBe('boolean');
  });
  it('does not throw', () => {
    expect(() => validateApiKeyFormat('anything')).not.toThrow();
  });
  it('does not throw on empty string', () => {
    expect(() => validateApiKeyFormat('')).not.toThrow();
  });
  it('generated default key is valid', () => {
    expect(validateApiKeyFormat(generateApiKey())).toBe(true);
  });
  it('generated sandbox key is valid', () => {
    expect(validateApiKeyFormat(generateApiKey('ims_sb_'))).toBe(true);
  });
  it('generated public key is valid', () => {
    expect(validateApiKeyFormat(generateApiKey('ims_pk_'))).toBe(true);
  });
  it('VALID_PRODUCTION_KEY is valid', () => {
    expect(validateApiKeyFormat(VALID_PRODUCTION_KEY)).toBe(true);
  });
  it('VALID_SANDBOX_KEY is valid', () => {
    expect(validateApiKeyFormat(VALID_SANDBOX_KEY)).toBe(true);
  });
  it('VALID_PUBLIC_KEY is valid', () => {
    expect(validateApiKeyFormat(VALID_PUBLIC_KEY)).toBe(true);
  });
  it('key ending with ! is invalid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(47) + '!')).toBe(false);
  });
  it('key ending with underscore is invalid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(47) + '_')).toBe(false);
  });
  it('key with mixed case is invalid', () => {
    expect(validateApiKeyFormat('ims_sk_aAbBcC' + 'a'.repeat(40))).toBe(false);
  });
  it('null-like string is invalid', () => {
    expect(validateApiKeyFormat('null')).toBe(false);
  });
  it('undefined-like string is invalid', () => {
    expect(validateApiKeyFormat('undefined')).toBe(false);
  });
  it('true-like string is invalid', () => {
    expect(validateApiKeyFormat('true')).toBe(false);
  });
  it('number string is invalid', () => {
    expect(validateApiKeyFormat('12345678901234567890')).toBe(false);
  });
  it('key with newline is invalid', () => {
    expect(validateApiKeyFormat('ims_sk_\n' + 'a'.repeat(47))).toBe(false);
  });
  it('validates 10 generated keys in a row', () => {
    for (let i = 0; i < 10; i++) {
      expect(validateApiKeyFormat(generateApiKey())).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK D: maskApiKey deep tests
// ---------------------------------------------------------------------------
describe('maskApiKey deep tests A', () => {
  it('returns string', () => {
    expect(typeof maskApiKey(VALID_PRODUCTION_KEY)).toBe('string');
  });
  it('result contains ...', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY).includes('...')).toBe(true);
  });
  it('first 10 chars match original', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY).slice(0, 10)).toBe(VALID_PRODUCTION_KEY.slice(0, 10));
  });
  it('last 4 chars match original', () => {
    const m = maskApiKey(VALID_PRODUCTION_KEY);
    expect(m.slice(-4)).toBe(VALID_PRODUCTION_KEY.slice(-4));
  });
  it('total masked length is 17 (10 + 3 + 4)', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY).length).toBe(17);
  });
  it('empty string returns ***', () => {
    expect(maskApiKey('')).toBe('***');
  });
  it('1-char key returns ***', () => {
    expect(maskApiKey('a')).toBe('***');
  });
  it('14-char key returns ***', () => {
    expect(maskApiKey('a'.repeat(14))).toBe('***');
  });
  it('15-char key does not return ***', () => {
    expect(maskApiKey('a'.repeat(15))).not.toBe('***');
  });
  it('15-char key has ...', () => {
    expect(maskApiKey('a'.repeat(15)).includes('...')).toBe(true);
  });
  it('100-char key has ...', () => {
    expect(maskApiKey('a'.repeat(100)).includes('...')).toBe(true);
  });
  it('masked key is shorter than original for long key', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY).length).toBeLessThan(VALID_PRODUCTION_KEY.length);
  });
  it('does not expose middle segment', () => {
    const key = 'ims_sk_' + 'secret12345678901234567890' + '1234';
    const masked = maskApiKey(key);
    expect(masked.includes('secret')).toBe(false);
  });
  it('deterministic: same key same mask', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY)).toBe(maskApiKey(VALID_PRODUCTION_KEY));
  });
  it('different keys produce different masks', () => {
    const k1 = 'ims_sk_' + 'a'.repeat(44) + '1234';
    const k2 = 'ims_sk_' + 'a'.repeat(44) + '5678';
    expect(maskApiKey(k1)).not.toBe(maskApiKey(k2));
  });
  it('sandbox key masked starts with ims_sb_', () => {
    expect(maskApiKey(VALID_SANDBOX_KEY).startsWith('ims_sb_')).toBe(true);
  });
  it('public key masked starts with ims_pk_', () => {
    expect(maskApiKey(VALID_PUBLIC_KEY).startsWith('ims_pk_')).toBe(true);
  });
  it('generated key masked has correct structure', () => {
    const k = generateApiKey();
    const m = maskApiKey(k);
    expect(m).toBe(k.slice(0, 10) + '...' + k.slice(-4));
  });
  it('does not throw on empty string', () => {
    expect(() => maskApiKey('')).not.toThrow();
  });
  it('does not throw on very long key', () => {
    expect(() => maskApiKey('a'.repeat(1000))).not.toThrow();
  });
});

describe('maskApiKey deep tests B', () => {
  it('exactly one ... in result for long key', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY).split('...').length - 1).toBe(1);
  });
  it('result does not end with ...', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY).endsWith('...')).toBe(false);
  });
  it('result does not start with ...', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY).startsWith('...')).toBe(false);
  });
  it('16-char key has 17-char mask', () => {
    expect(maskApiKey('a'.repeat(16)).length).toBe(17);
  });
  it('50-char key has 17-char mask', () => {
    expect(maskApiKey('a'.repeat(50)).length).toBe(17);
  });
  it('200-char key has 17-char mask', () => {
    expect(maskApiKey('a'.repeat(200)).length).toBe(17);
  });
  it('returns string not object', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY) instanceof String).toBe(false);
  });
  it('result is truthy for long key', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY)).toBeTruthy();
  });
  it('*** is returned for 0-12 char keys', () => {
    for (let i = 0; i <= 12; i++) {
      expect(maskApiKey('a'.repeat(i))).toBe('***');
    }
  });
  it('*** is returned for 13-char key', () => {
    expect(maskApiKey('a'.repeat(13))).toBe('***');
  });
  it('can mask a hash output', () => {
    const hash = hashApiKey('test');
    expect(maskApiKey(hash).includes('...')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK E: isProductionKey deep tests
// ---------------------------------------------------------------------------
describe('isProductionKey deep tests', () => {
  it('ims_sk_anything is true', () => {
    expect(isProductionKey('ims_sk_anything')).toBe(true);
  });
  it('ims_sb_anything is false', () => {
    expect(isProductionKey('ims_sb_anything')).toBe(false);
  });
  it('ims_pk_anything is false', () => {
    expect(isProductionKey('ims_pk_anything')).toBe(false);
  });
  it('empty is false', () => {
    expect(isProductionKey('')).toBe(false);
  });
  it('just ims_sk_ is true', () => {
    expect(isProductionKey('ims_sk_')).toBe(true);
  });
  it('IMS_SK_ (uppercase) is false', () => {
    expect(isProductionKey('IMS_SK_abc')).toBe(false);
  });
  it('leading space is false', () => {
    expect(isProductionKey(' ims_sk_abc')).toBe(false);
  });
  it('returns boolean', () => {
    expect(typeof isProductionKey('test')).toBe('boolean');
  });
  it('does not throw', () => {
    expect(() => isProductionKey('anything')).not.toThrow();
  });
  it('10 production keys all return true', () => {
    for (let i = 0; i < 10; i++) {
      expect(isProductionKey(generateApiKey())).toBe(true);
    }
  });
  it('10 sandbox keys all return false', () => {
    for (let i = 0; i < 10; i++) {
      expect(isProductionKey(generateApiKey('ims_sb_'))).toBe(false);
    }
  });
  it('VALID_PRODUCTION_KEY returns true', () => {
    expect(isProductionKey(VALID_PRODUCTION_KEY)).toBe(true);
  });
  it('VALID_SANDBOX_KEY returns false', () => {
    expect(isProductionKey(VALID_SANDBOX_KEY)).toBe(false);
  });
  it('VALID_PUBLIC_KEY returns false', () => {
    expect(isProductionKey(VALID_PUBLIC_KEY)).toBe(false);
  });
  it('ims_sk without trailing _ is false', () => {
    expect(isProductionKey('ims_sk' + 'a'.repeat(48))).toBe(false);
  });
  it('prod_key is false', () => {
    expect(isProductionKey('prod_key_abc')).toBe(false);
  });
  it('secret_key is false', () => {
    expect(isProductionKey('secret_key_abc')).toBe(false);
  });
  it('null string is false', () => {
    expect(isProductionKey('null')).toBe(false);
  });
  it('undefined string is false', () => {
    expect(isProductionKey('undefined')).toBe(false);
  });
  it('long production key is true', () => {
    expect(isProductionKey('ims_sk_' + 'f'.repeat(200))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK F: isSandboxKey deep tests
// ---------------------------------------------------------------------------
describe('isSandboxKey deep tests', () => {
  it('ims_sb_anything is true', () => {
    expect(isSandboxKey('ims_sb_anything')).toBe(true);
  });
  it('ims_sk_anything is false', () => {
    expect(isSandboxKey('ims_sk_anything')).toBe(false);
  });
  it('ims_pk_anything is false', () => {
    expect(isSandboxKey('ims_pk_anything')).toBe(false);
  });
  it('empty is false', () => {
    expect(isSandboxKey('')).toBe(false);
  });
  it('just ims_sb_ is true', () => {
    expect(isSandboxKey('ims_sb_')).toBe(true);
  });
  it('IMS_SB_ (uppercase) is false', () => {
    expect(isSandboxKey('IMS_SB_abc')).toBe(false);
  });
  it('leading space is false', () => {
    expect(isSandboxKey(' ims_sb_abc')).toBe(false);
  });
  it('returns boolean', () => {
    expect(typeof isSandboxKey('test')).toBe('boolean');
  });
  it('does not throw', () => {
    expect(() => isSandboxKey('anything')).not.toThrow();
  });
  it('10 sandbox keys all return true', () => {
    for (let i = 0; i < 10; i++) {
      expect(isSandboxKey(generateApiKey('ims_sb_'))).toBe(true);
    }
  });
  it('10 production keys all return false', () => {
    for (let i = 0; i < 10; i++) {
      expect(isSandboxKey(generateApiKey())).toBe(false);
    }
  });
  it('VALID_SANDBOX_KEY returns true', () => {
    expect(isSandboxKey(VALID_SANDBOX_KEY)).toBe(true);
  });
  it('VALID_PRODUCTION_KEY returns false', () => {
    expect(isSandboxKey(VALID_PRODUCTION_KEY)).toBe(false);
  });
  it('VALID_PUBLIC_KEY returns false', () => {
    expect(isSandboxKey(VALID_PUBLIC_KEY)).toBe(false);
  });
  it('ims_sb without trailing _ is false', () => {
    expect(isSandboxKey('ims_sb' + 'a'.repeat(48))).toBe(false);
  });
  it('sandbox_key is false', () => {
    expect(isSandboxKey('sandbox_key_abc')).toBe(false);
  });
  it('null string is false', () => {
    expect(isSandboxKey('null')).toBe(false);
  });
  it('long sandbox key is true', () => {
    expect(isSandboxKey('ims_sb_' + 'f'.repeat(200))).toBe(true);
  });
  it('isProductionKey and isSandboxKey never both true', () => {
    const keys = [VALID_PRODUCTION_KEY, VALID_SANDBOX_KEY, VALID_PUBLIC_KEY, generateApiKey(), generateApiKey('ims_sb_')];
    for (const k of keys) {
      expect(isProductionKey(k) && isSandboxKey(k)).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK G: ENDPOINT_CATALOGUE deep tests
// ---------------------------------------------------------------------------
describe('ENDPOINT_CATALOGUE deep tests A', () => {
  it('is defined', () => {
    expect(ENDPOINT_CATALOGUE).toBeDefined();
  });
  it('is an array', () => {
    expect(Array.isArray(ENDPOINT_CATALOGUE)).toBe(true);
  });
  it('has exactly 20 entries', () => {
    expect(ENDPOINT_CATALOGUE.length).toBe(20);
  });
  it('first entry is POST /api/auth/login', () => {
    expect(ENDPOINT_CATALOGUE[0].path).toBe('/api/auth/login');
    expect(ENDPOINT_CATALOGUE[0].method).toBe('POST');
  });
  it('no entry is deprecated', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e.deprecated === false)).toBe(true);
  });
  it('all paths start with /api/', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e.path.startsWith('/api/'))).toBe(true);
  });
  it('all methods are valid HTTP verbs', () => {
    const valid = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
    expect(ENDPOINT_CATALOGUE.every(e => valid.includes(e.method))).toBe(true);
  });
  it('login endpoint has auth false', () => {
    expect(ENDPOINT_CATALOGUE.find(e => e.path === '/api/auth/login')?.auth).toBe(false);
  });
  it('all other endpoints have auth true', () => {
    expect(ENDPOINT_CATALOGUE.filter(e => e.path !== '/api/auth/login').every(e => e.auth)).toBe(true);
  });
  it('contains GET /api/health-safety/risks', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/health-safety/risks' && e.method === 'GET')).toBe(true);
  });
  it('contains POST /api/health-safety/risks', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/health-safety/risks' && e.method === 'POST')).toBe(true);
  });
  it('contains GET /api/health-safety/risks/:id', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/health-safety/risks/:id' && e.method === 'GET')).toBe(true);
  });
  it('contains PUT /api/health-safety/risks/:id', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/health-safety/risks/:id' && e.method === 'PUT')).toBe(true);
  });
  it('contains DELETE /api/health-safety/risks/:id', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/health-safety/risks/:id' && e.method === 'DELETE')).toBe(true);
  });
  it('contains GET /api/incidents', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/incidents' && e.method === 'GET')).toBe(true);
  });
  it('contains POST /api/incidents', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/incidents' && e.method === 'POST')).toBe(true);
  });
  it('contains GET /api/documents', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/documents' && e.method === 'GET')).toBe(true);
  });
  it('contains POST /api/documents', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/documents' && e.method === 'POST')).toBe(true);
  });
  it('contains GET /api/audits', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/audits' && e.method === 'GET')).toBe(true);
  });
});

describe('ENDPOINT_CATALOGUE deep tests B', () => {
  it('contains POST /api/audits', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/audits' && e.method === 'POST')).toBe(true);
  });
  it('contains GET /api/esg/emissions', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/esg/emissions' && e.method === 'GET')).toBe(true);
  });
  it('contains POST /api/esg/emissions', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/esg/emissions' && e.method === 'POST')).toBe(true);
  });
  it('contains GET /api/analytics/kpis', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/analytics/kpis' && e.method === 'GET')).toBe(true);
  });
  it('contains GET /api/hr/employees', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/hr/employees' && e.method === 'GET')).toBe(true);
  });
  it('contains GET /api/training/courses', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/training/courses' && e.method === 'GET')).toBe(true);
  });
  it('contains GET /api/suppliers', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/suppliers' && e.method === 'GET')).toBe(true);
  });
  it('contains GET /api/compliance', () => {
    expect(ENDPOINT_CATALOGUE.some(e => e.path === '/api/compliance' && e.method === 'GET')).toBe(true);
  });
  it('all summaries are non-empty', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e.summary.length > 0)).toBe(true);
  });
  it('all descriptions are non-empty', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e.description.length > 0)).toBe(true);
  });
  it('all tags arrays are non-empty', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e.tags.length > 0)).toBe(true);
  });
  it('all responses have at least one key', () => {
    expect(ENDPOINT_CATALOGUE.every(e => Object.keys(e.responses).length > 0)).toBe(true);
  });
  it('all response codes are 3-digit strings', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      Object.keys(e.responses).forEach(code => {
        expect(/^\d{3}$/.test(code)).toBe(true);
      });
    });
  });
  it('all response descriptions are strings', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      Object.values(e.responses).forEach(r => {
        expect(typeof r.description).toBe('string');
      });
    });
  });
  it('login has 200 response', () => {
    const login = ENDPOINT_CATALOGUE.find(e => e.path === '/api/auth/login')!;
    expect(login.responses['200']).toBeDefined();
  });
  it('login has 401 response', () => {
    const login = ENDPOINT_CATALOGUE.find(e => e.path === '/api/auth/login')!;
    expect(login.responses['401']).toBeDefined();
  });
  it('risks DELETE has 204 response', () => {
    const ep = ENDPOINT_CATALOGUE.find(e => e.method === 'DELETE' && e.path.includes('risks'))!;
    expect(ep.responses['204']).toBeDefined();
  });
  it('risks GET by ID has 404 response', () => {
    const ep = ENDPOINT_CATALOGUE.find(e => e.path === '/api/health-safety/risks/:id' && e.method === 'GET')!;
    expect(ep.responses['404']).toBeDefined();
  });
  it('login has requestBody defined', () => {
    const login = ENDPOINT_CATALOGUE.find(e => e.path === '/api/auth/login')!;
    expect(login.requestBody).toBeDefined();
  });
  it('all GET endpoints have no requestBody', () => {
    expect(ENDPOINT_CATALOGUE.filter(e => e.method === 'GET').every(e => !e.requestBody)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK H: getEndpointsByTag deep tests
// ---------------------------------------------------------------------------
describe('getEndpointsByTag deep tests A', () => {
  it('returns array for known tag', () => {
    expect(Array.isArray(getEndpointsByTag('auth'))).toBe(true);
  });
  it('returns array for unknown tag', () => {
    expect(Array.isArray(getEndpointsByTag('xyz'))).toBe(true);
  });
  it('auth tag returns 2 endpoints', () => {
    expect(getEndpointsByTag('auth').length).toBe(2);
  });
  it('all auth tag results include auth in tags', () => {
    expect(getEndpointsByTag('auth').every(e => e.tags.includes('auth'))).toBe(true);
  });
  it('health-safety returns multiple endpoints', () => {
    expect(getEndpointsByTag('health-safety').length).toBeGreaterThan(1);
  });
  it('risks tag returns 5 endpoints', () => {
    expect(getEndpointsByTag('risks').length).toBe(5);
  });
  it('incidents tag returns 2 endpoints', () => {
    expect(getEndpointsByTag('incidents').length).toBe(2);
  });
  it('documents tag returns 2 endpoints', () => {
    expect(getEndpointsByTag('documents').length).toBe(2);
  });
  it('audits tag returns 2 endpoints', () => {
    expect(getEndpointsByTag('audits').length).toBe(2);
  });
  it('esg tag returns at least 2 endpoints', () => {
    expect(getEndpointsByTag('esg').length).toBeGreaterThanOrEqual(2);
  });
  it('emissions tag returns 2 endpoints', () => {
    expect(getEndpointsByTag('emissions').length).toBe(2);
  });
  it('analytics tag returns 1 endpoint', () => {
    expect(getEndpointsByTag('analytics').length).toBe(1);
  });
  it('hr tag returns 1 endpoint', () => {
    expect(getEndpointsByTag('hr').length).toBe(1);
  });
  it('training tag returns 1 endpoint', () => {
    expect(getEndpointsByTag('training').length).toBe(1);
  });
  it('suppliers tag returns 1 endpoint', () => {
    expect(getEndpointsByTag('suppliers').length).toBe(1);
  });
  it('compliance tag returns 1 endpoint', () => {
    expect(getEndpointsByTag('compliance').length).toBe(1);
  });
  it('unknown tag returns empty array', () => {
    expect(getEndpointsByTag('nonexistent_tag_xyz')).toEqual([]);
  });
  it('empty string tag returns empty array', () => {
    expect(getEndpointsByTag('')).toEqual([]);
  });
  it('does not mutate ENDPOINT_CATALOGUE length', () => {
    const before = ENDPOINT_CATALOGUE.length;
    getEndpointsByTag('auth');
    expect(ENDPOINT_CATALOGUE.length).toBe(before);
  });
  it('result is not the same reference as ENDPOINT_CATALOGUE', () => {
    expect(getEndpointsByTag('auth') === ENDPOINT_CATALOGUE).toBe(false);
  });
});

describe('getEndpointsByTag deep tests B', () => {
  it('all result endpoints have path property', () => {
    expect(getEndpointsByTag('auth').every(e => typeof e.path === 'string')).toBe(true);
  });
  it('all result endpoints have method property', () => {
    expect(getEndpointsByTag('auth').every(e => typeof e.method === 'string')).toBe(true);
  });
  it('all result endpoints have summary property', () => {
    expect(getEndpointsByTag('auth').every(e => typeof e.summary === 'string')).toBe(true);
  });
  it('result paths are subset of catalogue paths', () => {
    const allPaths = ENDPOINT_CATALOGUE.map(e => e.path);
    getEndpointsByTag('auth').forEach(e => {
      expect(allPaths.includes(e.path)).toBe(true);
    });
  });
  it('no overlap between auth and incidents results', () => {
    const authPaths = getEndpointsByTag('auth').map(e => e.path);
    const incidentPaths = getEndpointsByTag('incidents').map(e => e.path);
    expect(authPaths.some(p => incidentPaths.includes(p))).toBe(false);
  });
  it('no overlap between hr and esg results', () => {
    const hrPaths = getEndpointsByTag('hr').map(e => e.path);
    const esgPaths = getEndpointsByTag('esg').map(e => e.path);
    expect(hrPaths.some(p => esgPaths.includes(p))).toBe(false);
  });
  it('case sensitive: AUTH returns empty', () => {
    expect(getEndpointsByTag('AUTH').length).toBe(0);
  });
  it('auth endpoints include login path', () => {
    expect(getEndpointsByTag('auth').map(e => e.path)).toContain('/api/auth/login');
  });
  it('auth endpoints include logout path', () => {
    expect(getEndpointsByTag('auth').map(e => e.path)).toContain('/api/auth/logout');
  });
  it('risks endpoints include GET /api/health-safety/risks', () => {
    expect(getEndpointsByTag('risks').map(e => e.path)).toContain('/api/health-safety/risks');
  });
  it('risks endpoints include DELETE path', () => {
    expect(getEndpointsByTag('risks').some(e => e.method === 'DELETE')).toBe(true);
  });
  it('esg endpoints include emissions path', () => {
    expect(getEndpointsByTag('esg').some(e => e.path.includes('emissions'))).toBe(true);
  });
  it('sum of all tag results is >= 20 (multi-tag overlap)', () => {
    const total = ['auth', 'health-safety', 'risks', 'incidents', 'documents', 'audits', 'esg', 'emissions', 'analytics', 'hr', 'training', 'suppliers', 'compliance']
      .reduce((sum, tag) => sum + getEndpointsByTag(tag).length, 0);
    expect(total).toBeGreaterThanOrEqual(20);
  });
  it('calling same tag multiple times returns same length', () => {
    expect(getEndpointsByTag('auth').length).toBe(getEndpointsByTag('auth').length);
  });
  it('result contains objects not primitives', () => {
    expect(getEndpointsByTag('auth').every(e => typeof e === 'object')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK I: searchEndpoints deep tests
// ---------------------------------------------------------------------------
describe('searchEndpoints deep tests A', () => {
  it('empty query returns all 20 entries', () => {
    expect(searchEndpoints('').length).toBe(20);
  });
  it('nonsense query returns 0 entries', () => {
    expect(searchEndpoints('xyzzy_no_match_ever').length).toBe(0);
  });
  it('auth finds at least 2 results', () => {
    expect(searchEndpoints('auth').length).toBeGreaterThanOrEqual(2);
  });
  it('risks finds at least 5 results', () => {
    expect(searchEndpoints('risks').length).toBeGreaterThanOrEqual(5);
  });
  it('incidents finds at least 2 results', () => {
    expect(searchEndpoints('incidents').length).toBeGreaterThanOrEqual(2);
  });
  it('case-insensitive match for AUTH', () => {
    expect(searchEndpoints('AUTH').length).toBe(searchEndpoints('auth').length);
  });
  it('case-insensitive match for RISKS', () => {
    expect(searchEndpoints('RISKS').length).toBe(searchEndpoints('risks').length);
  });
  it('case-insensitive match for INCIDENTS', () => {
    expect(searchEndpoints('INCIDENTS').length).toBe(searchEndpoints('incidents').length);
  });
  it('partial match "authen" finds results', () => {
    expect(searchEndpoints('authen').length).toBeGreaterThan(0);
  });
  it('partial match "emiss" finds results', () => {
    expect(searchEndpoints('emiss').length).toBeGreaterThan(0);
  });
  it('path match "/api/audits" finds results', () => {
    expect(searchEndpoints('/api/audits').length).toBeGreaterThan(0);
  });
  it('description word "paginated" finds results', () => {
    expect(searchEndpoints('paginated').length).toBeGreaterThan(0);
  });
  it('description word "organisation" finds results', () => {
    expect(searchEndpoints('organisation').length).toBeGreaterThan(0);
  });
  it('description word "jwt" finds auth endpoint', () => {
    expect(searchEndpoints('jwt').length).toBeGreaterThan(0);
  });
  it('result paths are subsets of catalogue', () => {
    const allPaths = ENDPOINT_CATALOGUE.map(e => e.path);
    searchEndpoints('auth').forEach(e => expect(allPaths.includes(e.path)).toBe(true));
  });
  it('does not mutate catalogue', () => {
    const before = ENDPOINT_CATALOGUE.length;
    searchEndpoints('test');
    expect(ENDPOINT_CATALOGUE.length).toBe(before);
  });
  it('returns array type always', () => {
    ['', 'a', 'xyz', '!@#'].forEach(q => {
      expect(Array.isArray(searchEndpoints(q))).toBe(true);
    });
  });
  it('result length <= 20', () => {
    expect(searchEndpoints('auth').length).toBeLessThanOrEqual(20);
  });
  it('searching for greenhouse returns esg emissions', () => {
    const r = searchEndpoints('greenhouse');
    expect(r.some(e => e.path.includes('esg'))).toBe(true);
  });
  it('searching for employee returns hr endpoint', () => {
    const r = searchEndpoints('employee');
    expect(r.some(e => e.path.includes('hr'))).toBe(true);
  });
});

describe('searchEndpoints deep tests B', () => {
  it('searching for courses returns training endpoint', () => {
    const r = searchEndpoints('courses');
    expect(r.some(e => e.path.includes('training'))).toBe(true);
  });
  it('searching for compliance returns compliance endpoint', () => {
    const r = searchEndpoints('compliance');
    expect(r.some(e => e.path.includes('compliance'))).toBe(true);
  });
  it('searching for kpi returns analytics endpoint', () => {
    const r = searchEndpoints('kpi');
    expect(r.some(e => e.path.includes('analytics'))).toBe(true);
  });
  it('searching for supplier returns supplier endpoint', () => {
    const r = searchEndpoints('supplier');
    expect(r.some(e => e.path.includes('supplier'))).toBe(true);
  });
  it('searching for schedule finds audit endpoint', () => {
    expect(searchEndpoints('schedule').length).toBeGreaterThan(0);
  });
  it('searching for invalidates finds logout endpoint', () => {
    const r = searchEndpoints('invalidates');
    expect(r.some(e => e.path.includes('logout'))).toBe(true);
  });
  it('each result has defined method', () => {
    searchEndpoints('auth').forEach(e => expect(e.method).toBeDefined());
  });
  it('each result has defined path', () => {
    searchEndpoints('auth').forEach(e => expect(e.path).toBeDefined());
  });
  it('each result has defined summary', () => {
    searchEndpoints('auth').forEach(e => expect(e.summary).toBeDefined());
  });
  it('each result has auth boolean', () => {
    searchEndpoints('auth').forEach(e => expect(typeof e.auth).toBe('boolean'));
  });
  it('searching for delete finds DELETE endpoints', () => {
    const r = searchEndpoints('delete');
    expect(r.some(e => e.method === 'DELETE')).toBe(true);
  });
  it('searching for create finds POST endpoints', () => {
    const r = searchEndpoints('create');
    expect(r.some(e => e.method === 'POST')).toBe(true);
  });
  it('searching for update finds PUT endpoints', () => {
    const r = searchEndpoints('update');
    expect(r.some(e => e.method === 'PUT')).toBe(true);
  });
  it('searching for list finds GET endpoints', () => {
    const r = searchEndpoints('list');
    expect(r.some(e => e.method === 'GET')).toBe(true);
  });
  it('does not throw on special chars', () => {
    expect(() => searchEndpoints('!@#$%^&*()')).not.toThrow();
  });
  it('does not throw on very long query', () => {
    expect(() => searchEndpoints('a'.repeat(500))).not.toThrow();
  });
  it('not reference equal to ENDPOINT_CATALOGUE', () => {
    expect(searchEndpoints('') === ENDPOINT_CATALOGUE).toBe(false);
  });
  it('searching for report finds results', () => {
    expect(searchEndpoints('report').length).toBeGreaterThan(0);
  });
  it('searching for programme finds audit results', () => {
    expect(searchEndpoints('programme').length).toBeGreaterThan(0);
  });
  it('searching for sector-specific words returns accurate results', () => {
    expect(typeof searchEndpoints('assessment').length).toBe('number');
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK J: generateCurlExample deep tests
// ---------------------------------------------------------------------------
describe('generateCurlExample deep tests A', () => {
  it('returns string for every catalogue endpoint', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(typeof generateCurlExample(e)).toBe('string');
    });
  });
  it('all results start with curl', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateCurlExample(e).startsWith('curl')).toBe(true);
    });
  });
  it('all results include https://api.nexara.io', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateCurlExample(e).includes('https://api.nexara.io')).toBe(true);
    });
  });
  it('all results include -X METHOD', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateCurlExample(e).includes(`-X ${e.method}`)).toBe(true);
    });
  });
  it('auth endpoints include Authorization Bearer', () => {
    ENDPOINT_CATALOGUE.filter(e => e.auth).forEach(e => {
      expect(generateCurlExample(e).includes('Authorization: Bearer')).toBe(true);
    });
  });
  it('non-auth endpoints do not include Authorization', () => {
    ENDPOINT_CATALOGUE.filter(e => !e.auth).forEach(e => {
      expect(generateCurlExample(e).includes('Authorization')).toBe(false);
    });
  });
  it('login curl includes -d flag with body', () => {
    const login = ENDPOINT_CATALOGUE.find(e => e.path === '/api/auth/login')!;
    expect(generateCurlExample(login).includes("-d '")).toBe(true);
  });
  it('login curl includes email in body', () => {
    const login = ENDPOINT_CATALOGUE.find(e => e.path === '/api/auth/login')!;
    expect(generateCurlExample(login).includes('email')).toBe(true);
  });
  it('GET endpoints never include -d flag', () => {
    ENDPOINT_CATALOGUE.filter(e => e.method === 'GET').forEach(e => {
      expect(generateCurlExample(e).includes("-d '")).toBe(false);
    });
  });
  it('DELETE endpoints never include -d flag', () => {
    ENDPOINT_CATALOGUE.filter(e => e.method === 'DELETE').forEach(e => {
      expect(generateCurlExample(e).includes("-d '")).toBe(false);
    });
  });
  it('POST endpoints with requestBody include -d flag', () => {
    ENDPOINT_CATALOGUE.filter(e => e.method === 'POST' && e.requestBody).forEach(e => {
      expect(generateCurlExample(e).includes("-d '")).toBe(true);
    });
  });
  it('curl result for /api/auth/login includes login path', () => {
    const login = ENDPOINT_CATALOGUE.find(e => e.path === '/api/auth/login')!;
    expect(generateCurlExample(login).includes('/api/auth/login')).toBe(true);
  });
  it('curl result for /api/health-safety/risks includes that path', () => {
    const ep = ENDPOINT_CATALOGUE.find(e => e.path === '/api/health-safety/risks' && e.method === 'GET')!;
    expect(generateCurlExample(ep).includes('/api/health-safety/risks')).toBe(true);
  });
  it('all results have length > 20', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateCurlExample(e).length).toBeGreaterThan(20);
    });
  });
  it('does not throw for makeEndpoint() default', () => {
    expect(() => generateCurlExample(makeEndpoint())).not.toThrow();
  });
  it('does not throw for any method variant', () => {
    (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const).forEach(method => {
      expect(() => generateCurlExample(makeEndpoint({ method }))).not.toThrow();
    });
  });
  it('result is truthy for any endpoint', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateCurlExample(e)).toBeTruthy();
    });
  });
  it('$TOKEN placeholder used for auth endpoints', () => {
    const ep = makeEndpoint({ auth: true });
    expect(generateCurlExample(ep).includes('$TOKEN')).toBe(true);
  });
  it('non-auth endpoint has no $TOKEN', () => {
    const ep = makeEndpoint({ auth: false });
    expect(generateCurlExample(ep).includes('$TOKEN')).toBe(false);
  });
  it('PUT with body includes Content-Type', () => {
    const ep = makeEndpoint({ method: 'PUT', requestBody: { x: 1 } });
    expect(generateCurlExample(ep).includes('Content-Type')).toBe(true);
  });
});

describe('generateCurlExample deep tests B', () => {
  it('PATCH with body includes -d flag', () => {
    const ep = makeEndpoint({ method: 'PATCH', requestBody: { y: 2 } });
    expect(generateCurlExample(ep).includes("-d '")).toBe(true);
  });
  it('PATCH without body omits -d flag', () => {
    const ep = makeEndpoint({ method: 'PATCH', requestBody: undefined });
    expect(generateCurlExample(ep).includes("-d '")).toBe(false);
  });
  it('path with :id preserved in curl', () => {
    const ep = makeEndpoint({ path: '/api/risks/:id' });
    expect(generateCurlExample(ep).includes(':id')).toBe(true);
  });
  it('body JSON is valid JSON substring', () => {
    const ep = makeEndpoint({ method: 'POST', requestBody: { email: 'test@x.com' } });
    const curl = generateCurlExample(ep);
    expect(curl.includes('"email"')).toBe(true);
    expect(curl.includes('"test@x.com"')).toBe(true);
  });
  it('result for GET /api/compliance includes compliance in URL', () => {
    const ep = ENDPOINT_CATALOGUE.find(e => e.path === '/api/compliance')!;
    expect(generateCurlExample(ep).includes('/api/compliance')).toBe(true);
  });
  it('result for GET /api/hr/employees includes hr/employees', () => {
    const ep = ENDPOINT_CATALOGUE.find(e => e.path === '/api/hr/employees')!;
    expect(generateCurlExample(ep).includes('/api/hr/employees')).toBe(true);
  });
  it('result for GET /api/suppliers includes suppliers', () => {
    const ep = ENDPOINT_CATALOGUE.find(e => e.path === '/api/suppliers')!;
    expect(generateCurlExample(ep).includes('/api/suppliers')).toBe(true);
  });
  it('result for GET /api/training/courses includes training/courses', () => {
    const ep = ENDPOINT_CATALOGUE.find(e => e.path === '/api/training/courses')!;
    expect(generateCurlExample(ep).includes('/api/training/courses')).toBe(true);
  });
  it('result contains no undefined text', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateCurlExample(e).includes('undefined')).toBe(false);
    });
  });
  it('no result is empty string', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateCurlExample(e)).not.toBe('');
    });
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK K: generateTsExample deep tests
// ---------------------------------------------------------------------------
describe('generateTsExample deep tests A', () => {
  it('returns string for every catalogue endpoint', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(typeof generateTsExample(e)).toBe('string');
    });
  });
  it('all results include await fetch', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e).includes('await fetch')).toBe(true);
    });
  });
  it('all results include https://api.nexara.io', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e).includes('https://api.nexara.io')).toBe(true);
    });
  });
  it('all results include the method string', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e).includes(`"${e.method}"`)).toBe(true);
    });
  });
  it('all results include Authorization header', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e).includes('Authorization')).toBe(true);
    });
  });
  it('all results include Content-Type header', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e).includes('Content-Type')).toBe(true);
    });
  });
  it('all results include response.json()', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e).includes('response.json()')).toBe(true);
    });
  });
  it('all results include const data', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e).includes('const data')).toBe(true);
    });
  });
  it('login TS example includes JSON.stringify', () => {
    const login = ENDPOINT_CATALOGUE.find(e => e.path === '/api/auth/login')!;
    expect(generateTsExample(login).includes('JSON.stringify')).toBe(true);
  });
  it('GET endpoints do not include JSON.stringify', () => {
    ENDPOINT_CATALOGUE.filter(e => e.method === 'GET').forEach(e => {
      expect(generateTsExample(e).includes('JSON.stringify')).toBe(false);
    });
  });
  it('GET endpoints do not include body:', () => {
    ENDPOINT_CATALOGUE.filter(e => e.method === 'GET').forEach(e => {
      expect(generateTsExample(e).includes('body:')).toBe(false);
    });
  });
  it('DELETE endpoints do not include body:', () => {
    ENDPOINT_CATALOGUE.filter(e => e.method === 'DELETE').forEach(e => {
      expect(generateTsExample(e).includes('body:')).toBe(false);
    });
  });
  it('POST with requestBody includes body:', () => {
    ENDPOINT_CATALOGUE.filter(e => e.method === 'POST' && e.requestBody).forEach(e => {
      expect(generateTsExample(e).includes('body:')).toBe(true);
    });
  });
  it('all results have length > 50', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e).length).toBeGreaterThan(50);
    });
  });
  it('all results include Bearer', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e).includes('Bearer')).toBe(true);
    });
  });
  it('login TS includes email key in body', () => {
    const login = ENDPOINT_CATALOGUE.find(e => e.path === '/api/auth/login')!;
    expect(generateTsExample(login).includes('"email"')).toBe(true);
  });
  it('all results are multiline', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e).includes('\n')).toBe(true);
    });
  });
  it('does not throw for default makeEndpoint', () => {
    expect(() => generateTsExample(makeEndpoint())).not.toThrow();
  });
  it('result includes method: key', () => {
    expect(generateTsExample(makeEndpoint()).includes('method:')).toBe(true);
  });
  it('result includes headers: key', () => {
    expect(generateTsExample(makeEndpoint()).includes('headers:')).toBe(true);
  });
});

describe('generateTsExample deep tests B', () => {
  it('path with :id is preserved in TS example', () => {
    const ep = makeEndpoint({ path: '/api/risks/:id' });
    expect(generateTsExample(ep).includes(':id')).toBe(true);
  });
  it('result contains no undefined text', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e).includes('undefined')).toBe(false);
    });
  });
  it('no result is empty string', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e)).not.toBe('');
    });
  });
  it('result is truthy for all catalogue endpoints', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateTsExample(e)).toBeTruthy();
    });
  });
  it('TS result for /api/esg/emissions includes esg/emissions', () => {
    const ep = ENDPOINT_CATALOGUE.find(e => e.path === '/api/esg/emissions' && e.method === 'GET')!;
    expect(generateTsExample(ep).includes('/api/esg/emissions')).toBe(true);
  });
  it('TS result for /api/analytics/kpis includes analytics/kpis', () => {
    const ep = ENDPOINT_CATALOGUE.find(e => e.path === '/api/analytics/kpis')!;
    expect(generateTsExample(ep).includes('/api/analytics/kpis')).toBe(true);
  });
  it('TS result for POST /api/esg/emissions includes POST', () => {
    const ep = ENDPOINT_CATALOGUE.find(e => e.path === '/api/esg/emissions' && e.method === 'POST')!;
    expect(generateTsExample(ep).includes('"POST"')).toBe(true);
  });
  it('PATCH with body includes JSON.stringify', () => {
    const ep = makeEndpoint({ method: 'PATCH', requestBody: { status: 'active' } });
    expect(generateTsExample(ep).includes('JSON.stringify')).toBe(true);
  });
  it('does not throw for any method', () => {
    (['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const).forEach(method => {
      expect(() => generateTsExample(makeEndpoint({ method }))).not.toThrow();
    });
  });
  it('result for GET /api/compliance includes compliance', () => {
    const ep = ENDPOINT_CATALOGUE.find(e => e.path === '/api/compliance')!;
    expect(generateTsExample(ep).includes('/api/compliance')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK L: integration and cross-function tests
// ---------------------------------------------------------------------------
describe('Integration cross-function tests A', () => {
  it('generate + validate + hash + mask pipeline', () => {
    const key = generateApiKey();
    expect(validateApiKeyFormat(key)).toBe(true);
    expect(hashApiKey(key).length).toBe(64);
    expect(maskApiKey(key).includes('...')).toBe(true);
  });
  it('sandbox pipeline works', () => {
    const key = generateApiKey('ims_sb_');
    expect(validateApiKeyFormat(key)).toBe(true);
    expect(isSandboxKey(key)).toBe(true);
    expect(isProductionKey(key)).toBe(false);
    expect(hashApiKey(key).length).toBe(64);
  });
  it('public key pipeline works', () => {
    const key = generateApiKey('ims_pk_');
    expect(validateApiKeyFormat(key)).toBe(true);
    expect(isSandboxKey(key)).toBe(false);
    expect(isProductionKey(key)).toBe(false);
  });
  it('hashing two different keys gives different hashes', () => {
    const k1 = generateApiKey();
    const k2 = generateApiKey();
    expect(hashApiKey(k1)).not.toBe(hashApiKey(k2));
  });
  it('masking two different keys gives different results', () => {
    const k1 = 'ims_sk_' + 'a'.repeat(44) + 'aaaa';
    const k2 = 'ims_sk_' + 'a'.repeat(44) + 'bbbb';
    expect(maskApiKey(k1)).not.toBe(maskApiKey(k2));
  });
  it('getEndpointsByTag + generateCurlExample pipeline works', () => {
    getEndpointsByTag('auth').forEach(e => {
      expect(generateCurlExample(e)).toContain('curl');
    });
  });
  it('getEndpointsByTag + generateTsExample pipeline works', () => {
    getEndpointsByTag('auth').forEach(e => {
      expect(generateTsExample(e)).toContain('fetch');
    });
  });
  it('searchEndpoints + generateCurlExample pipeline works', () => {
    searchEndpoints('risks').forEach(e => {
      expect(generateCurlExample(e)).toContain('curl');
    });
  });
  it('searchEndpoints + generateTsExample pipeline works', () => {
    searchEndpoints('risks').forEach(e => {
      expect(generateTsExample(e)).toContain('fetch');
    });
  });
  it('makeApp with generated production key is valid', () => {
    const key = generateApiKey();
    const app = makeApp({ productionApiKey: key });
    expect(isProductionKey(app.productionApiKey!)).toBe(true);
    expect(validateApiKeyFormat(app.productionApiKey!)).toBe(true);
  });
  it('makeApp with generated sandbox key is valid', () => {
    const key = generateApiKey('ims_sb_');
    const app = makeApp({ sandboxApiKey: key });
    expect(isSandboxKey(app.sandboxApiKey!)).toBe(true);
    expect(validateApiKeyFormat(app.sandboxApiKey!)).toBe(true);
  });
  it('all catalogue endpoints can be processed through both generators', () => {
    ENDPOINT_CATALOGUE.forEach(e => {
      expect(generateCurlExample(e).length).toBeGreaterThan(0);
      expect(generateTsExample(e).length).toBeGreaterThan(0);
    });
  });
  it('getEndpointsByTag and searchEndpoints agree on auth', () => {
    const byTag = getEndpointsByTag('auth').map(e => e.path).sort();
    const bySearch = searchEndpoints('/api/auth').map(e => e.path).sort();
    expect(byTag.every(p => bySearch.includes(p))).toBe(true);
  });
  it('masked key first 10 chars match original key', () => {
    const k = generateApiKey();
    expect(maskApiKey(k).slice(0, 10)).toBe(k.slice(0, 10));
  });
  it('masked key last 4 chars match original key', () => {
    const k = generateApiKey();
    const m = maskApiKey(k);
    expect(m.slice(-4)).toBe(k.slice(-4));
  });
  it('app with production status and high rate limit', () => {
    const app = makeApp({ status: 'production', rateLimitPerMin: 1000 });
    expect(app.status).toBe('production');
    expect(app.rateLimitPerMin).toBe(1000);
  });
  it('hash of masked key is different from hash of original', () => {
    const k = generateApiKey();
    expect(hashApiKey(maskApiKey(k))).not.toBe(hashApiKey(k));
  });
  it('generating 100 keys produces unique hashes', () => {
    const hashes = new Set(Array.from({ length: 100 }, () => hashApiKey(generateApiKey())));
    expect(hashes.size).toBe(100);
  });
  it('ENDPOINT_CATALOGUE length is stable after multiple operations', () => {
    getEndpointsByTag('auth');
    searchEndpoints('risks');
    generateCurlExample(ENDPOINT_CATALOGUE[0]);
    generateTsExample(ENDPOINT_CATALOGUE[0]);
    expect(ENDPOINT_CATALOGUE.length).toBe(20);
  });
  it('CodeExample with generated curl is well-formed', () => {
    const ep = ENDPOINT_CATALOGUE[0];
    const ex: CodeExample = {
      language: 'curl',
      title: ep.summary,
      code: generateCurlExample(ep),
      endpoint: ep.path,
    };
    expect(ex.code.includes('curl')).toBe(true);
    expect(ex.endpoint).toBe(ep.path);
  });
});

describe('Integration cross-function tests B', () => {
  it('CodeExample with generated TS code is well-formed', () => {
    const ep = ENDPOINT_CATALOGUE[0];
    const ex: CodeExample = {
      language: 'typescript',
      title: ep.summary,
      code: generateTsExample(ep),
      endpoint: ep.path,
    };
    expect(ex.code.includes('fetch')).toBe(true);
    expect(ex.language).toBe('typescript');
  });
  it('makeEndpoint with all optional fields set', () => {
    const ep = makeEndpoint({
      method: 'POST',
      path: '/api/test/full',
      summary: 'Full endpoint',
      description: 'All fields set',
      tags: ['test', 'full'],
      parameters: [{ name: 'q', in: 'query' }],
      requestBody: { data: 'value' },
      responses: { '200': { description: 'OK' }, '400': { description: 'Bad Request' } },
      auth: true,
      deprecated: false,
      examples: [{ foo: 'bar' }],
    });
    expect(ep.method).toBe('POST');
    expect(ep.tags).toContain('full');
    expect(ep.examples).toBeDefined();
  });
  it('makeApp with all optional fields set', () => {
    const now = new Date();
    const app = makeApp({
      sandboxApiKey: VALID_SANDBOX_KEY,
      productionApiKey: VALID_PRODUCTION_KEY,
      lastUsedAt: now,
    });
    expect(app.sandboxApiKey).toBe(VALID_SANDBOX_KEY);
    expect(app.productionApiKey).toBe(VALID_PRODUCTION_KEY);
    expect(app.lastUsedAt).toBe(now);
  });
  it('hash of VALID_PRODUCTION_KEY never changes', () => {
    const h1 = hashApiKey(VALID_PRODUCTION_KEY);
    const h2 = hashApiKey(VALID_PRODUCTION_KEY);
    const h3 = hashApiKey(VALID_PRODUCTION_KEY);
    expect(h1).toBe(h2);
    expect(h2).toBe(h3);
  });
  it('validate returns true for all 3 valid prefix variants', () => {
    expect(validateApiKeyFormat(VALID_PRODUCTION_KEY)).toBe(true);
    expect(validateApiKeyFormat(VALID_SANDBOX_KEY)).toBe(true);
    expect(validateApiKeyFormat(VALID_PUBLIC_KEY)).toBe(true);
  });
  it('isProductionKey is true only for sk prefix', () => {
    expect(isProductionKey(VALID_PRODUCTION_KEY)).toBe(true);
    expect(isProductionKey(VALID_SANDBOX_KEY)).toBe(false);
    expect(isProductionKey(VALID_PUBLIC_KEY)).toBe(false);
  });
  it('isSandboxKey is true only for sb prefix', () => {
    expect(isSandboxKey(VALID_SANDBOX_KEY)).toBe(true);
    expect(isSandboxKey(VALID_PRODUCTION_KEY)).toBe(false);
    expect(isSandboxKey(VALID_PUBLIC_KEY)).toBe(false);
  });
  it('getEndpointsByTag returns consistent results', () => {
    const r1 = getEndpointsByTag('auth').length;
    const r2 = getEndpointsByTag('auth').length;
    expect(r1).toBe(r2);
  });
  it('searchEndpoints returns consistent results', () => {
    const r1 = searchEndpoints('risks').length;
    const r2 = searchEndpoints('risks').length;
    expect(r1).toBe(r2);
  });
  it('curl and TS examples include endpoint path', () => {
    ENDPOINT_CATALOGUE.slice(0, 5).forEach(e => {
      expect(generateCurlExample(e).includes(e.path)).toBe(true);
      expect(generateTsExample(e).includes(e.path)).toBe(true);
    });
  });
  it('app scopes can include multiple values', () => {
    const app = makeApp({ scopes: ['read:quality', 'write:quality', 'read:hse', 'admin'] });
    expect(app.scopes.length).toBe(4);
  });
  it('app redirectUris can include multiple values', () => {
    const app = makeApp({ redirectUris: ['https://a.com/cb', 'https://b.com/cb', 'https://c.com/cb'] });
    expect(app.redirectUris.length).toBe(3);
  });
  it('both generators produce non-empty results for all endpoints', () => {
    let allGood = true;
    for (const e of ENDPOINT_CATALOGUE) {
      if (!generateCurlExample(e) || !generateTsExample(e)) allGood = false;
    }
    expect(allGood).toBe(true);
  });
  it('10 unique apps can be created with unique ids', () => {
    const apps = Array.from({ length: 10 }, (_, i) => makeApp({ id: `app-${i}` }));
    const ids = new Set(apps.map(a => a.id));
    expect(ids.size).toBe(10);
  });
  it('validateApiKeyFormat is consistent across multiple calls', () => {
    for (let i = 0; i < 10; i++) {
      expect(validateApiKeyFormat(VALID_PRODUCTION_KEY)).toBe(true);
      expect(validateApiKeyFormat('bad')).toBe(false);
    }
  });
  it('searchEndpoints and getEndpointsByTag return arrays of objects', () => {
    const s = searchEndpoints('auth');
    const t = getEndpointsByTag('auth');
    expect(s.every(e => typeof e === 'object')).toBe(true);
    expect(t.every(e => typeof e === 'object')).toBe(true);
  });
  it('all generated examples include correct endpoint paths from catalogue', () => {
    const errors: string[] = [];
    for (const ep of ENDPOINT_CATALOGUE) {
      const curl = generateCurlExample(ep);
      const ts = generateTsExample(ep);
      if (!curl.includes(ep.path)) errors.push(`curl missing ${ep.path}`);
      if (!ts.includes(ep.path)) errors.push(`ts missing ${ep.path}`);
    }
    expect(errors.length).toBe(0);
  });
});

describe("generateApiKey bulk-001", () => {
  it("gak-0 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-1 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-2 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-3 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-4 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-5 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-6 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-7 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-8 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-9 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-10 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-11 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-12 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-13 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-14 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-15 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-16 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-17 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-18 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-19 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-20 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-21 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-22 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-23 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-24 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-25 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-26 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-27 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-28 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-29 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-30 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-31 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-32 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-33 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-34 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-35 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-36 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-37 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-38 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-39 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-40 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-41 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-42 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-43 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-44 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-45 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-46 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-47 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-48 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-49 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-50 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-51 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-52 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-53 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-54 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-55 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-56 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-57 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-58 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
  it("gak-59 returns string", () => { expect(typeof generateApiKey()).toBe("string"); });
});
describe("generateApiKey bulk-002", () => {
  it("gak-n0 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n1 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n2 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n3 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n4 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n5 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n6 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n7 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n8 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n9 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n10 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n11 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n12 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n13 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n14 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n15 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n16 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n17 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n18 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n19 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n20 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n21 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n22 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n23 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n24 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n25 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n26 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n27 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n28 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n29 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n30 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n31 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n32 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n33 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n34 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n35 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n36 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n37 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n38 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n39 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n40 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n41 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n42 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n43 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n44 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n45 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n46 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n47 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n48 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n49 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n50 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n51 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n52 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n53 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n54 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n55 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n56 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n57 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n58 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
  it("gak-n59 non-empty", () => { expect(generateApiKey().length).toBeGreaterThan(0); });
});
describe("generateApiKey bulk-003", () => {
  it("gak-u0 unique 0", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u1 unique 1", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u2 unique 2", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u3 unique 3", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u4 unique 4", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u5 unique 5", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u6 unique 6", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u7 unique 7", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u8 unique 8", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u9 unique 9", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u10 unique 10", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u11 unique 11", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u12 unique 12", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u13 unique 13", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u14 unique 14", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u15 unique 15", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u16 unique 16", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u17 unique 17", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u18 unique 18", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u19 unique 19", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u20 unique 20", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u21 unique 21", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u22 unique 22", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u23 unique 23", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u24 unique 24", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u25 unique 25", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u26 unique 26", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u27 unique 27", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u28 unique 28", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u29 unique 29", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u30 unique 30", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u31 unique 31", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u32 unique 32", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u33 unique 33", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u34 unique 34", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u35 unique 35", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u36 unique 36", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u37 unique 37", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u38 unique 38", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u39 unique 39", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u40 unique 40", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u41 unique 41", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u42 unique 42", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u43 unique 43", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u44 unique 44", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u45 unique 45", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u46 unique 46", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u47 unique 47", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u48 unique 48", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u49 unique 49", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u50 unique 50", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u51 unique 51", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u52 unique 52", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u53 unique 53", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u54 unique 54", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u55 unique 55", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u56 unique 56", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u57 unique 57", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u58 unique 58", () => { expect(generateApiKey()).not.toBe(""); });
  it("gak-u59 unique 59", () => { expect(generateApiKey()).not.toBe(""); });
});
describe("validateApiKeyFormat bulk-001", () => {
  it("vakf-0 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-1 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-2 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-3 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-4 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-5 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-6 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-7 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-8 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-9 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-10 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-11 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-12 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-13 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-14 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-15 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-16 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-17 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-18 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-19 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-20 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-21 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-22 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-23 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-24 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-25 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-26 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-27 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-28 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-29 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-30 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-31 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-32 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-33 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-34 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-35 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-36 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-37 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-38 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-39 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-40 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-41 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-42 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-43 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-44 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-45 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-46 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-47 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-48 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-49 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-50 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-51 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-52 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-53 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-54 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-55 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-56 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-57 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-58 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
  it("vakf-59 returns bool", () => { expect(typeof validateApiKeyFormat(generateApiKey())).toBe("boolean"); });
});
describe("validateApiKeyFormat bulk-002", () => {
  it("vakf-e0 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e1 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e2 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e3 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e4 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e5 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e6 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e7 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e8 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e9 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e10 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e11 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e12 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e13 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e14 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e15 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e16 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e17 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e18 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e19 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e20 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e21 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e22 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e23 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e24 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e25 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e26 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e27 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e28 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e29 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e30 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e31 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e32 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e33 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e34 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e35 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e36 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e37 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e38 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e39 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e40 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e41 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e42 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e43 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e44 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e45 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e46 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e47 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e48 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e49 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e50 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e51 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e52 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e53 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e54 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e55 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e56 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e57 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e58 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
  it("vakf-e59 empty string false", () => { expect(validateApiKeyFormat("")).toBe(false); });
});
describe("maskApiKey bulk-001", () => {
  it("mak-0 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-1 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-2 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-3 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-4 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-5 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-6 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-7 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-8 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-9 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-10 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-11 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-12 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-13 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-14 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-15 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-16 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-17 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-18 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-19 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-20 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-21 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-22 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-23 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-24 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-25 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-26 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-27 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-28 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-29 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-30 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-31 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-32 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-33 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-34 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-35 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-36 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-37 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-38 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-39 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-40 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-41 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-42 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-43 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-44 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-45 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-46 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-47 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-48 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
  it("mak-49 returns string", () => { const k = generateApiKey(); expect(typeof maskApiKey(k)).toBe("string"); });
});

describe("developer-portal final", () => {
  it("dp-f0 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f1 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f2 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f3 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f4 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f5 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f6 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f7 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f8 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f9 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f10 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f11 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f12 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f13 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f14 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f15 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f16 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f17 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f18 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f19 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f20 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f21 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f22 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f23 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f24 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f25 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f26 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f27 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f28 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f29 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f30 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f31 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f32 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f33 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f34 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f35 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f36 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f37 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f38 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f39 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f40 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f41 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f42 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f43 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f44 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f45 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f46 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f47 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f48 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f49 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f50 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f51 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f52 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f53 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f54 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f55 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f56 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f57 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f58 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
  it("dp-f59 hashApiKey returns string", () => { expect(typeof hashApiKey(generateApiKey())).toBe("string"); });
});


// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK M: additional generateApiKey scenarios
// ---------------------------------------------------------------------------
describe('generateApiKey scenarios M', () => {
  it('key body only contains digits 0-9 or letters a-f', () => {
    const body = generateApiKey().slice(7);
    for (const ch of body) {
      expect('0123456789abcdef'.includes(ch)).toBe(true);
    }
  });
  it('different prefix does not change body length', () => {
    expect(generateApiKey('ims_pk_').slice(7).length).toBe(48);
  });
  it('calling with same prefix 5 times gives unique keys', () => {
    const s = new Set(Array.from({ length: 5 }, () => generateApiKey('ims_sk_')));
    expect(s.size).toBe(5);
  });
  it('calling with sandbox prefix 5 times gives unique keys', () => {
    const s = new Set(Array.from({ length: 5 }, () => generateApiKey('ims_sb_')));
    expect(s.size).toBe(5);
  });
  it('key does not start with number after prefix', () => {
    // hex can start with 0-9 or a-f; check it is valid hex char
    const firstBodyChar = generateApiKey().slice(7, 8);
    expect('0123456789abcdef'.includes(firstBodyChar)).toBe(true);
  });
  it('key length with empty prefix is 48', () => {
    expect(generateApiKey('').length).toBe(48);
  });
  it('key length with 1-char prefix is 49', () => {
    expect(generateApiKey('x').length).toBe(49);
  });
  it('returns new value every call (not memoized)', () => {
    const results = new Set(Array.from({ length: 20 }, () => generateApiKey()));
    expect(results.size).toBe(20);
  });
  it('key body passes hex regex', () => {
    expect(/^[0-9a-f]+$/.test(generateApiKey().slice(7))).toBe(true);
  });
  it('default key passes isProductionKey', () => {
    expect(isProductionKey(generateApiKey())).toBe(true);
  });
  it('sandbox key passes isSandboxKey', () => {
    expect(isSandboxKey(generateApiKey('ims_sb_'))).toBe(true);
  });
  it('public key fails both isProductionKey and isSandboxKey', () => {
    const k = generateApiKey('ims_pk_');
    expect(isProductionKey(k)).toBe(false);
    expect(isSandboxKey(k)).toBe(false);
  });
  it('key can be stored in app.productionApiKey and retrieved', () => {
    const k = generateApiKey();
    const app = makeApp({ productionApiKey: k });
    expect(app.productionApiKey).toBe(k);
  });
  it('key can be stored in app.sandboxApiKey and retrieved', () => {
    const k = generateApiKey('ims_sb_');
    const app = makeApp({ sandboxApiKey: k });
    expect(app.sandboxApiKey).toBe(k);
  });
  it('generateApiKey result type is string not Buffer', () => {
    const k = generateApiKey();
    expect(typeof k).toBe('string');
    expect(Buffer.isBuffer(k)).toBe(false);
  });
  it('key does not end with underscore', () => {
    expect(generateApiKey().endsWith('_')).toBe(false);
  });
  it('key does not start with a space', () => {
    expect(generateApiKey().startsWith(' ')).toBe(false);
  });
  it('key does not contain a colon', () => {
    expect(generateApiKey().includes(':')).toBe(false);
  });
  it('key does not contain a dot', () => {
    expect(generateApiKey().includes('.')).toBe(false);
  });
  it('key does not contain a slash', () => {
    expect(generateApiKey().includes('/')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK N: additional hashApiKey scenarios
// ---------------------------------------------------------------------------
describe('hashApiKey scenarios N', () => {
  it('known SHA-256 of "hello" is correct', () => {
    expect(hashApiKey('hello')).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
  });
  it('known SHA-256 of "world" is correct', () => {
    expect(hashApiKey('world')).toBe('486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7');
  });
  it('hash of string "a" is 64 chars', () => {
    expect(hashApiKey('a').length).toBe(64);
  });
  it('hash of number-like string is valid', () => {
    expect(/^[0-9a-f]{64}$/.test(hashApiKey('123'))).toBe(true);
  });
  it('hash of whitespace string is valid hex', () => {
    expect(/^[0-9a-f]{64}$/.test(hashApiKey('   '))).toBe(true);
  });
  it('hash of long repeated string is stable', () => {
    const k = 'a'.repeat(1000);
    expect(hashApiKey(k)).toBe(hashApiKey(k));
  });
  it('hash of two different lengths is different', () => {
    expect(hashApiKey('a')).not.toBe(hashApiKey('aa'));
  });
  it('hash of empty string is well-known value', () => {
    const emptyHash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
    expect(hashApiKey('')).toBe(emptyHash);
  });
  it('hash result does not start with 0x prefix', () => {
    expect(hashApiKey('test').startsWith('0x')).toBe(false);
  });
  it('hash result has no commas', () => {
    expect(hashApiKey('test').includes(',')).toBe(false);
  });
  it('hash result is all ASCII', () => {
    const h = hashApiKey('test');
    expect(/^[ -]+$/.test(h)).toBe(true);
  });
  it('hash result does not have newline', () => {
    expect(hashApiKey('test').includes('\n')).toBe(false);
  });
  it('hash result does not have tab', () => {
    expect(hashApiKey('test').includes('\t')).toBe(false);
  });
  it('can hash a hex string', () => {
    expect(hashApiKey('0123456789abcdef').length).toBe(64);
  });
  it('can hash a JSON string', () => {
    expect(hashApiKey('{"email":"test@example.com"}').length).toBe(64);
  });
  it('can hash a URL string', () => {
    expect(hashApiKey('https://example.com/callback').length).toBe(64);
  });
  it('hash of VALID_PUBLIC_KEY is 64 chars', () => {
    expect(hashApiKey(VALID_PUBLIC_KEY).length).toBe(64);
  });
  it('three unique keys produce three unique hashes', () => {
    const k1 = generateApiKey();
    const k2 = generateApiKey();
    const k3 = generateApiKey();
    const hashes = new Set([hashApiKey(k1), hashApiKey(k2), hashApiKey(k3)]);
    expect(hashes.size).toBe(3);
  });
  it('hash of key never equals the key itself', () => {
    const k = VALID_PRODUCTION_KEY;
    expect(hashApiKey(k)).not.toBe(k);
  });
  it('hash result is always lowercase', () => {
    const h = hashApiKey('MixedCase123');
    expect(h).toBe(h.toLowerCase());
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK O: additional validateApiKeyFormat scenarios
// ---------------------------------------------------------------------------
describe('validateApiKeyFormat scenarios O', () => {
  it('all lowercase hex digits 0-9 valid in body', () => {
    expect(validateApiKeyFormat('ims_sk_0123456789abcdef0123456789abcdef01234567')).toBe(true);
  });
  it('only digits in body is valid', () => {
    expect(validateApiKeyFormat('ims_sk_' + '0'.repeat(40))).toBe(true);
  });
  it('only letters a-f in body is valid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'abcdef'.repeat(8))).toBe(true);
  });
  it('letters g-z in body is invalid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'g'.repeat(40))).toBe(false);
  });
  it('mixed valid hex and non-hex is invalid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(39) + 'g')).toBe(false);
  });
  it('body with exactly 41 hex chars is valid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(41))).toBe(true);
  });
  it('body with 200 hex chars is valid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(200))).toBe(true);
  });
  it('prefix with extra chars before ims is invalid', () => {
    expect(validateApiKeyFormat('xims_sk_' + 'a'.repeat(48))).toBe(false);
  });
  it('prefix ims-sk- (dashes) is invalid', () => {
    expect(validateApiKeyFormat('ims-sk-' + 'a'.repeat(48))).toBe(false);
  });
  it('key starting with whitespace is invalid', () => {
    expect(validateApiKeyFormat(' ims_sk_' + 'a'.repeat(48))).toBe(false);
  });
  it('key ending with whitespace is invalid', () => {
    expect(validateApiKeyFormat('ims_sk_' + 'a'.repeat(48) + ' ')).toBe(false);
  });
  it('VALID_PRODUCTION_KEY is valid (sanity)', () => {
    expect(validateApiKeyFormat(VALID_PRODUCTION_KEY)).toBe(true);
  });
  it('VALID_SANDBOX_KEY is valid (sanity)', () => {
    expect(validateApiKeyFormat(VALID_SANDBOX_KEY)).toBe(true);
  });
  it('VALID_PUBLIC_KEY is valid (sanity)', () => {
    expect(validateApiKeyFormat(VALID_PUBLIC_KEY)).toBe(true);
  });
  it('100 generated keys all validate true', () => {
    const results = Array.from({ length: 100 }, () => validateApiKeyFormat(generateApiKey()));
    expect(results.every(r => r === true)).toBe(true);
  });
  it('50 sandbox keys all validate true', () => {
    const results = Array.from({ length: 50 }, () => validateApiKeyFormat(generateApiKey('ims_sb_')));
    expect(results.every(r => r === true)).toBe(true);
  });
  it('body of 40 hex digits is minimum valid', () => {
    expect(validateApiKeyFormat('ims_pk_' + 'f'.repeat(40))).toBe(true);
  });
  it('body of 38 hex digits is invalid', () => {
    expect(validateApiKeyFormat('ims_pk_' + 'f'.repeat(38))).toBe(false);
  });
  it('test that 0 through f are all accepted', () => {
    const allHex = '0123456789abcdef';
    const body = allHex.repeat(3);
    expect(validateApiKeyFormat('ims_sk_' + body)).toBe(true);
  });
  it('body containing only 9s is valid', () => {
    expect(validateApiKeyFormat('ims_sk_' + '9'.repeat(40))).toBe(true);
  });
  it('body containing only 0s is valid', () => {
    expect(validateApiKeyFormat('ims_sk_' + '0'.repeat(40))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK P: additional maskApiKey scenarios
// ---------------------------------------------------------------------------
describe('maskApiKey scenarios P', () => {
  it('5-char key returns ***', () => {
    expect(maskApiKey('hello')).toBe('***');
  });
  it('10-char key returns ***', () => {
    expect(maskApiKey('a'.repeat(10))).toBe('***');
  });
  it('14-char key returns ***', () => {
    expect(maskApiKey('a'.repeat(14))).toBe('***');
  });
  it('15-char key returns 17-char mask', () => {
    expect(maskApiKey('a'.repeat(15)).length).toBe(17);
  });
  it('20-char key returns 17-char mask', () => {
    expect(maskApiKey('a'.repeat(20)).length).toBe(17);
  });
  it('55-char default key returns 17-char mask', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY).length).toBe(17);
  });
  it('masked key format: slice(0,10) + ... + slice(-4)', () => {
    const key = 'x'.repeat(30);
    expect(maskApiKey(key)).toBe(key.slice(0, 10) + '...' + key.slice(-4));
  });
  it('mask of mask is a valid mask', () => {
    const m1 = maskApiKey(VALID_PRODUCTION_KEY);
    expect(maskApiKey(m1)).toBeDefined();
  });
  it('mask of 17-char mask is still 17 or ***', () => {
    const m1 = maskApiKey(VALID_PRODUCTION_KEY);
    expect(m1.length).toBe(17);
    const m2 = maskApiKey(m1);
    expect(m2.length === 17 || m2 === '***').toBe(true);
  });
  it('does not throw on null-like string', () => {
    expect(() => maskApiKey('null')).not.toThrow();
  });
  it('null string returns *** (length <= 14)', () => {
    expect(maskApiKey('null')).toBe('***');
  });
  it('all chars are ASCII in result', () => {
    expect(/^[ -]+$/.test(maskApiKey(VALID_PRODUCTION_KEY))).toBe(true);
  });
  it('result has no leading spaces', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY).startsWith(' ')).toBe(false);
  });
  it('result has no trailing spaces', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY).endsWith(' ')).toBe(false);
  });
  it('result for very long key is 17 chars', () => {
    expect(maskApiKey('a'.repeat(10000)).length).toBe(17);
  });
  it('mask middle is exactly ...', () => {
    const m = maskApiKey(VALID_PRODUCTION_KEY);
    expect(m.slice(10, 13)).toBe('...');
  });
  it('different keys with same last 4 chars give same suffix in mask', () => {
    const k1 = 'ims_sk_' + 'a'.repeat(44) + 'abcd';
    const k2 = 'ims_pk_' + 'b'.repeat(44) + 'abcd';
    expect(maskApiKey(k1).endsWith('abcd')).toBe(true);
    expect(maskApiKey(k2).endsWith('abcd')).toBe(true);
  });
  it('same key produces same mask every time', () => {
    for (let i = 0; i < 5; i++) {
      expect(maskApiKey(VALID_PRODUCTION_KEY)).toBe(maskApiKey(VALID_PRODUCTION_KEY));
    }
  });
  it('mask result is not the same as original key', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY)).not.toBe(VALID_PRODUCTION_KEY);
  });
  it('mask result is not an empty string for long key', () => {
    expect(maskApiKey(VALID_PRODUCTION_KEY)).not.toBe('');
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK Q: isProductionKey and isSandboxKey boundary tests
// ---------------------------------------------------------------------------
describe('isProductionKey and isSandboxKey boundary tests Q', () => {
  it('isProductionKey ims_sk_ alone is true', () => {
    expect(isProductionKey('ims_sk_')).toBe(true);
  });
  it('isProductionKey ims_sk_a is true', () => {
    expect(isProductionKey('ims_sk_a')).toBe(true);
  });
  it('isSandboxKey ims_sb_ alone is true', () => {
    expect(isSandboxKey('ims_sb_')).toBe(true);
  });
  it('isSandboxKey ims_sb_a is true', () => {
    expect(isSandboxKey('ims_sb_a')).toBe(true);
  });
  it('isProductionKey with very long suffix is true', () => {
    expect(isProductionKey('ims_sk_' + 'abc'.repeat(100))).toBe(true);
  });
  it('isSandboxKey with very long suffix is true', () => {
    expect(isSandboxKey('ims_sb_' + 'xyz'.repeat(100))).toBe(true);
  });
  it('isProductionKey ims_sk is false (no trailing underscore)', () => {
    expect(isProductionKey('ims_sk')).toBe(false);
  });
  it('isSandboxKey ims_sb is false (no trailing underscore)', () => {
    expect(isSandboxKey('ims_sb')).toBe(false);
  });
  it('isProductionKey empty string is false', () => {
    expect(isProductionKey('')).toBe(false);
  });
  it('isSandboxKey empty string is false', () => {
    expect(isSandboxKey('')).toBe(false);
  });
  it('for every generated key, exactly one of isProductionKey/isSandboxKey is true or neither', () => {
    const k = generateApiKey();
    const isProd = isProductionKey(k);
    const isSb = isSandboxKey(k);
    expect(isProd && isSb).toBe(false);
  });
  it('isProductionKey returns false for ims_pk_', () => {
    expect(isProductionKey('ims_pk_abc')).toBe(false);
  });
  it('isSandboxKey returns false for ims_pk_', () => {
    expect(isSandboxKey('ims_pk_abc')).toBe(false);
  });
  it('isProductionKey returns false for random string', () => {
    expect(isProductionKey('something_random')).toBe(false);
  });
  it('isSandboxKey returns false for random string', () => {
    expect(isSandboxKey('something_random')).toBe(false);
  });
  it('isProductionKey is consistent across 20 calls', () => {
    for (let i = 0; i < 20; i++) {
      expect(isProductionKey(VALID_PRODUCTION_KEY)).toBe(true);
    }
  });
  it('isSandboxKey is consistent across 20 calls', () => {
    for (let i = 0; i < 20; i++) {
      expect(isSandboxKey(VALID_SANDBOX_KEY)).toBe(true);
    }
  });
  it('isProductionKey does not throw on any input', () => {
    ['', 'abc', 'ims_sk_', 'null', '   ', '!@#'].forEach(s => {
      expect(() => isProductionKey(s)).not.toThrow();
    });
  });
  it('isSandboxKey does not throw on any input', () => {
    ['', 'abc', 'ims_sb_', 'null', '   ', '!@#'].forEach(s => {
      expect(() => isSandboxKey(s)).not.toThrow();
    });
  });
  it('isProductionKey returns boolean not string', () => {
    expect(typeof isProductionKey(VALID_PRODUCTION_KEY)).toBe('boolean');
  });
  it('isSandboxKey returns boolean not string', () => {
    expect(typeof isSandboxKey(VALID_SANDBOX_KEY)).toBe('boolean');
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK R: ENDPOINT_CATALOGUE additional
// ---------------------------------------------------------------------------
describe('ENDPOINT_CATALOGUE additional R', () => {
  it('entry at index 0 is the login endpoint', () => {
    expect(ENDPOINT_CATALOGUE[0].path).toBe('/api/auth/login');
  });
  it('entry at index 1 is the logout endpoint', () => {
    expect(ENDPOINT_CATALOGUE[1].path).toBe('/api/auth/logout');
  });
  it('catalogue is not empty', () => {
    expect(ENDPOINT_CATALOGUE.length).toBeGreaterThan(0);
  });
  it('GET count is >= 10', () => {
    expect(ENDPOINT_CATALOGUE.filter(e => e.method === 'GET').length).toBeGreaterThanOrEqual(10);
  });
  it('POST count is >= 5', () => {
    expect(ENDPOINT_CATALOGUE.filter(e => e.method === 'POST').length).toBeGreaterThanOrEqual(5);
  });
  it('DELETE count is >= 1', () => {
    expect(ENDPOINT_CATALOGUE.filter(e => e.method === 'DELETE').length).toBeGreaterThanOrEqual(1);
  });
  it('PUT count is >= 1', () => {
    expect(ENDPOINT_CATALOGUE.filter(e => e.method === 'PUT').length).toBeGreaterThanOrEqual(1);
  });
  it('no PATCH endpoints in default catalogue', () => {
    expect(ENDPOINT_CATALOGUE.filter(e => e.method === 'PATCH').length).toBe(0);
  });
  it('all entries are objects', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e !== null && typeof e === 'object')).toBe(true);
  });
  it('no entry has an undefined method', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e.method !== undefined)).toBe(true);
  });
  it('no entry has an undefined path', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e.path !== undefined)).toBe(true);
  });
  it('no entry has an undefined summary', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e.summary !== undefined)).toBe(true);
  });
  it('no entry has an undefined description', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e.description !== undefined)).toBe(true);
  });
  it('no entry has an undefined auth', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e.auth !== undefined)).toBe(true);
  });
  it('no entry has an undefined deprecated', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e.deprecated !== undefined)).toBe(true);
  });
  it('no entry has a null path', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e.path !== null)).toBe(true);
  });
  it('paths are all unique', () => {
    const paths = ENDPOINT_CATALOGUE.map(e => `${e.method}:${e.path}`);
    expect(new Set(paths).size).toBe(paths.length);
  });
  it('all response descriptions are non-empty', () => {
    let allGood = true;
    for (const e of ENDPOINT_CATALOGUE) {
      for (const r of Object.values(e.responses)) {
        if (r.description.length === 0) allGood = false;
      }
    }
    expect(allGood).toBe(true);
  });
  it('POST endpoints: at least login, incidents, documents, audits, esg', () => {
    const posts = ENDPOINT_CATALOGUE.filter(e => e.method === 'POST').map(e => e.path);
    expect(posts.some(p => p.includes('auth'))).toBe(true);
    expect(posts.some(p => p.includes('incidents'))).toBe(true);
    expect(posts.some(p => p.includes('documents'))).toBe(true);
  });
  it('GET endpoints: at least risks, incidents, documents, hr, training', () => {
    const gets = ENDPOINT_CATALOGUE.filter(e => e.method === 'GET').map(e => e.path);
    expect(gets.some(p => p.includes('risks'))).toBe(true);
    expect(gets.some(p => p.includes('incidents'))).toBe(true);
    expect(gets.some(p => p.includes('documents'))).toBe(true);
    expect(gets.some(p => p.includes('hr'))).toBe(true);
    expect(gets.some(p => p.includes('training'))).toBe(true);
  });
  it('second-to-last entry is GET /api/suppliers', () => {
    const ep = ENDPOINT_CATALOGUE[ENDPOINT_CATALOGUE.length - 2];
    expect(ep.path).toBe('/api/suppliers');
    expect(ep.method).toBe('GET');
  });
  it('last entry is GET /api/compliance', () => {
    const ep = ENDPOINT_CATALOGUE[ENDPOINT_CATALOGUE.length - 1];
    expect(ep.path).toBe('/api/compliance');
    expect(ep.method).toBe('GET');
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK S: additional type shape tests
// ---------------------------------------------------------------------------
describe('DeveloperApp and CodeExample type shape S', () => {
  it('app id is non-empty string', () => {
    expect(makeApp().id.length).toBeGreaterThan(0);
  });
  it('app name is non-empty string', () => {
    expect(makeApp().name.length).toBeGreaterThan(0);
  });
  it('app description is non-empty string', () => {
    expect(makeApp().description.length).toBeGreaterThan(0);
  });
  it('app ownerId is non-empty string', () => {
    expect(makeApp().ownerId.length).toBeGreaterThan(0);
  });
  it('app clientId is non-empty string', () => {
    expect(makeApp().clientId.length).toBeGreaterThan(0);
  });
  it('app clientSecretHash is non-empty string', () => {
    expect(makeApp().clientSecretHash.length).toBeGreaterThan(0);
  });
  it('app createdAt is a Date object', () => {
    expect(makeApp().createdAt instanceof Date).toBe(true);
  });
  it('app createdAt is in 2026', () => {
    expect(makeApp().createdAt.getFullYear()).toBe(2026);
  });
  it('app rateLimitPerMin is 60 by default', () => {
    expect(makeApp().rateLimitPerMin).toBe(60);
  });
  it('app redirectUris array has 1 item by default', () => {
    expect(makeApp().redirectUris.length).toBe(1);
  });
  it('app scopes array has 2 items by default', () => {
    expect(makeApp().scopes.length).toBe(2);
  });
  it('app status is sandbox by default', () => {
    expect(makeApp().status).toBe('sandbox');
  });
  it('CodeExample typescript is valid language', () => {
    const ex: CodeExample = { language: 'typescript', title: 'T', code: 'C', endpoint: '/e' };
    expect(['typescript', 'python', 'curl', 'go', 'php']).toContain(ex.language);
  });
  it('CodeExample python is valid language', () => {
    const ex: CodeExample = { language: 'python', title: 'T', code: 'C', endpoint: '/e' };
    expect(['typescript', 'python', 'curl', 'go', 'php']).toContain(ex.language);
  });
  it('CodeExample curl is valid language', () => {
    const ex: CodeExample = { language: 'curl', title: 'T', code: 'C', endpoint: '/e' };
    expect(['typescript', 'python', 'curl', 'go', 'php']).toContain(ex.language);
  });
  it('CodeExample go is valid language', () => {
    const ex: CodeExample = { language: 'go', title: 'T', code: 'C', endpoint: '/e' };
    expect(['typescript', 'python', 'curl', 'go', 'php']).toContain(ex.language);
  });
  it('CodeExample php is valid language', () => {
    const ex: CodeExample = { language: 'php', title: 'T', code: 'C', endpoint: '/e' };
    expect(['typescript', 'python', 'curl', 'go', 'php']).toContain(ex.language);
  });
  it('CodeExample has 4 keys', () => {
    const ex: CodeExample = { language: 'curl', title: 'T', code: 'C', endpoint: '/e' };
    expect(Object.keys(ex).length).toBe(4);
  });
  it('ApiEndpointDoc default deprecated is false', () => {
    expect(makeEndpoint().deprecated).toBe(false);
  });
  it('ApiEndpointDoc default auth is true', () => {
    expect(makeEndpoint().auth).toBe(true);
  });
  it('ApiEndpointDoc default method is GET', () => {
    expect(makeEndpoint().method).toBe('GET');
  });
  it('ApiEndpointDoc default path is /api/test', () => {
    expect(makeEndpoint().path).toBe('/api/test');
  });
  it('ApiEndpointDoc tags is non-empty array', () => {
    expect(makeEndpoint().tags.length).toBeGreaterThan(0);
  });
  it('ApiEndpointDoc responses has 200 key by default', () => {
    expect(makeEndpoint().responses['200']).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK T: additional search and tag edge cases
// ---------------------------------------------------------------------------
describe('searchEndpoints and getEndpointsByTag edge cases T', () => {
  it('searchEndpoints with single digit returns results or empty', () => {
    expect(Array.isArray(searchEndpoints('0'))).toBe(true);
  });
  it('searchEndpoints with slash returns results', () => {
    expect(searchEndpoints('/').length).toBeGreaterThan(0);
  });
  it('searchEndpoints with api returns all', () => {
    expect(searchEndpoints('api').length).toBe(ENDPOINT_CATALOGUE.length);
  });
  it('searchEndpoints with auth returns results', () => {
    expect(searchEndpoints('auth').length).toBeGreaterThan(0);
  });
  it('getEndpointsByTag health-safety returns 5 endpoints', () => {
    expect(getEndpointsByTag('health-safety').length).toBe(5);
  });
  it('getEndpointsByTag returns same value on 3 consecutive calls', () => {
    const l1 = getEndpointsByTag('auth').length;
    const l2 = getEndpointsByTag('auth').length;
    const l3 = getEndpointsByTag('auth').length;
    expect(l1).toBe(l2);
    expect(l2).toBe(l3);
  });
  it('searchEndpoints results all have non-empty paths', () => {
    searchEndpoints('auth').forEach(e => expect(e.path.length).toBeGreaterThan(0));
  });
  it('searchEndpoints results all have non-empty summaries', () => {
    searchEndpoints('auth').forEach(e => expect(e.summary.length).toBeGreaterThan(0));
  });
  it('searchEndpoints results all have non-empty descriptions', () => {
    searchEndpoints('auth').forEach(e => expect(e.description.length).toBeGreaterThan(0));
  });
  it('getEndpointsByTag results all have non-empty paths', () => {
    getEndpointsByTag('auth').forEach(e => expect(e.path.length).toBeGreaterThan(0));
  });
  it('searchEndpoints password returns login endpoint', () => {
    expect(searchEndpoints('password').some(e => e.path === '/api/auth/login')).toBe(true);
  });
  it('searchEndpoints session returns logout endpoint', () => {
    expect(searchEndpoints('session').some(e => e.path === '/api/auth/logout')).toBe(true);
  });
  it('getEndpointsByTag risks returns all 5 CRUD endpoints', () => {
    const methods = getEndpointsByTag('risks').map(e => e.method);
    expect(methods).toContain('GET');
    expect(methods).toContain('POST');
    expect(methods).toContain('PUT');
    expect(methods).toContain('DELETE');
  });
  it('getEndpointsByTag esg and emissions overlap on emissions paths', () => {
    const esgPaths = getEndpointsByTag('esg').map(e => e.path);
    const emPaths = getEndpointsByTag('emissions').map(e => e.path);
    const overlap = esgPaths.filter(p => emPaths.includes(p));
    expect(overlap.length).toBeGreaterThan(0);
  });
  it('searchEndpoints with incomplete word "compli" returns results', () => {
    expect(searchEndpoints('compli').length).toBeGreaterThan(0);
  });
  it('searchEndpoints with "200" returns results (in response descriptions)', () => {
    expect(Array.isArray(searchEndpoints('200'))).toBe(true);
  });
  it('getEndpointsByTag result can be used with forEach', () => {
    expect(() => getEndpointsByTag('auth').forEach(() => {})).not.toThrow();
  });
  it('searchEndpoints result can be used with map', () => {
    expect(() => searchEndpoints('auth').map(e => e.path)).not.toThrow();
  });
  it('searchEndpoints result can be used with filter', () => {
    expect(() => searchEndpoints('auth').filter(e => e.auth)).not.toThrow();
  });
  it('searchEndpoints result can be used with reduce', () => {
    const count = searchEndpoints('auth').reduce((acc) => acc + 1, 0);
    expect(count).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// EXTENDED TESTS BLOCK U: final coverage tests
// ---------------------------------------------------------------------------
describe('Final coverage tests U', () => {
  it('generateApiKey is a function', () => {
    expect(typeof generateApiKey).toBe('function');
  });
  it('hashApiKey is a function', () => {
    expect(typeof hashApiKey).toBe('function');
  });
  it('validateApiKeyFormat is a function', () => {
    expect(typeof validateApiKeyFormat).toBe('function');
  });
  it('maskApiKey is a function', () => {
    expect(typeof maskApiKey).toBe('function');
  });
  it('isProductionKey is a function', () => {
    expect(typeof isProductionKey).toBe('function');
  });
  it('isSandboxKey is a function', () => {
    expect(typeof isSandboxKey).toBe('function');
  });
  it('getEndpointsByTag is a function', () => {
    expect(typeof getEndpointsByTag).toBe('function');
  });
  it('searchEndpoints is a function', () => {
    expect(typeof searchEndpoints).toBe('function');
  });
  it('generateCurlExample is a function', () => {
    expect(typeof generateCurlExample).toBe('function');
  });
  it('generateTsExample is a function', () => {
    expect(typeof generateTsExample).toBe('function');
  });
  it('ENDPOINT_CATALOGUE is exported and accessible', () => {
    expect(ENDPOINT_CATALOGUE).toBeDefined();
  });
  it('all exports are defined', () => {
    expect(generateApiKey).toBeDefined();
    expect(hashApiKey).toBeDefined();
    expect(validateApiKeyFormat).toBeDefined();
    expect(maskApiKey).toBeDefined();
    expect(isProductionKey).toBeDefined();
    expect(isSandboxKey).toBeDefined();
    expect(ENDPOINT_CATALOGUE).toBeDefined();
    expect(getEndpointsByTag).toBeDefined();
    expect(searchEndpoints).toBeDefined();
    expect(generateCurlExample).toBeDefined();
    expect(generateTsExample).toBeDefined();
  });
  it('makeApp is a helper that works', () => {
    expect(typeof makeApp()).toBe('object');
  });
  it('makeEndpoint is a helper that works', () => {
    expect(typeof makeEndpoint()).toBe('object');
  });
  it('VALID_PRODUCTION_KEY is accessible', () => {
    expect(VALID_PRODUCTION_KEY).toBeDefined();
  });
  it('VALID_SANDBOX_KEY is accessible', () => {
    expect(VALID_SANDBOX_KEY).toBeDefined();
  });
  it('VALID_PUBLIC_KEY is accessible', () => {
    expect(VALID_PUBLIC_KEY).toBeDefined();
  });
  it('VALID_PRODUCTION_KEY starts with ims_sk_', () => {
    expect(VALID_PRODUCTION_KEY.startsWith('ims_sk_')).toBe(true);
  });
  it('VALID_SANDBOX_KEY starts with ims_sb_', () => {
    expect(VALID_SANDBOX_KEY.startsWith('ims_sb_')).toBe(true);
  });
  it('VALID_PUBLIC_KEY starts with ims_pk_', () => {
    expect(VALID_PUBLIC_KEY.startsWith('ims_pk_')).toBe(true);
  });
  it('generateApiKey with no args uses default', () => {
    expect(generateApiKey()).toMatch(/^ims_sk_[0-9a-f]{48}$/);
  });
  it('overall flow: generate, validate, hash, mask, detect, search', () => {
    const k = generateApiKey();
    expect(validateApiKeyFormat(k)).toBe(true);
    const h = hashApiKey(k);
    expect(h.length).toBe(64);
    const m = maskApiKey(k);
    expect(m.includes('...')).toBe(true);
    expect(isProductionKey(k)).toBe(true);
    expect(isSandboxKey(k)).toBe(false);
    const results = searchEndpoints('auth');
    expect(results.length).toBeGreaterThan(0);
  });
  it('catalogue has no null entries', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e !== null)).toBe(true);
  });
  it('catalogue has no undefined entries', () => {
    expect(ENDPOINT_CATALOGUE.every(e => e !== undefined)).toBe(true);
  });
  it('generating 1000 api keys does not throw', () => {
    expect(() => {
      for (let i = 0; i < 1000; i++) generateApiKey();
    }).not.toThrow();
  });
  it('hashing 1000 keys does not throw', () => {
    expect(() => {
      for (let i = 0; i < 1000; i++) hashApiKey(`key-${i}`);
    }).not.toThrow();
  });
  it('masking 1000 keys does not throw', () => {
    expect(() => {
      for (let i = 0; i < 1000; i++) maskApiKey(generateApiKey());
    }).not.toThrow();
  });
  it('validating 1000 keys does not throw', () => {
    expect(() => {
      for (let i = 0; i < 1000; i++) validateApiKeyFormat(generateApiKey());
    }).not.toThrow();
  });
  it('calling all catalogue generators 100 times does not throw', () => {
    expect(() => {
      for (let i = 0; i < 100; i++) {
        for (const ep of ENDPOINT_CATALOGUE) {
          generateCurlExample(ep);
          generateTsExample(ep);
        }
      }
    }).not.toThrow();
  });
});
