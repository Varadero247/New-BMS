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
