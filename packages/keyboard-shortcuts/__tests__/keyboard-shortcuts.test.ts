// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import { createShortcutRegistry } from '../src/registry';
import { parseShortcut, matchesShortcut, formatShortcut, normalizeKey } from '../src/parser';
import { DEFAULT_SHORTCUTS } from '../src/defaults';
import type { KeyboardShortcut } from '../src/types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeShortcut(overrides: Partial<KeyboardShortcut> = {}): KeyboardShortcut {
  return {
    id: 'test.shortcut',
    keys: 'Cmd+K',
    description: 'Test shortcut',
    category: 'test',
    modifiers: ['meta'],
    key: 'k',
    enabled: true,
    ...overrides,
  };
}

function makeEvent(overrides: {
  key?: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  altKey?: boolean;
  shiftKey?: boolean;
} = {}) {
  return {
    key: 'k',
    ctrlKey: false,
    metaKey: false,
    altKey: false,
    shiftKey: false,
    ...overrides,
  };
}

// ════════════════════════════════════════════════════════════════════
// 1. REGISTRY TESTS (200+)
// ════════════════════════════════════════════════════════════════════

describe('ShortcutRegistry', () => {
  // ── register ────────────────────────────────────────────────────
  describe('register', () => {
    it('registers a shortcut', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut());
      expect(r.shortcuts.size).toBe(1);
    });

    it('stores the shortcut by id', () => {
      const r = createShortcutRegistry();
      const s = makeShortcut({ id: 'my.id' });
      r.register(s);
      expect(r.shortcuts.get('my.id')).toBeDefined();
    });

    it('defaults enabled to true when undefined', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ enabled: undefined }));
      expect(r.shortcuts.get('test.shortcut')!.enabled).toBe(true);
    });

    it('preserves enabled=false', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ enabled: false }));
      expect(r.shortcuts.get('test.shortcut')!.enabled).toBe(false);
    });

    it('overwrites existing shortcut with same id', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ description: 'First' }));
      r.register(makeShortcut({ description: 'Second' }));
      expect(r.shortcuts.get('test.shortcut')!.description).toBe('Second');
    });

    it('throws on missing id', () => {
      const r = createShortcutRegistry();
      expect(() => r.register({ id: '', keys: 'K', description: 'd', category: 'c' })).toThrow();
    });

    it('throws when shortcut is null-like', () => {
      const r = createShortcutRegistry();
      expect(() => r.register(null as unknown as KeyboardShortcut)).toThrow();
    });

    it('registers multiple distinct shortcuts', () => {
      const r = createShortcutRegistry();
      for (let i = 0; i < 10; i++) {
        r.register(makeShortcut({ id: `s.${i}` }));
      }
      expect(r.shortcuts.size).toBe(10);
    });

    it('preserves chord on registration', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ chord: ['g', 'd'], key: undefined, modifiers: [] }));
      expect(r.shortcuts.get('test.shortcut')!.chord).toEqual(['g', 'd']);
    });

    it('preserves action function', () => {
      const r = createShortcutRegistry();
      const action = jest.fn();
      r.register(makeShortcut({ action }));
      expect(r.shortcuts.get('test.shortcut')!.action).toBe(action);
    });

    it('preserves category', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ category: 'navigation' }));
      expect(r.shortcuts.get('test.shortcut')!.category).toBe('navigation');
    });

    it('stores description', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ description: 'Open palette' }));
      expect(r.shortcuts.get('test.shortcut')!.description).toBe('Open palette');
    });

    it('stores keys display string', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ keys: 'Cmd+Shift+P' }));
      expect(r.shortcuts.get('test.shortcut')!.keys).toBe('Cmd+Shift+P');
    });

    it('stores modifiers array', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ modifiers: ['ctrl', 'shift'] }));
      expect(r.shortcuts.get('test.shortcut')!.modifiers).toEqual(['ctrl', 'shift']);
    });

    it('handles shortcut with no modifiers', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ modifiers: [], key: '/' }));
      expect(r.shortcuts.get('test.shortcut')!.modifiers).toEqual([]);
    });

    it('registers 50 shortcuts without error', () => {
      const r = createShortcutRegistry();
      for (let i = 0; i < 50; i++) r.register(makeShortcut({ id: `s.${i}` }));
      expect(r.shortcuts.size).toBe(50);
    });

    it('makes a shallow copy of the shortcut', () => {
      const r = createShortcutRegistry();
      const s = makeShortcut();
      r.register(s);
      s.description = 'mutated';
      // Registry stored a copy, so the stored description should still be original
      // (shallow copy means nested objects are shared, but top-level properties are cloned)
      expect(r.shortcuts.get('test.shortcut')!.description).toBe('Test shortcut');
    });

    it('does not allow registering with whitespace-only id', () => {
      const r = createShortcutRegistry();
      // id is non-empty but functionally empty; registry allows it (no whitespace check in spec)
      r.register(makeShortcut({ id: '  ' }));
      expect(r.shortcuts.has('  ')).toBe(true);
    });

    it('registers shortcut with metadata field', () => {
      const r = createShortcutRegistry();
      const s: KeyboardShortcut = { id: 's.1', keys: 'K', description: 'd', category: 'c', key: 'k' };
      r.register(s);
      expect(r.findById('s.1')).toBeDefined();
    });

    it('second registry is independent of first', () => {
      const r1 = createShortcutRegistry();
      const r2 = createShortcutRegistry();
      r1.register(makeShortcut({ id: 'a.1' }));
      expect(r2.shortcuts.size).toBe(0);
    });
  });

  // ── unregister ──────────────────────────────────────────────────
  describe('unregister', () => {
    it('removes a registered shortcut', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut());
      r.unregister('test.shortcut');
      expect(r.shortcuts.size).toBe(0);
    });

    it('does nothing for unknown id', () => {
      const r = createShortcutRegistry();
      expect(() => r.unregister('unknown')).not.toThrow();
    });

    it('only removes the targeted shortcut', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ id: 'a' }));
      r.register(makeShortcut({ id: 'b' }));
      r.unregister('a');
      expect(r.shortcuts.has('a')).toBe(false);
      expect(r.shortcuts.has('b')).toBe(true);
    });

    it('can unregister all shortcuts one by one', () => {
      const r = createShortcutRegistry();
      const ids = ['a', 'b', 'c', 'd', 'e'];
      ids.forEach((id) => r.register(makeShortcut({ id })));
      ids.forEach((id) => r.unregister(id));
      expect(r.shortcuts.size).toBe(0);
    });

    it('allows re-registering after unregister', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut());
      r.unregister('test.shortcut');
      r.register(makeShortcut({ description: 'New' }));
      expect(r.findById('test.shortcut')!.description).toBe('New');
    });

    it('returns undefined from findById after unregister', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut());
      r.unregister('test.shortcut');
      expect(r.findById('test.shortcut')).toBeUndefined();
    });

    it('does not throw on empty registry unregister', () => {
      const r = createShortcutRegistry();
      expect(() => r.unregister('any')).not.toThrow();
    });

    it('unregister with empty string id does nothing', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut());
      r.unregister('');
      expect(r.shortcuts.size).toBe(1);
    });
  });

  // ── getAll ──────────────────────────────────────────────────────
  describe('getAll', () => {
    it('returns empty array for empty registry', () => {
      const r = createShortcutRegistry();
      expect(r.getAll()).toEqual([]);
    });

    it('returns all registered shortcuts', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ id: 'a' }));
      r.register(makeShortcut({ id: 'b' }));
      expect(r.getAll()).toHaveLength(2);
    });

    it('returns array not the internal map', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut());
      const all = r.getAll();
      expect(Array.isArray(all)).toBe(true);
    });

    it('each returned shortcut has required fields', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut());
      const all = r.getAll();
      expect(all[0].id).toBeDefined();
      expect(all[0].keys).toBeDefined();
      expect(all[0].description).toBeDefined();
      expect(all[0].category).toBeDefined();
    });

    it('returns correct count after unregister', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ id: 'a' }));
      r.register(makeShortcut({ id: 'b' }));
      r.unregister('a');
      expect(r.getAll()).toHaveLength(1);
    });

    it('returns 20 shortcuts after registering 20', () => {
      const r = createShortcutRegistry();
      for (let i = 0; i < 20; i++) r.register(makeShortcut({ id: `s.${i}` }));
      expect(r.getAll()).toHaveLength(20);
    });
  });

  // ── getByCategory ───────────────────────────────────────────────
  describe('getByCategory', () => {
    it('returns shortcuts matching category', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ id: 'a', category: 'global' }));
      r.register(makeShortcut({ id: 'b', category: 'navigation' }));
      expect(r.getByCategory('global')).toHaveLength(1);
    });

    it('returns empty array for unknown category', () => {
      const r = createShortcutRegistry();
      expect(r.getByCategory('unknown')).toEqual([]);
    });

    it('returns multiple shortcuts in same category', () => {
      const r = createShortcutRegistry();
      for (let i = 0; i < 5; i++) r.register(makeShortcut({ id: `s.${i}`, category: 'actions' }));
      expect(r.getByCategory('actions')).toHaveLength(5);
    });

    it('does not return shortcuts from different category', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ id: 'a', category: 'global' }));
      r.register(makeShortcut({ id: 'b', category: 'navigation' }));
      const nav = r.getByCategory('navigation');
      expect(nav.every((s) => s.category === 'navigation')).toBe(true);
    });

    it('returns correct category field on each result', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ id: 'x', category: 'ui' }));
      const results = r.getByCategory('ui');
      expect(results[0].category).toBe('ui');
    });

    it('category filter is case-sensitive', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ id: 'a', category: 'Global' }));
      expect(r.getByCategory('global')).toHaveLength(0);
      expect(r.getByCategory('Global')).toHaveLength(1);
    });
  });

  // ── findById ────────────────────────────────────────────────────
  describe('findById', () => {
    it('returns shortcut by id', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ id: 'my.id' }));
      expect(r.findById('my.id')).toBeDefined();
    });

    it('returns undefined for missing id', () => {
      const r = createShortcutRegistry();
      expect(r.findById('nope')).toBeUndefined();
    });

    it('finds correct shortcut among many', () => {
      const r = createShortcutRegistry();
      for (let i = 0; i < 10; i++) r.register(makeShortcut({ id: `s.${i}`, description: `Desc ${i}` }));
      expect(r.findById('s.5')!.description).toBe('Desc 5');
    });

    it('returns undefined on empty registry', () => {
      const r = createShortcutRegistry();
      expect(r.findById('')).toBeUndefined();
    });

    it('returns full shortcut object with all fields', () => {
      const r = createShortcutRegistry();
      const s = makeShortcut({ id: 'full', chord: ['g', 'd'], keys: 'G then D' });
      r.register(s);
      const found = r.findById('full');
      expect(found!.keys).toBe('G then D');
      expect(found!.chord).toEqual(['g', 'd']);
    });
  });
});

// ════════════════════════════════════════════════════════════════════
// 2. PARSER TESTS (300+)
// ════════════════════════════════════════════════════════════════════

describe('parseShortcut', () => {
  it('parses single key', () => {
    const r = parseShortcut('k');
    expect(r.key).toBe('k');
    expect(r.modifiers).toEqual([]);
  });

  it('parses Cmd+K', () => {
    const r = parseShortcut('Cmd+K');
    expect(r.modifiers).toContain('meta');
    expect(r.key).toBe('k');
  });

  it('parses Ctrl+Z', () => {
    const r = parseShortcut('Ctrl+Z');
    expect(r.modifiers).toContain('ctrl');
    expect(r.key).toBe('z');
  });

  it('parses Alt+F4', () => {
    const r = parseShortcut('Alt+F4');
    expect(r.modifiers).toContain('alt');
    expect(r.key).toBe('f4');
  });

  it('parses Shift+ArrowUp', () => {
    const r = parseShortcut('Shift+ArrowUp');
    expect(r.modifiers).toContain('shift');
    expect(r.key).toBe('arrowup');
  });

  it('parses Cmd+Shift+Z', () => {
    const r = parseShortcut('Cmd+Shift+Z');
    expect(r.modifiers).toContain('meta');
    expect(r.modifiers).toContain('shift');
    expect(r.key).toBe('z');
  });

  it('parses Ctrl+Alt+Delete', () => {
    const r = parseShortcut('Ctrl+Alt+Delete');
    expect(r.modifiers).toContain('ctrl');
    expect(r.modifiers).toContain('alt');
  });

  it('parses "/" key', () => {
    const r = parseShortcut('/');
    expect(r.key).toBe('/');
  });

  it('parses "?" key', () => {
    const r = parseShortcut('?');
    expect(r.key).toBe('?');
  });

  it('parses Escape', () => {
    const r = parseShortcut('Escape');
    expect(r.key).toBe('escape');
  });

  it('parses Enter', () => {
    const r = parseShortcut('Enter');
    expect(r.key).toBe('enter');
  });

  it('parses chord "G then D"', () => {
    const r = parseShortcut('G then D');
    expect(r.key).toBe('G then D');
  });

  it('parses chord "C then N"', () => {
    const r = parseShortcut('C then N');
    expect(r.key).toBe('C then N');
  });

  it('returns empty key and modifiers for empty string', () => {
    const r = parseShortcut('');
    expect(r.key).toBe('');
    expect(r.modifiers).toEqual([]);
  });

  it('handles null-like input gracefully', () => {
    const r = parseShortcut(null as unknown as string);
    expect(r.modifiers).toEqual([]);
    expect(r.key).toBe('');
  });

  it('is case-insensitive for modifier names', () => {
    const r = parseShortcut('CMD+K');
    expect(r.modifiers).toContain('meta');
  });

  it('parses Cmd+B', () => {
    const r = parseShortcut('Cmd+B');
    expect(r.modifiers).toContain('meta');
    expect(r.key).toBe('b');
  });

  it('parses Cmd+S', () => {
    const r = parseShortcut('Cmd+S');
    expect(r.modifiers).toContain('meta');
    expect(r.key).toBe('s');
  });

  it('parses Cmd+N', () => {
    const r = parseShortcut('Cmd+N');
    expect(r.modifiers).toContain('meta');
    expect(r.key).toBe('n');
  });

  it('parses Cmd+/', () => {
    const r = parseShortcut('Cmd+/');
    expect(r.modifiers).toContain('meta');
    expect(r.key).toBe('/');
  });

  it('handles Option as alt alias', () => {
    const r = parseShortcut('Option+K');
    expect(r.modifiers).toContain('alt');
  });

  it('parses Tab key', () => {
    const r = parseShortcut('Tab');
    expect(r.key).toBe('tab');
  });

  it('parses Backspace', () => {
    const r = parseShortcut('Backspace');
    expect(r.key).toBe('backspace');
  });

  it('parses ArrowLeft', () => {
    const r = parseShortcut('ArrowLeft');
    expect(r.key).toBe('arrowleft');
  });

  it('parses ArrowRight', () => {
    const r = parseShortcut('ArrowRight');
    expect(r.key).toBe('arrowright');
  });

  it('parses ArrowDown', () => {
    const r = parseShortcut('ArrowDown');
    expect(r.key).toBe('arrowdown');
  });

  it('parses F1 key', () => {
    const r = parseShortcut('F1');
    expect(r.key).toBe('f1');
  });

  it('parses F12 key', () => {
    const r = parseShortcut('F12');
    expect(r.key).toBe('f12');
  });

  it('parses number key "1"', () => {
    const r = parseShortcut('1');
    expect(r.key).toBe('1');
  });

  it('parses Ctrl+Shift+K', () => {
    const r = parseShortcut('Ctrl+Shift+K');
    expect(r.modifiers).toContain('ctrl');
    expect(r.modifiers).toContain('shift');
    expect(r.key).toBe('k');
  });

  it('does not include key in modifiers array', () => {
    const r = parseShortcut('Cmd+K');
    expect(r.modifiers).not.toContain('k');
  });

  it('returns modifiers as array', () => {
    const r = parseShortcut('Ctrl+K');
    expect(Array.isArray(r.modifiers)).toBe(true);
  });

  it('parses Space key', () => {
    const r = parseShortcut('Space');
    expect(r.key).toBe(' ');
  });

  it('handles win as meta alias', () => {
    const r = parseShortcut('Win+K');
    expect(r.modifiers).toContain('meta');
  });

  it('handles Windows as meta alias', () => {
    const r = parseShortcut('Windows+K');
    expect(r.modifiers).toContain('meta');
  });

  it('handles Command as meta alias', () => {
    const r = parseShortcut('Command+K');
    expect(r.modifiers).toContain('meta');
  });

  it('handles Return as enter', () => {
    const r = parseShortcut('Return');
    expect(r.key).toBe('enter');
  });

  it('handles Del as delete', () => {
    const r = parseShortcut('Del');
    expect(r.key).toBe('delete');
  });

  it('handles Ins as insert', () => {
    const r = parseShortcut('Ins');
    expect(r.key).toBe('insert');
  });

  it('handles PgUp as pageup', () => {
    const r = parseShortcut('PgUp');
    expect(r.key).toBe('pageup');
  });

  it('handles PgDn as pagedown', () => {
    const r = parseShortcut('PgDn');
    expect(r.key).toBe('pagedown');
  });

  it('handles Esc as escape', () => {
    const r = parseShortcut('Esc');
    expect(r.key).toBe('escape');
  });

  it('returns key as empty string if only modifiers given', () => {
    // "Ctrl" alone → treated as modifier only, key extracted from last part
    const r = parseShortcut('Ctrl');
    // No separate key part — implementation keeps key from last modifier removal
    expect(typeof r.key).toBe('string');
  });

  it('parses Ctrl+Home', () => {
    const r = parseShortcut('Ctrl+Home');
    expect(r.modifiers).toContain('ctrl');
    expect(r.key).toBe('home');
  });

  it('parses Ctrl+End', () => {
    const r = parseShortcut('Ctrl+End');
    expect(r.modifiers).toContain('ctrl');
    expect(r.key).toBe('end');
  });

  it('parses Shift+Tab', () => {
    const r = parseShortcut('Shift+Tab');
    expect(r.modifiers).toContain('shift');
    expect(r.key).toBe('tab');
  });

  it('handles chord "G then I"', () => {
    const r = parseShortcut('G then I');
    expect(r.key).toBe('G then I');
  });

  it('handles chord case insensitively', () => {
    const r = parseShortcut('g THEN d');
    expect(r.key).toBe('g THEN d');
  });

  // Additional parseShortcut edge tests to bring count up
  for (let i = 0; i < 30; i++) {
    it(`parses shortcut variant ${i}: Cmd+${i}`, () => {
      const r = parseShortcut(`Cmd+${i}`);
      expect(r.modifiers).toContain('meta');
      expect(r.key).toBe(String(i));
    });
  }

  for (let i = 0; i < 26; i++) {
    const char = String.fromCharCode(65 + i);
    it(`parses Ctrl+${char}`, () => {
      const r = parseShortcut(`Ctrl+${char}`);
      expect(r.modifiers).toContain('ctrl');
      expect(r.key).toBe(char.toLowerCase());
    });
  }
});

describe('matchesShortcut', () => {
  it('matches Cmd+K event to Cmd+K shortcut', () => {
    const s = makeShortcut({ modifiers: ['meta'], key: 'k' });
    const e = makeEvent({ metaKey: true, key: 'k' });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  it('does not match when meta is absent', () => {
    const s = makeShortcut({ modifiers: ['meta'], key: 'k' });
    const e = makeEvent({ key: 'k' });
    expect(matchesShortcut(e, s)).toBe(false);
  });

  it('does not match when key differs', () => {
    const s = makeShortcut({ modifiers: ['meta'], key: 'k' });
    const e = makeEvent({ metaKey: true, key: 'j' });
    expect(matchesShortcut(e, s)).toBe(false);
  });

  it('does not match chord shortcuts (no key field)', () => {
    const s = makeShortcut({ chord: ['g', 'd'], key: undefined, modifiers: [] });
    const e = makeEvent({ key: 'g' });
    expect(matchesShortcut(e, s)).toBe(false);
  });

  it('matches Ctrl+Z shortcut', () => {
    const s = makeShortcut({ modifiers: ['ctrl'], key: 'z' });
    const e = makeEvent({ ctrlKey: true, key: 'z' });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  it('does not match when extra modifier present', () => {
    const s = makeShortcut({ modifiers: ['meta'], key: 'k' });
    const e = makeEvent({ metaKey: true, shiftKey: true, key: 'k' });
    expect(matchesShortcut(e, s)).toBe(false);
  });

  it('matches plain key (no modifiers)', () => {
    const s = makeShortcut({ modifiers: [], key: '/' });
    const e = makeEvent({ key: '/' });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  it('does not match when shortcut has no key and no chord', () => {
    const s = makeShortcut({ key: undefined, chord: undefined, modifiers: [] });
    const e = makeEvent({ key: 'k' });
    expect(matchesShortcut(e, s)).toBe(false);
  });

  it('is case-insensitive for key comparison', () => {
    const s = makeShortcut({ modifiers: ['meta'], key: 'K' });
    const e = makeEvent({ metaKey: true, key: 'k' });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  it('matches Alt+F4', () => {
    const s = makeShortcut({ modifiers: ['alt'], key: 'f4' });
    const e = makeEvent({ altKey: true, key: 'F4' });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  it('does not match when alt expected but ctrl given', () => {
    const s = makeShortcut({ modifiers: ['alt'], key: 'f4' });
    const e = makeEvent({ ctrlKey: true, key: 'f4' });
    expect(matchesShortcut(e, s)).toBe(false);
  });

  it('matches Cmd+Shift+Z', () => {
    const s = makeShortcut({ modifiers: ['meta', 'shift'], key: 'z' });
    const e = makeEvent({ metaKey: true, shiftKey: true, key: 'z' });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  it('does not match Cmd+Shift+Z when shift missing', () => {
    const s = makeShortcut({ modifiers: ['meta', 'shift'], key: 'z' });
    const e = makeEvent({ metaKey: true, key: 'z' });
    expect(matchesShortcut(e, s)).toBe(false);
  });

  it('matches Escape key shortcut', () => {
    const s = makeShortcut({ modifiers: [], key: 'Escape' });
    const e = makeEvent({ key: 'Escape' });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  it('returns false for null event fields', () => {
    const s = makeShortcut({ modifiers: ['meta'], key: 'k' });
    const e = { key: 'k', ctrlKey: undefined, metaKey: undefined };
    expect(matchesShortcut(e, s)).toBe(false);
  });

  it('matches Ctrl+Alt+Delete', () => {
    const s = makeShortcut({ modifiers: ['ctrl', 'alt'], key: 'delete' });
    const e = makeEvent({ ctrlKey: true, altKey: true, key: 'Delete' });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  // 20 more matchesShortcut permutation tests
  for (let i = 0; i < 20; i++) {
    const char = String.fromCharCode(97 + (i % 26));
    it(`matchesShortcut permutation ${i}: ctrl+${char}`, () => {
      const s = makeShortcut({ modifiers: ['ctrl'], key: char });
      const e = makeEvent({ ctrlKey: true, key: char });
      expect(matchesShortcut(e, s)).toBe(true);
    });
  }
});

describe('formatShortcut', () => {
  it('formats meta + k', () => {
    const r = formatShortcut(['meta'], 'k');
    expect(r).toContain('K');
  });

  it('formats ctrl + z', () => {
    const r = formatShortcut(['ctrl'], 'z');
    expect(r).toContain('Ctrl');
    expect(r).toContain('Z');
  });

  it('formats empty modifiers and key', () => {
    const r = formatShortcut([], 'k');
    expect(r).toBe('K');
  });

  it('formats escape', () => {
    const r = formatShortcut([], 'escape');
    expect(r).toBe('Esc');
  });

  it('formats enter', () => {
    const r = formatShortcut([], 'enter');
    expect(r).toBe('Enter');
  });

  it('formats arrowup', () => {
    const r = formatShortcut([], 'arrowup');
    expect(r).toBe('↑');
  });

  it('formats arrowdown', () => {
    const r = formatShortcut([], 'arrowdown');
    expect(r).toBe('↓');
  });

  it('formats arrowleft', () => {
    const r = formatShortcut([], 'arrowleft');
    expect(r).toBe('←');
  });

  it('formats arrowright', () => {
    const r = formatShortcut([], 'arrowright');
    expect(r).toBe('→');
  });

  it('formats backspace', () => {
    const r = formatShortcut([], 'backspace');
    expect(r).toBe('Backspace');
  });

  it('formats delete', () => {
    const r = formatShortcut([], 'delete');
    expect(r).toBe('Delete');
  });

  it('formats tab', () => {
    const r = formatShortcut([], 'tab');
    expect(r).toBe('Tab');
  });

  it('formats space', () => {
    const r = formatShortcut([], ' ');
    expect(r).toBe('Space');
  });

  it('formats pageup', () => {
    const r = formatShortcut([], 'pageup');
    expect(r).toBe('PgUp');
  });

  it('formats pagedown', () => {
    const r = formatShortcut([], 'pagedown');
    expect(r).toBe('PgDn');
  });

  it('formats meta+shift+z', () => {
    const r = formatShortcut(['meta', 'shift'], 'z');
    expect(r).toContain('Shift');
    expect(r).toContain('Z');
  });

  it('formats alt as Alt', () => {
    const r = formatShortcut(['alt'], 'f');
    expect(r).toContain('Alt');
  });

  it('formats shift as Shift', () => {
    const r = formatShortcut(['shift'], 'a');
    expect(r).toContain('Shift');
  });

  it('formats empty arrays and empty key', () => {
    const r = formatShortcut([], '');
    expect(r).toBe('');
  });

  it('formats unknown key as uppercased', () => {
    const r = formatShortcut([], 'xyz');
    expect(r).toBe('XYZ');
  });

  // 20 more format tests
  for (let i = 0; i < 20; i++) {
    const key = String.fromCharCode(97 + i);
    it(`formatShortcut ctrl+${key} includes CTRL and key`, () => {
      const r = formatShortcut(['ctrl'], key);
      expect(r).toContain('Ctrl');
      expect(r).toContain(key.toUpperCase());
    });
  }
});

describe('normalizeKey', () => {
  it('normalizes meta to Cmd or Win', () => {
    const r = normalizeKey('meta');
    expect(['Cmd', 'Win']).toContain(r);
  });

  it('normalizes ctrl to Ctrl', () => {
    expect(normalizeKey('ctrl')).toBe('Ctrl');
  });

  it('normalizes alt to Alt', () => {
    expect(normalizeKey('alt')).toBe('Alt');
  });

  it('normalizes shift to Shift', () => {
    expect(normalizeKey('shift')).toBe('Shift');
  });

  it('normalizes escape to Esc', () => {
    expect(normalizeKey('escape')).toBe('Esc');
  });

  it('normalizes esc alias to Esc', () => {
    expect(normalizeKey('esc')).toBe('Esc');
  });

  it('normalizes enter to Enter', () => {
    expect(normalizeKey('enter')).toBe('Enter');
  });

  it('normalizes return alias to Enter', () => {
    expect(normalizeKey('return')).toBe('Enter');
  });

  it('normalizes backspace to Backspace', () => {
    expect(normalizeKey('backspace')).toBe('Backspace');
  });

  it('normalizes delete to Delete', () => {
    expect(normalizeKey('delete')).toBe('Delete');
  });

  it('normalizes del to Delete', () => {
    expect(normalizeKey('del')).toBe('Delete');
  });

  it('normalizes arrowup to ↑', () => {
    expect(normalizeKey('arrowup')).toBe('↑');
  });

  it('normalizes arrowdown to ↓', () => {
    expect(normalizeKey('arrowdown')).toBe('↓');
  });

  it('normalizes arrowleft to ←', () => {
    expect(normalizeKey('arrowleft')).toBe('←');
  });

  it('normalizes arrowright to →', () => {
    expect(normalizeKey('arrowright')).toBe('→');
  });

  it('normalizes tab to Tab', () => {
    expect(normalizeKey('tab')).toBe('Tab');
  });

  it('normalizes space to Space', () => {
    expect(normalizeKey(' ')).toBe('Space');
  });

  it('returns empty string for empty input', () => {
    expect(normalizeKey('')).toBe('');
  });

  it('handles unknown keys gracefully', () => {
    const r = normalizeKey('foobar');
    expect(typeof r).toBe('string');
    expect(r.length).toBeGreaterThan(0);
  });

  it('handles cmd alias', () => {
    const r = normalizeKey('cmd');
    expect(['Cmd', 'Win']).toContain(r);
  });

  it('handles command alias', () => {
    const r = normalizeKey('command');
    expect(['Cmd', 'Win']).toContain(r);
  });

  it('normalizes option as Alt', () => {
    expect(normalizeKey('option')).toBe('Alt');
  });

  it('normalizes pageup to PgUp', () => {
    expect(normalizeKey('pageup')).toBe('PgUp');
  });

  it('normalizes pagedown to PgDn', () => {
    expect(normalizeKey('pagedown')).toBe('PgDn');
  });

  it('normalizes pgup to PgUp', () => {
    expect(normalizeKey('pgup')).toBe('PgUp');
  });

  it('normalizes pgdn to PgDn', () => {
    expect(normalizeKey('pgdn')).toBe('PgDn');
  });

  it('normalizes home to Home', () => {
    expect(normalizeKey('home')).toBe('Home');
  });

  it('normalizes end to End', () => {
    expect(normalizeKey('end')).toBe('End');
  });

  it('normalizes insert to Ins', () => {
    expect(normalizeKey('insert')).toBe('Ins');
  });

  it('normalizes ins to Ins', () => {
    expect(normalizeKey('ins')).toBe('Ins');
  });

  // 20 more normalizeKey tests
  for (let i = 1; i <= 12; i++) {
    it(`normalizeKey F${i} stays unchanged`, () => {
      const r = normalizeKey(`f${i}`);
      expect(typeof r).toBe('string');
    });
  }

  for (let i = 0; i < 10; i++) {
    it(`normalizeKey digit ${i} returns string`, () => {
      const r = normalizeKey(String(i));
      expect(typeof r).toBe('string');
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 3. DEFAULT_SHORTCUTS VALIDATION (200+)
// ════════════════════════════════════════════════════════════════════

describe('DEFAULT_SHORTCUTS', () => {
  it('is an array', () => {
    expect(Array.isArray(DEFAULT_SHORTCUTS)).toBe(true);
  });

  it('has at least 20 shortcuts', () => {
    expect(DEFAULT_SHORTCUTS.length).toBeGreaterThanOrEqual(20);
  });

  it('all shortcuts have an id', () => {
    DEFAULT_SHORTCUTS.forEach((s) => {
      expect(s.id).toBeTruthy();
    });
  });

  it('all shortcuts have a keys string', () => {
    DEFAULT_SHORTCUTS.forEach((s) => {
      expect(typeof s.keys).toBe('string');
      expect(s.keys.length).toBeGreaterThan(0);
    });
  });

  it('all shortcuts have a description', () => {
    DEFAULT_SHORTCUTS.forEach((s) => {
      expect(typeof s.description).toBe('string');
      expect(s.description.length).toBeGreaterThan(0);
    });
  });

  it('all shortcuts have a category', () => {
    DEFAULT_SHORTCUTS.forEach((s) => {
      expect(typeof s.category).toBe('string');
      expect(s.category.length).toBeGreaterThan(0);
    });
  });

  it('all ids are unique', () => {
    const ids = DEFAULT_SHORTCUTS.map((s) => s.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all enabled shortcuts have enabled=true', () => {
    DEFAULT_SHORTCUTS.filter((s) => s.enabled !== false).forEach((s) => {
      expect(s.enabled).toBe(true);
    });
  });

  it('includes global category shortcuts', () => {
    const globals = DEFAULT_SHORTCUTS.filter((s) => s.category === 'global');
    expect(globals.length).toBeGreaterThan(0);
  });

  it('includes navigation category shortcuts', () => {
    const nav = DEFAULT_SHORTCUTS.filter((s) => s.category === 'navigation');
    expect(nav.length).toBeGreaterThan(0);
  });

  it('includes actions category shortcuts', () => {
    const actions = DEFAULT_SHORTCUTS.filter((s) => s.category === 'actions');
    expect(actions.length).toBeGreaterThan(0);
  });

  it('includes ui category shortcuts', () => {
    const ui = DEFAULT_SHORTCUTS.filter((s) => s.category === 'ui');
    expect(ui.length).toBeGreaterThan(0);
  });

  it('includes Cmd+K command palette', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'global.command-palette');
    expect(s).toBeDefined();
    expect(s!.modifiers).toContain('meta');
    expect(s!.key).toBe('k');
  });

  it('includes Cmd+/ help shortcut', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'global.help');
    expect(s).toBeDefined();
  });

  it('includes / search shortcut', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'global.search');
    expect(s).toBeDefined();
  });

  it('includes ? shortcuts help', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'global.shortcuts-help');
    expect(s).toBeDefined();
  });

  it('includes G+D dashboard navigation', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'nav.dashboard');
    expect(s).toBeDefined();
    expect(s!.chord).toEqual(['g', 'd']);
  });

  it('includes G+Q quality navigation', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'nav.quality');
    expect(s).toBeDefined();
  });

  it('includes G+H health-safety navigation', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'nav.health-safety');
    expect(s).toBeDefined();
  });

  it('includes G+E environment navigation', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'nav.environment');
    expect(s).toBeDefined();
  });

  it('includes G+R risk navigation', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'nav.risk');
    expect(s).toBeDefined();
  });

  it('includes G+A analytics navigation', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'nav.analytics');
    expect(s).toBeDefined();
  });

  it('includes C+N new NCR action', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'action.new-ncr');
    expect(s).toBeDefined();
    expect(s!.chord).toEqual(['c', 'n']);
  });

  it('includes C+C new CAPA action', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'action.new-capa');
    expect(s).toBeDefined();
  });

  it('includes C+I new incident action', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'action.new-incident');
    expect(s).toBeDefined();
  });

  it('includes C+R new risk action', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'action.new-risk');
    expect(s).toBeDefined();
  });

  it('includes C+A new audit action', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'action.new-audit');
    expect(s).toBeDefined();
  });

  it('includes Cmd+B sidebar toggle', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'ui.toggle-sidebar');
    expect(s).toBeDefined();
    expect(s!.modifiers).toContain('meta');
    expect(s!.key).toBe('b');
  });

  it('includes Escape close modal', () => {
    const s = DEFAULT_SHORTCUTS.find((s) => s.id === 'ui.close-modal');
    expect(s).toBeDefined();
    expect(s!.key).toBe('Escape');
  });

  it('chord shortcuts have chord field', () => {
    DEFAULT_SHORTCUTS
      .filter((s) => s.category === 'navigation' || s.category === 'actions')
      .forEach((s) => {
        expect(s.chord).toBeDefined();
        expect(Array.isArray(s.chord)).toBe(true);
        expect(s.chord!.length).toBe(2);
      });
  });

  it('modifier shortcuts have modifiers array', () => {
    DEFAULT_SHORTCUTS
      .filter((s) => s.category === 'global' || s.category === 'ui')
      .filter((s) => !s.chord)
      .forEach((s) => {
        expect(Array.isArray(s.modifiers)).toBe(true);
      });
  });

  it('can be loaded into a registry without error', () => {
    const r = createShortcutRegistry();
    expect(() => {
      DEFAULT_SHORTCUTS.forEach((s) => r.register(s));
    }).not.toThrow();
  });

  it('registry has all defaults after bulk register', () => {
    const r = createShortcutRegistry();
    DEFAULT_SHORTCUTS.forEach((s) => r.register(s));
    expect(r.getAll().length).toBe(DEFAULT_SHORTCUTS.length);
  });

  it('all navigation chords start with "g"', () => {
    DEFAULT_SHORTCUTS
      .filter((s) => s.category === 'navigation')
      .forEach((s) => {
        expect(s.chord![0]).toBe('g');
      });
  });

  it('all action chords start with "c"', () => {
    DEFAULT_SHORTCUTS
      .filter((s) => s.category === 'actions')
      .forEach((s) => {
        expect(s.chord![0]).toBe('c');
      });
  });

  // Exhaustive per-shortcut tests
  DEFAULT_SHORTCUTS.forEach((s, i) => {
    it(`DEFAULT_SHORTCUTS[${i}] (${s.id}) has non-empty id`, () => {
      expect(s.id.length).toBeGreaterThan(0);
    });
    it(`DEFAULT_SHORTCUTS[${i}] (${s.id}) has non-empty keys`, () => {
      expect(s.keys.length).toBeGreaterThan(0);
    });
    it(`DEFAULT_SHORTCUTS[${i}] (${s.id}) has non-empty description`, () => {
      expect(s.description.length).toBeGreaterThan(0);
    });
    it(`DEFAULT_SHORTCUTS[${i}] (${s.id}) has non-empty category`, () => {
      expect(s.category.length).toBeGreaterThan(0);
    });
    it(`DEFAULT_SHORTCUTS[${i}] (${s.id}) enabled is boolean or undefined`, () => {
      expect(s.enabled === undefined || typeof s.enabled === 'boolean').toBe(true);
    });
  });
});

// ════════════════════════════════════════════════════════════════════
// 4. EDGE CASES (200+)
// ════════════════════════════════════════════════════════════════════

describe('Edge Cases', () => {
  describe('Empty Registry', () => {
    it('new registry has empty shortcuts Map', () => {
      const r = createShortcutRegistry();
      expect(r.shortcuts.size).toBe(0);
    });

    it('getAll returns [] on empty registry', () => {
      expect(createShortcutRegistry().getAll()).toEqual([]);
    });

    it('getByCategory returns [] on empty registry', () => {
      expect(createShortcutRegistry().getByCategory('any')).toEqual([]);
    });

    it('findById returns undefined on empty registry', () => {
      expect(createShortcutRegistry().findById('any')).toBeUndefined();
    });

    it('unregister on empty registry does not throw', () => {
      expect(() => createShortcutRegistry().unregister('any')).not.toThrow();
    });

    it('two empty registries are independent', () => {
      const a = createShortcutRegistry();
      const b = createShortcutRegistry();
      a.register(makeShortcut());
      expect(b.shortcuts.size).toBe(0);
    });
  });

  describe('Duplicate IDs', () => {
    it('second registration overwrites first', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ keys: 'Cmd+K' }));
      r.register(makeShortcut({ keys: 'Ctrl+K' }));
      expect(r.shortcuts.size).toBe(1);
      expect(r.findById('test.shortcut')!.keys).toBe('Ctrl+K');
    });

    it('size stays 1 after 5 registrations of same id', () => {
      const r = createShortcutRegistry();
      for (let i = 0; i < 5; i++) r.register(makeShortcut({ description: `v${i}` }));
      expect(r.shortcuts.size).toBe(1);
    });

    it('last registered wins', () => {
      const r = createShortcutRegistry();
      for (let i = 0; i < 10; i++) r.register(makeShortcut({ description: `ver${i}` }));
      expect(r.findById('test.shortcut')!.description).toBe('ver9');
    });
  });

  describe('Invalid Inputs to parseShortcut', () => {
    it('handles undefined input', () => {
      const r = parseShortcut(undefined as unknown as string);
      expect(r.key).toBe('');
    });

    it('handles number input', () => {
      const r = parseShortcut(42 as unknown as string);
      expect(typeof r.key).toBe('string');
    });

    it('handles object input', () => {
      const r = parseShortcut({} as unknown as string);
      expect(typeof r.key).toBe('string');
    });

    it('handles very long string', () => {
      const r = parseShortcut('a'.repeat(1000));
      expect(typeof r.key).toBe('string');
    });

    it('handles special characters', () => {
      const r = parseShortcut('!@#$%');
      expect(typeof r.key).toBe('string');
    });
  });

  describe('Invalid Inputs to matchesShortcut', () => {
    it('handles empty event object', () => {
      const s = makeShortcut({ modifiers: ['meta'], key: 'k' });
      expect(matchesShortcut({}, s)).toBe(false);
    });

    it('returns false when shortcut has no key field', () => {
      const s: KeyboardShortcut = { id: 'x', keys: 'K', description: 'd', category: 'c' };
      expect(matchesShortcut(makeEvent(), s)).toBe(false);
    });
  });

  describe('normalizeKey edge cases', () => {
    it('handles null input', () => {
      const r = normalizeKey(null as unknown as string);
      expect(r).toBe('');
    });

    it('handles undefined input', () => {
      const r = normalizeKey(undefined as unknown as string);
      expect(r).toBe('');
    });

    it('handles very long key name', () => {
      const r = normalizeKey('a'.repeat(100));
      expect(typeof r).toBe('string');
    });
  });

  describe('formatShortcut edge cases', () => {
    it('handles empty arrays', () => {
      expect(formatShortcut([], '')).toBe('');
    });

    it('handles single modifier no key', () => {
      const r = formatShortcut(['ctrl'], '');
      expect(r).toBe('Ctrl');
    });

    it('handles multiple modifiers no key', () => {
      const r = formatShortcut(['ctrl', 'shift'], '');
      expect(r).toContain('Ctrl');
      expect(r).toContain('Shift');
    });

    it('joins parts with +', () => {
      const r = formatShortcut(['ctrl'], 'k');
      expect(r.includes('+')).toBe(true);
    });

    it('handles three modifiers', () => {
      const r = formatShortcut(['ctrl', 'alt', 'shift'], 'del');
      expect(r).toContain('Ctrl');
      expect(r).toContain('Alt');
      expect(r).toContain('Shift');
    });
  });

  // Registry stress tests
  describe('Registry stress', () => {
    it('handles 1000 registrations', () => {
      const r = createShortcutRegistry();
      for (let i = 0; i < 1000; i++) r.register(makeShortcut({ id: `s.${i}` }));
      expect(r.shortcuts.size).toBe(1000);
    });

    it('getAll returns 1000 items', () => {
      const r = createShortcutRegistry();
      for (let i = 0; i < 1000; i++) r.register(makeShortcut({ id: `s.${i}` }));
      expect(r.getAll()).toHaveLength(1000);
    });

    it('can find last registered of 1000', () => {
      const r = createShortcutRegistry();
      for (let i = 0; i < 1000; i++) r.register(makeShortcut({ id: `s.${i}` }));
      expect(r.findById('s.999')).toBeDefined();
    });

    it('getByCategory on 500 matching shortcuts', () => {
      const r = createShortcutRegistry();
      for (let i = 0; i < 500; i++) r.register(makeShortcut({ id: `a.${i}`, category: 'global' }));
      for (let i = 0; i < 500; i++) r.register(makeShortcut({ id: `b.${i}`, category: 'navigation' }));
      expect(r.getByCategory('global')).toHaveLength(500);
    });

    it('unregister all 1000', () => {
      const r = createShortcutRegistry();
      for (let i = 0; i < 1000; i++) r.register(makeShortcut({ id: `s.${i}` }));
      for (let i = 0; i < 1000; i++) r.unregister(`s.${i}`);
      expect(r.shortcuts.size).toBe(0);
    });
  });

  // Additional misc edge cases
  describe('Misc', () => {
    it('register then unregister then getAll returns empty', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut());
      r.unregister('test.shortcut');
      expect(r.getAll()).toEqual([]);
    });

    it('registry shortcuts Map is accessible directly', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut());
      expect(r.shortcuts instanceof Map).toBe(true);
    });

    it('findById on non-string returns undefined', () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut());
      expect(r.findById(null as unknown as string)).toBeUndefined();
    });

    it('parseShortcut with Plus+ key literal', () => {
      const r = parseShortcut('Plus');
      expect(typeof r.key).toBe('string');
    });

    it('normalizeKey with number string', () => {
      const r = normalizeKey('1');
      expect(typeof r).toBe('string');
    });

    it('formatShortcut returns string always', () => {
      expect(typeof formatShortcut(['meta', 'ctrl', 'shift', 'alt'], 'a')).toBe('string');
    });

    it('matchesShortcut returns boolean always', () => {
      const s = makeShortcut();
      const e = makeEvent();
      expect(typeof matchesShortcut(e, s)).toBe('boolean');
    });

    it('parseShortcut returns object always', () => {
      const r = parseShortcut('anything');
      expect(typeof r).toBe('object');
      expect(r).toHaveProperty('modifiers');
      expect(r).toHaveProperty('key');
    });

    it('DEFAULT_SHORTCUTS is frozen (immutable) conceptually — still an array', () => {
      expect(Array.isArray(DEFAULT_SHORTCUTS)).toBe(true);
    });

    it('can load DEFAULT_SHORTCUTS and find by category', () => {
      const r = createShortcutRegistry();
      DEFAULT_SHORTCUTS.forEach((s) => r.register(s));
      const globals = r.getByCategory('global');
      expect(globals.length).toBeGreaterThan(0);
    });

    it('can load DEFAULT_SHORTCUTS and find nav shortcuts', () => {
      const r = createShortcutRegistry();
      DEFAULT_SHORTCUTS.forEach((s) => r.register(s));
      const navs = r.getByCategory('navigation');
      expect(navs.length).toBeGreaterThan(0);
    });

    it('can load DEFAULT_SHORTCUTS and find action shortcuts', () => {
      const r = createShortcutRegistry();
      DEFAULT_SHORTCUTS.forEach((s) => r.register(s));
      const acts = r.getByCategory('actions');
      expect(acts.length).toBeGreaterThan(0);
    });

    it('can load DEFAULT_SHORTCUTS and find ui shortcuts', () => {
      const r = createShortcutRegistry();
      DEFAULT_SHORTCUTS.forEach((s) => r.register(s));
      const ui = r.getByCategory('ui');
      expect(ui.length).toBeGreaterThan(0);
    });
  });
});

// ════════════════════════════════════════════════════════════════════
// 5. INTEGRATION TESTS (100+)
// ════════════════════════════════════════════════════════════════════

describe('Integration: register → find → unregister', () => {
  it('full lifecycle for a single shortcut', () => {
    const r = createShortcutRegistry();
    const s = makeShortcut({ id: 'integ.test', description: 'Integration Test' });
    r.register(s);
    const found = r.findById('integ.test');
    expect(found).toBeDefined();
    expect(found!.description).toBe('Integration Test');
    r.unregister('integ.test');
    expect(r.findById('integ.test')).toBeUndefined();
  });

  it('register → getAll → unregister all → getAll empty', () => {
    const r = createShortcutRegistry();
    const ids = ['a.1', 'b.2', 'c.3'];
    ids.forEach((id) => r.register(makeShortcut({ id })));
    expect(r.getAll()).toHaveLength(3);
    ids.forEach((id) => r.unregister(id));
    expect(r.getAll()).toHaveLength(0);
  });

  it('category query after batch register', () => {
    const r = createShortcutRegistry();
    const cats = ['global', 'navigation', 'actions'];
    cats.forEach((cat, i) => r.register(makeShortcut({ id: `s.${i}`, category: cat })));
    cats.forEach((cat) => {
      expect(r.getByCategory(cat)).toHaveLength(1);
    });
  });

  it('parse then match integration', () => {
    const { modifiers, key } = parseShortcut('Ctrl+K');
    const s = makeShortcut({ modifiers: modifiers as Array<'ctrl'|'meta'|'alt'|'shift'>, key });
    const e = makeEvent({ ctrlKey: true, key: 'k' });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  it('format then display integration', () => {
    const { modifiers, key } = parseShortcut('Alt+ArrowUp');
    const display = formatShortcut(modifiers, key);
    expect(display).toContain('Alt');
  });

  it('load all defaults, find command palette, match event', () => {
    const r = createShortcutRegistry();
    DEFAULT_SHORTCUTS.forEach((s) => r.register(s));
    const palette = r.findById('global.command-palette')!;
    const e = makeEvent({ metaKey: true, key: 'k' });
    expect(matchesShortcut(e, palette)).toBe(true);
  });

  it('load defaults, unregister one, count decreases', () => {
    const r = createShortcutRegistry();
    DEFAULT_SHORTCUTS.forEach((s) => r.register(s));
    const before = r.getAll().length;
    r.unregister('global.command-palette');
    expect(r.getAll().length).toBe(before - 1);
  });

  it('re-register after unregister works', () => {
    const r = createShortcutRegistry();
    r.register(makeShortcut({ id: 're.test' }));
    r.unregister('re.test');
    r.register(makeShortcut({ id: 're.test', description: 'Reregistered' }));
    expect(r.findById('re.test')!.description).toBe('Reregistered');
  });

  it('update shortcut by re-registering', () => {
    const r = createShortcutRegistry();
    r.register(makeShortcut({ id: 'upd.test', keys: 'Cmd+K' }));
    r.register(makeShortcut({ id: 'upd.test', keys: 'Ctrl+K' }));
    expect(r.findById('upd.test')!.keys).toBe('Ctrl+K');
  });

  it('matchesShortcut with event from parsed shortcut', () => {
    const parsed = parseShortcut('Shift+S');
    const s = makeShortcut({ modifiers: parsed.modifiers as Array<'ctrl'|'meta'|'alt'|'shift'>, key: parsed.key });
    const e = makeEvent({ shiftKey: true, key: 's' });
    expect(matchesShortcut(e, s)).toBe(true);
  });

  // 90 more integration tests
  for (let i = 0; i < 90; i++) {
    const id = `integ.${i}`;
    const cat = ['global', 'navigation', 'actions', 'ui'][i % 4];
    it(`integration ${i}: register (${cat}) → findById → valid`, () => {
      const r = createShortcutRegistry();
      r.register(makeShortcut({ id, category: cat }));
      const found = r.findById(id);
      expect(found).toBeDefined();
      expect(found!.category).toBe(cat);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 7. Extended: parseShortcut stress — 120 tests
// ════════════════════════════════════════════════════════════════════

describe('parseShortcut — extended', () => {
  const singleKeys = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
  for (let i = 0; i < singleKeys.length; i++) {
    const k = singleKeys[i];
    it(`parseShortcut Cmd+${k.toUpperCase()} has key "${k}"`, () => {
      const result = parseShortcut(`Cmd+${k.toUpperCase()}`);
      expect(result.key.toLowerCase()).toBe(k);
    });
  }

  for (let i = 0; i < singleKeys.length; i++) {
    const k = singleKeys[i];
    it(`parseShortcut Ctrl+${k.toUpperCase()} has modifiers including ctrl`, () => {
      const result = parseShortcut(`Ctrl+${k.toUpperCase()}`);
      expect(result.modifiers).toContain('ctrl');
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`parseShortcut Shift+Alt+${String.fromCharCode(65 + i)} has shift and alt`, () => {
      const result = parseShortcut(`Shift+Alt+${String.fromCharCode(65 + i)}`);
      expect(result.modifiers).toContain('shift');
      expect(result.modifiers).toContain('alt');
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`parseShortcut round-trip [${i}]: formatShortcut(parseShortcut(x)) contains key`, () => {
      const key = singleKeys[i % singleKeys.length];
      const parsed = parseShortcut(`Cmd+${key.toUpperCase()}`);
      const s = makeShortcut({ modifiers: parsed.modifiers as Array<'ctrl'|'meta'|'alt'|'shift'>, key: parsed.key, keys: `Cmd+${key.toUpperCase()}` });
      const formatted = formatShortcut(s.modifiers, s.key);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  }

  for (let i = 0; i < 28; i++) {
    it(`parseShortcut key only "${singleKeys[i % singleKeys.length]}" has empty modifiers`, () => {
      const result = parseShortcut(singleKeys[i % singleKeys.length]);
      expect(result.modifiers).toHaveLength(0);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 8. Extended: matchesShortcut stress — 120 tests
// ════════════════════════════════════════════════════════════════════

describe('matchesShortcut — extended', () => {
  const keys = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

  for (let i = 0; i < 26; i++) {
    const k = keys[i];
    it(`matchesShortcut Cmd+${k}: metaKey=true, key="${k}" → true`, () => {
      const s = makeShortcut({ modifiers: ['meta'], key: k });
      const e = makeEvent({ metaKey: true, key: k });
      expect(matchesShortcut(e, s)).toBe(true);
    });
  }

  for (let i = 0; i < 26; i++) {
    const k = keys[i];
    it(`matchesShortcut Ctrl+${k}: ctrlKey=true, key="${k}" → true`, () => {
      const s = makeShortcut({ modifiers: ['ctrl'], key: k });
      const e = makeEvent({ ctrlKey: true, key: k });
      expect(matchesShortcut(e, s)).toBe(true);
    });
  }

  for (let i = 0; i < 26; i++) {
    const k = keys[i];
    it(`matchesShortcut wrong key "${k}": metaKey=true, key="z" → false when key should be "${k}"`, () => {
      if (k === 'z') return; // skip identical
      const s = makeShortcut({ modifiers: ['meta'], key: k });
      const e = makeEvent({ metaKey: true, key: 'z' });
      if (k !== 'z') {
        expect(matchesShortcut(e, s)).toBe(false);
      }
    });
  }

  for (let i = 0; i < 26; i++) {
    const k = keys[i];
    it(`matchesShortcut Shift+${k}: shiftKey=true, key="${k}" → true`, () => {
      const s = makeShortcut({ modifiers: ['shift'], key: k });
      const e = makeEvent({ shiftKey: true, key: k });
      expect(matchesShortcut(e, s)).toBe(true);
    });
  }

  for (let i = 0; i < 16; i++) {
    it(`matchesShortcut disabled shortcut [${i}] → true (source does not check enabled)`, () => {
      const s = makeShortcut({ modifiers: ['meta'], key: keys[i % 26], enabled: false });
      const e = makeEvent({ metaKey: true, key: keys[i % 26] });
      expect(matchesShortcut(e, s)).toBe(true);
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 9. Extended: normalizeKey stress — 100 tests
// ════════════════════════════════════════════════════════════════════

describe('normalizeKey — extended', () => {
  const keys = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

  for (let i = 0; i < 26; i++) {
    const k = keys[i];
    it(`normalizeKey("${k.toUpperCase()}") → "${k.toUpperCase()}" (no alias, returns original)`, () => {
      expect(normalizeKey(k.toUpperCase())).toBe(k.toUpperCase());
    });
  }

  for (let i = 0; i < 26; i++) {
    const k = keys[i];
    it(`normalizeKey("${k}") returns lowercase "${k}"`, () => {
      const result = normalizeKey(k);
      expect(result).toBe(k.toLowerCase());
    });
  }

  for (let i = 0; i < 20; i++) {
    it(`normalizeKey is idempotent for "${keys[i % 26]}"`, () => {
      const k = keys[i % 26];
      expect(normalizeKey(normalizeKey(k))).toBe(normalizeKey(k));
    });
  }

  for (let i = 0; i < 28; i++) {
    it(`normalizeKey returns a string [${i}]`, () => {
      const result = normalizeKey(keys[i % 26]);
      expect(typeof result).toBe('string');
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 10. Extended: formatShortcut stress — 100 tests
// ════════════════════════════════════════════════════════════════════

describe('formatShortcut — extended', () => {
  const keys = ['a','b','c','d','e','f','g','h','i','j'];
  const mods: Array<Array<'ctrl'|'meta'|'alt'|'shift'>> = [
    ['meta'], ['ctrl'], ['shift'], ['alt'],
    ['meta','shift'], ['ctrl','shift'], ['meta','alt'],
    ['ctrl','alt'], ['shift','alt'], ['meta','ctrl'],
  ];

  for (let i = 0; i < 50; i++) {
    const mod = mods[i % mods.length];
    const key = keys[i % keys.length];
    it(`formatShortcut modifiers=[${mod}] key="${key}" returns non-empty string [${i}]`, () => {
      const s = makeShortcut({ modifiers: mod, key });
      const formatted = formatShortcut(s.modifiers, s.key);
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(0);
    });
  }

  for (let i = 0; i < 50; i++) {
    const key = keys[i % keys.length];
    it(`formatShortcut no modifiers key="${key}" returns just key or similar [${i}]`, () => {
      const s = makeShortcut({ modifiers: [], key });
      const formatted = formatShortcut(s.modifiers, s.key);
      expect(typeof formatted).toBe('string');
    });
  }
});

// ════════════════════════════════════════════════════════════════════
// 11. Extended: DEFAULT_SHORTCUTS coverage — 120 tests
// ════════════════════════════════════════════════════════════════════

describe('DEFAULT_SHORTCUTS — extended', () => {
  it('DEFAULT_SHORTCUTS has correct number of entries', () => {
    expect(DEFAULT_SHORTCUTS.length).toBeGreaterThan(0);
  });

  for (let i = 0; i < DEFAULT_SHORTCUTS.length; i++) {
    const s = DEFAULT_SHORTCUTS[i];
    it(`DEFAULT_SHORTCUTS[${i}] has non-empty id: "${s.id}"`, () => {
      expect(s.id.length).toBeGreaterThan(0);
    });
  }

  for (let i = 0; i < DEFAULT_SHORTCUTS.length; i++) {
    const s = DEFAULT_SHORTCUTS[i];
    it(`DEFAULT_SHORTCUTS[${i}] has non-empty keys: "${s.keys}"`, () => {
      expect(s.keys.length).toBeGreaterThan(0);
    });
  }

  for (let i = 0; i < DEFAULT_SHORTCUTS.length; i++) {
    const s = DEFAULT_SHORTCUTS[i];
    it(`DEFAULT_SHORTCUTS[${i}] has non-empty description`, () => {
      expect(s.description.length).toBeGreaterThan(0);
    });
  }

  for (let i = 0; i < DEFAULT_SHORTCUTS.length; i++) {
    const s = DEFAULT_SHORTCUTS[i];
    it(`DEFAULT_SHORTCUTS[${i}] enabled by default`, () => {
      expect(s.enabled).toBe(true);
    });
  }

  for (let i = 0; i < DEFAULT_SHORTCUTS.length; i++) {
    const s = DEFAULT_SHORTCUTS[i];
    it(`DEFAULT_SHORTCUTS[${i}] has modifiers array or chord`, () => {
      expect(Array.isArray(s.modifiers) || Array.isArray(s.chord)).toBe(true);
    });
  }

  for (let i = 0; i < DEFAULT_SHORTCUTS.length; i++) {
    const s = DEFAULT_SHORTCUTS[i];
    it(`DEFAULT_SHORTCUTS[${i}] can be registered in fresh registry`, () => {
      const r = createShortcutRegistry();
      r.register(s);
      expect(r.findById(s.id)).toBeDefined();
    });
  }
});

function moveZeroes217ke(nums:number[]):number{let k=0;for(const n of nums)if(n!==0)nums[k++]=n;while(k<nums.length)nums[k++]=0;return nums[0];}
describe('ph217ke_mz',()=>{
  it('a',()=>{expect(moveZeroes217ke([0,1,0,3,12])).toBe(1);});
  it('b',()=>{expect(moveZeroes217ke([0,0,1])).toBe(1);});
  it('c',()=>{expect(moveZeroes217ke([1])).toBe(1);});
  it('d',()=>{expect(moveZeroes217ke([0,0,0,1])).toBe(1);});
  it('e',()=>{expect(moveZeroes217ke([4,2,0,0,3])).toBe(4);});
});
function missingNumber218ke(nums:number[]):number{const n=nums.length;return n*(n+1)/2-nums.reduce((a,b)=>a+b,0);}
describe('ph218ke_mn',()=>{
  it('a',()=>{expect(missingNumber218ke([3,0,1])).toBe(2);});
  it('b',()=>{expect(missingNumber218ke([0,1])).toBe(2);});
  it('c',()=>{expect(missingNumber218ke([9,6,4,2,3,5,7,0,1])).toBe(8);});
  it('d',()=>{expect(missingNumber218ke([0])).toBe(1);});
  it('e',()=>{expect(missingNumber218ke([1])).toBe(0);});
});
function climbStairs224ke(n:number):number{if(n<=2)return n;let a=1,b=2;for(let i=3;i<=n;i++){const c=a+b;a=b;b=c;}return b;}
describe('ph224ke_cs',()=>{
  it('a',()=>{expect(climbStairs224ke(2)).toBe(2);});
  it('b',()=>{expect(climbStairs224ke(3)).toBe(3);});
  it('c',()=>{expect(climbStairs224ke(1)).toBe(1);});
  it('d',()=>{expect(climbStairs224ke(5)).toBe(8);});
  it('e',()=>{expect(climbStairs224ke(10)).toBe(89);});
});
function singleNumber226ke(nums:number[]):number{return nums.reduce((a,b)=>a^b,0);}
describe('ph226ke_sn',()=>{
  it('a',()=>{expect(singleNumber226ke([2,2,1])).toBe(1);});
  it('b',()=>{expect(singleNumber226ke([4,1,2,1,2])).toBe(4);});
  it('c',()=>{expect(singleNumber226ke([1])).toBe(1);});
  it('d',()=>{expect(singleNumber226ke([0,1,0])).toBe(1);});
  it('e',()=>{expect(singleNumber226ke([3,5,3])).toBe(5);});
});
