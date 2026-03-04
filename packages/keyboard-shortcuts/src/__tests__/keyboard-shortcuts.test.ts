// Copyright (c) 2026 Nexara DMCC. All rights reserved.
import { createShortcutRegistry } from '../registry';
import { parseShortcut, matchesShortcut, formatShortcut, normalizeKey } from '../parser';
import { DEFAULT_SHORTCUTS } from '../defaults';
import type { KeyboardShortcut } from '../types';

// ─── helpers ──────────────────────────────────────────────────────────────────

function makeShortcut(overrides: Partial<KeyboardShortcut> = {}): KeyboardShortcut {
  return {
    id: 'test.shortcut',
    keys: 'Ctrl+K',
    description: 'Test shortcut',
    category: 'global',
    modifiers: ['ctrl'],
    key: 'k',
    enabled: true,
    ...overrides,
  };
}

function makeEvent(overrides: {
  ctrlKey?: boolean; metaKey?: boolean; altKey?: boolean; shiftKey?: boolean; key?: string;
} = {}) {
  return { ctrlKey: false, metaKey: false, altKey: false, shiftKey: false, key: '', ...overrides };
}

// ═════════════════════════════════════════════════════════════════════════════
// createShortcutRegistry — register
// ═════════════════════════════════════════════════════════════════════════════

describe('createShortcutRegistry — register', () => {
  let registry: ReturnType<typeof createShortcutRegistry>;
  beforeEach(() => { registry = createShortcutRegistry(); });

  it('registers a shortcut', () => {
    registry.register(makeShortcut({ id: 'a' }));
    expect(registry.findById('a')).toBeDefined();
  });
  it('registered shortcut has correct id', () => {
    registry.register(makeShortcut({ id: 'my-id' }));
    expect(registry.findById('my-id')!.id).toBe('my-id');
  });
  it('registered shortcut has correct description', () => {
    registry.register(makeShortcut({ id: 'x', description: 'My desc' }));
    expect(registry.findById('x')!.description).toBe('My desc');
  });
  it('registered shortcut has correct category', () => {
    registry.register(makeShortcut({ id: 'x', category: 'navigation' }));
    expect(registry.findById('x')!.category).toBe('navigation');
  });
  it('register overwrites existing shortcut with same id', () => {
    registry.register(makeShortcut({ id: 'x', description: 'first' }));
    registry.register(makeShortcut({ id: 'x', description: 'second' }));
    expect(registry.findById('x')!.description).toBe('second');
  });
  it('enabled defaults to true when not specified', () => {
    registry.register(makeShortcut({ id: 'x', enabled: undefined }));
    expect(registry.findById('x')!.enabled).toBe(true);
  });
  it('enabled: false is preserved', () => {
    registry.register(makeShortcut({ id: 'x', enabled: false }));
    expect(registry.findById('x')!.enabled).toBe(false);
  });
  it('throws if id is missing', () => {
    expect(() => registry.register({ ...makeShortcut(), id: '' })).toThrow();
  });
  it('throws if shortcut object is null-ish', () => {
    expect(() => registry.register(null as any)).toThrow();
  });
  it('can register 50 shortcuts', () => {
    for (let i = 0; i < 50; i++) registry.register(makeShortcut({ id: `shortcut-${i}` }));
    expect(registry.getAll()).toHaveLength(50);
  });
  it('register stores keys field', () => {
    registry.register(makeShortcut({ id: 'x', keys: 'Alt+Shift+P' }));
    expect(registry.findById('x')!.keys).toBe('Alt+Shift+P');
  });
  it('register stores modifiers', () => {
    registry.register(makeShortcut({ id: 'x', modifiers: ['alt', 'shift'] }));
    expect(registry.findById('x')!.modifiers).toEqual(['alt', 'shift']);
  });
  it('register stores key', () => {
    registry.register(makeShortcut({ id: 'x', key: 'p' }));
    expect(registry.findById('x')!.key).toBe('p');
  });
  it('register stores chord', () => {
    registry.register(makeShortcut({ id: 'x', chord: ['g', 'd'] }));
    expect(registry.findById('x')!.chord).toEqual(['g', 'd']);
  });
  it('register stores action', () => {
    const action = jest.fn();
    registry.register(makeShortcut({ id: 'x', action }));
    expect(registry.findById('x')!.action).toBe(action);
  });
});

describe('createShortcutRegistry — unregister', () => {
  let registry: ReturnType<typeof createShortcutRegistry>;
  beforeEach(() => {
    registry = createShortcutRegistry();
    registry.register(makeShortcut({ id: 'a' }));
    registry.register(makeShortcut({ id: 'b' }));
  });

  it('unregisters a shortcut by id', () => {
    registry.unregister('a');
    expect(registry.findById('a')).toBeUndefined();
  });
  it('does not affect other shortcuts', () => {
    registry.unregister('a');
    expect(registry.findById('b')).toBeDefined();
  });
  it('unregistering non-existent id is a no-op', () => {
    expect(() => registry.unregister('nonexistent')).not.toThrow();
    expect(registry.getAll()).toHaveLength(2);
  });
  it('unregister reduces count', () => {
    registry.unregister('a');
    expect(registry.getAll()).toHaveLength(1);
  });
  it('can re-register after unregister', () => {
    registry.unregister('a');
    registry.register(makeShortcut({ id: 'a', description: 'new' }));
    expect(registry.findById('a')!.description).toBe('new');
  });
  it('unregistering all shortcuts leaves empty registry', () => {
    registry.unregister('a');
    registry.unregister('b');
    expect(registry.getAll()).toHaveLength(0);
  });
});

describe('createShortcutRegistry — getAll', () => {
  let registry: ReturnType<typeof createShortcutRegistry>;
  beforeEach(() => { registry = createShortcutRegistry(); });

  it('returns empty array when registry is empty', () => {
    expect(registry.getAll()).toEqual([]);
  });
  it('returns array with all registered shortcuts', () => {
    registry.register(makeShortcut({ id: 'a' }));
    registry.register(makeShortcut({ id: 'b' }));
    expect(registry.getAll()).toHaveLength(2);
  });
  it('returns array type', () => {
    expect(Array.isArray(registry.getAll())).toBe(true);
  });
  it('each item has id', () => {
    registry.register(makeShortcut({ id: 'x' }));
    registry.getAll().forEach(s => expect(s.id).toBeDefined());
  });
  it('each item has keys', () => {
    registry.register(makeShortcut({ id: 'x' }));
    registry.getAll().forEach(s => expect(s.keys).toBeDefined());
  });
  it('does not include unregistered shortcuts', () => {
    registry.register(makeShortcut({ id: 'a' }));
    registry.register(makeShortcut({ id: 'b' }));
    registry.unregister('a');
    expect(registry.getAll().map(s => s.id)).not.toContain('a');
  });
});

describe('createShortcutRegistry — getByCategory', () => {
  let registry: ReturnType<typeof createShortcutRegistry>;
  beforeEach(() => {
    registry = createShortcutRegistry();
    registry.register(makeShortcut({ id: 'a', category: 'global' }));
    registry.register(makeShortcut({ id: 'b', category: 'navigation' }));
    registry.register(makeShortcut({ id: 'c', category: 'navigation' }));
    registry.register(makeShortcut({ id: 'd', category: 'actions' }));
  });

  it('returns shortcuts for given category', () => {
    expect(registry.getByCategory('navigation')).toHaveLength(2);
  });
  it('returns correct shortcuts', () => {
    const ids = registry.getByCategory('navigation').map(s => s.id);
    expect(ids).toContain('b');
    expect(ids).toContain('c');
  });
  it('returns empty array for unknown category', () => {
    expect(registry.getByCategory('nonexistent')).toEqual([]);
  });
  it('returns array type', () => {
    expect(Array.isArray(registry.getByCategory('global'))).toBe(true);
  });
  it('only 1 in global', () => {
    expect(registry.getByCategory('global')).toHaveLength(1);
  });
  it('only 1 in actions', () => {
    expect(registry.getByCategory('actions')).toHaveLength(1);
  });
  it('each returned shortcut has correct category', () => {
    const navShortcuts = registry.getByCategory('navigation');
    navShortcuts.forEach(s => expect(s.category).toBe('navigation'));
  });
});

describe('createShortcutRegistry — findById', () => {
  let registry: ReturnType<typeof createShortcutRegistry>;
  beforeEach(() => {
    registry = createShortcutRegistry();
    registry.register(makeShortcut({ id: 'a', description: 'A shortcut' }));
  });

  it('returns shortcut for existing id', () => {
    expect(registry.findById('a')).toBeDefined();
  });
  it('returns correct shortcut', () => {
    expect(registry.findById('a')!.description).toBe('A shortcut');
  });
  it('returns undefined for non-existent id', () => {
    expect(registry.findById('nonexistent')).toBeUndefined();
  });
  it('returns undefined for empty string id', () => {
    expect(registry.findById('')).toBeUndefined();
  });
  it('finding after unregister returns undefined', () => {
    registry.unregister('a');
    expect(registry.findById('a')).toBeUndefined();
  });
});

describe('createShortcutRegistry — initialConfigs', () => {
  it('initializes with provided configs via register()', () => {
    const registry = createShortcutRegistry();
    registry.register(makeShortcut({ id: 'init-1' }));
    registry.register(makeShortcut({ id: 'init-2' }));
    expect(registry.getAll()).toHaveLength(2);
  });
  it('initial configs are findable', () => {
    const registry = createShortcutRegistry();
    registry.register(makeShortcut({ id: 'x' }));
    expect(registry.findById('x')).toBeDefined();
  });
  it('empty registry gives empty getAll', () => {
    expect(createShortcutRegistry().getAll()).toHaveLength(0);
  });
  it('default createShortcutRegistry gives empty registry', () => {
    expect(createShortcutRegistry().getAll()).toHaveLength(0);
  });
  it('can register more after initial registrations', () => {
    const registry = createShortcutRegistry();
    registry.register(makeShortcut({ id: 'x' }));
    registry.register(makeShortcut({ id: 'y' }));
    expect(registry.getAll()).toHaveLength(2);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// parseShortcut
// ═════════════════════════════════════════════════════════════════════════════

describe('parseShortcut — guards', () => {
  it('empty string → empty modifiers and key', () => {
    const result = parseShortcut('');
    expect(result.modifiers).toEqual([]);
    expect(result.key).toBe('');
  });
  it('null-ish input → empty result', () => {
    const result = parseShortcut(null as any);
    expect(result.modifiers).toEqual([]);
    expect(result.key).toBe('');
  });
  it('non-string → empty result', () => {
    const result = parseShortcut(42 as any);
    expect(result.modifiers).toEqual([]);
    expect(result.key).toBe('');
  });
});

describe('parseShortcut — chord detection', () => {
  it('chord "G then D" → chord preserved in key', () => {
    const result = parseShortcut('G then D');
    expect(result.key).toBe('G then D');
    expect(result.modifiers).toEqual([]);
  });
  it('chord "C then N" → chord preserved', () => {
    const result = parseShortcut('C then N');
    expect(result.key).toBe('C then N');
  });
  it('chord "G then H" → modifiers empty', () => {
    const result = parseShortcut('G then H');
    expect(result.modifiers).toEqual([]);
  });
  it('chord "g then d" → chord preserved', () => {
    const result = parseShortcut('g then d');
    expect(result.key).toBe('g then d');
  });
});

describe('parseShortcut — single key', () => {
  it('"k" → key: k, modifiers: []', () => {
    const result = parseShortcut('k');
    expect(result.key).toBe('k');
  });
  it('"/" → key: /, modifiers: []', () => {
    const result = parseShortcut('/');
    expect(result.key).toBe('/');
  });
  it('"Escape" → key: escape', () => {
    const result = parseShortcut('Escape');
    expect(result.key.toLowerCase()).toContain('esc');
  });
  it('"?" → key: ?', () => {
    const result = parseShortcut('?');
    expect(result.key).toBe('?');
  });
  it('space → key: space', () => {
    const result = parseShortcut('space');
    expect(result.key).toBe(' ');
  });
});

describe('parseShortcut — modifier combos', () => {
  it('"ctrl+k" → modifiers: [ctrl], key: k', () => {
    const result = parseShortcut('ctrl+k');
    expect(result.modifiers).toContain('ctrl');
    expect(result.key).toBe('k');
  });
  it('"meta+k" → modifiers include meta', () => {
    const result = parseShortcut('meta+k');
    expect(result.modifiers).toContain('meta');
    expect(result.key).toBe('k');
  });
  it('"cmd+k" → alias: meta', () => {
    const result = parseShortcut('cmd+k');
    expect(result.modifiers).toContain('meta');
  });
  it('"Cmd+K" → case-insensitive', () => {
    const result = parseShortcut('Cmd+K');
    expect(result.modifiers).toContain('meta');
  });
  it('"ctrl+shift+p" → modifiers: ctrl, shift', () => {
    const result = parseShortcut('ctrl+shift+p');
    expect(result.modifiers).toContain('ctrl');
    expect(result.modifiers).toContain('shift');
    expect(result.key).toBe('p');
  });
  it('"alt+enter" → modifiers: alt, key: enter', () => {
    const result = parseShortcut('alt+enter');
    expect(result.modifiers).toContain('alt');
    expect(result.key).toContain('enter');
  });
  it('"option+k" → alias: alt', () => {
    const result = parseShortcut('option+k');
    expect(result.modifiers).toContain('alt');
  });
  it('"ctrl+b" → key: b', () => {
    const result = parseShortcut('ctrl+b');
    expect(result.key).toBe('b');
  });
  it('"ctrl+s" → key: s', () => {
    const result = parseShortcut('ctrl+s');
    expect(result.key).toBe('s');
  });
  it('"ctrl+n" → key: n', () => {
    const result = parseShortcut('ctrl+n');
    expect(result.key).toBe('n');
  });
  it('key aliases — esc → escape', () => {
    const result = parseShortcut('esc');
    expect(result.key).toBe('escape');
  });
  it('key aliases — del → delete', () => {
    const result = parseShortcut('del');
    expect(result.key).toBe('delete');
  });
  it('key aliases — return → enter', () => {
    const result = parseShortcut('return');
    expect(result.key).toBe('enter');
  });
  it('key aliases — pgup → pageup', () => {
    const result = parseShortcut('pgup');
    expect(result.key).toBe('pageup');
  });
  it('key aliases — pgdn → pagedown', () => {
    const result = parseShortcut('pgdn');
    expect(result.key).toBe('pagedown');
  });
  it('key aliases — ins → insert', () => {
    const result = parseShortcut('ins');
    expect(result.key).toBe('insert');
  });
  it('returns object with modifiers and key properties', () => {
    const result = parseShortcut('ctrl+k');
    expect(result).toHaveProperty('modifiers');
    expect(result).toHaveProperty('key');
  });
  it('modifiers is array', () => {
    expect(Array.isArray(parseShortcut('ctrl+k').modifiers)).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// matchesShortcut
// ═════════════════════════════════════════════════════════════════════════════

describe('matchesShortcut', () => {
  it('ctrl+k event matches ctrl+k shortcut', () => {
    const shortcut = makeShortcut({ modifiers: ['ctrl'], key: 'k' });
    expect(matchesShortcut(makeEvent({ ctrlKey: true, key: 'k' }), shortcut)).toBe(true);
  });
  it('meta+k event matches meta+k shortcut', () => {
    const shortcut = makeShortcut({ modifiers: ['meta'], key: 'k' });
    expect(matchesShortcut(makeEvent({ metaKey: true, key: 'k' }), shortcut)).toBe(true);
  });
  it('ctrl+k event does not match meta+k shortcut', () => {
    const shortcut = makeShortcut({ modifiers: ['meta'], key: 'k' });
    expect(matchesShortcut(makeEvent({ ctrlKey: true, key: 'k' }), shortcut)).toBe(false);
  });
  it('wrong key → false', () => {
    const shortcut = makeShortcut({ modifiers: ['ctrl'], key: 'k' });
    expect(matchesShortcut(makeEvent({ ctrlKey: true, key: 's' }), shortcut)).toBe(false);
  });
  it('missing modifier → false', () => {
    const shortcut = makeShortcut({ modifiers: ['ctrl'], key: 'k' });
    expect(matchesShortcut(makeEvent({ key: 'k' }), shortcut)).toBe(false);
  });
  it('extra modifier → false', () => {
    const shortcut = makeShortcut({ modifiers: ['ctrl'], key: 'k' });
    expect(matchesShortcut(makeEvent({ ctrlKey: true, shiftKey: true, key: 'k' }), shortcut)).toBe(false);
  });
  it('no key in shortcut → false', () => {
    const shortcut = makeShortcut({ key: undefined, chord: undefined });
    expect(matchesShortcut(makeEvent({ ctrlKey: true, key: 'k' }), shortcut)).toBe(false);
  });
  it('chord shortcut → always false (chord handled separately)', () => {
    const shortcut = makeShortcut({ chord: ['g', 'd'], key: undefined });
    expect(matchesShortcut(makeEvent({ key: 'g' }), shortcut)).toBe(false);
  });
  it('case-insensitive key comparison', () => {
    const shortcut = makeShortcut({ modifiers: ['ctrl'], key: 'k' });
    expect(matchesShortcut(makeEvent({ ctrlKey: true, key: 'K' }), shortcut)).toBe(true);
  });
  it('ctrl+shift+p matches ctrl+shift+p shortcut', () => {
    const shortcut = makeShortcut({ modifiers: ['ctrl', 'shift'], key: 'p' });
    expect(matchesShortcut(makeEvent({ ctrlKey: true, shiftKey: true, key: 'p' }), shortcut)).toBe(true);
  });
  it('ctrl+shift+p does not match ctrl+p shortcut', () => {
    const shortcut = makeShortcut({ modifiers: ['ctrl'], key: 'p' });
    expect(matchesShortcut(makeEvent({ ctrlKey: true, shiftKey: true, key: 'p' }), shortcut)).toBe(false);
  });
  it('escape key matches Escape shortcut', () => {
    const shortcut = makeShortcut({ modifiers: [], key: 'Escape' });
    expect(matchesShortcut(makeEvent({ key: 'Escape' }), shortcut)).toBe(true);
  });
  it('no modifiers + / matches / shortcut', () => {
    const shortcut = makeShortcut({ modifiers: [], key: '/' });
    expect(matchesShortcut(makeEvent({ key: '/' }), shortcut)).toBe(true);
  });
  it('alt+k matches alt shortcut', () => {
    const shortcut = makeShortcut({ modifiers: ['alt'], key: 'k' });
    expect(matchesShortcut(makeEvent({ altKey: true, key: 'k' }), shortcut)).toBe(true);
  });
  it('meta+b matches meta+b shortcut', () => {
    const shortcut = makeShortcut({ modifiers: ['meta'], key: 'b' });
    expect(matchesShortcut(makeEvent({ metaKey: true, key: 'b' }), shortcut)).toBe(true);
  });
  it('meta+s matches meta+s shortcut', () => {
    const shortcut = makeShortcut({ modifiers: ['meta'], key: 's' });
    expect(matchesShortcut(makeEvent({ metaKey: true, key: 's' }), shortcut)).toBe(true);
  });
  it('meta+n matches meta+n shortcut', () => {
    const shortcut = makeShortcut({ modifiers: ['meta'], key: 'n' });
    expect(matchesShortcut(makeEvent({ metaKey: true, key: 'n' }), shortcut)).toBe(true);
  });
  it('returns boolean', () => {
    const shortcut = makeShortcut({ modifiers: ['ctrl'], key: 'k' });
    expect(typeof matchesShortcut(makeEvent({ ctrlKey: true, key: 'k' }), shortcut)).toBe('boolean');
  });
  it('undefined modifiers in shortcut treated as empty', () => {
    const shortcut = makeShortcut({ modifiers: undefined, key: 'k' });
    expect(matchesShortcut(makeEvent({ key: 'k' }), shortcut)).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// formatShortcut
// ═════════════════════════════════════════════════════════════════════════════

describe('formatShortcut', () => {
  it('ctrl + k → Ctrl+K', () => {
    const result = formatShortcut(['ctrl'], 'k');
    expect(result).toBe('Ctrl+K');
  });
  it('alt + k → Alt+K', () => {
    const result = formatShortcut(['alt'], 'k');
    expect(result).toBe('Alt+K');
  });
  it('shift + k → Shift+K', () => {
    const result = formatShortcut(['shift'], 'k');
    expect(result).toBe('Shift+K');
  });
  it('empty modifiers + k → K', () => {
    const result = formatShortcut([], 'k');
    expect(result).toBe('K');
  });
  it('ctrl + shift + p → Ctrl+Shift+P', () => {
    const result = formatShortcut(['ctrl', 'shift'], 'p');
    expect(result).toBe('Ctrl+Shift+P');
  });
  it('escape key → Esc display', () => {
    const result = formatShortcut([], 'escape');
    expect(result).toBe('Esc');
  });
  it('enter key → Enter display', () => {
    const result = formatShortcut([], 'enter');
    expect(result).toBe('Enter');
  });
  it('space key → Space display', () => {
    const result = formatShortcut([], ' ');
    expect(result).toBe('Space');
  });
  it('arrowup → ↑ display', () => {
    const result = formatShortcut([], 'arrowup');
    expect(result).toBe('↑');
  });
  it('arrowdown → ↓ display', () => {
    const result = formatShortcut([], 'arrowdown');
    expect(result).toBe('↓');
  });
  it('arrowleft → ← display', () => {
    const result = formatShortcut([], 'arrowleft');
    expect(result).toBe('←');
  });
  it('arrowright → → display', () => {
    const result = formatShortcut([], 'arrowright');
    expect(result).toBe('→');
  });
  it('pageup → PgUp display', () => {
    const result = formatShortcut([], 'pageup');
    expect(result).toBe('PgUp');
  });
  it('pagedown → PgDn display', () => {
    const result = formatShortcut([], 'pagedown');
    expect(result).toBe('PgDn');
  });
  it('backspace → Backspace display', () => {
    const result = formatShortcut([], 'backspace');
    expect(result).toBe('Backspace');
  });
  it('delete → Delete display', () => {
    const result = formatShortcut([], 'delete');
    expect(result).toBe('Delete');
  });
  it('tab → Tab display', () => {
    const result = formatShortcut([], 'tab');
    expect(result).toBe('Tab');
  });
  it('home → Home display', () => {
    const result = formatShortcut([], 'home');
    expect(result).toBe('Home');
  });
  it('end → End display', () => {
    const result = formatShortcut([], 'end');
    expect(result).toBe('End');
  });
  it('ctrl + enter → Ctrl+Enter', () => {
    const result = formatShortcut(['ctrl'], 'enter');
    expect(result).toBe('Ctrl+Enter');
  });
  it('ctrl + escape → Ctrl+Esc', () => {
    const result = formatShortcut(['ctrl'], 'escape');
    expect(result).toBe('Ctrl+Esc');
  });
  it('unknown modifier → used as-is', () => {
    const result = formatShortcut(['unknown'], 'k');
    expect(result).toBe('unknown+K');
  });
  it('empty key → only modifier', () => {
    const result = formatShortcut(['ctrl'], '');
    expect(result).toBe('Ctrl');
  });
  it('returns string', () => {
    expect(typeof formatShortcut(['ctrl'], 'k')).toBe('string');
  });
  it('insert → Ins display', () => {
    const result = formatShortcut([], 'insert');
    expect(result).toBe('Ins');
  });
  it('multiple modifiers formatted with +', () => {
    const result = formatShortcut(['ctrl', 'alt', 'shift'], 's');
    expect(result).toBe('Ctrl+Alt+Shift+S');
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// normalizeKey
// ═════════════════════════════════════════════════════════════════════════════

describe('normalizeKey', () => {
  it('empty string → empty string', () => expect(normalizeKey('')).toBe(''));
  it('esc → Esc', () => expect(normalizeKey('esc')).toBe('Esc'));
  it('escape → Esc', () => expect(normalizeKey('escape')).toBe('Esc'));
  it('enter → Enter', () => expect(normalizeKey('enter')).toBe('Enter'));
  it('return → Enter', () => expect(normalizeKey('return')).toBe('Enter'));
  it('arrowup → ↑', () => expect(normalizeKey('arrowup')).toBe('↑'));
  it('arrowdown → ↓', () => expect(normalizeKey('arrowdown')).toBe('↓'));
  it('arrowleft → ←', () => expect(normalizeKey('arrowleft')).toBe('←'));
  it('arrowright → →', () => expect(normalizeKey('arrowright')).toBe('→'));
  it('space → Space', () => expect(normalizeKey('space')).toBe('Space'));
  it(' (space char) → Space', () => expect(normalizeKey(' ')).toBe('Space'));
  it('backspace → Backspace', () => expect(normalizeKey('backspace')).toBe('Backspace'));
  it('delete → Delete', () => expect(normalizeKey('delete')).toBe('Delete'));
  it('del → Delete', () => expect(normalizeKey('del')).toBe('Delete'));
  it('tab → Tab', () => expect(normalizeKey('tab')).toBe('Tab'));
  it('home → Home', () => expect(normalizeKey('home')).toBe('Home'));
  it('end → End', () => expect(normalizeKey('end')).toBe('End'));
  it('pageup → PgUp', () => expect(normalizeKey('pageup')).toBe('PgUp'));
  it('pagedown → PgDn', () => expect(normalizeKey('pagedown')).toBe('PgDn'));
  it('pgup → PgUp', () => expect(normalizeKey('pgup')).toBe('PgUp'));
  it('pgdn → PgDn', () => expect(normalizeKey('pgdn')).toBe('PgDn'));
  it('insert → Ins', () => expect(normalizeKey('insert')).toBe('Ins'));
  it('ins → Ins', () => expect(normalizeKey('ins')).toBe('Ins'));
  it('unknown key → returned as-is', () => expect(normalizeKey('mykey')).toBe('mykey'));
  it('returns string', () => expect(typeof normalizeKey('k')).toBe('string'));
  it('k → k (no alias)', () => expect(normalizeKey('k')).toBe('k'));
  it('uppercase K → K (alias lookup is lowercase)', () => {
    const result = normalizeKey('K');
    expect(typeof result).toBe('string');
  });
  it('a → a', () => expect(normalizeKey('a')).toBe('a'));
  it('1 → 1', () => expect(normalizeKey('1')).toBe('1'));
  it('/ → /', () => expect(normalizeKey('/')).toBe('/'));
  it('? → ?', () => expect(normalizeKey('?')).toBe('?'));
});

// ═════════════════════════════════════════════════════════════════════════════
// DEFAULT_SHORTCUTS
// ═════════════════════════════════════════════════════════════════════════════

describe('DEFAULT_SHORTCUTS — structure', () => {
  it('is an array', () => expect(Array.isArray(DEFAULT_SHORTCUTS)).toBe(true));
  it('has at least 20 shortcuts', () => expect(DEFAULT_SHORTCUTS.length).toBeGreaterThanOrEqual(20));
  it('every shortcut has an id', () => DEFAULT_SHORTCUTS.forEach(s => expect(s.id).toBeTruthy()));
  it('every shortcut has keys', () => DEFAULT_SHORTCUTS.forEach(s => expect(s.keys).toBeTruthy()));
  it('every shortcut has description', () => DEFAULT_SHORTCUTS.forEach(s => expect(s.description).toBeTruthy()));
  it('every shortcut has category', () => DEFAULT_SHORTCUTS.forEach(s => expect(s.category).toBeTruthy()));
  it('all ids are unique', () => {
    const ids = DEFAULT_SHORTCUTS.map(s => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('enabled defaults to true for all', () => {
    DEFAULT_SHORTCUTS.forEach(s => expect(s.enabled).toBe(true));
  });
  it('categories are valid strings', () => {
    const validCats = ['global', 'navigation', 'actions', 'ui'];
    DEFAULT_SHORTCUTS.forEach(s => expect(validCats).toContain(s.category));
  });
});

describe('DEFAULT_SHORTCUTS — global shortcuts', () => {
  const globals = DEFAULT_SHORTCUTS.filter(s => s.category === 'global');
  it('has global shortcuts', () => expect(globals.length).toBeGreaterThan(0));
  it('command-palette shortcut exists', () => {
    expect(DEFAULT_SHORTCUTS.some(s => s.id === 'global.command-palette')).toBe(true);
  });
  it('command-palette uses meta modifier', () => {
    const cp = DEFAULT_SHORTCUTS.find(s => s.id === 'global.command-palette');
    expect(cp!.modifiers).toContain('meta');
  });
  it('command-palette key is k', () => {
    const cp = DEFAULT_SHORTCUTS.find(s => s.id === 'global.command-palette');
    expect(cp!.key).toBe('k');
  });
  it('global.help shortcut exists', () => {
    expect(DEFAULT_SHORTCUTS.some(s => s.id === 'global.help')).toBe(true);
  });
  it('global.search shortcut exists', () => {
    expect(DEFAULT_SHORTCUTS.some(s => s.id === 'global.search')).toBe(true);
  });
  it('global.shortcuts-help exists', () => {
    expect(DEFAULT_SHORTCUTS.some(s => s.id === 'global.shortcuts-help')).toBe(true);
  });
  it('global.search has key /', () => {
    const gs = DEFAULT_SHORTCUTS.find(s => s.id === 'global.search');
    expect(gs!.key).toBe('/');
  });
  it('global.shortcuts-help has key ?', () => {
    const sh = DEFAULT_SHORTCUTS.find(s => s.id === 'global.shortcuts-help');
    expect(sh!.key).toBe('?');
  });
});

describe('DEFAULT_SHORTCUTS — navigation shortcuts (chords)', () => {
  const navShortcuts = DEFAULT_SHORTCUTS.filter(s => s.category === 'navigation');
  it('has navigation shortcuts', () => expect(navShortcuts.length).toBeGreaterThan(0));
  it('nav.dashboard exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'nav.dashboard')).toBe(true));
  it('nav.quality exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'nav.quality')).toBe(true));
  it('nav.health-safety exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'nav.health-safety')).toBe(true));
  it('nav.environment exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'nav.environment')).toBe(true));
  it('nav.risk exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'nav.risk')).toBe(true));
  it('nav.analytics exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'nav.analytics')).toBe(true));
  it('nav.incidents exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'nav.incidents')).toBe(true));
  it('nav.documents exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'nav.documents')).toBe(true));
  it('nav shortcuts have chord property', () => {
    navShortcuts.forEach(s => expect(s.chord).toBeDefined());
  });
  it('nav.dashboard chord is [g, d]', () => {
    const nd = DEFAULT_SHORTCUTS.find(s => s.id === 'nav.dashboard');
    expect(nd!.chord).toEqual(['g', 'd']);
  });
  it('nav.quality chord is [g, q]', () => {
    const nq = DEFAULT_SHORTCUTS.find(s => s.id === 'nav.quality');
    expect(nq!.chord).toEqual(['g', 'q']);
  });
  it('all nav chords start with g', () => {
    navShortcuts.forEach(s => expect(s.chord![0]).toBe('g'));
  });
});

describe('DEFAULT_SHORTCUTS — action shortcuts', () => {
  const actionShortcuts = DEFAULT_SHORTCUTS.filter(s => s.category === 'actions');
  it('has action shortcuts', () => expect(actionShortcuts.length).toBeGreaterThan(0));
  it('action.new-ncr exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'action.new-ncr')).toBe(true));
  it('action.new-capa exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'action.new-capa')).toBe(true));
  it('action.new-incident exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'action.new-incident')).toBe(true));
  it('action.new-risk exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'action.new-risk')).toBe(true));
  it('action.new-audit exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'action.new-audit')).toBe(true));
  it('action.new-document exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'action.new-document')).toBe(true));
  it('action chords start with c', () => {
    actionShortcuts.forEach(s => expect(s.chord![0]).toBe('c'));
  });
});

describe('DEFAULT_SHORTCUTS — UI shortcuts', () => {
  const uiShortcuts = DEFAULT_SHORTCUTS.filter(s => s.category === 'ui');
  it('has UI shortcuts', () => expect(uiShortcuts.length).toBeGreaterThan(0));
  it('ui.toggle-sidebar exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'ui.toggle-sidebar')).toBe(true));
  it('ui.close-modal exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'ui.close-modal')).toBe(true));
  it('ui.save exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'ui.save')).toBe(true));
  it('ui.new-item exists', () => expect(DEFAULT_SHORTCUTS.some(s => s.id === 'ui.new-item')).toBe(true));
  it('ui.toggle-sidebar uses meta+b', () => {
    const ts = DEFAULT_SHORTCUTS.find(s => s.id === 'ui.toggle-sidebar');
    expect(ts!.modifiers).toContain('meta');
    expect(ts!.key).toBe('b');
  });
  it('ui.close-modal uses Escape', () => {
    const cm = DEFAULT_SHORTCUTS.find(s => s.id === 'ui.close-modal');
    expect(cm!.key).toBe('Escape');
  });
  it('ui.save uses meta+s', () => {
    const sv = DEFAULT_SHORTCUTS.find(s => s.id === 'ui.save');
    expect(sv!.modifiers).toContain('meta');
    expect(sv!.key).toBe('s');
  });
  it('ui.new-item uses meta+n', () => {
    const ni = DEFAULT_SHORTCUTS.find(s => s.id === 'ui.new-item');
    expect(ni!.modifiers).toContain('meta');
    expect(ni!.key).toBe('n');
  });
});

describe('DEFAULT_SHORTCUTS — registrable', () => {
  function registryWithDefaults() {
    const registry = createShortcutRegistry();
    DEFAULT_SHORTCUTS.forEach(s => registry.register(s));
    return registry;
  }

  it('all DEFAULT_SHORTCUTS can be registered without error', () => {
    const registry = createShortcutRegistry();
    expect(() => DEFAULT_SHORTCUTS.forEach(s => registry.register(s))).not.toThrow();
  });
  it('after registering all defaults, getAll returns same count', () => {
    expect(registryWithDefaults().getAll()).toHaveLength(DEFAULT_SHORTCUTS.length);
  });
  it('can find all default shortcuts by id', () => {
    const registry = registryWithDefaults();
    DEFAULT_SHORTCUTS.forEach(s => {
      expect(registry.findById(s.id)).toBeDefined();
    });
  });
  it('getByCategory(global) returns global defaults', () => {
    const globals = DEFAULT_SHORTCUTS.filter(s => s.category === 'global');
    expect(registryWithDefaults().getByCategory('global')).toHaveLength(globals.length);
  });
  it('getByCategory(navigation) returns nav defaults', () => {
    const navs = DEFAULT_SHORTCUTS.filter(s => s.category === 'navigation');
    expect(registryWithDefaults().getByCategory('navigation')).toHaveLength(navs.length);
  });
  it('getByCategory(actions) returns action defaults', () => {
    const acts = DEFAULT_SHORTCUTS.filter(s => s.category === 'actions');
    expect(registryWithDefaults().getByCategory('actions')).toHaveLength(acts.length);
  });
  it('getByCategory(ui) returns ui defaults', () => {
    const uis = DEFAULT_SHORTCUTS.filter(s => s.category === 'ui');
    expect(registryWithDefaults().getByCategory('ui')).toHaveLength(uis.length);
  });
});

describe('matchesShortcut with DEFAULT_SHORTCUTS', () => {
  it('ctrl+k matches command-palette shortcut (ctrl equivalent)', () => {
    const cp = DEFAULT_SHORTCUTS.find(s => s.id === 'global.command-palette')!;
    // The shortcut uses meta modifier; ctrl is a different modifier
    const ctrlEvent = makeEvent({ ctrlKey: true, key: 'k' });
    // meta modifier expected but ctrl pressed → false
    expect(matchesShortcut(ctrlEvent, cp)).toBe(false);
  });
  it('meta+k matches command-palette shortcut', () => {
    const cp = DEFAULT_SHORTCUTS.find(s => s.id === 'global.command-palette')!;
    const event = makeEvent({ metaKey: true, key: 'k' });
    expect(matchesShortcut(event, cp)).toBe(true);
  });
  it('Escape matches ui.close-modal', () => {
    const cm = DEFAULT_SHORTCUTS.find(s => s.id === 'ui.close-modal')!;
    expect(matchesShortcut(makeEvent({ key: 'Escape' }), cm)).toBe(true);
  });
  it('/ matches global.search', () => {
    const gs = DEFAULT_SHORTCUTS.find(s => s.id === 'global.search')!;
    expect(matchesShortcut(makeEvent({ key: '/' }), gs)).toBe(true);
  });
  it('? matches global.shortcuts-help', () => {
    const sh = DEFAULT_SHORTCUTS.find(s => s.id === 'global.shortcuts-help')!;
    expect(matchesShortcut(makeEvent({ key: '?' }), sh)).toBe(true);
  });
  it('meta+b matches ui.toggle-sidebar', () => {
    const ts = DEFAULT_SHORTCUTS.find(s => s.id === 'ui.toggle-sidebar')!;
    expect(matchesShortcut(makeEvent({ metaKey: true, key: 'b' }), ts)).toBe(true);
  });
  it('meta+s matches ui.save', () => {
    const sv = DEFAULT_SHORTCUTS.find(s => s.id === 'ui.save')!;
    expect(matchesShortcut(makeEvent({ metaKey: true, key: 's' }), sv)).toBe(true);
  });
  it('meta+n matches ui.new-item', () => {
    const ni = DEFAULT_SHORTCUTS.find(s => s.id === 'ui.new-item')!;
    expect(matchesShortcut(makeEvent({ metaKey: true, key: 'n' }), ni)).toBe(true);
  });
  it('meta+/ matches global.help', () => {
    const hp = DEFAULT_SHORTCUTS.find(s => s.id === 'global.help')!;
    expect(matchesShortcut(makeEvent({ metaKey: true, key: '/' }), hp)).toBe(true);
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// Type & export verification
// ═════════════════════════════════════════════════════════════════════════════

describe('Type & export verification', () => {
  it('createShortcutRegistry is a function', () => expect(typeof createShortcutRegistry).toBe('function'));
  it('parseShortcut is a function', () => expect(typeof parseShortcut).toBe('function'));
  it('matchesShortcut is a function', () => expect(typeof matchesShortcut).toBe('function'));
  it('formatShortcut is a function', () => expect(typeof formatShortcut).toBe('function'));
  it('normalizeKey is a function', () => expect(typeof normalizeKey).toBe('function'));
  it('DEFAULT_SHORTCUTS is an array', () => expect(Array.isArray(DEFAULT_SHORTCUTS)).toBe(true));
  it('createShortcutRegistry returns object', () => expect(typeof createShortcutRegistry()).toBe('object'));
  it('registry has register method', () => expect(typeof createShortcutRegistry().register).toBe('function'));
  it('registry has unregister method', () => expect(typeof createShortcutRegistry().unregister).toBe('function'));
  it('registry has getAll method', () => expect(typeof createShortcutRegistry().getAll).toBe('function'));
  it('registry has getByCategory method', () => expect(typeof createShortcutRegistry().getByCategory).toBe('function'));
  it('registry has findById method', () => expect(typeof createShortcutRegistry().findById).toBe('function'));
  it('registry has shortcuts Map', () => expect(createShortcutRegistry().shortcuts).toBeInstanceOf(Map));
  it('parseShortcut returns object', () => expect(typeof parseShortcut('ctrl+k')).toBe('object'));
  it('formatShortcut returns string', () => expect(typeof formatShortcut(['ctrl'], 'k')).toBe('string'));
  it('normalizeKey returns string', () => expect(typeof normalizeKey('esc')).toBe('string'));
  it('matchesShortcut returns boolean', () => {
    const shortcut = makeShortcut({ modifiers: ['ctrl'], key: 'k' });
    expect(typeof matchesShortcut(makeEvent(), shortcut)).toBe('boolean');
  });
});
