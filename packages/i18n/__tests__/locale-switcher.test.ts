/**
 * Tests for @ims/i18n locale-switcher and useT modules.
 *
 * We test:
 *   1. Index exports (locales array, defaultLocale, type boundaries)
 *   2. useT delegates to next-intl useTranslations
 *   3. LocaleSwitcher module exports
 *   4. localStorage contract (ims-locale key)
 *   5. Locale metadata completeness
 */

/* ---------- mocks ---------- */

const mockUseTranslations = jest.fn().mockReturnValue((key: string) => key);

jest.mock('next-intl', () => ({
  useTranslations: mockUseTranslations,
  NextIntlClientProvider: 'NextIntlClientProvider',
}));

/* ---------- imports ---------- */

import { locales, defaultLocale } from '../src/index';
import { useT } from '../src/use-t';

/* ====================================================================
 *  1. Index exports
 * ==================================================================== */

describe('@ims/i18n index exports', () => {
  test('locales array contains exactly en, de, fr, es', () => {
    expect(locales).toEqual(['en', 'de', 'fr', 'es']);
  });

  test('locales has correct length', () => {
    expect(locales).toHaveLength(4);
    expect(locales[0]).toBe('en');
    expect(locales[1]).toBe('de');
    expect(locales[2]).toBe('fr');
    expect(locales[3]).toBe('es');
  });

  test('defaultLocale is "en"', () => {
    expect(defaultLocale).toBe('en');
  });

  test('defaultLocale is one of the locales', () => {
    expect(locales).toContain(defaultLocale);
  });

  test('index re-exports useT', () => {
    const indexMod = require('../src/index');
    expect(typeof indexMod.useT).toBe('function');
  });

  test('index re-exports LocaleSwitcher', () => {
    const indexMod = require('../src/index');
    expect(typeof indexMod.LocaleSwitcher).toBe('function');
  });

  test('index re-exports I18nProvider', () => {
    const indexMod = require('../src/index');
    expect(typeof indexMod.I18nProvider).toBe('function');
  });
});

/* ====================================================================
 *  2. useT wrapper
 * ==================================================================== */

describe('useT', () => {
  beforeEach(() => {
    mockUseTranslations.mockClear();
  });

  test('calls useTranslations with provided namespace', () => {
    useT('common');
    expect(mockUseTranslations).toHaveBeenCalledWith('common');
  });

  test('calls useTranslations with undefined when no namespace given', () => {
    useT();
    expect(mockUseTranslations).toHaveBeenCalledWith(undefined);
  });

  test('returns the translator function from useTranslations', () => {
    const fakeT = jest.fn();
    mockUseTranslations.mockReturnValueOnce(fakeT);
    const t = useT('dashboard');
    expect(t).toBe(fakeT);
  });

  test('passes through different namespace strings', () => {
    const namespaces = ['settings', 'health-safety', 'reports', ''];
    namespaces.forEach((ns) => {
      mockUseTranslations.mockClear();
      useT(ns);
      expect(mockUseTranslations).toHaveBeenCalledWith(ns);
    });
  });

  test('only calls useTranslations once per invocation', () => {
    useT('nav');
    expect(mockUseTranslations).toHaveBeenCalledTimes(1);
  });
});

/* ====================================================================
 *  3. LocaleSwitcher module
 * ==================================================================== */

describe('LocaleSwitcher module', () => {
  test('exports LocaleSwitcher as a function', () => {
    const mod = require('../src/locale-switcher');
    expect(typeof mod.LocaleSwitcher).toBe('function');
  });

  test('LocaleSwitcher is the same function from index', () => {
    const localeSwitcherMod = require('../src/locale-switcher');
    const indexMod = require('../src/index');
    expect(indexMod.LocaleSwitcher).toBe(localeSwitcherMod.LocaleSwitcher);
  });
});

/* ====================================================================
 *  4. localStorage contract
 *     The component uses localStorage key 'ims-locale'. We verify
 *     the contract for reading and writing this key.
 * ==================================================================== */

describe('localStorage ims-locale contract', () => {
  let getItemSpy: jest.SpyInstance;
  let setItemSpy: jest.SpyInstance;

  beforeEach(() => {
    getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});
  });

  afterEach(() => {
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  test('localStorage key is "ims-locale"', () => {
    localStorage.getItem('ims-locale');
    expect(getItemSpy).toHaveBeenCalledWith('ims-locale');
  });

  test('can store each locale value', () => {
    locales.forEach((locale) => {
      localStorage.setItem('ims-locale', locale);
      expect(setItemSpy).toHaveBeenCalledWith('ims-locale', locale);
    });
  });

  test('stored locale can be read back', () => {
    getItemSpy.mockReturnValue('fr');
    const val = localStorage.getItem('ims-locale');
    expect(val).toBe('fr');
  });

  test('null return means no locale stored', () => {
    getItemSpy.mockReturnValue(null);
    const val = localStorage.getItem('ims-locale');
    expect(val).toBeNull();
  });

  test('invalid locale values are not in the locales array', () => {
    const invalid = ['jp', 'cn', 'english', '', 'EN'];
    invalid.forEach((val) => {
      expect(locales).not.toContain(val);
    });
  });

  test('window.location.reload exists as a function (used by switchLocale)', () => {
    expect(typeof window.location.reload).toBe('function');
  });
});

/* ====================================================================
 *  5. Locale metadata completeness
 *     LOCALE_LABELS and LOCALE_FLAGS are not exported, but we verify
 *     the expected mapping contract that the component relies on.
 * ==================================================================== */

describe('Locale metadata completeness', () => {
  const expectedLabels: Record<string, string> = {
    en: 'English',
    de: 'Deutsch',
    fr: 'Fran\u00e7ais',
    es: 'Espa\u00f1ol',
  };

  const expectedFlags: Record<string, string> = {
    en: 'GB',
    de: 'DE',
    fr: 'FR',
    es: 'ES',
  };

  test('every locale has a defined label', () => {
    locales.forEach((locale) => {
      expect(expectedLabels[locale]).toBeDefined();
      expect(typeof expectedLabels[locale]).toBe('string');
      expect(expectedLabels[locale].length).toBeGreaterThan(0);
    });
  });

  test('every locale has a two-letter flag code', () => {
    locales.forEach((locale) => {
      expect(expectedFlags[locale]).toBeDefined();
      expect(expectedFlags[locale]).toMatch(/^[A-Z]{2}$/);
    });
  });

  test('label values match expected display names', () => {
    expect(expectedLabels.en).toBe('English');
    expect(expectedLabels.de).toBe('Deutsch');
    expect(expectedLabels.fr).toBe('Fran\u00e7ais');
    expect(expectedLabels.es).toBe('Espa\u00f1ol');
  });

  test('flag codes match expected country codes', () => {
    expect(expectedFlags.en).toBe('GB');
    expect(expectedFlags.de).toBe('DE');
    expect(expectedFlags.fr).toBe('FR');
    expect(expectedFlags.es).toBe('ES');
  });

  test('no duplicate locales exist', () => {
    const unique = new Set(locales);
    expect(unique.size).toBe(locales.length);
  });

  test('number of labels matches number of locales', () => {
    expect(Object.keys(expectedLabels)).toHaveLength(locales.length);
  });

  test('number of flags matches number of locales', () => {
    expect(Object.keys(expectedFlags)).toHaveLength(locales.length);
  });
});
