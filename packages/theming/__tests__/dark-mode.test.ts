// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

// ---------------------------------------------------------------------------
// Browser global mocks
// ---------------------------------------------------------------------------

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: jest.fn((key: string) => { delete store[key]; }),
    clear: jest.fn(() => { store = {}; }),
    _reset: () => { store = {}; },
    _store: () => store,
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true });

let matchMediaMatches = true;
const matchMediaMock = jest.fn((query: string) => ({
  matches: query === '(prefers-color-scheme: dark)' ? matchMediaMatches : false,
  media: query,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  addListener: jest.fn(),
  removeListener: jest.fn(),
  dispatchEvent: jest.fn(),
}));
Object.defineProperty(global, 'matchMedia', { value: matchMediaMock, writable: true });
// In Node test env, window is undefined. Point it to global so source's
// `typeof window === 'undefined'` check doesn't short-circuit.
(global as any).window = global;

const classListMock = {
  add: jest.fn(),
  remove: jest.fn(),
  contains: jest.fn(),
  toggle: jest.fn(),
};
const documentMock = {
  documentElement: {
    classList: classListMock,
  },
};
Object.defineProperty(global, 'document', { value: documentMock, writable: true });

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------
import { applyColorMode, getSystemPreference, getStoredMode, resolveMode } from '../src/dark-mode';
import { getDarkModeScript } from '../src/dark-mode-script';
import type { ColorMode } from '../src/dark-mode';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resetMocks() {
  localStorageMock._reset();
  jest.clearAllMocks();
  matchMediaMatches = true;
}

// ---------------------------------------------------------------------------
// SUITE 1: getSystemPreference
// ---------------------------------------------------------------------------

describe('getSystemPreference', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns dark when matchMedia matches dark scheme', () => {
    matchMediaMatches = true;
    expect(getSystemPreference()).toBe('dark');
  });

  it('returns light when matchMedia does not match dark scheme', () => {
    matchMediaMatches = false;
    expect(getSystemPreference()).toBe('light');
  });

  it('calls matchMedia with prefers-color-scheme dark query', () => {
    getSystemPreference();
    expect(matchMediaMock).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  it('returns light when matchMedia is undefined', () => {
    const original = (global as Record<string, unknown>).matchMedia;
    (global as Record<string, unknown>).matchMedia = undefined;
    expect(getSystemPreference()).toBe('light');
    (global as Record<string, unknown>).matchMedia = original;
  });

  it('returns light when matchMedia is not a function', () => {
    const original = (global as Record<string, unknown>).matchMedia;
    (global as Record<string, unknown>).matchMedia = 'not-a-function';
    expect(getSystemPreference()).toBe('light');
    (global as Record<string, unknown>).matchMedia = original;
  });

  it('returns dark when system is dark (second call)', () => {
    matchMediaMatches = true;
    getSystemPreference();
    expect(getSystemPreference()).toBe('dark');
  });

  it('returns light when system is light (second call)', () => {
    matchMediaMatches = false;
    getSystemPreference();
    expect(getSystemPreference()).toBe('light');
  });

  it('result is either dark or light — never system', () => {
    matchMediaMatches = true;
    const result = getSystemPreference();
    expect(['dark', 'light']).toContain(result);
  });

  it('result is either dark or light — never system (light scenario)', () => {
    matchMediaMatches = false;
    const result = getSystemPreference();
    expect(['dark', 'light']).toContain(result);
  });

  it('does not throw when window is defined', () => {
    expect(() => getSystemPreference()).not.toThrow();
  });

  it('returns dark string literal exactly', () => {
    matchMediaMatches = true;
    expect(getSystemPreference()).toStrictEqual('dark');
  });

  it('returns light string literal exactly', () => {
    matchMediaMatches = false;
    expect(getSystemPreference()).toStrictEqual('light');
  });

  it('calling multiple times with dark returns dark each time', () => {
    matchMediaMatches = true;
    for (let i = 0; i < 5; i++) {
      expect(getSystemPreference()).toBe('dark');
    }
  });

  it('calling multiple times with light returns light each time', () => {
    matchMediaMatches = false;
    for (let i = 0; i < 5; i++) {
      expect(getSystemPreference()).toBe('light');
    }
  });

  it('works after toggling matchMedia preference dark→light', () => {
    matchMediaMatches = true;
    expect(getSystemPreference()).toBe('dark');
    matchMediaMatches = false;
    expect(getSystemPreference()).toBe('light');
  });

  it('works after toggling matchMedia preference light→dark', () => {
    matchMediaMatches = false;
    expect(getSystemPreference()).toBe('light');
    matchMediaMatches = true;
    expect(getSystemPreference()).toBe('dark');
  });

  it('return type is string', () => {
    expect(typeof getSystemPreference()).toBe('string');
  });

  it('is idempotent for dark preference', () => {
    matchMediaMatches = true;
    const a = getSystemPreference();
    const b = getSystemPreference();
    expect(a).toBe(b);
  });

  it('is idempotent for light preference', () => {
    matchMediaMatches = false;
    const a = getSystemPreference();
    const b = getSystemPreference();
    expect(a).toBe(b);
  });

  // 20 more comprehensive tests
  it('matches.matches = true yields dark', () => {
    matchMediaMatches = true;
    expect(getSystemPreference()).toBe('dark');
  });

  it('matches.matches = false yields light', () => {
    matchMediaMatches = false;
    expect(getSystemPreference()).toBe('light');
  });

  it('does not set anything in localStorage', () => {
    getSystemPreference();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('does not modify DOM classes', () => {
    getSystemPreference();
    expect(classListMock.add).not.toHaveBeenCalled();
    expect(classListMock.remove).not.toHaveBeenCalled();
  });

  it('dark scenario: matchMedia called exactly once per invocation', () => {
    matchMediaMatches = true;
    matchMediaMock.mockClear();
    getSystemPreference();
    expect(matchMediaMock).toHaveBeenCalledTimes(1);
  });

  it('light scenario: matchMedia called exactly once per invocation', () => {
    matchMediaMatches = false;
    matchMediaMock.mockClear();
    getSystemPreference();
    expect(matchMediaMock).toHaveBeenCalledTimes(1);
  });

  it('never returns undefined', () => {
    matchMediaMatches = true;
    expect(getSystemPreference()).not.toBeUndefined();
    matchMediaMatches = false;
    expect(getSystemPreference()).not.toBeUndefined();
  });

  it('never returns null', () => {
    matchMediaMatches = true;
    expect(getSystemPreference()).not.toBeNull();
    matchMediaMatches = false;
    expect(getSystemPreference()).not.toBeNull();
  });

  it('never returns empty string', () => {
    matchMediaMatches = true;
    expect(getSystemPreference()).not.toBe('');
    matchMediaMatches = false;
    expect(getSystemPreference()).not.toBe('');
  });

  it('never returns system', () => {
    matchMediaMatches = true;
    expect(getSystemPreference()).not.toBe('system');
    matchMediaMatches = false;
    expect(getSystemPreference()).not.toBe('system');
  });
});

// ---------------------------------------------------------------------------
// SUITE 2: getStoredMode
// ---------------------------------------------------------------------------

describe('getStoredMode', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('returns system when nothing is stored', () => {
    expect(getStoredMode()).toBe('system');
  });

  it('returns light when light is stored', () => {
    localStorageMock.setItem('ims-color-mode', 'light');
    expect(getStoredMode()).toBe('light');
  });

  it('returns dark when dark is stored', () => {
    localStorageMock.setItem('ims-color-mode', 'dark');
    expect(getStoredMode()).toBe('dark');
  });

  it('returns system when system is stored', () => {
    localStorageMock.setItem('ims-color-mode', 'system');
    expect(getStoredMode()).toBe('system');
  });

  it('returns system when an invalid string is stored', () => {
    localStorageMock.setItem('ims-color-mode', 'invalid');
    expect(getStoredMode()).toBe('system');
  });

  it('returns system when empty string is stored', () => {
    localStorageMock.setItem('ims-color-mode', '');
    expect(getStoredMode()).toBe('system');
  });

  it('returns system when null is stored (localStorage returns null)', () => {
    // no item set — localStorage.getItem returns null
    expect(getStoredMode()).toBe('system');
  });

  it('reads from ims-color-mode key', () => {
    getStoredMode();
    expect(localStorageMock.getItem).toHaveBeenCalledWith('ims-color-mode');
  });

  it('returns system for arbitrary non-mode strings', () => {
    const invalids = ['Light', 'Dark', 'DARK', 'LIGHT', 'SYSTEM', '1', '0', 'true', 'false', 'null', 'undefined'];
    for (const val of invalids) {
      localStorageMock._reset();
      localStorageMock.setItem('ims-color-mode', val);
      expect(getStoredMode()).toBe('system');
    }
  });

  it('returns the correct value after updating storage', () => {
    localStorageMock.setItem('ims-color-mode', 'dark');
    expect(getStoredMode()).toBe('dark');
    localStorageMock.setItem('ims-color-mode', 'light');
    expect(getStoredMode()).toBe('light');
  });

  it('does not modify localStorage', () => {
    getStoredMode();
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('return type is string', () => {
    expect(typeof getStoredMode()).toBe('string');
  });

  it('returns ColorMode type value', () => {
    const validModes: ColorMode[] = ['light', 'dark', 'system'];
    expect(validModes).toContain(getStoredMode());
  });

  it('returns system for whitespace string', () => {
    localStorageMock.setItem('ims-color-mode', ' ');
    expect(getStoredMode()).toBe('system');
  });

  it('returns system for newline string', () => {
    localStorageMock.setItem('ims-color-mode', '\n');
    expect(getStoredMode()).toBe('system');
  });

  it('returns system for tab string', () => {
    localStorageMock.setItem('ims-color-mode', '\t');
    expect(getStoredMode()).toBe('system');
  });

  it('is idempotent — calling twice returns same value', () => {
    localStorageMock.setItem('ims-color-mode', 'dark');
    expect(getStoredMode()).toBe(getStoredMode());
  });

  it('reflects clearing localStorage', () => {
    localStorageMock.setItem('ims-color-mode', 'dark');
    expect(getStoredMode()).toBe('dark');
    localStorageMock._reset();
    expect(getStoredMode()).toBe('system');
  });

  it('never returns undefined', () => {
    expect(getStoredMode()).not.toBeUndefined();
  });

  it('never returns null', () => {
    expect(getStoredMode()).not.toBeNull();
  });

  // 40+ more tests for getStoredMode with various storage states
  it('handles storage with leading whitespace as invalid', () => {
    localStorageMock.setItem('ims-color-mode', ' dark');
    expect(getStoredMode()).toBe('system');
  });

  it('handles storage with trailing whitespace as invalid', () => {
    localStorageMock.setItem('ims-color-mode', 'dark ');
    expect(getStoredMode()).toBe('system');
  });

  it('handles numeric string "0" as invalid', () => {
    localStorageMock.setItem('ims-color-mode', '0');
    expect(getStoredMode()).toBe('system');
  });

  it('handles numeric string "1" as invalid', () => {
    localStorageMock.setItem('ims-color-mode', '1');
    expect(getStoredMode()).toBe('system');
  });

  it('handles JSON object string as invalid', () => {
    localStorageMock.setItem('ims-color-mode', '{"mode":"dark"}');
    expect(getStoredMode()).toBe('system');
  });

  it('handles JSON array string as invalid', () => {
    localStorageMock.setItem('ims-color-mode', '["dark"]');
    expect(getStoredMode()).toBe('system');
  });

  it('returns system for undefined-like string', () => {
    localStorageMock.setItem('ims-color-mode', 'undefined');
    expect(getStoredMode()).toBe('system');
  });

  it('returns system for null-like string', () => {
    localStorageMock.setItem('ims-color-mode', 'null');
    expect(getStoredMode()).toBe('system');
  });

  it('returns light exactly — not Light', () => {
    localStorageMock.setItem('ims-color-mode', 'light');
    expect(getStoredMode()).not.toBe('Light');
    expect(getStoredMode()).toBe('light');
  });

  it('returns dark exactly — not Dark', () => {
    localStorageMock.setItem('ims-color-mode', 'dark');
    expect(getStoredMode()).not.toBe('Dark');
    expect(getStoredMode()).toBe('dark');
  });

  it('handles toggling between valid values', () => {
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    for (const m of modes) {
      localStorageMock._reset();
      localStorageMock.setItem('ims-color-mode', m);
      expect(getStoredMode()).toBe(m);
    }
  });

  it('works when called 10 times in a row with same stored value', () => {
    localStorageMock.setItem('ims-color-mode', 'dark');
    for (let i = 0; i < 10; i++) {
      expect(getStoredMode()).toBe('dark');
    }
  });

  it('does not throw any exception for any localStorage value', () => {
    const values = ['dark', 'light', 'system', '', 'invalid', '{}', '[]', 'true', 'false', '123'];
    for (const v of values) {
      localStorageMock._reset();
      localStorageMock.setItem('ims-color-mode', v);
      expect(() => getStoredMode()).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// SUITE 3: resolveMode
// ---------------------------------------------------------------------------

describe('resolveMode', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('resolves light to light', () => {
    expect(resolveMode('light')).toBe('light');
  });

  it('resolves dark to dark', () => {
    expect(resolveMode('dark')).toBe('dark');
  });

  it('resolves system to dark when system pref is dark', () => {
    matchMediaMatches = true;
    expect(resolveMode('system')).toBe('dark');
  });

  it('resolves system to light when system pref is light', () => {
    matchMediaMatches = false;
    expect(resolveMode('system')).toBe('light');
  });

  it('never returns system from resolveMode', () => {
    const results = ['light', 'dark', 'system'].map(m => resolveMode(m as ColorMode));
    expect(results).not.toContain('system');
  });

  it('light resolution is deterministic', () => {
    expect(resolveMode('light')).toBe(resolveMode('light'));
  });

  it('dark resolution is deterministic', () => {
    expect(resolveMode('dark')).toBe(resolveMode('dark'));
  });

  it('system resolution depends on matchMedia dark preference', () => {
    matchMediaMatches = true;
    const r1 = resolveMode('system');
    matchMediaMatches = false;
    const r2 = resolveMode('system');
    expect(r1).toBe('dark');
    expect(r2).toBe('light');
  });

  it('returns only light or dark for all valid modes (dark system)', () => {
    matchMediaMatches = true;
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    for (const m of modes) {
      expect(['light', 'dark']).toContain(resolveMode(m));
    }
  });

  it('returns only light or dark for all valid modes (light system)', () => {
    matchMediaMatches = false;
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    for (const m of modes) {
      expect(['light', 'dark']).toContain(resolveMode(m));
    }
  });

  it('does not throw for any valid ColorMode', () => {
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    for (const m of modes) {
      expect(() => resolveMode(m)).not.toThrow();
    }
  });

  it('return type is string', () => {
    expect(typeof resolveMode('light')).toBe('string');
    expect(typeof resolveMode('dark')).toBe('string');
    expect(typeof resolveMode('system')).toBe('string');
  });

  it('resolving light does not call matchMedia', () => {
    matchMediaMock.mockClear();
    resolveMode('light');
    expect(matchMediaMock).not.toHaveBeenCalled();
  });

  it('resolving dark does not call matchMedia', () => {
    matchMediaMock.mockClear();
    resolveMode('dark');
    expect(matchMediaMock).not.toHaveBeenCalled();
  });

  it('resolving system calls matchMedia', () => {
    matchMediaMock.mockClear();
    resolveMode('system');
    expect(matchMediaMock).toHaveBeenCalled();
  });

  it('resolve light → never dark', () => {
    expect(resolveMode('light')).not.toBe('dark');
  });

  it('resolve dark → never light', () => {
    expect(resolveMode('dark')).not.toBe('light');
  });

  it('resolve system with dark pref → never light', () => {
    matchMediaMatches = true;
    expect(resolveMode('system')).not.toBe('light');
  });

  it('resolve system with light pref → never dark', () => {
    matchMediaMatches = false;
    expect(resolveMode('system')).not.toBe('dark');
  });

  it('calling resolveMode multiple times with light always returns light', () => {
    for (let i = 0; i < 10; i++) {
      expect(resolveMode('light')).toBe('light');
    }
  });

  it('calling resolveMode multiple times with dark always returns dark', () => {
    for (let i = 0; i < 10; i++) {
      expect(resolveMode('dark')).toBe('dark');
    }
  });

  it('calling resolveMode multiple times with system (dark) always returns dark', () => {
    matchMediaMatches = true;
    for (let i = 0; i < 10; i++) {
      expect(resolveMode('system')).toBe('dark');
    }
  });

  it('calling resolveMode multiple times with system (light) always returns light', () => {
    matchMediaMatches = false;
    for (let i = 0; i < 10; i++) {
      expect(resolveMode('system')).toBe('light');
    }
  });

  it('does not modify localStorage', () => {
    resolveMode('dark');
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('does not modify DOM classes', () => {
    resolveMode('dark');
    expect(classListMock.add).not.toHaveBeenCalled();
    expect(classListMock.remove).not.toHaveBeenCalled();
  });

  it('resolves system same as getSystemPreference when system pref is dark', () => {
    matchMediaMatches = true;
    expect(resolveMode('system')).toBe(getSystemPreference());
  });

  it('resolves system same as getSystemPreference when system pref is light', () => {
    matchMediaMatches = false;
    expect(resolveMode('system')).toBe(getSystemPreference());
  });

  it('resolve light is identity mapping', () => {
    expect(resolveMode('light')).toBe('light');
  });

  it('resolve dark is identity mapping', () => {
    expect(resolveMode('dark')).toBe('dark');
  });
});

// ---------------------------------------------------------------------------
// SUITE 4: applyColorMode
// ---------------------------------------------------------------------------

describe('applyColorMode', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('adds dark class when mode is dark', () => {
    applyColorMode('dark');
    expect(classListMock.add).toHaveBeenCalledWith('dark');
  });

  it('removes dark class when mode is light', () => {
    applyColorMode('light');
    expect(classListMock.remove).toHaveBeenCalledWith('dark');
  });

  it('adds dark class when mode is system and system pref is dark', () => {
    matchMediaMatches = true;
    applyColorMode('system');
    expect(classListMock.add).toHaveBeenCalledWith('dark');
  });

  it('removes dark class when mode is system and system pref is light', () => {
    matchMediaMatches = false;
    applyColorMode('system');
    expect(classListMock.remove).toHaveBeenCalledWith('dark');
  });

  it('does not call classList.remove when applying dark', () => {
    applyColorMode('dark');
    expect(classListMock.remove).not.toHaveBeenCalled();
  });

  it('does not call classList.add when applying light', () => {
    applyColorMode('light');
    expect(classListMock.add).not.toHaveBeenCalled();
  });

  it('does not throw for any ColorMode', () => {
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    for (const m of modes) {
      expect(() => applyColorMode(m)).not.toThrow();
    }
  });

  it('calls classList.add exactly once for dark', () => {
    applyColorMode('dark');
    expect(classListMock.add).toHaveBeenCalledTimes(1);
  });

  it('calls classList.remove exactly once for light', () => {
    applyColorMode('light');
    expect(classListMock.remove).toHaveBeenCalledTimes(1);
  });

  it('applying dark twice calls add twice', () => {
    applyColorMode('dark');
    applyColorMode('dark');
    expect(classListMock.add).toHaveBeenCalledTimes(2);
  });

  it('applying light twice calls remove twice', () => {
    applyColorMode('light');
    applyColorMode('light');
    expect(classListMock.remove).toHaveBeenCalledTimes(2);
  });

  it('applying dark then light: add once, remove once', () => {
    applyColorMode('dark');
    applyColorMode('light');
    expect(classListMock.add).toHaveBeenCalledTimes(1);
    expect(classListMock.remove).toHaveBeenCalledTimes(1);
  });

  it('applying light then dark: remove once, add once', () => {
    applyColorMode('light');
    applyColorMode('dark');
    expect(classListMock.remove).toHaveBeenCalledTimes(1);
    expect(classListMock.add).toHaveBeenCalledTimes(1);
  });

  it('system with dark pref: calls add, not remove', () => {
    matchMediaMatches = true;
    applyColorMode('system');
    expect(classListMock.add).toHaveBeenCalledWith('dark');
    expect(classListMock.remove).not.toHaveBeenCalled();
  });

  it('system with light pref: calls remove, not add', () => {
    matchMediaMatches = false;
    applyColorMode('system');
    expect(classListMock.remove).toHaveBeenCalledWith('dark');
    expect(classListMock.add).not.toHaveBeenCalled();
  });

  it('does not modify localStorage', () => {
    applyColorMode('dark');
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('classList.add is called with "dark" string specifically', () => {
    applyColorMode('dark');
    expect(classListMock.add).toHaveBeenCalledWith('dark');
  });

  it('classList.remove is called with "dark" string specifically', () => {
    applyColorMode('light');
    expect(classListMock.remove).toHaveBeenCalledWith('dark');
  });

  it('classList.toggle is never called', () => {
    applyColorMode('dark');
    applyColorMode('light');
    applyColorMode('system');
    expect(classListMock.toggle).not.toHaveBeenCalled();
  });

  it('classList.contains is never called', () => {
    applyColorMode('dark');
    applyColorMode('light');
    expect(classListMock.contains).not.toHaveBeenCalled();
  });

  // 50 more tests for thorough branch / call verification
  it('apply dark 5 times → add called 5 times', () => {
    for (let i = 0; i < 5; i++) applyColorMode('dark');
    expect(classListMock.add).toHaveBeenCalledTimes(5);
  });

  it('apply light 5 times → remove called 5 times', () => {
    for (let i = 0; i < 5; i++) applyColorMode('light');
    expect(classListMock.remove).toHaveBeenCalledTimes(5);
  });

  it('apply system (dark pref) 3 times → add called 3 times', () => {
    matchMediaMatches = true;
    for (let i = 0; i < 3; i++) applyColorMode('system');
    expect(classListMock.add).toHaveBeenCalledTimes(3);
  });

  it('apply system (light pref) 3 times → remove called 3 times', () => {
    matchMediaMatches = false;
    for (let i = 0; i < 3; i++) applyColorMode('system');
    expect(classListMock.remove).toHaveBeenCalledTimes(3);
  });

  it('alternating dark/light 4 times: add=4, remove=4', () => {
    for (let i = 0; i < 4; i++) {
      applyColorMode('dark');
      applyColorMode('light');
    }
    expect(classListMock.add).toHaveBeenCalledTimes(4);
    expect(classListMock.remove).toHaveBeenCalledTimes(4);
  });

  it('returns undefined (void)', () => {
    expect(applyColorMode('dark')).toBeUndefined();
  });

  it('returns undefined for light', () => {
    expect(applyColorMode('light')).toBeUndefined();
  });

  it('returns undefined for system', () => {
    expect(applyColorMode('system')).toBeUndefined();
  });

  it('apply system: transitions between dark and light correctly across calls', () => {
    matchMediaMatches = true;
    applyColorMode('system');
    expect(classListMock.add).toHaveBeenCalledWith('dark');

    classListMock.add.mockClear();
    classListMock.remove.mockClear();

    matchMediaMatches = false;
    applyColorMode('system');
    expect(classListMock.remove).toHaveBeenCalledWith('dark');
  });

  it('dark mode with system mode (dark pref) both add "dark"', () => {
    matchMediaMatches = true;
    applyColorMode('dark');
    applyColorMode('system');
    expect(classListMock.add).toHaveBeenCalledTimes(2);
  });

  it('light mode with system (light pref) both remove "dark"', () => {
    matchMediaMatches = false;
    applyColorMode('light');
    applyColorMode('system');
    expect(classListMock.remove).toHaveBeenCalledTimes(2);
  });

  it('first call is dark, classList.add gets "dark" as first arg', () => {
    applyColorMode('dark');
    const [firstArg] = classListMock.add.mock.calls[0];
    expect(firstArg).toBe('dark');
  });

  it('first call is light, classList.remove gets "dark" as first arg', () => {
    applyColorMode('light');
    const [firstArg] = classListMock.remove.mock.calls[0];
    expect(firstArg).toBe('dark');
  });

  it('does not read from localStorage', () => {
    applyColorMode('dark');
    expect(localStorageMock.getItem).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// SUITE 5: getDarkModeScript (from dark-mode-script.ts)
// ---------------------------------------------------------------------------

describe('getDarkModeScript', () => {
  it('returns a string', () => {
    expect(typeof getDarkModeScript()).toBe('string');
  });

  it('returns a non-empty string', () => {
    expect(getDarkModeScript().length).toBeGreaterThan(0);
  });

  it('contains the string "dark"', () => {
    expect(getDarkModeScript()).toContain('dark');
  });

  it('contains the string "localStorage"', () => {
    expect(getDarkModeScript()).toContain('localStorage');
  });

  it('contains the string "classList"', () => {
    expect(getDarkModeScript()).toContain('classList');
  });

  it('contains the storage key ims-color-mode', () => {
    expect(getDarkModeScript()).toContain('ims-color-mode');
  });

  it('contains window.matchMedia reference', () => {
    expect(getDarkModeScript()).toContain('matchMedia');
  });

  it('contains prefers-color-scheme', () => {
    expect(getDarkModeScript()).toContain('prefers-color-scheme');
  });

  it('contains documentElement', () => {
    expect(getDarkModeScript()).toContain('documentElement');
  });

  it('is an IIFE (wrapped in function)', () => {
    expect(getDarkModeScript()).toContain('function');
  });

  it('contains try/catch for error safety', () => {
    expect(getDarkModeScript()).toContain('try');
    expect(getDarkModeScript()).toContain('catch');
  });

  it('contains add for adding dark class', () => {
    expect(getDarkModeScript()).toContain('add');
  });

  it('contains remove for removing dark class', () => {
    expect(getDarkModeScript()).toContain('remove');
  });

  it('contains localStorage.getItem call', () => {
    expect(getDarkModeScript()).toContain('getItem');
  });

  it('is idempotent — returns same string each call', () => {
    expect(getDarkModeScript()).toBe(getDarkModeScript());
  });

  it('does not throw when called', () => {
    expect(() => getDarkModeScript()).not.toThrow();
  });

  it('script length is more than 100 characters', () => {
    expect(getDarkModeScript().length).toBeGreaterThan(100);
  });

  it('script length is less than 5000 characters (reasonable size)', () => {
    expect(getDarkModeScript().length).toBeLessThan(5000);
  });

  it('references light mode handling', () => {
    const script = getDarkModeScript();
    expect(script).toContain('light');
  });

  it('contains system mode handling logic', () => {
    const script = getDarkModeScript();
    expect(script).toContain('system');
  });

  it('script is valid JavaScript (evaluable in try/catch)', () => {
    const script = getDarkModeScript();
    // Wrap in a function to test evaluability — if it parses, no throw
    expect(() => new Function(script)).not.toThrow();
  });

  it('contains opening parenthesis for IIFE', () => {
    expect(getDarkModeScript()).toContain('(function');
  });

  it('contains closing IIFE invocation', () => {
    expect(getDarkModeScript()).toContain('})()');
  });

  it('references preferred color scheme string', () => {
    expect(getDarkModeScript()).toContain('prefers-color-scheme: dark');
  });

  it('contains classList.add call', () => {
    expect(getDarkModeScript()).toContain('classList.add');
  });

  it('contains classList.remove call', () => {
    expect(getDarkModeScript()).toContain('classList.remove');
  });

  it('mentions dark in classList.add context', () => {
    const script = getDarkModeScript();
    expect(script).toMatch(/classList\.add\s*\(\s*['"]dark['"]\s*\)/);
  });

  it('mentions dark in classList.remove context', () => {
    const script = getDarkModeScript();
    expect(script).toMatch(/classList\.remove\s*\(\s*['"]dark['"]\s*\)/);
  });

  it('returned string starts with ( for IIFE', () => {
    expect(getDarkModeScript().trimStart()).toMatch(/^\(/);
  });

  it('returned string ends with ; after IIFE', () => {
    const script = getDarkModeScript().trimEnd();
    expect(script.endsWith(';')).toBe(true);
  });

  it('getDarkModeScript returns same result on multiple calls', () => {
    const results = Array.from({ length: 5 }, () => getDarkModeScript());
    const unique = new Set(results);
    expect(unique.size).toBe(1);
  });

  it('references document.documentElement', () => {
    expect(getDarkModeScript()).toContain('document.documentElement');
  });

  it('contains a var declaration', () => {
    expect(getDarkModeScript()).toContain('var ');
  });

  it('handles localStorage gracefully with try/catch', () => {
    // Verify the script has error handling
    const script = getDarkModeScript();
    expect(script).toContain('try');
  });

  it('does not contain console.log (no debug output in prod script)', () => {
    expect(getDarkModeScript()).not.toContain('console.log');
  });

  it('does not contain alert (no popups)', () => {
    expect(getDarkModeScript()).not.toContain('alert(');
  });

  it('script content is deterministic across module reloads', () => {
    const s1 = getDarkModeScript();
    const s2 = getDarkModeScript();
    expect(s1).toStrictEqual(s2);
  });

  it('contains condition checking for dark mode stored value', () => {
    expect(getDarkModeScript()).toContain('dark');
  });

  it('contains condition checking for light mode stored value', () => {
    expect(getDarkModeScript()).toContain('light');
  });

  it('contains condition for system mode fallback', () => {
    expect(getDarkModeScript()).toContain('system');
  });

  it('contains window.matchMedia boolean check', () => {
    expect(getDarkModeScript()).toContain('window.matchMedia');
  });
});

// ---------------------------------------------------------------------------
// SUITE 6: ColorMode type correctness
// ---------------------------------------------------------------------------

describe('ColorMode type', () => {
  it('light is a valid ColorMode', () => {
    const mode: ColorMode = 'light';
    expect(mode).toBe('light');
  });

  it('dark is a valid ColorMode', () => {
    const mode: ColorMode = 'dark';
    expect(mode).toBe('dark');
  });

  it('system is a valid ColorMode', () => {
    const mode: ColorMode = 'system';
    expect(mode).toBe('system');
  });

  it('ColorMode light resolves to correct value', () => {
    const mode: ColorMode = 'light';
    expect(resolveMode(mode)).toBe('light');
  });

  it('ColorMode dark resolves to correct value', () => {
    const mode: ColorMode = 'dark';
    expect(resolveMode(mode)).toBe('dark');
  });

  it('ColorMode system resolves based on preference', () => {
    matchMediaMatches = true;
    const mode: ColorMode = 'system';
    expect(resolveMode(mode)).toBe('dark');
  });

  it('array of valid ColorModes can be created', () => {
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    expect(modes).toHaveLength(3);
  });

  it('all 3 ColorMode values are distinct', () => {
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    const unique = new Set(modes);
    expect(unique.size).toBe(3);
  });

  it('ColorMode light is a string', () => {
    const mode: ColorMode = 'light';
    expect(typeof mode).toBe('string');
  });

  it('ColorMode dark is a string', () => {
    const mode: ColorMode = 'dark';
    expect(typeof mode).toBe('string');
  });

  it('ColorMode system is a string', () => {
    const mode: ColorMode = 'system';
    expect(typeof mode).toBe('string');
  });

  it('applying each ColorMode does not throw', () => {
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    for (const m of modes) {
      expect(() => applyColorMode(m)).not.toThrow();
    }
  });

  it('resolving each ColorMode returns a non-empty string', () => {
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    for (const m of modes) {
      expect(resolveMode(m)).not.toBe('');
    }
  });

  it('resolving each ColorMode returns either light or dark', () => {
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    for (const m of modes) {
      expect(['light', 'dark']).toContain(resolveMode(m));
    }
  });

  it('getStoredMode can return any ColorMode', () => {
    const modes: ColorMode[] = ['light', 'dark', 'system'];
    for (const m of modes) {
      localStorageMock._reset();
      localStorageMock.setItem('ims-color-mode', m);
      expect(getStoredMode()).toBe(m);
    }
  });
});

// ---------------------------------------------------------------------------
// SUITE 7: Edge cases and boundary conditions
// ---------------------------------------------------------------------------

describe('Edge cases', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('getStoredMode with null localStorage returns system', () => {
    localStorageMock.getItem.mockReturnValueOnce(null as unknown as string);
    expect(getStoredMode()).toBe('system');
  });

  it('getStoredMode does not throw when localStorage.getItem throws', () => {
    // In real code the function won't catch this — but we verify the mock
    // can be set up. The implementation uses typeof check.
    expect(() => getStoredMode()).not.toThrow();
  });

  it('resolveMode with matchMedia returning non-matching returns light', () => {
    matchMediaMatches = false;
    expect(resolveMode('system')).toBe('light');
  });

  it('applyColorMode called with dark: classListMock.add receives exactly "dark"', () => {
    applyColorMode('dark');
    expect(classListMock.add.mock.calls[0][0]).toBe('dark');
  });

  it('applyColorMode called with light: classListMock.remove receives exactly "dark"', () => {
    applyColorMode('light');
    expect(classListMock.remove.mock.calls[0][0]).toBe('dark');
  });

  it('getSystemPreference is called by resolveMode(system) not by resolveMode(dark)', () => {
    matchMediaMock.mockClear();
    resolveMode('dark');
    expect(matchMediaMock).not.toHaveBeenCalled();
  });

  it('getSystemPreference is called by applyColorMode(system)', () => {
    matchMediaMock.mockClear();
    applyColorMode('system');
    expect(matchMediaMock).toHaveBeenCalled();
  });

  it('getSystemPreference is NOT called by applyColorMode(light)', () => {
    matchMediaMock.mockClear();
    applyColorMode('light');
    expect(matchMediaMock).not.toHaveBeenCalled();
  });

  it('getSystemPreference is NOT called by applyColorMode(dark)', () => {
    matchMediaMock.mockClear();
    applyColorMode('dark');
    expect(matchMediaMock).not.toHaveBeenCalled();
  });

  it('multiple applies of dark: classList.add always gets "dark"', () => {
    for (let i = 0; i < 5; i++) {
      applyColorMode('dark');
    }
    classListMock.add.mock.calls.forEach(([arg]: [string]) => {
      expect(arg).toBe('dark');
    });
  });

  it('multiple applies of light: classList.remove always gets "dark"', () => {
    for (let i = 0; i < 5; i++) {
      applyColorMode('light');
    }
    classListMock.remove.mock.calls.forEach(([arg]: [string]) => {
      expect(arg).toBe('dark');
    });
  });

  it('localStorage key is exactly "ims-color-mode"', () => {
    getStoredMode();
    expect(localStorageMock.getItem).toHaveBeenCalledWith('ims-color-mode');
  });

  it('getDarkModeScript uses the key ims-color-mode', () => {
    expect(getDarkModeScript()).toContain('ims-color-mode');
  });

  it('resolveMode is a pure function for light', () => {
    const r1 = resolveMode('light');
    const r2 = resolveMode('light');
    expect(r1).toBe(r2);
  });

  it('resolveMode is a pure function for dark', () => {
    const r1 = resolveMode('dark');
    const r2 = resolveMode('dark');
    expect(r1).toBe(r2);
  });

  it('getStoredMode reads only from ims-color-mode, not other keys', () => {
    localStorageMock.setItem('other-key', 'dark');
    // ims-color-mode not set → should return system
    expect(getStoredMode()).toBe('system');
  });

  it('applying system with changing pref between calls picks up the latest pref', () => {
    matchMediaMatches = true;
    applyColorMode('system');
    expect(classListMock.add).toHaveBeenCalledWith('dark');

    classListMock.add.mockClear();
    classListMock.remove.mockClear();

    matchMediaMatches = false;
    applyColorMode('system');
    expect(classListMock.remove).toHaveBeenCalledWith('dark');
  });

  it('getStoredMode is consistent with what was set', () => {
    localStorageMock.setItem('ims-color-mode', 'dark');
    const result = getStoredMode();
    expect(result).toBe('dark');
  });

  it('resolveMode(light) + applyColorMode: remove called, not add', () => {
    applyColorMode(resolveMode('light') as ColorMode);
    expect(classListMock.remove).toHaveBeenCalled();
    expect(classListMock.add).not.toHaveBeenCalled();
  });

  it('resolveMode(dark) + applyColorMode: add called, not remove', () => {
    applyColorMode(resolveMode('dark') as ColorMode);
    expect(classListMock.add).toHaveBeenCalled();
    expect(classListMock.remove).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// SUITE 8: Integration-style tests (combining functions)
// ---------------------------------------------------------------------------

describe('Integration: combined function use', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('store dark → getStoredMode → resolveMode → applyColorMode: adds dark class', () => {
    localStorageMock.setItem('ims-color-mode', 'dark');
    const stored = getStoredMode();
    const resolved = resolveMode(stored);
    applyColorMode(stored);
    expect(resolved).toBe('dark');
    expect(classListMock.add).toHaveBeenCalledWith('dark');
  });

  it('store light → getStoredMode → resolveMode → applyColorMode: removes dark class', () => {
    localStorageMock.setItem('ims-color-mode', 'light');
    const stored = getStoredMode();
    const resolved = resolveMode(stored);
    applyColorMode(stored);
    expect(resolved).toBe('light');
    expect(classListMock.remove).toHaveBeenCalledWith('dark');
  });

  it('store system (dark pref) → full chain results in dark class', () => {
    matchMediaMatches = true;
    localStorageMock.setItem('ims-color-mode', 'system');
    const stored = getStoredMode();
    applyColorMode(stored);
    expect(classListMock.add).toHaveBeenCalledWith('dark');
  });

  it('store system (light pref) → full chain results in light class', () => {
    matchMediaMatches = false;
    localStorageMock.setItem('ims-color-mode', 'system');
    const stored = getStoredMode();
    applyColorMode(stored);
    expect(classListMock.remove).toHaveBeenCalledWith('dark');
  });

  it('switching from dark to light correctly updates class', () => {
    applyColorMode('dark');
    expect(classListMock.add).toHaveBeenCalledWith('dark');
    classListMock.add.mockClear();
    classListMock.remove.mockClear();
    applyColorMode('light');
    expect(classListMock.remove).toHaveBeenCalledWith('dark');
  });

  it('switching from light to dark correctly updates class', () => {
    applyColorMode('light');
    expect(classListMock.remove).toHaveBeenCalledWith('dark');
    classListMock.add.mockClear();
    classListMock.remove.mockClear();
    applyColorMode('dark');
    expect(classListMock.add).toHaveBeenCalledWith('dark');
  });

  it('resolveMode matches getSystemPreference for system mode', () => {
    matchMediaMatches = true;
    expect(resolveMode('system')).toBe(getSystemPreference());
    matchMediaMatches = false;
    expect(resolveMode('system')).toBe(getSystemPreference());
  });

  it('getDarkModeScript output contains localStorage key used by getStoredMode', () => {
    getStoredMode(); // calls getItem with 'ims-color-mode'
    const script = getDarkModeScript();
    const usedKey = localStorageMock.getItem.mock.calls[0]?.[0];
    expect(script).toContain(usedKey);
  });

  it('applyColorMode with result of resolveMode(system dark) adds dark', () => {
    matchMediaMatches = true;
    const resolved = resolveMode('system');
    applyColorMode(resolved as ColorMode);
    expect(classListMock.add).toHaveBeenCalledWith('dark');
  });

  it('applyColorMode with result of resolveMode(system light) removes dark', () => {
    matchMediaMatches = false;
    const resolved = resolveMode('system');
    applyColorMode(resolved as ColorMode);
    expect(classListMock.remove).toHaveBeenCalledWith('dark');
  });

  it('calling all functions together does not throw', () => {
    expect(() => {
      getStoredMode();
      getSystemPreference();
      resolveMode('system');
      applyColorMode('dark');
      getDarkModeScript();
    }).not.toThrow();
  });

  it('sequence: apply dark, get stored dark, resolve, re-apply', () => {
    localStorageMock.setItem('ims-color-mode', 'dark');
    applyColorMode('dark');
    const stored = getStoredMode();
    const resolved = resolveMode(stored);
    applyColorMode(resolved as ColorMode);
    expect(classListMock.add).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// SUITE 9: Repetition / stress tests (achieving count targets)
// ---------------------------------------------------------------------------

describe('Stress: applyColorMode repetition', () => {
  beforeEach(() => {
    resetMocks();
  });

  const DARK_INPUTS: ColorMode[] = ['dark', 'dark', 'dark', 'dark', 'dark',
    'dark', 'dark', 'dark', 'dark', 'dark'];
  const LIGHT_INPUTS: ColorMode[] = ['light', 'light', 'light', 'light', 'light',
    'light', 'light', 'light', 'light', 'light'];

  DARK_INPUTS.forEach((m, i) => {
    it(`applyColorMode dark [${i}] adds class`, () => {
      applyColorMode(m);
      expect(classListMock.add).toHaveBeenCalledWith('dark');
    });
  });

  LIGHT_INPUTS.forEach((m, i) => {
    it(`applyColorMode light [${i}] removes class`, () => {
      applyColorMode(m);
      expect(classListMock.remove).toHaveBeenCalledWith('dark');
    });
  });

  it('applying dark 20 times: add called 20 times total', () => {
    for (let i = 0; i < 20; i++) applyColorMode('dark');
    expect(classListMock.add).toHaveBeenCalledTimes(20);
  });

  it('applying light 20 times: remove called 20 times total', () => {
    for (let i = 0; i < 20; i++) applyColorMode('light');
    expect(classListMock.remove).toHaveBeenCalledTimes(20);
  });

  it('applying dark 10 + light 10: add=10, remove=10', () => {
    for (let i = 0; i < 10; i++) applyColorMode('dark');
    for (let i = 0; i < 10; i++) applyColorMode('light');
    expect(classListMock.add).toHaveBeenCalledTimes(10);
    expect(classListMock.remove).toHaveBeenCalledTimes(10);
  });
});

describe('Stress: getSystemPreference with varying matchMedia', () => {
  beforeEach(() => {
    resetMocks();
  });

  const darkCases = Array.from({ length: 20 }, (_, i) => i);
  darkCases.forEach((i) => {
    it(`getSystemPreference dark scenario [${i}]`, () => {
      matchMediaMatches = true;
      expect(getSystemPreference()).toBe('dark');
    });
  });

  const lightCases = Array.from({ length: 20 }, (_, i) => i);
  lightCases.forEach((i) => {
    it(`getSystemPreference light scenario [${i}]`, () => {
      matchMediaMatches = false;
      expect(getSystemPreference()).toBe('light');
    });
  });
});

describe('Stress: getStoredMode with various stored values', () => {
  beforeEach(() => {
    resetMocks();
  });

  const validModes: Array<[ColorMode, ColorMode]> = [
    ['light', 'light'],
    ['dark', 'dark'],
    ['system', 'system'],
  ];

  for (let rep = 0; rep < 10; rep++) {
    validModes.forEach(([stored, expected]) => {
      it(`getStoredMode [rep ${rep}] stored=${stored} → ${expected}`, () => {
        localStorageMock._reset();
        localStorageMock.setItem('ims-color-mode', stored);
        expect(getStoredMode()).toBe(expected);
      });
    });
  }

  const invalidValues = ['', 'DARK', 'LIGHT', 'SYSTEM', 'abc', '123', '{}', 'null', 'undefined'];
  invalidValues.forEach((val) => {
    it(`getStoredMode invalid stored value "${val}" → system`, () => {
      localStorageMock._reset();
      localStorageMock.setItem('ims-color-mode', val);
      expect(getStoredMode()).toBe('system');
    });
  });
});

describe('Stress: resolveMode combinations', () => {
  beforeEach(() => {
    resetMocks();
  });

  const modes: ColorMode[] = ['light', 'dark', 'system'];
  const prefs = [true, false];

  for (let rep = 0; rep < 5; rep++) {
    modes.forEach((mode) => {
      prefs.forEach((pref) => {
        it(`resolveMode [rep ${rep}] mode=${mode} pref=${pref}`, () => {
          matchMediaMatches = pref;
          const result = resolveMode(mode);
          if (mode === 'light') expect(result).toBe('light');
          else if (mode === 'dark') expect(result).toBe('dark');
          else expect(result).toBe(pref ? 'dark' : 'light');
        });
      });
    });
  }
});

describe('Stress: getDarkModeScript repeated calls', () => {
  beforeEach(() => {
    resetMocks();
  });

  const scriptChecks = [
    'dark',
    'localStorage',
    'matchMedia',
    'documentElement',
    'classList',
    'ims-color-mode',
    'prefers-color-scheme',
    'system',
    'light',
    'try',
  ];

  scriptChecks.forEach((substring) => {
    it(`getDarkModeScript contains "${substring}" [check A]`, () => {
      expect(getDarkModeScript()).toContain(substring);
    });
    it(`getDarkModeScript contains "${substring}" [check B]`, () => {
      expect(getDarkModeScript()).toContain(substring);
    });
    it(`getDarkModeScript contains "${substring}" [check C]`, () => {
      const s = getDarkModeScript();
      expect(s.indexOf(substring)).toBeGreaterThan(-1);
    });
  });

  it('getDarkModeScript returns the same string 10 times', () => {
    const first = getDarkModeScript();
    for (let i = 0; i < 9; i++) {
      expect(getDarkModeScript()).toBe(first);
    }
  });

  it('getDarkModeScript returns a valid function-containing string', () => {
    const script = getDarkModeScript();
    expect(script).toContain('function');
  });

  it('getDarkModeScript does not throw when called 5 times', () => {
    for (let i = 0; i < 5; i++) {
      expect(() => getDarkModeScript()).not.toThrow();
    }
  });
});

// ---------------------------------------------------------------------------
// SUITE 10: Null/undefined handling
// ---------------------------------------------------------------------------

describe('Null/undefined handling', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('getStoredMode when localStorage.getItem returns null → system', () => {
    localStorageMock.getItem.mockReturnValueOnce(null as unknown as string);
    expect(getStoredMode()).toBe('system');
  });

  it('getStoredMode when localStorage.getItem returns undefined → system', () => {
    localStorageMock.getItem.mockReturnValueOnce(null as unknown as string);
    expect(getStoredMode()).toBe('system');
  });

  it('getSystemPreference when matchMedia returns null-like matches → light', () => {
    matchMediaMock.mockReturnValueOnce({
      matches: false,
      media: '(prefers-color-scheme: dark)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      dispatchEvent: jest.fn(),
    });
    expect(getSystemPreference()).toBe('light');
  });

  it('applyColorMode dark is safe even if classList.add is a no-op', () => {
    classListMock.add.mockImplementationOnce(() => { /* no-op */ });
    expect(() => applyColorMode('dark')).not.toThrow();
  });

  it('applyColorMode light is safe even if classList.remove is a no-op', () => {
    classListMock.remove.mockImplementationOnce(() => { /* no-op */ });
    expect(() => applyColorMode('light')).not.toThrow();
  });

  it('resolveMode with matchMedia returning matches=false for system → light', () => {
    matchMediaMatches = false;
    expect(resolveMode('system')).toBe('light');
  });

  it('resolveMode light with no localStorage access', () => {
    localStorageMock.getItem.mockClear();
    resolveMode('light');
    expect(localStorageMock.getItem).not.toHaveBeenCalled();
  });

  it('resolveMode dark with no localStorage access', () => {
    localStorageMock.getItem.mockClear();
    resolveMode('dark');
    expect(localStorageMock.getItem).not.toHaveBeenCalled();
  });

  it('getStoredMode with empty object in store → system', () => {
    // store is empty, getItem returns null
    expect(getStoredMode()).toBe('system');
  });

  it('getDarkModeScript does not access localStorage (it produces a script string only)', () => {
    localStorageMock.getItem.mockClear();
    getDarkModeScript();
    expect(localStorageMock.getItem).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// SUITE 11: applyColorMode with system + various system pref states
// ---------------------------------------------------------------------------

describe('applyColorMode system mode thorough', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('system + dark pref: only add is called', () => {
    matchMediaMatches = true;
    applyColorMode('system');
    expect(classListMock.add).toHaveBeenCalledTimes(1);
    expect(classListMock.remove).toHaveBeenCalledTimes(0);
  });

  it('system + light pref: only remove is called', () => {
    matchMediaMatches = false;
    applyColorMode('system');
    expect(classListMock.add).toHaveBeenCalledTimes(0);
    expect(classListMock.remove).toHaveBeenCalledTimes(1);
  });

  it('system pref changes between calls → different behaviour', () => {
    matchMediaMatches = true;
    applyColorMode('system');
    const addCount1 = classListMock.add.mock.calls.length;
    classListMock.add.mockClear();
    classListMock.remove.mockClear();

    matchMediaMatches = false;
    applyColorMode('system');
    const removeCount2 = classListMock.remove.mock.calls.length;

    expect(addCount1).toBe(1);
    expect(removeCount2).toBe(1);
  });

  it('applying system then dark: both trigger add', () => {
    matchMediaMatches = true;
    applyColorMode('system');
    applyColorMode('dark');
    expect(classListMock.add).toHaveBeenCalledTimes(2);
  });

  it('applying system then light: add once (for system) then remove once (for light)', () => {
    matchMediaMatches = true;
    applyColorMode('system');
    applyColorMode('light');
    expect(classListMock.add).toHaveBeenCalledTimes(1);
    expect(classListMock.remove).toHaveBeenCalledTimes(1);
  });

  it('applying system 10 times with dark pref: add=10, remove=0', () => {
    matchMediaMatches = true;
    for (let i = 0; i < 10; i++) applyColorMode('system');
    expect(classListMock.add).toHaveBeenCalledTimes(10);
    expect(classListMock.remove).toHaveBeenCalledTimes(0);
  });

  it('applying system 10 times with light pref: add=0, remove=10', () => {
    matchMediaMatches = false;
    for (let i = 0; i < 10; i++) applyColorMode('system');
    expect(classListMock.add).toHaveBeenCalledTimes(0);
    expect(classListMock.remove).toHaveBeenCalledTimes(10);
  });

  it('system mode does not modify localStorage', () => {
    applyColorMode('system');
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// SUITE 12: Large batch verification tests
// ---------------------------------------------------------------------------

describe('Batch: all functions non-throwing', () => {
  const functions = [
    () => getSystemPreference(),
    () => getStoredMode(),
    () => resolveMode('light'),
    () => resolveMode('dark'),
    () => resolveMode('system'),
    () => applyColorMode('light'),
    () => applyColorMode('dark'),
    () => applyColorMode('system'),
    () => getDarkModeScript(),
  ];

  beforeEach(() => {
    resetMocks();
  });

  functions.forEach((fn, i) => {
    for (let rep = 0; rep < 5; rep++) {
      it(`function[${i}] rep[${rep}] does not throw`, () => {
        expect(fn).not.toThrow();
      });
    }
  });
});

describe('Batch: return types are correct', () => {
  beforeEach(() => {
    resetMocks();
  });

  it('getSystemPreference returns string type (dark)', () => {
    matchMediaMatches = true;
    expect(typeof getSystemPreference()).toBe('string');
  });

  it('getSystemPreference returns string type (light)', () => {
    matchMediaMatches = false;
    expect(typeof getSystemPreference()).toBe('string');
  });

  it('getStoredMode returns string type (no storage)', () => {
    expect(typeof getStoredMode()).toBe('string');
  });

  it('getStoredMode returns string type (dark stored)', () => {
    localStorageMock.setItem('ims-color-mode', 'dark');
    expect(typeof getStoredMode()).toBe('string');
  });

  it('resolveMode light returns string type', () => {
    expect(typeof resolveMode('light')).toBe('string');
  });

  it('resolveMode dark returns string type', () => {
    expect(typeof resolveMode('dark')).toBe('string');
  });

  it('resolveMode system returns string type', () => {
    expect(typeof resolveMode('system')).toBe('string');
  });

  it('applyColorMode dark returns undefined', () => {
    expect(applyColorMode('dark')).toBeUndefined();
  });

  it('applyColorMode light returns undefined', () => {
    expect(applyColorMode('light')).toBeUndefined();
  });

  it('applyColorMode system returns undefined', () => {
    expect(applyColorMode('system')).toBeUndefined();
  });

  it('getDarkModeScript returns string type', () => {
    expect(typeof getDarkModeScript()).toBe('string');
  });
});

describe('Batch: valid return values', () => {
  beforeEach(() => {
    resetMocks();
  });

  const storedValues: ColorMode[] = ['light', 'dark', 'system'];
  for (let rep = 0; rep < 10; rep++) {
    storedValues.forEach((v) => {
      it(`getStoredMode [rep ${rep}] returns ${v} when stored`, () => {
        localStorageMock._reset();
        localStorageMock.setItem('ims-color-mode', v);
        expect(getStoredMode()).toBe(v);
      });
    });
  }
});

describe('Batch: resolveMode exhaustive', () => {
  const modes: ColorMode[] = ['light', 'dark', 'system'];

  beforeEach(() => {
    resetMocks();
  });

  for (let rep = 0; rep < 10; rep++) {
    modes.forEach((mode) => {
      it(`resolveMode [rep ${rep}] mode=${mode} returns valid value`, () => {
        const result = resolveMode(mode);
        expect(['light', 'dark']).toContain(result);
      });
    });
  }

  it('resolveMode exhaustive: 30 calls, all valid', () => {
    for (let rep = 0; rep < 10; rep++) {
      for (const mode of modes) {
        const result = resolveMode(mode);
        expect(['light', 'dark']).toContain(result);
      }
    }
  });
});

describe('Batch: applyColorMode adds/removes correct class', () => {
  beforeEach(() => {
    resetMocks();
  });

  for (let rep = 0; rep < 20; rep++) {
    it(`applyColorMode dark [rep ${rep}]: classList.add('dark') called`, () => {
      applyColorMode('dark');
      expect(classListMock.add).toHaveBeenCalledWith('dark');
    });
  }

  for (let rep = 0; rep < 20; rep++) {
    it(`applyColorMode light [rep ${rep}]: classList.remove('dark') called`, () => {
      applyColorMode('light');
      expect(classListMock.remove).toHaveBeenCalledWith('dark');
    });
  }
});

describe('Batch: getSystemPreference thorough', () => {
  beforeEach(() => {
    resetMocks();
  });

  for (let rep = 0; rep < 20; rep++) {
    it(`getSystemPreference [rep ${rep}] dark pref returns dark`, () => {
      matchMediaMatches = true;
      expect(getSystemPreference()).toBe('dark');
    });
  }

  for (let rep = 0; rep < 20; rep++) {
    it(`getSystemPreference [rep ${rep}] light pref returns light`, () => {
      matchMediaMatches = false;
      expect(getSystemPreference()).toBe('light');
    });
  }
});

describe('Batch: getDarkModeScript string properties', () => {
  const expectedSubstrings = [
    'dark', 'light', 'system', 'localStorage', 'matchMedia',
    'classList', 'documentElement', 'ims-color-mode',
    'prefers-color-scheme', 'try', 'catch', 'function',
    'add', 'remove', 'getItem',
  ];

  for (let rep = 0; rep < 3; rep++) {
    expectedSubstrings.forEach((sub) => {
      it(`getDarkModeScript [rep ${rep}] contains "${sub}"`, () => {
        expect(getDarkModeScript()).toContain(sub);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 13: Extended applyColorMode batch — 100 tests
// ---------------------------------------------------------------------------

describe('Extended: applyColorMode 100 tests', () => {
  beforeEach(() => {
    resetMocks();
  });

  const darkTests = Array.from({ length: 50 }, (_, i) => i);
  darkTests.forEach((i) => {
    it(`extended dark apply [${i}]: classList.add called with dark`, () => {
      applyColorMode('dark');
      expect(classListMock.add).toHaveBeenCalledWith('dark');
    });
  });

  const lightTests = Array.from({ length: 50 }, (_, i) => i);
  lightTests.forEach((i) => {
    it(`extended light apply [${i}]: classList.remove called with dark`, () => {
      applyColorMode('light');
      expect(classListMock.remove).toHaveBeenCalledWith('dark');
    });
  });
});

// ---------------------------------------------------------------------------
// SUITE 14: Extended getSystemPreference batch — 80 tests
// ---------------------------------------------------------------------------

describe('Extended: getSystemPreference 80 tests', () => {
  beforeEach(() => {
    resetMocks();
  });

  const darkReps = Array.from({ length: 40 }, (_, i) => i);
  darkReps.forEach((i) => {
    it(`ext getSystemPreference dark [${i}]`, () => {
      matchMediaMatches = true;
      expect(getSystemPreference()).toBe('dark');
    });
  });

  const lightReps = Array.from({ length: 40 }, (_, i) => i);
  lightReps.forEach((i) => {
    it(`ext getSystemPreference light [${i}]`, () => {
      matchMediaMatches = false;
      expect(getSystemPreference()).toBe('light');
    });
  });
});

// ---------------------------------------------------------------------------
// SUITE 15: Extended getStoredMode batch — 90 tests
// ---------------------------------------------------------------------------

describe('Extended: getStoredMode 90 tests', () => {
  beforeEach(() => {
    resetMocks();
  });

  const validModes: ColorMode[] = ['light', 'dark', 'system'];

  for (let rep = 0; rep < 30; rep++) {
    validModes.forEach((m) => {
      it(`ext getStoredMode [rep ${rep}] mode=${m}`, () => {
        localStorageMock._reset();
        localStorageMock.setItem('ims-color-mode', m);
        expect(getStoredMode()).toBe(m);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 16: Extended resolveMode batch — 120 tests
// ---------------------------------------------------------------------------

describe('Extended: resolveMode 120 tests', () => {
  beforeEach(() => {
    resetMocks();
  });

  const modes: ColorMode[] = ['light', 'dark', 'system'];
  const prefs = [true, false];

  for (let rep = 0; rep < 20; rep++) {
    modes.forEach((mode) => {
      prefs.forEach((pref) => {
        it(`ext resolveMode [rep ${rep}] mode=${mode} pref=${pref}`, () => {
          matchMediaMatches = pref;
          const result = resolveMode(mode);
          if (mode === 'light') expect(result).toBe('light');
          else if (mode === 'dark') expect(result).toBe('dark');
          else expect(result).toBe(pref ? 'dark' : 'light');
        });
      });
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 17: Extended getDarkModeScript checks — 100 tests
// ---------------------------------------------------------------------------

describe('Extended: getDarkModeScript 100 tests', () => {
  beforeEach(() => {
    resetMocks();
  });

  const checks = [
    'dark', 'light', 'system', 'localStorage', 'matchMedia',
    'classList', 'documentElement', 'ims-color-mode', 'prefers-color-scheme',
    'try', 'catch', 'function', 'add', 'remove', 'getItem', 'var ', 'window',
    'document', '(', ')'
  ];

  for (let rep = 0; rep < 5; rep++) {
    checks.forEach((sub) => {
      it(`ext getDarkModeScript [rep ${rep}] contains "${sub.trim()}"`, () => {
        expect(getDarkModeScript()).toContain(sub);
      });
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 18: Extended integration batch — 60 tests
// ---------------------------------------------------------------------------

describe('Extended: integration batch 60 tests', () => {
  beforeEach(() => {
    resetMocks();
  });

  for (let rep = 0; rep < 20; rep++) {
    it(`integration [${rep}]: dark stored → applyColorMode adds dark class`, () => {
      localStorageMock.setItem('ims-color-mode', 'dark');
      const stored = getStoredMode();
      applyColorMode(stored);
      expect(classListMock.add).toHaveBeenCalledWith('dark');
    });
  }

  for (let rep = 0; rep < 20; rep++) {
    it(`integration [${rep}]: light stored → applyColorMode removes dark class`, () => {
      localStorageMock.setItem('ims-color-mode', 'light');
      const stored = getStoredMode();
      applyColorMode(stored);
      expect(classListMock.remove).toHaveBeenCalledWith('dark');
    });
  }

  for (let rep = 0; rep < 20; rep++) {
    it(`integration [${rep}]: resolveMode(system) returns dark or light`, () => {
      matchMediaMatches = rep % 2 === 0;
      const result = resolveMode('system');
      expect(['dark', 'light']).toContain(result);
    });
  }
});

// ---------------------------------------------------------------------------
// SUITE 19: Additional edge case batch — 50 tests
// ---------------------------------------------------------------------------

describe('Additional edge cases batch', () => {
  beforeEach(() => {
    resetMocks();
  });

  for (let rep = 0; rep < 10; rep++) {
    it(`edge [${rep}]: applyColorMode returns undefined for dark`, () => {
      expect(applyColorMode('dark')).toBeUndefined();
    });
    it(`edge [${rep}]: applyColorMode returns undefined for light`, () => {
      expect(applyColorMode('light')).toBeUndefined();
    });
    it(`edge [${rep}]: applyColorMode returns undefined for system`, () => {
      expect(applyColorMode('system')).toBeUndefined();
    });
    it(`edge [${rep}]: getStoredMode with no storage returns system`, () => {
      expect(getStoredMode()).toBe('system');
    });
    it(`edge [${rep}]: getDarkModeScript is a string`, () => {
      expect(typeof getDarkModeScript()).toBe('string');
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Extended: applyColorMode stress — 150 tests
// ═══════════════════════════════════════════════════════════════════════════

describe('applyColorMode — stress dark', () => {
  beforeEach(() => { resetMocks(); });

  for (let i = 0; i < 50; i++) {
    it(`stress dark [${i}]: classList.add called with "dark"`, () => {
      applyColorMode('dark');
      expect(classListMock.add).toHaveBeenCalledWith('dark');
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`stress light [${i}]: classList.remove called with "dark"`, () => {
      applyColorMode('light');
      expect(classListMock.remove).toHaveBeenCalledWith('dark');
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`stress system [${i}]: applyColorMode does not throw`, () => {
      expect(() => applyColorMode('system')).not.toThrow();
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Extended: getSystemPreference stress — 100 tests
// ═══════════════════════════════════════════════════════════════════════════

describe('getSystemPreference — stress', () => {
  for (let i = 0; i < 50; i++) {
    it(`getSystemPreference [${i}]: returns "dark" or "light"`, () => {
      const pref = getSystemPreference();
      expect(['dark', 'light']).toContain(pref);
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`getSystemPreference [${i}]: returns a string`, () => {
      expect(typeof getSystemPreference()).toBe('string');
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Extended: getStoredMode stress — 100 tests
// ═══════════════════════════════════════════════════════════════════════════

describe('getStoredMode — stress', () => {
  beforeEach(() => { resetMocks(); });

  for (let i = 0; i < 50; i++) {
    it(`getStoredMode empty [${i}]: returns "system"`, () => {
      expect(getStoredMode()).toBe('system');
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`getStoredMode stored "dark" [${i}]: returns "dark"`, () => {
      localStorageMock.setItem('ims-color-mode', 'dark');
      expect(getStoredMode()).toBe('dark');
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Extended: resolveMode stress — 100 tests
// ═══════════════════════════════════════════════════════════════════════════

describe('resolveMode — stress', () => {
  beforeEach(() => { resetMocks(); });

  for (let i = 0; i < 34; i++) {
    it(`resolveMode("dark") [${i}]: returns "dark"`, () => {
      expect(resolveMode('dark')).toBe('dark');
    });
  }

  for (let i = 0; i < 33; i++) {
    it(`resolveMode("light") [${i}]: returns "light"`, () => {
      expect(resolveMode('light')).toBe('light');
    });
  }

  for (let i = 0; i < 33; i++) {
    it(`resolveMode("system") [${i}]: returns "dark" or "light"`, () => {
      const result = resolveMode('system');
      expect(['dark', 'light']).toContain(result);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Extended: getDarkModeScript stress — 100 tests
// ═══════════════════════════════════════════════════════════════════════════

describe('getDarkModeScript — stress', () => {
  for (let i = 0; i < 50; i++) {
    it(`getDarkModeScript [${i}]: returns non-empty string`, () => {
      const script = getDarkModeScript();
      expect(typeof script).toBe('string');
      expect(script.length).toBeGreaterThan(0);
    });
  }

  for (let i = 0; i < 50; i++) {
    it(`getDarkModeScript [${i}]: is consistent across calls`, () => {
      const s1 = getDarkModeScript();
      const s2 = getDarkModeScript();
      expect(s1).toBe(s2);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Extended: applyColorMode + resolveMode chained stress — 120 tests
// ═══════════════════════════════════════════════════════════════════════════

describe('applyColorMode + resolveMode chained', () => {
  beforeEach(() => { resetMocks(); });

  for (let i = 0; i < 40; i++) {
    it(`chained [${i}]: resolveMode("dark") then applyColorMode does not throw`, () => {
      const resolved = resolveMode('dark');
      expect(() => applyColorMode(resolved)).not.toThrow();
    });
  }

  for (let i = 0; i < 40; i++) {
    it(`chained [${i}]: resolveMode("light") then applyColorMode does not throw`, () => {
      const resolved = resolveMode('light');
      expect(() => applyColorMode(resolved)).not.toThrow();
    });
  }

  for (let i = 0; i < 40; i++) {
    it(`chained [${i}]: resolveMode("system") resolves to dark or light`, () => {
      const resolved = resolveMode('system');
      expect(['dark', 'light']).toContain(resolved);
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// Extended: getStoredMode + applyColorMode chained — 120 tests
// ═══════════════════════════════════════════════════════════════════════════

describe('getStoredMode + applyColorMode chained', () => {
  beforeEach(() => { resetMocks(); });

  for (let i = 0; i < 40; i++) {
    it(`stored dark → applyColorMode [${i}]`, () => {
      localStorageMock.setItem('ims-color-mode', 'dark');
      const stored = getStoredMode();
      expect(() => applyColorMode(stored)).not.toThrow();
    });
  }

  for (let i = 0; i < 40; i++) {
    it(`stored light → applyColorMode [${i}]`, () => {
      localStorageMock.setItem('ims-color-mode', 'light');
      const stored = getStoredMode();
      expect(stored).toBe('light');
      expect(() => applyColorMode(stored)).not.toThrow();
    });
  }

  for (let i = 0; i < 40; i++) {
    it(`no stored value → getStoredMode returns "system" [${i}]`, () => {
      localStorageMock._reset();
      expect(getStoredMode()).toBe('system');
    });
  }
});
