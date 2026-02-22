/**
 * Message file key-parity tests.
 *
 * Guards against translation regressions where a key is added to en.json
 * but forgotten in de.json / fr.json / es.json (or vice-versa).
 */

import enRaw from '../messages/en.json';
import deRaw from '../messages/de.json';
import frRaw from '../messages/fr.json';
import esRaw from '../messages/es.json';

// ── Helpers ───────────────────────────────────────────────────────────────────

type NestedObject = Record<string, unknown>;

function flattenKeys(obj: NestedObject, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null
      ? flattenKeys(v as NestedObject, prefix ? `${prefix}.${k}` : k)
      : [prefix ? `${prefix}.${k}` : k]
  );
}

const en = flattenKeys(enRaw as unknown as NestedObject);
const de = flattenKeys(deRaw as unknown as NestedObject);
const fr = flattenKeys(frRaw as unknown as NestedObject);
const es = flattenKeys(esRaw as unknown as NestedObject);

const enSet = new Set(en);
const deSet = new Set(de);
const frSet = new Set(fr);
const esSet = new Set(es);

// ── Key count ─────────────────────────────────────────────────────────────────

describe('message file key counts', () => {
  it('en.json has at least 100 keys', () => {
    expect(en.length).toBeGreaterThanOrEqual(100);
  });

  it('all locales have the same number of keys as en', () => {
    expect(de.length).toBe(en.length);
    expect(fr.length).toBe(en.length);
    expect(es.length).toBe(en.length);
  });
});

// ── Key parity: EN ↔ each locale ─────────────────────────────────────────────

describe('de.json key parity with en.json', () => {
  it('has no keys missing from en', () => {
    const missing = en.filter(k => !deSet.has(k));
    expect(missing).toHaveLength(0);
  });

  it('has no extra keys not in en', () => {
    const extra = de.filter(k => !enSet.has(k));
    expect(extra).toHaveLength(0);
  });
});

describe('fr.json key parity with en.json', () => {
  it('has no keys missing from en', () => {
    const missing = en.filter(k => !frSet.has(k));
    expect(missing).toHaveLength(0);
  });

  it('has no extra keys not in en', () => {
    const extra = fr.filter(k => !enSet.has(k));
    expect(extra).toHaveLength(0);
  });
});

describe('es.json key parity with en.json', () => {
  it('has no keys missing from en', () => {
    const missing = en.filter(k => !esSet.has(k));
    expect(missing).toHaveLength(0);
  });

  it('has no extra keys not in en', () => {
    const extra = es.filter(k => !enSet.has(k));
    expect(extra).toHaveLength(0);
  });
});

// ── Value type consistency ────────────────────────────────────────────────────

describe('message values are strings in all locales', () => {
  function assertAllStrings(obj: NestedObject, locale: string) {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof v === 'object' && v !== null) {
        assertAllStrings(v as NestedObject, locale);
      } else {
        expect(typeof v).toBe('string');
      }
    }
  }

  it('en.json values are all strings', () => {
    assertAllStrings(enRaw as unknown as NestedObject, 'en');
  });

  it('de.json values are all strings', () => {
    assertAllStrings(deRaw as unknown as NestedObject, 'de');
  });

  it('fr.json values are all strings', () => {
    assertAllStrings(frRaw as unknown as NestedObject, 'fr');
  });

  it('es.json values are all strings', () => {
    assertAllStrings(esRaw as unknown as NestedObject, 'es');
  });
});

// ── Non-empty values ──────────────────────────────────────────────────────────

describe('message values are non-empty', () => {
  function checkNonEmpty(obj: NestedObject, locale: string, path = '') {
    for (const [k, v] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${k}` : k;
      if (typeof v === 'object' && v !== null) {
        checkNonEmpty(v as NestedObject, locale, fullPath);
      } else {
        expect(typeof v === 'string' && v.length > 0).toBe(true);
      }
    }
  }

  it('en.json has no empty string values', () => {
    checkNonEmpty(enRaw as unknown as NestedObject, 'en');
  });

  it('de.json has no empty string values', () => {
    checkNonEmpty(deRaw as unknown as NestedObject, 'de');
  });

  it('fr.json has no empty string values', () => {
    checkNonEmpty(frRaw as unknown as NestedObject, 'fr');
  });

  it('es.json has no empty string values', () => {
    checkNonEmpty(esRaw as unknown as NestedObject, 'es');
  });
});

// ── Common keys spot-check ────────────────────────────────────────────────────

describe('common translation keys exist in all locales', () => {
  const REQUIRED_KEYS = [
    'common.save',
    'common.cancel',
    'common.delete',
    'common.edit',
    'common.create',
    'common.search',
    'common.loading',
    'common.close',
    'common.settings',
    'common.logout',
    'common.login',
    'common.email',
    'common.password',
  ];

  for (const key of REQUIRED_KEYS) {
    it(`"${key}" exists in all locales`, () => {
      expect(enSet.has(key)).toBe(true);
      expect(deSet.has(key)).toBe(true);
      expect(frSet.has(key)).toBe(true);
      expect(esSet.has(key)).toBe(true);
    });
  }
});

// ─── Additional coverage ─────────────────────────────────────────────────────

describe('i18n — additional coverage', () => {
  it('flattenKeys produces only leaf-level keys (no intermediate objects)', () => {
    // All keys should refer to string values, not nested objects
    for (const key of en) {
      // A key like "common" alone would only appear if common were a string,
      // but since it is an object, flattenKeys should never emit it bare.
      expect(key.split('.').length).toBeGreaterThanOrEqual(1);
    }
    // Verify none of the top-level-only object keys appear without a suffix
    const objectKeys = ['common', 'nav', 'auth', 'dashboard', 'forms', 'validation', 'errors', 'table', 'notifications'];
    for (const objectKey of objectKeys) {
      expect(enSet.has(objectKey)).toBe(false);
    }
  });

  it('all locales have at least 100 keys', () => {
    expect(de.length).toBeGreaterThanOrEqual(100);
    expect(fr.length).toBeGreaterThanOrEqual(100);
    expect(es.length).toBeGreaterThanOrEqual(100);
  });

  it('auth.signIn key exists in all locales', () => {
    expect(enSet.has('auth.signIn')).toBe(true);
    expect(deSet.has('auth.signIn')).toBe(true);
    expect(frSet.has('auth.signIn')).toBe(true);
    expect(esSet.has('auth.signIn')).toBe(true);
  });
});

// ── Edge cases, missing keys, and locale validation ──────────────────────────

describe('i18n — edge cases and locale validation', () => {
  it('flattenKeys returns an empty array for an empty object', () => {
    expect(flattenKeys({})).toHaveLength(0);
  });

  it('flattenKeys handles a single-level flat object', () => {
    const result = flattenKeys({ a: 'hello', b: 'world' });
    expect(result).toEqual(['a', 'b']);
  });

  it('flattenKeys handles deeply nested objects', () => {
    const deep = { a: { b: { c: 'value' } } };
    const result = flattenKeys(deep);
    expect(result).toEqual(['a.b.c']);
  });

  it('a non-existent key is not found in any locale', () => {
    const ghost = '__ghost_key_that_does_not_exist__';
    expect(enSet.has(ghost)).toBe(false);
    expect(deSet.has(ghost)).toBe(false);
    expect(frSet.has(ghost)).toBe(false);
    expect(esSet.has(ghost)).toBe(false);
  });

  it('all locale key sets are equal to the en key set', () => {
    const enArr = Array.from(enSet).sort();
    expect(Array.from(deSet).sort()).toEqual(enArr);
    expect(Array.from(frSet).sort()).toEqual(enArr);
    expect(Array.from(esSet).sort()).toEqual(enArr);
  });

  it('no locale contains duplicate keys', () => {
    expect(en.length).toBe(enSet.size);
    expect(de.length).toBe(deSet.size);
    expect(fr.length).toBe(frSet.size);
    expect(es.length).toBe(esSet.size);
  });

  it('errors section keys exist in all locales', () => {
    const errorKeys = ['errors.notFound', 'errors.unauthorized', 'errors.serverError'];
    for (const key of errorKeys) {
      expect(enSet.has(key)).toBe(true);
      expect(deSet.has(key)).toBe(true);
      expect(frSet.has(key)).toBe(true);
      expect(esSet.has(key)).toBe(true);
    }
  });

  it('dashboard section keys exist in all locales', () => {
    const dashKeys = ['dashboard.title', 'dashboard.welcome', 'dashboard.overview'];
    for (const key of dashKeys) {
      expect(enSet.has(key)).toBe(true);
      expect(deSet.has(key)).toBe(true);
      expect(frSet.has(key)).toBe(true);
      expect(esSet.has(key)).toBe(true);
    }
  });

  it('validation section keys exist in all locales', () => {
    const valKeys = ['validation.required', 'validation.email', 'validation.minLength'];
    for (const key of valKeys) {
      expect(enSet.has(key)).toBe(true);
      expect(deSet.has(key)).toBe(true);
      expect(frSet.has(key)).toBe(true);
      expect(esSet.has(key)).toBe(true);
    }
  });

  it('table section keys exist in all locales', () => {
    const tableKeys = ['table.noData', 'table.rowsPerPage', 'table.first', 'table.last'];
    for (const key of tableKeys) {
      expect(enSet.has(key)).toBe(true);
      expect(deSet.has(key)).toBe(true);
      expect(frSet.has(key)).toBe(true);
      expect(esSet.has(key)).toBe(true);
    }
  });

  it('notifications section keys exist in all locales', () => {
    const notifKeys = ['notifications.title', 'notifications.markAllRead', 'notifications.noNotifications'];
    for (const key of notifKeys) {
      expect(enSet.has(key)).toBe(true);
      expect(deSet.has(key)).toBe(true);
      expect(frSet.has(key)).toBe(true);
      expect(esSet.has(key)).toBe(true);
    }
  });
});
